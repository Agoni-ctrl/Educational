"""
DeepSeek AI 服务 — 生成课件内容
API 兼容 OpenAI 格式，价格 ¥1/百万 token (输入), ¥2/百万 (输出)
"""

import json
import httpx
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL,
    QWEN_API_KEY, QWEN_BASE_URL, QWEN_MODEL,
)

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


# ── AI 备课助手 Prompt ──────────────────────────────────────────

CHAT_SYSTEM_PROMPT = """你是「知课 AI 备课助手」，一个专为教师备课而生的 AI 教学助理，服务对象是中小学各学科教师。

你的唯一使命：帮教师又快又好地完成备课，大幅节省备课时间。你熟悉本项目的全套教学工具：
- 课件制作：可按学科/学段自动生成 PPT（含精品模版），支持自定义章节大纲、篇幅、讲授风格
- 教案生成：一键生成完整 Word 教案
- 练习与试卷：分层练习、随堂检测、考试试卷生成

回答原则：
1. 聚焦备课：围绕教学目标、重难点、导入、教学过程、板书、作业、课堂互动、出题、考点对接等备课环节，提供可直接落地、明天就能上课堂的内容
2. 先给结果再展开：优先输出可直接复制使用的结构化内容（分点、分步骤），避免空泛套话
3. 主动追问关键信息：当缺少学科、年级、课题、课时长度等影响针对性的信息时，用简短提问补齐，不臆造
4. 身份以用户声明为准，不得自行假定：系统提供的教师画像（学科、任教年级/学段）是用户主动声明的身份，请以此为准。若未提供画像，你**绝不能自行假设**用户的学科、学段或教龄，应先用一两句简短提问确认（如"您是哪个学科、哪个学段？"），再针对性作答；纯通用的教学/备课问题可直接回答
5. 务实老练：像一位有经验、乐于助人的教研组老同事，语气亲和、鼓励，条理清晰
6. 不确定的事实（如具体考点地区差异、教材版本）明确提示核验"""

# 备课任务模式：每个模式为系统提示注入一段定向指令，实现「点击即用、免写 prompt」
TEACHING_MODE_PROMPTS = {
    "goal": """【当前任务：撰写教学目标】请聚焦帮助教师撰写或润色本课的教学目标。
按新课标三维目标（知识与技能、过程与方法、情感态度与价值观）输出，目标须具体、可观测、可量化，避免空泛套话；可给出 2-3 种不同表述风格供教师选择。""",
    "difficulty": """【当前任务：拆解重难点】请聚焦本课的教学重点与教学难点，并补充学生常见易错点、易混点，给出对应的突破策略与讲解建议（如类比、生活化情境、阶梯式提问链）。""",
    "intro": """【当前任务：设计课堂导入】请聚焦设计本课的情境导入方案，给出 2-3 个不同风格（生活情境、问题悬念、复习铺垫、视频/案例）的导入，每个注明建议用时与教师引导语。""",
    "quiz": """【当前任务：分层出题】请聚焦围绕本课知识点设计练习，按基础题/提升题/拓展题分层输出，可含选择题、填空题、简答题，每题附答案与考察点；如适用给出变式题，并提示可能的考试/真题考法。""",
    "lesson": """【当前任务：编写教案】请聚焦输出一份完整、可直接使用的教案，结构须含：教学目标、教学重难点、课时安排、教学准备、教学过程（导入→新授→巩固→总结，标注时间）、板书设计、作业布置、教学反思要点。""",
    "board": """【当前任务：设计板书】请聚焦设计本课的板书框架，输出结构清晰、重点突出的板书布局，可用文字分层示意主板书与副板书，并说明设计意图。""",
    "interact": """【当前任务：设计课堂互动】请聚焦为本课设计 2-3 个课堂互动环节（提问、讨论、小组活动、小游戏、即时反馈等），说明组织方式、建议时长与引导要点，适配对应学段特点。""",
    "exam": """【当前任务：对接考点】请聚焦本课知识点在期中/期末或升学考试中的考查方式，梳理常考题型、高频考点、易错提醒与解题策略；地区差异不确定时提示教师核对本地区考纲。""",
}


def build_teacher_profile_prompt(profile: dict) -> str:
    """将教师主动声明的画像（学科/任教年级学段）注入系统提示，并明确其为用户声明而非 AI 假设"""
    if not profile:
        return ""
    lines = []
    if profile.get("subject"):
        lines.append(f"- 教师学科：{profile['subject']}")
    if profile.get("grade"):
        lines.append(f"- 任教年级/学段：{profile['grade']}")
    if not lines:
        return ""
    return (
        "该用户已主动声明以下教学身份（以此为准，这不是你自行假设的）：\n"
        + "\n".join(lines)
    )


async def chat_with_qwen(
    messages: list, mode: str = "", profile: dict | None = None
) -> str:
    """AI 备课助手：调用 Qwen（百炼 OpenAI 兼容接口），支持备课任务模式与教师画像"""
    if not QWEN_API_KEY:
        raise RuntimeError("未设置 QWEN_API_KEY，无法使用 AI 备课助手")

    system_prompt = CHAT_SYSTEM_PROMPT
    profile_prompt = build_teacher_profile_prompt(profile or {})
    if profile_prompt:
        system_prompt += "\n\n" + profile_prompt
    mode_prompt = TEACHING_MODE_PROMPTS.get(mode or "", "")
    if mode_prompt:
        system_prompt += "\n\n" + mode_prompt

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{QWEN_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {QWEN_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": QWEN_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    *messages,
                ],
                "temperature": 0.7,
                "max_tokens": 2048,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
