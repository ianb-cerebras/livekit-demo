'use client';

import { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useDataChannel } from '@livekit/components-react';
import '@livekit/components-styles';

export default function Home() {
  const [roomName] = useState('test-room');
  const [agentRunning, setAgentRunning] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const startAgent = async () => {
    try {
      await fetch('http://127.0.0.1:5000/agent/start', { method: 'POST' });
      setAgentRunning(true);

      // fetch LiveKit token
      const res = await fetch(`/api/token?room=${roomName}&name=demo-user`);
      const json = await res.json();
      setToken(json.token);
    } catch (err) {
      console.error('Failed to start agent', err);
    }
  };

  const lkServerUrl = process.env.NEXT_PUBLIC_LK_URL ?? 'wss://streaming-stt-9p0iel8m.livekit.cloud';

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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-white text-lg font-medium">LiveKit Demo Call</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {!token ? (
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Join AI Agent Call</h2>
                <p className="text-gray-400 text-sm">Start a conversation with our AI sales agent</p>
              </div>

              <button
                onClick={startAgent}
                disabled={agentRunning}
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
          <div className="w-[95vw] h-[95vh] flex gap-4">
            {/* Left side */}
            <div className="flex-1 bg-gray-900 rounded-lg border-gray-700">

              <div className="h-full">
                <LiveKitRoom
                  token={token}
                  serverUrl={lkServerUrl}
                  connect
                  data-lk-theme="default"
                  style={{ height: '100%', width: '100%' }}
                >
                  <RoomAudioRenderer />
                  <VideoConference />
                  <TranscriptLogger />
                </LiveKitRoom>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!token && (
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="text-center text-gray-400 text-sm">
            <p>• AI agent will automatically join the call</p>
            <p>• Speak naturally to interact with the agent</p>
            <p>• Agent can transfer to specialists as needed</p>
          </div>
        </div>
      )}
    </div>
  );
}
