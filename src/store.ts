import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LabId } from "./content/lessons";
export const useProgress = create<{
  completed: LabId[];
  complete: (id: LabId) => void;
  replace: (ids: LabId[]) => void;
}>()(
  persist(
    (set) => ({
      completed: [],
      complete: (id) =>
        set((s) => ({ completed: [...new Set([...s.completed, id])] })),
      replace: (completed) => set({ completed }),
    }),
    { name: "fundamentals-progress-v1" },
  ),
);
