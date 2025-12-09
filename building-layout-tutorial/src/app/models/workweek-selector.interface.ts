/**
 * Workweek Selector Types
 *
 * Interfaces for workweek filtering and multi-select functionality
 */

/**
 * Configuration for workweek selector component
 */
export interface WorkweekSelectorConfig {
  /** Array of available workweek strings in YYYYWW format */
  availableWeeks: string[];

  /** Array of currently selected workweek strings */
  selectedWeeks: string[];

  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Event emitted when workweek selection changes
 */
export interface WorkweekSelectionChangeEvent {
  /** Previously selected weeks */
  previousSelection: string[];

  /** Newly selected weeks */
  currentSelection: string[];

  /** Week that was added or removed (if applicable) */
  changedWeek?: string;

  /** Whether the change was an addition or removal */
  changeType?: 'add' | 'remove';
}

/**
 * Formatted week label for display
 */
export interface FormattedWeekLabel {
  /** Original workweek string (YYYYWW) */
  workweek: string;

  /** Human-readable label (e.g., "Week 25, 2025") */
  label: string;

  /** Week number (1-53) */
  weekNumber: number;

  /** Year */
  year: number;
}

/**
 * Opacity configuration for temporal visualization
 */
export interface WeekOpacityConfig {
  /** Workweek string */
  workweek: string;

  /** Calculated opacity value (0.0-1.0) */
  opacity: number;

  /** Age rank (0 = most recent, higher = older) */
  ageRank: number;
}
