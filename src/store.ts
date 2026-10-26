import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LabId } from "./content/lessons";
export const useProgress = create<{
  completed: LabId[];
  evidence: Partial<
    Record<
      LabId,
      { concepts: number[]; experiment: boolean; challenge: boolean }
    >
  >;
  record: (
    id: LabId,
    kind: "concept" | "experiment" | "challenge",
    chapter?: number,
  ) => void;
  complete: (id: LabId) => void;
  replace: (
    ids: LabId[],
    evidence?: Partial<
      Record<
        LabId,
        { concepts: number[]; experiment: boolean; challenge: boolean }
      >
    >,
  ) => void;
}>()(
  persist(
    (set) => ({
      completed: [],
      evidence: {},
      record: (id, kind, chapter) =>
        set((s) => {
          const old = s.evidence[id] || {
            concepts: [],
            experiment: false,
            challenge: false,
          };
          const next = {
            ...old,
            concepts:
              kind === "concept"
                ? [...new Set([...old.concepts, chapter ?? 0])]
                : old.concepts,
            experiment: old.experiment || kind === "experiment",
            challenge: old.challenge || kind === "challenge",
          };
          if (JSON.stringify(next) === JSON.stringify(old)) return s;
          return {
            evidence: { ...s.evidence, [id]: next },
            completed:
              next.concepts.length === 3 && next.experiment && next.challenge
                ? [...new Set([...s.completed, id])]
                : s.completed,
          };
        }),
      complete: (id) =>
        set((s) => ({ completed: [...new Set([...s.completed, id])] })),
      replace: (completed, evidence = {}) => set({ completed, evidence }),
    }),
    { name: "fundamentals-progress-v1" },
  ),
);
