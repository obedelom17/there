import { neon } from "@neondatabase/serverless";

let ready: Promise<unknown> | undefined;

export function getSql() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("Variable manquante : DATABASE_URL (chaîne de connexion Neon)");
  const sql = neon(url);
  // La table est créée automatiquement au premier appel.
  ready ??= sql`CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    answer TEXT NOT NULL DEFAULT 'oui',
    no_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`.catch((e) => { ready = undefined; throw e; });
  return { sql, ready };
}
