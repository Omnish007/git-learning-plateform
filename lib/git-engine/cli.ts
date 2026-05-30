import { useGitStore } from "./store";
import { gitHashObject } from "./sha1";

export interface CliResult {
  stdout: string;
  stderr: string;
  specialAction?: "clear";
}

/**
 * Tokenizes a command line string, respecting double and single quotes.
 */
export function tokenize(command: string): string[] {
  const matches = command.match(/"[^"]*"|'[^']*'|\S+/g);
  if (!matches) return [];
  return matches.map((m) => {
    if ((m.startsWith('"') && m.endsWith('"')) || (m.startsWith("'") && m.endsWith("'"))) {
      return m.slice(1, -1);
    }
    return m;
  });
}

export function executeCommand(commandStr: string): CliResult {
  const trimmed = commandStr.trim();
  if (!trimmed) {
    return { stdout: "", stderr: "" };
  }

  // 1. Handle echo redirection (e.g. echo "content" > filepath)
  if (trimmed.includes(">")) {
    const redirectIndex = trimmed.indexOf(">");
    const isAppend = trimmed.charAt(redirectIndex + 1) === ">";
    const leftCmd = trimmed.substring(0, redirectIndex).trim();
    const rightPath = trimmed.substring(redirectIndex + (isAppend ? 2 : 1)).trim();

    const leftTokens = tokenize(leftCmd);
    if (leftTokens[0] === "echo") {
      const content = leftTokens.slice(1).join(" ");
      const store = useGitStore.getState();
      
      let finalContent = content;
      if (isAppend && store.fileSystem[rightPath] !== undefined) {
        finalContent = store.fileSystem[rightPath] + "\n" + content;
      }
      
      store.writeFile(rightPath, finalContent);
      return { stdout: "", stderr: "" };
    }
  }

  const tokens = tokenize(trimmed);
  const baseCmd = tokens[0];

  const store = useGitStore.getState();

  // --- Unix Shell Utilities ---
  switch (baseCmd) {
    case "clear":
    case "cls":
      return { stdout: "", stderr: "", specialAction: "clear" };

    case "echo": {
      return { stdout: tokens.slice(1).join(" "), stderr: "" };
    }

    case "touch": {
      if (tokens.length < 2) {
        return { stdout: "", stderr: "touch: missing file operand" };
      }
      const path = tokens[1];
      if (store.fileSystem[path] === undefined) {
        store.writeFile(path, "");
      }
      return { stdout: "", stderr: "" };
    }

    case "mkdir": {
      if (tokens.length < 2) {
        return { stdout: "", stderr: "mkdir: missing operand" };
      }
      // Directory creation is virtual (implicit in paths like dir/file.txt)
      return { stdout: "", stderr: "" };
    }

    case "cat": {
      if (tokens.length < 2) {
        return { stdout: "", stderr: "cat: missing file operand" };
      }
      const path = tokens[1];
      const content = store.fileSystem[path];
      if (content === undefined) {
        return { stdout: "", stderr: `cat: ${path}: No such file or directory` };
      }
      return { stdout: content, stderr: "" };
    }

    case "ls": {
      const files = Object.keys(store.fileSystem);
      if (files.length === 0) {
        return { stdout: "", stderr: "" };
      }
      
      const isLong = tokens.includes("-la") || tokens.includes("-l");
      if (isLong) {
        const lines = files.map((file) => {
          const content = store.fileSystem[file];
          const bytes = new TextEncoder().encode(content).length;
          return `-rw-r--r--  1 gitmaster  staff  ${bytes} May 30 12:00 ${file}`;
        });
        return { stdout: lines.join("\n"), stderr: "" };
      }

      return { stdout: files.join("  "), stderr: "" };
    }

    // --- Git Engine Commands ---
    case "git": {
      if (tokens.length < 2) {
        return {
          stdout: "usage: git [--version] [--help] <command> [<args>]",
          stderr: "",
        };
      }

      const gitSubCmd = tokens[1];
      const args = tokens.slice(2);

      switch (gitSubCmd) {
        case "init": {
          store.init();
          return {
            stdout: "Initialized empty Git repository in /workspace/.git/",
            stderr: "",
          };
        }

        case "add": {
          if (args.length === 0) {
            return { stdout: "", stderr: "Nothing specified, nothing added." };
          }
          try {
            if (args[0] === "." || args[0] === "-A" || args[0] === "--all") {
              store.addAll();
              return { stdout: "", stderr: "" };
            }
            
            // Add specific file
            store.addFile(args[0]);
            return { stdout: "", stderr: "" };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred during git add" };
          }
        }

        case "commit": {
          const mIdx = args.indexOf("-m");
          if (mIdx === -1 || mIdx === args.length - 1) {
            return {
              stdout: "",
              stderr: "error: switch `m' requires a value\nusage: git commit -m <message>",
            };
          }
          const message = args[mIdx + 1];
          try {
            const sha = store.commit(message);
            const shortSha = sha.substring(0, 7);
            const parent = store.getCurrentCommitHash();
            const activeBranch = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : "detached";
            return {
              stdout: `[${activeBranch} ${shortSha}] ${message}\n 1 file changed, active updates synced`,
              stderr: "",
            };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred during commit" };
          }
        }

        case "status": {
          const statusMap = store.getStatus();
          const activeBranch = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : "detached";
          
          let output = `On branch ${activeBranch}\n`;
          
          const stagedFiles: string[] = [];
          const unstagedFiles: string[] = [];
          const untrackedFiles: string[] = [];

          Object.entries(statusMap).forEach(([file, code]) => {
            if (code === "A" || code === "S" || code === "D") {
              stagedFiles.push(file);
            } else if (code === "M") {
              unstagedFiles.push(file);
            } else if (code === "U") {
              untrackedFiles.push(file);
            }
          });

          if (stagedFiles.length === 0 && unstagedFiles.length === 0 && untrackedFiles.length === 0) {
            return { stdout: `${output}nothing to commit, working tree clean`, stderr: "" };
          }

          if (stagedFiles.length > 0) {
            output += `\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
            stagedFiles.forEach((file) => {
              const code = statusMap[file];
              const desc = code === "A" ? "new file:   " : (code === "D" ? "deleted:    " : "modified:   ");
              output += `\t\x1b[32m${desc}${file}\x1b[0m\n`;
            });
          }

          if (unstagedFiles.length > 0) {
            output += `\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n`;
            unstagedFiles.forEach((file) => {
              const fsExist = store.fileSystem[file] !== undefined;
              const desc = fsExist ? "modified:   " : "deleted:    ";
              output += `\t\x1b[31m${desc}${file}\x1b[0m\n`;
            });
          }

          if (untrackedFiles.length > 0) {
            output += `\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
            untrackedFiles.forEach((file) => {
              output += `\t\x1b[31m${file}\x1b[0m\n`;
            });
          }

          return { stdout: output, stderr: "" };
        }

        case "log": {
          const history = store.getHistory();
          if (history.length === 0) {
            return { stdout: "fatal: your current branch does not have any commits yet", stderr: "" };
          }

          const isOneLine = args.includes("--oneline");
          
          if (isOneLine) {
            const lines = history.map(({ sha, commit }) => {
              const shortSha = sha.substring(0, 7);
              // Decorate HEAD pointers
              let decorators = "";
              if (store.getCurrentCommitHash() === sha) {
                const activeBranch = store.HEAD.startsWith("ref: ") ? `HEAD -> ${store.HEAD.substring(16)}` : "HEAD";
                decorators = ` \x1b[36m(${activeBranch})\x1b[0m`;
              }
              return `\x1b[33m${shortSha}\x1b[0m${decorators} ${commit.message}`;
            });
            return { stdout: lines.join("\n"), stderr: "" };
          }

          const blocks = history.map(({ sha, commit }) => {
            let decorators = "";
            if (store.getCurrentCommitHash() === sha) {
              const activeBranch = store.HEAD.startsWith("ref: ") ? `HEAD -> ${store.HEAD.substring(16)}` : "HEAD";
              decorators = ` \x1b[36m(${activeBranch})\x1b[0m`;
            }

            const dateStr = new Date(commit.timestamp).toUTCString();
            return `\x1b[33mcommit ${sha}\x1b[0m${decorators}
Author: ${commit.author}
Date:   ${dateStr}

    ${commit.message}`;
          });

          return { stdout: blocks.join("\n\n"), stderr: "" };
        }

        case "branch": {
          if (args.length === 0) {
            // List branches
            const activeBranchName = store.HEAD.startsWith("ref: ") ? store.HEAD.substring(16) : null;
            const branches = Object.keys(store.refs)
              .filter((ref) => ref.startsWith("refs/heads/"))
              .map((ref) => ref.substring(11));

            const lines = branches.map((b) => {
              if (b === activeBranchName) {
                return `* \x1b[32m${b}\x1b[0m`;
              }
              return `  ${b}`;
            });
            return { stdout: lines.join("\n"), stderr: "" };
          }

          // Create new branch
          try {
            store.createBranch(args[0]);
            return { stdout: "", stderr: "" };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred" };
          }
        }

        case "checkout": {
          if (args.length === 0) {
            return { stdout: "", stderr: "fatal: branch name or commit hash required" };
          }

          const isNewBranch = args[0] === "-b";
          if (isNewBranch) {
            if (args.length < 2) {
              return { stdout: "", stderr: "fatal: branch name required for -b option" };
            }
            const bName = args[1];
            try {
              store.createBranch(bName);
              store.checkout(bName);
              return { stdout: `Switched to a new branch '${bName}'`, stderr: "" };
            } catch (err: any) {
              return { stdout: "", stderr: err.message || "An error occurred" };
            }
          }

          // Normal checkout
          const target = args[0];
          try {
            store.checkout(target);
            return { stdout: `Switched to branch/commit '${target}'`, stderr: "" };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred" };
          }
        }

        case "reset": {
          let mode: "soft" | "mixed" | "hard" = "mixed";
          let refOrHash = "";

          if (args.includes("--soft")) {
            mode = "soft";
            refOrHash = args.filter((a) => a !== "--soft")[0] || "HEAD";
          } else if (args.includes("--hard")) {
            mode = "hard";
            refOrHash = args.filter((a) => a !== "--hard")[0] || "HEAD";
          } else {
            refOrHash = args[0] || "HEAD";
          }

          try {
            store.reset(mode, refOrHash);
            return { stdout: `HEAD is now at reset target`, stderr: "" };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred" };
          }
        }

        case "stash": {
          if (args[0] === "pop") {
            try {
              store.stashPop();
              return { stdout: "Dropped refs/stash@{0} - Applied stashed changes", stderr: "" };
            } catch (err: any) {
              return { stdout: "", stderr: err.message || "An error occurred" };
            }
          }

          if (args[0] === "list") {
            const listLines = store.stashes.map((s, idx) => `stash@{${idx}}: ${s.message}`);
            return { stdout: listLines.reverse().join("\n"), stderr: "" };
          }

          // Stash save
          try {
            const msg = args[0] === "save" ? args.slice(1).join(" ") : args.join(" ");
            store.stash(msg || undefined);
            return { stdout: "Saved working directory and index state WIP", stderr: "" };
          } catch (err: any) {
            return { stdout: "", stderr: err.message || "An error occurred" };
          }
        }

        default:
          return {
            stdout: "",
            stderr: `git: '${gitSubCmd}' is not a git command. See 'git --help'.`,
          };
      }
    }

    default:
      return {
        stdout: "",
        stderr: `bash: ${baseCmd}: command not found`,
      };
  }
}
