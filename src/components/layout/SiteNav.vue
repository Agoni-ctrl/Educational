<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { navItems } from "../../config/nav.js";
import RegisterModal from "../RegisterModal.vue";
import LoginModal from "../LoginModal.vue";

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const navSolid = ref(false);
const userMenuOpen = ref(false);
const showRegisterModal = ref(false);
const showLoginModal = ref(false);

// 模拟用户登录状态
const isLoggedIn = ref(false);
const userInfo = ref({
  name: "用户",
  avatar: null,
});

// 打开注册弹窗
function openRegisterModal() {
  closeUserMenu();
  showRegisterModal.value = true;
}

// 注册成功回调
function onRegisterSuccess(data) {
  showRegisterModal.value = false;
  isLoggedIn.value = true;
  userInfo.value.name = data.username;
  alert(`注册成功！欢迎 ${data.username}`);
}

// 打开登录弹窗
function openLoginModal() {
  closeUserMenu();
  showLoginModal.value = true;
}

// 登录成功回调
function onLoginSuccess(data) {
  showLoginModal.value = false;
  isLoggedIn.value = true;
  userInfo.value.name = data.username;
  alert(`登录成功！欢迎回来，${data.username}`);
}

// 切换到注册弹窗
function switchToRegister() {
  showLoginModal.value = false;
  showRegisterModal.value = true;
}

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
      openRegisterModal();
      break;
    case "login":
      openLoginModal();
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
                    d="M10 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5z"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M2 18c0-3 3-5 8-5s8 2 8 5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
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

  <!-- 注册弹窗 -->
  <RegisterModal
    :show="showRegisterModal"
    @close="showRegisterModal = false"
    @success="onRegisterSuccess"
  />

  <!-- 登录弹窗 -->
  <LoginModal
    :show="showLoginModal"
    @close="showLoginModal = false"
    @success="onLoginSuccess"
    @switchToRegister="switchToRegister"
  />
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  padding: var(--space-5) 0;
  transition: all var(--transition-slow);
}

.nav--solid {
  padding: var(--space-3) 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
}

.nav__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  text-decoration: none;
  transition: transform var(--transition-base);
}

.brand:hover {
  transform: scale(1.02);
}

.brand__name {
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: 0 auto;
}

.nav__link {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-base);
  position: relative;
}

.nav__link:hover {
  color: var(--text-primary);
  background: var(--color-gray-100);
}

.nav__link--active {
  color: var(--color-primary);
  background: var(--color-primary-50);
}

.nav__link--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* 用户菜单 */
.user-menu-wrapper {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-light);
  background: var(--bg-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.user-avatar:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
  box-shadow: var(--shadow-primary);
}

.user-avatar--open {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.user-avatar svg {
  width: 20px;
  height: 20px;
}

.user-avatar__text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
}

.user-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 260px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
  z-index: var(--z-dropdown);
  overflow: hidden;
  animation: scaleIn var(--transition-base);
}

.user-menu__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: linear-gradient(
    135deg,
    var(--color-primary-50) 0%,
    var(--color-secondary-50) 100%
  );
}

.user-menu__avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
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
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__email {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__divider {
  height: 1px;
  background: var(--border-light);
  margin: 0 var(--space-4);
}

.user-menu__items {
  padding: var(--space-2);
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.user-menu__item:hover {
  background: var(--color-primary-50);
  color: var(--color-primary);
}

.user-menu__item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.user-menu__item--danger {
  color: var(--color-error);
}

.user-menu__item--danger:hover {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.btn--dark {
  background: var(--text-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn--dark:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: var(--color-gray-800);
}

.btn--dark:active {
  transform: translateY(0);
}

/* 汉堡菜单 */
.nav__toggle {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

.nav__toggle:hover {
  background: var(--color-gray-100);
}

.nav__toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text-primary);
  position: relative;
  transition: background var(--transition-fast);
}

.nav__toggle span::before,
.nav__toggle span::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  transition: transform var(--transition-base);
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

/* 响应式 */
@media (max-width: 900px) {
  .nav__links {
    position: fixed;
    top: 72px;
    left: var(--space-4);
    right: var(--space-4);
    flex-direction: column;
    padding: var(--space-3);
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-xl);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all var(--transition-base);
  }

  .nav__links--open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav__link {
    width: 100%;
    text-align: center;
    padding: var(--space-3);
  }

  .nav__link--active::after {
    display: none;
  }

  .nav__toggle {
    display: flex;
  }

  .nav__actions .btn {
    display: none;
  }
}
</style>
