<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { navItems } from "../../config/nav.js";

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const navSolid = ref(false);
const userMenuOpen = ref(false);

// 模拟用户登录状态
const isLoggedIn = ref(false);
const userInfo = ref({
  name: "用户",
  avatar: null,
});

function onScroll() {
  navSolid.value = window.scrollY > 32;
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

function closeUserMenu() {
  userMenuOpen.value = false;
}

function isActive(to) {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
}

// 处理菜单点击
function handleMenuClick(action) {
  closeUserMenu();
  switch (action) {
    case "profile":
      router.push("/profile");
      break;
    case "register":
      alert("注册功能开发中...");
      break;
    case "login":
      isLoggedIn.value = true;
      userInfo.value.name = "测试用户";
      alert("登录成功！");
      break;
    case "logout":
      isLoggedIn.value = false;
      userInfo.value.name = "用户";
      alert("已退出登录");
      break;
  }
}

// 点击外部关闭菜单
function onClickOutside(e) {
  const userMenu = document.querySelector(".user-menu");
  const userAvatar = document.querySelector(".user-avatar");
  if (
    userMenu &&
    !userMenu.contains(e.target) &&
    !userAvatar.contains(e.target)
  ) {
    closeUserMenu();
  }
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("click", onClickOutside);
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <header class="nav" :class="{ 'nav--solid': navSolid }">
    <div class="nav__inner">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <span class="brand__mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#navBrandGrad)" />
            <path
              d="M7 18L11 10H13L17 18H15L14.2 16.2H9.8L9 18H7ZM10.4 14.6H13.6L12 10.8L10.4 14.6Z"
              fill="white"
            />
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
        <RouterLink to="/assistant" class="btn btn--dark" @click="closeMenu"
          >开始共创</RouterLink
        >

        <!-- 用户头像和下拉菜单 -->
        <div class="user-menu-wrapper">
          <button
            class="user-avatar"
            :class="{ 'user-avatar--open': userMenuOpen }"
            @click.stop="toggleUserMenu"
            aria-label="用户菜单"
          >
            <svg v-if="!isLoggedIn" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span v-else class="user-avatar__text">{{
              userInfo.name.charAt(0)
            }}</span>
          </button>

          <div v-if="userMenuOpen" class="user-menu" @click.stop>
            <div class="user-menu__header">
              <div class="user-menu__avatar">
                <svg v-if="!isLoggedIn" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M4 20c0-4 4-6 8-6s8 2 8 6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span v-else>{{ userInfo.name.charAt(0) }}</span>
              </div>
              <div class="user-menu__info">
                <p class="user-menu__name">
                  {{ isLoggedIn ? userInfo.name : "未登录" }}
                </p>
                <p class="user-menu__email">
                  {{ isLoggedIn ? "user@example.com" : "点击登录开始使用" }}
                </p>
              </div>
            </div>

            <div class="user-menu__divider" />

            <div class="user-menu__items">
              <button
                v-if="isLoggedIn"
                class="user-menu__item"
                @click="handleMenuClick('profile')"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="6"
                    r="3"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M3 17c0-3 3-5 7-5s7 2 7 5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span>个人中心</span>
              </button>

              <button
                v-if="!isLoggedIn"
                class="user-menu__item"
                @click="handleMenuClick('register')"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span>用户注册</span>
              </button>

              <button
                v-if="!isLoggedIn"
                class="user-menu__item"
                @click="handleMenuClick('login')"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2v16M4 8l6-6 6 6M4 12l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>用户登录</span>
              </button>

              <button
                v-if="isLoggedIn"
                class="user-menu__item user-menu__item--danger"
                @click="handleMenuClick('logout')"
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="M12 4h4v12h-4M8 8l-4 4 4 4M4 12h8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>

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
  transition:
    background 0.35s var(--ease-out),
    box-shadow 0.35s,
    padding 0.35s;
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
  transition:
    color 0.2s,
    background 0.2s;
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

/* 用户菜单 */
.user-menu-wrapper {
  position: relative;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-soft);
  transition: all 0.25s ease;
}

.user-avatar:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
}

.user-avatar--open {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 0 4px rgba(0, 119, 230, 0.15);
}

.user-avatar svg {
  width: 20px;
  height: 20px;
}

.user-avatar__text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent);
}

.user-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 48px rgba(10, 15, 26, 0.12);
  backdrop-filter: blur(20px);
  z-index: 200;
  overflow: hidden;
  animation: menu-in 0.25s var(--ease-out);
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.user-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(
    135deg,
    rgba(0, 119, 230, 0.05) 0%,
    rgba(0, 194, 212, 0.05) 100%
  );
}

.user-menu__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 119, 230, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-menu__avatar svg {
  width: 24px;
  height: 24px;
}

.user-menu__info {
  min-width: 0;
}

.user-menu__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__email {
  font-size: 0.75rem;
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__divider {
  height: 1px;
  background: var(--border);
  margin: 0 16px;
}

.user-menu__items {
  padding: 8px;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 0.875rem;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.user-menu__item:hover {
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent-deep);
}

.user-menu__item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.user-menu__item--danger {
  color: #e53935;
}

.user-menu__item--danger:hover {
  background: rgba(229, 57, 53, 0.08);
  color: #c62828;
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
  transition:
    transform 0.25s var(--ease-spring),
    box-shadow 0.25s;
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
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--ink);
  transition: transform 0.25s var(--ease-out);
}

.nav__toggle span::before {
  top: -6px;
}
.nav__toggle span::after {
  top: 6px;
}
.nav__toggle span.open {
  background: transparent;
}
.nav__toggle span.open::before {
  transform: translateY(6px) rotate(45deg);
}
.nav__toggle span.open::after {
  transform: translateY(-6px) rotate(-45deg);
}

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
    transition:
      opacity 0.3s,
      transform 0.3s,
      visibility 0.3s;
  }

  .nav__links--open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav__link {
    width: 100%;
    text-align: center;
    padding: 12px;
  }
  .nav__toggle {
    display: flex;
  }
  .nav__actions .btn {
    display: none;
  }
}
</style>
