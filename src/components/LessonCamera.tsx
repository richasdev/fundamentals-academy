import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ComponentRef,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import type { CameraShot } from "../simulators/cameraFraming";
export type OrbitHandle = ComponentRef<typeof OrbitControls>;
export default function LessonCamera({
  shot,
  controls,
  following,
  command,
  cancel,
  onSettled,
}: {
  shot: CameraShot;
  controls: RefObject<OrbitHandle | null>;
  following: boolean;
  command: number;
  cancel: RefObject<(() => void) | null>;
  onSettled: (key: string, target: number[]) => void;
}) {
  const { camera, invalidate } = useThree();
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const move = useRef<{
    from: Vector3;
    to: Vector3;
    fromTarget: Vector3;
    toTarget: Vector3;
    elapsed: number;
    key: string;
  } | null>(null);
  const lastCommand = useRef(-1),
    report = useRef(onSettled);
  report.current = onSettled;
  const key = JSON.stringify(shot);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    cancel.current = () => {
      move.current = null;
    };
    return () => {
      cancel.current = null;
    };
  }, [cancel]);
  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    if (!following && lastCommand.current === command) {
      move.current = null;
      return;
    }
    lastCommand.current = command;
    const plan: CameraShot = JSON.parse(key),
      to = new Vector3(...plan.position),
      toTarget = new Vector3(...plan.target);
    if (reduced) {
      move.current = null;
      camera.position.copy(to);
      orbit.target.copy(toTarget);
      orbit.update();
      report.current(key, orbit.target.toArray());
    } else
      move.current = {
        from: camera.position.clone(),
        to,
        fromTarget: orbit.target.clone(),
        toTarget,
        elapsed: 0,
        key,
      };
    invalidate();
  }, [key, following, command, reduced, camera, controls, invalidate]);
  useFrame((_, delta) => {
    const motion = move.current,
      orbit = controls.current;
    if (!motion || !orbit) return;
    motion.elapsed = Math.min(0.65, motion.elapsed + Math.min(delta, 0.06));
    const t = motion.elapsed / 0.65,
      eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(motion.from, motion.to, eased);
    orbit.target.lerpVectors(motion.fromTarget, motion.toTarget, eased);
    orbit.update();
    if (t === 1) {
      move.current = null;
      report.current(motion.key, orbit.target.toArray());
    } else invalidate();
  });
  return null;
}
