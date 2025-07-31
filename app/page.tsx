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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">LiveKit Sales Agent</h1>
        
        <div className="space-y-4">
          {!token && (
          <div className="text-center space-y-4">
            <button
              onClick={startAgent}
              disabled={agentRunning}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {agentRunning ? 'Agent Running' : 'Start Voice Agent'}
            </button>

            {agentRunning && (
              <p className="text-sm text-green-600">Agent started – open the room to talk.</p>
            )}
          </div>) }

          {token && (
            <div className="h-[80vh] w-full">
              <LiveKitRoom
                token={token}
                serverUrl={lkServerUrl}
                connect
                data-lk-theme="default"
                style={{ height: '100%' }}
              >
                <RoomAudioRenderer />
                <VideoConference />
                <TranscriptLogger />
              </LiveKitRoom>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>• The agent will automatically join the room</p>
          <p>• Speak to interact with the AI sales agent</p>
          <p>• The agent can transfer between specialists</p>
        </div>
      </div>
    </div>
  );
}
