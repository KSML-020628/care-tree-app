"use client";

import { useEffect, useState } from "react";
import ArtworkMotion from "@/components/artwork/ArtworkMotion";
import { isAnalysisDisplayable } from "@/lib/ai/artwork-analysis-display";
import { QUADRANT_GRID_ORDER, getQuadrantPercentRect } from "@/lib/config/quadrants";
import { readContributions } from "@/lib/mock/weekly-canvas";
import { useHydratedAnalyses } from "@/lib/store/ai-store";
import type { DrawingContribution } from "@/types/room";

interface CompositeCanvasProps {
  weeklyCanvasId: string;
  transparentLineArtSrc: string | null;
  /** 다른 요소를 위에 겹쳐야 할 때(예: 배정 강조 테두리) 부모 크기를 그대로 채우도록 한다. */
  fill?: boolean;
}

/**
 * 지금까지 공유된 사분면들을 원래 좌표에 맞춰 하나의 그림처럼 보여준다.
 * 아직 공유되지 않은 사분면이 있어도(=일부만 채워져 있어도) 문제없이 그려진다.
 *
 * 예전에는 canvas로 4조각+선화를 한 장의 PNG로 미리 구워서 보여줬지만, 그러면 조각마다
 * 다른 애니메이션(AI가 고른 motionPreset)을 줄 수 없었다. 그래서 지금은 조각마다 따로
 * <img>를 원래 좌표에 겹쳐 놓고, 선화만 맨 위에 고정 레이어로 한 번 더 덮는다.
 * 각 조각은 자신의 위치 상자 안에서만 움직이도록 한 겹 더 감싸서(overflow-hidden),
 * 움직임이 옆 조각을 침범하지 않게 한다.
 */
export default function CompositeCanvas({ weeklyCanvasId, transparentLineArtSrc, fill = false }: CompositeCanvasProps) {
  const [contributions, setContributions] = useState<DrawingContribution[]>([]);
  const analyses = useHydratedAnalyses(contributions.map((item) => item.id));

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setContributions(readContributions(weeklyCanvasId).filter((item) => item.status === "SHARED"));
  }, [weeklyCanvasId]);

  return (
    <div
      className={
        fill
          ? "relative h-full w-full overflow-hidden rounded-[32px] bg-white"
          : "relative aspect-square w-full max-w-[480px] overflow-hidden rounded-[32px] bg-white shadow-soft"
      }
    >
      {QUADRANT_GRID_ORDER.map((quadrant) => {
        const contribution = contributions.find((item) => item.quadrant === quadrant);
        if (!contribution?.imageDataUrl) return null;
        const rect = getQuadrantPercentRect(quadrant);
        const response = analyses[contribution.id];
        // placeholder(mock 친구의 자리표시자)는 실제로 제출된 적이 없어 AI 분석이 없으므로 항상 정지 상태다.
        // 확신이 낮거나 검토가 필요한 AI 결과도 마찬가지로 정지 상태(NONE)로 안전하게 대체한다.
        const motionPreset =
          !contribution.isPlaceholder && isAnalysisDisplayable(response)
            ? (response?.analysis.motionPreset ?? "NONE")
            : "NONE";

        return (
          <div key={quadrant} className="absolute overflow-hidden" style={rect}>
            <ArtworkMotion preset={motionPreset} className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={contribution.imageDataUrl} alt="" className="h-full w-full object-cover" />
            </ArtworkMotion>
          </div>
        );
      })}

      {transparentLineArtSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={transparentLineArtSrc}
          alt="우리가 함께 만든 나무 그림"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
