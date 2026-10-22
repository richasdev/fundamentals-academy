import { describe, it, expect } from "vitest";
import { cpuModel, initialMemory, memoryAction, networkModel } from "./engines";
import { cpuFlow, memoryFlow, networkFlow } from "./flows";
describe("fluxos visuais derivados das transições reais", () => {
  it("não inventa movimento antes de uma operação", () => {
    expect(cpuFlow(cpuModel().initial())).toBeNull();
    expect(memoryFlow(initialMemory())).toBeNull();
    expect(networkFlow(networkModel().initial())).toBeNull();
  });
  it("representa fetch, decode e leitura por meio da ALU", () => {
    const m = cpuModel();
    let s = m.step(m.initial());
    expect(cpuFlow(s)?.target).toBe("IR");
    expect(cpuFlow(s)?.payload).toBe("LOAD [0x08]");
    expect(cpuFlow(s)?.receiver).toBe("IR");
    s = m.step(s);
    expect(cpuFlow(s)?.source).toBe("IR");
    s = m.step(s);
    expect(cpuFlow(s)?.source).toBe("RAM[8]");
    expect(cpuFlow(s)?.via).toHaveLength(1);
    expect(cpuFlow(s)?.payload).toContain("ACC 5");
  });
  it("STORE parte do acumulador em direção à RAM", () => {
    const m = cpuModel();
    let s = m.initial();
    for (let i = 0; i < 9; i++) s = m.step(s);
    expect(cpuFlow(s)?.source).toBe("ACC");
    expect(cpuFlow(s)?.target).toBe("RAM[10]");
    expect(cpuFlow(s)?.payload).toBe("8");
  });
  it("mostra o sentido oposto para PUSH e POP sem animar underflow", () => {
    let s = memoryAction(initialMemory(), "push", 4);
    expect(memoryFlow(s)?.source).toBe("Programa");
    s = memoryAction(s, "pop");
    expect(memoryFlow(s)?.target).toBe("Programa");
    expect(memoryFlow(s)?.payload).toBe("POP 4");
    expect(memoryFlow(s)?.receiver).toBe("PROGRAMA");
    s = memoryAction(s, "pop");
    expect(memoryFlow(s)).toBeNull();
  });
  it("distingue a direção das três mensagens do handshake", () => {
    const m = networkModel(40, true);
    let s = m.step(m.initial());
    expect(networkFlow(s)?.payload).toContain("SYN ·");
    expect(networkFlow(s)?.source).toBe("Cliente");
    s = m.step(s);
    expect(networkFlow(s)?.payload).toContain("SYN-ACK");
    expect(networkFlow(s)?.source).toBe("Servidor");
    s = m.step(s);
    expect(networkFlow(s)?.payload).toContain("ACK=501");
    expect(networkFlow(s)?.source).toBe("Cliente");
  });
  it("pacote perdido não aparece como recebido pelo servidor", () => {
    const m = networkModel(40, true, true);
    const s = m.step(m.initial());
    expect(networkFlow(s)?.lost).toBe(true);
    expect(networkFlow(s)?.receiver).toBeUndefined();
    expect(networkFlow(s)?.target).toBe("Pacote perdido");
  });
});
