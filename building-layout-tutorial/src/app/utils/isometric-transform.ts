// T071: Isometric transformation utility for CSS 3D transforms
import { ViewMode } from '../models/viewport.interface';

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
      perspective(1500px)
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
}
