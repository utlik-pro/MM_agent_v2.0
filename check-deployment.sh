#!/bin/bash

echo "🔍 Проверка статуса деплоя..."
echo "=========================================="

FRONTEND_URL="https://mm-agent-v2-0.vercel.app"
WIDGET_URL="https://mm-agent-v2-0.vercel.app/widget"
API_URL="https://mm-agent-v2-0.vercel.app/api/token"

echo ""
echo "1️⃣ Проверка главной страницы:"
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$MAIN_STATUS" = "200" ]; then
    echo "✅ Главная страница: $FRONTEND_URL"
else
    echo "❌ Главная страница: HTTP $MAIN_STATUS"
fi

echo ""
echo "2️⃣ Проверка виджета:"
WIDGET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WIDGET_URL")
if [ "$WIDGET_STATUS" = "200" ]; then
    echo "✅ Виджет: $WIDGET_URL"
else
    echo "❌ Виджет: HTTP $WIDGET_STATUS"
fi

echo ""
echo "3️⃣ Проверка API:"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API: $API_URL"
    
    # Тест генерации токена
    echo "🧪 Тестируем генерацию токена..."
    TOKEN_RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d '{"identity":"test-user","room":"test-room"}')
    
    if echo "$TOKEN_RESPONSE" | grep -q '"token"'; then
        echo "✅ Токены генерируются успешно"
    else
        echo "❌ Ошибка генерации токенов"
    fi
else
    echo "❌ API: HTTP $API_STATUS"
fi

echo ""
echo "4️⃣ Проверка LiveKit Agent (Dokploy):"
echo "💡 Для проверки агента откройте:"
echo "   https://dokploy.utlik.co"
echo "   Найдите ваше приложение и проверьте логи"

echo ""
echo "5️⃣ Полный тест:"
if [ "$MAIN_STATUS" = "200" ] && [ "$WIDGET_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    echo "🎉 ВСЕ РАБОТАЕТ! Можно тестировать:"
    echo "   1. Откройте: $FRONTEND_URL"
    echo "   2. Нажмите 'Позвонить'"
    echo "   3. Разрешите доступ к микрофону"
    echo "   4. Говорите с AI ассистентом!"
else
    echo "⏱ Еще не готово. Подождите 1-2 минуты и запустите снова:"
    echo "   ./check-deployment.sh"
fi

echo ""
echo "==========================================" 