import StudyNotebook from "./StudyNotebook";
import GuidedExplanation from "./GuidedExplanation";
import { teachingGuides } from "../content/teachingGuides";
import type { LabId } from "../content/lessons";
import { chapterDetails } from "../content/chapterDetails";
export default function DetailedChapter({
  id,
  chapter,
  onExplore,
}: {
  id: LabId;
  chapter: number;
  onExplore?: () => void;
}) {
  const detail = chapterDetails[id][chapter];
  return (
    <div className="chapter-detail">
      <div className="chapter-objective">
        <span>OBJETIVO DESTA AULA</span>
        <p>{detail.objective}</p>
      </div>
      <GuidedExplanation
        key={`${id}-${chapter}`}
        guide={teachingGuides[id][chapter]}
        id={id}
        chapter={chapter}
      />
      <details className="technical-depth">
        <summary>Quero aprofundar: {detail.heading}</summary>
        <p>{detail.explanation}</p>
      </details>
      <div className="worked-example">
        <h4>Exemplo comentado</h4>
        <pre>
          <code>{detail.code}</code>
        </pre>
      </div>
      <div className="trace-scroll">
        <table className="lesson-trace">
          <caption>Acompanhe o raciocínio</caption>
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Estado / valor</th>
              <th>Por que isso acontece</th>
            </tr>
          </thead>
          <tbody>
            {detail.trace.map(([stage, value, reason]) => (
              <tr key={stage}>
                <th scope="row">{stage}</th>
                <td>
                  <code>{value}</code>
                </td>
                <td>{reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="misconception">
        <h4>Erro comum</h4>
        <p>{detail.mistake}</p>
      </aside>
      <section className="chapter-exercise" aria-label="Exercício desta aula">
        <span className="section-label">PAUSE E FAÇA UMA PREVISÃO</span>
        <h4>{detail.exercise}</h4>
        <details>
          <summary>Ver resolução comentada</summary>
          <p>{detail.solution}</p>
        </details>
      </section>
      <StudyNotebook
        key={`${id}-${chapter}`}
        id={id}
        chapter={chapter}
        onExplore={onExplore}
      />
      <aside className="lab-observation">
        <h4>O que observar no laboratório</h4>
        <p>{detail.observation}</p>
      </aside>
    </div>
  );
}
