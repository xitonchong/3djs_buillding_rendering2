// T055-T056: App Component - Updated to load from JSON file
// T175-T176: Added movement tracking integration
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildingLayoutComponent } from './components/building-layout/building-layout.component';
import { LayoutConfiguration } from './models/layout-config.interface';
import { ViewMode } from './models/viewport.interface';
import { Region } from './models/region.interface';
import { LayoutLoaderService } from './services/layout-loader.service';
import { MovementGeneratorService } from './services/movement-generator.service';
import { MovementData, MovementGeneratorConfig } from './models/movement-data.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BuildingLayoutComponent],
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

  constructor(
    private layoutLoader: LayoutLoaderService,
    private movementGen: MovementGeneratorService
  ) {}

  ngOnInit(): void {
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

  // T175-T176: Generate movement data for demo
  private generateMovementData(config: LayoutConfiguration): void {
    const movementConfig: MovementGeneratorConfig = {
      regions: config.regions,
      startWeek: '202501',
      endWeek: '202505',
      recordsPerWeek: 1,
      minMoves: 5,
      maxMoves: 30,
      seed: 'demo-seed-2025'
    };

    this.movements = this.movementGen.generateMovements(movementConfig, this.currentFloor, this.currentViewMode === 'isometric');
    console.log(`✅ Generated ${this.movements.length} movement records`);
    console.log('📊 Sample movements:', this.movements);
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
    if (this.layoutConfig) {
      this.generateMovementData(this.layoutConfig);
    }
  }

  // T131: Handle floor selection changes
  onFloorChange(floor: number): void {
    this.currentFloor = floor;
    console.log('Floor changed to:', floor);

    // T177: Regenerate movement data when floor changes
    if (this.layoutConfig) {
      this.generateMovementData(this.layoutConfig);
    }
  }
}
