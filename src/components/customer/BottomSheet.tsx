import { useState } from "react";
import { MapPin, Navigation, Clock, ArrowRight, Home, Briefcase } from "lucide-react";

const RECENT = [
  { icon: Home, label: "Acasă", address: "Str. Ștefan cel Mare 100, Chișinău" },
  { icon: Briefcase, label: "Birou", address: "Str. București 32, Chișinău" },
  { icon: Clock, label: "Aeroport Internațional", address: "Chișinău International Airport" },
];

export function BottomSheet() {
  const [destination, setDestination] = useState("");

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-card border-t border-border shadow-[var(--shadow-sheet)] max-h-[60vh] flex flex-col">
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />

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
            <button className="rounded-md bg-primary text-primary-foreground p-1.5 shadow-[var(--shadow-elegant)]">
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto">
        {["Standard", "Comfort", "XL", "Curier"].map((t, i) => (
          <button
            key={t}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition ${
              i === 0
                ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-elegant)]"
                : "bg-transparent text-foreground border-border hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recente
          </span>
          <button className="text-xs text-primary font-medium">Vezi tot</button>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-1 overflow-y-auto">
        {RECENT.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/60 transition text-left"
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
    </div>
  );
}
