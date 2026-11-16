const LC_PLAN = [
  ["A", "Maxwell's equations", "Which equations does the solver actually use?"],
  ["A", "From time to frequency", "Why can we study one colour at a time, and what is a mode?"],
  ["B", "Why time domain", "Why FDTD and not a frequency-domain solver?"],
  ["B", "The Yee grid", "Where do E and H live on the grid, and why are they shifted?"],
  ["B", "The leapfrog", "How do the fields move in time, and how big can the time step be?"],
  ["B", "Mesh size", "How fine must the grid be, and where does an 11.38 nm cell come from?"],
  ["C", "Structures and materials", "How does the geometry become a permittivity on the grid?"],
  ["C", "The source in space", "How are the input mode and the fiber beam launched?"],
  ["C", "The source in time", "What is inside the Gaussian pulse?"],
  ["C", "Boundaries: PML", "How does a finite box behave like open space?"],
  ["C", "Monitors and the Fourier transform", "How does one run give 101 wavelengths?"],
  ["C", "Run time and shutoff", "How long must the simulation run?"],
  ["C", "Symmetry planes", "How do mirror planes halve the cost?"],
  ["D", "Design parameters and figure of merit", "What exactly is optimized?"],
  ["D", "Maxwell as A x = b", "What are A, x, b and p?"],
  ["D", "The adjoint method and its source", "How is the adjoint source defined?"],
  ["D", "Gradient, Adam and the full loop", "What happens in one optimization step?"]
];
const LC_DONE = 3;
const LC_PARTS = { A: ["Part A", "The physics", "blue"], B: ["Part B", "The solver", "teal"], C: ["Part C", "One simulation", "purple"], D: ["Part D", "Inverse design", "coral"] };

addLesson("thesis", "lec", {
level: "Start here", num: "Roadmap",
id: "thesis-lec-l0", title: "From Maxwell to the adjoint method in 17 lessons", short: "Roadmap",
big: String.raw`This series builds the whole method from the beginning, one question at a time, in the order the ideas depend on each other. Part A is the physics: Maxwell's equations and what changes when we look at one frequency. Part B is the solver: why FDTD, the Yee grid, the time step and the mesh. Part C is one simulation in the order it is built: geometry, sources, PML, monitors, run time and symmetry. Part D is inverse design: the parameters, the linear system \(A\mathbf{x} = \mathbf{b}\), the adjoint source, and the full loop. Lessons are added as they are learned. Questions asked along the way are collected in their own lesson.`,
bridge: "Plain words first, then only the equations that are really needed. Each card ends with a sentence to say out loud. The deeper versions of the same topics are in the Chapter 2 and Chapter 3 parts of this shelf.",
cards: [
{s: "1. The map", t: "Seventeen questions in four parts",
intu: String.raw`Move the slider through the lessons. Each lesson answers one question, and each part builds on the one before. The filled boxes are the lessons already on the site. Part A gives the equations, Part B turns them into a computer method, Part C builds one real simulation, and Part D wraps the optimization around it.`,
eq: String.raw`\[ \underbrace{\text{Maxwell}}_{\text{A}} \;\rightarrow\; \underbrace{\text{FDTD}}_{\text{B}} \;\rightarrow\; \underbrace{\text{one simulation}}_{\text{C}} \;\rightarrow\; \underbrace{\text{adjoint loop}}_{\text{D}} \]`,
sym: [["Part A", "physics: Lessons 1 and 2"], ["Part B", "the solver: Lessons 3 to 6"], ["Part C", "one simulation: Lessons 7 to 13"], ["Part D", "inverse design: Lessons 14 to 17"]],
how: ["Start from the equations that describe light.", "Turn them into an algorithm a computer can step.", "Build one simulation piece by piece.", "Use two such simulations per step to optimize the device."],
say: "The method has four layers: Maxwell's equations, the FDTD solver, one simulation built from geometry, sources, boundaries and monitors, and the adjoint loop that uses two simulations per step.",
num: "17 lessons. Lessons 1 to 3 are on the site, plus the questions lesson. The rest follow in order.",
r(fig, ctl) {
  ctl.innerHTML = sl("lp", "Lesson", 1, 17, 1, 1) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const k = +$("lp").value; $("lpv").textContent = k;
    let s = "", x = 10;
    const groups = ["A", "B", "C", "D"];
    groups.forEach(g => {
      const idx = LC_PLAN.map((p, i) => [p, i]).filter(([p]) => p[0] === g), w = 20 + idx.length * 30, [lab, sub, cls] = LC_PARTS[g];
      s += `<text class="th" x="${x + w / 2}" y="22" text-anchor="middle">${lab}</text><text class="ts" x="${x + w / 2}" y="40" text-anchor="middle">${sub}</text>`;
      idx.forEach(([, i], j) => {
        const bx = x + 10 + j * 30, by = 56, done = i < LC_DONE, cur = i === k - 1;
        s += `<g class="c-${cls}"><rect x="${bx}" y="${by}" width="26" height="26" rx="6" stroke-width="${cur ? 3 : 1.2}" fill-opacity="${done ? 1 : 0.25}"/></g><text class="ts" x="${bx + 13}" y="${by + 18}" text-anchor="middle" style="fill:var(--fg)">${i + 1}</text>`;
      });
      x += w + 14;
    });
    const p = LC_PLAN[k - 1];
    s += `<text class="th" x="340" y="128" text-anchor="middle">Lesson ${k}: ${p[1]}</text><text class="t" x="340" y="152" text-anchor="middle">${p[2]}</text>`;
    s += `<text class="ts" x="340" y="182" text-anchor="middle">${k <= LC_DONE ? "on the site now" : "coming next as we learn it"}</text>`;
    fig.innerHTML = svg(196, s);
    $("ro").innerHTML = `<div><span>part</span><b>${LC_PARTS[p[0]][1]}</b></div><div><span>status</span><b>${k <= LC_DONE ? "done" : "planned"}</b></div>`;
  };
  $("lp").oninput = u; u();
}},

{s: "2. The chain", t: "What inverse design does, link by link",
intu: String.raw`Step through the chain. You change the design parameters \(\mathbf{p}\). They set the permittivity \(\varepsilon_r\) in the design region. Maxwell's equations with that \(\varepsilon_r\) give the fields. The fields give the figure of merit \(F\), for example the power in the output mode. The adjoint method gives the slope of \(F\) for every parameter at once, and the optimizer moves \(\mathbf{p}\) uphill. Each link is one lesson.`,
eq: String.raw`\[ \mathbf{p} \;\rightarrow\; \varepsilon_r(\mathbf{r};\mathbf{p}) \;\rightarrow\; \mathbf{E},\mathbf{H} \;\rightarrow\; F \;\rightarrow\; \frac{\partial F}{\partial \mathbf{p}} \;\rightarrow\; \text{new } \mathbf{p} \]`,
sym: [[String.raw`\(\mathbf{p}\)`, "design parameters: pixels, vertices or grating widths"], [String.raw`\(\varepsilon_r\)`, "relative permittivity, the only place the device enters Maxwell's equations"], [String.raw`\(F\)`, "figure of merit, for example the transmission into the output mode"], [String.raw`\(\partial F/\partial \mathbf{p}\)`, "gradient: how F changes with every parameter"]],
how: [String.raw`Parameters to permittivity: Lessons 7 and 14.`, "Permittivity to fields: Lessons 1 to 13 (one FDTD simulation).", "Fields to figure of merit: Lessons 11 and 14.", "Figure of merit to gradient: Lessons 15 and 16 (adjoint).", "Gradient to new parameters: Lesson 17 (Adam)."],
say: "Inverse design changes the permittivity through the parameters, computes the fields with FDTD, measures the figure of merit, gets its gradient from one extra adjoint simulation, and updates the parameters.",
num: "Per optimization step and per input: one forward and one adjoint simulation, whatever the number of parameters.",
r(fig, ctl) {
  const B = [["parameters", "p", "gray", "L 7, 14"], ["permittivity", "εr(r; p)", "blue", "L 7"], ["FDTD fields", "E, H", "teal", "L 1 to 13"], ["figure of merit", "F", "purple", "L 11, 14"], ["gradient", "∂F/∂p", "coral", "L 15, 16"], ["update", "Adam", "gray", "L 17"]];
  const cap = ["You choose the parameters. At the start they describe a simple device that already partly works.", "The parameters set the permittivity in the design region. This is the only way the design enters the physics.", "One FDTD simulation solves Maxwell's equations with that permittivity and gives the fields everywhere.", "The fields at the output monitor give the figure of merit, for example the power in the output mode.", "One adjoint simulation gives the slope of F with respect to every parameter at once.", "The optimizer moves every parameter a little uphill, and the loop starts again."];
  LC.steps(ctl, 6, k => {
    let s = "";
    const P = [[20, 20], [250, 20], [480, 20], [480, 140], [250, 140], [20, 140]];
    B.forEach((b, i) => { const [x, y] = P[i]; s += LC.box(x, y, 180, 62, [b[0], b[1]], b[2], i > k) + `<text class="ts" x="${x + 90}" y="${y + 78}" text-anchor="middle" opacity="${i > k ? 0.3 : 1}">${b[3]}</text>`; });
    const on = i => i < k ? 1 : 0.25;
    s += `<g opacity="${on(0)}">${arrow(200, 51, 248, 51, "var(--p)", 1.6)}</g><g opacity="${on(1)}">${arrow(430, 51, 478, 51, "var(--p)", 1.6)}</g><g opacity="${on(2)}">${arrow(630, 84, 630, 138, "var(--p)", 1.6)}</g><g opacity="${on(3)}">${arrow(478, 171, 432, 171, "var(--p)", 1.6)}</g><g opacity="${on(4)}">${arrow(248, 171, 202, 171, "var(--p)", 1.6)}</g>`;
    if (k === 5) s += `${arrow(45, 138, 45, 84, "var(--coral)", 2)}<text class="ts" x="340" y="235" text-anchor="middle">repeat until F stops improving</text>`;
    fig.innerHTML = svg(245, s);
    return cap[k];
  });
}}
],
summary: String.raw`The series goes from Maxwell's equations (Part A) to the FDTD solver (Part B), to one simulation built piece by piece (Part C), to the adjoint optimization loop (Part D). The chain to remember is parameters, permittivity, fields, figure of merit, gradient, update. One forward and one adjoint simulation give the gradient for all parameters.`,
sheet: [
[String.raw`\[ \mathbf{p} \rightarrow \varepsilon_r \rightarrow \mathbf{E},\mathbf{H} \rightarrow F \rightarrow \partial F/\partial\mathbf{p} \]`, "The inverse design chain"]],
sources: ["Ch. 2 Sec. 2.6 and Ch. 3 of the thesis (method only)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018)", "Taflove and Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed., Artech House (2005)"]
});
