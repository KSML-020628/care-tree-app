import { create } from "zustand";
import { generateGlitterParticles } from "@/lib/drawing/glitter-generator";
import { buildStrokeBase } from "@/lib/drawing/stroke-renderer";
import { loadDrawingProgress, saveDrawingProgress } from "@/lib/storage/local-drawing-storage";
import type { BrushSize, DrawingTool, Stroke } from "@/types/drawing";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface DrawingState {
  assignmentId: string | null;
  strokes: Stroke[];
  redoStack: Stroke[];
  tool: DrawingTool;
  colorId: string;
  brushSize: BrushSize;
  saveStatus: SaveStatus;
  loadForAssignment: (assignmentId: string) => void;
  addStroke: (points: number[]) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  setTool: (tool: DrawingTool) => void;
  setColorId: (colorId: string) => void;
  setBrushSize: (size: BrushSize) => void;
  retrySave: () => void;
}

function persist(assignmentId: string | null, strokes: Stroke[], set: (partial: Partial<DrawingState>) => void) {
  if (!assignmentId) return;
  set({ saveStatus: "saving" });
  const ok = saveDrawingProgress(assignmentId, strokes);
  if (ok) {
    set({ saveStatus: "saved" });
  } else {
    set({ saveStatus: "error" });
    // 저장 실패 시 한 번 더 시도한다.
    window.setTimeout(() => {
      const retryOk = saveDrawingProgress(assignmentId, strokes);
      set({ saveStatus: retryOk ? "saved" : "error" });
    }, 1200);
  }
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  assignmentId: null,
  strokes: [],
  redoStack: [],
  tool: "PENCIL",
  colorId: "red",
  brushSize: "MEDIUM",
  saveStatus: "idle",

  loadForAssignment: (assignmentId) => {
    const strokes = loadDrawingProgress(assignmentId);
    set({ assignmentId, strokes, redoStack: [], saveStatus: "idle" });
  },

  addStroke: (points) => {
    const { tool, colorId, brushSize, strokes, assignmentId } = get();
    const base = buildStrokeBase(points, tool, colorId, brushSize);

    const stroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...base,
    };

    if (tool === "GLITTER") {
      stroke.glitterParticles = generateGlitterParticles(points, base.width);
    }

    const nextStrokes = [...strokes, stroke];
    set({ strokes: nextStrokes, redoStack: [] });
    persist(assignmentId, nextStrokes, set);
  },

  undo: () => {
    const { strokes, redoStack, assignmentId } = get();
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const nextStrokes = strokes.slice(0, -1);
    set({ strokes: nextStrokes, redoStack: [...redoStack, last] });
    persist(assignmentId, nextStrokes, set);
  },

  redo: () => {
    const { strokes, redoStack, assignmentId } = get();
    if (redoStack.length === 0) return;
    const restored = redoStack[redoStack.length - 1];
    const nextStrokes = [...strokes, restored];
    set({ strokes: nextStrokes, redoStack: redoStack.slice(0, -1) });
    persist(assignmentId, nextStrokes, set);
  },

  clearAll: () => {
    const { assignmentId } = get();
    set({ strokes: [], redoStack: [] });
    persist(assignmentId, [], set);
  },

  setTool: (tool) => set({ tool }),
  setColorId: (colorId) => set({ colorId }),
  setBrushSize: (brushSize) => set({ brushSize }),

  retrySave: () => {
    const { assignmentId, strokes } = get();
    persist(assignmentId, strokes, set);
  },
}));
