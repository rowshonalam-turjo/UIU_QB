import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddSolutionInput = z.object({
  upload_id: z.string().uuid(),
  solution_url: z.string().url(),
  solution_path: z.string().min(1).max(500),
  solution_name: z.string().min(1).max(255),
});

/**
 * Submit a solution for admin review. Stores it in the pending_* fields on the
 * upload; an admin must approve before it becomes the published solution.
 */
export const addSolutionToUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AddSolutionInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("uploads")
      .select("id, status, solution_url, pending_solution_url")
      .eq("id", data.upload_id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!existing) throw new Error("Upload not found");
    if (existing.status !== "approved") throw new Error("Upload is not approved");
    if (existing.solution_url) throw new Error("A solution is already attached");
    if (existing.pending_solution_url) throw new Error("A solution is already awaiting review");

    const { error: updErr } = await supabaseAdmin
      .from("uploads")
      .update({
        pending_solution_url: data.solution_url,
        pending_solution_path: data.solution_path,
        pending_solution_name: data.solution_name,
        pending_solution_user_id: context.userId,
        pending_solution_submitted_at: new Date().toISOString(),
      })
      .eq("id", data.upload_id)
      .is("solution_url", null)
      .is("pending_solution_url", null);
    if (updErr) throw new Error(updErr.message);

    return { ok: true, status: "pending" as const };
  });

const ReviewInput = z.object({ upload_id: z.string().uuid() });

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admins only");
}

export const approvePendingSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(supabaseAdmin, context.userId);

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("uploads")
      .select("id, solution_url, pending_solution_url, pending_solution_path, pending_solution_name")
      .eq("id", data.upload_id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!existing) throw new Error("Upload not found");
    if (!existing.pending_solution_url) throw new Error("No pending solution to approve");
    if (existing.solution_url) throw new Error("A solution is already published");

    const { error: updErr } = await supabaseAdmin
      .from("uploads")
      .update({
        solution_url: existing.pending_solution_url,
        solution_path: existing.pending_solution_path,
        solution_name: existing.pending_solution_name,
        pending_solution_url: null,
        pending_solution_path: null,
        pending_solution_name: null,
        pending_solution_user_id: null,
        pending_solution_submitted_at: null,
      })
      .eq("id", data.upload_id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });

export const rejectPendingSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(supabaseAdmin, context.userId);

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("uploads")
      .select("id, pending_solution_path")
      .eq("id", data.upload_id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!existing) throw new Error("Upload not found");

    if (existing.pending_solution_path) {
      // best-effort cleanup of storage file
      await supabaseAdmin.storage.from("questions").remove([existing.pending_solution_path]).catch(() => {});
    }

    const { error: updErr } = await supabaseAdmin
      .from("uploads")
      .update({
        pending_solution_url: null,
        pending_solution_path: null,
        pending_solution_name: null,
        pending_solution_user_id: null,
        pending_solution_submitted_at: null,
      })
      .eq("id", data.upload_id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });
