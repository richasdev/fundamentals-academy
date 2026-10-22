import { test, expect } from "@playwright/test";

test("mapa abre as nove trilhas sem áreas em breve", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#map");
  await expect(page.locator(".knowledge-map article")).toHaveCount(9);
  await expect(page.locator(".knowledge-map button")).toHaveCount(9);
  await expect(page.locator(".knowledge-map")).not.toContainText("Em breve");
  await page
    .locator(".knowledge-map article")
    .first()
    .getByRole("button", { name: "Explorar" })
    .click();
  await expect(page).toHaveURL(/#logic$/);
  await expect(
    page.getByRole("tab", { name: /^Arquitetura/ }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});

for (const [id, title, answer] of [
  ["logic", "Tudo começa com um bit.", "0"],
  ["os", "Uma CPU, vários processos.", "Volta ao fim da fila de prontos"],
  [
    "infra",
    "Quem responde à próxima requisição?",
    "A borda devolve a resposta armazenada",
  ],
  ["database", "Encontre uma linha sem ler tudo.", "B: de 8 até antes de 16"],
  ["compiler", "Do texto à execução.", "14"],
  ["architecture", "Uma escrita precisa sobreviver a falhas.", "Duas"],
]) {
  test(`trilha ${id}: 3D, aulas, desafio e persistência`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/#${id}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".three-scene canvas")).toBeVisible();
    await page
      .getByLabel("Inspecionar componente 3D")
      .selectOption({ index: 1 });
    await expect(page.locator(".scene-inspector")).not.toContainText(
      "Arraste para orbitar",
    );
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
    await expect(
      page.locator(".workshop-flow .flow-delivery.received"),
    ).toContainText("recebeu");
    await page
      .getByRole("button", { name: "Entender o conceito", exact: true })
      .click();
    await expect(
      page
        .getByRole("navigation", { name: "Aulas desta trilha" })
        .getByRole("button"),
    ).toHaveCount(3);
    await page
      .getByRole("button", { name: "Próxima aula →", exact: true })
      .click();
    await expect(page.locator(".reading-panel .eyebrow")).toContainText(
      "AULA 2 DE 3",
    );
    await page
      .getByRole("button", { name: "Próxima aula →", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Ir para o desafio →", exact: true })
      .click();
    await page
      .locator(".quiz-options")
      .getByRole("button", { name: answer, exact: true })
      .click();
    await expect(page.locator(".reading-panel [role=status]")).toContainText(
      "Correto!",
    );
    await page.reload();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("fundamentals-progress-v1") || "{}")
              .state?.completed,
        ),
      )
      .toContain(id);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
    expect(errors).toEqual([]);
  });
}

test("compilador valida entrada, executa resultado e permite voltar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#compiler");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await page.getByLabel("Expressão", { exact: true }).fill("2 +");
  await page.getByRole("button", { name: "Compilar expressão" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível compilar",
  );
  await expect(
    page.getByRole("button", { name: "Executar", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Expressão", { exact: true }).fill("(2 + 3) * 4");
  await page.getByRole("button", { name: "Compilar expressão" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  for (let i = 0; i < 8; i++)
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(page.locator(".status-bar")).toContainText("Resultado = 20");
  await page
    .getByRole("button", { name: "Voltar um passo", exact: true })
    .click();
  await expect(page.locator(".status-bar")).not.toContainText("Resultado = 20");
});

test("progresso aceita nove trilhas e exportações antigas", async ({
  page,
}) => {
  await page.goto("/#map");
  const input = page.locator("input[type=file]");
  await input.setInputFiles({
    name: "antigo.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, completed: ["cpu", "memory", "network"] }),
    ),
  });
  await expect(page.locator(".progress-heading")).toContainText("33%");
  await input.setInputFiles({
    name: "todos.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        completed: [
          "logic",
          "cpu",
          "memory",
          "os",
          "network",
          "infra",
          "database",
          "compiler",
          "architecture",
        ],
      }),
    ),
  });
  await expect(page.locator(".progress-heading")).toContainText("100%");
  await page.reload();
  await expect(page.locator(".progress-heading")).toContainText("100%");
});

test("parâmetros alteram cache, custo da consulta e confirmação da escrita", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const finish = async () => {
    const next = page.getByRole("button", {
      name: "Próximo passo",
      exact: true,
    });
    for (let i = 0; i < 20 && (await next.isEnabled()); i++) await next.click();
    await expect(next).toBeDisabled();
  };
  await page.goto("/#infra");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish();
  await expect(page.locator(".status-bar")).toContainText(
    "1 visitas à origem · 1 HIT",
  );
  await page.getByLabel("Cache na borda").uncheck();
  await page.getByLabel("APP A indisponível").check();
  await finish();
  await expect(page.locator(".status-bar")).toContainText(
    "2 visitas à origem · 0 HIT",
  );
  await page.getByRole("tab", { name: "Bancos de dados" }).click();
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish();
  await expect(page.locator(".status-bar")).toContainText(
    "1 página(s) de dados + raiz",
  );
  await page.getByLabel("Usar índice").uncheck();
  await finish();
  await expect(page.locator(".status-bar")).toContainText(
    "3 página(s) de dados",
  );
  await page.getByLabel("Chave procurada").fill("7");
  await finish();
  await expect(page.locator(".status-bar")).toContainText("0 linhas");
  await page.getByRole("tab", { name: /^Arquitetura/ }).click();
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await page.getByLabel("Réplicas indisponíveis").selectOption("2");
  await finish();
  await expect(page.locator(".status-bar")).toContainText("SEM QUÓRUM");
  await page.getByLabel("Réplicas indisponíveis").selectOption("1");
  await finish();
  await expect(page.locator(".status-bar")).toContainText("COMMIT · 2/3");
});
