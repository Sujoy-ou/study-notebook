const C3R = { last: null, make: o => new C3.Opt1D(Object.assign({ eMin: 9, Nd: 150, levels: 8, per: 10, betaMax: 64 }, o)) };
C3R.finish = function (opt) { const fin = opt.evaluate(opt.rho, false), bin = fin.rhoHat.map(v => v > 0.5 ? 1 : 0); const B = opt.bands(); let F = 0; for (const [l, w] of B.pass) F += w * opt.dev.T(bin, l).T; for (const [l, w] of B.block) F += w * (1 - opt.dev.T(bin, l).T); return { bin, F }; };
addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l13", title: "Putting it together: a full inverse design run", short: "13. Full run and quiz",
big: "Every piece of this chapter now runs together in your browser on a 1D problem: a stack of 150 pixels, each between AlGaAs and GaAs, lit from one side. Densities are filtered and projected with β continuation, the permittivity follows by linear interpolation, a frequency-domain solver gives the transmission at several wavelengths, the adjoint solve gives the gradient for all pixels, the chain rule carries it back through projection and filter, and Adam takes the step. Ask for a mirror and the optimizer rediscovers the quarter-wave Bragg stack of Chapter 2. The same loop, with 3D FDTD in place of the 1D solver and a design rule check at the end, is how the thesis devices are designed. The lesson closes with the full stage sequence of a free-topology device and a quiz.",
bridge: "Methods from all of Ch. 3: Eqs. (3.1) to (3.4) for the loop and gradient, (3.9) to (3.11) for the density chain, (3.14) for band weights, (3.16) for the erosion and dilation penalty, the projection continuation and Adam of Secs. 3.5 and 3.6, and the stage sequence of Fig. 3.1(b). The quarter-wave comparison links to Chapter 2, Lesson 6. Everything is a toy model chosen to run in a fraction of a second.",
cards: [
{s: "1. The toy problem", t: "A 1D stack designed pixel by pixel",
intu: "The design region is 1.5 µm long, 150 pixels of 10 nm, embedded in AlGaAs. Each pixel can be AlGaAs (ρ = 0, ε = 9) or GaAs (ρ = 1, ε = 12.19). A source on the left launches light, a probe on the right measures the transmission. Two goals are available. Mirror: reflect a band around 800 nm, J = Σw<sub>i</sub>[1 − T(λ<sub>i</sub>)]. Dichroic: pass a band around 1000 nm and reflect one around 700 nm, J = Σw<sub>i</sub>T(pass) + Σw<sub>i</sub>[1 − T(stop)], maximum 2. Every block of the loop is one of the earlier lessons.",
eq: "ρ → ρ̃ = filter(ρ) → ρ̂ = P<sub>β</sub>(ρ̃) → ε = 9 + 3.19ρ̂ → A(ε)x = b → T(λ<sub>i</sub>) → J → A<sup>T</sup>y = (∂J/∂x)<sup>T</sup> → ∂J/∂ρ → Adam",
sym: [["filter", "1D cone, radius 3 pixels (Lesson 6)"], ["P_β", "tanh projection, β from 1 to 64 in 8 levels of 10 steps (Lesson 7)"], ["A x = b", "1D Helmholtz solver (Lesson 2)"], ["w_i", "normalized Gaussian band weights (Lesson 4)"], ["Adam", "learning rate 0.05 by default (Lesson 12)"]],
how: ["Forward: build ε from ρ, solve once per wavelength, compute J.", "Adjoint: one more solve per wavelength with the source at the probe.", "Gradient: field products per pixel, summed with the weights, then back through projection and filter.", "Step with Adam, clip ρ to [0, 1], raise β every 10 steps."],
say: "The toy run uses exactly the thesis loop: filtered and projected densities, a forward and an adjoint solve per wavelength, the chain rule back to the pixels, and Adam with β continuation.",
num: "Per step: 5 wavelengths × 2 solves = 10 solves of a 230-unknown system for the mirror. A 3D device needs the same two simulations per input, each with millions of cells (card 5).",
r(fig, ctl) {
  const box = (x, y, w, t, c) => `<g class="${c}"><rect x="${x}" y="${y}" width="${w}" height="38" rx="7"/></g><text class="th" x="${x + w / 2}" y="${y + 24}" text-anchor="middle" style="font-size:12px">${t}</text>`;
  let s = `<rect x="20" y="20" width="640" height="40" fill="var(--sunk)"/>` + C3.stripe(140, 20, 400, 40, Array.from({ length: 150 }, (_, i) => 0.5 + 0.3 * Math.sin(i / 3))) + `<line x1="60" x2="60" y1="14" y2="66" stroke="#378ADD" stroke-width="3"/><line x1="620" x2="620" y1="14" y2="66" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="60" y="82" text-anchor="middle">source</text><text class="ts" x="620" y="82" text-anchor="middle">probe</text><text class="ts" x="340" y="82" text-anchor="middle">design: 150 pixels of 10 nm, AlGaAs (light) to GaAs (dark)</text>`;
  const row = [["ρ", 20], ["filter", 100], ["project β", 180], ["ε(ρ̂)", 275], ["solve A x = b", 360], ["T(λᵢ), J", 470], ["adjoint", 565]];
  row.forEach(([t, x], i) => { s += box(x, 110, i === 4 ? 100 : 80, t, i === 6 ? "c-purple" : i === 4 ? "c-gray" : "c-blue"); if (i < 6) s += `<line x1="${x + (i === 4 ? 100 : 80)}" x2="${row[i + 1][1] - 2}" y1="129" y2="129" class="arr" marker-end="url(#ar)"/>`; });
  s += `<path d="M605 150 Q605 200 340 200 Q60 200 60 152" fill="none" stroke="#1D9E75" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="340" y="194" text-anchor="middle">∂J/∂ρ through projection and filter, Adam step, raise β every 10 steps</text>`;
  fig.innerHTML = svg(215, s);
  ctl.innerHTML = "";
}},

{s: "2. Run it", t: "Watch the design form",
intu: "Press run. The top stripe is the raw density ρ, the second the projected density ρ̂ that the solver sees. At first everything is grey and the structure appears as a soft modulation. Each time β rises the stripes sharpen, and by the end the design is black and white. The plot shows J against the step, with the β levels as faint steps. Try the dichroic goal, switch off continuation to start directly at β = 64, or add the erosion and dilation penalty.",
eq: "J<sub>k</sub> vs step k, &nbsp; β<sub>level</sub> = 64<sup>level/7</sup>, &nbsp; levels of 10 steps",
sym: [["ρ", "raw design variables, clipped to [0, 1]"], ["ρ̂", "what the solver sees"], ["J", "objective, without the penalty"], ["P_ED", "erosion and dilation penalty, when switched on, weight min(1, β/25)"]],
how: ["Start from ρ = 0.5 with a tiny random perturbation.", "Each step: forward and adjoint solves at every wavelength, chain rule, Adam.", "Every 10 steps β is multiplied by 64^(1/7) ≈ 1.81.", "At the end the design is thresholded at 0.5 (card 3)."],
say: "With β continuation the design develops as a grey modulation and then sharpens into a binary layout as β rises.",
num: "The mirror reaches about 0.9 reflection in this length. Without continuation the run starts at β = 64 and is nearly binary from the first step. In this easy 1D problem it still ends close to the continuation result. For 2D and 3D problems with many local optima, Christiansen and Sigmund recommend continuation.",
r(fig, ctl) {
  let goal = "mirror", ed = false, cont = true;
  ctl.innerHTML = btns([["mirror", "Mirror at 800 nm"], ["dichroic", "Pass 1000, block 700"]], "g") + btns([["c1", "Continuation on"], ["c0", "Start at β = 64"]], "c") + btns([["e0", "No penalty"], ["e1", "With P_ED"]], "e") + sl("lr", "Learning rate", 0.01, 0.2, 0.01, 0.05) + `<div class="row"><button id="go">Run 80 steps</button></div><div class="readout" id="ro"></div>`;
  let opt = null, ev = null;
  const reset = () => { opt = C3R.make({ goal, ed, cont, lr: +$("lr").value }); ev = opt.evaluate(opt.rho, false); C3R.last = opt; };
  const draw = () => {
    const T = 80, hist = opt.hist, maxJ = goal === "mirror" ? 1 : 2;
    let s = `<text class="ts" x="20" y="22">ρ</text>` + C3.stripe(50, 8, 600, 22, opt.rho) + `<text class="ts" x="20" y="54">ρ̂</text>` + C3.stripe(50, 40, 600, 22, ev.rhoHat);
    s += C3.frame(70, 85, 560, 140, 0, T, 0, maxJ, [0, 20, 40, 60, 80], [0, maxJ / 2, maxJ], "optimizer step", "J");
    for (let L = 0; L < 8; L++) { const b = Math.pow(64, L / 7), y = 225 - Math.log10(cont ? b : 64) / Math.log10(64) * 140; s += `<line x1="${C3.X(70, 560, 0, T)(L * 10)}" x2="${C3.X(70, 560, 0, T)(L * 10 + 10)}" y1="${y}" y2="${y}" stroke="var(--b)" stroke-width="3"/>`; }
    if (hist.length) s += plot(70, 85, 560, 140, hist.map((_, i) => i + 1), hist.map(h => h[0]), 0, T, 0, maxJ, "#1D9E75", 2.5);
    fig.innerHTML = svg(262, s + `<text class="ts" x="640" y="258" text-anchor="end">grey steps: β level (log scale)</text>`);
    $("ro").innerHTML = `<div><span>step</span><b>${opt.k}</b></div><div><span>β</span><b>${opt.beta().toFixed(1)}</b></div><div><span>J</span><b>${ev.F.toFixed(3)}</b></div><div><span>P_ED</span><b>${ed ? ev.P.toFixed(3) : "off"}</b></div>`;
  };
  const sync = () => { pick(ctl, "g", goal); pick(ctl, "c", cont ? "c1" : "c0"); pick(ctl, "e", ed ? "e1" : "e0"); $("lrv").textContent = (+$("lr").value).toFixed(2); };
  ctl.querySelectorAll("button[data-g]").forEach(b => b.onclick = () => { goal = b.dataset.g; stopAnim(); sync(); reset(); draw(); });
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { cont = b.dataset.c === "c1"; stopAnim(); sync(); reset(); draw(); });
  ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { ed = b.dataset.e === "e1"; stopAnim(); sync(); reset(); draw(); });
  $("lr").oninput = () => { stopAnim(); sync(); reset(); draw(); };
  $("go").onclick = () => { reset(); const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduce) { for (let i = 0; i < 80; i++) ev = opt.step(); ev = opt.evaluate(opt.rho, false); draw(); return; } anim(() => { if (opt.k >= 80) { stopAnim(); ev = opt.evaluate(opt.rho, false); draw(); return; } opt.step(); ev = opt.evaluate(opt.rho, false); draw(); }); };
  sync(); reset(); draw();
}},

{s: "3. The result", t: "The final design and its spectrum",
intu: "The last run of card 2 (or a default mirror run if you have not run one) is thresholded at 0.5 and its spectrum computed from 600 to 1100 nm. Shaded bands mark what was asked for. For the mirror, the dashed curve is a stack of the same length built by hand from the Chapter 2 recipe, rounded to the 10 nm grid: 6 pixels of GaAs and 7 of AlGaAs. The optimizer finds the same kind of periodic stack from a grey start, without being told what a Bragg mirror is. It even does better on this grid: it mixes layer widths so that the stopband is centered at 800 nm, while the rounded hand-built stack is centered near 840 nm.",
eq: "final design: ρ̂<sub>final</sub> = 1 if ρ̂ &gt; 0.5, else 0 &nbsp;&nbsp; quarter-wave: d = λ<sub>0</sub>/(4n): 57 nm GaAs, 67 nm AlGaAs",
sym: [["shaded band", "wavelengths with weight in J"], ["R = 1 − T", "reflectance, the stack is lossless"], ["quarter-wave stack", "Chapter 2, Lesson 6"]],
how: ["Threshold the projected design.", "Solve at 251 wavelengths.", "Compare with the target bands.", "For the mirror, compare with the hand-built Bragg stack."],
say: "Asked for a mirror, the optimizer converges to a periodic quarter-wave-like stack, the Bragg mirror that physics predicts, tuned to the target wavelength on the given grid.",
num: "Both stacks peak near 0.9. With an index ratio of only 3.49/3.0, Chapter 2 explains why about a dozen pairs are needed for strong reflection, and 1.5 µm holds about twelve.",
r(fig, ctl) {
  let opt = C3R.last && C3R.last.k >= 80 ? C3R.last : null;
  if (!opt) { opt = C3R.make({ goal: "mirror" }); for (let i = 0; i < 80; i++) opt.step(); C3R.last = opt; }
  const { bin, F } = C3R.finish(opt), ls = range(600, 1100, 251), Ts = ls.map(l => opt.dev.T(bin, l).T);
  const qw = []; while (qw.length < 150) { for (let i = 0; i < 6 && qw.length < 150; i++) qw.push(1); for (let i = 0; i < 7 && qw.length < 150; i++) qw.push(0); }
  const Tq = ls.map(l => opt.dev.T(qw, l).T), X = C3.X(70, 560, 600, 1100);
  let s = C3.stripe(70, 6, 560, 20, bin);
  const bands = opt.goal === "mirror" ? [[770, 830, "#D85A30"]] : [[670, 730, "#D85A30"], [970, 1030, "#1D9E75"]];
  bands.forEach(([a, b, c]) => s += `<rect x="${X(a)}" y="40" width="${X(b) - X(a)}" height="180" fill="${c}" opacity="0.15"/>`);
  s += C3.frame(70, 40, 560, 180, 600, 1100, 0, 1, [600, 700, 800, 900, 1000, 1100], [0, 0.5, 1], "wavelength (nm)", "reflectance R = 1 − T");
  if (opt.goal === "mirror") s += plot(70, 40, 560, 180, ls, Tq.map(t => 1 - t), 600, 1100, 0, 1, "var(--p)", 1.5, "5 4");
  s += plot(70, 40, 560, 180, ls, Ts.map(t => 1 - t), 600, 1100, 0, 1, "#378ADD", 2.5);
  s += C3.legend(80, 268, opt.goal === "mirror" ? [["optimized", "#378ADD"], ["quarter-wave by hand", "var(--p)", "5 4"]] : [["optimized", "#378ADD"]]) + `<text class="ts" x="640" y="268" text-anchor="end">${opt.goal === "mirror" ? "orange band: reflect" : "orange: reflect, green: pass"}</text>`;
  fig.innerHTML = svg(278, s);
  let runs = [], r = 1; for (let i = 1; i <= bin.length; i++) { if (i < bin.length && bin[i] === bin[i - 1]) r++; else { runs.push(r); r = 1; } }
  const R800 = 1 - opt.dev.T(bin, 800).T;
  ctl.innerHTML = `<div class="readout"><div><span>goal</span><b>${opt.goal}</b></div><div><span>J of binary design</span><b>${F.toFixed(3)}</b></div><div><span>${opt.goal === "mirror" ? "R at 800 nm, optimized / by hand" : "layers"}</span><b>${opt.goal === "mirror" ? R800.toFixed(3) + " / " + (1 - opt.dev.T(qw, 800).T).toFixed(3) : runs.length}</b></div><div><span>typical layer (median)</span><b>${runs.slice().sort((a, b) => a - b)[Math.floor(runs.length / 2)] * 10} nm</b></div></div>`;
}},

{s: "4. A free-topology device", t: "The stage sequence for a free-topology device",
intu: "A device whose topology is free, like a polarization splitter, goes through several stages, each built from a lesson of this chapter. It starts from a rough density drawing. The topology stage runs with filter, projection, β continuation and the erosion and dilation penalty. The result is thresholded and traced into a single polygon. Shape stages then move its vertices with a curvature penalty, the layout is checked against the design rules, repaired if needed, and refined in a DRC-safe stage. A final run on a finer grid gives the reported numbers. Step through.",
eq: "density → topology (β: 1 → β<sub>max</sub>, P<sub>ED</sub>) → threshold → polygon → shape (P<sub>κ</sub>) → DRC → repair → DRC-safe shape → validation",
sym: [["topology stage", "Lessons 6, 7, 9"], ["shape stage", "Lessons 5, 10"], ["DRC, repair, DRC-safe", "Lesson 11"], ["validation", "finer grid, no gradients, Chapter 2 convergence"]],
how: ["Each stage hands a fabricable-looking design to the next.", "Pixels give freedom, outlines give smooth edges and control of corners.", "The hard check comes last, because penalties are soft.", "The reported performance is always from a separate validation run, not from the objective."],
say: "A free-topology device is designed in stages, from a density with continuation and penalties, through a traced outline with curvature control, to a layout that passes the design rule check and is validated on a finer grid.",
num: "A shape stage without design rules can be useful as an intermediate step, but the outline that is finally repaired and refined does not have to be its result.",
r(fig, ctl) {
  const S = [["start density", "a rough drawing, for example a Y-splitter as a density image"], ["topology stage", "filter, projection, β from 1 up, erosion and dilation penalty ramped with β"], ["threshold", "ρ̂ > 0.5 gives a binary layout"], ["trace polygon", "one outline, ready for shape optimization"], ["shape stage", "vertex moves within Δ_max, curvature penalty"], ["DRC", "width, gap and area, checked twice"], ["repair", "close then open with r slightly above rule/2"], ["DRC-safe stage", "small moves, repair every few steps, keep passing outlines"], ["validate", "finer grid, symmetry checked, numbers reported with their resolution"]];
  let k = 0; ctl.innerHTML = `<div class="row"><button id="b">Back</button><button id="n">Next</button></div>`;
  const u = () => {
    let s = ""; S.forEach(([t], i) => { const x = 20 + (i % 5) * 130, y = i < 5 ? 30 : 120; s += `<g class="${i === k ? "c-coral" : i < k ? "c-teal" : "c-gray"}"><rect x="${x}" y="${y}" width="118" height="52" rx="8" stroke-width="${i === k ? 1.6 : 0.6}"/></g><text class="th" x="${x + 59}" y="${y + 31}" text-anchor="middle" style="font-size:12px">${i + 1}. ${t}</text>`; if (i % 5 !== 4 && i < S.length - 1) s += `<line x1="${x + 119}" x2="${x + 129}" y1="${y + 26}" y2="${y + 26}" class="arr" marker-end="url(#ar)"/>`; });
    s += `<path d="M599 84 Q599 100 340 102 Q79 104 79 118" class="arr" marker-end="url(#ar)"/>`;
    fig.innerHTML = svg(230, s + `<text class="ts" x="340" y="210" text-anchor="middle">${S[k][1]}</text>`);
    $("b").disabled = k === 0; $("n").disabled = k === S.length - 1;
  };
  $("b").onclick = () => { k--; u(); }; $("n").onclick = () => { k++; u(); }; u();
}},

{s: "5. From 1D to 3D", t: "Same loop, very different cost",
intu: "Nothing in the method changes in 3D: two simulations per gradient, field products, chain rule, Adam. What changes is the size of each simulation. The design region of a waveguide device is a few micrometers on a side and the membrane is 160 nm thick, inside a simulation box with air and absorbing layers around it. With FDTD the number of time steps also grows as the cells shrink (Chapter 2, Lesson 10). Set the resolution and the box size and compare the cell counts.",
eq: "cells ≈ (L<sub>x</sub>/Δ)(L<sub>y</sub>/Δ)(L<sub>z</sub>/Δ), &nbsp; Δ = λ<sub>0</sub>/(N<sub>λ</sub> n<sub>GaAs</sub>), &nbsp; cost ∝ cells × time steps ∝ N<sub>λ</sub><sup>4</sup>",
sym: [["N_λ", "steps per wavelength in GaAs"], ["Δ", "cell size, uniform here for simplicity"], ["L_x, L_y, L_z", "simulation box"], ["time steps", "∝ 1/Δ through the Courant limit"]],
how: ["Fix the box and the resolution.", "Count cells in 1D, 2D and 3D.", "Time steps scale like 1/Δ too, so the 3D cost scales like the fourth power of the resolution.", "Halving the cell size makes a 3D FDTD run about 16 times more expensive."],
say: "The method is the same in 1D and 3D, but a 3D simulation has millions of cells and its cost grows with the fourth power of the resolution.",
num: "At 795 nm and 20 steps per wavelength in GaAs, Δ = 11.4 nm. A 6 × 6 × 2 µm box then has about 50 million cells. Tidy3D's non-uniform grid puts fine cells only where the GaAs is, which reduces this a lot.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Steps per wavelength in GaAs", 10, 40, 1, 20) + sl("L", "Box side Lx = Ly (µm)", 2, 10, 0.5, 6) + sl("z", "Box height Lz (µm)", 0.5, 4, 0.1, 2) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("n").value, L = +$("L").value, Lz = +$("z").value; $("nv").textContent = N; $("Lv").textContent = L; $("zv").textContent = Lz;
    const d = 795 / (N * 3.492), c1 = 1000 * L / d, c2 = c1 * c1, c3 = c2 * 1000 * Lz / d;
    const Y = v => 210 - Math.log10(v) / 9 * 190, bars = [["1D line", c1], ["2D plane", c2], ["3D box", c3]];
    let s = ""; bars.forEach(([t, v], i) => { const x = 120 + i * 170; s += `<rect x="${x}" y="${Y(v)}" width="90" height="${210 - Y(v)}" fill="${["#378ADD", "#7F77DD", "#D85A30"][i]}" opacity="0.8"/><text class="ts" x="${x + 45}" y="${Y(v) - 6}" text-anchor="middle">${v >= 1e6 ? (v / 1e6).toFixed(1) + " M" : v >= 1e3 ? (v / 1e3).toFixed(1) + " k" : v.toFixed(0)}</text><text class="th" x="${x + 45}" y="232" text-anchor="middle">${t}</text>`; });
    [0, 3, 6, 9].forEach(e => s += `<text class="ts" x="80" y="${Y(Math.pow(10, e)) + 4}" text-anchor="end">10${["⁰", "", "", "³", "", "", "⁶", "", "", "⁹"][e]}</text><line x1="84" x2="640" y1="${Y(Math.pow(10, e))}" y2="${Y(Math.pow(10, e))}" stroke="var(--b)" stroke-dasharray="2 4"/>`);
    fig.innerHTML = svg(245, s);
    $("ro").innerHTML = `<div><span>cell size Δ</span><b>${d.toFixed(1)} nm</b></div><div><span>3D cells</span><b>${(c3 / 1e6).toFixed(1)} million</b></div><div><span>cost vs 20 steps/λ</span><b>${Math.pow(N / 20, 4).toFixed(2)}×</b></div>`;
  };
  ["n", "L", "z"].forEach(k => $(k).oninput = u); u();
}},

{s: "6. Quiz", t: "Chapter 3 quiz: twelve questions",
intu: "Twelve questions across the chapter. Answer, read why, and say the reason out loud as you would in your defense. If a question goes beyond these lessons into your own results, answer from your thesis chapters.",
eq: "Lessons 1 to 13",
sym: [["L1 to L4", "problem, adjoint, Tidy3D, objectives"], ["L5 to L7", "parameters, filter, projection"], ["L8 to L11", "morphology, penalties, DRC"], ["L12, L13", "Adam, full run"]],
how: ["Answer without looking.", "Explain the reason in one sentence.", "Reopen the lesson for any miss.", "Repeat before the defense."],
say: "When a question goes beyond what you did, say so and answer from the method you know.",
num: "Aim for 12 out of 12 with reasons.",
r(fig, ctl) {
  const Q = [
    ["How many simulations does one adjoint gradient need, for M parameters and one input?", ["2", "M + 1", "2M"], 0, "One forward and one adjoint simulation, independent of M (Lesson 2)."],
    ["The adjoint field solves…", ["Aᵀy = (∂F/∂x)ᵀ", "A y = b", "Aᵀy = b"], 0, "Its source is the derivative of F with respect to the fields (Michaels Eq. 11)."],
    ["For a pixel, ∂J/∂ε(r) in Tidy3D is…", ["Re Σ_f E_fwd·E_adj", "|E_fwd|²", "Im Σ_f E_fwd·E_adj*"], 0, "A field product summed over frequencies, with constants in the adjoint source (Eq. 3.5)."],
    ["Why does the boundary gradient use E∥ and D⊥?", ["They are continuous across the boundary", "They are larger", "Tidy3D stores only them"], 0, "E⊥ jumps by the permittivity ratio, about 12 for GaAs and air (Lesson 3)."],
    ["Why are the objectives averaged over a band?", ["To avoid narrow resonances", "To save simulations", "Because the mode solver needs it"], 0, "A single wavelength rewards fragile resonances (Lesson 4)."],
    ["What does the tanh map in w(q) achieve?", ["Any step in q keeps w between its bounds", "It speeds up the simulation", "It makes w binary"], 0, "tanh maps the real line into (−1, 1) (Lesson 5)."],
    ["The conic filter alone makes a random design…", ["Smoother and greyer", "Binary", "Unchanged"], 0, "Averages cluster near the mean, so a projection must follow (Lesson 6)."],
    ["Why is β raised gradually?", ["At large β the gradient concentrates on edges and the topology freezes", "Large β is slower to compute", "Adam requires it"], 0, "Continuation lets the layout form first (Lesson 7)."],
    ["Opening with a disk of radius r removes…", ["Solid features narrower than 2r and sharp convex tips", "Gaps narrower than 2r", "Nothing if the design is binary"], 0, "Closing fills gaps, opening removes thin solid parts (Lesson 8)."],
    ["With Tidy3D's thresholds, a penalty radius R discourages features narrower than about…", ["1.75R, just under 2R", "R/2", "R"], 0, "Each edge moves by about R minus a pixel (Lesson 9)."],
    ["Why is a curvature penalty with κ = 10 per µm called gentle?", ["Its switch is about 400 nm wide, so even safe vertices pay a little", "It ignores small radii", "It is not differentiable"], 0, "Switch width 4/κ (Lesson 10)."],
    ["Why is the repair radius slightly larger than half the rule?", ["So that rounding to the layout grid cannot create a new violation", "To make the device faster", "Because KLayout requires it"], 0, "A small margin absorbs grid rounding (Lesson 11)."]
  ];
  let i = 0, score = 0, done = false;
  const u = () => {
    if (i >= Q.length) { fig.innerHTML = svg(140, `<text class="th" x="340" y="64" text-anchor="middle" style="font-size:28px">${score} / ${Q.length}</text><text class="ts" x="340" y="96" text-anchor="middle">${score === Q.length ? "Full marks. Now explain each one out loud." : "Reopen the lessons for the ones you missed."}</text>`); ctl.innerHTML = `<div class="row"><button id="qr">Start again</button></div>`; $("qr").onclick = () => { i = 0; score = 0; u(); }; return; }
    const [q, o, c, why] = Q[i]; done = false;
    fig.innerHTML = svg(70, `<text class="ts" x="20" y="28">question ${i + 1} of ${Q.length}</text><rect x="20" y="40" width="640" height="8" rx="4" fill="var(--b)"/><rect x="20" y="40" width="${640 * i / Q.length}" height="8" rx="4" fill="#1D9E75"/><text class="ts" x="660" y="28" text-anchor="end">score ${score}</text>`);
    ctl.innerHTML = `<div class="quiz"><p style="font-weight:600">${q}</p><div class="opts">${o.map((t, j) => `<button data-a="${j}">${t}</button>`).join("")}</div><div class="fb" id="qfb"></div><div class="row"><button id="qn" disabled>Next question</button></div></div>`;
    ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { if (done) return; done = true; const ok = +b.dataset.a === c; if (ok) score++; b.classList.add("on"); $("qfb").innerHTML = `<span class="${ok ? "good" : "badc"}">${ok ? "Correct." : "Not quite."}</span> ${why}`; $("qn").disabled = false; });
    $("qn").onclick = () => { i++; u(); };
  };
  u();
}}
],
summary: "The whole chapter in one loop: densities are filtered and projected with β continuation, the permittivity is interpolated, a forward solve per wavelength gives the band-weighted objective, an adjoint solve gives field products for every pixel, the chain rule carries the gradient back through projection and filter, and Adam takes the step. Asked for a mirror, the 1D toy rediscovers the quarter-wave Bragg stack. A free-topology device follows the stage sequence density, topology with penalties, threshold, polygon, shape with curvature control, design rule check, repair, DRC-safe refinement and validation on a finer grid. In 3D the method is unchanged, only each simulation is millions of cells.",
sheet: [
["ρ → ρ̃ → ρ̂ → ε → A x = b → J → Aᵀy = (∂J/∂x)ᵀ → ∂J/∂ρ → Adam", "The full loop"],
["β<sub>level</sub> = β<sub>max</sub><sup>level/(L−1)</sup>", "Continuation"],
["J = F − min(1, β/25)P<sub>ED</sub>, &nbsp; J = F − w<sub>κ</sub>P<sub>κ</sub>", "Penalties in the topology and shape stages"],
["X<sub>healed</sub> = open<sub>r</sub>(close<sub>r</sub>X)", "Repair before the DRC-safe stage"],
["cost<sub>3D FDTD</sub> ∝ N<sub>λ</sub><sup>4</sup>", "Resolution cost"]],
consts: "Toy: 150 pixels of 10 nm, ε from 9 (AlGaAs) to 12.19 (GaAs), embedded in AlGaAs, 1D Helmholtz solver with exact one-way boundaries, filter radius 3 pixels, β from 1 to 64 in 8 levels of 10 steps.",
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021)", "Hammond et al., Opt. Express 29, 23916 (2021)", "Kingma and Ba, ICLR 2015", "Flexcompute, Tidy3D 2.11.2"]
});
