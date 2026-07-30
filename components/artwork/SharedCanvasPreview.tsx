import AssignmentHighlight from "@/components/assignment/AssignmentHighlight";
import CompositeCanvas from "@/components/result/CompositeCanvas";
import { QUADRANT_GRID_ORDER, getQuadrantPercentRect } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";
import type { DrawingContribution } from "@/types/room";

interface SharedCanvasPreviewProps {
  weeklyCanvasId: string;
  transparentLineArtSrc: string | null;
  myQuadrant: Quadrant;
  contributions: DrawingContribution[];
}

/**
 * 지금까지 모인 우리 그림을 보여준다. 내 사분면은 노란 테두리로 강조하고,
 * 이미 공유된 사분면에는 화가의 아바타(익명 아이콘)만 작게 표시한다.
 * 접속 여부·진행 상태·"몇 명 남았는지"는 어디에도 보여주지 않는다.
 */
export default function SharedCanvasPreview({
  weeklyCanvasId,
  transparentLineArtSrc,
  myQuadrant,
  contributions,
}: SharedCanvasPreviewProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px] overflow-hidden rounded-[32px] shadow-soft">
      <CompositeCanvas weeklyCanvasId={weeklyCanvasId} transparentLineArtSrc={transparentLineArtSrc} fill />
      <AssignmentHighlight style={getQuadrantPercentRect(myQuadrant)} />
      {QUADRANT_GRID_ORDER.map((quadrant) => {
        const contribution = contributions.find((item) => item.quadrant === quadrant && item.status === "SHARED");
        if (!contribution) return null;
        const rect = getQuadrantPercentRect(quadrant);
        return (
          <span
            key={quadrant}
            aria-hidden="true"
            className="absolute flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-blue-light text-lg shadow-soft"
            style={{ top: `calc(${rect.top} + 8px)`, left: `calc(${rect.left} + 8px)` }}
          >
            {contribution.avatar}
          </span>
        );
      })}
    </div>
  );
}
