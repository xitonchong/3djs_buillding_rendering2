/**
 * Workweek Filter Service
 *
 * Service for filtering movement data by selected workweeks and calculating
 * temporal visualization properties (opacity gradients).
 */

import { Injectable } from '@angular/core';
import { MovementData } from '../models/movement-data.interface';
import { WeekOpacityConfig } from '../models/workweek-selector.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkweekFilterService {
  /**
   * Minimum opacity for oldest selected weeks
   */
  private readonly MIN_OPACITY = 0.3;

  /**
   * Maximum opacity for most recent selected weeks
   */
  private readonly MAX_OPACITY = 1.0;

  constructor() { }

  /**
   * Filter movements by selected workweeks
   *
   * @param movements - All movement data
   * @param selectedWeeks - Array of workweek strings to include
   * @returns Filtered array of movements matching selected weeks
   */
  filterMovementsByWeeks(movements: MovementData[], selectedWeeks: string[]): MovementData[] {
    if (!movements || movements.length === 0) {
      return [];
    }

    if (!selectedWeeks || selectedWeeks.length === 0) {
      return [];
    }

    return movements.filter(movement => selectedWeeks.includes(movement.workweek));
  }

  /**
   * Extract unique workweeks from movements array
   *
   * @param movements - Array of movement data
   * @returns Sorted array of unique workweek strings (oldest to newest)
   */
  extractAvailableWeeks(movements: MovementData[]): string[] {
    if (!movements || movements.length === 0) {
      return [];
    }

    const uniqueWeeks = new Set<string>();
    movements.forEach(movement => {
      if (movement.workweek) {
        uniqueWeeks.add(movement.workweek);
      }
    });

    // Sort weeks chronologically (oldest to newest)
    return Array.from(uniqueWeeks).sort();
  }

  /**
   * Calculate opacity for a specific week based on its age relative to selected weeks
   *
   * Implements temporal gradient: older weeks = more transparent, recent weeks = more opaque
   *
   * @param workweek - The workweek to calculate opacity for
   * @param selectedWeeks - All currently selected weeks
   * @returns Opacity value between MIN_OPACITY and MAX_OPACITY
   */
  calculateOpacityForWeek(workweek: string, selectedWeeks: string[]): number {
    if (!selectedWeeks || selectedWeeks.length === 0) {
      return this.MAX_OPACITY;
    }

    if (!selectedWeeks.includes(workweek)) {
      return this.MAX_OPACITY; // Not selected, shouldn't be visible anyway
    }

    // Single week selected - use max opacity
    if (selectedWeeks.length === 1) {
      return this.MAX_OPACITY;
    }

    // Sort selected weeks to determine age ranking
    const sortedWeeks = [...selectedWeeks].sort();
    const index = sortedWeeks.indexOf(workweek);

    if (index === -1) {
      return this.MAX_OPACITY;
    }

    // Calculate opacity based on position in sorted array
    // index 0 (oldest) → MIN_OPACITY
    // index length-1 (newest) → MAX_OPACITY
    const opacityRange = this.MAX_OPACITY - this.MIN_OPACITY;
    const normalizedPosition = index / (sortedWeeks.length - 1);

    return this.MIN_OPACITY + (normalizedPosition * opacityRange);
  }

  /**
   * Calculate opacity configuration for all selected weeks
   *
   * @param selectedWeeks - Array of selected workweek strings
   * @returns Array of opacity configurations sorted by age
   */
  calculateOpacityConfigs(selectedWeeks: string[]): WeekOpacityConfig[] {
    if (!selectedWeeks || selectedWeeks.length === 0) {
      return [];
    }

    const sortedWeeks = [...selectedWeeks].sort();

    return sortedWeeks.map((week, index) => ({
      workweek: week,
      opacity: this.calculateOpacityForWeek(week, selectedWeeks),
      ageRank: index
    }));
  }

  /**
   * Get the most recent week from an array of workweek strings
   *
   * @param weeks - Array of workweek strings
   * @returns Most recent workweek string, or null if array is empty
   */
  getMostRecentWeek(weeks: string[]): string | null {
    if (!weeks || weeks.length === 0) {
      return null;
    }

    // Weeks are in YYYYWW format, so lexicographic sort works
    const sorted = [...weeks].sort();
    return sorted[sorted.length - 1];
  }

  /**
   * Validate that a workweek string is in the correct format
   *
   * @param workweek - Workweek string to validate
   * @returns True if valid, false otherwise
   */
  isValidWorkweek(workweek: string): boolean {
    if (!workweek) {
      return false;
    }

    // Format: YYYYWW where YYYY is year and WW is week 01-53
    const regex = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;
    return regex.test(workweek);
  }
}
