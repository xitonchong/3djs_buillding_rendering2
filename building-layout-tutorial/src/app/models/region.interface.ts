// T006: Region interface
export interface Region {
  // Identity
  id: string;

  // Position & Dimensions (required)
  x: number;
  y: number;
  width: number;
  height: number;

  // T113: Floor/Z-dimension (optional, defaults to 0 = ground floor)
  floor?: number;

  // Optional Metadata
  label?: string;
  color?: string;
  strokeColor?: string;
  metadata?: Record<string, any>;
}
