"use client";

import { UI_TEXT } from "@/lib/constants/ui-text";
import type { Quadrant } from "@/types/assignment";
import type { DrawingContribution } from "@/types/room";
import ParticipantProfileCard from "./ParticipantProfileCard";

interface ParticipantAvatarListProps {
  contributions: DrawingContribution[];
  currentUserId?: string;
  onSelectQuadrant?: (quadrant: Quadrant) => void;
  heading?: string;
}

/** "함께 그린 화가 친구들" 섹션. 공동 작품·갤러리 양쪽에서 재사용한다. */
export default function ParticipantAvatarList({
  contributions,
  currentUserId,
  onSelectQuadrant,
  heading = UI_TEXT.participants.heading,
}: ParticipantAvatarListProps) {
  if (contributions.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      {heading && <p className="mb-2 text-center text-sm font-bold text-text-secondary">{heading}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {contributions.map((contribution) => (
          <ParticipantProfileCard
            key={contribution.id}
            quadrant={contribution.quadrant}
            isPlaceholder={contribution.isPlaceholder ?? false}
            isCurrentUser={contribution.participantId === currentUserId}
            artistName={contribution.participantSnapshot?.artistName ?? contribution.nickname}
            avatarImageUrl={contribution.participantSnapshot?.avatarImageUrl ?? null}
            onClick={onSelectQuadrant ? () => onSelectQuadrant(contribution.quadrant) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
