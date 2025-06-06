// src/lib/types/component.ts

import type { Game, PlayerStat, TeamStat, TeamMatchup } from './api';

// Common Component Props
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

// Theme-related Types
export type ThemeMode = 'light' | 'dark';

export interface ThemeProps {
  theme?: ThemeMode;
}

// Loading States
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
}

// Error Handling
export interface ErrorProps {
  error?: Error | string | null;
  onRetry?: () => void;
  onReport?: (error: Error) => void;
}

// Pagination
export interface PaginationProps {
  totalItems: number;
  pageSize?: number;
  currentPage?: number;
  maxVisiblePages?: number;
  onPageChange?: (page: number) => void;
}

// Form Components
export interface FormFieldProps {
  id: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[];
  value?: string | number;
  multiple?: boolean;
  onChange?: (value: string | number | (string | number)[]) => void;
}

// Team Selection
export interface TeamSelectionProps extends BaseComponentProps, ThemeProps {
  divisions: string[];
  selectedDivision: string;
  onDivisionChange?: (division: string) => void;
  onTeamsSelect?: (teams: string[]) => void;
}

// Search Components
export interface SearchProps extends FormFieldProps {
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  minLength?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  hasMore: boolean;
}

// Data Display Components
export interface GameResultProps {
  game: Game;
  showDetails?: boolean;
  compact?: boolean;
}

export interface PlayerStatsTableProps {
  stats: PlayerStat[];
  sortable?: boolean;
  onSort?: (field: keyof PlayerStat, direction: 'asc' | 'desc') => void;
}

export interface TeamStatsCardProps {
  stat: TeamStat;
  highlighted?: boolean;
  onClick?: (stat: TeamStat) => void;
}

export interface MatchupDisplayProps {
  matchup: TeamMatchup;
  showAllGames?: boolean;
  compact?: boolean;
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface NavigationProps extends BaseComponentProps, ThemeProps {
  items: NavItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

// Store Types
export interface AppStore {
  selectedTeams: string[];
  selectedWeek: number;
  selectedYear: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Page Data Types
export interface GamePageData {
  gameResults: Array<{
    team: string;
    data: Game[];
    error: string | null;
  }>;
  teams: string[];
  year: string;
  week: string;
  requestCount?: number;
}

export interface PlayerStatsPageData {
  playerData: {
    playerStatsData: PlayerStat[];
    total: number;
  };
  searchParams: {
    year: string;
    team?: string;
    conference?: string;
    startWeek?: string;
    endWeek?: string;
    category?: string;
    seasonType?: string;
  };
  requestCount?: number;
}

export interface TeamStatsPageData {
  teamData: {
    teamStatsData: TeamStat[];
    total: number;
  };
  searchParams: {
    year: string;
    team?: string;
    conference?: string;
    startWeek?: string;
    endWeek?: string;
  };
  requestCount?: number;
}

export interface MatchupPageData {
  matchupData: TeamMatchup;
  searchParams: {
    team1: string;
    team2: string;
    minYear?: string;
    maxYear?: string;
    division?: string;
  };
  requestCount?: number;
}

// Event Handler Types
export type ClickHandler<T = HTMLElement> = (event: MouseEvent & { currentTarget: T }) => void;
export type KeyboardHandler<T = HTMLElement> = (event: KeyboardEvent & { currentTarget: T }) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: Event & { currentTarget: T }) => void;
export type SubmitHandler<T = HTMLFormElement> = (event: SubmitEvent & { currentTarget: T }) => void;

// Utility Types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Animation and Transition Types
export interface TransitionProps {
  duration?: number;
  delay?: number;
  easing?: string;
}

export interface AnimationProps extends TransitionProps {
  loop?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}