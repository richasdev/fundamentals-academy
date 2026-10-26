export interface Model<S> {
  initial: () => S;
  step: (state: S) => S;
  done: (state: S) => boolean;
}
export type Instruction = {
  op: "LOAD" | "ADD" | "STORE" | "HALT";
  address: number;
};
export interface CpuState {
  pc: number;
  acc: number;
  ir: Instruction | null;
  ram: number[];
  phase: number;
  cycles: number;
  halted: boolean;
  log: string;
}
export const program: Instruction[] = [
  { op: "LOAD", address: 8 },
  { op: "ADD", address: 9 },
  { op: "STORE", address: 10 },
  { op: "HALT", address: 0 },
];
export const cpuModel = (a = 5, b = 3): Model<CpuState> => ({
  initial: () => ({
    pc: 0,
    acc: 0,
    ir: null,
    ram: Array.from({ length: 16 }, (_, i) => (i === 8 ? a : i === 9 ? b : 0)),
    phase: 0,
    cycles: 0,
    halted: false,
    log: "Pronto. O PC aponta para a primeira instrução.",
  }),
  done: (s) => s.halted,
  step: (s) => {
    if (s.halted) return s;
    const n = {
      ...s,
      ram: [...s.ram],
      cycles: s.cycles + 1,
      phase: (s.phase + 1) % 3,
    };
    if (s.phase === 0) {
      n.ir = program[s.pc];
      n.log = `FETCH · A instrução ${n.ir.op} foi lida no endereço ${s.pc}.`;
      n.pc = s.pc + 1;
    } else if (s.phase === 1) {
      n.log = `DECODE · A unidade de controle interpreta ${s.ir?.op}.`;
    } else {
      const i = s.ir!;
      if (i.op === "LOAD") n.acc = s.ram[i.address];
      if (i.op === "ADD") n.acc = (s.acc + s.ram[i.address]) & 255;
      if (i.op === "STORE") n.ram[i.address] = s.acc;
      if (i.op === "HALT") n.halted = true;
      n.log =
        i.op === "HALT"
          ? "HALT · Programa encerrado. O resultado está em RAM[10]."
          : `EXECUTE · ${i.op} ${i.address} → ${i.op === "STORE" ? "RAM[10] = " + s.acc : "ACC = " + n.acc}.`;
    }
    return n;
  },
});
export interface MemoryState {
  stack: number[];
  blocks: { address: number; size: number }[];
  log: string;
  operations: number;
}
export const initialMemory = (): MemoryState => ({
  stack: [],
  blocks: [],
  log: "32 bytes livres. A stack cresce para baixo; o heap cresce para cima.",
  operations: 0,
});
export function memoryAction(
  s: MemoryState,
  action: "push" | "pop" | "alloc" | "free",
  size = 4,
  freeAddress?: number,
): MemoryState {
  const n = {
    ...s,
    stack: [...s.stack],
    blocks: [...s.blocks],
    operations: s.operations + 1,
  };
  const heapEnd = s.blocks.reduce((m, b) => Math.max(m, b.address + b.size), 0);
  if (action === "push") {
    if (31 - s.stack.length < heapEnd)
      return { ...s, log: "Sem espaço: stack e heap colidiriam." };
    n.stack.push(size);
    n.log = `PUSH · valor ${size} em 0x${(32 - n.stack.length).toString(16)}.`;
  }
  if (action === "pop") {
    if (!s.stack.length)
      return { ...s, log: "Stack vazia: não há valor para remover." };
    n.log = `POP · valor ${n.stack.pop()} removido.`;
  }
  if (action === "alloc") {
    let address = 0;
    for (const b of [...s.blocks].sort((a, b) => a.address - b.address)) {
      if (b.address - address >= size) break;
      address = b.address + b.size;
    }
    if (address + size > 32 - s.stack.length)
      return {
        ...s,
        log: "Falha de alocação: nenhum bloco contíguo disponível.",
      };
    n.blocks.push({ address, size });
    n.log = `malloc(${size}) → 0x${address.toString(16).padStart(2, "0")}. Estratégia first-fit.`;
  }
  if (action === "free") {
    if (!s.blocks.length)
      return { ...s, log: "Heap vazio: nada para liberar." };
    const index =
      freeAddress === undefined
        ? n.blocks.length - 1
        : n.blocks.findIndex((b) => b.address === freeAddress);
    if (index < 0)
      return { ...s, log: "Endereço não corresponde a um bloco alocado." };
    const [b] = n.blocks.splice(index, 1);
    n.log = `free(0x${b.address.toString(16)}) · ${b.size} bytes liberados.`;
  }
  return n;
}
export interface NetworkState {
  stage: number;
  elapsed: number;
  log: string;
  retried: boolean;
  status: string;
}
export const networkLabels = [
  "Consulta DNS",
  "Resposta DNS",
  "SYN",
  "SYN-ACK",
  "ACK + GET /",
  "Servidor processa",
  "HTTP 200 OK",
];
export const networkModel = (
  latency = 40,
  cached = false,
  loss = false,
): Model<NetworkState> => ({
  initial: () => ({
    stage: cached ? 2 : 0,
    elapsed: 0,
    log: cached
      ? "DNS em cache: consulta dispensada."
      : "Pronto para resolver academy.example.",
    retried: false,
    status: "Aguardando",
  }),
  done: (s) => s.stage === 7,
  step: (s) => {
    if (s.stage === 7) return s;
    if (loss && s.stage === 2 && !s.retried)
      return {
        ...s,
        retried: true,
        elapsed: s.elapsed + 1000,
        log: "SYN perdido. Timeout didático de 1.000 ms antes de retransmitir.",
        status: "Retransmissão",
      };
    return {
      ...s,
      stage: s.stage + 1,
      elapsed: s.elapsed + (s.stage === 5 ? 20 : latency),
      log:
        networkLabels[s.stage] +
        (s.stage === 1
          ? " · 192.0.2.10 (endereço de documentação)."
          : s.stage === 6
            ? " · Resposta recebida."
            : ""),
      status: s.stage === 6 ? "Concluído" : "Em trânsito",
    };
  },
});

export function memorySpace(s: MemoryState) {
  const ceiling = 32 - s.stack.length;
  const blocks = [...s.blocks].sort((a, b) => a.address - b.address);
  let end = 0,
    largest = 0,
    free = 0;
  for (const b of blocks) {
    const hole = b.address - end;
    largest = Math.max(largest, hole);
    free += hole;
    end = b.address + b.size;
  }
  const tail = ceiling - end;
  return { free: free + tail, largest: Math.max(largest, tail) };
}
export function networkEndpoints(s: NetworkState) {
  if (s.stage < 2)
    return { cliente: "DNS pendente", servidor: "LISTEN", camada: "DNS" };
  if (s.stage === 2)
    return {
      cliente: s.retried
        ? "Timeout concluído · retransmissão pendente"
        : "IP conhecido",
      servidor: "LISTEN",
      camada: "TCP",
    };
  if (s.stage === 3)
    return {
      cliente: "SYN-SENT",
      servidor: "SYN recebido · responde SYN-ACK",
      camada: "TCP",
    };
  if (s.stage === 4)
    return {
      cliente: "SYN-ACK recebido · prepara ACK",
      servidor: "SYN-RECEIVED",
      camada: "TCP",
    };
  return {
    cliente: s.stage === 7 ? "Resposta HTTP recebida" : "ESTABLISHED",
    servidor:
      s.stage === 5
        ? "ESTABLISHED · GET recebido"
        : s.stage === 6
          ? "Processando GET"
          : "Resposta enviada",
    camada: "HTTP sobre TCP",
  };
}
