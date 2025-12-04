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
