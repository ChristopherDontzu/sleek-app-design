import {
  User,
  Clock,
  CreditCard,
  Gift,
  Wallet,
  Bell,
  Settings,
  HelpCircle,
  Car,
  Globe,
  LogOut,
  ChevronRight,
  Star,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import logoColor from "@/assets/moldingo-logo-color.png";
import logoBlack from "@/assets/moldingo-logo-black.png";

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Item = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  badge?: string;
};

const personal: Item[] = [
  { icon: User, label: "Profilul meu", hint: "Date, documente, verificare" },
  { icon: Clock, label: "Istoric curse", hint: "Cereri, oferte, finalizate" },
  { icon: Wallet, label: "Portofel", hint: "Sold și retrageri" },
  { icon: CreditCard, label: "Plăți și carduri" },
];

const engagement: Item[] = [
  { icon: Gift, label: "Promoții", badge: "Nou" },
  { icon: Star, label: "Invită prieteni", hint: "Câștigă bonus" },
  { icon: Bell, label: "Notificări" },
];

const support: Item[] = [
  { icon: Settings, label: "Setări" },
  { icon: Globe, label: "Limbă", hint: "Română" },
  { icon: HelpCircle, label: "Ajutor și suport" },
];

function Row({ item }: { item: Item }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition active:scale-[0.98] hover:bg-muted/60"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-foreground truncate">
            {item.label}
          </span>
          {item.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
              {item.badge}
            </span>
          )}
        </span>
        {item.hint && (
          <span className="block text-xs text-muted-foreground truncate">
            {item.hint}
          </span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

export function SideMenu({ open, onOpenChange }: SideMenuProps) {
  const { theme } = useTheme();
  const logo = theme === "dark" ? logoBlack : logoColor;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88%] max-w-[360px] p-0 border-r border-border bg-background flex flex-col gap-0"
      >
        {/* Header: profile card */}
        <div className="px-4 pt-6 pb-4 bg-gradient-to-br from-primary/15 via-background to-background border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-card border border-border flex items-center justify-center text-lg font-semibold text-foreground shadow-[var(--shadow-card)]">
                IU
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-foreground truncate">
                Ion Utilizator
              </div>
              <div className="text-xs text-muted-foreground truncate">
                +373 •• ••• •••
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-foreground">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="font-medium">4.92</span>
                <span className="text-muted-foreground">· 28 curse</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-card/80 backdrop-blur border border-border px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Portofel</div>
              <div className="text-sm font-semibold text-foreground">0 MDL</div>
            </div>
            <div className="rounded-2xl bg-card/80 backdrop-blur border border-border px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Bonusuri</div>
              <div className="text-sm font-semibold text-foreground">120 pct</div>
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pb-4">
          <SectionLabel>Cont</SectionLabel>
          <div className="px-2 space-y-0.5">
            {personal.map((i) => (
              <Row key={i.label} item={i} />
            ))}
          </div>

          <SectionLabel>Activitate</SectionLabel>
          <div className="px-2 space-y-0.5">
            {engagement.map((i) => (
              <Row key={i.label} item={i} />
            ))}
          </div>

          <SectionLabel>General</SectionLabel>
          <div className="px-2 space-y-0.5">
            {support.map((i) => (
              <Row key={i.label} item={i} />
            ))}
          </div>

          {/* Become a driver banner */}
          <div className="px-4 pt-4">
            <button
              type="button"
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)] active:scale-[0.98] transition"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Car className="h-5 w-5" />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-semibold">Devino șofer</span>
                <span className="block text-xs opacity-90">
                  Câștigă cu mașina ta
                </span>
              </span>
              <ChevronRight className="h-4 w-4 opacity-90" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-card/40">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Moldingo"
              className="h-6 w-6 rounded-full object-contain"
            />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-foreground">Moldingo</div>
              <div className="text-[10px] text-muted-foreground">v0.1.0</div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-destructive px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Ieși
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
