import { expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { labIds } from "../content/lessons";
import { lessonFrames } from "./lessonScenes";
import { cameraShot } from "./cameraFraming";
it("enquadra as duas pontas do fluxo em proporções estreitas e largas", () => {
  for (const id of labIds)
    for (let chapter = 0; chapter < 3; chapter++)
      for (const frame of lessonFrames(id, chapter))
        for (const aspect of [0.6, 1, 2]) {
          const shot = cameraShot(
            frame.nodes,
            frame.step.flow,
            false,
            aspect,
            1,
            0,
          );
          const camera = new PerspectiveCamera(42, aspect, 0.1, 1000);
          camera.position.set(...shot.position);
          camera.lookAt(...shot.target);
          camera.updateMatrixWorld();
          for (const point of [frame.step.flow!.from, frame.step.flow!.to]) {
            const projected = new Vector3(...point).project(camera);
            expect(Math.abs(projected.x)).toBeLessThan(0.98);
            expect(Math.abs(projected.y)).toBeLessThan(0.98);
            expect(projected.z).toBeGreaterThan(-1);
            expect(projected.z).toBeLessThan(1);
          }
        }
});
it("aproxima o receptor depois da entrega, incluindo rotação e separação", () => {
  const frame = lessonFrames("cpu", 0)[2];
  const shot = cameraShot(
    frame.nodes,
    frame.step.flow,
    true,
    1,
    1.2,
    Math.PI / 2,
  );
  expect(shot.focus).toBe("ACC");
  expect(shot.phase).toBe("received");
  expect(shot.target[0]).toBeCloseTo(1.8);
  expect(shot.target[2]).toBeCloseTo(-0.48);
  expect(
    new Vector3(...shot.position).distanceTo(new Vector3(...shot.target)),
  ).toBeLessThan(7);
});
it("perda mantém o caminho no enquadramento e inspeção escolhe apenas a peça pedida", () => {
  const frame = lessonFrames("architecture", 2)[1];
  expect(cameraShot(frame.nodes, frame.step.flow, true, 1, 1, 0).phase).toBe(
    "lost",
  );
  expect(cameraShot(frame.nodes, frame.step.flow, true, 1, 1, 0).focus).toBe(
    "Caminho interrompido",
  );
  const inspection = cameraShot(
    frame.nodes,
    frame.step.flow,
    false,
    1,
    1,
    0,
    "leader",
  );
  expect(inspection.phase).toBe("inspection");
  expect(inspection.focus).toBe("LÍDER");
});
