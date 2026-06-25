<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref(null);
let ctx = null;
let animationId = null;
let mouseX = -100;
let mouseY = -100;
let prevMouseX = -100;
let prevMouseY = -100;
let mouseOnScreen = false;
let frameCount = 0;
let trailParticles = [];

const CONFIG = {
  maxParticles: 150,
  spawnRate: 4,
  idleSpawnInterval: 2, // 悬停时每 N 帧发射一波
  minDistance: 4,
  baseSize: 2.5,
  life: 1.0,
  decayMin: 0.015,
  decayMax: 0.035,
};

const DUST_COLORS = [
  { r: 140, g: 120, b: 255 },
  { r: 100, g: 180, b: 255 },
  { r: 255, g: 180, b: 120 },
  { r: 255, g: 140, b: 200 },
  { r: 120, g: 255, b: 200 },
  { r: 255, g: 220, b: 140 },
  { r: 180, g: 200, b: 255 },
  { r: 255, g: 160, b: 160 },
];

function randomColor() {
  return DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
}

class TrailParticle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = CONFIG.life;
    this.decay =
      CONFIG.decayMin + Math.random() * (CONFIG.decayMax - CONFIG.decayMin);
    this.size = CONFIG.baseSize * (0.5 + Math.random() * 1.0);
    this.color = randomColor();
    this.sparkle = Math.random() * Math.PI * 2;
    this.sparkleSpeed = 0.05 + Math.random() * 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.vy += 0.02;
    this.sparkle += this.sparkleSpeed;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = this.life * 0.7;
    const r = this.color.r;
    const g = this.color.g;
    const b = this.color.b;
    const s = this.size * (0.6 + this.life * 0.4);

    ctx.save();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, s * 0.35, 0, Math.PI * 2);
    ctx.fill();

    const glow = ctx.createRadialGradient(
      this.x, this.y, s * 0.15,
      this.x, this.y, s * 1.2,
    );
    glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, s * 1.2, 0, Math.PI * 2);
    ctx.fill();

    const sparkleAlpha = Math.abs(Math.sin(this.sparkle)) * alpha * 0.6;
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
    ctx.beginPath();
    ctx.arc(this.x + s * 0.2, this.y - s * 0.2, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
}

function animate() {
  if (!ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  frameCount++;

  // 悬停时持续喷发火花粒子（像飞机引擎尾焰）
  if (mouseOnScreen && mouseX > 0 && mouseY > 0) {
    if (frameCount % CONFIG.idleSpawnInterval === 0) {
      spawnIdleSparks(mouseX, mouseY);
    }
  }

  trailParticles = trailParticles.filter((p) => {
    const alive = p.update();
    if (alive) p.draw(ctx);
    return alive;
  });

  while (trailParticles.length > CONFIG.maxParticles) {
    trailParticles.shift();
  }

  animationId = requestAnimationFrame(animate);
}

// 移动时的拖尾粒子
function spawnTrailParticles(dx, dy, distance) {
  const count = Math.min(CONFIG.spawnRate, Math.floor(distance / 6));
  const angle = Math.atan2(dy, dx) + Math.PI;

  for (let i = 0; i < count; i++) {
    const spreadAngle = angle + (Math.random() - 0.5) * 1.4;
    const speed = 0.3 + Math.random() * 1.5;
    const vx = Math.cos(spreadAngle) * speed;
    const vy = Math.sin(spreadAngle) * speed * 0.7;
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    trailParticles.push(
      new TrailParticle(mouseX + offsetX, mouseY + offsetY, vx, vy),
    );
  }
}

// 悬停时向右下方喷射的火花（风吹飘散效果）
function spawnIdleSparks(cx, cy) {
  const burstCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < burstCount; i++) {
    // 方向：右下 30°~60°（以正右为 0°，顺时针）
    const baseAngle = Math.PI / 4; // 45° 右下
    const angle = baseAngle + (Math.random() - 0.5) * 0.8; // ±0.4 弧度扩散
    const speed = 0.6 + Math.random() * 1.4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const offsetX = (Math.random() - 0.5) * 8;
    const offsetY = (Math.random() - 0.5) * 6;
    trailParticles.push(
      new TrailParticle(cx + offsetX, cy + offsetY, vx, vy),
    );
  }
}

function onMouseMove(e) {
  mouseOnScreen = true;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;

  const dx = mouseX - prevMouseX;
  const dy = mouseY - prevMouseY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > CONFIG.minDistance) {
    spawnTrailParticles(dx, dy, distance);
  }
}

function onMouseEnter() {
  mouseOnScreen = true;
}

function onMouseLeave() {
  mouseOnScreen = false;
  mouseX = -100;
  mouseY = -100;
}

onMounted(() => {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseenter", onMouseEnter);
  document.addEventListener("mouseleave", onMouseLeave);
  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseenter", onMouseEnter);
  document.removeEventListener("mouseleave", onMouseLeave);
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<template>
  <canvas ref="canvasRef" class="mouse-trail-canvas" />
</template>

<style scoped>
.mouse-trail-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}
</style>
