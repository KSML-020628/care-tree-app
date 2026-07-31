"use client";

import CareHam from "@/components/mascot/CareHam";
import { PARTICIPANT_QUADRANT_LABEL, UI_TEXT } from "@/lib/constants/ui-text";
import type { Quadrant } from "@/types/assignment";
import ProfileAvatar from "./ProfileAvatar";

interface ParticipantProfileCardProps {
  quadrant: Quadrant;
  isPlaceholder: boolean;
  isCurrentUser: boolean;
  artistName: string;
  avatarImageUrl: string | null;
  onClick?: () => void;
}

/**
 * 공동 작품 화면·갤러리에서 "누가 어디를 그렸는지" 보여주는 카드.
 * 실명·환자번호·접속 상태는 절대 표시하지 않는다 — 화가 이름과 직접 그린 프로필 그림, 담당 구역뿐이다.
 * placeholder(아직 아무도 안 채운 자리)는 특정 아이인 척하지 않고 케어햄으로만 보여준다.
 */
export default function ParticipantProfileCard({
  quadrant,
  isPlaceholder,
  isCurrentUser,
  artistName,
  avatarImageUrl,
  onClick,
}: ParticipantProfileCardProps) {
  const content = (
    <>
      <div className="relative">
        {isPlaceholder ? (
          <CareHam type="TOGETHER" size="SMALL" />
        ) : (
          <ProfileAvatar avatarImageUrl={avatarImageUrl} artistName={artistName} size="sm" highlighted={isCurrentUser} />
        )}
        {isCurrentUser && (
          <span className="absolute -right-1 -top-1 rounded-full bg-accent-yellow-dark px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-soft">
            {UI_TEXT.participants.me}
          </span>
        )}
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-extrabold text-text-primary">
          {isPlaceholder ? UI_TEXT.participants.careHamJoined : `${artistName} 화가`}
        </p>
        <p className="truncate text-xs font-semibold text-text-secondary">{PARTICIPANT_QUADRANT_LABEL[quadrant]}</p>
      </div>
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-soft">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-left shadow-soft active:translate-y-[1px]"
    >
      {content}
    </button>
  );
}
