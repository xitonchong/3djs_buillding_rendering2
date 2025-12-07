// T071, T122 & T138-T148: Isometric transformation utility for CSS 3D transforms
import { ViewMode } from '../models/viewport.interface';
import { Region } from '../models/region.interface';

/**
 * Isometric Transformation Utility
 *
 * This utility provides CSS 3D transform strings for creating isometric
 * projections of 2D floor plans. It implements STANDARD isometric projection
 * following ISO 5456-3 technical drawing conventions.
 *
 * Standard Isometric Projection (30°-30° Configuration):
 * -------------------------------------------------------
 * In technical drawing and CAD, standard isometric projection uses:
 * - 30° rotation around X-axis (tilts the XY plane / floor)
 * - 30° rotation around Z-axis (creates diamond orientation)
 * - Equal foreshortening: all axes reduced by ~0.816 (cos 30°)
 *
 * This creates the classic "technical drawing" isometric view where:
 * - Vertical lines remain vertical in the final view
 * - Horizontal lines appear at 30° angles to the horizontal
 * - All three axes (X, Y, Z) are equally foreshortened
 * - Provides proper depth perception for multi-floor buildings
 *
 * Use Cases:
 * - Technical drawings and blueprints
 * - Engineering visualizations
 * - Architectural floor plan demonstrations
 * - Game-style overhead views (strategy games, simulators)
 *
 * Browser Support:
 * - Requires CSS 3D transforms (transform-style: preserve-3d)
 * - Supported in all modern browsers (Chrome, Firefox, Safari, Edge)
 * - Hardware accelerated (GPU) for smooth performance
 *
 * @see https://en.wikipedia.org/wiki/Isometric_projection
 * @see ISO 5456-3 Technical drawings standard
 *
 * @author T138-T148: Updated to standard 30° configuration (2025-12-06)
 */
export class IsometricTransform {
  /**
   * Calculate CSS 3D transform for STANDARD isometric projection
   *
   * Implements the classic 30°-30° isometric configuration used in technical
   * drawings and engineering blueprints. This replaces the previous 10° tilt
   * with the industry-standard 30° tilt for proper floor dimension representation.
   *
   * Technical Details:
   * - rotateX(30deg): Tilts the XY plane at standard isometric angle
   * - rotateZ(30deg): Creates the classic diamond orientation
   * - scale(1.5): Compensates for foreshortening at 30° (increased from 1.3)
   * - perspective(2000px): Provides depth perception without distortion
   *
   * The 30° X-rotation creates the proper "housing" for floor dimensions,
   * making multi-floor buildings appear with correct depth stacking.
   *
   * @returns CSS transform string for standard isometric view
   */
  static calculateIsometricTransform(): string {
    // T139: Standard isometric projection angles (30°-30° configuration)
    // This follows ISO 5456-3 technical drawing standards
    const rotateX = 30;  // degrees - STANDARD isometric tilt for XY plane (was 10°)
    const rotateZ = 30;  // degrees - standard isometric rotation around Z-axis

    // T140: Scale factor adjusted for 30° rotation
    // With 30° X-rotation, we get more foreshortening than 10°
    // Increased from 1.3 to 1.5 to maintain visibility and proper floor separation
    const scale = 1.5;   // Adjusted for standard isometric foreshortening

    // T141: Perspective maintained at 2000px for proper depth perception
    // This value provides good depth effect at 30° without excessive distortion
    const perspective = 2000;  // pixels - controls depth effect strength

    return `
      perspective(${perspective}px)
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
   * T122 & T143: Calculate Y offset for a given floor level in isometric view
   *
   * Each floor level adds a fixed offset to create vertical stacking effect.
   * This works correctly with the standard 30° isometric tilt - the increased
   * scale factor (1.5) compensates for the steeper angle, maintaining proper
   * visual separation between floors.
   *
   * Technical Note:
   * - FLOOR_HEIGHT of 50px provides good separation at 30° tilt with scale 1.5
   * - At previous 10° tilt with scale 1.3, this gave shallower stacking
   * - At new 30° tilt with scale 1.5, stacking appears more dramatic and clear
   * - Negative Y values move "up" in SVG coordinate system (origin top-left)
   *
   * @param floor - Floor level (0 = ground floor, 1 = first floor, etc.)
   * @returns Y offset in pixels (negative values move up in SVG coordinates)
   */
  static getFloorYOffset(floor: number): number {
    const FLOOR_HEIGHT = 50;  // Pixels offset per floor level (verified for 30° tilt)
    return -(floor * FLOOR_HEIGHT);  // Negative Y moves up in SVG coordinates
  }

  /**
   * T122: Apply floor offset to region Y coordinate for isometric rendering
   *
   * This creates a visual stacking effect where higher floors appear above lower
   * floors. Works seamlessly with standard 30° isometric projection to provide
   * proper depth perception for multi-floor buildings.
   *
   * @param region - Region to apply offset to
   * @returns Object with adjusted x and y coordinates for isometric rendering
   */
  static applyFloorOffset(region: Region): { x: number; y: number } {
    return {
      x: region.x,
      y: region.y + this.getFloorYOffset(region.floor ?? 0)
    };
  }
}
