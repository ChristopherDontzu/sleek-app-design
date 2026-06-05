import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Shield, UserCog } from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/integrations/firebase/client";
import type { AppRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin — Roluri utilizatori" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <AdminUsersPage />
    </ThemeProvider>
  ),
});

const ROLES: AppRole[] = ["customer", "transporter", "driver"];

function AdminUsersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [uid, setUid] = useState("1TSlEUT0APYZuGRC2HoL5xRbRj62");
  const [role, setRole] = useState<AppRole>("driver");
  const [companyId, setCompanyId] = useState("moldingo");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/admin/users" }, replace: true });
    }
  }, [user, authLoading, navigate]);

  const lookup = async () => {
    if (!uid.trim()) return;
    setBusy(true);
    try {
      const snap = await getDoc(doc(db, "users", uid.trim()));
      if (!snap.exists()) {
        setCurrentRole("(nu există încă — va fi creat)");
        toast.info("Userul nu are profil încă");
      } else {
        const d = snap.data() as { role?: string; email?: string; companyId?: string };
        setCurrentRole(d.role ?? "customer");
        if (d.email) setEmail(d.email);
        if (d.companyId) setCompanyId(d.companyId);
        toast.success(`Rol actual: ${d.role ?? "customer"}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Eroare";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!uid.trim()) {
      toast.error("UID lipsește");
      return;
    }
    setBusy(true);
    try {
      const ref = doc(db, "users", uid.trim());
      const snap = await getDoc(ref);
      const payload: Record<string, unknown> = {
        role,
        updatedAt: serverTimestamp(),
      };
      if (role === "driver" && companyId.trim()) payload.companyId = companyId.trim();
      if (email.trim()) payload.email = email.trim();
      if (!snap.exists()) payload.createdAt = serverTimestamp();

      await setDoc(ref, payload, { merge: true });
      setCurrentRole(role);
      toast.success(`Rol setat: ${role}`);
      // Dacă editez propriul cont, golesc cache-ul ca să se reciteasca
      try {
        localStorage.removeItem("moldingo:role");
      } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Eroare la salvare";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        <header className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">Admin · Roluri</h1>
            <p className="text-xs text-muted-foreground">Setează rolul unui user după UID</p>
          </div>
        </header>

        <section className="rounded-2xl bg-card border border-border p-4 space-y-3 shadow-[var(--shadow-card)]">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">UID Firebase</span>
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="ex: 1TSlEUT0APYZuGRC2HoL5xRbRj62"
              className="mt-1 w-full rounded-xl bg-muted/60 px-3 py-2.5 text-sm outline-none border border-transparent focus:border-primary font-mono"
            />
          </label>

          <button
            type="button"
            onClick={lookup}
            disabled={busy}
            className="w-full rounded-xl bg-muted text-foreground py-2.5 text-sm font-semibold cursor-pointer hover:bg-muted/80 transition disabled:opacity-50"
          >
            {busy ? "..." : "Verifică rolul actual"}
          </button>

          {currentRole && (
            <div className="rounded-xl bg-muted/40 border border-border px-3 py-2 text-xs">
              Rol actual: <span className="font-semibold">{currentRole}</span>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Email (opțional)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: igor@gmail.com"
              className="mt-1 w-full rounded-xl bg-muted/60 px-3 py-2.5 text-sm outline-none border border-transparent focus:border-primary"
            />
          </label>

          <div>
            <span className="text-xs font-medium text-muted-foreground">Rol nou</span>
            <div className="mt-1 grid grid-cols-3 gap-1.5 rounded-xl bg-muted/40 p-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg py-2 text-xs font-medium transition cursor-pointer ${
                    role === r
                      ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "customer" ? "Client" : r === "transporter" ? "Transportator" : "Șofer"}
                </button>
              ))}
            </div>
          </div>

          {role === "driver" && (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Company ID</span>
              <input
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="ex: moldingo"
                className="mt-1 w-full rounded-xl bg-muted/60 px-3 py-2.5 text-sm outline-none border border-transparent focus:border-primary"
              />
            </label>
          )}

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="w-full rounded-xl bg-foreground text-background py-3 text-sm font-semibold cursor-pointer hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserCog className="h-4 w-4" />
            {busy ? "Salvez..." : "Salvează rolul"}
          </button>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            După salvare, userul respectiv trebuie să facă logout/login pentru ca aplicația
            să recitească rolul. Dacă editezi propriul cont, reîmprospătează pagina.
          </p>
        </section>

        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          ← Înapoi
        </button>
      </div>
    </main>
  );
}
