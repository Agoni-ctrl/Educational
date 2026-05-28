const STORAGE_KEY = "zhike-features-history";

const SEED_HISTORY = [
  {
    id: "h1",
    type: "ppt",
    title: "牛顿第二定律 · PPT 课件",
    subject: "高中物理",
    status: "completed",
    createdAt: Date.now() - 86400000 * 1,
    pages: 18,
  },
  {
    id: "h2",
    type: "doc",
    title: "牛顿第二定律 · Word 教案",
    subject: "高中物理",
    status: "completed",
    createdAt: Date.now() - 86400000 * 2,
    pages: 6,
  },
  {
    id: "h3",
    type: "interactive",
    title: "力的分解 · 互动小游戏创意",
    subject: "高中物理",
    status: "draft",
    createdAt: Date.now() - 86400000 * 3,
    pages: 1,
  },
  {
    id: "h4",
    type: "ppt",
    title: "鸦片战争 · 历史课导入设计",
    subject: "初中历史",
    status: "iterating",
    createdAt: Date.now() - 86400000 * 5,
    pages: 12,
  },
];

const TYPE_LABELS = {
  ppt: "PPT 课件",
  doc: "Word 教案",
  interactive: "互动创意",
  animation: "知识点动画",
};

const STATUS_LABELS = {
  completed: "已完成",
  draft: "草稿",
  iterating: "迭代中",
  failed: "失败",
};

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return structuredClone(SEED_HISTORY);
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useFeatures() {
  const history = loadHistory();

  function getHistory() {
    return [...loadHistory()].sort((a, b) => b.createdAt - a.createdAt);
  }

  function getStats() {
    const list = loadHistory();
    return {
      total: list.length,
      completed: list.filter((h) => h.status === "completed").length,
      iterating: list.filter((h) => h.status === "iterating").length,
      ppt: list.filter((h) => h.type === "ppt").length,
      doc: list.filter((h) => h.type === "doc").length,
    };
  }

  function addRecord({ type, title, subject, status = "draft" }) {
    const record = {
      id: uid(),
      type,
      title,
      subject: subject || "未分类",
      status,
      createdAt: Date.now(),
      pages: 0,
    };
    const list = loadHistory();
    list.unshift(record);
    saveHistory(list);
    return record;
  }

  function deleteRecord(id) {
    saveHistory(loadHistory().filter((h) => h.id !== id));
  }

  return {
    getHistory,
    getStats,
    addRecord,
    deleteRecord,
    TYPE_LABELS,
    STATUS_LABELS,
  };
}

export function formatFeatureTime(ts) {
  const diff = Date.now() - ts;
  const day = 86400000;
  if (diff < day) return "今天";
  if (diff < day * 2) return "昨天";
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

// 根据类型和标题获取专业图标 - WPS Office 风格
export function getTypeIcon(type, title = "") {
  const lowerTitle = title.toLowerCase();

  // 文件类型标识和颜色
  const typeConfig = {
    ppt: { label: "P", color: "#ff6b35" },
    doc: { label: "W", color: "#4472c4" },
    interactive: { label: "", color: "#00c2d4" },
    animation: { label: "", color: "#06d6a0" },
  };
  const config = typeConfig[type] || { label: "", color: "#4472c4" };

  // WPS 风格文件图标 - 右下角标识
  const typeIcons = {
    ppt: `<svg viewBox="0 0 24 24" fill="none">
      <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fff5f0" stroke="#ff6b35" stroke-width="1.5"/>
      <path d="M14 2v6h6" stroke="#ff6b35" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 10h6M7 14h8" stroke="#ff6b35" stroke-width="1.5" stroke-linecap="round"/>
      ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="#ff6b35"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
    </svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none">
      <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f0f5ff" stroke="#4472c4" stroke-width="1.5"/>
      <path d="M14 2v6h6" stroke="#4472c4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 10h6M7 14h8M7 18h5" stroke="#4472c4" stroke-width="1.5" stroke-linecap="round"/>
      ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="#4472c4"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
    </svg>`,
    interactive: `<svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#e6fbfc" stroke="#00c2d4" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" stroke="#00c2d4" stroke-width="1.5"/>
      <path d="M12 10v4M10 12h4" stroke="#00c2d4" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    animation: `<svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#e6fcf5" stroke="#06d6a0" stroke-width="1.5"/>
      <circle cx="10" cy="12" r="3" stroke="#06d6a0" stroke-width="1.5"/>
      <path d="M16 9l-3 3 3 3" stroke="#06d6a0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  };

  // WPS 风格关键词图标
  const keywordIcons = [
    // 学科类
    {
      keywords: ["物理", "力学", "运动", "力", "速度", "加速度"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f5f0ff" stroke="#7c3aed" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="11" r="2" stroke="#7c3aed" stroke-width="1.5"/>
        <path d="M12 9V7M12 15v-2M9 11H7M17 11h-2" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["化学", "分子", "原子", "反应", "实验"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f0fff4" stroke="#22c55e" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 8v4l-3 6h12l-3-6V8" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["生物", "细胞", "植物", "动物", "生态"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 7c-3 0-5 2-5 5s2 5 5 5 5-2 5-5" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 11v4M10 13h4" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["数学", "几何", "代数", "函数", "方程"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 10h4M7 14h6M7 18h3" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M15 10l-2 8M13 10l2 8" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["历史", "战争", "朝代", "古代", "近代"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="4" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M12 10v3l2 1" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["地理", "地图", "气候", "地形", "环境"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#ecfeff" stroke="#06b6d4" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#06b6d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="4" stroke="#06b6d4" stroke-width="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="#06b6d4" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["语文", "文学", "诗词", "阅读", "作文"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 10h8M8 14h6M8 18h4" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["英语", "外语", "单词", "语法"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="4" stroke="#8b5cf6" stroke-width="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    // 内容类型
    {
      keywords: ["游戏", "互动", "quiz", "测试"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fdf4ff" stroke="#d946ef" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#d946ef" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="6" y="10" width="12" height="8" rx="2" stroke="#d946ef" stroke-width="1.5"/>
        <circle cx="9" cy="14" r="1" fill="#d946ef"/>
        <circle cx="15" cy="14" r="1" fill="#d946ef"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["实验", "探究", "观察"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 8v4l-3 6h12l-3-6V8" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="15" r="2" stroke="#10b981" stroke-width="1.5"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["导入", "引入", "开场"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fff1f2" stroke="#fb7185" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 10h8M8 14h8" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M10 18l-2-2 2-2" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
    {
      keywords: ["总结", "复习", "归纳"],
      icon: `<svg viewBox="0 0 24 24" fill="none">
        <path d="M4 2h10l6 6v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1.5"/>
        <path d="M14 2v6h6" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 16h8" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
        ${config.label ? `<rect x="14" y="16" width="8" height="8" rx="2" fill="${config.color}"/><text x="18" y="22" text-anchor="middle" fill="white" font-size="6" font-weight="bold" stroke="none">${config.label}</text>` : ""}
      </svg>`,
    },
  ];

  // 先根据标题关键词匹配
  for (const item of keywordIcons) {
    if (item.keywords.some((k) => lowerTitle.includes(k))) {
      return item.icon;
    }
  }

  // 没有匹配到关键词，返回类型图标
  return typeIcons[type] || typeIcons.doc;
}
