import type { ExtendedLabId, Lesson } from "./lessons";

// Explicações originais; fontes servem para estudo e aprofundamento.
export const extraLessons: Record<ExtendedLabId, Lesson> = {
  logic: {
    eyebrow: "FUNDAMENTOS DA COMPUTAÇÃO",
    title: "Tudo começa com um bit.",
    description:
      "Ligue entradas, compare portas lógicas e acompanhe sinais até a saída de um circuito.",
    question: "Como dois sinais elétricos podem representar uma decisão?",
    concept:
      "Um bit distingue dois estados, escritos como 0 e 1. O significado depende da codificação: 01000001 pode representar 65 sem sinal ou a letra A em ASCII. Com n bits existem 2ⁿ combinações. Um byte reúne oito bits; não existe uma interpretação única para todos os bytes. Níveis elétricos são tratados como estados lógicos por circuitos digitais.",
    deep: "AND produz 1 apenas com as duas entradas em 1; OR produz 1 quando pelo menos uma vale 1; XOR exige entradas diferentes; NAND inverte AND. A tabela-verdade enumera todas as quatro combinações de duas entradas. Portas combinacionais calculam saídas a partir das entradas atuais. Circuitos sequenciais acrescentam estado, mantido por elementos como flip-flops. A porta NAND é universal: é possível construir outras operações combinando NANDs. Nosso laboratório calcula a função booleana selecionada, transportando A, B e Y em etapas separadas.",
    practical:
      "Uma comparação no código acaba se apoiando em operações sobre bits. Permissões usam máscaras; somadores combinam XOR e AND para produzir soma e carry. Na soma de dois bits, A XOR B é o bit de soma e A AND B é o transporte. Antes de programar hardware, escreva a tabela-verdade e confira cada combinação. O simulador oferece essa tabela e o resultado calculado para comparar sua previsão.",
    challenge:
      "Escolha XOR e teste 00, 01, 10 e 11. Depois selecione NAND: em qual única combinação a saída se apaga?",
    quiz: "Qual é a saída de NAND quando A = 1 e B = 1?",
    answers: ["0", "1", "Depende do próximo sinal"],
    correct: 0,
    explanation: "AND de 1 e 1 é 1; NAND nega esse resultado e produz 0.",
    limitations:
      "Sinais booleanos ideais. Sem tensão, corrente, atraso de propagação, ruído, clock ou transistores. A animação separa entradas por clareza didática; não mede tempo elétrico real. A placa é uma representação de uma função lógica, não um esquema fabricável.",
    sources: [
      [
        "Nand2Tetris — lógica e aritmética booleana",
        "https://www.nand2tetris.org/course",
      ],
    ],
  },
  os: {
    eyebrow: "SISTEMAS OPERACIONAIS E LINUX",
    title: "Uma CPU, vários processos.",
    description:
      "Troque o quantum do escalonador e acompanhe a fila de processos até todos terminarem.",
    question: "Como vários programas compartilham um único núcleo?",
    concept:
      "Um processo reúne um programa em execução, seu espaço de endereços e recursos. Seus estados podem incluir pronto, executando e bloqueado. Um processo pronto espera CPU; um bloqueado espera um evento, como a conclusão de uma leitura. Uma thread é uma unidade de execução que pode compartilhar o espaço do processo com outras threads. Neste laboratório, P1, P2 e P3 chegam juntos, precisando respectivamente de 3, 2 e 1 unidades de CPU.",
    deep: "Round-robin retira o primeiro processo da fila, executa até o quantum ou até seu término e devolve um processo incompleto ao fim da fila. O quantum limita cada turno. Com quantum 1, a sequência é P1, P2, P3, P1, P2, P1. Com quantum 2, é P1, P2, P3, P1. A troca de contexto salva e restaura estado de execução. Um quantum menor pode reduzir a espera até o primeiro atendimento, mas aumentar trocas. Não existe uma configuração melhor para toda carga. O histórico mostra o tempo acumulado e o trabalho restante de cada processo.",
    practical:
      "O kernel arbitra acesso à CPU, memória e dispositivos. Programas solicitam serviços por syscalls; permissões e espaços de endereço ajudam a isolar processos. No Linux, ps mostra processos, top acompanha uso e strace permite observar chamadas de sistema. Um comando de shell inicia processos, e um pipe conecta a saída de um à entrada de outro. Não execute esses comandos aqui: a bancada é uma simulação local. Linux real usa políticas de escalonamento mais complexas que o round-robin educacional apresentado.",
    challenge:
      "Compare quantum 1 e 2. Confira quando P3 termina e quantos turnos são necessários. Um turno menor sempre termina todos os processos mais cedo?",
    quiz: "Em round-robin, o que ocorre com um processo incompleto ao esgotar seu quantum?",
    answers: [
      "Ele é apagado",
      "Volta ao fim da fila de prontos",
      "Recebe a CPU para sempre",
    ],
    correct: 1,
    explanation:
      "O estado é preservado e o processo volta à fila, permitindo que outros executem.",
    limitations:
      "Um núcleo, três processos CPU-bound com chegada em t=0. Tempos abstratos, sem I/O, prioridades, custo de troca ou preempção por eventos. Não reproduz o escalonador atual do Linux. A CPU 3D e os módulos P1–P3 representam recursos e contextos lógicos.",
    sources: [
      [
        "OSTEP — processos, escalonamento e virtualização",
        "https://pages.cs.wisc.edu/~remzi/OSTEP/",
      ],
      [
        "Linux — documentação do escalonador",
        "https://docs.kernel.org/scheduler/index.html",
      ],
      [
        "MIT Missing Semester — ferramentas e shell",
        "https://missing.csail.mit.edu/2026/",
      ],
    ],
  },
  infra: {
    eyebrow: "SERVIDORES E INFRAESTRUTURA",
    title: "Quem responde à próxima requisição?",
    description:
      "Envie duas requisições, ative o cache e retire uma instância para observar o caminho mudar.",
    question: "Como um serviço atende mais pessoas e continua disponível?",
    concept:
      "Uma aplicação pode rodar em várias instâncias atrás de um balanceador. O cliente acessa um endereço estável, e o balanceador escolhe um destino saudável. Um cache guarda respostas reutilizáveis e pode evitar trabalho na aplicação. Aqui duas requisições GET / chegam em sequência à mesma borda: a primeira pode preencher o cache; a segunda pode ser atendida nele. Uma instância indisponível é retirada da escolha antes de receber tráfego.",
    deep: "Round-robin distribui solicitações alternando destinos saudáveis; não garante tempos iguais quando os trabalhos têm custos diferentes. A política de cache exige definir chave, validade e invalidação. Nesta experiência o recurso é público e constante: um cache habilitado começa vazio, armazena a primeira resposta e atende a segunda como HIT. Sem cache, ambas chegam às aplicações. Se A estiver indisponível, B recebe as duas. O registro de cada etapa mostra MISS, HIT, instância escolhida e resposta. Uma CDN real mantém caches em muitos locais próximos dos clientes.",
    practical:
      "Escalar horizontalmente acrescenta instâncias, mas dados de sessão locais podem exigir afinidade ou armazenamento compartilhado. Health checks orientam roteamento; métricas de erros e latência indicam degradação. Um deploy gradual substitui instâncias em lotes. Repetir operações exige atenção à idempotência: repetir uma leitura é diferente de repetir uma cobrança. Cache de conteúdo privado demanda separar usuários corretamente. Na operação, acompanhe taxa de acertos, disponibilidade e capacidade do banco, pois ampliar servidores não elimina gargalos posteriores.",
    challenge:
      "Execute com cache desligado e conte visitas a A e B. Ative o cache: qual caminho a segunda resposta percorre? Depois retire A e compare os destinos.",
    quiz: "Com cache válido para GET /, o que acontece na segunda requisição deste modelo?",
    answers: [
      "A aplicação precisa gerar a resposta outra vez",
      "A borda devolve a resposta armazenada",
      "O cliente fica sem resposta",
    ],
    correct: 1,
    explanation:
      "O HIT atende na borda e evita uma nova consulta à aplicação para esse recurso.",
    limitations:
      "Duas leituras sequenciais de um recurso público constante, cache de uma entrada sem expiração, health check imediato e round-robin sem pesos. Sem TLS, sockets, concorrência ou tráfego real. Tempos de animação não medem desempenho. A borda combina cache e balanceador apenas para facilitar a observação.",
    sources: [
      [
        "Cloudflare — CDN e cache",
        "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/",
      ],
      [
        "NGINX — balanceamento HTTP",
        "https://nginx.org/en/docs/http/load_balancing.html",
      ],
      ["RFC 9111 — cache HTTP", "https://www.rfc-editor.org/rfc/rfc9111.html"],
    ],
  },
  database: {
    eyebrow: "BANCOS DE DADOS",
    title: "Encontre uma linha sem ler tudo.",
    description:
      "Compare uma busca por índice com uma varredura e veja as páginas consultadas antes do resultado.",
    question: "Por que um índice pode acelerar uma consulta?",
    concept:
      "Uma tabela organiza linhas e colunas. Uma chave identifica um registro; um índice é uma estrutura adicional que ajuda a localizar dados. Os registros do laboratório têm as chaves 2, 4, 6, 8, 10, 12, 16, 18 e 20, distribuídas em três páginas. A consulta SELECT nome WHERE id = k pode percorrer as páginas ou usar uma raiz que aponta para o intervalo certo. Uma chave ausente precisa produzir zero linhas, sem inventar um resultado.",
    deep: "A raiz do índice contém separadores 8 e 16. Uma chave menor que 8 segue para a página A; entre 8 e 16, para B; a partir de 16, para C. A folha escolhida é examinada e a linha correspondente é retornada. Sem índice, a varredura percorre páginas até encontrar a chave ou chegar ao fim. O contador mede páginas de dados visitadas e informa separadamente a leitura da raiz. Índices ocupam espaço e precisam ser mantidos nas escritas; o otimizador pode preferir uma varredura para tabelas pequenas ou consultas que retornam muitas linhas.",
    practical:
      "Uma transação delimita um conjunto de operações com garantias de atomicidade e isolamento conforme o banco e o nível escolhido. COMMIT confirma mudanças; ROLLBACK as desfaz dentro das regras da transação. Persistência não é apenas manter objetos na RAM: logs e recuperação participam da durabilidade. EXPLAIN ajuda a inspecionar o plano de consulta. Nosso laboratório é somente leitura; a escolha de índice e o número de páginas permitem discutir custo, sem simular um gerenciador completo de transações ou disco físico.",
    challenge:
      "Procure 20 com e sem índice. Compare páginas de dados visitadas. Busque 7: por que a folha correta ainda pode não conter a chave?",
    quiz: "Se a raiz tem separadores 8 e 16, em qual página buscar a chave 12?",
    answers: [
      "A: chaves menores que 8",
      "B: de 8 até antes de 16",
      "C: a partir de 16",
    ],
    correct: 1,
    explanation:
      "12 pertence ao intervalo [8, 16), então a busca segue para B e confere a chave na folha.",
    limitations:
      "Índice ordenado estático de dois níveis com folhas contendo os próprios registros; sem splits, inserções, MVCC, WAL ou otimizador. Não é a implementação do B-tree do PostgreSQL. Contagem de visitas lógicas, sem cache de páginas, latência de SSD ou medição de tempo real.",
    sources: [
      [
        "PostgreSQL — tipos de índices",
        "https://www.postgresql.org/docs/current/indexes-types.html",
      ],
      [
        "PostgreSQL — transações",
        "https://www.postgresql.org/docs/current/tutorial-transactions.html",
      ],
    ],
  },
  compiler: {
    eyebrow: "BAIXO NÍVEL E COMPILADORES",
    title: "Do texto à execução.",
    description:
      "Transforme uma expressão em tokens, árvore sintática e instruções de uma máquina de pilha.",
    question: "Como o computador entende a expressão 2 + 3 * 4?",
    concept:
      "Texto-fonte é uma sequência de caracteres. O lexer agrupa caracteres em tokens, como números, operadores e parênteses. O parser reconhece uma estrutura conforme a gramática. Para 2 + 3 * 4, multiplicação tem precedência: a árvore representa ADD(2, MUL(3, 4)), produzindo 14. Parênteses em (2 + 3) * 4 mudam a árvore e produzem 20. Um compilador precisa identificar sintaxe inválida em vez de tentar executar qualquer texto.",
    deep: "O parser desta bancada usa uma gramática com expressão de soma, termo de multiplicação e fator numérico ou parentetizado. Cada nó da árvore emite código em pós-ordem: um número gera PUSH; um nó binário emite os filhos e depois ADD ou MUL. A máquina de pilha remove dois operandos, calcula e empilha o resultado. A execução de 2 + 3 * 4 é PUSH 2, PUSH 3, PUSH 4, MUL, ADD. Tokens, árvore, bytecode e estado da pilha são derivados da expressão editada; nada é enviado para eval nem executado como JavaScript do usuário.",
    practical:
      "Compiladores reais também analisam nomes e tipos, otimizam representações intermediárias e geram código para um alvo. Um runtime fornece serviços usados durante a execução; o linker resolve referências entre unidades. Erros de sintaxe, compilação e execução são categorias diferentes. Ferramentas de debugging relacionam instruções com o código de origem, e profiling mostra onde o tempo é gasto. Esta VM facilita acompanhar operandos sem depender de uma ISA comercial, mas não gera um executável nativo nem usa LLVM internamente.",
    challenge:
      "Compare 2 + 3 * 4 com (2 + 3) * 4. Envie 2 + para observar a validação. Depois escreva outra expressão com soma e multiplicação.",
    quiz: "Qual resultado a precedência usual produz para 2 + 3 * 4?",
    answers: ["20", "14", "24"],
    correct: 1,
    explanation: "A multiplicação agrupa 3 e 4 antes da soma: 2 + 12 = 14.",
    limitations:
      "Linguagem de inteiros não negativos com +, *, parênteses e espaços, até 60 caracteres e números de até três dígitos. Sem variáveis, ponto flutuante, funções, tipos ou otimizações. Resultados precisam ser inteiros seguros do JavaScript. Bytecode e VM educacionais, sem execução nativa ou acesso ao sistema.",
    sources: [
      [
        "LLVM — lexer, parser, AST e geração de código",
        "https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html",
      ],
      ["Nand2Tetris — VM e compiladores", "https://www.nand2tetris.org/course"],
    ],
  },
  architecture: {
    eyebrow: "ENGENHARIA E ARQUITETURA",
    title: "Uma escrita precisa sobreviver a falhas.",
    description:
      "Acompanhe uma escrita replicada e retire nós para testar quando a aplicação pode confirmar sucesso.",
    question: "Quando uma réplica pode confirmar uma escrita ao cliente?",
    concept:
      "Arquitetura define responsabilidades, dependências e compromissos. Um diagrama de contexto mostra pessoas e sistemas; containers mostram aplicações e armazenamentos; componentes detalham partes internas. Container no modelo C4 é uma unidade de execução ou armazenamento, não necessariamente Docker. Nesta bancada a API recebe SET x=42 e o líder coordena duas réplicas. As máquinas 3D representam limites lógicos de uma implantação possível.",
    deep: "Neste modelo fixamos um líder disponível e exigimos duas confirmações entre três nós, contando a persistência local do líder. A escrita é enviada a cada réplica disponível; só depois de atingir a maioria o líder marca a operação como confirmada e responde sucesso. Com uma réplica fora, líder e outra réplica bastam; com duas fora, a escrita fica pendente e a API responde indisponibilidade. Quóruns se sobrepõem, mas maioria isoladamente não implementa um protocolo de consenso. Eleição, termos, regras de log e recuperação também são necessários em sistemas como Raft.",
    practical:
      "Replicação pode melhorar disponibilidade e tolerância a falhas, mas acrescenta tráfego e coordenação. Uma resposta de erro após timeout nem sempre significa que nenhuma escrita ocorreu: clientes precisam considerar repetição e idempotência. Consistência e disponibilidade durante partições exigem decisões explícitas. Documente invariantes, como nunca confirmar antes do quórum, e teste falhas. Separe os níveis C4 da sequência dinâmica de mensagens: o primeiro explica quem existe; a segunda explica o que acontece. A simulação mostra essa sequência sem prometer reproduzir um cluster real.",
    challenge:
      "Execute com zero, uma e duas réplicas indisponíveis. Conte os ACKs antes da resposta. Com duas réplicas fora, por que confirmar sucesso violaria a regra do modelo?",
    quiz: "Em um grupo de três nós com quórum de maioria, quantas confirmações são necessárias?",
    answers: ["Uma", "Duas", "Sempre três"],
    correct: 1,
    explanation:
      "A maioria de três é dois. Neste modelo, líder mais uma réplica atingem o quórum.",
    limitations:
      "Líder fixo sempre disponível, escrita única, falhas configuradas antes da execução e confirmações abstratas. Não implementa Raft, eleição, recuperação, partições dinâmicas, leitura linearizável ou durabilidade real. SET pode ser recebido localmente sem que a operação seja confirmada; a indicação COMMIT é a decisão do modelo.",
    sources: [
      ["C4 — níveis de diagramas", "https://c4model.com/diagrams"],
      [
        "MIT 6.5840 — replicação, consistência e falhas",
        "https://pdos.csail.mit.edu/6.824/index.html",
      ],
      ["Raft — artigo e recursos", "https://raft.github.io/"],
    ],
  },
};
