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
  kind: "control" | "server" | "cpu" | "register" | "storage";
};
export type WorkshopStep = {
  title: string;
  log: string;
  values: Record<string, string>;
  flow?: FlowEvent;
  result?: string;
};
export type WorkshopRun = {
  nodes: WorkshopNode[];
  steps: WorkshopStep[];
  code: string;
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

type Ast = { value: number } | { op: "+" | "*"; left: Ast; right: Ast };
type Instruction = { op: "PUSH"; value: number } | { op: "ADD" | "MUL" };
export function compileExpression(source: string): {
  tokens: string[];
  ast: string;
  instructions: Instruction[];
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
  function emit(ast: Ast): string {
    if ("value" in ast) {
      instructions.push({ op: "PUSH", value: ast.value });
      return String(ast.value);
    }
    const left = emit(ast.left),
      right = emit(ast.right);
    instructions.push({ op: ast.op === "+" ? "ADD" : "MUL" });
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
  return { tokens, ast, instructions };
}

export function buildWorkshop(id: ExtendedLabId, p: Settings): WorkshopRun {
  let nodes: WorkshopNode[] = [];
  const steps: WorkshopStep[] = [];
  let values: Record<string, string> = {};
  let code = "";
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
    while (queue.length) {
      const i = queue.shift()!;
      const used = Math.min(p.quantum, remaining[i]);
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
      remaining[i] -= used;
      time += used;
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
        queue.length ? undefined : `Todos concluídos em t=${time}`,
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
      originRequests = 0;
    for (let request = 1; request <= 2; request++) {
      add(
        `Requisição ${request}`,
        `GET / #${request} chega à borda.`,
        "client",
        "edge",
        `GET / #${request}`,
      );
      if (p.cache && cached) {
        add(
          "Cache HIT",
          "Resposta válida encontrada; nenhuma instância é consultada.",
          "edge",
          "client",
          "200 OK · HIT",
          { client: "200 OK", edge: "HIT · resposta em cache" },
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
        add(
          "Resposta da aplicação",
          "A instância devolve o recurso público. A borda armazena apenas se o cache estiver habilitado.",
          dest,
          "edge",
          "200 OK · corpo HTML",
          { edge: p.cache ? "resposta armazenada" : "encaminhar" },
        );
        add(
          "Entregar ao cliente",
          "O cliente recebe a resposta da aplicação pela borda.",
          "edge",
          "client",
          "200 OK · origem",
          { client: "200 OK" },
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
      { parser: compiled.ast },
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
        "parser",
        "vm",
        payload,
        { vm: `[${stack.join(", ")}]` },
        false,
        i === compiled.instructions.length - 1
          ? `Resultado = ${stack[0]}`
          : undefined,
      );
    });
    code = `TOKENS\n${compiled.tokens.join(" · ")}\n\nAST\n${compiled.ast}\n\nBYTECODE\n${compiled.instructions.map((i) => (i.op === "PUSH" ? `PUSH ${i.value}` : i.op)).join("\n")}`;
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
          { leader: `x=42 · ACKs ${acks}/3` },
        );
      }
    }
    const committed = acks >= 2;
    add(
      committed ? "COMMIT" : "Sem quórum",
      committed
        ? "A maioria confirmou. A API pode devolver sucesso."
        : "Só o líder confirmou; a escrita fica pendente. Não é seguro prometer COMMIT.",
      "leader",
      "api",
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
