"use client";

import { useGitStore } from "@/lib/git-engine/store";
import { GitBranch, Clock, User, Hash } from "lucide-react";
import { useState } from "react";
import { GitCommit } from "@/lib/git-engine/types";

export default function DagVisualizer() {
  const store = useGitStore();
  const history = store.getHistory();
  const activeBranchName = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : null;
  const headHash = store.getCurrentCommitHash();

  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);

  // Group branch names by their target commit SHA
  const branchRefsBySha: Record<string, string[]> = {};
  Object.entries(store.refs).forEach(([refPath, sha]) => {
    if (refPath.startsWith("refs/heads/")) {
      const name = refPath.substring(11);
      if (!branchRefsBySha[sha]) {
        branchRefsBySha[sha] = [];
      }
      branchRefsBySha[sha].push(name);
    }
  });

  const selectedCommit = selectedCommitSha ? store.objectStore[selectedCommitSha] : null;

  return (
    <div className="w-full h-full flex flex-col bg-background/80 rounded-2xl border border-panel-border overflow-hidden p-4 relative">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-panel-border/60">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <GitBranch className="h-4.5 w-4.5 text-indigo-brand" /> Live DAG Git Graph
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          HEAD: <span className="text-mint font-semibold">{activeBranchName || (headHash ? headHash.substring(0, 7) : "detached")}</span>
        </span>
      </div>

      <div className="flex-1 w-full overflow-auto flex flex-col md:flex-row gap-4 relative min-h-[160px]">
        {/* Left Side: SVG commit list */}
        <div className="flex-1 min-h-[180px] overflow-y-auto max-h-[300px] pr-2">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No commits yet. Type 'git commit' to record changes.
            </div>
          ) : (
            <svg className="w-full" height={Math.max(160, history.length * 60 + 20)}>
              {/* Draw Connector Lines */}
              {history.map(({ sha, commit }, idx) => {
                const cy = idx * 60 + 30;
                
                // Draw line to parent (next item in vertical history, since history is sorted latest-first)
                if (idx < history.length - 1) {
                  const nextCy = (idx + 1) * 60 + 30;
                  return (
                    <line
                      key={`line-${sha}`}
                      x1={120}
                      y1={cy}
                      x2={120}
                      y2={nextCy}
                      stroke="var(--indigo-brand)"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      opacity={0.6}
                    />
                  );
                }
                return null;
              })}

              {/* Draw Commit Nodes & Pointers */}
              {history.map(({ sha, commit }, idx) => {
                const cy = idx * 60 + 30;
                const isHead = headHash === sha;
                const shortSha = sha.substring(0, 7);

                // Fetch references pointing to this commit
                const refs = branchRefsBySha[sha] || [];

                return (
                  <g key={`node-${sha}`} className="cursor-pointer group" onClick={() => setSelectedCommitSha(sha)}>
                    {/* Pulsing indicator for active commit */}
                    {isHead && (
                      <circle
                        cx={120}
                        cy={cy}
                        r={12}
                        className="fill-mint/20 stroke-mint animate-pulse"
                        strokeWidth={1}
                      />
                    )}

                    {/* Main commit node */}
                    <circle
                      cx={120}
                      cy={cy}
                      r={7}
                      className={`${isHead ? "fill-mint" : "fill-indigo-brand"} stroke-background group-hover:scale-125 transition-transform`}
                      strokeWidth={2}
                    />

                    {/* Commit label (SHA + Msg) */}
                    <text
                      x={145}
                      y={cy + 4}
                      className="fill-foreground text-[11px] font-mono hover:fill-indigo-brand transition-colors select-none"
                    >
                      <tspan className="font-bold fill-indigo-brand">{shortSha}</tspan>{" "}
                      <tspan className="fill-muted-foreground text-[10px]">
                        {commit.message.length > 25 ? commit.message.substring(0, 25) + "..." : commit.message}
                      </tspan>
                    </text>

                    {/* Ref Decorator Badges (Drawn on the left side) */}
                    {refs.map((branchName, bIdx) => {
                      const isActive = branchName === activeBranchName;
                      const badgeWidth = branchName.length * 6 + 18;
                      const badgeX = 90 - badgeWidth - (bIdx * 65);
                      
                      return (
                        <g key={`badge-${branchName}`}>
                          {/* Badge tag */}
                          <rect
                            x={badgeX}
                            y={cy - 9}
                            width={badgeWidth}
                            height={18}
                            rx={4}
                            className={`${isActive ? "fill-mint/10 stroke-mint/40" : "fill-indigo-brand/10 stroke-indigo-brand/30"}`}
                            strokeWidth={1}
                          />
                          {/* Badge label */}
                          <text
                            x={badgeX + 6}
                            y={cy + 3}
                            className={`text-[9px] font-mono font-semibold ${isActive ? "fill-mint" : "fill-indigo-brand"}`}
                          >
                            {branchName}
                          </text>

                          {/* Link line to node */}
                          <line
                            x1={badgeX + badgeWidth}
                            y1={cy}
                            x2={110}
                            y2={cy}
                            className={`${isActive ? "stroke-mint/50" : "stroke-indigo-brand/35"}`}
                            strokeWidth={1}
                            strokeDasharray="2 1"
                          />
                        </g>
                      );
                    })}

                    {/* HEAD marker tag */}
                    {isHead && refs.length === 0 && (
                      <g>
                        <rect
                          x={40}
                          y={cy - 9}
                          width={40}
                          height={18}
                          rx={4}
                          className="fill-mint/20 stroke-mint"
                          strokeWidth={1}
                        />
                        <text
                          x={48}
                          y={cy + 3}
                          className="text-[9px] font-mono font-bold fill-mint"
                        >
                          HEAD
                        </text>
                        <line
                          x1={80}
                          y1={cy}
                          x2={110}
                          y2={cy}
                          className="stroke-mint/50"
                          strokeWidth={1}
                          strokeDasharray="2 1"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Right Side: Commit Inspector Panel */}
        {selectedCommit && selectedCommitSha && (
          <div className="w-full md:w-64 border border-panel-border bg-panel/30 rounded-xl p-3.5 flex flex-col justify-between text-xs font-mono relative overflow-hidden shrink-0">
            {/* Header decor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-brand/5 rounded-full blur-xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-bold text-indigo-brand">Commit Details</span>
                <button 
                  onClick={() => setSelectedCommitSha(null)}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  [x]
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-indigo-brand" />
                  <span className="font-bold truncate text-[11px]">{selectedCommitSha.substring(0, 16)}...</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-mint" />
                  <span className="text-muted-foreground truncate">{(selectedCommit as GitCommit).author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-coach" />
                  <span className="text-muted-foreground">{new Date((selectedCommit as GitCommit).timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-panel-border/30 pt-3">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Message</span>
                <p className="text-[11px] text-foreground leading-relaxed">
                  {(selectedCommit as GitCommit).message}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-panel-border/30 flex justify-between items-center text-[10px] text-muted-foreground">
              <span>Root Tree SHA:</span>
              <span className="text-indigo-brand font-bold">{(selectedCommit as GitCommit).tree.substring(0, 7)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
