import type { LabId } from "./lessons";
import type { WorkshopNode } from "../simulators/workshops";
const roles: Record<LabId, Record<string, string>> = {
  logic: {
    bits: "O padrão de entrada preserva quatro escolhas binárias. Os pesos são uma regra de interpretação, não conteúdo extra armazenado em cada bit.",
    weights:
      "Atribui os pesos 8, 4, 2 e 1 às posições e seleciona os que têm bit 1.",
    sum: "Combina as parcelas selecionadas. A soma representa o valor sem sinal do padrão neste exemplo.",
    inputs:
      "Duas entradas independentes alimentam as funções combinacionais. Nenhuma delas é uma saída calculada.",
    and: "AND retorna 1 somente quando ambas as entradas valem 1. No meio somador, essa condição gera carry.",
    not: "NOT inverte um bit: 1 vira 0 e 0 vira 1. Depois de AND, implementa a negação usada por NAND.",
    xor: "XOR retorna 1 para entradas diferentes. No meio somador calcula o bit de soma, sem o carry.",
    out: "Destino da saída calculada. O resultado depende da função escolhida e da interpretação indicada na aula.",
  },
  cpu: {
    pc: "Registrador que guarda o endereço da próxima instrução. Seu valor identifica uma posição, não o conteúdo guardado ali.",
    rom: "Memória de instruções do exemplo. O PC escolhe uma posição e a instrução lida segue para o IR.",
    ir: "Registrador de instrução. Mantém a operação e seu operando de endereço disponíveis enquanto o controle organiza a execução.",
    ram: "Memória de dados. LOAD lê um byte e STORE escreve o conteúdo do acumulador no endereço indicado.",
    acc: "Acumulador de oito bits da máquina didática. Recebe LOAD e os resultados aritméticos; STORE copia seu byte para a RAM.",
    alu: "Unidade aritmética e lógica. Neste recorte soma operandos antes de reduzir o resultado à largura do ACC.",
    control:
      "Interpreta a instrução no IR e organiza leitura, operação e escrita. Faz parte da CPU, apesar da separação no modelo.",
    wide: "Resultado aritmético mais largo, exposto para comparar a soma matemática com o byte que será armazenado.",
  },
  memory: {
    program:
      "Representa a operação solicitada pelo programa ou a decisão do alocador, conforme a aula. Não é um chip separado dentro de um alocador real.",
    s31: "Posição 31, ou 0x1F, da memória didática. Recebe o primeiro PUSH e volta a ser o topo depois de remover o item seguinte.",
    s30: "Posição 30, ou 0x1E. Recebe o segundo PUSH e fornece o primeiro POP pela regra LIFO.",
    a: "Primeiro intervalo reservado do heap. Seu endereço inicial e seu tamanho precisam ser tratados separadamente.",
    b: "Segundo intervalo do heap. Depois de liberado, seu início pode ser usado por uma nova reserva com outra duração.",
    virtual:
      "Endereço na visão do processo. É separado em página e deslocamento antes de procurar o mapeamento físico.",
    mmu: "Unidade que traduz endereços e participa da verificação de proteção. O deslocamento é preservado ao trocar página por frame.",
    table:
      "Metadados que associam página virtual e frame físico, além de validade e permissões em sistemas reais.",
    physical:
      "Destino do acesso após tradução. No exemplo, o frame 7 começa no endereço 112 e o offset 3 produz 115.",
  },
  os: {
    p: "Estado do processo P1: reúne trabalho restante e condição de execução. Um processo é uma entidade do sistema operacional, não uma placa física.",
    queue:
      "Fila dos processos prontos para usar CPU. Um processo bloqueado por E/S aguarda um evento e não disputa imediatamente o núcleo.",
    cpu: "Núcleo único do modelo. Executa um processo por turno e preserva contexto ao trocar de tarefa.",
    p1: "P1 começa com três unidades de trabalho útil. O restante diminui quando ele recebe CPU.",
    p2: "P2 começa com duas unidades de trabalho útil e aguarda sua vez na fila inicial.",
    p3: "P3 precisa de uma única unidade e termina em seu primeiro turno quando quantum=1.",
    app: "Programa solicitante. Deve conferir o retorno da syscall e usar somente os bytes efetivamente recebidos.",
    kernel:
      "Valida a solicitação e realiza o serviço dentro das regras de proteção do sistema.",
    buffer:
      "Região de memória que recebe os bytes da leitura. Conteúdo e quantidade válida devem ser observados juntos.",
    device:
      "Recurso acessado pela leitura. A quantidade disponível pode ser menor que o máximo pedido pelo programa.",
  },
  network: {
    client:
      "Inicia a resolução do nome e a conexão. Cada direção TCP possui seu próprio espaço de sequência.",
    dns: "Resolvedor DNS que fornece o endereço de documentação 192.0.2.10. Ele resolve nome e endereço; não fornece a página HTTP.",
    server:
      "Destino da conexão e do pedido HTTP. Responde ao handshake e processa a requisição antes de devolver a resposta.",
  },
  database: {
    query:
      "Representa o predicado de igualdade e recebe o resultado. Uma chave ausente deve produzir zero linhas, sem escolher uma vizinha.",
    root: "Raiz do índice estático, com separadores 8 e 16. Escolhe uma página candidata pelo intervalo da chave.",
    a: "Página lógica A com chaves 2, 4 e 6. O disco desenhado é um suporte visual, não um disco exclusivo para cada página.",
    b: "Página lógica B com chaves 8, 10 e 12. A busca deve conferir igualdade mesmo depois de escolher a página.",
    c: "Página lógica C com chaves 16, 18 e 20. A varredura chega até ela depois de visitar A e B.",
    sql: "Aplicação que delimita a operação de negócio e precisa tratar erros da transação.",
    txn: "Estado da transação: agrupa débito e crédito pendentes antes da confirmação. Não é um equipamento físico separado.",
    wal: "Log de recuperação. O esquema distingue registrar mudanças, confirmar a transação e escrever páginas de dados.",
    accounts:
      "Saldos confirmados no recorte lógico. A transferência de 10 precisa preservar a soma 150 entre as duas contas.",
  },
  compiler: {
    source:
      "Caracteres da expressão de entrada. A linguagem desta VM aceita inteiros, +, * e parênteses com limites explícitos.",
    lexer:
      "Agrupa caracteres em tokens e preserva seus limites. Reconhecer tokens não basta para validar a expressão inteira.",
    tokens:
      "Sequência de números e símbolos reconhecidos. O parser usa essa sequência para decidir a estrutura.",
    parser:
      "Aplica a gramática, rejeita estrutura inválida e constrói a AST com precedência.",
    numbers:
      "Operandos disponíveis antes de organizar as relações da árvore. A ordem textual sozinha não define todos os agrupamentos.",
    mul: "Subárvore de multiplicação. Seus dois filhos precisam produzir valores antes de executar MUL.",
    add: "Raiz de soma. Combina o operando 2 com o resultado da subárvore MUL(3,4).",
    vm: "Alvo da compilação. No bytecode de pilha, operações consomem operandos e empilham o resultado; não há execução com eval.",
  },
  infra: {
    client:
      "Solicita o mesmo recurso público duas vezes. Não escolhe uma instância interna da aplicação.",
    edge: "Borda que combina cache e balanceamento no modelo. Pode encaminhar um MISS ou responder diretamente a um HIT.",
    a: "Instância A da aplicação. Quando indisponível, é retirada da escolha de destino antes de enviar os GETs.",
    b: "Instância B. Recebe a carga remanescente quando A está fora; o modelo não mede sua capacidade sob carga real.",
  },
  architecture: {
    user: "Ator externo que usa o sistema. A visão de contexto começa pela relação entre pessoas, sistema e serviços externos.",
    api: "Interface de entrada. Na bancada de replicação, só anuncia sucesso depois de o líder atingir a maioria exigida.",
    db: "Armazenamento visto como container no C4. Container aqui não implica um contêiner Docker.",
    leader:
      "Líder fixo do modelo. Registra localmente a proposta e conta ACKs recebidos antes de decidir a confirmação.",
    replica:
      "Cópia seguidora que recebe uma proposta. Receber o valor e devolver um ACK são etapas distintas.",
    r1: "Primeira réplica seguidora. Quando está indisponível, a mensagem é interrompida e não produz ACK.",
    r2: "Segunda réplica seguidora. Seu ACK pode completar 2/3 quando a primeira réplica está fora.",
  },
};
export function componentRole(id: LabId, node: WorkshopNode): string {
  return roles[id][node.id] || node.detail;
}
