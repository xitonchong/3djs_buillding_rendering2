// T027-T030: SvgRendererService with D3.js rendering
import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Viewport, ViewMode } from '../models/viewport.interface';
import { Region } from '../models/region.interface';
import { ScaleCalculator } from '../utils/scale-calculator';
import { IsometricProjection } from '../utils/isometric-projection'; // Using the new projection utility
import { FloorUtils } from '../utils/floor-utils';

const FLOOR_HEIGHT = 300; // Vertical distance between floors
const WALL_HEIGHT = 300; // Height of the walls

@Injectable({
  providedIn: 'root'
})
export class SvgRendererService {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private currentViewMode: ViewMode = '2d';

  constructor(private isometricProj: IsometricProjection) {}

  initialize(container: ElementRef, width: number, height: number): void {
    this.svg = d3.select(container.nativeElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.contentGroup = this.svg.append('g').attr('class', 'content-group');

    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.contentGroup?.attr('transform', event.transform.toString());
      });

    this.svg.call(this.zoom);
  }

  render(config: LayoutConfiguration, viewport: Viewport, selectedFloor?: number | null): void {
    if (!this.svg || !this.contentGroup) return;

    this.contentGroup.selectAll('*').remove(); // Clear previous render

    if (this.currentViewMode === 'isometric') {
      this.renderIsometric(config, viewport);
    } else {
      this.render2D(config, viewport, selectedFloor);
    }
  }

  private render2D(config: LayoutConfiguration, viewport: Viewport, selectedFloor?: number | null): void {
    let regionsToRender = FloorUtils.filterRegionsByFloor(config.regions, selectedFloor ?? 0);

    const { xScale, yScale } = ScaleCalculator.calculateFitScales(
      { regions: regionsToRender },
      viewport.width,
      viewport.height
    );

    const rects = this.contentGroup!
      .selectAll<SVGRectElement, Region>('rect.region')
      .data(regionsToRender, d => d.id);

    rects.enter()
      .append('rect')
      .attr('class', 'region')
      .merge(rects)
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y))
      .attr('width', d => xScale(d.x + d.width) - xScale(d.x))
      .attr('height', d => yScale(d.y + d.height) - yScale(d.y))
      .attr('fill', d => d.color || '#E3F2FD')
      .attr('stroke', d => d.strokeColor || '#2196F3')
      .attr('stroke-width', 2);

    rects.exit().remove();
  }

  private renderIsometric(config: LayoutConfiguration, viewport: Viewport): void {
    const regionsToRender = [...config.regions].sort((a, b) => {
        const floorDiff = (a.floor ?? 0) - (b.floor ?? 0);
        if (floorDiff !== 0) return floorDiff;
        const aCenterY = a.y + a.height / 2;
        const bCenterY = b.y + b.height / 2;
        if (aCenterY !== bCenterY) return bCenterY - aCenterY;
        const aCenterX = a.x + a.width / 2;
        const bCenterX = b.x + b.width / 2;
        return bCenterX - aCenterX;
    });

    const regionGroups = this.contentGroup!
      .selectAll<SVGGElement, Region>('g.region-group')
      .data(regionsToRender, d => d.id);

    const enterGroups = regionGroups.enter()
      .append('g')
      .attr('class', 'region-group');

    // Add walls and floor polygons to each new group
    enterGroups.append('polygon').attr('class', 'wall-face-1');
    enterGroups.append('polygon').attr('class', 'wall-face-2');
    enterGroups.append('polygon').attr('class', 'floor-surface');
    enterGroups.append('text').attr('class', 'region-label');

    const allGroups = enterGroups.merge(regionGroups);

    allGroups.each((d, i, nodes) => {
      const group = d3.select(nodes[i]);
      const z = (d.floor ?? 0) * FLOOR_HEIGHT;

      // Wall 1 (back-left)
      // const wall1Points: [number, number, number][] = [
      //   [d.x, d.y, z],
      //   [d.x + d.width, d.y, z],
      //   [d.x + d.width, d.y, z - WALL_HEIGHT],
      //   [d.x, d.y, z - WALL_HEIGHT]
      // ];
      // group.select('.wall-face-1')
      //   .attr('points', this.isometricProj.projectPolygon(wall1Points))
      //   .attr('fill', d3.color(d.color || '#ccc')?.darker(0.5).toString() ?? '#999')
      //   .attr('fill-opacity', 0.1);

      // Wall 2 (back-right)
      // const wall2Points: [number, number, number][] = [
      //   [d.x + d.width, d.y, z],
      //   [d.x + d.width, d.y + d.height, z],
      //   [d.x + d.width, d.y + d.height, z - WALL_HEIGHT],
      //   [d.x + d.width, d.y, z - WALL_HEIGHT]
      // ];
      // group.select('.wall-face-2')
      //   .attr('points', this.isometricProj.projectPolygon(wall2Points))
      //   .attr('fill', d3.color(d.color || '#ccc')?.darker(0.7).toString() ?? '#888')
      //   .attr('fill-opacity', 0.1);

      // Floor surface
      const floorPoints: [number, number, number][] = [
        [d.x, d.y, z],
        [d.x + d.width, d.y, z],
        [d.x + d.width, d.y + d.height, z],
        [d.x, d.y + d.height, z]
      ];
      group.select('.floor-surface')
        .attr('points', this.isometricProj.projectPolygon(floorPoints))
        .attr('fill', d.color || '#ccc')
        .attr('stroke', d.strokeColor || '#999')
        .attr('stroke-width', 1)
        .attr('fill-opacity', 0.5);
        
      // Label
      const [labelX, labelY] = this.isometricProj.project(d.x + d.width / 2, d.y + d.height / 2, z + 10);
      group.select('.region-label')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#000')
        .text(d.label || '');
    });

    regionGroups.exit().remove();
    
    // Auto-zoom to fit content
    this.resetViewport(true);
  }

  updateViewport(viewport: Viewport): void {
    if (!this.svg || !this.zoom) return;
    const transform = d3.zoomIdentity.translate(viewport.translateX, viewport.translateY).scale(viewport.scale);
    this.svg.call(this.zoom.transform, transform);
  }

  setupInteractions(onHover: (region: Region | null, event: MouseEvent) => void, onClick: (region: Region, event: MouseEvent) => void): void {
    if (!this.contentGroup) return;

    const selection = this.currentViewMode === 'isometric' 
      ? this.contentGroup.selectAll('g.region-group')
      : this.contentGroup.selectAll('rect.region');

    selection
      .on('mouseenter', function(event, d: any) {
        d3.select(this).selectAll('polygon').attr('opacity', 0.7);
        d3.select(this).filter('rect').attr('opacity', 0.7);
        onHover(d, event);
      })
      .on('mouseleave', function(event, d: any) {
        d3.select(this).selectAll('polygon').attr('opacity', 1);
        d3.select(this).filter('rect').attr('opacity', 1);
        onHover(null, event);
      })
      .on('click', (event, d: any) => {
        onClick(d, event);
      });
  }

  highlightRegion(regionId: string | null): void {
    if (!this.contentGroup) return;

    const selection = this.currentViewMode === 'isometric' 
      ? this.contentGroup.selectAll('g.region-group')
      : this.contentGroup.selectAll('rect.region');

    selection.attr('opacity', function(d: any) {
      return regionId === null || d.id === regionId ? 1 : 0.5;
    });
  }

  zoomIn(factor: number = 1.2): void {
    this.svg?.transition().duration(300).call(this.zoom!.scaleBy, factor);
  }

  zoomOut(factor: number = 1.2): void {
    this.svg?.transition().duration(300).call(this.zoom!.scaleBy, 1 / factor);
  }

  resetViewport(instant = false): void {
    if (!this.contentGroup || !this.svg || !this.zoom) return;

    const bounds = this.contentGroup.node()!.getBBox();
    const parent = this.svg.node()!.parentElement!;
    const { width, height } = parent.getBoundingClientRect();

    const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9;
    const translateX = width / 2 - (bounds.x + bounds.width / 2) * scale;
    const translateY = height / 2 - (bounds.y + bounds.height / 2) * scale;

    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
    
    const transition = this.svg.transition().duration(instant ? 0 : 750);
    transition.call(this.zoom.transform, transform);
  }

  exportSVG(): string {
    return this.svg?.node()?.outerHTML || '';
  }

  destroy(): void {
    this.svg?.selectAll('*').remove();
    this.svg = null;
  }

  setViewMode(viewMode: ViewMode): void {
    this.currentViewMode = viewMode;
    // No longer applying CSS transforms. The render method handles the view mode.
  }

  getViewMode(): ViewMode {
    return this.currentViewMode;
  }
}
