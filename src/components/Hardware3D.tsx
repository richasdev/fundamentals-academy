import { createPortal } from "react-dom";
import { ExploreReadout } from "./ExploreStage";
import LessonCamera, { type OrbitHandle } from "./LessonCamera";
import { hardwareCameraShot } from "../simulators/cameraFraming";
import type { FlowEvent } from "../simulators/flows";
import {
  Component,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Line,
  RoundedBox,
  Environment,
  Lightformer,
  Edges,
} from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import type {
  CpuState,
  MemoryState,
  NetworkState,
} from "../simulators/engines";
import { cpuFlow, memoryFlow, networkFlow } from "../simulators/flows";
import { program } from "../simulators/engines";
import { useAppearance } from "../theme";
import DataFlow from "./DataFlow";
import PhysicalSurface from "./PhysicalSurface";
import ModelDetails, { BoardDetails, type PartKind } from "./ModelDetails";
import { modelAnatomy } from "./modelAnatomy";
import AnatomyMarkers from "./AnatomyMarkers";
const LayerContext = createContext(0);
type Props = (
  | { kind: "cpu"; state: CpuState }
  | { kind: "memory"; state: MemoryState }
  | { kind: "network"; state: NetworkState }
) & {
  speed?: number;
  paused?: boolean;
  previousState?: CpuState | MemoryState | NetworkState;
  onArrival?: () => void;
  onTransfer?: () => void;
};
type Vec = [number, number, number];
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="scene-error">
        WebGL indisponível. Use a visualização 2D para continuar explorando.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function Label({
  label,
  sub,
  selected,
  height,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  height: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = sub ? 130 : 80;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#222222f0";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = selected ? "#d7d7d7" : "#979797";
    c.lineWidth = 3;
    c.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    c.fillStyle = "#e7e7e7";
    c.textAlign = "center";
    c.font = "500 32px monospace";
    c.fillText(label, 160, sub ? 48 : 51);
    if (sub) {
      c.fillStyle = "#c3c3c3";
      c.font = "27px monospace";
      c.fillText(sub, 160, 95);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [label, sub, selected]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite
      position={[0, height / 2 + 0.26, 0]}
      scale={[0.82, sub ? 0.34 : 0.21, 1]}
    >
      <spriteMaterial map={texture} depthTest={false} transparent />
    </sprite>
  );
}
export function Part({
  position,
  size,
  color,
  label,
  sub,
  onSelect,
  selected = false,
  receiving = false,
  focused = false,
  modelKind,
  explode: explicitExplode,
  active = false,
  paused = false,
}: {
  position: Vec;
  size: Vec;
  color: string;
  label: string;
  sub?: string;
  onSelect: () => void;
  selected?: boolean;
  receiving?: boolean;
  focused?: boolean;
  modelKind?: PartKind;
  explode?: number;
  active?: boolean;
  paused?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const inheritedLayers = useContext(LayerContext);
  const explode = explicitExplode ?? inheritedLayers;
  const kind: PartKind =
    modelKind ??
    (label === "CPU"
      ? "cpu"
      : label === "CONTROLE"
        ? "control"
        : ["PC", "IR", "ACC"].includes(label)
          ? "register"
          : label === "CLIENTE"
            ? "laptop"
            : label === "DNS" && size[0] > 1
              ? "dns"
              : label === "SERVIDOR"
                ? "server"
                : !label && size[1] > 1
                  ? "screen"
                  : size[0] === 0.68
                    ? "byte"
                    : size[0] < 0.5
                      ? "packet"
                      : "ram");
  return (
    <group
      position={position}
      rotation={kind === "screen" ? [-0.12, 0, 0] : [0, 0, 0]}
    >
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        scale={hover ? 1.035 : 1}
      >
        <RoundedBox
          args={size}
          radius={Math.min(0.055, size[1] * 0.12)}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <PhysicalSurface
            kind={
              ["laptop", "server", "drive"].includes(kind)
                ? "metal"
                : ["ram", "byte", "register", "control"].includes(kind)
                  ? "pcb"
                  : "plastic"
            }
            color={
              kind === "cpu"
                ? "#2c2c2c"
                : kind === "byte"
                  ? color
                  : kind === "control"
                    ? "#234739"
                    : kind === "laptop"
                      ? "#acacac"
                      : kind === "screen"
                        ? "#282828"
                        : kind === "server" || kind === "drive"
                          ? "#484848"
                          : kind === "dns"
                            ? "#393939"
                            : ["ram", "byte", "register"].includes(kind)
                              ? "#254f3e"
                              : color
            }
            emissiveIntensity={receiving ? 0.4 : focused ? 0.25 : 0.07}
            opacity={kind === "server" && explode > 0 ? 0.18 : 1}
            emissive={
              receiving
                ? "#49dec5"
                : focused
                  ? "#3e87ce"
                  : selected
                    ? "#746c43"
                    : "#000000"
            }
          />
          {(receiving || focused) && (
            <Edges
              scale={1.035}
              threshold={18}
              color={receiving ? "#49dec5" : "#79b7f1"}
              lineWidth={2}
            />
          )}
        </RoundedBox>
        <ModelDetails
          kind={kind}
          size={size}
          value={Number(sub) || 0}
          explode={explode}
          active={active}
          paused={paused}
        />
        {selected && explode > 0 && (
          <AnatomyMarkers kind={kind} size={size} explode={explode} />
        )}
      </group>
      {label && (
        <Label
          label={label}
          sub={sub}
          selected={selected || receiving || focused}
          height={size[1] + explode * 1.8}
        />
      )}
    </group>
  );
}
function StaticShadows({ revision }: { revision: string }) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [gl, revision, invalidate]);
  return null;
}
function HardwareCamera({
  flow,
  arrived,
  rotation,
  following,
  command,
  controls,
  cancel,
  onSettled,
}: {
  flow: FlowEvent | null;
  arrived: boolean;
  rotation: number;
  following: boolean;
  command: number;
  controls: React.RefObject<OrbitHandle | null>;
  cancel: React.RefObject<(() => void) | null>;
  onSettled: (key: string, target: number[]) => void;
}) {
  const { size } = useThree();
  const shot = hardwareCameraShot(
    following ? flow : null,
    arrived,
    size.width / Math.max(1, size.height),
    rotation,
  );
  return (
    <LessonCamera
      shot={shot}
      controls={controls}
      following={following}
      command={command}
      cancel={cancel}
      onSettled={onSettled}
    />
  );
}
export default function Hardware3D(props: Props) {
  const { theme } = useAppearance();
  const readoutTarget = useContext(ExploreReadout);
  const controls = useRef<OrbitHandle | null>(null),
    cancel = useRef<(() => void) | null>(null);
  const [following, setFollowing] = useState(true);
  const [cameraReport, setCameraReport] = useState<{
    key: string;
    target: number[];
  }>();
  const plan = cameraReport ? JSON.parse(cameraReport.key) : undefined;
  const [selected, setSelected] = useState(""),
    [spread, setSpread] = useState(0.25),
    [rotation, setRotation] = useState(0),
    [cameraKey, setCameraKey] = useState(0);
  const choose = (text: string) => setSelected(text);
  const rawState = props.state;
  const gap = 1 + spread * 0.6;
  const [replay, setReplay] = useState(0);
  const [layers, setLayers] = useState(0);
  const flow = useMemo(
    () =>
      props.kind === "cpu"
        ? cpuFlow(props.state, gap, spread)
        : props.kind === "memory"
          ? memoryFlow(props.state, gap)
          : networkFlow(props.state, gap),
    [props.kind, rawState, gap, spread],
  );
  const [visit, setVisit] = useState({ state: rawState, serial: 0 });
  if (visit.state !== rawState)
    setVisit({ state: rawState, serial: visit.serial + 1 });
  const [arrivalKey, setArrivalKey] = useState("");
  const flowKey = `${props.kind}-${flow?.id}-${flow?.payload}-${visit.serial}-${replay}`;
  const arrived = arrivalKey === flowKey;
  const s = !flow || arrived ? rawState : props.previousState || rawState;
  useEffect(() => {
    props.onTransfer?.();
  }, [flowKey]);
  const anatomyKind: PartKind =
    props.kind === "cpu"
      ? selected.startsWith("RAM")
        ? "ram"
        : /^(PC|IR|ACC)/.test(selected)
          ? "register"
          : "cpu"
      : props.kind === "memory"
        ? "byte"
        : selected.startsWith("Cliente")
          ? "laptop"
          : selected.startsWith("DNS") || selected.startsWith("Resolvedor")
            ? "dns"
            : "server";
  const anatomy = modelAnatomy[anatomyKind];
  const receiving = (id: string) =>
    arrived && !flow?.lost && flow?.receiver === id;
  useEffect(() => setSelected(""), [rawState]);
  const inspectOptions =
    props.kind === "cpu"
      ? [
          "ALU: acumulador atual " + (s as CpuState).acc,
          "PC: próxima instrução " + (s as CpuState).pc,
          "IR: " + ((s as CpuState).ir?.op || "nenhuma instrução"),
          "RAM: endereços 8, 9 e 10 contêm " +
            [8, 9, 10].map((i) => (s as CpuState).ram[i]).join(", "),
        ]
      : props.kind === "network"
        ? [
            "Cliente: inicia DNS e TCP.",
            "DNS: academy.example → 192.0.2.10.",
            "Servidor: processa GET / e responde 200 OK.",
          ]
        : Array.from({ length: 32 }, (_, i) => {
            const m = s as MemoryState;
            const b = m.blocks.find(
              (b) => i >= b.address && i < b.address + b.size,
            );
            return (
              "0x" +
              i.toString(16).padStart(2, "0") +
              " · " +
              (i >= 32 - m.stack.length
                ? "stack, valor " + m.stack[31 - i]
                : b
                  ? "heap, bloco de " + b.size + " bytes"
                  : "livre")
            );
          });
  const readout = flow ? (
    <div className="flow-readout" aria-live="polite">
      <span>FLUXO DESTA ETAPA</span>
      <strong>
        <span>{flow.source}</span> → <span>{flow.target}</span>
      </strong>
      <code>{flow.payload}</code>
      <div
        className={`flow-delivery ${arrived ? (flow.lost ? "lost" : "received") : "transit"}`}
        role="status"
      >
        {arrived
          ? flow.lost
            ? "× Perdido no caminho · nenhum componente recebeu"
            : `✓ ${flow.target} recebeu: ${flow.payload}`
          : `● Em trânsito: ${flow.source} → ${flow.target}`}
      </div>
      <p>{flow.explanation}</p>
      <button onClick={() => setReplay((r) => r + 1)} disabled={props.paused}>
        ↺ Rever fluxo
      </button>
    </div>
  ) : null;
  return (
    <div
      className="hardware-viewport"
      data-camera-follow={following}
      data-camera-focus={plan?.focus}
      data-camera-phase={plan?.phase}
      data-camera-target={cameraReport?.target.join(",")}
    >
      <div
        className="scene-camera-toolbar"
        role="group"
        aria-label="Câmera do modelo"
      >
        <button
          aria-pressed={following}
          onClick={() => setFollowing((v) => !v)}
        >
          Acompanhar etapa
        </button>
        <span>
          {following
            ? `Foco: ${plan?.focus || "Bancada completa"}`
            : "Câmera livre"}
        </span>
      </div>
      <div className={`three-scene scene-${props.kind}`}>
        <SceneBoundary>
          <Canvas
            frameloop="demand"
            shadows
            onCreated={({ gl }) => {
              gl.shadowMap.autoUpdate = false;
              gl.shadowMap.needsUpdate = true;
            }}
            gl={{ antialias: true }}
            dpr={[1, 1.5]}
            camera={{
              position: props.kind === "memory" ? [5, 7, 7] : [6, 5, 8],
              fov: 42,
            }}
          >
            <HardwareCamera
              flow={flow}
              arrived={arrived}
              rotation={rotation}
              following={following}
              command={cameraKey}
              controls={controls}
              cancel={cancel}
              onSettled={(key, target) => setCameraReport({ key, target })}
            />
            <StaticShadows
              revision={`${rotation}-${spread}-${layers}-${flow?.id ?? 0}`}
            />
            <color
              attach="background"
              args={[theme === "dark" ? "#171b19" : "#f5f5f3"]}
            />
            <ambientLight intensity={0.65} />
            <Environment resolution={64} frames={1}>
              <Lightformer
                position={[0, 5, -3]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[10, 8, 1]}
                intensity={3}
                color="#e9e9e9"
              />
              <Lightformer
                position={[-6, 2, 2]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[5, 8, 1]}
                intensity={2}
                color="#d0d0d0"
              />
              <Lightformer
                position={[6, 3, 3]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={[4, 6, 1]}
                intensity={2}
                color="#cbcbcb"
              />
            </Environment>
            <directionalLight
              position={[4, 8, 5]}
              intensity={3}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-9}
              shadow-camera-right={9}
              shadow-camera-top={8}
              shadow-camera-bottom={-8}
              shadow-bias={-0.0005}
            />
            <directionalLight
              position={[-4, 3, -2]}
              intensity={1}
              color="#c2c2c2"
            />
            <LayerContext.Provider value={layers}>
              <group rotation={[0, rotation, 0]}>
                {flow && (
                  <DataFlow
                    key={flowKey}
                    event={flow}
                    speed={props.speed}
                    paused={props.paused}
                    onArrival={() => {
                      setArrivalKey(flowKey);
                      props.onArrival?.();
                    }}
                  />
                )}
                <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                  <boxGeometry
                    args={[
                      props.kind === "network" ? 11 : 9,
                      0.12,
                      props.kind === "memory" ? 7 : 5,
                    ]}
                  />
                  <PhysicalSurface kind="pcb" color="#153e2c" />
                </mesh>
                <BoardDetails
                  network={props.kind === "network"}
                  memory={props.kind === "memory"}
                />
                {props.kind === "cpu" &&
                  (() => {
                    const c = s as CpuState;
                    const stage = c.cycles === 0 ? -1 : (c.phase + 2) % 3;
                    return (
                      <>
                        {program.map((instruction, i) => (
                          <Part
                            key={"instruction" + i}
                            position={[-1.1 + i * 0.7, -0.1, -1.95]}
                            size={[0.55, 0.2, 0.45]}
                            color="#333333"
                            label={instruction.op}
                            sub={"ROM " + i}
                            onSelect={() =>
                              choose(
                                "Memória de instruções [" +
                                  i +
                                  "]: " +
                                  instruction.op,
                              )
                            }
                          />
                        ))}
                        <Part
                          position={[0, 0.05 + spread, 0]}
                          size={[2, 0.7, 2]}
                          color={stage === 2 ? "#acacac" : "#5c5c5c"}
                          label="CPU"
                          receiving={receiving("CPU")}
                          sub={`ALU · ACC ${c.acc}`}
                          onSelect={() =>
                            choose(
                              `ALU: soma de 8 bits. Acumulador atual: ${c.acc}.`,
                            )
                          }
                        />
                        {Array.from({ length: 12 }, (_, i) => (
                          <group key={i}>
                            {[-1, 1].map((z) => (
                              <mesh
                                key={z}
                                position={[
                                  (i - 5.5) * 0.15,
                                  -0.1 + spread,
                                  z * 1.15,
                                ]}
                              >
                                <boxGeometry args={[0.07, 0.07, 0.4]} />
                                <meshStandardMaterial
                                  color="#c7ad74"
                                  metalness={0.7}
                                  roughness={0.4}
                                />
                              </mesh>
                            ))}
                          </group>
                        ))}
                        <Part
                          position={[0, 1.1 + spread * 2, 0]}
                          size={[1.65, 0.22, 1.65]}
                          color="#a7a7a7"
                          label="CONTROLE"
                          receiving={receiving("CONTROLE")}
                          sub={
                            stage < 0
                              ? "pronto"
                              : ["fetch", "decode", "execute"][stage]
                          }
                          onSelect={() =>
                            choose(
                              "Unidade de controle: coordena busca, decodificação e execução. A separação vertical é uma vista explodida didática.",
                            )
                          }
                        />
                        {[
                          {
                            label: "PC",
                            value: c.pc,
                            info: "endereço da próxima instrução",
                          },
                          {
                            label: "IR",
                            value: c.ir?.op || "—",
                            info: "instrução atual",
                          },
                          {
                            label: "ACC",
                            value: c.acc,
                            info: "resultado da operação",
                          },
                        ].map((r, i) => (
                          <Part
                            key={r.label}
                            position={[2.7 * gap, -0.08, (i - 1) * 1.05]}
                            size={[1.4, 0.35, 0.7]}
                            color="#a4a4a4"
                            label={r.label}
                            receiving={receiving(r.label)}
                            sub={String(r.value)}
                            onSelect={() =>
                              choose(
                                `${r.label}: ${r.info}. Valor atual: ${r.value}.`,
                              )
                            }
                          />
                        ))}
                        {Array.from({ length: 16 }, (_, i) => (
                          <Part
                            key={i}
                            position={[
                              -2.5 * gap + (i % 2) * 0.8,
                              -0.08,
                              Math.floor(i / 2) * 0.45 - 1.65,
                            ]}
                            size={[0.63, 0.32, 0.32]}
                            receiving={receiving(`ram-${i}`)}
                            color={
                              i === 8 || i === 9
                                ? "#a2a2a2"
                                : i === 10
                                  ? "#a4a4a4"
                                  : "#5d5d5d"
                            }
                            label={
                              i === 8 || i === 9 || i === 10
                                ? `${i.toString(16).padStart(2, "0")}: ${c.ram[i]}`
                                : ""
                            }
                            onSelect={() =>
                              choose(
                                `RAM[0x${i.toString(16).padStart(2, "0")}] = ${c.ram[i]}. Cada posição deste modelo contém um byte.`,
                              )
                            }
                          />
                        ))}
                        <Line
                          points={[
                            [-2 * gap, -0.25, 0],
                            [-1.1, -0.25, 0],
                          ]}
                          color={stage === 0 ? "#c5c5c5" : "#7c7c7c"}
                          lineWidth={3}
                        />
                        <Line
                          points={[
                            [1.1, -0.25, 0],
                            [2.4 * gap, -0.25, 0],
                          ]}
                          color={stage === 2 ? "#c5c5c5" : "#7c7c7c"}
                          lineWidth={3}
                        />
                      </>
                    );
                  })()}
                {props.kind === "memory" && (
                  <Part
                    position={[-3.7, -0.1, -2.7]}
                    size={[1, 0.35, 0.65]}
                    color="#333333"
                    label="PROGRAMA"
                    receiving={receiving("PROGRAMA")}
                    onSelect={() =>
                      choose(
                        "Origem das operações PUSH, POP, malloc e free. O movimento representa a operação do programa, não uma conexão elétrica real.",
                      )
                    }
                  />
                )}
                {props.kind === "memory" &&
                  (() => {
                    const m = s as MemoryState;
                    return Array.from({ length: 32 }, (_, i) => {
                      const block = m.blocks.find(
                        (b) => i >= b.address && i < b.address + b.size,
                      );
                      const stack = i >= 32 - m.stack.length;
                      const height = stack ? 0.75 : block ? 0.5 : 0.15;
                      const value = stack
                        ? m.stack[31 - i]
                        : block
                          ? "reservado"
                          : "livre";
                      return (
                        <Part
                          key={i}
                          position={[
                            ((i % 8) - 3.5) * 0.85 * gap,
                            -0.35 + height / 2,
                            (Math.floor(i / 8) - 1.5) * 1.05 * gap,
                          ]}
                          size={[0.68, height, 0.75]}
                          receiving={receiving(`byte-${i}`)}
                          color={
                            stack ? "#75658c" : block ? "#5f8c64" : "#3d5246"
                          }
                          label={i.toString(16).padStart(2, "0")}
                          sub={stack ? String(value) : undefined}
                          selected={selected.startsWith(
                            `0x${i.toString(16).padStart(2, "0")}`,
                          )}
                          onSelect={() =>
                            choose(
                              `0x${i.toString(16).padStart(2, "0")} · ${stack ? "Stack, valor " + value : block ? "Heap, bloco de " + block.size + " bytes em 0x" + block.address.toString(16) : "Byte livre"}. A altura distingue os usos, não a capacidade física.`,
                            )
                          }
                        />
                      );
                    });
                  })()}
                {props.kind === "network" &&
                  (() => {
                    const x = 3.1 * gap;
                    return (
                      <>
                        <Part
                          position={[-x, 0, 0]}
                          size={[1.6, 0.2, 1.2]}
                          color="#b2b2b2"
                          label="CLIENTE"
                          receiving={receiving("CLIENTE")}
                          sub="navegador"
                          onSelect={() =>
                            choose(
                              "Cliente: inicia DNS e TCP. O ACK final deste modelo leva a requisição GET.",
                            )
                          }
                        />
                        <Part
                          position={[-x, 0.8, -0.35]}
                          size={[1.6, 1.2, 0.12]}
                          color="#6a6a6a"
                          label=""
                          onSelect={() =>
                            choose(
                              "Cliente: recebe e interpreta a resposta do servidor.",
                            )
                          }
                        />
                        <Part
                          position={[0, 0, -1.2 * gap]}
                          size={[1.3, 1, 1]}
                          color="#b7b7b7"
                          label="DNS"
                          receiving={receiving("DNS")}
                          sub="192.0.2.53"
                          onSelect={() =>
                            choose(
                              "Resolvedor DNS: responde academy.example → 192.0.2.10. Cache válido evita esta consulta.",
                            )
                          }
                        />
                        <Part
                          position={[x, 0.6, 0]}
                          size={[1.5, 2, 1.3]}
                          color="#989898"
                          label="SERVIDOR"
                          receiving={receiving("SERVIDOR")}
                          sub="192.0.2.10"
                          onSelect={() =>
                            choose(
                              "Servidor HTTP: recebe GET /, processa durante 20 ms e devolve HTTP 200 OK.",
                            )
                          }
                        />
                        <Line
                          points={[
                            [-x, 0, 0],
                            [0, 0, -1.2 * gap],
                            [x, 0, 0],
                          ]}
                          color="#858585"
                          lineWidth={2}
                        />
                        <Line
                          points={[
                            [-x, 0.05, 0.5],
                            [x, 0.05, 0.5],
                          ]}
                          color="#939393"
                          lineWidth={2}
                        />
                      </>
                    );
                  })()}
              </group>
            </LayerContext.Provider>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.575, 0]}
              receiveShadow
            >
              <planeGeometry args={[30, 30]} />
              <shadowMaterial transparent opacity={0.35} />
            </mesh>
            <gridHelper
              args={[
                30,
                30,
                theme === "dark" ? "#434c46" : "#d0d0d0",
                theme === "dark" ? "#2b352e" : "#e3e3e3",
              ]}
              position={[0, -0.58, 0]}
            />
            <OrbitControls
              ref={controls}
              onStart={() => cancel.current?.()}
              enableDamping={false}
              enablePan
              minDistance={2.5}
              maxDistance={60}
              maxPolarAngle={Math.PI / 2.06}
              makeDefault
            />
          </Canvas>
        </SceneBoundary>
        {readout &&
          (readoutTarget ? createPortal(readout, readoutTarget) : readout)}
        <div className="scene-inspector" aria-live="polite">
          {selected || "Selecione uma peça para investigar o que ela faz."}
        </div>
      </div>
      <div className="explore-model-tools">
        <div className="scene-tools">
          <select
            aria-label="Inspecionar componente 3D"
            value={inspectOptions.includes(selected) ? selected : ""}
            onChange={(e) => choose(e.target.value)}
          >
            <option value="">Inspecionar peça…</option>
            {inspectOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <span>ARRASTE PARA ORBITAR · ROLE PARA ZOOM</span>
          <label>
            {props.kind === "cpu" ? "Vista explodida" : "Separar componentes"}
            <input
              aria-label="Separar componentes 3D"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
            />
          </label>
          <label>
            Abrir camadas internas
            <input
              aria-label="Abrir camadas internas"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layers}
              onChange={(e) => setLayers(Number(e.target.value))}
            />
          </label>
          <button
            onClick={() => setRotation((r) => r - 0.3)}
            aria-label="Girar cena para a esquerda"
          >
            ↶
          </button>
          <button
            onClick={() => setRotation((r) => r + 0.3)}
            aria-label="Girar cena para a direita"
          >
            ↷
          </button>
          <button
            onClick={() => {
              setRotation(0);
              setLayers(0);
              setFollowing(true);
              setCameraKey((k) => k + 1);
            }}
          >
            Redefinir vista
          </button>
        </div>
        <details className="component-anatomy">
          <summary>Entenda as partes do modelo</summary>
          <h4>{anatomy.name}</h4>
          <dl>
            {anatomy.parts.map(([name, text], i) => (
              <div key={name}>
                <dt>
                  <span>0{i + 1}</span> {name}
                </dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <p>{anatomy.note}</p>
        </details>
      </div>
    </div>
  );
}
