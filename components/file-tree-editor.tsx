"use client";

import { useState } from "react";
import { useGitStore } from "@/lib/git-engine/store";
import { FileCode, Plus, Trash2, Edit3, Save, Sparkles } from "lucide-react";
import MergeEditor from "./merge-editor";
import Nl2GitSidebar from "./nl2git-sidebar";

export default function FileTreeEditor() {
  const store = useGitStore();
  const fileSystem = store.fileSystem;
  const statusMap = store.getStatus();

  const [activeFile, setActiveFile] = useState<string | null>("README.md");
  const [editorContent, setEditorContent] = useState<string>("");
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"files" | "nl2git">("files");

  // Sync editor content when active file changes
  const handleSelectFile = (file: string) => {
    setActiveFile(file);
    setEditorContent(fileSystem[file] || "");
  };

  const handleSave = () => {
    if (!activeFile) return;
    store.writeFile(activeFile, editorContent);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    store.writeFile(path, `// File: ${path}\n`);
    setActiveFile(path);
    setEditorContent(`// File: ${path}\n`);
    setNewFileName("");
    setIsCreating(false);
  };

  const handleDeleteFile = (path: string) => {
    store.deleteFile(path);
    if (activeFile === path) {
      const remaining = Object.keys(store.fileSystem);
      setActiveFile(remaining[0] || null);
      setEditorContent(remaining[0] ? store.fileSystem[remaining[0]] : "");
    }
  };

  const getStatusBadge = (path: string) => {
    const code = statusMap[path];
    if (!code) return null;

    const colors: Record<string, string> = {
      U: "text-red-400 bg-red-400/10",
      M: "text-amber-400 bg-amber-400/10",
      A: "text-green-400 bg-green-400/10",
      S: "text-emerald-400 bg-emerald-400/10",
      D: "text-rose-500 bg-rose-500/10 line-through",
    };

    const label: Record<string, string> = {
      U: "U",
      M: "M",
      A: "A",
      S: "S",
      D: "D",
    };

    return (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[code] || "text-muted-foreground bg-panel"}`}
      >
        {label[code]}
      </span>
    );
  };

  const fileList = Object.keys(fileSystem);
  const isConflict =
    activeFile &&
    editorContent.includes("<<<<<<< HEAD") &&
    editorContent.includes("=======") &&
    editorContent.includes(">>>>>>>");

  return (
    <div className="w-full h-full grid grid-cols-12 rounded-2xl border border-panel-border bg-background/80 overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="col-span-4 border-r border-panel-border/60 bg-panel/10 flex flex-col justify-between">
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Segmented controls tab */}
          <div className="flex bg-background/50 border border-panel-border/60 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("files")}
              className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                activeTab === "files"
                  ? "bg-panel text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab("nl2git")}
              className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                activeTab === "nl2git"
                  ? "bg-panel text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3 w-3 text-indigo-brand animate-pulse" />{" "}
              NL Assist
            </button>
          </div>

          {activeTab === "files" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Workspace Files
                </span>
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="h-6 w-6 rounded-md hover:bg-panel border border-panel-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {isCreating && (
                <form onSubmit={handleCreateFile} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="index.js..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-background border border-panel-border text-foreground focus:outline-none focus:border-indigo-brand/60"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-brand text-white"
                  >
                    Create
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                {fileList.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-2">
                    Empty workspace
                  </p>
                ) : (
                  fileList.map((file) => (
                    <div
                      key={file}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs font-mono cursor-pointer transition-all border ${
                        activeFile === file
                          ? "bg-panel/40 border-panel-border text-foreground font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-panel/20"
                      }`}
                      onClick={() => handleSelectFile(file)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden truncate">
                        <FileCode
                          className={`h-4 w-4 shrink-0 ${activeFile === file ? "text-indigo-brand" : "text-muted-foreground"}`}
                        />
                        <span className="truncate">{file}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(file)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <Nl2GitSidebar />
          )}
        </div>

        <div className="p-4 border-t border-panel-border/40 text-[10px] text-muted-foreground">
          📂 Root:{" "}
          <span className="font-mono text-foreground font-semibold">
            /workspace/
          </span>
        </div>
      </div>

      {/* Code Editor Space */}
      <div className="col-span-8 flex flex-col bg-background/50">
        {activeFile ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border bg-panel/30">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5 text-indigo-brand" /> {activeFile}
              </span>

              {!isConflict && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-xs font-semibold active:scale-[0.98]"
                >
                  <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
                </button>
              )}
            </div>

            {/* Content Field */}
            {isConflict ? (
              <MergeEditor
                fileName={activeFile}
                content={editorContent}
                onResolved={() => {
                  const resolved = store.fileSystem[activeFile] || "";
                  setEditorContent(resolved);
                }}
              />
            ) : (
              <div className="flex-1 w-full relative p-4 flex font-mono text-xs">
                <div className="pr-3 text-muted-foreground text-right select-none border-r border-panel-border/30 mr-3 flex flex-col gap-1">
                  {Array.from({
                    length: Math.max(
                      1,
                      (editorContent.match(/\n/g) || []).length + 2,
                    ),
                  }).map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>

                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="flex-1 w-full h-full bg-transparent text-foreground border-none resize-none focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto"
                  style={{
                    fontFamily: "JetBrains Mono, Courier New, monospace",
                  }}
                  spellCheck={false}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
            <FileCode className="h-10 w-10 text-panel-border stroke-[1.5] mb-3" />
            <p className="text-xs font-mono">
              No active file selected.
              <br />
              Select or create a file to start editing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
