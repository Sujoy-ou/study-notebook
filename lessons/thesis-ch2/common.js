/* Shared numerical tools for the Chapter 2 lessons.
   Everything here is computed in the browser from textbook equations. */

const C2 = {};

/* Symmetric slab, index n, cladding nc, thickness t, wavelength lam (same length unit).
   Solves tan(kappa t/2 - m pi/2) = zeta gamma/kappa  (Andreani and Gerace 2006, App. C)
   pol "TE" (zeta = 1) or "TM" (zeta = (n/nc)^2). Returns N or null if cut off. */
C2.slabN = function (n, nc, t, lam, m, pol) {
  const k0 = 2 * Math.PI / lam, z = pol === "TM" ? (n * n) / (nc * nc) : 1;
  const f = N => { const ka = k0 * Math.sqrt(Math.max(n * n - N * N, 0)), ga = k0 * Math.sqrt(Math.max(N * N - nc * nc, 0)); return ka * t / 2 - m * Math.PI / 2 - Math.atan(z * ga / Math.max(ka, 1e-12)); };
  let lo = nc + 1e-9, hi = n - 1e-9;
  if (f(lo) <= 0) return null;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
};

/* Field profile of a slab mode along z. TE: Ey. TM: Hy (continuous) and Ez (jumps by n^2/nc^2). */
C2.slabProfile = function (n, nc, t, lam, m, pol, N, zs) {
  const k0 = 2 * Math.PI / lam, ka = k0 * Math.sqrt(n * n - N * N), ga = k0 * Math.sqrt(N * N - nc * nc);
  const inside = z => m % 2 === 0 ? Math.cos(ka * z) : Math.sin(ka * z);
  const edge = inside(t / 2);
  const main = zs.map(z => Math.abs(z) <= t / 2 ? inside(z) : Math.sign(z) ** (m % 2) * edge * Math.exp(-ga * (Math.abs(z) - t / 2)));
  const ez = main.map((v, i) => v / ((Math.abs(zs[i]) <= t / 2 ? n * n : nc * nc)));
  const nm = a => { const mx = Math.max(...a.map(Math.abs)) || 1; return a.map(v => v / mx); };
  return { main: nm(main), ez: nm(ez), kappa: ka, gamma: ga };
};

/* Fraction of mode power inside the core for a TE slab mode (|Ey|^2 weighting). */
C2.slabConfinement = function (n, nc, t, lam, m, N) {
  const zs = range(-3 * t, 3 * t, 1201), p = C2.slabProfile(n, nc, t, lam, m, "TE", N, zs).main;
  let a = 0, b = 0; zs.forEach((z, i) => { const v = p[i] * p[i]; b += v; if (Math.abs(z) <= t / 2) a += v; });
  return a / b;
};

/* Effective index method for a strip of width w, thickness t (Soldano 1995 uses the EIM).
   TE-like: vertical TE slab, then lateral TM-type problem (field normal to side walls).
   TM-like: vertical TM slab, then lateral TE-type problem. */
C2.eim = function (n, nc, t, w, lam, family, p) {
  const Ns = C2.slabN(n, nc, t, lam, 0, family === "TE" ? "TE" : "TM");
  if (!Ns) return null;
  return C2.slabN(Ns, nc, w, lam, p || 0, family === "TE" ? "TM" : "TE");
};

/* Transfer matrix reflectance at normal incidence. layers: [[n, d], ...], from incidence side. */
C2.tmmR = function (n0, layers, ns, lam) {
  let M = [[1, 0], [0, 0], [0, 0], [1, 0]]; // [m11,m12,m21,m22] each [re,im]
  const mul = (A, B) => { const c = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]], ad = (x, y) => [x[0] + y[0], x[1] + y[1]]; return [ad(c(A[0], B[0]), c(A[1], B[2])), ad(c(A[0], B[1]), c(A[1], B[3])), ad(c(A[2], B[0]), c(A[3], B[2])), ad(c(A[2], B[1]), c(A[3], B[3]))]; };
  for (const [n, d] of layers) { const ph = 2 * Math.PI * n * d / lam, c = Math.cos(ph), s = Math.sin(ph); M = mul(M, [[c, 0], [0, s / n], [0, n * s], [c, 0]]); }
  // r = (n0 m11 + n0 ns m12 - m21 - ns m22) / (n0 m11 + n0 ns m12 + m21 + ns m22)
  const A = [n0 * M[0][0] + n0 * ns * M[1][0], n0 * M[0][1] + n0 * ns * M[1][1]];
  const B = [M[2][0] + ns * M[3][0], M[2][1] + ns * M[3][1]];
  const num = [A[0] - B[0], A[1] - B[1]], den = [A[0] + B[0], A[1] + B[1]];
  return (num[0] ** 2 + num[1] ** 2) / (den[0] ** 2 + den[1] ** 2);
};
C2.dbrLayers = function (nH, nL, N, lam0) { const L = []; for (let i = 0; i < N; i++) { L.push([nH, lam0 / (4 * nH)]); L.push([nL, lam0 / (4 * nL)]); } return L; };

/* Diverging color map on a canvas: blue (negative) to white to red (positive). */
C2.color = function (v) {
  v = Math.max(-1, Math.min(1, v));
  if (v >= 0) return [255, Math.round(255 * (1 - v * 0.85)), Math.round(255 * (1 - v))];
  return [Math.round(255 * (1 + v)), Math.round(255 * (1 + v * 0.55)), 255];
};
C2.heat = function (v) { v = Math.max(0, Math.min(1, v)); const r = Math.round(255 * Math.min(1, v * 1.8)), g = Math.round(255 * Math.max(0, Math.min(1, v * 1.8 - 0.5))), b = Math.round(255 * Math.max(0, v * 2.2 - 1.2) + 60 * (1 - v)); return [r, g, Math.min(255, b)]; };
C2.canvas = function (fig, w, h, scale, caption) {
  fig.innerHTML = `<canvas width="${w}" height="${h}" style="width:100%;max-width:${w * scale}px;image-rendering:pixelated;border:1px solid var(--line);border-radius:4px;display:block;background:#fff"></canvas>${caption ? `<p class="note">${caption}</p>` : ""}`;
  const cv = fig.querySelector("canvas"); return { cv, ctx: cv.getContext("2d"), img: cv.getContext("2d").createImageData(w, h) };
};

/* 1D FDTD in normalized units (Ez, Hy), Courant number S = c dt / dx.
   Updates follow the Yee leapfrog. Optional graded PML-like loss at both ends. */
C2.FDTD1D = function (N, S, eps, opt) {
  opt = opt || {};
  this.N = N; this.S = S; this.ez = new Float64Array(N); this.hy = new Float64Array(N); this.eps = eps || new Float64Array(N).fill(1);
  this.ce = new Float64Array(N); this.de = new Float64Array(N); this.ch = new Float64Array(N); this.dh = new Float64Array(N);
  const L = opt.pml || 0, smax = opt.smax || 0.5, mode = opt.mode || "graded";
  for (let i = 0; i < N; i++) {
    let s = 0;
    const d = i < L ? (L - i) / L : i >= N - L ? (i - (N - L - 1)) / L : 0;
    if (L && d > 0) s = mode === "abrupt" ? smax : smax * Math.pow(d, 3);
    const l = s / 2;
    this.ce[i] = (1 - l) / (1 + l); this.de[i] = (S / this.eps[i]) / (1 + l);
    this.ch[i] = (1 - l) / (1 + l); this.dh[i] = S / (1 + l);
  }
  this.wall = opt.wall || "abc"; this.t = 0; this.old = [0, 0];
};
C2.FDTD1D.prototype.step = function (src) {
  const { N, ez, hy } = this;
  for (let i = 0; i < N - 1; i++) hy[i] = this.ch[i] * hy[i] + this.dh[i] * (ez[i + 1] - ez[i]);
  const e0 = ez[1], eN = ez[N - 2];
  for (let i = 1; i < N; i++) ez[i] = this.ce[i] * ez[i] + this.de[i] * (hy[i] - hy[i - 1]);
  if (this.wall === "abc") { ez[0] = this.old[0]; this.old[0] = e0; }
  else ez[0] = 0;
  if (src) ez[src[0]] += src[1];
  this.t++;
};

/* 2D TMz FDTD (Ez, Hx, Hy) with a graded absorbing frame. */
C2.FDTD2D = function (nx, ny, S, eps, pad) {
  this.nx = nx; this.ny = ny; this.S = S; pad = pad || 12;
  const n = nx * ny; this.ez = new Float32Array(n); this.hx = new Float32Array(n); this.hy = new Float32Array(n); this.eps = eps || new Float32Array(n).fill(1);
  this.sg = new Float32Array(n);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const d = Math.max(pad - i, i - (nx - 1 - pad), pad - j, j - (ny - 1 - pad), 0) / pad; this.sg[j * nx + i] = 0.35 * d * d * d; }
  this.t = 0;
};
C2.FDTD2D.prototype.step = function (src) {
  const { nx, ny, ez, hx, hy, S, eps, sg } = this;
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, l = sg[k] / 2; hx[k] = ((1 - l) * hx[k] - S * (ez[k + nx] - ez[k])) / (1 + l); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx - 1; i++) { const k = j * nx + i, l = sg[k] / 2; hy[k] = ((1 - l) * hy[k] + S * (ez[k + 1] - ez[k])) / (1 + l); }
  for (let j = 1; j < ny; j++) for (let i = 1; i < nx; i++) { const k = j * nx + i, l = sg[k] / 2; ez[k] = ((1 - l) * ez[k] + (S / eps[k]) * ((hy[k] - hy[k - 1]) - (hx[k] - hx[k - nx]))) / (1 + l); }
  if (src) ez[src[1] * nx + src[0]] += src[2];
  this.t++;
};

/* 1D numerical dispersion of the Yee scheme (Dohlus and Zagorodnov 2009, Eq. 10 form):
   sin(k dx/2)/dx = sin(w dt/2)/(c dt). Returns k_num / k_exact for Nl cells per wavelength and Courant S. */
C2.dispRatio1D = function (Nl, S) { const a = Math.sin(Math.PI * S / Nl) / S; if (a > 1) return NaN; return (2 * Math.asin(a)) / (2 * Math.PI / Nl); };
/* 2D: k at angle phi on a square grid. Solves sin^2(w dt/2)/S^2 = sin^2(kx/2) + sin^2(ky/2) (dx = 1). */
C2.dispRatio2D = function (Nl, S, phi) {
  const lhs = Math.pow(Math.sin(Math.PI * S / Nl) / S, 2), k0 = 2 * Math.PI / Nl;
  const f = k => Math.pow(Math.sin(k * Math.cos(phi) / 2), 2) + Math.pow(Math.sin(k * Math.sin(phi) / 2), 2) - lhs;
  let lo = 0, hi = Math.PI * 1.4; if (f(hi) < 0) return NaN;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2 / k0;
};
