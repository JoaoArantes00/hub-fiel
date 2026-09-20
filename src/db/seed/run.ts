import { loadEnvConfig } from "@next/env";
import { getDb } from "../index";
import { seedInitialData } from "./seed";

// Executado fora do Next (npm run db:seed): carrega .env.local/.env como o Next.
loadEnvConfig(process.cwd());

async function main() {
  const db = getDb();
  try {
    const result = await seedInitialData(db);
    console.log(
      `Seed concluído. Criados agora: ${result.clubs} club(s), ${result.teams} team(s), ${result.positions} posição(ões).`,
    );
    if (result.clubs + result.teams + result.positions === 0) {
      console.log("Nada a criar: os dados iniciais já existiam.");
    }
  } finally {
    await db.$client.end();
  }
}

main().catch((error: unknown) => {
  console.error("Falha ao executar o seed:", error);
  process.exitCode = 1;
});
