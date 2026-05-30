"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export default function MockWorkspace() {
  const [mounted, setMounted] = useState(false);
  const [terminalText, setTerminalText] = useState("git init");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [cliStep, setCliStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const steps = [
      { cmd: "git init", out: ["Initialized empty Git repository in /workspace/.git/"] },
      { cmd: "echo 'hello' > index.js", out: [] },
      { cmd: "git status", out: ["On branch main", "Untracked files:", "  (use \"git add <file>...\" to include in what will be committed)", "	index.js", "nothing added to commit but untracked files present"] },
      { cmd: "git add index.js", out: [] },
      { cmd: "git commit -m 'Initial commit'", out: ["[main (root-commit) a8b9c7d] Initial commit", " 1 file changed, 1 insertion(+)", " create mode 100644 index.js"] },
      { cmd: "git branch feature-auth", out: [] },
      { cmd: "git checkout feature-auth", out: ["Switched to branch 'feature-auth'"] }
    ];

    const timer = setTimeout(() => {
      const current = steps[cliStep % steps.length];
      setTerminalText(current.cmd);
      
      const outTimer = setTimeout(() => {
        setTerminalOutput(prev => [...prev, `$ ${current.cmd}`, ...current.out]);
        setCliStep(prev => prev + 1);
      }, 1500);

      return () => clearTimeout(outTimer);
    }, 3500);

    return () => clearTimeout(timer);
  }, [cliStep, mounted]);

  if (!mounted) {
    // Return placeholder skeleton during hydration
    return (
      <div className="mx-auto max-w-5xl h-[480px] rounded-2xl border border-panel-border bg-panel/20 animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto max-w-5xl rounded-2xl border border-panel-border bg-panel/40 backdrop-blur-xl shadow-2xl overflow-hidden p-1.5"
    >
      {/* Mac window controls */}
      <div className="flex items-center justify-between border-b border-panel-border/60 px-4 py-3 bg-panel/20">
        <div className="flex gap-2">
          <div className="h-3.5 w-3.5 rounded-full bg-destructive/80" />
          <div className="h-3.5 w-3.5 rounded-full bg-amber-coach/80" />
          <div className="h-3.5 w-3.5 rounded-full bg-mint/80" />
        </div>
        <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-indigo-brand" /> playground workspace
        </div>
        <div className="w-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] font-mono text-left text-sm">
        {/* Visual graph preview panel */}
        <div className="md:col-span-5 border-r border-panel-border/60 bg-background/30 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Live Git Graph (DAG)</span>
            <div className="mt-8 flex flex-col gap-6 relative pl-6">
              {/* Vertical branch line */}
              <div className="absolute left-8.5 top-2 bottom-2 w-0.5 bg-indigo-brand/30" />
              
              {/* Commits */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-brand border-4 border-background shadow-lg shadow-indigo-brand/40 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-mint">c3_auth</span>
                    <span className="text-[10px] rounded px-1.5 bg-indigo-brand/20 text-indigo-brand">HEAD</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Add Login Flow</span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-brand border-4 border-background shadow-lg shadow-indigo-brand/40" />
                <div>
                  <span className="text-xs font-bold text-indigo-brand">c2_db</span>
                  <p className="text-xs text-muted-foreground">Add Schema</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="h-6.5 w-6.5 rounded-full bg-mint border-4 border-background shadow-lg shadow-mint/40" />
                <div>
                  <span className="text-xs font-bold text-mint">c1_init</span>
                  <p className="text-xs text-muted-foreground">Initial Commit</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-panel-border/40 pt-4 flex justify-between items-center text-xs text-muted-foreground">
            <span>Active Branch: <span className="text-mint font-semibold">feature-auth</span></span>
            <span>3 Commits</span>
          </div>
        </div>

        {/* Simulated Live Terminal panel */}
        <div className="md:col-span-7 bg-background/50 p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
            {terminalOutput.slice(-10).map((line, idx) => (
              <p key={idx} className={line.startsWith("$") ? "text-indigo-brand" : "text-muted-foreground whitespace-pre-wrap pl-3"}>
                {line}
              </p>
            ))}
            <div className="flex items-center gap-2 text-mint font-semibold mt-1">
              <span>$</span>
              <span className="text-foreground border-r-2 border-mint pr-0.5 animate-caret">
                {terminalText}
              </span>
            </div>
          </div>

          <div className="border-t border-panel-border/40 pt-4 text-xs text-muted-foreground flex justify-between">
            <span>100% Client-Side Git Engine</span>
            <span className="text-indigo-brand animate-pulse">Running live...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
