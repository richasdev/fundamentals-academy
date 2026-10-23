import { expect, it } from "vitest";
import { labIds } from "./lessons";
import { mechanisms } from "./mechanisms";
import { lessonFrames } from "../simulators/lessonScenes";
import { nodeModel, modelAnatomy } from "../components/modelAnatomy";
it("cada passo tem uma causa e evidência próprias, e cada peça tem um papel inspecionável", () => {
  let count = 0;
  for (const id of labIds)
    for (let chapter = 0; chapter < 3; chapter++) {
      const explanation = mechanisms[id][chapter];
      expect(explanation.why).toHaveLength(3);
      expect(new Set(explanation.why).size).toBe(3);
      expect(explanation.observe).toHaveLength(3);
      for (const frame of lessonFrames(id, chapter)) {
        count++;
        for (const node of frame.nodes) {
          expect(node.detail.length).toBeGreaterThan(50);
          expect(node.detail).not.toBe(node.label);
          expect(modelAnatomy[nodeModel(node)].parts).toHaveLength(3);
        }
      }
    }
  expect(count).toBe(81);
});
it("modelos distinguem armazenamento, cliente, memória e servidor", () => {
  const frames = lessonFrames("network", 0);
  expect(nodeModel(frames[0].nodes.find((n) => n.id === "client")!)).toBe(
    "laptop",
  );
  expect(nodeModel(frames[0].nodes.find((n) => n.id === "server")!)).toBe(
    "server",
  );
  expect(
    nodeModel(lessonFrames("database", 0)[0].nodes.find((n) => n.id === "b")!),
  ).toBe("drive");
  expect(
    nodeModel(lessonFrames("cpu", 0)[0].nodes.find((n) => n.id === "ram")!),
  ).toBe("ram");
});
