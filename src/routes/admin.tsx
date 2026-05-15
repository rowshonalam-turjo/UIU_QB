import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, ShieldOff, Loader2, Search, Crown, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — UIU Question Bank" }] }),
  component: AdminPage,
});

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  student_id: string | null;
  department: string | null;
  is_admin: boolean;
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, student_id, department").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    const adminSet = new Set((roles ?? []).map((r) => r.user_id));
    setRows((profiles ?? []).map((p) => ({ ...p, is_admin: adminSet.has(p.id) })));
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const toggleAdmin = async (row: Row) => {
    if (row.is_admin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", row.id)
        .eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success(`Removed admin from ${row.full_name || row.email}`);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: row.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success(`Promoted ${row.full_name || row.email} to admin`);
    }
    load();
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const hay = `${r.full_name ?? ""} ${r.email ?? ""} ${r.student_id ?? ""} ${r.department ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const totalAdmins = rows.filter((r) => r.is_admin).length;

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.7_0.25_295)] mb-3">
                <Crown className="w-4 h-4" /> Admin control
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold">User <span className="gradient-text">management</span></h1>
              <p className="text-sm text-muted-foreground mt-3">Promote or revoke admin privileges. Admins can manage uploads and other users.</p>
            </div>
            <div className="flex gap-3">
              <Stat label="Total users" value={rows.length} />
              <Stat label="Admins" value={totalAdmins} />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, student ID, department…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              {busy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                No users match your search.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((r) => {
                  const initials = (r.full_name || r.email || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-background font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{r.full_name || "—"}</span>
                          {r.is_admin && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded gradient-bg text-background font-semibold">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.email} {r.student_id ? `· ${r.student_id}` : ""} {r.department ? `· ${r.department}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAdmin(r)}
                        disabled={r.id === user?.id}
                        title={r.id === user?.id ? "You cannot change your own role" : ""}
                        className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          r.is_admin
                            ? "glass hover:bg-destructive/20 hover:text-destructive"
                            : "gradient-bg text-background"
                        }`}
                      >
                        {r.is_admin ? (<><ShieldOff className="w-3.5 h-3.5" /> Revoke admin</>) : (<><ShieldCheck className="w-3.5 h-3.5" /> Make admin</>)}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card px-5 py-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-display font-bold gradient-text">{value}</div>
    </div>
  );
}
