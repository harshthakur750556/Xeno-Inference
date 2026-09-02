import React, { useState } from 'react';
import { Check, Copy, Code2, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const lineCount = code.trim().split('\n').length;

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-zinc-800 bg-[#0c0c14] shadow-xl text-left">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          {language === 'bash' || language === 'sh' || language === 'shell' ? (
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="uppercase text-[11px] font-semibold tracking-wider text-zinc-300">
            {language || 'text'}
          </span>
          <span className="text-[10px] text-zinc-500">• {lineCount} lines</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-300 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-[13px] leading-relaxed text-zinc-200 m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};