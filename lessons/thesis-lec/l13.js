addLesson("thesis", "lec", {
level: "Update", num: "Lesson 13",
id: "thesis-lec-l13", title: "Adam and the full loop", short: "13. Adam and the loop",
big: String.raw`With the gradient in hand, Adam moves every pixel density a little uphill. Adam keeps a running average of each pixel's gradient and of its size, so pixels with tiny or noisy slopes still move at a sensible rate. Then the loop starts again: new densities, new permittivity, new forward runs, new figure of merit, new adjoint runs, new gradient. For the PBS this repeats 77 times while the projection sharpness rises from 1 to 100, so the grey start ends as an almost binary GaAs pattern.`,
bridge: "Thesis Ch. 3 Sec. 3.5 (projection continuation: β from 1 to 100 in 11 levels of 7 steps) and Sec. 3.6 (Adam through optax, decay rates 0.9 and 0.999). After this topology stage the PBS goes on to the design rule check and the outline optimization (Ch. 4), not covered here.",
cards: [
{s: "1. Adam", t: "Each parameter gets a step of sensible size",
intu: String.raw`Two parameters, one very steep direction and one very flat one. The goal is the centre. Plain gradient ascent must use a small step to stay stable in the steep direction, so it crawls along the flat one. Adam divides each parameter's averaged gradient by its own typical size, so both move at a similar rate. That suits a design where some pixels matter a lot and others very little.`,
eq: String.raw`\[ m \leftarrow \beta_1 m + (1-\beta_1)\,g, \qquad v \leftarrow \beta_2 v + (1-\beta_2)\,g^2 \]\[ \rho \leftarrow \rho + \alpha\,\frac{\hat m}{\sqrt{\hat v} + \epsilon} \]`,
sym: [[String.raw`\(g\)`, "gradient of this parameter"], [String.raw`\(m, v\)`, "running averages of g and of g²"], [String.raw`\(\hat m, \hat v\)`, "the same, corrected for the start at zero"], [String.raw`\(\alpha\)`, "learning rate (0.02 in the PBS topology stage)"]],
how: ["Average the gradient over recent steps (momentum).", "Average its square: the typical size.", "Step = average divided by typical size, times the learning rate.", "Plus sign: we maximize the figure of merit."],
say: "Adam moves each pixel by its averaged gradient divided by the typical size of that gradient, so all pixels move at a sensible rate whatever their sensitivity.",
num: String.raw`\(\beta_1 = 0.9\), \(\beta_2 = 0.999\) (optax defaults). Densities are clipped to stay between 0 and 1.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="go">Run 40 steps</button></div>`;
  const J = (x, y) => -(40 * x * x + 0.4 * y * y), G = (x, y) => [-80 * x, -0.8 * y];
  const draw = (k) => {
    const X = C3.X(60, 560, -1.2, 1.2), Y = C3.Y(20, 200, -1.2, 1.2);
    let s = `<rect x="60" y="20" width="560" height="200" fill="none" stroke="var(--b)"/>`;
    for (const c of [0.05, 0.2, 0.45, 0.8]) s += `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${X(Math.sqrt(c / 40)) - X(0)}" ry="${Y(0) - Y(Math.sqrt(c / 0.4))}" fill="none" stroke="var(--b)"/>`;
    const path = (adam, col) => {
      let x = 1, y = -1, m = [0, 0], v = [0, 0], d = `M ${X(x)} ${Y(y)}`;
      for (let t = 1; t <= k; t++) { const g = G(x, y); if (adam) { for (let i = 0; i < 2; i++) { m[i] = 0.9 * m[i] + 0.1 * g[i]; v[i] = 0.999 * v[i] + 0.001 * g[i] * g[i]; } const st = [0, 1].map(i => 0.06 * (m[i] / (1 - 0.9 ** t)) / (Math.sqrt(v[i] / (1 - 0.999 ** t)) + 1e-8)); x += st[0]; y += st[1]; } else { x += 0.012 * g[0]; y += 0.012 * g[1]; } d += ` L ${X(x)} ${Y(y)}`; }
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.4"/><circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="${col}"/>`;
    };
    s += path(false, "var(--blue)") + path(true, "var(--coral)") + `<circle cx="${X(0)}" cy="${Y(0)}" r="5" fill="var(--teal)"/><text class="ts" x="${X(0) + 8}" y="${Y(0) - 8}">best</text>`;
    s += C3.legend(80, 246, [["plain gradient ascent", "var(--blue)"], ["Adam", "var(--coral)"]]) + `<text class="ts" x="620" y="246" text-anchor="end">step ${k}</text>`;
    fig.innerHTML = svg(258, s);
  };
  $("go").onclick = () => { let k = 0; anim(() => { k = Math.min(40, k + 0.25); draw(Math.floor(k)); if (k >= 40) stopAnim(); }); };
  draw(40);
}},
{s: "2. Run the loop", t: "The whole procedure, live, on the toy splitter",
intu: String.raw`This runs the full inverse design loop on the 2D toy splitter: forward run, figure of merit, adjoint run, gradient, Adam update. Each step takes two simulations in your browser. The target is the upper port only. Start from the Y-splitter (0.9 in the arms, 0.1 elsewhere, like the PBS start) and press Run. Watch the design change and the transmission into the upper port rise from about one half, the even split of a Y, toward 1.`,
eq: String.raw`\[ \rho^{(k)} \xrightarrow{\text{forward}} J \xrightarrow{\text{adjoint}} \frac{\partial J}{\partial \rho} \xrightarrow{\text{Adam}} \rho^{(k+1)} \]`,
sym: [["toy", "2D, one polarization, one target port, no filter or projection"], ["learning rate", "0.05 here"]],
how: ["Forward run: transmission into the upper port.", "Adjoint run from the upper port.", "Gradient on every pixel.", "Adam step, densities clipped to 0 to 1. Repeat."],
say: "Each optimization step runs the forward simulation, measures the figure of merit, runs the adjoint, forms the gradient and lets Adam update the densities, and repeating this improves the design.",
num: "Each toy step: 2 runs of 1200 time steps on 16,000 cells. A real PBS step: 4 runs in 3D.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="r1">Run 1 step</button><button id="r8">Run 8 steps</button><button id="rr">Reset</button></div><div class="readout" id="ro"></div>`;
  fig.innerHTML = `<div style="display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start"><div><p class="note" style="margin:0">design densities</p><div id="dm"></div></div><div id="hp"></div></div>`;
  let T, rho, m, v, k, hist, busy = false;
  const reset = () => { T = LC.toy(); rho = LC.toyStart(T).map(x => x * 0.8 + 0.1); LC.toyApply(T, rho); m = new Float32Array(rho.length); v = new Float32Array(rho.length); k = 0; hist = []; draw(); };
  const draw = () => {
    if (!$("dm")) return;
    const show = Float32Array.from(rho, x => x * 2 - 1); LC.map($("dm"), T.W, T.H, show.map(x => (x + 1) / 2), "abs", 4);
    const n = Math.max(8, hist.length);
    let s = C3.frame(50, 15, 300, 170, 0, n, 0, 1, [0, n], [0, 0.5, 1], "step", "T upper port") + (hist.length ? plot(50, 15, 300, 170, hist.map((_, i) => i), hist, 0, n, 0, 1, "var(--coral)", 2.2) : "");
    hist.forEach((h, i) => { s += `<circle cx="${50 + i / n * 300}" cy="${15 + 170 * (1 - h)}" r="3.5" fill="var(--coral)"/>`; });
    $("hp").innerHTML = `<svg width="380" viewBox="0 0 380 220" role="img">${s}</svg>`;
    $("ro").innerHTML = `<div><span>steps done</span><b>${k}</b></div><div><span>transmission to the upper port</span><b>${hist.length ? hist[hist.length - 1].toFixed(3) : "press Run"}</b></div><div><span>simulations so far</span><b>${2 * k}</b></div>`;
  };
  const one = () => { k++; const r = LC.toyGrad(T); hist.push(r.F); for (let i = 0; i < rho.length; i++) { const g = r.g[i]; m[i] = 0.9 * m[i] + 0.1 * g; v[i] = 0.999 * v[i] + 0.001 * g * g; rho[i] = Math.min(1, Math.max(0, rho[i] + 0.05 * (m[i] / (1 - 0.9 ** k)) / (Math.sqrt(v[i] / (1 - 0.999 ** k)) + 1e-8))); } LC.toyApply(T, rho); draw(); };
  const many = n => { if (busy) return; busy = true; let left = n; const tick = () => { if (!fig.isConnected) { busy = false; return; } one(); left--; if (left > 0) setTimeout(tick, 20); else busy = false; }; setTimeout(tick, 20); };
  $("r1").onclick = () => many(1); $("r8").onclick = () => many(8); $("rr").onclick = () => { if (!busy) reset(); };
  reset();
}},
{s: "3. The PBS loop", t: "77 steps while the design turns binary",
intu: String.raw`Step through one round of the real PBS topology optimization. Each step: two forward runs (TE and TM input), the figure of merit, two adjoint runs, the gradient through the chain rule, the fabrication penalty gradient, and an Adam step. Every 7 steps the projection sharpness \(\beta\) is raised, from 1 to 100 in 11 levels, so the grey densities are pushed toward air or GaAs while the optimizer still has room to move. After 77 steps the design is thresholded at 0.5 and handed to the design rule check.`,
eq: String.raw`\[ J = \mathrm{FOM} - \min\!\left(1, \frac{\beta}{25}\right) P_\mathrm{ED}, \qquad \beta: 1 \rightarrow 100 \text{ in 11 levels} \times 7 \text{ steps} \]<div class="eqref">Ch. 3 Eq. (3.15) and Sec. 3.5</div>`,
sym: [[String.raw`\(P_\mathrm{ED}\)`, "erosion and dilation penalty: discourages features smaller than 120 nm"], [String.raw`\(\beta\)`, "projection sharpness, raised every 7 steps"]],
how: ["Forward TE and TM runs: figure of merit.", "Adjoint TE and TM runs: gradient.", "Add the penalty gradient (no simulation needed).", "Adam step on the 48,400 densities.", "Every 7 steps raise β. After 77 steps threshold at 0.5."],
say: String.raw`The PBS topology stage repeats forward runs, adjoint runs, the gradient and an Adam step 77 times while \(\beta\) rises from 1 to 100, ending in a nearly binary design that then goes to the design rule check.`,
num: "77 steps × 4 runs = 308 FDTD runs for the topology stage, against about 15 million by finite differences.",
r(fig, ctl) {
  const B = [["forward TE + TM", "2 runs", "teal"], ["FOM", "Σ w T_TE + Σ w T_TM", "teal"], ["adjoint TE + TM", "2 runs", "purple"], ["gradient", "chain rule + penalty", "purple"], ["Adam step", "48,400 densities", "coral"], ["raise β", "every 7 steps", "gray"]];
  const cap = ["Two forward runs, one per input polarization.", "The figure of merit from the two port monitors, over 101 wavelengths.", "Two adjoint runs, sources at the TE and TM ports.", "Field products summed, chain rule to the densities, penalty gradient added.", "Adam moves every density a little uphill.", "Every 7 steps β goes up one level. 11 levels, 77 steps, then threshold at 0.5."];
  LC.steps(ctl, 6, k => {
    const P = [[20, 20], [250, 20], [480, 20], [480, 140], [250, 140], [20, 140]]; let s = "";
    B.forEach((b, i) => s += LC.box(P[i][0], P[i][1], 180, 62, [b[0], b[1]], b[2], i > k));
    s += arrow(200, 51, 248, 51, "var(--p)", 1.5) + arrow(430, 51, 478, 51, "var(--p)", 1.5) + arrow(570, 84, 570, 138, "var(--p)", 1.5) + arrow(478, 171, 432, 171, "var(--p)", 1.5) + arrow(248, 171, 202, 171, "var(--p)", 1.5) + `<path d="M 60 138 L 60 84" stroke="var(--coral)" stroke-width="2" marker-end="url(#ar)"/>`;
    s += `<text class="ts" x="340" y="232" text-anchor="middle">step ${Math.min(77, 1 + k * 13)} of 77, β level ${Math.min(11, 1 + Math.floor(k * 2))}</text>`;
    fig.innerHTML = svg(245, s);
    return cap[k];
  });
}}
],
summary: String.raw`Adam moves each density by its averaged gradient divided by the gradient's typical size, so all pixels move at a sensible rate. Then the loop repeats: forward runs, figure of merit, adjoint runs, gradient, Adam step. For the PBS this runs 77 times, 4 FDTD runs each, while \(\beta\) rises from 1 to 100, ending in a nearly binary GaAs pattern that goes to the design rule check. The live toy shows the same loop raising the transmission from an even split toward 1.`,
sheet: [
[String.raw`\[ \rho \leftarrow \rho + \alpha\,\frac{\hat m}{\sqrt{\hat v} + \epsilon} \]`, "Adam update (maximizing)"],
[String.raw`\[ J = \mathrm{FOM} - \min(1, \beta/25)\,P_\mathrm{ED} \]`, "PBS topology objective (Ch. 3 Eq. 3.15)"],
[String.raw`\[ 77 \times 4 = 308 \text{ runs} \]`, "Cost of the PBS topology stage"]],
consts: "Adam: β1 = 0.9, β2 = 0.999. PBS topology learning rate 0.02. Toy learning rate 0.05.",
sources: ["Kingma and Ba, ICLR (2015), Alg. 1 (Adam)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021) (projection continuation)", "Ch. 3 Sec. 3.5 and 3.6 and Ch. 4 Sec. 4.2 of the thesis"]
});
