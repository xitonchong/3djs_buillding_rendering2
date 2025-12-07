// New utility for true isometric projection
import { Injectable } from '@angular/core';

const ANGLE = Math.atan(0.5); // ~26.565 degrees

@Injectable({
  providedIn: 'root'
})
export class IsometricProjection {

  /**
   * Projects 3D coordinates to 2D isometric screen coordinates.
   * @param x - The x-coordinate in 3D space.
   * @param y - The y-coordinate in 3D space.
   * @param z - The z-coordinate in 3D space.
   * @returns A tuple [screenX, screenY] representing the 2D coordinates.
   */
  public project(x: number, y: number, z: number): [number, number] {
    const screenX = (x - y) * Math.cos(ANGLE);
    const screenY = (x + y) * Math.sin(ANGLE) - z;
    return [screenX, screenY];
  }

  /**
   * Projects a polygon (array of 3D points) to a 2D isometric polygon.
   * @param points - An array of 3D points, where each point is [x, y, z].
   * @returns A string of 2D points for an SVG polygon.
   */
  public projectPolygon(points: [number, number, number][]): string {
    return points.map(p => this.project(p[0], p[1], p[2]).join(',')).join(' ');
  }
}
