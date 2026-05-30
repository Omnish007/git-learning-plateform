"use client";

import { useState, useEffect } from "react";
import { useAiStore, AiProvider } from "@/lib/ai-store";
import { Sparkles, ShieldCheck, Key, Server, Trash2, Eye, EyeOff, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function AiSettingsClient() {
  const store = useAiStore();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("google");
  const [apiKey, setApiKey] = useState("");
  const [localEndpoint, setLocalEndpoint] = useState("http://localhost:11434");
  const [showKey, setShowKey] = useState(false);

  // Modal / status states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize form from store
    setSelectedProvider(store.activeProvider);
    setLocalEndpoint(store.ollamaEndpoint);
  }, [store.activeProvider, store.ollamaEndpoint]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060609] flex flex-col items-center justify-center font-mono text-xs text-indigo-brand animate-pulse">
        <span>Loading AI dashboard settings...</span>
      </div>
    );
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider === "mock") {
      store.setActiveProvider("mock");
      triggerSuccess();
      return;
    }

    if (selectedProvider === "ollama") {
      store.setOllamaEndpoint(localEndpoint);
      store.setActiveProvider("ollama");
      triggerSuccess();
      return;
    }

    if (!apiKey.trim()) return;
    // Trigger confirmation modal for encrypted save
    setShowConfirmModal(true);
  };

  const confirmSaveKey = () => {
    if (selectedProvider === "mock" || selectedProvider === "ollama") return;
    
    store.saveKey(selectedProvider, apiKey.trim());
    store.setActiveProvider(selectedProvider);
    setApiKey("");
    setShowConfirmModal(false);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = (provider: Exclude<AiProvider, "mock">) => {
    store.deleteKey(provider);
  };

  const getMaskedKey = (provider: Exclude<AiProvider, "mock">) => {
    const raw = store.getDecryptedKey(provider);
    if (!raw) return "No key configured";
    if (raw.length <= 4) return "••••";
    return `••••••••••••${raw.substring(raw.length - 4)}`;
  };

  const providersInfo = {
    mock: { name: "Local Mock Socratic Coach", desc: "100% free offline fallback. Streams generic Socratic prompts using browser-side token timing simulations." },
    google: { name: "Google Gemini 2.5 Flash", desc: "Ultra-fast direct API integration. Generates outstanding streaming feedback with very low latency." },
    groq: { name: "Groq Llama 3.1", desc: "Powered by Groq's high-speed inference engine using standard authorization bearer headers." },
    huggingface: { name: "HuggingFace Serverless", desc: "Streams open-source models (like Llama 3.2 3B) directly using Hugging Face Serverless APIs." },
    ollama: { name: "Ollama (Local LLM)", desc: "Runs models (like llama3) locally on your system using client-side localhost CORS connections." }
  };

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col selection:bg-mint/30 selection:text-mint p-6">
      {/* Editorial glowing background decor */}
      <div className="absolute top-[-30%] left-[50%] translate-x-[-50%] w-[1000px] h-[500px] bg-gradient-to-b from-amber-coach/10 via-amber-coach/2 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
            <span className="hover:text-foreground cursor-pointer">Workspace</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-coach font-semibold">AI Socratic Coach</span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-amber-coach" /> Socratic AI Coach Configurations
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Select your preferred LLM provider, configure API credentials securely with client-side AES-256 local storage encryption, and manage saved credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Config Forms */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-panel-border bg-panel/30 backdrop-blur-md p-6">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold block mb-4">Select Provider</span>
              
              <form onSubmit={handleSaveClick} className="flex flex-col gap-5">
                {/* Selection Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Active LLM Provider</label>
                  <select 
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as AiProvider)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-background border border-panel-border text-foreground font-medium focus:outline-none focus:border-amber-coach/60"
                  >
                    <option value="mock">Local Mock Fallback (Default)</option>
                    <option value="google">Google Gemini 2.5 Flash</option>
                    <option value="groq">Groq (Llama 3.1 70B)</option>
                    <option value="huggingface">HuggingFace Serverless Inference</option>
                    <option value="ollama">Ollama (Local LLM)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground leading-relaxed mt-1 block">
                    {providersInfo[selectedProvider].desc}
                  </span>
                </div>

                {/* Conditional Fields */}
                {selectedProvider !== "mock" && selectedProvider !== "ollama" && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-semibold text-foreground flex justify-between">
                      <span>API Authorization Key</span>
                      <span className="text-[10px] text-amber-coach font-mono">Encrypted locally</span>
                    </label>
                    
                    <div className="relative">
                      <input 
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Paste your ${providersInfo[selectedProvider].name} key...`}
                        className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl bg-background border border-panel-border text-foreground font-mono focus:outline-none focus:border-amber-coach/60"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedProvider === "ollama" && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-semibold text-foreground flex justify-between">
                      <span>Ollama Endpoint URL</span>
                      <span className="text-[10px] text-muted-foreground font-mono">CORS compliant</span>
                    </label>
                    <input 
                      type="url"
                      value={localEndpoint}
                      onChange={(e) => setLocalEndpoint(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-background border border-panel-border text-foreground font-mono focus:outline-none focus:border-amber-coach/60"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  {saveSuccess && (
                    <span className="text-xs text-mint flex items-center gap-1 animate-pulse font-mono mr-auto">
                      <CheckCircle2 className="h-4 w-4" /> Active provider loaded!
                    </span>
                  )}
                  <Link 
                    href="/playground"
                    className="flex h-9.5 items-center justify-center px-4 rounded-xl border border-panel-border bg-panel text-xs font-semibold text-foreground hover:bg-panel/60 transition-colors"
                  >
                    Back to Sandbox
                  </Link>
                  <button 
                    type="submit"
                    className="flex h-9.5 items-center justify-center px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {selectedProvider === "mock" ? "Activate Coach" : "Activate & Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Key Drawer Storage Manager */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl border border-panel-border bg-panel/30 backdrop-blur-md p-6">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold block mb-4 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-mint" /> Local Security Vault
              </span>

              <div className="flex flex-col gap-4">
                {/* Highlight Active Indicator */}
                <div className="border border-panel-border/60 bg-background/40 rounded-xl p-3.5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono font-bold">Active Engine</span>
                    <span className="text-xs font-bold text-foreground mt-0.5 block">{providersInfo[store.activeProvider].name}</span>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${store.activeProvider === "mock" ? "bg-muted-foreground" : "bg-mint animate-pulse"}`} />
                </div>

                <div className="border-t border-panel-border/30 pt-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-mono font-bold mb-3">Saved Encrypted Credentials</span>
                  
                  <div className="flex flex-col gap-2.5">
                    {/* Google */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-panel-border/40 bg-background/20 text-xs">
                      <div>
                        <span className="font-bold text-foreground block">Google Gemini</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">{getMaskedKey("google")}</span>
                      </div>
                      {store.hasKey("google") && (
                        <button 
                          onClick={() => handleDelete("google")}
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 border border-panel-border text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Groq */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-panel-border/40 bg-background/20 text-xs">
                      <div>
                        <span className="font-bold text-foreground block">Groq Llama</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">{getMaskedKey("groq")}</span>
                      </div>
                      {store.hasKey("groq") && (
                        <button 
                          onClick={() => handleDelete("groq")}
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 border border-panel-border text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* HuggingFace */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-panel-border/40 bg-background/20 text-xs">
                      <div>
                        <span className="font-bold text-foreground block">HuggingFace</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">{getMaskedKey("huggingface")}</span>
                      </div>
                      {store.hasKey("huggingface") && (
                        <button 
                          onClick={() => handleDelete("huggingface")}
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 border border-panel-border text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full rounded-2xl border border-panel-border bg-panel p-6 shadow-2xl relative">
            <div className="h-10 w-10 rounded-xl bg-amber-coach/10 text-amber-coach flex items-center justify-center mb-4">
              <Key className="h-5 w-5" />
            </div>

            <h3 className="text-lg font-bold text-foreground tracking-tight">Confirm Local Key Storage</h3>
            <p className="text-muted-foreground text-xs leading-relaxed mt-2">
              Would you like to encrypt this API key using client-side **AES-256** and save it within your browser's private **localStorage**?
            </p>
            <p className="text-[10px] text-amber-coach font-mono mt-2 leading-relaxed bg-amber-coach/5 border border-amber-coach/10 rounded-lg p-2.5">
              ⚠️ GitMaster never sends your cleartext key to any external servers. The key is decrypted synchronously inside your sandbox session to make direct client requests only.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setApiKey("");
                  setShowConfirmModal(false);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-panel-border bg-panel text-xs text-foreground font-semibold hover:bg-panel/60 transition-colors"
              >
                No, Discard
              </button>
              <button 
                onClick={confirmSaveKey}
                className="px-3.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Yes, Encrypt & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
