"use client";

import dynamic from "next/dynamic";

const PlaygroundClient = dynamic(() => import("@/components/playground-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060609] flex flex-col items-center justify-center font-mono text-sm text-indigo-brand">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-brand border-t-transparent animate-spin" />
        <span>Bootstrapping sandbox workspace...</span>
      </div>
    </div>
  ),
});

export default function PlaygroundPageWrapper() {
  return <PlaygroundClient />;
}
