// T031-T034 & T127-T130: BuildingLayoutComponent with multi-floor support
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutConfiguration } from '../../models/layout-config.interface';
import { Viewport, ViewMode } from '../../models/viewport.interface';
import { Region } from '../../models/region.interface';
import { FloorInfo } from '../../models/floor.interface';  // T127: Floor info for selector
import { SvgRendererService } from '../../services/svg-renderer.service';
import { FloorUtils } from '../../utils/floor-utils';  // T130: Floor utilities
import { FloorSelectorComponent } from './floor-selector/floor-selector.component';  // T128: Floor selector
import { MovementData } from '../../models/movement-data.interface';

@Component({
  selector: 'app-building-layout',
  standalone: true,
  imports: [CommonModule, FloorSelectorComponent],  // T128: Import floor selector
  templateUrl: './building-layout.component.html',
  styleUrls: ['./building-layout.component.scss']
})
export class BuildingLayoutComponent implements AfterViewInit, OnChanges, OnDestroy {
  // T032: Component inputs
  @Input() config: LayoutConfiguration = { regions: [] };
  @Input() movements: MovementData[] = [];
  @Input() width: number = 800;
  @Input() height: number = 600;
  @Input() showControls: boolean = true;
  @Input() enableInteraction: boolean = true;
  @Input() viewMode: ViewMode = '2d';  // T075: View mode control
  @Input() selectedFloor: number | null = null;  // T127: Selected floor for 2D mode

  // T032: Component outputs
  @Output() regionHover = new EventEmitter<Region | null>();
  @Output() regionClick = new EventEmitter<Region>();
  @Output() viewportChange = new EventEmitter<Viewport>();
  @Output() renderComplete = new EventEmitter<void>();
  @Output() viewModeChange = new EventEmitter<ViewMode>();  // T076: View mode change event
  @Output() floorChange = new EventEmitter<number>();  // T127: Floor change event

  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef<SVGSVGElement>;

  viewport: Viewport = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    width: 800,
    height: 600,
    minScale: 0.1,
    maxScale: 10,
    viewMode: '2d'  // T075: Initialize with 2D view
  };

  hoveredRegion: Region | null = null;
  availableFloors: FloorInfo[] = [];  // T130: Available floors for selector

  constructor(private renderer: SvgRendererService) {}

  // T033: Lifecycle hooks
  ngAfterViewInit(): void {
    this.viewport.width = this.width;
    this.viewport.height = this.height;
    this.viewport.viewMode = this.viewMode;  // T075: Set initial view mode

    this.renderer.initialize(this.svgContainer, this.width, this.height);

    if (this.enableInteraction) {
      this.renderer.setupInteractions(
        (region, event) => this.onRegionHover(region, event),
        (region, event) => this.onRegionClick(region, event)
      );
    }

    // T130: Calculate floors and set default
    this.availableFloors = FloorUtils.getAvailableFloors(this.config.regions);
    if (this.selectedFloor === null && this.availableFloors.length > 0) {
      this.selectedFloor = FloorUtils.getLowestFloor(this.config.regions);
    }

    this.renderer.render(this.config, this.viewport, this.selectedFloor);
    this.renderer.setViewMode(this.viewMode);  // T075: Apply initial view mode
    this.renderer.renderMovements(this.movements);
    this.renderComplete.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // T130: Calculate available floors when config changes
    if (changes['config'] && this.config) {
      this.availableFloors = FloorUtils.getAvailableFloors(this.config.regions);

      // T130: Set default to lowest floor if not set
      if (this.selectedFloor === null && this.availableFloors.length > 0) {
        this.selectedFloor = FloorUtils.getLowestFloor(this.config.regions);
      }

      if (!changes['config'].firstChange) {
        this.renderer.render(this.config, this.viewport, this.selectedFloor);
        this.renderer.renderMovements(this.movements);
      }
    }

    // T075: Detect view mode changes
    if (changes['viewMode'] && !changes['viewMode'].firstChange) {
      this.viewport.viewMode = this.viewMode;
      this.renderer.setViewMode(this.viewMode);
      // Re-render when view mode changes to apply floor filtering correctly
      this.renderer.render(this.config, this.viewport, this.selectedFloor);
      this.renderer.renderMovements(this.movements);
    }

    // Handle selected floor changes
    if (changes['selectedFloor'] && !changes['selectedFloor'].firstChange) {
      this.renderer.render(this.config, this.viewport, this.selectedFloor);
      this.renderer.renderMovements(this.movements);
    }
     if (changes['movements'] && !changes['movements'].firstChange) {
      this.renderer.renderMovements(this.movements);
    }
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }

  // T034 & T044: Public methods and interaction handlers
  zoomIn(): void {
    this.renderer.zoomIn();
  }

  zoomOut(): void {
    this.renderer.zoomOut();
  }

  resetViewport(): void {
    this.renderer.resetViewport();
  }

  exportSVG(): string {
    return this.renderer.exportSVG();
  }

  // T077: Toggle view mode between 2D and isometric
  toggleViewMode(): void {
    const newMode: ViewMode = this.viewMode === '2d' ? 'isometric' : '2d';
    this.viewMode = newMode;
    this.viewport.viewMode = newMode;
    this.renderer.setViewMode(newMode);
    this.viewModeChange.emit(newMode);
    // Re-render to apply floor filtering correctly for new view mode
    this.renderer.render(this.config, this.viewport, this.selectedFloor);
  }

  // T129: Handle floor selection change
  onFloorChange(floor: number): void {
    this.selectedFloor = floor;
    this.floorChange.emit(floor);
    this.renderer.render(this.config, this.viewport, this.selectedFloor);
  }

  private onRegionHover(region: Region | null, event: MouseEvent): void {
    this.hoveredRegion = region;
    this.regionHover.emit(region);
  }

  private onRegionClick(region: Region, event: MouseEvent): void {
    this.regionClick.emit(region);
  }
}
