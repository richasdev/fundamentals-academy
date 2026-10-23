import type { LabId } from "../content/lessons";
import { teachingGuides } from "../content/teachingGuides";
import { componentRole } from "../content/componentRoles";
import {
  buildWorkshop,
  compileExpression,
  defaultSettings,
  type WorkshopNode,
  type WorkshopStep,
  type Settings,
} from "./workshops";
import { memoryAction, initialMemory, networkModel } from "./engines";
export interface LessonFrame {
  nodes: WorkshopNode[];
  step: WorkshopStep;
  focus: string[];
  narration: string;
}
type NodeSpec = [string, string, WorkshopNode["kind"]?];
const positions: [number, number, number][] = [
  [-3.3, 0, -1.5],
  [-0.7, 0, -1.5],
  [2.3, 0, -1.5],
  [-2.6, 0, 1.5],
  [0.4, 0, 1.5],
  [3.3, 0, 1.5],
];
function nodes(specs: NodeSpec[]): WorkshopNode[] {
  return specs.map(([id, label, kind = "control"], i) => ({
    id,
    label,
    kind,
    position: positions[i],
    detail: label,
  }));
}
function frame(
  ns: WorkshopNode[],
  index: number,
  from: string,
  to: string,
  payload: string,
  values: Record<string, string>,
  lost = false,
): LessonFrame {
  const a = ns.find((n) => n.id === from)!,
    b = ns.find((n) => n.id === to)!;
  const point = (n: WorkshopNode): [number, number, number] => [
    n.position[0],
    n.kind === "server" ? 1.3 : 0.65,
    n.position[2] + (n.kind === "server" ? 0.8 : 0),
  ];
  const start = point(a),
    end = point(b);
  return {
    nodes: ns,
    focus: [from],
    narration: "",
    step: {
      title: `Etapa ${index + 1}`,
      log: "",
      values,
      flow: {
        id: index + 1,
        from: start,
        to: lost
          ? [(start[0] + end[0]) / 2, 1.6, (start[2] + end[2]) / 2]
          : end,
        source: a.label,
        target: lost ? "Sem entrega" : b.label,
        payload,
        explanation: "",
        lost,
        receiver: lost ? undefined : to,
      },
    },
  };
}
function fromRun(
  id: Parameters<typeof buildWorkshop>[0],
  indices: [number, number, number],
  patch: Partial<Settings> = {},
): LessonFrame[] {
  const run = buildWorkshop(id, { ...defaultSettings, ...patch });
  return indices.map((i) => ({
    nodes: run.nodes,
    step: run.steps[i],
    focus: run.steps[i].flow
      ? [run.nodes.find((n) => n.label === run.steps[i].flow!.source)!.id]
      : [],
    narration: "",
  }));
}
export function lessonFrames(
  id: LabId,
  chapter: number,
): [LessonFrame, LessonFrame, LessonFrame] {
  let fs: LessonFrame[] = [];
  const custom = (
    spec: NodeSpec[],
    events: [string, string, string, Record<string, string>, boolean?][],
  ) => {
    const ns = nodes(spec);
    let values: Record<string, string> = Object.fromEntries(
      spec.map(([key]) => [key, "—"]),
    );
    return events.map(([from, to, payload, updates, lost], i) => {
      values = { ...values, ...updates };
      return frame(ns, i, from, to, payload, values, lost);
    });
  };
  if (id === "logic") {
    if (chapter === 0)
      fs = custom(
        [
          ["bits", "BITS", "register"],
          ["weights", "PESOS"],
          ["sum", "SOMA", "cpu"],
          ["out", "DECIMAL", "register"],
        ],
        [
          [
            "bits",
            "weights",
            "1101₂",
            { bits: "1101", weights: "8 | 4 | 2 | 1" },
          ],
          [
            "weights",
            "sum",
            "8 + 4 + 1",
            { weights: "1 | 1 | 0 | 1", sum: "8+4+1" },
          ],
          ["sum", "out", String(8 + 4 + 1), { sum: "13", out: "13 sem sinal" }],
        ],
      );
    if (chapter === 1)
      fs = custom(
        [
          ["inputs", "A / B", "register"],
          ["and", "AND", "cpu"],
          ["not", "NOT", "cpu"],
          ["out", "NAND", "register"],
        ],
        [
          ["inputs", "and", "A=1, B=1", { inputs: "1, 1", and: "A AND B" }],
          ["and", "not", "AND = 1", { and: "1", not: "NOT 1" }],
          ["not", "out", "NAND = 0", { not: "0", out: "0" }],
        ],
      );
    if (chapter === 2)
      fs = custom(
        [
          ["inputs", "A / B", "register"],
          ["xor", "XOR", "cpu"],
          ["and", "AND", "cpu"],
          ["out", "SOMA / CARRY", "register"],
        ],
        [
          ["inputs", "xor", "1 XOR 1 = 0", { inputs: "1,1", xor: "soma=0" }],
          ["inputs", "and", "1 AND 1 = 1", { and: "carry=1" }],
          [
            "and",
            "out",
            "carry=1, soma=0 → 10₂",
            { out: "10₂ = 2", xor: "0", and: "1" },
          ],
        ],
      );
  }
  if (id === "cpu") {
    if (chapter === 0)
      fs = custom(
        [
          ["pc", "PC", "register"],
          ["rom", "ROM"],
          ["ir", "IR", "register"],
          ["ram", "RAM[8]"],
          ["acc", "ACC", "register"],
        ],
        [
          [
            "pc",
            "rom",
            "endereço 0",
            { pc: "0", rom: "LOAD [8]", ram: "5", acc: "0" },
          ],
          ["rom", "ir", "LOAD [0x08]", { pc: "1", ir: "LOAD [8]" }],
          ["ram", "acc", "byte 5", { acc: "5" }],
        ],
      );
    if (chapter === 1)
      fs = custom(
        [
          ["rom", "ROM"],
          ["ir", "IR", "register"],
          ["control", "CONTROLE", "cpu"],
          ["ram", "RAM[8]"],
          ["acc", "ACC", "register"],
          ["pc", "PC", "register"],
        ],
        [
          [
            "rom",
            "ir",
            "FETCH · LOAD [8]",
            { rom: "LOAD [8]", ir: "LOAD [8]", ram: "5", acc: "0", pc: "1" },
          ],
          ["ir", "control", "DECODE · LOAD", { control: "ler RAM[8]" }],
          ["ram", "acc", "EXECUTE · 5", { acc: "5" }],
        ],
      );
    if (chapter === 2)
      fs = custom(
        [
          ["alu", "ALU", "cpu"],
          ["wide", "SOMA AMPLA", "register"],
          ["acc", "ACC · 8 BITS", "register"],
          ["ram", "RAM[10]"],
        ],
        [
          [
            "alu",
            "wide",
            `250 + 10 = ${250 + 10}`,
            { alu: "250+10", wide: String(250 + 10), acc: "250" },
          ],
          [
            "wide",
            "acc",
            `260 mod 256 = ${(250 + 10) & 255}`,
            { acc: String((250 + 10) & 255) },
          ],
          ["acc", "ram", "STORE · 4", { ram: "4" }],
        ],
      );
  }
  if (id === "memory") {
    if (chapter === 0) {
      const a = memoryAction(initialMemory(), "push", 4),
        b = memoryAction(a, "push", 8),
        d = memoryAction(b, "pop");
      fs = custom(
        [
          ["program", "PROGRAMA", "cpu"],
          ["s31", "STACK 0x1F", "register"],
          ["s30", "STACK 0x1E", "register"],
        ],
        [
          [
            "program",
            "s31",
            `PUSH ${a.stack[0]}`,
            { s31: "4", s30: "livre", program: "PUSH 4" },
          ],
          [
            "program",
            "s30",
            `PUSH ${b.stack[1]}`,
            { s30: "8", program: "PUSH 8" },
          ],
          [
            "s30",
            "program",
            "POP 8",
            { s30: "livre", program: "recebeu 8", s31: String(d.stack[0]) },
          ],
        ],
      );
    }
    if (chapter === 1)
      fs = custom(
        [
          ["program", "ALOCADOR", "cpu"],
          ["a", "BLOCO 0x00"],
          ["b", "BLOCO 0x04"],
        ],
        [
          ["program", "a", "malloc(4) → 0x00", { a: "[0..3] reservado" }],
          ["program", "b", "malloc(8) → 0x04", { b: "[4..11] reservado" }],
          [
            "program",
            "b",
            "free → malloc(2) em 0x04",
            { b: "[4..5] reservado", program: "reutilizou intervalo" },
          ],
        ],
      );
    if (chapter === 2)
      fs = custom(
        [
          ["virtual", "END. VIRTUAL", "register"],
          ["mmu", "MMU", "cpu"],
          ["table", "TABELA"],
          ["physical", "RAM FÍSICA"],
        ],
        [
          [
            "virtual",
            "mmu",
            "35 = página 2 + offset 3",
            { virtual: "35", mmu: "página 2; offset 3" },
          ],
          [
            "table",
            "mmu",
            "página 2 → frame 7",
            { table: "2 → 7", mmu: "frame 7; offset 3" },
          ],
          [
            "mmu",
            "physical",
            `7×16+3 = ${7 * 16 + 3}`,
            { physical: "endereço 115" },
          ],
        ],
      );
  }
  if (id === "os") {
    if (chapter === 0)
      fs = custom(
        [
          ["p", "P1", "register"],
          ["queue", "FILA"],
          ["cpu", "CPU", "cpu"],
        ],
        [
          [
            "p",
            "queue",
            "P1 pronto",
            { p: "3 restantes", queue: "P1, P2, P3", cpu: "ociosa" },
          ],
          [
            "queue",
            "cpu",
            "despachar P1",
            { cpu: "P1 executando", queue: "P2, P3" },
          ],
          [
            "cpu",
            "queue",
            "contexto P1 preservado",
            { p: "2 restantes", cpu: "ociosa", queue: "P2, P3, P1" },
          ],
        ],
      );
    if (chapter === 1) fs = fromRun("os", [2, 3, 12]);
    if (chapter === 2)
      fs = custom(
        [
          ["app", "PROGRAMA", "register"],
          ["kernel", "KERNEL", "cpu"],
          ["buffer", "BUFFER"],
          ["device", "ARQUIVO", "storage"],
        ],
        [
          [
            "app",
            "kernel",
            "read(fd, buffer, 100)",
            { app: "pede 100 bytes", kernel: "validar descritor" },
          ],
          [
            "device",
            "buffer",
            "20 bytes disponíveis",
            { buffer: "20 bytes", kernel: "retorno = 20" },
          ],
          ["kernel", "app", "read retornou 20", { app: "tratar 20 bytes" }],
        ],
      );
  }
  if (id === "network") {
    if (chapter < 2) {
      const run = networkModel(40, chapter === 1),
        ns = nodes([
          ["client", "CLIENTE", "register"],
          ["dns", "DNS", "server"],
          ["server", "SERVIDOR", "server"],
        ]);
      const msgs =
        chapter === 0
          ? [
              ["client", "dns", "A academy.example"],
              ["dns", "client", "192.0.2.10"],
              ["client", "server", "SYN · seq=100"],
            ]
          : [
              ["client", "server", "SYN · seq=100"],
              ["server", "client", "SYN-ACK · ack=101, seq=500"],
              ["client", "server", "ACK=501 + GET /"],
            ];
      let state = run.initial();
      fs = msgs.map(([from, to, payload], i) => {
        state = run.step(state);
        return frame(ns, i, from, to, payload, {
          client: state.status,
          dns: "192.0.2.10",
          server: state.log,
        });
      });
    } else {
      const total = (cached: boolean, loss: boolean) => {
        const m = networkModel(40, cached, loss);
        let s = m.initial();
        while (!m.done(s)) s = m.step(s);
        return s.elapsed;
      };
      fs = custom(
        [
          ["client", "CLIENTE", "register"],
          ["dns", "DNS", "server"],
          ["server", "SERVIDOR", "server"],
        ],
        [
          [
            "server",
            "client",
            "6 trechos × 40 ms = 240 ms",
            {
              client: "240 ms · só rede",
              server: "processamento não somado",
              dns: "2 trechos · 80 ms",
            },
          ],
          [
            "server",
            "client",
            `240 + 20 = ${total(false, false)} ms`,
            { client: "260 ms", server: "20 ms processamento" },
          ],
          [
            "server",
            "client",
            `cache: ${total(true, false)} ms; com perda: ${total(true, true)} ms`,
            {
              client: "180 ms; perda → 1180 ms",
              dns: "cache · evita 80 ms",
              server: "perda acrescenta 1000 ms",
            },
          ],
        ],
      );
    }
  }
  if (id === "database") {
    if (chapter === 0) fs = fromRun("database", [1, 2, 3], { key: 12 });
    if (chapter === 1) {
      fs = fromRun("database", [1, 2, 3]);
      fs[2].step = {
        ...fs[2].step,
        values: { ...fs[2].step.values, query: "1 raiz + 1 página" },
      };
    }
    if (chapter === 2)
      fs = custom(
        [
          ["sql", "APLICAÇÃO", "cpu"],
          ["txn", "TRANSAÇÃO", "register"],
          ["wal", "WAL", "storage"],
          ["accounts", "CONTAS", "storage"],
        ],
        [
          [
            "sql",
            "txn",
            "BEGIN",
            { txn: "ativa", accounts: "A=100; B=50", wal: "sem confirmação" },
          ],
          [
            "txn",
            "wal",
            "débito 10 + crédito 10 pendentes",
            {
              txn: "A=90; B=60 pendentes",
              wal: "mudanças registradas",
              accounts: "A=100; B=50",
            },
          ],
          [
            "wal",
            "accounts",
            "COMMIT · A=90, B=60",
            {
              txn: "confirmada",
              wal: "registro de commit",
              accounts: "A=90; B=60",
            },
          ],
        ],
      );
  }
  if (id === "compiler") {
    if (chapter === 0) {
      const parsed = compileExpression("12 + 3");
      fs = custom(
        [
          ["source", "FONTE", "register"],
          ["lexer", "LEXER", "cpu"],
          ["tokens", "TOKENS", "register"],
          ["parser", "PARSER", "cpu"],
        ],
        [
          [
            "source",
            "lexer",
            "NUMBER(12)",
            { source: "12 + 3", lexer: "agrupou 1 e 2" },
          ],
          [
            "lexer",
            "tokens",
            parsed.tokens.join(" | "),
            { tokens: parsed.tokens.join(" | ") },
          ],
          ["tokens", "parser", parsed.ast, { parser: parsed.ast }],
        ],
      );
    }
    if (chapter === 1) {
      const parsed = compileExpression("2 + 3 * 4");
      fs = custom(
        [
          ["numbers", "OPERANDOS", "register"],
          ["mul", "SUBÁRVORE MUL", "cpu"],
          ["add", "RAIZ ADD", "cpu"],
          ["vm", "BYTECODE", "register"],
        ],
        [
          ["numbers", "mul", "MUL(3,4)", { numbers: "2,3,4", mul: "MUL(3,4)" }],
          ["mul", "add", parsed.ast, { add: parsed.ast }],
          [
            "add",
            "vm",
            "PUSH 2; PUSH 3; PUSH 4; MUL; ADD",
            { vm: "5 instruções" },
          ],
        ],
      );
    }
    if (chapter === 2) fs = fromRun("compiler", [6, 7, 8]);
  }
  if (id === "infra") {
    if (chapter === 0) fs = fromRun("infra", [1, 2, 4], { cache: false });
    if (chapter === 1) fs = fromRun("infra", [2, 3, 6], { cache: true });
    if (chapter === 2) {
      fs = fromRun("infra", [1, 6, 8], { cache: false, offline: 1 });
      const ns = fs[0].nodes;
      fs[0] = frame(
        ns,
        0,
        "a",
        "edge",
        "health check: APP A fora",
        {
          client: "aguarda",
          edge: "saudáveis: B",
          a: "OFFLINE",
          b: "saudável",
        },
        true,
      );
    }
  }
  if (id === "architecture") {
    if (chapter === 0)
      fs = custom(
        [
          ["user", "USUÁRIO", "register"],
          ["api", "SISTEMA / API", "server"],
          ["db", "BANCO", "storage"],
          ["leader", "LÍDER", "server"],
          ["replica", "RÉPLICA", "server"],
        ],
        [
          [
            "user",
            "api",
            "pedido do usuário",
            { user: "ator externo", api: "sistema em estudo" },
          ],
          [
            "api",
            "db",
            "consulta da aplicação",
            { api: "container API", db: "container de dados" },
          ],
          [
            "leader",
            "replica",
            "SET x=42",
            { leader: "coordena escrita", replica: "recebe mensagem" },
          ],
        ],
      );
    if (chapter === 1) fs = fromRun("architecture", [1, 4, 5], { offline: 1 });
    if (chapter === 2) fs = fromRun("architecture", [1, 3, 4], { offline: 2 });
  }
  if (fs.length !== 3) throw Error(`Aula sem três estados: ${id}/${chapter}`);
  return fs.map((f, i) => ({
    ...f,
    nodes: f.nodes.map((n) => ({ ...n, detail: componentRole(id, n) })),
    narration: teachingGuides[id][chapter].steps[i],
    step: {
      ...f.step,
      title: `Passo ${i + 1}`,
      log: teachingGuides[id][chapter].steps[i],
      flow: f.step.flow
        ? {
            ...f.step.flow,
            id: i + 1,
            explanation: teachingGuides[id][chapter].steps[i],
          }
        : undefined,
    },
  })) as [LessonFrame, LessonFrame, LessonFrame];
}
