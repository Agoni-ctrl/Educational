import os

# AI 配置 —— 使用 DeepSeek API（最便宜的中文大模型）
# 注册获取 API Key: https://platform.deepseek.com/
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"  # DeepSeek-V3

# 服务配置
HOST = "0.0.0.0"
PORT = 8000
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
MAX_FILE_SIZE_MB = 50
