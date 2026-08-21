import os

# AI 配置 —— 使用 DeepSeek API（最便宜的中文大模型）
# 注册获取 API Key: https://platform.deepseek.com/
# ==================================================================
# 优先级：环境变量 > 下方硬编码（方便本地开发）
# ==================================================================
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") or "sk-5626e12ffd214f87ac62f15e3adf35a7"

DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"  # DeepSeek-V3

# 服务配置
HOST = "0.0.0.0"
PORT = 8000
BASE_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
DATA_DIR = os.path.join(BASE_DIR, "data")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")  # 任务记录持久化文件
MAX_FILE_SIZE_MB = 50
