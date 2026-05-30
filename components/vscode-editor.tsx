"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useGitStore } from "@/lib/git-engine/store";
import { Edit3, Save, FileCode, Columns, FileText, SplitSquareVertical } from "lucide-react";
import MergeEditor from "./merge-editor";

interface VsCodeEditorProps {
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
}

// Optimized Windowed LCS Line-by-line Diff Algorithm with Fuzzy Similarity heuristics
interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  originalLineNum?: number;
  newLineNum?: number;
}

// Calculate Jaccard similarity of words to pair edited/typo lines fuzzymindedly
function getLineSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  const strA = a.trim();
  const strB = b.trim();
  if (strA === "" && strB === "") return 1.0;
  if (strA === "" || strB === "") return 0.0;
  if (strA === strB) return 0.95;

  const wordsA = strA.toLowerCase().split(/[^a-zA-Z0-9]+/);
  const wordsB = strB.toLowerCase().split(/[^a-zA-Z0-9]+/);
  
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  
  let intersect = 0;
  setA.forEach(w => {
    if (w && setB.has(w)) intersect++;
  });
  
  const union = new Set([...wordsA, ...wordsB]).size;
  if (union === 0) return 0.0;
  
  return intersect / union;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // Step 1: Scan identical lines from start
  let start = 0;
  while (
    start < originalLines.length &&
    start < modifiedLines.length &&
    originalLines[start] === modifiedLines[start]
  ) {
    start++;
  }

  // Step 2: Scan identical lines from end
  let originalEnd = originalLines.length - 1;
  let modifiedEnd = modifiedLines.length - 1;

  while (
    originalEnd >= start &&
    modifiedEnd >= start &&
    originalLines[originalEnd] === modifiedLines[modifiedEnd]
  ) {
    originalEnd--;
    modifiedEnd--;
  }

  const diff: DiffLine[] = [];

  // 1. Add prefix unchanged lines
  for (let idx = 0; idx < start; idx++) {
    diff.push({
      type: "unchanged",
      content: originalLines[idx],
      originalLineNum: idx + 1,
      newLineNum: idx + 1,
    });
  }

  // 2. Perform LCS matrix ONLY on the middle differing block
  const midOriginal = originalLines.slice(start, originalEnd + 1);
  const midModified = modifiedLines.slice(start, modifiedEnd + 1);

  if (midOriginal.length > 0 || midModified.length > 0) {
    const matrix: number[][] = Array(midOriginal.length + 1)
      .fill(0)
      .map(() => Array(midModified.length + 1).fill(0));

    for (let x = 1; x <= midOriginal.length; x++) {
      for (let y = 1; y <= midModified.length; y++) {
        const lineA = midOriginal[x - 1];
        const lineB = midModified[y - 1];

        // Fuzzy match: lines are exactly identical OR they are longer than 8 chars and share 45%+ Jaccard similarity
        const isMatch = lineA === lineB || (
          lineA.trim().length > 8 &&
          lineB.trim().length > 8 &&
          getLineSimilarity(lineA, lineB) >= 0.45
        );

        if (isMatch) {
          matrix[x][y] = matrix[x - 1][y - 1] + 1;
        } else {
          matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
        }
      }
    }

    let x = midOriginal.length;
    let y = midModified.length;
    const midDiff: DiffLine[] = [];

    while (x > 0 || y > 0) {
      const lineA = x > 0 ? midOriginal[x - 1] : "";
      const lineB = y > 0 ? midModified[y - 1] : "";

      const isMatch = x > 0 && y > 0 && (
        lineA === lineB || (
          lineA.trim().length > 8 &&
          lineB.trim().length > 8 &&
          getLineSimilarity(lineA, lineB) >= 0.45
        )
      );

      if (isMatch) {
        if (lineA === lineB) {
          midDiff.unshift({
            type: "unchanged",
            content: lineA,
            originalLineNum: start + x,
            newLineNum: start + y,
          });
        } else {
          // Matches fuzzymindedly (contains edited typo words). Pushing adjacent so the aligner groups them.
          midDiff.unshift({
            type: "added",
            content: lineB,
            newLineNum: start + y,
          });
          midDiff.unshift({
            type: "removed",
            content: lineA,
            originalLineNum: start + x,
          });
        }
        x--;
        y--;
      } else if (y > 0 && (x === 0 || matrix[x][y - 1] >= matrix[x - 1][y])) {
        midDiff.unshift({
          type: "added",
          content: lineB,
          newLineNum: start + y,
        });
        y--;
      } else if (x > 0 && (y === 0 || matrix[x][y - 1] < matrix[x - 1][y])) {
        midDiff.unshift({
          type: "removed",
          content: lineA,
          originalLineNum: start + x,
        });
        x--;
      }
    }

    diff.push(...midDiff);
  }

  // 3. Add suffix unchanged lines
  const endOriginalOffset = originalEnd + 1;
  const endModifiedOffset = modifiedEnd + 1;
  for (let idx = 0; idx < originalLines.length - endOriginalOffset; idx++) {
    const origIdx = endOriginalOffset + idx;
    const newIdx = endModifiedOffset + idx;
    diff.push({
      type: "unchanged",
      content: originalLines[origIdx],
      originalLineNum: origIdx + 1,
      newLineNum: newIdx + 1,
    });
  }

  return diff;
}

// Word level token difference structures
interface WordToken {
  type: "added" | "removed" | "unchanged";
  text: string;
}

function computeWordDiff(original: string, modified: string): { originalTokens: WordToken[], modifiedTokens: WordToken[] } {
  const origTokens = original.split(/(\s+|\b)/).filter(Boolean);
  const modTokens = modified.split(/(\s+|\b)/).filter(Boolean);

  const matrix: number[][] = Array(origTokens.length + 1)
    .fill(0)
    .map(() => Array(modTokens.length + 1).fill(0));

  for (let i = 1; i <= origTokens.length; i++) {
    for (let j = 1; j <= modTokens.length; j++) {
      if (origTokens[i - 1] === modTokens[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  const originalResult: WordToken[] = [];
  const modifiedResult: WordToken[] = [];

  let i = origTokens.length;
  let j = modTokens.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origTokens[i - 1] === modTokens[j - 1]) {
      originalResult.unshift({ type: "unchanged", text: origTokens[i - 1] });
      modifiedResult.unshift({ type: "unchanged", text: modTokens[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      modifiedResult.unshift({ type: "added", text: modTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      originalResult.unshift({ type: "removed", text: origTokens[i - 1] });
      i--;
    }
  }

  return {
    originalTokens: originalResult,
    modifiedTokens: modifiedResult,
  };
}

// React component to render highlighted word tokens within a modified line
function RenderWordDiff({ original, modified, side }: { original: string, modified: string, side: "left" | "right" }) {
  const { originalTokens, modifiedTokens } = useMemo(() => {
    return computeWordDiff(original, modified);
  }, [original, modified]);

  const tokens = side === "left" ? originalTokens : modifiedTokens;

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === "removed") {
          return (
            <span key={i} className="bg-rose-500/40 text-rose-100 border border-rose-500/50 px-1 rounded line-through decoration-rose-500/60 font-bold">
              {token.text}
            </span>
          );
        } else if (token.type === "added") {
          return (
            <span key={i} className="bg-emerald-500/40 text-emerald-100 border border-emerald-500/50 px-1 rounded font-bold">
              {token.text}
            </span>
          );
        }
        return <span key={i}>{token.text}</span>;
      })}
    </>
  );
}

// Side-by-side Aligner structure pairing modified lines together horizontally
interface DiffRow {
  type: "added" | "removed" | "unchanged" | "modified";
  contentLeft?: string;
  contentRight?: string;
  originalLineNum?: number;
  newLineNum?: number;
}

// Block pairing algorithm aligning consecutive deleted and added lines 1-to-1 starting from top index ONLY if similarity is high
function pairDiffLines(diffList: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let idx = 0;

  while (idx < diffList.length) {
    const current = diffList[idx];

    if (current.type === "unchanged") {
      rows.push({
        type: "unchanged",
        contentLeft: current.content,
        contentRight: current.content,
        originalLineNum: current.originalLineNum,
        newLineNum: current.newLineNum,
      });
      idx++;
    } else {
      // 1. Collect all consecutive removed lines
      const removedBlock: DiffLine[] = [];
      while (idx < diffList.length && diffList[idx].type === "removed") {
        removedBlock.push(diffList[idx]);
        idx++;
      }

      // 2. Collect all consecutive added lines
      const addedBlock: DiffLine[] = [];
      while (idx < diffList.length && diffList[idx].type === "added") {
        addedBlock.push(diffList[idx]);
        idx++;
      }

      // 3. Align chronologically ONLY if similarity is >= 30% to avoid matching completely different unrelated lines (like # Welcome vs test)
      const minLength = Math.min(removedBlock.length, addedBlock.length);
      for (let i = 0; i < minLength; i++) {
        const lineA = removedBlock[i].content;
        const lineB = addedBlock[i].content;

        const sim = getLineSimilarity(lineA, lineB);
        if (sim >= 0.30) {
          rows.push({
            type: "modified",
            contentLeft: lineA,
            contentRight: lineB,
            originalLineNum: removedBlock[i].originalLineNum,
            newLineNum: addedBlock[i].newLineNum,
          });
        } else {
          // If completely unrelated, push them as standalone separate lines (deletes first, then adds)
          rows.push({
            type: "removed",
            contentLeft: lineA,
            originalLineNum: removedBlock[i].originalLineNum,
          });
          rows.push({
            type: "added",
            contentRight: lineB,
            newLineNum: addedBlock[i].newLineNum,
          });
        }
      }

      // 4. Any leftover removals are rendered as isolated deletions
      if (removedBlock.length > minLength) {
        for (let i = minLength; i < removedBlock.length; i++) {
          rows.push({
            type: "removed",
            contentLeft: removedBlock[i].content,
            originalLineNum: removedBlock[i].originalLineNum,
          });
        }
      }

      // 5. Any leftover additions are rendered as isolated additions
      if (addedBlock.length > minLength) {
        for (let i = minLength; i < addedBlock.length; i++) {
          rows.push({
            type: "added",
            contentRight: addedBlock[i].content,
            newLineNum: addedBlock[i].newLineNum,
          });
        }
      }
    }
  }

  return rows;
}

// Get committed content from simulated HEAD commit tree
function getCommittedFileContent(state: any, path: string): string | null {
  const commitHash = state.getCurrentCommitHash ? state.getCurrentCommitHash() : null;
  if (!commitHash) return null;

  const commit = state.objectStore[commitHash];
  if (!commit || commit.type !== "commit") return null;

  let currentTreeSha = commit.tree;
  const parts = path.split("/");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const tree = state.objectStore[currentTreeSha];
    if (!tree || tree.type !== "tree") return null;

    const entry = tree.entries.find((e: any) => e.name === part);
    if (!entry) return null;

    if (i === parts.length - 1) {
      if (entry.type === "blob") {
        const blob = state.objectStore[entry.sha];
        return blob && blob.type === "blob" ? blob.content : null;
      }
      return null;
    } else {
      if (entry.type === "tree") {
        currentTreeSha = entry.sha;
      } else {
        return null;
      }
    }
  }
  return null;
}

export default function VsCodeEditor({ activeFile, setActiveFile }: VsCodeEditorProps) {
  const store = useGitStore();
  const fileSystem = store.fileSystem;

  const [editorContent, setEditorContent] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [diffLayout, setDiffLayout] = useState<"split" | "unified">("split");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLPreElement>(null);

  // Sync content when active file changes
  useEffect(() => {
    if (activeFile) {
      setEditorContent(fileSystem[activeFile] || "");
    } else {
      setEditorContent("");
    }
    setIsComparing(false);
  }, [activeFile, fileSystem]);

  // Synchronize Line Numbers scrolling with Textarea scrolling
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = () => {
    if (!activeFile) return;
    store.writeFile(activeFile, editorContent);
  };

  const isConflict = activeFile && 
                    editorContent.includes("<<<<<<< HEAD") && 
                    editorContent.includes("=======") && 
                    editorContent.includes(">>>>>>>");

  // Fetch committed version of active file
  const committedContent = useMemo(() => {
    if (!activeFile) return null;
    return getCommittedFileContent(store, activeFile);
  }, [activeFile, store]);

  // Check if file is modified relative to committed version
  const hasDiff = useMemo(() => {
    if (committedContent === null) return false;
    return committedContent !== editorContent;
  }, [committedContent, editorContent]);

  // Calculate the windowed line-by-line diff list
  const diffList = useMemo(() => {
    if (!activeFile || committedContent === null) return [];
    return computeDiff(committedContent, editorContent);
  }, [committedContent, editorContent, activeFile]);

  // Transform raw diffs into horizontally matched paired rows (Split Layout Aligner)
  const pairedRows = useMemo(() => {
    return pairDiffLines(diffList);
  }, [diffList]);

  // Count lines
  const linesCount = useMemo(() => {
    return Math.max(1, (editorContent.match(/\n/g) || []).length + 1);
  }, [editorContent]);

  // Pre-calculate line numbers text
  const lineNumbersText = useMemo(() => {
    let result = "";
    for (let i = 1; i <= linesCount; i++) {
      result += i + "\n";
    }
    return result;
  }, [linesCount]);

  if (!activeFile) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center select-none bg-[#09090e]/60 rounded-2xl border border-[#2e2e42] shadow-inner">
        <FileCode className="h-10 w-10 text-[#3b3b59] stroke-[1.5] mb-3" />
        <p className="text-xs font-mono">No active file selected.<br />Select or create a file from the explorer sidebar to edit.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#09090e]/80 rounded-2xl border border-[#2e2e42] overflow-hidden shadow-lg select-none">
      {/* Editor Toolbar with high contrast borders */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e42] bg-[#07070a] select-none shrink-0">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 font-bold">
          <Edit3 className="h-3.5 w-3.5 text-indigo-brand animate-pulse" /> {activeFile}
          {hasDiff && (
            <span className="text-[9px] uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.2 rounded font-bold">
              Modified
            </span>
          )}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Diff Mode Toggle & Settings Layout Triggers */}
          {hasDiff && (
            <div className="flex items-center gap-1.5 bg-[#12121e] border border-[#2a2a3f] rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setIsComparing(!isComparing)}
                className={`flex items-center gap-1 px-2.5 py-0.8 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  isComparing 
                    ? "bg-indigo-brand text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isComparing ? "Close Diff" : "Compare"}
              </button>

              {isComparing && (
                <span className="w-px h-3 bg-[#2a2a3f] mx-0.5" />
              )}

              {isComparing && (
                <div className="flex items-center rounded overflow-hidden">
                  <button
                    onClick={() => setDiffLayout("split")}
                    className={`flex items-center gap-1 px-2 py-0.8 text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      diffLayout === "split" 
                        ? "bg-[#1f1f33] border border-[#3b3b59] text-indigo-brand rounded" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Side by Side Split View"
                  >
                    <Columns className="h-3 w-3" /> Split
                  </button>
                  <button
                    onClick={() => setDiffLayout("unified")}
                    className={`flex items-center gap-1 px-2 py-0.8 text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      diffLayout === "unified" 
                        ? "bg-[#1f1f33] border border-[#3b3b59] text-indigo-brand rounded" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Combined Unified View"
                  >
                    <SplitSquareVertical className="h-3 w-3" /> Unified
                  </button>
                </div>
              )}
            </div>
          )}

          {!isConflict && !isComparing && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-xs font-bold active:scale-[0.98] cursor-pointer shadow"
            >
              <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area / Merge resolver / Visual Diff Engine */}
      {isConflict ? (
        <MergeEditor 
          fileName={activeFile} 
          content={editorContent} 
          onResolved={() => {
            const resolved = store.fileSystem[activeFile] || "";
            setEditorContent(resolved);
          }} 
        />
      ) : isComparing ? (
        diffLayout === "split" ? (
          /* Split (Side-by-side) Diff View - Horizontally Paired Rows with Word Level Highlights */
          <div className="flex-1 w-full overflow-y-auto bg-[#050508] p-4 font-mono text-[12px] leading-[20px] select-text">
            <div className="flex flex-col min-w-[700px] select-text">
              {/* Header row labeling */}
              <div className="flex border-b border-[#2e2e42] pb-1.5 mb-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 select-none">
                <div className="flex-1 pl-16 border-r border-[#2e2e42]">Original HEAD Commit</div>
                <div className="flex-1 pl-16">Your Workspace Changes</div>
              </div>

              {pairedRows.map((row, idx) => (
                <div key={idx} className="flex border-b border-[#11111a]/40 hover:bg-white/1.5 transition-colors select-text">
                  
                  {/* Left Side: Original HEAD cell */}
                  <div className={`flex-1 flex items-center pr-2 border-r border-[#2e2e42] select-text ${
                    row.type === "removed" ? "bg-rose-500/10 text-rose-400 font-medium" : 
                    row.type === "modified" ? "bg-rose-500/10 text-rose-400 font-medium" :
                    row.type === "added" ? "bg-[#09090f]/60 opacity-15 select-none h-[21px]" : "text-muted-foreground/75"
                  }`}>
                    <span className="w-10 pr-2.5 text-right text-[10px] text-muted-foreground/30 select-none shrink-0 font-semibold border-r border-[#1e1e2d] mr-3">
                      {row.type !== "added" ? row.originalLineNum : ""}
                    </span>
                    <span className="whitespace-pre select-text">
                      {row.type === "modified" && row.contentLeft !== undefined && row.contentRight !== undefined ? (
                        <RenderWordDiff original={row.contentLeft} modified={row.contentRight} side="left" />
                      ) : row.type !== "added" ? (
                        row.contentLeft || " "
                      ) : ""}
                    </span>
                  </div>

                  {/* Right Side: Workspace Current cell */}
                  <div className={`flex-1 flex items-center pl-2 select-text ${
                    row.type === "added" ? "bg-green-500/10 text-green-400 font-medium" : 
                    row.type === "modified" ? "bg-green-500/10 text-green-400 font-medium" :
                    row.type === "removed" ? "bg-[#09090f]/60 opacity-15 select-none h-[21px]" : "text-muted-foreground/75"
                  }`}>
                    <span className="w-10 pr-2.5 text-right text-[10px] text-muted-foreground/30 select-none shrink-0 font-semibold border-r border-[#1e1e2d] mr-3">
                      {row.type !== "removed" ? row.newLineNum : ""}
                    </span>
                    <span className="whitespace-pre select-text">
                      {row.type === "modified" && row.contentLeft !== undefined && row.contentRight !== undefined ? (
                        <RenderWordDiff original={row.contentLeft} modified={row.contentRight} side="right" />
                      ) : row.type !== "removed" ? (
                        row.contentRight || " "
                      ) : ""}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Unified Visual Diff Viewer Panel with Word Level Highlights */
          <div className="flex-1 w-full overflow-y-auto bg-[#050508] p-4 font-mono text-[12px] leading-[20px] select-text">
            <div className="flex flex-col min-w-max select-text">
              {pairedRows.map((row, idx) => {
                // If it's a paired modified row, we render a deleted line and an added line in unified view
                if (row.type === "modified" && row.contentLeft !== undefined && row.contentRight !== undefined) {
                  return (
                    <div key={idx} className="flex flex-col select-text">
                      {/* Removed line */}
                      <div className="flex w-full items-center font-medium bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 px-2 py-0.5 rounded transition-colors select-text hover:bg-white/2">
                        <div className="w-16 flex gap-2 text-right text-[10px] text-muted-foreground/35 select-none shrink-0 pr-3 font-semibold">
                          <span className="w-7">{row.originalLineNum || ""}</span>
                          <span className="w-7"></span>
                        </div>
                        <span className="mr-3 font-bold select-none shrink-0 w-3 text-center opacity-60">-</span>
                        <span className="whitespace-pre select-text">
                          <RenderWordDiff original={row.contentLeft} modified={row.contentRight} side="left" />
                        </span>
                      </div>
                      {/* Added line */}
                      <div className="flex w-full items-center font-medium bg-green-500/10 text-green-400 border-l-2 border-green-500 px-2 py-0.5 rounded transition-colors select-text hover:bg-white/2">
                        <div className="w-16 flex gap-2 text-right text-[10px] text-muted-foreground/35 select-none shrink-0 pr-3 font-semibold">
                          <span className="w-7"></span>
                          <span className="w-7 text-mint">{row.newLineNum || ""}</span>
                        </div>
                        <span className="mr-3 font-bold select-none shrink-0 w-3 text-center opacity-60">+</span>
                        <span className="whitespace-pre select-text">
                          <RenderWordDiff original={row.contentLeft} modified={row.contentRight} side="right" />
                        </span>
                      </div>
                    </div>
                  );
                }

                // Standard rows
                const colors = {
                  added: "bg-green-500/10 text-green-400 border-l-2 border-green-500",
                  removed: "bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 line-through decoration-rose-500/30",
                  unchanged: "text-muted-foreground/80 border-l-2 border-transparent",
                  modified: "",
                };
                
                const prefixes = {
                  added: "+",
                  removed: "-",
                  unchanged: " ",
                  modified: "",
                };

                return (
                  <div 
                    key={idx} 
                    className={`flex w-full items-center font-medium ${colors[row.type]} px-2 py-0.5 rounded transition-colors select-text hover:bg-white/2`}
                  >
                    <div className="w-16 flex gap-2 text-right text-[10px] text-muted-foreground/35 select-none shrink-0 pr-3 font-semibold">
                      <span className="w-7">{row.type !== "added" ? row.originalLineNum : ""}</span>
                      <span className="w-7 text-mint">{row.type !== "removed" ? row.newLineNum : ""}</span>
                    </div>
                    
                    <span className="mr-3 font-bold select-none shrink-0 w-3 text-center opacity-60">
                      {prefixes[row.type]}
                    </span>
                    
                    <span className="whitespace-pre select-text">
                      {row.type !== "added" ? row.contentLeft : row.contentRight}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Monospace Standard Code Editor Input Panel */
        <div className="flex-1 w-full flex font-mono text-xs overflow-hidden bg-[#07070a]/90 select-text relative">
          
          {/* Synchronized Line Numbers Column - Single text block for O(1) rendering performance */}
          <pre 
            ref={lineNumbersRef}
            className="w-12 py-4 text-right bg-[#050508]/60 border-r border-[#2e2e42] text-muted-foreground/45 select-none overflow-hidden shrink-0 pr-3 font-semibold whitespace-pre select-none"
            style={{ 
              lineHeight: "20px", 
              fontSize: "12px",
              fontFamily: "JetBrains Mono, Courier New, monospace" 
            }}
          >
            {lineNumbersText}
          </pre>
          
          {/* Scrollable Textarea */}
          <textarea
            ref={textareaRef}
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            onScroll={handleScroll}
            className="flex-1 h-full py-4 px-4 bg-transparent text-foreground border-none resize-none focus:outline-none focus:ring-0 overflow-y-auto font-medium select-text selection:bg-indigo-brand/30"
            style={{ 
              lineHeight: "20px", 
              fontSize: "12px", 
              fontFamily: "JetBrains Mono, Courier New, monospace" 
            }}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
