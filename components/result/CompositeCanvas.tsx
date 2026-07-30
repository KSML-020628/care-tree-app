"use client";

import { useEffect, useState } from "react";
import { compositeFinalArtwork } from "@/lib/drawing/canvas-export";
import { readSubmissions } from "@/lib/mock/submissions";
import type { Quadrant } from "@/types/assignment";

interface CompositeCanvasProps {
  roomId: string;
  transparentLineArtSrc: string | null;
  onReady?: (compositeSrc: string) => void;
}

/** 방에 모인 4개 제출물을 원래 좌표에 맞춰 하나의 완성 그림으로 합쳐 보여준다. */
export default function CompositeCanvas({ roomId, transparentLineArtSrc, onReady }: CompositeCanvasProps) {
  const [compositeSrc, setCompositeSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!transparentLineArtSrc) return;
    let cancelled = false;

    async function build() {
      const submissions = readSubmissions(roomId);
      const quadrantImages: Partial<Record<Quadrant, string>> = {};
      submissions.forEach((submission) => {
        quadrantImages[submission.quadrant] = submission.imageDataUrl;
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
  }, [roomId, transparentLineArtSrc]);

  return (
    <div className="aspect-square w-full max-w-[480px] overflow-hidden rounded-[32px] bg-white shadow-soft">
      {compositeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={compositeSrc} alt="친구들과 함께 완성한 나무 그림" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full items-center justify-center text-text-secondary">불러오는 중...</div>
      )}
    </div>
  );
}
