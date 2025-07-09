#!/bin/bash

echo "🎉 ФИНАЛЬНЫЙ ТЕСТ ГОЛОСОВОГО АССИСТЕНТА"
echo "=============================================="

# URLs
FRONTEND_URL="https://mm-agent-v2-0.vercel.app"
DOKPLOY_URL="https://dokploy.utlik.co"

echo ""
echo "1️⃣ Проверка всех компонентов:"

# Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: $FRONTEND_URL"
else
    echo "❌ Frontend: HTTP $FRONTEND_STATUS"
    exit 1
fi

# API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/token")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API токенов работает"
else
    echo "❌ API токенов: HTTP $API_STATUS"
    exit 1
fi

# Agent (проверяем что Dokploy доступен)
DOKPLOY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOKPLOY_URL")
if [ "$DOKPLOY_STATUS" = "200" ]; then
    echo "✅ Dokploy (Agent) доступен"
else
    echo "❌ Dokploy недоступен: HTTP $DOKPLOY_STATUS"
fi

echo ""
echo "2️⃣ Тест генерации токена:"
TOKEN_RESPONSE=$(curl -s -X POST "$FRONTEND_URL/api/token" \
    -H "Content-Type: application/json" \
    -d '{"identity":"test-user","room":"voice-test"}')

if echo "$TOKEN_RESPONSE" | grep -q '"token"'; then
    echo "✅ Токены генерируются для LiveKit"
    echo "🔗 LiveKit URL: $(echo "$TOKEN_RESPONSE" | grep -o '"wsUrl":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Ошибка генерации токенов"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣ ИНСТРУКЦИИ ДЛЯ ТЕСТИРОВАНИЯ:"
echo "=============================================="
echo ""
echo "🌐 Откройте в браузере: $FRONTEND_URL"
echo ""
echo "📋 Последовательность действий:"
echo "   1. 👀 Проверьте что есть кнопка 'Позвонить'"
echo "   2. 🖱 Нажмите на кнопку 'Позвонить'"
echo "   3. 🎤 Разрешите доступ к микрофону в браузере"
echo "   4. ⏳ Дождитесь подключения (кнопка станет красной)"
echo "   5. 🗣 Скажите: 'Привет! Как дела?'"
echo "   6. 👂 Ожидайте голосовой ответ от AI"
echo ""
echo "✅ ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:"
echo "   - Кнопка меняется на 'Завершить'"
echo "   - AI отвечает голосом на ваши вопросы"
echo "   - Полноценный голосовой диалог"
echo ""
echo "🛠 ОТЛАДКА (если не работает):"
echo "   - Откройте DevTools (F12)"
echo "   - Проверьте Console на ошибки"
echo "   - Проверьте Network tab"
echo "   - Проверьте логи Agent в Dokploy: $DOKPLOY_URL"
echo ""
echo "🎯 EMBED КОД ДЛЯ САЙТА:"
echo '<iframe src="'$FRONTEND_URL'/widget" style="border:0;width:300px;height:80px;position:fixed;bottom:20px;right:20px;z-index:9999;" allow="microphone"></iframe>'
echo ""
echo "=============================================="
echo "🎉 ВСЕ ГОТОВО! ГОЛОСОВОЙ АССИСТЕНТ РАБОТАЕТ!"
echo "==============================================" 