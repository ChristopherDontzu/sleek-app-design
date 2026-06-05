import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export type AppRole = "customer" | "transporter" | "driver";

const STORAGE_KEY = "moldingo:role";

/**
 * Citește rolul utilizatorului din Firestore (users/{uid}.role).
 * - Dacă documentul nu există, îl creează cu role="customer" implicit.
 * - Cache local în localStorage ca să evităm flash-uri la reîncărcare.
 */
export function useRole() {
  const [role, setRole] = useState<AppRole | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(STORAGE_KEY);
    return (cached as AppRole) || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setRole(null);
        setLoading(false);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        let r: AppRole = "customer";
        if (snap.exists()) {
          const data = snap.data() as { role?: AppRole };
          if (data.role === "driver" || data.role === "transporter" || data.role === "customer") {
            r = data.role;
          }
        } else {
          // Creează profil minim
          await setDoc(ref, {
            role: "customer",
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            createdAt: serverTimestamp(),
          });
        }
        setRole(r);
        localStorage.setItem(STORAGE_KEY, r);
      } catch (err) {
        console.error("[useRole] failed:", err);
        setRole("customer");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return { role, loading };
}

/** Helper pentru redirect-uri: returnează ruta de start în funcție de rol. */
export function homeForRole(role: AppRole | null): string {
  if (role === "driver") return "/sofer";
  if (role === "transporter") return "/transportator";
  return "/";
}
