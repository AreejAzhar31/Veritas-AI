import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  showAgentLogs: boolean;
  showSources: boolean;
  showConfidence: boolean;
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const label = pct >= 80 ? 'High' : pct >= 60 ? 'Medium' : 'Low';
  const icon = pct >= 80 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />;
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        Confidence
      </span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-32">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 font-mono">
        {label} ({pct}%)
      </span>
    </div>
  );
}

export default function MessageBubble({
  message,
  showAgentLogs,
  showSources,
  showConfidence,
}: MessageBubbleProps) {
  const [logsOpen, setLogsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
          isAssistant
            ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
            : 'bg-gradient-to-br from-gray-700 to-gray-600'
        }`}
      >
        {isAssistant ? (
          <Bot size={15} className="text-white" />
        ) : (
          <User size={15} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isAssistant ? '' : 'items-end flex flex-col'}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
          <span className="text-xs font-semibold text-gray-400">
            {isAssistant ? 'VeritasAI' : 'You'}
          </span>
          <span className="text-xs text-gray-600">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.mode && isAssistant && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-950/60 text-indigo-400 border border-indigo-800/30">
              {message.mode}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-gray-800/70 border border-gray-700/50 text-gray-100'
              : 'bg-indigo-600 text-white'
          } ${message.error ? 'border-red-700/50 bg-red-950/30' : ''}`}
        >
          {message.isStreaming && !message.content && (
            <div className="flex gap-1 py-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          {message.content && (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-200">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    return isBlock ? (
                      <code className="block bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-mono text-green-300 overflow-x-auto my-2">
                        {children}
                      </code>
                    ) : (
                      <code className="bg-gray-900 px-1.5 py-0.5 rounded text-xs font-mono text-green-300">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 text-gray-400 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full border border-gray-700 rounded-lg text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-700 bg-gray-900 px-3 py-1.5 text-left font-medium text-gray-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-700 px-3 py-1.5 text-gray-400">{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta info (assistant only) */}
        {isAssistant && message.content && !message.isStreaming && (
          <div className="mt-2 space-y-2">
            {/* Confidence */}
            {showConfidence && message.confidence !== undefined && (
              <ConfidenceBar value={message.confidence} />
            )}

            {/* Agent Logs */}
            {showAgentLogs && message.agents && message.agents.length > 0 && (
              <div>
                <button
                  onClick={() => setLogsOpen(!logsOpen)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <Activity size={12} />
                  <span>Agent Pipeline ({message.agents.length} agents)</span>
                  {logsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {logsOpen && (
                  <div className="mt-2 bg-gray-900/60 border border-gray-700/50 rounded-xl p-3 space-y-2">
                    {message.agents.map((agent, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            agent.status === 'done'
                              ? 'bg-emerald-500'
                              : agent.status === 'running'
                              ? 'bg-yellow-500 animate-pulse'
                              : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-300">{agent.agentName}</p>
                          <p className="text-xs text-gray-500">{agent.action}</p>
                          {agent.details && (
                            <p className="text-xs text-gray-600 italic">{agent.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sources */}
            {showSources && message.sources && message.sources.length > 0 && (
              <div>
                <button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <Shield size={12} />
                  <span>Sources & Evidence ({message.sources.length})</span>
                  {sourcesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {sourcesOpen && (
                  <div className="mt-2 space-y-2">
                    {message.sources.map((src, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                src.type === 'user-upload'
                                  ? 'bg-emerald-500'
                                  : src.type === 'database'
                                  ? 'bg-blue-500'
                                  : 'bg-purple-500'
                              }`}
                            />
                            <p className="text-xs font-medium text-gray-300">{src.name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <Clock size={10} className="text-gray-600" />
                              <span className="text-xs text-gray-600">{src.recency}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield size={10} className="text-emerald-500" />
                              <span className="text-xs text-emerald-500 font-mono">
                                {Math.round(src.credibility * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {src.excerpt && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{src.excerpt}</p>
                        )}
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline mt-1"
                          >
                            <ExternalLink size={10} />
                            {src.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
