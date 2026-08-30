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

  // Real Dynamic Telemetry & Server Rendered Metrics
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

  // Actions
  setActiveView: (view: ViewMode) => void;
  toggleTheme: () => void;
  setSelectedModel: (model: ProviderModel) => void;
  setRoutingPolicy: (policy: RoutingPolicy) => void;
  toggleAirGap: () => void;
  toggleSidebar: () => void;
  toggleShortcuts: () => void;
  toggleExport: () => void;
  toggleSound: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedDagNodeId: (id: string | null) => void;
  setCanvasScale: (scale: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  updateCanvasNodePosition: (id: string, x: number, y: number) => void;
  addCanvasNode: (type: "prompt" | "subagent" | "code" | "diff") => void;
  removeCanvasNode: (id: string) => void;
  executeCommand: (cmd: string) => void;
  dispatchSwarmTask: (task: string) => void;
  toggleStageDiff: (id: string) => void;
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

  // Tor Actions
  navigateTorBrowser: (url: string) => void;
  requestNewTorIdentity: () => void;
  setTorShieldLevel: (level: "Standard" | "Safer" | "Safest") => void;

  // Smart Intent Navigation
  handleSmartPrompt: (input: string) => { view: ViewMode; message: string };
  updateMetricsTick: () => void;
}

// Initial Real Parameters Detection
const getInitialCpuCores = () => (typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 8 : 8);
const getInitialResolution = () => (typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "1920x1080");
const getInitialDpi = () => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
const getInitialMemoryMb = () => {
  if (typeof performance !== "undefined" && (performance as any).memory) {
    return Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
  }
  return 84;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeView: "home",
  themeMode: (typeof window !== "undefined" && localStorage.getItem("xeno_theme") === "dark") ? "dark" : "light",
  selectedModel: "claude-3-7-sonnet",
  routingPolicy: "reasoning",
  isAirGapped: false,
  isSidebarOpen: true,
  isShortcutsOpen: false,
  isExportOpen: false,
  soundEnabled: true,

  systemMetrics: {
    cpuCores: getInitialCpuCores(),
    ramHeapMb: getInitialMemoryMb(),
    screenResolution: getInitialResolution(),
    devicePixelRatio: getInitialDpi(),
    activeSessionUptimeSecs: 1420,
    liveTokenCount: 14820,
    liveTokPerSec: 84.6,
    costUsd: 0.0412,
    ttftMs: 142,
    gpuLoadPct: 78.4,
    vramUsedGb: 14.8,
    vramTotalGb: 24.0,
  },

  canvasNodes: [
    {
      id: "node-prompt",
      type: "prompt",
      x: 80,
      y: 120,
      data: {
        title: "User Directive",
        instruction: "Build AST validator in Rust with character-exact diff replacements",
        status: "completed",
        tokens: 340,
      },
    },
    {
      id: "node-coder",
      type: "subagent",
      x: 520,
      y: 100,
      data: {
        role: "Coder Agent",
        model: "Claude 3.7 Sonnet (Thinking)",
        task: "Synthesizing AST validation engine in xeno-tools",
        status: "running",
        progress: 82,
        tokensGenerated: 1420,
      },
    },
    {
      id: "node-code-block",
      type: "code",
      x: 980,
      y: 60,
      data: {
        fileName: "ast_validator.rs",
        language: "rust",
        code: `pub fn validate_syntax(path: &Path, code: &str) -> Result<(), ToolError> {\n    match path.extension().and_then(|s| s.to_str()) {\n        Some("rs") => syn::parse_file(code).map(|_| ()).map_err(|e| ToolError::AstParseError(e.to_string())),\n        Some("json") => serde_json::from_str::<serde_json::Value>(code).map(|_| ()).map_err(|e| ToolError::AstParseError(e.to_string())),\n        _ => Ok(()),\n    }\n}`,
      },
    },
    {
      id: "node-diff",
      type: "diff",
      x: 980,
      y: 380,
      data: {
        filePath: "crates/xeno-tools/src/ast_validator.rs",
        diff: `@@ -1,4 +1,8 @@\n-pub fn validate() {\n-    // stub\n-}\n+pub fn validate_syntax(&self, path: &Path, code: &str) -> Result<(), ToolError> {\n+    syn::parse_file(code).map(|_| ()).map_err(|e| ToolError::AstParseError(e.to_string()))\n+}`,
      },
    },
  ],
  selectedNodeId: "node-coder",
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
      latencyMs: 310,
      stdout: "[Commander] Decomposed objective into 3 subtasks: AST schema design, tool implementation, and verification test.",
    },
    {
      id: "dag-2",
      label: "Architect: AST Validation Design",
      role: "architect",
      status: "completed",
      model: "DeepSeek R1",
      dependencies: ["dag-1"],
      latencyMs: 620,
      stdout: "[Architect] Syn parse_file contract confirmed with 0 new dependencies.",
    },
    {
      id: "dag-3",
      label: "Coder: Implement syn Parser",
      role: "coder",
      status: "running",
      model: "Claude 3.7 Sonnet",
      dependencies: ["dag-2"],
      latencyMs: 1420,
      stdout: "[Coder] Generated crates/xeno-tools/src/ast_validator.rs with full test coverage.",
    },
    {
      id: "dag-4",
      label: "QA Tester: Unit & Boundary Tests",
      role: "qa",
      status: "pending",
      model: "Qwen 2.5 72B Local",
      dependencies: ["dag-3"],
      latencyMs: 0,
      stdout: "",
    },
    {
      id: "dag-5",
      label: "Red-Team: Air-Gap & Fuzzing Audit",
      role: "red_team",
      status: "pending",
      model: "DeepSeek R1",
      dependencies: ["dag-3"],
      latencyMs: 0,
      stdout: "",
    },
  ],
  selectedDagNodeId: "dag-3",

  timelineSteps: [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Goal Ingestion & Constraint Decomposition",
      phase: "Goal Decomposition",
      latencyMs: 180,
      tokens: 420,
      speed: 92.4,
      status: "verified",
      details: [
        "Ingested user goal: refine white aesthetic styling and add Tor sandboxed browser",
        "Pinned constraints: Romanian serif typography, dark mode toggle, dynamic telemetry parameters",
        "Formulated multi-view architectural plan across ui-canvas and backend",
      ],
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "AST Character Replacement & Multi-Replace Engine",
      phase: "AST Navigation",
      latencyMs: 460,
      tokens: 1120,
      speed: 88.2,
      status: "verified",
      details: [
        "Scanned crates/xeno-tools/src/file_engine.rs for character replacement boundaries",
        "Verified line-bounded substring replacement with rollback stack capability",
        "Confirmed Syn AST validation prevents corrupt files from writing to disk",
      ],
    },
    {
      id: "step-3",
      stepNumber: 3,
      title: "PAORV State Loop & Subagent Dispatch",
      phase: "Tool Invocation",
      latencyMs: 780,
      tokens: 1840,
      speed: 84.6,
      status: "executing",
      details: [
        "Invoked multi_replace_file_content with character exact match",
        "Subscribed to Token Bus streaming chunks at 84.6 tok/s",
        "Streaming live diff projection directly to Spatial Canvas",
      ],
    },
  ],

  speculativeBranches: [
    {
      id: "branch-a",
      name: "Branch A: Pure Syn Parser AST validation",
      score: 96,
      status: "selected",
      rationale: "Eliminates syntax errors before file writes; zero external binary runtime dependencies.",
      latencyEstimateMs: 140,
    },
    {
      id: "branch-b",
      name: "Branch B: Regex Heuristic Pre-validation",
      score: 64,
      status: "pruned",
      rationale: "Pruned: Vulnerable to false positives on multi-line macros and raw string literals.",
      latencyEstimateMs: 45,
    },
  ],

  terminalLogs: [
    {
      id: "tlog-1",
      timestamp: "18:42:01",
      type: "system",
      content: "[SYSTEM] XENO Virtual PTY initialized (Windows ConPTY + Job Object Isolation).",
    },
    {
      id: "tlog-2",
      timestamp: "18:42:05",
      type: "command",
      content: "$ cargo test --workspace",
    },
    {
      id: "tlog-3",
      timestamp: "18:42:12",
      type: "stdout",
      content: "test result: ok. 120 passed; 0 failed; 0 ignored; finished in 1.42s",
    },
    {
      id: "tlog-4",
      timestamp: "18:42:15",
      type: "intervention",
      content: "[SAFETY GUARDIAN] Tier 2 Guarded Action Auto-Approved (Diff snapshot cached with instant rollback).",
    },
  ],
  currentCommand: "",
  securityTier: "Tier 1: Safe Read-Only",

  swarmAgents: [
    {
      role: "commander",
      title: "Council Commander",
      model: "Claude 3.7 Sonnet",
      status: "planning",
      currentTask: "Orchestrating sub-agent execution order in DAG",
      tokensGenerated: 2140,
      voteScore: 98,
    },
    {
      role: "architect",
      title: "System Architect",
      model: "DeepSeek R1",
      status: "planning",
      currentTask: "Verifying cross-crate dependency graphs and schemas",
      tokensGenerated: 1890,
      voteScore: 95,
    },
    {
      role: "coder",
      title: "Lead Coder",
      model: "Claude 3.7 Sonnet",
      status: "coding",
      currentTask: "Synthesizing character-exact AST diffs in xeno-tools",
      tokensGenerated: 4320,
      voteScore: 100,
    },
    {
      role: "qa",
      title: "QA Tester",
      model: "Qwen 2.5 72B Local",
      status: "testing",
      currentTask: "Running 120+ cargo tests and boundary condition sweeps",
      tokensGenerated: 1420,
      voteScore: 100,
    },
    {
      role: "red_team",
      title: "Red-Team Auditor",
      model: "DeepSeek R1",
      status: "auditing",
      currentTask: "Fuzzing socket air-gap & scanning for PII / secret leakages",
      tokensGenerated: 1650,
      voteScore: 100,
    },
  ],
  consensusRate: 98.8,

  diffFiles: [
    {
      id: "diff-1",
      filePath: "crates/xeno-tools/src/ast_validator.rs",
      originalCode: `pub fn validate() {\n    // stub\n}`,
      modifiedCode: `pub fn validate_syntax(&self, path: &Path, code: &str) -> Result<(), ToolError> {\n    match path.extension().and_then(|s| s.to_str()) {\n        Some("rs") => syn::parse_file(code).map(|_| ()).map_err(|e| ToolError::AstParseError(e.to_string())),\n        Some("json") => serde_json::from_str::<serde_json::Value>(code).map(|_| ()).map_err(|e| ToolError::AstParseError(e.to_string())),\n        _ => Ok(()),\n    }\n}`,
      staged: true,
      astValid: true,
    },
    {
      id: "diff-2",
      filePath: "crates/xeno-router/src/privacy.rs",
      originalCode: `pub fn scrub_pii(text: &str) -> String {\n    text.to_string()\n}`,
      modifiedCode: `pub fn scrub_pii_with_entropy(text: &str, threshold: f64) -> SanitizedResult {\n    let patterns = get_secret_patterns();\n    let mut sanitized = text.to_string();\n    for p in patterns {\n        sanitized = p.replace_all(&sanitized, "[REDACTED_SECRET]").to_string();\n    }\n    SanitizedResult { content: sanitized, redaction_count: 1 }\n}`,
      staged: false,
      astValid: true,
    },
  ],

  // Tor Browser State
  torUrl: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion",
  torCircuit: [
    { name: "Guard-Frankfurt-01", country: "DE", ip: "185.220.101.42", latencyMs: 28, type: "guard" },
    { name: "Relay-Amsterdam-04", country: "NL", ip: "194.26.29.112", latencyMs: 34, type: "relay" },
    { name: "Exit-Zurich-09", country: "CH", ip: "178.17.170.89", latencyMs: 41, type: "exit" },
  ],
  torShieldLevel: "Safer",
  isTorConnected: true,
  torHistory: [
    "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion",
    "http://2gzyxa5ihm7nsggfxnu52r2gz264257lqqqqh53m5qsmxamznx524fid.onion",
    "https://doc.rust-lang.org/std/",
  ],

  // Chat Studio & Arsenal State
  chatMessages: [
    {
      id: "msg-init-1",
      role: "user",
      content: "Audit our AST validator rules, check air-gap socket security, and summarize the cognitive plan.",
      timestamp: "17:10",
      attachedFiles: ["crates/xeno-tools/src/ast_validator.rs", "crates/xeno-router/src/privacy.rs"],
    },
    {
      id: "msg-init-2",
      role: "assistant",
      model: "Claude 3.7 Sonnet (Thinking)",
      content: "I have audited the character-exact AST replacement engine in `xeno-tools` and verified the air-gap socket scrubber against cloud egress leaks.\n\n### Architectural Validation Summary:\n1. **Syn AST Grammar Verification**: Validated Rust syntax with zero unwrap hazards. Invalid AST tokens are rejected before any disk write.\n2. **Air-Gap Privacy Guard**: Tested against cloud hostnames (`api.openai.com`, `anthropic.com`) and Unicode zero-width evasion attacks.\n3. **Cognitive Trace**: Decomposed into 4 sequential verification steps with 100% test pass rate across 120+ unit tests.",
      timestamp: "17:11",
      thinking: {
        durationSecs: 3.8,
        tokens: 1240,
        summary: "Analyzed syn AST parsing rules, evaluated regex secret redaction against zero-width character evasion, and verified 120+ unit tests across all 8 crates.",
        steps: [
          "Step 1: Ingesting workspace crates `xeno-tools` and `xeno-router` symbol definitions.",
          "Step 2: Checking AST parsing boundaries for character-exact replacement and rollbacks.",
          "Step 3: Simulating cloud hostname spoofing and verifying air-gap enforcement blocks egress.",
          "Step 4: Compiling full test suite and generating execution proof with zero warnings."
        ],
        expanded: false
      },
      toolCalls: [
        {
          name: "xeno_tools.ast_validator",
          icon: "FileCode",
          input: "crates/xeno-tools/src/ast_validator.rs",
          output: "Valid Rust AST syntax (syn::parse_file OK)",
          latencyMs: 14,
          status: "success"
        },
        {
          name: "xeno_router.air_gap_enforcer",
          icon: "ShieldCheck",
          input: "socket_check: 127.0.0.1:9050 (Tor SOCKS5)",
          output: "Air-gap verified: outbound cloud egress strictly blocked",
          latencyMs: 8,
          status: "success"
        }
      ],
      metrics: {
        tokPerSec: 142.6,
        totalTokens: 1240,
        latencyMs: 3800
      }
    }
  ],
  isGenerating: false,
  isThinkingEnabled: true,
  thinkingBudget: "deep",
  isWebSearchEnabled: false,
  webSearchMode: "onion",
  isImageGenMode: false,
  isCodeExecMode: false,
  isMcpModalOpen: false,
  mcpServers: [
    {
      id: "blender",
      name: "Blender 3D MCP",
      status: "connected",
      pingMs: 12,
      tools: [
        { name: "get_scene_info", description: "Inspect active Blender 3D scene and camera", enabled: true, category: "3D Graphics" },
        { name: "execute_blender_code", description: "Execute Python script in Blender context", enabled: true, category: "Automation" },
        { name: "search_sketchfab_models", description: "Search Polyhaven and Sketchfab 3D assets", enabled: true, category: "Assets" },
        { name: "generate_hyper3d_model_via_text", description: "Generate 3D mesh from text prompt", enabled: false, category: "Generation" }
      ]
    },
    {
      id: "xeno_tools",
      name: "Xeno Tools Engine",
      status: "connected",
      pingMs: 4,
      tools: [
        { name: "ast_validator", description: "Rust syn & JSON AST syntax verifier", enabled: true, category: "Code Analysis" },
        { name: "file_engine", description: "Character-exact multi-replace with line validation", enabled: true, category: "File Ops" },
        { name: "search_ripgrep", description: "Ripgrep-accelerated regex and fuzzy glob engine", enabled: true, category: "Search" },
        { name: "pty_sandbox", description: "Windows ConPTY Job Object restricted terminal", enabled: true, category: "Execution" }
      ]
    },
    {
      id: "tor_proxy",
      name: "Tor SOCKS5 Router",
      status: "connected",
      pingMs: 28,
      tools: [
        { name: "onion_resolve", description: "Resolve .onion v3 endpoints via SOCKS5 9050", enabled: true, category: "Network" },
        { name: "signal_newnym", description: "Rotate 3-hop circuit identity", enabled: true, category: "Security" }
      ]
    }
  ],
  attachedFiles: [],
  activeInspectGraphMessageId: null,

  // Actions
  setActiveView: (view) => set({ activeView: view }),
  
  toggleTheme: () => {
    const current = get().themeMode;
    const next = current === "light" ? "dark" : "light";
    if (typeof document !== "undefined") {
      if (next === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.body.classList.add("dark");
        document.body.classList.remove("light");
        localStorage.setItem("xeno_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        document.body.classList.remove("dark");
        document.body.classList.add("light");
        localStorage.setItem("xeno_theme", "light");
      }
    }
    set({ themeMode: next });
  },

  setSelectedModel: (model) => set({ selectedModel: model }),
  setRoutingPolicy: (policy) => set({ routingPolicy: policy }),
  toggleAirGap: () => set((s) => ({ isAirGapped: !s.isAirGapped })),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleShortcuts: () => set((s) => ({ isShortcutsOpen: !s.isShortcutsOpen })),
  toggleExport: () => set((s) => ({ isExportOpen: !s.isExportOpen })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedDagNodeId: (id) => set({ selectedDagNodeId: id }),
  setCanvasScale: (scale) => set({ canvasScale: scale }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  
  updateCanvasNodePosition: (id, x, y) => {
    set((state) => ({
      canvasNodes: state.canvasNodes.map((n) =>
        n.id === id ? { ...n, x, y } : n
      ),
    }));
  },

  addCanvasNode: (type) => {
    const id = `node-${type}-${Date.now()}`;
    let data: Record<string, any> = {};
    const pan = get().canvasPan;
    const scale = get().canvasScale;
    const x = (-pan.x + 300) / scale;
    const y = (-pan.y + 200) / scale;

    if (type === "prompt") {
      data = {
        title: "New Instruction",
        instruction: "Enter directive here...",
        status: "pending",
        tokens: 0,
      };
    } else if (type === "subagent") {
      data = {
        role: "Specialist Subagent",
        model: "Claude 3.7 Sonnet",
        task: "Autonomous task execution",
        status: "planning",
        progress: 0,
        tokensGenerated: 0,
      };
    } else if (type === "code") {
      data = {
        fileName: "new_file.rs",
        language: "rust",
        code: "// Write code here...\npub fn solve() {\n}\n",
      };
    } else if (type === "diff") {
      data = {
        filePath: "src/modified.rs",
        diff: "@@ -1,1 +1,2 @@\n-old code\n+new code",
      };
    }

    set((state) => ({
      canvasNodes: [
        ...state.canvasNodes,
        { id, type, x, y, data },
      ],
      selectedNodeId: id,
    }));
  },

  removeCanvasNode: (id) => {
    set((state) => ({
      canvasNodes: state.canvasNodes.filter((n) => n.id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  executeCommand: (cmd) => {
    if (!cmd.trim()) return;
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "command",
      content: `$ ${cmd}`,
    };
    set((state) => ({
      terminalLogs: [...state.terminalLogs, newLog],
      currentCommand: "",
    }));

    setTimeout(() => {
      const responseLog: TerminalLog = {
        id: `log-res-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: cmd.includes("fail") ? "stderr" : "stdout",
        content: cmd.includes("swarm")
          ? "[SWARM] Spawning 5 autonomous agents (Commander, Architect, Coder, QA, Red-Team)... Task scheduled in DAG."
          : `[EXEC] Command '${cmd}' executed in sandboxed virtual ConPTY (exit code: 0).`,
      };
      set((state) => ({
        terminalLogs: [...state.terminalLogs, responseLog],
      }));
    }, 400);
  },

  dispatchSwarmTask: (task) => {
    set((state) => ({
      activeView: "swarm",
      canvasNodes: [
        ...state.canvasNodes,
        {
          id: `node-${Date.now()}`,
          type: "prompt",
          x: 100,
          y: 400,
          data: {
            title: "Swarm Goal",
            instruction: task,
            status: "running",
            tokens: 120,
          },
        },
      ],
    }));
  },

  toggleStageDiff: (id) => {
    set((state) => ({
      diffFiles: state.diffFiles.map((d) =>
        d.id === id ? { ...d, staged: !d.staged } : d
      ),
    }));
  },

  exportSessionJson: () => {
    const s = get();
    const snapshot = {
      timestamp: new Date().toISOString(),
      activeView: s.activeView,
      themeMode: s.themeMode,
      selectedModel: s.selectedModel,
      routingPolicy: s.routingPolicy,
      isAirGapped: s.isAirGapped,
      systemMetrics: s.systemMetrics,
      canvasNodes: s.canvasNodes,
      dagNodes: s.dagNodes,
      timelineSteps: s.timelineSteps,
      speculativeBranches: s.speculativeBranches,
      swarmAgents: s.swarmAgents,
      diffFiles: s.diffFiles,
      torUrl: s.torUrl,
    };
    return JSON.stringify(snapshot, null, 2);
  },

  importSessionJson: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.canvasNodes && parsed.dagNodes) {
        set({
          canvasNodes: parsed.canvasNodes || [],
          dagNodes: parsed.dagNodes || [],
          timelineSteps: parsed.timelineSteps || [],
          speculativeBranches: parsed.speculativeBranches || [],
          swarmAgents: parsed.swarmAgents || [],
          diffFiles: parsed.diffFiles || [],
          selectedModel: parsed.selectedModel || "claude-3-7-sonnet",
          activeView: parsed.activeView || "home",
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Tor Actions
  navigateTorBrowser: (url) => {
    let target = url.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.includes(".onion")) {
        target = `http://${target}`;
      } else if (target.includes(".") && !target.includes(" ")) {
        target = `https://${target}`;
      } else {
        target = `https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=${encodeURIComponent(target)}`;
      }
    }
    set((state) => ({
      torUrl: target,
      torHistory: [target, ...state.torHistory.slice(0, 15)],
    }));
  },

  requestNewTorIdentity: () => {
    const randomGuards = [
      { name: "Guard-Frankfurt-02", country: "DE", ip: "185.220.101.55", latencyMs: 25, type: "guard" as const },
      { name: "Guard-Stockholm-01", country: "SE", ip: "193.187.91.12", latencyMs: 31, type: "guard" as const },
      { name: "Guard-Reykjavik-03", country: "IS", ip: "185.165.169.8", latencyMs: 44, type: "guard" as const },
    ];
    const randomRelays = [
      { name: "Relay-Oslo-02", country: "NO", ip: "185.220.102.18", latencyMs: 36, type: "relay" as const },
      { name: "Relay-Paris-05", country: "FR", ip: "51.15.82.91", latencyMs: 29, type: "relay" as const },
      { name: "Relay-Vienna-01", country: "AT", ip: "194.36.191.4", latencyMs: 33, type: "relay" as const },
    ];
    const randomExits = [
      { name: "Exit-Geneva-03", country: "CH", ip: "185.220.100.240", latencyMs: 38, type: "exit" as const },
      { name: "Exit-Helsinki-07", country: "FI", ip: "95.216.142.11", latencyMs: 42, type: "exit" as const },
      { name: "Exit-Reykjavik-02", country: "IS", ip: "185.165.170.19", latencyMs: 49, type: "exit" as const },
    ];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    set({
      torCircuit: [pick(randomGuards), pick(randomRelays), pick(randomExits)],
    });
  },

  setTorShieldLevel: (level) => set({ torShieldLevel: level }),

  // Chat & Arsenal Actions
  sendChatMessage: async (content: string) => {
    const text = content.trim();
    if (!text) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const assistantMsgId = `msg-asst-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const attached = [...get().attachedFiles];
    const isThinking = get().isThinkingEnabled;
    const thinkingBudget = get().thinkingBudget;
    const isSearch = get().isWebSearchEnabled;
    const searchMode = get().webSearchMode;
    const isCode = get().isCodeExecMode;
    const isImg = get().isImageGenMode;
    const currentModel = get().selectedModel;

    // 1. Append User Message
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp,
      attachedFiles: attached.length > 0 ? attached : undefined,
    };

    set((s) => ({
      chatMessages: [...s.chatMessages, userMessage],
      attachedFiles: [],
      isGenerating: true,
    }));

    // 2. Simulate AI Processing & Tool Invocations
    await new Promise((resolve) => setTimeout(resolve, 600));

    const toolCalls: ChatToolCall[] = [];
    if (isSearch) {
      toolCalls.push({
        name: searchMode === "onion" ? "tor.onion_search" : "clearnet.web_search",
        icon: "Globe",
        input: text,
        output: searchMode === "onion" 
          ? "Found 4 verified .onion hidden technical resources" 
          : "Retrieved 6 relevant documentation entries",
        latencyMs: 165,
        status: "success"
      });
    }

    if (isCode) {
      toolCalls.push({
        name: "virtual_conpty.exec",
        icon: "Terminal",
        input: text.slice(0, 50),
        output: "Process exited with code 0 (all invariants preserved)",
        latencyMs: 82,
        status: "success"
      });
    }

    let responseText = "";
    if (text.toLowerCase().includes("diff") || text.toLowerCase().includes("ast")) {
      responseText = `I have inspected the AST representation for your request.\n\n\`\`\`rust\n// Character-exact syn validation\npub fn validate_ast(tokens: &TokenStream) -> Result<(), SynError> {\n    syn::parse2::<File>(tokens.clone()).map(|_| ()).map_err(Into::into)\n}\n\`\`\`\n\nAll AST invariants were verified with **0 compiler hazards**.`;
    } else if (text.toLowerCase().includes("tor") || text.toLowerCase().includes("onion")) {
      responseText = `Routed securely through the Tor SOCKS5 circuit at \`127.0.0.1:9050\`.\n\n3-hop circuit verified:\n- **Guard**: Frankfurt (25ms)\n- **Relay**: Amsterdam (31ms)\n- **Exit**: Zurich (42ms)\n\nZero outbound clearnet leaks detected.`;
    } else if (text.toLowerCase().includes("image") || isImg) {
      responseText = `Generated conceptual design architecture and schematic layout for your query.\n\n- **Type**: Vector SVG High-DPI Spatial Diagram\n- **Aesthetic**: Warm Alabaster Roman Editorial\n- **Target**: Sovereign Autonomous Workstation`;
    } else {
      responseText = `Analyzed your objective: "${text}".\n\n### Execution Breakdown:\n1. **Context Resolution**: Ingested active workspace dependencies.\n2. **Security & Air-Gap**: Verified zero network data leakage.\n3. **Synthesis**: Formulated optimized solution with recursive proof.`;
    }

    const tokenMultiplier = thinkingBudget === "max" ? 3200 : thinkingBudget === "deep" ? 1400 : 600;

    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      model: currentModel === "deepseek-r1" ? "DeepSeek R1 (Inline CoT)" : currentModel === "claude-3-7-sonnet" ? "Claude 3.7 Sonnet (Thinking)" : currentModel,
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      thinking: isThinking ? {
        durationSecs: +(1.8 + Math.random() * 2.5).toFixed(1),
        tokens: tokenMultiplier + Math.floor(Math.random() * 200),
        summary: `Decomposed goal into sub-steps, validated parameters, and evaluated air-gap isolation rules.`,
        steps: [
          `Phase 1: Parsed goal "${text.slice(0, 45)}..."`,
          `Phase 2: Verified symbol dependencies and security constraints.`,
          `Phase 3: Synthesized structured output with cognitive graph validation.`
        ],
        expanded: false
      } : undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      metrics: {
        tokPerSec: +(130 + Math.random() * 35).toFixed(1),
        totalTokens: tokenMultiplier + 250,
        latencyMs: 2200
      }
    };

    set((s) => ({
      chatMessages: [...s.chatMessages, assistantMessage],
      isGenerating: false,
    }));
  },

  toggleThinking: () => set((s) => ({ isThinkingEnabled: !s.isThinkingEnabled })),
  setThinkingBudget: (b) => set({ thinkingBudget: b }),
  toggleWebSearch: () => set((s) => ({ isWebSearchEnabled: !s.isWebSearchEnabled })),
  setWebSearchMode: (m) => set({ webSearchMode: m }),
  toggleImageGenMode: () => set((s) => ({ isImageGenMode: !s.isImageGenMode })),
  toggleCodeExecMode: () => set((s) => ({ isCodeExecMode: !s.isCodeExecMode })),
  toggleMcpModal: () => set((s) => ({ isMcpModalOpen: !s.isMcpModalOpen })),
  
  toggleMcpTool: (serverId, toolName) => {
    set((s) => ({
      mcpServers: s.mcpServers.map((srv) =>
        srv.id === serverId
          ? {
              ...srv,
              tools: srv.tools.map((t) => t.name === toolName ? { ...t, enabled: !t.enabled } : t)
            }
          : srv
      )
    }));
  },

  toggleMcpServer: (serverId) => {
    set((s) => ({
      mcpServers: s.mcpServers.map((srv) =>
        srv.id === serverId
          ? { ...srv, status: srv.status === "connected" ? "disabled" : "connected" }
          : srv
      )
    }));
  },

  attachFile: (filePath) => {
    set((s) => ({
      attachedFiles: s.attachedFiles.includes(filePath) ? s.attachedFiles : [...s.attachedFiles, filePath]
    }));
  },

  removeAttachedFile: (filePath) => {
    set((s) => ({
      attachedFiles: s.attachedFiles.filter((f) => f !== filePath)
    }));
  },

  clearChat: () => set({ chatMessages: [] }),

  forkThoughtToCanvas: (messageId) => {
    const msg = get().chatMessages.find((m) => m.id === messageId);
    if (msg) {
      get().addCanvasNode("prompt");
      set({ activeView: "canvas" });
    }
  },

  setActiveInspectGraphMessageId: (id) => set({ activeInspectGraphMessageId: id }),

  // Smart Intent Router
  handleSmartPrompt: (input) => {
    const text = input.toLowerCase().trim();
    if (!text) return { view: "home", message: "Empty prompt" };

    // AST Diff / Git Review
    if (text.includes("diff") || text.includes("patch") || text.includes("stage") || text.includes("rollback") || text.includes("git") || text.includes("review")) {
      set({ activeView: "diff" });
      return { view: "diff", message: "Opening AST Diff Studio..." };
    }

    // Terminal / Shell / Build
    if (text.includes("terminal") || text.includes("pty") || text.includes("cargo") || text.includes("bash") || text.includes("powershell") || text.includes("run command") || text.includes("npm")) {
      get().executeCommand(input.replace(/^(run|exec|execute)\s+/i, ""));
      set({ activeView: "terminal" });
      return { view: "terminal", message: "Executing in Sandboxed Virtual ConPTY..." };
    }

    // Swarm Multi-Agent
    if (text.includes("swarm") || text.includes("council") || text.includes("multi agent") || text.includes("consensus") || text.includes("red team") || text.includes("architect")) {
      get().dispatchSwarmTask(input);
      set({ activeView: "swarm" });
      return { view: "swarm", message: "Deploying 5-Role Swarm Council..." };
    }

    // Tor / Web browsing (exact word matching to avoid 'validator' matching 'tor')
    if (/\b(tor|onion|browse|search|web|http|https)\b/.test(text) || text.includes(".onion")) {
      get().navigateTorBrowser(input.replace(/^(browse|search for|open|go to)\s+/i, ""));
      set({ activeView: "browser" });
      return { view: "browser", message: "Opening Tor Sandboxed Browser..." };
    }

    // DAG / Dependency Graph
    if (text.includes("dag") || text.includes("graph") || text.includes("petgraph") || text.includes("dependencies") || text.includes("order")) {
      set({ activeView: "dag" });
      return { view: "dag", message: "Opening Real-Time Execution DAG..." };
    }

    // Timeline / Deep Thinking
    if (text.includes("think") || text.includes("timeline") || text.includes("reason") || text.includes("branch") || text.includes("speculative") || text.includes("paorv")) {
      set({ activeView: "timeline" });
      return { view: "timeline", message: "Opening Deep Thinking Reasoning Timeline..." };
    }

    // Default to Spatial Canvas with a new prompt node
    get().addCanvasNode("prompt");
    set({ activeView: "canvas" });
    return { view: "canvas", message: "Synthesizing spatial canvas execution block..." };
  },

  updateMetricsTick: () => {
    set((state) => {
      const memory = typeof performance !== "undefined" && (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : state.systemMetrics.ramHeapMb + (Math.random() > 0.5 ? 1 : -1);
      
      const newTokens = state.systemMetrics.liveTokenCount + Math.floor(Math.random() * 8);
      const newCost = +(state.systemMetrics.costUsd + 0.000012).toFixed(5);

      return {
        systemMetrics: {
          ...state.systemMetrics,
          ramHeapMb: Math.max(memory, 40),
          activeSessionUptimeSecs: state.systemMetrics.activeSessionUptimeSecs + 1,
          liveTokenCount: newTokens,
          costUsd: newCost,
        },
      };
    });
  },
}));
