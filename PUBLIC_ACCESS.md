# Публичный доступ к приложению

## Проблема
Ваше приложение успешно развернуто, но требует аутентификации Vercel для доступа.

## Решение

### Способ 1: Через веб-интерфейс Vercel (Рекомендуется)
1. Откройте https://vercel.com/dashboard
2. Найдите проект `mm-agent-v2-0`
3. Перейдите в `Settings` → `General`
4. В разделе `Project Privacy` измените с `Private` на `Public`
5. Сохраните изменения

### Способ 2: Через Vercel CLI
```bash
# Проверьте текущие настройки
vercel project ls

# Если есть команда для изменения приватности:
vercel --public
```

## Ваши URL-адреса
- **Frontend**: https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app
- **API Token**: https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app/api/token
- **Widget для embed**: https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app/widget

## Тестирование
После изменения на публичный доступ, проверьте:

```bash
# Основное приложение
curl -I https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app

# API для токенов
curl https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app/api/token
```

## Embed код для вашего сайта
После изменения приватности, используйте этот код:

```html
<iframe 
  src="https://mm-agent-v2-0-pktp1axdp-atamanpros-projects.vercel.app/widget" 
  style="border:0;width:100px;height:50px;position:fixed;bottom:20px;right:20px;z-index:1000;"
  allow="microphone">
</iframe>
```

## Следующие шаги
1. Сделайте проект публичным (см. выше)
2. Настройте переменные окружения для LiveKit (если ещё не сделано)
3. Протестируйте голосового ассистента 