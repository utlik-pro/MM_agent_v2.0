import React, { useState, useEffect, useRef } from 'react';
import { LiveKitVoiceClient } from '../lib/livekit-client';
import type { CallState, VoiceWidgetConfig, VoiceWidgetProps } from '../types';

// Function to generate unique session ID for each user
const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Icons components
const MicrophoneIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const PhoneOffIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);



const defaultConfig: VoiceWidgetConfig = {
  tokenEndpoint: '/api/token', // Vercel serverless function
  roomName: '', // Will be set dynamically for each user


};

export const CallWidget: React.FC<VoiceWidgetProps> = ({ 
  config = {}, 
  onStateChange,
  onError,
  className = '' 
}: VoiceWidgetProps) => {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    micPermission: null,
  });

  const clientRef = useRef<LiveKitVoiceClient | null>(null);
  const sessionIdRef = useRef<string>('');
  
  // Generate unique session ID and create final config
  const sessionId = sessionIdRef.current || (sessionIdRef.current = generateSessionId());
  const finalConfig = { 
    ...defaultConfig, 
    ...config,
    roomName: config.roomName || sessionId // Use provided roomName or unique sessionId
  };

  useEffect(() => {
    // Initialize client
    // Send session ID to parent window for testing
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'widget-ready',
        sessionId: sessionId,
        roomName: finalConfig.roomName
      }, '*');
    }
    
    clientRef.current = new LiveKitVoiceClient(finalConfig, (state: CallState) => {
      setCallState(state);
      onStateChange?.(state);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, []);

  const handleCall = async () => {
    
    if (!clientRef.current) {
      return;
    }

    try {
      if (callState.isConnected) {
        await clientRef.current.disconnect();
      } else {
        await clientRef.current.connect();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Call failed'));
    }
  };

  const getButtonText = () => {
    if (callState.isConnecting) return 'Подключение...';
    if (callState.isConnected) return 'Завершить';
    return 'Позвонить';
  };

  const getButtonIcon = () => {
    if (callState.isConnecting) {
      return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
    }
    if (callState.isConnected) {
      return <PhoneOffIcon />;
    }
    return <PhoneIcon />;
  };

  const getButtonStyles = () => {
    if (callState.isConnected) {
      return 'voice-button voice-button-danger rounded-full';
    }
    return 'voice-button voice-button-primary rounded-full';
  };

  return (
    <div className={`voice-widget-container ${className}`}>
      {/* Call Button */}
      <button
        onClick={handleCall}
        disabled={callState.isConnecting}
        className={getButtonStyles()}
        aria-label={getButtonText()}
        aria-pressed={callState.isConnected}
        role="button"
      >
        <span className="mr-2">
          {getButtonIcon()}
        </span>
        <span className="text-sm font-medium">
          {getButtonText()}
        </span>
      </button>

      {/* Error Message */}
      {callState.error && (
        <div className="absolute bottom-full mb-2 right-0 bg-red-500 text-white px-3 py-2 rounded-lg text-xs shadow-lg max-w-xs">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{callState.error}</span>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      )}

      {/* Microphone Permission Info */}
      {callState.micPermission === 'denied' && (
        <div className="absolute bottom-full mb-2 right-0 bg-yellow-500 text-white px-3 py-2 rounded-lg text-xs shadow-lg max-w-xs">
          <div className="flex items-center">
            <MicrophoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Разрешите доступ к микрофону для звонка</span>
          </div>
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-yellow-500"></div>
        </div>
      )}
    </div>
  );
};

export default CallWidget; 