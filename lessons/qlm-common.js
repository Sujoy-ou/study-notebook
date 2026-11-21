/* Shared tools for the Quantum Light and Matter shelf.
   SVG helpers, a Crank-Nicolson solver for the 1D Schrodinger equation, Gaussian wave packets,
   expectation values, probability current, sampling from |psi|^2 and phase colours.
   Simulation units: hbar = m = 1 with x in nm. For an electron one time unit is 8.638 fs,
   one energy unit is hbar^2/(m nm^2) = 76.20 meV, k is in 1/nm and hbar k / m = 115.8 km/s per 1/nm. */

const QM = {};
QM.C = { coral: "#D85A30", blue: "#378ADD", teal: "#1D9E75", purple: "#7F77DD", amber: "#BA7517", red: "#D33F3F", green: "#2E9B4F", gray: "#8a94a6" };
QM.T0 = 8.638;   // fs per time unit (electron)
QM.E0 = 76.20;   // meV per energy unit (electron)
QM.VU = 115.8;   // km/s per (hbar/nm)/m (electron)

QM.tx = (x, y, t, a, cls, extra) => `<text class="${cls || "ts"}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}"${a ? ` text-anchor="${a}"` : ""}${extra ? " " + extra.replace(/fill="([^"]+)"/, 'style="fill:$1"') : ""}>${t}</text>`;
QM.rc = (x, y, w, h, fill, stroke, extra) => `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${fill}" stroke="${stroke || "none"}"${extra ? " " + extra : ""}/>`;
QM.ln = (x1, y1, x2, y2, col, w, dash, extra) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 1}"${dash ? ` stroke-dasharray="${dash}"` : ""}${extra ? " " + extra : ""}/>`;
QM.ci = (x, y, r, fill, stroke, extra) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke || "none"}"${extra ? " " + extra : ""}/>`;
QM.fmt = (x, n) => Number.isFinite(x) ? x.toFixed(n == null ? 2 : n) : "n/a";
QM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Axes frame with ticks. Returns {s, X, Y}. */
QM.frame = function (x0, y0, w, h, o) {
  const X = v => x0 + (v - o.xmin) / (o.xmax - o.xmin) * w;
  const Y = v => y0 + h - (v - o.ymin) / (o.ymax - o.ymin) * h;
  let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
  (o.xt || []).forEach(t => { const xx = X(t); s += QM.ln(xx, y0 + h, xx, y0 + h + 4, "var(--p)") + QM.tx(xx, y0 + h + 16, o.xf ? o.xf(t) : t, "middle"); if (o.grid) s += QM.ln(xx, y0, xx, y0 + h, "var(--b)", 0.5, "2 3"); });
  (o.yt || []).forEach(t => { const yy = Y(t); s += QM.ln(x0 - 4, yy, x0, yy, "var(--p)") + QM.tx(x0 - 7, yy + 4, o.yf ? o.yf(t) : t, "end"); if (o.grid) s += QM.ln(x0, yy, x0 + w, yy, "var(--b)", 0.5, "2 3"); });
  if (o.xl) s += QM.tx(x0 + w / 2, y0 + h + 32, o.xl, "middle");
  if (o.yl) s += `<text class="ts" transform="translate(${x0 - 38} ${y0 + h / 2}) rotate(-90)" text-anchor="middle">${o.yl}</text>`;
  return { s, X, Y, x0, y0, w, h };
};
QM.path = (F, xs, ys, col, w, dash, extra) => {
  let d = "";
  for (let i = 0; i < xs.length; i++) { const y = ys[i]; if (!Number.isFinite(y)) continue; d += (d ? "L" : "M") + F.X(xs[i]).toFixed(1) + " " + F.Y(y).toFixed(1); }
  return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 2}"${dash ? ` stroke-dasharray="${dash}"` : ""}${extra ? " " + extra : ""}/>` : "";
};
/* filled area under a curve, clipped to the frame */
QM.area = (F, xs, ys, col, op) => {
  let d = `M${F.X(xs[0]).toFixed(1)} ${F.Y(0).toFixed(1)}`;
  for (let i = 0; i < xs.length; i++) d += `L${F.X(xs[i]).toFixed(1)} ${Math.max(F.y0, F.Y(ys[i])).toFixed(1)}`;
  d += `L${F.X(xs[xs.length - 1]).toFixed(1)} ${F.Y(0).toFixed(1)}Z`;
  return `<path d="${d}" fill="${col}" fill-opacity="${op == null ? 0.35 : op}" stroke="none"/>`;
};

/* ---------- grid, packets, solver ---------- */
QM.grid = function (xmin, xmax, N) {
  const x = new Float64Array(N), dx = (xmax - xmin) / (N - 1);
  for (let i = 0; i < N; i++) x[i] = xmin + i * dx;
  return { x, dx, N, xmin, xmax };
};
QM.G = QM.grid(-30, 30, 1201);

QM.norm = (G, re, im) => { let n = 0; for (let i = 0; i < G.N; i++) n += re[i] * re[i] + im[i] * im[i]; return n * G.dx; };
QM.normalize = (G, re, im) => { const n = Math.sqrt(QM.norm(G, re, im)); if (n > 0) for (let i = 0; i < G.N; i++) { re[i] /= n; im[i] /= n; } };

/* Gaussian packet exp(-(x-x0)^2/(4 s^2) + i k0 x), normalized on the grid. Sum several with add. */
QM.packet = function (G, x0, s, k0, re, im, amp) {
  re = re || new Float64Array(G.N); im = im || new Float64Array(G.N);
  const a = amp == null ? 1 : amp;
  for (let i = 0; i < G.N; i++) {
    const x = G.x[i], e = a * Math.exp(-(x - x0) * (x - x0) / (4 * s * s));
    re[i] += e * Math.cos(k0 * x); im[i] += e * Math.sin(k0 * x);
  }
  re[0] = im[0] = re[G.N - 1] = im[G.N - 1] = 0;
  if (amp == null) QM.normalize(G, re, im);
  return { re, im };
};

/* Crank-Nicolson: (1 + i dt H/2) psi(t+dt) = (1 - i dt H/2) psi(t), H = -(1/2) d2/dx2 + V - i W.
   Walls at both ends. The optional W >= 0 is an absorbing strip that lets the wave leave the window. The tridiagonal matrix is factorized once, each step is O(N). */
QM.solver = function (G, V, dt, W) {
  const N = G.N, s = dt / (4 * G.dx * G.dx), w = j => W ? dt / 2 * W[j] : 0;
  const cpr = new Float64Array(N), cpi = new Float64Array(N), ir = new Float64Array(N), ii = new Float64Array(N);
  let pr = 0, pi = 0;
  for (let j = 0; j < N; j++) {
    const ai = 2 * s + dt / 2 * V[j];
    const dr = 1 + w(j) - s * pi, di = ai + s * pr, m = dr * dr + di * di;
    ir[j] = dr / m; ii[j] = -di / m;
    cpr[j] = s * ii[j]; cpi[j] = -s * ir[j]; pr = cpr[j]; pi = cpi[j];
  }
  const rr = new Float64Array(N), ri = new Float64Array(N);
  return function step(re, im) {
    for (let j = 0; j < N; j++) {
      const b = -(2 * s + dt / 2 * V[j]);
      const ur = (j > 0 ? re[j - 1] : 0) + (j < N - 1 ? re[j + 1] : 0), ui = (j > 0 ? im[j - 1] : 0) + (j < N - 1 ? im[j + 1] : 0);
      const g = 1 - w(j);
      rr[j] = g * re[j] - b * im[j] - s * ui; ri[j] = g * im[j] + b * re[j] + s * ur;
    }
    let p2 = 0, q2 = 0;
    for (let j = 0; j < N; j++) {
      const tr = rr[j] - s * q2, ti = ri[j] + s * p2;
      const dr = tr * ir[j] - ti * ii[j], di = tr * ii[j] + ti * ir[j];
      rr[j] = dr; ri[j] = di; p2 = dr; q2 = di;
    }
    re[N - 1] = rr[N - 1]; im[N - 1] = ri[N - 1];
    for (let j = N - 2; j >= 0; j--) {
      const xr = re[j + 1], xi = im[j + 1];
      re[j] = rr[j] - (cpr[j] * xr - cpi[j] * xi); im[j] = ri[j] - (cpr[j] * xi + cpi[j] * xr);
    }
  };
};

/* Expectation values on the grid (hbar = m = 1). */
QM.expect = function (G, re, im, V) {
  const N = G.N, dx = G.dx;
  let n = 0, x1 = 0, x2 = 0, p = 0, p2 = 0, vm = 0, fm = 0;
  for (let j = 0; j < N; j++) {
    const P = re[j] * re[j] + im[j] * im[j], x = G.x[j];
    n += P; x1 += x * P; x2 += x * x * P;
    const da = j > 0 && j < N - 1 ? (re[j + 1] - re[j - 1]) / (2 * dx) : 0, db = j > 0 && j < N - 1 ? (im[j + 1] - im[j - 1]) / (2 * dx) : 0;
    p += re[j] * db - im[j] * da; p2 += da * da + db * db;
    if (V) { vm += V[j] * P; if (j > 0 && j < N - 1) fm += -(V[j + 1] - V[j - 1]) / (2 * dx) * P; }
  }
  n *= dx; x1 *= dx / n; x2 *= dx / n; p *= dx / n; p2 *= dx / n; vm *= dx / n; fm *= dx / n;
  return { n, x: x1, x2, sx: Math.sqrt(Math.max(0, x2 - x1 * x1)), p, p2, sp: Math.sqrt(Math.max(0, p2 - p * p)), T: p2 / 2, V: vm, E: p2 / 2 + vm, F: fm };
};
/* probability current J = (hbar/m) Im(psi* dpsi/dx) at grid index j */
QM.J = (G, re, im, j) => { j = QM.clamp(j, 1, G.N - 2); const da = (re[j + 1] - re[j - 1]) / (2 * G.dx), db = (im[j + 1] - im[j - 1]) / (2 * G.dx); return re[j] * db - im[j] * da; };
QM.idx = (G, x) => QM.clamp(Math.round((x - G.xmin) / G.dx), 0, G.N - 1);
QM.prob = (G, re, im, a, b) => { let s = 0; for (let j = QM.idx(G, a); j <= QM.idx(G, b); j++) s += re[j] * re[j] + im[j] * im[j]; return s * G.dx; };
/* draw one position from |psi|^2 */
QM.sample = function (G, re, im, u) {
  let tot = 0; for (let j = 0; j < G.N; j++) tot += re[j] * re[j] + im[j] * im[j];
  let c = 0, target = (u == null ? Math.random() : u) * tot;
  for (let j = 0; j < G.N; j++) { c += re[j] * re[j] + im[j] * im[j]; if (c >= target) return G.x[j] + (Math.random() - 0.5) * G.dx; }
  return G.x[G.N - 1];
};
QM.cdf = function (G, re, im) { const c = new Float64Array(G.N); let t = 0; for (let j = 0; j < G.N; j++) { t += re[j] * re[j] + im[j] * im[j]; c[j] = t; } for (let j = 0; j < G.N; j++) c[j] /= t; return c; };
QM.draw = function (G, c) { const u = Math.random(); let lo = 0, hi = G.N - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (c[m] < u) lo = m + 1; else hi = m; } return G.x[lo] + (Math.random() - 0.5) * G.dx; };

/* phase colour: the hue is the phase of psi */
QM.hue = (a, b) => `hsl(${((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360},72%,52%)`;
QM.wheel = function (cx, cy, r) {
  let s = "";
  for (let k = 0; k < 24; k++) {
    const a0 = k / 24 * 2 * Math.PI, a1 = (k + 1) / 24 * 2 * Math.PI;
    s += `<path d="M${cx} ${cy}L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy - r * Math.sin(a0)).toFixed(1)}A${r} ${r} 0 0 0 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy - r * Math.sin(a1)).toFixed(1)}Z" fill="hsl(${(k + 0.5) * 15},72%,52%)"/>`;
  }
  return s + QM.tx(cx + r + 4, cy + 4, "Re +", "start") + QM.tx(cx, cy - r - 4, "Im +", "middle") + QM.tx(cx, cy + r + 13, "phase", "middle");
};

/* Draw a wave function in a frame. mode "reim": Re (blue) and Im (coral) with |psi| envelope.
   mode "phase": |psi|^2 as bars coloured by phase. mode "prob": |psi|^2 filled. */
QM.waveSVG = function (F, G, re, im, mode, step) {
  step = step || 2;
  const xs = [], a = [], b = [], m = [], p = [];
  for (let j = 0; j < G.N; j += 1) { xs.push(G.x[j]); a.push(re[j]); b.push(im[j]); const q = re[j] * re[j] + im[j] * im[j]; p.push(q); m.push(Math.sqrt(q)); }
  if (mode === "reim") {
    return QM.path(F, xs, m, "var(--p)", 1, "3 3") + QM.path(F, xs, m.map(v => -v), "var(--p)", 1, "3 3") + QM.path(F, xs, b, QM.C.coral, 1.6) + QM.path(F, xs, a, QM.C.blue, 1.8);
  }
  if (mode === "phase") {
    let s = ""; const wpx = Math.abs(F.X(G.x[step]) - F.X(G.x[0])) + 0.6, y0 = F.Y(0);
    for (let j = 0; j < G.N; j += step) {
      if (p[j] * 1 < 1e-5) continue;
      const yy = Math.max(F.y0, F.Y(p[j]));
      s += `<rect x="${(F.X(xs[j]) - wpx / 2).toFixed(1)}" y="${yy.toFixed(1)}" width="${wpx.toFixed(1)}" height="${(y0 - yy).toFixed(1)}" fill="${QM.hue(a[j], b[j])}"/>`;
    }
    return s + QM.path(F, xs, p, "var(--t)", 1.2);
  }
  return QM.area(F, xs, p, QM.C.purple, 0.3) + QM.path(F, xs, p, QM.C.purple, 2);
};

/* Play and Reset buttons. fn(t) is called every frame while playing. */
QM.player = function (ctl, fn, onReset) {
  const id = "pl" + Math.random().toString(36).slice(2, 7);
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${id}">Play</button>${onReset ? `<button id="${id}r">Reset</button>` : ""}</div>`);
  const b = document.getElementById(id); let on = false;
  const set = v => { on = v; b.textContent = on ? "Pause" : "Play"; if (on) anim(fn); else stopAnim(); };
  b.onclick = () => set(!on);
  if (onReset) document.getElementById(id + "r").onclick = () => { set(false); onReset(); };
  return { set, get on() { return on; } };
};
