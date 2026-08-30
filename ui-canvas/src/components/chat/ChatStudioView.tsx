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
  Sliders,
  Wrench,
  Server,
  Activity,
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
  } = useWorkspaceStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});

  // Popups State
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

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isGenerating) return;
    const prompt = inputPrompt;
    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendChatMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThinkingCard = (id: string) => {
    setExpandedThinking((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const modelOptions: { id: ProviderModel; name: string; tag: string; provider: string }[] = [
    { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", tag: "Thinking Core", provider: "Anthropic" },
    { id: "deepseek-r1", name: "DeepSeek R1", tag: "Deep Reasoning", provider: "DeepSeek" },
    { id: "gpt-4o", name: "GPT-4o Omnimodal", tag: "Fast Visual", provider: "OpenAI" },
    { id: "gemini-2-pro", name: "Gemini 2.0 Pro", tag: "2M Context", provider: "Google" },
    { id: "local-gguf", name: "Local GGUF Runtime", tag: "Zero-Leak", provider: "Local Host" },
  ];

  const quickDirectives = [
    "Synthesize Rust syn AST parser for file_engine.rs",
    "Query bare machine GPU telemetry & hardware limits",
    "Launch autonomous swarm council for security audit",
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-stone-50/80 dark:bg-stone-950/80 transition-colors duration-200">
      {/* Dynamic Nodular Constellation Canvas (Background Reactive Physics) */}
      <NodularConstellationCanvas />

      {/* Floating Thinking Graph Inspector Drawer */}
      <ThinkingGraphDrawer />

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-12 py-4 sm:py-6 space-y-4 sm:space-y-6 z-10">
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-3xl mx-auto w-full`}
            >
              {/* Header Label */}
              <div className="flex items-center space-x-2 mb-1.5 px-1 text-[11px] font-mono text-stone-400 dark:text-stone-500">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {isUser ? "Operator Directive" : msg.model || "Sovereign AI"}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Collapsible Cognitive Thinking Card (For Assistant Messages) */}
              {msg.thinking && (
                <div className="w-full mb-2 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 backdrop-blur-md transition-all shadow-2xs">
                  <div 
                    onClick={() => toggleThinkingCard(msg.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
                        Deep Cognitive Reasoning ({msg.thinking.tokens} tokens · {msg.thinking.durationSecs}s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInspectGraphMessageId(msg.id);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-300 dark:border-amber-800 text-[10px] font-mono text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-1"
                      >
                        <GitFork className="w-3 h-3" />
                        <span className="hidden sm:inline">Inspect Graph</span>
                      </button>
                      {expandedThinking[msg.id] ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                  </div>

                  {expandedThinking[msg.id] && (
                    <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40 space-y-1.5 font-mono text-[11px] text-stone-600 dark:text-stone-300">
                      <p className="font-sans leading-relaxed text-xs text-stone-700 dark:text-stone-300 mb-2">
                        {msg.thinking.summary}
                      </p>
                      {msg.thinking.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-amber-500 font-bold">↳</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl transition-all shadow-xs leading-relaxed text-xs sm:text-sm ${
                  isUser
                    ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-br-xs font-sans max-w-[90%] sm:max-w-[85%]"
                    : "bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 text-stone-800 dark:text-stone-200 rounded-bl-xs w-full backdrop-blur-xl"
                }`}
              >
                <div className="whitespace-pre-wrap select-text font-sans">
                  {msg.content}
                </div>

                {/* Assistant Message Actions & Telemetry Footer */}
                {!isUser && msg.content && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-400 dark:text-stone-500">
                    <div className="flex items-center space-x-3">
                      {msg.metrics && (
                        <span>
                          {msg.metrics.tokPerSec} tok/s · {msg.metrics.latencyMs}ms TTFT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyCode(msg.id, msg.content)}
                        className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title="Copy message text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => forkThoughtToCanvas(msg.id)}
                        className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title="Fork thought to Spatial Canvas"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Generating Animation Pill */}
        {isGenerating && (
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-600 dark:text-amber-400 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 w-fit max-w-md animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Streaming tokens via {selectedModel}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer Bar */}
      <div className="p-3 sm:p-5 border-t border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl z-20 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Quick Directives Pills (Shown when few messages) */}
          {chatMessages.length <= 2 && (
            <div className="hidden sm:flex items-center space-x-2 overflow-x-auto pb-1 text-[11px] font-mono">
              <span className="text-stone-400 uppercase text-[9px] font-bold">Suggested:</span>
              {quickDirectives.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputPrompt(d);
                    textareaRef.current?.focus();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all truncate max-w-[240px]"
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Composer Input Box */}
          <div className="p-2 sm:p-3 rounded-2xl border border-stone-300/80 dark:border-stone-700/80 bg-stone-50/90 dark:bg-stone-950/90 focus-within:border-stone-500 dark:focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all shadow-inner space-y-2">
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => {
                setInputPrompt(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Ask anything, run code, or command sovereign multi-agents (Shift + Enter for new line)..."
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none resize-none font-sans leading-relaxed"
            />

            {/* Composer Footer: Controls & Arsenal */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800/60 text-xs font-mono">
              {/* Left Arsenal Trigger & Model Selector */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 relative">
                {/* Model Selector Dropdown Trigger */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-all shadow-2xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[100px] sm:max-w-[140px]">{modelOptions.find((m) => m.id === selectedModel)?.name}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {/* Responsive Model Dropdown */}
                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-64 sm:w-72 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-stone-400">Select Inference Core</div>
                      {modelOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSelectedModel(opt.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                            selectedModel === opt.id
                              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold"
                              : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{opt.name}</div>
                            <div className="text-[10px] opacity-70">{opt.provider}</div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                            {opt.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thinking Mode Toggle */}
                <button
                  onClick={toggleThinking}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-xl border text-[11px] transition-all ${
                    isThinkingEnabled
                      ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold"
                      : "border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                  title="Toggle Step-by-Step Cognitive Thinking"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Thinking</span>
                </button>

                {/* Clear Chat */}
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-xl hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-400 hover:text-rose-500 transition-colors"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right Send Action */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Transmit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
