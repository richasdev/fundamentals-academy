import { test, expect } from "@playwright/test";
test("mapa apresenta fundamental, intermediário e avançado com três trilhas cada", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#map");
  await expect(page.locator(".level-heading h2")).toHaveText([
    "Fundamental",
    "Intermediário",
    "Avançado",
  ]);
  const expected = [
    [
      "Fundamental",
      ["Fundamentos da computação", "Hardware e arquitetura", "Memória"],
    ],
    [
      "Intermediário",
      [
        "Sistemas operacionais e Linux",
        "Redes de computadores",
        "Bancos de dados",
      ],
    ],
    [
      "Avançado",
      [
        "Baixo nível e compiladores",
        "Servidores e infraestrutura",
        "Engenharia e arquitetura",
      ],
    ],
  ] as const;
  for (const [name, titles] of expected) {
    const level = page.getByRole("region", { name, exact: true });
    await expect(level.locator("article h2")).toHaveText([...titles]);
    await expect(level.locator(".level-readiness")).toBeVisible();
  }
  await page
    .getByRole("navigation", { name: "Níveis de aprendizado" })
    .getByRole("link", { name: /Avançado/ })
    .click();
  await expect(page).toHaveURL(/#map$/);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("nível e pré-requisitos acompanham a trilha escolhida", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#infra");
  await expect(page.locator(".difficulty")).toContainText("Avançado");
  await expect(page.locator(".track-overview li")).toHaveCount(3);
  await page
    .locator(".prerequisite-links")
    .getByRole("button", { name: /Bancos de dados/ })
    .click();
  await expect(page).toHaveURL(/#database$/);
  await expect(page.locator(".difficulty")).toContainText("Intermediário");
  await page
    .locator(".prerequisite-links")
    .getByRole("button", { name: /Memória/ })
    .click();
  await expect(page.locator(".difficulty")).toContainText("Fundamental");
});
test("aulas têm exemplos, estados e exercícios resolvidos em todos os níveis", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["cpu", "network", "architecture"]) {
    await page.goto(`/#${id}`);
    await page
      .getByRole("button", { name: "Entender o conceito", exact: true })
      .click();
    for (let chapter = 0; chapter < 3; chapter++) {
      await expect(page.locator(".reading-panel > .eyebrow")).toContainText(
        `AULA ${chapter + 1} DE 3`,
      );
      await expect(page.locator(".chapter-objective p")).not.toBeEmpty();
      await expect(page.locator(".worked-example code")).not.toBeEmpty();
      await expect(page.locator(".lesson-trace tbody tr")).toHaveCount(3);
      await expect(
        page.locator(".chapter-exercise details"),
      ).not.toHaveAttribute("open", "");
      await page.locator(".chapter-exercise summary").click();
      await expect(page.locator(".chapter-exercise details p")).toBeVisible();
      await expect(page.locator(".misconception p")).not.toBeEmpty();
      await expect(page.locator("body")).toHaveJSProperty(
        "scrollWidth",
        await page.evaluate(() => innerWidth),
      );
      if (chapter < 2)
        await page
          .getByRole("button", { name: "Próxima aula →", exact: true })
          .click();
    }
  }
});
