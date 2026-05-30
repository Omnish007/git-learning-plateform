import { create } from "zustand";
import { persist } from "zustand/middleware";
import { encryptKey, decryptKey } from "./crypto-utils";

export type AiProvider = "mock" | "google" | "groq" | "huggingface" | "ollama";

interface AiSettingsState {
  activeProvider: AiProvider;
  ollamaEndpoint: string;
  encryptedKeys: Record<string, string>; // Maps provider -> encrypted key
}

interface AiSettingsActions {
  setActiveProvider: (provider: AiProvider) => void;
  setOllamaEndpoint: (endpoint: string) => void;
  saveKey: (provider: Exclude<AiProvider, "mock">, rawKey: string) => void;
  deleteKey: (provider: Exclude<AiProvider, "mock">) => void;
  getDecryptedKey: (provider: Exclude<AiProvider, "mock">) => string;
  hasKey: (provider: Exclude<AiProvider, "mock">) => boolean;
}

type AiSettingsStore = AiSettingsState & AiSettingsActions;

export const useAiStore = create<AiSettingsStore>()(
  persist(
    (set, get) => ({
      activeProvider: "mock",
      ollamaEndpoint: "http://localhost:11434",
      encryptedKeys: {},

      setActiveProvider: (activeProvider) => set({ activeProvider }),
      
      setOllamaEndpoint: (ollamaEndpoint) => set({ ollamaEndpoint }),

      saveKey: (provider, rawKey) => {
        const encrypted = encryptKey(rawKey);
        set((state) => ({
          encryptedKeys: {
            ...state.encryptedKeys,
            [provider]: encrypted,
          },
        }));
      },

      deleteKey: (provider) => {
        set((state) => {
          const nextKeys = { ...state.encryptedKeys };
          delete nextKeys[provider];
          
          // Fallback active provider to mock if its key is deleted
          const nextActive = state.activeProvider === provider ? "mock" : state.activeProvider;

          return {
            encryptedKeys: nextKeys,
            activeProvider: nextActive,
          };
        });
      },

      getDecryptedKey: (provider) => {
        const encrypted = get().encryptedKeys[provider];
        if (!encrypted) return "";
        return decryptKey(encrypted);
      },

      hasKey: (provider) => {
        return !!get().encryptedKeys[provider];
      },
    }),
    {
      name: "gitmaster-ai-settings", // LocalStorage storage key
    }
  )
);
