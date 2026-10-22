# Convenções dos modelos 3D

Todas as peças e superfícies são geometria original criada com Three.js. A cena representa o mesmo estado usado pelas interfaces 2D e pelos testes. Órbita, zoom, separação das peças, inspeção por clique e seletor acessível permitem explorar sem depender exclusivamente de gestos.

## CPU e placa

Encapsulamento com cantos arredondados, pinos metálicos, tampa, matriz de silício esquemática e aletas de dissipação. A unidade de controle fica acima do encapsulamento para permitir a vista explodida. A placa tem trilhas, contatos de borda, capacitores e parafusos. PC, IR e ACC aparecem separados para leitura didática: em processadores reais esses registradores são estruturas internas ao chip, não componentes discretos instalados ao lado dele. O tamanho e as posições das peças não representam escala de fabricação.

Os elementos visuais do acumulador e dos dados da RAM mudam com o estado do motor. Os pinos, dissipadores e parafusos fornecem contexto físico; não integram a lógica da simulação. A representação é uma montagem conceitual, não um projeto de eletrônica fabricável.

## Memória

Cada posição de um byte aparece como um módulo inspecionável com PCB, chips, contatos metálicos e indicadores. Isso torna endereços e ocupação visíveis. Um byte real não corresponde a um pente de RAM: ele é composto por bits armazenados nas células dos chips. A altura distingue visualmente espaço livre, heap e stack; não indica capacidade extra. Indicadores de bits mostram o valor conhecido nos bytes da stack. Heap representa reserva de espaço e não estabelece valores iniciais de memória não inicializada.

## Rede

O cliente tem teclado, trackpad, dobradiças, portas e tela com linhas de terminal. O objeto DNS tem conectores, antenas e LEDs como um equipamento de laboratório. Ele representa o papel lógico de resolvedor; DNS pode executar em diversos tipos de hardware, e não exige um dispositivo físico dedicado ou antenas. O servidor tem baias de disco, puxadores, parafusos, LEDs, grades de ventilação e ventoinha.

O pacote é um marcador conceitual da etapa de comunicação. Cabos não representam uma topologia física ou roteamento reais. A placa funciona como bancada de exposição, não como uma placa-mãe que conecta equipamentos de rede dessa forma. Endereços 192.0.2.0/24 e domínio `.example` são usados para documentação.

## Renderização

Peças repetidas pequenas usam `InstancedMesh` para compartilhar chamadas de desenho. Cenas usam `frameloop="demand"`, sem rotação automática, resolução limitada a 1,5× e geometrias com poucos segmentos. Rótulos são sprites com texturas geradas localmente e liberadas ao desmontar. A cena é carregada de forma assíncrona ao entrar em um laboratório. Os testes cobrem a presença do canvas, inspeção acessível, controles de rotação, navegação entre as nove bancadas e ausência de erros JavaScript em desktop e celular. Isso não substitui profiling de GPU em dispositivos físicos.

## Materiais, temas e movimento

Materiais distinguem máscara de PCB verde, metais, plástico e silício. Mapas procedurais locais representam microrrugosidade e escovação; não usam imagens copiadas. Os temas claro e escuro alteram a interface e o fundo da bancada sem remover as cores do hardware. A preferência inicial segue o sistema e a escolha explícita fica em localStorage.

Fluxos são eventos derivados de transições confirmadas do motor. O marcador mostra a origem, o destino e a mensagem da etapa, com curvas direcionais e narração. Rever o fluxo não executa novamente uma instrução nem envia outro pacote. A duração visual serve à leitura, não representa a escala de nanossegundos da CPU nem o tempo físico de viagem. O handshake usa números de sequência ilustrativos fixos; não implementa uma pilha TCP real. malloc/free mostram gerenciamento de blocos, não transferência do conteúdo. Em movimento reduzido, o marcador aparece no destino sem percorrer a curva.

Nas bancadas clássicas, as sombras são recalculadas quando a disposição ou o estado muda, sem gerar novos mapas a cada frame do pacote. E2E usa um worker para evitar disputa da GPU entre navegadores de teste.

O fluxo visual usa pontos esféricos igualmente espaçados ao longo da curva. O dado aparece como uma esfera com núcleo branco, halo e rastro curto; um anel se expande ao chegar ao destino. Os pontos compartilham uma InstancedMesh e o halo é gerado localmente. A renderização para após a chegada. Pausa, velocidade, replay e movimento reduzido continuam ligados aos mesmos eventos da simulação.

## Seis bancadas adicionais

Lógica usa módulos de entrada, CI e saída com pinos, contatos e trilhas. Processos e fases de compilação usam módulos lógicos na mesma bancada: não são chips físicos independentes em um computador real. Infraestrutura e replicação reutilizam servidores com baias, ventilação e conectores. Páginas de banco aparecem sobre unidades com três pratos, eixo e braço metálico; a representação mostra endereçamento lógico e não corresponde a uma página por disco.

As cenas oferecem órbita, zoom, separação, inspeção, alternativa 2D e readout de todos os valores. As curvas deslocam seus pontos junto com a vista explodida. Os fluxos carregam mensagens calculadas pelos modelos; um receptor ganha contorno e emissão após a chegada, e um destino indisponível nunca recebe esse destaque. O texto do dado usa sprites orientados para a câmera. Etiquetas expandem a altura para mensagens maiores, incluindo tokens do compilador.
