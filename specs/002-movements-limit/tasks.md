# Tasks: Movement Limit Configuration

**Input**: Design documents from `/specs/002-movements-limit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Unit tests included for core services (loader and validator)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `building-layout-tutorial/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create sample movement-limits.json configuration file in building-layout-tutorial/src/assets/data/movement-limits.json
- [x] T002 Verify Angular build configuration includes assets/data directory in build output

**Checkpoint**: Configuration file location ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core interfaces and types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create MovementLimit interface in building-layout-tutorial/src/app/models/movement-limit.interface.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Load and Apply Movement Limits from Config File (Priority: P1) 🎯 MVP

**Goal**: Load limit configurations from JSON file and automatically color arrows red when movements exceed configured thresholds

**Independent Test**: Create a movement-limits.json file with test limits (e.g., E-1→F-2: limit 30), load the application with movement data, and verify that arrows exceeding their configured limits display in red while others remain in default color

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create unit test file for MovementLimitLoaderService in building-layout-tutorial/src/app/services/movement-limit-loader.service.spec.ts
- [x] T005 [P] [US1] Write test: successfully loads valid movement-limits.json file
- [x] T006 [P] [US1] Write test: returns empty array for missing file (404 error)
- [x] T007 [P] [US1] Write test: returns empty array for malformed JSON with error logged
- [x] T008 [P] [US1] Create unit test file for MovementValidatorService in building-layout-tutorial/src/app/services/movement-validator.service.spec.ts
- [x] T009 [P] [US1] Write test: isLimitExceeded returns true when movement count exceeds limit
- [x] T010 [P] [US1] Write test: isLimitExceeded returns false when movement count is at or below limit
- [x] T011 [P] [US1] Write test: isLimitExceeded returns false when no limit is configured for region pair
- [x] T012 [P] [US1] Write test: validateLimits filters out entries with negative or zero limit values
- [x] T013 [P] [US1] Write test: validateLimits handles duplicate region pairs (uses last value)

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement MovementLimitLoaderService in building-layout-tutorial/src/app/services/movement-limit-loader.service.ts with loadLimits() method using HttpClient
- [x] T015 [P] [US1] Implement MovementValidatorService in building-layout-tutorial/src/app/services/movement-validator.service.ts with validateLimits() and isLimitExceeded() methods
- [x] T016 [US1] Update AppComponent in building-layout-tutorial/src/app/app.component.ts to load limits in ngOnInit() and store in component property
- [x] T017 [US1] Update BuildingLayoutComponent to accept limits as Input property and pass to renderer
- [x] T018 [US1] Modify SvgRendererService.renderMovements() in building-layout-tutorial/src/app/services/svg-renderer.service.ts to accept limits parameter and apply conditional stroke color (red if exceeded, default otherwise)
- [x] T019 [US1] Update arrowhead marker definition in SvgRendererService to support red color variant for violated limits
- [x] T020 [US1] Add console logging in AppComponent for successful limit loading (e.g., "Loaded X movement limits")
- [ ] T021 [US1] Test end-to-end: create movement-limits.json with known thresholds, run application, verify red arrows appear for violations

**Checkpoint**: At this point, User Story 1 should be fully functional - limits load from file, arrows render in red for violations, default color for non-violations

---

## Phase 4: User Story 2 - Handle Invalid Configuration Data (Priority: P2)

**Goal**: Gracefully handle malformed JSON, invalid values, and missing files without breaking the visualization

**Independent Test**: Create movement-limits.json files with various invalid data formats (malformed JSON, negative limits, missing fields) and verify the application loads successfully, logs appropriate warnings, and continues to display movements with default colors

### Tests for User Story 2

- [x] T022 [P] [US2] Write test: validateLimits skips entries with missing fromRegion field and logs warning
- [x] T023 [P] [US2] Write test: validateLimits skips entries with missing toRegion field and logs warning
- [x] T024 [P] [US2] Write test: validateLimits skips entries with missing limit field and logs warning
- [x] T025 [P] [US2] Write test: validateLimits handles non-numeric limit values and logs warning
- [x] T026 [P] [US2] Write test: validateLimits trims whitespace from fromRegion and toRegion values
- [x] T027 [P] [US2] Write test: loadLimits handles HTTP 404 error gracefully with console warning

### Implementation for User Story 2

- [x] T028 [US2] Add comprehensive validation logic to MovementValidatorService.validateLimits() in building-layout-tutorial/src/app/services/movement-validator.service.ts
- [x] T029 [US2] Add field presence validation (fromRegion, toRegion, limit) with console warnings for missing fields
- [x] T030 [US2] Add limit value validation (must be positive number > 0) with console warnings for invalid values
- [x] T031 [US2] Add duplicate detection logic using Set to track seen region pairs with console warning for duplicates
- [x] T032 [US2] Add whitespace trimming for fromRegion and toRegion string fields
- [x] T033 [US2] Update MovementLimitLoaderService error handling in building-layout-tutorial/src/app/services/movement-limit-loader.service.ts to catch malformed JSON and log specific error message
- [x] T034 [US2] Update MovementLimitLoaderService to handle HTTP errors (404, 500, etc.) and return empty array with appropriate warnings
- [x] T035 [US2] Add error handling in AppComponent to catch loader failures and continue with empty limits array
- [ ] T036 [US2] Test with malformed JSON: verify application loads, logs error, all arrows use default color
- [ ] T037 [US2] Test with invalid limit values: verify bad entries are skipped, valid entries still applied, warnings logged
- [ ] T038 [US2] Test with missing file: verify application loads, warning logged, all arrows use default color
- [ ] T039 [US2] Test with duplicate region pairs: verify last value is used, warning logged

**Checkpoint**: All user stories should now be independently functional - application handles all error scenarios gracefully

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T040 [P] Run all unit tests with npm test and verify 100% pass rate
- [x] T041 [P] Run TypeScript compiler with npx tsc --noEmit to verify no type errors
- [ ] T042 [P] Validate quickstart.md scenarios manually (all 6 scenarios from quickstart guide)
- [x] T043 [P] Add JSDoc comments to public methods in MovementLimitLoaderService
- [x] T044 [P] Add JSDoc comments to public methods in MovementValidatorService
- [ ] T045 Verify performance with 100 limit configurations (no noticeable lag)
- [ ] T046 Verify visual rendering meets SC-001: red arrows appear within 1 second of data loading
- [x] T047 Code review: verify all console.log statements use appropriate levels (info, warn, error)
- [ ] T048 Final integration test: run application with comprehensive movement-limits.json covering 10+ region pairs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 validation but is independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Interface (Phase 2) before services (US1/US2)
- Services before component integration
- Core implementation before error handling enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: Both setup tasks can run in parallel
- **Phase 2**: Only one task (interface creation)
- **Phase 3 Tests**: All US1 test tasks (T004-T013) can run in parallel
- **Phase 3 Implementation**: T014 and T015 (two services) can run in parallel
- **Phase 4 Tests**: All US2 test tasks (T022-T027) can run in parallel
- **Phase 4 Implementation**: Validation enhancements (T028-T032) can be done in parallel with error handling updates (T033-T035)
- **Phase 5**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test file for MovementLimitLoaderService"
Task: "Write test: successfully loads valid movement-limits.json file"
Task: "Write test: returns empty array for missing file (404 error)"
Task: "Write test: returns empty array for malformed JSON with error logged"
Task: "Create unit test file for MovementValidatorService"
Task: "Write test: isLimitExceeded returns true when movement count exceeds limit"
Task: "Write test: isLimitExceeded returns false when movement count is at or below limit"
Task: "Write test: isLimitExceeded returns false when no limit is configured"
Task: "Write test: validateLimits filters out entries with negative or zero limit values"
Task: "Write test: validateLimits handles duplicate region pairs (uses last value)"

# Launch both service implementations together:
Task: "Implement MovementLimitLoaderService"
Task: "Implement MovementValidatorService"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004-T021)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md scenarios
5. Deploy/demo if ready - you now have a working limit configuration feature!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T003)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! T004-T021)
3. Add User Story 2 → Test independently → Deploy/Demo (Robust error handling! T022-T039)
4. Polish → Final quality pass (T040-T048)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T003)
2. Once Foundational is done:
   - Developer A: User Story 1 tests + MovementLimitLoaderService (T004-T007, T014)
   - Developer B: User Story 1 tests + MovementValidatorService (T008-T013, T015)
   - Developer C: User Story 1 integration (T016-T021 after services complete)
3. User Story 2 can start immediately after US1 is complete
4. Polish tasks can be distributed across team

---

## Task Summary

- **Total Tasks**: 48
- **Setup Phase**: 2 tasks
- **Foundational Phase**: 1 task
- **User Story 1 (P1)**: 18 tasks (10 tests + 8 implementation)
- **User Story 2 (P2)**: 18 tasks (6 tests + 12 implementation)
- **Polish Phase**: 9 tasks
- **Parallel Opportunities**:
  - Phase 1: 2 tasks
  - Phase 3 Tests: 10 tasks
  - Phase 3 Implementation: 2 tasks
  - Phase 4 Tests: 6 tasks
  - Phase 4 Implementation: 6 tasks
  - Phase 5: 6 tasks

**MVP Scope**: Phases 1-3 (21 tasks total) delivers fully functional movement limit feature with visual alerts

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use quickstart.md scenarios for manual validation
- All file paths are relative to building-layout-tutorial/ directory
- No new npm packages required - uses existing Angular, D3.js, RxJS
