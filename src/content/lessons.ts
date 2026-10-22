export type LabId = "cpu" | "memory" | "network";
export const lessons = {
  cpu: {
    eyebrow: "HARDWARE E ARQUITETURA",
    title: "Como um programa ganha vida?",
    description:
      "Acompanhe uma instrução por dentro da CPU. Da primeira leitura na memória ao resultado que aparece no registrador.",
    question: "Como a CPU sabe que precisa somar dois números?",
    concept:
      "Um programa é uma sequência de instruções guardadas na memória. O contador de programa (PC) aponta para a próxima instrução; a unidade de controle busca, decodifica e executa cada uma.",
    deep: "O registrador de instrução (IR) guarda a operação buscada. LOAD lê um byte da RAM para o acumulador; ADD soma outro byte; STORE escreve o acumulador de volta. O PC é incrementado na busca. Aqui cada instrução tem três microetapas. CPUs reais podem sobrepor instruções em pipelines, usar execução fora de ordem, caches e muitos registradores.",
    practical:
      "O mesmo princípio está por trás de uma calculadora, um navegador ou um jogo: instruções transformam dados e produzem efeitos observáveis.",
    challenge:
      "Experimente 250 + 10. O resultado será 4: o acumulador tem 8 bits, e a soma é calculada módulo 256.",
    quiz: "Com os valores iniciais 5 e 3, qual será o valor de RAM[10] após STORE?",
    answers: ["3", "8", "10"],
    correct: 1,
    explanation:
      "LOAD coloca 5 no acumulador; ADD soma 3; STORE grava 8 no endereço 10.",
    limitations:
      "ISA educacional de acumulador de 8 bits. Instruções e dados são mostrados separadamente. Cada microetapa conta como um ciclo didático, sem representar ciclos de uma CPU comercial. Sem caches, interrupções ou pipeline.",
    sources: [
      [
        "Nand2Tetris — arquitetura de computadores",
        "https://www.nand2tetris.org/course",
      ],
      ["CPU.land — execução e processadores", "https://cpu.land/"],
    ],
  },
  memory: {
    eyebrow: "MEMÓRIA E ENDEREÇAMENTO",
    title: "Onde os seus dados vivem?",
    description:
      "Aloque espaço, empilhe valores e observe cada endereço. A memória deixa de ser uma caixa-preta.",
    question: "O que acontece com a memória quando uma função é chamada?",
    concept:
      "A stack organiza dados temporários em ordem LIFO: o último valor inserido é o primeiro a sair. O heap permite reservar blocos com duração controlada pelo programa. Endereços identificam posições, não os valores armazenados.",
    deep: "Este alocador percorre os blocos em ordem de endereço e escolhe o primeiro intervalo suficiente (first-fit). malloc reserva bytes e devolve um endereço; free devolve o bloco ao alocador. Em programas reais, a stack inclui frames, parâmetros e endereços de retorno. O espaço virtual de um processo é traduzido para memória física pelo sistema operacional e pela MMU.",
    practical:
      "Entender duração e propriedade dos dados ajuda a reconhecer vazamentos, acessos após free e estouro da stack em programas C ou C++.",
    challenge:
      "Reserve quatro blocos de 8 bytes. Tente um PUSH. Libere o último bloco e tente novamente. Observe a condição de falta de espaço.",
    quiz: "Após PUSH 4, PUSH 8 e POP, qual valor permanece na stack?",
    answers: ["4", "8", "Nenhum"],
    correct: 0,
    explanation:
      "A stack é LIFO. POP remove o último valor inserido, 8, e preserva o 4.",
    limitations:
      "Espaço de 32 bytes, heap crescente e stack decrescente no mesmo intervalo. PUSH ocupa um byte; malloc reserva blocos de 1 a 8 bytes. Sem alinhamento, metadados, paginação ou tradução virtual. free libera o último bloco reservado; malloc reutiliza lacunas por first-fit.",
    sources: [
      [
        "OSTEP — virtualização e gerenciamento de memória",
        "https://pages.cs.wisc.edu/~remzi/OSTEP/",
      ],
    ],
  },
  network: {
    eyebrow: "REDES E PROTOCOLOS",
    title: "O caminho de uma requisição.",
    description:
      "Do nome de um site ao primeiro byte da resposta. Explore DNS, a conexão TCP e a conversa HTTP.",
    question: "O que acontece entre apertar Enter e receber uma página?",
    concept:
      "O DNS resolve um nome em um endereço IP. O cliente estabelece uma conexão TCP e envia uma requisição HTTP. O servidor interpreta a requisição e devolve uma resposta com status, cabeçalhos e conteúdo.",
    deep: "SYN, SYN-ACK e ACK formam o handshake TCP. Neste modelo o ACK final carrega o GET. A resposta 200 indica sucesso; HTTP não guarda automaticamente o estado de uma sessão entre requisições. Cache DNS pode evitar uma consulta. Uma perda no SYN força espera e retransmissão, aumentando a latência sem mudar o resultado.",
    practical:
      "A aba Network das ferramentas do navegador separa etapas como DNS, conexão e tempo até o primeiro byte. Essa decomposição ajuda a localizar lentidão.",
    challenge:
      "Compare a duração com DNS em cache e sem cache. Depois perca o primeiro SYN: por que a espera cresce mesmo sem alterar a latência?",
    quiz: "Com DNS em cache, qual etapa pode ser dispensada?",
    answers: ["A resposta HTTP", "A consulta DNS", "Toda a conexão TCP"],
    correct: 1,
    explanation:
      "Um endereço ainda válido no cache evita consultar o resolvedor. Isso não garante que já exista uma conexão TCP.",
    limitations:
      "HTTP sem TLS, conexão TCP nova, um servidor, DNS simplificado em consulta/resposta e sem recursão. Latência é por trecho unidirecional; processamento fixo de 20 ms. Uma perda opcional e timeout fixo de 1 s. Sem congestionamento, pacotes reais ou tráfego externo. Não modela HTTP/2 nem HTTP/3.",
    sources: [
      [
        "RFC 9110 — semântica HTTP",
        "https://www.rfc-editor.org/rfc/rfc9110.html",
      ],
      ["Stanford CS144 — redes", "https://web.stanford.edu/class/cs144/"],
      [
        "Cloudflare — DNS",
        "https://www.cloudflare.com/learning/dns/what-is-dns/",
      ],
    ],
  },
};
export const modules = [
  "Fundamentos da computação",
  "Hardware e arquitetura",
  "Memória",
  "Sistemas operacionais e Linux",
  "Redes de computadores",
  "Servidores e infraestrutura",
  "Bancos de dados",
  "Baixo nível e compiladores",
  "Engenharia e arquitetura",
];
