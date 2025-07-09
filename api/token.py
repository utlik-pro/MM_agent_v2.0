import json
import os
import time
import jwt
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('X-Frame-Options', 'ALLOWALL')
        self.send_header('Content-Security-Policy', 'frame-ancestors *')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests (health check)"""
        try:
            response_data = {
                "status": "ok",
                "service": "livekit-token-service", 
                "timestamp": int(time.time()),
                "method": "GET"
            }
            
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
            self.send_error(500, f"Error: {str(e)}")
    
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
            
            # Response data
            response_data = {
                "token": token,
                "wsUrl": ws_url,
                "identity": identity,
                "room": room,
                "success": True
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