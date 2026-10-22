import type { CpuState, MemoryState, NetworkState } from "./engines";
export type Vec3 = [number, number, number];
export interface FlowEvent {
  id: number;
  from: Vec3;
  to: Vec3;
  source: string;
  target: string;
  payload: string;
  explanation: string;
  via?: Vec3[];
  lost?: boolean;
}
export function cpuFlow(s: CpuState, gap = 1, spread = 0): FlowEvent | null {
  if (!s.cycles) return null;
  const phase = (s.phase + 2) % 3;
  const acc: Vec3 = [2.7 * gap, 0.4, 1.05],
    ir: Vec3 = [2.7 * gap, 0.4, 0],
    control: Vec3 = [0, 1.4 + spread * 2, 0],
    alu: Vec3 = [0, 0.7 + spread, 0];
  const address = s.ir?.address ?? 0;
  const ram: Vec3 = [
    -2.5 * gap + (address % 2) * 0.8,
    0.4,
    Math.floor(address / 2) * 0.45 - 1.65,
  ];
  if (phase === 0)
    return {
      id: s.cycles,
      from: [-1.1 + (s.pc - 1) * 0.7, 0.35, -1.95],
      to: ir,
      source: `Instrução [${s.pc - 1}]`,
      target: "IR",
      payload: s.ir!.op,
      explanation:
        "Fetch: a memória de instruções entrega a operação ao registrador IR. O PC avança.",
    };
  if (phase === 1)
    return {
      id: s.cycles,
      from: ir,
      to: control,
      source: "IR",
      target: "Unidade de controle",
      payload: `DECODIFICAR ${s.ir!.op}`,
      explanation:
        "Decode: o opcode é interpretado e os sinais de controle são definidos.",
    };
  if (s.ir?.op === "STORE")
    return {
      id: s.cycles,
      from: acc,
      to: ram,
      source: "ACC",
      target: `RAM[${address}]`,
      payload: String(s.acc),
      explanation: `Escrita: o byte ${s.acc} sai do acumulador e é gravado no endereço ${address}.`,
    };
  if (s.ir?.op === "HALT")
    return {
      id: s.cycles,
      from: control,
      to: alu,
      source: "Controle",
      target: "CPU",
      payload: "HALT",
      explanation:
        "A execução termina. O resultado permanece na RAM e no acumulador.",
    };
  return {
    id: s.cycles,
    from: ram,
    to: acc,
    via: [alu],
    source: `RAM[${address}]`,
    target: "ALU → ACC",
    payload: `${s.ram[address]} → ACC ${s.acc}`,
    explanation:
      s.ir?.op === "LOAD"
        ? `Leitura: o byte ${s.ram[address]} é transferido ao acumulador.`
        : `A ALU soma o byte ${s.ram[address]} ao acumulador e registra ${s.acc} (módulo 256).`,
  };
}
export function memoryFlow(s: MemoryState, gap = 1): FlowEvent | null {
  if (!s.operations || !/^PUSH|^POP|^malloc|^free/.test(s.log)) return null;
  const source: Vec3 = [-3.7, 0.4, -2.7];
  const isPop = s.log.startsWith("POP"),
    isFree = s.log.startsWith("free");
  let address = 0;
  if (isPop) address = 31 - s.stack.length;
  else if (s.log.startsWith("PUSH")) address = 32 - s.stack.length;
  else {
    const match = s.log.match(/0x([0-9a-f]+)/);
    address = match ? parseInt(match[1], 16) : 0;
  }
  const cell: Vec3 = [
    ((address % 8) - 3.5) * 0.85 * gap,
    0.5,
    (Math.floor(address / 8) - 1.5) * 1.05 * gap,
  ];
  return {
    id: s.operations,
    from: isPop || isFree ? cell : source,
    to: isPop || isFree ? source : cell,
    source: isPop || isFree ? `Memória 0x${address.toString(16)}` : "Programa",
    target: isPop || isFree ? "Programa" : `Memória 0x${address.toString(16)}`,
    payload: isFree
      ? "free · liberar bloco"
      : isPop
        ? "POP · retirar valor"
        : s.log.startsWith("PUSH")
          ? `PUSH ${s.stack.at(-1)}`
          : "malloc · reservar bloco",
    explanation:
      s.log +
      (isFree || s.log.startsWith("malloc")
        ? " A seta representa gerenciamento do bloco; não copia seu conteúdo."
        : " A seta acompanha a transferência do valor da stack."),
  };
}
export function networkFlow(s: NetworkState, gap = 1): FlowEvent | null {
  if (!s.elapsed) return null;
  const client: Vec3 = [-3.1 * gap, 0.65, 0.3],
    dns: Vec3 = [0, 0.7, -1.2 * gap],
    server: Vec3 = [3.1 * gap, 1.05, 0.3];
  if (s.stage === 2 && s.retried)
    return {
      id: s.elapsed,
      from: client,
      to: [0, 0.8, 0.3],
      source: "Cliente",
      target: "Pacote perdido",
      payload: "SYN ×",
      explanation:
        "O SYN não chegou ao servidor. O cliente aguarda o timeout e tenta novamente.",
      lost: true,
    };
  const messages: [Vec3, Vec3, string, string, string, string][] = [
    [
      client,
      dns,
      "Cliente",
      "DNS",
      "consulta A",
      "Qual é o endereço de academy.example?",
    ],
    [
      dns,
      client,
      "DNS",
      "Cliente",
      "192.0.2.10",
      "O resolvedor devolve o IP; o cliente pode iniciar a conexão.",
    ],
    [
      client,
      server,
      "Cliente",
      "Servidor",
      "SYN · seq=100",
      "O cliente pede a abertura de uma conexão TCP.",
    ],
    [
      server,
      client,
      "Servidor",
      "Cliente",
      "SYN-ACK · seq=500, ack=101",
      "O servidor confirma o SYN e envia seu próprio número de sequência.",
    ],
    [
      client,
      server,
      "Cliente",
      "Servidor",
      "ACK=501 + GET /",
      "O cliente confirma o SYN do servidor e, neste modelo, envia o GET junto.",
    ],
    [
      server,
      [server[0], 1.8, 0.3],
      "Servidor",
      "Aplicação",
      "processar GET · 20 ms",
      "A aplicação recebe a requisição e prepara a resposta.",
    ],
    [
      server,
      client,
      "Servidor",
      "Cliente",
      "HTTP/1.1 200 OK",
      "Status, cabeçalhos e corpo voltam ao cliente. A resposta chegou.",
    ],
  ];
  const [from, to, source, target, payload, explanation] =
    messages[s.stage - 1];
  return { id: s.elapsed, from, to, source, target, payload, explanation };
}
