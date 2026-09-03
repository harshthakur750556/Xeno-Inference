import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Server,
  Key,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Eye,
  EyeOff,
  Terminal,
  FileText,
  Search,
  Zap,
  HardDrive,
  Activity,
  Lock,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import type { InferenceConfig, LLMProvider, ModelOption } from '../types';
import { testProviderConnection, fetchProviderModels } from '../services/api';
import { probeBareMetalHardware } from '../services/hardwareProbe';
import type { BareMetalSpecs } from '../services/hardwareProbe';
import type { UserProfile } from './AuthModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InferenceConfig;
  onChange: (newConfig: InferenceConfig) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onModelsDiscovered?: (models: ModelOption[]) => void;
}

type SettingsTab = 'providers' | 'sampling' | 'runtime' | 'system' | 'hardware';

const PROVIDERS: { id: LLMProvider; name: string; desc: string; defaultUrl: string; keyRequired: boolean }[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    desc: 'Access DeepSeek-R1, Claude 3.7, GPT-4o & all models with 1 API key',
    defaultUrl: 'https://openrouter.ai/api/v1/chat/completions',
    keyRequired: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    desc: 'Official DeepSeek API for DeepSeek-R1 & DeepSeek-V3',
    defaultUrl: 'https://api.deepseek.com/chat/completions',
    keyRequired: true,
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    desc: 'Ultra high-speed LPU inference for Llama 3.3, DeepSeek-R1-distill & Qwen',
    defaultUrl: 'https://api.groq.com/openai/v1/chat/completions',
    keyRequired: true,
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    desc: 'Direct OpenAI endpoint for GPT-4o and o3-mini',
    defaultUrl: 'https://api.openai.com/v1/chat/completions',
    keyRequired: true,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    desc: 'Local offline LLM daemon running on localhost:11434',
    defaultUrl: 'http://localhost:11434/v1/chat/completions',
    keyRequired: false,
  },
  {
    id: 'rust_engine',
    name: 'Rust Axum Daemon',
    desc: 'Native Rust server running on http://127.0.0.1:3001',
    defaultUrl: 'http://127.0.0.1:3001',
    keyRequired: false,
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    desc: 'Any OpenAI-compatible vLLM, LM Studio, or local API endpoint',
    defaultUrl: 'http://127.0.0.1:8000/v1/chat/completions',
    keyRequired: false,
  },
];

const SYSTEM_PROMPTS = [
  {
    name: 'Neural AI Specialist',
    prompt: 'You are an ultra-advanced AI reasoning engine. Provide rigorous, structured, deeply insightful, and technically accurate responses.',
  },
  {
    name: 'Senior Systems Architect',
    prompt: 'You are an expert Systems Architect specializing in Rust, high-throughput networking, SIMD optimizations, and concurrent asynchronous runtimes.',
  },
  {
    name: 'Logic & Proof Engine',
    prompt: 'You are a formal logic and mathematical proofing engine. State axioms clearly, show every step of deduction, and verify theorems rigorously.',
  },
  {
    name: 'Code Refactoring Specialist',
    prompt: 'You are a polyglot code refactoring engine. Optimize algorithmic time and space complexity, adhere strictly to idiomatic design patterns, and provide zero unnecessary filler.',
  },
  {
    name: 'Concise Assistant',
    prompt: 'Answer questions directly, concisely, and with maximum clarity without unnecessary filler.',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  currentUser,
  onOpenAuth,
  onModelsDiscovered,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; latencyMs: number; message: string } | null>(null);
  const [hardwareSpecs, setHardwareSpecs] = useState<BareMetalSpecs | null>(null);
  const [discoveredModels, setDiscoveredModels] = useState<ModelOption[]>([]);

  // Probe real host hardware on mount
  useEffect(() => {
    if (isOpen) {
      probeBareMetalHardware().then(setHardwareSpecs);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProvider = PROVIDERS.find((p) => p.id === config.provider) || PROVIDERS[0];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testProviderConnection(config);
      if (res.connected) {
        const modelRes = await fetchProviderModels(config.provider, config.apiKey, config.baseUrl);
        if (modelRes.models && modelRes.models.length > 0) {
          setDiscoveredModels(modelRes.models);
          onModelsDiscovered?.(modelRes.models);
          setTestResult({
            connected: true,
            latencyMs: res.latencyMs,
            message: `Connected (${res.latencyMs}ms) — ${modelRes.models.length} live models discovered`,
          });
          if (!config.model || !modelRes.models.some((m) => m.id === config.model)) {
            onChange({ ...config, model: modelRes.models[0].id });
          }
        } else {
          setTestResult(res);
        }
      } else {
        setTestResult(res);
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        latencyMs: 0,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSelectProvider = (providerId: LLMProvider) => {
    const p = PROVIDERS.find((item) => item.id === providerId);
    if (!p) return;
    onChange({
      ...config,
      provider: providerId,
      baseUrl: p.defaultUrl,
    });
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl rounded-2xl border border-zinc-800 bg-[#09090c] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-white" />
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              Settings & Inference Engine
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[120px]">{currentUser.name}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-zinc-200"
              >
                <Lock className="w-3 h-3" />
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-zinc-800 bg-[#060608] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
              activeTab === 'providers'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Providers & Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sampling')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
              activeTab === 'sampling'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Sampling & Logic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
              activeTab === 'hardware'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Bare-Metal Host Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('runtime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
              activeTab === 'runtime'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Runtimes & Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
              activeTab === 'system'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>System Persona</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
          
          {/* TAB 1: PROVIDERS & KEYS */}
          {activeTab === 'providers' && (
            <div className="space-y-5">
              
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>API keys are stored locally in browser storage and verified via server-side proxy (zero CORS blocks).</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Secure</span>
              </div>

              {/* Provider Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Active Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProvider(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        config.provider === p.id
                          ? 'bg-zinc-800 border-white text-white shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{p.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              {currentProvider.keyRequired && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      <Key className="w-3.5 h-3.5 text-zinc-400" />
                      {currentProvider.name} API Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showApiKey ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey || ''}
                      onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                      placeholder={`Enter your ${currentProvider.name} API key...`}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Keys are stored locally in your browser only.
                  </p>
                </div>
              )}

              {/* Endpoint URL Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5 text-zinc-400" />
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={config.baseUrl || currentProvider.defaultUrl}
                  onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
                  placeholder={currentProvider.defaultUrl}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Live Connection Test Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                {testResult && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-lg border ${
                      testResult.connected
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/30 text-red-300'
                    }`}
                  >
                    {testResult.connected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Discovered Models List */}
              {discoveredModels.length > 0 && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-black border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="text-white font-bold">AVAILABLE MODELS FROM {config.provider.toUpperCase()}</span>
                    <span className="text-emerald-400">{discoveredModels.length} models ready</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1 pt-1">
                    {discoveredModels.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                          config.model === m.id
                            ? 'bg-zinc-800 border border-zinc-600 text-white'
                            : 'hover:bg-zinc-900 text-zinc-300 border border-transparent'
                        }`}
                        onClick={() => onChange({ ...config, model: m.id })}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.model === m.id ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                          <span className="font-semibold text-white truncate">{m.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[140px]">{m.id}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0 ${
                          config.model === m.id ? 'bg-emerald-400 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {config.model === m.id ? 'ACTIVE' : 'SELECT'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: BARE-METAL HOST SPECS (REAL NON-PSEUDO TELEMETRY) */}
          {activeTab === 'hardware' && hardwareSpecs && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>REAL-TIME HOST BARE-METAL DESCRIPTORS</span>
                </span>
                <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* CPU Cores */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1 font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase">CPU Logical Execution Cores</div>
                  <div className="text-base font-extrabold text-white">{hardwareSpecs.logicalCores} Threads</div>
                  <div className="text-[11px] text-zinc-400">Concurrency: {hardwareSpecs.logicalCores} SIMD parallel workers</div>
                </div>

                {/* Physical RAM */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1 font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase">Host Physical Memory (RAM)</div>
                  <div className="text-base font-extrabold text-white">{hardwareSpecs.deviceMemoryGb}</div>
                  <div className="text-[11px] text-zinc-400">Browser process memory pool active</div>
                </div>

                {/* GPU Accelerator */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1 font-mono sm:col-span-2">
                  <div className="text-[10px] text-zinc-500 uppercase">Unmasked GPU Hardware Descriptor</div>
                  <div className="text-xs font-bold text-white truncate">{hardwareSpecs.gpuRenderer}</div>
                  <div className="text-[10px] text-zinc-400">Vendor: {hardwareSpecs.gpuVendor}</div>
                </div>

                {/* Acceleration Subsystems */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase">Kernel Capabilities</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">WebGPU Acceleration:</span>
                    <span className={hardwareSpecs.webGpuSupported ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {hardwareSpecs.webGpuSupported ? 'SUPPORTED' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">WASM SIMD 128-bit:</span>
                    <span className={hardwareSpecs.wasmSimdSupported ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {hardwareSpecs.wasmSimdSupported ? 'ACTIVE' : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Network & Display */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase">Network & Viewport</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Display Resolution:</span>
                    <span className="text-white">{hardwareSpecs.screenResolution}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Network Connection:</span>
                    <span className="text-emerald-400">{hardwareSpecs.networkType} ({hardwareSpecs.networkRttMs})</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SAMPLING & HYPERPARAMETERS */}
          {activeTab === 'sampling' && (
            <div className="space-y-5">
              
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    Temperature (Sampling Entropy)
                  </span>
                  <span className="font-mono text-white">{config.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>0.0 (Deterministic)</span>
                  <span>0.7 (Balanced)</span>
                  <span>1.5 (Creative)</span>
                </div>
              </div>

              {/* Top-P */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-2 uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    Top-P (Nucleus Sampling)
                  </span>
                  <span className="font-mono text-white">{config.topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) => onChange({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Max Tokens & Seed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Max Output Tokens
                  </label>
                  <input
                    type="number"
                    min="256"
                    max="16384"
                    step="256"
                    value={config.maxTokens}
                    onChange={(e) => onChange({ ...config, maxTokens: parseInt(e.target.value) || 2048 })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Deterministic Seed (Optional)
                  </label>
                  <input
                    type="number"
                    value={config.seed ?? ''}
                    onChange={(e) => onChange({ ...config, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Random (Default)"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: RUNTIMES & ENGINE */}
          {activeTab === 'runtime' && (
            <div className="space-y-5">
              
              {/* Rust Axum Endpoint */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  Rust Axum Core Server URL
                </label>
                <input
                  type="text"
                  value={config.rustBackendUrl}
                  onChange={(e) => onChange({ ...config, rustBackendUrl: e.target.value })}
                  placeholder="http://127.0.0.1:3001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white transition"
                />
                <p className="text-[11px] text-zinc-500">
                  Local high-throughput SSE engine written in Rust with Axum & Tokio.
                </p>
              </div>

              {/* Web Search Provider */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  Web Search Engine
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['duckduckgo', 'tavily', 'serper'] as const).map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => onChange({ ...config, webSearchEngine: eng })}
                      className={`p-2 rounded-xl border text-center text-xs uppercase font-mono transition cursor-pointer ${
                        (config.webSearchEngine || 'duckduckgo') === eng
                          ? 'bg-zinc-800 border-white text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SYSTEM PERSONA */}
          {activeTab === 'system' && (
            <div className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Active System Prompt
                </label>
                <textarea
                  rows={4}
                  value={config.systemPrompt}
                  onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
                  placeholder="Enter system prompt instructions..."
                  className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-white leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Persona Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SYSTEM_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange({ ...config, systemPrompt: item.prompt })}
                      className="p-2.5 text-left rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 text-xs transition cursor-pointer"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>{item.name}</span>
                        <Zap className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-1">{item.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};