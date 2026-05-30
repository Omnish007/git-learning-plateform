"use client";

import { useState } from "react";
import { HelpCircle, ChevronRight, Play, AlertCircle, RefreshCw, Layers, ArrowRightLeft, FileCode, CheckCircle2 } from "lucide-react";
import { projectCommand, WwhiProjection } from "@/lib/git-engine/wwhi-engine";
import { useGitStore } from "@/lib/git-engine/store";

export default function WwhiPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("git reset --hard HEAD~1");
  const [projection, setProjection] = useState<WwhiProjection | null>(null);

  const gitStore = useGitStore();

  const handlePreview = () => {
    if (!commandInput.trim()) return;
    const res = projectCommand(commandInput.trim());
    setProjection(res);
  };

  const handleInjectCommand = () => {
    if (!projection || !projection.isValid) return;
    
    // Select terminal element or inject directly into active store history to trigger updates
    // For xterm injection, the xterm is running. We can execute it directly on the store
    // to simulate standard injection!
    try {
      const { executeCommand } = require("@/lib/git-engine/cli");
      executeCommand(projection.command);
      
      // Force trigger state updates across components
      gitStore.writeFile(".gitmaster-touch", ""); 
      gitStore.deleteFile(".gitmaster-touch");
      
      setIsOpen(false);
      setProjection(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Sleek Alert/Preview Trigger in the shell toolbar */}
      <button 
        onClick={() => {
          setIsOpen(true);
          handlePreview();
        }}
        className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-coach/30 bg-amber-coach/10 text-amber-coach hover:bg-amber-coach/20 transition-all cursor-pointer font-bold"
      >
        <HelpCircle className="h-3 w-3" /> "What If?" Previewer
      </button>

      {/* Slide-over Drawer modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-xl w-full rounded-2xl border border-panel-border bg-panel p-6 shadow-2xl relative flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-panel-border/60">
              <span className="text-xs uppercase tracking-wider text-amber-coach font-bold flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5" /> What Would Happen If...
              </span>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setProjection(null);
                }}
                className="text-muted-foreground hover:text-foreground text-[10px] font-mono"
              >
                [close]
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="git reset --hard HEAD~1"
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-background border border-panel-border text-foreground font-mono focus:outline-none focus:border-amber-coach/60"
              />
              <button
                onClick={handlePreview}
                className="px-4 py-2 rounded-xl bg-amber-coach text-background text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Preview
              </button>
            </div>

            {/* Dry-Run Consequence Outputs */}
            {projection && (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 max-h-[360px] pr-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Description Panel */}
                <div className="rounded-xl border border-panel-border bg-background/40 p-4">
                  <span className="text-[10px] text-amber-coach block font-mono font-bold uppercase">Projected Explanation</span>
                  <p className="text-xs text-foreground mt-1.5 leading-relaxed">
                    {projection.description}
                  </p>
                </div>

                {/* Validation Errors */}
                {projection.error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Validation Error</span>
                      <p className="mt-0.5 leading-relaxed font-mono">{projection.error}</p>
                    </div>
                  </div>
                )}

                {/* Valid projection details */}
                {projection.isValid && !projection.error && (
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    
                    {/* Head pointers shifts */}
                    {projection.headChange && (
                      <div className="border border-panel-border/40 rounded-xl p-3 bg-background/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="h-4 w-4 text-indigo-brand" />
                          <span className="font-semibold text-foreground">HEAD Reference</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-muted-foreground truncate max-w-[120px]">{projection.headChange.before}</span>
                          <span className="text-amber-coach">➔</span>
                          <span className="text-mint font-bold truncate max-w-[120px]">{projection.headChange.after}</span>
                        </div>
                      </div>
                    )}

                    {/* Lost and Added Commits */}
                    {projection.graphChange && (projection.graphChange.commitsAdded.length > 0 || projection.graphChange.commitsLost.length > 0) && (
                      <div className="border border-panel-border/40 rounded-xl p-3.5 bg-background/20 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-panel-border/30">
                          <Layers className="h-4 w-4 text-indigo-brand" />
                          <span className="font-semibold text-foreground">Projected Graph Shifts</span>
                        </div>

                        {projection.graphChange.commitsAdded.map((c) => (
                          <div key={c.sha} className="flex justify-between items-center text-xs">
                            <span className="text-mint font-bold">+ New Commit</span>
                            <span className="text-muted-foreground italic">"{c.message}"</span>
                          </div>
                        ))}

                        {projection.graphChange.commitsLost.map((c) => (
                          <div key={c.sha} className="flex justify-between items-center text-xs">
                            <span className="text-rose-400 font-bold">- Commit Detached</span>
                            <span className="text-muted-foreground line-through italic">"{c.message}"</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* File system shifts */}
                    {projection.fileChange && projection.fileChange.length > 0 && (
                      <div className="border border-panel-border/40 rounded-xl p-3.5 bg-background/20 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-panel-border/30">
                          <FileCode className="h-4 w-4 text-indigo-brand" />
                          <span className="font-semibold text-foreground">Projected File System Actions</span>
                        </div>

                        {projection.fileChange.map((f) => (
                          <div key={f.path} className="flex justify-between items-center text-xs">
                            <span className="text-foreground">{f.path}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              f.action === "delete" ? "text-rose-400 bg-rose-400/10" : "text-mint bg-mint/10"
                            }`}>
                              {f.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!projection.headChange && (!projection.graphChange || (projection.graphChange.commitsAdded.length === 0 && projection.graphChange.commitsLost.length === 0)) && (!projection.fileChange || projection.fileChange.length === 0) && (
                      <div className="text-center py-4 text-xs text-muted-foreground italic">
                        No active modifications projected. Clean workspace state.
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            {projection && projection.isValid && !projection.error && (
              <div className="flex justify-end gap-3 pt-2 border-t border-panel-border/40">
                <span className="text-[10px] text-amber-coach flex items-center gap-1.5 font-mono mr-auto animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Dry-run verified!
                </span>
                <button
                  onClick={handleInjectCommand}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Play className="h-3 w-3 stroke-[2.5]" /> Run Command Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
