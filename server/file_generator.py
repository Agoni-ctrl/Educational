"""
文件生成器 — 将 AI 生成的结构化内容渲染为 PPTX / DOCX 文件
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from docx import Document
from docx.shared import Pt as DocxPt, RGBColor as DocxRGB, Inches as DocxInches
from docx.enum.text import WD_ALIGN_PARAGRAPH

from config import OUTPUT_DIR

# ════════════════════════════════════════════════════════════════
# 配色方案
# ════════════════════════════════════════════════════════════════

THEMES = {
    "default": {
        "primary": RGBColor(0x1E, 0x40, 0xAF),     # 深蓝
        "secondary": RGBColor(0x3B, 0x82, 0xF6),    # 亮蓝
        "accent": RGBColor(0x0B, 0xC5, 0xEA),       # 青色
        "bg": RGBColor(0xF8, 0xFA, 0xFC),           # 浅灰背景
        "text": RGBColor(0x1E, 0x29, 0x3B),         # 深灰
        "white": RGBColor(0xFF, 0xFF, 0xFF),
        "light_bg": RGBColor(0xE8, 0xF0, 0xFE),    # 浅蓝底
    },
}


def _set_slide_bg(slide, color: RGBColor):
    """设置幻灯片背景色"""
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _add_text_box(slide, left, top, width, height, text, font_size=18,
                  bold=False, color=None, alignment=PP_ALIGN.LEFT):
    """在幻灯片上添加文本框"""
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color or THEMES["default"]["text"]
    p.alignment = alignment
    return txBox


def _add_bullet_list(slide, left, top, width, height, items,
                     font_size=16, color=None):
    """添加要点列表"""
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    tf = txBox.text_frame
    tf.word_wrap = True

    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"▸  {item}"
        p.font.size = Pt(font_size)
        p.font.color.rgb = color or THEMES["default"]["text"]
        p.space_after = Pt(6)
        p.level = 0

    return txBox


# ════════════════════════════════════════════════════════════════
# PPTX 生成
# ════════════════════════════════════════════════════════════════

def generate_pptx(content: dict) -> str:
    """根据 AI 生成的内容创建 PPTX 文件"""
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    theme = THEMES["default"]
    slides_data = content.get("slides", [])

    for idx, slide_data in enumerate(slides_data):
        slide_type = slide_data.get("type", "content")
        slide_title = slide_data.get("title", "")
        slide_content = slide_data.get("content", [])
        slide_notes = slide_data.get("notes", "")

        slide = prs.slides.add_slide(prs.slide_layouts[6])  # 空白布局

        if slide_type == "title":
            # 封面页 — 居中大标题
            _set_slide_bg(slide, theme["primary"])
            # 主标题
            _add_text_box(slide, 1.5, 2.0, 10.3, 1.5, slide_title,
                          font_size=40, bold=True,
                          color=theme["white"], alignment=PP_ALIGN.CENTER)
            # 副标题/内容
            if slide_content:
                _add_text_box(slide, 1.5, 3.8, 10.3, 1.0,
                              "\n".join(slide_content) if isinstance(slide_content, list) else slide_content,
                              font_size=18, color=RGBColor(0xD0, 0xE0, 0xFF),
                              alignment=PP_ALIGN.CENTER)
            # 底部装饰线
            _add_text_box(slide, 5.5, 5.5, 2.3, 0.08, "━" * 10,
                          font_size=14, color=theme["accent"],
                          alignment=PP_ALIGN.CENTER)

        elif slide_type == "summary":
            # 总结页
            _set_slide_bg(slide, RGBColor(0xF0, 0xF4, 0xFF))
            _add_text_box(slide, 1.0, 0.6, 11.3, 0.8, slide_title,
                          font_size=30, bold=True, color=theme["primary"],
                          alignment=PP_ALIGN.CENTER)
            if slide_content:
                _add_bullet_list(slide, 3.0, 1.8, 7.3, 4.5, slide_content,
                                 font_size=20, color=theme["text"])

        else:
            # 普通内容页
            _set_slide_bg(slide, theme["bg"])
            # 顶部标题栏
            _add_text_box(slide, 0, 0, 13.333, 1.2, "",
                          font_size=10, color=theme["bg"])
            # 装饰条
            bar = slide.shapes.add_shape(
                1, Inches(0), Inches(0), Inches(13.333), Inches(0.08)
            )
            bar.fill.solid()
            bar.fill.fore_color.rgb = theme["secondary"]
            bar.line.fill.background()

            # 标题
            _add_text_box(slide, 0.8, 0.3, 11.7, 0.8, slide_title,
                          font_size=28, bold=True, color=theme["primary"])

            if slide_type == "comparison" and len(slide_content) >= 2:
                # 对比布局
                mid = len(slide_content) // 2
                left_items = slide_content[:mid]
                right_items = slide_content[mid:]
                _add_bullet_list(slide, 0.8, 1.5, 5.5, 5.0, left_items,
                                 font_size=16)
                _add_bullet_list(slide, 7.0, 1.5, 5.5, 5.0, right_items,
                                 font_size=16)
            else:
                # 标准布局
                _add_bullet_list(slide, 0.8, 1.5, 11.7, 5.0, slide_content,
                                 font_size=18)

        # 备注
        if slide_notes:
            notes_slide = slide.notes_slide
            notes_slide.notes_text_frame.text = slide_notes

    # 保存
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{content.get('title', '课件')}.pptx"
    filepath = os.path.join(OUTPUT_DIR, filename)
    prs.save(filepath)
    return filepath, filename


# ════════════════════════════════════════════════════════════════
# DOCX 生成
# ════════════════════════════════════════════════════════════════

def generate_docx(content: dict) -> str:
    """根据 AI 生成的教案内容创建 DOCX 文件"""
    doc = Document()

    # 标题
    title = doc.add_heading(content.get("title", "教案"), level=0)
    for run in title.runs:
        run.font.color.rgb = DocxRGB(0x1E, 0x40, 0xAF)

    # 基本信息
    info = doc.add_paragraph()
    info.alignment = WD_ALIGN_PARAGRAPH.LEFT
    info.add_run(f"学科：{content.get('subject', '')}    ").font.size = DocxPt(11)
    info.add_run(f"年级：{content.get('grade', '')}    ").font.size = DocxPt(11)
    info.add_run(f"课时：{content.get('duration', '')}").font.size = DocxPt(11)

    doc.add_paragraph()  # 空行

    # 各章节
    for section in content.get("sections", []):
        heading = section.get("heading", "")
        doc.add_heading(heading, level=1)

        for item in section.get("content", []):
            p = doc.add_paragraph(item, style="List Bullet")
            p.paragraph_format.space_after = DocxPt(4)

    # 保存
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{content.get('title', '教案')}.docx"
    filepath = os.path.join(OUTPUT_DIR, filename)
    doc.save(filepath)
    return filepath, filename


# ════════════════════════════════════════════════════════════════
# HTML 题目生成
# ════════════════════════════════════════════════════════════════

def generate_quiz_html(content: dict) -> str:
    """生成教学题 HTML 页面（可直接预览）"""
    html_parts = [f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>{content.get('title', '练习题')}</title>
<style>
  body {{ font-family: "PingFang SC","Microsoft YaHei",sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }}
  h1 {{ color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }}
  .question {{ margin: 24px 0; padding: 16px 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6; }}
  .q-type {{ display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #dbeafe; color: #1e40af; margin-bottom: 8px; }}
  .options {{ margin: 8px 0 0 20px; }}
  .answer {{ margin-top: 8px; padding: 8px 14px; background: #f0fdf4; border-radius: 8px; color: #166534; display: none; }}
  .show-btn {{ padding: 4px 12px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }}
</style></head>
<body>
<h1>{content.get('title', '练习题')}</h1>
<p style="color: #64748b;">共 {len(content.get('questions', []))} 题</p>
"""]

    for i, q in enumerate(content.get("questions", []), 1):
        q_type = {"choice": "选择题", "fill": "填空题", "essay": "简答题"}.get(q.get("type", ""), "其他")
        html_parts.append(f'<div class="question">')
        html_parts.append(f'<span class="q-type">{q_type}</span>')
        html_parts.append(f'<p><strong>{i}. {q["question"]}</strong></p>')

        if q.get("options"):
            html_parts.append('<div class="options">')
            for opt in q["options"]:
                html_parts.append(f'<p>{opt}</p>')
            html_parts.append('</div>')

        html_parts.append(f'<button class="show-btn" onclick="this.nextElementSibling.style.display=\'block\';this.style.display=\'none\'">显示答案</button>')
        html_parts.append(f'<div class="answer"><strong>答案：</strong>{q["answer"]}<br><strong>解析：</strong>{q.get("analysis", "")}</div>')
        html_parts.append('</div>')

    html_parts.append("</body></html>")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{content.get('title', '练习题')}.html"
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(html_parts))
    return filepath, filename


if __name__ == "__main__":
    # 测试用
    test = {
        "title": "牛顿第二定律",
        "slides": [
            {"type": "title", "title": "牛顿第二定律", "content": ["高中物理 · 必修一"], "notes": ""},
            {"type": "content", "title": "复习回顾", "content": ["什么是力？", "牛顿第一定律", "加速度的概念"], "notes": ""},
            {"type": "content", "title": "实验探究", "content": ["控制变量法", "质量一定时：a ∝ F", "力一定时：a ∝ 1/m"], "notes": ""},
            {"type": "summary", "title": "本节课总结", "content": ["F = ma", "矢量性：a 与 F 同向", "瞬时性：F 变则 a 变"], "notes": ""},
        ],
    }
    path, name = generate_pptx(test)
    print(f"✅ 已生成: {path}")
