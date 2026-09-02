import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  Sliders,
  Plus,
  Mic,
  Paperclip,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  Zap,
  Trash2,
  Edit2,
  Pin,
  Search,
  RefreshCw,
  Sparkles,
  X,
  Globe,
  Key,
  PanelLeft,
  AlertTriangle,
} from 'lucide-react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';
import { ThinkingBlock } from './ThinkingBlock';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CanvasPanel } from './CanvasPanel';
import { SettingsModal } from './SettingsModal';
import { VoiceVisualizer } from './VoiceVisualizer';
import type {
  Message,
  InferenceConfig,
  FileAttachment,
  ChatSession,
  SlashCommand,
  LLMProvider,
} from '../types';
import {
  AVAILABLE_MODELS,
  checkBackendHealth,
  streamChatInference,
} from '../services/api';
import {
  getStoredSessions,
  getActiveSessionId,
  setActiveSessionId,
  createSession,
  updateSession,
  deleteSession,
} from '../services/storage';

interface ChatInterfaceProps {
  onReplayIntro: () => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: '/explain', label: 'Explain Concept', description: 'Deep technical breakdown of algorithms or systems', promptPrefix: 'Explain in rigorous technical detail: ' },
  { command: '/code', label: 'Write Code', description: 'Production-ready Rust, TypeScript, or Python modules', promptPrefix: 'Write a clean, optimized implementation of: ' },
  { command: '/debug', label: 'Debug & Fix', description: 'Inspect concurrency, memory, or syntax bugs', promptPrefix: 'Analyze, debug, and provide fixes for: ' },
  { command: '/summarize', label: 'Summarize', description: 'Distill complex concepts into key architecture points', promptPrefix: 'Summarize the core technical findings of: ' },
  { command: '/canvas', label: 'Create Artifact', description: 'Generate a standalone modular file in Canvas', promptPrefix: 'Generate a comprehensive modular file artifact for: ' },
];

const STARTER_PROMPTS = [
  {
    title: 'High-Performance Rust SSE',
    desc: 'Axum SSE streaming server for ultra-low latency token generation',
    prompt: 'Show me how to build an ultra-fast Server-Sent Events (SSE) AI inference streaming handler in Rust with Axum and Tokio.',
  },
  {
    title: 'FlashAttention & KV-Cache',
    desc: 'Mathematical formulation of FlashAttention-3 & PagedAttention',
    prompt: 'Derive the mathematical formulation of FlashAttention-3 and explain how PagedAttention solves KV-cache VRAM fragmentation.',
  },
  {
    title: 'Mixed-Precision Quantization',
    desc: 'FP8 & BF16 tensor kernels for autoregressive decoding',
    prompt: 'How does mixed precision quantization (FP8 / BF16) reduce memory bandwidth pressure during LLM autoregressive decoding?',
  },
  {
    title: 'Modern Distributed Systems',
    desc: 'Zero-copy IPC and asynchronous message pipelines',
    prompt: 'Design a clean architecture connecting a TypeScript React frontend to a native Rust inference daemon over zero-copy IPC.',
  },
];

const CONFIG_STORAGE_KEY = 'xeno_inference_config_v2';

export const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [config, setConfig] = useState<InferenceConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      provider: 'openrouter' as LLMProvider,
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      rustBackendUrl: 'http://127.0.0.1:3001',
      model: 'deepseek-r1',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      systemPrompt: 'You are an ultra-advanced AI reasoning engine. Provide structured, accurate, and deeply insightful responses with clean code.',
      stream: true,
      enableReasoning: true,
      webSearch: false,
    };
  });

  // Save config on changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  // Persistent Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Active Messages & Generation State
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

  // Interactive Canvas State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState('Artifact');
  const [canvasLanguage, setCanvasLanguage] = useState('rust');
  const [canvasContent, setCanvasContent] = useState('');

  // Slash Commands & Input UI
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Live Provider Status
  const [providerStatus, setProviderStatus] = useState<{
    connected: boolean;
    label: string;
  }>({
    connected: false,
    label: 'Checking connection...',
  });

  // Modals & Navigation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

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

  // Keyboard shortcuts: Ctrl+B / Cmd+B (Sidebar), Ctrl+, / Cmd+, (Settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check Active Provider Status
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (config.provider === 'rust_engine') {
        const online = await checkBackendHealth(config.rustBackendUrl);
        if (isMounted) {
          setProviderStatus({
            connected: online,
            label: online ? 'Rust Daemon (3001)' : 'Rust Engine (Offline)',
          });
        }
        return;
      }

      if (config.provider === 'ollama') {
        try {
          const res = await fetch(`${config.baseUrl || 'http://localhost:11434'}/api/tags`);
          if (isMounted) {
            setProviderStatus({
              connected: res.ok,
              label: res.ok ? 'Ollama (Local)' : 'Ollama (Offline)',
            });
          }
        } catch {
          if (isMounted) {
            setProviderStatus({ connected: false, label: 'Ollama (Offline)' });
          }
        }
        return;
      }

      // Cloud Providers
      const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 4);
      if (isMounted) {
        setProviderStatus({
          connected: hasKey,
          label: hasKey
            ? `${config.provider.toUpperCase()} (Connected)`
            : `${config.provider.toUpperCase()} (Key Required)`,
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.provider, config.apiKey, config.baseUrl, config.rustBackendUrl]);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  // Switch Session
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
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // Create New Session
  const handleCreateNewSession = () => {
    if (isStreaming) handleStopGeneration();
    const newSession = createSession(config.model, 'New Conversation');
    setSessions(getStoredSessions());
    setActiveSessionIdState(newSession.id);
    setMessages([]);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // Delete Session
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

  // Pin Session
  const handleTogglePinSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = updateSession(sessionId, (s) => ({ ...s, isPinned: !s.isPinned }));
    setSessions(updated);
  };

  // Rename Session
  const handleSaveRenameSession = (sessionId: string) => {
    if (!editTitleInput.trim()) {
      setEditingSessionId(null);
      return;
    }
    const updated = updateSession(sessionId, (s) => ({ ...s, title: editTitleInput.trim() }));
    setSessions(updated);
    setEditingSessionId(null);
  };

  // Open Artifact in Canvas
  const handleOpenInCanvas = (title: string, language: string, code: string) => {
    setCanvasTitle(title);
    setCanvasLanguage(language);
    setCanvasContent(code);
    setIsCanvasOpen(true);
  };

  // Send Prompt
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText && attachments.length === 0) return;
    if (isStreaming) return;

    if (!providerStatus.connected) {
      setIsSettingsOpen(true);
      return;
    }

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

        // Extract code block for Canvas if present
        if (accumulatedContent.includes('```')) {
          const match = accumulatedContent.match(/```(\w+)?\n([\s\S]*?)```/);
          if (match) {
            setCanvasLanguage(match[1] || 'code');
            setCanvasContent(match[2]);
            setCanvasTitle('Generated Artifact');
          }
        }

        setIsStreaming(false);
        setStreamingReasoning('');
        setStreamingContent('');
        setIsThinkingActive(false);
        setThinkingStartTime(null);
        abortControllerRef.current = null;
      },
      (err) => {
        console.error('Inference error:', err);
        const errorContent = `**Connection Error:** ${err.message}\n\nPlease click **Settings** to configure your **${config.provider.toUpperCase()}** API Key.`;

        const assistantMessage: Message = {
          id: 'msg-' + Date.now() + '-ai-error',
          role: 'assistant',
          content: errorContent,
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
      abortController.signal
    );
  };

  // Regenerate Response
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

  // Save Edited Message and Resubmit
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

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingContent || streamingReasoning) {
      const partialMessage: Message = {
        id: 'msg-' + Date.now() + '-stopped',
        role: 'assistant',
        content: streamingContent || '[Stopped]',
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

  // File Upload
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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput((prev) => (prev ? prev + ' ' + event.results[i][0].transcript : event.results[i][0].transcript));
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
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

  // Copy with visual checkmark
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Handle Input Changes & Slash Detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.startsWith('/') && !val.includes(' ')) {
      setIsSlashMenuOpen(true);
    } else {
      setIsSlashMenuOpen(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setInput(cmd.promptPrefix);
    setIsSlashMenuOpen(false);
    textareaRef.current?.focus();
  };

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === config.model) || AVAILABLE_MODELS[0];

  // Filter Sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[100dvh] w-screen bg-[#000000] text-white overflow-hidden select-none font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* ================= MINIMALIST SIDEBAR ================= */}
      <aside
        className={
          (isSidebarOpen
            ? 'translate-x-0 w-72 md:w-64 lg:w-72'
            : '-translate-x-full lg:translate-x-0 lg:w-0') +
          ' fixed inset-y-0 left-0 lg:relative z-40 transition-all duration-300 ease-in-out bg-[#08080a] border-r border-zinc-800/80 flex flex-col justify-between overflow-hidden flex-shrink-0'
        }
      >
        <div className="p-3.5 space-y-3 flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 py-1 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <XenoLogo size={22} />
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
              className="p-1 text-zinc-500 hover:text-white transition cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleCreateNewSession}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* Search Conversations */}
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          {/* Real Chat Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
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
                      ? 'bg-zinc-800/80 text-white font-medium'
                      : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200')
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

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 pl-1">
                      <button
                        onClick={(e) => handleTogglePinSession(s.id, e)}
                        className="p-1 hover:text-white text-zinc-500 transition"
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
                        className="p-1 hover:text-white text-zinc-500 transition"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="p-1 hover:text-red-400 text-zinc-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Area: Settings & Provider Configuration */}
          <div className="mt-auto pt-2.5 border-t border-zinc-800/80 space-y-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Settings & API Keys</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${providerStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-2 py-0.5">
              <span>{config.provider.toUpperCase()}</span>
              <span>{providerStatus.connected ? 'ONLINE' : 'CONFIG NEEDED'}</span>
            </div>
          </div>

        </div>
      </aside>

      {/* ================= MAIN CHAT FEED ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        
        {/* CLEAN, MINIMAL HEADER */}
        <header className="h-14 border-b border-zinc-800/60 bg-[#000000]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
          
          {/* Left: Sidebar Toggle & Model / Provider Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer flex items-center gap-1.5"
              title="Toggle sidebar (Ctrl+B)"
            >
              <PanelLeft className="w-4 h-4 text-zinc-300" />
            </button>

            {/* Model / Provider Selector */}
            <div className="relative min-w-0">
              {providerStatus.connected ? (
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-xs font-medium transition cursor-pointer truncate"
                >
                  <span className="font-semibold text-zinc-100 truncate">{selectedModel.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/10 flex-shrink-0">
                    {selectedModel.badge}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Connect Provider</span>
                </button>
              )}

              {isModelDropdownOpen && providerStatus.connected && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-h-[50vh] overflow-y-auto rounded-2xl bg-[#0c0c10] border border-zinc-700 shadow-2xl p-1.5 z-50 animate-fade-in space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    Select Model ({config.provider.toUpperCase()})
                  </div>
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, model: model.id }));
                        setIsModelDropdownOpen(false);
                      }}
                      className={
                        "w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 " +
                        (config.model === model.id
                          ? 'bg-zinc-800/80 border border-zinc-600'
                          : 'hover:bg-zinc-900/60 border border-transparent')
                      }
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 bg-white flex-shrink-0" />
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
          </div>

          {/* Right: Quick New Chat Shortcut */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleCreateNewSession}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* ================= MESSAGE STREAM ================= */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Welcome Screen (Never clipped, ample header breathing room) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 sm:space-y-5 my-auto select-none py-2 sm:py-4">
              <div className="w-24 sm:w-32 md:w-36 aspect-[1104/1380] mx-auto flex-shrink-0 relative">
                <ButterflySvg className="w-full h-full object-contain" />
              </div>

              <div className="space-y-1 px-2">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="font-roman text-3xl sm:text-4xl font-extrabold tracking-widest text-white">
                    XENO
                  </span>
                  <span className="font-calligraphy text-4xl sm:text-5xl text-zinc-300">
                    Inference
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {providerStatus.connected
                    ? `Ready for input using ${selectedModel.name} on ${config.provider.toUpperCase()}.`
                    : 'Connect your API key or local Ollama / Rust engine to begin.'}
                </p>

                {!providerStatus.connected && (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono cursor-pointer hover:bg-amber-950/50 transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Configure {config.provider.toUpperCase()} API Key</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-600 text-left transition group cursor-pointer space-y-1"
                  >
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <Zap className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Flow */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isEditingThis = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={
                  'flex w-full group ' +
                  (isUser ? 'justify-end' : 'justify-start')
                }
              >
                {/* Assistant Message (Seamless Flow, Unboxed) */}
                {!isUser ? (
                  <div className="flex gap-3 sm:gap-4 max-w-full w-full">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center p-1 mt-1">
                      <XenoLogo size={16} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {msg.reasoning && (
                        <ThinkingBlock
                          reasoning={msg.reasoning}
                          isThinking={false}
                          durationMs={msg.thinkingDurationMs}
                        />
                      )}

                      <div className="text-zinc-100 leading-relaxed font-sans">
                        <MarkdownRenderer content={msg.content} onOpenCanvas={handleOpenInCanvas} />
                      </div>

                      {/* Micro Action Bar */}
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-zinc-500">
                        {msg.metrics && (
                          <span className="text-zinc-500 flex items-center gap-1">
                            {msg.metrics.tokensPerSec} tok/s • {msg.metrics.tokens} tokens
                          </span>
                        )}

                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="hover:text-white transition cursor-pointer p-0.5"
                            title="Copy text"
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
                            title="Regenerate"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* User Message: Sleek Capsule with Full Markdown Rendering */
                  <div className="flex flex-col items-end space-y-1.5 max-w-[85%] sm:max-w-[75%]">
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {msg.attachments.map((att, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                          >
                            <Paperclip className="w-3 h-3 text-zinc-400" />
                            <span>{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isEditingThis ? (
                      <div className="space-y-2 w-full min-w-[280px]">
                        <textarea
                          value={editMessageContent}
                          onChange={(e) => setEditMessageContent(e.target.value)}
                          className="w-full p-2.5 bg-black text-white rounded-xl text-xs border border-zinc-600 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 rounded text-[11px] text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditMessage(msg.id)}
                            className="px-3 py-1 rounded bg-white text-black text-[11px] font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl px-4 py-2.5 bg-zinc-800/80 border border-zinc-700/60 text-zinc-100 text-xs sm:text-[13.5px] leading-relaxed select-text shadow-sm">
                        <MarkdownRenderer content={msg.content} onOpenCanvas={handleOpenInCanvas} />
                      </div>
                    )}

                    {!isEditingThis && (
                      <div className="flex items-center gap-2 pr-2 opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-zinc-500">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditMessageContent(msg.content);
                          }}
                          className="hover:text-white transition p-0.5"
                          title="Edit question"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ACTIVE STREAMING */}
          {isStreaming && (
            <div className="flex gap-3 sm:gap-4 max-w-full w-full">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center p-1 mt-1">
                <XenoLogo size={16} />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {(streamingReasoning || isThinkingActive) && (
                  <ThinkingBlock
                    reasoning={streamingReasoning}
                    isThinking={isThinkingActive}
                    durationMs={liveThinkingDurationMs}
                  />
                )}

                {streamingContent ? (
                  <div className="text-zinc-100 leading-relaxed font-sans">
                    <MarkdownRenderer content={streamingContent} onOpenCanvas={handleOpenInCanvas} />
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-white animate-pulse align-middle" />
                  </div>
                ) : !streamingReasoning ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Streaming live tokens from {config.provider.toUpperCase()}...</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* ================= MODERN FLOATING OMNIBAR ================= */}
        <footer className="p-3 sm:p-5 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent z-20 flex-shrink-0">
          <div className="max-w-3xl mx-auto space-y-2 relative">
            
            {/* Live Audio Visualizer Graph when listening */}
            <VoiceVisualizer isListening={isListening} onStop={toggleVoiceInput} />

            {/* Slash Commands Menu */}
            {isSlashMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full sm:w-80 rounded-2xl bg-[#0c0c10] border border-zinc-700 shadow-2xl p-1.5 z-50 animate-fade-in space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-zinc-500">
                  Quick Prompts
                </div>
                {SLASH_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => handleSelectSlashCommand(cmd)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{cmd.command} • {cmd.label}</div>
                      <div className="text-[10px] text-zinc-400">{cmd.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Attachments Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                  >
                    <Paperclip className="w-3 h-3 text-zinc-400" />
                    <span>{att.name}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-500 hover:text-white transition cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Floating Pill Capsule Omnibar */}
            <div className="relative rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-white/10 shadow-2xl transition-all duration-200 p-2 sm:p-2.5">
              
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
                placeholder={
                  providerStatus.connected
                    ? `Message ${selectedModel.name}...`
                    : `Configure provider & API key in Settings to begin...`
                }
                rows={1}
                className="w-full px-3 py-1.5 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-40 overflow-y-auto leading-relaxed"
                style={{ minHeight: '38px' }}
              />

              {/* Bottom Quick Controls */}
              <div className="flex items-center justify-between pt-1 px-1">
                
                {/* Left Controls: Attach, Search, Reasoning */}
                <div className="flex items-center gap-1">
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
                    className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Add file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, webSearch: !prev.webSearch }))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      config.webSearch
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Toggle web search"
                  >
                    <Globe className="w-3 h-3" />
                    <span className="hidden sm:inline">Search</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, enableReasoning: !prev.enableReasoning }))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      config.enableReasoning
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Deep reasoning mode"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">Deep Think</span>
                  </button>
                </div>

                {/* Right Controls: Voice & Circular Send / Stop Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={
                      'p-1.5 rounded-full transition cursor-pointer ' +
                      (isListening
                        ? 'bg-white/20 text-white animate-pulse'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10')
                    }
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition cursor-pointer"
                      title="Stop generating"
                    >
                      <Square className="w-3 h-3 fill-black" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!input.trim() && attachments.length === 0}
                      onClick={() => handleSendMessage()}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
                      title="Send prompt"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-zinc-600">
              {providerStatus.connected ? (
                <span>Provider: {config.provider.toUpperCase()} • Model: {selectedModel.name} • {selectedModel.contextWindow}</span>
              ) : (
                <span className="text-amber-400/80">Provider not connected. Press Ctrl+, to open Settings</span>
              )}
            </div>

          </div>
        </footer>

      </div>

      {/* ================= ARTIFACT CANVAS PANEL ================= */}
      <CanvasPanel
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        title={canvasTitle}
        language={canvasLanguage}
        content={canvasContent}
        onChangeContent={setCanvasContent}
        onInsertIntoChat={(text) => {
          setInput((prev) => (prev ? prev + '\n\n' + text : text));
          setIsCanvasOpen(false);
        }}
      />

      {/* ================= SETTINGS MODAL ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChange={setConfig}
      />

    </div>
  );
};
