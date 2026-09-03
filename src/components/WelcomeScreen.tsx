import { Bot, Shield, Zap, Brain, Search, FileText, Settings } from 'lucide-react';

interface WelcomeScreenProps {
  onPrompt: (text: string) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: '🔬',
    label: 'Research Mode',
    text: 'Give me a comprehensive research analysis on the impact of Large Language Models on scientific research',
  },
  {
    icon: '✅',
    label: 'Verify a Claim',
    text: 'Is it true that humans only use 10% of their brain? Verify this claim with evidence.',
  },
  {
    icon: '📊',
    label: 'Data Analysis',
    text: 'Explain quantum computing and its potential applications with confidence scoring',
  },
  {
    icon: '⚡',
    label: 'Quick Facts',
    text: 'What are the top 5 programming languages in 2024?',
  },
  {
    icon: '📄',
    label: 'Document Q&A',
    text: 'How should I use the file upload feature to ask questions about my documents?',
  },
  {
    icon: '🤖',
    label: 'Agents Demo',
    text: 'Explain how the multi-agent RAG pipeline works in this system',
  },
];

const FEATURES = [
  {
    icon: <Shield size={18} className="text-emerald-400" />,
    title: 'Anti-Hallucination',
    desc: 'Multi-agent verification prevents fabricated facts',
    color: 'border-emerald-800/30 bg-emerald-950/20',
  },
  {
    icon: <Brain size={18} className="text-indigo-400" />,
    title: 'Agent Pipeline',
    desc: '8 specialized AI agents process each query',
    color: 'border-indigo-800/30 bg-indigo-950/20',
  },
  {
    icon: <Zap size={18} className="text-yellow-400" />,
    title: 'Groq Powered',
    desc: 'Ultra-fast inference with multiple LLMs',
    color: 'border-yellow-800/30 bg-yellow-950/20',
  },
  {
    icon: <Search size={18} className="text-purple-400" />,
    title: 'RAG Retrieval',
    desc: 'Context-aware information retrieval',
    color: 'border-purple-800/30 bg-purple-950/20',
  },
  {
    icon: <FileText size={18} className="text-blue-400" />,
    title: 'Document Q&A',
    desc: 'Upload files and ask questions about them',
    color: 'border-blue-800/30 bg-blue-950/20',
  },
  {
    icon: <Bot size={18} className="text-orange-400" />,
    title: '4 Response Modes',
    desc: 'Keyword, Detailed, Authenticity, Research',
    color: 'border-orange-800/30 bg-orange-950/20',
  },
];

export default function WelcomeScreen({ onPrompt, onOpenSettings, hasApiKey }: WelcomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-900/50">
            <Bot size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              VeritasAI
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Advanced Multi-Agent RAG Intelligence Platform — delivering verified, evidence-based responses with zero hallucinations.
          </p>

          {!hasApiKey && (
            <button
              onClick={onOpenSettings}
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-900/50"
            >
              <Settings size={16} />
              Add Groq API Key to Start
            </button>
          )}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`p-4 rounded-xl border ${f.color} flex gap-3`}
            >
              <div className="mt-0.5 shrink-0">{f.icon}</div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts */}
        <div>
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-3 text-center">
            Try a quick prompt
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => onPrompt(p.text)}
                disabled={!hasApiKey}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span className="text-xl mt-0.5">{p.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {p.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{p.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
