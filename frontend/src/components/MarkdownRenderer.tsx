import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  onOpenCanvas?: (title: string, language: string, code: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onOpenCanvas,
}) => {
  // Split code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs sm:text-[13.5px] leading-relaxed text-zinc-100 font-sans select-text">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');
          return (
            <div key={index} className="relative group">
              <CodeBlock language={lang} code={code} />
              {onOpenCanvas && code.length > 50 && (
                <button
                  type="button"
                  onClick={() => onOpenCanvas(`${lang.toUpperCase() || 'Code'} Artifact`, lang, code)}
                  className="absolute right-28 top-2 hidden group-hover:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 hover:bg-white/20 text-zinc-200 transition"
                  title="Open in interactive Canvas"
                >
                  <span>Canvas ↗</span>
                </button>
              )}
            </div>
          );
        }

        // Process markdown paragraphs, tables, lists, headers, quotes
        const paragraphs = part.split(/\n\n+/);

        return (
          <div key={index} className="space-y-3">
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Headers
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={pIdx} className="text-base sm:text-lg font-bold text-white tracking-wide border-b border-zinc-800 pb-1.5 mt-3 mb-2">
                    {parseInline(trimmed.replace(/^#\s+/, ''))}
                  </h1>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={pIdx} className="text-sm sm:text-base font-semibold text-white tracking-wide border-b border-zinc-800/60 pb-1 mt-3 mb-1.5">
                    {parseInline(trimmed.replace(/^##\s+/, ''))}
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-xs sm:text-sm font-semibold text-zinc-200 mt-2.5 mb-1">
                    {parseInline(trimmed.replace(/^###\s+/, ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={pIdx} className="text-xs font-semibold text-zinc-300 mt-2 mb-1">
                    {parseInline(trimmed.replace(/^####\s+/, ''))}
                  </h4>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={pIdx} className="border-l-2 border-white/30 bg-white/[0.02] pl-3.5 py-1.5 my-2 text-zinc-300 italic rounded-r-lg">
                    {parseInline(trimmed.replace(/^>\s*/gm, ''))}
                  </blockquote>
                );
              }

              // Markdown Tables (| Header | Header |)
              if (trimmed.includes('|') && trimmed.includes('\n')) {
                const tableLines = trimmed.split('\n').filter((l) => l.includes('|'));
                if (tableLines.length >= 2) {
                  const headers = tableLines[0]
                    .split('|')
                    .map((h) => h.trim())
                    .filter(Boolean);
                  const dataRows = tableLines
                    .slice(2)
                    .map((row) =>
                      row
                        .split('|')
                        .map((c) => c.trim())
                        .filter(Boolean)
                    )
                    .filter((r) => r.length > 0);

                  return (
                    <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-zinc-800 bg-[#070709]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-300">
                          <tr>
                            {headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-3.5 py-2 font-semibold tracking-wider">
                                {parseInline(h)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                          {dataRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02] transition">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3.5 py-2">
                                  {parseInline(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Unordered / Ordered Lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
                const listItems = trimmed.split('\n');
                const isOrdered = /^\d+\.\s/.test(trimmed);

                return isOrdered ? (
                  <ol key={pIdx} className="list-decimal list-inside space-y-1 my-1.5 text-zinc-200 pl-1">
                    {listItems.map((li, lIdx) => (
                      <li key={lIdx}>{parseInline(li.replace(/^\d+\.\s+/, ''))}</li>
                    ))}
                  </ol>
                ) : (
                  <ul key={pIdx} className="list-disc list-inside space-y-1 my-1.5 text-zinc-200 pl-1">
                    {listItems.map((li, lIdx) => (
                      <li key={lIdx}>{parseInline(li.replace(/^[-*]\s+/, ''))}</li>
                    ))}
                  </ul>
                );
              }

              // Math formulas display ($$ ... $$)
              if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
                return (
                  <div key={pIdx} className="my-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center font-mono text-xs sm:text-sm text-zinc-200 tracking-wider overflow-x-auto">
                    {trimmed.slice(2, -2).trim()}
                  </div>
                );
              }

              // Default standard paragraph
              return (
                <p key={pIdx} className="leading-relaxed">
                  {parseInline(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Inline parser for bold, italic, inline code, and inline math
function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 font-mono text-[11px] sm:text-xs text-zinc-200 mx-0.5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return (
        <span
          key={i}
          className="px-1 py-0.5 rounded bg-white/[0.04] font-mono text-[11px] text-zinc-300 border border-white/10 mx-0.5"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}
