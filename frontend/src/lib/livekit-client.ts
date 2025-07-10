import { Room, RoomEvent, Track, RemoteTrack, LocalAudioTrack, ParticipantKind } from 'livekit-client';
import type { VoiceWidgetConfig, CallState } from '../types';

interface TokenResponse {
  token: string;
  wsUrl: string;
  room: string;
  identity: string;
}

export class LiveKitVoiceClient {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private config: VoiceWidgetConfig;
  private onStateChange: (state: CallState) => void;
  private currentState: CallState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    micPermission: null,
  };

  constructor(config: VoiceWidgetConfig, onStateChange: (state: CallState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
    console.log('🔧 LiveKitVoiceClient initialized with config:', config);
  }

  private updateState(newState: Partial<CallState>) {
    this.currentState = { ...this.currentState, ...newState };
    console.log('📊 State updated:', this.currentState);
    this.onStateChange(this.currentState);
  }

  async connect(): Promise<void> {
    if (this.currentState.isConnecting || this.currentState.isConnected) {
      console.warn('⚠️ Already connecting or connected, ignoring connect request');
      return;
    }

    console.log('🚀 Starting connection process...');
    this.updateState({ isConnecting: true, error: null });

    try {
      // Step 1: Check microphone permission
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      
      // Close the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      this.updateState({ micPermission: 'granted' });

      // Step 2: Request token
      console.log('🔑 Requesting LiveKit token...');
      const tokenResponse = await this.requestToken();
      console.log('✅ Token received:', { 
        hasToken: !!tokenResponse.token, 
        wsUrl: tokenResponse.wsUrl,
        room: tokenResponse.room,
        identity: tokenResponse.identity 
      });

      // Step 3: Connect to room
      console.log('🔗 Connecting to LiveKit room...');
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          audioPreset: {
            maxBitrate: 20_000,
          },
        },
      });

      // Add event listeners BEFORE connecting
      this.setupRoomEventListeners();

      // Connect to room
      await this.room.connect(tokenResponse.wsUrl, tokenResponse.token);
      console.log('✅ Connected to LiveKit room successfully');

      // Step 4: Publish audio track
      console.log('🎤 Publishing local audio track...');
      await this.publishAudioTrack();
      console.log('✅ Audio track published successfully');

      this.updateState({ 
        isConnected: true, 
        isConnecting: false,
        error: null 
      });

      console.log('🎉 Voice call connection completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      console.error('❌ Connection failed:', error);
      this.updateState({
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
        micPermission: errorMessage.includes('Permission') ? 'denied' : this.currentState.micPermission
      });
      
      // Clean up on error
      await this.cleanup();
      throw error;
    }
  }

  private async requestToken(): Promise<TokenResponse> {
    console.log('🔑 Making token request to:', this.config.tokenEndpoint);
    
    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room: this.config.roomName,
          identity: `user-${Date.now()}`,
        }),
      });

      console.log('📡 Token response status:', response.status);

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

  private setupRoomEventListeners() {
    if (!this.room) return;

    console.log('🔧 Setting up room event listeners...');

    this.room.on(RoomEvent.Connected, () => {
      console.log('🏠 Room connected event fired');
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log('🚪 Room disconnected:', reason);
      this.updateState({ 
        isConnected: false, 
        isConnecting: false,
        error: reason ? `Disconnected: ${reason}` : null
      });
    });

    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log('🔄 Connection state changed:', state);
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('👤 Participant connected:', participant.identity, participant.kind);
      
      // Check if it's an agent
      if (participant.kind === ParticipantKind.AGENT) {
        console.log('🤖 AI Agent joined the room!');
      }
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('👋 Participant disconnected:', participant.identity);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant) => {
      console.log('📡 Track subscribed:', {
        kind: track.kind,
        source: track.source,
        participant: participant.identity
      });

      if (track.kind === Track.Kind.Audio) {
        console.log('🔊 Audio track from agent received');
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        audioElement.play().catch(e => console.warn('Audio autoplay failed:', e));
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication, participant) => {
      console.log('📴 Track unsubscribed:', track.kind, participant.identity);
      track.detach();
    });

    this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      console.log('🔊 Audio playback status changed');
    });

    // Add error handling
    this.room.on(RoomEvent.MediaDevicesError, (error) => {
      console.error('🎤 Media device error:', error);
      this.updateState({ error: `Media error: ${error.message}` });
    });

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
      console.log('📶 Connection quality:', quality, participant?.identity || 'local');
    });
  }

  private async publishAudioTrack(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not connected');
    }

    console.log('🎤 Creating local audio track...');
    
    try {
      // Enable microphone for the local participant
      await this.room.localParticipant.setMicrophoneEnabled(true);
      console.log('✅ Microphone enabled successfully');

      // Find the created audio track
      const audioPublication = Array.from(this.room.localParticipant.audioTrackPublications.values())[0];
      if (audioPublication?.track) {
        this.localAudioTrack = audioPublication.track as LocalAudioTrack;
        console.log('🎵 Local audio track created and published');
      } else {
        console.warn('⚠️ Could not find local audio track after enabling microphone');
      }

    } catch (error) {
      console.error('❌ Failed to publish audio track:', error);
      throw error;
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Disconnect failed';
      console.error('❌ Error disconnecting:', error);
      this.updateState({ 
        error: errorMessage
      });
    }
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up LiveKit client...');
    if (this.room) {
      await this.disconnect();
    }
  }

  isConnected(): boolean {
    return this.room?.state === 'connected';
  }

  getConnectionState(): CallState {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.currentState.isConnecting,
      error: this.currentState.error,
      micPermission: this.currentState.micPermission,
    };
  }

  destroy(): void {
    if (this.room) {
      this.disconnect();
    }
  }
} 