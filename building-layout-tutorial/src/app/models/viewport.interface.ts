// T008: Viewport interface
export interface Viewport {
  // Transform state
  scale: number;
  translateX: number;
  translateY: number;

  // Viewport dimensions
  width: number;
  height: number;

  // Constraints
  minScale: number;
  maxScale: number;
}
