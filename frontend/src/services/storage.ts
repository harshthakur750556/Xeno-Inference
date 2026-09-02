import type { ChatSession } from '../types';

const STORAGE_KEY = 'xeno_chat_sessions_v1';
const ACTIVE_SESSION_KEY = 'xeno_active_session_id';

export const getStoredSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load chat sessions from localStorage:', e);
    return [];
  }
};

export const saveStoredSessions = (sessions: ChatSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat sessions to localStorage:', e);
  }
};

export const getActiveSessionId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
};

export const setActiveSessionId = (id: string | null): void => {
  try {
    if (id) localStorage.setItem(ACTIVE_SESSION_KEY, id);
    else localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
};

export const createSession = (model: string, initialTitle?: string): ChatSession => {
  const newSession: ChatSession = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: initialTitle || 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
    messages: [],
    isPinned: false,
  };

  const sessions = getStoredSessions();
  saveStoredSessions([newSession, ...sessions]);
  setActiveSessionId(newSession.id);
  return newSession;
};

export const updateSession = (
  sessionId: string,
  updater: (session: ChatSession) => ChatSession
): ChatSession[] => {
  const sessions = getStoredSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return sessions;

  sessions[index] = updater({ ...sessions[index], updatedAt: Date.now() });
  saveStoredSessions(sessions);
  return [...sessions];
};

export const deleteSession = (sessionId: string): ChatSession[] => {
  const sessions = getStoredSessions().filter((s) => s.id !== sessionId);
  saveStoredSessions(sessions);
  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    setActiveSessionId(sessions.length > 0 ? sessions[0].id : null);
  }
  return sessions;
};

export const exportSessionAsMarkdown = (session: ChatSession): void => {
  let md = `# ${session.title}\n\n`;
  md += `*Model:* ${session.model} | *Date:* ${new Date(session.createdAt).toLocaleString()}\n\n---\n\n`;

  session.messages.forEach((msg) => {
    md += `### ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n`;
    if (msg.reasoning) {
      md += `> **Thought Process:**\n> ${msg.reasoning.replace(/\n/g, '\n> ')}\n\n`;
    }
    md += `${msg.content}\n\n`;
    if (msg.metrics) {
      md += `*Tokens:* ${msg.metrics.tokens} | *Speed:* ${msg.metrics.tokensPerSec} tok/s | *TTFT:* ${msg.metrics.ttftMs}ms\n\n`;
    }
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportSessionAsJson = (session: ChatSession): void => {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};