<template>
  <canvas ref="canvasEl" class="bg-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  theme: { type: String, default: 'light' }
});

// The canvas is heavily blurred, so a fraction of the viewport resolution is enough.
const SCALE = 0.32;

/**
 * home/drift are viewport ratios, speed is rad/s, parallax is px per viewport half.
 * Blobs sit near the edges to keep the centre text column calm.
 */
const BLOBS = [
  { home: [0.14, 0.18], drift: [0.1, 0.08], speed: [0.055, 0.041], radius: 0.62, alpha: 0.55, parallax: 26 },
  { home: [0.86, 0.12], drift: [0.09, 0.1], speed: [-0.043, 0.058], radius: 0.55, alpha: 0.5, parallax: 40 },
  { home: [0.92, 0.72], drift: [0.11, 0.09], speed: [0.049, -0.037], radius: 0.6, alpha: 0.45, parallax: 18 },
  { home: [0.1, 0.84], drift: [0.1, 0.07], speed: [-0.036, -0.052], radius: 0.58, alpha: 0.5, parallax: 32 },
  { home: [0.5, 0.5], drift: [0.16, 0.12], speed: [0.031, 0.027], radius: 0.5, alpha: 0.28, parallax: 12 }
];

const PALETTES = {
  light: [
    '154, 216, 247',
    '191, 233, 253',
    '124, 196, 242',
    '201, 220, 251',
    '255, 255, 255'
  ],
  dark: [
    '32, 96, 143',
    '18, 73, 111',
    '43, 127, 174',
    '13, 61, 94',
    '74, 163, 214'
  ]
};

const canvasEl = ref(null);

let ctx = null;
let width = 0;
let height = 0;
let raf = 0;
let reduced = false;
const pointer = { x: 0, y: 0 };
const eased = { x: 0, y: 0 };

function resize() {
  const canvas = canvasEl.value;
  if (!canvas) return;

  width = Math.max(1, Math.round(window.innerWidth * SCALE));
  height = Math.max(1, Math.round(window.innerHeight * SCALE));
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext('2d');

  pointer.x = eased.x = width / 2;
  pointer.y = eased.y = height / 2;

  if (reduced) draw(0);
}

function draw(time) {
  if (!ctx) return;

  const colors = PALETTES[props.theme === 'dark' ? 'dark' : 'light'];
  const span = Math.min(width, height);
  const shiftX = (eased.x - width / 2) / (width / 2);
  const shiftY = (eased.y - height / 2) / (height / 2);

  ctx.clearRect(0, 0, width, height);

  BLOBS.forEach((blob, index) => {
    const nudge = blob.parallax * SCALE;
    const x = (blob.home[0] + Math.sin(time * blob.speed[0]) * blob.drift[0]) * width + shiftX * nudge;
    const y = (blob.home[1] + Math.cos(time * blob.speed[1]) * blob.drift[1]) * height + shiftY * nudge;
    const radius = blob.radius * span;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${colors[index]}, ${blob.alpha})`);
    gradient.addColorStop(0.55, `rgba(${colors[index]}, ${blob.alpha * 0.42})`);
    gradient.addColorStop(1, `rgba(${colors[index]}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  });

  const glowRadius = span * 0.46;
  const glow = ctx.createRadialGradient(eased.x, eased.y, 0, eased.x, eased.y, glowRadius);
  glow.addColorStop(0, `rgba(${colors[2]}, 0.3)`);
  glow.addColorStop(1, `rgba(${colors[2]}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(eased.x - glowRadius, eased.y - glowRadius, glowRadius * 2, glowRadius * 2);
}

function frame(now) {
  eased.x += (pointer.x - eased.x) * 0.03;
  eased.y += (pointer.y - eased.y) * 0.03;

  draw(now / 1000);
  raf = window.requestAnimationFrame(frame);
}

function onPointerMove(event) {
  pointer.x = event.clientX * SCALE;
  pointer.y = event.clientY * SCALE;
}

function onVisibility() {
  window.cancelAnimationFrame(raf);
  if (!document.hidden) raf = window.requestAnimationFrame(frame);
}

watch(
  () => props.theme,
  () => {
    if (reduced) draw(0);
  }
);

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resize();

  window.addEventListener('resize', resize);
  if (reduced) return;

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  raf = window.requestAnimationFrame(frame);
});

onUnmounted(() => {
  window.cancelAnimationFrame(raf);
  window.removeEventListener('resize', resize);
  window.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>

<style scoped>
.bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Scaling up hides the blur fade at the viewport edges. */
  transform: scale(1.18);
  filter: blur(42px);
  opacity: 0.78;
}

[data-theme='dark'] .bg-canvas {
  opacity: 0.55;
}
</style>
