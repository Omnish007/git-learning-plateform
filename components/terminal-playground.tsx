"use client";

import { useEffect, useRef } from "react";
import { Terminal as XtermTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useGitStore } from "@/lib/git-engine/store";
import { executeCommand } from "@/lib/git-engine/cli";

import WwhiPanel from "./wwhi-panel";

export default function TerminalPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XtermTerminal | null>(null);
  const inputBuffer = useRef<string>("");
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);

  // Read HEAD details from store for prompt decoration
  const store = useGitStore();
  const activeBranch = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : "detached";

  const getPrompt = (branch: string) => {
    return `\r\n\x1b[38;2;74;222;128mgitmaster@sandbox\x1b[0m \x1b[38;2;129;140;248m/workspace\x1b[0m \x1b[38;2;251;191;36m(${branch})\x1b[0m\r\n$ `;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize Xterm
    const term = new XtermTerminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 14,
      fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
      theme: {
        background: "#060609", // Obsidian deep
        foreground: "#f4f4f5",
        cursor: "#4ade80", // Mint teal
        selectionBackground: "rgba(129, 140, 248, 0.2)",
        black: "#000000",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#fbbf24",
        blue: "#818cf8",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#f4f4f5",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    // Write initial welcome text
    term.writeln("\x1b[33m*** Welcome to GitMaster Interactive Terminal Shell ***\x1b[0m");
    term.writeln("Type shell commands like \x1b[36mls, echo, touch, cat\x1b[0m or standard \x1b[32mgit commands\x1b[0m.");
    term.write(getPrompt(activeBranch));

    // Handle resizing
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    // 2. Keyboard inputs handling
    term.onKey(({ key, domEvent }) => {
      const charCode = domEvent.keyCode;

      if (charCode === 13) {
        // Enter Key
        const cmd = inputBuffer.current.trim();
        term.write("\r\n");

        if (cmd) {
          // Add to command history
          commandHistory.current.push(cmd);
          historyIndex.current = commandHistory.current.length;

          // Execute
          const res = executeCommand(cmd);

          if (res.specialAction === "clear") {
            term.clear();
          } else {
            if (res.stdout) {
              term.write(res.stdout.replace(/\n/g, "\r\n"));
            }
            if (res.stderr) {
              term.write(`\x1b[31m${res.stderr.replace(/\n/g, "\r\n")}\x1b[0m`);
            }
          }
        }

        inputBuffer.current = "";
        // Re-read current active branch in case it changed (checkout)
        const updatedBranch = useGitStore.getState().HEAD.startsWith("ref: ") 
          ? useGitStore.getState().HEAD.substring(16) 
          : "detached";
        term.write(getPrompt(updatedBranch));

      } else if (charCode === 8) {
        // Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (charCode === 38) {
        // Up Arrow (Command History)
        if (commandHistory.current.length > 0 && historyIndex.current > 0) {
          historyIndex.current -= 1;
          // Clear current typed line
          term.write("\b \b".repeat(inputBuffer.current.length));
          
          const pastCmd = commandHistory.current[historyIndex.current];
          inputBuffer.current = pastCmd;
          term.write(pastCmd);
        }
      } else if (charCode === 40) {
        // Down Arrow
        if (historyIndex.current < commandHistory.current.length - 1) {
          historyIndex.current += 1;
          term.write("\b \b".repeat(inputBuffer.current.length));
          
          const pastCmd = commandHistory.current[historyIndex.current];
          inputBuffer.current = pastCmd;
          term.write(pastCmd);
        } else if (historyIndex.current === commandHistory.current.length - 1) {
          historyIndex.current += 1;
          term.write("\b \b".repeat(inputBuffer.current.length));
          inputBuffer.current = "";
        }
      } else if (charCode === 9) {
        // Tab (Basic autocomplete skeleton)
        domEvent.preventDefault();
        const typed = inputBuffer.current.trim();
        if (typed.startsWith("git ")) {
          const sub = typed.substring(4);
          const commands = ["status", "commit", "add", "branch", "checkout", "log", "reset", "stash"];
          const matched = commands.filter((c) => c.startsWith(sub));
          if (matched.length === 1) {
            const complement = matched[0].substring(sub.length);
            inputBuffer.current += complement;
            term.write(complement);
          }
        }
      } else {
        // Normal character entry
        // Exclude control characters
        if (!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey && charCode !== 27) {
          inputBuffer.current += key;
          term.write(key);
        }
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-background/80 rounded-2xl border border-panel-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border bg-panel/30">
        <span className="text-xs font-mono font-bold text-indigo-brand flex items-center gap-1.5 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-mint animate-pulse" /> Sandbox CLI Terminal
        </span>
        <div className="flex items-center gap-3">
          <WwhiPanel />
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">xterm.js + client-side git-engine</span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full p-2.5 overflow-hidden" />
    </div>
  );
}

