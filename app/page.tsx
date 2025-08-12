'use client';

import { useState, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, ParticipantTile, TrackLoop, useDataChannel, useRemoteParticipants, useIsSpeaking, useConnectionState, useLocalParticipant, useRoomContext, useTracks } from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';
import '@livekit/components-styles';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:5000';

// Inner component that uses the speaking hook with a valid participant
const SpeakingIndicator = ({ participant }: { participant: any }) => {
  const isSpeaking = useIsSpeaking(participant);
  
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background glow effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isSpeaking 
            ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl scale-125' 
            : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl scale-100'
        }`}></div>
        
        {/* Main speaking circle */}
        <div className={`relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 flex items-center justify-center ${
          isSpeaking 
            ? 'scale-110 shadow-2xl shadow-purple-500/50' 
            : 'scale-100 shadow-xl shadow-purple-500/20'
        }`}>
          {/* Inner circles for depth */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-indigo-600/50 to-purple-600/50 transition-all duration-300 ${
            isSpeaking ? 'scale-105' : 'scale-100'
          }`}></div>
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-indigo-700/30 to-purple-700/30 transition-all duration-300 ${
            isSpeaking ? 'scale-110' : 'scale-100'
          }`}></div>
          
          {/* Center pulse */}
          <div className={`relative w-24 h-24 rounded-full bg-white/20 transition-all duration-300 ${
            isSpeaking ? 'scale-110 bg-white/30' : 'scale-100'
          }`}></div>
        </div>
        
        {/* Animated rings when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute w-56 h-56 rounded-full border-2 border-indigo-400/60 animate-ping"></div>
            <div className="absolute w-64 h-64 rounded-full border border-purple-400/40 animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute w-72 h-72 rounded-full border border-pink-400/20 animate-ping" style={{ animationDelay: '0.6s' }}></div>
          </>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <div className="text-white font-bold text-2xl mb-2">
          AI Sales Agent
        </div>
        <div className={`text-lg font-medium transition-all duration-300 ${
          isSpeaking 
            ? 'text-purple-400 scale-105' 
            : 'text-gray-400 scale-100'
        }`}>
          {isSpeaking ? 'Speaking...' : 'Listening...'}
        </div>
        <div className="mt-4 text-gray-500 text-sm">
          Powered by LiveKit
        </div>
      </div>
    </div>
  );
};

// Main component that handles participant loading
const AgentSpeakingCircle = () => {
  const remoteParticipants = useRemoteParticipants();
  const connectionState = useConnectionState();
  
  // Find the agent participant (usually the first remote participant)
  const agentParticipant = remoteParticipants[0];
  
  // Show loading state while connecting
  if (connectionState !== ConnectionState.Connected || !agentParticipant) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-gray-700 animate-pulse"></div>
        </div>
        <div className="mt-8 text-gray-400 font-medium">
          Connecting to agent...
        </div>
      </div>
    );
  }
  
  return <SpeakingIndicator participant={agentParticipant} />;
};

// Local participant camera tile; enables local camera/mic on connect
const LocalCameraTile = () => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const localCameraTracks = cameraTracks.filter((t) => t.participant.isLocal);

  useEffect(() => {
    if (connectionState === ConnectionState.Connected && room) {
      room.localParticipant.setCameraEnabled(true).catch(() => {});
      room.localParticipant.setMicrophoneEnabled(true).catch(() => {});
    }
  }, [connectionState, room]);

  if (!localParticipant) return null;

  return (
    <div className="h-full">
      <TrackLoop tracks={localCameraTracks}>
        <ParticipantTile style={{ height: '100%', width: '100%' }} />
      </TrackLoop>
    </div>
  );
};

export default function Home() {
  const [roomName] = useState('test-room');
  const [agentRunning, setAgentRunning] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [cerebrasKey, setCerebrasKey] = useState('');
  const [cartesiaKey, setCartesiaKey] = useState('');

  const startAgent = async () => {
    try {
      await fetch(`/api/agent/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cerebrasKey, cartesiaKey }),
      });
      setAgentRunning(true);

      // fetch LiveKit token
      const res = await fetch(`/api/token?room=${roomName}&name=demo-user`);
      const json = await res.json();
      setToken(json.token);
      setServerUrl(json.url);
    } catch (err) {
      console.error('Failed to start agent', err);
    }
  };

  const lkServerUrl = serverUrl ?? process.env.NEXT_PUBLIC_LK_URL ?? 'wss://streaming-stt-9p0iel8m.livekit.cloud';

  // Helper component that logs transcript messages once inside LiveKitRoom context
  const TranscriptLogger = () => {
    const { message } = useDataChannel('agent_transcript');
    useEffect(() => {
      if (message) {
        try {
          const text = new TextDecoder().decode(message.payload as unknown as Uint8Array);
          console.log('[Agent]', text);
        } catch {
          /* ignore */
        }
      }
    }, [message]);
    return null;
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Override div to prevent blue background */}
      <div className="fixed inset-0 bg-stone-900 -z-10" ></div>

      {/* Main Content */}
      <div className="flex-1 flex items-center bg-stone-900 justify-center p-6">
        {!token ? (
          <div className="bg-stone-900 rounded-lg p-8 max-w-md w-full border border-gray-700">
            <div className="text-center bg-stone-900 space-y-6">
              <div className="w-16 h-16 bg-stone-900 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Join AI Agent Call</h2>
                <p className="text-gray-400 text-sm">Start a conversation with our AI sales agent</p>
              </div>

              {/* API key inputs */}
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cerebras API Key</label>
                  <input
                    type="password"
                    value={cerebrasKey}
                    onChange={(e) => setCerebrasKey(e.target.value)}
                    placeholder="csk-..."
                    className="w-full px-3 py-2 rounded bg-stone-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cartesia API Key</label>
                  <input
                    type="password"
                    value={cartesiaKey}
                    onChange={(e) => setCartesiaKey(e.target.value)}
                    placeholder="sk_car_..."
                    className="w-full px-3 py-2 rounded bg-stone-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={startAgent}
                disabled={agentRunning || !cerebrasKey || !cartesiaKey}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 w-full"
              >
                {agentRunning ? 'Connecting...' : 'Start Call'}
              </button>

              {agentRunning && (
                <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Agent connecting...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={lkServerUrl}
            connect
            data-lk-theme="default"
            style={{ width: '100%' }}
          >
            <RoomAudioRenderer />
            <div className="w-[95vw] h-[50vh] mx-auto flex items-center justify-center gap-8">
              {/* Left: speaking section */}
              <div className="flex-1 h-full rounded-lg border border-gray-700 bg-stone-900 flex items-center justify-center p-8">
                <AgentSpeakingCircle />
              </div>
              {/* Right: local camera */}
              <div className="flex-1 h-full rounded-lg border border-gray-700 overflow-hidden bg-stone-900">
                <LocalCameraTile />
              </div>
            </div>
            <TranscriptLogger />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}
