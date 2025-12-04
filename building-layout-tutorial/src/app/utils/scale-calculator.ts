// T010: BoundingBox interface and ScaleCalculator class
import * as d3 from 'd3';
import { LayoutConfiguration } from '../models/layout-config.interface';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export class ScaleCalculator {
  static calculateBounds(config: LayoutConfiguration): BoundingBox {
    if (config.regions.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
    }

    const minX = d3.min(config.regions, d => d.x) ?? 0;
    const minY = d3.min(config.regions, d => d.y) ?? 0;
    const maxX = d3.max(config.regions, d => d.x + d.width) ?? 100;
    const maxY = d3.max(config.regions, d => d.y + d.height) ?? 100;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  static calculateFitScales(
    config: LayoutConfiguration,
    viewportWidth: number,
    viewportHeight: number,
    padding: number = 20
  ) {
    const bounds = this.calculateBounds(config);

    const xScale = d3.scaleLinear()
      .domain([bounds.minX - padding, bounds.maxX + padding])
      .range([0, viewportWidth]);

    const yScale = d3.scaleLinear()
      .domain([bounds.minY - padding, bounds.maxY + padding])
      .range([0, viewportHeight]);

    return { xScale, yScale };
  }
}
