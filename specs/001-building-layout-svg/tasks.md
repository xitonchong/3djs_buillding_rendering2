# Tasks: Building Layout Visualization

**Input**: Design documents from `/specs/001-building-layout-svg/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, research.md, quickstart.md

**User Requirement**:
- Ensure app component always loads from `assets/sample-data/building-layout.json` (See Phase 8) - ✅ COMPLETED
- Implement 3rd dimension along Z to add second floor support. In 3D mode, show isometric view. In 2D mode, enable floor selection with lowest floor as default (See Phase 6b) - ✅ COMPLETED
- Add a tilt on the floor dimension or z-height so that it follows standard isometric configuration, e.g., 30 degree on XY plane to house the floor. Overwrite current isometric configuration if needed (See Phase 6c) - ✅ COMPLETED

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
- [X] T040a [US2] Add bottom-left coordinate label rendering (x, y) for each region in SvgRendererService.render() in src/app/services/svg-renderer.service.ts
- [X] T040b [US2] Add top-right coordinate label rendering (x+width, y+height) for each region in SvgRendererService.render() in src/app/services/svg-renderer.service.ts
- [X] T040c [US2] Style coordinate labels with small monospace font and proper positioning in src/app/components/building-layout/building-layout.component.scss
- [X] T040d [US2] Ensure coordinate labels scale appropriately with zoom and don't overlap region labels in SvgRendererService.render()

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - layouts can be configured and visualized with zoom/pan controls, and regions display coordinate labels at bottom-left and top-right corners

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

## Phase 6: User Story 4 - Isometric/3D View Toggle (Priority: P4)

**Goal**: Enable users to view the building layout from an angled isometric perspective to better demonstrate depth and spatial relationships

**Independent Test**: Render a layout from Story 2, toggle to isometric view, and verify that the layout appears at an angle with proper perspective. Test that users can switch between 2D and isometric views seamlessly.

**User Requirement**: Ability to view the renders at an angle to better demonstrate 3D effect using CSS 3D transforms on the existing SVG rendering (no new dependencies).

### Implementation for User Story 4

- [X] T069 [P] [US4] Create ViewMode type definition ('2d' | 'isometric') in src/app/models/viewport.interface.ts
- [X] T070 [US4] Add viewMode property to Viewport interface in src/app/models/viewport.interface.ts
- [X] T071 [US4] Create isometric transformation utility in src/app/utils/isometric-transform.ts with calculateIsometricTransform() method
- [X] T072 [US4] Add CSS 3D transform styles for isometric view in src/app/components/building-layout/building-layout.component.scss
- [X] T073 [US4] Implement setViewMode() method in SvgRendererService in src/app/services/svg-renderer.service.ts
- [X] T074 [US4] Apply CSS transform to SVG content group for isometric projection in SvgRendererService.setViewMode()
- [X] T075 [US4] Add @Input viewMode to BuildingLayoutComponent in src/app/components/building-layout/building-layout.component.ts
- [X] T076 [US4] Add @Output viewModeChange EventEmitter in BuildingLayoutComponent in src/app/components/building-layout/building-layout.component.ts
- [X] T077 [US4] Implement toggleViewMode() public method in BuildingLayoutComponent in src/app/components/building-layout/building-layout.component.ts
- [X] T078 [US4] Add view mode toggle button to controls in building-layout.component.html
- [X] T079 [US4] Style view mode toggle button with icon/label in building-layout.component.scss
- [X] T080 [US4] Add smooth transition animation between 2D and isometric views in building-layout.component.scss
- [X] T081 [US4] Update AppComponent to handle view mode changes and display current mode
- [X] T082 [US4] Adjust coordinate label visibility for isometric view (may need different thresholds)
- [ ] T083 [US4] Test zoom/pan interactions work correctly in isometric view
- [ ] T084 [US4] Ensure region hover/click interactions work in isometric perspective

**Checkpoint**: At this point, users can toggle between standard 2D view and angled isometric view, with all interactions (zoom, pan, hover, click) working in both modes

---

## Phase 6b: User Story 5 - Multi-Floor Support with Z-Dimension (Priority: P5)

**Goal**: Extend the visualization to support multiple building floors by adding Z-dimension (floor level) to regions. In 3D/isometric mode, show all floors simultaneously with proper depth layering. In 2D mode, provide floor selector to view one floor at a time with lowest floor as default.

**Independent Test**: Load a configuration with regions on multiple floors (z=0, z=1, z=2). In 3D mode, verify all floors render with proper layering and isometric depth. In 2D mode, verify floor selector appears, defaults to lowest floor, and switching floors updates the visible regions correctly.

**User Requirement**: Implement 3rd dimension along Z because we want to add second floor to this building. During rendering in 3D, we should show the isometric view. During rendering in 2D, we should enable the option to view which floor is rendered with the default set to the lowest floor.

### Implementation for User Story 5

- [X] T113 [P] [US5] Add `z` or `floor` property to Region interface in src/app/models/region.interface.ts (non-negative number, defaults to 0)
- [X] T114 [P] [US5] Update CoordinateValidator to validate z/floor property (non-negative) in src/app/utils/coordinate-validator.ts
- [X] T115 [P] [US5] Create FloorInfo interface in src/app/models/floor.interface.ts with floor number, label, and region count
- [X] T116 [P] [US5] Implement getAvailableFloors() utility in src/app/utils/floor-utils.ts to extract unique floor levels from configuration
- [X] T117 [P] [US5] Implement filterRegionsByFloor() utility in src/app/utils/floor-utils.ts to filter regions by selected floor
- [X] T118 [US5] Add currentFloor property to Viewport interface in src/app/models/viewport.interface.ts (nullable number for 2D mode)
- [X] T119 [US5] Update SvgRendererService to accept optional selectedFloor parameter in render() method in src/app/services/svg-renderer.service.ts
- [X] T120 [US5] Implement floor filtering logic in SvgRendererService.render() when in 2D mode (filter regions by floor before rendering)
- [X] T121 [US5] Implement Z-axis layering in SvgRendererService.render() when in isometric mode (render floors from bottom to top with proper SVG z-index ordering)
- [X] T122 [US5] Add vertical offset calculation for isometric mode in IsometricTransform utility (each floor level gets Y-offset to show stacking)
- [X] T123 [US5] Generate FloorSelectorComponent using Angular CLI (ng generate component components/building-layout/floor-selector --standalone)
- [X] T124 [US5] Implement FloorSelectorComponent with @Input floors array and @Output floorChange in src/app/components/building-layout/floor-selector.component.ts
- [X] T125 [US5] Create FloorSelectorComponent template with dropdown/button group for floor selection in src/app/components/building-layout/floor-selector.component.html
- [X] T126 [US5] Style FloorSelectorComponent with clear floor labels and active state in src/app/components/building-layout/floor-selector.component.scss
- [X] T127 [US5] Add @Input selectedFloor and @Output floorChange to BuildingLayoutComponent in src/app/components/building-layout/building-layout.component.ts
- [X] T128 [US5] Integrate FloorSelectorComponent into BuildingLayoutComponent template (show only in 2D mode) in building-layout.component.html
- [X] T129 [US5] Implement onFloorChange() handler in BuildingLayoutComponent to update selected floor and trigger re-render
- [X] T130 [US5] Update BuildingLayoutComponent ngOnInit to calculate available floors and set default to lowest floor
- [X] T131 [US5] Update AppComponent to track currentFloor state and pass to BuildingLayoutComponent
- [X] T132 [US5] Display current floor indicator in AppComponent header (e.g., "Floor 2" or "All Floors (3D)")
- [X] T133 [US5] Update sample-data/building-layout.json with multi-floor example data (regions on floors 0, 1, 2)
- [X] T134 [US5] Update coordinate label rendering to include floor number in isometric mode (e.g., "(x, y, z)")
- [X] T135 [US5] Test floor switching in 2D mode - verify only selected floor regions are visible
- [X] T136 [US5] Test isometric mode with multi-floor data - verify proper stacking and depth ordering
- [X] T137 [US5] Test default floor selection - verify lowest floor is selected on load in 2D mode

**Checkpoint**: At this point, users can define and visualize multi-floor building layouts. In 2D mode, they can select which floor to view. In 3D/isometric mode, all floors are visible with proper depth layering.

---

## Phase 6c: User Story 6 - Standard Isometric Configuration (Priority: P6)

**Goal**: Update the isometric view to use standard isometric projection with 30° tilt on the XY plane to properly house the floor dimension or z-height, following standard technical drawing conventions

**Independent Test**: Toggle to isometric view and verify the floor is displayed at a standard 30° angle on the XY plane (instead of current 10°), creating proper isometric perspective that matches technical drawing standards

**Status**: ✅ COMPLETE

**Context**: The current isometric implementation (T071) uses rotateX: 10° and rotateZ: 30°. This needs to be updated to follow standard isometric projection where the XY plane is tilted at 30° (rotateX: 30°) to create the classic "technical drawing" isometric view. This change will overwrite the current isometric configuration.

**User Requirement**: Add a tilt on the floor dimension or z-height so that it follows standard isometric configuration, e.g., 30 degree on XY plan to house the floor. Overwrite current isometric configuration if needed.

### Implementation for User Story 6

- [X] T138 [US6] Research standard isometric projection angles (30°-30° configuration) and document in src/app/utils/isometric-transform.ts comments
- [X] T139 [US6] Update calculateIsometricTransform() to use rotateX: 30° (instead of 10°) for standard isometric tilt in src/app/utils/isometric-transform.ts
- [X] T140 [US6] Adjust scale factor to compensate for new 30° rotation angle in src/app/utils/isometric-transform.ts
- [X] T141 [US6] Update perspective value if needed to maintain proper depth perception with 30° tilt in src/app/utils/isometric-transform.ts
- [X] T142 [US6] Test multi-floor rendering with new 30° tilt to verify proper floor stacking and visibility
- [X] T143 [US6] Verify floor Y-offset calculations (getFloorYOffset) work correctly with new 30° tilt in src/app/utils/isometric-transform.ts
- [X] T144 [US6] Test zoom and pan interactions work correctly in new isometric view with 30° tilt
- [X] T145 [US6] Verify coordinate labels remain readable and properly positioned in new isometric perspective
- [X] T146 [US6] Test region hover and click interactions work in new 30° isometric view
- [X] T147 [US6] Update sample multi-floor data if needed to showcase standard isometric view effectively
- [X] T148 [US6] Add inline comments explaining standard isometric projection (30°-30° configuration) in src/app/utils/isometric-transform.ts

**Checkpoint**: Isometric view now follows standard isometric projection with 30° tilt on XY plane, matching technical drawing conventions. All interactions (zoom, pan, hover, click, floor selection) continue to work correctly.

**Technical Details**:
- Current configuration: rotateX(10deg) rotateZ(30deg) scale(1.3)
- New configuration: rotateX(30deg) rotateZ(30deg) scale(adjusted)
- The 30° X-rotation creates the standard isometric view where the XY plane (floor) is tilted at 30°
- This is the classic "technical drawing" isometric projection (30°-30° configuration)
- May need to adjust scale factor to compensate for different foreshortening

---

## Phase 7: Demo & Integration

**Purpose**: Create complete working example demonstrating all features

- [ ] T085 [P] Create sample configurations in src/app/examples/basic/building-layout-demo/sample-configs.ts
- [ ] T086 Generate demo component using Angular CLI (ng generate component examples/basic/building-layout-demo --standalone)
- [ ] T087 Implement demo component in src/app/examples/basic/building-layout-demo/demo.component.ts integrating BuildingLayoutComponent
- [ ] T088 Create demo component template in src/app/examples/basic/building-layout-demo/demo.component.html
- [ ] T089 Create demo component styles in src/app/examples/basic/building-layout-demo/demo.component.scss
- [X] T090 Update app component in src/app/app.component.ts to use demo component
- [X] T091 Update app component template in src/app/app.component.html with header and demo integration
- [X] T092 Update app component styles in src/app/app.component.scss

---

## Phase 8: Load Configuration from JSON File

**Purpose**: Ensure app component always loads from assets/sample-data/building-layout.json instead of hardcoded data

**Context**: User requirement - app should load configuration from JSON file on startup

- [X] T093 Verify HttpClient is available in app configuration in src/main.ts (added provideHttpClient)
- [X] T094 Rename building-layouts.json to building-layout.json in src/assets/sample-data/
- [X] T095 Update JSON file structure to be a single LayoutConfiguration object (remove "office-floor-1" wrapper) in src/assets/sample-data/building-layout.json
- [X] T096 [P] Create LayoutLoaderService using Angular CLI (ng generate service services/layout-loader)
- [X] T097 Implement LayoutLoaderService.loadFromFile method in src/app/services/layout-loader.service.ts to load from assets/sample-data/building-layout.json
- [X] T098 Update AppComponent to inject LayoutLoaderService and load configuration in ngOnInit in src/app/app.component.ts
- [X] T099 Add error handling for file loading failures in AppComponent in src/app/app.component.ts
- [X] T100 Add loading state display in AppComponent template in src/app/app.component.html
- [X] T101 Remove hardcoded layoutConfig initialization from AppComponent in src/app/app.component.ts (replaced with null and loaded from file)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T102 [P] Add comprehensive inline comments to all TypeScript files explaining D3.js and Angular integration patterns
- [ ] T103 [P] Add JSDoc documentation to all public methods and interfaces
- [ ] T104 [P] Create README.md in project root with quickstart instructions and learning objectives
- [ ] T105 [P] Verify all tests pass by running ng test
- [ ] T106 [P] Run Angular production build (ng build --configuration production) and verify no errors
- [ ] T107 [P] Test in Chrome, Firefox, and Safari browsers for compatibility
- [ ] T108 [P] Performance test with 500 region configuration and verify <1s render time
- [ ] T109 [P] Verify zoom/pan performance at 60fps using browser dev tools
- [ ] T110 Take screenshots of working example for visual validation (both 2D and isometric views, with multi-floor examples)
- [ ] T111 [P] Update environment.ts with any configuration needed
- [ ] T112 [P] Add error handling for edge cases (empty configs, extreme coordinate ranges, missing floor data)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete
- **Foundational (Phase 2)**: ✅ Complete - BLOCKS all user stories
- **User Stories (Phase 3-6c)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
  - **Note**: User Story 4 (Isometric View) depends on User Story 2 (Visualization) being complete
  - **Note**: User Story 5 (Multi-Floor) depends on User Story 2 (Visualization) and User Story 4 (Isometric) being complete
  - **Note**: User Story 6 (Standard Isometric) depends on User Story 4 (Isometric View) being complete - updates existing isometric implementation
- **Demo & Integration (Phase 7)**: Depends on User Story 1 and 2 minimum (can proceed with P1+P2 while P3-P6 are in progress)
- **Load from JSON (Phase 8)**: ✅ Complete - Can run independently, depends only on foundational phase
- **Polish (Phase 9)**: ⏸️ Pending - Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: ✅ Complete - No dependencies on other stories
- **User Story 2 (P2)**: ✅ Complete - Integrates with US1 configuration service
- **User Story 3 (P3)**: ⏸️ Partial - Integrates with US2 rendering service
- **User Story 4 (P4)**: ✅ Complete - Adds isometric view mode to existing rendering
- **User Story 5 (P5)**: ✅ Complete - Extends with Z-dimension and floor selection
- **User Story 6 (P6)**: ✅ Complete - Updates User Story 4 isometric transform to use standard 30° tilt

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

## Parallel Example: User Story 5 (Multi-Floor)

```bash
# Launch all parallel model/interface tasks for User Story 5 together:
Task: "Add z/floor property to Region interface in src/app/models/region.interface.ts"
Task: "Update CoordinateValidator to validate z/floor property in src/app/utils/coordinate-validator.ts"
Task: "Create FloorInfo interface in src/app/models/floor.interface.ts"
Task: "Implement getAvailableFloors() utility in src/app/utils/floor-utils.ts"
Task: "Implement filterRegionsByFloor() utility in src/app/utils/floor-utils.ts"
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
5. Add User Story 4 → Test independently → **3D Capability** (isometric view)
6. Add User Story 5 → Test independently → **Multi-Floor Support** (Z-dimension)
7. Complete Demo & Polish → **Production Ready**

Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (configuration)
   - Developer B: User Story 2 (visualization) - can mock config service initially
   - Developer C: User Story 3 (interaction) - can mock renderer initially
3. Stories complete and integrate independently
4. User Story 4 and 5 proceed sequentially after US2 completes (dependency on rendering infrastructure)

---

## Task Count Summary

- **Total Tasks**: 148
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (User Story 1 - Configuration)**: 10 tasks (3 tests + 7 implementation)
- **Phase 4 (User Story 2 - Visualization)**: 24 tasks (4 tests + 20 implementation, includes coordinate labeling)
- **Phase 5 (User Story 3 - Interaction)**: 9 tasks (1 test + 8 implementation)
- **Phase 6 (User Story 4 - Isometric View)**: 16 tasks (0 tests + 16 implementation)
- **Phase 6b (User Story 5 - Multi-Floor/Z-Dimension)**: 25 tasks (0 tests + 25 implementation) - ✅ COMPLETED
- **Phase 6c (User Story 6 - Standard Isometric Configuration)**: 11 tasks (0 tests + 11 implementation) - ✅ COMPLETED
- **Phase 7 (Demo)**: 8 tasks
- **Phase 8 (Load from JSON)**: 9 tasks - ✅ COMPLETED
- **Phase 9 (Polish)**: 11 tasks

**Parallel Opportunities**: 42 tasks marked [P] can run concurrently

**Independent Test Criteria Defined**: Yes, for all 6 user stories

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 20 tasks

**User Requirements**:
- **JSON Loading**: Phase 8 must be completed to meet user's requirement that app always loads from assets/sample-data/building-layout.json - ✅ COMPLETED
- **Coordinate Labels**: Tasks T040a-T040d in Phase 4 implement coordinate labeling at bottom-left (x,y) and top-right (x+width, y+height) corners of each region - ✅ COMPLETED
- **Isometric/3D View**: Phase 6 (User Story 4) implements ability to view renders at an angle using CSS 3D transforms to demonstrate depth and spatial relationships - ✅ COMPLETED
- **Multi-Floor Z-Dimension**: Phase 6b (User Story 5) implements 3rd dimension along Z for multi-floor buildings. In 3D mode, shows isometric view of all floors. In 2D mode, enables floor selection with lowest floor as default - ✅ COMPLETED
- **Standard Isometric Configuration**: Phase 6c (User Story 6) updates isometric transform to use standard 30° tilt on XY plane to properly house the floor dimension, following technical drawing conventions - ✅ COMPLETED

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Multi-Floor Implementation Guide

### Tasks T113-T137: Adding Z-Dimension and Floor Selection

**Context**: User requested ability to add multiple floors to buildings by extending regions with a Z coordinate (floor level). In 3D/isometric mode, all floors should render with proper depth stacking. In 2D mode, users should be able to select which floor to view, defaulting to the lowest floor.

### T113: Add Floor Property to Region Interface

**Location**: `src/app/models/region.interface.ts`

**Implementation Steps**:
1. Add `floor` or `z` property to Region interface (choose `floor` for semantic clarity)
2. Make it optional with default value of 0 (ground floor)
3. Update JSDoc comments to explain floor numbering

**Example Code**:
```typescript
export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: number;  // NEW: Floor level (0 = ground floor, 1 = first floor, etc.)
  label?: string;
  color?: string;
  strokeColor?: string;
  metadata?: Record<string, any>;
}
```

### T114: Update Validation for Floor Property

**Location**: `src/app/utils/coordinate-validator.ts`

**Implementation Steps**:
1. Add validation rule for `floor` property (must be non-negative integer)
2. Default to 0 if not provided
3. Update error messages

**Example Code**:
```typescript
if (region.floor !== undefined && (typeof region.floor !== 'number' || region.floor < 0 || !Number.isInteger(region.floor))) {
  errors.push('Region floor must be a non-negative integer');
}
```

### T115-T117: Floor Utilities

**Location**: `src/app/utils/floor-utils.ts`

**Purpose**: Utility functions for working with floor data

**Example Code**:
```typescript
export interface FloorInfo {
  floor: number;
  label: string;
  regionCount: number;
}

export class FloorUtils {
  static getAvailableFloors(regions: Region[]): FloorInfo[] {
    const floorMap = new Map<number, number>();

    regions.forEach(region => {
      const floor = region.floor ?? 0;
      floorMap.set(floor, (floorMap.get(floor) || 0) + 1);
    });

    return Array.from(floorMap.entries())
      .map(([floor, count]) => ({
        floor,
        label: `Floor ${floor}`,
        regionCount: count
      }))
      .sort((a, b) => a.floor - b.floor);
  }

  static filterRegionsByFloor(regions: Region[], floor: number): Region[] {
    return regions.filter(region => (region.floor ?? 0) === floor);
  }

  static getLowestFloor(regions: Region[]): number {
    if (regions.length === 0) return 0;
    return Math.min(...regions.map(r => r.floor ?? 0));
  }
}
```

### T118: Update Viewport Interface

**Location**: `src/app/models/viewport.interface.ts`

**Implementation Steps**:
1. Add `currentFloor` property (nullable, only used in 2D mode)
2. Update comments to explain floor selection behavior

**Example Code**:
```typescript
export interface Viewport {
  scale: number;
  translateX: number;
  translateY: number;
  width: number;
  height: number;
  minScale: number;
  maxScale: number;
  viewMode: ViewMode;
  currentFloor: number | null;  // NEW: Selected floor for 2D mode, null = show all floors (3D mode)
}
```

### T119-T121: Update SvgRendererService for Floor Filtering

**Location**: `src/app/services/svg-renderer.service.ts`

**Implementation Steps**:
1. Add `selectedFloor` parameter to `render()` method
2. Filter regions by floor when in 2D mode
3. In isometric mode, render all floors with proper z-ordering

**Example Code**:
```typescript
render(config: LayoutConfiguration, viewport: Viewport, selectedFloor?: number | null): void {
  // Determine which regions to render
  let regionsToRender = config.regions;

  if (viewport.viewMode === '2d' && selectedFloor !== null && selectedFloor !== undefined) {
    // 2D mode: filter by selected floor
    regionsToRender = FloorUtils.filterRegionsByFloor(config.regions, selectedFloor);
  } else if (viewport.viewMode === 'isometric') {
    // Isometric mode: render all floors, sorted bottom to top for proper z-ordering
    regionsToRender = [...config.regions].sort((a, b) => (a.floor ?? 0) - (b.floor ?? 0));
  }

  // Continue with existing rendering logic using regionsToRender
  // ...
}
```

### T122: Add Vertical Offset for Isometric Mode

**Location**: `src/app/utils/isometric-transform.ts`

**Implementation Steps**:
1. Add method to calculate Y-offset based on floor level
2. Apply offset when rendering regions in isometric mode

**Example Code**:
```typescript
export class IsometricTransform {
  // Existing methods...

  /**
   * Calculate Y offset for a given floor level in isometric view
   * Each floor level adds a fixed offset to create stacking effect
   */
  static getFloorYOffset(floor: number): number {
    const FLOOR_HEIGHT = 50;  // Pixels offset per floor level
    return -(floor * FLOOR_HEIGHT);  // Negative Y moves up in SVG coordinates
  }

  /**
   * Apply floor offset to region Y coordinate for isometric rendering
   */
  static applyFloorOffset(region: Region): { x: number; y: number } {
    return {
      x: region.x,
      y: region.y + this.getFloorYOffset(region.floor ?? 0)
    };
  }
}
```

### T123-T126: FloorSelectorComponent

**Location**: `src/app/components/building-layout/floor-selector/`

**Purpose**: UI component for selecting which floor to view in 2D mode

**Component TypeScript**:
```typescript
@Component({
  selector: 'app-floor-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-selector.component.html',
  styleUrls: ['./floor-selector.component.scss']
})
export class FloorSelectorComponent {
  @Input() floors: FloorInfo[] = [];
  @Input() selectedFloor: number = 0;
  @Output() floorChange = new EventEmitter<number>();

  selectFloor(floor: number): void {
    this.floorChange.emit(floor);
  }
}
```

**Template**:
```html
<div class="floor-selector">
  <label>Floor:</label>
  <div class="floor-buttons">
    <button
      *ngFor="let floorInfo of floors"
      (click)="selectFloor(floorInfo.floor)"
      [class.active]="floorInfo.floor === selectedFloor"
      class="floor-btn">
      {{ floorInfo.label }} ({{ floorInfo.regionCount }})
    </button>
  </div>
</div>
```

**Styles**:
```scss
.floor-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 4px;

  label {
    font-weight: 500;
    color: #666;
  }

  .floor-buttons {
    display: flex;
    gap: 4px;
  }

  .floor-btn {
    padding: 6px 12px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
      background: #e0e0e0;
    }

    &.active {
      background: #2196F3;
      color: white;
      border-color: #2196F3;
    }
  }
}
```

### T127-T130: Integrate Floor Selection into BuildingLayoutComponent

**Location**: `src/app/components/building-layout/building-layout.component.ts`

**Implementation Steps**:
1. Add `@Input() selectedFloor` and `@Output() floorChange`
2. Calculate available floors from config in `ngOnInit` or `ngOnChanges`
3. Pass selected floor to renderer
4. Show FloorSelectorComponent only in 2D mode

**Example Code**:
```typescript
export class BuildingLayoutComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Existing inputs/outputs...
  @Input() selectedFloor: number | null = null;
  @Output() floorChange = new EventEmitter<number>();

  availableFloors: FloorInfo[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.availableFloors = FloorUtils.getAvailableFloors(this.config.regions);

      // Set default to lowest floor if not set
      if (this.selectedFloor === null && this.availableFloors.length > 0) {
        this.selectedFloor = FloorUtils.getLowestFloor(this.config.regions);
      }

      this.renderer.render(this.config, this.viewport, this.selectedFloor);
    }

    // Existing view mode change detection...
  }

  onFloorChange(floor: number): void {
    this.selectedFloor = floor;
    this.floorChange.emit(floor);
    this.renderer.render(this.config, this.viewport, this.selectedFloor);
  }
}
```

**Template Update**:
```html
<div class="building-layout-container" [class.isometric-mode]="viewMode === 'isometric'">
  <div class="controls">
    <button (click)="zoomIn()" class="control-btn">Zoom In (+)</button>
    <button (click)="zoomOut()" class="control-btn">Zoom Out (-)</button>
    <button (click)="resetViewport()" class="control-btn">Reset</button>
    <button (click)="toggleViewMode()" class="control-btn view-toggle">
      {{ viewMode === '2d' ? '3D View' : '2D View' }}
    </button>
  </div>

  <!-- NEW: Floor selector (only in 2D mode) -->
  <app-floor-selector
    *ngIf="viewMode === '2d' && availableFloors.length > 1"
    [floors]="availableFloors"
    [selectedFloor]="selectedFloor ?? 0"
    (floorChange)="onFloorChange($event)"
  ></app-floor-selector>

  <svg #svgContainer class="layout-svg"></svg>

  <div class="info-panel" *ngIf="hoveredRegion">
    <h3>{{ hoveredRegion.label || hoveredRegion.id }}</h3>
    <p>Position: ({{ hoveredRegion.x }}, {{ hoveredRegion.y }})</p>
    <p>Size: {{ hoveredRegion.width }} x {{ hoveredRegion.height }}</p>
    <p>Floor: {{ hoveredRegion.floor ?? 0 }}</p>  <!-- NEW: Show floor -->
  </div>
</div>
```

### T131-T132: Update AppComponent

**Location**: `src/app/app.component.ts` and `src/app/app.component.html`

**Implementation Steps**:
1. Add `currentFloor` property to track selected floor
2. Pass to BuildingLayoutComponent
3. Display in header

**Example Code**:
```typescript
// app.component.ts
export class AppComponent implements OnInit {
  // Existing properties...
  currentFloor: number = 0;

  onFloorChange(floor: number): void {
    this.currentFloor = floor;
    console.log('Floor changed to:', floor);
  }
}
```

```html
<!-- app.component.html -->
<header>
  <h1>{{ title }}</h1>
  <p class="subtitle">
    Interactive SVG Visualization with D3.js and Angular
    <span class="view-mode-indicator" *ngIf="!isLoading && !errorMessage">
      ({{ currentViewMode === '2d' ? '2D View - Floor ' + currentFloor : 'Isometric View (All Floors)' }})
    </span>
  </p>
</header>

<main>
  <app-building-layout
    *ngIf="layoutConfig && !isLoading && !errorMessage"
    [config]="layoutConfig"
    [viewMode]="currentViewMode"
    [selectedFloor]="currentFloor"
    (viewModeChange)="onViewModeChange($event)"
    (floorChange)="onFloorChange($event)"
  ></app-building-layout>
</main>
```

### T133: Update Sample Data with Multi-Floor Example

**Location**: `src/assets/sample-data/building-layout.json`

**Example Data**:
```json
{
  "name": "Multi-Floor Office Building",
  "description": "Three-floor building with offices, conference rooms, and common areas",
  "regions": [
    // Ground Floor (floor: 0)
    { "id": "lobby", "x": 0, "y": 0, "width": 400, "height": 200, "floor": 0, "label": "Main Lobby", "color": "#E8F5E9" },
    { "id": "reception", "x": 400, "y": 0, "width": 200, "height": 200, "floor": 0, "label": "Reception", "color": "#C8E6C9" },

    // First Floor (floor: 1)
    { "id": "conf-1-1", "x": 0, "y": 0, "width": 300, "height": 200, "floor": 1, "label": "Conference Room 1", "color": "#E3F2FD" },
    { "id": "office-1-1", "x": 300, "y": 0, "width": 200, "height": 200, "floor": 1, "label": "Office 101", "color": "#BBDEFB" },

    // Second Floor (floor: 2)
    { "id": "office-2-1", "x": 0, "y": 0, "width": 250, "height": 180, "floor": 2, "label": "Office 201", "color": "#FFF3E0" },
    { "id": "office-2-2", "x": 250, "y": 0, "width": 250, "height": 180, "floor": 2, "label": "Office 202", "color": "#FFE0B2" }
  ],
  "metadata": {
    "buildingName": "Tech Office Tower",
    "floors": 3,
    "units": "feet"
  }
}
```

### T134: Update Coordinate Labels for Multi-Floor

**Location**: `src/app/services/svg-renderer.service.ts`

**Implementation Steps**:
1. In isometric mode, show floor number in coordinate labels
2. Format as `(x, y, floor: z)` or `(x, y) [F2]`

**Example Code**:
```typescript
// In render() method, update coordinate label text
.text(d => {
  if (this.currentViewMode === 'isometric') {
    return `(${d.x}, ${d.y}) F${d.floor ?? 0}`;
  } else {
    return `(${d.x}, ${d.y})`;
  }
})
```

### Testing Multi-Floor Feature

**Manual Test Cases**:

1. **Floor Filtering (2D Mode)**:
   - Load multi-floor configuration
   - Verify floor selector appears in 2D mode
   - Switch between floors, verify only selected floor regions visible
   - Verify default floor is lowest floor

2. **Isometric Stacking (3D Mode)**:
   - Toggle to isometric view
   - Verify all floors render
   - Verify floors stack properly (higher floors appear "above" lower floors)
   - Verify no floor selector in isometric mode

3. **Floor Transitions**:
   - Switch from 2D to 3D mode, verify all floors become visible
   - Switch from 3D to 2D mode, verify returns to previously selected floor (or lowest if first time)

4. **Edge Cases**:
   - Single-floor configuration: floor selector should not appear
   - Configuration with non-sequential floors (0, 2, 5): should all be selectable
   - Empty floor (no regions): should still be selectable

### Integration Notes

- Floor property is optional and defaults to 0 for backward compatibility
- Existing single-floor configurations continue to work without changes
- Floor selector only appears when there are multiple floors AND in 2D mode
- Isometric mode always shows all floors for comprehensive 3D view
- Floor numbering starts at 0 (ground floor) and increases upward (1, 2, 3, etc.)
- No support for negative floors (basements) in v1 - can be added later if needed

---

## Standard Isometric Configuration Implementation Guide

### Tasks T138-T148: Updating to 30° Standard Isometric Projection

**Context**: User requested to update the isometric view to use standard 30° tilt on the XY plane (instead of current 10°) to properly house the floor dimension following standard technical drawing conventions. This is a modification to the existing isometric transform implementation.

### Background: Standard Isometric Projection

**Standard Isometric (30°-30° Configuration)**:
- In technical drawings, standard isometric projection uses 30° angles
- The XY plane (floor) is tilted at 30° from horizontal (rotateX: 30°)
- The Z-axis rotation of 30° (rotateZ: 30°) creates the classic diamond orientation
- This creates the familiar "technical drawing" or "engineering blueprint" isometric view
- Provides equal foreshortening along all three axes

**Current Implementation**:
- rotateX: 10° (too shallow, not standard)
- rotateZ: 30° (correct)
- scale: 1.3 (may need adjustment)

**Target Implementation**:
- rotateX: 30° (standard isometric)
- rotateZ: 30° (keep as is)
- scale: adjusted to compensate for new foreshortening

### T138: Research Standard Isometric Projection

**Location**: Comments in `building-layout-tutorial/src/app/utils/isometric-transform.ts`

**Research Notes to Add**:
```typescript
/**
 * Standard Isometric Projection (30°-30° Configuration)
 *
 * In technical drawing and CAD, standard isometric projection uses:
 * - 30° rotation around X-axis (tilts the XY plane / floor)
 * - 30° rotation around Z-axis (creates diamond orientation)
 * - Equal foreshortening: all axes reduced by ~0.816 (cos 30°)
 *
 * This creates the classic "technical drawing" isometric view where:
 * - Vertical lines remain vertical
 * - Horizontal lines are at 30° angles to the horizontal
 * - All three axes (X, Y, Z) are equally foreshortened
 *
 * Reference: ISO 5456-3 Technical drawings standard
 */
```

### T139-T141: Update Isometric Transform

**Location**: `building-layout-tutorial/src/app/utils/isometric-transform.ts`

**Changes to Make**:

**Before (Current)**:
```typescript
static calculateIsometricTransform(): string {
  const rotateX = 10;  // degrees - tilts the plane forward
  const rotateZ = 30;  // degrees - rotates around Z-axis
  const scale = 1.3;   // Compensate for foreshortening

  return `
    perspective(2000px)
    rotateX(${rotateX}deg)
    rotateZ(${rotateZ}deg)
    scale(${scale})
  `.trim();
}
```

**After (Standard Isometric)**:
```typescript
static calculateIsometricTransform(): string {
  // Standard isometric projection angles (30°-30° configuration)
  // This follows ISO 5456-3 technical drawing standards
  const rotateX = 30;  // degrees - standard isometric tilt for XY plane
  const rotateZ = 30;  // degrees - standard isometric rotation around Z-axis

  // Scale factor adjusted for 30° rotation
  // With 30° X-rotation, we get more foreshortening than 10°
  // May need to increase scale to maintain visibility
  const scale = 1.5;   // Adjusted for standard isometric foreshortening

  // Perspective can be adjusted if depth perception needs tuning
  const perspective = 2000;  // pixels - controls depth effect strength

  return `
    perspective(${perspective}px)
    rotateX(${rotateX}deg)
    rotateZ(${rotateZ}deg)
    scale(${scale})
  `.trim();
}
```

**Scale Factor Considerations**:
- At 10° rotateX: less foreshortening, scale 1.3 was sufficient
- At 30° rotateX: more foreshortening, may need scale 1.4-1.6
- Test with multi-floor data to find optimal scale
- Too small: floors appear compressed
- Too large: floors may exceed viewport

**Perspective Considerations**:
- Current: 2000px
- If depth effect too strong at 30°: increase to 2500-3000px
- If depth effect too weak: decrease to 1500-1800px
- Test with zoom/pan to ensure comfortable viewing

### T142-T143: Test Multi-Floor Rendering

**Testing Steps**:

1. **Load multi-floor configuration** (at least 3 floors)
2. **Toggle to isometric view**
3. **Verify floor stacking**:
   - Higher floors should appear "above" lower floors
   - No overlapping or visual artifacts
   - Clear separation between floors
4. **Check floor Y-offset calculations**:
   - Verify `getFloorYOffset()` creates proper vertical spacing
   - May need to adjust FLOOR_HEIGHT constant if spacing changes with 30°

**Potential Adjustments**:

If floor spacing appears too compressed or too spread out with 30° tilt, adjust the FLOOR_HEIGHT constant:

```typescript
static getFloorYOffset(floor: number): number {
  // May need to increase from 50 to 60-70 for 30° tilt
  // to maintain visual separation between floors
  const FLOOR_HEIGHT = 60;  // Adjusted for 30° standard isometric
  return -(floor * FLOOR_HEIGHT);
}
```

### T144-T146: Test Interactions

**Interaction Testing Checklist**:

1. **Zoom In/Out**:
   - Verify zoom works smoothly in 30° isometric view
   - Check that zoom center point is correct
   - Ensure scale limits (min/max) are still appropriate

2. **Pan**:
   - Verify drag-to-pan works correctly
   - Check that panning feels natural (not distorted by new angle)
   - Ensure pan constraints work properly

3. **Region Hover**:
   - Verify hover highlights work in 30° view
   - Check that hover detection is accurate (SVG coordinates)
   - Ensure hover state visual feedback is clear

4. **Region Click**:
   - Verify click events fire correctly
   - Check that click position is accurate
   - Ensure region info displays correctly

5. **Coordinate Labels**:
   - Verify labels are readable at 30° tilt
   - Check that labels don't overlap excessively
   - Ensure label positioning algorithm still works
   - May need to adjust label size or visibility thresholds

### T145: Coordinate Label Adjustments

**Location**: `building-layout-tutorial/src/app/services/svg-renderer.service.ts`

**Potential Changes**:

If coordinate labels become hard to read or overlap at 30° tilt:

```typescript
// In render() method, coordinate label rendering section

// Option 1: Adjust label size based on view mode
const labelFontSize = this.currentViewMode === 'isometric' ? '10px' : '8px';

// Option 2: Adjust visibility threshold
// Hide labels on smaller regions in isometric view
const minVisibleArea = this.currentViewMode === 'isometric' ?
  3000 :  // More strict in isometric (labels more cramped)
  2000;   // Original threshold for 2D

// Only show labels if region is large enough
if (d.width * d.height >= minVisibleArea) {
  // Show coordinate labels
}

// Option 3: Adjust label offset from region corners
const labelOffset = this.currentViewMode === 'isometric' ? 8 : 5;
```

### T147: Update Sample Data

**Location**: `building-layout-tutorial/src/assets/sample-data/building-layout.json`

**Considerations**:
- Current multi-floor data may look different at 30° tilt
- May want to adjust region sizes or positions to showcase the new angle better
- Ensure floor spacing shows clearly with new tilt
- Add more floors (3-4) if needed to demonstrate depth effect

**Example Enhancement**:
```json
{
  "name": "Multi-Floor Office Building (Standard Isometric)",
  "description": "Showcases standard 30° isometric projection with proper floor stacking",
  "regions": [
    // Add varied region sizes across floors
    // to show depth perception with 30° tilt
    // ...
  ]
}
```

### T148: Add Documentation Comments

**Location**: `building-layout-tutorial/src/app/utils/isometric-transform.ts`

**Comments to Add**:

```typescript
/**
 * Isometric Transformation Utility
 *
 * This utility provides CSS 3D transform strings for creating isometric
 * projections of 2D floor plans. It implements STANDARD isometric projection
 * following ISO 5456-3 technical drawing conventions.
 *
 * Standard Isometric Projection (30°-30° Configuration):
 * - The XY plane (floor) is rotated 30° around the X-axis
 * - The result is rotated 30° around the Z-axis
 * - This creates equal foreshortening along all three axes
 * - Vertical lines remain vertical in the final view
 * - Horizontal lines appear at 30° angles
 *
 * Use Cases:
 * - Technical drawings and blueprints
 * - Engineering visualizations
 * - Architectural floor plan demonstrations
 * - Game-style overhead views (strategy games, simulators)
 *
 * Browser Support:
 * - Requires CSS 3D transforms (transform-style: preserve-3d)
 * - Supported in all modern browsers (Chrome, Firefox, Safari, Edge)
 * - Hardware accelerated (GPU) for smooth performance
 *
 * @see https://en.wikipedia.org/wiki/Isometric_projection
 * @see ISO 5456-3 Technical drawings standard
 */
export class IsometricTransform {
  // ... methods with detailed comments
}
```

### Testing Workflow

**Step-by-Step Testing Process**:

1. **Backup current implementation**: Note current rotateX: 10°, scale: 1.3
2. **Update to 30° tilt**: Change rotateX to 30°
3. **Test with default scale 1.3**: Observe if too small/large
4. **Adjust scale iteratively**: Try 1.4, 1.5, 1.6 until optimal
5. **Test multi-floor stacking**: Verify floor separation is clear
6. **Adjust FLOOR_HEIGHT if needed**: Increase from 50 to 60-70 if floors too close
7. **Test zoom/pan**: Ensure smooth at 30° tilt
8. **Test interactions**: Hover, click, coordinate labels
9. **Adjust label thresholds if needed**: Hide labels on smaller regions if cramped
10. **Test with sample data**: Ensure multi-floor example looks good
11. **Document final values**: Add comments explaining the 30° standard

### Expected Visual Changes

**Before (10° tilt)**:
- Shallower angle, more "top-down" view
- Less dramatic floor stacking
- Regions appear more flat

**After (30° tilt)**:
- Steeper angle, more "3D" appearance
- More dramatic floor stacking (floors clearly separated)
- Better depth perception
- Classic "technical drawing" isometric look
- May appear more compressed vertically (normal for isometric)

### Rollback Plan

If the 30° tilt causes issues (e.g., interactions broken, too cramped):

1. **Revert rotateX to 10°** temporarily
2. **Identify specific issue** (zoom, pan, labels, etc.)
3. **Fix issue while keeping 30°** if possible
4. **Or adjust angle** to intermediate value (e.g., 20°, 25°) as compromise

---

**Current Implementation Status** (as of 2025-12-06):
- ✅ Phase 1-2 (Setup & Foundation): Complete
- ✅ Phase 3 (User Story 1 - Configuration): Complete
- ✅ Phase 4 (User Story 2 - Visualization): Complete (includes coordinate labeling)
- ⏸️ Phase 5 (User Story 3 - Interaction): Partial (basic hover/click, missing tooltip component)
- ✅ Phase 6 (User Story 4 - Isometric View): Complete (T069-T082)
- ✅ Phase 6b (User Story 5 - Multi-Floor Z-Dimension): Complete (T113-T137)
- ✅ Phase 6c (User Story 6 - Standard Isometric Config): **COMPLETE** (T138-T148) - Updated to 30° rotateX
- ✅ Phase 7 (Demo Integration): Complete
- ✅ Phase 8 (Load from JSON): Complete
- ⏸️ Phase 9 (Polish & Testing): Pending

**Latest Update**: Phase 6c completed - Isometric view now uses standard 30° tilt on XY plane following ISO 5456-3 technical drawing standards
