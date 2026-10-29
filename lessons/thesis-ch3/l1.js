addLesson("thesis", "ch3", {
level: "Foundations",
id: "thesis-ch3-l1", title: "The inverse design problem", short: "1. The design problem",
big: "In forward design you guess a geometry, simulate it and look at the result. Inverse design turns this around. You write down what the device should do as one number, the figure of merit, and let an optimizer change the geometry to make that number as large as possible. Each step needs the figure of merit and its gradient with respect to every design parameter. The adjoint method gives that gradient from just two simulations, however many parameters there are, which is what makes designs with thousands of free pixels possible. Penalty terms are subtracted from the figure of merit so that the optimizer is pushed away from shapes that cannot be fabricated.",
bridge: "This lesson follows Ch. 3 Sec. 3.1. The idea that design rules belong inside the optimization comes from Hammond et al. 2021 (Georgia Tech and MIT), a methods paper that adds foundry rules to photonic topology optimization. The cost argument for the adjoint method is from Michaels and Yablonovitch 2018 (UC Berkeley).",
cards: [
{s: "1. Forward and inverse", t: "Forward design versus inverse design",
intu: "Forward: a person draws a geometry, the simulator returns the fields, and the person reads off the performance and draws again. The loop runs through a human head, so only a few parameters can be explored. Inverse: the target is written as a figure of merit F, and the loop runs through an optimizer that changes the geometry by itself. The human now decides what to ask for and where to start, not every shape. Switch between the two pictures.",
eq: String.raw`<div class="eqnote">Forward design</div>\[ \mathbf{p} \;\longrightarrow\; \varepsilon(\mathbf{r};\mathbf{p}) \;\xrightarrow{\text{Maxwell}}\; \mathbf{E}(\mathbf{r}) \;\longrightarrow\; F(\mathbf{p}) \]<div class="eqnote">Inverse design</div>\[ \max_{\mathbf{p}}\; J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k\, P_k(\mathbf{p}) \]<div class="eqref">Ch. 3 Eq. (3.1)</div>`,
sym: [[String.raw`\(\mathbf{p}\)`, "vector of design parameters (widths, vertex moves, pixel densities)"], [String.raw`\(\varepsilon(\mathbf{r};\mathbf{p})\)`, "permittivity map that the parameters describe"], [String.raw`\(F\)`, "figure of merit computed from the simulated fields, for example the power in a target mode"], [String.raw`\(J\)`, "the objective the optimizer maximizes"]],
how: ["The simulation is the same in both cases: Maxwell's equations for a given ε(r).", "Forward design asks what a geometry does.", "Inverse design asks which geometry does what we want.", "That question has no closed answer, so it is solved iteratively, one improving step at a time."],
say: "In inverse design the device function is written as a figure of merit, and a gradient-based optimizer changes the geometry to maximize it.",
num: "A forward search over 10 values for each of 18 parameters would need 10<sup>18</sup> simulations. A gradient-based optimizer typically needs tens to a few hundred steps of two simulations each.",
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

{s: "2. The loop", t: "One optimization step, stage by stage",
intu: "Every device in the thesis is designed with the same loop (Ch. 3 Fig. 3.1a). The parameters build a geometry. A forward simulation gives the fields and the figure of merit. An adjoint simulation, with a source placed where the light should arrive, gives a second set of fields. Their overlap gives the gradient with respect to every parameter. The optimizer turns the gradient into a step, and the loop repeats until F stops improving. Step through the stages.",
eq: String.raw`\[ \mathbf{p}^{(k)} \to \varepsilon \to \mathbf{E}_{\mathrm{fwd}},\, F \to \mathbf{E}_{\mathrm{adj}} \to \frac{\partial J}{\partial \mathbf{p}} \to \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \Delta\mathbf{p}\!\left(\frac{\partial J}{\partial \mathbf{p}}\right) \]`,
sym: [[String.raw`\(k\)`, "iteration number"], [String.raw`\(\mathbf{E}_{\mathrm{fwd}}\)`, "fields of the forward simulation (source at the input)"], [String.raw`\(\mathbf{E}_{\mathrm{adj}}\)`, "fields of the adjoint simulation (source at the output monitor)"], [String.raw`\(\Delta\mathbf{p}\)`, "the step chosen by the optimizer, here Adam (Lesson 12)"]],
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

{s: "3. Objective and penalties", t: "Penalties move the optimum to a buildable shape",
intu: "Here a single parameter p stands for a whole geometry. The figure of merit F (blue) has its highest peak where the geometry would contain features too small to fabricate. A penalty P (orange) is large exactly there. The optimizer maximizes J = F − wP (black). With w = 0 it heads for the unbuildable peak. As w grows, the maximum of J jumps to the second peak, which is slightly worse in F but can be made. Move the weight.",
eq: String.raw`\[ J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k\, P_k(\mathbf{p}) \]<div class="eqref">Ch. 3 Eq. (3.1)</div>`,
sym: [[String.raw`\(F\)`, "figure of merit, between 0 and 1 for one transmission, up to 2 for a two-port sum"], [String.raw`\(P_k\)`, "penalty k: erosion and dilation (Lesson 9) or curvature (Lesson 10)"], [String.raw`\(w_k\)`, "weight of penalty k, sets the trade-off"]],
how: ["Fabrication limits are not part of Maxwell's equations, so the solver cannot know them.", "Writing them as smooth penalties keeps J differentiable, so the gradient still works.", "Hammond et al. argue the rules must be inside the optimization, because changing an optimized device afterwards ruins the geometry that was optimized.", "Penalties are soft: they discourage violations but do not forbid them. A hard check comes at the end (Lesson 11)."],
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

{s: "4. Local optima", t: "A gradient method finds the nearest hill",
intu: "A gradient-based optimizer only sees the local slope. It climbs the hill it starts on and stops at the top, even if a higher hill exists elsewhere. Pick a starting point and run the climb. This is why every design in the thesis starts from a simple device that already works partly: a uniform grating, a linear or earlier taper, a Y-shaped splitter. A good start puts the optimizer on a good hill.",
eq: String.raw`\[ \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \alpha\, \frac{\partial J}{\partial \mathbf{p}} \]<div class="eqref">plain gradient ascent, for illustration</div>`,
sym: [[String.raw`\(\alpha\)`, "step size (learning rate)"], [String.raw`\(\partial J/\partial \mathbf{p}\)`, "local slope, the only information the method uses"], ["local optimum", "a point where the slope is zero and every nearby step goes down"]],
how: ["The gradient points uphill locally.", "Small steps along it increase J until the slope vanishes.", "Nothing in the method looks beyond the current hill.", "Inverse design problems are not convex, so many local optima exist (Kingma and Ba note their theory covers only convex problems)."],
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

{s: "5. Three descriptions", t: "How a geometry is described: numbers, outlines, pixels",
intu: "The optimizer only sees numbers, so the geometry has to be described by a vector p. The thesis uses three kinds of description. A few physical numbers, like the widths of grating teeth and gaps or the DBR layer thicknesses. An outline, given by the positions of points or polygon vertices. Or pixels, each with a density between air and GaAs, which lets even the number of holes change (topology optimization). More freedom finds more unusual devices but is harder to keep fabricable. Pick one.",
eq: String.raw`\[ \text{grating: } \mathbf{p} = (w_1, \dots, w_{2N}) \qquad \text{outline: } \mathbf{p} = (\theta_1, \dots, \theta_M) \]\[ \text{topology: } \mathbf{p} = (\rho_1, \dots, \rho_{N_p}) \]`,
sym: [[String.raw`\(w_i\)`, "widths of teeth and gaps"], [String.raw`\(\theta_i\)`, "vertex move variables (Lesson 5)"], [String.raw`\(\rho_i\)`, "pixel density between 0 (air) and 1 (GaAs), Lesson 6"], [String.raw`\(N_p\)`, "number of pixels"]],
how: ["Few numbers: easy to fabricate, limited freedom.", "Outline: smooth edges, controllable corners, fixed topology.", "Pixels: full freedom, needs filters, projection and penalties to stay fabricable (Lessons 6 to 9).", "A common sequence is pixels first, then trace the outline and refine it as a shape (Michaels and Yablonovitch suggest exactly this fine-tuning)."],
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

{s: "6. Cost of a gradient", t: "Why finite differences are hopeless and the adjoint method is not",
intu: "To know which way to change M parameters you need M partial derivatives. By finite differences, each one costs a new simulation with one parameter nudged, so a gradient costs M + 1 simulations. The adjoint method gets all M derivatives from one forward and one adjoint simulation. Slide the number of parameters and watch the two bars. On a log scale the adjoint bar never moves.",
eq: String.raw`\[ \frac{\partial F}{\partial p_i} \approx \frac{F(\mathbf{p} + h\,\mathbf{e}_i) - F(\mathbf{p})}{h} \quad\Longrightarrow\quad M + 1 \text{ simulations} \]\[ \text{adjoint method} \quad\Longrightarrow\quad 2 \text{ simulations, for any } M \]<div class="eqref">Michaels and Yablonovitch, Sec. 2</div>`,
sym: [[String.raw`\(M\)`, "number of design parameters"], [String.raw`\(h\)`, "small nudge of one parameter"], [String.raw`\(\mathbf{e}_i\)`, "unit vector of parameter i"]],
how: ["Finite differences: one simulation per nudged parameter, plus the unperturbed one.", "Michaels and Yablonovitch write this as M + 1 simulations per gradient.", "The adjoint method reorganizes the chain rule so that the expensive part does not depend on i (Lesson 2).", "So the cost stays at two simulations, and for many parameters the saving is enormous."],
say: "Finite differences need one simulation per parameter, while the adjoint method gives the full gradient from two simulations, independent of the number of parameters.",
num: "Christiansen and Sigmund make the same point in their tutorial: finite differences need one extra solve per design variable, the adjoint needs one extra solve in total.",
r(fig, ctl) {
  ctl.innerHTML = sl("m", "Number of parameters M (log)", 0, 5, 0.01, 1.26) + sl("t", "Minutes per simulation", 1, 60, 1, 5) + '<div class="readout" id="ro"></div>';
  const fmt = mins => mins < 120 ? mins.toFixed(0) + " min" : mins < 2880 ? (mins / 60).toFixed(1) + " h" : mins < 525600 ? (mins / 1440).toFixed(1) + " days" : (mins / 525600).toFixed(1) + " years";
  const u = () => {
    const M = Math.round(Math.pow(10, +$("m").value)), t = +$("t").value; $("mv").textContent = M.toLocaleString("en-US"); $("tv").textContent = t;
    const fd = M + 1, ad = 2, L = v => 60 + Math.log10(v) / 5.5 * 560;
    let s = `<text class="th" x="20" y="70">finite differences</text><rect x="60" y="80" width="${Math.max(2, L(fd) - 60)}" height="34" fill="#D85A30" opacity="0.8"/><text class="ts" x="${L(fd) + 8}" y="102">${fd.toLocaleString("en-US")} simulations</text>`;
    s += `<text class="th" x="20" y="150">adjoint method</text><rect x="60" y="160" width="${Math.max(2, L(ad) - 60)}" height="34" fill="#1D9E75" opacity="0.85"/><text class="ts" x="${L(ad) + 8}" y="182">2 simulations</text>`;
    for (let e = 0; e <= 5; e++) s += `<line x1="${L(Math.pow(10, e))}" x2="${L(Math.pow(10, e))}" y1="205" y2="211" stroke="var(--p)"/><text class="ts" x="${L(Math.pow(10, e))}" y="225" text-anchor="middle">10${["⁰", "¹", "²", "³", "⁴", "⁵"][e]}</text>`;
    s += `<line x1="60" x2="620" y1="205" y2="205" stroke="var(--p)"/><text class="ts" x="340" y="245" text-anchor="middle">simulations per gradient (log scale)</text>`;
    fig.innerHTML = svg(255, s);
    $("ro").innerHTML = `<div><span>one gradient, finite differences</span><b>${fmt(fd * t)}</b></div><div><span>one gradient, adjoint</span><b>${fmt(ad * t)}</b></div><div><span>100 steps, adjoint</span><b>${fmt(200 * t)}</b></div><div><span>speed-up</span><b>${(fd / 2).toFixed(fd > 20 ? 0 : 1)}×</b></div>`;
  };
  $("m").oninput = u; $("t").oninput = u; u();
}}
],
summary: "Inverse design writes the job of a device as a figure of merit F computed from simulated fields and maximizes J = F − Σw_kP_k, where the penalties discourage geometries that cannot be fabricated. The geometry is described by parameters: a few widths, an outline, or a density per pixel. Each step needs a forward simulation for F and an adjoint simulation, and the overlap of the two field sets gives the gradient with respect to all parameters, at a cost of two simulations instead of M + 1. A gradient method finds a local optimum, so the starting design matters, and fabrication rules have to be built into the optimization rather than applied afterwards.",
sheet: [
[String.raw`\[ \max_{\mathbf{p}}\, J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]`, "Design problem (Ch. 3 Eq. 3.1)"],
[String.raw`\[ \text{finite differences: } M + 1 \text{ simulations per gradient} \]`, "Michaels and Yablonovitch, Sec. 2"],
[String.raw`\[ \text{adjoint method: } 2 \text{ simulations per gradient, independent of } M \]`, "Michaels and Yablonovitch, Sec. 2"],
[String.raw`\[ \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \Delta\mathbf{p}\!\left(\frac{\partial J}{\partial \mathbf{p}}\right) \]`, "One optimizer step (Adam in Lesson 12)"]],
consts: "The curves in cards 3 and 4 are illustrative functions, not simulations.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint method in matrix form, curvature penalty, shape optimization of a silicon taper)", "Hammond et al., Opt. Express 29, 23916 (2021) (foundry design rules inside photonic topology optimization, robustness to etch bias; simulations only)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (tutorial on density-based topology optimization for photonics)", "Kingma and Ba, ICLR 2015 (Adam)"]
});
