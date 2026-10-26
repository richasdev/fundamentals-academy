import { expect, it } from "vitest";
import { useProgress } from "./store";
it("progresso exige conceitos, experimento e desafio sem apagar conclusões antigas", () => {
  useProgress.setState({ completed: ["memory"], evidence: {} });
  const { record } = useProgress.getState();
  record("cpu", "challenge");
  expect(useProgress.getState().completed).toEqual(["memory"]);
  record("cpu", "experiment");
  record("cpu", "concept", 0);
  record("cpu", "concept", 1);
  expect(useProgress.getState().completed).not.toContain("cpu");
  record("cpu", "concept", 2);
  expect(useProgress.getState().completed).toEqual(["memory", "cpu"]);
  record("cpu", "concept", 2);
  expect(useProgress.getState().evidence.cpu?.concepts).toHaveLength(3);
});
