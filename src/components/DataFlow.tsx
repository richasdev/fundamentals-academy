import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  CatmullRomCurve3,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  QuadraticBezierCurve3,
  Vector3,
} from "three";
import type { FlowEvent } from "../simulators/flows";
import { useAppearance } from "../theme";

function haloTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.14, "rgba(255,255,255,.8)");
  gradient.addColorStop(0.4, "rgba(255,255,255,.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

export default function DataFlow({
  event,
  speed = 1,
  paused = false,
}: {
  event: FlowEvent;
  speed?: number;
  paused?: boolean;
}) {
  const { invalidate } = useThree();
  const { theme } = useAppearance();
  const marker = useRef<Group>(null),
    dots = useRef<InstancedMesh>(null),
    arrival = useRef<Mesh>(null);
  const trails = useRef<(Group | null)[]>([]);
  const progress = useRef(0);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const halo = useMemo(haloTexture, []);
  const color = event.lost
    ? "#fb9764"
    : theme === "dark"
      ? "#a2f5e8"
      : "#218d96";
  const curve = useMemo(() => {
    const from = new Vector3(...event.from),
      to = new Vector3(...event.to);
    if (event.via?.length) {
      const knots = [from, ...event.via.map((p) => new Vector3(...p)), to];
      const pts: Vector3[] = [];
      knots.forEach((p, i) => {
        if (i) {
          const mid = knots[i - 1].clone().lerp(p, 0.5);
          mid.y += 0.4;
          pts.push(mid);
        }
        pts.push(p);
      });
      return new CatmullRomCurve3(pts);
    }
    const mid = from.clone().lerp(to, 0.5);
    mid.y = Math.max(from.y, to.y) + 0.9;
    return new QuadraticBezierCurve3(from, mid, to);
  }, [event]);
  const points = useMemo(
    () =>
      curve.getSpacedPoints(
        Math.min(128, Math.max(12, Math.ceil(curve.getLength() / 0.13))),
      ),
    [curve],
  );
  useLayoutEffect(() => {
    if (!dots.current) return;
    const object = new Object3D();
    points.forEach((p, i) => {
      object.position.copy(p);
      object.updateMatrix();
      dots.current!.setMatrixAt(i, object.matrix);
    });
    dots.current.instanceMatrix.needsUpdate = true;
  }, [points]);
  useEffect(() => () => halo.dispose(), [halo]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    progress.current = reduced ? 1.3 : 0;
    invalidate();
  }, [event, reduced, invalidate]);
  useEffect(() => invalidate(), [paused, speed, theme, invalidate]);
  useFrame((_, delta) => {
    if (!marker.current) return;
    if (!paused)
      progress.current = Math.min(
        1.3,
        progress.current + (Math.min(delta, 0.06) * speed) / 1.05,
      );
    const travel = reduced ? 1 : Math.min(1, progress.current),
      eased = travel * travel * (3 - 2 * travel);
    const settling = Math.max(0, (progress.current - 1) / 0.3);
    curve.getPointAt(eased, marker.current.position);
    marker.current.scale.setScalar(
      1 + (!reduced && travel === 1 ? (1 - settling) * 0.18 : 0),
    );
    trails.current.forEach((trail, i) => {
      if (!trail) return;
      const offset = (i + 1) * 0.025;
      trail.visible = !reduced && eased > offset && settling < 1;
      if (trail.visible) {
        curve.getPointAt(Math.max(0, eased - offset), trail.position);
        trail.scale.setScalar((1 - i * 0.09) * (1 - settling));
      }
    });
    if (arrival.current) {
      arrival.current.visible = !reduced && travel === 1 && settling < 1;
      arrival.current.scale.setScalar(1 + settling * 2.3);
      (arrival.current.material as MeshBasicMaterial).opacity =
        (1 - settling) * 0.8;
    }
    if (!reduced && progress.current < 1.3 && !paused) invalidate();
  });
  return (
    <group>
      <instancedMesh
        key={points.length}
        ref={dots}
        args={[undefined, undefined, points.length]}
      >
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial
          color={theme === "dark" ? "#b4d8d4" : "#345c66"}
          transparent
          opacity={0.92}
          toneMapped={false}
        />
      </instancedMesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          ref={(node) => {
            trails.current[i] = node;
          }}
          visible={false}
        >
          <mesh>
            <sphereGeometry args={[0.043 - i * 0.003, 8, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.55 - i * 0.055}
              toneMapped={false}
            />
          </mesh>
          <sprite scale={[0.24, 0.24, 1]}>
            <spriteMaterial
              map={halo}
              color={color}
              transparent
              opacity={0.18 - i * 0.017}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        </group>
      ))}
      <group ref={marker}>
        <sprite scale={[0.75, 0.75, 1]}>
          <spriteMaterial
            map={halo}
            color={color}
            transparent
            opacity={theme === "dark" ? 0.7 : 0.4}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <mesh>
          <sphereGeometry args={[0.095, 16, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.061, 12, 10]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.95}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      {[event.from, event.to].map((point, i) => (
        <mesh key={i} position={point} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.19 : 0.14, 0.018, 6, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh
        ref={arrival}
        position={event.to}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <torusGeometry args={[0.2, 0.025, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
