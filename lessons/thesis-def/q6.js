/* Committee questions, lesson Q6: parameterizations and fabrication constraints (Ch. 3 Sec. 3.3 to 3.5 and 3.7).
   Every card is a whiteboard build: Back / Play / Next steps in the order of the how[] list. */

/* ---------- whiteboard helpers (prefix DQ6_) ---------- */
const DQ6_K = { ink: "#1f2933", mute: "#6b7684", soft: "#e8ecf2", blue: "#2f78c4", orange: "#D85A30", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", red: "#C0392B", gaas: "#cfdcec", pml: "#e9e4f5" };
const DQ6_T = (x, y, s, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-family="Public Sans, system-ui, sans-serif" font-size="${o.fs || 13}" fill="${o.c || DQ6_K.ink}" text-anchor="${o.a || "start"}"${o.w ? ` font-weight="${o.w}"` : ""}${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ""}>${s}</text>`; };
const DQ6_L = (x1, y1, x2, y2, c, w, d) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || DQ6_K.ink}" stroke-width="${w || 1.6}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linecap="round"/>`;
const DQ6_A = (x1, y1, x2, y2, c, w, d) => arrow(x1, y1, x2, y2, c || DQ6_K.ink, w || 1.8, d);
const DQ6_R = (x, y, w, h, f, s, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f || "none"}" stroke="${s || "none"}"${op !== undefined ? ` fill-opacity="${op}"` : ""}/>`;
const DQ6_sub = s => `<tspan baseline-shift="sub" font-size="9.5">${s}</tspan>`;
const DQ6_map = (a, b, A, B) => v => A + (v - a) / (b - a) * (B - A);
const DQ6_pl = (X, Y, xs, ys, c, w, d, fill) => { let s = ""; xs.forEach((x, i) => { const y = ys[i]; if (!isFinite(y)) return; s += (s ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); }); return `<path d="${s}" fill="${fill || "none"}" stroke="${c}" stroke-width="${w || 2}"${d ? ` stroke-dasharray="${d}"` : ""} stroke-linejoin="round"/>`; };
const DQ6_ax = (x0, y0, w, h, xl, yl) => DQ6_A(x0, y0 + h, x0 + w, y0 + h, DQ6_K.ink, 1.3) + DQ6_A(x0, y0 + h, x0, y0, DQ6_K.ink, 1.3) + (xl ? DQ6_T(x0 + w, y0 + h + 16, xl, { a: "end", fs: 12, c: DQ6_K.mute }) : "") + (yl ? DQ6_T(x0 + 6, y0 + 4, yl, { fs: 12, c: DQ6_K.mute }) : "");
const DQ6_dot = (x, y, r, c, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || c}" stroke="${c}" stroke-width="1.5"/>`;
const DQ6_pct = v => (100 * v).toFixed(v < 0.01 ? 2 : 1) + " %";

/* The board: steps with captions, Back / Play / Next, optional sliders, option buttons, readout and an equation strip. */
function DQ6_board(fig, ctl, o) {
  const n = o.cap.length, v = {}, opts = o.opts || [];
  let k = 1, play = false, tm = null;
  opts.forEach(g => v[g.key] = g.val);
  ctl.innerHTML = opts.map(g => `<div class="row"><label>${g.label}</label>${g.items.map(([val, tx]) => `<button data-${g.key}="${val}">${tx}</button>`).join("")}</div>`).join("")
    + (o.sl || []).map(s => sl(s[0], s[1], s[2], s[3], s[4], s[5])).join("")
    + `<div class="row"><button data-qb="b">Back</button><button data-qb="p">Play</button><button data-qb="n">Next</button><span class="dq6s" style="font-size:13px;color:var(--muted);margin-left:4px"></span></div>`
    + (o.ro ? `<div class="readout dq6r"></div>` : "");
  fig.innerHTML = `<div class="dq6b">${o.eqs ? `<div class="dq6e" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 16px;min-height:50px;font-size:16px;padding:6px 10px;margin-bottom:6px;background:var(--sunk);border-radius:8px">${o.eqs.map(([s, tx]) => `<span data-s="${s}" style="transition:opacity .4s">${tx}</span>`).join("")}</div>` : ""}<div class="dq6v"></div><p class="dq6c" style="font-size:14.5px;line-height:1.55;color:var(--fg);min-height:46px;margin:8px 2px 0"></p></div>`;
  const box = fig.querySelector(".dq6b"), vis = fig.querySelector(".dq6v"), cap = fig.querySelector(".dq6c"), stl = ctl.querySelector(".dq6s"), ro = ctl.querySelector(".dq6r");
  const B = q => ctl.querySelector(`button[data-qb="${q}"]`);
  if (o.eqs) typesetMath(fig.querySelector(".dq6e"));
  const read = () => (o.sl || []).forEach(s => { v[s[0]] = +$(s[0]).value; $(s[0] + "v").textContent = s[6] ? s[6](v[s[0]]) : v[s[0]]; });
  const render = t => {
    vis.innerHTML = svg(o.h, `<rect x="1" y="1" width="678" height="${o.h - 2}" rx="10" fill="#ffffff" stroke="#d3d9e2"/>` + o.draw(k, v, t || 0));
    const c = o.cap[k - 1]; cap.innerHTML = `<b>Step ${k}.</b> ` + (typeof c === "function" ? c(v) : c);
    stl.textContent = `step ${k} of ${n}`; B("b").disabled = k === 1; B("n").disabled = k === n; B("p").textContent = play ? "Pause" : "Play";
    if (o.eqs) fig.querySelectorAll(".dq6e span").forEach(e => e.style.opacity = +e.dataset.s <= k ? 1 : 0.12);
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
const DQ6_dens = v => { v = Math.max(0, Math.min(1, v)); return `rgb(${Math.round(255 - v * 205)},${Math.round(255 - v * 190)},${Math.round(255 - v * 160)})`; };
/* density map (0..1) as run-length rects, 13 grey levels, with optional overlays [[mask, colour]] */
const DQ6_rects = (a, W, H, x0, y0, sc, over) => {
  const col = i => { if (over) for (const [m, c] of over) if (m[i]) return c; return DQ6_dens(Math.round(a[i] * 12) / 12); };
  let s = "";
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const c = col(y * W + x); let e = x + 1; while (e < W && col(y * W + e) === c) e++; s += `<rect x="${(x0 + x * sc).toFixed(1)}" y="${(y0 + y * sc).toFixed(1)}" width="${((e - x) * sc + 0.35).toFixed(1)}" height="${(sc + 0.35).toFixed(1)}" fill="${c}"/>`; x = e; } }
  return s + `<rect x="${x0}" y="${y0}" width="${W * sc}" height="${H * sc}" fill="none" stroke="#9aa4b2"/>`;
};
const DQ6_area = m => m.reduce((s, v) => s + (v ? 1 : 0), 0);

addLesson("thesis", "def", {
level: "Defense", id: "thesis-def-q6", title: "Parameterizations and fabrication constraints", short: "Q6. Parameters and fab rules",
labels: { intu: "Short answer", how: "On the board, step by step", note: "Follow-up they might ask" },
big: String.raw`A design that cannot be written by electron-beam lithography and etched through the membrane is worth nothing, so the committee will probe how the parameters and the fabrication rules were built into the optimization. This lesson covers the eight questions most likely to come up about Ch. 3 Sec. 3.3 to 3.5 and 3.7: why widths go through a tanh map, what the filter and the projection each do, why \(\beta\) is raised gradually, what the erosion and dilation penalty measures and why its weight is ramped, why a soft penalty still needs a hard design rule check run two ways with \(r = 59\) nm, why the repair with \(r = 63\) nm can cost performance and how it is recovered, why outlines carry a curvature penalty, and why the objective is a Gaussian-weighted band, together with ER and IL. Each card has a short answer, a board build with a live visual, a sentence to say aloud and the follow-up.`,
bridge: "The parameterizations are Eqs. (3.6) to (3.11), the broadband objective Eq. (3.13), the fabrication constraints Eqs. (3.15) to (3.17) and the reported quantities Eq. (3.18). Filter and projection follow Christiansen and Sigmund 2021, the penalties Tidy3D and Hammond et al. 2021, the curvature form Michaels and Yablonovitch 2018, and the design rule check KLayout and Shapely. All maps and layouts are computed live in the page, with the Ch. 3 method settings (R = 120 nm, r = 59 and 63 nm, beta from 1 to 100) and illustrative spectra, no thesis results.",
cards: [

/* ---------------- Q6.1 ---------------- */
{s: "Q6.1", t: "Why map the widths through tanh instead of clipping them?",
intu: String.raw`The optimizer takes unconstrained steps, but a grating tooth must stay between 80 nm and 1 µm. Instead of optimizing the width directly, each width is a smooth function of a free variable \(p_i\) that can take any real value, and the function maps every value into the allowed range (Sec. 3.3). The optimizer can then take any step and the geometry still stays within its limits. Clipping would also keep the width inside, but its slope is exactly zero beyond the bound, so a parameter that wanders past it gets no gradient and can never come back. The tanh map is smooth, its slope never vanishes, and \(p_i = 0\) is the middle of the range.`,
eq: String.raw`\[ w(p_i) = \tfrac12\,(w_\mathrm{max} - w_\mathrm{min})\tanh p_i + \tfrac12\,(w_\mathrm{max} + w_\mathrm{min}) \]<div class="eqref">Ch. 3 Eq. (3.6)</div>\[ \frac{dw}{dp_i} = \tfrac12\,(w_\mathrm{max} - w_\mathrm{min})\,\mathrm{sech}^2 p_i \;\gt\; 0 \]<div class="eqnote">The same idea: DBR layers scaled by \(1 + \tfrac12\tanh p_i\), taper half-widths with \(\tanh(\pi p_i)\) (Eq. 3.7), vertices moved by \(\Delta_\mathrm{max}\tanh p_i\) (Eq. 3.11).</div>`,
sym: [[String.raw`\(p_i\)`, "free variable, any real number"], [String.raw`\(w_\mathrm{min}, w_\mathrm{max}\)`, "80 nm and 1 µm for the grating teeth and gaps"], [String.raw`\(\mathrm{sech}^2 p\)`, "slope of tanh, 1 at p = 0, small but never zero far out"]],
how: [String.raw`Draw axes: \(p\) across, width up, and shade the allowed band from 80 nm to 1 µm.`, "Draw the clipped map: a straight line with kinks at the bounds and flat beyond them.", String.raw`Draw the tanh map: it bends smoothly into the bounds and never leaves the band. \(p = 0\) gives the middle, 540 nm.`, "Draw both slopes: the clipped slope drops to zero outside, the tanh slope fades smoothly but stays positive.", "Run a parameter that is first pushed toward the upper bound and then asked to come back. The clipped one sticks at 1 µm forever, the tanh one returns."],
say: "Each bounded quantity is a tanh of a free variable, so any optimizer step keeps the geometry inside its limits. Unlike clipping, the slope never becomes zero, so a parameter near a bound can always move back.",
num: String.raw`\(w_\mathrm{min}\) = 80 nm, \(w_\mathrm{max}\) = 1 µm: \(p = 0\) gives <b>540 nm</b>, slope 460 nm per unit of p.<br>\(p = 2\): 984 nm, slope 32 nm. Nine teeth give 18 parameters (Sec. 3.3).`,
note: String.raw`<p><b>"Doesn't tanh make the bound itself unreachable?"</b></p><p>Only exactly: the bound is reached as \(p \to \infty\). But \(p = 3\) already gets within 2.3 nm of 1 µm, and Adam's normalized steps keep moving \(p\) even where the slope is small. A design that wants to sit on a bound ends up a few nanometres from it, well below the fabrication tolerance.</p>`,
r(fig, ctl) {
  const lo = 80, hi = 1000, mid = 540, half = 460;
  const wT = p => half * Math.tanh(p) + mid, dT = p => half / Math.cosh(p) ** 2;
  const wC = p => Math.max(lo, Math.min(hi, mid + half * p)), dC = p => (mid + half * p > lo && mid + half * p < hi) ? half : 0;
  const sim = (wf, df) => { let p = 0, m = 0, v = 0; const out = []; for (let t = 1; t <= 100; t++) { const tgt = t <= 40 ? 1100 : 400, w = wf(p), g = -2 * (w - tgt) / (half * half) * df(p); m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g * g; p += 0.15 * (m / (1 - 0.9 ** t)) / (Math.sqrt(v / (1 - 0.999 ** t)) + 1e-12); out.push(wf(p)); } return out; };
  const runT = sim(wT, dT), runC = sim(wC, dC);
  const CAP = ["Axes: the free variable p across, the width up. Shaded: the allowed band, 80 nm to 1 µm.",
    "Clipping: a straight line cut off at the bounds. Kinks, and flat beyond them.",
    v => `tanh: smooth, always inside the band. Here p = ${v.q61p.toFixed(1)} gives w = ${wT(v.q61p).toFixed(0)} nm.`,
    "The slopes: clipped (grey) falls to zero outside, so the gradient dies. tanh (blue) fades but never reaches zero.",
    "A run: the objective first wants 1.1 µm (beyond the bound), then 400 nm from step 40. The clipped width is stuck at 1 µm, the tanh width comes back."];
  DQ6_board(fig, ctl, { h: 380, cap: CAP,
    sl: [["q61p", "Free variable p", -4, 4, 0.1, 1.2, x => x.toFixed(1)]],
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      const X = DQ6_map(-4, 4, 60, 340), Y = DQ6_map(0, 1100, 210, 30), ps = range(-4, 4, 200);
      s += DQ6_R(60, Y(hi), 280, Y(lo) - Y(hi), K.teal, null, 0.1) + DQ6_ax(60, 30, 290, 180, "p", "w (nm)");
      [80, 540, 1000].forEach(q => s += DQ6_T(54, Y(q) + 4, q, { fs: 10, a: "end", c: K.mute }));
      [-4, -2, 0, 2].forEach(q => s += DQ6_T(X(q), 226, q, { fs: 10, a: "middle", c: K.mute }));
      if (k >= 2) s += DQ6_pl(X, Y, ps, ps.map(wC), "#6b7684", 2, k >= 3 ? "5 4" : null);
      if (k >= 3) { s += DQ6_pl(X, Y, ps, ps.map(wT), K.blue, 2.4); s += DQ6_dot(X(v.q61p), Y(wT(v.q61p)), 5, K.blue); }
      if (k >= 4) {
        const X2 = DQ6_map(-4, 4, 400, 640), Y2 = DQ6_map(0, 500, 210, 30);
        s += DQ6_ax(400, 30, 250, 180, "p", "dw/dp (nm)");
        s += DQ6_pl(X2, Y2, ps, ps.map(dC), "#6b7684", 2, "5 4") + DQ6_pl(X2, Y2, ps, ps.map(dT), K.blue, 2.4);
        s += DQ6_dot(X2(v.q61p), Y2(dT(v.q61p)), 4.5, K.blue) + DQ6_T(X2(3.9), Y2(0) - 8, "clipped: 0", { fs: 11, a: "end", c: K.mute });
      }
      if (k >= 5) {
        const TX = DQ6_map(1, 100, 60, 640), TY = DQ6_map(0, 1100, 360, 252), ts = range(1, 100, 100);
        s += DQ6_ax(60, 252, 590, 108, "optimizer step", "w (nm)");
        s += DQ6_L(TX(40), 252, TX(40), 360, K.mute, 1, "3 3") + DQ6_T(TX(40) + 6, 352, "from here the target is 400 nm", { fs: 11, c: K.mute });
        s += DQ6_pl(TX, TY, ts, runC, "#6b7684", 2.2, "5 4") + DQ6_pl(TX, TY, ts, runT, K.blue, 2.4);
        s += DQ6_T(TX(100), TY(runC[99]) - 6, "clipped: stuck", { fs: 11, a: "end", c: K.ink }) + DQ6_T(TX(97), TY(runT[99]) - 8, "tanh: returns", { fs: 11, a: "end", c: K.blue });
      }
      return s;
    },
    ro: v => [["tanh width", wT(v.q61p).toFixed(0) + " nm"], ["tanh slope", dT(v.q61p).toFixed(1) + " nm"], ["clipped slope", dC(v.q61p).toFixed(0) + " nm"]]
  });
}},

/* ---------------- Q6.2 ---------------- */
{s: "Q6.2", t: "What do the filter and the projection each do, and why do you need both?",
intu: String.raw`Raw pixel densities tend to produce single-pixel features and grey values with no physical meaning (Sec. 3.3). The conic filter replaces each density by a weighted average over a disk of radius \(R\), with a weight that falls linearly from the centre (Eq. 3.8). That removes pixel-scale noise and ties the feature size to \(R\), but it makes the whole design grey. The tanh projection (Eq. 3.9) pushes the filtered values back toward 0 or 1 around the threshold \(\eta = 0.5\). Filter alone gives a smooth grey design, projection alone gives a binary design full of single pixels. Together they give smooth, nearly binary shapes, and the permittivity is then interpolated between air and GaAs (Eq. 3.10).`,
eq: String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\,\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad K(d) = \max\!\left(0,\,1 - \frac{d}{R}\right) \]\[ \hat\rho = \frac{\tanh(\beta\eta) + \tanh\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)}, \qquad \varepsilon = \varepsilon_\mathrm{air} + \hat\rho\,(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}) \]<div class="eqref">Ch. 3 Eqs. (3.8) to (3.10), Christiansen and Sigmund 2021, Eqs. (9), (18) and (19), Tidy3D conic filter</div>`,
sym: [[String.raw`\(\rho, \tilde\rho, \hat\rho\)`, "raw, filtered and projected density, 0 for air and 1 for GaAs"], [String.raw`\(R\)`, "filter radius, 120 nm, rounded up to whole pixels"], [String.raw`\(d_{ij}\)`, "distance between pixel centres"], [String.raw`\(\beta, \eta\)`, "sharpness and threshold (0.5) of the projection"]],
how: ["Draw the raw density map: random grey pixels.", String.raw`Draw the conic kernel: weight 1 at the centre, falling linearly to 0 at \(R\).`, "Apply it: the filtered map is smooth, but grey almost everywhere.", String.raw`Project with threshold 0.5 and sharpness \(\beta\): values above 0.5 go to 1, below to 0. Smooth, nearly binary shapes.`, "For comparison, project the raw map without filtering: binary, but full of single pixels. So both steps are needed.", "Finally map density to permittivity, linear between air and GaAs."],
say: "The filter averages each pixel over a disk of radius R, which removes pixel-scale features but makes the design grey. The projection pushes the filtered values back to air or GaAs, so together they give smooth, nearly binary shapes.",
num: String.raw`\(R\) = 120 nm with pixels of 11.38 nm: rounded up to <b>11 pixels</b>. \(\eta = 0.5\), \(\beta\) from 1 to 100.<br>PBS design region: 220 × 220 = 48,400 pixels (Sec. 3.3).`,
note: String.raw`<p><b>"Does the filter guarantee a minimum feature size?"</b></p><p>No. Filtering and projecting gives only a weak length scale: a thin feature can survive wherever the filtered value happens to cross the threshold. A guarantee needs more, which is why the thesis adds the erosion and dilation penalty during the optimization and a hard design rule check at the end (Sec. 3.5, Christiansen and Sigmund 2021).</p>`,
r(fig, ctl) {
  const W = 56, H = 36, raw = C3.noise(W, H, 21);
  let F = null, P = null, P0 = null;
  const comp = v => { const b = Math.pow(100, v.q62b / 10); F = C3.filter2D(raw, W, H, v.q62R); P = F.map(x => C3.proj(x, b, 0.5)); P0 = raw.map(x => C3.proj(x, b, 0.5)); };
  const CAP = ["Raw densities: random grey pixels, the kind of design an unconstrained pixel optimization drifts toward.",
    v => `The conic kernel: weight 1 at the centre, 0 at the radius R = ${v.q62R} pixels.`,
    "Filtered: smooth, no single pixels, but grey almost everywhere. A grey pixel has no physical meaning.",
    v => `Projected with η = 0.5 and β = ${Math.pow(100, v.q62b / 10).toFixed(1)}: smooth and nearly binary.`,
    "The raw map projected without filtering: binary, but full of single pixels that cannot be fabricated. Both steps are needed.",
    "Then the permittivity follows the projected density, linear between air and GaAs (Eq. 3.10)."];
  DQ6_board(fig, ctl, { h: 330, cap: CAP,
    sl: [["q62R", "Filter radius R (pixels)", 1, 7, 1, 3, x => x.toFixed(0)], ["q62b", "Projection level (β = 100^(level/10))", 0, 10, 1, 7, x => `${x.toFixed(0)}  (β = ${Math.pow(100, x / 10).toFixed(1)})`]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      const sc = 2.6, gap = 14, mw = W * sc, xs = [27, 27 + mw + gap, 27 + 2 * (mw + gap), 27 + 3 * (mw + gap)], y0 = 44;
      const labs = ["raw ρ", "filtered ρ̃", "projected ρ̂", "projected, no filter"];
      const maps = [raw, F, P, P0];
      for (let i = 0; i < 4; i++) { const show = (i === 0) || (i === 1 && k >= 3) || (i === 2 && k >= 4) || (i === 3 && k >= 5); s += DQ6_T(xs[i] + mw / 2, y0 - 8, labs[i], { fs: 12, a: "middle", c: show ? K.ink : "#c3cad4" }); if (show) s += DQ6_rects(maps[i], W, H, xs[i], y0, sc); else s += DQ6_R(xs[i], y0, mw, H * sc, "none", "#d3d9e2"); }
      if (k >= 2) {
        const cx = xs[0] + 28 * sc, cy = y0 + 18 * sc; s += `<circle cx="${cx}" cy="${cy}" r="${v.q62R * sc}" fill="none" stroke="${K.orange}" stroke-width="2"/>`;
        const gx = 60, gy = 180, gw = 220, gh = 90, KX = DQ6_map(-8, 8, gx, gx + gw), KY = DQ6_map(0, 1.1, gy + gh, gy), ds = range(-8, 8, 161);
        s += DQ6_ax(gx, gy, gw + 10, gh, "distance d (pixels)", "K(d)") + DQ6_pl(KX, KY, ds, ds.map(d => Math.max(0, 1 - Math.abs(d) / v.q62R)), K.orange, 2.2);
        s += DQ6_T(KX(v.q62R) + 4, gy + gh - 6, "R", { fs: 11, c: K.orange }) + DQ6_T(KX(-v.q62R) - 4, gy + gh - 6, "−R", { fs: 11, a: "end", c: K.orange });
      }
      if (k >= 4) {
        const gx = 340, gy = 180, gw = 160, gh = 90, PX = DQ6_map(0, 1, gx, gx + gw), PY = DQ6_map(0, 1, gy + gh, gy), xs2 = range(0, 1, 101), b = Math.pow(100, v.q62b / 10);
        s += DQ6_ax(gx, gy, gw + 10, gh, "ρ̃", "ρ̂") + DQ6_pl(PX, PY, xs2, xs2, "#c3cad4", 1.2, "3 3") + DQ6_pl(PX, PY, xs2, xs2.map(x => C3.proj(x, b, 0.5)), K.blue, 2.2);
        s += DQ6_T(PX(0.5), gy + gh + 14, "η = 0.5", { fs: 11, a: "middle", c: K.mute });
      }
      if (k >= 6) s += DQ6_T(530, 214, "ε = ε" + DQ6_sub("air"), { fs: 13 }) + DQ6_T(530, 238, "+ ρ̂ (ε" + DQ6_sub("GaAs") + " − ε" + DQ6_sub("air") + ")", { fs: 13 });
      return s;
    },
    ro: () => { const grey = a => (100 * a.filter(x => x > 0.1 && x < 0.9).length / a.length).toFixed(0) + " %"; return [["grey pixels, filtered", grey(F)], ["grey pixels, projected", grey(P)]]; }
  });
}},

/* ---------------- Q6.3 ---------------- */
{s: "Q6.3", t: "Why raise β gradually instead of starting with a binary design?",
intu: String.raw`A large \(\beta\) makes the projection nearly a step, so the design is nearly binary, but the gradient becomes poorly conditioned: the slope of the projection is huge near the threshold and almost zero everywhere else, so most pixels stop receiving any gradient (Sec. 3.5). A small \(\beta\) gives a smooth problem in which material can flow freely, but its optimum is grey. So the optimization starts smooth, lets the topology form, and sharpens step by step. For the PBS, \(\beta\) rises geometrically from 1 to 100 in 11 levels of 7 optimizer steps, 77 steps in total, and the final design is thresholded at \(\hat\rho = 0.5\).`,
eq: String.raw`\[ \beta_k = 100^{\,k/10}, \qquad k = 0, 1, \dots, 10 \quad (7 \text{ steps each}) \]\[ \frac{\partial\hat\rho}{\partial\tilde\rho}\bigg|_{\tilde\rho = \eta} = \frac{\beta}{2\tanh(\beta/2)} \quad (\eta = 0.5) \]<div class="eqref">Ch. 3 Sec. 3.5 and Fig. 3.2, Eq. (3.9), Christiansen and Sigmund 2021</div>`,
sym: [[String.raw`\(\beta_k\)`, "sharpness at level k"], [String.raw`\(\partial\hat\rho/\partial\tilde\rho\)`, "slope of the projection, which multiplies every pixel gradient"]],
how: [String.raw`Draw the identity line and the projection at \(\beta = 1\): almost the identity, nothing is binary.`, String.raw`Draw it at \(\beta = 100\): almost a step at 0.5.`, String.raw`Draw the slopes. At \(\beta = 1\) about 1 everywhere. At \(\beta = 100\) a spike of 50 at the threshold and nearly zero elsewhere, so most pixels get no gradient.`, String.raw`Draw the schedule: 11 levels, 7 steps each, \(\beta\) multiplied by about 1.58 per level.`, String.raw`Move along the schedule: the curve sharpens and the share of pixels that still feel a gradient shrinks.`],
say: "A sharp projection gives a binary design but a gradient that only reaches pixels near the threshold, while a soft one gives a smooth problem with a grey answer. So beta starts at 1 and rises geometrically to 100 in eleven levels, letting the topology form first and then become binary.",
num: String.raw`Ratio per level \(100^{1/10} = 1.58\). Slope at \(\eta\): <b>1.08</b> at \(\beta = 1\), <b>50</b> at \(\beta = 100\).<br>11 levels × 7 steps = <b>77</b> steps (PBS, Sec. 3.5). Final threshold at 0.5.`,
note: String.raw`<p><b>"Why a geometric ramp and not a linear one?"</b></p><p>The width of the transition region of the projection scales as \(1/\beta\), so each level should sharpen it by the same factor. A linear ramp from 1 to 100 in 11 levels would jump to 10.9 at the first level and spend most of the remaining levels at large \(\beta\), where the curve hardly changes any more.</p>`,
r(fig, ctl) {
  const beta = st => Math.pow(100, Math.min(10, Math.floor(st / 7)) / 10);
  const slope = (x, b) => C3.dproj(x, b, 0.5);
  const alive = b => { const xs = range(0, 1, 2001), m = slope(0.5, b); return xs.filter(x => slope(x, b) > 0.1).length / xs.length; };
  const CAP = ["The identity (dotted) and the projection at β = 1: nearly the identity, so the design stays grey.",
    "At β = 100: almost a step at 0.5. Anything above goes to GaAs, anything below to air.",
    "The slopes: at β = 1 about 1 everywhere, at β = 100 a spike of 50 at the threshold and almost zero elsewhere. Most pixels would get no gradient.",
    "The schedule: 11 levels of 7 steps, β multiplied by 1.58 per level, from 1 to 100.",
    v => `Optimizer step ${v.q63s}: β = ${beta(v.q63s).toFixed(1)}, and ${(100 * alive(beta(v.q63s))).toFixed(0)} % of the density range still has a slope above 0.1.`];
  DQ6_board(fig, ctl, { h: 370, cap: CAP,
    sl: [["q63s", "Optimizer step", 0, 76, 1, 30, x => x.toFixed(0)]],
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      const xs = range(0, 1, 201), X = DQ6_map(0, 1, 60, 300), Y = DQ6_map(0, 1, 200, 30);
      s += DQ6_ax(60, 30, 250, 170, "ρ̃", "ρ̂") + DQ6_pl(X, Y, xs, xs, "#c3cad4", 1.2, "3 3");
      s += DQ6_pl(X, Y, xs, xs.map(x => C3.proj(x, 1, 0.5)), K.teal, 2) + DQ6_T(X(0.12), Y(0.25), "β = 1", { fs: 11, c: K.teal });
      if (k >= 2) s += DQ6_pl(X, Y, xs, xs.map(x => C3.proj(x, 100, 0.5)), K.purple, 2) + DQ6_T(X(0.56), Y(0.9), "β = 100", { fs: 11, c: K.purple });
      if (k >= 5) s += DQ6_pl(X, Y, xs, xs.map(x => C3.proj(x, beta(v.q63s), 0.5)), K.orange, 2.6);
      if (k >= 3) {
        const X2 = DQ6_map(0, 1, 380, 640), Y2 = DQ6_map(0, 52, 200, 30);
        s += DQ6_ax(380, 30, 270, 170, "ρ̃", "∂ρ̂/∂ρ̃");
        s += DQ6_pl(X2, Y2, xs, xs.map(x => slope(x, 1)), K.teal, 2) + DQ6_pl(X2, Y2, range(0, 1, 801), range(0, 1, 801).map(x => slope(x, 100)), K.purple, 2);
        if (k >= 5) s += DQ6_pl(X2, Y2, range(0, 1, 801), range(0, 1, 801).map(x => slope(x, beta(v.q63s))), K.orange, 2.4);
        s += DQ6_T(X2(0.5) + 8, Y2(50) + 4, "50", { fs: 11, c: K.purple }) + DQ6_T(X2(0.02), Y2(1.08) - 6, "≈ 1", { fs: 11, c: K.teal });
      }
      if (k >= 4) {
        const SX = DQ6_map(0, 77, 60, 640), SY = DQ6_map(0, 2, 340, 250);
        s += DQ6_ax(60, 250, 590, 90, "optimizer step", "log₁₀ β");
        let d = ""; for (let st = 0; st <= 77; st++) d += (d ? "L" : "M") + SX(st).toFixed(1) + " " + SY(Math.log10(beta(Math.min(76, st)))).toFixed(1); s += `<path d="${d}" fill="none" stroke="${K.ink}" stroke-width="2"/>`;
        [0, 1, 2].forEach(q => s += DQ6_T(54, SY(q) + 4, q, { fs: 10, a: "end", c: K.mute }));
        for (let lv = 0; lv <= 10; lv++) s += DQ6_L(SX(lv * 7), 340, SX(lv * 7), 344, K.mute, 1);
        if (k >= 5) s += DQ6_dot(SX(v.q63s + 0.5), SY(Math.log10(beta(v.q63s))), 5, K.orange);
      }
      return s;
    },
    ro: v => { const b = beta(v.q63s); return [["level", `${Math.floor(v.q63s / 7) + 1} of 11`], ["β", b.toFixed(1)], ["slope at η", (b / (2 * Math.tanh(b / 2))).toFixed(2)], ["range with slope above 0.1", (100 * alive(b)).toFixed(0) + " %"]]; }
  });
}},

/* ---------------- Q6.4 ---------------- */
{s: "Q6.4", t: "What does the erosion and dilation penalty measure, and why is its weight ramped with β?",
intu: String.raw`The filter discourages small features but does not forbid them. The penalty measures how much the projected design changes under two morphological operations with the length scale of the filter, \(R = 120\) nm (Sec. 3.5). An opening (erosion, then dilation) removes GaAs features that are too small, and a closing (dilation, then erosion) fills air gaps that are too small, so a design without such features is unchanged by both. The penalty is the root-mean-square difference between the closed and the opened design. In Tidy3D each operation is a filter plus a projection with threshold 0.99 or 0.01, so it is differentiable. Its weight grows as \(\min(1, \beta/25)\) because the penalty only has meaning once the design is nearly binary: a grey design is changed by both operations whatever its features.`,
eq: String.raw`\[ P_\mathrm{ED} = \frac{1}{\sqrt{N_p}}\, \big\lVert\, \mathcal{C}(\hat{\boldsymbol\rho}) - \mathcal{O}(\hat{\boldsymbol\rho}) \,\big\rVert_2, \qquad J = \mathrm{FOM} - \min\!\left(1,\,\frac{\beta}{25}\right) P_\mathrm{ED} \]<div class="eqref">Ch. 3 Eq. (3.15), Tidy3D, Hammond et al. 2021</div>`,
sym: [[String.raw`\(\mathcal O, \mathcal C\)`, "opening and closing of the projected design"], [String.raw`\(N_p\)`, "number of pixels"], [String.raw`\(\min(1, \beta/25)\)`, "weight of the penalty, 1 from β = 25 on"]],
how: ["Draw a line through the projected design: two wide blocks with a narrow gap, and a thin bar.", "Opening: erode, then dilate. The thin bar disappears, the wide blocks come back.", "Closing: dilate, then erode. The narrow gap fills, everything else comes back.", String.raw`Shade closing minus opening: only the bad features remain. Its RMS over all pixels is \(P_\mathrm{ED}\).`, String.raw`Draw the weight \(\min(1, \beta/25)\) on a log axis with the 11 levels of \(\beta\): it reaches 1 at \(\beta = 25\).`, String.raw`Show why: at small \(\beta\) even a clean design is grey at its edges, and the penalty is large for no good reason. At large \(\beta\) it is small for a clean design.`],
say: "The penalty is the RMS difference between the closing and the opening of the design, which is zero only if no feature or gap is too small for the length scale R. Its weight ramps up with beta because on a grey design the penalty is large whatever the features are.",
num: String.raw`\(R\) = 120 nm. Erosion threshold 0.99, dilation 0.01 (Sec. 3.5).<br>Weight 1 from \(\beta = 25\): level 8 of 11 (\(100^{0.7} = 25.1\)).<br>Demo: 1D cut, 10 nm pixels, a clean design projected at the chosen \(\beta\) in step 6.`,
note: String.raw`<p><b>"Does R = 120 nm in the penalty mean exactly the 120 nm design rule?"</b></p><p>Not exactly. The filter-based erosion and dilation are smooth approximations of true morphology, and where they switch off depends on the cone-shaped kernel and the 0.99 and 0.01 thresholds. Move the sliders to see where it happens in this 1D cut. The penalty steers the design toward large features, and the hard check with the exact rule decides at the end (Sec. 3.5).</p>`,
r(fig, ctl) {
  const N = 240, n = 12;
  const build = v => { const a = new Float64Array(N); const g = Math.round(v.q64g / 10), wb = Math.round(v.q64w / 10); for (let i = 20; i < 70; i++) a[i] = 1; for (let i = 70 + g; i < 110 + g; i++) a[i] = 1; for (let i = 150 + g; i < 150 + g + wb; i++) if (i < N) a[i] = 1; return a; };
  const clean = (() => { const a = new Float64Array(N); for (let i = 20; i < 80; i++) a[i] = 1; for (let i = 120; i < 190; i++) a[i] = 1; return a; })();
  let D = null, E = null, Pb = null;
  const comp = v => { D = build(v); E = C3.ed1D(D, n, 100); const b = Math.pow(100, v.q64b / 10), pr = C3.filter1D(clean, n).map(x => C3.proj(x, b, 0.5)); Pb = { b, pr, P: C3.ed1D(pr, n, 100).P }; };
  const CAP = ["A line through the projected design: two wide blocks separated by a narrow gap, and a thin bar on the right.",
    "Opening (orange): erode then dilate. The thin bar is gone, the wide blocks return.",
    "Closing (purple): dilate then erode. The narrow gap is filled.",
    () => `Closing minus opening (shaded): only the features that break the length scale remain. P_ED = ${E.P.toFixed(3)}.`,
    "The weight min(1, β/25) over the eleven β levels. It reaches 1 at β = 25, level 8.",
    () => `A clean design (no small features) projected at β = ${Pb.b.toFixed(1)}: P_ED = ${Pb.P.toFixed(3)}, weighted ${(Math.min(1, Pb.b / 25) * Pb.P).toFixed(3)}. At small β the grey edges alone make the penalty large.`];
  DQ6_board(fig, ctl, { h: 400, cap: CAP,
    sl: [["q64w", "Thin bar width (nm)", 40, 300, 10, 100, x => x.toFixed(0) + " nm"], ["q64g", "Gap width (nm)", 40, 300, 10, 80, x => x.toFixed(0) + " nm"], ["q64b", "β level (step 6)", 0, 10, 1, 2, x => `${x.toFixed(0)}  (β = ${Math.pow(100, x / 10).toFixed(1)})`]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      const X = DQ6_map(0, N, 60, 640), xs = range(0, N - 1, N);
      const band = (y0, h, arr, c, op, line) => { const Y = DQ6_map(0, 1, y0 + h, y0); let d = `M${X(0)} ${Y(0)}`; arr.forEach((q, i) => d += ` L${X(i).toFixed(1)} ${Y(q).toFixed(1)} L${X(i + 1).toFixed(1)} ${Y(q).toFixed(1)}`); d += ` L${X(N)} ${Y(0)}`; return `<path d="${d}${line ? "" : " Z"}" fill="${line ? "none" : c}" fill-opacity="${op}" stroke="${c}" stroke-width="${line ? 2.2 : 1}"/>`; };
      s += DQ6_T(20, 26, "projected design ρ̂ along a line", { fs: 12, c: K.mute }) + band(34, 50, D, K.blue, 0.35);
      if (k >= 2) { s += DQ6_T(20, 112, k >= 3 ? "opening (orange) and closing (purple)" : "opening", { fs: 12, c: K.mute }) + band(120, 50, D, "#c3cad4", 0.25) + band(120, 50, E.open, K.orange, 0, true); }
      if (k >= 3) s += band(120, 50, E.close, K.purple, 0, true).replace('stroke-width="2.2"', 'stroke-width="2.2" stroke-dasharray="6 3"');
      if (k >= 4) { const diff = E.close.map((c, i) => Math.max(0, c - E.open[i])); s += DQ6_T(20, 198, "closing − opening", { fs: 12, c: K.mute }) + band(206, 40, diff, K.red, 0.45) + DQ6_T(640, 198, `P_ED = ${E.P.toFixed(3)}`, { fs: 13, a: "end", c: K.red, w: 600 }); }
      if (k >= 5) {
        const LX = DQ6_map(0, 2, 60, 330), WY = DQ6_map(0, 1.1, 380, 280);
        s += DQ6_ax(60, 280, 280, 100, "log₁₀ β", "weight");
        const bs = range(0, 2, 101); s += DQ6_pl(LX, WY, bs, bs.map(l => Math.min(1, Math.pow(10, l) / 25)), K.ink, 2);
        for (let lv = 0; lv <= 10; lv++) { const l = lv / 5; s += DQ6_dot(LX(l), WY(Math.min(1, Math.pow(10, l) / 25)), 3.5, lv >= 7 ? K.teal : K.amber); }
        s += DQ6_L(LX(Math.log10(25)), 280, LX(Math.log10(25)), 380, K.mute, 1, "3 3") + DQ6_T(LX(Math.log10(25)) + 4, 372, "β = 25", { fs: 11, c: K.mute });
      }
      if (k >= 6) {
        const Y = DQ6_map(0, 1, 360, 300), X2 = DQ6_map(0, N, 380, 640);
        let d = `M${X2(0)} ${Y(0)}`; Pb.pr.forEach((q, i) => d += ` L${X2(i).toFixed(1)} ${Y(q).toFixed(1)}`); s += `<path d="${d}" fill="none" stroke="${K.blue}" stroke-width="2"/>`;
        s += DQ6_T(380, 290, `clean design at β = ${Pb.b.toFixed(1)}`, { fs: 12, c: K.mute }) + DQ6_T(380, 384, `P_ED = ${Pb.P.toFixed(3)}, weighted ${(Math.min(1, Pb.b / 25) * Pb.P).toFixed(3)}`, { fs: 12, c: K.red });
      }
      return s;
    },
    ro: () => [["P_ED of the design", E.P.toFixed(3)], ["clean design at chosen β", Pb.P.toFixed(3)], ["weight min(1, β/25)", Math.min(1, Pb.b / 25).toFixed(2)]]
  });
}},

/* ---------------- Q6.5 ---------------- */
{s: "Q6.5", t: "Why is the penalty soft, why still a hard design rule check, and why r = 59 nm for a 120 nm rule?",
intu: String.raw`The penalty is subtracted from the figure of merit, so the optimizer can trade a little penalty for a lot of performance: it discourages small features but does not forbid them (Sec. 3.5). The final binary layout therefore has to pass a hard design rule check with three rules: GaAs width at least 120 nm, air gap at least 120 nm, and area at least \((120\ \mathrm{nm})^2\) for any island or hole. The check runs two independent ways, the width and space checks of KLayout and morphology with a disk in Shapely, and a design is accepted only if both are clean, so a blind spot of one method is caught by the other. The disk radius is \(r = 59\) nm, half the rule minus 1 nm, so that a feature exactly at the limit is not flagged by rounding.`,
eq: String.raw`\[ X \setminus \mathrm{open}_r(X) = \varnothing, \qquad \mathrm{close}_r(X) \setminus X = \varnothing \quad (\text{zero area}) \]\[ r = \tfrac12\,(120\ \mathrm{nm}) - 1\ \mathrm{nm} = 59\ \mathrm{nm} \]<div class="eqref">Ch. 3 Sec. 3.5, KLayout and Shapely</div>`,
sym: [[String.raw`\(X\)`, "GaAs region of the layout"], [String.raw`\(\mathrm{open}_r, \mathrm{close}_r\)`, "opening and closing with a disk of radius r"], [String.raw`\(\varnothing\)`, "empty: nothing removed, nothing filled"]],
how: ["Draw the layout with a narrow gap between two blocks and a thin bar, and write the three rules.", String.raw`Roll a disk of radius \(r\) inside the GaAs (opening). Where it cannot fit, GaAs is removed: that part is narrower than \(2r\), a width violation. Sharp corners would be nibbled too, which is why outlines need rounded corners.`, String.raw`Roll the disk through the air (closing). Gaps it cannot pass through get filled: a space violation.`, "Second, independent method: KLayout measures the distance between facing edges and flags pairs closer than 120 nm.", "Accept the design only if both methods find nothing.", String.raw`Why 59 nm: with \(r = 60\) nm a feature exactly 120 nm wide is a borderline case, and rounding can flag it. One nanometre of slack avoids false alarms. Features from 118 to 120 nm still fail the KLayout check.`],
say: "The penalty only discourages small features, so the final layout must pass a hard check of width, gap and area. I run it two independent ways and accept the design only if both are clean, with a disk of 59 nm so that a feature exactly at 120 nm is not flagged by rounding.",
num: String.raw`Rules: width ≥ 120 nm, gap ≥ 120 nm, area ≥ \((120\ \mathrm{nm})^2\) = 14,400 nm².<br>Disk \(r\) = 59 nm: morphology flags features below 118 nm, KLayout below 120 nm.<br>Demo: 5 nm pixels and an exact distance transform, as a picture of the polygon checks.`,
note: String.raw`<p><b>"Why a minimum area rule if width is already checked?"</b></p><p>Because a small round island or hole can pass the width check and still be too small to write and keep reliably. A disk 130 nm across is wider than 120 nm, but its area is \(\pi(65\ \mathrm{nm})^2 \approx 13{,}300\ \mathrm{nm}^2\), below 14,400 nm², so the area rule catches it.</p>`,
r(fig, ctl) {
  const W = 130, H = 110, px = 5;
  let X0 = null, O = null, Cl = null, rem = null, fil = null;
  const build = v => { const X = new Uint8Array(W * H), g = Math.round(v.q65g / px), nb = Math.round(v.q65w / px); C3.rrect(X, W, H, 4, 4, 60, 40, 14, 1); C3.rrect(X, W, H, 60 + g, 4, 126, 40, 14, 1); C3.rrect(X, W, H, 10, 86 - nb / 2, 120, 86 - nb / 2 + nb, nb / 2, 1); return X; };
  const comp = v => { X0 = build(v); const d = C3.drc(X0, W, H, v.q65r / px, 0, 12); rem = d.solid; fil = d.gap; };
  const kl = v => ({ w: v.q65w < 120, g: v.q65g < 120 });
  const CAP = ["The layout: two blocks with a gap between them (top) and a thin bar (bottom). Corners are rounded, because the rolling disk would also flag sharp corners.",
    v => `Opening with a disk of r = ${v.q65r} nm: GaAs the disk cannot reach is removed (red), ${(DQ6_area(rem) * 25).toLocaleString("en-US")} nm². Nonzero means a width violation.`,
    v => `Closing: air the disk cannot pass through is filled (orange), ${(DQ6_area(fil) * 25).toLocaleString("en-US")} nm². Nonzero means a gap violation.`,
    "KLayout, independently: facing edges closer than 120 nm are flagged (markers).",
    v => { const k1 = kl(v), ok = !k1.w && !k1.g && !DQ6_area(rem) && !DQ6_area(fil); return ok ? "Both methods are clean: the design is accepted." : "At least one method finds a violation: the design is rejected."; },
    "Rounding: set the bar to exactly 120 nm and the radius to 60 nm. On a grid the disk only just fits, and the bar is flagged. At 59 nm it passes, and KLayout still guards the 118 to 120 nm range. Specks of a few pixels from staircase edges are ignored."];
  DQ6_board(fig, ctl, { h: 380, cap: CAP,
    sl: [["q65w", "Bar width (nm)", 60, 200, 5, 100, x => x.toFixed(0) + " nm"], ["q65g", "Gap width (nm)", 60, 200, 5, 140, x => x.toFixed(0) + " nm"], ["q65r", "Disk radius r (nm)", 50, 66, 1, 59, x => x.toFixed(0) + " nm"]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ6_K, sc = 3, x0 = 24, y0 = 30; let s = "";
      const over = []; if (k >= 2) over.push([rem, "#e0533d"]); if (k >= 3) over.push([fil, "#f0a04b"]);
      s += DQ6_rects(X0, W, H, x0, y0, sc, over);
      const r = v.q65r / px;
      if (k === 2) s += `<circle cx="${x0 + 65 * sc}" cy="${y0 + 86 * sc}" r="${r * sc}" fill="none" stroke="${K.red}" stroke-width="2"/>` + `<circle cx="${x0 + 30 * sc}" cy="${y0 + 19 * sc}" r="${r * sc}" fill="none" stroke="${K.red}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
      if (k === 3) s += `<circle cx="${x0 + (60 + v.q65g / px / 2) * sc}" cy="${y0 + 19 * sc}" r="${r * sc}" fill="none" stroke="${K.orange}" stroke-width="2"/>`;
      if (k >= 4) { const k1 = kl(v); if (k1.w) s += DQ6_A(x0 + 65 * sc, y0 + 56 * sc, x0 + 65 * sc, y0 + 74 * sc, K.purple, 2.2) + DQ6_T(x0 + 70 * sc, y0 + 58 * sc, "width", { fs: 12, c: K.purple }); if (k1.g) s += DQ6_A(x0 + (60 + v.q65g / px / 2) * sc, y0 + 52 * sc, x0 + (60 + v.q65g / px / 2) * sc, y0 + 36 * sc, K.purple, 2.2) + DQ6_T(x0 + (64 + v.q65g / px / 2) * sc, y0 + 52 * sc, "space", { fs: 12, c: K.purple }); }
      const rx = 440; s += DQ6_T(rx, 50, "rules", { fs: 13, w: 600 }) + DQ6_T(rx, 72, "GaAs width ≥ 120 nm", { fs: 13 }) + DQ6_T(rx, 92, "air gap ≥ 120 nm", { fs: 13 }) + DQ6_T(rx, 112, "area ≥ (120 nm)²", { fs: 13 });
      if (k >= 2) s += DQ6_T(rx, 150, `morphology, r = ${v.q65r} nm`, { fs: 13, w: 600 }) + DQ6_T(rx, 172, `removed: ${(DQ6_area(rem) * 25).toLocaleString("en-US")} nm²`, { fs: 13, c: DQ6_area(rem) ? K.red : K.teal }) + (k >= 3 ? DQ6_T(rx, 192, `filled: ${(DQ6_area(fil) * 25).toLocaleString("en-US")} nm²`, { fs: 13, c: DQ6_area(fil) ? K.orange : K.teal }) : "");
      if (k >= 4) { const k1 = kl(v); s += DQ6_T(rx, 230, "KLayout, 120 nm", { fs: 13, w: 600 }) + DQ6_T(rx, 252, `width: ${k1.w ? "violation" : "clean"}`, { fs: 13, c: k1.w ? K.red : K.teal }) + DQ6_T(rx, 272, `space: ${k1.g ? "violation" : "clean"}`, { fs: 13, c: k1.g ? K.red : K.teal }); }
      if (k >= 5) { const k1 = kl(v), ok = !k1.w && !k1.g && !DQ6_area(rem) && !DQ6_area(fil); s += DQ6_R(rx - 6, 296, 220, 40, ok ? "#e3f4ec" : "#fbe5e0", ok ? K.teal : K.red) + DQ6_T(rx + 104, 322, ok ? "accepted ✓" : "rejected ✗", { fs: 16, a: "middle", c: ok ? K.teal : K.red, w: 600 }); }
      s += DQ6_T(x0, y0 + H * sc + 18, "5 nm pixels, air beyond the border", { fs: 11, c: K.mute });
      return s;
    },
    ro: v => { const k1 = kl(v); return [["opening removed", (DQ6_area(rem) * 25).toLocaleString("en-US") + " nm²"], ["closing filled", (DQ6_area(fil) * 25).toLocaleString("en-US") + " nm²"], ["KLayout", k1.w || k1.g ? "violation" : "clean"]]; }
  });
}},

/* ---------------- Q6.6 ---------------- */
{s: "Q6.6", t: "Why can the repair lower the performance, and how is that recovered?",
intu: String.raw`A design that fails the check is repaired with a closing and then an opening, both with \(r = 63\) nm (Eq. 3.17). The closing fills every air gap narrower than \(2r\), and the opening then removes every GaAs feature narrower than \(2r\). The radius is 3 nm larger than half the rule so that rounding the layout to a 1 nm grid cannot create a new violation. But the repair changes the geometry and rounds the corners, so the device is no longer the one that was optimized, and its performance can drop. Hammond et al. make exactly this point: a device changed after the optimization no longer has the optimized geometry. So the repaired outline is optimized again, now as a polygon with boundary vertices (Eq. 3.11) and the curvature penalty, and every five steps it is checked and repaired again. Only designs that pass the check are kept (Sec. 3.5).`,
eq: String.raw`\[ X_\mathrm{healed} = \mathrm{open}_r\big(\mathrm{close}_r(X)\big), \qquad r = 63\ \mathrm{nm} \]<div class="eqref">Ch. 3 Eq. (3.17)</div>\[ \mathbf{r}_i = \mathbf{r}_i^{(0)} + \Delta_\mathrm{max}\tanh(p_i)\,\hat{\mathbf{n}}_i, \qquad \Delta_\mathrm{max} = 15\ \mathrm{nm} \]<div class="eqref">Ch. 3 Eq. (3.11): the DRC-safe shape optimization, 395 free vertices</div>`,
sym: [[String.raw`\(X_\mathrm{healed}\)`, "repaired GaAs region"], [String.raw`\(\mathbf r_i^{(0)}, \hat{\mathbf n}_i\)`, "starting position and outward normal of vertex i"], [String.raw`\(\Delta_\mathrm{max}\)`, "largest move of a vertex, 15 nm"]],
how: ["Draw a failing layout: an 80 nm gap between two blocks and an 80 nm finger, with the violations marked.", String.raw`Closing with \(r = 63\) nm: the gap fills, and inside corners round.`, "Opening with the same r: the finger disappears, and outside corners round.", "The healed layout passes the check, but it is a different device, so its figure of merit can drop.", "Recover it: optimize the outline again with vertices moving along their normals and the curvature penalty, checking and repairing every five steps, keeping only passing designs."],
say: "The repair closes and then opens the layout with a 63 nanometre disk, which removes every violation but changes the optimized geometry, so performance can drop. The repaired outline is then optimized again as a polygon under the rules, with a check and repair every five steps.",
num: String.raw`\(r\) = 63 nm = 60 nm + 3 nm margin for rounding to a 1 nm grid. Fills gaps and removes features narrower than \(2r\) = 126 nm.<br>Shape stage: 395 free vertices, \(\Delta_\mathrm{max}\) = 15 nm, check every 5 steps (Sec. 3.3, 3.5).`,
note: String.raw`<p><b>"Why not impose the rules exactly from the start?"</b></p><p>On a pixel grid with grey densities the exact rules cannot be stated as smooth functions, so the topology stage uses the soft penalty. Once the design is a polygon, widths and gaps are exact, and the shape stage can stay legal at every step. The thesis therefore builds the rules in stage by stage, soft penalties first, then the hard check and repair, then shape optimization within the rules, in the spirit of Hammond et al. 2021.</p>`,
r(fig, ctl) {
  const W = 130, H = 90, px = 5;
  const X0 = new Uint8Array(W * H); C3.rrect(X0, W, H, 4, 4, 54, 86, 0, 1); C3.rrect(X0, W, H, 70, 4, 124, 40, 0, 1); C3.rrect(X0, W, H, 100, 40, 116, 86, 0, 1);
  const chk = (X, r) => { const d = C3.drc(X, W, H, r, 0, 12); return { rem: d.solid, fil: d.gap }; };
  const V0 = chk(X0, 59 / px);
  let Cl = null, Hl = null, add = null, cut = null, V1 = null;
  const comp = v => { const r = v.q66r / px; Cl = C3.bClose(X0, W, H, r, 0); Hl = C3.bOpen(Cl, W, H, r, 0); add = Cl.map((q, i) => q && !X0[i] ? 1 : 0); cut = Cl.map((q, i) => q && !Hl[i] ? 1 : 0); V1 = chk(Hl, 59 / px); };
  const CAP = ["A failing layout: an 80 nm gap between the blocks and an 80 nm finger. The check (r = 59 nm) marks both, and the sharp corners too (red and orange).",
    v => `Closing with r = ${v.q66r} nm: the gap is filled (purple, ${(DQ6_area(add) * 25).toLocaleString("en-US")} nm²) and the inside corners round.`,
    v => `Opening with the same r: the finger is removed (red, ${(DQ6_area(cut) * 25).toLocaleString("en-US")} nm²) and the outside corners round.`,
    v => { const ok = !DQ6_area(V1.rem) && !DQ6_area(V1.fil); return `The healed layout ${ok ? "passes" : "still fails"} the check. But it is a different device from the one that was optimized, so its figure of merit can drop.`; },
    "Recovery (illustration): the outline is optimized again with moving vertices and the curvature penalty. Every five steps it is checked and repaired (ticks), and only passing designs are kept."];
  DQ6_board(fig, ctl, { h: 340, cap: CAP,
    sl: [["q66r", "Repair radius r (nm)", 50, 70, 1, 63, x => x.toFixed(0) + " nm"]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ6_K, sc = 3; let s = "";
      const x0 = 24, y0 = 34;
      if (k === 1) s += DQ6_rects(X0, W, H, x0, y0, sc, [[V0.rem, "#e0533d"], [V0.fil, "#f0a04b"]]);
      if (k === 2) s += DQ6_rects(Cl, W, H, x0, y0, sc, [[add, K.purple]]);
      if (k === 3) s += DQ6_rects(Cl, W, H, x0, y0, sc, [[cut, "#e0533d"]]);
      if (k >= 4) s += DQ6_rects(Hl, W, H, x0, y0, sc, [[V1.rem, "#e0533d"], [V1.fil, "#f0a04b"]]);
      s += DQ6_T(x0, y0 - 10, ["original layout and its violations", "after the closing", "after the opening", "healed layout", "healed layout"][k - 1], { fs: 12, c: K.mute });
      const rx = 440;
      if (k <= 3) { s += DQ6_T(rx, 60, "repair = open(close(X))", { fs: 14, w: 600 }) + DQ6_T(rx, 86, `r = ${v.q66r} nm, 2r = ${2 * v.q66r} nm`, { fs: 13 }) + DQ6_T(rx, 110, "closing fills gaps below 2r", { fs: 13, c: K.purple }) + DQ6_T(rx, 132, "opening removes features below 2r", { fs: 13, c: K.red }); }
      if (k === 4) { const ok = !DQ6_area(V1.rem) && !DQ6_area(V1.fil); s += DQ6_R(rx - 6, 50, 220, 40, ok ? "#e3f4ec" : "#fbe5e0", ok ? K.teal : K.red) + DQ6_T(rx + 104, 76, ok ? "passes the check ✓" : "still fails ✗", { fs: 15, a: "middle", c: ok ? K.teal : K.red, w: 600 }) + DQ6_T(rx, 124, "but the geometry changed:", { fs: 13 }) + DQ6_T(rx, 146, "gap filled, finger gone,", { fs: 13 }) + DQ6_T(rx, 168, "corners rounded", { fs: 13 }) + DQ6_T(rx, 200, "→ the FOM can drop", { fs: 14, c: K.red, w: 600 }); }
      if (k >= 5) {
        const gx = 420, gy = 50, gw = 230, gh = 150, TX = DQ6_map(0, 30, gx, gx + gw), TY = DQ6_map(0, 1, gy + gh, gy);
        s += DQ6_ax(gx, gy, gw + 10, gh, "shape step", "FOM");
        const f = t => 0.62 + 0.3 * (1 - Math.exp(-t / 9)) - (t % 5 === 0 && t > 0 ? 0.02 : 0);
        const ts = range(0, 30, 31); s += DQ6_pl(TX, TY, ts, ts.map(f), K.teal, 2.2);
        for (let t = 5; t <= 30; t += 5) s += DQ6_L(TX(t), gy + gh, TX(t), gy + gh - 8, K.ink, 1.4);
        s += DQ6_L(gx, TY(0.95), gx + gw, TY(0.95), K.mute, 1, "4 3") + DQ6_T(gx + gw, TY(0.95) - 6, "before repair", { fs: 11, a: "end", c: K.mute });
        s += DQ6_T(gx, gy + gh + 34, "illustration, not thesis data", { fs: 11, c: K.mute });
      }
      return s;
    },
    ro: () => [["filled by closing", (DQ6_area(add) * 25).toLocaleString("en-US") + " nm²"], ["removed by opening", (DQ6_area(cut) * 25).toLocaleString("en-US") + " nm²"], ["check after repair", !DQ6_area(V1.rem) && !DQ6_area(V1.fil) ? "pass" : "fail"]]
  });
}},

/* ---------------- Q6.7 ---------------- */
{s: "Q6.7", t: "Why a curvature penalty for the outlines?",
intu: String.raw`Electron-beam lithography and etching never reproduce a sharp corner: it comes out rounded, so a design that relies on one is not the device that gets made. Sharp corners are also where the design rules are hardest to keep. For the tapers and the PBS outline, a penalty therefore charges small local radii (Sec. 3.5). At each vertex the radius \(r_i\) is estimated from a quadratic curve through that vertex and its two neighbours, a logistic function switches the charge on when \(r_i\) falls below \(r_\mathrm{min}\), and the charges are averaged over the vertices (Eq. 3.16). The penalty is smooth, so its gradient tells each vertex how to move to open up its radius, and it is nearly zero where the outline is already gentle.`,
eq: String.raw`\[ P_\kappa = \frac{1}{N_v} \sum_{i} \frac{e^{-\kappa (r_i - r_\mathrm{min})}}{1 + e^{-\kappa (r_i - r_\mathrm{min})}}, \qquad J = F - w_\kappa P_\kappa \]<div class="eqref">Ch. 3 Eq. (3.16), Michaels and Yablonovitch 2018, Eqs. (17), (34) and (35), Tidy3D</div>`,
sym: [[String.raw`\(r_i\)`, "local radius at vertex i, from a quadratic curve through it and its neighbours"], [String.raw`\(r_\mathrm{min}\)`, "radius below which the charge switches on"], [String.raw`\(\kappa\)`, "how sharply the charge switches off above the minimum"], [String.raw`\(N_v, w_\kappa\)`, "number of vertices with two neighbours, and the weight"]],
how: ["Draw the outline as its vertices, here a taper half-width with a corner in the middle.", String.raw`Pick a vertex and its two neighbours, draw the quadratic curve through them and its circle of radius \(r_i\).`, String.raw`Draw the logistic charge against \(r\): close to 1 below \(r_\mathrm{min}\), close to 0 above it, with \(\kappa\) setting the width of the switch.`, "Colour every vertex by its charge: only the corner lights up.", String.raw`Average the charges into \(P_\kappa\) and subtract \(w_\kappa P_\kappa\) from F. The gradient pushes the corner vertices to round it off.`],
say: "A sharp corner is never fabricated as drawn, so the outline pays a smooth penalty wherever its local radius drops below a minimum. The radius comes from a quadratic through three neighbouring vertices, and a logistic switch makes the penalty differentiable and zero for gentle curves.",
num: String.raw`Taper: 4 µm long, \(M = 81\) points, one vertex every <b>50 nm</b> (Sec. 3.3).<br>The thesis fixes the form of the penalty. \(r_\mathrm{min}\) and \(\kappa\) on the sliders are example values.`,
note: String.raw`<p><b>"Why a logistic and not a hard minimum radius?"</b></p><p>A hard limit has no useful gradient: it is either met or not. The logistic is smooth, nearly zero above \(r_\mathrm{min}\), so it does not fight the figure of merit where the outline is already gentle, and close to 1 below it. \(\kappa\) trades a gentle shaping force against a nearly hard limit.</p>`,
r(fig, ctl) {
  const L = 4000, M = 81;
  let pts = null, cp = null;
  const comp = v => { const su = v.q67s / L; const sp = z => su * Math.log1p(Math.exp(z / su)); pts = range(0, L, M).map(x => { const u = x / L; return [x, 100 + 850 * (0.2 * u + 1.6 * (sp(u - 0.5) - sp(-0.5)))]; }); const yE = pts[M - 1][1]; pts = pts.map(([x, y]) => [x, 100 + (y - 100) * 850 / (yE - 100)]); cp = C3.curvPenalty(pts, v.q67m, v.q67k / 1000, false); };
  const X = DQ6_map(0, L, 60, 620), Y = DQ6_map(0, 180 * L / 560, 220, 40), sx = 560 / L, sy = 560 / L;
  const CAP = ["The outline as vertices: half the width of a 4 µm taper, one vertex every 50 nm, with a corner in the middle.",
    () => { const j = cp.r.indexOf(Math.min(...cp.r)); return `The tightest vertex: a quadratic curve through it and its two neighbours, and the circle with its radius, r = ${cp.r[j].toFixed(0)} nm.`; },
    v => `The logistic charge: about 1 below r_min = ${v.q67m} nm and about 0 above it. κ sets how sharp the switch is.`,
    "Every vertex coloured by its charge. Only the corner lights up, the straight parts cost nothing.",
    () => `P_κ = mean charge = ${cp.P.toFixed(3)}. Subtracting w_κ P_κ from F makes the optimizer round the corner off.`];
  DQ6_board(fig, ctl, { h: 400, cap: CAP,
    sl: [["q67s", "Corner smoothing (nm)", 5, 400, 5, 20, x => x.toFixed(0) + " nm"], ["q67m", "r_min (nm)", 200, 3000, 50, 1000, x => x.toFixed(0) + " nm"], ["q67k", "κ (per µm)", 2, 50, 1, 10, x => x.toFixed(0)]],
    init: comp, onInput: comp,
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      s += DQ6_ax(60, 40, 570, 180, "x along the taper", "half-width y");
      s += DQ6_pl(X, Y, pts.map(p => p[0]), pts.map(p => p[1]), "#9aa4b2", 1.4);
      const idx = cp.idx;
      pts.forEach((p, i) => { const j = idx.indexOf(i), ch = k >= 4 && j >= 0 ? cp.terms[j] : 0; s += DQ6_dot(X(p[0]), Y(p[1]), k >= 4 ? 2.4 + 3 * ch : 2.2, k >= 4 ? (ch > 0.05 ? K.red : K.ink) : K.ink, k >= 4 && ch > 0.05 ? K.red : "#fff"); });
      if (k >= 2) {
        const j = cp.r.indexOf(Math.min(...cp.r)), i = idx[j], p0 = pts[i - 1], pc = pts[i], p2 = pts[i + 1], r = cp.r[j];
        const kk = C3.bezierK(p0, pc, p2), t = [p2[0] - p0[0], p2[1] - p0[1]], tn = Math.hypot(t[0], t[1]), nrm = [-t[1] / tn * Math.sign(kk), t[0] / tn * Math.sign(kk)];
        const c = [pc[0] + r * nrm[0], pc[1] + r * nrm[1]];
        s += `<ellipse cx="${X(c[0]).toFixed(1)}" cy="${Y(c[1]).toFixed(1)}" rx="${(r * sx).toFixed(1)}" ry="${(r * sy).toFixed(1)}" fill="none" stroke="${K.orange}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
        s += [p0, pc, p2].map(p => DQ6_dot(X(p[0]), Y(p[1]), 4.5, K.orange)).join("");
        s += DQ6_T(X(pc[0]) + 10, Y(pc[1]) + 22, `r = ${r.toFixed(0)} nm`, { fs: 12, c: K.orange });
      }
      if (k >= 3) {
        const gx = 60, gy = 270, gw = 380, gh = 100, RX = DQ6_map(1, 5, gx, gx + gw), PY = DQ6_map(0, 1.05, gy + gh, gy), ls = range(1, 5, 300);
        s += DQ6_ax(gx, gy, gw + 10, gh, "log₁₀ r (nm)", "charge");
        s += DQ6_pl(RX, PY, ls, ls.map(l => C3.curvTerm(Math.pow(10, l), v.q67m, v.q67k / 1000)), K.red, 2.2);
        s += DQ6_L(RX(Math.log10(v.q67m)), gy, RX(Math.log10(v.q67m)), gy + gh, K.mute, 1, "3 3") + DQ6_T(RX(Math.log10(v.q67m)) + 4, gy + 12, "r_min", { fs: 11, c: K.mute });
        [1, 2, 3, 4].forEach(q => s += DQ6_T(RX(q), gy + gh + 13, q, { fs: 10, a: "middle", c: K.mute }));
        if (k >= 4) cp.r.forEach((r, j) => { const l = Math.max(1, Math.min(5, Math.log10(r))); s += DQ6_dot(RX(l), PY(cp.terms[j]), 2.6, cp.terms[j] > 0.05 ? K.red : K.ink); });
      }
      if (k >= 5) s += DQ6_T(470, 300, `P_κ = ${cp.P.toFixed(3)}`, { fs: 16, w: 600, c: K.red }) + DQ6_T(470, 328, "J = F − w_κ P_κ", { fs: 15 });
      return s;
    },
    ro: () => [["smallest radius", Math.min(...cp.r).toFixed(0) + " nm"], ["vertices charged above 0.5", String(cp.terms.filter(t => t > 0.5).length)], ["P_κ", cp.P.toFixed(4)]]
  });
}},

/* ---------------- Q6.8 ---------------- */
{s: "Q6.8", t: "Why optimize over a band with Gaussian weights, and what do ER and IL tell you?",
intu: String.raw`Optimizing at a single wavelength tends to produce narrow resonances (Sec. 3.4): the optimizer finds a design that is excellent at exactly 795 nm and poor a few nanometres away, which no fabricated device or real emitter would tolerate. So the grating and PBS objectives average the transmission over a band with normalized Gaussian weights centred at 795 nm (Eq. 3.13). The centre counts most, but a narrow peak no longer wins. A splitter is then reported, for each input polarization, by the power reaching the intended port and the power leaking into the other one, as an extinction ratio and an insertion loss (Eq. 3.18), over the band where both polarizations reach at least 0.8.`,
eq: String.raw`\[ \bar T = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\big[-(\lambda_i-\lambda_0)^2/(2\sigma^2)\big]}{\sum_j \exp\!\big[-(\lambda_j-\lambda_0)^2/(2\sigma^2)\big]} \]<div class="eqref">Ch. 3 Eq. (3.13)</div>\[ \mathrm{ER} = 10\log_{10}\frac{T_\mathrm{target}}{T_\mathrm{leak}}, \qquad \mathrm{IL} = -10\log_{10} T_\mathrm{target} \]<div class="eqref">Ch. 3 Eq. (3.18)</div>`,
sym: [[String.raw`\(w_i\)`, "normalized Gaussian weight of wavelength i, the weights sum to 1"], [String.raw`\(\sigma\)`, "width of the weighting, 8 nm (PBS) and 8.5 nm (gratings)"], [String.raw`\(T_\mathrm{target}, T_\mathrm{leak}\)`, "transmission into the intended port and into the other port"]],
how: [String.raw`Draw the 101 wavelengths of the band with their Gaussian weights centred at 795 nm.`, "Draw two candidate spectra: a narrow resonance that peaks high, and a broad response that peaks lower.", "At 795 nm alone the narrow one wins.", "Weighted over the band, the broad one wins once the weighting is wider than the resonance.", String.raw`For a splitter, draw \(T_\mathrm{target}\) and \(T_\mathrm{leak}\) for both polarizations. At any wavelength ER is their ratio in dB and IL the loss of the target in dB. Shade the band where both targets reach 0.8.`],
say: "A single-wavelength objective rewards narrow resonances, so I average the transmission over a band with Gaussian weights centred at 795 nm. For the splitter I report the extinction ratio, the target over the leak in dB, and the insertion loss, over the band where both polarizations stay above 0.8.",
num: String.raw`PBS: 101 wavelengths, 735 to 835 nm, \(\sigma\) = 8 nm. Gratings: 745 to 845 nm, \(\sigma\) = 8.5 nm. Tapers: 795 nm only (Sec. 3.4).<br>\(T_\mathrm{target} = 0.8\) means IL = <b>0.97 dB</b>. ER = 20 dB means the leak is 1 % of the target.<br>The spectra on the board are illustrations.`,
note: String.raw`<p><b>"Why Gaussian weights and not a flat band?"</b></p><p>The quantum dot emits at 795 nm, so that wavelength should count most, but neighbours must count too so that a narrow peak cannot win. A Gaussian does both smoothly, and normalizing the weights keeps \(\bar T\) between 0 and 1, comparable with a single transmission. The 0.8 threshold for the operating band corresponds to about 1 dB of insertion loss.</p>`,
r(fig, ctl) {
  const ls = range(745, 845, 101), TA = l => 0.97 / (1 + ((l - 795) / 3) ** 2), TB = l => 0.82 * Math.exp(-((l - 795) ** 2) / (2 * 45 * 45));
  const wts = sg => { const w = ls.map(l => Math.exp(-((l - 795) ** 2) / (2 * sg * sg))), S = w.reduce((a, b) => a + b, 0); return w.map(x => x / S); };
  const avg = (T, sg) => { const w = wts(sg); return ls.reduce((s, l, i) => s + w[i] * T(l), 0); };
  const pl2 = range(735, 835, 201), TEt = l => 0.93 * Math.exp(-(((l - 788) / 42) ** 4)), TMt = l => 0.9 * Math.exp(-(((l - 800) / 38) ** 4)), TEl = l => 0.004 + 0.02 * ((l - 788) / 50) ** 2, TMl = l => 0.006 + 0.025 * ((l - 800) / 50) ** 2;
  const CAP = [v => `The 101 band wavelengths with normalized Gaussian weights, σ = ${v.q68s} nm. The weights add up to 1.`,
    "Two candidate designs: A, a narrow resonance peaking at 0.97, and B, a broad response peaking at 0.82 (illustrations).",
    "At 795 nm alone: A = 0.97 beats B = 0.82. A single-wavelength objective would pick A.",
    v => `Weighted over the band: A = ${avg(TA, v.q68s).toFixed(3)}, B = ${avg(TB, v.q68s).toFixed(3)}. ${avg(TB, v.q68s) > avg(TA, v.q68s) ? "B wins." : "A still wins: make σ wider than the resonance."}`,
    v => `A splitter (illustration): at ${v.q68l} nm, TE: ER = ${(10 * Math.log10(TEt(v.q68l) / TEl(v.q68l))).toFixed(1)} dB, IL = ${(-10 * Math.log10(TEt(v.q68l))).toFixed(2)} dB. Shaded: both targets at least 0.8.`];
  DQ6_board(fig, ctl, { h: 360, cap: CAP,
    sl: [["q68s", "Weight width σ (nm)", 1, 30, 0.5, 8.5, x => x.toFixed(1) + " nm"], ["q68l", "Wavelength (step 5, nm)", 735, 835, 1, 795, x => x.toFixed(0) + " nm"]],
    draw: (k, v) => {
      const K = DQ6_K; let s = "";
      if (k <= 4) {
        const X = DQ6_map(745, 845, 60, 640), Y = DQ6_map(0, 1.05, 300, 40), w = wts(v.q68s), mw = Math.max(...w);
        s += DQ6_ax(60, 40, 590, 260, "λ (nm)", "T and weights");
        [745, 795].forEach(l => s += DQ6_T(X(l), 316, l, { fs: 10, a: "middle", c: K.mute }));
        ls.forEach((l, i) => s += DQ6_R(X(l) - 2, Y(0.3 * w[i] / mw), 4, Y(0) - Y(0.3 * w[i] / mw), K.amber, null, 0.6));
        const lf = range(745, 845, 401);
        if (k >= 2) s += DQ6_pl(X, Y, lf, lf.map(TA), K.purple, 2.2) + DQ6_pl(X, Y, lf, lf.map(TB), K.teal, 2.2) + DQ6_T(X(799), Y(0.97) + 4, "A", { fs: 13, c: K.purple, w: 600 }) + DQ6_T(X(840), Y(TB(840)) - 8, "B", { fs: 13, c: K.teal, w: 600 });
        if (k >= 3) s += DQ6_L(X(795), 40, X(795), 300, K.mute, 1, "3 3") + DQ6_dot(X(795), Y(TA(795)), 5, K.purple) + DQ6_dot(X(795), Y(TB(795)), 5, K.teal);
        if (k >= 4) { const a = avg(TA, v.q68s), b = avg(TB, v.q68s); s += DQ6_L(60, Y(a), 640, Y(a), K.purple, 1.4, "6 4") + DQ6_L(60, Y(b), 640, Y(b), K.teal, 1.4, "6 4") + DQ6_T(636, Y(a) - 5, `T̄ A = ${a.toFixed(2)}`, { fs: 12, a: "end", c: K.purple }) + DQ6_T(636, Y(b) - 5, `T̄ B = ${b.toFixed(2)}`, { fs: 12, a: "end", c: K.teal }); }
        return s;
      }
      const X = DQ6_map(735, 835, 60, 640), Y = DQ6_map(0, 1.05, 300, 40);
      let lo = null, hi = null; pl2.forEach(l => { if (TEt(l) >= 0.8 && TMt(l) >= 0.8) { if (lo === null) lo = l; hi = l; } });
      if (lo !== null) s += DQ6_R(X(lo), 40, X(hi) - X(lo), 260, K.teal, null, 0.1) + DQ6_T((X(lo) + X(hi)) / 2, 56, "operating band", { fs: 12, a: "middle", c: K.teal });
      s += DQ6_ax(60, 40, 590, 260, "λ (nm)", "T");
      [735, 785].forEach(l => s += DQ6_T(X(l), 316, l, { fs: 10, a: "middle", c: K.mute }));
      s += DQ6_L(60, Y(0.8), 640, Y(0.8), K.mute, 1, "3 3") + DQ6_T(64, Y(0.8) - 5, "0.8", { fs: 11, c: K.mute });
      s += DQ6_pl(X, Y, pl2, pl2.map(TEt), K.blue, 2.2) + DQ6_pl(X, Y, pl2, pl2.map(TMt), K.orange, 2.2) + DQ6_pl(X, Y, pl2, pl2.map(TEl), K.blue, 1.6, "5 4") + DQ6_pl(X, Y, pl2, pl2.map(TMl), K.orange, 1.6, "5 4");
      s += DQ6_T(X(745), Y(0.62), "TE target", { fs: 12, c: K.blue }) + DQ6_T(X(820), Y(0.6), "TM target", { fs: 12, c: K.orange }) + DQ6_T(X(745), Y(0.08), "leaks (dashed)", { fs: 12, c: K.mute });
      s += DQ6_L(X(v.q68l), 40, X(v.q68l), 300, K.ink, 1.2) + DQ6_dot(X(v.q68l), Y(TEt(v.q68l)), 4.5, K.blue) + DQ6_dot(X(v.q68l), Y(TMt(v.q68l)), 4.5, K.orange);
      return s;
    },
    ro: (v, k) => { const l = v.q68l; return k >= 5 ? [["TE: ER", (10 * Math.log10(TEt(l) / TEl(l))).toFixed(1) + " dB"], ["TE: IL", (-10 * Math.log10(TEt(l))).toFixed(2) + " dB"], ["TM: ER", (10 * Math.log10(TMt(l) / TMl(l))).toFixed(1) + " dB"], ["TM: IL", (-10 * Math.log10(TMt(l))).toFixed(2) + " dB"]] : [["T̄ of A", avg(TA, v.q68s).toFixed(3)], ["T̄ of B", avg(TB, v.q68s).toFixed(3)]]; }
  });
}}

],
summary: String.raw`Bounded quantities go through tanh maps (Eqs. 3.6, 3.7, 3.11), so any optimizer step stays inside the limits and the slope never dies as it would with clipping. Pixel densities are filtered with a cone of radius 120 nm, which removes pixel noise but makes them grey, and projected with a tanh, which makes them binary again (Eqs. 3.8 to 3.10). The sharpness \(\beta\) rises from 1 to 100 in 11 geometric levels of 7 steps, because a sharp projection starves most pixels of gradient. The erosion and dilation penalty, the RMS of closing minus opening, punishes features too small for the length scale, with a weight \(\min(1, \beta/25)\) since it is only meaningful on a nearly binary design (Eq. 3.15). Being soft, it is followed by a hard check run two ways with \(r = 59\) nm, a repair with \(r = 63\) nm (Eq. 3.17) and a DRC-safe shape optimization with a curvature penalty (Eq. 3.16). Objectives are Gaussian-weighted band averages (Eq. 3.13), and the splitter is reported by ER and IL (Eq. 3.18).`,
sheet: [
  [String.raw`\[ w(p_i) = \tfrac12 (w_\mathrm{max} - w_\mathrm{min})\tanh p_i + \tfrac12 (w_\mathrm{max} + w_\mathrm{min}) \]`, "Eq. (3.6): bounded widths (Q6.1)"],
  [String.raw`\[ \tilde\rho_{i} = \frac{\sum_{j} K(d_{ij})\rho_{j}}{\sum_{j} K(d_{ij})}, \qquad \hat\rho = \frac{\tanh(\beta\eta) + \tanh(\beta(\tilde\rho - \eta))}{\tanh(\beta\eta) + \tanh(\beta(1-\eta))} \]`, "Eqs. (3.8) and (3.9): filter and projection (Q6.2)"],
  [String.raw`\[ \beta_k = 100^{k/10}, \qquad \frac{\partial\hat\rho}{\partial\tilde\rho}\Big|_{\eta = 0.5} = \frac{\beta}{2\tanh(\beta/2)} \]`, "The β schedule and the slope it controls (Q6.3)"],
  [String.raw`\[ P_\mathrm{ED} = \frac{1}{\sqrt{N_p}}\lVert \mathcal{C}(\hat{\boldsymbol\rho}) - \mathcal{O}(\hat{\boldsymbol\rho}) \rVert_2, \qquad J = \mathrm{FOM} - \min\!\left(1, \frac{\beta}{25}\right) P_\mathrm{ED} \]`, "Eq. (3.15): erosion and dilation penalty (Q6.4)"],
  [String.raw`\[ X \setminus \mathrm{open}_r(X) = \varnothing, \quad \mathrm{close}_r(X)\setminus X = \varnothing, \quad r = 59\ \mathrm{nm} \]`, "Morphological design rule check (Q6.5)"],
  [String.raw`\[ X_\mathrm{healed} = \mathrm{open}_r(\mathrm{close}_r(X)), \quad r = 63\ \mathrm{nm} \]`, "Eq. (3.17): repair (Q6.6)"],
  [String.raw`\[ P_\kappa = \frac{1}{N_v}\sum_i \frac{e^{-\kappa(r_i - r_\mathrm{min})}}{1 + e^{-\kappa(r_i - r_\mathrm{min})}} \]`, "Eq. (3.16): curvature penalty (Q6.7)"],
  [String.raw`\[ \bar T = \sum_i w_i T(\lambda_i), \qquad \mathrm{ER} = 10\log_{10}\frac{T_\mathrm{target}}{T_\mathrm{leak}}, \qquad \mathrm{IL} = -10\log_{10}T_\mathrm{target} \]`, "Eqs. (3.13) and (3.18): band objective and splitter metrics (Q6.8)"]
],
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eqs. (9), (18) and (19) (interpolation, projection, continuation, weak length scale)", "Hammond et al., Opt. Express 29, 23916 (2021) (design rules inside the optimization, performance after imposing rules)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Eqs. (17), (34) and (35) (curvature from a quadratic through three vertices, logistic penalty)", "Flexcompute Tidy3D documentation: conic filter, tanh projection, erosion and dilation penalty, curvature penalty", "KLayout (width and space checks) and Shapely (buffer-based opening and closing), as used in Sec. 3.5", "Ch. 3 Sec. 3.3 to 3.5 and 3.7 of the thesis"]
});
