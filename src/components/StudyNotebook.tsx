import { useState } from "react";
import type { LabId } from "../content/lessons";
import { studySessions } from "../content/studySessions";
type Notes = {
  prediction: string;
  observed: string;
  reason: string;
  checked: boolean[];
};
const empty: Notes = {
  prediction: "",
  observed: "",
  reason: "",
  checked: [false, false],
};
function load(key: string): Notes {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return saved
      ? {
          prediction:
            typeof saved.prediction === "string" ? saved.prediction : "",
          observed: typeof saved.observed === "string" ? saved.observed : "",
          reason: typeof saved.reason === "string" ? saved.reason : "",
          checked: [saved.checked?.[0] === true, saved.checked?.[1] === true],
        }
      : empty;
  } catch {
    return empty;
  }
}
export default function StudyNotebook({
  id,
  chapter,
  onExplore,
}: {
  id: LabId;
  chapter: number;
  onExplore?: (experiment?: number) => void;
}) {
  const key = `fundamentals-notebook-v1-${id}-${chapter}`;
  const [notes, setNotes] = useState<Notes>(() => load(key)),
    [saveError, setSaveError] = useState(false);
  const module = studySessions[id].modules[chapter];
  const update = (patch: Partial<Notes>) => {
    const next = { ...notes, ...patch };
    setNotes(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };
  return (
    <section
      className="study-notebook"
      aria-label="Estudo e laboratório da aula"
    >
      {module.sections.map((section) => (
        <section key={section.title}>
          <h4>{section.title}</h4>
          <p>{section.text}</p>
        </section>
      ))}
      <section className="case-study">
        <h4>Problema para analisar</h4>
        <p>{module.caseStudy.question}</p>
        <details>
          <summary>Conferir o raciocínio</summary>
          <p>{module.caseStudy.analysis}</p>
        </details>
      </section>
      <section className="investigations">
        <h4>Laboratório orientado</h4>
        <p className="study-time">
          7–9 min: duas investigações e registro dos resultados.
        </p>
        {module.experiments.map((experiment, i) => (
          <article key={experiment.title}>
            <h5>
              {i + 1}. {experiment.title}
            </h5>
            <ol>
              {experiment.steps.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
            {onExplore && (
              <button className="open-practice" onClick={() => onExplore(i)}>
                Preparar esta investigação na bancada →
              </button>
            )}
            <details>
              <summary>Resultado esperado e limites</summary>
              <p>{experiment.expected}</p>
            </details>
            <label className="experiment-complete">
              <input
                type="checkbox"
                checked={!!notes.checked[i]}
                onChange={(e) =>
                  update({
                    checked: notes.checked.map((v, j) =>
                      j === i ? e.target.checked : v,
                    ),
                  })
                }
              />
              Investigação {i + 1} registrada
            </label>
          </article>
        ))}
        {onExplore && (
          <button className="open-practice" onClick={() => onExplore(0)}>
            Abrir bancada de experimentos →
          </button>
        )}
      </section>
      <fieldset className="notebook-fields">
        <legend>Caderno da aula</legend>
        {(
          [
            ["prediction", "Minha previsão"],
            ["observed", "Resultado observado"],
            ["reason", "Como explico a diferença"],
          ] as const
        ).map(([field, label]) => (
          <label key={field}>
            {label}
            <textarea
              value={notes[field]}
              onChange={(event) => update({ [field]: event.target.value })}
              rows={3}
            />
          </label>
        ))}
      </fieldset>
      <p className="notebook-save" role="status">
        {saveError
          ? "Não foi possível salvar neste navegador. Copie suas anotações antes de sair."
          : "Anotações salvas neste navegador."}
      </p>
      <section>
        <h4>Para explicar com suas palavras</h4>
        <p>{module.reflection}</p>
      </section>
      {chapter === 2 && (
        <section className="capstone">
          <h4>Síntese da trilha</h4>
          <p className="study-time">5–7 min</p>
          <p>{studySessions[id].capstone.brief}</p>
          <ol>
            {studySessions[id].capstone.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <details>
            <summary>Critérios para revisar sua resposta</summary>
            <p>{studySessions[id].capstone.rubric}</p>
          </details>
        </section>
      )}
    </section>
  );
}
