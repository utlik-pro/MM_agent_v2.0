# Минск Мир - Голосовой помощник

Встраиваемый голосовой виджет с интеграцией LiveKit для веб-сайтов.

## Возможности

- 🎤 **Голосовой интерфейс** - общение с ИИ-помощником через микрофон
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🖼️ **iframe виджет** - легко встраивается на любой сайт
- ⚡ **Быстрое развертывание** - готов к деплою на Vercel
- 🔒 **Безопасность** - HTTPS и правильная обработка разрешений

## Быстрый старт

### Локальная разработка

```bash
# Клонирование
git clone https://github.com/your-username/MM_agent_v2.0.git
cd MM_agent_v2.0

# Установка зависимостей
npm run install-frontend

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env и добавьте ваши LiveKit креды

# Запуск в режиме разработки
npm run dev
```

### Развертывание на Vercel

```bash
# Установка Vercel CLI
npm install -g vercel

# Авторизация
vercel login

# Развертывание
npm run deploy:vercel
```

Подробные инструкции: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Использование

После развертывания встройте виджет на ваш сайт:

```html
<iframe 
  src="https://your-project.vercel.app/widget" 
  style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    height: 80px;
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
  "
  allow="microphone"
  title="Голосовой помощник"
></iframe>
```

## Структура проекта

```
MM_agent_v2.0/
├── api/                    # Vercel serverless функции
│   ├── token.py           # Генерация LiveKit токенов
│   └── requirements.txt   # Python зависимости
├── frontend/              # React + TypeScript виджет
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── lib/          # Утилиты и клиенты
│   │   └── types/        # TypeScript типы
│   └── dist/             # Собранный frontend
├── vercel.json           # Конфигурация Vercel
├── .env.example          # Пример переменных окружения
└── DEPLOYMENT.md         # Инструкции по развертыванию
```

## Технологии

### Frontend
- **React 18** + **TypeScript** - современный UI
- **Vite** - быстрая сборка и разработка
- **TailwindCSS** - стилизация
- **LiveKit Client** - WebRTC для голоса

### Backend
- **Python 3.9** - serverless функции
- **PyJWT** - генерация токенов
- **LiveKit** - медиа сервер

### Инфраструктура
- **Vercel** - хостинг и serverless
- **LiveKit Cloud** - голосовая обработка

## Требования

- Node.js 18+
- Python 3.9+
- LiveKit аккаунт ([livekit.io](https://livekit.io))
- Vercel аккаунт ([vercel.com](https://vercel.com))

## Конфигурация

### Переменные окружения

```bash
# LiveKit креды
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret  
LIVEKIT_URL=wss://your-project.livekit.cloud
```

### Настройка виджета

В `frontend/src/components/call-widget.tsx`:

```typescript
const defaultConfig: VoiceWidgetConfig = {
  tokenEndpoint: '/api/token',
  roomName: 'voice-assistant-room',
  // Дополнительные параметры...
};
```

## Лицензия

MIT License - смотрите [LICENSE](LICENSE) для деталей.

## Поддержка

- 📖 [Документация по развертыванию](./DEPLOYMENT.md)
- 🐛 [Сообщить о проблеме](https://github.com/your-username/MM_agent_v2.0/issues)
- 💬 [Обсуждения](https://github.com/your-username/MM_agent_v2.0/discussions) 