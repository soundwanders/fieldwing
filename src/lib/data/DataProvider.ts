// src/lib/data/DataProvider.ts

import { writable, derived, get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

// Core Query State
export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: Date | null;
  stale: boolean;
  params: Record<string, any>;
}

export interface QueryOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  retryDelay?: number;
}

// Cache manager for cross-query invalidation
class CacheManager {
  private queries = new Map<string, any>();
  
  register(key: string, query: any) {
    this.queries.set(key, query);
  }
  
  invalidate(pattern: string | RegExp) {
    this.queries.forEach((query, key) => {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        query.invalidate();
      }
    });
  }
  
  clear() {
    this.queries.forEach(query => query.reset());
    this.queries.clear();
  }
  
  get size() {
    return this.queries.size;
  }
  
  get activeQueries() {
    return Array.from(this.queries.keys());
  }
}

export const cacheManager = new CacheManager();

// Define the return type for createQuery
export interface Query<TData, TParams> {
  subscribe: Readable<QueryState<TData>>['subscribe'];
  fetch: (params: TParams) => Promise<TData>;
  invalidate: () => void;
  reset: () => void;
  prefetch: (params: TParams) => Promise<void>;
  get: () => QueryState<TData>;
}

// Smart Query Factory
export function createQuery<TData, TParams = any>(
  queryKey: string,
  queryFn: (params: TParams) => Promise<TData>,
  options: QueryOptions = {}
): Query<TData, TParams> {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    retry = 2,
    retryDelay = 1000
  } = options;

  const initialState: QueryState<TData> = {
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
    stale: true,
    params: {}
  };

  const store = writable<QueryState<TData>>(initialState);
  let cacheTimer: ReturnType<typeof setTimeout> | null = null;

  const isStale = (state: QueryState<TData>): boolean => {
    if (!state.lastFetch) return true;
    return Date.now() - state.lastFetch.getTime() > staleTime;
  };

  const fetchWithRetry = async (params: TParams, attemptCount = 0): Promise<TData> => {
    try {
      console.log(`🔄 Fetching ${queryKey} with params:`, params);
      const data = await queryFn(params);
      
      store.update(state => ({
        ...state,
        data,
        loading: false,
        error: null,
        lastFetch: new Date(),
        stale: false,
        params: params as any
      }));

      // Set cache expiry
      if (cacheTimer) clearTimeout(cacheTimer);
      cacheTimer = setTimeout(() => {
        store.update(state => ({ ...state, data: null, stale: true }));
      }, cacheTime);

      console.log(`✅ ${queryKey} fetch successful`);
      return data;
    } catch (error) {
      if (attemptCount < retry) {
        console.log(`⚠️ ${queryKey} fetch failed, retrying... (${attemptCount + 1}/${retry})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attemptCount)));
        return fetchWithRetry(params, attemptCount + 1);
      }
      
      const err = error instanceof Error ? error : new Error('Query failed');
      console.error(`❌ ${queryKey} fetch failed:`, err);
      
      store.update(state => ({
        ...state,
        loading: false,
        error: err,
        stale: true
      }));
      
      throw err;
    }
  };

  const fetch = async (params: TParams): Promise<TData> => {
    const currentState = get(store);
    
    // Check cache
    if (!isStale(currentState) && 
        JSON.stringify(currentState.params) === JSON.stringify(params) &&
        currentState.data) {
      console.log(`💾 ${queryKey} returning cached data`);
      return currentState.data;
    }

    store.update(state => ({ ...state, loading: true, error: null }));
    return fetchWithRetry(params);
  };

  const prefetch = async (params: TParams): Promise<void> => {
    const currentState = get(store);
    if (!isStale(currentState) && 
        JSON.stringify(currentState.params) === JSON.stringify(params)) {
      return;
    }
    
    console.log(`🔮 Prefetching ${queryKey}`);
    await fetch(params);
  };

  const invalidate = () => {
    console.log(`🔄 Invalidating ${queryKey}`);
    store.update(state => ({ ...state, stale: true }));
  };

  const reset = () => {
    if (cacheTimer) clearTimeout(cacheTimer);
    store.set(initialState);
  };

  // Register with cache manager
  cacheManager.register(queryKey, { invalidate, reset });

  // Window focus refetch
  if (typeof window !== 'undefined' && refetchOnWindowFocus) {
    window.addEventListener('focus', () => {
      const state = get(store);
      if (state.data && isStale(state) && Object.keys(state.params).length > 0) {
        console.log(`👁️ Refetching ${queryKey} on window focus`);
        fetch(state.params as TParams);
      }
    });
  }

  return {
    subscribe: store.subscribe,
    fetch,
    invalidate,
    reset,
    prefetch,
    get: () => get(store)
  };
}

// Pagination wrapper
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedQuery<TItem, TParams> extends Query<PaginatedData<TItem>, TParams> {
  nextPage: () => Promise<PaginatedData<TItem> | undefined>;
  prevPage: () => Promise<PaginatedData<TItem> | undefined>;
  goToPage: (page: number) => Promise<PaginatedData<TItem>>;
}

export function createPaginatedQuery<TItem, TParams extends { page?: number; pageSize?: number }>(
  queryKey: string,
  queryFn: (params: TParams) => Promise<TItem[]>,
  defaultPageSize = 16
): PaginatedQuery<TItem, TParams> {
  const query = createQuery<PaginatedData<TItem>, TParams>(
    queryKey,
    async (params) => {
      const { page = 0, pageSize = defaultPageSize } = params;
      const allItems = await queryFn(params);
      
      // Paginate results
      const start = page * pageSize;
      const items = allItems.slice(start, start + pageSize);
      const total = allItems.length;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      };
    }
  );

  // Helper methods
  const nextPage = async () => {
    const state = query.get();
    if (state.data?.hasNext) {
      const params = { ...state.params, page: (state.data.page || 0) + 1 };
      return query.fetch(params as TParams);
    }
    return undefined;
  };

  const prevPage = async () => {
    const state = query.get();
    if (state.data?.hasPrev) {
      const params = { ...state.params, page: (state.data.page || 0) - 1 };
      return query.fetch(params as TParams);
    }
    return undefined;
  };

  const goToPage = async (page: number) => {
    const state = query.get();
    const params = { ...state.params, page };
    return query.fetch(params as TParams);
  };

  return {
    ...query,
    nextPage,
    prevPage,
    goToPage
  };
}