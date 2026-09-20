import { expect } from "vitest";

// SQLSTATE relevantes (https://www.postgresql.org/docs/current/errcodes-appendix.html).
export const UNIQUE_VIOLATION = "23505";
export const FOREIGN_KEY_VIOLATION = "23503";
// ON DELETE RESTRICT levanta 23001 (restrict_violation); 23503 é do NO ACTION.
export const RESTRICT_VIOLATION = "23001";
export const CHECK_VIOLATION = "23514";
export const INVALID_ENUM_VALUE = "22P02";

type PgErrorLike = { code?: string; constraint_name?: string };

/** O Drizzle embrulha o erro do driver em `cause`; desce até achar o do Postgres. */
function findPgError(error: unknown): PgErrorLike | null {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && typeof current.code === "string") {
      return current as PgErrorLike;
    }
    current = "cause" in current ? current.cause : null;
  }
  return null;
}

/**
 * Afirma que o banco rejeitou a operação com o SQLSTATE (e, se informado, a
 * constraint) esperados. Validar o nome da constraint garante que a regra
 * certa foi a que barrou, e não outra por acidente.
 */
export async function expectViolation(
  operation: PromiseLike<unknown>,
  expected: { code: string; constraint?: string },
) {
  const error = await Promise.resolve(operation).then(
    () => null,
    (caught: unknown) => caught ?? new Error("rejeitado sem erro"),
  );
  expect(error, "o banco deveria ter rejeitado a operação").not.toBeNull();

  const pgError = findPgError(error);
  expect(pgError, "erro do PostgreSQL não encontrado na cadeia").not.toBeNull();
  expect(pgError?.code).toBe(expected.code);
  if (expected.constraint) {
    expect(pgError?.constraint_name).toBe(expected.constraint);
  }
}
