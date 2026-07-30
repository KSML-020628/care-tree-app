"use client";

import { Group, Star } from "react-konva";
import type { GlitterParticle } from "@/types/drawing";

interface GlitterLayerProps {
  particles?: GlitterParticle[];
}

/**
 * 반짝이 붓으로 그린 자리에 별 파티클을 그린다.
 * stroke를 그릴 때 한 번만 만든 고정 데이터를 그대로 그리기만 하므로, 다시 렌더링돼도 모양이 바뀌지 않는다.
 */
export default function GlitterLayer({ particles }: GlitterLayerProps) {
  if (!particles || particles.length === 0) return null;

  return (
    <Group listening={false}>
      {particles.map((particle, index) => (
        <Star
          key={index}
          x={particle.x}
          y={particle.y}
          numPoints={4}
          innerRadius={particle.size * 0.35}
          outerRadius={particle.size}
          rotation={particle.rotation}
          fill={particle.color}
          opacity={0.9}
          shadowColor={particle.color}
          shadowBlur={particle.size}
          shadowOpacity={0.6}
        />
      ))}
    </Group>
  );
}
