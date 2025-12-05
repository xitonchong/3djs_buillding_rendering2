// T055-T056: App Component - Updated to load from JSON file
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildingLayoutComponent } from './components/building-layout/building-layout.component';
import { LayoutConfiguration } from './models/layout-config.interface';
import { ViewMode } from './models/viewport.interface';
import { Region } from './models/region.interface';
import { LayoutLoaderService } from './services/layout-loader.service';

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

  constructor(private layoutLoader: LayoutLoaderService) {}

  ngOnInit(): void {
    // Load configuration from JSON file on component initialization
    this.layoutLoader.loadFromFile().subscribe({
      next: (config) => {
        this.layoutConfig = config;
        this.isLoading = false;
        console.log('Building layout configuration loaded successfully:', config.name);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load building layout configuration';
        this.isLoading = false;
        console.error('Error loading configuration:', error);
      }
    });
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
  }
}
