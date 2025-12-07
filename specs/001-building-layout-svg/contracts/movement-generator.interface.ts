/**
 * Movement Generator Service Contract
 *
 * Purpose: Generate synthetic student movement data with configurable parameters
 * Feature: Building Layout Student Movement Tracking
 * Date: 2025-12-07
 */

import { MovementData, MovementGeneratorConfig } from '../models/movement-data.interface';

/**
 * Service interface for generating synthetic movement data
 */
export interface IMovementGenerator {
  /**
   * Generate multiple movement records based on configuration
   *
   * @param config - Generator configuration (regions, time range, parameters)
   * @returns Array of generated movement records
   * @throws Error if configuration is invalid
   *
   * @example
   * ```typescript
   * const config: MovementGeneratorConfig = {
   *   regions: ['room-101', 'room-102', 'cafeteria'],
   *   startWeek: '202501',
   *   endWeek: '202510',
   *   recordsPerWeek: 50,
   *   minMoves: 5,
   *   maxMoves: 30,
   *   seed: 'building-A-2025'
   * };
   *
   * const movements = generator.generateMovements(config);
   * // Returns 500 records (50 per week × 10 weeks)
   * ```
   */
  generateMovements(config: MovementGeneratorConfig): MovementData[];

  /**
   * Generate a single movement record between two regions
   *
   * @param fromRegion - Source region ID
   * @param toRegion - Destination region ID
   * @param workweek - Time period in YYYYWW format (e.g., "202525")
   * @param minMoves - Minimum number of students (default: 1)
   * @param maxMoves - Maximum number of students (default: 50)
   * @returns Single movement record
   * @throws Error if fromRegion === toRegion or workweek format invalid
   *
   * @example
   * ```typescript
   * const movement = generator.generateSingleMovement(
   *   'classroom-101',
   *   'cafeteria',
   *   '202525',
   *   10,
   *   30
   * );
   * // Returns: { id, fromRegion, toRegion, moves: 10-30, workweek: "202525" }
   * ```
   */
  generateSingleMovement(
    fromRegion: string,
    toRegion: string,
    workweek: string,
    minMoves?: number,
    maxMoves?: number
  ): MovementData;

  /**
   * Parse workweek string (YYYYWW) to Date object
   *
   * @param workweek - Workweek in YYYYWW format (e.g., "202525")
   * @returns Date object representing the start of that ISO week
   * @throws Error if workweek format is invalid
   *
   * @example
   * ```typescript
   * const date = generator.parseWorkweek('202525');
   * // Returns: Date object for Monday of week 25, 2025
   * ```
   */
  parseWorkweek(workweek: string): Date;

  /**
   * Format Date object to workweek string (YYYYWW)
   *
   * @param date - Date to convert
   * @returns Workweek string in YYYYWW format
   *
   * @example
   * ```typescript
   * const workweek = generator.formatWorkweek(new Date('2025-06-16'));
   * // Returns: "202525" (week 25 of 2025)
   * ```
   */
  formatWorkweek(date: Date): string;

  /**
   * Validate movement data against available regions
   *
   * @param movement - Movement record to validate
   * @param availableRegions - Array of valid region IDs
   * @returns Validation result with errors (if any)
   *
   * @example
   * ```typescript
   * const result = generator.validateMovement(movement, ['room-101', 'cafeteria']);
   * if (!result.valid) {
   *   console.error('Validation errors:', result.errors);
   * }
   * ```
   */
  validateMovement(
    movement: MovementData,
    availableRegions: string[]
  ): { valid: boolean; errors: string[] };

  /**
   * Get week range between two workweek strings
   *
   * @param startWeek - Start workweek (YYYYWW)
   * @param endWeek - End workweek (YYYYWW)
   * @returns Array of workweek strings in range (inclusive)
   *
   * @example
   * ```typescript
   * const weeks = generator.getWeekRange('202501', '202503');
   * // Returns: ['202501', '202502', '202503']
   * ```
   */
  getWeekRange(startWeek: string, endWeek: string): string[];
}

/**
 * Service interface for visualizing movement flows on the building layout
 */
export interface IMovementVisualizer {
  /**
   * Render movement flows as Sankey diagram overlay on SVG
   *
   * @param movements - Array of movement records to visualize
   * @param svgElement - D3 selection of SVG container
   * @param options - Visualization options (colors, animation, etc.)
   *
   * @example
   * ```typescript
   * visualizer.renderFlows(movements, svg, {
   *   linkColor: '#999',
   *   linkOpacity: 0.5,
   *   animationDuration: 750
   * });
   * ```
   */
  renderFlows(
    movements: MovementData[],
    svgElement: any, // d3.Selection
    options?: MovementVisualizationOptions
  ): void;

  /**
   * Update existing flow visualization with new data (animated transition)
   *
   * @param movements - New movement records
   * @param duration - Animation duration in milliseconds (default: 750)
   */
  updateFlows(movements: MovementData[], duration?: number): void;

  /**
   * Clear all movement flows from visualization
   */
  clearFlows(): void;

  /**
   * Filter displayed flows by criteria (time period, minimum volume, etc.)
   *
   * @param filter - Filter criteria
   *
   * @example
   * ```typescript
   * visualizer.filterFlows({
   *   workweek: '202525',
   *   minMoves: 10,  // Only show movements with 10+ students
   *   category: 'lunch-break'
   * });
   * ```
   */
  filterFlows(filter: MovementFilter): void;

  /**
   * Aggregate movements by time period and return summary statistics
   *
   * @param movements - Movement records to aggregate
   * @param groupBy - Aggregation period ('week' | 'day' | 'hour')
   * @returns Summary statistics per period
   */
  aggregateMovements(
    movements: MovementData[],
    groupBy: 'week' | 'day' | 'hour'
  ): MovementSummary[];
}

/**
 * Options for movement flow visualization
 */
export interface MovementVisualizationOptions {
  linkColor?: string;              // Color for flow links (default: '#999')
  linkOpacity?: number;            // Opacity 0-1 (default: 0.5)
  linkStrokeWidth?: number;        // Min stroke width in pixels (default: 1)
  animationDuration?: number;      // Transition duration ms (default: 750)
  showLabels?: boolean;            // Show flow volume labels (default: false)
  highlightOnHover?: boolean;      // Highlight on mouse over (default: true)
  edgeBundling?: boolean;          // Apply edge bundling for dense networks (default: false)
  edgeBundlingThreshold?: number;  // Min connections to trigger bundling (default: 50)
}

/**
 * Filter criteria for movement visualization
 */
export interface MovementFilter {
  workweek?: string | string[];    // Filter by specific week(s)
  minMoves?: number;                // Minimum movement volume
  maxMoves?: number;                // Maximum movement volume
  category?: string;                // Filter by metadata category
  fromRegion?: string | string[];   // Filter by source region(s)
  toRegion?: string | string[];     // Filter by destination region(s)
  peakHour?: number;                // Filter by hour of day
}

/**
 * Movement summary statistics
 */
export interface MovementSummary {
  period: string;                   // Time period identifier (e.g., "202525")
  totalMovements: number;           // Number of movement records
  totalStudents: number;            // Sum of all moves
  averageMovesPerRecord: number;    // Mean students per movement
  topRoutes: Array<{                // Most popular routes
    fromRegion: string;
    toRegion: string;
    count: number;
  }>;
  peakHour?: number;                // Hour with most activity
  categories?: Record<string, number>; // Breakdown by category
}
