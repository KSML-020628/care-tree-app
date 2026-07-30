"use client";

import { useEffect, useState } from "react";
import { compositeFinalArtwork } from "@/lib/drawing/canvas-export";
import { readContributions } from "@/lib/mock/weekly-canvas";
import type { Quadrant } from "@/types/assignment";

interface CompositeCanvasProps {
  weeklyCanvasId: string;
  transparentLineArtSrc: string | null;
  onReady?: (compositeSrc: string) => void;
  /** 다른 요소를 위에 겹쳐야 할 때(예: 배정 강조 테두리) 부모 크기를 그대로 채우도록 한다. */
  fill?: boolean;
}

/**
 * 지금까지 공유된 사분면들을 원래 좌표에 맞춰 하나의 그림으로 합쳐 보여준다.
 * 아직 공유되지 않은 사분면이 있어도(=일부만 채워져 있어도) 문제없이 그려진다.
 */
export default function CompositeCanvas({
  weeklyCanvasId,
  transparentLineArtSrc,
  onReady,
  fill = false,
}: CompositeCanvasProps) {
  const [compositeSrc, setCompositeSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!transparentLineArtSrc) return;
    let cancelled = false;

    async function build() {
      const contributions = readContributions(weeklyCanvasId).filter((item) => item.status === "SHARED");
      const quadrantImages: Partial<Record<Quadrant, string>> = {};
      contributions.forEach((contribution) => {
        if (contribution.imageDataUrl) quadrantImages[contribution.quadrant] = contribution.imageDataUrl;
      });

      if (!transparentLineArtSrc) return;
      const composite = await compositeFinalArtwork(quadrantImages, transparentLineArtSrc);
      if (cancelled) return;
      setCompositeSrc(composite);
      onReady?.(composite);
    }

    build();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyCanvasId, transparentLineArtSrc]);

  return (
    <div
      className={
        fill
          ? "h-full w-full overflow-hidden rounded-[32px] bg-white"
          : "aspect-square w-full max-w-[480px] overflow-hidden rounded-[32px] bg-white shadow-soft"
      }
    >
      {compositeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={compositeSrc} alt="우리가 함께 만든 나무 그림" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full items-center justify-center text-text-secondary">불러오는 중...</div>
      )}
    </div>
  );
}
