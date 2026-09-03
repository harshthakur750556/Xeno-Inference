import { useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { SplashIntro } from './components/SplashIntro';
import { ChatInterface } from './components/ChatInterface';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#060608] text-white p-6 text-center space-y-4 font-sans select-none">
          <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400 font-mono text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-white">Interface Protected by Error Boundary</h2>
          <p className="text-xs text-zinc-400 max-w-md font-mono leading-relaxed">
            {this.state.error?.message || 'A render exception was caught and isolated to prevent blank screen failures.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer shadow-lg"
          >
            Restore Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Global F12 restriction across the entire site
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Restrict F12 key (keyCode 123)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Also restrict standard DevTools shortcut chords: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Use capture phase to intercept before any child element handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen bg-[#030305] text-white">
        {showSplash ? (
          <SplashIntro onComplete={() => setShowSplash(false)} />
        ) : (
          <ChatInterface onReplayIntro={() => setShowSplash(true)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

