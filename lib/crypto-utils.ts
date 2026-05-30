import CryptoJS from "crypto-js";

const STORAGE_SECRET = "gitmaster-secure-client-salt-key-2026";

/**
 * Encrypts cleartext using AES-256.
 */
export function encryptKey(cleartext: string): string {
  try {
    return CryptoJS.AES.encrypt(cleartext, STORAGE_SECRET).toString();
  } catch (e) {
    console.error("Encryption failed:", e);
    return "";
  }
}

/**
 * Decrypts ciphertext using AES-256.
 */
export function decryptKey(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, STORAGE_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "";
  }
}
