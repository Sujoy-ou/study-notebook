(function () {
/* Lesson 0 of Chapter 3: every equation read in words. Figures are computed in the browser
   with the Chapter 3 tools in common.js (C3) and the drawing helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
/* Typeset the annotated equation once, then return an empty element for the live figure. */
const holder = (fig, tex) => { eqWords(fig, tex, '<div id="eqfig"></div>'); return $("eqfig"); };
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const box = (x, y, w, h, t, col) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--sunk)" stroke="${col || "var(--b)"}" stroke-width="1.5"/><text class="t" x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle">${t}</text>`;
const sum = a => a.reduce((p, q) => p + q, 0);
const absMax = a => Math.max(1e-300, ...Array.from(a, v => Math.abs(v)));
/* Step-through controls: Back, Play or Pause, Next, a step counter and a caption per step.
   draw(k, t) draws step k at time t (seconds). o.cont redraws every frame, o.loop restarts. */
const steps = (fig, ctl, caps, draw, o) => {
  o = o || {}; const n = caps.length; let k = o.start || 0, play = !!o.play, tk = 0, tNow = 0, last = -1;
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button data-sb="b">Back</button><button data-sb="p">Play</button><button data-sb="n">Next step</button><span data-sb="s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div><p data-sb="c" style="font-size:14.5px;line-height:1.5;color:var(--fg);min-height:46px;margin:2px 0 8px"></p>`);
  const q = a => ctl.querySelector(`[data-sb="${a}"]`);
  const show = () => { q("s").textContent = `step ${k + 1} of ${n}`; q("c").textContent = caps[k]; q("b").disabled = k === 0; q("n").disabled = k === n - 1; q("p").textContent = play ? "Pause" : "Play"; };
  const redraw = () => { draw(k, tNow); last = k; show(); };
  q("b").onclick = () => { k = Math.max(0, k - 1); tk = tNow; play = false; redraw(); };
  q("n").onclick = () => { k = Math.min(n - 1, k + 1); tk = tNow; play = false; redraw(); };
  q("p").onclick = () => { play = !play; if (play && k === n - 1) k = 0; tk = tNow; redraw(); };
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    tNow = t;
    let ch = false;
    if (play && t - tk > (o.dwell || 2.8)) { tk = t; ch = true; if (k < n - 1) k++; else if (o.loop) k = 0; else play = false; }
    if (o.cont || ch || k !== last) redraw();
  });
  return { redraw, get k() { return k; } };
};

addLesson("thesis", "ch3", {
zero: true,
labels: { intu: "What it says", how: "How to read it" },
level: "Start here",
id: "thesis-ch3-l0", title: "The equations of Chapter 3 in words", short: "0. Equations in words",
big: String.raw`Every equation in this chapter is a sentence written in symbols. This lesson reads each one aloud, in the order of the final Chapter 3, Eqs. (3.1) to (3.18): what every letter stands for, what each operation does, what the equation says in plain words, and where it is used later. The chapter follows one story. An objective says what the device should do (Sec. 3.1). The adjoint method gives its gradient from two simulations (Sec. 3.2). A parameterization turns free numbers into a geometry that stays within its limits (Sec. 3.3). Mode overlaps and band weights build the objectives (Sec. 3.4). Projection continuation, penalties and a design rule check with repair keep the geometry buildable (Sec. 3.5). The grid and Adam set how the simulations and the steps are run (Sec. 3.6), and a few defined quantities report the result (Sec. 3.7). Colored braces under each part name it. Many cards are step-throughs: press Next or Play and narrate them as you would on the board.`,
bridge: String.raw`The cards follow the thesis numbering: card 1 is Eq. (3.1), cards 2 to 8 the adjoint method with Eqs. (3.2) to (3.5), cards 9 to 15 the parameterizations with Eqs. (3.6) to (3.11), cards 16 to 18 the objectives with Eqs. (3.12) to (3.14), cards 19 to 23 the fabrication constraints with Eqs. (3.15) to (3.17), cards 24 to 26 the simulation settings, and cards 27 and 28 the reported quantities with Eq. (3.18). Card 29 puts the loop together. The lesson numbers in each card refer to Lessons 1 to 15 of this chapter.`,
cards: [
/* ---------------- 1. Objective ---------------- */
{s: "1. Design objective", t: String.raw`The design problem: \(\max J = F - \sum_k w_k P_k\)`,
intu: String.raw`The optimizer needs one number to climb. \(F\), the figure of merit, measures how well the device does its job, for example the fraction of light delivered into the right waveguide mode. Each penalty \(P_k\) measures how badly the geometry breaks a fabrication wish, such as features that are too small or corners that are too sharp. Subtracting the penalties, each scaled by a weight \(w_k\), lets the optimizer trade a little performance for a buildable shape. The maximum of \(J\) therefore sits where performance is high and penalties are low, not where \(F\) alone peaks. The second line is one step of the optimizer, which turns the gradient into a change of the parameters.`,
eq: String.raw`\[ \max_{\mathbf{p}}\, J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]\[ \mathbf{p}^{(k+1)} = \mathbf{p}^{(k)} + \Delta\mathbf{p}\!\left(\frac{\partial J}{\partial \mathbf{p}}\right) \]<div class="eqref">Ch. 3 Eq. (3.1), used in Lesson 1</div>`,
sym: [[String.raw`\(\mathbf{p}\)`, "the design parameters: widths, layer scales, taper points, pixel densities or vertex moves"], [String.raw`\(\max_{\mathbf{p}}\)`, String.raw`"find the \(\mathbf{p}\) that makes the expression largest"`], [String.raw`\(J\)`, "the objective that is maximized"], [String.raw`\(F\)`, "figure of merit, for one transmission between 0 and 1"], [String.raw`\(P_k\)`, "the k-th penalty, zero when its rule is obeyed and growing as the rule is broken"], [String.raw`\(w_k\)`, "weight of penalty k, the exchange rate between performance and buildability"], [String.raw`\(\sum_k\)`, "sum over all penalties"], [String.raw`\(\mathbf{p}^{(k)}\)`, String.raw`parameters after \(k\) steps (in this line \(k\) counts steps, not penalties)`], [String.raw`\(\partial J/\partial \mathbf{p}\)`, "the gradient: one derivative per parameter"], [String.raw`\(\Delta\mathbf{p}(\cdot)\)`, "the step rule that turns the gradient into a change, Adam in this thesis (card 26)"]],
how: [String.raw`Read it aloud: "maximize over \(\mathbf{p}\) the objective \(J\), which is the figure of merit \(F\) minus the sum of the weighted penalties".`, String.raw`\(F\) rewards performance. Each \(P_k\) is zero for a geometry that obeys its rule, so it only acts where the rule is broken.`, String.raw`A larger \(w_k\) pushes the optimum further toward a buildable shape, at some cost in \(F\). Move the slider and watch the red dot leave the tall narrow peak.`, String.raw`The update line needs only the gradient, never a scan of all geometries. That is what makes hundreds or thousands of parameters possible.`, String.raw`Used in Lesson 1, cards 1 to 3, and again in Lessons 9 and 10 with concrete penalties.`],
say: "The objective is the figure of merit minus weighted penalties, so the optimizer looks for the best device that is also buildable.",
num: String.raw`A forward search over 10 values for each of 18 parameters would need \(10^{18}\) simulations. A gradient-based optimizer typically needs tens to a few hundred steps of two simulations each. The curves in the figure are illustrative functions, not simulations.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zw", "Penalty weight w", 0, 1.5, 0.01, 0.6) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\underbrace{\max_{\mathbf{p}}}_{\text{best geometry}}\; {\color{#D85A30}{J}} = \underbrace{{\color{#378ADD}{F}}}_{\text{performance}} - \sum_k \underbrace{{\color{#BA7517}{w_k}}}_{\text{weight}}\;\; \underbrace{{\color{#7F77DD}{P_k}}}_{\text{rule broken}}`;
  const el = holder(fig, T);
  const ps = range(0, 1, 400), F = p => 0.95 * Math.exp(-Math.pow((p - 0.75) / 0.05, 2)) + 0.8 * Math.exp(-Math.pow((p - 0.32) / 0.12, 2)), P = p => 1 / (1 + Math.exp(-(p - 0.62) / 0.025));
  const u = () => {
    const w = +$("zw").value; $("zwv").textContent = w.toFixed(2);
    const J = ps.map(p => F(p) - w * P(p)); let bi = 0; J.forEach((v, i) => { if (v > J[bi]) bi = i; });
    const X = C3.X(70, 560, 0, 1), Y = C3.Y(20, 180, -0.6, 1);
    let s = C3.frame(70, 20, 560, 180, 0, 1, -0.6, 1, [0, 0.25, 0.5, 0.75, 1], [-0.5, 0, 0.5, 1], "design parameter p (one geometry per value, illustrative)", "value");
    s += `<rect x="${X(0.62)}" y="20" width="${X(1) - X(0.62)}" height="180" fill="var(--coral-bg)" opacity="0.5"/>` + tx(626, 36, "features too small", "end") + tx(626, 50, "to fabricate", "end");
    s += plot(70, 20, 560, 180, ps, ps.map(F), 0, 1, -0.6, 1, PB, 2) + plot(70, 20, 560, 180, ps, ps.map(p => w * P(p)), 0, 1, -0.6, 1, PP, 2, "5 4") + plot(70, 20, 560, 180, ps, J, 0, 1, -0.6, 1, "var(--t)", 2.5);
    s += `<line x1="${X(0)}" x2="${X(1)}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--b)" stroke-dasharray="2 3"/><circle cx="${X(ps[bi])}" cy="${Y(J[bi])}" r="6" fill="${PC}"/>`;
    s += C3.legend(80, 252, [["F", PB], ["J = F − wP", "var(--t)"], ["wP", PP, "5 4"]]) + tx(630, 252, "red dot: maximum of J", "end");
    el.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>best p</span><b>${ps[bi].toFixed(2)}</b></div><div><span>F there</span><b>${F(ps[bi]).toFixed(3)}</b></div><div><span>penalty there</span><b>${P(ps[bi]).toFixed(3)}</b></div>`;
  };
  $("zw").oninput = u; u();
}},

/* ---------------- 2. A x = b ---------------- */
{s: "2. A x = b", t: String.raw`Maxwell as one matrix equation: \(A(\mathbf{p})\,\mathbf{x} = \mathbf{b}\)`,
intu: String.raw`On a grid at one frequency, Maxwell's equations become one linear equation for every field unknown. Stacking them gives a matrix equation. The vector \(\mathbf{x}\) holds every field value, \(\mathbf{b}\) holds the source, and the matrix \(A\) holds the derivatives plus the permittivity of each cell. \(A\) is the only part that depends on the design. In 1D each row links a cell to its two neighbours, and the permittivity of cell \(i\) sits only on the diagonal of row \(i\). Changing one pixel therefore changes one single entry of \(A\).`,
eq: String.raw`\[ A(\mathbf{p})\, \mathbf{x} = \mathbf{b} \]\[ \frac{E_{i-1} - 2E_i + E_{i+1}}{\Delta^2} + k_0^2\, \varepsilon_i E_i = b_i \quad\Longrightarrow\quad \frac{\partial A}{\partial \varepsilon_i} = k_0^2\, \mathbf{e}_i \mathbf{e}_i^{T} \]<div class="eqref">Ch. 3 Eq. (3.2), Michaels Eq. (3), used in Lesson 2</div>`,
sym: [[String.raw`\(A(\mathbf{p})\)`, "system matrix, sparse, depends on the design through the permittivity"], [String.raw`\(\mathbf{x}\)`, "vector of all field unknowns, complex"], [String.raw`\(\mathbf{b}\)`, "source vector, nonzero only where the source sits"], [String.raw`\(E_i\)`, String.raw`field in cell \(i\) (1D)`], [String.raw`\(\Delta\)`, "grid step, 10 nm in the 1D demos"], [String.raw`\(k_0 = 2\pi/\lambda\)`, "free-space wavenumber"], [String.raw`\(\varepsilon_i\)`, String.raw`relative permittivity of cell \(i\), from 1 (air) to 12.19 (GaAs)`], [String.raw`\(b_i\)`, String.raw`source in cell \(i\)`], [String.raw`\(\mathbf{e}_i\)`, String.raw`unit vector: 1 in place \(i\), 0 elsewhere`], [String.raw`\(\mathbf{e}_i\mathbf{e}_i^{T}\)`, String.raw`matrix with a single 1 at row \(i\), column \(i\)`], [String.raw`\(^{T}\)`, "transpose: rows become columns"], [String.raw`\(\partial A/\partial \varepsilon_i\)`, String.raw`change of the matrix when \(\varepsilon_i\) changes`]],
how: [String.raw`Read it aloud: "\(A\) of \(\mathbf{p}\) times \(\mathbf{x}\) equals \(\mathbf{b}\): the design matrix acting on the fields gives the source".`, String.raw`The 1D row is the second derivative written with neighbours, plus \(k_0^2\varepsilon_i\) times the field. It is the Helmholtz equation on a grid.`, String.raw`Only the diagonal holds the permittivity, so \(\partial A/\partial \varepsilon_i\) has one nonzero entry, \(k_0^2\), at position \((i, i)\). Move the slider to pick the cell.`, String.raw`In 3D the same holds with curls instead of the second difference. The matrix is huge but each row has only a few nonzero entries.`, String.raw`Used in Lesson 2, card 1, and as the solver of the 1D demos in Lessons 2, 3 and 15.`],
say: "After discretization Maxwell's equations are a linear system A x equals b, and the design enters only through the permittivity on the diagonal of A.",
num: String.raw`A 3D region of 2.5 × 2.5 × 1 µm³ at 10 nm cells has about 6 million cells and about 19 million electric field unknowns. In the 10 × 10 picture, \(A\) has 28 nonzero entries out of 100 and \(\partial A/\partial \varepsilon_i\) only one.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zi", "Cell i", 1, 10, 1, 4) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\underbrace{{\color{#7F77DD}{A(\mathbf{p})}}}_{\text{design matrix}}\, \underbrace{{\color{#378ADD}{\mathbf{x}}}}_{\text{all fields}} = \underbrace{{\color{#1D9E75}{\mathbf{b}}}}_{\text{source}} \qquad \frac{\partial {\color{#7F77DD}{A}}}{\partial {\color{#D85A30}{\varepsilon_i}}} = \underbrace{k_0^2\, \mathbf{e}_i \mathbf{e}_i^{T}}_{\text{one entry at }(i,i)}`;
  const el = holder(fig, T), n = 10, c = 16;
  const u = () => {
    const i = +$("zi").value - 1; $("ziv").textContent = i + 1;
    let s = tx(40 + n * c / 2, 22, "A (tridiagonal)", "middle", "th") + tx(229, 22, "x", "middle", "th") + tx(285, 22, "b", "middle", "th") + tx(470 + n * c / 2, 22, "∂A/∂εᵢ = k₀² eᵢeᵢᵀ", "middle", "th");
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
      const y = 34 + r * c, x = 40 + q * c, d = Math.abs(r - q);
      const f = d === 0 ? (r === i ? PC : PP) : d === 1 ? "var(--b)" : "none";
      s += `<rect x="${x}" y="${y}" width="${c - 1}" height="${c - 1}" fill="${f}" fill-opacity="${d === 0 && r !== i ? 0.55 : d === 1 ? 0.5 : 1}" stroke="var(--line)" stroke-width="0.5"/>`;
      s += `<rect x="${470 + q * c}" y="${y}" width="${c - 1}" height="${c - 1}" fill="${r === i && q === i ? PC : "none"}" stroke="var(--line)" stroke-width="0.5"/>`;
    }
    for (let r = 0; r < n; r++) {
      s += `<rect x="221" y="${34 + r * c}" width="${c - 1}" height="${c - 1}" fill="${PB}" fill-opacity="0.55" stroke="var(--line)" stroke-width="0.5"/>`;
      s += `<rect x="277" y="${34 + r * c}" width="${c - 1}" height="${c - 1}" fill="${r === 1 ? PT : "none"}" stroke="var(--line)" stroke-width="0.5"/>`;
    }
    s += tx(253, 34 + n * c / 2 + 5, "=", "middle", "t") + tx(470 + i * c + c / 2, 34 + n * c + 16, "k₀²", "middle");
    s += tx(40, 228, "purple: k₀²εᵢ − 2/Δ² on the diagonal   grey: 1/Δ² for the two neighbours   teal: the source cell", "start");
    s += tx(40, 246, `coral: the only entry that depends on the permittivity of cell ${i + 1}`, "start");
    el.innerHTML = svg(256, s);
    $("ro").innerHTML = `<div><span>nonzeros in A</span><b>28 of 100</b></div><div><span>nonzeros in ∂A/∂ε${i + 1}</span><b>1, at (${i + 1}, ${i + 1})</b></div>`;
  };
  $("zi").oninput = u; u();
}},

/* ---------------- 3. Direct route ---------------- */
{s: "3. Direct route", t: String.raw`The direct route: \(\partial\mathbf{x}/\partial p_i = -A^{-1}(\partial A/\partial p_i)\,\mathbf{x}\)`,
intu: String.raw`To know how the figure of merit changes with one parameter, first ask how the field changes. Differentiate \(A\mathbf{x} = \mathbf{b}\): the source does not depend on the design, so the derivative of the left side must be zero. Solving for the field change needs \(A^{-1}\), which means one full simulation for each parameter. The chain rule then turns the field change into the change of \(F\). Because \(F\) is real but depends on complex fields, the derivative picks up a factor 2 and a real part. This route is correct, but it costs \(N + 1\) simulations for \(N\) parameters.`,
eq: String.raw`\[ \frac{\partial A}{\partial p_i}\mathbf{x} + A\frac{\partial \mathbf{x}}{\partial p_i} = 0 \quad\Longrightarrow\quad \frac{\partial \mathbf{x}}{\partial p_i} = -A^{-1} \frac{\partial A}{\partial p_i}\mathbf{x} \]\[ \frac{dF}{dp_i} = 2\operatorname{Re}\left\{ \frac{\partial F}{\partial \mathbf{x}} \frac{\partial \mathbf{x}}{\partial p_i} \right\} \]<div class="eqref">Michaels Eqs. (8) and (9), quoted in Ch. 3 Sec. 3.2, used in Lesson 2</div>`,
sym: [[String.raw`\(p_i\)`, "one design parameter"], [String.raw`\(\partial \mathbf{x}/\partial p_i\)`, String.raw`change of every field value per unit change of \(p_i\)`], [String.raw`\(A^{-1}\)`, "inverse matrix: applying it to a vector is one full simulation"], [String.raw`\(\partial A/\partial p_i\)`, String.raw`how the matrix changes with \(p_i\)`], [String.raw`\((\partial A/\partial p_i)\,\mathbf{x}\)`, "acts like a new source, different for every parameter"], [String.raw`\(\partial F/\partial \mathbf{x}\)`, "row vector: derivative of F with respect to each field value"], [String.raw`\(dF/dp_i\)`, String.raw`total derivative of \(F\) with respect to \(p_i\)`], [String.raw`\(\operatorname{Re}\{\cdot\}\)`, "real part of a complex number"], [String.raw`\(2\)`, "from F depending on both the field and its complex conjugate"], [String.raw`\(N\)`, "number of parameters"]],
how: [String.raw`Read it aloud: "the change of the field with parameter \(i\) is minus \(A\) inverse, times the change of the matrix, times the field".`, String.raw`It comes from the product rule on \(A\mathbf{x} = \mathbf{b}\) with \(\partial\mathbf{b}/\partial p_i = 0\).`, String.raw`\(F\) is real but \(\mathbf{x}\) is complex, so the conjugate field adds the complex conjugate of the same term, and the two add up to \(2\operatorname{Re}\{\cdot\}\).`, String.raw`Every parameter has its own right-hand side, so every parameter needs its own solve. The figure shows the field change caused by one pixel: one extra simulation for one derivative.`, String.raw`Used in Lesson 2, card 2.`],
say: "Differentiating A x equals b gives the change of the field, but it needs one extra simulation for every parameter.",
num: String.raw`The 1D device here has 60 design pixels, so the direct route needs 61 solves per gradient. Michaels and Yablonovitch: this route costs \(N + 1\) simulations, which for tens of thousands of pixels is impossible.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zj", "Pixel j whose permittivity changes", 1, 60, 1, 30) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\underbrace{{\color{#378ADD}{\frac{\partial \mathbf{x}}{\partial p_i}}}}_{\text{field change}} = -\underbrace{{\color{#7F77DD}{A^{-1}}}}_{\text{one simulation}}\; \underbrace{{\color{#D85A30}{\frac{\partial A}{\partial p_i}}}\,\mathbf{x}}_{\text{new source for each }i}`;
  const el = holder(fig, T);
  const D = new C3.Dev1D({ Nd: 60 }), rh = Float64Array.from({ length: 60 }, (_, i) => (Math.floor(i / 6) % 2 ? 1 : 0)), lam = 800;
  const e = D.eps(rh), f = C3.helm(e, lam, D.dx, D.b), k2 = Math.pow(2 * Math.PI / lam, 2), N = D.N;
  const fa = Array.from(f.re, (v, i) => Math.hypot(v, f.im[i])), fm = Math.max(...fa), xs = range(0, (N - 1) * D.dx / 1000, N);
  const u = () => {
    const j = +$("zj").value; $("zjv").textContent = j; const J = D.pad + j - 1;
    const br = new Float64Array(N), bi = new Float64Array(N); br[J] = -k2 * f.re[J]; bi[J] = -k2 * f.im[J];
    const d = C3.helm(e, lam, D.dx, br, bi), da = Array.from(d.re, (v, i) => Math.hypot(v, d.im[i])), dm = Math.max(...da);
    const X = C3.X(70, 560, 0, xs[N - 1]);
    let s = C3.stripe(70, 22, 560, 14, Array.from(e, v => (v - 1) / 11.19), PB) + tx(70, 16, "device: air | 60 design pixels of 10 nm | air", "start");
    s += C3.frame(70, 54, 560, 150, 0, xs[N - 1], 0, 1.1, [0, 0.4, 0.8, 1.2], [0, 0.5, 1], "position (µm)", "|field|, normalized", v => v.toFixed(1));
    s += plot(70, 54, 560, 150, xs, fa.map(v => v / fm), 0, xs[N - 1], 0, 1.1, PB, 2) + plot(70, 54, 560, 150, xs, da.map(v => v / dm), 0, xs[N - 1], 0, 1.1, PC, 2);
    s += `<line x1="${X(xs[J])}" x2="${X(xs[J])}" y1="22" y2="204" stroke="${PP}" stroke-dasharray="4 3"/>`;
    s += C3.legend(80, 262, [["forward field |x|", PB], ["field change |∂x/∂εⱼ|, one extra solve", PC]]);
    el.innerHTML = svg(272, s);
    $("ro").innerHTML = `<div><span>solves for this one derivative</span><b>1 extra</b></div><div><span>solves for all 60 pixels</span><b>61</b></div>`;
  };
  $("zj").oninput = u; u();
}},

/* ---------------- 4. Adjoint system, step by step ---------------- */
{s: "4. Adjoint system", t: String.raw`The adjoint system: \(A^{T}\mathbf{y} = (\partial F/\partial \mathbf{x})^{T}\)`,
intu: String.raw`Put the direct route into the chain rule and every derivative becomes a product of four things: the row \(\partial F/\partial \mathbf{x}\), the inverse \(A^{-1}\), the change \(\partial A/\partial p_i\) and the field \(\mathbf{x}\). The expensive part is \(A^{-1}\). The direct route applies it to a new right-hand side for every parameter. The adjoint method brackets the same product the other way: it applies \(A^{-1}\) to \(\partial F/\partial \mathbf{x}\) first, which does not depend on \(i\). That product is one vector \(\mathbf{y}\), found by solving the transposed system once, with the derivative of the figure of merit as its source. Step through the regrouping, the way you would write it on the board.`,
eq: String.raw`\[ A^{T}\,\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \quad\Longleftrightarrow\quad \mathbf{y}^{T} = \frac{\partial F}{\partial \mathbf{x}}\, A^{-1} \]<div class="eqref">Ch. 3 Eq. (3.3), Michaels Eq. (11), used in Lesson 2</div>`,
sym: [[String.raw`\(\mathbf{y}\)`, "the adjoint field"], [String.raw`\(A^{T}\)`, String.raw`transposed matrix, equal to \(A\) for a reciprocal medium, so the same solver works`], [String.raw`\((\partial F/\partial \mathbf{x})^{T}\)`, String.raw`the adjoint source: where, and how strongly, \(F\) looks at the field`], [String.raw`\(\mathbf{y}^{T}\)`, "the adjoint field written as a row"], [String.raw`\(\Longleftrightarrow\)`, '"is the same statement as"']],
how: [String.raw`Read it aloud: "\(A\) transpose times \(\mathbf{y}\) equals the transpose of \(\partial F/\partial\mathbf{x}\)".`, String.raw`Start from \(\frac{dF}{dp_i} \propto \frac{\partial F}{\partial \mathbf{x}}\,A^{-1}\,\frac{\partial A}{\partial p_i}\,\mathbf{x}\), the chain rule with the direct route of card 3.`, String.raw`Direct bracketing: \(\frac{\partial F}{\partial \mathbf{x}}\big[A^{-1}\big(\frac{\partial A}{\partial p_i}\mathbf{x}\big)\big]\). One solve for each \(i\).`, String.raw`Adjoint bracketing: \(\big[\frac{\partial F}{\partial \mathbf{x}}A^{-1}\big]\big[\frac{\partial A}{\partial p_i}\mathbf{x}\big]\). The first bracket does not depend on \(i\), so it is solved once. Transposing \(\mathbf{y}^{T} = \frac{\partial F}{\partial \mathbf{x}}A^{-1}\) gives \(A^{T}\mathbf{y} = (\partial F/\partial \mathbf{x})^{T}\).`, String.raw`For a reciprocal medium \(A^{T} = A\): the adjoint run uses the same solver, with its source placed where \(F\) measures the field, at the output. Used in Lesson 2, card 3.`],
say: "The adjoint method solves one extra system, the transposed system with the derivative of the figure of merit as its source, instead of one system per parameter.",
num: String.raw`With 48 400 pixels the direct route needs 48 401 solves per gradient, the adjoint route 2: the forward solve for \(\mathbf{x}\) and the adjoint solve for \(\mathbf{y}\).`,
r(fig, ctl) {
  const caps = ["The chain rule with the direct route: the derivative for parameter i is a product of four objects, a row, a matrix inverse, a matrix and a column.",
    "Direct bracketing: A⁻¹ acts on (∂A/∂pᵢ) x, a new right-hand side for every parameter i. One solve per parameter.",
    "Adjoint bracketing: multiply the row ∂F/∂x by A⁻¹ first. This bracket does not contain i, so it is the same for every parameter.",
    "Name it yᵀ = (∂F/∂x) A⁻¹. Transposed, that is Aᵀ y = (∂F/∂x)ᵀ: one extra solve, with the derivative of F as its source.",
    "Now every derivative is yᵀ (∂A/∂pᵢ) x, a cheap product of two stored fields. Two solves give the whole gradient."];
  const el = holder(fig, String.raw`\frac{dF}{dp_i} \propto \underbrace{{\color{#D85A30}{\frac{\partial F}{\partial \mathbf{x}}}}}_{\text{row}}\; \underbrace{{\color{#7F77DD}{A^{-1}}}}_{\text{solve}}\; \underbrace{{\color{#BA7517}{\frac{\partial A}{\partial p_i}}}}_{\text{depends on } i}\; \underbrace{{\color{#378ADD}{\mathbf{x}}}}_{\text{forward}} \qquad {\color{#7F77DD}{A^{T}}}\,{\color{#1D9E75}{\mathbf{y}}} = {\color{#D85A30}{\left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T}}}`);
  ctl.innerHTML = '<div id="z4c"></div><div class="readout" id="ro"></div>';
  steps(fig, $("z4c"), caps, (k, t) => {
    const row = (x, y, c, lab) => `<rect x="${x}" y="${y - 10}" width="120" height="20" rx="3" fill="${c}" fill-opacity="0.75"/>` + tx(x + 60, y - 18, lab, "middle", "t");
    const mat = (x, y, c, lab) => `<rect x="${x}" y="${y - 55}" width="110" height="110" rx="4" fill="${c}" fill-opacity="0.35" stroke="${c}"/>` + tx(x + 55, y + 6, lab, "middle", "t");
    const col = (x, y, c, lab) => `<rect x="${x}" y="${y - 55}" width="20" height="110" rx="3" fill="${c}" fill-opacity="0.75"/>` + tx(x + 28, y + 6, lab, "start", "t");
    const br = (x1, x2, y, c) => `<path d="M${x1} ${y - 8} L${x1} ${y} L${x2} ${y} L${x2} ${y - 8}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
    const Y0 = 80;
    let s = row(20, Y0, PC, "∂F/∂x") + mat(170, Y0, PP, "A⁻¹") + mat(310, Y0, PA, "∂A/∂pᵢ") + col(450, Y0, PB, "x");
    if (k === 1) s += br(165, 475, Y0 + 92, PP) + br(305, 475, Y0 + 80, PA) + tx(320, Y0 + 114, "a new solve for every i", "middle", "t");
    if (k >= 2 && k <= 3) s += br(15, 285, Y0 + 80, PT) + tx(150, Y0 + 104, k === 2 ? "same for every i" : "= yᵀ, one solve", "middle", "t") + br(305, 475, Y0 + 80, PA) + tx(390, Y0 + 104, "cheap for each i", "middle", "t");
    if (k === 3) s += `<rect x="500" y="${Y0 - 40}" width="170" height="64" rx="8" fill="var(--sunk)" stroke="${PT}"/>` + tx(585, Y0 - 12, "Aᵀ y = (∂F/∂x)ᵀ", "middle", "th") + tx(585, Y0 + 10, "the adjoint system", "middle");
    if (k === 4) { s = row(20, Y0, PT, "yᵀ") + mat(170, Y0, PA, "∂A/∂pᵢ") + col(310, Y0, PB, "x") + tx(370, Y0 + 5, "for i = 1, 2, ..., N", "start", "t"); for (let i = 0; i < 6; i++) { const on = Math.floor(t * 3) % 6 === i; s += `<rect x="${480 + i * 30}" y="${Y0 - 12}" width="22" height="22" rx="4" fill="${on ? PC : "var(--sunk)"}" stroke="var(--b)"/>`; } s += tx(565, Y0 + 32, "one number per parameter", "middle"); }
    const solves = k === 0 ? "" : k === 1 ? "N + 1 (forward plus one per parameter)" : "2 (forward and adjoint)";
    el.innerHTML = svg(205, s);
    $("ro").innerHTML = `<div><span>solves per gradient</span><b>${solves || "choose a bracketing"}</b></div><div><span>step</span><b>${["the product", "direct", "adjoint", "adjoint system", "gradient"][k]}</b></div>`;
  }, { cont: true, dwell: 3.4 });
}},

/* ---------------- 5. Gradient ---------------- */
{s: "5. Gradient", t: String.raw`The gradient from two fields: \(\partial F/\partial p_i = -2\,\mathrm{Re}\{\mathbf{y}^{T}(\partial A/\partial p_i)\,\mathbf{x}\}\)`,
intu: String.raw`Once the adjoint field \(\mathbf{y}\) is known, the derivative with respect to every parameter follows from quantities that are already available: the forward field \(\mathbf{x}\), the adjoint field \(\mathbf{y}\), and the local change of the matrix \(\partial A/\partial p_i\), which needs no simulation. The minus sign comes from the direct route, and the factor 2 and the real part from \(F\) being real while the fields are complex. Finite differences, changing each parameter slightly up and down, need \(2N\) simulations for \(N\) parameters. The adjoint method needs 2 for any \(N\). Slide \(N\) and compare.`,
eq: String.raw`\[ \frac{\partial F}{\partial p_i} = -2\,\mathrm{Re}\left\{ \mathbf{y}^{T}\,\frac{\partial A}{\partial p_i}\,\mathbf{x}\right\} \]<div class="eqref">Ch. 3 Eq. (3.4), Michaels Eq. (12), used in Lesson 2</div>`,
sym: [[String.raw`\(\mathbf{y}^{T}(\partial A/\partial p_i)\,\mathbf{x}\)`, "a single number for each parameter"], [String.raw`\(\partial A/\partial p_i\)`, "local change of the matrix, known from the geometry, no simulation needed"], [String.raw`\(-2\,\mathrm{Re}\{\cdot\}\)`, "the factor and real part carried over from card 3, with the minus sign of the direct route"], [String.raw`\(N\)`, "number of parameters"], [String.raw`\(2N\)`, "simulations for finite differences, one up and one down per parameter"]],
how: [String.raw`Read it aloud: "the derivative of \(F\) with respect to \(p_i\) is minus two times the real part of \(\mathbf{y}\) transpose, times the change of \(A\), times \(\mathbf{x}\)".`, String.raw`It is the product of card 4 with the adjoint bracket replaced by \(\mathbf{y}^{T}\), and the \(-1\) of \(\partial\mathbf{x}/\partial p_i = -A^{-1}(\partial A/\partial p_i)\mathbf{x}\) kept.`, String.raw`\(\partial A/\partial p_i\) is sparse: a pixel changes one diagonal entry, an edge changes a few. So each product costs almost nothing.`, String.raw`Cost per gradient: finite differences \(2N\), the direct route \(N + 1\), the adjoint method 2 for any \(N\).`, String.raw`Used in Lesson 2, card 3, and Lesson 1, card 6.`],
say: "Once the forward and adjoint fields are known, each parameter's derivative is minus two times the real part of the adjoint field times the change of the matrix times the forward field.",
num: String.raw`With 10 000 parameters, finite differences need 20 000 simulations per gradient and the adjoint method 2. The PBS, with two input polarizations, needs two forward and two adjoint runs per step.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zm", "Number of parameters N (log scale)", 0, 5, 0.05, 4) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\frac{\partial F}{\partial p_i} = -2\operatorname{Re}\Big\{ \underbrace{{\color{#1D9E75}{\mathbf{y}^{T}}}}_{\text{adjoint}}\, \underbrace{{\color{#BA7517}{\frac{\partial A}{\partial p_i}}}}_{\text{local change}}\, \underbrace{{\color{#378ADD}{\mathbf{x}}}}_{\text{forward}} \Big\}`;
  const el = holder(fig, T), lab = ["1", "10", "100", "1000", "10⁴", "10⁵"];
  const u = () => {
    const lm = +$("zm").value, M = Math.round(Math.pow(10, lm)); $("zmv").textContent = M.toLocaleString("en-US");
    const ls = range(0, 5, 101), X = C3.X(80, 540, 0, 5), Y = C3.Y(20, 180, 0, 5.5);
    let s = C3.frame(80, 20, 540, 180, 0, 5, 0, 5.5, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], "number of parameters N", "simulations per gradient", v => lab[v], v => lab[v]);
    s += plot(80, 20, 540, 180, ls, ls.map(v => Math.log10(2 * Math.pow(10, v))), 0, 5, 0, 5.5, PC, 2.5) + plot(80, 20, 540, 180, ls, ls.map(v => Math.log10(Math.pow(10, v) + 1)), 0, 5, 0, 5.5, PA, 2, "5 4") + plot(80, 20, 540, 180, ls, ls.map(() => Math.log10(2)), 0, 5, 0, 5.5, PT, 2.5);
    s += `<line x1="${X(Math.log10(M))}" x2="${X(Math.log10(M))}" y1="20" y2="200" stroke="${PP}" stroke-dasharray="4 3"/><circle cx="${X(Math.log10(M))}" cy="${Y(Math.log10(2 * M))}" r="5" fill="${PC}"/><circle cx="${X(Math.log10(M))}" cy="${Y(Math.log10(2))}" r="5" fill="${PT}"/>`;
    s += C3.legend(90, 252, [["finite differences: 2N", PC], ["direct route: N + 1", PA, "5 4"], ["adjoint: 2", PT]]);
    el.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>finite differences</span><b>${(2 * M).toLocaleString("en-US")} simulations</b></div><div><span>adjoint method</span><b>2 simulations</b></div>`;
  };
  $("zm").oninput = u; u();
}},

/* ---------------- 6. Field times field ---------------- */
{s: "6. Field times field", t: String.raw`The pixel gradient: forward field times adjoint field`,
intu: String.raw`For a pixel, \(\partial A/\partial \varepsilon_i\) has one entry, \(k_0^2\), so the adjoint gradient of card 5 collapses to the product of the forward and adjoint fields at that pixel. Where both fields are strong and in phase, adding permittivity raises \(F\). Tidy3D writes the same result for vector fields in 3D and adds it up over all the frequencies of the objective. The constant factors differ because Tidy3D folds them into the adjoint source, but the meaning is the same: the sensitivity map is the overlap of the two runs.`,
eq: String.raw`\[ \frac{\partial F}{\partial \varepsilon_i} = -2k_0^2 \operatorname{Re}\{ y_i x_i \} \]\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \operatorname{Re} \sum_f \mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f) \cdot \mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f) \]<div class="eqref">Ch. 3 Eq. (3.5), Lalau-Keraly Eq. (5), used in Lessons 2 and 3</div>`,
sym: [[String.raw`\(x_i,\ y_i\)`, String.raw`forward and adjoint field at pixel \(i\)`], [String.raw`\(k_0^2\)`, String.raw`the single entry of \(\partial A/\partial \varepsilon_i\)`], [String.raw`\(\partial J/\partial \varepsilon(\mathbf{r})\)`, String.raw`sensitivity at position \(\mathbf{r}\): how fast \(J\) grows if the permittivity there is raised`], [String.raw`\(\sum_f\)`, "sum over the frequencies (wavelengths) in the objective"], [String.raw`\(\mathbf{E}_{\mathrm{fwd}}(\mathbf{r}, f)\)`, String.raw`electric field of the forward run at \(\mathbf{r}\) and frequency \(f\)`], [String.raw`\(\mathbf{E}_{\mathrm{adj}}(\mathbf{r}, f)\)`, "electric field of the adjoint run"], [String.raw`\(\cdot\)`, String.raw`dot product of the two vectors, a plain product without complex conjugate, as in \(\mathbf{y}^{T}\)`], [String.raw`\(\operatorname{Re}\)`, "real part"]],
how: [String.raw`Read it aloud: "the sensitivity at \(\mathbf{r}\) is the real part of the sum over frequencies of the forward field dotted with the adjoint field".`, String.raw`Insert \(\partial A/\partial \varepsilon_i = k_0^2\mathbf{e}_i\mathbf{e}_i^{T}\) into card 5: \(\mathbf{y}^{T}\mathbf{e}_i\mathbf{e}_i^{T}\mathbf{x} = y_i x_i\).`, String.raw`A positive value means: add GaAs here to raise \(J\). A negative value means: remove it. The bars in the figure are exactly this, computed from two solves.`, String.raw`In the time domain one pulse covers all the frequencies, so the sum over \(f\) still costs only two simulations. The dashed line is the Gaussian-weighted sum over five wavelengths around 800 nm.`, String.raw`Used in Lesson 2, card 4, and Lesson 3, cards 1 and 2.`],
say: "The gradient with respect to the permittivity at a point is the product of the forward and adjoint fields there, summed over the design frequencies.",
num: String.raw`This 1D device has 60 pixels of 10 nm between air (\(\varepsilon = 1\)) and GaAs (\(\varepsilon = 12.19\)). Two solves give all 60 derivatives. Five wavelengths need the same two simulations in the time domain, because one pulse covers them all.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zl", "Wavelength λ (nm)", 700, 900, 2, 800) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\underbrace{{\color{#D85A30}{\frac{\partial J}{\partial \varepsilon(\mathbf{r})}}}}_{\text{sensitivity map}} = \operatorname{Re} \underbrace{\sum_f}_{\text{all frequencies}} \underbrace{{\color{#378ADD}{\mathbf{E}_{\mathrm{fwd}}}}}_{\text{forward run}} \cdot \underbrace{{\color{#1D9E75}{\mathbf{E}_{\mathrm{adj}}}}}_{\text{adjoint run}}`;
  const el = holder(fig, T);
  const D = new C3.Dev1D({ Nd: 60 }), rh = Float64Array.from({ length: 60 }, (_, i) => ((i >= 8 && i < 20) || (i >= 34 && i < 50) ? 1 : 0));
  const lams = range(770, 830, 5), w0 = lams.map(l => Math.exp(-((l - 800) ** 2) / (2 * 15 * 15))), ws = w0.map(v => v / sum(w0)), gb = new Float64Array(60);
  lams.forEach((l, k) => { const r = D.T(rh, l, true); for (let i = 0; i < 60; i++) gb[i] += ws[k] * r.grad[i]; });
  const gbm = absMax(gb), xs = Array.from({ length: 60 }, (_, i) => i * 10 + 5);
  const u = () => {
    const lam = +$("zl").value; $("zlv").textContent = lam + " nm";
    const r = D.T(rh, lam, true), p = D.pad, xr = Array.from(r.fwd.re.slice(p, p + 60)), yr = Array.from(r.adj.re.slice(p, p + 60)), xm = absMax(xr), ym = absMax(yr), g = r.grad, gm = absMax(g);
    const X = C3.X(70, 560, 0, 600), Y2 = C3.Y(175, 100, -1.15, 1.15);
    let s = C3.stripe(70, 14, 560, 12, rh, PB);
    s += C3.frame(70, 40, 560, 100, 0, 600, -1.15, 1.15, [], [-1, 0, 1], "", "Re field");
    s += plot(70, 40, 560, 100, xs, xr.map(v => v / xm), 0, 600, -1.15, 1.15, PB, 2) + plot(70, 40, 560, 100, xs, yr.map(v => v / ym), 0, 600, -1.15, 1.15, PT, 2);
    s += C3.frame(70, 175, 560, 100, 0, 600, -1.15, 1.15, [0, 100, 200, 300, 400, 500, 600], [-1, 0, 1], "position in the design region (nm)", "∂T/∂εᵢ");
    for (let i = 0; i < 60; i++) { const v = g[i] / gm, y0 = Y2(0), y1 = Y2(v); s += `<rect x="${(X(i * 10) + 1).toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${(560 / 60 - 2).toFixed(1)}" height="${Math.abs(y1 - y0).toFixed(1)}" fill="${v >= 0 ? PC : PP}" opacity="0.8"/>`; }
    s += plot(70, 175, 560, 100, xs, Array.from(gb, v => v / gbm), 0, 600, -1.15, 1.15, "var(--t)", 1.8, "5 4");
    s += C3.legend(80, 332, [["Re forward", PB], ["Re adjoint", PT], ["band sum (5 wavelengths)", "var(--t)", "5 4"]]) + tx(80, 352, "bars: ∂T/∂εᵢ at the chosen λ, coral means add GaAs, purple means remove it", "start");
    el.innerHTML = svg(362, s);
    $("ro").innerHTML = `<div><span>transmission T at ${lam} nm</span><b>${r.T.toFixed(3)}</b></div><div><span>solves for all 60 derivatives</span><b>2</b></div>`;
  };
  $("zl").oninput = u; u();
}},

/* ---------------- 7. Boundary ---------------- */
{s: "7. Moving a boundary", t: String.raw`Moving a boundary: tangential \(\mathbf{E}\) and normal \(D\)`,
intu: String.raw`For a structure defined by its boundary, such as the grating teeth, the DBR layers and the taper and PBS outlines, a parameter moves an edge instead of changing a pixel, and the material change sits on a thin sheet at the boundary. The thesis says it in words: Tidy3D evaluates the same overlap on the boundary itself, using only the field components that are continuous across it. The gradient is the field product integrated over that surface, weighted by how fast each point of the surface moves. Across a GaAs and air interface the tangential electric field and the normal displacement are continuous, but the normal electric field jumps by the permittivity ratio. The formula therefore uses only continuous quantities: the tangential \(\mathbf{E}\) with the jump of \(\varepsilon\), and the normal \(D\) with the jump of \(1/\varepsilon\). Then it does not matter on which side of the edge the fields are sampled.`,
eq: String.raw`\[ \frac{\partial J}{\partial p_i} = \operatorname{Re} \sum_f \int_S \left[ \Delta\varepsilon\, \mathbf{E}_{\parallel,\mathrm{fwd}} \cdot \mathbf{E}_{\parallel,\mathrm{adj}} - \Delta(\varepsilon^{-1})\, D_{\perp,\mathrm{fwd}}\, D_{\perp,\mathrm{adj}} \right] v_{n,i}\, dS \]\[ \mathbf{E}_{\parallel}^{\mathrm{in}} = \mathbf{E}_{\parallel}^{\mathrm{out}}, \qquad D_{\perp}^{\mathrm{in}} = D_{\perp}^{\mathrm{out}} \quad\Longrightarrow\quad E_{\perp}^{\mathrm{out}} = \frac{\varepsilon_{\mathrm{in}}}{\varepsilon_{\mathrm{out}}}\, E_{\perp}^{\mathrm{in}} \]<div class="eqref">Ch. 3 Sec. 3.2 in words (not numbered), form after Lalau-Keraly Sec. 2 and Tidy3D, used in Lesson 3</div>`,
sym: [[String.raw`\(S\)`, "the boundary surface of the structure"], [String.raw`\(\int_S \dots dS\)`, "integral over that surface"], [String.raw`\(\Delta\varepsilon\)`, String.raw`change of \(\varepsilon\) across \(S\), from outside to inside: \(\varepsilon_{\mathrm{in}} - \varepsilon_{\mathrm{out}}\), 11.19 for GaAs and air`], [String.raw`\(\Delta(\varepsilon^{-1})\)`, String.raw`change of \(1/\varepsilon\) across \(S\)`], [String.raw`\(\mathbf{E}_{\parallel}\)`, "electric field component tangential to the surface, forward and adjoint"], [String.raw`\(E_{\perp}\)`, "electric field component normal to the surface, jumps across it"], [String.raw`\(D_{\perp} = \varepsilon E_{\perp}\)`, "normal displacement field, continuous across the surface"], [String.raw`\(v_{n,i}\)`, String.raw`normal velocity: how far each surface point moves outward per unit change of \(p_i\)`], [String.raw`\(\sum_f,\ \operatorname{Re}\)`, "sum over frequencies and real part, as in card 6"]],
how: [String.raw`Read it aloud: "the derivative with respect to \(p_i\) is the real part of the sum over frequencies of the surface integral of delta epsilon times E parallel dot E parallel, minus delta of one over epsilon times D perp times D perp, all times the normal velocity".`, String.raw`\(v_{n,i}\) says which parts of the boundary move when \(p_i\) changes. For a tooth width only its two edges move, so only they contribute.`, String.raw`Continuity: \(\mathbf{E}_{\parallel}\) and \(D_{\perp}\) are equal on both sides, while \(E_{\perp}\) outside is \(\varepsilon_{\mathrm{in}}/\varepsilon_{\mathrm{out}}\) times larger. The figure shows the three components across the edge.`, String.raw`At normal incidence in 1D the field is tangential, so only the first term remains.`, String.raw`Used in Lesson 3, cards 4 and 5, for grating widths, DBR layers, taper points and outline vertices.`],
say: "For a moving edge the gradient is a surface integral of the forward and adjoint fields, written with the tangential E and the normal D because those are continuous across the boundary.",
num: String.raw`GaAs and air: \(\varepsilon_{\mathrm{in}}/\varepsilon_{\mathrm{out}} = 12.19\), so the normal \(E\) field outside is 12 times larger than inside. Sampling \(E_{\perp}\) on the wrong side would give a gradient wrong by an order of magnitude.`,
r(fig, ctl) {
  const T = String.raw`\frac{\partial J}{\partial p_i} = \operatorname{Re}\sum_f \int_S \Big[ \underbrace{{\color{#D85A30}{\Delta\varepsilon}}\, {\color{#378ADD}{\mathbf{E}_{\parallel}\cdot\mathbf{E}_{\parallel}}}}_{\text{tangential E}} - \underbrace{{\color{#D85A30}{\Delta(\varepsilon^{-1})}}\, {\color{#1D9E75}{D_{\perp}D_{\perp}}}}_{\text{normal D}} \Big]\, \underbrace{{\color{#7F77DD}{v_{n,i}}}}_{\text{edge speed}}\, dS`;
  const el = holder(fig, T), X = C3.X(70, 560, -1, 1), Y = C3.Y(30, 170, 0, 1.15);
  let s = `<rect x="70" y="30" width="280" height="170" fill="var(--blue-bg)" opacity="0.7"/>` + tx(210, 20, "inside: GaAs, ε = 12.19", "middle", "th") + tx(490, 20, "outside: air, ε = 1", "middle", "th");
  s += C3.frame(70, 30, 560, 170, -1, 1, 0, 1.15, [], [], "position across the boundary", "field (each in its own units)");
  s += `<line x1="${X(-1)}" x2="${X(1)}" y1="${Y(0.42)}" y2="${Y(0.42)}" stroke="${PB}" stroke-width="2.5"/>`;
  s += `<line x1="${X(-1)}" x2="${X(1)}" y1="${Y(0.66)}" y2="${Y(0.66)}" stroke="${PT}" stroke-width="2.5" stroke-dasharray="7 4"/>`;
  s += `<path d="M${X(-1)} ${Y(0.92 / 12.19)} L${X(0)} ${Y(0.92 / 12.19)} L${X(0)} ${Y(0.92)} L${X(1)} ${Y(0.92)}" fill="none" stroke="${PC}" stroke-width="2.5"/>`;
  s += tx(X(-0.5), Y(0.42) - 7, "E∥ continuous", "middle") + tx(X(-0.5), Y(0.66) - 7, "D⊥ = εE⊥ continuous", "middle") + tx(X(-0.5), Y(0.92 / 12.19) - 7, "E⊥ small inside", "middle") + tx(X(0.5), Y(0.92) + 17, "E⊥ outside = 12.19 × inside", "middle");
  s += `<line x1="${X(0)}" x2="${X(0)}" y1="30" y2="200" stroke="var(--t)" stroke-width="1.5"/>` + arrow(X(0), 254, X(0.25), 254, PP, 2) + tx(X(0.27), 258, "vₙ: the edge moves outward when pᵢ grows", "start");
  el.innerHTML = svg(268, s);
}},

/* ---------------- 8. Chain rule ---------------- */
{s: "8. Chain rule", t: String.raw`The chain rule to every parameter: \(\partial J/\partial \mathbf{p}\)`,
intu: String.raw`The simulations give the sensitivity to the permittivity at every point. The optimizer needs the sensitivity to its own parameters, such as a width or a pixel density. The chain rule connects the two: add up the sensitivity map times how much the permittivity at each point changes with the parameter. A slab width moves only one edge, so only the cells at that edge contribute. The penalties need no simulation at all, their gradients come straight from their formulas. In the code, the geometry, the simulation and the figure of merit form one Python function, and the automatic differentiation of Tidy3D does this bookkeeping.`,
eq: String.raw`\[ \frac{\partial J}{\partial \mathbf{p}} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \frac{\partial \varepsilon(\mathbf{r})}{\partial \mathbf{p}} - \sum_k w_k \frac{\partial P_k}{\partial \mathbf{p}} \]<div class="eqref">Chain rule done by autograd, used in Lesson 3</div>`,
sym: [[String.raw`\(\partial J/\partial \mathbf{p}\)`, "the gradient handed to the optimizer"], [String.raw`\(\sum_{\mathbf{r}}\)`, "sum over all grid points"], [String.raw`\(\partial J/\partial \varepsilon(\mathbf{r})\)`, "sensitivity map from two simulations (card 6)"], [String.raw`\(\partial \varepsilon(\mathbf{r})/\partial \mathbf{p}\)`, "how the parameters change the permittivity: geometry, filter, projection, interpolation"], [String.raw`\(w_k\)`, "penalty weights (card 1)"], [String.raw`\(\partial P_k/\partial \mathbf{p}\)`, "penalty gradients, from their formulas only"]],
how: [String.raw`Read it aloud: "the gradient with respect to \(\mathbf{p}\) is the sum over all points of the sensitivity map times the change of the permittivity with \(\mathbf{p}\), minus the weighted penalty gradients".`, String.raw`The first factor is physics and costs two simulations per input. The second factor is geometry and costs almost nothing.`, String.raw`For pixels, \(\partial\varepsilon/\partial\mathbf{p}\) runs back through interpolation, projection and filter (cards 11 to 14). For a width it is nonzero only at the moving edge, as the figure shows.`, String.raw`In the figure, \(dT/dL \approx \Delta\varepsilon \cdot (\partial T/\partial \varepsilon)_{\mathrm{edge}}/\Delta\), the product of the two panels summed over cells.`, String.raw`Used in Lesson 3, card 6, and in every stage of Lesson 15.`],
say: "Autograd multiplies the simulated sensitivity map by the derivative of the permittivity with respect to each parameter and subtracts the penalty gradients.",
num: String.raw`Cost per step: two simulations per input, whatever the number of parameters. Chain rule steps through filters and projections cost almost nothing next to a 3D FDTD run.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zL", "Slab width L (pixels of 10 nm)", 4, 40, 1, 18) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\underbrace{{\color{#D85A30}{\frac{\partial J}{\partial \mathbf{p}}}}}_{\text{for the optimizer}} = \sum_{\mathbf{r}} \underbrace{{\color{#378ADD}{\frac{\partial J}{\partial \varepsilon(\mathbf{r})}}}}_{\text{two simulations}}\, \underbrace{{\color{#1D9E75}{\frac{\partial \varepsilon(\mathbf{r})}{\partial \mathbf{p}}}}}_{\text{geometry}} - \underbrace{\sum_k {\color{#BA7517}{w_k}}\, {\color{#7F77DD}{\frac{\partial P_k}{\partial \mathbf{p}}}}}_{\text{penalties, no simulation}}`;
  const el = holder(fig, T), D = new C3.Dev1D({ Nd: 60 }), X = C3.X(70, 560, 0, 600);
  const u = () => {
    const L = +$("zL").value; $("zLv").textContent = L + " (" + L * 10 + " nm)";
    const rh = Float64Array.from({ length: 60 }, (_, i) => (i >= 10 && i < 10 + L ? 1 : 0)), r = D.T(rh, 800, true), g = r.grad, gm = absMax(g), ed = 10 + L;
    const Y1 = C3.Y(52, 100, -1.15, 1.15);
    let s = C3.stripe(70, 20, 560, 14, rh, PB) + tx(70, 14, "GaAs slab, its right edge is the parameter", "start");
    s += C3.frame(70, 52, 560, 100, 0, 600, -1.15, 1.15, [], [-1, 0, 1], "", "∂T/∂ε");
    for (let i = 0; i < 60; i++) { const v = g[i] / gm, y0 = Y1(0), y1 = Y1(v); s += `<rect x="${(X(i * 10) + 1).toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${(560 / 60 - 2).toFixed(1)}" height="${Math.abs(y1 - y0).toFixed(1)}" fill="${PB}" opacity="${i === ed ? 1 : 0.35}"/>`; }
    s += C3.frame(70, 180, 560, 60, 0, 600, 0, 1.1, [0, 100, 200, 300, 400, 500, 600], [], "position in the design region (nm)", "∂ε/∂L");
    s += `<rect x="${(X(ed * 10) + 1).toFixed(1)}" y="${C3.Y(180, 60, 0, 1.1)(1)}" width="${(560 / 60 - 2).toFixed(1)}" height="${(60 / 1.1).toFixed(1)}" fill="${PT}"/>` + tx(X(ed * 10) + 14, 200, "Δε/Δ at the moving edge, zero elsewhere", "start");
    el.innerHTML = svg(290, s);
    $("ro").innerHTML = `<div><span>T at 800 nm</span><b>${r.T.toFixed(3)}</b></div><div><span>dT/dL from the chain rule</span><b>${(11.19 * g[ed] / 10 * 1000).toFixed(2)} per µm</b></div>`;
  };
  $("zL").oninput = u; u();
}},

/* ---------------- 9. Bounded widths ---------------- */
{s: "9. Bounded widths", t: String.raw`Bounded widths: \(w(p) = \tfrac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}})\tanh p + \tfrac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}})\)`,
intu: String.raw`Adam can push a parameter to any value, but a grating tooth or gap must stay between the smallest width that can be written and the largest that makes sense. The trick is to let the optimizer move a free number \(p_i\), one entry of \(\mathbf{p}\), and compute the width from it. The tanh function maps every real \(p\) into the range from \(-1\) to 1. Scaling by half the range and adding the midpoint turns that into the range from \(w_{\mathrm{min}}\) to \(w_{\mathrm{max}}\), so no value of \(p\) can break the bounds. Near a bound the slope \(\operatorname{sech}^2 p\) becomes small, so steps there change the width less.`,
eq: String.raw`\[ w(p) = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \tanh p + \frac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}}) \]\[ \frac{dw}{dp} = \frac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}}) \operatorname{sech}^2 p \]<div class="eqref">Ch. 3 Eq. (3.6), used in Lesson 4</div>`,
sym: [[String.raw`\(w\)`, "width of one grating tooth or gap, in nm"], [String.raw`\(p\)`, "free parameter moved by the optimizer, any real number"], [String.raw`\(w_{\mathrm{min}},\ w_{\mathrm{max}}\)`, "smallest and largest allowed width, 80 nm and 1 µm for the gratings"], [String.raw`\(\tanh p\)`, String.raw`hyperbolic tangent: between \(-1\) and 1, zero at \(p = 0\)`], [String.raw`\(\tfrac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}})\)`, "half the allowed range"], [String.raw`\(\tfrac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}})\)`, "the midpoint of the range"], [String.raw`\(\operatorname{sech}^2 p\)`, String.raw`\(1 - \tanh^2 p\), the slope of tanh: 1 at \(p = 0\), near 0 for large \(|p|\)`], [String.raw`\(dw/dp\)`, "how much the width moves per unit step in q"]],
how: [String.raw`Read it aloud: "the width is half the range times tanh of \(p\), plus the midpoint".`, String.raw`\(p = 0\) gives the midpoint. \(p \to \pm\infty\) approaches the bounds but never passes them.`, String.raw`The chain rule passes the gradient through the slope: \(\partial J/\partial p = (\partial J/\partial w)(dw/dp)\). Near a bound the slope is small and the width saturates.`, String.raw`A grating is a list of such widths, gaps and teeth alternating, \(w_j = w(p_j)\) for \(j = 1, \dots, 2N\).`, String.raw`Used in Lesson 4, cards 1 to 3. The designs carried to 3D have \(N = 9\) teeth, so 18 parameters.`],
say: "Each width is a tanh of a free parameter, scaled to the allowed range, so the optimizer can never step outside the bounds.",
num: String.raw`With the grating bounds \(w_{\mathrm{min}} = 80\) nm and \(w_{\mathrm{max}} = 1\) µm, \(p = 0\) gives 540 nm and \(p = 2\) gives 983 nm. A step \(\Delta p = 0.1\) moves the width by 46 nm at \(p = 0\) but by only 3 nm at \(p = 2\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("zq", "Free parameter p", -3, 3, 0.05, 0) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{w}}({\color{#378ADD}{p}}) = \underbrace{\tfrac{1}{2}(w_{\mathrm{max}} - w_{\mathrm{min}})}_{\text{half the range}}\, \underbrace{\tanh {\color{#378ADD}{p}}}_{\text{between }-1\text{ and }1} + \underbrace{\tfrac{1}{2}(w_{\mathrm{max}} + w_{\mathrm{min}})}_{\text{midpoint}}`;
  const el = holder(fig, T), W = q => 460 * Math.tanh(q) + 540, qs = range(-3, 3, 241);
  const u = () => {
    const q = +$("zq").value; $("zqv").textContent = q.toFixed(2);
    const X = C3.X(80, 540, -3, 3), Y = C3.Y(20, 180, 0, 1100), sl0 = 460 / Math.cosh(q) ** 2;
    let s = C3.frame(80, 20, 540, 180, -3, 3, 0, 1100, [-3, -2, -1, 0, 1, 2, 3], [80, 540, 1000], "free parameter p", "width w (nm)");
    for (const b of [80, 1000]) s += `<line x1="80" x2="620" y1="${Y(b)}" y2="${Y(b)}" stroke="${PP}" stroke-dasharray="5 4"/>`;
    s += tx(90, Y(800) - 6, "w_max", "start") + tx(610, Y(100) - 6, "w_min", "end");
    s += plot(80, 20, 540, 180, qs, qs.map(W), -3, 3, 0, 1100, PC, 2.5);
    s += `<line x1="${X(q - 0.7)}" x2="${X(q + 0.7)}" y1="${Y(W(q) - 0.7 * sl0)}" y2="${Y(W(q) + 0.7 * sl0)}" stroke="${PT}" stroke-width="2"/><circle cx="${X(q)}" cy="${Y(W(q))}" r="6" fill="${PB}"/>`;
    s += C3.legend(90, 250, [["w(p)", PC], ["slope dw/dp", PT]]);
    el.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>width w</span><b>${W(q).toFixed(1)} nm</b></div><div><span>slope dw/dp</span><b>${sl0.toFixed(1)} nm</b></div><div><span>change for Δp = 0.1</span><b>${(W(q + 0.1) - W(q)).toFixed(1)} nm</b></div>`;
  };
  $("zq").oninput = u; u();
}},

/* ---------------- 10. DBR and taper ---------------- */
{s: "10. DBR and taper", t: String.raw`Mirror layers and taper half-widths, bounded by tanh`,
intu: String.raw`The same idea serves two other geometries. For the grating with a chosen air gap, each DBR layer starts at its quarter-wave thickness, and the optimizer may scale it between half and one and a half times that value. A taper is described by its half-width at many points along its length, and each must stay between the half-widths of the input and output waveguides. The taper form uses \((\tanh + 1)/2\), which runs from 0 to 1, to blend between the two ends, and the factor \(\pi\) makes the blend steep enough that a modest \(p\) already reaches either end.`,
eq: String.raw`\[ d_j = d_j^{\mathrm{QW}} \left( 1 + \tfrac{1}{2} \tanh p_j \right), \qquad d^{\mathrm{QW}} = \frac{\lambda_0}{4n} \]\[ y_i = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2} \cdot \frac{\tanh(\pi p_i) + 1}{2} \]<div class="eqref">DBR scale of Ch. 3 Sec. 3.3, and Ch. 3 Eq. (3.7), used in Lesson 4, cards 4 and 5</div>`,
sym: [[String.raw`\(d_j\)`, String.raw`thickness of mirror layer \(j\)`], [String.raw`\(d_j^{\mathrm{QW}}\)`, "quarter-wave thickness of that layer"], [String.raw`\(\lambda_0\)`, "design wavelength in vacuum"], [String.raw`\(n\)`, "refractive index of the layer"], [String.raw`\(p_j,\ p_i\)`, "free optimizer parameters"], [String.raw`\(y_i\)`, String.raw`half-width of the taper at point \(i\)`], [String.raw`\(w_{\mathrm{in}},\ w_{\mathrm{out}}\)`, "widths of the input and output waveguides"], [String.raw`\(\tfrac{1}{2}(\tanh(\pi p_i) + 1)\)`, "blend factor between 0 (input) and 1 (output)"], [String.raw`\(\pi\)`, "steepens the blend so that p of about plus or minus 1 reaches the ends"]],
how: [String.raw`Read it aloud: "each layer is its quarter-wave thickness times one plus half of tanh \(p\)", and "each taper half-width is the input half-width plus half the width difference times a blend between zero and one".`, String.raw`Because tanh stays between \(-1\) and 1, \(d_j/d_j^{\mathrm{QW}}\) stays between 0.5 and 1.5.`, String.raw`For the taper, \(p_i = 0\) gives the halfway half-width. A straight linear start uses \(p_i = \operatorname{atanh}(2t_i - 1)/\pi\) with \(t_i\) the fractional position along the taper.`, String.raw`Neighbouring taper points are joined by straight lines, the outline is mirrored about the taper axis, and the taper is etched through the membrane.`, String.raw`Used in Lesson 4, cards 4 and 5.`],
say: "Mirror layers are scaled between half and one and a half quarter-wave thicknesses, and taper half-widths are blended between the two waveguides, both through a tanh.",
num: String.raw`The DBR has 14 pairs, so 28 parameters. Example stack: \(n_H = 3.5\), \(n_L = 3.0\), \(\lambda_0 = 800\) nm, so \(d^{\mathrm{QW}} = 57.1\) and 66.7 nm. The tapers run from 200 nm to 1.9 µm over 4 µm with \(M = 81\) points, so every half-width stays between 0.1 and 0.95 µm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zq", "Free parameter p", -2, 2, 0.02, 0.3) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{d_j}} = \underbrace{d_j^{\mathrm{QW}}}_{\lambda_0/4n} \Big( 1 + \underbrace{\tfrac{1}{2}\tanh {\color{#378ADD}{p_j}}}_{-0.5\text{ to }0.5} \Big) \qquad {\color{#1D9E75}{y_i}} = \frac{w_{\mathrm{in}}}{2} + \frac{w_{\mathrm{out}} - w_{\mathrm{in}}}{2}\cdot \underbrace{\frac{\tanh(\pi {\color{#378ADD}{p_i}}) + 1}{2}}_{0\text{ to }1}`;
  const el = holder(fig, T), qs = range(-2, 2, 161), Dr = q => 1 + 0.5 * Math.tanh(q), Ty = q => 0.1 + 0.85 * (Math.tanh(Math.PI * q) + 1) / 2;
  const u = () => {
    const q = +$("zq").value; $("zqv").textContent = q.toFixed(2);
    const X1 = C3.X(70, 250, -2, 2), Y1 = C3.Y(30, 160, 0.4, 1.6), X2 = C3.X(400, 250, -2, 2), Y2 = C3.Y(30, 160, 0, 1.1);
    let s = tx(195, 18, "mirror layer scale d/d_QW", "middle", "th") + tx(525, 18, "taper half-width y (µm)", "middle", "th");
    s += C3.frame(70, 30, 250, 160, -2, 2, 0.4, 1.6, [-2, -1, 0, 1, 2], [0.5, 1, 1.5], "p", "");
    s += C3.frame(400, 30, 250, 160, -2, 2, 0, 1.1, [-2, -1, 0, 1, 2], [0.1, 0.5, 0.95], "p", "", v => v, v => v.toFixed(2));
    for (const b of [0.5, 1.5]) s += `<line x1="70" x2="320" y1="${Y1(b)}" y2="${Y1(b)}" stroke="${PP}" stroke-dasharray="5 4"/>`;
    for (const b of [0.1, 0.95]) s += `<line x1="400" x2="650" y1="${Y2(b)}" y2="${Y2(b)}" stroke="${PP}" stroke-dasharray="5 4"/>`;
    s += plot(70, 30, 250, 160, qs, qs.map(Dr), -2, 2, 0.4, 1.6, PC, 2.5) + plot(400, 30, 250, 160, qs, qs.map(Ty), -2, 2, 0, 1.1, PT, 2.5);
    s += `<circle cx="${X1(q)}" cy="${Y1(Dr(q))}" r="6" fill="${PB}"/><circle cx="${X2(q)}" cy="${Y2(Ty(q))}" r="6" fill="${PB}"/>`;
    s += tx(400, 248, "taper 200 nm to 1.9 µm wide", "start") + tx(70, 248, "dashed: the bounds", "start");
    el.innerHTML = svg(258, s);
    $("ro").innerHTML = `<div><span>layer of 57.1 nm becomes</span><b>${(57.1 * Dr(q)).toFixed(1)} nm</b></div><div><span>taper half-width</span><b>${Ty(q).toFixed(3)} µm</b></div>`;
  };
  $("zq").oninput = u; u();
}},

/* ---------------- 11. Conic filter ---------------- */
{s: "11. Conic filter", t: String.raw`The conic filter: \(\tilde\rho_i = \sum_j K(d_{ij})\rho_j / \sum_j K(d_{ij})\)`,
intu: String.raw`For the PBS the design region is divided into square pixels, each with a density \(\rho\) between air (0) and GaAs (1). Raw densities tend to produce single-pixel features and grey values without physical meaning, so they are first filtered. The conic filter of Tidy3D replaces the density of pixel \(i\) by a weighted average over the neighbouring pixels \(j\) within the filter radius \(R\). The weights fall linearly from 1 at the center to 0 at the edge, so the kernel looks like a cone. Dividing by the sum of the weights keeps a uniform region unchanged, also at the border of the design region where part of the cone is missing. Tidy3D rounds \(R\) up to a whole number of pixels. On the way back, the gradient passes through the same weights, so the gradient is smoothed too.`,
eq: String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]<div class="eqnote">R rounded up to whole pixels, and the backward pass</div>\[ R \to \lceil R/\Delta \rceil \Delta, \qquad \frac{\partial J}{\partial \rho_j} = \sum_i \frac{\partial J}{\partial \tilde\rho_i}\, \frac{K(d_{ij})}{\sum_k K(d_{ik})} \]<div class="eqref">Ch. 3 Eq. (3.8), conic filter of Tidy3D, used in Lesson 5</div>`,
sym: [[String.raw`\(\rho_j\)`, "raw density of pixel j, the optimizer variable"], [String.raw`\(\tilde\rho_i\)`, String.raw`filtered density of pixel \(i\) (the tilde marks filtered)`], [String.raw`\(K(d)\)`, "cone weight at distance d, 1 at the center and 0 at the radius"], [String.raw`\(d_{ij}\)`, "distance between the centers of pixels i and j"], [String.raw`\(R\)`, "filter radius, 120 nm for the PBS, rounded up to whole pixels"], [String.raw`\(\Delta\)`, "pixel size"], [String.raw`\(\lceil \cdot \rceil\)`, "ceiling: round up to the next integer"], [String.raw`\(\max(0, \cdot)\)`, "keeps the weights from going negative beyond the radius"], [String.raw`\(\sum_k K(d_{ik})\)`, String.raw`normalization of pixel \(i\), the sum of its weights inside the region`], [String.raw`\(\partial J/\partial \rho_j\)`, "gradient with respect to a raw pixel"]],
how: [String.raw`Read it aloud: "the filtered density of pixel \(i\) is the cone-weighted average of the raw densities around it".`, String.raw`The radius covers \(\lceil R/\Delta \rceil\) pixels, so the kernel is \(2\lceil R/\Delta \rceil + 1\) pixels per side. The outermost ring has weight zero.`, String.raw`Features smaller than about \(R\) are averaged into grey, which the projection then removes. That gives a weak length scale, not a guarantee.`, String.raw`Backward pass: each raw pixel collects the gradient of every filtered pixel it fed, with the same weights. A checkerboard gradient is almost cancelled.`, String.raw`Used in Lesson 5, cards 3 to 6, and in the smooth erosion and dilation of card 19.`],
say: "The conic filter averages each pixel with its neighbours using weights that fall linearly to zero at the filter radius, which removes pixel-scale features.",
num: String.raw`The PBS settings of Sec. 3.3: \(R = 120\) nm on pixels of 11.38 nm gives \(\lceil 10.5 \rceil = 11\) pixels, a radius of 125 nm in use and a kernel of 23 × 23 pixels. The region is 220 × 220 pixels. A radius of one pixel leaves only the center weight, so the filter does nothing.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zR", "Requested radius R (nm), pixels of 11.38 nm", 10, 160, 1, 120) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{\tilde\rho_i}} = \frac{\sum_j \overbrace{{\color{#BA7517}{K(d_{ij})}}}^{\text{cone weight}}\, \overbrace{{\color{#378ADD}{\rho_j}}}^{\text{raw pixel}}}{\underbrace{\sum_j K(d_{ij})}_{\text{normalization}}} \qquad {\color{#BA7517}{K(d)}} = \max\Big(0,\, 1 - \frac{d}{\underbrace{{\color{#7F77DD}{R}}}_{\text{whole pixels}}}\Big)`;
  const el = holder(fig, T), dl = 11.38;
  const u = () => {
    const R = +$("zR").value; $("zRv").textContent = R + " nm"; const n = Math.ceil(R / dl), Rt = n * dl;
    const X = C3.X(70, 560, -170, 170), Y = C3.Y(20, 170, 0, 1.15), rs = range(-170, 170, 341);
    let s = C3.frame(70, 20, 560, 170, -170, 170, 0, 1.15, [-150, -100, -50, 0, 50, 100, 150], [0, 0.5, 1], "distance d from the pixel center (nm)", "weight K(d)");
    s += plot(70, 20, 560, 170, rs, rs.map(r => Math.max(0, 1 - Math.abs(r) / Rt)), -170, 170, 0, 1.15, PA, 2.5);
    for (let j = -n; j <= n; j++) { const r = j * dl, k = Math.max(0, 1 - Math.abs(r) / Rt); if (Math.abs(r) > 170) continue; s += `<line x1="${X(r)}" x2="${X(r)}" y1="${Y(0)}" y2="${Y(k)}" stroke="${PB}" stroke-width="1.5"/><circle cx="${X(r)}" cy="${Y(k)}" r="2.5" fill="${PB}"/>`; }
    for (const v of [-R, R]) s += `<line x1="${X(v)}" x2="${X(v)}" y1="20" y2="190" stroke="${PP}" stroke-dasharray="4 3"/>`;
    for (const v of [-Rt, Rt]) s += `<line x1="${X(v)}" x2="${X(v)}" y1="20" y2="190" stroke="${PP}" stroke-width="1.5"/>`;
    s += C3.legend(80, 244, [["K(d)", PA], ["pixel weights", PB], ["requested R", PP, "4 3"], ["R in whole pixels", PP]]);
    el.innerHTML = svg(254, s);
    $("ro").innerHTML = `<div><span>⌈R/Δ⌉</span><b>${n} pixels</b></div><div><span>R in use</span><b>${Rt.toFixed(1)} nm</b></div><div><span>kernel size</span><b>${2 * n + 1} × ${2 * n + 1}</b></div>`;
  };
  $("zR").oninput = u; u();
}},

/* ---------------- 12. Projection ---------------- */
{s: "12. Projection", t: String.raw`The tanh projection: sharpness \(\beta\) and threshold \(\eta\)`,
intu: String.raw`After filtering, most pixels are grey. A hyperbolic tangent projection then pushes the filtered densities toward 0 or 1: values below the threshold \(\eta\) go toward 0 and values above it toward 1. The thesis uses \(\eta = 0.5\). The sharpness \(\beta\) sets how steep the step is: a small \(\beta\) leaves the design almost unchanged, a large \(\beta\) makes it nearly binary. The denominator makes the curve pass exactly through (0, 0) and (1, 1) for any \(\beta\) and \(\eta\). Move \(\beta\) and watch the curve close in on a step.`,
eq: String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)} \]<div class="eqref">Ch. 3 Eq. (3.9), Christiansen Eq. (18), \(\eta = 0.5\), used in Lesson 6</div>`,
sym: [[String.raw`\(\hat\rho\)`, "projected density, goes into the permittivity (card 14)"], [String.raw`\(\tilde\rho\)`, "filtered density (card 11)"], [String.raw`\(\beta\)`, "sharpness of the step, raised from 1 to 100 during the PBS optimization (card 13)"], [String.raw`\(\eta\)`, "threshold, where the step sits, 0.5 in the thesis"], [String.raw`\(\tanh\)`, "hyperbolic tangent, a smooth step from -1 to 1"]],
how: [String.raw`Read it aloud: "rho hat is tanh of beta eta plus tanh of beta times rho tilde minus eta, divided by tanh of beta eta plus tanh of beta times one minus eta".`, String.raw`The second tanh in the numerator is the step, centered at \(\tilde\rho = \eta\). The first lifts it so that \(\tilde\rho = 0\) maps to 0, and the denominator scales it so that \(\tilde\rho = 1\) maps to 1.`, String.raw`As \(\beta \to \infty\) it becomes a hard threshold: 1 above \(\eta\), 0 below.`, String.raw`With \(\eta = 0.5\), a pixel becomes GaAs when its filtered density is above one half, so the outline of the design sits where \(\tilde\rho = 0.5\).`, String.raw`Used in Lesson 6, cards 1 to 3, and inside the smooth morphology of Lessons 8 and 9.`],
say: "The projection is a normalized tanh step with sharpness beta and threshold eta that pushes filtered densities toward zero or one.",
num: String.raw`At \(\beta = 100\) and \(\eta = 0.5\), \(\tilde\rho = 0.52\) already gives \(\hat\rho = 0.98\). At \(\beta = 1\) the projection has little effect.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zb", "Sharpness β", 1, 100, 1, 16) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{\hat\rho}} = \frac{\overbrace{\tanh({\color{#378ADD}{\beta}}{\color{#1D9E75}{\eta}})}^{\text{makes }0\to 0} + \overbrace{\tanh({\color{#378ADD}{\beta}}({\color{#7F77DD}{\tilde\rho}} - {\color{#1D9E75}{\eta}}))}^{\text{step at }\eta}}{\underbrace{\tanh({\color{#378ADD}{\beta}}{\color{#1D9E75}{\eta}}) + \tanh({\color{#378ADD}{\beta}}(1 - {\color{#1D9E75}{\eta}}))}_{\text{makes }1\to 1}}`;
  const el = holder(fig, T), xs = range(0, 1, 201);
  const u = () => {
    const b = +$("zb").value, e = 0.5; $("zbv").textContent = b;
    const X = C3.X(70, 560, 0, 1);
    let s = C3.frame(70, 20, 560, 190, 0, 1, 0, 1, [0, 0.25, 0.5, 0.75, 1], [0, 0.5, 1], "filtered density ρ̃", "projected density ρ̂");
    for (const bb of [1, 8, 64]) s += plot(70, 20, 560, 190, xs, xs.map(x => C3.proj(x, bb, e)), 0, 1, 0, 1, "var(--b)", 1.3, "3 3");
    s += `<line x1="${X(e)}" x2="${X(e)}" y1="20" y2="210" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(X(e) + 5, 34, "η", "start");
    s += plot(70, 20, 560, 190, xs, xs.map(x => C3.proj(x, b, e)), 0, 1, 0, 1, PC, 2.5);
    s += C3.legend(80, 262, [["ρ̂ for the chosen β", PC], ["β = 1, 8, 64 for reference", "var(--b)", "3 3"]]);
    el.innerHTML = svg(272, s);
        $("ro").innerHTML = `<div><span>ρ̂ at ρ̃ = 0.52</span><b>${C3.proj(0.52, b, e).toFixed(3)}</b></div><div><span>ρ̂ at ρ̃ = 0.48</span><b>${C3.proj(0.48, b, e).toFixed(3)}</b></div>`;
  };
  $("zb").oninput = u; u();
}},

/* ---------------- 13. Continuation, animated ---------------- */
{s: "13. Continuation", t: String.raw`Raising \(\beta\): from 1 to 100 in 11 levels of 7 steps`,
intu: String.raw`The gradient reaches the raw pixels only through the slope of the projection. For a large \(\beta\) that slope is a tall, narrow spike at the threshold: about \(\beta/2\) there and nearly zero elsewhere. A large \(\beta\) gives a nearly binary design but a poorly conditioned gradient, while a small \(\beta\) gives a smooth problem whose optimum is grey. So the sharpness is raised during the optimization. For the PBS it rises geometrically from \(\beta = 1\) to \(\beta = 100\) in 11 levels of 7 optimizer steps each, 77 steps in total. At \(\beta = 100\) the projection is close to a step function, and the final design is thresholded at \(\hat\rho = 0.5\). Press Play and watch the slope (left) sharpen as the schedule (right) climbs.`,
eq: String.raw`\[ \frac{d\hat\rho}{d\tilde\rho} = \frac{\beta \operatorname{sech}^2\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1 - \eta)\big)} \]\[ \beta_k = 100^{\,k/10}, \qquad k = 0, 1, \dots, 10, \qquad 7 \text{ steps per level} \]<div class="eqref">Ch. 3 Sec. 3.5, projection continuation, Fig. 3.2, used in Lesson 6</div>`,
sym: [[String.raw`\(d\hat\rho/d\tilde\rho\)`, "slope of the projection, the factor every gradient passes through"], [String.raw`\(\operatorname{sech}^2\)`, String.raw`\(1/\cosh^2\): 1 at zero, falls off fast on both sides`], [String.raw`\(\beta_k\)`, String.raw`sharpness at level \(k\): 1, 1.58, 2.51, ..., 63.1, 100`], [String.raw`\(k\)`, "level index, 0 to 10, so 11 levels"], ["7 steps", "optimizer steps per level, 77 in total"]],
how: [String.raw`Read it aloud: "the slope is beta times sech squared of beta times rho tilde minus eta, over the same denominator", and "beta at level \(k\) is one hundred to the power \(k\) over ten".`, String.raw`At \(\tilde\rho = \eta = 0.5\) the slope is \(\beta/(2\tanh(\beta/2))\), about \(\beta/2\) for large \(\beta\). Away from the threshold it is almost zero.`, String.raw`\(k = 0\) gives \(\beta = 1\) and \(k = 10\) gives \(\beta = 100\). The factor between levels is \(100^{1/10} = 1.585\), so each decade gets the same number of levels.`, String.raw`Each level is held for 7 steps, so the optimizer has time to adapt before the step sharpens again. After the last level the design is thresholded at 0.5.`, String.raw`Used in Lesson 6, cards 3 to 5, and in the full run of Lesson 15.`],
say: "Because the slope of the projection becomes a narrow spike at large beta, beta is raised geometrically from one to one hundred in eleven levels of seven steps, and the final design is thresholded at one half.",
num: String.raw`The factor per level is 1.585. The eighth level is \(\beta = 25.1\), where the erosion and dilation penalty reaches full weight (card 19). At \(\beta = 100\) the slope at \(\tilde\rho = 0.5\) is 50, at \(\tilde\rho = 0.6\) below 0.01.`,
r(fig, ctl) {
  let k = 0, playing = false;
  ctl.innerHTML = sl("zk", "Optimizer step", 0, 77, 1, 0) + `<div class="row"><button id="zpl">Play</button></div><div class="readout" id="ro"></div>`;
  const T = String.raw`\frac{d{\color{#D85A30}{\hat\rho}}}{d{\color{#7F77DD}{\tilde\rho}}} = \frac{\overbrace{{\color{#378ADD}{\beta}}\operatorname{sech}^2({\color{#378ADD}{\beta}}({\color{#7F77DD}{\tilde\rho}} - \eta))}^{\text{spike at }\eta}}{\tanh(\beta\eta) + \tanh(\beta(1 - \eta))} \qquad {\color{#378ADD}{\beta_k}} = \underbrace{100^{\,k/10}}_{\text{11 levels}}`;
  const el = holder(fig, T), xs = range(0, 1, 401);
  const u = () => {
    $("zkv").textContent = k >= 77 ? "77, threshold" : k;
    const lev = Math.min(10, Math.floor(k / 7)), b = Math.pow(100, lev / 10), done = k >= 77;
    let s = tx(195, 16, done ? "after the last level: thresholded at 0.5" : `slope dρ̂/dρ̃ at β = ${b < 10 ? b.toFixed(2) : b.toFixed(1)}`, "middle", "th") + tx(525, 16, "β schedule, 7 steps per level", "middle", "th");
    const ym = Math.max(1.3, (done ? 50 : b / 2) * 1.12);
    s += C3.frame(70, 26, 250, 170, 0, 1, 0, ym, [0, 0.5, 1], [0, ym / 2, ym].map(v => +v.toFixed(1)), "ρ̃", "");
    if (done) s += `<line x1="${C3.X(70, 250, 0, 1)(0.5)}" x2="${C3.X(70, 250, 0, 1)(0.5)}" y1="26" y2="196" stroke="${PC}" stroke-width="3"/>` + tx(200, 100, "a step: no slope left", "start");
    else s += plot(70, 26, 250, 170, xs, xs.map(x => C3.dproj(x, b, 0.5)), 0, 1, 0, ym, PC, 2.5);
    const X = C3.X(400, 250, 0, 77), Y = C3.Y(26, 170, 0, 2.1);
    s += C3.frame(400, 26, 250, 170, 0, 77, 0, 2.1, [0, 35, 77], [0, 1, 2], "optimization step", "β", v => v, v => ["1", "10", "100"][v]);
    let d = ""; for (let L = 0; L < 11; L++) { const yb = Y(L / 5); d += `${L ? "L" : "M"}${X(L * 7).toFixed(1)} ${yb.toFixed(1)}L${X((L + 1) * 7).toFixed(1)} ${yb.toFixed(1)}`; }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2.5"/><line x1="${X(k)}" x2="${X(k)}" y1="26" y2="196" stroke="${PP}" stroke-width="2"/>`;
    if (!done) s += `<circle cx="${X(k)}" cy="${Y(lev / 5)}" r="5" fill="${PP}"/>`;
    el.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>level</span><b>${done ? "done" : (lev + 1) + " of 11"}</b></div><div><span>β</span><b>${done ? "threshold 0.5" : b < 10 ? b.toFixed(2) : b.toFixed(1)}</b></div><div><span>peak slope</span><b>${done ? "none" : C3.dproj(0.5, b, 0.5).toFixed(1)}</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("zpl").textContent = "Play"; };
  $("zk").oninput = () => { stop(); k = +$("zk").value; u(); };
  $("zpl").onclick = () => { if (playing) { stop(); return; } playing = true; $("zpl").textContent = "Pause"; if (k >= 77) k = 0; let last = -1; anim(t => { if (!fig.isConnected) { stopAnim(); return; } const n = Math.floor(t * 6); if (n === last) return; last = n; if (k < 77) k++; else stop(); $("zk").value = k; u(); }); };
  u();
}},

/* ---------------- 14. Density interpolation ---------------- */
{s: "14. Pixel permittivity", t: String.raw`Pixels: \(\varepsilon = \varepsilon_{\mathrm{air}} + \hat\rho\,(\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})\)`,
intu: String.raw`In topology optimization every pixel carries a density between 0 for air and 1 for GaAs. The permittivity of the pixel is a straight-line blend of the two materials. This makes \(\varepsilon\) a smooth function of the density, so every pixel has a gradient, and the optimizer may open a hole or grow an island anywhere. Values in between are grey material that cannot be fabricated, so the filter and projection that come before this step push them toward 0 or 1.`,
eq: String.raw`\[ \varepsilon = \varepsilon_{\mathrm{air}} + \hat\rho\, (\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}}) \]<div class="eqref">Ch. 3 Eq. (3.10), Christiansen Eqs. (9) and (19), used in Lesson 5</div>`,
sym: [[String.raw`\(\varepsilon\)`, "relative permittivity of one pixel"], [String.raw`\(\varepsilon_{\mathrm{air}}\)`, "1"], [String.raw`\(\varepsilon_{\mathrm{GaAs}}\)`, "12.19"], [String.raw`\(\hat\rho\)`, "projected density of the pixel, 0 (air) to 1 (GaAs). The hat marks the value after filter and projection (cards 11 and 12)"], [String.raw`\(n = \sqrt{\varepsilon}\)`, "refractive index of the pixel"]],
how: [String.raw`Read it aloud: "the permittivity is the air value plus the density times the difference between GaAs and air".`, String.raw`\(\hat\rho = 0\) gives air, \(\hat\rho = 1\) gives GaAs, in between a grey mixture.`, String.raw`The derivative is a constant, \(\partial\varepsilon/\partial\hat\rho = \varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}} = 11.19\). It is the link between the sensitivity map and the density.`, String.raw`The raw optimizer variable is \(\rho\). It becomes \(\tilde\rho\) after the filter and \(\hat\rho\) after the projection.`, String.raw`Used in Lesson 5, card 1, and in the 1D runs of Lesson 15.`],
say: "Each pixel's permittivity is interpolated linearly between air and GaAs by its projected density.",
num: String.raw`\(\hat\rho = 0.5\) gives \(\varepsilon = 6.6\) and \(n = 2.57\). \(\hat\rho = 0.9\) gives \(\varepsilon = 11.1\) and \(n = 3.33\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("zr", "Projected density ρ̂", 0, 1, 0.01, 0.5) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{\varepsilon}} = \underbrace{\varepsilon_{\mathrm{air}}}_{=\,1} + \underbrace{{\color{#378ADD}{\hat\rho}}}_{0\text{ to }1}\, \underbrace{(\varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}})}_{=\,11.19}`;
  const el = holder(fig, T), rs = range(0, 1, 101);
  const u = () => {
    const r = +$("zr").value; $("zrv").textContent = r.toFixed(2); const e = 1 + 11.19 * r;
    const X = C3.X(70, 560, 0, 1), Y = C3.Y(20, 170, 0, 13);
    let s = C3.frame(70, 20, 560, 170, 0, 1, 0, 13, [0, 0.25, 0.5, 0.75, 1], [1, 4, 8, 12.19], "projected density ρ̂", "value");
    s += plot(70, 20, 560, 170, rs, rs.map(v => 1 + 11.19 * v), 0, 1, 0, 13, PC, 2.5) + plot(70, 20, 560, 170, rs, rs.map(v => Math.sqrt(1 + 11.19 * v)), 0, 1, 0, 13, PB, 2, "6 4");
    s += `<line x1="${X(r)}" x2="${X(r)}" y1="20" y2="190" stroke="${PP}" stroke-dasharray="4 3"/><circle cx="${X(r)}" cy="${Y(e)}" r="6" fill="${PC}"/><circle cx="${X(r)}" cy="${Y(Math.sqrt(e))}" r="5" fill="${PB}"/>`;
    s += C3.stripe(70, 236, 560, 16, rs, PB) + tx(70, 268, "air (ρ̂ = 0)", "start") + tx(630, 268, "GaAs (ρ̂ = 1)", "end") + tx(350, 268, "grey in between", "middle");
    s += C3.legend(400, 50, [["ε", PC], ["n = √ε", PB, "6 4"]]);
    el.innerHTML = svg(276, s);
    $("ro").innerHTML = `<div><span>permittivity ε</span><b>${e.toFixed(2)}</b></div><div><span>index n</span><b>${Math.sqrt(e).toFixed(2)}</b></div>`;
  };
  $("zr").oninput = u; u();
}},

/* ---------------- 15. Outline vertices ---------------- */
{s: "15. Boundary vertices", t: String.raw`Boundary vertices: \(\mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}}\tanh(p_i)\,\hat{\mathbf{n}}_i\)`,
intu: String.raw`After the topology stage, the binary PBS design is converted to one polygon, and its outline is optimized under the design rules. Each free vertex moves only along its outward normal, and by at most \(\Delta_{\mathrm{max}}\) in either direction. \(p_i = 0\) reproduces the starting outline. The tanh again keeps the move inside that band, whatever the optimizer does to \(p_i\). Because the boundary moves continuously instead of in pixel steps, the staircase edges of the pixel design disappear and the corner radii can be controlled. Press Play: the \(p_i\) swing far beyond ±1 while every vertex stays in its band.`,
eq: String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_{\mathrm{max}} \tanh(p_i)\, \hat{\mathbf{n}}_i \]<div class="eqref">Ch. 3 Eq. (3.11), used in Lessons 4 and 11</div>`,
sym: [[String.raw`\(\mathbf{r}_i\)`, String.raw`position of vertex \(i\)`], [String.raw`\(\mathbf{r}_i^{(0)}\)`, "its starting position"], [String.raw`\(\Delta_{\mathrm{max}}\)`, "largest allowed move, in nm"], [String.raw`\(p_i\)`, "free optimizer parameter of vertex i"], [String.raw`\(\tanh(p_i)\)`, String.raw`between \(-1\) and 1, so the move is between \(-\Delta_{\mathrm{max}}\) and \(+\Delta_{\mathrm{max}}\)`], [String.raw`\(\hat{\mathbf{n}}_i\)`, "unit outward normal of the starting outline at vertex i (the hat marks a unit vector)"]],
how: [String.raw`Read it aloud: "each vertex sits at its starting position plus delta max times tanh of p i along its normal".`, String.raw`The move is a signed distance: positive outward (more GaAs), negative inward.`, String.raw`Moving only along the normal stops vertices from sliding along the outline and bunching up.`, String.raw`With \(\Delta_{\mathrm{max}} = 15\) nm, a check and a repair every five steps (card 23), the outline stays within the rules while it is refined.`, String.raw`Used in Lesson 4, card 6, Lesson 10, card 6, and Lesson 11, card 6.`],
say: "Each outline vertex moves along its normal by at most delta max, so the shape stays inside a band around the starting outline.",
num: String.raw`The PBS outline has 395 free vertices, and each may move by at most \(\Delta_{\mathrm{max}} = 15\) nm. The figure uses 36 vertices on an outline about 800 nm across.`,
r(fig, ctl) {
  let playing = false;
  ctl.innerHTML = sl("zd", "Δ_max (nm)", 0, 80, 1, 15) + `<div class="row"><button id="zpl">Play</button></div><div class="readout" id="ro"></div>`;
  const T = String.raw`\underbrace{{\color{#D85A30}{\mathbf{r}_i}}}_{\text{new vertex}} = \underbrace{\mathbf{r}_i^{(0)}}_{\text{start}} + \underbrace{{\color{#BA7517}{\Delta_{\mathrm{max}}}}\tanh({\color{#378ADD}{p_i}})}_{\text{between }\pm\Delta_{\mathrm{max}}}\, \underbrace{{\color{#1D9E75}{\hat{\mathbf{n}}_i}}}_{\text{unit normal}}`;
  const el = holder(fig, T), N = 36, rg = C3.rng(11), th0 = Array.from({ length: N }, () => 3 * (rg() - 0.5)), ph = Array.from({ length: N }, () => 6.283 * rg());
  const p0 = Array.from({ length: N }, (_, k) => { const a = 2 * Math.PI * k / N, rr = 400 * (1 + 0.15 * Math.cos(3 * a)); return [rr * Math.cos(a), rr * Math.sin(a)]; });
  const nr = p0.map((_, k) => { const a = p0[(k + 1) % N], b = p0[(k - 1 + N) % N], tx0 = a[0] - b[0], ty0 = a[1] - b[1], l = Math.hypot(tx0, ty0); return [ty0 / l, -tx0 / l]; });
  const S = 0.27, P = (x, y) => `${(340 + S * x).toFixed(1)},${(150 - S * y).toFixed(1)}`;
  const u = (t) => {
    const D = +$("zd").value; $("zdv").textContent = D + " nm";
    const th = t === undefined ? th0 : th0.map((v, k) => 4 * Math.sin(ph[k] + (0.7 + 0.3 * Math.sin(k)) * t));
    const off = d => p0.map((p, k) => P(p[0] + d * nr[k][0], p[1] + d * nr[k][1])).join(" ");
    const mv = p0.map((p, k) => { const q = D * Math.tanh(th[k]); return [p[0] + q * nr[k][0], p[1] + q * nr[k][1]]; });
    let s = `<polygon points="${off(D)}" fill="var(--teal-bg)" stroke="var(--b)" stroke-dasharray="4 3"/><polygon points="${off(-D)}" fill="var(--bg)" stroke="var(--b)" stroke-dasharray="4 3"/>`;
    s += `<polygon points="${off(0)}" fill="none" stroke="var(--p)" stroke-width="1.5"/><polygon points="${mv.map(p => P(p[0], p[1])).join(" ")}" fill="${PC}" fill-opacity="0.15" stroke="${PC}" stroke-width="2"/>`;
    p0.forEach((p, k) => { const [a, b] = P(p[0], p[1]).split(","), [c, d] = P(p[0] + 60 * nr[k][0], p[1] + 60 * nr[k][1]).split(","); if (k % 3 === 0) s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${PT}" stroke-width="1.3"/>`; });
    mv.forEach(p => { const [a, b] = P(p[0], p[1]).split(","); s += `<circle cx="${a}" cy="${b}" r="2.6" fill="${PC}"/>`; });
    s += C3.legend(20, 292, [["start outline", "var(--p)"], ["moved outline", PC], ["normals", PT]]) + tx(660, 292, "shaded band: ±Δ_max", "end");
    el.innerHTML = svg(302, s);
    $("ro").innerHTML = `<div><span>largest |p|</span><b>${Math.max(...th.map(Math.abs)).toFixed(2)}</b></div><div><span>largest move</span><b>${(D * Math.max(...th.map(v => Math.abs(Math.tanh(v))))).toFixed(1)} nm of ${D}</b></div><div><span>vertices here</span><b>${N}</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("zpl").textContent = "Play"; };
  $("zd").oninput = () => { if (!playing) u(); };
  $("zpl").onclick = () => { if (playing) { stop(); u(); return; } playing = true; $("zpl").textContent = "Pause"; anim(t => { if (!fig.isConnected) { stopAnim(); return; } u(t); }); };
  u();
}},

/* ---------------- 16. Mode overlap ---------------- */
{s: "16. Mode overlap", t: String.raw`Mode overlap: \(a_m\) and \(T_m = |a_m|^2\)`,
intu: String.raw`A monitor plane sees a field that may be a mix of several guided modes and radiation. The overlap integral asks how much of that field looks like the target mode. It combines the simulated \(\mathbf{E}\) and \(\mathbf{H}\) with the stored mode fields \(\mathbf{E}_m\) and \(\mathbf{H}_m\) and integrates a mixed Poynting flux over the plane. Tidy3D normalizes each mode to unit power, and the mode sources and Gaussian beams are normalized to inject 1 W at each frequency, so \(|a_m|^2\) is the fraction of the injected power carried by that mode. For a grating coupler the coupling efficiency CE is \(|a_m|^2\) for the fundamental mode of the access waveguide, traveling from the grating toward the waveguide. Power in any other mode, or in the right mode but displaced, counts as loss.`,
eq: String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]<div class="eqnote">scalar picture:</div>\[ T = \frac{\left| \int E\, m\, dy \right|^2}{\int |E|^2\, dy \int |m|^2\, dy} \]<div class="eqref">Ch. 3 Eq. (3.12), modes at unit power and sources at 1 W, used in Lesson 7</div>`,
sym: [[String.raw`\(a_m\)`, String.raw`complex amplitude of mode \(m\) at the monitor`], [String.raw`\(S\)`, "the monitor plane, across the output waveguide"], [String.raw`\(\mathbf{E},\ \mathbf{H}\)`, "simulated electric and magnetic fields on the plane"], [String.raw`\(\mathbf{E}_m,\ \mathbf{H}_m\)`, "profile of the target mode from the mode solver at that plane, normalized to unit power"], [String.raw`\(^{*}\)`, "complex conjugate"], [String.raw`\(\times\)`, "cross product, as in the Poynting vector"], [String.raw`\(\hat{\mathbf{n}}\)`, "unit normal of the plane, the propagation direction"], [String.raw`\(\tfrac{1}{4}\)`, "normalization that makes the result an amplitude for unit-power modes"], [String.raw`\(T_m\)`, "power fraction in mode m, between 0 and 1"], [String.raw`\(E(y),\ m(y)\)`, "field and mode profile in the scalar picture"]],
how: [String.raw`Read it aloud: "\(a_m\) is one quarter of the integral over the monitor plane of \(\mathbf{E}_m\) star cross \(\mathbf{H}\) plus \(\mathbf{E}\) cross \(\mathbf{H}_m\) star, dotted with the normal, and \(T_m\) is its magnitude squared".`, String.raw`The cross products are like a Poynting flux, but mixed: the simulated field with the mode's field. Only the part of the field shaped like the mode survives the integral.`, String.raw`The scalar picture shows the same idea: \(T = 1\) only when the field has exactly the mode's shape. Slide the field off center and \(T\) drops.`, String.raw`A field \(\cos\theta\,\mathrm{TE0} + \sin\theta\,\mathrm{TE1}\) gives \(T_{\mathrm{TE0}} = \cos^2\theta\). At 45° all the power is guided but only half counts for the figure of merit.`, String.raw`Used in Lesson 7, cards 1, 2 and 5, and inside every figure of merit of the thesis.`],
say: "The mode overlap projects the simulated field onto the target mode, and its squared magnitude is the fraction of power delivered into that mode.",
num: String.raw`In Lesson 7 the mode's \(1/e\) half-width is about 190 nm, and a shift of half that, about 95 nm, already costs about a quarter of the power. The Gaussian stand-ins in the figure give the same: \(T = e^{-0.25} = 0.78\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("zs", "Field shift (nm)", 0, 400, 5, 95) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\begin{gathered} {\color{#D85A30}{a_m}} = \frac{1}{4}\int_S \Big( \underbrace{{\color{#1D9E75}{\mathbf{E}_m^{*}}}\times{\color{#378ADD}{\mathbf{H}}} + {\color{#378ADD}{\mathbf{E}}}\times{\color{#1D9E75}{\mathbf{H}_m^{*}}}}_{\text{simulated field mixed with the mode}} \Big)\cdot \underbrace{\hat{\mathbf{n}}\, dS}_{\text{through the plane}} \\ \underbrace{{\color{#7F77DD}{T_m}}}_{\text{power fraction}} = |{\color{#D85A30}{a_m}}|^2 \end{gathered}`;
  const el = holder(fig, T), ys = range(-700, 700, 561), w = 190, m = ys.map(y => Math.exp(-(y * y) / (w * w)));
  const u = () => {
    const sh = +$("zs").value; $("zsv").textContent = sh + " nm";
    const E = ys.map(y => Math.exp(-((y - sh) ** 2) / (w * w))), ov = sum(E.map((v, i) => v * m[i])), Tm = ov * ov / (sum(E.map(v => v * v)) * sum(m.map(v => v * v)));
    const X = C3.X(70, 560, -700, 700), Y = C3.Y(20, 170, 0, 1.15);
    let s = C3.frame(70, 20, 560, 170, -700, 700, 0, 1.15, [-600, -300, 0, 300, 600], [0, 0.5, 1], "position across the output waveguide y (nm)", "amplitude");
    let d = `M${X(-700)} ${Y(0)}`; ys.forEach((y, i) => d += `L${X(y).toFixed(1)} ${Y(E[i] * m[i]).toFixed(1)}`); d += `L${X(700)} ${Y(0)}Z`;
    s += `<path d="${d}" fill="${PP}" opacity="0.3"/>` + plot(70, 20, 560, 170, ys, m, -700, 700, 0, 1.15, PT, 2.5) + plot(70, 20, 560, 170, ys, E, -700, 700, 0, 1.15, PB, 2.5, "6 4");
    s += C3.legend(80, 244, [["mode m(y)", PT], ["field E(y)", PB, "6 4"], ["product E·m", PP]]);
    el.innerHTML = svg(254, s);
    $("ro").innerHTML = `<div><span>T = |overlap|²</span><b>${Tm.toFixed(3)}</b></div><div><span>power not in the mode</span><b>${((1 - Tm) * 100).toFixed(1)} %</b></div>`;
  };
  $("zs").oninput = u; u();
}},

/* ---------------- 17. Band weights ---------------- */
{s: "17. Band weights", t: String.raw`Gaussian band weights: \(\bar T = \sum_i w_i\, T(\lambda_i)\)`,
intu: String.raw`A device optimized at a single wavelength tends to become a narrow resonance that fails just beside it. The objectives of the gratings and the PBS are therefore averaged over a band of wavelengths, while the tapers are optimized at 795 nm only. The weights follow a Gaussian centered on the design wavelength, so the center counts most, and they are normalized to add up to one, so the average stays between 0 and 1. The same weights then set the strength of the adjoint source at each wavelength: a wavelength with zero weight does not drive the gradient at all.`,
eq: String.raw`\[ \bar T = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\big[-(\lambda_i-\lambda_0)^2/(2\sigma^2)\big]}{\sum_j \exp\!\big[-(\lambda_j-\lambda_0)^2/(2\sigma^2)\big]} \]<div class="eqnote">the same weights set the adjoint source</div>\[ \text{adjoint amplitude} \propto w_i\, a_m^{*}(\lambda_i) \]<div class="eqref">Ch. 3 Eq. (3.13), used in Lesson 7</div>`,
sym: [[String.raw`\(\bar{T}\)`, "band-averaged transmission, between 0 and 1"], [String.raw`\(w_i\)`, "weight of wavelength i, all weights add up to 1"], [String.raw`\(T(\lambda_i)\)`, String.raw`transmission at wavelength \(\lambda_i\) (card 16)`], [String.raw`\(\lambda_0\)`, "center of the weights, 795 nm"], [String.raw`\(\sigma\)`, "standard deviation of the Gaussian, in nm"], [String.raw`\(\sum_j\)`, "sum over all wavelengths of the band, only for normalization"], [String.raw`\(a_m^{*}(\lambda_i)\)`, "complex conjugate of the mode amplitude at that wavelength"], [String.raw`\(\propto\)`, '"is proportional to"']],
how: [String.raw`Read it aloud: "T bar is the sum over wavelengths of the weight times the transmission, with Gaussian weights normalized to add up to one".`, String.raw`The denominator only normalizes. Without it the average could exceed 1.`, String.raw`The full width at half maximum of the weights is \(2.355\sigma\). Some codes write the Gaussian as \(\exp[-((\lambda - \lambda_0)/\sigma_c)^2]\), which is the same curve with \(\sigma = \sigma_c/\sqrt{2}\), so do not mix the two widths.`, String.raw`Differentiating \(J = \sum_i w_i|a_m(\lambda_i)|^2\) with respect to \(a_m\) gives \(w_i a_m^{*}\), the amplitude of the adjoint source at each wavelength.`, String.raw`Used in Lesson 7, cards 3, 4 and 7, and Lesson 3, card 1.`],
say: "The objective is a Gaussian-weighted average of the transmission over a band, which stops the optimizer from building a narrow resonance.",
num: String.raw`PBS: 101 wavelengths from 735 to 835 nm, \(\sigma = 8\) nm. Gratings: 101 wavelengths from 745 to 845 nm, \(\sigma = 8.5\) nm, so the full width at half maximum of the weights is 20 nm. Tapers: 795 nm only. The figure shows the grating band.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zg", "σ (nm)", 3, 30, 0.5, 8.5) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{\bar{T}}} = \sum_i \underbrace{{\color{#BA7517}{w_i}}}_{\text{weight}}\;\; \underbrace{{\color{#378ADD}{T(\lambda_i)}}}_{\text{transmission}} \qquad {\color{#BA7517}{w_i}} \propto \exp\!\Big[ -\frac{(\lambda_i - {\color{#1D9E75}{\lambda_0}})^2}{2{\color{#7F77DD}{\sigma}}^2} \Big], \quad \underbrace{\textstyle\sum_i w_i = 1}_{\text{normalized}}`;
  const el = holder(fig, T), ls = range(745, 845, 101);
  const u = () => {
    const sg = +$("zg").value; $("zgv").textContent = sg.toFixed(1);
    const w0 = ls.map(l => Math.exp(-((l - 795) ** 2) / (2 * sg * sg))), w = w0.map(v => v / sum(w0)), mx = Math.max(...w);
    const X = C3.X(70, 560, 740, 850), Y = C3.Y(20, 180, 0, mx * 1.15);
    let s = C3.frame(70, 20, 560, 180, 740, 850, 0, mx * 1.15, [745, 770, 795, 820, 845], [0, mx], "wavelength (nm), 101 wavelengths from 745 to 845", "weight wᵢ", v => v, v => v.toFixed(3));
    ls.forEach((l, i) => s += `<rect x="${X(l) - 1.8}" y="${Y(w[i])}" width="3.6" height="${200 - Y(w[i])}" fill="${PA}" opacity="0.85"/>`);
    const lc = range(740, 850, 221); s += plot(70, 20, 560, 180, lc, lc.map(l => mx * Math.exp(-((l - 795) ** 2) / (2 * sg * sg))), 740, 850, 0, mx * 1.15, PP, 1.8, "5 4");
    s += `<line x1="${X(795 - 1.1774 * sg)}" x2="${X(795 + 1.1774 * sg)}" y1="${Y(mx / 2)}" y2="${Y(mx / 2)}" stroke="${PC}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(Math.min(X(795 + 1.18 * sg) + 8, 560), Y(mx / 2) - 6, `FWHM ${(2.355 * sg).toFixed(1)} nm`, "start");
    el.innerHTML = svg(244, s);
    $("ro").innerHTML = `<div><span>Σ wᵢ</span><b>${sum(w).toFixed(3)}</b></div><div><span>wavelengths</span><b>101</b></div><div><span>weight at 795 nm</span><b>${mx.toFixed(3)}</b></div>`;
  };
  $("zg").oninput = u; u();
}},

/* ---------------- 18. PBS figure of merit ---------------- */
{s: "18. PBS FOM", t: String.raw`The PBS figure of merit, maximum 2`,
intu: String.raw`For the PBS, \(\mathrm{TE}_0\) must leave through the TE port and \(\mathrm{TM}_0\) through the TM port. The figure of merit is the sum of two weighted transmissions, one per input polarization. Each sum is a weighted mean of numbers between 0 and 1, since the weights add up to one, so each is at most 1 and the figure of merit has a maximum of 2. Each evaluation needs forward and adjoint simulations for both input polarizations. Set the two transmissions and watch the two halves fill the bar.`,
eq: String.raw`\[ \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_i) \]<div class="eqref">Ch. 3 Eq. (3.14), maximum 2, used in Lesson 7</div>`,
sym: [[String.raw`\(\mathrm{FOM}\)`, "figure of merit of the PBS, between 0 and 2"], [String.raw`\(T_{\mathrm{TE}\to\mathrm{TE\,port}}\)`, "transmission of the TE input into the fundamental mode of the TE port"], [String.raw`\(T_{\mathrm{TM}\to\mathrm{TM\,port}}\)`, "transmission of the TM input into the fundamental mode of the TM port"], [String.raw`\(w_i\)`, "band weights of card 17: 101 wavelengths from 735 to 835 nm, σ = 8 nm"]],
how: [String.raw`Read it aloud: "the figure of merit is the weighted TE transmission to the TE port plus the weighted TM transmission to the TM port".`, "Each sum alone is at most 1, because the weights add up to 1. That is where the maximum 2 comes from.", "Leakage into the wrong port is not penalized directly: power in the wrong port cannot be in the right one.", "Two inputs mean two forward and two adjoint simulations for every evaluation.", "Used in Lesson 7, cards 5 and 6."],
say: "The PBS figure of merit is the sum of the band-weighted transmissions of TE into the TE port and TM into the TM port, with a maximum of 2, and each evaluation needs forward and adjoint runs for both polarizations.",
num: String.raw`Example: 0.9 for TE and 0.85 for TM at every wavelength give FOM = 1.75. A device that splits each polarization equally between both ports scores 1.0.`,
r(fig, ctl) {
  ctl.innerHTML = sl("za", "TE → TE port", 0, 1, 0.01, 0.9) + sl("zc", "TM → TM port", 0, 1, 0.01, 0.85) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\mathrm{FOM} = \underbrace{\sum_i w_i\, {\color{#378ADD}{T_{\mathrm{TE}\to\mathrm{TE\,port}}}}}_{\le\, 1} + \underbrace{\sum_i w_i\, {\color{#D85A30}{T_{\mathrm{TM}\to\mathrm{TM\,port}}}}}_{\le\, 1} \;\le\; 2`;
  const el = holder(fig, T);
  const u = () => {
    const a = +$("za").value, c = +$("zc").value; $("zav").textContent = a.toFixed(2); $("zcv").textContent = c.toFixed(2);
    let s = `<rect x="250" y="40" width="130" height="110" rx="8" fill="var(--purple-bg)" stroke="${PP}"/>` + tx(315, 100, "PBS", "middle", "th");
    s += `<line x1="40" x2="250" y1="95" y2="95" stroke="var(--p)" stroke-width="10" stroke-opacity="0.25"/>` + tx(40, 80, "TE₀ or TM₀ input", "start");
    s += `<line x1="380" x2="640" y1="60" y2="60" stroke="${PB}" stroke-width="${2 + 14 * a}" stroke-opacity="0.8"/>` + tx(640, 44, "TE port", "end") + `<line x1="380" x2="640" y1="130" y2="130" stroke="${PC}" stroke-width="${2 + 14 * c}" stroke-opacity="0.8"/>` + tx(640, 160, "TM port", "end");
    const X = v => 70 + v * 270;
    s += `<rect x="70" y="190" width="540" height="26" fill="none" stroke="var(--b)"/><rect x="70" y="190" width="${270 * a}" height="26" fill="${PB}" opacity="0.8"/><rect x="340" y="190" width="${270 * c}" height="26" fill="${PC}" opacity="0.8"/><line x1="340" x2="340" y1="184" y2="222" stroke="var(--t)"/>`;
    s += tx(70, 236, "0", "middle") + tx(340, 236, "1", "middle") + tx(610, 236, "2", "middle") + tx(205, 182, "TE part", "middle") + tx(475, 182, "TM part", "middle");
    el.innerHTML = svg(246, s);
    $("ro").innerHTML = `<div><span>FOM</span><b>${(a + c).toFixed(2)} of 2</b></div><div><span>simulations per evaluation</span><b>4 (2 forward, 2 adjoint)</b></div>`;
  };
  $("za").oninput = u; $("zc").oninput = u; u();
}},

/* ---------------- 19. Erosion-dilation penalty ---------------- */
{s: "19. ED penalty", t: String.raw`The erosion-dilation penalty \(P_{\mathrm{ED}}\) and its weight \(\min(1, \beta/25)\)`,
intu: String.raw`The filter discourages small features but does not forbid them, so a penalty measures how much the projected design changes under an opening and a closing (card 20) whose length scale equals the filter radius, \(R = 120\) nm. An opening removes GaAs features smaller than \(R\) and a closing fills air gaps smaller than \(R\), so a design without such features is unchanged by both. Smooth erosion and dilation are the conic filter followed by a sharp projection with thresholds 0.99 and 0.01. The penalty closes the design, opens it, and takes the root-mean-square difference. Its weight grows with the continuation \(\beta\), because an early grey design has no clear features to judge, and it reaches full weight at \(\beta = 25\).`,
eq: String.raw`\[ P_\mathrm{ED} = \frac{1}{\sqrt{N_p}}\, \big\lVert\, \mathcal{C}(\hat{\boldsymbol\rho}) - \mathcal{O}(\hat{\boldsymbol\rho}) \,\big\rVert_2, \qquad J = \mathrm{FOM} - \min\!\left(1,\,\frac{\beta}{25}\right) P_\mathrm{ED} \]<div class="eqnote">smooth closing and opening in Tidy3D</div>\[ \mathcal{C} = E \circ D, \qquad \mathcal{O} = D \circ E, \qquad E = P_{\beta,0.99} \circ \operatorname{filter}_R, \qquad D = P_{\beta,0.01} \circ \operatorname{filter}_R \]<div class="eqref">Ch. 3 Eq. (3.15), used in Lesson 9</div>`,
sym: [[String.raw`\(P_{\mathrm{ED}}\)`, "erosion-dilation penalty, 0 when the length scale is obeyed"], [String.raw`\(\mathcal{C},\ \mathcal{O}\)`, "smooth closing and smooth opening"], [String.raw`\(E,\ D\)`, "smooth erosion and smooth dilation"], [String.raw`\(P_{\beta,\eta}\)`, String.raw`tanh projection of card 12 with threshold \(\eta\). Its \(\beta\) is the penalty's own sharpness (Tidy3D default 20, 100 in Lesson 9)`], [String.raw`\(\operatorname{filter}_R\)`, String.raw`conic filter of radius \(R\) (card 11)`], [String.raw`\(\lVert \cdot \rVert_2\)`, "Euclidean norm: square root of the sum of squares over all pixels"], [String.raw`\(N_p\)`, "number of pixels, so the ratio is a root-mean-square"], [String.raw`\(\min(1, \beta/25)\)`, String.raw`weight: \(\beta/25\) while \(\beta \lt 25\), then 1. Here \(\beta\) is the continuation sharpness of card 13`], [String.raw`\(\mathrm{FOM}\)`, "figure of merit"]],
how: [String.raw`Read it aloud: "P ED is the norm of the closing minus the opening of rho hat, divided by the square root of the number of pixels, and \(J\) is the figure of merit minus the minimum of one and beta over 25, times P ED".`, String.raw`Threshold 0.99 keeps a pixel only if almost all of its neighbourhood is GaAs, which is erosion. Threshold 0.01 makes any GaAs nearby enough, which is dilation.`, String.raw`With these thresholds a penalty radius \(R\) discourages features and gaps narrower than about \(2R - \Delta \approx 1.75R\), not narrower than \(R\). The left panel shows the switch-off.`, String.raw`The weight is a ramp: small influence while the design is grey, full weight once \(\beta \ge 25\) (right panel).`, String.raw`Used in Lesson 9, cards 1, 2 and 4, and Lesson 15.`],
say: "The erosion-dilation penalty is the root-mean-square difference between the smooth closing and opening of the design, and its weight ramps up with beta to one at beta equals twenty-five.",
num: String.raw`With 11 levels of 7 steps from \(\beta = 1\) to 100, the weight is 1 for the last 4 levels, 28 of the 77 steps. The penalty in the left panel uses \(\beta = 100\) inside, as in Lesson 9.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zn", "Penalty radius R (pixels)", 2, 6, 1, 4) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\begin{gathered} {\color{#D85A30}{P_{\mathrm{ED}}}} = \underbrace{\frac{1}{\sqrt{N_p}}}_{\text{root mean square}} \Big\lVert \underbrace{{\color{#378ADD}{\mathcal{C}(\hat\rho)}}}_{\text{smooth closing}} - \underbrace{{\color{#1D9E75}{\mathcal{O}(\hat\rho)}}}_{\text{smooth opening}} \Big\rVert_2 \\ J = \mathrm{FOM} - \underbrace{{\color{#BA7517}{\min\!\left(1, \tfrac{\beta}{25}\right)}}}_{\text{weight ramp}}\, {\color{#D85A30}{P_{\mathrm{ED}}}} \end{gathered}`;
  const el = holder(fig, T);
  const steps = [...Array(77).keys()], wt = steps.map(k => Math.min(1, Math.pow(100, Math.floor(k / 7) / 10) / 25));
  const u = () => {
    const n = +$("zn").value; $("znv").textContent = n; const Wd = 8 * n + 8, Hd = 3 * n + 1, ws = [], Pb = [];
    for (let w = 1; w <= 4 * n; w++) { const a = new Float64Array(Wd * Hd), x0 = Math.floor(Wd / 2) - Math.floor(w / 2); for (let y = 0; y < Hd; y++) for (let x = x0; x < x0 + w; x++) a[y * Wd + x] = 1; ws.push(w); Pb.push(C3.edPenalty(a, Wd, Hd, n, 100).P); }
    const ym = Math.max(...Pb) * 1.15, X = C3.X(70, 250, 0, 4 * n);
    let s = tx(195, 16, "P_ED for a GaAs bar of width w", "middle", "th") + tx(525, 16, "weight min(1, β/25)", "middle", "th");
    s += C3.frame(70, 26, 250, 170, 0, 4 * n, 0, ym, [0, n, 2 * n, 3 * n, 4 * n], [0, ym / 2], "bar width w", "", v => (v === 0 ? "0" : v === n ? "R" : v / n + "R"), v => v.toFixed(2));
    s += `<line x1="${X(1.75 * n)}" x2="${X(1.75 * n)}" y1="26" y2="196" stroke="${PA}" stroke-dasharray="4 3"/>` + tx(X(1.75 * n) + 4, 40, "1.75R", "start");
    s += plot(70, 26, 250, 170, ws, Pb, 0, 4 * n, 0, ym, PC, 2.5);
    s += C3.frame(400, 26, 250, 170, 0, 77, 0, 1.1, [0, 35, 49, 77], [0, 0.5, 1], "optimization step (11 levels of 7)", "");
    s += plot(400, 26, 250, 170, steps.flatMap(k => [k, k + 1]), wt.flatMap(v => [v, v]), 0, 77, 0, 1.1, PA, 2.5);
    el.innerHTML = svg(262, s);
    const off = ws.find((w, i) => Pb[i] < 0.05 && Pb.slice(i).every(v => v < 0.05));
    $("ro").innerHTML = `<div><span>penalty switches off at</span><b>${off} px = ${(off / n).toFixed(2)} R</b></div><div><span>steps at full weight</span><b>28 of 77</b></div>`;
  };
  $("zn").oninput = u; u();
}},

/* ---------------- 20. Morphology ---------------- */
{s: "20. Morphology", t: String.raw`Erosion, dilation, opening and closing with a disk of radius \(r\)`,
intu: String.raw`Morphology describes a shape \(X\) by what a disk of radius \(r\) can do in it. Erosion keeps only the points where the whole disk fits inside \(X\), so every feature shrinks by \(r\). Dilation adds every point the disk touches, so every feature grows by \(r\). Opening is erosion followed by dilation: whatever was too thin for the disk is gone and does not come back, and sharp convex corners get rounded. Closing is dilation followed by erosion: narrow gaps and small holes fill up. A layout that both leave unchanged has no feature or gap narrower than \(2r\) and no corner sharper than radius \(r\). These are the operations behind the erosion and dilation penalty (card 19) and the design rule check and repair (card 23).`,
eq: String.raw`\[ \operatorname{erode}_r(X) = \{\, p : \operatorname{disk}(p, r) \subseteq X \,\} \qquad \operatorname{dilate}_r(X) = \{\, p : \operatorname{disk}(p, r) \cap X \neq \emptyset \,\} \]\[ \operatorname{open}_r = \operatorname{dilate}_r \circ \operatorname{erode}_r \qquad \operatorname{close}_r = \operatorname{erode}_r \circ \operatorname{dilate}_r \]\[ \operatorname{open}_r(X) = X = \operatorname{close}_r(X) \qquad \left(1 - \frac{\pi}{4}\right) r^2 \approx 0.21\, r^2 \]<div class="eqref">Ch. 3 Sec. 3.5, used in Lessons 8, 9 and 11</div>`,
sym: [[String.raw`\(X\)`, "the set of GaAs points, a binary layout"], [String.raw`\(p\)`, "a point of the plane"], [String.raw`\(\operatorname{disk}(p, r)\)`, String.raw`disk of radius \(r\) centered at \(p\)`], [String.raw`\(\{\, p : \dots \,\}\)`, '"the set of all points p such that ..."'], [String.raw`\(\subseteq\)`, '"lies entirely inside"'], [String.raw`\(\cap\)`, "intersection, the part the two sets share"], [String.raw`\(\neq \emptyset\)`, '"is not empty": the disk touches X'], [String.raw`\(\circ\)`, "composition: apply the right-hand operation first"], [String.raw`\(r\)`, "disk radius, half the minimum feature and gap"], [String.raw`\((1 - \pi/4)\,r^2\)`, "area that opening cuts from a sharp 90° corner"]],
how: [String.raw`Read it aloud: "erosion of \(X\) is the set of points where the disk fits inside \(X\), dilation is the set where the disk touches \(X\), opening is dilation after erosion, closing is erosion after dilation".`, String.raw`The \(\circ\) reads right to left: \(\operatorname{open}_r\) first erodes, then dilates.`, String.raw`A bar of width \(w\) survives opening only if \(w \gt 2r\). A gap of width \(g\) survives closing only if \(g \gt 2r\). Move \(r\) and watch the thin bar, the island, the gap and the hole.`, String.raw`A sharp corner always loses \((1 - \pi/4)r^2\) to opening, so it shows up as a small difference even when the features are wide.`, String.raw`Used in Lesson 8, and in the design rule check and repair of Lesson 11.`],
say: "Opening removes features too thin for a disk of radius r and closing fills gaps too narrow for it, so a layout unchanged by both obeys a minimum feature and gap of 2r.",
num: String.raw`In the test pattern the gap between the two upper blocks is 4 pixels wide, so closing fills it once \(r\) reaches 2 pixels. The bar below them is 4 pixels wide, so opening removes it at the same radius.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zr", "Disk radius r (pixels)", 1, 6, 0.5, 2) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\operatorname{open}_r = \underbrace{{\color{#378ADD}{\operatorname{dilate}_r}}}_{\text{then grow}} \circ \underbrace{{\color{#D85A30}{\operatorname{erode}_r}}}_{\text{shrink first}} \qquad \operatorname{close}_r = \underbrace{{\color{#D85A30}{\operatorname{erode}_r}}}_{\text{then shrink}} \circ \underbrace{{\color{#378ADD}{\operatorname{dilate}_r}}}_{\text{grow first}}`;
  const el = holder(fig, T), { X, W, H } = C3.pattern();
  const u = () => {
    const r = +$("zr").value; $("zrv").textContent = r;
    const o = C3.bOpen(X, W, H, r, 0), c = C3.bClose(X, W, H, r, 0), rem = X.map((v, i) => (v && !o[i] ? 1 : 0)), add = X.map((v, i) => (!v && c[i] ? 1 : 0));
    C3.drawRow(el, [{ a: X }, { a: o, over: [[rem, [216, 90, 48]]] }, { a: c, over: [[add, [55, 138, 221]]] }], W, H, 2, "Dark: GaAs. Coral: GaAs removed by opening. Blue: air filled by closing.", ["X", "open_r(X)", "close_r(X)"]);
    $("ro").innerHTML = `<div><span>pixels removed by opening</span><b>${sum(Array.from(rem))}</b></div><div><span>pixels filled by closing</span><b>${sum(Array.from(add))}</b></div><div><span>minimum feature and gap</span><b>2r = ${2 * r} px</b></div>`;
  };
  $("zr").oninput = u; u();
}},

/* ---------------- 21. Bezier curvature ---------------- */
{s: "21. Curvature", t: String.raw`Curvature from three vertices: a Bézier curve through the middle one`,
intu: String.raw`For the tapers and the PBS outline, sharp corners are discouraged by a penalty on the local radius of curvature, estimated at each vertex from a quadratic curve through that vertex and its two neighbours. An outline is a list of points, so its curvature has to be estimated. At each vertex, take it and its two neighbours and fit the quadratic Bézier curve that starts at the first neighbour, ends at the second and passes through the middle vertex at \(t = 1/2\). That condition fixes the middle control point. The first and second derivatives of the curve at \(t = 1/2\) then give the curvature from the usual formula, and the local radius is its inverse. For points on a circle the estimate is slightly smaller than the true radius, and closer the denser the points.`,
eq: String.raw`\[ B(t) = (1 - t)^2\, \mathbf{p}_0 + 2t(1 - t)\, \mathbf{p}_1 + t^2\, \mathbf{p}_2, \qquad \mathbf{p}_1 = 2\mathbf{p}_c - \frac{\mathbf{p}_0 + \mathbf{p}_2}{2} \]\[ B'\!\left(\tfrac{1}{2}\right) = \mathbf{p}_2 - \mathbf{p}_0, \qquad B'' = 4(\mathbf{p}_0 - 2\mathbf{p}_c + \mathbf{p}_2) \]\[ \kappa = \frac{x'y'' - y'x''}{(x'^2 + y'^2)^{3/2}}, \qquad r = \frac{1}{\lvert \kappa \rvert}, \qquad r_{\mathrm{est}} = \frac{R\,(1 + \cos\varphi)}{2} \]<div class="eqref">Michaels Eq. (34), Tidy3D bezier_curvature, used in Lesson 10</div>`,
sym: [[String.raw`\(\mathbf{p}_0,\ \mathbf{p}_2\)`, "the two neighbouring vertices"], [String.raw`\(\mathbf{p}_c\)`, "the vertex whose curvature is wanted"], [String.raw`\(\mathbf{p}_1\)`, "middle control point of the Bézier curve, generally not on the curve"], [String.raw`\(B(t)\)`, String.raw`quadratic Bézier curve, \(t\) from 0 to 1`], [String.raw`\(B',\ B''\)`, String.raw`first and second derivative of the curve with respect to \(t\)`], [String.raw`\(x', y', x'', y''\)`, String.raw`components of \(B'\) and \(B''\)`], [String.raw`\(\kappa\)`, "curvature, signed: the sign separates convex from concave"], [String.raw`\(r\)`, "local radius of curvature"], [String.raw`\(\lvert \cdot \rvert\)`, "absolute value"], [String.raw`\(R\)`, "true radius of a circle the points lie on"], [String.raw`\(\varphi\)`, "angle between neighbouring points, seen from the circle center"], [String.raw`\(r_{\mathrm{est}}\)`, "radius the three-point estimate gives on that circle"]],
how: [String.raw`Read it aloud: "the middle control point is twice the vertex minus the average of its neighbours, and the curvature is x prime y double prime minus y prime x double prime over the speed cubed, with the radius its inverse".`, String.raw`Requiring \(B(1/2) = \mathbf{p}_c\) gives \(\mathbf{p}_1\). At \(t = 1/2\) the derivatives are \(\mathbf{p}_2 - \mathbf{p}_0\) and \(4(\mathbf{p}_0 - 2\mathbf{p}_c + \mathbf{p}_2)\).`, String.raw`Three points on a line give \(B'' = 0\), so \(\kappa = 0\) and \(r = \infty\). A sharp kink gives a large \(B''\) and a small \(r\).`, String.raw`On a circle the estimate is \(R(1 + \cos\varphi)/2\), always a little below \(R\). Slide \(\varphi\) and compare the teal circle with the dashed one.`, String.raw`Used in Lesson 10, card 2.`],
say: "At each vertex a quadratic Bézier curve through it and its two neighbours gives the local curvature, and the radius of curvature is its inverse.",
num: String.raw`10 points per quarter circle means \(\varphi = 9^\circ\), so \(r_{\mathrm{est}} = R(1 + \cos 9^\circ)/2 = 0.994\,R\), within 0.6 % of \(R\). With very coarse spacing the radius is underestimated.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zp", "Spacing angle φ (degrees)", 3, 45, 1, 30) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\begin{gathered} {\color{#BA7517}{\mathbf{p}_1}} = \underbrace{2{\color{#D85A30}{\mathbf{p}_c}} - \frac{{\color{#378ADD}{\mathbf{p}_0}} + {\color{#378ADD}{\mathbf{p}_2}}}{2}}_{\text{so the curve passes through }\mathbf{p}_c} \\ {\color{#1D9E75}{\kappa}} = \frac{x'y'' - y'x''}{\underbrace{(x'^2 + y'^2)^{3/2}}_{\text{speed cubed}}} \qquad \underbrace{{\color{#7F77DD}{r}} = \frac{1}{\lvert {\color{#1D9E75}{\kappa}} \rvert}}_{\text{local radius}} \end{gathered}`;
  const el = holder(fig, T), R = 170, cx = 340, cy = 232;
  const u = () => {
    const ph = +$("zp").value; $("zpv").textContent = ph + "°"; const a = ph * Math.PI / 180;
    const p0 = [-R * Math.sin(a), R * Math.cos(a)], pc = [0, R], p2 = [R * Math.sin(a), R * Math.cos(a)], k = C3.bezierK(p0, pc, p2), re = 1 / Math.abs(k);
    const S = (p) => [cx + p[0], cy - p[1]], q0 = S(p0), qc = S(pc), q2 = S(p2), p1 = [2 * pc[0] - (p0[0] + p2[0]) / 2, 2 * pc[1] - (p0[1] + p2[1]) / 2], q1 = S(p1);
    let s = `<defs><clipPath id="bzclip"><rect x="0" y="0" width="680" height="262"/></clipPath></defs><g clip-path="url(#bzclip)"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)" stroke-dasharray="5 4"/><circle cx="${cx}" cy="${cy - R + re}" r="${re}" fill="none" stroke="${PT}" stroke-width="2"/></g>`;
    s += `<line x1="${q0[0]}" y1="${q0[1]}" x2="${q1[0]}" y2="${q1[1]}" stroke="${PA}" stroke-dasharray="3 3"/><line x1="${q2[0]}" y1="${q2[1]}" x2="${q1[0]}" y2="${q1[1]}" stroke="${PA}" stroke-dasharray="3 3"/>`;
    s += `<path d="M${q0[0]} ${q0[1]} Q${q1[0]} ${q1[1]} ${q2[0]} ${q2[1]}" fill="none" stroke="${PC}" stroke-width="2.5"/>`;
    s += `<circle cx="${q0[0]}" cy="${q0[1]}" r="5" fill="${PB}"/><circle cx="${q2[0]}" cy="${q2[1]}" r="5" fill="${PB}"/><circle cx="${qc[0]}" cy="${qc[1]}" r="5" fill="${PC}"/><circle cx="${q1[0]}" cy="${q1[1]}" r="5" fill="var(--bg)" stroke="${PA}" stroke-width="2"/>`;
    s += tx(q0[0] - 8, q0[1] + 4, "p₀", "end") + tx(q2[0] + 8, q2[1] + 4, "p₂", "start") + tx(qc[0] + 8, qc[1] + 16, "p_c", "start") + tx(q1[0] + 9, q1[1] + 4, "p₁ (control)", "start");
    s += C3.legend(20, 282, [["true circle R", "var(--b)", "5 4"], ["Bézier through p_c", PC], ["circle of radius r = 1/|κ|", PT]]);
    el.innerHTML = svg(292, s);
    $("ro").innerHTML = `<div><span>r from the Bézier</span><b>${(re / R).toFixed(4)} R</b></div><div><span>R(1 + cos φ)/2</span><b>${((1 + Math.cos(a)) / 2).toFixed(4)} R</b></div><div><span>points per quarter circle</span><b>${(90 / ph).toFixed(1)}</b></div>`;
  };
  $("zp").oninput = u; u();
}},

/* ---------------- 22. Curvature penalty ---------------- */
{s: "22. Curvature penalty", t: String.raw`The curvature penalty: \(P_\kappa\), a logistic switch averaged over the vertices`,
intu: String.raw`For the tapers and the PBS outline, sharp corners are discouraged by a penalty on the local radius of curvature \(r_i\) of each vertex (card 21). Every vertex pays a charge that depends on its local radius. The logistic function is a smooth switch: close to 1 when the radius is well below the minimum \(r_{\mathrm{min}}\), exactly 1/2 at \(r_{\mathrm{min}}\), and close to 0 well above it. The steepness \(\kappa\) sets how sharp the switch is. Tidy3D averages the charge over the vertices, so the same weight works for outlines with many or few points. Subtracting it from the figure of merit makes the optimizer round off corners that are tighter than the minimum radius.`,
eq: String.raw`\[ P_\kappa = \frac{1}{N_v} \sum_{i} \frac{e^{-\kappa (r_i - r_\mathrm{min})}}{1 + e^{-\kappa (r_i - r_\mathrm{min})}}, \qquad J = F - w_\kappa P_\kappa \]<div class="eqnote">the charge of one vertex, in the equivalent form</div>\[ \frac{e^{-\kappa(r - r_{\mathrm{min}})}}{1 + e^{-\kappa(r - r_{\mathrm{min}})}} = \frac{1}{1 + e^{\kappa(r - r_{\mathrm{min}})}} \]<div class="eqref">Ch. 3 Eq. (3.16), Michaels Eqs. (17) and (35), averaged over the vertices as in Tidy3D, used in Lesson 10</div>`,
sym: [[String.raw`\(p(r)\)`, "charge of one vertex, between 0 and 1"], [String.raw`\(r\)`, "local radius of curvature of the vertex (card 21)"], [String.raw`\(r_{\mathrm{min}}\)`, "smallest radius allowed"], [String.raw`\(\kappa\)`, String.raw`steepness of the switch, per µm, with \(r\) in µm. Here \(\kappa\) is a steepness, not the curvature of card 21`], [String.raw`\(e^{x}\)`, "exponential function"], [String.raw`\(P_{\kappa}\)`, "curvature penalty, the mean charge"], [String.raw`\(N_v\)`, "number of vertices with a neighbour on each side"], [String.raw`\(r_i\)`, String.raw`radius at vertex \(i\)`], [String.raw`\(w_{\kappa}\)`, "weight of the curvature penalty"], [String.raw`\(F\)`, "figure of merit"]],
how: [String.raw`Read it aloud: "P kappa is the average over the vertices of e to the minus kappa times r i minus r min, over one plus the same", and "J is F minus w kappa times P kappa".`, String.raw`The two forms are equal: multiply the top and bottom of the first by \(e^{\kappa(r - r_{\mathrm{min}})}\).`, String.raw`At \(r = r_{\mathrm{min}}\) the charge is 1/2. One unit of \(1/\kappa\) above \(r_{\mathrm{min}}\) it falls to 0.27, two units to 0.12.`, String.raw`A small \(\kappa\) is a gentle shaping force that also touches safe corners. A large \(\kappa\) is close to a hard limit but gives almost no gradient away from \(r_{\mathrm{min}}\).`, String.raw`Used in Lesson 10, cards 3 to 5.`],
say: "Each vertex pays a logistic charge that switches on when its radius of curvature falls below the minimum, and the penalty is the mean over all vertices.",
num: String.raw`With \(r_{\mathrm{min}} = 50\) nm and \(\kappa = 200\ \mu\mathrm{m}^{-1}\): 0.07 for a corner of 63 nm, 0.88 for one of 40 nm. With \(\kappa = 10\ \mu\mathrm{m}^{-1}\), a vertex 100 nm above \(r_{\mathrm{min}}\) still pays 0.27.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zk", "Steepness κ (per µm)", 5, 300, 5, 200) + sl("zm", "r_min (nm)", 20, 150, 1, 50) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#D85A30}{p(r)}} = \frac{1}{1 + \exp\!\big[ \underbrace{{\color{#378ADD}{\kappa}}}_{\text{steepness}} (\underbrace{{\color{#7F77DD}{r}} - {\color{#1D9E75}{r_{\mathrm{min}}}}}_{\text{margin}}) \big]} \qquad {\color{#BA7517}{P_{\kappa}}} = \underbrace{\frac{1}{N_v}\sum_i p(r_i)}_{\text{mean charge}}`;
  const el = holder(fig, T), rs = range(0, 300, 301);
  const u = () => {
    const k = +$("zk").value, rm = +$("zm").value; $("zkv").textContent = k; $("zmv").textContent = rm + " nm";
    const p = (r, kk) => 1 / (1 + Math.exp(kk * (r - rm) / 1000)), X = C3.X(70, 560, 0, 300);
    let s = C3.frame(70, 20, 560, 180, 0, 300, 0, 1.05, [0, 50, 100, 150, 200, 250, 300], [0, 0.5, 1], "local radius r (nm)", "charge p(r)");
    s += `<line x1="${X(rm)}" x2="${X(rm)}" y1="20" y2="200" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(X(rm) + 5, 34, "r_min", "start");
    s += plot(70, 20, 560, 180, rs, rs.map(r => p(r, 10)), 0, 300, 0, 1.05, "var(--b)", 1.5, "5 4") + plot(70, 20, 560, 180, rs, rs.map(r => p(r, k)), 0, 300, 0, 1.05, PC, 2.5);
    s += C3.legend(80, 252, [["chosen κ", PC], ["κ = 10 per µm, gentle", "var(--b)", "5 4"]]);
    el.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>charge at r_min − 10 nm</span><b>${p(rm - 10, k).toFixed(2)}</b></div><div><span>at r_min + 13 nm</span><b>${p(rm + 13, k).toFixed(2)}</b></div><div><span>at r_min + 100 nm</span><b>${p(rm + 100, k).toFixed(2)}</b></div>`;
  };
  $("zk").oninput = u; $("zm").oninput = u; u();
}},

/* ---------------- 23. DRC and repair, step by step ---------------- */
{s: "23. DRC and repair", t: String.raw`Design rule check and repair: \(X_{\mathrm{healed}} = \mathrm{open}_r(\mathrm{close}_r(X))\)`,
intu: String.raw`Penalties only discourage violations, so the final PBS gets a hard check against three rules: minimum GaAs width 120 nm, minimum air gap 120 nm, and minimum area \((120\ \mathrm{nm})^2\) for any island or hole. With the morphology of card 20 the width and gap check becomes two area measurements, computed in Shapely with a disk of radius \(r = 59\) nm: GaAs that the opening removes is too thin, air that the closing fills is too narrow, and both must have zero area. The KLayout width and space checks run as a second, independent test. A design that fails is repaired with a closing and then an opening of radius 63 nm. Step through check, close, open and check again.`,
eq: String.raw`\[ \mathrm{area}\big(X \setminus \mathrm{open}_r(X)\big) = 0, \qquad \mathrm{area}\big(\mathrm{close}_r(X) \setminus X\big) = 0, \qquad r = 59\ \mathrm{nm} \]\[ X_\mathrm{healed} = \mathrm{open}_r\big(\mathrm{close}_r(X)\big), \qquad r = 63\ \mathrm{nm} \]<div class="eqref">Ch. 3 Sec. 3.5 and Eq. (3.17), used in Lesson 11</div>`,
sym: [[String.raw`\(X\)`, "the layout, the set of GaAs points"], [String.raw`\(\setminus\)`, "set difference: points in the first set but not in the second"], [String.raw`\(\mathrm{area}(\cdot)\)`, "area of a set"], [String.raw`\(r = 59\ \mathrm{nm}\)`, "check radius, half the rule minus 1 nm, so a feature exactly at the limit is not flagged by rounding"], [String.raw`\(r = 63\ \mathrm{nm}\)`, "repair radius, 3 nm more than half the rule, so rounding to a 1 nm grid cannot create a new violation"], [String.raw`\(X_{\mathrm{healed}}\)`, "the repaired layout"]],
how: [String.raw`Read it aloud: "the GaAs removed by opening and the air filled by closing must both have zero area, and the healed layout is the opening of the closing of \(X\)".`, String.raw`\(X \setminus \mathrm{open}_r(X)\) is the too-thin GaAs (coral), \(\mathrm{close}_r(X) \setminus X\) the too-narrow air (blue).`, "Closing first fills narrow gaps, opening then removes thin parts and rounds corners.", "The area rule is a separate test: a disk exactly as wide as the rule has area π/4 times the rule squared, below the square area rule.", "Repair changes the geometry and can lower the performance, so the outline is optimized again, checked and repaired every five steps, and only passing designs are kept. Used in Lesson 11."],
say: "The layout passes when opening and closing with a 59 nanometer disk change nothing, and a failing layout is healed by a closing followed by an opening with a 63 nanometer disk.",
num: "Rule 120 nm: check radius 59 nm, repair radius 63 nm. The layout in the figure is 850 × 800 nm on 5 nm pixels, with a 90 nm slot, a 60 nm hole, a 60 nm line, a 60 nm island and a 130 nm round island.",
r(fig, ctl) {
  const caps = ["Check with r = 59 nm. Coral: GaAs the opening removes, too thin. Blue: air the closing fills, too narrow. The layout fails.",
    "Repair, first part: close with r = 63 nm. Blue: air filled. The narrow slot and the small hole fill up.",
    "Repair, second part: open with r = 63 nm. Coral: GaAs removed. The thin line, the small island and the sharp tips go.",
    "Check the healed layout with r = 59 nm: width and gap pass. The 130 nm round island is still below the area rule, which is checked separately."];
  ctl.innerHTML = '<div id="z23c"></div><div class="readout" id="ro"></div>';
  const T = String.raw`\begin{gathered} \underbrace{\mathrm{area}\big(X \setminus {\color{#D85A30}{\mathrm{open}_r(X)}}\big)}_{\text{too-thin GaAs}} = 0 \qquad \underbrace{\mathrm{area}\big({\color{#378ADD}{\mathrm{close}_r(X)}} \setminus X\big)}_{\text{too-narrow air}} = 0 \\ {\color{#1D9E75}{X_{\mathrm{healed}}}} = \underbrace{{\color{#D85A30}{\mathrm{open}_r}}}_{\text{then trim}} \big( \underbrace{{\color{#378ADD}{\mathrm{close}_r}}(X)}_{\text{fill first}} \big) \end{gathered}`;
  const el = holder(fig, T), Ly = C3.drcLayout(13), X = Ly.X, W = Ly.W, H = Ly.H, rc = 59 / 5, rh = 63 / 5;
  const d0 = C3.drc(X, W, H, rc, 0, 12), C = C3.bClose(X, W, H, rh, 0), Hl = C3.bOpen(C, W, H, rh, 0), d1 = C3.drc(Hl, W, H, rc, 0, 12);
  const small = C3.components(Hl, W, H, 1).filter(c => c.area < (120 / 5) ** 2).length;
  steps(fig, $("z23c"), caps, k => {
    const R = [216, 90, 48], B = [55, 138, 221];
    const right = [{ a: X, over: [[d0.solid, R], [d0.gap, B]] }, { a: C, over: [[C.map((v, i) => v && !X[i] ? 1 : 0), B]] }, { a: Hl, over: [[Hl.map((v, i) => !v && C[i] ? 1 : 0), R]] }, { a: Hl, over: [[d1.solid, R], [d1.gap, B]] }][k];
    C3.drawRow(el, [{ a: X }, right], W, H, 1.7, "", ["layout X", ["checked, r = 59 nm", "close_r(X), r = 63 nm", "open_r(close_r(X))", "X_healed, checked"][k]]);
    $("ro").innerHTML = `<div><span>width or gap violations</span><b>${k === 0 ? d0.rs + d0.rg + " regions" : k === 3 ? d1.rs + d1.rg + " regions" : "repairing"}</b></div><div><span>islands below (120 nm)² after repair</span><b>${k === 3 ? small : "not checked yet"}</b></div>`;
  }, { dwell: 3.2 });
}},

/* ---------------- 24. Grid cell ---------------- */
{s: "24. Grid cell", t: String.raw`The grid: \(\Delta = \lambda_0/(N_\lambda\, n_{\mathrm{GaAs}})\)`,
intu: String.raw`Tidy3D builds a non-uniform grid from a set number of steps per wavelength in each material, quoted in the thesis for GaAs, the material with the shortest wavelength. Inside GaAs the wavelength is \(\lambda_0/n_{\mathrm{GaAs}}\), and \(N_\lambda\) cells are fitted into it. The gratings are designed in two dimensions at 30 steps per wavelength, the tapers and the PBS in three dimensions at 20. The PBS pixels are chosen the same size as the nominal GaAs cell, so design pixels and solver cells have the same scale. Move \(N_\lambda\) and watch the wave in GaAs sampled by the grid. In 3D the number of cells grows as \(N_\lambda^3\), and the time step shrinks with the cell, so the cost grows as \(N_\lambda^4\).`,
eq: String.raw`\[ \Delta = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \]\[ \text{2D gratings: } N_\lambda = 30, \qquad \text{3D tapers and PBS: } N_\lambda = 20, \qquad \text{cost}_{\text{3D}} \propto N_\lambda^4 \]<div class="eqref">Ch. 3 Sec. 3.6, grid and dimensions</div>`,
sym: [[String.raw`\(\Delta\)`, "nominal cell size inside GaAs"], [String.raw`\(\lambda_0\)`, "vacuum wavelength"], [String.raw`\(N_\lambda\)`, "grid steps per wavelength, quoted for GaAs"], [String.raw`\(n_{\mathrm{GaAs}}\)`, "refractive index of GaAs, 3.5 in the round example"], [String.raw`\(N_\lambda^4\)`, "three space dimensions and the time step"]],
how: [String.raw`Read it aloud: "the cell is the vacuum wavelength divided by the steps per wavelength times the GaAs index".`, String.raw`The wavelength is shortest in the material with the highest index, so a rule quoted for GaAs is the strictest. Air regions get larger cells on the non-uniform grid.`, "Twice as many steps per wavelength halve the cell in all three directions, 8 times more cells, and the stable time step also halves, so 16 times the cost.", "This is why the gratings, which can be designed in 2D, use the finer 30 steps, while the 3D designs use 20.", "The 2D grating designs and the PBS and MMI results are evaluated at 30 steps per wavelength, and the 3D grating results, with the taper, at 20."],
say: "The grid cell is the vacuum wavelength over the number of steps per wavelength times the GaAs index, 20 steps for the 3D designs and 30 for the 2D gratings, and the PBS pixel is matched to that cell.",
num: String.raw`Round example, \(\lambda_0 = 800\) nm and \(n = 3.5\): 20 steps give \(\Delta = 11.4\) nm and 30 steps 7.6 nm. With 795 nm and the GaAs index the thesis quotes 11.38 nm at 20 steps, the PBS pixel size.`,
r(fig, ctl) {
  let N = 20, playing = false;
  ctl.innerHTML = btns([["20", "20 steps (3D)"], ["30", "30 steps (2D gratings)"]], "zn") + sl("zN", "Steps per wavelength N_λ", 6, 40, 1, 20) + `<div class="row"><button id="zpl">Play wave</button></div><div class="readout" id="ro"></div>`;
  const T = String.raw`{\color{#D85A30}{\Delta}} = \frac{\lambda_0}{\underbrace{{\color{#378ADD}{N_\lambda}}}_{\text{steps per wavelength}}\; \underbrace{n_{\mathrm{GaAs}}}_{3.5}}`;
  const el = holder(fig, T), l0 = 800, n = 3.5, lg = l0 / n;
  const u = (t) => {
    t = t || 0; pick(ctl, "zn", N); $("zN").value = N; $("zNv").textContent = N;
    const d = l0 / (N * n), L = 2 * lg, X = v => 40 + v / L * 600;
    let s = `<rect x="40" y="40" width="600" height="120" fill="var(--blue-bg)" opacity="0.6"/>` + tx(46, 34, "inside GaAs, two wavelengths λ₀/n = 2 × 229 nm", "start");
    for (let x = 0; x <= L + 1e-6; x += d) s += `<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="40" y2="160" stroke="var(--b)" stroke-width="0.8"/>`;
    const f = x => Math.sin(2 * Math.PI * (x / lg - t * 0.5));
    let dd = ""; for (let i = 0; i <= 300; i++) { const x = L * i / 300; dd += (i ? "L" : "M") + X(x).toFixed(1) + " " + (100 - 48 * f(x)).toFixed(1); }
    s += `<path d="${dd}" fill="none" stroke="${PB}" stroke-width="1.5" opacity="0.7"/>`;
    let ds = ""; for (let x = 0; x <= L + 1e-6; x += d) { ds += (ds ? "L" : "M") + X(x).toFixed(1) + " " + (100 - 48 * f(x)).toFixed(1); s += `<circle cx="${X(x).toFixed(1)}" cy="${(100 - 48 * f(x)).toFixed(1)}" r="2.6" fill="${PC}"/>`; }
    s += `<path d="${ds}" fill="none" stroke="${PC}" stroke-width="1.5"/>`;
    s += arrow(X(0), 176, X(d), 176, PC, 1.5, null, true) + tx(X(d) + 6, 180, `Δ = ${d.toFixed(1)} nm`, "start");
    const rel = Math.pow(N / 20, 4);
    s += tx(40, 214, "blue: the wave, coral: what the grid samples, one dot per cell", "start") + tx(640, 214, `3D cost relative to 20 steps: ${rel < 10 ? rel.toFixed(2) : rel.toFixed(0)} ×`, "end");
    el.innerHTML = svg(226, s);
    $("ro").innerHTML = `<div><span>cell Δ at 800 nm, n = 3.5</span><b>${d.toFixed(2)} nm</b></div><div><span>cells per GaAs wavelength</span><b>${N}</b></div><div><span>3D cells per µm³</span><b>${(Math.pow(1000 / d, 3) / 1e6).toFixed(2)} million</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("zpl").textContent = "Play wave"; };
  ctl.querySelectorAll("button[data-zn]").forEach(b => b.onclick = () => { N = +b.dataset.zn; if (!playing) u(); });
  $("zN").oninput = () => { N = +$("zN").value; if (!playing) u(); };
  $("zpl").onclick = () => { if (playing) { stop(); return; } playing = true; $("zpl").textContent = "Pause"; anim(t => { if (!fig.isConnected) { stopAnim(); return; } u(t); }); };
  u();
}},

/* ---------------- 25. Adam moments ---------------- */
{s: "25. Adam averages", t: String.raw`Adam's running averages and their bias correction`,
intu: String.raw`All optimizations in the thesis use Adam through the optax library, with its default moment decay rates 0.9 and 0.999. Adam keeps two running averages for every parameter: \(m\), the average gradient, which gives the direction, and \(v\), the average squared gradient, which measures the typical size. Each step mixes a small part of the new gradient into the old average. Both averages start at zero, so in the first steps they are too small. Dividing by \(1 - \beta^t\) removes this start-up bias exactly for a constant gradient. Without it the first steps would be several times too large.`,
eq: String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2 \]\[ \hat m_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]<div class="eqref">Kingma and Ba, Alg. 1, through optax (Ch. 3 Sec. 3.6), used in Lesson 13</div>`,
sym: [[String.raw`\(t\)`, "step number, 1, 2, 3, ..."], [String.raw`\(g_t\)`, "gradient of one parameter at step t"], [String.raw`\(m_t\)`, "first moment: running mean of the gradient"], [String.raw`\(v_t\)`, "second moment: running mean of the squared gradient"], [String.raw`\(\beta_1 = 0.9\)`, "decay rate of m, a memory of about 10 steps"], [String.raw`\(\beta_2 = 0.999\)`, "decay rate of v, a memory of about 1000 steps"], [String.raw`\(\beta_1^t,\ \beta_2^t\)`, String.raw`the decay rates raised to the power \(t\). These \(\beta\) are not the projection sharpness of card 12`], [String.raw`\(\hat m_t,\ \hat v_t\)`, "bias-corrected averages (the hat marks corrected)"], [String.raw`\(1 - \beta^t\)`, "total weight the average has collected after t steps"]],
how: [String.raw`Read it aloud: "\(m_t\) is beta one times the old \(m\) plus one minus beta one times the new gradient, and m hat is \(m\) divided by one minus beta one to the power \(t\)", and the same for \(v\).`, String.raw`Unrolled, \(m_t = (1 - \beta_1)\sum_i \beta_1^{t-i} g_i\). For a constant gradient the weights add up to \(1 - \beta_1^t\), which is what the correction divides out.`, String.raw`\(1 - \beta_1^t\) is 0.1 at \(t = 1\) and 0.99 at \(t = 44\). \(1 - \beta_2^t\) is only 0.001 at \(t = 1\) and 0.63 at \(t = 1000\), so the correction of \(v\) matters much longer.`, String.raw`The right panel shows the raw step ratio \(m_t/\sqrt{v_t}\) for a constant gradient. The corrected ratio is exactly 1 from the first step.`, String.raw`Used in Lesson 13, cards 2, 3 and 6.`],
say: "Adam keeps running averages of the gradient and of its square, and divides them by one minus the decay rate to the power t to remove the bias from starting at zero.",
num: String.raw`Without the correction the first step ratio would be \(m_1/\sqrt{v_1} = 0.1g/(0.032\lvert g \rvert) \approx 3.2\) instead of 1.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zt", "Step t (log scale)", 0, 4, 0.02, 1) + '<div class="readout" id="ro"></div>';
  const T = String.raw`{\color{#378ADD}{m_t}} = \underbrace{{\color{#BA7517}{\beta_1}}\, m_{t-1}}_{\text{old average}} + \underbrace{(1 - {\color{#BA7517}{\beta_1}})\, {\color{#7F77DD}{g_t}}}_{\text{new gradient}} \qquad {\color{#D85A30}{\hat m_t}} = \frac{{\color{#378ADD}{m_t}}}{\underbrace{1 - {\color{#BA7517}{\beta_1^t}}}_{\text{start-up bias}}} \qquad {\color{#D85A30}{\hat v_t}} = \frac{{\color{#1D9E75}{v_t}}}{1 - \beta_2^t}`;
  const el = holder(fig, T), ls = range(0, 4, 201), f1 = t => 1 - Math.pow(0.9, t), f2 = t => 1 - Math.pow(0.999, t), rr = t => f1(t) / Math.sqrt(f2(t)), lab = ["1", "10", "100", "1000", "10⁴"];
  const u = () => {
    const lt = +$("zt").value, t = Math.max(1, Math.round(Math.pow(10, lt))); $("ztv").textContent = t;
    const X1 = C3.X(70, 250, 0, 4), X2 = C3.X(400, 250, 0, 4), Y1 = C3.Y(26, 170, 0, 1.05), Y2 = C3.Y(26, 170, 0, 7.5), xl = Math.log10(t);
    let s = tx(195, 16, "correction factors 1 − βᵗ", "middle", "th") + tx(525, 16, "step ratio for a constant gradient", "middle", "th");
    s += C3.frame(70, 26, 250, 170, 0, 4, 0, 1.05, [0, 1, 2, 3, 4], [0, 0.5, 1], "step t", "", v => lab[v]);
    s += plot(70, 26, 250, 170, ls, ls.map(v => f1(Math.pow(10, v))), 0, 4, 0, 1.05, PB, 2.5) + plot(70, 26, 250, 170, ls, ls.map(v => f2(Math.pow(10, v))), 0, 4, 0, 1.05, PT, 2.5);
    s += C3.frame(400, 26, 250, 170, 0, 4, 0, 7.5, [0, 1, 2, 3, 4], [0, 1, 3, 5, 7], "step t", "", v => lab[v]);
    s += plot(400, 26, 250, 170, ls, ls.map(v => rr(Math.pow(10, v))), 0, 4, 0, 7.5, PC, 2.5) + plot(400, 26, 250, 170, ls, ls.map(() => 1), 0, 4, 0, 7.5, "var(--t)", 2, "5 4");
    s += `<line x1="${X1(xl)}" x2="${X1(xl)}" y1="26" y2="196" stroke="${PP}" stroke-dasharray="4 3"/><line x1="${X2(xl)}" x2="${X2(xl)}" y1="26" y2="196" stroke="${PP}" stroke-dasharray="4 3"/>`;
    s += C3.legend(70, 252, [["1 − 0.9ᵗ", PB], ["1 − 0.999ᵗ", PT]]) + C3.legend(400, 252, [["raw mₜ/√vₜ", PC], ["corrected", "var(--t)", "5 4"]]);
    el.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>1 − β₁ᵗ</span><b>${f1(t).toFixed(3)}</b></div><div><span>1 − β₂ᵗ</span><b>${f2(t).toFixed(4)}</b></div><div><span>raw ratio mₜ/√vₜ</span><b>${rr(t).toFixed(2)}</b></div>`;
  };
  $("zt").oninput = u; u();
}},

/* ---------------- 26. Adam update ---------------- */
{s: "26. Adam update", t: String.raw`The Adam update: \(\theta_t = \theta_{t-1} - \alpha\,\hat m_t/(\sqrt{\hat v_t} + \epsilon)\)`,
intu: String.raw`The step of each parameter is its corrected average gradient divided by the square root of its corrected average squared gradient. That ratio is about \(\pm 1\) when the gradient is steady, whatever its size, so the learning rate \(\alpha\) sets the step length directly. A parameter with a huge gradient and one with a tiny gradient move by similar amounts. This is why Adam copes with parameters of very different sensitivity, where plain gradient descent must use a step small enough for the most sensitive one. The thesis maximizes \(J\), so the step is added instead of subtracted. Press Play to watch both methods take their 60 steps.`,
eq: String.raw`\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]\[ \beta_1 = 0.9 \qquad \beta_2 = 0.999 \qquad \epsilon = 10^{-8} \qquad \text{gradient descent stable for } \alpha \lt 1/S^2 \]<div class="eqref">Kingma and Ba, Alg. 1, through optax with its default decay rates (Ch. 3 Sec. 3.6), used in Lesson 13. For maximizing J the minus becomes a plus.</div>`,
sym: [[String.raw`\(\theta_t\)`, "value of one parameter after step t"], [String.raw`\(\alpha\)`, "learning rate, the typical step size"], [String.raw`\(\hat m_t,\ \hat v_t\)`, "corrected averages of card 25"], [String.raw`\(\sqrt{\hat v_t}\)`, "typical size of the gradient, root mean square"], [String.raw`\(\epsilon\)`, String.raw`\(10^{-8}\), prevents division by zero`], [String.raw`\(\beta_1,\ \beta_2\)`, "the optax default decay rates, used for every thesis optimization"], [String.raw`\(S\)`, String.raw`sensitivity ratio of the test valley \(f = (x - 1)^2 + S^2(y - 0.5)^2\)`]],
how: [String.raw`Read it aloud: "the new parameter is the old one minus alpha times m hat over the square root of v hat plus epsilon".`, String.raw`If every gradient is multiplied by a constant \(c\), \(\hat m\) scales by \(c\) and \(\sqrt{\hat v}\) by \(|c|\), so the step does not change: Adam is scale invariant.`, String.raw`Since \(|\hat m_t/\sqrt{\hat v_t}| \lesssim 1\) for typical gradients, each step moves a parameter by at most about \(\alpha\).`, String.raw`Plain gradient descent on the valley is stable only for \(\alpha \lt 1/S^2\), so the gentle \(x\) direction crawls. In the figure it uses its best stable step, \(0.9/S^2\), while Adam uses \(\alpha = 0.05\).`, String.raw`Used in Lesson 13, cards 1, 2, 4 and 5, and in every run of Lesson 15. Each thesis optimization was saved after every step, so it could be resumed (Lesson 13, card 6).`],
say: "Adam steps each parameter by the learning rate times its average gradient divided by the root of its average squared gradient, so the step size does not depend on the scale of the gradient.",
num: String.raw`Defaults \(\beta_1 = 0.9\), \(\beta_2 = 0.999\), \(\epsilon = 10^{-8}\). At \(S = 10\) plain descent needs \(\alpha\) below 0.01, and the \(x\) direction then needs hundreds of steps. In photonic inverse design \(\alpha\) is usually raised to between about 0.005 and 0.1.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zS", "Sensitivity ratio S", 1, 12, 0.5, 6) + `<div class="row"><button id="zpl">Play</button></div><div class="readout" id="ro"></div>`;
  let playing = false;
  const T = String.raw`{\color{#D85A30}{\theta_t}} = \theta_{t-1} - \underbrace{{\color{#BA7517}{\alpha}}}_{\text{step size}}\, \underbrace{\frac{{\color{#378ADD}{\hat m_t}}}{\sqrt{{\color{#1D9E75}{\hat v_t}}} + \epsilon}}_{\text{about }\pm 1\text{, any gradient scale}}`;
  const el = holder(fig, T);
  const run = (S, adam) => { let x = -1.5, y = -0.7; const P = [[x, y]], m = [0, 0], v = [0, 0];
    for (let t = 1; t <= 60; t++) { const g = [2 * (x - 1), 2 * S * S * (y - 0.5)];
      if (!adam) { const a = 0.9 / (S * S); x -= a * g[0]; y -= a * g[1]; }
      else { const st = [0, 1].map(k => { m[k] = 0.9 * m[k] + 0.1 * g[k]; v[k] = 0.999 * v[k] + 0.001 * g[k] * g[k]; return 0.05 * (m[k] / (1 - Math.pow(0.9, t))) / (Math.sqrt(v[k] / (1 - Math.pow(0.999, t))) + 1e-8); }); x -= st[0]; y -= st[1]; }
      P.push([x, y]); } return P; };
  const u = (nn) => {
    const n = nn === undefined ? 60 : nn;
    const S = +$("zS").value; $("zSv").textContent = S;
    const X = C3.X(70, 560, -2, 1.6), Y = C3.Y(20, 200, -1, 1), sx = 560 / 3.6, sy = 200 / 2, f = p => (p[0] - 1) ** 2 + S * S * (p[1] - 0.5) ** 2;
    let s = `<defs><clipPath id="vclip"><rect x="70" y="20" width="560" height="200"/></clipPath></defs>` + C3.frame(70, 20, 560, 200, -2, 1.6, -1, 1, [-2, -1, 0, 1], [-1, 0, 0.5, 1], "x", "y");
    s += `<g clip-path="url(#vclip)">`; for (const c of [0.05, 0.3, 1, 3, 7]) s += `<ellipse cx="${X(1)}" cy="${Y(0.5)}" rx="${Math.sqrt(c) * sx}" ry="${Math.sqrt(c) / S * sy}" fill="none" stroke="var(--b)"/>`;
    const G = run(S, false).slice(0, n + 1), A = run(S, true).slice(0, n + 1), path = (P, c) => `<polyline points="${P.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="2"/>` + P.map(p => `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2" fill="${c}"/>`).join("");
    s += path(G, "var(--p)") + path(A, PT) + `</g><circle cx="${X(1)}" cy="${Y(0.5)}" r="4" fill="${PC}"/><circle cx="${X(-1.5)}" cy="${Y(-0.7)}" r="4" fill="var(--t)"/>`;
    s += C3.legend(80, 270, [["gradient descent, α = 0.9/S²", "var(--p)"], ["Adam, α = 0.05", PT]]) + tx(630, 270, `${n} steps each, red dot: minimum`, "end");
    el.innerHTML = svg(280, s);
    $("ro").innerHTML = `<div><span>f after ${n} steps, gradient descent</span><b>${f(G[n]).toExponential(2)}</b></div><div><span>f after ${n} steps, Adam</span><b>${f(A[n]).toExponential(2)}</b></div><div><span>stable descent needs α below</span><b>${(1 / (S * S)).toFixed(4)}</b></div>`;
  };
  const stop = () => { playing = false; stopAnim(); $("zpl").textContent = "Play"; };
  $("zS").oninput = () => { stop(); u(); };
  $("zpl").onclick = () => { if (playing) { stop(); u(); return; } playing = true; $("zpl").textContent = "Pause"; let last = -1; anim(t => { if (!fig.isConnected) { stopAnim(); return; } const n = Math.min(60, Math.floor(t * 8)); if (n === last) return; last = n; u(n); if (n >= 60) stop(); }); };
  u();
}},

/* ---------------- 27. ER and IL ---------------- */
{s: "27. ER and IL", t: String.raw`Extinction ratio and insertion loss: \(\mathrm{ER} = 10\log_{10}(T_{\mathrm{target}}/T_{\mathrm{leak}})\), \(\mathrm{IL} = -10\log_{10}T_{\mathrm{target}}\)`,
intu: String.raw`For each input polarization of the PBS, the transmission into the intended port, \(T_{\mathrm{target}}\), and into the other port, \(T_{\mathrm{leak}}\), are reported together with two numbers in decibels. The insertion loss says how much of the light misses its target port. The extinction ratio says how much stronger the target port is than the wrong one. Set the two transmissions for a TE input. For a TM input the roles of the ports swap.`,
eq: String.raw`\[ \mathrm{ER} = 10\log_{10}\frac{T_\mathrm{target}}{T_\mathrm{leak}}, \qquad \mathrm{IL} = -10\log_{10} T_\mathrm{target} \]<div class="eqref">Ch. 3 Eq. (3.18), used in Lesson 14</div>`,
sym: [[String.raw`\(\mathrm{ER}\)`, "extinction ratio, in dB, larger is better"], [String.raw`\(\mathrm{IL}\)`, "insertion loss, in dB, 0 is lossless"], [String.raw`\(T_{\mathrm{target}}\)`, "transmission into the intended port"], [String.raw`\(T_{\mathrm{leak}}\)`, "transmission into the other port"], [String.raw`\(\log_{10}\)`, "base 10 logarithm, so 10 log10 converts a power ratio to decibels"]],
how: [String.raw`Read it aloud: "ER is ten log of target over leak, IL is minus ten log of the target".`, "Both are power ratios in decibels: 10 dB is a factor 10, 3 dB a factor 2.", "IL of 3 dB means half the light misses the target port. ER of 20 dB means the target port carries 100 times more power than the leak port.", "They are reported for each input polarization, after the optimization. The optimizer itself uses the figure of merit of card 18.", "Used in Lesson 14."],
say: "For each polarization the PBS is reported by its target and leak transmissions, the extinction ratio, ten log of target over leak, and the insertion loss, minus ten log of the target.",
num: String.raw`\(T_{\mathrm{target}} = 0.9\) and \(T_{\mathrm{leak}} = 0.01\) give IL = 0.46 dB and ER = 19.5 dB.`,
r(fig, ctl) {
  ctl.innerHTML = sl("zt", "T_target", 0.3, 1, 0.01, 0.9) + sl("zk", "T_leak", 0.001, 0.2, 0.001, 0.01) + '<div class="readout" id="ro"></div>';
  const T = String.raw`\mathrm{ER} = 10\log_{10}\frac{{\color{#1D9E75}{T_{\mathrm{target}}}}}{{\color{#BA7517}{T_{\mathrm{leak}}}}} \qquad \mathrm{IL} = -10\log_{10}{\color{#1D9E75}{T_{\mathrm{target}}}}`;
  const el = holder(fig, T);
  const u = () => {
    let Tt = +$("zt").value, Tl = +$("zk").value; if (Tl > 1 - Tt) { Tl = Math.max(0.001, 1 - Tt); $("zk").value = Tl; }
    $("ztv").textContent = Tt.toFixed(2); $("zkv").textContent = Tl.toFixed(3);
    const wt = 2 + 18 * Tt, wl = 2 + 18 * Tl;
    let s = `<line x1="30" x2="230" y1="80" y2="80" stroke="${PB}" stroke-width="20" stroke-opacity="0.7"/>` + tx(40, 62, "TE input, power 1", "start");
    s += `<rect x="230" y="50" width="170" height="150" rx="8" fill="var(--purple-bg)" stroke="${PP}"/>` + tx(315, 130, "splitter", "middle", "th");
    s += `<line x1="400" x2="650" y1="80" y2="80" stroke="${PA}" stroke-width="${wl}" stroke-opacity="0.8"/>` + tx(650, 62 - wl / 2, `TM port (leak for TE): T = ${Tl.toFixed(3)}`, "end");
    s += `<line x1="400" x2="650" y1="170" y2="170" stroke="${PT}" stroke-width="${wt}" stroke-opacity="0.8"/>` + tx(650, 152 - wt / 2 + 4, `TE port (target for TE): T = ${Tt.toFixed(2)}`, "end");
    s += tx(30, 226, "line width ∝ power. For a TM input the roles swap: the TM port is the target.", "start");
    el.innerHTML = svg(238, s);
    $("ro").innerHTML = `<div><span>insertion loss IL</span><b>${(-10 * Math.log10(Tt)).toFixed(2)} dB</b></div><div><span>extinction ratio ER</span><b>${(10 * Math.log10(Tt / Tl)).toFixed(1)} dB</b></div><div><span>lost elsewhere</span><b>${Math.max(0, (1 - Tt - Tl) * 100).toFixed(1)} %</b></div>`;
  };
  $("zt").oninput = u; $("zk").oninput = u; u();
}},

/* ---------------- 28. 1 dB bandwidth and operating band ---------------- */
{s: "28. Bandwidth and band", t: String.raw`The 1 dB bandwidth and the operating band`,
intu: String.raw`Two band definitions are used to report results. For a grating coupler the coupling efficiency is reported by its peak value, the wavelength of the peak, its value at 795 nm and its 1 dB bandwidth: the wavelength range over which it stays within 1 dB of the peak, read on a 1 nm grid. Within 1 dB means at least \(10^{-0.1} \approx 0.794\) of the peak. For the PBS the operating band is the wavelength range over which both polarizations reach their intended ports with \(T_{\mathrm{target}} \ge 0.8\). Step through the readings on illustrative spectra, and move the TM curve to see the operating band shrink.`,
eq: String.raw`\[ \text{1 dB bandwidth:} \quad \mathrm{CE}(\lambda) \ge 10^{-0.1}\, \mathrm{CE}_{\mathrm{peak}} \approx 0.794\, \mathrm{CE}_{\mathrm{peak}}, \quad \text{read on a 1 nm grid} \]\[ \text{operating band:} \quad T_{\mathrm{target}}^{\mathrm{TE}}(\lambda) \ge 0.8 \ \text{ and } \ T_{\mathrm{target}}^{\mathrm{TM}}(\lambda) \ge 0.8 \]<div class="eqref">Ch. 3 Sec. 3.7, reported quantities, used in Lesson 14</div>`,
sym: [[String.raw`\(\mathrm{CE}_{\mathrm{peak}}\)`, "largest coupling efficiency over the band, reported with its wavelength"], [String.raw`\(10^{-0.1}\)`, "1 dB below the peak, as a power ratio"], ["1 nm grid", "the spectrum is read at whole nanometers, so the bandwidth is a whole number of nm"], [String.raw`\(T_{\mathrm{target}}\)`, "transmission into the intended port, for each input polarization"]],
how: [String.raw`Find the peak of CE and its wavelength. Also read CE at 795 nm, the design wavelength, which need not be the peak.`, String.raw`1 dB below a power \(P\) is \(P \cdot 10^{-1/10}\), so the line sits at 79.4 % of the peak.`, "Walk the 1 nm grid outward from the peak until CE drops below the line. The range between is the 1 dB bandwidth.", String.raw`For the PBS, mark where \(T_{\mathrm{target}} \ge 0.8\) for TE and for TM. The operating band is the overlap of the two ranges.`, "A taper is reported by its transmission at 795 nm from a separate validation run, not by the objective, which includes the penalty."],
say: "The 1 dB bandwidth is the range where the coupling efficiency stays within 1 dB of its peak, read on a 1 nm grid, and the PBS operating band is where both polarizations reach their ports with at least 0.8.",
num: "The spectra on this card are illustrations, not thesis results. Within 1 dB of a peak of 0.6 means above 0.476.",
r(fig, ctl) {
  ctl.innerHTML = '<div id="z28c"></div>' + sl("zs", "Shift of the TM curve (nm)", -30, 30, 1, 8) + '<div class="readout" id="ro"></div>';
  const caps = ["A grating spectrum (illustration). Find the peak: its value and its wavelength.", "Read the value at the design wavelength, 795 nm. It need not be the peak.",
    "Draw the line 1 dB below the peak: 10^(−0.1) = 0.794 of the peak.", "Walk the 1 nm grid to both sides until CE falls below the line. The range is the 1 dB bandwidth.",
    "PBS: mark where TE reaches the TE port with at least 0.8, and where TM reaches the TM port with at least 0.8.", "The operating band is where both hold at once, the overlap of the two ranges. Move the TM curve to see it change."];
  const ls = range(740, 850, 111), CE = l => 0.6 * Math.exp(-(((l - 801) / 26) ** 2)) * (1 + 0.08 * Math.sin((l - 740) / 9));
  let S;
  const draw = k => {
    const sh = +$("zs").value; $("zsv").textContent = sh;
    let s = "";
    if (k <= 3) {
      const ce = ls.map(CE); let ip = 0; ce.forEach((v, i) => { if (v > ce[ip]) ip = i; });
      const pk = ce[ip], line = pk * Math.pow(10, -0.1), X = C3.X(70, 560, 740, 850), Y = C3.Y(20, 170, 0, 0.7);
      s += C3.frame(70, 20, 560, 170, 740, 850, 0, 0.7, [745, 770, 795, 820, 845], [0, 0.2, 0.4, 0.6], "wavelength (nm)", "CE (illustration)") + plot(70, 20, 560, 170, ls, ce, 740, 850, 0, 0.7, PB, 2.5);
      s += `<circle cx="${X(ls[ip])}" cy="${Y(pk)}" r="6" fill="${PC}"/>` + tx(X(ls[ip]) + 8, Y(pk) - 8, `peak ${pk.toFixed(3)} at ${ls[ip]} nm`, "start");
      if (k >= 1) s += `<line x1="${X(795)}" x2="${X(795)}" y1="20" y2="190" stroke="${PA}" stroke-dasharray="4 3"/><circle cx="${X(795)}" cy="${Y(CE(795))}" r="5" fill="${PA}"/>` + tx(X(795) - 8, Y(line) + 18, `${CE(795).toFixed(3)} at 795 nm`, "end");
      if (k >= 2) s += `<line x1="70" x2="630" y1="${Y(line)}" y2="${Y(line)}" stroke="${PP}" stroke-dasharray="6 4"/>` + tx(626, Y(line) - 6, "1 dB below the peak", "end");
      if (k >= 3) { let a = ip, b = ip; while (a > 0 && ce[a - 1] >= line) a--; while (b < ce.length - 1 && ce[b + 1] >= line) b++;
        for (let i = a; i <= b; i++) s += `<line x1="${X(ls[i])}" x2="${X(ls[i])}" y1="${Y(0)}" y2="${Y(ce[i])}" stroke="${PT}" stroke-width="1.5" opacity="0.6"/>`;
        s += arrow(X(ls[a]), 244, X(ls[b]), 244, PT, 2, null, true) + tx((X(ls[a]) + X(ls[b])) / 2, 262, `1 dB bandwidth: ${ls[a]} to ${ls[b]} nm, ${ls[b] - ls[a]} nm`, "middle");
        $("ro").innerHTML = `<div><span>peak / at 795 nm</span><b>${pk.toFixed(3)} / ${CE(795).toFixed(3)}</b></div><div><span>1 dB bandwidth</span><b>${ls[b] - ls[a]} nm</b></div>`; }
      else $("ro").innerHTML = `<div><span>peak</span><b>${pk.toFixed(3)} at ${ls[ip]} nm</b></div><div><span>at 795 nm</span><b>${k >= 1 ? CE(795).toFixed(3) : "next step"}</b></div>`;
    } else {
      const lp = range(735, 835, 101), TE = l => 0.93 * Math.exp(-(((l - 790) / 38) ** 4)), TM = l => 0.9 * Math.exp(-(((l - 795 - sh) / 33) ** 4));
      const X = C3.X(70, 560, 735, 835), Y = C3.Y(20, 170, 0, 1);
      s += C3.frame(70, 20, 560, 170, 735, 835, 0, 1, [735, 760, 785, 810, 835], [0, 0.4, 0.8, 1], "wavelength (nm)", "T_target (illustration)");
      s += `<line x1="70" x2="630" y1="${Y(0.8)}" y2="${Y(0.8)}" stroke="${PP}" stroke-dasharray="6 4"/>` + tx(76, Y(0.8) - 6, "0.8", "start");
      s += plot(70, 20, 560, 170, lp, lp.map(TE), 735, 835, 0, 1, PB, 2.5) + plot(70, 20, 560, 170, lp, lp.map(TM), 735, 835, 0, 1, PC, 2.5);
      const okTE = lp.filter(l => TE(l) >= 0.8), okTM = lp.filter(l => TM(l) >= 0.8), both = lp.filter(l => TE(l) >= 0.8 && TM(l) >= 0.8);
      const seg = (arr, y, c, lab) => arr.length ? arrow(X(arr[0]), y, X(arr[arr.length - 1]), y, c, 2, null, true) + tx(X(arr[arr.length - 1]) + 6, y + 4, lab, "start") : "";
      s += seg(okTE, 236, PB, "TE ≥ 0.8") + seg(okTM, 252, PC, "TM ≥ 0.8");
      if (k === 5 && both.length) s += `<rect x="${X(both[0])}" y="20" width="${X(both[both.length - 1]) - X(both[0])}" height="170" fill="${PT}" opacity="0.15"/>` + seg(both, 268, PT, "operating band");
      $("ro").innerHTML = `<div><span>TE ≥ 0.8</span><b>${okTE.length ? okTE[0] + " to " + okTE[okTE.length - 1] + " nm" : "none"}</b></div><div><span>TM ≥ 0.8</span><b>${okTM.length ? okTM[0] + " to " + okTM[okTM.length - 1] + " nm" : "none"}</b></div><div><span>operating band</span><b>${k === 5 ? (both.length ? (both[both.length - 1] - both[0]) + " nm" : "none") : "next step"}</b></div>`;
    }
    el.innerHTML = svg(278, s);
  };
  const el = holder(fig, String.raw`\underbrace{\mathrm{CE} \ge 10^{-0.1}\,\mathrm{CE}_{\mathrm{peak}}}_{\text{1 dB bandwidth}} \qquad \underbrace{T^{\mathrm{TE}}_{\mathrm{target}} \ge 0.8 \ \text{and}\ T^{\mathrm{TM}}_{\mathrm{target}} \ge 0.8}_{\text{operating band}}`);
  S = steps(fig, $("z28c"), caps, draw, { dwell: 3.2 });
  $("zs").oninput = () => S.redraw();
}},

/* ---------------- 29. Full loop, step by step ---------------- */
{s: "29. The full loop", t: String.raw`The full loop: from pixels to gradient and back`,
intu: String.raw`Everything in the chapter fits in one cycle. Raw densities are filtered and projected, turned into a permittivity, and simulated to get the objective. One adjoint simulation, with its source set by the derivative of the objective, gives the sensitivity map. The chain rule carries that map back through the interpolation, projection and filter to every raw density, and Adam takes a step. \(\beta\) rises in stages while this repeats, and the erosion and dilation penalty joins the objective as the design becomes binary. After the last level the design is thresholded, turned into one polygon, checked, repaired and optimized again as an outline. Step through one turn of the loop, or press Play.`,
eq: String.raw`\[ \rho \to \tilde\rho \to \hat\rho \to \varepsilon \to A \mathbf{x} = \mathbf{b} \to J \]\[ \to A^{T} \mathbf{y} = \left(\frac{\partial J}{\partial \mathbf{x}}\right)^{T} \to \frac{\partial J}{\partial \rho} \to \text{Adam} \to \rho \]<div class="eqref">Ch. 3 Fig. 3.1, used in Lesson 15</div>`,
sym: [[String.raw`\(\rho,\ \tilde\rho,\ \hat\rho\)`, "raw, filtered and projected densities (cards 11, 12 and 14)"], [String.raw`\(\varepsilon\)`, "permittivity from the interpolation (card 14)"], [String.raw`\(A\mathbf{x} = \mathbf{b}\)`, "forward simulation (card 2)"], [String.raw`\(J\)`, "objective (card 1)"], [String.raw`\(A^{T}\mathbf{y} = (\partial J/\partial \mathbf{x})^{T}\)`, "adjoint simulation (card 4)"], [String.raw`\(\partial J/\partial \rho\)`, "gradient with respect to the raw densities"], [String.raw`\(\to\)`, '"feeds into"']],
how: [String.raw`Read it aloud: "rho goes to rho tilde, to rho hat, to epsilon, to the forward simulation and \(J\), then to the adjoint simulation, to the gradient with respect to rho, and to Adam".`, String.raw`The forward half runs the physics. The backward half multiplies the slopes of each step in reverse order (cards 8, 11 and 13).`, String.raw`For the PBS each turn has two inputs, so two forward and two adjoint simulations.`, String.raw`The stages of the PBS: topology with \(\beta\) from 1 to 100 and \(P_{\mathrm{ED}}\), threshold at 0.5, one polygon, check and repair, then outline optimization with boundary vertices and \(P_{\kappa}\), checked and repaired every five steps.`, String.raw`Used in Lesson 15, cards 1, 4 and 5.`],
say: "Each iteration runs the densities through filter, projection and interpolation into a forward simulation, gets the gradient from one adjoint simulation and the chain rule, and lets Adam update the pixels.",
num: String.raw`The PBS topology stage: 48 400 pixels, 77 steps, and in each step two forward and two adjoint 3D simulations.`,
r(fig, ctl) {
  const T = String.raw`\begin{gathered} {\color{#378ADD}{\rho}} \xrightarrow{\text{filter}} \tilde\rho \xrightarrow{\text{project}} \hat\rho \xrightarrow{\text{interpolate}} \varepsilon \to \underbrace{A\mathbf{x} = \mathbf{b}}_{\text{forward run}} \to {\color{#D85A30}{J}} \\ \to \underbrace{A^{T}\mathbf{y} = \left(\frac{\partial J}{\partial \mathbf{x}}\right)^{T}}_{\text{adjoint run}} \to \underbrace{{\color{#1D9E75}{\frac{\partial J}{\partial \rho}}}}_{\text{chain rule}} \xrightarrow{\text{Adam}} {\color{#378ADD}{\rho}} \end{gathered}`;
  const el = holder(fig, T);
  const B = [[20, 30, 60, 36, "ρ"], [120, 30, 60, 36, "ρ̃"], [220, 30, 60, 36, "ρ̂"], [320, 30, 60, 36, "ε"], [420, 30, 110, 36, "A x = b"], [580, 30, 70, 36, "J"], [430, 130, 220, 36, "Aᵀy = (∂J/∂x)ᵀ"], [250, 130, 120, 36, "∂J/∂ε"], [90, 130, 100, 36, "∂J/∂ρ"], [0, 200, 90, 30, "Adam"]];
  const caps = ["Start from the raw densities ρ, one per pixel, between 0 and 1.", "Filter with the conic kernel of radius R: ρ̃ (Eq. 3.8).", "Project with sharpness β and threshold 0.5: ρ̂ (Eq. 3.9).", "Interpolate the permittivity between air and GaAs: ε (Eq. 3.10).",
    "Forward run: solve Maxwell's equations, A x = b, and store E_fwd.", "Objective: project onto the output mode and weight over the band: J (Eqs. 3.12 to 3.14), minus the penalties.",
    "Adjoint run: the same mode sent back from the monitor, amplitude ∂J/∂a_m. Solve Aᵀ y = (∂J/∂x)ᵀ and store E_adj.", "Sensitivity map: Re Σ_f E_fwd · E_adj at every point (Eq. 3.5).",
    "Chain rule back through interpolation, projection and filter: ∂J/∂ρ for every pixel.", "Adam turns the gradient into a step, and the loop starts again. Every 7 steps β rises one level."];
  const arrows = [[80, 48, 118, 48], [180, 48, 218, 48], [280, 48, 318, 48], [380, 48, 418, 48], [530, 48, 578, 48], [615, 66, 615, 128], [428, 148, 372, 148], [248, 148, 192, 148], [110, 166, 70, 198], [30, 198, 40, 68]];
  steps(fig, ctl, caps, (k, t) => {
    let s = "";
    B.forEach(([x, y, w, h, lab], i) => { const on = i === k, done = i < k; s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${on ? "var(--coral-bg)" : "var(--sunk)"}" stroke="${on ? PC : done ? PT : "var(--b)"}" stroke-width="${on ? 2.5 : 1.5}"/>` + tx(x + w / 2, y + h / 2 + 5, lab, "middle", "t"); });
    arrows.forEach(([x1, y1, x2, y2], i) => { const on = i < k || (i === 9 && k === 9); s += arrow(x1, y1, x2, y2, on ? PT : "var(--b)", on ? 2 : 1.2); });
    if (k >= 1) { const i = Math.min(k, 9) - 1, [x1, y1, x2, y2] = arrows[i], f = (t * 0.8) % 1; s += `<circle cx="${(x1 + (x2 - x1) * f).toFixed(1)}" cy="${(y1 + (y2 - y1) * f).toFixed(1)}" r="5" fill="${PC}"/>`; }
    s += tx(100, 24, "filter", "middle") + tx(200, 24, "project", "middle") + tx(300, 24, "interpolate", "middle") + tx(475, 24, "forward run", "middle") + tx(555, 24, "overlap", "middle");
    s += tx(608, 104, "adjoint source", "end") + tx(540, 186, "adjoint run", "middle") + tx(400, 186, "field × field", "middle") + tx(220, 186, "back through", "middle") + tx(220, 200, "interpolate, project, filter", "middle") + tx(110, 222, "step, then β rises in stages", "start");
    el.innerHTML = svg(240, s);
  }, { cont: true, dwell: 2.6 });
}}

],
summary: String.raw`Each card of this lesson takes one equation of Chapter 3 and reads it in words, part by part, in the order of the thesis. Together they tell the story of the chapter: an objective with penalties (3.1), a gradient from one forward and one adjoint simulation (3.2 to 3.5), geometries kept inside their bounds by tanh maps (3.6, 3.7, 3.11), a density chain of conic filter, projection with \(\beta\) from 1 to 100 and linear interpolation (3.8 to 3.10), mode overlaps and band weights for the objectives (3.12 to 3.14), the erosion and dilation and curvature penalties (3.15, 3.16), a design rule check with repair (3.17), the grid and Adam, and the extinction ratio and insertion loss (3.18) with the 1 dB bandwidth and the operating band. Use it as a dictionary for the symbols in Lessons 1 to 15.`,
sheet: [
[String.raw`\[ \max_{\mathbf{p}}\; J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]`, "Design problem, Ch. 3 Eq. (3.1) (Lesson 1)"],
[String.raw`\[ A(\mathbf{p})\,\mathbf{x} = \mathbf{b} \]`, "Discretized Maxwell, Ch. 3 Eq. (3.2) (Lesson 2)"],
[String.raw`\[ \frac{\partial \mathbf{x}}{\partial p_i} = -A^{-1} \frac{\partial A}{\partial p_i}\mathbf{x} \]`, "Direct route, one solve per parameter, Michaels Eqs. (8) and (9) (Lesson 2)"],
[String.raw`\[ A^{T}\,\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T} \]`, "Adjoint system, Ch. 3 Eq. (3.3) (Lesson 2)"],
[String.raw`\[ \frac{\partial F}{\partial p_i} = -2\,\mathrm{Re}\left\{ \mathbf{y}^{T}\,\frac{\partial A}{\partial p_i}\,\mathbf{x}\right\} \]`, "Gradient from two fields, Ch. 3 Eq. (3.4) (Lesson 2)"],
[String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \mathrm{Re} \sum_{f} \mathbf{E}_\mathrm{fwd}(\mathbf{r}, f) \cdot \mathbf{E}_\mathrm{adj}(\mathbf{r}, f) \]`, "Pixel sensitivity, Ch. 3 Eq. (3.5) (Lesson 3)"],
[String.raw`\[ \text{boundary: overlap of } \mathbf{E}_{\parallel} \text{ and } D_{\perp} \text{ on the surface} \]`, "Boundary-defined structures, Sec. 3.2 in words (Lesson 3)"],
[String.raw`\[ \frac{\partial J}{\partial \mathbf{p}} = \sum_{\mathbf{r}} \frac{\partial J}{\partial \varepsilon(\mathbf{r})} \frac{\partial \varepsilon(\mathbf{r})}{\partial \mathbf{p}} - \sum_k w_k \frac{\partial P_k}{\partial \mathbf{p}} \]`, "Chain rule done by autograd (Lesson 3)"],
[String.raw`\[ w(p_i) = \tfrac12\,(w_\mathrm{max} - w_\mathrm{min})\tanh p_i + \tfrac12\,(w_\mathrm{max} + w_\mathrm{min}) \]`, "Grating widths, 80 nm to 1 µm, Ch. 3 Eq. (3.6) (Lesson 4)"],
[String.raw`\[ d_i = d_i^{\mathrm{QW}}\left(1 + \tfrac12\tanh p_i\right), \qquad y_i = \frac{w_\mathrm{in}}{2} + \frac{w_\mathrm{out} - w_\mathrm{in}}{2} \cdot \frac{\tanh(\pi p_i) + 1}{2} \]`, "DBR scale and taper half-widths, Ch. 3 Eq. (3.7) (Lesson 4)"],
[String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]`, "Conic filter, R = 120 nm, Ch. 3 Eq. (3.8) (Lesson 5)"],
[String.raw`\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)} \]`, "Projection, η = 0.5, Ch. 3 Eq. (3.9) (Lesson 6)"],
[String.raw`\[ \beta_k = 100^{\,k/10}, \qquad k = 0, \dots, 10, \qquad 7 \text{ steps per level} \]`, "Projection continuation, then threshold at 0.5, Sec. 3.5 (Lesson 6)"],
[String.raw`\[ \varepsilon = \varepsilon_\mathrm{air} + \hat\rho\,(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}) \]`, "Linear interpolation, Ch. 3 Eq. (3.10) (Lesson 5)"],
[String.raw`\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_\mathrm{max}\tanh(p_i)\,\hat{\mathbf{n}}_i \]`, "Boundary vertices, 15 nm, Ch. 3 Eq. (3.11) (Lesson 4)"],
[String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]`, "Mode overlap, unit-power modes, 1 W sources, Ch. 3 Eq. (3.12) (Lesson 7)"],
[String.raw`\[ \bar T = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\big[-(\lambda_i-\lambda_0)^2/(2\sigma^2)\big]}{\sum_j \exp\!\big[-(\lambda_j-\lambda_0)^2/(2\sigma^2)\big]} \]`, "Band weights, Ch. 3 Eq. (3.13) (Lesson 7)"],
[String.raw`\[ \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_i) \]`, "PBS figure of merit, maximum 2, Ch. 3 Eq. (3.14) (Lesson 7)"],
[String.raw`\[ P_\mathrm{ED} = \frac{1}{\sqrt{N_p}}\, \big\lVert\, \mathcal{C}(\hat{\boldsymbol\rho}) - \mathcal{O}(\hat{\boldsymbol\rho}) \,\big\rVert_2, \qquad J = \mathrm{FOM} - \min\!\left(1,\,\frac{\beta}{25}\right) P_\mathrm{ED} \]`, "Erosion and dilation penalty, Ch. 3 Eq. (3.15) (Lesson 9)"],
[String.raw`\[ \mathrm{open}_r = \mathrm{dilate}_r \circ \mathrm{erode}_r, \qquad \mathrm{close}_r = \mathrm{erode}_r \circ \mathrm{dilate}_r \]`, "Opening and closing (Lesson 8)"],
[String.raw`\[ P_\kappa = \frac{1}{N_v} \sum_{i} \frac{e^{-\kappa (r_i - r_\mathrm{min})}}{1 + e^{-\kappa (r_i - r_\mathrm{min})}}, \qquad J = F - w_\kappa P_\kappa \]`, "Curvature penalty, Ch. 3 Eq. (3.16), Michaels Eqs. (34), (17) and (35) (Lesson 10)"],
[String.raw`\[ \mathrm{area}\big(X \setminus \mathrm{open}_r(X)\big) = 0, \qquad \mathrm{area}\big(\mathrm{close}_r(X) \setminus X\big) = 0, \qquad r = 59\ \mathrm{nm} \]`, "Morphological check, three rules of 120 nm (Lesson 11)"],
[String.raw`\[ X_\mathrm{healed} = \mathrm{open}_r\big(\mathrm{close}_r(X)\big), \qquad r = 63\ \mathrm{nm} \]`, "Repair, Ch. 3 Eq. (3.17) (Lesson 11)"],
[String.raw`\[ \Delta = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \]`, "Grid cell, 20 steps in 3D, 30 in 2D, Sec. 3.6 (Lesson 12)"],
[String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t, \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2, \qquad \hat m_t = \frac{m_t}{1 - \beta_1^t}, \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]`, "Adam moments, decay rates 0.9 and 0.999 (Lesson 13)"],
[String.raw`\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]`, "Adam update, + for maximizing J (Lesson 13)"],
[String.raw`\[ \mathrm{ER} = 10\log_{10}\frac{T_\mathrm{target}}{T_\mathrm{leak}}, \qquad \mathrm{IL} = -10\log_{10} T_\mathrm{target} \]`, "Extinction ratio and insertion loss, Ch. 3 Eq. (3.18) (Lesson 14)"],
[String.raw`\[ \mathrm{CE} \ge 10^{-0.1}\,\mathrm{CE}_{\mathrm{peak}}, \qquad T^{\mathrm{TE}}_{\mathrm{target}},\ T^{\mathrm{TM}}_{\mathrm{target}} \ge 0.8 \]`, "1 dB bandwidth on a 1 nm grid, and the PBS operating band, Sec. 3.7 (Lesson 14)"],
[String.raw`\[ \rho \to \tilde\rho \to \hat\rho \to \varepsilon \to A\mathbf{x} = \mathbf{b} \to J \to A^{T}\mathbf{y} = \left(\frac{\partial J}{\partial \mathbf{x}}\right)^{T} \to \frac{\partial J}{\partial \rho} \to \text{Adam} \]`, "The full loop (Lesson 15)"]],
consts: String.raw`\(\varepsilon_{\mathrm{air}} = 1\), \(\varepsilon_{\mathrm{GaAs}} = 12.19\). 1D demos: grid step 10 nm, 60 design pixels between air and GaAs, solved live with the adjoint method of Lesson 2. Thesis method settings shown: 80 nm to 1 µm grating widths, 14 DBR pairs, M = 81, R = 120 nm on 11.38 nm pixels, β from 1 to 100 in 11 levels of 7 steps, 395 vertices with 15 nm moves, check radius 59 nm, repair radius 63 nm, 20 and 30 steps per wavelength, Adam decay rates 0.9 and 0.999. The curves in cards 1, 16 and 28 are illustrations, not simulations.`,
sources: ["The sources of Lessons 1 to 15 of this chapter", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (3), (8), (9), (11), (12), (17), (34), (35) (adjoint method in matrix form, curvature penalty)", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eqs. (5), (8), (9) and Sec. 2 (pixel overlap, adjoint source amplitude, boundary components)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eqs. (9), (18), (19) (interpolation, projection, continuation)", "Hammond et al., Opt. Express 29, 23916 (2021) (design rules inside the optimization, differentiable morphology)", "Kingma and Ba, Adam: A method for stochastic optimization, ICLR 2015, arXiv:1412.6980 (Algorithm 1)", "Flexcompute, Tidy3D 2.11.2: adjoint field derivatives, mode overlap and source normalization, conic filter, tanh projection, ErosionDilationPenalty, curvature penalty, grid specification", "KLayout (width and space checks) and Shapely (opening and closing), as used by the thesis code", "optax library documentation (adam defaults)", "Felzenszwalb and Huttenlocher, Theory of Computing 8, 415 (2012) (distance transform used for the binary morphology in cards 20 and 23)"]
});
})();
