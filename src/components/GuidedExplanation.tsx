import SynchronizedLesson from "./SynchronizedLesson";
import type { LabId } from "../content/lessons";
import { useState } from "react";
import type { TeachingGuide } from "../content/teachingGuides";
export default function GuidedExplanation({
  guide,
  id,
  chapter,
}: {
  guide: TeachingGuide;
  id: LabId;
  chapter: number;
}) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div className="guided-explanation">
      <section
        className="guided-walkthrough"
        aria-label="Explicação em três passos"
      >
        <h4>Execução explicada</h4>
        <SynchronizedLesson
          id={id}
          chapter={chapter}
          step={step}
          narration={guide.steps[step]}
          onStep={setStep}
        />
      </section>
      <section className="plain-explanation" aria-label="Explicação simples">
        <h4>Imagine uma situação do dia a dia</h4>
        <p>{guide.analogy}</p>
        <h4>Agora, ligue a ideia ao computador</h4>
        <p>{guide.connection}</p>
        <details className="analogy-boundary">
          <summary>Até onde essa comparação funciona?</summary>
          <p>{guide.boundary}</p>
        </details>
        <div className="why-this-matters">
          <h4>Por que aprender isso?</h4>
          <p>{guide.relevance}</p>
        </div>
      </section>
      <section className="quick-check" aria-label="Checagem de compreensão">
        <h4>{guide.question}</h4>

        <div
          className="quick-check-options"
          role="group"
          aria-label="Respostas da checagem"
        >
          {guide.choices.map((label, i) => (
            <button
              key={label}
              aria-pressed={answer === i}
              className={
                answer === i
                  ? i === guide.correct
                    ? "selected-correct"
                    : "selected-review"
                  : ""
              }
              onClick={() => setAnswer(i)}
            >
              <span aria-hidden="true">
                {answer === i ? (i === guide.correct ? "✓" : "↳") : i + 1}
              </span>
              {label}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div
            className={`quick-feedback ${answer === guide.correct ? "is-correct" : "needs-review"}`}
            role="status"
            aria-label="Feedback da checagem"
          >
            <strong>
              {answer === guide.correct
                ? "Isso mesmo."
                : "Vamos rever a ideia."}
            </strong>
            <p>{guide.feedback[answer]}</p>
          </div>
        )}
      </section>
      <section
        className="lesson-vocabulary"
        aria-label="Vocabulário desta aula"
      >
        <h4>Palavras que apareceram aqui</h4>

        <div>
          {guide.terms.map(([term, meaning]) => (
            <details key={term}>
              <summary>{term}</summary>
              <p>{meaning}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
