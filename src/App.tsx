import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from './store/useStore';
import { sendMessage } from './services/groqService';
import { Message } from './types';

import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const {
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
  } = useStore();

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // Create session if needed
      let session = currentSession;
      if (!session) {
        session = createSession();
      }

      const sessionId = session.id;

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        mode: settings.responseMode,
      };
      addMessage(sessionId, userMessage);

      // Create placeholder AI message
      const aiMsgId = uuidv4();
      const aiMessage: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        mode: settings.responseMode,
      };
      addMessage(sessionId, aiMessage);

      setIsLoading(true);

      try {
        let streamedContent = '';

        const onStream = settings.streamingEnabled
          ? (chunk: string) => {
              streamedContent += chunk;
              updateMessage(sessionId, aiMsgId, {
                content: streamedContent,
                isStreaming: true,
              });
            }
          : undefined;

        const result = await sendMessage(
          session.messages,
          text,
          settings.groqApiKey,
          settings.selectedModel,
          settings.responseMode,
          settings.temperature,
          settings.maxTokens,
          uploadedFiles,
          onStream
        );

        updateMessage(sessionId, aiMsgId, {
          content: result.content,
          isStreaming: false,
          agents: result.agents,
          sources: result.sources,
          confidence: result.confidence,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        updateMessage(sessionId, aiMsgId, {
          content: `⚠️ **Error:** ${errorMsg}`,
          isStreaming: false,
          error: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      currentSession,
      createSession,
      settings,
      uploadedFiles,
      addMessage,
      updateMessage,
      setIsLoading,
    ]
  );

  const handleQuickPrompt = useCallback(
    (text: string) => {
      if (!settings.groqApiKey) {
        setSettingsOpen(true);
        return;
      }
      handleSend(text);
    },
    [settings.groqApiKey, handleSend, setSettingsOpen]
  );

  const handleSelectSession = useCallback(
    (id: string) => {
      setCurrentSessionId(id);
    },
    [setCurrentSessionId]
  );

  const handleNewSession = useCallback(() => {
    const s = createSession();
    setCurrentSessionId(s.id);
  }, [createSession, setCurrentSessionId]);

  const hasApiKey = !!settings.groqApiKey;

  return (
    <div
      className="flex h-screen bg-gray-950 text-white overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        onOpenSettings={() => setSettingsOpen(true)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        uploadedFilesCount={uploadedFiles.length}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSession ? (
          <ChatArea
            session={currentSession}
            onClear={() => clearSession(currentSession.id)}
            showAgentLogs={settings.showAgentLogs}
            showSources={settings.showSources}
            showConfidence={settings.showConfidence}
            isLoading={isLoading}
          />
        ) : (
          <WelcomeScreen
            onPrompt={handleQuickPrompt}
            onOpenSettings={() => setSettingsOpen(true)}
            hasApiKey={hasApiKey}
          />
        )}

        {/* Input */}
        <ChatInput
          onSend={(text) => {
            if (!hasApiKey) {
              setSettingsOpen(true);
              return;
            }
            handleSend(text);
          }}
          isLoading={isLoading}
          responseMode={settings.responseMode}
          onModeChange={updateResponseMode}
          uploadedFiles={uploadedFiles}
          onAddFile={addFile}
          onRemoveFile={removeFile}
          disabled={!hasApiKey}
        />
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
