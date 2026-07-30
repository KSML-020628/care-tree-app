import { QUADRANT_RECTS, QUADRANT_SIZE } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했어요: ${src}`));
    image.src = src;
  });
}

/**
 * 전체 도안 한 장에서 사분면 하나만 정확한 좌표로 잘라 PNG data URL로 돌려준다.
 * 4조각이 항상 같은 원본 좌표계를 기준으로 잘리므로, 나중에 다시 합쳐도 이가 어긋나지 않는다.
 */
export async function cropQuadrantFromFullImage(
  fullImagePath: string,
  quadrant: Quadrant,
): Promise<string> {
  const image = await loadImage(fullImagePath);
  const rect = QUADRANT_RECTS[quadrant];

  const canvas = document.createElement("canvas");
  canvas.width = QUADRANT_SIZE;
  canvas.height = QUADRANT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 만들지 못했어요.");

  // 원본 이미지 실제 크기가 기준 해상도와 달라도 항상 같은 비율로 잘리도록 스케일을 맞춘다.
  const scaleX = image.naturalWidth / (rect.width * 2);
  const scaleY = image.naturalHeight / (rect.height * 2);

  context.drawImage(
    image,
    rect.x * scaleX,
    rect.y * scaleY,
    rect.width * scaleX,
    rect.height * scaleY,
    0,
    0,
    QUADRANT_SIZE,
    QUADRANT_SIZE,
  );

  return canvas.toDataURL("image/png");
}

/**
 * 흰 배경 + 검은 선 이미지를, 흰 부분은 투명하고 선만 남는 이미지로 바꾼다.
 * 이렇게 만든 이미지를 색칠 레이어 위에 겹치면, 아이가 어떤 색을 칠해도 검은 선만은 항상 보인다.
 */
function makeWhiteTransparent(image: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 만들지 못했어요.");

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
    // 밝을수록 투명하게: 흰 배경은 완전히 투명, 검은 선은 그대로 불투명하게 남는다.
    const alpha = 255 - luminance;
    data[index + 3] = Math.min(data[index + 3], alpha);
  }
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

/** 사분면 하나의 선화만(투명 배경) 잘라낸다. 색칠 레이어 맨 위에 올려 두는 고정 레이어로 쓴다. */
export async function cropQuadrantLineArt(fullImagePath: string, quadrant: Quadrant): Promise<string> {
  const croppedDataUrl = await cropQuadrantFromFullImage(fullImagePath, quadrant);
  const croppedImage = await loadImage(croppedDataUrl);
  return makeWhiteTransparent(croppedImage);
}

/** 전체 도안의 선화만(투명 배경) 만든다. 최종 합성 화면에서 이음새를 자연스럽게 덮는 데 쓴다. */
export async function createTransparentLineArt(fullImagePath: string): Promise<string> {
  const image = await loadImage(fullImagePath);
  return makeWhiteTransparent(image);
}

/** mock 친구의 색칠을 흉내 낸, 옅은 색이 깔린 사각형을 만든다(실제 그림 대신 쓰는 자리표시자). */
export function createFlatTintDataUrl(color: string, opacity = 0.35): string {
  const canvas = document.createElement("canvas");
  canvas.width = QUADRANT_SIZE;
  canvas.height = QUADRANT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.fillRect(0, 0, QUADRANT_SIZE, QUADRANT_SIZE);
  return canvas.toDataURL("image/png");
}
