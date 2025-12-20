# Feature Specification: Movement Limit Configuration

**Feature Branch**: `002-movements-limit`
**Created**: 2025-12-19
**Status**: Draft
**Input**: User description: "I want to add a feature of adding a movements limit configuration from one region to another, when movements exceeded this limit, arrow should be colored as red."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load and Apply Movement Limits from Config File (Priority: P1)

Users need to define movement thresholds for specific region pairs through a JSON configuration file. When the application loads, it reads these limits and automatically colors arrows red when actual movements exceed the configured thresholds. This allows administrators to set monitoring rules without requiring a configuration UI.

**Why this priority**: This is the complete core functionality - loading limits from a file and applying visual alerts. It delivers the full feature value in a simple, maintainable way.

**Independent Test**: Can be fully tested by creating a movement-limits.json file with test limits, loading the application with movement data, and verifying that arrows exceeding their configured limits display in red while others remain in default color.

**Acceptance Scenarios**:

1. **Given** a movement-limits.json file exists with limit configurations, **When** the application loads, **Then** the system reads all limit configurations from the file
2. **Given** a limit is configured for region pair "E-1" → "F-2" with limit 30, **When** actual movements from "E-1" to "F-2" are 35, **Then** the arrow is displayed in red
3. **Given** a limit is configured for region pair "E-1" → "F-2" with limit 30, **When** actual movements from "E-1" to "F-2" are 25, **Then** the arrow is displayed in the default color
4. **Given** multiple limits are configured for different region pairs, **When** movements are visualized, **Then** only arrows exceeding their specific configured limits are colored red
5. **Given** no limit is configured for a region pair, **When** movements are displayed for that pair, **Then** the arrow uses the default color regardless of movement count
6. **Given** the movement-limits.json file doesn't exist or is empty, **When** the application loads, **Then** all arrows display in default color (no limits enforced)

---

### User Story 2 - Handle Invalid Configuration Data (Priority: P2)

When the configuration file contains invalid data (malformed JSON, invalid region names, negative limits), the system needs to handle errors gracefully without breaking the visualization. This ensures the application remains usable even with configuration mistakes.

**Why this priority**: This prevents the entire application from failing due to configuration errors, but isn't needed for the basic happy path functionality.

**Independent Test**: Can be tested by creating movement-limits.json files with various invalid data formats and verifying the application loads successfully, logs appropriate warnings, and continues to display movements with default colors.

**Acceptance Scenarios**:

1. **Given** the movement-limits.json file contains malformed JSON, **When** the application loads, **Then** the system logs an error and continues with no limits enforced (all arrows use default color)
2. **Given** a limit configuration has a negative or zero limit value, **When** the application processes the configuration, **Then** that specific limit is ignored with a warning logged
3. **Given** a limit configuration references non-existent region identifiers, **When** movements are visualized, **Then** the invalid limit is ignored and movements display normally
4. **Given** duplicate limit configurations exist for the same region pair, **When** the application loads, **Then** the last configured limit is used with a warning logged

---

### Edge Cases

- What happens when the config file exists but is empty?
- How does the system handle very large limit values (e.g., exceeding maximum integer)?
- What happens when movements from the same region pair span multiple workweeks with different counts?
- How should the system handle case sensitivity in region identifiers (e.g., "E-1" vs "e-1")?
- What happens when the config file is updated while the application is running?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load movement limit configurations from a JSON file (movement-limits.json) on application startup
- **FR-002**: Configuration file MUST support defining limits for multiple region pairs with format: fromRegion, toRegion, and limit value
- **FR-003**: System MUST compare actual movement counts against configured limits for matching region pairs
- **FR-004**: System MUST render arrows in red color when movement count exceeds the configured limit for that region pair
- **FR-005**: System MUST render arrows in default color when movement count is at or below the configured limit, or when no limit is configured
- **FR-006**: System MUST handle missing configuration file gracefully (treat as no limits configured)
- **FR-007**: System MUST validate that limit values are positive numbers
- **FR-008**: System MUST ignore invalid limit configurations and log warnings without breaking the visualization
- **FR-009**: System MUST match region pairs exactly (case-sensitive) between configuration and movement data
- **FR-010**: System MUST apply limit checking independently for each region pair
- **FR-011**: Configuration file MUST be stored in the application's assets/data directory alongside existing data files

### Key Entities

- **Movement Limit Configuration**: Represents a threshold rule defined in the JSON configuration file. Key attributes include source region identifier (fromRegion), destination region identifier (toRegion), and maximum allowed movement count (limit). Configuration is loaded at application startup and used to determine arrow colors.
- **Movement**: Existing entity representing actual movement data between regions. Contains fromRegion, toRegion, and moves count. Will be compared against Movement Limit Configurations to determine visual state (red vs default color).

### Configuration File Structure

The movement-limits.json file should follow this structure:

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
  }
]
```

Each configuration object specifies:
- **fromRegion**: Source region identifier (must match region IDs used in movement data)
- **toRegion**: Destination region identifier (must match region IDs used in movement data)
- **limit**: Maximum allowed number of moves (positive integer)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visual feedback (red arrow) appears within 1 second of data loading when limits are exceeded
- **SC-002**: 100% of movements exceeding their configured limits are visually distinguished with red arrows
- **SC-003**: Users can identify limit violations by visual scanning without reading numerical values
- **SC-004**: The system accurately handles at least 100 different region pair limit configurations without performance degradation
- **SC-005**: Application continues to function normally even when configuration file contains errors (graceful degradation)
