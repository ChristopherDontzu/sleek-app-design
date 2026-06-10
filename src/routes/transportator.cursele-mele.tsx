import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { TopBar } from "@/components/customer/TopBar";
import { cn } from "@/lib/utils";
import {
  Tag, CheckCircle2, Truck, Flag, MapPin, Calendar, Package, Users,
  Navigation2, Phone, MessageSquare, ChevronDown, ChevronUp, User,
  Car, X, Check, ArrowRight, Eye, AlertTriangle, BadgeCheck, Clock,
} from "lucide-react";

type TabId = "cereri" | "acceptate" | "pe-drum" | "finalizate";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { id: "cereri",     label: "Cereri",     icon: Tag,          tint: "oklch(0.7 0.16 55)"  },
  { id: "acceptate",  label: "Acceptate",  icon: CheckCircle2, tint: "oklch(0.62 0.18 255)" },
  { id: "pe-drum",    label: "Pe drum",    icon: Truck,        tint: "oklch(0.7 0.18 145)"  },
  { id: "finalizate", label: "Finalizate", icon: Flag,         tint: "oklch(0.62 0.15 305)" },
];

type Job = {
  id: string;
  tab: TabId;
  kind: "colet" | "persoane" | "mixt";
  from: string; to: string;
  date: string; time?: string;
  kg?: number; people?: number; size?: string;
  clientPrice?: string; myOffer?: string;
  driver?: string; vehicle?: string;
  stage?: "preluare" | "tranzit" | "livrat";
  earned?: string;
  newBadge?: boolean;
};

const DATA: Job[] = [
  { id: "c1", tab: "cereri", kind: "colet", from: "Centrul Istoric", to: "300010", date: "07.06.2026", kg: 55, size: "Colet Mare", newBadge: true },
  { id: "c2", tab: "cereri", kind: "persoane", from: "Chișinău", to: "Bălți", date: "06.06.2026", people: 3, clientPrice: "~140 €" },
  { id: "c3", tab: "cereri", kind: "colet", from: "Chișinău", to: "Iași", date: "08.06.2026", kg: 12, size: "Colet Mediu" },

  { id: "a1", tab: "acceptate", kind: "colet",    from: "Chișinău",       to: "CZ-11000 Prague", date: "10.06.2026", kg: 80, size: "Colet Mare", myOffer: "EUR 220" },
  { id: "a2", tab: "acceptate", kind: "persoane", from: "Centrul Istoric", to: "300010",         date: "12.06.2026", people: 0, kg: 52, size: "Colet Mare", myOffer: "EUR 95" },

  { id: "t1", tab: "pe-drum", kind: "colet",    from: "Lyon",   to: "Chișinău", date: "25.05", time: "00:16", kg: 50, size: "Colet Mare",   driver: "Igor Aliosin", vehicle: "Mercedes Sprinter", stage: "tranzit" },
  { id: "t2", tab: "pe-drum", kind: "persoane", from: "Verona", to: "Chișinău", date: "25.05", time: "00:16", people: 3, kg: 20, size: "Colet Mediu", driver: "Igor Aliosin", vehicle: "Mercedes Sprinter", stage: "preluare" },

  { id: "f1", tab: "finalizate", kind: "colet",    from: "Castel S. P. Terme", to: "Bălți",   date: "19.05.2026", kg: 30, earned: "EUR 60",  driver: "Igor Aliosin", vehicle: "Mercedes Sprinter" },
  { id: "f2", tab: "finalizate", kind: "persoane", from: "Hamburg",            to: "Stăuceni", date: "11.05.2026", people: 3, earned: "EUR 320", driver: "Roman Arsenii", vehicle: "Ford Tranzit" },
];

const DRIVERS = [
  { id: "self",    name: "Eu sunt șoferul (Viorel Șofer)", connected: true,  active: true },
  { id: "vitalie", name: "Vitalie Pamfil",                  connected: false, active: false },
  { id: "roman",   name: "Roman Arsenii",                   connected: false, active: false },
  { id: "igor",    name: "Igor Aliosin",                    connected: true,  active: true },
  { id: "aliosa",  name: "Aliosa Mereni",                   connected: true,  active: true },
];
const VEHICLES = ["Mercedes Sprinter", "Ford Tranzit", "Volvo XC90"];

type Search = { tab?: TabId };

export const Route = createFileRoute("/transportator/cursele-mele")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const t = s.tab;
    if (t === "cereri" || t === "acceptate" || t === "pe-drum" || t === "finalizate") return { tab: t };
    return { tab: "cereri" };
  },
  head: () => ({
    meta: [
      { title: "Cursele mele — Transportator" },
      { name: "description", content: "Gestionează cereri, curse acceptate, pe drum și finalizate." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: TransporterJobsPage,
});

function TransporterJobsPage() {
  const { tab = "cereri" } = useSearch({ from: "/transportator/cursele-mele" });
  const navigate = useNavigate();
  const items = useMemo(() => DATA.filter((j) => j.tab === tab), [tab]);
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <ThemeProvider>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-background pb-28">
        <TopBar />
        <div className="pt-[72px]" />

        <div className="px-4">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight">Cursele mele</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestionează toate cursele tale într-un singur loc.</p>
          </div>
        </div>

        {/* Big segmented tabs with counts */}
        <div className="mt-4 px-3 sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-2 pt-1">
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => {
                const Icon = t.icon;
                const count = DATA.filter((d) => d.tab === t.id).length;
                const isActive = t.id === tab;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate({ to: "/transportator/cursele-mele", search: { tab: t.id } })}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-2 rounded-full px-4 h-11 text-sm font-semibold border transition",
                      isActive
                        ? "text-white border-transparent shadow-[var(--shadow-card)]"
                        : "bg-card text-foreground border-border"
                    )}
                    style={isActive ? { backgroundColor: t.tint } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                    <span className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                      isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                    )}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 px-3">
          <div className="mx-auto max-w-2xl space-y-3">
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Nimic în „{active.label}".
              </div>
            )}
            {tab === "cereri"     && items.map((j) => <CereriCard     key={j.id} j={j} />)}
            {tab === "acceptate"  && items.map((j) => <AcceptateCard  key={j.id} j={j} />)}
            {tab === "pe-drum"    && items.map((j) => <PeDrumCard     key={j.id} j={j} />)}
            {tab === "finalizate" && items.map((j) => <FinalizateCard key={j.id} j={j} />)}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

/* ──────────────── Shared bits ──────────────── */

function KindBadge({ kind }: { kind: Job["kind"] }) {
  const map = {
    colet:    { label: "Colet",    Icon: Package, tint: "oklch(0.7 0.16 55)" },
    persoane: { label: "Persoane", Icon: Users,   tint: "oklch(0.7 0.18 145)" },
    mixt:     { label: "Mixt",     Icon: Truck,   tint: "oklch(0.62 0.18 255)" },
  } as const;
  const m = map[kind];
  const I = m.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: m.tint }}>
      <I className="h-3 w-3" /> {m.label}
    </span>
  );
}

function Route2({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-stretch gap-3 mt-3">
      <div className="flex flex-col items-center pt-1.5 pb-1">
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_145)] shadow-[0_0_0_3px_color-mix(in_oklab,oklch(0.72_0.18_145)_25%,transparent)]" />
        <span className="w-px flex-1 my-1 bg-gradient-to-b from-[oklch(0.72_0.18_145)] to-destructive opacity-50" />
        <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_25%,transparent)]" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Preluare</div>
          <div className="text-[15px] font-semibold leading-tight truncate">{from}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Destinație</div>
          <div className="text-[15px] font-semibold leading-tight truncate">{to}</div>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}

/* ──────────────── 1. CERERI (new incoming) ──────────────── */
function CereriCard({ j }: { j: Job }) {
  return (
    <article className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <KindBadge kind={j.kind} />
          {j.newBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
              <BadgeCheck className="h-3 w-3" /> Nou
            </span>
          )}
        </div>
        <Route2 from={j.from} to={j.to} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip icon={Calendar}>{j.date}</Chip>
          {j.kg != null && <Chip icon={Package}>{j.kg} KG</Chip>}
          {j.people != null && <Chip icon={Users}>{j.people} pers</Chip>}
          {j.size && <Chip icon={Tag}>{j.size}</Chip>}
        </div>
        {j.clientPrice && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Preț client: </span>
            <span className="font-bold text-[oklch(0.65_0.18_145)]">{j.clientPrice}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 border-t border-border divide-x divide-border">
        <button className="h-14 inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground active:bg-muted">
          <Eye className="h-4 w-4" /> Detalii
        </button>
        <button className="h-14 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-primary active:opacity-90">
          Trimite preț <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

/* ──────────────── 2. ACCEPTATE (assign driver + vehicle) ──────────────── */
function AcceptateCard({ j }: { j: Job }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"driver" | "vehicle" | "confirm">("driver");
  const [driver, setDriver] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<string | null>(null);

  const reset = () => { setStep("driver"); setDriver(null); setVehicle(null); setOpen(false); };

  return (
    <article className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <KindBadge kind={j.kind} />
          {j.myOffer && (
            <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-2.5 py-1 text-[11px] font-bold">
              Oferta ta: {j.myOffer}
            </span>
          )}
        </div>
        <Route2 from={j.from} to={j.to} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip icon={Calendar}>{j.date}</Chip>
          {j.kg != null && <Chip icon={Package}>{j.kg} KG</Chip>}
          {j.size && <Chip icon={Tag}>{j.size}</Chip>}
        </div>
      </div>

      {/* Big single assignment CTA */}
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-4 border-t border-border bg-gradient-to-r from-primary to-[oklch(0.62_0.2_270)] text-white font-bold text-base inline-flex items-center justify-center gap-2 active:opacity-90"
      >
        <Truck className="h-5 w-5" />
        Atribuie șofer & vehicul
      </button>
      <button className="w-full h-12 border-t border-border text-destructive text-sm font-semibold active:bg-destructive/5">
        Anulează comanda
      </button>

      {/* Inline bottom sheet — designed for thumb use */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={reset}>
          <div
            className="w-full max-w-2xl rounded-t-3xl bg-card border-t border-x border-border shadow-2xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {(["driver", "vehicle", "confirm"] as const).map((s, i) => (
                  <div key={s} className={cn(
                    "h-2 w-8 rounded-full transition",
                    (step === s || (step === "vehicle" && i < 1) || (step === "confirm" && i < 2))
                      ? "bg-primary" : "bg-muted"
                  )} />
                ))}
              </div>
              <button onClick={reset} className="h-9 w-9 rounded-full bg-muted inline-flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "driver" && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-1">Alege șoferul</h3>
                <p className="text-xs text-muted-foreground mb-3">Apasă pe un șofer ca să-l atribui</p>
                <div className="space-y-2">
                  {DRIVERS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setDriver(d.name); setStep("vehicle"); }}
                      className={cn(
                        "w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-3 active:scale-[0.99] transition",
                        driver === d.name ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{d.name}</div>
                        <div className="mt-1.5 flex gap-1.5">
                          {d.connected && <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[oklch(0.92_0.12_145)] text-[oklch(0.38_0.12_150)]">Conectat</span>}
                          {d.active    && <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[oklch(0.92_0.12_145)] text-[oklch(0.38_0.12_150)]">Activ</span>}
                          {!d.connected && !d.active && <span className="text-[10px] text-muted-foreground">Offline</span>}
                        </div>
                      </div>
                      <ChevronUp className="h-5 w-5 -rotate-90 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "vehicle" && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-1">Alege vehiculul</h3>
                <p className="text-xs text-muted-foreground mb-3">Șofer: <span className="text-foreground font-semibold">{driver}</span></p>
                <div className="space-y-2">
                  {VEHICLES.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setVehicle(v); setStep("confirm"); }}
                      className={cn(
                        "w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-3 active:scale-[0.99]",
                        vehicle === v ? "border-primary bg-primary/5" : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-full bg-muted inline-flex items-center justify-center">
                          <Car className="h-5 w-5" />
                        </span>
                        <span className="font-semibold">{v}</span>
                      </div>
                      <ChevronUp className="h-5 w-5 -rotate-90 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep("driver")} className="mt-3 w-full h-11 rounded-full border border-border text-sm font-semibold">
                  ← Înapoi la șofer
                </button>
              </div>
            )}

            {step === "confirm" && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-3">Confirmă atribuirea</h3>
                <div className="rounded-2xl bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cursă</span><span className="font-semibold truncate ml-2">{j.from} → {j.to}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Șofer</span><span className="font-semibold">{driver}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicul</span><span className="font-semibold">{vehicle}</span></div>
                </div>
                <button onClick={reset} className="mt-4 w-full h-14 rounded-2xl bg-[oklch(0.65_0.2_145)] text-white font-bold text-base inline-flex items-center justify-center gap-2 active:opacity-90">
                  <Check className="h-5 w-5" /> Trimite „În tranzit"
                </button>
                <button onClick={() => setStep("vehicle")} className="mt-2 w-full h-11 rounded-full border border-border text-sm font-semibold">
                  ← Schimbă vehicul
                </button>
              </div>
            )}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}
    </article>
  );
}

/* ──────────────── 3. PE DRUM (collapsible, big touch targets) ──────────────── */
function PeDrumCard({ j }: { j: Job }) {
  const [open, setOpen] = useState(false);
  const stages = ["preluare", "tranzit", "livrat"] as const;
  const stageIdx = stages.indexOf(j.stage || "tranzit");
  const stageLabels = { preluare: "La preluare", tranzit: "În tranzit", livrat: "Livrat" } as const;

  return (
    <article className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {/* Compact header — tap to expand */}
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 active:bg-muted/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.92_0.12_145)] text-[oklch(0.38_0.12_150)] px-2.5 py-1 text-[11px] font-bold">
              <Truck className="h-3 w-3" /> {stageLabels[j.stage || "tranzit"]}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{j.date}{j.time ? ` • ${j.time}` : ""}</span>
          </div>
          {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="mt-2 text-base font-bold truncate">{j.from} → {j.to}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" /> {j.driver} • {j.vehicle}
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/20">
          {/* Stage stepper */}
          <div>
            <div className="flex items-center gap-1">
              {stages.map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-1">
                  <div className={cn(
                    "h-2 flex-1 rounded-full",
                    i <= stageIdx ? "bg-[oklch(0.65_0.2_145)]" : "bg-muted"
                  )} />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-muted-foreground uppercase">
              <span className={cn(stageIdx >= 0 && "text-foreground")}>Preluare</span>
              <span className={cn(stageIdx >= 1 && "text-foreground")}>Tranzit</span>
              <span className={cn(stageIdx >= 2 && "text-foreground")}>Livrat</span>
            </div>
          </div>

          {/* Cargo info */}
          <div className="flex flex-wrap gap-1.5">
            {j.kg != null && <Chip icon={Package}>{j.kg} KG</Chip>}
            {j.people != null && j.people > 0 && <Chip icon={Users}>{j.people} pers</Chip>}
            {j.size && <Chip icon={Tag}>{j.size}</Chip>}
          </div>

          {/* 3 BIG action tiles — easy thumb tap */}
          <div className="grid grid-cols-3 gap-2">
            <ActionTile icon={Navigation2}    label="Navigare" tone="info" />
            <ActionTile icon={Phone}          label="Telefon"  tone="info" />
            <ActionTile icon={MessageSquare}  label="Mesaj"    tone="info" />
          </div>

          {/* Status advance button */}
          {stageIdx < 2 && (
            <button className="w-full h-14 rounded-2xl bg-[oklch(0.65_0.2_145)] text-white font-bold inline-flex items-center justify-center gap-2 active:opacity-90">
              <Check className="h-5 w-5" /> Marchează „{stages[stageIdx + 1] === "tranzit" ? "În tranzit" : "Livrat"}"
            </button>
          )}

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link to="/comanda/$id" params={{ id: j.id }}
                  className="h-11 rounded-full border border-border text-sm font-semibold inline-flex items-center justify-center gap-1.5">
              <Eye className="h-4 w-4" /> Vezi comanda
            </Link>
            <button className="h-11 rounded-full border border-border text-sm font-semibold text-muted-foreground inline-flex items-center justify-center gap-1.5">
              Schimbă șofer
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionTile({ icon: Icon, label, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; tone: "info" | "primary" }) {
  const cls = tone === "info"
    ? "bg-[oklch(0.55_0.13_220)] text-white"
    : "bg-primary text-primary-foreground";
  return (
    <button className={cn("h-20 rounded-2xl flex flex-col items-center justify-center gap-1 font-semibold text-sm active:scale-95 transition", cls)}>
      <Icon className="h-6 w-6" />
      {label}
    </button>
  );
}

/* ──────────────── 4. FINALIZATE (clean summary) ──────────────── */
function FinalizateCard({ j }: { j: Job }) {
  return (
    <article className="rounded-3xl bg-card border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <KindBadge kind={j.kind} />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Finalizată</span>
          </div>
          <div className="mt-3 text-[15px] font-bold truncate">{j.from} → {j.to}</div>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> {j.date}
            {j.driver && <> • <User className="h-3 w-3" /> {j.driver}</>}
          </div>
        </div>
        {j.earned && (
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Câștigat</div>
            <div className="text-lg font-extrabold text-[oklch(0.65_0.18_145)]">{j.earned}</div>
          </div>
        )}
      </div>
      <Link to="/comanda/$id" params={{ id: j.id }}
            className="mt-3 w-full h-11 rounded-full bg-muted text-sm font-semibold inline-flex items-center justify-center gap-1.5 active:opacity-80">
        <Eye className="h-4 w-4" /> Vezi comanda
      </Link>
    </article>
  );
}
