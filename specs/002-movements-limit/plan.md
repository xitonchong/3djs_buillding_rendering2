# Implementation Plan: Movement Limit Configuration

**Branch**: `002-movements-limit` | **Date**: 2025-12-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-movements-limit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds configurable movement thresholds defined in a JSON file (movement-limits.json). When actual movements between region pairs exceed configured limits, the visualization renders those arrows in red color for immediate visual identification of violations. The system loads limits at startup, validates configuration data gracefully, and applies color-based visual alerts without requiring a UI configuration interface.

## Technical Context

**Language/Version**: TypeScript 5.4 (strict mode enabled)
**Primary Dependencies**: Angular 18.0, D3.js 7.9, RxJS 7.8
**Storage**: JSON files in assets/data directory (HttpClient for loading)
**Testing**: Jasmine 5.1 with Karma test runner
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page Angular web application
**Performance Goals**: Visual feedback within 1 second of data loading, support 100+ limit configurations without degradation
**Constraints**: <1s render time for limit violations, graceful error handling for invalid config
**Scale/Scope**: Single feature adding limit configuration loading, comparison logic, and conditional arrow coloring

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution template is not configured for this project (placeholder template found).

**Basic Checks** (without formal constitution):
- ✅ **Simplicity**: Feature uses simple JSON file approach, no database or complex storage
- ✅ **Existing Patterns**: Follows existing pattern of loading JSON files from assets/data (same as sample-movements.json)
- ✅ **Minimal Dependencies**: No new npm packages required, uses existing Angular HttpClient and D3.js
- ✅ **Testability**: Each component (loader, validator, comparator, renderer) can be unit tested independently
- ✅ **Error Handling**: Graceful degradation specified for invalid/missing config files

## Project Structure

### Documentation (this feature)

```text
specs/002-movements-limit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
building-layout-tutorial/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── movement-limit.interface.ts        # NEW: Movement limit configuration interface
│   │   ├── services/
│   │   │   ├── movement-limit-loader.service.ts   # NEW: Load and validate limits from JSON
│   │   │   ├── movement-validator.service.ts      # NEW: Compare movements against limits
│   │   │   └── svg-renderer.service.ts            # MODIFIED: Add limit-based arrow coloring
│   │   └── app.component.ts                       # MODIFIED: Load limits and pass to renderer
│   └── assets/
│       └── data/
│           └── movement-limits.json                # NEW: Configuration file for limits
└── src/
    └── app/
        └── services/
            ├── movement-limit-loader.service.spec.ts   # NEW: Unit tests
            └── movement-validator.service.spec.ts      # NEW: Unit tests
```

**Structure Decision**: This is a single-page Angular web application. The feature follows existing patterns:
- **Models**: TypeScript interfaces in `src/app/models/` (same pattern as existing `movement-data.interface.ts`)
- **Services**: Injectable services in `src/app/services/` (same pattern as existing `layout-loader.service.ts`)
- **Data**: JSON files in `src/assets/data/` (same location as existing `sample-movements.json`)
- **Tests**: Jasmine unit tests co-located with services (`.spec.ts` files)

## Complexity Tracking

**No violations detected** - all checks pass without requiring justification.
