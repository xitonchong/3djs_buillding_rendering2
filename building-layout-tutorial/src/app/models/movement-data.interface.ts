/**
 * Movement Data Interfaces
 *
 * Defines the data structures for tracking student movements between regions
 * over time, with support for synthetic data generation and filtering.
 */

import { Region } from './region.interface';

/**
* Represents a single movement record showing students moving from one
 * region to another during a specific time period.
 */
export interface MovementData {
  /** Unique identifier for this movement record */
  id: string;

  /** Source region ID (where movement started) */
  fromRegion: string;

  /** Destination region ID (where movement ended) */
  toRegion: string;

  /** Number of students in this movement */
  moves: number;

  /**
   * Time period in YYYYWW format (ISO 8601 week date)
   * Example: "202525" = year 2025, week 25
   */
  workweek: string;

  /** Optional: Parsed date for sorting/filtering */
  timestamp?: Date;

  /** Optional: Additional context about the movement */
  metadata?: {
    /** Hour of day when movement occurred (0-23) */
    peakHour?: number;

    /** Day of week (1=Monday, 7=Sunday) */
    dayOfWeek?: number;

    /** Category of movement (e.g., "class-change", "lunch-break") */
    category?: string;

    /** Average duration in minutes */
    duration?: number;

    /** Any additional custom properties */
    [key: string]: any;
  };
}

/**
 * Configuration for generating synthetic movement data.
 * Allows creation of reproducible test datasets with realistic patterns.
 */
export interface MovementGeneratorConfig {
  /** Array of valid region objects that can be used in movements */
  regions: Region[];

  /** Start of time range in YYYYWW format (e.g., "202501") */
  startWeek: string;

  /** End of time range in YYYYWW format (e.g., "202510") */
  endWeek: string;

  /** Number of movement records to generate per week */
  recordsPerWeek: number;

  /** Minimum number of students per movement */
  minMoves: number;

  /** Maximum number of students per movement */
  maxMoves: number;

  /** Optional: Seed for random number generator (enables reproducibility) */
  seed?: number | string;

  /** Optional: Apply time-of-day and destination weighting for realism */
  useRealisticPatterns?: boolean;

  /** Optional: Custom time-based movement patterns */
  dailyPattern?: TimeSlot[];
}

/**
 * Defines movement patterns for specific time periods.
 * Used for realistic data generation with time-varying behavior.
 */
export interface TimeSlot {
  /** Start hour (0-23) */
  startHour: number;

  /** End hour (0-23) */
  endHour: number;

  /** Average movements per minute (Poisson parameter) */
  lambda: number;

  /** Destination preferences with relative probability weights */
  destinations: Array<{
    /** Region ID */
    id: string;

    /** Relative probability weight (positive number) */
    weight: number;
  }>;
}
