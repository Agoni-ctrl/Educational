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
      "content": ["学科·年级信息", "学校/教师信息"],
      "notes": "讲师备注"
    },
    {
      "type": "section",
      "title": "第一部分：章节标题",
      "content": [],
      "notes": ""
    },
    {
      "type": "content",
      "title": "知识点标题",
      "content": ["要点 1（每条不超过20字）", "要点 2", "要点 3"],
      "notes": "讲师备注"
    },
    {
      "type": "comparison",
      "title": "对比分析标题",
      "content": ["左边要点1", "左边要点2", "右边要点1", "右边要点2"],
      "notes": ""
    },
    {
      "type": "summary",
      "title": "本节课总结",
      "content": ["核心结论 1", "核心结论 2", "核心结论 3"],
      "notes": ""
    }
  ]
}
```

设计原则：
1. 每页 content 最多 5 个要点，每个要点不超过 20 字
2. 封面用 type:title，每部分开头用 type:section 做章节分隔页
3. 总幻灯片数量：12-20 页（含封面、章节分隔页、总结）
4. 内容层次：概念引入 → 知识讲解 → 案例分析 → 互动练习 → 总结
5. type 可选值：title, section, content, comparison, summary
6. 合理设计互动环节（提问、讨论、小练习）
7. 比较页（comparison）内容数量应为偶数，前一半放左边，后一半放右边
8. 总结页用 type:summary，要点前加 ✦ 符号自动渲染"""


# ── 教案生成 Prompt ──────────────────────────────────────────────

DOC_SYSTEM_PROMPT = """你是一位资深教学设计专家，擅长编写高质量的教案文档。

请严格按照以下 JSON 格式返回教案内容，不要包含任何额外文字：

```json
{
  "title": "教案标题",
  "subject": "学科",
  "grade": "年级",
  "duration": "课时时长",
  "teachingGoals": "教学目标1；教学目标2；教学目标3",
  "keyPoints": "重点1；重点2；难点1",
  "sections": [
    {
      "heading": "一、教学导入",
      "content": ["导入方式（3-5分钟）", "引发思考的问题"]
    },
    {
      "heading": "二、新课讲授",
      "content": ["知识点1讲解", "知识点2讲解", "演示/互动环节"]
    },
    {
      "heading": "三、巩固练习",
      "content": ["课堂练习1", "课堂练习2", "小组讨论"]
    },
    {
      "heading": "四、课堂总结",
      "content": ["核心知识回顾", "方法归纳"]
    },
    {
      "heading": "五、作业布置",
      "content": ["必做题", "选做题/拓展题"]
    }
  ]
}
```

设计原则：
1. sections 数量 5-8 个
2. teachingGoals 用半角分号分隔多条目标，keyPoints 用分号分隔重点和难点
3. 教学目标要符合新课标要求，涵盖知识与技能、过程与方法、情感态度价值观
4. 教学过程要详细、可操作，标注时间分配
5. 包含作业布置和板书设计要点"""


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


async def generate_exam_content(
    subject: str, topic: str, grade: str = "",
    difficulty: str = "中等", total_score: int = 100,
    choice_count: int = 10, fill_count: int = 6, essay_count: int = 4,
    generate_ab: bool = False,
) -> dict:
    """生成完整试卷"""
    system_prompt = """你是一个专业的试卷出题专家。请为教师生成一套完整的考试试卷。

要求：
1. 试卷包含三部分：选择题、填空题、解答题
2. 题目难度均衡，覆盖基础知识、综合应用和拓展提高
3. 每道题标注分值
4. 提供参考答案和评分标准
5. 使用JSON格式返回，结构如下：
{
  "title": "试卷标题",
  "subject": "学科",
  "grade": "年级",
  "total_score": 100,
  "duration": "90分钟",
  "sections": [
    {
      "type": "选择题",
      "count": 10,
      "score_per": 3,
      "subtotal": 30,
      "questions": [
        {"id": 1, "content": "题目内容", "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"], "answer": "A", "difficulty": "基础"}
      ]
    },
    {
      "type": "填空题",
      "count": 6,
      "score_per": 4,
      "subtotal": 24,
      "questions": [
        {"id": 1, "content": "题目内容____", "answer": "参考答案", "difficulty": "中等"}
      ]
    },
    {
      "type": "解答题",
      "count": 4,
      "score_per": 10,
      "subtotal": 40,
      "questions": [
        {"id": 1, "content": "题目内容", "answer": "参考答案要点", "difficulty": "提高", "scoring_criteria": "评分标准"}
      ]
    }
  ],
  "answer_key": "简要答案汇总"
}"""
    user_prompt = f"""请为以下考试生成试卷：

学科：{subject}
考试范围：{topic}
年级：{grade or '未指定'}
难度：{difficulty}
总分：{total_score}分
题型配置：选择题{choice_count}题 / 填空题{fill_count}题 / 解答题{essay_count}题
{'需要生成A/B两套卷' if generate_ab else '生成一套试卷'}
"""
    return await call_deepseek(system_prompt, user_prompt)
