import { describe, it, expect } from "vitest";
import {
  cpuModel,
  initialMemory,
  memoryAction,
  networkModel,
  type Model,
} from "./engines";
function finish<S>(model: Model<S>) {
  let s = model.initial();
  for (let i = 0; i < 100 && !model.done(s); i++) s = model.step(s);
  expect(model.done(s)).toBe(true);
  return s;
}
describe("CPU de acumulador", () => {
  it("busca antes de modificar o acumulador, preservando estado anterior", () => {
    const m = cpuModel();
    const initial = m.initial();
    const fetched = m.step(initial);
    expect(fetched.ir?.op).toBe("LOAD");
    expect(fetched.pc).toBe(1);
    expect(fetched.acc).toBe(0);
    expect(initial.pc).toBe(0);
    expect(m.step(m.step(fetched)).acc).toBe(5);
  });
  it("executa a soma e grava RAM, encerrando em 12 microetapas", () => {
    const m = cpuModel();
    const s = finish(m);
    expect(s.ram[10]).toBe(8);
    expect(s.cycles).toBe(12);
    expect(m.step(s)).toBe(s);
  });
  it("representa overflow em 8 bits", () => {
    expect(finish(cpuModel(250, 10)).acc).toBe(4);
    expect(finish(cpuModel(255, 255)).ram[10]).toBe(254);
  });
});
describe("memória contígua", () => {
  it("mantém LIFO e protege o estado anterior", () => {
    const initial = initialMemory();
    const a = memoryAction(initial, "push", 4);
    const b = memoryAction(a, "push", 8);
    expect(memoryAction(b, "pop").stack).toEqual([4]);
    expect(initial.stack).toEqual([]);
  });
  it("impede colisão entre heap e stack e permite reutilizar espaço", () => {
    let s = initialMemory();
    for (let i = 0; i < 4; i++) s = memoryAction(s, "alloc", 8);
    expect(s.blocks).toHaveLength(4);
    const blocked = memoryAction(s, "push");
    expect(blocked.stack).toHaveLength(0);
    expect(blocked.log).toContain("Sem espaço");
    s = memoryAction(s, "free");
    s = memoryAction(s, "push", 7);
    expect(s.stack).toEqual([7]);
    expect(memoryAction(s, "alloc", 8).blocks).toHaveLength(3);
    expect(memoryAction(s, "alloc", 7).blocks.at(-1)).toEqual({
      address: 24,
      size: 7,
    });
  });
  it("trata underflow e free sem alocações", () => {
    expect(memoryAction(initialMemory(), "pop").log).toContain("vazia");
    expect(memoryAction(initialMemory(), "free").blocks).toEqual([]);
  });
});
describe("requisição HTTP", () => {
  it("calcula latências dos trechos e processamento", () => {
    const s = finish(networkModel(40));
    expect(s.elapsed).toBe(260);
    expect(s.stage).toBe(7);
  });
  it("cache DNS economiza dois trechos", () => {
    expect(finish(networkModel(40, true)).elapsed).toBe(180);
  });
  it("perda gera uma retransmissão determinística com timeout", () => {
    const s = finish(networkModel(40, false, true));
    expect(s.elapsed).toBe(1260);
    expect(s.retried).toBe(true);
    expect(s.status).toBe("Concluído");
  });
});
