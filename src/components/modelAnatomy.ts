import type { PartKind } from "./ModelDetails";
import type { WorkshopNode } from "../simulators/workshops";
export function nodeModel(node: WorkshopNode): PartKind {
  if (node.id === "client" || node.id === "user") return "laptop";
  if (node.kind === "storage") return "drive";
  if (/RAM|ROM|FRAME|BUFFER|TABELA|BLOCO/.test(node.label)) return "ram";
  return node.kind;
}
export const modelAnatomy: Record<
  PartKind,
  { name: string; parts: [string, string][]; note: string }
> = {
  cpu: {
    name: "Processador em camadas",
    parts: [
      [
        "Dissipador e tampa",
        "Aletas e superfície metálica conduzem calor; não calculam instruções.",
      ],
      [
        "Die e regiões funcionais",
        "O silício integra circuitos. As regiões coloridas do corte são esquemáticas, sem reproduzir um chip comercial.",
      ],
      [
        "Encapsulamento e contatos",
        "A base conecta sinais e alimentação à placa. O ponto de orientação identifica um canto do componente.",
      ],
    ],
    note: "Abra as camadas para separar refrigeração, silício e contatos. ALU e controle são funções internas representadas separadamente nas aulas.",
  },
  control: {
    name: "Circuito de controle",
    parts: [
      ["Encapsulamento", "Protege o circuito e posiciona as conexões."],
      [
        "Pinos e trilhas",
        "Conduzem sinais e alimentação até outros circuitos.",
      ],
      [
        "Componentes de apoio",
        "Pequenos componentes e soldas representam a montagem eletrônica.",
      ],
    ],
    note: "Quando a peça representa software, ela é um suporte visual para uma função lógica, não um chip físico dedicado.",
  },
  register: {
    name: "Banco de bits didático",
    parts: [
      ["Células representadas", "Os chips expõem a ideia de armazenar estado."],
      [
        "Oito indicadores",
        "Para um byte numérico, mostram bits de maior para menor peso, da esquerda para a direita.",
      ],
      ["Contatos", "Representam caminhos de leitura e escrita."],
    ],
    note: "Registradores reais ficam integrados ao processador. Os indicadores luminosos são uma ajuda de leitura, não LEDs reais dentro de cada registrador.",
  },
  byte: {
    name: "Célula de memória didática",
    parts: [
      ["Armazenamento", "Mantém o padrão de bits do byte."],
      ["Indicadores binários", "Acesos representam bits 1; apagados, bits 0."],
      ["Conexões", "Separam localização física e conteúdo armazenado."],
    ],
    note: "A célula foi ampliada para inspeção. O desenho não representa escala física nem a implementação de cada bit.",
  },
  ram: {
    name: "Placa de memória",
    parts: [
      [
        "Chips de memória",
        "Armazenam dados; a quantidade desenhada é ilustrativa.",
      ],
      [
        "Trilhas e terminais",
        "Interligam chips, sinais de controle e contatos da placa.",
      ],
      [
        "Contatos dourados",
        "Fazem a conexão elétrica; não são o conteúdo dos dados.",
      ],
    ],
    note: "Abra a camada de chips para ver sua ligação à placa. Uma tabela, página ou buffer pode ser uma estrutura lógica armazenada em memória.",
  },
  drive: {
    name: "Disco rígido em corte",
    parts: [
      [
        "Pratos e eixo",
        "Superfícies circulares giram em torno do spindle; as marcas tornam o giro visível.",
      ],
      [
        "Braço e cabeça",
        "O conjunto posiciona a cabeça sobre regiões dos pratos. O movimento é ampliado para estudo.",
      ],
      [
        "Carcaça e conector",
        "A base sustenta o conjunto; contatos levam alimentação e sinais.",
      ],
    ],
    note: "O corte de HDD ilustra uma forma de armazenamento. Uma página lógica não ocupa um disco exclusivo e o banco também pode usar SSDs, sem partes móveis.",
  },
  server: {
    name: "Servidor com módulos e refrigeração",
    parts: [
      [
        "Baias frontais",
        "Representam módulos removíveis com puxadores, indicadores e ventilação.",
      ],
      [
        "Portas de rede",
        "Conectores e contatos permitem distinguir uma interface de rede de uma baia de disco.",
      ],
      [
        "Ventoinha e chassis",
        "A ventoinha move ar; as grades e o chassis organizam refrigeração e montagem.",
      ],
    ],
    note: "Abra o painel para observar bandejas internas. O giro indica atividade didática, sem medir carga, temperatura ou velocidade de uma máquina real.",
  },
  laptop: {
    name: "Estação cliente",
    parts: [
      [
        "Tela",
        "Exibe a visão do usuário; não substitui a aplicação ou o protocolo.",
      ],
      ["Teclado e touchpad", "Representam dispositivos de entrada."],
      [
        "Portas e dobradiças",
        "Detalhes físicos separam a base da tela e indicam conexões.",
      ],
    ],
    note: "O cliente é uma função na comunicação. Pode ser executado em outros dispositivos além de um notebook.",
  },
  dns: {
    name: "Equipamento de rede ilustrativo",
    parts: [
      ["Conectores", "Representam interfaces para interligar equipamentos."],
      ["Indicadores", "Mostram atividade de forma didática."],
      [
        "Ventilação e antenas",
        "São detalhes físicos deste modelo de equipamento.",
      ],
    ],
    note: "DNS é um serviço de resolução, não um tipo obrigatório de roteador ou aparelho com antenas.",
  },
  screen: {
    name: "Tela e moldura",
    parts: [
      ["Painel", "Superfície que representa a saída visual."],
      ["Moldura", "Suporte físico do painel."],
      ["Indicador e câmera", "Detalhes de orientação do equipamento."],
    ],
    note: "O conteúdo é ilustrativo; o protocolo funciona independentemente deste formato de tela.",
  },
  packet: {
    name: "Marcador de mensagem",
    parts: [
      ["Símbolo", "Identifica uma transferência lógica."],
      ["Conteúdo", "É exibido junto da bolinha no percurso."],
      ["Direção", "A ponta no caminho indica origem e destino."],
    ],
    note: "Pacotes e dados não são pequenos objetos sólidos: a animação representa uma transferência.",
  },
};
