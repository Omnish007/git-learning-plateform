import { Metadata } from "next";
import AiSettingsClient from "@/components/ai-settings-client";

export const metadata: Metadata = {
  title: "AI Socratic Coach Configurations — GitMaster",
  description: "Select AI provider, configure local API keys, apply high-level client-side AES encryption, and manage saved credentials securely.",
};

export default function AiSettingsPage() {
  return <AiSettingsClient />;
}
