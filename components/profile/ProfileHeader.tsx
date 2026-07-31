"use client";

import { useRouter } from "next/navigation";
import type { ChildProfile } from "@/lib/profile/profile.types";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeaderProps {
  profile: ChildProfile;
}

/** 헤더에 붙는 "지금 로그인한 사람이 누구인지" 표시. 누르면 /profile로 이동한다. */
export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/profile")}
      aria-label={`${profile.artistName} 화가, 내 프로필 보기`}
      className="flex items-center gap-2 rounded-2xl bg-white py-1 pl-1 pr-3 shadow-[0_4px_0_rgba(97,112,154,0.18)] active:translate-y-[2px]"
    >
      <ProfileAvatar avatarImageUrl={profile.avatarImageUrl} artistName={profile.artistName} size="sm" />
      <span className="max-w-[110px] truncate text-sm font-bold text-text-primary">{profile.artistName} 화가</span>
    </button>
  );
}
