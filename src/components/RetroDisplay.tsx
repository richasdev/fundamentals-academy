import { useEffect, useRef, useState } from "react";
import { Flame, Pause, Play, SkipForward, Terminal } from "lucide-react";
import {
  createFire,
  firePalette,
  stepFire,
  type FireField,
} from "../simulators/doomFire";
type Mode = "fire" | "matrix";
export default function RetroDisplay() {
  const [mode, setMode] = useState<Mode>("fire");
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [heat, setHeat] = useState(0.95),
    [wind, setWind] = useState(0.4),
    [step, setStep] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null),
    fire = useRef<FireField | null>(null),
    drops = useRef<number[]>([]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => {
      if (media.matches) setPaused(true);
    };
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const ctx = surface.getContext("2d", { alpha: false });
    if (!ctx) return;
    const width = mode === "fire" ? 192 : 440,
      height = mode === "fire" ? 112 : 250;
    const fresh = surface.width !== width || surface.height !== height;
    if (fresh) {
      surface.width = width;
      surface.height = height;
      ctx.fillStyle = "#050708";
      ctx.fillRect(0, 0, width, height);
      drops.current = [];
    }
    if (!fire.current) {
      fire.current = createFire(192, 112);
      for (let i = 0; i < 150; i++) stepFire(fire.current, heat, wind);
    }
    const palette = firePalette(),
      image = ctx.createImageData(width, height),
      alphabet = "01アイウエオカキクケコサシスセソ<>/{}[]";
    if (!drops.current.length)
      drops.current = Array.from(
        { length: Math.ceil(width / 12) },
        (_, i) => ((i * 37) % 31) - 12,
      );
    const draw = () => {
      if (mode === "fire") {
        const field = fire.current!;
        stepFire(field, heat, wind);
        for (let i = 0; i < field.cells.length; i++) {
          const at = field.cells[i] * 4;
          image.data[i * 4] = palette[at];
          image.data[i * 4 + 1] = palette[at + 1];
          image.data[i * 4 + 2] = palette[at + 2];
          image.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
      } else {
        ctx.fillStyle = "rgba(5,7,8,.16)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = "12px monospace";
        drops.current.forEach((row, i) => {
          const x = i * 12,
            y = row * 14;
          ctx.fillStyle = i % 4 === 0 ? "#c8ffda" : "#5ac985";
          ctx.fillText(
            alphabet[Math.floor(Math.random() * alphabet.length)],
            x,
            y,
          );
          if (y > height && Math.random() > 0.96) drops.current[i] = -2;
          else drops.current[i] += 0.55;
        });
      }
    };
    draw();
    if (mode === "matrix" && paused && fresh)
      for (let i = 0; i < 36; i++) draw();
    let frame = 0,
      last = 0,
      visible = false;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const tick = (now: number) => {
      if (now - last > 1000 / 24) {
        draw();
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      stop();
      if (visible && !document.hidden && !paused)
        frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    });
    observer.observe(surface);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [mode, paused, heat, wind, step]);
  return (
    <section
      className={`retro-display retro-${mode}`}
      aria-label="Experimentos visuais de programação"
    >
      <div className="retro-titlebar">
        <span>
          <Terminal size={12} /> display_00
        </span>
        <span>CANVAS / {paused ? "PAUSADO" : "24 FPS MÁX."}</span>
      </div>
      <div className="retro-screen">
        <canvas
          ref={canvas}
          aria-label={
            mode === "fire"
              ? "Fogo Doom: calor se propaga entre pixels e perde intensidade."
              : "Chuva de caracteres inspirada em Matrix."
          }
          role="img"
        />
        <span className="retro-overlay">
          {mode === "fire" ? "DOOM FIRE" : "DIGITAL RAIN"}
          <small>
            {mode === "fire"
              ? "pixels → calor → propagação"
              : "caracteres → colunas → movimento"}
          </small>
        </span>
        <span className="retro-resolution" aria-hidden="true">
          {mode === "fire" ? "192 × 112" : "440 × 250"} PX
        </span>
      </div>
      <div className="retro-controls">
        <div role="group" aria-label="Efeito visual">
          <button
            className={mode === "fire" ? "active" : ""}
            aria-pressed={mode === "fire"}
            onClick={() => setMode("fire")}
          >
            <Flame size={13} /> Fogo Doom
          </button>
          <button
            className={mode === "matrix" ? "active" : ""}
            aria-pressed={mode === "matrix"}
            onClick={() => setMode("matrix")}
          >
            <Terminal size={13} /> Matrix
          </button>
        </div>
        <button
          aria-label={paused ? "Animar efeito visual" : "Pausar efeito visual"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        {paused && (
          <button
            aria-label="Avançar efeito visual"
            onClick={() => setStep((s) => s + 1)}
          >
            <SkipForward size={14} />
          </button>
        )}
      </div>
      {mode === "fire" && (
        <div className="fire-tuning">
          <label>
            Calor{" "}
            <input
              aria-label="Calor do fogo Doom"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={heat}
              onChange={(e) => setHeat(Number(e.target.value))}
            />
            <output>{Math.round(heat * 100)}%</output>
          </label>
          <label>
            Vento{" "}
            <input
              aria-label="Vento do fogo Doom"
              type="range"
              min="-2"
              max="2"
              step=".2"
              value={wind}
              onChange={(e) => setWind(Number(e.target.value))}
            />
            <output>
              {wind > 0 ? "+" : ""}
              {wind.toFixed(1)}
            </output>
          </label>
        </div>
      )}
      <details className="retro-explanation">
        <summary>O algoritmo por trás do efeito</summary>
        <p>
          {mode === "fire"
            ? "Uma linha de pixels recebe calor. A cada passo, a intensidade sobe, perde energia e se desloca com o vento. A paleta converte os números em fogo. Experimente reduzir o calor a zero."
            : "Cada coluna avança caracteres em velocidades visuais constantes. Uma camada semitransparente escurece os quadros anteriores e cria o rastro. São caracteres gerados, sem vídeo ou imagens prontas."}
        </p>
        {mode === "fire" && (
          <a
            href="https://github.com/filipedeschamps/doom-fire-algorithm"
            target="_blank"
            rel="noreferrer"
          >
            Referência: Doom Fire Algorithm Playground ↗
          </a>
        )}
      </details>
    </section>
  );
}
