import type { WorkshopStep, WorkshopNode } from "./workshops";
export function presentedValues(
  previous: Record<string, string>,
  step: WorkshopStep,
  delivered: boolean,
) {
  return step.flow && !delivered ? { ...previous } : { ...step.values };
}
export function flowEdges(nodes: WorkshopNode[], steps: WorkshopStep[]) {
  const edges = new Map<string, [string, string]>();
  for (const { flow } of steps)
    if (flow) {
      const from =
        flow.sender || nodes.find((n) => n.label === flow.source)?.id;
      const to = flow.receiver;
      if (from && to && from !== to)
        edges.set([from, to].sort().join(":"), [from, to]);
    }
  return [...edges.values()];
}
export function byteAddition(a: number, b: number) {
  let carry = 0;
  const columns = [];
  for (let bit = 0; bit < 8; bit++) {
    const left = (a >> bit) & 1,
      right = (b >> bit) & 1,
      total = left + right + carry;
    columns.unshift({
      bit,
      left,
      right,
      carryIn: carry,
      result: total & 1,
      carryOut: total >> 1,
    });
    carry = total >> 1;
  }
  return { columns, carry, result: (a + b) & 255, total: a + b };
}
