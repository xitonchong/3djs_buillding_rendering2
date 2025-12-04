<!--
SYNC IMPACT REPORT
===================
Version Change: 1.0.0 → 1.0.1
Change Type: PATCH (Technical constraints clarification)
Date: 2025-12-04
Modified Principles: N/A (no principle changes)
Added Sections:
- Technical Constraints > Technology Stack (new subsection)
Removed Sections: N/A

Templates Status:
- ✅ spec-template.md: No changes needed - remains technology-agnostic
- ✅ plan-template.md: UPDATED - Technical Context and Project Structure sections now reflect Angular/TypeScript/three.js stack
- ✅ tasks-template.md: No changes needed - task structure remains the same
- ✅ checklist-template.md: No changes needed
- ✅ agent-file-template.md: No changes needed

Follow-up TODOs: None - all templates synchronized
===================
PREVIOUS SYNC IMPACT REPORT
Version Change: NEW → 1.0.0
Change Type: MINOR (Initial constitution creation)
Modified Principles: N/A (new document)
Added Sections: All sections (initial creation)
- I. Example-Driven Development
- II. Visual-First Validation
- III. Test Coverage Required
- IV. Progressive Complexity
- V. Documentation as Tutorial
Removed Sections: N/A

Templates Status:
- ✅ spec-template.md: Reviewed - compatible (focuses on user scenarios and requirements)
- ✅ plan-template.md: Reviewed - Constitution Check section will reference these principles
- ✅ tasks-template.md: Reviewed - compatible (supports test tasks and user story structure)
- ✅ checklist-template.md: Not modified - checklist generation compatible with principles
- ✅ agent-file-template.md: Not modified - agent guidance compatible

Follow-up TODOs: None - all placeholders filled
-->

# 3D Graphics Tutorial Constitution

## Core Principles

### I. Example-Driven Development

Every feature MUST be demonstrated through a working, interactive example. Examples are
the primary deliverable - code exists to support examples, not vice versa. Each example
MUST be self-contained, runnable in a browser, and accompanied by inline explanatory
comments that teach the concept being illustrated.

**Rationale**: Tutorials are judged by the clarity of their examples. Abstract code
without visual demonstration fails to teach 3D graphics concepts effectively.

### II. Visual-First Validation

All changes MUST include visual validation - either through browser screenshots showing
the rendered output or automated visual regression tests. Broken rendering is a critical
bug. Performance degradation that impacts frame rate (below 30fps on target hardware)
is also a critical bug.

**Rationale**: 3D graphics are inherently visual. Text-only validation cannot catch
rendering errors, visual artifacts, or performance regressions that destroy the
learning experience.

### III. Test Coverage Required

New functionality MUST include test coverage. Tests can be written alongside
implementation but MUST be present before merging. Focus areas requiring tests:

- Core math utilities (vector, matrix operations)
- Scene graph manipulation
- Shader compilation and uniform handling
- Input/interaction handlers
- Performance benchmarks for critical paths

**Rationale**: Math errors and API misuse in graphics code cause subtle bugs that
manifest as visual glitches. Tests catch these before they reach learners.

### IV. Progressive Complexity

Examples MUST be ordered from simple to complex. Each example builds on concepts from
previous examples. Introduce ONE new concept per example. Avoid combining multiple
advanced techniques in early examples. Dependencies between examples MUST be explicit
and documented.

**Rationale**: Cognitive overload is the enemy of learning. Learners must master
fundamentals before encountering advanced combinations. Random example ordering
creates confusion and frustration.

### V. Documentation as Tutorial

All documentation is tutorial content. Comments in code MUST explain the "why" behind
3D graphics decisions, not just the "what". README files MUST include learning
objectives, prerequisites, and estimated completion time. Technical decisions
(coordinate systems, transformation order, etc.) MUST be explained with diagrams
or visual aids.

**Rationale**: Tutorial users need context and pedagogy, not just API references.
Understanding WHY a technique is used matters more than memorizing syntax.

## Development Workflow

### Example Creation Process

1. **Concept Definition**: Identify the single 3D graphics concept to teach
2. **Minimal Example Draft**: Write simplest possible code that demonstrates the concept
3. **Visual Validation**: Verify rendering works correctly in target browsers
4. **Inline Documentation**: Add explanatory comments teaching the concept
5. **Test Coverage**: Write tests for any reusable utilities or complex logic
6. **Integration**: Link example in sequence with appropriate prerequisites noted

### Quality Gates

Before marking any example as complete:

- Example runs without errors in Chrome, Firefox, and Safari
- Visual output matches intended demonstration (screenshot attached to PR)
- Frame rate meets performance target (60fps on modern hardware, 30fps minimum)
- Code includes teaching comments explaining key concepts
- Example appears in table of contents with difficulty level marked
- Any reusable code has corresponding unit tests

### Code Review Standards

Reviewers MUST verify:

1. **Pedagogical Clarity**: Is the learning objective clear? Can a beginner follow?
2. **Visual Correctness**: Does the rendering demonstrate the intended concept?
3. **Code Simplicity**: Is this the simplest way to show this concept?
4. **Performance**: Does it run smoothly on target hardware?
5. **Progressive Flow**: Does it fit logically in the example sequence?

## Technical Constraints

### Browser Compatibility

- Target: Modern Chrome, Firefox, Safari (current - 2 versions)
- WebGL 2.0 required; WebGPU examples clearly marked as experimental
- No build step required for basic examples (ES modules OK)
- Advanced examples may use build tools but MUST document setup clearly

### Performance Standards

- 60fps on desktop (Intel Iris Plus / AMD Radeon 560 or better)
- 30fps minimum on mobile (iPhone 12 / Galaxy S20 or better)
- Initial load time < 3 seconds for any single example
- Examples with heavy assets MUST show loading progress

### Code Style

- Favor readable code over clever code
- Variable names should teach: `projectionMatrix` not `pMat`
- Magic numbers MUST have explanatory comments
- Shader code MUST include inline documentation

### Technology Stack

All examples and tutorial code MUST be implemented using the following technology stack:

- **Framework**: Angular (latest stable version)
- **Language**: TypeScript (strict mode enabled)
- **3D Library**: three.js for 3D graphics and SVG development
- **Component Architecture**: Standalone Angular components only (no NgModule-based components)
- **Build System**: Angular CLI (default configuration)

**Rationale**: Consistency in technology choices reduces cognitive load for learners.
Using a single framework (Angular) with strong typing (TypeScript) helps catch errors early
and provides better IDE support. Standalone components represent modern Angular best practices
and simplify the learning path by avoiding module complexity. three.js is the industry-standard
library for WebGL/3D graphics in the browser.

## Governance

### Constitution Authority

This constitution governs all development in this tutorial project. When specification,
implementation plans, or tasks conflict with these principles, the constitution takes
precedence. Changes that violate principles MUST be justified in writing and approved.

### Amendment Process

Constitution amendments require:

1. Written proposal with rationale
2. Verification that existing examples remain compliant or migration plan provided
3. Updates to all dependent templates (plan, spec, tasks templates)
4. Version bump according to semantic versioning

### Compliance Review

All pull requests MUST confirm:

- [ ] Example demonstrates intended concept clearly
- [ ] Visual validation completed (screenshot or test)
- [ ] Tests included for any reusable utilities
- [ ] Progressive complexity maintained
- [ ] Documentation explains the "why" behind techniques

### Complexity Justification

If any implementation violates simplicity principles (introducing build complexity,
advanced APIs before basics, multiple concepts per example), the violation MUST be
documented in the implementation plan with:

- Why the complexity is necessary
- What simpler alternative was considered
- Why the simpler alternative was insufficient

**Version**: 1.0.1 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04
