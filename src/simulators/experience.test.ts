import { expect, it } from "vitest";
import { buildWorkshop, defaultSettings, compileExpression } from "./workshops";
import {
  initialMemory,
  memoryAction,
  memorySpace,
  networkEndpoints,
  networkModel,
} from "./engines";
import { presentedValues, flowEdges, byteAddition } from "./presentation";
import { preparePractice } from "../content/practice";
const build = (id: Parameters<typeof buildWorkshop>[0], patch = {}) =>
  buildWorkshop(id, { ...defaultSettings, ...patch });
it("conserva todos os valores anteriores enquanto o evento viaja e não altera o snapshot", () => {
  const run = build("architecture"),
    step = run.steps[1],
    before = run.steps[0].values;
  expect(presentedValues(before, step, false)).toEqual(before);
  expect(presentedValues(before, step, true).leader).toContain("42");
  expect(before.leader).toBe("x=0");
});
it("liga os componentes reais em vez de conectar tudo ao primeiro nó", () => {
  const run = build("logic"),
    edges = flowEdges(run.nodes, run.steps);
  expect(edges).toContainEqual(["b", "gate"]);
  expect(edges).toContainEqual(["gate", "out"]);
  expect(edges).not.toContainEqual(["a", "out"]);
});
it("meio somador e NOT têm os resultados previstos para todas as entradas", () => {
  for (const a of [0, 1])
    for (const b of [0, 1]) {
      expect(
        build("logic", { a, b, logicMode: "half" }).steps.at(-1)?.values.out,
      ).toBe(`${a & b}${a ^ b}₂`);
      expect(
        build("logic", { a, b, logicMode: "not" }).steps.at(-1)?.values.out,
      ).toBe(String(1 - a));
    }
});
it("first-fit reutiliza buracos e distingue memória total de espaço contíguo", () => {
  let s = initialMemory();
  for (let i = 0; i < 4; i++) s = memoryAction(s, "alloc", 8);
  s = memoryAction(s, "free", 4, 0);
  s = memoryAction(s, "free", 4, 16);
  expect(memorySpace(s)).toEqual({ free: 16, largest: 8 });
  const failure = memoryAction(s, "alloc", 12);
  expect(failure.blocks).toEqual(s.blocks);
  expect(failure.log).toContain("nenhum bloco contíguo");
  s = memoryAction(s, "alloc", 4);
  expect(s.blocks.at(-1)?.address).toBe(0);
});
it("I/O retira P1 dos prontos e preserva as seis unidades de CPU", () => {
  const run = build("os", { io: true });
  const blocked = run.steps.findIndex((s) => s.title === "P1 bloqueado"),
    unblocked = run.steps.findIndex((s) => s.title === "I/O concluído");
  expect(blocked).toBeGreaterThan(0);
  expect(unblocked).toBeGreaterThan(blocked);
  expect(
    run.steps
      .slice(blocked + 1, unblocked)
      .some((s) => s.title === "Despachar P1"),
  ).toBe(false);
  expect(
    run.steps.at(-1)?.timeline?.reduce((n, t) => n + t.end - t.start, 0),
  ).toBe(6);
  expect(run.steps.at(-1)?.values.p1).toBe("0 restantes");
});
it("cache válido pode conter versão anterior e TTL expirado consulta a origem", () => {
  const hit = build("infra", { originVersion: 2, ttl: 60, interval: 10 });
  expect(
    hit.steps.find((s) => s.title === "Cache HIT")?.values.client,
  ).toContain("v1");
  const expired = build("infra", { originVersion: 2, ttl: 5, interval: 10 });
  expect(expired.steps.some((s) => s.title === "Cache expirou")).toBe(true);
  expect(expired.steps.at(-1)?.values.client).toContain("v2");
  expect(expired.steps.at(-1)?.result).toContain("2 visitas à origem");
});
it("AST preserva precedência e associa cada instrução ao seu nó", () => {
  const compiled = compileExpression("2+3*4");
  expect(compiled.tree).toMatchObject({ op: "+", right: { op: "*" } });
  const run = build("compiler");
  const vm = run.steps.filter((s) => s.title.startsWith("VM ·"));
  expect(vm).toHaveLength(5);
  for (const s of vm)
    expect(
      run.nodes.some((n) => n.id === s.flow?.sender && n.visual === "ast"),
    ).toBe(true);
});
it("transporte binário explica soma módulo 256 e preparação corresponde à atividade", () => {
  expect(byteAddition(250, 10)).toMatchObject({
    total: 260,
    result: 4,
    carry: 1,
  });
  expect(preparePractice("cpu", 2, 0)).toMatchObject({ cpuA: 250, cpuB: 10 });
  expect(preparePractice("compiler", 1, 0).expression).toBe("(2+3)*4");
  let state = networkModel().initial();
  for (let i = 0; i < 3; i++) state = networkModel().step(state);
  expect(networkEndpoints(state).cliente).toBe("SYN-SENT");
});

it("transação preserva saldos confirmados até COMMIT e descarta proposta no ROLLBACK", () => {
  for (const abort of [false, true]) {
    const run = build("database", { transaction: true, abort });
    for (const s of run.steps.slice(0, -1))
      expect([s.values.a, s.values.b]).toEqual([
        "100 confirmados",
        "50 confirmados",
      ]);
    expect([run.steps.at(-1)?.values.a, run.steps.at(-1)?.values.b]).toEqual(
      abort
        ? ["100 confirmados", "50 confirmados"]
        : ["90 confirmados", "60 confirmados"],
    );
  }
});

it("I/O ocorre após o primeiro burst de P1 para qualquer quantum", () => {
  for (const quantum of [1, 2, 3]) {
    const run = build("os", { io: true, quantum });
    expect(run.steps.some((s) => s.title === "P1 bloqueado")).toBe(true);
    expect(
      run.steps.at(-1)?.timeline?.reduce((sum, t) => sum + t.end - t.start, 0),
    ).toBe(6);
  }
});
