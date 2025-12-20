// T055-T056: App Component - Updated to load from JSON file
// T175-T176: Added movement tracking integration
// T017-T023: Added workweek filtering and state management
// T016: Added movement limit configuration loading
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildingLayoutComponent } from './components/building-layout/building-layout.component';
import { WorkweekSelectorComponent } from './components/workweek-selector/workweek-selector.component';
import { LayoutConfiguration } from './models/layout-config.interface';
import { ViewMode } from './models/viewport.interface';
import { Region } from './models/region.interface';
import { LayoutLoaderService } from './services/layout-loader.service';
import { MovementGeneratorService } from './services/movement-generator.service';
import { WorkweekFilterService } from './services/workweek-filter.service';
import { MovementLimitLoaderService } from './services/movement-limit-loader.service';
import { MovementValidatorService } from './services/movement-validator.service';
import { MovementData, MovementGeneratorConfig } from './models/movement-data.interface';
import { MovementLimit } from './models/movement-limit.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BuildingLayoutComponent, WorkweekSelectorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Building Layout Visualization';

  // Configuration loaded from JSON file
  layoutConfig: LayoutConfiguration | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // T081: Track current view mode (2D or isometric)
  currentViewMode: ViewMode = '2d';

  // T131: Track current floor (defaults to 0 = ground floor)
  currentFloor: number = 0;

  // T175: Movement tracking data
  movements: MovementData[] = [];

  // T016: Movement limit configuration
  limits: MovementLimit[] = [];

  // T017-T018: Workweek filtering state
  selectedWeeks: string[] = [];
  availableWeeks: string[] = [];

  constructor(
    private layoutLoader: LayoutLoaderService,
    private movementGen: MovementGeneratorService,
    private workweekFilter: WorkweekFilterService,
    private limitLoader: MovementLimitLoaderService,
    private validator: MovementValidatorService
  ) {}

  ngOnInit(): void {
    // T016: Load movement limit configurations
    this.limitLoader.loadLimits().subscribe({
      next: (limits) => {
        this.limits = this.validator.validateLimits(limits);
        console.log(`✅ Loaded ${this.limits.length} movement limits`);
      },
      error: (error) => {
        console.error('Error loading movement limits:', error);
        this.limits = []; // Continue with no limits on error
      }
    });

    // Load configuration from JSON file on component initialization
    this.layoutLoader.loadFromFile().subscribe({
      next: (config) => {
        this.layoutConfig = config;
        this.isLoading = false;
        console.log('Building layout configuration loaded successfully:', config.name);

        // T175-T176: Generate sample movement data
        this.generateMovementData(config);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load building layout configuration';
        this.isLoading = false;
        console.error('Error loading configuration:', error);
      }
    });
  }

  // T175-T176 & T020-T022: Generate movement data and extract available weeks
  private generateMovementData(config: LayoutConfiguration): void {
    const movementConfig: MovementGeneratorConfig = {
      regions: config.regions,
      startWeek: '202501',
      endWeek: '202532',
      recordsPerWeek: 3,
      minMoves: 5,
      maxMoves: 50,
      seed: 'demo-seed-2025'
    };

    this.movements = this.movementGen.generateMovements(movementConfig, this.currentFloor, this.currentViewMode === 'isometric');

    // T020: Extract available weeks from generated movements
    this.availableWeeks = this.workweekFilter.extractAvailableWeeks(this.movements);

    // T022: Initialize selectedWeeks with most recent week
    if (this.availableWeeks.length > 0) {
      const mostRecentWeek = this.workweekFilter.getMostRecentWeek(this.availableWeeks);
      if (mostRecentWeek) {
        this.selectedWeeks = [mostRecentWeek];
      }
    }

    console.log(`✅ Generated ${this.movements.length} movement records`);
    console.log(`📅 Available weeks: ${this.availableWeeks.join(', ')}`);
    console.log(`✅ Selected week: ${this.selectedWeeks.join(', ')}`);
  }

  // T021: Get filtered movements based on selected weeks
  getFilteredMovements(): MovementData[] {
    if (this.selectedWeeks.length === 0) {
      return [];
    }
    return this.workweekFilter.filterMovementsByWeeks(this.movements, this.selectedWeeks);
  }

  // T019: Handle workweek selection change from selector component
  onWeekSelectionChange(newSelection: string[]): void {
    this.selectedWeeks = newSelection;
    console.log(`📅 Week selection changed: ${newSelection.join(', ')}`);
  }

  onRegionHover(region: Region | null): void {
    if (region) {
      console.log('Hovered:', region.label);
    }
  }

  onRegionClick(region: Region): void {
    console.log('Clicked:', region.label, region);
    alert(`Clicked: ${region.label}\nPosition: (${region.x}, ${region.y})\nSize: ${region.width} x ${region.height}`);
  }

  onRenderComplete(): void {
    console.log('Visualization rendered successfully!');
  }

  // T081: Handle view mode changes
  onViewModeChange(newMode: ViewMode): void {
    this.currentViewMode = newMode;
    console.log('View mode changed to:', newMode);
    // if (this.layoutConfig) {
    //   this.generateMovementData(this.layoutConfig);
    // }
  }

  // T131: Handle floor selection changes
  onFloorChange(floor: number): void {
    this.currentFloor = floor;
    console.log('Floor changed to:', floor);

    // T177: Regenerate movement data when floor changes
    // if (this.layoutConfig) {
    //   this.generateMovementData(this.layoutConfig);
    // }
  }
}
