import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Power,
  MapPin,
  MessageSquare,
  Truck,
  Calendar,
  Navigation,
  LogOut,
  Loader2,
} from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sofer")({
  head: () => ({
    meta: [
      { title: "Moldingo Șofer — Cursele mele" },
      { name: "description", content: "Panou șofer: cursele atribuite, status online, partajare locație." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <DriverPage />
    </ThemeProvider>
  ),
});

type Trip = {
  id: string;
  from: string;
  to: string;
  type: string;
  date: string;
  status: "asignat" | "in-curs" | "finalizat";
  client: string;
};

// Date demo — vor veni din Firestore (trips where driverId == uid)
const MOCK_TRIPS: Trip[] = [
  { id: "t1", from: "Chișinău", to: "Bălți", date: "07.06.2026 · 09:00", type: "Colet mediu", status: "asignat", client: "Ana M." },
  { id: "t2", from: "Chișinău", to: "Orhei", date: "07.06.2026 · 14:30", type: "2 persoane", status: "asignat", client: "Vlad P." },
  { id: "t3", from: "Bălți", to: "Chișinău", date: "06.06.2026 · 18:00", type: "Colet mic", status: "finalizat", client: "Maria C." },
];

function DriverPage() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const [online, setOnline] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Gate: redirect dacă nu e logat sau nu e șofer
  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/sofer" }, replace: true });
      return;
    }
    if (role && role !== "driver") {
      toast.error("Contul tău nu este de tip șofer");
      navigate({ to: role === "transporter" ? "/transportator" : "/", replace: true });
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  // Cleanup geolocation watcher
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const toggleSharing = () => {
    if (sharing) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setSharing(false);
      setCoords(null);
      toast.success("Partajare locație oprită");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocația nu e disponibilă");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // TODO: scrie în Firestore drivers/{uid}/location
      },
      (err) => {
        toast.error("Eroare locație: " + err.message);
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchIdRef.current = id;
    setSharing(true);
    toast.success("Partajezi locația în timp real");
  };

  const toggleOnline = () => {
    setOnline((v) => !v);
    toast.success(!online ? "Ești ONLINE" : "Ești OFFLINE");
    // TODO: actualizează users/{uid}.online în Firestore
  };

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (authLoading || roleLoading || !user || (role && role !== "driver")) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const activeTrips = MOCK_TRIPS.filter((t) => t.status !== "finalizat");
  const pastTrips = MOCK_TRIPS.filter((t) => t.status === "finalizat");

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Truck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Moldingo Șofer</div>
              <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition cursor-pointer"
            aria-label="Ieși din cont"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Status card */}
        <section className={cn(
          "rounded-2xl border p-4 transition",
          online
            ? "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40"
            : "bg-card border-border"
        )}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]" : "bg-muted-foreground/40"
                )} />
                <span className="text-lg font-semibold">
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {online ? "Primești curse noi" : "Nu primești curse"}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer shadow-[var(--shadow-elegant)]",
                online ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}
              aria-label="Comută online/offline"
            >
              <Power className="h-6 w-6" />
            </button>
          </div>
        </section>

        {/* Location sharing */}
        <button
          onClick={toggleSharing}
          className={cn(
            "w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] cursor-pointer flex items-center gap-3",
            sharing
              ? "bg-accent/20 border-accent/50"
              : "bg-card border-border hover:bg-muted/40"
          )}
        >
          <span className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center",
            sharing ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
          )}>
            <Navigation className={cn("h-5 w-5", sharing && "animate-pulse")} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold">
              {sharing ? "Partajezi locația" : "Partajează locația"}
            </span>
            <span className="block text-xs text-muted-foreground truncate">
              {sharing && coords
                ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                : "Clientul vede unde ești în timp real"}
            </span>
          </span>
          <span className={cn(
            "text-[11px] font-semibold uppercase px-2 py-1 rounded-full",
            sharing
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {sharing ? "ON" : "OFF"}
          </span>
        </button>

        {/* Active trips */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Cursele mele active</h2>
            <span className="text-xs text-muted-foreground">{activeTrips.length}</span>
          </div>
          <div className="space-y-2">
            {activeTrips.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nicio cursă atribuită.
              </div>
            )}
            {activeTrips.map((t) => <TripCard key={t.id} t={t} />)}
          </div>
        </section>

        {/* History */}
        {pastTrips.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-2">Istoric</h2>
            <div className="space-y-2">
              {pastTrips.map((t) => <TripCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
      </div>

      {/* Bottom nav: minimal */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        {[
          { label: "Cursele mele", icon: Truck, active: true },
          { label: "Mesaje", icon: MessageSquare, badge: 2 },
          { label: "Locația mea", icon: MapPin },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium",
                t.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{t.label}</span>
              {t.badge && (
                <span className="absolute top-2 right-[28%] h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </main>
  );
}

function TripCard({ t }: { t: Trip }) {
  const statusStyle =
    t.status === "asignat"
      ? "bg-primary/15 text-primary"
      : t.status === "in-curs"
      ? "bg-accent/20 text-accent-foreground"
      : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold truncate">
            {t.from} → {t.to}
          </div>
          <div className="text-sm text-muted-foreground">{t.type} · {t.client}</div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", statusStyle)}>
          {t.status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {t.date}
        </span>
        {t.status !== "finalizat" && (
          <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">
            Deschide →
          </button>
        )}
      </div>
    </div>
  );
}
