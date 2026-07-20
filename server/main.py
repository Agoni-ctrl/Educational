"""
FastAPI 课件生成服务
====================
启动: uvicorn main:app --reload --port 8000
"""

import sys
import io

# 修复 Windows 中文编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import json
import os
import uuid
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import OUTPUT_DIR, HOST, PORT
from ai_service import generate_ppt_content, generate_doc_content, generate_quiz_content
from file_generator import generate_pptx, generate_docx, generate_quiz_html

app = FastAPI(title="EduAI 课件生成 API", version="1.0.0")

# CORS — 允许前端 dev server 跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 任务存储（内存，生产环境应使用 Redis/DB） ─────────────────
_tasks: dict[str, dict] = {}


def _new_task(task_type: str) -> str:
    task_id = uuid.uuid4().hex[:12]
    _tasks[task_id] = {
        "id": task_id,
        "type": task_type,      # ppt | doc | quiz
        "status": "queued",     # queued → processing → completed / failed
        "progress": 0,
        "stage": "等待处理",
        "filename": None,
        "filepath": None,
        "error": None,
    }
    return task_id


def _update_task(task_id: str, **kwargs):
    if task_id in _tasks:
        _tasks[task_id].update(kwargs)


# ── API: 提交生成任务 ─────────────────────────────────────────

@app.post("/api/courseware/create")
async def create_courseware(
    type: str = Form(...),          # ppt | doc | quiz
    subject: str = Form(...),
    topic: str = Form(...),
    grade: str = Form(""),
    style: str = Form(""),
    outline: str = Form(""),
    requirements: str = Form(""),
    difficulty: str = Form("适中"),
    files: list[UploadFile] = File(default=[]),
):
    """
    提交课件生成任务
    - type: ppt | doc | quiz
    - 文件可选，当前版本暂不处理文件内容（可后续扩展）
    """
    task_id = _new_task(type)
    params = {
        "type": type,
        "subject": subject,
        "topic": topic,
        "grade": grade,
        "style": style,
        "outline": outline,
        "requirements": requirements,
        "difficulty": difficulty,
    }

    # 后台异步执行
    asyncio.create_task(_run_generation(task_id, params))
    return {"taskId": task_id, "status": "queued"}


async def _run_generation(task_id: str, params: dict):
    """后台执行生成流程并逐步推送进度"""
    try:
        _update_task(task_id, status="processing", progress=0, stage="🤖 AI 正在构思课件结构...")
        await asyncio.sleep(0.3)

        # 1. AI 生成内容
        _update_task(task_id, progress=25, stage="📝 调用 AI 生成课件内容...")
        if params["type"] == "ppt":
            content = await generate_ppt_content(
                params["subject"], params["topic"],
                params["grade"], params["style"], params["outline"],
            )
        elif params["type"] == "doc":
            content = await generate_doc_content(
                params["subject"], params["topic"],
                params["grade"], params["requirements"],
            )
        else:
            content = await generate_quiz_content(
                params["subject"], params["topic"],
                params["grade"], params["difficulty"],
            )

        _update_task(task_id, progress=60, stage="🎨 正在渲染文件...")
        await asyncio.sleep(0.2)

        # 2. 渲染文件
        if params["type"] == "ppt":
            filepath, filename = generate_pptx(content)
        elif params["type"] == "doc":
            filepath, filename = generate_docx(content)
        else:
            filepath, filename = generate_quiz_html(content)

        _update_task(task_id, progress=100, stage="✅ 生成完成",
                      status="completed", filename=filename, filepath=filepath)

    except Exception as e:
        _update_task(task_id, status="failed", error=str(e),
                      stage=f"❌ 生成失败: {str(e)[:80]}")


# ── API: 查询任务状态 ─────────────────────────────────────────

@app.get("/api/courseware/{task_id}")
def get_task(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


# ── API: SSE 进度流 ────────────────────────────────────────────

@app.get("/api/courseware/{task_id}/stream")
async def stream_progress(task_id: str):
    """Server-Sent Events 实时推送生成进度"""
    async def event_generator():
        last_progress = -1
        while True:
            task = _tasks.get(task_id)
            if not task:
                yield f"event: error\ndata: {json.dumps({'message': '任务不存在'})}\n\n"
                break

            if task["progress"] != last_progress or task["status"] in ("completed", "failed"):
                data = json.dumps({
                    "status": task["status"],
                    "progress": task["progress"],
                    "stage": task["stage"],
                    "filename": task.get("filename"),
                    "error": task.get("error"),
                }, ensure_ascii=False)
                yield f"event: progress\ndata: {data}\n\n"
                last_progress = task["progress"]

            if task["status"] in ("completed", "failed"):
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── API: 文件下载 ─────────────────────────────────────────────

@app.get("/api/courseware/{task_id}/download")
def download_file(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task["status"] != "completed" or not task.get("filepath"):
        raise HTTPException(status_code=400, detail="文件尚未准备好")
    if not os.path.exists(task["filepath"]):
        raise HTTPException(status_code=404, detail="文件已被清理")

    return FileResponse(
        task["filepath"],
        filename=task["filename"],
        media_type="application/octet-stream",
    )


# ── API: 历史记录 ─────────────────────────────────────────────

@app.get("/api/courseware/list")
def list_tasks():
    return [
        {
            "id": t["id"],
            "type": t["type"],
            "status": t["status"],
            "stage": t["stage"],
            "filename": t.get("filename"),
            "error": t.get("error"),
        }
        for t in sorted(_tasks.values(), key=lambda x: x["id"], reverse=True)
    ]


# ── API: 删除任务 ─────────────────────────────────────────────

@app.delete("/api/courseware/{task_id}")
def delete_task(task_id: str):
    task = _tasks.pop(task_id, None)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    # 清理文件
    fp = task.get("filepath")
    if fp and os.path.exists(fp):
        os.remove(fp)
    return {"ok": True}


# ── 静态文件服务（预览输出目录） ──────────────────────────────

@app.on_event("startup")
def startup():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
