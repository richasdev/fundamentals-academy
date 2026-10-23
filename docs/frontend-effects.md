# Interface de estudo e movimento

A interface começa diretamente nas trilhas e bancadas. Space Grotesk atende a leitura, JetBrains Mono identifica comandos e controles. Os displays decorativos Doom e Matrix foram removidos, incluindo seus motores e estilos. Os temas claro e escuro e o cursor para ponteiro preciso permanecem.

## Explicação sincronizada

`lessonScenes.ts` fornece 81 snapshots: três por aula, em 27 aulas. Cada estado vincula a explicação ao remetente, destino, payload e valores dos componentes. Bancadas existentes fornecem resultados quando aplicável; exemplos conceituais, como paginação e transações, usam cenas lógicas delimitadas no conteúdo.

`SynchronizedLesson.tsx` mantém pausa, replay e confirmação visual separados do índice de conteúdo. Trocar de passo inicia seu fluxo; repetir não avança nem altera a aula. O receptor recebe contorno e emissão verdes somente no callback de chegada. O remetente tem contorno azul. Mensagens perdidas terminam no caminho e não destacam um receptor. `DataFlow.tsx` mostra trajeto pontilhado, bolinha luminosa, rastro e conteúdo junto à bolinha. A preferência por movimento reduzido mostra o resultado diretamente.

Órbita, zoom, inspeção e vista explodida continuam disponíveis. Um diagrama e valores no DOM oferecem alternativa ao WebGL. Os modelos são representações didáticas, não reproduções de escala ou fabricação: funções lógicas separadas na cena podem estar integradas em um chip real.

## Sessões de estudo

`studySessions.ts` acrescenta 54 seções de aprofundamento, 27 problemas analisados, 54 investigações com protocolo e resultado esperado, reflexões e nove sínteses com critérios de revisão. O caderno persiste previsões, observações, explicações e investigações por aula no localStorage, sem conceder conclusão automática da trilha.

`sessionDuration.ts` estima leitura a 170–220 palavras/minuto e soma 21–27 minutos de investigação, 3–6 de reflexão e 5–7 de síntese por trilha. As novas explicações de mecanismos também entram na contagem, e a interface recalcula o intervalo por trilha. A duração é uma estimativa de leitura e prática, não um timer ou bloqueio. A contagem inclui resoluções e aprofundamentos expansíveis; o aluno pode escolher outro ritmo.

Explicações originais são acompanhadas por referências primárias, entre elas [Nand2Tetris](https://www.nand2tetris.org/course), [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/), [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) e [transações no PostgreSQL](https://www.postgresql.org/docs/current/tutorial-transactions.html). A cena de COMMIT apresenta estado lógico: não implica que todas as páginas sejam escritas no instante da confirmação.

## Controle manual e causalidade

Cada um dos 81 passos tem uma explicação de mecanismo e uma evidência a procurar, ligadas ao conteúdo da etapa. A comparação mostra estados do recorte; um traço indica que o estado ainda não foi apresentado, e não um valor físico inicial inventado.

O slider de percurso controla posição visual, inclusive quando movimento reduzido está ativo, pois é manipulação explícita. Chegar ao fim confirma a entrega somente quando existe receptor. Voltar retira a confirmação visual e restaura o valor anterior no modelo. A animação automática continua disponível. Setas no trajeto, pontos, rastro e anel de chegada mostram direção e resolução.

A interface de inspeção descreve função lógica e anatomia física separadamente. As referências primárias adicionais incluem [TCP RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html), [WAL no PostgreSQL](https://www.postgresql.org/docs/current/wal-intro.html) e [containers no C4](https://c4model.com/diagrams/container).
