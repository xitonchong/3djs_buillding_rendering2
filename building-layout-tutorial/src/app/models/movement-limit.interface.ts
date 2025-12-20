/**
 * Movement Limit Configuration Interface
 *
 * Represents a configured threshold for movements between a specific region pair.
 * Used to determine when movement counts exceed acceptable limits and should
 * trigger visual alerts (red arrow coloring).
 */
export interface MovementLimit {
  /**
   * Source region identifier
   * Must match region IDs from the building layout configuration
   * Case-sensitive exact match required
   */
  fromRegion: string;

  /**
   * Destination region identifier
   * Must match region IDs from the building layout configuration
   * Case-sensitive exact match required
   */
  toRegion: string;

  /**
   * Maximum allowed number of moves for this region pair
   * Must be a positive integer greater than 0
   * Movements with counts > limit will be displayed with red arrows
   */
  limit: number;
}
