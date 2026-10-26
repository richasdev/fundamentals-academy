import type { ExtendedLabId } from "../content/lessons";
import type { FlowEvent, Vec3 } from "./flows";
export type Gate = "NAND" | "AND" | "OR" | "XOR";
export type Settings = {
  a: number;
  b: number;
  gate: Gate;
  quantum: number;
  cache: boolean;
  offline: number;
  indexed: boolean;
  key: number;
  expression: string;
  io?: boolean;
  ttl?: number;
  interval?: number;
  originVersion?: number;
  transaction?: boolean;
  abort?: boolean;
  logicMode?: "gate" | "not" | "half";
};
export const defaultSettings: Settings = {
  a: 1,
  b: 1,
  gate: "NAND",
  quantum: 1,
  cache: true,
  offline: 0,
  indexed: true,
  key: 20,
  expression: "2 + 3 * 4",
};
export type WorkshopNode = {
  id: string;
  label: string;
  detail: string;
  position: Vec3;
  visual?: "page" | "queue" | "process" | "ast" | "stack" | "terminal";
  entries?: string[];
  kind: "control" | "server" | "cpu" | "register" | "storage";
};
export type WorkshopStep = {
  title: string;
  log: string;
  values: Record<string, string>;
  flow?: FlowEvent;
  result?: string;
  timeline?: { process: string; start: number; end: number }[];
};
export type WorkshopRun = {
  nodes: WorkshopNode[];
  steps: WorkshopStep[];
  code: string;
  edges?: [string, string][];
  error?: string;
};
const node = (
  id: string,
  label: string,
  detail: string,
  x: number,
  z: number,
  kind: WorkshopNode["kind"] = "control",
): WorkshopNode => ({ id, label, detail, position: [x, 0, z], kind });
export function gateValue(gate: Gate, a: number, b: number) {
  return gate === "NAND"
    ? 1 - (a & b)
    : gate === "AND"
      ? a & b
      : gate === "OR"
        ? a | b
        : a ^ b;
}

export type Ast = { value: number } | { op: "+" | "*"; left: Ast; right: Ast };
type Instruction = ({ op: "PUSH"; value: number } | { op: "ADD" | "MUL" }) & {
  origin?: string;
};
export function compileExpression(source: string): {
  tokens: string[];
  ast: string;
  instructions: Instruction[];
  tree: Ast;
} {
  if (!source.trim() || source.length > 60 || /[^\d+*()\s]/.test(source))
    throw Error("Use até 60 caracteres: números, +, *, espaços e parênteses.");
  const tokens = source.match(/\d+|[+*()]/g)!;
  if (tokens.some((t) => /^\d{4,}$/.test(t)))
    throw Error("Use números de até três dígitos.");
  let cursor = 0;
  function factor(): Ast {
    const token = tokens[cursor++];
    if (token === "(") {
      const tree = expression();
      if (tokens[cursor++] !== ")") throw Error("Falta fechar um parêntese.");
      return tree;
    }
    if (token && /^\d+$/.test(token)) return { value: Number(token) };
    throw Error("Era esperado um número ou uma expressão entre parênteses.");
  }
  function term(): Ast {
    let tree = factor();
    while (tokens[cursor] === "*") {
      cursor++;
      tree = { op: "*", left: tree, right: factor() };
    }
    return tree;
  }
  function expression(): Ast {
    let tree = term();
    while (tokens[cursor] === "+") {
      cursor++;
      tree = { op: "+", left: tree, right: term() };
    }
    return tree;
  }
  const tree = expression();
  if (cursor !== tokens.length)
    throw Error(
      "Há tokens fora da expressão. Verifique operadores e parênteses.",
    );
  const instructions: Instruction[] = [];
  function emit(ast: Ast, path = "root"): string {
    if ("value" in ast) {
      instructions.push({ op: "PUSH", value: ast.value, origin: path });
      return String(ast.value);
    }
    const left = emit(ast.left, path + "l"),
      right = emit(ast.right, path + "r");
    instructions.push({ op: ast.op === "+" ? "ADD" : "MUL", origin: path });
    return `${ast.op === "+" ? "ADD" : "MUL"}(${left}, ${right})`;
  }
  const ast = emit(tree);
  const check: number[] = [];
  for (const i of instructions) {
    if (i.op === "PUSH") check.push(i.value);
    else {
      const b = check.pop()!,
        a = check.pop()!;
      const n = i.op === "ADD" ? a + b : a * b;
      if (!Number.isSafeInteger(n))
        throw Error(
          "O resultado excede o intervalo de inteiros seguros. Use números menores.",
        );
      check.push(n);
    }
  }
  return { tokens, ast, instructions, tree };
}

export function buildWorkshop(id: ExtendedLabId, p: Settings): WorkshopRun {
  let nodes: WorkshopNode[] = [];
  const steps: WorkshopStep[] = [];
  let values: Record<string, string> = {};
  let code = "";
  let timeline: { process: string; start: number; end: number }[] = [];
  function add(
    title: string,
    log: string,
    from?: string,
    to?: string,
    payload = "",
    updates: Record<string, string> = {},
    lost = false,
    result?: string,
  ) {
    values = { ...values, ...updates };
    const origin = nodes.find((n) => n.id === from),
      target = nodes.find((n) => n.id === to);
    const end: Vec3 | undefined = target && [
      target.position[0],
      target.kind === "server" ? 1.35 : 0.65,
      target.position[2] + (target.kind === "server" ? 0.8 : 0),
    ];
    steps.push({
      title,
      log,
      timeline: timeline.length ? timeline.map((t) => ({ ...t })) : undefined,
      values: { ...values },
      result,
      flow:
        origin && target && end
          ? {
              id: steps.length + 1,
              from: [
                origin.position[0],
                origin.kind === "server" ? 1.35 : 0.65,
                origin.position[2] + (origin.kind === "server" ? 0.8 : 0),
              ],
              to: lost
                ? [
                    (origin.position[0] + end[0]) / 2,
                    1.6,
                    (origin.position[2] + end[2]) / 2,
                  ]
                : end,
              source: origin.label,
              sender: origin.id,
              target: lost ? "Destino indisponível" : target.label,
              payload,
              explanation: log,
              receiver: lost ? undefined : target.id,
              lost,
            }
          : undefined,
    });
  }
  if (id === "logic") {
    nodes = [
      node(
        "a",
        "ENTRADA A",
        "Chave lógica A: altera um bit de entrada.",
        -3,
        -1.5,
        "register",
      ),
      node(
        "b",
        "ENTRADA B",
        "Chave lógica B: segunda entrada independente.",
        -3,
        1.5,
        "register",
      ),
      node(
        "gate",
        p.gate,
        "CI combinacional: calcula a função escolhida sobre A e B.",
        0,
        0,
        "cpu",
      ),
      node(
        "out",
        "SAÍDA Y",
        "Indicador lógico do resultado. Não armazena estado.",
        3,
        0,
        "register",
      ),
    ];
    if (p.logicMode === "not") {
      nodes[1] = { ...nodes[1], label: "CÓPIA DE A" };
      values = { a: String(p.a), b: String(p.a), gate: "aguarda", out: "?" };
      add(
        "NOT com NAND",
        "As duas entradas da NAND recebem o mesmo A. Não há armazenamento entre as entradas.",
      );
      add(
        "Primeira entrada",
        `A=${p.a} chega ao primeiro terminal.`,
        "a",
        "gate",
        `A=${p.a}`,
        { gate: `A=${p.a}` },
      );
      add(
        "Segunda entrada",
        `O mesmo A=${p.a} chega ao segundo terminal.`,
        "b",
        "gate",
        `A=${p.a}`,
        { gate: `A=${p.a}, A=${p.a}` },
      );
      add(
        "Inverter",
        `NAND(${p.a},${p.a})=${1 - p.a}: a saída é NOT A.`,
        "gate",
        "out",
        `NOT A=${1 - p.a}`,
        { out: String(1 - p.a), gate: String(1 - p.a) },
        false,
        `NOT A = ${1 - p.a}`,
      );
      code = "NOT A = NAND(A, A)";
    } else if (p.logicMode === "half") {
      nodes[2] = { ...nodes[2], label: "XOR · SOMA" };
      nodes.push(
        node(
          "carry",
          "AND · CARRY",
          "O transporte indica que o resultado precisa de um segundo bit.",
          0,
          2,
          "cpu",
        ),
      );
      values = {
        a: String(p.a),
        b: String(p.b),
        gate: "aguarda",
        carry: "aguarda",
        out: "?",
      };
      add(
        "Meio somador",
        "XOR calcula o bit de soma; AND calcula o transporte. Duas funções combinacionais recebem A e B.",
      );
      add("Entrada A", `A=${p.a} chega à XOR.`, "a", "gate", `A=${p.a}`, {
        gate: `A=${p.a}`,
      });
      add(
        "Entrada B",
        `B=${p.b} completa a entrada da XOR.`,
        "b",
        "gate",
        `B=${p.b}`,
        { gate: `soma=${p.a ^ p.b}` },
      );
      add(
        "Carry: entrada A",
        `A=${p.a} também alimenta a AND.`,
        "a",
        "carry",
        `A=${p.a}`,
        { carry: `A=${p.a}` },
      );
      add(
        "Carry: entrada B",
        `AND(${p.a},${p.b})=${p.a & p.b}.`,
        "b",
        "carry",
        `B=${p.b}`,
        { carry: String(p.a & p.b) },
      );
      add(
        "Bit de soma",
        `XOR(${p.a},${p.b})=${p.a ^ p.b}.`,
        "gate",
        "out",
        `soma=${p.a ^ p.b}`,
        { out: `soma=${p.a ^ p.b}` },
      );
      add(
        "Resultado de dois bits",
        `${p.a}+${p.b} = ${(p.a & p.b) * 2 + (p.a ^ p.b)}. Leia carry seguido de soma.`,
        "carry",
        "out",
        `carry=${p.a & p.b}`,
        { out: `${p.a & p.b}${p.a ^ p.b}₂` },
        false,
        `${p.a + p.b} = ${p.a & p.b}${p.a ^ p.b}₂`,
      );
      code = "soma = A XOR B\ncarry = A AND B\nresultado = carry × 2 + soma";
    } else {
      const y = gateValue(p.gate, p.a, p.b);
      values = {
        a: String(p.a),
        b: String(p.b),
        gate: "aguarda sinais",
        out: "?",
      };
      add(
        "Circuito pronto",
        "Escolha entradas e porta. A saída será calculada depois da propagação didática.",
      );
      add("Entrada A", `A porta recebe A=${p.a}.`, "a", "gate", `A = ${p.a}`, {
        gate: `A=${p.a}`,
      });
      add(
        "Entrada B",
        `A porta recebe B=${p.b}; a função ${p.gate} já pode ser avaliada.`,
        "b",
        "gate",
        `B = ${p.b}`,
        { gate: `A=${p.a}, B=${p.b}` },
      );
      add(
        "Resultado",
        `${p.gate}(${p.a}, ${p.b}) = ${y}. Confira a tabela-verdade.`,
        "gate",
        "out",
        `Y = ${y}`,
        { gate: String(y), out: String(y) },
        false,
        `Y = ${y}`,
      );
      code = `Y = ${p.gate}(A, B)\nA = ${p.a}\nB = ${p.b}\n\n${[0, 1].flatMap((a) => [0, 1].map((b) => `${a} ${b} → ${gateValue(p.gate, a, b)}`)).join("\n")}`;
    }
  }
  if (id === "os") {
    nodes = [
      node(
        "queue",
        "FILA",
        "Fila de prontos; processos incompletos retornam ao fim.",
        -3,
        0,
      ),
      node(
        "cpu",
        "NÚCLEO",
        "Um único núcleo executa um processo por turno.",
        0,
        0,
        "cpu",
      ),
      node(
        "p1",
        "P1",
        "Processo P1: demanda inicial de 3 unidades de CPU.",
        3,
        -2,
        "register",
      ),
      node(
        "p2",
        "P2",
        "Processo P2: demanda inicial de 2 unidades de CPU.",
        3,
        0,
        "register",
      ),
      node(
        "p3",
        "P3",
        "Processo P3: demanda inicial de 1 unidade de CPU.",
        3,
        2,
        "register",
      ),
    ];
    nodes = nodes.map((n) => ({
      ...n,
      visual:
        n.id === "queue"
          ? "queue"
          : n.id.startsWith("p")
            ? "process"
            : undefined,
    }));
    if (p.io)
      nodes.push({
        ...node(
          "io",
          "ESPERA DE I/O",
          "P1 aguarda uma leitura por duas unidades; não disputa CPU durante a espera.",
          -3,
          2,
        ),
        visual: "queue",
      });
    const remaining = [3, 2, 1],
      queue = [0, 1, 2];
    let time = 0;
    values = {
      queue: "P1, P2, P3",
      cpu: "ocioso",
      p1: "3 restantes",
      p2: "2 restantes",
      p3: "1 restante",
    };
    add("Fila pronta", "Todos chegam em t=0. A fila inicial é P1 → P2 → P3.");
    let blockedUntil: number | null = null,
      blockedOnce = false;
    while (queue.length || blockedUntil !== null) {
      if (blockedUntil !== null && (!queue.length || time >= blockedUntil)) {
        time = Math.max(time, blockedUntil);
        blockedUntil = null;
        queue.push(0);
        add(
          "I/O concluído",
          `t=${time}: a leitura terminou. P1 volta à fila de prontos.`,
          "io",
          "queue",
          "P1 pronto",
          {
            io: "vazia",
            p1: `${remaining[0]} restantes`,
            queue: queue.map((n) => `P${n + 1}`).join(", "),
          },
        );
      }
      const i = queue.shift()!;
      const used = Math.min(
        p.quantum,
        remaining[i],
        p.io && i === 0 && !blockedOnce ? 1 : Infinity,
      );
      add(
        `Despachar P${i + 1}`,
        `O escalonador entrega a CPU a P${i + 1} por até ${p.quantum} unidades.`,
        "queue",
        "cpu",
        `P${i + 1} · ${remaining[i]} restantes`,
        {
          cpu: `P${i + 1}`,
          queue: queue.map((n) => `P${n + 1}`).join(", ") || "vazia",
        },
      );
      timeline.push({ process: `P${i + 1}`, start: time, end: time + used });
      remaining[i] -= used;
      time += used;
      if (p.io && i === 0 && !blockedOnce && remaining[i]) {
        blockedOnce = true;
        blockedUntil = time + 2;
        add(
          "P1 bloqueado",
          `t=${time}: P1 solicita leitura e espera até t=${blockedUntil}. A CPU fica disponível para outro processo.`,
          "cpu",
          "io",
          "read() · aguardar",
          {
            cpu: "ocioso",
            p1: "bloqueado",
            io: `P1 até t=${blockedUntil}`,
            queue: queue.map((n) => `P${n + 1}`).join(", ") || "vazia",
          },
        );
        continue;
      }
      if (remaining[i]) queue.push(i);
      add(
        remaining[i] ? "Quantum encerrado" : `P${i + 1} terminou`,
        `P${i + 1} executou ${used}; t=${time}. ${remaining[i] ? "Retorna ao fim da fila." : "Não precisa retornar à fila."}`,
        "cpu",
        `p${i + 1}`,
        `P${i + 1} · resta ${remaining[i]}`,
        {
          [`p${i + 1}`]: `${remaining[i]} restantes`,
          cpu: "ocioso",
          queue: queue.map((n) => `P${n + 1}`).join(", ") || "vazia",
        },
        false,
        queue.length || blockedUntil !== null
          ? undefined
          : `Todos concluídos em t=${time}`,
      );
    }
    code = `quantum = ${p.quantum}\nchegada = [0, 0, 0]\ndemanda = [3, 2, 1]\n\np = fila.shift()\nexecutar(min(quantum, restante))\nse restante > 0:\n  fila.push(p)`;
  }
  if (id === "infra") {
    nodes = [
      node(
        "client",
        "CLIENTE",
        "Solicita GET / duas vezes, em sequência.",
        -3.5,
        0,
        "control",
      ),
      node(
        "edge",
        "BORDA",
        "Cache de uma entrada e balanceador round-robin.",
        -0.7,
        0,
        "server",
      ),
      node(
        "a",
        "APP A",
        "Instância A; removida do roteamento quando indisponível.",
        3,
        -1.7,
        "server",
      ),
      node(
        "b",
        "APP B",
        "Instância B; responde com o mesmo recurso público.",
        3,
        1.7,
        "server",
      ),
    ];
    values = {
      client: "aguarda",
      edge: p.cache ? "cache vazio" : "cache OFF",
      a: p.offline ? "OFFLINE" : "saudável",
      b: "saudável",
    };
    add(
      "Serviço pronto",
      "Duas leituras do mesmo recurso. O cache começa vazio.",
    );
    let cached = false,
      originRequests = 0,
      hits = 0,
      cachedAt = 0,
      storedVersion = 1;
    for (let request = 1; request <= 2; request++) {
      add(
        `Requisição ${request}`,
        `GET / #${request} chega à borda.`,
        "client",
        "edge",
        `GET / #${request}`,
      );
      const now = (request - 1) * (p.interval ?? 10),
        version = request === 1 ? 1 : (p.originVersion ?? 1);
      if (p.cache && cached && now - cachedAt >= (p.ttl ?? 60)) {
        add(
          "Cache expirou",
          `t=${now}s: a idade ${now - cachedAt}s atingiu TTL=${p.ttl ?? 60}s. A borda precisa consultar a origem.`,
          undefined,
          undefined,
          "",
          { edge: "EXPIRADO" },
        );
        cached = false;
      }
      if (p.cache && cached) {
        hits++;
        add(
          "Cache HIT",
          `t=${now}s: resposta v${storedVersion} ainda válida por TTL. ${version !== storedVersion ? "A origem mudou, mas a cópia ainda não expirou." : "Nenhuma instância é consultada."}`,
          "edge",
          "client",
          `200 OK · HIT · v${storedVersion}`,
          {
            client: `200 OK · v${storedVersion}`,
            edge: `HIT · v${storedVersion}`,
          },
        );
      } else {
        const dest = p.offline ? "b" : originRequests % 2 === 0 ? "a" : "b";
        originRequests++;
        add(
          p.cache ? "Cache MISS" : "Balancear",
          `A borda encaminha GET / para APP ${dest.toUpperCase()}; destinos indisponíveis são ignorados.`,
          "edge",
          dest,
          `GET / #${request}`,
          {
            edge: p.cache ? "MISS" : "cache OFF",
            [dest]: `atende #${request}`,
          },
        );
        cached = p.cache;
        cachedAt = now;
        storedVersion = version;
        add(
          "Resposta da aplicação",
          "A instância devolve o recurso público. A borda armazena apenas se o cache estiver habilitado.",
          dest,
          "edge",
          `200 OK · corpo HTML v${version}`,
          {
            edge: p.cache
              ? `v${version} armazenada em t=${now}s`
              : `encaminhar v${version}`,
          },
        );
        add(
          "Entregar ao cliente",
          "O cliente recebe a resposta da aplicação pela borda.",
          "edge",
          "client",
          `200 OK · origem v${version}`,
          { client: `200 OK · v${version}` },
        );
      }
    }
    add(
      "Comparação",
      `${originRequests} requisição(ões) chegaram às aplicações; ${2 - originRequests} foram atendidas pelo cache.`,
      undefined,
      undefined,
      "",
      {},
      false,
      `${originRequests} visitas à origem · ${2 - originRequests} HIT`,
    );
    code = `GET / × 2\ncache: ${p.cache ? "ON" : "OFF"}\nsaudáveis: ${p.offline ? "[B]" : "[A, B]"}\n\nse cache válido: responder\nsenão: escolher próximo saudável\n  buscar → armazenar → responder`;
  }
  if (id === "database") {
    if (p.transaction) {
      nodes = [
        {
          ...node(
            "transaction",
            "TRANSAÇÃO",
            "Agrupa as alterações; só COMMIT torna os dois saldos visíveis em conjunto.",
            -3,
            0,
          ),
          visual: "terminal",
        },
        {
          ...node(
            "buffer",
            "MUDANÇAS PENDENTES",
            "Guarda a proposta antes da confirmação.",
            0,
            0,
          ),
          visual: "terminal",
        },
        {
          ...node(
            "a",
            "CONTA A",
            "Saldo confirmado da conta A.",
            3,
            -1.4,
            "storage",
          ),
          visual: "page",
          entries: ["saldo"],
        },
        {
          ...node(
            "b",
            "CONTA B",
            "Saldo confirmado da conta B.",
            3,
            1.4,
            "storage",
          ),
          visual: "page",
          entries: ["saldo"],
        },
      ];
      values = {
        transaction: "sem transação",
        buffer: "vazio",
        a: "100 confirmados",
        b: "50 confirmados",
      };
      add("Saldos iniciais", "A=100 e B=50; total confirmado 150.");
      add(
        "BEGIN",
        "A transação começa. Ainda não há alteração nos saldos confirmados.",
        "transaction",
        "buffer",
        "BEGIN",
        { transaction: "em andamento", buffer: "transação aberta" },
      );
      add(
        "Preparar débito",
        "A proposta reduz A para 90. Outras leituras continuam vendo o saldo confirmado 100 neste modelo.",
        "a",
        "buffer",
        "A: 100 → 90",
        { buffer: "A=90 pendente; B=50" },
      );
      add(
        "Preparar crédito",
        "A proposta acrescenta 10 em B. O conjunto pendente é A=90, B=60, total 150.",
        "b",
        "buffer",
        "B: 50 → 60",
        { buffer: "A=90; B=60 · pendentes" },
      );
      add(
        p.abort ? "ROLLBACK" : "COMMIT",
        p.abort
          ? "A falha ocorreu antes de confirmar. As propostas são descartadas; A=100 e B=50 continuam visíveis."
          : "COMMIT publica as duas alterações juntas. A=90 e B=60; o total confirmado continua 150.",
        "buffer",
        "transaction",
        p.abort ? "descartar proposta" : "confirmar alterações",
        {
          transaction: p.abort ? "ROLLBACK" : "COMMIT",
          buffer: "vazio",
          a: p.abort ? "100 confirmados" : "90 confirmados",
          b: p.abort ? "50 confirmados" : "60 confirmados",
        },
        false,
        p.abort ? "ROLLBACK · total 150" : "COMMIT · total 150",
      );
      return {
        nodes,
        steps,
        code:
          "BEGIN;\nUPDATE contas SET saldo = saldo - 10 WHERE id = 'A';\nUPDATE contas SET saldo = saldo + 10 WHERE id = 'B';\n" +
          (p.abort ? "ROLLBACK;" : "COMMIT;") +
          "\n\nModelo: atomicidade de duas alterações; sem motor SQL, WAL ou níveis de isolamento reais.",
      };
    }

    nodes = [
      node(
        "query",
        "CONSULTA",
        "Busca uma chave inteira; resultado pode conter zero ou uma linha.",
        -3.5,
        0,
      ),
      node(
        "root",
        "RAIZ",
        "Separadores 8 e 16 encaminham para uma das folhas.",
        -0.7,
        0,
        "control",
      ),
      node("a", "PÁGINA A", "Registros com ids 2, 4 e 6.", 3, -2, "storage"),
      node("b", "PÁGINA B", "Registros com ids 8, 10 e 12.", 3, 0, "storage"),
      node("c", "PÁGINA C", "Registros com ids 16, 18 e 20.", 3, 2, "storage"),
    ];
    nodes = nodes.map((n) => ({
      ...n,
      visual: n.kind === "storage" ? "page" : "terminal",
      entries:
        n.id === "a"
          ? ["2", "4", "6"]
          : n.id === "b"
            ? ["8", "10", "12"]
            : n.id === "c"
              ? ["16", "18", "20"]
              : undefined,
    }));
    const pages = [
      [2, 4, 6],
      [8, 10, 12],
      [16, 18, 20],
    ];
    values = {
      query: `id=${p.key}`,
      root: "8 | 16",
      a: "2 · 4 · 6",
      b: "8 · 10 · 12",
      c: "16 · 18 · 20",
    };
    add("Consulta pronta", `SELECT nome FROM pessoas WHERE id = ${p.key}.`);
    const chosen = p.key < 8 ? 0 : p.key < 16 ? 1 : 2;
    if (p.indexed)
      add(
        "Ler raiz",
        `Comparar ${p.key} com os separadores 8 e 16; seguir para ${["A", "B", "C"][chosen]}.`,
        "query",
        "root",
        `id=${p.key}`,
      );
    const visits = p.indexed ? [chosen] : [0, 1, 2];
    let count = 0,
      found = false;
    for (const i of visits) {
      count++;
      const target = ["a", "b", "c"][i];
      found = pages[i].includes(p.key);
      add(
        `Ler página ${target.toUpperCase()}`,
        `Comparar ${p.key} com [${pages[i].join(", ")}]. ${found ? "Registro encontrado." : "A chave não está nesta página."}`,
        p.indexed ? "root" : "query",
        target,
        `buscar id=${p.key}`,
        { [target]: found ? `id=${p.key} encontrado` : "sem correspondência" },
      );
      if (found) {
        add(
          "Retornar linha",
          `Uma linha: { id: ${p.key}, nome: Pessoa ${p.key} }.`,
          target,
          "query",
          `Pessoa ${p.key}`,
          { query: "1 linha" },
        );
        break;
      }
    }
    add(
      "Resultado",
      `${found ? "1 linha" : "0 linhas"}. ${count} página(s) de dados visitada(s)${p.indexed ? " + 1 raiz do índice" : ""}.`,
      undefined,
      undefined,
      "",
      { query: found ? "1 linha" : "0 linhas" },
      false,
      `${found ? "1 linha" : "0 linhas"} · ${count} página(s) de dados${p.indexed ? " + raiz" : ""}`,
    );
    code = `SELECT nome\nFROM pessoas\nWHERE id = ${p.key};\n\nplano: ${p.indexed ? "índice → folha" : "varredura sequencial"}\nraiz: [8 | 16]\nA [2,4,6] B [8,10,12] C [16,18,20]`;
  }
  if (id === "compiler") {
    nodes = [
      node(
        "source",
        "FONTE",
        "Texto original limitado a números, +, * e parênteses.",
        -3.5,
        -1,
      ),
      node(
        "lexer",
        "LEXER",
        "Agrupa caracteres em tokens, ignorando espaços.",
        -1.2,
        -1,
      ),
      node(
        "parser",
        "PARSER",
        "Constrói AST com precedência e valida a gramática.",
        1.2,
        -1,
      ),
      node(
        "vm",
        "VM",
        "Executa bytecode de pilha; nenhuma chamada a eval.",
        3.5,
        1,
        "cpu",
      ),
    ];
    values = {
      source: p.expression,
      lexer: "aguarda",
      parser: "aguarda",
      vm: "pilha []",
    };
    add("Código-fonte", "A expressão será analisada antes de gerar bytecode.");
    let compiled: ReturnType<typeof compileExpression>;
    try {
      compiled = compileExpression(p.expression);
    } catch (error) {
      return {
        nodes,
        steps,
        code: p.expression,
        error: (error as Error).message,
      };
    }
    nodes = nodes.map((n) => ({
      ...n,
      visual: n.id === "vm" ? "stack" : "terminal",
    }));
    const treeNodes: WorkshopNode[] = [];
    const treeEdges: [string, string][] = [];
    function place(
      tree: Ast,
      path: string,
      x: number,
      z: number,
      width: number,
    ) {
      const id = `ast-${path}`;
      treeNodes.push({
        ...node(
          id,
          "value" in tree ? String(tree.value) : tree.op,
          "Nó da árvore sintática; selecione para identificar a subexpressão.",
          x,
          z,
        ),
        visual: "ast",
      });
      if ("op" in tree) {
        for (const [child, suffix, offset] of [
          [tree.left, "l", -width],
          [tree.right, "r", width],
        ] as const) {
          treeEdges.push([id, `ast-${path + suffix}`]);
          place(child, path + suffix, x + offset, z + 1.1, width / 2);
        }
      }
    }
    place(compiled.tree, "root", 0, 0, 2);
    // The tree is revealed with parsing; the four phase modules remain selectable.
    nodes.push(...treeNodes);
    nodes = nodes.map((n) =>
      n.id === "source"
        ? { ...n, position: [-4, 0, -2.6] }
        : n.id === "lexer"
          ? { ...n, position: [-1.4, 0, -2.6] }
          : n.id === "parser"
            ? { ...n, position: [1.3, 0, -2.6] }
            : n.id === "vm"
              ? { ...n, position: [4, 0, -0.3] }
              : n,
    );
    for (const n of treeNodes) values[n.id] = "aguarda parser";
    add(
      "Análise léxica",
      "O lexer reconhece números e símbolos e remove os espaços entre tokens.",
      "source",
      "lexer",
      compiled.tokens.join(" "),
      { lexer: `${compiled.tokens.length} tokens` },
    );
    add(
      "Análise sintática",
      `Árvore: ${compiled.ast}. Multiplicação tem precedência sobre soma.`,
      "lexer",
      "parser",
      "tokens → AST",
      {
        parser: compiled.ast,
        ...Object.fromEntries(treeNodes.map((n) => [n.id, n.label])),
      },
    );
    add(
      "Gerar bytecode",
      "Percorrer a AST em pós-ordem produz as instruções de uma VM de pilha.",
      "parser",
      "vm",
      "PUSH / ADD / MUL",
      { vm: "pilha []" },
    );
    const stack: number[] = [];
    compiled.instructions.forEach((instruction, i) => {
      let payload: string;
      if (instruction.op === "PUSH") {
        stack.push(instruction.value);
        payload = `PUSH ${instruction.value}`;
      } else {
        const b = stack.pop()!,
          a = stack.pop()!;
        const result = instruction.op === "ADD" ? a + b : a * b;
        stack.push(result);
        payload = `${a} ${instruction.op === "ADD" ? "+" : "*"} ${b} = ${result}`;
      }
      add(
        `VM · ${i + 1}`,
        `${payload}; pilha [${stack.join(", ")}].`,
        `ast-${instruction.origin}`,
        "vm",
        payload,
        { vm: `[${stack.join(", ")}]` },
        false,
        i === compiled.instructions.length - 1
          ? `Resultado = ${stack[0]}`
          : undefined,
      );
    });
    return {
      nodes,
      steps,
      code: `TOKENS\n${compiled.tokens.join(" · ")}\n\nAST\n${compiled.ast}\n\nBYTECODE\n${compiled.instructions.map((i) => (i.op === "PUSH" ? `PUSH ${i.value}` : i.op)).join("\n")}`,
      edges: treeEdges,
    };
  }
  if (id === "architecture") {
    nodes = [
      node(
        "api",
        "API",
        "Limite de entrada: só confirma a escrita depois do quórum.",
        -3.5,
        0,
        "control",
      ),
      node(
        "leader",
        "LÍDER",
        "Líder fixo: registra a escrita local e coordena réplicas.",
        -0.7,
        0,
        "server",
      ),
      node(
        "r1",
        "RÉPLICA 1",
        "Cópia seguidora. Pode ficar indisponível neste experimento.",
        3,
        -1.7,
        "server",
      ),
      node(
        "r2",
        "RÉPLICA 2",
        "Segunda cópia seguidora; maioria exige dois entre três nós.",
        3,
        1.7,
        "server",
      ),
    ];
    values = {
      api: "aguarda",
      leader: "x=0",
      r1: p.offline >= 1 ? "OFFLINE" : "x=0",
      r2: p.offline >= 2 ? "OFFLINE" : "x=0",
    };
    add(
      "Topologia pronta",
      "Uma API, um líder e duas réplicas. Quórum fixo = 2/3.",
    );
    add(
      "Receber escrita",
      "O líder registra x=42 localmente. Uma confirmação ainda não basta para COMMIT.",
      "api",
      "leader",
      "SET x=42",
      { leader: "x=42 · ACKs 1/3", api: "aguarda quórum" },
    );
    let acks = 1;
    let confirmed = false;
    for (let replica = 1; replica <= 2; replica++) {
      const down = p.offline >= replica;
      add(
        down ? `Réplica ${replica} indisponível` : `Replicar em ${replica}`,
        down
          ? "A mensagem não alcança a réplica; nenhum ACK é acrescentado."
          : "A réplica recebe a escrita; a confirmação volta em uma etapa separada.",
        "leader",
        `r${replica}`,
        "SET x=42",
        down ? {} : { [`r${replica}`]: "x=42 · recebido" },
        down,
      );
      if (!down) {
        acks++;
        add(
          "Receber ACK",
          `O líder recebe o ACK da réplica ${replica}: ${acks}/3 confirmações.`,
          `r${replica}`,
          "leader",
          `ACK x=42 · ${acks}/3`,
          { leader: `${confirmed ? "COMMIT" : "x=42"} · ACKs ${acks}/3` },
        );
        if (acks >= 2 && !confirmed) {
          confirmed = true;
          add(
            "COMMIT",
            "A maioria 2/3 confirmou. O cliente recebe sucesso agora; a réplica restante pode continuar em seguida.",
            "leader",
            "api",
            "200 OK · COMMIT x=42",
            { api: "COMMIT x=42", leader: `COMMIT · ${acks}/3` },
          );
        }
      }
    }
    const committed = acks >= 2;
    add(
      committed ? "Replicação concluída" : "Sem quórum",
      committed
        ? "A maioria confirmou. A API pode devolver sucesso."
        : "Só o líder confirmou; a escrita fica pendente. Não é seguro prometer COMMIT.",
      committed ? undefined : "leader",
      committed ? undefined : "api",
      committed ? "200 OK · COMMIT x=42" : "503 · sem quórum",
      {
        api: committed ? "COMMIT x=42" : "503 · pendente",
        leader: committed ? `COMMIT · ${acks}/3` : "pendente · 1/3",
      },
      false,
      committed ? `COMMIT · ${acks}/3 confirmações` : "SEM QUÓRUM · 1/3",
    );
    code = `SET x = 42\nnós = 3\nquórum = floor(3 / 2) + 1\n\nACKs >= 2 → COMMIT\nACKs < 2 → não confirmar\n\nlíder fixo; sem eleição`;
  }
  return { nodes, steps, code };
}
