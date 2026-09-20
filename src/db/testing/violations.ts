import { expect } from "vitest";

// SQLSTATE relevantes (https://www.postgresql.org/docs/current/errcodes-appendix.html).
export const UNIQUE_VIOLATION = "23505";
export const FOREIGN_KEY_VIOLATION = "23503";
export const RESTRICT_VIOLATION = "23001";

/**
 * SQLSTATE ao apagar uma linha referenciada por FK com ON DELETE RESTRICT. Depende
 * da versão do PostgreSQL: o 17 (usado no CI) levanta 23503 (foreign_key_violation)
 * e o 18 levanta 23001 (restrict_violation). O nome da constraint segue igual.
 */
export const DELETE_RESTRICT_VIOLATION = [
  FOREIGN_KEY_VIOLATION,
  RESTRICT_VIOLATION,
] as const;
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
  expected: { code: string | readonly string[]; constraint?: string },
) {
  const error = await Promise.resolve(operation).then(
    () => null,
    (caught: unknown) => caught ?? new Error("rejeitado sem erro"),
  );
  expect(error, "o banco deveria ter rejeitado a operação").not.toBeNull();

  const pgError = findPgError(error);
  expect(pgError, "erro do PostgreSQL não encontrado na cadeia").not.toBeNull();
  expect([expected.code].flat()).toContain(pgError?.code);
  if (expected.constraint) {
    expect(pgError?.constraint_name).toBe(expected.constraint);
  }
}
