import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resetResponses } from "@/lib/admin.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Réponse de Thérèse — Admin" },
      { name: "description", content: "Suivi de la réponse à la demande en mariage." },
      { property: "og:title", content: "Réponse de Thérèse" },
      { property: "og:description", content: "Suivi de la réponse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Row = { id: string; answer: string; no_attempts: number; created_at: string };

function Admin() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = () =>
    supabase.from("responses").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Row[]) ?? []));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = async () => {
    setResetting(true);
    setError(null);
    try {
      await resetResponses();
      setRows([]);
    } catch {
      setError("Impossible de réinitialiser la réponse. Réessaie.");
    } finally {
      setResetting(false);
    }
  };

  const said = rows && rows.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-gold">Espace de Wilfried</p>
      {rows === null ? (
        <p className="mt-10 font-display text-2xl italic text-muted-foreground">Chargement…</p>
      ) : said ? (
        <>
          <div className="mt-8 text-7xl animate-pulse-heart">💍</div>
          <h1 className="mt-4 font-script text-6xl md:text-8xl text-love">Elle a dit OUI !</h1>
          <p className="mt-6 font-display text-xl italic text-muted-foreground">
            Le {new Date(rows[0]!.created_at).toLocaleString("fr-FR")}
          </p>
          <p className="mt-2 text-muted-foreground">
            Elle a tenté d'attraper « Non » {rows[0]!.no_attempts} fois 😄
          </p>
          {rows.length > 1 && (
            <p className="mt-6 text-sm text-muted-foreground">{rows.length} « oui » enregistrés au total</p>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={resetting}
                className="mt-10 rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                {resetting ? "Réinitialisation…" : "Réinitialiser la réponse"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser la réponse ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Toutes les réponses enregistrées seront supprimées définitivement. Thérèse pourra répondre à nouveau.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={reset}>Réinitialiser</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </>
      ) : (
        <>
          <div className="mt-8 text-6xl">⏳</div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Pas encore de réponse…</h1>
          <p className="mt-4 font-display text-xl italic text-muted-foreground">
            Patience, les plus belles réponses prennent leur temps.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">Actualisation automatique toutes les 5 secondes</p>
        </>
      )}
    </main>
  );
}
