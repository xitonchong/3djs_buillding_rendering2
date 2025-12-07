export interface MovementVisualizationOptions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface MovementFilter {
  workweek?: string;
  minMoves?: number;
  maxMoves?: number;
  categories?: string[];
}
