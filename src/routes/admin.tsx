import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, ShieldOff, Loader2, Search, Crown, Users, FileText, CheckCircle2, XCircle, Eye, Trash2, UserX, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { deleteUser as deleteUserFn } from "@/lib/admin.functions";
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

  const removeUser = useServerFn(deleteUserFn);

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

  const handleDeleteUser = async (row: Row) => {
    if (!confirm(`Permanently delete ${row.full_name || row.email}? This removes their account and all data.`)) return;
    try {
      await removeUser({ data: { userId: row.id } });
      toast.success("User deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
    }
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
                      <button
                        onClick={() => handleDeleteUser(r)}
                        disabled={r.id === user?.id}
                        title={r.id === user?.id ? "You cannot delete yourself" : "Remove user"}
                        className="shrink-0 p-2 rounded-lg glass hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <UploadModeration />
          <DownloadsAnalytics />
          <AuditLog />
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

type UploadReview = {
  id: string;
  user_id: string;
  title: string;
  course_code: string;
  type: string;
  trimester: string | null;
  teacher: string | null;
  description: string | null;
  file_url: string;
  file_name: string;
  solution_url: string | null;
  status: string;
  created_at: string;
  uploader_name?: string | null;
  uploader_email?: string | null;
};

function UploadModeration() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rows, setRows] = useState<UploadReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<UploadReview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: uploads } = await supabase
      .from("uploads")
      .select("id, user_id, title, course_code, type, trimester, teacher, description, file_url, file_name, solution_url, status, created_at")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    const list = (uploads ?? []) as UploadReview[];
    const ids = Array.from(new Set(list.map((u) => u.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      list.forEach((u) => {
        const p = map.get(u.user_id);
        u.uploader_name = p?.full_name ?? null;
        u.uploader_email = p?.email ?? null;
      });
    }
    setRows(list);
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("uploads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Approved" : "Rejected");
    setPreview(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Permanently delete this upload?")) return;
    const { error } = await supabase.from("uploads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setPreview(null);
    load();
  };

  return (
    <div className="glass-card overflow-hidden mt-8">
      <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-bold">Upload requests</h2>
        </div>
        <div className="flex items-center gap-1 glass rounded-lg p-1 text-xs">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${tab === t ? "gradient-bg text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">No {tab} uploads.</div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="px-4 sm:px-6 py-4 flex items-center gap-3 flex-wrap hover:bg-white/5">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {r.course_code} · {r.type} {r.trimester ? `· ${r.trimester}` : ""} · by {r.uploader_name || r.uploader_email || "unknown"}
                </div>
              </div>
              <button onClick={() => setPreview(r)} className="px-3 py-1.5 rounded-lg glass text-xs inline-flex items-center gap-1.5 hover:bg-white/10">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              {tab !== "approved" && (
                <button onClick={() => setStatus(r.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs inline-flex items-center gap-1.5 hover:bg-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {tab !== "rejected" && (
                <button onClick={() => setStatus(r.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs inline-flex items-center gap-1.5 hover:bg-destructive/30">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg glass hover:bg-destructive/20 hover:text-destructive" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="glass-card w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="font-bold truncate">{preview.title}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {preview.course_code} · {preview.type} · {preview.uploader_email}
                </div>
                {preview.description && <div className="text-xs text-muted-foreground mt-2 max-w-2xl">{preview.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                {preview.status !== "approved" && (
                  <button onClick={() => setStatus(preview.id, "approved")} className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {preview.status !== "rejected" && (
                  <button onClick={() => setStatus(preview.id, "rejected")} className="px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-xs font-medium inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-lg glass text-xs">Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-black/40">
              <iframe src={preview.file_url} title={preview.title} className="w-full h-[70vh]" sandbox="" referrerPolicy="no-referrer" />
            </div>
            {preview.solution_url && (
              <div className="p-3 border-t border-border text-xs flex items-center justify-between">
                <span className="text-muted-foreground">Solution attached</span>
                <a href={preview.solution_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg glass hover:bg-white/10">Open solution</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type DownloadRow = {
  upload_id: string;
  title: string;
  course_code: string;
  total: number;
  unique_users: number;
  anonymous: number;
};

function DownloadsAnalytics() {
  const [rows, setRows] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: events } = await supabase
      .from("download_events")
      .select("upload_id, user_id")
      .limit(10000);
    const uploadIds = Array.from(new Set((events ?? []).map((e) => e.upload_id)));
    const { data: uploads } = uploadIds.length
      ? await supabase.from("uploads").select("id, title, course_code").in("id", uploadIds)
      : { data: [] as { id: string; title: string; course_code: string }[] };
    const uMap = new Map((uploads ?? []).map((u) => [u.id, u]));
    const agg = new Map<string, { total: number; users: Set<string>; anon: number }>();
    for (const e of events ?? []) {
      const a = agg.get(e.upload_id) ?? { total: 0, users: new Set<string>(), anon: 0 };
      a.total += 1;
      if (e.user_id) a.users.add(e.user_id);
      else a.anon += 1;
      agg.set(e.upload_id, a);
    }
    const out: DownloadRow[] = Array.from(agg.entries()).map(([id, a]) => {
      const u = uMap.get(id);
      return {
        upload_id: id,
        title: u?.title ?? "(deleted)",
        course_code: u?.course_code ?? "",
        total: a.total,
        unique_users: a.users.size,
        anonymous: a.anon,
      };
    }).sort((x, y) => y.total - x.total).slice(0, 50);
    setRows(out);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalDownloads = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="glass-card overflow-hidden mt-8">
      <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-bold">Downloads analytics</h2>
        </div>
        <div className="text-xs text-muted-foreground">Total tracked: <span className="gradient-text font-bold">{totalDownloads}</span></div>
      </div>
      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">No downloads recorded yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.upload_id} className="px-4 sm:px-6 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{r.title}</div>
                <div className="text-xs text-muted-foreground font-mono">{r.course_code}</div>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">{r.unique_users} users · {r.anonymous} anon</div>
              <div className="text-lg font-display font-bold gradient-text w-12 text-right">{r.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AuditRow = {
  id: string;
  admin_id: string;
  upload_id: string;
  action: string;
  previous_status: string | null;
  created_at: string;
  admin_name?: string | null;
  admin_email?: string | null;
  upload_title?: string | null;
};

function AuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("id, admin_id, upload_id, action, previous_status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (data ?? []) as AuditRow[];
    const adminIds = Array.from(new Set(list.map((r) => r.admin_id)));
    const uploadIds = Array.from(new Set(list.map((r) => r.upload_id)));
    const [{ data: admins }, { data: uploads }] = await Promise.all([
      adminIds.length ? supabase.from("profiles").select("id, full_name, email").in("id", adminIds) : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
      uploadIds.length ? supabase.from("uploads").select("id, title").in("id", uploadIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);
    const aMap = new Map((admins ?? []).map((a) => [a.id, a]));
    const uMap = new Map((uploads ?? []).map((u) => [u.id, u]));
    list.forEach((r) => {
      const a = aMap.get(r.admin_id);
      r.admin_name = a?.full_name ?? null;
      r.admin_email = a?.email ?? null;
      r.upload_title = uMap.get(r.upload_id)?.title ?? "(deleted)";
    });
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="glass-card overflow-hidden mt-8 mb-12">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-bold">Admin audit log</h2>
        <span className="text-xs text-muted-foreground ml-auto">Last 100 actions</span>
      </div>
      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">No admin actions recorded yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((r) => {
            const color = r.action === "approved" ? "text-emerald-400" : r.action === "rejected" ? "text-destructive" : "text-muted-foreground";
            return (
              <div key={r.id} className="px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap text-sm">
                <span className={`uppercase text-[10px] tracking-wider font-bold ${color} w-20`}>{r.action}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{r.upload_title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    by {r.admin_name || r.admin_email || r.admin_id.slice(0, 8)}
                    {r.previous_status ? ` · was ${r.previous_status}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
