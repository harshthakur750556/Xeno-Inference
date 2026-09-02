import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  User,
  Sliders,
  Activity,
  Gauge,
  RotateCcw,
  Plus,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  Copy,
  ChevronDown,
  Terminal,
  Zap,
} from 'lucide-react';
import { ButterflySvg } from './ButterflySvg';
import { ThinkingBlock } from './ThinkingBlock';
import { CodeBlock } from './CodeBlock';
import { SettingsModal } from './SettingsModal';
import { TelemetryModal } from './TelemetryModal';
import { BenchmarkModal } from './BenchmarkModal';
import type {
  Message,
  InferenceConfig,
  TelemetryData,
  FileAttachment,
} from '../types';
import {
  AVAILABLE_MODELS,
  checkBackendHealth,
  fetchTelemetry,
  streamChatInference,
} from '../services/api';

interface ChatInterfaceProps {
  onReplayIntro: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'High-Performance Rust SSE',
    desc: 'Write an Axum SSE streaming server in Rust for token inference',
    prompt: 'Show me how to build an ultra-fast Server-Sent Events (SSE) AI inference streaming handler in Rust with Axum and Tokio.',
  },
  {
    title: 'Quantum & Neural Math',
    desc: 'Explain FlashAttention-3 and KV-cache mathematical formulation',
    prompt: 'Derive the mathematical formulation of FlashAttention-3 and explain how PagedAttention solves KV-cache VRAM fragmentation.',
  },
  {
    title: 'CUDA Tensor Optimization',
    desc: 'Guide to BF16 & FP8 mixed-precision matrix multiplication',
    prompt: 'How does mixed precision quantization (FP8 / BF16) reduce memory bandwidth pressure during LLM autoregressive decoding?',
  },
  {
    title: 'Fullstack TS + Rust Architecture',
    desc: 'Design zero-copy IPC between TypeScript frontend and Rust backend',
    prompt: 'Design a clean architecture for an AI desktop application connecting a TypeScript React frontend to a native Rust inference daemon.',
  },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onReplayIntro }) => {
  const [config, setConfig] = useState<InferenceConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    systemPrompt: 'You are XENO, an ultra-advanced AI reasoning engine. Provide structured, accurate, and deeply insightful responses with clean code.',
    stream: true,
    enableReasoning: true,
    rustBackendUrl: 'http://127.0.0.1:3001',
    model: 'xeno-deepseek-r1',
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isThinkingActive, setIsThinkingActive] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    engineStatus: 'simulated',
    activeStreams: 0,
    vramUsedGb: 14.8,
    vramTotalGb: 24.0,
    totalTokensProcessed: 184520,
    avgThroughput: 91.2,
    cpuLoadPercent: 18,
    rustVersion: 'rustc 1.98.0 / Axum 0.8',
    uptimeSeconds: 120,
    memoryBandwidthGbps: 840,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const online = await checkBackendHealth(config.rustBackendUrl);
      if (isMounted) {
        setIsBackendOnline(online);
        const telem = await fetchTelemetry(config.rustBackendUrl);
        setTelemetry(telem);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.rustBackendUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText && attachments.length === 0) return;
    if (isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsStreaming(true);
    setStreamingReasoning('');
    setStreamingContent('');
    setIsThinkingActive(config.enableReasoning);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedReasoning = '';
    let accumulatedContent = '';

    await streamChatInference(
      newMessages,
      config,
      (chunk) => {
        accumulatedReasoning += chunk;
        setStreamingReasoning(accumulatedReasoning);
      },
      (chunk) => {
        setIsThinkingActive(false);
        accumulatedContent += chunk;
        setStreamingContent(accumulatedContent);
      },
      (metrics) => {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: accumulatedContent,
          reasoning: accumulatedReasoning || undefined,
          metrics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsStreaming(false);
        setStreamingReasoning('');
        setStreamingContent('');
        setIsThinkingActive(false);
        abortControllerRef.current = null;
      },
      (err) => {
        console.error('Inference error:', err);
        if (accumulatedContent) {
          const assistantMessage: Message = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: accumulatedContent,
            reasoning: accumulatedReasoning || undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
        setIsStreaming(false);
        setStreamingReasoning('');
        setStreamingContent('');
        setIsThinkingActive(false);
        abortControllerRef.current = null;
      },
      abortController.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinkingActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content: result,
          },
        ]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleVoiceInput = () => {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.').replace(/[#*_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingMessageId(msgId);
      }
    }
  };

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === config.model) || AVAILABLE_MODELS[0];

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        return <CodeBlock key={index} language={lang} code={code} />;
      }

      return (
        <div key={index} className="space-y-2 text-[14px] leading-relaxed text-zinc-100 whitespace-pre-wrap">
          {part.split('\n\n').map((para, pIdx) => {
            if (para.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-cyan-200 mt-3 mb-1">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            if (para.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-sm font-semibold text-cyan-300 mt-2 mb-1">
                  {para.replace('#### ', '')}
                </h4>
              );
            }
            return <p key={pIdx}>{para}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-white overflow-hidden select-none font-sans">
      <aside
        className={`${
          isSidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between overflow-hidden relative z-30`}
      >
        <div className="p-4 space-y-4 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <ButterflySvg size={32} />
            <div className="flex flex-col">
              <span className="font-roman text-sm font-bold tracking-wider text-white">
                XENO
              </span>
              <span className="font-calligraphy text-xs text-zinc-400 -mt-1">
                Inference
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([]);
              handleStopGeneration();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-2">
              Inspiration Prompts
            </span>
            <div className="space-y-1">
              {STARTER_PROMPTS.map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(starter.prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition group cursor-pointer"
                >
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                    {starter.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {starter.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-zinc-800 space-y-2">
            <div className="p-3 rounded-xl bg-black border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">RUST ENGINE:</span>
                <span className={`font-bold ${isBackendOnline ? 'text-white' : 'text-zinc-400'}`}>
                  {isBackendOnline ? 'ONLINE' : 'LOCAL SIM'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">THROUGHPUT:</span>
                <span className="text-zinc-300">{telemetry.avgThroughput} tok/s</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">KV-CACHE:</span>
                <span className="text-zinc-300">{telemetry.vramUsedGb} GB</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Toggle Sidebar"
            >
              <Terminal className="w-4 h-4 text-zinc-300" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium transition cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="font-semibold text-zinc-100">{selectedModel.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/10">
                  {selectedModel.badge || '70B'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0e0e11] border border-zinc-700 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, model: model.id }));
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                        config.model === model.id
                          ? 'bg-zinc-800 border border-zinc-600'
                          : 'hover:bg-zinc-800/50 border border-transparent'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full mt-1 bg-white" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{model.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{model.params}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{model.tagline}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-zinc-400">
                {isBackendOnline ? 'Rust Axum (Port 3001)' : 'Local Engine'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              title="Replay 3-second opening animation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden md:inline">Replay Intro</span>
            </button>

            <button
              onClick={() => setIsTelemetryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              title="View live engine telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden md:inline">Telemetry</span>
            </button>

            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              title="Run throughput benchmark"
            >
              <Gauge className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden md:inline">Benchmark</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Configure parameters"
            >
              <Sliders className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 my-auto select-none">
              <div className="relative">
                <ButterflySvg size={280} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-center gap-3">
                  <span className="font-roman text-3xl sm:text-4xl font-extrabold tracking-widest text-white">
                    XENO
                  </span>
                  <span className="font-calligraphy text-4xl sm:text-5xl text-zinc-300">
                    Inference
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Ultra-low latency AI inference engine powered by Rust and TypeScript. Real-time token streaming with deep reasoning telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition group cursor-pointer space-y-1"
                  >
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 p-0.5 shadow-md">
                    <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                      <ButterflySvg size={20} />
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-col space-y-2 max-w-[85%] sm:max-w-[78%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {msg.attachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 sm:p-5 select-text shadow-xl ${
                      isUser
                        ? 'bg-zinc-100 text-black font-normal rounded-tr-none'
                        : 'bg-[#0b0b0e] border border-zinc-800 text-zinc-100 rounded-tl-none'
                    }`}
                  >
                    {!isUser && msg.reasoning && (
                      <ThinkingBlock reasoning={msg.reasoning} isThinking={false} />
                    )}

                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  <div className="flex items-center gap-3 px-1 text-[11px] font-mono text-zinc-500">
                    <span>{msg.timestamp}</span>

                    {!isUser && msg.metrics && (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-zinc-300" />
                        {msg.metrics.tokensPerSec} tok/s • TTFT: {msg.metrics.ttftMs}ms • {msg.metrics.tokens} tokens
                      </span>
                    )}

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="hover:text-white transition cursor-pointer"
                          title="Copy response"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className={`hover:text-white transition cursor-pointer ${
                            speakingMessageId === msg.id ? 'text-white animate-pulse' : ''
                          }`}
                          title="Read aloud"
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 p-0.5 shadow-md">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <ButterflySvg size={20} />
                </div>
              </div>

              <div className="flex flex-col space-y-2 max-w-[85%] sm:max-w-[78%]">
                <div className="rounded-2xl p-4 sm:p-5 bg-[#0b0b0e] border border-zinc-800 text-zinc-100 rounded-tl-none shadow-xl">
                  {(streamingReasoning || isThinkingActive) && (
                    <ThinkingBlock
                      reasoning={streamingReasoning}
                      isThinking={isThinkingActive}
                    />
                  )}

                  {streamingContent ? (
                    <div>
                      {renderFormattedContent(streamingContent)}
                      <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse align-middle" />
                    </div>
                  ) : !streamingReasoning ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>Connecting to Rust neural pipeline...</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 px-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Streaming forward pass tokens...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 sm:p-6 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent z-20">
          <div className="max-w-4xl mx-auto space-y-3">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 text-xs font-mono text-zinc-200"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{att.name}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative rounded-2xl bg-[#09090b] border border-zinc-800 focus-within:border-zinc-600 shadow-2xl transition duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${selectedModel.name} anything... (Shift+Enter for newline)`}
                rows={1}
                className="w-full px-5 py-4 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-48 overflow-y-auto leading-relaxed"
                style={{ minHeight: '56px' }}
              />

              <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Attach text or code files"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isListening
                        ? 'bg-white/20 text-white animate-pulse border border-white/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title="Voice dictation"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, enableReasoning: !prev.enableReasoning }))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      config.enableReasoning
                        ? 'bg-zinc-800 border border-zinc-600 text-white'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    <span className="hidden sm:inline">Reasoning</span>
                  </button>
                </div>

                <div>
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer border border-zinc-700"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!input.trim() && attachments.length === 0}
                      onClick={() => handleSendMessage()}
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-white hover:bg-zinc-200 text-black transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-2">
              <span>Model: {selectedModel.name} ({selectedModel.contextWindow} context)</span>
              <span>Rust Engine SSE: Active</span>
            </div>
          </div>
        </footer>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChange={setConfig}
      />

      <TelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        telemetry={telemetry}
        onRefresh={async () => {
          const telem = await fetchTelemetry(config.rustBackendUrl);
          setTelemetry(telem);
        }}
      />

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        rustBackendUrl={config.rustBackendUrl}
        activeModel={selectedModel.name}
      />
    </div>
  );
};

