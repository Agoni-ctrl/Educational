<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import { useUserStore } from "../stores/userStore.js";

const router = useRouter();
const user = useUserStore();
const userName = ref(user.getName() || "管理员");

const activeMenu = ref("dashboard");
const menuItems = [
  { id: "dashboard", label: "工作台", icon: "概" },
  { id: "schedule", label: "课程表", icon: "课" },
  { id: "classes", label: "班级", icon: "班" },
  { id: "grades", label: "成绩", icon: "绩" },
  { id: "templates", label: "模板", icon: "模" },
  { id: "settings", label: "设置", icon: "设" },
];

// ── ECharts ───────────────────────────────
let charts = [];
function disposeAll() {
  charts.forEach((c) => c?.dispose());
  charts = [];
}
function ec(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const c = echarts.init(el, null, { renderer: "svg" });
  charts.push(c);
  return c;
}
const tx = { color: "#6B7C93", fontSize: 11, fontFamily: "system-ui" };
function noAxis() {
  return {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: tx,
  };
}
function splitY() {
  return {
    splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
    axisLabel: tx,
  };
}
const tip = {
  backgroundColor: "#fff",
  borderColor: "#E5E8EF",
  textStyle: { color: "#111", fontSize: 13, fontFamily: "system-ui" },
  extraCssText:
    "border-radius:6px;padding:4px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);",
};

function initCharts() {
  disposeAll();
  // 每个模块独立色盘，避免颜色语义冲突
  const C = {
    work: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"],
    sched: ["#0D9488", "#06B6D4", "#059669", "#64748B", "#F97316"],
    cls: ["#0077E6", "#00C2D4", "#10B981", "#6366F1", "#0EA5E9"],
    grade: ["#059669", "#0891B2", "#65A30D", "#0D9488", "#84CC16"],
    templ: ["#D97706", "#EA580C", "#CA8A04", "#78716C", "#A8A29E"],
  };
  const g = (t = 8, b = 16, l = 36, r = 6) => ({
    top: t,
    bottom: b,
    left: l,
    right: r,
  });

  // 工作台
  ec("ch-d1")?.setOption({
    grid: { top: 28, bottom: 32, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["一", "二", "三", "四", "五", "六", "日"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "line",
        smooth: true,
        data: [5, 8, 12, 10, 15, 6, 3],
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { color: C.work[0], width: 2.5 },
        areaStyle: { color: "rgba(59,130,246,0.08)" },
        label: {
          show: true,
          position: "top",
          fontSize: 11,
          color: "#6B7C93",
        },
      },
    ],
  });
  ec("ch-d2")?.setOption({
    tooltip: { ...tip, trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "75%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          color: "#6B7C93",
          fontSize: 13,
          formatter: "{b}\n{d}%",
        },
        data: [
          { value: 48, name: "PPT课件", itemStyle: { color: C.work[0] } },
          { value: 26, name: "教案文档", itemStyle: { color: C.work[1] } },
          { value: 18, name: "考试试卷", itemStyle: { color: C.work[2] } },
          { value: 14, name: "课堂练习", itemStyle: { color: C.work[3] } },
        ],
      },
    ],
  });
  ec("ch-d3")?.setOption({
    grid: { top: 28, bottom: 34, left: 56, right: 24 },
    xAxis: {
      type: "category",
      data: ["语文", "数学", "英语", "物理", "化学", "生物"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "bar",
        data: [35, 48, 28, 42, 30, 22],
        barWidth: 28,
        label: {
          show: true,
          position: "top",
          fontSize: 12,
          color: "#6B7C93",
          fontWeight: 600,
        },
        itemStyle: { color: C.work[0], borderRadius: [4, 4, 0, 0] },
      },
    ],
  });

  // 课程表
  const days = ["周一", "周二", "周三", "周四", "周五"],
    slots = ["第1节", "第2节", "第3节", "第4节", "第5节", "第6节", "第7节"];
  const hd = [
    [0, 0, 2],
    [0, 1, 4],
    [0, 2, 0],
    [0, 3, 0],
    [0, 4, 2],
    [0, 5, 0],
    [0, 6, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 2, 3],
    [1, 3, 0],
    [1, 4, 0],
    [1, 5, 1],
    [1, 6, 0],
    [2, 0, 2],
    [2, 1, 0],
    [2, 2, 0],
    [2, 3, 4],
    [2, 4, 0],
    [2, 5, 0],
    [2, 6, 1],
    [3, 0, 0],
    [3, 1, 0],
    [3, 2, 0],
    [3, 3, 0],
    [3, 4, 3],
    [3, 5, 0],
    [3, 6, 0],
    [4, 0, 0],
    [4, 1, 2],
    [4, 2, 0],
    [4, 3, 0],
    [4, 4, 0],
    [4, 5, 0],
    [4, 6, 1],
  ];
  ec("ch-s1")?.setOption({
    grid: { top: 24, bottom: 36, left: 60, right: 16 },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: slots,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 4,
      inRange: { color: ["#EEF1F5", "#CCFBF1", "#5EEAD4", "#0D9488"] },
      textStyle: { color: "#94A3B8", fontSize: 10 },
    },
    series: [
      {
        type: "heatmap",
        data: hd,
        label: { show: false },
        itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 2 },
      },
    ],
    tooltip: { ...tip, position: "top" },
  });
  ec("ch-s2")?.setOption({
    grid: { top: 28, bottom: 28, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["高一", "高二", "高三"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "课时/周",
      nameTextStyle: { color: "#94A3B8", fontSize: 10 },
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: [
          { value: 12, itemStyle: { color: C.sched[0] } },
          { value: 10, itemStyle: { color: C.sched[1] } },
          { value: 8, itemStyle: { color: C.sched[2] } },
        ],
        barWidth: 30,
        borderRadius: [4, 4, 0, 0],
        label: { show: true, position: "top", fontSize: 11, color: "#6B7C93" },
      },
    ],
    tooltip: { ...tip, trigger: "axis" },
  });
  ec("ch-s3")?.setOption({
    series: [
      {
        type: "gauge",
        center: ["50%", "58%"],
        startAngle: 210,
        endAngle: -30,
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [0.65, "#059669"],
              [0.88, "#F59E0B"],
              [1, "#EF4444"],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          fontSize: 24,
          fontWeight: 700,
          color: "#111",
          offsetCenter: [0, "36%"],
          formatter: "65%",
        },
        data: [{ value: 65 }],
      },
    ],
    tooltip: { ...tip, formatter: "学期进度: 65%" },
  });
  ec("ch-s4")?.setOption({
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6B7C93", fontSize: 11 },
    },
    grid: { top: 28, bottom: 36, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: "新授课",
        type: "bar",
        stack: "total",
        barWidth: 26,
        data: [4, 3, 3, 2, 2],
        itemStyle: { color: C.sched[0], borderRadius: [0, 0, 0, 0] },
      },
      {
        name: "复习课",
        type: "bar",
        stack: "total",
        data: [1, 2, 0, 2, 1],
        itemStyle: { color: C.sched[1] },
      },
      {
        name: "实验课",
        type: "bar",
        stack: "total",
        data: [1, 0, 2, 0, 1],
        itemStyle: { color: C.sched[2] },
      },
      {
        name: "其他",
        type: "bar",
        stack: "total",
        data: [0, 1, 1, 0, 2],
        itemStyle: { color: C.sched[3] },
        label: {
          show: true,
          position: "top",
          fontSize: 11,
          fontWeight: 600,
          color: "#6B7C93",
          formatter: (p) => {
            const totals = [6, 6, 6, 4, 6];
            return totals[p.dataIndex] + "节";
          },
        },
      },
    ],
  });
  // 班级
  ec("ch-c1")?.setOption({
    tooltip: { ...tip, trigger: "item" },
    radar: {
      indicator: [
        { name: "基础知识", max: 100 },
        { name: "公式运用", max: 100 },
        { name: "实验探究", max: 100 },
        { name: "综合解题", max: 100 },
        { name: "创新思维", max: 100 },
      ],
      axisName: { color: "#6B7C93", fontSize: 10 },
      splitArea: {
        areaStyle: {
          color: ["rgba(0,119,230,0.02)", "rgba(0,119,230,0.04)"],
        },
      },
      splitLine: { lineStyle: { color: "#EEF1F5" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [88, 72, 65, 58, 70],
            name: "高一(3)班",
            lineStyle: { color: C.cls[0] },
            areaStyle: { color: "rgba(31,108,159,0.1)" },
          },
          {
            value: [70, 65, 80, 60, 75],
            name: "高二(1)班",
            lineStyle: { color: C.cls[1] },
            areaStyle: { color: "rgba(0,194,212,0.1)" },
          },
          {
            value: [85, 80, 78, 75, 82],
            name: "高三(2)班",
            lineStyle: { color: C.cls[2] },
            areaStyle: { color: "rgba(16,185,129,0.1)" },
          },
        ],
      },
    ],
  });
  ec("ch-c2")?.setOption({
    grid: { top: 28, bottom: 36, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["<60", "60-69", "70-79", "80-89", "90-100"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6B7C93", fontSize: 11 },
    },
    series: [
      {
        name: "高一(3)",
        type: "bar",
        barWidth: 12,
        barGap: "30%",
        data: [3, 5, 10, 14, 8],
        itemStyle: { color: C.cls[0], borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "高二(1)",
        type: "bar",
        barWidth: 12,
        data: [5, 8, 12, 8, 5],
        itemStyle: { color: C.cls[1], borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "高三(2)",
        type: "bar",
        barWidth: 12,
        data: [2, 4, 8, 12, 14],
        itemStyle: { color: C.cls[2], borderRadius: [4, 4, 0, 0] },
      },
    ],
  });
  const sct = [
    [92, 88, 35],
    [85, 72, 28],
    [78, 65, 22],
    [65, 50, 15],
    [88, 90, 32],
    [72, 68, 20],
    [58, 42, 10],
    [95, 92, 38],
    [82, 78, 25],
    [76, 70, 18],
    [68, 55, 14],
    [90, 85, 30],
    [60, 48, 12],
    [84, 80, 26],
    [70, 62, 16],
    [55, 38, 8],
    [80, 75, 22],
    [74, 66, 18],
    [62, 52, 12],
    [86, 82, 28],
    [78, 74, 20],
    [92, 88, 34],
    [70, 58, 16],
    [66, 60, 14],
    [88, 84, 30],
    [82, 76, 24],
    [58, 40, 8],
    [94, 90, 36],
    [76, 72, 20],
    [68, 56, 14],
    [84, 78, 22],
    [72, 64, 18],
    [90, 86, 32],
    [62, 54, 12],
    [80, 74, 22],
    [56, 44, 10],
    [86, 80, 26],
    [74, 68, 18],
    [70, 62, 16],
    [92, 86, 30],
  ];
  ec("ch-c3")?.setOption({
    grid: { top: 28, bottom: 32, left: 56, right: 24 },
    xAxis: {
      type: "value",
      name: "参与度 (%)",
      nameTextStyle: { color: "#94A3B8", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "成绩",
      nameTextStyle: { color: "#94A3B8", fontSize: 10 },
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (v) => Math.max(7, Math.min(22, v[2] / 2)),
        data: sct,
        itemStyle: { color: "rgba(0,119,230,0.5)" },
      },
    ],
    tooltip: {
      ...tip,
      trigger: "item",
      formatter: "参与度: {c0}%<br/>成绩: {c1}<br/>练习: {c2}次",
    },
  });
  ec("ch-c4")?.setOption({
    grid: { top: 28, bottom: 36, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["第1次", "第2次", "第3次", "第4次", "第5次", "第6次"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 60,
      max: 100,
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6B7C93", fontSize: 11 },
    },
    series: [
      {
        name: "高一(3)",
        type: "line",
        smooth: true,
        data: [72, 78, 74, 80, 85, 82],
        lineStyle: { color: C.cls[0], width: 2 },
        symbol: "circle",
        symbolSize: 6,
        areaStyle: { color: "rgba(0,119,230,0.05)" },
      },
      {
        name: "高二(1)",
        type: "line",
        smooth: true,
        data: [68, 72, 70, 75, 78, 80],
        lineStyle: { color: C.cls[1], width: 2 },
        symbol: "diamond",
        symbolSize: 6,
        areaStyle: { color: "rgba(0,194,212,0.05)" },
      },
      {
        name: "高三(2)",
        type: "line",
        smooth: true,
        data: [85, 82, 86, 84, 88, 90],
        lineStyle: { color: C.cls[2], width: 2 },
        symbol: "triangle",
        symbolSize: 6,
        areaStyle: { color: "rgba(236,72,153,0.05)" },
      },
    ],
  });

  // 成绩
  ec("ch-g1")?.setOption({
    grid: { top: 28, bottom: 32, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["<60", "60-69", "70-79", "80-89", "90-100"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "bar",
        data: [6, 12, 22, 28, 18],
        barWidth: 28,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: C.grade[0] },
            { offset: 1, color: "rgba(5,150,105,0.35)" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        label: { show: true, position: "top", fontSize: 11, color: "#6B7C93" },
      },
    ],
  });
  ec("ch-g2")?.setOption({
    grid: { top: 28, bottom: 32, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["第1周", "第2周", "第3周", "第4周", "第5周", "第6周"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 60,
      max: 100,
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "line",
        smooth: true,
        data: [72, 75, 80, 78, 83, 86],
        lineStyle: { color: C.grade[0], width: 2.5 },
        areaStyle: { color: "rgba(5,150,105,0.08)" },
        symbol: "diamond",
        symbolSize: 8,
        itemStyle: { color: C.grade[0] },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 80,
              label: {
                formatter: "年级平均 80",
                color: "#94A3B8",
                fontSize: 10,
              },
            },
          ],
          lineStyle: { color: "#D4D1CC", type: "dashed" },
        },
      },
    ],
  });
  ec("ch-g3")?.setOption({
    tooltip: { ...tip, trigger: "item" },
    radar: {
      indicator: [
        { name: "概念理解", max: 100 },
        { name: "公式应用", max: 100 },
        { name: "实验探究", max: 100 },
        { name: "计算能力", max: 100 },
        { name: "分析推理", max: 100 },
      ],
      axisName: { color: "#6B7C93", fontSize: 10 },
      splitArea: {
        areaStyle: { color: ["rgba(5,150,105,0.02)", "rgba(5,150,105,0.04)"] },
      },
      splitLine: { lineStyle: { color: "#EEF1F5" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [85, 72, 68, 78, 82],
            name: "物理",
            lineStyle: { color: C.grade[0] },
            areaStyle: { color: "rgba(5,150,105,0.08)" },
          },
          {
            value: [78, 82, 60, 75, 70],
            name: "数学",
            lineStyle: { color: C.grade[1] },
            areaStyle: { color: "rgba(8,145,178,0.08)" },
          },
        ],
      },
    ],
  });
  ec("ch-g4")?.setOption({
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6B7C93", fontSize: 11 },
    },
    grid: { top: 20, bottom: 36, left: 68, right: 32 },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: [
        "张明远",
        "陈静茹",
        "李华清",
        "王芳菲",
        "刘浩然",
        "赵鹏程",
        "周子轩",
      ],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    series: [
      {
        name: "当前成绩",
        type: "bar",
        data: [92, 88, 85, 78, 72, 65, 58],
        barWidth: 16,
        label: {
          show: true,
          position: "right",
          fontSize: 11,
          color: "#6B7C93",
        },
        itemStyle: { color: C.grade[0], borderRadius: [0, 3, 3, 0] },
      },
      {
        name: "班级均分",
        type: "bar",
        data: [76, 76, 76, 76, 76, 76, 76],
        barWidth: 16,
        barGap: "40%",
        itemStyle: { color: "#EEF1F5", borderRadius: [0, 3, 3, 0] },
      },
    ],
  });

  // 模板
  ec("ch-t1")?.setOption({
    grid: { top: 24, bottom: 28, left: 88, right: 32 },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: [
        "数学复习课",
        "物理新授课",
        "化学实验课",
        "语文精读课",
        "英语听力课",
      ],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: [18, 15, 12, 9, 6],
        barWidth: 16,
        label: {
          show: true,
          position: "right",
          fontSize: 11,
          color: "#6B7C93",
        },
        itemStyle: { color: C.templ[0], borderRadius: [0, 3, 3, 0] },
      },
    ],
    tooltip: { ...tip, trigger: "axis" },
  });
  ec("ch-t2")?.setOption({
    tooltip: { ...tip, trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["42%", "76%"],
        label: {
          show: true,
          color: "#6B7C93",
          fontSize: 12,
          formatter: "{b}\n{d}%",
        },
        data: [
          { value: 60, name: "PPT模板", itemStyle: { color: C.templ[0] } },
          { value: 25, name: "教案模板", itemStyle: { color: C.templ[1] } },
          { value: 15, name: "试卷模板", itemStyle: { color: C.templ[2] } },
        ],
      },
    ],
  });
  ec("ch-t3")?.setOption({
    grid: { top: 28, bottom: 36, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["3月", "4月", "5月", "6月", "7月", "8月"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6B7C93", fontSize: 11 },
    },
    series: [
      {
        type: "line",
        smooth: true,
        data: [8, 12, 15, 18, 14, 10],
        name: "物理新授课",
        lineStyle: { color: C.templ[0], width: 2 },
        symbol: "none",
        areaStyle: { color: "rgba(217,7,6,0.06)" },
      },
      {
        type: "line",
        smooth: true,
        data: [5, 8, 10, 12, 9, 7],
        name: "数学复习课",
        lineStyle: { color: C.templ[1], width: 2 },
        symbol: "none",
        areaStyle: { color: "rgba(234,88,12,0.06)" },
      },
      {
        type: "line",
        smooth: true,
        data: [3, 6, 8, 10, 7, 4],
        name: "化学实验课",
        lineStyle: { color: C.templ[2], width: 2 },
        symbol: "none",
        areaStyle: { color: "rgba(202,138,4,0.06)" },
      },
    ],
  });

  // 设置
  ec("ch-ss")?.setOption({
    tooltip: { ...tip, trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["42%", "76%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          color: "#6B7C93",
          fontSize: 11,
          formatter: "{b}\n{d}%",
        },
        data: [
          { value: 48, name: "课件文件", itemStyle: { color: "#64748B" } },
          { value: 22, name: "学生数据", itemStyle: { color: "#6B7280" } },
          { value: 18, name: "模板资源", itemStyle: { color: "#71717A" } },
          { value: 12, name: "系统缓存", itemStyle: { color: "#A3A3A3" } },
        ],
      },
    ],
  });
  ec("ch-ss2")?.setOption({
    grid: { top: 28, bottom: 32, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#EEF1F5", type: "dashed" } },
      axisLabel: { color: "#6B7C93", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "bar",
        data: [320, 280, 410, 380, 520, 460],
        barWidth: 24,
        label: { show: true, position: "top", fontSize: 10, color: "#6B7C93" },
        itemStyle: { color: "#64748B", borderRadius: [4, 4, 0, 0] },
      },
    ],
  });
}

const onResize = () => charts.forEach((c) => c?.resize());

onMounted(() => {
  nextTick(initCharts);
  window.addEventListener("resize", onResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  disposeAll();
});

// 切换菜单时，等 v-if 渲染出新的 DOM 后再初始化图表
watch(activeMenu, () => {
  nextTick(initCharts);
});

// ── 数据 ──────────────────────────────────
const weekDays = ["周一", "周二", "周三", "周四", "周五"];
const periods = ["第1节", "第2节", "第3节", "第4节", "第5节", "第6节", "第7节"];
const scheduleData = {
  周一: { 第1节: "高一(3)班 物理", 第3节: "高二(1)班 物理" },
  周二: { 第2节: "高一(3)班 物理", 第4节: "高三(2)班 物理" },
  周三: { 第1节: "高一(3)班 物理", 第5节: "教研活动" },
  周四: { 第3节: "高二(1)班 物理", 第6节: "高一(3)班 物理" },
  周五: { 第2节: "高二(1)班 物理", 第4节: "高三(2)班 物理", 第7节: "班会" },
};
const classList = ["高一(3)班", "高二(1)班", "高三(2)班"];
const activeClass = ref("高一(3)班");
const studentData = [
  { name: "张明远", score: 92, trend: "up", status: "优秀" },
  { name: "李华清", score: 85, trend: "up", status: "良好" },
  { name: "王芳菲", score: 78, trend: "stable", status: "中等" },
  { name: "赵鹏程", score: 65, trend: "down", status: "待提高" },
  { name: "陈静茹", score: 88, trend: "up", status: "良好" },
  { name: "刘浩然", score: 72, trend: "stable", status: "中等" },
  { name: "周子轩", score: 58, trend: "down", status: "待提高" },
  { name: "吴婉婷", score: 95, trend: "up", status: "优秀" },
];
const templates = [
  {
    id: "chinese_style",
    name: "中国风模版",
    desc: "水墨古典风格 · 适合语文/政治/文化课",
    type: "PPT",
    used: 23,
  },
  {
    id: "spring",
    name: "春天主题模版",
    desc: "清新自然风格 · 适合生物/地理/科学课",
    type: "PPT",
    used: 18,
  },
  {
    id: "history",
    name: "历史教育模版",
    desc: "古朴厚重风格 · 适合历史/文化类课程",
    type: "PPT",
    used: 15,
  },
  {
    id: "first_class",
    name: "开学第一课模版",
    desc: "通用简洁风格 · 适合数学/英语/理化课",
    type: "PPT",
    used: 21,
  },
  {
    id: "chapter4",
    name: "章节教学模版",
    desc: "结构分明风格 · 适合系统化章节教学",
    type: "PPT",
    used: 12,
  },
  {
    id: "chinese_style",
    name: "语文精读课模版",
    desc: "背景→朗读→分析→拓展·深阅读",
    type: "教案",
    used: 9,
  },
];

// ── 图表解读配置（写死的初始信息，供教师理解每个图的意义） ─────────
const chartInfo = {
  "ch-d1": {
    desc: "统计本周每日课件生成数量，用于观察备课节奏与工作高峰。",
    insight: "周五生成量最高（15 个），周一、周日较少，符合教学周节奏。",
    suggest: "可将需打磨的课件安排在周一/周日低峰期制作，错峰提升质量。",
  },
  "ch-d2": {
    desc: "各类课件的产出占比，反映备课资源的分配结构。",
    insight: "PPT 课件占 45%，是当前主力产出，教案与试卷合计约 40%。",
    suggest: "教案类占比偏低，可尝试用 AI 一键生成配套教案补齐缺口。",
  },
  "ch-d3": {
    desc: "各学科课件生成数量对比，用于发现备课资源覆盖的强弱学科。",
    insight: "数学（48 个）与物理（42 个）产出最高，语文（35 个）偏少。",
    suggest: "语文、生物资源缺口明显，建议优先补充对应学科的专题模板。",
  },
  "ch-s1": {
    desc: "以热力图呈现一周各节次课程安排的密度，辅助排课与教研调度。",
    insight: "周一第 1 节、周三第 2 节课时最集中，下午第 7 节课程最少。",
    suggest: "可将教研活动、公开课试讲安排在课时较少的时段。",
  },
  "ch-s2": {
    desc: "各年级每周课时总量对比，用于评估各年级教学任务的轻重。",
    insight: "高一周课时最多（12 节），高三最少（8 节），总量分布合理。",
    suggest: "高三课时偏少，复习资料与习题可提前规划补足。",
  },
  "ch-s3": {
    desc: "学期教学进度完成情况，对比计划进度判断教学是否滞后。",
    insight: "当前完成 65%，略高于学期时间进度，教学节奏平稳。",
    suggest: "保持当前进度，可将富余时间用于章节复习与查漏补缺。",
  },
  "ch-s4": {
    desc: "每日课程类型构成（新授 / 复习 / 实验 / 其他）及周课时利用率。",
    insight: "周一至周三以新授课为主，周五实验课集中，周课时利用率 82%。",
    suggest: "实验课改到上午效果更佳，可提升学生课堂参与度。",
  },
  "ch-s5": {
    desc: "各天实际课时占计划课时的比例，用于发现利用率偏低的教学日。",
    insight: "周三利用率最高（90%），周二、周四低于 75%，存在课时空档。",
    suggest: "可将课时空档用于答疑或教研活动，提升整体课时利用率。",
  },
  "ch-c1": {
    desc: "以雷达图对比各班级五项核心能力维度，快速定位班级优劣势。",
    insight: "高一（3）班基础知识最强（88），综合解题偏弱（58），维度不均衡。",
    suggest: "建议高一（3）班增加综合题型专项训练，补齐短板。",
  },
  "ch-c2": {
    desc: "各班级成绩分段人数分布，直观反映班级整体水平与分层情况。",
    insight: "高三（2）班 90 分以上人数最多（14 人），且无 60 分以下学生。",
    suggest: "可总结高三（2）班的高分经验，在年级内推广教学方法。",
  },
  "ch-c3": {
    desc: "学生成绩与课堂参与度的散点图，用于发现需要重点关注的学生。",
    insight: "成绩与参与度整体正相关，右下角少数学生参与度低且成绩下滑。",
    suggest: "对参与度低的学生进行个别沟通，必要时安排导师结对帮扶。",
  },
  "ch-c4": {
    desc: "历次考试各班级平均分走势，用于跟踪各班成绩变化与提升幅度。",
    insight: "三个班级成绩均呈上升趋势，高二（1）班提升幅度最大（+12 分）。",
    suggest: "可提炼高二（1）班的教学方法，作为教研组的借鉴案例。",
  },
  "ch-g1": {
    desc: "本次考试各分数段人数分布，用于评估整体成绩形态（正态程度）。",
    insight: "70-89 分中段人数最多（50 人），整体呈正态分布，及格率 86%。",
    suggest: "中段学生提分空间最大，可重点进行中档题强化训练。",
  },
  "ch-g2": {
    desc: "班级平均分近六周的变化趋势，并与年级平均分对比。",
    insight: "班级均分由 72 分稳步升至 86 分，已稳定超过年级平均线。",
    suggest: "关注第 3-4 周的上升放缓节点，避免成绩波动回撤。",
  },
  "ch-g3": {
    desc: "各学科能力维度的雷达对比，用于发现学科内部的薄弱环节。",
    insight: "物理实验探究维度（68）明显弱于概念理解（85），差距最大。",
    suggest: "增加物理实验操作与探究类作业，强化动手实践能力。",
  },
  "ch-g4": {
    desc: "学生个人成绩与班级平均分（76 分）的对比，用于个别学生诊断。",
    insight: "张明远（92 分）领先均分 16 分，周子轩（58 分）低于均分 18 分。",
    suggest: "对落后学生制定一对一提升计划，重点关注弱项学科。",
  },
  "ch-t1": {
    desc: "各课件模板的使用次数排行，反映教师对不同模板的偏好程度。",
    insight: "数学复习课模板使用最多（18 次），是教师最常用模板。",
    suggest: "可将热门模板设为默认推荐，减少教师的搜索成本。",
  },
  "ch-t2": {
    desc: "不同类型模板的占比，用于判断模板资源的供需是否匹配。",
    insight: "PPT 模板占 60%，是核心需求；教案模板仅占 25%。",
    suggest: "补充教案类模板，可覆盖更多备课场景，提升利用率。",
  },
  "ch-t3": {
    desc: "三类模板近六月的使用趋势，用于观察需求的季节性波动。",
    insight: "3 月开学季使用量最高，6 月后明显回落，呈季节性周期。",
    suggest: "可在开学季前提前上新并预热模板，抓住需求高峰。",
  },
  "ch-ss": {
    desc: "存储空间占用分布，用于排查存储瓶颈并规划清理策略。",
    insight: "课件文件占 48%，是主要存储消耗；系统缓存占 12%。",
    suggest: "建议每月清理系统缓存与旧版本课件，释放存储空间。",
  },
  "ch-ss2": {
    desc: "每月系统操作次数，用于观察平台使用活跃度与高峰期。",
    insight: "5 月操作最频繁（520 次），处于教学活跃期；寒假月份明显回落。",
    suggest: "在活跃高峰期前完成系统维护与扩容，保障使用体验。",
  },
};

// ── 设置 ─────────────────────────────────
const profile = ref({
  name: userName.value,
  email: "admin@school.edu.cn",
  phone: "138****5678",
  notifyReview: true,
  notifyGrade: false,
  notifySystem: true,
});

function useTemplate(t) {
  if (t.type === "PPT") {
    // 跳转到课件制作页面，并预选模版
    router.push({ path: "/features", query: { template: t.id, panel: "ppt" } });
  } else {
    router.push({ path: "/features", query: { panel: "doc" } });
  }
}
</script>

<template>
  <div class="admin-shell min-h-screen bg-[#f7f9fc] flex flex-col antialiased">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-[#0077e6] focus:px-3 focus:py-2 focus:rounded-lg focus:shadow-md focus:text-sm"
      >跳到主内容</a
    >
    <!-- 顶栏 -->
    <header
      class="fixed top-0 left-0 right-0 z-50 h-11 bg-white border-b border-gray-100 flex items-center justify-between px-5"
    >
      <h1
        class="text-[13px] uppercase tracking-[0.06em] font-semibold text-gray-400"
      >
        教学管理
      </h1>
      <div class="flex items-center gap-4">
        <span class="text-[13px] text-gray-500">{{ userName }}</span>
        <RouterLink
          to="/"
          class="text-[13px] text-gray-500 hover:text-gray-700 border border-gray-100 rounded-md px-3 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#0077e6]/30 focus-visible:outline-none"
        >
          返回首页
        </RouterLink>
      </div>
    </header>

    <div class="flex pt-11">
      <!-- 侧栏 -->
      <aside
        class="w-44 shrink-0 bg-white border-r border-gray-100 sticky top-11 h-[calc(100vh-44px)] overflow-y-auto p-3"
      >
        <div class="admin-nav-head">管理导航</div>
        <nav class="flex flex-col gap-1">
          <button
            v-for="m in menuItems"
            :key="m.id"
            class="admin-nav-btn"
            :class="{ 'is-active': activeMenu === m.id }"
            @click="activeMenu = m.id"
          >
            <span class="admin-nav-icon">{{ m.icon }}</span>
            <span class="admin-nav-label">{{ m.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- 主区 -->
      <main
        class="flex-1 overflow-y-auto p-5 lg:p-6 flex flex-col gap-4"
        id="main-content"
        aria-labelledby="main-heading"
      >
        <h2 id="main-heading" class="sr-only">管理后台</h2>
        <!-- ═══ 工作台 ═══ -->
        <template v-if="activeMenu === 'dashboard'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              class="admin-card stat-card p-4"
              v-for="(k, i) in [
                { v: '106', l: '总课件数' },
                { v: '42', l: '本月新增' },
                { v: '86.3', l: '平均评分' },
                { v: '12', l: '在教班级' },
              ]"
              :key="i"
            >
              <div class="stat-value">
                {{ k.v }}
              </div>
              <div class="text-[13px] text-gray-500 mt-0.5">{{ k.l }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="admin-card p-5 md:col-span-2">
              <div class="chart-head">
                <h3 class="chart-title">周生成趋势</h3>
                <p class="chart-desc">{{ chartInfo["ch-d1"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-d1"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-d1"].suggest }}</span>
                </p>
              </div>
              <div id="ch-d1" class="h-72"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">课件类型占比</h3>
                <p class="chart-desc">{{ chartInfo["ch-d2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-d2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-d2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-d2" class="h-72"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">学科分布</h3>
                <p class="chart-desc">{{ chartInfo["ch-d3"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-d3"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-d3"].suggest }}</span>
                </p>
              </div>
              <div id="ch-d3" class="h-72"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 课程表 ═══ -->
        <template v-if="activeMenu === 'schedule'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="admin-card stat-card p-5">
              <div class="stat-value">35</div>
              <div class="text-[13px] text-gray-500 mt-0.5">周总课时</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">3</div>
              <div class="text-[13px] text-gray-500 mt-0.5">任教班级</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">65%</div>
              <div class="text-[13px] text-gray-500 mt-0.5">学期进度</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">92%</div>
              <div class="text-[13px] text-gray-500 mt-0.5">出勤率</div>
            </div>
          </div>
          <div class="admin-card p-5">
            <h3 class="text-sm font-semibold text-gray-500 mb-3 text-pretty">
              课程表
            </h3>
            <div class="overflow-x-auto">
              <div
                class="grid"
                style="
                  grid-template-columns: 44px repeat(5, 1fr);
                  gap: 2px;
                  min-width: 400px;
                "
              >
                <div></div>
                <div
                  v-for="d in weekDays"
                  :key="d"
                  class="text-xs font-semibold text-gray-500 text-center py-1"
                >
                  {{ d }}
                </div>
                <template v-for="p in periods" :key="p">
                  <div
                    class="text-xs text-gray-500 flex items-center justify-center"
                  >
                    {{ p }}
                  </div>
                  <div
                    v-for="d in weekDays"
                    :key="d + p"
                    class="min-h-[30px] bg-gray-50 rounded p-1"
                  >
                    <div
                      v-if="scheduleData[d]?.[p]"
                      class="bg-[#0077e6]/10 text-[#0077e6] text-xs font-medium rounded px-1.5 py-0.5 leading-tight"
                    >
                      {{ scheduleData[d][p] }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">每日课程分布</h3>
                <p class="chart-desc">{{ chartInfo["ch-s4"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-s4"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-s4"].suggest }}</span>
                </p>
              </div>
              <div id="ch-s4" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">周课时利用率</h3>
                <p class="chart-desc">{{ chartInfo["ch-s5"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-s5"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-s5"].suggest }}</span>
                </p>
              </div>
              <div class="relative h-[240px]">
                <!-- 背景参考线 -->
                <div
                  class="absolute inset-0 flex flex-col justify-between pointer-events-none"
                >
                  <div class="border-t border-gray-100" style="height: 0"></div>
                  <div class="border-t border-gray-100" style="height: 0"></div>
                  <div class="border-t border-gray-100" style="height: 0"></div>
                  <div class="border-t border-gray-100" style="height: 0"></div>
                  <div
                    class="border-t border-dashed border-gray-200"
                    style="height: 0"
                  ></div>
                </div>
                <!-- 柱子 -->
                <div
                  class="absolute inset-x-0 bottom-0 flex items-end justify-around px-6"
                  style="top: 20px"
                >
                  <div
                    v-for="(v, i) in [85, 72, 90, 68, 78]"
                    :key="i"
                    class="flex flex-col items-center"
                    style="width: 40px"
                  >
                    <span
                      class="text-sm font-semibold mb-1.5"
                      :class="
                        v >= 85
                          ? 'text-teal-700'
                          : v >= 75
                            ? 'text-cyan-700'
                            : 'text-amber-700'
                      "
                      >{{ v }}%</span
                    >
                    <div
                      class="w-full rounded-t transition-opacity duration-300 hover:opacity-80"
                      :style="{
                        height: v * 1.8 + 'px',
                        background: [
                          '#0D9488',
                          '#06B6D4',
                          '#0D9488',
                          '#F59E0B',
                          '#0D9488',
                        ][i],
                      }"
                    ></div>
                  </div>
                </div>
              </div>
              <div
                class="flex justify-around mt-3 pt-2 border-t border-gray-50"
              >
                <span
                  v-for="(day, i) in ['周一', '周二', '周三', '周四', '周五']"
                  :key="i"
                  class="text-xs text-gray-500"
                  style="width: 40px; text-align: center"
                  >{{ day }}</span
                >
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">课时热度</h3>
                <p class="chart-desc">{{ chartInfo["ch-s1"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-s1"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-s1"].suggest }}</span>
                </p>
              </div>
              <div id="ch-s1" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">年级课时分布</h3>
                <p class="chart-desc">{{ chartInfo["ch-s2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-s2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-s2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-s2" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">教学完成度</h3>
                <p class="chart-desc">{{ chartInfo["ch-s3"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-s3"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-s3"].suggest }}</span>
                </p>
              </div>
              <div id="ch-s3" class="h-64"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 班级 ═══ -->
        <template v-if="activeMenu === 'classes'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="admin-card stat-card p-5">
              <div class="stat-value">3</div>
              <div class="text-[13px] text-gray-500 mt-0.5">班级数</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">120</div>
              <div class="text-[13px] text-gray-500 mt-0.5">学生总数</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">81.6</div>
              <div class="text-[13px] text-gray-500 mt-0.5">平均分</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">72%</div>
              <div class="text-[13px] text-gray-500 mt-0.5">平均进度</div>
            </div>
          </div>
          <div
            class="flex gap-1.5 bg-white border border-gray-100 rounded-xl p-1.5 w-fit"
          >
            <button
              v-for="c in classList"
              :key="c"
              class="px-3.5 py-1.5 text-sm rounded-lg text-gray-500 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#0077e6]/30 focus-visible:outline-none"
              :class="{
                '!text-gray-900 !bg-gray-100 font-semibold': activeClass === c,
              }"
              @click="activeClass = c"
            >
              {{ c }}
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">能力对比</h3>
                <p class="chart-desc">{{ chartInfo["ch-c1"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-c1"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-c1"].suggest }}</span>
                </p>
              </div>
              <div id="ch-c1" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">分数段分布</h3>
                <p class="chart-desc">{{ chartInfo["ch-c2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-c2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-c2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-c2" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">成绩·参与度</h3>
                <p class="chart-desc">{{ chartInfo["ch-c3"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-c3"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-c3"].suggest }}</span>
                </p>
              </div>
              <div id="ch-c3" class="h-64"></div>
            </div>
          </div>
          <div class="admin-card p-5">
            <h3 class="text-sm font-semibold text-gray-500 mb-3 text-pretty">
              {{ activeClass }} · 学生成绩
            </h3>
            <div class="text-sm">
              <div
                class="grid grid-cols-[1fr_50px_40px_60px] gap-2 px-2.5 py-2 text-xs font-semibold text-gray-500 border-b border-gray-50"
              >
                <span>姓名</span><span>分数</span
                ><span class="text-center">趋势</span
                ><span class="text-center">等级</span>
              </div>
              <div
                v-for="s in studentData"
                :key="s.name"
                class="grid grid-cols-[1fr_50px_40px_60px] gap-2 px-2.5 py-1.5 hover:bg-gray-50 rounded items-center"
              >
                <span class="text-gray-900 font-medium">{{ s.name }}</span>
                <span
                  class="font-bold"
                  :class="{
                    'text-green-600': s.trend === 'up',
                    'text-amber-600': s.trend === 'stable',
                    'text-red-500': s.trend === 'down',
                  }"
                  >{{ s.score }}</span
                >
                <span class="text-center text-sm">{{
                  { up: "↑", stable: "→", down: "↓" }[s.trend]
                }}</span>
                <span
                  class="text-center text-xs font-semibold px-1.5 py-0.5 rounded-full w-fit justify-self-center"
                  :class="{
                    'bg-green-50 text-green-700':
                      s.status === '优秀' || s.status === '良好',
                    'bg-amber-50 text-amber-700': s.status === '中等',
                    'bg-red-50 text-red-600': s.status === '待提高',
                  }"
                  >{{ s.status }}</span
                >
              </div>
            </div>
          </div>
          <!-- 班级成绩趋势 -->
          <div class="grid grid-cols-1 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">各班级成绩趋势</h3>
                <p class="chart-desc">{{ chartInfo["ch-c4"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-c4"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-c4"].suggest }}</span>
                </p>
              </div>
              <div id="ch-c4" class="h-64"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 成绩 ═══ -->
        <template v-if="activeMenu === 'grades'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="admin-card stat-card p-5">
              <div class="stat-value">86</div>
              <div class="text-[13px] text-gray-500 mt-0.5">最高分</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">72.4</div>
              <div class="text-[13px] text-gray-500 mt-0.5">平均分</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">12.8</div>
              <div class="text-[13px] text-gray-500 mt-0.5">标准差</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">86%</div>
              <div class="text-[13px] text-gray-500 mt-0.5">及格率</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">分数分布</h3>
                <p class="chart-desc">{{ chartInfo["ch-g1"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-g1"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-g1"].suggest }}</span>
                </p>
              </div>
              <div id="ch-g1" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">6周趋势</h3>
                <p class="chart-desc">{{ chartInfo["ch-g2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-g2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-g2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-g2" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">学科能力</h3>
                <p class="chart-desc">{{ chartInfo["ch-g3"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-g3"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-g3"].suggest }}</span>
                </p>
              </div>
              <div id="ch-g3" class="h-64"></div>
            </div>
          </div>
          <div class="admin-card p-5">
            <h3 class="text-sm font-semibold text-gray-500 mb-3 text-pretty">
              成绩明细
            </h3>
            <div class="text-sm">
              <div
                class="grid grid-cols-[1fr_50px_40px_60px_80px] gap-2 px-2.5 py-2 text-xs font-semibold text-gray-500 border-b border-gray-50 items-center"
              >
                <span>姓名</span><span>分数</span><span>趋势</span
                ><span>等级</span><span>薄弱项</span>
              </div>
              <div
                v-for="s in studentData"
                :key="s.name"
                class="grid grid-cols-[1fr_50px_40px_60px_80px] gap-2 px-2.5 py-1.5 hover:bg-gray-50 rounded items-center"
              >
                <span class="text-gray-900 font-medium">{{ s.name }}</span>
                <span
                  class="font-bold"
                  :class="{
                    'text-green-600': s.trend === 'up',
                    'text-amber-600': s.trend === 'stable',
                    'text-red-500': s.trend === 'down',
                  }"
                  >{{ s.score }}</span
                >
                <span class="text-sm">{{
                  { up: "↑", stable: "→", down: "↓" }[s.trend]
                }}</span>
                <span
                  class="text-xs font-semibold px-1.5 py-0.5 rounded-full w-fit"
                  :class="{
                    'bg-green-50 text-green-700':
                      s.status === '优秀' || s.status === '良好',
                    'bg-amber-50 text-amber-700': s.status === '中等',
                    'bg-red-50 text-red-600': s.status === '待提高',
                  }"
                  >{{ s.status }}</span
                >
                <span class="text-gray-500 text-xs">{{
                  s.score < 70 ? "需重点关注" : "—"
                }}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="admin-card p-4 max-w-md mx-auto">
              <div class="chart-head">
                <h3 class="chart-title">学生成绩对比</h3>
                <p class="chart-desc">{{ chartInfo["ch-g4"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-g4"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-g4"].suggest }}</span>
                </p>
              </div>
              <div id="ch-g4" class="h-64"></div>
            </div>
          </div>
        </template>
        <template v-if="activeMenu === 'templates'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="admin-card stat-card p-5">
              <div class="stat-value">6</div>
              <div class="text-[13px] text-gray-500 mt-0.5">模板数</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">67</div>
              <div class="text-[13px] text-gray-500 mt-0.5">总使用</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">11.2</div>
              <div class="text-[13px] text-gray-500 mt-0.5">平均使用</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">5</div>
              <div class="text-[13px] text-gray-500 mt-0.5">PPT模板</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">使用排行</h3>
                <p class="chart-desc">{{ chartInfo["ch-t1"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-t1"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-t1"].suggest }}</span>
                </p>
              </div>
              <div id="ch-t1" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">模板类型</h3>
                <p class="chart-desc">{{ chartInfo["ch-t2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-t2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-t2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-t2" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">月度趋势</h3>
                <p class="chart-desc">{{ chartInfo["ch-t3"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-t3"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-t3"].suggest }}</span>
                </p>
              </div>
              <div id="ch-t3" class="h-64"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              v-for="t in templates"
              :key="t.id"
              class="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-4 hover:border-[#c9d5e3] hover:shadow-[0_4px_16px_rgba(10,15,26,0.06)] transition focus-visible:ring-2 focus-visible:ring-[#0077e6]/30 focus-visible:outline-none text-left"
              @click="useTemplate(t)"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
                :class="
                  t.type === 'PPT'
                    ? 'bg-[#0077e6]/10 text-[#0077e6]'
                    : 'bg-[#059669]/10 text-[#047857]'
                "
              >
                {{ t.type === "PPT" ? "P" : "D" }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900">
                  {{ t.name }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5 truncate">
                  {{ t.desc }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  使用 {{ t.used }} 次 · {{ t.type }}
                </div>
              </div>
            </button>
          </div>
        </template>

        <!-- ═══ 设置 ═══ -->
        <template v-if="activeMenu === 'settings'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="admin-card stat-card p-5">
              <div class="stat-value">106</div>
              <div class="text-[13px] text-gray-500 mt-0.5">课件文件</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">42</div>
              <div class="text-[13px] text-gray-500 mt-0.5">学生数据</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">18</div>
              <div class="text-[13px] text-gray-500 mt-0.5">模板资源</div>
            </div>
            <div class="admin-card stat-card p-5">
              <div class="stat-value">2.4 GB</div>
              <div class="text-[13px] text-gray-500 mt-0.5">总存储</div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="admin-card p-5">
              <h3 class="text-sm font-semibold text-gray-500 mb-3 text-pretty">
                个人信息
              </h3>
              <div class="flex flex-col gap-2">
                <label
                  class="flex items-center gap-4 py-1.5 border-b border-gray-50 focus-within:border-blue-200 transition-colors"
                >
                  <span class="text-[13px] text-gray-500 w-10 shrink-0"
                    >姓名</span
                  ><input
                    v-model="profile.name"
                    name="display_name"
                    autocomplete="name"
                    spellcheck="false"
                    class="flex-1 text-sm text-gray-900 border-0 outline-none bg-transparent focus-visible:outline-none py-0.5"
                  />
                </label>
                <label
                  class="flex items-center gap-4 py-1.5 border-b border-gray-50 focus-within:border-blue-200 transition-colors"
                >
                  <span class="text-[13px] text-gray-500 w-10 shrink-0"
                    >邮箱</span
                  ><input
                    v-model="profile.email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    spellcheck="false"
                    class="flex-1 text-sm text-gray-900 border-0 outline-none bg-transparent focus-visible:outline-none py-0.5"
                  />
                </label>
                <label
                  class="flex items-center gap-4 py-1.5 border-b border-gray-50 focus-within:border-blue-200 transition-colors"
                >
                  <span class="text-[13px] text-gray-500 w-10 shrink-0"
                    >手机</span
                  ><input
                    v-model="profile.phone"
                    type="tel"
                    name="phone"
                    autocomplete="tel"
                    inputmode="numeric"
                    class="flex-1 text-sm text-gray-900 border-0 outline-none bg-transparent focus-visible:outline-none py-0.5"
                  />
                </label>
              </div>
            </div>
            <div class="admin-card p-5">
              <h3 class="text-sm font-semibold text-gray-500 mb-3 text-pretty">
                通知偏好
              </h3>
              <div class="flex flex-col gap-2">
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-sm text-gray-900">课件审核通知</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifyReview"
                    aria-label="课件审核通知"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:bg-[#0077e6] peer-checked:after:translate-x-3"
                  ></span
                ></label>
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-sm text-gray-900">成绩更新通知</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifyGrade"
                    aria-label="成绩更新通知"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:bg-[#0077e6] peer-checked:after:translate-x-3"
                  ></span
                ></label>
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-sm text-gray-900">系统公告</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifySystem"
                    aria-label="系统公告"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:bg-[#0077e6] peer-checked:after:translate-x-3"
                  ></span
                ></label>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">存储使用</h3>
                <p class="chart-desc">{{ chartInfo["ch-ss"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-ss"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-ss"].suggest }}</span>
                </p>
              </div>
              <div id="ch-ss" class="h-64"></div>
            </div>
            <div class="admin-card p-5">
              <div class="chart-head">
                <h3 class="chart-title">月操作频次</h3>
                <p class="chart-desc">{{ chartInfo["ch-ss2"].desc }}</p>
                <p class="chart-insight">
                  <span class="chart-tag">洞察</span>
                  <span>{{ chartInfo["ch-ss2"].insight }}</span>
                </p>
                <p class="chart-suggest">
                  <span class="chart-tag chart-tag--suggest">建议</span>
                  <span>{{ chartInfo["ch-ss2"].suggest }}</span>
                </p>
              </div>
              <div id="ch-ss2" class="h-64"></div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.admin-shell {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}

/* ── 侧边栏 ─────────────────────────── */
.admin-nav-head {
  padding: 2px 10px 10px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(10, 15, 26, 0.08);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition:
    background 0.2s,
    color 0.2s;
}

.admin-nav-btn:hover {
  color: var(--ink);
  background: #f4f6fa;
}

.admin-nav-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.admin-nav-btn.is-active {
  color: var(--accent);
  background: linear-gradient(
    90deg,
    rgba(0, 119, 230, 0.1),
    rgba(0, 194, 212, 0.05)
  );
  font-weight: 700;
}

.admin-nav-btn.is-active::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 9px;
  bottom: 9px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent), var(--cyan));
}

.admin-nav-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: #f1f5f9;
  color: var(--ink-muted);
  transition:
    background 0.2s,
    color 0.2s;
}

.admin-nav-btn.is-active .admin-nav-icon {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 119, 230, 0.3);
}

/* ── 卡片 ───────────────────────────── */
.admin-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.admin-card:hover {
  border-color: var(--border-strong);
}

/* ── 统计卡装饰 ─────────────────────── */
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 119, 230, 0.1), transparent 70%);
  pointer-events: none;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* ── 图表解读头 ─────────────────────── */
.chart-head {
  margin-bottom: 14px;
}

.chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}

.chart-desc {
  font-size: 12px;
  line-height: 1.55;
  color: var(--ink-muted);
  margin-bottom: 8px;
}

.chart-insight,
.chart-suggest {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--ink-soft);
  padding: 6px 9px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.chart-insight {
  background: rgba(0, 119, 230, 0.06);
  border: 1px solid rgba(0, 119, 230, 0.12);
}

.chart-suggest {
  background: rgba(0, 194, 212, 0.05);
  border: 1px solid rgba(0, 194, 212, 0.14);
  margin-bottom: 0;
}

.chart-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 1px;
  color: var(--accent);
  background: rgba(0, 119, 230, 0.12);
}

.chart-tag--suggest {
  color: #0e7f8e;
  background: rgba(0, 194, 212, 0.14);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
</style>
