import { describe, expect, it } from "vitest";
import { buildWorkshop, compileExpression, defaultSettings, gateValue } from "./workshops";
import { chapterTitles, labIds, lessons } from "../content/lessons";
const build = (id: Parameters<typeof buildWorkshop>[0], patch = {}) => buildWorkshop(id, {...defaultSettings,...patch});
describe("nove trilhas completas", () => {
  it("cada trilha tem três aulas, fontes, limites e uma resposta correta válida", () => {
    expect(labIds).toHaveLength(9);
    for (const id of labIds) {
      expect(chapterTitles[id]).toHaveLength(3);
      expect(lessons[id].concept.length).toBeGreaterThan(100);
      expect(lessons[id].deep.length).toBeGreaterThan(100);
      expect(lessons[id].practical.length).toBeGreaterThan(100);
      expect(lessons[id].answers[lessons[id].correct]).toBeTruthy();
      expect(lessons[id].sources.length).toBeGreaterThan(0);
      expect(lessons[id].limitations).toBeTruthy();
    }
  });
});
describe("modelos das novas bancadas", () => {
  it("calcula todas as combinações das portas", () => {
    for (const a of [0,1]) for (const b of [0,1]) {
      expect(gateValue("NAND",a,b)).toBe(Number(!(a&&b)));
      expect(gateValue("AND",a,b)).toBe(Number(!!(a&&b)));
      expect(gateValue("OR",a,b)).toBe(Number(!!(a||b)));
      expect(gateValue("XOR",a,b)).toBe(Number(a!==b));
    }
    expect(build("logic").steps.at(-1)?.result).toBe("Y = 0");
  });
  it("round-robin respeita fila, quantum e conserva trabalho", () => {
    for (const quantum of [1,2,3]) {
      const run = build("os",{quantum});
      const dispatches = run.steps.filter(s=>s.title.startsWith("Despachar"));
      expect(dispatches.map(s=>s.flow?.payload.split(" · ")[0])).toEqual(quantum === 1 ? ["P1","P2","P3","P1","P2","P1"] : quantum === 2 ? ["P1","P2","P3","P1"] : ["P1","P2","P3"]);
      expect(run.steps.at(-1)?.result).toBe("Todos concluídos em t=6");
      expect(run.steps.at(-1)?.values).toMatchObject({p1:"0 restantes",p2:"0 restantes",p3:"0 restantes",queue:"vazia"});
    }
  });
  it("cache reduz visitas à origem e balanceador evita instância offline", () => {
    expect(build("infra").steps.at(-1)?.result).toBe("1 visitas à origem · 1 HIT");
    const noCache = build("infra",{cache:false});
    expect(noCache.steps.filter(s=>s.flow?.payload.startsWith("GET") && ["a","b"].includes(s.flow.receiver || "")).map(s=>s.flow?.receiver)).toEqual(["a","b"]);
    const down = build("infra",{cache:false,offline:1});
    expect(down.steps.some(s=>s.flow?.receiver === "a")).toBe(false);
    expect(down.steps.at(-1)?.result).toBe("2 visitas à origem · 0 HIT");
  });
  it("índice mantém resultado da varredura inclusive em chaves ausentes", () => {
    for (let key = 0; key <= 24; key++) {
      const indexed = build("database",{key,indexed:true});
      const scan = build("database",{key,indexed:false});
      expect(indexed.steps.at(-1)?.values.query).toBe(scan.steps.at(-1)?.values.query);
      expect(indexed.steps.filter(s=>s.title.startsWith("Ler página"))).toHaveLength(1);
    }
    expect(build("database").steps.at(-1)?.result).toBe("1 linha · 1 página(s) de dados + raiz");
    expect(build("database",{indexed:false}).steps.at(-1)?.result).toBe("1 linha · 3 página(s) de dados");
    expect(build("database",{key:7}).steps.at(-1)?.values.query).toBe("0 linhas");
  });
  it("compila precedência, parênteses e mantém snapshots da VM independentes", () => {
    expect(compileExpression("2+3*4").ast).toBe("ADD(2, MUL(3, 4))");
    expect(build("compiler").steps.at(-1)?.result).toBe("Resultado = 14");
    const other = build("compiler",{expression:"(2+3)*4"});
    expect(other.steps.at(-1)?.result).toBe("Resultado = 20");
    expect(other.steps.find(s=>s.title === "VM · 1")?.values.vm).toBe("[2]");
  });
  it("rejeita sintaxe inválida, código externo e inteiros inseguros", () => {
    for (const expression of ["", "2+", "2 3", "(2+3", "2+3)", "2**3", "alert(1)", "1.2", "1000", "999*999*999*999*999*999"]) {
      expect(()=>compileExpression(expression)).toThrow();
      expect(build("compiler",{expression}).error).toBeTruthy();
    }
  });
  it("só confirma a escrita após maioria e não conta mensagens perdidas", () => {
    for (const offline of [0,1,2]) {
      const run = build("architecture",{offline});
      expect(run.steps.filter(s=>s.title === "Receber ACK")).toHaveLength(2-offline);
      expect(run.steps.filter(s=>s.flow?.lost)).toHaveLength(offline);
      for (const s of run.steps.filter(s=>s.flow?.lost)) expect(s.flow?.receiver).toBeUndefined();
      expect(run.steps.at(-1)?.values.api).toBe(offline === 2 ? "503 · pendente" : "COMMIT x=42");
      expect(run.steps.slice(0,-1).some(s=>s.values.api.includes("COMMIT"))).toBe(false);
    }
  });
  it("cada fluxo aponta para um nó existente e a geração é determinística", () => {
    for (const id of ["logic","os","infra","database","compiler","architecture"] as const) {
      const run = build(id);
      expect(build(id)).toEqual(run);
      for (const s of run.steps) if (s.flow && !s.flow.lost) expect(run.nodes.some(n=>n.id === s.flow?.receiver)).toBe(true);
    }
  });
});
