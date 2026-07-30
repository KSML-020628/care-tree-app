import { QUADRANT_SIZE } from "@/lib/config/quadrants";

interface ExportAnalysisImageInput {
  /** 아이가 그은 색칠 레이어(투명 배경). exportDrawingLayer()의 결과를 그대로 넣는다. */
  drawingLayerDataUrl: string;
  /** 같은 사분면의 선화(투명 배경). cropQuadrantLineArt()의 결과를 그대로 넣는다. */
  lineArtDataUrl: string;
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
 * AI 작품 분석에 보낼 이미지를 만든다.
 * 색칠 레이어만 보내면 원래 사물의 윤곽(선화)이 없어 AI가 무엇을 그렸는지 알아보기 어렵다.
 * 그래서 흰 배경 위에 색칠 레이어 + 원래 선화를 겹쳐, 사람이 보는 것과 같은 완성된 그림으로 합성한다.
 * (공동 작품 합성용 compositeFinalArtwork와 달리, 이 함수는 AI에게 보낼 조각 한 장만 만든다.)
 */
export async function exportAnalysisImage({
  drawingLayerDataUrl,
  lineArtDataUrl,
}: ExportAnalysisImageInput): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = QUADRANT_SIZE;
  canvas.height = QUADRANT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 만들지 못했어요.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, QUADRANT_SIZE, QUADRANT_SIZE);

  const [drawingLayer, lineArt] = await Promise.all([loadImage(drawingLayerDataUrl), loadImage(lineArtDataUrl)]);

  context.drawImage(drawingLayer, 0, 0, QUADRANT_SIZE, QUADRANT_SIZE);
  context.drawImage(lineArt, 0, 0, QUADRANT_SIZE, QUADRANT_SIZE);

  return canvas.toDataURL("image/png");
}
