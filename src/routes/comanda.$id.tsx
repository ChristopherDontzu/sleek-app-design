import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import {
  ArrowLeft,
  MessageCircle,
  Navigation,
  Phone,
  Truck,
  User,
  Package,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Star,
  Info,
  XCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Hash,
} from "lucide-react";

export const Route = createFileRoute("/comanda/$id")({
  head: () => ({
    meta: [
      { title: "Detalii rezervare — Moldingo" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <ComandaPage />
    </ThemeProvider>
  ),
});

// ---------- Demo data ----------
// In real life this comes from Firestore. Here we expose stage controls
// at the bottom so the user can preview every state of the "document".
type Stage =
  | "posted" // cererea proaspăt postată — așteaptă oferte
  | "offers" // au venit oferte de la transportatori
  | "accepted" // s-a acceptat o ofertă → e comandă
  | "driver" // transportatorul a asignat șoferul
  | "transit" // în tranzit
  | "done" // finalizată
  | "cancelled" // anulată
  | "dispute"; // dispută

type EventKind =
  | "posted"
  | "offer"
  | "accepted"
  | "driver"
  | "pickup"
  | "transit"
  | "delivered"
  | "rated"
  | "cancelled"
  | "dispute";

interface TimelineEvent {
  kind: EventKind;
  title: string;
  sub?: string;
  at: string;
}

function ComandaPage() {
  const [stage, setStage] = useState<Stage>("transit");

  const data = {
    id: "MLD-204871",
    from: { city: "Verona", country: "Italia" },
    to: { city: "Chișinău", country: "Moldova" },
    pickupAddress: "Verona, Veneto, Italia",
    deliveryAddress: "Chișinău, Municipiul Chișinău, Moldova",
    pickupDate: "luni, 25 mai 2026",
    deliveryDate: "marți, 9 iunie · 11:00–17:00",
    cargo: "Colet mediu · 20 kg",
    total: 400,
    currency: "EUR",
    offersCount: 4,
    transporter: {
      name: "Viorel Trans",
      rating: 4.9,
      trips: 312,
      driver: "Igor Aliosin",
      phones: ["+37369993968", "+37360606394"],
      vehicle: "Mercedes Sprinter",
      plate: "MD 1234 AB",
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <StatusHero stage={stage} data={data} />

        <Timeline stage={stage} data={data} />

        {(stage === "offers" || stage === "posted") && (
          <OffersCard count={data.offersCount} stage={stage} />
        )}

        {(stage === "accepted" ||
          stage === "driver" ||
          stage === "transit" ||
          stage === "done" ||
          stage === "dispute") && (
          <TransporterCard
            t={data.transporter}
            showDriver={stage !== "accepted"}
            stage={stage}
          />
        )}

        {(stage === "transit" || stage === "done") && (
          <TrackingCard stage={stage} />
        )}

        <DetailsCard data={data} />

        <TotalCard total={data.total} currency={data.currency} stage={stage} />

        <ActionsBlock stage={stage} />

        {/* Demo control — remove when wired to live data */}
        <StageDemoPicker stage={stage} setStage={setStage} />
      </div>
    </main>
  );
}

// ---------- Header ----------
function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer transition active:scale-95"
          aria-label="Înapoi"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-[17px] font-semibold tracking-tight">
            Detalii rezervare
          </div>
        </div>
        <button
          className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition active:scale-95 text-primary"
          style={{
            background: "color-mix(in oklab, var(--primary) 12%, transparent)",
          }}
          aria-label="Mesaje"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

// ---------- Status Hero ----------
const STATUS: Record<
  Stage,
  { label: string; tone: "info" | "success" | "warning" | "danger"; icon: typeof Clock }
> = {
  posted: { label: "Postată — așteaptă oferte", tone: "info", icon: Clock },
  offers: { label: "Oferte primite", tone: "info", icon: Sparkles },
  accepted: { label: "Ofertă acceptată", tone: "success", icon: CheckCircle2 },
  driver: { label: "Șofer asignat", tone: "success", icon: ShieldCheck },
  transit: { label: "Activă · în tranzit", tone: "success", icon: Navigation },
  done: { label: "Finalizată", tone: "success", icon: CheckCircle2 },
  cancelled: { label: "Anulată", tone: "danger", icon: XCircle },
  dispute: { label: "Dispută", tone: "warning", icon: AlertCircle },
};

function toneClasses(tone: "info" | "success" | "warning" | "danger") {
  switch (tone) {
    case "success":
      return "bg-[oklch(0.72_0.18_145/.15)] text-[oklch(0.42_0.18_145)]";
    case "warning":
      return "bg-accent/20 text-accent-foreground";
    case "danger":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-primary/12 text-primary";
  }
}

function StatusHero({
  stage,
  data,
}: {
  stage: Stage;
  data: { id: string; from: { city: string; country: string }; to: { city: string; country: string } };
}) {
  const s = STATUS[stage];
  const Icon = s.icon;
  return (
    <section className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] p-5 overflow-hidden relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${toneClasses(s.tone)}`}
        >
          <Icon className="h-3.5 w-3.5" /> {s.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Hash className="h-3 w-3" /> {data.id}
        </span>
      </div>

      <h1 className="text-[26px] font-bold tracking-tight leading-tight">
        {data.from.city} <span className="text-muted-foreground font-medium">spre</span>{" "}
        {data.to.city}
      </h1>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent)]" />
            <div className="text-[15px] font-semibold truncate">{data.from.city}</div>
          </div>
          <div className="text-xs text-muted-foreground ml-4.5 pl-0.5">{data.from.country}</div>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_25%,transparent)]" />
            <div className="text-[15px] font-semibold truncate">{data.to.city}</div>
          </div>
          <div className="text-xs text-muted-foreground ml-4.5 pl-0.5">{data.to.country}</div>
        </div>
      </div>
    </section>
  );
}

// ---------- Timeline ----------
function buildTimeline(stage: Stage): TimelineEvent[] {
  const ev: TimelineEvent[] = [
    { kind: "posted", title: "Cererea a fost postată", sub: "Clientul a creat cererea de transport", at: "Lun, 18 mai · 14:22" },
  ];
  if (["offers", "accepted", "driver", "transit", "done", "dispute"].includes(stage)) {
    ev.push({ kind: "offer", title: "Au venit oferte de la transportatori", sub: "4 transportatori au răspuns", at: "Lun, 18 mai · 16:08" });
  }
  if (["accepted", "driver", "transit", "done", "dispute"].includes(stage)) {
    ev.push({ kind: "accepted", title: "Ofertă acceptată", sub: "Viorel Trans · 400 EUR", at: "Mar, 19 mai · 09:14" });
  }
  if (["driver", "transit", "done", "dispute"].includes(stage)) {
    ev.push({ kind: "driver", title: "Șofer asignat", sub: "Igor Aliosin · Mercedes Sprinter", at: "Mar, 19 mai · 11:40" });
  }
  if (["transit", "done", "dispute"].includes(stage)) {
    ev.push({ kind: "pickup", title: "Coletul a fost preluat", sub: "Verona, Veneto, Italia", at: "Lun, 25 mai · 09:02" });
    ev.push({ kind: "transit", title: "În tranzit spre destinație", sub: "Tracking GPS activ", at: "Lun, 25 mai · 09:30" });
  }
  if (stage === "done") {
    ev.push({ kind: "delivered", title: "Livrat la destinație", sub: "Chișinău, Moldova", at: "Mar, 9 iun · 14:18" });
    ev.push({ kind: "rated", title: "Tu ai evaluat transportatorul", sub: "5 stele", at: "Mar, 9 iun · 15:02" });
  }
  if (stage === "cancelled") {
    ev.push({ kind: "cancelled", title: "Rezervarea a fost anulată", sub: "Anulată de client înainte de preluare", at: "Mie, 20 mai · 10:11" });
  }
  if (stage === "dispute") {
    ev.push({ kind: "dispute", title: "Dispută deschisă", sub: "Așteaptă revizuirea echipei Moldingo", at: "Mar, 9 iun · 18:44" });
  }
  return ev;
}

const EVENT_META: Record<EventKind, { icon: typeof Clock; tone: "info" | "success" | "warning" | "danger" }> = {
  posted: { icon: Sparkles, tone: "info" },
  offer: { icon: Sparkles, tone: "info" },
  accepted: { icon: CheckCircle2, tone: "success" },
  driver: { icon: ShieldCheck, tone: "success" },
  pickup: { icon: Package, tone: "info" },
  transit: { icon: Navigation, tone: "success" },
  delivered: { icon: CheckCircle2, tone: "success" },
  rated: { icon: Star, tone: "success" },
  cancelled: { icon: XCircle, tone: "danger" },
  dispute: { icon: AlertCircle, tone: "warning" },
};

function Timeline({ stage, data: _data }: { stage: Stage; data: unknown }) {
  void _data;
  const events = buildTimeline(stage);
  return (
    <section className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] p-5">
      <SectionTitle icon={Clock} title="Istoricul rezervării" hint={`${events.length} etape`} />
      <ol className="mt-4 space-y-0.5">
        {events.map((e, i) => {
          const meta = EVENT_META[e.kind];
          const EIcon = meta.icon;
          const last = i === events.length - 1;
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${toneClasses(meta.tone)} ${last ? "ring-2 ring-offset-2 ring-offset-card ring-primary/40" : ""}`}
                >
                  <EIcon className="h-4 w-4" />
                </div>
                {i < events.length - 1 && (
                  <div className="w-px flex-1 my-1 bg-border" style={{ minHeight: 18 }} />
                )}
              </div>
              <div className={`flex-1 min-w-0 ${i < events.length - 1 ? "pb-4" : "pb-1"}`}>
                <div className="text-[14px] font-semibold leading-tight">{e.title}</div>
                {e.sub && <div className="text-xs text-muted-foreground mt-0.5">{e.sub}</div>}
                <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">{e.at}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------- Offers (when no acceptance yet) ----------
function OffersCard({ count, stage }: { count: number; stage: Stage }) {
  const isPosted = stage === "posted";
  return (
    <section
      className="rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-elegant)] relative overflow-hidden"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
          {isPosted ? <Clock className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] opacity-80 font-semibold">
            {isPosted ? "Cererea ta e live" : "Oferte primite"}
          </div>
          <div className="text-[17px] font-bold mt-0.5">
            {isPosted
              ? "Așteptăm răspuns de la șoferi"
              : `${count} oferte disponibile`}
          </div>
        </div>
        {!isPosted && (
          <button className="rounded-full bg-white text-primary text-xs font-semibold px-4 py-2 cursor-pointer hover:opacity-95 active:scale-95 transition shadow">
            Vezi
          </button>
        )}
      </div>
    </section>
  );
}

// ---------- Transporter card ----------
function TransporterCard({
  t,
  showDriver,
  stage,
}: {
  t: {
    name: string;
    rating: number;
    trips: number;
    driver: string;
    phones: string[];
    vehicle: string;
    plate: string;
  };
  showDriver: boolean;
  stage: Stage;
}) {
  return (
    <section className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] p-5">
      <SectionTitle icon={Truck} title="Transportator" hint="Confirmat" hintTone="success" />

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          {t.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold truncate">{t.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-0.5 text-foreground font-medium">
              <Star className="h-3 w-3 fill-accent text-accent" /> {t.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{t.trips} curse</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses("success")}`}
        >
          <ShieldCheck className="h-3 w-3" /> Verificat
        </span>
      </div>

      {showDriver && (
        <>
          <div className="my-4 h-px bg-border" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="Șofer" value={t.driver} />
            <Field label="Vehicul" value={t.vehicle} />
            <Field label="Număr înmatriculare" value={t.plate} mono />
            <Field label="Telefon" value={t.phones[0]} mono />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={`tel:${t.phones[0]}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold cursor-pointer hover:bg-muted transition active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" /> Sună șoferul
            </a>
            <button
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold cursor-pointer hover:opacity-95 transition active:scale-[0.98] text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <MessageCircle className="h-4 w-4" /> Mesaj
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <button className="mt-4 w-full rounded-xl border-2 border-primary/40 bg-primary/5 py-2.5 text-sm font-semibold text-primary cursor-pointer hover:bg-primary/10 active:scale-[0.99] transition flex items-center justify-center gap-2">
          <Star className="h-4 w-4" /> Evaluează transportatorul
        </button>
      )}
    </section>
  );
}

// ---------- Tracking card ----------
function TrackingCard({ stage }: { stage: Stage }) {
  const inTransit = stage === "transit";
  return (
    <section className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] p-5">
      <SectionTitle icon={Navigation} title="Tracking transport" />

      <div className="mt-3 relative h-28 rounded-2xl overflow-hidden bg-muted">
        {/* abstract map decoration */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, color-mix(in oklab, var(--primary) 25%, transparent) 0%, transparent 35%), radial-gradient(circle at 75% 30%, color-mix(in oklab, var(--accent) 30%, transparent) 0%, transparent 40%)",
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
          <path
            d="M 30 90 Q 120 30, 220 60 T 380 30"
            stroke="var(--primary)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="6 6"
            opacity="0.7"
          />
          <circle cx="30" cy="90" r="6" fill="var(--primary)" />
          <circle cx="380" cy="30" r="6" fill="var(--accent)" />
          {inTransit && (
            <circle cx="220" cy="60" r="6" fill="white" stroke="var(--primary)" strokeWidth="3">
              <animate attributeName="r" values="6;10;6" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {inTransit ? "Transportul vine spre locația ta" : "Livrat la destinație"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Ultima actualizare: acum 12 min
          </div>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-primary/15 transition">
          <Navigation className="h-3.5 w-3.5" /> Hartă
        </button>
      </div>
    </section>
  );
}

// ---------- Details ----------
function DetailsCard({
  data,
}: {
  data: {
    pickupAddress: string;
    deliveryAddress: string;
    pickupDate: string;
    deliveryDate: string;
    cargo: string;
  };
}) {
  return (
    <section className="rounded-3xl bg-card border border-border shadow-[var(--shadow-card)] p-5">
      <SectionTitle icon={Info} title="Detalii rezervare" />
      <div className="mt-4 space-y-4">
        <Row icon={Calendar} label="Data preluării" value={data.pickupDate} />
        <Row icon={Calendar} label="Data livrării" value={data.deliveryDate} />
        <Row icon={MapPin} label="Adresa de preluare" value={data.pickupAddress} />
        <Row icon={MapPin} label="Adresa de livrare" value={data.deliveryAddress} />
        <Row icon={Package} label="Încărcătură" value={data.cargo} />
      </div>
    </section>
  );
}

// ---------- Total ----------
function TotalCard({
  total,
  currency,
  stage,
}: {
  total: number;
  currency: string;
  stage: Stage;
}) {
  const paid = stage === "done";
  return (
    <section
      className="rounded-3xl p-5 relative overflow-hidden text-primary-foreground shadow-[var(--shadow-elegant)]"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] opacity-80 font-semibold flex items-center gap-1.5">
            <CreditCard className="h-3 w-3" /> Total {paid ? "achitat" : "de plată"}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums">{total}</span>
            <span className="text-sm opacity-90">{currency}</span>
          </div>
        </div>
        {paid && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Achitat
          </span>
        )}
      </div>
    </section>
  );
}

// ---------- Actions ----------
function ActionsBlock({ stage }: { stage: Stage }) {
  if (stage === "posted" || stage === "offers") {
    return (
      <ActionRow
        tone="danger"
        icon={XCircle}
        title="Anulează cererea"
        sub="Cererea încă nu a fost acceptată — poți anula gratis."
      />
    );
  }
  if (stage === "accepted" || stage === "driver") {
    return (
      <ActionRow
        tone="danger"
        icon={XCircle}
        title="Anulează rezervarea"
        sub="Poți anula doar înainte ca transportul să înceapă."
      />
    );
  }
  if (stage === "transit") {
    return (
      <ActionRow
        tone="muted"
        icon={Info}
        title="Anulare indisponibilă"
        sub="Comanda a fost deja preluată și nu mai poate fi anulată. Folosește „Raportează problemă” după livrare."
      />
    );
  }
  if (stage === "done") {
    return (
      <ActionRow
        tone="warning"
        icon={AlertCircle}
        title="Raportează o problemă"
        sub="Ai 48 de ore după livrare pentru a deschide o dispută."
      />
    );
  }
  if (stage === "cancelled") {
    return (
      <ActionRow
        tone="muted"
        icon={Info}
        title="Rezervare anulată"
        sub="Această rezervare a fost anulată și e arhivată în istoric."
      />
    );
  }
  if (stage === "dispute") {
    return (
      <ActionRow
        tone="warning"
        icon={AlertCircle}
        title="Dispută în curs"
        sub="Echipa Moldingo te va contacta în maxim 24 de ore."
      />
    );
  }
  return null;
}

function ActionRow({
  tone,
  icon: Icon,
  title,
  sub,
}: {
  tone: "danger" | "warning" | "muted";
  icon: typeof Clock;
  title: string;
  sub: string;
}) {
  const ring =
    tone === "danger"
      ? "border-destructive/30 bg-destructive/5"
      : tone === "warning"
        ? "border-accent/40 bg-accent/10"
        : "border-border bg-muted/40";
  const iconBg =
    tone === "danger"
      ? "bg-destructive/15 text-destructive"
      : tone === "warning"
        ? "bg-accent/25 text-accent-foreground"
        : "bg-card text-muted-foreground";

  return (
    <button
      type="button"
      className={`w-full text-left rounded-2xl border ${ring} p-4 flex items-start gap-3 cursor-pointer hover:-translate-y-px transition active:translate-y-0`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sub}</div>
      </div>
    </button>
  );
}

// ---------- Building blocks ----------
function SectionTitle({
  icon: Icon,
  title,
  hint,
  hintTone,
}: {
  icon: typeof Clock;
  title: string;
  hint?: string;
  hintTone?: "success" | "info" | "warning" | "danger";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      </div>
      {hint && (
        <span
          className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
            hintTone ? toneClasses(hintTone) : "text-muted-foreground"
          }`}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </div>
        <div className="text-sm font-medium mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className={`text-sm font-semibold mt-0.5 truncate ${mono ? "tabular-nums" : ""}`}>
        {value}
      </div>
    </div>
  );
}

// ---------- Demo stage picker ----------
function StageDemoPicker({
  stage,
  setStage,
}: {
  stage: Stage;
  setStage: (s: Stage) => void;
}) {
  const stages: { id: Stage; label: string }[] = [
    { id: "posted", label: "Postată" },
    { id: "offers", label: "Oferte" },
    { id: "accepted", label: "Acceptată" },
    { id: "driver", label: "Șofer asignat" },
    { id: "transit", label: "În tranzit" },
    { id: "done", label: "Finalizată" },
    { id: "cancelled", label: "Anulată" },
    { id: "dispute", label: "Dispută" },
  ];
  return (
    <section className="rounded-2xl border border-dashed border-border p-3 mt-6">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
        <User className="h-3 w-3" /> Demo · alege etapa
      </div>
      <div className="flex flex-wrap gap-1.5">
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(s.id)}
            className={`text-xs rounded-full px-3 py-1.5 font-medium transition cursor-pointer ${
              stage === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
