import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { ThemeProvider } from "@/hooks/use-theme";
import {
  ArrowLeft,
  Check,
  User,
  Package,
  Users,
  Plus,
  Minus,
  Accessibility,
  Trash2,
  Camera,
  FileText,
  Briefcase,
  Sofa,
  Tv,
  Apple,
  Box,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/cerere")({
  head: () => ({
    meta: [
      { title: "Postează cerere — Moldingo" },
      { name: "description", content: "Creează o cerere de transport în 4 pași." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <CerereFlow />
    </ThemeProvider>
  ),
});

// ---------- Types ----------
type TripType = "persoane" | "colet" | "mixt";

type ColetKind = "documente" | "bagaj" | "mobila" | "electronice" | "alimente" | "altele";
type ColetSize = "mic" | "mediu" | "mare" | "xl";

interface Colet {
  id: string;
  kind: ColetKind;
  size: ColetSize;
  weightKg: number;
  fragile: boolean;
  twoPeople: boolean;
  note: string;
}

interface Cerere {
  from: string;
  to: string;
  when: "acum" | "programat";
  type: TripType | null;
  adults: number;
  children: number;
  specialNeeds: boolean;
  specialNote: string;
  colete: Colet[];
}

const COLET_META: Record<ColetKind, { label: string; icon: typeof FileText }> = {
  documente: { label: "Documente", icon: FileText },
  bagaj: { label: "Bagaj", icon: Briefcase },
  mobila: { label: "Mobilă", icon: Sofa },
  electronice: { label: "Electronice", icon: Tv },
  alimente: { label: "Alimente", icon: Apple },
  altele: { label: "Altele", icon: Box },
};

const SIZE_META: Record<ColetSize, { label: string; hint: string }> = {
  mic: { label: "Mic", hint: "geantă de mână" },
  mediu: { label: "Mediu", hint: "valiză / cutie" },
  mare: { label: "Mare", hint: "ladă / frigider mic" },
  xl: { label: "XL", hint: "mobilă, electrocasnice mari" },
};

// ---------- Main flow ----------
function CerereFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<Cerere>({
    from: "",
    to: "",
    when: "acum",
    type: null,
    adults: 1,
    children: 0,
    specialNeeds: false,
    specialNote: "",
    colete: [],
  });

  const update = (patch: Partial<Cerere>) => setData((d) => ({ ...d, ...patch }));

  const canNext = (() => {
    if (step === 1) return data.from.trim().length > 0 && data.to.trim().length > 0;
    if (step === 2) return data.type !== null;
    if (step === 3) {
      if (data.type === "colet") return data.colete.length > 0;
      if (data.type === "mixt") return data.adults + data.children > 0 && data.colete.length > 0;
      return data.adults + data.children > 0;
    }
    return true;
  })();

  const submitCerere = async () => {
    if (!data.type) return;
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.info("Intră în cont ca să trimiți cererea");
        navigate({ to: "/auth", search: { redirect: "/cerere" } });
        return;
      }

      const totalWeight = data.colete.reduce((s, c) => s + c.weightKg, 0);
      const passengerCount = data.adults + data.children;

      // Mapare la schema Firestore existentă (bidRequests)
      const requestTransportType =
        data.type === "persoane"
          ? "people_only"
          : data.type === "colet"
            ? "cargo_only"
            : "people_and_cargo";

      const cargoType = data.type === "persoane" ? null : "other";

      const customerName =
        user.displayName ?? user.email?.split("@")[0] ?? "Client";

      const title =
        data.type === "persoane"
          ? `Persoane • ${data.from.trim()} • ${data.to.trim()}`
          : data.type === "colet"
            ? `Colet • ${data.from.trim()} • ${data.to.trim()}`
            : `Persoane + Colet • ${data.from.trim()} • ${data.to.trim()}`;

      await addDoc(collection(db, "bidRequests"), {
        customerId: user.uid,
        customerName,
        title,
        status: "pending",
        requestTransportType,
        cargoType,
        // Locații (text liber pentru moment — fără geocoding)
        fromCity: data.from.trim(),
        fromCountry: null,
        toCity: data.to.trim(),
        toCountry: null,
        pickupAddress: data.from.trim(),
        pickupText: data.from.trim(),
        deliveryAddress: data.to.trim(),
        // Pasageri
        passengerEnabled: data.type !== "colet",
        passengerCount: data.type === "colet" ? 0 : passengerCount,
        passengerProfile:
          data.type === "colet"
            ? null
            : {
                adultCount: data.adults,
                childCount: data.children,
                withChildren: data.children > 0,
                withSpecialNeeds: data.specialNeeds,
                specialNeedsDetails: data.specialNote || null,
              },
        withChildren: data.children > 0,
        withSpecialNeeds: data.specialNeeds,
        specialNeedsDetails: data.specialNote || null,
        // Colet
        weightKg: data.type === "persoane" ? 0 : totalWeight,
        cargoItems: data.colete,
        // Preț / observații
        budgetEur: estimatePrice(data) || null,
        description: "",
        // Schedule
        preferredDate: data.when === "acum" ? new Date().toISOString() : null,
        when: data.when,
        // Metadata
        createdAt: serverTimestamp(),
        offersCount: 0,
        viewsCount: 0,
        targetCarrierId: null,
        targetCarrierName: null,
      });

      toast.success("Cererea a fost trimisă șoferilor!");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Eroare la trimitere";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 4) {
      void submitCerere();
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => (step === 1 ? navigate({ to: "/" }) : setStep((s) => s - 1));

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header step={step} onBack={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-3">
        {step === 1 && <Step1Route data={data} update={update} />}
        {step === 2 && <Step2Type data={data} update={update} />}
        {step === 3 && <Step3Details data={data} update={update} />}
        {step === 4 && <Step4Confirm data={data} />}
      </div>

      <Footer
        step={step}
        canNext={canNext && !submitting}
        onNext={next}
        label={
          step === 4
            ? submitting
              ? "Se trimite…"
              : "Trimite cererea"
            : step === 3
              ? "Continuă"
              : "Mai departe"
        }
      />
    </main>
  );
}

// ---------- Header ----------
function Header({ step, onBack }: { step: number; onBack: () => void }) {
  const titles = ["Rută", "Tip transport", "Detalii", "Confirmă"];
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer transition active:scale-95"
          aria-label="Înapoi"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            Pasul {step} / 4
          </div>
          <div className="text-[17px] font-semibold leading-tight">{titles[step - 1]}</div>
        </div>
        <div
          className="h-10 w-10 rounded-full text-primary-foreground flex items-center justify-center shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="text-sm font-bold tabular-nums">{step}</span>
        </div>
      </div>
      <div className="px-4 pb-3 flex gap-1.5">
        {[1, 2, 3, 4].map((i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                done ? "bg-primary" : active ? "" : "bg-muted"
              }`}
              style={active ? { background: "var(--gradient-primary)" } : undefined}
            />
          );
        })}
      </div>
    </header>
  );
}

// ---------- Footer ----------
function Footer({
  step,
  canNext,
  onNext,
  label,
}: {
  step: number;
  canNext: boolean;
  onNext: () => void;
  label: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-background/70 backdrop-blur-xl border-t border-border/60 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        style={canNext ? { background: "var(--gradient-primary)" } : undefined}
        className="w-full rounded-2xl text-primary-foreground py-4 text-[15px] font-semibold shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-95 hover:-translate-y-px active:translate-y-0 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none flex items-center justify-center gap-2"
      >
        {label}
        {step < 4 && <ChevronRight className="h-4 w-4" />}
        {step === 4 && <Check className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ============ STEP 1: Route ============
function Step1Route({
  data,
  update,
}: {
  data: Cerere;
  update: (p: Partial<Cerere>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        De unde pleci și unde mergi?
      </p>

      <div className="rounded-2xl bg-card border border-border p-3 space-y-2">
        <Field
          dot="bg-[oklch(0.72_0.18_145)]"
          placeholder="De unde?"
          value={data.from}
          onChange={(v) => update({ from: v })}
        />
        <div className="ml-4 border-l border-dashed border-border h-3" />
        <Field
          dot="bg-destructive"
          placeholder="Unde?"
          value={data.to}
          onChange={(v) => update({ to: v })}
        />
      </div>

      <div>
        <Label>Când?</Label>
        <div className="grid grid-cols-2 gap-2">
          <Choice
            active={data.when === "acum"}
            onClick={() => update({ when: "acum" })}
            label="Acum"
            sub="cât mai repede"
          />
          <Choice
            active={data.when === "programat"}
            onClick={() => update({ when: "programat" })}
            label="Programat"
            sub="dată & oră"
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  dot,
  placeholder,
  value,
  onChange,
}: {
  dot: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3 border border-transparent focus-within:border-primary transition">
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dot}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ============ STEP 2: Type ============
function Step2Type({
  data,
  update,
}: {
  data: Cerere;
  update: (p: Partial<Cerere>) => void;
}) {
  const types: { id: TripType; title: string; sub: string; icon: typeof User }[] = [
    { id: "persoane", title: "Persoane", sub: "doar pasageri", icon: User },
    { id: "colet", title: "Colet", sub: "doar marfă", icon: Package },
    { id: "mixt", title: "Persoane + Colet", sub: "amândouă", icon: Users },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Ce vrei să transporți?</p>
      {types.map((t) => {
        const active = data.type === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => update({ type: t.id })}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 cursor-pointer transition active:scale-[0.99] ${
              active
                ? "border-primary/60 bg-primary/[0.04] shadow-[var(--shadow-elegant)]"
                : "border-border bg-card hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
            }`}
          >
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition ${
                active ? "text-primary-foreground" : "bg-muted text-foreground"
              }`}
              style={active ? { background: "var(--gradient-primary)" } : undefined}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px]">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.sub}</div>
            </div>
            <div
              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                active ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============ STEP 3: Details ============
function Step3Details({
  data,
  update,
}: {
  data: Cerere;
  update: (p: Partial<Cerere>) => void;
}) {
  const showPeople = data.type === "persoane" || data.type === "mixt";
  const showColete = data.type === "colet" || data.type === "mixt";

  return (
    <div className="space-y-5">
      {showPeople && <PeopleSection data={data} update={update} />}
      {showColete && <ColeteSection data={data} update={update} />}
    </div>
  );
}

function PeopleSection({
  data,
  update,
}: {
  data: Cerere;
  update: (p: Partial<Cerere>) => void;
}) {
  return (
    <section className="rounded-2xl bg-card border border-border p-4 space-y-4">
      <div>
        <h3 className="font-semibold">Pasageri</h3>
        <p className="text-xs text-muted-foreground">Câte persoane călătoresc?</p>
      </div>

      <Stepper
        icon={User}
        label="Adulți"
        value={data.adults}
        min={0}
        max={8}
        onChange={(v) => update({ adults: v })}
      />
      <Stepper
        icon={Users}
        label="Copii"
        sub="sub 12 ani"
        value={data.children}
        min={0}
        max={6}
        onChange={(v) => update({ children: v })}
      />

      <div className="pt-2 border-t border-border space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              data.specialNeeds
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Accessibility className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Necesități speciale</div>
            <div className="text-xs text-muted-foreground">
              scaun cu rotile, însoțitor, acces vehicul
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.specialNeeds}
            onChange={(e) => update({ specialNeeds: e.target.checked })}
            className="h-5 w-5 accent-[var(--primary)] cursor-pointer"
          />
        </label>

        {data.specialNeeds && (
          <textarea
            placeholder="Descrie ce e nevoie pentru o călătorie confortabilă…"
            value={data.specialNote}
            onChange={(e) => update({ specialNote: e.target.value })}
            rows={3}
            className="w-full rounded-xl bg-muted/60 border border-transparent focus:border-primary outline-none p-3 text-sm transition resize-none"
          />
        )}
      </div>
    </section>
  );
}

function Stepper({
  icon: Icon,
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  icon: typeof User;
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition"
          disabled={value <= min}
          aria-label={`Scade ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition"
          disabled={value >= max}
          aria-label={`Crește ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ColeteSection({
  data,
  update,
}: {
  data: Cerere;
  update: (p: Partial<Cerere>) => void;
}) {
  const add = () => {
    const c: Colet = {
      id: crypto.randomUUID(),
      kind: "bagaj",
      size: "mediu",
      weightKg: 10,
      fragile: false,
      twoPeople: false,
      note: "",
    };
    update({ colete: [...data.colete, c] });
  };
  const remove = (id: string) =>
    update({ colete: data.colete.filter((c) => c.id !== id) });
  const patch = (id: string, p: Partial<Colet>) =>
    update({
      colete: data.colete.map((c) => (c.id === id ? { ...c, ...p } : c)),
    });

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-semibold">Colete</h3>
          <p className="text-xs text-muted-foreground">
            Adaugă fiecare colet separat. Poți adăuga oricâte.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {data.colete.length} {data.colete.length === 1 ? "colet" : "colete"}
        </span>
      </div>

      {data.colete.map((c, i) => (
        <ColetCard
          key={c.id}
          index={i + 1}
          colet={c}
          onChange={(p) => patch(c.id, p)}
          onRemove={() => remove(c.id)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {data.colete.length === 0 ? "Adaugă primul colet" : "Mai adaug un colet"}
      </button>
    </section>
  );
}

function ColetCard({
  index,
  colet,
  onChange,
  onRemove,
}: {
  index: number;
  colet: Colet;
  onChange: (p: Partial<Colet>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Colet #{index}</div>
        <button
          type="button"
          onClick={onRemove}
          className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition"
          aria-label="Șterge"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Tip */}
      <div>
        <Label>Tip</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(COLET_META) as ColetKind[]).map((k) => {
            const meta = COLET_META[k];
            const Icon = meta.icon;
            const active = colet.kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ kind: k })}
                className={`rounded-xl border p-2.5 flex flex-col items-center gap-1 cursor-pointer transition ${
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mărime */}
      <div>
        <Label>Mărime</Label>
        <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-muted/40 p-1">
          {(Object.keys(SIZE_META) as ColetSize[]).map((s) => {
            const active = colet.size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ size: s })}
                className={`rounded-lg py-2 text-xs font-medium transition cursor-pointer ${
                  active
                    ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                    : "text-muted-foreground"
                }`}
              >
                {SIZE_META[s].label}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1.5">
          {SIZE_META[colet.size].hint}
        </div>
      </div>

      {/* Greutate */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="!mb-0">Greutate aprox.</Label>
          <span className="text-sm font-semibold tabular-nums">{colet.weightKg} kg</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={colet.weightKg}
          onChange={(e) => onChange({ weightKg: Number(e.target.value) })}
          className="w-full accent-[var(--primary)] cursor-pointer"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <Toggle
          active={colet.fragile}
          onClick={() => onChange({ fragile: !colet.fragile })}
          label="Fragil"
        />
        <Toggle
          active={colet.twoPeople}
          onClick={() => onChange({ twoPeople: !colet.twoPeople })}
          label="2 persoane"
        />
      </div>

      {/* Note */}
      <textarea
        placeholder="Detalii (opțional): dimensiuni, instrucțiuni…"
        value={colet.note}
        onChange={(e) => onChange({ note: e.target.value })}
        rows={2}
        className="w-full rounded-xl bg-muted/60 border border-transparent focus:border-primary outline-none p-3 text-sm transition resize-none"
      />

      <button
        type="button"
        className="w-full rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition flex items-center justify-center gap-2"
      >
        <Camera className="h-4 w-4" />
        Adaugă foto (opțional)
      </button>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border py-2.5 text-xs font-medium cursor-pointer transition ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Choice({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left cursor-pointer transition ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </button>
  );
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide ${className}`}
    >
      {children}
    </div>
  );
}

// ============ STEP 4: Confirm ============
function Step4Confirm({ data }: { data: Cerere }) {
  const totalWeight = data.colete.reduce((s, c) => s + c.weightKg, 0);
  const peopleTotal = data.adults + data.children;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Verifică detaliile și trimite cererea șoferilor.
      </p>

      {/* Route */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <Label>Rută</Label>
        <div className="flex items-start gap-3">
          <div className="pt-1 flex flex-col items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_145)]" />
            <span className="w-px flex-1 bg-border my-1" />
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-sm font-medium">{data.from || "—"}</div>
            <div className="text-sm font-medium">{data.to || "—"}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          {data.when === "acum" ? "Plecare cât mai repede" : "Programat"}
        </div>
      </section>

      {/* People */}
      {(data.type === "persoane" || data.type === "mixt") && (
        <section className="rounded-2xl bg-card border border-border p-4">
          <Label>Pasageri</Label>
          <div className="text-sm">
            <span className="font-semibold">{peopleTotal}</span> total
            {data.adults > 0 && ` · ${data.adults} adulți`}
            {data.children > 0 && ` · ${data.children} copii`}
          </div>
          {data.specialNeeds && (
            <div className="mt-2 text-xs rounded-lg bg-primary/10 text-foreground px-2.5 py-1.5 inline-flex items-center gap-1.5">
              <Accessibility className="h-3.5 w-3.5" />
              Necesități speciale
            </div>
          )}
          {data.specialNote && (
            <p className="text-xs text-muted-foreground mt-2">{data.specialNote}</p>
          )}
        </section>
      )}

      {/* Colete */}
      {(data.type === "colet" || data.type === "mixt") && (
        <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="!mb-0">Colete</Label>
            <span className="text-xs text-muted-foreground">
              {data.colete.length} · ~{totalWeight} kg
            </span>
          </div>
          {data.colete.map((c, i) => {
            const meta = COLET_META[c.kind];
            const Icon = meta.icon;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl bg-muted/40 p-2.5"
              >
                <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    #{i + 1} · {meta.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {SIZE_META[c.size].label} · {c.weightKg} kg
                    {c.fragile && " · fragil"}
                    {c.twoPeople && " · 2 pers."}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Price estimate */}
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4">
        <Label>Preț estimativ</Label>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {estimatePrice(data)}
          </span>
          <span className="text-sm text-muted-foreground">MDL</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Șoferii vor putea propune prețul lor.
        </p>
      </section>
    </div>
  );
}

function estimatePrice(d: Cerere): number {
  let base = 50;
  base += d.adults * 30 + d.children * 15;
  base += d.colete.reduce((s, c) => {
    const sizeMult = { mic: 20, mediu: 50, mare: 120, xl: 250 }[c.size];
    return s + sizeMult + c.weightKg * 2 + (c.fragile ? 30 : 0) + (c.twoPeople ? 50 : 0);
  }, 0);
  return Math.round(base);
}
