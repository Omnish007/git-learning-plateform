import { create } from "zustand";
import { GitState, GitObject, GitTreeEntry, GitTree, GitCommit, StagingEntry } from "./types";
import { gitHashObject } from "./sha1";

interface GitActions {
  init: () => void;
  writeFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  addFile: (path: string) => void;
  addAll: () => void;
  unstageFile: (path: string) => void;
  commit: (message: string) => string;
  createBranch: (name: string) => void;
  checkout: (nameOrHash: string) => string;
  reset: (mode: "soft" | "mixed" | "hard", refOrHash?: string) => void;
  stash: (message?: string) => void;
  stashPop: () => void;
  getHistory: () => { sha: string; commit: GitCommit }[];
  getCurrentCommitHash: () => string | null;
  getStatus: () => Record<string, "U" | "M" | "S" | "D" | "A">;
}

type GitStore = GitState & GitActions;

const initialWelcomeReadme = `# Welcome to GitMaster!

This is a live, browser-rendered in-memory Git environment.
Feel free to type shell and git commands in the terminal.

Features to try:
1. Edit files in the editor, and run \`git status\`
2. Stage files with \`git add <filename>\`
3. Commit changes with \`git commit -m "commit message"\`
4. Inspect the dynamic live SVG DAG branch tree visualizer.
`;

const getInitialState = (): GitState => {
  const welcomeSha = gitHashObject("blob", initialWelcomeReadme);
  const welcomeBlob: GitObject = { type: "blob", content: initialWelcomeReadme };

  // Generate initial tree
  const treeEntry: GitTreeEntry = { name: "README.md", sha: welcomeSha, type: "blob" };
  const rootTreeContent = JSON.stringify([treeEntry]);
  const rootTreeSha = gitHashObject("tree", rootTreeContent);
  const rootTree: GitObject = { type: "tree", entries: [treeEntry] };

  // Generate initial commit
  const initCommit: GitCommit = {
    type: "commit",
    tree: rootTreeSha,
    parents: [],
    author: "GitMaster <user@gitmaster.dev>",
    message: "Initial Commit (welcome readme)",
    timestamp: Date.now(),
  };
  const commitSha = gitHashObject("commit", JSON.stringify(initCommit));

  return {
    fileSystem: {
      "README.md": initialWelcomeReadme,
    },
    stagingArea: {},
    objectStore: {
      [welcomeSha]: welcomeBlob,
      [rootTreeSha]: rootTree,
      [commitSha]: initCommit,
    },
    refs: {
      "refs/heads/main": commitSha,
    },
    HEAD: "ref: refs/heads/main",
    stashes: [],
    config: {
      userName: "GitMaster User",
      userEmail: "user@gitmaster.dev",
    },
    terminalHistory: [],
  };
};

export const useGitStore = create<GitStore>((set, get) => ({
  ...getInitialState(),

  init: () => {
    set(getInitialState());
  },

  writeFile: (path, content) => {
    set((state) => ({
      fileSystem: {
        ...state.fileSystem,
        [path]: content,
      },
    }));
  },

  deleteFile: (path) => {
    set((state) => {
      const nextFileSystem = { ...state.fileSystem };
      delete nextFileSystem[path];
      return { fileSystem: nextFileSystem };
    });
  },

  addFile: (path) => {
    const content = get().fileSystem[path];
    if (content === undefined) {
      throw new Error(`fatal: pathspec '${path}' did not match any files`);
    }

    const sha = gitHashObject("blob", content);
    const blobObject: GitObject = { type: "blob", content };

    set((state) => ({
      objectStore: {
        ...state.objectStore,
        [sha]: blobObject,
      },
      stagingArea: {
        ...state.stagingArea,
        [path]: { sha, content },
      },
    }));
  },

  addAll: () => {
    const status = get().getStatus();
    const state = get();
    const nextStaging = { ...state.stagingArea };
    const nextObjects = { ...state.objectStore };

    Object.entries(status).forEach(([path, value]) => {
      if (value !== "D") {
        const content = state.fileSystem[path];
        const sha = gitHashObject("blob", content);
        nextObjects[sha] = { type: "blob", content };
        nextStaging[path] = { sha, content };
      } else {
        // Remove from staging area if deleted
        delete nextStaging[path];
      }
    });

    set({
      stagingArea: nextStaging,
      objectStore: nextObjects,
    });
  },

  unstageFile: (path) => {
    set((state) => {
      const nextStaging = { ...state.stagingArea };
      delete nextStaging[path];
      return { stagingArea: nextStaging };
    });
  },

  commit: (message) => {
    const state = get();
    const stagingKeys = Object.keys(state.stagingArea);

    if (stagingKeys.length === 0 && Object.keys(state.getStatus()).filter(k => state.getStatus()[k] === "S").length === 0) {
      throw new Error("nothing to commit, working tree clean");
    }

    const nextObjects = { ...state.objectStore };

    // 1. Build staging tree recursively
    interface TempTree {
      blobs: Record<string, string>;
      trees: Record<string, TempTree>;
    }

    const rootTempTree: TempTree = { blobs: {}, trees: {} };

    // We populate the tree based on the staging entries
    Object.entries(state.stagingArea).forEach(([filePath, entry]) => {
      const parts = filePath.split("/");
      let current = rootTempTree;

      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i];
        if (!current.trees[dir]) {
          current.trees[dir] = { blobs: {}, trees: {} };
        }
        current = current.trees[dir];
      }

      const fileName = parts[parts.length - 1];
      current.blobs[fileName] = entry.sha;
    });

    const writeTempTree = (tempTree: TempTree): string => {
      const entries: GitTreeEntry[] = [];

      Object.entries(tempTree.blobs).forEach(([name, sha]) => {
        entries.push({ name, sha, type: "blob" });
      });

      Object.entries(tempTree.trees).forEach(([name, subTree]) => {
        const subSha = writeTempTree(subTree);
        entries.push({ name, sha: subSha, type: "tree" });
      });

      entries.sort((a, b) => a.name.localeCompare(b.name));

      const treeObject: GitTree = { type: "tree", entries };
      const content = JSON.stringify(entries);
      const sha = gitHashObject("tree", content);

      nextObjects[sha] = treeObject;
      return sha;
    };

    const rootTreeSha = writeTempTree(rootTempTree);

    // 2. Create Commit object
    const parentHash = state.getCurrentCommitHash();
    const commitObject: GitCommit = {
      type: "commit",
      tree: rootTreeSha,
      parents: parentHash ? [parentHash] : [],
      author: `${state.config.userName} <${state.config.userEmail}>`,
      message,
      timestamp: Date.now(),
    };

    const commitSha = gitHashObject("commit", JSON.stringify(commitObject));
    nextObjects[commitSha] = commitObject;

    // 3. Update active reference
    const nextRefs = { ...state.refs };
    if (state.HEAD.startsWith("ref: ")) {
      const refPath = state.HEAD.substring(5);
      nextRefs[refPath] = commitSha;
    }

    set({
      objectStore: nextObjects,
      refs: nextRefs,
      stagingArea: {}, // Clear staging area
      HEAD: state.HEAD.startsWith("ref: ") ? state.HEAD : commitSha,
    });

    return commitSha;
  },

  createBranch: (name) => {
    const currentCommit = get().getCurrentCommitHash();
    if (!currentCommit) {
      throw new Error("fatal: Not a valid object name: 'HEAD'");
    }

    const refPath = `refs/heads/${name}`;
    if (get().refs[refPath]) {
      throw new Error(`fatal: A branch named '${name}' already exists`);
    }

    set((state) => ({
      refs: {
        ...state.refs,
        [refPath]: currentCommit,
      },
    }));
  },

  checkout: (nameOrHash) => {
    const state = get();
    const refPath = `refs/heads/${nameOrHash}`;
    let targetCommitHash: string | null = null;
    let nextHEAD = state.HEAD;

    if (state.refs[refPath]) {
      // Branch checkout
      targetCommitHash = state.refs[refPath];
      nextHEAD = `ref: ${refPath}`;
    } else if (state.objectStore[nameOrHash] && state.objectStore[nameOrHash].type === "commit") {
      // Direct commit hash checkout (detached HEAD)
      targetCommitHash = nameOrHash;
      nextHEAD = nameOrHash;
    } else {
      // Try to create branch from current if checkout fails, or throw
      throw new Error(`error: pathspec '${nameOrHash}' did not match any file(s) known to git`);
    }

    // 1. Traverse root tree recursively to build filesystem
    const nextFileSystem: Record<string, string> = {};
    const commit = state.objectStore[targetCommitHash] as GitCommit;
    
    const readTree = (treeSha: string, prefix: string) => {
      const tree = state.objectStore[treeSha] as GitTree;
      if (!tree || tree.type !== "tree") return;

      tree.entries.forEach((entry) => {
        const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.type === "blob") {
          const blob = state.objectStore[entry.sha];
          if (blob && blob.type === "blob") {
            nextFileSystem[fullPath] = blob.content;
          }
        } else {
          readTree(entry.sha, fullPath);
        }
      });
    };

    readTree(commit.tree, "");

    set({
      fileSystem: nextFileSystem,
      stagingArea: {}, // Checkouts clear staging usually or keep it? Real git warns if dirty. For simplicity, reset index.
      HEAD: nextHEAD,
    });

    return targetCommitHash;
  },

  reset: (mode, refOrHash) => {
    const state = get();
    const targetCommitHash = refOrHash 
      ? (state.refs[`refs/heads/${refOrHash}`] || refOrHash)
      : state.getCurrentCommitHash();

    if (!targetCommitHash || !state.objectStore[targetCommitHash]) {
      throw new Error(`fatal: ambiguous argument '${refOrHash}': unknown revision`);
    }

    const nextRefs = { ...state.refs };
    if (state.HEAD.startsWith("ref: ")) {
      const refPath = state.HEAD.substring(5);
      nextRefs[refPath] = targetCommitHash;
    } else {
      set({ HEAD: targetCommitHash });
    }

    if (mode === "soft") {
      // Soft reset: leaves staging index and fileSystem unchanged
      set({ refs: nextRefs });
      return;
    }

    if (mode === "mixed") {
      // Mixed reset: clears index staging area, leaves fileSystem unchanged
      set({
        refs: nextRefs,
        stagingArea: {},
      });
      return;
    }

    if (mode === "hard") {
      // Hard reset: clears index staging area, and completely resets working filesystem
      const nextFileSystem: Record<string, string> = {};
      const commit = state.objectStore[targetCommitHash] as GitCommit;

      const readTree = (treeSha: string, prefix: string) => {
        const tree = state.objectStore[treeSha] as GitTree;
        if (!tree || tree.type !== "tree") return;

        tree.entries.forEach((entry) => {
          const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.type === "blob") {
            const blob = state.objectStore[entry.sha];
            if (blob && blob.type === "blob") {
              nextFileSystem[fullPath] = blob.content;
            }
          } else {
            readTree(entry.sha, fullPath);
          }
        });
      };

      readTree(commit.tree, "");

      set({
        refs: nextRefs,
        fileSystem: nextFileSystem,
        stagingArea: {},
      });
    }
  },

  stash: (message) => {
    const state = get();
    // Checks if working directory is dirty
    const status = state.getStatus();
    if (Object.keys(status).length === 0) {
      throw new Error("No local changes to save");
    }

    const nextStashes = [
      ...state.stashes,
      {
        message: message || `WIP on ${state.HEAD}: ${Date.now()}`,
        stagingArea: { ...state.stagingArea },
        fileSystem: { ...state.fileSystem },
      },
    ];

    // Reset to HEAD commit files (hard reset)
    state.reset("hard");

    set({ stashes: nextStashes });
  },

  stashPop: () => {
    const state = get();
    if (state.stashes.length === 0) {
      throw new Error("No stash entries found");
    }

    const lastStash = state.stashes[state.stashes.length - 1];
    const nextStashes = state.stashes.slice(0, -1);

    set({
      fileSystem: lastStash.fileSystem,
      stagingArea: lastStash.stagingArea,
      stashes: nextStashes,
    });
  },

  getCurrentCommitHash: () => {
    const state = get();
    if (state.HEAD.startsWith("ref: ")) {
      const refPath = state.HEAD.substring(5);
      return state.refs[refPath] || null;
    }
    return state.HEAD || null;
  },

  getHistory: () => {
    const state = get();
    const history: { sha: string; commit: GitCommit }[] = [];
    let currentHash = state.getCurrentCommitHash();

    const visited = new Set<string>();

    while (currentHash && state.objectStore[currentHash] && !visited.has(currentHash)) {
      visited.add(currentHash);
      const commit = state.objectStore[currentHash] as GitCommit;
      history.push({ sha: currentHash, commit });
      // For visual simplification, traverse main parents line (parent[0])
      currentHash = commit.parents.length > 0 ? commit.parents[0] : null;
    }

    return history;
  },

  getStatus: () => {
    const state = get();
    const status: Record<string, "U" | "M" | "S" | "D" | "A"> = {};

    // 1. Get HEAD commit state
    const headCommitHash = state.getCurrentCommitHash();
    const headFiles: Record<string, string> = {};

    if (headCommitHash && state.objectStore[headCommitHash]) {
      const commit = state.objectStore[headCommitHash] as GitCommit;
      
      const readTree = (treeSha: string, prefix: string) => {
        const tree = state.objectStore[treeSha] as GitTree;
        if (!tree || tree.type !== "tree") return;

        tree.entries.forEach((entry) => {
          const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.type === "blob") {
            const blob = state.objectStore[entry.sha];
            if (blob && blob.type === "blob") {
              headFiles[fullPath] = blob.content;
            }
          } else {
            readTree(entry.sha, fullPath);
          }
        });
      };
      
      readTree(commit.tree, "");
    }

    // Combine all unique files in fileSystem, stagingArea, and headFiles
    const allFiles = new Set([
      ...Object.keys(state.fileSystem),
      ...Object.keys(state.stagingArea),
      ...Object.keys(headFiles),
    ]);

    allFiles.forEach((path) => {
      const fsContent = state.fileSystem[path];
      const staged = state.stagingArea[path];
      const headContent = headFiles[path];

      if (fsContent === undefined) {
        // File exists in HEAD or Index, but deleted from File System
        if (staged) {
          status[path] = "D"; // Staged deletion
        } else if (headContent !== undefined) {
          status[path] = "M"; // Deleted but unstaged (standard M status for unstaged deletion in simulation)
        }
      } else {
        if (headContent === undefined) {
          // File does not exist in HEAD
          if (staged) {
            status[path] = "A"; // Staged Addition
          } else {
            status[path] = "U"; // Untracked
          }
        } else {
          // File exists in HEAD
          const isStagedModified = staged && staged.content !== headContent;
          const isFSModified = fsContent !== headContent;
          const isStagingDirty = staged && fsContent !== staged.content;

          if (isStagedModified && !isStagingDirty) {
            status[path] = "S"; // Staged Modification
          } else if (isFSModified) {
            status[path] = "M"; // Unstaged Modification
          }
        }
      }
    });

    return status;
  },
}));
