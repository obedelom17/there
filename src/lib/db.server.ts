import { neon } from "@neondatabase/serverless";

let ready: Promise<unknown> | undefined;

// Retrouve la chaîne de connexion Neon, quel que soit le nom donné par Vercel
// (DATABASE_URL, POSTGRES_URL, STORAGE_URL, ...).
function findDatabaseUrl(): string | undefined {
  const preferred = ["DATABASE_URL", "POSTGRES_URL", "STORAGE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
  for (const k of preferred) {
    const v = process.env[k];
    if (v && v.startsWith("postgres")) return v;
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (v && /^postgres(ql)?:\/\//.test(v) && !k.includes("PRISMA")) return v;
  }
  return undefined;
}

export function getSql() {
  const url = findDatabaseUrl();
  if (!url) throw new Error("Aucune chaîne de connexion Neon trouvée (DATABASE_URL). Vérifie les variables d'environnement Vercel et redéploie.");
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
