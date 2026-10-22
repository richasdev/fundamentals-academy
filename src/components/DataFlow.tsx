import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Group, QuadraticBezierCurve3, CatmullRomCurve3, Vector3 } from "three";
import type { FlowEvent } from "../simulators/flows";
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
  const marker = useRef<Group>(null);
  const progress = useRef(0);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
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
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    progress.current = reduced ? 1 : 0;
    invalidate();
  }, [event, reduced, invalidate]);
  useEffect(() => invalidate(), [paused, speed, invalidate]);
  useFrame((_, delta) => {
    if (!marker.current) return;
    if (!paused)
      progress.current = Math.min(
        1,
        progress.current + (Math.min(delta, 0.06) * speed) / 1.05,
      );
    const t = reduced ? 1 : progress.current;
    const eased = t * t * (3 - 2 * t);
    marker.current.position.copy(curve.getPoint(eased));
    marker.current.quaternion.setFromUnitVectors(
      new Vector3(0, 1, 0),
      curve.getTangent(eased).normalize(),
    );
    if (t < 1 && !paused) invalidate();
  });
  return (
    <group>
      <Line points={curve.getPoints(40)} color="#ffffff" lineWidth={4} />
      <Line
        points={curve.getPoints(40)}
        color="#242424"
        lineWidth={1.5}
        dashed
        dashSize={0.13}
        gapSize={0.09}
      />
      <group ref={marker}>
        <mesh>
          <boxGeometry args={[0.19, 0.3, 0.12]} />
          <meshStandardMaterial
            color={event.lost ? "#aa554a" : "#cfae73"}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.1, 0.19, 10]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.55}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <boxGeometry args={[0.12, 0.18, 0.014]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      {[event.from, event.to].map((point, i) => (
        <mesh key={i} position={point} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.19 : 0.14, 0.018, 6, 24]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
