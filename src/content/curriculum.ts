import type { LabId } from "./lessons";
export const levels = ["fundamental", "intermediate", "advanced"] as const;
export type Level = (typeof levels)[number];
export const levelInfo: Record<
  Level,
  { label: string; number: string; description: string; readiness: string }
> = {
  fundamental: {
    label: "Fundamental",
    number: "01",
    description:
      "Construa o modelo mental: bits viram operações, instruções transformam valores e a memória organiza os dados.",
    readiness:
      "Antes de avançar, consiga prever uma saída lógica, acompanhar LOAD/ADD/STORE e explicar endereço, valor e duração de um dado.",
  },
  intermediate: {
    label: "Intermediário",
    number: "02",
    description:
      "Conecte os mecanismos: compartilhe a CPU, acompanhe uma requisição e entenda como dados são consultados e preservados.",
    readiness:
      "Antes de avançar, explique uma troca de processo, diferencie DNS/TCP/HTTP e compare índice, varredura e transação.",
  },
  advanced: {
    label: "Avançado",
    number: "03",
    description:
      "Combine camadas e analise compromissos: transforme linguagens, opere serviços e raciocine sobre falhas e consistência.",
    readiness:
      "Ao concluir, justifique a ordem de execução de uma expressão, uma política de cache e a regra de confirmação de uma escrita replicada.",
  },
};
export const trackInfo: Record<
  LabId,
  { level: Level; prerequisites: LabId[]; outcomes: string[] }
> = {
  logic: {
    level: "fundamental",
    prerequisites: [],
    outcomes: [
      "Converter uma representação binária simples",
      "Derivar tabelas-verdade de quatro portas",
      "Separar lógica combinacional de armazenamento de estado",
    ],
  },
  cpu: {
    level: "fundamental",
    prerequisites: ["logic"],
    outcomes: [
      "Distinguir PC, IR, ACC e RAM",
      "Traçar busca, decodificação e execução",
      "Prever resultados com limite de oito bits",
    ],
  },
  memory: {
    level: "fundamental",
    prerequisites: ["cpu"],
    outcomes: [
      "Distinguir endereço, conteúdo e objeto",
      "Acompanhar LIFO e first-fit",
      "Relacionar duração, propriedade e tradução virtual",
    ],
  },
  os: {
    level: "intermediate",
    prerequisites: ["cpu", "memory"],
    outcomes: [
      "Explicar os estados de um processo",
      "Comparar quantum, espera e trocas",
      "Distinguir syscall, kernel e programa de usuário",
    ],
  },
  network: {
    level: "intermediate",
    prerequisites: ["os"],
    outcomes: [
      "Diferenciar resolução DNS, transporte e aplicação",
      "Ler SYN, ACK e uma resposta HTTP",
      "Decompor latência e explicar retransmissão",
    ],
  },
  database: {
    level: "intermediate",
    prerequisites: ["memory", "os"],
    outcomes: [
      "Localizar registros em páginas",
      "Comparar custo de busca com e sem índice",
      "Distinguir atomicidade, isolamento e durabilidade",
    ],
  },
  compiler: {
    level: "advanced",
    prerequisites: ["logic", "cpu", "memory"],
    outcomes: [
      "Separar lexer, parser e AST",
      "Derivar bytecode respeitando precedência",
      "Traçar uma VM e distinguir erros de cada fase",
    ],
  },
  infra: {
    level: "advanced",
    prerequisites: ["network", "database"],
    outcomes: [
      "Traçar requisições entre borda e origem",
      "Justificar balanceamento e uma política de cache",
      "Analisar disponibilidade, métricas e tentativas",
    ],
  },
  architecture: {
    level: "advanced",
    prerequisites: ["os", "database", "infra"],
    outcomes: [
      "Escolher o nível adequado de um diagrama C4",
      "Separar recebimento, ACK e confirmação por quórum",
      "Documentar invariantes e decisões sob falha",
    ],
  },
};
