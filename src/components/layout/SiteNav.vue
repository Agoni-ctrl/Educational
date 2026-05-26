<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { navItems } from '../../config/nav.js'

const route = useRoute()
const menuOpen = ref(false)
const navSolid = ref(false)

function onScroll() {
  navSolid.value = window.scrollY > 32
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="nav" :class="{ 'nav--solid': navSolid }">
    <div class="nav__inner">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <span class="brand__mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#navBrandGrad)" />
            <path d="M7 18L11 10H13L17 18H15L14.2 16.2H9.8L9 18H7ZM10.4 14.6H13.6L12 10.8L10.4 14.6Z" fill="white" />
            <path d="M19 10H21V18H19V10Z" fill="white" opacity="0.7" />
            <defs>
              <linearGradient id="navBrandGrad" x1="0" y1="0" x2="28" y2="28">
                <stop stop-color="#0090ff" />
                <stop offset="1" stop-color="#0057d9" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span class="brand__name">知启灵枢</span>
      </RouterLink>

      <nav class="nav__links" :class="{ 'nav__links--open': menuOpen }">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav__link"
          :class="{ 'nav__link--active': isActive(item.to) }"
          @click="closeMenu"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="nav__actions">
        <RouterLink to="/assistant" class="btn btn--dark" @click="closeMenu">开始共创</RouterLink>
        <button
          class="nav__toggle"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="toggleMenu"
        >
          <span :class="{ open: menuOpen }" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  transition: background 0.35s var(--ease-out), box-shadow 0.35s, padding 0.35s;
}

.nav--solid {
  padding: 14px 0;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: 0 1px 0 var(--border);
}

.nav__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  text-decoration: none;
}

.brand__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.0625rem;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto;
}

.nav__link {
  padding: 8px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
  border-radius: 8px;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.nav__link:hover {
  color: var(--ink);
  background: rgba(10, 15, 26, 0.04);
}

.nav__link--active {
  color: var(--accent-deep);
  background: rgba(0, 119, 230, 0.08);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s;
  white-space: nowrap;
}

.btn--dark {
  background: var(--ink);
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 15, 26, 0.12);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(10, 15, 26, 0.16);
}

.nav__toggle {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}

.nav__toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--ink);
  position: relative;
  transition: background 0.2s;
}

.nav__toggle span::before,
.nav__toggle span::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--ink);
  transition: transform 0.25s var(--ease-out);
}

.nav__toggle span::before { top: -6px; }
.nav__toggle span::after { top: 6px; }
.nav__toggle span.open { background: transparent; }
.nav__toggle span.open::before { transform: translateY(6px) rotate(45deg); }
.nav__toggle span.open::after { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 900px) {
  .nav__links {
    position: fixed;
    top: 72px;
    left: 16px;
    right: 16px;
    flex-direction: column;
    padding: 12px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 48px rgba(10, 15, 26, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
  }

  .nav__links--open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav__link { width: 100%; text-align: center; padding: 12px; }
  .nav__toggle { display: flex; }
  .nav__actions .btn { display: none; }
}
</style>
