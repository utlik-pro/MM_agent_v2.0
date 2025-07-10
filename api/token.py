import os
import json
import time
import jwt
from http.server import BaseHTTPRequestHandler
import aiohttp
import asyncio

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

    async def dispatch_agent(self, room_name, identity):
        """Dispatch agent to the room"""
        try:
            api_key = os.environ.get("LIVEKIT_API_KEY", "test-key")
            api_secret = os.environ.get("LIVEKIT_API_SECRET", "test-secret")
            ws_url = os.environ.get("LIVEKIT_URL", "wss://test.livekit.cloud")
            
            # Convert wss:// to https:// for API calls
            api_url = ws_url.replace("wss://", "https://").replace("ws://", "http://")
            
            # Create agent dispatch request
            dispatch_url = f"{api_url}/twirp/livekit.AgentDispatchService/CreateDispatch"
            
            # Generate admin token for API access
            now = int(time.time())
            admin_payload = {
                "iss": api_key,
                "sub": "admin",
                "iat": now,
                "exp": now + 300,  # 5 minutes
                "nbf": now,
                "video": {
                    "roomAdmin": True,
                    "room": room_name,
                }
            }
            admin_token = jwt.encode(admin_payload, api_secret, algorithm="HS256")
            
            # Dispatch request payload
            dispatch_data = {
                "room": room_name,
                "agent_name": "voice-assistant",
                "metadata": json.dumps({
                    "user_identity": identity,
                    "dispatch_time": now
                })
            }
            
            headers = {
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
            
            # Make the dispatch request
            async with aiohttp.ClientSession() as session:
                async with session.post(dispatch_url, json=dispatch_data, headers=headers, timeout=5) as resp:
                    if resp.status == 200:
                        print(f"✅ Agent dispatched to room: {room_name}")
                        return True
                    else:
                        error_text = await resp.text()
                        print(f"❌ Failed to dispatch agent: {resp.status} - {error_text}")
                        return False
                        
        except Exception as e:
            print(f"❌ Agent dispatch error: {str(e)}")
            return False
    
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
            room = data.get("room", "test-room")
            
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
            
            # Dispatch agent to room asynchronously
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                agent_dispatched = loop.run_until_complete(self.dispatch_agent(room, identity))
                loop.close()
            except Exception as e:
                print(f"⚠️ Agent dispatch failed: {str(e)}")
                agent_dispatched = False
            
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