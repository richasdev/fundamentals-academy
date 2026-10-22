import { describe, it, expect } from "vitest";
import { labIds, chapterTitles, lessons, modules } from "./lessons";
import { levels, trackInfo } from "./curriculum";
import { chapterDetails } from "./chapterDetails";
describe("currículo progressivo", () => {
  it("ordena nove trilhas em três níveis sem quebrar identidade", () => {
    expect(labIds).toEqual([
      "logic",
      "cpu",
      "memory",
      "os",
      "network",
      "database",
      "compiler",
      "infra",
      "architecture",
    ]);
    expect(modules).toHaveLength(labIds.length);
    expect(new Set(labIds).size).toBe(9);
    for (const level of levels)
      expect(labIds.filter((id) => trackInfo[id].level === level)).toHaveLength(
        3,
      );
    const ranks = labIds.map((id) => levels.indexOf(trackInfo[id].level));
    expect(ranks).toEqual([...ranks].sort());
  });
  it("pré-requisitos existem e sempre precedem a trilha, sem ciclos", () => {
    for (const id of labIds) {
      expect(trackInfo[id].outcomes).toHaveLength(3);
      for (const pre of trackInfo[id].prerequisites) {
        expect(labIds.indexOf(pre)).toBeGreaterThanOrEqual(0);
        expect(labIds.indexOf(pre)).toBeLessThan(labIds.indexOf(id));
      }
    }
  });
  it("todas as 27 aulas têm exemplo, estados, resolução e delimitação do laboratório", () => {
    for (const id of labIds) {
      expect(chapterDetails[id]).toHaveLength(chapterTitles[id].length);
      for (const detail of chapterDetails[id]) {
        expect(detail.objective.length).toBeGreaterThan(30);
        expect(detail.explanation.split(/\s+/).length).toBeGreaterThan(65);
        expect(detail.code).toContain("\n");
        expect(detail.trace).toHaveLength(3);
        expect(new Set(detail.trace.map((row) => row[0])).size).toBe(3);
        expect(detail.trace.every((row) => row.every(Boolean))).toBe(true);
        expect(detail.exercise.length).toBeGreaterThan(30);
        expect(detail.solution.length).toBeGreaterThan(60);
        expect(detail.mistake.length).toBeGreaterThan(40);
        expect(detail.observation.length).toBeGreaterThan(50);
      }
      expect(lessons[id].sources.length).toBeGreaterThan(0);
    }
  });
});
