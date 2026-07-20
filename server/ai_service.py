"""
DeepSeek AI 服务 — 生成课件内容
API 兼容 OpenAI 格式，价格 ¥1/百万 token (输入), ¥2/百万 (输出)
"""

import json
import httpx
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL

# ── PPT 课件生成 Prompt ──────────────────────────────────────────

PPT_SYSTEM_PROMPT = """你是一位拥有 15 年经验的教学课件设计专家，擅长将学科知识转化为逻辑清晰、视觉美观的课件内容。

请严格按照以下 JSON 格式返回课件内容，不要包含任何额外文字或 markdown 标记：

```json
{
  "title": "课件主标题",
  "subtitle": "副标题（可选）",
  "style": "整体风格描述",
  "slides": [
    {
      "type": "title",
      "title": "封面标题",
      "content": ["演讲者/单位信息"],
      "notes": "讲师备注"
    },
    {
      "type": "content",
      "title": "幻灯片标题",
      "content": ["要点 1", "要点 2", "要点 3"],
      "notes": "讲师备注"
    },
    {
      "type": "comparison",
      "title": "对比幻灯片标题",
      "content": ["左侧要点", "右侧要点"],
      "notes": ""
    },
    {
      "type": "summary",
      "title": "总结标题",
      "content": ["核心 1", "核心 2", "核心 3"],
      "notes": ""
    }
  ]
}
```

设计原则：
1. 每页 content 最多 5 个要点，每个要点不超过 20 字
2. 总幻灯片数量：10-18 页（包含封面和总结）
3. 内容要有层次：概念引入 → 知识讲解 → 案例分析 → 互动练习 → 总结
4. type 可选值：title, content, comparison, summary
5. 合理设计互动环节（提问、讨论、小练习）"""


# ── 教案生成 Prompt ──────────────────────────────────────────────

DOC_SYSTEM_PROMPT = """你是一位资深教学设计专家，擅长编写高质量的教案文档。

请严格按照以下 JSON 格式返回教案内容，不要包含任何额外文字：

```json
{
  "title": "教案标题",
  "subject": "学科",
  "grade": "年级",
  "duration": "课时时长",
  "sections": [
    {
      "heading": "一、教学目标",
      "content": ["知识与技能目标", "过程与方法目标", "情感态度与价值观目标"]
    },
    {
      "heading": "二、教学重点难点",
      "content": ["教学重点", "教学难点"]
    },
    {
      "heading": "三、教学过程",
      "content": ["导入环节（5分钟）", "新课讲授（20分钟）", "课堂练习（10分钟）", "总结提升（5分钟）"]
    }
  ]
}
```

设计原则：
1. sections 数量 5-8 个
2. 教学目标要符合新课标要求
3. 教学过程要详细、可操作
4. 包含作业布置和板书设计"""


# ── 题目生成 Prompt ──────────────────────────────────────────────

QUIZ_SYSTEM_PROMPT = """你是一位经验丰富的学科命题专家。

请严格按照以下 JSON 格式返回题目内容：

```json
{
  "title": "练习标题",
  "questions": [
    {
      "type": "choice",
      "question": "题目内容",
      "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
      "answer": "A",
      "analysis": "解析内容"
    },
    {
      "type": "fill",
      "question": "填空题内容____",
      "answer": "参考答案",
      "analysis": "解析内容"
    },
    {
      "type": "essay",
      "question": "简答题内容",
      "answer": "参考答案要点",
      "analysis": "评分标准"
    }
  ]
}
```

设计原则：
1. 题目总数 8-15 道，包含选择、填空、简答三种题型
2. 难度循序渐进：基础题 60% + 提高题 30% + 拓展题 10%
3. 答案准确，解析详细"""


async def call_deepseek(system_prompt: str, user_prompt: str) -> dict:
    """调用 DeepSeek API 生成内容"""
    if not DEEPSEEK_API_KEY:
        raise RuntimeError(
            "⚠️  未设置 DEEPSEEK_API_KEY\n"
            "请前往 https://platform.deepseek.com/ 注册获取 API Key，"
            "然后在终端执行:\n"
            "  $env:DEEPSEEK_API_KEY='sk-你的key'"
        )

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 8192,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]

    # 提取 JSON（AI 有时会包裹 markdown 代码块）
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        content = content.rsplit("```", 1)[0]
    return json.loads(content.strip())


async def generate_ppt_content(
    subject: str, topic: str, grade: str = "", style: str = "", outline: str = ""
) -> dict:
    """生成 PPT 课件内容"""
    user_prompt = f"""请为以下课程设计 PPT 课件内容：

学科：{subject}
课题：{topic}
年级：{grade or '未指定'}
风格偏好：{style or '简洁专业'}
大纲方向：{outline or '由你自由设计'}
"""
    return await call_deepseek(PPT_SYSTEM_PROMPT, user_prompt)


async def generate_doc_content(
    subject: str, topic: str, grade: str = "", requirements: str = ""
) -> dict:
    """生成教案文档内容"""
    user_prompt = f"""请为以下课程编写完整教案：

学科：{subject}
课题：{topic}
年级：{grade or '未指定'}
其他要求：{requirements or '无'}
"""
    return await call_deepseek(DOC_SYSTEM_PROMPT, user_prompt)


async def generate_quiz_content(
    subject: str, topic: str, grade: str = "", difficulty: str = "适中"
) -> dict:
    """生成教学练习题"""
    user_prompt = f"""请为以下课程生成练习题：

学科：{subject}
课题：{topic}
年级：{grade or '未指定'}
难度：{difficulty}
"""
    return await call_deepseek(QUIZ_SYSTEM_PROMPT, user_prompt)
