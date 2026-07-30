import type { GlitterParticle } from "@/types/drawing";

const GLITTER_COLORS = ["#FFFFFF", "#FFF3B0", "#FFD84D", "#FFE9A8"];

/** stroke 길이에 비례해 별 개수를 제한한다. 너무 많으면 태블릿에서 끊길 수 있다. */
const MAX_PARTICLES = 40;
const POINTS_PER_PARTICLE = 10;

/**
 * 반짝이 붓으로 그은 선 주변에 뿌릴 별 파티클을 만든다.
 * stroke를 그릴 때 한 번만 호출하고 결과를 저장해서, 다시 그릴 때마다 모양이 바뀌지 않게 한다.
 */
export function generateGlitterParticles(points: number[], width: number): GlitterParticle[] {
  const particles: GlitterParticle[] = [];
  const pointCount = points.length / 2;
  const step = Math.max(1, Math.floor(pointCount / (MAX_PARTICLES / (POINTS_PER_PARTICLE / 2))));

  for (let index = 0; index < pointCount; index += step) {
    if (particles.length >= MAX_PARTICLES) break;
    const x = points[index * 2];
    const y = points[index * 2 + 1];
    if (x === undefined || y === undefined) continue;

    const spread = width * 1.4;
    particles.push({
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      size: width * 0.22 + Math.random() * width * 0.18,
      rotation: Math.random() * 360,
      color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
    });
  }

  return particles;
}
