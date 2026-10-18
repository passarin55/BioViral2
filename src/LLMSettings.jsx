import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const LLMSettings = ({ onSettingsChange }) => {
  const [backend, setBackend] = useState(() => localStorage.getItem('llmBackend') || 'ollama');
  const [model, setModel] = useState(() => localStorage.getItem('llmModel') || 'qwen2.5:14b');
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('ollamaUrl') || 'http://localhost:11434');
  const [lmStudioUrl, setLmStudioUrl] = useState(() => localStorage.getItem('lmStudioUrl') || 'http://localhost:1234');
  const [connectionStatus, setConnectionStatus] = useState('unchecked'); // unchecked | checking | connected | disconnected
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Test connection and fetch available models
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      let models = [];

      if (backend === 'ollama') {
        // Ollama uses /api/tags
        const res = await fetch(`${ollamaUrl}/api/tags`);
        if (!res.ok) throw new Error('Ollama connection failed');
        const data = await res.json();
        models = (data.models || []).map((m) => m.name);
      } else {
        // LM Studio uses /v1/models (OpenAI compatible)
        const res = await fetch(`${lmStudioUrl}/v1/models`);
        if (!res.ok) throw new Error('LM Studio connection failed');
        const data = await res.json();
        models = (data.data || []).map((m) => m.id || m.name || 'default');

        // If no models returned, assume there's a default one running
        if (models.length === 0) {
          models = ['local-model'];
        }
      }

      setAvailableModels(models);
      setConnectionStatus('connected');
      console.log('✓ LLM Connected!', backend === 'ollama' ? 'Ollama' : 'LM Studio');
      console.log('Available models:', models);

      // Update settings
      localStorage.setItem('llmBackend', backend);
      localStorage.setItem('llmModel', model);
      localStorage.setItem('ollamaUrl', ollamaUrl);
      localStorage.setItem('lmStudioUrl', lmStudioUrl);

      if (onSettingsChange) {
        onSettingsChange({
          backend,
          model,
          url: backend === 'ollama' ? ollamaUrl : lmStudioUrl,
          models
        });
      }
    } catch (e) {
      console.error('❌ Connection failed:', e.message);
      setConnectionStatus('disconnected');
      setAvailableModels([]);
    }
  };

  // Auto-test on mount
  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (connectionStatus === 'connected') return 'text-emerald-400';
    if (connectionStatus === 'disconnected') return 'text-red-400';
    if (connectionStatus === 'checking') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (connectionStatus === 'connected') return <CheckCircle size={16} className="text-emerald-500" />;
    if (connectionStatus === 'disconnected') return <AlertCircle size={16} className="text-red-500" />;
    if (connectionStatus === 'checking') return <Loader size={16} className="text-yellow-500 animate-spin" />;
    return <Settings size={16} className="text-gray-500" />;
  };

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-slate-600"
        onClick={() => setShowSettings(!showSettings)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <p className={`text-sm font-semibold ${getStatusColor()}`}>
                {connectionStatus === 'connected' ? '✓' : connectionStatus === 'disconnected' ? '✗' : '⟳'} LLM{' '}
                {backend === 'ollama' ? 'Ollama' : 'LM Studio'}
              </p>
              <p className="text-xs text-gray-400">
                {connectionStatus === 'connected'
                  ? `Model: ${model}`
                  : connectionStatus === 'disconnected'
                  ? 'Not connected'
                  : 'Checking...'}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{showSettings ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          {/* Backend Selection */}
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-2">LLM Backend</label>
            <div className="grid grid-cols-2 gap-2">
              {['ollama', 'lmstudio'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setBackend(opt);
                    setConnectionStatus('unchecked');
                  }}
                  className={`p-2 rounded text-xs font-bold transition-all ${
                    backend === opt
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {opt === 'ollama' ? '🦙 Ollama' : '💻 LM Studio'}
                </button>
              ))}
            </div>
          </div>

          {/* URL Configuration */}
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-2">
              {backend === 'ollama' ? 'Ollama URL' : 'LM Studio URL'}
            </label>
            <input
              type="text"
              value={backend === 'ollama' ? ollamaUrl : lmStudioUrl}
              onChange={(e) =>
                backend === 'ollama' ? setOllamaUrl(e.target.value) : setLmStudioUrl(e.target.value)
              }
              placeholder={backend === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234'}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-gray-300 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Model Selection */}
          {availableModels.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-2">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-xs text-gray-300 focus:border-cyan-500 focus:outline-none"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Connection Test Button */}
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'checking'}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition-all flex items-center justify-center gap-2"
          >
            {connectionStatus === 'checking' ? (
              <>
                <Loader size={14} className="animate-spin" /> Testing...
              </>
            ) : (
              <>
                <CheckCircle size={14} /> Test Connection
              </>
            )}
          </button>

          {/* Setup Instructions */}
          {connectionStatus !== 'connected' && (
            <div className="bg-slate-700/50 rounded p-3 text-xs text-gray-400 space-y-2">
              <p className="font-semibold text-gray-300">
                {backend === 'ollama' ? '🦙 Ollama Setup' : '💻 LM Studio Setup'}
              </p>
              {backend === 'ollama' ? (
                <>
                  <p>1. Install Ollama: https://ollama.ai</p>
                  <p>2. Download model:</p>
                  <code className="block bg-slate-800 p-2 rounded text-cyan-300">ollama pull qwen2.5:14b</code>
                  <p>3. Run in terminal:</p>
                  <code className="block bg-slate-800 p-2 rounded text-cyan-300">ollama serve</code>
                </>
              ) : (
                <>
                  <p>1. Install LM Studio: https://lmstudio.ai</p>
                  <p>2. Download a model (e.g., Qwen 2.5 14B)</p>
                  <p>3. Start the local server on port 1234</p>
                </>
              )}
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded p-3 text-xs text-emerald-300">
              ✓ Connected! AI features are enabled. {availableModels.length} model(s) available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LLMSettings;
