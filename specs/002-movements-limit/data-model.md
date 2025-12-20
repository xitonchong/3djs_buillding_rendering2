# Data Model: Movement Limit Configuration

**Feature**: 002-movements-limit
**Date**: 2025-12-19

## Overview

This feature introduces one new entity (`MovementLimit`) and extends the visualization logic to compare existing `MovementData` entities against configured limits.

## Entities

### MovementLimit (NEW)

Represents a configured threshold for movements between a specific region pair.

**TypeScript Interface**:
```typescript
export interface MovementLimit {
  fromRegion: string;    // Source region identifier (must match Movement.fromRegion)
  toRegion: string;      // Destination region identifier (must match Movement.toRegion)
  limit: number;         // Maximum allowed moves (positive integer)
}
```

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| fromRegion | string | Yes | Non-empty, case-sensitive | Source region ID matching region identifiers in layout config |
| toRegion | string | Yes | Non-empty, case-sensitive | Destination region ID matching region identifiers in layout config |
| limit | number | Yes | Positive integer (> 0) | Maximum number of moves allowed for this region pair |

**Validation Rules**:
1. **fromRegion**: Must be non-empty string (leading/trailing whitespace should be trimmed)
2. **toRegion**: Must be non-empty string (leading/trailing whitespace should be trimmed)
3. **limit**: Must be positive integer greater than 0
4. **Uniqueness**: Each fromRegion→toRegion pair should appear at most once (duplicates: use last value with warning)

**Example Data**:
```json
{
  "fromRegion": "E-1",
  "toRegion": "F-2",
  "limit": 30
}
```

**Persistence**:
- Stored in JSON file: `src/assets/data/movement-limits.json`
- Loaded at application startup via HttpClient
- No runtime persistence (read-only configuration)

---

### MovementData (EXISTING - No Changes)

Represents actual movement data between regions. This entity already exists and requires no schema changes.

**Relevant Attributes** (for limit checking):
- `fromRegion: string` - matches against MovementLimit.fromRegion
- `toRegion: string` - matches against MovementLimit.toRegion
- `moves: number` - compared against MovementLimit.limit

**No modifications required** to this entity.

---

### Region (EXISTING - No Changes)

Represents spatial regions in the building layout. Referenced by MovementLimit and MovementData through region IDs.

**Relevant Attributes**:
- `id: string` - the identifier used in fromRegion/toRegion fields

**No modifications required** to this entity.

## Relationships

```
MovementLimit (0..*) ----[references]----> Region (1)
    fromRegion/toRegion                        id

MovementData (0..*) -----[references]----> Region (1)
    fromRegion/toRegion                        id

MovementLimit (0..1) ----[applies to]----> MovementData (0..*)
    fromRegion+toRegion                    fromRegion+toRegion
```

**Relationship Details**:

1. **MovementLimit → Region** (Reference, Many-to-One)
   - Each MovementLimit references two Regions (from and to)
   - Regions may have zero or many limits defined
   - Relationship enforced by: region ID validation (soft - warnings for non-existent IDs)

2. **MovementData → Region** (Reference, Many-to-One)
   - Each MovementData references two Regions (from and to)
   - Existing relationship, no changes

3. **MovementLimit → MovementData** (Logical, One-to-Many)
   - One limit configuration may apply to many movement records (different workweeks, timestamps)
   - Matching condition: `limit.fromRegion === movement.fromRegion AND limit.toRegion === movement.toRegion`
   - This is a runtime comparison, not a stored relationship

## Data Flow

```
[movement-limits.json]
        ↓
   HttpClient.get()
        ↓
   Validation & Filtering
        ↓
   MovementLimit[] (validated)
        ↓
   Runtime Comparison with MovementData[]
        ↓
   Violation Detection (moves > limit)
        ↓
   Visual Rendering (red arrow if exceeded)
```

**State Management**:
- MovementLimit array loaded once at startup
- Stored in AppComponent property: `limits: MovementLimit[] = []`
- Passed to rendering service as function parameter
- No reactive updates (static configuration)

## Configuration File Format

**File Path**: `src/assets/data/movement-limits.json`

**Format**: JSON array of MovementLimit objects

**Example**:
```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": 30
  },
  {
    "fromRegion": "E-2",
    "toRegion": "mailroom",
    "limit": 40
  },
  {
    "fromRegion": "office-2-1",
    "toRegion": "E-1",
    "limit": 25
  }
]
```

**Edge Cases**:
- **Empty file**: `[]` - Valid, means no limits configured
- **Missing file**: Treated as `[]` with console warning
- **Invalid JSON**: Treated as `[]` with console error
- **Invalid entries**: Skipped with console warnings, valid entries still applied

## Validation Logic

**Service**: `MovementValidatorService`

**Key Method**:
```typescript
validateLimits(rawLimits: any[]): MovementLimit[] {
  const validated: MovementLimit[] = [];
  const seen = new Set<string>();

  for (const raw of rawLimits) {
    // Check required fields
    if (!raw.fromRegion || !raw.toRegion || typeof raw.limit !== 'number') {
      console.warn('Invalid limit entry (missing fields):', raw);
      continue;
    }

    // Check limit value
    if (raw.limit <= 0) {
      console.warn('Invalid limit value (must be > 0):', raw);
      continue;
    }

    // Check for duplicates
    const key = `${raw.fromRegion}:${raw.toRegion}`;
    if (seen.has(key)) {
      console.warn('Duplicate limit for region pair (using latest):', key);
    }
    seen.add(key);

    validated.push({
      fromRegion: raw.fromRegion.trim(),
      toRegion: raw.toRegion.trim(),
      limit: Math.floor(raw.limit)
    });
  }

  return validated;
}
```

## Comparison Logic

**Service**: `MovementValidatorService`

**Key Method**:
```typescript
isLimitExceeded(movement: MovementData, limits: MovementLimit[]): boolean {
  const limit = limits.find(l =>
    l.fromRegion === movement.fromRegion &&
    l.toRegion === movement.toRegion
  );

  if (!limit) {
    return false; // No limit configured = not exceeded
  }

  return movement.moves > limit.limit;
}

getViolatedLimits(movements: MovementData[], limits: MovementLimit[]): MovementData[] {
  return movements.filter(m => this.isLimitExceeded(m, limits));
}
```

## Data Integrity

**Constraints**:
1. Region IDs in limits should match actual regions in layout config (soft validation with warnings)
2. Limit values must be positive integers
3. No duplicate fromRegion→toRegion pairs (last wins if duplicates exist)

**No Database Constraints**: This is a client-side only feature with JSON file storage.

**Migration**: No data migration required - feature is additive and backward compatible (missing file = no limits).
