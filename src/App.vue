<script setup>
import { RouterView } from "vue-router";
import DynamicBackground from "./components/background/DynamicBackground.vue";
import MouseTrail from "./components/background/MouseTrail.vue";
</script>

<template>
  <DynamicBackground type="both" />
  <MouseTrail />
  <div class="app-content">
    <RouterView />
  </div>
</template>

<style>
.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* 确保背景不影响内容交互 */
.app-content > * {
  position: relative;
}
</style>
