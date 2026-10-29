/* Shared numerical tools for the Chapter 3 lessons (inverse design).
   Everything is computed in the browser from the equations in the lessons:
   conic filter and tanh projection (Christiansen and Sigmund 2021, Tidy3D),
   erosion, dilation and the erosion-dilation penalty (Tidy3D ErosionDilationPenalty),
   binary morphology for the design rule check, Bezier curvature (Michaels and
   Yablonovitch 2018, Tidy3D bezier_curvature), a 1D Helmholtz solver with its
   adjoint (Michaels and Yablonovitch 2018, Eqs. 3, 11, 12) and Adam (Kingma and Ba 2015). */

const C3 = {};

/* ---------- small helpers ---------- */
C3.rng = function (seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
C3.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- projection (Christiansen Eq. 18, Tidy3D tanh_projection) ---------- */
C3.proj = function (x, beta, eta) {
  if (beta === 0) return x;
  return (Math.tanh(beta * eta) + Math.tanh(beta * (x - eta))) / (Math.tanh(beta * eta) + Math.tanh(beta * (1 - eta)));
};
C3.dproj = function (x, beta, eta) {
  if (beta === 0) return 1;
  const c = Math.cosh(beta * (x - eta));
  return beta / (c * c) / (Math.tanh(beta * eta) + Math.tanh(beta * (1 - eta)));
};

/* ---------- conic filter, K(r) = max(0, 1 - r / (n dl)), n = ceil(R / dl) ---------- */
C3._kc = {};
C3.kernel2D = function (n) {
  if (C3._kc[n]) return C3._kc[n];
  const k = [];
  for (let dy = -n; dy <= n; dy++) for (let dx = -n; dx <= n; dx++) {
    const w = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / n);
    if (w > 0) k.push([dx, dy, w]);
  }
  return (C3._kc[n] = k);
};
/* Sum of kernel weights that fall inside the image, per pixel (cached). */
C3._wc = {};
C3.wsum = function (W, H, n) {
  const key = W + "," + H + "," + n; if (C3._wc[key]) return C3._wc[key];
  const K = C3.kernel2D(n), ws = new Float64Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (const [dx, dy, w] of K) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H) s += w; } ws[y * W + x] = s; }
  return (C3._wc[key] = ws);
};
/* Filter with renormalization at the edges, so rho~_i = sum K rho / sum K over pixels inside. */
C3.filter2D = function (a, W, H, n) {
  if (n <= 0) return Float64Array.from(a);
  const K = C3.kernel2D(n), ws = C3.wsum(W, H, n), out = new Float64Array(W * H);
  for (let y = 0; y < H; y++) {
    const inY = y >= n && y < H - n;
    for (let x = 0; x < W; x++) {
      let s = 0;
      if (inY && x >= n && x < W - n) { const c = y * W + x; for (let k = 0; k < K.length; k++) s += K[k][2] * a[c + K[k][1] * W + K[k][0]]; }
      else for (const [dx, dy, w] of K) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H) s += w * a[Y * W + X]; }
      out[y * W + x] = s / ws[y * W + x];
    }
  }
  return out;
};
/* Transpose (vector-Jacobian product) of the renormalized filter. */
C3.filter2DT = function (u, W, H, n) {
  if (n <= 0) return Float64Array.from(u);
  const ws = C3.wsum(W, H, n), v = new Float64Array(W * H);
  for (let i = 0; i < v.length; i++) v[i] = u[i] / ws[i];
  // the kernel is symmetric, so the transpose is the unnormalized filter of u / ws
  const K = C3.kernel2D(n), out = new Float64Array(W * H);
  for (let y = 0; y < H; y++) {
    const inY = y >= n && y < H - n;
    for (let x = 0; x < W; x++) {
      let s = 0;
      if (inY && x >= n && x < W - n) { const c = y * W + x; for (let k = 0; k < K.length; k++) s += K[k][2] * v[c + K[k][1] * W + K[k][0]]; }
      else for (const [dx, dy, w] of K) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H) s += w * v[Y * W + X]; }
      out[y * W + x] = s;
    }
  }
  return out;
};
C3.fp = function (a, W, H, n, beta, eta) { const f = C3.filter2D(a, W, H, n); for (let i = 0; i < f.length; i++) f[i] = C3.proj(f[i], beta, eta); return f; };
/* VJP of fp at a: returns F^T (P'(F a) * u) */
C3.fpT = function (a, u, W, H, n, beta, eta) { const f = C3.filter2D(a, W, H, n), v = new Float64Array(f.length); for (let i = 0; i < f.length; i++) v[i] = C3.dproj(f[i], beta, eta) * u[i]; return C3.filter2DT(v, W, H, n); };

/* ---------- erosion, dilation, opening, closing as filter + projection (Tidy3D) ---------- */
C3.erode = (a, W, H, n, beta) => C3.fp(a, W, H, n, beta, 0.99);
C3.dilate = (a, W, H, n, beta) => C3.fp(a, W, H, n, beta, 0.01);
C3.open = (a, W, H, n, beta) => C3.dilate(C3.erode(a, W, H, n, beta), W, H, n, beta);
C3.close = (a, W, H, n, beta) => C3.erode(C3.dilate(a, W, H, n, beta), W, H, n, beta);
/* P_ED = ||close - open||_2 / sqrt(N), and optionally its gradient with respect to a. */
C3.edPenalty = function (a, W, H, n, beta, wantGrad) {
  const e = C3.erode(a, W, H, n, beta), o = C3.dilate(e, W, H, n, beta);
  const d = C3.dilate(a, W, H, n, beta), c = C3.erode(d, W, H, n, beta);
  const diff = new Float64Array(a.length); let s = 0;
  for (let i = 0; i < a.length; i++) { diff[i] = c[i] - o[i]; s += diff[i] * diff[i]; }
  const P = Math.sqrt(s / a.length), res = { P, diff, open: o, close: c };
  if (wantGrad && s > 0) {
    const u = new Float64Array(a.length); for (let i = 0; i < a.length; i++) u[i] = diff[i] / (Math.sqrt(s) * Math.sqrt(a.length));
    const gc = C3.fpT(a, C3.fpT(d, u, W, H, n, beta, 0.99), W, H, n, beta, 0.01);
    const go = C3.fpT(a, C3.fpT(e, u, W, H, n, beta, 0.01), W, H, n, beta, 0.99);
    res.grad = new Float64Array(a.length); for (let i = 0; i < a.length; i++) res.grad[i] = gc[i] - go[i];
  } else if (wantGrad) res.grad = new Float64Array(a.length);
  return res;
};

/* ---------- exact binary morphology with a disk, via the Euclidean distance transform ---------- */
C3.edt1 = function (f, n) { // Felzenszwalb and Huttenlocher 1D squared distance transform
  const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1); let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  return d;
};
/* Squared distance from every pixel to the nearest pixel where mask is true. Outside the image counts as 'out'. */
C3.edt = function (mask, W, H, outsideTrue) {
  const BIG = 1e12, P = 2, w = W + 2 * P, h = H + 2 * P, g = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const X = x - P, Y = y - P, inside = X >= 0 && Y >= 0 && X < W && Y < H; const m = inside ? mask[Y * W + X] : outsideTrue; g[y * w + x] = m ? 0 : BIG; }
  const col = new Float64Array(h); for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) col[y] = g[y * w + x]; const d = C3.edt1(col, h); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
  const row = new Float64Array(w); for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) row[x] = g[y * w + x]; const d = C3.edt1(row, w); for (let x = 0; x < w; x++) g[y * w + x] = d[x]; }
  const out = new Float64Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[y * W + x] = g[(y + P) * w + x + P];
  return out;
};
/* Erosion keeps pixels whose disk of radius r lies inside X. Dilation adds pixels within r of X.
   'edge' says what lies beyond the image border: 0 = air, 1 = material (for waveguides running out). */
C3.bErode = function (X, W, H, r, edge) { const inv = X.map(v => v ? 0 : 1), d = C3.edt(inv, W, H, edge ? 0 : 1), r2 = r * r; return Uint8Array.from(d, v => v > r2 ? 1 : 0); };
C3.bDilate = function (X, W, H, r, edge) { const d = C3.edt(X, W, H, edge ? 1 : 0), r2 = r * r; return Uint8Array.from(d, v => v <= r2 ? 1 : 0); };
/* Opening and closing work on a copy padded by more than r, so nothing is clipped at the border. */
C3.padB = function (X, W, H, p, val) { const w = W + 2 * p, h = H + 2 * p, Y = new Uint8Array(w * h).fill(val ? 1 : 0); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) Y[(y + p) * w + x + p] = X[y * W + x]; return Y; };
C3.cropB = function (Y, W, H, p) { const w = W + 2 * p, X = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) X[y * W + x] = Y[(y + p) * w + x + p]; return X; };
C3.bOpen = function (X, W, H, r, edge) { const p = Math.ceil(r) + 3, w = W + 2 * p, h = H + 2 * p, Y = C3.padB(X, W, H, p, edge); return C3.cropB(C3.bDilate(C3.bErode(Y, w, h, r, edge), w, h, r, edge), W, H, p); };
C3.bClose = function (X, W, H, r, edge) { const p = Math.ceil(r) + 3, w = W + 2 * p, h = H + 2 * p, Y = C3.padB(X, W, H, p, edge); return C3.cropB(C3.bErode(C3.bDilate(Y, w, h, r, edge), w, h, r, edge), W, H, p); };
/* Morphological design rule check: GaAs lost by opening and air filled by closing.
   On a pixel grid, staircase edges leave specks of a few pixels, so regions smaller than tol pixels are ignored. */
C3.drc = function (X, W, H, r, edge, tol) {
  tol = tol === undefined ? 12 : tol;
  const o = C3.bOpen(X, W, H, r, edge), c = C3.bClose(X, W, H, r, edge);
  const solid = new Uint8Array(X.length), gap = new Uint8Array(X.length);
  for (let i = 0; i < X.length; i++) { if (X[i] && !o[i]) solid[i] = 1; if (c[i] && !X[i]) gap[i] = 1; }
  const keep = (M) => { const lab = C3.label(M, W, H); let n = 0, regions = 0; const sizes = {}; for (let i = 0; i < M.length; i++) if (lab[i] >= 0) sizes[lab[i]] = (sizes[lab[i]] || 0) + 1; for (let i = 0; i < M.length; i++) { if (lab[i] >= 0 && sizes[lab[i]] < tol) M[i] = 0; else if (M[i]) n++; } for (const k in sizes) if (sizes[k] >= tol) regions++; return [n, regions]; };
  const [ns, rs] = keep(solid), [ng, rg] = keep(gap);
  return { solid, gap, ns, ng, rs, rg, open: o, close: c };
};
/* Labels of 8-connected regions of true pixels (-1 elsewhere). */
C3.label = function (M, W, H) {
  const lab = new Int32Array(M.length).fill(-1), st = []; let n = 0;
  for (let i = 0; i < M.length; i++) { if (!M[i] || lab[i] >= 0) continue; lab[i] = n; st.push(i);
    while (st.length) { const p = st.pop(), x = p % W, y = (p - x) / W; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const q = Y * W + X; if (M[q] && lab[q] < 0) { lab[q] = n; st.push(q); } } }
    n++; }
  return lab;
};
/* Connected components (4-neighbour) of pixels equal to val. Returns [{area, touchesEdge}]. */
C3.components = function (X, W, H, val) {
  const lab = new Int32Array(X.length).fill(-1), out = [], st = [];
  for (let i = 0; i < X.length; i++) {
    if (lab[i] >= 0 || X[i] !== val) continue;
    let area = 0, edge = false; st.push(i); lab[i] = out.length;
    while (st.length) { const p = st.pop(), x = p % W, y = (p - x) / W; area++; if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && lab[q] < 0 && X[q] === val) { lab[q] = out.length; st.push(q); } }
    out.push({ area, edge });
  }
  return out;
};

/* ---------- drawing ---------- */
/* Density map: 1 = GaAs (dark slate), 0 = air (white). Overlays: [[mask, [r,g,b]], ...] */
C3.draw = function (fig, a, W, H, scale, caption, overlays) {
  const c = C2.canvas(fig, W, H, scale, caption), d = c.img.data;
  for (let i = 0; i < W * H; i++) { const v = C3.clamp(a[i], 0, 1); d[4 * i] = Math.round(255 - v * 205); d[4 * i + 1] = Math.round(255 - v * 190); d[4 * i + 2] = Math.round(255 - v * 160); d[4 * i + 3] = 255; }
  for (const [m, col] of overlays || []) for (let i = 0; i < W * H; i++) if (m[i]) { d[4 * i] = col[0]; d[4 * i + 1] = col[1]; d[4 * i + 2] = col[2]; }
  c.ctx.putImageData(c.img, 0, 0);
  return c;
};
/* Several maps side by side in one canvas, separated by a gap. */
C3.drawRow = function (fig, maps, W, H, scale, caption, labels) {
  const gap = 4, TW = maps.length * W + (maps.length - 1) * gap, c = C2.canvas(fig, TW, H, scale, caption), d = c.img.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 255; }
  maps.forEach((m, k) => {
    const x0 = k * (W + gap);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, j = 4 * (y * TW + x0 + x);
      if (m.rgb) { const col = m.rgb(i); d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; }
      else { const v = C3.clamp(m.a[i], 0, 1); d[j] = Math.round(255 - v * 205); d[j + 1] = Math.round(255 - v * 190); d[j + 2] = Math.round(255 - v * 160); }
      if (m.over) for (const [mask, col] of m.over) if (mask[i]) { d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; }
    }
  });
  c.ctx.putImageData(c.img, 0, 0);
  if (labels) fig.insertAdjacentHTML("afterbegin", `<div style="display:grid;grid-template-columns:repeat(${maps.length},1fr);max-width:${TW * scale}px;font-size:12px;color:var(--muted);margin-bottom:4px">${labels.map(l => `<span style="text-align:center">${l}</span>`).join("")}</div>`);
  return c;
};

/* ---------- test patterns ---------- */
/* A smooth random density, values in [0, 1]. */
C3.noise = function (W, H, seed) { const r = C3.rng(seed), a = new Float64Array(W * H); for (let i = 0; i < a.length; i++) a[i] = r(); return a; };
/* Rounded rectangle fill (corner radius rc) into a binary array. */
C3.rrect = function (X, W, H, x0, y0, x1, y1, rc, val) {
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) {
    const px = x + 0.5, py = y + 0.5; if (px < x0 || px > x1 || py < y0 || py > y1) continue;
    const cx = C3.clamp(px, x0 + rc, x1 - rc), cy = C3.clamp(py, y0 + rc, y1 - rc);
    if ((px - cx) * (px - cx) + (py - cy) * (py - cy) <= rc * rc) X[y * W + x] = val;
  }
};
C3.disk = function (X, W, H, cx, cy, r, val) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) X[y * W + x] = val; };

/* ---------- curvature (Tidy3D bezier_curvature, credited to Michaels and Yablonovitch 2018) ----------
   The quadratic Bezier curve passes through the vertex pc at t = 1/2 (its middle control point is
   p1 = 2 pc - (p0 + p2)/2). At t = 1/2: B' = p2 - p0, B'' = 4 (p0 - 2 pc + p2). */
C3.bezierK = function (p0, pc, p2) {
  const d1 = [p2[0] - p0[0], p2[1] - p0[1]], d2 = [4 * (p0[0] - 2 * pc[0] + p2[0]), 4 * (p0[1] - 2 * pc[1] + p2[1])];
  return (d1[0] * d2[1] - d1[1] * d2[0]) / Math.pow(d1[0] * d1[0] + d1[1] * d1[1], 1.5);
};
C3.curvTerm = (r, rmin, kappa) => { const e = Math.exp(-kappa * (r - rmin)); return isFinite(e) ? e / (1 + e) : 1; };
/* Penalty over an open or closed list of points. Returns {P, r: radii per vertex}. */
C3.curvPenalty = function (pts, rmin, kappa, closed) {
  const n = pts.length, r = [], terms = [];
  const idx = closed ? [...Array(n).keys()] : [...Array(n - 2).keys()].map(i => i + 1);
  for (const i of idx) { const k = C3.bezierK(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]); const ri = 1 / (Math.abs(k) + 1e-9); r.push(ri); terms.push(C3.curvTerm(ri, rmin, kappa)); }
  return { P: terms.reduce((a, b) => a + b, 0) / terms.length, r, terms, idx };
};

/* ---------- 1D Helmholtz solver: a (E_{i-1} - 2E_i + E_{i+1}) + k0^2 eps_i E_i = b_i ----------
   Ends are exact one-way boundaries for the discrete equation, so waves leave without reflection.
   The matrix A is complex symmetric (A^T = A), so the adjoint problem uses the same solver. */
C3.helm = function (eps, lam, dx, bre, bim) {
  const N = eps.length, a = 1 / (dx * dx), k0 = 2 * Math.PI / lam;
  const dr = new Float64Array(N), di = new Float64Array(N);
  for (let i = 0; i < N; i++) dr[i] = -2 * a + k0 * k0 * eps[i];
  for (const i of [0, N - 1]) { const kd = Math.acos(C3.clamp(1 - k0 * k0 * eps[i] * dx * dx / 2, -1, 1)) / dx; dr[i] += a * Math.cos(kd * dx); di[i] += a * Math.sin(kd * dx); }
  // Thomas algorithm, sub and super diagonals equal to a
  const cr = new Float64Array(N), ci = new Float64Array(N), xr = new Float64Array(N), xi = new Float64Array(N);
  const div = (ar, ai, br, bi) => { const m = br * br + bi * bi; return [(ar * br + ai * bi) / m, (ai * br - ar * bi) / m]; };
  let [c0r, c0i] = div(a, 0, dr[0], di[0]); cr[0] = c0r; ci[0] = c0i;
  let [y0r, y0i] = div(bre[0], bim ? bim[0] : 0, dr[0], di[0]); xr[0] = y0r; xi[0] = y0i;
  for (let i = 1; i < N; i++) {
    const mr = dr[i] - a * cr[i - 1], mi = di[i] - a * ci[i - 1];
    if (i < N - 1) { const [r1, i1] = div(a, 0, mr, mi); cr[i] = r1; ci[i] = i1; }
    const [r2, i2] = div(bre[i] - a * xr[i - 1], (bim ? bim[i] : 0) - a * xi[i - 1], mr, mi); xr[i] = r2; xi[i] = i2;
  }
  for (let i = N - 2; i >= 0; i--) { const tr = cr[i] * xr[i + 1] - ci[i] * xi[i + 1], ti = cr[i] * xi[i + 1] + ci[i] * xr[i + 1]; xr[i] -= tr; xi[i] -= ti; }
  return { re: xr, im: xi };
};

/* A 1D device: air | design pixels | air. Source on the left, output probe on the right. */
C3.Dev1D = function (opt) {
  opt = opt || {};
  this.dx = opt.dx || 10; this.pad = opt.pad || 40; this.Nd = opt.Nd || 120;
  this.N = this.Nd + 2 * this.pad; this.src = 12; this.out = this.N - 8;
  this.eMin = opt.eMin || 1; this.eMax = opt.eMax || 12.19;
  this.b = new Float64Array(this.N); this.b[this.src] = 1 / this.dx;
  this.norm = {};
};
C3.Dev1D.prototype.eps = function (rhoHat) { const e = new Float64Array(this.N).fill(this.eMin); for (let i = 0; i < this.Nd; i++) e[this.pad + i] = this.eMin + rhoHat[i] * (this.eMax - this.eMin); return e; };
C3.Dev1D.prototype.vac = function (lam) { if (!this.norm[lam]) { const f = C3.helm(new Float64Array(this.N).fill(this.eMin), lam, this.dx, this.b); this.norm[lam] = f.re[this.out] ** 2 + f.im[this.out] ** 2; } return this.norm[lam]; };
/* Transmission T and its gradient dT/deps_i over the design pixels (adjoint method). */
C3.Dev1D.prototype.T = function (rhoHat, lam, wantGrad) {
  const e = this.eps(rhoHat), f = C3.helm(e, lam, this.dx, this.b), n0 = this.vac(lam), o = this.out;
  const T = (f.re[o] ** 2 + f.im[o] ** 2) / n0, res = { T, fwd: f, eps: e };
  if (wantGrad) {
    // F = |g^T x|^2 / n0, dF/dx = conj(g^T x) g^T / n0. Adjoint: A^T y = (dF/dx)^T, A^T = A.
    const sr = new Float64Array(this.N), si = new Float64Array(this.N); sr[o] = f.re[o] / n0; si[o] = -f.im[o] / n0;
    const y = C3.helm(e, lam, this.dx, sr, si), k0 = 2 * Math.PI / lam, g = new Float64Array(this.Nd);
    // dF/deps_i = -2 Re{ y_i (dA/deps_i)_ii x_i } with (dA/deps_i)_ii = k0^2
    for (let i = 0; i < this.Nd; i++) { const j = this.pad + i; g[i] = -2 * k0 * k0 * (y.re[j] * f.re[j] - y.im[j] * f.im[j]); }
    res.adj = y; res.grad = g;
  }
  return res;
};

/* ---------- 1D filter and projection for the design chain ---------- */
C3.filter1D = function (a, n) { if (n <= 0) return Float64Array.from(a); const N = a.length, o = new Float64Array(N); for (let i = 0; i < N; i++) { let s = 0, w = 0; for (let d = -n; d <= n; d++) { const j = i + d; if (j < 0 || j >= N) continue; const k = Math.max(0, 1 - Math.abs(d) / n); s += k * a[j]; w += k; } o[i] = s / w; } return o; };
C3.filter1DT = function (u, n) { if (n <= 0) return Float64Array.from(u); const N = u.length, o = new Float64Array(N); for (let i = 0; i < N; i++) { let w = 0; for (let d = -n; d <= n; d++) { const j = i + d; if (j >= 0 && j < N) w += Math.max(0, 1 - Math.abs(d) / n); } for (let d = -n; d <= n; d++) { const j = i + d; if (j >= 0 && j < N) o[j] += Math.max(0, 1 - Math.abs(d) / n) * u[i] / w; } } return o; };
C3.fp1D = (a, n, beta, eta) => C3.filter1D(a, n).map(v => C3.proj(v, beta, eta));
C3.fp1DT = (a, u, n, beta, eta) => { const f = C3.filter1D(a, n); return C3.filter1DT(f.map((v, i) => C3.dproj(v, beta, eta) * u[i]), n); };
C3.ed1D = function (a, n, beta) {
  const E = x => C3.fp1D(x, n, beta, 0.99), D = x => C3.fp1D(x, n, beta, 0.01);
  const e = E(a), o = D(e), d = D(a), c = E(d), N = a.length; let s = 0; const diff = c.map((v, i) => v - o[i]); diff.forEach(v => s += v * v);
  const P = Math.sqrt(s / N), grad = new Float64Array(N);
  if (s > 0) { const u = diff.map(v => v / Math.sqrt(s * N)); const gc = C3.fp1DT(a, C3.fp1DT(d, u, n, beta, 0.99), n, beta, 0.01), go = C3.fp1DT(a, C3.fp1DT(e, u, n, beta, 0.01), n, beta, 0.99); for (let i = 0; i < N; i++) grad[i] = gc[i] - go[i]; }
  return { P, grad, open: o, close: c };
};

/* ---------- Adam (Kingma and Ba 2015, Algorithm 1) ---------- */
C3.Adam = function (n, lr, b1, b2, epsl) { this.m = new Float64Array(n); this.v = new Float64Array(n); this.t = 0; this.lr = lr; this.b1 = b1 || 0.9; this.b2 = b2 || 0.999; this.e = epsl || 1e-8; };
/* Returns the step to ADD for gradient ASCENT on g (maximization, as in J). */
C3.Adam.prototype.step = function (g) {
  this.t++; const s = new Float64Array(g.length), c1 = 1 - Math.pow(this.b1, this.t), c2 = 1 - Math.pow(this.b2, this.t);
  for (let i = 0; i < g.length; i++) { this.m[i] = this.b1 * this.m[i] + (1 - this.b1) * g[i]; this.v[i] = this.b2 * this.v[i] + (1 - this.b2) * g[i] * g[i]; s[i] = this.lr * (this.m[i] / c1) / (Math.sqrt(this.v[i] / c2) + this.e); }
  return s;
};

/* ---------- full 1D inverse design: filter, projection, beta continuation, optional ED penalty ---------- */
C3.Opt1D = function (opt) {
  this.dev = new C3.Dev1D(opt); this.n = opt.n || 3; this.edN = opt.edN || this.n; this.lr = opt.lr || 0.05;
  this.goal = opt.goal || "mirror"; this.useED = !!opt.ed; this.cont = opt.cont !== false;
  this.levels = opt.levels || 8; this.per = opt.per || 10; this.betaMax = opt.betaMax || 64;
  const r = C3.rng(opt.seed || 7); this.rho = new Float64Array(this.dev.Nd).map(() => 0.5 + 0.02 * (r() - 0.5));
  this.adam = new C3.Adam(this.dev.Nd, this.lr); this.k = 0; this.hist = [];
};
C3.Opt1D.prototype.beta = function () { if (!this.cont) return this.betaMax; const L = Math.min(this.levels - 1, Math.floor(this.k / this.per)); return Math.pow(this.betaMax, L / (this.levels - 1)); };
C3.Opt1D.prototype.bands = function () {
  // Gaussian weights normalized to one (Ch. 3 Eq. 3.14 form)
  const mk = (l0, s, n) => { const ls = range(l0 - 2 * s, l0 + 2 * s, n), w = ls.map(l => Math.exp(-((l - l0) ** 2) / (2 * s * s))), S = w.reduce((a, b) => a + b, 0); return ls.map((l, i) => [l, w[i] / S]); };
  if (this.goal === "mirror") return { pass: [], block: mk(800, 15, 5) };
  return { pass: mk(1000, 15, 3), block: mk(700, 15, 3) };
};
/* Objective J and gradient with respect to rho. Mirror: J = sum w (1 - T). Dichroic: J = sum w T(pass) + sum w (1 - T(block)). */
C3.Opt1D.prototype.evaluate = function (rho, wantGrad) {
  const b = this.beta(), n = this.n, f = C3.filter1D(rho, n), rh = f.map(v => C3.proj(v, b, 0.5));
  const B = this.bands(); let J = 0; const gE = new Float64Array(rho.length);
  for (const [lam, w] of B.pass) { const r = this.dev.T(rh, lam, wantGrad); J += w * r.T; if (wantGrad) for (let i = 0; i < gE.length; i++) gE[i] += w * r.grad[i]; }
  for (const [lam, w] of B.block) { const r = this.dev.T(rh, lam, wantGrad); J += w * (1 - r.T); if (wantGrad) for (let i = 0; i < gE.length; i++) gE[i] -= w * r.grad[i]; }
  let F = J, P = 0, wED = 0;
  let g = null;
  if (wantGrad) { const de = this.dev.eMax - this.dev.eMin; g = C3.filter1DT(f.map((v, i) => C3.dproj(v, b, 0.5) * de * gE[i]), n); }
  if (this.useED) { wED = Math.min(1, b / 25); const ed = C3.ed1D(rh, this.edN, 100); P = ed.P; J -= wED * P; if (wantGrad) { const back = C3.filter1DT(f.map((v, i) => C3.dproj(v, b, 0.5) * ed.grad[i]), n); for (let i = 0; i < g.length; i++) g[i] -= wED * back[i]; } }
  return { J, F, P, wED, g, rhoHat: rh, beta: b };
};
C3.Opt1D.prototype.step = function () {
  const ev = this.evaluate(this.rho, true), s = this.adam.step(ev.g);
  for (let i = 0; i < this.rho.length; i++) this.rho[i] = C3.clamp(this.rho[i] + s[i], 0, 1);
  this.hist.push([ev.F, ev.J, ev.beta]); this.k++;
  return ev;
};
/* Spectrum of the current design (thresholded at 0.5 when final). */
C3.Opt1D.prototype.spectrum = function (rhoHat, l0, l1, n) { return range(l0, l1, n).map(l => [l, this.dev.T(rhoHat, l, false).T]); };

/* ---------- small SVG chart helpers ---------- */
/* Axes box with ticks. xt and yt are lists of values; fx and fy format tick labels. */
C3.frame = function (x0, y0, w, h, xmin, xmax, ymin, ymax, xt, yt, xlab, ylab, fx, fy) {
  fx = fx || (v => v); fy = fy || (v => v);
  const X = v => x0 + (v - xmin) / (xmax - xmin) * w, Y = v => y0 + h - (v - ymin) / (ymax - ymin) * h;
  let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
  for (const v of xt || []) s += `<line x1="${X(v)}" x2="${X(v)}" y1="${y0 + h}" y2="${y0 + h + 4}" stroke="var(--p)"/><text class="ts" x="${X(v)}" y="${y0 + h + 17}" text-anchor="middle">${fx(v)}</text>`;
  for (const v of yt || []) s += `<line x1="${x0 - 4}" x2="${x0}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--p)"/><text class="ts" x="${x0 - 7}" y="${Y(v) + 4}" text-anchor="end">${fy(v)}</text>`;
  if (xlab) s += `<text class="ts" x="${x0 + w / 2}" y="${y0 + h + 34}" text-anchor="middle">${xlab}</text>`;
  if (ylab) s += `<text class="ts" x="${x0 - 40}" y="${y0 + h / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 40} ${y0 + h / 2})">${ylab}</text>`;
  return s;
};
C3.X = (x0, w, a, b) => v => x0 + (v - a) / (b - a) * w;
C3.Y = (y0, h, a, b) => v => y0 + h - (v - a) / (b - a) * h;
/* A 1D design drawn as a stripe of pixels (dark = GaAs). */
C3.stripe = function (x0, y0, w, h, vals, colHi, colLo) {
  const n = vals.length, dw = w / n; let s = "";
  for (let i = 0; i < n; i++) { const v = C3.clamp(vals[i], 0, 1); s += `<rect x="${(x0 + i * dw).toFixed(2)}" y="${y0}" width="${(dw + 0.3).toFixed(2)}" height="${h}" fill="${colHi || "var(--blue)"}" fill-opacity="${(0.08 + 0.92 * v).toFixed(3)}"/>`; }
  return s + `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
};
/* Formatting */
C3.f = (v, d) => (Math.abs(v) < 1e-12 ? 0 : v).toFixed(d === undefined ? 3 : d);
/* Legend: items [[label, color, dash]] in a row starting at (x, y). */
C3.legend = function (x, y, items) {
  let s = "", cx = x;
  for (const [lab, col, dash] of items) { s += `<line x1="${cx}" x2="${cx + 22}" y1="${y - 4}" y2="${y - 4}" stroke="${col}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/><text class="ts" x="${cx + 28}" y="${y}">${lab}</text>`; cx += 40 + lab.length * 6.6; }
  return s;
};
/* Test pattern for the morphology lessons (100 x 64 pixels): two blocks with a narrow gap,
   a thin bar, a block with a small hole, a small island, sharp corners everywhere. */
C3.pattern = function () {
  const W = 100, H = 64, X = new Uint8Array(W * H);
  C3.rrect(X, W, H, 4, 4, 40, 30, 0, 1); C3.rrect(X, W, H, 44, 4, 96, 30, 0, 1);
  C3.rrect(X, W, H, 4, 40, 96, 44, 0, 1);
  C3.rrect(X, W, H, 60, 50, 92, 62, 0, 1); C3.disk(X, W, H, 76, 56, 2.5, 0);
  C3.disk(X, W, H, 20, 55, 3, 1);
  return { X, W, H };
};
/* Layout for the design rule check lessons: 170 x 160 pixels of 5 nm (850 x 800 nm).
   rc = corner radius of the two large blocks in pixels. */
C3.drcLayout = function (rc) {
  const W = 170, H = 160, X = new Uint8Array(W * H);
  C3.rrect(X, W, H, 6, 6, 56, 96, rc, 1);             // block A
  C3.rrect(X, W, H, 74, 4, 164, 66, rc, 1);           // block B, 90 nm from A
  C3.disk(X, W, H, 130, 35, 6, 0);                    // 60 nm hole in B
  C3.rrect(X, W, H, 84, 92, 164, 104, 6, 1);          // 60 nm wide line
  C3.disk(X, W, H, 110, 135, 6, 1);                   // 60 nm island
  C3.disk(X, W, H, 31.5, 138.5, 13, 1);               // 130 nm disk: wide enough, area too small
  return { X, W, H, px: 5 };
};
