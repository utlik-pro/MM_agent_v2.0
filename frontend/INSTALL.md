# 🚀 Установка голосового виджета

## Быстрый старт

### 1. Установка зависимостей

```bash
cd frontend
npm install
```

### 2. Запуск для разработки

```bash
# Запуск backend сервера (из корневой папки)
cd ..
python agent.py http

# Запуск frontend (в новом терминале)
cd frontend
npm run dev
```

### 3. Открытие демо

Откройте `example.html` в браузере или перейдите по адресу:
- Frontend: http://localhost:3000
- Demo: откройте `example.html` в браузере

## 📦 Сборка для продакшена

```bash
# Сборка
npm run build

# Предварительный просмотр
npm run preview
```

## 🔧 Настройка

### Обновление эндпоинтов

В файле `src/main.tsx` измените:

```typescript
const widgetConfig = {
  tokenEndpoint: 'https://yourdomain.com/get-token', // Ваш домен
  roomName: 'minsk-world-voice-room',
};
```

### Обновление CORS

В файле `agent.py` обновите CORS настройки:

```python
@web.middleware
async def cors_middleware(request, handler):
    # ... existing code ...
    resp.headers['Access-Control-Allow-Origin'] = 'https://yourdomain.com'
    # ... rest of the code ...
```

## 📱 Развертывание

### Вариант 1: Статический хостинг

```bash
npm run build
# Загрузите папку dist/ на ваш сервер
```

### Вариант 2: Vercel

```bash
npm i -g vercel
vercel --prod
```

### Вариант 3: Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🛠️ Отладка

### Проверка бэкенда

```bash
# Проверка health endpoint
curl -X GET http://localhost:8765/health

# Проверка создания токена
curl -X POST http://localhost:8765/get-token \
  -H "Content-Type: application/json" \
  -d '{"identity": "test-user", "room": "test-room"}'
```

### Проверка фронтенда

1. Откройте DevTools (F12)
2. Проверьте вкладку Console на ошибки
3. Во вкладке Network проверьте запросы к `/get-token`
4. Убедитесь, что микрофон разрешен

## 📋 Требования

- Node.js 18+
- Python 3.8+
- Современный браузер с поддержкой WebRTC
- HTTPS для продакшена (требуется для микрофона)

## 🚨 Частые проблемы

### 1. Ошибка "Microphone permission denied"

**Решение:** Убедитесь, что:
- Сайт использует HTTPS (в продакшене)
- Пользователь разрешил доступ к микрофону
- Микрофон не используется другими приложениями

### 2. Ошибка "Failed to get access token"

**Решение:** Проверьте:
- Запущен ли backend сервер
- Правильность URL в `tokenEndpoint`
- CORS настройки в `agent.py`

### 3. Ошибка "Connection failed"

**Решение:** Убедитесь, что:
- LiveKit сервер доступен
- Правильные API ключи в `.env`
- Нет блокировки WebRTC трафика

### 4. Виджет не загружается

**Решение:** Проверьте:
- Правильность src в iframe
- Нет ли блокировки iframe родительской страницей
- Консоль браузера на ошибки

## 🔐 Безопасность

### Для продакшена:

1. **Используйте HTTPS** - обязательно для микрофона
2. **Обновите CORS** - укажите конкретные домены
3. **Защитите API ключи** - не передавайте в клиент
4. **Валидируйте входные данные** - на backend
5. **Настройте CSP** - Content Security Policy

### Пример CSP заголовков:

```
Content-Security-Policy: default-src 'self'; 
  connect-src 'self' wss://your-livekit-server.com; 
  media-src *; 
  frame-src 'self' https://your-widget-domain.com;
```

## 📊 Мониторинг

### Логирование

```javascript
const handleStateChange = (state) => {
  // Отправка в аналитику
  analytics.track('voice_widget_state', {
    isConnected: state.isConnected,
    error: state.error,
    timestamp: new Date().toISOString()
  });
};
```

### Метрики

Отслеживайте:
- Количество подключений
- Время сессии
- Ошибки подключения
- Используемые браузеры/устройства

## 🎨 Кастомизация

### Изменение стилей

Отредактируйте `src/styles/index.css`:

```css
:root {
  --voice-primary: #your-color;
  --voice-secondary: #your-secondary-color;
}
```

### Изменение размеров

В iframe коде измените:

```html
<iframe 
  style="width: 300px; height: 150px;"
  ...
></iframe>
```

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи backend сервера
2. Откройте DevTools и посмотрите Console
3. Убедитесь, что все сервисы запущены
4. Проверьте переменные окружения

---

**Удачи с интеграцией! 🎉** 