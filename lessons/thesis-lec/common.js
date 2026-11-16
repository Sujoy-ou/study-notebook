/* Shared tools for the lecture series "Inverse design of the PBS, step by step" (group lec).
   Prefix LC. Uses C2 (1D and 2D FDTD, slab solver) and C3 (1D Helmholtz, filter, projection) from the chapter files. */

const LC = {};

/* ---------- controls and drawing ---------- */

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
    anim(() => { const t = performance.now(); if (t - last > 2400) { last = t; if (k < n - 1) { k++; u(); } else stopAnim(); } });
  };
  u();
};

/* A labelled box. cls is one of blue, gray, purple, teal, coral. dim fades it. */
LC.box = function (x, y, w, h, lines, cls, dim) {
  const L = [].concat(lines), y0 = y + h / 2 - (L.length - 1) * 9 + 5;
  return `<g class="c-${cls}" opacity="${dim ? 0.28 : 1}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="1.4"/>${L.map((t, i) => `<text class="${i === 0 ? "th" : "ts"}" x="${x + w / 2}" y="${y0 + i * 18}" text-anchor="middle">${t}</text>`).join("")}</g>`;
};

/* Math in the figure: one or more display equations, typeset, with optional html below. */
LC.mathFig = function (fig, tex, after) {
  fig.innerHTML = `<div class="eqbig">${[].concat(tex).map(t => `\\[${t}\\]`).join("")}</div>${after || ""}`;
  typesetMath(fig);
};

/* Code block in the figure, with optional highlighted lines. */
LC.code = (lines, hi) => `<pre class="codebox"><code>${lines.map((l, i) => hi && hi.includes(i) ? `<b style="background:var(--accent-bg)">${l}</b>` : l).join("\n")}</code></pre>`;

/* The PBS used as the example throughout, drawn to scale (64 px per µm).
   on: parts to show: pml, src, design, pix, mon, fmon, fwd, fwdTM, adj, adjTM, ports. */
LC.pbs = function (on, opt) {
  on = on || []; opt = opt || {}; const has = k => on.includes(k);
  const X0 = 20, X1 = 660, Y0 = 20, Y1 = 250, yc = 135, dx0 = 250, dx1 = 410, dy0 = 55, dy1 = 215, h = 6.4, yTM = yc - 38.4, yTE = yc + 38.4, P = 18;
  let s = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="none" stroke="var(--b)"/>`;
  if (has("pml")) s += `<path d="M${X0} ${Y0}h${X1 - X0}v${Y1 - Y0}h${-(X1 - X0)}z M${X0 + P} ${Y0 + P}v${Y1 - Y0 - 2 * P}h${X1 - X0 - 2 * P}v${-(Y1 - Y0 - 2 * P)}z" fill="var(--gray-bg)" fill-rule="evenodd" stroke="var(--p)"/><text class="ts" x="${X0 + 4}" y="${Y0 + 13}">PML</text>`;
  const wg = (x0, x1, y) => `<rect x="${x0}" y="${y - h}" width="${x1 - x0}" height="${2 * h}" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
  s += wg(X0, dx0, yc) + wg(dx1, X1, yTM) + wg(dx1, X1, yTE);
  if (has("design") || has("pix")) {
    s += `<rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="${dy1 - dy0}" fill="var(--sunk)" stroke="var(--coral)" stroke-width="2"/>`;
    const n = 20, c = (dx1 - dx0) / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const f = i / (n - 1), yy = dy0 + (j + 0.5) * c, sh = 38.4 * Math.min(1, f * 1.2), arm = Math.min(Math.abs(yy - (yc - sh)), Math.abs(yy - (yc + sh)));
      const rho = arm < 9 ? 0.9 : 0.1;
      s += `<rect x="${(dx0 + i * c).toFixed(1)}" y="${(dy0 + j * c).toFixed(1)}" width="${(c - (has("pix") ? 1 : 0)).toFixed(1)}" height="${(c - (has("pix") ? 1 : 0)).toFixed(1)}" fill="var(--blue)" fill-opacity="${(rho * 0.8).toFixed(2)}"/>`;
    }
    s += `<text class="ts" x="${(dx0 + dx1) / 2}" y="${dy0 - 6}" text-anchor="middle">design region 2.5 × 2.5 µm</text>`;
  } else s += `<rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="${dy1 - dy0}" fill="none" stroke="var(--p)" stroke-dasharray="5 4"/><text class="ts" x="${(dx0 + dx1) / 2}" y="${dy0 - 6}" text-anchor="middle">design region</text>`;
  if (has("src")) s += `<line x1="80" x2="80" y1="${yc - 26}" y2="${yc + 26}" stroke="var(--purple)" stroke-width="3"/>${arrow(84, yc - 20, 118, yc - 20, "var(--purple)", 1.6)}<text class="ts" x="80" y="${yc + 42}" text-anchor="middle">mode source</text>`;
  if (has("mon")) for (const [y, t] of [[yTM, "TM"], [yTE, "TE"]]) s += `<line x1="590" x2="590" y1="${y - 20}" y2="${y + 20}" stroke="var(--teal)" stroke-width="3"/><text class="ts" x="584" y="${y + (y < yc ? -24 : 36)}" text-anchor="end">${t} monitor</text>`;
  if (has("fmon")) s += `<rect x="${dx0 - 4}" y="${dy0 - 4}" width="${dx1 - dx0 + 8}" height="${dy1 - dy0 + 8}" fill="none" stroke="var(--teal)" stroke-width="2.5" stroke-dasharray="7 4"/><text class="ts" x="${dx0}" y="${dy1 + 20}">field monitor</text>`;
  if (has("ports") || has("mon")) s += `<text class="ts" x="${dx1 + 8}" y="${yTM - 12}">TM port, y = +0.6 µm</text><text class="ts" x="${dx1 + 8}" y="${yTE + 22}">TE port, y = −0.6 µm</text>`;
  const path = (y, col) => `<path d="M 90 ${yc} L ${dx0} ${yc} C ${dx0 + 70} ${yc}, ${dx1 - 70} ${y}, ${dx1} ${y} L 610 ${y}" fill="none" stroke="${col}" stroke-width="2.6" marker-end="url(#ar)"/>`;
  if (has("fwd")) s += path(yTE, "var(--coral)");
  if (has("fwdTM")) s += path(yTM, "var(--coral)");
  const back = y => `<path d="M 600 ${y} L ${dx1} ${y} C ${dx1 - 70} ${y}, ${dx0 + 70} ${yc}, ${dx0 - 10} ${yc}" fill="none" stroke="var(--purple)" stroke-width="2.6" stroke-dasharray="7 4" marker-end="url(#ar)"/><line x1="600" x2="600" y1="${y - 20}" y2="${y + 20}" stroke="var(--purple)" stroke-width="3"/>`;
  if (has("adj")) s += back(yTE);
  if (has("adjTM")) s += back(yTM);
  s += `<text class="ts" x="128" y="${yc - 12}">input, 200 nm</text>`;
  if (opt.note) s += `<text class="ts" x="340" y="${Y1 + 18}" text-anchor="middle">${opt.note}</text>`;
  return svg(opt.note ? 275 : 258, s);
};

/* ---------- 1D tools ---------- */

/* Analytic transmission of a lossless slab (index n, thickness d) in air, normal incidence. */
LC.slabT = function (n, d, lam) {
  const F = Math.pow(n * n - 1, 2) / (4 * n * n), s = Math.sin(2 * Math.PI * n * d / lam);
  return 1 / (1 + F * s * s);
};
LC.gauss = (t, t0, tau) => Math.exp(-Math.pow((t - t0) / tau, 2) / 2);

/* One broadband 1D FDTD run through a slab plus an empty reference run (cells, S = 0.5). */
LC.pulseT = function (opt) {
  const N = opt.N || 520, S = 0.5, src = 60, probe = N - 70, a = opt.a || 220, d = opt.d || 24, n = opt.n || 2;
  const lams = opt.lams, steps = opt.steps || 4200, lam0 = opt.lam0 || 40, tau = opt.tau || 28, t0 = 5 * tau;
  const w = lams.map(l => 2 * Math.PI * S / l);
  const one = withSlab => {
    const eps = new Float64Array(N).fill(1);
    if (withSlab) for (let i = a; i < a + d; i++) eps[i] = n * n;
    const sim = new C2.FDTD1D(N, S, eps, { pml: 40, smax: 0.6, wall: "pec" });
    const re = new Float64Array(lams.length), im = new Float64Array(lams.length), w0 = 2 * Math.PI * S / lam0;
    for (let t = 0; t < steps; t++) {
      sim.step([src, LC.gauss(t, t0, tau) * Math.sin(w0 * t)]);
      const e = sim.ez[probe];
      for (let k = 0; k < lams.length; k++) { re[k] += e * Math.cos(w[k] * t); im[k] += e * Math.sin(w[k] * t); }
    }
    return lams.map((_, k) => re[k] * re[k] + im[k] * im[k]);
  };
  const ps = one(true), pr = one(false);
  return { T: ps.map((v, k) => v / pr[k]) };
};

/* Small 1D FDTD (Ez, Hy), S = 0.5, graded absorbing ends (40 cells), optional one-way (E and H) source. */
LC.FD1 = function (N, eps, pml) {
  this.N = N; this.ez = new Float64Array(N); this.hy = new Float64Array(N); this.eps = eps || new Float64Array(N).fill(1); this.t = 0;
  const L = pml === undefined ? 40 : pml;
  this.sg = Float64Array.from({ length: N }, (_, i) => { if (!L) return 0; const d = i < L ? (L - i) / L : i >= N - L ? (i - (N - L - 1)) / L : 0; return 0.6 * d * d * d; });
};
LC.FD1.prototype.step = function (s, g, oneway) {
  const { N, ez, hy, sg, eps } = this, S = 0.5, n = this.t;
  for (let i = 0; i < N - 1; i++) { const l = sg[i] / 2; hy[i] = ((1 - l) * hy[i] + S * (ez[i + 1] - ez[i])) / (1 + l); }
  if (g && oneway) hy[s - 1] -= S * g(n);
  for (let i = 1; i < N - 1; i++) { const l = sg[i] / 2; ez[i] = ((1 - l) * ez[i] + (S / eps[i]) * (hy[i] - hy[i - 1])) / (1 + l); }
  if (g) ez[s] += oneway ? S * g(n + 1.5) : g(n);
  this.t++;
};

/* Draw a 1D field state: material shading, Ez (blue) and optionally Hy (coral). */
LC.draw1D = function (sim, opt) {
  opt = opt || {};
  const N = sim.N, x0 = 50, w = 600, y0 = opt.y0 || 30, h = opt.h || 150, A = opt.amp || 1.2, xs = [...Array(N).keys()];
  let s = "";
  for (let i = 0; i < N; i++) if (sim.eps[i] > 1.01) s += `<rect x="${(x0 + i / (N - 1) * w).toFixed(1)}" y="${y0}" width="${(w / (N - 1) + 0.4).toFixed(1)}" height="${h}" fill="var(--blue-bg)"/>`;
  if (opt.pml) s += `<rect x="${x0}" y="${y0}" width="${opt.pml / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/><rect x="${x0 + w - opt.pml / (N - 1) * w}" y="${y0}" width="${opt.pml / (N - 1) * w}" height="${h}" fill="var(--gray-bg)"/>`;
  s += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + h / 2}" y2="${y0 + h / 2}" stroke="var(--b)"/>`;
  if (opt.hy) s += plot(x0, y0, w, h, xs.map(i => i + 0.5), Array.from(sim.hy), 0, N - 1, -A, A, "var(--coral)", 1.6);
  s += plot(x0, y0, w, h, xs, Array.from(sim.ez), 0, N - 1, -A, A, "var(--blue)", 2);
  if (opt.src != null) { const X = x0 + opt.src / (N - 1) * w; s += `<line x1="${X}" x2="${X}" y1="${y0}" y2="${y0 + h}" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X}" y="${y0 - 6}" text-anchor="middle">${opt.srcLab || "source"}</text>`; }
  return s;
};

/* ---------- 2D toy splitter (normalized units) ----------
   A 2D cousin of the PBS: input strip, 50 x 50 design box, two output strips.
   Index 2 instead of 3.5 so a coarse grid still resolves the wave. One field (Ez), one polarization.
   Target: the upper port. CW runs with a single-frequency DFT at every cell. */
LC.toy = function () {
  const nx = 160, ny = 100, yc = 50, n = 2.0, lam = 30, d0 = 50, d1 = 100, dy = 16, pad = 12;
  const eps = new Float32Array(nx * ny).fill(1);
  const set = (i, j) => { if (i >= 0 && j >= 0 && i < nx && j < ny) eps[j * nx + i] = n * n; };
  for (let i = 0; i < d0; i++) for (let j = yc - 3; j <= yc + 3; j++) set(i, j);
  for (let i = d1; i < nx; i++) for (const s of [-1, 1]) for (let j = yc + s * dy - 3; j <= yc + s * dy + 3; j++) set(i, j);
  const Nm = C2.slabN(n, 1, 7, lam, 0, "TE"), zs = []; for (let k = -12; k <= 12; k++) zs.push(k);
  const prof = C2.slabProfile(n, 1, 7, lam, 0, "TE", Nm, zs).main;
  // ph: phase factor that makes Re{E_fwd E_adj} the gradient for this discretization,
  // calibrated once against central finite differences (2 % agreement). ref: power of a straight strip.
  return { nx, ny, yc, n, lam, d0, d1, dy, pad, eps, prof, src: 20, mon: 138, ph: [-0.0977, 2.112], ref: 0.2074, W: d1 - d0, H: 50 };
};
LC.toyStart = function (T) {
  const rho = new Float32Array(T.W * T.H);
  for (let i = 0; i < T.W; i++) { const f = i / (T.W - 1); for (const s of [-1, 1]) { const c = 25 + s * T.dy * Math.min(1, f * 1.15); for (let j = 0; j < T.H; j++) if (Math.abs(j - c) <= 3.5) rho[j * T.W + i] = 1; } }
  return rho;
};
LC.toyApply = function (T, rho) { for (let j = 0; j < T.H; j++) for (let i = 0; i < T.W; i++) T.eps[(T.yc - 25 + j) * T.nx + T.d0 + i] = 1 + rho[j * T.W + i] * (T.n * T.n - 1); };
LC.toyRun = function (T, col, yc, amp, steps) {
  steps = steps || 1200;
  const sim = new C2.FDTD2D(T.nx, T.ny, 0.5, T.eps, T.pad), w = 2 * Math.PI * 0.5 / T.lam, per = Math.round(T.lam / 0.5);
  const K = per * 4, t0 = steps - K, re = new Float32Array(T.nx * T.ny), im = new Float32Array(T.nx * T.ny);
  for (let t = 0; t < steps; t++) {
    sim.step(null);
    const v = Math.min(1, t / 200) * (amp[0] * Math.cos(w * t) + amp[1] * Math.sin(w * t));
    for (let k = -12; k <= 12; k++) { const q = (yc + k) * T.nx + col; sim.ez[q] += 0.2 * v * T.prof[k + 12] / T.eps[q]; }
    if (t >= t0) { const c = Math.cos(w * t), s = Math.sin(w * t); for (let q = 0; q < re.length; q++) { re[q] += sim.ez[q] * c; im[q] += sim.ez[q] * s; } }
  }
  for (let q = 0; q < re.length; q++) { re[q] /= K; im[q] /= K; }
  return { re, im };
};
LC.toyOverlap = function (T, f, yc) { let ar = 0, ai = 0; for (let k = -12; k <= 12; k++) { const q = (yc + k) * T.nx + T.mon; ar += f.re[q] * T.prof[k + 12]; ai += f.im[q] * T.prof[k + 12]; } return [ar, ai]; };
/* Forward run, transmission into the upper port, adjoint run, gradient on every design pixel. */
LC.toyGrad = function (T) {
  const up = T.yc - T.dy, f = LC.toyRun(T, T.src, T.yc, [1, 0]), a = LC.toyOverlap(T, f, up), F = (a[0] * a[0] + a[1] * a[1]) / T.ref;
  const p = T.ph, A = [a[0] * p[0] + a[1] * p[1], -a[1] * p[0] + a[0] * p[1]];
  const y = LC.toyRun(T, T.mon, up, A), g = new Float32Array(T.W * T.H);
  for (let j = 0; j < T.H; j++) for (let i = 0; i < T.W; i++) { const q = (T.yc - 25 + j) * T.nx + T.d0 + i; g[j * T.W + i] = (f.re[q] * y.re[q] - f.im[q] * y.im[q]) / T.ref; }
  return { f, y, F, a, g };
};
/* Draw a 2D map into a canvas inside el. mode "abs" (heat) or "sign" (blue to red). Rows are drawn top to bottom. */
LC.map = function (el, w, h, vals, mode, scale, caption) {
  const { ctx, img } = C2.canvas(el, w, h, scale, caption);
  let mx = 0; for (let k = 0; k < vals.length; k++) mx = Math.max(mx, Math.abs(vals[k]));
  mx = mx || 1;
  for (let k = 0; k < w * h; k++) { const v = vals[k] / mx, c = mode === "abs" ? C2.heat(Math.abs(v)) : C2.color(v), o = k * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; }
  ctx.putImageData(img, 0, 0);
};
/* |E| over the toy domain with the strips outlined. */
LC.toyAbs = function (T, f) { const v = new Float32Array(T.nx * T.ny); for (let q = 0; q < v.length; q++) v[q] = Math.hypot(f.re[q], f.im[q]) * (T.eps[q] > 1.5 ? 1 : 1); return v; };
