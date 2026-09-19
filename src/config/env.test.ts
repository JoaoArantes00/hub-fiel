import { describe, expect, it } from "vitest";
import { EnvValidationError, parseEnv } from "./env";

const validUrl = "postgresql://user:secret-pw@localhost:5432/hub_fiel";

describe("parseEnv", () => {
  it("aceita apenas DATABASE_URL (demais variáveis são opcionais na Fase 0)", () => {
    const env = parseEnv({ DATABASE_URL: validUrl });
    expect(env.DATABASE_URL).toBe(validUrl);
    expect(env.API_FOOTBALL_KEY).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.ADMIN_EMAIL).toBeUndefined();
  });

  it("aceita o esquema postgres:// além de postgresql://", () => {
    expect(() =>
      parseEnv({ DATABASE_URL: "postgres://u:p@localhost:5432/db" }),
    ).not.toThrow();
  });

  it("aceita todas as variáveis quando válidas", () => {
    const env = parseEnv({
      DATABASE_URL: validUrl,
      API_FOOTBALL_KEY: "some-key",
      CRON_SECRET: "a-secret-with-16+chars",
      ADMIN_EMAIL: "admin@example.com",
    });
    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
  });

  it("trata string vazia como ausente (como no .env.example)", () => {
    const env = parseEnv({
      DATABASE_URL: validUrl,
      API_FOOTBALL_KEY: "",
      CRON_SECRET: "",
      ADMIN_EMAIL: "",
    });
    expect(env.API_FOOTBALL_KEY).toBeUndefined();
    expect(env.CRON_SECRET).toBeUndefined();
    expect(env.ADMIN_EMAIL).toBeUndefined();
  });

  it("falha quando DATABASE_URL está ausente ou vazia", () => {
    expect(() => parseEnv({})).toThrow(EnvValidationError);
    expect(() => parseEnv({ DATABASE_URL: "" })).toThrow(EnvValidationError);
  });

  it("falha quando DATABASE_URL não é uma URL postgres", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/db" })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("falha para CRON_SECRET curto e ADMIN_EMAIL inválido", () => {
    expect(() =>
      parseEnv({ DATABASE_URL: validUrl, CRON_SECRET: "curto" }),
    ).toThrow(/CRON_SECRET/);
    expect(() =>
      parseEnv({ DATABASE_URL: validUrl, ADMIN_EMAIL: "nao-e-email" }),
    ).toThrow(/ADMIN_EMAIL/);
  });

  it("não vaza valores das variáveis na mensagem de erro", () => {
    try {
      parseEnv({
        DATABASE_URL: "mysql://user:secret-pw@localhost/db",
        CRON_SECRET: "curto-e-secreto",
      });
      expect.unreachable("deveria ter lançado EnvValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const message = (error as Error).message;
      expect(message).not.toContain("secret-pw");
      expect(message).not.toContain("curto-e-secreto");
    }
  });
});
