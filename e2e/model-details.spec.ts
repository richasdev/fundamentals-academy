import { test, expect } from "@playwright/test";
test("percurso manual altera o receptor somente na entrega e permite desfazer a entrega visual", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver passo 3 da explicação" }).click();
  const scene = page.getByRole("region", { name: "Modelo do passo explicado" });
  await scene
    .getByRole("button", { name: "Percorrer fluxo manualmente" })
    .click();
  const slider = scene.getByRole("slider", {
    name: "Posição do dado no fluxo",
  });
  await slider.focus();
  await slider.press("Home");
  await expect(scene.locator('[data-component="acc"] code')).toHaveText("0");
  await slider.press("End");
  await expect(scene.locator('[data-component="acc"]')).toHaveAttribute(
    "data-highlight",
    "received",
  );
  await expect(scene.locator('[data-component="acc"] code')).toHaveText("5");
  await slider.press("ArrowLeft");
  await expect(scene.locator('[data-component="acc"]')).toHaveAttribute(
    "data-highlight",
    "waiting",
  );
  await expect(scene.locator('[data-component="acc"] code')).toHaveText("0");
  await scene
    .getByText("Comparar os estados deste passo", { exact: true })
    .click();
  await expect(scene.locator(".state-comparison tbody")).toContainText(
    "aguardando concluir",
  );
  await slider.focus();
  await slider.press("End");
  await expect(scene.locator(".state-comparison tbody")).toContainText("5");
  await scene.getByRole("button", { name: "Repetir este fluxo" }).click();
  await expect(slider).toHaveValue("0");
  await expect(scene.locator('[data-highlight="received"]')).toHaveCount(0);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("inspeção explica partes e permite abrir camadas sem mudar o resultado", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#database");
  await expect(page.locator(".three-scene canvas")).toBeVisible();
  await page.getByText("Inspecionar e ajustar modelo", { exact: true }).click();
  await page.getByLabel("Inspecionar componente 3D").selectOption("b");
  const anatomy = page.getByRole("region", {
    name: "Anatomia do componente selecionado",
  });
  await expect(anatomy).toContainText("chaves 8, 10 e 12");
  await expect(anatomy.locator("dt")).toHaveCount(3);
  const layers = page.getByRole("slider", {
    name: "Abrir camadas do componente",
  });
  await layers.focus();
  await layers.press("End");
  await expect(layers).toHaveValue("1");
  await page.getByRole("button", { name: "Enquadrar componente" }).click();
  await expect(page.locator(".workshop-values")).toContainText("8 · 10 · 12");
  await page.getByRole("button", { name: "Redefinir vista" }).click();
  await expect(layers).toHaveValue("0");
  await page.getByRole("tab", { name: "CPU & execução" }).click();
  await page.getByRole("slider", { name: "Abrir camadas internas" }).focus();
  await page
    .getByRole("slider", { name: "Abrir camadas internas" })
    .press("End");
  await page.getByText("Entenda as partes do modelo", { exact: true }).click();
  await expect(page.locator(".component-anatomy")).toContainText(
    "Dissipador e tampa",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  expect(errors).toEqual([]);
});
test("percurso manual perdido não fabrica recebimento mesmo em 100%", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#architecture");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  for (let i = 0; i < 2; i++)
    await page
      .getByRole("button", { name: "Próxima aula →", exact: true })
      .click();
  await page.getByRole("button", { name: "Ver passo 2 da explicação" }).click();
  const scene = page.getByRole("region", { name: "Modelo do passo explicado" });
  await scene
    .getByRole("button", { name: "Percorrer fluxo manualmente" })
    .click();
  await scene.getByRole("slider", { name: "Posição do dado no fluxo" }).focus();
  await scene
    .getByRole("slider", { name: "Posição do dado no fluxo" })
    .press("End");
  await expect(scene.locator('[data-delivery="lost"]')).toHaveText(
    "Sem entrega",
  );
  await expect(scene.locator('[data-highlight="received"]')).toHaveCount(0);
  await expect(
    scene.getByRole("region", { name: "Mecanismo desta etapa" }),
  ).toContainText("silêncio em aprovação");
});
