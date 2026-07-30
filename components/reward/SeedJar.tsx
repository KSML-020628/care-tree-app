import { SEED_MILESTONES } from "@/lib/rewards/seed-config";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface SeedJarProps {
  totalSeeds: number;
}

/** 해바라씨 항아리. 숫자를 크게 보여주지 않고, 얼마나 채워졌는지만 게이지로 보여준다. */
export default function SeedJar({ totalSeeds }: SeedJarProps) {
  const nextMilestone = SEED_MILESTONES.find((milestone) => milestone > totalSeeds) ?? SEED_MILESTONES[SEED_MILESTONES.length - 1];
  const previousMilestone = [...SEED_MILESTONES].reverse().find((milestone) => milestone <= totalSeeds) ?? 0;
  const span = Math.max(1, nextMilestone - previousMilestone);
  const ratio = Math.min(1, (totalSeeds - previousMilestone) / span);

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`${UI_TEXT.seeds.jarLabel}, 씨앗이 조금씩 쌓이고 있어요`}
    >
      <div className="relative h-28 w-20 overflow-hidden rounded-b-[26px] rounded-t-xl border-4 border-[#DCE3FF] bg-white shadow-soft">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent-yellow-dark to-accent-yellow transition-all duration-700 ease-out"
          style={{ height: `${ratio * 100}%` }}
          aria-hidden="true"
        />
        <span className="absolute inset-0 flex items-center justify-center text-3xl" aria-hidden="true">
          🌻
        </span>
      </div>
      <p className="text-sm font-bold text-text-secondary">{UI_TEXT.seeds.jarLabel}</p>
    </div>
  );
}
