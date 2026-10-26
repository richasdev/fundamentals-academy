import { test, expect } from "@playwright/test";

test("passos da consulta mudam cena, conteúdo e receptor e permitem revisitar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#database");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const scene = page.getByRole("region", { name: "Modelo do passo explicado" });
  await expect(scene.locator("canvas")).toBeVisible();
  await expect(scene).toHaveAttribute("data-step", "1");
  await expect(scene.locator('[data-delivery="received"]')).toContainText(
    "RAIZ",
  );
  await expect(scene.locator(".lesson-data-transfer code")).toHaveText("id=12");
  await page.getByRole("button", { name: "Ver passo 2 da explicação" }).click();
  await expect(scene).toHaveAttribute("data-focus", "root");
  await expect(scene.locator('[data-component="b"]')).toHaveAttribute(
    "data-highlight",
    "received",
  );
  await expect(scene.locator(".lesson-data-transfer code")).toHaveText(
    "buscar id=12",
  );
  await page.getByRole("button", { name: "Ver passo 3 da explicação" }).click();
  await expect(scene.locator(".lesson-data-transfer code")).toHaveText(
    "Pessoa 12",
  );
  await scene.getByRole("button", { name: "Repetir este fluxo" }).click();
  await expect(scene).toHaveAttribute("data-step", "3");
  await expect(scene.locator('[data-component="query"]')).toHaveAttribute(
    "data-highlight",
    "received",
  );
  await page
    .getByRole("button", { name: "← Passo anterior", exact: true })
    .click();
  await expect(scene.locator(".lesson-data-transfer code")).toHaveText(
    "buscar id=12",
  );
  await scene.getByRole("button", { name: "Ver diagrama do passo" }).click();
  await expect(scene.locator(".lesson-node-list")).toContainText(
    "id=12 encontrado",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});

test("anotações e investigações persistem por aula sem concluir a trilha", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#memory");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  await page
    .getByLabel("Minha previsão")
    .fill("POP deve devolver o último valor.");
  await page.getByLabel("Investigação 1 registrada").check();
  await page
    .getByRole("button", { name: "Próxima aula →", exact: true })
    .click();
  await expect(page.getByLabel("Minha previsão")).toHaveValue("");
  await page
    .getByRole("button", { name: "← Aula anterior", exact: true })
    .click();
  await expect(page.getByLabel("Minha previsão")).toHaveValue(
    "POP deve devolver o último valor.",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  await expect(page.getByLabel("Minha previsão")).toHaveValue(
    "POP deve devolver o último valor.",
  );
  await expect(page.getByLabel("Investigação 1 registrada")).toBeChecked();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fundamentals-progress-v1") || "{}")
          .state?.completed || [],
    ),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Abrir bancada de experimentos" })
    .click();
  await expect(page.getByRole("button", { name: "PUSH 2" })).toBeVisible();
});

test("pausa pertence ao passo atual e mensagem perdida não destaca receptor", async ({
  page,
}) => {
  await page.goto("/#architecture");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const scene = page.getByRole("region", { name: "Modelo do passo explicado" });
  await expect(scene.locator("canvas")).toBeVisible();
  await scene.getByRole("button", { name: "Pausar fluxo" }).click();
  await expect(
    scene.getByRole("button", { name: "Continuar fluxo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver passo 2 da explicação" }).click();
  await expect(
    scene.getByRole("button", { name: "Pausar fluxo" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Próxima aula →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Próxima aula →", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver passo 2 da explicação" }).click();
  await expect(scene.locator('[data-delivery="lost"]')).toBeVisible({
    timeout: 15000,
  });
  await expect(scene.locator('[data-highlight="received"]')).toHaveCount(0);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
