import { test, expect } from "@playwright/test";
test("acompanhamento anima o caminho antes de aproximar a peça recebida", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#database");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const player = page.getByRole("region", {
      name: "Modelo do passo explicado",
    }),
    viewport = player.locator(".workshop-viewport");
  await expect(viewport).toHaveAttribute("data-camera-phase", "transfer", {
    timeout: 15000,
  });
  const inTransit = await viewport.getAttribute("data-camera-target");
  await expect(viewport).toHaveAttribute("data-camera-phase", "received", {
    timeout: 15000,
  });
  await expect(viewport).toHaveAttribute("data-camera-focus", "RAIZ");
  expect(await viewport.getAttribute("data-camera-target")).not.toBe(inTransit);
  await expect(player).toHaveAttribute("data-step", "1");
});
test("modelo e explicação permanecem no mesmo enquadramento ao trocar de etapa", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const player = page.getByRole("region", {
    name: "Modelo do passo explicado",
  });
  await expect(player.locator("canvas")).toBeVisible();
  await player.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  const getBounds = () =>
    player.evaluate((e) => {
      const rect = (s: string) => {
        const r = e.querySelector(s)!.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          right: r.right,
          bottom: r.bottom,
          height: r.height,
        };
      };
      return {
        scene: rect(".lesson-visual-column"),
        text: rect(".lesson-explanation-column"),
        controls: rect(".guided-step-actions"),
        narration: rect(".guided-step"),
        viewport: innerHeight,
      };
    });
  let bounds = await getBounds();
  if (info.project.name === "desktop")
    expect(bounds.scene.right).toBeLessThanOrEqual(bounds.text.x + 1);
  else expect(bounds.scene.bottom).toBeLessThanOrEqual(bounds.text.y + 1);
  expect(bounds.scene.y).toBeGreaterThanOrEqual(-1);
  expect(bounds.controls.bottom).toBeLessThanOrEqual(bounds.viewport + 1);
  for (const step of [2, 3, 1]) {
    await page
      .getByRole("button", { name: `Ver passo ${step} da explicação` })
      .click();
    await expect(player).toHaveAttribute("data-step", String(step));
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - before),
    ).toBeLessThan(2);
    bounds = await getBounds();
    expect(bounds.controls.bottom).toBeLessThanOrEqual(bounds.viewport + 1);
    expect(bounds.narration.y).toBeGreaterThanOrEqual(0);
    expect(bounds.narration.bottom).toBeLessThanOrEqual(bounds.viewport);
  }
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("câmera acompanha o receptor e pode ser deixada livre sem alterar o passo", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  const player = page.getByRole("region", {
      name: "Modelo do passo explicado",
    }),
    viewport = player.locator(".workshop-viewport");
  await expect(viewport).toHaveAttribute("data-camera-phase", "received");
  await expect(viewport).toHaveAttribute("data-camera-focus", "ROM");
  await page.getByRole("button", { name: "Ver passo 2 da explicação" }).click();
  await expect(viewport).toHaveAttribute("data-camera-focus", "IR");
  const follow = player.getByRole("button", {
    name: "Acompanhar etapa",
    exact: true,
  });
  await follow.click();
  await expect(follow).toHaveAttribute("aria-pressed", "false");
  const target = await viewport.getAttribute("data-camera-target");
  await page.getByRole("button", { name: "Ver passo 3 da explicação" }).click();
  await expect(player.locator('[data-delivery="received"]')).toContainText(
    "ACC",
  );
  await expect(viewport).toHaveAttribute("data-camera-target", target!);
  await follow.click();
  await expect(viewport).toHaveAttribute("data-camera-focus", "ACC");
  const coords = (await viewport.getAttribute("data-camera-target"))!
    .split(",")
    .map(Number);
  expect(coords[0]).toBeCloseTo(0.4);
  expect(coords[1]).toBeCloseTo(0.35);
  expect(coords[2]).toBeCloseTo(1.5);
  await expect(player).toHaveAttribute("data-step", "3");
});
