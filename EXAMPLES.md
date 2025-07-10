# 💡 Примеры использования голосового виджета Минск Мир

## 📋 Обзор

Эта документация содержит практические примеры интеграции голосового виджета для различных платформ, CMS и бизнес-сценариев.

---

## 🌍 Интеграция с популярными CMS

### WordPress

#### Через Customizer (рекомендуется)

**Шаг 1**: Добавьте код в `functions.php` вашей темы:

```php
<?php
// Добавляем голосовой виджет Минск Мир
function add_voice_widget() {
    ?>
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
            z-index: 9999;
            background: transparent;
        "
        allow="microphone"
        title="Голосовой помощник Минск Мир"
    ></iframe>
    
    <script>
    // Интеграция с WordPress
    window.addEventListener('message', function(event) {
        if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
        
        if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE') {
            var state = event.data.state;
            
            // Отправляем событие в Google Analytics (если установлен)
            if (typeof gtag !== 'undefined' && state.isConnected) {
                gtag('event', 'voice_call_started', {
                    'event_category': 'engagement',
                    'page_title': document.title
                });
            }
        }
    });
    </script>
    <?php
}

// Добавляем виджет в footer всех страниц
add_action('wp_footer', 'add_voice_widget');
?>
```

#### Через плагин Custom HTML

1. Установите плагин "Insert Headers and Footers"
2. Перейдите в **Settings > Insert Headers and Footers**
3. Вставьте код в поле "Scripts in Footer"

#### Условное отображение

```php
<?php
// Показывать только на определенных страницах
function add_voice_widget_conditional() {
    // Только на главной и страницах с недвижимостью
    if (is_home() || is_page('apartments') || is_category('real-estate')) {
        add_voice_widget();
    }
}

add_action('wp_footer', 'add_voice_widget_conditional');
?>
```

### Joomla

Создайте модуль **System > Custom HTML**:

```html
<!-- Голосовой виджет -->
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
    "
    allow="microphone"
></iframe>

<script>
// Интеграция с Joomla
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('message', function(event) {
        if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
        
        // Логика для Joomla
        if (event.data.type === 'widget-ready') {
            console.log('Voice widget ready on Joomla site');
        }
    });
});
</script>
```

### Drupal

Создайте блок через **Structure > Block Layout > Add custom block**:

```html
<div id="voice-widget-container">
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
        "
        allow="microphone"
    ></iframe>
</div>

<script>
(function($, Drupal) {
    'use strict';
    
    Drupal.behaviors.voiceWidget = {
        attach: function(context, settings) {
            window.addEventListener('message', function(event) {
                if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
                
                // Интеграция с Drupal behaviors
                console.log('Voice widget event:', event.data.type);
            });
        }
    };
})(jQuery, Drupal);
</script>
```

---

## 🛒 E-commerce интеграция

### WooCommerce (WordPress)

```php
<?php
// Специальная интеграция для магазина недвижимости
function add_voice_widget_ecommerce() {
    ?>
    <iframe 
        src="https://mm-agent-v2-0.vercel.app"
        style="
            border: 0;
            width: 200px;
            height: 120px;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        "
        allow="microphone"
    ></iframe>
    
    <script>
    window.addEventListener('message', function(event) {
        if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
        
        if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE') {
            var state = event.data.state;
            
            if (state.isConnected) {
                // Отправляем данные о текущем товаре/категории
                var productData = {
                    page_type: '<?php echo (is_product() ? "product" : (is_shop() ? "shop" : "other")); ?>',
                    <?php if (is_product()): ?>
                    product_id: <?php echo get_the_ID(); ?>,
                    product_name: '<?php echo get_the_title(); ?>',
                    product_price: '<?php echo get_post_meta(get_the_ID(), "_price", true); ?>',
                    <?php endif; ?>
                };
                
                // Аналитика для WooCommerce
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'voice_assistance_started', {
                        'ecommerce': productData
                    });
                }
            }
        }
    });
    </script>
    <?php
}

// Показывать только в магазине
add_action('woocommerce_after_single_product_summary', 'add_voice_widget_ecommerce');
add_action('woocommerce_before_shop_loop', 'add_voice_widget_ecommerce');
?>
```

### Shopify

Добавьте в `theme.liquid` перед закрывающим `</body>`:

```liquid
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
    "
    allow="microphone"
></iframe>

<script>
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE' && event.data.state.isConnected) {
        // Shopify Analytics
        if (typeof Shopify !== 'undefined' && Shopify.analytics) {
            Shopify.analytics.track('Voice Assistant Started', {
                'page': window.location.pathname,
                'product_type': '{{ product.type | default: "unknown" }}'
            });
        }
    }
});
</script>
```

---

## 📱 Адаптивность и мобильные устройства

### Адаптивное позиционирование

```html
<style>
.voice-widget-responsive {
    border: 0;
    position: fixed;
    z-index: 1000;
    background: transparent;
    
    /* Десктоп */
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: 120px;
}

/* Планшеты */
@media (max-width: 768px) {
    .voice-widget-responsive {
        bottom: 15px;
        right: 15px;
        width: 180px;
        height: 100px;
    }
}

/* Мобильные устройства */
@media (max-width: 480px) {
    .voice-widget-responsive {
        bottom: 10px;
        right: 10px;
        width: 160px;
        height: 80px;
    }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
    .voice-widget-responsive {
        bottom: 5px;
        right: 5px;
        width: 140px;
        height: 70px;
    }
}
</style>

<iframe 
    src="https://mm-agent-v2-0.vercel.app"
    class="voice-widget-responsive"
    allow="microphone"
></iframe>
```

### Показ только на десктопе

```html
<style>
.voice-widget-desktop-only {
    display: block;
}

@media (max-width: 768px) {
    .voice-widget-desktop-only {
        display: none;
    }
}
</style>

<iframe 
    src="https://mm-agent-v2-0.vercel.app"
    class="voice-widget-desktop-only"
    style="position: fixed; bottom: 20px; right: 20px; width: 200px; height: 120px; border: 0; z-index: 1000;"
    allow="microphone"
></iframe>
```

---

## 🎨 Кастомизация под бренд

### Темная тема

```html
<!-- Виджет автоматически подстраивается под тему сайта -->
<style>
/* Принудительная темная тема для всего сайта */
:root {
    color-scheme: dark;
}

/* Или локально для области виджета */
.dark-theme-area {
    color-scheme: dark;
}
</style>

<div class="dark-theme-area">
    <iframe 
        src="https://mm-agent-v2-0.vercel.app"
        style="position: fixed; bottom: 20px; right: 20px; width: 200px; height: 120px; border: 0; z-index: 1000;"
        allow="microphone"
    ></iframe>
</div>
```

### Кастомные размеры и позиции

```html
<!-- Большой виджет в левом углу -->
<iframe 
    src="https://mm-agent-v2-0.vercel.app"
    style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 250px;
        height: 150px;
        border: 0;
        z-index: 1000;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    "
    allow="microphone"
></iframe>

<!-- Компактный виджет сверху -->
<iframe 
    src="https://mm-agent-v2-0.vercel.app"
    style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 160px;
        height: 80px;
        border: 0;
        z-index: 1000;
    "
    allow="microphone"
></iframe>
```

---

## 📊 Аналитика и отслеживание

### Google Analytics 4

```html
<script>
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    switch (event.data.type) {
        case 'widget-ready':
            gtag('event', 'voice_widget_loaded', {
                'event_category': 'Voice Widget',
                'session_id': event.data.sessionId
            });
            break;
            
        case 'VOICE_WIDGET_STATE_CHANGE':
            var state = event.data.state;
            
            if (state.isConnected) {
                gtag('event', 'voice_call_started', {
                    'event_category': 'Voice Widget',
                    'session_id': event.data.sessionId || 'unknown'
                });
            }
            
            if (state.error) {
                gtag('event', 'voice_widget_error', {
                    'event_category': 'Voice Widget',
                    'error_message': state.error
                });
            }
            break;
    }
});
</script>
```

### Яндекс.Метрика

```html
<script>
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE') {
        var state = event.data.state;
        
        if (state.isConnected) {
            // Цель "Начал голосовой разговор"
            ym(COUNTER_ID, 'reachGoal', 'voice_call_started');
            
            // Параметры визита
            ym(COUNTER_ID, 'params', {
                'voice_widget_session': event.data.sessionId || 'unknown',
                'voice_call_page': window.location.pathname
            });
        }
    }
});
</script>
```

### Facebook Pixel

```html
<script>
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE' && event.data.state.isConnected) {
        // Facebook Pixel событие
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                'content_name': 'Voice Assistant Interaction',
                'content_category': 'Real Estate Consultation'
            });
        }
    }
});
</script>
```

---

## 🔗 Интеграция с лид-формами

### Совместная работа с формами

```html
<!-- Обычная форма на сайте -->
<form id="contact-form">
    <input type="text" name="name" placeholder="Ваше имя">
    <input type="email" name="email" placeholder="Email">
    <input type="tel" name="phone" placeholder="Телефон">
    <button type="submit">Отправить</button>
</form>

<!-- Голосовой виджет -->
<iframe 
    src="https://mm-agent-v2-0.vercel.app"
    style="position: fixed; bottom: 20px; right: 20px; width: 200px; height: 120px; border: 0; z-index: 1000;"
    allow="microphone"
></iframe>

<script>
// Отслеживаем использование голосового виджета
var voiceWidgetUsed = false;

window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE' && event.data.state.isConnected) {
        voiceWidgetUsed = true;
    }
});

// При отправке формы добавляем информацию о голосовом виджете
document.getElementById('contact-form').addEventListener('submit', function(e) {
    if (voiceWidgetUsed) {
        // Добавляем скрытое поле
        var hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'voice_widget_used';
        hiddenField.value = 'yes';
        this.appendChild(hiddenField);
    }
});
</script>
```

---

## 🎯 A/B тестирование

### Показ части пользователей

```html
<script>
// Показываем виджет только 50% пользователей
function shouldShowVoiceWidget() {
    // Проверяем localStorage для постоянства
    var storedDecision = localStorage.getItem('voice_widget_ab_test');
    
    if (storedDecision !== null) {
        return storedDecision === 'true';
    }
    
    // Новый пользователь - случайное решение
    var showWidget = Math.random() < 0.5;
    localStorage.setItem('voice_widget_ab_test', showWidget.toString());
    
    // Отправляем в аналитику
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_assignment', {
            'test_name': 'voice_widget_display',
            'variant': showWidget ? 'show' : 'hide'
        });
    }
    
    return showWidget;
}

// Создаем виджет только если нужно
if (shouldShowVoiceWidget()) {
    document.addEventListener('DOMContentLoaded', function() {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://mm-agent-v2-0.vercel.app';
        iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:200px;height:120px;border:0;z-index:1000;';
        iframe.allow = 'microphone';
        document.body.appendChild(iframe);
    });
}
</script>
```

### Различные позиции

```html
<script>
// A/B тест позиций виджета
function getWidgetPosition() {
    var positions = [
        { bottom: '20px', right: '20px' },    // A - правый нижний
        { bottom: '20px', left: '20px' },     // B - левый нижний
        { top: '100px', right: '20px' }       // C - правый верхний
    ];
    
    var userHash = hashUserId(getUserId()); // Ваша функция хеширования
    var positionIndex = userHash % positions.length;
    
    return positions[positionIndex];
}

var position = getWidgetPosition();
var iframe = document.createElement('iframe');
iframe.src = 'https://mm-agent-v2-0.vercel.app';
iframe.style.cssText = `
    position: fixed;
    ${position.top ? 'top: ' + position.top : 'bottom: ' + position.bottom};
    ${position.left ? 'left: ' + position.left : 'right: ' + position.right};
    width: 200px;
    height: 120px;
    border: 0;
    z-index: 1000;
`;
iframe.allow = 'microphone';
document.body.appendChild(iframe);
</script>
```

---

## 📈 Конверсионная оптимизация

### Показ виджета по времени

```html
<script>
// Показать виджет через 30 секунд на сайте
setTimeout(function() {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://mm-agent-v2-0.vercel.app';
    iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 200px;
        height: 120px;
        border: 0;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    iframe.allow = 'microphone';
    
    document.body.appendChild(iframe);
    
    // Плавное появление
    setTimeout(function() {
        iframe.style.opacity = '1';
    }, 100);
    
    // Аналитика
    if (typeof gtag !== 'undefined') {
        gtag('event', 'voice_widget_delayed_show', {
            'delay_seconds': 30
        });
    }
}, 30000);
</script>
```

### Показ при попытке уйти

```html
<script>
var exitIntentShown = false;

// Отслеживаем намерение покинуть сайт
document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        showVoiceWidget();
    }
});

function showVoiceWidget() {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://mm-agent-v2-0.vercel.app';
    iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 200px;
        height: 120px;
        border: 0;
        z-index: 1000;
        animation: bounce-in 0.5s ease;
    `;
    iframe.allow = 'microphone';
    document.body.appendChild(iframe);
    
    // Аналитика
    if (typeof gtag !== 'undefined') {
        gtag('event', 'voice_widget_exit_intent', {
            'trigger': 'mouse_leave'
        });
    }
}

// CSS анимация
var style = document.createElement('style');
style.textContent = `
@keyframes bounce-in {
    0% { transform: scale(0) rotate(360deg); opacity: 0; }
    50% { transform: scale(1.1) rotate(180deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
`;
document.head.appendChild(style);
</script>
```

---

## 🔧 Продвинутые сценарии

### Интеграция с CRM

```html
<script>
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE' && event.data.state.isConnected) {
        // Отправляем лид в CRM
        var leadData = {
            source: 'voice_widget',
            session_id: event.data.sessionId,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        // Пример отправки в ваш CRM API
        fetch('/api/crm/lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        });
    }
});
</script>
```

### Интеграция с чат-ботами

```html
<script>
var chatBotWidget = document.getElementById('chat-bot');
var voiceWidgetActive = false;

window.addEventListener('message', function(event) {
    if (event.origin !== 'https://mm-agent-v2-0.vercel.app') return;
    
    if (event.data.type === 'VOICE_WIDGET_STATE_CHANGE') {
        var state = event.data.state;
        
        if (state.isConnected && !voiceWidgetActive) {
            // Скрываем чат-бот когда активен голосовой виджет
            voiceWidgetActive = true;
            if (chatBotWidget) {
                chatBotWidget.style.display = 'none';
            }
        } else if (!state.isConnected && voiceWidgetActive) {
            // Показываем чат-бот когда голосовой виджет неактивен
            voiceWidgetActive = false;
            if (chatBotWidget) {
                chatBotWidget.style.display = 'block';
            }
        }
    }
});
</script>
```

---

## ✅ Контрольные списки

### Базовая интеграция

- [ ] Код виджета добавлен на сайт
- [ ] HTTPS включен (обязательно для микрофона)  
- [ ] Виджет отображается корректно
- [ ] Виджет адаптируется под мобильные устройства
- [ ] Нет конфликтов с существующими элементами

### Аналитика

- [ ] События отслеживаются в Google Analytics
- [ ] Настроены цели в Яндекс.Метрике
- [ ] События отправляются в CRM (если нужно)
- [ ] A/B тесты настроены (если планируются)

### Производительность

- [ ] Виджет не замедляет загрузку сайта
- [ ] Нет JavaScript ошибок в консоли
- [ ] Content Security Policy настроен корректно
- [ ] Кеширование работает правильно

### UX/UI

- [ ] Виджет не перекрывает важные элементы
- [ ] Анимации работают плавно
- [ ] Виджет соответствует дизайну сайта
- [ ] Мобильная версия удобна для использования

---

*Примеры обновлены: 10 июля 2024*  
*Версия виджета: v2.0.0* 