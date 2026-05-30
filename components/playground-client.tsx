"use client";

import { useState } from "react";
import TerminalPlayground from "./terminal-playground";
import VsCodeSidebar from "./vscode-sidebar";
import VsCodeEditor from "./vscode-editor";
import DagVisualizer from "./dag-visualizer";
import SocraticCoach from "./socratic-coach";
import { useGitStore } from "@/lib/git-engine/store";
import { 
  GitBranch, Sparkles, RefreshCw, ChevronLeft, ChevronRight, 
  Terminal, Layers, Folder, Minimize2, Maximize2 
} from "lucide-react";
import Link from "next/link";

export default function PlaygroundClient() {
  const store = useGitStore();
  const activeBranch = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : "detached";
  const stashesCount = store.stashes.length;

  // VS Code Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"files" | "nl2git">("files");
  const [activeFile, setActiveFile] = useState<string | null>("README.md");
  
  const [bottomOpen, setBottomOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<"terminal" | "graph">("terminal");

  // DRAG RESIZING STATES & VALUES
  const [sidebarWidth, setSidebarWidth] = useState(280); // Default 280px width
  const [bottomHeight, setBottomHeight] = useState(260); // Default 260px height
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  // Horizontal Drag Resize (Sidebar)
  const startResizeSidebar = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingSidebar(true);
    
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      // Calculate new width relative to viewport left edge
      // Subtracting Activity Bar width (48px)
      const newWidth = mouseMoveEvent.clientX - 48;
      if (newWidth > 180 && newWidth < 460) {
        setSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Vertical Drag Resize (Bottom Panel)
  const startResizeBottom = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingBottom(true);
    
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      // Calculate new height relative to viewport bottom edge
      const newHeight = window.innerHeight - mouseMoveEvent.clientY;
      if (newHeight > 120 && newHeight < 600) {
        setBottomHeight(newHeight);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizingBottom(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative h-screen w-screen bg-[#07070a] flex flex-col selection:bg-mint/30 selection:text-mint select-none overflow-hidden text-foreground">
      {/* Background elegant gradient glow */}
      <div className="absolute top-[-30%] left-[50%] translate-x-[-50%] w-[1200px] h-[600px] bg-gradient-to-b from-indigo-brand/10 via-indigo-brand/2 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* VS Code Style Header Bar - High separation contrast */}
      <header className="sticky top-0 z-50 w-full h-12 border-b border-[#2e2e42] bg-[#0c0c12]/95 backdrop-blur-md shrink-0 select-none shadow-md">
        <div className="flex h-full items-center justify-between px-4">
          
          {/* Left: Brand logo & Branch Indicators */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6.5 w-6.5 items-center justify-center rounded bg-gradient-to-tr from-indigo-brand to-mint shadow-lg">
                <GitBranch className="h-3.5 w-3.5 text-background stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold tracking-tight text-foreground sm:inline-block">
                GitMaster <span className="text-[9px] uppercase tracking-widest text-indigo-brand px-1.5 py-0.5 rounded bg-indigo-brand/10 font-bold ml-1">IDE v1</span>
              </span>
            </Link>

            <span className="h-4 w-px bg-[#2a2a3f]" />

            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
                branch: <span className="text-mint font-bold">{activeBranch}</span>
              </span>
              <span className="text-muted-foreground">
                stashes: <span className="text-indigo-brand font-bold">{stashesCount}</span>
              </span>
            </div>
          </div>

          {/* Right: Engine quick actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/settings/ai" 
              className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded border border-[#2e2e42] bg-[#181826] text-amber-coach hover:bg-[#202035] hover:border-amber-coach/40 transition-all font-bold shadow-sm"
            >
              <Sparkles className="h-3 w-3" /> Coach Settings
            </Link>
            <button 
              onClick={() => store.init()}
              className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded border border-[#2e2e42] bg-[#181826] text-muted-foreground hover:text-foreground hover:bg-[#202035] hover:border-muted-foreground/40 transition-all cursor-pointer font-bold shadow-sm"
            >
              <RefreshCw className="h-3 w-3" /> Reset Engine
            </button>
            <Link 
              href="/" 
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hover:underline"
            >
              [Exit]
            </Link>
          </div>
        </div>
      </header>

      {/* Main VS Code Workspace Body - Locked to viewport remaining height */}
      <main className="flex-1 w-full flex min-h-0 overflow-hidden relative">
        
        {/* 1. Activity Bar (Far Left Strip) - Prominent Contrast Borders */}
        <div className="w-12 border-r border-[#2e2e42] bg-[#09090e] flex flex-col items-center py-4 gap-4.5 select-none shrink-0 z-10 shadow-lg">
          <button
            onClick={() => {
              setSidebarTab("files");
              setSidebarOpen(true);
            }}
            className={`p-2 rounded-lg cursor-pointer transition-all hover:bg-[#181826]/60 border ${
              sidebarOpen && sidebarTab === "files" 
                ? "text-indigo-brand bg-indigo-brand/10 border-indigo-brand/35 shadow" 
                : "text-muted-foreground border-transparent"
            }`}
            title="Workspace Explorer"
          >
            <Folder className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => {
              setSidebarTab("nl2git");
              setSidebarOpen(true);
            }}
            className={`p-2 rounded-lg cursor-pointer transition-all hover:bg-[#181826]/60 border ${
              sidebarOpen && sidebarTab === "nl2git" 
                ? "text-indigo-brand bg-indigo-brand/10 border-indigo-brand/35 shadow animate-pulse" 
                : "text-muted-foreground border-transparent"
            }`}
            title="NL Intent Assist"
          >
            <Sparkles className="h-4.5 w-4.5" />
          </button>

          <span className="w-6 h-px bg-[#2a2a3f] my-1" />

          <button
            onClick={() => store.init()}
            className="p-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-[#181826]/60 transition-colors"
            title="Reset Database"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* 2. Collapsible Sidebar Panel with Custom DRAGGABLE Horizontal border */}
        {sidebarOpen ? (
          <div 
            style={{ width: `${sidebarWidth}px` }}
            className="shrink-0 h-full flex flex-col relative animate-in slide-in-from-left duration-200 border-r border-[#2e2e42] select-none"
          >
            <VsCodeSidebar 
              activeFile={activeFile} 
              setActiveFile={setActiveFile} 
              activeTab={sidebarTab}
              setActiveTab={setSidebarTab}
            />

            {/* Drag Handle Bar - Left Resizer with glowing highlight */}
            <div 
              onMouseDown={startResizeSidebar}
              className={`absolute top-0 right-[-3px] w-1.5 h-full cursor-col-resize z-40 transition-colors ${
                isResizingSidebar ? "bg-indigo-brand/60" : "bg-transparent hover:bg-indigo-brand/30"
              }`}
              title="Drag border to resize sidebar"
            />

            {/* Collapse Trigger button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2.5 right-[-11px] z-50 h-5.5 w-5.5 rounded-full border border-[#2e2e42] bg-[#181826] flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg cursor-pointer hover:scale-105 transition-all"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Expand Sidebar floating trigger button */
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-14 top-4 z-40 h-8 w-8 rounded-xl border border-[#2e2e42] bg-[#181826] flex items-center justify-center text-muted-foreground hover:text-foreground shadow-2xl hover:scale-105 transition-all cursor-pointer hover:border-indigo-brand/50"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* 3. Center Workspace Area: Main Editor & Drag Resizable Bottom Panel */}
        <div className="flex-1 h-full flex flex-col min-w-0 bg-[#08080c]">
          
          {/* Top Panel: Monospace Code Editor */}
          <div className="flex-1 min-h-0 p-4">
            <VsCodeEditor activeFile={activeFile} setActiveFile={setActiveFile} />
          </div>

          {/* Bottom Panel Drawer: Terminal & DAG Commit Graph - Drag Resizable */}
          <div 
            className="shrink-0 border-t border-[#2e2e42] bg-[#0c0c12] flex flex-col relative select-none"
          >
            {/* Drag Handle Bar - Top Resizer with glowing highlight */}
            {bottomOpen && (
              <div 
                onMouseDown={startResizeBottom}
                className={`absolute top-[-3px] left-0 w-full h-1.5 cursor-row-resize z-40 transition-colors ${
                  isResizingBottom ? "bg-mint/60" : "bg-transparent hover:bg-mint/30"
                }`}
                title="Drag border to resize bottom panel"
              />
            )}

            {/* Header Tabs bar - Prominent Separation */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e42] bg-[#09090e] select-none">
              <div className="flex gap-4.5">
                <button
                  onClick={() => {
                    if (bottomTab === "terminal" && bottomOpen) {
                      setBottomOpen(false);
                    } else {
                      setBottomTab("terminal");
                      setBottomOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold py-1 border-b-2 cursor-pointer transition-all ${
                    bottomOpen && bottomTab === "terminal" 
                      ? "text-mint border-mint font-bold" 
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" /> Terminal Console
                </button>
                
                <button
                  onClick={() => {
                    if (bottomTab === "graph" && bottomOpen) {
                      setBottomOpen(false);
                    } else {
                      setBottomTab("graph");
                      setBottomOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold py-1 border-b-2 cursor-pointer transition-all ${
                    bottomOpen && bottomTab === "graph" 
                      ? "text-indigo-brand border-indigo-brand font-bold" 
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" /> Live Git DAG Graph
                </button>
              </div>

              {/* Minimizer / Expander toggles */}
              <button
                onClick={() => setBottomOpen(!bottomOpen)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-[#181826] cursor-pointer"
                title={bottomOpen ? "Minimize Panel" : "Restore Panel"}
              >
                {bottomOpen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Bottom Panel Body content */}
            {bottomOpen && (
              <div 
                style={{ height: `${bottomHeight}px` }}
                className="w-full p-4 overflow-hidden animate-in slide-in-from-bottom duration-200 bg-[#09090e]/80"
              >
                {bottomTab === "terminal" ? (
                  <TerminalPlayground />
                ) : (
                  <div className="h-full border border-[#2e2e42] rounded-2xl overflow-hidden bg-[#07070a] shadow-inner">
                    <DagVisualizer />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Floating Socratic Coach Chat Drawer */}
      <SocraticCoach />
    </div>
  );
}
