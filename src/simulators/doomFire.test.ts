import { describe, it, expect } from "vitest";
import { createFire, stepFire, firePalette, FIRE_LEVELS } from "./doomFire";
describe("campo de fogo Doom", () => {
  it("propaga calor da fonte inferior até as linhas superiores", () => {
    const field = createFire(4, 6);
    stepFire(field, 1, 0, () => 0.1);
    expect([...field.cells.slice(-4)]).toEqual([36, 36, 36, 36]);
    expect(field.cells[0]).toBe(0);
    for (let i = 0; i < 6; i++) stepFire(field, 1, 0, () => 0.1);
    expect(field.cells[0]).toBe(36);
  });
  it("apaga o campo quando a fonte de calor é desligada", () => {
    const field = createFire(8, 8);
    for (let i = 0; i < 15; i++) stepFire(field, 1, 1, () => 0.9);
    for (let i = 0; i < 15; i++) stepFire(field, 0, -2, () => 0.9);
    expect([...field.cells].every((v) => v === 0)).toBe(true);
  });
  it("mantém intensidades dentro da paleta com vento nos limites", () => {
    const field = createFire(7, 9);
    for (let i = 0; i < 50; i++)
      stepFire(field, 2, i % 2 ? -10 : 10, () => 0.99);
    expect([...field.cells].every((v) => v < FIRE_LEVELS)).toBe(true);
    expect(field.cells.length).toBe(63);
    expect(firePalette().length).toBe(FIRE_LEVELS * 4);
    expect(firePalette()[3]).toBe(255);
  });
  it("rejeita campos que não comportam propagação", () => {
    expect(() => createFire(0, 8)).toThrow();
    expect(() => createFire(4, 1)).toThrow();
  });
});
