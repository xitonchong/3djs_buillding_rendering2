// T069: ViewMode type definition - '2d' for standard view, 'isometric' for angled 3D view
export type ViewMode = '2d' | 'isometric';

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

  // T070: View mode - controls 2D vs isometric projection
  viewMode: ViewMode;
}
