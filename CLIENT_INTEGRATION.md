# 🎙️ Руководство по интеграции голосового виджета Минск Мир

## 📋 Описание

Голосовой виджет Минск Мир — это ИИ-ассистент для продажи недвижимости, который можно легко встроить на любой сайт. Виджет позволяет посетителям вашего сайта общаться голосом с персональным консультантом по недвижимости.

### ✨ Возможности

- **🗣️ Голосовое взаимодействие**: Клиенты говорят и слышат ответы
- **🤖 ИИ-консультант**: Специализированный ассистент по недвижимости Минск Мир
- **📱 Мобильная поддержка**: Работает на всех устройствах
- **🔐 Безопасность**: Изолированные сессии для каждого пользователя
- **⚡ Быстрая интеграция**: Один iframe код для встраивания

---

## 🚀 Быстрая интеграция (5 минут)

### Шаг 1: Добавьте код виджета

Вставьте этот код на ваш сайт, где хотите разместить голосовой виджет:

```html
<!-- Голосовой виджет Минск Мир -->
<iframe 
  src="https://mm-agent-v2-0.vercel.app"
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

### Шаг 2: Проверьте работу

1. Откройте ваш сайт
2. Нажмите "Позвонить" в правом нижнем углу
3. Разрешите доступ к микрофону
4. Говорите с ассистентом!

**🎉 Готово!** Виджет работает автономно.

---

## ⚙️ Настройки и опции

### Позиционирование

```html
<!-- Левый нижний угол -->
<iframe 
  src="https://mm-agent-v2-0.vercel.app"
  style="bottom: 20px; left: 20px; /* остальные стили */"
></iframe>

<!-- Правый верхний угол -->
<iframe 
  src="https://mm-agent-v2-0.vercel.app"
  style="top: 20px; right: 20px; /* остальные стили */"
></iframe>

<!-- Мобильная адаптация -->
<iframe 
  src="https://mm-agent-v2-0.vercel.app"
  style="
    /* Обычные экраны */
    bottom: 20px; right: 20px;
    /* Мобильные устройства */
    @media (max-width: 768px) {
      bottom: 10px; right: 10px;
      width: 180px; height: 100px;
    }
  "
></iframe>
```

### Размеры виджета

| Размер | Ширина | Высота | Когда использовать |
|--------|--------|--------|--------------------|
| **Стандартный** | 200px | 120px | Большинство сайтов |
| **Компактный** | 160px | 80px | Мобильные устройства |
| **Увеличенный** | 250px | 150px | Широкие экраны |

### Кастомизация цветов

Виджет автоматически адаптируется к теме вашего сайта. Поддерживает:
- 🌞 Светлая тема
- 🌙 Темная тема  
- 🎨 Автоопределение через `prefers-color-scheme`

---

## 📱 Поддержка браузеров

| Браузер | Версия | Поддержка |
|---------|--------|-----------|
| **Chrome** | 60+ | ✅ Полная |
| **Firefox** | 55+ | ✅ Полная |
| **Safari** | 11+ | ✅ Полная |
| **Edge** | 79+ | ✅ Полная |
| **Opera** | 47+ | ✅ Полная |

### Мобильные устройства

- ✅ **iOS Safari** 11+
- ✅ **Android Chrome** 60+
- ✅ **Samsung Internet** 7+

---

## 🔒 Безопасность и приватность

### Изоляция пользователей
- Каждый посетитель получает уникальную сессию
- Пользователи НЕ слышат друг друга
- Автоматическая очистка при закрытии

### Данные и GDPR
- Голосовые данные обрабатываются в реальном времени
- Не сохраняются долгосрочно
- Соответствует требованиям GDPR

### Микрофон
- Запрашивается разрешение только при клике "Позвонить"
- Доступ отключается при завершении звонка
- Нет скрытого прослушивания

---

## 🎯 Интеграция с сайтом

### Отслеживание событий

```javascript
// Слушаем сообщения от виджета
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
  
  switch (event.data.type) {
    case 'widget-ready':
      console.log('Виджет готов:', event.data.sessionId);
      break;
      
    case 'VOICE_WIDGET_STATE_CHANGE':
      const state = event.data.state;
      if (state.isConnected) {
        // Пользователь начал разговор
        analytics.track('voice_call_started');
      }
      break;
  }
});
```

### Аналитика

```javascript
// Google Analytics 4
gtag('event', 'voice_widget_interaction', {
  'event_category': 'engagement',
  'event_label': 'voice_call_started'
});

// Яндекс.Метрика
ym(COUNTER_ID, 'reachGoal', 'voice_call_started');
```

### A/B тестирование

```javascript
// Показывать виджет только части пользователей
if (Math.random() < 0.5) {
  document.getElementById('voice-widget').style.display = 'block';
}
```

---

## 🚨 Решение проблем и диагностика

### 🔍 Быстрая диагностика

#### Простой тест работоспособности

1. Откройте браузер и перейдите на ваш сайт
2. Откройте DevTools (F12)
3. Перейдите в Console
4. Вставьте этот код:

```javascript
// Тест виджета
window.addEventListener('message', (e) => {
  if (e.origin === 'https://mm-agent-v2-0.vercel.app') {
    console.log('✅ Виджет отправил сообщение:', e.data.type);
  }
});
console.log('👂 Слушаем сообщения от виджета...');
```

5. Если через 5-10 секунд видите `✅ Виджет отправил сообщение: widget-ready` - всё работает!

---

### 🚫 Виджет не загружается

#### **Симптом**: Виджет не появляется на сайте

**🔬 Диагностика**:
```javascript
// Проверка iframe в консоли
const iframe = document.querySelector('iframe[src*="mm-agent-v2-0"]');
console.log('Iframe найден:', !!iframe);
if (iframe) {
  console.log('Размеры:', iframe.style.width, iframe.style.height);
  console.log('Позиция:', iframe.style.position);
}
```

**💡 Решения**:

1. **Content Security Policy блокирует iframe**
   ```html
   <!-- Добавьте в <head> -->
   <meta http-equiv="Content-Security-Policy" 
         content="frame-src https://mm-agent-v2-0.vercel.app 'self';">
   ```

2. **Ad Block блокирует iframe**
   - Попросите пользователей отключить Ad Block для вашего сайта
   - Или добавьте в белый список: `mm-agent-v2-0.vercel.app`

3. **Z-index конфликт**
   ```css
   iframe[src*="mm-agent-v2-0"] {
     z-index: 999999 !important;
   }
   ```

4. **Проблемы с HTTPS**
   - Виджет работает только на HTTPS сайтах
   - HTTP заблокирует микрофон

---

### 🎤 Не работает микрофон

#### **Симптом**: Браузер не запрашивает/отклоняет доступ к микрофону

**🔬 Диагностика**:
```javascript
// Проверка поддержки микрофона
navigator.mediaDevices.getUserMedia({audio: true})
  .then(() => console.log('✅ Микрофон доступен'))
  .catch(e => console.log('❌ Ошибка микрофона:', e.message));
```

**💡 Решения**:

1. **HTTPS обязателен**
   - ❌ `http://your-site.com` - не работает
   - ✅ `https://your-site.com` - работает

2. **Настройки браузера**
   - Chrome: `chrome://settings/content/microphone`
   - Firefox: `about:preferences#privacy`
   - Safari: Safari → Настройки → Веб-сайты → Микрофон

3. **Корпоративные ограничения**
   ```javascript
   // Тест разрешений
   navigator.permissions.query({name: 'microphone'})
     .then(result => console.log('Статус микрофона:', result.state));
   ```

4. **Пользователь нажал "Блокировать"**
   - Очистите разрешения для сайта
   - Chrome: Иконка замка → Настройки сайта
   - Firefox: Щелчок по иконке щита

---

### 🔇 Нет звука от ассистента

#### **Симптом**: Микрофон работает, но не слышно ответа

**🔬 Диагностика**:
```javascript
// Проверка аудио элементов
const audioElements = document.querySelectorAll('audio');
console.log('Найдено аудио элементов:', audioElements.length);
audioElements.forEach((audio, i) => {
  console.log(`Аудио ${i}: muted=${audio.muted}, volume=${audio.volume}`);
});
```

**💡 Решения**:

1. **Autoplay политика браузера**
   ```javascript
   // Проверка autoplay
   document.addEventListener('click', () => {
     console.log('👆 Пользователь кликнул - autoplay разрешен');
   }, {once: true});
   ```

2. **Громкость браузера/системы**
   - Проверьте микшер громкости Windows/Mac
   - Проверьте громкость вкладки в Chrome

3. **Режим "Без звука"**
   - Chrome: Правый клик на вкладке → "Включить звук"
   - Проверьте иконку динамика в адресной строке

4. **Конфликт с другими аудио**
   ```javascript
   // Остановка другого аудио
   document.querySelectorAll('audio, video').forEach(el => {
     if (!el.paused) el.pause();
   });
   ```

---

### ⏳ Медленная загрузка

#### **Симптом**: Виджет загружается более 10 секунд

**🔬 Диагностика**:
```javascript
// Измерение времени загрузки
const startTime = Date.now();
window.addEventListener('message', (e) => {
  if (e.data.type === 'widget-ready') {
    console.log(`⏱️ Виджет загрузился за: ${Date.now() - startTime}ms`);
  }
});
```

**💡 Решения**:

1. **Медленный интернет**
   - Виджет загружается асинхронно
   - Не блокирует основной сайт
   - Нормальное время: 2-8 секунд

2. **Блокировка CDN**
   ```javascript
   // Проверка доступности Vercel
   fetch('https://mm-agent-v2-0.vercel.app', {mode: 'no-cors'})
     .then(() => console.log('✅ Vercel доступен'))
     .catch(() => console.log('❌ Vercel заблокирован'));
   ```

3. **Перегруженная страница**
   - Оптимизируйте размер страницы
   - Загружайте виджет после основного контента

---

### 🔄 Виджет "зависает"

#### **Симптом**: Кнопка не реагирует на клики

**🔬 Диагностика**:
```javascript
// Проверка iframe отзывчивости
const iframe = document.querySelector('iframe[src*="mm-agent-v2-0"]');
iframe.style.border = '3px solid red'; // Видим ли iframe?

// Проверка событий
iframe.addEventListener('load', () => console.log('📡 Iframe загружен'));
```

**💡 Решения**:

1. **Перезагрузка iframe**
   ```javascript
   const iframe = document.querySelector('iframe[src*="mm-agent-v2-0"]');
   iframe.src = iframe.src; // Принудительная перезагрузка
   ```

2. **Очистка кеша браузера**
   - Ctrl+Shift+R (принудительное обновление)
   - Очистка кеша в настройках браузера

3. **Конфликт CSS**
   ```css
   iframe[src*="mm-agent-v2-0"] {
     pointer-events: auto !important;
     display: block !important;
     visibility: visible !important;
   }
   ```

---

### 📱 Проблемы на мобильных

#### **Симптом**: Виджет не работает на телефонах

**🔬 Диагностика через Remote Debug**:
1. Chrome DevTools → Remote Devices
2. Подключите телефон по USB
3. Откройте Console на мобильной версии

**💡 Решения**:

1. **Размер слишком маленький**
   ```css
   @media (max-width: 480px) {
     iframe[src*="mm-agent-v2-0"] {
       width: 160px !important;
       height: 100px !important;
       bottom: 10px !important;
       right: 10px !important;
     }
   }
   ```

2. **Микрофон заблокирован на iOS**
   - Safari только на iOS 11+
   - Требуется пользовательский жест

3. **Viewport проблемы**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

---

### 🔧 Расширенная диагностика

#### Полный диагностический скрипт

```javascript
// Полная диагностика виджета
function diagnoseVoiceWidget() {
  console.log('🔍 === ДИАГНОСТИКА ГОЛОСОВОГО ВИДЖЕТА ===');
  
  // 1. Проверка iframe
  const iframe = document.querySelector('iframe[src*="mm-agent-v2-0"]');
  console.log('📐 Iframe найден:', !!iframe);
  if (iframe) {
    console.log('   Размеры:', iframe.offsetWidth + 'x' + iframe.offsetHeight);
    console.log('   Видимый:', iframe.offsetParent !== null);
  }
  
  // 2. Проверка HTTPS
  console.log('🔒 HTTPS:', location.protocol === 'https:');
  
  // 3. Проверка микрофона
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(() => console.log('🎤 Микрофон: ✅ Доступен'))
      .catch(e => console.log('🎤 Микрофон: ❌', e.name));
  } else {
    console.log('🎤 Микрофон: ❌ API не поддерживается');
  }
  
  // 4. Проверка сообщений
  let messageReceived = false;
  const messageListener = (e) => {
    if (e.origin === 'https://mm-agent-v2-0.vercel.app') {
      messageReceived = true;
      console.log('📨 Сообщения: ✅ Получено', e.data.type);
      window.removeEventListener('message', messageListener);
    }
  };
  window.addEventListener('message', messageListener);
  
  setTimeout(() => {
    if (!messageReceived) {
      console.log('📨 Сообщения: ❌ Не получено за 5 сек');
    }
  }, 5000);
  
  // 5. Проверка сети
  fetch('https://mm-agent-v2-0.vercel.app', {mode: 'no-cors'})
    .then(() => console.log('🌐 Сеть: ✅ Доступна'))
    .catch(() => console.log('🌐 Сеть: ❌ Заблокирована'));
    
  console.log('🔍 === ДИАГНОСТИКА ЗАВЕРШЕНА ===');
}

// Запуск диагностики
diagnoseVoiceWidget();
```

---

### 📞 Техническая поддержка

#### Информация для обращения

При обращении в поддержку приложите:

1. **Результат диагностики** (скрипт выше)
2. **Информация о браузере**:
   ```javascript
   console.log('Браузер:', navigator.userAgent);
   console.log('Размер экрана:', screen.width + 'x' + screen.height);
   console.log('URL сайта:', location.href);
   ```

3. **Скриншот консоли** с ошибками
4. **Описание** шагов для воспроизведения

#### Контакты
- **Email**: support@minskworld.by
- **Время ответа**: 24 часа
- **Рабочее время**: Пн-Пт 9:00-18:00 (Минск)

#### Статус сервиса
- **Мониторинг**: https://status.vercel.com
- **Uptime**: 99.9% SLA
- **Регионы**: Global CDN

---

## 📞 Поддержка

### Техническая поддержка
- **Email**: support@minskworld.by
- **Время ответа**: 24 часа в рабочие дни

### Мониторинг работы
- **Статус системы**: https://status.mm-agent-v2-0.vercel.app
- **Время работы**: 24/7/365

### Обновления
- Виджет обновляется автоматически
- Обратная совместимость гарантирована
- Уведомления о крупных изменениях по email

---

## ✅ Контрольный список

- [ ] Код виджета добавлен на сайт
- [ ] Виджет отображается в правом нижнем углу
- [ ] Кнопка "Позвонить" реагирует на клик
- [ ] Браузер запрашивает разрешение на микрофон
- [ ] Слышен голос ассистента
- [ ] Ассистент отвечает на вопросы
- [ ] Кнопка "Завершить" корректно заканчивает звонок
- [ ] Виджет работает на мобильных устройствах

**🎉 Если все пункты выполнены - интеграция успешна!**

---

*Документация обновлена: 10 июля 2024*  
*Версия виджета: v2.0.0* 