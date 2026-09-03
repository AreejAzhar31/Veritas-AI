import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Square } from 'lucide-react';
import { ResponseMode, UploadedFile } from '../types';
import { RESPONSE_MODES } from '../constants/models';
import FileUpload from './FileUpload';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  responseMode: ResponseMode;
  onModeChange: (mode: ResponseMode) => void;
  uploadedFiles: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  isLoading,
  responseMode,
  onModeChange,
  uploadedFiles,
  onAddFile,
  onRemoveFile,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [showFiles, setShowFiles] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setText('');
    setShowFiles(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800 px-4 py-4">
      {/* Mode selector */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {RESPONSE_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              responseMode === mode.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
        {uploadedFiles.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/30 text-emerald-400 text-xs whitespace-nowrap">
            <span>{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} loaded</span>
          </div>
        )}
      </div>

      {/* File upload panel */}
      {showFiles && (
        <div className="mb-3">
          <FileUpload
            uploadedFiles={uploadedFiles}
            onAddFile={onAddFile}
            onRemoveFile={onRemoveFile}
          />
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowFiles(!showFiles)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            showFiles || uploadedFiles.length > 0
              ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-400'
              : 'bg-gray-800 border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
          }`}
        >
          {showFiles ? <X size={16} /> : <Paperclip size={16} />}
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder={
              disabled
                ? 'Add your Groq API key in Settings to start...'
                : 'Ask anything... (Shift+Enter for new line)'
            }
            rows={1}
            className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 text-sm resize-none focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '160px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all shadow-lg"
        >
          {isLoading ? <Square size={14} /> : <Send size={15} />}
        </button>
      </div>

      <p className="text-center text-xs text-gray-700 mt-2">
        VeritasAI reduces hallucinations through multi-agent verification • Powered by Groq
      </p>
    </div>
  );
}
