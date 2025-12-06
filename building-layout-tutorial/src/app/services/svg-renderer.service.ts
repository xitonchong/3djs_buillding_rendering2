// T027-T030: SvgRendererService with D3.js rendering
import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Viewport, ViewMode } from '../models/viewport.interface';
import { Region } from '../models/region.interface';
import { ScaleCalculator } from '../utils/scale-calculator';
import { IsometricTransform } from '../utils/isometric-transform';
import { FloorUtils } from '../utils/floor-utils';  // T119: Import floor utilities

@Injectable({
  providedIn: 'root'
})
export class SvgRendererService {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private currentViewMode: ViewMode = '2d';  // T073: Track current view mode

  // T028: Initialize SVG canvas
  initialize(container: ElementRef, width: number, height: number): void {
    this.svg = d3.select(container.nativeElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.contentGroup = this.svg.append('g')
      .attr('class', 'content-group');

    // T029: Setup zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.contentGroup?.attr('transform', event.transform.toString());
      });

    this.svg.call(this.zoom);
  }

  // T028 & T030 & T119: Render layout configuration with D3 data join pattern
  render(config: LayoutConfiguration, viewport: Viewport, selectedFloor?: number | null): void {
    if (!this.svg || !this.contentGroup) return;

    // T119-T121: Determine which regions to render based on view mode and selected floor
    let regionsToRender: Region[] = config.regions;

    if (viewport.viewMode === '2d' && selectedFloor !== null && selectedFloor !== undefined) {
      // T120: 2D mode - filter by selected floor
      regionsToRender = FloorUtils.filterRegionsByFloor(config.regions, selectedFloor);
    } else if (viewport.viewMode === 'isometric') {
      // T121: Isometric mode - render all floors, sorted bottom to top for proper z-ordering
      regionsToRender = [...config.regions].sort((a, b) => (a.floor ?? 0) - (b.floor ?? 0));
    }

    const { xScale, yScale } = ScaleCalculator.calculateFitScales(
      config,
      viewport.width,
      viewport.height
    );

    // T030: D3 data join pattern for regions
    const rects = this.contentGroup
      .selectAll<SVGRectElement, Region>('rect.region')
      .data(regionsToRender, d => d.id);

    // Enter + Update
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
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    const labels = this.contentGroup
      .selectAll<SVGTextElement, Region>('text.region-label')
      .data(regionsToRender.filter(r => r.label), d => d.id);

    labels.enter()
      .append('text')
      .attr('class', 'region-label')
      .merge(labels)
      .attr('x', d => xScale(d.x + d.width / 2))
      .attr('y', d => yScale(d.y + d.height / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .text(d => d.label || '');

    // T040a: Add bottom-left coordinate labels (x, y)
    const coordLabelsBL = this.contentGroup
      .selectAll<SVGTextElement, Region>('text.coord-label-bl')
      .data(regionsToRender, d => d.id);

    coordLabelsBL.enter()
      .append('text')
      .attr('class', 'coord-label-bl')
      .merge(coordLabelsBL)
      .attr('x', d => xScale(d.x) + 5)  // Small offset from corner
      .attr('y', d => yScale(d.y) + 15)  // Small offset from corner
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      // T134: Show floor in isometric mode
      .text(d => {
        if (this.currentViewMode === 'isometric') {
          return `(${d.x}, ${d.y}) F${d.floor ?? 0}`;
        } else {
          return `(${d.x}, ${d.y})`;
        }
      })
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      // T040d & T082: Conditional visibility based on region size to prevent overlap
      .style('display', d => {
        const widthPx = Math.abs(xScale(d.x + d.width) - xScale(d.x));
        const heightPx = Math.abs(yScale(d.y + d.height) - yScale(d.y));
        // Adjust thresholds based on view mode - isometric needs larger regions
        const minWidth = this.currentViewMode === 'isometric' ? 80 : 60;
        const minHeight = this.currentViewMode === 'isometric' ? 60 : 40;
        return (widthPx < minWidth || heightPx < minHeight) ? 'none' : 'block';
      });

    // T040b: Add top-right coordinate labels (x+width, y+height)
    const coordLabelsTR = this.contentGroup
      .selectAll<SVGTextElement, Region>('text.coord-label-tr')
      .data(regionsToRender, d => d.id);

    coordLabelsTR.enter()
      .append('text')
      .attr('class', 'coord-label-tr')
      .merge(coordLabelsTR)
      .attr('x', d => xScale(d.x + d.width) - 5)  // Small offset from corner
      .attr('y', d => yScale(d.y + d.height) - 5)  // Small offset from corner
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'auto')
      // T134: Show floor in isometric mode
      .text(d => {
        if (this.currentViewMode === 'isometric') {
          return `(${d.x + d.width}, ${d.y + d.height}) F${d.floor ?? 0}`;
        } else {
          return `(${d.x + d.width}, ${d.y + d.height})`;
        }
      })
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      // T040d & T082: Conditional visibility based on region size to prevent overlap
      .style('display', d => {
        const widthPx = Math.abs(xScale(d.x + d.width) - xScale(d.x));
        const heightPx = Math.abs(yScale(d.y + d.height) - yScale(d.y));
        // Adjust thresholds based on view mode - isometric needs larger regions
        const minWidth = this.currentViewMode === 'isometric' ? 80 : 60;
        const minHeight = this.currentViewMode === 'isometric' ? 60 : 40;
        return (widthPx < minWidth || heightPx < minHeight) ? 'none' : 'block';
      });

    // Exit
    rects.exit().remove();
    labels.exit().remove();
    coordLabelsBL.exit().remove();
    coordLabelsTR.exit().remove();
  }

  // T028: Update viewport transform
  updateViewport(viewport: Viewport): void {
    if (!this.svg || !this.zoom) return;

    const transform = d3.zoomIdentity
      .translate(viewport.translateX, viewport.translateY)
      .scale(viewport.scale);

    this.svg.call(this.zoom.transform, transform);
  }

  // T042: Setup interaction handlers
  setupInteractions(
    onHover: (region: Region | null, event: MouseEvent) => void,
    onClick: (region: Region, event: MouseEvent) => void
  ): void {
    if (!this.contentGroup) return;

    this.contentGroup.selectAll('rect.region')
      .on('mouseenter', function(event, d: any) {
        d3.select(this).attr('opacity', 0.7);
        onHover(d, event);
      })
      .on('mouseleave', function(event) {
        d3.select(this).attr('opacity', 1);
        onHover(null, event);
      })
      .on('click', (event, d: any) => {
        onClick(d, event);
      });
  }

  // T043: Highlight region
  highlightRegion(regionId: string | null): void {
    if (!this.contentGroup) return;

    this.contentGroup.selectAll('rect.region')
      .attr('opacity', function(d: any) {
        return regionId === null || d.id === regionId ? 1 : 0.5;
      });
  }

  // T029: Zoom in
  zoomIn(factor: number = 1.2): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, factor);
  }

  // T029: Zoom out
  zoomOut(factor: number = 1.2): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 1 / factor);
  }

  // T029: Reset viewport
  resetViewport(): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  // Export SVG as string
  exportSVG(): string {
    return this.svg?.node()?.outerHTML || '';
  }

  // Clean up D3 resources
  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
      this.svg = null;
    }
    this.contentGroup = null;
    this.zoom = null;
  }

  // T073: Set view mode (2D or isometric)
  setViewMode(viewMode: ViewMode): void {
    if (!this.contentGroup) return;

    this.currentViewMode = viewMode;

    // T074: Apply CSS transform based on view mode
    const transform = IsometricTransform.getTransform(viewMode);

    if (viewMode === 'isometric') {
      this.contentGroup
        .attr('class', 'content-group isometric')
        .style('transform', transform);
    } else {
      this.contentGroup
        .attr('class', 'content-group')
        .style('transform', 'none');
    }
  }

  // Get current view mode
  getViewMode(): ViewMode {
    return this.currentViewMode;
  }
}
