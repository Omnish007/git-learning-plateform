import { useGitStore } from "./store";
import { tokenize } from "./cli";
import { GitCommit } from "./types";

export interface WwhiProjection {
  command: string;
  isValid: boolean;
  error?: string;
  description: string;
  headChange?: {
    before: string;
    after: string;
  };
  graphChange?: {
    commitsAdded: { sha: string; message: string }[];
    commitsLost: { sha: string; message: string }[];
  };
  fileChange?: {
    path: string;
    action: "modify" | "delete" | "add" | "stage" | "unstage";
    status: "unstaged" | "staged" | "untracked";
  }[];
}

/**
 * Simulates a command's execution on the current repository state and returns the projected consequences.
 */
export function projectCommand(commandStr: string): WwhiProjection {
  const trimmed = commandStr.trim();
  const tokens = tokenize(trimmed);

  const defaultResult: WwhiProjection = {
    command: commandStr,
    isValid: false,
    description: "This command is a read-only or unsupported dry-run query.",
  };

  if (tokens[0] !== "git" || tokens.length < 2) {
    return {
      ...defaultResult,
      description: "Only git commands can be projected using the WWHI dry-run preview engine.",
    };
  }

  const sub = tokens[1];
  const args = tokens.slice(2);
  const store = useGitStore.getState();

  // Helper: Get active branch name
  const activeBranch = store.HEAD.startsWith("ref: ")
    ? store.HEAD.substring(16)
    : "detached";

  const currentCommitHash = store.getCurrentCommitHash();

  switch (sub) {
    case "init": {
      return {
        command: commandStr,
        isValid: true,
        description: "Re-initializes your local Git sandbox, erasing all active commit history, staging tables, and stashes.",
        headChange: {
          before: store.HEAD,
          after: "ref: refs/heads/main",
        },
        graphChange: {
          commitsAdded: [],
          commitsLost: store.getHistory().map(({ sha, commit }) => ({ sha, message: commit.message })),
        },
      };
    }

    case "add": {
      if (args.length === 0) {
        return { ...defaultResult, error: "Nothing specified, nothing added." };
      }
      
      const target = args[0];
      const statusMap = store.getStatus();
      const filesToStage: string[] = [];

      if (target === "." || target === "-A" || target === "--all") {
        Object.entries(statusMap).forEach(([file, code]) => {
          if (code === "U" || code === "M" || code === "D") {
            filesToStage.push(file);
          }
        });
      } else if (statusMap[target]) {
        filesToStage.push(target);
      }

      if (filesToStage.length === 0) {
        return {
          command: commandStr,
          isValid: true,
          description: "All local modifications are already staged. This command will have no effect.",
        };
      }

      return {
        command: commandStr,
        isValid: true,
        description: `Stages ${filesToStage.length} modified file(s) into the index, preparing them to be committed in the next snapshot.`,
        fileChange: filesToStage.map((path) => ({
          path,
          action: "stage",
          status: "staged",
        })),
      };
    }

    case "commit": {
      const mIdx = args.indexOf("-m");
      if (mIdx === -1 || mIdx === args.length - 1) {
        return { ...defaultResult, error: "usage: git commit -m <message>" };
      }
      const msg = args[mIdx + 1];
      const statusMap = store.getStatus();
      const stagedFiles = Object.entries(statusMap)
        .filter(([_, code]) => code === "A" || code === "S" || code === "D")
        .map(([file]) => file);

      if (stagedFiles.length === 0) {
        return {
          ...defaultResult,
          error: "nothing to commit, working tree clean",
        };
      }

      return {
        command: commandStr,
        isValid: true,
        description: `Creates a new commit snapshot on branch '${activeBranch}' containing ${stagedFiles.length} staged file change(s).`,
        graphChange: {
          commitsAdded: [{ sha: "PROJ-NEW", message: msg }],
          commitsLost: [],
        },
        fileChange: stagedFiles.map((path) => ({
          path,
          action: "unstage", // commit locks them and clears staging
          status: "staged",
        })),
      };
    }

    case "checkout": {
      if (args.length === 0) {
        return { ...defaultResult, error: "fatal: branch name or commit hash required" };
      }

      const isNew = args[0] === "-b";
      const target = isNew ? args[1] : args[0];

      if (!target) {
        return { ...defaultResult, error: "fatal: target branch name required" };
      }

      const refPath = `refs/heads/${target}`;
      const targetCommitSha = store.refs[refPath] || target;

      if (isNew) {
        return {
          command: commandStr,
          isValid: true,
          description: `Creates a new local branch named '${target}' and switches HEAD to it immediately.`,
          headChange: {
            before: store.HEAD,
            after: `ref: ${refPath}`,
          },
        };
      }

      // Check if checkout branch exists
      if (!store.refs[refPath] && (!store.objectStore[target] || store.objectStore[target].type !== "commit")) {
        return { ...defaultResult, error: `error: pathspec '${target}' did not match any files` };
      }

      return {
        command: commandStr,
        isValid: true,
        description: `Switches your workspace focus to '${target}'. Replaces active file systems with files from that commit snapshot.`,
        headChange: {
          before: store.HEAD,
          after: store.refs[refPath] ? `ref: ${refPath}` : targetCommitSha,
        },
      };
    }

    case "reset": {
      let mode: "soft" | "mixed" | "hard" = "mixed";
      let refOrHash = "HEAD";

      if (args.includes("--soft")) {
        mode = "soft";
        refOrHash = args.filter((a) => a !== "--soft")[0] || "HEAD";
      } else if (args.includes("--hard")) {
        mode = "hard";
        refOrHash = args.filter((a) => a !== "--hard")[0] || "HEAD";
      } else {
        refOrHash = args[0] || "HEAD";
      }

      const targetCommitHash = store.refs[`refs/heads/${refOrHash}`] || refOrHash;
      if (targetCommitHash === "HEAD") {
        return {
          command: commandStr,
          isValid: true,
          description: `Resets HEAD branch to itself. Mode: --${mode}.`,
        };
      }

      const targetCommit = store.objectStore[targetCommitHash] as GitCommit;
      if (!targetCommit || targetCommit.type !== "commit") {
        return { ...defaultResult, error: `fatal: ambiguous target: ${refOrHash} is not a valid commit` };
      }

      // Calculate detached history difference
      const currentHistory = store.getHistory().map(({ sha }) => sha);
      
      // Basic projection of lost commits
      const commitsLost = currentHistory
        .filter((sha) => sha !== targetCommitHash && sha.startsWith("PROJ-") === false)
        .map((sha) => ({
          sha,
          message: (store.objectStore[sha] as GitCommit).message,
        }));

      return {
        command: commandStr,
        isValid: true,
        description: `Performs a --${mode} reset to commit '${refOrHash}'. Moves HEAD branch reference to target hash.`,
        graphChange: {
          commitsAdded: [],
          commitsLost: mode === "hard" || mode === "mixed" ? commitsLost.slice(0, 3) : [], // Show commits that will fall out of active line
        },
        fileChange: mode === "hard" ? [
          { path: "* All modified files", action: "delete", status: "unstaged" }
        ] : [],
      };
    }

    case "stash": {
      if (args[0] === "pop") {
        if (store.stashes.length === 0) {
          return { ...defaultResult, error: "No stash entries found" };
        }
        return {
          command: commandStr,
          isValid: true,
          description: "Restores stashed file entries back into your active working directory and staging index table.",
        };
      }

      const statusMap = store.getStatus();
      const hasChanges = Object.keys(statusMap).length > 0;
      if (!hasChanges) {
        return { ...defaultResult, error: "No local changes to save" };
      }

      return {
        command: commandStr,
        isValid: true,
        description: "Shelves all currently staged and unstaged file modifications into a stash buffer, reverting your active working files back to HEAD.",
        fileChange: [
          { path: "* Active files reverted", action: "delete", status: "unstaged" }
        ],
      };
    }

    default:
      return {
        command: commandStr,
        isValid: true,
        description: "This command executes a standard query, status lookup, or logging operation. No graph modifications projected.",
      };
  }
}
