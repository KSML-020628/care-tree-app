import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { AvatarSource, ChildProfile } from "./profile.types";

/**
 * 프로필도 weekly-canvas.ts와 같은 이유로 Supabase에 둔다 — 123456과 111111이 서로 다른
 * 기기에서 로그인해도 서로의 "나를 나타내는 그림"을 볼 수 있어야 하기 때문이다.
 * id는 participantId와 그대로 같다(한 아이당 프로필은 하나뿐이라 별도 uuid가 필요 없다).
 */

interface ChildProfileRow {
  id: string;
  artist_name: string;
  avatar_image_url: string | null;
  avatar_source: AvatarSource;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

function toChildProfile(row: ChildProfileRow): ChildProfile {
  return {
    id: row.id,
    participantId: row.id,
    artistName: row.artist_name,
    avatarImageUrl: row.avatar_image_url,
    avatarSource: row.avatar_source,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function warnIfNotConfigured(action: string): void {
  if (isSupabaseConfigured) return;
  console.warn(`[profile-storage] Supabase 환경변수가 없어 "${action}"을(를) 건너뜁니다.`);
}

export async function getProfile(participantId: string): Promise<ChildProfile | null> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("프로필 조회");
    return null;
  }
  const { data, error } = await supabase.from("child_profiles").select("*").eq("id", participantId).maybeSingle();
  if (error) {
    console.error("[profile-storage] 프로필 조회 실패:", error.message);
    return null;
  }
  return data ? toChildProfile(data) : null;
}

/** 여러 아이의 프로필을 한 번에 가져온다(공동 작품 참여자 목록 표시용). */
export async function getProfiles(participantIds: string[]): Promise<Record<string, ChildProfile>> {
  if (!isSupabaseConfigured || participantIds.length === 0) return {};
  const { data, error } = await supabase.from("child_profiles").select("*").in("id", participantIds);
  if (error) {
    console.error("[profile-storage] 프로필 목록 조회 실패:", error.message);
    return {};
  }
  const result: Record<string, ChildProfile> = {};
  for (const row of data ?? []) {
    const profile = toChildProfile(row);
    result[profile.participantId] = profile;
  }
  return result;
}

export async function saveProfile(profile: ChildProfile): Promise<ChildProfile> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("프로필 저장");
    // 존재하지 않는 placeholder 주소로 요청을 보내 느리게 실패하는 대신, 바로 명확하게 실패시킨다.
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }
  const row = {
    id: profile.participantId,
    artist_name: profile.artistName,
    avatar_image_url: profile.avatarImageUrl,
    avatar_source: profile.avatarSource,
    onboarding_completed: profile.onboardingCompleted,
    created_at: profile.createdAt,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("child_profiles").upsert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? "프로필을 저장하지 못했어요.");
  return toChildProfile(data);
}

export async function updateProfileImage(
  participantId: string,
  imageDataUrl: string,
  source: AvatarSource,
): Promise<void> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("프로필 이미지 업데이트");
    return;
  }
  const { error } = await supabase
    .from("child_profiles")
    .update({ avatar_image_url: imageDataUrl, avatar_source: source, updated_at: new Date().toISOString() })
    .eq("id", participantId);
  if (error) console.error("[profile-storage] 프로필 이미지 업데이트 실패:", error.message);
}

function nowIso(): string {
  return new Date().toISOString();
}

/** 아직 저장 전인, 케어햄 기본 프로필 초안을 만든다(보호자/운영자 전용 "기본 케어햄으로 시작하기"). */
export function buildDefaultCareHamProfile(participantId: string, artistName: string): ChildProfile {
  const timestamp = nowIso();
  return {
    id: participantId,
    participantId,
    artistName,
    avatarImageUrl: null,
    avatarSource: "DEFAULT_CAREHAM",
    onboardingCompleted: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** 아이가 직접 그린 그림으로 프로필 초안을 만든다. */
export function buildDrawnProfile(participantId: string, artistName: string, avatarImageUrl: string): ChildProfile {
  const timestamp = nowIso();
  return {
    id: participantId,
    participantId,
    artistName,
    avatarImageUrl,
    avatarSource: "DRAWN",
    onboardingCompleted: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
