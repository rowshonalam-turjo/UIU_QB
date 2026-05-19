import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — UIU Question Bank" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Recovery email sent — check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send recovery email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-[oklch(0.55_0.25_295)] opacity-20 blur-[140px] -z-10" />
      <Link to="/auth" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl gradient-bg items-center justify-center glow mb-5">
            <GraduationCap className="w-7 h-7 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold">Recover your account</h1>
          <p className="text-sm text-muted-foreground mt-2">We'll email you a secure link to set a new password.</p>
        </div>

        <div className="glass-card p-7">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-2xl mb-3">📬</div>
              <p className="text-sm">Check <span className="font-semibold">{email}</span> for a reset link.</p>
              <p className="text-xs text-muted-foreground mt-2">Didn't get it? Check spam, or try again in a minute.</p>
              <button onClick={() => setSent(false)} className="mt-5 text-xs text-foreground hover:underline">Send again</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="you@uiu.ac.bd"
                  />
                </div>
              </div>
              <button type="submit" disabled={busy} className="w-full px-4 py-3 rounded-xl gradient-bg text-background font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send recovery link
              </button>
            </form>
          )}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Remembered it? <Link to="/auth" className="text-foreground hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
