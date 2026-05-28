<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "success"]);

// 表单数据
const form = reactive({
  username: "",
  password: "",
});

// 错误提示
const errors = reactive({
  username: "",
  password: "",
  general: "",
});

// 弹窗闪烁状态
const isShaking = ref(false);

// 模拟已存在的用户数据
const mockUsers = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" },
  { username: "test", password: "test123" },
];

// 重置表单
function resetForm() {
  form.username = "";
  form.password = "";
  errors.username = "";
  errors.password = "";
  errors.general = "";
}

// 验证用户名
function validateUsername() {
  if (!form.username.trim()) {
    errors.username = "请输入用户名";
    return false;
  }
  errors.username = "";
  return true;
}

// 验证密码
function validatePassword() {
  if (!form.password) {
    errors.password = "请输入密码";
    return false;
  }
  errors.password = "";
  return true;
}

// 处理登录
function handleLogin() {
  // 先验证表单
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();

  if (!isUsernameValid || !isPasswordValid) {
    return;
  }

  // 模拟登录验证
  const user = mockUsers.find(
    (u) => u.username === form.username.trim() && u.password === form.password,
  );

  if (user) {
    // 登录成功
    emit("success", { username: form.username.trim() });
    resetForm();
  } else {
    // 登录失败
    errors.general = "用户名或密码错误";
    // 触发闪烁动画
    triggerShake();
  }
}

// 触发闪烁动画
function triggerShake() {
  if (isShaking.value) return;
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
}

// 关闭弹窗
function closeModal() {
  emit("close");
  resetForm();
  document.body.style.overflow = "";
}

// 点击遮罩触发闪烁动画
function onOverlayClick() {
  triggerShake();
}

// 全局事件监听
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});

// 监听 show 属性
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
      resetForm();
    } else {
      document.body.style.overflow = "";
    }
  },
);

// 处理回车键登录
function handleKeydown(e) {
  if (props.show && e.key === "Enter") {
    handleLogin();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="onOverlayClick">
        <div
          class="modal-container"
          :class="{ 'is-shaking': isShaking }"
          @click.stop
        >
          <!-- 头部 -->
          <div class="modal-header">
            <div class="brand">
              <svg
                class="brand-icon"
                width="32"
                height="32"
                viewBox="0 0 28 28"
                fill="none"
              >
                <rect width="28" height="28" rx="7" fill="url(#brandGrad)" />
                <path
                  d="M7 18L11 10H13L17 18H15L14.2 16.2H9.8L9 18H7ZM10.4 14.6H13.6L12 10.8L10.4 14.6Z"
                  fill="white"
                />
                <path d="M19 10H21V18H19V10Z" fill="white" opacity="0.7" />
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28">
                    <stop stop-color="#0090ff" />
                    <stop offset="1" stop-color="#0057d9" />
                  </linearGradient>
                </defs>
              </svg>
              <span class="brand-name">知启灵枢</span>
            </div>
            <button class="close-btn" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- 标题 -->
          <div class="modal-title">
            <h2>用户登录</h2>
            <p>欢迎回来，请登录您的账号</p>
          </div>

          <!-- 表单 -->
          <div class="form-container">
            <!-- 通用错误提示 -->
            <div v-if="errors.general" class="general-error">
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              {{ errors.general }}
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                用户名
              </label>
              <input
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="请输入用户名"
                @blur="validateUsername"
                @focus="errors.general = ''"
              />
              <span v-if="errors.username" class="error-text">{{
                errors.username
              }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M8 11V7a4 4 0 118 0v4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                </svg>
                密码
              </label>
              <input
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="请输入密码"
                @blur="validatePassword"
                @focus="errors.general = ''"
              />
              <span v-if="errors.password" class="error-text">{{
                errors.password
              }}</span>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" />
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-password" @click.prevent>忘记密码？</a>
            </div>

            <!-- 登录按钮 -->
            <button class="login-btn" @click="handleLogin">立即登录</button>

            <!-- 测试账号提示 -->
            <div class="test-accounts">
              <p>测试账号：</p>
              <div class="account-tags">
                <span
                  class="account-tag"
                  @click="
                    form.username = 'admin';
                    form.password = 'admin123';
                  "
                  >admin / admin123</span
                >
                <span
                  class="account-tag"
                  @click="
                    form.username = 'user';
                    form.password = 'user123';
                  "
                  >user / user123</span
                >
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="modal-footer">
            <p>
              还没有账号？<a href="#" @click.prevent="$emit('switchToRegister')"
                >立即注册</a
              >
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  pointer-events: auto;
  isolation: isolate;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 弹窗闪烁动画 */
@keyframes shake {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  10% {
    transform: translate3d(-10px, 0, 0);
  }
  20% {
    transform: translate3d(10px, 0, 0);
  }
  30% {
    transform: translate3d(-10px, 0, 0);
  }
  40% {
    transform: translate3d(10px, 0, 0);
  }
  50% {
    transform: translate3d(-5px, 0, 0);
  }
  60% {
    transform: translate3d(5px, 0, 0);
  }
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  80% {
    transform: translate3d(3px, 0, 0);
  }
  90% {
    transform: translate3d(0, 0, 0);
  }
}

.modal-container.is-shaking {
  animation: shake 0.4s ease-in-out;
  box-shadow:
    0 20px 60px rgba(0, 144, 255, 0.3),
    0 0 0 3px rgba(0, 144, 255, 0.2);
  will-change: transform;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* 标题 */
.modal-title {
  text-align: center;
  padding: 24px 24px 0;
}

.modal-title h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.modal-title p {
  font-size: 0.875rem;
  color: #64748b;
}

/* 表单 */
.form-container {
  padding: 24px;
}

.general-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 20px;
}

.general-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-label svg {
  width: 18px;
  height: 18px;
  color: #0090ff;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #0090ff;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 144, 255, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.error-text {
  display: block;
  margin-top: 6px;
  font-size: 0.8125rem;
  color: #dc2626;
  animation: shake 0.3s ease-in-out;
}

/* 选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #475569;
}

.remember-me input {
  width: 18px;
  height: 18px;
  accent-color: #0090ff;
}

.forgot-password {
  font-size: 0.875rem;
  color: #0090ff;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #0057d9;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #0090ff, #0057d9);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0, 144, 255, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 144, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

/* 测试账号 */
.test-accounts {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.test-accounts p {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 10px;
}

.account-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.account-tag {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.account-tag:hover {
  background: #e2e8f0;
  border-color: #0090ff;
  color: #0090ff;
}

/* 底部 */
.modal-footer {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-footer p {
  font-size: 0.875rem;
  color: #64748b;
}

.modal-footer a {
  color: #0090ff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.modal-footer a:hover {
  color: #0057d9;
  text-decoration: underline;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    border-radius: 20px;
  }

  .form-container {
    padding: 20px;
  }

  .modal-title h2 {
    font-size: 1.25rem;
  }
}
</style>
