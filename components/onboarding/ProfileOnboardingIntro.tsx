"use client";

import ChildButton from "@/components/common/ChildButton";
import CareHam from "@/components/mascot/CareHam";
import CareHamSpeechBubble from "@/components/mascot/CareHamSpeechBubble";
import { UI_TEXT } from "@/lib/constants/ui-text";

/** 아직 스스로 그리기 어려운 날을 위해 케어햄이 가볍게 던져주는 소재 후보. 그림을 대신 그려주진 않는다. */
const DRAWING_SUGGESTIONS = ["별", "꽃", "자동차", "공룡", "무지개", "구름", "나비", "고양이"];

interface ProfileOnboardingIntroProps {
  onStartDrawing: (suggestion?: string) => void;
  onStartWithDefaultCareHam: () => void;
}

/**
 * 최초 로그인 시 보여주는 프로필 그림 안내 화면.
 * 기본 경로는 항상 "직접 그리기"이고, "기본 케어햄으로 시작하기"는 보호자·운영자가 아이 대신
 * 눌러줄 수 있도록 작고 눈에 덜 띄게 둔다(아동에게 "건너뛰기"라는 압박을 주지 않기 위해).
 */
export default function ProfileOnboardingIntro({
  onStartDrawing,
  onStartWithDefaultCareHam,
}: ProfileOnboardingIntroProps) {
  function handleRecommend() {
    const suggestion = DRAWING_SUGGESTIONS[Math.floor(Math.random() * DRAWING_SUGGESTIONS.length)];
    onStartDrawing(suggestion);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10 py-6 text-center">
      <CareHamSpeechBubble tone="accent">{UI_TEXT.onboarding.guideMessage}</CareHamSpeechBubble>
      <CareHam type="GUIDE" size="LARGE" reaction="WAVE" />

      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">{UI_TEXT.onboarding.title}</h1>
        <p className="mt-2 text-base font-semibold text-text-secondary">{UI_TEXT.onboarding.body}</p>
        <p className="mt-1 text-sm text-text-secondary">{UI_TEXT.onboarding.hint}</p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-3">
        <ChildButton variant="accent" size="large" fullWidth onClick={() => onStartDrawing()}>
          {UI_TEXT.onboarding.startDrawing}
        </ChildButton>
        <ChildButton variant="ghost" size="medium" fullWidth onClick={handleRecommend}>
          {UI_TEXT.onboarding.recommendByCareHam}
        </ChildButton>
      </div>

      <button
        type="button"
        onClick={onStartWithDefaultCareHam}
        aria-label={UI_TEXT.onboarding.startWithDefaultCareHam}
        className="mt-2 text-xs font-semibold text-text-secondary underline decoration-dotted underline-offset-4"
      >
        {UI_TEXT.onboarding.startWithDefaultCareHam}
      </button>
    </div>
  );
}
