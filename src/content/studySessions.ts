import type { LabId } from "./lessons";
export interface Investigation {
  title: string;
  steps: string[];
  expected: string;
}
export interface StudyModule {
  sections: [{ title: string; text: string }, { title: string; text: string }];
  caseStudy: { question: string; analysis: string };
  experiments: [Investigation, Investigation];
  reflection: string;
}
export interface TrackStudy {
  modules: [StudyModule, StudyModule, StudyModule];
  capstone: { brief: string; deliverables: string[]; rubric: string };
}
function m(
  t1: string,
  p1: string,
  t2: string,
  p2: string,
  question: string,
  analysis: string,
  e1: Investigation,
  e2: Investigation,
  reflection: string,
): StudyModule {
  return {
    sections: [
      { title: t1, text: p1 },
      { title: t2, text: p2 },
    ],
    caseStudy: { question, analysis },
    experiments: [e1, e2],
    reflection,
  };
}
function e(title: string, steps: string[], expected: string): Investigation {
  return { title, steps, expected };
}
export const studySessions: Record<LabId, TrackStudy> = {
  logic: {
    modules: [
      m(
        "Um padrão, várias interpretações",
        "A sequência de bits é o material; a codificação é a regra de leitura. O mesmo byte pode participar de um número, de uma cor ou de um texto. Antes de converter, declare a largura e a interpretação. O padrão 11111111 vale 255 sem sinal; em complemento de dois de oito bits, representa -1. Nenhum elétron informa sozinho qual das leituras o programa desejou. Esse contexto vem do formato e das operações. Por isso, ao olhar um arquivo binário, encontrar um número plausível não prova que você decodificou o campo corretamente.",
        "Agrupar ajuda, mas não muda a informação",
        "Hexadecimal representa quatro bits por dígito e facilita reconhecer fronteiras. 0x2A e 00101010₂ descrevem o mesmo padrão. Um campo com vários bytes ainda precisa de uma ordem de armazenamento: números de múltiplos bytes podem colocar o byte menos significativo primeiro ou por último. Essa ordem é diferente da ordem dos pesos dentro de um byte. Não é preciso decorar todos os formatos agora; pratique separar quantidade de bits, valor numérico e convenção de leitura. Faça a conversão nos dois sentidos e confira se recupera o padrão inicial.",
        "Um sensor devolve 11111111. É temperatura -1 ou contagem 255?",
        "Os bits não resolvem a pergunta. A especificação do campo deve informar sinal, unidade e escala. Só depois se aplica a conversão. Um byte de temperatura pode ainda representar uma fração de grau. A regra de leitura é parte dos dados que você precisa conhecer.",
        e(
          "Converta e reconstrua",
          [
            "Escreva os pesos de oito bits.",
            "Converta 13, 42, 128 e 255 para binário sem sinal.",
            "Agrupe cada resultado em pares de quatro bits e escreva hexadecimal.",
            "Volte ao decimal somando pesos, sem consultar a resposta anterior.",
          ],
          "13=0x0D; 42=0x2A; 128=0x80; 255=0xFF. O processo de ida e volta deve preservar os padrões.",
        ),
        e(
          "Mude a interpretação",
          [
            "Na cena, avance de 1101 para a soma e para 13.",
            "Calcule o resultado de 1111 com os mesmos pesos.",
            "Compare 00001111 e 11111111 sem sinal.",
            "Explique por escrito por que número de combinações e maior valor são diferentes.",
          ],
          "Quatro bits distinguem 16 padrões, de 0 a 15. Oito bits distinguem 256, de 0 a 255.",
        ),
        "Se você recebesse apenas os bits de um arquivo desconhecido, quais informações do formato pediria antes de interpretá-los?",
      ),
      m(
        "Uma porta é uma função, não uma opinião",
        "Uma regra lógica precisa dar uma saída definida para cada entrada permitida. Em duas entradas binárias, quatro linhas esgotam os casos; testar só 00 e 11 deixa metade da função sem avaliação. Uma condição escrita em linguagem natural pode esconder ambiguidades: ou pode significar uma alternativa exclusiva ou qualquer uma das duas. A tabela elimina essa dúvida. Para documentar um circuito, escreva as entradas, as quatro saídas esperadas e a justificativa antes de construir a combinação de portas.",
        "Construir outras funções com NAND",
        "Uma NAND com suas duas entradas ligadas ao mesmo A produz NOT A. Se você negar o resultado de NAND(A, B), obtém AND. Aplicar NAND a NOT A e NOT B produz OR, pela relação de De Morgan. Essa construção mostra como uma peça simples pode compor funções diferentes. Não conclua que todas as montagens terão o mesmo custo: número de portas, profundidade e atrasos importam no hardware. A bancada calcula valores ideais, então use-a para verificar a função e deixe a análise elétrica como uma camada separada.",
        "Uma regra diz: permitir acesso se há cartão ou senha. O caso com ambos deve ser bloqueado?",
        "Não dá para decidir pelo nome ou. Se ambos devem permitir, a função é OR; se apenas uma credencial deve estar presente, é XOR. A especificação precisa declarar o caso 11. Um circuito correto implementa a regra escolhida, mesmo que outra regra pareça mais intuitiva.",
        e(
          "Complete antes de executar",
          [
            "Desenhe quatro linhas para 00, 01, 10 e 11.",
            "Preencha AND, OR, XOR e NAND sem usar a bancada.",
            "Em Explorar, teste cada linha nas quatro portas.",
            "Para cada divergência, escreva qual parte da regra você tinha interpretado de outro modo.",
          ],
          "AND: 0001; OR: 0111; XOR: 0110; NAND: 1110, na ordem 00, 01, 10, 11.",
        ),
        e(
          "Derive uma função composta",
          [
            "Verifique NOT A usando NAND(A, A) em papel.",
            "Monte a tabela de NAND(NOT A, NOT B).",
            "Compare a tabela obtida com OR.",
            "Use a cena AND → NOT para explicar por que o último receptor produz zero em 11.",
          ],
          "A composição reproduz OR. A verificação deve incluir as quatro entradas, não apenas o caso da animação.",
        ),
        "Uma composição com a mesma tabela-verdade necessariamente terá o mesmo atraso físico? Por quê?",
      ),
      m(
        "A soma precisa de mais de uma saída",
        "O meio somador transforma duas entradas em soma e carry. Você já viu que 1+1 vira 10₂. Para somar números maiores, a próxima coluna também recebe o transporte anterior: é o papel de um somador completo. Escreva o problema por coluna, começando à direita. Não misture carry com erro: o transporte é uma parte normal da aritmética de várias posições. O problema aparece quando a representação final não oferece lugar para todos os bits necessários ou quando a interpretação escolhida muda o significado do padrão.",
        "Guardar é introduzir uma noção de antes e depois",
        "Uma função combinacional não explica sozinha uma sequência de trabalho. Para usar o resultado em um momento posterior, precisamos de estado e regras de atualização. Um registrador pode manter o valor que outra parte do circuito produziu. Em um sistema síncrono, o clock participa da coordenação dessas atualizações; ele não substitui as regras lógicas nem torna todo cálculo instantâneo. Nesta aula, o somador é lógico e o modelo não simula clock elétrico. O salto conceitual importante é separar a função que calcula da estrutura que guarda e permite continuar.",
        "Se uma entrada muda depois de calcular a soma, a saída antiga fica guardada automaticamente?",
        "Não em uma função combinacional ideal. Ela passa a refletir as novas entradas após a propagação. Preservar a saída antiga requer um elemento de estado e uma condição de captura. Esse detalhe explica por que a CPU precisa de registradores além de uma ALU.",
        e(
          "Duas saídas para quatro entradas",
          [
            "Para cada dupla A/B, calcule XOR e AND.",
            "Escreva o resultado como carry seguido de soma.",
            "Converta o padrão de dois bits para decimal.",
            "Compare com a soma comum de A e B e confira a cena de 1+1.",
          ],
          "00→00; 01→01; 10→01; 11→10. O último resultado exige duas posições.",
        ),
        e(
          "Propague um transporte",
          [
            "Some 0011 e 0001 em papel, da direita para a esquerda.",
            "Registre o carry que sai de cada coluna.",
            "Explique por que só aplicar XOR aos bytes não calcula a soma geral.",
            "Aponte qual registrador da trilha de CPU poderá guardar o resultado 4.",
          ],
          "O resultado é 0100. XOR isolado não incorpora todos os transportes; um acumulador preserva o resultado para outra instrução.",
        ),
        "Como você explicaria a diferença entre calcular um valor e guardar um valor usando o próprio exemplo da soma?",
      ),
    ],
    capstone: {
      brief:
        "Projete em papel um circuito que some dois bits e preserve o resultado para uso posterior. Use as portas disponíveis para verificar cada função separadamente.",
      deliverables: [
        "Tabela completa de entradas, soma e carry",
        "Desenho distinguindo portas e elemento de estado",
        "Explicação de uma limitação elétrica que a bancada não demonstra",
      ],
      rubric:
        "A soma deve corresponder a A+B nos quatro casos. O desenho deve distinguir cálculo e memória e não apresentar o clock como substituto da lógica.",
    },
  },
  cpu: {
    modules: [
      m(
        "O contrato entre programa e processador",
        "Uma ISA define quais instruções existem, seus operandos e seus efeitos observáveis. Um programa só pode depender desse contrato, e não de uma organização visual específica do chip. Nossa ISA usa um acumulador implícito: ADD não precisa escrever seu nome no texto da instrução porque o modelo já determina onde o resultado vai ficar. Outras ISAs nomeiam vários registradores e oferecem formas diferentes de endereçamento. Ao comparar máquinas, descreva o efeito da instrução antes de comparar nomes ou tamanhos físicos.",
        "O endereço do código não é o endereço do dado",
        "A posição 0 em ROM guarda LOAD [8], enquanto a posição 8 em RAM guarda 5. São papéis distintos. Mesmo em uma arquitetura que compartilhe memória entre código e dados, o contexto do acesso define como aquele padrão é usado. O PC escolhe a instrução; o operando da instrução escolhe o dado; o ACC recebe seu conteúdo. Seguir essas três decisões evita uma confusão frequente: imaginar que qualquer número escrito na instrução é o próprio valor da operação.",
        "Um programa funciona com RAM [8]=5, mas agora lê 200. A instrução LOAD mudou?",
        "Não necessariamente. O código pode ser idêntico e o dado armazenado no endereço ter mudado. Essa separação é justamente o que permite reaproveitar um programa com entradas diferentes. Para investigar, compare código, endereços e conteúdo, em vez de só olhar a saída.",
        e(
          "Identifique cada papel",
          [
            "Na cena, selecione PC, ROM, IR, RAM e ACC.",
            "Anote se cada valor mostrado é endereço, instrução ou dado.",
            "Em Explorar, troque RAM [8] por 200 e execute LOAD.",
            "Confira que o operando continua 8 enquanto o conteúdo do ACC muda.",
          ],
          "PC e operando são endereços em seus contextos; IR guarda uma instrução; ACC recebe o byte 200.",
        ),
        e(
          "Rastreie uma cópia",
          [
            "Reinicie a CPU com 5 e 3.",
            "Anote onde o valor 5 existe antes e depois de LOAD.",
            "Verifique se a leitura apagou RAM [8].",
            "Explique por que copiar um valor e mover uma bolinha na ilustração não significam remover o original.",
          ],
          "LOAD preserva RAM [8] e escreve 5 em ACC. A animação mostra a transferência de informação, não consumo do byte de origem.",
        ),
        "Que informações você precisa para distinguir um endereço errado de um dado errado?",
      ),
      m(
        "Uma sequência de estados, não só uma saída",
        "Duas execuções podem produzir a mesma saída por caminhos diferentes. Para entender uma CPU, acompanhe o estado intermediário: PC, IR, ACC e posições de RAM relevantes. Nosso programa tem quatro instruções e doze microetapas. Cada microetapa confirma uma mudança pequena. Uma tabela com uma linha por transição permite localizar o primeiro ponto em que a previsão divergiu. O último resultado sozinho não revela se houve leitura, soma ou escrita na hora esperada.",
        "O modelo sequencial e processadores reais",
        "Pipelines podem sobrepor fases de instruções distintas. Dependências de dados impedem que uma operação use um resultado que ainda não está disponível; desvios mudam qual instrução deve vir a seguir. Interrupções também podem alterar o fluxo de controle. Nada disso autoriza ignorar o efeito prometido pela ISA. A bancada exclui pipeline, saltos e interrupções para que você observe o contrato mais simples. Não use os três passos visuais como fórmula para converter frequência em desempenho real.",
        "O PC mostra 1 enquanto o IR ainda mostra LOAD. Qual dos dois está errado?",
        "Nenhum, neste modelo. O PC já foi incrementado durante a busca e aponta à próxima instrução. O IR preserva a instrução atual até a próxima busca. O significado depende do instante do ciclo, por isso o momento da observação faz parte do diagnóstico.",
        e(
          "Monte o histórico completo",
          [
            "Preveja as doze microetapas de LOAD, ADD, STORE e HALT.",
            "Para cada uma, escreva PC, IR, ACC e RAM [10].",
            "Execute passo a passo e compare uma linha de cada vez.",
            "Marque a primeira transição que realmente altera RAM [10].",
          ],
          "A escrita acontece em STORE; LOAD e ADD afetam ACC. HALT encerra a execução sem apagar o resultado.",
        ),
        e(
          "Leia, volte e reproduza",
          [
            "Pare depois de ADD e anote ACC e RAM [10].",
            "Volte uma microetapa e identifique o que foi desfeito.",
            "Avance novamente e confira o mesmo resultado.",
            "Na aula, repita o fluxo de decode e compare-o com o de execute.",
          ],
          "Snapshots anteriores devem ser recuperados; replay de uma seta não executa uma nova instrução. Decode prepara a operação e execute aplica o efeito.",
        ),
        "Por que a frequência em GHz, sozinha, não informa quanto trabalho útil um programa completa por segundo?",
      ),
      m(
        "Carry e interpretação com sinal",
        "O padrão de oito bits pode ser lido sem sinal ou em complemento de dois. A operação física sobre bits e a interpretação do resultado são camadas relacionadas, mas diferentes. Para oito bits sem sinal, o intervalo vai de 0 a 255. Em complemento de dois, vai de -128 a 127. Assim, 127+1 produz o padrão 10000000, que seria 128 sem sinal e -128 na interpretação com sinal. Não conclua que o significado é escolhido pelo desenho do registrador; ele vem do contrato da instrução e do programa.",
        "Escolha a regra antes de usar o resultado",
        "Uma aplicação pode desejar wraparound, saturação ou detecção de excesso. Um contador circular pode usar módulo; uma grandeza física talvez não deva voltar a zero ao passar do limite. Saturar em 255 seria outra regra, não a regra implementada pelo nosso ADD. Faça perguntas explícitas: o tipo tem sinal? Quantos bits? Há verificação? O que o consumidor do resultado espera? A bancada serve para tornar o wraparound observável, mas não reproduz todas as regras de linguagens de programação.",
        "Uma rotina soma intensidades de 250 e 10 e exibe quase preto. Por quê?",
        "Se ela guardar a soma módulo 256, obterá 4, uma intensidade pequena. Para obter outro comportamento, o programa precisa de representação mais larga ou de uma regra de limitação apropriada. Trocar a animação não corrige uma regra numérica inadequada.",
        e(
          "Teste as fronteiras",
          [
            "Preveja as saídas para 0+0, 127+1, 250+10 e 255+1.",
            "Execute os quatro casos até STORE.",
            "Registre tanto decimal quanto bits do ACC.",
            "Compare quais somas matemáticas ultrapassaram o intervalo sem sinal.",
          ],
          "Saídas: 0, 128, 4, 0. No caso 127+1 não há excesso sem sinal, embora a interpretação com sinal de oito bits exija outro cuidado.",
        ),
        e(
          "Compare contratos",
          [
            "Para 250+10, calcule o resultado com largura maior.",
            "Calcule a saída caso uma regra saturasse em 255.",
            "Compare com o 4 da bancada.",
            "Escreva uma situação em que cada regra faria sentido e uma em que seria inadequada.",
          ],
          "As regras produzem 260, 255 e 4. Não são três respostas da mesma especificação: são três contratos numéricos distintos.",
        ),
        "Se STORE gravou 4 corretamente, ainda pode existir um problema na escolha da representação do programa?",
      ),
    ],
    capstone: {
      brief:
        "Documente a execução de um somador de oito bits para alguém que só conhece números decimais. Use um caso comum e um de fronteira.",
      deliverables: [
        "Tabela de estados para 5+3",
        "Tabela final para 250+10 com conversão binária",
        "Explicação separando ISA, microetapa e limite numérico",
      ],
      rubric:
        "A explicação precisa localizar leitura, cálculo e escrita e distinguir resultado matemático do padrão armazenado.",
    },
  },
  memory: {
    modules: [
      m(
        "Chamadas criam contextos temporários",
        "Ao chamar uma função, o programa precisa preservar informações suficientes para voltar: endereço de retorno, partes do estado e dados locais conforme a convenção da plataforma. Uma chamada dentro de outra cria uma ordem natural de retorno. É por isso que a stack combina com essa organização. Recursão cria mais contextos, não uma única variável local mágica compartilhada por todas as chamadas. A bancada demonstra a disciplina LIFO com bytes; ela não modela todos os detalhes de um frame real nem um tamanho real de stack.",
        "Tempo de vida importa tanto quanto endereço",
        "Um endereço pode continuar sendo escrito como número depois que o objeto ao qual você se referia deixou de existir. Isso não torna o acesso válido. Retornar uma referência para dados temporários exige conhecer as regras da linguagem e o tempo de vida do objeto. Também diferencie retirar da stack de limpar fisicamente todos os bits. A nossa interface marca a posição como livre; isso não é uma promessa de apagamento seguro em hardware real. O modelo acompanha uso e valores conhecidos, não segurança de eliminação de dados.",
        "Uma função termina e outra reutiliza posições semelhantes. Ainda é o mesmo objeto?",
        "Não. Reutilizar armazenamento não preserva a identidade e a duração de um objeto anterior. O local físico pode coincidir, mas o programa precisa respeitar quem é responsável pelos dados atuais e até quando eles são válidos.",
        e(
          "Desenhe três chamadas",
          [
            "Desenhe main chamando A e A chamando B.",
            "Empilhe três marcadores para representar os contextos.",
            "Retire-os na ordem em que as funções devem retornar.",
            "Na bancada, use PUSH 2, PUSH 6, PUSH 4 e confira dois POPs.",
          ],
          "B retorna antes de A; no exemplo numérico, saem 4 e 6 e permanece 2. O paralelo é a ordem, não o formato completo de um frame.",
        ),
        e(
          "Separe local e conteúdo",
          [
            "Inspecione 0x1F antes de um PUSH.",
            "Empilhe um valor e registre endereço e conteúdo em colunas diferentes.",
            "Faça POP e depois outro PUSH com valor diferente.",
            "Explique por que o endereço igual não garante o conteúdo anterior.",
          ],
          "O mesmo lugar pode ter usos sucessivos. O valor precisa ser lido no estado correto e respeitar a duração do dado.",
        ),
        "Uma implementação que deixa bits antigos no armazenamento torna válido acessar um objeto cuja duração acabou?",
      ),
      m(
        "Capacidade total e espaço utilizável",
        "Fragmentação externa significa haver espaço livre separado em trechos que podem ser insuficientes para uma reserva contígua. Fragmentação interna envolve espaço reservado que a carga não usa, como folga de tamanho ou alinhamento. Esses problemas pedem medidas diferentes. First-fit descreve uma política de escolha, não uma garantia de aproveitamento perfeito. Nossa operação free do último bloco restringe os padrões de lacunas observáveis. Ao explicar fragmentação, separe o desenho que você calculou em papel das situações que a bancada realmente permite produzir.",
        "Responsabilidade pela liberação",
        "Um vazamento ocorre quando recursos continuam reservados sem um caminho útil para recuperá-los conforme a política do programa. Liberar cedo demais também é um erro: outro trecho pode ainda precisar do objeto. Por isso, acompanhe propriedade e compartilhamento, não apenas o número de bytes livres. A estratégia varia por linguagem e runtime, podendo incluir coleta de lixo, contagem de referências ou regras explícitas de propriedade. O exemplo malloc/free é um mecanismo específico e não uma obrigação universal de toda linguagem.",
        "Há oito bytes livres em dois trechos de quatro. Cabe um bloco contíguo de seis?",
        "Não nesse arranjo sem movimentação ou mudança de estratégia. Somar bytes livres informa capacidade total, mas não a maior lacuna contígua. Para diagnosticar uma falha de reserva, as duas medidas são relevantes.",
        e(
          "Reutilize sem sobrepor",
          [
            "Reserve blocos de 4 e 8 bytes.",
            "Desenhe os intervalos e verifique que não se sobrepõem.",
            "Libere o último e reserve 2 bytes.",
            "Compare o endereço devolvido e a nova extensão do intervalo.",
          ],
          "A nova reserva pode começar em 4 e ocupar apenas [4..5], preservando [0..3].",
        ),
        e(
          "Investigue falta de espaço",
          [
            "Reserve três blocos de 8 bytes e empilhe oito valores.",
            "Tente mais um PUSH e registre a rejeição.",
            "Libere o último bloco e tente novamente.",
            "Em papel, desenhe uma falha por fragmentação com espaço total suficiente e explique por que é outro cenário.",
          ],
          "Primeiro ocorre limite de capacidade na grade. O desenho em papel pode mostrar uma limitação de contiguidade, que não deve ser confundida com a mesma causa.",
        ),
        "Que informação sobre propriedade faltaria se você observasse somente a quantidade de bytes livres?",
      ),
      m(
        "Tradução é um caminho de acesso",
        "Um endereço virtual passa por estruturas de tradução e verificações de permissão antes de determinar o acesso físico. A tabela pertence ao contexto de endereçamento do processo. Uma TLB pode manter traduções recentes; ela não é uma cópia geral de todos os dados da RAM. Distinguir cache de traduções e cache de dados evita explicar toda falha como se fosse a mesma ausência de conteúdo. A cena desta aula ilustra um mapeamento fixo pequeno, sem simular a TLB ou o sistema operacional resolvendo faltas.",
        "Nem toda falta é a mesma coisa",
        "Uma página ausente pode exigir intervenção do sistema para estabelecer ou recuperar um mapeamento permitido. Um acesso proibido, por outro lado, pode ser uma violação de proteção, sem que exista uma página legítima a carregar. Não trate swap como sinônimo de memória virtual: tradução e isolamento têm utilidade mesmo quando não há troca de páginas com armazenamento secundário. O deslocamento dentro da página permanece durante a tradução, o que torna possível praticar a aritmética separadamente das políticas do sistema.",
        "O endereço 35 acessa 115 em um processo. Outro processo precisa repetir o resultado?",
        "Não. A tradução depende do mapeamento daquele processo. Com a página 2 mapeada para o frame 5, o mesmo endereço virtual corresponderia a 83 no exemplo de páginas de 16 bytes: 5×16+3.",
        e(
          "Traduza três endereços",
          [
            "Use páginas didáticas de 16 bytes e o mapeamento página 2 → frame 7.",
            "Decomponha 32, 35 e 47 em página e deslocamento.",
            "Calcule o endereço físico de cada um.",
            "Avance os três passos da cena e confira o caso 35.",
          ],
          "Os resultados são 112, 115 e 127. Todos pertencem à mesma página virtual e preservam seus deslocamentos.",
        ),
        e(
          "Compare contextos",
          [
            "Troque em papel o mapeamento da página 2 para o frame 5.",
            "Refaça a tradução de 35 e 38.",
            "Descreva o que ocorreria se a escrita não fosse permitida.",
            "Explique por que a grade de heap/stack e essa tabela mostram camadas diferentes.",
          ],
          "35→83 e 38→86. Um endereço calculado não elimina a necessidade de permissão; alocação e tradução não são o mesmo mecanismo.",
        ),
        "Por que RAM suficiente não prova que todo ponteiro do programa pode ser acessado?",
      ),
    ],
    capstone: {
      brief:
        "Explique o caminho de um valor desde a duração de um objeto até um acesso traduzido. Use a grade para alocação e a cena de MMU para tradução.",
      deliverables: [
        "Sequência de PUSH/POP ou malloc/free com endereços e conteúdos separados",
        "Uma tradução virtual completa com tamanho de página declarado",
        "Diagnóstico distinto para falta de capacidade, fim de duração e violação de permissão",
      ],
      rubric:
        "Não confunda reservar, inicializar, liberar e traduzir. Cada conclusão deve declarar a camada e as hipóteses do exemplo.",
    },
  },
  os: {
    modules: [
      m(
        "Concorrência não exige vários núcleos",
        "Concorrência significa organizar tarefas cujas execuções podem se sobrepor no tempo. Em um núcleo, elas se intercalam; em vários, algumas podem executar em paralelo. Threads do mesmo processo costumam compartilhar o espaço de dados, mas mantêm seus próprios fluxos de execução. Essa combinação cria oportunidades e riscos: uma troca entre duas instruções pode expor um estado intermediário. O escalonador escolhe quem executa; ele não adivinha automaticamente quais sequências da aplicação precisam ser protegidas como uma operação indivisível.",
        "Uma conta simples pode esconder vários passos",
        "Considere incrementar um contador compartilhado: ler, somar e gravar são ações distintas em um modelo simples. Se duas threads lerem 0 antes de qualquer gravação, as duas podem calcular 1 e gravar 1. O resultado final não representa os dois incrementos desejados. Esse interleaving é um exemplo conceitual de atualização perdida, não uma promessa sobre a implementação de uma expressão em toda linguagem. Para discutir sincronização, declare quais passos podem intercalar e qual regra precisa ser preservada.",
        "Dois programas parecem ativos ao mesmo tempo em uma CPU. Isso prova execução paralela?",
        "Não. A alternância rápida pode dar progresso a ambos em um núcleo. Para provar paralelismo, é necessário observar execução simultânea em recursos distintos, e não apenas janelas abertas ou barras de atividade.",
        e(
          "Classifique estados",
          [
            "Na cena, acompanhe P1 pronto, executando e devolvido à fila.",
            "Desenhe uma tarefa adicional esperando leitura de disco.",
            "Explique por que ela não deveria ocupar a fila de prontos enquanto não puder progredir.",
            "Marque quais transições a bancada executa e quais são apenas o cenário de I/O desenhado.",
          ],
          "Pronto espera CPU; bloqueado espera um evento. O modelo de três processos CPU-bound não executa I/O.",
        ),
        e(
          "Escreva um interleaving",
          [
            "Crie duas sequências ler x, somar 1, gravar x.",
            "Comece com x=0 e intercale as leituras antes das gravações.",
            "Compare o resultado com uma execução completa de cada vez.",
            "Proponha qual trecho precisa ser protegido para preservar dois incrementos.",
          ],
          "A execução intercalada pode terminar em 1; a serial termina em 2. A regra de proteção precisa cobrir a operação composta relevante.",
        ),
        "Qual é a diferença entre preservar o contexto de uma thread e preservar uma invariável da aplicação?",
      ),
      m(
        "Métricas contam histórias diferentes",
        "O primeiro atendimento mede resposta; o término mede turnaround. Uma política pode favorecer uma dessas medidas e piorar outra. Com processos que chegam juntos, conte o instante em que cada um começa e termina e só então faça médias. Observe também a distribuição: uma média pequena pode esconder uma tarefa com grande espera. A bancada fixa demandas e não simula entradas futuras, então ela permite comparar a política na mesma carga. Se mudar carga e política ao mesmo tempo, a causa da diferença fica menos clara.",
        "Inclua custos sem inventar medidas da GPU",
        "No modelo sem custo de troca, seis unidades de trabalho continuam seis. Agora faça um segundo cálculo teórico atribuindo 0, 2 unidade a cada troca entre processos. Com quantum 1 há seis turnos e cinco trocas entre turnos; com quantum 2 há quatro turnos e três trocas. Sob essa hipótese, o total vira 7 e 6,6, sem contar outros custos. O tempo da animação não estima esse custo. Essa separação entre simulação e hipótese é o que permite tirar conclusões proporcionais ao experimento.",
        "Quantum menor fez P3 responder antes. É suficiente para escolher a política de produção?",
        "Não. Ainda faltam objetivos da carga, custo de troca, prioridades, bloqueios e comportamento sob novas chegadas. O experimento mostrou uma relação em condições controladas; a decisão precisa considerar o que o serviço valoriza.",
        e(
          "Monte a linha do tempo",
          [
            "Execute quantum 1 e anote os intervalos de P1, P2 e P3.",
            "Repita com quantum 2 e 3 sem mudar demandas.",
            "Para cada processo, registre primeiro atendimento e término.",
            "Compare P3 e a média de término sem substituir uma medida pela outra.",
          ],
          "P3 termina em 3, 5 e 6 respectivamente. O trabalho útil total do modelo permanece seis.",
        ),
        e(
          "Introduza um custo declarado",
          [
            "Conte os turnos com quantum 1 e 2.",
            "Acrescente 0, 2 por troca entre turnos em uma conta separada.",
            "Compare o acréscimo com o ganho de primeira resposta de P3.",
            "Escreva qual objetivo levaria você a aceitar mais trocas.",
          ],
          "Cinco trocas acrescentam 1; três acrescentam 0, 6. Não trate esses números teóricos como medição de Linux ou hardware real.",
        ),
        "Por que é necessário manter a mesma carga ao comparar duas políticas de escalonamento?",
      ),
      m(
        "Descritores são referências controladas",
        "Uma aplicação não precisa conhecer o local físico de cada byte de um arquivo. Ela recebe um descritor e usa operações definidas pelo sistema. O descritor tem contexto: um número válido para um processo não autoriza automaticamente outro a acessar o mesmo recurso. Leitura e escrita também têm resultados parciais e condições de erro. Uma função de biblioteca pode reunir trabalho, manter buffers e fazer várias chamadas. Observar a biblioteca e observar as syscalls são perspectivas diferentes, ambas úteis para investigar o que aconteceu.",
        "Pipes ligam processos, não fundem seus estados",
        "O shell pode preparar dois programas para que a saída de um alimente a entrada do outro. Isso cria comunicação por bytes, sem tornar as duas memórias um único objeto compartilhado. O produtor pode precisar esperar quando o canal não comporta mais dados, e o consumidor pode esperar quando não há dados disponíveis. Esses exemplos conectam estados de processo a comunicação e recursos limitados. A bancada representa um retorno parcial de read, mas não executa um shell nem expõe arquivos do seu computador.",
        "O programa pediu cem bytes e recebeu vinte. Precisa preencher os oitenta restantes com uma suposição?",
        "Não. Ele trata os vinte recebidos e decide a continuação conforme o contrato: pode haver mais dados depois, fim de arquivo ou erro em outra tentativa. Presumir sucesso completo apaga informação importante do retorno.",
        e(
          "Trace um pedido parcial",
          [
            "Na cena, acompanhe programa, kernel, buffer e retorno.",
            "Anote a diferença entre quantidade pedida e quantidade recebida.",
            "Desenhe três possíveis resultados seguintes: mais dados, fim, erro.",
            "Explique qual informação a aplicação precisaria verificar em cada um.",
          ],
          "A aplicação só pode tratar como recebidos os bytes informados pelo retorno. A decisão seguinte depende do estado real da operação.",
        ),
        e(
          "Desenhe um pipeline de shell",
          [
            "Em papel, conecte um produtor e um consumidor por um pipe.",
            "Marque quem espera se o produtor é mais lento.",
            "Marque quem pode esperar se o consumidor não acompanha.",
            "Relacione as esperas a pronto e bloqueado, sem executar comandos no site.",
          ],
          "A comunicação pode introduzir espera por dados ou espaço. Esses eventos são diferentes de apenas esperar uma vez na CPU.",
        ),
        "Por que uma transição para o kernel não deve ser descrita automaticamente como troca para outro processo?",
      ),
    ],
    capstone: {
      brief:
        "Analise uma aplicação com três tarefas: cálculo, leitura e consumo de dados. Separe política de CPU, espera por evento e regra de compartilhamento.",
      deliverables: [
        "Linha do tempo de uma execução round-robin",
        "Diagrama de estados com uma espera por I/O",
        "Um interleaving que viola uma invariável e a região que exigiria proteção",
      ],
      rubric:
        "Use métricas distintas para resposta e término. A conclusão deve explicitar quais custos e eventos foram excluídos da bancada.",
    },
  },
  network: {
    modules: [
      m(
        "Um nome resolve registros, não toda a aplicação",
        "Uma URL pode conter esquema, nome, porta e caminho, mas cada parte tem função diferente. O DNS não recebe o caminho completo para descobrir uma página; ele responde perguntas sobre nomes e tipos de registro. A porta participa da seleção do serviço no destino. A resposta de um registro A informa IPv 4, enquanto AAAA trata de IPv 6. Um sistema pode possuir vários endereços e regras de seleção. A experiência fixa um endereço de documentação para que você acompanhe a separação de responsabilidades sem enviar tráfego externo.",
        "Cache tem validade e contexto",
        "Uma resposta guardada evita trabalho enquanto as regras permitem sua reutilização. Quando a validade acaba, o caminho de resolução pode ser necessário novamente. Um resolvedor pode consultar outros servidores e seguir respostas, mas o nosso par consulta/resposta condensa esse processo. Considere também falhas de camadas diferentes: um nome pode resolver corretamente e o destino recusar a conexão; a conexão pode funcionar e a aplicação devolver erro. Diagnosticar por camadas evita interpretar todo problema de um site como problema de DNS.",
        "O navegador sabe o endereço, mas não recebe a página. O DNS está necessariamente errado?",
        "Não. Conhecer o IP é uma condição anterior a outras etapas, não uma garantia de conexão ou sucesso HTTP. Procure a primeira fase que não teve o resultado esperado e separe endereço de serviço, transporte e resposta da aplicação.",
        e(
          "Separe uma URL",
          [
            "Use como exemplo http://academy.example: 80/aula.",
            "Marque esquema, nome, porta e caminho.",
            "Na cena, identifique qual parte aparece na consulta A.",
            "Explique o que ainda precisa acontecer depois do IP recebido.",
          ],
          "A consulta trata do nome academy.example. Porta e caminho participam de outras etapas da comunicação.",
        ),
        e(
          "Compare resolução e conexão",
          [
            "Execute a rede sem cache e anote consulta e resposta.",
            "Ative DNS em cache e reinicie.",
            "Confira quais mensagens foram evitadas e quais permaneceram.",
            "Desenhe um caso em que DNS tem sucesso, mas o serviço não atende.",
          ],
          "Cache evita duas mensagens no modelo; handshake e pedido HTTP ainda existem. Endereço conhecido não significa serviço saudável.",
        ),
        "Que evidência diferenciaria falha de resolução de uma resposta HTTP com status de erro?",
      ),
      m(
        "Bytes confiáveis não definem a regra da aplicação",
        "TCP trata ordenação e entrega do fluxo, enquanto HTTP define pedidos, respostas e semântica. Uma aplicação ainda precisa interpretar status, cabeçalhos e corpo. Um corpo pode ser dividido em vários segmentos de transporte ou várias partes de uma leitura; a fronteira de um pacote não é uma fronteira universal de mensagem. A escolha do formato é parte do protocolo de aplicação. Na bancada, a etiqueta resume mensagens para leitura e não implementa toda a segmentação ou todas as regras de uma conexão real.",
        "Sucesso de transporte e sucesso de negócio",
        "HTTP 200 indica sucesso segundo a semântica da requisição, mas uma aplicação precisa de contratos claros para explicar o resultado ao usuário. Métodos também têm propriedades importantes, como segurança e idempotência, que afetam repetição e cache. Não confunda ausência de estado automático de sessão em HTTP com impossibilidade de manter sessões: cookies e outros mecanismos podem participar dessa camada. TLS acrescenta proteção e negociação que não aparecem neste modelo; HTTP/3 usa outro transporte, então não aplique este handshake a todo tráfego web.",
        "Um ACK chegou, mas depois veio um erro HTTP. A rede se contradisse?",
        "Não. O transporte pode confirmar posições do fluxo enquanto a aplicação comunica uma falha da requisição. As mensagens pertencem a contratos diferentes. Um diagnóstico precisa preservar essa distinção em vez de chamar tudo de sucesso ou fracasso genérico.",
        e(
          "Explique os números do handshake",
          [
            "Preveja os ACKs para SYN com seq=100 e seq=500.",
            "Avance as três mensagens e confira as duas direções.",
            "Explique por que SYN ocupa uma posição.",
            "Separe no histórico o último ACK do conteúdo GET que ele carrega neste modelo.",
          ],
          "Os valores esperados são ack=101 e ack=501. A carga GET é uma mensagem da aplicação carregada sobre o transporte.",
        ),
        e(
          "Desenhe fronteiras diferentes",
          [
            "Desenhe uma mensagem HTTP com cabeçalhos e corpo.",
            "Divida seus bytes em três trechos sem respeitar linhas.",
            "Explique por que o receptor ainda precisa reconstruir e interpretar o fluxo.",
            "Compare a resposta 200 da bancada com um erro de aplicação hipotético.",
          ],
          "Transportar bytes e identificar a mensagem são responsabilidades relacionadas, mas diferentes. A divisão em segmentos não define sozinha a semântica HTTP.",
        ),
        "Por que trocar um código de status sem definir seu significado para o cliente pode piorar o diagnóstico?",
      ),
      m(
        "Latência e capacidade de transferência",
        "Esperar a primeira resposta e transferir um corpo grande são custos diferentes. Uma conexão pode ter pouco atraso por trecho e ainda transferir poucos bytes por segundo; outra pode iniciar lentamente e depois entregar um volume grande com alta vazão. Para uma conta teórica, declare unidades: vinte mil bytes a cem mil bytes por segundo exigem 0, 2 segundo de serialização ideal, além de outros custos. A bancada atual não modela tamanho do corpo ou vazão, por isso seu tempo total descreve somente as etapas e esperas definidas.",
        "Uma hipótese precisa de uma comparação justa",
        "Mude uma variável por vez. Primeiro altere latência mantendo cache e perda constantes. Depois fixe latência e altere cache. Por fim, ative a perda opcional. A retransmissão mostra como um evento raro pode aumentar bastante a espera, mesmo quando o caminho normal está rápido. No mundo real, protocolos ajustam temporização e reagem ao congestionamento; aqui o timeout é fixo por escolha didática. Use a fórmula do modelo para prever, não para prometer o tempo de qualquer site real.",
        "Dobrar a velocidade de transferência sempre reduz pela metade o tempo de uma consulta pequena?",
        "Não. Se boa parte da espera é resolução, negociação ou processamento, aumentar vazão não remove esses custos. Decompor o tempo permite identificar qual parcela uma mudança poderia afetar.",
        e(
          "Faça uma matriz de cenários",
          [
            "Preveja totais para L=40 e L=100, sem cache e com cache.",
            "Execute os quatro casos e registre os resultados.",
            "Ative a perda com L=100 e cache ligado.",
            "Explique cada diferença como trechos evitados ou espera acrescentada.",
          ],
          "Totais: 260, 180, 620, 420 ms; com perda no último caso, 1420 ms. A parcela de processamento permanece 20 ms.",
        ),
        e(
          "Separe rede e leitura visual",
          [
            "Repita o mesmo caso em velocidade 0,5× e 2×.",
            "Compare o tempo registrado e a duração percebida da bolinha.",
            "Acrescente em papel um corpo de 20.000 bytes a 100.000 bytes/s.",
            "Liste quais parcelas dessa conta não estão na bancada.",
          ],
          "A velocidade visual não altera os milissegundos do modelo. A parcela de transferência ideal acrescentaria 200 ms no cenário teórico, sem tornar essa uma medição real.",
        ),
        "Qual experimento você faria para testar se a lentidão vem do servidor, do caminho de rede ou do volume de dados?",
      ),
    ],
    capstone: {
      brief:
        "Produza um diagnóstico de uma requisição lenta, distinguindo DNS, abertura TCP, aplicação, transferência e retransmissão.",
      deliverables: [
        "Tabela prevista e observada para quatro configurações",
        "Linha do tempo com origem e destino de cada mensagem",
        "Hipótese de lentidão com uma comparação que poderia refutá-la",
      ],
      rubric:
        "Toda conta precisa declarar unidade e hipóteses. Não use duração da animação ou ACK como prova de sucesso da aplicação.",
    },
  },
  database: {
    modules: [
      m(
        "A pergunta define o resultado correto",
        "Um predicado de igualdade não é uma busca pelo valor mais parecido. Se a chave está ausente, retornar zero linhas é sucesso da consulta, embora não seja o resultado que uma tela talvez desejasse. Um sistema pode definir buscas aproximadas, ordenação e limites, mas isso precisa aparecer no contrato. Neste conjunto, as chaves são únicas; em uma tabela sem essa restrição, uma igualdade poderia retornar várias linhas. Separar regra lógica e localização física ajuda a não confundir otimização com mudança do significado da pergunta.",
        "Organização física tem consequências",
        "Registros ocupam páginas, páginas podem estar em cache e o armazenamento pode ser acessado por caminhos distintos. Isso significa que contar linhas, páginas lógicas e operações físicas fornece medidas diferentes. A bancada mostra páginas lógicas fixas, com três registros cada. Ela não promete que cada objeto 3D seja um disco por página, nem que um acesso seja uma leitura física nova. Use o modelo para aprender o caminho e depois declare o que faltaria medir em um banco real.",
        "A busca por 7 terminou sem linhas. É evidência de erro no índice?",
        "Não necessariamente. Nenhuma página contém 7. Compare com a varredura sobre o mesmo conjunto: se ambas retornam vazio, o resultado é coerente. Um diagnóstico de índice exigiria uma divergência em relação aos dados ou ao contrato, não apenas ausência de correspondência.",
        e(
          "Registre conjunto e predicado",
          [
            "Copie as nove chaves e distribua nas páginas A/B/C.",
            "Preveja os resultados de consultas por 2, 7, 12 e 20.",
            "Execute todas e anote zero ou uma linha.",
            "Explique por que 7 não deve devolver 6 ou 8.",
          ],
          "O conjunto de resultados é definido pelo predicado. As buscas presentes devolvem a pessoa correspondente; 7 não existe.",
        ),
        e(
          "Compare lógica e armazenamento",
          [
            "Imagine em papel os mesmos registros distribuídos em páginas diferentes.",
            "Mantenha a pergunta id=12.",
            "Explique o que deveria permanecer igual na resposta e o que poderia mudar no custo.",
            "Compare sua hipótese com a separação entre linha retornada e páginas visitadas na bancada.",
          ],
          "A localização pode mudar sem alterar a identidade da linha pedida. Custo e significado da consulta não são sinônimos.",
        ),
        "Por que uma consulta que retorna poucas linhas não é automaticamente uma consulta barata?",
      ),
      m(
        "Reduzir candidatos sem pular a verificação",
        "Uma árvore de busca usa separadores para escolher intervalos menores. Em estruturas reais, vários níveis podem ser necessários, e a altura depende da organização e do volume. A última página candidata ainda precisa conferir a chave. A manutenção também tem custo: escritas podem atualizar estruturas auxiliares, ocupar espaço e exigir reorganizações. Por isso, um índice existe para uma carga de consultas e alterações, não apenas para uma demonstração de leitura. O modelo estático permite comparar caminhos sem executar inserções, divisões de páginas ou otimização de plano.",
        "EXPLAIN descreve uma escolha de plano",
        "Um otimizador considera estatísticas e custos estimados. EXPLAIN permite observar o plano escolhido; uma variante que executa a consulta mede informações da execução e tem consequências diferentes de apenas mostrar uma previsão. Não transfira números de custo diretamente para milissegundos sem entender a ferramenta. Um índice pode ajudar uma igualdade seletiva e não compensar quando quase todas as linhas serão lidas. Na academia a escolha é manual para comparar, e a contagem separa raiz de páginas de dados.",
        "O índice visita uma folha para a chave 2. A varredura também visita uma página. Qual é melhor?",
        "A igualdade de folhas visitadas não elimina o custo da raiz. Neste conjunto pequeno, a estrutura adicional não reduziu páginas de dados nesse caso. A decisão real exigiria considerar cache, custo completo e carga de trabalho, não só a presença da palavra índice.",
        e(
          "Compare três tipos de busca",
          [
            "Procure 2, 20 e 7 com índice ligado.",
            "Anote raiz e páginas de dados separadamente.",
            "Repita sem índice e compare resultados e visitas.",
            "Explique por que a chave mais ao fim favorece mais a redução de candidatos neste conjunto.",
          ],
          "O índice visita uma raiz e uma folha; a varredura pode precisar de 1 ou 3 páginas. O resultado de cada consulta deve continuar igual.",
        ),
        e(
          "Projete uma alteração de carga",
          [
            "Imagine uma consulta que devolve todas as nove linhas.",
            "Liste quais páginas precisam contribuir para o resultado.",
            "Acrescente em papel muitas escritas e discuta a manutenção de índices.",
            "Escreva uma hipótese a verificar com um plano de execução real, sem executar um banco no site.",
          ],
          "Uma estrutura auxiliar não elimina a necessidade de obter todos os dados solicitados. Benefício depende de seleção, organização e custo de manutenção.",
        ),
        "Quais medidas faltam para transformar a contagem de páginas da bancada em uma conclusão de desempenho de produção?",
      ),
      m(
        "Atomicidade não substitui isolamento",
        "Agrupar débito e crédito evita confirmar apenas metade da unidade de trabalho sob as garantias do banco. Mas duas transações concorrentes ainda precisam de regras que preservem invariantes, como não vender o mesmo último item a dois clientes. Leituras de versões diferentes e atualizações concorrentes são assuntos de isolamento, restrições e lógica transacional. Usar BEGIN não torna automaticamente a execução serializável. Para discutir uma anomalia, escreva as leituras e escritas em ordem e mostre qual regra da aplicação deixou de valer.",
        "Confirmação e recuperação têm camadas",
        "WAL registra informações que participam da recuperação antes de determinadas gravações nos arquivos de dados. A política de confirmação e persistência precisa ser conhecida; não presuma que todo arquivo da tabela foi escrito quando COMMIT retornou. A cena ilustra uma unidade pequena com saldo A=100, B=50 e transferência de 10, mantendo pendências e confirmação separados. Ela não implementa o gerenciador do PostgreSQL, falha de energia ou recuperação real. Replicação, durabilidade local e backup tratam problemas diferentes e devem ser avaliados separadamente.",
        "Duas transações leram estoque 1 e ambas decidiram vender uma unidade. Cada uma é atômica; isso basta?",
        "Não. A atomicidade de cada operação não resolve por si só a interação entre elas. É necessário um contrato transacional e mecanismos que protejam a invariável relevante, com tratamento de conflitos e falhas pela aplicação.",
        e(
          "Rastreie a transferência",
          [
            "Na cena, registre saldos confirmados e valores pendentes.",
            "Avance BEGIN, registro das mudanças e COMMIT.",
            "Confira a conservação do total 150 antes e depois.",
            "Desenhe uma falha antes de confirmar e explique qual resultado a aplicação não deve anunciar.",
          ],
          "A confirmação final apresenta A=90, B=60 e preserva 150. Receber uma mudança pendente não é o mesmo que confirmar toda a transação.",
        ),
        e(
          "Escreva a anomalia",
          [
            "Monte duas sequências ler estoque 1, decidir, gravar.",
            "Intercale as leituras antes de qualquer decisão final.",
            "Mostre qual regra de estoque poderia ser violada.",
            "Liste o que deveria ser protegido ou detectado e como tratar uma tentativa rejeitada.",
          ],
          "O raciocínio precisa explicitar a invariável e a interação. A bancada de consulta não mede isolamento nem executa esse conflito real.",
        ),
        "Por que backup não pode ser substituído simplesmente pela afirmação de que existem réplicas?",
      ),
    ],
    capstone: {
      brief:
        "Escolha um padrão de consulta e uma regra de escrita para um pequeno cadastro. Justifique estrutura de busca e garantias necessárias sem confundir custo com correção.",
      deliverables: [
        "Matriz de páginas visitadas para chaves presentes e ausentes",
        "Plano de consulta explicado em termos de candidatos e resultado",
        "Invariável de uma transação e um interleaving que deve ser evitado ou detectado",
      ],
      rubric:
        "O resultado lógico precisa ser preservado ao mudar o caminho de busca. Atomicidade, isolamento, recuperação e backup devem aparecer com papéis distintos.",
    },
  },
  compiler: {
    modules: [
      m(
        "Reconhecer unidades antes de atribuir estrutura",
        "Um lexer precisa de regras para decidir onde um token termina. Números com vários dígitos são um bom começo: 12 não são dois operandos independentes. Espaços podem separar tokens sem criar uma operação implícita. Uma linguagem maior também precisaria definir identificadores, palavras reservadas, comentários e literais. Não extrapole essas capacidades para a linguagem pequena da bancada. Nela, os símbolos aceitos e os limites de entrada são explícitos para que o foco seja compreender o caminho de transformação sem executar texto arbitrário como código do navegador.",
        "Uma mensagem de erro é parte da interface da linguagem",
        "Ao rejeitar uma entrada, é útil distinguir caractere não permitido, token inesperado e estrutura incompleta. Essa informação ajuda a corrigir a causa em vez de apagar pedaços ao acaso. O lexer não determina sozinho precedência, assim como uma lista de palavras reconhecidas não prova que uma frase segue uma gramática. Mantenha uma tabela com fonte, tokens previstos e resultado esperado da validação. Uma expressão aceita e uma rejeitada são ambas casos importantes para verificar o contrato do compilador.",
        "Por que 2 3 não vira 23 nem 2×3?",
        "Porque a linguagem não definiu nenhuma dessas regras. O primeiro caso ignoraria uma separação entre dois números; o segundo inventaria um operador. Rejeitar é mais correto que adivinhar uma intenção que a sintaxe não permite.",
        e(
          "Catalogue entradas",
          [
            "Liste tokens previstos para 12+3,(2+3)*4 e 2 3.",
            "Compile as três e compare aceitação e rejeição.",
            "Teste um símbolo não permitido e uma expressão incompleta.",
            "Escreva se o problema é reconhecer um símbolo ou organizar tokens conhecidos.",
          ],
          "12+3 e(2+3)*4 são aceitas.2 3 não forma expressão válida; 2+ é incompleta. O modelo não usa multiplicação implícita.",
        ),
        e(
          "Investigue os limites",
          [
            "Teste um número de três dígitos e outro de quatro.",
            "Compare uma entrada vazia com parênteses desequilibrados.",
            "Na cena, acompanhe caracteres agrupados e a lista de tokens.",
            "Explique por que limites de entrada e gramática são partes diferentes do contrato.",
          ],
          "O limite de três dígitos é uma restrição da linguagem educacional. Validade de símbolos não elimina a verificação da estrutura.",
        ),
        "Como uma linguagem poderia permitir multiplicação implícita sem depender de adivinhação do compilador?",
      ),
      m(
        "A árvore organiza dependências",
        "Uma AST representa quais partes pertencem a cada operação. A ordem de caracteres ajuda a construir essa árvore, mas não basta para explicar como uma VM deverá avaliar os operandos. Nós internos representam operações e filhos representam dependências. Na pós-ordem, um nó é emitido depois dos filhos, permitindo que seus valores já estejam disponíveis. Desenhe a árvore antes de escrever instruções: assim é possível conferir se a emissão preserva o agrupamento que o parser reconheceu.",
        "Transformar sem alterar o contrato",
        "Uma otimização como calcular uma expressão constante antecipadamente precisa preservar as regras numéricas e efeitos relevantes da linguagem. Trocar qualquer subexpressão por uma conta matemática informal pode ignorar limites, tipos ou ordem de efeitos. A nossa linguagem tem inteiros não negativos, operadores limitados e verificação de inteiros seguros. Ela não executa uma fase de otimização. Use exemplos de dobramento de constantes em papel para discutir o critério de equivalência, sem apresentar o resultado como uma capacidade implementada da bancada.",
        "2+3*4 e(2+3)*4 usam os mesmos tokens numéricos. Por que geram bytecodes diferentes?",
        "Os parênteses mudam a árvore: uma soma contém a multiplicação no primeiro caso; uma multiplicação contém a soma no segundo. A emissão em pós-ordem segue essas dependências, não apenas a lista de números.",
        e(
          "Desenhe antes de compilar",
          [
            "Construa ASTs de 2+3*4,(2+3)*4 e 3*(4+5).",
            "Escreva a pós-ordem de cada árvore.",
            "Compile e compare a AST e o bytecode.",
            "Marque a primeira instrução de operação que difere nos dois primeiros casos.",
          ],
          "MUL precede ADD no primeiro caso; ADD precede MUL no segundo. Os resultados são 14 e 20.",
        ),
        e(
          "Teste uma transformação",
          [
            "Substitua 3*4 por 12 em 2+3*4.",
            "Compare árvore, quantidade de instruções e resultado.",
            "Explique por que a expressão simplificada ainda precisa seguir os limites numéricos.",
            "Escreva um requisito para que uma otimização preserve o significado.",
          ],
          "2+12 mantém 14 para esse caso. Uma simplificação válida precisa respeitar o contrato da linguagem, e não apenas parecer algébrica.",
        ),
        "Qual informação se perderia se você guardasse apenas a lista de tokens e descartasse o agrupamento reconhecido?",
      ),
      m(
        "Instrução e estado devem ser observados juntos",
        "O mesmo ADD pode produzir valores diferentes dependendo dos operandos presentes. Por isso, uma trilha de execução precisa registrar instrução, pilha antes e pilha depois. PUSH aumenta a quantidade de valores; uma operação binária consome dois e produz um, reduzindo a quantidade em um. Para uma expressão aritmética completa dessa gramática, a VM termina com um resultado. Essa propriedade é uma forma simples de conferir a geração de código e localizar um erro sem precisar interpretar a expressão inteira novamente.",
        "Uma cadeia de ferramentas tem mais camadas",
        "Compilação pode envolver análise, representações intermediárias, geração de código, montagem e ligação. Um executável nativo ainda depende de convenções de chamada e serviços de runtime. A VM da academia substitui grande parte dessa cadeia por um alvo pequeno e observável. Debugging relaciona estado e código; profiling investiga custos de uma carga. Não use quantidade de instruções dessa VM como contagem equivalente a instruções de uma CPU comercial. O objetivo é preservar dependências e efeitos em uma representação compreensível.",
        "A pilha contém [2, 12]. Já acabou a expressão 2+3*4?",
        "Não. O MUL já aconteceu, mas falta ADD. Uma leitura só do último valor 12 perderia o operando 2 ainda preservado. O estado completo e a próxima instrução explicam por que o resultado final ainda será 14.",
        e(
          "Faça uma tabela de pilha",
          [
            "Compile 3*(4+5).",
            "Antes de avançar, escreva a pilha esperada após cada instrução.",
            "Execute e compare linha a linha.",
            "Use Voltar um passo para verificar a reversão do último snapshot.",
          ],
          "A sequência passa por [3, 4, 5], depois [3, 9] e termina em [27]. Cada operação binária reduz o número de valores em um.",
        ),
        e(
          "Separe fases e erros",
          [
            "Compare uma entrada rejeitada com uma expressão válida grande.",
            "Explique qual fase produz tokens, qual produz AST e qual modifica a pilha.",
            "Observe a rejeição de resultado fora do intervalo seguro.",
            "Descreva qual estado você inspecionaria se o bytecode correto produzisse um resultado errado.",
          ],
          "A bancada valida segurança numérica antes de aceitar a execução. Erros de estrutura, geração e execução têm evidências e pontos de investigação distintos.",
        ),
        "Por que trocar apenas o texto exibido como resultado não corrige uma transformação de programa incorreta?",
      ),
    ],
    capstone: {
      brief:
        "Especifique e explique a compilação de uma expressão com parênteses e três operações. Inclua também duas entradas que sua linguagem deve rejeitar.",
      deliverables: [
        "Tokens e AST desenhada",
        "Bytecode com pilha antes e depois de cada instrução",
        "Explicação de precedência, validação e limite numérico",
      ],
      rubric:
        "O bytecode deve preservar a árvore. A explicação precisa distinguir fonte, representação e estado de execução, sem atribuir geração nativa à VM.",
    },
  },
  infra: {
    modules: [
      m(
        "A entrada estável esconde escolhas internas",
        "Uma borda pode receber pedidos enquanto instâncias da aplicação são acrescentadas, removidas ou substituídas. Isso desacopla o endereço conhecido pelo cliente da instância que executa uma operação. Não elimina dependências: banco, cache, rede e a própria borda também têm capacidade e falhas. Um diagrama útil explicita cada ponto por onde a requisição passa e onde o estado vive. Adicionar servidores só aumenta capacidade de uma parte do caminho se outra parte não limitar o trabalho antes.",
        "Separar processamento de estado compartilhado",
        "Uma aplicação com sessão apenas na RAM de A pode se comportar de outro modo quando o pedido seguinte vai para B. Affinity pode manter roteamento para uma instância, mas introduz compromissos quando ela falha; mover estado para um serviço compartilhado muda latência e disponibilidade. Não existe uma opção gratuita. A bancada usa respostas públicas iguais para isolar o roteamento. Faça o desenho com sessão ou escrita como um estudo adicional e declare quais novas regras seriam necessárias.",
        "Duas instâncias atrás de uma única borda provam ausência de ponto único de falha?",
        "Não. A borda ou outra dependência ainda pode ser um ponto crítico. Redundância precisa ser analisada por caminho e domínio de falha, não apenas pela contagem de servidores de aplicação.",
        e(
          "Rastreie ida e volta",
          [
            "Desative o cache e siga os dois GETs.",
            "Anote origem e destino de cada mensagem.",
            "Verifique quais pedidos A e B receberam.",
            "Desenhe o caminho de retorno e a dependência compartilhada da borda.",
          ],
          "Round-robin envia a primeira à A e a segunda à B quando ambas estão saudáveis. Cada resposta volta pela borda.",
        ),
        e(
          "Introduza estado no desenho",
          [
            "Imagine que A criou uma sessão que só existe em sua RAM.",
            "Encaminhe em papel o próximo pedido para B.",
            "Compare afinidade e armazenamento compartilhado como alternativas.",
            "Para cada uma, escreva um modo de falha ou custo adicional.",
          ],
          "Escala de processamento não implica compartilhar estado corretamente. A decisão precisa explicitar comportamento quando a instância ou dependência falha.",
        ),
        "Qual dependência você investigaria antes de prometer que dobrar instâncias dobra a capacidade?",
      ),
      m(
        "Uma cópia precisa corresponder ao pedido",
        "Para reutilizar uma resposta, a política precisa saber a qual representação ela se refere. Uma URL que varia por idioma ou identidade não pode ter todas as respostas tratadas como uma única informação pública. Cabeçalhos e regras HTTP participam da seleção e validade. Separar conteúdo público e privado é parte da correção. A experiência evita essas dimensões com um único recurso público e constante. O HIT observado prova a reutilização nesse cenário; não autoriza colocar indiscriminadamente qualquer resposta em um cache compartilhado.",
        "Validade não é imutabilidade eterna",
        "Uma cópia pode ficar velha quando a origem muda. TTL, revalidação e invalidação são estratégias diferentes que precisam de um contrato. Um TTL longo favorece reutilização, mas pode prolongar uma janela de conteúdo antigo. Revalidar pode exigir comunicação mesmo sem baixar todo o corpo novamente. A bancada não simula relógio de validade; ela permite observar MISS, preenchimento e HIT. Para raciocinar além dela, declare um instante de mudança da origem e desenhe o que cada estratégia permitiria devolver.",
        "A página em português foi armazenada e o próximo cliente pede inglês. A cópia serve só porque a URL é igual?",
        "Não necessariamente. A seleção precisa considerar as dimensões relevantes da representação. Uma chave ou política incompleta pode tornar um cache muito rápido e funcionalmente incorreto.",
        e(
          "Meça o caminho evitado",
          [
            "Execute cache ligado e conte visitas à origem.",
            "Repita desligado mantendo o restante igual.",
            "Calcule a taxa de HIT sobre os dois pedidos.",
            "Compare o número de mensagens de ida e volta até a aplicação.",
          ],
          "Com cache ligado, um pedido chega à origem e um é HIT: 50%. Desligado, ambos chegam às aplicações.",
        ),
        e(
          "Desenhe uma mudança da origem",
          [
            "Imagine uma resposta versão 1 guardada na borda.",
            "Mude em papel a origem para versão 2.",
            "Compare manter validade, invalidar e revalidar.",
            "Acrescente variação por idioma e escreva quais informações a política precisaria distinguir.",
          ],
          "Política de cache define quando a cópia ainda pode atender e qual cópia é relevante. Esses tempos e variações são estudos teóricos, não parâmetros implementados na bancada.",
        ),
        "Que observação provaria que um aumento de HIT está devolvendo conteúdo incorreto para algum cliente?",
      ),
      m(
        "Falhas alteram capacidade e conhecimento",
        "Ao retirar A, B pode manter o serviço atendendo, mas passa a receber mais trabalho. Se a carga exceder sua capacidade, filas e latência podem crescer. Um health check apenas verifica um critério; detecção tem tempo e pode divergir do estado de uma operação específica. A bancada torna a detecção imediata para isolar a escolha de destino. Uma conclusão sobre produção precisaria considerar atrasos de detecção, capacidade restante, dependências e comportamento de pedidos que já estavam em andamento.",
        "Repetir também consome recursos",
        "Tentativas extras podem ajudar uma falha transitória e também multiplicar carga durante um incidente. A política precisa de limites, intervalo e semântica de operação. Para escritas, considere identificação e deduplicação; para qualquer pedido, considere quanto trabalho adicional o sistema suporta. Monitore mais do que a média de latência: cauda, erros e saturação descrevem experiências diferentes. Não apresente uma média boa como prova de que todos os usuários foram atendidos rapidamente.",
        "B continuou respondendo aos dois GETs após a falha de A. Isso prova que suportará qualquer pico?",
        "Não. O experimento verificou uma carga mínima em um modelo sem fila. O próximo teste precisaria definir taxa de chegada, capacidade e critério de atendimento. Disponibilidade observada depende da carga e da operação consideradas.",
        e(
          "Retire uma instância",
          [
            "Desative o cache e marque A indisponível.",
            "Preveja o destino dos dois pedidos.",
            "Execute e confirme que nenhum dado foi entregue a A.",
            "Compare com o caso de duas instâncias saudáveis.",
          ],
          "B recebe os dois pedidos e A não deve ganhar destaque de recebimento. A política exclui o destino indisponível antes de encaminhar.",
        ),
        e(
          "Investigue repetição e cauda",
          [
            "Desenhe uma escrita aplicada cuja resposta se perde.",
            "Compare repetir sem identificação e repetir com um contrato de deduplicação.",
            "Liste dez tempos de resposta com um muito alto e compare média e máximo.",
            "Defina que evidência faltaria para escolher um objetivo de latência para o serviço.",
          ],
          "Timeout não prova ausência de efeito. Um resumo estatístico precisa corresponder à experiência que se quer controlar; a bancada não faz teste de carga real.",
        ),
        "Qual regra de repetição você impediria de rodar sem limite durante um incidente de sobrecarga?",
      ),
    ],
    capstone: {
      brief:
        "Desenhe um pequeno serviço com duas instâncias, uma borda e um estado compartilhado. Defina política de cache e comportamento durante uma falha.",
      deliverables: [
        "Caminho de duas leituras com cache ligado e desligado",
        "Uma chave de cache com suas dimensões e regra de validade",
        "Uma política de falha e repetição com hipóteses e limites explícitos",
      ],
      rubric:
        "A proposta precisa separar correção, capacidade e disponibilidade. Não use cache ou mais instâncias como solução automática para qualquer problema.",
    },
  },
  architecture: {
    modules: [
      m(
        "Responsabilidades antes de distribuição",
        "Uma arquitetura começa pelas responsabilidades e contratos que o sistema precisa preservar. Separar módulos dentro de um processo pode melhorar organização sem criar tráfego de rede. Transformar esses módulos em serviços muda latência, operação, observabilidade e modos de falha. A distribuição não apaga o acoplamento: pode torná-lo mais difícil de observar. Antes de escolher caixas, escreva quem é dono dos dados, quem decide cada regra e qual dependência precisa estar disponível para uma operação terminar.",
        "Documente a decisão e não só o desenho",
        "Uma decisão de arquitetura fica mais útil quando registra contexto, alternativas, escolha e consequências. O nível de desenho deve responder à pergunta do leitor. Contexto explica atores e sistemas; containers mostram aplicações e armazenamento; componentes detalham partes internas. A sequência de mensagens complementa a visão estática com um cenário. Na cena, esses níveis aparecem como exemplos lógicos, não como afirmação de que uma caixa sempre corresponde a um equipamento físico dedicado.",
        "Uma aplicação foi dividida em dez serviços que precisam responder juntos a todo pedido. Isso garante independência?",
        "Não. O caminho pode continuar fortemente acoplado e agora incluir falhas parciais e atrasos de rede. Independência exige contratos e responsabilidades coerentes, não apenas uma contagem maior de processos.",
        e(
          "Escolha a escala do desenho",
          [
            "Desenhe um usuário, o sistema e um pagamento externo.",
            "Depois abra o sistema em navegador, API e banco.",
            "Use a cena para comparar contexto, containers e mensagens.",
            "Explique quais detalhes você deixaria fora ao apresentar cada visão.",
          ],
          "A escolha da escala deve reduzir a dúvida do leitor. Misturar todos os níveis não produz automaticamente uma explicação mais completa.",
        ),
        e(
          "Escreva uma decisão pequena",
          [
            "Escolha manter dois componentes juntos ou separá-los em serviços.",
            "Defina a necessidade que motiva a escolha.",
            "Liste uma alternativa e seus custos.",
            "Registre uma consequência que faria revisar a decisão no futuro.",
          ],
          "Uma decisão revisável explicita compromissos e evidências. O desenho por si só não prova que uma solução atende à carga e às regras.",
        ),
        "Qual contrato precisaria continuar válido se você mudasse a implantação física sem mudar a funcionalidade?",
      ),
      m(
        "Interseção de quóruns é uma propriedade necessária ao raciocínio",
        "Em um conjunto de três nós, dois grupos de dois sempre compartilham pelo menos um elemento. Essa interseção ajuda a entender por que maiorias são úteis. Mas um nó que participa de grupos diferentes ainda precisa obedecer a regras sobre versões e decisões. Sem essas regras, apenas contar respostas não impede histórias conflitantes. Protocolos completos, como Raft, acrescentam termos, eleição e restrições de log. O líder fixo da bancada elimina esses problemas para concentrar a aula na diferença entre envio, recebimento, ACK e confirmação.",
        "Persistência e confirmação precisam de significado",
        "Uma confirmação só é útil se o contrato definir o que ela prova. Receber na memória, registrar duravelmente e aplicar à máquina de estados são marcos diferentes em sistemas reais. A bancada usa ACKs abstratos; não mede persistência em disco. Conte somente confirmações que chegaram e preserve a invariável de não anunciar COMMIT antes da maioria. Um timeout do cliente ainda pode deixá-lo sem saber se o sistema confirmou a operação, mesmo quando a regra interna foi respeitada.",
        "Duas maiorias se cruzam. Isso basta para escrever qualquer protocolo correto de consenso?",
        "Não. A interseção não determina quais valores um participante pode aceitar, em qual ordem e após qual eleição. Ela é uma peça do argumento, não o algoritmo completo. Uma explicação honesta precisa indicar o que foi removido do modelo.",
        e(
          "Conte evidências",
          [
            "Execute com zero, uma e duas réplicas fora.",
            "Conte gravação local e ACKs recebidos em colunas distintas.",
            "Anote quando o destaque indica recebimento e quando a decisão indica COMMIT.",
            "Confira que um envio perdido não aumenta a contagem.",
          ],
          "Com 3, 2 ou 1 nós disponíveis, o modelo termina com 3/3, 2/3 ou ausência de quórum 1/3. Apenas os dois primeiros casos confirmam.",
        ),
        e(
          "Desenhe a interseção",
          [
            "Liste as maiorias possíveis de {A, B, C}.",
            "Marque a interseção de cada par.",
            "Repita o raciocínio para quóruns de três em cinco nós.",
            "Escreva uma regra adicional que um protocolo precisaria definir para não aceitar conflitos.",
          ],
          "A interseção existe, mas participantes precisam de regras de aceitação e histórico. O exercício não transforma a bancada em implementação de Raft.",
        ),
        "Qual informação do contrato de ACK você pediria antes de concluir que uma escrita sobreviverá à perda de energia?",
      ),
      m(
        "Segurança e progresso respondem a perguntas distintas",
        "Segurança descreve o que nunca pode acontecer, como confirmar sem o conjunto exigido de evidências. Progresso descreve sob quais condições a operação consegue terminar. Quando faltam confirmações, um sistema pode preservar sua regra recusando confirmação, mesmo que isso reduza disponibilidade da operação. Em uma partição, participantes podem observar partes diferentes da rede. Não transforme um timeout em prova de que o outro lado morreu. Essa incerteza é central ao desenho de sistemas distribuídos, e o nosso modelo a simplifica com falhas pré-configuradas.",
        "Resultados desconhecidos exigem um contrato para o cliente",
        "O cliente pode perder uma resposta depois que a operação foi confirmada. Repetir pode precisar de identificador, consulta de estado e deduplicação, dependendo da semântica. Também defina o que uma leitura seguinte pode observar: réplica atrasada e líder podem responder com estados distintos se o sistema permitir. A bancada não implementa leituras distribuídas nem eleições; use esses casos para listar garantias necessárias. Testar falhas antes, durante e depois da confirmação produz perguntas mais úteis que apenas desligar um servidor no fim.",
        "O sistema respondeu 503 sem quórum. Isso prova que nenhuma cópia local de x=42 existe?",
        "Não. O líder pode ter recebido e registrado a proposta sem poder confirmá-la. A resposta significa que a condição de confirmação do modelo não foi atingida. Ausência de COMMIT não deve ser descrita como apagamento automático de todo estado intermediário.",
        e(
          "Procure a invariável",
          [
            "Deixe somente o líder disponível.",
            "Acompanhe o valor local x=42 e a contagem 1/3.",
            "Confira a resposta final sem COMMIT.",
            "Explique a diferença entre ter uma proposta local e ter uma decisão confirmada.",
          ],
          "O líder mantém estado intermediário, mas não pode prometer confirmação global. A regra de segurança permanece válida.",
        ),
        e(
          "Mude o ponto da falha no desenho",
          [
            "Desenhe falha antes de qualquer envio.",
            "Desenhe perda durante uma réplica recebendo.",
            "Desenhe a resposta ao cliente se perdendo depois de COMMIT.",
            "Para cada caso, registre o que cliente e líder podem saber e qual repetição seria segura sob um contrato definido.",
          ],
          "Os participantes podem ter conhecimentos diferentes. Uma resposta ausente não define sozinha se o efeito aconteceu; o contrato precisa lidar com incerteza.",
        ),
        "Como você descreveria uma garantia de disponibilidade sem omitir carga, operação, hipóteses de falha e regra de consistência?",
      ),
    ],
    capstone: {
      brief:
        "Escreva uma decisão de arquitetura para um cadastro replicado. Defina o significado de sucesso, as falhas consideradas e como o cliente trata um resultado desconhecido.",
      deliverables: [
        "Diagrama no nível adequado e sequência de uma escrita",
        "Invariável e tabela de confirmações para três cenários",
        "Contrato de repetição e uma limitação explícita do modelo de consenso",
      ],
      rubric:
        "O documento precisa separar recebimento, persistência, aplicação e confirmação. Não atribua eleição, recuperação ou garantia de leitura a uma bancada que não as implementa.",
    },
  },
};
