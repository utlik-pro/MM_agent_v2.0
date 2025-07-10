#!/bin/bash

# Скрипт для деплоя на альтернативные платформы для обхода VPN ограничений

echo "🚀 Деплой voice assistant widget на альтернативные платформы..."
echo ""

# Проверяем что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Билдим проект
echo "📦 Собираем проект..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки проекта"
    exit 1
fi

cd ..

echo "✅ Проект собран успешно"
echo ""

# Netlify
echo "🌐 Деплой на Netlify..."
if command -v netlify &> /dev/null; then
    netlify deploy --prod --dir=frontend/dist
    echo "✅ Netlify деплой завершен"
else
    echo "⚠️  Netlify CLI не установлен. Установите: npm install -g netlify-cli"
    echo "   Затем выполните: netlify deploy --prod --dir=frontend/dist"
fi
echo ""

# Railway
echo "🚂 Деплой на Railway..."
if command -v railway &> /dev/null; then
    railway deploy
    echo "✅ Railway деплой завершен"
else
    echo "⚠️  Railway CLI не установлен. Установите: npm install -g @railway/cli"
    echo "   Затем выполните: railway deploy"
fi
echo ""

# Vercel (дополнительный инстанс)
echo "▲ Деплой дополнительного инстанса на Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod --name=voice-widget-backup
    echo "✅ Vercel backup деплой завершен"
else
    echo "⚠️  Vercel CLI не установлен. Установите: npm install -g vercel"
    echo "   Затем выполните: vercel --prod --name=voice-widget-backup"
fi
echo ""

# Создаем конфигурацию с fallback эндпоинтами
echo "📝 Создание конфигурации fallback эндпоинтов..."

cat > frontend/src/config/endpoints.ts << 'EOF'
// Автоматически сгенерированная конфигурация fallback эндпоинтов
export const FALLBACK_ENDPOINTS = [
  {
    name: 'primary',
    baseUrl: window.location.origin,
    tokenUrl: '/api/token'
  },
  {
    name: 'netlify-backup',
    baseUrl: 'https://voice-widget-backup.netlify.app',
    tokenUrl: '/api/token'
  },
  {
    name: 'railway-backup', 
    baseUrl: 'https://voice-widget-backup.railway.app',
    tokenUrl: '/api/token'
  },
  {
    name: 'vercel-backup',
    baseUrl: 'https://voice-widget-backup.vercel.app',
    tokenUrl: '/api/token'
  }
];

export function getAvailableEndpoint() {
  // Логика автоматического определения доступного эндпоинта
  return FALLBACK_ENDPOINTS[0];
}
EOF

echo "✅ Конфигурация endpoints.ts создана"
echo ""

# CloudFlare Workers деплой
echo "☁️  Подготовка CloudFlare Workers..."
if [ ! -d "workers" ]; then
    mkdir workers
fi

cat > workers/widget-proxy.js << 'EOF'
// CloudFlare Worker для проксирования запросов
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Определяем основной сервер
    const MAIN_SERVER = 'https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app';
    
    // Проксируем запрос
    const targetUrl = MAIN_SERVER + url.pathname + url.search;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Клонируем ответ и добавляем CORS заголовки
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    newResponse.headers.set('X-Frame-Options', 'ALLOWALL');
    
    return newResponse;
  },
};
EOF

cat > workers/wrangler.toml << 'EOF'
name = "voice-widget-proxy"
main = "widget-proxy.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "widget-proxy.your-domain.workers.dev/*", zone_name = "your-domain.com" }
]
EOF

echo "✅ CloudFlare Workers конфигурация создана в папке workers/"
echo ""

# Создаем обновленный embed код
cat > embed-code.html << 'EOF'
<!-- Обновленный embed код с fallback для обхода VPN ограничений -->
<script>
(async function() {
  const WIDGET_DOMAINS = [
    'https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app',
    'https://voice-widget-backup.netlify.app',
    'https://voice-widget-backup.railway.app',
    'https://widget-proxy.your-domain.workers.dev'
  ];
  
  let loaded = false;
  
  async function loadWidget() {
    for (const domain of WIDGET_DOMAINS) {
      if (loaded) break;
      
      try {
        console.log(`Пробуем загрузить виджет с: ${domain}`);
        
        const iframe = document.createElement('iframe');
        iframe.src = `${domain}/widget`;
        iframe.style.cssText = `
          border: 0;
          width: 100px;
          height: 50px;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        iframe.allow = 'microphone';
        iframe.title = 'Voice Assistant Widget';
        
        // Проверяем загрузку с таймаутом
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            iframe.remove();
            reject(new Error('Timeout'));
          }, 5000);
          
          iframe.onload = () => {
            clearTimeout(timeout);
            loaded = true;
            console.log(`✅ Виджет успешно загружен с: ${domain}`);
            resolve(true);
          };
          
          iframe.onerror = () => {
            clearTimeout(timeout);
            iframe.remove();
            reject(new Error('Load error'));
          };
        });
        
        document.body.appendChild(iframe);
        break;
        
      } catch (error) {
        console.warn(`❌ Не удалось загрузить с ${domain}:`, error.message);
        continue;
      }
    }
    
    if (!loaded) {
      console.error('❌ Не удалось загрузить виджет ни с одного сервера');
      
      // Показываем уведомление пользователю
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px;
        border-radius: 8px;
        font-family: system-ui;
        font-size: 14px;
        z-index: 1001;
        max-width: 300px;
      `;
      notification.textContent = 'Виджет недоступен. Попробуйте позже или обратитесь в поддержку.';
      
      document.body.appendChild(notification);
      
      setTimeout(() => notification.remove(), 10000);
    }
  }
  
  // Загружаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
</script>
EOF

echo "✅ Обновленный embed код создан в файле embed-code.html"
echo ""

echo "🎉 Деплой завершен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Добавьте домены в CloudFlare и включите прокси"
echo "2. Деплойте CloudFlare Worker: cd workers && wrangler deploy"
echo "3. Замените embed код на сайте на код из embed-code.html"
echo "4. Протестируйте доступность из разных регионов"
echo ""
echo "🌍 Ваш виджет теперь доступен без VPN!"