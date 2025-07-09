# Голосовой виджет Минск Мир

Iframe-виджет для голосового взаимодействия с ассистентом продаж недвижимости.

## 🚀 Установка

```bash
cd frontend
npm install
```

## 📦 Сборка

```bash
# Разработка
npm run dev

# Продакшн сборка
npm run build

# Предварительный просмотр
npm run preview
```

## 🎯 Использование

### 1. Встраивание через iframe

```html
<iframe 
  src="https://yourdomain.com/voice-widget" 
  style="
    border: 0;
    width: 200px;
    height: 120px;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background: transparent;
  "
  allow="microphone"
  title="Голосовой помощник Минск Мир"
></iframe>
```

### 2. Интеграция с сайтом

```javascript
// Слушаем сообщения от виджета
window.addEventListener('message', (event) => {
  if (event.data.type === 'VOICE_WIDGET_READY') {
    console.log('Виджет готов к работе');
  }
  
  if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE') {
    console.log('Состояние виджета:', event.data.state);
  }
  
  if (event.data.type === 'VOICE_WIDGET_ERROR') {
    console.error('Ошибка виджета:', event.data.error);
  }
});
```

## ⚙️ Конфигурация

### Бэкенд требования

Виджет требует эндпоинт `/get-token` для получения LiveKit токенов:

```python
# agent.py
python agent.py http  # Запускает сервер на порту 8765
```

### Переменные окружения

```env
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

## 🎨 Кастомизация

### CSS Variables

```css
:root {
  --voice-primary: #3B82F6;
  --voice-secondary: #10B981;
  --voice-danger: #EF4444;
  --voice-gray: #6B7280;
}
```

### Настройка виджета

```javascript
const widgetConfig = {
  tokenEndpoint: '/get-token',
  roomName: 'custom-room-name',
  userId: 'user-123',
};
```

## 📱 Мобильная поддержка

- Минимальный размер кнопки: 44x44px
- Поддержка touch-событий
- Адаптивный дизайн
- Оптимизация для iOS/Android

## 🔧 API

### Props

```typescript
interface VoiceWidgetProps {
  config?: Partial<VoiceWidgetConfig>;
  onStateChange?: (state: CallState) => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

### Events

- `VOICE_WIDGET_READY` - Виджет загружен
- `VOICE_WIDGET_STATE_CHANGE` - Изменение состояния
- `VOICE_WIDGET_ERROR` - Ошибка

## 🔐 Безопасность

- Токены генерируются на бэкенде
- CORS настроен для iframe
- Секретные ключи не передаются в клиент
- Валидация входных данных

## 📊 Мониторинг

```javascript
// Логирование состояний
const handleStateChange = (state) => {
  analytics.track('voice_widget_state', {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
  });
};
```

## 🚨 Отладка

```bash
# Проверка бэкенда
curl -X GET http://localhost:8765/health

# Проверка токена
curl -X POST http://localhost:8765/get-token \
  -H "Content-Type: application/json" \
  -d '{"identity": "test", "room": "test-room"}'
```

## 📈 Производительность

- Lazy loading компонентов
- Минимальный bundle size
- Оптимизация для мобильных устройств
- Кэширование статических ресурсов

## 🤝 Поддержка

Если возникли проблемы:
1. Проверьте статус бэкенда
2. Убедитесь, что микрофон разрешен
3. Проверьте CORS настройки
4. Посмотрите логи в консоли браузера 