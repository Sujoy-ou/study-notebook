/* Shared tools for the lecture series "From Maxwell to the adjoint method" (group lec).
   Prefix LC. Uses C2 (1D and 2D FDTD, slab solver) and C3 (1D Helmholtz) from the chapter files. */

const LC = {};

/* Step-through control: Back / Play / Next with a caption per step.
   draw(k) draws step k into the figure and returns the caption html. */
LC.steps = function (ctl, n, draw, extra) {
  ctl.innerHTML = `<div class="row"><button id="lcb">Back</button><button id="lcp">Play</button><button id="lcn">Next</button><span class="v" id="lck"></span></div><p class="note" id="lcc"></p>${extra || ""}`;
  let k = 0;
  const u = () => {
    $("lck").textContent = `Step ${k + 1} of ${n}`;
    $("lcc").innerHTML = draw(k) || "";
    $("lcb").disabled = k === 0; $("lcn").disabled = k === n - 1;
    typesetMath($("lcc"));
  };
  $("lcb").onclick = () => { stopAnim(); k = Math.max(0, k - 1); u(); };
  $("lcn").onclick = () => { stopAnim(); k = Math.min(n - 1, k + 1); u(); };
  $("lcp").onclick = () => {
    k = 0; u(); let last = performance.now();
    anim(() => { const t = performance.now(); if (t - last > 2200) { last = t; if (k < n - 1) { k++; u(); } else stopAnim(); } });
  };
  u();
};

/* A labelled box. cls is one of blue, gray, purple, teal, coral. dim fades it. */
LC.box = function (x, y, w, h, lines, cls, dim) {
  const L = [].concat(lines), y0 = y + h / 2 - (L.length - 1) * 9 + 5;
  return `<g class="c-${cls}" opacity="${dim ? 0.28 : 1}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="1.4"/>${L.map((t, i) => `<text class="${i === 0 ? "th" : "ts"}" x="${x + w / 2}" y="${y0 + i * 18}" text-anchor="middle">${t}</text>`).join("")}</g>`;
};

/* Math in the figure: one or more display equations, typeset, with an optional SVG below. */
LC.mathFig = function (fig, tex, after) {
  fig.innerHTML = `<div class="eqbig">${[].concat(tex).map(t => `\\[${t}\\]`).join("")}</div>${after || ""}`;
  typesetMath(fig);
};

/* Analytic transmission of a lossless slab (index n, thickness d) in air, normal incidence. */
LC.slabT = function (n, d, lam) {
  const F = Math.pow(n * n - 1, 2) / (4 * n * n), s = Math.sin(2 * Math.PI * n * d / lam);
  return 1 / (1 + F * s * s);
};

/* One broadband 1D FDTD run through a slab plus an empty reference run.
   Units: cells. Courant number S = 0.5. Gaussian pulse centred at lam0 cells.
   Returns the transmitted spectrum from the running DFT at the probe. */
LC.pulseT = function (opt) {
  const N = opt.N || 520, S = 0.5, src = 60, probe = N - 70, a = opt.a || 220, d = opt.d || 24, n = opt.n || 2;
  const lams = opt.lams, steps = opt.steps || 4200, lam0 = opt.lam0 || 40, tau = opt.tau || 28, t0 = 5 * tau;
  const w = lams.map(l => 2 * Math.PI * S / l);           // phase per time step for each wavelength
  const one = withSlab => {
    const eps = new Float64Array(N).fill(1);
    if (withSlab) for (let i = a; i < a + d; i++) eps[i] = n * n;
    const sim = new C2.FDTD1D(N, S, eps, { pml: 40, smax: 0.6, wall: "pec" });
    const re = new Float64Array(lams.length), im = new Float64Array(lams.length);
    const w0 = 2 * Math.PI * S / lam0;
    for (let t = 0; t < steps; t++) {
      const g = Math.exp(-Math.pow((t - t0) / tau, 2) / 2) * Math.sin(w0 * t);
      sim.step([src, g]);
      const e = sim.ez[probe];
      for (let k = 0; k < lams.length; k++) { re[k] += e * Math.cos(w[k] * t); im[k] += e * Math.sin(w[k] * t); }
    }
    return lams.map((_, k) => re[k] * re[k] + im[k] * im[k]);
  };
  const ps = one(true), pr = one(false);
  return { T: ps.map((v, k) => v / pr[k]), src, probe, a, d, N };
};

/* Gaussian pulse in time and its spectrum, for drawing. */
LC.gauss = (t, t0, tau) => Math.exp(-Math.pow((t - t0) / tau, 2) / 2);

/* Draw a 1D FDTD state: material shading, Ez (blue) and optionally Hy (coral). */
LC.draw1D = function (sim, opt) {
  opt = opt || {};
  const N = sim.N, x0 = 50, w = 600, y0 = opt.y0 || 30, h = opt.h || 150, A = opt.amp || 1.2, xs = [...Array(N).keys()];
  let s = "";
  for (let i = 0; i < N; i++) if (sim.eps[i] > 1.01) s += `<rect x="${(x0 + i / (N - 1) * w).toFixed(1)}" y="${y0}" width="${(w / (N - 1) + 0.4).toFixed(1)}" height="${h}" fill="var(--blue-bg)"/>`;
  if (opt.pml) s += `<rect x="${x0}" y="${y0}" width="${opt.pml / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/><rect x="${x0 + w - opt.pml / (N - 1) * w}" y="${y0}" width="${opt.pml / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/>`;
  s += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + h / 2}" y2="${y0 + h / 2}" stroke="var(--b)"/>`;
  if (opt.hy) s += plot(x0, y0, w, h, xs.map(i => i + 0.5), Array.from(sim.hy), 0, N - 1, -A, A, "var(--coral)", 1.6);
  s += plot(x0, y0, w, h, xs, Array.from(sim.ez), 0, N - 1, -A, A, "var(--blue)", 2);
  if (opt.src != null) { const X = x0 + opt.src / (N - 1) * w; s += `<line x1="${X}" x2="${X}" y1="${y0}" y2="${y0 + h}" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X}" y="${y0 - 6}" text-anchor="middle">source J</text>`; }
  return s;
};
/* Play / Pause / Reset buttons wired to an animation that steps a simulation. */
LC.player = function (ctl, extra) {
  ctl.innerHTML = `<div class="row"><button id="lpl">Play</button><button id="lps">Pause</button><button id="lpr">Reset</button></div>${extra || ""}`;
};
