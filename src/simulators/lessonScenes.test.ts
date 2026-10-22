import { describe, expect, it } from "vitest";
import { labIds } from "../content/lessons";
import { teachingGuides } from "../content/teachingGuides";
import { lessonFrames } from "./lessonScenes";
import { sessionDuration } from "../content/sessionDuration";
import { studySessions } from "../content/studySessions";

describe("aulas ligadas à cena", () => {
  for (const id of labIds)
    it(`${id}: três aulas navegáveis, sem destinos inexistentes`, () => {
      for (let chapter = 0; chapter < 3; chapter++) {
        const frames = lessonFrames(id, chapter);
        expect(frames).toHaveLength(3);
        frames.forEach((frame, i) => {
          expect(frame.narration).toBe(teachingGuides[id][chapter].steps[i]);
          expect(frame.step.flow?.explanation).toBe(frame.narration);
          const flow = frame.step.flow!;
          expect(flow).toBeDefined();
          expect(flow.payload.length).toBeGreaterThan(0);
          expect(
            frame.nodes.find((n) => n.label === flow.source),
          ).toBeDefined();
          expect(
            frame.focus.every((key) => frame.nodes.some((n) => n.id === key)),
          ).toBe(true);
          expect(flow.from.every(Number.isFinite)).toBe(true);
          expect(flow.to.every(Number.isFinite)).toBe(true);
          if (flow.lost) expect(flow.receiver).toBeUndefined();
          else
            expect(frame.nodes.find((n) => n.id === flow.receiver)?.label).toBe(
              flow.target,
            );
        });
        // Revisitar não deve depender de uma chamada anterior nem mutar snapshots.
        const original = JSON.stringify(frames);
        frames[2].step.values.test = "mutação externa";
        expect(JSON.stringify(lessonFrames(id, chapter))).toBe(original);
      }
    });
  it("preserva resultados calculados e confirmação separada de envio", () => {
    expect(lessonFrames("logic", 0)[2].step.values.out).toBe("13 sem sinal");
    expect(lessonFrames("cpu", 2)[2].step.values.ram).toBe("4");
    expect(lessonFrames("memory", 2)[2].step.values.physical).toBe(
      "endereço 115",
    );
    expect(lessonFrames("database", 0)[2].step.flow?.payload).toBe("Pessoa 12");
    expect(lessonFrames("database", 1)[1].step.flow?.receiver).toBe("c");
    expect(lessonFrames("database", 2)[1].step.values.accounts).toBe(
      "A=100; B=50",
    );
    expect(lessonFrames("database", 2)[2].step.values.accounts).toBe(
      "A=90; B=60",
    );
    expect(lessonFrames("compiler", 2).map((f) => f.step.values.vm)).toEqual([
      "[2, 3, 4]",
      "[2, 12]",
      "[14]",
    ]);
    expect(lessonFrames("network", 2).map((f) => f.step.values.client)).toEqual(
      ["240 ms · só rede", "260 ms", "180 ms; perda → 1180 ms"],
    );
    expect(lessonFrames("architecture", 1)[1].step.flow?.payload).toContain(
      "ACK",
    );
    expect(lessonFrames("architecture", 1)[2].step.flow?.payload).toContain(
      "COMMIT",
    );
    expect(lessonFrames("architecture", 2)[2].step.flow?.payload).toContain(
      "sem quórum",
    );
  });
  it("cada trilha tem leitura, seis protocolos de investigação e síntese avaliável", () => {
    for (const id of labIds) {
      const duration = sessionDuration(id);
      expect(duration.min).toBeGreaterThanOrEqual(40);
      expect(duration.max).toBeLessThanOrEqual(65);
      expect(
        duration.reading[0] +
          duration.practice[0] +
          duration.reflection[0] +
          duration.capstone[0],
      ).toBe(duration.min);
      expect(studySessions[id].modules).toHaveLength(3);
      for (const module of studySessions[id].modules) {
        expect(module.experiments).toHaveLength(2);
        expect(
          module.experiments.every(
            (e) => e.steps.length === 4 && e.expected.length > 0,
          ),
        ).toBe(true);
      }
      expect(studySessions[id].capstone.deliverables).toHaveLength(3);
    }
  });
});
