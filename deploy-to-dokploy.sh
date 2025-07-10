#!/bin/bash

echo "🚀 Автоматический деплой MM Agent v2.0 на Dokploy"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "agent.py" ]; then
    echo "❌ Ошибка: agent.py не найден! Запустите скрипт из корня проекта."
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Внимание: есть незакоммиченные изменения!"
    echo "📋 Незакоммиченные файлы:"
    git status --porcelain
    echo ""
    read -p "Продолжить деплой? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Деплой отменен"
        exit 1
    fi
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

echo "📊 Информация о деплое:"
echo "  🔖 Commit: $COMMIT_HASH"
echo "  📝 Message: $(echo "$COMMIT_MESSAGE" | head -1)"
echo "  🌿 Branch: $(git branch --show-current)"
echo ""

# Check environment variables in .env
echo "🔍 Проверка конфигурации..."
if [ ! -f ".env" ]; then
    echo "❌ .env файл не найден!"
    echo "📋 Создайте .env файл с переменными:"
    echo "   LIVEKIT_API_KEY=your_key"
    echo "   LIVEKIT_API_SECRET=your_secret"
    echo "   LIVEKIT_URL=wss://your-project.livekit.cloud"
    exit 1
fi

# Source .env and check variables
source .env
if [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ] || [ -z "$LIVEKIT_URL" ]; then
    echo "❌ Не все переменные окружения установлены в .env!"
    exit 1
fi

echo "✅ Конфигурация проверена"
echo "  🔗 LiveKit URL: $LIVEKIT_URL"
echo "  🔑 API Key: ${LIVEKIT_API_KEY:0:8}..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker не найден, пропускаем локальную проверку"
else
    echo ""
    echo "🐳 Проверка Docker сборки..."
    
    # Check if Docker daemon is running
    if ! docker info > /dev/null 2>&1; then
        echo "⚠️  Docker daemon не запущен, пропускаем локальную проверку"
        echo "ℹ️  Сборка будет выполнена на Dokploy сервере"
    else
        # Build Docker image locally to verify
        echo "🔨 Тестируем локальную сборку Docker образа..."
        if docker build -t mm-agent-test . > /dev/null 2>&1; then
            echo "✅ Docker образ собирается успешно"
            docker rmi mm-agent-test > /dev/null 2>&1
        else
            echo "⚠️  Локальная сборка не удалась, но это не критично для Dokploy"
            echo "ℹ️  Сборка будет выполнена на Dokploy сервере с чистым окружением"
        fi
    fi
fi

echo ""
echo "📦 Подготовка к деплою..."

# Create deployment info file
cat > DEPLOYMENT_INFO.md << EOF
# Deployment Info

**Commit**: $COMMIT_HASH
**Date**: $(date)
**Branch**: $(git branch --show-current)

## Changes in this deployment:
$COMMIT_MESSAGE

## Configuration:
- LiveKit URL: $LIVEKIT_URL
- API Key: ${LIVEKIT_API_KEY:0:8}...

## Services:
- Agent: Python LiveKit Agent with Google AI
- Frontend: React Widget (already on Vercel)

## Post-deployment checklist:
- [ ] Check Dokploy logs for successful startup
- [ ] Test voice widget connection
- [ ] Verify agent responds to voice input
EOF

echo "✅ Deployment info создан"

echo ""
echo "🚀 Готов к деплою!"
echo ""
echo "📋 Следующие шаги:"
echo "1. 🌐 Откройте Dokploy dashboard: https://dokploy.utlik.co"
echo "2. 🔄 Найдите приложение MM_agent_v2.0"
echo "3. 🚀 Нажмите 'Redeploy' для применения изменений"
echo "4. 📊 Проверьте логи деплоя в Dokploy"
echo "5. 🧪 Протестируйте через: https://mm-agent-v2-0.vercel.app"
echo ""

# Option to open Dokploy dashboard
read -p "🌐 Открыть Dokploy dashboard? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Открываю Dokploy dashboard..."
    if command -v open &> /dev/null; then
        open "https://dokploy.utlik.co"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://dokploy.utlik.co"
    else
        echo "📋 Откройте вручную: https://dokploy.utlik.co"
    fi
fi

echo ""
echo "🎉 Скрипт деплоя завершен!"
echo "📱 Frontend URL: https://mm-agent-v2-0.vercel.app"
echo "🤖 Agent будет перезапущен автоматически после redeploy в Dokploy"
echo ""
echo "⚠️  Напоминание: После деплоя обязательно протестируйте voice widget!" 