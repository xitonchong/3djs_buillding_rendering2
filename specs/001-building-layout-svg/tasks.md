# Tasks: Building Layout Visualization

**Input**: Design documents from `/specs/001-building-layout-svg/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are included based on constitution requirements for math utilities and core functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Angular project**: `src/app/`, `src/assets/`, tests at project root
- Paths shown below follow Angular CLI conventions with standalone components

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Angular project with standalone components using Angular CLI
- [X] T002 Install D3.js and type definitions (d3@^7.9.0, @types/d3)
- [X] T003 [P] Create project directory structure (src/app/models, src/app/components, src/app/services, src/app/utils, src/app/examples)
- [X] T004 [P] Create TypeScript strict mode configuration in tsconfig.json
- [X] T005 [P] Create sample data directory and file at src/assets/sample-data/building-layouts.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create Region interface in src/app/models/region.interface.ts
- [X] T007 [P] Create LayoutConfiguration interface in src/app/models/layout-config.interface.ts
- [X] T008 [P] Create Viewport interface in src/app/models/viewport.interface.ts
- [X] T009 [P] Create ValidationResult interface in src/app/utils/coordinate-validator.ts
- [X] T010 [P] Create BoundingBox interface in src/app/utils/scale-calculator.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Define Building Layout Configuration (Priority: P1) 🎯 MVP

**Goal**: Enable users to define building layouts by providing coordinate-based rectangular regions with validation

**Independent Test**: Provide a configuration object with X-Y coordinates for rectangles and verify the system accepts and validates the configuration correctly. Test with valid configs (should accept), invalid coordinates (should reject), and configuration updates (should reflect changes).

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Unit test for CoordinateValidator.validateRegion in src/app/utils/coordinate-validator.spec.ts
- [ ] T012 [P] [US1] Unit test for CoordinateValidator.validateLayout in src/app/utils/coordinate-validator.spec.ts
- [ ] T013 [P] [US1] Unit test for LayoutConfigService.validateConfig in src/app/services/layout-config.service.spec.ts

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement CoordinateValidator utility class in src/app/utils/coordinate-validator.ts with validateRegion and validateLayout methods
- [X] T015 [US1] Generate LayoutConfigService using Angular CLI (ng generate service services/layout-config)
- [X] T016 [US1] Implement LayoutConfigService reactive state management in src/app/services/layout-config.service.ts (config$ observable, updateConfig, validateConfig methods)
- [X] T017 [US1] Implement updateRegion method in src/app/services/layout-config.service.ts
- [X] T018 [US1] Implement addRegion and removeRegion methods in src/app/services/layout-config.service.ts
- [X] T019 [US1] Implement loadFromJSON and exportToJSON methods in src/app/services/layout-config.service.ts
- [X] T020 [P] [US1] Create sample configuration data in src/assets/sample-data/building-layouts.json with multiple test cases

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - configuration can be created, validated, and managed

---

## Phase 4: User Story 2 - Visualize Building Layout as SVG (Priority: P2)

**Goal**: Render building layout configurations as scalable SVG graphics with automatic scaling and viewport controls

**Independent Test**: Provide a valid configuration from Story 1 and verify that an SVG graphic is rendered with rectangles at the correct positions. Test zoom/pan controls work smoothly and all regions remain visible when scaled.

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Unit test for ScaleCalculator.calculateBounds in src/app/utils/scale-calculator.spec.ts
- [ ] T022 [P] [US2] Unit test for ScaleCalculator.calculateFitScales in src/app/utils/scale-calculator.spec.ts
- [ ] T023 [P] [US2] Unit test for BoundsCalculator utilities in src/app/utils/bounds-calculator.spec.ts
- [ ] T024 [P] [US2] Unit test for SvgRendererService in src/app/services/svg-renderer.service.spec.ts

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement ScaleCalculator utility class in src/app/utils/scale-calculator.ts with calculateBounds and calculateFitScales methods
- [X] T026 [P] [US2] Implement BoundsCalculator utility class in src/app/utils/bounds-calculator.ts with getRegionBounds, getLayoutBounds, and isRegionVisible methods
- [X] T027 [US2] Generate SvgRendererService using Angular CLI (ng generate service services/svg-renderer)
- [X] T028 [US2] Implement SvgRendererService core methods in src/app/services/svg-renderer.service.ts (initialize, render, updateViewport)
- [X] T029 [US2] Implement D3 zoom behavior in SvgRendererService (setupZoom, zoomIn, zoomOut, resetViewport)
- [X] T030 [US2] Implement SVG data join pattern for regions in SvgRendererService.render method
- [X] T031 [US2] Generate BuildingLayoutComponent using Angular CLI (ng generate component components/building-layout --standalone)
- [X] T032 [US2] Implement BuildingLayoutComponent inputs and outputs in src/app/components/building-layout/building-layout.component.ts
- [X] T033 [US2] Implement BuildingLayoutComponent lifecycle hooks in src/app/components/building-layout/building-layout.component.ts (ngAfterViewInit, ngOnChanges, ngOnDestroy)
- [X] T034 [US2] Implement BuildingLayoutComponent public methods in src/app/components/building-layout/building-layout.component.ts (zoomIn, zoomOut, resetViewport)
- [X] T035 [US2] Create BuildingLayoutComponent template in src/app/components/building-layout/building-layout.component.html with SVG container and controls
- [X] T036 [US2] Create BuildingLayoutComponent styles in src/app/components/building-layout/building-layout.component.scss
- [ ] T037 [US2] Generate ViewportControlsComponent using Angular CLI (ng generate component components/building-layout/viewport-controls --standalone)
- [ ] T038 [US2] Implement ViewportControlsComponent in src/app/components/building-layout/viewport-controls.component.ts with zoom/pan/reset button handlers
- [ ] T039 [US2] Create ViewportControlsComponent template in src/app/components/building-layout/viewport-controls.component.html
- [ ] T040 [US2] Create ViewportControlsComponent styles in src/app/components/building-layout/viewport-controls.component.scss

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - layouts can be configured and visualized with zoom/pan controls

---

## Phase 5: User Story 3 - Interactive Region Identification (Priority: P3)

**Goal**: Enable users to interact with regions (hover/click) to view detailed information

**Independent Test**: Render a layout from Story 2 and verify that mouse interactions trigger display of region information. Test hover highlights regions and shows coordinates/dimensions, click displays label prominently.

### Tests for User Story 3 ⚠️

- [ ] T041 [P] [US3] Integration test for BuildingLayoutComponent interactions in src/app/components/building-layout/building-layout.component.spec.ts

### Implementation for User Story 3

- [ ] T042 [US3] Implement SvgRendererService.setupInteractions method in src/app/services/svg-renderer.service.ts (onHover, onClick handlers)
- [ ] T043 [US3] Implement SvgRendererService.highlightRegion method in src/app/services/svg-renderer.service.ts
- [ ] T044 [US3] Add interaction event handlers to BuildingLayoutComponent in src/app/components/building-layout/building-layout.component.ts
- [ ] T045 [US3] Generate RegionInfoTooltipComponent using Angular CLI (ng generate component components/building-layout/region-info-tooltip --standalone)
- [ ] T046 [US3] Implement RegionInfoTooltipComponent in src/app/components/building-layout/region-info-tooltip.component.ts with position tracking
- [ ] T047 [US3] Create RegionInfoTooltipComponent template in src/app/components/building-layout/region-info-tooltip.component.html displaying region details
- [ ] T048 [US3] Create RegionInfoTooltipComponent styles in src/app/components/building-layout/region-info-tooltip.component.scss with positioning logic
- [ ] T049 [US3] Integrate RegionInfoTooltipComponent into BuildingLayoutComponent template

**Checkpoint**: All user stories should now be independently functional - full interactive visualization with configuration, rendering, and interaction

---

## Phase 6: Demo & Integration

**Purpose**: Create complete working example demonstrating all features

- [ ] T050 [P] Create sample configurations in src/app/examples/basic/building-layout-demo/sample-configs.ts
- [ ] T051 Generate demo component using Angular CLI (ng generate component examples/basic/building-layout-demo --standalone)
- [ ] T052 Implement demo component in src/app/examples/basic/building-layout-demo/demo.component.ts integrating BuildingLayoutComponent
- [ ] T053 Create demo component template in src/app/examples/basic/building-layout-demo/demo.component.html
- [ ] T054 Create demo component styles in src/app/examples/basic/building-layout-demo/demo.component.scss
- [X] T055 Update app component in src/app/app.component.ts to use demo component
- [X] T056 Update app component template in src/app/app.component.html with header and demo integration
- [X] T057 Update app component styles in src/app/app.component.scss

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add comprehensive inline comments to all TypeScript files explaining D3.js and Angular integration patterns
- [ ] T059 [P] Add JSDoc documentation to all public methods and interfaces
- [ ] T060 [P] Create README.md in project root with quickstart instructions and learning objectives
- [ ] T061 [P] Verify all tests pass by running ng test
- [ ] T062 [P] Run Angular production build (ng build --configuration production) and verify no errors
- [ ] T063 [P] Test in Chrome, Firefox, and Safari browsers for compatibility
- [ ] T064 [P] Performance test with 500 region configuration and verify <1s render time
- [ ] T065 [P] Verify zoom/pan performance at 60fps using browser dev tools
- [ ] T066 Take screenshots of working example for visual validation
- [ ] T067 [P] Update environment.ts with any configuration needed
- [ ] T068 [P] Add error handling for edge cases (empty configs, extreme coordinate ranges)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Demo & Integration (Phase 6)**: Depends on User Story 1 and 2 minimum (can proceed with P1+P2 while P3 is in progress)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 configuration service
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US2 rendering service

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/interfaces before services
- Services before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for CoordinateValidator.validateRegion in src/app/utils/coordinate-validator.spec.ts"
Task: "Unit test for CoordinateValidator.validateLayout in src/app/utils/coordinate-validator.spec.ts"
Task: "Unit test for LayoutConfigService.validateConfig in src/app/services/layout-config.service.spec.ts"

# Launch all parallel implementation tasks for User Story 1 together:
Task: "Implement CoordinateValidator utility class in src/app/utils/coordinate-validator.ts"
Task: "Create sample configuration data in src/assets/sample-data/building-layouts.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - can configs be created and validated?
5. Deploy/demo if ready

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP READY** (configuration management)
3. Add User Story 2 → Test independently → **Core Value Delivered** (visualization)
4. Add User Story 3 → Test independently → **Enhanced UX** (interaction)
5. Complete Demo & Polish → **Production Ready**

Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (configuration)
   - Developer B: User Story 2 (visualization) - can mock config service initially
   - Developer C: User Story 3 (interaction) - can mock renderer initially
3. Stories complete and integrate independently

---

## Task Count Summary

- **Total Tasks**: 68
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (User Story 1)**: 10 tasks (3 tests + 7 implementation)
- **Phase 4 (User Story 2)**: 20 tasks (4 tests + 16 implementation)
- **Phase 5 (User Story 3)**: 9 tasks (1 test + 8 implementation)
- **Phase 6 (Demo)**: 8 tasks
- **Phase 7 (Polish)**: 11 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run concurrently

**Independent Test Criteria Defined**: Yes, for all 3 user stories

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 20 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
