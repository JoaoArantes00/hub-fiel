import { z } from "zod";

/**
 * Variáveis de ambiente do servidor (nenhuma usa NEXT_PUBLIC_, logo nada vai
 * para o bundle do navegador).
 *
 * Fase 0: só DATABASE_URL é consumida. As demais já são validadas quando
 * presentes, mas ficam opcionais até a fase que passa a usá-las.
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string({ error: "variável obrigatória" })
    .refine(
      (value) => /^postgres(ql)?:\/\//.test(value),
      "deve começar com postgres:// ou postgresql://",
    ),
  API_FOOTBALL_KEY: z.string().min(1).optional(),
  CRON_SECRET: z
    .string()
    .min(16, "deve ter no mínimo 16 caracteres")
    .optional(),
  ADMIN_EMAIL: z.email().optional(),
});

export type Env = z.infer<typeof envSchema>;

type EnvSource = Record<string, string | undefined>;

/**
 * Erro de configuração. A mensagem lista apenas o NOME das variáveis e o
 * motivo da falha, nunca os valores recebidos.
 */
export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Variáveis de ambiente inválidas:\n- ${issues.join("\n- ")}`);
    this.name = "EnvValidationError";
  }
}

/**
 * Valida um objeto de ambiente. Strings vazias contam como ausentes, para que
 * `API_FOOTBALL_KEY=` no .env (como no .env.example) equivalha a "não definida".
 */
export function parseEnv(source: EnvSource): Env {
  const cleaned: EnvSource = {};
  for (const key of Object.keys(envSchema.shape)) {
    const value = source[key];
    cleaned[key] = value === "" ? undefined : value;
  }

  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(env)"}: ${issue.message}`,
      ),
    );
  }
  return result.data;
}

let cached: Env | undefined;

/**
 * Lê e valida `process.env` na primeira chamada. É lazy de propósito: `next
 * build` importa módulos de rota e não deve exigir variáveis de runtime.
 */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
