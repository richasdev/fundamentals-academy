import { useLayoutEffect, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";
import PhysicalSurface from "./PhysicalSurface";
import { Line } from "@react-three/drei";
type Vec = [number, number, number];
export type PartKind =
  | "cpu"
  | "control"
  | "ram"
  | "register"
  | "byte"
  | "laptop"
  | "screen"
  | "dns"
  | "server"
  | "packet";
function Boxes({
  positions,
  size,
  color,
  colors,
}: {
  positions: Vec[];
  size: Vec;
  color: string;
  colors?: string[];
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new Object3D();
    positions.forEach((p, i) => {
      object.position.set(...p);
      object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
      if (colors) ref.current!.setColorAt(i, new Color(colors[i]));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor)
      ref.current!.instanceColor.needsUpdate = true;
  }, [positions, colors]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.45} roughness={0.55} />
    </instancedMesh>
  );
}
function Bolt({ position }: { position: Vec }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, 0.025, 8]} />
        <meshStandardMaterial color="#ababab" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.017, 0]}>
        <boxGeometry args={[0.055, 0.008, 0.012]} />
        <meshStandardMaterial color="#3e3e3e" />
      </mesh>
    </group>
  );
}
function Fan({ position, radius = 0.2 }: { position: Vec; radius?: number }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.025, 5, 20]} />
        <meshStandardMaterial color="#b9a977" metalness={0.6} roughness={0.4} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]}>
          <mesh position={[0, radius * 0.48, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[radius * 0.65, radius * 0.7, 0.025]} />
            <meshStandardMaterial color="#383838" />
          </mesh>
        </group>
      ))}
      <mesh>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.05, 10]} />
        <meshStandardMaterial color="#b4b4b4" />
      </mesh>
    </group>
  );
}
export function BoardDetails({
  network = false,
  memory = false,
}: {
  network?: boolean;
  memory?: boolean;
}) {
  const w = network ? 5.5 : 4.5,
    d = memory ? 3.5 : 2.5;
  return (
    <group position={[0, -0.43, 0]}>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Bolt
            key={`${x},${z}`}
            position={[x * (w - 0.2), 0, z * (d - 0.2)]}
          />
        )),
      )}
      <Boxes
        positions={Array.from(
          { length: 14 },
          (_, i) => [-3.5 + i * 0.5, 0.005, -d + 0.35] as Vec,
        )}
        size={[0.28, 0.025, 0.08]}
        color="#d2bc77"
      />
      {!network &&
        Array.from({ length: 14 }, (_, i) => {
          const z = -1.8 + i * 0.27;
          return (
            <Line
              key={i}
              points={[
                [-3.9, 0.01, z],
                [-2 - i * 0.025, 0.01, z],
                [-1.4, 0.01, z + 0.14],
                [3.5, 0.01, z + 0.14],
              ]}
              color={i % 3 === 0 ? "#a58e57" : "#4c7160"}
              lineWidth={i % 3 === 0 ? 1.2 : 0.7}
            />
          );
        })}
      {!memory &&
        !network &&
        [-1, 1].flatMap((x) =>
          Array.from({ length: 4 }, (_, i) => (
            <group key={`${x},${i}`} position={[x * 3.8, 0.12, i * 0.65 - 1]}>
              <mesh>
                <cylinderGeometry args={[0.09, 0.09, 0.24, 10]} />
                <meshStandardMaterial
                  color="#8d8d8d"
                  metalness={0.7}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0, 0.125, 0]}>
                <cylinderGeometry args={[0.075, 0.075, 0.015, 10]} />
                <meshStandardMaterial color="#3c3c3c" />
              </mesh>
            </group>
          )),
        )}
      {network && (
        <Line
          points={[
            [-4.8, 0.02, 1.5],
            [4.8, 0.02, 1.5],
          ]}
          color="#9b9b9b"
          lineWidth={2}
        />
      )}
    </group>
  );
}
export default function ModelDetails({
  kind,
  size,
  value = 0,
}: {
  kind: PartKind;
  size: Vec;
  value?: number;
}) {
  const [w, h, d] = size;
  const top = h / 2 + 0.012;
  if (kind === "cpu" || kind === "control")
    return (
      <group>
        <mesh position={[0, top, 0]}>
          <boxGeometry args={[w * 0.85, 0.035, d * 0.85]} />
          <meshStandardMaterial
            color="#a8a8a8"
            metalness={0.75}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, top + 0.03, 0]}>
          <boxGeometry args={[w * 0.62, 0.04, d * 0.62]} />
          <meshStandardMaterial
            color="#484848"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <Boxes
          positions={Array.from({ length: 20 }, (_, i) => [
            ((i % 5) - 2) * w * 0.1,
            top + 0.06,
            (Math.floor(i / 5) - 1.5) * d * 0.12,
          ])}
          size={[w * 0.075, 0.018, d * 0.08]}
          color="#36594d"
        />
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Bolt
              key={`${x}${z}`}
              position={[x * w * 0.38, top + 0.03, z * d * 0.38]}
            />
          )),
        )}
        <Boxes
          positions={Array.from({ length: 20 }, (_, i) => [
            ((i % 10) - 4.5) * w * 0.08,
            -h * 0.15,
            (i < 10 ? -1 : 1) * (d / 2 + 0.055),
          ])}
          size={[w * 0.035, 0.07, 0.18]}
          color="#b9a977"
        />
        {kind === "cpu" && (
          <Boxes
            positions={Array.from({ length: 9 }, (_, i) => [
              (i - 4) * w * 0.085,
              top + 0.18,
              0,
            ])}
            size={[0.055, 0.24, d * 0.9]}
            color="#b6b6b6"
          />
        )}
      </group>
    );
  if (kind === "ram" || kind === "register" || kind === "byte")
    return (
      <group>
        <mesh position={[0, top, 0]}>
          <boxGeometry args={[w * 0.9, 0.025, d * 0.9]} />
          <PhysicalSurface kind="pcb" color="#164632" />
        </mesh>
        <Boxes
          positions={Array.from({ length: kind === "byte" ? 2 : 4 }, (_, i) => [
            ((i - ((kind === "byte" ? 2 : 4) - 1) / 2) * w) /
              (kind === "byte" ? 2.7 : 4.7),
            top + 0.055,
            0,
          ])}
          size={[w * (kind === "byte" ? 0.29 : 0.17), 0.075, d * 0.44]}
          color="#282828"
        />
        <Boxes
          positions={Array.from({ length: 8 }, (_, i) => [
            (i - 3.5) * w * 0.105,
            top + 0.03,
            d * 0.38,
          ])}
          size={[w * 0.045, 0.035, d * 0.18]}
          color="#c7a64d"
        />
        {kind !== "ram" && (
          <Boxes
            positions={Array.from({ length: 8 }, (_, i) => [
              (i - 3.5) * w * 0.105,
              top + 0.105,
              -d * 0.35,
            ])}
            size={[w * 0.047, 0.025, 0.035]}
            color="#ffffff"
            colors={Array.from({ length: 8 }, (_, i) =>
              (value >> (7 - i)) & 1 ? "#e7bf79" : "#415146",
            )}
          />
        )}
        <mesh position={[w * 0.45, top + 0.045, -d * 0.35]}>
          <boxGeometry args={[0.035, 0.035, 0.06]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>
      </group>
    );
  if (kind === "laptop")
    return (
      <group>
        <Boxes
          positions={Array.from({ length: 36 }, (_, i) => [
            ((i % 12) - 5.5) * 0.11,
            top + 0.014,
            (Math.floor(i / 12) - 1) * 0.13 - 0.18,
          ])}
          size={[0.085, 0.015, 0.09]}
          color="#404040"
        />
        <mesh position={[0, top + 0.005, 0.35]}>
          <boxGeometry args={[0.5, 0.009, 0.28]} />
          <meshStandardMaterial color="#898989" />
        </mesh>
        <Boxes
          positions={[-0.5, 0, 0.5].map((x) => [x, top - 0.025, -0.52])}
          size={[0.2, 0.08, 0.08]}
          color="#b4b4b4"
        />
        <Boxes
          positions={[-0.3, 0, 0.3].map((z) => [-w / 2 - 0.006, 0, z])}
          size={[0.015, 0.045, 0.14]}
          color="#303030"
        />
      </group>
    );
  if (kind === "screen")
    return (
      <group>
        <mesh position={[0, 0, d / 2 + 0.01]}>
          <boxGeometry args={[w * 0.88, h * 0.8, 0.02]} />
          <meshStandardMaterial
            color="#172c28"
            emissive="#294b40"
            emissiveIntensity={0.25}
          />
        </mesh>
        <Boxes
          positions={Array.from({ length: 6 }, (_, i) => [
            -w * 0.11,
            (i - 2.5) * h * 0.09,
            d / 2 + 0.03,
          ])}
          size={[w * 0.47, 0.018, 0.01]}
          color="#ababab"
        />
        <mesh position={[0, h * 0.44, d / 2 + 0.025]}>
          <sphereGeometry args={[0.016, 8, 6]} />
          <meshStandardMaterial color="#121212" />
        </mesh>
      </group>
    );
  if (kind === "dns")
    return (
      <group>
        <Boxes
          positions={Array.from({ length: 8 }, (_, i) => [
            (i - 3.5) * w * 0.085,
            top + 0.018,
            0,
          ])}
          size={[0.025, 0.025, d * 0.65]}
          color="#434343"
        />
        {[-1, 1].map((x) => (
          <group key={x} position={[x * w * 0.42, top, d * 0.25]}>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.025, 0.04, 0.76, 8]} />
              <meshStandardMaterial color="#b4b4b4" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#6a6a6a" />
            </mesh>
          </group>
        ))}
        <Boxes
          positions={[-0.4, -0.1, 0.2].map((x) => [x, -0.18, d / 2 + 0.015])}
          size={[0.17, 0.15, 0.035]}
          color="#363636"
        />
        <Boxes
          positions={[-0.4, -0.1, 0.2].map((x) => [x, -0.13, d / 2 + 0.04])}
          size={[0.1, 0.018, 0.015]}
          color="#bdbdbd"
        />
        <Boxes
          positions={[-0.35, -0.2, -0.05, 0.1].map((x) => [
            x,
            0.18,
            d / 2 + 0.025,
          ])}
          size={[0.035, 0.035, 0.025]}
          color="#b3d297"
        />
      </group>
    );
  if (kind === "server")
    return (
      <group>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i} position={[0, (i - 2) * 0.32, d / 2 + 0.025]}>
            <mesh>
              <boxGeometry args={[w * 0.8, 0.25, 0.045]} />
              <meshStandardMaterial color="#272727" />
            </mesh>
            <mesh position={[w * 0.28, 0, 0.03]}>
              <boxGeometry args={[0.12, 0.09, 0.04]} />
              <meshStandardMaterial color="#c1c1c1" metalness={0.65} />
            </mesh>
            <Boxes
              positions={Array.from({ length: 5 }, (_, j) => [
                -w * 0.28 + j * 0.08,
                0,
                0.028,
              ])}
              size={[0.025, 0.14, 0.008]}
              color="#0c0c0c"
            />
            <mesh position={[w * 0.12, 0, 0.04]}>
              <sphereGeometry args={[0.022, 6, 6]} />
              <meshStandardMaterial color={i % 2 ? "#78c985" : "#c6a66d"} />
            </mesh>
          </group>
        ))}
        <Fan position={[0, top + 0.03, 0]} radius={0.38} />
        {[0.12, 0.2, 0.28, 0.36].map((r) => (
          <mesh
            key={r}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, top + 0.07, 0]}
          >
            <torusGeometry args={[r, 0.012, 5, 32]} />
            <meshStandardMaterial
              color="#818181"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        ))}
        <Boxes
          positions={[-1, 1].flatMap((x) =>
            [-0.8, 0, 0.8].map((y): Vec => [x * w * 0.45, y, d / 2 + 0.07]),
          )}
          size={[0.035, 0.035, 0.03]}
          color="#c0c0c0"
        />
        <Boxes
          positions={Array.from({ length: 10 }, (_, i) => [
            w / 2 + 0.008,
            (i - 4.5) * 0.14,
            0,
          ])}
          size={[0.015, 0.025, d * 0.65]}
          color="#3f3f3f"
        />
      </group>
    );
  return (
    <group>
      <mesh position={[0, top + 0.005, 0]}>
        <boxGeometry args={[w * 0.7, 0.018, d * 0.65]} />
        <meshStandardMaterial color="#d8d8d8" />
      </mesh>
      <Boxes
        positions={[-1, 0, 1].map((i) => [i * w * 0.18, top + 0.019, 0])}
        size={[w * 0.1, 0.015, d * 0.45]}
        color="#6e6e6e"
      />
    </group>
  );
}
