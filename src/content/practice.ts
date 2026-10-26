import type { LabId } from "./lessons";
import type { Settings } from "../simulators/workshops";
export type PracticeRequest = {
  chapter: number;
  experiment: number;
  serial: number;
};
export type Preparation = Partial<Settings> & {
  cpuA?: number;
  cpuB?: number;
  memorySize?: number;
  latency?: number;
  dnsCached?: boolean;
  loss?: boolean;
};
export function preparePractice(
  id: LabId,
  chapter: number,
  experiment: number,
): Preparation {
  const i = chapter * 2 + experiment;
  switch (id) {
    case "cpu":
      return { cpuA: i === 0 ? 200 : i >= 4 ? 250 : 5, cpuB: i >= 4 ? 10 : 3 };
    case "memory":
      return { memorySize: i === 0 ? 2 : i === 3 ? 8 : 4 };
    case "network":
      return { latency: i >= 4 ? 100 : 40, dnsCached: i >= 4, loss: i === 4 };
    case "logic":
      return {
        gate: chapter === 2 ? "XOR" : "NAND",
        a: 1,
        b: 1,
        logicMode: chapter === 2 ? "half" : i === 3 ? "not" : "gate",
      };
    case "os":
      return {
        quantum: chapter === 1 && experiment === 1 ? 2 : 1,
        io: chapter !== 1,
      };
    case "database":
      return {
        key: chapter === 0 ? 7 : 20,
        indexed: experiment === 0,
        transaction: chapter === 2,
        abort: chapter === 2 && experiment === 1,
      };
    case "compiler":
      return {
        expression:
          chapter === 0 ? "12+3" : chapter === 1 ? "(2+3)*4" : "3*(4+5)",
      };
    case "infra":
      return {
        cache: chapter === 1,
        offline: chapter === 2 ? 1 : 0,
        ttl: experiment === 1 ? 5 : 60,
        interval: 10,
        originVersion: experiment === 1 ? 2 : 1,
      };
    case "architecture":
      return { offline: chapter === 2 ? 2 : 0 };
  }
}
