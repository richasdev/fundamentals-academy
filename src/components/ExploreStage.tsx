import { GuideSlot, PracticeGuide } from "./PracticeGuide";
import {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  type ReactNode,
} from "react";

// Hardware scenes mount their live transfer readout next to the explanation.
export const ExploreReadout = createContext<HTMLElement | null>(null);
export default function ExploreStage({
  scene,
  explanation,
  children,
  controls,
  stepKey,
}: {
  stepKey?: string | number;
  scene: ReactNode;
  explanation: ReactNode;
  children: ReactNode;
  controls: ReactNode;
}) {
  const guide = useContext(GuideSlot);
  const [readout, setReadout] = useState<HTMLDivElement | null>(null);
  const details = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (details.current) details.current.scrollTop = 0;
  }, [stepKey]);
  return (
    <section className="explore-stage" aria-label="Exploração passo a passo">
      <ExploreReadout.Provider value={readout}>
        <div className="explore-visual-column">{scene}</div>
        <aside
          className="explore-explanation-column"
          aria-label="Explicação da etapa explorada"
        >
          <div className="explore-current-step">{explanation}</div>
          <div
            ref={details}
            className="explore-details"
            role="region"
            aria-label="Detalhes e parâmetros do experimento"
            tabIndex={0}
          >
            {guide && <PracticeGuide id={guide.id} onBack={guide.onBack} />}
            <div ref={setReadout} />
            {children}
          </div>
          <div className="explore-controls">{controls}</div>
        </aside>
      </ExploreReadout.Provider>
    </section>
  );
}
