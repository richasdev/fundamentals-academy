import { CanvasTexture, RepeatWrapping } from "three";
type SurfaceKind = "pcb" | "metal" | "plastic" | "silicon";
const textures = new Map<SurfaceKind, CanvasTexture>();
function microSurface(kind: SurfaceKind) {
  const cached = textures.get(kind);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d")!;
  const image = c.createImageData(256, 256);
  let seed = 42;
  for (let y = 0; y < 256; y++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const grain = seed / 4294967296;
    for (let x = 0; x < 256; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const n = seed / 4294967296;
      const v =
        kind === "metal"
          ? 125 + grain * 30 + n * 7
          : kind === "pcb"
            ? 155 + n * 35 + (x % 4 === 0 && y % 4 === 0 ? 12 : 0)
            : kind === "silicon"
              ? 85 + n * 8
              : 175 + n * 35;
      const i = (y * 256 + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  c.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "metal" ? 2 : 3, kind === "metal" ? 3 : 3);
  textures.set(kind, texture);
  return texture;
}
export default function PhysicalSurface({
  kind,
  color,
  emissive = "#000000",
}: {
  kind: SurfaceKind;
  color: string;
  emissive?: string;
}) {
  const texture = microSurface(kind);
  return (
    <meshStandardMaterial
      color={color}
      metalness={
        kind === "metal"
          ? 0.85
          : kind === "silicon"
            ? 0.65
            : kind === "pcb"
              ? 0.18
              : 0.08
      }
      roughness={
        kind === "metal"
          ? 0.31
          : kind === "silicon"
            ? 0.19
            : kind === "pcb"
              ? 0.6
              : 0.72
      }
      roughnessMap={texture}
      bumpMap={texture}
      bumpScale={kind === "metal" ? 0.0015 : 0.0025}
      emissive={emissive}
      emissiveIntensity={0.07}
    />
  );
}
