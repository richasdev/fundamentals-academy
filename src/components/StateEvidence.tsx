import { useState } from "react";
export default function StateEvidence({
  values,
  before,
  pending = false,
}: {
  values: Record<string, string>;
  before?: Record<string, string>;
  pending?: boolean;
}) {
  const [reference, setReference] = useState<Record<string, string> | null>(
    null,
  );
  return (
    <section className="state-evidence" aria-label="Evidências da etapa">
      <h4>{pending ? "Transferência em curso" : "Estado observado"}</h4>
      <p>
        {pending
          ? "Os componentes mantêm o estado anterior até a mensagem chegar. A animação representa uma transferência lógica."
          : "Compare o que mudou e o que permaneceu igual nesta etapa."}
      </p>
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>{reference ? "Referência salva" : "Antes"}</th>
            <th>Agora</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(values).map(([key, value]) => (
            <tr key={key} data-changed={(reference || before)?.[key] !== value}>
              <th scope="row">{key}</th>
              <td>
                <code>{(reference || before)?.[key] ?? "—"}</code>
              </td>
              <td>
                <code>{value}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setReference({ ...values })}>
        Salvar estado para comparar
      </button>
      {reference && (
        <button onClick={() => setReference(null)}>Limpar comparação</button>
      )}
    </section>
  );
}
