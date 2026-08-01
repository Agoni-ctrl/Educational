from flask import Flask, request, jsonify
from flask_cors import CORS
from dashscope import Generation
import os

app = Flask(__name__)
CORS(app)  # 允许Vue前端跨域访问

# 从环境变量读取API Key
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY")

if not DASHSCOPE_API_KEY:
    print("⚠️ 警告: 未设置 DASHSCOPE_API_KEY 环境变量")
    print("请先运行: set DASHSCOPE_API_KEY=你的新Key")

# 通义千问AI诈助手的系统提示词 
SYSTEM_PROMPT = """你是专业教学智能体，主要为师生提供课程咨询、学习答疑、学习方案规划、课堂实训指导与学习相关建议。你的工作内容：1. 根据学习需求匹配适配学习资源、教学案例；2. 结合学习时长、基础水平、学习人数、预算规划学习安排；3. 讲解知识点、实训操作、课程作业、课堂活动与实操方法；4. 提供实用学习建议，包含课前预习、资料查找、时间安排、易错点提醒；5. 用户提供信息不足时，主动引导补充学习科目、学习时长、自身基础、学习目标等关键信息。回复要求：简洁清晰、重点突出，优先给出可直接使用的方案与建议，语言自然专业，贴合真实课堂与自主学习场景，不写空洞内容；涉及课程安排、考核要求、资源开放时效等变动信息，需提醒用户以学校、老师官方通知为准。"""

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        history = data.get('history', [])
        
        # 构建消息列表
        messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
        
        # 添加最近10条历史消息（让AI记住上下文）
        for msg in history[-10:]:
            if msg.get('content'):
                messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        # 调用通义千问API
        response = Generation.call(
            model="qwen-plus",
            messages=messages,
            api_key=DASHSCOPE_API_KEY,
            result_format='message',
            temperature=0.7,
            max_tokens=2000
        )
        
        # 检查API调用是否成功
        if response.status_code == 200:
            ai_reply = response.output.choices[0].message.content
            
            # 检测用户消息的风险等级
            risk_level = detect_risk_level(user_message)
            
            return jsonify({
                'success': True,
                'reply': ai_reply,
                'riskLevel': risk_level
            })
        else:
            return jsonify({
                'success': False,
                'error': f'API错误: {response.status_code}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def detect_risk_level(message):
    """检测消息的风险等级"""
    high_keywords = ['转账', '汇款', '验证码', '安全账户', '共享屏幕', '保证金']
    medium_keywords = ['链接', '刷单', '兼职', '投资', '贷款', '中奖']
    
    for kw in high_keywords:
        if kw in message:
            return 'high'
    for kw in medium_keywords:
        if kw in message:
            return 'medium'
    return None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)