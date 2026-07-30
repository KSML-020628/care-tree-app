"use client";

import { Sparkles } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { QUADRANT_GRID_ORDER, getQuadrantPercentRect } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";

type FlyingImageStyle = CSSProperties & { "--fly-x": string; "--fly-y": string };

interface CompletionAnimationProps {
  quadrantImages: Partial<Record<Quadrant, string>>;
  lineArtOverlaySrc: string | null;
  onLanded?: () => void;
}

/** 사분면이 날아오는 시작 방향(퍼센트 이동량). 원래 위치에서 바깥쪽으로 튕겨 나가 있다가 제자리로 온다. */
const FLY_FROM: Record<Quadrant, { x: string; y: string }> = {
  TOP_LEFT: { x: "-70%", y: "-70%" },
  TOP_RIGHT: { x: "70%", y: "-70%" },
  BOTTOM_LEFT: { x: "-70%", y: "70%" },
  BOTTOM_RIGHT: { x: "70%", y: "70%" },
};

const LAND_DELAY_MS = 1500;

/**
 * 4조각이 네 방향에서 날아와 하나로 맞춰지는 완성 연출.
 * 조각이 다 모이면 살짝 빛나는 테두리와 반짝이가 잠깐 나타난다.
 */
export default function CompletionAnimation({ quadrantImages, lineArtOverlaySrc, onLanded }: CompletionAnimationProps) {
  const [landed, setLanded] = useState(false);

  return (
    <div
      className={`relative aspect-square w-full max-w-[480px] overflow-hidden rounded-[32px] bg-white ${
        landed ? "[animation:glow-ring_1.6s_ease-out_2]" : ""
      }`}
    >
      {QUADRANT_GRID_ORDER.map((quadrant, index) => {
        const src = quadrantImages[quadrant];
        if (!src) return null;
        const rect = getQuadrantPercentRect(quadrant);
        const from = FLY_FROM[quadrant];
        const style: FlyingImageStyle = {
          ...rect,
          "--fly-x": from.x,
          "--fly-y": from.y,
          animation: `piece-fly-in 900ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 150}ms both`,
        };
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={quadrant} src={src} alt="" className="absolute" style={style}
            onAnimationEnd={() => {
              if (index === QUADRANT_GRID_ORDER.length - 1) {
                setLanded(true);
                window.setTimeout(() => onLanded?.(), LAND_DELAY_MS);
              }
            }}
          />
        );
      })}

      {lineArtOverlaySrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={lineArtOverlaySrc} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
      )}

      {landed && (
        <>
          <Sparkles
            aria-hidden="true"
            size={36}
            className="absolute -right-2 -top-2 text-accent-yellow-dark [animation:sparkle-pulse_1.2s_ease-in-out_2]"
          />
          <Sparkles
            aria-hidden="true"
            size={26}
            className="absolute -left-2 bottom-4 text-primary-blue-light [animation:sparkle-pulse_1.2s_ease-in-out_.3s_2]"
          />
        </>
      )}
    </div>
  );
}
