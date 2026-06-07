import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { TopBar } from "@/components/customer/TopBar";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  MapPin,
  Flag,
  Package,
  Users,
  Calendar,
  Euro,
  Trash2,
  Pencil,
  Map as MapIcon,
  ChevronRight,
  AlertTriangle,
  RotateCw,
  Truck,
} from "lucide-react";

type TabId = "posted" | "accepted" | "transit" | "done";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; sub: string }[] = [
  { id: "posted", label: "În procesare", icon: Clock, sub: "Așteaptă oferte" },
  { id: "accepted", label: "Acceptate", icon: CheckCircle2, sub: "Transportator ales" },
  { id: "transit", label: "În tranzit", icon: MapPin, sub: "Curse în desfășurare" },
  { id: "done", label: "Finalizate", icon: Flag, sub: "Livrate sau închise" },
];

type Status = "asteptare" | "inactiva" | "activa" | "finalizata" | "anulata";

type Req = {
  id: string;
  status: Status;
  tab: TabId;
  title: string;
  from: string;
  to: string;
  kg?: number;
  people?: number;
  date: string;
  approx?: boolean;
  price?: string;
  ago?: string;
  note?: string;
  carrier?: string;
};

const DATA: Req[] = [
  // posted
  { id: "p1", tab: "posted", status: "asteptare", title: "Doar colet", from: "Chișinău", to: "CZ-11000 Prague", kg: 80, date: "7 iun.", ago: "de 3h" },
  { id: "p2", tab: "posted", status: "asteptare", title: "Doar colet", from: "Centrul Istoric", to: "300010", kg: 52, date: "7 iun.", ago: "de 4h" },
  { id: "p3", tab: "posted", status: "inactiva", title: "Persoane", from: "București", to: "Torino", people: 2, date: "4 iun.", note: "Momentan nu sunt transportatori disponibili pe această rută sau ruta este foarte solicitată." },
  // accepted
  { id: "a1", tab: "accepted", status: "activa", title: "Doar colet", from: "Chișinău", to: "Iași", kg: 15, date: "12 iun.", approx: true, price: "EUR 45", carrier: "MoldExpress SRL" },
  // transit
  { id: "t1", tab: "transit", status: "activa", title: "Persoane + colet", from: "Bologna", to: "Chișinău", kg: 10, people: 3, date: "24 mai", approx: true, price: "EUR 380", carrier: "EuroTrans" },
  { id: "t2", tab: "transit", status: "activa", title: "Doar colet", from: "Paris", to: "Chișinău", kg: 10, date: "10 iun.", approx: true, price: "EUR 20", carrier: "FastCargo" },
  // done
  { id: "d1", tab: "done", status: "finalizata", title: "Doar colet", from: "Castel San Pietro Terme", to: "Bălți", kg: 30, date: "19 mai", approx: true, price: "EUR 60" },
  { id: "d2", tab: "done", status: "anulata", title: "Persoane", from: "Stăuceni", to: "Wola Mokrzeska", people: 2, date: "17 mai", approx: true, price: "EUR 240" },
  { id: "d3", tab: "done", status: "finalizata", title: "Persoane", from: "Hamburg", to: "Stăuceni", people: 3, date: "11 mai", approx: true, price: "EUR 320" },
];

type Search = { tab?: TabId };

export const Route = createFileRoute("/cererile-mele")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const t = s.tab;
    if (t === "posted" || t === "accepted" || t === "transit" || t === "done") return { tab: t };
    return { tab: "posted" };
  },
  head: () => ({
    meta: [
      { title: "Cererile mele — Moldingo" },
      { name: "description", content: "Toate cererile tale: în procesare, acceptate, în tranzit și finalizate." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: MyRequestsPage,
});

function MyRequestsPage() {
  const { tab = "posted" } = useSearch({ from: "/cererile-mele" });
  const navigate = useNavigate();
  const items = useMemo(() => DATA.filter((r) => r.tab === tab), [tab]);
  const active = TABS.find((t) => t.id === tab)!;
  const ActiveIcon = active.icon;

  return (
    <ThemeProvider>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-background pb-24">
        <TopBar />

        {/* Header spacer */}
        <div className="pt-[72px]" />

        {/* Title */}
        <div className="px-4">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight">Cererile mele</h1>
            <p className="text-sm text-muted-foreground mt-1">{active.sub}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 px-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = t.id === tab;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate({ to: "/cererile-mele", search: { tab: t.id } })}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-card)]"
                        : "bg-card text-foreground border-border hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section pill */}
        <div className="mt-3 px-4">
          <div className="mx-auto max-w-2xl flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-card)]">
              <ActiveIcon className="h-3.5 w-3.5" />
              {active.label}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="mt-4 px-3">
          <div className="mx-auto max-w-2xl space-y-3">
            {items.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              items.map((r) => <RequestCard key={r.id} r={r} />)
            )}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

function StatusPill({ s }: { s: Status }) {
  const map: Record<Status, { label: string; cls: string; dot: string }> = {
    asteptare:  { label: "În Așteptare", cls: "bg-[oklch(0.95_0.06_75)] text-[oklch(0.45_0.15_55)]", dot: "bg-[oklch(0.65_0.18_55)]" },
    inactiva:   { label: "Inactivă",     cls: "bg-muted text-muted-foreground",                       dot: "bg-muted-foreground" },
    activa:     { label: "Activă",       cls: "bg-[oklch(0.92_0.06_180)] text-[oklch(0.38_0.1_195)]", dot: "bg-[oklch(0.6_0.13_190)]" },
    finalizata: { label: "Finalizată",   cls: "bg-muted text-muted-foreground",                       dot: "bg-muted-foreground" },
    anulata:    { label: "Anulată",      cls: "bg-destructive/15 text-destructive",                   dot: "bg-destructive" },
  };
  const m = map[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

function Chip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function IconBtn({ icon: Icon, tone = "muted", label }: { icon: React.ComponentType<{ className?: string }>; tone?: "muted" | "danger" | "primary" | "info"; label: string }) {
  const tones = {
    muted: "text-muted-foreground hover:text-foreground",
    danger: "text-destructive hover:bg-destructive/10",
    primary: "text-primary hover:bg-primary/10",
    info: "text-[oklch(0.55_0.13_220)] hover:bg-[oklch(0.55_0.13_220)/0.1]",
  } as const;
  return (
    <button
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition active:scale-95",
        tones[tone]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function RequestCard({ r }: { r: Req }) {
  const showPostedActions = r.tab === "posted";
  const showCarrier = r.tab === "accepted" || r.tab === "transit";
  const showOpenCta = r.tab === "transit" || r.tab === "done" || r.tab === "accepted";

  return (
    <article className="rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusPill s={r.status} />
            {r.ago && <span className="text-xs text-muted-foreground">{r.ago}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {showPostedActions && (
              <>
                <IconBtn icon={Trash2} tone="danger" label="Șterge" />
                <IconBtn icon={Pencil} tone="info" label="Editează" />
                <IconBtn icon={MapIcon} tone="primary" label="Hartă" />
              </>
            )}
            {!showPostedActions && r.tab === "done" && <IconBtn icon={Trash2} tone="danger" label="Șterge" />}
            {!showPostedActions && r.tab !== "done" && <IconBtn icon={MapIcon} tone="primary" label="Hartă" />}
          </div>
        </div>

        <h3 className="mt-3 text-base font-bold leading-tight">{r.title}</h3>

        {/* Route */}
        <div className="mt-3 flex items-stretch gap-3">
          <div className="flex flex-col items-center pt-1.5 pb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_145)] shadow-[0_0_0_3px_color-mix(in_oklab,oklch(0.72_0.18_145)_25%,transparent)]" />
            <span className="w-px flex-1 my-1 bg-gradient-to-b from-[oklch(0.72_0.18_145)] to-destructive opacity-50" />
            <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_25%,transparent)]" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">De unde</div>
              <div className="text-sm font-semibold truncate leading-tight">{r.from}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Unde</div>
              <div className="text-sm font-semibold truncate leading-tight">{r.to}</div>
            </div>
          </div>
        </div>

        {/* Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.kg != null && <Chip icon={Package}>{r.kg}kg</Chip>}
          {r.people != null && <Chip icon={Users}>{r.people} Persoane</Chip>}
          <Chip icon={Calendar}>{r.date}</Chip>
          {r.approx && <Chip icon={Clock}>Dată și oră aproximativă</Chip>}
          {r.price && <Chip icon={Euro}>{r.price}</Chip>}
        </div>

        {/* Carrier */}
        {showCarrier && r.carrier && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Truck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Transportator</div>
              <div className="text-sm font-semibold truncate leading-tight">{r.carrier}</div>
            </div>
          </div>
        )}

        {/* Inactive note */}
        {r.status === "inactiva" && r.note && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{r.note}</p>
          </div>
        )}
        {r.status === "inactiva" && (
          <div className="mt-3 flex gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent transition">
              <Pencil className="h-3.5 w-3.5" /> Editează
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary text-primary bg-primary/5 px-3 py-2 text-xs font-semibold hover:bg-primary/10 transition">
              <RotateCw className="h-3.5 w-3.5" /> Repost
            </button>
          </div>
        )}
      </div>

      {/* CTA footer */}
      {showOpenCta && (
        <Link
          to="/comanda/$id"
          params={{ id: r.id }}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary-foreground transition",
            r.status === "anulata"
              ? "bg-destructive hover:opacity-90"
              : r.status === "finalizata"
              ? "bg-muted-foreground hover:opacity-90"
              : "bg-primary hover:opacity-90"
          )}
        >
          {r.status === "anulata"
            ? "Deschide comanda anulată"
            : r.status === "finalizata"
            ? "Deschide comanda finalizată"
            : r.tab === "transit"
            ? "Deschide comanda în tranzit"
            : "Deschide comanda"}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}

function EmptyState({ tab }: { tab: TabId }) {
  const msg: Record<TabId, string> = {
    posted: "Nu ai cereri în procesare.",
    accepted: "Nu aveți nicio cerere acceptată.",
    transit: "Nu ai curse în tranzit.",
    done: "Nu ai cereri finalizate.",
  };
  const Icon = TABS.find((t) => t.id === tab)!.icon;
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{msg[tab]}</p>
    </div>
  );
}
