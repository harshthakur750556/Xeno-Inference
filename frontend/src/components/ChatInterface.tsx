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
  Wrench,
  Code2,
  Layers,
  Trophy,
  Newspaper,
  LogOut,
  User,
  Lock,
  Gauge,
} from 'lucide-react';
import { ButterflySvg } from './ButterflySvg';
import { XenoLogo } from './XenoLogo';
import { ThinkingBlock } from './ThinkingBlock';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CanvasPanel } from './CanvasPanel';
import { SettingsModal } from './SettingsModal';
import { VoiceVisualizer } from './VoiceVisualizer';
import { LeaderboardModal } from './LeaderboardModal';
import { AiNewsModal } from './AiNewsModal';
import { WebBrowserPanel } from './WebBrowserPanel';
import { BenchmarkModal } from './BenchmarkModal';
import { AuthModal } from './AuthModal';
import type { UserProfile } from './AuthModal';
import type {
  Message,
  InferenceConfig,
  FileAttachment,
  ChatSession,
  SlashCommand,
  LLMProvider,
  ModelOption,
} from '../types';
import {
  checkBackendHealth,
  streamChatInference,
  fetchProviderModels,
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
  { command: '/benchmark', label: 'Run Benchmark', description: 'Test hardware latency, TTFT and throughput', promptPrefix: 'Run a performance and throughput benchmark on this engine.' },
  { command: '/leaderboard', label: 'Model Leaderboard', description: 'Open Artificial Analysis & arena.ai leaderboard', promptPrefix: 'Show me the latest model intelligence leaderboard and rankings.' },
  { command: '/search', label: 'Web Search', description: 'Search live web and research papers', promptPrefix: 'Search the live web for: ' },
];

const CONFIG_STORAGE_KEY = 'xeno_inference_config_v2';
const USER_STORAGE_KEY = 'xeno_user_profile_v2';
const LOGGED_OUT_STORAGE_KEY = 'xeno_user_logged_out';

export const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  // Google Authentication State (Strictly blocks auto-login if user logged out)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem(LOGGED_OUT_STORAGE_KEY) === 'true';
      if (isLoggedOut) return null;
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      model: '',
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

  // Side-by-Side Interactive Split Panels State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState('Artifact');
  const [canvasLanguage, setCanvasLanguage] = useState('rust');
  const [canvasContent, setCanvasContent] = useState('');

  // Split Web Browser Panel State
  const [isWebBrowserOpen, setIsWebBrowserOpen] = useState(false);
  const [webBrowserInitialQuery, setWebBrowserInitialQuery] = useState('');

  // Leaderboard & News Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  // Tools Menu Popover State (with click-outside auto-close)
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Slash Commands & Input UI
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Live Provider Status & Dynamic Models Discovered from Provider
  const [providerStatus, setProviderStatus] = useState<{
    connected: boolean;
    label: string;
  }>({
    connected: false,
    label: 'No Provider Connected',
  });
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(() => {
    try {
      const cached = localStorage.getItem('xeno_provider_models');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [modelSearch, setModelSearch] = useState('');

  // Modals & Navigation (COLLAPSED ON DEFAULT ON ALL SCREENS)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed on default!

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechBaseInputRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);

  // Global click-outside & Escape key handlers to ensure menus are never stuck open
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isToolsMenuOpen && toolsMenuRef.current && !toolsMenuRef.current.contains(target)) {
        setIsToolsMenuOpen(false);
      }
      if (isModelDropdownOpen && modelDropdownRef.current && !modelDropdownRef.current.contains(target)) {
        setIsModelDropdownOpen(false);
      }
      if (isSlashMenuOpen && slashMenuRef.current && !slashMenuRef.current.contains(target)) {
        setIsSlashMenuOpen(false);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsToolsMenuOpen(false);
        setIsModelDropdownOpen(false);
        setIsSlashMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isToolsMenuOpen, isModelDropdownOpen, isSlashMenuOpen]);

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
        handleOpenSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // Handle Google Login & Logout
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.removeItem(LOGGED_OUT_STORAGE_KEY);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.setItem(LOGGED_OUT_STORAGE_KEY, 'true'); // Block auto login
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Check Active Provider Status & Reach out to provider API to discover available models
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (config.provider === 'rust_engine') {
        const online = await checkBackendHealth(config.rustBackendUrl);
        if (isMounted) {
          setProviderStatus({
            connected: online,
            label: online ? 'Rust Engine Online' : 'Rust Engine Offline',
          });
        }
      } else if (config.provider === 'ollama') {
        try {
          const res = await fetchProviderModels('ollama', undefined, config.baseUrl);
          if (isMounted) {
            if (res.connected && res.models.length > 0) {
              setAvailableModels(res.models);
              setProviderStatus({
                connected: true,
                label: `Ollama Local (${res.models.length} models)`,
              });
              if (!config.model || !res.models.some((m) => m.id === config.model)) {
                setConfig((prev) => ({ ...prev, model: res.models[0].id }));
              }
            } else {
              setProviderStatus({
                connected: false,
                label: 'Ollama Offline',
              });
            }
          }
        } catch {
          if (isMounted) {
            setProviderStatus({
              connected: false,
              label: 'Ollama Offline',
            });
          }
        }
      } else {
        // Cloud providers (openrouter, groq, deepseek, openai, custom)
        if (!config.apiKey || !config.apiKey.trim()) {
          if (isMounted) {
            setProviderStatus({
              connected: false,
              label: 'No Provider Connected',
            });
            setAvailableModels([]);
            if (config.model) {
              setConfig((prev) => ({ ...prev, model: '' }));
            }
          }
          return;
        }

        // Has API key: reach out to provider to discover available models!
        try {
          const res = await fetchProviderModels(config.provider, config.apiKey, config.baseUrl);
          if (isMounted) {
            if (res.connected && res.models.length > 0) {
              setAvailableModels(res.models);
              localStorage.setItem('xeno_provider_models', JSON.stringify(res.models));
              setProviderStatus({
                connected: true,
                label: `${config.provider.toUpperCase()} Online (${res.models.length} models)`,
              });
              if (!config.model || !res.models.some((m) => m.id === config.model)) {
                setConfig((prev) => ({ ...prev, model: res.models[0].id }));
              }
            } else {
              setProviderStatus({
                connected: false,
                label: res.message || `${config.provider.toUpperCase()} Auth Failed`,
              });
            }
          }
        } catch {
          if (isMounted) {
            setProviderStatus({
              connected: false,
              label: `${config.provider.toUpperCase()} Disconnected`,
            });
          }
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
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

  // Open Artifact in Canvas (Strictly closes browser and collapses sidebar on smaller screens)
  const handleOpenInCanvas = (title: string, language: string, code: string) => {
    setCanvasTitle(title);
    setCanvasLanguage(language);
    setCanvasContent(code);
    setIsCanvasOpen(true);
    setIsWebBrowserOpen(false);
    setIsToolsMenuOpen(false);
    if (window.innerWidth < 1200) {
      setIsSidebarOpen(false);
    }
  };

  // Open Split Web Browser with Query (Strictly closes canvas and collapses sidebar on smaller screens)
  const handleOpenWebBrowser = (query?: string) => {
    setWebBrowserInitialQuery(query || '');
    setIsWebBrowserOpen(true);
    setIsCanvasOpen(false);
    setIsToolsMenuOpen(false);
    if (window.innerWidth < 1200) {
      setIsSidebarOpen(false);
    }
  };

  // Standard paste handler - Allows unrestricted, natural pasting into the input box
  const handleTextareaPaste = () => {
    // Native paste is permitted without hijacking
  };

  // Send Prompt
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText && attachments.length === 0) return;
    if (isStreaming) return;

    if (!providerStatus.connected) {
      handleOpenSettings();
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
    setIsToolsMenuOpen(false);

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

        // Autonomous AI Tool Execution (Open Browser / Open Canvas / Leaderboard / News / Benchmark)
        if (accumulatedContent.includes('[TOOL:OPEN_BROWSER')) {
          const match = accumulatedContent.match(/\[TOOL:OPEN_BROWSER query="([^"]+)"\]/);
          if (match && match[1]) {
            handleOpenWebBrowser(match[1]);
          }
        }

        if (accumulatedContent.includes('[TOOL:OPEN_CANVAS')) {
          const canvasMatch = accumulatedContent.match(/\[TOOL:OPEN_CANVAS title="([^"]*)" language="([^"]*)"\]([\s\S]*?)(\[\/TOOL:OPEN_CANVAS\]|$)/);
          if (canvasMatch) {
            handleOpenInCanvas(
              canvasMatch[1] || 'Generated Artifact',
              canvasMatch[2] || 'code',
              canvasMatch[3] ? canvasMatch[3].trim() : ''
            );
          }
        }

        if (accumulatedContent.includes('[TOOL:SHOW_LEADERBOARD]')) {
          setIsLeaderboardOpen(true);
        }

        if (accumulatedContent.includes('[TOOL:SHOW_NEWS]')) {
          setIsNewsOpen(true);
        }

        if (accumulatedContent.includes('[TOOL:RUN_BENCHMARK]')) {
          setIsBenchmarkOpen(true);
        }
      },
      (metrics) => {
        const duration = Date.now() - startGenTime;
        
        // Clean any tool markup so the visible message is pristine
        const cleanContent = accumulatedContent
          .replace(/\[TOOL:OPEN_BROWSER query="[^"]+"\]/g, '')
          .replace(/\[TOOL:OPEN_CANVAS title="[^"]*" language="[^"]*"\]([\s\S]*?)\[\/TOOL:OPEN_CANVAS\]/g, '$1')
          .replace(/\[TOOL:OPEN_CANVAS[^\]]*\]/g, '')
          .replace(/\[\/TOOL:OPEN_CANVAS\]/g, '')
          .replace(/\[TOOL:SHOW_LEADERBOARD\]/g, '')
          .replace(/\[TOOL:SHOW_NEWS\]/g, '')
          .replace(/\[TOOL:RUN_BENCHMARK\]/g, '')
          .trim();

        const assistantMessage: Message = {
          id: 'msg-' + Date.now() + '-ai',
          role: 'assistant',
          content: cleanContent,
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

  // Voice Input Speech Recognition (Real-Time Live Speech-to-Text)
  const toggleVoiceInput = () => {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    // If currently listening, stop immediately
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognitionRef.current = recognition;
      isListeningRef.current = true;
      speechBaseInputRef.current = input;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal pause in speech, don't abort
          return;
        }
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permission in your browser URL bar.');
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (finalTranscript) {
          speechBaseInputRef.current = (speechBaseInputRef.current ? speechBaseInputRef.current + ' ' : '') + finalTranscript.trim();
        }

        const fullCurrent = (speechBaseInputRef.current + (interimTranscript ? ' ' + interimTranscript : '')).trim();
        setInput(fullCurrent);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition initiation error:', err);
      setIsListening(false);
      isListeningRef.current = false;
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
    setIsSlashMenuOpen(false);
    if (cmd.command === '/benchmark') {
      setIsBenchmarkOpen(true);
      setInput('');
      return;
    }
    if (cmd.command === '/leaderboard') {
      setIsLeaderboardOpen(true);
      setInput('');
      return;
    }
    if (cmd.command === '/search') {
      handleOpenWebBrowser();
      setInput('');
      return;
    }
    if (cmd.command === '/canvas') {
      handleOpenInCanvas('New Artifact', 'rust', '// Interactive Canvas Workspace\n');
      setInput('');
      return;
    }
    setInput(cmd.promptPrefix);
    textareaRef.current?.focus();
  };

  const selectedModel: ModelOption =
    availableModels.find((m) => m.id === config.model) ||
    availableModels[0] || {
      id: config.model || '',
      name: config.model ? config.model.split('/').pop()?.toUpperCase() || config.model : 'Select Model',
      provider: config.provider ? config.provider.toUpperCase() : 'NO PROVIDER',
      contextWindow: '128k',
    };

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

      {/* ================= MINIMALIST SIDEBAR (COLLAPSED ON DEFAULT) ================= */}
      <aside
        className={
          (isSidebarOpen
            ? 'translate-x-0 w-72 md:w-64 lg:w-72 border-r border-zinc-800/80 opacity-100 pointer-events-auto'
            : '-translate-x-full lg:translate-x-0 lg:w-0 border-r-0 opacity-0 pointer-events-none') +
          ' fixed inset-y-0 left-0 lg:relative z-40 transition-all duration-300 ease-in-out bg-[#08080a] flex flex-col justify-between overflow-hidden flex-shrink-0'
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

          {/* Navigation Links: Leaderboard & AI News */}
          <div className="space-y-1 flex-shrink-0">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span>Leaderboard & Benchmarks</span>
            </button>

            <button
              onClick={() => setIsNewsOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <Newspaper className="w-3.5 h-3.5 text-white" />
              <span>AI Releases & News</span>
            </button>
          </div>

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

          {/* Bottom Area: User Google Account Card & Settings */}
          <div className="mt-auto pt-2.5 border-t border-zinc-800/80 space-y-2 flex-shrink-0">
            
            {/* User Profile Card */}
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate text-[11px]">{currentUser.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </div>
                <Lock className="w-3 h-3 text-zinc-600" />
              </button>
            )}

            {/* Settings & Keys Button */}
            <button
              onClick={handleOpenSettings}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Settings & API Keys</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${providerStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

          </div>

        </div>
      </aside>

      {/* ================= MAIN CHAT FEED (FLEXES BESIDE CANVAS / BROWSER) ================= */}
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
                  onClick={handleOpenSettings}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Connect Provider</span>
                </button>
              )}

              {isModelDropdownOpen && (
                <div
                  ref={modelDropdownRef}
                  className="absolute top-full left-0 mt-2 w-80 sm:w-96 max-h-[60vh] overflow-y-auto rounded-2xl bg-[#0c0c10] border border-zinc-700 shadow-2xl p-2 z-50 animate-fade-in space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                    <span>Models from {config.provider.toUpperCase()}</span>
                    <span>{availableModels.length} available</span>
                  </div>

                  {/* Search filter */}
                  {availableModels.length > 5 && (
                    <div className="px-1">
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Search models..."
                        className="w-full px-3 py-1.5 rounded-xl bg-black border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {availableModels.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-400 space-y-2">
                        <p>No models discovered yet from {config.provider.toUpperCase()}.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsModelDropdownOpen(false);
                            handleOpenSettings();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs transition"
                        >
                          Configure API Key
                        </button>
                      </div>
                    ) : (
                      availableModels
                        .filter(
                          (m) =>
                            m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
                            m.id.toLowerCase().includes(modelSearch.toLowerCase())
                        )
                        .map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, model: model.id }));
                              setIsModelDropdownOpen(false);
                              setModelSearch('');
                            }}
                            className={
                              "w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 " +
                              (config.model === model.id
                                ? 'bg-zinc-800/80 border border-zinc-600 text-white'
                                : 'hover:bg-zinc-900/60 border border-transparent text-zinc-300')
                            }
                          >
                            <div className="w-2 h-2 rounded-full mt-1.5 bg-emerald-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white truncate">{model.name}</span>
                                {model.badge && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-500">
                                <span className="truncate max-w-[180px]">{model.id}</span>
                                {model.contextWindow && <span>• {model.contextWindow}</span>}
                              </div>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Benchmark, Split Browser Shortcut & New Chat */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className={`p-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isBenchmarkOpen
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Throughput & Latency Benchmark"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Benchmark</span>
            </button>

            <button
              onClick={() => handleOpenWebBrowser()}
              className={`p-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isWebBrowserOpen
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Split Web Browser Search"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browser</span>
            </button>

            <button
              onClick={handleCreateNewSession}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* ================= MESSAGE STREAM (COMPLETELY STATIC ON NEW CHAT, NO SCROLL) ================= */}
        <main
          className={`flex-1 px-4 sm:px-8 md:px-12 py-6 max-w-4xl mx-auto w-full ${
            messages.length === 0
              ? 'overflow-hidden flex flex-col justify-center items-center'
              : 'overflow-y-auto space-y-6'
          }`}
        >
          
          {/* Welcome Screen (100% Static, Zero Scroll, Centered) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 select-none my-auto">
              <div className="w-24 sm:w-32 md:w-36 aspect-[1104/1380] mx-auto flex-shrink-0 relative">
                <ButterflySvg className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,255,255,0.12)]" />
              </div>

              <div className="space-y-1 px-2">
                <div className="flex items-baseline justify-center gap-2.5">
                  <span className="font-roman text-3xl sm:text-4xl font-extrabold tracking-widest text-white">
                    XENO
                  </span>
                  <span className="font-calligraphy text-4xl sm:text-5xl text-zinc-300">
                    Inference
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {providerStatus.connected
                    ? `High-throughput neural token stream connected to ${selectedModel.name} via ${config.provider.toUpperCase()}.`
                    : 'High-Throughput Neural AI Acceleration.'}
                </p>

                {!providerStatus.connected && (
                  <div className="pt-2">
                    <button
                      onClick={handleOpenSettings}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono cursor-pointer hover:bg-amber-950/50 transition"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Configure {config.provider.toUpperCase()} API Key (Press Ctrl+,)</span>
                    </button>
                  </div>
                )}
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
                {/* Assistant Message (Luxury Encapsulated Bubble Container) */}
                {!isUser ? (
                  <div className="flex gap-3 sm:gap-4 max-w-full w-full">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 mt-1">
                      <XenoLogo size={18} />
                    </div>

                    <div className="flex-1 min-w-0 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-4 sm:p-5 shadow-sm space-y-3">
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
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                        <div>
                          {msg.metrics ? (
                            <span className="text-zinc-500">
                              {msg.metrics.tokensPerSec} tok/s • {msg.metrics.tokens} tokens
                            </span>
                          ) : (
                            <span className="text-zinc-600">{config.provider.toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-75 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="hover:text-white transition cursor-pointer p-1 rounded-md hover:bg-zinc-800"
                            title="Copy text"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.content)}
                            className={
                              'hover:text-white transition cursor-pointer p-1 rounded-md hover:bg-zinc-800 ' +
                              (speakingMessageId === msg.id ? 'text-white animate-pulse' : '')
                            }
                            title="Read aloud"
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={handleRegenerate}
                            className="hover:text-white transition cursor-pointer p-1 rounded-md hover:bg-zinc-800"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
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
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 mt-1">
                <XenoLogo size={18} />
              </div>

              <div className="flex-1 min-w-0 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-4 sm:p-5 shadow-sm space-y-3">
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
            
            {/* Tools Menu Popover */}
            {isToolsMenuOpen && (
              <div
                ref={toolsMenuRef}
                className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-[#0c0c10] border border-zinc-700 shadow-2xl p-2 z-50 animate-fade-in space-y-1"
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                  <span>AI Tools & Accelerators</span>
                  <button onClick={() => setIsToolsMenuOpen(false)} className="hover:text-white">&times;</button>
                </div>

                {/* Open Split Web Browser */}
                <button
                  type="button"
                  onClick={() => handleOpenWebBrowser()}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live AI Web Search</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Launch ↗</span>
                </button>

                {/* Open Canvas Panel */}
                <button
                  type="button"
                  onClick={() => {
                    handleOpenInCanvas('New Artifact', 'rust', '// Interactive Canvas Workspace\n');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Artifact Canvas Workspace</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Open ↗</span>
                </button>

                {/* Live Hardware Benchmark */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBenchmarkOpen(true);
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Hardware Latency Benchmark</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Run ↗</span>
                </button>

                {/* Leaderboard */}
                <button
                  type="button"
                  onClick={() => {
                    setIsLeaderboardOpen(true);
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Artificial Analysis & Arena Leaderboard</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">View ↗</span>
                </button>

                {/* AI Releases */}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewsOpen(true);
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>AI Releases & Daily Papers</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Read ↗</span>
                </button>

                {/* Deep Reasoning Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, enableReasoning: !prev.enableReasoning }));
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                    config.enableReasoning
                      ? 'bg-zinc-800 text-white font-medium border border-zinc-600'
                      : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deep Reasoning (CoT)</span>
                  </div>
                  <span className="text-[10px] font-mono">{config.enableReasoning ? 'ON' : 'OFF'}</span>
                </button>

                {/* Insert Code Block */}
                <button
                  type="button"
                  onClick={() => {
                    setInput((prev) => (prev ? prev + '\n```rust\n// Rust Code\n```' : '```rust\n// Rust Code\n```'));
                    setIsToolsMenuOpen(false);
                    textareaRef.current?.focus();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Insert Code Block</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Template</span>
                </button>
              </div>
            )}

            {/* Slash Commands Menu */}
            {isSlashMenuOpen && (
              <div
                ref={slashMenuRef}
                className="absolute bottom-full left-0 mb-2 w-full sm:w-80 rounded-2xl bg-[#0c0c10] border border-zinc-700 shadow-2xl p-1.5 z-50 animate-fade-in space-y-0.5"
              >
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
                    <span className="truncate max-w-[200px]">{att.name}</span>
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

            {/* No Provider Warning Callout */}
            {!providerStatus.connected && (
              <div className="mb-2 p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>No AI provider connected. Configure OpenRouter, Groq, DeepSeek, OpenAI, or Ollama to discover available models.</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-[11px] transition cursor-pointer flex-shrink-0 ml-2"
                >
                  Connect Provider
                </button>
              </div>
            )}

            {/* Floating Pill Capsule Omnibar */}
            <div className={`relative rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/90 border shadow-2xl transition-all duration-200 p-2 sm:p-2.5 ${
              isListening
                ? 'border-red-500/60 ring-2 ring-red-500/20'
                : 'border-zinc-800/90 hover:border-zinc-700 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-white/10'
            }`}>
              
              {/* Integrated Audio-Reactive Soundwave Visualizer (Inside Input Box, No Popup) */}
              {isListening && (
                <VoiceVisualizer isListening={isListening} onStop={toggleVoiceInput} inline={true} />
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onPaste={handleTextareaPaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  providerStatus.connected
                    ? `Ask ${selectedModel.name} anything, paste code, or type / for commands...`
                    : `Configure an AI provider & API key in Settings to begin...`
                }
                rows={1}
                className="w-full px-3 py-1.5 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-40 overflow-y-auto leading-relaxed"
                style={{ minHeight: '38px' }}
              />

              {/* Bottom Quick Controls */}
              <div className="flex items-center justify-between pt-1 px-1">
                
                {/* Left Controls: Attach, Tools Menu, Search, Reasoning */}
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
                    title="Add file attachment"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Tools Menu Button */}
                  <button
                    type="button"
                    onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      isToolsMenuOpen
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="AI Tools & Extensions"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Tools</span>
                  </button>

                  {/* Quick Browser Launch Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenWebBrowser()}
                    className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      isWebBrowserOpen
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Open live web browser"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Search Web</span>
                  </button>

                  {/* Quick Deep Reasoning Toggle */}
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, enableReasoning: !prev.enableReasoning }))}
                    className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      config.enableReasoning
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Deep reasoning mode"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Deep Think</span>
                  </button>
                </div>

                {/* Right Controls: Voice & Circular Send / Stop Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-1.5 rounded-full transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500/25 text-red-400 border border-red-500/50 animate-pulse'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isListening ? 'Stop recording (Click to finish)' : 'Voice input (Speech to Text)'}
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

            <div className="text-center text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-2">
              {providerStatus.connected ? (
                <>
                  <span>Provider: <strong className="text-zinc-300 font-semibold">{config.provider.toUpperCase()}</strong></span>
                  <span>•</span>
                  <span>Model: <strong className="text-zinc-300 font-semibold">{selectedModel.name}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-400/90 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>No Provider Connected</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    className="underline hover:text-amber-200 cursor-pointer font-sans text-[11px]"
                  >
                    Configure Provider & Key
                  </button>
                </div>
              )}
            </div>

          </div>
        </footer>

      </div>

      {/* ================= SIDE-BY-SIDE SPLIT WEB BROWSER PANEL (NO OVERLAP) ================= */}
      {isWebBrowserOpen && (
        <WebBrowserPanel
          isOpen={isWebBrowserOpen}
          onClose={() => setIsWebBrowserOpen(false)}
          initialQuery={webBrowserInitialQuery}
          onInsertIntoPrompt={(snippet) => {
            setInput((prev) => (prev ? prev + '\n' + snippet : snippet));
            textareaRef.current?.focus();
          }}
        />
      )}

      {/* ================= SIDE-BY-SIDE ARTIFACT CANVAS PANEL (NO OVERLAP) ================= */}
      {isCanvasOpen && (
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
      )}

      {/* ================= LEADERBOARD & BENCHMARKS MODAL ================= */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onSelectModel={(modelId) => {
          setConfig((prev) => ({ ...prev, model: modelId }));
        }}
      />

      {/* ================= HARDWARE THROUGHPUT BENCHMARK MODAL ================= */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        rustBackendUrl={config.rustBackendUrl}
        activeModel={providerStatus.connected && config.model ? config.model : ''}
        isConnected={providerStatus.connected}
        onOpenSettings={handleOpenSettings}
      />

      {/* ================= AI NEWS & MODEL RELEASES MODAL ================= */}
      <AiNewsModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        onSelectModel={(modelId) => {
          setConfig((prev) => ({ ...prev, model: modelId }));
        }}
      />

      {/* ================= SETTINGS MODAL ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChange={setConfig}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthModalOpen(true);
        }}
        onModelsDiscovered={(models) => {
          setAvailableModels(models);
          localStorage.setItem('xeno_provider_models', JSON.stringify(models));
          if (!config.model || !models.some((m) => m.id === config.model)) {
            setConfig((prev) => ({ ...prev, model: models[0]?.id || '' }));
          }
        }}
      />

      {/* ================= GOOGLE AUTHENTICATION MODAL ================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};
