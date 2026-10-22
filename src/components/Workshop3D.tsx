import { useEffect, useState } from "react";
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
function Camera({ resetKey }: { resetKey: number }) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const k = size.width / size.height < 1.15 ? 1.5 : 1;
    camera.position.set(5 * k, 6 * k, 9 * k);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate, resetKey]);
  return null;
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
}: {
  nodes: WorkshopNode[];
  step: WorkshopStep;
  speed: number;
  paused: boolean;
  replay: string;
  onArrival: () => void;
  arrived: boolean;
  focus?: string[];
}) {
  const { theme } = useAppearance();
  const [rotation, setRotation] = useState(0),
    [spread, setSpread] = useState(1),
    [cameraKey, setCameraKey] = useState(0);
  const [selected, setSelected] = useState("");
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
    <div className="three-scene workshop-scene">
      <SceneBoundary>
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          shadows
          camera={{ position: [5, 6, 9], fov: 42 }}
        >
          <Camera resetKey={cameraKey} />
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
                  modelKind={n.kind === "storage" ? "drive" : n.kind}
                  label={n.label}
                  sub={(step.values[n.id] || "—").slice(0, 22)}
                  color={
                    ["#547caa", "#6e9e62", "#9774a6", "#b19b59", "#548d8f"][
                      i % 5
                    ]
                  }
                  receiving={
                    arrived && !step.flow?.lost && step.flow?.receiver === n.id
                  }
                  focused={focus.includes(n.id)}
                  selected={selected === n.id}
                  onSelect={() => setSelected(n.id)}
                />

                {i > 0 && (
                  <Line
                    points={[
                      [
                        spatialNodes[0].position[0],
                        -0.3,
                        spatialNodes[0].position[2],
                      ],
                      [n.position[0], -0.3, n.position[2]],
                    ]}
                    color="#718b7e"
                    lineWidth={1}
                  />
                )}
              </group>
            ))}
            {flow && (
              <StableFlow
                key={`${replay}-${flowSignature}`}
                signature={flowSignature}
                speed={speed}
                paused={paused}
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
            key={cameraKey}
            makeDefault
            enableDamping={false}
            minDistance={4}
            maxDistance={24}
            maxPolarAngle={Math.PI / 2.08}
            target={[0, 0, 0]}
          />
        </Canvas>
      </SceneBoundary>
      <div className="scene-inspector" aria-live="polite">
        {nodes.find((n) => n.id === selected)?.detail || ""}
      </div>
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
            setCameraKey((k) => k + 1);
          }}
        >
          Redefinir vista
        </button>
      </div>
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
  onArrival: () => void;
}) {
  const [event] = useState(() => JSON.parse(signature));
  return <DataFlow event={event} {...props} />;
}
