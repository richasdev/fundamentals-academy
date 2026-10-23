import type { LabId } from "./lessons";
type Three = [string, string, string];
export type Mechanism = {
  title: string;
  why: Three;
  observe: Three;
  question: string;
};
function mechanism(
  title: string,
  why: Three,
  observe: Three,
  question: string,
): Mechanism {
  return { title, why, observe, question };
}
export const mechanisms: Record<LabId, [Mechanism, Mechanism, Mechanism]> = {
  logic: [
    mechanism(
      "Posição dá peso ao bit",
      [
        "O padrão 1101 ainda não é uma soma. Primeiro associamos cada posição a uma potência de dois. Começando pela direita, os pesos dobram: 1, 2, 4, 8. Mover um bit para outra posição altera sua contribuição, mesmo que ele continue valendo 1.",
        "Cada bit funciona como uma seleção: 1 inclui o peso e 0 o exclui. Assim, 1101 seleciona 8, 4 e 1; o peso 2 fica de fora. A seta representa essa interpretação, não quatro interruptores mecânicos viajando até uma calculadora.",
        "A soma dos pesos selecionados é 13. O resultado depende da convenção sem sinal. Os mesmos quatro bits, interpretados em complemento de dois, representariam -3. O padrão não mudou; a regra de interpretação mudou.",
      ],
      [
        "Associe o bit mais à direita ao peso 1.",
        "Confira por que não há uma parcela +2.",
        "Compare o padrão preservado com sua representação decimal.",
      ],
      "Se apenas o bit de peso 2 fosse ligado, qual seria o novo valor?",
    ),
    mechanism(
      "Uma porta aplica uma regra, não uma intenção",
      [
        "A porta precisa das duas entradas para avaliar uma operação binária. Neste recorte fixamos A=1 e B=1. Na bancada livre, teste também as outras três combinações: um único exemplo não comprova a tabela-verdade inteira.",
        "AND responde à pergunta ‘ambas estão em 1?’. Para 11, a resposta é 1. NAND acrescenta uma negação à saída de AND; ela não altera as entradas. Separar as duas funções na cena torna essa dependência visível.",
        "NOT transforma o 1 recebido em 0. Esse é o resultado NAND para 11. Para 00, 01 e 10, AND produziria 0 e a negação produziria 1. A saída é combinacional: não recorda o que ocorreu na operação anterior.",
      ],
      [
        "Identifique a dupla de entrada, separada da saída.",
        "Siga o valor intermediário 1 de AND até NOT.",
        "A saída deve ser 0 apesar de ambas as entradas serem 1.",
      ],
      "O que precisaria ser acrescentado para guardar o resultado depois que as entradas mudassem?",
    ),
    mechanism(
      "Soma e transporte são informações diferentes",
      [
        "XOR produz o bit menos significativo da soma de dois bits. Quando ambos são 1, duas unidades não cabem em um único bit; por isso o bit de soma fica em 0. Isso não significa que a soma matemática virou zero.",
        "AND detecta exatamente o caso em que as duas unidades geram transporte para a próxima posição. Para 1 e 1, carry=1. XOR e AND usam as mesmas entradas, mas respondem a perguntas distintas.",
        "O carry ocupa a posição de peso 2 e a soma ocupa a de peso 1. O par 10₂ representa 2. Um somador completo também receberia carry da posição anterior; o meio somador apresentado aqui não possui essa terceira entrada.",
      ],
      [
        "O bit de soma é 0, mas ainda falta calcular carry.",
        "Observe o segundo caminho partindo das mesmas entradas.",
        "Leia carry à esquerda e soma à direita.",
      ],
      "Por que guardar apenas a saída XOR perderia informação no caso 1+1?",
    ),
  ],
  cpu: [
    mechanism(
      "Endereço, instrução e operando não são a mesma coisa",
      [
        "O PC informa onde buscar a próxima instrução. O endereço 0 seleciona uma posição da memória de instruções; não é um valor a ser somado. O fluxo azul identifica quem inicia essa busca.",
        "A memória devolve LOAD [8] e o IR preserva a instrução para o controle interpretá-la. O 8 é um endereço de dado. Avançar o PC para 1 prepara a próxima busca, mas ainda não coloca o operando no acumulador.",
        "A operação LOAD solicita a RAM[8], que neste exemplo contém 5. É esse conteúdo que chega ao ACC. A leitura não apaga o byte da RAM. A mudança observável é ACC=5, e não ACC=8.",
      ],
      [
        "Separe o endereço enviado pelo PC da instrução devolvida.",
        "Leia LOAD e seu endereço dentro do IR.",
        "Compare o conteúdo de RAM[8] com o novo ACC.",
      ],
      "Se RAM[8] contivesse 9, quais partes da instrução permaneceriam iguais?",
    ),
    mechanism(
      "O controle transforma uma instrução em ações",
      [
        "Fetch seleciona a instrução usando o PC, copia sua representação para o IR e prepara o próximo endereço. Buscar uma instrução não executa automaticamente a operação descrita por ela. A separação permite observar a dependência entre as fases.",
        "Decode reconhece LOAD e organiza os sinais necessários para ler o endereço 8 e escrever no ACC. Nesta microetapa o acumulador continua em 0. O bloco de controle representa uma função interna da CPU, separada espacialmente para estudo.",
        "Execute efetua a transferência do operando. O ACC recebe 5 somente quando a leitura é concluída. Em CPUs reais há outras organizações e sobreposição de fases; nosso modelo sequencial mantém uma ação por vez para tornar o efeito verificável.",
      ],
      [
        "Veja IR preenchido e PC=1, sem confundir isso com execução.",
        "O controle prepara uma leitura; o dado ainda não chegou ao ACC.",
        "Só a chegada do byte deve atualizar o receptor.",
      ],
      "Uma instrução já presente no IR prova que seu efeito na memória aconteceu?",
    ),
    mechanism(
      "Oito bits limitam a representação",
      [
        "A ALU pode ser discutida com uma soma matemática mais larga: 250+10=260. Esse resultado exige nove bits sem sinal. A cena separa o resultado amplo do registrador para mostrar exatamente onde ocorre a redução de largura.",
        "O ACC desta máquina mantém apenas os oito bits baixos. Descartar o bit acima dessa largura equivale a calcular 260 mod 256, que resulta em 4. Isso é uma regra explícita do simulador; não uma falha da adição matemática.",
        "STORE copia o conteúdo atual do ACC para RAM[10]. Como o ACC guarda 4, a memória recebe 4. O armazenamento não recupera os bits já descartados. A RAM e o ACC terminam com o mesmo byte, embora sejam locais distintos.",
      ],
      [
        "Compare a soma ampla com o limite 255 do ACC.",
        "Acompanhe a redução de 260 para 4.",
        "Confira que STORE copia 4, sem refazer a soma.",
      ],
      "Uma máquina que usasse saturação armazenaria o mesmo resultado? Justifique a regra.",
    ),
  ],
  memory: [
    mechanism(
      "Topo da pilha descreve ordem, não valor do endereço",
      [
        "PUSH 4 usa a primeira posição livre da stack: 31, ou 0x1F. O valor 4 é o conteúdo e 31 é a localização. A stack do modelo cresce para endereços menores; essa direção não define por si só a ordem de retirada.",
        "PUSH 8 usa a posição 30 e passa a ser o topo. O 4 continua armazenado abaixo dele na ordem lógica da pilha. A regra LIFO depende de qual item entrou por último, não de qual valor numérico é maior.",
        "POP devolve o último item, 8, e atualiza o topo para o 4 restante. Tornar uma posição livre não exige que todos os seus bits físicos sejam zerados. O programa deve respeitar o estado lógico da estrutura, e não tratar bytes antigos como objetos válidos.",
      ],
      [
        "Diferencie PUSH 4 de escrever no endereço 4.",
        "O topo muda para o valor mais recente.",
        "Veja o programa receber 8 e a posição 30 ficar livre.",
      ],
      "Após POP e PUSH 2, qual valor sairia no próximo POP?",
    ),
    mechanism(
      "Uma reserva tem intervalo e duração",
      [
        "malloc(4) procura um intervalo contíguo de quatro bytes e devolve seu início. O retorno 0 representa o endereço do bloco [0..3], não quatro bytes contendo o número zero. O alocador mantém a informação de ocupação.",
        "A segunda reserva começa em 4 e ocupa oito bytes, até 11. Reservas ativas não devem se sobrepor. A estratégia first-fit percorre candidatos procurando o primeiro intervalo suficiente; ela não precisa escolher o maior espaço livre.",
        "Liberar o segundo bloco permite reutilizar seu início para uma reserva menor. O novo bloco [4..5] tem outra duração e outro contrato. Um ponteiro antigo para o objeto liberado não volta a ser válido apenas porque o endereço foi reaproveitado.",
      ],
      [
        "Marque início, tamanho e último byte do primeiro bloco.",
        "Verifique a fronteira entre os dois intervalos.",
        "Compare reutilização de endereço com identidade de objeto.",
      ],
      "Por que ter oito bytes livres no total não garante conseguir um bloco contíguo de oito?",
    ),
    mechanism(
      "Tradução preserva o deslocamento",
      [
        "Dividir 35 por 16 produz página virtual 2 e resto 3. A MMU precisa localizar o mapeamento da página e preservar esse deslocamento dentro dela. O endereço virtual pertence à visão do processo, não é uma indicação direta do lugar no chip.",
        "A tabela associa a página virtual 2 ao frame físico 7. O conteúdo da tabela é metadado de tradução. Um acesso também exige entrada válida e permissões compatíveis; encontrar um número de frame não autoriza toda operação.",
        "O frame 7 começa em 7×16=112. Acrescentar o deslocamento 3 produz o endereço físico 115. A cena ilustra a aritmética de tradução; TLB, falhas de página e múltiplos níveis acrescentariam outros caminhos em um sistema completo.",
      ],
      [
        "Separe quociente e resto de 35÷16.",
        "A página muda de referência; o offset permanece 3.",
        "Confira a base 112 antes de somar o deslocamento.",
      ],
      "Se o endereço virtual fosse 38 na mesma página, qual seria o endereço físico?",
    ),
  ],
  os: [
    mechanism(
      "Estar pronto não é estar executando",
      [
        "P1 tem trabalho pendente e não espera um evento externo, portanto pode entrar na fila de prontos. Isso apenas o torna elegível. Em um núcleo único, outro processo pode estar usando a CPU enquanto P1 aguarda.",
        "O escalonador escolhe P1 e restaura o contexto necessário para retomar sua execução. A seta até a CPU representa uma decisão de despacho. Não é o processo inteiro sendo fisicamente transportado da RAM para outro equipamento.",
        "Quando P1 perde a vez, seu contexto precisa ser preservado. Se ainda está pronto e tem trabalho restante, retorna à fila. Se estivesse esperando uma leitura, iria para um estado bloqueado, e não simplesmente para o fim da fila de prontos.",
      ],
      [
        "Confira que trabalho restante não significa uso atual da CPU.",
        "Identifique a mudança pronto → executando.",
        "Diferencie preempção de bloqueio por E/S.",
      ],
      "Que evento tornaria um processo bloqueado elegível para voltar à fila?",
    ),
    mechanism(
      "Quantum limita cada turno, não o trabalho total",
      [
        "Com quantum 1, P1 consome uma unidade de sua demanda inicial de três. Como restam duas, ele retorna ao fim da fila. O tempo usado não desaparece quando ocorre a troca: o trabalho restante é parte do estado preservado.",
        "P2 é o próximo da fila e recebe seu turno. P3 virá em seguida, pois todos chegaram em t=0 e a ordem inicial foi P1, P2, P3. A política evita que P1 monopolize o núcleo até terminar suas três unidades.",
        "P3 termina em t=3; os outros continuam até t=6. Esse total soma as demandas 3+2+1 e exclui custo de troca de contexto. Mudar o quantum pode mudar espera e primeira resposta mesmo quando o trabalho útil total permanece igual.",
      ],
      [
        "P1 deve terminar o turno com duas unidades restantes.",
        "Leia a ordem da fila além do nome no núcleo.",
        "Separe conclusão de P3 do término de todos os processos.",
      ],
      "Por que dois quanta diferentes podem ter o mesmo trabalho total e tempos de resposta diferentes?",
    ),
    mechanism(
      "Uma syscall tem pedido, trabalho e retorno",
      [
        "read informa um descritor, um buffer e uma quantidade máxima desejada. O programa atravessa uma interface de serviços do kernel. Isso não concede acesso direto a qualquer dispositivo ou endereço de memória.",
        "O kernel valida descritor e destino, e o recurso pode oferecer menos bytes do que o máximo solicitado. No exemplo só há 20 disponíveis. Dados e código de retorno são informações relacionadas, mas distintas: um descreve o conteúdo e o outro quantos bytes foram entregues.",
        "O retorno 20 obriga o programa a tratar os 20 bytes efetivamente recebidos. Zero pode significar fim de arquivo e uma falha deve ser tratada conforme a interface. Presumir que chegaram os 100 pedidos pode fazer o programa interpretar memória sem dados válidos.",
      ],
      [
        "Leia 100 como máximo pedido, não como resultado garantido.",
        "Compare buffer preenchido e quantidade devolvida.",
        "O programa deve decidir a próxima ação a partir do retorno.",
      ],
      "Qual informação faltaria se a API devolvesse só ‘sucesso’ sem a quantidade lida?",
    ),
  ],
  network: [
    mechanism(
      "Resolver um nome vem antes de pedir a página",
      [
        "A pergunta DNS solicita o registro A de academy.example. Esse tipo de registro associa um nome a um endereço IPv4. Ainda não há um GET HTTP nem conteúdo de página trafegando nesta seta.",
        "O resolvedor devolve 192.0.2.10, um endereço reservado para documentação. O cliente aprende um destino de rede; não recebe código HTML. Em uma rede real o resolvedor pode recorrer a cache e a outros servidores DNS.",
        "Com um endereço conhecido, o cliente pode iniciar a conexão ao serviço. DNS e TCP resolvem problemas distintos. Saber o IP não prova que o servidor esteja acessível, que a porta aceite conexões ou que a aplicação responda corretamente.",
      ],
      [
        "Identifique o nome e o tipo A dentro da pergunta.",
        "A resposta contém endereço, não HTML.",
        "SYN vai ao serviço, não ao resolvedor DNS.",
      ],
      "Qual etapa continua necessária se o endereço já estiver em cache?",
    ),
    mechanism(
      "O handshake estabelece os dois sentidos da conexão",
      [
        "SYN anuncia o número inicial 100 do cliente. O SYN consome uma posição no espaço de sequência; por isso a confirmação esperada é 101. Essa mensagem negocia o início da conexão e não entrega a página.",
        "SYN-ACK confirma o SYN do cliente com ack=101 e anuncia seq=500 do servidor. Agora existe informação para confirmar o início dos dois fluxos de bytes. Os números de sequência das duas direções são independentes.",
        "O cliente confirma o SYN do servidor com ack=501. Nesta experiência, o mesmo segmento também carrega GET /. É uma simplificação explícita do cenário. Em HTTPS ainda haveria negociação TLS antes do pedido HTTP protegido.",
      ],
      [
        "Associe seq=100 à direção cliente → servidor.",
        "Separe ack=101 de seq=500.",
        "Reconheça a confirmação TCP e o pedido HTTP como funções distintas.",
      ],
      "Por que ack=101 não significa que o servidor já enviou 101 bytes de HTML?",
    ),
    mechanism(
      "Latência soma caminhos e esperas definidos",
      [
        "Sem cache DNS, o modelo conta dois trechos de DNS, três do handshake/pedido e um da resposta. Com L=40 ms por trecho, a parcela de rede é 6×40=240 ms. O recorte mostra uma comparação de custos, não a captura de um pacote real.",
        "O servidor acrescenta 20 ms de processamento, totalizando 260 ms. Tempo de transmissão de um corpo grande não foi incluído. A duração da bolinha é escolhida para leitura e não mede os milissegundos do sistema simulado.",
        "O cache DNS evita dois trechos, reduzindo o total para 180 ms. Perder o primeiro SYN acrescenta o timeout didático de 1.000 ms, produzindo 1.180 ms nesse caso. Cache não elimina a conexão nem o processamento da aplicação.",
      ],
      [
        "Conte trechos antes de somar processamento.",
        "Confira 240+20, mantendo as unidades.",
        "Diferencie trecho evitado de espera por retransmissão.",
      ],
      "Se L dobrasse, o processamento de 20 ms também precisaria dobrar?",
    ),
  ],
  database: [
    mechanism(
      "Chave identifica a linha; página indica onde procurar",
      [
        "O predicado id=12 exige igualdade exata. A raiz ajuda a localizar uma página candidata usando separadores. Isso é um caminho de busca, não a execução de uma soma nem a leitura da página número 12.",
        "Como 12 está entre os separadores 8 e 16, a busca segue para B. Ali ainda é necessário conferir os registros 8, 10 e 12. Uma página candidata pode existir sem conter a chave pedida, como acontece na consulta por 7.",
        "A página B encontra a chave exata e devolve Pessoa 12. O resultado lógico é uma linha; a quantidade de páginas visitadas é uma medida do caminho para produzi-la. Alterar o plano não deve mudar qual registro satisfaz o predicado.",
      ],
      [
        "Leia o id enviado pela consulta.",
        "Compare a chave com os registros de B.",
        "Diferencie a linha retornada da página que a continha.",
      ],
      "O que deve ser devolvido se a página correta não contiver a chave exata?",
    ),
    mechanism(
      "O índice troca uma varredura por um caminho orientado",
      [
        "O separador 16 encaminha 20 para C. A comparação usa a ordem das chaves para descartar A e B. A raiz tem custo e espaço próprios: ela não é um atalho gratuito fora do armazenamento.",
        "C reúne 16, 18 e 20. A leitura da folha verifica se 20 existe; apenas escolher o intervalo não basta para retornar uma pessoa. Neste modelo estático, os registros estão nas próprias folhas e não há uma segunda busca em heap.",
        "O caminho leu uma raiz e uma página de dados. A varredura de 20 visitaria A, B e C. Isso não prova que índices sempre vencem: tamanho da tabela, cache, seletividade e manutenção de escritas influenciam o custo em um banco real.",
      ],
      [
        "Veja qual comparação evita consultar A e B.",
        "A página C recebe o pedido e verifica a chave.",
        "Conte raiz e páginas de dados separadamente.",
      ],
      "Uma consulta que retorna quase toda a tabela necessariamente se beneficia do mesmo índice?",
    ),
    mechanism(
      "Confirmar é diferente de modificar um estado pendente",
      [
        "BEGIN delimita a transação. No exemplo, a operação de negócio transfere 10 de A para B e deve preservar a soma 150. Cada atualização isolada não expressa toda essa regra; por isso precisamos raciocinar sobre o conjunto.",
        "Débito e crédito estão pendentes e o log registra informação para recuperação. O desenho mantém o estado confirmado separado do estado proposto. Se houver erro, a aplicação precisa tratar a transação corretamente; uma operação parcialmente confirmada violaria a transferência.",
        "COMMIT confirma A=90 e B=60 neste recorte. Isso não significa gravar todas as páginas naquele instante. Registro durável, escrita de páginas e visibilidade a transações concorrentes seguem regras específicas; a cena não implementa WAL nem MVCC reais.",
      ],
      [
        "Anote os saldos iniciais e a soma que deve permanecer igual.",
        "Compare valores pendentes com o estado confirmado.",
        "Só o último passo representa confirmação da unidade de trabalho.",
      ],
      "Por que o desenho não autoriza concluir que toda transação usa isolamento serializável?",
    ),
  ],
  compiler: [
    mechanism(
      "Caracteres viram tokens antes de formar estrutura",
      [
        "O lexer agrupa os caracteres consecutivos 1 e 2 em um número 12. O texto ‘12’ não descreve duas operações separadas. A regra de formação do token deve ser clara antes de tentar reconhecer uma expressão.",
        "Os espaços entre tokens são ignorados, e + recebe sua própria classificação. Ignorar espaços não permite colar dois números separados como ‘1 2’ em 12. Um token conhecido isoladamente também não garante que a sequência inteira seja válida.",
        "O parser aplica a gramática à sequência e constrói a árvore ADD(12,3). Se faltasse um operador ou operando, ele rejeitaria a estrutura. Não é necessário executar a expressão para descobrir que sua forma está incompleta.",
      ],
      [
        "Diferencie quantidade de caracteres de quantidade de tokens.",
        "Observe os limites entre 12, + e 3.",
        "A árvore organiza os tokens segundo a gramática.",
      ],
      "Qual fase deveria rejeitar uma sequência de dois números sem operador entre eles?",
    ),
    mechanism(
      "A árvore preserva dependências da expressão",
      [
        "A multiplicação tem maior precedência nesta gramática. Por isso 3 e 4 formam a subárvore MUL(3,4) antes de serem combinados com 2. A árvore registra o agrupamento, não apenas a ordem visual dos caracteres.",
        "ADD recebe 2 de um lado e a subárvore de multiplicação do outro. O seu segundo operando é o resultado de um grupo, não só o número 3. Mudar para (2+3)*4 altera essas relações e produz outra árvore.",
        "A pós-ordem emite operandos antes da operação: PUSH 2, PUSH 3, PUSH 4, MUL, ADD. Assim cada operação encontra os valores de que precisa. Gerar código é preservar o significado em outra representação, não só reorganizar palavras.",
      ],
      [
        "Localize os filhos de MUL.",
        "Veja a multiplicação inteira como um filho de ADD.",
        "Confira que MUL aparece antes de ADD no bytecode.",
      ],
      "Por que emitir ADD antes de PUSH 4 e MUL mudaria o resultado?",
    ),
    mechanism(
      "A pilha torna visível o efeito de cada instrução",
      [
        "Depois dos três PUSHs, a pilha contém [2,3,4], com 4 no topo. Cada PUSH acrescenta um valor; nenhum deles realiza a multiplicação. O estado completo é necessário para interpretar a próxima instrução.",
        "MUL retira 4 e 3, calcula 12 e empilha um único resultado. A pilha passa de três elementos para dois: [2,12]. O 2 permanece porque pertence à soma externa da árvore.",
        "ADD retira 12 e 2 e empilha 14. Restar um único valor é a condição esperada para uma expressão completa dessa gramática. A VM usa operações próprias e não executa o texto com eval nem gera instruções nativas de uma CPU comercial.",
      ],
      [
        "Leia o topo à direita.",
        "Conte dois operandos consumidos e um resultado produzido.",
        "Confira a pilha final, não apenas o último número desenhado.",
      ],
      "Qual erro de geração você suspeitaria se uma expressão completa terminasse com dois valores na pilha?",
    ),
  ],
  infra: [
    mechanism(
      "A borda separa endereço público e instância",
      [
        "O cliente conhece o endereço do serviço e envia GET / à borda. Não precisa conhecer a lista de instâncias nem escolher A ou B. A borda passa a participar do caminho e também precisa ser considerada ao estudar falhas.",
        "Com cache desligado e ambas saudáveis, o round-robin escolhe A para a primeira requisição. O pedido mantém seu significado; o que muda é a instância que o executa. Duas instâncias não compartilham automaticamente sua memória.",
        "A aplicação devolve a resposta pela borda, que a entrega ao cliente. Esse retorno é parte da conversa. O cenário usa um recurso público constante para comparar roteamento; sessões locais e operações de escrita exigiriam outros contratos.",
      ],
      [
        "O primeiro destino é a borda.",
        "A seleção considera instâncias saudáveis.",
        "Siga o sentido de volta até o cliente.",
      ],
      "Que falha ainda poderia interromper ambos os servidores mesmo com A e B disponíveis?",
    ),
    mechanism(
      "Cache muda quem precisa fazer o trabalho",
      [
        "O primeiro pedido é MISS porque a borda ainda não possui uma cópia utilizável. Ela precisa encaminhá-lo à origem. Cache vazio não é erro: é um estado esperado na primeira leitura desse experimento.",
        "A aplicação responde e a borda armazena uma representação conforme a política simplificada. Guardar o conteúdo é diferente de decidir por quanto tempo ele é válido. Este recorte não implementa expiração nem variação por usuário.",
        "O segundo pedido é HIT e a resposta sai da borda para o cliente. Nenhuma instância recebe um novo GET nessa etapa. O trabalho evitado é observável pelo caminho; não é necessário atribuir uma velocidade inventada ao desenho.",
      ],
      [
        "Veja o MISS seguir até uma instância.",
        "Identifique a resposta que preenche a cópia.",
        "Confirme que o caminho do HIT não passa pela origem.",
      ],
      "Que informação deveria fazer parte da política se a resposta variasse por idioma?",
    ),
    mechanism(
      "Retirar um destino muda o caminho e a capacidade",
      [
        "A foi configurada como indisponível. A borda conhece essa condição antes de rotear, por hipótese do modelo. O marcador interrompido representa ausência de entrega; não devemos destacar A como se tivesse atendido uma requisição.",
        "Com cache desligado, B recebe os dois pedidos. Excluir A preserva esse pequeno cenário de leitura, mas concentra trabalho na instância restante. Estar alcançável não prova que B tenha capacidade para qualquer taxa de chegada.",
        "A resposta retorna ao cliente. Para avaliar o serviço real também precisaríamos observar erros, cauda de latência e saturação sob carga. O sucesso de dois GETs simulados é evidência desse caso, não uma garantia universal de disponibilidade.",
      ],
      [
        "Nenhum recebimento deve ser confirmado no caminho interrompido.",
        "Identifique B como destino de ambos os pedidos.",
        "Separe retorno bem-sucedido de capacidade sob carga.",
      ],
      "Por que repetir pedidos sem limite pode piorar um incidente de sobrecarga?",
    ),
  ],
  architecture: [
    mechanism(
      "Cada visão responde a uma pergunta diferente",
      [
        "Contexto mostra quem usa o sistema e suas relações externas. O pedido do usuário indica uma relação, sem exigir detalhes de processos, tabelas ou bibliotecas. A escala escolhida deve ajudar o leitor a localizar a responsabilidade do sistema.",
        "A visão de containers separa aplicações e armazenamento, como API e banco. Container no C4 não significa obrigatoriamente Docker nem uma máquina física dedicada. A separação descreve unidades executáveis e seus relacionamentos.",
        "Uma sequência dinâmica mostra um cenário específico, como SET x=42 saindo do líder em direção a uma réplica. Ela complementa a visão estrutural: a existência de uma ligação não explica sozinha a ordem nem as condições das mensagens.",
      ],
      [
        "Comece pelo ator e pela fronteira do sistema.",
        "Diferencie a API do armazenamento.",
        "Agora siga uma mensagem concreta, com direção e conteúdo.",
      ],
      "Qual visão você usaria para explicar a um usuário quem depende do sistema?",
    ),
    mechanism(
      "Contar envios não é contar confirmações",
      [
        "O líder recebe SET x=42 e registra a proposta localmente. Isso fornece uma confirmação entre três nós. Ainda não há maioria, portanto a API não pode anunciar COMMIT apenas porque enviou a solicitação.",
        "Uma réplica recebe a proposta e seu ACK retorna ao líder em uma etapa própria. Só o ACK recebido acrescenta evidência à contagem. A réplica indisponível não contribui, mesmo que tenha sido destino de uma tentativa de envio.",
        "Com duas confirmações, a regra 2/3 permite anunciar COMMIT neste modelo de líder fixo. Contar uma maioria não substitui um protocolo completo: eleições, ordenação de logs e recuperação não são implementadas aqui.",
      ],
      [
        "Confira o estado intermediário 1/3.",
        "Siga o ACK de volta, em sentido oposto à escrita.",
        "Verifique a maioria antes do sucesso ao cliente.",
      ],
      "O que estaria errado em confirmar assim que a mensagem sai do líder?",
    ),
    mechanism(
      "A regra pode ser preservada mesmo sem progresso",
      [
        "O líder continua disponível e recebe uma proposta, mas a regra exige dois de três nós. Essa hipótese distingue uma escrita local de uma decisão confirmada. Ter o valor em uma máquina não satisfaz automaticamente a garantia do serviço.",
        "As duas réplicas estão fora e não enviam ACKs. O líder permanece com 1/3 e não pode transformar silêncio em aprovação. Uma ausência de resposta também não seria prova geral de morte em uma rede real.",
        "A API recebe uma resposta sem quórum. A operação não alcançou confirmação, mas a regra ‘nunca confirmar sem maioria’ foi mantida. O líder pode preservar uma proposta pendente; falta de COMMIT não significa apagar todo estado intermediário.",
      ],
      [
        "Declare a exigência 2/3 antes de observar a falha.",
        "O caminho perdido não deve aumentar a contagem.",
        "Diferencie segurança preservada e progresso interrompido.",
      ],
      "Se a resposta ao cliente se perdesse após COMMIT, o cliente poderia concluir que não houve efeito?",
    ),
  ],
};
