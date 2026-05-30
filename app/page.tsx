import Link from "next/link";
import { GitBranch, Shield, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import MockWorkspace from "@/components/mock-workspace";
import { FadeIn } from "@/components/fade-in";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden selection:bg-mint/30 selection:text-mint">
      {/* Editorial Gradient Glow (Apple/macOS Style) */}
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[1000px] h-[500px] bg-gradient-to-b from-indigo-brand/20 via-indigo-brand/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full border-b border-panel-border bg-background/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-brand to-mint shadow-lg shadow-indigo-brand/20">
              <GitBranch className="h-5 w-5 text-background stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-mint bg-clip-text text-transparent">
              GitMaster
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Learn
            </Link>
            <Link href="/practice" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Practice
            </Link>
            <Link href="/playground" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Playground
            </Link>
            <Link href="/reference" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Reference
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/playground" 
              className="relative inline-flex h-9.5 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <FadeIn delay={0.05} duration={0.6}>
          {/* Version badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-mint animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Introducing GitMaster 1.0 — Visual Learning OS
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl leading-[1.1] mb-6 text-foreground">
            The only resource you <br />
            ever need to <span className="bg-gradient-to-r from-indigo-brand via-mint to-mint bg-clip-text text-transparent">master Git.</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground mb-10">
            Ditch the boring documents. Enter an interactive workspace featuring a real terminal, animated DAG commit graphs, interactive rebasing, and an AI Socratic coach.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 w-full sm:w-auto">
            <Link
              href="/playground"
              className="flex h-13 w-full sm:w-52 items-center justify-center gap-2 rounded-2xl bg-foreground text-background font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] shadow-xl shadow-foreground/5"
            >
              Enter Sandbox <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/learn"
              className="flex h-13 w-full sm:w-52 items-center justify-center rounded-2xl border border-panel-border bg-panel/30 backdrop-blur-md font-semibold text-foreground hover:bg-panel/60 transition-colors active:scale-[0.98]"
            >
              Start Lessons
            </Link>
          </div>
        </FadeIn>

        {/* Beautiful Mock Workspace Panel (Interactive Client Component) */}
        <MockWorkspace />
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-panel-border/40">
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-indigo-brand">Engine Capabilities</span>
          <h2 className="text-3xl font-extrabold md:text-5xl mt-3 text-foreground tracking-tight">
            Designed for interactive mastery.
          </h2>
          <p className="text-muted-foreground text-md max-w-xl mx-auto mt-4">
            Git is hard because it is invisible. GitMaster visualizes every internal state so you build a perfect mental model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl border border-panel-border bg-panel/30 p-8 hover:border-indigo-brand/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-indigo-brand/10 text-indigo-brand flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Live DAG Visualizer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every checkout, commit, merge, or interactive rebase dynamically draws itself as a living graph node with custom spring animations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-panel-border bg-panel/30 p-8 hover:border-mint/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-mint/10 text-mint flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">CLI Terminal Simulator</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Type actual git commands with support for complex flags like `git add -p` or interactive rebases. Autocomplete and arrows command history included.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-panel-border bg-panel/30 p-8 hover:border-amber-coach/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-amber-coach/10 text-amber-coach flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Socratic AI Coach</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stuck or made a typo? The coach won't just dump the solution. It asks leading, conceptual questions to help you solve it yourself.
            </p>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-20 rounded-3xl border border-panel-border bg-gradient-to-tr from-panel/20 to-panel/60 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mint">Advanced Sandbox</span>
              <h3 className="text-3xl font-extrabold mt-3 text-foreground tracking-tight">
                Practice safely with "What Would Happen If..." pre-execution previews
              </h3>
              <p className="text-muted-foreground mt-4 leading-relaxed text-sm">
                Destructive CLI commands like `git reset --hard` or forced pushes are usually terrifying. With WWHI, you can click "Preview" to inspect a visual split-screen before running the command, highlighting exactly what files and nodes would be altered.
              </p>
              
              <ul className="mt-8 flex flex-col gap-3 font-medium text-sm text-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-mint" /> 100% Client-side local persistence
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-mint" /> High-level encrypted AI key storage
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-mint" /> Visual 3-way merge conflict editor
                </li>
              </ul>
            </div>

            <div className="border border-panel-border bg-background/50 rounded-2xl p-6 font-mono text-xs shadow-lg">
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider block mb-4">// WWHI PREVIEW OVERLAY</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-panel-border p-3.5 rounded-xl bg-panel/30">
                  <span className="text-[10px] text-muted-foreground block mb-2">CURRENT STATE</span>
                  <div className="h-3 w-full bg-indigo-brand/20 rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-indigo-brand/20 rounded" />
                </div>
                <div className="border border-destructive/30 p-3.5 rounded-xl bg-destructive/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-destructive/10 to-transparent animate-pulse" />
                  <span className="text-[10px] text-destructive block mb-2 font-bold">PROJECTED STATE (git reset --hard)</span>
                  <div className="h-3 w-full bg-destructive/20 rounded mb-1.5 line-through opacity-50" />
                  <div className="h-3 w-1/2 bg-indigo-brand/20 rounded" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-3.5 py-1.5 rounded-lg border border-panel-border bg-panel text-foreground font-semibold">Cancel</button>
                <button className="px-3.5 py-1.5 rounded-lg bg-destructive text-white font-semibold">Execute Anyway</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-panel-border bg-panel/20 py-12 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-brand flex items-center justify-center">
              <GitBranch className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="font-bold text-foreground">GitMaster v1.0</span>
          </div>
          <p>© 2026 GitMaster learning platform. Built for developer excellence.</p>
        </div>
      </footer>
    </div>
  );
}
