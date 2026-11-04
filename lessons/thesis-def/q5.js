/* Committee questions, lesson Q5: the adjoint method and the optimizer (Ch. 3 Sec. 3.1, 3.2 and 3.6).
   Every card is a whiteboard build: Back / Play / Next steps in the order of the how[] list. */

/* ---------- whiteboard helpers (prefix DQ5_) ---------- */
const DQ5_K = { ink: "#1f2933", mute: "#6b7684", soft: "#e8ecf2", blue: "#2f78c4", orange: "#D85A30", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", red: "#C0392B", gaas: "#cfdcec", pml: "#e9e4f5" };
const DQ5_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-family="Public Sans, system-ui, sans-serif" font-size="${o.fs || 13}" fill="${o.c || DQ5_K.ink}" text-anchor="${o.a || "start"}"${o.w ? ` font-weight="${o.w}"` : ""}${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ""}>${s}</text>`; };
const DQ5_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DQ5_K.ink}" stroke-width="${w || 1.6}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linecap="round"/>`;
const DQ5_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DQ5_K.ink, w || 1.8, d);
const DQ5_R = (x, y, w, h, f, s, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f || "none"}" stroke="${s || "none"}"${op !== undefined ? ` fill-opacity="${op}"` : ""}/>`;
const DQ5_sub = s => `<tspan baseline-shift="sub" font-size="9.5">${s}</tspan>`;
const DQ5_map = (a, b, A, B) => v => A + (v - a) / (b - a) * (B - A);
const DQ5_pl = (X, Y, xs, ys, c, w, d, fill) => { let s = ""; xs.forEach((x, i) => { const y = ys[i]; if (!isFinite(y)) return; s += (s ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); }); return `<path d="${s}" fill="${fill || "none"}" stroke="${c}" stroke-width="${w || 2}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linejoin="round"/>`; };
const DQ5_ax = (x0, y0, w, h, xl, yl) => DQ5_A(x0, y0 + h, x0 + w, y0 + h, DQ5_K.ink, 1.3) + DQ5_A(x0, y0 + h, x0, y0, DQ5_K.ink, 1.3) + (xl ? DQ5_T(x0 + w, y0 + h + 16, xl, { a: "end", fs: 12, c: DQ5_K.mute }) : "") + (yl ? DQ5_T(x0 + 6, y0 + 4, yl, { fs: 12, c: DQ5_K.mute }) : "");
const DQ5_dot = (x, y, r, c, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || c}" stroke="${c}" stroke-width="1.5"/>`;
const DQ5_pct = v => (100 * v).toFixed(v < 0.01 ? 2 : 1) + " %";

/* The board: steps with captions, Back / Play / Next, optional sliders, option buttons, readout and an equation strip. */
function DQ5_board(fig, ctl, o) {
  const n = o.cap.length, v = {}, opts = o.opts || [];
  let k = 1, play = false, tm = null;
  opts.forEach(g => v[g.key] = g.val);
  ctl.innerHTML = opts.map(g => `<div class="row"><label>${g.label}</label>${g.items.map(([val, tx]) => `<button data-${g.key}="${val}">${tx}</button>`).join("")}</div>`).join("")
    + (o.sl || []).map(s => sl(s[0], s[1], s[2], s[3], s[4], s[5])).join("")
    + `<div class="row"><button data-qb="b">Back</button><button data-qb="p">Play</button><button data-qb="n">Next</button><span class="dq5s" style="font-size:13px;color:var(--muted);margin-left:4px"></span></div>`
    + (o.ro ? `<div class="readout dq5r"></div>` : "");
  fig.innerHTML = `<div class="dq5b">${o.eqs ? `<div class="dq5e" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 16px;min-height:50px;font-size:16px;padding:6px 10px;margin-bottom:6px;background:var(--sunk);border-radius:8px">${o.eqs.map(([s, tx]) => `<span data-s="${s}" style="transition:opacity .4s">${tx}</span>`).join("")}</div>` : ""}<div class="dq5v"></div><p class="dq5c" style="font-size:14.5px;line-height:1.55;color:var(--fg);min-height:46px;margin:8px 2px 0"></p></div>`;
  const box = fig.querySelector(".dq5b"), vis = fig.querySelector(".dq5v"), cap = fig.querySelector(".dq5c"), stl = ctl.querySelector(".dq5s"), ro = ctl.querySelector(".dq5r");
  const B = q => ctl.querySelector(`button[data-qb="${q}"]`);
  if (o.eqs) typesetMath(fig.querySelector(".dq5e"));
  const read = () => (o.sl || []).forEach(s => { v[s[0]] = +$(s[0]).value; $(s[0] + "v").textContent = s[6] ? s[6](v[s[0]]) : v[s[0]]; });
  const render = t => {
    vis.innerHTML = svg(o.h, `<rect x="1" y="1" width="678" height="${o.h - 2}" rx="10" fill="#ffffff" stroke="#d3d9e2"/>` + o.draw(k, v, t || 0));
    const c = o.cap[k - 1]; cap.innerHTML = `<b>Step ${k}.</b> ` + (typeof c === "function" ? c(v) : c);
    stl.textContent = `step ${k} of ${n}`; B("b").disabled = k === 1; B("n").disabled = k === n; B("p").textContent = play ? "Pause" : "Play";
    if (o.eqs) fig.querySelectorAll(".dq5e span").forEach(e => e.style.opacity = +e.dataset.s <= k ? 1 : 0.12);
    if (ro) ro.innerHTML = o.ro(v, k).map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");
    opts.forEach(g => pick(ctl, g.key, v[g.key]));
  };
  const go = kk => { k = Math.max(1, Math.min(n, kk)); if (o.onStep) o.onStep(k, v); if (!o.live) render(); };
  const tick = () => { if (!box.isConnected || !play) return; if (k < n) { go(k + 1); tm = setTimeout(tick, o.dt || 3000); } else { play = false; if (!o.live) render(); } };
  B("b").onclick = () => { play = false; clearTimeout(tm); go(k - 1); if (o.live) render(); };
  B("n").onclick = () => { play = false; clearTimeout(tm); go(k + 1); if (o.live) render(); };
  B("p").onclick = () => { clearTimeout(tm); if (play) { play = false; render(); return; } play = true; if (k === n) go(1); render(); tm = setTimeout(tick, o.dt || 3000); };
  (o.sl || []).forEach(s => $(s[0]).oninput = () => { read(); if (o.onInput) o.onInput(v, s[0]); render(); });
  opts.forEach(g => ctl.querySelectorAll(`button[data-${g.key}]`).forEach(b => b.onclick = () => { v[g.key] = b.dataset[g.key]; if (o.onInput) o.onInput(v, g.key); render(); }));
  read(); if (o.init) o.init(v);
  if (o.live) anim(t => { if (!box.isConnected) { stopAnim(); return; } render(t); }); else render(0);
}


/* small helpers for this file */
const DQ5_div = v => { v = Math.max(-1, Math.min(1, v)); const c = C2.color(v); return `rgb(${c[0]},${c[1]},${c[2]})`; };
/* draw a scalar map (values in -1..1) as run-length rects, quantized to 17 levels */
const DQ5_mapRects = (vals, W, H, x0, y0, sc, colf) => {
  let s = "";
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const q = Math.round(vals[y * W + x] * 8); let e = x + 1; while (e < W && Math.round(vals[y * W + e] * 8) === q) e++; s += `<rect x="${(x0 + x * sc).toFixed(1)}" y="${(y0 + y * sc).toFixed(1)}" width="${((e - x) * sc + 0.4).toFixed(1)}" height="${(sc + 0.4).toFixed(1)}" fill="${colf(q / 8)}"/>`; x = e; } }
  return s;
};

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q5", title: "The adjoint method and the optimizer", short: "Q5. Adjoint and optimizer",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`The adjoint method is the engine of the thesis, and the committee will test whether you can derive it, not only use it. This lesson covers the eight questions most likely to come up about Ch. 3 Sec. 3.1, 3.2 and the optimizer of Sec. 3.6: why inverse design instead of a sweep, why not finite differences, the derivation of Eqs. (3.2) to (3.4) in a few lines, what the adjoint field is physically, why the pixel gradient is the product of two fields (Eq. 3.5), what changes for a moving boundary, what Adam's two moments do, and whether the result is a global optimum. Each card gives a short answer, a board drawing that builds step by step, a sentence to say aloud and the follow-up question with its answer.`,
bridge: "The derivation follows Michaels and Yablonovitch 2018, Eqs. (3), (8), (9), (11) and (12), quoted in Sec. 3.2 as Eqs. (3.2) to (3.4). The field-product form and the boundary rule follow Lalau-Keraly et al. 2013, Eq. (5) and Sec. 2, as evaluated by Tidy3D. The optimizer is Adam (Kingma and Ba 2015, Alg. 1) through optax with its default decay rates. Demos use a 1D wave problem solved live in the page and analytic illustrations, no thesis results.",
cards: [

/* ---------------- Q5.1 ---------------- */
{s: "Q5.1", t: "Why inverse design instead of a parameter sweep?",
intu: String.raw`A sweep evaluates the device on a grid of parameter values. With K values per parameter it needs \(K^N\) simulations, fine for the two numbers of a uniform grating but hopeless for the 18 widths of a non-uniform grating, the 81 taper points or the 48,400 PBS pixels. Inverse design writes the geometry as a parameter vector, gets the figure of merit and its gradient with respect to every parameter from one forward and one adjoint simulation, and climbs along the gradient (Fig. 3.1, Sec. 3.1). The cost per step does not grow with the number of parameters, so the design can have thousands of degrees of freedom and reach shapes nobody would think to sweep.`,
eq: String.raw`\[ \max_{\mathbf{p}}\; J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]<div class="eqref">Ch. 3 Eq. (3.1)</div>\[ \text{sweep: } K^{N} \qquad \text{finite differences: } 2N \text{ per step} \qquad \text{adjoint: } 2 \text{ per step} \]`,
sym: [[String.raw`\(\mathbf p\)`, "vector of design parameters"], [String.raw`\(F, P_k, w_k\)`, "figure of merit, penalties and their weights"], [String.raw`\(N\)`, "number of parameters"], [String.raw`\(K\)`, "values tried per parameter in a sweep"]],
how: ["Draw the loop of Fig. 3.1: parameters, forward simulation, figure of merit, adjoint simulation, gradient, optimizer update, and back to the parameters.", String.raw`For two parameters, draw the landscape of \(J\) as contours and a sweep grid of \(K \times K\) points on it.`, String.raw`Add parameters: the grid becomes \(K^N\) points. Write the number for the parameter counts of the thesis.`, "Draw the gradient path instead: a few arrows uphill from the start, each costing two simulations.", "Compare the counts on a log scale."],
say: "A sweep grows exponentially with the number of parameters, while the adjoint method gives the gradient with respect to all of them from two simulations. That is what makes designs with thousands of parameters possible.",
num: String.raw`K = 10: a uniform grating (2 parameters) needs 100 runs, 18 widths need \(10^{18}\).<br>Adjoint: <b>2</b> runs per step for any N. The PBS topology stage has 77 steps (11 levels of 7).`,
note: String.raw`<p><b>"So is sweeping useless?"</b></p><p>No. A sweep is the right tool for one or two parameters, for example the period and fill factor of a uniform grating, which Eq. (2.3) and a short scan can fix. That kind of simple working device is exactly where the inverse design starts (Sec. 3.1), so the two methods work together.</p>`,
r(fig, ctl) {
  const Jf = (x, y) => Math.exp(-((x - 0.35) ** 2 / 0.5 + (y - 0.25) ** 2 / 0.12 + 0.6 * (x - 0.35) * (y - 0.25)));
  const CAP = ["The loop of Fig. 3.1. Forward run gives the figure of merit, adjoint run gives its gradient, the optimizer moves the parameters.",
    v => `Two parameters, swept with K = ${v.q51K} values each: ${v.q51K ** 2} simulations to map the landscape.`,
    v => `With N parameters the grid has K^N points. N = ${v.np}: ${v.q51K}^${v.np} simulations.`,
    "The gradient path: each arrow is one optimizer step and costs two simulations, whatever the number of parameters.",
    "The cost on a log scale, for the chosen N and 100 optimizer steps."];
  DQ5_board(fig, ctl, { h: 340, cap: CAP,
    opts: [{ key: "np", label: "Parameters", val: "18", items: [["2", "2 (uniform)"], ["18", "18 (widths)"], ["81", "81 (taper)"], ["395", "395 (outline)"], ["48400", "48,400 (pixels)"]] }],
    sl: [["q51K", "Values per parameter K", 3, 20, 1, 10, x => x.toFixed(0)]],
    draw: (k, v) => {
      const K = DQ5_K; let s = "";
      if (k === 1) {
        const bx = (x, y, w, t, c) => DQ5_R(x, y, w, 40, "#fff", c) + DQ5_T(x + w / 2, y + 25, t, { a: "middle", c, fs: 13 });
        s += bx(40, 40, 150, "parameters p", K.ink) + bx(260, 40, 170, "forward run", K.blue) + bx(500, 40, 140, "F(p)", K.blue);
        s += bx(260, 150, 170, "adjoint run", K.orange) + bx(500, 150, 140, "∂J/∂p", K.orange) + bx(40, 150, 150, "Adam update", K.teal);
        s += DQ5_A(190, 60, 256, 60) + DQ5_A(430, 60, 496, 60) + DQ5_A(570, 80, 570, 146) + DQ5_A(345, 80, 345, 146, K.mute, 1.4, "4 3") + DQ5_A(496, 170, 434, 170, K.ink, 1.6) + DQ5_A(256, 170, 194, 170) + DQ5_A(115, 150, 115, 84);
        s += DQ5_T(350, 118, "stored fields", { fs: 11, c: K.mute }) + DQ5_T(340, 250, "two simulations per step, for all parameters at once", { a: "middle", fs: 14, w: 600 });
        return s;
      }
      const X = DQ5_map(-1.5, 2, 60, 360), Y = DQ5_map(-1, 1.4, 300, 30);
      if (k <= 4) {
        for (const lev of [0.1, 0.3, 0.5, 0.7, 0.9]) { let d = ""; for (let a = 0; a <= 360; a += 4) { let lo = 0, hi = 3; const th = a * Math.PI / 180; for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if (Jf(0.35 + m * Math.cos(th), 0.25 + m * Math.sin(th)) > lev) lo = m; else hi = m; } d += (d ? "L" : "M") + X(0.35 + lo * Math.cos(th)).toFixed(1) + " " + Y(0.25 + lo * Math.sin(th)).toFixed(1); } s += `<path d="${d}Z" fill="none" stroke="#9aa4b2" stroke-width="1.1"/>`; }
        s += DQ5_T(64, 324, "p₁", { fs: 12, c: K.mute }) + DQ5_T(40, 36, "p₂", { fs: 12, c: K.mute }) + DQ5_R(60, 30, 300, 270, "none", "#d3d9e2");
        if (k >= 2) { const n = v.q51K; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += DQ5_dot(X(-1.5 + 3.5 * (i + 0.5) / n), Y(-1 + 2.4 * (j + 0.5) / n), 2.2, K.blue); }
        if (k >= 3) s += DQ5_T(390, 80, `N = ${v.np}`, { fs: 16, w: 600 }) + DQ5_T(390, 110, `sweep: ${v.q51K}^${v.np} = 10^${(v.np * Math.log10(v.q51K)).toFixed(0)} runs`, { fs: 15, c: K.blue });
        if (k >= 4) { let x = -1.2, y = -0.7; const pts = [[x, y]]; for (let i = 0; i < 9; i++) { const h = 1e-4, gx = (Jf(x + h, y) - Jf(x - h, y)) / (2 * h), gy = (Jf(x, y + h) - Jf(x, y - h)) / (2 * h), n = Math.hypot(gx, gy) || 1; x += 0.22 * gx / n; y += 0.22 * gy / n; pts.push([x, y]); } for (let i = 1; i < pts.length; i++) s += DQ5_A(X(pts[i - 1][0]), Y(pts[i - 1][1]), X(pts[i][0]), Y(pts[i][1]), K.orange, 2.2); s += DQ5_T(390, 150, "gradient path: 2 runs per arrow", { fs: 15, c: K.orange }); }
        return s;
      }
      const N = +v.np, Kv = v.q51K, steps = 100, vals = [["sweep K^N", N * Math.log10(Kv), K.blue], ["finite differences 2N × steps", Math.log10(2 * N * steps), K.purple], ["adjoint 2 × steps", Math.log10(2 * steps), K.orange]];
      const mx = Math.max(20, vals[0][1]);
      s += DQ5_T(40, 40, `simulations needed, N = ${N} (log scale, 100 steps)`, { fs: 13, c: K.mute });
      vals.forEach(([lab, lg, c], j) => { const y = 70 + j * 70, w = Math.max(3, 420 * Math.min(lg, 20) / 20); s += DQ5_T(40, y - 6, lab, { fs: 13 }) + DQ5_R(40, y, w, 28, c, null, 0.7) + DQ5_T(48 + w, y + 19, lg > 20 ? `10^${lg.toFixed(0)} (off the chart)` : `10^${lg.toFixed(1)}`, { fs: 13, c }); });
      return s;
    },
    ro: v => [["sweep", `10^${(+v.np * Math.log10(v.q51K)).toFixed(1)}`], ["finite differences per step", (2 * v.np).toLocaleString("en-US")], ["adjoint per step", "2"]]
  });
}},

/* ---------------- Q5.2 ---------------- */
{s: "Q5.2", t: "Why not compute the gradient by finite differences?",
intu: String.raw`Finite differences change one parameter slightly up and down and rerun the simulation. That is two simulations per parameter, \(2N\) per optimization step, which is impractical with thousands of parameters (Sec. 3.2). For the PBS, with 48,400 pixels and two polarizations, it would be almost 200,000 3D runs for a single step. The step size is a second problem: too large and the difference is not the derivative, too small and numerical noise dominates. The adjoint method gives all N derivatives from one forward and one adjoint run, exactly to the accuracy of the solver.`,
eq: String.raw`\[ \frac{\partial F}{\partial p_i} \approx \frac{F(\mathbf p + h\,\hat{\mathbf e}_i) - F(\mathbf p - h\,\hat{\mathbf e}_i)}{2h}, \qquad i = 1, \dots, N \]\[ \text{error} \approx \underbrace{\frac{h^2}{6}\,\frac{\partial^3 F}{\partial p_i^3}}_{\text{truncation}} + \underbrace{\frac{\delta}{h}}_{\text{noise}} \]<div class="eqnote">\(\delta\) is the numerical noise of one evaluation of F.</div><div class="eqref">Ch. 3 Sec. 3.2</div>`,
sym: [[String.raw`\(\hat{\mathbf e}_i\)`, "unit vector of parameter i"], [String.raw`\(h\)`, "step size of the difference"], [String.raw`\(\delta\)`, "noise of one simulation, from finite precision and convergence"]],
how: ["Draw the device: a row of pixels between the source and the output monitor, and the output F of the current design.", String.raw`Nudge pixel i up by \(h\) and rerun, then down by \(h\) and rerun. Two simulations.`, String.raw`The difference divided by \(2h\) is one bar of the gradient.`, String.raw`Repeat for every pixel: \(2N\) simulations for one gradient.`, "Now the adjoint: one forward and one adjoint run give all the bars at once, and they match.", String.raw`Plot the finite-difference error against \(h\): large \(h\) gives truncation error, tiny \(h\) gives noise. Only a narrow window works.`],
say: "Finite differences need two simulations per parameter, so a gradient with N parameters costs 2N runs, and the answer depends on a step size that is hard to choose. The adjoint method gives every derivative from two runs.",
num: String.raw`PBS: 48,400 pixels × 2 polarizations → <b>193,600</b> runs per step by finite differences, <b>4</b> with the adjoint method (forward and adjoint for each polarization, Sec. 3.4).<br>Demo: 30 pixels, \(\varepsilon\) from 1 to 12.25, one wavelength of 800 nm.`,
note: String.raw`<p><b>"How do you know an adjoint gradient is right?"</b></p><p>Compare it with finite differences on a handful of parameters, using a step size in the flat part of the error curve. A wrong sign or a missing factor shows up at once, as in this card. In the thesis the gradient comes from the automatic differentiation of Tidy3D (Sec. 3.2), which runs the forward and adjoint simulations and applies the chain rule through the parameterization.</p>`,
r(fig, ctl) {
  const Nd = 30, lam = 800, dev = new C3.Dev1D({ Nd, dx: 10, pad: 40, eMax: 12.25 }), de = 12.25 - 1;
  const rg = C3.rng(11), rho = Float64Array.from({ length: Nd }, (_, i) => 0.15 + 0.7 * rg());
  const base = dev.T(rho, lam, true), gA = Array.from(base.grad, g => g * de);
  const fd = (i, h) => { const p = Float64Array.from(rho); p[i] += h; const Tp = dev.T(p, lam).T; p[i] -= 2 * h; const Tm = dev.T(p, lam).T; return (Tp - Tm) / (2 * h); };
  let gF = null, errC = null, hNow = null, iNow = null;
  const comp = v => { const h = Math.pow(10, v.q52h); if (h !== hNow) { gF = Array.from({ length: Nd }, (_, i) => fd(i, h)); hNow = h; } if (v.q52i !== iNow) { const hs = range(-13, -0.5, 26); errC = hs.map(lh => Math.abs(fd(v.q52i, Math.pow(10, lh)) - gA[v.q52i]) / (Math.abs(gA[v.q52i]) + 1e-12)); iNow = v.q52i; } };
  const CAP = [v => `The design: ${Nd} pixels between the source and the monitor. Output F = T = ${base.T.toFixed(4)}.`,
    v => `Nudge pixel ${v.q52i + 1} up by h and down by h: two simulations.`,
    v => `(F₊ − F₋)/2h = ${gF[v.q52i].toFixed(4)}: one bar of the gradient.`,
    `All ${Nd} bars: ${2 * Nd} simulations for one gradient. With 48,400 pixels this is impossible.`,
    "The adjoint method (orange dots): one forward and one adjoint run give every bar, and they agree.",
    v => `Error of the finite difference against h for pixel ${v.q52i + 1}. Too large: truncation. Too small: round-off noise. Now h = 10^${v.q52h}.`];
  DQ5_board(fig, ctl, { h: 390, cap: CAP,
    sl: [["q52i", "Pixel i", 0, Nd - 1, 1, 12, x => (x + 1).toFixed(0)], ["q52h", "log₁₀ of step h", -12, -1, 0.5, -4, x => x.toFixed(1)]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ5_K; let s = "";
      const x0 = 120, pw = 440 / Nd;
      s += DQ5_T(30, 58, "source →", { fs: 12, c: K.amber }) + DQ5_T(570, 58, "→ monitor", { fs: 12, c: K.teal });
      for (let i = 0; i < Nd; i++) s += DQ5_R(x0 + i * pw, 36, pw - 1, 36, K.blue, null, 0.12 + 0.8 * rho[i]);
      s += DQ5_R(x0, 36, 440, 36, "none", "#9aa4b2");
      if (k >= 2 && k <= 3) { const xi = x0 + v.q52i * pw; s += DQ5_R(xi - 1, 32, pw + 1, 44, "none", K.orange) + DQ5_T(xi + pw / 2, 92, "±h", { fs: 12, a: "middle", c: K.orange }); }
      const gy = 130, gh = 150, mx = Math.max(...gA.map(Math.abs)) * 1.15, Y = DQ5_map(-mx, mx, gy + gh, gy);
      if (k >= 3) {
        s += DQ5_L(x0, Y(0), x0 + 440, Y(0), "#9aa4b2", 1) + DQ5_T(30, gy + 10, "∂F/∂ρᵢ", { fs: 12, c: K.mute });
        const show = k === 3 ? [v.q52i] : [...Array(Nd).keys()];
        show.forEach(i => { const g = Math.max(-mx, Math.min(mx, gF[i])); s += DQ5_R(x0 + i * pw + 1, Math.min(Y(0), Y(g)), pw - 3, Math.abs(Y(g) - Y(0)), K.blue, null, 0.75); });
      }
      if (k >= 5) gA.forEach((g, i) => s += DQ5_dot(x0 + (i + 0.5) * pw, Y(g), 3.5, K.orange));
      const runs = k === 1 ? 1 : k <= 3 ? 2 : 2 * Nd;
      s += DQ5_T(30, 112, k >= 5 ? `finite differences: ${2 * Nd} runs     adjoint: 2 runs` : `simulations so far: ${runs}`, { fs: 13, w: 600 });
      if (k >= 6) {
        const px = 120, py = 300, pwd = 440, ph = 70, HX = DQ5_map(-13, -0.5, px, px + pwd), EY = DQ5_map(-8, 1, py + ph, py), hs = range(-13, -0.5, 26);
        s += DQ5_ax(px, py, pwd, ph, "log₁₀ h", "log₁₀ relative error");
        s += DQ5_pl(HX, EY, hs, errC.map(e => Math.max(-8, Math.min(1, Math.log10(e + 1e-16)))), K.purple, 2);
        s += DQ5_L(HX(v.q52h), py, HX(v.q52h), py + ph, K.orange, 1.4, "4 3");
        [-12, -8, -4, -1].forEach(t => s += DQ5_T(HX(t), py + ph + 13, t, { fs: 10, a: "middle", c: K.mute }));
      }
      return s;
    },
    ro: v => { const e = Math.max(...gF.map((g, i) => Math.abs(g - gA[i]))) / Math.max(...gA.map(Math.abs)); return [["T of the design", base.T.toFixed(4)], ["max FD error / max gradient", e < 1e-3 ? e.toExponential(1) : DQ5_pct(e)], ["runs: FD versus adjoint", `${2 * Nd} versus 2`]]; }
  });
}},

/* ---------------- Q5.3 ---------------- */
{s: "Q5.3", t: "Derive the adjoint gradient in a few lines",
intu: String.raw`At one frequency the discretized Maxwell equations are a linear system \(A\mathbf x = \mathbf b\), where \(A\) holds the curls and the permittivity and therefore depends on the parameters (Eq. 3.2). Differentiating it gives \(\partial\mathbf x/\partial p_i = -A^{-1}(\partial A/\partial p_i)\mathbf x\), one solve per parameter. Put this into the chain rule for the real figure of merit, \(dF/dp_i = 2\,\mathrm{Re}\{(\partial F/\partial\mathbf x)\,\partial\mathbf x/\partial p_i\}\). The trick is only the order of multiplication: the row vector \((\partial F/\partial\mathbf x)A^{-1}\) is the same for every parameter, so compute it once by solving the adjoint system \(A^T\mathbf y = (\partial F/\partial\mathbf x)^T\) (Eq. 3.3). Every derivative is then the cheap product of Eq. (3.4).`,
eq: String.raw`\[ A(\mathbf{p})\,\mathbf{x} = \mathbf{b} \quad\Rightarrow\quad \frac{\partial \mathbf x}{\partial p_i} = -A^{-1}\frac{\partial A}{\partial p_i}\,\mathbf x \]\[ \frac{dF}{dp_i} = 2\,\mathrm{Re}\left\{\frac{\partial F}{\partial \mathbf x}\,\frac{\partial \mathbf x}{\partial p_i}\right\} = -2\,\mathrm{Re}\Big\{\underbrace{\frac{\partial F}{\partial \mathbf x}A^{-1}}_{\mathbf y^{T}}\,\frac{\partial A}{\partial p_i}\,\mathbf x\Big\} \]\[ A^{T}\,\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T}, \qquad \frac{\partial F}{\partial p_i} = -2\,\mathrm{Re}\left\{ \mathbf{y}^{T}\,\frac{\partial A}{\partial p_i}\,\mathbf{x}\right\} \]<div class="eqref">Ch. 3 Eqs. (3.2) to (3.4), Michaels and Yablonovitch 2018, Eqs. (3), (8), (9), (11) and (12)</div>`,
sym: [[String.raw`\(\mathbf x\)`, "all field values on the grid (M unknowns)"], [String.raw`\(\mathbf b\)`, "the source"], [String.raw`\(A\)`, "M × M matrix of curls, permittivity and permeability"], [String.raw`\(\mathbf y\)`, "adjoint field"], [String.raw`\(\partial F/\partial \mathbf x\)`, "row vector, derivative of F with respect to the fields"]],
how: [String.raw`Write \(A\mathbf x = \mathbf b\) and draw the shapes: a square matrix, two columns.`, String.raw`Differentiate with respect to \(p_i\) (the source does not depend on it): \((\partial A/\partial p_i)\mathbf x + A\,\partial\mathbf x/\partial p_i = 0\), so \(\partial\mathbf x/\partial p_i = -A^{-1}(\partial A/\partial p_i)\mathbf x\). One solve for each i.`, String.raw`Chain rule: F is real but depends on \(\mathbf x\) and \(\mathbf x^*\), so \(dF = 2\,\mathrm{Re}\{(\partial F/\partial \mathbf x)\,d\mathbf x\}\).`, String.raw`Substitute: row vector times \(A^{-1}\) times \((\partial A/\partial p_i)\mathbf x\). Bracket it from the right and you need N solves.`, String.raw`Bracket it from the left: \(\mathbf y^T = (\partial F/\partial\mathbf x)A^{-1}\), which is the same for all i. Transpose: \(A^T\mathbf y = (\partial F/\partial\mathbf x)^T\), one extra solve.`, String.raw`Result, Eq. (3.4): every derivative is a product of fields you already have. Two solves in total.`],
say: "Differentiating A x = b gives the field change for each parameter, which would need one solve each. Grouping the product from the left defines the adjoint field y through A transpose y equals dF/dx, so one extra solve gives the derivative with respect to every parameter.",
num: String.raw`M unknowns: all field components at all grid points, tens of millions in 3D. N parameters.<br>Bracket from the right: \(N + 1\) solves. From the left: <b>2</b> solves.`,
note: String.raw`<p><b>"Why \(A^T\) and not the conjugate transpose?"</b></p><p>Because \(\partial F/\partial\mathbf x\) is a plain row vector, and moving \(A^{-1}\) to the other side of \(\mathbf y^T = (\partial F/\partial\mathbf x)A^{-1}\) gives \(A^T\mathbf y = (\partial F/\partial\mathbf x)^T\). For reciprocal materials, written as the curl-curl equation for E, \(A\) is symmetric, so the adjoint problem is the same Maxwell problem on the same structure with a different source. That is why Tidy3D runs it as a second simulation (Sec. 3.2).</p>`,
r(fig, ctl) {
  const T = String.raw;
  const EQ = [[1, T`\(A\mathbf x = \mathbf b\)`], [2, T`\(\dfrac{\partial \mathbf x}{\partial p_i} = -A^{-1}\dfrac{\partial A}{\partial p_i}\mathbf x\)`], [3, T`\(\dfrac{dF}{dp_i} = 2\,\mathrm{Re}\Big\{\dfrac{\partial F}{\partial \mathbf x}\dfrac{\partial \mathbf x}{\partial p_i}\Big\}\)`], [4, T`\(= -2\,\mathrm{Re}\Big\{\dfrac{\partial F}{\partial \mathbf x}A^{-1}\dfrac{\partial A}{\partial p_i}\mathbf x\Big\}\)`], [5, T`\(A^{T}\mathbf y = \Big(\dfrac{\partial F}{\partial \mathbf x}\Big)^{T}\)`], [6, T`\(\dfrac{\partial F}{\partial p_i} = -2\,\mathrm{Re}\{\mathbf y^{T}\dfrac{\partial A}{\partial p_i}\mathbf x\}\)`]];
  const CAP = ["Eq. (3.2): the whole simulation at one frequency is one linear system. A is M × M, x and b are columns.",
    "Differentiate. The field change for parameter i needs its own solve with A, so N parameters need N solves.",
    "F is real, so its change is twice the real part of the row vector ∂F/∂x times the field change.",
    "Substitute. The product is row × inverse × column. Bracketing from the right costs one solve per parameter.",
    "Bracket from the left instead. The row (∂F/∂x)A⁻¹ does not depend on i. Call it yᵀ and find it with one adjoint solve.",
    v => `Eq. (3.4): each derivative is now a cheap product. For N = ${v.q53N.toLocaleString("en-US")} parameters: ${(v.q53N + 1).toLocaleString("en-US")} solves the direct way, 2 the adjoint way.`];
  DQ5_board(fig, ctl, { h: 300, cap: CAP, eqs: EQ,
    sl: [["q53N", "Parameters N", 2, 50000, 1, 48400, x => x.toLocaleString("en-US")]],
    draw: (k, v) => {
      const K = DQ5_K; let s = "";
      const sq = (x, y, w, h, c, lab, f) => DQ5_R(x, y, w, h, f || "#fff", c) + DQ5_T(x + w / 2, y + h / 2 + 5, lab, { a: "middle", c, fs: 14 });
      if (k <= 2) {
        s += sq(150, 40, 130, 130, K.ink, "A") + sq(300, 40, 26, 130, K.blue, "x") + DQ5_T(345, 110, "=", { fs: 22 }) + sq(370, 40, 26, 130, K.amber, "b");
        s += DQ5_T(215, 194, "M × M", { fs: 12, a: "middle", c: K.mute }) + DQ5_T(313, 194, "M", { fs: 12, a: "middle", c: K.mute });
        if (k === 2) { for (let i = 0; i < 6; i++) s += DQ5_R(440 + i * 34, 40, 26, 130, K.purple, K.purple, 0.15); s += DQ5_T(530, 194, "∂x/∂pᵢ for i = 1 … N", { fs: 12, a: "middle", c: K.purple }) + DQ5_T(530, 220, "one solve each", { fs: 14, a: "middle", c: K.purple, w: 600 }); }
        return s;
      }
      const row = (x, y, c, lab) => DQ5_R(x, y, 130, 24, "#fff", c) + DQ5_T(x + 65, y + 17, lab, { a: "middle", c, fs: 13 });
      const y0 = 60;
      s += row(40, y0 + 53, K.teal, "∂F/∂x");
      if (k >= 4) s += sq(185, y0, 130, 130, K.ink, "A⁻¹") + sq(330, y0, 130, 130, K.purple, "∂A/∂pᵢ", "#f4f2fc") + sq(475, y0, 26, 130, K.blue, "x");
      else s += sq(185, y0 + 53, 26, 24, K.purple, "") + DQ5_T(240, y0 + 70, "∂x/∂pᵢ", { fs: 13, c: K.purple });
      if (k === 4) s += `<path d="M180 ${y0 - 14} L180 ${y0 - 22} L506 ${y0 - 22} L506 ${y0 - 14}" fill="none" stroke="${K.ink}" stroke-width="1.2"/>` + `<path d="M180 ${y0 + 150} Q340 ${y0 + 172} 506 ${y0 + 150}" fill="none" stroke="${K.red}" stroke-width="1.6"/>` + DQ5_T(343, y0 + 190, "bracket from the right: a new solve for every i", { fs: 13, a: "middle", c: K.red });
      if (k >= 5) s += `<path d="M36 ${y0 + 150} Q178 ${y0 + 176} 318 ${y0 + 150}" fill="none" stroke="${K.orange}" stroke-width="2"/>` + DQ5_T(178, y0 + 194, "yᵀ: one adjoint solve, shared by every i", { fs: 13, a: "middle", c: K.orange, w: 600 });
      if (k >= 6) s += DQ5_T(560, y0 + 40, "solves:", { fs: 13, c: K.mute }) + DQ5_T(560, y0 + 66, `direct ${(v.q53N + 1).toLocaleString("en-US")}`, { fs: 14, c: K.red }) + DQ5_T(560, y0 + 92, "adjoint 2", { fs: 14, c: K.orange, w: 600 });
      return s;
    },
    ro: v => [["direct solves", (v.q53N + 1).toLocaleString("en-US")], ["adjoint solves", "2"]]
  });
}},

/* ---------------- Q5.4 ---------------- */
{s: "Q5.4", t: "What is the adjoint field, physically?",
intu: String.raw`It is the wanted output sent backward into the device. When the figure of merit is built from a mode amplitude, the adjoint source is the same output mode launched backward from the monitor plane, with a complex amplitude at each frequency set by the derivative of \(J\) with respect to that amplitude (Sec. 3.2). For \(F = |a|^2\) that derivative is \(a^*\), the conjugate of what arrived, so the adjoint field is the arriving light reversed in time. Wherever the forward field and this reversed output overlap with the right phase, adding material helps convert one into the other. The adjoint run is the same structure, only with this new source.`,
eq: String.raw`\[ F = |a_m|^2 \quad\Rightarrow\quad \frac{\partial F}{\partial a_m} = a_m^{*} \]\[ \bar T = \sum_i w_i\,|a_m(\lambda_i)|^2 \quad\Rightarrow\quad \text{adjoint source at } \lambda_i \;\propto\; w_i\, a_m^{*}(\lambda_i) \]<div class="eqref">Ch. 3 Sec. 3.2, Lalau-Keraly et al. 2013, Eqs. (8) and (9), with the band weights of Eq. (3.13)</div>`,
sym: [[String.raw`\(a_m\)`, "amplitude of the output mode at the monitor (Eq. 3.12)"], [String.raw`\(a_m^{*}\)`, "its complex conjugate: same size, opposite phase"], [String.raw`\(w_i\)`, "Gaussian band weight of wavelength i"]],
how: ["Draw the device: a source on the left, the design region in the middle, the output monitor on the right.", "Forward run: the field travels right through the design region.", String.raw`At the monitor, read the output amplitude \(a\) as a phasor. The figure of merit is \(|a|^2\).`, String.raw`Adjoint run: launch the output mode backward from the monitor with amplitude \(a^*\). Its field travels left through the same design region.`, String.raw`At each pixel multiply the two fields: \(\mathrm{Re}\{E_{\mathrm{fwd}}E_{\mathrm{adj}}\}\). Positive means more GaAs there raises F.`, "Check it: add a little permittivity to the most positive pixel and rerun. F rises by the predicted amount."],
say: "The adjoint field is the desired output launched backward from the monitor, with the conjugate amplitude, so it is the output played in reverse. Where it overlaps in phase with the forward field, adding material increases the coupling into the output.",
num: String.raw`Two runs per optimization step for one input, whatever the number of parameters. For a band objective, one adjoint run carries all wavelengths, each with weight \(w_i\) and amplitude \(a^*(\lambda_i)\).<br>Demo: 60 pixels of 10 nm holding four 30 nm GaAs layers (\(\varepsilon = 12.25\)) in air.`,
note: String.raw`<p><b>"Why do people call it time reversal?"</b></p><p>At a single frequency, taking the complex conjugate of a field is the same as running it backward in time. The adjoint source is the arrived output conjugated and sent back in, so it retraces the path the light should take, in reverse. By reciprocity, the adjoint field at a point also tells how strongly a small dipole placed there would radiate into the output mode, which is why it measures sensitivity.</p>`,
r(fig, ctl) {
  const Nd = 60, dev = new C3.Dev1D({ Nd, dx: 10, pad: 40, eMax: 12.25 });
  const rho = Float64Array.from({ length: Nd }, (_, i) => (i % 15) < 3 ? 1 : 0);
  let res = null, chk = null, kPrev = 0, tK = 0;
  const comp = v => { res = dev.T(rho, v.q54l, true); let ib = 0; res.grad.forEach((g, i) => { if (g > res.grad[ib]) ib = i; }); const de = 0.05, p = Float64Array.from(rho); p[ib] += de / (12.25 - 1); chk = { ib, pred: res.grad[ib] * de, act: dev.T(p, v.q54l).T - res.T }; };
  const N = dev.N, X = DQ5_map(0, N - 1, 50, 630);
  const CAP = ["The device: source on the left, design region of GaAs layers in the middle, monitor on the right.",
    "Forward run: the field (blue, animated in time) enters from the left. Part is reflected by the layers, part reaches the monitor.",
    v => `At the monitor: amplitude a, F = |a|² = ${res.T.toFixed(3)} (relative to the empty domain).`,
    "Adjoint run: the output mode is launched backward from the monitor with amplitude a* (orange). Same structure, new source.",
    "The sensitivity at each pixel is Re{E_fwd · E_adj}: red bars, add GaAs. Blue bars, remove it.",
    v => `Check: add Δε = 0.05 at pixel ${chk.ib + 1}. Predicted ΔF = ${chk.pred.toExponential(2)}, actual ${chk.act.toExponential(2)}.`];
  DQ5_board(fig, ctl, { h: 360, cap: CAP, live: true,
    sl: [["q54l", "Wavelength (nm)", 700, 900, 5, 800, x => x.toFixed(0) + " nm"]],
    init: comp, onInput: comp,
    draw: (k, v, t) => {
      const K = DQ5_K; let s = "";
      const ph = 2 * Math.PI * 0.6 * t, c = Math.cos(ph), sn = Math.sin(ph);
      for (let i = 0; i < Nd; i++) if (rho[i] > 0.5) s += DQ5_R(X(dev.pad + i - 0.5), 30, X(1) - X(0) + 0.3, 200, K.gaas);
      s += DQ5_L(X(dev.src), 30, X(dev.src), 230, K.amber, 1.4, "4 3") + DQ5_T(X(dev.src), 24, "source", { fs: 11, a: "middle", c: K.amber });
      s += DQ5_L(X(dev.out), 30, X(dev.out), 230, K.teal, 1.4, "4 3") + DQ5_T(X(dev.out), 24, "monitor", { fs: 11, a: "middle", c: K.teal });
      const xs = range(0, N - 1, N);
      const mF = Math.max(...xs.map(i => Math.hypot(res.fwd.re[i], res.fwd.im[i]))), mA = Math.max(...xs.map(i => Math.hypot(res.adj.re[i], res.adj.im[i])));
      const Yf = DQ5_map(-1.1, 1.1, 120, 40), Ya = DQ5_map(-1.1, 1.1, 220, 140);
      s += DQ5_L(50, Yf(0), 630, Yf(0), "#c3cad4", 0.8) + DQ5_L(50, Ya(0), 630, Ya(0), "#c3cad4", 0.8);
      if (k >= 2) s += DQ5_pl(X, Yf, xs, xs.map(i => (res.fwd.re[i] * c + res.fwd.im[i] * sn) / mF), K.blue, 1.8) + DQ5_T(54, 52, "forward", { fs: 12, c: K.blue });
      if (k >= 3) { const a = [res.fwd.re[dev.out], res.fwd.im[dev.out]], m = Math.hypot(a[0], a[1]), cx = 600, cy = 270, R = 26; s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#c3cad4"/>` + DQ5_A(cx, cy, cx + R * a[0] / m, cy - R * a[1] / m, K.blue, 2) + DQ5_T(cx, cy + R + 14, "a", { fs: 12, a: "middle", c: K.blue }); if (k >= 4) s += DQ5_A(cx, cy, cx + R * a[0] / m, cy + R * a[1] / m, K.orange, 2) + DQ5_T(cx + 34, cy + 4, "a*", { fs: 12, c: K.orange }); }
      if (k >= 4) s += DQ5_pl(X, Ya, xs, xs.map(i => (res.adj.re[i] * c + res.adj.im[i] * sn) / mA), K.orange, 1.8) + DQ5_T(54, 152, "adjoint", { fs: 12, c: K.orange });
      if (k >= 5) {
        const gy = 300, mg = Math.max(...res.grad.map(Math.abs));
        s += DQ5_L(X(dev.pad - 0.5), gy, X(dev.pad + Nd - 0.5), gy, "#9aa4b2", 1) + DQ5_T(54, gy - 30, "∂F/∂ε per pixel", { fs: 12, c: K.mute });
        for (let i = 0; i < Nd; i++) { const g = res.grad[i] / mg, hgt = 42 * g; s += DQ5_R(X(dev.pad + i - 0.4), Math.min(gy, gy - hgt), X(1) - X(0) - 1, Math.abs(hgt), g > 0 ? K.red : K.blue, null, 0.75); }
        if (k >= 6) s += DQ5_R(X(dev.pad + chk.ib - 0.6), gy - 48, X(1) - X(0) + 2, 96, "none", K.ink);
      }
      return s;
    },
    ro: () => [["F = |a|²", res.T.toFixed(4)], ["predicted ΔF", chk.pred.toExponential(2)], ["actual ΔF", chk.act.toExponential(2)]]
  });
}},

/* ---------------- Q5.5 ---------------- */
{s: "Q5.5", t: "Why is the gradient for a pixel the product of the forward and adjoint fields?",
intu: String.raw`Because a pixel's permittivity appears in only one place in the matrix \(A\). Written as the curl-curl equation for E, \(A = \nabla\times\nabla\times - k_0^2\,\varepsilon(\mathbf r)\), so \(\partial A/\partial\varepsilon(\mathbf r)\) has a single nonzero diagonal entry at \(\mathbf r\). The product \(\mathbf y^T(\partial A/\partial\varepsilon)\mathbf x\) of Eq. (3.4) then picks out the two fields at that one point, so the gradient is \(\mathbf E_{\mathrm{fwd}}\cdot\mathbf E_{\mathrm{adj}}\) at \(\mathbf r\), summed over the stored frequencies (Eq. 3.5). The constants are absorbed into the adjoint source. Physically, a small \(\delta\varepsilon\) at \(\mathbf r\) is a tiny dipole driven by the forward field, and the adjoint field says how well a dipole there radiates into the output.`,
eq: String.raw`\[ A = \nabla\times\nabla\times{} - k_0^2\,\varepsilon(\mathbf r) \quad\Rightarrow\quad \mathbf y^{T}\frac{\partial A}{\partial \varepsilon(\mathbf r)}\,\mathbf x = -k_0^2\,\mathbf E_{\mathrm{adj}}(\mathbf r)\cdot\mathbf E_{\mathrm{fwd}}(\mathbf r) \]\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \mathrm{Re} \sum_{f} \mathbf{E}_\mathrm{fwd}(\mathbf{r}, f) \cdot \mathbf{E}_\mathrm{adj}(\mathbf{r}, f) \]<div class="eqref">Ch. 3 Eq. (3.5), Lalau-Keraly et al. 2013, Eq. (5), as evaluated by Tidy3D</div>`,
sym: [[String.raw`\(\mathbf E_{\mathrm{fwd}}, \mathbf E_{\mathrm{adj}}\)`, "forward and adjoint fields stored in the design region"], [String.raw`\(f\)`, "stored frequencies of the objective"], [String.raw`\(k_0\)`, "vacuum wavenumber"]],
how: [String.raw`Write \(A = \nabla\times\nabla\times - k_0^2\varepsilon\) and draw the matrix: \(\partial A/\partial\varepsilon(\mathbf r)\) is zero except one diagonal entry at \(\mathbf r\).`, String.raw`So \(\mathbf y^T(\partial A/\partial\varepsilon)\mathbf x\) collapses to \(-k_0^2\,\mathbf y(\mathbf r)\cdot\mathbf x(\mathbf r)\): the two fields at one point.`, "Draw the forward field in the design region: a wave coming in from the input.", "Draw the adjoint field: the wanted output, conjugated and sent back in.", "Multiply them at every pixel. The fringes are a grating that scatters the input into the output: add GaAs on red, remove it on blue.", "Sum over the frequencies of the band (Eq. 3.5). Fringes that depend on wavelength wash out away from where the paths are equal, and the robust part stays."],
say: "A pixel's permittivity sits in one diagonal entry of the Maxwell matrix, so the adjoint formula reduces to the product of the forward and adjoint fields at that pixel, summed over frequency. The fringes it draws are the grating that would couple the input into the wanted output.",
num: String.raw`Reflection (output at 180°): fringes with period \(\lambda_0/(2n)\), a Bragg mirror. At n = 3.5 and 800 nm: <b>114 nm</b>.<br>Map: 1.6 µm × 1.0 µm, analytic plane waves in a medium of n = 3.5 (an illustration, not a simulation).`,
note: String.raw`<p><b>"And for a parameter that is not a pixel, like a tooth width?"</b></p><p>Chain rule: \(\partial J/\partial p = \sum_{\mathbf r}(\partial J/\partial\varepsilon(\mathbf r))\,\partial\varepsilon(\mathbf r)/\partial p\). For a density pixel, \(\partial\varepsilon/\partial\hat\rho = \varepsilon_{\mathrm{GaAs}} - \varepsilon_{\mathrm{air}}\) (Eq. 3.10), times the derivatives of the filter and projection. For a width, \(\varepsilon\) changes only in a thin sheet at the moving edge, and that needs the boundary form of the next question.</p>`,
r(fig, ctl) {
  const W = 72, H = 45, Lx = 1600, Ly = 1000, n = 3.5;
  const field = (v, which) => {
    const th = v.q55a * Math.PI / 180, bw = v.q55b, lams = bw > 0 ? range(800 - bw / 2, 800 + bw / 2, 9) : [800];
    const out = new Float64Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = (i + 0.5) / W * Lx - Lx / 2, y = (H / 2 - j - 0.5) / H * Ly; let s = 0;
      for (const l of lams) { const kk = 2 * Math.PI * n / l; const pf = kk * x, pa = -kk * (x * Math.cos(th) + y * Math.sin(th)); s += which === "f" ? Math.cos(pf) : which === "a" ? Math.cos(pa) : Math.cos(pf + pa); }
      out[j * W + i] = s / lams.length;
    }
    return out;
  };
  const CAP = ["Write A = ∇×∇× − k₀²ε. Only one diagonal entry depends on the permittivity at the point r.",
    "So yᵀ(∂A/∂ε)x keeps only the two fields at r: the gradient is E_adj(r) · E_fwd(r), up to a constant.",
    "The forward field in the design region: light from the input, travelling along x.",
    v => `The adjoint field: the wanted output (at ${v.q55a}°), conjugated and sent back in.`,
    v => `Their product: fringes that act as a grating from the input direction to the output direction. Red: add GaAs. Blue: remove it.${v.q55a >= 175 ? " At 180° this is a Bragg mirror." : ""}`,
    v => `Summed over ${v.q55b > 0 ? 9 : 1} wavelength${v.q55b > 0 ? "s" : ""} across ${v.q55b} nm: the wavelength-dependent fringes wash out away from the centre.`];
  DQ5_board(fig, ctl, { h: 330, cap: CAP,
    sl: [["q55a", "Output direction (degrees)", 0, 180, 5, 60, x => x.toFixed(0) + "°"], ["q55b", "Bandwidth summed (nm)", 0, 200, 10, 0, x => x.toFixed(0) + " nm"]],
    draw: (k, v) => {
      const K = DQ5_K; let s = "";
      if (k <= 2) {
        const x0 = 70, y0 = 40, sz = 200, c = 8;
        s += DQ5_R(x0, y0, sz, sz, "#fff", K.ink) + DQ5_T(x0 + sz / 2, y0 + sz + 20, "∂A/∂ε(r)", { fs: 13, a: "middle" });
        s += DQ5_R(x0 + 5 * sz / c, y0 + 5 * sz / c, sz / c, sz / c, K.purple) + DQ5_T(x0 + 5.5 * sz / c, y0 + 5.5 * sz / c + 5, "−k₀²", { fs: 10, a: "middle", c: "#fff" });
        s += DQ5_T(x0 + sz + 20, y0 + 110, "every other entry is 0", { fs: 13, c: K.mute });
        if (k === 2) s += DQ5_T(340, 306, "yᵀ (∂A/∂ε(r)) x  =  −k₀² E" + DQ5_sub("adj") + "(r) · E" + DQ5_sub("fwd") + "(r)", { fs: 17, a: "middle", w: 600 });
        return s;
      }
      const sc = 5.6, x0 = 110, y0 = 30, w = field(v, k === 3 ? "f" : k === 4 ? "a" : "p");
      s += DQ5_mapRects(w, W, H, x0, y0, sc, DQ5_div) + DQ5_R(x0, y0, W * sc, H * sc, "none", K.ink);
      s += DQ5_A(30, y0 + H * sc / 2, x0 - 6, y0 + H * sc / 2, K.blue, 2.4) + DQ5_T(30, y0 + H * sc / 2 - 10, "input", { fs: 12, c: K.blue });
      { const cx = 600, cy = 100, R = 44; s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#d3d9e2"/>` + DQ5_A(cx - R, cy, cx + R * 0.6, cy, K.blue, 2.2) + DQ5_T(cx, cy + R + 16, "directions", { fs: 11, a: "middle", c: K.mute });
        if (k >= 4) { const th = v.q55a * Math.PI / 180; s += DQ5_A(cx, cy, cx + R * Math.cos(th), cy - R * Math.sin(th), K.orange, 2.2) + DQ5_T(cx + (R + 12) * Math.cos(th), cy - (R + 12) * Math.sin(th) + 4, "out", { fs: 11, a: "middle", c: K.orange }); } }
      s += DQ5_T(x0, y0 + H * sc + 18, k === 3 ? "Re E_fwd" : k === 4 ? "Re E_adj" : "Re(E_fwd · E_adj): the gradient map", { fs: 12, c: K.mute });
      return s;
    },
    ro: v => { const th = v.q55a * Math.PI / 180, q = Math.hypot(1 - Math.cos(th), Math.sin(th)); return [["fringe period", q < 0.05 ? "no fringes (straight through)" : (800 / n / q).toFixed(0) + " nm"]]; }
  });
}},

/* ---------------- Q5.6 ---------------- */
{s: "Q5.6", t: "How does the gradient for a moving boundary differ from the pixel one?",
intu: String.raw`Moving a boundary by \(\delta n\) turns a thin sheet of air into GaAs. The pixel formula would multiply the full fields in that sheet, but at a boundary the normal component of E jumps by the ratio of the permittivities (Eq. 2.1), so "the field at the boundary" is not defined. The correct sensitivity uses only components that are continuous across the boundary: the tangential E and the normal D (Sec. 3.2, Lalau-Keraly 2013). Tidy3D evaluates this overlap on the boundary itself for the grating teeth, the DBR layers and the taper and PBS outlines.`,
eq: String.raw`\[ \frac{\partial F}{\partial (\delta n)} \;\propto\; \mathrm{Re}\int_{\partial\Omega}\Big[\Delta\varepsilon\;\mathbf E_{\parallel}^{\mathrm{fwd}}\cdot\mathbf E_{\parallel}^{\mathrm{adj}} \;-\; \Delta\big(\varepsilon^{-1}\big)\,\frac{D_{\perp}^{\mathrm{fwd}} D_{\perp}^{\mathrm{adj}}}{\varepsilon_0^{2}}\Big]\,dS \]<div class="eqnote">\(\Delta\varepsilon = \varepsilon_{\mathrm{in}} - \varepsilon_{\mathrm{out}}\) and \(\Delta(\varepsilon^{-1}) = 1/\varepsilon_{\mathrm{in}} - 1/\varepsilon_{\mathrm{out}}\), with \(\delta n\) the outward displacement of the boundary.</div><div class="eqref">Ch. 3 Sec. 3.2, Lalau-Keraly et al. 2013, Sec. 2. Field jump: Ch. 2 Eq. (2.1)</div>`,
sym: [[String.raw`\(\mathbf E_{\parallel}\)`, "tangential E, continuous across the boundary"], [String.raw`\(D_{\perp}\)`, "normal D, continuous across the boundary"], [String.raw`\(\partial\Omega\)`, "the boundary being moved"], [String.raw`\(\delta n\)`, "normal displacement of the boundary"]],
how: ["Draw an interface: GaAs on the left, air on the right, and the outward normal.", "Draw tangential E: the same arrow on both sides. It is continuous.", String.raw`Draw normal E: short in GaAs, \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\) times longer in air (Eq. 2.1). Normal \(D = \varepsilon_0\varepsilon E_\perp\) is the same on both sides.`, String.raw`Move the boundary by \(\delta n\): a sheet changes from air to GaAs. Which \(E_\perp\) goes into \(\mathbf E\cdot\mathbf E\)? The inside value is too small, the outside value too large.`, String.raw`Write the formula with the continuous quantities only: \(\Delta\varepsilon\,E_\parallel E_\parallel - \Delta(\varepsilon^{-1})D_\perp D_\perp\). For the normal part this is exactly between the two wrong guesses.`],
say: "At a boundary the normal electric field jumps, so the pixel product is ambiguous. The boundary gradient uses only the continuous components, tangential E and normal D, which gives the exact sensitivity to moving the edge.",
num: String.raw`GaAs and air at n = 3.5: \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}} = 12.25\). Using \(E_\perp\) from the GaAs side underestimates the normal term by this factor, using the air side overestimates it by the same factor.`,
note: String.raw`<p><b>"How does that reach the vertex parameters of Eq. (3.11)?"</b></p><p>By the chain rule. Each vertex moves along its normal by \(\Delta_{\max}\tanh p_i\), which displaces the two neighbouring edges by an amount that falls linearly from the vertex. So \(\partial J/\partial p_i\) is the boundary sensitivity integrated along those two edges, weighted by that hat-shaped displacement and by \(\Delta_{\max}\,\mathrm{sech}^2 p_i\). The automatic differentiation of Tidy3D does this bookkeeping (Sec. 3.2).</p>`,
r(fig, ctl) {
  const CAP = ["An interface: GaAs on the left, air on the right. The normal n̂ points out of the GaAs.",
    "Tangential E (blue) has the same value on both sides. Safe to use.",
    v => `Normal E (orange) jumps: it is ε_GaAs/ε_air = ${(v.q56n ** 2).toFixed(2)} times larger in air. Normal D (green) is continuous.`,
    "Move the boundary out by δn. The sheet (hatched) changes from air to GaAs. Plugging either E⊥ into E·E gives the wrong answer.",
    "Use continuous quantities only: Δε E∥·E∥ − Δ(1/ε) D⊥D⊥. Its normal part is the geometric mean of the two wrong guesses."];
  DQ5_board(fig, ctl, { h: 330, cap: CAP,
    sl: [["q56n", "Index of the material", 1.2, 3.6, 0.05, 3.5, x => x.toFixed(2)]],
    draw: (k, v) => {
      const K = DQ5_K, e = v.q56n ** 2; let s = "";
      const bx = 300;
      s += DQ5_R(40, 30, bx - 40, 260, K.gaas) + DQ5_T(60, 52, `GaAs, ε = ${e.toFixed(2)}`, { fs: 13, c: K.blue }) + DQ5_T(bx + 20, 52, "air, ε = 1", { fs: 13, c: K.mute });
      s += DQ5_L(bx, 30, bx, 290, K.ink, 2.4);
      s += DQ5_A(bx, 270, bx + 40, 270, K.ink, 1.6) + DQ5_T(bx + 46, 275, "n̂", { fs: 14 });
      if (k >= 2) { s += DQ5_A(bx - 60, 120, bx - 60, 80, K.blue, 2.6) + DQ5_A(bx + 60, 120, bx + 60, 80, K.blue, 2.6) + DQ5_T(bx - 70, 104, "E∥", { fs: 13, a: "end", c: K.blue }) + DQ5_T(bx + 70, 104, "E∥", { fs: 13, c: K.blue }); }
      if (k >= 3) { const Ein = 22, Eout = Math.min(330, Ein * e); s += DQ5_A(bx - 20 - Ein, 170, bx - 20, 170, K.orange, 2.6) + DQ5_A(bx + 10, 170, bx + 10 + Eout, 170, K.orange, 2.6) + DQ5_T(bx - 26 - Ein, 175, "E⊥", { fs: 13, a: "end", c: K.orange }) + DQ5_T(bx + 14 + Eout / 2, 160, `E⊥ × ${e.toFixed(1)}`, { fs: 13, a: "middle", c: K.orange });
        s += DQ5_A(bx - 80, 215, bx - 20, 215, K.teal, 2.6) + DQ5_A(bx + 10, 215, bx + 70, 215, K.teal, 2.6) + DQ5_T(bx - 86, 220, "D⊥", { fs: 13, a: "end", c: K.teal }) + DQ5_T(bx + 76, 220, "D⊥ (same)", { fs: 13, c: K.teal }); }
      if (k >= 4) { s += `<defs><pattern id="dq5h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${K.purple}" stroke-width="2"/></pattern></defs>` + DQ5_R(bx, 30, 18, 260, "url(#dq5h)") + DQ5_T(bx + 9, 300, "δn", { fs: 12, a: "middle", c: K.purple }); }
      if (k >= 5) { s += DQ5_R(420, 236, 250, 80, "#fff", "#d3d9e2"); s += DQ5_T(430, 256, "normal term, relative to the truth:", { fs: 12, c: K.mute }) + DQ5_T(430, 276, `E⊥ inside:  × 1/${e.toFixed(2)}`, { fs: 13, c: K.red }) + DQ5_T(430, 294, `E⊥ outside:  × ${e.toFixed(2)}`, { fs: 13, c: K.red }) + DQ5_T(430, 312, "D⊥ form:  × 1 (exact)", { fs: 13, c: K.teal, w: 600 }); }
      return s;
    },
    ro: v => { const e = v.q56n ** 2; return [["jump of E⊥", "× " + e.toFixed(2)], ["E⊥ inside, error", "× 1/" + e.toFixed(2)], ["E⊥ outside, error", "× " + e.toFixed(2)]]; }
  });
}},

/* ---------------- Q5.7 ---------------- */
{s: "Q5.7", t: "Why Adam, and what do its two moments do?",
intu: String.raw`Adam keeps two running averages for every parameter (Kingma and Ba 2015, Alg. 1). The first moment \(m\) is an average of recent gradients, which smooths out zig-zags and keeps the step moving in a consistent direction. The second moment \(v\) is an average of the squared gradients, and dividing by \(\sqrt{v}\) rescales each parameter so it moves by about \(\alpha\) per step, however large or small its own gradient is. That is the thesis reason: Adam suits parameters whose sensitivities differ widely (Sec. 3.6), such as pixels near the waveguide next to pixels in a corner, or DBR thicknesses next to tooth widths. The bias correction removes the pull toward zero of averages that start at zero.`,
eq: String.raw`\[ m_t = \beta_1 m_{t-1} + (1-\beta_1)\,g_t, \qquad v_t = \beta_2 v_{t-1} + (1-\beta_2)\,g_t^2 \]\[ \hat m_t = \frac{m_t}{1-\beta_1^{\,t}}, \quad \hat v_t = \frac{v_t}{1-\beta_2^{\,t}}, \qquad p_t = p_{t-1} + \alpha\,\frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]<div class="eqnote">Written as ascent, since J is maximized. \(\beta_1 = 0.9\), \(\beta_2 = 0.999\) (optax defaults, Sec. 3.6).</div><div class="eqref">Kingma and Ba 2015, Alg. 1</div>`,
sym: [[String.raw`\(g_t\)`, "gradient of J at step t, one entry per parameter"], [String.raw`\(m_t, v_t\)`, "first and second moment estimates"], [String.raw`\(\alpha\)`, "learning rate, about the step size of every parameter"], [String.raw`\(\beta_1, \beta_2\)`, "decay rates, 0.9 and 0.999"]],
how: ["Draw the contours of J for two parameters: steep in one direction, shallow in the other.", "Plain gradient steps: the step size is limited by the steep direction, so the path zig-zags across the valley and crawls along it.", String.raw`First moment \(m\): averaging the gradients cancels the zig-zag, like momentum.`, String.raw`Second moment \(v\): dividing each gradient by its own RMS makes both parameters move by about \(\alpha\) per step.`, "Both together are Adam: the path heads straight for the top."],
say: "Adam averages the gradient to smooth the direction and divides each parameter's step by the RMS of its own gradient, so every parameter moves by about the learning rate no matter how sensitive it is. That suits design parameters whose sensitivities differ by orders of magnitude.",
num: String.raw`\(\beta_1 = 0.9\): averages roughly the last 10 gradients. \(\beta_2 = 0.999\): roughly the last 1000.<br>First step after bias correction: \(\hat m = g\), \(\hat v = g^2\), so every parameter moves by exactly \(\pm\alpha\).`,
note: String.raw`<p><b>"What if one gradient is a thousand times larger than another?"</b></p><p>Nothing changes for Adam: scaling a parameter's gradient scales its \(m\) and its \(\sqrt v\) by the same factor, so its step is unchanged (Kingma and Ba 2015). Plain gradient ascent would take a step a thousand times longer for that parameter. The price is that \(\alpha\) must be chosen in the units of the parameter, since it sets the step size directly.</p>`,
r(fig, ctl) {
  const start = [-2.4, 1.2];
  let P = {}, kPrev = 0, tK = 0;
  const run = (b, kind, al) => { let x = start[0], y = start[1]; const pts = [[x, y]]; let m = [0, 0], vv = [0, 0]; for (let t = 1; t <= 60; t++) { const g = [-x, -b * y]; let st;
      if (kind === "gd") st = [1.9 / b * g[0], 1.9 / b * g[1]];
      else { m = m.map((q, i) => 0.9 * q + 0.1 * g[i]); vv = vv.map((q, i) => 0.999 * q + 0.001 * g[i] * g[i]); const mh = m.map(q => q / (1 - 0.9 ** t)), vh = vv.map(q => q / (1 - 0.999 ** t));
        if (kind === "m") st = mh.map(q => 1.9 / b * q); else if (kind === "v") st = g.map((q, i) => al * q / (Math.sqrt(vh[i]) + 1e-8)); else st = mh.map((q, i) => al * q / (Math.sqrt(vh[i]) + 1e-8)); }
      x += st[0]; y += st[1]; pts.push([x, y]); } return pts; };
  const comp = v => { P = { gd: run(v.q57b, "gd"), m: run(v.q57b, "m"), v: run(v.q57b, "v", v.q57a), adam: run(v.q57b, "adam", v.q57a) }; kPrev = 0; };
  const hit = pts => { const i = pts.findIndex(p => Math.hypot(p[0], p[1]) < 0.15); return i < 0 ? "more than 60" : String(i); };
  const X = DQ5_map(-3, 1, 50, 640), Y = DQ5_map(-1.6, 1.6, 300, 30);
  const CAP = [v => `Contours of J with the optimum at the centre. The valley is ${v.q57b} times steeper across than along.`,
    v => `Plain gradient steps (grey): the step must be small enough for the steep direction, so the path zig-zags and crawls. Steps to the top: ${hit(P.gd)}.`,
    "First moment only (purple): averaging cancels the zig-zag, but the shallow direction is still slow.",
    v => `Second moment only (green): every parameter moves by about α = ${v.q57a}, so the shallow direction speeds up.`,
    v => `Adam, both together (orange): steps to the top ${hit(P.adam)}, against ${hit(P.gd)} for plain gradient steps.`];
  DQ5_board(fig, ctl, { h: 320, cap: CAP, live: true,
    sl: [["q57b", "Steepness ratio", 1, 100, 1, 40, x => x.toFixed(0)], ["q57a", "Learning rate α", 0.05, 0.5, 0.01, 0.1, x => x.toFixed(2)]],
    init: comp, onInput: comp,
    draw: (k, v, t) => {
      const K = DQ5_K; let s = "";
      if (k !== kPrev) { kPrev = k; tK = t; }
      const nShow = Math.min(60, Math.max(1, Math.floor((t - tK) * 14) + 1));
      for (const c of [0.05, 0.3, 1, 2.2, 4]) { const rx = Math.sqrt(2 * c), ry = Math.sqrt(2 * c / v.q57b); s += `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${(X(rx) - X(0)).toFixed(1)}" ry="${(Y(0) - Y(ry)).toFixed(1)}" fill="none" stroke="#b3bcc8" stroke-width="1.1"/>`; }
      s += DQ5_dot(X(0), Y(0), 4, K.ink) + DQ5_T(X(0) + 8, Y(0) - 8, "max J", { fs: 12 }) + DQ5_dot(X(start[0]), Y(start[1]), 5, K.ink, "#fff") + DQ5_T(X(start[0]) - 8, Y(start[1]) - 10, "start", { fs: 12 });
      const pl = (pts, c, cur, w) => { const q = cur ? pts.slice(0, nShow) : pts; let d = ""; q.forEach((p, i) => { d += (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(Math.max(-1.6, Math.min(1.6, p[1]))).toFixed(1); }); return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 1.8}" stroke-opacity="${cur ? 1 : 0.35}"/>`; };
      if (k >= 2) s += pl(P.gd, "#6b7684", k === 2);
      if (k >= 3) s += pl(P.m, K.purple, k === 3);
      if (k >= 4) s += pl(P.v, K.teal, k === 4);
      if (k >= 5) s += pl(P.adam, K.orange, true, 2.6);
      s += DQ5_T(56, 316, "p₁ (shallow)", { fs: 11, c: K.mute }) + DQ5_T(640, 44, "p₂ (steep)", { fs: 11, a: "end", c: K.mute });
      return s;
    },
    ro: () => [["plain gradient, steps", hit(P.gd)], ["Adam, steps", hit(P.adam)]]
  });
}},

/* ---------------- Q5.8 ---------------- */
{s: "Q5.8", t: "Does the optimizer find the global optimum?",
intu: String.raw`No. A gradient-based optimizer climbs the hill it starts on and stops where the gradient vanishes, which is a local optimum that depends on the starting point (Sec. 3.1). Wave problems have many such hills, because interference makes the figure of merit rise and fall as features shift by fractions of a wavelength. That is why every design in the thesis starts from a simple device that already works in part: the grating couplers from a uniform grating, the tapers from a linear taper and the PBS from a Y-shaped splitter. The optimizer then improves a sensible design instead of searching blindly.`,
eq: String.raw`\[ \nabla_{\mathbf p} J(\mathbf p^{\star}) = 0 \qquad \text{(a local optimum: no small step improves } J) \]\[ \mathbf p^{(0)}: \ \text{uniform grating, linear taper, Y-shaped splitter} \]<div class="eqref">Ch. 3 Sec. 3.1</div>`,
sym: [[String.raw`\(\mathbf p^{\star}\)`, "where the optimizer stops"], [String.raw`\(\mathbf p^{(0)}\)`, "starting design"]],
how: ["Draw J along one direction of parameter space: several hills of different heights.", "Start from a random point: the optimizer climbs the nearest hill and stops at its top, where the gradient is zero.", "Start somewhere else: a different hill and a different answer.", "Start from a simple working device: it already sits on the slope of a good hill, and the optimizer climbs that one.", "Conclude: the result is a good local optimum, not a proven global one. Physical limits and other starts are the checks."],
say: "No, it finds a local optimum that depends on where it starts. That is why each design starts from a simple device that already works, a uniform grating, a linear taper or a Y-splitter, so the optimizer improves a good design rather than a random one.",
num: String.raw`Starting points (Sec. 3.1, 3.3): uniform grating, linear taper, Y-shaped splitter drawn as a density image with \(\rho = 0.9\) in the arms and 0.1 elsewhere.<br>The curve here is an illustration, not a simulation.`,
note: String.raw`<p><b>"Then how do you know your optimum is good?"</b></p><p>By comparing with what physics allows. A mode transmission cannot exceed 1 and the PBS figure of merit cannot exceed 2 (Eq. 3.14). A grating's coupling is limited by how much light goes up rather than down and by how well its beam matches the fiber mode. A design close to such a limit cannot be beaten by much. Restarting from other initial designs, or with another \(\beta\) schedule, is a further check.</p>`,
r(fig, ctl) {
  const J = p => 0.55 * Math.exp(-((p + 2.2) ** 2) / 0.5) + 0.92 * Math.exp(-((p - 1.7) ** 2) / 0.4) + 0.42 * Math.exp(-((p + 0.1) ** 2) / 0.12) + 0.25 * Math.exp(-((p - 3.4) ** 2) / 0.15) + 0.03;
  const dJ = p => (J(p + 1e-5) - J(p - 1e-5)) / 2e-5;
  const climb = p0 => { let p = p0, m = 0, v = 0; const pts = [p]; for (let t = 1; t <= 160; t++) { const g = dJ(p); m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g * g; p += 0.05 * (m / (1 - 0.9 ** t)) / (Math.sqrt(v / (1 - 0.999 ** t)) + 1e-8); p = Math.max(-4, Math.min(4, p)); pts.push(p); } return pts; };
  const starts = { 2: -3.3, 3: 0.3, 4: 1.0 };
  let kPrev = 0, tK = 0, paths = {};
  const comp = v => { paths = { 2: climb(-3.3), 3: climb(0.3), 4: climb(1.0), 5: climb(v.q58p) }; kPrev = 0; };
  const X = DQ5_map(-4, 4, 50, 640), Y = DQ5_map(0, 1.05, 270, 40);
  const CAP = ["J along one direction in parameter space: several hills, because interference makes J rise and fall.",
    () => `A random start at p = −3.3 climbs to the nearest hill and stops: J = ${J(paths[2][160]).toFixed(2)}.`,
    () => `A start at p = 0.3 ends on a different, smaller hill: J = ${J(paths[3][160]).toFixed(2)}.`,
    () => `A start from a simple working device (p = 1.0) is already on the slope of the best hill: J = ${J(paths[4][160]).toFixed(2)}.`,
    v => `Try your own start with the slider (p = ${v.q58p.toFixed(1)} → J = ${J(paths[5][160]).toFixed(2)}). Every end point has zero gradient, only one is the global best.`];
  DQ5_board(fig, ctl, { h: 320, cap: CAP, live: true,
    sl: [["q58p", "Your start p", -4, 4, 0.1, -1.0, x => x.toFixed(1)]],
    init: comp, onInput: comp,
    draw: (k, v, t) => {
      const K = DQ5_K; let s = "";
      if (k !== kPrev) { kPrev = k; tK = t; }
      const nShow = Math.min(160, Math.floor((t - tK) * 50));
      const ps = range(-4, 4, 300);
      s += DQ5_ax(50, 40, 595, 230, "parameter p", "J") + DQ5_pl(X, Y, ps, ps.map(J), K.ink, 2.2);
      const cols = { 2: K.blue, 3: K.purple, 4: K.teal, 5: K.orange };
      for (let q = 2; q <= Math.min(k, 5); q++) {
        const pts = paths[q], cur = q === k, n = cur ? nShow : 160, c = cols[q], p0 = pts[0], pe = pts[Math.max(0, n)];
        s += DQ5_dot(X(p0), Y(J(p0)), 5, c, "#fff");
        let d = ""; for (let i = 0; i <= n; i++) d += (i ? "L" : "M") + X(pts[i]).toFixed(1) + " " + (Y(J(pts[i])) - 6).toFixed(1); s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-opacity="${cur ? 1 : 0.5}"/>`;
        s += DQ5_dot(X(pe), Y(J(pe)) - 6, 5.5, c);
        if (q === 4) s += DQ5_T(X(p0), Y(J(p0)) + 22, "working device", { fs: 12, a: "middle", c });
        if (q === 2 || q === 3) s += DQ5_T(X(p0), Y(J(p0)) + 22, "random start", { fs: 12, a: "middle", c });
      }
      if (k >= 5) s += DQ5_T(X(1.7), Y(J(1.7)) - 22, "global best", { fs: 12, a: "middle", c: K.teal });
      return s;
    },
    ro: v => [["end point of your start", J(paths[5][160]).toFixed(3)], ["global best", J(1.7).toFixed(3)]]
  });
}}

],
summary: String.raw`Inverse design beats a sweep because the adjoint method gives the gradient with respect to all N parameters from two simulations, while a sweep costs \(K^N\) runs and finite differences \(2N\) per step with a delicate step size. The derivation is one regrouping: from \(A\mathbf x = \mathbf b\), the row \((\partial F/\partial\mathbf x)A^{-1}\) is shared by every parameter and comes from one adjoint solve, \(A^T\mathbf y = (\partial F/\partial\mathbf x)^T\), giving Eq. (3.4). The adjoint source is the output mode sent backward with the conjugate amplitude, the output reversed in time. For a pixel, the gradient is the product of the forward and adjoint fields summed over frequency (Eq. 3.5). For a boundary only tangential E and normal D may be used, because normal E jumps. Adam's first moment smooths the direction and its second moment gives every parameter a step of about \(\alpha\), and the result is a local optimum, which is why each design starts from a working device.`,
sheet: [
  [String.raw`\[ \max_{\mathbf{p}}\; J(\mathbf{p}) = F(\mathbf{p}) - \sum_k w_k P_k(\mathbf{p}) \]`, "Eq. (3.1): the design problem (Q5.1)"],
  [String.raw`\[ \frac{\partial F}{\partial p_i} \approx \frac{F(\mathbf p + h\hat{\mathbf e}_i) - F(\mathbf p - h\hat{\mathbf e}_i)}{2h} \]`, "Finite differences: 2N runs per step (Q5.2)"],
  [String.raw`\[ A\mathbf x = \mathbf b, \qquad A^{T}\mathbf{y} = \left(\frac{\partial F}{\partial \mathbf{x}}\right)^{T}, \qquad \frac{\partial F}{\partial p_i} = -2\,\mathrm{Re}\left\{ \mathbf{y}^{T}\frac{\partial A}{\partial p_i}\mathbf{x}\right\} \]`, "Eqs. (3.2) to (3.4): the adjoint method (Q5.3)"],
  [String.raw`\[ F = |a_m|^2 \Rightarrow \frac{\partial F}{\partial a_m} = a_m^{*} \]`, "The adjoint source amplitude (Q5.4)"],
  [String.raw`\[ \frac{\partial J}{\partial \varepsilon(\mathbf{r})} = \mathrm{Re} \sum_{f} \mathbf{E}_\mathrm{fwd}(\mathbf{r}, f) \cdot \mathbf{E}_\mathrm{adj}(\mathbf{r}, f) \]`, "Eq. (3.5): the pixel sensitivity (Q5.5)"],
  [String.raw`\[ \frac{\partial F}{\partial (\delta n)} \propto \mathrm{Re}\int_{\partial\Omega}\Big[\Delta\varepsilon\,\mathbf E_{\parallel}^{\mathrm{fwd}}\cdot\mathbf E_{\parallel}^{\mathrm{adj}} - \Delta(\varepsilon^{-1})\,\frac{D_{\perp}^{\mathrm{fwd}} D_{\perp}^{\mathrm{adj}}}{\varepsilon_0^2}\Big]dS \]`, "Boundary sensitivity with the continuous components (Q5.6)"],
  [String.raw`\[ m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t, \quad v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2, \quad p_t = p_{t-1} + \alpha\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon} \]`, "Adam, with the bias-corrected moments (Q5.7)"],
  [String.raw`\[ \nabla_{\mathbf p} J(\mathbf p^{\star}) = 0 \]`, "A local optimum, which depends on the start (Q5.8)"]
],
sources: ["Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (3), (8), (9), (11) and (12) (adjoint method in matrix form, as quoted in Sec. 3.2)", "Lalau-Keraly, Bhargava, Miller and Yablonovitch, Opt. Express 21, 21693 (2013), Eqs. (5), (8) and (9) and Sec. 2 (field-product sensitivity, adjoint source amplitude, boundary components)", "Kingma and Ba, Adam: A method for stochastic optimization, ICLR 2015, Algorithm 1", "Flexcompute Tidy3D documentation: automatic differentiation of simulations, adjoint sources and boundary gradients, optax for the optimizer", "Ch. 3 Sec. 3.1, 3.2 and 3.6 of the thesis"]
});
