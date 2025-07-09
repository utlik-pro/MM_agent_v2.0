from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (noise_cancellation,)
from livekit.plugins import google

from prompts import AGENT_INSTRUCTIONS, SESSION_INSTRUCTIONS
import os
from aiohttp import web
import jwt
import time

load_dotenv()

@web.middleware
async def cors_middleware(request, handler):
    if request.method == 'OPTIONS':
        # Preflight CORS request
        resp = web.Response()
    else:
        resp = await handler(request)
    
    # Улучшенные CORS заголовки
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    resp.headers['Access-Control-Allow-Credentials'] = 'false'  # Изменено на false для безопасности
    
    # Заголовки для iframe
    resp.headers['X-Frame-Options'] = 'ALLOWALL'
    resp.headers['Content-Security-Policy'] = "frame-ancestors *"
    
    # Кэширование для токенов
    if request.path == '/get-token':
        resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        resp.headers['Pragma'] = 'no-cache'
        resp.headers['Expires'] = '0'
    
    return resp

API_KEY = os.environ["LIVEKIT_API_KEY"]
API_SECRET = os.environ["LIVEKIT_API_SECRET"]
WS_URL = os.environ["LIVEKIT_URL"]

async def get_token(request):
    try:
        data = await request.json()
        identity = data.get("identity", "user123")
        room = data.get("room", "test-room")
        
        # Валидация входных данных
        if not identity or not room:
            return web.json_response(
                {"error": "identity и room обязательны"}, 
                status=400
            )
        
        now = int(time.time())
        ttl = 60 * 60  # 1 час

        # Правильный формат токена для LiveKit
        payload = {
            "iss": API_KEY,
            "sub": identity,
            "room": room,
            "exp": now + ttl,
            "iat": now,
            "nbf": now,
            "video": {
                "room": room,
                "roomJoin": True,
                "canPublish": True,
                "canSubscribe": True,
            },
        }
        
        token = jwt.encode(payload, API_SECRET, algorithm="HS256")
        
        return web.json_response({
            "token": token, 
            "wsUrl": WS_URL,
            "identity": identity,
            "room": room
        })
        
    except Exception as e:
        return web.json_response(
            {"error": f"Ошибка создания токена: {str(e)}"}, 
            status=500
        )

async def health_check(request):
    """Проверка работоспособности сервера"""
    return web.json_response({"status": "ok", "service": "livekit-agent"})

async def entrypoint(ctx):
    session = AgentSession()

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions=SESSION_INSTRUCTIONS,
    )

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=AGENT_INSTRUCTIONS,
            llm=google.beta.realtime.RealtimeModel(voice="Aoede", temperature=0.0)
        )

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "http":
        app = web.Application(middlewares=[cors_middleware])
        app.router.add_post('/get-token', get_token)
        app.router.add_get('/health', health_check)
        
        print("🚀 LiveKit Agent HTTP сервер запускается...")
        print(f"🔗 URL: http://0.0.0.0:8765")
        print(f"🎯 LiveKit URL: {WS_URL}")
        
        web.run_app(app, port=8765, host='0.0.0.0')
    else:
        agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

