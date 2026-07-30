"use client";

interface RewardActionButtonProps {
  label: string;
  onClick: () => void;
  ready: boolean;
  navigating?: boolean;
}

/**
 * 보상 화면 맨 아래 "우리 그림 보러 가기" 버튼. 다른 화면의 ghost 버튼과 달리
 * 이 화면에서만 흰 배경 + 파란 글씨 조합을 쓰기 때문에 공용 ChildButton 대신 직접 스타일링한다.
 * ready가 되기 전까지는 투명하게 숨겨 두고(연출이 끝나기 전 조급하게 누르지 않도록), 눌린 뒤에는
 * 다시 누를 수 없게 막는다(중복 클릭으로 화면 전환이 여러 번 겹치는 것을 방지).
 */
export default function RewardActionButton({ label, onClick, ready, navigating = false }: RewardActionButtonProps) {
  const stateClass = !ready ? "pointer-events-none opacity-0" : navigating ? "pointer-events-none opacity-60" : "opacity-100";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-hidden={!ready}
      tabIndex={ready ? 0 : -1}
      className={`min-h-[62px] min-w-[240px] rounded-[20px] border-2 border-[#D8E2FF] bg-white px-8 text-lg font-bold text-primary-blue shadow-soft transition-opacity duration-300 active:translate-y-[2px] ${stateClass}`}
    >
      {label}
    </button>
  );
}
