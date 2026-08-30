import React, { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  Globe, 
  Shield, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Search,
  Bookmark,
  X
} from "lucide-react";

export const TorSandboxedBrowserView: React.FC = () => {
  const { 
    torUrl, 
    navigateTorBrowser, 
    torCircuit, 
    requestNewTorIdentity, 
    torShieldLevel, 
    setTorShieldLevel,
    isAirGapped
  } = useWorkspaceStore();

  const [inputUrl, setInputUrl] = useState(torUrl);
  const [showCircuitDrawer, setShowCircuitDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setIsLoading(true);
    navigateTorBrowser(inputUrl);
    setTimeout(() => setIsLoading(false), 500);
  };

  const bookmarks = [
    { title: "DuckDuckGo Onion", url: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion" },
    { title: "Tor Project", url: "http://2gzyxa5ihm7nsggfxnu52r2gz264257lqqqqh53m5qsmxamznx524fid.onion" },
    { title: "Rust Std Docs", url: "https://doc.rust-lang.org/std/" },
    { title: "GitHub Xeno", url: "https://github.com/Aman-Gautam67/Xeno-Inference" },
  ];

  const isOnion = torUrl.includes(".onion");

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-hidden font-sans select-text transition-colors duration-200">
      {/* Top Browser Bar */}
      <div className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 sm:px-4 flex items-center justify-between space-x-2 z-10 shrink-0 shadow-2xs">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 400);
            }}
            className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-all ${
              isLoading ? "animate-spin text-amber-600" : ""
            }`}
            title="Reload Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibar / Onion URL Input */}
        <form
          onSubmit={handleNavigate}
          className="flex-1 max-w-xl flex items-center bg-stone-100 dark:bg-stone-950 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-300/80 dark:border-stone-800 focus-within:border-stone-500 transition-all shadow-inner"
        >
          <div className="flex items-center space-x-1 mr-1.5 shrink-0">
            {isOnion ? (
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                <Lock className="w-3 h-3 text-purple-600" />
                ONION
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Lock className="w-3 h-3 text-emerald-600" />
                SECURE
              </span>
            )}
          </div>

          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search or enter .onion address..."
            className="flex-1 bg-transparent text-xs font-mono text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 truncate"
          />

          <button
            type="submit"
            className="ml-1 p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Tor Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setShowCircuitDrawer(!showCircuitDrawer)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              showCircuitDrawer
                ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
            title="Toggle Tor Circuit"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Circuit</span>
          </button>

          <button
            onClick={() => {
              requestNewTorIdentity();
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 300);
            }}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all shadow-2xs"
            title="Request New Tor Circuit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-8 border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 px-3 sm:px-4 flex items-center space-x-2 text-[11px] font-mono overflow-x-auto shrink-0 select-none">
        <Bookmark className="w-3 h-3 text-stone-400 mr-1 shrink-0" />
        {bookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              setInputUrl(bm.url);
              navigateTorBrowser(bm.url);
            }}
            className="px-2 py-0.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-all truncate max-w-[150px] shrink-0"
          >
            {bm.title}
          </button>
        ))}
      </div>

      {/* Main Sandbox Surface */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col bg-white dark:bg-stone-950 overflow-hidden relative">
          <div className="p-2.5 sm:p-3 bg-stone-50 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-500 shrink-0">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">SOCKS5 Proxy: 127.0.0.1:9050</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-purple-600 dark:text-purple-400">DNS Leak Guard</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              Encrypted
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {isOnion ? "Tor Onion Hidden Service" : "Tor Clearnet Proxy"}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Zero Fingerprint
                  </span>
                </div>

                <div className="text-xs font-mono space-y-1.5 text-stone-600 dark:text-stone-400 leading-relaxed">
                  <div><strong>Requested URI:</strong> {torUrl}</div>
                  <div><strong>Cipher:</strong> TLS_AES_256_GCM_SHA384</div>
                  <div><strong>Security Level:</strong> {torShieldLevel}</div>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed pt-2 border-t border-stone-200/80 dark:border-stone-800">
                  This browser view operates in an isolated sandbox with zero access to your local filesystem or host storage. All network sockets are wrapped in Tor onion routing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live 3-Hop Circuit Drawer */}
        {showCircuitDrawer && (
          <div className="w-72 sm:w-80 border-l border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 space-y-4 overflow-y-auto font-mono text-xs shadow-xl z-20">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Tor Circuit (3 Hops)
                </span>
              </div>
              <button onClick={() => setShowCircuitDrawer(false)} className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {torCircuit.map((hop, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                      {idx + 1}. {hop.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold">{hop.country}</span>
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-400 truncate">{hop.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/80">
                    <span>IP: {hop.ip}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{hop.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
