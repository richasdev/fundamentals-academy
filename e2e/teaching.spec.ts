import { test, expect } from "@playwright/test";
test("explicação guiada avança, volta e mostra palavras e limites em todos os níveis", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["logic", "network", "architecture"]) {
    await page.goto(`/#${id}`);
    await page
      .getByRole("button", { name: "Entender o conceito", exact: true })
      .click();
    const walkthrough = page.getByRole("region", {
      name: "Explicação em três passos",
    });
    await expect(walkthrough.locator(".guided-step > span")).toHaveText(
      "PASSO 1 DE 3",
    );
    const first = await walkthrough.locator(".guided-step p").textContent();
    await expect(
      walkthrough.getByRole("button", { name: "Passo anterior" }),
    ).toBeDisabled();
    await walkthrough
      .getByRole("button", { name: "Próximo passo explicado" })
      .click();
    await expect(walkthrough.locator(".guided-step p")).not.toHaveText(
      first || "",
    );
    await walkthrough
      .getByRole("button", { name: "Ver passo 3 da explicação" })
      .click();
    await expect(
      walkthrough.getByRole("button", { name: "Próximo passo explicado" }),
    ).toBeDisabled();
    await walkthrough.getByRole("button", { name: "Passo anterior" }).click();
    await expect(walkthrough.locator(".guided-step > span")).toHaveText(
      "PASSO 2 DE 3",
    );
    await page.locator(".analogy-boundary summary").click();
    await expect(page.locator(".analogy-boundary p")).toBeVisible();
    await page
      .locator(".lesson-vocabulary details")
      .first()
      .locator("summary")
      .click();
    await expect(
      page.locator(".lesson-vocabulary details").first().locator("p"),
    ).toBeVisible();
    await page.locator(".technical-depth summary").click();
    await expect(page.locator(".technical-depth p")).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
  }
});
test("checagem explica as duas escolhas sem concluir a trilha e reinicia na próxima aula", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const options = page
    .getByRole("group", { name: "Respostas da checagem" })
    .getByRole("button");
  await options.nth(0).click();
  await expect(
    page.getByRole("status", { name: "Feedback da checagem" }),
  ).toContainText("O 8 indica onde procurar");
  await expect(options.nth(0)).toHaveAttribute("aria-pressed", "true");
  await options.nth(1).click();
  await expect(
    page.getByRole("status", { name: "Feedback da checagem" }),
  ).toContainText("Isso mesmo");
  await expect(options.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("fundamentals-progress-v1") || "{}")
            .state?.completed || [],
      ),
    )
    .toEqual([]);
  await page.getByRole("button", { name: "Ver passo 3 da explicação" }).click();
  await page
    .getByRole("button", { name: "Próxima aula →", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Feedback da checagem" }),
  ).toHaveCount(0);
  await expect(page.locator(".guided-step > span")).toHaveText("PASSO 1 DE 3");
  await expect(
    page
      .getByRole("group", { name: "Respostas da checagem" })
      .locator("button[aria-pressed=true]"),
  ).toHaveCount(0);
});
