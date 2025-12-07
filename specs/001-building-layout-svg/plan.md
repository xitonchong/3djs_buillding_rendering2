# Implementation Plan: Student Movement Tracking

**Branch**: `001-building-layout-svg` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-building-layout-svg/spec.md` + User request for student movement tracking

**Note**: This plan extends the existing building layout visualization with student movement tracking and synthetic data generation capabilities.

## Summary

Add student movement tracking and visualization to the existing building layout system. This includes:
1. **Random Data Generator**: Function to generate synthetic movement data with schema (fromRegion, toRegion, moves count, workweek timestamp)
2. **Movement Data Model**: Represent student movements between regions with temporal data (e.g., 202525 = year 2025, week 25)
3. **Visualization Integration**: Display movement flows on the existing SVG building layout

## Technical Context

**Language/Version**: TypeScript (strict mode) with Angular (latest stable version)
**Primary Dependencies**:
- D3.js v7+ (SVG/DOM manipulation and data visualization)
- Angular CLI (build tooling)
- RxJS (reactive state management for movement streams)
**Storage**: In-memory data structures + JSON file loading (existing pattern)
**Testing**: Jasmine/Karma (Angular default testing framework)
**Target Platform**: Web browser (ES2020+)
**Project Type**: Web application (Angular SPA)
**Performance Goals**:
- Generate 10,000+ movement records in <100ms
- Render movement flows for 500+ regions without lag
- Smooth animation at 60fps for movement visualization
**Constraints**:
- Client-side only (no backend API required initially)
- Must integrate seamlessly with existing layout visualization
- Workweek format: YYYYWW (e.g., 202525 = 2025, week 25)
**Scale/Scope**:
- Support 100+ regions per building
- Handle 1000+ movement records per time period
- Temporal range: multiple years of weekly data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution not yet populated - proceeding with standard Angular/TypeScript best practices

**Default Gates Applied**:
- ✅ **Simplicity**: Feature adds minimal new abstractions (MovementData model, generator service)
- ✅ **Testing**: Will follow TDD with unit tests for generator, integration tests for visualization
- ✅ **Library-First**: Generator function will be standalone, reusable utility
- ✅ **Integration**: Extends existing architecture without breaking changes

**No violations detected** - feature aligns with existing patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-building-layout-svg/
├── spec.md              # Original building layout spec (existing)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - student movement patterns research
├── data-model.md        # Phase 1 output - MovementData schema
├── quickstart.md        # Phase 1 output - how to use movement generator
└── contracts/           # Phase 1 output - TypeScript interfaces
    └── movement-data.interface.ts
```

### Source Code (repository root)

```text
building-layout-tutorial/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── region.interface.ts          # Existing
│   │   │   ├── layout-config.interface.ts   # Existing
│   │   │   ├── viewport.interface.ts        # Existing
│   │   │   └── movement-data.interface.ts   # NEW: Movement record model
│   │   │
│   │   ├── services/
│   │   │   ├── layout-loader.service.ts     # Existing
│   │   │   ├── svg-renderer.service.ts      # Existing
│   │   │   ├── movement-generator.service.ts # NEW: Random data generator
│   │   │   └── movement-visualizer.service.ts # NEW: Flow visualization
│   │   │
│   │   ├── utils/
│   │   │   ├── coordinate-validator.ts      # Existing
│   │   │   ├── scale-calculator.ts          # Existing
│   │   │   ├── workweek-parser.ts           # NEW: Parse YYYYWW format
│   │   │   └── random-generator.ts          # NEW: Core RNG utilities
│   │   │
│   │   └── components/
│   │       ├── building-layout/
│   │       │   ├── building-layout.component.ts  # Existing - will extend
│   │       │   └── movement-flow/               # NEW: Component for flows
│   │       │       ├── movement-flow.component.ts
│   │       │       └── movement-flow.component.html
│   │       └── movement-controls/              # NEW: Time/filter controls
│   │           ├── movement-controls.component.ts
│   │           └── movement-controls.component.html
│   │
│   └── assets/
│       └── data/
│           └── sample-movements.json          # NEW: Sample movement data
│
└── tests/
    ├── unit/
    │   ├── movement-generator.service.spec.ts
    │   ├── workweek-parser.spec.ts
    │   └── random-generator.spec.ts
    └── integration/
        └── movement-visualization.spec.ts
```

**Structure Decision**: Extends existing Angular application structure. New models, services, and components follow established patterns in the codebase (building-layout-tutorial/src/app/).

## Complexity Tracking

> **No violations to justify** - Feature integrates cleanly with existing architecture.

---

## Phase 0: Research & Analysis

**Research Questions to Answer**:

1. **Movement Data Patterns**:
   - What are realistic patterns for student movements in buildings?
   - Peak movement times, typical flow rates
   - Common region pairs (classroom → cafeteria, etc.)

2. **Workweek Date Format**:
   - ISO 8601 week date standard (YYYY-Www)
   - JavaScript date manipulation libraries (date-fns, moment.js alternatives)
   - Validation rules for YYYYWW format

3. **Random Data Generation**:
   - Seeded RNG for reproducible test data
   - Distribution patterns (normal, Poisson for movement counts)
   - Weighted random selection for realistic region pairs

4. **Visualization Techniques**:
   - D3.js flow diagrams (Sankey, force-directed graphs)
   - Edge bundling for dense movement networks
   - Temporal animation techniques

**Output**: `research.md` with decisions on:
- Date library choice (date-fns recommended for tree-shaking)
- RNG approach (seedrandom.js vs crypto.getRandomValues)
- Flow visualization pattern (arrow paths vs. animated particles)
- Data structure for efficient temporal queries

---

## Phase 1: Design & Contracts

### Data Model (`data-model.md`)

#### MovementData Entity
```typescript
interface MovementData {
  id: string;                    // Unique identifier
  fromRegion: string;            // Region ID (source)
  toRegion: string;              // Region ID (destination)
  moves: number;                 // Student count
  workweek: string;              // Format: YYYYWW (e.g., "202525")
  timestamp?: Date;              // Optional: parsed date for sorting
  metadata?: {                   // Optional: additional context
    peakHour?: number;           // Hour of day (0-23)
    dayOfWeek?: number;          // 1=Monday, 7=Sunday
    category?: string;           // e.g., "class-change", "lunch-break"
  };
}

interface MovementGeneratorConfig {
  regions: string[];             // Available region IDs
  startWeek: string;             // YYYYWW format
  endWeek: string;               // YYYYWW format
  recordsPerWeek: number;        // How many movements per week
  minMoves: number;              // Minimum students per movement
  maxMoves: number;              // Maximum students per movement
  seed?: number;                 // Optional: for reproducible data
}
```

#### Validation Rules
- `workweek` must match /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/ (valid year + week 01-53)
- `moves` must be positive integer
- `fromRegion` and `toRegion` must exist in layout configuration
- `fromRegion` ≠ `toRegion` (no self-loops)

### API Contracts (`contracts/`)

#### Movement Generator Service Interface
```typescript
interface IMovementGenerator {
  // Generate random movement data
  generateMovements(config: MovementGeneratorConfig): MovementData[];

  // Generate single movement record
  generateSingleMovement(
    fromRegion: string,
    toRegion: string,
    workweek: string,
    minMoves?: number,
    maxMoves?: number
  ): MovementData;

  // Parse workweek to Date
  parseWorkweek(workweek: string): Date;

  // Format Date to workweek string
  formatWorkweek(date: Date): string;
}
```

### Quickstart (`quickstart.md`)

**Basic Usage**:
```typescript
// 1. Inject the service
constructor(private movementGen: MovementGeneratorService) {}

// 2. Generate synthetic data
const config: MovementGeneratorConfig = {
  regions: ['room-101', 'room-102', 'cafeteria'],
  startWeek: '202501',  // 2025, week 1
  endWeek: '202510',    // 2025, week 10
  recordsPerWeek: 50,
  minMoves: 5,
  maxMoves: 30,
  seed: 12345           // Reproducible results
};

const movements = this.movementGen.generateMovements(config);

// 3. Visualize on layout
this.movementVisualizer.renderFlows(movements, this.layoutConfig);
```

---

## Phase 2: Implementation Tasks

**Note**: Actual task breakdown will be generated by `/speckit.tasks` command. This section is a preview.

### Core Tasks (Priority Order)

1. **T001**: Create `movement-data.interface.ts` with TypeScript interfaces
2. **T002**: Implement `workweek-parser.ts` utility (parse/format/validate)
3. **T003**: Write unit tests for workweek parser
4. **T004**: Implement `random-generator.ts` core utilities (seeded RNG)
5. **T005**: Create `movement-generator.service.ts` with generation logic
6. **T006**: Write unit tests for movement generator service
7. **T007**: Add sample movements JSON file to assets
8. **T008**: Implement `movement-visualizer.service.ts` for D3.js flows
9. **T009**: Create `movement-flow.component` for rendering flows
10. **T010**: Create `movement-controls.component` for time/filter UI
11. **T011**: Integrate movement controls into main app component
12. **T012**: Write integration tests for full movement visualization
13. **T013**: Update existing spec.md with new user stories
14. **T014**: Document API in quickstart.md

---

## Next Steps

1. ✅ Run `/speckit.plan` to generate this plan (COMPLETE)
2. ⏭️ Execute Phase 0 research (to be completed next)
3. ⏭️ Execute Phase 1 design artifacts generation
4. ⏭️ Run `/speckit.tasks` to generate detailed task breakdown
5. ⏭️ Run `/speckit.implement` to execute tasks

---

## Notes

- **Backward Compatibility**: Existing building layout features remain unchanged
- **Progressive Enhancement**: Movement visualization is optional, can be toggled on/off
- **Performance**: Consider pagination/filtering for large datasets (>10k movements)
- **Future Extensions**:
  - Real-time movement tracking (WebSocket integration)
  - Heatmap aggregation by time period
  - Export movement data to CSV
  - Predictive movement patterns (ML integration)
