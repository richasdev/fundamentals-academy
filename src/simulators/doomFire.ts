export const FIRE_LEVELS = 37;
export interface FireField {
  width: number;
  height: number;
  cells: Uint8Array;
  scratch: Uint8Array;
}
export function createFire(width: number, height: number): FireField {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 2
  )
    throw new Error("Dimensões inválidas para o campo de fogo.");
  return {
    width,
    height,
    cells: new Uint8Array(width * height),
    scratch: new Uint8Array(width * height),
  };
}
/** Propaga o calor da linha inferior, com resfriamento e deslocamento lateral. */
export function stepFire(
  field: FireField,
  heat: number,
  wind: number,
  random: () => number = Math.random,
): void {
  const { width, height, cells, scratch } = field;
  const source = Math.round(Math.max(0, Math.min(1, heat)) * (FIRE_LEVELS - 1));
  cells.fill(source, (height - 1) * width);
  scratch.fill(source, (height - 1) * width);
  for (let y = height - 2; y >= 0; y--)
    for (let x = 0; x < width; x++) {
      const drift = Math.round(
        (random() - 0.5) * 2 + Math.max(-2, Math.min(2, wind)),
      );
      const sx = (x + drift + width) % width;
      const cooling = random() < 0.48 ? 0 : 1;
      scratch[y * width + x] = Math.max(
        0,
        cells[(y + 1) * width + sx] - cooling,
      );
    }
  field.cells = scratch;
  field.scratch = cells;
}
export function firePalette(): Uint8ClampedArray {
  const stops = [
    [0, 5, 7, 8],
    [0.16, 60, 8, 15],
    [0.36, 157, 27, 21],
    [0.58, 228, 76, 24],
    [0.78, 255, 166, 48],
    [1, 255, 244, 189],
  ];
  const palette = new Uint8ClampedArray(FIRE_LEVELS * 4);
  for (let i = 0; i < FIRE_LEVELS; i++) {
    const t = i / (FIRE_LEVELS - 1);
    const right = stops.findIndex((s) => s[0] >= t);
    const a = stops[Math.max(0, right - 1)],
      b = stops[right];
    const mix = a === b ? 0 : (t - a[0]) / (b[0] - a[0]);
    for (let c = 0; c < 3; c++)
      palette[i * 4 + c] = Math.round(a[c + 1] + (b[c + 1] - a[c + 1]) * mix);
    palette[i * 4 + 3] = 255;
  }
  return palette;
}
