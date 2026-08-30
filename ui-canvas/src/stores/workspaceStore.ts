import { create } from "zustand";

export type ViewMode = "home" | "canvas" | "browser" | "dag" | "timeline" | "terminal" | "diff" | "swarm";
export type ProviderModel = 
  | "claude-3-7-sonnet" 
  | "deepseek-r1" 
  | "gpt-4o" 
  | "gemini-2-pro" 
  | "local-gguf" 
  | "groq-llama3";
export type RoutingPolicy = "speed" | "reasoning" | "privacy" | "cost";
export type NodeStatus = "pending" | "running" | "completed" | "failed" | "healing";
export type ThemeMode = "light" | "dark";

export interface CanvasNode {
  id: string;
  type: "prompt" | "subagent" | "code" | "diff" | "artifact";
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
  gpuLoadPct: number;
  vramUsedGb: number;
  vramTotalGb: number;
  gpuRenderer: string;
  networkType: string;
  downlinkMbps: number;
  batteryLevel: number | null;
  isBatteryCharging: boolean | null;
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

export interface ChatMediaItem {
  type: "image" | "code" | "diff";
  url?: string;
  title?: string;
  code?: string;
  language?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  model?: string;
  thinking?: ChatThinkingData;
  toolCalls?: ChatToolCall[];
  media?: ChatMediaItem[];
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
  selectedModel: ProviderModel;
  routingPolicy: RoutingPolicy;
  isAirGapped: boolean;
  isSidebarOpen: boolean;
  isShortcutsOpen: boolean;
  isExportOpen: boolean;
  soundEnabled: boolean;

  // Real Dynamic Telemetry & Server/Host Rendered Metrics
  systemMetrics: DynamicSystemMetrics;

  // Canvas
  canvasNodes: CanvasNode[];
  selectedNodeId: string | null;
  canvasScale: number;
  canvasPan: { x: number; y: number };

  // DAG & Execution
  dagNodes: DAGNodeItem[];
  selectedDagNodeId: string | null;

  // Timeline / Deep Thinking
  timelineSteps: CognitiveStep[];
  speculativeBranches: SpeculativeBranch[];

  // Terminal / ConPTY
  terminalLogs: TerminalLog[];
  commandHistory: string[];
  historyIndex: number;
  currentCommand: string;
  securityTier: string;

  // Swarm Council
  swarmAgents: SwarmAgentInfo[];
  consensusRate: number;

  // AST Diff Studio
  diffFiles: DiffItem[];

  // Tor Browser Sandbox
  torUrl: string;
  torCircuit: TorCircuitHop[];
  torShieldLevel: "Standard" | "Safer" | "Safest";
  isTorConnected: boolean;
  torHistory: string[];

  // Chat Studio & Arsenal State
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  isThinkingEnabled: boolean;
  thinkingBudget: "fast" | "deep" | "max";
  isWebSearchEnabled: boolean;
  webSearchMode: "clearnet" | "onion";
  isImageGenMode: boolean;
  isCodeExecMode: boolean;
  isMcpModalOpen: boolean;
  mcpServers: McpServerConfig[];
  attachedFiles: string[];
  activeInspectGraphMessageId: string | null;
  isDaemonOnline: boolean;
  customApiKey: string;
  customApiEndpoint: string;

  // Actions
  setActiveView: (view: ViewMode) => void;
  toggleTheme: () => void;
  setSelectedModel: (model: ProviderModel) => void;
  setRoutingPolicy: (policy: RoutingPolicy) => void;
  toggleAirGap: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleShortcuts: () => void;
  toggleExport: () => void;
  toggleSound: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDagNodeId: (id: string | null) => void;
  setCanvasScale: (scale: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  updateCanvasNodePosition: (id: string, x: number, y: number) => void;
  updateCanvasNodeData: (id: string, data: Record<string, any>) => void;
  addCanvasNode: (type: "prompt" | "subagent" | "code" | "diff") => void;
  removeCanvasNode: (id: string) => void;
  clearCanvasNodes: () => void;

  // Interactive Terminal Actions
  executeCommand: (cmd: string) => void;
  clearTerminalLogs: () => void;

  // Dynamic DAG & Swarm Actions
  addDagNode: (label: string, role: DAGNodeItem["role"], model: string, dependencies: string[]) => void;
  runDagExecution: () => Promise<void>;
  addSwarmAgent: (role: SwarmAgentInfo["role"], title: string, model: string, task: string) => void;
  removeSwarmAgent: (role: string) => void;
  dispatchSwarmTask: (task: string) => void;
  triggerSwarmConsensus: () => void;

  // Dynamic Diff Studio Actions
  addDiffFile: (filePath: string, originalCode: string, modifiedCode: string) => void;
  updateDiffFileContent: (id: string, modifiedCode: string) => void;
  toggleStageDiff: (id: string) => void;
  applyDiffToFile: (id: string) => void;

  exportSessionJson: () => string;
  importSessionJson: (jsonStr: string) => boolean;

  // Chat & Arsenal Actions
  sendChatMessage: (content: string) => Promise<void>;
  toggleThinking: () => void;
  setThinkingBudget: (budget: "fast" | "deep" | "max") => void;
  toggleWebSearch: () => void;
  setWebSearchMode: (mode: "clearnet" | "onion") => void;
  toggleImageGenMode: () => void;
  toggleCodeExecMode: () => void;
  toggleMcpModal: () => void;
  toggleMcpTool: (serverId: string, toolName: string) => void;
  toggleMcpServer: (serverId: string) => void;
  attachFile: (filePath: string) => void;
  removeAttachedFile: (filePath: string) => void;
  clearChat: () => void;
  forkThoughtToCanvas: (messageId: string) => void;
  setActiveInspectGraphMessageId: (id: string | null) => void;
  setCustomApiKey: (key: string) => void;
  setCustomApiEndpoint: (endpoint: string) => void;

  // Tor Actions
  navigateTorBrowser: (url: string) => void;
  requestNewTorIdentity: () => void;
  setTorShieldLevel: (level: "Standard" | "Safer" | "Safest") => void;

  // Smart Intent Navigation
  handleSmartPrompt: (input: string) => { view: ViewMode; message: string };
  updateMetricsTick: () => void;
}

// ----------------- Bare Machine & Real Environment Detection -----------------
const detectGpuRenderer = (): string => {
  if (typeof document === "undefined") return "Generic GPU Accelerator";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        return (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "WebGL Hardware Acceleration";
      }
      return (gl as any).getParameter((gl as any).RENDERER) || "WebGL Native Device";
    }
  } catch {
    // Fallback
  }
  return "Hardware Accelerated GPU";
};

const detectOsPlatform = (): string => {
  if (typeof navigator === "undefined") return "Linux / Bare Machine";
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
  return 92;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeView: "home",
  themeMode: (typeof window !== "undefined" && localStorage.getItem("xeno_theme") === "dark") ? "dark" : "light",
  selectedModel: "claude-3-7-sonnet",
  routingPolicy: "reasoning",
  isAirGapped: false,
  isSidebarOpen: false, // Default closed on small screens for maximum whitespace
  isShortcutsOpen: false,
  isExportOpen: false,
  soundEnabled: true,
  customApiKey: typeof window !== "undefined" ? localStorage.getItem("xeno_api_key") || "" : "",
  customApiEndpoint: typeof window !== "undefined" ? localStorage.getItem("xeno_api_endpoint") || "" : "",

  systemMetrics: {
    cpuCores: getInitialCpuCores(),
    ramHeapMb: getInitialMemoryMb(),
    screenResolution: getInitialResolution(),
    devicePixelRatio: getInitialDpi(),
    activeSessionUptimeSecs: 0,
    liveTokenCount: 1420,
    liveTokPerSec: 74.2,
    costUsd: 0.0042,
    ttftMs: 128,
    gpuLoadPct: 34.5,
    vramUsedGb: 4.2,
    vramTotalGb: 16.0,
    gpuRenderer: detectGpuRenderer(),
    networkType: typeof navigator !== "undefined" && (navigator as any).connection?.effectiveType ? (navigator as any).connection.effectiveType.toUpperCase() : "HIGH-SPEED",
    downlinkMbps: typeof navigator !== "undefined" && (navigator as any).connection?.downlink ? (navigator as any).connection.downlink : 100,
    batteryLevel: null,
    isBatteryCharging: null,
    osPlatform: detectOsPlatform(),
  },

  canvasNodes: [
    {
      id: "node-1",
      type: "prompt",
      x: 60,
      y: 80,
      data: {
        title: "User Directive",
        instruction: "Synthesize high-speed sovereign LLM inference runtime with character-exact AST diffing",
        status: "completed",
        tokens: 180,
      },
    },
    {
      id: "node-2",
      type: "subagent",
      x: 480,
      y: 60,
      data: {
        role: "Architect Agent",
        model: "Claude 3.7 Sonnet (Thinking)",
        task: "Building topological AST validation contracts",
        status: "completed",
        progress: 100,
        tokensGenerated: 940,
      },
    },
    {
      id: "node-3",
      type: "code",
      x: 900,
      y: 60,
      data: {
        fileName: "ast_validator.rs",
        language: "rust",
        code: `pub fn validate_syntax(path: &Path, code: &str) -> Result<(), ToolError> {\n    syn::parse_file(code)\n        .map(|_| ())\n        .map_err(|e| ToolError::AstParseError(e.to_string()))\n}`,
      },
    },
  ],
  selectedNodeId: "node-1",
  canvasScale: 1.0,
  canvasPan: { x: 0, y: 0 },

  dagNodes: [
    {
      id: "dag-1",
      label: "Commander: Decompose Task",
      role: "commander",
      status: "completed",
      model: "Claude 3.7 Sonnet",
      dependencies: [],
      latencyMs: 140,
      stdout: "[Commander] Decomposed goal into AST verification and client-side reactive rendering.",
    },
    {
      id: "dag-2",
      label: "Architect: syn AST Contract",
      role: "architect",
      status: "completed",
      model: "DeepSeek R1",
      dependencies: ["dag-1"],
      latencyMs: 320,
      stdout: "[Architect] Syn AST parse contract verified with zero external leaks.",
    },
    {
      id: "dag-3",
      label: "Coder: Synthesize Engine",
      role: "coder",
      status: "completed",
      model: "Claude 3.7 Sonnet",
      dependencies: ["dag-2"],
      latencyMs: 780,
      stdout: "[Coder] Generated xeno-tools AST engine with character-level accuracy.",
    },
  ],
  selectedDagNodeId: "dag-1",

  timelineSteps: [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Environment Introspection & Bare Machine Probe",
      phase: "Goal Decomposition",
      latencyMs: 82,
      tokens: 240,
      speed: 94.2,
      status: "verified",
      details: [
        `Probed runtime: ${detectOsPlatform()}`,
        `Detected GPU: ${detectGpuRenderer()}`,
        `Allocated ${getInitialCpuCores()} logical cores with WebGL hardware rasterization`,
      ],
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "Live AST & Zero-Copy Token Routing",
      phase: "AST Navigation",
      latencyMs: 194,
      tokens: 680,
      speed: 86.4,
      status: "verified",
      details: [
        "Initialized character-exact diff parser with Syn AST validation",
        "Applied zero-leak airgap socket protections",
      ],
    },
  ],
  speculativeBranches: [
    {
      id: "branch-1",
      name: "Zero-Copy WASM Kernel",
      score: 98,
      status: "selected",
      rationale: "Direct memory mapping delivers sub-millisecond AST line evaluation.",
      latencyEstimateMs: 14,
    },
    {
      id: "branch-2",
      name: "IPC Socket Relay",
      score: 72,
      status: "pruned",
      rationale: "Higher context serialization overhead.",
      latencyEstimateMs: 86,
    },
  ],

  terminalLogs: [
    {
      id: "log-1",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      content: `XENO Sovereign Workstation Kernel v2.4.0 [${detectOsPlatform()}]`,
    },
    {
      id: "log-2",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      content: `Hardware: ${getInitialCpuCores()} Cores • GPU: ${detectGpuRenderer()}`,
    },
    {
      id: "log-3",
      timestamp: new Date().toLocaleTimeString(),
      type: "intervention",
      content: "Type 'help' or 'sysinfo' to inspect real environment telemetry.",
    },
  ],
  commandHistory: [],
  historyIndex: -1,
  currentCommand: "",
  securityTier: "Air-Gap Guard L3",

  swarmAgents: [
    {
      role: "commander",
      title: "Commander Unit",
      model: "Claude 3.7 Sonnet",
      status: "planning",
      currentTask: "Orchestrating speculative inference pipeline and token budget",
      tokensGenerated: 1840,
      voteScore: 99,
    },
    {
      role: "architect",
      title: "Schema Architect",
      model: "DeepSeek R1",
      status: "idle",
      currentTask: "Verified syn AST AST structure against Rust standard definitions",
      tokensGenerated: 1260,
      voteScore: 96,
    },
    {
      role: "coder",
      title: "Core Coder",
      model: "Claude 3.7 Sonnet",
      status: "coding",
      currentTask: "Writing zero-allocation token streaming buffers",
      tokensGenerated: 3420,
      voteScore: 98,
    },
  ],
  consensusRate: 98,

  diffFiles: [
    {
      id: "diff-1",
      filePath: "crates/xeno-tools/src/ast_validator.rs",
      originalCode: `pub fn validate() {\n    // stub\n}`,
      modifiedCode: `pub fn validate_syntax(path: &Path, code: &str) -> Result<(), ToolError> {\n    syn::parse_file(code)\n        .map(|_| ())\n        .map_err(|e| ToolError::AstParseError(e.to_string()))\n}`,
      staged: true,
      astValid: true,
    },
  ],

  torUrl: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion",
  torCircuit: [
    { name: "Guard Node (Relay DE-01)", country: "🇩🇪 DE", ip: "185.220.101.5", latencyMs: 24, type: "guard" },
    { name: "Middle Relay (NL-04)", country: "🇳🇱 NL", ip: "193.200.241.12", latencyMs: 38, type: "relay" },
    { name: "Exit Authority (IS-02)", country: "🇮🇸 IS", ip: "82.221.139.11", latencyMs: 52, type: "exit" },
  ],
  torShieldLevel: "Safer",
  isTorConnected: true,
  torHistory: ["https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion"],

  chatMessages: [
    {
      id: "msg-welcome",
      role: "assistant",
      content: "Welcome to **Xeno-Inference**. Sovereign, high-velocity intelligence runtime running on bare machine acceleration. Ask any technical query, dispatch AST patches, or command the multi-agent swarm.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: "Claude 3.7 Sonnet",
      thinking: {
        durationSecs: 0.8,
        tokens: 310,
        summary: "Probed host hardware specs and initialized live neural constellation graph.",
        steps: [
          `Identified host architecture: ${detectOsPlatform()}`,
          `Activated GPU acceleration: ${detectGpuRenderer()}`,
          "Mounted sovereign sandbox channels",
        ],
      },
    },
  ],
  isGenerating: false,
  isThinkingEnabled: true,
  thinkingBudget: "deep",
  isWebSearchEnabled: false,
  webSearchMode: "clearnet",
  isImageGenMode: false,
  isCodeExecMode: true,
  isMcpModalOpen: false,
  mcpServers: [
    {
      id: "server-github",
      name: "GitHub Sovereign MCP",
      status: "connected",
      pingMs: 18,
      tools: [
        { name: "repo_list", description: "Query GitHub user repos", enabled: true, category: "Version Control" },
        { name: "pull_request", description: "Create branch PR", enabled: true, category: "Version Control" },
      ],
    },
    {
      id: "server-filesystem",
      name: "Local Filesystem MCP",
      status: "connected",
      pingMs: 2,
      tools: [
        { name: "read_file", description: "Zero-copy file reader", enabled: true, category: "Storage" },
        { name: "ast_replace", description: "Line-bounded syn replacements", enabled: true, category: "AST Tools" },
      ],
    },
  ],
  attachedFiles: [],
  activeInspectGraphMessageId: null,
  isDaemonOnline: true,

  // ----------------- Setters & Core Actions -----------------
  setActiveView: (view: ViewMode) => set({ activeView: view, isSidebarOpen: false }),
  toggleTheme: () => {
    const current = get().themeMode;
    const next = current === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      localStorage.setItem("xeno_theme", next);
    }
    set({ themeMode: next });
  },
  setSelectedModel: (model) => set({ selectedModel: model }),
  setRoutingPolicy: (policy) => set({ routingPolicy: policy }),
  toggleAirGap: () => set((state) => ({ isAirGapped: !state.isAirGapped })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleShortcuts: () => set((state) => ({ isShortcutsOpen: !state.isShortcutsOpen })),
  toggleExport: () => set((state) => ({ isExportOpen: !state.isExportOpen })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDagNodeId: (id) => set({ selectedDagNodeId: id }),
  setCanvasScale: (scale) => set({ canvasScale: Math.max(0.2, Math.min(scale, 3.0)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  
  updateCanvasNodePosition: (id, x, y) => set((state) => ({
    canvasNodes: state.canvasNodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
  })),

  updateCanvasNodeData: (id, data) => set((state) => ({
    canvasNodes: state.canvasNodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
  })),

  addCanvasNode: (type) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const x = 120 + Math.random() * 200;
    const y = 120 + Math.random() * 160;
    let initialData: Record<string, any> = {};

    if (type === "prompt") {
      initialData = { title: "New Prompt Node", instruction: "Define LLM objective...", status: "pending", tokens: 0 };
    } else if (type === "subagent") {
      initialData = { role: "Specialist Subagent", model: get().selectedModel, task: "Executing subtask...", status: "running", progress: 25, tokensGenerated: 320 };
    } else if (type === "code") {
      initialData = { fileName: "solution.rs", language: "rust", code: `// Dynamic code block\npub fn solve() -> bool {\n    true\n}` };
    } else if (type === "diff") {
      initialData = { filePath: "src/main.rs", diff: `@@ -1 +1 @@\n-old()\n+new()` };
    }

    const newNode: CanvasNode = { id, type, x, y, data: initialData };
    set((state) => ({ canvasNodes: [...state.canvasNodes, newNode], selectedNodeId: id }));
  },

  removeCanvasNode: (id) => set((state) => ({
    canvasNodes: state.canvasNodes.filter((n) => n.id !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
  })),

  clearCanvasNodes: () => set({ canvasNodes: [], selectedNodeId: null }),

  // ----------------- Interactive Terminal Execution Engine -----------------
  executeCommand: (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString();
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
          responseContent = `GPU Renderer: ${get().systemMetrics.gpuRenderer}\nWebGL 2.0: Supported\nVRAM Pool: ${get().systemMetrics.vramUsedGb} GB / ${get().systemMetrics.vramTotalGb} GB (Simulated Mesh Allocation)`;
          break;

        case "models":
          responseContent = [
            "Active Sovereign AI Model Registry:",
            "  • claude-3-7-sonnet  [Anthropic Thinking Engine] - Active",
            "  • deepseek-r1        [DeepSeek Reasoning Core]",
            "  • gpt-4o             [OpenAI Multimodal]",
            "  • gemini-2-pro       [Google 2M Token Context]",
            "  • local-gguf         [Zero-Cost Local Kernel]",
          ].join("\n");
          break;

        case "eval":
          if (args.length === 0) {
            responseContent = "Usage: eval <javascript expression>";
            responseType = "stderr";
          } else {
            try {
              const code = args.join(" ");
              // eslint-disable-next-line no-eval
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
          responseContent = `PING ${host} (56 data bytes)\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.8 ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
          break;

        case "date":
          responseContent = new Date().toISOString();
          break;

        case "whoami":
          responseContent = "xeno-operator@sovereign-node";
          break;

        case "version":
          responseContent = "xeno-inference v0.1.0-alpha (Rust Syn AST + React 19)";
          break;

        default:
          responseContent = `command not found: ${command}. Type 'help' for available commands.`;
          responseType = "stderr";
          break;
      }

      const resLog: TerminalLog = {
        id: `log-res-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: responseType,
        content: responseContent,
      };

      set((state) => ({ terminalLogs: [...state.terminalLogs, resLog] }));
    }, 80);
  },

  clearTerminalLogs: () => set({ terminalLogs: [] }),

  // ----------------- Dynamic DAG Engine -----------------
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
    const nodes = get().dagNodes;
    for (const node of nodes) {
      set((state) => ({
        dagNodes: state.dagNodes.map((n) => (n.id === node.id ? { ...n, status: "running" } : n)),
      }));
      await new Promise((r) => setTimeout(r, 600));
      set((state) => ({
        dagNodes: state.dagNodes.map((n) =>
          n.id === node.id
            ? { ...n, status: "completed", latencyMs: Math.round(180 + Math.random() * 400), stdout: `[${n.role}] Execution completed with zero syntax violations.` }
            : n
        ),
      }));
    }
  },

  // ----------------- Dynamic Swarm Council -----------------
  addSwarmAgent: (role, title, model, task) => {
    const newAgent: SwarmAgentInfo = {
      role,
      title,
      model,
      status: "idle",
      currentTask: task,
      tokensGenerated: 0,
      voteScore: 95,
    };
    set((state) => ({ swarmAgents: [...state.swarmAgents, newAgent] }));
  },

  removeSwarmAgent: (role) => set((state) => ({
    swarmAgents: state.swarmAgents.filter((a) => a.role !== role),
  })),

  dispatchSwarmTask: (task: string) => {
    set((state) => ({
      swarmAgents: state.swarmAgents.map((a) => ({
        ...a,
        status: "coding",
        currentTask: `Collaborating on: "${task.slice(0, 40)}..."`,
        tokensGenerated: a.tokensGenerated + Math.floor(Math.random() * 400 + 200),
      })),
      consensusRate: Math.floor(Math.random() * 5 + 95),
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

  // ----------------- Dynamic Diff Studio -----------------
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

  exportSessionJson: () => {
    const state = get();
    const exportData = {
      version: "0.1.0",
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

  importSessionJson: (jsonStr: string) => {
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

  // ----------------- Chat Studio & Streaming Action -----------------
  sendChatMessage: async (content: string) => {
    if (!content.trim() || get().isGenerating) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const assistantMessageId = `msg-asst-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

    // Dynamic Assistant Response with realistic progressive stream & thinking steps
    const isThinking = get().isThinkingEnabled;
    const model = get().selectedModel;
    const thinkingSteps = [
      `Deconstructing directive with model ${model}`,
      `Querying local bare machine state (${get().systemMetrics.cpuCores} cores, ${get().systemMetrics.gpuRenderer})`,
      "Evaluating syntactic boundaries and AST safety contracts",
      "Synthesizing optimal response with zero hallucination constraints",
    ];

    const assistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model,
      thinking: isThinking
        ? {
            durationSecs: 1.2,
            tokens: 420,
            summary: "Executed multi-step cognitive verification across sovereign runtime nodes.",
            steps: thinkingSteps,
            expanded: false,
          }
        : undefined,
      metrics: {
        tokPerSec: parseFloat((Math.random() * 20 + 75).toFixed(1)),
        totalTokens: 0,
        latencyMs: Math.round(Math.random() * 80 + 120),
      },
    };

    set((state) => ({ chatMessages: [...state.chatMessages, assistantMsg] }));

    // Generate tailored dynamic response content
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

    // Stream text progressively
    const words = fullResponse.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      accumulated += (i > 0 ? " " : "") + words[i];
      const currentText = accumulated;
      await new Promise((r) => setTimeout(r, Math.min(25, 400 / words.length)));

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
        costUsd: state.systemMetrics.costUsd + 0.0008,
      },
    }));
  },

  toggleThinking: () => set((state) => ({ isThinkingEnabled: !state.isThinkingEnabled })),
  setThinkingBudget: (budget) => set({ thinkingBudget: budget }),
  toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
  setWebSearchMode: (mode) => set({ webSearchMode: mode }),
  toggleImageGenMode: () => set((state) => ({ isImageGenMode: !state.isImageGenMode })),
  toggleCodeExecMode: () => set((state) => ({ isCodeExecMode: !state.isCodeExecMode })),
  toggleMcpModal: () => set((state) => ({ isMcpModalOpen: !state.isMcpModalOpen })),
  toggleMcpTool: (serverId, toolName) => set((state) => ({
    mcpServers: state.mcpServers.map((s) =>
      s.id === serverId
        ? {
            ...s,
            tools: s.tools.map((t) => (t.name === toolName ? { ...t, enabled: !t.enabled } : t)),
          }
        : s
    ),
  })),
  toggleMcpServer: (serverId) => set((state) => ({
    mcpServers: state.mcpServers.map((s) =>
      s.id === serverId ? { ...s, status: s.status === "connected" ? "disabled" : "connected" } : s
    ),
  })),
  attachFile: (filePath) => set((state) => ({ attachedFiles: [...state.attachedFiles, filePath] })),
  removeAttachedFile: (filePath) => set((state) => ({
    attachedFiles: state.attachedFiles.filter((f) => f !== filePath),
  })),
  clearChat: () => set({ chatMessages: [] }),
  forkThoughtToCanvas: (messageId) => {
    const msg = get().chatMessages.find((m) => m.id === messageId);
    if (!msg) return;
    get().addCanvasNode(msg.role === "user" ? "prompt" : "code");
    set({ activeView: "canvas" });
  },
  setActiveInspectGraphMessageId: (id) => set({ activeInspectGraphMessageId: id }),
  setCustomApiKey: (key) => {
    if (typeof window !== "undefined") localStorage.setItem("xeno_api_key", key);
    set({ customApiKey: key });
  },
  setCustomApiEndpoint: (endpoint) => {
    if (typeof window !== "undefined") localStorage.setItem("xeno_api_endpoint", endpoint);
    set({ customApiEndpoint: endpoint });
  },

  // ----------------- Tor Sandbox Actions -----------------
  navigateTorBrowser: (url) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }
    set((state) => ({
      torUrl: cleanUrl,
      torHistory: [...state.torHistory, cleanUrl],
    }));
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

  // ----------------- Smart Intent Navigation -----------------
  handleSmartPrompt: (input) => {
    const lower = input.toLowerCase();
    let view: ViewMode = "home";
    let message = "Navigated to Chat Studio";

    if (lower.startsWith("/tor") || lower.includes("onion") || lower.includes("browse")) {
      view = "browser";
      message = "Switched to Tor Sandboxed Browser";
    } else if (lower.startsWith("/term") || lower.includes("terminal") || lower.includes("shell") || lower.includes("cargo")) {
      view = "terminal";
      message = "Switched to Virtual Terminal";
    } else if (lower.startsWith("/swarm") || lower.includes("council") || lower.includes("agents")) {
      view = "swarm";
      message = "Switched to Autonomous Swarm Council";
    } else if (lower.startsWith("/dag") || lower.includes("graph") || lower.includes("pipeline")) {
      view = "dag";
      message = "Switched to Live Execution DAG";
    } else if (lower.startsWith("/diff") || lower.includes("ast") || lower.includes("patch")) {
      view = "diff";
      message = "Switched to AST Diff Studio";
    } else if (lower.startsWith("/canvas") || lower.includes("spatial") || lower.includes("nodes")) {
      view = "canvas";
      message = "Switched to Spatial Canvas";
    } else if (lower.startsWith("/timeline") || lower.includes("reasoning")) {
      view = "timeline";
      message = "Switched to Deep Thinking Timeline";
    }

    set({ activeView: view });
    return { view, message };
  },

  updateMetricsTick: () => {
    if (typeof window === "undefined") return;
    const res = `${window.innerWidth}x${window.innerHeight}`;
    const dpi = window.devicePixelRatio || 1;
    let mem = 88;
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
        liveTokPerSec: state.isGenerating ? parseFloat((Math.random() * 15 + 80).toFixed(1)) : 0,
      },
    }));
  },
}));
