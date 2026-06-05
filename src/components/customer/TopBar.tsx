import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 pb-2">
      <button
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border shadow-[var(--shadow-card)] transition hover:scale-105 active:scale-95"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-[var(--shadow-card)]">
        <div className="h-6 w-6 rounded-md bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground text-xs font-bold">
          M
        </div>
        <span className="text-sm font-semibold tracking-tight">Moldingo</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
