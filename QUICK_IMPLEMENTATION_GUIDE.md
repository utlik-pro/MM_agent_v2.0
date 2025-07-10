# Быстрое решение проблемы VPN

## 🚀 Немедленные действия (30 минут)

### 1. CloudFlare CDN (Самое быстрое решение)

```bash
# 1. Зарегистрируйтесь на cloudflare.com
# 2. Добавьте ваш домен
# 3. Измените DNS серверы на CloudFlare
# 4. Включите прокси (оранжевое облако) для всех записей
```

**Настройки в CloudFlare Dashboard:**
- SSL/TLS → Full (strict)
- Speed → Optimization → Auto Minify (все)
- Caching → Cache Level → Standard
- Network → HTTP/3 → On

### 2. Множественные домены

Зарегистрируйте несколько доменов в разных зонах:
```
your-widget.com (основной)
your-widget.app (резервный)  
your-widget.xyz (резервный)
widget-backup.net (резервный)
```

### 3. Альтернативные хостинги

**Быстрый деплой на Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Быстрый деплой на Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 🛠 Средние решения (2-4 часа)

### 1. Настройка fallback эндпоинтов

```javascript
// В вашем виджете добавьте:
const ENDPOINTS = [
  'https://your-primary.com/api/token',
  'https://backup1.your-domain.app/api/token',
  'https://backup2.your-domain.xyz/api/token'
];

async function getTokenWithFallback() {
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: 'voice-room' }),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Endpoint ${endpoint} failed:`, error);
      continue;
    }
  }
  throw new Error('All endpoints failed');
}
```

### 2. CloudFlare Workers прокси

```javascript
// cloudflare-worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Прокси к основному серверу
    const targetUrl = `https://your-main-server.com${url.pathname}`;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Добавляем CORS заголовки
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    return newResponse;
  },
};
```

### 3. Обновленная конфигурация Vercel

```json
{
  "version": 2,
  "regions": ["all"],
  "functions": {
    "api/token.py": {
      "runtime": "python3.9",
      "regions": ["iad1", "fra1", "hkg1", "syd1"]
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "s-maxage=86400" },
        { "key": "X-Frame-Options", "value": "ALLOWALL" }
      ]
    }
  ]
}
```

## 🏗 Долгосрочные решения (1-2 дня)

### 1. Собственные серверы в разных регионах

```yaml
# docker-compose.yml для каждого региона
version: '3.8'
services:
  widget-api:
    image: your-widget:latest
    ports:
      - "80:3000"
    environment:
      - LIVEKIT_URL=wss://region-specific.livekit.cloud
      - REGION=eu-west
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    restart: always
```

### 2. NGINX Load Balancer

```nginx
# nginx.conf
upstream widget_backends {
    server eu.your-domain.com;
    server us.your-domain.com;
    server asia.your-domain.com;
}

server {
    listen 443 ssl;
    server_name widget.your-domain.com;
    
    location / {
        proxy_pass http://widget_backends;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Fallback при недоступности
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    }
}
```

### 3. Мониторинг доступности

```python
# monitor.py
import requests
import time
from datetime import datetime

ENDPOINTS = [
    'https://widget.your-domain.com/api/health',
    'https://backup.your-domain.app/api/health',
    'https://widget-eu.your-domain.com/api/health'
]

def check_endpoints():
    results = {}
    for endpoint in ENDPOINTS:
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=5)
            response_time = time.time() - start_time
            
            results[endpoint] = {
                'status': 'UP' if response.status_code == 200 else 'DOWN',
                'response_time': response_time,
                'timestamp': datetime.now()
            }
        except Exception as e:
            results[endpoint] = {
                'status': 'ERROR',
                'error': str(e),
                'timestamp': datetime.now()
            }
    
    return results

if __name__ == '__main__':
    while True:
        status = check_endpoints()
        print(f"Health check: {status}")
        time.sleep(60)  # Проверка каждую минуту
```

## 📊 Тестирование доступности

### Проверка из разных регионов

```bash
# Используйте VPN или онлайн сервисы для тестирования:

# Россия
curl -H "CF-IPCountry: RU" https://widget.your-domain.com/api/health

# Китай  
curl -H "CF-IPCountry: CN" https://widget.your-domain.com/api/health

# Иран
curl -H "CF-IPCountry: IR" https://widget.your-domain.com/api/health

# Турция
curl -H "CF-IPCountry: TR" https://widget.your-domain.com/api/health
```

### Инструменты для тестирования

- **GTmetrix** - тестирование скорости из разных регионов
- **Pingdom** - мониторинг uptime 
- **StatusCake** - проверка доступности
- **WebPageTest** - тестирование производительности

## 🎯 Рекомендуемая стратегия

### Фаза 1 (Сегодня)
1. ✅ Настроить CloudFlare CDN
2. ✅ Добавить fallback эндпоинты в код
3. ✅ Деплой на 2-3 альтернативных хостингах

### Фаза 2 (На следующей неделе)
1. ✅ Зарегистрировать резервные домены  
2. ✅ Настроить мониторинг
3. ✅ Создать CloudFlare Workers прокси

### Фаза 3 (В перспективе)
1. ✅ Собственные серверы в ключевых регионах
2. ✅ Собственные TURN серверы
3. ✅ Продвинутая балансировка нагрузки

## 🔧 Код для вставки

```html
<!-- Обновленный embed код с fallback -->
<script>
(function() {
  const fallbackDomains = [
    'widget.your-domain.com',
    'widget-backup.your-domain.app', 
    'widget2.your-domain.xyz'
  ];
  
  async function loadWidget() {
    for (const domain of fallbackDomains) {
      try {
        const iframe = document.createElement('iframe');
        iframe.src = `https://${domain}/widget`;
        iframe.style = 'border:0;width:100px;height:50px;position:fixed;bottom:20px;right:20px;z-index:1000;';
        iframe.allow = 'microphone';
        
        // Проверяем загрузку
        await new Promise((resolve, reject) => {
          iframe.onload = resolve;
          iframe.onerror = reject;
          setTimeout(reject, 5000); // 5 секунд таймаут
        });
        
        document.body.appendChild(iframe);
        console.log(`Widget loaded from: ${domain}`);
        break;
      } catch (error) {
        console.warn(`Failed to load from ${domain}:`, error);
        continue;
      }
    }
  }
  
  loadWidget();
})();
</script>
```

Это решение обеспечит доступность вашего voice assistant widget для пользователей в любых регионах без необходимости VPN.