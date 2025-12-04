// T026: BoundsCalculator utility class
import { Region } from '../models/region.interface';
import { LayoutConfiguration } from '../models/layout-config.interface';
import { Viewport } from '../models/viewport.interface';
import { BoundingBox } from './scale-calculator';

export class BoundsCalculator {
  // Calculate bounds for single region
  static getRegionBounds(region: Region): BoundingBox {
    return {
      minX: region.x,
      minY: region.y,
      maxX: region.x + region.width,
      maxY: region.y + region.height,
      width: region.width,
      height: region.height
    };
  }

  // Calculate bounds encompassing all regions
  static getLayoutBounds(config: LayoutConfiguration): BoundingBox {
    if (config.regions.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
    }

    const bounds = config.regions.map(r => this.getRegionBounds(r));
    const minX = Math.min(...bounds.map(b => b.minX));
    const minY = Math.min(...bounds.map(b => b.minY));
    const maxX = Math.max(...bounds.map(b => b.maxX));
    const maxY = Math.max(...bounds.map(b => b.maxY));

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // Calculate visible bounds given viewport
  static getVisibleBounds(viewport: Viewport): BoundingBox {
    const minX = -viewport.translateX / viewport.scale;
    const minY = -viewport.translateY / viewport.scale;
    const maxX = minX + viewport.width / viewport.scale;
    const maxY = minY + viewport.height / viewport.scale;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // Check if region is visible in viewport
  static isRegionVisible(region: Region, viewport: Viewport): boolean {
    const regionBounds = this.getRegionBounds(region);
    const visibleBounds = this.getVisibleBounds(viewport);

    // Check for intersection
    return !(
      regionBounds.maxX < visibleBounds.minX ||
      regionBounds.minX > visibleBounds.maxX ||
      regionBounds.maxY < visibleBounds.minY ||
      regionBounds.minY > visibleBounds.maxY
    );
  }
}
