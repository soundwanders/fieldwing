// src/lib/data/formUtilities.ts

import { writable, derived, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

export interface FormState<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	touched: Partial<Record<keyof T, boolean>>;
	isValid: boolean;
	isSubmitting: boolean;
	isDirty: boolean;
}

export interface FormConfig<T> {
	initialValues: T;
	validate?: (values: T) => Partial<Record<keyof T, string>>;
	onSubmit?: (values: T) => Promise<void> | void;
	validateOnChange?: boolean;
	validateOnBlur?: boolean;
}

export interface FormHelpers<T> {
	subscribe: Writable<FormState<T>>['subscribe'];
	setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
	setValues: (values: Partial<T>) => void;
	setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
	setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
	setFieldError: <K extends keyof T>(field: K, error: string) => void;
	setErrors: (errors: Partial<Record<keyof T, string>>) => void;
	handleSubmit: (
		callback?: (values: T) => Promise<void> | void
	) => (event?: Event) => Promise<void>;
	reset: (newInitialValues?: T) => void;
	getFieldProps: <K extends keyof T>(
		field: K
	) => {
		value: T[K];
		onChange: (e: Event) => void;
		onBlur: () => void;
		name: string;
		id: string;
	};
	values: Readable<T>;
	errors: Readable<Partial<Record<keyof T, string>>>;
	touched: Readable<Partial<Record<keyof T, boolean>>>;
	isValid: Readable<boolean>;
	isSubmitting: Readable<boolean>;
	isDirty: Readable<boolean>;
	getValue: <K extends keyof T>(field: K) => T[K];
	getError: <K extends keyof T>(field: K) => string | undefined;
	getTouched: <K extends keyof T>(field: K) => boolean | undefined;
	getValues: () => T;
	getState: () => FormState<T>;
}

// Create a smart form with validation and state management
export function createForm<T extends Record<string, any>>(config: FormConfig<T>): FormHelpers<T> {
	const {
		initialValues,
		validate,
		onSubmit,
		validateOnChange = true,
		validateOnBlur = true
	} = config;

	const state = writable<FormState<T>>({
		values: { ...initialValues },
		errors: {},
		touched: {},
		isValid: true,
		isSubmitting: false,
		isDirty: false
	});

	// Run validation
	const runValidation = (values: T): Partial<Record<keyof T, string>> => {
		if (!validate) return {};
		return validate(values);
	};

	// Check if form is dirty
	const checkDirty = (values: T): boolean => {
		return JSON.stringify(values) !== JSON.stringify(initialValues);
	};

	// Set field value with validation
	const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
		state.update((s) => {
			const newValues = { ...s.values, [field]: value };
			const errors = validateOnChange ? runValidation(newValues) : s.errors;

			return {
				...s,
				values: newValues,
				errors,
				isValid: Object.keys(errors).length === 0,
				isDirty: checkDirty(newValues)
			};
		});
	};

	// Set multiple field values
	const setValues = (values: Partial<T>) => {
		state.update((s) => {
			const newValues = { ...s.values, ...values };
			const errors = validateOnChange ? runValidation(newValues) : s.errors;

			return {
				...s,
				values: newValues,
				errors,
				isValid: Object.keys(errors).length === 0,
				isDirty: checkDirty(newValues)
			};
		});
	};

	// Set field touched state
	const setFieldTouched = <K extends keyof T>(field: K, touched = true) => {
		state.update((s) => {
			const newTouched = { ...s.touched, [field]: touched };
			const errors = validateOnBlur && touched ? runValidation(s.values) : s.errors;

			return {
				...s,
				touched: newTouched,
				errors,
				isValid: Object.keys(errors).length === 0
			};
		});
	};

	// Set multiple fields as touched
	const setTouched = (touched: Partial<Record<keyof T, boolean>>) => {
		state.update((s) => ({
			...s,
			touched: { ...s.touched, ...touched }
		}));
	};

	// Set field error
	const setFieldError = <K extends keyof T>(field: K, error: string) => {
		state.update((s) => ({
			...s,
			errors: { ...s.errors, [field]: error },
			isValid: false
		}));
	};

	// Set multiple errors
	const setErrors = (errors: Partial<Record<keyof T, string>>) => {
		state.update((s) => ({
			...s,
			errors,
			isValid: Object.keys(errors).length === 0
		}));
	};

	// Handle form submission
	const handleSubmit = (callback?: (values: T) => Promise<void> | void) => {
		return async (event?: Event) => {
			if (event) event.preventDefault();

			const currentState = get(state);
			const errors = runValidation(currentState.values);

			// Touch all fields
			const allTouched = Object.keys(currentState.values).reduce(
				(acc, key) => ({ ...acc, [key]: true }),
				{} as Record<keyof T, boolean>
			);

			state.update((s) => ({
				...s,
				errors,
				touched: allTouched,
				isValid: Object.keys(errors).length === 0
			}));

			if (Object.keys(errors).length > 0) {
				console.log('Form validation failed:', errors);
				return;
			}

			state.update((s) => ({ ...s, isSubmitting: true }));

			try {
				const submitFn = callback || onSubmit;
				if (submitFn) {
					await submitFn(currentState.values);
				}
			} catch (error) {
				console.error('Form submission error:', error);
				if (error instanceof Error) {
					state.update((s) => ({
						...s,
						errors: { submit: error.message } as any
					}));
				}
			} finally {
				state.update((s) => ({ ...s, isSubmitting: false }));
			}
		};
	};

	// Reset form to initial values
	const reset = (newInitialValues?: T) => {
		const values = newInitialValues || initialValues;
		state.set({
			values: { ...values },
			errors: {},
			touched: {},
			isValid: true,
			isSubmitting: false,
			isDirty: false
		});
	};

	// Create field props helper
	const getFieldProps = <K extends keyof T>(field: K) => ({
		value: get(state).values[field],
		onChange: (e: Event) => {
			const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
			const value =
				target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
			setFieldValue(field, value as T[K]);
		},
		onBlur: () => setFieldTouched(field),
		name: field as string,
		id: field as string
	});

	// Derived stores for convenient access
	const values = derived(state, ($s) => $s.values);
	const errors = derived(state, ($s) => $s.errors);
	const touched = derived(state, ($s) => $s.touched);
	const isValid = derived(state, ($s) => $s.isValid);
	const isSubmitting = derived(state, ($s) => $s.isSubmitting);
	const isDirty = derived(state, ($s) => $s.isDirty);

	return {
		subscribe: state.subscribe,
		setFieldValue,
		setValues,
		setFieldTouched,
		setTouched,
		setFieldError,
		setErrors,
		handleSubmit,
		reset,
		getFieldProps,
		// Derived stores
		values,
		errors,
		touched,
		isValid,
		isSubmitting,
		isDirty,
		// Direct access methods
		getValue: <K extends keyof T>(field: K) => get(state).values[field],
		getError: <K extends keyof T>(field: K) => get(state).errors[field],
		getTouched: <K extends keyof T>(field: K) => get(state).touched[field],
		getValues: () => get(state).values,
		getState: () => get(state)
	};
}

// Common validation helpers
export const validators = {
	required: (value: any, message = 'This field is required') => {
		if (value === null || value === undefined || value === '') {
			return message;
		}
		return undefined;
	},

	min: (min: number, message?: string) => (value: number) => {
		if (value < min) {
			return message || `Must be at least ${min}`;
		}
		return undefined;
	},

	max: (max: number, message?: string) => (value: number) => {
		if (value > max) {
			return message || `Must be at most ${max}`;
		}
		return undefined;
	},

	between: (min: number, max: number, message?: string) => (value: number) => {
		if (value < min || value > max) {
			return message || `Must be between ${min} and ${max}`;
		}
		return undefined;
	},

	pattern:
		(pattern: RegExp, message = 'Invalid format') =>
		(value: string) => {
			if (!pattern.test(value)) {
				return message;
			}
			return undefined;
		},

	email: (value: string) => {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(value)) {
			return 'Invalid email address';
		}
		return undefined;
	},

	compose:
		(...validators: Array<(value: any) => string | undefined>) =>
		(value: any) => {
			for (const validator of validators) {
				const error = validator(value);
				if (error) return error;
			}
			return undefined;
		}
};

// URL sync helper for forms
export function syncFormWithURL<T extends Record<string, any>>(
	form: FormHelpers<T>,
	paramKeys: (keyof T)[]
): () => void {
	if (typeof window === 'undefined') return () => {};

	// Initialize form from URL
	const params = new URLSearchParams(window.location.search);
	const urlValues: Partial<T> = {};

	paramKeys.forEach((key) => {
		const value = params.get(key as string);
		if (value !== null) {
			urlValues[key] = value as T[typeof key];
		}
	});

	if (Object.keys(urlValues).length > 0) {
		form.setValues(urlValues);
	}

	// Update URL when form changes
	const unsubscribe = form.values.subscribe((values) => {
		const url = new URL(window.location.href);

		paramKeys.forEach((key) => {
			const value = values[key];
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key as string, String(value));
			} else {
				url.searchParams.delete(key as string);
			}
		});

		window.history.replaceState({}, '', url.toString());
	});

	return unsubscribe;
}
