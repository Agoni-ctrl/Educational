---
name: teaching-ai-platform
description: Designs and builds the multimodal AI interactive teaching agent platform (多模态AI互动式教学智能体). Use when creating pages, components, copy, or UX for this Vue project, including homepage, core features, AI assistant, community, and about sections. Enforces Simplified Chinese UI copy and teacher-centric closed-loop workflow messaging.
---

# 多模态 AI 互动式教学智能体 — 项目 Skill

## 项目定位

面向**中国大学生服务外包创新创业大赛**的课件共创系统。核心目标：构建以**教师教学思路**为驱动、具备深度互动与多模态解析/生成能力的教学智能体，让教师从繁琐课件制作中解放，回归「教学设计师」角色。

## 导航结构（固定五项）

| 序号 | 导航项 | 路由 | 说明 |
|------|--------|------|------|
| 1 | 首页 | `/` | 仅 Hero 单页 |
| 2 | 核心功能 | `/features` | 左侧导航工作台 |
| 3 | AI 助手 | `/assistant` | 对话式交互 |
| 4 | 社区 | `/community` | 教师交流 |
| 5 | 关于我们 | `/about` | 项目背景与团队 |

导航配置：`src/config/nav.js`  
共用组件：`src/components/layout/SiteNav.vue`

## 文案与语言规范

- **全部使用简体中文**，禁止繁体字
- 受众为**中小学教师、高校教师**
- 品牌名：**智课 Agent**

## 页面清单

| 路由 | 组件 | 状态 |
|------|------|------|
| `/` | `MainHome.vue` | Hero 单页 |
| `/features` | `FeaturesView.vue` | 已完成 |
| `/assistant` | `AssistantView.vue` | 已完成 |
| `/community` | `CommunityView.vue` | 已完成 |
| `/about` | `AboutView.vue` | 已完成 |

## 视觉与设计（配合 frontend-design）

- OpenAI 式极简：大留白、浅色科技风、动态渐变背景
- 字体：**Sora** + **IBM Plex Sans**
- 禁止传统后台 UI 风格

## 智能体四大能力

| 能力 | 说明 |
|------|------|
| **理解意图** | 多轮对话确认教学目标、知识点、讲授逻辑 |
| **融合多模态参考** | PDF/Word/视频/图片提取与融合 |
| **生成课件初稿** | PPT、Word 教案、互动创意 |
| **支持迭代优化** | 互动→生成→反馈→再生成闭环 |

## 技术约束

- Vue 3 `<script setup>` + Vite + Vue Router
- 数据层：localStorage（`useCommunity.js` / `useAssistant.js` / `useFeatures.js`）
- 通义 API 预留：`sendToTongyi()` in `useAssistant.js`

## 核心功能模块 `/features`

左侧导航：工作台概览 · 课件生成 · 教案生成 · 互动创意 · 意图理解 · 多模态参考 · 可视化 · 历史记录 · 迭代优化

## AI 助手模块 `/assistant`

双栏：会话历史 + 对话区。API 预留 `sendToTongyi()`。

## 社区模块 `/community`

点赞 · 收藏 · 评论 · 分享 · 发布话题

## 关于我们 `/about`

项目背景 · 问题陈述 · 四大能力 · 理念 · 团队 · 大赛信息
