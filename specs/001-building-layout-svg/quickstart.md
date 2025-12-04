# Quickstart: Building Layout Visualization

**Feature**: Building Layout SVG Visualization with D3.js and Angular
**Estimated Time**: 30-45 minutes
**Difficulty**: Beginner

## Learning Objectives

By completing this example, you will learn:

1. How to integrate D3.js with Angular standalone components
2. How to render SVG graphics based on coordinate data
3. How to implement zoom and pan controls for SVG viewports
4. How to handle mouse interactions (hover, click) on SVG elements
5. How to use D3 scales for automatic coordinate mapping

## Prerequisites

- Basic knowledge of TypeScript and Angular
- Familiarity with HTML/CSS
- Understanding of Cartesian coordinate systems
- Angular CLI installed (`npm install -g @angular/cli`)
- Node.js 18+ and npm installed

## What You'll Build

An interactive building layout visualization that:
- Displays rectangular regions based on X-Y coordinates
- Supports zoom in/out and pan navigation
- Shows region information on hover
- Updates dynamically when configuration changes

**Final Result Screenshot**: *(Will be added during implementation)*

---

## Step 1: Project Setup

### 1.1 Create New Angular Project (if starting fresh)

```bash
# Create new Angular project with standalone components
ng new building-layout-tutorial --standalone --routing=false --style=scss

cd building-layout-tutorial
```

### 1.2 Install Dependencies

```bash
# Install D3.js and type definitions
npm install d3@^7.9.0
npm install --save-dev @types/d3
```

### 1.3 Verify Installation

```bash
# Start development server
ng serve

# Open browser to http://localhost:4200
# You should see the default Angular welcome page
```

---

## Step 2: Create Data Models

### 2.1 Create Models Directory

```bash
mkdir -p src/app/models
```

### 2.2 Create Region Interface

**File**: `src/app/models/region.interface.ts`

```typescript
export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
  strokeColor?: string;
  metadata?: Record<string, any>;
}
```

### 2.3 Create Layout Configuration Interface

**File**: `src/app/models/layout-config.interface.ts`

```typescript
import { Region } from './region.interface';

export interface LayoutConfiguration {
  regions: Region[];
  name?: string;
  description?: string;
  metadata?: {
    buildingName?: string;
    floorNumber?: number;
    units?: string;
    [key: string]: any;
  };
}
```

### 2.4 Create Viewport Interface

**File**: `src/app/models/viewport.interface.ts`

```typescript
export interface Viewport {
  scale: number;
  translateX: number;
  translateY: number;
  width: number;
  height: number;
  minScale: number;
  maxScale: number;
}
```

---

## Step 3: Create Utility Functions

### 3.1 Create Utils Directory

```bash
mkdir -p src/app/utils
```

### 3.2 Create Coordinate Validator

**File**: `src/app/utils/coordinate-validator.ts`

```typescript
import { Region } from '../models/region.interface';
import { LayoutConfiguration } from '../models/layout-config.interface';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class CoordinateValidator {
  static validateRegion(region: Region): ValidationResult {
    const errors: string[] = [];

    if (!region.id || region.id.trim() === '') {
      errors.push('Region ID is required');
    }
    if (typeof region.x !== 'number' || region.x < 0) {
      errors.push(`Invalid x coordinate: ${region.x}`);
    }
    if (typeof region.y !== 'number' || region.y < 0) {
      errors.push(`Invalid y coordinate: ${region.y}`);
    }
    if (typeof region.width !== 'number' || region.width <= 0) {
      errors.push(`Invalid width: ${region.width}`);
    }
    if (typeof region.height !== 'number' || region.height <= 0) {
      errors.push(`Invalid height: ${region.height}`);
    }

    return { valid: errors.length === 0, errors };
  }

  static validateLayout(config: LayoutConfiguration): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(config.regions)) {
      errors.push('Regions must be an array');
      return { valid: false, errors };
    }

    const regionIds = new Set<string>();
    config.regions.forEach((region, index) => {
      const result = this.validateRegion(region);
      if (!result.valid) {
        errors.push(`Region ${index}: ${result.errors.join(', ')}`);
      }
      if (regionIds.has(region.id)) {
        errors.push(`Duplicate region ID: ${region.id}`);
      }
      regionIds.add(region.id);
    });

    return { valid: errors.length === 0, errors };
  }
}
```

### 3.3 Create Scale Calculator

**File**: `src/app/utils/scale-calculator.ts`

```typescript
import * as d3 from 'd3';
import { LayoutConfiguration } from '../models/layout-config.interface';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export class ScaleCalculator {
  static calculateBounds(config: LayoutConfiguration): BoundingBox {
    if (config.regions.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
    }

    const minX = d3.min(config.regions, d => d.x) ?? 0;
    const minY = d3.min(config.regions, d => d.y) ?? 0;
    const maxX = d3.max(config.regions, d => d.x + d.width) ?? 100;
    const maxY = d3.max(config.regions, d => d.y + d.height) ?? 100;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  static calculateFitScales(
    config: LayoutConfiguration,
    viewportWidth: number,
    viewportHeight: number,
    padding: number = 20
  ) {
    const bounds = this.calculateBounds(config);

    const xScale = d3.scaleLinear()
      .domain([bounds.minX - padding, bounds.maxX + padding])
      .range([0, viewportWidth]);

    const yScale = d3.scaleLinear()
      .domain([bounds.minY - padding, bounds.maxY + padding])
      .range([0, viewportHeight]);

    return { xScale, yScale };
  }
}
```

---

## Step 4: Create SVG Renderer Service

### 4.1 Generate Service

```bash
ng generate service services/svg-renderer
```

### 4.2 Implement SVG Renderer Service

**File**: `src/app/services/svg-renderer.service.ts`

```typescript
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

  initialize(container: ElementRef, width: number, height: number): void {
    this.svg = d3.select(container.nativeElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.contentGroup = this.svg.append('g')
      .attr('class', 'content-group');

    // Setup zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.contentGroup?.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);
  }

  render(config: LayoutConfiguration, viewport: Viewport): void {
    if (!this.svg || !this.contentGroup) return;

    const { xScale, yScale } = ScaleCalculator.calculateFitScales(
      config,
      viewport.width,
      viewport.height
    );

    // Data join for regions
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
      .text(d => d.label || '');

    // Exit
    rects.exit().remove();
    labels.exit().remove();
  }

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

  resetViewport(): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  zoomIn(factor: number = 1.2): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, factor);
  }

  zoomOut(factor: number = 1.2): void {
    if (!this.svg || !this.zoom) return;

    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 1 / factor);
  }

  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
      this.svg = null;
    }
    this.contentGroup = null;
    this.zoom = null;
  }
}
```

---

## Step 5: Create Building Layout Component

### 5.1 Generate Component

```bash
ng generate component components/building-layout --standalone
```

### 5.2 Implement Component

**File**: `src/app/components/building-layout/building-layout.component.ts`

```typescript
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
  @Input() config: LayoutConfiguration = { regions: [] };
  @Input() width: number = 800;
  @Input() height: number = 600;

  @Output() regionHover = new EventEmitter<Region | null>();
  @Output() regionClick = new EventEmitter<Region>();

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

  constructor(private renderer: SvgRendererService) {}

  ngAfterViewInit(): void {
    this.viewport.width = this.width;
    this.viewport.height = this.height;

    this.renderer.initialize(this.svgContainer, this.width, this.height);
    this.renderer.setupInteractions(
      (region, event) => this.regionHover.emit(region),
      (region, event) => this.regionClick.emit(region)
    );
    this.renderer.render(this.config, this.viewport);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.renderer.render(this.config, this.viewport);
    }
  }

  zoomIn(): void {
    this.renderer.zoomIn();
  }

  zoomOut(): void {
    this.renderer.zoomOut();
  }

  resetViewport(): void {
    this.renderer.resetViewport();
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }
}
```

**File**: `src/app/components/building-layout/building-layout.component.html`

```html
<div class="building-layout-container">
  <div class="controls">
    <button (click)="zoomIn()">Zoom In (+)</button>
    <button (click)="zoomOut()">Zoom Out (-)</button>
    <button (click)="resetViewport()">Reset</button>
  </div>

  <svg #svgContainer class="layout-svg"></svg>
</div>
```

**File**: `src/app/components/building-layout/building-layout.component.scss`

```scss
.building-layout-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;

  button {
    padding: 8px 16px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #1976D2;
    }
  }
}

.layout-svg {
  border: 1px solid #ccc;
  background: #f5f5f5;
  display: block;
}
```

---

## Step 6: Create Demo Component

### 6.1 Update App Component

**File**: `src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { BuildingLayoutComponent } from './components/building-layout/building-layout.component';
import { LayoutConfiguration } from './models/layout-config.interface';
import { Region } from './models/region.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuildingLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Building Layout Visualization';

  hoveredRegion: Region | null = null;

  layoutConfig: LayoutConfiguration = {
    name: 'Sample Office Layout',
    regions: [
      {
        id: 'reception',
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        label: 'Reception',
        color: '#E8F5E9',
        strokeColor: '#4CAF50'
      },
      {
        id: 'conf-room-1',
        x: 0,
        y: 200,
        width: 300,
        height: 250,
        label: 'Conference Room 1',
        color: '#E3F2FD',
        strokeColor: '#2196F3'
      },
      {
        id: 'office-1',
        x: 300,
        y: 200,
        width: 200,
        height: 150,
        label: 'Office 101',
        color: '#FFF3E0',
        strokeColor: '#FF9800'
      },
      {
        id: 'hallway',
        x: 0,
        y: 450,
        width: 500,
        height: 100,
        label: 'Main Hallway',
        color: '#F5F5F5',
        strokeColor: '#9E9E9E'
      }
    ]
  };

  onRegionHover(region: Region | null): void {
    this.hoveredRegion = region;
    if (region) {
      console.log('Hovered:', region.label);
    }
  }

  onRegionClick(region: Region): void {
    console.log('Clicked:', region.label, region);
    alert(`Clicked: ${region.label}`);
  }
}
```

**File**: `src/app/app.component.html`

```html
<div class="app-container">
  <header>
    <h1>{{ title }}</h1>
    <p class="subtitle">Interactive SVG Visualization with D3.js and Angular</p>
  </header>

  <main>
    <app-building-layout
      [config]="layoutConfig"
      [width]="1024"
      [height]="768"
      (regionHover)="onRegionHover($event)"
      (regionClick)="onRegionClick($event)"
    ></app-building-layout>

    <aside class="info-panel" *ngIf="hoveredRegion">
      <h3>{{ hoveredRegion.label }}</h3>
      <p>Position: ({{ hoveredRegion.x }}, {{ hoveredRegion.y }})</p>
      <p>Size: {{ hoveredRegion.width }} x {{ hoveredRegion.height }}</p>
    </aside>
  </main>
</div>
```

**File**: `src/app/app.component.scss`

```scss
.app-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

header {
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #333;
  }

  .subtitle {
    margin: 8px 0 0;
    color: #666;
    font-size: 14px;
  }
}

main {
  display: flex;
  gap: 20px;
}

.info-panel {
  min-width: 200px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;

  h3 {
    margin: 0 0 12px;
    color: #2196F3;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
  }
}
```

---

## Step 7: Run and Test

### 7.1 Start Development Server

```bash
ng serve
```

### 7.2 Open Browser

Navigate to `http://localhost:4200`

### 7.3 Test Interactions

1. **Zoom In/Out**: Click the zoom buttons
2. **Pan**: Click and drag on the SVG
3. **Hover**: Move mouse over regions to see info panel update
4. **Click**: Click regions to see alert with region details

---

## Step 8: Build for Production

### 8.1 Build

```bash
ng build --configuration production
```

### 8.2 Output

Built files will be in `dist/building-layout-tutorial/`

---

## Next Steps & Extensions

### Beginner Extensions
- Add more regions to the sample configuration
- Change colors and labels
- Adjust viewport size

### Intermediate Extensions
- Load configuration from JSON file
- Add configuration editor UI
- Export visualization as PNG
- Add region search/filter

### Advanced Extensions
- Support non-rectangular shapes (polygons)
- Add connections between regions (lines/arrows)
- Multi-floor visualization with floor switcher
- Real-time collaborative editing

---

## Troubleshooting

### D3 Import Errors

**Error**: `Cannot find module 'd3'`

**Solution**:
```bash
npm install d3 @types/d3
```

### SVG Not Rendering

**Error**: Blank SVG element

**Solution**: Check browser console for errors. Verify:
- `@ViewChild` reference is correct
- `ngAfterViewInit` is called
- Configuration has valid regions

### Zoom/Pan Not Working

**Error**: Click and drag doesn't pan

**Solution**: Verify `d3.zoom()` is attached to SVG, not content group.

---

## Additional Resources

- **D3.js Documentation**: https://d3js.org/
- **Angular Documentation**: https://angular.io/
- **SVG Tutorial**: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
- **D3 Zoom Behavior**: https://d3js.org/d3-zoom

---

## Estimated Completion Time

- **Setup (Steps 1-2)**: 10 minutes
- **Implementation (Steps 3-5)**: 20 minutes
- **Demo & Testing (Steps 6-7)**: 10 minutes
- **Total**: 30-45 minutes

---

## Key Takeaways

✅ D3.js can be integrated with Angular using ElementRef and lifecycle hooks
✅ SVG scales provide automatic coordinate mapping
✅ D3's data join pattern efficiently updates visualizations
✅ d3.zoom() behavior handles pan/zoom with minimal code
✅ Component architecture separates concerns (rendering vs. interaction)
