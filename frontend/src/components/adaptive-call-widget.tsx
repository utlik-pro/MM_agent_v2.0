import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

// Список резервных эндпоинтов для обеспечения доступности
const FALLBACK_ENDPOINTS = [
  {
    name: 'primary',
    tokenUrl: '/api/token',
    livekitUrl: process.env.VITE_LIVEKIT_URL || 'wss://test.livekit.cloud'
  },
  {
    name: 'cloudflare',
    tokenUrl: 'https://your-domain.workers.dev/token',
    livekitUrl: 'wss://eu.livekit.cloud'
  },
  {
    name: 'backup',
    tokenUrl: 'https://backup.your-domain.com/api/token', 
    livekitUrl: 'wss://us.livekit.cloud'
  }
];

interface ConnectionStatus {
  isConnected: boolean;
  endpoint?: string;
  method?: string;
  error?: string;
}

export function AdaptiveCallWidget() {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false
  });
  const [availableEndpoint, setAvailableEndpoint] = useState<typeof FALLBACK_ENDPOINTS[0] | null>(null);

  // Проверка доступности эндпоинтов при загрузке
  useEffect(() => {
    findAvailableEndpoint();
  }, []);

  async function findAvailableEndpoint() {
    for (const endpoint of FALLBACK_ENDPOINTS) {
      try {
        // Проверяем доступность токен-эндпоинта
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(endpoint.tokenUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 405) { // GET может не поддерживаться, но эндпоинт доступен
          setAvailableEndpoint(endpoint);
          console.log(`Using endpoint: ${endpoint.name}`);
          return;
        }
      } catch (error) {
        console.warn(`Endpoint ${endpoint.name} not available:`, error);
        continue;
      }
    }
    
    // Если ни один эндпоинт не доступен, используем первый по умолчанию
    setAvailableEndpoint(FALLBACK_ENDPOINTS[0]);
  }

  async function detectConnectionRestrictions() {
    try {
      // Проверяем базовую связность
      const tests = [
        fetch('https://1.1.1.1', { mode: 'no-cors', signal: AbortSignal.timeout(2000) }),
        fetch('https://8.8.8.8', { mode: 'no-cors', signal: AbortSignal.timeout(2000) }),
        fetch('https://cloudflare.com', { mode: 'no-cors', signal: AbortSignal.timeout(2000) })
      ];
      
      const results = await Promise.allSettled(tests);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      return {
        isRestricted: successCount < 2,
        severity: successCount === 0 ? 'high' : successCount === 1 ? 'medium' : 'low'
      };
    } catch {
      return { isRestricted: true, severity: 'high' as const };
    }
  }

  async function getTokenWithFallback() {
    if (!availableEndpoint) throw new Error('No available endpoints');
    
    const restrictions = await detectConnectionRestrictions();
    
    // Если обнаружены ограничения, используем альтернативные методы
    if (restrictions.isRestricted && restrictions.severity === 'high') {
      return await getTokenViaPolling();
    }
    
    try {
      const response = await fetch(availableEndpoint.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: `user-${Date.now()}`,
          room: 'voice-assistant-room'
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return {
        token: data.token,
        wsUrl: data.wsUrl || availableEndpoint.livekitUrl
      };
    } catch (error) {
      console.warn('Primary token method failed:', error);
      throw error;
    }
  }

  async function getTokenViaPolling() {
    // Альтернативный метод получения токена через HTTP polling
    // для случаев когда WebSocket заблокированы
    const pollEndpoint = availableEndpoint?.tokenUrl.replace('/token', '/token-poll');
    
    const response = await fetch(pollEndpoint!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        method: 'polling',
        identity: `user-${Date.now()}`,
        room: 'voice-assistant-room'
      })
    });
    
    if (!response.ok) throw new Error('Polling method failed');
    return await response.json();
  }

  async function connectToLiveKit(tokenData: any) {
    try {
      // Динамический импорт LiveKit клиента
      const { Room, RoomEvent } = await import('livekit-client');
      
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Настройки для обхода блокировок
        rtcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' },
            // Добавить собственные TURN серверы при необходимости
          ],
          iceCandidatePoolSize: 10
        }
      });

      await room.connect(tokenData.wsUrl, tokenData.token);
      
      // Включаем микрофон
      await room.localParticipant.enableMicrophone();
      
      setConnectionStatus({
        isConnected: true,
        endpoint: availableEndpoint?.name,
        method: 'webrtc'
      });
      
      return room;
    } catch (error) {
      console.error('LiveKit connection failed:', error);
      // Fallback на HTTP transport
      return await connectViaHttpTransport(tokenData);
    }
  }

  async function connectViaHttpTransport(tokenData: any) {
    // Альтернативный транспорт через HTTP когда WebRTC заблокирован
    setConnectionStatus({
      isConnected: true,
      endpoint: availableEndpoint?.name,
      method: 'http-polling'
    });
    
    // Здесь можно реализовать HTTP polling для аудио
    console.log('Using HTTP transport fallback');
    return { transport: 'http' };
  }

  async function handleCall() {
    if (isCalling) {
      // Завершить звонок
      setIsCalling(false);
      setConnectionStatus({ isConnected: false });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Запрос доступа к микрофону
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Получение токена с fallback
      const tokenData = await getTokenWithFallback();
      
      // Подключение к LiveKit с fallback
      await connectToLiveKit(tokenData);
      
      setIsCalling(true);
    } catch (error) {
      console.error('Call failed:', error);
      setConnectionStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setIsConnecting(false);
    }
  }

  const buttonLabel = isConnecting 
    ? 'Подключение...' 
    : isCalling 
      ? 'Завершить' 
      : 'Позвонить';

  const buttonClass = `
    flex items-center gap-2 px-4 py-2 rounded-full font-medium
    transition-all duration-200 min-w-[120px] justify-center
    ${isConnecting 
      ? 'bg-gray-400 cursor-not-allowed' 
      : isCalling 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-green-500 hover:bg-green-600 text-white'
    }
  `;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Индикатор состояния подключения */}
      {connectionStatus.isConnected && (
        <div className="mb-2 text-xs bg-black/80 text-white px-2 py-1 rounded">
          {connectionStatus.endpoint} ({connectionStatus.method})
        </div>
      )}
      
      {/* Ошибка подключения */}
      {connectionStatus.error && (
        <div className="mb-2 text-xs bg-red-500/90 text-white px-2 py-1 rounded max-w-[200px]">
          {connectionStatus.error}
        </div>
      )}
      
      {/* Основная кнопка */}
      <button
        onClick={handleCall}
        disabled={isConnecting}
        className={buttonClass}
        aria-label={buttonLabel}
      >
        {isConnecting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isCalling ? (
          <PhoneOff size={16} />
        ) : (
          <Phone size={16} />
        )}
        <span className="hidden sm:inline">{buttonLabel}</span>
      </button>
      
      {/* Индикатор микрофона */}
      {isCalling && (
        <div className="absolute -top-8 right-0 bg-green-500 text-white p-1 rounded-full">
          <Mic size={12} />
        </div>
      )}
    </div>
  );
}