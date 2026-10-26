import { RoundedBox } from "@react-three/drei";
import { Label } from "./Hardware3D";
import type { WorkshopNode } from "../simulators/workshops";
export default function ConceptModel({
  node,
  value,
  selected,
  receiving,
  onSelect,
  explode = 0,
}: {
  node: WorkshopNode;
  value: string;
  selected: boolean;
  receiving: boolean;
  onSelect: () => void;
  explode?: number;
}) {
  const color = receiving
    ? "#68c79e"
    : selected
      ? "#e1b859"
      : node.visual === "page"
        ? "#86a6bf"
        : node.visual === "ast"
          ? "#a494c7"
          : "#739e92";
  const entries =
    node.visual === "page"
      ? node.entries || []
      : node.visual === "stack"
        ? value
            .match(/\[([^\]]*)\]/)?.[1]
            .split(",")
            .filter((v) => v.trim()) || []
        : node.visual === "queue"
          ? value.split(",").filter((v) => v.trim() && v !== "vazia")
          : [];
  const unknown = node.visual === "ast" && value === "aguarda parser";
  return (
    <group
      position={node.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {node.visual === "ast" ? (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.32, 20, 16]} />
          <meshStandardMaterial
            color={unknown ? "#56616c" : color}
            emissive={color}
            emissiveIntensity={receiving ? 0.3 : 0}
          />
        </mesh>
      ) : (
        <RoundedBox
          position={[0, 0.1, 0]}
          args={[1.65, 0.2, 1.15]}
          radius={0.08}
        >
          <meshStandardMaterial
            color={color}
            roughness={0.65}
            metalness={0.1}
          />
        </RoundedBox>
      )}
      {node.visual === "page" && (
        <group>
          {entries.map((entry, i) => (
            <group key={i} position={[0, 0.25 + i * (0.16 + explode * 0.4), 0]}>
              <RoundedBox args={[1.4, 0.12, 0.85]} radius={0.03}>
                <meshStandardMaterial
                  color={
                    value.includes(`id=${entry} encontrado`)
                      ? "#f0ca69"
                      : "#d5e3e9"
                  }
                />
              </RoundedBox>
              <Label label={`id ${entry}`} selected={false} height={0} />
            </group>
          ))}
        </group>
      )}
      {(node.visual === "stack" || node.visual === "queue") &&
        entries.map((entry, i) => (
          <group
            key={i}
            position={
              node.visual === "stack"
                ? [0, 0.3 + i * (0.24 + explode * 0.25), 0]
                : [(i - (entries.length - 1) / 2) * 0.48, 0.34, 0]
            }
          >
            <RoundedBox
              args={
                node.visual === "stack" ? [1.2, 0.2, 0.7] : [0.42, 0.35, 0.7]
              }
              radius={0.03}
            >
              <meshStandardMaterial
                color={i === entries.length - 1 ? "#c5ac76" : "#c3d4cc"}
              />
            </RoundedBox>
            <Label label={entry.trim()} selected={false} height={0.1} />
          </group>
        ))}
      {node.visual === "process" &&
        Array.from(
          { length: Number(value.match(/^(\d+)/)?.[1] || 0) },
          (_, i) => (
            <mesh key={i} position={[-0.4 + i * 0.4, 0.3, 0]}>
              <boxGeometry args={[0.3, 0.2, 0.65]} />
              <meshStandardMaterial color="#d5e6e0" />
            </mesh>
          ),
        )}
      <Label
        label={unknown ? "?" : node.label}
        sub={node.visual === "ast" ? undefined : value.slice(0, 35)}
        selected={selected || receiving}
        height={
          node.visual === "stack"
            ? Math.max(0.5, entries.length * 0.5)
            : node.visual === "page"
              ? 1.5
              : 0.5
        }
      />
      {(selected || receiving) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.85, 0.9, 32]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

export function conceptAnatomy(node: WorkshopNode) {
  const parts: Record<string, [string, string][]> = {
    page: [
      [
        "Cabeçalho da página",
        "Identifica um bloco lógico de armazenamento, independente da quantidade de discos.",
      ],
      [
        "Registros",
        "Cada linha contém uma chave. A busca verifica igualdade, não só a faixa.",
      ],
      [
        "Caminho de acesso",
        "A raiz escolhe uma página; uma varredura visita páginas em sequência.",
      ],
    ],
    ast: [
      [
        "Operação ou literal",
        "Folhas guardam números; nós internos representam + ou *.",
      ],
      [
        "Filhos",
        "As ligações mostram os operandos. A posição na árvore expressa precedência.",
      ],
      [
        "Pós-ordem",
        "Filhos são compilados antes do operador; o bytecode preserva essa dependência.",
      ],
    ],
    stack: [
      ["Base", "O primeiro valor fica abaixo dos próximos."],
      [
        "Topo",
        "PUSH acrescenta no topo; ADD/MUL retiram dois e colocam o resultado.",
      ],
      [
        "Estado da VM",
        "Cada instrução altera esta mesma pilha, sem criar uma nova máquina.",
      ],
    ],
    queue: [
      ["Fila", "Os marcadores representam processos, não chips físicos."],
      ["Ordem", "O primeiro pronto é escolhido para executar."],
      [
        "Espera",
        "Uma tarefa bloqueada espera o evento antes de voltar aos prontos.",
      ],
    ],
    process: [
      ["Identidade", "P1, P2 e P3 são programas em execução."],
      [
        "Trabalho restante",
        "Os blocos mostram unidades de CPU ainda necessárias.",
      ],
      [
        "Estado",
        "Pronto, executando, bloqueado e concluído têm papéis diferentes.",
      ],
    ],
    terminal: [
      ["Entrada", "Representa uma solicitação ou fase lógica."],
      ["Conteúdo", "O valor exibido acompanha o estado confirmado da etapa."],
      [
        "Conexões",
        "As ligações são derivadas das transferências do experimento.",
      ],
    ],
  };
  if (!node.visual) return null;
  return {
    name:
      node.visual === "page"
        ? "Página lógica de dados"
        : node.visual === "ast"
          ? "Árvore sintática"
          : node.visual === "stack"
            ? "Pilha da máquina virtual"
            : node.label,
    parts: parts[node.visual],
    note: "Estrutura lógica representada em 3D para inspeção. Não corresponde a um componente eletrônico dedicado.",
  };
}
