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
  confirmPassword: "",
});

// 错误提示
const errors = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  captcha: "",
});

// 验证码显示状态
const showCaptcha = ref(false);
const captchaVerified = ref(false);

// 拼图验证码数据
const puzzleData = reactive({
  sliderValue: 0,
  targetPosition: 0,
  isDragging: false,
  verified: false,
  showSuccess: false,
});

// 模拟已存在的用户
const existingUsers = ["admin", "user", "test", "123456"];

// 弹窗闪烁状态
const isShaking = ref(false);

// 重置表单
function resetForm() {
  form.username = "";
  form.password = "";
  form.confirmPassword = "";
  errors.username = "";
  errors.password = "";
  errors.confirmPassword = "";
  errors.captcha = "";
  showCaptcha.value = false;
  captchaVerified.value = false;
  resetPuzzle();
}

// 监听 show 属性，当弹窗打开时重置表单
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm();
    }
  },
);

// 重置拼图
function resetPuzzle() {
  puzzleData.sliderValue = 0;
  puzzleData.targetPosition = Math.floor(Math.random() * 60) + 20; // 20-80% 随机位置
  puzzleData.isDragging = false;
  puzzleData.verified = false;
  puzzleData.showSuccess = false;
}

// 验证用户名
function validateUsername() {
  if (!form.username.trim()) {
    errors.username = "请输入用户名";
    return false;
  }
  if (form.username.length < 3 || form.username.length > 20) {
    errors.username = "用户名长度应在3-20个字符之间";
    return false;
  }
  if (existingUsers.includes(form.username.toLowerCase())) {
    errors.username = "该用户名已被注册";
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
  if (form.password.length < 6 || form.password.length > 20) {
    errors.password = "密码长度应在6-20个字符之间";
    return false;
  }
  errors.password = "";
  return true;
}

// 验证确认密码
function validateConfirmPassword() {
  if (!form.confirmPassword) {
    errors.confirmPassword = "请再次输入密码";
    return false;
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "两次输入的密码不一致";
    return false;
  }
  errors.confirmPassword = "";
  return true;
}

// 点击注册按钮
function handleRegister() {
  // 先验证表单
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();

  if (!isUsernameValid || !isPasswordValid || !isConfirmValid) {
    return;
  }

  // 显示验证码
  if (!captchaVerified.value) {
    showCaptcha.value = true;
    resetPuzzle();
    return;
  }

  // 注册成功
  emit("success", { username: form.username });
  resetForm();
}

// 拼图验证码相关
const sliderTrack = ref(null);

function startDrag(e) {
  if (puzzleData.verified) return;
  puzzleData.isDragging = true;
  e.preventDefault();
}

function onDrag(e) {
  if (!puzzleData.isDragging) return;

  const track = sliderTrack.value;
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  let value = ((clientX - rect.left) / rect.width) * 100;

  value = Math.max(0, Math.min(100, value));
  puzzleData.sliderValue = value;
}

function endDrag() {
  if (!puzzleData.isDragging) return;
  puzzleData.isDragging = false;

  // 验证位置（允许 ±5% 的误差）
  const diff = Math.abs(puzzleData.sliderValue - puzzleData.targetPosition);
  if (diff <= 5) {
    puzzleData.verified = true;
    puzzleData.showSuccess = true;
    captchaVerified.value = true;
    errors.captcha = "";

    // 1秒后自动提交
    setTimeout(() => {
      if (captchaVerified.value) {
        emit("success", { username: form.username });
        resetForm();
      }
    }, 1000);
  } else {
    errors.captcha = "验证失败，请重新拖动";
    setTimeout(() => {
      puzzleData.sliderValue = 0;
    }, 500);
  }
}

// 关闭弹窗
function closeModal() {
  emit("close");
  resetForm();
  // 恢复背景滚动
  document.body.style.overflow = "";
}

// 点击遮罩触发闪烁动画
function onOverlayClick() {
  // 如果已经在动画中，不重复触发
  if (isShaking.value) return;

  isShaking.value = true;
  // 400ms 后移除动画类，与 CSS 动画时长一致
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
}

// 全局事件监听
onMounted(() => {
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchmove", onDrag);
  document.addEventListener("touchend", endDrag);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", endDrag);
  // 确保恢复背景滚动
  document.body.style.overflow = "";
});

// 监听 show 属性，控制背景滚动
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // 打开弹窗时禁止背景滚动
      document.body.style.overflow = "hidden";
    } else {
      // 关闭弹窗时恢复背景滚动
      document.body.style.overflow = "";
    }
  },
);
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
            <h2>用户注册</h2>
            <p>创建您的账号，开启智能教育之旅</p>
          </div>

          <!-- 表单 -->
          <div class="form-container">
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
                placeholder="请输入用户名（3-20个字符）"
                @blur="validateUsername"
              />
              <span v-if="errors.username" class="error-text">{{
                errors.username
              }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                密码
              </label>
              <input
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="请输入密码（6-20个字符）"
                @blur="validatePassword"
              />
              <span v-if="errors.password" class="error-text">{{
                errors.password
              }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                确认密码
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                class="form-input"
                placeholder="请再次输入密码"
                @blur="validateConfirmPassword"
              />
              <span v-if="errors.confirmPassword" class="error-text">{{
                errors.confirmPassword
              }}</span>
            </div>

            <!-- 拼图验证码 -->
            <Transition name="captcha">
              <div v-if="showCaptcha" class="captcha-section">
                <label class="form-label">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  安全验证
                </label>

                <div class="puzzle-container">
                  <!-- 拼图轨道背景 -->
                  <div class="puzzle-track" ref="sliderTrack">
                    <!-- 目标位置标记 -->
                    <div
                      class="target-marker"
                      :style="{ left: puzzleData.targetPosition + '%' }"
                    >
                      <div class="target-icon">★</div>
                    </div>

                    <!-- 滑块 -->
                    <div
                      class="puzzle-slider"
                      :class="{
                        'is-dragging': puzzleData.isDragging,
                        'is-verified': puzzleData.verified,
                      }"
                      :style="{ left: puzzleData.sliderValue + '%' }"
                      @mousedown="startDrag"
                      @touchstart="startDrag"
                    >
                      <div class="slider-icon">
                        <svg
                          v-if="!puzzleData.verified"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 5l7 7-7 7"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <!-- 提示文字 -->
                    <div v-if="!puzzleData.verified" class="puzzle-hint">
                      拖动滑块到 ★ 位置完成验证
                    </div>
                    <div v-else class="puzzle-success">验证成功！</div>
                  </div>
                </div>

                <span v-if="errors.captcha" class="error-text">{{
                  errors.captcha
                }}</span>
              </div>
            </Transition>

            <!-- 注册按钮 -->
            <button
              class="register-btn"
              :class="{ 'is-loading': showCaptcha && !captchaVerified }"
              @click="handleRegister"
            >
              <span v-if="!showCaptcha">立即注册</span>
              <span v-else-if="!captchaVerified">完成验证</span>
              <span v-else>注册成功</span>
            </button>
          </div>

          <!-- 底部提示 -->
          <div class="modal-footer">
            <p>
              已有账号？<a href="#" @click.prevent="closeModal">立即登录</a>
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
  /* 阻止所有鼠标事件穿透 */
  pointer-events: auto;
  /* 确保置顶 */
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

/* 弹窗闪烁动画 - 使用 will-change 优化性能 */
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

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* 拼图验证码 */
.captcha-section {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 16px;
  border: 1px solid #bae6fd;
}

.puzzle-container {
  margin-top: 12px;
}

.puzzle-track {
  position: relative;
  height: 48px;
  background: linear-gradient(90deg, #e0f2fe 0%, #f0f9ff 50%, #e0f2fe 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.target-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.target-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.puzzle-slider {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
  z-index: 10;
}

.puzzle-slider:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.puzzle-slider.is-dragging {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0, 144, 255, 0.3);
}

.puzzle-slider.is-verified {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  cursor: default;
}

.slider-icon {
  width: 20px;
  height: 20px;
  color: #0090ff;
}

.puzzle-slider.is-verified .slider-icon {
  color: white;
}

.puzzle-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  color: #64748b;
  pointer-events: none;
  white-space: nowrap;
}

.puzzle-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: #16a34a;
  pointer-events: none;
}

/* 注册按钮 */
.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 144, 255, 0.4);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn.is-loading {
  opacity: 0.8;
  cursor: wait;
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

.captcha-enter-active,
.captcha-leave-active {
  transition: all 0.3s ease;
}

.captcha-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.captcha-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
