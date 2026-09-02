export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  thinkingDurationMs?: number;
  isThinking?: boolean;
  metrics?: InferenceMetrics;
  timestamp: string;
  attachments?: FileAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  isPinned?: boolean;
}

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  content?: string;
}

export interface InferenceMetrics {
  tokens: number;
  durationMs: number;
  tokensPerSec: number;
  ttftMs: number;
  model: string;
  finishReason: string;
}

export interface ModelOption {
  id: string;
  name: string;
  tagline: string;
  contextWindow: string;
  quantization: string;
  params: string;
  provider: string;
  badge?: string;
  color: string;
  iconType: 'quantum' | 'deepseek' | 'llama' | 'mistral' | 'claude';
}

export interface InferenceConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  stream: boolean;
  enableReasoning: boolean;
  rustBackendUrl: string;
  apiKey?: string;
  model: string;
  webSearch?: boolean;
}

export interface TelemetryData {
  engineStatus: 'connected' | 'simulated' | 'connecting';
  activeStreams: number;
  vramUsedGb: number;
  vramTotalGb: number;
  totalTokensProcessed: number;
  avgThroughput: number;
  cpuLoadPercent: number;
  rustVersion: string;
  uptimeSeconds: number;
  memoryBandwidthGbps: number;
}

export interface BenchmarkResult {
  model: string;
  promptTokens: number;
  generatedTokens: number;
  totalTimeMs: number;
  tokensPerSec: number;
  ttftMs: number;
  memoryAllocatedMb: number;
}

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  promptPrefix: string;
}