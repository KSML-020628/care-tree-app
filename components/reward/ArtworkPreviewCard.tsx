import AssignmentHighlight from "@/components/assignment/AssignmentHighlight";
import CompositeCanvas from "@/components/result/CompositeCanvas";
import { getQuadrantPercentRect } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";

interface ArtworkPreviewCardProps {
  weeklyCanvasId: string;
  transparentLineArtSrc: string | null;
  userQuadrant: Quadrant;
  highlightQuadrant?: boolean;
}

/**
 * 보상 화면 상단에 보여주는 작은 공동 작품 미리보기.
 * 지금까지 모인 우리 그림 전체(내가 방금 넣은 조각 + 아직 안 채워진 자리의 케어햄 색칠본)를 보여주고,
 * 내가 색칠한 사분면만 노란 테두리로 강조한다.
 */
export default function ArtworkPreviewCard({
  weeklyCanvasId,
  transparentLineArtSrc,
  userQuadrant,
  highlightQuadrant = true,
}: ArtworkPreviewCardProps) {
  return (
    <div className="relative h-[190px] w-[190px] overflow-hidden rounded-[24px] border border-[#D8E2FF] bg-white shadow-soft [animation:gentle-pop_500ms_ease-out]">
      <CompositeCanvas weeklyCanvasId={weeklyCanvasId} transparentLineArtSrc={transparentLineArtSrc} fill />
      {highlightQuadrant && <AssignmentHighlight style={getQuadrantPercentRect(userQuadrant)} />}
    </div>
  );
}
