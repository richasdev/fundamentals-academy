import type { LabId } from "./lessons";
export interface TeachingGuide {
  analogy: string;
  connection: string;
  boundary: string;
  relevance: string;
  steps: [string, string, string];
  question: string;
  choices: [string, string];
  correct: 0 | 1;
  feedback: [string, string];
  terms: [string, string][];
}
export const teachingGuides: Record<
  LabId,
  [TeachingGuide, TeachingGuide, TeachingGuide]
> = {
  logic: [
    {
      analogy:
        "Imagine oito interruptores lado a lado. Cada um pode estar desligado ou ligado. Para anotar a posição deles, escrevemos 0 ou 1. Um bit é essa escolha entre dois estados; um byte reúne oito dessas escolhas.",
      connection:
        "Para transformar a sequência em um número, cada posição ganha um peso. É parecido com dinheiro: uma nota de 10 e uma moeda de 1 valem quantias diferentes, embora cada uma seja um objeto. No binário, os pesos são 1, 2, 4, 8 e assim por diante. Some os pesos dos bits ligados. Depois pergunte qual interpretação o programa escolheu para aquele padrão.",
      boundary:
        "Os interruptores ajudam a visualizar dois estados. Chips reais usam circuitos e convenções elétricas; não têm oito interruptores mecânicos para cada byte.",
      relevance:
        "Essa ideia ajuda a ler números em binário, entender cores e arquivos e perceber por que a quantidade de bits limita o que cabe em um campo.",
      steps: [
        "Comece pela direita: os pesos finais são 1, 2, 4 e 8. O lugar do bit importa.",
        "Em 1101, os bits de 8, 4 e 1 estão ligados. O de 2 está desligado e não entra na soma.",
        "Some 8+4+1: dá 13. Esse é o valor quando interpretamos o padrão como inteiro sem sinal.",
      ],
      question: "Em 0101₂, quais valores entram na soma?",
      choices: ["4 e 1", "O número 101"],
      correct: 0,
      feedback: [
        "Isso: o bit de peso 4 e o de peso 1 estão ligados. 4+1=5.",
        "Aqui os dígitos são binários, não um número decimal escrito com zero à esquerda. Use os pesos 8, 4, 2 e 1: apenas 4 e 1 entram.",
      ],
      terms: [
        ["Bit", "Uma informação que pode assumir um de dois estados."],
        ["Codificação", "A regra que dá significado a um padrão de bits."],
      ],
    },
    {
      analogy:
        "Pense em uma porta que só abre se duas pessoas apertarem seus botões. Essa é a ideia de AND: as duas condições precisam ser verdadeiras. Se bastasse qualquer uma das pessoas, a regra seria OR.",
      connection:
        "O circuito recebe A e B e aplica uma regra fixa. A tabela-verdade lista todas as situações possíveis, como uma lista de testes. XOR aceita uma entrada ligada e a outra desligada. NAND faz o contrário de AND. Não tente decorar só o nome: escolha uma combinação, faça uma previsão e compare com a linha da tabela.",
      boundary:
        "A comparação fala da regra de decisão. Não diz como fabricar uma fechadura segura nem representa o tempo de resposta dos componentes elétricos.",
      relevance:
        "Condições do código, comparações e operações com bits dependem de combinar decisões simples desse tipo.",
      steps: [
        "Escolha uma das quatro duplas possíveis: 00, 01, 10 ou 11.",
        "Para 11, AND produz 1 porque ambas estão ligadas. NAND inverte esse 1.",
        "Por isso, NAND de 11 produz 0. Para testar a regra inteira, repita com as outras três duplas.",
      ],
      question: "Se A=1 e B=1, OR e XOR dão o mesmo resultado?",
      choices: [
        "Sim, porque as entradas são iguais",
        "Não: OR dá 1 e XOR dá 0",
      ],
      correct: 1,
      feedback: [
        "Entradas iguais não tornam as regras iguais. OR aceita uma ou ambas ligadas; XOR aceita exatamente uma.",
        "Exato. A diferença aparece justamente quando as duas entradas estão ligadas.",
      ],
      terms: [
        [
          "Porta lógica",
          "Circuito que aplica uma regra sobre sinais de entrada.",
        ],
        [
          "Tabela-verdade",
          "Lista de todas as entradas e das saídas esperadas.",
        ],
      ],
    },
    {
      analogy:
        "Some uma moeda de 1 com outra moeda de 1. Você pode trocar as duas por uma moeda de 2. Na soma binária, algo parecido acontece: 1+1 não cabe em um único bit e vira 10₂.",
      connection:
        "O resultado tem dois lugares: um para a soma daquela posição e outro para o transporte à próxima. XOR calcula o primeiro, AND calcula o segundo. Já guardar o resultado é outro trabalho. Uma calculadora precisa tanto de circuitos que calculam quanto de lugares que lembram valores. Separar calcular de guardar prepara o entendimento da CPU.",
      boundary:
        "O meio somador explicado aqui usa duas entradas. Somadores maiores precisam também considerar o transporte que veio da posição anterior.",
      relevance:
        "Você passa a enxergar uma soma como uma combinação de pequenas regras, em vez de uma ação misteriosa dentro do processador.",
      steps: [
        "Para A=1 e B=1, calcule XOR: as entradas são iguais, então o bit de soma é 0.",
        "Calcule AND com as mesmas entradas: ambas valem 1, então o transporte é 1.",
        "Escreva transporte e soma lado a lado: 10₂. Interpretado sem sinal, esse padrão vale 2.",
      ],
      question: "Uma porta combinacional sozinha lembra a entrada anterior?",
      choices: [
        "Não; para lembrar é necessário estado",
        "Sim; a última saída sempre fica guardada",
      ],
      correct: 0,
      feedback: [
        "Certo. A função combinacional depende das entradas atuais. Guardar informação exige um elemento com estado.",
        "A saída pode acompanhar as entradas, mas isso não é memória. Um registrador ou outro circuito com estado tem regras próprias para guardar informação.",
      ],
      terms: [
        ["Carry", "O transporte de uma soma para a posição seguinte."],
        ["Estado", "Informação preservada para influenciar operações futuras."],
      ],
    },
  ],
  cpu: [
    {
      analogy:
        "Imagine uma receita com um marcador na próxima linha, um cartão com a instrução atual e uma tigela com o resultado parcial. Eles têm trabalhos diferentes: apontar, dizer o que fazer e guardar o que já foi calculado.",
      connection:
        "Na CPU da academia, o PC funciona como o marcador, o IR como o cartão e o ACC como a tigela. A RAM é onde os dados ficam guardados em posições numeradas. LOAD [8] significa buscar o conteúdo da posição 8. O número do lugar e o que está guardado nele são coisas diferentes, como o número de uma casa e quem mora nela.",
      boundary:
        "A CPU não entende frases de receita. Ela interpreta instruções de uma linguagem de máquina. Os registradores são estruturas internas, separados no desenho para facilitar a leitura.",
      relevance:
        "Essa separação ajuda a entender por que um programa pode estar na instrução seguinte e ainda carregar o resultado de uma operação anterior.",
      steps: [
        "O PC vale 0: ele aponta para a instrução guardada na posição 0 da memória de instruções.",
        "A instrução LOAD [8] vai para o IR. Agora sabemos qual operação será executada e onde está seu dado.",
        "LOAD lê RAM[8]. Se esse endereço contém 5, o acumulador recebe 5. Ele não recebe 8 apenas porque esse é o endereço.",
      ],
      question: "RAM[8] contém 200. Quanto LOAD [8] coloca no ACC?",
      choices: [
        "8, porque aparece na instrução",
        "200, porque é o conteúdo daquela posição",
      ],
      correct: 1,
      feedback: [
        "O 8 indica onde procurar. Para saber o valor carregado, é preciso ler o que existe naquele endereço.",
        "Isso. LOAD usa o endereço 8 para encontrar o byte 200 e copiá-lo para o acumulador.",
      ],
      terms: [
        ["Registrador", "Pequeno armazenamento usado diretamente pela CPU."],
        [
          "Operando",
          "Informação que participa da instrução, como o endereço do dado.",
        ],
      ],
    },
    {
      analogy:
        "Antes de executar uma tarefa escrita em um cartão, você precisa pegar o cartão, entender a ordem e só então agir. A CPU didática separa esses momentos em buscar, decodificar e executar.",
      connection:
        "Na busca, a instrução entra no IR e o PC avança. Na decodificação, o controle identifica a operação. Na execução, o dado é lido, somado ou escrito. Avançar o PC não significa que o resultado já foi calculado: o marcador apenas foi preparado para a próxima busca. Observe uma mudança por vez para não confundir preparação com efeito.",
      boundary:
        "Processadores reais podem sobrepor trabalho de várias instruções. As três etapas da bancada são uma divisão para estudo, não uma contagem universal de ciclos físicos.",
      relevance:
        "Você consegue explicar exatamente em que momento um valor mudou e por que a RAM ainda pode estar diferente do acumulador.",
      steps: [
        "Fetch busca LOAD [8]. O IR guarda essa instrução e o PC passa de 0 para 1.",
        "Decode prepara a operação LOAD. O acumulador ainda não recebeu o byte da memória.",
        "Execute faz a leitura. Só agora o ACC passa de 0 para 5, se RAM[8] contém 5.",
      ],
      question:
        "Depois de LOAD e ADD, o ACC vale 8. Isso já garante RAM[10]=8?",
      choices: [
        "Não; ainda falta executar STORE",
        "Sim; registrador e RAM mudam sempre juntos",
      ],
      correct: 0,
      feedback: [
        "Exato. O cálculo está no registrador. STORE é a operação que o grava em RAM[10].",
        "ACC e RAM são locais distintos. ADD muda o acumulador; a escrita de volta depende de STORE.",
      ],
      terms: [
        ["Fetch", "Busca da próxima instrução."],
        [
          "Decode",
          "Interpretação da operação e preparação dos sinais de controle.",
        ],
      ],
    },
    {
      analogy:
        "Pense em um contador com espaço limitado de dígitos. Quando ele chega ao limite, não aparece um espaço novo automaticamente. A nossa máquina também tem um limite: o acumulador guarda apenas oito bits.",
      connection:
        "Com oito bits sem sinal, cabem os valores de 0 a 255. A soma matemática 250+10 é 260, mas a regra da bancada mantém apenas o que cabe em oito bits. O resultado armazenado vira 4. Isso não muda a matemática: muda a representação guardada. Ao prever um resultado, pergunte primeiro quantos bits existem e como eles são interpretados.",
      boundary:
        "Nem toda linguagem ou CPU trata o excesso do mesmo jeito. Algumas operações têm sinais de erro ou regras diferentes para números com sinal.",
      relevance:
        "Isso explica resultados surpreendentes em contadores, formatos binários e programas que trabalham com campos de tamanho fixo.",
      steps: [
        "A soma comum produz 260. Esse número precisa de mais de oito bits para ser guardado sem sinal.",
        "A bancada mantém os oito bits baixos, equivalendo a calcular o resto da divisão por 256.",
        "O resto é 4. STORE grava esse 4; ele não recupera o valor 260 que deixou de caber.",
      ],
      question: "Nesta CPU, 255+1 termina com qual valor no acumulador?",
      choices: ["256", "0"],
      correct: 1,
      feedback: [
        "256 é a soma matemática, mas não cabe no acumulador sem sinal de oito bits desta bancada.",
        "Certo. 256 dividido por 256 tem resto zero; o padrão guardado é 00000000.",
      ],
      terms: [
        [
          "Sem sinal",
          "Interpretação que não reserva valores para números negativos.",
        ],
        [
          "Módulo 256",
          "Resto da divisão por 256; regra usada para limitar o resultado.",
        ],
      ],
    },
  ],
  memory: [
    {
      analogy:
        "Uma pilha de pratos ajuda a imaginar a stack. Você coloca um prato no topo e retira primeiro o que está por cima. O último a entrar é o primeiro a sair.",
      connection:
        "Na bancada, cada PUSH coloca um valor na stack e POP retira o mais recente. As posições são numeradas, mas a ordem de retirada não depende de qual valor é maior. Também não confunda o número da posição com o conteúdo: 0x1F identifica o lugar 31, enquanto o valor guardado ali pode ser 4.",
      boundary:
        "A stack real guarda mais do que uma lista de números: pode organizar informações de chamadas de funções. A bancada reduz isso a bytes para mostrar a ordem.",
      relevance:
        "Essa ordem aparece em chamadas de funções e em muitas estruturas usadas para desfazer passos e organizar trabalho temporário.",
      steps: [
        "PUSH 4 guarda 4 na posição 31. Ele é o topo atual.",
        "PUSH 8 usa a posição 30. Agora 8 foi o último a entrar, mesmo que seu endereço seja menor.",
        "POP devolve 8 ao programa. O 4 continua na stack e volta a ser o topo.",
      ],
      question: "Depois de PUSH 2, PUSH 6 e POP, qual valor continua na stack?",
      choices: ["2", "6"],
      correct: 0,
      feedback: [
        "Isso. O último valor inserido foi 6, então ele sai primeiro e o 2 permanece.",
        "O 6 é justamente o último que entrou. A regra da stack manda retirá-lo antes do 2.",
      ],
      terms: [
        ["LIFO", "Último a entrar, primeiro a sair."],
        [
          "Endereço",
          "Identificador de uma posição; não é o valor armazenado nela.",
        ],
      ],
    },
    {
      analogy:
        "Imagine reservar lugares consecutivos em uma fileira de armários. Você precisa de um trecho livre com o tamanho pedido. Ter vários armários vazios espalhados pode não resolver uma reserva que precisa ficar toda junta.",
      connection:
        "malloc procura espaço para um bloco e devolve seu endereço inicial. O first-fit escolhe o primeiro trecho suficiente a partir do início. free devolve a reserva ao alocador. Reservar espaço não significa que já existe um conteúdo útil lá. São duas perguntas separadas: este lugar está disponível para mim? E qual valor foi realmente escrito nele?",
      boundary:
        "A bancada libera apenas o último bloco e não representa todos os tipos de fragmentação de um alocador real. Armários são só uma comparação para visualizar intervalos.",
      relevance:
        "Você entende por que reservar pode falhar e por que usar um espaço depois de liberá-lo é um erro, mesmo que o endereço continue existindo.",
      steps: [
        "malloc(4) reserva as posições de 0 a 3. O retorno 0 indica o começo do bloco.",
        "Uma reserva de oito bytes seguinte ocupa de 4 a 11. Esses bytes já não podem ser entregues a outra reserva ativa.",
        "Ao liberar o segundo bloco, um pedido menor pode reutilizar o início 4. Mesmo endereço não significa mesmo objeto.",
      ],
      question:
        "malloc devolver um endereço garante que os bytes já contêm zeros?",
      choices: [
        "Sim; reservar é o mesmo que inicializar",
        "Não; reserva e inicialização são operações diferentes",
      ],
      correct: 1,
      feedback: [
        "A reserva dá espaço para uso. Não se deve presumir um conteúdo inicial útil sem uma regra que o garanta.",
        "Certo. A operação de reserva não estabelece por si só os valores que o programa vai usar.",
      ],
      terms: [
        ["Bloco contíguo", "Posições vizinhas que formam um único intervalo."],
        [
          "First-fit",
          "Escolher o primeiro intervalo livre que comporta o pedido.",
        ],
      ],
    },
    {
      analogy:
        "Um número de quarto só faz sentido junto do hotel. O quarto 203 do hotel A não é o mesmo lugar que o quarto 203 do hotel B. Endereços de processos também precisam de um contexto para serem interpretados.",
      connection:
        "Na memória virtual, um processo usa seus próprios endereços, e uma tradução leva ao lugar físico correspondente. O endereço é dividido em número da página e posição dentro dela. Traduzir muda a página de referência, mas preserva a posição interna. Há ainda permissões: encontrar um lugar não significa ter autorização para ler ou escrever nele.",
      boundary:
        "Hotéis não reproduzem tabelas de páginas, proteção nem a forma como o hardware faz a tradução. O exemplo numérico usa páginas pequenas apenas para facilitar a conta.",
      relevance:
        "Essa separação ajuda a entender isolamento entre programas e por que um ponteiro não prova que o objeto ainda existe ou pode ser acessado.",
      steps: [
        "Com páginas de 16 bytes, o endereço 35 significa página 2 e deslocamento 3: 2×16+3.",
        "A tabela informa que a página 2 está no frame físico 7. O deslocamento 3 não muda.",
        "O lugar físico vira 7×16+3=115. Mesmo assim, o acesso precisa respeitar as permissões.",
      ],
      question:
        "Dois processos usam o mesmo número de endereço virtual. Isso obriga que acessem o mesmo byte físico?",
      choices: [
        "Não; cada processo pode ter um mapeamento diferente",
        "Sim; o número sozinho identifica o byte físico",
      ],
      correct: 0,
      feedback: [
        "Exato. O contexto e o mapeamento do processo participam da tradução.",
        "Isso confundiria endereço virtual com físico. O mesmo número virtual pode ser traduzido de maneiras diferentes em processos distintos.",
      ],
      terms: [
        ["Página", "Um bloco de tamanho fixo no espaço de endereços virtuais."],
        [
          "Deslocamento",
          "Posição dentro de uma página; é preservada na tradução.",
        ],
      ],
    },
  ],
  os: [
    {
      analogy:
        "Pense em várias pessoas usando uma única mesa de trabalho. Algumas estão prontas para começar; uma está usando a mesa; outra espera um material chegar. Esperar a mesa e esperar o material são situações diferentes.",
      connection:
        "Um processo pronto pode usar CPU assim que for escolhido. Um processo bloqueado espera um evento, como dados de uma leitura. A troca de contexto é como guardar uma anotação do ponto em que o trabalho parou: ao voltar, a execução continua dali. Em um único núcleo, vários programas podem progredir por alternância, sem executar todos ao mesmo tempo.",
      boundary:
        "O sistema guarda registradores e outras informações, não anotações em papel. O laboratório usa processos que só precisam de CPU e não simula a espera por I/O.",
      relevance:
        "Você consegue diferenciar um programa que está esperando sua vez de um que está esperando algo acontecer.",
      steps: [
        "P1 está pronto: já tem condições de executar, mas ainda não recebeu o núcleo.",
        "O escalonador escolhe P1. Ele passa a executar e consome parte do trabalho restante.",
        "Se perder a vez, seu contexto é preservado. Ele pode voltar à fila e continuar em outro turno.",
      ],
      question:
        "Um processo parado esperando dados do disco está apenas esperando sua vez de CPU?",
      choices: [
        "Sim; pronto e bloqueado são a mesma coisa",
        "Não; ele espera um evento de I/O",
      ],
      correct: 1,
      feedback: [
        "As esperas são diferentes. Receber CPU não faz os dados do disco aparecerem imediatamente.",
        "Certo. Depois que o evento permite continuar, ele pode voltar a disputar CPU como processo pronto.",
      ],
      terms: [
        ["Processo", "Programa em execução junto de seus recursos e estado."],
        ["Contexto", "Informações necessárias para retomar uma execução."],
      ],
    },
    {
      analogy:
        "Imagine uma rodada em que cada pessoa pode usar uma ferramenta por um tempo limitado. Quem não terminou vai para o fim da fila. Um turno curto dá oportunidades mais frequentes, mas obriga a trocar de pessoa mais vezes.",
      connection:
        "O quantum é esse limite por turno. Round-robin percorre a fila e recoloca no fim quem ainda tem trabalho. Para comparar configurações, olhe mais de uma medida: quando cada processo começa pela primeira vez e quando termina. O trabalho total da bancada é sempre seis unidades porque ela não cobra o custo das trocas. Isso não torna todos os tempos individuais iguais.",
      boundary:
        "Sistemas reais têm custos de troca, prioridades, novas chegadas e esperas por I/O. A fila pequena serve para isolar a política e permitir conferir as contas.",
      relevance:
        "Você aprende a fazer a pergunta certa: quero melhorar a primeira resposta, o término de uma tarefa ou a quantidade total de trabalho atendido?",
      steps: [
        "Com quantum 1, P1 usa uma unidade e devolve o núcleo, pois ainda precisa de mais duas.",
        "P2 recebe a vez. P3, que precisa de apenas uma unidade, pode executar já no terceiro turno.",
        "P3 termina em t=3. P1 e P2 continuam alternando até completar as seis unidades de trabalho total.",
      ],
      question:
        "Reduzir o quantum sempre faz todo o trabalho acabar mais cedo?",
      choices: [
        "Não; pode melhorar a primeira resposta e aumentar trocas",
        "Sim; turnos menores sempre diminuem qualquer tempo",
      ],
      correct: 0,
      feedback: [
        "Isso. É preciso escolher uma métrica e considerar o custo das trocas. Nesta bancada, o total permanece seis.",
        "A quantidade de trabalho não desaparece. Turnos menores mudam a distribuição e podem acrescentar custo em um sistema real.",
      ],
      terms: [
        ["Quantum", "Tempo máximo de CPU permitido em um turno."],
        [
          "Tempo de resposta",
          "Espera até a tarefa receber seu primeiro atendimento.",
        ],
      ],
    },
    {
      analogy:
        "Em uma biblioteca, o leitor pede um material ao atendente em vez de entrar em qualquer depósito. O pedido passa por regras: qual material, quem pode acessar e o que pode ser entregue.",
      connection:
        "Uma syscall é uma forma de o programa pedir um serviço ao kernel. O kernel verifica argumentos e permissões e devolve um resultado. Uma biblioteca pode ajudar a montar esse pedido, mas nem toda função de biblioteca precisa chamar o kernel. Também não é obrigatório que toda syscall faça outro processo assumir a CPU. São duas separações: quem tem permissão para operar e quem está executando.",
      boundary:
        "O kernel não é uma pessoa atendendo pedidos. A comparação explica a fronteira de responsabilidade, não os detalhes da transição de modo no processador.",
      relevance:
        "Você entende por que abrir arquivos e acessar dispositivos passam por regras do sistema, mesmo quando o código parece uma chamada de função simples.",
      steps: [
        "O programa solicita uma leitura e informa o descritor, o destino dos dados e a quantidade desejada.",
        "O kernel valida o pedido e determina o que pode fazer. Pode devolver dados, fim de arquivo ou erro.",
        "O programa confere o retorno. Pedir cem bytes não significa que cem bytes foram recebidos.",
      ],
      question:
        "Uma chamada read pediu 100 bytes e devolveu 20. Quantos bytes o programa pode tratar como recebidos?",
      choices: [
        "100, porque foi a quantidade pedida",
        "20, porque foi a quantidade retornada",
      ],
      correct: 1,
      feedback: [
        "O pedido expressa uma intenção, não uma garantia de entrega integral. Usar os outros bytes como se tivessem chegado pode ser um erro.",
        "Exato. O retorno informa o que aconteceu; a aplicação trata continuação, fim ou erro conforme a API.",
      ],
      terms: [
        [
          "Kernel",
          "Parte do sistema operacional que gerencia recursos e serviços protegidos.",
        ],
        ["Syscall", "Pedido de um programa para um serviço do kernel."],
      ],
    },
  ],
  network: [
    {
      analogy:
        "Você sabe o nome de uma loja, mas precisa encontrar seu endereço antes de visitá-la. Consultar esse endereço é um passo; chegar à loja e fazer o pedido são outros.",
      connection:
        "DNS ajuda a resolver um nome para registros, como o endereço IP usado no nosso exemplo. Depois disso, o navegador ainda precisa conversar com o serviço. Um endereço no cache poupa uma nova consulta, mas não abre sozinho uma conexão e não entrega a página. Separar essas ações ajuda a entender em que ponto uma requisição pode demorar ou falhar.",
      boundary:
        "DNS oferece vários tipos de registros e pode envolver muitos servidores. A comparação com uma agenda e o par de mensagens da bancada são simplificações.",
      relevance:
        "Ao investigar um site lento, você deixa de culpar o DNS por todo problema e passa a olhar cada fase da comunicação.",
      steps: [
        "O cliente pergunta pelo registro A de academy.example. Ainda não está pedindo a página HTTP.",
        "O resolvedor responde com 192.0.2.10, endereço de documentação usado nesta experiência.",
        "Com o IP conhecido, o cliente pode iniciar a conexão. A página ainda precisa ser solicitada ao serviço.",
      ],
      question:
        "Encontrar um IP no cache DNS significa que a página HTML já está guardada ali?",
      choices: [
        "Não; endereço e conteúdo são informações diferentes",
        "Sim; cache DNS guarda toda a página",
      ],
      correct: 0,
      feedback: [
        "Isso. O cache DNS pode evitar a busca pelo endereço, mas a resposta HTTP é outra informação.",
        "Aqui o cache é de registros DNS. Guardar uma página envolve outro mecanismo de cache, com outras regras.",
      ],
      terms: [
        ["Resolvedor", "Serviço ao qual o cliente faz perguntas DNS."],
        ["Registro A", "Registro DNS que associa um nome a um endereço IPv4."],
      ],
    },
    {
      analogy:
        "Antes de uma conversa organizada, duas pessoas confirmam que conseguem se ouvir. Depois começam a trocar o conteúdo. A abertura de uma conexão TCP também tem uma troca inicial, mas com regras e números bem definidos.",
      connection:
        "SYN inicia um sentido da conexão. SYN-ACK confirma esse início e apresenta o número do outro lado. ACK confirma a volta. Só que TCP transporta bytes; quem dá significado de pedido e resposta web é HTTP. Pense em duas perguntas: como a conversa transporta os dados? E o que a mensagem significa para a aplicação?",
      boundary:
        "A conversa humana não representa todos os estados e garantias do TCP. A bancada usa números ilustrativos e não inclui TLS nem HTTP/3.",
      relevance:
        "Você consegue ler um handshake sem confundir confirmação de transporte com sucesso da operação pedida ao site.",
      steps: [
        "O cliente envia SYN com seq=100. Está pedindo a abertura da conexão, não recebendo ainda uma página.",
        "O servidor confirma com ack=101 e apresenta seq=500. O SYN ocupa uma posição no espaço de sequência.",
        "O cliente confirma ack=501. Nesta bancada, esse último ACK também leva GET /, o pedido HTTP.",
      ],
      question:
        "Um ACK de TCP, por si só, significa que o servidor respondeu HTTP 200 OK?",
      choices: [
        "Sim; ACK e 200 OK dizem a mesma coisa",
        "Não; são confirmações em camadas diferentes",
      ],
      correct: 1,
      feedback: [
        "ACK pertence ao transporte. O status HTTP faz parte da resposta interpretada pela aplicação.",
        "Exatamente. A conexão pode transportar os bytes corretamente e a aplicação responder com outro status HTTP.",
      ],
      terms: [
        [
          "Handshake",
          "Troca inicial que estabelece parâmetros de uma conexão.",
        ],
        [
          "ACK",
          "Confirmação que indica a próxima posição de sequência esperada.",
        ],
      ],
    },
    {
      analogy:
        "Uma entrega pode demorar pelo trajeto, pela preparação do pedido ou porque foi necessário tentar de novo. Olhar só o tempo final não mostra qual dessas partes foi responsável pela espera.",
      connection:
        "A requisição também reúne trechos de rede, processamento e possíveis esperas por retransmissão. No modelo, cada trecho leva a latência configurada e o servidor usa vinte milissegundos para processar. Cache DNS retira dois trechos. Perder o primeiro SYN acrescenta um timeout fixo. A bolinha se move devagar para você ler; seu tempo de tela não é a medida da rede.",
      boundary:
        "Uma entrega não reproduz congestionamento ou as regras reais de retransmissão. As contas desta aula valem para as hipóteses explícitas da bancada.",
      relevance:
        "Você aprende a decompor uma demora antes de tentar corrigir a parte errada do sistema.",
      steps: [
        "Sem cache e com L=40 ms, conte seis trechos de rede: eles somam 240 ms.",
        "Acrescente os 20 ms de processamento: o total registrado é 260 ms.",
        "Com DNS em cache, dois trechos somem: ficam 180 ms. A perda opcional adiciona mais 1.000 ms de espera.",
      ],
      question:
        "A perda do SYN aumentou a latência configurada de cada trecho?",
      choices: [
        "Não; ela acrescentou espera e uma nova tentativa",
        "Sim; o controle de latência mudou sozinho",
      ],
      correct: 0,
      feedback: [
        "Certo. É possível o total aumentar mesmo mantendo a mesma latência por trecho.",
        "O parâmetro por trecho continua igual. O aumento vem do caminho de falha e do timeout modelado.",
      ],
      terms: [
        ["Latência", "Tempo de espera de uma etapa ou percurso definido."],
        [
          "Timeout",
          "Limite de espera após o qual a operação pode ser tratada como não concluída.",
        ],
      ],
    },
  ],
  database: [
    {
      analogy:
        "Imagine fichas de pessoas guardadas em pastas. O número da pessoa é uma chave para procurar; o número da pasta apenas indica um lugar onde algumas fichas foram reunidas.",
      connection:
        "Uma tabela tem registros, e páginas agrupam parte desses dados. A consulta diz o que procurar e o que devolver. Na bancada, id=12 procura uma pessoa específica; não pede a página número doze. Encontrar a página candidata ainda exige conferir se a chave existe nela. Se não existe, a resposta correta pode ser uma lista vazia.",
      boundary:
        "Arquivos de banco têm estruturas próprias e podem estar em cache. Ler uma página lógica não obriga uma visita física ao disco a cada consulta.",
      relevance:
        "Isso ajuda a entender resultados vazios e evita misturar o identificador de um registro com sua posição física.",
      steps: [
        "O pedido procura a chave 12. Primeiro precisamos descobrir onde ela pode estar.",
        "A página B reúne 8, 10 e 12. Isso a torna uma candidata para a busca.",
        "A verificação encontra 12 e devolve sua linha. Uma chave vizinha não serviria como substituta.",
      ],
      question:
        "Se a consulta pede id=7 e só existe id=6 perto dele, o banco deve devolver 6?",
      choices: [
        "Sim; o registro mais próximo já serve",
        "Não; a igualdade exige encontrar exatamente 7",
      ],
      correct: 1,
      feedback: [
        "A consulta de igualdade não autoriza trocar a chave pedida por uma próxima. Isso mudaria o significado da pergunta.",
        "Exato. Nesse conjunto, id=7 produz zero linhas, mesmo que a página candidata contenha outros registros.",
      ],
      terms: [
        ["Registro", "Uma linha de dados, como uma pessoa com id e nome."],
        [
          "Página",
          "Bloco que reúne dados e é tratado como unidade de acesso pelo modelo.",
        ],
      ],
    },
    {
      analogy:
        "O índice de um livro permite pular para um trecho, em vez de folhear todas as páginas desde o começo. Mas ele só aponta um caminho; você ainda precisa ler o trecho indicado.",
      connection:
        "Na bancada, a raiz do índice compara a chave com 8 e 16 e escolhe uma página de dados. Para 20, ela aponta para C. A varredura, por outro lado, começa em A e segue até achar o registro. Compare tudo o que foi consultado: a raiz também tem custo. Um índice pode ajudar muito em alguns pedidos e trazer pouco benefício em outros.",
      boundary:
        "Um índice de banco não é uma lista de capítulos de livro. Pode ter muitos níveis, ocupar espaço e precisar de manutenção a cada mudança nos dados.",
      relevance:
        "Você entende por que criar índices exige observar as consultas, em vez de supor que mais índices sempre tornam tudo mais rápido.",
      steps: [
        "A chave é 20. Na raiz, ela é maior ou igual a 16, então o caminho aponta para C.",
        "A folha C contém 16, 18 e 20. A chave é conferida ali e a linha é encontrada.",
        "O caminho usou uma raiz e uma página de dados. A varredura de 20 precisaria visitar A, B e C.",
      ],
      question:
        "O caminho por índice visita apenas a página C e não precisa consultar mais nada?",
      choices: [
        "Não; também consulta a raiz que escolheu C",
        "Sim; índices não têm custo de consulta",
      ],
      correct: 0,
      feedback: [
        "Isso. Conte a raiz e a folha separadamente para comparar o trabalho de forma honesta.",
        "A escolha de C precisa de informação. Nesta estrutura, ela vem da raiz do índice, que também é consultada.",
      ],
      terms: [
        ["Índice", "Estrutura auxiliar que orienta a localização de dados."],
        [
          "Varredura",
          "Busca que percorre dados em sequência até encontrar o que procura ou chegar ao fim.",
        ],
      ],
    },
    {
      analogy:
        "Em uma transferência, tirar dinheiro de uma conta e colocar na outra fazem parte do mesmo trabalho. Parar só depois de tirar deixa uma operação incompleta.",
      connection:
        "Uma transação agrupa alterações para que a operação siga as garantias do banco. Atomicidade trata de não confirmar apenas uma parte. Isolamento trata de como operações simultâneas podem se enxergar. Durabilidade trata de preservar confirmações segundo as regras de persistência. São perguntas diferentes, mesmo quando participam da mesma transação. O log ajuda na recuperação; não é apenas uma cópia da tela que o usuário viu.",
      boundary:
        "A comparação não define sozinha todas as regras financeiras. A bancada atual só consulta dados; o exemplo de transferência explica um conceito que ela não executa.",
      relevance:
        "Você passa a perguntar quais garantias uma operação realmente tem, em vez de confiar que usar BEGIN resolve qualquer problema de concorrência.",
      steps: [
        "BEGIN inicia a unidade de trabalho. As duas atualizações devem ser tratadas como partes da mesma operação.",
        "O débito e o crédito são solicitados. Se ocorrer um erro antes da confirmação, a aplicação precisa tratá-lo corretamente.",
        "COMMIT confirma a transação. O nível de isolamento e a política de persistência ainda definem outras garantias.",
      ],
      question:
        "Agrupar operações em uma transação garante automaticamente o isolamento mais forte?",
      choices: [
        "Sim; toda transação é serializável",
        "Não; o nível de isolamento também precisa ser considerado",
      ],
      correct: 1,
      feedback: [
        "Transação e nível serializável não são sinônimos. É preciso conhecer o nível usado e suas garantias.",
        "Correto. Atomicidade, isolamento e durabilidade respondem a problemas diferentes.",
      ],
      terms: [
        [
          "Atomicidade",
          "Garantia de tratar o conjunto de mudanças sem confirmar só uma parte sob as regras do banco.",
        ],
        ["COMMIT", "Pedido de confirmação da transação."],
      ],
    },
  ],
  compiler: [
    {
      analogy:
        "Antes de entender uma frase, reconhecemos suas palavras e sinais. Um compilador também começa separando o texto em partes conhecidas, mas usa regras bem mais restritas que as de uma conversa humana.",
      connection:
        "O lexer reconhece números e símbolos. Em 12+3, o 12 é um único número, embora tenha dois caracteres. Depois o parser verifica como essas peças se combinam. Ter peças reconhecidas não basta: 2+ usa símbolos permitidos, mas falta algo depois do sinal. Separar reconhecimento de estrutura ajuda a localizar o motivo de um erro.",
      boundary:
        "O compilador não adivinha o que a pessoa quis dizer como um leitor humano poderia fazer. Ele só aceita o que a linguagem definiu.",
      relevance:
        "Você entende mensagens de sintaxe e consegue distinguir um símbolo proibido de uma expressão incompleta.",
      steps: [
        "O texto chega como caracteres. O lexer junta 1 e 2 consecutivos para reconhecer o número 12.",
        "Espaços entre partes são ignorados. Os símbolos + e parênteses viram outras peças reconhecidas.",
        "O parser recebe essas peças e verifica se formam uma expressão válida. Dois números sem operador não são aceitos.",
      ],
      question:
        "Se o lexer reconheceu todos os símbolos de 2+, a expressão já está correta?",
      choices: [
        "Não; falta um operando e o parser precisa rejeitá-la",
        "Sim; reconhecer símbolos já prova que o texto pode executar",
      ],
      correct: 0,
      feedback: [
        "Exato. As peças são conhecidas, mas a combinação está incompleta.",
        "Falta uma etapa: verificar a estrutura. Depois do +, esta linguagem espera outro termo válido.",
      ],
      terms: [
        [
          "Token",
          "Uma parte reconhecida do texto, como um número ou operador.",
        ],
        ["Lexer", "Etapa que transforma caracteres em tokens."],
      ],
    },
    {
      analogy:
        "Uma expressão pode ser dividida em pequenas caixas: para calcular 2+(3×4), primeiro descubra o valor da caixa 3×4. Depois use esse valor na soma maior.",
      connection:
        "A árvore sintática guarda esse agrupamento. A multiplicação fica dentro de uma parte da soma. Parênteses podem mudar as caixas: em (2+3)×4, é a soma que precisa estar pronta primeiro. O gerador de bytecode percorre essa estrutura e coloca instruções em uma ordem que deixa os operandos disponíveis antes de cada operação.",
      boundary:
        "A árvore não é um desenho decorativo nem apenas a ordem em que os símbolos aparecem. Ela representa as relações definidas pela gramática.",
      relevance:
        "Você consegue explicar por que duas expressões com os mesmos números podem ter resultados diferentes.",
      steps: [
        "Em 2+3×4, forme primeiro o grupo MUL(3,4). Ele representa a multiplicação que tem maior precedência.",
        "A soma maior combina o 2 com esse grupo. A árvore fica ADD(2,MUL(3,4)).",
        "Para a VM, emita os números 2, 3 e 4, depois MUL e por fim ADD. Cada operação encontra seus operandos na pilha.",
      ],
      question:
        "Colocar parênteses em (2+3)×4 muda apenas a aparência ou também o agrupamento?",
      choices: [
        "Só a aparência; o resultado continua 14",
        "Muda o agrupamento; o resultado passa a 20",
      ],
      correct: 1,
      feedback: [
        "Os parênteses são parte da regra da expressão. Eles fazem a soma ser agrupada antes da multiplicação.",
        "Isso. A árvore passa a ser MUL(ADD(2,3),4), e a soma é resolvida dentro da multiplicação.",
      ],
      terms: [
        ["AST", "Árvore que representa a estrutura essencial da expressão."],
        [
          "Precedência",
          "Regra que decide quais operadores agrupam seus operandos primeiro.",
        ],
      ],
    },
    {
      analogy:
        "Imagine cartões com números empilhados e uma máquina que só trabalha com os cartões do topo. Para somar, ela tira dois cartões e coloca de volta um com o resultado.",
      connection:
        "Essa é a ideia da VM de pilha. PUSH coloca um número; ADD e MUL retiram dois valores e devolvem um. A pilha mostra o estado daquele instante. O bytecode é a lista de ordens, e a AST é a estrutura usada para gerar essa lista. Olhar as três coisas separadamente torna a execução muito mais fácil de acompanhar.",
      boundary:
        "A VM desta academia é pequena e não gera código nativo. O exemplo dos cartões descreve a organização dos operandos, não o hardware de uma máquina comercial.",
      relevance:
        "Você aprende a investigar uma execução perguntando qual instrução veio agora e quais valores ela encontrou.",
      steps: [
        "Depois de PUSH 2, PUSH 3 e PUSH 4, a pilha está [2,3,4]. O topo é o valor da direita.",
        "MUL tira 4 e 3, calcula 12 e devolve esse resultado. A pilha fica [2,12].",
        "ADD tira 12 e 2 e devolve 14. Agora sobra [14], o resultado da expressão.",
      ],
      question: "Logo depois de MUL em 2+3×4, a pilha é [2,12] ou [14]?",
      choices: [
        "[2,12]; a soma ainda não executou",
        "[14]; multiplicar também executa a soma",
      ],
      correct: 0,
      feedback: [
        "Certo. Uma instrução produz um efeito específico. O ADD seguinte ainda precisa combinar 2 com 12.",
        "MUL só combina os dois valores do topo. O 2 permanece esperando a instrução ADD.",
      ],
      terms: [
        ["Bytecode", "Lista de instruções feita para uma máquina virtual."],
        [
          "VM",
          "Máquina virtual que executa instruções sobre um estado definido.",
        ],
      ],
    },
  ],
  infra: [
    {
      analogy:
        "Uma recepção pode direcionar clientes a vários atendentes. Para o cliente, há uma entrada conhecida; por trás dela, o atendimento pode ser feito por pessoas diferentes.",
      connection:
        "A borda recebe o pedido e o balanceador escolhe uma instância da aplicação. Essa instância produz a resposta, que volta pela borda. A entrada estável permite trocar ou ampliar instâncias sem pedir que cada cliente escolha manualmente um servidor. Mas dados que ficaram só na memória de A não aparecem automaticamente em B.",
      boundary:
        "A recepção não reproduz conexões, protocolos nem todos os modos de falha. Na bancada, a borda reúne funções que podem estar separadas em serviços reais.",
      relevance:
        "Você entende como distribuir trabalho sem presumir que adicionar servidores também resolveu o compartilhamento de dados.",
      steps: [
        "O cliente envia GET / para o serviço. Ele não precisa escolher entre APP A e APP B.",
        "A borda escolhe uma instância saudável. Nesta etapa, ela encaminha o pedido para A.",
        "A aplicação responde e a borda entrega a resposta ao cliente. O caminho de volta também faz parte da conversa.",
      ],
      question:
        "Se A guarda uma sessão só em sua RAM, B necessariamente conhece essa sessão?",
      choices: [
        "Sim; os servidores compartilham toda a memória automaticamente",
        "Não; é necessária uma estratégia para compartilhar ou localizar esse estado",
      ],
      correct: 1,
      feedback: [
        "Instâncias separadas não ganham memória compartilhada apenas por ficarem atrás do mesmo balanceador.",
        "Exatamente. Armazenamento compartilhado ou outras estratégias podem ser necessários, com compromissos próprios.",
      ],
      terms: [
        ["Instância", "Uma execução da aplicação que pode atender pedidos."],
        [
          "Balanceador",
          "Componente que escolhe um destino para encaminhar trabalho.",
        ],
      ],
    },
    {
      analogy:
        "Se alguém pede uma informação pública que você acabou de consultar, pode ser mais rápido reutilizar a anotação. Mas isso só funciona se ela ainda servir para aquela pessoa e para aquela pergunta.",
      connection:
        "Um cache guarda uma resposta para possível reutilização. MISS significa que não há uma cópia adequada; HIT significa que uma cópia pode atender aquele pedido. Na bancada, o recurso é público e constante, então a primeira visita pode preencher o cache e a segunda usá-lo. Em uma aplicação real, é preciso decidir qual pedido corresponde a qual cópia e por quanto tempo ela pode ser usada.",
      boundary:
        "Uma anotação não representa todas as regras do cache HTTP. Respostas privadas, idiomas e validade podem exigir chaves e políticas mais cuidadosas.",
      relevance:
        "Você entende por que cache pode reduzir trabalho e também por que uma política errada pode devolver a resposta errada.",
      steps: [
        "O cache começa vazio. O primeiro GET encontra MISS e precisa chegar à aplicação.",
        "A resposta pública retorna e é guardada na borda, conforme a regra simplificada do modelo.",
        "O segundo GET encontra HIT. A borda responde sem pedir que a aplicação gere o mesmo recurso outra vez.",
      ],
      question:
        "Um HIT na borda precisa sempre de uma nova resposta da aplicação para atender o pedido?",
      choices: [
        "Não; neste modelo a cópia válida já atende",
        "Sim; cache só muda o nome do caminho",
      ],
      correct: 0,
      feedback: [
        "Isso. A segunda resposta é entregue pela borda a partir da cópia que foi armazenada.",
        "O benefício observado é justamente evitar esse trabalho na origem quando a cópia pode ser reutilizada.",
      ],
      terms: [
        ["HIT", "O cache encontrou uma cópia que pode atender ao pedido."],
        ["MISS", "O cache não encontrou uma cópia adequada para esse pedido."],
      ],
    },
    {
      analogy:
        "Você faz um pedido, não recebe confirmação e fica em dúvida se ele foi anotado. Repetir sem perguntar pode criar dois pedidos, embora sua intenção fosse fazer apenas um.",
      connection:
        "Um timeout deixa o cliente sem uma resposta conclusiva. Isso não prova que o servidor deixou de executar a operação. Uma leitura repetida e uma cobrança repetida podem ter consequências bem diferentes. Ao lidar com falhas, pergunte: o que pode ter acontecido antes de a resposta sumir? Como reconhecer uma nova tentativa da mesma operação? Que informação preciso guardar para não duplicar efeitos?",
      boundary:
        "A bancada só simula leituras públicas e uma instância indisponível. Ela não cobra dinheiro nem implementa deduplicação de escritas.",
      relevance:
        "Essa forma de raciocinar ajuda a planejar tentativas, mensagens de erro e contratos de operação com mais cuidado.",
      steps: [
        "A é marcada como indisponível. Pela hipótese da bancada, a borda sabe disso antes de encaminhar tráfego.",
        "Com cache desligado, os dois pedidos vão para B. O serviço continua atendendo, mas tem menos capacidade disponível.",
        "Em um serviço real, acompanhe erros, latência e saturação para conferir o que a falha provocou. Estar online não prova que toda operação funciona.",
      ],
      question:
        "Se uma cobrança terminou em timeout para o cliente, ele sabe com certeza que nada foi cobrado?",
      choices: [
        "Sim; timeout garante que o servidor desfez tudo",
        "Não; a resposta pode ter se perdido depois de um efeito",
      ],
      correct: 1,
      feedback: [
        "Timeout descreve a espera do cliente. Ele não é uma garantia automática de rollback no servidor.",
        "Certo. Uma nova tentativa precisa respeitar regras de identificação e idempotência adequadas à operação.",
      ],
      terms: [
        [
          "Idempotência",
          "Propriedade de repetir uma operação sem produzir um efeito adicional além do previsto pelo contrato.",
        ],
        [
          "Health check",
          "Verificação de um critério usado para avaliar a disponibilidade de um destino.",
        ],
      ],
    },
  ],
  architecture: [
    {
      analogy:
        "Um mapa da cidade, a planta de um prédio e o desenho de uma sala mostram o mesmo lugar em escalas diferentes. O melhor desenho depende da pergunta que você quer responder.",
      connection:
        "C4 também trabalha com níveis. Contexto mostra pessoas e sistemas. Containers mostram aplicações e armazenamentos. Componentes detalham partes internas. Já uma sequência dinâmica mostra uma operação acontecendo ao longo do tempo. Antes de desenhar mais caixas, pergunte quem vai ler e o que essa pessoa precisa entender.",
      boundary:
        "Uma caixa C4 não obriga o uso de Docker nem descreve automaticamente todos os servidores físicos. São visões sobre responsabilidades e relações.",
      relevance:
        "Você aprende a explicar uma arquitetura sem colocar todo detalhe de implementação no mesmo desenho.",
      steps: [
        "Para explicar quem usa o sistema e quais serviços externos participam, comece pelo contexto.",
        "Para mostrar navegador, API e banco, aproxime a visão e descreva os containers.",
        "Para contar como uma escrita percorre API, líder e réplicas, use uma sequência de mensagens como a da bancada.",
      ],
      question:
        "Para mostrar quem usa o sistema, é preciso começar pelas classes e métodos?",
      choices: [
        "Não; uma visão de contexto responde melhor a essa pergunta",
        "Sim; só detalhes de código explicam qualquer sistema",
      ],
      correct: 0,
      feedback: [
        "Isso. Comece pela escala que ajuda a pessoa a responder à pergunta, e aprofunde quando necessário.",
        "Classes podem ser úteis em outra escala. Para pessoas e sistemas externos, elas acrescentariam detalhes antes de esclarecer o contexto.",
      ],
      terms: [
        ["Contexto", "Visão do sistema junto de pessoas e sistemas externos."],
        [
          "Container em C4",
          "Unidade de execução ou armazenamento, como API ou banco; não significa obrigatoriamente Docker.",
        ],
      ],
    },
    {
      analogy:
        "Imagine uma decisão que exige a confirmação de pelo menos duas de três pessoas. Enviar o convite não é o mesmo que receber uma confirmação. Você só pode contar quem realmente respondeu.",
      connection:
        "No modelo, o líder conta sua gravação local e espera ACKs das réplicas. Uma réplica receber a escrita é uma etapa; o ACK voltar ao líder é outra. Com duas confirmações entre três nós, a regra de maioria é atendida. Sem isso, a API não deve prometer COMMIT. A decisão depende de evidências recebidas, não de mensagens apenas enviadas.",
      boundary:
        "A comparação explica a contagem, não implementa consenso completo. A bancada mantém um líder fixo e não trata eleições nem recuperação de conflitos.",
      relevance:
        "Você consegue distinguir copiar dados, receber confirmação e prometer ao cliente que uma operação foi confirmada.",
      steps: [
        "O líder grava x=42 localmente. Isso dá uma confirmação entre três; ainda falta atingir a maioria.",
        "Uma réplica recebe a escrita. Quando seu ACK retorna ao líder, a contagem sobe para duas confirmações.",
        "Com 2/3, a decisão final pode confirmar COMMIT neste modelo. Com apenas 1/3, ela deve permanecer sem confirmação.",
      ],
      question:
        "Uma mensagem enviada para uma réplica indisponível já conta como ACK?",
      choices: [
        "Sim; enviar é suficiente",
        "Não; o líder precisa receber a confirmação",
      ],
      correct: 1,
      feedback: [
        "Enviar não prova que o destino recebeu, guardou ou confirmou. Contar assim violaria a regra da bancada.",
        "Exato. O caminho perdido não acrescenta confirmação e não deve destacar a réplica como receptora.",
      ],
      terms: [
        ["Quórum", "Quantidade de confirmações exigida para uma decisão."],
        [
          "Réplica",
          "Cópia de dados ou estado mantida por outro nó do sistema.",
        ],
      ],
    },
    {
      analogy:
        "Uma regra de segurança de uma equipe pode dizer: nunca anuncie uma decisão antes das confirmações necessárias. Mesmo se o trabalho parar, a equipe não deve inventar que a aprovação aconteceu.",
      connection:
        "Uma invariável é uma regra que precisa continuar verdadeira. Aqui, uma delas é não responder COMMIT com menos de duas confirmações. Isso é diferente de garantir que toda operação sempre termine. Quando faltam nós, o sistema pode parar de confirmar para preservar a regra. Depois, pense no que cada participante sabe: o servidor pode ter concluído uma escrita mesmo que o cliente não tenha recebido a resposta.",
      boundary:
        "A bancada testa falhas escolhidas antes da execução. Ela não demonstra todas as situações de partição, eleição ou retorno de nós.",
      relevance:
        "Você passa a justificar uma decisão de arquitetura com hipóteses e garantias, em vez de apenas escolher uma tecnologia conhecida.",
      steps: [
        "Declare a hipótese: o líder continua disponível e o quórum exigido é dois entre três.",
        "Tire as duas réplicas. Só a confirmação local existe, então a decisão não pode prometer COMMIT.",
        "A resposta indica indisponibilidade. A regra de segurança foi preservada, embora a confirmação não tenha progredido.",
      ],
      question:
        "Se o cliente perdeu a resposta de uma escrita, ele pode concluir que ela falhou no servidor?",
      choices: [
        "Não; para o cliente o resultado pode ser desconhecido",
        "Sim; perder a resposta prova que a escrita não ocorreu",
      ],
      correct: 0,
      feedback: [
        "Certo. O efeito pode ter ocorrido antes de a resposta se perder. Repetir exige considerar o contrato da operação.",
        "A falha observada pode estar só no retorno. É preciso consultar o estado ou usar uma estratégia segura de repetição, conforme o serviço.",
      ],
      terms: [
        [
          "Invariável",
          "Regra que precisa permanecer verdadeira durante a execução.",
        ],
        [
          "Vivacidade",
          "Condições sob as quais o sistema consegue continuar fazendo progresso.",
        ],
      ],
    },
  ],
};
