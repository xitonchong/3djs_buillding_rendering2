# Data Model: Building Layout Visualization

**Feature**: Building Layout SVG Visualization
**Date**: 2025-12-04
**Source**: Derived from spec.md Key Entities and functional requirements

## Core Entities

### 1. Region

Represents a single rectangular area within the building layout.

**TypeScript Interface**:
```typescript
export interface Region {
  // Identity
  id: string;                    // Unique identifier (required)

  // Position & Dimensions (required)
  x: number;                     // Top-left X coordinate (non-negative)
  y: number;                     // Top-left Y coordinate (non-negative)
  width: number;                 // Region width (positive)
  height: number;                // Region height (positive)

  // Optional Metadata
  label?: string;                // Human-readable label (e.g., "Room 101")
  color?: string;                // Fill color (CSS color string)
  strokeColor?: string;          // Border color (CSS color string)
  metadata?: Record<string, any>; // Additional custom properties
}
```

**Validation Rules** (from FR-002):
- `x >= 0` (non-negative)
- `y >= 0` (non-negative)
- `width > 0` (positive)
- `height > 0` (positive)
- `id` must be unique within a layout
- `color` and `strokeColor` must be valid CSS color strings if provided

**Calculated Properties**:
```typescript
// Derived bounds (not stored, computed on-demand)
right: number  // x + width
bottom: number // y + height
centerX: number // x + width / 2
centerY: number // y + height / 2
```

**Example**:
```json
{
  "id": "room-101",
  "x": 100,
  "y": 50,
  "width": 200,
  "height": 150,
  "label": "Conference Room A",
  "color": "#E3F2FD",
  "strokeColor": "#1976D2",
  "metadata": {
    "capacity": 12,
    "floor": 1,
    "type": "conference"
  }
}
```

---

### 2. LayoutConfiguration

Collection of regions defining the complete building layout.

**TypeScript Interface**:
```typescript
export interface LayoutConfiguration {
  // Content
  regions: Region[];                     // Array of regions (required)

  // Optional Metadata
  name?: string;                         // Layout name (e.g., "Building A - Floor 1")
  description?: string;                  // Human-readable description
  metadata?: {
    buildingName?: string;
    floorNumber?: number;
    units?: string;                      // Coordinate units (e.g., "meters", "feet", "pixels")
    createdAt?: string;                  // ISO timestamp
    modifiedAt?: string;                 // ISO timestamp
    [key: string]: any;                  // Additional custom properties
  };
}
```

**Validation Rules** (from FR-001, FR-002):
- `regions` array must not be null (can be empty)
- All regions must have unique IDs
- All regions must pass individual Region validation
- Overlapping regions are allowed (no collision detection required)

**Calculated Properties**:
```typescript
// Bounding box encompassing all regions
bounds: {
  minX: number;  // Minimum X coordinate across all regions
  minY: number;  // Minimum Y coordinate across all regions
  maxX: number;  // Maximum X + width across all regions
  maxY: number;  // Maximum Y + height across all regions
  width: number;  // maxX - minX
  height: number; // maxY - minY
}
```

**Example**:
```json
{
  "name": "Building A - Floor 1",
  "description": "First floor layout with conference rooms and offices",
  "regions": [
    { "id": "room-101", "x": 0, "y": 0, "width": 300, "height": 200, "label": "Room 101" },
    { "id": "room-102", "x": 300, "y": 0, "width": 300, "height": 200, "label": "Room 102" },
    { "id": "hallway", "x": 0, "y": 200, "width": 600, "height": 100, "label": "Hallway" }
  ],
  "metadata": {
    "buildingName": "Main Office",
    "floorNumber": 1,
    "units": "feet",
    "createdAt": "2025-12-04T10:00:00Z"
  }
}
```

---

### 3. Viewport

Represents the current view state of the visualization (zoom level, pan position).

**TypeScript Interface**:
```typescript
export interface Viewport {
  // Transform state
  scale: number;           // Zoom level (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
  translateX: number;      // Pan offset X (in scaled coordinates)
  translateY: number;      // Pan offset Y (in scaled coordinates)

  // Viewport dimensions
  width: number;           // Viewport width in pixels
  height: number;          // Viewport height in pixels

  // Constraints
  minScale: number;        // Minimum zoom (e.g., 0.1 = 10%)
  maxScale: number;        // Maximum zoom (e.g., 10.0 = 1000%)
}
```

**Validation Rules** (from FR-008):
- `scale >= minScale` and `scale <= maxScale`
- `minScale > 0`
- `maxScale > minScale`
- `width > 0` and `height > 0`

**Default Values**:
```typescript
const DEFAULT_VIEWPORT: Viewport = {
  scale: 1.0,
  translateX: 0,
  translateY: 0,
  width: 800,
  height: 600,
  minScale: 0.1,
  maxScale: 10.0
};
```

**State Transitions**:
- **Zoom In**: `scale *= zoomFactor` (constrained by maxScale)
- **Zoom Out**: `scale /= zoomFactor` (constrained by minScale)
- **Pan**: `translateX += deltaX, translateY += deltaY`
- **Reset**: Return to initial fit-to-bounds state

**Example**:
```json
{
  "scale": 1.5,
  "translateX": -100,
  "translateY": -50,
  "width": 1024,
  "height": 768,
  "minScale": 0.1,
  "maxScale": 10.0
}
```

---

## Supporting Types

### 4. ViewportTransform

D3 zoom transform state (managed by d3.zoom behavior).

**TypeScript Interface**:
```typescript
import { ZoomTransform } from 'd3-zoom';

// D3's built-in transform type
// { k: scale, x: translateX, y: translateY }
// We wrap or extend this as needed
```

**Usage**: Internal to SVG rendering service, converts to/from Viewport model.

---

### 5. BoundingBox

Calculated bounding box for layout or individual regions.

**TypeScript Interface**:
```typescript
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;   // maxX - minX
  height: number;  // maxY - minY
}
```

**Usage**: Auto-scaling calculations, initial viewport fitting.

---

### 6. RegionInteraction

Event payload for region interactions (hover, click).

**TypeScript Interface**:
```typescript
export interface RegionInteraction {
  region: Region;              // The interacted region
  event: MouseEvent | TouchEvent; // Original DOM event
  action: 'hover' | 'click' | 'leave'; // Interaction type
  position: {                  // Mouse/touch position in SVG coordinates
    x: number;
    y: number;
  };
}
```

**Usage**: Component event emissions for tooltip display, analytics tracking.

---

## Validation Logic

### Region Validator

**Purpose**: Validate Region objects per FR-002

**TypeScript Implementation**:
```typescript
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class RegionValidator {
  static validate(region: Region): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!region.id || region.id.trim() === '') {
      errors.push('Region ID is required');
    }
    if (typeof region.x !== 'number') {
      errors.push('Region x coordinate must be a number');
    }
    if (typeof region.y !== 'number') {
      errors.push('Region y coordinate must be a number');
    }
    if (typeof region.width !== 'number') {
      errors.push('Region width must be a number');
    }
    if (typeof region.height !== 'number') {
      errors.push('Region height must be a number');
    }

    // Value constraints
    if (region.x < 0) {
      errors.push('Region x coordinate must be non-negative');
    }
    if (region.y < 0) {
      errors.push('Region y coordinate must be non-negative');
    }
    if (region.width <= 0) {
      errors.push('Region width must be positive');
    }
    if (region.height <= 0) {
      errors.push('Region height must be positive');
    }

    // Optional field validation
    if (region.color && !isValidCSSColor(region.color)) {
      errors.push(`Invalid color: ${region.color}`);
    }
    if (region.strokeColor && !isValidCSSColor(region.strokeColor)) {
      errors.push(`Invalid stroke color: ${region.strokeColor}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static isValidCSSColor(color: string): boolean {
    // Simplified validation - accepts hex, rgb, named colors
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  }
}
```

---

### Layout Configuration Validator

**Purpose**: Validate entire LayoutConfiguration per FR-001, FR-002

**TypeScript Implementation**:
```typescript
export class LayoutConfigValidator {
  static validate(config: LayoutConfiguration): ValidationResult {
    const errors: string[] = [];

    // Regions array required
    if (!Array.isArray(config.regions)) {
      errors.push('Regions must be an array');
      return { valid: false, errors };
    }

    // Validate each region
    const regionIds = new Set<string>();
    config.regions.forEach((region, index) => {
      const result = RegionValidator.validate(region);
      if (!result.valid) {
        errors.push(`Region ${index} (${region.id}): ${result.errors.join(', ')}`);
      }

      // Check for duplicate IDs
      if (regionIds.has(region.id)) {
        errors.push(`Duplicate region ID: ${region.id}`);
      }
      regionIds.add(region.id);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│ LayoutConfiguration │
│                     │
│ - name              │
│ - description       │
│ - metadata          │
└──────────┬──────────┘
           │ contains (1:N)
           │
           ▼
    ┌──────────┐
    │  Region  │
    │          │
    │ - id     │
    │ - x, y   │
    │ - width  │
    │ - height │
    │ - label  │
    │ - color  │
    └──────────┘

┌──────────────────┐
│    Viewport      │ (separate, managed by UI)
│                  │
│ - scale          │
│ - translateX/Y   │
│ - width/height   │
│ - minScale       │
│ - maxScale       │
└──────────────────┘
```

**Notes**:
- LayoutConfiguration → Region is one-to-many
- Viewport is independent state (not part of configuration persistence)
- No relationships between regions (no hierarchy or connections in v1)

---

## Persistence & Serialization

### JSON Schema (LayoutConfiguration)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "description": { "type": "string" },
    "regions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "x", "y", "width", "height"],
        "properties": {
          "id": { "type": "string", "minLength": 1 },
          "x": { "type": "number", "minimum": 0 },
          "y": { "type": "number", "minimum": 0 },
          "width": { "type": "number", "exclusiveMinimum": 0 },
          "height": { "type": "number", "exclusiveMinimum": 0 },
          "label": { "type": "string" },
          "color": { "type": "string" },
          "strokeColor": { "type": "string" },
          "metadata": { "type": "object" }
        }
      }
    },
    "metadata": { "type": "object" }
  },
  "required": ["regions"]
}
```

### Storage Strategy

**Current Implementation**:
- In-memory only (no persistence)
- Configuration passed as @Input to component
- Optional: localStorage for saving user-created configs (future enhancement)

**Future Considerations**:
- Backend API for shared layouts (out of scope for v1)
- IndexedDB for large configurations (out of scope for v1)

---

## Sample Data

### Minimal Configuration

```json
{
  "regions": [
    { "id": "r1", "x": 0, "y": 0, "width": 100, "height": 100 }
  ]
}
```

### Comprehensive Configuration

```json
{
  "name": "Office Layout Example",
  "description": "Sample building layout with multiple room types",
  "regions": [
    {
      "id": "reception",
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 200,
      "label": "Reception",
      "color": "#E8F5E9",
      "strokeColor": "#4CAF50"
    },
    {
      "id": "conf-room-1",
      "x": 0,
      "y": 200,
      "width": 300,
      "height": 250,
      "label": "Conference Room 1",
      "color": "#E3F2FD",
      "strokeColor": "#2196F3",
      "metadata": {
        "capacity": 10,
        "equipment": ["projector", "whiteboard"]
      }
    },
    {
      "id": "office-1",
      "x": 300,
      "y": 200,
      "width": 200,
      "height": 150,
      "label": "Office 101",
      "color": "#FFF3E0",
      "strokeColor": "#FF9800"
    },
    {
      "id": "hallway",
      "x": 0,
      "y": 450,
      "width": 500,
      "height": 100,
      "label": "Main Hallway",
      "color": "#F5F5F5",
      "strokeColor": "#9E9E9E"
    }
  ],
  "metadata": {
    "buildingName": "Tech Office Building",
    "floorNumber": 1,
    "units": "feet",
    "totalArea": 2500,
    "createdAt": "2025-12-04T12:00:00Z"
  }
}
```

---

## Next Steps

1. ✅ Data model defined - proceed to contracts generation
2. Define component input/output contracts
3. Define service method contracts
4. Generate API documentation (TypeDoc)

---

# Extension: Student Movement Tracking Data Model

**Extension Date**: 2025-12-07
**Purpose**: Data models for student movement tracking and synthetic data generation

## Movement Tracking Entities

### 7. MovementData

Represents a single movement record showing students moving from one region to another during a specific time period.

**TypeScript Interface**:
```typescript
export interface MovementData {
  // Identity
  id: string;                    // Unique identifier (required)

  // Movement Details
  fromRegion: string;            // Source region ID (required)
  toRegion: string;              // Destination region ID (required)
  moves: number;                 // Number of students (required, positive integer)

  // Temporal Information
  workweek: string;              // Format: YYYYWW (e.g., "202525" = 2025, week 25)
  timestamp?: Date;              // Optional: parsed date for sorting/filtering

  // Optional Metadata
  metadata?: {
    peakHour?: number;           // Hour of day (0-23) when movement occurred
    dayOfWeek?: number;          // 1=Monday, 7=Sunday
    category?: string;           // e.g., "class-change", "lunch-break", "arrival", "dismissal"
    duration?: number;           // Average duration in minutes
    [key: string]: any;          // Additional custom properties
  };
}
```

**Validation Rules**:
- `id` must be unique within dataset
- `fromRegion` must exist in LayoutConfiguration.regions
- `toRegion` must exist in LayoutConfiguration.regions
- `fromRegion` ≠ `toRegion` (no self-loops)
- `moves` must be positive integer (`moves > 0`)
- `workweek` must match `/^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/`
  - 4-digit year (YYYY)
  - 2-digit week number (01-53)
  - Week 01 = week containing first Thursday of year
- `metadata.peakHour` must be 0-23 if provided
- `metadata.dayOfWeek` must be 1-7 if provided

**Example**:
```json
{
  "id": "mov-001",
  "fromRegion": "classroom-201",
  "toRegion": "cafeteria",
  "moves": 28,
  "workweek": "202525",
  "timestamp": "2025-06-16T00:00:00Z",
  "metadata": {
    "peakHour": 12,
    "dayOfWeek": 1,
    "category": "lunch-break",
    "duration": 5
  }
}
```

---

### 8. MovementGeneratorConfig

Configuration for generating synthetic movement data.

**TypeScript Interface**:
```typescript
export interface MovementGeneratorConfig {
  // Region Context
  regions: string[];             // Array of valid region IDs (required)

  // Time Range
  startWeek: string;             // Start workweek YYYYWW (required)
  endWeek: string;               // End workweek YYYYWW (required)

  // Generation Parameters
  recordsPerWeek: number;        // How many movement records per week (required)
  minMoves: number;              // Minimum students per movement (required, >= 1)
  maxMoves: number;              // Maximum students per movement (required, > minMoves)

  // Optional: Reproducibility
  seed?: number | string;        // Seed for random number generator (for reproducible data)

  // Optional: Realistic Patterns
  useRealisticPatterns?: boolean; // Apply time-of-day and destination weighting (default: false)
  dailyPattern?: TimeSlot[];      // Custom time-based movement patterns
}
```

**Validation Rules**:
- `regions` must not be empty array
- `startWeek` and `endWeek` must be valid YYYYWW format
- `startWeek` ≤ `endWeek`
- `recordsPerWeek` must be positive integer
- `minMoves >= 1`
- `maxMoves > minMoves`

**Example**:
```json
{
  "regions": ["room-101", "room-102", "cafeteria", "library", "gym"],
  "startWeek": "202501",
  "endWeek": "202510",
  "recordsPerWeek": 50,
  "minMoves": 5,
  "maxMoves": 30,
  "seed": "building-A-2025",
  "useRealisticPatterns": true
}
```

---

### 9. TimeSlot

Defines movement patterns for specific time periods (used for realistic data generation).

**TypeScript Interface**:
```typescript
export interface TimeSlot {
  // Time Period
  startHour: number;             // Start hour (0-23)
  endHour: number;               // End hour (0-23)

  // Movement Intensity
  lambda: number;                // Average movements per minute (Poisson parameter)

  // Destination Preferences
  destinations: Array<{
    id: string;                  // Region ID
    weight: number;              // Relative probability weight (positive)
  }>;
}
```

**Validation Rules**:
- `startHour` must be 0-23
- `endHour` must be 0-23
- `endHour` > `startHour`
- `lambda` must be positive
- `destinations` must not be empty
- All `destination.id` must exist in regions list
- All `destination.weight` must be positive

**Example (Lunch Period)**:
```json
{
  "startHour": 12,
  "endHour": 13,
  "lambda": 12,
  "destinations": [
    { "id": "cafeteria", "weight": 8 },
    { "id": "outdoor-area", "weight": 2 },
    { "id": "library", "weight": 1 }
  ]
}
```

---

### 10. MovementSummary

Aggregated movement statistics for visualization and analysis.

**TypeScript Interface**:
```typescript
export interface MovementSummary {
  // Aggregation Period
  workweek: string;              // YYYYWW or "all" for overall summary

  // Region-Level Statistics
  regionStats: Array<{
    regionId: string;
    totalIncoming: number;       // Total students entering
    totalOutgoing: number;       // Total students leaving
    netFlow: number;             // Incoming - Outgoing
    topSources: Array<{ regionId: string, count: number }>;  // Top 5 origins
    topDestinations: Array<{ regionId: string, count: number }>; // Top 5 destinations
  }>;

  // Overall Statistics
  totalMovements: number;        // Total movement records
  totalStudents: number;         // Sum of all moves
  averageMovesPerRecord: number;
  peakHour?: number;             // Hour with most movement
  peakDay?: number;              // Day of week with most movement
}
```

**Usage**: Dashboard displays, analytics, performance monitoring

---

## Movement Validation Logic

### MovementData Validator

**TypeScript Implementation**:
```typescript
export class MovementDataValidator {
  static validate(
    movement: MovementData,
    availableRegions: string[]
  ): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!movement.id || movement.id.trim() === '') {
      errors.push('Movement ID is required');
    }
    if (!movement.fromRegion || movement.fromRegion.trim() === '') {
      errors.push('fromRegion is required');
    }
    if (!movement.toRegion || movement.toRegion.trim() === '') {
      errors.push('toRegion is required');
    }
    if (typeof movement.moves !== 'number' || movement.moves <= 0) {
      errors.push('moves must be a positive number');
    }
    if (!movement.workweek) {
      errors.push('workweek is required');
    }

    // Workweek format validation
    const workweekRegex = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;
    if (movement.workweek && !workweekRegex.test(movement.workweek)) {
      errors.push(`Invalid workweek format: ${movement.workweek}. Expected YYYYWW`);
    }

    // Region existence validation
    if (movement.fromRegion && !availableRegions.includes(movement.fromRegion)) {
      errors.push(`fromRegion "${movement.fromRegion}" not found in available regions`);
    }
    if (movement.toRegion && !availableRegions.includes(movement.toRegion)) {
      errors.push(`toRegion "${movement.toRegion}" not found in available regions`);
    }

    // No self-loops
    if (movement.fromRegion === movement.toRegion) {
      errors.push('fromRegion and toRegion cannot be the same');
    }

    // Metadata validation (if present)
    if (movement.metadata) {
      if (movement.metadata.peakHour !== undefined) {
        if (movement.metadata.peakHour < 0 || movement.metadata.peakHour > 23) {
          errors.push('metadata.peakHour must be between 0 and 23');
        }
      }
      if (movement.metadata.dayOfWeek !== undefined) {
        if (movement.metadata.dayOfWeek < 1 || movement.metadata.dayOfWeek > 7) {
          errors.push('metadata.dayOfWeek must be between 1 and 7');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

### MovementGeneratorConfig Validator

**TypeScript Implementation**:
```typescript
export class MovementGeneratorConfigValidator {
  static validate(config: MovementGeneratorConfig): ValidationResult {
    const errors: string[] = [];

    // Regions validation
    if (!Array.isArray(config.regions) || config.regions.length === 0) {
      errors.push('regions must be a non-empty array');
    }

    // Workweek format validation
    const workweekRegex = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;
    if (!workweekRegex.test(config.startWeek)) {
      errors.push(`Invalid startWeek format: ${config.startWeek}`);
    }
    if (!workweekRegex.test(config.endWeek)) {
      errors.push(`Invalid endWeek format: ${config.endWeek}`);
    }

    // Week range validation
    if (config.startWeek > config.endWeek) {
      errors.push('startWeek must be <= endWeek');
    }

    // Generation parameters
    if (config.recordsPerWeek <= 0) {
      errors.push('recordsPerWeek must be positive');
    }
    if (config.minMoves < 1) {
      errors.push('minMoves must be >= 1');
    }
    if (config.maxMoves <= config.minMoves) {
      errors.push('maxMoves must be > minMoves');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

## Movement Data Relationships

### Entity Relationship Diagram (Extended)

```
┌─────────────────────┐
│ LayoutConfiguration │
│                     │
│ - regions[]         │
└──────────┬──────────┘
           │ references
           │
           ▼
    ┌──────────┐         ┌─────────────────┐
    │  Region  │◄────────│  MovementData   │
    │          │ from/to │                 │
    │ - id     │         │ - fromRegion    │
    │ - label  │         │ - toRegion      │
    └──────────┘         │ - moves         │
                         │ - workweek      │
                         └─────────────────┘
                                  ▲
                                  │ generates
                                  │
                     ┌────────────┴──────────────┐
                     │ MovementGeneratorConfig   │
                     │                           │
                     │ - regions[]               │
                     │ - startWeek / endWeek     │
                     │ - minMoves / maxMoves     │
                     │ - seed                    │
                     └───────────────────────────┘
```

**Notes**:
- MovementData references Region via `fromRegion` and `toRegion` (foreign keys)
- MovementGeneratorConfig produces MovementData records
- MovementSummary aggregates MovementData for analytics

---

## Sample Movement Data

### Single Movement Record
```json
{
  "id": "mov-20250625-001",
  "fromRegion": "classroom-101",
  "toRegion": "cafeteria",
  "moves": 25,
  "workweek": "202525",
  "timestamp": "2025-06-16T12:05:00Z",
  "metadata": {
    "peakHour": 12,
    "dayOfWeek": 1,
    "category": "lunch-break"
  }
}
```

### Movement Dataset (Multiple Records)
```json
[
  {
    "id": "mov-001",
    "fromRegion": "main-entrance",
    "toRegion": "classroom-101",
    "moves": 30,
    "workweek": "202525",
    "metadata": { "category": "arrival", "peakHour": 8 }
  },
  {
    "id": "mov-002",
    "fromRegion": "classroom-101",
    "toRegion": "classroom-102",
    "moves": 15,
    "workweek": "202525",
    "metadata": { "category": "class-change", "peakHour": 9 }
  },
  {
    "id": "mov-003",
    "fromRegion": "classroom-102",
    "toRegion": "cafeteria",
    "moves": 28,
    "workweek": "202525",
    "metadata": { "category": "lunch-break", "peakHour": 12 }
  }
]
```

---

## Extension Next Steps

1. ✅ Movement data model defined
2. ⏭️ Generate TypeScript interface contracts (contracts/)
3. ⏭️ Define MovementGeneratorService method signatures
4. ⏭️ Define MovementVisualizerService method signatures
5. ⏭️ Update quickstart.md with movement tracking usage

---

**Data Model Last Updated**: 2025-12-07
