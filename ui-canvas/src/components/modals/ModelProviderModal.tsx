import React, { useState } from "react";
import { useWorkspaceStore, ProviderItem, ProviderSector } from "../../stores/workspaceStore";
import { 
  Key, 
  Cpu, 
  Server, 
  Globe, 
  Check, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Activity, 
  RefreshCw, 
  Sparkles, 
  Radio, 
  Terminal, 
  ShieldCheck, 
  Sliders, 
  Zap,
  Bot
} from "lucide-react";

export const ModelProviderModal: React.FC = () => {
  const {
    isProviderModalOpen,
    closeProviderModal,
    providerModalTab,
    setProviderModalTab,
    providerModalTargetId,
    providers,
    updateProviderConfig,
    probeLocalHostProvider,
    testCloudApiProvider,
    selectedModel,
    setSelectedModel,
  } = useWorkspaceStore();

  const [activeProviderId, setActiveProviderId] = useState<string>(
    providerModalTargetId || "anthropic"
  );
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [probingId, setProbingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  if (!isProviderModalOpen) return null;

  const currentSectorProviders = providers.filter((p) => p.sector === providerModalTab);
  const currentProvider = providers.find((p) => p.id === activeProviderId) || currentSectorProviders[0] || providers[0];

  const handleToggleKeyVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProbe = async (provider: ProviderItem) => {
    setProbingId(provider.id);
    setTestResult(null);

    if (provider.sector === "local") {
      const res = await probeLocalHostProvider(provider.id);
      setTestResult({
        id: provider.id,
        success: res.ok,
        message: res.ok 
          ? `Local Host Connected! Latency: ${res.pingMs}ms. Engine ready.` 
          : res.error || "Connection failed. Please ensure local service is running.",
      });
    } else {
      const res = await testCloudApiProvider(provider.id);
      setTestResult({
        id: provider.id,
        success: res.ok,
        message: res.ok 
          ? "API Key Verified! Cloud connection authenticated." 
          : res.error || "Verification failed.",
      });
    }
    setProbingId(null);
  };

  const handleSelectModelAndClose = (modelId: string, providerId: string) => {
    setSelectedModel(modelId, providerId);
    closeProviderModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-[96vw] max-w-3xl max-h-[88vh] flex flex-col overflow-hidden transition-colors">
        {/* Header — Classical Roman White Styling */}
        <div className="px-5 sm:px-7 py-4 border-b border-stone-200/90 dark:border-stone-800/90 flex items-center justify-between bg-stone-50/70 dark:bg-stone-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-bold tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2 uppercase">
                Inference Providers & Keys
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-editorial">
                Configure cloud API credentials or connect local hardware accelerators
              </p>
            </div>
          </div>

          <button
            onClick={closeProviderModal}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sector Tabs (API Cloud vs Local Host) */}
        <div className="px-5 sm:px-7 pt-3 pb-2 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-950/40 flex items-center space-x-3">
          <button
            onClick={() => {
              setProviderModalTab("api");
              const firstApi = providers.find((p) => p.sector === "api");
              if (firstApi) setActiveProviderId(firstApi.id);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
              providerModalTab === "api"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cloud API Sector</span>
          </button>

          <button
            onClick={() => {
              setProviderModalTab("local");
              const firstLocal = providers.find((p) => p.sector === "local");
              if (firstLocal) setActiveProviderId(firstLocal.id);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
              providerModalTab === "local"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-500" />
            <span>Local Host (Bare Metal)</span>
          </button>
        </div>

        {/* Main Content: Left Provider Picker + Right Configuration Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Providers Selector Sidebar */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-stone-200/90 dark:border-stone-800/90 p-3 space-y-1.5 overflow-y-auto bg-stone-50/30 dark:bg-stone-950/30 shrink-0">
            <span className="text-[10px] uppercase font-mono font-bold text-stone-400 px-2 block mb-1">
              Select Provider
            </span>

            {currentSectorProviders.map((prov) => {
              const isSelected = prov.id === currentProvider.id;
              const hasKey = prov.sector === "api" ? Boolean(prov.apiKey && prov.apiKey.trim().length > 0) : prov.status === "ready";

              return (
                <button
                  key={prov.id}
                  onClick={() => setActiveProviderId(prov.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-xs"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {prov.name}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono truncate">
                      {prov.models.length} Model{prov.models.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div>
                    {hasKey ? (
                      <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-2.5 h-2.5" /> Ready
                      </span>
                    ) : prov.sector === "local" ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                        Offline
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                        Key Req
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Provider Details & Model Selector */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            {currentProvider && (
              <div className="space-y-4">
                {/* Provider Title & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="text-base font-display font-bold text-stone-900 dark:text-stone-100">
                      {currentProvider.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-editorial">
                      {currentProvider.sector === "api"
                        ? "Configure secret API authentication tokens"
                        : "Connect directly to local GGUF / Ollama daemon running on your machine"}
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    currentProvider.status === "ready"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                  }`}>
                    {currentProvider.status === "ready" ? "✓ Connected & Ready" : "⚠ Configuration Required"}
                  </span>
                </div>

                {/* API Key Input (For Cloud Providers) */}
                {currentProvider.sector === "api" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        API Key Token
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">Stored locally in your browser</span>
                    </label>

                    <div className="relative flex items-center">
                      <input
                        type={showKey[currentProvider.id] ? "text" : "password"}
                        value={currentProvider.apiKey}
                        onChange={(e) => updateProviderConfig(currentProvider.id, { apiKey: e.target.value })}
                        placeholder={`Enter ${currentProvider.name} API key (e.g. sk-...)`}
                        className="w-full bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility(currentProvider.id)}
                        className="absolute right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                      >
                        {showKey[currentProvider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Base Endpoint URL Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-stone-500" />
                      Endpoint Base URL
                    </span>
                    <button
                      onClick={() => updateProviderConfig(currentProvider.id, { baseUrl: currentProvider.defaultEndpoint })}
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Reset to Default
                    </button>
                  </label>

                  <input
                    type="text"
                    value={currentProvider.baseUrl}
                    onChange={(e) => updateProviderConfig(currentProvider.id, { baseUrl: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Test Connection / Probe Button & Result */}
                <div className="pt-1 flex items-center space-x-3">
                  <button
                    onClick={() => handleProbe(currentProvider)}
                    disabled={probingId === currentProvider.id}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-mono text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${probingId === currentProvider.id ? "animate-spin" : ""}`} />
                    <span>{probingId === currentProvider.id ? "Probing..." : currentProvider.sector === "local" ? "Probe Local Daemon" : "Validate API Token"}</span>
                  </button>
                </div>

                {testResult && testResult.id === currentProvider.id && (
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 ${
                    testResult.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                  }`}>
                    {testResult.success ? <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Models List for This Provider */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                    Available Models Under {currentProvider.name}
                  </span>

                  <div className="space-y-2">
                    {currentProvider.models.map((m) => {
                      const isCurrentlyActive = selectedModel === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isCurrentlyActive
                              ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-2xs"
                              : "bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 hover:border-stone-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">{m.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono">
                                {m.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-editorial mt-0.5">{m.description}</p>
                          </div>

                          <button
                            onClick={() => handleSelectModelAndClose(m.id, currentProvider.id)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                              isCurrentlyActive
                                ? "bg-amber-600 text-white font-bold"
                                : "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200"
                            }`}
                          >
                            {isCurrentlyActive ? "Active Core" : "Select"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/50 flex items-center justify-between text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Air-Gap Verified: Zero external telemetry logging</span>
          </div>
          <button
            onClick={closeProviderModal}
            className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
