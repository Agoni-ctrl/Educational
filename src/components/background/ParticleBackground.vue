<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref(null);
const particles = ref([]);
const animationId = ref(null);
const mouse = ref({ x: null, y: null, isMoving: false });
const mouseTrail = ref([]);
const cursorParticles = ref([]);
const mouseStopTimer = ref(null);

// 配置参数 - 真实的粉尘颗粒效果
const config = {
  particleCount: 60,
  connectionDistance: 100,
  mouseDistance: 150,
  speed: 0.3,
  // 真实的粉尘颜色 - 带有一点灰度的浅蓝
  colors: [
    { r: 220, g: 240, b: 255 }, // 很淡的灰蓝
    { r: 200, g: 230, b: 255 }, // 淡蓝
    { r: 180, g: 215, b: 250 }, // 中淡蓝
    { r: 255, g: 255, b: 255 }, // 纯白高光
  ],
};

// 创建真实的粉尘颗粒绘制函数
function drawDustParticle(ctx, x, y, size, color, brightness = 1) {
  const r = color.r * brightness;
  const g = color.g * brightness;
  const b = color.b * brightness;

  ctx.save();

  // 实体核心 - 不透明的中心
  ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // 边缘柔化 - 模拟真实粉尘的边缘扩散
  const edgeGradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size);
  edgeGradient.addColorStop(
    0,
    `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, 0.6)`,
  );
  edgeGradient.addColorStop(
    0.7,
    `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, 0.2)`,
  );
  edgeGradient.addColorStop(1, "transparent");

  ctx.fillStyle = edgeGradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // 高光点 - 模拟光线反射
  if (size > 1.5) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * brightness})`;
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// 鼠标轨迹粒子类 - 真实的粉尘
class TrailParticle {
  constructor(x, y, angle = null) {
    this.x = x;
    this.y = y;
    const spreadAngle =
      angle !== null
        ? angle + (Math.random() - 0.5) * 0.8
        : Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.8 + 0.2;
    this.vx = Math.cos(spreadAngle) * speed;
    this.vy = Math.sin(spreadAngle) * speed;
    this.life = 1;
    this.decay = 0.008 + Math.random() * 0.006;
    this.size = Math.random() * 2 + 1;
    this.color = config.colors[Math.floor(Math.random() * 3)]; // 不选纯白
    this.brightness = 0.8 + Math.random() * 0.2;
    this.gravity = 0.01; // 轻微重力
  }

  update() {
    this.x += this.vx;
    this.y += this.vy + this.gravity;
    this.life -= this.decay;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.brightness *= 0.995;
    return this.life > 0;
  }

  draw(ctx) {
    drawDustParticle(
      ctx,
      this.x,
      this.y,
      this.size * this.life,
      this.color,
      this.brightness * this.life,
    );
  }
}

// 鼠标周围的环绕粒子 - 真实的粉尘
class CursorParticle {
  constructor(mouseX, mouseY, index, total) {
    this.angle = ((Math.PI * 2) / total) * index + Math.random() * 0.5;
    this.baseRadius = 25 + Math.random() * 30;
    this.radius = this.baseRadius;
    this.speed = 0.015 + Math.random() * 0.015;
    this.size = Math.random() * 1.5 + 0.8;
    this.x = mouseX + Math.cos(this.angle) * this.radius;
    this.y = mouseY + Math.sin(this.angle) * this.radius;
    this.color = config.colors[index % 3];
    this.brightness = 0.9 + Math.random() * 0.1;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.02;
  }

  update(mouseX, mouseY) {
    this.angle += this.speed;
    this.wobble += this.wobbleSpeed;

    // 半径轻微波动
    this.radius = this.baseRadius + Math.sin(this.wobble) * 3;

    // 更新位置
    this.x = mouseX + Math.cos(this.angle) * this.radius;
    this.y = mouseY + Math.sin(this.angle) * this.radius;
  }

  draw(ctx) {
    drawDustParticle(
      ctx,
      this.x,
      this.y,
      this.size,
      this.color,
      this.brightness,
    );
  }
}

// 背景粒子 - 真实的漂浮粉尘
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * config.speed;
    this.vy = (Math.random() - 0.5) * config.speed * 0.5 - 0.1; // 轻微上浮
    this.size = Math.random() * 1.5 + 0.5;
    this.color =
      config.colors[Math.floor(Math.random() * config.colors.length)];
    this.brightness = 0.7 + Math.random() * 0.3;
    this.opacity = 0.4 + Math.random() * 0.4;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.01 + Math.random() * 0.02;
  }

  update() {
    // 自然漂浮运动
    this.wobble += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.wobble) * 0.1;
    this.y += this.vy + Math.cos(this.wobble * 0.7) * 0.05;

    // 鼠标交互 - 轻微扰动
    if (mouse.value.x !== null && mouse.value.y !== null) {
      const dx = mouse.value.x - this.x;
      const dy = mouse.value.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.mouseDistance) {
        const force =
          ((config.mouseDistance - distance) / config.mouseDistance) * 0.005;
        this.vx -= (dx / distance) * force;
        this.vy -= (dy / distance) * force;
      }
    }

    // 边界处理 - 循环
    if (this.x < -10) this.x = this.canvas.width + 10;
    if (this.x > this.canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = this.canvas.height + 10;
    if (this.y > this.canvas.height + 10) this.y = -10;

    // 速度衰减
    this.vx *= 0.999;
    this.vy *= 0.999;
  }

  draw(ctx) {
    drawDustParticle(
      ctx,
      this.x,
      this.y,
      this.size,
      this.color,
      this.brightness * this.opacity,
    );
  }
}

function initParticles() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  particles.value = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.value.push(new Particle(canvas));
  }
}

function initCursorParticles() {
  if (!mouse.value.x || !mouse.value.y) return;

  cursorParticles.value = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    cursorParticles.value.push(
      new CursorParticle(mouse.value.x, mouse.value.y, i, count),
    );
  }
}

function drawConnections(ctx) {
  // 极淡的连线，几乎看不见
  for (let i = 0; i < particles.value.length; i++) {
    for (let j = i + 1; j < particles.value.length; j++) {
      const dx = particles.value[i].x - particles.value[j].x;
      const dy = particles.value[i].y - particles.value[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.connectionDistance) {
        const opacity = (1 - distance / config.connectionDistance) * 0.08;
        ctx.beginPath();
        ctx.moveTo(particles.value[i].x, particles.value[i].y);
        ctx.lineTo(particles.value[j].x, particles.value[j].y);
        ctx.strokeStyle = `rgba(200, 230, 255, ${opacity})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景粒子连线
  drawConnections(ctx);

  // 更新和绘制背景粒子
  particles.value.forEach((particle) => {
    particle.update();
    particle.draw(ctx);
  });

  // 更新和绘制鼠标轨迹
  mouseTrail.value = mouseTrail.value.filter((particle) => {
    const alive = particle.update();
    if (alive) particle.draw(ctx);
    return alive;
  });

  // 更新和绘制鼠标周围的环绕粒子
  if (mouse.value.x !== null && mouse.value.y !== null) {
    if (cursorParticles.value.length === 0) {
      initCursorParticles();
    }

    cursorParticles.value.forEach((particle) => {
      particle.update(mouse.value.x, mouse.value.y);
      particle.draw(ctx);
    });
  } else {
    cursorParticles.value = [];
  }

  animationId.value = requestAnimationFrame(animate);
}

function handleResize() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

let lastTrailTime = 0;
let lastMouseX = 0;
let lastMouseY = 0;

function handleMouseMove(e) {
  const now = Date.now();

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  mouse.value.x = e.clientX;
  mouse.value.y = e.clientY;
  mouse.value.isMoving = distance > 2;

  if (mouseStopTimer.value) {
    clearTimeout(mouseStopTimer.value);
  }

  mouseStopTimer.value = setTimeout(() => {
    mouse.value.isMoving = false;
  }, 100);

  // 添加轨迹粒子
  if (distance > 3 && now - lastTrailTime > 25) {
    const angle = Math.atan2(dy, dx);
    const count = Math.min(2, Math.floor(distance / 15));
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      mouseTrail.value.push(
        new TrailParticle(
          e.clientX + offsetX,
          e.clientY + offsetY,
          angle + Math.PI,
        ),
      );
    }
    lastTrailTime = now;
  }

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function handleMouseLeave() {
  mouse.value.x = null;
  mouse.value.y = null;
  mouse.value.isMoving = false;
  cursorParticles.value = [];
  if (mouseStopTimer.value) {
    clearTimeout(mouseStopTimer.value);
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseleave", handleMouseLeave);
  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseleave", handleMouseLeave);
  if (mouseStopTimer.value) {
    clearTimeout(mouseStopTimer.value);
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>

<template>
  <canvas ref="canvasRef" class="particle-background" />
</template>

<style scoped>
.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
