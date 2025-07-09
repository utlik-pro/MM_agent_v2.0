export interface VoiceWidgetConfig {
  tokenEndpoint: string;
  wsUrl?: string;
  userId?: string;
  roomName?: string;
}

export interface TokenResponse {
  token: string;
  wsUrl: string;
  identity: string;
  room: string;
}

export interface CallState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  micPermission: 'granted' | 'denied' | 'prompt' | null;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export type CallStatus = 'idle' | 'requesting-permission' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface VoiceWidgetProps {
  config?: Partial<VoiceWidgetConfig>;
  onStateChange?: (state: CallState) => void;
  onError?: (error: Error) => void;
  className?: string;
} 