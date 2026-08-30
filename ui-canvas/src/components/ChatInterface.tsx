import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, User, ChevronRight, Paperclip, Cpu, RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'xeno';
  content: string;
  thinking?: string;
  timestamp: string;
  metrics?: {
    model: string;
    tokensPerSec: number;
    latencyMs: number;
    costUsd: number;
  };
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'xeno',
    content: "Greetings. **XENO INFERENCE** spatial neural matrix is fully initialized and operational. All tensor nodes, AST verification compilers, and multi-agent routing engines are synchronized.",
    thinking: "DeepThinking Trace: Initialized kernel hooks -> Verified 3301 cryptographic matrix -> Bound high-throughput router -> Awaiting operator instruction.",
    timestamp: 'JUST NOW',
    metrics: {
      model: 'DeepSeek V3 / Claude 3.7 Hybrid',
      tokensPerSec: 148.6,
      latencyMs: 14.2,
      costUsd: 0.0012,
    }
  }
];

const SUGGESTED_PROMPTS = [
  { label: '/swarm start', desc: 'Initialize 5-agent parallel pipeline' },
  { label: '/dag visualize', desc: 'Render real-time spatial node graph' },
  { label: '/ast verify', desc: 'Perform strict AST compiler diff check' },
  { label: '/cipher decode', desc: 'Execute 3301 prime factor analysis' },
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 + Gemini 2.5 Hybrid');
  const [isThinkingOpen, setIsThinkingOpen] = useState<Record<string, boolean>>({ 'msg-1': true });
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (!inputVal.trim() || isStreaming) return;

    const userText = inputVal.trim();
    const newMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputVal('');
    setIsStreaming(true);

    // Simulate XENO's ultra-fast streaming response
    setTimeout(() => {
      const responseId = `xeno-${Date.now()}`;
      const xenoMsg: ChatMessage = {
        id: responseId,
        sender: 'xeno',
        content: `Executing directive: **\`${userText}\`**\n\nTask dispatched across the multi-agent DAG pipeline. Kernel telemetry reports sub-20ms execution with 100% consensus validation. Ready for next prompt or configuration instruction.`,
        thinking: `Synthesizing operator prompt: "${userText}" -> Validating AST safety constraints -> Executing parallel toolchain...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics: {
          model: selectedModel,
          tokensPerSec: +(140 + Math.random() * 20).toFixed(1),
          latencyMs: +(12 + Math.random() * 8).toFixed(1),
          costUsd: 0.0008,
        }
      };

      setMessages((prev) => [...prev, xenoMsg]);
      setIsThinkingOpen((prev) => ({ ...prev, [responseId]: true }));
      setIsStreaming(false);
    }, 750);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Chat Container Card */}
      <div className="relative rounded-3xl bg-zinc-950/75 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Top Chat Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-cyan-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(0,245,212,0.4)]">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-roman text-sm font-bold tracking-wider text-white">
                  XENO CONSTELLATION CHAT
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  LIVE INFERENCE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Quantum routed consensus pipeline</p>
            </div>
          </div>

          {/* Model Selector Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-300 hover:border-violet-500/50 transition-colors cursor-pointer">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-zinc-200"
              >
                <option value="Claude 3.7 + Gemini 2.5 Hybrid" className="bg-zinc-900">Claude 3.7 + Gemini 2.5 Hybrid</option>
                <option value="DeepSeek V3 / R1 Reasoner" className="bg-zinc-900">DeepSeek V3 / R1 Reasoner</option>
                <option value="Llama 3.3 70B Local Tensor" className="bg-zinc-900">Llama 3.3 70B Local Tensor</option>
                <option value="Multi-Agent Swarm Mode" className="bg-zinc-900">Multi-Agent Swarm Mode (5 Nodes)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Feed Area */}
        <div className="p-6 space-y-6 max-h-[480px] min-h-[260px] overflow-y-auto font-sans">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  isUser 
                    ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' 
                    : 'bg-violet-950/80 border border-violet-500/40 text-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Thinking Section (if available) */}
                  {msg.thinking && (
                    <div className="rounded-xl bg-black/40 border border-violet-500/20 overflow-hidden text-xs font-mono">
                      <button
                        onClick={() => setIsThinkingOpen(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        className="w-full flex items-center justify-between px-3 py-2 text-violet-300/80 hover:text-violet-200 hover:bg-violet-950/30 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          REASONING TRACE
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isThinkingOpen[msg.id] ? 'rotate-90' : ''
                        }`} />
                      </button>
                      
                      {isThinkingOpen[msg.id] && (
                        <div className="px-3 pb-2.5 pt-1 text-[11px] text-zinc-400 border-t border-violet-500/10 leading-relaxed bg-zinc-950/50">
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Bubble */}
                  <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg'
                      : 'bg-zinc-900/90 border border-white/10 text-zinc-200 shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Message Bottom Metrics */}
                  <div className="flex items-center gap-3 px-1 text-[10px] font-mono text-zinc-500">
                    <span>{msg.timestamp}</span>
                    {msg.metrics && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400/80">{msg.metrics.tokensPerSec} t/s</span>
                        <span>•</span>
                        <span className="text-emerald-400/80">{msg.metrics.latencyMs}ms</span>
                        <span>•</span>
                        <span className="text-zinc-400">{msg.metrics.model}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex gap-3.5 items-center text-xs font-mono text-cyan-400 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              </div>
              <span>XENO is synthesizing and executing consensus pipeline...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2.5 border-t border-white/5 bg-black/20 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> SUGGESTED:
          </span>
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputVal(item.label);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-cyan-500/40 text-xs font-mono text-zinc-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
            >
              <span className="font-semibold text-cyan-400">{item.label}</span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">({item.desc})</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-black/60">
          <div className="relative flex items-end gap-2 rounded-2xl bg-zinc-900/90 border border-white/15 p-2 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send instruction to Xeno Inference (e.g. build AST parser, optimize DAG routing)..."
              rows={2}
              className="w-full bg-transparent resize-none outline-none text-sm text-zinc-100 placeholder-zinc-500 px-3 py-1.5 font-sans"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pb-1 pr-1">
              <button
                type="button"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                title="Attach context file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!inputVal.trim() || isStreaming}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  inputVal.trim() && !isStreaming
                    ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(0,245,212,0.4)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 px-1">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Enter ↵</kbd> to execute</span>
            <span>Shift + Enter for multiline</span>
          </div>
        </div>

      </div>

    </div>
  );
};
