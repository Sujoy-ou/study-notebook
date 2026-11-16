/* 2D toy pulse run used by Lesson 7: returns a stepping function. */
function LC7_pulseSim() {
  const T = LC.toy(); LC.toyApply(T, LC.toyStart(T));
  const sim = new C2.FDTD2D(T.nx, T.ny, 0.5, T.eps, T.pad), w = 2 * Math.PI * 0.5 / T.lam;
  const step = () => { const t = sim.t; sim.step(null); const g = Math.exp(-Math.pow((t - 120) / 40, 2) / 2) * Math.sin(w * t); for (let k = -12; k <= 12; k++) { const q = (T.yc + k) * T.nx + T.src; sim.ez[q] += 0.3 * g * T.prof[k + 12] / T.eps[q]; } };
  const energy = () => { let U = 0; for (let q = 0; q < sim.ez.length; q++) U += T.eps[q] * sim.ez[q] ** 2 + sim.hx[q] ** 2 + sim.hy[q] ** 2; return U; };
  return { T, sim, step, energy };
}

addLesson("thesis", "lec", {
level: "Forward", num: "Lesson 7",
id: "thesis-lec-l7", title: "The forward run in time", short: "7. The forward run",
big: String.raw`Now the solver runs. It starts with all fields at zero and repeats the same small update millions of times: H from the curl of E, then E from the curl of H with the source current added, half a time step apart (the leapfrog). The pulse enters the input strip, reaches the design region, is shaped by the pixels and leaves through the ports into the PML. The run stops by itself when the field energy left in the box has dropped to a tiny fraction of its peak. Everything in this lesson is in the time domain.`,
bridge: "Thesis Ch. 2 Sec. 2.6 (Yee updates in alternating half steps). The live run below is a 2D toy cousin of the PBS (Ez only, index 2, one target port), computed in your browser.",
cards: [
{s: "1. The leapfrog", t: "H, then E, half a step apart, again and again",
intu: String.raw`Step through one time step. E lives at whole steps \(n\), H at half steps \(n + \tfrac12\). First H is updated from the curl of the E that is already known. Then E is updated from the curl of that new H, and the source current is added on the input plane. Then the next step starts. Each update only uses neighbouring cells, so there is no big equation to solve.`,
eq: String.raw`\[ \mathbf{H}^{n+\frac12} = \mathbf{H}^{n-\frac12} - \frac{\Delta t}{\mu_0}\nabla\times\mathbf{E}^{n} \]\[ \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\Big(\nabla\times\mathbf{H}^{n+\frac12} - \mathbf{J}^{n+\frac12}\Big) \]`,
sym: [[String.raw`\(n\)`, "time step number"], [String.raw`\(\Delta t\)`, "time step, about 0.022 fs here (Lesson 5)"]],
how: ["Update all H from the curl of E.", "Update all E from the curl of H, and add the source current.", "PML cells get an extra damping term.", "Repeat."],
say: "Each FDTD step updates H from the curl of E and then E from the curl of H plus the source, half a time step apart, using only neighbouring cells.",
num: "About 120 steps per optical period at 795 nm with an 11.38 nm cell.",
r(fig, ctl) {
  const cap = [String.raw`Known: \(\mathbf{E}^n\) at whole step \(n\) and \(\mathbf{H}^{n-1/2}\) half a step earlier.`, String.raw`Update H: \(\mathbf{H}^{n+1/2}\) from the curl of \(\mathbf{E}^n\).`, String.raw`Update E: \(\mathbf{E}^{n+1}\) from the curl of \(\mathbf{H}^{n+1/2}\), plus the source current on the input plane.`, "Now E is at n + 1 and H at n + 1/2. The next step starts the same way."];
  LC.steps(ctl, 4, k => {
    const X = C3.X(60, 560, 0, 4); let s = `<line x1="60" x2="620" y1="80" y2="80" stroke="var(--b)"/><line x1="60" x2="620" y1="160" y2="160" stroke="var(--b)"/><text class="ts" x="20" y="84">E</text><text class="ts" x="20" y="164">H</text>`;
    for (let t = 0; t <= 4; t++) s += `<text class="ts" x="${X(t)}" y="200" text-anchor="middle">${["n − 1", "n", "n + 1", "n + 2", ""][t]}</text>`;
    const Ek = k < 2 ? [0, 1] : [0, 1, 2], Hk = k < 1 ? [0.5] : [0.5, 1.5];
    Ek.forEach(t => s += `<circle cx="${X(t)}" cy="80" r="10" fill="${(k === 2 && t === 2) ? "var(--blue)" : "var(--blue-bg)"}" stroke="var(--blue)"/>`);
    Hk.forEach(t => s += `<rect x="${X(t) - 10}" y="150" width="20" height="20" fill="${(k === 1 && t === 1.5) ? "var(--coral)" : "var(--coral-bg)"}" stroke="var(--coral)"/>`);
    if (k === 1) s += arrow(X(1), 92, X(1.5) - 8, 148, "var(--coral)", 2) + `<text class="ts" x="${X(1.25) + 12}" y="122">curl E</text>`;
    if (k === 2) s += arrow(X(1.5), 148, X(2) - 8, 92, "var(--blue)", 2) + `<text class="ts" x="${X(1.75) + 12}" y="122">curl H, plus J</text>`;
    fig.innerHTML = svg(215, s);
    return cap[k];
  });
}},
{s: "2. Watch it run", t: "The pulse goes in, gets shaped, and leaves",
intu: String.raw`This is a real 2D FDTD run of a toy splitter shaped like the PBS start design (a Y in the design box). The colour is \(E_z\): red positive, blue negative. Press Play. The pulse launched in the input strip reaches the design region, splits between the two arms, and leaves through the ports into the absorbing frame. The real PBS does the same in 3D with millions of cells, once with TE\(_0\) and once with TM\(_0\).`,
eq: String.raw`\[ \text{input} \rightarrow \text{design region} \rightarrow \text{ports} \rightarrow \text{PML} \]`,
sym: [["toy", "2D, Ez only, strips of index 2, 160 × 100 cells, λ = 30 cells in air"], ["frame", "absorbing layer, 12 cells"]],
how: ["The source adds the pulse on the input plane.", "Every cell is updated each step from its neighbours.", "The design region is just cells with a different permittivity."],
say: "In the forward run the pulse enters the input, is shaped by the design region, leaves through the ports and is absorbed in the PML.",
num: "The real PBS run: 3D, tens of millions of cells, the same updates.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="pl">Play</button><button id="ps">Pause</button><button id="rs">Restart</button></div><div class="readout" id="ro"></div>`;
  let P = LC7_pulseSim(), run = true;
  const { ctx, img } = C2.canvas(fig, P.T.nx, P.T.ny, 3.5, "E<sub>z</sub> of the toy splitter. Outlines: strips and design box.");
  const draw = () => {
    const T = P.T, sim = P.sim;
    for (let q = 0; q < T.nx * T.ny; q++) { const c = C2.color(sim.ez[q] * 6), o = q * 4, e = T.eps[q] > 1.5 ? 0.82 : 1; img.data[o] = c[0] * e; img.data[o + 1] = c[1] * e; img.data[o + 2] = c[2] * e; img.data[o + 3] = 255; }
    for (let j = T.yc - 25; j < T.yc + 25; j++) for (const i of [T.d0, T.d1 - 1]) { const o = (j * T.nx + i) * 4; img.data[o] = 120; img.data[o + 1] = 120; img.data[o + 2] = 120; }
    for (let i = T.d0; i < T.d1; i++) for (const j of [T.yc - 25, T.yc + 24]) { const o = (j * T.nx + i) * 4; img.data[o] = 120; img.data[o + 1] = 120; img.data[o + 2] = 120; }
    ctx.putImageData(img, 0, 0);
    let mq = 0, mv = 0; for (let q = 0; q < sim.ez.length; q++) { const v = Math.abs(sim.ez[q]); if (v > mv) { mv = v; mq = q; } }
    const ci = mq % T.nx, where = mv < 0.02 ? "gone into the PML" : ci < T.d0 ? "input strip" : ci < T.d1 ? "design region" : "output ports";
    $("ro").innerHTML = `<div><span>time step</span><b>${sim.t}</b></div><div><span>strongest field is in the</span><b>${where}</b></div>`;
  };
  $("pl").onclick = () => { run = true; }; $("ps").onclick = () => { run = false; }; $("rs").onclick = () => { P = LC7_pulseSim(); run = true; };
  anim(() => { if (!fig.isConnected) { stopAnim(); return; } if (run && P.sim.t < 1100) for (let i = 0; i < 4; i++) P.step(); draw(); });
}},
{s: "3. When to stop", t: "The run stops when the box is nearly empty",
intu: String.raw`The curve is the total field energy in the toy box during the run, on a log scale. It rises while the pulse comes in, then falls as the light leaves through the PML. The run stops when the energy drops below the shutoff fraction of its peak. Move the slider. Stopping too early cuts the Fourier transform of the next lesson short and spoils the spectrum. A device with a sharp resonance rings for a long time and needs a longer run.`,
eq: String.raw`\[ \text{stop when}\quad \frac{U(t)}{U_\mathrm{max}} \lt \text{shutoff} \quad\text{or}\quad t = t_\mathrm{run} \]`,
sym: [[String.raw`\(U(t)\)`, "total field energy in the box"], ["shutoff", "small fraction, for example 1e-5"], [String.raw`\(t_\mathrm{run}\)`, "upper limit set in the Simulation"]],
how: ["Track the energy in the box during the run.", "Find its peak.", "Stop once it is below the chosen fraction of the peak."],
say: "The run stops automatically once the field energy in the box has decayed below a small fraction of its peak, so the Fourier transform of the recorded fields is complete.",
num: "Tidy3D's default shutoff is 1e-5 (check the docs before quoting).",
r(fig, ctl) {
  ctl.innerHTML = sl("so", "Shutoff (log₁₀)", -7, -2, 0.5, -5) + `<div class="readout" id="ro"></div>`;
  const P = LC7_pulseSim(), E = []; for (let t = 0; t < 2400; t++) { P.step(); if (t % 6 === 0) E.push(P.energy()); }
  const mx = Math.max(...E), lg = E.map(v => Math.log10(Math.max(v / mx, 1e-9)));
  const u = () => {
    const so = +$("so").value; $("sov").textContent = "10^" + so; const ts = E.map((_, i) => i * 6);
    let ip = lg.indexOf(0), stop = ts.length - 1; for (let i = ip; i < lg.length; i++) if (lg[i] < so) { stop = i; break; }
    let s = C3.frame(70, 20, 560, 170, 0, 2400, -9, 0, [0, 600, 1200, 1800, 2400], [-8, -6, -4, -2, 0], "time step", "log₁₀ U / U_max") + plot(70, 20, 560, 170, ts, lg, 0, 2400, -9, 0, "var(--blue)", 2);
    const X = C3.X(70, 560, 0, 2400), Y = C3.Y(20, 170, -9, 0);
    s += `<line x1="70" x2="630" y1="${Y(so)}" y2="${Y(so)}" stroke="var(--coral)" stroke-dasharray="4 3"/><line x1="${X(ts[stop])}" x2="${X(ts[stop])}" y1="20" y2="190" stroke="var(--purple)" stroke-width="2"/><text class="ts" x="${X(ts[stop]) + 4}" y="36">stop</text>`;
    fig.innerHTML = svg(232, s);
    $("ro").innerHTML = `<div><span>stops at step</span><b>${ts[stop]}</b></div>`;
  };
  $("so").oninput = u; u();
}}
],
summary: String.raw`The forward run starts from zero fields and repeats the leapfrog: H from the curl of E, then E from the curl of H plus the source, half a step apart, cell by cell. The pulse enters, is shaped by the design region, leaves through the ports and is absorbed in the PML. The run stops when the field energy left in the box falls below the shutoff fraction of its peak. All of this is in time.`,
sheet: [
[String.raw`\[ \mathbf{H}^{n+\frac12} = \mathbf{H}^{n-\frac12} - \frac{\Delta t}{\mu_0}\nabla\times\mathbf{E}^{n} \]`, "Update H"],
[String.raw`\[ \mathbf{E}^{n+1} = \mathbf{E}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r}\Big(\nabla\times\mathbf{H}^{n+\frac12} - \mathbf{J}^{n+\frac12}\Big) \]`, "Update E, with the source"],
[String.raw`\[ U(t)/U_\mathrm{max} \lt \text{shutoff} \]`, "When to stop"]],
consts: "Toy: 160 × 100 cells, Courant number 0.5, strips of index 2, absorbing frame of 12 cells.",
sources: ["Taflove and Hagness, Computational Electrodynamics, 3rd ed. (2005), Ch. 3", "Tidy3D documentation: run_time and shutoff, Flexcompute", "Ch. 2 Sec. 2.6 of the thesis"]
});
