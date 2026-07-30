import CareHam, { type CareHamReactionType } from "@/components/mascot/CareHam";
import CareHamSpeechBubble from "@/components/mascot/CareHamSpeechBubble";
import type { ActiveCareHamType } from "@/lib/mascot/mascot-config";

interface PraiseOverlayProps {
  mascotType: ActiveCareHamType;
  message: string;
  reaction?: CareHamReactionType;
  className?: string;
  /** false면 말풍선만 먼저 보여주고 케어햄은 잠깐 뒤에 등장시킬 수 있다(기본값 true = 함께 등장). */
  showMascot?: boolean;
}

/** 케어햄 + 사전 검수된 칭찬 문장을 함께 보여주는 연출용 조합. AI가 만든 자유 문장은 여기 들어가지 않는다. */
export default function PraiseOverlay({
  mascotType,
  message,
  reaction = "CHEER",
  className = "",
  showMascot = true,
}: PraiseOverlayProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <CareHamSpeechBubble tone="accent">{message}</CareHamSpeechBubble>
      {showMascot && <CareHam type={mascotType} size="LARGE" reaction={reaction} />}
    </div>
  );
}
