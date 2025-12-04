// T009: ValidationResult interface and CoordinateValidator class
import { Region } from '../models/region.interface';
import { LayoutConfiguration } from '../models/layout-config.interface';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class CoordinateValidator {
  static validateRegion(region: Region): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!region.id || region.id.trim() === '') {
      errors.push('Region ID is required');
    }
    if (typeof region.x !== 'number') {
      errors.push('Region x coordinate must be a number');
    }
    if (typeof region.y !== 'number') {
      errors.push('Region y coordinate must be a number');
    }
    if (typeof region.width !== 'number') {
      errors.push('Region width must be a number');
    }
    if (typeof region.height !== 'number') {
      errors.push('Region height must be a number');
    }

    // Value constraints
    if (region.x < 0) {
      errors.push(`Region x coordinate must be non-negative (got: ${region.x})`);
    }
    if (region.y < 0) {
      errors.push(`Region y coordinate must be non-negative (got: ${region.y})`);
    }
    if (region.width <= 0) {
      errors.push(`Region width must be positive (got: ${region.width})`);
    }
    if (region.height <= 0) {
      errors.push(`Region height must be positive (got: ${region.height})`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateLayout(config: LayoutConfiguration): ValidationResult {
    const errors: string[] = [];

    // Regions array required
    if (!Array.isArray(config.regions)) {
      errors.push('Regions must be an array');
      return { valid: false, errors };
    }

    // Validate each region
    const regionIds = new Set<string>();
    config.regions.forEach((region, index) => {
      const result = this.validateRegion(region);
      if (!result.valid) {
        errors.push(`Region ${index} (${region.id}): ${result.errors.join(', ')}`);
      }

      // Check for duplicate IDs
      if (regionIds.has(region.id)) {
        errors.push(`Duplicate region ID: ${region.id}`);
      }
      regionIds.add(region.id);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
