import CareHam from "@/components/mascot/CareHam";

interface ProfilePreviewCardProps {
  avatarImageUrl: string;
  artistName: string;
}

/** 완성한 프로필 그림을 원형 카드로 크게 보여주고, 실제 공동 작품 카드에서 보일 작은 모습도 함께 보여준다. */
export default function ProfilePreviewCard({ avatarImageUrl, artistName }: ProfilePreviewCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-3">
        <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-[#F5F8FF] shadow-soft [animation:gentle-pop_500ms_ease-out]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarImageUrl} alt={`${artistName} 화가의 그림`} className="h-full w-full object-contain" />
        </div>
        <CareHam type="SMILE" size="MEDIUM" reaction="BOUNCE" />
      </div>

      <p className="text-lg font-extrabold text-text-primary">{artistName} 화가</p>

      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-soft">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#DCE3FF]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarImageUrl} alt="" className="h-full w-full object-contain" />
        </div>
        <span className="text-sm font-bold text-text-primary">{artistName} 화가</span>
      </div>
    </div>
  );
}
