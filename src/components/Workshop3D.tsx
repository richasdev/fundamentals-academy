import ConceptModel, { conceptAnatomy } from "./ConceptModel";
import { useRef, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  OrbitControls,
  Line,
} from "@react-three/drei";
import { Part, SceneBoundary } from "./Hardware3D";
import PhysicalSurface from "./PhysicalSurface";
import { BoardDetails } from "./ModelDetails";
import DataFlow from "./DataFlow";
import type { WorkshopNode, WorkshopStep } from "../simulators/workshops";
import { useAppearance } from "../theme";
import { nodeModel, modelAnatomy } from "./modelAnatomy";
import LessonCamera, { type OrbitHandle } from "./LessonCamera";
import { cameraShot } from "../simulators/cameraFraming";
function InspectionPanel({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  return compact ? (
    <details className="scene-inspection-controls">
      <summary>Inspecionar e ajustar modelo</summary>
      {children}
    </details>
  ) : (
    <>{children}</>
  );
}
function CameraRig({
  nodes,
  flow,
  arrived,
  spread,
  rotation,
  inspection,
  ...props
}: {
  nodes: WorkshopNode[];
  flow: WorkshopStep["flow"];
  arrived: boolean;
  spread: number;
  rotation: number;
  inspection: string;
} & Omit<Parameters<typeof LessonCamera>[0], "shot">) {
  const { size } = useThree();
  const shot = cameraShot(
    nodes,
    props.following ? flow : undefined,
    arrived,
    size.width / Math.max(1, size.height),
    spread,
    rotation,
    inspection,
  );
  return <LessonCamera {...props} shot={shot} />;
}
export default function Workshop3D({
  nodes,
  step,
  speed,
  paused,
  replay,
  onArrival,
  arrived,
  focus = [],
  controlledProgress,
  autoCamera = false,
  compact = false,
  edges = [],
}: {
  nodes: WorkshopNode[];
  step: WorkshopStep;
  speed: number;
  paused: boolean;
  replay: string;
  onArrival: () => void;
  arrived: boolean;
  focus?: string[];
  controlledProgress?: number;
  autoCamera?: boolean;
  compact?: boolean;
  edges?: [string, string][];
}) {
  const { theme } = useAppearance();
  const [rotation, setRotation] = useState(0),
    [spread, setSpread] = useState(1),
    [cameraKey, setCameraKey] = useState(0);
  const [selected, setSelected] = useState("");
  const [viewNode, setViewNode] = useState("");
  const [explode, setExplode] = useState(0);
  const selectedNode = nodes.find((n) => n.id === selected);
  const anatomy = selectedNode
    ? conceptAnatomy(selectedNode) || modelAnatomy[nodeModel(selectedNode)]
    : null;
  const [following, setFollowing] = useState(autoCamera);
  const controls = useRef<OrbitHandle>(null),
    cancel = useRef<(() => void) | null>(null);
  const [cameraReport, setCameraReport] = useState<{
    focus: string;
    phase: string;
    target: number[];
  } | null>(null);
  // A vista explodida desloca nós e os pontos do fluxo juntos.
  const spatialNodes = nodes.map((n) => ({
    ...n,
    position: [
      n.position[0] * spread,
      n.position[1],
      n.position[2] * spread,
    ] as [number, number, number],
  }));
  const flow = step.flow && {
    ...step.flow,
    from: [
      step.flow.from[0] * spread,
      step.flow.from[1],
      step.flow.from[2] * spread,
    ] as [number, number, number],
    to: [
      step.flow.to[0] * spread,
      step.flow.to[1],
      step.flow.to[2] * spread,
    ] as [number, number, number],
  };
  // Stable event identity avoids restarting animations when a receiver changes color.
  const flowSignature = JSON.stringify(flow);
  return (
    <div
      className={`workshop-viewport ${compact ? "compact-workshop" : ""}`}
      data-camera-follow={following}
      data-camera-focus={cameraReport?.focus}
      data-camera-phase={cameraReport?.phase}
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
            ? `Foco: ${step.flow?.lost ? "caminho da mensagem" : step.flow?.target || "bancada"}`
            : "Câmera livre"}
        </span>
      </div>
      <div className="three-scene workshop-scene">
        <SceneBoundary>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            shadows
            camera={{ position: [5, 6, 9], fov: 42 }}
          >
            <CameraRig
              nodes={nodes}
              flow={step.flow}
              arrived={arrived}
              spread={spread}
              rotation={rotation}
              inspection={following ? "" : viewNode}
              controls={controls}
              following={following}
              command={cameraKey}
              cancel={cancel}
              onSettled={(key, target) => {
                const shot = JSON.parse(key);
                setCameraReport({
                  focus: shot.focus,
                  phase: shot.phase,
                  target,
                });
              }}
            />
            <color
              attach="background"
              args={[theme === "dark" ? "#171b19" : "#f5f5f3"]}
            />
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[4, 8, 5]}
              intensity={3}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <Environment resolution={64} frames={1}>
              <Lightformer
                position={[0, 5, -3]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[10, 8, 1]}
                intensity={3}
              />
            </Environment>
            <group rotation={[0, rotation, 0]}>
              <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[11, 0.12, 7]} />
                <PhysicalSurface kind="pcb" color="#153e2c" />
              </mesh>
              <BoardDetails network={false} memory={false} />
              {spatialNodes.map((n, i) => (
                <group key={n.id}>
                  {n.visual ? (
                    <ConceptModel
                      node={n}
                      explode={selected === n.id ? explode : 0}
                      value={step.values[n.id] || "—"}
                      selected={selected === n.id}
                      receiving={
                        arrived &&
                        step.flow?.receiver === n.id &&
                        !step.flow.lost
                      }
                      onSelect={() => setSelected(n.id)}
                    />
                  ) : (
                    <Part
                      position={[
                        n.position[0],
                        n.kind === "server" ? 0.65 : 0,
                        n.position[2],
                      ]}
                      size={
                        n.kind === "server"
                          ? [1.25, 2, 1.25]
                          : n.kind === "cpu"
                            ? [1.6, 0.5, 1.4]
                            : [1.5, 0.22, 1]
                      }
                      modelKind={nodeModel(n)}
                      explode={selected === n.id ? explode : 0}
                      active={
                        !arrived &&
                        !step.flow?.lost &&
                        (focus.includes(n.id) ||
                          step.flow?.source === n.label ||
                          step.flow?.receiver === n.id)
                      }
                      paused={paused}
                      label={n.label}
                      sub={(step.values[n.id] || "—").slice(0, 22)}
                      color={
                        ["#547caa", "#6e9e62", "#9774a6", "#b19b59", "#548d8f"][
                          i % 5
                        ]
                      }
                      receiving={
                        arrived &&
                        !step.flow?.lost &&
                        step.flow?.receiver === n.id
                      }
                      focused={
                        focus.includes(n.id) || step.flow?.source === n.label
                      }
                      selected={selected === n.id}
                      onSelect={() => setSelected(n.id)}
                    />
                  )}
                  {nodeModel(n) === "laptop" && (
                    <Part
                      position={[n.position[0], 0.65, n.position[2] - 0.45]}
                      size={[1.5, 0.95, 0.08]}
                      label=""
                      color="#373b40"
                      modelKind="screen"
                      onSelect={() => setSelected(n.id)}
                      selected={selected === n.id}
                    />
                  )}
                </group>
              ))}
              {edges.map(([from, to]) => {
                const a = spatialNodes.find((n) => n.id === from),
                  b = spatialNodes.find((n) => n.id === to);
                return a && b ? (
                  <Line
                    key={`${from}-${to}`}
                    points={[
                      [a.position[0], 0.05, a.position[2]],
                      [b.position[0], 0.05, b.position[2]],
                    ]}
                    color="#718b7e"
                    lineWidth={1}
                  />
                ) : null;
              })}
              {flow && (
                <StableFlow
                  key={`${replay}-${flowSignature}`}
                  signature={flowSignature}
                  speed={speed}
                  paused={paused}
                  controlledProgress={controlledProgress}
                  onArrival={onArrival}
                />
              )}
            </group>
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
              makeDefault
              enableDamping={false}
              minDistance={2.5}
              maxDistance={60}
              maxPolarAngle={Math.PI / 2.08}
            />
          </Canvas>
        </SceneBoundary>
      </div>
      <InspectionPanel compact={compact}>
        <div className="scene-tools">
          <select
            aria-label="Inspecionar componente 3D"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Inspecionar peça…</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedNode}
            onClick={() => {
              setFollowing(false);
              setViewNode(selected);
              setCameraKey((k) => k + 1);
            }}
          >
            Enquadrar componente
          </button>
          <label>
            Abrir camadas
            <input
              aria-label="Abrir camadas do componente"
              type="range"
              disabled={!selectedNode}
              min="0"
              max="1"
              step="0.1"
              value={explode}
              onChange={(e) => setExplode(Number(e.target.value))}
            />
          </label>
          <label>
            Separar componentes{" "}
            <input
              aria-label="Separar componentes 3D"
              type="range"
              min="0.85"
              max="1.2"
              step="0.05"
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
            />
          </label>
          <button
            aria-label="Girar cena para a esquerda"
            onClick={() => setRotation((r) => r - 0.3)}
          >
            ↶
          </button>
          <button
            aria-label="Girar cena para a direita"
            onClick={() => setRotation((r) => r + 0.3)}
          >
            ↷
          </button>
          <button
            onClick={() => {
              setRotation(0);
              setSpread(1);
              setFollowing(autoCamera);
              setViewNode("");
              setExplode(0);
              setCameraKey((k) => k + 1);
            }}
          >
            Redefinir vista
          </button>
        </div>
        {selectedNode && anatomy && (
          <section
            className="component-anatomy"
            aria-label="Anatomia do componente selecionado"
          >
            <div className="scene-inspector" aria-live="polite">
              <strong>{selectedNode.label}</strong>
              <p>{selectedNode.detail}</p>
            </div>
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
          </section>
        )}
      </InspectionPanel>
    </div>
  );
}
function StableFlow({
  signature,
  ...props
}: {
  signature: string;
  speed: number;
  paused: boolean;
  controlledProgress?: number;
  onArrival: () => void;
}) {
  const [event] = useState(() => JSON.parse(signature));
  return <DataFlow event={event} {...props} />;
}
