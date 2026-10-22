# Fundamentals — Computer Science Interactive Academy

Aplicação React + TypeScript + Vite, sem backend ou autenticação. Conteúdo original em português, com nove trilhas abertas, 27 aulas, nove laboratórios funcionais e nove desafios com progresso persistido.

## Executar

```sh
npm install
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Estrutura

- `src/content/lessons.ts`: textos, exercícios, fontes, suposições e limitações.
- `src/simulators/engines.ts`: modelos tipados e transições puras, sem dependência do React.
- `src/components/Simulator.tsx`: controle reutilizável de execução (play, pause, passo, histórico, velocidade, reinício) e interfaces dos laboratórios clássicos. Memória usa operações manuais reversíveis em vez de autoplay.
- `src/components/Hardware3D.tsx`: cena espacial sob demanda com React Three Fiber, Drei, renderização por demanda e limite de resolução. As bancadas abrem em 3D, com órbita, zoom, separação das peças e inspeção por clique ou seletor acessível. Diagramas e mapas 2D são alternativas para acessibilidade e dispositivos sem WebGL.
- `src/store.ts`: progresso com Zustand persistido em localStorage, exportação/importação JSON com validação de versão e identificadores.
- `e2e`: fluxos de navegação e interação em desktop e celular.

## Contratos dos modelos

`Model<S>` define `initial`, `step` e `done`. Cada chamada a `step` retorna o próximo estado sem modificar o anterior; estados terminais são estáveis. O controlador guarda snapshots e permite voltar sem recalcular animações. CPU: três microetapas por instrução, acumulador de oito bits, soma módulo 256, LOAD/ADD/STORE/HALT. Memória: 32 bytes, first-fit, PUSH/POP de um byte, alocações contíguas e liberação do último bloco. Rede: DNS simplificado, handshake TCP, GET e resposta, processamento de 20 ms, latência por trecho e uma perda opcional com timeout didático de 1.000 ms.

Animação de transição usa Anime.js e é desativada por `prefers-reduced-motion`. A simulação continua sob controle do usuário. Sem Web Worker nesta etapa: as transições são pequenas e limitadas; adicionar um worker quando existir carga computacional que o justifique. Cenas 3D são carregadas apenas ao solicitar a visualização. A interface usa tokens CSS próprios e Tailwind via Vite.

## Conteúdo e escopo

Os modelos não emulam uma CPU comercial, um alocador de produção ou uma pilha de rede completa. As limitações ficam disponíveis dentro de cada aula. Fontes não foram republicadas: apenas links, conceitos e explicações originais. Revisão inicial em 22/10/2026. O progresso é pessoal ao navegador; a exportação serve como cópia portátil. Rotas diretas: `/#logic`, `/#cpu`, `/#memory`, `/#os`, `/#network`, `/#infra`, `/#database`, `/#compiler` e `/#architecture`. Cada trilha oferece três aulas, um experimento parametrizável, fontes e limitações, desafio e navegação para a próxima trilha. Exportações antigas de progresso continuam válidas, agora com nove identificadores aceitos.

## Modelos 3D

Geometrias detalhadas incluem pinos, trilhas de PCB, contatos, chips, indicadores, teclado, portas, baias de disco e ventilação. Veja [as convenções e limitações dos modelos](docs/models-3d.md).

Site público: https://fundamentals-lab-academy.uemurinha.chatgpt.site

Repositório: https://github.com/richasdev/fundamentals-academy

## Publicação estática

`npm run build` gera `dist/`, que pode ser servido por qualquer host estático público, sem login ou serviço de aplicação. A identidade de hospedagem Sites está em `.openai/hosting.json`.

## Bancadas adicionais

- Lógica: NAND, AND, OR e XOR com entradas binárias e tabela-verdade.
- SO: round-robin para três processos, quantum 1–3, fila e trabalho restante.
- Infra: duas requisições, cache vazio/HIT e round-robin entre instâncias saudáveis.
- Banco: busca em índice ordenado de dois níveis ou varredura, com páginas contadas e chaves ausentes.
- Compilador: lexer, parser recursivo, AST, bytecode e VM real para inteiros, +, * e parênteses. Sem eval; erros de sintaxe e overflow são rejeitados.
- Arquitetura: escrita com líder fixo e maioria de três, mensagens perdidas, ACKs e confirmação condicionada ao quórum. Não é uma implementação de Raft.

`src/simulators/workshops.ts` contém os modelos puros. `WorkshopLab.tsx` controla snapshots, autoplay, pausa, velocidade, retorno e replay. `Workshop3D.tsx` reaproveita componentes detalhados, órbita, inspeção e fluxos com payload. Diagramas 2D e readouts DOM oferecem alternativa ao WebGL.

## Progressão e aulas detalhadas

A ordem recomendada é fundamental (lógica, CPU, memória), intermediário (SO, redes, bancos) e avançado (compiladores, infraestrutura, arquitetura). Identificadores de progresso e rotas permanecem estáveis. O mapa, o seletor de laboratórios e a próxima trilha usam essa ordem; nenhum nível bloqueia acesso.

`src/content/curriculum.ts` define níveis, objetivos, pré-requisitos e critérios de avanço. `src/content/chapterDetails.ts` acrescenta às 27 aulas um objetivo, aprofundamento, exemplo de código, sequência de estados, erro comum, exercício com resolução e guia de observação. Exemplos teóricos não executados na bancada são identificados no conteúdo. `DetailedChapter.tsx` mantém os exemplos legíveis em desktop e celular; tabelas têm rolagem própria e resoluções ficam recolhidas até serem abertas. As referências de banco incluem isolamento e WAL do PostgreSQL.

## Didática guiada

As 27 aulas têm um guia adicional em linguagem simples: analogia cotidiana, ligação com o mecanismo real, limites da comparação, utilidade prática e três passos navegáveis. Cada aula também oferece uma checagem de duas alternativas, com explicação específica para cada escolha, e dois termos expansíveis. São 81 passos, 27 checagens e 54 definições locais. As checagens servem à prática e não registram conclusão; o desafio final continua sendo o critério de progresso.

`src/content/teachingGuides.ts` contém o conteúdo original. `GuidedExplanation.tsx` controla passo e resposta apenas na aula atual, reiniciando ambos ao trocar de aula. A explicação técnica permanece acessível em uma seção expansível; exemplos, tabelas de estado, exercícios e observações da bancada foram preservados. Sem timer de leitura.

## Cenas ligadas à explicação e sessões de estudo

Cada um dos 81 passos seleciona uma cena 3D correspondente, com remetente, conteúdo em trânsito e destaque do receptor após a chegada. Há pausa, replay, inspeção e alternativa em diagrama. `lessonScenes.ts` usa os motores das bancadas quando aplicável e cenas lógicas para mecanismos adicionais. As limitações continuam explícitas.

As nove trilhas oferecem sessões estimadas de 42–58 minutos de leitura e laboratório, com seis investigações, anotações por aula e síntese por trilha. `studySessions.ts` reúne o aprofundamento e os protocolos; `sessionDuration.ts` calcula o tempo de leitura e soma prática e reflexão. O caderno usa armazenamento local e não conclui automaticamente a trilha. Veja [interface e movimento](docs/frontend-effects.md).
