// T116-T117: Floor utility functions for multi-floor support
import { Region } from '../models/region.interface';
import { FloorInfo } from '../models/floor.interface';

export class FloorUtils {
  /**
   * T116: Extract unique floor levels from regions and count regions per floor
   * @param regions - Array of regions
   * @returns Array of FloorInfo objects sorted by floor number (ascending)
   */
  static getAvailableFloors(regions: Region[]): FloorInfo[] {
    const floorMap = new Map<number, number>();

    regions.forEach(region => {
      const floor = region.floor ?? 0;  // Default to floor 0 if not specified
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

  /**
   * T117: Filter regions by floor level
   * @param regions - Array of regions
   * @param floor - Floor number to filter by
   * @returns Regions on the specified floor
   */
  static filterRegionsByFloor(regions: Region[], floor: number): Region[] {
    return regions.filter(region => (region.floor ?? 0) === floor);
  }

  /**
   * Get the lowest floor number from a set of regions
   * @param regions - Array of regions
   * @returns Lowest floor number (defaults to 0 if no regions)
   */
  static getLowestFloor(regions: Region[]): number {
    if (regions.length === 0) return 0;
    const floors = regions.map(r => r.floor ?? 0);
    return Math.min(...floors);
  }

  /**
   * Get the highest floor number from a set of regions
   * @param regions - Array of regions
   * @returns Highest floor number (defaults to 0 if no regions)
   */
  static getHighestFloor(regions: Region[]): number {
    if (regions.length === 0) return 0;
    const floors = regions.map(r => r.floor ?? 0);
    return Math.max(...floors);
  }
}
