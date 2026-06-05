import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ThemeProvider } from "@/hooks/use-theme";
import { auth, db, googleProvider } from "@/integrations/firebase/client";
import type { AppRole } from "@/hooks/use-role";
import { homeForRole } from "@/hooks/use-role";

async function fetchOrCreateRole(uid: string, email: string | null, displayName: string | null): Promise<AppRole> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { role?: AppRole };
    if (data.role === "driver" || data.role === "transporter" || data.role === "customer") {
      return data.role;
    }
  } else {
    await setDoc(ref, {
      role: "customer",
      email: email ?? null,
      displayName: displayName ?? null,
      createdAt: serverTimestamp(),
    });
  }
  return "customer";
}

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Autentificare — Moldingo" },
      { name: "description", content: "Intră în cont sau creează unul nou." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <AuthPage />
    </ThemeProvider>
  ),
});

const credentialsSchema = z.object({
  email: z.string().trim().email("Email invalid").max(255),
  password: z.string().min(6, "Minim 6 caractere").max(72),
});

function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email sau parolă greșită";
    case "auth/email-already-in-use":
      return "Există deja un cont cu acest email";
    case "auth/weak-password":
      return "Parolă prea slabă (minim 6 caractere)";
    case "auth/invalid-email":
      return "Email invalid";
    case "auth/popup-closed-by-user":
      return "Ai închis fereastra Google";
    case "auth/unauthorized-domain":
      return "Domeniu neautorizat în Firebase Console";
    case "auth/network-request-failed":
      return "Probleme de rețea";
    default:
      return "Eroare la autentificare";
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Dacă e deja logat → redirect după rol
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      const r = await fetchOrCreateRole(u.uid, u.email, u.displayName);
      navigate({ to: redirect ?? homeForRole(r), replace: true });
    });
    return () => unsub();
  }, [navigate, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Date invalide");
      return;
    }

    setLoading(true);
    try {
      let uid: string;
      let userEmail: string | null;
      let displayName: string | null;
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        uid = cred.user.uid; userEmail = cred.user.email; displayName = cred.user.displayName;
        toast.success("Cont creat. Bun venit!");
      } else {
        const cred = await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        uid = cred.user.uid; userEmail = cred.user.email; displayName = cred.user.displayName;
        toast.success("Bun venit înapoi!");
      }
      const r = await fetchOrCreateRole(uid, userEmail, displayName);
      navigate({ to: redirect ?? homeForRole(r), replace: true });
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      toast.error(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const r = await fetchOrCreateRole(cred.user.uid, cred.user.email, cred.user.displayName);
      toast.success("Conectat cu Google");
      navigate({ to: redirect ?? homeForRole(r), replace: true });
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      toast.error(mapFirebaseError(code));
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer transition"
            aria-label="Înapoi"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-base font-semibold">
            {mode === "signin" ? "Intră în cont" : "Creează cont"}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-md w-full mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Bine ai revenit. Intră ca să postezi cereri."
            : "Creează un cont ca să postezi cereri de transport."}
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={oauthLoading}
          className="w-full rounded-2xl bg-card border border-border py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/60 transition disabled:opacity-60"
        >
          {oauthLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          Continuă cu Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">sau</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-3 border border-transparent focus-within:border-primary transition">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-3 border border-transparent focus-within:border-primary transition">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Parolă (minim 6 caractere)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold shadow-[var(--shadow-elegant)] cursor-pointer hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Intră în cont" : "Creează cont"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Nu ai cont?" : "Ai deja cont?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            {mode === "signin" ? "Creează unul" : "Intră în cont"}
          </button>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
