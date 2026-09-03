import { useEffect, useRef } from 'react';
import { Trash2, RefreshCw, Bot } from 'lucide-react';
import { ConversationSession } from '../types';
import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  session: ConversationSession;
  onClear: () => void;
  showAgentLogs: boolean;
  showSources: boolean;
  showConfidence: boolean;
  isLoading: boolean;
}

export default function ChatArea({
  session,
  onClear,
  showAgentLogs,
  showSources,
  showConfidence,
  isLoading,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-gray-300 truncate max-w-md">
            {session.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-mono bg-gray-800 px-2 py-1 rounded-md">
            {session.model}
          </span>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-950/20"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {session.messages.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Bot size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Start the conversation...</p>
          </div>
        )}

        {session.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            showAgentLogs={showAgentLogs}
            showSources={showSources}
            showConfidence={showConfidence}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={12} className="animate-spin text-indigo-400" />
            <span className="text-indigo-400">VeritasAI agents processing your query...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
