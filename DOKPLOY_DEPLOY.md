# 🚀 Развертывание LiveKit Agent на Dokploy

## 📋 Что мы развертываем

**LiveKit Agent** - это Python приложение, которое:
- 🎤 Слушает голосовые сообщения в LiveKit комнатах
- 🤖 Обрабатывает их через Google AI
- 🔊 Отвечает голосом обратно пользователям

**Важно**: Agent должен работать **постоянно**, а не по запросу!

## 🔧 Подготовка

### 1. Убедитесь что у вас есть LiveKit креды

Из `DEPLOYMENT_SUCCESS.md`:
```
API Key: APIhoMBq7VUYXkA
WebSocket URL: wss://mmagent-ectkxtjt.livekit.cloud
```

### 2. Настройте переменные окружения

Создайте `.env` файл (основываясь на `.env.example`):

```env
LIVEKIT_API_KEY=APIhoMBq7VUYXkA
LIVEKIT_API_SECRET=ваш_секретный_ключ_livekit
LIVEKIT_URL=wss://mmagent-ectkxtjt.livekit.cloud
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type": "service_account", "project_id": "your-project"}
LOG_LEVEL=INFO
```

## 🐳 Развертывание в Dokploy

### Шаг 1: Создание нового приложения

1. Откройте ваш Dokploy dashboard: **https://dokploy.utlik.co**
2. Нажмите **"Create Application"**
3. Выберите **"Docker"** 
4. Укажите источник: **Git Repository**

### Шаг 2: Настройка Git репозитория

```
Repository URL: https://github.com/your-username/MM_agent_v2.0.git
Branch: main
Build Context: .
Dockerfile: Dockerfile
```

### Шаг 3: Переменные окружения

В Dokploy добавьте переменные:

| Переменная | Значение |
|------------|----------|
| `LIVEKIT_API_KEY` | `APIhoMBq7VUYXkA` |
| `LIVEKIT_API_SECRET` | ваш секретный ключ |
| `LIVEKIT_URL` | `wss://mmagent-ectkxtjt.livekit.cloud` |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | JSON ключ от Google Cloud |
| `LOG_LEVEL` | `INFO` |

### Шаг 4: Настройки деплоя

```yaml
# Эти настройки в Dokploy UI:
Restart Policy: unless-stopped
Health Check: Enabled
Auto Deploy: Enabled (on git push)
```

### Шаг 5: Запуск

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки
3. Проверьте логи - должно быть:

```
✅ LiveKit Agent готов
🔗 Подключен к: wss://mmagent-ectkxtjt.livekit.cloud
👂 Слушает комнаты...
```

## 🔍 Проверка работы

### Тест через виджет:

1. Откройте: https://mm-agent-v2-0.vercel.app
2. Нажмите "Позвонить"
3. Говорите что-то
4. В логах Dokploy должно появиться:
   ```
   📞 Новый участник подключился: user-123456
   🎤 Получено аудио сообщение
   🤖 Отправка ответа...
   ```

### Тест подключения:

```bash
# Проверьте что контейнер запущен через ваш Dokploy
# URL будет назначен автоматически после деплоя
curl -f http://your-app-name.dokploy.utlik.co/health || echo "Agent не отвечает"
```

## 🛠 Отладка

### Проблема: Agent не подключается

**Симптом**: Логи показывают ошибки подключения

**Решение**:
1. Проверьте переменные окружения
2. Убедитесь что LIVEKIT_URL правильный
3. Проверьте что API ключи не истекли

### Проблема: Agent подключается, но не отвечает

**Симптом**: Пользователи подключаются, но нет голосового ответа

**Решение**:
1. Проверьте Google Cloud креды
2. Посмотрите логи: `docker logs livekit-agent`
3. Убедитесь что у проекта есть доступ к Google AI

### Проблема: Контейнер перезапускается

**Симптом**: В Dokploy постоянные restart'ы

**Решение**:
1. Увеличьте memory limit
2. Проверьте переменные окружения
3. Посмотрите error логи

## 📊 Мониторинг

### Полезные команды для отладки:

```bash
# Логи в реальном времени
docker logs -f livekit-agent

# Использование ресурсов
docker stats livekit-agent

# Проверка переменных окружения внутри контейнера
docker exec livekit-agent env | grep LIVEKIT
```

## ✅ Контрольный список

После успешного деплоя:

- [ ] ✅ Контейнер запущен и не перезапускается
- [ ] ✅ В логах видно подключение к LiveKit
- [ ] ✅ Виджет на https://mm-agent-v2-0.vercel.app подключается
- [ ] ✅ Agent отвечает на голосовые сообщения
- [ ] ✅ Настроен auto-deploy на git push

## 🚀 Готово!

Теперь ваш голосовой ассистент работает **24/7**:

- **Frontend**: https://mm-agent-v2-0.vercel.app (Vercel)
- **Agent**: https://dokploy.utlik.co (постоянно работает)
- **LiveKit**: wss://mmagent-ectkxtjt.livekit.cloud

Пользователи могут:
1. Открыть виджет
2. Нажать "Позвонить" 
3. Говорить с AI ассистентом
4. Получать голосовые ответы

---

**Поздравляем! Ваш полнофункциональный голосовой ассистент готов! 🎤✨** 