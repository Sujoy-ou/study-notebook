addLesson("thesis", "ch3", {
level: "Foundations",
id: "thesis-ch3-l1", title: "The inverse design problem", short: "1. The design problem",
big: "In forward design you guess a geometry, simulate it and look at the result. Inverse design turns this around. You write down what the device should do as one number, the figure of merit, and let an optimizer change the geometry to make that number as large as possible. Each step needs the figure of merit and its gradient with respect to every design parameter. The adjoint method gives that gradient from just two simulations, however many parameters there are, which is what makes designs with thousands of free pixels possible. Penalty terms are subtracted from the figure of merit so that the optimizer is pushed away from shapes that cannot be fabricated. A gradient method finds a local optimum that depends on where it starts, so every device starts from a simple design that already works in part: a uniform grating, a linear taper or a Y-shaped splitter.",
bridge: "This lesson follows Ch. 3 Sec. 3.1, the design problem of Eq. (3.1), the loop of Fig. 3.1 and the starting devices, with the cost count of Sec. 3.2. The idea that design rules belong inside the optimization comes from Hammond et al. 2021 (Georgia Tech and MIT), a methods paper that adds foundry rules to photonic topology optimization. The cost argument for the adjoint method is from Michaels and Yablonovitch 2018 (UC Berkeley) and Lalau-Keraly et al. 2013.",
cards: [
/* from old ch3 L1 card 1 */
{s: "1. Forward and inverse", t: "Forward design versus inverse design",
intu: String.raw`Forward: a person draws a geometry, the simulator returns the fields, and the person reads off the performance and draws again. The loop runs through a human head, so only a few parameters can be explored. Inverse: the target is written as a figure of merit \(F\), and the loop runs through an optimizer that changes the geometry by itself. The human now decides what to ask for and where to start, not every shape. Switch between the two pictures.`,
eq: String.raw`<div class="eqnote">Forward design</div>\[ \mathbf{p} \;\longrightarrow\; \varepsilon(\mathbf{r};\mathbf{p}) \;\xrightarrow{\text{Maxwell}}\; \mathbf{E}(\mathbf{r}) \;\longrightarrow\; F(\mathbf{p}) \]<div class="eqnote">Inverse design</div>\[ \max_{\mathbf{p}}\; J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k\, P_k(\mathbf{p}) \]<div class="eqref">Ch. 3 Eq. (3.1)</div>`,
sym: [[String.raw`\(\mathbf{p}\)`, "vector of design parameters (widths, vertex moves, pixel densities)"], [String.raw`\(\varepsilon(\mathbf{r};\mathbf{p})\)`, "permittivity map that the parameters describe"], [String.raw`\(F\)`, "figure of merit computed from the simulated fields, for example the power in a target mode"], [String.raw`\(J\)`, "the objective the optimizer maximizes"]],
how: [String.raw`The simulation is the same in both cases: Maxwell's equations for a given \(\varepsilon(\mathbf{r})\).`, "Forward design asks what a geometry does.", "Inverse design asks which geometry does what we want.", "That question has no closed answer, so it is solved iteratively, one improving step at a time."],
say: "In inverse design the device function is written as a figure of merit, and a gradient-based optimizer changes the geometry to maximize it.",
num: String.raw`A forward search over 10 values for each of 18 parameters would need \(10^{18}\) simulations. A gradient-based optimizer typically needs tens to a few hundred steps of two simulations each.`,
r(fig, ctl) {
  let m = "inv";
  ctl.innerHTML = btns([["fwd", "Forward design"], ["inv", "Inverse design"]], "m");
  const box = (x, y, w, t, c) => `<g class="${c}"><rect x="${x}" y="${y}" width="${w}" height="46" rx="8"/></g><text class="th" x="${x + w / 2}" y="${y + 28}" text-anchor="middle">${t}</text>`;
  const u = () => {
    pick(ctl, "m", m);
    let s = box(30, 40, 140, "geometry ε(r)", "c-blue") + box(270, 40, 140, "Maxwell solver", "c-gray") + box(510, 40, 140, "performance F", "c-teal") + arrow(172, 63, 266, 63, "var(--p)") + arrow(412, 63, 506, 63, "var(--p)");
    if (m === "fwd") s += `<path d="M580 88 Q580 170 340 170 Q100 170 100 92" fill="none" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>${box(255, 148, 170, "a person redraws", "c-coral")}<text class="ts" x="340" y="226" text-anchor="middle">a few trial shapes, chosen by intuition</text>`;
    else s += `<path d="M580 88 Q580 170 340 170 Q100 170 100 92" fill="none" stroke="#1D9E75" stroke-width="2" marker-end="url(#ar)"/>${box(240, 148, 200, "gradient + optimizer", "c-purple")}<text class="ts" x="340" y="226" text-anchor="middle">the target is fixed, the geometry follows: J = F − Σ w<tspan baseline-shift="sub" font-size="9">k</tspan> P<tspan baseline-shift="sub" font-size="9">k</tspan></text>`;
    fig.innerHTML = svg(240, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

/* from old ch3 L1 card 2 */
{s: "2. The loop", t: "One optimization step, stage by stage",
intu: String.raw`Every device in the thesis is designed with the same loop (Ch. 3 Fig. 3.1). The parameters build a geometry. A forward simulation gives the fields and the figure of merit. An adjoint simulation, with a source placed where the light should arrive, gives a second set of fields. Their overlap gives the gradient with respect to every parameter. The optimizer turns the gradient into a step, and the loop repeats until \(F\) stops improving. Step through the stages.`,
eq: String.raw`\[ \mathbf{p}^{(k)} \to \varepsilon \to \mathbf{E}_{\mathrm{fwd}},\, F \to \mathbf{E}_{\mathrm{adj}} \to \frac{\partial J}{\partial \mathbf{p}} \to \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \Delta\mathbf{p}\!\left(\frac{\partial J}{\partial \mathbf{p}}\right) \]`,
sym: [[String.raw`\(k\)`, "iteration number"], [String.raw`\(\mathbf{E}_{\mathrm{fwd}}\)`, "fields of the forward simulation (source at the input)"], [String.raw`\(\mathbf{E}_{\mathrm{adj}}\)`, "fields of the adjoint simulation (source at the output monitor)"], [String.raw`\(\Delta\mathbf{p}\)`, "the step chosen by the optimizer, here Adam (Lesson 13)"]],
how: ["Forward simulation: needed anyway to know how good the design is.", "Adjoint simulation: one more run of the same structure with a different source (Lessons 2 and 3).", "Gradient: an overlap of the two field sets, then the chain rule back to the parameters.", "Penalties depend only on the geometry, so their gradients need no simulation."],
say: "Each iteration needs one forward and one adjoint simulation, and the gradient with respect to all parameters comes from the overlap of their fields.",
num: "With two input polarizations, as for a polarization splitter, each step needs two forward and two adjoint simulations.",
r(fig, ctl) {
  const S = [["parameters p", "the numbers the optimizer controls"], ["geometry ε(r; p)", "widths, outlines or pixel densities become a permittivity map"], ["forward run", "source at the input, record E_fwd and the mode amplitudes"], ["figure of merit", "F from the mode overlap, minus the penalties: J"], ["adjoint run", "source at the output monitor, record E_adj"], ["gradient", "overlap of E_fwd and E_adj, chain rule back to p"], ["optimizer step", "Adam turns ∂J/∂p into a step Δp"]];
  let k = 0;
  ctl.innerHTML = `<div class="row"><button id="b">Back</button><button id="n">Next stage</button><button id="pl">Play</button></div>`;
  const u = () => {
    const cx = 340, cy = 130, R = 92; let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)" stroke-dasharray="4 4"/>`;
    S.forEach(([t], i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / S.length, x = cx + 1.62 * R * Math.cos(a), y = cy + 1.0 * R * Math.sin(a); s += `<g class="${i === k ? "c-coral" : "c-gray"}"><rect x="${x - 72}" y="${y - 17}" width="144" height="34" rx="8" stroke-width="${i === k ? 1.8 : 0.6}"/></g><text class="th" x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:13px">${t}</text>`; });
    const a = -Math.PI / 2 + (k + 0.5) * 2 * Math.PI / S.length;
    s += `<circle cx="${cx + R * Math.cos(a)}" cy="${cy + R * Math.sin(a)}" r="6" fill="#D85A30"/><text class="ts" x="${cx}" y="${cy - 4}" text-anchor="middle">iteration k</text><text class="ts" x="${cx}" y="${cy + 14}" text-anchor="middle">→ k + 1</text><text class="ts" x="340" y="262" text-anchor="middle">${S[k][1]}</text>`;
    fig.innerHTML = svg(275, s);
  };
  let timer = null;
  $("b").onclick = () => { k = (k + S.length - 1) % S.length; u(); }; $("n").onclick = () => { k = (k + 1) % S.length; u(); };
  $("pl").onclick = () => { if (timer) { clearInterval(timer); timer = null; $("pl").textContent = "Play"; return; } $("pl").textContent = "Pause"; timer = setInterval(() => { if (!document.body.contains(fig)) { clearInterval(timer); return; } k = (k + 1) % S.length; u(); }, 1100); };
  u();
}},

/* from old ch3 L1 card 3 */
{s: "3. Objective and penalties", t: "Penalties move the optimum to a buildable shape",
intu: String.raw`Here a single parameter \(p\) stands for a whole geometry. The figure of merit \(F\) (blue) has its highest peak where the geometry would contain features too small to fabricate. A penalty \(P\) (orange) is large exactly there. The optimizer maximizes \(J = F - wP\) (black). With \(w = 0\) it heads for the unbuildable peak. As \(w\) grows, the maximum of \(J\) jumps to the second peak, which is slightly worse in \(F\) but can be made. Move the weight.`,
eq: String.raw`\[ J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k\, P_k(\mathbf{p}) \]<div class="eqref">Ch. 3 Eq. (3.1)</div>`,
sym: [[String.raw`\(F\)`, "figure of merit, between 0 and 1 for one transmission, up to 2 for a two-port sum"], [String.raw`\(P_k\)`, String.raw`penalty \(k\): erosion and dilation (Lesson 9) or curvature (Lesson 10)`], [String.raw`\(w_k\)`, String.raw`weight of penalty \(k\), sets the trade-off`]],
how: ["Fabrication limits are not part of Maxwell's equations, so the solver cannot know them.", String.raw`Writing them as smooth penalties keeps \(J\) differentiable, so the gradient still works.`, "Hammond et al. argue the rules must be inside the optimization, because changing an optimized device afterwards ruins the geometry that was optimized.", "Penalties are soft: they discourage violations but do not forbid them. A hard check comes at the end (Lesson 11)."],
say: "The objective is the figure of merit minus weighted penalties, so the optimizer trades a little performance for a geometry that can be fabricated.",
num: "Hammond et al. saw the same in their simulations: when the design rules are switched on, the performance drops and then partly recovers as the optimizer adapts. Their bends kept above 89 % transmission for all nine rulebooks they tested.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Penalty weight w", 0, 1.5, 0.01, 0) + '<div class="readout" id="ro"></div>';
  const ps = range(0, 1, 400), F = p => 0.95 * Math.exp(-Math.pow((p - 0.75) / 0.05, 2)) + 0.8 * Math.exp(-Math.pow((p - 0.32) / 0.12, 2)), P = p => 1 / (1 + Math.exp(-(p - 0.62) / 0.025));
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w.toFixed(2);
    const J = ps.map(p => F(p) - w * P(p)); let bi = 0; J.forEach((v, i) => { if (v > J[bi]) bi = i; });
    const X = C3.X(70, 560, 0, 1), Y = C3.Y(30, 190, -0.6, 1);
    let s = C3.frame(70, 30, 560, 190, 0, 1, -0.6, 1, [0, 0.25, 0.5, 0.75, 1], [-0.5, 0, 0.5, 1], "design parameter p (one geometry per value)", "value");
    s += `<rect x="${X(0.62)}" y="30" width="${X(1) - X(0.62)}" height="190" fill="var(--coral-bg)" opacity="0.5"/><text class="ts" x="${X(0.81)}" y="46" text-anchor="middle">features too small to fabricate</text>`;
    s += plot(70, 30, 560, 190, ps, ps.map(F), 0, 1, -0.6, 1, "#378ADD", 2) + plot(70, 30, 560, 190, ps, ps.map(p => w * P(p)), 0, 1, -0.6, 1, "#EF9F27", 2, "5 4") + plot(70, 30, 560, 190, ps, J, 0, 1, -0.6, 1, "var(--t)", 2.5);
    s += `<circle cx="${X(ps[bi])}" cy="${Y(J[bi])}" r="6" fill="#D85A30"/><line x1="${X(0)}" x2="${X(1)}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--b)" stroke-dasharray="2 3"/>`;
    s += C3.legend(80, 252, [["F", "#378ADD"], ["J = F − wP", "var(--t)"], ["wP", "#EF9F27", "5 4"]]) + `<text class="ts" x="620" y="252" text-anchor="end">red dot: maximum of J</text>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>best p</span><b>${ps[bi].toFixed(2)}</b></div><div><span>F there</span><b>${F(ps[bi]).toFixed(3)}</b></div><div><span>penalty there</span><b>${P(ps[bi]).toFixed(3)}</b></div>`;
  };
  $("w").oninput = u; u();
}},

/* from old ch3 L1 card 4 */
{s: "4. Local optima", t: "A gradient method finds the nearest hill",
intu: "A gradient-based optimizer only sees the local slope. It climbs the hill it starts on and stops at the top, even if a higher hill exists elsewhere. Pick a starting point and run the climb. This is why every design in the thesis starts from a simple device that already works partly: a uniform grating, a linear taper, a Y-shaped splitter (card 7). A good start puts the optimizer on a good hill.",
eq: String.raw`\[ \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \alpha\, \frac{\partial J}{\partial \mathbf{p}} \]<div class="eqref">plain gradient ascent, for illustration</div>`,
sym: [[String.raw`\(\alpha\)`, "step size (learning rate)"], [String.raw`\(\partial J/\partial \mathbf{p}\)`, "local slope, the only information the method uses"], ["local optimum", "a point where the slope is zero and every nearby step goes down"]],
how: ["The gradient points uphill locally.", String.raw`Small steps along it increase \(J\) until the slope vanishes.`, "Nothing in the method looks beyond the current hill.", "Inverse design problems are not convex, so many local optima exist (Kingma and Ba note their theory covers only convex problems)."],
say: "The optimizer finds a local optimum that depends on the starting design, so each device starts from a simple design that already works in part.",
num: "Hammond et al. found that looser design rules did not always give a better device, because each run ends in a different local optimum.",
r(fig, ctl) {
  ctl.innerHTML = sl("p0", "Starting point p₀", 0.02, 0.98, 0.01, 0.15) + `<div class="row"><button id="go">Run the climb</button></div><div class="readout" id="ro"></div>`;
  const J = p => 0.55 * Math.exp(-Math.pow((p - 0.18) / 0.08, 2)) + 0.9 * Math.exp(-Math.pow((p - 0.55) / 0.1, 2)) + 0.7 * Math.exp(-Math.pow((p - 0.86) / 0.06, 2));
  const dJ = p => (J(p + 1e-5) - J(p - 1e-5)) / 2e-5;
  const ps = range(0, 1, 400), X = C3.X(70, 560, 0, 1), Y = C3.Y(30, 180, 0, 1);
  let path = [];
  const draw = () => {
    let s = C3.frame(70, 30, 560, 180, 0, 1, 0, 1, [0, 0.25, 0.5, 0.75, 1], [0, 0.5, 1], "design parameter p", "J") + plot(70, 30, 560, 180, ps, ps.map(J), 0, 1, 0, 1, "#378ADD", 2.5);
    if (path.length) { let d = ""; path.forEach((p, i) => d += (i ? "L" : "M") + X(p).toFixed(1) + " " + Y(J(p)).toFixed(1)); s += `<path d="${d}" fill="none" stroke="#D85A30" stroke-width="2"/>`; const e = path[path.length - 1]; s += `<circle cx="${X(e)}" cy="${Y(J(e))}" r="7" fill="#D85A30"/>`; }
    const p0 = +$("p0").value; s += `<circle cx="${X(p0)}" cy="${Y(J(p0))}" r="5" fill="none" stroke="var(--t)" stroke-width="2"/>`;
    fig.innerHTML = svg(250, s);
    const e = path.length ? path[path.length - 1] : p0;
    $("ro").innerHTML = `<div><span>start</span><b>${p0.toFixed(2)}</b></div><div><span>current p</span><b>${e.toFixed(3)}</b></div><div><span>J</span><b>${J(e).toFixed(3)}</b></div><div><span>global best J</span><b>0.900</b></div>`;
  };
  $("p0").oninput = () => { $("p0v").textContent = (+$("p0").value).toFixed(2); path = []; stopAnim(); draw(); };
  $("go").onclick = () => { let p = +$("p0").value; path = [p]; let n = 0; anim(() => { if (n > 160) { stopAnim(); return; } for (let i = 0; i < 2; i++) { p = C3.clamp(p + 0.0015 * dJ(p), 0, 1); path.push(p); n++; } draw(); }); };
  $("p0v").textContent = "0.15"; draw();
}},

/* from old ch3 L1 card 5 */
{s: "5. Three descriptions", t: "How a geometry is described: numbers, outlines, pixels",
intu: String.raw`The optimizer only sees numbers, so the geometry has to be described by a vector \(\mathbf{p}\). The thesis uses three kinds of description. A few physical numbers, like the widths of grating teeth and gaps or the DBR layer thicknesses. An outline, given by the positions of points or polygon vertices. Or pixels, each with a density between air and GaAs, which lets even the number of holes change (topology optimization). More freedom finds more unusual devices but is harder to keep fabricable. Pick one.`,
eq: String.raw`\[ \text{grating: } \mathbf{p} = (w_1, \dots, w_{2N}) \qquad \text{outline: } \mathbf{p} = (p_1, \dots, p_{N_v}) \]\[ \text{topology: } \mathbf{p} = (\rho_1, \dots, \rho_{N_p}) \]`,
sym: [[String.raw`\(w_i\)`, "widths of teeth and gaps"], [String.raw`\(p_i\)`, "free variable of a vertex or taper point (Lesson 4)"], [String.raw`\(N_v\)`, "number of free vertices"], [String.raw`\(\rho_i\)`, "pixel density between 0 (air) and 1 (GaAs), Lesson 5"], [String.raw`\(N_p\)`, "number of pixels"]],
how: ["Few numbers: easy to fabricate, limited freedom.", "Outline: smooth edges, controllable corners, fixed topology.", "Pixels: full freedom, needs filters, projection and penalties to stay fabricable (Lessons 5 to 10).", "A common sequence is pixels first, then trace the outline and refine it as a shape (Michaels and Yablonovitch suggest exactly this fine-tuning)."],
say: "The parameterization decides how much freedom the optimizer has: a few widths, a set of outline points, or a density per pixel.",
num: "Typical counts: tens of parameters for a grating, around a hundred outline points for a taper, and tens of thousands of pixels for a free-topology region of a few micrometers at about 10 nm pixels.",
r(fig, ctl) {
  let m = "g";
  ctl.innerHTML = btns([["g", "Few numbers (grating)"], ["s", "Outline (vertices)"], ["t", "Pixels (topology)"]], "m") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", m); let s = "", cnt = "", what = "";
    if (m === "g") { let x = 60; const ws = [70, 50, 75, 55, 82, 60, 90, 64, 95, 70, 100, 72]; s += `<rect x="20" y="120" width="40" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>`; ws.forEach((w, i) => { if (i % 2 === 0) s += `<rect x="${x}" y="120" width="${w * 0.55}" height="40" fill="var(--blue-bg)" stroke="var(--blue)"/>`; s += `<text class="ts" x="${x + w * 0.275}" y="${i % 2 ? 112 : 178}" text-anchor="middle">${i % 2 ? "g" : "t"}${Math.floor(i / 2) + 1}</text>`; x += w * 0.55 + (i % 2 ? 0 : 0); }); cnt = "2N = 12 here"; what = "each tooth and gap width is one parameter"; }
    if (m === "s") { const pts = []; for (let i = 0; i < 28; i++) { const a = 2 * Math.PI * i / 28, r = 80 + 18 * Math.sin(3 * a) + 8 * Math.cos(5 * a); pts.push([340 + 1.9 * r * Math.cos(a), 140 + r * Math.sin(a)]); } s += `<path d="M${pts.map(p => p.map(v => v.toFixed(1)).join(" ")).join("L")}Z" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/>` + pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#D85A30"/>`).join(""); cnt = "M = 28 here"; what = "each vertex moves along its normal"; }
    if (m === "t") { const r = C3.rng(4); const nx = 34, ny = 14, d = 15; const vals = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = i / nx, y = j / ny; vals.push(C3.clamp(0.5 + 0.9 * Math.sin(6 * x + 2 * Math.sin(5 * y)) * Math.cos(4 * y - 3 * x) + 0.25 * (r() - 0.5), 0, 1)); } for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) s += `<rect x="${85 + i * d}" y="${35 + j * d}" width="${d - 1}" height="${d - 1}" fill="var(--blue)" fill-opacity="${(0.06 + 0.9 * vals[j * nx + i]).toFixed(2)}"/>`; cnt = `N_p = ${nx * ny} here`; what = "each pixel has its own density ρ"; }
    fig.innerHTML = svg(270, s + `<text class="ts" x="340" y="262" text-anchor="middle">${what}</text>`);
    $("ro").innerHTML = `<div><span>parameters</span><b>${cnt}</b></div><div><span>topology can change</span><b>${m === "t" ? "yes" : "no"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},

/* from old ch3 L1 card 6 */
{s: "6. Cost of a gradient", t: "Why finite differences are hopeless and the adjoint method is not",
intu: String.raw`To know which way to change \(N\) parameters you need \(N\) partial derivatives. By finite differences, each parameter is changed slightly up and down and the simulation is repeated, so a gradient costs \(2N\) simulations, as Ch. 3 Sec. 3.2 counts it. The adjoint method gets all \(N\) derivatives from one forward and one adjoint simulation. Slide the number of parameters and watch the two bars. On a log scale the adjoint bar never moves.`,
eq: String.raw`\[ \frac{\partial F}{\partial p_i} \approx \frac{F(\mathbf{p} + h\,\mathbf{e}_i) - F(\mathbf{p} - h\,\mathbf{e}_i)}{2h} \quad\Longrightarrow\quad 2N \text{ simulations} \]\[ \text{adjoint method} \quad\Longrightarrow\quad 2 \text{ simulations, for any } N \]<div class="eqref">Ch. 3 Sec. 3.2, Michaels and Yablonovitch Sec. 2</div>`,
sym: [[String.raw`\(N\)`, "number of design parameters"], [String.raw`\(h\)`, "small change of one parameter"], [String.raw`\(\mathbf{e}_i\)`, String.raw`unit vector of parameter \(i\)`]],
how: ["Finite differences: two simulations per parameter, one with it nudged up and one with it nudged down.", String.raw`So \(N\) parameters cost \(2N\) simulations every optimization step. A one-sided difference needs \(N + 1\), which Michaels and Yablonovitch quote, and is no better in principle.`, String.raw`The adjoint method reorganizes the chain rule so that the expensive part does not depend on \(i\) (Lesson 2).`, "So the cost stays at two simulations, and for many parameters the saving is enormous."],
say: "Finite differences need two simulations per parameter, while the adjoint method gives the full gradient from two simulations, independent of the number of parameters.",
num: String.raw`The PBS has 48 400 pixels, so finite differences would need 96 800 simulations per step. Christiansen and Sigmund make the same point in their tutorial: finite differences need extra solves for every design variable, the adjoint only one extra solve in total.`,
r(fig, ctl) {
  ctl.innerHTML = sl("m", "Number of parameters N (log)", 0, 5, 0.01, 1.26) + sl("t", "Minutes per simulation", 1, 60, 1, 5) + '<div class="readout" id="ro"></div>';
  const fmt = mins => mins < 120 ? mins.toFixed(0) + " min" : mins < 2880 ? (mins / 60).toFixed(1) + " h" : mins < 525600 ? (mins / 1440).toFixed(1) + " days" : (mins / 525600).toFixed(1) + " years";
  const u = () => {
    const M = Math.round(Math.pow(10, +$("m").value)), t = +$("t").value; $("mv").textContent = M.toLocaleString("en-US"); $("tv").textContent = t;
    const fd = 2 * M, ad = 2, L = v => 60 + Math.log10(v) / 5.5 * 560;
    let s = `<text class="th" x="20" y="70">finite differences</text><rect x="60" y="80" width="${Math.max(2, L(fd) - 60)}" height="34" fill="#D85A30" opacity="0.8"/><text class="ts" x="${L(fd) + 8}" y="102">${fd.toLocaleString("en-US")} simulations</text>`;
    s += `<text class="th" x="20" y="150">adjoint method</text><rect x="60" y="160" width="${Math.max(2, L(ad) - 60)}" height="34" fill="#1D9E75" opacity="0.85"/><text class="ts" x="${L(ad) + 8}" y="182">2 simulations</text>`;
    for (let e = 0; e <= 5; e++) s += `<line x1="${L(Math.pow(10, e))}" x2="${L(Math.pow(10, e))}" y1="205" y2="211" stroke="var(--p)"/><text class="ts" x="${L(Math.pow(10, e))}" y="225" text-anchor="middle">10${["⁰", "¹", "²", "³", "⁴", "⁵"][e]}</text>`;
    s += `<line x1="60" x2="620" y1="205" y2="205" stroke="var(--p)"/><text class="ts" x="340" y="245" text-anchor="middle">simulations per gradient (log scale)</text>`;
    fig.innerHTML = svg(255, s);
    $("ro").innerHTML = `<div><span>one gradient, finite differences</span><b>${fmt(fd * t)}</b></div><div><span>one gradient, adjoint</span><b>${fmt(ad * t)}</b></div><div><span>100 steps, adjoint</span><b>${fmt(200 * t)}</b></div><div><span>speed-up</span><b>${(fd / 2).toFixed(fd > 20 ? 0 : 1)}×</b></div>`;
  };
  $("m").oninput = u; $("t").oninput = u; u();
}},

/* Sec. 3.1: where each design starts */
{s: "7. Where each design starts", t: "Three starting devices, and why the start matters",
intu: String.raw`A gradient-based optimizer climbs the hill it starts on, so the local optimum it finds depends on the starting point. Every design in the thesis therefore starts from a simple device that already works in part. The grating couplers start from a uniform grating, with the same tooth and the same gap repeated. The tapers start from a linear taper between the two waveguide widths. The PBS starts from a Y-shaped splitter drawn as a density image, \(\rho = 0.9\) in the arms and \(\rho = 0.1\) elsewhere. Pick a device to see its start. The curve below is a cartoon of \(J\) along one direction of parameter space. Press Run and five optimizers start from five points at once. Each one stops on the top of its own hill, and the one started from the working device is on a good hill from the first step.`,
eq: String.raw`\[ \mathbf{p}^{(0)} \;\xrightarrow{\ \text{gradient steps}\ }\; \mathbf{p}^{\star}\big(\mathbf{p}^{(0)}\big), \qquad \left.\frac{\partial J}{\partial \mathbf{p}}\right|_{\mathbf{p}^{\star}} = 0 \]<div class="eqnote">starting devices</div>\[ \begin{aligned} \text{grating couplers:}&\ \ \text{uniform grating} \\ \text{tapers:}&\ \ \text{linear taper} \\ \text{PBS:}&\ \ \text{Y-shaped splitter, } \rho = 0.9 \text{ in the arms, } \rho = 0.1 \text{ elsewhere} \end{aligned} \]<div class="eqref">Ch. 3 Sec. 3.1, starting densities in Sec. 3.3</div>`,
sym: [[String.raw`\(\mathbf{p}^{(0)}\)`, "the starting parameters, the simple device"], [String.raw`\(\mathbf{p}^{\star}\)`, "the local optimum the optimizer reaches from that start"], [String.raw`\(\partial J/\partial \mathbf{p} = 0\)`, "at a hilltop the slope vanishes, so the gradient method stops"], [String.raw`\(\rho\)`, "pixel density, 0 for air and 1 for GaAs (Lesson 5)"]],
how: ["A gradient method only knows the local slope, so it moves uphill from wherever it starts.", "It stops where the slope is zero, the top of the nearest hill: a local optimum.", "Inverse design problems have many such hills, so different starts end in different devices.", "A start that already works in part sits on a hill that is already fairly high, so the optimizer improves a working device instead of searching from nothing.", String.raw`The PBS start uses 0.9 and 0.1 instead of 1 and 0, so that every pixel still has a useful gradient at the first steps (the projection slope of Lesson 6).`],
say: "A gradient method finds a local optimum that depends on the start, so every device starts from a simple design that already works in part: a uniform grating, a linear taper and a Y-shaped splitter.",
num: String.raw`Method settings of Sec. 3.3: the gratings have \(N = 9\) teeth, so 18 widths. The tapers have \(M = 81\) points from 200 nm to 1.9 µm over 4 µm. The PBS region is 2.5 × 2.5 µm with 220 × 220 pixels. The landscape is an illustration, not a simulation.`,
note: "If asked whether the result is the global optimum: no gradient method can promise that. What can be said is that the start is a working device, that the optimizer improves it, and that the final design is checked by an independent simulation.",
r(fig, ctl) {
  let dev = "g", runs = null;
  ctl.innerHTML = btns([["g", "Uniform grating"], ["t", "Linear taper"], ["y", "Y-shaped splitter"]], "d") + `<div class="row"><button id="c7go">Run from five starts</button><button id="c7rs">Reset</button></div><div class="readout" id="ro"></div>`;
  const J = p => 0.5 * Math.exp(-(((p - 0.15) / 0.08) ** 2)) + 0.9 * Math.exp(-(((p - 0.5) / 0.11) ** 2)) + 0.65 * Math.exp(-(((p - 0.83) / 0.07) ** 2));
  const dJ = p => (J(p + 1e-5) - J(p - 1e-5)) / 2e-5, ps = range(0, 1, 300);
  const starts = [0.04, 0.27, 0.4, 0.72, 0.97], DEV = 2, cols = ["#7F77DD", "#378ADD", "#D85A30", "#1D9E75", "#BA7517"];
  // Y splitter density image: 44 x 44 drawing pixels standing for the 220 x 220 design pixels
  const NY = 44, yrho = [];
  for (let j = 0; j < NY; j++) for (let i = 0; i < NY; i++) {
    const x = (i + 0.5) / NY, y = (j + 0.5) / NY, hw = 0.07;
    const cy = x < 0.35 ? 0.5 : 0.5 + Math.sign(y - 0.5 || 1) * (x - 0.35) / 0.65 * 0.28;
    const onStem = x < 0.42 && Math.abs(y - 0.5) < hw, onArm = x >= 0.3 && (Math.abs(y - (0.5 + (x - 0.35) / 0.65 * 0.28)) < hw || Math.abs(y - (0.5 - (x - 0.35) / 0.65 * 0.28)) < hw);
    yrho.push(onStem || onArm ? 0.9 : 0.1);
  }
  const top = () => {
    let s = "";
    if (dev === "g") {
      s += `<text class="ts" x="20" y="18">side view: uniform grating, every tooth and every gap the same</text>`;
      s += `<rect x="40" y="96" width="150" height="20" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      for (let k = 0; k < 9; k++) s += `<rect x="${200 + k * 46}" y="96" width="28" height="20" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      s += arrow(200, 128, 246, 128, "var(--p)", 1.2, null, true) + `<text class="ts" x="223" y="146" text-anchor="middle">period Λ</text>` + arrow(200, 88, 228, 88, "#D85A30", 1.2, null, true) + `<text class="ts" x="214" y="80" text-anchor="middle">tooth</text>`;
      s += `<g transform="rotate(5 410 40)"><rect x="385" y="26" width="50" height="34" fill="#EEE6D3" stroke="var(--t)" stroke-width="0.6"/></g>` + arrow(408, 62, 404, 92, "#378ADD", 2) + `<text class="ts" x="445" y="44">Gaussian beam (fiber)</text>`;
      s += `<text class="ts" x="115" y="88" text-anchor="middle">access waveguide</text><text class="ts" x="520" y="146">9 teeth, 18 widths</text>`;
    } else if (dev === "t") {
      s += `<text class="ts" x="20" y="18">top view: linear taper, M = 81 points joined by straight lines</text>`;
      const x0 = 140, L = 400, cy = 90, hy = v => v * 34;
      s += `<rect x="40" y="${cy - hy(0.1)}" width="${x0 - 40}" height="${2 * hy(0.1)}" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="${x0 + L}" y="${cy - hy(0.95)}" width="${640 - x0 - L}" height="${2 * hy(0.95)}" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      s += `<path d="M${x0} ${cy - hy(0.1)} L${x0 + L} ${cy - hy(0.95)} L${x0 + L} ${cy + hy(0.95)} L${x0} ${cy + hy(0.1)} Z" fill="var(--blue-bg)" stroke="var(--blue)" stroke-width="1.5"/>`;
      for (let i = 0; i < 81; i++) { const x = x0 + L * i / 80, y = 0.1 + 0.85 * i / 80; s += `<circle cx="${x.toFixed(1)}" cy="${(cy - hy(y)).toFixed(1)}" r="1.6" fill="#D85A30"/>`; }
      s += `<text class="ts" x="90" y="${cy + 30}" text-anchor="middle">200 nm</text><text class="ts" x="${x0 + L + 50}" y="${cy + hy(0.95) + 16}" text-anchor="middle">1.9 µm</text><text class="ts" x="${x0 + L / 2}" y="${cy + hy(0.95) + 16}" text-anchor="middle">4 µm long</text>`;
    } else {
      s += `<text class="ts" x="20" y="18">density image: Y-shaped splitter, ρ = 0.9 in the arms, 0.1 elsewhere</text>`;
      const px = 3, x0 = 250, y0 = 28;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NY; i++) s += `<rect x="${x0 + i * px}" y="${y0 + j * px}" width="${px + 0.2}" height="${px + 0.2}" fill="var(--blue)" fill-opacity="${yrho[j * NY + i].toFixed(2)}"/>`;
      const S = NY * px, yc = y0 + S / 2, d = 0.28 * S;
      s += `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/>`;
      s += `<rect x="150" y="${yc - 0.07 * S}" width="100" height="${0.14 * S}" fill="var(--blue)" fill-opacity="0.9"/><rect x="${x0 + S}" y="${yc - d - 0.07 * S}" width="100" height="${0.14 * S}" fill="var(--blue)" fill-opacity="0.9"/><rect x="${x0 + S}" y="${yc + d - 0.07 * S}" width="100" height="${0.14 * S}" fill="var(--blue)" fill-opacity="0.9"/>`;
      s += `<text class="ts" x="200" y="${yc - 14}" text-anchor="middle">input</text><text class="ts" x="${x0 + S + 108}" y="${yc - d + 4}">output</text><text class="ts" x="${x0 + S + 108}" y="${yc + d + 4}">output</text><text class="ts" x="${x0 + S / 2}" y="${y0 + S + 14}" text-anchor="middle">2.5 × 2.5 µm design region</text>`;
    }
    return s;
  };
  const u = () => {
    pick(ctl, "d", dev);
    const X = C3.X(70, 560, 0, 1), Y = C3.Y(212, 110, 0, 1);
    let s = top() + C3.frame(70, 212, 560, 110, 0, 1, 0, 1, [0, 0.5, 1], [0, 0.5, 1], "one direction in parameter space (illustration)", "J") + plot(70, 212, 560, 110, ps, ps.map(J), 0, 1, 0, 1, "var(--p)", 2);
    starts.forEach((p0, k) => {
      const P = runs ? runs[k] : [p0], e = P[P.length - 1];
      if (P.length > 1) { let d = ""; P.forEach((p, i) => { if (i % 3 === 0 || i === P.length - 1) d += (d ? "L" : "M") + X(p).toFixed(1) + " " + Y(J(p)).toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${cols[k]}" stroke-width="2"/>`; }
      s += `<circle cx="${X(p0)}" cy="${Y(J(p0))}" r="4" fill="none" stroke="${cols[k]}" stroke-width="2"/><circle cx="${X(e)}" cy="${Y(J(e))}" r="${k === DEV ? 7 : 5}" fill="${cols[k]}"/>`;
    });
    s += `<text class="ts" x="70" y="200">rings: the five starts. Dots: where each run is now. <tspan fill="#D85A30">Big orange dot: started from the working device</tspan></text>`;
    fig.innerHTML = svg(362, s);
    const ends = starts.map((p0, k) => runs ? runs[k][runs[k].length - 1] : p0);
    const info = { g: ["parameters", "18 widths (N = 9)", "start", "all teeth equal, all gaps equal"], t: ["parameters", "81 half-widths", "start", "straight line, 200 nm to 1.9 µm"], y: ["parameters", "48 400 pixels", "start", "ρ = 0.9 arms, 0.1 elsewhere"] }[dev];
    $("ro").innerHTML = `<div><span>${info[0]}</span><b>${info[1]}</b></div><div><span>${info[2]}</span><b>${info[3]}</b></div><div><span>J reached from the five starts</span><b>${ends.map(e => J(e).toFixed(2)).join(", ")}</b></div>`;
  };
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { dev = b.dataset.d; u(); });
  $("c7rs").onclick = () => { stopAnim(); runs = null; u(); };
  $("c7go").onclick = () => {
    runs = starts.map(p0 => [p0]); let n = 0;
    anim(() => { if (!fig.isConnected) { stopAnim(); return; } if (n >= 420) { stopAnim(); return; } for (let i = 0; i < 4; i++) { runs.forEach(P => { const p = P[P.length - 1]; P.push(C3.clamp(p + 0.0015 * dJ(p), 0, 1)); }); n++; } u(); });
  };
  u();
}}

],
summary: String.raw`Inverse design writes the job of a device as a figure of merit \(F\) computed from simulated fields and maximizes \(J = F - \sum_k w_k P_k\), where the penalties discourage geometries that cannot be fabricated. The geometry is described by parameters: a few widths, an outline, or a density per pixel. Each step needs a forward simulation for \(F\) and an adjoint simulation, and the overlap of the two field sets gives the gradient with respect to all parameters, at a cost of two simulations instead of \(2N\) for finite differences. A gradient method finds a local optimum, so the starting design matters, and fabrication rules have to be built into the optimization rather than applied afterwards.`,
sheet: [
[String.raw`\[ \max_{\mathbf{p}}\, J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]`, "Design problem (Ch. 3 Eq. 3.1)"],
[String.raw`\[ \mathbf{p}^{(0)} \to \mathbf{p}^{\star}\big(\mathbf{p}^{(0)}\big) \]`, "The local optimum depends on the start: uniform grating, linear taper, Y-shaped splitter (Sec. 3.1)"],
[String.raw`\[ \text{finite differences: } 2N \text{ simulations per gradient} \]`, "Changing each parameter up and down (Sec. 3.2)"],
[String.raw`\[ \text{adjoint method: } 2 \text{ simulations per gradient, independent of } N \]`, "Michaels and Yablonovitch, Sec. 2, Lalau-Keraly et al. 2013"],
[String.raw`\[ \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \Delta\mathbf{p}\!\left(\frac{\partial J}{\partial \mathbf{p}}\right) \]`, "One optimizer step (Adam in Lesson 13)"]],
consts: "The curves in cards 3, 4 and 7 are illustrative functions, not simulations.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint method in matrix form, curvature penalty, shape optimization of a silicon taper)", "Hammond et al., Opt. Express 29, 23916 (2021) (foundry design rules inside photonic topology optimization, robustness to etch bias, simulations only)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (tutorial on density-based topology optimization for photonics)", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013) (adjoint shape optimization, gradient from two simulations)", "Kingma and Ba, ICLR 2015 (Adam)"]
});
