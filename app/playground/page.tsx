import { Metadata } from "next";
import PlaygroundPageWrapper from "@/components/playground-page-wrapper";

export const metadata: Metadata = {
  title: "Playground Sandbox — GitMaster",
  description: "Type commands, edit workspace documents, inspect local stashes, and visualize branches on a live SVG DAG commitments graph.",
};

export default function PlaygroundPage() {
  return <PlaygroundPageWrapper />;
}
