import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { PartKind } from "./ModelDetails";
type Vec = [number, number, number];
function Marker({ number, position }: { number: number; position: Vec }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#13262cf5";
    ctx.beginPath();
    ctx.arc(64, 64, 59, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9ce9d8";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(number).padStart(2, "0"), 64, 66);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [number]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[0.052, 0.052, 1]} renderOrder={30}>
      <spriteMaterial
        map={texture}
        sizeAttenuation={false}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}
export default function AnatomyMarkers({
  kind,
  size,
  explode,
}: {
  kind: PartKind;
  size: Vec;
  explode: number;
}) {
  const [w, h, d] = size,
    top = h / 2 + 0.012;
  const positions: Vec[] =
    kind === "cpu"
      ? [
          [w * 0.4, top + 0.35 + explode * 0.95, 0],
          [-w * 0.28, top + 0.18, -d * 0.15],
          [-w * 0.5, 0.04, d * 0.5],
        ]
      : kind === "drive"
        ? [
            [-w * 0.12, top + 0.25 + explode * 0.6, -d * 0.18],
            [w * 0.32, top + 0.35 + explode * 0.6, d * 0.25],
            [0, 0.04, d * 0.65],
          ]
        : kind === "server"
          ? [
              [0, -0.25, d / 2 + 0.15 + explode * 0.65],
              [w * 0.35, h * 0.4, d / 2 + 0.13],
              [0, top + 0.22 + explode * 0.45, 0],
            ]
          : kind === "laptop"
            ? [
                [0, 0.9, -d * 0.45],
                [w * 0.25, top + 0.2, -d * 0.1],
                [-w * 0.55, top + 0.15, d * 0.2],
              ]
            : kind === "ram" || kind === "register" || kind === "byte"
              ? [
                  [0, top + 0.2 + explode * 0.35, 0],
                  [w * 0.25, top + 0.15, -d * 0.3],
                  [w * 0.3, top + 0.1, d * 0.5],
                ]
              : [
                  [0, top + 0.25 + explode * 0.5, 0],
                  [-w * 0.5, 0.08, d * 0.3],
                  [w * 0.4, top + 0.15, -d * 0.4],
                ];
  return (
    <group>
      {positions.map((position, index) => (
        <Marker key={index} number={index + 1} position={position} />
      ))}
    </group>
  );
}
