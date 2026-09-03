import { GroqModel } from '../types';

export const GROQ_MODELS: GroqModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    contextWindow: 131072,
    maxTokens: 32768,
    speed: '280 T/s',
    category: 'production',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    contextWindow: 131072,
    maxTokens: 131072,
    speed: '560 T/s',
    category: 'production',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    contextWindow: 131072,
    maxTokens: 65536,
    speed: '500 T/s',
    category: 'production',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    contextWindow: 131072,
    maxTokens: 65536,
    speed: '1000 T/s',
    category: 'production',
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    contextWindow: 131072,
    maxTokens: 8192,
    speed: '750 T/s',
    category: 'preview',
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    contextWindow: 131072,
    maxTokens: 40960,
    speed: '400 T/s',
    category: 'preview',
  },
];

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export const RESPONSE_MODES = [
  {
    id: 'keyword' as const,
    label: 'Keyword',
    icon: '⚡',
    description: 'Short, bullet-point answers',
  },
  {
    id: 'detailed' as const,
    label: 'Detailed',
    icon: '📖',
    description: 'Deep explanations with examples',
  },
  {
    id: 'authenticity' as const,
    label: 'Authenticity',
    icon: '🔍',
    description: 'Sources, trust scores & verification',
  },
  {
    id: 'research' as const,
    label: 'Research',
    icon: '🔬',
    description: 'Multi-source analysis & citations',
  },
];

export const AGENT_NAMES = [
  'Query Understanding Agent',
  'Retrieval Agent',
  'Verification Agent',
  'Ranking Agent',
  'Summarization Agent',
  'Multimodal Agent',
  'Citation Agent',
  'Memory Agent',
];
