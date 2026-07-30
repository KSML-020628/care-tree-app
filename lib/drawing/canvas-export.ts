import { FULL_IMAGE_SIZE, QUADRANT_RECTS } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";

export interface ExportableStage {
  toDataURL: (config?: { mimeType?: string; pixelRatio?: number }) => string;
}

/**
 * Konva Stage(또는 Layer) 참조를 투명 배경 PNG data URL로 바꾼다.
 * pixelRatio를 주면, 화면 크기와 상관없이 항상 같은 해상도로 내보낼 수 있다.
 */
export function exportStageToDataUrl(stage: ExportableStage, pixelRatio = 1): string {
  return stage.toDataURL({ mimeType: "image/png", pixelRatio });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했어요: ${src}`));
    image.src = src;
  });
}

/**
 * 4개 사분면 그림을 원래 좌표에 맞춰 하나로 합친다.
 * 마지막에 투명 배경 선화(createTransparentLineArt로 만든 것)를 한 번 더 그 위에 덮어서,
 * 조각 사이 경계선이 자연스럽게 이어지도록 한다.
 */
export async function compositeFinalArtwork(
  quadrantImages: Partial<Record<Quadrant, string>>,
  transparentLineArtPath: string,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = FULL_IMAGE_SIZE;
  canvas.height = FULL_IMAGE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 만들지 못했어요.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, FULL_IMAGE_SIZE, FULL_IMAGE_SIZE);

  const quadrantEntries = Object.entries(quadrantImages) as [Quadrant, string][];
  const loadedQuadrants = await Promise.all(
    quadrantEntries.map(async ([quadrant, src]) => ({ quadrant, image: await loadImage(src) })),
  );

  for (const { quadrant, image } of loadedQuadrants) {
    const rect = QUADRANT_RECTS[quadrant];
    context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  }

  const lineArt = await loadImage(transparentLineArtPath);
  context.drawImage(lineArt, 0, 0, FULL_IMAGE_SIZE, FULL_IMAGE_SIZE);

  return canvas.toDataURL("image/png");
}
