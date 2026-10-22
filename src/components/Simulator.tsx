import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Undo2,
  Box,
  ArrowRight,
} from "lucide-react";
import {
  cpuModel,
  memoryAction,
  initialMemory,
  networkModel,
  networkLabels,
  program,
  type Model,
  type CpuState,
  type NetworkState,
} from "../simulators/engines";
import type { LabId } from "../content/lessons";
const Hardware3D = lazy(() => import("./Hardware3D"));
function useEngine<S>(model: Model<S>) {
  const [history, setHistory] = useState<S[]>(() => [model.initial()]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [motionPaused, setMotionPaused] = useState(false);
  const state = history[history.length - 1];
  const done = model.done(state);
  const step = () => {
    setMotionPaused(false);
    setHistory((h) =>
      model.done(h[h.length - 1]) ? h : [...h, model.step(h[h.length - 1])],
    );
  };
  useEffect(() => {
    setHistory([model.initial()]);
    setPlaying(false);
  }, [model]);
  useEffect(() => {
    if (!playing || done) return;
    const timer = window.setInterval(
      () =>
        setHistory((h) =>
          model.done(h[h.length - 1]) ? h : [...h, model.step(h[h.length - 1])],
        ),
      1200 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, done, model, speed]);
  return {
    state,
    history,
    playing: playing && !done,
    speed,
    done,
    step,
    motionPaused,
    toggle: () => {
      setMotionPaused(playing);
      setPlaying(!playing);
    },
    setSpeed,
    reset: () => {
      setPlaying(false);
      setMotionPaused(false);
      setHistory([model.initial()]);
    },
    back: () => {
      setPlaying(false);
      setMotionPaused(false);
      setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    },
  };
}
function Controls({ engine }: { engine: ReturnType<typeof useEngine<any>> }) {
  return (
    <div className="transport">
      <button
        className="primary"
        onClick={engine.toggle}
        disabled={engine.done}
      >
        {engine.playing ? <Pause size={15} /> : <Play size={15} />}{" "}
        {engine.playing ? "Pausar" : "Executar"}
      </button>
      <button onClick={engine.step} disabled={engine.done}>
        <SkipForward size={15} /> Próximo passo
      </button>
      <div className="transport-secondary">
        <button
          title="Voltar um passo"
          aria-label="Voltar um passo"
          onClick={engine.back}
          disabled={engine.history.length < 2}
        >
          <Undo2 size={16} />
        </button>
        <button title="Reiniciar" aria-label="Reiniciar" onClick={engine.reset}>
          <RotateCcw size={16} />
        </button>
        <label className="speed">
          Velocidade{" "}
          <select
            aria-label="Velocidade"
            value={engine.speed}
            onChange={(e) => engine.setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0,5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
    </div>
  );
}
function CpuDiagram({ s }: { s: CpuState }) {
  const active = s.cycles === 0 ? -1 : (s.phase + 2) % 3;
  return (
    <svg
      className="cpu-diagram"
      viewBox="0 0 760 370"
      role="img"
      aria-label={`CPU: acumulador ${s.acc}, contador de programa ${s.pc}, etapa ${["buscar", "decodificar", "executar"][Math.max(0, active)]}`}
    >
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#3b453e" />
        </pattern>
        <linearGradient id="chip" x2="1" y2="1">
          <stop stopColor="#26342b" />
          <stop offset="1" stopColor="#1a211d" />
        </linearGradient>
      </defs>
      <rect width="760" height="370" fill="url(#dots)" />
      <g fill="none" stroke="#455347" strokeWidth="2">
        <path d="M219 160H300V120H463V160H545" />
        <path d="M219 217H300V268H463V217H545" />
        <path d="M384 194V260" />
      </g>
      <g stroke={active === 0 ? "#c0ee91" : "#65745d"} fill="#171d18">
        <rect x="68" y="105" width="151" height="155" rx="9" />
        <path d="M83 155H204M83 185H204M83 215H204" opacity=".4" />
      </g>
      <text x="88" y="133" fill="#c1d0bb" fontSize="12">
        RAM · 16 BYTES
      </text>
      <g fontFamily="monospace" fontSize="12" fill="#9da99c">
        <text x="88" y="175">
          0x08
        </text>
        <text x="173" y="175" fill="#c0ee91">
          {s.ram[8].toString().padStart(2, "0")}
        </text>
        <text x="88" y="205">
          0x09
        </text>
        <text x="173" y="205" fill="#c0ee91">
          {s.ram[9].toString().padStart(2, "0")}
        </text>
        <text x="88" y="235">
          0x0A
        </text>
        <text x="173" y="235" fill="#e0ba7b">
          {s.ram[10].toString().padStart(2, "0")}
        </text>
      </g>
      <g transform="translate(300 88)">
        <rect
          x="-12"
          y="12"
          width="180"
          height="180"
          rx="12"
          fill="#0e1210"
          stroke="#56684b"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} stroke="#718068" strokeWidth="4">
            <path
              d={`M${i * 17 + 10} 0v12 M${i * 17 + 10} 192v12 M-24 ${i * 17 + 30}h12 M168 ${i * 17 + 30}h12`}
            />
          </g>
        ))}
        <rect
          width="156"
          height="180"
          rx="9"
          fill="url(#chip)"
          stroke="#a0bb81"
        />
        <text
          x="78"
          y="37"
          textAnchor="middle"
          fill="#e4e9df"
          fontSize="22"
          fontWeight="600"
        >
          CPU
        </text>
        <rect
          x="18"
          y="53"
          width="120"
          height="40"
          rx="4"
          fill="#172019"
          stroke={active === 1 ? "#c0ee91" : "#3d4b3c"}
        />
        <text x="78" y="78" textAnchor="middle" fill="#a9bc9b" fontSize="11">
          UNIDADE DE CONTROLE
        </text>
        <rect
          x="18"
          y="107"
          width="120"
          height="50"
          rx="4"
          fill="#273624"
          stroke={active === 2 ? "#c0ee91" : "#526848"}
        />
        <text x="78" y="137" textAnchor="middle" fill="#c3e69f" fontSize="17">
          ALU
        </text>
      </g>
      <rect
        x="545"
        y="105"
        width="143"
        height="155"
        rx="9"
        fill="#1b201c"
        stroke="#465342"
      />
      <text x="562" y="133" fill="#c1d0bb" fontSize="12">
        REGISTRADORES
      </text>
      <g fontFamily="monospace" fontSize="12">
        <text x="562" y="172" fill="#8c9a87">
          PC
        </text>
        <text x="645" y="172" fill="#c0ee91">
          {s.pc.toString().padStart(2, "0")}
        </text>
        <text x="562" y="205" fill="#8c9a87">
          IR
        </text>
        <text x="620" y="205" fill="#d7ddd1">
          {s.ir?.op || "—"}
        </text>
        <text x="562" y="238" fill="#8c9a87">
          ACC
        </text>
        <text x="645" y="238" fill="#c0ee91">
          {s.acc.toString().padStart(2, "0")}
        </text>
      </g>
      <g fill="#8e9b88" fontSize="11" fontFamily="monospace">
        <text x="248" y="104">
          dados
        </text>
        <text x="474" y="291">
          barramento
        </text>
        <text x="317" y="329">
          ARQUITETURA DIDÁTICA · 8 BITS
        </text>
      </g>
      {active >= 0 && (
        <circle
          cx={active === 0 ? 260 : active === 1 ? 378 : 500}
          cy={active === 1 ? 120 : active === 0 ? 160 : 268}
          r="5"
          fill="#c0ee91"
        />
      )}
    </svg>
  );
}
function CpuLab() {
  const [a, setA] = useState(5),
    [b, setB] = useState(3);
  const model = useMemo(() => cpuModel(a, b), [a, b]);
  const e = useEngine(model);
  const [three, setThree] = useState(true);
  const s = e.state;
  const active = s.cycles === 0 ? -1 : (s.phase + 2) % 3;
  return (
    <>
      <div className="lab-top">
        <span>
          <i className="live-dot" /> SIMULADOR AO VIVO
        </span>
        <button onClick={() => setThree(!three)} className="view-toggle">
          <Box size={14} />
          {three ? "Ver diagrama 2D" : "Explorar em 3D"}
        </button>
      </div>
      <div className="cpu-layout">
        <div className="visual-area">
          {three ? (
            <Suspense fallback={<p>Carregando cena…</p>}>
              <Hardware3D
                kind="cpu"
                state={s}
                speed={e.speed}
                paused={e.motionPaused}
              />
            </Suspense>
          ) : (
            <CpuDiagram s={s} />
          )}
          <div className="phase-track">
            {["Fetch", "Decode", "Execute"].map((p, i) => (
              <div key={p} className={active === i ? "active" : ""}>
                <span>0{i + 1}</span>
                {p}
                <small>{["Buscar", "Decodificar", "Executar"][i]}</small>
                {i < 2 && <ArrowRight size={14} />}
              </div>
            ))}
          </div>
        </div>
        <aside className="code-panel">
          <div className="panel-label">
            PROGRAMA <span>assembly didático</span>
          </div>
          <div className="code-lines">
            {program.map((p, i) => (
              <div className={s.ir && s.pc - 1 === i ? "current" : ""} key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <code>
                  <b>{p.op}</b>
                  {p.op !== "HALT" &&
                    ` [0x${p.address.toString(16).padStart(2, "0")}]`}
                </code>
              </div>
            ))}
          </div>
          <div className="input-values">
            <p>Experimente outros valores</p>
            <label>
              RAM[0x08]
              <input
                type="number"
                min="0"
                max="255"
                value={a}
                onChange={(ev) =>
                  setA(Math.min(255, Math.max(0, Number(ev.target.value))))
                }
              />
            </label>
            <label>
              RAM[0x09]
              <input
                type="number"
                min="0"
                max="255"
                value={b}
                onChange={(ev) =>
                  setB(Math.min(255, Math.max(0, Number(ev.target.value))))
                }
              />
            </label>
            <small>Alterar um valor reinicia o programa.</small>
          </div>
          <div className="register-result">
            <span>ACUMULADOR</span>
            <strong>{s.acc.toString().padStart(2, "0")}</strong>
            <small>{s.acc.toString(2).padStart(8, "0")}₂</small>
          </div>
        </aside>
      </div>
      <div className="status-bar" role="status">
        <span className="status-index">
          {String(s.cycles).padStart(2, "0")}
        </span>
        {s.log}
        <span className="cycle-count">{s.cycles} ciclos</span>
      </div>
      <Controls engine={e} />
      <details className="history">
        <summary>
          Histórico de execução · {e.history.length - 1} transições
        </summary>
        {e.history.slice(1).map((h, i) => (
          <p key={i}>
            {i + 1}. {h.log}
          </p>
        ))}
      </details>
    </>
  );
}
function MemoryLab() {
  const [three, setThree] = useState(true);
  const [history, setHistory] = useState([initialMemory()]);
  const [size, setSize] = useState(4);
  const s = history[history.length - 1];
  const occupied = s.blocks.reduce((n, b) => n + b.size, 0) + s.stack.length;
  const act = (a: "push" | "pop" | "alloc" | "free") =>
    setHistory((h) => [...h, memoryAction(h[h.length - 1], a, size)]);
  return (
    <>
      <div className="lab-top">
        <span>
          <i className="live-dot" /> MAPA DE MEMÓRIA · 32 BYTES
        </span>
        <button className="view-toggle" onClick={() => setThree(!three)}>
          {three ? "Ver mapa 2D" : "Explorar em 3D"}
        </button>
      </div>
      {three && (
        <Suspense fallback={<p>Preparando a bancada…</p>}>
          <Hardware3D kind="memory" state={s} />
        </Suspense>
      )}
      <div className="memory-content">
        <div className="memory-legend">
          <span>
            <i className="heap-key" /> Heap
          </span>
          <span>
            <i className="stack-key" /> Stack
          </span>
          <span>□ Livre</span>
        </div>
        <div className="memory-grid" hidden={three}>
          {Array.from({ length: 32 }, (_, i) => {
            const block = s.blocks.find(
              (b) => i >= b.address && i < b.address + b.size,
            );
            const stack = i >= 32 - s.stack.length;
            return (
              <div
                key={i}
                className={block ? "heap-cell" : stack ? "stack-cell" : ""}
              >
                <small>0x{i.toString(16).padStart(2, "0")}</small>
                <strong>{stack ? s.stack[31 - i] : block ? "■" : "·"}</strong>
                <span>{stack ? "stack" : block ? "heap" : "livre"}</span>
              </div>
            );
          })}
        </div>
        <div className="allocation-controls">
          <label>
            Tamanho / valor{" "}
            <input
              aria-label="Tamanho ou valor"
              type="number"
              min="1"
              max="8"
              value={size}
              onChange={(e) =>
                setSize(Math.max(1, Math.min(8, Number(e.target.value))))
              }
            />
          </label>
          <button onClick={() => act("alloc")}>malloc({size})</button>
          <button onClick={() => act("free")}>free(último)</button>
          <button onClick={() => act("push")}>PUSH {size}</button>
          <button onClick={() => act("pop")}>POP</button>
        </div>
      </div>
      <div className="status-bar" role="status">
        {s.log}
      </div>
      <div className="transport">
        <button
          onClick={() => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))}
          disabled={history.length < 2}
        >
          <Undo2 size={15} /> Voltar
        </button>
        <button onClick={() => setHistory([initialMemory()])}>
          <RotateCcw size={15} /> Reiniciar
        </button>
        <span>
          {32 - occupied} bytes livres · {s.operations} operações
        </span>
      </div>
      <details className="history">
        <summary>Histórico de alocações</summary>
        {history.slice(1).map((h, i) => (
          <p key={i}>{h.log}</p>
        ))}
      </details>
    </>
  );
}
function NetworkLab() {
  const [three, setThree] = useState(true);
  const [latency, setLatency] = useState(40),
    [cached, setCached] = useState(false),
    [loss, setLoss] = useState(false);
  const model = useMemo(
    () => networkModel(latency, cached, loss),
    [latency, cached, loss],
  );
  const e = useEngine<NetworkState>(model);
  const s = e.state;
  return (
    <>
      <div className="lab-top">
        <span>
          <i className="live-dot" /> HTTP SOBRE TCP · REDE SIMULADA
        </span>
        <button className="view-toggle" onClick={() => setThree(!three)}>
          {three ? "Ver diagrama 2D" : "Explorar em 3D"}
        </button>
      </div>
      {three && (
        <Suspense fallback={<p>Preparando a bancada…</p>}>
          <Hardware3D
            kind="network"
            state={s}
            speed={e.speed}
            paused={e.motionPaused}
          />
        </Suspense>
      )}
      <div className="network-content">
        <div className="network-nodes" hidden={three}>
          {["Seu navegador", "Resolvedor DNS", "Servidor HTTP"].map((n, i) => (
            <div
              key={n}
              className={
                (s.stage < 2 && i === 1) || (s.stage >= 2 && i === 2)
                  ? "node-active"
                  : ""
              }
            >
              <span className="node-icon">{["⌘", "◎", "▤"][i]}</span>
              <strong>{n}</strong>
              <small>{["cliente", "192.0.2.53", "192.0.2.10"][i]}</small>
            </div>
          ))}
        </div>
        <div className="network-steps">
          {networkLabels.map((l, i) => (
            <div
              key={l}
              className={s.stage > i ? "finished" : s.stage === i ? "next" : ""}
            >
              <span>{s.stage > i ? "✓" : i + 1}</span>
              {l}
              {cached && i < 2 && <small>cache</small>}
            </div>
          ))}
        </div>
        <div className="network-options">
          <label>
            Latência por trecho: {latency} ms
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={cached}
              onChange={(e) => setCached(e.target.checked)}
            />{" "}
            DNS em cache
          </label>
          <label>
            <input
              type="checkbox"
              checked={loss}
              onChange={(e) => setLoss(e.target.checked)}
            />{" "}
            Perder o primeiro SYN
          </label>
        </div>
        <p className="hint">
          Alterar parâmetros reinicia a requisição. Nenhum pacote real é
          enviado.
        </p>
      </div>
      <div className="status-bar" role="status">
        {s.log}
        <span className="cycle-count">
          {s.status} · {s.elapsed} ms
        </span>
      </div>
      <Controls engine={e} />
      <details className="history">
        <summary>Histórico da requisição</summary>
        {e.history.slice(1).map((h, i) => (
          <p key={i}>
            {h.elapsed} ms · {h.log}
          </p>
        ))}
      </details>
    </>
  );
}
export default function Simulator({ id }: { id: LabId }) {
  return (
    <section className="simulator" aria-label="Laboratório interativo">
      {id === "cpu" ? (
        <CpuLab />
      ) : id === "memory" ? (
        <MemoryLab />
      ) : (
        <NetworkLab />
      )}
    </section>
  );
}
