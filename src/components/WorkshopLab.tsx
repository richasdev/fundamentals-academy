import ExploreStage from "./ExploreStage";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Undo2 } from "lucide-react";
import type { ExtendedLabId } from "../content/lessons";
import { componentRole } from "../content/componentRoles";
import {
  buildWorkshop,
  defaultSettings,
  gateValue,
  type Gate,
  type Settings,
} from "../simulators/workshops";
const Workshop3D = lazy(() => import("./Workshop3D"));
export default function WorkshopLab({ id }: { id: ExtendedLabId }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [expression, setExpression] = useState(defaultSettings.expression);
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [paused, setPaused] = useState(false),
    [speed, setSpeed] = useState(1),
    [three, setThree] = useState(true),
    [replay, setReplay] = useState(0);
  const run = useMemo(() => {
    const built = buildWorkshop(id, settings);
    return {
      ...built,
      nodes: built.nodes.map((node) => ({
        ...node,
        detail: componentRole(id, node),
      })),
    };
  }, [id, settings]);
  const step = run.steps[index] || run.steps[0],
    done = index === run.steps.length - 1;
  const signature = `${id}-${JSON.stringify(settings)}-${index}-${replay}`;
  const [arrival, setArrival] = useState("");
  const arrived = arrival === signature;
  const configure = (patch: Partial<Settings>) => {
    setPlaying(false);
    setPaused(false);
    setIndex(0);
    setSettings((s) => ({ ...s, ...patch }));
  };
  useEffect(() => {
    if (!playing || done || run.error || (three && step.flow && !arrived))
      return;
    const timer = window.setTimeout(
      () => setIndex((n) => Math.min(n + 1, run.steps.length - 1)),
      three && step.flow ? 650 + 400 / speed : 1200 / speed,
    );
    return () => clearTimeout(timer);
  }, [playing, done, index, speed, run, three, step.flow, arrived]);
  const reset = () => {
    setIndex(0);
    setPlaying(false);
    setPaused(false);
    setReplay((r) => r + 1);
  };
  return (
    <div className="workshop">
      <div className="lab-top">
        <span>
          <i className="live-dot" /> MODELO EXECUTÁVEL · {run.steps.length - 1}{" "}
          ETAPAS
        </span>
        <button className="view-toggle" onClick={() => setThree((v) => !v)}>
          {three ? "Ver diagrama 2D" : "Explorar em 3D"}
        </button>
      </div>
      <ExploreStage
        stepKey={signature}
        scene={
          <>
            {three ? (
              <Suspense fallback={<p>Preparando a bancada 3D…</p>}>
                <Workshop3D
                  autoCamera
                  compact
                  nodes={run.nodes}
                  step={step}
                  speed={speed}
                  paused={paused}
                  replay={signature}
                  onArrival={() => setArrival(signature)}
                  arrived={arrived}
                />
              </Suspense>
            ) : (
              <div
                className="workshop-diagram"
                aria-label="Diagrama dos componentes"
              >
                {run.nodes.map((n) => (
                  <article
                    key={n.id}
                    className={
                      arrived && step.flow?.receiver === n.id ? "received" : ""
                    }
                  >
                    <span>{n.label}</span>
                    <strong>{step.values[n.id]}</strong>
                    <p>{n.detail}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        }
        explanation={
          <div className="status-bar" role="status">
            <span className="status-index">
              {String(index).padStart(2, "0")}
            </span>
            {step.log}
            {step.result && <strong>{step.result}</strong>}
          </div>
        }
        controls={
          <div className="transport">
            <button
              className="primary"
              disabled={done || !!run.error}
              onClick={() => {
                setPlaying((v) => !v);
                setPaused(playing);
              }}
            >
              {playing && !done ? <Pause size={15} /> : <Play size={15} />}
              {playing && !done ? "Pausar" : "Executar"}
            </button>
            <button
              disabled={done || !!run.error}
              onClick={() => {
                setPlaying(false);
                setPaused(false);
                setIndex((n) => n + 1);
              }}
            >
              <SkipForward size={15} /> Próximo passo
            </button>
            <div className="transport-secondary">
              <button
                aria-label="Voltar um passo"
                disabled={!index}
                onClick={() => {
                  setPlaying(false);
                  setPaused(false);
                  setIndex((n) => n - 1);
                }}
              >
                <Undo2 size={16} />
              </button>
              <button aria-label="Reiniciar" onClick={reset}>
                <RotateCcw size={16} />
              </button>
              <label className="speed">
                Velocidade{" "}
                <select
                  aria-label="Velocidade"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={0.5}>0,5×</option>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                </select>
              </label>
            </div>
          </div>
        }
      >
        <div className="workshop-state">
          <div className="workshop-flow" aria-live="polite">
            <span className="section-label">
              ETAPA {index}/{run.steps.length - 1} · {step.title}
            </span>
            {step.flow ? (
              <>
                <strong>
                  {step.flow.source} → {step.flow.target}
                </strong>
                <code>{step.flow.payload}</code>
                <p
                  className={`flow-delivery ${arrived || !three ? (step.flow.lost ? "lost" : "received") : "transit"}`}
                >
                  {arrived || !three
                    ? step.flow.lost
                      ? "× Sem entrega: destino indisponível"
                      : `✓ ${step.flow.target} recebeu: ${step.flow.payload}`
                    : "● Em trânsito"}
                </p>
                <button
                  onClick={() => {
                    setReplay((r) => r + 1);
                    setPaused(false);
                  }}
                  disabled={paused}
                >
                  ↺ Rever fluxo
                </button>
              </>
            ) : (
              <p>
                {index === 0
                  ? "Configure e avance para acompanhar a primeira transferência."
                  : step.result}
              </p>
            )}
            <div className="workshop-values">
              {run.nodes.map((n) => (
                <div key={n.id}>
                  <span>{n.label}</span>
                  <code>{step.values[n.id]}</code>
                </div>
              ))}
            </div>
          </div>
          <details className="workshop-code" open>
            <summary>
              {id === "logic"
                ? "Função e tabela-verdade"
                : "Código e estrutura do modelo"}
            </summary>
            <pre>
              <code>{run.code}</code>
            </pre>
          </details>
        </div>
        {id === "logic" && (
          <table className="truth-table">
            <caption>Tabela-verdade · {settings.gate}</caption>
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Y</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1].flatMap((a) =>
                [0, 1].map((b) => (
                  <tr
                    key={`${a}${b}`}
                    className={
                      a === settings.a && b === settings.b ? "current" : ""
                    }
                  >
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{gateValue(settings.gate, a, b)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}

        <fieldset className="workshop-settings">
          <legend>Altere as condições do experimento</legend>
          {id === "logic" && (
            <>
              <label>
                Porta lógica{" "}
                <select
                  value={settings.gate}
                  onChange={(e) => configure({ gate: e.target.value as Gate })}
                >
                  {["NAND", "AND", "OR", "XOR"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              {(["a", "b"] as const).map((key) => (
                <label key={key}>
                  Entrada {key.toUpperCase()}{" "}
                  <select
                    aria-label={`Entrada ${key.toUpperCase()}`}
                    value={settings[key]}
                    onChange={(e) =>
                      configure({ [key]: Number(e.target.value) })
                    }
                  >
                    <option value={0}>0 · desligado</option>
                    <option value={1}>1 · ligado</option>
                  </select>
                </label>
              ))}
            </>
          )}
          {id === "os" && (
            <label>
              Quantum{" "}
              <select
                aria-label="Quantum"
                value={settings.quantum}
                onChange={(e) => configure({ quantum: Number(e.target.value) })}
              >
                <option value={1}>1 unidade</option>
                <option value={2}>2 unidades</option>
                <option value={3}>3 unidades</option>
              </select>
            </label>
          )}
          {id === "infra" && (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={settings.cache}
                  onChange={(e) => configure({ cache: e.target.checked })}
                />{" "}
                Cache na borda
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.offline > 0}
                  onChange={(e) =>
                    configure({ offline: e.target.checked ? 1 : 0 })
                  }
                />{" "}
                APP A indisponível
              </label>
            </>
          )}
          {id === "database" && (
            <>
              <label>
                Chave procurada{" "}
                <input
                  aria-label="Chave procurada"
                  type="number"
                  min={0}
                  max={24}
                  value={settings.key}
                  onChange={(e) =>
                    configure({
                      key: Math.max(
                        0,
                        Math.min(24, Math.trunc(Number(e.target.value))),
                      ),
                    })
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.indexed}
                  onChange={(e) => configure({ indexed: e.target.checked })}
                />{" "}
                Usar índice
              </label>
            </>
          )}
          {id === "compiler" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                configure({ expression });
              }}
            >
              <label>
                Expressão{" "}
                <input
                  aria-label="Expressão"
                  maxLength={60}
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <button type="submit">Compilar expressão</button>
              <small>
                Inteiros, +, * e parênteses. Aplicar reinicia a execução.
              </small>
            </form>
          )}
          {id === "architecture" && (
            <label>
              Réplicas indisponíveis{" "}
              <select
                aria-label="Réplicas indisponíveis"
                value={settings.offline}
                onChange={(e) => configure({ offline: Number(e.target.value) })}
              >
                <option value={0}>Nenhuma · 3 nós online</option>
                <option value={1}>Uma · 2 nós online</option>
                <option value={2}>Duas · só o líder online</option>
              </select>
            </label>
          )}
          <p>
            Alterar condições reinicia a bancada. Tudo roda neste navegador.
          </p>
        </fieldset>
        {run.error && (
          <p className="workshop-error" role="alert">
            Não foi possível compilar: {run.error}
          </p>
        )}
      </ExploreStage>
      <details className="history">
        <summary>Histórico do experimento · {index} transições</summary>
        {run.steps.slice(1, index + 1).map((s, i) => (
          <p key={i}>
            {i + 1}. {s.log}
          </p>
        ))}
      </details>
    </div>
  );
}
