
import {
  MessageSquarePlus,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Clock,
  FileText,
} from 'lucide-react';
import { ConversationSession } from '../types';

interface SidebarProps {
  sessions: ConversationSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  uploadedFilesCount: number;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings,
  sidebarOpen,
  setSidebarOpen,
  uploadedFilesCount,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-300 ${
        sidebarOpen ? 'w-72' : 'w-16'
      } shrink-0`}
    >
      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white hover:bg-indigo-500 transition-colors shadow-lg"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
          <Bot size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="text-white font-bold text-base leading-tight">VeritasAI</h1>
            <p className="text-gray-500 text-xs">RAG Intelligence</p>
          </div>
        )}
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={onNewSession}
          className={`w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 transition-all font-medium text-sm ${
            sidebarOpen ? 'px-3' : 'justify-center px-0'
          }`}
        >
          <MessageSquarePlus size={16} />
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {sidebarOpen && sessions.length > 0 && (
          <p className="text-gray-600 text-xs font-medium px-2 py-1 uppercase tracking-wider">
            Recent Chats
          </p>
        )}
        {sessions.map((session) => (
          <div key={session.id} className="group relative">
            <button
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left rounded-lg transition-all ${
                sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2 flex justify-center'
              } ${
                currentSessionId === session.id
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {sidebarOpen ? (
                <div>
                  <p className="text-sm font-medium truncate leading-tight">{session.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-xs text-gray-600">
                      {formatTime(new Date(session.updatedAt))}
                    </span>
                    <span className="text-gray-700 mx-1">·</span>
                    <span className="text-xs text-gray-600">
                      {session.messages.length} msgs
                    </span>
                  </div>
                </div>
              ) : (
                <MessageSquarePlus size={16} />
              )}
            </button>
            {sidebarOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-900/40 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
        {sessions.length === 0 && sidebarOpen && (
          <div className="text-center py-8 text-gray-600">
            <MessageSquarePlus size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-3 py-3 border-t border-gray-800 space-y-1">
        {uploadedFilesCount > 0 && sidebarOpen && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-xs">
            <FileText size={12} />
            <span>{uploadedFilesCount} file{uploadedFilesCount > 1 ? 's' : ''} uploaded</span>
          </div>
        )}
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <Settings size={16} />
          {sidebarOpen && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
