/**
 * 케어햄 10종 정의. 삼성서울병원 케어햄 캐릭터 시트(디자인 참고용, 앱에는 노출하지 않음)의
 * 순서를 그대로 따른다: 안내·의사·간호사·채혈·검사·밴드·용기·웃음·약국·함께.
 *
 * 개별 이미지 파일이 아직 없어도 앱이 깨지지 않도록, 이미지 경로는 항상 이 설정에서만
 * 참조하고 실제 렌더링은 components/mascot/CareHam.tsx의 fallback 체인이 담당한다.
 */
export type CareHamType =
  | "GUIDE"
  | "DOCTOR"
  | "NURSE"
  | "BLOOD_TEST"
  | "EXAM"
  | "BANDAGE"
  | "COURAGE"
  | "SMILE"
  | "PHARMACY"
  | "TOGETHER";

/** 지금 화면(로그인·그림판·제출·주간 공개)에서 실제로 쓰는 4종. 나머지는 이후 확장을 위해 정의만 해 둔다. */
export type ActiveCareHamType = "GUIDE" | "COURAGE" | "SMILE" | "TOGETHER";

export const MVP_ACTIVE_CARE_HAMS: readonly ActiveCareHamType[] = ["GUIDE", "COURAGE", "SMILE", "TOGETHER"];

interface CareHamConfig {
  type: CareHamType;
  label: string;
  imagePath: string;
  /** 이미지가 전혀 없을 때 보여줄 귀여운 이모지 placeholder. */
  emojiFallback: string;
}

const MASCOT_IMAGE_BASE = "/images/mascots";

export const DEFAULT_MASCOT_IMAGE = `${MASCOT_IMAGE_BASE}/default-ham.webp`;

export const CARE_HAM_CONFIG: Record<CareHamType, CareHamConfig> = {
  GUIDE: { type: "GUIDE", label: "안내 햄", imagePath: `${MASCOT_IMAGE_BASE}/guide-ham.webp`, emojiFallback: "🐹" },
  DOCTOR: { type: "DOCTOR", label: "의사 햄", imagePath: `${MASCOT_IMAGE_BASE}/doctor-ham.webp`, emojiFallback: "🩺" },
  NURSE: { type: "NURSE", label: "간호사 햄", imagePath: `${MASCOT_IMAGE_BASE}/nurse-ham.webp`, emojiFallback: "💙" },
  BLOOD_TEST: {
    type: "BLOOD_TEST",
    label: "채혈 햄",
    imagePath: `${MASCOT_IMAGE_BASE}/blood-test-ham.webp`,
    emojiFallback: "🧪",
  },
  EXAM: { type: "EXAM", label: "검사 햄", imagePath: `${MASCOT_IMAGE_BASE}/exam-ham.webp`, emojiFallback: "🔬" },
  BANDAGE: {
    type: "BANDAGE",
    label: "밴드 햄",
    imagePath: `${MASCOT_IMAGE_BASE}/bandage-ham.webp`,
    emojiFallback: "🩹",
  },
  COURAGE: {
    type: "COURAGE",
    label: "용기 햄",
    imagePath: `${MASCOT_IMAGE_BASE}/courage-ham.webp`,
    emojiFallback: "⭐",
  },
  SMILE: { type: "SMILE", label: "웃음 햄", imagePath: `${MASCOT_IMAGE_BASE}/smile-ham.webp`, emojiFallback: "😊" },
  PHARMACY: {
    type: "PHARMACY",
    label: "약국 햄",
    imagePath: `${MASCOT_IMAGE_BASE}/pharmacy-ham.webp`,
    emojiFallback: "💊",
  },
  TOGETHER: {
    type: "TOGETHER",
    label: "함께 햄",
    imagePath: `${MASCOT_IMAGE_BASE}/together-ham.webp`,
    emojiFallback: "🐻",
  },
};

export function getCareHamConfig(type: CareHamType): CareHamConfig {
  return CARE_HAM_CONFIG[type];
}
