import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — UIU Question Bank" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery session in the URL hash automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-[oklch(0.55_0.25_295)] opacity-20 blur-[140px] -z-10" />
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl gradient-bg items-center justify-center glow mb-5">
            <GraduationCap className="w-7 h-7 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-2">Use something you'll remember this time 🙂</p>
        </div>

        <div className="glass-card p-7">
          {!ready ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
              Verifying recovery link…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field icon={<Lock />} label="New password">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-pad" placeholder="••••••••" />
              </Field>
              <Field icon={<Lock />} label="Confirm password">
                <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-pad" placeholder="••••••••" />
              </Field>
              <button type="submit" disabled={busy} className="w-full px-4 py-3 rounded-xl gradient-bg text-background font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Update password
              </button>
            </form>
          )}
        </div>
      </motion.div>

      <style>{`.input-pad { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); outline: none; font-size: 0.875rem; color: var(--color-foreground); } .input-pad:focus { box-shadow: 0 0 0 2px var(--color-primary); }`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground [&>svg]:w-4 [&>svg]:h-4">{icon}</div>
        {children}
      </div>
    </div>
  );
}
