import { Menu, FileText, ListChecks } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { SideMenu } from "./SideMenu";
import { useTheme } from "@/hooks/use-theme";
import logoColor from "@/assets/moldingo-logo-color.png";
import logoBlack from "@/assets/moldingo-logo-black.png";

export function TopBar() {
  const { theme } = useTheme();
  const logo = theme === "dark" ? logoBlack : logoColor;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          aria-label="Meniu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border shadow-[var(--shadow-card)] transition hover:scale-105 active:scale-95"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-[var(--shadow-card)]">
          <img src={logo} alt="Moldingo" className="h-7 w-7 rounded-full object-contain" />
          <span className="text-sm font-semibold tracking-tight">Moldingo</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/comanda/$id"
            params={{ id: "demo" }}
            aria-label="Demo comandă"
            className="flex h-10 items-center gap-1.5 px-3 rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border shadow-[var(--shadow-card)] text-xs font-semibold transition hover:scale-105 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            Demo
          </Link>
          <Link
            to="/cererile-mele"
            search={{ tab: "posted" }}
            aria-label="Demo 2 — Cererile mele"
            className="flex h-10 items-center gap-1.5 px-3 rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border shadow-[var(--shadow-card)] text-xs font-semibold transition hover:scale-105 active:scale-95"
          >
            <ListChecks className="h-4 w-4" />
            Demo 2
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
