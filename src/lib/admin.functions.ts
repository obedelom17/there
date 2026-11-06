import { createServerFn } from "@tanstack/react-start";

export type Row = { id: number; answer: string; no_attempts: number; created_at: string };

async function db() {
  const { getSql } = await import("./db.server");
  const { sql, ready } = getSql();
  await ready;
  return sql;
}

// Appelé quand Thérèse clique sur « Oui ».
export const saveYes = createServerFn({ method: "POST" })
  .inputValidator((d: { noAttempts: number }) => ({
    noAttempts: Math.max(0, Math.min(99999, Math.floor(Number(d.noAttempts) || 0))),
  }))
  .handler(async ({ data }) => {
    const sql = await db();
    await sql`INSERT INTO responses (answer, no_attempts) VALUES ('oui', ${data.noAttempts})`;
    return { ok: true };
  });

export const getResponses = createServerFn({ method: "GET" }).handler(async (): Promise<Row[]> => {
  const sql = await db();
  const rows = await sql`SELECT id, answer, no_attempts, created_at FROM responses ORDER BY created_at DESC`;
  return rows.map((r) => ({ ...r, created_at: new Date(r["created_at"] as string).toISOString() })) as Row[];
});

export const resetResponses = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await db();
  await sql`DELETE FROM responses`;
  return { ok: true };
});
