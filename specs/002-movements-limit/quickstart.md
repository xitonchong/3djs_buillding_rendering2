# Quickstart Guide: Movement Limit Configuration

**Feature**: 002-movements-limit
**Date**: 2025-12-19

## Overview

This guide helps you set up and test the movement limit configuration feature. You'll create a configuration file, run the application, and verify that arrows exceeding configured limits are displayed in red.

## Prerequisites

- Node.js and npm installed
- Angular CLI installed (`npm install -g @angular/cli`)
- Project dependencies installed (`npm install` in `building-layout-tutorial/`)
- Application successfully runs (`npm start`)

## Quick Start (5 minutes)

### Step 1: Create Configuration File

Create a new file: `building-layout-tutorial/src/assets/data/movement-limits.json`

**Simple starter configuration**:
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

This configures two limits:
- Movements from E-1 to F-2: max 30 moves
- Movements from E-2 to mailroom: max 40 moves

### Step 2: Run the Application

```bash
cd building-layout-tutorial
npm start
```

Open browser to `http://localhost:4200`

### Step 3: Verify Visual Alerts

**What to look for**:
- ✅ Arrows between configured region pairs should be **red** if moves exceed the limit
- ✅ Arrows between configured region pairs should be **default color** if moves are at/below limit
- ✅ Arrows for unconfigured region pairs should be **default color** regardless of move count
- ✅ Console should show: "Loaded X movement limits" (check browser DevTools)

**Visual check**:
1. Find an arrow from "E-1" to "F-2"
2. Check the movement count label
3. If count > 30, arrow should be red
4. If count ≤ 30, arrow should be default color (black with opacity)

## Testing Scenarios

### Scenario 1: Basic Limit Violation

**Setup**:
```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "E-2",
    "limit": 20
  }
]
```

**Expected Result**:
- If any E-1→E-2 movement has >20 moves: red arrow
- If all E-1→E-2 movements have ≤20 moves: default color arrow
- All other arrows: default color

**How to verify**:
1. Look at movement labels (format: "E-1-E-2_ww:202501_moves:25")
2. Compare moves count to limit (20)
3. Confirm arrow color matches expectation

---

### Scenario 2: Multiple Limits

**Setup**:
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
    "limit": 35
  },
  {
    "fromRegion": "office-2-1",
    "toRegion": "mailroom",
    "limit": 40
  }
]
```

**Expected Result**:
- Each configured region pair checked independently
- Some arrows may be red, others default color
- Mix of violation and non-violation states

**How to verify**:
Open browser console (F12) and check:
```
Loaded 3 movement limits
Movements exceeding limits: [list of violations]
```

---

### Scenario 3: Missing Configuration File

**Setup**: Delete or rename `movement-limits.json`

**Expected Result**:
- Application loads successfully
- All arrows display in default color (no red)
- Console warning: "Movement limits file not found, using no limits"
- No errors or crashes

**How to verify**:
1. Delete `src/assets/data/movement-limits.json`
2. Refresh browser
3. Check console for warning message
4. Verify all arrows are default color

---

### Scenario 4: Invalid Configuration Data

**Setup** - Invalid limit value (negative):
```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": -10
  },
  {
    "fromRegion": "E-2",
    "toRegion": "mailroom",
    "limit": 40
  }
]
```

**Expected Result**:
- Console warning: "Invalid limit value (must be > 0): {fromRegion: 'E-1', ...}"
- First limit ignored, second limit applied
- E-1→F-2 arrows use default color (invalid limit skipped)
- E-2→mailroom arrows use red if >40 moves

**How to verify**:
Check browser console for validation warnings

---

### Scenario 5: Malformed JSON

**Setup** - Syntax error in JSON:
```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": 30,  // <-- trailing comma causes error
  }
]
```

**Expected Result**:
- Console error: "Failed to parse movement limits: [error message]"
- Application continues with no limits (empty array)
- All arrows display in default color

**How to verify**:
1. Introduce JSON syntax error
2. Refresh browser
3. Check console for parse error
4. Verify app still works (graceful degradation)

---

### Scenario 6: Duplicate Region Pairs

**Setup**:
```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": 30
  },
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": 50
  }
]
```

**Expected Result**:
- Console warning: "Duplicate limit for region pair (using latest): E-1:F-2"
- Second limit (50) is used
- E-1→F-2 arrows red only if moves >50 (not >30)

**How to verify**:
Check console warning and observe which threshold is applied

## Sample Configuration for Testing

**Comprehensive test configuration** covering various regions:

```json
[
  {
    "fromRegion": "E-1",
    "toRegion": "E-2",
    "limit": 25
  },
  {
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "limit": 30
  },
  {
    "fromRegion": "E-2",
    "toRegion": "mailroom",
    "limit": 35
  },
  {
    "fromRegion": "office-2-1",
    "toRegion": "mailroom",
    "limit": 40
  },
  {
    "fromRegion": "office-2-1",
    "toRegion": "E-1",
    "limit": 20
  }
]
```

This configuration tests:
- Multiple origin regions (E-1, E-2, office-2-1)
- Multiple destination regions (E-2, F-2, mailroom, E-1)
- Various limit values (20-40 range)

## Debugging Tips

### Console Logging

Open browser DevTools (F12) → Console tab

**Useful log messages**:
```
✅ Loaded 5 movement limits
✅ Generated 500 movement records
⚠️  Invalid limit value (must be > 0): {...}
⚠️  Duplicate limit for region pair: E-1:F-2
❌ Failed to load movement limits: [error]
```

### Visual Inspection

**Arrow colors**:
- **Red arrows**: `stroke="red"` in SVG
- **Default arrows**: `stroke="rgba(0, 0, 0, 0.7)"` (or similar opacity value)

**Inspect SVG elements**:
1. Right-click arrow → Inspect Element
2. Check `<path>` element's `stroke` attribute
3. Verify color matches expected state

### Verification Checklist

- [ ] Configuration file exists at correct path (`src/assets/data/movement-limits.json`)
- [ ] JSON is valid (no syntax errors)
- [ ] All limit values are positive integers
- [ ] Region IDs match actual regions in layout (check `sample-building-layout.json`)
- [ ] Console shows "Loaded X movement limits" message
- [ ] Red arrows appear for violations
- [ ] Default color arrows for non-violations
- [ ] No console errors (warnings are OK for invalid entries)

## Common Issues

### Issue: All arrows are default color (no red)

**Possible causes**:
1. Configuration file not found → Check file path and name
2. All movements are below limits → Verify movement data has counts exceeding limits
3. Region IDs don't match → Check exact spelling and case sensitivity
4. File not loaded → Check browser Network tab for 404 error

**Solution**:
- Verify file exists: `ls src/assets/data/movement-limits.json`
- Check console for load confirmation
- Verify region IDs match between movements and limits

### Issue: Console shows validation warnings

**Cause**: Invalid data in configuration file

**Solution**: Review warnings and fix invalid entries:
- Negative/zero limits → Use positive integers
- Missing fields → Ensure fromRegion, toRegion, and limit all present
- Invalid JSON → Use JSON validator (jsonlint.com)

### Issue: Application doesn't load after adding feature

**Cause**: TypeScript compilation errors or Angular build errors

**Solution**:
1. Check terminal for build errors
2. Run `npm run build` to see detailed errors
3. Verify all imports and interfaces match expected structure
4. Check for TypeScript strict mode violations

## Performance Testing

### Large Configuration

Test with 100 limits:

```bash
# Generate 100 limit configs programmatically (example)
# Create limits for E-1, E-2, ... E-10 to F-1, F-2, ... F-10
```

**Expected behavior**:
- Application loads within 2 seconds
- No noticeable performance degradation
- Console confirms "Loaded 100 movement limits"

### Stress Test

1. Load 2000+ movements (existing sample data)
2. Configure 100+ limits
3. Verify render time <1 second
4. Check browser memory usage stays stable

## Next Steps

After verifying the feature works:

1. **Customize limits**: Edit `movement-limits.json` for your specific regions
2. **Deploy**: Limits file is included in Angular build output automatically
3. **Monitor**: Use browser console to track violations in production
4. **Iterate**: Adjust limit values based on actual traffic patterns

## API Reference

### Configuration File Schema

```typescript
// movement-limits.json
Array<{
  fromRegion: string;  // Required, non-empty
  toRegion: string;    // Required, non-empty
  limit: number;       // Required, positive integer
}>
```

### Console API

**Check loaded limits**:
```javascript
// In browser console after app loads
// Access via Angular DevTools or component inspection
```

### Testing Helpers

**Generate sample movements with specific counts**:
Modify `MovementGeneratorService.generateMovements()` parameters to create test data with specific move counts.

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify configuration file format matches examples
3. Review data-model.md for validation rules
4. Check research.md for technical decisions and rationale
