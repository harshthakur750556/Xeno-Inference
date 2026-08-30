import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore, ProviderModel } from "../../stores/workspaceStore";
import { ThinkingGraphDrawer } from "./ThinkingGraphDrawer";
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
  Maximize2
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
  } = useWorkspaceStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({
    "msg-init-2": false,
  });
  const [isThinkingMenuOpen, setIsThinkingMenuOpen] = useState(false);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isGenerating]);

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

  const activeMcpToolsCount = mcpServers.reduce(
    (acc, s) => acc + s.tools.filter((t) => t.enabled && s.status === "connected").length,
    0
  );

  const availableFiles = [
    "crates/xeno-tools/src/ast_validator.rs",
    "crates/xeno-tools/src/file_engine.rs",
    "crates/xeno-router/src/privacy.rs",
    "crates/xeno-router/src/router.rs",
    "crates/xeno-tools/src/pty.rs",
    "crates/xeno-dag/src/dag.rs",
  ];

  const models: { id: ProviderModel; label: string }[] = [
    { id: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet (Thinking)" },
    { id: "deepseek-r1", label: "DeepSeek R1 (Reasoning)" },
    { id: "gpt-4o", label: "GPT-4o (Multimodal)" },
    { id: "gemini-2-pro", label: "Gemini 2.0 Pro" },
    { id: "local-gguf", label: "Local GGUF (Air-Gapped)" },
    { id: "groq-llama3", label: "Groq LLaMA 3.3 (Fast)" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfaf7] dark:bg-[#0c0d11] relative overflow-hidden transition-colors duration-200">
      {/* Slide-over Thinking Graph Drawer */}
      <ThinkingGraphDrawer />

      {/* Top Studio Telemetry & Header Banner */}
      <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 font-display">
                XENO CHAT STUDIO
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                v2.4 Sovereign
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-editorial">
              Interactive cognitive chat with on-demand thinking graphs and tool arsenals
            </p>
          </div>
        </div>

        {/* Dynamic Hardware & Status Telemetry Pills */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{systemMetrics.cpuCores} Cores</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{systemMetrics.ramHeapMb} MB Heap</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
            isAirGapped 
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" 
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          }`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{isAirGapped ? "AIR-GAP ON" : "TOR SOCKS5"}</span>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 text-stone-400 hover:text-red-500 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {chatMessages.map((msg) => {
            const isUser = msg.role === "user";
            const isExpanded = expandedThinking[msg.id] ?? false;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in duration-200`}
              >
                {/* User Message Bubble */}
                {isUser ? (
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                    {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end mb-1">
                        {msg.attachedFiles.map((file) => (
                          <span
                            key={file}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1"
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
                        <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                          Ψ
                        </div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                          {msg.model || "Claude 3.7 Sonnet"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {msg.metrics && (
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
                      <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden transition-all duration-200 shadow-2xs">
                        <div 
                          onClick={() => toggleThinkingAccordion(msg.id)}
                          className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors"
                        >
                          <div className="flex items-center space-x-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            <span>
                              Thought for {msg.thinking.durationSecs}s ({msg.thinking.tokens} tokens)
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveInspectGraphMessageId(msg.id);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors flex items-center gap-1"
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
                                  <span className="text-emerald-500 font-bold">✓</span>
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
                            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between text-xs font-mono shadow-2xs"
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
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 shadow-xs text-sm leading-relaxed space-y-3 font-sans">
                      <div className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Action Bar inside Message Bubble */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
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
                            className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                            title="Spawn Node on Spatial Canvas"
                          >
                            <Layers className="w-3 h-3 text-emerald-500" />
                            <span>Canvas</span>
                          </button>

                          <button
                            onClick={() => setActiveView("dag")}
                            className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                            title="Inspect in Live Execution DAG"
                          >
                            <GitFork className="w-3 h-3 text-blue-500" />
                            <span>Execution DAG</span>
                          </button>
                        </div>

                        <div className="text-[10px] font-mono text-stone-400">
                          Sovereign Verified
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
            <div className="flex items-center space-x-3 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 max-w-md animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <div className="text-xs font-mono text-stone-600 dark:text-stone-300">
                {isThinkingEnabled ? "Decomposing goal & running cognitive graph..." : "Synthesizing response..."}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Modern AI Composer & Tool Arsenal Area */}
      <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl z-30 relative shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Attached Files Tray */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono uppercase text-stone-400">Context:</span>
              {attachedFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-700 dark:text-stone-300"
                >
                  <FileCode className="w-3 h-3 text-blue-500" />
                  <span>{file.split("/").pop()}</span>
                  <button
                    onClick={() => removeAttachedFile(file)}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Input Composer Container */}
          <div className="relative rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg focus-within:border-amber-500 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
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

            {/* Arsenal Controls Row */}
            <div className="px-3 pb-2.5 pt-1 border-t border-stone-100 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
              {/* Left Arsenal Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. Deep Thinking Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsThinkingMenuOpen(!isThinkingMenuOpen)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      isThinkingEnabled
                        ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                        : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-700"
                    }`}
                    title="Toggle Thinking & Reasoning Budget"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Think: {isThinkingEnabled ? thinkingBudget.toUpperCase() : "OFF"}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {/* Thinking Budget Popover */}
                  {isThinkingMenuOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-44 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-1 z-50 text-xs font-sans">
                      <div
                        onClick={() => {
                          if (!isThinkingEnabled) toggleThinking();
                          setThinkingBudget("fast");
                          setIsThinkingMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                      >
                        <span>Fast (1k Tokens)</span>
                        {isThinkingEnabled && thinkingBudget === "fast" && <Check className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div
                        onClick={() => {
                          if (!isThinkingEnabled) toggleThinking();
                          setThinkingBudget("deep");
                          setIsThinkingMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                      >
                        <span>Deep (8k Tokens)</span>
                        {isThinkingEnabled && thinkingBudget === "deep" && <Check className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div
                        onClick={() => {
                          if (!isThinkingEnabled) toggleThinking();
                          setThinkingBudget("max");
                          setIsThinkingMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                      >
                        <span>Max (32k Tokens)</span>
                        {isThinkingEnabled && thinkingBudget === "max" && <Check className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                      <div
                        onClick={() => {
                          toggleThinking();
                          setIsThinkingMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-stone-500"
                      >
                        Disable Thinking
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Web Search / Tor Onion Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsSearchMenuOpen(!isSearchMenuOpen)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      isWebSearchEnabled
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-700"
                    }`}
                    title="Configure Web Search & Tor Onion Mode"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Search: {isWebSearchEnabled ? webSearchMode.toUpperCase() : "OFF"}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {isSearchMenuOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-44 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-1 z-50 text-xs font-sans">
                      <div
                        onClick={() => {
                          if (!isWebSearchEnabled) toggleWebSearch();
                          setWebSearchMode("onion");
                          setIsSearchMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                      >
                        <span>Tor Onion (3-Hop)</span>
                        {isWebSearchEnabled && webSearchMode === "onion" && <Check className="w-3 h-3 text-blue-500" />}
                      </div>
                      <div
                        onClick={() => {
                          if (!isWebSearchEnabled) toggleWebSearch();
                          setWebSearchMode("clearnet");
                          setIsSearchMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                      >
                        <span>Clearnet Web</span>
                        {isWebSearchEnabled && webSearchMode === "clearnet" && <Check className="w-3 h-3 text-blue-500" />}
                      </div>
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                      <div
                        onClick={() => {
                          toggleWebSearch();
                          setIsSearchMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-stone-500"
                      >
                        Disable Search
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Image / Media Mode Button */}
                <button
                  onClick={toggleImageGenMode}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    isImageGenMode
                      ? "bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-700"
                  }`}
                  title="Toggle Image / Vector Schematic Mode"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Media</span>
                </button>

                {/* 4. ConPTY Sandbox Run Mode */}
                <button
                  onClick={toggleCodeExecMode}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    isCodeExecMode
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-700"
                  }`}
                  title="Toggle ConPTY Code Execution"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>ConPTY</span>
                </button>

                {/* 5. MCP Tools Arsenal Button */}
                <button
                  onClick={toggleMcpModal}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-700 hover:border-amber-400 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors"
                  title="Configure Model Context Protocol tools"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>MCP ({activeMcpToolsCount})</span>
                </button>

                {/* 6. Attach File Context */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilePickerOpen(!isFilePickerOpen)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                    title="Attach workspace file"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  {isFilePickerOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-64 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-1.5 z-50 text-xs font-sans">
                      <span className="text-[10px] font-mono uppercase text-stone-400 px-2 py-1 block">
                        Select Workspace File
                      </span>
                      {availableFiles.map((file) => (
                        <div
                          key={file}
                          onClick={() => {
                            attachFile(file);
                            setIsFilePickerOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer font-mono text-[11px] truncate flex items-center gap-1.5 text-stone-700 dark:text-stone-300"
                        >
                          <FileCode className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Send Action & Model Selector */}
              <div className="flex items-center space-x-2">
                {/* Model Selector Pill */}
                <div className="relative">
                  <button
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 hover:border-stone-400 transition-colors"
                  >
                    <span className="truncate max-w-[120px]">
                      {models.find((m) => m.id === selectedModel)?.label.split(" ")[0] || "Claude"}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {isModelMenuOpen && (
                    <div className="absolute bottom-full mb-1 right-0 w-56 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-1 z-50 text-xs font-sans">
                      {models.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setIsModelMenuOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                        >
                          <span>{m.label}</span>
                          {selectedModel === m.id && <Check className="w-3 h-3 text-amber-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-medium text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
