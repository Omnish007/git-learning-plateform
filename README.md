# 🌌 GitMaster: Interactive In-Memory Git Learning & Visual Playground

GitMaster is a premium, interactive web-based Git learning platform that provides an in-memory, browser-rendered simulated Git ecosystem. Master branch concepts, resolve merges, stage changes, and visualize commit graphs in real-time, completely client-side.

---

## ✨ Features at a Glance

### 🖥️ High-Fidelity Monaco-Style Workspace
* **Collapsible & Resizable Panels**: Adjust your terminal, file explorer, and diff views dynamically with smooth drag handles.
* **Synchronized Code Editor**: High-contrast syntax-friendly styling with fast O(1) rendering of synchronized line-number columns.

### 🔍 Advanced Side-by-Side Visual Diff Engine
* **Jaccard Proximity Matcher**: Uses advanced fuzzy-similarity heuristics to pair altered lines horizontally. Say goodbye to jarring line jumps caused by minor typos or insertions!
* **Word-Level Highlighting**: Pinpoints exactly which words were added, removed, or edited inside modified lines.
* **Multi-Layout Flexibility**: Seamless toggle between side-by-side **Split View** and combined **Unified View**.

### 🌳 Live SVG DAG Branch Tree Visualizer
* **Dynamic Commit Nodes**: Visualizes your repository's commits, branches, HEAD references, and stashes in a live-updating SVG Directed Acyclic Graph (DAG).
* **Branch & Stash Tracking**: Instantly tracks operations like `git stash`, `git commit`, `git checkout -b`, and `git merge`.

### ⚡ Comprehensive In-Memory Git Engine
* Fully functional browser-based Javascript Git engine tracking commits, blobs, trees, staging indexing, merge conflicts, stashes, and index files.

---

## 🛠️ Tech Stack & Key Conventions

* **Framework**: React & Next.js (Server/Client Separation Rule architecture)
* **Styling**: Tailored Dark-Mode Harmonious HSL Hues
* **Icons**: Lucide React
* **State Management**: Zustand lightweight in-memory engine stores

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `18.x` or higher
* **Package Manager**: `pnpm` (highly recommended)

### Installation & Run

1. Clone this repository:
   ```bash
   git clone https://github.com/Omnish007/git-learning-plateform.git
   cd git-learning-plateform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server locally:
   ```bash
   pnpm dev
   ```

4. Build production optimized package:
   ```bash
   pnpm build
   ```

---

## 📂 Project Architecture

```
git-learning-plateform/
├── app/                      # Next.js App Router Page Entrypoints
│   ├── page.tsx              # Landing Gateway
│   ├── playground/           # Simulated Git Sandboxed Environment
│   └── settings/             # AI Customization Hooks & Configurations
├── components/               # High-Fidelity UI Components
│   ├── vscode-editor.tsx     # Code Editor + Split/Unified Diffing Engine
│   ├── dag-visualizer.tsx    # Live SVG-based Directed Acyclic Graph
│   ├── terminal-playground.  # Interactive Resizable Terminal Panel
│   └── merge-editor.tsx      # Conflict Resolution Interface
├── lib/                      # Business Logics & Git Engine Stores
│   ├── git-engine/           # In-Memory Git Storage & Command CLIs
│   └── ai-service.ts         # Socratic AI Coach Integrations
```

---

## 🔬 How the Visual Diff Engine Works Under the Hood

Standard LCS (Longest Common Subsequence) diff engines only align lines that are exactly identical. If a developer edits a line or leaves a typo, standard LCS fails to pair them, leaving the deleted line and the new line visually separated and misaligned.

GitMaster implements a **Semantic Aligner**:
1. **Identical Scanning**: Identical matching prefixes and suffixes are extracted instantly.
2. **Jaccard Word-Overlap Similarity**: Differing lines are checked for overlap. If Jaccard similarity is $\ge 45\%$ and length is $>8$ characters, they are matched as the **same edited line**.
3. **Word-Level LCS Backtracking**: A character-level diff runs specifically inside paired lines to visually highlight added/deleted words in red and green badges.
4. **Consecutive Block pairing (Horizontal)**: Grouped removals and additions are paired 1-to-1 horizontally to maintain perfect, clean split alignment.

---

## 📜 License

Distributed under the MIT License. Created with 💙 for developers mastering Git.
