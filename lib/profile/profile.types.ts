/**
 * "프로필 그림"은 아이가 직접 그림판에서 그려서 만드는 자기 자신을 나타내는 그림이다.
 * 실제 얼굴 사진이나 실명을 대신해서 서로를 알아보는 용도로만 쓴다.
 */
export type AvatarSource = "DRAWN" | "DEFAULT_CAREHAM";

export interface ChildProfile {
  id: string;
  participantId: string;
  artistName: string;
  avatarImageUrl: string | null;
  avatarSource: AvatarSource;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 그림 조각을 제출한 "그 순간"의 프로필을 그대로 얼려서 저장한 스냅샷.
 * 나중에 아이가 프로필 그림을 새로 그려도, 이미 제출된 옛날 작품 카드의 참여자 표시는
 * 바뀌지 않는다(전시 기록이 갑자기 달라 보이지 않도록).
 */
export interface ParticipantSnapshot {
  participantId: string;
  artistName: string;
  avatarImageUrl: string | null;
}

export function toParticipantSnapshot(profile: ChildProfile): ParticipantSnapshot {
  return {
    participantId: profile.participantId,
    artistName: profile.artistName,
    avatarImageUrl: profile.avatarImageUrl,
  };
}
