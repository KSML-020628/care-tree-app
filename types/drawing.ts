export type DrawingTool = "PENCIL" | "PEN" | "BRUSH" | "CRAYON" | "ERASER" | "GLITTER";

export type BrushSize = "SMALL" | "MEDIUM" | "LARGE";

export interface GlitterParticle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export interface Stroke {
  id: string;
  tool: DrawingTool;
  points: number[];
  color: string;
  width: number;
  opacity: number;
  glitterParticles?: GlitterParticle[];
}

export interface SavedDrawingState {
  assignmentId: string;
  strokes: Stroke[];
  savedAt: string;
}
