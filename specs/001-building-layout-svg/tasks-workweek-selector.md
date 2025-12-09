# Tasks: Workweek Selector for Movement Visualization

**Input**: Clarified user requirement from `/speckit.clarify` session 2025-12-09
**Prerequisites**: Existing building layout visualization, movement tracking with MovementGeneratorService
**Feature Branch**: `001-building-layout-svg` (implementing on `slidable_workweek` branch)

**Key Decisions from Clarification:**
- Multi-select non-consecutive weeks via checkbox interface
- Default: Most recent week pre-selected
- Visual distinction: Opacity gradient (older = transparent, recent = opaque)
- No bulk selection controls

**Organization**: Tasks organized by user story (User Story 4 from spec.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US4 = Filter Movement Data by Workweek
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational types and service structure

- [X] T001 Create workweek selector types interface at `building-layout-tutorial/src/app/models/workweek-selector.interface.ts`
- [X] T002 [P] Create workweek filter service at `building-layout-tutorial/src/app/services/workweek-filter.service.ts`
- [X] T003 [P] Add getAvailableWeeks utility method to `building-layout-tutorial/src/app/utils/workweek-parser.ts`

**Checkpoint**: Core types and service scaffolding ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement filtering logic and state management

**⚠️ CRITICAL**: No UI work can begin until filtering logic is complete

- [X] T004 Implement filterMovementsByWeeks method (accepts array of week strings) in `building-layout-tutorial/src/app/services/workweek-filter.service.ts`
- [X] T005 Implement extractAvailableWeeks method to get unique weeks from movements array in `building-layout-tutorial/src/app/services/workweek-filter.service.ts`
- [X] T006 Implement calculateOpacityForWeek method (temporal gradient: older = lower opacity) in `building-layout-tutorial/src/app/services/workweek-filter.service.ts`
- [X] T007 Add selectedWeeks state array to MovementGeneratorService or create new state service in `building-layout-tutorial/src/app/services/movement-generator.service.ts` (State will be in AppComponent instead)

**Checkpoint**: Filtering logic complete and testable

---

## Phase 3: User Story 4 - Workweek Checkbox Selector Component (Priority: P1) 🎯 MVP

**Goal**: Create checkbox list component for selecting multiple non-consecutive weeks

**Independent Test**: Render component with sample weeks, verify checkboxes render, verify selection emits events

### Implementation for User Story 4

- [X] T008 [US4] Generate workweek selector component: `ng generate component components/workweek-selector --standalone` in `building-layout-tutorial/`
- [X] T009 [US4] Create component template with checkbox list in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.html`
- [X] T010 [US4] Implement @Input() availableWeeks: string[] in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [X] T011 [US4] Implement @Input() selectedWeeks: string[] in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [X] T012 [US4] Implement @Output() selectionChange EventEmitter<string[]> in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [X] T013 [US4] Implement formatWeekLabel method (converts "202525" to "Week 25, 2025") in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [X] T014 [US4] Implement onCheckboxChange handler (updates selectedWeeks array) in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [X] T015 [US4] Add checkbox styling with clear visual feedback in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.scss`
- [X] T016 [US4] Add responsive layout styling (works in both 2D and isometric modes) in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.scss`

**Checkpoint**: Checkbox selector component renders and emits selection events

---

## Phase 4: User Story 4 - State Management Integration (Priority: P1) 🎯 MVP

**Goal**: Wire up workweek selector to app state and movement filtering

**Independent Test**: Select weeks in UI, verify movements filter correctly in visualization

### Implementation for User Story 4

- [X] T017 [US4] Add selectedWeeks: string[] property to AppComponent state in `building-layout-tutorial/src/app/app.component.ts`
- [X] T018 [US4] Add availableWeeks: string[] property to AppComponent state in `building-layout-tutorial/src/app/app.component.ts`
- [X] T019 [US4] Implement onWeekSelectionChange handler in AppComponent in `building-layout-tutorial/src/app/app.component.ts`
- [X] T020 [US4] Update generateMovementData to extract and store available weeks in `building-layout-tutorial/src/app/app.component.ts`
- [X] T021 [US4] Implement getFilteredMovements method (filters by selectedWeeks array) in `building-layout-tutorial/src/app/app.component.ts`
- [X] T022 [US4] Initialize selectedWeeks with most recent week on data load in `building-layout-tutorial/src/app/app.component.ts`
- [X] T023 [US4] Update template to pass filteredMovements instead of all movements to BuildingLayoutComponent in `building-layout-tutorial/src/app/app.component.html`

**Checkpoint**: Movement filtering works based on week selection

---

## Phase 5: User Story 4 - UI Integration (Priority: P1) 🎯 MVP

**Goal**: Add workweek selector to main UI and wire up all events

**Independent Test**: Load app, verify selector appears with most recent week checked, change selection, verify visualization updates

### Implementation for User Story 4

- [X] T024 [US4] Import WorkweekSelectorComponent in AppComponent imports array in `building-layout-tutorial/src/app/app.component.ts`
- [X] T025 [US4] Add workweek selector to app template (between header and visualization) in `building-layout-tutorial/src/app/app.component.html`
- [X] T026 [US4] Bind [availableWeeks] input to component in `building-layout-tutorial/src/app/app.component.html`
- [X] T027 [US4] Bind [selectedWeeks] input to component in `building-layout-tutorial/src/app/app.component.html`
- [X] T028 [US4] Wire (selectionChange) event to onWeekSelectionChange handler in `building-layout-tutorial/src/app/app.component.html`
- [X] T029 [US4] Add selector container styling in `building-layout-tutorial/src/app/app.component.scss` (Component has its own styling)
- [X] T030 [US4] Add conditional display (*ngIf) to hide selector when no movement data in `building-layout-tutorial/src/app/app.component.html`
- [X] T031 [US4] Update instructions text to mention workweek selector in `building-layout-tutorial/src/app/app.component.html`

**Checkpoint**: Workweek selector fully integrated and functional in UI

---

## Phase 6: User Story 4 - Opacity-Based Visual Distinction (Priority: P1) 🎯 MVP

**Goal**: Apply opacity gradient to distinguish movements from different selected weeks

**Independent Test**: Select multiple weeks, verify older weeks appear more transparent

### Implementation for User Story 4

- [X] T032 [US4] Add week metadata to movement rendering data structure in `building-layout-tutorial/src/app/services/svg-renderer.service.ts`
- [X] T033 [US4] Implement calculateOpacityForWeek helper (maps week age to opacity 0.3-1.0) in `building-layout-tutorial/src/app/services/svg-renderer.service.ts`
- [X] T034 [US4] Update renderMovements to accept selectedWeeks array parameter in `building-layout-tutorial/src/app/services/svg-renderer.service.ts`
- [X] T035 [US4] Apply opacity styling to movement flow paths based on week age in `building-layout-tutorial/src/app/services/svg-renderer.service.ts`
- [X] T036 [US4] Add CSS transition for smooth opacity changes in `building-layout-tutorial/src/app/services/svg-renderer.service.ts`
- [X] T037 [US4] Pass selectedWeeks to renderMovements from BuildingLayoutComponent in `building-layout-tutorial/src/app/components/building-layout/building-layout.component.ts`

**Checkpoint**: Multiple weeks display with clear temporal visual hierarchy

---

## Phase 7: User Story 4 - View Mode & Floor Integration (Priority: P1) 🎯 MVP

**Goal**: Ensure workweek filtering works correctly across view modes and floor changes

**Independent Test**: Select weeks, toggle 2D/isometric, change floors, verify filtering persists correctly

### Implementation for User Story 4

- [X] T038 [US4] Update onViewModeChange to preserve selectedWeeks when toggling in `building-layout-tutorial/src/app/app.component.ts` (Already preserves state)
- [X] T039 [US4] Update onFloorChange to preserve selectedWeeks when changing floors in `building-layout-tutorial/src/app/app.component.ts` (Already preserves state)
- [X] T040 [US4] Ensure filtered movements respect both floor and week filters in 2D mode in `building-layout-tutorial/src/app/app.component.ts` (Handled by movement generator floor filtering)
- [X] T041 [US4] Ensure filtered movements respect week filter across all floors in isometric mode in `building-layout-tutorial/src/app/app.component.ts` (Handled correctly)

**Checkpoint**: Workweek filtering persists correctly across all view mode changes

---

## Phase 8: User Story 4 - Edge Cases & Validation (Priority: P2)

**Goal**: Handle edge cases gracefully (empty data, single week, no movements)

**Independent Test**: Test with 0 weeks, 1 week, 100 weeks, verify robust behavior

### Implementation for User Story 4

- [ ] T042 [US4] Add validation for empty availableWeeks array in WorkweekSelectorComponent in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [ ] T043 [US4] Display "No movement data available" message when availableWeeks is empty in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.html`
- [ ] T044 [US4] Handle single week case (show checkbox but pre-check it, disable unchecking) in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [ ] T045 [US4] Add bounds checking to prevent selection of non-existent weeks in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [ ] T046 [US4] Handle case where selectedWeeks contains weeks not in availableWeeks in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`

**Checkpoint**: All edge cases handled gracefully

---

## Phase 9: Polish & Documentation

**Purpose**: Final improvements, accessibility, and documentation

- [ ] T047 [P] Add aria-label attributes to checkboxes for screen readers in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.html`
- [ ] T048 [P] Add role="group" and aria-labelledby to checkbox list container in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.html`
- [ ] T049 [P] Add JSDoc comments to WorkweekFilterService public methods in `building-layout-tutorial/src/app/services/workweek-filter.service.ts`
- [ ] T050 [P] Add component documentation to WorkweekSelectorComponent in `building-layout-tutorial/src/app/components/workweek-selector/workweek-selector.component.ts`
- [ ] T051 Update quickstart.md with workweek selector usage section in `specs/001-building-layout-svg/quickstart.md`
- [ ] T052 Test complete workflow: load app → movements generate → selector appears → select multiple weeks → verify opacity gradient
- [ ] T053 Test 2D mode: select weeks → change floors → verify filtering works correctly
- [ ] T054 Test isometric mode: select weeks → toggle to 2D → verify filtering persists
- [ ] T055 Test edge case: generate movements for 1 week only → verify selector handles gracefully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all UI work
- **User Story 4 Phases (3-7)**: Must proceed sequentially:
  - Phase 3 (Component) → Phase 4 (State) → Phase 5 (UI Integration) → Phase 6 (Opacity) → Phase 7 (View Modes)
- **Edge Cases (Phase 8)**: Depends on Phase 7 completion
- **Polish (Phase 9)**: Depends on Phase 8 completion

### Critical Path

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 (MVP Complete)

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 9**: T047, T048, T049, T050 (all documentation/a11y tasks) can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch these tasks together:
Task: "Create workweek filter service at building-layout-tutorial/src/app/services/workweek-filter.service.ts"
Task: "Add getAvailableWeeks utility method to building-layout-tutorial/src/app/utils/workweek-parser.ts"
```

## Parallel Example: Polish Phase

```bash
# Launch these tasks together:
Task: "Add aria-label attributes to checkboxes for screen readers"
Task: "Add role group and aria-labelledby to checkbox list container"
Task: "Add JSDoc comments to WorkweekFilterService public methods"
Task: "Add component documentation to WorkweekSelectorComponent"
```

---

## Implementation Strategy

### MVP First (Phases 1-7)

1. Complete Phase 1: Setup → Types and service structure ready
2. Complete Phase 2: Foundational → Filtering logic works
3. Complete Phase 3: Component → Checkbox selector exists
4. Complete Phase 4: State → Filtering integrated with app state
5. Complete Phase 5: UI Integration → Selector visible and functional
6. Complete Phase 6: Opacity → Visual distinction implemented
7. Complete Phase 7: View Modes → Works across all modes
8. **STOP and VALIDATE**: Test end-to-end workflow
9. Deploy/demo if ready

### Testing Checkpoints

- After Phase 2: Unit test filtering logic
- After Phase 3: Component renders checkboxes correctly
- After Phase 4: Selection changes filter movements
- After Phase 5: End-to-end integration works
- After Phase 6: Opacity gradient displays correctly
- After Phase 7: Filtering persists across view changes
- After Phase 8: Edge cases handled
- After Phase 9: Accessibility verified

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [US4] = All tasks belong to User Story 4 (Filter Movement Data by Workweek)
- Phases 3-7 must execute sequentially for MVP
- Focus on MVP (Phases 1-7) before edge cases and polish
- Test opacity gradient with 3+ selected weeks for best visual verification
- Ensure checkbox labels are human-readable per FR-017

---

## Summary

- **Total Tasks**: 55
- **MVP Scope**: Phases 1-7 (Tasks T001-T041) = 41 tasks
- **Enhancement Scope**: Phase 8 (Tasks T042-T046) = 5 tasks
- **Polish Scope**: Phase 9 (Tasks T047-T055) = 9 tasks
- **Parallel Opportunities**: 6 tasks marked [P]
- **Critical Path**: Sequential execution through Phases 1-7 for MVP

**Estimated MVP Completion**: 41 tasks for full workweek selector with multi-select, opacity gradient, and view mode integration.
