import CareHam, { type CareHamSize } from "@/components/mascot/CareHam";

interface ProfileAvatarProps {
  avatarImageUrl: string | null;
  artistName: string;
  size?: "sm" | "md" | "lg";
  /** "나"를 표시할 때만 노란 테두리로 강조한다(색만으로 구분하지 않도록, 배지는 호출하는 쪽에서 따로 둔다). */
  highlighted?: boolean;
}

const SIZE_PX: Record<NonNullable<ProfileAvatarProps["size"]>, number> = { sm: 40, md: 64, lg: 120 };
const CARE_HAM_SIZE: Record<NonNullable<ProfileAvatarProps["size"]>, CareHamSize> = {
  sm: "XS",
  md: "SMALL",
  lg: "MEDIUM",
};

/**
 * 아이가 직접 그린 프로필 그림(또는 기본 케어햄)을 원형으로 보여준다.
 * avatarImageUrl이 없으면(기본 케어햄 프로필) CareHam 이미지로 자연스럽게 대체된다.
 */
export default function ProfileAvatar({ avatarImageUrl, artistName, size = "md", highlighted = false }: ProfileAvatarProps) {
  const pixelSize = SIZE_PX[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F8FF] ${
        highlighted ? "border-4 border-accent-yellow-dark" : "border-2 border-[#DCE3FF]"
      }`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {avatarImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarImageUrl} alt={`${artistName} 화가의 그림`} className="h-full w-full object-contain" />
      ) : (
        <CareHam type="GUIDE" size={CARE_HAM_SIZE[size]} />
      )}
    </div>
  );
}
