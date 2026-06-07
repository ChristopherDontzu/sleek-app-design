import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { MapView } from "@/components/customer/MapView";
import { TopBar } from "@/components/customer/TopBar";
import { Map as MapIcon, List, Calendar, Users, Truck, Home, Briefcase, GitFork, MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, homeForRole } from "@/hooks/use-role";

export const Route = createFileRoute("/transportator")({
  head: () => ({
    meta: [
      { title: "Moldingo Transportator — Cereri și rute" },
      { name: "description", content: "Panou transportator: vezi cereri pe hartă sau listă, filtrează după ruta ta." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: TransporterHome,
});

type FilterId = "pentru-mine" | "toate" | "din-md" | "spre-md" | "origine";
type ViewMode = "map" | "list";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "pentru-mine", label: "Pentru mine" },
  { id: "toate", label: "Toate" },
  { id: "din-md", label: "Din Moldova" },
  { id: "spre-md", label: "Spre Moldova" },
  { id: "origine", label: "Origine" },
];

type Request = {
  id: string;
  from: string;
  to: string;
  type: string;
  date: string;
  offers: number;
  km: number;
  matchesRoute: boolean;
  inMd?: boolean;
  toMd?: boolean;
  badge?: string;
};

const MOCK: Request[] = [
  { id: "1", from: "Chișinău", to: "Chișinău", type: "Colet Mic", date: "19.05.2026", offers: 0, km: 0, matchesRoute: true, inMd: true },
  { id: "2", from: "Chișinău", to: "Suhuluceni", type: "Altele", date: "19.05.2026", offers: 0, km: 54, matchesRoute: true, inMd: true },
  { id: "3", from: "Chișinău", to: "Cheltuitori", type: "Transport mare", date: "22.05.2026", offers: 0, km: 9, matchesRoute: false, inMd: true, badge: "Transport mare" },
  { id: "4", from: "Căbăiești", to: "Berlin", type: "1 persoană", date: "19.05.2026", offers: 0, km: 1207, matchesRoute: false, toMd: false },
  { id: "5", from: "Amsterdam", to: "Cobîlea", type: "3 persoane", date: "19.05.2026", offers: 1, km: 1759, matchesRoute: false, toMd: true },
  { id: "6", from: "Hamburg", to: "Fălești", type: "Persoane · 3 persoane", date: "19.05.2026", offers: 1, km: 2100, matchesRoute: true, toMd: true, badge: "Negociabil" },
];

function applyFilter(items: Request[], f: FilterId): Request[] {
  switch (f) {
    case "pentru-mine": return items.filter((r) => r.matchesRoute);
    case "din-md": return items.filter((r) => r.inMd);
    case "spre-md": return items.filter((r) => r.toMd);
    case "origine":
    case "toate":
    default: return items;
  }
}

function TransporterHome() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();
  const [filter, setFilter] = useState<FilterId>("pentru-mine");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "map";
    return (localStorage.getItem("moldingo:transporter:view") as ViewMode) || "map";
  });

  useEffect(() => {
    if (roleLoading) return;
    if (role === "driver") {
      navigate({ to: homeForRole(role), replace: true });
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("moldingo:transporter:view", view);
    }
  }, [view]);

  const items = applyFilter(MOCK, filter);

  return (
    <ThemeProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-background">
        <TopBar />

        {/* Filter chips */}
        <div className="absolute left-0 right-0 top-[64px] z-10 px-3">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition",
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-card)]"
                    : "bg-card/90 backdrop-blur-md text-foreground border-border hover:bg-accent"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Segmented Map/List toggle */}
          <div className="mt-1 inline-flex rounded-full bg-card/90 backdrop-blur-md border border-border p-1 shadow-[var(--shadow-card)]">
            <button
              onClick={() => setView("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              <MapIcon className="h-3.5 w-3.5" /> Hartă
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" /> Listă
            </button>
          </div>
        </div>

        {/* Content */}
        {view === "map" ? (
          <>
            <MapView />
            {/* Floating mini-card with first matching request */}
            {items[0] && (
              <div className="absolute left-3 right-3 bottom-20 z-10 rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-3">
                <RequestCard r={items[0]} compact />
                <div className="mt-1 text-center text-xs text-muted-foreground">
                  1 / {items.length} cereri{filter === "pentru-mine" ? " pe ruta ta" : ""}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 overflow-y-auto pt-[140px] pb-24 px-3">
            <div className="space-y-3">
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nicio cerere pentru filtrul curent.
                </div>
              )}
              {items.map((r) => (
                <RequestCard key={r.id} r={r} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <nav className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          {[
            { label: "Acasă", icon: Home, active: true },
            { label: "Cursele mele", icon: Briefcase },
            { label: "Rutele mele", icon: GitFork },
            { label: "Mesaje", icon: MessageSquare },
            { label: "Mai multe", icon: MoreHorizontal },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium leading-tight",
                  t.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </ThemeProvider>
  );
}

function RequestCard({ r, compact = false }: { r: Request; compact?: boolean }) {
  return (
    <div
      className={cn(
        "group rounded-2xl bg-card transition cursor-pointer",
        !compact && "border border-border shadow-[var(--shadow-card)] p-4 hover:border-primary/40 hover:-translate-y-px hover:shadow-[var(--shadow-elegant)]",
        compact && "p-1"
      )}
    >
      {/* Header row: type pill + km */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
          <Truck className="h-3 w-3" /> {r.type}
        </span>
        <span className="shrink-0 rounded-full border border-border text-foreground px-2.5 py-1 text-[11px] font-semibold tabular-nums">
          {r.km} km
        </span>
      </div>

      {/* Route timeline */}
      <div className="mt-3 flex items-stretch gap-3">
        <div className="flex flex-col items-center pt-1.5 pb-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_145)] shadow-[0_0_0_3px_color-mix(in_oklab,oklch(0.72_0.18_145)_25%,transparent)]" />
          <span className="w-px flex-1 my-1 bg-gradient-to-b from-[oklch(0.72_0.18_145)] to-destructive opacity-50" />
          <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_25%,transparent)]" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">De la</div>
            <div className="text-[14px] font-semibold truncate leading-tight">{r.from}</div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Către</div>
            <div className="text-[14px] font-semibold truncate leading-tight">{r.to}</div>
          </div>
        </div>
      </div>

      {/* Footer: date + offers + badge */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {r.date}
        </span>
        <div className="flex items-center gap-2">
          {r.badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent-foreground px-2 py-0.5 text-[11px] font-medium">
              {r.badge}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              r.offers > 0
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Users className="h-3 w-3" /> {r.offers} {r.offers === 1 ? "ofertă" : "oferte"}
          </span>
        </div>
      </div>
    </div>
  );
}
