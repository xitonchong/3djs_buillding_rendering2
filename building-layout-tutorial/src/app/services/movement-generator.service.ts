/**
 * Movement Generator Service
 *
 * Service for generating synthetic student movement data with configurable
 * parameters and reproducible randomness.
 */

import { Injectable } from '@angular/core';
import seedrandom from 'seedrandom';
import { MovementData, MovementGeneratorConfig } from '../models/movement-data.interface';
import { parseWorkweek, formatWorkweek, getWeekRange } from '../utils/workweek-parser';

@Injectable({
  providedIn: 'root'
})
export class MovementGeneratorService {
  /** Seeded random number generator for reproducible results */
  private rng: seedrandom.PRNG | null = null;

  constructor() { }

  /**
   * Generate multiple movement records based on configuration.
   *
   * @param config - Generator configuration
   * @returns Array of generated movement records
   * @throws Error if configuration is invalid
   */
  generateMovements(
    config: MovementGeneratorConfig,
    floor: number = 0,
    isIsometric: boolean = false
  ): MovementData[] {
    this.rng = seedrandom(config.seed?.toString() || 'default-seed');

    const movements: MovementData[] = [];
    const weeks = getWeekRange(config.startWeek, config.endWeek);

    // In isometric view, use all regions; otherwise, filter by floor
    const regions = isIsometric
      ? config.regions
      : config.regions.filter(region => region.floor === floor);

    if (regions.length < 2) {
      // Need at least two regions to generate meaningful movement
      return [];
    }
    
    weeks.forEach(workweek => {
      for (let i = 0; i < config.recordsPerWeek; i++) {
        const fromRegion = this.selectRandom(regions);
        let toRegion = this.selectRandom(regions);

        // Ensure no self-loops
        while (toRegion === fromRegion) {
          toRegion = this.selectRandom(regions);
        }

        // Generate movement count in range
        const moves = this.randomInt(config.minMoves, config.maxMoves + 1);

        // Create movement record
        movements.push({
          id: `mov-${workweek}-${i}`,
          fromRegion: fromRegion.id,
          toRegion: toRegion.id,
          moves,
          workweek,
          timestamp: parseWorkweek(workweek),
          metadata: {
            peakHour: this.randomInt(7, 18), // Business hours 7am-6pm
            dayOfWeek: this.randomInt(1, 6),  // Monday-Friday
            category: this.selectRandom([
              'class-change',
              'lunch-break',
              'arrival',
              'dismissal'
            ])
          }
        });
      }
    });

    return movements;
  }

  /**
   * Generate a single movement record between two regions.
   *
   * @param fromRegion - Source region ID
   * @param toRegion - Destination region ID
   * @param workweek - Time period in YYYYWW format
   * @param minMoves - Minimum students (default: 1)
   * @param maxMoves - Maximum students (default: 50)
   * @returns Single movement record
   * @throws Error if fromRegion === toRegion or workweek invalid
   */
  generateSingleMovement(
    fromRegion: string,
    toRegion: string,
    workweek: string,
    minMoves: number = 1,
    maxMoves: number = 50
  ): MovementData {
    if (fromRegion === toRegion) {
      throw new Error('fromRegion and toRegion cannot be the same (no self-loops)');
    }

    if (!this.rng) {
      this.rng = seedrandom('default-seed');
    }

    const moves = this.randomInt(minMoves, maxMoves + 1);

    return {
      id: `mov-${workweek}-single`,
      fromRegion,
      toRegion,
      moves,
      workweek,
      timestamp: parseWorkweek(workweek),
      metadata: {
        peakHour: this.randomInt(7, 18),
        dayOfWeek: this.randomInt(1, 6),
        category: 'generated'
      }
    };
  }

  /**
   * Parse workweek string (YYYYWW) to Date.
   * Delegates to workweek-parser utility.
   *
   * @param workweek - Workweek in YYYYWW format
   * @returns Date object
   */
  parseWorkweek(workweek: string): Date {
    return parseWorkweek(workweek);
  }

  /**
   * Format Date to workweek string (YYYYWW).
   * Delegates to workweek-parser utility.
   *
   * @param date - Date to convert
   * @returns Workweek string
   */
  formatWorkweek(date: Date): string {
    return formatWorkweek(date);
  }

  /**
   * Validate movement data against available regions.
   *
   * @param movement - Movement record to validate
   * @param availableRegions - Array of valid region IDs
   * @returns Validation result with errors (if any)
   */
  validateMovement(
    movement: MovementData,
    availableRegions: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!movement.id || movement.id.trim() === '') {
      errors.push('Movement ID is required');
    }
    if (!movement.fromRegion || movement.fromRegion.trim() === '') {
      errors.push('fromRegion is required');
    }
    if (!movement.toRegion || movement.toRegion.trim() === '') {
      errors.push('toRegion is required');
    }
    if (typeof movement.moves !== 'number' || movement.moves <= 0) {
      errors.push('moves must be a positive number');
    }
    if (!movement.workweek) {
      errors.push('workweek is required');
    }

    // Validate workweek format
    const workweekRegex = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;
    if (movement.workweek && !workweekRegex.test(movement.workweek)) {
      errors.push(`Invalid workweek format: ${movement.workweek}. Expected YYYYWW`);
    }

    // Validate regions exist
    if (movement.fromRegion && !availableRegions.includes(movement.fromRegion)) {
      errors.push(`fromRegion "${movement.fromRegion}" not found in available regions`);
    }
    if (movement.toRegion && !availableRegions.includes(movement.toRegion)) {
      errors.push(`toRegion "${movement.toRegion}" not found in available regions`);
    }

    // No self-loops
    if (movement.fromRegion === movement.toRegion) {
      errors.push('fromRegion and toRegion cannot be the same');
    }

    // Validate metadata (if present)
    if (movement.metadata) {
      if (movement.metadata.peakHour !== undefined) {
        if (movement.metadata.peakHour < 0 || movement.metadata.peakHour > 23) {
          errors.push('metadata.peakHour must be between 0 and 23');
        }
      }
      if (movement.metadata.dayOfWeek !== undefined) {
        if (movement.metadata.dayOfWeek < 1 || movement.metadata.dayOfWeek > 7) {
          errors.push('metadata.dayOfWeek must be between 1 and 7');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get week range between two workweek strings.
   * Delegates to workweek-parser utility.
   *
   * @param startWeek - Start workweek (YYYYWW)
   * @param endWeek - End workweek (YYYYWW)
   * @returns Array of workweek strings
   */
  getWeekRange(startWeek: string, endWeek: string): string[] {
    return getWeekRange(startWeek, endWeek);
  }

  // ========== Private Utility Methods ==========

  /**
   * Generate random integer in range [min, max).
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer
   */
  private randomInt(min: number, max: number): number {
    if (!this.rng) {
      throw new Error('RNG not initialized');
    }
    return Math.floor(this.rng() * (max - min)) + min;
  }

  /**
   * Select random element from array.
   *
   * @param array - Array to select from
   * @returns Random element
   */
  private selectRandom<T>(array: T[]): T {
    if (!this.rng) {
      throw new Error('RNG not initialized');
    }
    return array[Math.floor(this.rng() * array.length)];
  }
}
