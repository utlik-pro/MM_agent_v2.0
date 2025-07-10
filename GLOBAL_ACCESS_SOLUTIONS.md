# Решения для глобального доступа без VPN

## Проблема
Пользователи не могут получить доступ к voice assistant widget без VPN из-за региональных блокировок.

## Архитектурные решения

### 1. Многорегиональное развертывание

#### CloudFlare как CDN и прокси
```yaml
# cloudflare-config.yml
proxied_domains:
  - your-domain.com
  - widget.your-domain.com
  
geo_routing:
  - region: "europe"
    server: "eu.your-domain.com"
  - region: "asia" 
    server: "asia.your-domain.com"
  - region: "americas"
    server: "us.your-domain.com"
```

#### Альтернативные хостинг-провайдеры
- **Netlify** - хорошая глобальная доступность
- **Railway** - альтернатива Vercel
- **DigitalOcean App Platform** - множественные регионы
- **AWS CloudFront** + Lambda@Edge

### 2. LiveKit альтернативы и конфигурация

#### Собственные TURN/STUN серверы
```javascript
// Добавить в livekit-client.ts
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    // Добавить собственные TURN серверы
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

#### Множественные LiveKit инстансы
```typescript
// lib/livekit-fallback.ts
const LIVEKIT_ENDPOINTS = [
  'wss://your-primary.livekit.cloud',
  'wss://your-fallback.livekit.cloud', 
  'wss://your-alternative.livekit.cloud'
];

export async function connectWithFallback(token: string) {
  for (const endpoint of LIVEKIT_ENDPOINTS) {
    try {
      const room = await connect(endpoint, token);
      return room;
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }
  throw new Error('All LiveKit endpoints failed');
}
```

### 3. Прокси и туннелирование

#### Websocket прокси на бэкенде
```python
# api/livekit-proxy.py
import websockets
import asyncio
from http.server import BaseHTTPRequestHandler

class WebSocketProxy(BaseHTTPRequestHandler):
    async def proxy_websocket(self, target_url, client_ws):
        """Проксирует WebSocket соединения к LiveKit"""
        try:
            async with websockets.connect(target_url) as target_ws:
                await asyncio.gather(
                    self.forward_messages(client_ws, target_ws),
                    self.forward_messages(target_ws, client_ws)
                )
        except Exception as e:
            print(f"Proxy error: {e}")
    
    async def forward_messages(self, source, target):
        async for message in source:
            await target.send(message)
```

#### HTTP API прокси для токенов
```python
# api/token-proxy.py
import requests
import os

def get_token_from_alternative_source():
    """Получение токена через альтернативные источники"""
    alternative_endpoints = [
        "https://backup-livekit.your-domain.com/token",
        "https://alternative-server.com/livekit/token", 
        "https://proxy.your-domain.com/api/token"
    ]
    
    for endpoint in alternative_endpoints:
        try:
            response = requests.post(endpoint, json={"room": "voice-room"})
            if response.status_code == 200:
                return response.json()
        except:
            continue
    
    return None
```

### 4. Собственный домен и DNS

#### Настройка поддоменов
```
widget.yourdomain.com → основной виджет
api.yourdomain.com → API эндпоинты  
backup.yourdomain.com → резервный сервер
tunnel.yourdomain.com → туннелирование
```

#### DNS маршрутизация по геолокации
```dns
; Основная запись
widget.yourdomain.com. IN A 1.2.3.4

; Региональные записи
widget-eu.yourdomain.com. IN A 5.6.7.8
widget-asia.yourdomain.com. IN A 9.10.11.12
widget-us.yourdomain.com. IN A 13.14.15.16
```

### 5. Адаптивный код виджета

#### Автоматическое определение доступности
```typescript
// components/adaptive-widget.tsx
import { useState, useEffect } from 'react';

const WIDGET_ENDPOINTS = [
  'https://widget.yourdomain.com',
  'https://widget-backup.yourdomain.com',
  'https://alternative.yourdomain.com'
];

export function AdaptiveWidget() {
  const [availableEndpoint, setAvailableEndpoint] = useState<string | null>(null);
  
  useEffect(() => {
    async function findAvailableEndpoint() {
      for (const endpoint of WIDGET_ENDPOINTS) {
        try {
          const response = await fetch(`${endpoint}/api/health`, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
          });
          if (response.ok) {
            setAvailableEndpoint(endpoint);
            break;
          }
        } catch {
          continue;
        }
      }
    }
    
    findAvailableEndpoint();
  }, []);
  
  return availableEndpoint ? (
    <CallWidget apiEndpoint={availableEndpoint} />
  ) : (
    <div>Подключение...</div>
  );
}
```

#### Обнаружение блокировок
```typescript
// lib/connection-detector.ts
export async function detectConnectionIssues() {
  const tests = [
    () => fetch('https://8.8.8.8', { mode: 'no-cors' }),
    () => fetch('https://cloudflare.com', { mode: 'no-cors' }),
    () => fetch('https://www.google.com', { mode: 'no-cors' })
  ];
  
  const results = await Promise.allSettled(tests.map(test => test()));
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  return {
    isBlocked: successCount < 2,
    needsFallback: successCount === 0
  };
}
```

### 6. Альтернативные транспорты

#### WebRTC через HTTP polling
```typescript
// lib/http-transport.ts
export class HttpPollingTransport {
  private pollInterval: NodeJS.Timeout | null = null;
  
  async startPolling(apiEndpoint: string) {
    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${apiEndpoint}/poll`, {
          method: 'POST',
          body: JSON.stringify({ lastMessageId: this.lastMessageId })
        });
        const data = await response.json();
        this.handleIncomingMessages(data.messages);
      } catch (error) {
        console.warn('Polling failed:', error);
      }
    }, 1000);
  }
  
  async sendMessage(message: any) {
    await fetch(`${this.apiEndpoint}/send`, {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }
}
```

## Реализация решений

### Быстрое решение (1-2 дня)

1. **Настройка CloudFlare**
   - Добавить домен в CloudFlare
   - Включить прокси для всех записей
   - Настроить кэширование статических ресурсов

2. **Деплой на альтернативных платформах**
   ```bash
   # Netlify
   npm run build
   npx netlify deploy --prod --dir=dist
   
   # Railway
   railway login
   railway deploy
   ```

3. **Добавление fallback логики в виджет**

### Долгосрочное решение (1-2 недели)

1. **Собственная инфраструктура**
   - VPS в разных регионах
   - Load balancer
   - Собственные TURN серверы

2. **Мониторинг доступности**
   - Uptime проверки из разных регионов
   - Автоматическое переключение на резервные серверы

## Тестирование решений

```bash
# Тест доступности из разных регионов
curl -H "CF-IPCountry: CN" https://widget.yourdomain.com/api/health
curl -H "CF-IPCountry: RU" https://widget.yourdomain.com/api/health
curl -H "CF-IPCountry: IR" https://widget.yourdomain.com/api/health

# Тест WebRTC соединения
node test-webrtc-connectivity.js --region=restricted
```

## Мониторинг и аналитика

```typescript
// lib/analytics.ts
export function trackAccessAttempt(region: string, success: boolean, method: string) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      region,
      success,
      method,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    })
  });
}
```

Это позволит отслеживать эффективность различных методов обхода блокировок в разных регионах.