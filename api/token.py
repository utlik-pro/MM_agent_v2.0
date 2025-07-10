import os
import json
import time
import jwt
import uuid
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests (health check)"""
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            self.end_headers()
            
            response_data = {
                "status": "ok",
                "message": "LiveKit Token Server is running",
                "service": "mm-agent-v2.0"
            }
            
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    # REMOVED: dispatch_agent method - was causing duplicate agents
    # LiveKit automatically dispatches agents for new rooms, no manual dispatch needed
    
    def do_POST(self):
        """Handle POST requests (token generation)"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
            
            # Parse JSON data
            try:
                data = json.loads(post_data.decode('utf-8')) if post_data else {}
            except json.JSONDecodeError:
                data = {}
            
            # Extract parameters
            identity = data.get("identity", f"user-{int(time.time())}")
            # Generate unique room name if not provided
            room = data.get("room", f"room-{uuid.uuid4().hex[:12]}")
            
            # Log the room assignment for debugging
            print(f"🏠 Room assignment: {room} for identity: {identity}")
            
            # Get environment variables
            api_key = os.environ.get("LIVEKIT_API_KEY", "test-key")
            api_secret = os.environ.get("LIVEKIT_API_SECRET", "test-secret")
            ws_url = os.environ.get("LIVEKIT_URL", "wss://test.livekit.cloud")
            
            # Generate token
            now = int(time.time())
            ttl = 60 * 60  # 1 hour
            
            payload = {
                "iss": api_key,
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
            
            token = jwt.encode(payload, api_secret, algorithm="HS256")
            
            # Agent will be automatically dispatched by LiveKit when user connects
            # No need for manual dispatch - this was causing duplicate agents
            agent_dispatched = "automatic"
            
            # Response data
            response_data = {
                "token": token,
                "wsUrl": ws_url,
                "identity": identity,
                "room": room,
                "success": True,
                "agent_dispatched": agent_dispatched
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            self.send_header('X-Frame-Options', 'ALLOWALL')
            self.send_header('Content-Security-Policy', 'frame-ancestors *')
            self.end_headers()
            
            response_json = json.dumps(response_data)
            self.wfile.write(response_json.encode('utf-8'))
            
        except Exception as e:
            error_response = {
                "error": f"Ошибка создания токена: {str(e)}",
                "success": False
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            self.end_headers()
            
            self.wfile.write(json.dumps(error_response).encode('utf-8')) 