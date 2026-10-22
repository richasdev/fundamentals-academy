import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import {
  Sun,
  Moon,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Download,
  Globe2,
  Layers,
  Menu,
  Network,
  Search,
  Terminal,
  Upload,
  X,
  GraduationCap,
  FlaskConical,
} from "lucide-react";
import DevIntro from "./components/DevIntro";
import Simulator from "./components/Simulator";
import {
  lessons,
  modules,
  labIds,
  chapterTitles,
  type LabId,
} from "./content/lessons";
import { useAppearance } from "./theme";
import { useProgress } from "./store";
type Page = LabId | "map" | "glossary";
const labNames: Record<LabId, string> = {
  logic: "Bits e circuitos lógicos",
  os: "Processos, kernel e escalonamento",
  infra: "Cache, balanceamento e disponibilidade",
  database: "Páginas, índices e consultas",
  compiler: "Tokens, AST e máquina de pilha",
  architecture: "Sistemas, replicação e quórum",
  cpu: "Por dentro da CPU",
  memory: "Stack, heap e endereços",
  network: "A jornada de uma requisição",
};
const glossary = [
  ["Bit", "Estado binário; n bits representam 2ⁿ combinações.", "logic"],
  [
    "NAND",
    "Porta que produz zero somente quando ambas as entradas são um.",
    "logic",
  ],
  ["Quantum", "Limite de tempo de CPU por turno em round-robin.", "os"],
  ["Syscall", "Pedido de serviço de um programa ao kernel.", "os"],
  [
    "Cache",
    "Cópia reutilizável de uma resposta sob uma política de validade.",
    "infra",
  ],
  ["Balanceador", "Distribui requisições entre destinos disponíveis.", "infra"],
  [
    "Índice",
    "Estrutura adicional que ajuda a localizar registros.",
    "database",
  ],
  [
    "Transação",
    "Unidade de operações com garantias definidas pelo banco.",
    "database",
  ],
  [
    "AST",
    "Árvore sintática abstrata produzida pela análise do programa.",
    "compiler",
  ],
  ["Bytecode", "Instruções de uma máquina virtual.", "compiler"],
  [
    "Quórum",
    "Quantidade de confirmações exigida para uma decisão.",
    "architecture",
  ],
  [
    "C4",
    "Níveis de contexto, containers, componentes e código.",
    "architecture",
  ],
  [
    "Acumulador",
    "Registrador que recebe resultados das operações da nossa CPU.",
    "cpu",
  ],
  [
    "ALU",
    "Unidade lógica e aritmética: executa operações sobre valores.",
    "cpu",
  ],
  ["PC", "Contador de programa: endereço da próxima instrução.", "cpu"],
  ["IR", "Registrador que guarda a instrução em execução.", "cpu"],
  [
    "Stack",
    "Pilha: estrutura em que o último valor inserido é o primeiro removido.",
    "memory",
  ],
  [
    "Heap",
    "Região usada para alocações de memória com duração dinâmica.",
    "memory",
  ],
  ["Endereço", "Identificador de uma posição de memória.", "memory"],
  [
    "DNS",
    "Sistema distribuído que associa nomes a registros, incluindo endereços IP.",
    "network",
  ],
  [
    "TCP",
    "Protocolo de transporte que oferece um fluxo de bytes confiável e ordenado.",
    "network",
  ],
  [
    "HTTP",
    "Protocolo de aplicação para troca de requisições e respostas.",
    "network",
  ],
] as const;
function initialPage(): Page {
  const p = location.hash.slice(1);
  return [...labIds, "map", "glossary"].includes(p) ? (p as Page) : "cpu";
}
export default function App() {
  const { theme, setTheme } = useAppearance();
  const [page, setPage] = useState<Page>(initialPage),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false),
    [tab, setTab] = useState("explore"),
    [answer, setAnswer] = useState<number | null>(null),
    [feedback, setFeedback] = useState("");
  const { completed, complete, replace } = useProgress();
  const [chapter, setChapter] = useState(0);
  const contentRef = useRef<HTMLElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const navigate = (p: Page) => {
    setPage(p);
    location.hash = p;
    setQuery("");
    setMenu(false);
    setAnswer(null);
    setChapter(0);
    setTab("explore");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const handler = () => {
      setPage(initialPage());
      setAnswer(null);
      setChapter(0);
      setTab("explore");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (
      contentRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      animate(contentRef.current, {
        opacity: [0.5, 1],
        translateY: [6, 0],
        duration: 300,
        ease: "outQuad",
      });
  }, [page]);
  const isLab = (labIds as readonly string[]).includes(page);
  const id: LabId = isLab ? (page as LabId) : "cpu";
  const lesson = lessons[id];
  const exportProgress = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, completed }, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "fundamentals-progresso.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const importProgress = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (
        data.version !== 1 ||
        !Array.isArray(data.completed) ||
        !data.completed.every(
          (x: unknown) =>
            typeof x === "string" && (labIds as readonly string[]).includes(x),
        )
      )
        throw Error();
      replace([...new Set(data.completed)] as LabId[]);
      setFeedback("Progresso importado.");
    } catch {
      setFeedback(
        "Arquivo inválido. Selecione um JSON de progresso exportado pela plataforma.",
      );
    }
    if (importRef.current) importRef.current.value = "";
  };
  const results = glossary.filter((g) =>
    (g[0] + " " + g[1])
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <div className="app-shell">
        <aside className={`sidebar ${menu ? "open" : ""}`}>
          <a
            href="#map"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              navigate("map");
            }}
          >
            <span className="brand-symbol">
              <Terminal size={27} strokeWidth={1.7} />
            </span>
            <span>
              fundamentals<small>COMPUTER SCIENCE, EXPLAINED.</small>
            </span>
          </a>
          <div className="workspace-label">UM MUSEU PARA MEXER EM TUDO</div>
          <nav aria-label="Navegação principal">
            <button
              className={page === "map" ? "selected" : ""}
              onClick={() => navigate("map")}
            >
              <Compass size={18} /> Mapa do conhecimento
            </button>
            <button
              className={isLab ? "selected" : ""}
              onClick={() => navigate("cpu")}
            >
              <FlaskConical size={18} /> Laboratórios{" "}
              <span className="nav-count">09</span>
            </button>
            <button
              className={page === "glossary" ? "selected" : ""}
              onClick={() => navigate("glossary")}
            >
              <BookOpen size={18} /> Glossário{" "}
              <ArrowUpRight className="nav-end" size={14} />
            </button>
          </nav>
          <div className="side-divider" />
          <div className="section-label">
            TRILHAS DE APRENDIZADO <span>09</span>
          </div>
          <div className="module-list">
            {modules.map((m, i) => {
              const target = labIds[i];
              return (
                <button
                  key={m}
                  className={isLab && page === target ? "module-active" : ""}
                  onClick={() => navigate(target as Page)}
                >
                  <span className="module-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{m}</span>
                  {isLab && page === target ? (
                    <span className="module-indicator" />
                  ) : completed.includes(target) ? (
                    <Check size={13} />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="sidebar-bottom">
            <div className="progress-heading">
              <GraduationCap size={17} />
              <span>Seu progresso</span>
              <strong>
                {Math.round((completed.length / labIds.length) * 100)}%
              </strong>
            </div>
            <div className="progress-meter">
              <i
                style={{
                  width: `${(completed.length / labIds.length) * 100}%`,
                }}
              />
            </div>
            <p>{completed.length} de 9 trilhas concluídos</p>
            <div className="progress-actions">
              <button onClick={exportProgress} title="Exportar progresso">
                <Download size={14} /> Exportar
              </button>
              <button
                onClick={() => importRef.current?.click()}
                title="Importar progresso"
              >
                <Upload size={14} /> Importar
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => importProgress(e.target.files?.[0])}
              />
            </div>
            <p className="local-note">Salvo neste navegador. Sem cadastro.</p>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="menu-button"
                aria-label={menu ? "Fechar menu" : "Abrir menu"}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span>Explorar</span>
              <ChevronRight size={13} />
              <strong>
                {isLab
                  ? "Laboratórios"
                  : page === "map"
                    ? "Mapa do conhecimento"
                    : "Glossário"}
              </strong>
            </div>
            <div className="search-wrap">
              <Search size={15} />
              <input
                aria-label="Buscar conceitos"
                placeholder="Buscar um conceito…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>⌕</kbd>
              {query && (
                <div className="search-results">
                  <div className="section-label">CONCEITOS ENCONTRADOS</div>
                  {results.length ? (
                    results.map((g) => (
                      <button key={g[0]} onClick={() => navigate(g[2])}>
                        <span>
                          {g[0]}
                          <small>{g[1]}</small>
                        </span>
                        <ArrowUpRight size={14} />
                      </button>
                    ))
                  ) : (
                    <p>Nenhum conceito encontrado.</p>
                  )}
                </div>
              )}
            </div>
            <a
              className="source-link"
              href="https://www.nand2tetris.org/course"
              target="_blank"
              rel="noreferrer"
            >
              Aprenda por dentro <ArrowUpRight size={14} />
            </a>
            <button
              className="theme-toggle"
              aria-label={
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}{" "}
              {theme === "dark" ? "Escuro" : "Claro"}
            </button>
          </header>
          <main id="main" ref={contentRef}>
            <DevIntro
              context={isLab ? "lab" : page === "map" ? "map" : "glossary"}
              onExplore={() => {
                if (!isLab) navigate("cpu");
                requestAnimationFrame(() =>
                  document.getElementById("lab-workbench")?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  }),
                );
              }}
            />
            {isLab ? (
              <>
                <div
                  id="lab-workbench"
                  className="lab-navigation"
                  role="tablist"
                  aria-label="Escolher laboratório"
                >
                  {labIds.map((l, i) => {
                    const Icon = [
                      Code2,
                      Cpu,
                      Layers,
                      Terminal,
                      Network,
                      Globe2,
                      Layers,
                      Code2,
                      Network,
                    ][i];
                    return (
                      <button
                        role="tab"
                        aria-selected={id === l}
                        className={id === l ? "active" : ""}
                        onClick={() => navigate(l)}
                        key={l}
                      >
                        <Icon size={17} />
                        <span>
                          {
                            [
                              "Bits & lógica",
                              "CPU & execução",
                              "Memória",
                              "SO & Linux",
                              "Redes & HTTP",
                              "Infraestrutura",
                              "Bancos de dados",
                              "Compiladores",
                              "Arquitetura",
                            ][i]
                          }
                        </span>
                        <small>0{i + 1}</small>
                        {completed.includes(l) && <Check size={13} />}
                      </button>
                    );
                  })}
                  <span className="lab-navigation-note">
                    CONCEITOS REAIS. EXPERIÊNCIAS INTERATIVAS.
                  </span>
                </div>
                <div className="lesson-header">
                  <div>
                    <div className="lesson-eyebrow">
                      <span>LAB 0{labIds.indexOf(id) + 1}</span>{" "}
                      {lesson.eyebrow}
                    </div>
                    <h2>{lesson.title}</h2>
                    <p>{lesson.description}</p>
                  </div>
                  <span className="difficulty">
                    <i /> Fundamental <span>·</span> 3 aulas + laboratório +
                    desafio
                  </span>
                </div>
                <div className="lesson-tabs">
                  <button
                    className={tab === "explore" ? "active" : ""}
                    onClick={() => setTab("explore")}
                  >
                    <FlaskConical size={15} /> Explorar
                  </button>
                  <button
                    className={tab === "understand" ? "active" : ""}
                    onClick={() => setTab("understand")}
                  >
                    <BookOpen size={15} /> Entender o conceito
                  </button>
                  <button
                    className={tab === "challenge" ? "active" : ""}
                    onClick={() => setTab("challenge")}
                  >
                    <Code2 size={15} /> Desafio <span>1</span>
                  </button>
                </div>
                <div hidden={tab !== "explore"}>
                  <Simulator key={id} id={id} />
                </div>
                {tab === "understand" && (
                  <section className="reading-panel">
                    <span className="eyebrow">
                      AULA {chapter + 1} DE 3 · {lesson.eyebrow}
                    </span>
                    <nav
                      className="chapter-nav"
                      aria-label="Aulas desta trilha"
                    >
                      {chapterTitles[id].map((title, i) => (
                        <button
                          key={title}
                          aria-current={chapter === i ? "step" : undefined}
                          onClick={() => setChapter(i)}
                        >
                          <span>0{i + 1}</span>
                          {title}
                        </button>
                      ))}
                    </nav>
                    <h3>{chapterTitles[id][chapter]}</h3>
                    <p>
                      {[lesson.concept, lesson.deep, lesson.practical][chapter]}
                    </p>
                    <div className="chapter-actions">
                      <button
                        disabled={chapter === 0}
                        onClick={() => setChapter((c) => c - 1)}
                      >
                        ← Aula anterior
                      </button>
                      <button
                        onClick={() =>
                          chapter < 2
                            ? setChapter((c) => c + 1)
                            : setTab("challenge")
                        }
                      >
                        {chapter < 2 ? "Próxima aula →" : "Ir para o desafio →"}
                      </button>
                    </div>
                    <div className="experiment">
                      <h3>Investigue na bancada</h3>
                      <p>{lesson.challenge}</p>
                      <button onClick={() => setTab("explore")}>
                        Abrir laboratório <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="model-note">
                      <strong>Modelo didático e suas limitações</strong>
                      <p>{lesson.limitations}</p>
                    </div>
                  </section>
                )}
                {tab === "challenge" && (
                  <section className="reading-panel">
                    <span className="eyebrow">PRIMEIRO, FAÇA UMA PREVISÃO</span>
                    <h3>{lesson.quiz}</h3>
                    <div className="quiz-options">
                      {lesson.answers.map((a, i) => (
                        <button
                          key={a}
                          className={
                            answer === i
                              ? i === lesson.correct
                                ? "correct"
                                : "incorrect"
                              : ""
                          }
                          onClick={() => {
                            setAnswer(i);
                            if (i === lesson.correct) complete(id);
                          }}
                        >
                          {a}
                          {answer === i &&
                            (i === lesson.correct ? (
                              <Check size={18} />
                            ) : (
                              <X size={18} />
                            ))}
                        </button>
                      ))}
                    </div>
                    {answer !== null && (
                      <p role="status">
                        {answer === lesson.correct
                          ? "Correto! " + lesson.explanation
                          : "Tente novamente. Reveja as operações na simulação."}
                      </p>
                    )}
                    <div className="experiment">
                      <h3>Agora, experimente</h3>
                      <p>{lesson.challenge}</p>
                      <button onClick={() => setTab("explore")}>
                        Testar no laboratório <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                )}
                <div className="below-lab">
                  <div className="insight">
                    <span className="insight-symbol">↳</span>
                    <div>
                      <span className="section-label">
                        O QUE ESTÁ ACONTECENDO?
                      </span>
                      <h3>{lesson.question}</h3>
                      <p>{lesson.concept}</p>
                      <button
                        className="text-button"
                        onClick={() => setTab("understand")}
                      >
                        Entenda o mecanismo <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="next-experiment">
                    <span className="section-label">
                      PENSE. TESTE. DESCUBRA.
                    </span>
                    <h3>E se você mudasse as regras?</h3>
                    <p>{lesson.challenge}</p>
                    <button
                      className="text-button"
                      onClick={() => setTab("challenge")}
                    >
                      Aceitar o desafio <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
                <details className="references">
                  <summary>
                    Referências, modelo e revisão técnica{" "}
                    <span>FONTES ABERTAS ↗</span>
                  </summary>
                  <p>{lesson.limitations}</p>
                  {lesson.sources.map(([name, url]) => (
                    <a href={url} key={url} target="_blank" rel="noreferrer">
                      {name} <ArrowUpRight size={13} />
                    </a>
                  ))}
                  <p>
                    Revisão: 22/10/2026 · Explicações e diagramas originais.
                    Conceitos cobertos: {lesson.eyebrow.toLowerCase()}.
                  </p>
                </details>
                <div className="track-next">
                  <span>
                    {completed.includes(id)
                      ? "✓ Desafio concluído nesta trilha"
                      : "Conclua o desafio para registrar seu progresso"}
                  </span>
                  <button
                    onClick={() =>
                      navigate(labIds[(labIds.indexOf(id) + 1) % labIds.length])
                    }
                  >
                    Próxima trilha:{" "}
                    {modules[(labIds.indexOf(id) + 1) % labIds.length]}{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : page === "map" ? (
              <>
                <div className="map-intro">
                  <span className="section-label">
                    09 TRILHAS · 27 AULAS · 09 LABORATÓRIOS
                  </span>
                  <p>
                    Comece onde sua curiosidade levar. Pré-requisitos são
                    sugestões, e todos os laboratórios estão abertos.
                  </p>
                </div>
                <div className="knowledge-map">
                  {modules.map((m, i) => {
                    const lab = labIds[i];
                    return (
                      <article key={m} className="available">
                        <span className="map-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="eyebrow">
                            {i === 0
                              ? "COMECE PELO PRIMEIRO BIT"
                              : `CONEXÃO SUGERIDA: TRILHA ${String(i).padStart(2, "0")}`}
                          </span>
                          <h2>{m}</h2>
                          <p>
                            {labNames[lab]} · 3 aulas + laboratório + desafio
                          </p>
                        </div>
                        {
                          <button onClick={() => navigate(lab)}>
                            {completed.includes(lab) ? "Revisitar" : "Explorar"}{" "}
                            <ArrowUpRight size={18} />
                          </button>
                        }
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="glossary-list">
                {glossary.map(([term, definition, lab]) => (
                  <article key={term}>
                    <h2>{term}</h2>
                    <p>{definition}</p>
                    <button onClick={() => navigate(lab)}>
                      Ver no laboratório <ArrowUpRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
            )}
            <div className="mobile-progress">
              <span>Seu progresso: {completed.length} / 9 trilhas</span>
              <button onClick={exportProgress}>
                <Download size={13} /> Exportar
              </button>
              <button onClick={() => importRef.current?.click()}>
                <Upload size={13} /> Importar
              </button>
            </div>
            <footer>
              <span>
                <span className="footer-brand">&gt;_</span> Computação não é
                magia. É um sistema que você pode entender.
              </span>
              <span>
                Feito para explorar. Aberto para todos. <Globe2 size={13} />
              </span>
            </footer>
          </main>
        </div>
      </div>
      {feedback && (
        <div className="toast" role="status">
          {feedback}
          <button aria-label="Fechar mensagem" onClick={() => setFeedback("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
