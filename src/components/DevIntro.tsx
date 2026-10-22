import { ArrowDown, ArrowUpRight } from "lucide-react";
import RetroDisplay from "./RetroDisplay";
export default function DevIntro({
  context,
  onExplore,
}: {
  context: "lab" | "map" | "glossary";
  onExplore: () => void;
}) {
  return (
    <section className="dev-intro" aria-label="Boas-vindas à Fundamentals">
      <div className="dev-intro-copy">
        <div className="dev-kicker">
          <span className="dev-status-dot" /> FUNDAMENTALS / INTERACTIVE CS{" "}
          <span>v0.2</span>
        </div>
        <div className="dev-command" aria-hidden="true">
          <span>guest@fundamentals</span> ~ $ ./explorar
        </div>
        <h1>
          {context === "lab"
            ? "Abra. Desmonte."
            : context === "map"
              ? "Do primeiro bit."
              : "Domine a linguagem."}
          <br />
          <em>
            {context === "lab"
              ? "Entenda o sistema."
              : context === "map"
                ? "Ao sistema inteiro."
                : "Explore os conceitos."}
            <span className="text-caret" aria-hidden="true">
              _
            </span>
          </em>
        </h1>
        <p>
          Computação por dentro, do jeito que dev aprende:
          <br className="desktop-break" /> experimentando, quebrando e
          entendendo o porquê.
        </p>
        <div className="dev-console-lines">
          <span>
            <b>[ok]</b> 9 trilhas. 27 aulas. 9 laboratórios 3D.
          </span>
          <span>
            <b>[ok]</b> Código aberto. Sem login. Sem paywall.
          </span>
        </div>
        <div className="dev-intro-actions">
          <button onClick={onExplore}>
            Entrar no laboratório <ArrowDown size={14} />
          </button>
          <a
            href="https://github.com/richasdev/fundamentals-academy"
            target="_blank"
            rel="noreferrer"
          >
            git://source <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="dev-bottom-note">
          <span>01 / OBSERVE</span>
          <span>02 / MODIFIQUE</span>
          <span>03 / ENTENDA</span>
        </div>
      </div>
      <RetroDisplay />
    </section>
  );
}
