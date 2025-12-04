// T031-T034: BuildingLayoutComponent
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutConfiguration } from '../../models/layout-config.interface';
import { Viewport } from '../../models/viewport.interface';
import { Region } from '../../models/region.interface';
import { SvgRendererService } from '../../services/svg-renderer.service';

@Component({
  selector: 'app-building-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './building-layout.component.html',
  styleUrls: ['./building-layout.component.scss']
})
export class BuildingLayoutComponent implements AfterViewInit, OnChanges, OnDestroy {
  // T032: Component inputs
  @Input() config: LayoutConfiguration = { regions: [] };
  @Input() width: number = 800;
  @Input() height: number = 600;
  @Input() showControls: boolean = true;
  @Input() enableInteraction: boolean = true;

  // T032: Component outputs
  @Output() regionHover = new EventEmitter<Region | null>();
  @Output() regionClick = new EventEmitter<Region>();
  @Output() viewportChange = new EventEmitter<Viewport>();
  @Output() renderComplete = new EventEmitter<void>();

  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef<SVGSVGElement>;

  viewport: Viewport = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    width: 800,
    height: 600,
    minScale: 0.1,
    maxScale: 10
  };

  hoveredRegion: Region | null = null;

  constructor(private renderer: SvgRendererService) {}

  // T033: Lifecycle hooks
  ngAfterViewInit(): void {
    this.viewport.width = this.width;
    this.viewport.height = this.height;

    this.renderer.initialize(this.svgContainer, this.width, this.height);

    if (this.enableInteraction) {
      this.renderer.setupInteractions(
        (region, event) => this.onRegionHover(region, event),
        (region, event) => this.onRegionClick(region, event)
      );
    }

    this.renderer.render(this.config, this.viewport);
    this.renderComplete.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.renderer.render(this.config, this.viewport);
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

  private onRegionHover(region: Region | null, event: MouseEvent): void {
    this.hoveredRegion = region;
    this.regionHover.emit(region);
  }

  private onRegionClick(region: Region, event: MouseEvent): void {
    this.regionClick.emit(region);
  }
}
