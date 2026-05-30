"use client";

import { useState } from "react";
import { useGitStore } from "@/lib/git-engine/store";
import { FileCode, Plus, Trash2, Sparkles, FolderOpen } from "lucide-react";
import Nl2GitSidebar from "./nl2git-sidebar";

interface VsCodeSidebarProps {
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  activeTab: "files" | "nl2git";
  setActiveTab: (tab: "files" | "nl2git") => void;
}

export default function VsCodeSidebar({
  activeFile,
  setActiveFile,
  activeTab,
  setActiveTab,
}: VsCodeSidebarProps) {
  const store = useGitStore();
  const fileSystem = store.fileSystem;
  const statusMap = store.getStatus();

  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    store.writeFile(path, `// File: ${path}\n`);
    setActiveFile(path);
    setNewFileName("");
    setIsCreating(false);
  };

  const handleDeleteFile = (path: string) => {
    store.deleteFile(path);
    if (activeFile === path) {
      const remaining = Object.keys(store.fileSystem);
      setActiveFile(remaining[0] || null);
    }
  };

  const getStatusBadge = (path: string) => {
    const code = statusMap[path];
    if (!code) return null;

    const colors: Record<string, string> = {
      U: "text-red-400 bg-red-400/20 border border-red-400/30",
      M: "text-amber-400 bg-amber-400/20 border border-amber-400/30",
      A: "text-green-400 bg-green-400/20 border border-green-400/30",
      S: "text-emerald-400 bg-emerald-400/20 border border-emerald-400/30",
      D: "text-rose-500 bg-rose-500/20 border border-rose-500/30 line-through",
    };

    return (
      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${colors[code] || "text-muted-foreground bg-panel"}`}>
        {code}
      </span>
    );
  };

  const fileList = Object.keys(fileSystem);

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0b11] border-r border-[#2a2a3f]">
      {/* Header Tabs with clear prominent borders */}
      <div className="flex bg-[#07070a] border-b border-[#2a2a3f] p-1 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 border ${
            activeTab === "files" 
              ? "bg-[#181826] border-[#3b3b59] text-foreground font-bold shadow-md" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#12121e]"
          }`}
        >
          <FolderOpen className="h-3.5 w-3.5 text-indigo-brand" /> Explorer
        </button>
        <button
          onClick={() => setActiveTab("nl2git")}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 border ${
            activeTab === "nl2git" 
              ? "bg-[#181826] border-[#3b3b59] text-foreground font-bold shadow-md" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#12121e]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-brand animate-pulse" /> NL Assist
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0f]">
        {activeTab === "files" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1e1e2d] pb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Workspace Files</span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="h-5.5 w-5.5 rounded border border-[#2a2a3f] bg-[#12121e] hover:bg-[#1c1c2b] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateFile} className="flex gap-1.5 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="index.js..."
                  autoFocus
                  className="flex-1 text-xs px-2.5 py-1 rounded-lg bg-background border border-[#3b3b59] text-foreground focus:outline-none focus:border-indigo-brand font-mono"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-brand text-white hover:opacity-90 active:scale-95 transition-all"
                >
                  Create
                </button>
              </form>
            )}

            <div className="flex flex-col gap-1">
              {fileList.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-2">Empty workspace</p>
              ) : (
                fileList.map((file) => (
                  <div
                    key={file}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                      activeFile === file
                        ? "bg-[#181826] border-[#3b3b59] text-foreground font-bold shadow-md"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[#12121e]"
                    }`}
                    onClick={() => setActiveFile(file)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <FileCode className={`h-4 w-4 shrink-0 ${activeFile === file ? "text-indigo-brand" : "text-muted-foreground"}`} />
                      <span className="truncate">{file}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(file)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <Nl2GitSidebar />
        )}
      </div>

      {/* Sidebar Footer info with clear borders */}
      <div className="p-3 border-t border-[#2a2a3f] bg-[#07070a] text-[10px] text-muted-foreground select-none font-mono">
        📂 Root: <span className="text-foreground font-semibold">/workspace/</span>
      </div>
    </div>
  );
}
