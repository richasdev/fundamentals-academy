import { useState } from "react";
import type { TeachingGuide } from "../content/teachingGuides";
export default function GuidedExplanation({ guide }: { guide: TeachingGuide }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div className="guided-explanation">
      <section className="plain-explanation" aria-label="Explicação simples">
        <span className="section-label">PRIMEIRO, UMA IDEIA FAMILIAR</span>
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
      <section
        className="guided-walkthrough"
        aria-label="Explicação em três passos"
      >
        <span className="section-label">UMA MUDANÇA POR VEZ</span>
        <h4>Vamos acompanhar juntos</h4>
        <p className="guided-instruction">
          Leia um passo, imagine o que mudou e avance no seu ritmo. Você pode
          voltar para comparar.
        </p>
        <div
          className="guided-step-nav"
          role="group"
          aria-label="Escolher passo da explicação"
        >
          {guide.steps.map((_, i) => (
            <button
              key={i}
              aria-label={`Ver passo ${i + 1} da explicação`}
              aria-pressed={step === i}
              onClick={() => setStep(i)}
            >
              <span>0{i + 1}</span>
              {step === i
                ? "Você está aqui"
                : i < step
                  ? "Revisitar"
                  : "Explorar"}
            </button>
          ))}
        </div>
        <div className="guided-step" aria-live="polite" aria-atomic="true">
          <span>PASSO {step + 1} DE 3</span>
          <p>{guide.steps[step]}</p>
        </div>
        <div className="guided-step-actions">
          <button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            ← Passo anterior
          </button>
          <button disabled={step === 2} onClick={() => setStep((s) => s + 1)}>
            Próximo passo explicado →
          </button>
        </div>
        <p className="guided-instruction">
          Depois, compare essa explicação com o exemplo comentado e com a
          bancada em Explorar.
        </p>
      </section>
      <section className="quick-check" aria-label="Checagem de compreensão">
        <span className="section-label">
          CONFIRA A IDEIA ANTES DE CONTINUAR
        </span>
        <h4>{guide.question}</h4>
        <p>
          Escolha uma resposta para ver o raciocínio. Você pode tentar outra e
          comparar as explicações.
        </p>
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
        <p>Abra um termo para ver seu significado em linguagem simples.</p>
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
