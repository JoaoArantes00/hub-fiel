import { afterAll, describe, expect, it } from "vitest";
import { getDb, pingDatabase } from "./index";

// Só roda com um PostgreSQL real acessível (DATABASE_URL definida no ambiente,
// como no CI). Sem DATABASE_URL, o teste aparece como "skipped".
describe.skipIf(!process.env.DATABASE_URL)("conexão com PostgreSQL", () => {
  afterAll(async () => {
    await getDb().$client.end();
  });

  it("pingDatabase conecta e executa uma query", async () => {
    await expect(pingDatabase()).resolves.toBeUndefined();
  });

  it("getDb devolve sempre a mesma instância", () => {
    expect(getDb()).toBe(getDb());
  });
});
