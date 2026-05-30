"use client";

import { useState } from "react";
import { Sparkles, Terminal, Copy, Check, Play } from "lucide-react";
import { useGitStore } from "@/lib/git-engine/store";

export default function Nl2GitSidebar() {
  const [query, setQuery] = useState("");
  const [translated, setTranslated] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const gitStore = useGitStore();

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsTranslating(true);
    setTranslated("");
    setExecuted(false);

    try {
      // Local dictionary fallback matching standard intents
      const text = query.trim().toLowerCase();
      let result = "";

      if (text.includes("stage all") || text.includes("add all") || text.includes("stage everything")) {
        result = "git add .";
      } else if (text.includes("stage file") || text.includes("add file")) {
        const fileMatch = text.match(/(?:file)\s+(\S+)/) || text.match(/(?:add)\s+(\S+)/);
        result = `git add ${fileMatch ? fileMatch[1] : "README.md"}`;
      } else if (text.includes("commit with") || text.includes("commit and message") || text.includes("commit message")) {
        const msgMatch = text.match(/(?:"|')([^"']+)(?:"|')/) || text.match(/(?:message|with)\s+(.+)/);
        result = `git commit -m "${msgMatch ? msgMatch[1] : "Update files"}"`;
      } else if (text.includes("commit")) {
        result = 'git commit -m "Update work"';
      } else if (text.includes("new branch") || text.includes("create branch")) {
        const branchMatch = text.match(/(?:branch)\s+(\S+)/) || text.match(/(?:create)\s+(\S+)/);
        result = `git branch ${branchMatch ? branchMatch[1] : "feature-dev"}`;
      } else if (text.includes("checkout branch") || text.includes("switch to branch") || text.includes("switch branch")) {
        const branchMatch = text.match(/(?:branch|to)\s+(\S+)/) || text.match(/(?:checkout)\s+(\S+)/);
        result = `git checkout ${branchMatch ? branchMatch[1] : "main"}`;
      } else if (text.includes("checkout new branch") || text.includes("create and switch")) {
        const branchMatch = text.match(/(?:branch)\s+(\S+)/);
        result = `git checkout -b ${branchMatch ? branchMatch[1] : "feature-dev"}`;
      } else if (text.includes("reset hard") || text.includes("undo hard") || text.includes("discard changes")) {
        result = "git reset --hard HEAD";
      } else if (text.includes("reset soft") || text.includes("undo commit keep files")) {
        result = "git reset --soft HEAD~1";
      } else if (text.includes("reset mixed") || text.includes("undo commit unstage")) {
        result = "git reset HEAD~1";
      } else if (text.includes("stash changes") || text.includes("save stash") || text.includes("stash WIP")) {
        result = "git stash";
      } else if (text.includes("pop stash") || text.includes("restore stash")) {
        result = "git stash pop";
      } else if (text.includes("show log") || text.includes("history") || text.includes("show commits")) {
        result = "git log --oneline";
      } else if (text.includes("show status") || text.includes("what modified") || text.includes("status")) {
        result = "git status";
      } else {
        // Dynamic LLM translation if key configured, or default socratic mock fallback
        const { useAiStore } = require("@/lib/ai-store");
        const aiStore = useAiStore.getState();
        const activeProvider = aiStore.activeProvider;

        if (activeProvider !== "mock") {
          const { streamSocraticDialogue } = require("@/lib/ai-service");
          let rawOutput = "";
          await streamSocraticDialogue(
            `You are a precise Git natural language translator. Translate this description into a single, valid, exact git command line: "${query}". Return ONLY the command line string itself, with no explanation, no backticks, no markdown tags.`,
            (token: string) => {
              rawOutput += token;
              setTranslated(rawOutput.trim());
            }
          );
          result = rawOutput.trim();
        } else {
          // Standard offline guess fallback
          result = 'git commit -m "Dynamic update"';
        }
      }

      setTranslated(result || 'git commit -m "Update work"');
    } catch (err) {
      console.error(err);
      setTranslated("git status");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    if (!translated) return;
    try {
      const { executeCommand } = require("@/lib/git-engine/cli");
      executeCommand(translated);

      // Force refresh of state store
      gitStore.writeFile(".gitmaster-touch", "");
      gitStore.deleteFile(".gitmaster-touch");

      setExecuted(true);
      setTimeout(() => setExecuted(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      <form onSubmit={handleTranslate} className="flex flex-col gap-2.5">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Describe Intent</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Stage README and commit with message 'init'..."
          rows={3}
          className="w-full text-xs px-3 py-2 rounded-xl bg-background border border-panel-border text-foreground focus:outline-none focus:border-indigo-brand/60 resize-none font-medium leading-relaxed"
        />
        <button
          type="submit"
          disabled={isTranslating}
          className="w-full h-8.5 rounded-xl bg-indigo-brand text-white text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" /> {isTranslating ? "Translating..." : "Translate to CLI"}
        </button>
      </form>

      {translated && (
        <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Translated CLI Command</span>
          
          <div className="p-3.5 rounded-xl bg-[#060609] border border-panel-border flex flex-col gap-2">
            <code className="text-xs text-mint font-mono leading-relaxed break-all select-all block">
              {translated}
            </code>

            <div className="flex justify-end gap-2 border-t border-panel-border/30 pt-2.5 mt-1">
              <button
                onClick={handleCopy}
                className="h-7 px-2.5 rounded-lg border border-panel-border text-[10px] font-semibold text-foreground hover:bg-panel/40 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-mint" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleExecute}
                className="h-7 px-2.5 rounded-lg bg-foreground text-background text-[10px] font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                {executed ? <Check className="h-3 w-3 text-mint" /> : <Terminal className="h-3 w-3" />}
                {executed ? "Ran Command!" : "Run Command"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
