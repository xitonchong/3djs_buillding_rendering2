# Research: Building Layout Visualization

**Feature**: Building Layout SVG Visualization with D3.js and Angular
**Date**: 2025-12-04
**Purpose**: Research technical approaches, best practices, and design decisions for implementing coordinate-based SVG visualization

## Research Questions

1. How to integrate D3.js with Angular standalone components effectively?
2. What are best practices for SVG coordinate scaling and viewport management?
3. How to achieve optimal performance for rendering 500+ SVG elements?
4. What patterns work best for real-time configuration updates in D3.js?

## Research Findings

### 1. D3.js + Angular Integration

**Decision**: Use D3.js for DOM manipulation within Angular component lifecycle hooks

**Rationale**:
- D3.js excels at SVG manipulation and data binding
- Angular provides component structure and reactive state management
- Integration pattern: D3.js manipulates SVG in `ngAfterViewInit` and `ngOnChanges`
- Use `ElementRef` to get SVG container reference, let D3 handle SVG generation

**Implementation Pattern**:
```typescript
// In component
@ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

ngAfterViewInit() {
  this.initializeSVG();
}

ngOnChanges(changes: SimpleChanges) {
  if (changes['config'] && !changes['config'].firstChange) {
    this.updateVisualization();
  }
}

private initializeSVG() {
  const svg = d3.select(this.svgContainer.nativeElement);
  // D3 operations here
}
```

**Alternatives Considered**:
- **Pure Angular templates**: Rejected - verbose for complex SVG, poor performance for 500+ elements
- **Canvas API**: Rejected - requirement is SVG for scalability, Canvas doesn't support DOM events naturally
- **Third-party Angular-D3 wrappers**: Rejected - adds unnecessary abstraction, D3.js v7 is straightforward

**References**:
- D3.js v7 documentation: https://d3js.org/
- Angular ElementRef: https://angular.io/api/core/ElementRef

---

### 2. SVG Coordinate Scaling and Viewport Management

**Decision**: Use D3 scale functions (scaleLinear) with viewBox for automatic scaling

**Rationale**:
- `scaleLinear()` maps data coordinates to screen coordinates
- SVG `viewBox` attribute handles responsive scaling automatically
- D3 zoom behavior provides smooth pan/zoom with correct coordinate transforms
- Maintains aspect ratio while fitting content to viewport

**Implementation Approach**:
```typescript
// Calculate bounds from all regions
const xExtent = d3.extent(regions, d => d.x);
const yExtent = d3.extent(regions, d => d.y);

// Create scales with padding
const xScale = d3.scaleLinear()
  .domain([xExtent[0] - padding, xExtent[1] + width + padding])
  .range([0, svgWidth]);

const yScale = d3.scaleLinear()
  .domain([yExtent[0] - padding, yExtent[1] + height + padding])
  .range([0, svgHeight]);

// Apply viewBox for responsiveness
svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
   .attr('preserveAspectRatio', 'xMidYMid meet');
```

**Zoom/Pan Strategy**:
- Use `d3.zoom()` behavior attached to SVG
- Transform only the content `<g>` element, not entire SVG
- Constrain zoom extent to prevent over-zoom
- Provide reset button to return to initial view

**Alternatives Considered**:
- **Manual matrix transforms**: Rejected - error-prone, D3 zoom handles edge cases
- **CSS transforms**: Rejected - doesn't work well with SVG coordinate systems
- **Fixed viewport without zoom**: Rejected - requirement FR-008 mandates zoom/pan controls

**References**:
- D3 scales: https://d3js.org/d3-scale
- D3 zoom: https://d3js.org/d3-zoom
- SVG viewBox: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

---

### 3. Performance Optimization for 500+ Regions

**Decision**: Use D3 data join pattern with virtual scrolling considerations, optimize with CSS

**Rationale**:
- D3's `enter-update-exit` pattern efficiently handles DOM updates
- SVG rendering is generally fast for 500 elements with proper structure
- CSS optimizations (will-change, transform) improve pan/zoom performance
- Avoid unnecessary redraws by tracking changed data

**Performance Techniques**:
1. **Efficient Data Joins**:
   ```typescript
   const rects = svg.selectAll('rect.region')
     .data(regions, d => d.id);  // Key function for identity

   rects.enter()
     .append('rect')
     .attr('class', 'region')
     .merge(rects)  // Combine enter + update
     .attr('x', d => xScale(d.x))
     .attr('y', d => yScale(d.y));

   rects.exit().remove();
   ```

2. **CSS Optimizations**:
   ```css
   .region {
     will-change: transform;  /* GPU acceleration for zoom */
   }

   svg {
     shape-rendering: optimizeSpeed;  /* Faster rendering */
   }
   ```

3. **Debounce Updates**:
   - Use RxJS `debounceTime` for config changes
   - Batch DOM updates within single animation frame

**Measurement Strategy**:
- Use Chrome DevTools Performance profiler
- Target: <1000ms initial render, <200ms updates (per success criteria)
- Monitor: Paint time, Layout time, JavaScript execution

**Alternatives Considered**:
- **Canvas fallback**: Rejected - loses SVG benefits (DOM events, scalability)
- **Virtual scrolling/windowing**: Rejected - all 500 regions should be visible simultaneously for overview
- **Web Workers for calculations**: Rejected - overhead exceeds benefit for this scale

**References**:
- D3 data joins: https://d3js.org/d3-selection/joining
- Browser rendering performance: https://developer.chrome.com/docs/devtools/performance/

---

### 4. Real-Time Configuration Updates

**Decision**: Use Angular reactive patterns (RxJS) with D3 update pattern

**Rationale**:
- Angular's change detection triggers updates automatically
- RxJS observables handle async configuration changes
- D3's data join pattern makes incremental updates efficient
- Separation of concerns: Angular manages state, D3 manages visualization

**Implementation Pattern**:
```typescript
// Service with reactive config
export class LayoutConfigService {
  private configSubject = new BehaviorSubject<LayoutConfig>({ regions: [] });
  config$ = this.configSubject.asObservable();

  updateConfig(config: LayoutConfig) {
    this.configSubject.next(config);
  }
}

// Component subscribes and triggers D3 update
ngOnInit() {
  this.configService.config$
    .pipe(debounceTime(100))  // Debounce rapid changes
    .subscribe(config => {
      this.updateVisualization(config);
    });
}
```

**Update Strategy**:
- **Full redraw**: For complete config replacement (different number of regions)
- **Incremental update**: For coordinate/property changes (same regions, different positions)
- **Transition animations**: Use D3 transitions for smooth updates (200ms duration)

**Alternatives Considered**:
- **Two-way binding with Angular templates**: Rejected - performance issues with 500+ elements
- **Immutable.js for state**: Rejected - unnecessary complexity for this use case
- **Manual dirty checking**: Rejected - Angular's change detection is sufficient

**References**:
- RxJS BehaviorSubject: https://rxjs.dev/api/index/class/BehaviorSubject
- D3 transitions: https://d3js.org/d3-transition

---

## Technology Stack Decisions

### Core Dependencies

| Dependency | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Angular | 18.x (latest) | Component framework | Per constitution requirement |
| TypeScript | 5.x | Type-safe development | Per constitution requirement (strict mode) |
| D3.js | 7.9+ | SVG manipulation | Industry standard for data visualization |
| RxJS | 7.x | Reactive state management | Bundled with Angular |

### Development Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Jasmine/Karma | Angular defaults | Unit testing |
| @types/d3 | Latest | TypeScript definitions for D3 |

### Why D3.js v7?

- **Modular**: Import only needed modules (d3-select, d3-scale, d3-zoom)
- **TypeScript-friendly**: Full type definitions available
- **No jQuery dependency**: Pure vanilla JS
- **Active maintenance**: Latest stable version with modern ESM support

---

## Architecture Decisions

### Component Hierarchy

```
BuildingLayoutComponent (Container)
├── ViewportControlsComponent (Zoom/Pan/Reset buttons)
├── SVG Container (managed by D3)
└── RegionInfoTooltipComponent (Shows region details on hover)
```

**Rationale**:
- Separation of concerns (controls vs visualization)
- Reusable tooltip component
- D3 owns SVG DOM, Angular owns component structure

### State Management

**Decision**: Service-based state management (no NgRx/Akita)

**Rationale**:
- Simple feature doesn't warrant full state management library
- RxJS BehaviorSubject provides reactive updates
- Keeps architecture lightweight per constitution (avoid over-engineering)

### Data Flow

```
User Input → LayoutConfigService
                ↓
            config$ Observable
                ↓
         Component subscribes
                ↓
      D3 updates visualization
```

---

## Open Questions Resolved

**Q: Should we support undo/redo for configuration changes?**
**A**: No - out of scope per spec assumptions. Configuration is provided as structured data, not interactively edited.

**Q: How to handle touch events for mobile pan/zoom?**
**A**: D3 zoom behavior handles touch events automatically. Test on mobile browsers to verify smooth performance (30fps target).

**Q: Should regions be draggable?**
**A**: No - per "Out of Scope" section: no interactive drawing or editing. This is a visualization-only feature.

**Q: How to export layouts as images?**
**A**: Out of scope per spec. Future enhancement could use SVG-to-PNG libraries if needed.

---

## Next Steps

1. ✅ Research complete - proceed to Phase 1 (Data Model & Contracts)
2. Create detailed data models for Region, LayoutConfig, Viewport
3. Define component contracts (inputs/outputs/events)
4. Generate quickstart guide for running the example
5. Update agent context with D3.js knowledge

---

## References & Resources

- **D3.js Official Docs**: https://d3js.org/
- **Angular Best Practices**: https://angular.io/guide/styleguide
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **SVG Specification**: https://www.w3.org/TR/SVG2/
- **Observable D3 Tutorials**: https://observablehq.com/@d3/gallery
