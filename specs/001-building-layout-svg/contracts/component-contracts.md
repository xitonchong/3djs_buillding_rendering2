# Component Contracts: Building Layout Visualization

**Feature**: Building Layout SVG Visualization
**Date**: 2025-12-04
**Purpose**: Define public API contracts for all components and services

## Component Contracts

### 1. BuildingLayoutComponent

Main container component that orchestrates the visualization.

**Selector**: `app-building-layout`

#### Inputs

```typescript
@Input() config: LayoutConfiguration;
// The layout configuration to visualize
// Changes trigger re-render via ngOnChanges
// Default: { regions: [] } (empty layout)

@Input() width?: number;
// Viewport width in pixels
// Default: 800

@Input() height?: number;
// Viewport height in pixels
// Default: 600

@Input() showControls?: boolean;
// Whether to display viewport controls (zoom/pan/reset)
// Default: true

@Input() enableInteraction?: boolean;
// Whether regions are interactive (hover/click)
// Default: true
```

#### Outputs

```typescript
@Output() regionHover = new EventEmitter<RegionInteraction | null>();
// Emits when user hovers over a region (null when leaving)
// Payload includes region data and mouse position

@Output() regionClick = new EventEmitter<RegionInteraction>();
// Emits when user clicks on a region
// Payload includes region data and click position

@Output() viewportChange = new EventEmitter<Viewport>();
// Emits when viewport changes (zoom/pan)
// Payload includes current viewport state

@Output() renderComplete = new EventEmitter<void>();
// Emits when initial render completes
// Useful for testing and performance monitoring
```

#### Public Methods

```typescript
resetViewport(): void
// Reset zoom/pan to initial fit-to-bounds view
// Can be called programmatically by parent component

zoomIn(factor?: number): void
// Zoom in by specified factor (default: 1.2)
// Constrainedby maxScale in viewport

zoomOut(factor?: number): void
// Zoom out by specified factor (default: 1.2)
// Constrained by minScale in viewport

exportSVG(): string
// Returns the current SVG as string (for testing/debugging)
// Does not include external stylesheets
```

#### Usage Example

```typescript
// In parent component template
<app-building-layout
  [config]="layoutConfig"
  [width]="1024"
  [height]="768"
  [showControls]="true"
  [enableInteraction]="true"
  (regionHover)="onRegionHover($event)"
  (regionClick)="onRegionClick($event)"
  (viewportChange)="onViewportChange($event)"
  (renderComplete)="onRenderComplete()"
></app-building-layout>

// In parent component class
layoutConfig: LayoutConfiguration = {
  regions: [
    { id: 'r1', x: 0, y: 0, width: 100, height: 100, label: 'Room 1' }
  ]
};

onRegionHover(interaction: RegionInteraction | null): void {
  if (interaction) {
    console.log('Hovered region:', interaction.region.label);
  }
}
```

---

### 2. ViewportControlsComponent

UI controls for zoom, pan, and reset operations.

**Selector**: `app-viewport-controls`

#### Inputs

```typescript
@Input() viewport: Viewport;
// Current viewport state (for display/constraints)
// Used to determine if zoom limits reached

@Input() position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
// Position of controls within parent
// Default: 'top-right'

@Input() disabled?: boolean;
// Disable all controls
// Default: false
```

#### Outputs

```typescript
@Output() zoomIn = new EventEmitter<void>();
// Emits when zoom in button clicked

@Output() zoomOut = new EventEmitter<void>();
// Emits when zoom out button clicked

@Output() reset = new EventEmitter<void>();
// Emits when reset button clicked
```

#### UI Composition

```
┌─────────────────┐
│  [+] Zoom In    │
│  [-] Zoom Out   │
│  [⟲] Reset      │
└─────────────────┘
```

#### Usage Example

```typescript
<app-viewport-controls
  [viewport]="currentViewport"
  [position]="'top-right'"
  (zoomIn)="handleZoomIn()"
  (zoomOut)="handleZoomOut()"
  (reset)="handleReset()"
></app-viewport-controls>
```

---

### 3. RegionInfoTooltipComponent

Displays region information on hover.

**Selector**: `app-region-info-tooltip`

#### Inputs

```typescript
@Input() region: Region | null;
// Region to display info for
// null hides the tooltip

@Input() position: { x: number; y: number };
// Mouse position for tooltip placement
// Coordinates are in viewport pixels

@Input() visible: boolean;
// Whether tooltip should be displayed
// Default: false
```

#### Outputs

(None - pure display component)

#### Display Template

```
┌──────────────────────┐
│ Room 101             │
│ ──────────────────── │
│ Position: (100, 50)  │
│ Size: 200 x 150      │
│ [Additional metadata]│
└──────────────────────┘
```

#### Usage Example

```typescript
<app-region-info-tooltip
  [region]="hoveredRegion"
  [position]="mousePosition"
  [visible]="isTooltipVisible"
></app-region-info-tooltip>
```

---

## Service Contracts

### 4. LayoutConfigService

Manages layout configuration state reactively.

#### Interface

```typescript
export class LayoutConfigService {
  // Observable configuration stream
  config$: Observable<LayoutConfiguration>;

  // Current configuration snapshot
  get currentConfig(): LayoutConfiguration;

  // Update entire configuration
  updateConfig(config: LayoutConfiguration): void;

  // Update single region
  updateRegion(regionId: string, updates: Partial<Region>): void;

  // Add new region
  addRegion(region: Region): void;

  // Remove region
  removeRegion(regionId: string): void;

  // Validate configuration
  validateConfig(config: LayoutConfiguration): ValidationResult;

  // Load configuration from JSON
  loadFromJSON(json: string): ValidationResult;

  // Export configuration as JSON
  exportToJSON(): string;
}
```

#### Usage Example

```typescript
constructor(private configService: LayoutConfigService) {}

ngOnInit() {
  // Subscribe to config changes
  this.configService.config$
    .pipe(debounceTime(100))
    .subscribe(config => {
      this.renderLayout(config);
    });
}

updateLayout() {
  const newConfig: LayoutConfiguration = {
    regions: [/* ... */]
  };
  this.configService.updateConfig(newConfig);
}
```

---

### 5. SvgRendererService

Handles D3.js SVG rendering and updates.

#### Interface

```typescript
export class SvgRendererService {
  // Initialize SVG canvas
  initialize(
    container: ElementRef,
    width: number,
    height: number
  ): void;

  // Render layout configuration
  render(
    config: LayoutConfiguration,
    viewport: Viewport
  ): void;

  // Update viewport transform (zoom/pan)
  updateViewport(viewport: Viewport): void;

  // Highlight region (hover effect)
  highlightRegion(regionId: string | null): void;

  // Set up interaction handlers
  setupInteractions(
    onHover: (region: Region | null, event: MouseEvent) => void,
    onClick: (region: Region, event: MouseEvent) => void
  ): void;

  // Calculate initial fit-to-bounds viewport
  calculateFitViewport(config: LayoutConfiguration): Viewport;

  // Export current SVG as string
  exportSVG(): string;

  // Clean up D3 resources
  destroy(): void;
}
```

#### Usage Example

```typescript
constructor(private renderer: SvgRendererService) {}

ngAfterViewInit() {
  this.renderer.initialize(this.svgContainer, 800, 600);
  this.renderer.setupInteractions(
    (region, event) => this.onRegionHover(region, event),
    (region, event) => this.onRegionClick(region, event)
  );
  this.renderer.render(this.config, this.viewport);
}

ngOnChanges(changes: SimpleChanges) {
  if (changes['config'] && !changes['config'].firstChange) {
    this.renderer.render(this.config, this.viewport);
  }
}

ngOnDestroy() {
  this.renderer.destroy();
}
```

---

## Utility Contracts

### 6. CoordinateValidator

Static utility for validating coordinates and regions.

#### Interface

```typescript
export class CoordinateValidator {
  // Validate region per FR-002
  static validateRegion(region: Region): ValidationResult;

  // Validate layout configuration per FR-001
  static validateLayout(config: LayoutConfiguration): ValidationResult;

  // Check if coordinate is non-negative
  static isValidCoordinate(value: number): boolean;

  // Check if dimension is positive
  static isValidDimension(value: number): boolean;

  // Check for duplicate region IDs
  static hasDuplicateIds(regions: Region[]): boolean;
}
```

---

### 7. ScaleCalculator

Calculates scaling factors for auto-fit and zoom operations.

#### Interface

```typescript
export class ScaleCalculator {
  // Calculate scales to fit layout in viewport
  static calculateFitScales(
    layout: LayoutConfiguration,
    viewportWidth: number,
    viewportHeight: number,
    padding?: number
  ): { xScale: d3.ScaleLinear, yScale: d3.ScaleLinear };

  // Calculate bounding box for layout
  static calculateBounds(config: LayoutConfiguration): BoundingBox;

  // Calculate scale factor for zoom operation
  static calculateZoomScale(
    currentScale: number,
    zoomFactor: number,
    minScale: number,
    maxScale: number
  ): number;
}
```

---

### 8. BoundsCalculator

Calculates bounding boxes for regions and layouts.

#### Interface

```typescript
export class BoundsCalculator {
  // Calculate bounds for single region
  static getRegionBounds(region: Region): BoundingBox;

  // Calculate bounds encompassing all regions
  static getLayoutBounds(config: LayoutConfiguration): BoundingBox;

  // Calculate visible bounds given viewport
  static getVisibleBounds(viewport: Viewport): BoundingBox;

  // Check if region is visible in viewport
  static isRegionVisible(
    region: Region,
    viewport: Viewport
  ): boolean;
}
```

---

## Event Contracts

### RegionInteraction Event

Emitted for region hover and click events.

```typescript
export interface RegionInteraction {
  region: Region;                    // The interacted region
  event: MouseEvent | TouchEvent;    // Original DOM event
  action: 'hover' | 'click' | 'leave'; // Interaction type
  position: {                        // Position in SVG coordinates
    x: number;
    y: number;
  };
}
```

**When Emitted**:
- `hover`: Mouse enters region boundary
- `leave`: Mouse exits region boundary (region will be null)
- `click`: Mouse click within region boundary

---

### Viewport Change Event

Emitted when viewport transform changes.

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

**When Emitted**:
- User zooms in/out
- User pans the view
- Viewport reset is triggered
- Window resize (if viewport adapts)

---

## Error Handling Contracts

### Validation Errors

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

**Error Message Formats**:
- `"Region ID is required"`
- `"Region x coordinate must be non-negative (got: -5)"`
- `"Duplicate region ID: room-101"`
- `"Invalid color: not-a-color"`

### Runtime Errors

Component should handle these gracefully:

1. **Empty Configuration**: Display message "No regions to display"
2. **Invalid Configuration**: Display validation errors in UI
3. **Rendering Error**: Log to console, emit error event (future enhancement)
4. **D3 Initialization Failure**: Fallback to static SVG or error message

---

## Testing Contracts

### Component Testing

```typescript
describe('BuildingLayoutComponent', () => {
  it('should render all regions from configuration', () => {
    // Given: config with 3 regions
    // When: component initialized
    // Then: SVG contains 3 rect elements
  });

  it('should emit regionClick when region is clicked', () => {
    // Given: rendered layout
    // When: user clicks region
    // Then: regionClick event emitted with correct region data
  });

  it('should update visualization when config input changes', () => {
    // Given: initial config rendered
    // When: config input updated
    // Then: SVG updates to reflect new config
  });
});
```

### Service Testing

```typescript
describe('LayoutConfigService', () => {
  it('should validate configuration before update', () => {
    // Given: invalid configuration
    // When: updateConfig called
    // Then: validation error thrown/returned
  });

  it('should emit updated config via observable', () => {
    // Given: subscribed to config$
    // When: updateConfig called
    // Then: observer receives new config
  });
});
```

---

## Performance Contracts

### Render Performance (from SC-002)

- **Initial Render**: <1000ms for 500 regions
- **Update Render**: <200ms for configuration changes (from SC-006)
- **Zoom/Pan**: 60fps smooth animation

### Memory Constraints

- No memory leaks from D3 event listeners (must clean up in ngOnDestroy)
- Efficient data joins (reuse existing SVG elements where possible)

---

## Accessibility Contracts

### Keyboard Navigation

- Tab through interactive regions
- Enter/Space to "click" focused region
- +/- keys for zoom in/out
- Arrow keys for pan (future enhancement)

### Screen Reader Support

- SVG elements have `aria-label` attributes
- Region labels read on focus
- Viewport state announced on change

### Visual Accessibility

- Minimum color contrast ratio: 4.5:1
- Default colors meet WCAG AA standards
- Hover states clearly visible
- Focus indicators for keyboard navigation

---

## Next Steps

1. ✅ Contracts defined - proceed to quickstart.md generation
2. Generate quickstart guide for running the example
3. Update agent context with project knowledge
