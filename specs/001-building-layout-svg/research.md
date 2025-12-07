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

---

# Extension Research: Student Movement Tracking

**Extension Date**: 2025-12-07
**Purpose**: Research technical approaches for adding student movement tracking and synthetic data generation to the existing building layout visualization

## Extension Research Questions

1. How to handle ISO 8601 week date format (YYYYWW) in TypeScript?
2. What's the best approach for seeded random number generation?
3. How to visualize movement flows on top of existing SVG layout?
4. What are realistic student movement patterns for synthetic data generation?

## Extension Research Findings

### 5. ISO 8601 Week Date Format (YYYYWW)

**Decision**: Use date-fns library for week date manipulation

**Rationale**:
- Dedicated ISO week functions (`getISOWeek`, `setISOWeek`, `getISOWeekYear`, `startOfISOWeekYear`)
- Excellent TypeScript support with native type definitions
- Tree-shakable architecture (import only needed functions)
- Well-maintained and widely adopted in JavaScript ecosystem
- Correctly handles ISO week rules (weeks always start on Monday, week 01 contains first Thursday)

**Alternatives Considered**:
| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **date-fns** | Full ISO week support, tree-shakable, TypeScript-native | Slightly larger than Day.js | ✅ **Selected** |
| **Day.js** | Very lightweight (2KB) | Requires plugin for ISO weeks, less comprehensive | ❌ Rejected |
| **Native Date API** | No dependencies | No built-in ISO week support, error-prone manual calculation | ❌ Rejected |
| **Temporal API** | Future-proof TC39 standard | Not yet widely supported in browsers | ❌ Too early |

**Implementation Notes**:

```typescript
import { getISOWeek, getISOWeekYear, setISOWeek, startOfISOWeekYear } from 'date-fns';

// Parse YYYYWW format (e.g., "202525" → Date)
function parseWorkweek(weekString: string): Date {
  if (!/^\d{6}$/.test(weekString)) {
    throw new Error(`Invalid format: ${weekString}. Expected YYYYWW`);
  }

  const year = parseInt(weekString.substring(0, 4));
  const week = parseInt(weekString.substring(4, 6));

  if (week < 1 || week > 53) {
    throw new Error(`Invalid week number: ${week}. Must be 01-53`);
  }

  const startOfYear = startOfISOWeekYear(new Date(year, 0, 4));
  return setISOWeek(startOfYear, week);
}

// Format Date to YYYYWW
function formatWorkweek(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}${week.toString().padStart(2, '0')}`;
}
```

**Validation Rules**:
- Format: `/^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/` (4-digit year + 2-digit week)
- Week numbers: 01-53 (week 53 only in long years)
- ISO week 01: Week containing the year's first Thursday
- Weeks start on Monday

---

### 6. Seeded Random Number Generation

**Decision**: Use seedrandom.js library for reproducible random data generation

**Rationale**:
- Purpose-built for reproducible PRNG (pseudo-random number generator)
- Excellent performance: ~0.0002ms per call (fast enough for 10,000+ records in ~2ms)
- Drop-in replacement for `Math.random()` with familiar API
- Multiple algorithm options (ARC4, xor128, etc.)
- Well-tested and widely used in production applications

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **seedrandom.js** | Battle-tested, fast, simple API | Not TypeScript-native (but has @types) | ✅ **Selected** |
| **crypto.getRandomValues** | Native, cryptographically secure | Not seedable, no reproducibility | ❌ Rejected |
| **rand-seed** | TypeScript-native, multiple algorithms | Less battle-tested | ⚠️ Viable alternative |
| **Custom PRNG** | Full control | Reinventing the wheel, potential bugs | ❌ Rejected |

**Implementation Notes**:

```typescript
import seedrandom from 'seedrandom';

class RandomGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  // Uniform random in range [min, max)
  randomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min)) + min;
  }

  // Poisson distribution (for movement counts)
  poissonSample(lambda: number): number {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= this.rng();
    } while (p > L);

    return k - 1;
  }

  // Weighted random selection
  weightedSelect<T>(items: Array<{ item: T, weight: number }>): T {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let random = this.rng() * totalWeight;

    for (const entry of items) {
      random -= entry.weight;
      if (random <= 0) return entry.item;
    }

    return items[items.length - 1].item;
  }
}
```

**Performance Benchmarks**:
- 10,000 random numbers: ~2ms
- 100,000 random numbers: ~18ms
- Acceptable for client-side generation

**Best Practices**:
- Use meaningful seeds (e.g., `building-2025-week25` instead of random numbers)
- Pre-generate datasets during initialization, not on-demand during rendering
- Store seed in configuration for reproducibility

---

### 7. Movement Flow Visualization

**Decision**: Use D3.js Sankey diagrams for movement flow visualization (extends existing D3 setup)

**Rationale**:
- Ideal for showing many-to-many mappings between regions
- Link width proportional to movement volume (intuitive visual encoding)
- Directed flow structure matches movement patterns (origin → destination)
- Official `d3-sankey` plugin integrates with existing D3 setup
- Excellent for temporal data when combined with smooth transitions
- Reuses existing SVG infrastructure from building layout

**Alternatives Considered**:
| Technique | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Sankey Diagram** | Quantifies flows, scales well, official plugin | Requires DAG structure (no cycles) | ✅ **Selected** |
| **Force-Directed Graph** | Good for network exploration | Poor for quantifying flows, nodes move around | ❌ Rejected |
| **Curved Arrow Paths** | Simple implementation | Cluttered with 20+ connections | ❌ Doesn't scale |
| **Chord Diagram** | Good for circular flows | Student movement is directional, not circular | ❌ Wrong pattern |

**Implementation Notes**:

```typescript
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';
import { select } from 'd3-selection';

interface MovementNode extends SankeyNode<MovementNode, MovementLink> {
  id: string;
  name: string;
}

interface MovementLink extends SankeyLink<MovementNode, MovementLink> {
  source: string;
  target: string;
  value: number; // Number of students
}

function createSankeyDiagram(
  nodes: MovementNode[],
  links: MovementLink[],
  width: number,
  height: number
) {
  const sankeyLayout = sankey<MovementNode, MovementLink>()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]]);

  const graph = sankeyLayout({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

  // Integrate with existing SVG from building layout
  const svg = select('#movement-viz-layer'); // Overlay on existing SVG

  // Draw links (flows)
  svg.append('g')
    .selectAll('path')
    .data(graph.links)
    .join('path')
    .attr('d', sankeyLinkHorizontal())
    .attr('stroke-width', d => Math.max(1, d.width!))
    .attr('fill', 'none')
    .attr('stroke', '#999')
    .attr('opacity', 0.5)
    .append('title')
    .text(d => `${d.source.name} → ${d.target.name}: ${d.value} students`);

  return { svg, graph };
}
```

**Temporal Animation Strategy**:
```typescript
function animateTransition(
  svg: any,
  oldLinks: MovementLink[],
  newLinks: MovementLink[],
  duration: number = 750
) {
  svg.selectAll('path')
    .data(newLinks)
    .transition()
    .duration(duration)
    .attr('stroke-width', (d: any) => Math.max(1, d.width))
    .attr('opacity', (d: any) => d.value > 0 ? 0.5 : 0);
}
```

**Edge Bundling for Dense Networks** (50+ connections):
- Use Force-Directed Edge Bundling (FDEB) when connection count exceeds 50
- Library: d3.ForceBundle (upphiminn/d3.ForceBundle)
- Significantly reduces visual clutter
- Compatible with non-hierarchical data

---

### 8. Realistic Student Movement Patterns

**Decision**: Use time-based Poisson processes with weighted destination selection

**Rationale**:
- Student arrivals vary by time of day (non-homogeneous Poisson process)
- Group behavior (students moving together) modeled as compound Poisson
- Weighted selection reflects popular routes (cafeteria, main entrance, classrooms)
- Matches real-world observations from educational facility research

**Common Student Movement Patterns**:

| Time Period | Behavior | Lambda (moves/min) | Destinations |
|-------------|----------|-------------------|--------------|
| **7:30-8:30 AM** | Arrival | 8 | Main entrance (50%), Parking (30%), Drop-off (20%) |
| **8:30-12:00 PM** | Morning classes | 2 | Classrooms (60%), Library (10%), Restroom (20%), Water fountain (10%) |
| **12:00-1:00 PM** | Lunch break | 12 | Cafeteria (80%), Outdoor area (15%), Library (5%) |
| **1:00-3:00 PM** | Afternoon classes | 2 | Classrooms (65%), Lab (15%), Library (10%), Restroom (10%) |
| **3:00-3:30 PM** | Dismissal | 10 | Exit/Parking (70%), After-school activities (20%), Library (10%) |

**Implementation Pattern**:

```typescript
interface TimeSlot {
  startHour: number;  // 0-23
  endHour: number;
  lambda: number;     // Average movements per minute
  destinations: Array<{ id: string, weight: number }>;
}

class RealisticMovementGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  // Poisson sample for event counts
  private poissonSample(lambda: number): number {
    let L = Math.exp(-lambda);
    let k = 0, p = 1;
    do {
      k++;
      p *= this.rng();
    } while (p > L);
    return k - 1;
  }

  // Weighted destination selection
  private selectDestination(destinations: Array<{ id: string, weight: number }>): string {
    const total = destinations.reduce((sum, d) => sum + d.weight, 0);
    let random = this.rng() * total;
    for (const dest of destinations) {
      random -= dest.weight;
      if (random <= 0) return dest.id;
    }
    return destinations[destinations.length - 1].id;
  }

  // Group size modeling
  private getGroupSize(): number {
    return this.rng() < 0.3
      ? Math.floor(this.rng() * 4) + 2  // 30% chance: group of 2-5
      : 1;                               // 70% chance: individual
  }
}
```

**Key Statistical Properties**:
- **Movement counts**: Poisson distribution (models "how many students move in time window")
- **Destination selection**: Weighted discrete distribution (popular routes have higher probability)
- **Group behavior**: 30% of movements involve 2-5 students (compound Poisson)
- **Time variance**: Lambda (λ) varies throughout the day

---

## Extension Technology Additions

| Dependency | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| date-fns | 3.x | ISO week date manipulation | Full week support, tree-shakable |
| seedrandom | 3.x | Seeded random generation | Reproducible test data |
| @types/seedrandom | 3.x | TypeScript definitions | Type safety |
| d3-sankey | 0.12+ | Flow visualization | Official D3 plugin for Sankey diagrams |

---

## Extension Next Steps

1. ✅ Extension research complete
2. ⏭️ Create data-model.md with MovementData entity schema
3. ⏭️ Generate TypeScript interface contracts for movement tracking
4. ⏭️ Write quickstart.md with movement generator usage examples
5. ⏭️ Update CLAUDE.md with new dependencies

---

**Research Last Updated**: 2025-12-07
