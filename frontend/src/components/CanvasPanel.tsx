import React, { useState } from 'react';
import { X, Copy, Check, Download, Edit3, Eye, FileCode, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CanvasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  language: string;
  content: string;
  onChangeContent: (newContent: string) => void;
  onInsertIntoChat?: (text: string) => void;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  isOpen,
  onClose,
  title,
  language,
  content,
  onChangeContent,
  onInsertIntoChat,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      language.toLowerCase() === 'rust' || language.toLowerCase() === 'rs'
        ? 'rs'
        : language.toLowerCase() === 'typescript' || language.toLowerCase() === 'ts'
        ? 'ts'
        : language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js'
        ? 'js'
        : language.toLowerCase() === 'python' || language.toLowerCase() === 'py'
        ? 'py'
        : language.toLowerCase() === 'json'
        ? 'json'
        : 'md';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = content.split('\n').length;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  return (
    <aside
      className={`border-l border-zinc-800/80 bg-[#08080a] shadow-2xl flex flex-col flex-shrink-0 transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'fixed inset-0 z-50 w-full h-full lg:relative lg:h-full lg:w-[420px] xl:w-[460px] 2xl:w-[500px] lg:max-w-[38vw] lg:z-20'
      }`}
    >
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-zinc-800 bg-[#0c0c10] select-none">
        <div className="flex items-center gap-2 min-w-0">
          {/* Back to Chat on Mobile/Tablet */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition cursor-pointer flex-shrink-0"
            title="Back to Chat"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-semibold">Chat</span>
          </button>

          <FileCode className="w-4 h-4 text-white flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs text-white truncate">{title}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/10 flex-shrink-0">
              {language || 'DOC'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                activeTab === 'preview'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                activeTab === 'code'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition hidden sm:inline"
            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Close Canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Body Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#040406]">
        {activeTab === 'preview' ? (
          <div className="max-w-3xl mx-auto">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent font-mono text-xs sm:text-[13px] leading-relaxed text-zinc-200 resize-none focus:outline-none placeholder-zinc-600"
            placeholder="Edit artifact content directly..."
          />
        )}
      </div>

      {/* Canvas Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800 bg-[#0a0a0d] text-[11px] font-mono text-zinc-500 select-none">
        <div className="flex items-center gap-3">
          <span>{lines} lines</span>
          <span>•</span>
          <span>{words} words</span>
          <span>•</span>
          <span>{chars} chars</span>
        </div>

        {onInsertIntoChat && (
          <button
            onClick={() => onInsertIntoChat(content)}
            className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-[10px] transition cursor-pointer"
          >
            Send to Prompt
          </button>
        )}
      </div>
    </aside>
  );
};
