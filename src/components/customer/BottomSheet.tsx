import { useState } from "react";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

const TABS = ["Persoane", "Colet", "Mare", "Oferte"] as const;

export function BottomSheet() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Persoane");

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
      {/* Sheet card */}
      <div className="rounded-t-3xl bg-card border-t border-border shadow-[var(--shadow-sheet)] px-4 pt-3 pb-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />

        {/* From / To row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 border border-transparent focus-within:border-primary transition">
            <span className="h-2 w-2 rounded-full bg-[oklch(0.72_0.18_145)] shrink-0" />
            <input
              type="text"
              placeholder="De unde?"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 border border-transparent focus-within:border-primary transition">
            <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
            <input
              type="text"
              placeholder="Unde?"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 rounded-xl bg-muted/40 p-1">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg py-2 text-xs font-medium transition cursor-pointer ${
                  active
                    ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full rounded-2xl bg-foreground text-background py-3.5 text-sm font-semibold shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-90 transition"
        >
          Cere transport
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="bg-card border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          <NavBtn icon={Home} active />
          <NavBtn icon={Search} />
          <button
            type="button"
            className="-mt-6 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-90 transition"
            aria-label="Adaugă"
          >
            <Plus className="h-5 w-5" />
          </button>
          <NavBtn icon={MessageCircle} />
          <NavBtn icon={User} />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({
  icon: Icon,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`h-11 w-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
