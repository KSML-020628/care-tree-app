"use client";

import type Konva from "konva";
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Image as KonvaImage, Layer, Line, Rect, Stage } from "react-konva";
import { QUADRANT_SIZE } from "@/lib/config/quadrants";
import { exportStageToDataUrl } from "@/lib/drawing/canvas-export";
import { buildStrokeBase, getStrokeShapeProps } from "@/lib/drawing/stroke-renderer";
import { useDrawingStore } from "@/lib/store/drawing-store";
import GlitterLayer from "./GlitterLayer";

export interface DrawingCanvasHandle {
  exportDrawingLayer: () => string;
}

interface DrawingCanvasProps {
  /** 없으면(프로필 그림판처럼 원본 도안이 없는 화면) 선화 레이어를 아예 그리지 않는다. */
  lineArtSrc?: string | null;
  /** true면 손으로 그릴 수 없고 지금까지 그린 그림만 보여준다(미리보기 화면 등에서 사용). */
  readOnly?: boolean;
}

function useHtmlImage(src: string | null | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      // src가 도중에 사라지면(값 있음 -> 없음) 이전 이미지가 남아있지 않도록 지운다.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
      setImage(null);
      return;
    }
    let cancelled = false;
    const element = new window.Image();
    element.onload = () => {
      if (!cancelled) setImage(element);
    };
    element.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return image;
}

function useContainerSize(): [RefObject<HTMLDivElement | null>, number] {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize(Math.min(entry.contentRect.width, entry.contentRect.height));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [containerRef, size];
}

/**
 * 아이에게 배정된 사분면 한 조각만 보여주는 실제 그림판.
 * 내부 좌표는 항상 QUADRANT_SIZE 기준으로 두고, 화면 크기에 맞춰 Stage 자체를 확대·축소한다.
 */
const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas(
  { lineArtSrc, readOnly = false },
  ref,
) {
  const [containerRef, displaySize] = useContainerSize();
  const lineArtImage = useHtmlImage(lineArtSrc);

  const layerRef = useRef<Konva.Layer | null>(null);
  const activeLineRef = useRef<Konva.Line | null>(null);
  const pointsRef = useRef<number[]>([]);

  const strokes = useDrawingStore((state) => state.strokes);
  const tool = useDrawingStore((state) => state.tool);
  const colorId = useDrawingStore((state) => state.colorId);
  const brushSize = useDrawingStore((state) => state.brushSize);
  const addStroke = useDrawingStore((state) => state.addStroke);

  useImperativeHandle(ref, () => ({
    exportDrawingLayer: () => {
      if (!layerRef.current) return "";
      // 화면 크기와 상관없이 항상 QUADRANT_SIZE 해상도로 내보내서, 다른 아이 그림과 합칠 때 크기가 어긋나지 않게 한다.
      const pixelRatio = displaySize > 0 ? QUADRANT_SIZE / displaySize : 1;
      return exportStageToDataUrl(layerRef.current, pixelRatio);
    },
  }));

  function getPointerPoint(evt: Konva.KonvaEventObject<PointerEvent>): { x: number; y: number } | null {
    const stage = evt.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return null;
    return pos;
  }

  function applyLivePreview() {
    if (!activeLineRef.current) return;
    const base = buildStrokeBase(pointsRef.current, tool, colorId, brushSize);
    const shapeProps = getStrokeShapeProps({ id: "temp", ...base });
    activeLineRef.current.setAttrs({ points: pointsRef.current, ...shapeProps });
    layerRef.current?.batchDraw();
  }

  function handlePointerDown(evt: Konva.KonvaEventObject<PointerEvent>) {
    evt.evt.preventDefault();
    const point = getPointerPoint(evt);
    if (!point) return;
    pointsRef.current = [point.x, point.y];
    applyLivePreview();
  }

  function handlePointerMove(evt: Konva.KonvaEventObject<PointerEvent>) {
    if (pointsRef.current.length === 0) return;
    evt.evt.preventDefault();
    const point = getPointerPoint(evt);
    if (!point) return;
    pointsRef.current = [...pointsRef.current, point.x, point.y];
    applyLivePreview();
  }

  function handlePointerUp() {
    if (pointsRef.current.length < 4) {
      // 톡 눌렀다 뗀 경우(점 하나)에도 작은 점이 남도록 점을 살짝 늘린다.
      if (pointsRef.current.length === 2) {
        pointsRef.current = [...pointsRef.current, pointsRef.current[0] + 0.1, pointsRef.current[1] + 0.1];
      } else {
        pointsRef.current = [];
        return;
      }
    }
    addStroke(pointsRef.current);
    pointsRef.current = [];
    activeLineRef.current?.setAttrs({ points: [] });
    layerRef.current?.batchDraw();
  }

  const scale = displaySize > 0 ? displaySize / QUADRANT_SIZE : 1;

  return (
    <div
      ref={containerRef}
      className={`flex aspect-square w-full max-w-[640px] items-center justify-center overflow-hidden rounded-[28px] border-4 border-[#DCE8FF] bg-white shadow-soft ${
        readOnly ? "" : "no-touch-scroll"
      }`}
    >
      {displaySize > 0 && (
        <Stage
          width={displaySize}
          height={displaySize}
          scaleX={scale}
          scaleY={scale}
          listening={!readOnly}
          onPointerDown={readOnly ? undefined : handlePointerDown}
          onPointerMove={readOnly ? undefined : handlePointerMove}
          onPointerUp={readOnly ? undefined : handlePointerUp}
          onPointerLeave={readOnly ? undefined : handlePointerUp}
        >
          <Layer listening={false}>
            <Rect x={0} y={0} width={QUADRANT_SIZE} height={QUADRANT_SIZE} fill="#ffffff" />
          </Layer>

          <Layer ref={layerRef}>
            {strokes.map((stroke) => (
              <Fragment key={stroke.id}>
                <Line points={stroke.points} {...getStrokeShapeProps(stroke)} />
                {stroke.tool === "GLITTER" && <GlitterLayer particles={stroke.glitterParticles} />}
              </Fragment>
            ))}
            <Line ref={activeLineRef} points={[]} />
          </Layer>

          <Layer listening={false}>
            {lineArtImage && (
              <KonvaImage image={lineArtImage} x={0} y={0} width={QUADRANT_SIZE} height={QUADRANT_SIZE} />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
});

export default DrawingCanvas;
