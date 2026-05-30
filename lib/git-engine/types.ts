export type GitObjectType = "blob" | "tree" | "commit";

export interface GitBlob {
  type: "blob";
  content: string;
}

export interface GitTreeEntry {
  name: string;
  sha: string;
  type: "blob" | "tree";
}

export interface GitTree {
  type: "tree";
  entries: GitTreeEntry[];
}

export interface GitCommit {
  type: "commit";
  tree: string; // SHA-1 of root tree
  parents: string[]; // SHA-1s of parent commits
  author: string;
  message: string;
  timestamp: number;
}

export type GitObject = GitBlob | GitTree | GitCommit;

export interface StagingEntry {
  sha: string;
  content: string;
}

export interface GitState {
  fileSystem: Record<string, string>; // Flat map: filepath -> content
  stagingArea: Record<string, StagingEntry>; // Flat map: filepath -> staged info
  objectStore: Record<string, GitObject>; // Map: SHA-1 -> GitObject
  refs: Record<string, string>; // Map: refpath (e.g. refs/heads/main) -> commit SHA-1
  HEAD: string; // "ref: refs/heads/main" or raw commit SHA-1 (detached)
  stashes: {
    message: string;
    stagingArea: Record<string, StagingEntry>;
    fileSystem: Record<string, string>;
  }[];
  config: {
    userName: string;
    userEmail: string;
  };
  terminalHistory: string[];
}
