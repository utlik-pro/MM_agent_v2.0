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
        identity = data.get("identity", f"user-{int(time.time())}")
        room = data.get("room", f"room-{int(time.time())}")
        
        # Валидация входных данных
        if not identity or not room:
            return web.json_response(
                {"error": "identity и room обязательны"}, 
                status=400
            )
        
        print(f"🎫 Creating token for user '{identity}' in room '{room}'")
        
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
        
        print(f"✅ Token created successfully for room: {room}")
        
        return web.json_response({
            "token": token, 
            "wsUrl": WS_URL,
            "identity": identity,
            "room": room,
            "agent_dispatch": "automatic"  # Indicate that agent will auto-dispatch
        })
        
    except Exception as e:
        print(f"❌ Error creating token: {str(e)}")
        return web.json_response(
            {"error": f"Ошибка создания токена: {str(e)}"}, 
            status=500
        )

async def health_check(request):
    """Проверка работоспособности сервера"""
    return web.json_response({"status": "ok", "service": "livekit-agent"})

async def entrypoint(ctx):
    print(f"🏠 Agent connecting to room: {ctx.room.name}")
    print(f"🆔 Room metadata: {ctx.room.metadata}")
    print(f"👥 Current participants: {len(ctx.room.remote_participants)}")
    
    # Validate room name format for debugging
    if ctx.room.name.startswith('session-'):
        print(f"✅ Detected user session room: {ctx.room.name}")
    elif ctx.room.name.startswith('room-'):
        print(f"✅ Detected auto-generated room: {ctx.room.name}")
    else:
        print(f"ℹ️  Custom room name: {ctx.room.name}")
    
    session = AgentSession()

    # Create assistant instance for this specific room
    assistant = Assistant()
    
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    print(f"✅ Agent successfully joined room: {ctx.room.name}")
    
    # Set up room event monitoring
    def on_participant_connected(participant):
        print(f"👤 New participant joined room {ctx.room.name}: {participant.identity}")
        
    def on_participant_disconnected(participant):
        print(f"👋 Participant left room {ctx.room.name}: {participant.identity}")
    
    # Subscribe to room events
    ctx.room.on("participant_connected", on_participant_connected)
    ctx.room.on("participant_disconnected", on_participant_disconnected)
    
    await ctx.connect()

    # Personalized greeting based on room
    room_specific_instructions = f"""
{SESSION_INSTRUCTIONS}

Вы подключились к комнате: {ctx.room.name}
Это ваша персональная сессия с пользователем.
Вы находитесь в изолированной комнате - никто другой не может слышать этот разговор.
"""

    print(f"🤖 Starting conversation in room: {ctx.room.name}")
    
    await session.generate_reply(
        instructions=SESSION_INSTRUCTIONS,
    )

class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=AGENT_INSTRUCTIONS,
            llm=google.beta.realtime.RealtimeModel(voice="Aoede", temperature=0.0)
        )
        self.current_room = None
        
    async def on_room_joined(self, room):
        """Called when agent joins a room"""
        self.current_room = room.name
        print(f"🎉 Assistant successfully joined room: {room.name}")
        print(f"📊 Room info - Participants: {len(room.remote_participants)}")
        
        # Set room-specific context
        if hasattr(room, 'metadata') and room.metadata:
            print(f"📋 Room metadata: {room.metadata}")
            
    async def on_participant_connected(self, participant):
        """Called when a participant connects to the room"""
        print(f"👤 Participant connected: {participant.identity} to room: {self.current_room}")
        
    async def on_participant_disconnected(self, participant):
        """Called when a participant disconnects from the room"""
        print(f"👋 Participant disconnected: {participant.identity} from room: {self.current_room}")
        
    def get_room_context(self):
        """Get current room context for responses"""
        return f"Текущая комната: {self.current_room}" if self.current_room else "Комната не определена"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "http":
        # HTTP режим для локальной разработки
        app = web.Application(middlewares=[cors_middleware])
        app.router.add_post('/api/token', get_token)
        app.router.add_get('/health', health_check)
        
        print("🚀 LiveKit Agent HTTP сервер запускается...")
        print(f"🔗 URL: http://0.0.0.0:8765")
        print(f"🎯 LiveKit URL: {WS_URL}")
        print("📋 Поддерживаемые функции:")
        print("  • Генерация токенов для динамических комнат")
        print("  • Автоматическая диспетчеризация агентов")
        print("  • Изоляция пользователей по комнатам")
        
        web.run_app(app, port=8765, host='0.0.0.0')
    else:
        # Агент режим для продакшена (Dokploy)
        print("🚀 LiveKit Agent запускается...")
        print(f"🎯 LiveKit URL: {WS_URL}")
        print("🏠 Готов обрабатывать динамические комнаты:")
        print("  • session-* (уникальные сессии пользователей)")
        print("  • room-* (автоматически сгенерированные комнаты)")
        print("  • любые другие имена комнат")
        print("👂 Ожидание подключений к комнатам...")
        
        agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

