"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, AlertTriangle, ShieldCheck } from "lucide-react";
import { streamSocraticCoach } from "@/lib/ai-service";
import { useGitStore } from "@/lib/git-engine/store";
import { useAiStore } from "@/lib/ai-store";

interface Message {
  role: "user" | "coach";
  content: string;
}

export default function SocraticCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      content: "Hello! I am your Git Socratic Coach. I won't just hand you commands—I will ask questions to help you master Git concepts. What are we trying to accomplish in our sandbox today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const gitStore = useGitStore();
  const aiStore = useAiStore();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamedText]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const query = inputValue.trim();
    setInputValue("");
    setIsStreaming(true);
    setStreamedText("");

    // Append user message
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    // Build context
    const files = Object.keys(gitStore.fileSystem);
    const gitStatus = Object.entries(gitStore.getStatus())
      .map(([f, c]) => `${f} (${c})`)
      .join("\n") || "working tree clean";

    const activeBranch = gitStore.HEAD.startsWith("ref: ")
      ? gitStore.HEAD.substring(16)
      : "detached";

    const context = {
      commandHistory: gitStore.terminalHistory,
      gitStatus,
      activeBranch,
      fileList: files,
      userQuery: query,
    };

    try {
      await streamSocraticCoach(
        context,
        (chunk) => {
          setStreamedText((prev) => prev + chunk);
        },
        () => {
          // Streaming completed callback
          setMessages((prev) => [
            ...prev,
            { role: "coach", content: streamedText || "I hear you. Let me guide you with a question..." },
          ]);
          setStreamedText("");
          setIsStreaming(false);
        },
        (errMessage) => {
          // Error callback
          setMessages((prev) => [
            ...prev,
            { role: "coach", content: `⚠️ Error: ${errMessage}` },
          ]);
          setIsStreaming(false);
        }
      );
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Sparkles Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-coach to-amber-500 text-background shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-[0.96] transition-all cursor-pointer group"
      >
        <Sparkles className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform stroke-[2.2]" />
      </button>

      {/* Floating Chat Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-background/95 backdrop-blur-xl border-l border-panel-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header Panel */}
          <div className="p-4 border-b border-panel-border bg-panel/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-coach/10 text-amber-coach flex items-center justify-center">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Socratic Git Coach</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Engine: <span className="text-amber-coach font-semibold">{aiStore.activeProvider}</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-lg hover:bg-panel text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Context Bounds Indicator */}
          <div className="px-4 py-2 bg-amber-coach/5 border-b border-panel-border/60 text-[10px] text-amber-coach flex items-center justify-between shrink-0 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Live sandbox context active
            </span>
            <span>Files: {Object.keys(gitStore.fileSystem).length}</span>
          </div>

          {/* Chat History Panel */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.role === "user" ? "bg-indigo-brand text-white" : "bg-amber-coach/10 text-amber-coach"
                }`}>
                  {msg.role === "user" ? "U" : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div className={`rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-indigo-brand text-white rounded-tr-none" 
                    : "bg-panel/40 border border-panel-border text-foreground rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Simulated Live Token Streaming */}
            {streamedText && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center bg-amber-coach/10 text-amber-coach">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl p-3 text-xs leading-relaxed bg-panel/40 border border-panel-border text-foreground rounded-tl-none relative">
                  {streamedText}
                  <span className="inline-block h-3.5 w-1 bg-amber-coach ml-0.5 animate-caret shrink-0" />
                </div>
              </div>
            )}

            {isStreaming && !streamedText && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center bg-amber-coach/10 text-amber-coach">
                  <Bot className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="rounded-2xl p-3 text-xs text-muted-foreground bg-panel/20 border border-panel-border/40 rounded-tl-none italic animate-pulse">
                  Analyzing repository snapshots...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input Box */}
          <form onSubmit={handleSend} className="p-4 border-t border-panel-border bg-panel/20 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask coach... (e.g. How do I stage index.js?)"
              className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-background border border-panel-border text-foreground focus:outline-none focus:border-amber-coach/60"
              disabled={isStreaming}
              required
            />
            
            <button
              type="submit"
              className="h-8.5 w-8.5 rounded-xl bg-foreground text-background hover:opacity-90 flex items-center justify-center active:scale-[0.96] transition-all disabled:opacity-50"
              disabled={isStreaming}
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
