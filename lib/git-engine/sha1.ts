import CryptoJS from "crypto-js";

/**
 * Computes authentic Git-style SHA-1 hash by prepending the object type, 
 * content length, and null byte (\0) before hashing.
 */
export function gitHashObject(type: "blob" | "tree" | "commit", content: string): string {
  // Use a string null representation that maps cleanly
  const header = `${type} ${content.length}\u0000`;
  const storeString = header + content;
  return CryptoJS.SHA1(storeString).toString(CryptoJS.enc.Hex);
}

/**
 * Normal SHA-1 helper for basic text hashing
 */
export function sha1(content: string): string {
  return CryptoJS.SHA1(content).toString(CryptoJS.enc.Hex);
}
