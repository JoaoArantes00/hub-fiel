import { expect, test } from "@playwright/test";

test("página inicial provisória renderiza", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Plataforma Corinthiana" }),
  ).toBeVisible();
});

test("health check responde ok com o banco conectado", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    data: { status: "ok", database: "up" },
    meta: {},
  });
});
