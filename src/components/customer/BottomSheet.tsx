import { useState } from "react";
import { MapPin, Navigation, Clock, ArrowRight, Home, Briefcase, ChevronDown, User, Package, Users } from "lucide-react";

const RIDE_TYPES = [
  { id: "persoana", label: "Persoană", icon: User, desc: "1-3 pasageri" },
  { id: "comfort", label: "Comfort", icon: Users, desc: "Mașină premium" },
  { id: "xl", label: "XL", icon: Users, desc: "Până la 6 locuri" },
  { id: "colet", label: "Colet", icon: Package, desc: "Curier rapid" },
] as const;

const RECENT = [
  { icon: Home, label: "Acasă", address: "Str. Ștefan cel Mare 100, Chișinău" },
  { icon: Briefcase, label: "Birou", address: "Str. București 32, Chișinău" },
  { icon: Clock, label: "Aeroport Internațional", address: "Chișinău International Airport" },
];

export function BottomSheet() {
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState<string>("persoana");
  const [recentOpen, setRecentOpen] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-card border-t border-border shadow-[var(--shadow-sheet)] max-h-[75vh] flex flex-col">
      <button
        type="button"
        onClick={() => setRecentOpen((v) => !v)}
        className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted hover:bg-muted-foreground/40 transition cursor-pointer"
        aria-label="Comută panou"
      />

      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold tracking-tight">Unde mergi?</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Alege destinația și găsim cel mai apropiat șofer
        </p>
      </div>

      <div className="px-5 pt-2 space-y-2">
        <div className="relative flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 border border-transparent focus-within:border-primary transition">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
          <input
            type="text"
            placeholder="Locația ta curentă"
            defaultValue="Locația curentă"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Navigation className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="relative flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 border border-transparent focus-within:border-primary transition">
          <div className="h-2.5 w-2.5 rounded-sm bg-accent shrink-0" />
          <input
            type="text"
            placeholder="Unde mergi?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {destination && (
            <button
              type="button"
              className="rounded-md bg-primary text-primary-foreground p-1.5 shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-90 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-5 mt-4">
        {RIDE_TYPES.map((t) => {
          const Icon = t.icon;
          const active = selectedRide === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedRide(t.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 border transition cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-elegant)]"
                  : "bg-transparent text-foreground border-border hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-semibold">{t.label}</span>
              <span className={`text-[10px] leading-tight ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-4">
        <button
          type="button"
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-90 transition disabled:opacity-50"
          disabled={!destination}
        >
          Confirmă cursa
        </button>
      </div>

      <div className="px-5 pt-4 pb-2 mt-1 border-t border-border/60">
        <button
          type="button"
          onClick={() => setRecentOpen((v) => !v)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recente
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${recentOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {recentOpen && (
        <div className="px-5 pb-6 space-y-1 overflow-y-auto">
          {RECENT.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setDestination(item.address)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/60 transition text-left cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.address}</div>
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {!recentOpen && <div className="pb-4" />}
    </div>
  );
}
