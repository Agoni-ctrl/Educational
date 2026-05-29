<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const animationId = ref(null)
const time = ref(0)

// 配置参数 - 更简洁的网格
const config = {
  gridSize: 100, // 更大的间距，更少的线条
  dotColor: 'rgba(0, 144, 255, 0.25)',
  waveSpeed: 0.02,
  waveAmplitude: 3
}

function drawGrid(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
  
  const cols = Math.ceil(width / config.gridSize) + 1
  const rows = Math.ceil(height / config.gridSize) + 1
  
  // 只绘制交点，不绘制线条，更简洁
  ctx.fillStyle = config.dotColor
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const baseX = i * config.gridSize
      const baseY = j * config.gridSize
      
      // 计算波动偏移
      const waveX = Math.sin(time.value + i * 0.3 + j * 0.2) * config.waveAmplitude
      const waveY = Math.cos(time.value + i * 0.2 + j * 0.3) * config.waveAmplitude
      
      const x = baseX + waveX
      const y = baseY + waveY
      
      // 点的大小也随时间变化
      const size = 2 + Math.sin(time.value * 2 + i + j) * 0.8
      
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  
  drawGrid(ctx, canvas.width, canvas.height)
  
  time.value += config.waveSpeed
  animationId.value = requestAnimationFrame(animate)
}

function handleResize() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="grid-background"
  />
</template>

<style scoped>
.grid-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;
}
</style>
