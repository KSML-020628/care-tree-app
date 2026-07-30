"use client";

import { BRUSH_SIZE_DOT_PX, BRUSH_SIZE_ORDER } from "@/lib/config/brush-sizes";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { BrushSize } from "@/types/drawing";

interface BrushSizeSelectorProps {
  value: BrushSize;
  onChange: (size: BrushSize) => void;
}

/** 숫자 px 대신 점 크기 아이콘으로 굵기를 고르게 한다. */
export default function BrushSizeSelector({ value, onChange }: BrushSizeSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-bold text-text-secondary">{UI_TEXT.drawing.brushSize}</p>
      <div className="flex justify-center gap-2">
        {BRUSH_SIZE_ORDER.map((size) => {
          const selected = size === value;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              aria-label={UI_TEXT.brushSizes[size]}
              aria-pressed={selected}
              className={[
                "flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl transition-colors",
                selected ? "bg-primary-blue-light/40 ring-2 ring-primary-blue" : "bg-[#F0F3FF]",
              ].join(" ")}
            >
              <span
                className="rounded-full bg-text-primary"
                style={{ width: BRUSH_SIZE_DOT_PX[size], height: BRUSH_SIZE_DOT_PX[size] }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
