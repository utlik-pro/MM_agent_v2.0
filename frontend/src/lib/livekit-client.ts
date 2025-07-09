import { 
  Room, 
  RoomEvent, 
  RoomOptions, 
  VideoPresets, 
  createLocalAudioTrack
} from 'livekit-client';
import type { TokenResponse, CallState, VoiceWidgetConfig } from '../types';

export class LiveKitVoiceClient {
  private room: Room | null = null;
  private isConnecting = false;
  private config: VoiceWidgetConfig;
  private onStateChange?: (state: CallState) => void;

  constructor(config: VoiceWidgetConfig, onStateChange?: (state: CallState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
    console.log('✅ LiveKit client initialized with config:', config);
  }

  private updateState(updates: Partial<CallState>) {
    if (this.onStateChange) {
      const currentState: CallState = {
        isConnected: this.room?.state === 'connected',
        isConnecting: this.isConnecting,
        error: null,
        micPermission: null,
        ...updates
      };
      this.onStateChange(currentState);
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      this.updateState({ micPermission: 'prompt' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Close the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      this.updateState({ micPermission: 'granted' });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      this.updateState({ 
        micPermission: 'denied',
        error: 'Необходимо разрешение на использование микрофона'
      });
      return false;
    }
  }

  private async getAccessToken(): Promise<TokenResponse> {
    console.log('🔗 Fetching token from:', this.config.tokenEndpoint);
    
    const requestBody = {
      identity: this.config.userId || `user-${Date.now()}`,
      room: this.config.roomName || 'voice-assistant-room',
    };
    
    console.log('📤 Request payload:', requestBody);
    
    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token request failed:', errorText);
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('✅ Received token data:', {
        ...tokenData,
        token: tokenData.token ? `${tokenData.token.substring(0, 20)}...` : 'missing'
      });
      
      return tokenData;
    } catch (error) {
      console.error('🚨 Network error getting token:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    console.log('🎯 Starting connection process...');
    
    if (this.isConnecting || this.room?.state === 'connected') {
      console.log('⚠️ Already connecting or connected, skipping...');
      return;
    }

    try {
      this.isConnecting = true;
      this.updateState({ isConnecting: true, error: null });
      console.log('🔄 Set connecting state to true');

      // Request microphone permission first
      console.log('🎤 Requesting microphone permission...');
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        console.error('❌ Microphone permission denied');
        throw new Error('Microphone permission required');
      }
      console.log('✅ Microphone permission granted');

      // Get access token
      console.log('🔑 Getting access token...');
      const tokenData = await this.getAccessToken();
      console.log('✅ Token received successfully');
      
      // Create room options
      console.log('⚙️ Creating room options...');
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoCodec: 'h264',
        },
        videoCaptureDefaults: {
          resolution: VideoPresets.h360.resolution,
        },
      };

      // Connect to room
      console.log('🏠 Creating room and connecting to:', tokenData.wsUrl);
      this.room = new Room(roomOptions);
      
      console.log('🔗 Attempting to connect to LiveKit...');
      await this.room.connect(tokenData.wsUrl, tokenData.token);
      console.log('✅ Connected to room successfully');
      
      // Set up event listeners
      console.log('👂 Setting up event listeners...');
      this.setupEventListeners();

      // Create and publish audio track
      console.log('🎵 Creating local audio track...');
      const audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      console.log('✅ Audio track created');

      console.log('📡 Publishing audio track...');
      await this.room.localParticipant.publishTrack(audioTrack);
      console.log('✅ Audio track published');

      this.updateState({ 
        isConnected: true, 
        isConnecting: false,
        error: null 
      });

      console.log('🎉 Connected to LiveKit voice room successfully!');
      
    } catch (error) {
      console.error('❌ Failed to connect to LiveKit:', error);
      this.updateState({ 
        isConnected: false, 
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('🔗 Room connected');
      this.updateState({ isConnected: true, isConnecting: false });
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('🔌 Room disconnected');
      this.updateState({ isConnected: false, isConnecting: false });
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('🔄 Room reconnecting...');
      this.updateState({ isConnecting: true });
    });

    this.room.on(RoomEvent.Reconnected, () => {
      console.log('✅ Room reconnected');
      this.updateState({ isConnected: true, isConnecting: false });
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('👤 Participant connected:', participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('👋 Participant disconnected:', participant.identity);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      console.log('🎵 Track subscribed:', track.kind, 'from', participant.identity);
      
      if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        audioElement.play();
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
      console.log('🔇 Track unsubscribed:', track.kind, 'from', participant.identity);
      track.detach();
    });
  }

  async disconnect(): Promise<void> {
    if (!this.room) return;

    try {
      console.log('🔌 Disconnecting from LiveKit...');
      
      // Stop all local tracks
      this.room.localParticipant.audioTrackPublications.forEach((publication) => {
        publication.track?.stop();
      });
      
      // Disconnect from room
      await this.room.disconnect();
      this.room = null;
      
      this.updateState({ 
        isConnected: false, 
        isConnecting: false,
        error: null 
      });
      
      console.log('✅ Disconnected from LiveKit');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Disconnect failed' 
      });
    }
  }

  isConnected(): boolean {
    return this.room?.state === 'connected';
  }

  getConnectionState(): CallState {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      error: null,
      micPermission: null,
    };
  }

  destroy(): void {
    if (this.room) {
      this.disconnect();
    }
  }
} 