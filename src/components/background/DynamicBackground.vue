<script setup>
import { ref, computed } from 'vue'
import ParticleBackground from './ParticleBackground.vue'
import GridBackground from './GridBackground.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'particle', // 'particle', 'grid', 'both'
    validator: (value) => ['particle', 'grid', 'both'].includes(value)
  }
})

const showParticle = computed(() => props.type === 'particle' || props.type === 'both')
const showGrid = computed(() => props.type === 'grid' || props.type === 'both')
</script>

<template>
  <div class="dynamic-background">
    <GridBackground v-if="showGrid" />
    <ParticleBackground v-if="showParticle" />
  </div>
</template>

<style scoped>
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
