// T027-T030: SvgRendererService with D3.js rendering
import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { MovementData } from '../models/movement-data.interface';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Viewport, ViewMode } from '../models/viewport.interface';
import { Region } from '../models/region.interface';
import { ScaleCalculator } from '../utils/scale-calculator';
import { IsometricProjection } from '../utils/isometric-projection'; // Using the new projection utility
import { FloorUtils } from '../utils/floor-utils';

const FLOOR_HEIGHT = 300; // Vertical distance between floors


@Injectable({
  providedIn: 'root'
})
export class SvgRendererService {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private contentGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private currentViewMode: ViewMode = '2d';
  private currentConfig: LayoutConfiguration | null = null;
  private currentViewport: Viewport | null = null;
  private xScale: d3.ScaleLinear<number, number> | null = null;
  private yScale: d3.ScaleLinear<number, number> | null = null;


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
    
    this.currentConfig = config;
    this.currentViewport = viewport;

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
    this.xScale = xScale;
    this.yScale = yScale;

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

    const coordLabelsBL = this.contentGroup!
      .selectAll<SVGTextElement,Region>('text.coord-label-bl')
      .data(regionsToRender, d => d.id); 

    coordLabelsBL.enter() 
      .append('text')
      .attr('class', 'coord-label-bl') 
      .merge(coordLabelsBL) 
      .attr('x', d => xScale(d.x) + 5) 
      .attr('y', d => yScale(d.y) + 15)
      // small offset fro corner
      .attr('text-anchor', 'start') 
      .attr('dominant-baseline', 'hanging') 
      .text(d => `(${d.x}, ${d.y})`)
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      // T040d: Conditional visibility based on region size to prevent overlap
      .style('display', d => {
        const widthPx = Math.abs(xScale(d.x + d.width) - xScale(d.x));
        const heightPx = Math.abs(yScale(d.y + d.height) - yScale(d.y));
        // Hide coordinate labels if region is too small
        return (widthPx < 60 || heightPx < 40) ? 'none' : 'block';
      });



    // Add labels
    const labels = this.contentGroup!
      .selectAll<SVGTextElement, Region>('text.region-label')
      .data(regionsToRender
      .filter(r => r.label), d => d.id);

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

    const coordLabelsTR = this.contentGroup! 
      .selectAll<SVGTextElement,Region>('text.coord-label-tr')
      .data(regionsToRender, d => d.id); 

    coordLabelsTR.enter() 
      .append('text')
      .attr('class', 'coord-label-tr')
      .merge(coordLabelsTR) 
      .attr('x', d => xScale(d.x + d.width) -5) // small offset from corner 
      .attr('y', d=> yScale(d.y + d.height) -5) // small offset from corner
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'auto')
      .text(d => `${d.x + d.width}, ${d.y + d.height}`)
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('fill', '#666')
      .style('user-select', 'none')
      .style('pointer-events', 'none')
      // T040d & T082: Conditional visibility based on region size to prevent overlap
      .style('display', d => {
        const widthPx = Math.abs(xScale(d.x + d.width) - xScale(d.x));
        const heightPx = Math.abs(yScale(d.y + d.height) - yScale(d.y));
        // Adjust thresholds based on view mode - isometric needs larger regions
        const minWidth = this.currentViewMode === 'isometric' ? 80 : 60;
        const minHeight = this.currentViewMode === 'isometric' ? 60 : 40;
        return (widthPx < minWidth || heightPx < minHeight) ? 'none' : 'block';
      });

    rects.exit().remove();
    labels.exit().remove(); 
    coordLabelsBL.exit().remove(); 
    coordLabelsTR.exit().remove(); 
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

    // T083: Add 3D coordinate labels
    const coordLabels = this.contentGroup!
      .selectAll<SVGGElement, Region>('g.coord-labels')
      .data(regionsToRender, d => d.id);

    const enterLabels = coordLabels.enter()
      .append('g')
      .attr('class', 'coord-labels');

    enterLabels.append('text').attr('class', 'coord-label-bl');
    enterLabels.append('text').attr('class', 'coord-label-tr');

    const allLabels = enterLabels.merge(coordLabels);

    allLabels.each((d, i, nodes) => {
      const group = d3.select(nodes[i]);
      const z = (d.floor ?? 0) * FLOOR_HEIGHT;

      const [blX, blY] = this.isometricProj.project(d.x, d.y, z);
      const [trX, trY] = this.isometricProj.project(d.x + d.width, d.y + d.height, z);

      group.select('.coord-label-bl')
        .attr('x', blX + 5)
        .attr('y', blY + 5)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'hanging')
        .text(`(${d.x}, ${d.y})`);

      group.select('.coord-label-tr')
        .attr('x', trX - 5)
        .attr('y', trY - 5)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'auto')
        .text(`(${d.x + d.width}, ${d.y + d.height})`);

      group.selectAll('text')
        .style('font-size', '10px')
        .style('font-family', 'monospace')
        .style('fill', '#666')
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        // .style('display', () => {
        //   const [w, h] = this.isometricProj.project(d.width, d.height, 0);
        //   const minWidth = 80;
        //   const minHeight = 60;
        //   return (Math.abs(w) < minWidth || Math.abs(h) < minHeight) ? 'none' : 'block';
        // });
    });

    coordLabels.exit().remove();

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
  // Renders movement flows (arrows) on the SVG canvas
  renderMovements(movements: MovementData[]): void {
    if (!this.svg || !this.contentGroup || !this.currentConfig) return;

    // Clear previous movement flows
    this.contentGroup.selectAll('.flow-links').remove();
    this.svg.select('defs').remove(); // Remove old markers

    if (!movements || movements.length === 0) return;
    
    // Define arrowhead marker
    const defs = this.svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');
      
    const regionsMap = new Map(this.currentConfig.regions.map(r => [r.id, r]));
    const maxMoves = Math.max(...movements.map(m => m.moves), 0);

    const linksGroup = this.contentGroup.append('g').attr('class', 'flow-links');

    for (const movement of movements) {
      const fromRegion = regionsMap.get(movement.fromRegion);
      const toRegion = regionsMap.get(movement.toRegion);

      if (!fromRegion || !toRegion) continue;

      const startX = fromRegion.x + fromRegion.width / 2;
      const startY = fromRegion.y + fromRegion.height / 2;
      const endX = toRegion.x + toRegion.width / 2;
      const endY = toRegion.y + toRegion.height / 2;
      
      let d = '';

      if (this.currentViewMode === 'isometric') {
        const startZ = (fromRegion.floor ?? 0) * FLOOR_HEIGHT;
        const endZ = (toRegion.floor ?? 0) * FLOOR_HEIGHT;

        if (startZ === endZ) {
          // Same floor: straight line
          const arrowZ = startZ + 1;
          const start = this.isometricProj.project(startX, startY, arrowZ);
          const end = this.isometricProj.project(endX, endY, arrowZ);
          d = `M${start[0]},${start[1]}L${end[0]},${end[1]}`;
        } else {
          // Different floors: arc
          const midZ = (startZ + endZ) / 2 + FLOOR_HEIGHT * 1.5; // Arc height
          const p1 = this.isometricProj.project(startX, startY, startZ);
          const p2 = this.isometricProj.project(startX, startY, midZ);
          const p3 = this.isometricProj.project(endX, endY, midZ);
          const p4 = this.isometricProj.project(endX, endY, endZ);
          d = `M${p1[0]},${p1[1]} C${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}`;
        }
      } else {
        if (fromRegion.floor !== toRegion.floor) continue;
        if (!this.xScale || !this.yScale) continue;
        const start = [this.xScale(startX), this.yScale(startY)];
        const end = [this.xScale(endX), this.yScale(endY)];
        d = `M${start[0]},${start[1]}L${end[0]},${end[1]}`;
      }

      const thickness = maxMoves > 0 ? Math.max(1, (movement.moves / maxMoves) * 10) : 1;

      linksGroup.append('path')
        .attr('class', 'flow-link')
        .attr('d', d)
        .attr('stroke', 'rgba(0, 0, 0, 0.5)')
        .attr('stroke-width', thickness)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('fill', 'none');
    }
  }
}
