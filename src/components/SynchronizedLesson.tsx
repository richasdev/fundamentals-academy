import { lazy, Suspense, useMemo, useState } from "react";
import type { LabId } from "../content/lessons";
import { lessonFrames } from "../simulators/lessonScenes";
const Workshop3D = lazy(() => import("./Workshop3D"));
export default function SynchronizedLesson({
  id,
  chapter,
  step,
}: {
  id: LabId;
  chapter: number;
  step: number;
}) {
  const frames = useMemo(() => lessonFrames(id, chapter), [id, chapter]);
  const frame = frames[step];
  const [replay, setReplay] = useState(0),
    [pauseSignature, setPauseSignature] = useState(""),
    [three, setThree] = useState(true);
  const [arrival, setArrival] = useState("");
  // A revisited step is a new visual run; preserve the user's camera position.
  const [visit, setVisit] = useState({ step, serial: 0 });
  if (visit.step !== step) setVisit({ step, serial: visit.serial + 1 });
  const signature = `${id}-${chapter}-${step}-${visit.serial}-${replay}`;
  const paused = pauseSignature === signature;
  const arrived = signature === arrival;
  const complete = arrived || !three;
  const receiver = frame.step.flow?.receiver;
  const values = { ...frame.step.values };
  if (!complete && receiver)
    values[receiver] =
      frames[step - 1]?.step.values[receiver] || "aguarda dado";
  return (
    <section
      className="synchronized-lesson"
      aria-label="Modelo do passo explicado"
      data-step={step + 1}
      data-focus={frame.focus.join(",")}
    >
      <div className="lesson-scene-toolbar">
        <span>
          Passo {step + 1} · {three ? "3D" : "Diagrama"}
        </span>
        <button
          onClick={() => {
            setThree((v) => !v);
            setReplay((r) => r + 1);
          }}
        >
          {three ? "Ver diagrama do passo" : "Ver modelo 3D"}
        </button>
      </div>
      {three ? (
        <Suspense fallback={<p>Carregando modelo…</p>}>
          <Workshop3D
            nodes={frame.nodes}
            step={{ ...frame.step, values }}
            speed={0.8}
            paused={paused}
            replay={signature}
            onArrival={() => setArrival(signature)}
            arrived={arrived}
            focus={frame.focus}
          />
        </Suspense>
      ) : (
        <div className="lesson-node-list">
          {frame.nodes.map((n) => (
            <div
              key={n.id}
              className={frame.focus.includes(n.id) ? "focused" : ""}
            >
              <strong>{n.label}</strong>
              <code>{frame.step.values[n.id] || "—"}</code>
            </div>
          ))}
        </div>
      )}
      <div className="lesson-data-transfer" aria-live="polite">
        {frame.step.flow && (
          <>
            <strong>
              {frame.step.flow.source} → {frame.step.flow.target}
            </strong>
            <code>{frame.step.flow.payload}</code>
            <span
              data-delivery={
                arrived || !three
                  ? frame.step.flow.lost
                    ? "lost"
                    : "received"
                  : "transit"
              }
            >
              {arrived || !three
                ? frame.step.flow.lost
                  ? "Sem entrega"
                  : `Recebido por ${frame.step.flow.target}`
                : "Em trânsito"}
            </span>
          </>
        )}
      </div>
      <div className="lesson-motion-controls">
        <button
          disabled={!three}
          onClick={() => setPauseSignature(paused ? "" : signature)}
        >
          {paused ? "Continuar fluxo" : "Pausar fluxo"}
        </button>
        <button onClick={() => setReplay((r) => r + 1)}>
          Repetir este fluxo
        </button>
      </div>
      <dl className="lesson-state-values">
        {frame.nodes
          .filter(
            (n) =>
              frame.focus.includes(n.id) || frame.step.flow?.receiver === n.id,
          )
          .map((n) => (
            <div
              key={n.id}
              data-component={n.id}
              data-highlight={
                complete && frame.step.flow?.receiver === n.id
                  ? "received"
                  : frame.focus.includes(n.id)
                    ? "focus"
                    : "waiting"
              }
            >
              <dt>{n.label}</dt>
              <dd>
                <code>{values[n.id] || "—"}</code>
              </dd>
            </div>
          ))}
      </dl>
      {id === "database" && chapter === 2 && (
        <p className="scene-model-note">
          Esquema lógico da confirmação: o WAL registra mudanças e COMMIT. As
          páginas de dados podem ser gravadas depois; a seta final representa o
          estado confirmado, não uma ordem física de escrita em disco.
        </p>
      )}
    </section>
  );
}
