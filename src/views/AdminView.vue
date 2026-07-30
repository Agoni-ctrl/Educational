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
const tx = { color: "#787774", fontSize: 11, fontFamily: "system-ui" };
function noAxis() {
  return {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: tx,
  };
}
function splitY() {
  return {
    splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
    axisLabel: tx,
  };
}
const tip = {
  backgroundColor: "#fff",
  borderColor: "#EAEAEA",
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
    cls: ["#7C3AED", "#D946EF", "#EC4899", "#6366F1", "#A855F7"],
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
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
          color: "#787774",
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: slots,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 4,
      inRange: { color: ["#F0EFEC", "#CCFBF1", "#5EEAD4", "#0D9488"] },
      textStyle: { color: "#A8A6A1", fontSize: 10 },
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "课时/周",
      nameTextStyle: { color: "#A8A6A1", fontSize: 10 },
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
        label: { show: true, position: "top", fontSize: 11, color: "#787774" },
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
      textStyle: { color: "#787774", fontSize: 11 },
    },
    grid: { top: 28, bottom: 36, left: 52, right: 24 },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
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
      axisName: { color: "#787774", fontSize: 10 },
      splitArea: {
        areaStyle: {
          color: ["rgba(124,58,237,0.02)", "rgba(124,58,237,0.04)"],
        },
      },
      splitLine: { lineStyle: { color: "#F0EFEC" } },
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
            areaStyle: { color: "rgba(52,101,56,0.1)" },
          },
          {
            value: [85, 80, 78, 75, 82],
            name: "高三(2)班",
            lineStyle: { color: C.cls[2] },
            areaStyle: { color: "rgba(91,75,158,0.1)" },
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#787774", fontSize: 11 },
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
      nameTextStyle: { color: "#A8A6A1", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "成绩",
      nameTextStyle: { color: "#A8A6A1", fontSize: 10 },
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (v) => Math.max(7, Math.min(22, v[2] / 2)),
        data: sct,
        itemStyle: { color: "rgba(124,58,237,0.5)" },
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 60,
      max: 100,
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#787774", fontSize: 11 },
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
        areaStyle: { color: "rgba(124,58,237,0.05)" },
      },
      {
        name: "高二(1)",
        type: "line",
        smooth: true,
        data: [68, 72, 70, 75, 78, 80],
        lineStyle: { color: C.cls[1], width: 2 },
        symbol: "diamond",
        symbolSize: 6,
        areaStyle: { color: "rgba(217,70,239,0.05)" },
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
        label: { show: true, position: "top", fontSize: 11, color: "#787774" },
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 60,
      max: 100,
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
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
                color: "#A8A6A1",
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
      axisName: { color: "#787774", fontSize: 10 },
      splitArea: {
        areaStyle: { color: ["rgba(5,150,105,0.02)", "rgba(5,150,105,0.04)"] },
      },
      splitLine: { lineStyle: { color: "#F0EFEC" } },
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
      textStyle: { color: "#787774", fontSize: 11 },
    },
    grid: { top: 20, bottom: 36, left: 68, right: 32 },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#787774", fontSize: 11 },
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
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
      axisLabel: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
        },
        itemStyle: { color: C.grade[0], borderRadius: [0, 3, 3, 0] },
      },
      {
        name: "班级均分",
        type: "bar",
        data: [76, 76, 76, 76, 76, 76, 76],
        barWidth: 16,
        barGap: "40%",
        itemStyle: { color: "#F0EFEC", borderRadius: [0, 3, 3, 0] },
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
      axisLabel: { color: "#787774", fontSize: 11 },
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
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
      axisLabel: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
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
          color: "#787774",
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    legend: {
      show: true,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#787774", fontSize: 11 },
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
          color: "#787774",
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
      axisLabel: { color: "#787774", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#F0EFEC", type: "dashed" } },
      axisLabel: { color: "#787774", fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: { ...tip, trigger: "axis" },
    series: [
      {
        type: "bar",
        data: [320, 280, 410, 380, 520, 460],
        barWidth: 24,
        label: { show: true, position: "top", fontSize: 10, color: "#787774" },
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
    id: "t1",
    name: "物理新授课模板",
    desc: "导入→探究→应用→总结·四段式",
    type: "PPT",
    used: 15,
  },
  {
    id: "t2",
    name: "数学复习课模板",
    desc: "梳理→典例→变式→检测·四环节",
    type: "PPT",
    used: 18,
  },
  {
    id: "t3",
    name: "化学实验课模板",
    desc: "目的→步骤→观察→结论·全流程",
    type: "PPT",
    used: 12,
  },
  {
    id: "t4",
    name: "语文精读课模板",
    desc: "背景→朗读→分析→拓展·深阅读",
    type: "教案",
    used: 9,
  },
  {
    id: "t5",
    name: "英语听力课模板",
    desc: "预听→精听→模仿→输出·沉浸式",
    type: "PPT",
    used: 6,
  },
  {
    id: "t6",
    name: "生物探究课模板",
    desc: "现象→假设→验证→结论·探究式",
    type: "教案",
    used: 7,
  },
];

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
  console.log("使用模板:", t.name);
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F6F3] flex flex-col font-sans antialiased">
    <!-- 顶栏 -->
    <header
      class="fixed top-0 left-0 right-0 z-50 h-11 bg-white border-b border-gray-100 flex items-center justify-between px-5"
    >
      <div class="flex items-center gap-2">
        <span
          class="text-xs uppercase tracking-[0.06em] font-semibold text-gray-400"
          >教学管理</span
        >
      </div>
      <div class="flex items-center gap-4">
        <span class="text-[11px] text-gray-500">{{ userName }}</span>
        <button
          @click="router.push('/')"
          class="text-[11px] text-gray-500 hover:text-gray-700 border border-gray-100 rounded-md px-3 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none"
        >
          返回首页
        </button>
      </div>
    </header>

    <div class="flex pt-11">
      <!-- 侧栏 -->
      <aside
        class="w-36 shrink-0 bg-white border-r border-gray-100 sticky top-11 h-[calc(100vh-44px)] overflow-y-auto p-2.5"
      >
        <nav class="flex flex-col gap-0.5">
          <button
            v-for="m in menuItems"
            :key="m.id"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none"
            :class="{
              '!text-blue-700 !bg-blue-50/60 font-semibold':
                activeMenu === m.id,
            }"
            @click="activeMenu = m.id"
          >
            <span
              class="font-bold tracking-tight text-[10px] w-4 text-center shrink-0"
              >{{ m.icon }}</span
            >
            <span>{{ m.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- 主区 -->
      <main class="flex-1 overflow-y-auto p-5 lg:p-6 flex flex-col gap-4">
        <!-- ═══ 工作台 ═══ -->
        <template v-if="activeMenu === 'dashboard'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              class="bg-white border border-gray-100 rounded-xl p-4"
              v-for="(k, i) in [
                { v: '106', l: '总课件数' },
                { v: '42', l: '本月新增' },
                { v: '86.3', l: '平均评分' },
                { v: '12', l: '在教班级' },
              ]"
              :key="i"
            >
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                {{ k.v }}
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">{{ k.l }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              class="bg-white border border-gray-100 rounded-xl p-5 md:col-span-2"
            >
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                周生成趋势
              </h3>
              <div id="ch-d1" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                课件类型占比
              </h3>
              <div id="ch-d2" class="h-80"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">学科分布</h3>
              <div id="ch-d3" class="h-80"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 课程表 ═══ -->
        <template v-if="activeMenu === 'schedule'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                35
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">周总课时</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                3
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">任教班级</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                65%
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">学期进度</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                92%
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">出勤率</div>
            </div>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-5">
            <h3 class="text-xs font-semibold text-gray-400 mb-3">课程表</h3>
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
                  class="text-[10px] font-semibold text-gray-400 text-center py-1"
                >
                  {{ d }}
                </div>
                <template v-for="p in periods" :key="p">
                  <div
                    class="text-[10px] text-gray-400 flex items-center justify-center"
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
                      class="bg-blue-50 text-blue-700 text-[10px] font-medium rounded px-1.5 py-0.5 leading-tight"
                    >
                      {{ scheduleData[d][p] }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                每日课程分布
              </h3>
              <div id="ch-s4" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-semibold text-gray-400">
                  周课时利用率
                </h3>
                <span class="text-[10px] text-gray-400"
                  >实际课时 / 计划课时</span
                >
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
                      class="text-xs font-semibold mb-1.5"
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
                      class="w-full rounded-t transition-all duration-300 hover:opacity-80"
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
                  class="text-[10px] text-gray-400"
                  style="width: 40px; text-align: center"
                  >{{ day }}</span
                >
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">课时热度</h3>
              <div id="ch-s1" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                年级课时分布
              </h3>
              <div id="ch-s2" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                教学完成度
              </h3>
              <div id="ch-s3" class="h-80"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 班级 ═══ -->
        <template v-if="activeMenu === 'classes'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                3
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">班级数</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                120
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">学生总数</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                81.6
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">平均分</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                72%
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">平均进度</div>
            </div>
          </div>
          <div
            class="flex gap-1.5 bg-white border border-gray-100 rounded-xl p-1.5 w-fit"
          >
            <button
              v-for="c in classList"
              :key="c"
              class="px-3.5 py-1.5 text-xs rounded-lg text-gray-400 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none"
              :class="{
                '!text-gray-900 !bg-gray-100 font-semibold': activeClass === c,
              }"
              @click="activeClass = c"
            >
              {{ c }}
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">能力对比</h3>
              <div id="ch-c1" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                分数段分布
              </h3>
              <div id="ch-c2" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                成绩·参与度
              </h3>
              <div id="ch-c3" class="h-80"></div>
            </div>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-5">
            <h3 class="text-xs font-semibold text-gray-400 mb-3">
              {{ activeClass }} · 学生成绩
            </h3>
            <div class="text-xs">
              <div
                class="grid grid-cols-[1fr_50px_40px_60px] gap-2 px-2.5 py-2 text-[10px] font-semibold text-gray-400 border-b border-gray-50"
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
                  class="text-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit justify-self-center"
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
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">
                各班级成绩趋势
              </h3>
              <div id="ch-c4" class="h-80"></div>
            </div>
          </div>
        </template>

        <!-- ═══ 成绩 ═══ -->
        <template v-if="activeMenu === 'grades'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                86
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">最高分</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                72.4
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">平均分</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                12.8
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">标准差</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                86%
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">及格率</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">分数分布</h3>
              <div id="ch-g1" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">6周趋势</h3>
              <div id="ch-g2" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">学科能力</h3>
              <div id="ch-g3" class="h-80"></div>
            </div>
          </div>
          <div class="bg-white border border-gray-100 rounded-xl p-5">
            <h3 class="text-xs font-semibold text-gray-400 mb-3">成绩明细</h3>
            <div class="text-xs">
              <div
                class="grid grid-cols-[1fr_50px_40px_60px_80px] gap-2 px-2.5 py-2 text-[10px] font-semibold text-gray-400 border-b border-gray-50 items-center"
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
                  class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit"
                  :class="{
                    'bg-green-50 text-green-700':
                      s.status === '优秀' || s.status === '良好',
                    'bg-amber-50 text-amber-700': s.status === '中等',
                    'bg-red-50 text-red-600': s.status === '待提高',
                  }"
                  >{{ s.status }}</span
                >
                <span class="text-gray-400 text-[10px]">{{
                  s.score < 70 ? "需重点关注" : "—"
                }}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div
              class="bg-white border border-gray-100 rounded-xl p-4 max-w-md mx-auto"
            >
              <h3 class="text-xs font-semibold text-gray-400 mb-2 text-center">
                学生成绩对比
              </h3>
              <div id="ch-g4" class="h-80"></div>
            </div>
          </div>
        </template>
        <template v-if="activeMenu === 'templates'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                6
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">模板数</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                67
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">总使用</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                11.2
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">平均使用</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                4
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">PPT模板</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">使用排行</h3>
              <div id="ch-t1" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">模板类型</h3>
              <div id="ch-t2" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2">月度趋势</h3>
              <div id="ch-t3" class="h-80"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              v-for="t in templates"
              :key="t.id"
              class="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none text-left"
              @click="useTemplate(t)"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                :class="
                  t.type === 'PPT'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-green-50 text-green-700'
                "
              >
                {{ t.type === "PPT" ? "P" : "D" }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-gray-900">
                  {{ t.name }}
                </div>
                <div class="text-[10px] text-gray-400 mt-0.5 truncate">
                  {{ t.desc }}
                </div>
                <div class="text-[10px] text-gray-400 mt-0.5">
                  使用 {{ t.used }} 次 · {{ t.type }}
                </div>
              </div>
            </button>
          </div>
        </template>

        <!-- ═══ 设置 ═══ -->
        <template v-if="activeMenu === 'settings'">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                106
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">课件文件</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                42
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">学生数据</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                18
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">模板资源</div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <div class="text-2xl font-bold text-gray-900 tracking-tight">
                2.4 GB
              </div>
              <div class="text-[11px] text-gray-500 mt-0.5">总存储</div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-3">个人信息</h3>
              <div class="flex flex-col gap-2">
                <div
                  class="flex items-center gap-4 py-1.5 border-b border-gray-50"
                >
                  <span class="text-[11px] text-gray-500 w-10 shrink-0"
                    >姓名</span
                  ><input
                    v-model="profile.name"
                    class="flex-1 text-xs text-gray-900 border-0 outline-none bg-transparent"
                  />
                </div>
                <div
                  class="flex items-center gap-4 py-1.5 border-b border-gray-50"
                >
                  <span class="text-[11px] text-gray-500 w-10 shrink-0"
                    >邮箱</span
                  ><input
                    v-model="profile.email"
                    class="flex-1 text-xs text-gray-900 border-0 outline-none bg-transparent"
                  />
                </div>
                <div class="flex items-center gap-4 py-1.5">
                  <span class="text-[11px] text-gray-500 w-10 shrink-0"
                    >手机</span
                  ><input
                    v-model="profile.phone"
                    class="flex-1 text-xs text-gray-900 border-0 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-3">通知偏好</h3>
              <div class="flex flex-col gap-2">
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-xs text-gray-900">课件审核通知</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifyReview"
                    aria-label="课件审核通知"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-3"
                  ></span
                ></label>
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-xs text-gray-900">成绩更新通知</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifyGrade"
                    aria-label="成绩更新通知"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-3"
                  ></span
                ></label>
                <label
                  class="flex items-center justify-between py-1.5 cursor-pointer"
                  ><span class="text-xs text-gray-900">系统公告</span
                  ><input
                    type="checkbox"
                    v-model="profile.notifySystem"
                    aria-label="系统公告"
                    class="peer sr-only" /><span
                    class="w-7 h-4 bg-gray-200 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-3"
                  ></span
                ></label>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2 text-center">
                存储使用
              </h3>
              <div id="ch-ss" class="h-80"></div>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <h3 class="text-xs font-semibold text-gray-400 mb-2 text-center">
                月操作频次
              </h3>
              <div id="ch-ss2" class="h-80"></div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 所有样式已使用 Tailwind utility classes，此处为最小化自定义 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
</style>
