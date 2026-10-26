import { createContext, useContext } from "react";
import type { LabId } from "../content/lessons";
import type { PracticeRequest } from "../content/practice";
import { studySessions } from "../content/studySessions";
export const GuideSlot = createContext<{
  id: LabId;
  onBack?: (chapter: number) => void;
} | null>(null);
export const SimulationActive = createContext(true);
export const PracticeContext = createContext<PracticeRequest | null>(null);
export function PracticeGuide({
  id,
  onBack,
}: {
  id: LabId;
  onBack?: (chapter: number) => void;
}) {
  const request = useContext(PracticeContext);
  if (!request) return null;
  const experiment =
    studySessions[id].modules[request.chapter].experiments[request.experiment];
  return (
    <details className="practice-guide" open>
      <summary>Investigação · {experiment.title}</summary>
      <p>
        Os parâmetros iniciais desta atividade foram preparados. Siga o roteiro;
        as partes em papel continuam identificadas nas instruções.
      </p>
      <ol>
        {experiment.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <details>
        <summary>Resultado esperado e limites</summary>
        <p>{experiment.expected}</p>
      </details>
      {onBack && (
        <button onClick={() => onBack(request.chapter)}>
          Voltar à explicação desta aula
        </button>
      )}
    </details>
  );
}
