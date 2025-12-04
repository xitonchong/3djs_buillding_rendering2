// T015-T019: LayoutConfigService with reactive state management
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Region } from '../models/region.interface';
import { CoordinateValidator, ValidationResult } from '../utils/coordinate-validator';

@Injectable({
  providedIn: 'root'
})
export class LayoutConfigService {
  private configSubject = new BehaviorSubject<LayoutConfiguration>({ regions: [] });
  public config$: Observable<LayoutConfiguration> = this.configSubject.asObservable();

  // Get current configuration snapshot
  get currentConfig(): LayoutConfiguration {
    return this.configSubject.value;
  }

  // T016: Update entire configuration
  updateConfig(config: LayoutConfiguration): void {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      console.error('Invalid configuration:', validation.errors);
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
    this.configSubject.next(config);
  }

  // T017: Update single region
  updateRegion(regionId: string, updates: Partial<Region>): void {
    const currentConfig = this.currentConfig;
    const regionIndex = currentConfig.regions.findIndex(r => r.id === regionId);

    if (regionIndex === -1) {
      throw new Error(`Region with ID ${regionId} not found`);
    }

    const updatedRegions = [...currentConfig.regions];
    updatedRegions[regionIndex] = { ...updatedRegions[regionIndex], ...updates };

    this.updateConfig({
      ...currentConfig,
      regions: updatedRegions
    });
  }

  // T018: Add new region
  addRegion(region: Region): void {
    const validation = CoordinateValidator.validateRegion(region);
    if (!validation.valid) {
      throw new Error(`Invalid region: ${validation.errors.join(', ')}`);
    }

    const currentConfig = this.currentConfig;
    if (currentConfig.regions.some(r => r.id === region.id)) {
      throw new Error(`Region with ID ${region.id} already exists`);
    }

    this.configSubject.next({
      ...currentConfig,
      regions: [...currentConfig.regions, region]
    });
  }

  // T018: Remove region
  removeRegion(regionId: string): void {
    const currentConfig = this.currentConfig;
    const filteredRegions = currentConfig.regions.filter(r => r.id !== regionId);

    if (filteredRegions.length === currentConfig.regions.length) {
      throw new Error(`Region with ID ${regionId} not found`);
    }

    this.configSubject.next({
      ...currentConfig,
      regions: filteredRegions
    });
  }

  // Validate configuration
  validateConfig(config: LayoutConfiguration): ValidationResult {
    return CoordinateValidator.validateLayout(config);
  }

  // T019: Load configuration from JSON
  loadFromJSON(json: string): ValidationResult {
    try {
      const config = JSON.parse(json) as LayoutConfiguration;
      const validation = this.validateConfig(config);

      if (validation.valid) {
        this.updateConfig(config);
      }

      return validation;
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // T019: Export configuration as JSON
  exportToJSON(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }
}
