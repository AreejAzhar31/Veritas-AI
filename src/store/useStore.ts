import { useState, useCallback } from 'react';
import { AppSettings, ConversationSession, Message, UploadedFile, ResponseMode } from '../types';
import { DEFAULT_MODEL } from '../constants/models';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: '',
  selectedModel: DEFAULT_MODEL,
  responseMode: 'detailed',
  temperature: 0.7,
  maxTokens: 2048,
  streamingEnabled: true,
  showAgentLogs: true,
  showSources: true,
  showConfidence: true,
};

function createNewSession(model: string): ConversationSession {
  return {
    id: uuidv4(),
    title: 'New Conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    model,
  };
}

export function useStore() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('veritas_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [sessions, setSessions] = useState<ConversationSession[]>(() => {
    try {
      const saved = localStorage.getItem('veritas_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: ConversationSession) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      }
    } catch {}
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('veritas_settings', JSON.stringify(newSettings));
    } catch {}
  }, []);

  const saveSessions = useCallback((newSessions: ConversationSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem('veritas_sessions', JSON.stringify(newSessions));
    } catch {}
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) ?? null;

  const createSession = useCallback(() => {
    const session = createNewSession(settings.selectedModel);
    const newSessions = [session, ...sessions];
    saveSessions(newSessions);
    setCurrentSessionId(session.id);
    return session;
  }, [sessions, settings.selectedModel, saveSessions]);

  const deleteSession = useCallback(
    (id: string) => {
      const newSessions = sessions.filter((s) => s.id !== id);
      saveSessions(newSessions);
      if (currentSessionId === id) {
        setCurrentSessionId(newSessions[0]?.id ?? null);
      }
    },
    [sessions, currentSessionId, saveSessions]
  );

  const addMessage = useCallback(
    (sessionId: string, message: Message) => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const messages = [...s.messages, message];
          const title =
            s.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
              : s.title;
          return { ...s, messages, title, updatedAt: new Date() };
        });
        try {
          localStorage.setItem('veritas_sessions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const updateMessage = useCallback(
    (sessionId: string, messageId: string, updates: Partial<Message>) => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const messages = s.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          );
          return { ...s, messages, updatedAt: new Date() };
        });
        try {
          localStorage.setItem('veritas_sessions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const clearSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, messages: [], title: 'New Conversation', updatedAt: new Date() } : s
        );
        try {
          localStorage.setItem('veritas_sessions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const addFile = useCallback((file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev, file]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateResponseMode = useCallback(
    (mode: ResponseMode) => {
      saveSettings({ ...settings, responseMode: mode });
    },
    [settings, saveSettings]
  );

  return {
    settings,
    saveSettings,
    sessions,
    currentSession,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    deleteSession,
    addMessage,
    updateMessage,
    clearSession,
    uploadedFiles,
    addFile,
    removeFile,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    isLoading,
    setIsLoading,
    updateResponseMode,
  };
}
