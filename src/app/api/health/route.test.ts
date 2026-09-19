import { afterEach, describe, expect, it, vi } from "vitest";

const pingDatabase = vi.fn<() => Promise<void>>();
vi.mock("@/db", () => ({ pingDatabase }));

const { GET } = await import("./route");

afterEach(() => {
  vi.restoreAllMocks();
  pingDatabase.mockReset();
});

describe("GET /api/health", () => {
  it("retorna 200 no envelope { data, meta } quando o banco responde", async () => {
    pingDatabase.mockResolvedValue();

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { status: "ok", database: "up" },
      meta: {},
    });
  });

  it("retorna 503 no envelope { error } sem vazar detalhes quando o banco falha", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    pingDatabase.mockRejectedValue(
      new Error("connect ECONNREFUSED postgres://user:secret-pw@db:5432/x"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Banco de dados indisponível",
      },
    });
    expect(JSON.stringify(body)).not.toContain("secret-pw");
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
