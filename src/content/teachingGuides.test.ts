import { describe, it, expect } from "vitest";
import { labIds, chapterTitles } from "./lessons";
import { teachingGuides } from "./teachingGuides";
describe("explicações simples para todo o currículo", () => {
  it("cada aula possui analogia, ligação com o mecanismo, limite e três passos completos", () => {
    let count = 0;
    for (const id of labIds) {
      expect(teachingGuides[id]).toHaveLength(chapterTitles[id].length);
      for (const guide of teachingGuides[id]) {
        count++;
        expect(guide.analogy.length).toBeGreaterThan(100);
        expect(guide.connection.split(/\s+/).length).toBeGreaterThan(40);
        expect(guide.boundary.length).toBeGreaterThan(80);
        expect(guide.relevance.length).toBeGreaterThan(70);
        expect(guide.steps).toHaveLength(3);
        expect(guide.steps.every((step) => step.length > 35)).toBe(true);
        expect(new Set(guide.steps).size).toBe(3);
      }
    }
    expect(count).toBe(27);
  });
  it("cada checagem tem respostas e feedbacks distintos e termos com definições", () => {
    for (const id of labIds)
      for (const guide of teachingGuides[id]) {
        expect(guide.question.length).toBeGreaterThan(35);
        expect(guide.choices).toHaveLength(2);
        expect(guide.feedback).toHaveLength(2);
        expect(new Set(guide.choices).size).toBe(2);
        expect(new Set(guide.feedback).size).toBe(2);
        expect(guide.feedback.every((text) => text.length > 40)).toBe(true);
        expect(guide.choices[guide.correct]).toBeTruthy();
        expect(guide.terms).toHaveLength(2);
        expect(
          guide.terms.every(
            ([term, meaning]) => term.length > 1 && meaning.length > 20,
          ),
        ).toBe(true);
      }
  });
});
