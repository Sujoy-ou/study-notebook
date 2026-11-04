const C3R = { last: null, make: o => new C3.Opt1D(Object.assign({ eMin: 9, Nd: 150, levels: 8, per: 10, betaMax: 64 }, o)) };
/* Back / Play / Next stepper for card 4 (prefix C3L15_) */
const C3L15_steps = (fig, ctl, n, dur, draw, idp) => {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${idp}b">Back</button><button id="${idp}p">Pause</button><button id="${idp}n">Next step</button><span id="${idp}s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`);
  const S = { k: 1, play: true, t: 0 };
  let last = performance.now();
  const ui = () => { $(idp + "s").textContent = `step ${S.k} of ${n}`; $(idp + "b").disabled = S.k === 1; $(idp + "n").disabled = S.k === n; $(idp + "p").textContent = S.play ? "Pause" : "Play"; };
  S.go = k => { S.k = Math.max(1, Math.min(n, k)); S.t = 0; ui(); draw(S); };
  $(idp + "b").onclick = () => { S.play = false; S.go(S.k - 1); };
  $(idp + "n").onclick = () => { S.play = false; S.go(S.k + 1); };
  $(idp + "p").onclick = () => { S.play = !S.play; if (S.play && S.k === n) S.go(1); ui(); };
  ui();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; S.t += dt;
    if (S.play && S.t > dur) { if (S.k < n) { S.k++; S.t = 0; } else S.play = false; ui(); }
    draw(S);
  });
  return S;
};
C3R.finish = function (opt) { const fin = opt.evaluate(opt.rho, false), bin = fin.rhoHat.map(v => v > 0.5 ? 1 : 0); const B = opt.bands(); let F = 0; for (const [l, w] of B.pass) F += w * opt.dev.T(bin, l).T; for (const [l, w] of B.block) F += w * (1 - opt.dev.T(bin, l).T); return { bin, F }; };
addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l15", title: "Putting it together: a full inverse design run", short: "15. A full run and quiz",
big: String.raw`Every piece of this chapter now runs together in your browser on a 1D problem: a stack of 150 pixels, each between AlGaAs and GaAs, lit from one side. Densities are filtered and projected with \(\beta\) continuation, the permittivity follows by linear interpolation, a frequency-domain solver gives the transmission at several wavelengths, the adjoint solve gives the gradient for all pixels, the chain rule carries it back through projection and filter, and Adam takes the step. Ask for a mirror and the optimizer rediscovers the quarter-wave Bragg stack of Chapter 2. The same loop, with 3D FDTD in place of the 1D solver and a design rule check at the end, is how the thesis devices are designed. The lesson closes with the full stage sequence of a free-topology device and a quiz.`,
bridge: "Methods from all of Ch. 3: the loop of Fig. 3.1 with Eqs. (3.1) to (3.5) for the problem and the gradient, Eqs. (3.8) to (3.10) for the density chain, Eq. (3.13) for the band weights, Eq. (3.15) for the erosion and dilation penalty, the projection continuation of Sec. 3.5 with Fig. 3.2, the design rule check and repair of Sec. 3.5 with Eq. (3.17), and Adam from Sec. 3.6. The quarter-wave comparison links to Chapter 2, Lesson 5. Everything is a toy model chosen to run in a fraction of a second.",
cards: [
/* from old ch3 L13 card 1 */
{s: "1. The toy problem", t: "A 1D stack designed pixel by pixel",
intu: String.raw`The design region is 1.5 µm long, 150 pixels of 10 nm, embedded in AlGaAs. Each pixel can be AlGaAs (\(\rho = 0\), \(\varepsilon = 9\)) or GaAs (\(\rho = 1\), \(\varepsilon = 12.19\)). A source on the left launches light, a probe on the right measures the transmission. Two goals are available. Mirror: reflect a band around 800 nm, \(J = \sum w_i[1 - T(\lambda_i)]\). Dichroic: pass a band around 1000 nm and reflect one around 700 nm, \(J = \sum w_i T(\text{pass}) + \sum w_i[1 - T(\text{stop})]\), maximum 2. Every block of the loop is one of the earlier lessons.`,
eq: String.raw`\[ \rho \to \tilde\rho = \operatorname{filter}(\rho) \to \hat\rho = P_\beta(\tilde\rho) \to \varepsilon = 9 + 3.19\,\hat\rho \]\[ \to A(\varepsilon)\,x = b \to T(\lambda_i) \to J \]\[ \to A^{T} y = \left(\frac{\partial J}{\partial x}\right)^{T} \to \frac{\partial J}{\partial \rho} \to \text{Adam} \]`,
sym: [["filter", "1D cone, radius 3 pixels (Lesson 5)"], [String.raw`\(P_\beta\)`, String.raw`tanh projection, \(\beta\) from 1 to 64 in 8 levels of 10 steps (Lesson 6)`], [String.raw`\(A x = b\)`, "1D Helmholtz solver (Lesson 2)"], [String.raw`\(w_i\)`, "normalized Gaussian band weights (Lesson 7)"], ["Adam", "learning rate 0.05 by default (Lesson 13)"]],
how: [String.raw`Forward: build \(\varepsilon\) from \(\rho\), solve once per wavelength, compute \(J\).`, "Adjoint: one more solve per wavelength with the source at the probe.", "Gradient: field products per pixel, summed with the weights, then back through projection and filter.", String.raw`Step with Adam, clip \(\rho\) to \([0, 1]\), raise \(\beta\) every 10 steps.`],
say: String.raw`The toy run uses exactly the thesis loop: filtered and projected densities, a forward and an adjoint solve per wavelength, the chain rule back to the pixels, and Adam with \(\beta\) continuation.`,
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

/* from old ch3 L13 card 2 */
{s: "2. Run it", t: "Watch the design form",
intu: String.raw`Press run. The top stripe is the raw density \(\rho\), the second the projected density \(\hat\rho\) that the solver sees. At first everything is grey and the structure appears as a soft modulation. Each time \(\beta\) rises the stripes sharpen, and by the end the design is black and white. The plot shows \(J\) against the step, with the \(\beta\) levels as faint steps. Try the dichroic goal, switch off continuation to start directly at \(\beta = 64\), or add the erosion and dilation penalty.`,
eq: String.raw`\[ J_k \text{ vs step } k \qquad \beta_{\mathrm{level}} = 64^{\,\mathrm{level}/7} \qquad \text{levels of 10 steps} \]`,
sym: [[String.raw`\(\rho\)`, String.raw`raw design variables, clipped to \([0, 1]\)`], [String.raw`\(\hat\rho\)`, "what the solver sees"], [String.raw`\(J\)`, "objective, without the penalty"], [String.raw`\(P_{\mathrm{ED}}\)`, String.raw`erosion and dilation penalty, when switched on, weight \(\min(1, \beta/25)\)`]],
how: [String.raw`Start from \(\rho = 0.5\) with a tiny random perturbation.`, "Each step: forward and adjoint solves at every wavelength, chain rule, Adam.", String.raw`Every 10 steps \(\beta\) is multiplied by \(64^{1/7} \approx 1.81\).`, "At the end the design is thresholded at 0.5 (card 3)."],
say: String.raw`With \(\beta\) continuation the design develops as a grey modulation and then sharpens into a binary layout as \(\beta\) rises.`,
num: String.raw`The mirror reaches about 0.9 reflection in this length. Without continuation the run starts at \(\beta = 64\) and is nearly binary from the first step. In this easy 1D problem it still ends close to the continuation result. For 2D and 3D problems with many local optima, Christiansen and Sigmund recommend continuation.`,
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

/* from old ch3 L13 card 3 */
{s: "3. The result", t: "The final design and its spectrum",
intu: "The last run of card 2 (or a default mirror run if you have not run one) is thresholded at 0.5 and its spectrum computed from 600 to 1100 nm. Shaded bands mark what was asked for. For the mirror, the dashed curve is a stack of the same length built by hand from the Chapter 2 recipe, rounded to the 10 nm grid: 6 pixels of GaAs and 7 of AlGaAs. The optimizer finds the same kind of periodic stack from a grey start, without being told what a Bragg mirror is. It even does better on this grid: it mixes layer widths so that the stopband is centered at 800 nm, while the rounded hand-built stack is centered near 840 nm.",
eq: String.raw`\[ \text{final design: } \hat\rho_{\mathrm{final}} = \begin{cases} 1 & \text{if } \hat\rho \gt 0.5 \\ 0 & \text{else} \end{cases} \]\[ \text{quarter-wave: } d = \frac{\lambda_0}{4n}\text{: } 57\,\mathrm{nm}\ \text{GaAs},\ 67\,\mathrm{nm}\ \text{AlGaAs} \]`,
sym: [["shaded band", String.raw`wavelengths with weight in \(J\)`], [String.raw`\(R = 1 - T\)`, "reflectance, the stack is lossless"], ["quarter-wave stack", "Chapter 2, Lesson 5"]],
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

/* from old ch3 L13 card 4, rewritten to follow Ch. 3 Secs. 3.3 and 3.5, now a step-through */
{s: "4. A free-topology device", t: "The stage sequence of the PBS, step by step",
intu: String.raw`A device whose topology is free, the PBS, passes through several stages, and each one is a lesson of this chapter. It starts from a Y-shaped splitter drawn as a density image. The topology stage optimizes the pixels with the conic filter, the projection with \(\beta\) raised from 1 to 100, and the erosion and dilation penalty. The result is thresholded at 0.5 and converted to one polygon. That outline must pass the design rule check, and a design that fails is repaired by a closing and an opening. Since the repair changes the geometry, the outline is optimized again by inverse design, now by moving its boundary vertices with the curvature penalty, and every five steps it is checked and repaired again, keeping only outlines that pass. A final run gives the reported numbers. Press Play, or step through and narrate each box.`,
eq: String.raw`\[ \text{density} \to \text{topology } (\beta\text{: } 1 \to 100,\ P_{\mathrm{ED}}) \to \text{threshold } 0.5 \to \text{polygon} \]\[ \to \text{DRC} \to \text{repair} \to \text{shape } (P_{\kappa},\ \text{DRC every 5 steps}) \to \text{evaluation} \]<div class="eqref">Ch. 3 Secs. 3.3 and 3.5, Eqs. (3.8) to (3.11), (3.15) to (3.17)</div>`,
sym: [["topology stage", "Lessons 5, 6 and 9"], ["DRC and repair", "Lesson 11"], ["shape stage", "boundary vertices of Lesson 4, curvature penalty of Lesson 10"], ["evaluation", "settings of Lesson 12, quantities of Lesson 14"]],
how: ["Pixels give the freedom to find a topology, so they come first.", "Thresholding and tracing turn the pixels into one outline that a lithography tool can write.", "The penalties are soft, so the hard check comes after the topology stage, and failures are repaired.", "The repair can lower the performance, so the outline is optimized again inside a loop that keeps it within the rules.", "The reported numbers come from a separate final run, not from the objective."],
say: "The PBS starts as a density image, goes through a topology stage with filter, projection continuation and the erosion and dilation penalty, is thresholded and traced into one polygon, checked and repaired, then optimized again as an outline with the curvature penalty while it is checked and repaired every five steps, and finally evaluated.",
num: String.raw`Topology stage: \(\beta\) from 1 to 100 in 11 levels of 7 steps, 77 steps, conic filter \(R = 120\) nm. Design rules: 120 nm width, gap and area, check radius 59 nm, repair radius 63 nm.`,
r(fig, ctl) {
  const ST = [["start density", "Y-splitter, ρ = 0.9 in the arms, 0.1 elsewhere"], ["topology stage", "filter, projection with β from 1 to 100, ED penalty"], ["threshold", "ρ̂ > 0.5 gives a binary design"], ["one polygon", "the binary design traced as one outline"], ["DRC", "120 nm rules, KLayout and r = 59 nm morphology"], ["repair", "open_r(close_r(X)) with r = 63 nm"], ["shape stage", "vertex moves and curvature penalty, check and repair every 5 steps"], ["evaluation", "a separate final run gives the reported numbers"]];
  fig.innerHTML = `<div id="q4s"></div><p class="note" id="q4c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const W = 150, Hb = 52, pos = i => [18 + (i % 4) * 166, i < 4 ? 30 : 140];
  const draw = S => {
    const k = S.k; let s = "";
    ST.forEach(([t], i) => {
      if (i >= k) return;
      const [x, y] = pos(i), cls = i === k - 1 ? "c-coral" : "c-teal", fade = i === k - 1 ? Math.min(1, S.t / 0.5) : 1;
      s += `<g opacity="${fade.toFixed(2)}"><g class="${cls}"><rect x="${x}" y="${y}" width="${W}" height="${Hb}" rx="8" stroke-width="${i === k - 1 ? 1.6 : 0.6}"/></g><text class="th" x="${x + W / 2}" y="${y + 31}" text-anchor="middle" style="font-size:12px">${i + 1}. ${t}</text></g>`;
      if (i > 0 && i !== 4) { const [px, py] = pos(i - 1); s += `<line x1="${px + W + 1}" x2="${x - 3}" y1="${y + Hb / 2}" y2="${y + Hb / 2}" class="arr" marker-end="url(#ar)"/>`; }
      if (i === 4) s += `<path d="M${pos(3)[0] + W / 2} ${30 + Hb} Q${pos(3)[0] + W / 2} 112 340 112 Q${pos(4)[0] + W / 2} 112 ${pos(4)[0] + W / 2} 138" class="arr" marker-end="url(#ar)"/>`;
    });
    if (k >= 7) { const [x6, y6] = pos(6), [x5] = pos(5); s += `<path d="M${x6 + W / 2} ${y6 + Hb} Q${x6 + W / 2} ${y6 + Hb + 30} ${(x5 + x6 + W) / 2} ${y6 + Hb + 30} Q${x5 + W / 2} ${y6 + Hb + 30} ${x5 + W / 2} ${y6 + Hb + 2}" class="arr" stroke-dasharray="4 3" marker-end="url(#ar)"/><text class="ts" x="${(x5 + x6 + W) / 2}" y="${y6 + Hb + 46}" text-anchor="middle">every 5 steps: check, repair, keep passing outlines</text>`; }
    $("q4s").innerHTML = svg(250, s);
    $("q4c").textContent = `Step ${k}. ${ST[k - 1][0]}: ${ST[k - 1][1]}.`;
  };
  C3L15_steps(fig, ctl, ST.length, 2.6, draw, "q4");
}},

/* from old ch3 L13 card 5 */
{s: "5. From 1D to 3D", t: "Same loop, very different cost",
intu: "Nothing in the method changes in 3D: two simulations per gradient, field products, chain rule, Adam. What changes is the size of each simulation. The design region of a waveguide device is a few micrometers on a side and the membrane is 160 nm thick, inside a simulation box with air and absorbing layers around it. With FDTD the number of time steps also grows as the cells shrink (Chapter 2, extra lesson B2 on FDTD stability). Set the resolution and the box size and compare the cell counts.",
eq: String.raw`\[ \text{cells} \approx \left(\frac{L_x}{\Delta}\right)\!\left(\frac{L_y}{\Delta}\right)\!\left(\frac{L_z}{\Delta}\right) \qquad \Delta = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \]\[ \text{cost} \propto \text{cells} \times \text{time steps} \propto N_\lambda^4 \]`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength in GaAs"], [String.raw`\(\Delta\)`, "cell size, uniform here for simplicity"], [String.raw`\(L_x, L_y, L_z\)`, "simulation box"], ["time steps", String.raw`\(\propto 1/\Delta\) through the Courant limit`]],
how: ["Fix the box and the resolution.", "Count cells in 1D, 2D and 3D.", String.raw`Time steps scale like \(1/\Delta\) too, so the 3D cost scales like the fourth power of the resolution.`, "Halving the cell size makes a 3D FDTD run about 16 times more expensive."],
say: "The method is the same in 1D and 3D, but a 3D simulation has millions of cells and its cost grows with the fourth power of the resolution.",
num: String.raw`At 795 nm and 20 steps per wavelength in GaAs, \(\Delta = 11.4\) nm. A 6 × 6 × 2 µm box then has about 50 million cells. Tidy3D's non-uniform grid puts fine cells only where the GaAs is, which reduces this a lot (Lesson 12).`,
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

/* from old ch3 L13 card 6, questions rewritten on thesis Ch. 3 only */
{s: "6. Quiz", t: "Chapter 3 quiz: twelve questions",
intu: "Twelve questions on thesis Chapter 3, from the design problem to the reported quantities. Answer, read why, and say the reason out loud as you would in your defense. Every answer is in the chapter text.",
eq: `<div class="eqnote">Ch. 3 Secs. 3.2 to 3.7, Lessons 2 to 14</div>`,
sym: [["L1 to L3", "design problem, adjoint method, adjoint in Tidy3D"], ["L4 to L7", "parameterizations, filter, projection, objectives"], ["L8 to L11", "morphology, penalties, DRC and repair"], ["L12 to L14", "simulation settings, Adam, reported quantities"]],
how: ["Answer without looking.", "Explain the reason in one sentence.", "Reopen the lesson for any miss.", "Repeat before the defense."],
say: "When a question goes beyond what you did, say so and answer from the method you know.",
num: "Aim for 12 out of 12 with reasons.",
r(fig, ctl) {
  const Q = [
    ["Finite differences need 2N simulations per step for N parameters. How many does the adjoint method need for the whole gradient?", ["N + 1", "Two, one forward and one adjoint", "2N, but they run in parallel"], 1, "Sec. 3.2: the adjoint method gets the gradient with respect to all parameters from one forward and one adjoint simulation, whatever N is (Lesson 2)."],
    ["The adjoint problem is Aᵀy = (∂F/∂x)ᵀ. What is its source?", ["The original source b", "The permittivity change ∂A/∂pᵢ", "The derivative of F with respect to the fields"], 2, "Eq. (3.3). In Tidy3D, for a mode-amplitude objective, it is the same mode sent backward from the monitor plane (Lessons 2 and 3)."],
    ["A grating width is w = ½(w_max − w_min) tanh p + ½(w_max + w_min) with 80 nm and 1 µm. What does p = 0 give?", ["540 nm, the middle of the range", "80 nm", "1 µm"], 0, "tanh 0 = 0, so w = (80 + 1000)/2 = 540 nm, and any real p keeps w between the bounds (Eq. 3.6, Lesson 4)."],
    ["The conic filter weight K(d) = max(0, 1 − d/R)…", ["is 1 inside R and 0 outside", "falls linearly from 1 at the center to 0 at R, which Tidy3D rounds up to whole pixels", "is a Gaussian of width R"], 1, "Eq. (3.8), with R = 120 nm for the PBS. The filter alone makes the design greyer, so a projection follows (Lesson 5)."],
    ["Why are the grating and PBS objectives averaged over a band with Gaussian weights around 795 nm?", ["Optimizing at a single wavelength tends to produce narrow resonances", "To need fewer simulations", "Because the mode solver needs several wavelengths"], 0, "Sec. 3.4, Eq. (3.13). The tapers are optimized at 795 nm only (Lesson 7)."],
    ["How is the projection sharpness β raised for the PBS?", ["Linearly from 1 to 25 in 77 steps", "It is 100 from the first step", "Geometrically from 1 to 100 in 11 levels of 7 steps, then the design is thresholded at 0.5"], 2, "Sec. 3.5 and Fig. 3.2. A small β keeps the problem smooth, a large β makes the design binary but the gradient poorly conditioned (Lesson 6)."],
    ["Why does the erosion and dilation penalty enter J with the weight min(1, β/25)?", ["The penalty only has meaning once the design is nearly binary", "To keep J below 1", "Because Adam needs a growing weight"], 0, "Eq. (3.15): the weight grows with β and reaches 1 at β = 25. The penalty is soft, so the hard check is still needed (Lesson 9)."],
    ["The morphological DRC uses a disk of radius 59 nm for a 120 nm rule. Why 59 and not 60?", ["To make the check stricter than the rule", "Half the rule minus 1 nm, so a feature exactly at the limit is not flagged by rounding", "Because the PBS pixel is 11.38 nm"], 1, "Sec. 3.5. A design is accepted only if both the KLayout check and the Shapely morphology check find no violation (Lesson 11)."],
    ["The repair is X_healed = open_r(close_r(X)) with r = 63 nm. What does it do?", ["Fills air gaps narrower than 2r, then removes GaAs narrower than 2r, with a margin against grid rounding", "Removes thin GaAs first, then fills the gaps", "Only rounds the corners"], 0, "Eq. (3.17). It can lower the performance, so the repaired outline is optimized again under the rules (Lesson 11)."],
    ["At 20 steps per wavelength the GaAs cell is λ₀/(20 n_GaAs) = 11.38 nm. Where else does 11.38 nm appear?", ["It is the minimum feature of the gratings", "It is the repair radius", "It is the PBS pixel size, so design pixels and solver cells have the same scale"], 2, "Sec. 3.6. The gratings are designed in 2D at 30 steps, the tapers and the PBS in 3D at 20 (Lesson 12)."],
    ["In Tidy3D a mirror plane set to −1…", ["keeps odd fields and acts as a PEC, so it keeps a mode whose E is normal to the plane", "keeps even fields and acts as a PMC", "switches the symmetry off"], 0, "Sec. 3.6. The mid-plane z = 0 is used only with air above and below, because the DBR under the gratings breaks it (Lesson 12)."],
    ["One input of the PBS has T_target = 0.9 and T_leak = 0.009. What are ER and IL?", ["ER = 0.46 dB, IL = 20 dB", "ER = 20 dB, IL = 0.46 dB", "ER = 100 dB, IL = 0.1 dB"], 1, "Eq. (3.18): ER = 10 log₁₀(0.9/0.009) = 20 dB and IL = −10 log₁₀ 0.9 = 0.46 dB (Lesson 14)."]
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
summary: String.raw`The whole chapter in one loop: densities are filtered and projected with \(\beta\) continuation, the permittivity is interpolated, a forward solve per wavelength gives the band-weighted objective, an adjoint solve gives field products for every pixel, the chain rule carries the gradient back through projection and filter, and Adam takes the step. Asked for a mirror, the 1D toy rediscovers the quarter-wave Bragg stack. The PBS, a free-topology device, follows the stage sequence density, topology with filter, projection continuation and penalty, threshold, one polygon, design rule check, repair, and shape optimization under the rules with the curvature penalty, followed by a final evaluation run. In 3D the method is unchanged, only each simulation is millions of cells.`,
sheet: [
[String.raw`\[ \rho \to \tilde\rho \to \hat\rho \to \varepsilon \to A x = b \to J \]\[ \to A^{T} y = \left(\frac{\partial J}{\partial x}\right)^{T} \to \frac{\partial J}{\partial \rho} \to \text{Adam} \]`, "The full loop (Ch. 3 Fig. 3.1)"],
[String.raw`\[ \beta_{\mathrm{level}} = \beta_{\mathrm{max}}^{\,\mathrm{level}/(L-1)} \]`, "Continuation"],
[String.raw`\[ J = \mathrm{FOM} - \min\!\left(1, \frac{\beta}{25}\right) P_{\mathrm{ED}} \qquad J = F - w_{\kappa} P_{\kappa} \]`, "Penalties in the topology and shape stages (Ch. 3 Eqs. 3.15, 3.16)"],
[String.raw`\[ X_{\mathrm{healed}} = \operatorname{open}_r\big(\operatorname{close}_r(X)\big) \]`, "Repair after a failed check (Ch. 3 Eq. 3.17)"],
[String.raw`\[ \mathrm{cost}_{\text{3D FDTD}} \propto N_\lambda^4 \]`, "Resolution cost"]],
consts: String.raw`Toy: 150 pixels of 10 nm, \(\varepsilon\) from 9 (AlGaAs) to 12.19 (GaAs), embedded in AlGaAs, 1D Helmholtz solver with exact one-way boundaries, filter radius 3 pixels, \(\beta\) from 1 to 64 in 8 levels of 10 steps.`,
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018)", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021)", "Hammond et al., Opt. Express 29, 23916 (2021)", "Kingma and Ba, ICLR 2015", "Flexcompute, Tidy3D 2.11.2"]
});
