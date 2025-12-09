# Movement Data Generation Scripts

This directory contains scripts for generating synthetic student movement data.

## Generate Sample Movements

The `generate-movements.ts` script creates synthetic movement data and saves it to a JSON file.

### Usage

```bash
npm run generate:movements
```

### What It Does

1. Loads the building layout from `src/assets/sample-data/building-layout.json`
2. Generates synthetic movement records between regions
3. Saves the output to `src/assets/data/sample-movements.json`

### Configuration

You can customize the generation parameters by editing `generate-movements.ts`:

```typescript
const config: GeneratorConfig = {
  regions: layout.regions,
  startWeek: '202501',      // Start week (YYYYWW format)
  endWeek: '202505',        // End week (YYYYWW format)
  recordsPerWeek: 10,       // Number of movements per week
  minMoves: 5,              // Minimum students per movement
  maxMoves: 50,             // Maximum students per movement
  seed: 'demo-seed-2025',   // Random seed for reproducibility
  isIsometric: true         // Generate for all floors (true) or single floor (false)
};
```

### Output Format

The generated JSON file contains an array of movement records:

```json
[
  {
    "id": "mov-202501-0",
    "fromRegion": "E-1",
    "toRegion": "F-2",
    "moves": 20,
    "workweek": "202501",
    "timestamp": "2024-12-31T16:00:00.000Z",
    "metadata": {
      "peakHour": 16,
      "dayOfWeek": 4,
      "category": "dismissal"
    }
  }
]
```

### Field Descriptions

- **id**: Unique identifier for the movement record
- **fromRegion**: Source region ID (must exist in building layout)
- **toRegion**: Destination region ID (must exist in building layout)
- **moves**: Number of students/people in this movement
- **workweek**: Week identifier in YYYYWW format (e.g., "202501" = Week 1 of 2025)
- **timestamp**: ISO 8601 timestamp for the week start
- **metadata.peakHour**: Hour of day when peak movement occurred (0-23)
- **metadata.dayOfWeek**: Day of week (1=Monday, 7=Sunday)
- **metadata.category**: Movement type (class-change, lunch-break, arrival, dismissal)

### Requirements

- Node.js 16+
- TypeScript 5.4+
- ts-node 10.9+

These are automatically installed when you run `npm install` in the project root.

### Reproducibility

The script uses a seeded random number generator (`seedrandom`) to ensure reproducible results. The same seed will always generate the same data.

### Troubleshooting

**Issue**: `Unknown file extension ".ts"` error

**Solution**: Make sure you have ts-node installed:
```bash
npm install
```

**Issue**: Cannot find building layout file

**Solution**: Ensure `src/assets/sample-data/building-layout.json` exists. This file defines the regions for movement generation.

**Issue**: Generated file is empty or has very few records

**Solution**: Check that your building layout has at least 2 regions. The script needs at least two regions to generate meaningful movement data.

## Customizing for Your Project

To adapt this script for your needs:

1. **Change time range**: Modify `startWeek` and `endWeek`
2. **Adjust density**: Change `recordsPerWeek` to generate more/fewer movements
3. **Modify movement size**: Adjust `minMoves` and `maxMoves` ranges
4. **Single floor mode**: Set `isIsometric: false` and specify `floor: 0` (or other floor number)
5. **Different seed**: Change the `seed` value for different random data

## Advanced Usage

You can also run the script directly with ts-node:

```bash
npx ts-node --project scripts/tsconfig.json scripts/generate-movements.ts
```

Or compile and run as JavaScript:

```bash
npx tsc --project scripts/tsconfig.json scripts/generate-movements.ts
node scripts/generate-movements.js
```
