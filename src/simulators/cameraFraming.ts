import type { FlowEvent, Vec3 } from "./flows";
import type { WorkshopNode } from "./workshops";
export interface CameraShot {
  position: Vec3;
  target: Vec3;
  focus: string;
  phase: "overview" | "transfer" | "received" | "lost" | "inspection";
}
export function fitCamera(
  points: Vec3[],
  aspect: number,
  focus: string,
  phase: CameraShot["phase"],
  padding = 1.1,
): CameraShot {
  const low = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i]))),
    high = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const target = low.map((v, i) => (v + high[i]) / 2) as Vec3;
  const radius =
    Math.max(
      1.6,
      ...points.map((p) => Math.hypot(...p.map((v, i) => v - target[i]))),
    ) + padding;
  const vertical = (42 * Math.PI) / 360,
    horizontal = Math.atan(Math.tan(vertical) * Math.max(0.2, aspect));
  const distance = radius / Math.sin(Math.min(vertical, horizontal));
  const norm = Math.hypot(0.6, 0.75, 1);
  return {
    target,
    position: target.map(
      (v, i) => v + ([0.6, 0.75, 1][i] / norm) * distance,
    ) as Vec3,
    focus,
    phase,
  };
}
export function cameraShot(
  nodes: WorkshopNode[],
  flow: FlowEvent | undefined,
  received: boolean,
  aspect: number,
  spread: number,
  rotation: number,
  inspection?: string,
): CameraShot {
  const world = (p: Vec3): Vec3 => {
    const x = p[0] * spread,
      z = p[2] * spread;
    return [
      x * Math.cos(rotation) + z * Math.sin(rotation),
      p[1],
      z * Math.cos(rotation) - x * Math.sin(rotation),
    ];
  };
  const nodePoint = (n: WorkshopNode): Vec3 =>
    world([n.position[0], n.kind === "server" ? 1 : 0.35, n.position[2]]);
  const inspected = nodes.find((n) => n.id === inspection);
  if (inspected)
    return fitCamera(
      [nodePoint(inspected)],
      aspect,
      inspected.label,
      "inspection",
      0.35,
    );
  if (!flow)
    return fitCamera(
      nodes.map(nodePoint),
      aspect,
      "Bancada completa",
      "overview",
    );
  const destination = nodes.find((n) => n.id === flow.receiver);
  if (received && !flow.lost && destination)
    return fitCamera(
      [nodePoint(destination)],
      aspect,
      destination.label,
      "received",
      0.45,
    );
  const a = world(flow.from),
    b = world(flow.to),
    apex: Vec3 = [
      (a[0] + b[0]) / 2,
      Math.max(a[1], b[1]) + 1.6,
      (a[2] + b[2]) / 2,
    ];
  return fitCamera(
    [a, b, apex],
    aspect,
    flow.lost ? (received ? "Caminho interrompido" : flow.source) : flow.target,
    flow.lost && received ? "lost" : "transfer",
    0.65,
  );
}

// Classic benches already supply expanded model coordinates in their flow.
export function hardwareCameraShot(
  flow: FlowEvent | null,
  received: boolean,
  aspect: number,
  rotation: number,
): CameraShot {
  const world = (p: Vec3): Vec3 => [
    p[0] * Math.cos(rotation) + p[2] * Math.sin(rotation),
    p[1],
    p[2] * Math.cos(rotation) - p[0] * Math.sin(rotation),
  ];
  if (!flow)
    return fitCamera(
      [world([-4, 0, -3]), world([4, 2, 3])],
      aspect,
      "Bancada completa",
      "overview",
    );
  if (received && !flow.lost)
    return fitCamera([world(flow.to)], aspect, flow.target, "received", 0.45);
  const points = [flow.from, ...(flow.via || []), flow.to].map(world);
  const peak: Vec3 = [
    (points[0][0] + points.at(-1)![0]) / 2,
    Math.max(...points.map((p) => p[1])) + 1.6,
    (points[0][2] + points.at(-1)![2]) / 2,
  ];
  return fitCamera(
    [...points, peak],
    aspect,
    received && flow.lost ? "Caminho interrompido" : flow.target,
    received && flow.lost ? "lost" : "transfer",
    0.65,
  );
}
