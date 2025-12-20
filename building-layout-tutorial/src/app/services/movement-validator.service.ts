import { Injectable } from '@angular/core';
import { MovementLimit } from '../models/movement-limit.interface';
import { MovementData } from '../models/movement-data.interface';

/**
 * Service for validating movement limits and checking violations
 *
 * Provides validation logic for movement limit configurations and comparison
 * logic to determine when actual movements exceed configured thresholds.
 */
@Injectable({
  providedIn: 'root'
})
export class MovementValidatorService {

  constructor() {}

  /**
   * Validate movement limit configurations
   *
   * Filters out invalid entries (missing fields, negative/zero limits).
   * Logs warnings for invalid data but continues processing valid entries.
   *
   * @param rawLimits Raw limit data from JSON file
   * @returns Validated array of MovementLimit objects
   */
  validateLimits(rawLimits: any[]): MovementLimit[] {
    const validated: MovementLimit[] = [];
    const seen = new Set<string>();

    for (const raw of rawLimits) {
      // Check required fields
      if (!raw.fromRegion || !raw.toRegion || typeof raw.limit !== 'number') {
        console.warn('Invalid limit entry (missing fields):', raw);
        continue;
      }

      // Check limit value
      if (raw.limit <= 0) {
        console.warn('Invalid limit value (must be > 0):', raw);
        continue;
      }

      // Check for duplicates
      const key = `${raw.fromRegion}:${raw.toRegion}`;
      if (seen.has(key)) {
        console.warn('Duplicate limit for region pair (using latest):', key);
      }
      seen.add(key);

      validated.push({
        fromRegion: raw.fromRegion.trim(),
        toRegion: raw.toRegion.trim(),
        limit: Math.floor(raw.limit)
      });
    }

    return validated;
  }

  /**
   * Check if a movement exceeds its configured limit
   *
   * @param movement Movement data to check
   * @param limits Array of configured limits
   * @returns true if movement exceeds limit, false otherwise
   */
  isLimitExceeded(movement: MovementData, limits: MovementLimit[]): boolean {
    const limit = limits.find(l =>
      l.fromRegion === movement.fromRegion &&
      l.toRegion === movement.toRegion
    );

    if (!limit) {
      return false; // No limit configured = not exceeded
    }

    return movement.moves > limit.limit;
  }

  /**
   * Get all movements that violate their configured limits
   *
   * @param movements Array of movement data
   * @param limits Array of configured limits
   * @returns Array of movements that exceed their limits
   */
  getViolatedLimits(movements: MovementData[], limits: MovementLimit[]): MovementData[] {
    return movements.filter(m => this.isLimitExceeded(m, limits));
  }
}
