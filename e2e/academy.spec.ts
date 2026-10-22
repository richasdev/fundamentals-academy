import { test, expect } from "@playwright/test";
test("abertura apresenta as trilhas sem displays decorativos", async ({
  page,
}) => {
  await page.goto("/#map");
  await expect(
    page.getByRole("heading", { name: "Ciência da computação", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".retro-display, .dev-intro")).toHaveCount(0);
  await expect(page.locator(".learning-level article")).toHaveCount(9);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("tema claro e escuro persistem entre visitas", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/#map");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("fluxos identificam origem, destino e handshake sem alterar o estado ao rever", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-readout")).toContainText("IR");
  await expect(page.locator(".flow-delivery.received")).toContainText(
    "IR recebeu: LOAD [0x08]",
  );
  await page.getByRole("tab", { name: "Memória" }).click();
  await page.getByRole("button", { name: "PUSH 4" }).click();
  await expect(page.locator(".flow-readout")).toContainText("Memória 0x1f");
  await page.getByRole("tab", { name: "Redes & HTTP" }).click();
  await page.getByLabel("DNS em cache").check();
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-readout code")).toContainText(
    "SYN · seq=100",
  );
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-readout code")).toContainText("SYN-ACK");
  await expect(page.locator(".flow-readout strong")).toContainText(
    "Servidor → Cliente",
  );
  const status = await page.locator(".status-bar").textContent();
  await page.getByRole("button", { name: "Rever fluxo" }).click();
  await expect(page.locator(".status-bar")).toHaveText(status || "");
  await expect(page.locator(".flow-delivery.received")).toContainText(
    "Cliente recebeu: SYN-ACK",
  );
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-readout code")).toContainText(
    "ACK=501 + GET /",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("bancadas 3D têm inspeção acessível e controles espaciais", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lab of ["cpu", "memory", "network"]) {
    await page.goto("/#" + lab);
    await expect(page.locator(".three-scene canvas")).toBeVisible();
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
  // Este fluxo verifica estado e persistência sem depender do ritmo da GPU do CI.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Como um programa ganha vida?" }),
  ).toBeVisible();
  for (let i = 0; i < 12; i++)
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(page.locator(".status-bar")).toContainText("HALT");
  await expect(
    page.getByRole("button", { name: "Próximo passo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Desafio 1" }).click();
  await page.getByRole("button", { name: "8", exact: true }).click();
  await expect(page.locator('.reading-panel [role="status"]')).toContainText(
    "Correto!",
  );
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
  await expect(page.locator(".status-bar")).toContainText("0x00");
  await page.getByRole("button", { name: "PUSH 4" }).click();
  await expect(page.locator(".status-bar")).toContainText("0x1f");
  await page.getByRole("tab", { name: "Redes & HTTP" }).click();
  await page.getByLabel("DNS em cache").check();
  await page.getByLabel("Perder o primeiro SYN").check();
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(page.locator(".status-bar")).toContainText("Resposta recebida");
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
  await expect(page.locator(".status-bar")).toContainText("Pronto.");
});

test("entrega visual só confirma na chegada e não confirma um SYN perdido", async ({
  page,
}) => {
  await page.goto("/#network");
  await page.getByLabel("DNS em cache").check();
  await page.getByLabel("Velocidade", { exact: true }).selectOption("0.5");
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-delivery.transit")).toContainText(
    "Cliente → Servidor",
  );
  await expect(page.locator(".flow-delivery.received")).toContainText(
    "Servidor recebeu: SYN · seq=100",
    { timeout: 20000 },
  );
  await page.getByRole("button", { name: "Rever fluxo" }).click();
  await expect(page.locator(".flow-delivery.transit")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByLabel("Perder o primeiro SYN").check();
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".flow-delivery.lost")).toContainText(
    "nenhum componente recebeu",
  );
  await expect(page.locator(".flow-delivery.received")).toHaveCount(0);
});
