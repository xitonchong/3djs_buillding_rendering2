#!/usr/bin/env ts-node
/**
 * Standalone Movement Data Generator Script
 *
 * This script generates synthetic student movement data and saves it to a JSON file.
 * It can be run independently of the Angular application.
 *
 * Usage:
 *   npm run generate:movements
 *   or
 *   ts-node scripts/generate-movements.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import seedrandom from 'seedrandom';

// ============================================================================
// Type Definitions
// ============================================================================

interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: number;
  label?: string;
  color?: string;
  strokeColor?: string;
}

interface LayoutConfiguration {
  name: string;
  description?: string;
  regions: Region[];
  metadata?: {
    buildingName?: string;
    floors?: number;
    units?: string;
    totalArea?: number;
  };
}

interface MovementData {
  id: string;
  fromRegion: string;
  toRegion: string;
  moves: number;
  workweek: string;
  timestamp: string;
  metadata?: {
    peakHour?: number;
    dayOfWeek?: number;
    category?: string;
  };
}

interface GeneratorConfig {
  regions: Region[];
  startWeek: string;
  endWeek: string;
  recordsPerWeek: number;
  minMoves: number;
  maxMoves: number;
  seed: string;
  floor?: number;
  isIsometric?: boolean;
}

// ============================================================================
// Workweek Utilities (Simplified version without date-fns)
// ============================================================================

const WORKWEEK_REGEX = /^\d{4}(0[1-9]|[1-4][0-9]|5[0-3])$/;

function validateWorkweek(weekString: string): boolean {
  if (!WORKWEEK_REGEX.test(weekString)) {
    return false;
  }
  const week = parseInt(weekString.substring(4, 6), 10);
  return week >= 1 && week <= 53;
}

function parseWorkweek(weekString: string): Date {
  if (!validateWorkweek(weekString)) {
    throw new Error(`Invalid workweek format: "${weekString}"`);
  }

  const year = parseInt(weekString.substring(0, 4), 10);
  const week = parseInt(weekString.substring(4, 6), 10);

  // Approximate: Jan 1 + (week-1) * 7 days
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  return date;
}

function formatWorkweek(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  return `${year}${week.toString().padStart(2, '0')}`;
}

function getWeekRange(startWeek: string, endWeek: string): string[] {
  const weeks: string[] = [];
  let current = parseWorkweek(startWeek);
  const end = parseWorkweek(endWeek);

  while (current <= end) {
    weeks.push(formatWorkweek(current));
    current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return weeks;
}

// ============================================================================
// Movement Generator
// ============================================================================

class MovementGenerator {
  private rng: seedrandom.PRNG | null = null;

  generateMovements(config: GeneratorConfig): MovementData[] {
    this.rng = seedrandom(config.seed);

    const movements: MovementData[] = [];
    const weeks = getWeekRange(config.startWeek, config.endWeek);

    // Filter regions by floor if needed
    const regions = config.isIsometric
      ? config.regions
      : config.regions.filter(region => region.floor === (config.floor || 0));

    if (regions.length < 2) {
      console.warn('Need at least two regions to generate meaningful movement data');
      return [];
    }

    weeks.forEach(workweek => {
      for (let i = 0; i < config.recordsPerWeek; i++) {
        const fromRegion = this.selectRandom(regions);
        let toRegion = this.selectRandom(regions);

        // Ensure no self-loops
        while (toRegion === fromRegion && regions.length > 1) {
          toRegion = this.selectRandom(regions);
        }

        const moves = this.randomInt(config.minMoves, config.maxMoves + 1);

        movements.push({
          id: `mov-${workweek}-${i}`,
          fromRegion: fromRegion.id,
          toRegion: toRegion.id,
          moves,
          workweek,
          timestamp: parseWorkweek(workweek).toISOString(),
          metadata: {
            peakHour: this.randomInt(7, 18),
            dayOfWeek: this.randomInt(1, 6),
            category: this.selectRandom([
              'class-change',
              'lunch-break',
              'arrival',
              'dismissal'
            ])
          }
        });
      }
    });

    return movements;
  }

  private randomInt(min: number, max: number): number {
    if (!this.rng) {
      throw new Error('RNG not initialized');
    }
    return Math.floor(this.rng() * (max - min)) + min;
  }

  private selectRandom<T>(array: T[]): T {
    if (!this.rng) {
      throw new Error('RNG not initialized');
    }
    return array[Math.floor(this.rng() * array.length)];
  }
}

// ============================================================================
// Main Script
// ============================================================================

function main() {
  console.log('🚀 Movement Data Generator');
  console.log('==========================\n');

  // Paths
  const layoutPath = path.join(__dirname, '../src/assets/sample-data/building-layout.json');
  const outputPath = path.join(__dirname, '../src/assets/data/sample-movements.json');

  // Load building layout
  console.log(`📂 Loading building layout from: ${layoutPath}`);

  if (!fs.existsSync(layoutPath)) {
    console.error(`❌ Error: Building layout file not found at ${layoutPath}`);
    process.exit(1);
  }

  const layoutData = fs.readFileSync(layoutPath, 'utf-8');
  const layout: LayoutConfiguration = JSON.parse(layoutData);

  console.log(`✅ Loaded layout: ${layout.name}`);
  console.log(`   Regions: ${layout.regions.length}`);
  console.log(`   Floors: ${layout.metadata?.floors || 'Unknown'}\n`);

  // Configure movement generation
  const config: GeneratorConfig = {
    regions: layout.regions,
    startWeek: '202501',
    endWeek: '202532',
    recordsPerWeek: 10,
    minMoves: 5,
    maxMoves: 50,
    seed: 'demo-seed-2025',
    isIsometric: true // Generate for all floors
  };

  console.log('⚙️  Configuration:');
  console.log(`   Start week: ${config.startWeek}`);
  console.log(`   End week: ${config.endWeek}`);
  console.log(`   Records per week: ${config.recordsPerWeek}`);
  console.log(`   Move range: ${config.minMoves}-${config.maxMoves}`);
  console.log(`   Seed: ${config.seed}`);
  console.log(`   Mode: ${config.isIsometric ? 'All floors' : `Floor ${config.floor}`}\n`);

  // Generate movements
  console.log('🔄 Generating movement data...');
  const generator = new MovementGenerator();
  const movements = generator.generateMovements(config);

  console.log(`✅ Generated ${movements.length} movement records\n`);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    console.log(`📁 Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save to file
  console.log(`💾 Saving to: ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(movements, null, 2), 'utf-8');

  console.log('✅ Movement data saved successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Total movements: ${movements.length}`);
  console.log(`   Weeks covered: ${getWeekRange(config.startWeek, config.endWeek).length}`);
  console.log(`   Output file: ${outputPath}`);
  console.log('\n🎉 Done!');
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
