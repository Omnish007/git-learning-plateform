# GitMaster — World-Class Git Learning Platform

## Full Product Requirements Document (PRD) + Developer Prompt

> **Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · shadcn/ui (install all component using shadcn command only dont create from scratch)· TypeScript  
> **Audience:** Absolute beginners → Advanced engineers  
> **Mission:** The only resource anyone ever needs to master Git — forever.

---

## Table of Contents

1. [Vision & Design Philosophy](#1-vision--design-philosophy)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [UI/UX System Design](#3-uiux-system-design)
4. [Core Feature Modules](#4-core-feature-modules)
5. [AI Integration System](#5-ai-integration-system)
6. [Git Simulator Engine](#6-git-simulator-engine)
7. [Learning System](#7-learning-system)
8. [Advanced Features](#8-advanced-features)
9. [Intelligence & Interaction Features ⭐ NEW](#9-intelligence--interaction-features)
10. [Gamification & Progress](#10-gamification--progress)
11. [Phase-Wise Implementation Roadmap](#11-phase-wise-implementation-roadmap)
12. [File & Folder Structure](#12-file--folder-structure)
13. [Developer Prompt (AI Codegen Ready)](#13-developer-prompt-ai-codegen-ready)

---

## 1. Vision & Design Philosophy

### 1.1 Product Vision

GitMaster is NOT a documentation site. It is an **interactive learning OS for Git** — a full simulation environment where users practice real Git commands on real (simulated) file systems, receive AI coaching, visualize every operation as a living graph, and earn their way from "what is version control?" to "I can rebase --onto in my sleep."

### 1.2 Design Language

- **Aesthetic Direction:** Dark-first, terminal-inspired luxury. Think "Linear.app meets VS Code meets a Bloomberg terminal." Deep dark backgrounds (`#0A0A0F`), electric accent (`#6EE7B7` mint-green or `#818CF8` indigo), monospaced code areas contrasted with beautiful serif/display headings.
- **Typography:** `Bricolage Grotesque` (display) + `JetBrains Mono` (code) + `Inter` (body). Variable font weights for editorial hierarchy.
- **Motion Philosophy:** Every state change is animated. Command execution triggers typewriter effects. Branch graphs draw themselves. Commit nodes pulse. Nothing is instant and nothing is slow.
- **Spatial Design:** Grid-breaking layouts. The terminal is not a box — it's full bleed. Branch graphs overflow their containers intentionally. Generous whitespace except in dense data zones.
- **Accessibility:** WCAG AA minimum. Full keyboard navigation. Screen reader annotations for every interactive element.

### 1.3 Core UX Principles

- **Zero Context-Switching:** Everything happens on one page — terminal, file tree, git graph, explanation panel.
- **"Show Me Why":** Every command outcome shows a before/after state with annotation.
- **Reversible Learning:** Users can undo any action in the simulator without resetting their whole session.
- **Progressive Disclosure:** Beginners see simplified views; experts toggle into raw mode showing full git internals (objects, refs, pack files).

---

## 2. Tech Stack & Architecture

### 2.1 Frontend

| Layer       | Technology                      | Purpose                                          |
| ----------- | ------------------------------- | ------------------------------------------------ |
| Framework   | Next.js 14 (App Router)         | SSR, file-based routing, Server Components       |
| Styling     | Tailwind CSS v3+                | Utility-first responsive design                  |
| Components  | shadcn/ui + Radix UI primitives | Accessible, themeable base components            |
| Animations  | Framer Motion                   | Layout animations, gesture interactions          |
| Git Graph   | D3.js / custom SVG renderer     | DAG (Directed Acyclic Graph) visualization       |
| Code Editor | CodeMirror 6                    | In-browser file editing with syntax highlighting |
| Terminal    | xterm.js (custom theming)       | Realistic terminal feel                          |
| State       | Zustand + Immer                 | Immutable state for git sim engine               |
| Persistence | IndexedDB (via idb)             | Local session persistence, no backend needed     |
| AI          | Vercel AI SDK (multi-provider)  | Unified streaming interface for all AI providers |

### 2.2 Backend (Optional / Lightweight)

| Layer      | Technology             | Purpose                               |
| ---------- | ---------------------- | ------------------------------------- |
| API Routes | Next.js API Routes     | AI key proxying (optional), analytics |
| Auth       | NextAuth.js (optional) | Cloud progress sync                   |
| DB         | Supabase (optional)    | User profiles, leaderboards           |

### 2.3 Architecture Decisions

- **100% Client-Side Git Simulation** — No server needed for the core learning experience. The entire git engine runs in-browser using a custom state machine.
- **AI is Optional** — All features work without any API key. AI layers on top as a "coach."
- **Offline-First** — Service Worker caches all assets. Users can learn without internet.
- **localStorage + IndexedDB** — Sessions persist between page refreshes.

---

## 3. UI/UX System Design

### 3.1 Global Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Nav (Learn/Practice/Reference/Playground) | AI  │
│         Settings | Progress % | Theme Toggle                    │
├───────────────┬─────────────────────────────┬───────────────────┤
│               │                             │                   │
│  LEFT PANEL   │    CENTER: MAIN VIEWPORT    │   RIGHT PANEL     │
│  ─────────    │    ─────────────────────    │   ──────────      │
│  File Tree    │  [Contextual: Terminal /    │  Git Graph        │
│  (live, with  │   Lesson / Quiz / Scenario] │  (DAG tree,       │
│  git status   │                             │  live-updating)   │
│  indicators)  │                             │                   │
│               │                             │  Commit History   │
│  Staged Files │                             │  Branch List      │
│  Unstaged     │                             │  Stash List       │
│               │                             │                   │
├───────────────┴─────────────────────────────┴───────────────────┤
│  BOTTOM PANEL: Command Explanation | Output Log | Hints         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Panel Behaviors

- All panels are **resizable** via drag handles.
- Panels can be **collapsed** to icon-only mode.
- **Mobile:** Single-panel with swipe navigation between views.
- **Focus Mode:** F11 or button hides all panels except terminal + file tree.

### 3.3 Theme System

- **Dark (Default):** Near-black background, mint/teal accents, muted purple secondary.
- **Light:** Warm off-white, dark navy text, same accent palette.
- **Hacker:** All green on black, matrix feel, for nostalgia.
- **High Contrast:** Pure black/white, ultra-accessible.
- **Custom:** User-defined via CSS variable overrides in settings.

### 3.4 Navigation Structure

```
/ (Landing Page)
/learn
  /learn/beginner
  /learn/intermediate
  /learn/advanced
  /learn/[topic-slug]   ← Dynamic lesson pages
/practice
  /practice/scenarios
  /practice/sandbox     ← Free-form git sandbox
  /practice/challenges  ← Timed challenges
/reference
  /reference/commands   ← Full command reference
  /reference/concepts   ← Mental model explanations
  /reference/cheatsheet
/playground             ← The main interactive workspace
/settings
  /settings/ai          ← AI provider configuration
  /settings/profile
```

---

## 4. Core Feature Modules

### 4.1 🖥️ Interactive Git Terminal Simulator

**Description:** A fully functional, in-browser Git environment. Users type real Git commands and see real effects on a simulated file system and repository state.

**Features:**

- **Real command parsing** — Parses actual git syntax: flags, arguments, short/long forms (`-m` vs `--message`), piped commands.
- **Supported commands (full list):**
  - `git init`, `git clone` (from preset repos)
  - `git status`, `git diff`, `git diff --staged`, `git diff HEAD~2`
  - `git add .`, `git add -p` (interactive patch staging — line-by-line)
  - `git commit -m`, `git commit --amend`, `git commit -v`
  - `git log`, `git log --oneline`, `git log --graph --all`, `git log -p`
  - `git branch`, `git branch -d`, `git branch -D`, `git branch -m`
  - `git checkout`, `git switch`, `git restore`
  - `git merge`, `git merge --no-ff`, `git merge --squash`
  - `git rebase`, `git rebase -i` (interactive rebase with visual picker)
  - `git cherry-pick`, `git cherry-pick --continue`, `--abort`
  - `git stash`, `git stash pop`, `git stash list`, `git stash apply stash@{n}`
  - `git tag`, `git tag -a`, `git tag -d`
  - `git remote add/remove/rename`, `git fetch`, `git pull`, `git push`
  - `git reset --soft`, `--mixed`, `--hard`
  - `git revert`
  - `git bisect start`, `git bisect good/bad`
  - `git blame`, `git show`, `git cat-file` (internals mode)
  - `git worktree`
  - `git reflog`
  - `git clean -fd`
  - `git submodule` (basic)
  - `git config --global/--local`
  - `echo`, `touch`, `mkdir`, `cat`, `ls`, `cd`, `rm`, `mv`, `cp` (basic shell)
- **Autocomplete** — Tab completion for commands, branch names, file paths.
- **Command History** — Arrow-key navigation through command history.
- **Error Handling** — Typos/wrong commands show git-style error messages + a hint panel suggesting what they might have meant.
- **Typewriter Effect** — Output renders character-by-character for terminal authenticity.
- **Color-Coded Output** — `git status` red/green, `git log` commit hash colors, branch names styled distinctively.

### 4.2 📁 Live File Tree with Git Status Indicators

**Description:** A VS Code–style file explorer that reflects the current state of the simulated repository in real time.

**Features:**

- **File status icons** — Untracked (U), Modified (M), Staged (S), Deleted (D), Renamed (R), Conflicted (C) with color coding matching real Git.
- **Click to open files** in CodeMirror editor.
- **Drag to stage** — Drag files from unstaged to staged area (mirrors `git add`).
- **Inline diff view** — Hover a modified file to see a miniature diff tooltip.
- **Context menu** — Right-click for: Stage, Unstage, Discard Changes, Open Diff, View History, Blame.
- **New File / New Folder** buttons that simulate `touch` / `mkdir`.
- **File content editing** — Actually modify file contents to see `git diff` output change in real time.
- **Binary file stubs** — Image/binary files shown with icons; cannot be edited.

### 4.3 🌳 Live Git Graph (DAG Visualizer)

**Description:** An animated, live-updating Directed Acyclic Graph showing the full commit history, branches, tags, and HEAD pointer.

**Features:**

- **Real-time updates** — Every commit, merge, rebase instantly re-renders the graph.
- **Nodes:**
  - Commit nodes (circle) with short hash + message tooltip.
  - Merge commits (diamond shape).
  - Tagged commits (star overlay).
  - HEAD pointer (glowing arrow indicator).
  - Remote-tracking branches shown in muted color.
- **Branches** shown as labeled colored lines. Branch colors auto-assigned from a curated palette.
- **Click a commit** to see full commit details (hash, author, date, message, changed files, full diff).
- **Zoom + Pan** — Mouse wheel zoom, drag to pan. Mini-map for large histories.
- **Animation:**
  - New commits animate in from the current HEAD.
  - Rebase re-draws the entire affected branch with a morph animation.
  - Merge creates a new node with animated edges drawing in.
  - Cherry-pick shows the commit "copying" to the new branch.
- **Layout modes:**
  - Vertical (default, time flows top-to-bottom).
  - Horizontal (time flows left-to-right, good for many branches).
  - Radial (experimental, centered on HEAD).
- **Internals mode toggle:** Show git object types (tree, blob, commit) as nodes.

### 4.4 📜 Commit History Panel

**Features:**

- Filterable list (by author, date range, message keyword, file path).
- One-click checkout to any commit.
- `git diff <hash1> <hash2>` comparison between any two commits.
- Visual line graph of commit frequency over time (sparkline).
- Amend last commit button.

### 4.5 🌿 Branch Manager

**Features:**

- Visual list of local and remote branches.
- Create / rename / delete with confirmation dialogs.
- Show ahead/behind counts vs. remote.
- One-click merge / rebase target selector.
- Checkout with one click.
- **Protected branch** simulation — Mark branches as protected to simulate enterprise workflows.
- Branch search/filter.
- Color-coding that matches the git graph.

### 4.6 📦 Stash Manager

**Features:**

- Visual list of all stashes with message and timestamp.
- Apply / pop / drop / branch-from-stash actions.
- Preview stash contents before applying.
- Visual indicator on git graph where stash was created.

### 4.7 🔖 Tag Manager

**Features:**

- List lightweight and annotated tags.
- Create annotated tag with message.
- Delete tags.
- Show tags on git graph.

### 4.8 🔀 Merge Conflict Simulator

**Description:** Purpose-built module for practicing merge conflict resolution — arguably the most feared Git operation.

**Features:**

- **Pre-built conflict scenarios** (easy → hard):
  - Same line edited differently on two branches.
  - File deleted on one branch, edited on another.
  - Rename conflict.
  - Multiple hunks in same file.
  - Binary file conflict.
- **Three-way merge editor** — Shows OURS | BASE | THEIRS in a three-column layout with conflict markers highlighted.
- **Resolution tools:**
  - Accept ours / Accept theirs / Accept both / Edit manually.
  - Custom merge for each hunk independently.
- **Validation** — After resolving, check if the resolution makes semantic sense (AI can validate this with key enabled).
- **Scoring** — Time taken + number of edits = conflict resolution score.

### 4.9 ⏪ Interactive Rebase Playground

**Description:** Visual interface for `git rebase -i` that demystifies one of Git's most powerful commands.

**Features:**

- **Visual commit list** — Drag-and-drop to reorder commits.
- **Action picker per commit:** pick, squash, fixup, reword, edit, drop, exec.
- **Live preview** — See what the resulting branch will look like BEFORE executing.
- **Squash editor** — Combine commit messages with a rich text editor.
- **Step-by-step replay** — Execute rebase one step at a time with explanations at each step.
- **Abort / Continue / Skip** controls.

### 4.10 🕵️ Git Bisect Simulator

**Description:** Visual, step-by-step guide to using `git bisect` to find the commit that introduced a bug.

**Features:**

- Preset scenario with a "broken" commit hidden in history.
- Visual binary search animation on the git graph showing which commits are eliminated each step.
- Good/Bad marking interface.
- Explanation of binary search algorithm applied to git history.
- Success screen showing the identified commit.

### 4.11 🔍 Git Blame Visualizer

**Features:**

- Full file view with left gutter showing commit hash, author, and date for each line.
- Click a line to jump to that commit in the graph.
- Time-based heat map coloring (older lines = cooler color).
- Author filter to highlight only one contributor's lines.

### 4.12 📋 .gitignore Builder

**Features:**

- Drag-and-drop file tree to select what to ignore.
- Template library: Node.js, Python, Java, Go, Rust, macOS, Windows, IDE files.
- Pattern tester — type a filename to see if it would be matched.
- Regex explanation for each pattern.
- Copy / download the generated `.gitignore`.

### 4.13 🔄 Git Hooks Explorer

**Features:**

- List of all standard git hooks with descriptions.
- Sample scripts for each hook (pre-commit linting, commit-msg format check, pre-push tests).
- In-browser hook simulation — set up a hook and see it fire during commits.
- Common use-case templates.

### 4.14 🖊️ Commit Message Builder

**Features:**

- Conventional Commits format guide with interactive builder.
- Subject line character counter (enforces 72-char limit).
- Body / footer sections with guidance.
- Template library (feat, fix, docs, chore, refactor, etc.).
- AI-assisted commit message suggestion based on staged diff.

### 4.15 📊 Repository Stats Dashboard

**Features:**

- Commit frequency chart (by day/week/month).
- Files changed most frequently.
- Lines added/deleted over time.
- Branch age visualization.
- Contributors list (simulated).

---

## 5. AI Integration System

### 5.1 Provider Support

| Provider         | Model Selection                  | Use Case                       |
| ---------------- | -------------------------------- | ------------------------------ |
| Google AI Studio | gemini-1.5-flash, gemini-1.5-pro | General coaching, scenario gen |
| Groq             | llama-3.3-70b, mixtral-8x7b      | Fast responses, quick hints    |
| Hugging Face     | Any HF Inference API model       | Custom/experimental            |
| Ollama (Local)   | User specifies model name        | Privacy-first, offline use     |
| OpenAI (bonus)   | gpt-4o, gpt-4o-mini              | Premium quality                |

### 5.2 AI Configuration UI (`/settings/ai`)

- **Provider selector** — Radio cards with provider logo + description.
- **API Key input** — Masked field, validated on save, stored ONLY in localStorage (never sent to our servers).
- **Model selector** — Dropdown populated based on provider.
- **Ollama Base URL** — Input for local Ollama endpoint (default: `http://localhost:11434`).
- **Test Connection** — Sends a lightweight ping to validate key + model.
- **AI Usage toggle** — Master on/off switch.
- **Context window setting** — How much session history to send with each AI request.

### 5.3 AI Features

#### 5.3.1 AI Git Coach (Contextual Help)

- Floating AI panel accessible anywhere.
- **Context-aware:** AI knows your current branch, last 10 commands, current git status, and active lesson.
- Ask anything: "Why is my rebase failing?", "Explain what just happened", "What should I do next?"
- Streaming responses (typewriter effect).

#### 5.3.2 AI Scenario Generator

- User selects:
  - **Difficulty:** Beginner / Intermediate / Advanced / Expert
  - **Topic focus:** Merging, Rebasing, Conflict Resolution, Branching Strategy, History Rewriting, CI/CD Workflow, Hotfix workflow, etc.
  - **Team size:** Solo / Small team / Large team
  - **Project type:** Web app, library, microservices, monorepo
- AI generates:
  - A realistic project description and narrative context.
  - A set of files with real code (appropriate to project type).
  - A sequence of events that will require specific git operations.
  - A checklist of tasks with acceptance criteria.
  - Hints available on demand.
  - A rubric for evaluating the user's solution.

#### 5.3.3 AI Scenario Validator

- After completing a scenario, AI reviews:
  - Was the task completed correctly?
  - Is the git history clean and readable?
  - Were best practices followed?
  - What could have been done better?
- Provides a score (0–100) with detailed breakdown.

#### 5.3.4 AI Merge Conflict Resolver

- When stuck in a conflict, ask AI: "Help me understand this conflict."
- AI explains which branch made which change and why they conflict.
- Can suggest a resolution without just giving the answer.

#### 5.3.5 AI Commit Message Reviewer

- Paste or write a commit message; AI rates it on:
  - Clarity (does it explain the change?)
  - Scope (is it appropriately sized?)
  - Format (follows conventions?)
  - Actionability (past tense imperative form?)

#### 5.3.6 AI Concept Explainer

- Highlight any technical term in any lesson or output.
- "Explain this to me" button pops up AI explanation at the user's current level.

---

## 6. Git Simulator Engine

### 6.1 Architecture

The simulator is a TypeScript state machine that models a git repository entirely in memory (with IndexedDB persistence).

```typescript
// Core data model
interface GitSimulatorState {
  workingDirectory: FileTree; // All files + their contents
  stagingArea: StagedChanges; // What's in the index
  objects: Map<string, GitObject>; // Simulated .git/objects (commits, trees, blobs)
  refs: Map<string, string>; // Branch refs: "refs/heads/main" → hash
  HEAD: string; // Current HEAD (branch name or detached hash)
  config: GitConfig; // user.name, user.email, etc.
  remotes: Map<string, RemoteRepo>; // Remote tracking
  stashes: StashEntry[];
  tags: Tag[];
  hooks: Record<string, string>; // Hook scripts
}
```

### 6.2 Command Execution Pipeline

```
User Input
    ↓
Command Parser (tokenizes, validates syntax)
    ↓
Command Executor (mutates GitSimulatorState via Immer)
    ↓
State Diff Detector (what changed?)
    ↓
Renderer (terminal output, file tree, git graph all update)
    ↓
AI Context Updater (if AI enabled, context window updated)
    ↓
Event Bus (triggers lesson validators, achievement checks)
```

### 6.3 Object Hashing

- Uses a browser-compatible SHA-1 implementation (Web Crypto API) to generate realistic 40-char commit hashes.
- Commit objects store: tree hash, parent hash(es), author, committer, timestamp, message.
- Tree objects store: file mode, name, blob hash.
- Blob objects store: file contents.
- Users can inspect these with `git cat-file -t <hash>` and `git cat-file -p <hash>`.

### 6.4 Preset Repository Templates

Pre-built repos users can clone into their sandbox:

| Template           | Description                | Features Demonstrated       |
| ------------------ | -------------------------- | --------------------------- |
| `simple-blog`      | 3-file markdown blog       | Basic commit/branch/merge   |
| `todo-app`         | Simple JS to-do            | Feature branches, PRs       |
| `broken-main`      | Has bugs in history        | git bisect                  |
| `conflict-kitchen` | Multiple parallel features | Merge conflicts             |
| `legacy-monolith`  | Messy history              | Interactive rebase, cleanup |
| `team-workflow`    | Multi-author simulation    | Collaboration patterns      |
| `hotfix-crisis`    | Production bug discovered  | git flow, hotfix branches   |
| `release-train`    | Versioned releases         | Tags, changelogs, semver    |

---

## 7. Learning System

### 7.1 Curriculum Structure

#### Level 0: Git Fundamentals (What & Why)

- What is version control?
- What problems does Git solve?
- Git vs. other VCS (SVN, Mercurial)
- The three areas: Working Directory / Staging Area / Repository
- What is a commit? What is a branch?

#### Level 1: Beginner (Core Workflow)

1. `git init` — Starting a repository
2. `git add` — Staging changes
3. `git commit` — Saving snapshots
4. `git status` / `git diff` — Understanding changes
5. `git log` — Reading history
6. `git branch` / `git checkout` — Creating branches
7. `git merge` (fast-forward) — Combining work
8. `.gitignore` — Excluding files

#### Level 2: Intermediate (Collaboration)

1. Remotes: `git remote`, `git fetch`, `git pull`, `git push`
2. Merge conflicts — Detection, resolution, prevention
3. `git stash` — Saving work temporarily
4. `git revert` vs `git reset` — Undoing mistakes
5. Pull request workflow simulation
6. Branch naming conventions
7. Commit message best practices
8. `git tag` — Marking releases

#### Level 3: Advanced (Power User)

1. `git rebase` — Replaying commits
2. `git rebase -i` — Interactive rebase mastery
3. `git cherry-pick` — Selective commit copying
4. `git reflog` — The ultimate undo
5. `git bisect` — Binary search for bugs
6. `git blame` — Understanding code history
7. `git worktree` — Multiple working trees
8. Advanced `git log` filtering
9. Submodules basics

#### Level 4: Expert (Internals & Workflows)

1. Git internals: objects, refs, pack files
2. Git hooks — Automated workflows
3. Git flow vs. trunk-based development
4. Monorepo strategies with Git
5. Advanced rebase: `--onto`, preserve merges
6. `git filter-branch` and `git filter-repo`
7. Performance: shallow clones, partial clones, sparse checkout
8. GPG commit signing
9. Git server protocols (HTTPS vs SSH vs Git protocol)

### 7.2 Lesson Page Structure

Each lesson follows this format:

```
┌─────────────────────────────────────────────┐
│  LESSON HEADER                              │
│  Breadcrumb | Level Badge | Progress bar    │
├─────────────────────────────────────────────┤
│  THE BIG PICTURE (ELI5 analogy)             │
│  "Think of git add like putting items in a  │
│  shopping cart before checkout..."          │
├─────────────────────────────────────────────┤
│  CONCEPT EXPLANATION (with diagrams)        │
│  Animated diagram or static infographic     │
├─────────────────────────────────────────────┤
│  COMMAND SYNTAX REFERENCE                   │
│  Syntax | Flags | Examples                  │
├─────────────────────────────────────────────┤
│  INTERACTIVE EXERCISE                       │
│  Full terminal + file tree embedded         │
│  Step-by-step guided tasks                  │
├─────────────────────────────────────────────┤
│  REAL-WORLD SCENARIO                        │
│  "At your job, you'd use this when..."      │
├─────────────────────────────────────────────┤
│  COMMON MISTAKES & HOW TO FIX THEM          │
├─────────────────────────────────────────────┤
│  KNOWLEDGE CHECK (Mini Quiz)                │
│  3-5 questions before continuing            │
├─────────────────────────────────────────────┤
│  NEXT LESSON | PRACTICE MORE                │
└─────────────────────────────────────────────┘
```

### 7.3 Quiz System

**Question Types:**

- Multiple choice (single / multiple answer).
- Code completion — Fill in the blank in a git command.
- Command matching — Match command to description.
- Scenario-based — "Given this git status output, what would you do?"
- Output prediction — "What does this command output?"
- Error diagnosis — "This command failed. Why?"
- Sequence ordering — Drag to put git steps in correct order.
- Diff reading — "What changed between these two commits?"

**Quiz Features:**

- Immediate feedback with explanation for wrong answers.
- "Why is this wrong?" expansions.
- Hint system (costs a hint token, 3 free per quiz).
- Retake with different question order.
- Performance analytics (which topic areas need work).
- Spaced repetition — Weak topics resurface more frequently.

### 7.4 Scenario Practice System

**Structure of a Scenario:**

1. **Context narrative** — Realistic story: "Your team is working on a web app. A critical bug was reported in production while you're mid-feature..."
2. **Starting state** — Pre-configured repo with files, branches, commits already set up.
3. **Task list** — Specific, measurable objectives.
4. **Available hints** — Progressively more specific (3 levels of hint per task).
5. **Acceptance tests** — Automated checks that validate the git state is correct.
6. **Debrief** — Explanation of the ideal solution with commentary.

**Scenario Difficulty Tuning:**

- Beginner: One task, one command, hand-held guidance.
- Intermediate: 3-5 tasks, multi-step workflows, fewer hints.
- Advanced: 8+ tasks, real-world constraints, no hints unless asked.
- Expert: Open-ended goal (e.g., "Clean up this messy feature branch and prepare it for PR"), judged by AI on quality.

### 7.5 Timed Challenges

- Speed runs: "Complete this task in under 60 seconds."
- No-mistake runs: Complete without any error commands.
- Leaderboard for timed challenges (local or cloud-synced).

---

## 8. Advanced Features

### 8.1 🎨 Git Visualization Modes

#### Commit Diff Viewer

- Side-by-side or unified diff view.
- Syntax highlighting in diffs.
- Word-level diff (not just line-level).
- Image diff for PNG/SVG files.
- Collapse unchanged sections.

#### Branch Comparison View

- Pick any two branches → see all commits in one not in the other.
- Files diverged, files added, files deleted.
- Merge base identification.

#### History Exploration Timeline

- Horizontal scrolling timeline of all commits.
- Zoom in to day level, zoom out to year level.
- Group by author.
- Filter by file path.

### 8.2 🔧 Git Config Manager UI

- Visual editor for `.gitconfig` settings.
- Common settings with explanations: `core.autocrlf`, `pull.rebase`, `push.autoSetupRemote`, `alias.*`.
- Alias builder — Create custom git aliases with a visual editor.
- Global vs. local config distinction.

### 8.3 📝 Git Cheat Sheet (Interactive)

- Searchable, categorized command reference.
- Each command has: syntax, options, examples, common use cases, related commands.
- "Try it" button that opens a pre-configured sandbox.
- Printable PDF version.
- Keyboard shortcut: `Ctrl+K` global search across all commands.

### 8.4 🔄 Workflow Templates

Pre-built workflow visualizations for common team strategies:

| Workflow                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| Git Flow                | feature, develop, release, hotfix, main branches |
| GitHub Flow             | feature branches + main only                     |
| Trunk-Based Development | Short-lived branches into main                   |
| GitLab Flow             | Includes environment branches                    |
| Forking Workflow        | Open-source contribution model                   |

Each template includes:

- Animated walkthrough of a full development cycle.
- Interactive simulation of the workflow.
- Pros/cons analysis.
- When to use guidance.

### 8.5 🧠 Mental Models Library

Visual explanations of Git's core mental models:

- The Three Trees (HEAD, Index, Working Tree).
- What is a SHA-1 hash and why it matters.
- Why branches are just pointers.
- What happens during a fast-forward merge.
- What rebasing actually does to commits.
- The reflog as a safety net.
- Detached HEAD explained visually.

Each mental model: animated SVG diagram + plain-English explanation + interactive demo.

### 8.6 🆘 Error Message Decoder

- Paste any git error message.
- AI (or rule-based lookup) explains what it means and how to fix it.
- Searchable database of 100+ common git errors.
- Each error: explanation, root cause, fix, prevention.

### 8.7 📱 Git Command Builder (GUI Mode)

- For learners not ready for the terminal.
- Visual UI showing git operations as buttons/forms.
- "Stage selected files," "Commit with message," "Create branch named..."
- After each GUI action, shows the equivalent git command that was run.
- Gradually encourage transition to terminal with "Type this yourself" prompts.

### 8.8 🔗 Remote Collaboration Simulator

- Simulate a remote repository (hosted in-browser).
- Second "user" persona that makes commits to remote.
- Practice: fetch, pull, push conflicts, diverged branches, force-push scenarios.
- Simulate PR review workflow: create PR, review changes, approve, merge.

### 8.9 📦 Submodule & Monorepo Basics

- Visual explanation of submodules.
- Interactive demo: repo within a repo.
- Monorepo structure visualizer.
- Common pitfalls.

### 8.10 🔐 Git Security Basics

- Commit signing with GPG (simulated).
- Why force-push is dangerous.
- Secret scanning basics (never commit API keys).
- `.gitignore` for sensitive files.

### 8.11 🧩 Git Alias Workshop

- Pre-built useful aliases: `git lg`, `git undo`, `git aliases`, `git branches`.
- Build your own alias with a visual command composer.
- Test alias in sandbox.
- Share/export alias collection.

### 8.12 📈 Personal Progress Dashboard

- Overall completion % across all levels.
- Commands practiced (frequency heatmap).
- Scenarios completed with scores.
- Quiz accuracy by topic.
- Streak tracking (daily practice).
- Time spent in platform.
- "Weak spots" identified automatically.
- "What to practice next" recommendation engine.

### 8.13 🌐 Keyboard Shortcut System

| Shortcut          | Action                 |
| ----------------- | ---------------------- |
| `Ctrl+K`          | Global command palette |
| `Ctrl+\``         | Focus terminal         |
| `Ctrl+Shift+G`    | Focus git graph        |
| `Ctrl+B`          | Toggle branch manager  |
| `Ctrl+H`          | Show hint              |
| `Ctrl+Z` (in sim) | Undo last git command  |
| `?`               | Context-sensitive help |
| `Esc`             | Close any panel/modal  |

---

## 9. Intelligence & Interaction Features

> These 7 features form the **"learning intelligence" layer** of GitMaster — the difference between a reference site and a genuine learning OS.

---

### 9.1 🧠 Socratic Debugger

**Overview:** When a user makes a mistake or gets stuck, the Socratic Debugger intercepts before giving the answer — instead guiding the user to discover the solution themselves through targeted questions.

**How It Works:**

- Activates automatically when: a wrong command is run, a command fails, or the user clicks "I'm stuck."
- AI generates 3–5 leading questions based on the current git state and what the user was trying to do.
- Questions are ordered from broad → specific: "What does your working directory look like right now?" → "What does `git status` tell you?" → "Which of the three git areas holds staged changes?"
- **Patience threshold:** If the user answers incorrectly 3 times in a row, the debugger offers to switch to Direct Help mode.
- **Insight moment:** When the user arrives at the correct answer, shows a "💡 You got it!" animation with a brief reinforcement explanation.

**Settings Toggle:**

- `Socratic Mode: ON / OFF` in Settings → Learning.
- Per-session override: "Just tell me" button always available without leaving the mode globally.

**UI Design:**

- Distinct chat panel, styled differently from the main AI coach (warmer amber tones vs. the coach's cool blue).
- Questions appear one at a time with a subtle typewriter reveal.
- User responds via free-text input OR multiple-choice quick replies (AI generates plausible options).
- Progress indicator: "Question 2 of 4."

**Data captured for personalization:**

- Which questions the user stumbled on → fed into Personalized Learning Path (§9.6).

---

### 9.2 💣 "What Would Happen If..." (WWHI) Sandbox

**Overview:** A consequence-preview system for dangerous or irreversible git commands. Users type a command, hit **Preview** instead of Enter, and see a full before/after state visualization — before committing to execution.

**How It Works:**

- Intercepts any command flagged as potentially destructive:
  - `git reset --hard`
  - `git push --force` / `--force-with-lease`
  - `git branch -D`
  - `git clean -fd`
  - `git rebase` (on a branch with a remote)
  - `git commit --amend` (after push)
  - `git filter-branch` / `git filter-repo`
  - `git rm`
- On **Preview**, renders a split-screen overlay:
  - **Left:** Current state (file tree, git graph, branch positions).
  - **Right:** Projected state after command executes.
  - **Diff layer:** Red highlights for what will be lost; green for what will change.

**Warning Severity System:**

| Level            | Color          | Meaning                                              |
| ---------------- | -------------- | ---------------------------------------------------- |
| 🟡 Caution       | Amber          | Reversible with effort (e.g., `git reset --mixed`)   |
| 🔴 Destructive   | Red            | Hard to recover (e.g., `git reset --hard`)           |
| ☠️ Unrecoverable | Dark red pulse | Data gone (e.g., `git clean -fd` on untracked files) |

**After Preview:**

- **Execute Anyway** — runs the command with a confirmation click.
- **Cancel** — returns to terminal, no state change.
- **Learn More** — opens the relevant lesson on this command's risks.
- **AI Explain** — AI narrates what will happen and why, in plain English.

**Educational Layer:**

- First time each destructive command is previewed, a tooltip explains: "This is why professionals always check before running this."
- Tracks which WWHI previews the user used → surfaces in Progress Dashboard as "dangerous commands understood."

---

### 9.3 🔍 Command Decoder Ring

**Overview:** A dedicated input field where users paste any git command — simple or complex — and receive a fully annotated, token-by-token breakdown with explanations, flag interactions, and a live "Try it" button.

**How It Works:**

Input example:

```
git log --oneline --graph --decorate --all --since="2 weeks ago" -- src/
```

Output (annotated cascade):

| Token                   | Type          | Explanation                                               |
| ----------------------- | ------------- | --------------------------------------------------------- |
| `git`                   | Executable    | The git binary                                            |
| `log`                   | Subcommand    | Show commit history                                       |
| `--oneline`             | Format flag   | Condense each commit to one line (short hash + message)   |
| `--graph`               | Visual flag   | Draw ASCII branch/merge graph in left gutter              |
| `--decorate`            | Metadata flag | Show branch/tag names next to commits                     |
| `--all`                 | Scope flag    | Include ALL branches and remotes, not just current        |
| `--since="2 weeks ago"` | Filter flag   | Only commits newer than 2 weeks; accepts natural language |
| `--`                    | Separator     | Separates revision args from file path args               |
| `src/`                  | Path filter   | Only commits that touched files inside `src/` directory   |

**Combination Effects Panel:**

- Shows how flags interact: "`--graph` + `--oneline` together produce the most readable branch visualization."
- Warns about conflicts: "`--oneline` and `-p` (patch) don't display well together."

**Additional Features:**

- **"Try it" button** — Loads the command into the sandbox with a matching starter repo.
- **History** — Last 20 decoded commands saved locally.
- **Share** — Generates a shareable URL with the decoded command for teaching others.
- **Reverse mode** — Describe what you want in English; decoder suggests the matching command (bridges to NL→Command, §9.7).

**Access:** Available at `/reference/decoder` AND as a `Ctrl+D` shortcut from anywhere in the app.

---

### 9.4 🔧 "Fix This Repo" Challenges

**Overview:** Users are dropped into deliberately broken or messy repository states with a symptom description. Their job: diagnose and repair using real git commands. No hand-holding — pure applied problem-solving.

**Challenge Structure:**

1. **Situation brief** — Plain-English description of what went wrong (no git jargon, as a colleague would describe it).
2. **Starting repo state** — Pre-configured broken repo loaded into the sandbox.
3. **Objective** — What the fixed repo must look like (described by outcome, not by method).
4. **Acceptance tests** — Automated checks that validate the git state post-fix.
5. **Hints** — 3 levels, each more specific, each costing XP to reveal.
6. **Debrief** — After success or giving up: ideal solution walkthrough + "other valid approaches."

**30 Pre-Built Broken Repos:**

| #     | Title                            | Difficulty   | Concepts                               |
| ----- | -------------------------------- | ------------ | -------------------------------------- |
| 1     | The Forgotten Stage              | Beginner     | `git add`, `git status`                |
| 2     | Wrong Branch Commit              | Beginner     | `git reset`, `git checkout`            |
| 3     | The Orphaned Feature             | Intermediate | `git branch`, `git reflog`             |
| 4     | Force Push Fallout               | Intermediate | `git reflog`, `git reset`              |
| 5     | The Secret Committer             | Intermediate | `git filter-repo`, `.gitignore`        |
| 6     | Merge Conflict Storm             | Intermediate | Conflict resolution                    |
| 7     | The Squash Regret                | Advanced     | `git rebase -i`, `git reflog`          |
| 8     | Three Branches, One Truth        | Advanced     | `git cherry-pick`, `git rebase --onto` |
| 9     | The Missing Hotfix               | Advanced     | `git cherry-pick`, branch strategy     |
| 10    | History Archaeology              | Advanced     | `git bisect`, `git blame`              |
| 11    | The Detached Head Patient        | Intermediate | Detached HEAD, `git checkout`          |
| 12    | Submodule Disaster               | Expert       | `git submodule`                        |
| 13    | The Rebased Public Branch        | Expert       | `git reflog`, force-push recovery      |
| 14    | Tag Gone Wrong                   | Beginner     | `git tag -d`, `git tag`                |
| 15    | The Stash Avalanche              | Intermediate | `git stash list`, `git stash apply`    |
| 16–30 | AI-Generated (difficulty scales) | All          | Procedurally generated by AI           |

**Scoring:**

- Base score for completion.
- Bonus: completed without hints, completed under par time, used the most elegant solution.
- Score recorded in Progress Dashboard.

**AI-Generated Challenges (with AI key):**

- User selects difficulty + topic → AI generates a new broken repo scenario on-demand.
- Infinite replay value.

---

### 9.5 👥 Multi-Player Mode

**Overview:** Two browser instances share one simulated remote repository in real time (via `BroadcastChannel` API — zero server required). Users experience real collaboration friction: push conflicts, diverged branches, concurrent changes.

**Technical Architecture:**

```
Tab A (Alice)           Shared Remote (BroadcastChannel)      Tab B (Bob)
Local Repo A    ←──── push/fetch/pull ────→    Local Repo B
    ↓                       ↓                       ↓
Terminal A              Remote State              Terminal B
File Tree A         (in-memory, synced)          File Tree B
Git Graph A                                      Git Graph B
```

**Session Modes:**

| Mode                       | Description                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **Self-Hosted (Two Tabs)** | User opens GitMaster in two browser tabs; both join the same session via BroadcastChannel |
| **AI Co-Developer**        | Single tab; AI autonomously makes commits to the remote on a configurable timer           |
| **Guided Pair Exercise**   | Structured scenario where both "developers" have scripted roles and objectives            |

**Structured Multi-Player Scenarios:**

1. **Push Conflict Resolution** — Both devs edit the same file, one pushes first, the other must pull + resolve.
2. **Branch Race** — Both create feature branches; practice merging both into main cleanly.
3. **Hotfix Under Pressure** — Dev A is mid-feature; Dev B must apply a hotfix to main and notify Dev A to rebase.
4. **PR Workflow** — Dev A creates branch + "PR"; Dev B reviews (inline comments simulated), requests changes, approves, merges.
5. **Rebase vs. Merge Debate** — Same repo, same goal; Dev A uses merge, Dev B uses rebase — compare resulting histories.

**UI Indicators:**

- Live status bar: `"You are: Alice 🟢 | Bob has 2 unpulled commits 🔴 | Remote: main (3 commits ahead)"`
- Remote activity feed in the right panel: "Bob pushed commit `a3f9c12` — 'fix login bug' to main."
- Conflict alert banner when a push is rejected due to divergence.

**AI Co-Developer Behavior (no second tab):**

- AI makes realistic commits at configurable intervals (every 30s / 1min / 5min).
- AI occasionally introduces "mistakes" the user must identify and fix.
- AI follows a narrative: "Deploying auth refactor," "Adding unit tests," "Oops, pushed to main by mistake."

---

### 9.6 🎯 Personalized Learning Path

**Overview:** An AI-powered adaptive curriculum engine that assesses each user's current knowledge, identifies gaps, and generates a dynamic learning roadmap — updated continuously as the user practices.

**Onboarding Assessment (2 minutes):**

- 10 diagnostic questions spanning all 4 levels.
- Mix of question types: multiple choice, command fill-in, scenario reading.
- No right/wrong judgment shown — framed as "let's find where you are."
- Result: initial skill profile across 12 git topic areas.

**Skill Topic Areas:**

| Area                 | Beginner Markers      | Advanced Markers                     |
| -------------------- | --------------------- | ------------------------------------ |
| Staging & Committing | Knows `add`, `commit` | Uses `add -p`, `commit --amend`      |
| Branching            | Creates branches      | Manages complex branch graphs        |
| Merging              | Basic fast-forward    | Three-way merge, conflict resolution |
| Rebasing             | Aware of concept      | Interactive rebase, `--onto`         |
| Remote Collaboration | Knows push/pull       | Force-push safety, diverged branches |
| History Reading      | Reads `git log`       | Complex `log` filters, `git blame`   |
| Undoing              | Knows `git reset`     | Knows reset modes + reflog recovery  |
| Stashing             | Basic stash           | Named stashes, `stash branch`        |
| Tags & Releases      | Creates tags          | Annotated tags, semver workflow      |
| Hooks & Automation   | Aware of hooks        | Custom hook scripts                  |
| Internals            | Surface knowledge     | Object model, refs, pack files       |
| Workflow Patterns    | No preference         | Git Flow / trunk-based expertise     |

**Visual Learning Map:**

- RPG-style skill tree rendered with D3.js.
- Nodes: each topic area. Edges: prerequisite relationships.
- Color coding: 🔴 Not started / 🟡 In progress / 🟢 Mastered / ⭐ Expert.
- Click any node: see lessons, scenarios, and quizzes for that topic.
- Progress percentage per node updates in real time.

**Adaptive Recommendations Engine:**

- After every session, recalculates weak spots based on:
  - Quiz accuracy per topic.
  - Commands used (or avoided) in sandbox.
  - Scenarios failed or skipped.
  - Time spent on hints.
- Surfaces "Next Best Action" card on dashboard: "You've been avoiding `git rebase`. Try this 5-minute scenario."

**Weekly Digest (if email provided / push notification):**

- "This week: +18% on merge conflict resolution. Weak spot: interactive rebase. Recommended: Boss Battle — The Rebase Gauntlet."

**AI Enhancement (with key):**

- AI generates custom micro-scenarios targeting exactly the user's current weak spots.
- AI adjusts explanation complexity to user's demonstrated level (no jargon for beginners; assumes knowledge for experts).

---

### 9.7 💬 Natural Language → Git Command (NL2Git)

**Overview:** A command bar where users describe what they want to do in plain English and receive the precise git command(s) needed — with explanation, flags breakdown, and a one-click "Run" button.

**Access:** Top command bar in Playground (`Ctrl+Space` to focus), also available at `/reference/nl2git`.

**How It Works:**

**Input → Output Examples:**

| Natural Language Input                                       | Git Command Output                                                          | Explanation                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| "undo my last 3 commits but keep the file changes"           | `git reset HEAD~3`                                                          | Moves HEAD back 3 commits, keeps changes in working directory |
| "see everything that changed in auth.js over the last month" | `git log --since="1 month ago" --follow -p -- auth.js`                      | Full patch history for one file, following renames            |
| "I accidentally deleted a branch, get it back"               | `git reflog \| grep <branch>` then `git checkout -b <branch> <hash>`        | Reflog finds the last commit on that branch                   |
| "squash my last 5 commits into one"                          | `git rebase -i HEAD~5`                                                      | Opens interactive rebase; mark 4 as squash                    |
| "see which commit broke the login feature"                   | `git bisect start` → `git bisect bad` → `git bisect good <hash>`            | Binary search through history                                 |
| "copy just the bugfix commit from hotfix branch to main"     | `git cherry-pick <commit-hash>`                                             | Selectively apply one commit                                  |
| "make git ignore all .env files globally"                    | `git config --global core.excludesfile ~/.gitignore_global` then add `.env` | Global gitignore setup                                        |
| "show me branches that have been merged into main"           | `git branch --merged main`                                                  | Lists safely deletable branches                               |
| "compare what's different between my branch and main"        | `git diff main...<current-branch>`                                          | Three-dot diff shows only diverged changes                    |
| "who last changed line 47 of index.js"                       | `git blame -L 47,47 index.js`                                               | Blame for a specific line                                     |

**Rule-Based Fallback (no AI key needed):**

- 75+ pre-mapped intents covering the most common NL queries.
- Fuzzy matching handles typos and paraphrases.
- Confidence score shown: "95% confident this is what you need."

**AI-Enhanced Mode (with key):**

- Handles any arbitrary natural language, including complex multi-step workflows.
- Multi-command sequences with numbered steps.
- Context-aware: knows your current branch, recent commands, and repo state.
- Asks clarifying questions for ambiguous intents: "Do you want to keep the changes from those commits?"

**Learning Integration:**

- Every NL2Git result includes: "📚 Learn more about this command → [link to lesson]."
- History of all NL queries saved locally — user can review patterns in their thinking.
- "Graduate yourself" nudge: after using NL2Git 5 times for the same type of command, shows: "You've used this 5 times — ready to memorize it? [Start flashcard]."

**UI Design:**

- Separate from terminal — styled as a floating command bar at the top of the Playground.
- Output appears in a "Translation Card" below: command in monospace, then plain-English breakdown.
- "Run this" button executes directly in the sandbox.
- "Copy" button for pasting into a real terminal.

---

## 10. Gamification & Progress

### 10.1 Achievement System

| Achievement       | Trigger                                                    |
| ----------------- | ---------------------------------------------------------- |
| 🌱 First Commit   | Make your first commit                                     |
| 🌿 Branch Out     | Create your first branch                                   |
| 🔀 Merge Master   | Successfully resolve a merge conflict                      |
| ⏪ Time Lord      | Use `git reflog` to recover a "lost" commit                |
| 🕵️ Bug Hunter     | Complete a `git bisect` scenario                           |
| 🎨 History Artist | Complete an interactive rebase                             |
| 💡 Internals Nerd | Inspect git objects with `cat-file`                        |
| 🤖 AI Whisperer   | Use AI assistance 10 times                                 |
| 🔥 On Fire        | 7-day practice streak                                      |
| 🏆 Git Master     | Complete all levels                                        |
| 🧠 Socrates       | Guide yourself to 10 correct answers via Socratic Debugger |
| 🔮 Fortune Teller | Use WWHI preview 20 times before executing                 |
| 🔬 Decoder        | Decode 15 complex git commands via Command Decoder Ring    |
| 🩺 Repo Doctor    | Complete 10 "Fix This Repo" challenges                     |
| 🤝 Collaborator   | Complete a full multi-player push conflict resolution      |
| 🗺️ Pathfinder     | Reach 80% mastery on your Personalized Learning Map        |
| 🌐 Translator     | Use NL2Git 25 times across 10 different command types      |

### 10.2 XP & Level System

- Commands earn XP (first-time command = bonus XP).
- Scenario completion = large XP reward (scaled to difficulty).
- Quiz perfect score = XP multiplier.
- Levels: Newbie → Contributor → Maintainer → Architect → Git Master.

### 10.3 Streaks & Daily Goals

- Daily goal: practice ≥ 1 scenario OR complete ≥ 1 lesson.
- Streak counter on dashboard.
- "Streak shield" — one missed day forgiven per week.

---

## 11. Phase-Wise Implementation Roadmap

### 🔴 Phase 0 — Foundation (Week 1-2)

> Goal: Project scaffold, design system, routing.

- [ ] Initialize Next.js 14 project with TypeScript, Tailwind CSS, shadcn/ui
- [ ] Establish design tokens (colors, typography, spacing) in `tailwind.config.ts`
- [ ] Implement global dark/light theme with `next-themes`
- [ ] Build base layout (header, sidebar, main panel, bottom panel)
- [ ] Set up Zustand store structure
- [ ] Configure IndexedDB persistence layer (via `idb`)
- [ ] Set up route structure (`/learn`, `/practice`, `/reference`, `/playground`)
- [ ] Build landing page with hero, feature highlights, CTA
- [ ] Implement global command palette (`Ctrl+K`) with `cmdk`
- [ ] Set up Framer Motion global layout animations

### 🟠 Phase 1 — Git Simulator Core (Week 3-5)

> Goal: Functional in-browser git engine.

- [ ] Build `GitSimulator` class (TypeScript state machine)
- [ ] Implement SHA-1 hashing via Web Crypto API
- [ ] Implement git object model (blob, tree, commit)
- [ ] Build command parser (tokenizer + validator)
- [ ] Implement core commands: `init`, `add`, `commit`, `status`, `log`
- [ ] Implement branch commands: `branch`, `checkout`, `switch`
- [ ] Implement `git diff` (working, staged, between commits)
- [ ] Build terminal UI with xterm.js + custom dark theme
- [ ] Implement tab completion and command history
- [ ] Connect simulator state to terminal output rendering

### 🟡 Phase 2 — File Tree & Staging UI (Week 6-7)

> Goal: Visual file management connected to simulator.

- [ ] Build animated file tree component
- [ ] Add git status indicators (U/M/S/D/R/C) with color coding
- [ ] Integrate CodeMirror 6 for file editing
- [ ] Implement drag-to-stage interaction
- [ ] Build inline diff tooltip on hover
- [ ] Implement context menu (right-click actions)
- [ ] Add staged / unstaged split view

### 🟢 Phase 3 — Git Graph Visualizer (Week 8-10)

> Goal: Beautiful, live-updating DAG.

- [ ] Design D3.js-based DAG layout algorithm
- [ ] Build commit node component (circle, diamond, star variants)
- [ ] Animate commit creation (ease-in from parent)
- [ ] Animate branch pointer labels
- [ ] Implement HEAD indicator with glow effect
- [ ] Add zoom/pan with mini-map
- [ ] Click-to-inspect commit details panel
- [ ] Add merge animation (animated edge drawing)
- [ ] Add rebase animation (branch morphing)
- [ ] Add cherry-pick animation
- [ ] Implement horizontal/vertical layout toggle
- [ ] Add "Internals Mode" showing objects

### 🔵 Phase 4 — Advanced Git Commands (Week 11-13)

> Goal: Complete command coverage including power commands.

- [ ] Implement `git merge` (fast-forward + three-way)
- [ ] Implement `git rebase` (linear + interactive)
- [ ] Build interactive rebase UI (drag-and-drop commit list)
- [ ] Implement `git stash` / `pop` / `list` / `apply`
- [ ] Implement `git reset` (soft/mixed/hard)
- [ ] Implement `git revert`
- [ ] Implement `git cherry-pick`
- [ ] Implement `git tag`
- [ ] Implement `git reflog`
- [ ] Implement `git bisect` with visual binary search
- [ ] Implement `git blame` viewer
- [ ] Implement remote simulation (`fetch`, `pull`, `push`)
- [ ] Implement `git clean`
- [ ] Implement `git worktree` basics

### 🟣 Phase 5 — Learning System (Week 14-17)

> Goal: Full curriculum with lessons, quizzes, scenarios.

- [ ] Build lesson page template (MDX-based content)
- [ ] Write Level 0 + Level 1 lesson content (all topics)
- [ ] Write Level 2 lesson content
- [ ] Write Level 3 lesson content
- [ ] Write Level 4 lesson content
- [ ] Build quiz component (all question types)
- [ ] Implement spaced repetition algorithm for quiz review
- [ ] Build scenario player (narrative + task list + validator)
- [ ] Build acceptance test runner (validates git state)
- [ ] Create all 8 preset repository templates
- [ ] Write 20+ curated scenarios (all difficulties)
- [ ] Build scenario debrief/solution viewer
- [ ] Build timed challenge mode

### ⚫ Phase 6 — AI Integration (Week 18-20)

> Goal: Full multi-provider AI coaching system.

- [ ] Build AI settings page (provider, key, model selector)
- [ ] Implement localStorage-only key storage (security-first)
- [ ] Integrate Vercel AI SDK for unified provider interface
- [ ] Build AI Chat panel (streaming, context-aware)
- [ ] Implement AI scenario generator
- [ ] Implement AI scenario validator + scoring
- [ ] Implement AI commit message reviewer
- [ ] Implement AI merge conflict explainer
- [ ] Add AI concept explainer (text selection → explain)
- [ ] Implement Ollama local endpoint support
- [ ] Add AI error message decoder

### 🟤 Phase 6.5 — Intelligence & Interaction Layer (Week 21-23)

> Goal: The 7 "learning intelligence" features that make GitMaster irreplaceable.

**Socratic Debugger**

- [ ] Build Socratic Debugger panel component (amber-toned, distinct from AI coach)
- [ ] Implement question generation engine (rule-based + AI-enhanced)
- [ ] Build patience threshold logic (3-strikes → offer Direct Help)
- [ ] Implement per-question MCQ quick-reply option generation
- [ ] Add "💡 You got it!" insight moment animation
- [ ] Wire Socratic session data → Personalized Learning Path weak-spot tracker
- [ ] Add `Socratic Mode ON/OFF` toggle in Settings → Learning

**"What Would Happen If..." Sandbox**

- [ ] Build WWHI command interceptor (flag destructive commands pre-execution)
- [ ] Implement before/after split-screen state diff renderer
- [ ] Build 3-tier warning severity system (Caution / Destructive / Unrecoverable)
- [ ] Implement "Execute Anyway" / "Cancel" / "Learn More" / "AI Explain" action buttons
- [ ] Add first-time educational tooltip per destructive command type
- [ ] Wire WWHI usage to Progress Dashboard ("dangerous commands understood")
- [ ] Keyboard shortcut: `Shift+Enter` = Preview, `Enter` = Execute

**Command Decoder Ring**

- [ ] Build tokenizer that parses any git command into structured parts
- [ ] Build annotation renderer (inline token-by-token explainer table)
- [ ] Implement "combination effects" panel (flag interaction warnings)
- [ ] Add "Try it" button → sandbox pre-loader
- [ ] Build 20-item local decode history
- [ ] Implement shareable URL for decoded commands
- [ ] Add reverse mode (English description → command suggestion)
- [ ] Route: `/reference/decoder` + `Ctrl+D` global shortcut

**"Fix This Repo" Challenges**

- [ ] Build challenge player component (brief + repo state + task list + hints)
- [ ] Implement 3-tier hint system with XP cost
- [ ] Build acceptance test runner for fix validation
- [ ] Create all 15 hand-crafted broken repo templates
- [ ] Build AI-generated challenge engine (difficulty + topic → broken repo)
- [ ] Implement scoring (base + no-hints bonus + speed bonus)
- [ ] Build debrief/solution viewer with "other valid approaches"
- [ ] Route: `/practice/fix-this-repo`

**Multi-Player Mode**

- [ ] Implement BroadcastChannel-based shared remote repo state
- [ ] Build session join UI (two-tab self-hosted or AI co-developer)
- [ ] Build live status bar (who you are, unpulled commits, remote state)
- [ ] Build remote activity feed panel
- [ ] Implement conflict alert banner (push rejection due to divergence)
- [ ] Build AI co-developer engine (autonomous commits on configurable timer)
- [ ] Create 5 structured multi-player scenario scripts
- [ ] Route: `/practice/multiplayer`

**Personalized Learning Path**

- [ ] Build 10-question onboarding diagnostic assessment
- [ ] Implement 12-topic skill profiler (initial assessment scorer)
- [ ] Build RPG-style D3.js skill tree visual map
- [ ] Implement adaptive recommendations engine (recalculates after each session)
- [ ] Build "Next Best Action" dashboard card
- [ ] Integrate Socratic Debugger data + quiz data + sandbox command data as inputs
- [ ] Build weekly digest summary component
- [ ] Wire AI to generate custom micro-scenarios for weak spots (with key)
- [ ] Route: `/learn/my-path`

**Natural Language → Git Command (NL2Git)**

- [ ] Build 75+ rule-based intent mapping (fuzzy matched, no AI key needed)
- [ ] Build "Translation Card" UI component (command + breakdown + Run + Copy)
- [ ] Implement confidence score display
- [ ] Build NL query history (last 50, stored locally)
- [ ] Add "Learn more" deep-link to relevant lesson per output
- [ ] Implement AI-enhanced mode (arbitrary NL, multi-step, context-aware)
- [ ] Build "Graduate yourself" nudge after repeated same-type queries
- [ ] Route: `/reference/nl2git` + `Ctrl+Space` global shortcut in Playground

### 🌟 Phase 7 — Advanced Features & Polish (Week 24-27)

> Goal: Everything that makes it world-class.

- [ ] Build Merge Conflict Simulator module
- [ ] Build Remote Collaboration Simulator
- [ ] Build Workflow Templates (Git Flow, GitHub Flow, etc.)
- [ ] Build Mental Models Library (animated SVG diagrams)
- [ ] Build Git Error Decoder (searchable DB + AI)
- [ ] Build `.gitignore` Builder
- [ ] Build Git Config Manager UI
- [ ] Build Git Alias Workshop
- [ ] Build Commit Message Builder
- [ ] Build interactive Cheat Sheet
- [ ] Build Repository Stats Dashboard
- [ ] Implement gamification (XP, achievements, streaks — including 7 new achievements)
- [ ] Build Personal Progress Dashboard
- [ ] Add keyboard shortcuts throughout
- [ ] Implement full offline support (Service Worker)
- [ ] Performance audit + optimization
- [ ] Accessibility audit (WCAG AA)
- [ ] Mobile responsive pass (all features usable on tablet+)

### 🏁 Phase 8 — Launch Prep (Week 28-30)

- [ ] SEO optimization (meta, OG, structured data)
- [ ] Analytics integration (privacy-respecting, e.g. Plausible)
- [ ] Error monitoring (Sentry)
- [ ] Documentation site for contributors
- [ ] Vercel deployment pipeline
- [ ] User feedback widget
- [ ] Social sharing: "I just completed Level 3 on GitMaster!"

---

## 12. File & Folder Structure

```
gitmaster/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    # Landing page
│   ├── learn/
│   │   ├── page.tsx                    # Curriculum overview
│   │   ├── [level]/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Dynamic lesson page
│   ├── practice/
│   │   ├── scenarios/page.tsx
│   │   ├── sandbox/page.tsx
│   │   └── challenges/page.tsx
│   ├── reference/
│   │   ├── commands/page.tsx
│   │   ├── concepts/page.tsx
│   │   └── cheatsheet/page.tsx
│   ├── playground/
│   │   └── page.tsx                    # Main workspace
│   ├── settings/
│   │   ├── ai/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── git-simulator/
│   │   ├── Terminal.tsx
│   │   ├── FileTree.tsx
│   │   ├── GitGraph.tsx
│   │   ├── CommitHistory.tsx
│   │   ├── BranchManager.tsx
│   │   ├── StashManager.tsx
│   │   ├── ConflictEditor.tsx
│   │   ├── InteractiveRebase.tsx
│   │   └── BlameViewer.tsx
│   ├── learning/
│   │   ├── LessonLayout.tsx
│   │   ├── QuizBlock.tsx
│   │   ├── ScenarioPlayer.tsx
│   │   ├── HintSystem.tsx
│   │   └── Debrief.tsx
│   ├── intelligence/                       # ⭐ NEW — 7 Intelligence Features
│   │   ├── SocraticDebugger.tsx            # Guided question panel
│   │   ├── WWHISandbox.tsx                 # What Would Happen If preview
│   │   ├── CommandDecoder.tsx              # Token-by-token annotator
│   │   ├── FixThisRepo.tsx                 # Broken repo challenge player
│   │   ├── MultiPlayerSession.tsx          # BroadcastChannel two-tab mode
│   │   ├── LearningPathMap.tsx             # D3.js skill tree visualizer
│   │   └── NL2Git.tsx                      # Natural language → git command
│   ├── ai/
│   │   ├── AIChatPanel.tsx
│   │   ├── AISettings.tsx
│   │   ├── ScenarioGenerator.tsx
│   │   └── AIProviderBadge.tsx
│   ├── visualizations/
│   │   ├── DAGRenderer.tsx
│   │   ├── DiffViewer.tsx
│   │   ├── Timeline.tsx
│   │   ├── MentalModelDiagram.tsx
│   │   └── WorkflowDiagram.tsx
│   ├── ui/                             # shadcn/ui components
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── CommandPalette.tsx
│       ├── ResizablePanel.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── git-engine/
│   │   ├── index.ts                    # GitSimulator class
│   │   ├── commands/                   # One file per command
│   │   │   ├── add.ts
│   │   │   ├── commit.ts
│   │   │   ├── merge.ts
│   │   │   ├── rebase.ts
│   │   │   └── ...
│   │   ├── objects.ts                  # Git object model
│   │   ├── hash.ts                     # SHA-1 via Web Crypto
│   │   ├── diff.ts                     # Diff algorithm
│   │   └── parser.ts                   # Command parser
│   ├── ai/
│   │   ├── providers.ts                # Multi-provider client
│   │   ├── prompts.ts                  # System prompts
│   │   └── context-builder.ts          # Git state → AI context
│   ├── intelligence/                   # ⭐ NEW — Intelligence feature engines
│   │   ├── socratic-engine.ts          # Question generation + patience threshold
│   │   ├── wwhi-engine.ts              # Command danger detection + state diff
│   │   ├── command-tokenizer.ts        # Git command parser → annotated tokens
│   │   ├── fix-repo-templates.ts       # 15+ broken repo state definitions
│   │   ├── fix-repo-validator.ts       # Acceptance test runner for fixes
│   │   ├── multiplayer-sync.ts         # BroadcastChannel shared remote state
│   │   ├── learning-path-engine.ts     # Skill profiler + recommendations engine
│   │   ├── nl2git-rules.ts             # 75+ rule-based NL intent mappings
│   │   └── nl2git-ai.ts                # AI-enhanced NL2Git (with key)
│   ├── scenarios/
│   │   ├── index.ts
│   │   ├── validators.ts               # Acceptance tests
│   │   └── templates/                  # Preset repo templates
│   ├── quiz/
│   │   ├── index.ts
│   │   └── spaced-repetition.ts
│   └── persistence/
│       ├── indexeddb.ts
│       └── localStorage.ts
│
│   ├── store/
│   ├── git-store.ts                    # Zustand: simulator state
│   ├── ui-store.ts                     # Zustand: panel visibility, theme
│   ├── progress-store.ts               # Zustand: XP, achievements
│   ├── ai-store.ts                     # Zustand: AI settings
│   ├── learning-path-store.ts          # ⭐ NEW: skill profile + recommendations
│   └── multiplayer-store.ts            # ⭐ NEW: shared remote session state
│
├── content/
│   ├── lessons/                        # MDX lesson files
│   │   ├── beginner/
│   │   ├── intermediate/
│   │   ├── advanced/
│   │   └── expert/
│   ├── quizzes/                        # JSON quiz data
│   ├── scenarios/                      # JSON scenario data
│   └── cheatsheet/                     # Command reference JSON
│
├── hooks/
│   ├── useGitSimulator.ts
│   ├── useAI.ts
│   ├── useProgress.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useSocraticDebugger.ts          # ⭐ NEW
│   ├── useWWHI.ts                      # ⭐ NEW
│   ├── useNL2Git.ts                    # ⭐ NEW
│   ├── useLearningPath.ts              # ⭐ NEW
│   └── useMultiPlayer.ts               # ⭐ NEW

---

## 13. Developer Prompt (AI Codegen Ready)

> Copy this prompt into any AI coding assistant (Cursor, Copilot, Claude Code, etc.) to bootstrap the project.

---

```

You are building "GitMaster" — a world-class, interactive Git learning platform.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS v3 with custom design tokens
- shadcn/ui + Radix UI primitives
- Framer Motion for animations
- D3.js for the git DAG graph
- CodeMirror 6 for in-browser file editing
- xterm.js for terminal UI
- Zustand + Immer for state management
- IndexedDB (via idb) for persistence
- Vercel AI SDK for multi-provider AI (Google AI Studio, Groq, HuggingFace, Ollama)

## Design Aesthetic

Dark-first luxury terminal UI. Background: #0A0A0F. Accent: #6EE7B7 (mint).
Font: Bricolage Grotesque (headings) + JetBrains Mono (code) + Inter (body).
Every state change is animated. Nothing feels static.
Inspired by: Linear.app's polish + VS Code's density + Bloomberg's data richness.

## Core Architecture

The heart of the app is a client-side Git simulator — a TypeScript state machine
that models a real git repository in memory:

- Files (FileTree with contents)
- Staging area (index)
- Git object store (blobs, trees, commits) with real SHA-1 hashes
- Branch refs and HEAD pointer
- Stashes, tags, remotes

The terminal accepts real git commands + basic shell commands (touch, echo, cat, ls).
Commands mutate the simulator state, which triggers:

1. Terminal output rendering
2. File tree re-render with git status indicators
3. Live DAG graph update with animations
4. AI context update (if enabled)
5. Achievement/progress checks

## Key Principles

- Zero backend required for core features (100% client-side)
- AI is optional (all features work without an API key)
- Offline-first (Service Worker)
- Every panel is resizable
- Mobile responsive (tablet+)
- Full keyboard navigation + shortcuts

## What to Build First

Start with the Playground page (/playground) — the main workspace with:

1. Left panel: File tree with git status indicators
2. Center: Terminal (xterm.js, dark themed)
3. Right panel: Git graph (D3.js DAG)
4. Bottom panel: Command output log + explanation
   Wire the terminal to a basic GitSimulator that handles:
   git init, git add, git commit, git status, git log, git branch, git checkout
   Then connect the file tree and git graph to react to state changes.

````

---

## Appendix A: Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "shadcn-ui": "latest",
    "framer-motion": "^11.0.0",
    "d3": "^7.9.0",
    "@codemirror/view": "^6.0.0",
    "@codemirror/lang-javascript": "^6.0.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "zustand": "^4.5.0",
    "immer": "^10.1.0",
    "idb": "^8.0.0",
    "ai": "^3.0.0",
    "@google/generative-ai": "^0.14.0",
    "groq-sdk": "^0.5.0",
    "cmdk": "^1.0.0",
    "next-themes": "^0.3.0",
    "diff": "^5.2.0",
    "@lezer/highlight": "^1.2.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0"
  }
}
````

---

_Last Updated: 2026 | GitMaster PRD v1.0 | Full Stack Interactive Git Learning Platform_
