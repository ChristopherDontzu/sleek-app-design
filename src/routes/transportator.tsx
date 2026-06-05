import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { MapView } from "@/components/customer/MapView";
import { TopBar } from "@/components/customer/TopBar";
import { Map as MapIcon, List, Calendar, Users, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [filter, setFilter] = useState<FilterId>("pentru-mine");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "map";
    return (localStorage.getItem("moldingo:transporter:view") as ViewMode) || "map";
  });

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
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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
            { label: "Acasă", active: true },
            { label: "Cursele mele" },
            { label: "Rutele mele" },
            { label: "Mesaje" },
            { label: "Mai multe" },
          ].map((t) => (
            <button
              key={t.label}
              className={cn(
                "py-3 text-xs font-medium",
                t.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </main>
    </ThemeProvider>
  );
}

function RequestCard({ r, compact = false }: { r: Request; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl bg-card", !compact && "border border-border shadow-[var(--shadow-card)] p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold truncate">
            {r.from} → {r.to}
          </div>
          <div className="text-sm text-muted-foreground">{r.type}</div>
          {r.badge && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">
              <Truck className="h-3 w-3" /> {r.badge}
            </span>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-muted text-muted-foreground px-2.5 py-1 text-xs font-medium">
          {r.km} km
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {r.date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {r.offers} oferte
        </span>
      </div>
    </div>
  );
}
