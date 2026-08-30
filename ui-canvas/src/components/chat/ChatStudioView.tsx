import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore, ProviderModel } from "../../stores/workspaceStore";
import { ThinkingGraphDrawer } from "./ThinkingGraphDrawer";
import { NodularConstellationCanvas } from "./NodularConstellationCanvas";
import { 
  Send, 
  BrainCircuit, 
  Globe, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Paperclip, 
  ChevronDown, 
  ChevronRight, 
  GitFork, 
  Layers, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Zap, 
  Search, 
  X, 
  ExternalLink,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Wrench,
  Server,
  Activity,
  AlertTriangle,
  Bot
} from "lucide-react";

export const ChatStudioView: React.FC = () => {
  const {
    chatMessages,
    isGenerating,
    isThinkingEnabled,
    thinkingBudget,
    isWebSearchEnabled,
    webSearchMode,
    isImageGenMode,
    isCodeExecMode,
    selectedModel,
    setSelectedModel,
    toggleThinking,
    setThinkingBudget,
    toggleWebSearch,
    setWebSearchMode,
    toggleImageGenMode,
    toggleCodeExecMode,
    toggleMcpModal,
    mcpServers,
    attachedFiles,
    attachFile,
    removeAttachedFile,
    sendChatMessage,
    clearChat,
    forkThoughtToCanvas,
    setActiveInspectGraphMessageId,
    setActiveView,
    systemMetrics,
    isAirGapped,
    isDaemonOnline,
  } = useWorkspaceStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({
    "msg-init-2": false,
  });

  // Designer Arsenal Popups State
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const arsenalRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isGenerating]);

  // Click outside listener for arsenal and model popups
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (arsenalRef.current && !arsenalRef.current.contains(e.target as Node)) {
        setIsArsenalOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!inputPrompt.trim() || isGenerating) return;
    const prompt = inputPrompt;
    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendChatMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThinkingAccordion = (msgId: string) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Active tools count for the badge
  const activeToolsCount = 
    (isThinkingEnabled ? 1 : 0) + 
    (isWebSearchEnabled ? 1 : 0) + 
    (isCodeExecMode ? 1 : 0) + 
    (isImageGenMode ? 1 : 0) + 
    attachedFiles.length;

  const availableFiles = [
    "crates/xeno-tools/src/ast_validator.rs",
    "crates/xeno-tools/src/file_engine.rs",
    "crates/xeno-router/src/privacy.rs",
    "crates/xeno-router/src/router.rs",
    "crates/xeno-tools/src/pty.rs",
    "crates/xeno-dag/src/dag.rs",
  ];

  // Authentic models supported natively by the backend provider engine
  interface ModelSpec {
    id: ProviderModel;
    name: string;
    provider: string;
    context: string;
    tag: string;
    icon: React.ReactNode;
    isAirGapReady: boolean;
  }

  const modelCatalog: ModelSpec[] = [
    {
      id: "local-gguf",
      name: "Local GGUF / Ollama",
      provider: "Localhost 11434",
      context: "128k",
      tag: "Air-Gapped",
      icon: <Server className="w-4 h-4 text-emerald-500" />,
      isAirGapReady: true,
    },
    {
      id: "claude-3-7-sonnet",
      name: "Claude 3.7 Sonnet",
      provider: "Anthropic",
      context: "200k",
      tag: "Hybrid Thinking",
      icon: <BrainCircuit className="w-4 h-4 text-amber-500" />,
      isAirGapReady: false,
    },
    {
      id: "deepseek-r1",
      name: "DeepSeek R1",
      provider: "DeepSeek API",
      context: "128k",
      tag: "Inline CoT",
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      isAirGapReady: false,
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      context: "128k",
      tag: "Multimodal",
      icon: <Bot className="w-4 h-4 text-emerald-600" />,
      isAirGapReady: false,
    },
    {
      id: "gemini-2-pro",
      name: "Gemini 2.0 Flash",
      provider: "Google Cloud",
      context: "1M",
      tag: "Deep Context",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      isAirGapReady: false,
    },
    {
      id: "groq-llama3",
      name: "Groq LLaMA 3.3 70B",
      provider: "Groq LPU",
      context: "128k",
      tag: "500+ tok/s",
      icon: <Activity className="w-4 h-4 text-orange-500" />,
      isAirGapReady: false,
    },
  ];

  const currentModelSpec = modelCatalog.find((m) => m.id === selectedModel) || modelCatalog[1];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfaf7] dark:bg-[#0c0d11] relative overflow-hidden transition-colors duration-200">
      {/* Nodular Interconnected Constellation Canvas (Drifting auto-appearing dots with near connections) */}
      <NodularConstellationCanvas />

      {/* Slide-over Thinking Graph Drawer */}
      <ThinkingGraphDrawer />

      {/* Main Interactive Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Daemon Status Notice when offline (Zero fabrication) */}
          {!isDaemonOnline && (
            <div className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Host Daemon in Standby:</strong> Inference daemon not streaming on <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-[11px]">127.0.0.1:8080</code>. Host tools, AST validator, and Tor circuit remain operational.
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 shrink-0">
                Non-Fabricated
              </span>
            </div>
          )}

          {chatMessages.map((msg) => {
            const isUser = msg.role === "user";
            const isExpanded = expandedThinking[msg.id] ?? false;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in duration-200 relative z-10`}
              >
                {/* User Message Bubble */}
                {isUser ? (
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                    {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end mb-1">
                        {msg.attachedFiles.map((file) => (
                          <span
                            key={file}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1 shadow-2xs"
                          >
                            <FileCode className="w-2.5 h-2.5 text-blue-500" />
                            {file.split("/").pop()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="p-4 rounded-2xl rounded-tr-xs bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-md text-sm leading-relaxed font-sans">
                      {msg.content}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400 text-right pr-1">
                      {msg.timestamp}
                    </div>
                  </div>
                ) : (
                  /* Assistant Message Bubble */
                  <div className="max-w-full sm:max-w-[90%] w-full space-y-3">
                    {/* Model Info Header */}
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono text-xs">
                          {msg.model || "Local Model"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.metrics && msg.metrics.tokPerSec > 0 && (
                        <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-400">
                          <span className="flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-amber-500" /> {msg.metrics.tokPerSec} tok/s
                          </span>
                          <span>•</span>
                          <span>{msg.metrics.totalTokens} tokens</span>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Model Thinking Process Accordion */}
                    {msg.thinking && (
                      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden transition-all duration-200 shadow-2xs backdrop-blur-xs">
                        <div 
                          onClick={() => toggleThinkingAccordion(msg.id)}
                          className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors"
                        >
                          <div className="flex items-center space-x-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            <span>
                              Reasoning Trace ({msg.thinking.durationSecs}s · {msg.thinking.tokens} tokens)
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveInspectGraphMessageId(msg.id);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Inspect Cognitive DAG Graph"
                            >
                              <GitFork className="w-2.5 h-2.5 text-blue-500" />
                              View Thinking Graph
                            </button>

                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-3.5 pt-1 space-y-2.5 border-t border-amber-200/50 dark:border-amber-900/40 text-xs font-sans text-stone-700 dark:text-stone-300">
                            <p className="text-stone-600 dark:text-stone-400 font-editorial italic text-xs">
                              {msg.thinking.summary}
                            </p>
                            <div className="space-y-1.5 font-mono text-[11px]">
                              {msg.thinking.steps.map((step, idx) => (
                                <div key={idx} className="flex items-start space-x-2 text-stone-600 dark:text-stone-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tool Calls Visualizer */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="space-y-1.5">
                        {msg.toolCalls.map((tool, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs flex items-center justify-between text-xs font-mono shadow-2xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="p-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                <Wrench className="w-3 h-3 text-amber-500" />
                              </div>
                              <span className="font-semibold text-stone-800 dark:text-stone-200">
                                {tool.name}
                              </span>
                              <span className="text-[11px] text-stone-400 truncate max-w-xs">
                                ({tool.input})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-stone-400">
                                {tool.latencyMs}ms
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                {tool.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Main Assistant Text & Code Area */}
                    <div className="p-5 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 shadow-xs text-sm leading-relaxed space-y-3 font-sans">
                      <div className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Action Bar inside Message Bubble */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                          </button>

                          <button
                            onClick={() => forkThoughtToCanvas(msg.id)}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Spawn Node on Spatial Canvas"
                          >
                            <Layers className="w-3 h-3 text-emerald-500" />
                            <span>Canvas</span>
                          </button>

                          <button
                            onClick={() => setActiveView("dag")}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Inspect in Live Execution DAG"
                          >
                            <GitFork className="w-3 h-3 text-blue-500" />
                            <span>Execution DAG</span>
                          </button>
                        </div>

                        <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Host Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Generating Animation Shimmer */}
          {isGenerating && (
            <div className="flex items-center space-x-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md max-w-md animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <div className="text-xs font-mono text-stone-600 dark:text-stone-300">
                {isThinkingEnabled ? "Decomposing goal & inspecting host endpoints..." : "Querying provider daemon..."}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Modern AI Composer & Round Corner Arsenal Popover Area */}
      <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl z-30 relative shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attached Files Tray */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono uppercase text-stone-400">Context:</span>
              {attachedFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-700 dark:text-stone-300"
                >
                  <FileCode className="w-3 h-3 text-blue-500" />
                  <span>{file.split("/").pop()}</span>
                  <button
                    onClick={() => removeAttachedFile(file)}
                    className="hover:text-red-500 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Input Composer Box */}
          <div className="relative rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl focus-within:border-amber-500 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            {/* Round Corner Tools Arsenal Popup Box */}
            {isArsenalOpen && (
              <div 
                ref={arsenalRef}
                className="absolute bottom-full mb-3 left-2 z-50 w-84 sm:w-96 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl shadow-2xl p-4.5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs select-none"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                      Arsenal & Execution Tools
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsArsenalOpen(false)}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Deep Thinking Engine */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        Reasoning Engine
                      </span>
                    </div>
                    <button
                      onClick={toggleThinking}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        isThinkingEnabled 
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" 
                          : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                      }`}
                    >
                      {isThinkingEnabled ? "ENABLED" : "OFF"}
                    </button>
                  </div>

                  {isThinkingEnabled && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {(["fast", "deep", "max"] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setThinkingBudget(b)}
                          className={`py-1 rounded-lg font-mono text-[10px] border transition-all cursor-pointer ${
                            thinkingBudget === b
                              ? "bg-amber-50 dark:bg-amber-950/80 border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-semibold"
                              : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-500"
                          }`}
                        >
                          {b === "fast" ? "Fast (1k)" : b === "deep" ? "Deep (8k)" : "Max (32k)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Web & Tor Onion Search */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        Web & Tor Search
                      </span>
                    </div>
                    <button
                      onClick={toggleWebSearch}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        isWebSearchEnabled 
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                          : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                      }`}
                    >
                      {isWebSearchEnabled ? "ENABLED" : "OFF"}
                    </button>
                  </div>

                  {isWebSearchEnabled && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => setWebSearchMode("onion")}
                        className={`py-1 px-2 rounded-lg font-mono text-[10px] border transition-all cursor-pointer text-center ${
                          webSearchMode === "onion"
                            ? "bg-blue-50 dark:bg-blue-950/80 border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-semibold"
                            : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-500"
                        }`}
                      >
                        Tor Onion (9050)
                      </button>
                      <button
                        onClick={() => setWebSearchMode("clearnet")}
                        className={`py-1 px-2 rounded-lg font-mono text-[10px] border transition-all cursor-pointer text-center ${
                          webSearchMode === "clearnet"
                            ? "bg-blue-50 dark:bg-blue-950/80 border-blue-400 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-semibold"
                            : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-500"
                        }`}
                      >
                        Clearnet Host
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Toggles: ConPTY & Media Mode */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div
                    onClick={toggleCodeExecMode}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCodeExecMode
                        ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                        : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[11px] font-medium">ConPTY Run</span>
                    </div>
                    {isCodeExecMode && <Check className="w-3 h-3 text-emerald-600" />}
                  </div>

                  <div
                    onClick={toggleImageGenMode}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isImageGenMode
                        ? "bg-purple-50/60 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200"
                        : "bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-[11px] font-medium">Media Gen</span>
                    </div>
                    {isImageGenMode && <Check className="w-3 h-3 text-purple-600" />}
                  </div>
                </div>

                {/* 4. MCP Tools Modal Trigger */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => {
                      setIsArsenalOpen(false);
                      toggleMcpModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[11px] font-medium">Open MCP Tools Arsenal</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">Configure</span>
                  </button>
                </div>

                {/* 5. Workspace Context File Picker */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">
                    Attach Workspace Context:
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {availableFiles.map((file) => (
                      <div
                        key={file}
                        onClick={() => attachFile(file)}
                        className="px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer font-mono text-[10px] truncate flex items-center gap-1.5 text-stone-600 dark:text-stone-400"
                      >
                        <FileCode className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, formulate goals, or prompt tools (/diff, /tor, /terminal, /swarm)..."
              rows={2}
              className="w-full px-4 pt-3.5 pb-2 text-sm bg-transparent resize-none outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400 font-sans rounded-t-2xl"
            />

            {/* Bottom Composer Toolbar */}
            <div className="px-3 pb-2.5 pt-1 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between gap-2">
              {/* Single Sleek Tools Arsenal Trigger Button */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsArsenalOpen(!isArsenalOpen)}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                    isArsenalOpen || activeToolsCount > 0
                      ? "bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400"
                  }`}
                  title="Open Tool Arsenal (Thinking, Search, Terminal, MCP, Context)"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>Arsenal</span>
                  {activeToolsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {activeToolsCount}
                    </span>
                  )}
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>

                {/* Quick Indicators for Active Arsenal Tools */}
                {isThinkingEnabled && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <BrainCircuit className="w-2.5 h-2.5" />
                    {thinkingBudget.toUpperCase()}
                  </span>
                )}
                {isWebSearchEnabled && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Globe className="w-2.5 h-2.5" />
                    {webSearchMode.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Designer Model Selection Dropdown & Send Action */}
              <div className="flex items-center space-x-2">
                {/* Designer Model Selector */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-mono border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2 hover:border-stone-400 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="shrink-0">{currentModelSpec.icon}</span>
                    <span className="truncate max-w-[130px] font-semibold">
                      {currentModelSpec.name}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {/* Designer Model Popover Box */}
                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full mb-3 right-0 w-72 sm:w-80 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 select-none">
                      <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[10px] font-mono uppercase text-stone-400 flex items-center justify-between">
                        <span>Select Real Provider Model</span>
                        <span>Direct Host IPC</span>
                      </div>

                      <div className="py-1 space-y-1">
                        {modelCatalog.map((m) => {
                          const isSelected = selectedModel === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setSelectedModel(m.id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-amber-50/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 shadow-2xs"
                                  : "hover:bg-stone-100 dark:hover:bg-stone-800/80 border border-transparent text-stone-700 dark:text-stone-300"
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                                  {m.icon}
                                </div>
                                <div>
                                  <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                                    {m.name}
                                    {m.isAirGapReady && (
                                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                        LOCAL
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-stone-400 font-mono">
                                    {m.provider} · {m.context} context
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                                  {m.tag}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-medium text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
