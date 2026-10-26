import { test, expect } from "@playwright/test";
import { teachingGuides } from "../src/content/teachingGuides";
const finish = async (page: import("@playwright/test").Page) => {
  const next = page.getByRole("button", { name: "Próximo passo", exact: true });
  for (let i = 0; i < 80 && (await next.isEnabled()); i++) await next.click();
  await expect(next).toBeDisabled();
};
test("valores do receptor aguardam a entrega em Explorar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#logic");
  await page.getByLabel("Velocidade", { exact: true }).selectOption("0.5");
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(
    page.locator(".workshop-flow .flow-delivery.transit"),
  ).toBeVisible();
  await expect(page.locator(".workshop-values")).toContainText(
    "aguarda sinais",
  );
  await expect(page.locator(".state-evidence")).toContainText(
    "mantêm o estado anterior",
  );
  await expect(
    page.locator(".workshop-flow .flow-delivery.received"),
  ).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".workshop-values")).toContainText("A=1");
});
test("investigação configura CPU e mantém roteiro ao lado da cena", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Aulas desta trilha" })
    .getByRole("button")
    .nth(2)
    .click();
  await page
    .getByRole("button", {
      name: "Preparar esta investigação na bancada →",
      exact: true,
    })
    .first()
    .click();
  await expect(page.locator(".practice-guide")).toContainText(
    "Teste as fronteiras",
  );
  await expect(page.getByLabel("RAM[0x08]", { exact: true })).toHaveValue(
    "250",
  );
  await expect(page.getByLabel("RAM[0x09]", { exact: true })).toHaveValue("10");
  await expect(
    page.locator(".explore-explanation-column .practice-guide"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar à explicação desta aula" })
    .click();
  await expect(page.locator(".reading-panel .eyebrow")).toContainText(
    "AULA 3 DE 3",
  );
});
test("memória cria fragmentação por liberação de endereços", async ({
  page,
}) => {
  await page.goto("/#memory");
  await page.getByRole("button", { name: "Ver mapa 2D" }).click();
  await page.getByLabel("Tamanho ou valor").fill("8");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "malloc(8)", exact: true }).click();
  for (const address of ["0", "16"]) {
    await page.getByLabel("Bloco para liberar").selectOption(address);
    await page
      .getByRole("button", { name: "Liberar bloco selecionado" })
      .click();
  }
  await page.getByLabel("Tamanho ou valor").fill("12");
  await page.getByRole("button", { name: "malloc(12)", exact: true }).click();
  await expect(page.locator(".status-bar")).toContainText(
    "nenhum bloco contíguo",
  );
  const rows = page.locator(".state-evidence tr");
  await expect(
    rows
      .filter({
        has: page.getByRole("rowheader", { name: "Bytes livres", exact: true }),
      })
      .locator("td")
      .last(),
  ).toHaveText("16");
  await expect(
    rows
      .filter({
        has: page.getByRole("rowheader", {
          name: "Maior intervalo livre",
          exact: true,
        }),
      })
      .locator("td")
      .last(),
  ).toHaveText("8");
});
test("compilador expõe AST inspecionável e compara execuções", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#compiler");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByText("Inspecionar e ajustar modelo", { exact: true }).click();
  await page.getByLabel("Inspecionar componente 3D").selectOption("ast-root");
  await expect(
    page.getByRole("region", { name: "Anatomia do componente selecionado" }),
  ).toContainText("Árvore sintática");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish(page);
  await expect(page.locator(".status-bar")).toContainText("Resultado = 14");
  await page
    .getByRole("button", { name: "Salvar estado para comparar" })
    .click();
  await page.getByLabel("Expressão", { exact: true }).fill("(2+3)*4");
  await page.getByRole("button", { name: "Compilar expressão" }).click();
  await finish(page);
  await expect(page.locator(".state-evidence")).toContainText(
    "Referência salva",
  );
  const vm = page
    .locator(".state-evidence tr")
    .filter({ has: page.getByRole("rowheader", { name: "VM", exact: true }) });
  await expect(vm).toContainText("[14]");
  await expect(vm).toContainText("[20]");
});
test("banco demonstra COMMIT e ROLLBACK e infraestrutura expira cache", async ({
  page,
}) => {
  await page.goto("/#database");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await page.getByLabel("Experimento de banco").selectOption("transaction");
  await finish(page);
  await expect(page.locator(".status-bar")).toContainText("COMMIT · total 150");
  await page.getByLabel("Falhar antes de confirmar").check();
  await finish(page);
  await expect(page.locator(".workshop-values")).toContainText(
    "100 confirmados",
  );
  await expect(page.locator(".workshop-values")).toContainText(
    "50 confirmados",
  );
  await page.getByRole("tab", { name: "Infraestrutura" }).click();
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await page.getByLabel("Validade do cache", { exact: true }).fill("5");
  await page
    .getByLabel("Origem muda para versão 2 antes do segundo pedido")
    .check();
  await finish(page);
  await expect(page.locator(".workshop-values")).toContainText("v2");
  await expect(page.locator(".status-bar")).toContainText("2 visitas à origem");
});
test("concluir trilha exige três conceitos, prática e desafio e preserva evidências", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#cpu");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish(page);
  await page.getByRole("button", { name: "Desafio 1" }).click();
  await page.getByRole("button", { name: "8", exact: true }).click();
  const state = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fundamentals-progress-v1") || "{}")
          .state,
    );
  expect((await state()).completed).not.toContain("cpu");
  await page
    .getByRole("button", { name: "Entender o conceito", exact: true })
    .click();
  for (let c = 0; c < 3; c++) {
    await page
      .getByRole("navigation", { name: "Aulas desta trilha" })
      .getByRole("button")
      .nth(c)
      .click();
    const guide = teachingGuides.cpu[c];
    await page
      .getByRole("group", { name: "Respostas da checagem" })
      .getByRole("button", { name: guide.choices[guide.correct], exact: false })
      .click();
  }
  await expect.poll(async () => (await state()).completed).toContain("cpu");
  await page.reload();
  await expect(page.locator(".learning-evidence")).toContainText(
    "Conceitos: 3/3",
  );
});

test("meio somador, espera de I/O e modo estudo têm controles utilizáveis", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#logic");
  await page.getByLabel("Circuito lógico").selectOption("half");
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish(page);
  await expect(page.locator(".status-bar")).toContainText("2 = 10₂");
  await page.getByRole("tab", { name: "SO & Linux" }).click();
  await page.getByLabel("P1 solicita leitura de disco").check();
  await page.getByRole("button", { name: "Ver diagrama 2D" }).click();
  await finish(page);
  await expect(
    page.getByRole("region", { name: "Linha do tempo da CPU" }),
  ).toContainText("P1");
  await page.getByRole("button", { name: "Modo estudo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sair do modo estudo" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.getByRole("button", { name: "Sair do modo estudo" }).click();
  await expect(page.locator(".lab-navigation")).toBeVisible();
});

test("retorno rápido a uma etapa inicia uma nova entrega", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#logic");
  await page.getByLabel("Velocidade", { exact: true }).selectOption("0.5");
  const next = page.getByRole("button", { name: "Próximo passo", exact: true });
  await next.click();
  await expect(
    page.locator(".workshop-flow .flow-delivery.received"),
  ).toBeVisible({ timeout: 20000 });
  await next.click();
  await page
    .getByRole("button", { name: "Voltar um passo", exact: true })
    .click();
  await expect(
    page.locator(".workshop-flow .flow-delivery.transit"),
  ).toBeVisible();
  await expect(page.locator(".workshop-values")).toContainText(
    "aguarda sinais",
  );
  await expect(
    page.locator(".workshop-flow .flow-delivery.received"),
  ).toBeVisible({ timeout: 20000 });
});
