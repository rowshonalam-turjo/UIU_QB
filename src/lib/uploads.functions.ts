import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddSolutionInput = z.object({
  upload_id: z.string().uuid(),
  solution_url: z.string().url(),
  solution_path: z.string().min(1).max(500),
  solution_name: z.string().min(1).max(255),
});

export const addSolutionToUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AddSolutionInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Only attach if approved and no solution exists yet
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("uploads")
      .select("id, status, solution_url")
      .eq("id", data.upload_id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!existing) throw new Error("Upload not found");
    if (existing.status !== "approved") throw new Error("Upload is not approved");
    if (existing.solution_url) throw new Error("A solution is already attached");

    const { error: updErr } = await supabaseAdmin
      .from("uploads")
      .update({
        solution_url: data.solution_url,
        solution_path: data.solution_path,
        solution_name: data.solution_name,
      })
      .eq("id", data.upload_id)
      .is("solution_url", null);
    if (updErr) throw new Error(updErr.message);

    return { ok: true };
  });
