// T071 & T122: Isometric transformation utility for CSS 3D transforms
import { ViewMode } from '../models/viewport.interface';
import { Region } from '../models/region.interface';

/**
 * Utility class for calculating CSS 3D transform strings
 * to create isometric/axonometric projections
 */
export class IsometricTransform {
  /**
   * Calculate CSS 3D transform for isometric projection
   * Uses standard isometric angles: 60° X-rotation and 45° Z-rotation
   *
   * This creates a "strategy game" or "blueprint" style view that shows
   * depth without requiring actual 3D geometry
   *
   * @returns CSS transform string for isometric view
   */
  static calculateIsometricTransform(): string {
    // Standard isometric projection angles
    const rotateX = 10;  // degrees - tilts the plane forward
    const rotateZ = 30;  // degrees - rotates around Z-axis
    const scale = 1.3;   // Compensate for foreshortening

    return `
      perspective(2000px)
      rotateX(${rotateX}deg)
      rotateZ(${rotateZ}deg)
      scale(${scale})
    `.trim();
  }

  /**
   * Get 2D (standard) transform - identity transform
   *
   * @returns No transform (standard orthogonal view)
   */
  static calculate2DTransform(): string {
    return 'none';
  }

  /**
   * Get transform based on view mode
   *
   * @param viewMode - '2d' or 'isometric'
   * @returns Appropriate CSS transform string
   */
  static getTransform(viewMode: ViewMode): string {
    return viewMode === 'isometric'
      ? this.calculateIsometricTransform()
      : this.calculate2DTransform();
  }

  /**
   * T122: Calculate Y offset for a given floor level in isometric view
   * Each floor level adds a fixed offset to create vertical stacking effect
   *
   * @param floor - Floor level (0 = ground floor)
   * @returns Y offset in pixels (negative values move up in SVG coordinates)
   */
  static getFloorYOffset(floor: number): number {
    const FLOOR_HEIGHT = 50;  // Pixels offset per floor level
    return -(floor * FLOOR_HEIGHT);  // Negative Y moves up in SVG coordinates
  }

  /**
   * T122: Apply floor offset to region Y coordinate for isometric rendering
   * This creates a visual stacking effect where higher floors appear above lower floors
   *
   * @param region - Region to apply offset to
   * @returns Object with adjusted x and y coordinates
   */
  static applyFloorOffset(region: Region): { x: number; y: number } {
    return {
      x: region.x,
      y: region.y + this.getFloorYOffset(region.floor ?? 0)
    };
  }
}
