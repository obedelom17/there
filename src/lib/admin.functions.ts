import { createServerFn } from "@tanstack/react-start";

// Supprime toutes les réponses (service role : la RLS n'autorise pas DELETE côté client).
export const resetResponses = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("responses")
    .delete()
    .not("id", "is", null);
  if (error) throw new Error(error.message);
  return { ok: true };
});
