import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Line, RoundedBox } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import type {
  CpuState,
  MemoryState,
  NetworkState,
} from "../simulators/engines";
import ModelDetails, { BoardDetails, type PartKind } from "./ModelDetails";
type Props =
  | { kind: "cpu"; state: CpuState }
  | { kind: "memory"; state: MemoryState }
  | { kind: "network"; state: NetworkState };
type Vec = [number, number, number];
class SceneBoundary extends Component<
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
function Label({
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
    c.fillStyle = "#1b241df0";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = selected ? "#ead6a9" : "#8c9d7c";
    c.lineWidth = 3;
    c.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    c.fillStyle = "#eee7d4";
    c.textAlign = "center";
    c.font = "500 32px monospace";
    c.fillText(label, 160, sub ? 48 : 51);
    if (sub) {
      c.fillStyle = "#d4c1a0";
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
function Part({
  position,
  size,
  color,
  label,
  sub,
  onSelect,
  selected = false,
}: {
  position: Vec;
  size: Vec;
  color: string;
  label: string;
  sub?: string;
  onSelect: () => void;
  selected?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const kind: PartKind =
    label === "CPU"
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
                      : "ram";
  return (
    <group position={position}>
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
        >
          <meshStandardMaterial
            color={color}
            roughness={0.65}
            metalness={0.25}
            emissive={selected ? "#b6b47a" : "#000000"}
            emissiveIntensity={0.18}
          />
        </RoundedBox>
        <ModelDetails kind={kind} size={size} value={Number(sub) || 0} />
      </group>
      {label && (
        <Label label={label} sub={sub} selected={selected} height={size[1]} />
      )}
    </group>
  );
}
function FitCamera() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const factor = size.width / size.height < 1.1 ? 1.55 : 1;
    camera.position.set(6 * factor, 6 * factor, 8 * factor);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}
export default function Hardware3D(props: Props) {
  const [selected, setSelected] = useState(""),
    [spread, setSpread] = useState(0.25),
    [rotation, setRotation] = useState(0),
    [cameraKey, setCameraKey] = useState(0);
  const choose = (text: string) => setSelected(text);
  const s = props.state;
  const gap = 1 + spread * 0.6;
  useEffect(() => setSelected(""), [s]);
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
  return (
    <div className={`three-scene scene-${props.kind}`}>
      <div className="scene-caption">
        <span>
          OBJETO DE ESTUDO /{" "}
          {props.kind === "cpu" ? "01" : props.kind === "memory" ? "02" : "03"}
        </span>
        <strong>
          {props.kind === "cpu"
            ? "Uma máquina, por dentro."
            : props.kind === "memory"
              ? "Cada byte tem um lugar."
              : "Uma conversa entre máquinas."}
        </strong>
      </div>
      <SceneBoundary>
        <Canvas
          key={cameraKey}
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{
            position: props.kind === "memory" ? [5, 7, 7] : [6, 5, 8],
            fov: 42,
          }}
        >
          <FitCamera />
          <color attach="background" args={["#171b19"]} />
          <ambientLight intensity={1.7} />
          <directionalLight position={[4, 8, 5]} intensity={3} />
          <directionalLight
            position={[-4, 3, -2]}
            intensity={1}
            color="#a3caca"
          />
          <group rotation={[0, rotation, 0]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry
                args={[
                  props.kind === "network" ? 11 : 9,
                  0.12,
                  props.kind === "memory" ? 7 : 5,
                ]}
              />
              <meshStandardMaterial color="#293a34" roughness={0.9} />
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
                    <Part
                      position={[0, 0.05 + spread, 0]}
                      size={[2, 0.7, 2]}
                      color={stage === 2 ? "#9ab58c" : "#555f57"}
                      label="CPU"
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
                              color="#b5a987"
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
                      color="#9baba0"
                      label="CONTROLE"
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
                        color="#b7a18b"
                        label={r.label}
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
                        color={
                          i === 8 || i === 9
                            ? "#91a894"
                            : i === 10
                              ? "#cf9c76"
                              : "#4b6356"
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
                      color={stage === 0 ? "#e3c28b" : "#648475"}
                      lineWidth={3}
                    />
                    <Line
                      points={[
                        [1.1, -0.25, 0],
                        [2.4 * gap, -0.25, 0],
                      ]}
                      color={stage === 2 ? "#e3c28b" : "#648475"}
                      lineWidth={3}
                    />
                  </>
                );
              })()}
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
                      color={stack ? "#b4a0c2" : block ? "#9fb899" : "#3d5246"}
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
                const n = s as NetworkState;
                const x = 3.1 * gap;
                return (
                  <>
                    <Part
                      position={[-x, 0, 0]}
                      size={[1.6, 0.2, 1.2]}
                      color="#a6b6b0"
                      label="CLIENTE"
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
                      color="#596f68"
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
                      color="#a9bda0"
                      label="DNS"
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
                      color="#a99581"
                      label="SERVIDOR"
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
                      color="#688e7b"
                      lineWidth={2}
                    />
                    <Line
                      points={[
                        [-x, 0.05, 0.5],
                        [x, 0.05, 0.5],
                      ]}
                      color="#9b9474"
                      lineWidth={2}
                    />
                    {n.stage > 0 && (
                      <Part
                        position={
                          n.stage === 1
                            ? [0, 0.8, -1.2 * gap]
                            : [
                                n.stage === 2 || n.stage === 4 || n.stage === 7
                                  ? -x
                                  : x,
                                0.7,
                                0.5,
                              ]
                        }
                        size={[0.38, 0.35, 0.55]}
                        color={n.retried ? "#dba47d" : "#e0d3a5"}
                        label={
                          [
                            "",
                            "DNS",
                            "DNS",
                            "SYN",
                            "SYN-ACK",
                            "GET /",
                            "HTTP",
                            "200 OK",
                          ][n.stage]
                        }
                        onSelect={() => choose(n.log)}
                      />
                    )}
                  </>
                );
              })()}
          </group>
          <gridHelper
            args={[30, 30, "#3c4940", "#222f29"]}
            position={[0, -0.58, 0]}
          />
          <OrbitControls
            enablePan
            minDistance={5}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2.06}
            makeDefault
          />
        </Canvas>
      </SceneBoundary>
      <div className="scene-inspector" aria-live="polite">
        {selected || "Selecione uma peça para investigar o que ela faz."}
      </div>
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
            setCameraKey((k) => k + 1);
          }}
        >
          Redefinir vista
        </button>
      </div>
    </div>
  );
}
