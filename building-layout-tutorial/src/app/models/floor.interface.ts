// T115: FloorInfo interface for multi-floor support
export interface FloorInfo {
  floor: number;        // Floor level (0 = ground floor, 1 = first floor, etc.)
  label: string;        // Display label (e.g., "Floor 0", "Ground Floor")
  regionCount: number;  // Number of regions on this floor
}
