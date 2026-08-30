import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { ThinkingGraphDrawer } from "./ThinkingGraphDrawer";
import { NodularConstellationCanvas } from "./NodularConstellationCanvas";
import { 
  Send, 
  BrainCircuit, 
  Sparkles, 
  Paperclip, 
  ChevronDown, 
  ChevronRight, 
  GitFork, 
  Layers, 
  Copy, 
  Check, 
  FileCode, 
  Trash2, 
  Zap, 
  X, 
  Sliders, 
  Server, 
  Globe, 
  Key,
  Bot,
  Box,
  Compass,
  ArrowRight
} from "lucide-react";

export const ChatStudioView: React.FC = () => {
  const {
    chatMessages,
    isGenerating,
    isThinkingEnabled,
    selectedModel,
    selectedProviderId,
    setSelectedModel,
    toggleThinking,
    providers,
    openProviderModal,
    attachedFiles,
    attachFile,
    removeAttachedFile,
    sendChatMessage,
    clearChat,
    forkThoughtToCanvas,
    setActiveInspectGraphMessageId,
    systemMetrics,
  } = useWorkspaceStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isGenerating]);

  // Click outside listener for model dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  // Find active model details
  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];
  const allModels = providers.flatMap((p) => p.models);
  const currentModelInfo = allModels.find((m) => m.id === selectedModel) || allModels[0];

  const quickDirectives = [
    { label: "Synthesize Rust syn AST parser for file_engine.rs", prompt: "Synthesize a Rust syn AST parser for file_engine.rs with zero-copy validation." },
    { label: "Query bare machine GPU telemetry & hardware limits", prompt: "Inspect host GPU accelerator limits, WebGL parameters, and CPU logical threads." },
    { label: "Build 3D CAD mesh for precision mechanical gear", prompt: "Design an involute gear 3D CAD parametric structure in the infinite creative canvas." },
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-stone-50/80 dark:bg-stone-950/80 transition-colors duration-200">
      {/* Background Reactive Node Constellation Physics */}
      <NodularConstellationCanvas />

      {/* Floating Thinking Graph Inspector Drawer */}
      <ThinkingGraphDrawer />

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 space-y-6 z-10">
        {/* Clean Empty State Hero — Classical Roman White Luxury */}
        {chatMessages.length === 0 && (
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300 select-none">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 shadow-xs text-[11px] font-mono text-stone-600 dark:text-stone-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-display uppercase tracking-wider">SOVEREIGN WORKSTATION</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">AIR-GAP SECURED</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight uppercase">
                XENO INFERENCE
              </h1>

              <p className="text-sm sm:text-base font-editorial italic text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
                Directives, multi-agent reasoning, character-exact AST synthesis, and 3D spatial tinkering on bare-metal hardware.
              </p>
            </div>

            {/* Current Active Core Chip */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => openProviderModal(activeProvider?.id)}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 shadow-xs hover:border-amber-400 transition-all font-mono text-xs cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {currentModelInfo?.name || selectedModel}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  activeProvider?.isConfigured
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                }`}>
                  {activeProvider?.isConfigured ? "Ready" : "Configure Key"}
                </span>
              </button>
            </div>

            {/* Quick Inspiration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
              {quickDirectives.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputPrompt(d.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all space-y-1.5 cursor-pointer text-left group"
                >
                  <div className="flex items-center justify-between text-stone-400 group-hover:text-amber-500">
                    <Compass className="w-4 h-4" />
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-snug font-sans">
                    {d.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Messages Stream */}
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-3xl mx-auto w-full`}
            >
              {/* Header */}
              <div className="flex items-center space-x-2 mb-1.5 px-1 text-[11px] font-mono text-stone-400 dark:text-stone-500">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {isUser ? "Directive" : msg.model || "Sovereign AI"}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Cognitive Thinking Card */}
              {msg.thinking && (
                <div className="w-full mb-2.5 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 backdrop-blur-md shadow-2xs">
                  <div 
                    onClick={() => toggleThinkingCard(msg.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
                        Cognitive Reasoning ({msg.thinking.tokens} tok · {msg.thinking.durationSecs}s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInspectGraphMessageId(msg.id);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-300 dark:border-amber-800 text-[10px] font-mono text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1"
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

              {/* Message Bubble */}
              <div
                className={`p-4 sm:p-5 rounded-3xl transition-all shadow-xs leading-relaxed text-xs sm:text-sm ${
                  isUser
                    ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-br-xs font-sans max-w-[90%] sm:max-w-[85%]"
                    : "bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 text-stone-800 dark:text-stone-200 rounded-bl-xs w-full backdrop-blur-xl"
                }`}
              >
                <div className="whitespace-pre-wrap select-text font-sans">
                  {msg.content}
                </div>

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
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => forkThoughtToCanvas(msg.id)}
                        className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title="Fork thought to Infinite Canvas"
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

        {/* Live Generating Animation */}
        {isGenerating && (
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-600 dark:text-amber-400 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 w-fit max-w-md animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Synthesizing tokens via {currentModelInfo?.name || selectedModel}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer Box */}
      <div className="p-3 sm:p-5 border-t border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl z-20 shrink-0 select-none">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="p-2.5 sm:p-3 rounded-3xl border border-stone-300/80 dark:border-stone-700/80 bg-stone-50/90 dark:bg-stone-950/90 focus-within:border-stone-500 dark:focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all shadow-inner space-y-2">
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
              placeholder="Ask anything, validate AST, design 3D CAD, or command the swarm (Shift + Enter for newline)..."
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none resize-none font-sans leading-relaxed"
            />

            {/* Composer Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800/60 text-xs font-mono">
              {/* Left Model Selector & Thinking Mode */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 relative">
                {/* Model Selector Dropdown Trigger */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[110px] sm:max-w-[150px]">{currentModelInfo?.name || selectedModel}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {/* Responsive Model Dropdown */}
                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-72 sm:w-80 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-2.5 z-50 space-y-1.5 max-h-[65vh] overflow-y-auto">
                      <div className="flex items-center justify-between px-2 py-1 border-b border-stone-100 dark:border-stone-800 text-[10px] font-bold uppercase text-stone-400">
                        <span>Select Inference Engine</span>
                        <button
                          onClick={() => {
                            setIsModelDropdownOpen(false);
                            openProviderModal();
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Key className="w-2.5 h-2.5" />
                          <span>Configure Keys</span>
                        </button>
                      </div>

                      {providers.map((prov) => (
                        <div key={prov.id} className="space-y-1">
                          <div className="px-2 pt-1 text-[9px] uppercase font-bold text-stone-400 flex items-center justify-between">
                            <span>{prov.name}</span>
                            <span className={prov.isConfigured ? "text-emerald-500" : "text-amber-500"}>
                              {prov.isConfigured ? "✓ Configured" : "Key Required"}
                            </span>
                          </div>

                          {prov.models.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setSelectedModel(opt.id, prov.id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                                selectedModel === opt.id
                                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold"
                                  : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                              }`}
                            >
                              <div>
                                <div className="text-xs font-semibold">{opt.name}</div>
                                <div className="text-[10px] opacity-70">{opt.description}</div>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                                {opt.tag}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => {
                            setIsModelDropdownOpen(false);
                            openProviderModal();
                          }}
                          className="w-full py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>Provider & Local Host Settings</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thinking Mode Toggle */}
                <button
                  onClick={toggleThinking}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border text-[11px] transition-all cursor-pointer ${
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
                {chatMessages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-xl hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Clear Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right Transmit Action */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
