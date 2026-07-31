export interface ColorOption {
  id: string;
  label: string;
  /** 색상 버튼 배경(CSS). 무지개처럼 그라데이션일 수 있다. */
  swatch: string;
  /** 실제 캔버스 선에 쓰는 단색 값. */
  strokeColor: string;
  isRainbow?: boolean;
  isGlitterMetal?: boolean;
}

export const COLOR_PALETTE: readonly ColorOption[] = [
  { id: "red", label: "빨강", swatch: "#F5473C", strokeColor: "#F5473C" },
  { id: "orange", label: "주황", swatch: "#FF9A3D", strokeColor: "#FF9A3D" },
  { id: "yellow", label: "노랑", swatch: "#FFD84D", strokeColor: "#FFD84D" },
  { id: "lightgreen", label: "연두", swatch: "#B4E26A", strokeColor: "#B4E26A" },
  { id: "green", label: "초록", swatch: "#4CAF7D", strokeColor: "#4CAF7D" },
  { id: "sky", label: "하늘", swatch: "#5FC9F0", strokeColor: "#5FC9F0" },
  { id: "blue", label: "파랑", swatch: "#536DFE", strokeColor: "#536DFE" },
  { id: "purple", label: "보라", swatch: "#9C6ADE", strokeColor: "#9C6ADE" },
  { id: "pink", label: "분홍", swatch: "#FF8FB1", strokeColor: "#FF8FB1" },
  { id: "brown", label: "갈색", swatch: "#A9673F", strokeColor: "#A9673F" },
  { id: "black", label: "검정", swatch: "#2B2B2B", strokeColor: "#2B2B2B" },
  { id: "white", label: "흰색", swatch: "#FFFFFF", strokeColor: "#FFFFFF" },
  {
    id: "rainbow",
    label: "무지개",
    swatch:
      "linear-gradient(135deg, #F5473C, #FF9A3D, #FFD84D, #4CAF7D, #5FC9F0, #9C6ADE)",
    strokeColor: "#FF9A3D",
    isRainbow: true,
  },
  { id: "gold", label: "반짝이 금색", swatch: "#F3C94A", strokeColor: "#E6B93A", isGlitterMetal: true },
  { id: "silver", label: "반짝이 은색", swatch: "#D3D9E3", strokeColor: "#B9C2D0", isGlitterMetal: true },
] as const;

/** 무지개 선을 그릴 때 실제로 순환시킬 색 목록. */
export const RAINBOW_STOP_COLORS: readonly string[] = [
  "#F5473C",
  "#FF9A3D",
  "#FFD84D",
  "#4CAF7D",
  "#5FC9F0",
  "#9C6ADE",
];

export function getColorOption(id: string): ColorOption {
  const found = COLOR_PALETTE.find((color) => color.id === id);
  return found ?? COLOR_PALETTE[0];
}

/** 프로필 그림판에서 쓰는 8색. 전체 팔레트보다 단순하게 유지한다. */
const PROFILE_COLOR_IDS = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown"];
export const PROFILE_COLOR_PALETTE: readonly ColorOption[] = COLOR_PALETTE.filter((color) =>
  PROFILE_COLOR_IDS.includes(color.id),
);
