import React, { useState } from 'react';
import { Check, Copy, Code2, Terminal, Download } from 'lucide-react';

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

  const handleDownload = () => {
    const ext = language === 'rust' ? 'rs' : language === 'typescript' || language === 'ts' ? 'ts' : language === 'javascript' || language === 'js' ? 'js' : language === 'python' || language === 'py' ? 'py' : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = code.trim().split('\n').length;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#070709] shadow-xl text-left">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          {language === 'bash' || language === 'sh' || language === 'shell' ? (
            <Terminal className="w-3.5 h-3.5 text-zinc-300" />
          ) : (
            <Code2 className="w-3.5 h-3.5 text-zinc-300" />
          )}
          <span className="uppercase text-[11px] font-semibold tracking-wider text-zinc-200">
            {language || 'text'}
          </span>
          <span className="text-[10px] text-zinc-500">• {lineCount} lines</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Download snippet"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] text-white font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3.5 sm:p-4 overflow-x-auto">
        <pre className="font-mono text-[12px] sm:text-[13px] leading-relaxed text-zinc-200 m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};