export type ResponseMode = 'keyword' | 'detailed' | 'authenticity' | 'research';

export interface GroqModel {
  id: string;
  name: string;
  contextWindow: number;
  maxTokens: number;
  speed: string;
  category: 'production' | 'preview' | 'audio';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
  confidence?: number;
  agents?: AgentLog[];
  mode?: ResponseMode;
  isStreaming?: boolean;
  error?: boolean;
}

export interface Source {
  name: string;
  url?: string;
  credibility: number;
  recency: string;
  type: 'web' | 'document' | 'database' | 'user-upload';
  excerpt?: string;
}

export interface AgentLog {
  agentName: string;
  action: string;
  status: 'running' | 'done' | 'error';
  details?: string;
  timestamp: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
}

export interface ConversationSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

export interface AppSettings {
  groqApiKey: string;
  selectedModel: string;
  responseMode: ResponseMode;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
  showAgentLogs: boolean;
  showSources: boolean;
  showConfidence: boolean;
}
