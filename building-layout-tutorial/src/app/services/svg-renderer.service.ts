// T027-T030: SvgRendererService with D3.js rendering
import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Viewport } from '../models/viewport.interface';
import { Region } from '../models/region.interface';
import { ScaleCalculator } from '../utils/scale-calculator';

@Injectable({
  providedIn: 'root'
})
export class SvgRendererService {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

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

  // T028 & T030: Render layout configuration with D3 data join pattern
  render(config: LayoutConfiguration, viewport: Viewport): void {
    if (!this.svg || !this.contentGroup) return;

    const { xScale, yScale } = ScaleCalculator.calculateFitScales(
      config,
      viewport.width,
      viewport.height
    );

    // T030: D3 data join pattern for regions
    const rects = this.contentGroup
      .selectAll<SVGRectElement, Region>('rect.region')
      .data(config.regions, d => d.id);

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
      .data(config.regions.filter(r => r.label), d => d.id);

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

    // Exit
    rects.exit().remove();
    labels.exit().remove();
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
}
