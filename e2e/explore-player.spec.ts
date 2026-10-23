import { test, expect } from "@playwright/test";

test("Explorar mantém os nove modelos, explicações e controles no mesmo enquadramento", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const id of [
    "logic",
    "cpu",
    "memory",
    "os",
    "network",
    "database",
    "compiler",
    "infra",
    "architecture",
  ]) {
    await page.goto("/#" + id);
    const stage = page.getByRole("region", {
      name: "Exploração passo a passo",
    });
    await expect(stage.locator("canvas")).toBeVisible();
    await stage.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    const original = await stage.locator(".status-bar").textContent();
    if (id === "memory")
      await stage.getByRole("button", { name: "PUSH 4", exact: true }).click();
    else
      await stage
        .getByRole("button", { name: "Próximo passo", exact: true })
        .click();
    await expect(stage.locator(".status-bar")).not.toHaveText(original!);
    await expect(stage.locator("[data-camera-phase]")).toHaveAttribute(
      "data-camera-phase",
      "received",
    );
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - before),
      id,
    ).toBeLessThan(2);
    const b = await stage.evaluate((el) => {
      const rect = (s: string) => {
        const r = el.querySelector(s)!.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          right: r.right,
          bottom: r.bottom,
          height: r.height,
        };
      };
      return {
        scene: rect(".explore-visual-column"),
        text: rect(".explore-explanation-column"),
        controls: rect(".explore-controls"),
        explanation: rect(".explore-current-step"),
        canvas: rect("canvas"),
        viewport: innerHeight,
      };
    });
    if (info.project.name === "desktop")
      expect(b.scene.right, id).toBeLessThanOrEqual(b.text.x + 1);
    else expect(b.scene.bottom, id).toBeLessThanOrEqual(b.text.y + 1);
    expect(b.canvas.height, id).toBeGreaterThan(100);
    expect(b.explanation.y, id).toBeGreaterThanOrEqual(0);
    expect(b.controls.bottom, id).toBeLessThanOrEqual(b.viewport + 1);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
  }
  expect(errors).toEqual([]);
});

test("Explorar acompanha caminho e receptor reais, preservando a câmera livre", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#cpu");
  const stage = page.getByRole("region", { name: "Exploração passo a passo" });
  const viewport = stage.locator(".hardware-viewport");
  await expect(viewport).toHaveAttribute("data-camera-phase", "overview");
  await stage
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(viewport).toHaveAttribute("data-camera-phase", "transfer", {
    timeout: 15000,
  });
  const route = await viewport.getAttribute("data-camera-target");
  await expect(viewport).toHaveAttribute("data-camera-phase", "received", {
    timeout: 15000,
  });
  await expect(viewport).toHaveAttribute("data-camera-focus", "IR");
  expect(await viewport.getAttribute("data-camera-target")).not.toBe(route);
  await expect(stage.locator(".flow-readout")).toContainText("Fetch:");
  const follow = stage.getByRole("button", {
    name: "Acompanhar etapa",
    exact: true,
  });
  await follow.click();
  const target = await viewport.getAttribute("data-camera-target");
  await stage
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(stage.locator(".flow-delivery")).toHaveClass(/received/, {
    timeout: 15000,
  });
  await expect(viewport).toHaveAttribute("data-camera-target", target!);
  await follow.click();
  await expect(viewport).toHaveAttribute(
    "data-camera-focus",
    "Unidade de controle",
  );
});

test("Explorar mostra perda sem aproximar um receptor que não recebeu", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#network");
  const stage = page.getByRole("region", { name: "Exploração passo a passo" });
  await stage.getByLabel("Perder o primeiro SYN").check();
  for (let i = 0; i < 3; i++)
    await stage
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
  await expect(stage.locator(".flow-delivery")).toHaveClass(/lost/);
  await expect(stage.locator(".hardware-viewport")).toHaveAttribute(
    "data-camera-phase",
    "lost",
  );
  await expect(stage.locator(".hardware-viewport")).toHaveAttribute(
    "data-camera-focus",
    "Caminho interrompido",
  );
  await expect(stage.locator(".flow-readout")).toContainText(
    "nenhum componente recebeu",
  );
});

test("execução automática deixa a câmera concluir a chegada antes de avançar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const id of ["cpu", "database"]) {
    await page.goto("/#" + id);
    const stage = page.getByRole("region", {
      name: "Exploração passo a passo",
    });
    const viewport = stage.locator("[data-camera-follow]");
    await expect(stage.locator("canvas")).toBeVisible();
    await stage.getByRole("button", { name: "Executar", exact: true }).click();
    await expect(viewport).toHaveAttribute("data-camera-phase", "received", {
      timeout: 15000,
    });
    const current = await stage.locator(".status-bar").textContent();
    expect(current).not.toMatch(/^00/);
    await expect(stage.locator(".status-bar")).not.toHaveText(current!, {
      timeout: 15000,
    });
    await stage.getByRole("button", { name: "Pausar", exact: true }).click();
  }
});
