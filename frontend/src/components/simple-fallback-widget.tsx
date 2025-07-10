import React, { useState, useEffect } from 'react';

// Список резервных эндпоинтов
const FALLBACK_ENDPOINTS = [
  {
    name: 'primary',
    baseUrl: window.location.origin,
    tokenUrl: '/api/token'
  },
  {
    name: 'backup-vercel',
    baseUrl: 'https://mm-agent-v2-0-alternative.vercel.app',
    tokenUrl: '/api/token'
  },
  {
    name: 'backup-netlify', 
    baseUrl: 'https://your-widget-backup.netlify.app',
    tokenUrl: '/api/token'
  }
];

interface CallWidgetProps {
  className?: string;
}

export function SimpleFallbackWidget({ className = '' }: CallWidgetProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    endpoint?: string;
    method?: string;
    error?: string;
  }>({});
  const [availableEndpoint, setAvailableEndpoint] = useState<typeof FALLBACK_ENDPOINTS[0] | null>(null);

  // Проверяем доступность эндпоинтов при загрузке
  useEffect(() => {
    findWorkingEndpoint();
  }, []);

  async function findWorkingEndpoint() {
    for (const endpoint of FALLBACK_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const testUrl = `${endpoint.baseUrl}${endpoint.tokenUrl}`;
        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 405) {
          setAvailableEndpoint(endpoint);
          console.log(`✅ Using endpoint: ${endpoint.name} (${endpoint.baseUrl})`);
          return;
        }
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint.name} failed:`, error);
        continue;
      }
    }
    
    // Если ничего не работает, используем первый
    setAvailableEndpoint(FALLBACK_ENDPOINTS[0]);
    console.warn('⚠️ All endpoints failed, using primary as fallback');
  }

  async function requestMicrophonePermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      throw new Error('Необходим доступ к микрофону');
    }
  }

  async function getToken() {
    if (!availableEndpoint) {
      throw new Error('No available endpoints');
    }

    const tokenUrl = `${availableEndpoint.baseUrl}${availableEndpoint.tokenUrl}`;
    
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: `user-${Date.now()}`,
          room: 'voice-assistant'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token received');
      }

      return data;
    } catch (error) {
      console.error('Token request failed:', error);
      throw error;
    }
  }

  async function connectWithFallback(tokenData: any) {
    // Этот метод будет расширен когда LiveKit SDK подключится правильно
    console.log('Connecting with token:', tokenData);
    
    // Симуляция подключения для демонстрации
    return new Promise((resolve) => {
      setTimeout(() => {
        setConnectionInfo({
          endpoint: availableEndpoint?.name,
          method: 'demo'
        });
        resolve({ connected: true });
      }, 1000);
    });
  }

  async function handleCall() {
    if (isCalling) {
      // Завершить звонок
      setIsCalling(false);
      setConnectionInfo({});
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionInfo({});

      // 1. Запрос доступа к микрофону
      await requestMicrophonePermission();

      // 2. Получение токена
      const tokenData = await getToken();

      // 3. Подключение к LiveKit
      await connectWithFallback(tokenData);

      setIsCalling(true);
      
    } catch (error) {
      console.error('Call failed:', error);
      setConnectionInfo({
        error: error instanceof Error ? error.message : 'Ошибка подключения'
      });
    } finally {
      setIsConnecting(false);
    }
  }

  const buttonText = isConnecting 
    ? 'Подключение...' 
    : isCalling 
      ? 'Завершить' 
      : 'Позвонить';

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '24px',
    border: 'none',
    fontWeight: '500',
    cursor: isConnecting ? 'not-allowed' : 'pointer',
    backgroundColor: isConnecting 
      ? '#6b7280' 
      : isCalling 
        ? '#ef4444' 
        : '#10b981',
    color: 'white',
    transition: 'all 0.2s',
    minWidth: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const containerStyle = {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Информация о подключении */}
      {connectionInfo.endpoint && (
        <div style={{
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '8px',
          whiteSpace: 'nowrap'
        }}>
          {connectionInfo.endpoint} ({connectionInfo.method})
        </div>
      )}

      {/* Ошибка */}
      {connectionInfo.error && (
        <div style={{
          fontSize: '12px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          marginBottom: '8px',
          maxWidth: '200px',
          wordWrap: 'break-word'
        }}>
          {connectionInfo.error}
        </div>
      )}

      {/* Основная кнопка */}
      <button
        onClick={handleCall}
        disabled={isConnecting}
        style={buttonStyle}
        aria-label={buttonText}
      >
        {isConnecting && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid white',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        
        {!isConnecting && (
          <span style={{ fontSize: '16px' }}>
            {isCalling ? '📞' : '📞'}
          </span>
        )}
        
        <span>{buttonText}</span>
      </button>

      {/* CSS для анимации спиннера */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Индикатор активного звонка */}
      {isCalling && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '0',
          width: '16px',
          height: '16px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: 'white'
        }}>
          🎤
        </div>
      )}
    </div>
  );
}

// Экспорт по умолчанию для удобства
export default SimpleFallbackWidget;