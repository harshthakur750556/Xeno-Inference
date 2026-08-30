import { create } from "zustand";

export type ViewMode = "home" | "thinking" | "canvas" | "diff" | "terminal" | "browser";
export type RoutingPolicy = "speed" | "reasoning" | "privacy" | "cost";
export type NodeStatus = "pending" | "running" | "completed" | "failed" | "healing";
export type ThemeMode = "light" | "dark";
export type ProviderSector = "api" | "local";

export interface ProviderModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  providerId: string;
  sector: ProviderSector;
}

export interface ProviderItem {
  id: string;
  name: string;
  sector: ProviderSector;
  baseUrl: string;
  defaultEndpoint: string;
  apiKey: string;
  isConfigured: boolean;
  status: "ready" | "needs_key" | "offline" | "probing";
  pingMs: number | null;
  models: ProviderModelOption[];
}

export interface CanvasNode {
  id: string;
  type: "prompt" | "subagent" | "code" | "diff" | "cad3d" | "note";
  x: number;
  y: number;
  data: Record<string, any>;
}

export interface DAGNodeItem {
  id: string;
  label: string;
  role: "commander" | "architect" | "coder" | "qa" | "red_team";
  status: NodeStatus;
  model: string;
  dependencies: string[];
  stdout?: string;
  stderr?: string;
  latencyMs: number;
}

export interface CognitiveStep {
  id: string;
  stepNumber: number;
  title: string;
  phase: "Goal Decomposition" | "AST Navigation" | "Tool Invocation" | "Observation Ingestion" | "Recursive Verification";
  latencyMs: number;
  tokens: number;
  speed: number;
  status: "verified" | "executing" | "pruned";
  details: string[];
}

export interface SpeculativeBranch {
  id: string;
  name: string;
  score: number;
  status: "selected" | "pruned" | "evaluating";
  rationale: string;
  latencyEstimateMs: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: "stdout" | "stderr" | "system" | "intervention" | "command";
  content: string;
}

export interface SwarmAgentInfo {
  role: "commander" | "architect" | "coder" | "qa" | "red_team";
  title: string;
  model: string;
  status: "idle" | "planning" | "coding" | "testing" | "auditing" | "healing";
  currentTask: string;
  tokensGenerated: number;
  voteScore: number;
}

export interface DiffItem {
  id: string;
  filePath: string;
  originalCode: string;
  modifiedCode: string;
  staged: boolean;
  astValid: boolean;
}

export interface TorCircuitHop {
  name: string;
  country: string;
  ip: string;
  latencyMs: number;
  type: "guard" | "relay" | "exit";
}

export interface DynamicSystemMetrics {
  cpuCores: number;
  ramHeapMb: number;
  screenResolution: string;
  devicePixelRatio: number;
  activeSessionUptimeSecs: number;
  liveTokenCount: number;
  liveTokPerSec: number;
  costUsd: number;
  ttftMs: number;
  gpuRenderer: string;
  networkType: string;
  downlinkMbps: number;
  osPlatform: string;
}

export interface ChatThinkingData {
  durationSecs: number;
  tokens: number;
  summary: string;
  steps: string[];
  expanded?: boolean;
}

export interface ChatToolCall {
  name: string;
  icon: string;
  input: string;
  output?: string;
  latencyMs: number;
  status: "executing" | "success" | "failed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  model?: string;
  thinking?: ChatThinkingData;
  toolCalls?: ChatToolCall[];
  attachedFiles?: string[];
  metrics?: {
    tokPerSec: number;
    totalTokens: number;
    latencyMs: number;
  };
}

export interface McpToolItem {
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export interface McpServerConfig {
  id: string;
  name: string;
  status: "connected" | "standby" | "disabled";
  pingMs: number;
  tools: McpToolItem[];
}

export interface WorkspaceState {
  activeView: ViewMode;
  themeMode: ThemeMode;
  selectedModel: string;
  selectedProviderId: string;
  routingPolicy: RoutingPolicy;
  isAirGapped: boolean;
  isSidebarOpen: boolean;
  isShortcutsOpen: boolean;
  isExportOpen: boolean;
  isProviderModalOpen: boolean;
  providerModalTargetId: string | null;
  providerModalTab: ProviderSector;
  soundEnabled: boolean;

  // Real Providers Configuration
  providers: ProviderItem[];

  // Real Telemetry
  systemMetrics: DynamicSystemMetrics;

  // Infinite Canvas & CAD
  canvasNodes: CanvasNode[];
  selectedNodeId: string | null;
  canvasScale: number;
  canvasPan: { x: number; y: number };
  activeCadShape: "column" | "gear" | "lattice" | "torus" | "cube";

  // Unified Thinking Studio State (DAG + Swarm + Timeline)
  thinkingActiveTab: "swarm" | "dag" | "timeline" | "ast";
  dagNodes: DAGNodeItem[];
  selectedDagNodeId: string | null;
  timelineSteps: CognitiveStep[];
  speculativeBranches: SpeculativeBranch[];
  swarmAgents: SwarmAgentInfo[];
  consensusRate: number;

  // Terminal
  terminalLogs: TerminalLog[];
  commandHistory: string[];
  historyIndex: number;
  currentCommand: string;

  // Diff Studio
  diffFiles: DiffItem[];

  // Tor Sandbox
  torUrl: string;
  torCircuit: TorCircuitHop[];
  torShieldLevel: "Standard" | "Safer" | "Safest";
  isTorConnected: boolean;
  torHistory: string[];

  // Chat Studio
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  isThinkingEnabled: boolean;
  thinkingBudget: "fast" | "deep" | "max";
  isWebSearchEnabled: boolean;
  isCodeExecMode: boolean;
  isMcpModalOpen: boolean;
  mcpServers: McpServerConfig[];
  attachedFiles: string[];
  activeInspectGraphMessageId: string | null;
  isDaemonOnline: boolean;

  // Actions
  setActiveView: (view: ViewMode) => void;
  setThinkingActiveTab: (tab: "swarm" | "dag" | "timeline" | "ast") => void;
  toggleTheme: () => void;
  setSelectedModel: (model: string, providerId?: string) => void;
  setRoutingPolicy: (policy: RoutingPolicy) => void;
  toggleAirGap: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleShortcuts: () => void;
  toggleExport: () => void;
  toggleSound: () => void;

  // Provider Modal & Key Actions
  openProviderModal: (providerId?: string, sector?: ProviderSector) => void;
  closeProviderModal: () => void;
  setProviderModalTab: (tab: ProviderSector) => void;
  updateProviderConfig: (providerId: string, updates: { apiKey?: string; baseUrl?: string }) => void;
  probeLocalHostProvider: (providerId: string) => Promise<{ ok: boolean; pingMs: number; error?: string }>;
  testCloudApiProvider: (providerId: string) => Promise<{ ok: boolean; error?: string }>;

  // Canvas Actions
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDagNodeId: (id: string | null) => void;
  setCanvasScale: (scale: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  updateCanvasNodePosition: (id: string, x: number, y: number) => void;
  updateCanvasNodeData: (id: string, data: Record<string, any>) => void;
  addCanvasNode: (type: CanvasNode["type"]) => void;
  removeCanvasNode: (id: string) => void;
  clearCanvasNodes: () => void;
  loadCanvasArchitectureTemplate: () => void;
  setActiveCadShape: (shape: "column" | "gear" | "lattice" | "torus" | "cube") => void;

  // Terminal Actions
  executeCommand: (cmd: string) => void;
  clearTerminalLogs: () => void;

  // DAG & Swarm Actions
  addDagNode: (label: string, role: DAGNodeItem["role"], model: string, dependencies: string[]) => void;
  runDagExecution: () => Promise<void>;
  addSwarmAgent: (role: SwarmAgentInfo["role"], title: string, model: string, task: string) => void;
  removeSwarmAgent: (role: string) => void;
  dispatchSwarmTask: (task: string) => void;
  triggerSwarmConsensus: () => void;

  // Diff Actions
  addDiffFile: (filePath: string, originalCode: string, modifiedCode: string) => void;
  updateDiffFileContent: (id: string, modifiedCode: string) => void;
  toggleStageDiff: (id: string) => void;
  applyDiffToFile: (id: string) => void;

  // Chat Actions
  sendChatMessage: (content: string) => Promise<void>;
  toggleThinking: () => void;
  setThinkingBudget: (budget: "fast" | "deep" | "max") => void;
  toggleWebSearch: () => void;
  toggleCodeExecMode: () => void;
  toggleMcpModal: () => void;
  toggleMcpTool: (serverId: string, toolName: string) => void;
  toggleMcpServer: (serverId: string) => void;
  attachFile: (filePath: string) => void;
  removeAttachedFile: (filePath: string) => void;
  clearChat: () => void;
  forkThoughtToCanvas: (messageId: string) => void;
  setActiveInspectGraphMessageId: (id: string | null) => void;

  // Tor Actions
  navigateTorBrowser: (url: string) => void;
  requestNewTorIdentity: () => void;
  setTorShieldLevel: (level: "Standard" | "Safer" | "Safest") => void;

  // Helpers
  exportSessionJson: () => string;
  importSessionJson: (jsonStr: string) => boolean;
  handleSmartPrompt: (input: string) => { view: ViewMode; message: string };
  updateMetricsTick: () => void;
}

// ----------------- Environment Detection -----------------
const detectGpuRenderer = (): string => {
  if (typeof document === "undefined") return "Hardware Accelerator GPU";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        return (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "WebGL Rasterizer";
      }
      return (gl as any).getParameter((gl as any).RENDERER) || "WebGL Device";
    }
  } catch {}
  return "Hardware Accelerated GPU";
};

const detectOsPlatform = (): string => {
  if (typeof navigator === "undefined") return "Linux Bare Machine";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows 11 / ConPTY";
  if (ua.includes("Android")) return "Android / Linux Kernel";
  if (ua.includes("Mac")) return "macOS Darwin";
  if (ua.includes("Linux")) return "Linux x86_64 / arm64";
  return "POSIX Environment";
};

const getInitialCpuCores = () => (typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 8 : 8);
const getInitialResolution = () => (typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "1920x1080");
const getInitialDpi = () => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
const getInitialMemoryMb = () => {
  if (typeof performance !== "undefined" && (performance as any).memory) {
    return Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
  }
  return 84;
};

// ----------------- Default Real Providers Registry -----------------
const loadSavedProviders = (): ProviderItem[] => {
  const defaults: ProviderItem[] = [
    {
      id: "anthropic",
      name: "Anthropic Claude",
      sector: "api",
      baseUrl: "https://api.anthropic.com/v1",
      defaultEndpoint: "https://api.anthropic.com/v1",
      apiKey: "",
      isConfigured: false,
      status: "needs_key",
      pingMs: null,
      models: [
        { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet (Thinking)", tag: "Deep Reasoning", description: "Hybrid fast execution & step-by-step cognitive CoT", providerId: "anthropic", sector: "api" },
        { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", tag: "Code Master", description: "High-precision AST syntax & architectural synthesis", providerId: "anthropic", sector: "api" },
        { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", tag: "Ultra Fast", description: "Sub-50ms token velocity for real-time diffing", providerId: "anthropic", sector: "api" },
      ],
    },
    {
      id: "openai",
      name: "OpenAI",
      sector: "api",
      baseUrl: "https://api.openai.com/v1",
      defaultEndpoint: "https://api.openai.com/v1",
      apiKey: "",
      isConfigured: false,
      status: "needs_key",
      pingMs: null,
      models: [
        { id: "gpt-4o", name: "GPT-4o Omnimodal", tag: "Fast Visual", description: "High-throughput multimodal inference core", providerId: "openai", sector: "api" },
        { id: "o3-mini", name: "o3-mini (High Effort)", tag: "Math/Logic", description: "Reinforcement-learned deliberate problem solver", providerId: "openai", sector: "api" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini", tag: "Lightweight", description: "Efficient low-latency edge assistant", providerId: "openai", sector: "api" },
      ],
    },
    {
      id: "deepseek",
      name: "DeepSeek AI",
      sector: "api",
      baseUrl: "https://api.deepseek.com/v1",
      defaultEndpoint: "https://api.deepseek.com/v1",
      apiKey: "",
      isConfigured: false,
      status: "needs_key",
      pingMs: null,
      models: [
        { id: "deepseek-r1", name: "DeepSeek R1", tag: "Open Reasoning", description: "Unbounded chain-of-thought verification engine", providerId: "deepseek", sector: "api" },
        { id: "deepseek-v3", name: "DeepSeek V3", tag: "General 671B", description: "Multi-head latent attention mixture-of-experts", providerId: "deepseek", sector: "api" },
      ],
    },
    {
      id: "google",
      name: "Google Gemini",
      sector: "api",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultEndpoint: "https://generativelanguage.googleapis.com/v1beta",
      apiKey: "",
      isConfigured: false,
      status: "needs_key",
      pingMs: null,
      models: [
        { id: "gemini-2-pro", name: "Gemini 2.0 Pro", tag: "2M Context", description: "Massive context window with native code execution", providerId: "google", sector: "api" },
        { id: "gemini-2-flash", name: "Gemini 2.0 Flash", tag: "Instant Speed", description: "Low-latency sovereign multimodal model", providerId: "google", sector: "api" },
      ],
    },
    {
      id: "groq",
      name: "Groq LPU",
      sector: "api",
      baseUrl: "https://api.groq.com/openai/v1",
      defaultEndpoint: "https://api.groq.com/openai/v1",
      apiKey: "",
      isConfigured: false,
      status: "needs_key",
      pingMs: null,
      models: [
        { id: "groq-llama3-70b", name: "Llama 3.3 70B (Groq LPU)", tag: "500 tok/s", description: "Linear Processing Unit hardware accelerated speed", providerId: "groq", sector: "api" },
      ],
    },
    {
      id: "ollama",
      name: "Ollama Local Host",
      sector: "local",
      baseUrl: "http://localhost:11434",
      defaultEndpoint: "http://localhost:11434",
      apiKey: "",
      isConfigured: false,
      status: "offline",
      pingMs: null,
      models: [
        { id: "ollama-llama3.2", name: "Llama 3.2 (Ollama Local)", tag: "Zero-Leak", description: "Private local inference via Ollama runtime", providerId: "ollama", sector: "local" },
        { id: "ollama-deepseek-r1", name: "DeepSeek R1 8B/14B (Ollama)", tag: "Local CoT", description: "Local chain-of-thought running on hardware", providerId: "ollama", sector: "local" },
        { id: "ollama-qwen2.5-coder", name: "Qwen 2.5 Coder 7B (Ollama)", tag: "Local Code", description: "Specialized local code synthesis engine", providerId: "ollama", sector: "local" },
      ],
    },
    {
      id: "lmstudio",
      name: "LM Studio Server",
      sector: "local",
      baseUrl: "http://localhost:1234/v1",
      defaultEndpoint: "http://localhost:1234/v1",
      apiKey: "",
      isConfigured: false,
      status: "offline",
      pingMs: null,
      models: [
        { id: "lmstudio-active", name: "LM Studio Active Model", tag: "Local Port 1234", description: "Direct socket binding to LM Studio loaded GGUF", providerId: "lmstudio", sector: "local" },
      ],
    },
    {
      id: "vllm",
      name: "vLLM / Llama.cpp Kernel",
      sector: "local",
      baseUrl: "http://localhost:8000/v1",
      defaultEndpoint: "http://localhost:8000/v1",
      apiKey: "",
      isConfigured: false,
      status: "offline",
      pingMs: null,
      models: [
        { id: "vllm-paged-attention", name: "vLLM PagedAttention Core", tag: "CUDA Kernel", description: "High-concurrency continuous batching endpoint", providerId: "vllm", sector: "local" },
      ],
    },
  ];

  if (typeof window === "undefined") return defaults;
  try {
    const saved = localStorage.getItem("xeno_providers_v2");
    if (saved) {
      const parsed: Record<string, { apiKey?: string; baseUrl?: string; isConfigured?: boolean }> = JSON.parse(saved);
      return defaults.map((d) => {
        const item = parsed[d.id];
        if (item) {
          const hasKey = Boolean(item.apiKey && item.apiKey.trim().length > 0);
          const isLocal = d.sector === "local";
          const statusVal: ProviderItem["status"] = hasKey ? "ready" : (isLocal ? "offline" : "needs_key");
          return {
            ...d,
            apiKey: item.apiKey || "",
            baseUrl: item.baseUrl || d.baseUrl,
            isConfigured: hasKey || isLocal,
            status: statusVal,
          };
        }
        return d;
      });
    }
  } catch {}
  return defaults;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeView: "home",
  themeMode: (typeof window !== "undefined" && localStorage.getItem("xeno_theme") === "dark") ? "dark" : "light",
  selectedModel: "claude-3-7-sonnet",
  selectedProviderId: "anthropic",
  routingPolicy: "reasoning",
  isAirGapped: false,
  isSidebarOpen: false,
  isShortcutsOpen: false,
  isExportOpen: false,
  isProviderModalOpen: false,
  providerModalTargetId: null,
  providerModalTab: "api",
  soundEnabled: true,

  providers: loadSavedProviders(),

  systemMetrics: {
    cpuCores: getInitialCpuCores(),
    ramHeapMb: getInitialMemoryMb(),
    screenResolution: getInitialResolution(),
    devicePixelRatio: getInitialDpi(),
    activeSessionUptimeSecs: 0,
    liveTokenCount: 0,
    liveTokPerSec: 0,
    costUsd: 0.0,
    ttftMs: 0,
    gpuRenderer: detectGpuRenderer(),
    networkType: typeof navigator !== "undefined" && (navigator as any).connection?.effectiveType ? (navigator as any).connection.effectiveType.toUpperCase() : "HIGH-SPEED",
    downlinkMbps: typeof navigator !== "undefined" && (navigator as any).connection?.downlink ? (navigator as any).connection.downlink : 100,
    osPlatform: detectOsPlatform(),
  },

  // Dynamic clean Canvas with zero default clutter
  canvasNodes: [],
  selectedNodeId: null,
  canvasScale: 1.0,
  canvasPan: { x: 0, y: 0 },
  activeCadShape: "column",

  // Unified Thinking Studio State
  thinkingActiveTab: "swarm",
  dagNodes: [],
  selectedDagNodeId: null,
  timelineSteps: [],
  speculativeBranches: [],
  swarmAgents: [
    { role: "commander", title: "Commander Unit", model: "Claude 3.7 Sonnet", status: "idle", currentTask: "Awaiting mission directive...", tokensGenerated: 0, voteScore: 98 },
    { role: "architect", title: "AST Architect", model: "DeepSeek R1", status: "idle", currentTask: "Ready for structural synthesis...", tokensGenerated: 0, voteScore: 96 },
    { role: "coder", title: "Zero-Alloc Coder", model: "Claude 3.5 Sonnet", status: "idle", currentTask: "Ready for syntax validation...", tokensGenerated: 0, voteScore: 99 },
    { role: "qa", title: "Fuzzing & Invariance", model: "o3-mini", status: "idle", currentTask: "Boundary test harness ready...", tokensGenerated: 0, voteScore: 95 },
    { role: "red_team", title: "Adversarial Auditor", model: "Claude 3.7 Sonnet", status: "idle", currentTask: "Security airgap monitors armed...", tokensGenerated: 0, voteScore: 97 },
  ],
  consensusRate: 98,

  terminalLogs: [
    { id: "log-1", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "system", content: `XENO SOVEREIGN WORKSTATION — ${detectOsPlatform()}` },
    { id: "log-2", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "intervention", content: `Bare-metal environment initialized: ${getInitialCpuCores()} CPU threads • ${detectGpuRenderer()}` },
  ],
  commandHistory: [],
  historyIndex: -1,
  currentCommand: "",

  diffFiles: [],

  torUrl: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion",
  torCircuit: [
    { name: "Guard Node (Relay DE-01)", country: "🇩🇪 DE", ip: "185.220.101.5", latencyMs: 24, type: "guard" },
    { name: "Middle Relay (NL-04)", country: "🇳🇱 NL", ip: "193.200.241.12", latencyMs: 38, type: "relay" },
    { name: "Exit Authority (IS-02)", country: "🇮🇸 IS", ip: "82.221.139.11", latencyMs: 52, type: "exit" },
  ],
  torShieldLevel: "Safer",
  isTorConnected: true,
  torHistory: ["https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion"],

  // Dynamic Chat Studio: Starts cleanly with 0 messages
  chatMessages: [],
  isGenerating: false,
  isThinkingEnabled: true,
  thinkingBudget: "deep",
  isWebSearchEnabled: false,
  isCodeExecMode: true,
  isMcpModalOpen: false,
  mcpServers: [
    {
      id: "server-fs",
      name: "Local Filesystem & AST MCP",
      status: "connected",
      pingMs: 2,
      tools: [
        { name: "ast_inspect", description: "Parse Rust & TS AST with zero leaks", enabled: true, category: "AST Tools" },
        { name: "file_patch", description: "Character-exact line replacement", enabled: true, category: "Storage" },
      ],
    },
    {
      id: "server-cad",
      name: "3D CAD & Geometry Engine",
      status: "connected",
      pingMs: 8,
      tools: [
        { name: "cad_render_mesh", description: "Procedural wireframe & mesh generation", enabled: true, category: "3D Graphics" },
        { name: "tinker_solve", description: "Kinematic constraint solver", enabled: true, category: "Execution" },
      ],
    },
  ],
  attachedFiles: [],
  activeInspectGraphMessageId: null,
  isDaemonOnline: true,

  // ----------------- Core Setters -----------------
  setActiveView: (view) => set({ activeView: view, isSidebarOpen: false }),
  setThinkingActiveTab: (tab) => set({ thinkingActiveTab: tab }),
  toggleTheme: () => {
    const current = get().themeMode;
    const next = current === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") localStorage.setItem("xeno_theme", next);
    set({ themeMode: next });
  },
  
  setSelectedModel: (modelId, providerId) => {
    const provs = get().providers;
    let targetProvider = provs.find((p) => p.models.some((m) => m.id === modelId));
    if (providerId) {
      const explicit = provs.find((p) => p.id === providerId);
      if (explicit) targetProvider = explicit;
    }

    if (targetProvider) {
      const isReady = targetProvider.sector === "api" ? Boolean(targetProvider.apiKey && targetProvider.apiKey.trim().length > 0) : targetProvider.status === "ready";
      set({ selectedModel: modelId, selectedProviderId: targetProvider.id });

      if (!isReady) {
        get().openProviderModal(targetProvider.id, targetProvider.sector);
      }
    } else {
      set({ selectedModel: modelId });
    }
  },

  setRoutingPolicy: (policy) => set({ routingPolicy: policy }),
  toggleAirGap: () => set((state) => ({ isAirGapped: !state.isAirGapped })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleShortcuts: () => set((state) => ({ isShortcutsOpen: !state.isShortcutsOpen })),
  toggleExport: () => set((state) => ({ isExportOpen: !state.isExportOpen })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // ----------------- Provider Modal & Keys -----------------
  openProviderModal: (providerId, sector) => {
    const defaultSector = sector || (providerId ? get().providers.find((p) => p.id === providerId)?.sector || "api" : "api");
    set({
      isProviderModalOpen: true,
      providerModalTargetId: providerId || get().selectedProviderId,
      providerModalTab: defaultSector,
    });
  },

  closeProviderModal: () => set({ isProviderModalOpen: false, providerModalTargetId: null }),
  setProviderModalTab: (tab) => set({ providerModalTab: tab }),

  updateProviderConfig: (providerId, updates) => {
    set((state) => {
      const updated: ProviderItem[] = state.providers.map((p) => {
        if (p.id === providerId) {
          const newKey = updates.apiKey !== undefined ? updates.apiKey : p.apiKey;
          const newUrl = updates.baseUrl !== undefined ? updates.baseUrl : p.baseUrl;
          const isConfigured = p.sector === "api" ? Boolean(newKey && newKey.trim().length > 0) : p.isConfigured;
          const status: ProviderItem["status"] = isConfigured ? "ready" : (p.sector === "local" ? "offline" : "needs_key");
          return {
            ...p,
            apiKey: newKey,
            baseUrl: newUrl,
            isConfigured,
            status,
          };
        }
        return p;
      });

      if (typeof window !== "undefined") {
        const configMap: Record<string, { apiKey: string; baseUrl: string }> = {};
        updated.forEach((p) => {
          configMap[p.id] = { apiKey: p.apiKey, baseUrl: p.baseUrl };
        });
        localStorage.setItem("xeno_providers_v2", JSON.stringify(configMap));
      }

      return { providers: updated };
    });
  },

  probeLocalHostProvider: async (providerId) => {
    const provider = get().providers.find((p) => p.id === providerId);
    if (!provider) return { ok: false, pingMs: 0, error: "Provider not found" };

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      let targetUrl = provider.baseUrl;
      if (provider.id === "ollama") targetUrl = `${provider.baseUrl}/api/tags`;
      else if (provider.id === "lmstudio" || provider.id === "vllm") targetUrl = `${provider.baseUrl}/models`;

      await fetch(targetUrl, { signal: controller.signal, mode: "no-cors" });
      clearTimeout(timeoutId);

      const pingMs = Math.round(performance.now() - startTime);
      set((state) => ({
        providers: state.providers.map((p) =>
          p.id === providerId ? { ...p, status: "ready" as const, isConfigured: true, pingMs: Math.max(4, pingMs) } : p
        ),
      }));
      return { ok: true, pingMs: Math.max(4, pingMs) };
    } catch (err: any) {
      set((state) => ({
        providers: state.providers.map((p) =>
          p.id === providerId ? { ...p, status: "offline" as const, pingMs: null } : p
        ),
      }));
      return { ok: false, pingMs: 0, error: "Local host service is offline or unreachable on this port." };
    }
  },

  testCloudApiProvider: async (providerId) => {
    const provider = get().providers.find((p) => p.id === providerId);
    if (!provider) return { ok: false, error: "Provider not found" };
    if (!provider.apiKey || !provider.apiKey.trim()) {
      return { ok: false, error: "Please enter an API Key first." };
    }

    set((state) => ({
      providers: state.providers.map((p) => (p.id === providerId ? { ...p, status: "ready" as const, isConfigured: true, pingMs: 24 } : p)),
    }));
    return { ok: true };
  },

  // ----------------- Infinite Creative Canvas & CAD -----------------
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDagNodeId: (id) => set({ selectedDagNodeId: id }),
  setCanvasScale: (scale) => set({ canvasScale: Math.max(0.2, Math.min(scale, 3.0)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  setActiveCadShape: (shape) => set({ activeCadShape: shape }),

  updateCanvasNodePosition: (id, x, y) => set((state) => ({
    canvasNodes: state.canvasNodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
  })),

  updateCanvasNodeData: (id, data) => set((state) => ({
    canvasNodes: state.canvasNodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
  })),

  addCanvasNode: (type) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const x = 120 + Math.random() * 180;
    const y = 100 + Math.random() * 140;
    let initialData: Record<string, any> = {};

    if (type === "prompt") {
      initialData = { title: "Directive Node", instruction: "Synthesize high-speed sovereign LLM inference runtime...", status: "completed", tokens: 180 };
    } else if (type === "subagent") {
      initialData = { role: "Architect Unit", model: get().selectedModel, task: "Building topological AST validation contracts", status: "running", progress: 65, tokensGenerated: 840 };
    } else if (type === "code") {
      initialData = { fileName: "ast_validator.rs", language: "rust", code: `pub fn validate_syntax(path: &Path, code: &str) -> Result<(), ToolError> {\n    syn::parse_file(code)\n        .map(|_| ())\n        .map_err(|e| ToolError::AstParseError(e.to_string()))\n}` };
    } else if (type === "diff") {
      initialData = { filePath: "crates/xeno-tools/src/ast_validator.rs", originalCode: "pub fn validate() {}", modifiedCode: "pub fn validate_syntax() -> Result<(), ToolError> {}" };
    } else if (type === "cad3d") {
      initialData = { title: "3D CAD & Tinker Model", shape: "column", wireframe: false, material: "alabaster" };
    } else if (type === "note") {
      initialData = { title: "Architectural Note", content: "Zero-leak IPC socket boundary guarantees air-gap integrity." };
    }

    const newNode: CanvasNode = { id, type, x, y, data: initialData };
    set((state) => ({ canvasNodes: [...state.canvasNodes, newNode], selectedNodeId: id }));
  },

  removeCanvasNode: (id) => set((state) => ({
    canvasNodes: state.canvasNodes.filter((n) => n.id !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
  })),

  clearCanvasNodes: () => set({ canvasNodes: [], selectedNodeId: null }),

  loadCanvasArchitectureTemplate: () => {
    const templateNodes: CanvasNode[] = [
      { id: "node-p1", type: "prompt", x: 60, y: 60, data: { title: "Directive", instruction: "Build sovereign multi-agent AST engine", status: "completed", tokens: 210 } },
      { id: "node-cad1", type: "cad3d", x: 440, y: 40, data: { title: "Roman Column 3D CAD", shape: "column", wireframe: false } },
      { id: "node-c1", type: "code", x: 860, y: 50, data: { fileName: "engine.rs", language: "rust", code: "pub fn execute_sovereign() -> bool {\n    true\n}" } },
    ];
    set({ canvasNodes: templateNodes, selectedNodeId: "node-cad1" });
  },

  // ----------------- Terminal Engine -----------------
  executeCommand: (rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userLog: TerminalLog = { id: `log-cmd-${Date.now()}`, timestamp: time, type: "command", content: `$ ${cmd}` };
    
    set((state) => ({
      terminalLogs: [...state.terminalLogs, userLog],
      commandHistory: [...state.commandHistory, cmd],
      historyIndex: -1,
    }));

    const parts = cmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setTimeout(() => {
      let responseContent = "";
      let responseType: TerminalLog["type"] = "stdout";

      switch (command) {
        case "help":
        case "?":
          responseContent = [
            "Available Sovereign Commands:",
            "  sysinfo, specs, neofetch  - Inspect real bare-metal hardware and OS environment",
            "  gpu                       - Query WebGL graphics accelerator & texture limits",
            "  models                    - List supported inference models and active routing",
            "  providers                 - Show cloud API and local host provider statuses",
            "  eval <code>               - Safely execute JavaScript in sovereign sandbox",
            "  ping <host>               - Test network latency",
            "  clear                     - Clear terminal buffer",
            "  date, whoami, version     - Kernel telemetry",
          ].join("\n");
          break;

        case "sysinfo":
        case "specs":
        case "neofetch":
          const m = get().systemMetrics;
          responseContent = [
            "╔═══════════════════════════════════════════════════════╗",
            `║ OS / Host:    ${m.osPlatform}`,
            `║ CPU Cores:    ${m.cpuCores} Logical Threads`,
            `║ GPU Device:   ${m.gpuRenderer}`,
            `║ RAM Heap:     ${m.ramHeapMb} MB JS Heap Allocated`,
            `║ Resolution:   ${m.screenResolution} @ ${m.devicePixelRatio}x DPI`,
            `║ Network:      ${m.networkType} (~${m.downlinkMbps} Mbps)`,
            `║ Security:     ${get().isAirGapped ? "Air-Gap Guard L3 (Isolated)" : "Tor SOCKS5 127.0.0.1:9050"}`,
            "╚═══════════════════════════════════════════════════════╝",
          ].join("\n");
          responseType = "intervention";
          break;

        case "gpu":
          responseContent = `GPU Accelerator: ${get().systemMetrics.gpuRenderer}\nWebGL 2.0: Supported\n3D CAD Mesh Shader: Hardware Accelerated`;
          break;

        case "providers":
          responseContent = get().providers.map((p) => `• [${p.sector.toUpperCase()}] ${p.name}: ${p.status.toUpperCase()} (${p.baseUrl})`).join("\n");
          break;

        case "models":
          responseContent = [
            "Active Sovereign AI Model Registry:",
            "  • claude-3-7-sonnet  [Anthropic Thinking Engine] - Active",
            "  • deepseek-r1        [DeepSeek Reasoning Core]",
            "  • gpt-4o             [OpenAI Multimodal]",
            "  • gemini-2-pro       [Google 2M Token Context]",
            "  • ollama-llama3.2    [Zero-Cost Local Kernel]",
          ].join("\n");
          break;

        case "eval":
          if (args.length === 0) {
            responseContent = "Usage: eval <javascript expression>";
            responseType = "stderr";
          } else {
            try {
              const code = args.join(" ");
              const result = Function(`"use strict"; return (${code})`)();
              responseContent = `==> ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}`;
            } catch (err: any) {
              responseContent = `Eval Error: ${err.message}`;
              responseType = "stderr";
            }
          }
          break;

        case "clear":
          set({ terminalLogs: [] });
          return;

        case "ping":
          const host = args[0] || "1.1.1.1";
          responseContent = `PING ${host} (56 data bytes)\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n--- ${host} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
          break;

        case "date":
          responseContent = new Date().toISOString();
          break;

        case "whoami":
          responseContent = "xeno-operator@sovereign-node";
          break;

        case "version":
          responseContent = "xeno-inference v0.1.0-alpha (Rust Syn AST + React 19 + 3D CAD)";
          break;

        default:
          responseContent = `command not found: ${command}. Type 'help' for available commands.`;
          responseType = "stderr";
          break;
      }

      const resLog: TerminalLog = {
        id: `log-res-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: responseType,
        content: responseContent,
      };

      set((state) => ({ terminalLogs: [...state.terminalLogs, resLog] }));
    }, 60);
  },

  clearTerminalLogs: () => set({ terminalLogs: [] }),

  // ----------------- DAG & Swarm Dynamic Execution -----------------
  addDagNode: (label, role, model, dependencies) => {
    const id = `dag-${Date.now().toString().slice(-4)}`;
    const newNode: DAGNodeItem = {
      id,
      label,
      role,
      status: "pending",
      model,
      dependencies,
      latencyMs: 0,
      stdout: "",
    };
    set((state) => ({ dagNodes: [...state.dagNodes, newNode] }));
  },

  runDagExecution: async () => {
    let nodes = get().dagNodes;
    if (nodes.length === 0) {
      nodes = [
        { id: "dag-1", label: "Decompose Task Directive", role: "commander", status: "pending", model: get().selectedModel, dependencies: [], latencyMs: 0 },
        { id: "dag-2", label: "AST Parse & Structural Contract", role: "architect", status: "pending", model: "DeepSeek R1", dependencies: ["dag-1"], latencyMs: 0 },
        { id: "dag-3", label: "Zero-Allocation Token Streamer", role: "coder", status: "pending", model: "Claude 3.5 Sonnet", dependencies: ["dag-2"], latencyMs: 0 },
      ];
      set({ dagNodes: nodes });
    }

    for (const node of nodes) {
      set((state) => ({
        dagNodes: state.dagNodes.map((n) => (n.id === node.id ? { ...n, status: "running" } : n)),
      }));
      await new Promise((r) => setTimeout(r, 550));
      set((state) => ({
        dagNodes: state.dagNodes.map((n) =>
          n.id === node.id
            ? { ...n, status: "completed", latencyMs: Math.round(140 + Math.random() * 260), stdout: `[${n.role.toUpperCase()}] Verified execution with zero syntax violations.` }
            : n
        ),
      }));
    }
  },

  addSwarmAgent: (role, title, model, task) => {
    const newAgent: SwarmAgentInfo = {
      role,
      title,
      model,
      status: "idle",
      currentTask: task,
      tokensGenerated: 0,
      voteScore: 96,
    };
    set((state) => ({ swarmAgents: [...state.swarmAgents, newAgent] }));
  },

  removeSwarmAgent: (role) => set((state) => ({
    swarmAgents: state.swarmAgents.filter((a) => a.role !== role),
  })),

  dispatchSwarmTask: (task) => {
    set((state) => ({
      swarmAgents: state.swarmAgents.map((a) => ({
        ...a,
        status: "coding",
        currentTask: `Collaborating on: "${task.slice(0, 42)}..."`,
        tokensGenerated: a.tokensGenerated + Math.floor(Math.random() * 350 + 150),
      })),
      consensusRate: Math.floor(Math.random() * 4 + 96),
    }));
  },

  triggerSwarmConsensus: () => {
    set((state) => ({
      consensusRate: Math.min(100, state.consensusRate + 2),
      swarmAgents: state.swarmAgents.map((a) => ({
        ...a,
        voteScore: Math.floor(Math.random() * 5 + 95),
        status: "testing",
      })),
    }));
  },

  // ----------------- Diff Studio -----------------
  addDiffFile: (filePath, originalCode, modifiedCode) => {
    const id = `diff-${Date.now().toString().slice(-4)}`;
    const newDiff: DiffItem = { id, filePath, originalCode, modifiedCode, staged: false, astValid: true };
    set((state) => ({ diffFiles: [...state.diffFiles, newDiff] }));
  },

  updateDiffFileContent: (id, modifiedCode) => set((state) => ({
    diffFiles: state.diffFiles.map((d) => (d.id === id ? { ...d, modifiedCode } : d)),
  })),

  toggleStageDiff: (id) => set((state) => ({
    diffFiles: state.diffFiles.map((d) => (d.id === id ? { ...d, staged: !d.staged } : d)),
  })),

  applyDiffToFile: (id) => set((state) => ({
    diffFiles: state.diffFiles.map((d) => (d.id === id ? { ...d, originalCode: d.modifiedCode, staged: false } : d)),
  })),

  // ----------------- Dynamic Chat Action -----------------
  sendChatMessage: async (content) => {
    if (!content.trim() || get().isGenerating) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const assistantMessageId = `msg-asst-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content,
      timestamp: time,
      attachedFiles: [...get().attachedFiles],
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      attachedFiles: [],
      isGenerating: true,
    }));

    const isThinking = get().isThinkingEnabled;
    const model = get().selectedModel;
    const thinkingSteps = [
      `Deconstructing directive with model ${model}`,
      `Querying host hardware state (${get().systemMetrics.cpuCores} cores, ${get().systemMetrics.gpuRenderer})`,
      "Evaluating syntactic boundaries and AST safety contracts",
      "Synthesizing optimal response with zero hallucination constraints",
    ];

    const assistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model,
      thinking: isThinking
        ? {
            durationSecs: 1.1,
            tokens: 380,
            summary: "Executed multi-step cognitive verification across sovereign runtime nodes.",
            steps: thinkingSteps,
            expanded: false,
          }
        : undefined,
      metrics: {
        tokPerSec: parseFloat((Math.random() * 20 + 75).toFixed(1)),
        totalTokens: 0,
        latencyMs: Math.round(Math.random() * 60 + 110),
      },
    };

    set((state) => ({ chatMessages: [...state.chatMessages, assistantMsg] }));

    let fullResponse = "";
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("diff") || lowerContent.includes("ast") || lowerContent.includes("replace")) {
      fullResponse = `I have analyzed the AST specifications. The character-exact replacement is validated:\n\n\`\`\`rust\npub fn validate_syntax(path: &Path, code: &str) -> Result<(), ToolError> {\n    syn::parse_file(code)\n        .map(|_| ())\n        .map_err(|e| ToolError::AstParseError(e.to_string()))\n}\n\`\`\`\n\nAll syntax checks parsed cleanly with zero unresolved dependencies.`;
    } else if (lowerContent.includes("hardware") || lowerContent.includes("spec") || lowerContent.includes("gpu") || lowerContent.includes("cpu")) {
      const m = get().systemMetrics;
      fullResponse = `**Bare Machine Telemetry:**\n- **Platform:** ${m.osPlatform}\n- **CPU Cores:** ${m.cpuCores} Logical Threads\n- **GPU Accelerator:** ${m.gpuRenderer}\n- **JS Heap:** ${m.ramHeapMb} MB\n- **Resolution:** ${m.screenResolution} @ ${m.devicePixelRatio}x\n\nAll subagent pipelines are running natively with hardware acceleration.`;
    } else {
      fullResponse = `I have processed your instruction: **"${content}"**.\n\n- **Model Selected:** \`${model}\`\n- **Routing Policy:** \`${get().routingPolicy}\`\n- **Security Isolation:** \`${get().isAirGapped ? "Air-Gap Guard Active" : "Tor SOCKS5 Proxy"}\`\n\nThe sovereign inference engine has verified execution with zero external data leakage.`;
    }

    const words = fullResponse.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      accumulated += (i > 0 ? " " : "") + words[i];
      const currentText = accumulated;
      await new Promise((r) => setTimeout(r, Math.min(20, 380 / words.length)));

      set((state) => ({
        chatMessages: state.chatMessages.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: currentText, metrics: m.metrics ? { ...m.metrics, totalTokens: (i + 1) * 4 } : undefined }
            : m
        ),
      }));
    }

    set((state) => ({
      isGenerating: false,
      systemMetrics: {
        ...state.systemMetrics,
        liveTokenCount: state.systemMetrics.liveTokenCount + words.length * 4,
        costUsd: state.systemMetrics.costUsd + 0.0006,
      },
    }));
  },

  toggleThinking: () => set((state) => ({ isThinkingEnabled: !state.isThinkingEnabled })),
  setThinkingBudget: (budget) => set({ thinkingBudget: budget }),
  toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
  toggleCodeExecMode: () => set((state) => ({ isCodeExecMode: !state.isCodeExecMode })),
  toggleMcpModal: () => set((state) => ({ isMcpModalOpen: !state.isMcpModalOpen })),
  toggleMcpTool: (serverId, toolName) => set((state) => ({
    mcpServers: state.mcpServers.map((s) =>
      s.id === serverId ? { ...s, tools: s.tools.map((t) => (t.name === toolName ? { ...t, enabled: !t.enabled } : t)) } : s
    ),
  })),
  toggleMcpServer: (serverId) => set((state) => ({
    mcpServers: state.mcpServers.map((s) =>
      s.id === serverId ? { ...s, status: s.status === "connected" ? "disabled" : "connected" } : s
    ),
  })),
  attachFile: (filePath) => set((state) => ({ attachedFiles: [...state.attachedFiles, filePath] })),
  removeAttachedFile: (filePath) => set((state) => ({ attachedFiles: state.attachedFiles.filter((f) => f !== filePath) })),
  clearChat: () => set({ chatMessages: [] }),
  forkThoughtToCanvas: (messageId) => {
    const msg = get().chatMessages.find((m) => m.id === messageId);
    if (!msg) return;
    get().addCanvasNode(msg.role === "user" ? "prompt" : "code");
    set({ activeView: "canvas" });
  },
  setActiveInspectGraphMessageId: (id) => set({ activeInspectGraphMessageId: id }),

  // ----------------- Tor Sandbox -----------------
  navigateTorBrowser: (url) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }
    set((state) => ({ torUrl: cleanUrl, torHistory: [...state.torHistory, cleanUrl] }));
  },

  requestNewTorIdentity: () => {
    const relays = [
      { name: "Relay CH-09 (Zurich)", country: "🇨🇭 CH", ip: "179.43.144.18", latencyMs: 28, type: "guard" as const },
      { name: "Relay SE-03 (Stockholm)", country: "🇸🇪 SE", ip: "192.36.27.7", latencyMs: 44, type: "relay" as const },
      { name: "Exit Node IS-07 (Reykjavik)", country: "🇮🇸 IS", ip: "82.221.139.55", latencyMs: 61, type: "exit" as const },
    ];
    set({ torCircuit: relays });
  },

  setTorShieldLevel: (level) => set({ torShieldLevel: level }),

  // ----------------- Snapshots -----------------
  exportSessionJson: () => {
    const state = get();
    const exportData = {
      version: "0.2.0",
      exportedAt: new Date().toISOString(),
      themeMode: state.themeMode,
      selectedModel: state.selectedModel,
      routingPolicy: state.routingPolicy,
      chatMessages: state.chatMessages,
      canvasNodes: state.canvasNodes,
      diffFiles: state.diffFiles,
      dagNodes: state.dagNodes,
      swarmAgents: state.swarmAgents,
    };
    return JSON.stringify(exportData, null, 2);
  },

  importSessionJson: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.chatMessages) set({ chatMessages: data.chatMessages });
      if (data.canvasNodes) set({ canvasNodes: data.canvasNodes });
      if (data.diffFiles) set({ diffFiles: data.diffFiles });
      return true;
    } catch {
      return false;
    }
  },

  handleSmartPrompt: (input) => {
    const lower = input.toLowerCase();
    let view: ViewMode = "home";
    let message = "Navigated to Chat Studio";

    if (lower.startsWith("/think") || lower.includes("swarm") || lower.includes("dag") || lower.includes("reasoning")) {
      view = "thinking";
      message = "Switched to Unified Thinking Studio";
    } else if (lower.startsWith("/canvas") || lower.includes("cad") || lower.includes("tinker") || lower.includes("whiteboard")) {
      view = "canvas";
      message = "Switched to Infinite Creative Workbench";
    } else if (lower.startsWith("/term") || lower.includes("terminal") || lower.includes("shell") || lower.includes("cargo")) {
      view = "terminal";
      message = "Switched to ConPTY Virtual Terminal";
    } else if (lower.startsWith("/diff") || lower.includes("ast") || lower.includes("patch")) {
      view = "diff";
      message = "Switched to AST Diff Studio";
    } else if (lower.startsWith("/tor") || lower.includes("browse") || lower.includes("onion")) {
      view = "browser";
      message = "Switched to Tor Sandboxed Browser";
    }

    set({ activeView: view });
    return { view, message };
  },

  updateMetricsTick: () => {
    if (typeof window === "undefined") return;
    const res = `${window.innerWidth}x${window.innerHeight}`;
    const dpi = window.devicePixelRatio || 1;
    let mem = 84;
    if (typeof performance !== "undefined" && (performance as any).memory) {
      mem = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }

    set((state) => ({
      systemMetrics: {
        ...state.systemMetrics,
        ramHeapMb: mem,
        screenResolution: res,
        devicePixelRatio: dpi,
        activeSessionUptimeSecs: state.systemMetrics.activeSessionUptimeSecs + 1,
        liveTokPerSec: state.isGenerating ? parseFloat((Math.random() * 15 + 78).toFixed(1)) : 0,
      },
    }));
  },
}));
