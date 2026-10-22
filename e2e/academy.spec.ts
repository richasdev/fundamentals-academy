import { test, expect } from "@playwright/test";
test("bancadas 3D têm inspeção acessível e controles espaciais", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lab of ["cpu", "memory", "network"]) {
    await page.goto("/#" + lab);
    await expect(page.locator("canvas")).toBeVisible();
    const inspector = page.getByLabel("Inspecionar componente 3D");
    await expect(inspector).toBeVisible();
    await inspector.selectOption({ index: 1 });
    await expect(page.locator(".scene-inspector")).not.toContainText(
      "Selecione uma peça",
    );
    await page
      .getByRole("button", { name: "Girar cena para a direita" })
      .click();
    await expect(page.getByLabel("Separar componentes 3D")).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
  }
  expect(errors).toEqual([]);
});
test("CPU executa, desafio salva progresso e navegação funciona", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Como um programa ganha vida?" }),
  ).toBeVisible();
  for (let i = 0; i < 12; i++)
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(page.getByRole("status")).toContainText("HALT");
  await expect(
    page.getByRole("button", { name: "Próximo passo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Desafio 1" }).click();
  await page.getByRole("button", { name: "8", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correto!");
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("fundamentals-progress-v1") || "{}")
            .state.completed,
      ),
    )
    .toContain("cpu");
  await page.getByRole("tab", { name: "Memória" }).click();
  await page.getByRole("button", { name: "malloc(4)" }).click();
  await expect(page.getByRole("status")).toContainText("0x00");
  await page.getByRole("button", { name: "PUSH 4" }).click();
  await expect(page.getByRole("status")).toContainText("0x1f");
  await page.getByRole("tab", { name: "Redes & HTTP" }).click();
  await page.getByLabel("DNS em cache").check();
  await page.getByLabel("Perder o primeiro SYN").check();
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(page.getByRole("status")).toContainText("Resposta recebida");
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("busca, glossário e retorno de estado", async ({ page }) => {
  await page.goto("/#glossary");
  await page
    .getByRole("textbox", { name: "Buscar conceitos" })
    .fill("Acumulador");
  await page.locator(".search-results button").click();
  await expect(
    page.getByRole("heading", { name: "Como um programa ganha vida?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Voltar um passo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Pronto.");
});
