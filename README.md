# Fundamentals — Computer Science Interactive Academy

Aplicação React + TypeScript + Vite, sem backend ou autenticação. Conteúdo original em português, com três laboratórios funcionais. As outras seis trilhas são explicitamente apresentadas como planejadas.

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
- `src/components/Simulator.tsx`: controle reutilizável de execução (play, pause, passo, histórico, velocidade, reinício) e interfaces dos três laboratórios. Memória usa operações manuais reversíveis em vez de autoplay.
- `src/components/Hardware3D.tsx`: cena espacial sob demanda com React Three Fiber, Drei, renderização por demanda e limite de resolução. As três bancadas abrem em 3D, com órbita, zoom, separação das peças e inspeção por clique ou seletor acessível. Diagramas e mapas 2D são alternativas para acessibilidade e dispositivos sem WebGL.
- `src/store.ts`: progresso com Zustand persistido em localStorage, exportação/importação JSON com validação de versão e identificadores.
- `e2e`: fluxos de navegação e interação em desktop e celular.

## Contratos dos modelos

`Model<S>` define `initial`, `step` e `done`. Cada chamada a `step` retorna o próximo estado sem modificar o anterior; estados terminais são estáveis. O controlador guarda snapshots e permite voltar sem recalcular animações. CPU: três microetapas por instrução, acumulador de oito bits, soma módulo 256, LOAD/ADD/STORE/HALT. Memória: 32 bytes, first-fit, PUSH/POP de um byte, alocações contíguas e liberação do último bloco. Rede: DNS simplificado, handshake TCP, GET e resposta, processamento de 20 ms, latência por trecho e uma perda opcional com timeout didático de 1.000 ms.

Animação de transição usa Anime.js e é desativada por `prefers-reduced-motion`. A simulação continua sob controle do usuário. Sem Web Worker nesta etapa: as transições são pequenas e limitadas; adicionar um worker quando existir carga computacional que o justifique. Cenas 3D são carregadas apenas ao solicitar a visualização. A interface usa tokens CSS próprios e Tailwind via Vite.

## Conteúdo e escopo

Os modelos não emulam uma CPU comercial, um alocador de produção ou uma pilha de rede completa. As limitações ficam disponíveis dentro de cada aula. Fontes não foram republicadas: apenas links, conceitos e explicações originais. Revisão inicial em 22/10/2026. O progresso é pessoal ao navegador; a exportação serve como cópia portátil. Qualquer laboratório pode ser acessado diretamente por `/#cpu`, `/#memory` e `/#network`.

## Modelos 3D

Geometrias detalhadas incluem pinos, trilhas de PCB, contatos, chips, indicadores, teclado, portas, baias de disco e ventilação. Veja [as convenções e limitações dos modelos](docs/models-3d.md).

Site público: https://fundamentals-lab-academy.uemurinha.chatgpt.site

Repositório: https://github.com/richasdev/fundamentals-academy

## Publicação estática

`npm run build` gera `dist/`, que pode ser servido por qualquer host estático público, sem login ou serviço de aplicação. A identidade de hospedagem Sites está em `.openai/hosting.json`.
