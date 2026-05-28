<script setup>
import { ref, computed, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  useFeatures,
  formatFeatureTime,
  getTypeIcon,
} from "../composables/useFeatures.js";

const {
  getHistory,
  getStats,
  addRecord,
  deleteRecord,
  TYPE_LABELS,
  STATUS_LABELS,
} = useFeatures();

const activePanel = ref("overview");
const sidebarOpen = ref(false);
const history = ref(getHistory());
const stats = ref(getStats());

const pptForm = ref({
  subject: "",
  topic: "",
  duration: "45",
  style: "实验探究型",
});
const docForm = ref({ subject: "", topic: "", format: "标准教案" });
const uploadFiles = ref([]);
const isGenerating = ref(false);
const toast = ref("");

const navGroups = [
  {
    label: "创作生成",
    items: [
      { id: "ppt", label: "课件生成", icon: "ppt", desc: "PPT 演示文稿" },
      { id: "doc", label: "教案生成", icon: "doc", desc: "Word 教案文档" },
      {
        id: "interactive",
        label: "互动创意",
        icon: "interactive",
        desc: "小游戏与动画",
      },
    ],
  },
  {
    label: "智能理解",
    items: [
      { id: "intent", label: "意图理解", icon: "intent", desc: "多轮对话梳理" },
      {
        id: "multimodal",
        label: "多模态参考",
        icon: "multimodal",
        desc: "PDF / Word / 视频",
      },
    ],
  },
  {
    label: "管理与优化",
    items: [
      {
        id: "visualize",
        label: "可视化",
        icon: "visualize",
        desc: "数据与进度洞察",
      },
      {
        id: "history",
        label: "历史记录",
        icon: "history",
        desc: "生成记录管理",
      },
      {
        id: "iterate",
        label: "迭代优化",
        icon: "iterate",
        desc: "反馈与再生成",
      },
    ],
  },
];

const panelTitles = {
  overview: "工作台概览",
  ppt: "课件生成",
  doc: "教案生成",
  interactive: "互动创意",
  intent: "意图理解",
  multimodal: "多模态参考",
  visualize: "可视化",
  history: "历史记录",
  iterate: "迭代优化",
};

const vizData = computed(() => ({
  weekly: [3, 5, 2, 8, 6, 4, 7],
  types: [
    { label: "PPT 课件", value: stats.value.ppt, color: "#0077e6" },
    { label: "Word 教案", value: stats.value.doc, color: "#00c2d4" },
    {
      label: "互动创意",
      value: history.value.filter((h) => h.type === "interactive").length,
      color: "#6366f1",
    },
  ],
}));

const iteratingItems = computed(() =>
  history.value.filter((h) => h.status === "iterating" || h.status === "draft"),
);

let toastTimer = null;

function refresh() {
  history.value = getHistory();
  stats.value = getStats();
}

function selectPanel(id) {
  activePanel.value = id;
  sidebarOpen.value = false;
}

function showToast(msg) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = "";
  }, 2600);
}

function simulateGenerate(type, title, subject) {
  isGenerating.value = true;
  setTimeout(() => {
    addRecord({
      type,
      title,
      subject,
      status: type === "interactive" ? "draft" : "completed",
    });
    refresh();
    isGenerating.value = false;
    showToast("生成任务已加入历史记录");
    activePanel.value = "history";
  }, 1200);
}

function handlePptGenerate() {
  if (!pptForm.value.topic.trim()) return showToast("请填写课题名称");
  simulateGenerate(
    "ppt",
    `${pptForm.value.topic} · PPT 课件`,
    pptForm.value.subject || "未分类",
  );
}

function handleDocGenerate() {
  if (!docForm.value.topic.trim()) return showToast("请填写课题名称");
  simulateGenerate(
    "doc",
    `${docForm.value.topic} · Word 教案`,
    docForm.value.subject || "未分类",
  );
}

function handleInteractiveGenerate() {
  simulateGenerate(
    "interactive",
    "课堂互动创意方案",
    pptForm.value.subject || "未分类",
  );
}

function onFileChange(e) {
  const files = Array.from(e.target.files || []);
  uploadFiles.value = [
    ...uploadFiles.value,
    ...files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  ];
  e.target.value = "";
}

function removeFile(i) {
  uploadFiles.value.splice(i, 1);
}

function handleDelete(id) {
  deleteRecord(id);
  refresh();
  showToast("已删除记录");
}

watch(activePanel, refresh);
</script>

<template>
  <div class="features-page">
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__head">
        <RouterLink to="/" class="icon-btn" title="返回首页">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>
        <div class="sidebar__brand">
          <span class="sidebar__brand-name">核心功能</span>
          <span class="sidebar__brand-sub">知启灵枢工作台</span>
        </div>
      </div>

      <button
        class="overview-btn"
        :class="{ 'overview-btn--active': activePanel === 'overview' }"
        @click="selectPanel('overview')"
      >
        <svg viewBox="0 0 20 20" fill="none">
          <rect
            x="3"
            y="3"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.3"
          />
          <rect
            x="11"
            y="3"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.3"
          />
          <rect
            x="3"
            y="11"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.3"
          />
          <rect
            x="11"
            y="11"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.3"
          />
        </svg>
        工作台概览
      </button>

      <nav v-for="group in navGroups" :key="group.label" class="nav-group">
        <p class="nav-group__label">{{ group.label }}</p>
        <button
          v-for="item in group.items"
          :key="item.id"
          class="nav-item"
          :class="{ 'nav-item--active': activePanel === item.id }"
          @click="selectPanel(item.id)"
        >
          <!--  这里是图标  -->
          <span class="nav-item__icon" :data-icon="item.icon">
            <template v-if="item.icon === 'ppt'">📊</template>
            <template v-else-if="item.icon === 'doc'">📝</template>
            <template v-else-if="item.icon === 'interactive'">🎮</template>
            <template v-else-if="item.icon === 'intent'">💬</template>
            <template v-else-if="item.icon === 'multimodal'">📎</template>
            <template v-else-if="item.icon === 'visualize'">📈</template>
            <template v-else-if="item.icon === 'history'">🕐</template>
            <template v-else-if="item.icon === 'iterate'">🔄</template>
          </span>
          <span class="nav-item__text">
            <strong>{{ item.label }}</strong>
            <small>{{ item.desc }}</small>
          </span>
        </button>
      </nav>

      <div class="sidebar__foot">
        <RouterLink to="/assistant" class="assistant-link">
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M4 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-3 3v-3H7a3 3 0 0 1-3-3V6z"
              stroke="currentColor"
              stroke-width="1.3"
            />
          </svg>
          前往 AI 助手对话
        </RouterLink>
      </div>
    </aside>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <main class="main">
      <header class="main__header">
        <button
          class="icon-btn mobile-only"
          aria-label="打开菜单"
          @click="sidebarOpen = true"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <div>
          <h1>{{ panelTitles[activePanel] }}</h1>
          <p class="main__subtitle">以教学思路为核心，完成课件共创全流程</p>
        </div>
      </header>

      <div class="main__body">
        <!-- 概览 -->
        <div v-if="activePanel === 'overview'" class="panel panel--overview">
          <div class="stat-cards">
            <div class="stat-card">
              <span class="stat-card__value">{{ stats.total }}</span>
              <span class="stat-card__label">生成总数</span>
            </div>
            <div class="stat-card">
              <span class="stat-card__value">{{ stats.completed }}</span>
              <span class="stat-card__label">已完成</span>
            </div>
            <div class="stat-card">
              <span class="stat-card__value">{{ stats.iterating }}</span>
              <span class="stat-card__label">迭代中</span>
            </div>
            <div class="stat-card stat-card--accent">
              <span class="stat-card__value">4</span>
              <span class="stat-card__label">核心能力</span>
            </div>
          </div>

          <div class="overview-grid">
            <div
              class="capability-card"
              v-for="cap in [
                {
                  title: '理解意图',
                  desc: '多轮对话确认教学目标与讲授逻辑',
                  icon: '💬',
                  panel: 'intent',
                },
                {
                  title: '多模态融合',
                  desc: '解析 PDF、Word、视频等参考资料',
                  icon: '📎',
                  panel: 'multimodal',
                },
                {
                  title: '生成初稿',
                  desc: '输出 PPT、教案及互动创意',
                  icon: '✨',
                  panel: 'ppt',
                },
                {
                  title: '迭代优化',
                  desc: '预览反馈，持续完善课件',
                  icon: '🔄',
                  panel: 'iterate',
                },
              ]"
              :key="cap.title"
              @click="selectPanel(cap.panel)"
            >
              <span class="capability-card__icon">{{ cap.icon }}</span>
              <h3>{{ cap.title }}</h3>
              <p>{{ cap.desc }}</p>
              <span class="capability-card__arrow">→</span>
            </div>
          </div>

          <div class="recent-block">
            <div class="recent-block__head">
              <h2>最近生成</h2>
              <button class="text-link" @click="selectPanel('history')">
                查看全部
              </button>
            </div>
            <div class="recent-list">
              <div
                v-for="item in history.slice(0, 4)"
                :key="item.id"
                class="recent-item"
              >
                <span
                  class="recent-item__icon"
                  v-html="getTypeIcon(item.type, item.title)"
                ></span>
                <div class="recent-item__info">
                  <strong>{{ item.title }}</strong>
                  <span
                    >{{ item.subject }} ·
                    {{ formatFeatureTime(item.createdAt) }}</span
                  >
                </div>
                <span class="status-badge" :data-status="item.status">{{
                  STATUS_LABELS[item.status]
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 课件生成 -->
        <div v-else-if="activePanel === 'ppt'" class="panel">
          <div class="panel-grid">
            <div class="form-card">
              <h2>生成 PPT 课件</h2>
              <p class="form-card__desc">
                基于已理解的教学意图，生成结构完整的演示文稿初稿
              </p>
              <label
                >学科
                <input v-model="pptForm.subject" placeholder="如：高中物理"
              /></label>
              <label
                >课题
                <input v-model="pptForm.topic" placeholder="如：牛顿第二定律"
              /></label>
              <label
                >课时时长
                <select v-model="pptForm.duration">
                  <option value="40">40 分钟</option>
                  <option value="45">45 分钟</option>
                  <option value="90">90 分钟</option>
                </select>
              </label>
              <label
                >讲授风格
                <select v-model="pptForm.style">
                  <option>实验探究型</option>
                  <option>讲授演示型</option>
                  <option>问题驱动型</option>
                  <option>翻转课堂型</option>
                </select>
              </label>
              <button
                class="btn-primary"
                :disabled="isGenerating"
                @click="handlePptGenerate"
              >
                {{ isGenerating ? "生成中..." : "开始生成 PPT" }}
              </button>
            </div>
            <div class="preview-card">
              <div class="preview-card__chrome">
                <span /><span /><span /><em>课件预览</em>
              </div>
              <div class="preview-slides">
                <div
                  v-for="(slide, i) in [
                    '封面',
                    '导入',
                    '实验探究',
                    '公式推导',
                    '练习',
                  ]"
                  :key="i"
                  class="preview-slide"
                  :class="{ active: i === 2 }"
                >
                  <span>{{ i + 1 }}</span>
                  <p>{{ slide }}</p>
                </div>
              </div>
              <p class="preview-hint">生成后将在此预览幻灯片结构</p>
            </div>
          </div>
        </div>

        <!-- 教案生成 -->
        <div v-else-if="activePanel === 'doc'" class="panel">
          <div class="panel-grid">
            <div class="form-card">
              <h2>生成 Word 教案</h2>
              <p class="form-card__desc">
                输出包含教学目标、重难点、教学过程的标准教案文档
              </p>
              <label
                >学科
                <input v-model="docForm.subject" placeholder="如：高中物理"
              /></label>
              <label
                >课题
                <input v-model="docForm.topic" placeholder="如：牛顿第二定律"
              /></label>
              <label
                >模板格式
                <select v-model="docForm.format">
                  <option>标准教案</option>
                  <option>详细教案</option>
                  <option>简案</option>
                  <option>匹配学校模板</option>
                </select>
              </label>
              <button
                class="btn-primary"
                :disabled="isGenerating"
                @click="handleDocGenerate"
              >
                {{ isGenerating ? "生成中..." : "开始生成教案" }}
              </button>
            </div>
            <div class="doc-preview">
              <h3>教案结构预览</h3>
              <ul>
                <li><span>一</span> 教学目标</li>
                <li><span>二</span> 教学重难点</li>
                <li><span>三</span> 教学过程</li>
                <li class="indent"><span>3.1</span> 情境导入</li>
                <li class="indent"><span>3.2</span> 实验探究</li>
                <li class="indent"><span>3.3</span> 归纳总结</li>
                <li><span>四</span> 板书设计</li>
                <li><span>五</span> 作业布置</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 互动创意 -->
        <div v-else-if="activePanel === 'interactive'" class="panel">
          <div class="interactive-grid">
            <div
              class="interactive-card"
              v-for="item in [
                { icon: '🎯', title: '课堂投票', desc: '快速检验学生理解程度' },
                { icon: '🧩', title: '拖拽排序', desc: '知识点逻辑排列互动' },
                { icon: '⏱️', title: '限时挑战', desc: '巩固练习小游戏' },
                { icon: '🎬', title: '知识点动画', desc: '抽象概念可视化演示' },
              ]"
              :key="item.title"
            >
              <span>{{ item.icon }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </div>
          <button
            class="btn-primary"
            :disabled="isGenerating"
            @click="handleInteractiveGenerate"
          >
            生成互动创意方案
          </button>
        </div>

        <!-- 意图理解 -->
        <div v-else-if="activePanel === 'intent'" class="panel">
          <div class="intent-card">
            <div class="intent-card__visual">
              <div class="intent-flow">
                <div
                  v-for="(step, i) in [
                    '描述设想',
                    'AI 追问',
                    '确认逻辑',
                    '形成方案',
                  ]"
                  :key="i"
                  class="intent-step"
                >
                  <span class="intent-step__num">{{ i + 1 }}</span>
                  <p>{{ step }}</p>
                </div>
              </div>
            </div>
            <div class="intent-card__content">
              <h2>多轮对话，深度理解教学意图</h2>
              <p>
                智能体会主动询问教学目标、核心知识点、讲授逻辑、重难点与互动设计，直至完整理解您的教学思路。
              </p>
              <ul class="check-list">
                <li>支持语音 / 文字输入</li>
                <li>主动追问细节，避免理解偏差</li>
                <li>确认后自动进入生成流程</li>
              </ul>
              <RouterLink to="/assistant" class="btn-primary"
                >打开 AI 助手开始对话</RouterLink
              >
            </div>
          </div>
        </div>

        <!-- 多模态参考 -->
        <div v-else-if="activePanel === 'multimodal'" class="panel">
          <div class="upload-zone">
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.mp4,.png,.jpg"
              hidden
              @change="onFileChange"
            />
            <label for="file-input" class="upload-zone__drop">
              <span class="upload-zone__icon">📎</span>
              <strong>点击或拖拽上传参考资料</strong>
              <p>支持 PDF 教案、Word 文档、参考视频、图片等格式</p>
            </label>
          </div>
          <div v-if="uploadFiles.length" class="file-list">
            <div v-for="(f, i) in uploadFiles" :key="i" class="file-item">
              <span>📄 {{ f.name }}</span>
              <button @click="removeFile(i)">移除</button>
            </div>
          </div>
          <div class="multimodal-options">
            <h3>融合策略</h3>
            <label class="option-chip"
              ><input type="checkbox" checked /> 提取知识结构</label
            >
            <label class="option-chip"
              ><input type="checkbox" checked /> 保留案例素材</label
            >
            <label class="option-chip"
              ><input type="checkbox" /> 仿照排版风格</label
            >
            <label class="option-chip"
              ><input type="checkbox" /> 引用图表数据</label
            >
          </div>
        </div>

        <!-- 可视化 -->
        <div v-else-if="activePanel === 'visualize'" class="panel">
          <div class="viz-grid">
            <div class="viz-card viz-card--wide">
              <h3>本周生成趋势</h3>
              <div class="bar-chart">
                <div
                  v-for="(v, i) in vizData.weekly"
                  :key="i"
                  class="bar-chart__bar"
                  :style="{ height: `${v * 12}%` }"
                >
                  <span>{{
                    ["一", "二", "三", "四", "五", "六", "日"][i]
                  }}</span>
                </div>
              </div>
            </div>
            <div class="viz-card">
              <h3>生成类型分布</h3>
              <div class="donut-list">
                <div
                  v-for="t in vizData.types"
                  :key="t.label"
                  class="donut-item"
                >
                  <span
                    class="donut-item__dot"
                    :style="{ background: t.color }"
                  />
                  <span>{{ t.label }}</span>
                  <strong>{{ t.value }}</strong>
                </div>
              </div>
            </div>
            <div class="viz-card">
              <h3>能力掌握雷达</h3>
              <div class="radar-placeholder">
                <svg viewBox="0 0 200 200">
                  <polygon
                    points="100,20 170,70 150,150 50,150 30,70"
                    fill="rgba(0,119,230,0.08)"
                    stroke="rgba(0,119,230,0.2)"
                  />
                  <polygon
                    points="100,40 150,75 135,135 65,135 50,75"
                    fill="rgba(0,119,230,0.15)"
                    stroke="#0077e6"
                    stroke-width="1.5"
                  />
                  <text
                    x="100"
                    y="14"
                    text-anchor="middle"
                    font-size="9"
                    fill="#6b7c93"
                  >
                    意图理解
                  </text>
                  <text x="178" y="74" font-size="9" fill="#6b7c93">
                    多模态
                  </text>
                  <text x="158" y="168" font-size="9" fill="#6b7c93">
                    课件生成
                  </text>
                  <text x="42" y="168" font-size="9" fill="#6b7c93">
                    迭代优化
                  </text>
                  <text x="18" y="74" font-size="9" fill="#6b7c93">
                    互动设计
                  </text>
                </svg>
              </div>
            </div>
            <div class="viz-card">
              <h3>闭环进度</h3>
              <div class="progress-steps">
                <div
                  v-for="(s, i) in ['对话', '参考', '生成', '优化']"
                  :key="s"
                  class="progress-step"
                  :class="{ done: i < 3, active: i === 2 }"
                >
                  <span>{{ i + 1 }}</span>
                  <p>{{ s }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div v-else-if="activePanel === 'history'" class="panel">
          <div class="history-list">
            <div v-for="item in history" :key="item.id" class="history-row">
              <span
                class="history-row__icon"
                v-html="getTypeIcon(item.type, item.title)"
              ></span>
              <div class="history-row__info">
                <strong>{{ item.title }}</strong>
                <span
                  >{{ TYPE_LABELS[item.type] }} · {{ item.subject }} ·
                  {{ formatFeatureTime(item.createdAt) }}</span
                >
              </div>
              <span class="status-badge" :data-status="item.status">{{
                STATUS_LABELS[item.status]
              }}</span>
              <div class="history-row__actions">
                <button title="下载">↓</button>
                <button title="删除" @click="handleDelete(item.id)">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 迭代优化 -->
        <div v-else-if="activePanel === 'iterate'" class="panel">
          <div v-if="iteratingItems.length" class="iterate-list">
            <div
              v-for="item in iteratingItems"
              :key="item.id"
              class="iterate-card"
            >
              <div class="iterate-card__head">
                <span>{{ getTypeIcon(item.type) }}</span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ STATUS_LABELS[item.status] }}</span>
                </div>
              </div>
              <div class="iterate-card__preview">
                <div class="iterate-preview-block" />
                <div class="iterate-preview-block short" />
              </div>
              <div class="iterate-card__feedback">
                <input
                  type="text"
                  placeholder="描述修改意见，如：第二页增加实验图片..."
                />
                <button class="btn-primary btn-sm">提交反馈并再生成</button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无待迭代的内容</p>
            <button class="btn-ghost" @click="selectPanel('ppt')">
              去生成课件
            </button>
          </div>
        </div>
      </div>
    </main>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.features-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(160deg, #e8f2fc 0%, #dceaf8 50%, #e5f0fa 100%);
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
  background: rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(0, 87, 217, 0.08);
  backdrop-filter: blur(12px);
  overflow-y: auto;
}

.sidebar__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--border);
  color: var(--ink-soft);
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.2s;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}
.icon-btn:hover {
  background: #fff;
}

.sidebar__brand-name {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: -0.02em;
}

.sidebar__brand-sub {
  font-size: 0.7rem;
  color: var(--ink-muted);
}

.overview-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-soft);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.overview-btn svg {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}

.overview-btn:hover,
.overview-btn--active {
  background: rgba(0, 144, 255, 0.1);
  border-color: rgba(0, 144, 255, 0.2);
  color: var(--accent-deep);
}

.nav-group {
  margin-bottom: 12px;
}

.nav-group__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding: 0 10px;
  margin-bottom: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 2px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.nav-item--active {
  background: rgba(0, 144, 255, 0.12);
}

.nav-item__icon {
  font-size: 1.125rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  flex-shrink: 0;
}

.nav-item--active .nav-item__icon {
  background: rgba(0, 144, 255, 0.15);
}

.nav-item__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.nav-item__text strong {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
}

.nav-item__text small {
  font-size: 0.6875rem;
  color: var(--ink-muted);
}

.sidebar__foot {
  margin-top: auto;
  padding-top: 16px;
}

.assistant-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent-deep);
  background: rgba(0, 144, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.2s;
}

.assistant-link svg {
  width: 16px;
  height: 16px;
}
.assistant-link:hover {
  background: rgba(0, 144, 255, 0.16);
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px;
}

.main__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}

.main__header h1 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.main__subtitle {
  font-size: 0.875rem;
  color: var(--ink-muted);
  margin-top: 4px;
}

.mobile-only {
  display: none;
}

.main__body {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 87, 217, 0.08);
  padding: 28px;
}

/* Overview */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.stat-card {
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(248, 250, 252, 0.8);
}

.stat-card__value {
  display: block;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.stat-card--accent .stat-card__value {
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card__label {
  font-size: 0.8125rem;
  color: var(--ink-muted);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.capability-card {
  position: relative;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s,
    border-color 0.3s;
}

.capability-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0, 87, 217, 0.1);
  border-color: rgba(0, 119, 230, 0.25);
}

.capability-card__icon {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.capability-card h3 {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.capability-card p {
  font-size: 0.8125rem;
  color: var(--ink-soft);
  line-height: 1.5;
}

.capability-card__arrow {
  position: absolute;
  top: 18px;
  right: 16px;
  color: var(--ink-muted);
  transition: transform 0.2s;
}

.capability-card:hover .capability-card__arrow {
  transform: translateX(3px);
  color: var(--accent);
}

.recent-block__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.recent-block__head h2 {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
}

.text-link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: background 0.2s;
}

.recent-item:hover {
  background: rgba(0, 119, 230, 0.04);
}

.recent-item__icon {
  font-size: 1.25rem;
}

.recent-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-item__info strong {
  font-size: 0.875rem;
}
.recent-item__info span {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.status-badge {
  padding: 4px 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 999px;
}

.status-badge[data-status="completed"] {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.status-badge[data-status="draft"] {
  color: var(--ink-muted);
  background: rgba(10, 15, 26, 0.06);
}

.status-badge[data-status="iterating"] {
  color: var(--accent-deep);
  background: rgba(0, 119, 230, 0.1);
}

/* Forms & panels */
.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-card h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-card__desc {
  font-size: 0.875rem;
  color: var(--ink-soft);
  margin-bottom: 24px;
}

.form-card label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.form-card input,
.form-card select {
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9375rem;
  outline: none;
  background: #fff;
}

.form-card input:focus,
.form-card select:focus {
  border-color: var(--accent);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: var(--ink);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    transform 0.25s var(--ease-spring),
    box-shadow 0.25s;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(10, 15, 26, 0.15);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 10px 18px;
  font-size: 0.8125rem;
}

.btn-ghost {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  cursor: pointer;
}

.preview-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

.preview-card__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.preview-card__chrome span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.preview-card__chrome span:nth-child(1) {
  background: #ff6b6b;
}
.preview-card__chrome span:nth-child(2) {
  background: #ffd166;
}
.preview-card__chrome span:nth-child(3) {
  background: #06d6a0;
}
.preview-card__chrome em {
  margin-left: auto;
  font-style: normal;
}

.preview-slides {
  display: flex;
  gap: 10px;
  padding: 20px;
  overflow-x: auto;
}

.preview-slide {
  flex-shrink: 0;
  width: 100px;
  height: 70px;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--ink-muted);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.preview-slide.active {
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(0, 119, 230, 0.15);
  color: var(--accent-deep);
}

.preview-hint {
  padding: 12px 16px;
  font-size: 0.8125rem;
  color: var(--ink-muted);
  text-align: center;
  border-top: 1px solid var(--border);
}

.doc-preview {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.5);
}

.doc-preview h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.doc-preview ul {
  list-style: none;
}

.doc-preview li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.875rem;
  color: var(--ink-soft);
  border-bottom: 1px solid var(--border);
}

.doc-preview li.indent {
  padding-left: 24px;
}

.doc-preview li span {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
  width: 28px;
}

/* Interactive */
.interactive-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.interactive-card {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  text-align: center;
  transition:
    transform 0.3s var(--ease-out),
    box-shadow 0.3s;
}

.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 87, 217, 0.08);
}

.interactive-card span {
  font-size: 2rem;
}

.interactive-card h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 10px 0 6px;
}

.interactive-card p {
  font-size: 0.8125rem;
  color: var(--ink-muted);
}

/* Intent */
.intent-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
}

.intent-flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.intent-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(0, 119, 230, 0.06);
  border: 1px solid rgba(0, 119, 230, 0.1);
}

.intent-step__num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
}

.intent-card__content h2 {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.intent-card__content p {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ink-soft);
  margin-bottom: 20px;
}

.check-list {
  list-style: none;
  margin-bottom: 24px;
}

.check-list li {
  padding: 8px 0 8px 24px;
  font-size: 0.875rem;
  color: var(--ink-soft);
  position: relative;
}

.check-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #059669;
  font-weight: 700;
}

/* Multimodal */
.upload-zone__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  border: 2px dashed rgba(0, 119, 230, 0.25);
  border-radius: 16px;
  background: rgba(0, 119, 230, 0.04);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  text-align: center;
}

.upload-zone__drop:hover {
  border-color: var(--accent);
  background: rgba(0, 119, 230, 0.08);
}

.upload-zone__icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.upload-zone__drop strong {
  font-size: 1rem;
  margin-bottom: 6px;
}

.upload-zone__drop p {
  font-size: 0.875rem;
  color: var(--ink-muted);
}

.file-list {
  margin: 16px 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  margin-bottom: 6px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.9);
  font-size: 0.875rem;
}

.file-item button {
  background: none;
  border: none;
  color: var(--ink-muted);
  cursor: pointer;
  font-size: 0.8125rem;
}

.multimodal-options h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 20px 0 12px;
}

.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 10px;
  margin-bottom: 8px;
  padding: 8px 14px;
  font-size: 0.8125rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
}

/* Visualization */
.viz-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.viz-card {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.viz-card--wide {
  grid-column: span 2;
}

.viz-card h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
  padding-top: 10px;
}

.bar-chart__bar {
  flex: 1;
  background: linear-gradient(180deg, var(--accent), rgba(0, 119, 230, 0.2));
  border-radius: 6px 6px 2px 2px;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  animation: bar-grow 0.8s var(--ease-out) backwards;
}

.bar-chart__bar span {
  font-size: 0.6875rem;
  color: var(--ink-muted);
  margin-top: 6px;
  transform: translateY(100%);
  padding-bottom: 4px;
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
  }
}

.donut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.donut-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
}

.donut-item__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.donut-item strong {
  margin-left: auto;
}

.radar-placeholder svg {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  display: block;
}

.progress-steps {
  display: flex;
  gap: 8px;
}

.progress-step {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.progress-step span {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(10, 15, 26, 0.06);
  margin-bottom: 6px;
}

.progress-step.done span {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
}

.progress-step.active span {
  background: rgba(0, 119, 230, 0.15);
  color: var(--accent);
}

.progress-step p {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: background 0.2s;
}

.history-row:hover {
  background: rgba(0, 119, 230, 0.03);
}

.history-row__icon {
  font-size: 1.375rem;
}

.history-row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-row__info strong {
  font-size: 0.9375rem;
}
.history-row__info span {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.history-row__actions {
  display: flex;
  gap: 4px;
}

.history-row__actions button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--ink-muted);
  transition:
    background 0.2s,
    color 0.2s;
}

.history-row__actions button:hover {
  background: rgba(0, 119, 230, 0.08);
  color: var(--accent);
}

/* Iterate */
.iterate-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.iterate-card {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.iterate-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.iterate-card__head span {
  font-size: 1.5rem;
}

.iterate-card__head strong {
  display: block;
  font-size: 0.9375rem;
}
.iterate-card__head span + div span {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.iterate-card__preview {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.iterate-preview-block {
  flex: 1;
  height: 80px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(0, 119, 230, 0.08),
    rgba(0, 194, 212, 0.06)
  );
  border: 1px solid var(--border);
}

.iterate-preview-block.short {
  flex: 0.5;
}

.iterate-card__feedback {
  display: flex;
  gap: 10px;
}

.iterate-card__feedback input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  outline: none;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-muted);
}

.empty-state p {
  margin-bottom: 16px;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: var(--ink);
  border-radius: 999px;
  box-shadow: 0 12px 40px rgba(10, 15, 26, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.sidebar-overlay {
  display: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .stat-cards,
  .overview-grid,
  .interactive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .panel-grid,
  .intent-card {
    grid-template-columns: 1fr;
  }
  .viz-card--wide {
    grid-column: span 1;
  }
  .viz-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s var(--ease-out);
    box-shadow: 4px 0 24px rgba(10, 15, 26, 0.1);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 199;
    background: rgba(10, 15, 26, 0.3);
  }

  .main {
    padding: 12px;
  }
  .main__body {
    padding: 20px 16px;
    border-radius: 16px;
  }
  .mobile-only {
    display: flex;
  }
  .stat-cards {
    grid-template-columns: 1fr 1fr;
  }
  .overview-grid,
  .interactive-grid {
    grid-template-columns: 1fr;
  }
  .iterate-card__feedback {
    flex-direction: column;
  }
}
</style>
