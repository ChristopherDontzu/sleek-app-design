import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { TopBar } from "@/components/customer/TopBar";
import { cn } from "@/lib/utils";
import {
  Inbox, Hourglass, Package, Users, Calendar, Tag, MapPin,
  Trash2, Send, Eye, Clock, ChevronRight, BadgeCheck, RotateCw,
} from "lucide-react";

type TabId = "primite" | "asteptare";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { id: "primite",   label: "Primite",      icon: Inbox,    tint: "oklch(0.62 0.18 255)" },
  { id: "asteptare", label: "În așteptare", icon: Hourglass, tint: "oklch(0.7 0.16 55)"  },
];

type Req = {
  id: string;
  tab: TabId;
  kind: "colet" | "persoane";
  title: string;
  from: string; to: string;
  date: string;
  kg?: number; people?: number; size?: string;
  route?: string;
  note?: string;
  client: string;
  clientPrice?: string;
  myOffer?: string;
  arrival?: string;
  posted: string;
  waiting?: string;
  isNew?: boolean;
};

const DATA: Req[] = [
  { id: "r1", tab: "primite",  kind: "persoane", title: "3 persoane", from: "Chisinau", to: "Balti", date: "06.06.2026", people: 3, route: "Pickup + delivery", client: "robert", clientPrice: "~140 €", posted: "acum", isNew: true },
  { id: "r2", tab: "primite",  kind: "colet",    title: "Doar colet · Centrul Istoric · 300010", from: "Centrul Istoric", to: "300010", date: "07.06.2026", kg: 55, size: "Colet Mare", route: "Pickup + tranzit", client: "Maria", posted: "acum 2h", isNew: true, note: "Negociabil" },
  { id: "r3", tab: "primite",  kind: "colet",    title: "Doar colet", from: "Chișinău", to: "Iași", date: "08.06.2026", kg: 12, size: "Colet Mediu", client: "Andrei", posted: "acum 5h" },

  { id: "w1", tab: "asteptare", kind: "colet", title: "Doar colet · Chisinau · CZ-11000 Prague", from: "Chisinau", to: "CZ-11000 Prague", date: "07.06.2026", kg: 75, size: "Colet Mare", route: "Pickup + tranzit", client: "Robert", myOffer: "EUR 20", arrival: "marți 16 iunie, dimineața (06:00–11:00)", posted: "acum 2 zile", waiting: "0h" },
  { id: "w2", tab: "asteptare", kind: "persoane", title: "2 persoane", from: "București", to: "Berlin", date: "15.06.2026", people: 2, route: "Pickup + delivery", client: "Ana", myOffer: "EUR 320", arrival: "miercuri 17 iunie, seara", posted: "acum 6h", waiting: "6h" },
];

type Search = { tab?: TabId };

export const Route = createFileRoute("/transportator/cereri")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const t = s.tab;
    if (t === "primite" || t === "asteptare") return { tab: t };
    return { tab: "primite" };
  },
  head: () => ({
    meta: [
      { title: "Cereri — Transportator" },
      { name: "description", content: "Cereri primite și oferte trimise care așteaptă răspuns." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: TransporterRequestsPage,
});

function TransporterRequestsPage() {
  const { tab = "primite" } = useSearch({ from: "/transportator/cereri" });
  const navigate = useNavigate();
  const items = useMemo(() => DATA.filter((r) => r.tab === tab), [tab]);

  return (
    <ThemeProvider>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-background pb-28">
        <TopBar />
        <div className="pt-[72px]" />

        <div className="px-4">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight">Cereri</h1>
            <p className="text-sm text-muted-foreground mt-1">Cererile clienților și ofertele tale.</p>
          </div>
        </div>

        <div className="mt-4 px-3 sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-2 pt-1">
          <div className="mx-auto max-w-2xl flex gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const count = DATA.filter((d) => d.tab === t.id).length;
              const isActive = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate({ to: "/transportator/cereri", search: { tab: t.id } })}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 h-12 text-sm font-bold border transition",
                    isActive ? "text-white border-transparent shadow-[var(--shadow-card)]" : "bg-card text-foreground border-border"
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

        <div className="mt-3 px-3">
          <div className="mx-auto max-w-2xl space-y-3">
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Nimic aici.
              </div>
            )}
            {tab === "primite"   && items.map((r) => <PrimiteCard   key={r.id} r={r} />)}
            {tab === "asteptare" && items.map((r) => <AsteptareCard key={r.id} r={r} />)}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

function KindBadge({ kind }: { kind: Req["kind"] }) {
  const m = kind === "colet"
    ? { label: "Colet", Icon: Package, tint: "oklch(0.7 0.16 55)" }
    : { label: "Persoane", Icon: Users, tint: "oklch(0.7 0.18 145)" };
  const I = m.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: m.tint }}>
      <I className="h-3 w-3" /> {m.label}
    </span>
  );
}

function Route2({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-stretch gap-3">
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

/* ──────────────── PRIMITE — new requests to bid on ──────────────── */
function PrimiteCard({ r }: { r: Req }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");

  return (
    <article className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {/* Top section: essence at a glance */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KindBadge kind={r.kind} />
            {r.isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                <BadgeCheck className="h-3 w-3" /> Nou
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {r.posted}
          </span>
        </div>

        <div className="mt-3">
          <Route2 from={r.from} to={r.to} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip icon={Calendar}>{r.date}</Chip>
          {r.kg != null && <Chip icon={Package}>{r.kg} KG</Chip>}
          {r.people != null && <Chip icon={Users}>{r.people} pers</Chip>}
          {r.size && <Chip icon={Tag}>{r.size}</Chip>}
          {r.route && <Chip icon={MapPin}>{r.route}</Chip>}
        </div>

        {(r.clientPrice || r.note) && (
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Client: </span>
              <span className="font-semibold">{r.client}</span>
            </div>
            {r.clientPrice && (
              <span className="rounded-full bg-[oklch(0.92_0.12_145)] text-[oklch(0.38_0.12_150)] px-2.5 py-1 text-[12px] font-bold">
                {r.clientPrice}
              </span>
            )}
            {!r.clientPrice && r.note && (
              <span className="text-[oklch(0.65_0.18_145)] font-bold text-sm">{r.note}</span>
            )}
          </div>
        )}
      </div>

      {/* Action footer */}
      {!open ? (
        <div className="grid grid-cols-2 border-t border-border divide-x divide-border">
          <button onClick={() => setOpen(true)} className="h-14 inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground active:bg-muted">
            <Eye className="h-4 w-4" /> Detalii
          </button>
          <button onClick={() => setOpen(true)} className="h-14 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-primary active:opacity-90">
            <Send className="h-4 w-4" /> Trimite preț
          </button>
        </div>
      ) : (
        <div className="border-t border-border p-4 bg-muted/30 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Oferta ta (EUR)</label>
            <input
              autoFocus
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="ex. 120"
              className="mt-1 w-full h-14 rounded-2xl border border-border bg-background px-4 text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            placeholder="Mesaj pentru client (opțional)"
            rows={2}
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setOpen(false)} className="h-12 rounded-full border border-border text-sm font-semibold">
              Anulează
            </button>
            <button onClick={() => setOpen(false)} disabled={!price} className="h-12 rounded-full bg-primary text-white font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-90">
              <Send className="h-4 w-4" /> Trimite oferta
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ──────────────── ASTEPTARE — offer sent, awaiting client ──────────────── */
function AsteptareCard({ r }: { r: Req }) {
  return (
    <article className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {/* Status banner */}
      <div className="px-4 py-2.5 bg-[oklch(0.95_0.08_70)] dark:bg-[oklch(0.3_0.06_70)] border-b border-border flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[oklch(0.45_0.15_55)] dark:text-[oklch(0.85_0.12_70)]">
          <Hourglass className="h-3.5 w-3.5" /> În așteptare răspuns client
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{r.waiting} în așteptare</span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <KindBadge kind={r.kind} />
          <span className="text-[11px] text-muted-foreground">Postat {r.posted}</span>
        </div>

        <div className="mt-3">
          <Route2 from={r.from} to={r.to} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip icon={Calendar}>{r.date}</Chip>
          {r.kg != null && <Chip icon={Package}>{r.kg} KG</Chip>}
          {r.people != null && <Chip icon={Users}>{r.people} pers</Chip>}
          {r.size && <Chip icon={Tag}>{r.size}</Chip>}
        </div>

        {/* Offer block — clearly highlighted */}
        <div className="mt-4 rounded-2xl border-2 border-primary/40 bg-primary/5 p-3">
          <div className="text-[10px] uppercase tracking-wider font-bold text-primary">Oferta ta</div>
          <div className="mt-0.5 text-2xl font-extrabold text-primary tabular-nums">{r.myOffer}</div>
          {r.arrival && (
            <div className="mt-1.5 text-xs text-muted-foreground leading-snug">
              <span className="font-semibold text-foreground">Sosire:</span> {r.arrival}
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Client: <span className="font-semibold text-foreground">{r.client}</span>
        </div>
      </div>

      {/* Single primary action + ghost destructive */}
      <div className="grid grid-cols-[1fr_auto] border-t border-border divide-x divide-border">
        <button className="h-14 inline-flex items-center justify-center gap-2 text-sm font-bold text-primary active:bg-primary/10">
          <RotateCw className="h-4 w-4" /> Modifică oferta
        </button>
        <button className="h-14 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-destructive active:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Șterge
        </button>
      </div>
    </article>
  );
}
