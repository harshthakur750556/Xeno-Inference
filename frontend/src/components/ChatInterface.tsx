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
  Check,
  ChevronDown,
  Terminal,
  Zap,
  Trash2,
  Edit2,
  Pin,
  Download,
  Search,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';
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
  ChatSession,
  SlashCommand,
} from '../types';
import {
  AVAILABLE_MODELS,
  checkBackendHealth,
  fetchTelemetry,
  streamChatInference,
} from '../services/api';
import {
  getStoredSessions,
  getActiveSessionId,
  setActiveSessionId,
  createSession,
  updateSession,
  deleteSession,
  exportSessionAsMarkdown,
  exportSessionAsJson,
} from '../services/storage';

interface ChatInterfaceProps {
  onReplayIntro: () => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: '/explain', label: 'Explain Concept', description: 'Deep breakdown of algorithms or systems', promptPrefix: 'Explain in rigorous technical detail: ' },
  { command: '/code', label: 'Write Code', description: 'Generate production-ready Rust/TypeScript modules', promptPrefix: 'Write a clean, optimized, production-grade implementation of: ' },
  { command: '/debug', label: 'Debug & Profile', description: 'Analyze memory, concurrency or syntax errors', promptPrefix: 'Analyze, debug, and provide fixes for the following issue: ' },
  { command: '/summarize', label: 'Summarize', description: 'Distill complex technical texts into key takeaways', promptPrefix: 'Summarize the core technical findings and architecture of: ' },
  { command: '/system', label: 'System Architecture', description: 'Design scalable distributed zero-copy pipelines', promptPrefix: 'Design a high-throughput, low-latency system architecture for: ' },
];

const STARTER_PROMPTS = [
  {
    title: 'High-Performance Rust SSE',
    desc: 'Write an Axum SSE streaming server in Rust for token inference',
    prompt: 'Show me how to build an ultra-fast Server-Sent Events (SSE) AI inference streaming handler in Rust with Axum and Tokio.',
  },
  {
    title: 'Neural Architecture & KV-Cache',
    desc: 'Explain FlashAttention-3 and KV-cache mathematical formulation',
    prompt: 'Derive the mathematical formulation of FlashAttention-3 and explain how PagedAttention solves KV-cache VRAM fragmentation.',
  },
  {
    title: 'Tensor Precision & Quantization',
    desc: 'Guide to BF16 & FP8 mixed-precision matrix multiplication',
    prompt: 'How does mixed precision quantization (FP8 / BF16) reduce memory bandwidth pressure during LLM autoregressive decoding?',
  },
  {
    title: 'Fullstack TS + Rust Systems',
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
    webSearch: false,
  });

  // Real Persistent Multi-Session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Active Message & Generation State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isThinkingActive, setIsThinkingActive] = useState(false);
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [liveThinkingDurationMs, setLiveThinkingDurationMs] = useState(0);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Slash Commands Popover State
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);

  // User Message Editing State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Backend & Telemetry
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

  // Modals & UI Controls
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Sessions from LocalStorage on mount
  useEffect(() => {
    const loadedSessions = getStoredSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const activeId = getActiveSessionId() || loadedSessions[0].id;
      setActiveSessionIdState(activeId);
      const activeSess = loadedSessions.find((s) => s.id === activeId) || loadedSessions[0];
      setMessages(activeSess.messages);
      if (activeSess.model) {
        setConfig((prev) => ({ ...prev, model: activeSess.model }));
      }
    } else {
      const initial = createSession(config.model, 'New Conversation');
      setSessions([initial]);
      setActiveSessionIdState(initial.id);
      setMessages([]);
    }
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check Backend Health & Telemetry
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

  // Live Thinking Duration Stopwatch
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isThinkingActive && thinkingStartTime) {
      interval = setInterval(() => {
        setLiveThinkingDurationMs(Date.now() - thinkingStartTime);
      }, 50);
    } else {
      setLiveThinkingDurationMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinkingActive, thinkingStartTime]);

  // Auto-scroll to bottom on streaming/messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  // Handle Switching Active Session
  const handleSelectSession = (sessionId: string) => {
    if (isStreaming) handleStopGeneration();
    setActiveSessionId(sessionId);
    setActiveSessionIdState(sessionId);
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setMessages(target.messages);
      if (target.model) {
        setConfig((prev) => ({ ...prev, model: target.model }));
      }
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // Handle Creating New Session
  const handleCreateNewSession = () => {
    if (isStreaming) handleStopGeneration();
    const newSession = createSession(config.model, 'New Conversation');
    setSessions(getStoredSessions());
    setActiveSessionIdState(newSession.id);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // Handle Deleting Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSession(sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        handleCreateNewSession();
      }
    }
  };

  // Handle Pinning Session
  const handleTogglePinSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = updateSession(sessionId, (s) => ({ ...s, isPinned: !s.isPinned }));
    setSessions(updated);
  };

  // Handle Renaming Session
  const handleSaveRenameSession = (sessionId: string) => {
    if (!editTitleInput.trim()) {
      setEditingSessionId(null);
      return;
    }
    const updated = updateSession(sessionId, (s) => ({ ...s, title: editTitleInput.trim() }));
    setSessions(updated);
    setEditingSessionId(null);
  };

  // Handle Sending Message
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText && attachments.length === 0) return;
    if (isStreaming) return;

    // Check if new session needs auto-title
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSess = createSession(config.model, promptText.slice(0, 32));
      currentSessionId = newSess.id;
      setActiveSessionIdState(newSess.id);
    } else {
      const activeSess = sessions.find((s) => s.id === currentSessionId);
      if (activeSess && activeSess.messages.length === 0) {
        updateSession(currentSessionId, (s) => ({ ...s, title: promptText.slice(0, 34) }));
        setSessions(getStoredSessions());
      }
    }

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateSession(currentSessionId, (s) => ({ ...s, messages: newMessages, model: config.model }));
    setSessions(getStoredSessions());

    setInput('');
    setAttachments([]);
    setIsSlashMenuOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsStreaming(true);
    setStreamingReasoning('');
    setStreamingContent('');
    setIsThinkingActive(config.enableReasoning);
    setThinkingStartTime(config.enableReasoning ? Date.now() : null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedReasoning = '';
    let accumulatedContent = '';
    const startGenTime = Date.now();

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
        const duration = Date.now() - startGenTime;
        const assistantMessage: Message = {
          id: 'msg-' + Date.now() + '-ai',
          role: 'assistant',
          content: accumulatedContent,
          reasoning: accumulatedReasoning || undefined,
          thinkingDurationMs: accumulatedReasoning ? duration : undefined,
          metrics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const finalizedMessages = [...newMessages, assistantMessage];
        setMessages(finalizedMessages);
        updateSession(currentSessionId!, (s) => ({ ...s, messages: finalizedMessages }));
        setSessions(getStoredSessions());

        setIsStreaming(false);
        setStreamingReasoning('');
        setStreamingContent('');
        setIsThinkingActive(false);
        setThinkingStartTime(null);
        abortControllerRef.current = null;
      },
      (err) => {
        console.error('Inference error:', err);
        if (accumulatedContent) {
          const assistantMessage: Message = {
            id: 'msg-' + Date.now() + '-ai',
            role: 'assistant',
            content: accumulatedContent,
            reasoning: accumulatedReasoning || undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const finalizedMessages = [...newMessages, assistantMessage];
          setMessages(finalizedMessages);
          updateSession(currentSessionId!, (s) => ({ ...s, messages: finalizedMessages }));
          setSessions(getStoredSessions());
        }
        setIsStreaming(false);
        setStreamingReasoning('');
        setStreamingContent('');
        setIsThinkingActive(false);
        setThinkingStartTime(null);
        abortControllerRef.current = null;
      },
      abortController.signal
    );
  };

  // Handle Regenerate Response
  const handleRegenerate = async () => {
    if (messages.length === 0 || isStreaming) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserIdx;
    const truncated = messages.slice(0, actualIdx + 1);
    const lastUserPrompt = truncated[actualIdx].content;

    setMessages(truncated);
    await handleSendMessage(lastUserPrompt);
  };

  // Handle Edit User Message and Resubmit
  const handleSaveEditMessage = async (msgId: string) => {
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx === -1 || !editMessageContent.trim()) {
      setEditingMessageId(null);
      return;
    }

    const previous = messages.slice(0, idx);
    setMessages(previous);
    setEditingMessageId(null);
    await handleSendMessage(editMessageContent.trim());
  };

  // Handle Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingContent || streamingReasoning) {
      const partialMessage: Message = {
        id: 'msg-' + Date.now() + '-stopped',
        role: 'assistant',
        content: streamingContent || '[Generation stopped by user]',
        reasoning: streamingReasoning || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = [...messages, partialMessage];
      setMessages(updated);
      if (activeSessionId) {
        updateSession(activeSessionId, (s) => ({ ...s, messages: updated }));
        setSessions(getStoredSessions());
      }
    }
    setIsStreaming(false);
    setIsThinkingActive(false);
    setThinkingStartTime(null);
  };

  // Handle File Upload
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

  // Voice Input Speech Recognition
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
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Text-To-Speech Reader
  const handleToggleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/```[\\s\\S]*?```/g, 'Code block omitted.').replace(/[#*_`]/g, '');
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

  // Copy with visual checkmark
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Handle input change & slash commands detector
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.startsWith('/') && !val.includes(' ')) {
      setIsSlashMenuOpen(true);
    } else {
      setIsSlashMenuOpen(false);
    }

    // Auto-grow textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setInput(cmd.promptPrefix);
    setIsSlashMenuOpen(false);
    textareaRef.current?.focus();
  };

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === config.model) || AVAILABLE_MODELS[0];
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Filter sessions by search query
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Formatted Markdown & Syntax Blocks
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\\s\\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        return <CodeBlock key={index} language={lang} code={code} />;
      }

      return (
        <div key={index} className="space-y-2 text-xs sm:text-[13.5px] leading-relaxed text-zinc-100 whitespace-pre-wrap font-sans">
          {part.split('\n\n').map((para, pIdx) => {
            if (para.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-sm sm:text-base font-semibold text-white mt-3 mb-1 tracking-wide">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            if (para.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-xs sm:text-sm font-semibold text-zinc-300 mt-2 mb-1">
                  {para.replace('#### ', '')}
                </h4>
              );
            }
            if (para.startsWith('> ')) {
              return (
                <blockquote key={pIdx} className="border-l-2 border-zinc-600 pl-3 py-1 my-1.5 text-zinc-400 italic">
                  {para.replace('> ', '')}
                </blockquote>
              );
            }
            return <p key={pIdx}>{para}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-[#000000] text-white overflow-hidden select-none font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* ================= DYNAMIC PERSISTENT SIDEBAR ================= */}
      <aside
        className={
          (isSidebarOpen
            ? 'translate-x-0 w-72 md:w-64 lg:w-72'
            : '-translate-x-full md:translate-x-0 md:w-0') +
          ' fixed inset-y-0 left-0 md:relative z-40 transition-all duration-300 ease-in-out bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between overflow-hidden flex-shrink-0'
        }
      >
        <div className="p-3.5 sm:p-4 space-y-3.5 flex flex-col h-full overflow-hidden">
          
          {/* Top Brand & Close on Mobile */}
          <div className="flex items-center justify-between px-1 py-1 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <XenoLogo size={24} />
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
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-zinc-500 hover:text-white md:hidden transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleCreateNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Chat History Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          {/* Persistent Real Chat Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1 flex items-center justify-between">
              <span>Conversations ({filteredSessions.length})</span>
            </div>

            {filteredSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = editingSessionId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => !isEditing && handleSelectSession(s.id)}
                  className={
                    'group relative flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-xs ' +
                    (isActive
                      ? 'bg-zinc-800/90 text-white font-medium border border-zinc-700'
                      : 'hover:bg-zinc-900 text-zinc-300 border border-transparent')
                  }
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {s.isPinned && <Pin className="w-3 h-3 text-white flex-shrink-0 fill-white" />}
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onBlur={() => handleSaveRenameSession(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRenameSession(s.id);
                          if (e.key === 'Escape') setEditingSessionId(null);
                        }}
                        className="w-full bg-black px-1.5 py-0.5 rounded text-xs text-white border border-zinc-500 focus:outline-none"
                      />
                    ) : (
                      <span className="truncate flex-1">{s.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename, Pin, Delete) */}
                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 pl-2">
                      <button
                        onClick={(e) => handleTogglePinSession(s.id, e)}
                        className="p-1 hover:text-white text-zinc-400 transition"
                        title={s.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(s.id);
                          setEditTitleInput(s.title);
                        }}
                        className="p-1 hover:text-white text-zinc-400 transition"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="p-1 hover:text-red-400 text-zinc-400 transition"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Engine Status HUD Box */}
          <div className="mt-auto pt-3 border-t border-zinc-800 space-y-1.5 flex-shrink-0">
            <div className="p-2.5 rounded-xl bg-black border border-zinc-800 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[11px]">RUST DAEMON:</span>
                <span className={"font-bold text-[11px] " + (isBackendOnline ? 'text-white' : 'text-zinc-400')}>
                  {isBackendOnline ? 'ONLINE (Axum)' : 'LOCAL ENGINE'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">SPEED:</span>
                <span className="text-zinc-300">{telemetry.avgThroughput} tok/s</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">KV-CACHE:</span>
                <span className="text-zinc-300">{telemetry.vramUsedGb} / {telemetry.vramTotalGb} GB</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ================= MAIN INTERFACE ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between z-20 flex-shrink-0 gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer flex-shrink-0"
              title="Toggle Sidebar (Ctrl+B)"
            >
              <Terminal className="w-4 h-4 text-zinc-300" />
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium transition cursor-pointer max-w-[170px] sm:max-w-none truncate"
              >
                <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                <span className="font-semibold text-zinc-100 truncate">{selectedModel.name}</span>
                <span className="hidden xs:inline px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/10 flex-shrink-0">
                  {selectedModel.badge || '70B'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0e0e11] border border-zinc-700 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, model: model.id }));
                        setIsModelDropdownOpen(false);
                      }}
                      className={
                        "w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 " +
                        (config.model === model.id
                          ? 'bg-zinc-800 border border-zinc-600'
                          : 'hover:bg-zinc-800/50 border border-transparent')
                      }
                    >
                      <div className="w-2.5 h-2.5 rounded-full mt-1 bg-white flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">{model.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{model.params}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{model.tagline}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              <span className={"w-1.5 h-1.5 rounded-full " + (isBackendOnline ? 'bg-white animate-pulse' : 'bg-zinc-500')} />
              <span className="text-zinc-400">
                {isBackendOnline ? 'Rust Axum (Port 3001)' : 'Local Engine'}
              </span>
            </div>
          </div>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            
            {/* Export Session Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
                title="Export conversation"
              >
                <Download className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#0e0e11] border border-zinc-700 shadow-2xl p-1.5 z-50 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      if (activeSession) exportSessionAsMarkdown(activeSession);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition text-zinc-200"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => {
                      if (activeSession) exportSessionAsJson(activeSession);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition text-zinc-200"
                  >
                    JSON (.json)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              title="Replay intro animation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Intro</span>
            </button>

            <button
              onClick={() => setIsTelemetryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              title="View live engine telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden md:inline">Telemetry</span>
            </button>

            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
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

        {/* ================= MESSAGE STREAM CONTAINER ================= */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Welcome Screen when conversation is empty */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4 sm:space-y-6 my-auto select-none py-4">
              <div className="w-full max-w-[160px] sm:max-w-[220px] md:max-w-[260px] aspect-[1104/1380]">
                <ButterflySvg className="w-full h-full" />
              </div>

              <div className="space-y-1 sm:space-y-1.5 px-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full pt-1">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition group cursor-pointer space-y-1"
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

          {/* Message List */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isEditingThis = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={
                  'flex gap-2.5 sm:gap-4 max-w-4xl mx-auto ' +
                  (isUser ? 'justify-end' : 'justify-start')
                }
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shadow-sm">
                    <XenoLogo size={18} />
                  </div>
                )}

                <div
                  className={
                    'flex flex-col space-y-1.5 sm:space-y-2 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ' +
                    (isUser ? 'items-end' : 'items-start')
                  }
                >
                  {/* Attachments chips */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {msg.attachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                        >
                          <Paperclip className="w-3 h-3 text-zinc-400" />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble Body */}
                  <div
                    className={
                      'rounded-2xl p-3.5 sm:p-5 select-text shadow-xl ' +
                      (isUser
                        ? 'bg-zinc-100 text-black font-normal rounded-tr-none'
                        : 'bg-[#0b0b0e] border border-zinc-800 text-zinc-100 rounded-tl-none')
                    }
                  >
                    {!isUser && msg.reasoning && (
                      <ThinkingBlock
                        reasoning={msg.reasoning}
                        isThinking={false}
                        durationMs={msg.thinkingDurationMs}
                      />
                    )}

                    {isUser ? (
                      isEditingThis ? (
                        <div className="space-y-2 w-full min-w-[260px] sm:min-w-[340px]">
                          <textarea
                            value={editMessageContent}
                            onChange={(e) => setEditMessageContent(e.target.value)}
                            className="w-full p-2 bg-white text-black rounded-lg text-xs font-sans border border-zinc-400 focus:outline-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="px-2.5 py-1 rounded text-[11px] text-zinc-600 hover:text-black transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditMessage(msg.id)}
                              className="px-3 py-1 rounded bg-black text-white text-[11px] font-semibold transition"
                            >
                              Save & Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  {/* Metadata and Action Icons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-1 text-[11px] font-mono text-zinc-500">
                    <span>{msg.timestamp}</span>

                    {!isUser && msg.metrics && (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-zinc-300" />
                        {msg.metrics.tokensPerSec} tok/s • TTFT: {msg.metrics.ttftMs}ms • {msg.metrics.tokens} tokens
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 ml-1">
                      {isUser && !isEditingThis && (
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditMessageContent(msg.content);
                          }}
                          className="hover:text-white transition cursor-pointer p-0.5"
                          title="Edit message"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}

                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="hover:text-white transition cursor-pointer p-0.5"
                            title="Copy response"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.content)}
                            className={
                              'hover:text-white transition cursor-pointer p-0.5 ' +
                              (speakingMessageId === msg.id ? 'text-white animate-pulse' : '')
                            }
                            title="Read aloud"
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3 h-3" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={handleRegenerate}
                            className="hover:text-white transition cursor-pointer p-0.5"
                            title="Regenerate response"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
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

          {/* ACTIVE STREAMING BUBBLE */}
          {isStreaming && (
            <div className="flex gap-2.5 sm:gap-4 max-w-4xl mx-auto justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shadow-sm">
                <XenoLogo size={18} />
              </div>

              <div className="flex flex-col space-y-1.5 sm:space-y-2 max-w-[92%] sm:max-w-[85%] md:max-w-[80%]">
                <div className="rounded-2xl p-3.5 sm:p-5 bg-[#0b0b0e] border border-zinc-800 text-zinc-100 rounded-tl-none shadow-xl">
                  {(streamingReasoning || isThinkingActive) && (
                    <ThinkingBlock
                      reasoning={streamingReasoning}
                      isThinking={isThinkingActive}
                      durationMs={liveThinkingDurationMs}
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

        {/* ================= MODERN CHAT INPUT OMNIBAR ================= */}
        <footer className="p-3 sm:p-5 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent z-20 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-2 relative">
            
            {/* Slash Commands Dropdown Popover */}
            {isSlashMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full sm:w-96 rounded-2xl bg-[#0e0e11] border border-zinc-700 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Slash Actions
                </div>
                {SLASH_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => handleSelectSlashCommand(cmd)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{cmd.command} • {cmd.label}</div>
                      <div className="text-[10px] text-zinc-400">{cmd.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Attachments Preview Chips */}
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

            {/* Omnibar Box */}
            <div className="relative rounded-2xl bg-[#09090b] border border-zinc-800 focus-within:border-zinc-600 shadow-2xl transition duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={"Ask " + selectedModel.name + " anything, or type '/' for slash commands..."}
                rows={1}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-44 overflow-y-auto leading-relaxed"
                style={{ minHeight: '52px' }}
              />

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 sm:pb-3 pt-1 border-t border-zinc-800/60">
                
                {/* Left Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
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
                    className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Attach text, code or prompt files"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={
                      'p-1.5 sm:p-2 rounded-xl transition cursor-pointer ' +
                      (isListening
                        ? 'bg-white/20 text-white animate-pulse border border-white/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800')
                    }
                    title="Voice dictation"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Deep Reasoning Switcher */}
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, enableReasoning: !prev.enableReasoning }))}
                    className={
                      'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ' +
                      (config.enableReasoning
                        ? 'bg-zinc-800 border border-zinc-600 text-white'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300')
                    }
                  >
                    <Sparkles className="w-3 h-3 text-zinc-300" />
                    <span className="hidden sm:inline">Reasoning</span>
                  </button>
                </div>

                {/* Right Controls */}
                <div>
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer border border-zinc-700"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!input.trim() && attachments.length === 0}
                      onClick={() => handleSendMessage()}
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white hover:bg-zinc-200 text-black transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Model & Latency Footnote */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-500 px-1">
              <span>{selectedModel.name} ({selectedModel.contextWindow} context)</span>
              <span>{input.length} chars</span>
            </div>

          </div>
        </footer>

      </div>

      {/* ================= MODALS ================= */}
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
