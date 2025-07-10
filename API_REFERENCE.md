# 🔧 API Reference - Голосовой виджет Минск Мир

## 📋 Обзор

Голосовой виджет Минск Мир предоставляет простой iframe-интерфейс для интеграции и JavaScript API для расширенной функциональности.

### Базовые URL
- **Виджет**: `https://mm-agent-v2-0.vercel.app`
- **API**: `https://mm-agent-v2-0.vercel.app/api`

---

## 🗂️ iframe API

### Базовая интеграция

```html
<iframe 
  id="voice-widget"
  src="https://mm-agent-v2-0.vercel.app"
  allow="microphone"
></iframe>
```

### Параметры URL

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `room` | string | Кастомное имя комнаты | auto-generated |
| `identity` | string | ID пользователя | auto-generated |

**Примеры:**

```html
<!-- Кастомная комната -->
<iframe src="https://mm-agent-v2-0.vercel.app?room=custom-room"></iframe>

<!-- Кастомный пользователь -->
<iframe src="https://mm-agent-v2-0.vercel.app?identity=user-123"></iframe>

<!-- Комбинация параметров -->
<iframe src="https://mm-agent-v2-0.vercel.app?room=vip-clients&identity=client-456"></iframe>
```

---

## 📡 PostMessage API

Виджет отправляет события в родительское окно через `postMessage`.

### Входящие сообщения (от виджета)

#### 1. `widget-ready`

Отправляется когда виджет полностью загружен.

```javascript
{
  type: 'widget-ready',
  sessionId: 'session-1699123456789-k3m9x7q2w',
  roomName: 'session-1699123456789-k3m9x7q2w'
}
```

#### 2. `VOICE_WIDGET_STATE_CHANGE`

Отправляется при изменении состояния подключения.

```javascript
{
  type: 'VOICE_WIDGET_STATE_CHANGE',
  state: {
    isConnected: false,
    isConnecting: true,
    error: null,
    micPermission: 'granted'
  }
}
```

**Состояния `state`:**

| Поле | Тип | Описание |
|------|-----|----------|
| `isConnected` | boolean | Активен ли голосовой вызов |
| `isConnecting` | boolean | Идет ли подключение |
| `error` | string\|null | Текст ошибки если есть |
| `micPermission` | string\|null | Статус доступа к микрофону |

**Значения `micPermission`:**
- `'granted'` - Разрешение дано
- `'denied'` - Разрешение отклонено
- `'prompt'` - Ожидает ответа пользователя
- `null` - Еще не запрашивалось

#### 3. `VOICE_WIDGET_ERROR`

Отправляется при критических ошибках.

```javascript
{
  type: 'VOICE_WIDGET_ERROR',
  error: 'Microphone permission denied'
}
```

### Обработка сообщений

```javascript
window.addEventListener('message', (event) => {
  // Безопасность: проверяем источник
  if (event.origin !== 'https://mm-agent-v2-0.vercel.app') {
    return;
  }
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'widget-ready':
      console.log('Виджет готов:', data.sessionId);
      handleWidgetReady(data);
      break;
      
    case 'VOICE_WIDGET_STATE_CHANGE':
      console.log('Состояние изменилось:', data.state);
      handleStateChange(data.state);
      break;
      
    case 'VOICE_WIDGET_ERROR':
      console.error('Ошибка виджета:', data.error);
      handleWidgetError(data.error);
      break;
  }
});
```

---

## 🛠️ REST API

### Получение токена

**Endpoint**: `POST /api/token`

Генерирует токен доступа к голосовой сессии.

#### Запрос

```http
POST /api/token
Content-Type: application/json

{
  "identity": "user-123",
  "room": "custom-room-name"
}
```

**Параметры:**

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `identity` | string | Нет | ID пользователя |
| `room` | string | Нет | Имя комнаты |

#### Ответ

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "wsUrl": "wss://mmagent-ectkxtjt.livekit.cloud",
  "identity": "user-123",
  "room": "custom-room-name",
  "agent_dispatch": "automatic"
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| `token` | string | JWT токен для подключения |
| `wsUrl` | string | WebSocket URL LiveKit сервера |
| `identity` | string | Подтвержденный ID пользователя |
| `room` | string | Подтвержденное имя комнаты |
| `agent_dispatch` | string | Статус диспетчеризации агента |

#### Коды ошибок

| Код | Описание | Решение |
|-----|----------|---------|
| 400 | Неверные параметры | Проверьте JSON запроса |
| 500 | Ошибка сервера | Повторите запрос позже |

**Пример ошибки:**

```json
{
  "error": "Ошибка создания токена: Invalid room name"
}
```

---

## 🔒 Безопасность

### CORS

API поддерживает CORS для всех доменов:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Content Security Policy

Для работы виджета добавьте в CSP:

```html
<meta http-equiv="Content-Security-Policy" 
      content="
        frame-src https://mm-agent-v2-0.vercel.app;
        connect-src https://mm-agent-v2-0.vercel.app wss://mmagent-ectkxtjt.livekit.cloud;
        media-src *;
      ">
```

### Токены

- **TTL**: 1 час
- **Алгоритм**: HS256 JWT
- **Автоматическое обновление**: Да
- **Scope**: Только указанная комната

---

## 📊 JavaScript SDK (расширенный)

### Инициализация

```javascript
class VoiceWidgetController {
  constructor(iframeElement) {
    this.iframe = iframeElement;
    this.isReady = false;
    this.currentState = null;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
      
      this.handleMessage(event.data);
    });
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'widget-ready':
        this.isReady = true;
        this.onReady?.(data);
        break;
        
      case 'VOICE_WIDGET_STATE_CHANGE':
        this.currentState = data.state;
        this.onStateChange?.(data.state);
        break;
        
      case 'VOICE_WIDGET_ERROR':
        this.onError?.(data.error);
        break;
    }
  }
  
  // Методы для отправки команд (если потребуется в будущем)
  sendCommand(command, data = {}) {
    if (!this.isReady) {
      throw new Error('Widget not ready yet');
    }
    
    this.iframe.contentWindow.postMessage({
      type: 'COMMAND',
      command,
      data
    }, 'https://mm-agent-v2-0.vercel.app');
  }
}
```

### Использование

```javascript
const iframe = document.getElementById('voice-widget');
const controller = new VoiceWidgetController(iframe);

// Обработчики событий
controller.onReady = (data) => {
  console.log('Виджет готов:', data.sessionId);
  
  // Аналитика
  gtag('event', 'voice_widget_loaded', {
    'session_id': data.sessionId
  });
};

controller.onStateChange = (state) => {
  console.log('Новое состояние:', state);
  
  if (state.isConnected) {
    // Пользователь начал разговор
    updateUI('connected');
    trackEvent('voice_call_started');
  } else if (state.error) {
    // Обработка ошибок
    showErrorMessage(state.error);
  }
};

controller.onError = (error) => {
  console.error('Критическая ошибка:', error);
  
  // Уведомление пользователя
  showNotification('Произошла ошибка с голосовым помощником', 'error');
};
```

---

## 📈 Аналитика и мониторинг

### Рекомендуемые события

```javascript
// Google Analytics 4
function trackVoiceEvent(action, parameters = {}) {
  gtag('event', action, {
    'event_category': 'voice_widget',
    'custom_map': {'dimension1': 'session_id'},
    ...parameters
  });
}

// События для отслеживания
trackVoiceEvent('widget_loaded', { session_id: sessionId });
trackVoiceEvent('call_started', { session_id: sessionId });
trackVoiceEvent('call_ended', { session_id: sessionId, duration: callDuration });
trackVoiceEvent('permission_granted', { permission_type: 'microphone' });
trackVoiceEvent('error_occurred', { error_type: errorType });
```

### Яндекс.Метрика

```javascript
// Цели для отслеживания
ym(COUNTER_ID, 'reachGoal', 'voice_widget_interaction');
ym(COUNTER_ID, 'reachGoal', 'voice_call_completed');

// Параметры визитов
ym(COUNTER_ID, 'params', {
  'voice_widget_session': sessionId,
  'voice_call_duration': duration
});
```

---

## 🧪 Тестирование

### Unit тесты

```javascript
describe('VoiceWidgetController', () => {
  let controller;
  let mockIframe;
  
  beforeEach(() => {
    mockIframe = { contentWindow: { postMessage: jest.fn() } };
    controller = new VoiceWidgetController(mockIframe);
  });
  
  test('should handle widget ready message', () => {
    const readyHandler = jest.fn();
    controller.onReady = readyHandler;
    
    controller.handleMessage({
      type: 'widget-ready',
      sessionId: 'test-session'
    });
    
    expect(controller.isReady).toBe(true);
    expect(readyHandler).toHaveBeenCalledWith({ sessionId: 'test-session' });
  });
});
```

### E2E тесты

```javascript
// Cypress example
describe('Voice Widget Integration', () => {
  it('should load and initialize widget', () => {
    cy.visit('/page-with-widget');
    
    // Проверка загрузки iframe
    cy.get('#voice-widget').should('be.visible');
    
    // Проверка кнопки позвонить
    cy.get('#voice-widget').within(() => {
      cy.contains('Позвонить').should('be.visible');
    });
    
    // Симуляция клика (без реального микрофона в тестах)
    cy.window().then((win) => {
      const mockPermission = cy.stub(win.navigator.mediaDevices, 'getUserMedia')
        .resolves({ getTracks: () => [] });
    });
  });
});
```

---

## 📚 Примеры интеграции

### React

```jsx
import { useEffect, useRef, useState } from 'react';

function VoiceWidget({ onStateChange }) {
  const iframeRef = useRef(null);
  const [widgetState, setWidgetState] = useState({
    isReady: false,
    isConnected: false
  });
  
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
      
      const { type, data } = event.data;
      
      if (type === 'VOICE_WIDGET_STATE_CHANGE') {
        setWidgetState(prev => ({
          ...prev,
          ...data.state
        }));
        onStateChange?.(data.state);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStateChange]);
  
  return (
    <iframe
      ref={iframeRef}
      src="https://mm-agent-v2-0.vercel.app"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '200px',
        height: '120px',
        border: 0,
        zIndex: 1000
      }}
      allow="microphone"
      title="Голосовой помощник"
    />
  );
}
```

### Vue.js

```vue
<template>
  <iframe
    ref="widgetIframe"
    src="https://mm-agent-v2-0.vercel.app"
    :style="widgetStyles"
    allow="microphone"
    title="Голосовой помощник"
  />
</template>

<script>
export default {
  name: 'VoiceWidget',
  
  data() {
    return {
      isReady: false,
      currentState: null
    };
  },
  
  computed: {
    widgetStyles() {
      return {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '200px',
        height: '120px',
        border: 0,
        zIndex: 1000
      };
    }
  },
  
  mounted() {
    window.addEventListener('message', this.handleMessage);
  },
  
  beforeUnmount() {
    window.removeEventListener('message', this.handleMessage);
  },
  
  methods: {
    handleMessage(event) {
      if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
      
      const { type, data } = event.data;
      
      switch (type) {
        case 'widget-ready':
          this.isReady = true;
          this.$emit('ready', data);
          break;
          
        case 'VOICE_WIDGET_STATE_CHANGE':
          this.currentState = data.state;
          this.$emit('stateChange', data.state);
          break;
      }
    }
  }
};
</script>
```

---

## 🔧 Отладка

### Включение режима отладки

```javascript
// Добавьте параметр debug в URL
const debugUrl = 'https://mm-agent-v2-0.vercel.app?debug=true';

// Или через postMessage (если поддерживается)
widgetController.sendCommand('SET_DEBUG', { enabled: true });
```

### Логи событий

```javascript
// Детальное логирование всех событий
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
  
  console.group(`[Voice Widget] ${event.data.type}`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Data:', event.data);
  console.groupEnd();
});
```

---

*API Reference обновлен: 10 июля 2024*  
*Версия API: v2.0.0* 