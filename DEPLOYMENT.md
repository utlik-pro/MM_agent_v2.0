# Развертывание на Vercel

Это руководство поможет развернуть голосовой виджет на Vercel для продакшена.

## Подготовка к развертыванию

### 1. Настройка LiveKit

Сначала настройте LiveKit:

#### Вариант A: LiveKit Cloud (рекомендуется)
1. Зайдите на [livekit.io](https://livekit.io) и создайте аккаунт
2. Создайте новый проект 
3. Получите ваши креды:
   - API Key
   - API Secret
   - WebSocket URL (например: `wss://your-project.livekit.cloud`)

#### Вариант B: Self-hosted LiveKit
Следуйте [документации LiveKit](https://docs.livekit.io/home/self-hosting/deployment/) для развертывания собственного сервера.

### 2. Форк и клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/MM_agent_v2.0.git
cd MM_agent_v2.0

# Установите зависимости 
npm run install-frontend
```

### 3. Локальное тестирование (необязательно)

```bash
# Создайте .env файл
cp .env.example .env

# Отредактируйте .env и добавьте ваши LiveKit креды
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here  
LIVEKIT_URL=wss://your-livekit-server.com

# Запустите локально
npm run dev
```

## Развертывание на Vercel

### 1. Установка Vercel CLI

```bash
npm install -g vercel
```

### 2. Авторизация в Vercel

```bash
vercel login
```

### 3. Первое развертывание

```bash
# Развернуть как preview (тестовое развертывание)
npm run deploy:preview

# Или сразу в продакшен
npm run deploy:vercel
```

### 4. Настройка переменных окружения в Vercel

После первого развертывания:

1. Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → Environment Variables
4. Добавьте переменные:

```
LIVEKIT_API_KEY = your_livekit_api_key_here
LIVEKIT_API_SECRET = your_livekit_api_secret_here  
LIVEKIT_URL = wss://your-livekit-server.com
```

**Важно:** Убедитесь, что все переменные добавлены в Production environment!

### 5. Повторное развертывание

После добавления переменных окружения:

```bash
# Повторно разверните проект
vercel --prod
```

## Использование виджета

После успешного развертывания ваш виджет будет доступен по адресу:
```
https://your-project.vercel.app
```

### Встраивание через iframe

Добавьте этот код на любой сайт:

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

### Настройка iframe

Для лучшего UX настройте размеры под ваш дизайн:

```html
<!-- Компактный вариант -->
<iframe 
  src="https://your-project.vercel.app/widget"
  style="width: 200px; height: 60px; /* остальные стили */"
></iframe>

<!-- Расширенный вариант -->  
<iframe 
  src="https://your-project.vercel.app/widget"
  style="width: 350px; height: 100px; /* остальные стили */"
></iframe>
```

## Мониторинг и отладка

### Проверка работоспособности API

```bash
curl https://your-project.vercel.app/api/token
```

Должен вернуть:
```json
{
  "status": "ok",
  "service": "livekit-token-service", 
  "timestamp": 1234567890
}
```

### Логи Vercel

Просматривайте логи в реальном времени:

```bash
vercel logs your-project.vercel.app
```

### Отладка в браузере

1. Откройте DevTools (F12)
2. Перейдите в Console
3. Ищите сообщения от виджета (начинаются с ✅ или ❌)

## Обновления

### Автоматическое развертывание

Настройте автоматическое развертывание через Git:

1. В Vercel Dashboard → Settings → Git
2. Подключите ваш GitHub репозиторий
3. Настройте автодеплой для main/master ветки

### Ручное обновление

```bash
# Получите последние изменения
git pull origin main

# Разверните обновления
vercel --prod
```

## Безопасность

### Переменные окружения
- ❌ **НИКОГДА** не коммитьте `.env` файлы в Git
- ✅ Используйте Environment Variables в Vercel Dashboard
- ✅ Регулярно ротируйте API ключи

### CORS и iframe
Проект настроен на работу во всех iframe. Для повышения безопасности:

1. Ограничьте domains в `vercel.json` 
2. Настройте белый список в LiveKit

### Домены
Для продакшена настройте собственный домен в Vercel:
1. Settings → Domains → Add Domain
2. Настройте DNS записи
3. Обновите iframe src на новый домен

## Устранение проблем

### Виджет не загружается
- Проверьте переменные окружения в Vercel
- Убедитесь, что LiveKit сервер доступен
- Проверьте Console в браузере на ошибки

### Нет звука  
- Убедитесь, что пользователь дал разрешение на микрофон
- Проверьте HTTPS (микрофон работает только по HTTPS)
- Проверьте настройки браузера

### Ошибки токена
- Проверьте правильность API ключей
- Убедитесь, что время сервера синхронизировано
- Проверьте сетевую доступность до LiveKit

## Поддержка

При возникновении проблем:
1. Проверьте логи Vercel
2. Изучите Console браузера  
3. Обратитесь к [документации LiveKit](https://docs.livekit.io)
4. Создайте issue в репозитории проекта 