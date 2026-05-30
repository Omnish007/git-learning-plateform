"use client";

import { useState, useEffect } from "react";
import { GitMerge, Check, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useGitStore } from "@/lib/git-engine/store";

interface MergeEditorProps {
  fileName: string;
  content: string;
  onResolved: () => void;
}

export default function MergeEditor({ fileName, content, onResolved }: MergeEditorProps) {
  const store = useGitStore();

  const [ours, setOurs] = useState("");
  const [theirs, setTheirs] = useState("");
  const [incomingBranchName, setIncomingBranchName] = useState("incoming");
  const [leadingContent, setLeadingContent] = useState("");
  const [trailingContent, setTrailingContent] = useState("");

  useEffect(() => {
    // Parse out conflict markers
    const headMarker = "<<<<<<< HEAD\n";
    const dividerMarker = "\n=======\n";
    const endMarker = "\n>>>>>>> ";

    const headIdx = content.indexOf(headMarker);
    const divIdx = content.indexOf(dividerMarker);
    const endIdx = content.indexOf(endMarker);

    if (headIdx !== -1 && divIdx !== -1 && endIdx !== -1 && divIdx > headIdx && endIdx > divIdx) {
      const lead = content.substring(0, headIdx);
      const ourPart = content.substring(headIdx + headMarker.length, divIdx);
      
      const rest = content.substring(endIdx + endMarker.length);
      const branchNameEndIdx = rest.indexOf("\n");
      const branchName = branchNameEndIdx !== -1 ? rest.substring(0, branchNameEndIdx) : "incoming";
      const trail = branchNameEndIdx !== -1 ? rest.substring(branchNameEndIdx + 1) : rest;

      const theirPart = content.substring(divIdx + dividerMarker.length, endIdx);

      setLeadingContent(lead);
      setOurs(ourPart);
      setTheirs(theirPart);
      setIncomingBranchName(branchName);
      setTrailingContent(trail);
    }
  }, [content]);

  const handleResolve = (resolution: "ours" | "theirs" | "both") => {
    let finalSelection = "";
    if (resolution === "ours") {
      finalSelection = ours;
    } else if (resolution === "theirs") {
      finalSelection = theirs;
    } else {
      finalSelection = ours + "\n" + theirs;
    }

    const resolvedContent = leadingContent + finalSelection + trailingContent;
    store.writeFile(fileName, resolvedContent);
    onResolved();
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-background/40 backdrop-blur-md p-6 font-sans overflow-y-auto animate-in fade-in duration-300">
      
      {/* Alert Header Banner */}
      <div className="rounded-2xl border border-amber-coach/30 bg-amber-coach/10 p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-coach shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-foreground tracking-tight">Merge Conflict Detected in {fileName}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Standard Git merge auto-resolver failed because changes conflict. Use this Apple-style visual editor to select which line variations to preserve.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6">
        
        {/* Left Side: Current Branch (Ours) */}
        <div className="rounded-2xl border border-indigo-brand/30 bg-indigo-brand/5 p-5 flex flex-col justify-between hover:border-indigo-brand/50 transition-colors">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="h-2 w-2 rounded-full bg-indigo-brand animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-brand">Ours (Current Branch)</span>
            </div>
            <h5 className="text-sm font-bold text-foreground mb-3">Keep Local Changes</h5>
            <div className="p-3.5 rounded-xl bg-background/50 border border-panel-border/60 font-mono text-xs text-foreground min-h-[120px] whitespace-pre-wrap">
              {ours || <span className="italic text-muted-foreground">Empty variation block</span>}
            </div>
          </div>
          <button 
            onClick={() => handleResolve("ours")}
            className="w-full mt-5 h-9 rounded-xl bg-indigo-brand text-white text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Accept Local (Ours)
          </button>
        </div>

        {/* Right Side: Incoming Branch (Theirs) */}
        <div className="rounded-2xl border border-mint/30 bg-mint/5 p-5 flex flex-col justify-between hover:border-mint/50 transition-colors">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-mint">Theirs (Incoming: {incomingBranchName})</span>
            </div>
            <h5 className="text-sm font-bold text-foreground mb-3">Adopt Incoming changes</h5>
            <div className="p-3.5 rounded-xl bg-background/50 border border-panel-border/60 font-mono text-xs text-foreground min-h-[120px] whitespace-pre-wrap">
              {theirs || <span className="italic text-muted-foreground">Empty variation block</span>}
            </div>
          </div>
          <button 
            onClick={() => handleResolve("theirs")}
            className="w-full mt-5 h-9 rounded-xl bg-mint text-background text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Accept Incoming (Theirs)
          </button>
        </div>

      </div>

      {/* Accept Both Alternative Choice */}
      <div className="border border-panel-border/60 bg-panel/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-panel flex items-center justify-center border border-panel-border text-foreground">
            <ArrowRightLeft className="h-4.5 w-4.5" />
          </div>
          <div>
            <h6 className="text-xs font-bold text-foreground">Accept Combined Output?</h6>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Accept both Ours and Theirs changes, appending incoming modifications directly below local changes.
            </p>
          </div>
        </div>

        <button 
          onClick={() => handleResolve("both")}
          className="h-9.5 px-5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all w-full sm:w-auto text-center"
        >
          Accept Both Changes
        </button>
      </div>

    </div>
  );
}
