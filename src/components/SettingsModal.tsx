import { useState, useEffect } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Cpu,
  Sliders,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AppSettings } from '../types';
import { GROQ_MODELS, RESPONSE_MODES } from '../constants/models';
import { fetchAvailableModels } from '../services/groqService';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [local, setLocal] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMsg, setTestMsg] = useState('');
  const [liveModels, setLiveModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'model' | 'behavior'>('api');

  const testApiKey = async () => {
    if (!local.groqApiKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const models = await fetchAvailableModels(local.groqApiKey);
      if (models.length > 0) {
        setTestResult('success');
        setTestMsg(`Connected! ${models.length} models available.`);
        setLiveModels(models);
      } else {
        throw new Error('No models returned');
      }
    } catch (e: unknown) {
      setTestResult('error');
      setTestMsg(e instanceof Error ? e.message : 'Invalid API key or connection failed.');
    }
    setTesting(false);
  };

  const fetchModels = async () => {
    if (!local.groqApiKey) return;
    setFetchingModels(true);
    const models = await fetchAvailableModels(local.groqApiKey);
    setLiveModels(models);
    setFetchingModels(false);
  };

  useEffect(() => {
    if (local.groqApiKey) {
      fetchModels();
    }
  }, []);

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const allModels = liveModels.length > 0
    ? liveModels.map((id) => {
        const known = GROQ_MODELS.find((m) => m.id === id);
        return known ?? { id, name: id, contextWindow: 131072, maxTokens: 32768, speed: 'Unknown', category: 'production' as const };
      })
    : GROQ_MODELS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-white font-bold text-lg">Settings</h2>
            <p className="text-gray-500 text-sm">Configure your VeritasAI experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {([
            { id: 'api', label: 'API Keys', icon: <Key size={14} /> },
            { id: 'model', label: 'Models', icon: <Cpu size={14} /> },
            { id: 'behavior', label: 'Behavior', icon: <Sliders size={14} /> },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-800/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="text-indigo-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-indigo-300 text-sm font-medium">Groq API Key Required</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Get a free API key from{' '}
                      <a
                        href="https://console.groq.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        console.groq.com <ExternalLink size={10} />
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Groq API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={local.groqApiKey}
                    onChange={(e) => setLocal({ ...local, groqApiKey: e.target.value })}
                    placeholder="gsk_..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={testApiKey}
                    disabled={!local.groqApiKey || testing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {testing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Test Connection
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm ${
                      testResult === 'success'
                        ? 'bg-emerald-950/50 border border-emerald-700/30 text-emerald-400'
                        : 'bg-red-950/50 border border-red-700/30 text-red-400'
                    }`}
                  >
                    {testResult === 'success' ? (
                      <Check size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {testMsg}
                  </div>
                )}
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-xs leading-relaxed">
                  🔒 <strong className="text-gray-300">Security:</strong> Your API key is stored locally in your browser and never sent to any server other than Groq's API. It is encrypted in localStorage and never exposed in logs or network requests beyond the Groq endpoint.
                </p>
              </div>
            </div>
          )}

          {/* Model Tab */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm font-medium">Select Model</p>
                <button
                  onClick={fetchModels}
                  disabled={!local.groqApiKey || fetchingModels}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={fetchingModels ? 'animate-spin' : ''} />
                  Refresh from API
                </button>
              </div>

              <div className="space-y-2">
                {allModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setLocal({ ...local, selectedModel: model.id })}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      local.selectedModel === model.id
                        ? 'border-indigo-500/50 bg-indigo-950/30'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{model.name ?? model.id}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{model.id}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs text-indigo-400">{model.speed}</span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {(model.contextWindow / 1000).toFixed(0)}K ctx
                        </p>
                      </div>
                    </div>
                    {'category' in model && (
                      <span
                        className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                          model.category === 'production'
                            ? 'bg-emerald-900/40 text-emerald-400'
                            : 'bg-yellow-900/40 text-yellow-400'
                        }`}
                      >
                        {model.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Behavior Tab */}
          {activeTab === 'behavior' && (
            <div className="space-y-5">
              {/* Response Mode */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Default Response Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSE_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setLocal({ ...local, responseMode: mode.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        local.responseMode === mode.id
                          ? 'border-indigo-500/50 bg-indigo-950/30'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <p className="text-base mb-1">{mode.icon}</p>
                      <p className="text-sm font-medium text-white">{mode.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="flex items-center justify-between text-gray-300 text-sm font-medium mb-2">
                  <span>Temperature</span>
                  <span className="text-indigo-400 font-mono">{local.temperature.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={local.temperature}
                  onChange={(e) => setLocal({ ...local, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="flex items-center justify-between text-gray-300 text-sm font-medium mb-2">
                  <span>Max Tokens</span>
                  <span className="text-indigo-400 font-mono">{local.maxTokens}</span>
                </label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={local.maxTokens}
                  onChange={(e) => setLocal({ ...local, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>256</span>
                  <span>8192</span>
                </div>
              </div>

              {/* Toggles */}
              {([
                { key: 'streamingEnabled', label: 'Streaming Responses', desc: 'Show responses as they generate' },
                { key: 'showAgentLogs', label: 'Agent Activity Logs', desc: 'Show which agents are processing' },
                { key: 'showSources', label: 'Source Attribution', desc: 'Display knowledge sources' },
                { key: 'showConfidence', label: 'Confidence Scores', desc: 'Show response confidence levels' },
              ] as const).map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{toggle.label}</p>
                    <p className="text-gray-600 text-xs">{toggle.desc}</p>
                  </div>
                  <button
                    onClick={() => setLocal({ ...local, [toggle.key]: !local[toggle.key] })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      local[toggle.key] ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        local[toggle.key] ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
