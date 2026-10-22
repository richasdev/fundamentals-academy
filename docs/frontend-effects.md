# Identidade de interface e efeitos

A abertura usa uma linguagem de terminal e laboratório de programação. Space Grotesk atende o texto de leitura, e JetBrains Mono identifica títulos técnicos, comandos, métricas e controles. As fontes são carregadas pelo Google Fonts, com alternativas locais sans-serif e monospace.

## Fogo Doom

`src/simulators/doomFire.ts` implementa um campo numérico com dois buffers de intensidade. Uma fonte injeta calor na última linha. Cada passo lê a linha inferior, aplica resfriamento e deslocamento lateral, e escreve o resultado no próximo buffer. Uma paleta de 37 níveis converte as intensidades em cores. O vento usa bordas horizontais periódicas. O renderer trabalha em 192 × 112 pixels; CSS amplia o resultado sem interpolação.

O motor foi escrito para este projeto, sem copiar imagens, paletas ou código de jogos. Referência conceitual: [Doom Fire Algorithm Playground](https://github.com/filipedeschamps/doom-fire-algorithm). Os testes verificam propagação, extinção, limites da paleta e dimensões inválidas. O gerador aleatório pode ser substituído por uma função fixa para testes determinísticos.

## Matrix

O efeito usa colunas de caracteres gerados em canvas 2D e uma camada escura semitransparente para produzir rastros. Não há vídeo ou assets de filmes. Os modos Fogo Doom e Matrix compartilham a mesma área para limitar o trabalho de renderização e a distração visual.

## Movimento e controles

Os efeitos têm limite de 24 desenhos por segundo. IntersectionObserver suspende o loop fora da tela; a visibilidade do documento também pausa o trabalho. O usuário pode pausar ou retomar, ajustar calor e vento, avançar um quadro quando pausado e abrir a explicação do algoritmo. A preferência `prefers-reduced-motion` inicia o efeito pausado; o usuário pode optar por animá-lo explicitamente.

O cursor usa SVGs locais em data URLs, com alternativas nativas. Ele se aplica apenas a dispositivos com ponteiro preciso. Campos de texto e cenas 3D preservam cursores específicos de edição e órbita. Não há elemento seguindo o mouse, eventos globais de movimento ou sobreposição que intercepte cliques.

## Prévia

O watcher do Vite ignora metadados de compilação, testes e documentação para evitar recarregar uma simulação durante a execução de build ou verificações. O código da aplicação continua usando HMR normalmente.
