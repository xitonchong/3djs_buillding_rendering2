# Research: Movement Limit Configuration

**Feature**: 002-movements-limit
**Date**: 2025-12-19
**Status**: Complete

## Overview

This document captures research decisions for implementing movement limit configuration feature. The feature allows administrators to define movement thresholds via JSON config file and visualize violations with red arrows.

## Key Technical Decisions

### Decision 1: JSON File Location and Loading Pattern

**Chosen Approach**: Place `movement-limits.json` in `src/assets/data/` and load using Angular's HttpClient

**Rationale**:
- Consistent with existing pattern for `sample-movements.json` in the same directory
- Angular's `assets/` folder is automatically copied to build output
- HttpClient provides Observable-based async loading with error handling
- No need for additional build configuration

**Alternatives Considered**:
- **Environment config file**: Rejected because limits are data configuration, not environment settings
- **TypeScript constants**: Rejected because requires code changes for config updates
- **Backend API endpoint**: Rejected because current app is frontend-only with static data

**Implementation Pattern** (based on existing `LayoutLoaderService`):
```typescript
loadLimits(): Observable<MovementLimit[]> {
  return this.http.get<MovementLimit[]>('assets/data/movement-limits.json')
    .pipe(
      catchError(error => {
        console.warn('Movement limits file not found, using no limits');
        return of([]); // Graceful degradation
      })
    );
}
```

### Decision 2: Validation Strategy

**Chosen Approach**: Client-side validation with warning logs for invalid entries, filter out bad data

**Rationale**:
- Fail-safe approach: invalid config doesn't break visualization
- Clear feedback via console warnings for debugging
- Follows principle of graceful degradation from spec

**Validation Rules**:
1. Limit value must be positive integer (> 0)
2. fromRegion and toRegion must be non-empty strings
3. Duplicate region pairs: use last configured value (with warning)
4. Missing fields: skip entry with warning

**Alternatives Considered**:
- **JSON Schema validation**: Rejected as overkill for simple structure
- **Fail-fast approach**: Rejected because one bad config shouldn't break entire app

### Decision 3: Movement Comparison Logic

**Chosen Approach**: Create dedicated `MovementValidatorService` with pure comparison functions

**Rationale**:
- Separation of concerns: validation logic separate from rendering
- Easily unit testable without DOM/D3 dependencies
- Can be reused if future features need limit checking

**Comparison Algorithm**:
```typescript
isLimitExceeded(movement: MovementData, limits: MovementLimit[]): boolean {
  const limit = limits.find(l =>
    l.fromRegion === movement.fromRegion &&
    l.toRegion === movement.toRegion
  );
  return limit ? movement.moves > limit.limit : false;
}
```

**Alternatives Considered**:
- **Hash map lookup**: More efficient but premature optimization for expected scale (<100 limits)
- **Inline in renderer**: Rejected for testability and separation of concerns

### Decision 4: Arrow Color Application

**Chosen Approach**: Modify existing `renderMovements()` in `SvgRendererService` to conditionally set stroke color

**Rationale**:
- Minimal code change: add condition to existing arrow rendering loop
- Consistent with current D3 rendering patterns
- No impact on existing opacity-based temporal visualization

**Implementation Pattern**:
```typescript
// In renderMovements() loop
const isExceeded = this.validator.isLimitExceeded(movement, limits);
const strokeColor = isExceeded ? 'red' : 'rgba(0, 0, 0, ${strokeOpacity})';

linksGroup.append('path')
  .attr('stroke', strokeColor)
  // ... other attributes
```

**Alternatives Considered**:
- **CSS classes**: Rejected because D3 already uses inline styles for colors
- **Separate layer for violations**: Rejected as unnecessarily complex

### Decision 5: Data Flow and Service Integration

**Chosen Approach**: Load limits in `AppComponent.ngOnInit()`, pass to renderer alongside movements

**Rationale**:
- Centralized data loading in app component (existing pattern)
- Limits loaded once at startup (no need for reactivity/updates)
- Services remain stateless and composable

**Data Flow**:
```
AppComponent.ngOnInit()
  → MovementLimitLoaderService.loadLimits()
  → store in AppComponent.limits property
  → pass to BuildingLayoutComponent via Input
  → BuildingLayoutComponent passes to SvgRendererService.renderMovements()
  → MovementValidatorService checks each movement
  → SvgRendererService applies colors
```

**Alternatives Considered**:
- **Global service singleton**: Rejected to avoid shared state
- **Load on-demand in renderer**: Rejected because loading should happen once, not per render

### Decision 6: Error Handling Strategy

**Chosen Approach**: Multi-level graceful degradation with console warnings

**Error Scenarios**:

| Error Type | Handling Strategy | User Impact |
|------------|-------------------|-------------|
| File not found (404) | Return empty array, log warning | All arrows default color |
| Malformed JSON | Return empty array, log error | All arrows default color |
| Invalid limit entry | Skip entry, log warning | Only valid limits applied |
| Non-existent region ID | No match found, treated as no limit | Arrow uses default color |

**Rationale**:
- User always sees visualization even with config errors
- Console provides debugging information for administrators
- No error modals/alerts to interrupt user experience

## Performance Considerations

### Expected Scale
- **Movements**: ~1000-2000 per workweek (based on existing data)
- **Limits**: <100 region pairs (per spec requirement)
- **Comparison complexity**: O(n*m) where n=movements, m=limits

### Optimization Strategy
**Current approach**: Linear search is acceptable
- At 2000 movements × 100 limits = 200k comparisons
- JavaScript array.find() is highly optimized
- Rendering is already bottleneck, not comparison logic

**Future optimization** (if needed):
- Convert limits array to Map<string, number> with composite key "fromRegion:toRegion"
- O(1) lookup instead of O(m)
- Only implement if profiling shows comparison as bottleneck

## Testing Strategy

### Unit Tests (Jasmine)

**MovementLimitLoaderService**:
- ✅ Successfully loads valid JSON file
- ✅ Returns empty array for missing file (404)
- ✅ Returns empty array for malformed JSON
- ✅ Logs appropriate warnings/errors

**MovementValidatorService**:
- ✅ Returns true when movement exceeds limit
- ✅ Returns false when movement is at/below limit
- ✅ Returns false when no limit configured
- ✅ Handles multiple limits correctly
- ✅ Handles duplicate region pairs (uses last)

**SvgRendererService** (existing tests + new):
- ✅ Arrows rendered in red when limit exceeded
- ✅ Arrows rendered in default color when at/below limit
- ✅ Arrows rendered in default color when no limit configured
- ✅ Mixed scenario: some violations, some normal

### Integration Testing

**Manual testing scenarios** (documented in quickstart.md):
1. Create sample movement-limits.json with known thresholds
2. Load application and verify visual output
3. Test edge cases: missing file, malformed JSON, invalid values
4. Verify console warnings appear appropriately

## Dependencies and Constraints

### Required Dependencies
- **Existing**: All required dependencies already in package.json
  - Angular 18.0 (HttpClient for loading)
  - D3.js 7.9 (arrow rendering)
  - RxJS 7.8 (Observable patterns)
  - TypeScript 5.4 (interfaces)

### No New Dependencies Required
This feature requires zero new npm packages.

### Browser Compatibility
- Modern browsers supporting ES2022 (same as existing app)
- SVG rendering (same requirements as existing visualization)

## Open Questions / Future Enhancements

### Resolved Questions
All technical questions resolved during research phase.

### Future Enhancement Ideas (Out of Scope)
1. **Live reload**: Watch file for changes and update visualization
2. **UI editor**: Build configuration interface instead of manual JSON editing
3. **Multiple threshold levels**: Warning (yellow) + critical (red)
4. **Time-based limits**: Different thresholds for different time periods
5. **Statistical limits**: Auto-calculate thresholds from historical data

## References

### Existing Codebase Patterns
- `LayoutLoaderService` (src/app/services/layout-loader.service.ts): JSON loading pattern
- `SvgRendererService` (src/app/services/svg-renderer.service.ts): Arrow rendering with D3
- `MovementData` interface (src/app/models/movement-data.interface.ts): Data structure patterns
- Sample data (src/assets/data/sample-movements.json): Configuration file location

### External Resources
- Angular HttpClient: https://angular.io/api/common/http/HttpClient
- D3.js stroke styling: https://d3js.org/d3-selection/modifying
- TypeScript strict mode: https://www.typescriptlang.org/tsconfig#strict
