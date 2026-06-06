// Lovable integration — auth handled by Firebase, not Supabase.
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: unknown) => {
      console.warn("[lovable] use Firebase auth directly (auth.tsx)");
      return { error: new Error("Use Firebase auth") };
    },
  },
};
