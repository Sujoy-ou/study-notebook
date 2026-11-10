(function () {
/* ML shelf, Part 10, E1: midterm-style practice. A 100-point practice midterm over the material before the AME 5970 midterm (syllabus weeks 1 to 7, Lectures 0 to 5, HW1 to HW7): twelve short questions (Part A, 24 points) and eight board problems with worked solutions revealed one line at a time (Part B, 76 points), a score sheet that collects the self-marks, and the agent card. Follows the order of the professor's Lectures 1 to 5 and the hand calculations of HW1 to HW7, with Andrew Ng's Machine Learning Specialization course 1 weeks 1 to 3 and course 2 week 3 and the CS229 notes as the spine. Every number was computed with NumPy, and the PyTorch outputs with PyTorch 2.15 on the CPU. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const dot = (x, y, r, col, hollow) => hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--bg)" stroke="${col}" stroke-width="1.8"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const LET = "abcdefgh";
const ln = (x1, y1, x2, y2, col, w, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w || 1.5}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const clip = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;

/* ---------- the exam: sections, points and the lessons behind them ---------- */
const SECS = [
  { key: "A", name: "Part A. Short questions", short: "A", pts: 24, lessons: "Lessons 1 to 5, 8, 9, 12 and 21", topics: ["learning types", "leakage", "baselines", "aliasing", "mutable default", "broadcasting", "views", "axis", "dtype"] },
  { key: "B1", name: "B1. Linear algebra", short: "B1", pts: 10, lessons: "Lesson 12", topics: ["shapes", "2 by 2 inverse", "determinant as area", "eigenvectors", "rank"] },
  { key: "B2", name: "B2. Gradients", short: "B2", pts: 8, lessons: "Lesson 13", topics: ["partials", "chain rule", "∇J in matrix form", "gradient check"] },
  { key: "B3", name: "B3. Linear regression by hand", short: "B3", pts: 14, lessons: "Lesson 15", topics: ["design matrix", "normal equation", "residuals", "cost J", "R², MAE, RMSE", "extrapolation", "projection"] },
  { key: "B4", name: "B4. Gradient descent", short: "B4", pts: 10, lessons: "Lesson 16", topics: ["one step", "two steps", "2/λmax", "1 − αλ", "SGD", "batches"] },
  { key: "B5", name: "B5. Feature scaling", short: "B5", pts: 8, lessons: "Lesson 17", topics: ["standardize", "training statistics", "back to raw units", "condition number"] },
  { key: "B6", name: "B6. Probability and likelihood", short: "B6", pts: 10, lessons: "Lessons 14 and 18", topics: ["Bernoulli MLE", "Gaussian MLE", "Bayes rule", "mean and median", "Huber"] },
  { key: "B7", name: "B7. Overfitting and regularization", short: "B7", pts: 8, lessons: "Lesson 19", topics: ["bias and variance", "regularized cost", "weight decay", "k-fold CV", "one SE rule"] },
  { key: "B8", name: "B8. Python classes and PyTorch", short: "B8", pts: 8, lessons: "Lessons 6, 21, 22 and 23", topics: ["super()", "inheritance", "dim and keepdim", "autograd accumulates", "parameter count", "loop order"] }
];
const MARK = {};

/* ---------- shared 2 by 2 tools ---------- */
const eig2 = A => {
  const a = A[0][0], b = A[0][1], d = A[1][1], tr = a + d, det = a * d - b * b, r = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + r, l2 = tr / 2 - r;
  let e1 = Math.abs(b) > 1e-12 ? [l1 - d, b] : (a >= d ? [1, 0] : [0, 1]);
  const n = Math.hypot(e1[0], e1[1]); e1 = [e1[0] / n, e1[1] / n];
  return { l1, l2, e1, e2: [-e1[1], e1[0]] };
};
/* contour (p − c)ᵀ A (p − c) = lev of a positive definite 2 by 2 A, drawn on axes a */
const ellipse = (a, c, A, lev, col, w, dash) => {
  const E = eig2(A), pts = [];
  for (let i = 0; i <= 120; i++) {
    const t = 2 * Math.PI * i / 120, p = Math.sqrt(lev / E.l1) * Math.cos(t), q = Math.sqrt(lev / E.l2) * Math.sin(t);
    pts.push([a.X(c[0] + p * E.e1[0] + q * E.e2[0]), a.Y(c[1] + p * E.e1[1] + q * E.e2[1])]);
  }
  return ML.path(pts, col, w || 1.2, dash);
};
/* least squares by Householder QR, rows of A */
const lsq = (A, b) => {
  const m = A.length, n = A[0].length, R = A.map(r => r.slice()), y = b.slice();
  for (let k = 0; k < n; k++) {
    let nrm = 0; for (let i = k; i < m; i++) nrm += R[i][k] * R[i][k]; nrm = Math.sqrt(nrm);
    if (nrm === 0) continue;
    const al = R[k][k] > 0 ? -nrm : nrm, v = new Array(m).fill(0);
    for (let i = k; i < m; i++) v[i] = R[i][k]; v[k] -= al;
    let vv = 0; for (let i = k; i < m; i++) vv += v[i] * v[i]; if (vv === 0) continue;
    for (let j = k; j < n; j++) { let s = 0; for (let i = k; i < m; i++) s += v[i] * R[i][j]; s = 2 * s / vv; for (let i = k; i < m; i++) R[i][j] -= s * v[i]; }
    let s = 0; for (let i = k; i < m; i++) s += v[i] * y[i]; s = 2 * s / vv; for (let i = k; i < m; i++) y[i] -= s * v[i];
  }
  const c = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let j = i + 1; j < n; j++) s -= R[i][j] * c[j]; c[i] = s / R[i][i]; }
  return c;
};

/* ---------- the board engine ----------
   P = { key, parts: [{t, pts, q, a: [lines], ans}], st: () => state, pic(k, st, shown) -> {h, s, html}, ctl(k, st) -> html, bind(k, st, redraw) }
   Solutions open one line at a time, the way they would be written on the board. Self-marks go into MARK for the score sheet. */
function board(fig, ctl, P) {
  const id = "e1" + P.key.toLowerCase(), st = P.st ? P.st() : {};
  let k = 0, shown = 0;
  if (!MARK[P.key]) MARK[P.key] = P.parts.map(() => null);
  ctl.innerHTML = `<div class="row">${P.parts.map((p, i) => `<button data-${id}="${i}">(${LET[i]}) ${p.pts} pt</button>`).join("")}</div><div id="${id}x"></div>` +
    `<div class="row"><button id="${id}n" class="on">Next line</button><button id="${id}a">Show all</button><button id="${id}h">Hide</button></div><div id="${id}s"></div><div id="${id}m"></div>`;
  const pic = () => {
    if (!$(id + "s")) return;
    const p = P.parts[k], g = P.pic(k, st, shown);
    fig.innerHTML = svg(g.h, g.s) + (g.html || "") + `<p style="font-weight:600;margin:6px 0 4px">${P.key}(${LET[k]}). ${p.t} <span class="sm">[${p.pts} points]</span></p><p>${p.q}</p>`;
    typesetMath(fig);
  };
  const sol = () => {
    const p = P.parts[k], L = p.a;
    $(id + "s").innerHTML = shown ? `<div class="dnote">${L.slice(0, shown).map(l => `<p>${l}</p>`).join("")}${shown >= L.length ? `<p><b>Answer.</b> ${p.ans}</p>` : ""}</div>` : `<p class="note">Work it on paper first. Then open the board solution one line at a time and compare.</p>`;
    $(id + "n").disabled = shown >= L.length;
    typesetMath($(id + "s"));
  };
  const marks = () => {
    const p = P.parts[k], m = MARK[P.key], tot = P.parts.reduce((s, q) => s + q.pts, 0), got = m.reduce((s, v) => s + (v || 0), 0), done = m.filter(v => v != null).length;
    $(id + "m").innerHTML = `<div class="row"><span class="sm" style="min-width:0">Mark this part:</span>${[[0, "none"], [p.pts / 2, "half"], [p.pts, "full"]].map(([v, t]) => `<button data-${id}m="${v}" class="${m[k] === v ? "on" : ""}">${t} (${v})</button>`).join("")}</div><p class="note">This problem so far: <b>${got} of ${tot}</b> points, ${done} of ${P.parts.length} parts marked. The score sheet picks these marks up.</p>`;
    $(id + "m").querySelectorAll(`button[data-${id}m]`).forEach(b => b.onclick = () => { m[k] = +b.dataset[id + "m"]; marks(); });
  };
  const part = () => {
    pick(ctl, id, k);
    $(id + "x").innerHTML = P.ctl ? P.ctl(k, st) : "";
    if (P.bind) P.bind(k, st, pic);
    pic(); sol(); marks();
  };
  ctl.querySelectorAll(`button[data-${id}]`).forEach(b => b.onclick = () => { k = +b.dataset[id]; shown = 0; part(); });
  $(id + "n").onclick = () => { shown = Math.min(shown + 1, P.parts[k].a.length); sol(); pic(); };
  $(id + "a").onclick = () => { shown = P.parts[k].a.length; sol(); pic(); };
  $(id + "h").onclick = () => { shown = 0; sol(); pic(); };
  part();
}
/* a slider row with its live value, bound to st[key] */
const slb = (id, lab, mn, mx, stp, v) => sl(id, lab, mn, mx, stp, v);
const bindSl = (st, pairs, redraw, fmt) => pairs.forEach(([id, key, d]) => {
  const el = $(id); if (!el) return;
  const show = () => { $(id + "v").textContent = fmt && fmt[key] ? fmt[key](st[key]) : f(st[key], d == null ? 2 : d); };
  el.oninput = () => { st[key] = +el.value; show(); redraw(); }; show();
});

/* ====================================================================
   B1. Linear algebra
   ==================================================================== */
const PRODS = [["X w", [6, 3], [3, 1]], ["Xᵀ X", [3, 6], [6, 3]], ["Xᵀ y", [3, 6], [6, 1]], ["X Xᵀ", [6, 3], [3, 6]]];
const B1 = {
  key: "B1",
  st: () => ({ prod: 1, m: [4, 2, 1, 3], ang: 30, third: 0 }),
  parts: [
    { t: "Shapes", pts: 2, q: String.raw`\(X\) is 6 by 3, \(\mathbf w\) has 3 entries and \(\mathbf y\) has 6. Give the shapes of \(X\mathbf w\), \(X^\top X\), \(X^\top\mathbf y\) and \(XX^\top\). Which two appear in the normal equation?`,
      a: [String.raw`A product \(AB\) needs the inner sizes to agree and keeps the outer ones: (r by n) times (n by c) is r by c.`,
        String.raw`\(X\mathbf w\): (6 by 3) times (3) gives 6 entries, one prediction per row.`,
        String.raw`\(X^\top X\): (3 by 6) times (6 by 3) gives 3 by 3, one entry per pair of features. \(X^\top\mathbf y\): (3 by 6) times (6) gives 3 entries.`,
        String.raw`\(XX^\top\): (6 by 3) times (3 by 6) gives 6 by 6, one entry per pair of examples.`,
        String.raw`The normal equation \(X^\top X\,\mathbf w = X^\top\mathbf y\) uses the 3 by 3 matrix and the 3-entry vector, so its size is set by the number of features, not by the number of rows.`],
      ans: String.raw`(6,), (3, 3), (3,) and (6, 6). The normal equation uses \(X^\top X\) and \(X^\top\mathbf y\).` },
    { t: "Inverse and a solve", pts: 2, q: String.raw`\(M = \begin{bmatrix} 4 & 2 \\ 1 & 3\end{bmatrix}\). Find \(\det M\) and \(M^{-1}\), then solve \(M\mathbf v = (8, 7)\).`,
      a: [String.raw`\(\det M = 4\cdot 3 - 2\cdot 1 = 10\). It is not zero, so the inverse exists.`,
        String.raw`For a 2 by 2: swap the diagonal, negate the off-diagonal, divide by the determinant. \(M^{-1} = \frac{1}{10}\begin{bmatrix} 3 & -2 \\ -1 & 4\end{bmatrix}\).`,
        String.raw`\(\mathbf v = M^{-1}(8, 7) = \frac{1}{10}(24 - 14,\ -8 + 28) = (1, 2)\).`,
        String.raw`Check by multiplying back: \(4\cdot 1 + 2\cdot 2 = 8\) and \(1\cdot 1 + 3\cdot 2 = 7\).`],
      ans: String.raw`\(\det M = 10\), \(M^{-1} = \frac{1}{10}\begin{bmatrix} 3 & -2 \\ -1 & 4\end{bmatrix}\), \(\mathbf v = (1, 2)\).` },
    { t: "What M does to the plane", pts: 2, q: String.raw`Sketch the image of the unit square under \(M\). What is its area, and what would \(\det M = 0\) mean for the solve in part (b)?`,
      a: [String.raw`The corners (0, 0), (1, 0), (0, 1), (1, 1) go to (0, 0), the first column (4, 1), the second column (2, 3), and their sum (6, 4).`,
        String.raw`The image is a parallelogram of area \(|\det M| = 10\). Every area in the plane is scaled by 10.`,
        String.raw`With \(\det M = 0\) the columns are parallel and the square collapses onto a line. Points off that line are never reached and points on it are reached many times, so \(M\mathbf v = \mathbf b\) has no solution or infinitely many, and there is no inverse.`],
      ans: String.raw`A parallelogram with corners (0, 0), (4, 1), (6, 4), (2, 3) and area 10. A zero determinant flattens it to a line: no unique solution.` },
    { t: "Eigenvalues", pts: 2, q: String.raw`\(S = \begin{bmatrix} 5 & 2 \\ 2 & 2\end{bmatrix}\) is symmetric. Find its eigenvalues, its eigenvectors and its condition number.`,
      a: [String.raw`\(\det(S - \lambda I) = (5 - \lambda)(2 - \lambda) - 4 = \lambda^2 - 7\lambda + 6 = (\lambda - 6)(\lambda - 1)\), so \(\lambda = 6\) and \(\lambda = 1\).`,
        String.raw`For 6: \((S - 6I)\mathbf v = \mathbf 0\) gives \(-v_1 + 2v_2 = 0\), so \(\mathbf v \propto (2, 1)\). For 1: \(4v_1 + 2v_2 = 0\), so \(\mathbf v \propto (1, -2)\).`,
        String.raw`The two directions are perpendicular, as they are for every symmetric matrix. Check: the trace 7 is 6 + 1 and the determinant 6 is 6 times 1.`,
        String.raw`The condition number is \(\lambda_{\max}/\lambda_{\min} = 6\). If \(S\) were the curvature \(X^\top X/m\) of a cost, its contours would be ellipses with curvature 6 along (2, 1) and 1 along (1, −2).`],
      ans: String.raw`\(\lambda = 6\) along \((2, 1)/\sqrt5\) and \(\lambda = 1\) along \((1, -2)/\sqrt5\). Condition number 6.` },
    { t: "Rank and a singular XᵀX", pts: 2, q: String.raw`Inputs x = 0, 1, 2, 3. A student builds the features 1, x and 3x − 1. Find the rank of \(X\) and say what happens to the normal equation. What changes if the third feature is \(x^2\) instead?`,
      a: [String.raw`The columns are \(\mathbf 1\), \(\mathbf x\) and \(3\mathbf x - \mathbf 1\), so column 3 = 3 times column 2 minus column 1. Only two columns are independent: rank 2.`,
        String.raw`Then \(X^\top X = \begin{bmatrix} 4 & 6 & 14 \\ 6 & 14 & 36 \\ 14 & 36 & 94\end{bmatrix}\) is singular, its determinant is 0, and \(X^\top X\,\mathbf w = X^\top\mathbf y\) has infinitely many solutions.`,
        String.raw`np.linalg.solve raises an error or returns huge numbers. np.linalg.pinv returns the solution of smallest length. Better: drop the redundant column.`,
        String.raw`With \(x^2\) the third column is not a combination of the others. Only the corner entry changes, \(\sum x^4 = 98\) instead of \(\sum(3x - 1)^2 = 94\), and \(\det X^\top X = 80\): rank 3 and a unique solution.`],
      ans: String.raw`Rank 2, \(X^\top X\) is singular (use pinv or drop the column). With \(x^2\): rank 3 and \(\det X^\top X = 80\).` }
  ],
  ctl(k, st) {
    if (k === 0) return btns(PRODS.map((p, i) => [i, p[0]]), "e1pr");
    if (k === 1 || k === 2) return slb("e1m0", "M row 1, col 1", -2, 6, 0.5, st.m[0]) + slb("e1m1", "M row 1, col 2", -2, 6, 0.5, st.m[1]) + slb("e1m2", "M row 2, col 1", -2, 6, 0.5, st.m[2]) + slb("e1m3", "M row 2, col 2", -2, 6, 0.5, st.m[3]) + `<div class="row"><button id="e1mr">Reset to the problem's M</button></div>`;
    if (k === 3) return slb("e1an", "direction of u, degrees", 0, 180, 1, st.ang);
    return btns([[0, "third feature 3x − 1"], [1, "third feature x²"]], "e1th");
  },
  bind(k, st, redraw) {
    if (k === 0) { const u = () => pick($("e1b1x"), "e1pr", st.prod); $("e1b1x").querySelectorAll("button[data-e1pr]").forEach(b => b.onclick = () => { st.prod = +b.dataset.e1pr; u(); redraw(); }); u(); }
    if (k === 1 || k === 2) {
      [0, 1, 2, 3].forEach(i => { const el = $("e1m" + i), sh = () => { $("e1m" + i + "v").textContent = f(st.m[i], 1); }; el.oninput = () => { st.m[i] = +el.value; sh(); redraw(); }; sh(); });
      $("e1mr").onclick = () => { st.m = [4, 2, 1, 3]; [0, 1, 2, 3].forEach(i => { $("e1m" + i).value = st.m[i]; $("e1m" + i + "v").textContent = f(st.m[i], 1); }); redraw(); };
    }
    if (k === 3) bindSl(st, [["e1an", "ang", 0]], redraw);
    if (k === 4) { const u = () => pick($("e1b1x"), "e1th", st.third); $("e1b1x").querySelectorAll("button[data-e1th]").forEach(b => b.onclick = () => { st.third = +b.dataset.e1th; u(); redraw(); }); u(); }
  },
  pic(k, st, shown) {
    let s = "";
    if (k === 0) {
      const [nm, A, B] = PRODS[st.prod], cs = 22, y0 = 40;
      const blk = (x, r, c, lab, col) => `<rect x="${x}" y="${y0}" width="${c * cs}" height="${r * cs}" rx="4" fill="var(--sunk)" stroke="${col}" stroke-width="1.6"/>` + tx(x + c * cs / 2, y0 + r * cs + 18, lab, "middle", "t") + tx(x + c * cs / 2, y0 - 8, `${r} by ${c}`, "middle");
      const names = { "X w": ["X", "w"], "Xᵀ X": ["Xᵀ", "X"], "Xᵀ y": ["Xᵀ", "y"], "X Xᵀ": ["X", "Xᵀ"] }[nm];
      let x = 40;
      s += blk(x, A[0], A[1], names[0], C.blue); x += A[1] * cs + 30; s += tx(x - 15, y0 + 50, "×", "middle", "th");
      s += blk(x, B[0], B[1], names[1], C.purple); x += B[1] * cs + 34; s += tx(x - 17, y0 + 50, "=", "middle", "th");
      s += blk(x, A[0], B[1], nm, C.teal);
      s += tx(470, 60, `inner sizes ${A[1]} and ${B[0]} agree`, null, "t") + tx(470, 84, `outer sizes give ${A[0]} by ${B[1]}`, null, "t");
      s += tx(470, 120, st.prod === 1 || st.prod === 2 ? "used by the normal equation" : st.prod === 0 ? "one prediction per row" : "one entry per pair of rows", null);
      return { h: 220, s };
    }
    if (k === 1 || k === 2) {
      const M = st.m, det = M[0] * M[3] - M[1] * M[2];
      const a = ML.axes(50, 14, 330, 290, { xmin: -3, xmax: 9, ymin: -3, ymax: 9, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "first coordinate", yl: "second coordinate" });
      const P = [[0, 0], [M[0], M[2]], [M[0] + M[1], M[2] + M[3]], [M[1], M[3]]];
      s += a.s + `<path d="M${a.X(0)} ${a.Y(0)}L${a.X(1)} ${a.Y(0)}L${a.X(1)} ${a.Y(1)}L${a.X(0)} ${a.Y(1)}Z" fill="var(--sunk)" stroke="${C.gray}" stroke-width="1.4"/>`;
      s += `<path d="M${P.map(p => a.X(p[0]) + " " + a.Y(p[1])).join("L")}Z" fill="${C.teal}" fill-opacity="0.18" stroke="${C.teal}" stroke-width="2"/>`;
      s += arrow(a.X(0), a.Y(0), a.X(M[0]), a.Y(M[2]), C.blue, 2) + arrow(a.X(0), a.Y(0), a.X(M[1]), a.Y(M[3]), C.purple, 2);
      if (k === 1 && Math.abs(det) > 1e-9) { const v = [(M[3] * 8 - M[1] * 7) / det, (-M[2] * 8 + M[0] * 7) / det]; s += dot(a.X(v[0]), a.Y(v[1]), 5, C.coral, true) + dot(a.X(8), a.Y(7), 5, C.coral) + tx(a.X(8) - 6, a.Y(7) - 9, "b = (8, 7)", "end"); s += tx(400, 150, `v = (${f(v[0], 2)}, ${f(v[1], 2)})`, null, "t") + tx(400, 172, "hollow coral: v, solid: Mv = b", null); }
      s += tx(400, 34, `det M = ${f(det, 2)}`, null, "th") + tx(400, 60, `blue: column 1 (${M[0]}, ${M[2]})`, null, "t") + tx(400, 82, `purple: column 2 (${M[1]}, ${M[3]})`, null, "t");
      s += tx(400, 110, Math.abs(det) < 1e-9 ? "columns parallel: no inverse" : `teal area ${f(Math.abs(det), 2)} = |det M|`, null, "t");
      if (Math.abs(det) > 1e-9) s += tx(400, 200, "inverse = (1/det) times", null) + tx(400, 222, `[[${M[3]}, ${-M[1]}], [${-M[2]}, ${M[0]}]]`, null, "t");
      if (det < -1e-9) s += tx(400, 250, "negative det: orientation flips", null);
      return { h: 350, s };
    }
    if (k === 3) {
      const S = [[5, 2], [2, 2]], th = st.ang * Math.PI / 180, u = [Math.cos(th), Math.sin(th)], Su = [5 * u[0] + 2 * u[1], 2 * u[0] + 2 * u[1]];
      const a = ML.axes(50, 14, 300, 300, { xmin: -7, xmax: 7, ymin: -7, ymax: 7, nx: 7, ny: 7, fx: v => v, fy: v => v });
      const circ = [], img = [];
      for (let i = 0; i <= 120; i++) { const t = 2 * Math.PI * i / 120, c = [Math.cos(t), Math.sin(t)]; circ.push([a.X(c[0]), a.Y(c[1])]); img.push([a.X(5 * c[0] + 2 * c[1]), a.Y(2 * c[0] + 2 * c[1])]); }
      s += a.s + ML.path(circ, C.gray, 1.4) + ML.path(img, C.teal, 1.8);
      const e1 = [2 / Math.sqrt(5), 1 / Math.sqrt(5)], e2 = [1 / Math.sqrt(5), -2 / Math.sqrt(5)];
      s += ln(a.X(-7 * e1[0]), a.Y(-7 * e1[1]), a.X(7 * e1[0]), a.Y(7 * e1[1]), C.coral, 1, "5 4") + ln(a.X(-3.2 * e2[0]), a.Y(-3.2 * e2[1]), a.X(3.2 * e2[0]), a.Y(3.2 * e2[1]), C.coral, 1, "5 4");
      s += arrow(a.X(0), a.Y(0), a.X(u[0]), a.Y(u[1]), C.blue, 2.2) + arrow(a.X(0), a.Y(0), a.X(Su[0]), a.Y(Su[1]), C.purple, 2.2);
      const cosang = (u[0] * Su[0] + u[1] * Su[1]) / Math.hypot(Su[0], Su[1]), angd = Math.acos(Math.min(1, Math.max(-1, cosang))) * 180 / Math.PI;
      s += tx(380, 34, "blue: unit vector u", null, "t") + tx(380, 56, "purple: S u", null, "t") + tx(380, 78, "teal: image of the unit circle", null, "t") + tx(380, 100, "dashed coral: eigen-directions", null, "t");
      s += tx(380, 140, `angle between u and Su ${f(angd, 1)}°`, null, "th") + tx(380, 164, `uᵀ S u = ${f(u[0] * Su[0] + u[1] * Su[1], 3)}`, null, "t") + tx(380, 186, `length of Su = ${f(Math.hypot(Su[0], Su[1]), 3)}`, null, "t");
      s += tx(380, 222, "Su is parallel to u only along", null) + tx(380, 242, "(2, 1) at 26.6° (stretch 6)", null) + tx(380, 262, "and (1, −2) at 116.6° (stretch 1)", null);
      return { h: 350, s };
    }
    const third = st.third, x = [0, 1, 2, 3], col3 = x.map(v => third ? v * v : 3 * v - 1);
    const X = x.map((v, i) => [1, v, col3[i]]);
    const G = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; X.forEach(r => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) G[i][j] += r[i] * r[j]; });
    const det = G[0][0] * (G[1][1] * G[2][2] - G[1][2] * G[2][1]) - G[0][1] * (G[1][0] * G[2][2] - G[1][2] * G[2][0]) + G[0][2] * (G[1][0] * G[2][1] - G[1][1] * G[2][0]);
    const g1 = ML.grid(X, { x: 70, y: 40, cell: 40, title: "X", colLab: ["1", "x", third ? "x²" : "3x − 1"], hl2: new Set([0, 1, 2, 3].map(i => i + ",2")) });
    const g2 = ML.grid(G, { x: 300, y: 40, cell: 44, title: "XᵀX", colLab: false, rowLab: false, hl2: new Set(["2,2"]), dec: 0 });
    s += g1.s + g2.s;
    s += tx(450 + 20, 60, `det XᵀX = ${f(Math.abs(det) < 1e-9 ? 0 : det, 0)}`, null, "th") + tx(470, 86, `rank of X = ${third ? 3 : 2}`, null, "t");
    s += tx(470, 120, third ? "x² is not a mix of 1 and x" : "col 3 = 3 · col 2 − col 1", null, "t") + tx(470, 144, third ? "unique least squares fit" : "infinitely many fits: use pinv", null);
    s += tx(70, 250, "coral cells: the third column and the one entry of XᵀX that differs between the two choices", null);
    return { h: 270, s };
  }
};

/* ====================================================================
   B2. Gradients
   ==================================================================== */
const fB2 = (w1, w2) => (2 * w1 - w2 + 1) ** 2 + w2 * w2;
const gB2 = (w1, w2) => { const u = 2 * w1 - w2 + 1; return [4 * u, -2 * u + 2 * w2]; };
const D3X = [1, 2, 4], D3Y = [2, 3, 6];
const B2 = {
  key: "B2",
  st: () => ({ w1: 1, w2: 2, w: 2, t0: 0, t1: 1, le: -2 }),
  parts: [
    { t: "A gradient by hand", pts: 2, q: String.raw`\(f(w_1, w_2) = (2w_1 - w_2 + 1)^2 + w_2^2\). Find \(\nabla f\) and evaluate it at (1, 2). Which way does one gradient descent step move, and where is the minimum?`,
      a: [String.raw`Let \(u = 2w_1 - w_2 + 1\). Chain rule: \(\partial f/\partial w_1 = 2u\cdot 2 = 4u\) and \(\partial f/\partial w_2 = 2u\cdot(-1) + 2w_2\).`,
        String.raw`At (1, 2): \(u = 2 - 2 + 1 = 1\), so \(\nabla f = (4,\ -2 + 4) = (4, 2)\) and \(f = 1 + 4 = 5\).`,
        String.raw`A descent step moves along \(-\nabla f = (-4, -2)\): both weights go down.`,
        String.raw`The minimum has both partials zero: \(w_2 = u\) from the second, \(u = 0\) from the first, so \(w_2 = 0\) and \(w_1 = -0.5\), with \(f = 0\).`],
      ans: String.raw`\(\nabla f = (4u,\ -2u + 2w_2)\) with \(u = 2w_1 - w_2 + 1\). At (1, 2) it is (4, 2) and \(f = 5\). Minimum at (−0.5, 0).` },
    { t: "Chain rule on one example", pts: 2, q: String.raw`One example x = 3, y = 4, and the loss \(\ell(w, b) = \frac12(wx + b - y)^2\). Find \(\partial\ell/\partial w\) and \(\partial\ell/\partial b\) at w = 2, b = −1.`,
      a: [String.raw`Name the error \(e = wx + b - y = 6 - 1 - 4 = 1\). Then \(\ell = \frac12 e^2 = 0.5\).`,
        String.raw`\(\partial\ell/\partial e = e\), \(\partial e/\partial w = x\) and \(\partial e/\partial b = 1\), so \(\partial\ell/\partial w = e\,x = 3\) and \(\partial\ell/\partial b = e = 1\).`,
        String.raw`The \(\frac12\) is there to cancel the 2 from the square. Without it both partials double, to 6 and 2.`],
      ans: String.raw`\(\partial\ell/\partial w = 3\) and \(\partial\ell/\partial b = 1\).` },
    { t: "The gradient of Ng's cost", pts: 2, q: String.raw`Points (1, 2), (2, 3), (4, 6), \(h_\theta(x) = \theta_0 + \theta_1 x\) and \(J = \frac{1}{2m}\sum_i(h_\theta(x_i) - y_i)^2\). Write \(\nabla J\) in matrix form and evaluate it at \(\boldsymbol\theta = (0, 1)\).`,
      a: [String.raw`One term at a time: \(\partial J/\partial\theta_j = \frac1m\sum_i\left(h_\theta(x_i) - y_i\right)x_{ij}\) with \(x_{i0} = 1\). Stacked: \(\nabla J = \frac1m X^\top(X\boldsymbol\theta - \mathbf y)\).`,
        String.raw`At (0, 1) the predictions are 1, 2, 4 and the errors \(h - y\) are −1, −1, −2.`,
        String.raw`\(\partial J/\partial\theta_0 = (-1 - 1 - 2)/3 = -1.3333\) and \(\partial J/\partial\theta_1 = (-1 - 2 - 8)/3 = -3.6667\).`,
        String.raw`Both are negative, so a descent step raises both parameters: the line sits below every point.`],
      ans: String.raw`\(\nabla J = \frac1m X^\top(X\boldsymbol\theta - \mathbf y) = (-1.3333, -3.6667)\).` },
    { t: "Check it numerically", pts: 2, q: String.raw`Check \(\partial f/\partial w_1 = 4\) from part (a) at (1, 2) with a forward difference and with a central difference, \(\varepsilon = 0.01\). Which is closer, and why?`,
      a: [String.raw`\(f(1.01, 2) = 1.02^2 + 4 = 5.0404\) and \(f(0.99, 2) = 0.98^2 + 4 = 4.9604\).`,
        String.raw`Forward: \((5.0404 - 5)/0.01 = 4.04\), off by 0.04. Central: \((5.0404 - 4.9604)/0.02 = 4.0000\).`,
        String.raw`The forward error is of order \(\varepsilon\) (here exactly \(4\varepsilon\)), the central error of order \(\varepsilon^2\), which is zero for a quadratic. Far smaller steps bring rounding error back, so use \(\varepsilon\) near \(10^{-5}\) in float64.`],
      ans: String.raw`Forward 4.04, central 4.0000. The central difference is closer because its error shrinks like \(\varepsilon^2\).` }
  ],
  ctl(k, st) {
    if (k === 0) return slb("e1w1", "w₁", -2, 2, 0.1, st.w1) + slb("e1w2", "w₂", -1, 3, 0.1, st.w2);
    if (k === 1) return slb("e1ww", "w", 0, 3.4, 0.1, st.w);
    if (k === 2) return slb("e1t0", "θ₀", -1, 2, 0.1, st.t0) + slb("e1t1", "θ₁", 0, 2, 0.05, st.t1);
    return slb("e1le", "log₁₀ ε", -12, -1, 0.5, st.le);
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e1w1", "w1", 1], ["e1w2", "w2", 1]], redraw);
    if (k === 1) bindSl(st, [["e1ww", "w", 1]], redraw);
    if (k === 2) bindSl(st, [["e1t0", "t0", 1], ["e1t1", "t1", 2]], redraw);
    if (k === 3) bindSl(st, [["e1le", "le", 1]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const a = ML.axes(50, 14, 300, 300, { xmin: -2, xmax: 2, ymin: -1, ymax: 3, nx: 4, ny: 4, fx: v => v, fy: v => v, xl: "w₁", yl: "w₂" });
      s += clip("e1cpb2", 50, 14, 300, 300) + a.s + `<g clip-path="url(#e1cpb2)">`;
      [0.25, 1, 2.5, 5, 9, 16, 25].forEach(lv => { s += ellipse(a, [-0.5, 0], [[4, -2], [-2, 2]], lv, lv === 5 ? C.blue : C.gray, lv === 5 ? 1.6 : 1); });
      const g = gB2(st.w1, st.w2), sc = 0.12;
      s += arrow(a.X(st.w1), a.Y(st.w2), a.X(st.w1 - sc * g[0]), a.Y(st.w2 - sc * g[1]), C.coral, 2.2) + `</g>`;
      s += dot(a.X(st.w1), a.Y(st.w2), 5, C.coral) + dot(a.X(-0.5), a.Y(0), 4, C.teal);
      s += tx(380, 34, `f(${f(st.w1, 1)}, ${f(st.w2, 1)}) = ${f(fB2(st.w1, st.w2), 3)}`, null, "th") + tx(380, 60, `u = 2w₁ − w₂ + 1 = ${f(2 * st.w1 - st.w2 + 1, 2)}`, null, "t");
      s += tx(380, 84, `∇f = (${f(g[0], 2)}, ${f(g[1], 2)})`, null, "t") + tx(380, 120, "coral arrow: −0.12 ∇f, one step", null) + tx(380, 140, "teal dot: the minimum (−0.5, 0)", null) + tx(380, 160, "blue contour: f = 5", null);
      s += tx(380, 196, "the arrow crosses each contour", null) + tx(380, 214, "at a right angle", null);
      return { h: 360, s };
    }
    if (k === 1) {
      const L = w => 0.5 * (3 * w - 5) ** 2;
      const a = ML.axes(60, 14, 330, 280, { xmin: 0, xmax: 3.4, ymin: 0, ymax: 13, nx: 4, ny: 4, fx: v => f(v, 1), fy: v => f(v, 0), xl: "w (with b = −1)", yl: "ℓ" });
      const pts = []; for (let i = 0; i <= 100; i++) { const w = 3.4 * i / 100; pts.push([a.X(w), a.Y(L(w))]); }
      const w = st.w, e = 3 * w - 5, sl_ = 3 * e;
      s += clip("e1cpb2b", 60, 14, 330, 280) + a.s + `<g clip-path="url(#e1cpb2b)">` + ML.path(pts, C.blue, 2) + ML.path([[a.X(w - 0.6), a.Y(L(w) - 0.6 * sl_)], [a.X(w + 0.6), a.Y(L(w) + 0.6 * sl_)]], C.coral, 2, "6 4") + `</g>` + dot(a.X(w), a.Y(L(w)), 5, C.coral);
      s += tx(420, 34, `e = 3w − 1 − 4 = ${f(e, 2)}`, null, "th") + tx(420, 60, `ℓ = ½ e² = ${f(L(w), 3)}`, null, "t") + tx(420, 84, `∂ℓ/∂w = e·x = ${f(sl_, 2)}`, null, "t") + tx(420, 108, `∂ℓ/∂b = e = ${f(e, 2)}`, null, "t");
      s += tx(420, 144, "coral dashes: the tangent,", null) + tx(420, 162, "slope ∂ℓ/∂w", null) + tx(420, 196, `minimum at w = 5/3 = ${f(5 / 3, 3)}`, null);
      return { h: 340, s };
    }
    if (k === 2) {
      const a = ML.axes(60, 14, 300, 260, { xmin: 0, xmax: 5, ymin: 0, ymax: 8, nx: 5, ny: 4, fx: v => v, fy: v => v, xl: "x", yl: "y" });
      s += a.s;
      const h = x => st.t0 + st.t1 * x, err = D3X.map((x, i) => h(x) - D3Y[i]);
      s += ML.path([[a.X(0), a.Y(Math.max(0, Math.min(8, h(0))))], [a.X(5), a.Y(Math.max(0, Math.min(8, h(5))))]], C.coral, 2);
      D3X.forEach((x, i) => { s += ln(a.X(x), a.Y(D3Y[i]), a.X(x), a.Y(Math.max(0, Math.min(8, h(x)))), C.purple, 2) + dot(a.X(x), a.Y(D3Y[i]), 4.5, "var(--p)"); });
      const g0 = err.reduce((p, e) => p + e, 0) / 3, g1 = err.reduce((p, e, i) => p + e * D3X[i], 0) / 3, J = err.reduce((p, e) => p + e * e, 0) / 6;
      s += tx(400, 34, `errors h − y: ${err.map(e => f(e, 2)).join(", ")}`, null, "t") + tx(400, 60, `J = ${f(J, 4)}`, null, "th");
      s += tx(400, 90, `∂J/∂θ₀ = ${f(g0, 4)}`, null, "t") + tx(400, 112, `∂J/∂θ₁ = ${f(g1, 4)}`, null, "t") + tx(400, 148, "purple: the errors", null) + tx(400, 166, "∂J/∂θ₁ weights each error by its x", null);
      return { h: 320, s };
    }
    const fx = (a, b) => (2 * a - b + 1) ** 2 + b * b, eps = Math.pow(10, st.le);
    const errs = []; for (let le = -12; le <= -1.0001; le += 0.25) { const e = Math.pow(10, le), fw = (fx(1 + e, 2) - fx(1, 2)) / e, ce = (fx(1 + e, 2) - fx(1 - e, 2)) / (2 * e); errs.push([le, Math.abs(fw - 4), Math.abs(ce - 4)]); }
    const a = ML.axes(60, 14, 330, 280, { xmin: -12, xmax: -1, ymin: -16, ymax: 0, nx: 11, ny: 8, fx: v => v, fy: v => v, xl: "log₁₀ ε", yl: "log₁₀ |error|" });
    const lg = v => Math.log10(Math.max(v, 1e-16));
    s += a.s + ML.path(errs.map(e => [a.X(e[0]), a.Y(lg(e[1]))]), C.coral, 2) + ML.path(errs.map(e => [a.X(e[0]), a.Y(lg(e[2]))]), C.teal, 2);
    const fw = (fx(1 + eps, 2) - fx(1, 2)) / eps, ce = (fx(1 + eps, 2) - fx(1 - eps, 2)) / (2 * eps);
    s += ln(a.X(st.le), 14, a.X(st.le), 294, C.blue, 1.4, "4 4");
    s += tx(420, 34, `ε = 1e${st.le}`, null, "th") + tx(420, 60, `forward ${fw.toPrecision(10)}`, null, "t") + tx(420, 82, `central ${ce.toPrecision(10)}`, null, "t");
    s += tx(420, 118, "coral: forward error, slope 1", null) + tx(420, 138, "teal: central error, at rounding", null) + tx(420, 158, "level for every ε (f is quadratic)", null) + tx(420, 194, "both rise for tiny ε, where", null) + tx(420, 212, "f(1 + ε) − f(1) loses its digits", null);
    return { h: 340, s };
  }
};

/* ====================================================================
   B3. Linear regression by hand
   ==================================================================== */
const RX = [1, 2, 4, 5], RY = [1, 3, 4, 6], RT = [0.2, 1.1];
const B3 = {
  key: "B3",
  st: () => ({ t0: 0.2, t1: 1.1 }),
  parts: [
    { t: "Design matrix", pts: 2, q: String.raw`Four readings: x = 1, 2, 4, 5 and y = 1, 3, 4, 6. Write \(X\) for \(h_\theta(x) = \theta_0 + \theta_1 x\), then \(X^\top X\) and \(X^\top\mathbf y\).`,
      a: [String.raw`Each row of \(X\) is \((1, x_i)\): rows (1, 1), (1, 2), (1, 4), (1, 5). The ones column carries the intercept.`,
        String.raw`\(\sum x = 12\), \(\sum x^2 = 1 + 4 + 16 + 25 = 46\), \(\sum y = 14\), \(\sum xy = 1 + 6 + 16 + 30 = 53\).`,
        String.raw`\(X^\top X = \begin{bmatrix} m & \sum x \\ \sum x & \sum x^2\end{bmatrix} = \begin{bmatrix} 4 & 12 \\ 12 & 46\end{bmatrix}\) and \(X^\top\mathbf y = (14, 53)\).`],
      ans: String.raw`\(X^\top X = \begin{bmatrix} 4 & 12 \\ 12 & 46\end{bmatrix}\), \(X^\top\mathbf y = (14, 53)\).` },
    { t: "Normal equation", pts: 3, q: String.raw`Solve \(X^\top X\,\boldsymbol\theta = X^\top\mathbf y\) by hand.`,
      a: [String.raw`\(\det X^\top X = 4\cdot 46 - 12\cdot 12 = 184 - 144 = 40\).`,
        String.raw`\(\theta_0 = (46\cdot 14 - 12\cdot 53)/40 = (644 - 636)/40 = 0.2\).`,
        String.raw`\(\theta_1 = (-12\cdot 14 + 4\cdot 53)/40 = (-168 + 212)/40 = 1.1\).`,
        String.raw`Check the first equation: \(4(0.2) + 12(1.1) = 14\). So \(h(x) = 0.2 + 1.1x\).`],
      ans: String.raw`\(\boldsymbol\theta = (0.2, 1.1)\).` },
    { t: "Residuals and cost", pts: 3, q: String.raw`Compute the residuals \(e_i = h_\theta(x_i) - y_i\), check them two ways, and compute Ng's cost \(J\).`,
      a: [String.raw`Predictions 1.3, 2.4, 4.6, 5.7, residuals 0.3, −0.6, 0.6, −0.3.`,
        String.raw`Least squares makes \(X^\top\mathbf e = \mathbf 0\). Row 1 says \(\sum e_i = 0\). Row 2 says \(\sum x_i e_i = 0.3 - 1.2 + 2.4 - 1.5 = 0\). Both hold.`,
        String.raw`SSE = 0.09 + 0.36 + 0.36 + 0.09 = 0.9, so \(J = \frac{0.9}{2\cdot 4} = 0.1125\).`],
      ans: String.raw`\(\mathbf e = (0.3, -0.6, 0.6, -0.3)\), SSE 0.9, \(J = 0.1125\).` },
    { t: "Fit quality", pts: 2, q: String.raw`Compute \(R^2\) against the mean baseline, the MAE and the RMSE.`,
      a: [String.raw`\(\bar y = 3.5\) and SST = 6.25 + 0.25 + 0.25 + 6.25 = 13, so \(R^2 = 1 - 0.9/13 = 0.931\).`,
        String.raw`MAE = (0.3 + 0.6 + 0.6 + 0.3)/4 = 0.45 and RMSE = \(\sqrt{0.9/4} = 0.474\). The RMSE is never below the MAE.`],
      ans: String.raw`\(R^2 = 0.931\), MAE 0.45, RMSE 0.474.` },
    { t: "Predict", pts: 2, q: String.raw`Predict at x = 3 and at x = 10. Which prediction would you trust, and why?`,
      a: [String.raw`\(h(3) = 0.2 + 3.3 = 3.5\) and \(h(10) = 0.2 + 11 = 11.2\).`,
        String.raw`x = 3 lies inside the training range 1 to 5 (interpolation). x = 10 is twice the largest training input (extrapolation), where nothing in the data says the line still holds. Trust the first and flag the second.`],
      ans: String.raw`3.5 (inside the data, trusted) and 11.2 (extrapolated, flagged).` },
    { t: "The geometry", pts: 2, q: String.raw`Show that \(\mathrm{SST} = \mathrm{SSR} + \mathrm{SSE}\) here, with \(\mathrm{SSR} = \sum_i(\hat y_i - \bar y)^2\). Why does it hold?`,
      a: [String.raw`\(\hat y_i - \bar y\) = −2.2, −1.1, 1.1, 2.2, so SSR = 4.84 + 1.21 + 1.21 + 4.84 = 12.1, and 12.1 + 0.9 = 13 = SST.`,
        String.raw`\(\hat{\mathbf y}\) is the projection of \(\mathbf y\) onto the column space of \(X\), and the residual is perpendicular to every column (part c). With a ones column, \(\hat{\mathbf y} - \bar y\mathbf 1\) lies in that space, so Pythagoras splits SST exactly.`,
        String.raw`So \(R^2 = \mathrm{SSR}/\mathrm{SST} = 12.1/13 = 0.931\), the same number as in part (d).`],
      ans: String.raw`12.1 + 0.9 = 13. The residual is perpendicular to the fitted part.` }
  ],
  ctl(k, st) { return k === 1 || k === 2 || k === 3 ? slb("e1r0", "θ₀", -1, 2, 0.05, st.t0) + slb("e1r1", "θ₁", 0, 2, 0.05, st.t1) + `<div class="row"><button id="e1rl">Least squares (0.2, 1.1)</button></div>` : ""; },
  bind(k, st, redraw) {
    if (k === 1 || k === 2 || k === 3) {
      bindSl(st, [["e1r0", "t0", 2], ["e1r1", "t1", 2]], redraw);
      $("e1rl").onclick = () => { st.t0 = 0.2; st.t1 = 1.1; $("e1r0").value = 0.2; $("e1r1").value = 1.1; $("e1r0v").textContent = "0.20"; $("e1r1v").textContent = "1.10"; redraw(); };
    }
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const X = RX.map(x => [1, x]);
      s += ML.grid(X, { x: 70, y: 40, cell: 40, title: "X", colLab: ["1", "x"], hl: new Set(["0,0", "1,0", "2,0", "3,0"]) }).s;
      s += ML.grid(RY.map(v => [v]), { x: 190, y: 40, cell: 40, title: "y", colLab: false, rowLab: false }).s;
      s += ML.grid([[4, 12], [12, 46]], { x: 320, y: 40, cell: 44, title: "XᵀX", colLab: false, rowLab: false, dec: 0 }).s;
      s += ML.grid([[14], [53]], { x: 450, y: 40, cell: 44, title: "Xᵀy", colLab: false, rowLab: false, dec: 0 }).s;
      s += tx(320, 160, "XᵀX[0][0] = m = 4, XᵀX[0][1] = Σx = 12", null) + tx(320, 180, "XᵀX[1][1] = Σx² = 46", null) + tx(320, 200, "Xᵀy = (Σy, Σxy) = (14, 53)", null) + tx(70, 230, "teal: the ones column", null);
      return { h: 250, s };
    }
    const wide = k === 4, a = ML.axes(60, 14, 330, 270, { xmin: 0, xmax: wide ? 11 : 6, ymin: 0, ymax: wide ? 12 : 7, nx: wide ? 11 : 6, ny: wide ? 6 : 7, fx: v => v, fy: v => v, xl: "x", yl: "y" });
    const th = k === 1 || k === 2 || k === 3 ? [st.t0, st.t1] : RT, h = x => th[0] + th[1] * x, xm = wide ? 11 : 6, ym = wide ? 12 : 7;
    s += clip("e1cpb3", 60, 14, 330, 270) + a.s + `<g clip-path="url(#e1cpb3)">`;
    if (wide) s += `<rect x="${a.X(1)}" y="14" width="${a.X(5) - a.X(1)}" height="270" fill="${C.teal}" fill-opacity="0.08"/>`;
    s += ML.path([[a.X(0), a.Y(h(0))], [a.X(xm), a.Y(h(xm))]], C.coral, 2.2);
    const e = RX.map((x, i) => h(x) - RY[i]), ybar = 3.5;
    if (k === 5) { s += ln(a.X(0), a.Y(ybar), a.X(xm), a.Y(ybar), C.gray, 1.2, "5 4"); RX.forEach((x, i) => { s += ln(a.X(x) - 3, a.Y(ybar), a.X(x) - 3, a.Y(h(x)), C.blue, 2.4) + ln(a.X(x) + 3, a.Y(h(x)), a.X(x) + 3, a.Y(RY[i]), C.purple, 2.4); }); }
    else if (!wide) RX.forEach((x, i) => { s += ln(a.X(x), a.Y(RY[i]), a.X(x), a.Y(h(x)), C.purple, 2.2); });
    s += `</g>`;
    RX.forEach((x, i) => { s += dot(a.X(x), a.Y(RY[i]), 4.5, "var(--p)"); });
    const SSE = e.reduce((p, v) => p + v * v, 0);
    if (wide) { s += dot(a.X(3), a.Y(3.5), 5, C.teal) + dot(a.X(10), a.Y(11.2), 5, C.coral, true) + tx(420, 34, "teal band: the training range 1 to 5", null, "t") + tx(420, 58, "teal dot: h(3) = 3.5, interpolation", null, "t") + tx(420, 82, "hollow: h(10) = 11.2, extrapolation", null, "t"); return { h: 330, s }; }
    if (k === 5) {
      const SSR = RX.reduce((p, x) => p + (h(x) - ybar) ** 2, 0), bx = 430, by = 290, sc = 13;
      [["SST", 13, C.gray], ["SSR", SSR, C.blue], ["SSE", SSE, C.purple]].forEach(([n, v, c], i) => { s += `<rect x="${bx + i * 70}" y="${by - v * sc}" width="44" height="${v * sc}" rx="4" fill="${c}" opacity="0.8"/>` + tx(bx + i * 70 + 22, by + 18, n, "middle") + tx(bx + i * 70 + 22, by - v * sc - 6, f(v, 2), "middle", "t"); });
      s += tx(420, 34, "dashed grey: the mean 3.5", null, "t") + tx(420, 56, "blue: fitted minus mean", null, "t") + tx(420, 78, "purple: residuals", null, "t");
      return { h: 330, s };
    }
    s += tx(420, 34, `θ = (${f(th[0], 2)}, ${f(th[1], 2)})`, null, "th") + tx(420, 60, `residuals ${e.map(v => f(v, 2)).join(", ")}`, null, "t");
    s += tx(420, 84, `Σe = ${f(e.reduce((p, v) => p + v, 0), 3)}, Σxe = ${f(e.reduce((p, v, i) => p + v * RX[i], 0), 3)}`, null, "t");
    s += tx(420, 108, `SSE = ${f(SSE, 4)}, J = ${f(SSE / 8, 4)}`, null, "t") + tx(420, 132, `R² = ${f(1 - SSE / 13, 4)}`, null, "t");
    s += tx(420, 156, `MAE = ${f(e.reduce((p, v) => p + Math.abs(v), 0) / 4, 3)}, RMSE = ${f(Math.sqrt(SSE / 4), 3)}`, null, "t");
    s += tx(420, 194, "move the sliders: J is smallest and", null) + tx(420, 212, "both sums are 0 only at (0.2, 1.1)", null);
    return { h: 330, s };
  }
};

/* ====================================================================
   B4. Gradient descent
   ==================================================================== */
const HG = [[1, 3], [3, 11.5]];
const Jr = th => { let s = 0; RX.forEach((x, i) => { const e = th[0] + th[1] * x - RY[i]; s += e * e; }); return s / 8; };
const gr = th => { let g0 = 0, g1 = 0; RX.forEach((x, i) => { const e = th[0] + th[1] * x - RY[i]; g0 += e; g1 += e * x; }); return [g0 / 4, g1 / 4]; };
const gdPath = (al, n) => { const P = [[0, 0]]; let th = [0, 0]; for (let i = 0; i < n; i++) { const g = gr(th); th = [th[0] - al * g[0], th[1] - al * g[1]]; P.push(th); if (Math.abs(th[0]) > 1e6) break; } return P; };
const B4 = {
  key: "B4",
  st: () => ({ al: 0.05, n: 2 }),
  parts: [
    { t: "One step from zero", pts: 3, q: String.raw`Same four readings and Ng's \(J\). Start at \(\boldsymbol\theta = (0, 0)\) with \(\alpha = 0.05\). Take one batch gradient descent step and compute \(J\) before and after.`,
      a: [String.raw`At zero every prediction is 0, so the errors \(h - y\) are −1, −3, −4, −6 and \(J = (1 + 9 + 16 + 36)/8 = 7.75\).`,
        String.raw`\(\nabla J = \frac1m X^\top(X\boldsymbol\theta - \mathbf y) = \frac14(-14, -53) = (-3.5, -13.25)\).`,
        String.raw`\(\boldsymbol\theta := (0, 0) - 0.05\,(-3.5, -13.25) = (0.175, 0.6625)\).`,
        String.raw`New predictions 0.8375, 1.5, 2.825, 3.4875, and \(J = 1.2462\). One step cut the cost by a factor of about 6.`],
      ans: String.raw`\(\boldsymbol\theta = (0.175, 0.6625)\), \(J\) from 7.75 to 1.2462.` },
    { t: "Second step", pts: 2, q: String.raw`Take the second step.`,
      a: [String.raw`Errors: 0.8375 − 1, 1.5 − 3, 2.825 − 4, 3.4875 − 6, that is −0.1625, −1.5, −1.175, −2.5125.`,
        String.raw`\(\nabla J = \frac14\left(\sum e,\ \sum xe\right) = \frac14(-5.35, -20.425) = (-1.3375, -5.1063)\).`,
        String.raw`\(\boldsymbol\theta = (0.175 + 0.0669,\ 0.6625 + 0.2553) = (0.2419, 0.9178)\), with \(J = 0.2813\).`],
      ans: String.raw`\(\boldsymbol\theta = (0.2419, 0.9178)\) and \(J = 0.2813\).` },
    { t: "How large can α be?", pts: 3, q: String.raw`The curvature of \(J\) is \(H = \frac1m X^\top X\). Find its eigenvalues, the largest stable \(\alpha\), and how fast the slow direction shrinks at \(\alpha = 0.05\).`,
      a: [String.raw`\(H = \frac14\begin{bmatrix} 4 & 12 \\ 12 & 46\end{bmatrix} = \begin{bmatrix} 1 & 3 \\ 3 & 11.5\end{bmatrix}\), trace 12.5, determinant 2.5.`,
        String.raw`\(\lambda = 6.25 \pm \sqrt{6.25^2 - 2.5} = 6.25 \pm 6.0467\), so 12.297 and 0.2033.`,
        String.raw`Along each eigen-direction the error is multiplied by \(1 - \alpha\lambda\) per step, so the run converges only for \(\alpha \lt 2/\lambda_{\max} = 0.163\).`,
        String.raw`At \(\alpha = 0.05\) the factors are 0.385 (fast) and 0.990 (slow). Shrinking the slow error by 100 takes \(\ln 0.01/\ln 0.98983 \approx 451\) steps. Standardizing x would bring the eigenvalues together.`],
      ans: String.raw`\(\lambda = 12.297\) and 0.2033, stable for \(\alpha \lt 0.163\), slow factor 0.990, about 451 steps per factor 100.` },
    { t: "Stochastic and mini-batch", pts: 2, q: String.raw`One SGD step uses only the third reading, (4, 4), with loss \(\frac12 e^2\), from (0, 0) at \(\alpha = 0.05\). Where does it go? With 1,000 examples and batches of 64, how many updates do 10 epochs make?`,
      a: [String.raw`\(e = 0 - 4 = -4\), so the gradient is \((e, e\,x) = (-4, -16)\) and \(\boldsymbol\theta = (0.2, 0.8)\).`,
        String.raw`The batch step went to (0.175, 0.6625). One example points roughly the same way but not exactly: that noise is the price of a cheap step.`,
        String.raw`1,000/64 = 15.6, so 16 batches per epoch, the last with 40 examples, and 160 updates in 10 epochs (150 with drop_last=True).`],
      ans: String.raw`(0.2, 0.8). 160 updates, or 150 with drop_last.` }
  ],
  ctl(k, st) { return slb("e1al", "α", 0.01, 0.17, 0.005, st.al) + slb("e1ns", "steps", 1, 60, 1, st.n); },
  bind(k, st, redraw) { bindSl(st, [["e1al", "al", 3], ["e1ns", "n", 0]], redraw); },
  pic(k, st) {
    let s = "";
    const a = ML.axes(60, 14, 320, 300, { xmin: -1, xmax: 1.5, ymin: -0.2, ymax: 1.6, nx: 5, ny: 6, fx: v => f(v, 1), fy: v => f(v, 1), xl: "θ₀", yl: "θ₁" });
    s += clip("e1cpb4", 60, 14, 320, 300) + a.s + `<g clip-path="url(#e1cpb4)">`;
    [0.15, 0.3, 0.75, 1.5, 3, 5.5, 7.75].forEach(J => { s += ellipse(a, RT, HG, 2 * (J - 0.1125), J === 7.75 ? C.blue : C.gray, J === 7.75 ? 1.5 : 1); });
    const E = eig2(HG);
    s += ln(a.X(RT[0] - 2 * E.e2[0]), a.Y(RT[1] - 2 * E.e2[1]), a.X(RT[0] + 2 * E.e2[0]), a.Y(RT[1] + 2 * E.e2[1]), C.teal, 1, "4 4");
    const P = gdPath(st.al, st.n);
    s += ML.path(P.map(p => [a.X(p[0]), a.Y(p[1])]), C.coral, 1.8) + P.map(p => dot(a.X(p[0]), a.Y(p[1]), 3, C.coral)).join("");
    if (k === 3) s += arrow(a.X(0), a.Y(0), a.X(0.2), a.Y(0.8), C.purple, 2.2) + arrow(a.X(0), a.Y(0), a.X(0.175), a.Y(0.6625), C.blue, 2.2);
    s += `</g>` + dot(a.X(RT[0]), a.Y(RT[1]), 4, C.teal);
    const last = P[P.length - 1], div = st.al > 2 / E.l1;
    s += tx(410, 34, `α = ${f(st.al, 3)}, ${st.n} step${st.n > 1 ? "s" : ""}`, null, "th");
    s += tx(410, 58, `θ = (${Math.abs(last[0]) < 1e5 ? f(last[0], 4) : "huge"}, ${Math.abs(last[1]) < 1e5 ? f(last[1], 4) : "huge"})`, null, "t") + tx(410, 80, `J = ${Math.abs(last[0]) < 1e5 ? f(Jr(last), 4) : "diverged"}`, null, "t");
    s += tx(410, 112, `factors 1 − αλ: ${f(1 - st.al * E.l1, 3)} and ${f(1 - st.al * E.l2, 4)}`, null, "t") + tx(410, 134, `limit 2/λmax = ${f(2 / E.l1, 4)}`, null, "t");
    s += tx(410, 166, div ? "above the limit: the path zigzags out" : "below the limit: it converges", null, "t");
    s += tx(410, 198, "dashed teal: the slow direction", null) + tx(410, 216, "blue contour: J = 7.75, the start", null) + tx(410, 234, "teal dot: least squares (0.2, 1.1)", null);
    if (k === 3) s += tx(410, 262, "purple: one SGD step on (4, 4)", null) + tx(410, 280, "blue arrow: the batch step", null);
    return { h: 360, s };
  }
};

/* ====================================================================
   B5. Feature scaling
   ==================================================================== */
const HS = [60, 60, 100, 100], HR = [1, 3, 1, 3];
const B5 = {
  key: "B5",
  st: () => ({ size: 90, rooms: 4, r: 0.5 }),
  parts: [
    { t: "Standardize", pts: 2, q: String.raw`Training houses: sizes 60, 60, 100, 100 m² and rooms 1, 3, 1, 3. Standardize both features with the training mean and the population standard deviation.`,
      a: [String.raw`Size: mean 80, deviations −20, −20, 20, 20, variance 400, \(\sigma = 20\), so \(z_1 = -1, -1, 1, 1\).`,
        String.raw`Rooms: mean 2, deviations −1, 1, −1, 1, variance 1, \(\sigma = 1\), so \(z_2 = -1, 1, -1, 1\).`,
        String.raw`Both columns now have mean 0 and standard deviation 1. Keep \(\mu = (80, 2)\) and \(\sigma = (20, 1)\): they are part of the model.`],
      ans: String.raw`\(z_1 = (-1, -1, 1, 1)\), \(z_2 = (-1, 1, -1, 1)\), with \(\mu = (80, 2)\) and \(\sigma = (20, 1)\).` },
    { t: "A new house", pts: 2, q: String.raw`A new house has 90 m² and 4 rooms. Standardize it. Why must you not recompute the mean and standard deviation with the new house included, or from the test set?`,
      a: [String.raw`\(z_1 = (90 - 80)/20 = 0.5\) and \(z_2 = (4 - 2)/1 = 2\).`,
        String.raw`The scaler is part of the model. Its numbers come from the training rows only and are frozen like the weights. Statistics from test rows leak test information into the model and make the test score optimistic.`,
        String.raw`Recomputing with each new house would also change what a z value means from one prediction to the next, so the same house could get different prices.`],
      ans: String.raw`\(\mathbf z = (0.5, 2)\), always with the training \(\mu\) and \(\sigma\).` },
    { t: "Back to raw units", pts: 2, q: String.raw`Trained on z, the model is \(\hat y = 250 + 40z_1 + 10z_2\) (thousand dollars). Write it in raw units and check it on the new house.`,
      a: [String.raw`Substitute \(z_j = (x_j - \mu_j)/\sigma_j\): \(w_1 = 40/20 = 2\) per m² and \(w_2 = 10/1 = 10\) per room.`,
        String.raw`\(b = 250 - 2\cdot 80 - 10\cdot 2 = 70\), so \(\hat y = 70 + 2x_1 + 10x_2\).`,
        String.raw`New house in z: \(250 + 40(0.5) + 10(2) = 290\). In raw units: \(70 + 180 + 40 = 290\). Same model, same price.`],
      ans: String.raw`\(\hat y = 70 + 2x_1 + 10x_2\), 290 thousand dollars for the new house.` },
    { t: "Why it matters for descent", pts: 2, q: String.raw`Compare the curvature of the cost on centered raw features with the curvature on standardized features. What is the condition number in each case, and what does it do to gradient descent?`,
      a: [String.raw`For centered features the curvature of Ng's cost is the covariance matrix. Raw: \(\mathrm{diag}(400, 1)\), because size and rooms are uncorrelated here. Condition number 400.`,
        String.raw`Any stable \(\alpha\) must stay below \(2/400 = 0.005\). At \(\alpha = 0.0025\) the size direction converges in one step but the rooms direction shrinks by only 0.9975 per step: about 1,840 steps to cut its error by 100.`,
        String.raw`Standardized: \(\mathrm{diag}(1, 1)\), condition number 1. The contours are circles, and \(\alpha = 1\) reaches the minimum in one step.`],
      ans: String.raw`Raw \(\kappa = 400\) (about 1,840 steps), standardized \(\kappa = 1\) (one step).` }
  ],
  ctl(k, st) {
    if (k === 1 || k === 2) return slb("e1hs", "new size, m²", 40, 140, 5, st.size) + slb("e1hr", "new rooms", 0, 6, 1, st.rooms);
    if (k === 3) return slb("e1rr", "α as a fraction of each limit 2/λmax", 0.05, 0.95, 0.05, st.r);
    return "";
  },
  bind(k, st, redraw) {
    if (k === 1 || k === 2) bindSl(st, [["e1hs", "size", 0], ["e1hr", "rooms", 0]], redraw);
    if (k === 3) bindSl(st, [["e1rr", "r", 2]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 3) {
      const a = ML.axes(60, 14, 360, 280, { xmin: 0, xmax: 3.3, ymin: -12, ymax: 3, nx: 3, ny: 5, fx: () => "", fy: v => v, xl: "gradient descent step (log scale)", yl: "log₁₀ (J − J*)" });
      const ns = []; for (let n = 0; n <= 2000; n += n < 100 ? 1 : 10) ns.push(n);
      const run = (lams, al) => ns.map(n => { let v = 0; lams.forEach(l => { v += 0.5 * l * Math.pow(1 - al * l, 2 * n); }); return [Math.log10(1 + n), Math.log10(Math.max(v, 1e-13))]; });
      const raw = run([400, 1], st.r * 2 / 400), zz = run([1, 1], st.r * 2);
      [0, 1, 10, 100, 1000].forEach(n => { s += tx(a.X(Math.log10(1 + n)), 310, n.toLocaleString("en-US"), "middle"); });
      s += clip("e1cpb5", 60, 14, 360, 280) + a.s + `<g clip-path="url(#e1cpb5)">` + ML.path(raw.map(p => [a.X(p[0]), a.Y(p[1])]), C.coral, 2.2) + ML.path(zz.map(p => [a.X(p[0]), a.Y(p[1])]), C.teal, 2.2) + `</g>`;
      const alr = st.r * 2 / 400, slow = 1 - alr, steps = Math.log(0.01) / Math.log(Math.abs(slow));
      s += tx(450, 34, "coral: raw, curvatures 400 and 1", null, "t") + tx(450, 56, `α = ${f(alr, 5)}`, null) + tx(450, 76, `rooms factor ${f(slow, 5)}`, null) + tx(450, 96, `${Math.round(steps).toLocaleString("en-US")} steps per factor 100`, null);
      s += tx(450, 130, "teal: standardized, curvature 1, 1", null, "t") + tx(450, 152, `α = ${f(st.r * 2, 2)}, factor ${f(1 - st.r * 2, 2)}`, null) + tx(450, 172, st.r === 0.5 ? "one step to the minimum" : `${Math.max(1, Math.round(Math.log(0.01) / Math.log(Math.abs(1 - st.r * 2) || 1e-300)))} steps per factor 100`, null);
      s += tx(450, 214, "both runs at the same fraction", null) + tx(450, 232, "of their own stability limit", null);
      return { h: 340, s };
    }
    const nz = [(st.size - 80) / 20, (st.rooms - 2) / 1];
    const a = ML.axes(50, 30, 260, 240, { xmin: 40, xmax: 140, ymin: 0, ymax: 6, nx: 5, ny: 6, fx: v => v, fy: v => v, xl: "size, m²", yl: "rooms" });
    const b = ML.axes(390, 30, 260, 240, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "z₁", yl: "z₂" });
    s += a.s + b.s + tx(180, 20, "raw units", "middle", "th") + tx(520, 20, "standardized", "middle", "th");
    HS.forEach((x, i) => { s += dot(a.X(x), a.Y(HR[i]), 5, C.blue) + dot(b.X((x - 80) / 20), b.Y(HR[i] - 2), 5, C.blue); });
    s += dot(a.X(80), a.Y(2), 4, C.gray, true) + dot(b.X(0), b.Y(0), 4, C.gray, true);
    if (k >= 1) { s += dot(a.X(st.size), a.Y(st.rooms), 6, C.coral, true) + dot(b.X(Math.max(-3, Math.min(3, nz[0]))), b.Y(Math.max(-3, Math.min(3, nz[1]))), 6, C.coral, true); }
    let html = "";
    if (k >= 1) {
      const pz = 250 + 40 * nz[0] + 10 * nz[1], pr = 70 + 2 * st.size + 10 * st.rooms;
      html = ML.readout([["new house z", `(${f(nz[0], 2)}, ${f(nz[1], 2)})`], ["price from z", f(pz, 1)], ["price from raw", f(pr, 1)]].slice(0, k === 1 ? 1 : 3));
    }
    s += tx(50, 300, "blue: training houses, grey ring: the training mean" + (k >= 1 ? ", coral ring: the new house" : ""), null);
    return { h: 312, s, html };
  }
};

/* ====================================================================
   B6. Probability and likelihood
   ==================================================================== */
const RD = [4.1, 3.8, 4.4, 4.0, 4.2], CY = [1, 2, 2, 3, 12];
const huber = (e, d) => Math.abs(e) <= d ? 0.5 * e * e : d * (Math.abs(e) - 0.5 * d);
const B6 = {
  key: "B6",
  st: () => ({ p: 0.15, kd: 3, mu: 4.1, sg: 0.2, base: 2, fa: 5, c: 4, dl: 1 }),
  parts: [
    { t: "Bernoulli likelihood", pts: 2, q: String.raw`20 parts are inspected and 3 are defective. Model each part as Bernoulli(p). Write the log-likelihood, find the maximum likelihood p, and evaluate the log-likelihood there and at p = 0.2.`,
      a: [String.raw`\(L(p) = p^3(1 - p)^{17}\), so \(\ell(p) = 3\ln p + 17\ln(1 - p)\).`,
        String.raw`\(\ell'(p) = 3/p - 17/(1 - p) = 0\) gives \(3(1 - p) = 17p\), so \(\hat p = 3/20 = 0.15\), the observed fraction.`,
        String.raw`\(\ell(0.15) = 3(-1.8971) + 17(-0.1625) = -8.454\) and \(\ell(0.2) = 3(-1.6094) + 17(-0.2231) = -8.622\), lower, as it must be.`],
      ans: String.raw`\(\hat p = 0.15\), \(\ell(0.15) = -8.454\), \(\ell(0.2) = -8.622\).` },
    { t: "Gaussian MLE", pts: 2, q: String.raw`Five readings of one quantity: 4.1, 3.8, 4.4, 4.0, 4.2. Assume they are Gaussian. Find the maximum likelihood \(\mu\) and \(\sigma\).`,
      a: [String.raw`\(\hat\mu\) is the sample mean, 20.5/5 = 4.1.`,
        String.raw`Deviations 0, −0.3, 0.3, −0.1, 0.1, squares summing to 0.2. \(\hat\sigma^2 = 0.2/5 = 0.04\), so \(\hat\sigma = 0.2\).`,
        String.raw`The MLE divides by m, not m − 1. The unbiased estimate 0.2/4 = 0.05 gives 0.224. np.std uses m by default (ddof = 0).`],
      ans: String.raw`\(\hat\mu = 4.1\), \(\hat\sigma = 0.2\).` },
    { t: "Bayes rule", pts: 2, q: String.raw`2% of parts are defective. A sensor flags 95% of defective parts and 5% of good ones. A part is flagged. What is the probability that it is defective?`,
      a: [String.raw`\(P(\text{flag}) = 0.95(0.02) + 0.05(0.98) = 0.019 + 0.049 = 0.068\).`,
        String.raw`\(P(\text{defect}\mid\text{flag}) = \frac{P(\text{flag}\mid\text{defect})P(\text{defect})}{P(\text{flag})} = 0.019/0.068 = 0.279\).`,
        String.raw`In 1,000 parts: 20 defective, 19 of them flagged, and 49 false alarms among the 980 good ones. Most flags are false because good parts are so common.`],
      ans: String.raw`0.279.` },
    { t: "Which noise, which loss", pts: 2, q: String.raw`Fit a constant c to y = 1, 2, 2, 3, 12. Which c minimizes the MSE, which minimizes the MAE, and which noise model does each loss come from?`,
      a: [String.raw`The MSE is minimized by the mean, 4, with MSE 16.4. The MAE is minimized by the median, 2, with MAE 2.4.`,
        String.raw`Gaussian noise: \(-\log L = m\log(\sigma\sqrt{2\pi}) + \mathrm{SSE}/(2\sigma^2)\), so the most likely fit is the least squares fit. Laplace noise has \(|e|/b\) in the exponent, so its most likely fit minimizes the MAE.`,
        String.raw`The 12 pulls the mean up by 2 but does not move the median. Heavy-tailed noise calls for the MAE or Huber.`],
      ans: String.raw`MSE: c = 4 (Gaussian). MAE: c = 2 (Laplace).` },
    { t: "Huber", pts: 2, q: String.raw`Compute the Huber loss with \(\delta = 1\) at residuals 0.5 and 3, and compare each with \(\frac12 e^2\).`,
      a: [String.raw`\(|0.5| \le 1\): quadratic branch, \(\frac12(0.5)^2 = 0.125\), the same as \(\frac12 e^2\).`,
        String.raw`\(|3| \gt 1\): linear branch, \(\delta(|e| - \frac12\delta) = 1(3 - 0.5) = 2.5\), against \(\frac12(3)^2 = 4.5\).`,
        String.raw`The slope is capped at \(\delta\), so one large residual pulls on the fit with force 1 instead of 3.`],
      ans: String.raw`0.125 and 2.5 (against 0.125 and 4.5).` }
  ],
  ctl(k, st) {
    if (k === 0) return slb("e1pp", "p", 0.01, 0.5, 0.01, st.p) + slb("e1kd", "defective of 20", 0, 10, 1, st.kd);
    if (k === 1) return slb("e1mu", "μ", 3.6, 4.6, 0.02, st.mu) + slb("e1sg", "σ", 0.08, 0.6, 0.01, st.sg);
    if (k === 2) return slb("e1ba", "defect rate, %", 0.5, 20, 0.5, st.base) + slb("e1fa", "false alarm rate, %", 0, 20, 1, st.fa);
    if (k === 3) return slb("e1cc", "constant c", 0, 13, 0.1, st.c);
    return slb("e1dl", "δ", 0.2, 4, 0.1, st.dl);
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e1pp", "p", 2], ["e1kd", "kd", 0]], redraw);
    if (k === 1) bindSl(st, [["e1mu", "mu", 2], ["e1sg", "sg", 2]], redraw);
    if (k === 2) bindSl(st, [["e1ba", "base", 1], ["e1fa", "fa", 0]], redraw);
    if (k === 3) bindSl(st, [["e1cc", "c", 1]], redraw);
    if (k === 4) bindSl(st, [["e1dl", "dl", 1]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const K = st.kd, ll = p => (K ? K * Math.log(p) : 0) + (20 - K) * Math.log(1 - p);
      const a = ML.axes(60, 14, 330, 280, { xmin: 0, xmax: 0.5, ymin: -25, ymax: 0, nx: 5, ny: 5, fx: v => f(v, 1), fy: v => v, xl: "p", yl: "log-likelihood ℓ(p)" });
      const pts = []; for (let i = 1; i <= 100; i++) { const p = 0.5 * i / 100; pts.push([a.X(p), a.Y(Math.max(-25, ll(p)))]); }
      const ph = K / 20;
      s += clip("e1cpb6", 60, 14, 330, 280) + a.s + `<g clip-path="url(#e1cpb6)">` + ML.path(pts, C.blue, 2) + (ph > 0 ? ln(a.X(ph), 14, a.X(ph), 294, C.teal, 1.2, "5 4") : "") + `</g>` + dot(a.X(st.p), a.Y(Math.max(-25, ll(st.p))), 5, C.coral);
      s += tx(420, 34, `${K} defective of 20`, null, "th") + tx(420, 60, `ℓ(${f(st.p, 2)}) = ${f(ll(st.p), 3)}`, null, "t") + tx(420, 84, `maximum at p̂ = ${K}/20 = ${f(ph, 2)}`, null, "t");
      if (K > 0) s += tx(420, 108, `ℓ(p̂) = ${f(ll(ph), 3)}`, null, "t");
      s += tx(420, 144, "teal dashes: the maximum", null) + tx(420, 162, "the likelihood itself is e^ℓ, about", null) + tx(420, 180, `${Math.exp(ll(st.p)).toExponential(2)} here`, null);
      return { h: 340, s };
    }
    if (k === 1) {
      const pdf = x => Math.exp(-((x - st.mu) ** 2) / (2 * st.sg * st.sg)) / (st.sg * Math.sqrt(2 * Math.PI));
      const a = ML.axes(60, 14, 330, 260, { xmin: 3.2, xmax: 5, ymin: 0, ymax: 5, nx: 6, ny: 5, fx: v => f(v, 1), fy: v => v, xl: "reading", yl: "density" });
      const pts = []; for (let i = 0; i <= 160; i++) { const x = 3.2 + 1.8 * i / 160; pts.push([a.X(x), a.Y(Math.min(5, pdf(x)))]); }
      const ll = RD.reduce((p, x) => p + Math.log(pdf(x)), 0);
      s += a.s + ML.path(pts, C.blue, 2) + RD.map(x => ln(a.X(x), a.Y(0), a.X(x), a.Y(Math.min(5, pdf(x))), C.coral, 1.6) + dot(a.X(x), a.Y(0), 4, C.coral)).join("");
      s += tx(420, 34, `μ = ${f(st.mu, 2)}, σ = ${f(st.sg, 2)}`, null, "th") + tx(420, 60, `log-likelihood ${f(ll, 3)}`, null, "t") + tx(420, 84, `at the MLE (4.1, 0.2): ${f(RD.reduce((p, x) => p + Math.log(Math.exp(-((x - 4.1) ** 2) / 0.08) / (0.2 * Math.sqrt(2 * Math.PI))), 0), 3)}`, null, "t");
      s += tx(420, 120, "coral: the density at each reading", null) + tx(420, 138, "the likelihood is their product", null);
      return { h: 320, s };
    }
    if (k === 2) {
      const N = 1000, nd = Math.round(N * st.base / 100), tp = Math.round(nd * 0.95), fp = Math.round((N - nd) * st.fa / 100);
      const cols = 50, cell = 12;
      for (let i = 0; i < N; i++) {
        const r = Math.floor(i / cols), c = i % cols;
        let col = "var(--sunk)";
        if (i < tp) col = C.coral; else if (i < nd) col = C.purple; else if (i < nd + fp) col = C.blue;
        s += `<rect x="${20 + c * cell}" y="${14 + r * cell}" width="${cell - 2}" height="${cell - 2}" rx="2" fill="${col}"/>`;
      }
      const post = tp / Math.max(1, tp + fp);
      s += tx(20, 270, `coral: defective and flagged ${tp}, purple: defective and missed ${nd - tp}, blue: false alarms ${fp}`, null, "t");
      s += tx(20, 294, `P(defect | flag) = ${tp} / (${tp} + ${fp}) = ${f(post, 3)}, exact ${f(0.95 * st.base / 100 / (0.95 * st.base / 100 + (1 - st.base / 100) * st.fa / 100 || 1), 3)}`, null, "th");
      return { h: 310, s };
    }
    if (k === 3) {
      const mse = c => CY.reduce((p, y) => p + (y - c) ** 2, 0) / 5, mae = c => CY.reduce((p, y) => p + Math.abs(y - c), 0) / 5;
      const a = ML.axes(60, 14, 330, 270, { xmin: 0, xmax: 13, ymin: 0, ymax: 50, nx: 13, ny: 5, fx: v => v, fy: v => v, xl: "constant prediction c", yl: "loss" });
      const P1 = [], P2 = []; for (let i = 0; i <= 130; i++) { const c = i / 10; P1.push([a.X(c), a.Y(Math.min(50, mse(c)))]); P2.push([a.X(c), a.Y(Math.min(50, 5 * mae(c)))]); }
      s += clip("e1cpb6d", 60, 14, 330, 270) + a.s + `<g clip-path="url(#e1cpb6d)">` + ML.path(P1, C.blue, 2) + ML.path(P2, C.purple, 2) + ln(a.X(st.c), 14, a.X(st.c), 284, C.coral, 1.4, "4 4") + `</g>`;
      s += dot(a.X(4), a.Y(mse(4)), 5, C.blue) + dot(a.X(2), a.Y(5 * mae(2)), 5, C.purple);
      CY.forEach(y => { s += `<line x1="${a.X(y)}" y1="284" x2="${a.X(y)}" y2="276" stroke="var(--p)" stroke-width="2"/>`; });
      s += tx(420, 34, `c = ${f(st.c, 1)}`, null, "th") + tx(420, 60, `MSE ${f(mse(st.c), 2)}`, null, "t") + tx(420, 82, `MAE ${f(mae(st.c), 2)}`, null, "t");
      s += tx(420, 118, "blue: MSE, minimum 16.4 at the mean 4", null) + tx(420, 136, "purple: 5 × MAE, minimum 2.4", null) + tx(420, 154, "at the median 2", null) + tx(420, 172, "ticks: the data 1, 2, 2, 3, 12", null);
      return { h: 330, s };
    }
    const d = st.dl, a = ML.axes(60, 14, 330, 270, { xmin: -4, xmax: 4, ymin: 0, ymax: 8, nx: 8, ny: 4, fx: v => v, fy: v => v, xl: "residual e", yl: "loss" });
    const P1 = [], P2 = [], P3 = []; for (let i = 0; i <= 160; i++) { const e = -4 + 8 * i / 160; P1.push([a.X(e), a.Y(Math.min(8, 0.5 * e * e))]); P2.push([a.X(e), a.Y(Math.abs(e))]); P3.push([a.X(e), a.Y(huber(e, d))]); }
    s += a.s + ML.path(P1, C.blue, 1.8, "6 4") + ML.path(P2, C.gray, 1.4, "3 3") + ML.path(P3, C.coral, 2.4);
    [0.5, 3].forEach(e => { s += dot(a.X(e), a.Y(huber(e, d)), 5, C.coral) + dot(a.X(e), a.Y(0.5 * e * e), 4, C.blue, true); });
    s += tx(420, 34, `δ = ${f(d, 1)}`, null, "th") + tx(420, 60, `Huber(0.5) = ${f(huber(0.5, d), 3)}, ½e² = 0.125`, null, "t") + tx(420, 84, `Huber(3) = ${f(huber(3, d), 3)}, ½e² = 4.5`, null, "t");
    s += tx(420, 120, "coral: Huber, blue dashes: ½e²", null) + tx(420, 138, "grey: |e|", null) + tx(420, 156, `slope capped at δ = ${f(d, 1)}`, null);
    return { h: 330, s };
  }
};

/* ====================================================================
   B7. Overfitting and regularization (fresh data, default_rng(1104))
   ==================================================================== */
const PXT = [-0.97, -0.92, -0.86, -0.79, -0.66, -0.02, 0.31, 0.49, 0.9], PYT = [-1.35, -1.08, -1.08, -1.0, -0.48, 0.91, 0.99, 0.39, -0.17];
const PXV = [-0.85, -0.76, 0.13, 0.2, 0.45, 0.47, 0.55, 0.83, 0.9], PYV = [-1.17, -0.51, 0.83, 0.81, 0.75, 0.52, 0.21, 0.11, -0.35];
const polyFit = d => lsq(PXT.map(x => Array.from({ length: d + 1 }, (_, j) => Math.pow(x, j))), PYT);
const polyAt = (c, x) => c.reduce((s, cj, j) => s + cj * Math.pow(x, j), 0);
const mseP = (c, X, Y) => X.reduce((s, x, i) => s + (polyAt(c, x) - Y[i]) ** 2, 0) / X.length;
const PERR = Array.from({ length: 9 }, (_, d) => { const c = polyFit(d); return [mseP(c, PXT, PYT), mseP(c, PXV, PYV)]; });
const CVF = [[0.01, [0.30, 0.26, 0.34, 0.28, 0.32]], [0.1, [0.27, 0.25, 0.29, 0.26, 0.28]], [0.3, [0.29, 0.25, 0.29, 0.27, 0.28]], [1, [0.31, 0.33, 0.30, 0.36, 0.30]]];
const mstat = v => { const m = v.reduce((a, b) => a + b, 0) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); return [m, sd, sd / Math.sqrt(v.length)]; };
const B7 = {
  key: "B7",
  st: () => ({ d: 2, lam: 0.4, al: 0.1, lm: 2 }),
  parts: [
    { t: "Read the table", pts: 2, q: String.raw`Polynomials of degree d were fit by least squares to 9 training points and scored on 9 validation points (MSE). The noise variance is about 0.0225. Diagnose degrees 1, 2 and 8, and choose a degree.<br>d = 0: train 0.718, validation 0.630. d = 1: 0.306 and 0.351. d = 2: 0.0244 and 0.0260. d = 3: 0.0221 and 0.0328. d = 8: 0.0000 and 25.04.`,
      a: [String.raw`Degree 1: training 0.306 and validation 0.351 are both far above the noise level 0.0225 and close to each other. High bias: a line cannot bend, so it underfits.`,
        String.raw`Degree 8: 9 coefficients through 9 points give training error 0, and validation 25.0 is a thousand times the noise. High variance: it overfits.`,
        String.raw`Degree 2: both errors sit at the noise level and close to each other. Choose degree 2, the lowest validation error, then report the test error once, after the choice. Degree 3 already starts to drift up.`],
      ans: String.raw`d = 1 underfits (high bias), d = 8 overfits (high variance), choose d = 2.` },
    { t: "Regularized cost", pts: 2, q: String.raw`A model with bias b = 3 and weights \(\mathbf w = (2, -1, 0.5)\) has residuals 0.5, −0.3, 0.1, −0.7 on m = 4 examples. Compute Ng's regularized cost with \(\lambda = 0.4\).`,
      a: [String.raw`Data term: SSE = 0.25 + 0.09 + 0.01 + 0.49 = 0.84, and \(0.84/(2\cdot 4) = 0.105\).`,
        String.raw`Penalty: \(\sum_j w_j^2 = 4 + 1 + 0.25 = 5.25\) and \(\frac{\lambda}{2m}\sum_j w_j^2 = 0.05\cdot 5.25 = 0.2625\). The bias is not penalized.`,
        String.raw`\(J = 0.105 + 0.2625 = 0.3675\). Penalizing b by mistake would add \(0.05\cdot 9 = 0.45\) and give 0.8175.`],
      ans: String.raw`\(J = 0.3675\).` },
    { t: "One regularized step", pts: 2, q: String.raw`With \(\alpha = 0.1\), \(\lambda = 2\) and m = 10, a weight is 1.5 and its data gradient \(\frac1m\sum_i e_i x_i\) is 0.4. Take one gradient descent step on Ng's regularized cost.`,
      a: [String.raw`\(w := w - \alpha\left(\frac1m\sum_i e_i x_i + \frac{\lambda}{m}w\right) = w\left(1 - \alpha\frac{\lambda}{m}\right) - \alpha\cdot 0.4\).`,
        String.raw`The shrink factor is \(1 - 0.1\cdot 2/10 = 0.98\), so \(w = 1.5\cdot 0.98 - 0.04 = 1.47 - 0.04 = 1.43\).`,
        String.raw`Without the penalty the step would give 1.46. Every step first shrinks the weight by 2%, which is why L2 regularization is called weight decay.`],
      ans: String.raw`\(w = 1.43\) (shrink factor 0.98).` },
    { t: "5-fold cross-validation", pts: 2, q: String.raw`Validation MSE on each of 5 folds:<br>\(\lambda = 0.01\): 0.30, 0.26, 0.34, 0.28, 0.32. \(\lambda = 0.1\): 0.27, 0.25, 0.29, 0.26, 0.28. \(\lambda = 0.3\): 0.29, 0.25, 0.29, 0.27, 0.28. \(\lambda = 1\): 0.31, 0.33, 0.30, 0.36, 0.30.<br>Find the mean for each \(\lambda\), the \(\lambda\) with the lowest mean, and the \(\lambda\) the one standard error rule picks.`,
      a: [String.raw`Means: 0.300, 0.270, 0.276 and 0.320. The lowest is \(\lambda = 0.1\).`,
        String.raw`Its folds have sample standard deviation 0.0158, so its standard error is \(0.0158/\sqrt5 = 0.0071\) and the bar is 0.270 + 0.007 = 0.277.`,
        String.raw`The rule takes the simplest model under the bar. A larger \(\lambda\) is simpler, and \(\lambda = 0.3\) at 0.276 is under it, so the rule picks 0.3. Then refit on all the training data with that \(\lambda\).`],
      ans: String.raw`Lowest mean at \(\lambda = 0.1\) (0.270). The one SE rule picks \(\lambda = 0.3\).` }
  ],
  ctl(k, st) {
    if (k === 0) return slb("e1dg", "degree", 0, 8, 1, st.d);
    if (k === 1) return slb("e1lm", "λ", 0, 2, 0.1, st.lam);
    if (k === 2) return slb("e1ga", "α", 0, 0.5, 0.05, st.al) + slb("e1gl", "λ", 0, 10, 0.5, st.lm);
    return "";
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e1dg", "d", 0]], redraw);
    if (k === 1) bindSl(st, [["e1lm", "lam", 1]], redraw);
    if (k === 2) bindSl(st, [["e1ga", "al", 2], ["e1gl", "lm", 1]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const c = polyFit(st.d), a = ML.axes(50, 14, 300, 270, { xmin: -1, xmax: 1, ymin: -2.5, ymax: 2, nx: 4, ny: 9, fx: v => f(v, 1), fy: v => f(v, 1), xl: "x", yl: "y" });
      const pts = []; for (let i = 0; i <= 300; i++) { const x = -1 + 2 * i / 300; pts.push([a.X(x), a.Y(Math.max(-30, Math.min(30, polyAt(c, x))))]); }
      s += clip("e1cpb7", 50, 14, 300, 270) + a.s + `<g clip-path="url(#e1cpb7)">` + ML.path(pts, C.coral, 2.2) + `</g>`;
      PXT.forEach((x, i) => { s += dot(a.X(x), a.Y(PYT[i]), 4.5, C.blue); });
      PXV.forEach((x, i) => { s += dot(a.X(x), a.Y(PYV[i]), 4.5, C.purple, true); });
      const b = ML.axes(420, 14, 220, 230, { xmin: 0, xmax: 8, ymin: -5, ymax: 2, nx: 8, ny: 7, fx: v => Math.round(v), fy: v => v, xl: "degree", yl: "log₁₀ MSE", grid: false });
      s += b.s + ML.path(PERR.map((e, d) => [b.X(d), b.Y(Math.log10(Math.max(e[0], 1e-5)))]), C.blue, 1.8) + ML.path(PERR.map((e, d) => [b.X(d), b.Y(Math.log10(e[1]))]), C.purple, 1.8);
      s += ln(b.X(0), b.Y(Math.log10(0.0225)), b.X(8), b.Y(Math.log10(0.0225)), C.gray, 1, "4 4") + ln(b.X(st.d), 14, b.X(st.d), 244, C.coral, 1.2, "3 3");
      s += tx(50, 350, `degree ${st.d}: train ${f(PERR[st.d][0], 4)}, validation ${f(PERR[st.d][1], 4)}`, null, "th") + tx(50, 374, "blue: training points and training error, purple rings and line: validation, grey dashes: the noise level 0.0225", null);
      return { h: 386, s };
    }
    if (k === 1) {
      const w = [2, -1, 0.5], dat = 0.105, pen = st.lam / 8 * 5.25, sc = 160;
      s += tx(40, 30, "weights (b = 3 is not penalized)", null, "th");
      w.forEach((v, i) => { const x = 60 + i * 70; s += `<rect x="${x}" y="${v > 0 ? 150 - v * 50 : 150}" width="40" height="${Math.abs(v) * 50}" rx="4" fill="${C.blue}" opacity="0.8"/>` + tx(x + 20, 230, `w${i + 1} = ${v}`, "middle"); });
      s += ln(50, 150, 270, 150, "var(--p)", 1) + `<rect x="230" y="${150 - 3 * 25}" width="30" height="75" rx="4" fill="${C.gray}" opacity="0.5"/>` + tx(245, 230, "b = 3", "middle");
      const bx = 400, by = 260;
      s += `<rect x="${bx}" y="${by - dat * sc}" width="60" height="${dat * sc}" fill="${C.teal}" opacity="0.85"/><rect x="${bx}" y="${by - (dat + pen) * sc}" width="60" height="${pen * sc}" fill="${C.coral}" opacity="0.85"/>`;
      s += tx(bx + 30, by + 18, "J", "middle") + tx(bx + 80, by - dat * sc / 2, `data 0.105`, null, "t") + tx(bx + 80, by - dat * sc - pen * sc / 2 + 4, `penalty ${f(pen, 4)}`, null, "t");
      s += tx(400, 34, `λ = ${f(st.lam, 1)}, J = ${f(dat + pen, 4)}`, null, "th") + tx(400, 56, `Σw² = 5.25, λ/(2m) = ${f(st.lam / 8, 3)}`, null);
      return { h: 290, s };
    }
    if (k === 2) {
      const a = ML.axes(40, 40, 600, 60, { xmin: 1.2, xmax: 1.6, ymin: 0, ymax: 1, nx: 8, ny: 1, fx: v => f(v, 2), fy: () => "", grid: false });
      const sh = 1 - st.al * st.lm / 10, w1 = 1.5 * sh, w2 = w1 - st.al * 0.4, wn = 1.5 - st.al * 0.4;
      s += a.s + dot(a.X(1.5), a.Y(0.5), 6, C.blue) + arrow(a.X(1.5), a.Y(0.5) - 14, a.X(w1), a.Y(0.5) - 14, C.purple, 2) + arrow(a.X(w1), a.Y(0.5) + 14, a.X(w2), a.Y(0.5) + 14, C.coral, 2) + dot(a.X(w2), a.Y(0.5), 6, C.coral) + dot(a.X(wn), a.Y(0.5), 5, C.gray, true);
      s += tx(40, 150, `shrink factor 1 − αλ/m = ${f(sh, 3)}: 1.5 to ${f(w1, 4)} (purple)`, null, "t") + tx(40, 174, `data step − α · 0.4 = −${f(st.al * 0.4, 3)}: to ${f(w2, 4)} (coral)`, null, "t") + tx(40, 198, `without the penalty: ${f(wn, 4)} (grey ring)`, null, "t");
      return { h: 220, s };
    }
    const a = ML.axes(70, 14, 340, 260, { xmin: -0.5, xmax: 3.5, ymin: 0.22, ymax: 0.38, nx: 4, ny: 8, fx: v => ["0.01", "0.1", "0.3", "1"][Math.round(v + 0.5)] || "", fy: v => f(v, 2), xl: "λ", yl: "fold validation MSE", grid: false });
    s += a.s;
    const S1 = mstat(CVF[1][1]), bar = S1[0] + S1[2];
    s += ln(a.X(-0.5), a.Y(bar), a.X(3.5), a.Y(bar), C.coral, 1.4, "6 4") + tx(a.X(3.5) - 4, a.Y(bar) - 6, `bar ${f(bar, 3)}`, "end");
    CVF.forEach(([lam, v], i) => {
      const [m, , se] = mstat(v);
      v.forEach((y, j) => { s += dot(a.X(i) - 16 + j * 8, a.Y(y), 3, C.gray); });
      s += ln(a.X(i) - 26, a.Y(m), a.X(i) + 26, a.Y(m), i === 1 ? C.blue : i === 2 ? C.teal : "var(--p)", 2.4) + ln(a.X(i), a.Y(m - se), a.X(i), a.Y(m + se), "var(--p)", 1.4);
      s += tx(450, 40 + i * 24, `λ = ${lam}: mean ${f(m, 3)}, SE ${f(se, 4)}`, null, "t");
    });
    s += tx(450, 150, "blue: lowest mean, λ = 0.1", null) + tx(450, 170, "teal: the one SE choice, λ = 0.3", null) + tx(450, 190, "coral dashes: lowest mean + its SE", null);
    return { h: 320, s };
  }
};

/* ====================================================================
   B8. Python classes and PyTorch
   ==================================================================== */
const CLS = ["class Scaler:", "    def __init__(self):", "        self.mu = None", "    def fit(self, x):", "        self.mu = sum(x) / len(x)", "        return self", "    def transform(self, x):", "        return [v - self.mu for v in x]", "", "class Shift(Scaler):", "    def __init__(self, c):", "        super().__init__()", "        self.c = c", "    def transform(self, x):", "        return [v + self.c for v in super().transform(x)]", "", "s = Shift(10).fit([2, 4, 6])", "print(s.mu, s.transform([5, 1]))"];
const AG = ["w = torch.tensor(2.0, requires_grad=True)", "y = w**3 - 4*w", "y.backward()", "print(w.grad)", "y = w**3 - 4*w", "y.backward()", "print(w.grad)"];
const TOPS = [["x.sum(dim=0)", "(4,)", "12, 15, 18, 21"], ["x.mean(dim=1, keepdim=True)", "(3, 1)", "1.5, 5.5, 9.5 as a column"], ["x - x.mean(dim=0)", "(3, 4)", "each column centered: rows −4, 0, 4"], ["x[:, 1]", "(3,)", "1, 5, 9"]];
const B8 = {
  key: "B8",
  st: () => ({ cs: 0, op: 0, g: 0, back: 0, nin: 4, nh: 3 }),
  parts: [
    { t: "A class and its parent", pts: 2, q: String.raw`What does the program above print? Name the method that runs at each call.`,
      a: [String.raw`Shift(10) runs Shift.__init__, which calls super().__init__() (so mu = None) and then sets c = 10.`,
        String.raw`fit is inherited from Scaler: mu = 12/3 = 4.0, and it returns self, so s is the Shift object, not None.`,
        String.raw`s.transform finds Shift.transform first. Inside it, super().transform([5, 1]) runs Scaler.transform and gives [1.0, −3.0], and adding c gives [11.0, 7.0].`],
      ans: String.raw`4.0 [11.0, 7.0]` },
    { t: "Tensor shapes", pts: 2, q: String.raw`x = torch.arange(12.).reshape(3, 4). Give the value and shape of x.sum(dim=0), x.mean(dim=1, keepdim=True), x - x.mean(dim=0) and x[:, 1].`,
      a: [String.raw`x has rows (0, 1, 2, 3), (4, 5, 6, 7), (8, 9, 10, 11).`,
        String.raw`x.sum(dim=0) adds down the rows and removes dim 0: (12, 15, 18, 21), shape (4,).`,
        String.raw`x.mean(dim=1, keepdim=True) averages each row and keeps a size-1 dim: 1.5, 5.5, 9.5 in shape (3, 1).`,
        String.raw`x.mean(dim=0) is (4, 5, 6, 7) with shape (4,). It broadcasts against (3, 4), so x - x.mean(dim=0) is (3, 4) with every column centered. x[:, 1] is column 1, (1, 5, 9), shape (3,).`],
      ans: String.raw`(4,), (3, 1), (3, 4) and (3,).` },
    { t: "Autograd", pts: 2, q: String.raw`What do the two print lines show?`,
      a: [String.raw`\(dy/dw = 3w^2 - 4 = 12 - 4 = 8\), so the first print shows tensor(8.).`,
        String.raw`backward adds into w.grad instead of replacing it. The second graph gives 8 again, so w.grad becomes 16 and the second print shows tensor(16.).`,
        String.raw`In a training loop that would add up gradients across steps. Call optimizer.zero_grad() (or set w.grad = None) before each backward.`],
      ans: String.raw`tensor(8.) then tensor(16.)` },
    { t: "A model and its loop", pts: 2, q: String.raw`How many parameters does nn.Sequential(nn.Linear(4, 3), nn.ReLU(), nn.Linear(3, 1)) have? Then put these lines of one training step in order: loss.backward(), optimizer.step(), pred = model(xb), optimizer.zero_grad(), loss = loss_fn(pred, yb).`,
      a: [String.raw`nn.Linear(4, 3) holds a weight of shape (3, 4) and a bias of shape (3,): 15. nn.Linear(3, 1) holds 3 + 1 = 4. ReLU has none. Total 19.`,
        String.raw`Order: optimizer.zero_grad(), pred = model(xb), loss = loss_fn(pred, yb), loss.backward(), optimizer.step(). zero_grad may also come right after the loss, as long as it comes before backward.`],
      ans: String.raw`19 parameters. zero_grad, forward, loss, backward, step.` }
  ],
  ctl(k, st) {
    if (k === 0) return btns([[0, "after line 17: create and fit"], [1, "transform: Shift"], [2, "transform: Scaler"], [3, "print"]], "e1cs");
    if (k === 1) return btns(TOPS.map((t, i) => [i, t[0]]), "e1op");
    if (k === 2) return `<div class="row"><button id="e1bk">y = w**3 − 4*w, then backward()</button><button id="e1zg">w.grad = None</button></div>`;
    return slb("e1ni", "inputs", 1, 8, 1, st.nin) + slb("e1nh", "hidden units", 1, 8, 1, st.nh);
  },
  bind(k, st, redraw) {
    const grp = (attr, key) => { const u = () => pick($("e1b8x"), attr, st[key]); $("e1b8x").querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => { st[key] = +b.dataset[attr]; u(); redraw(); }); u(); };
    if (k === 0) grp("e1cs", "cs");
    if (k === 1) grp("e1op", "op");
    if (k === 2) { $("e1bk").onclick = () => { st.g += 8; st.back++; redraw(); }; $("e1zg").onclick = () => { st.g = 0; st.back = 0; redraw(); }; }
    if (k === 3) bindSl(st, [["e1ni", "nin", 0], ["e1nh", "nh", 0]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const line = [16, 14, 7, 17][st.cs];
      s += ML.box(30, 20, 180, 56, "c-gray", ["Scaler", "__init__, fit, transform"]) + ML.box(30, 120, 180, 56, "c-purple", ["Shift(Scaler)", "__init__, transform"]) + arrow(120, 118, 120, 80, "var(--p)", 1.4);
      const obj = st.cs === 0 ? ["s (a Shift)", "mu = 4.0, c = 10"] : st.cs === 3 ? ["printed", "4.0 [11.0, 7.0]"] : ["s (a Shift)", "mu = 4.0, c = 10"];
      s += ML.box(330, 70, 220, 56, "c-teal", obj);
      if (st.cs === 1) s += arrow(328, 98, 214, 148, C.coral, 2) + tx(270, 140, "found first", "middle");
      if (st.cs === 2) s += arrow(328, 98, 214, 48, C.coral, 2) + tx(270, 52, "super()", "middle") + tx(340, 160, "[5 − 4, 1 − 4] = [1.0, −3.0]", null, "t");
      if (st.cs === 1) s += tx(340, 160, "Shift.transform adds c = 10 to", null, "t") + tx(340, 180, "what Scaler.transform returns", null, "t");
      if (st.cs === 0) s += tx(340, 160, "fit is Scaler's, found by inheritance,", null, "t") + tx(340, 180, "and returns self, the same object", null, "t");
      return { h: 200, s, html: ML.code(CLS, line) };
    }
    if (k === 1) {
      const X = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], op = st.op, hl = new Set(), hl2 = new Set();
      if (op === 0) for (let i = 0; i < 3; i++) hl.add(i + ",0");
      if (op === 1) for (let j = 0; j < 4; j++) hl.add("1," + j);
      if (op === 2) for (let i = 0; i < 3; i++) hl.add(i + ",2");
      if (op === 3) for (let i = 0; i < 3; i++) hl2.add(i + ",1");
      s += ML.grid(X, { x: 70, y: 40, cell: 44, title: "x, shape (3, 4)", axes: true, hl, hl2, dec: 0 }).s;
      const res = op === 0 ? [[12, 15, 18, 21]] : op === 1 ? [[1.5], [5.5], [9.5]] : op === 2 ? [[-4, -4, -4, -4], [0, 0, 0, 0], [4, 4, 4, 4]] : [[1, 5, 9]];
      s += ML.grid(res, { x: 360, y: 40, cell: 44, title: TOPS[op][0], colLab: false, rowLab: false, dec: 1 }).s;
      s += tx(360, 230, `shape ${TOPS[op][1]}`, null, "th") + tx(360, 252, TOPS[op][2], null, "t");
      s += tx(70, 230, op === 0 ? "teal: one column of the sum" : op === 1 ? "teal: one row of the mean" : op === 2 ? "teal: one column minus its mean 6" : "coral: column 1", null);
      return { h: 270, s };
    }
    if (k === 2) {
      s += ML.box(30, 100, 100, 50, "c-blue", ["w", "2.0"]) + ML.box(220, 40, 120, 50, "c-gray", ["w**3", "8.0"]) + ML.box(220, 160, 120, 50, "c-gray", ["4*w", "8.0"]) + ML.box(430, 100, 120, 50, "c-teal", ["y = a − b", "0.0"]);
      s += arrow(132, 118, 218, 70, "var(--p)", 1.4) + arrow(132, 132, 218, 180, "var(--p)", 1.4) + arrow(342, 66, 428, 116, "var(--p)", 1.4) + arrow(342, 184, 428, 134, "var(--p)", 1.4);
      s += tx(175, 80, "3w² = 12", "middle", "t") + tx(175, 176, "4", "middle", "t") + tx(385, 80, "+1", "middle", "t") + tx(385, 176, "−1", "middle", "t");
      s += tx(30, 250, "local derivatives on the edges, chain rule: 12 · 1 + 4 · (−1) = 8", null);
      s += tx(580, 110, `w.grad`, "middle", "th") + tx(580, 134, st.back ? `tensor(${st.g}.)` : "None", "middle", "t") + tx(580, 158, `${st.back} backward call${st.back === 1 ? "" : "s"}`, "middle");
      return { h: 270, s, html: ML.code(AG, -1) };
    }
    const n = st.nin, h = st.nh, P = (n + 1) * h + (h + 1);
    const yI = i => 30 + (i + 0.5) * 220 / n, yH = i => 30 + (i + 0.5) * 220 / h;
    for (let i = 0; i < n; i++) for (let j = 0; j < h; j++) s += ln(80, yI(i), 260, yH(j), C.gray, 0.8);
    for (let j = 0; j < h; j++) s += ln(260, yH(j), 440, 140, C.gray, 0.8);
    for (let i = 0; i < n; i++) s += dot(80, yI(i), 9, C.blue);
    for (let j = 0; j < h; j++) s += dot(260, yH(j), 9, C.purple);
    s += dot(440, 140, 9, C.teal) + tx(80, 272, `${n} inputs`, "middle") + tx(260, 272, `${h} hidden, ReLU`, "middle") + tx(440, 272, "1 output", "middle");
    s += tx(490, 60, `Linear(${n}, ${h}): ${n}·${h} + ${h} = ${(n + 1) * h}`, null, "t") + tx(490, 84, `Linear(${h}, 1): ${h} + 1 = ${h + 1}`, null, "t") + tx(490, 116, `total ${P}`, null, "th");
    s += tx(490, 156, "the loop, one batch:", null) + ["zero_grad()", "pred = model(xb)", "loss = loss_fn(pred, yb)", "loss.backward()", "optimizer.step()"].map((t, i) => tx(500, 178 + i * 18, `${i + 1}. ${t}`, null)).join("");
    return { h: 290, s };
  }
};

/* ====================================================================
   Part A: twelve short questions, 2 points each
   ==================================================================== */
const QA = [
  { q: "A lab has 5,000 Raman spectra without labels and wants to find groups of similar spectra. This is", o: ["supervised regression", "supervised classification", "unsupervised learning, clustering", "reinforcement learning"], a: 2, why: "There is no target to predict, only structure to find in the inputs. With labels it would become classification. Lesson 1." },
  { q: "Which of these is a regression task?", o: ["predicting the tensile strength of an alloy in MPa from its composition", "predicting whether a weld passes inspection", "sorting images of defects into five types", "grouping customers who were never labeled"], a: 0, why: "The target is a real number with units. Pass or fail and five types are classes, and grouping without labels is unsupervised. Lesson 1." },
  { q: "What is wrong with this pipeline?", code: ["scaler = StandardScaler().fit(X)", "Xs = scaler.transform(X)", "X_tr, X_te, y_tr, y_te = train_test_split(Xs, y, test_size=0.2)"], o: ["nothing, scaling before the split is the standard order", "StandardScaler must be fit on y", "test_size must be 0.3 or larger", "the scaler saw the test rows, so test statistics leak into training"], a: 3, why: "Split first, fit the scaler on the training rows only, then transform both. Otherwise the test score is optimistic. Lessons 1 and 17." },
  { q: "On the test set a regression model has MSE 9.0. Predicting the training mean for every test row gives MSE 8.4. What follows?", o: ["the model is good, an MSE of 9 is small", "the model is worse than a constant baseline and is not useful yet", "R² is 0.93", "the test set must be too small"], a: 1, why: "R² against that baseline is 1 − 9.0/8.4 = −0.07. Below zero means the constant wins. Always report the baseline next to the model. Lessons 1 and 15." },
  { q: "What does this print?", code: ["a = [1, 2]", "b = a", "b.append(3)", "c = a[:]", "c.append(4)", "print(len(a), len(c))"], o: ["2 3", "3 4", "3 3", "4 4"], a: 1, why: "b is a second name for the same list, so a becomes [1, 2, 3]. a[:] makes a new list, so appending to c leaves a alone: 3 and 4. Lesson 4." },
  { q: "What does this print?", code: ["def add(v, acc=[]):", "    acc.append(v)", "    return acc", "", "add(1)", "print(add(2))"], o: ["[2]", "an error", "[1]", "[1, 2]"], a: 3, why: "The default list is created once, when def runs, and every call without acc shares it. Use acc=None and create the list inside. Lesson 5." },
  { q: "What does this print?", code: ["print(7 // 2, 7 % 3, 2 ** 3 ** 2)"], o: ["3 1 64", "3.5 1 64", "3 1 512", "3 2 512"], a: 2, why: "// is floor division, % the remainder, and ** groups from the right: 2 ** (3 ** 2) = 2 ** 9 = 512. Lesson 2." },
  { q: "a.shape is (5, 1) and b.shape is (3,). The shape of a + b is", o: ["(5, 1)", "(5, 3)", "(3, 5)", "an error"], a: 1, why: "Align from the right: (5, 1) against (1, 3). Each size-1 axis stretches, giving (5, 3). This is the same trap as a (m, 1) prediction minus a (m,) target. Lesson 9." },
  { q: "What does this print?", code: ["x = np.arange(6)", "y = x[1:4]", "y[0] = 50", "print(x)"], o: ["[0 1 2 3 4 5]", "[50 1 2 3 4 5]", "[0 50 2 3 4 5]", "an error, slices are read-only"], a: 2, why: "A basic NumPy slice is a view on the same memory, so writing y[0] writes x[1]. Use .copy() when you need a separate array. Lesson 8." },
  { q: "What does this print?", code: ["X = np.array([[1, 2, 3],", "              [3, 6, 9]])", "print(X.mean(axis=0))"], o: ["[2. 4. 6.]", "[2. 6.]", "4.0", "[4. 8. 12.]"], a: 0, why: "axis=0 collapses the rows, leaving one mean per column, which is what a scaler needs per feature. axis=1 would give [2. 6.]. Lesson 8." },
  { q: "X has shape (100, 3). What is the shape of X.T @ X, and why does it matter for the normal equation?", o: ["(100, 100), one entry per pair of rows", "(3, 3), so the solve has the same size for 100 or for 100,000 rows", "(3, 100)", "(100, 3)"], a: 1, why: "(3, 100) times (100, 3) gives (3, 3). The rows only enter through the sums inside it. Lessons 12 and 15." },
  { q: "This raises an error. Why?", code: ["x = torch.tensor([[1, 2, 3]])", "layer = nn.Linear(3, 1)", "y = layer(x)"], o: ["x must have shape (3,)", "nn.Linear(3, 1) needs 3 outputs", "requires_grad is missing on x", "x is int64 and the weights are float32: mat1 and mat2 must have the same dtype"], a: 3, why: "torch.tensor of Python ints gives int64. PyTorch says: mat1 and mat2 must have the same dtype, but got Long and Float. Write the numbers as floats or call x.float(). Lesson 21." }
];

/* ---------- the agent card numbers ---------- */
addLesson("ml", "exam", {
level: "Core", num: "E1",
id: "ml-exam-e1", title: "Midterm-style practice", short: "E1. Midterm-style practice",
big: String.raw`A practice midterm worth 100 points, built the way the course midterm covers Lectures 0 to 5 and HW1 to HW7: the ML workflow, Python and NumPy, linear algebra, gradients, linear regression, gradient descent, feature scaling, probability and likelihood, overfitting and regularization, and the first steps in PyTorch. Part A is twelve short questions for 24 points. Part B is eight board problems for 76 points, each a chain of parts on small numbers you can do with a calculator. Every part has a worked solution that opens one line at a time, the way it would be written on the board, and a picture that follows the part and that you can move. Mark yourself on each part as you go, and the score sheet at the end adds the marks up and tells you which lessons to reopen. All numbers are new, so none of it can be recalled from the homework.`,
bridge: String.raw`Parts 1 to 5 of this shelf built the material the midterm covers. Lessons 20 and 28 tested it section by section. This lesson tests it the way the exam does: mixed topics, a clock, and partial credit for the steps. E2 does the same for the final, and E3 is a full mock final.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. The exam", t: "How the practice midterm is built and how to time it",
intu: String.raw`The exam has two parts. Part A is twelve multiple-choice questions at 2 points each. Part B is eight board problems that add up to 76 points, one per topic, each split into parts of 2 or 3 points. Pick the time you will give yourself, then click a section to see what it covers and which lesson it draws on. The minutes are the points scaled to your time, so a 14-point problem gets 14% of the clock. Do Part A first to warm up, then the board problems in any order. If a part stalls, write what you know and move on, because partial credit is given for the steps.`,
eq: String.raw`\[ 100 = \underbrace{12\times 2}_{\text{Part A}} + \underbrace{10 + 8 + 14 + 10 + 8 + 10 + 8 + 8}_{\text{Part B}} \]`,
sym: [["Part A", "12 short questions, 2 points each"], ["B1 to B8", "board problems with worked solutions"], ["minutes", "points times your time over 100"], ["self-mark", "none, half or full on each board part"]],
how: ["Choose the time, 75 minutes is a typical midterm.", "Take Part A without notes.", "Work each board problem on paper before opening a line of the solution.", "Mark each part honestly: full, half or none.", "Open the score sheet and reopen what it names."],
say: String.raw`The practice midterm has twelve short questions worth twenty-four points and eight board problems worth seventy-six, timed at the points times the clock over one hundred.`,
num: String.raw`<b>100</b> points, <b>12</b> short questions and <b>8</b> board problems with <b>36</b> parts, about <b>75</b> minutes.`,
note: String.raw`Bring a calculator and a pencil. Every number in Part B was chosen to be done by hand: two by two inverses, sums over four or five points, one or two steps at a time.`,
r(fig, ctl) {
  let T = 75, k = 0;
  ctl.innerHTML = btns([[50, "50 min"], [75, "75 min"], [90, "90 min"], [120, "120 min"]], "e1t") + btns(SECS.map((s, i) => [i, s.short]), "e1k") + `<div id="e1cv"></div>`;
  const u = () => {
    pick(ctl, "e1t", T); pick(ctl, "e1k", k);
    let s = "", x = 20;
    SECS.forEach((sc, i) => {
      const w = sc.pts * 6.4, on = i === k;
      s += `<rect x="${x}" y="30" width="${w - 2}" height="44" rx="5" fill="${on ? C.teal : i === 0 ? C.blue : C.purple}" opacity="${on ? 0.9 : 0.45}"/>` + tx(x + w / 2 - 1, 57, sc.short, "middle", "th");
      s += tx(x + w / 2 - 1, 94, sc.pts + " pt", "middle") + tx(x + w / 2 - 1, 112, f(sc.pts * T / 100, 1) + " min", "middle");
      x += w;
    });
    s += tx(20, 20, `${T} minutes for 100 points, ${f(T / 100 * 60, 0)} seconds per point`, null, "t");
    const sc = SECS[k];
    s += tx(20, 150, sc.name + ", " + sc.pts + " points, " + sc.lessons, null, "th");
    sc.topics.forEach((t, i) => { const c = i % 4, r = Math.floor(i / 4), xx = 20 + c * 162, y = 166 + r * 30; s += `<rect x="${xx}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(xx + 76, y + 16, t, "middle"); });
    fig.innerHTML = svg(166 + Math.ceil(sc.topics.length / 4) * 30 + 6, s);
    $("e1cv").innerHTML = `<p class="note"><b>${sc.name}</b>: about ${f(sc.pts * T / 100, 0)} minutes at your pace. ${k === 0 ? "Answer in order and commit before reading the feedback." : "Open the card, work the parts on paper, then reveal the solution one line at a time."}</p>`;
  };
  ctl.querySelectorAll("button[data-e1t]").forEach(b => b.onclick = () => { T = +b.dataset.e1t; u(); });
  ctl.querySelectorAll("button[data-e1k]").forEach(b => b.onclick = () => { k = +b.dataset.e1k; u(); });
  u();
}},

{s: "Part A", t: "Part A: twelve short questions, 2 points each",
intu: String.raw`Twelve questions over the ground the midterm opens with: kinds of learning, leakage and baselines, Python names and lists, the mutable default, operators, broadcasting, views, axes, the shape of the normal equation, and the first dtype error in PyTorch. About a minute each. Commit to an answer before reading the feedback, and count 2 points per correct answer for the score sheet.`,
eq: String.raw`\[ \text{Part A} = 2 \times (\text{number correct}), \qquad \text{at most } 24 \]`,
sym: [["Lesson 1", "learning types, splits, leakage, baselines"], ["Lessons 2 to 5", "names, lists, operators, functions"], ["Lessons 8 and 9", "views, axes, broadcasting"], ["Lessons 12, 15, 21", "shapes, the normal equation, dtype"]],
how: ["Read the code line by line and track every name.", "For a shape question write the shape of each operand first.", "Commit, then read the explanation even when you were right."],
say: String.raw`Part A checks the quick facts: what kind of problem it is, where leakage enters, how Python names and NumPy views share objects, and what shape or dtype comes out.`,
num: String.raw`<b>12</b> questions, <b>2</b> points each, about <b>12</b> minutes.`,
note: String.raw`Questions with code are where most points are lost on the midterm. Track every name and every shape on paper, even when the code looks too short to need it.`,
r(fig, ctl) { ML.quiz(fig, ctl, QA, "Part A"); }},

{s: "B1. Linear algebra", t: "B1: shapes, a 2 by 2 inverse, area, eigenvectors and rank (10 points)",
intu: String.raw`Five parts on the linear algebra the regression problems lean on. Part (a) asks for shapes, (b) and (c) for a 2 by 2 inverse and what the matrix does to the unit square, (d) for the eigenvalues of a symmetric matrix, the shape behind every cost contour, and (e) for the rank of a design matrix with a redundant column. Move the matrix entries in (b) and (c) until the determinant reaches 0 and watch the square flatten. Turn the vector in (d) until it lines up with its image.`,
eq: String.raw`\[ M^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a\end{bmatrix}, \qquad \det(S - \lambda I) = 0 \]`,
sym: [[String.raw`\(M\)`, "the 2 by 2 matrix with rows (4, 2) and (1, 3)"], [String.raw`\(\det M\)`, "the area factor of the map"], [String.raw`\(S\)`, "the symmetric matrix with rows (5, 2) and (2, 2)"], [String.raw`\(\lambda\)`, "an eigenvalue, the stretch along its eigenvector"], ["rank", "the number of independent columns"]],
how: ["Write the shape of every operand before any product.", "For a 2 by 2, write the determinant first.", "For eigenvalues, expand det(S − λI) into a quadratic.", "Check eigenvalues with the trace and the determinant.", "Look for one column that is a mix of the others."],
say: String.raw`The determinant of M is ten, M inverse times (8, 7) is (1, 2), the eigenvalues of S are six and one along (2, 1) and (1, minus 2), and a column 3x minus 1 next to 1 and x makes X rank two and X transpose X singular.`,
num: String.raw`\(\det M\) = <b>10</b>, \(\mathbf v\) = (<b>1, 2</b>), area <b>10</b>, eigenvalues <b>6</b> and <b>1</b>, condition number <b>6</b>, rank <b>2</b>, and \(\det X^\top X\) = <b>80</b> with \(x^2\).`,
note: String.raw`Part (e) is the HW3 pinv question in another form. When np.linalg.solve complains about a singular matrix, look for a redundant feature before reaching for pinv.`,
r(fig, ctl) { board(fig, ctl, B1); }},

{s: "B2. Gradients", t: "B2: partial derivatives, the chain rule, Ng's gradient and a numerical check (8 points)",
intu: String.raw`Four parts on the calculus behind every update. Part (a) is a gradient by hand on a function of two weights, with the contours and the descent arrow under your sliders. Part (b) is the chain rule on one squared error, the pattern every backward pass repeats. Part (c) writes Ng's gradient in matrix form and evaluates it on three points. Part (d) checks part (a) with finite differences and shows on a log scale why the central difference wins until rounding takes over.`,
eq: String.raw`\[ \nabla J(\boldsymbol\theta) = \frac1m X^\top\left(X\boldsymbol\theta - \mathbf y\right), \qquad \frac{f(w + \varepsilon) - f(w - \varepsilon)}{2\varepsilon} \]`,
sym: [[String.raw`\(\nabla f\)`, "the vector of partial derivatives"], [String.raw`\(e\)`, "the error, prediction minus target"], [String.raw`\(X\)`, "the design matrix with a ones column"], [String.raw`\(\varepsilon\)`, "the finite difference step"]],
how: ["Name the inner expression before differentiating.", "Multiply the local derivatives along the chain.", "Evaluate the errors first, then the sums.", "For a check, compute both differences and compare their errors."],
say: String.raw`At (1, 2) the gradient of f is (4, 2), the single-example gradients are 3 and 1, Ng's gradient at (0, 1) is minus 1.33 and minus 3.67, and the central difference gives 4 exactly where the forward difference gives 4.04.`,
num: String.raw`\(\nabla f(1, 2)\) = (<b>4, 2</b>), minimum at (<b>−0.5, 0</b>), \(\partial\ell/\partial w\) = <b>3</b>, \(\nabla J\) = (<b>−1.3333, −3.6667</b>), forward <b>4.04</b> against central <b>4.0000</b>.`,
note: String.raw`The sign of the error decides the sign of every gradient. Ng writes \(h - y\), so a model that predicts too low has a negative gradient and the step raises it. Keep that order on the exam.`,
r(fig, ctl) { board(fig, ctl, B2); }},

{s: "B3. Linear regression", t: "B3: least squares by hand on four readings (14 points)",
intu: String.raw`The largest problem, as on the midterm: four readings and the whole least squares chain. Build \(X\), solve the normal equation, compute and check the residuals, Ng's cost, \(R^2\), the MAE and the RMSE, predict inside and outside the data, and finish with the projection picture. In parts (b) to (d) the sliders move the line away from the solution. The cost rises, and the two residual sums leave zero, which is how you can check a fit on paper.`,
eq: String.raw`\[ X^\top X\,\boldsymbol\theta = X^\top\mathbf y, \qquad J = \frac{1}{2m}\sum_{i=1}^{m} e_i^2, \qquad R^2 = 1 - \frac{\mathrm{SSE}}{\mathrm{SST}} \]`,
sym: [["x and y", "1, 2, 4, 5 and 1, 3, 4, 6"], [String.raw`\(\boldsymbol\theta\)`, "intercept and slope"], [String.raw`\(e_i\)`, "the residual, prediction minus reading"], ["SST, SSR, SSE", "total, explained and residual sums of squares"]],
how: ["Write the four sums first: Σx, Σx², Σy, Σxy.", "Solve the 2 by 2 system with its determinant.", "Check that the residuals and x times the residuals sum to 0.", "Divide the SSE by 2m for Ng's cost.", "Say whether a prediction lies inside the data."],
say: String.raw`For these readings the normal equation gives theta equal to 0.2 and 1.1, the residuals are 0.3, minus 0.6, 0.6, minus 0.3, the cost is 0.1125, R squared is 0.931, and SST of 13 splits into 12.1 explained and 0.9 residual.`,
num: String.raw`\(\boldsymbol\theta\) = (<b>0.2, 1.1</b>), SSE <b>0.9</b>, \(J\) = <b>0.1125</b>, \(R^2\) = <b>0.931</b>, MAE <b>0.45</b>, RMSE <b>0.474</b>, \(h(3)\) = <b>3.5</b>, \(h(10)\) = <b>11.2</b>.`,
note: String.raw`The two residual checks in part (c) take thirty seconds and catch nearly every arithmetic slip in parts (a) and (b). Do them before computing the cost.`,
r(fig, ctl) { board(fig, ctl, B3); }},

{s: "B4. Gradient descent", t: "B4: two steps by hand, the stable learning rate and SGD (10 points)",
intu: String.raw`The same four readings, now fitted by gradient descent. Take two steps by hand, find the curvature matrix and the learning rate where descent stops working, and compare one stochastic step with the batch step. The picture shows the contours of \(J\) and your run. Push \(\alpha\) past 0.163 and the path zigzags out of the valley. Lower it and count how many steps the slow, dashed direction needs.`,
eq: String.raw`\[ \boldsymbol\theta := \boldsymbol\theta - \frac{\alpha}{m}X^\top\left(X\boldsymbol\theta - \mathbf y\right), \qquad 0 \lt \alpha \lt \frac{2}{\lambda_{\max}} \]`,
sym: [[String.raw`\(\alpha\)`, "the learning rate, 0.05 in the hand steps"], [String.raw`\(H\)`, "the curvature matrix, XᵀX over m"], [String.raw`\(\lambda_{\max}\)`, "its largest eigenvalue, 12.297"], [String.raw`\(1 - \alpha\lambda\)`, "the factor on the error per step"]],
how: ["Compute the errors at the current θ.", "Form the two sums and divide by m.", "Step against the gradient.", "For stability, find the eigenvalues of XᵀX over m.", "Count batches with a ceiling unless <code>drop_last</code> is set."],
say: String.raw`From zero with alpha 0.05 the first step goes to (0.175, 0.6625) and the cost falls from 7.75 to 1.25, the second to (0.2419, 0.9178), the run is stable below 0.163, and one SGD step on the third reading goes to (0.2, 0.8).`,
num: String.raw`step 1 (<b>0.175, 0.6625</b>), \(J\) <b>7.75</b> to <b>1.2462</b>, step 2 (<b>0.2419, 0.9178</b>), eigenvalues <b>12.297</b> and <b>0.2033</b>, limit <b>0.163</b>, about <b>451</b> steps per factor 100, SGD (<b>0.2, 0.8</b>), <b>160</b> updates.`,
note: String.raw`Two steps by hand is a common midterm part. Write a table with one row per reading and columns x, y, prediction, error and x times error, and the sums fall out of the last two columns.`,
r(fig, ctl) { board(fig, ctl, B4); }},

{s: "B5. Feature scaling", t: "B5: standardize, a new house, back to raw units, and the condition number (8 points)",
intu: String.raw`Four houses, two features on very different scales. Standardize them with training statistics, push a new house through the same scaler, turn a model trained on z back into dollars per square meter and per room, and see what the scales do to gradient descent. Move the new house and watch both prices agree. In part (d), the slider runs both versions at the same fraction of their own stability limit: the raw one needs thousands of steps, the standardized one almost none.`,
eq: String.raw`\[ z_j = \frac{x_j - \mu_j}{\sigma_j}, \qquad w_j = \frac{w'_j}{\sigma_j}, \qquad b = b' - \sum_j w_j\mu_j \]`,
sym: [[String.raw`\(\mu_j, \sigma_j\)`, "training mean and population standard deviation"], [String.raw`\(w'_j, b'\)`, "weights and bias learned on z"], [String.raw`\(w_j, b\)`, "the same model in raw units"], [String.raw`\(\kappa\)`, "condition number, largest over smallest curvature"]],
how: ["Compute μ and σ from the training rows only.", "Standardize the new house with those same numbers.", "Divide each z-weight by its σ.", "Fix the bias with the means.", "Check one prediction both ways."],
say: String.raw`With means 80 and 2 and standard deviations 20 and 1, the new house is z equal to (0.5, 2), the model is 70 plus 2 per square meter plus 10 per room, both routes price it at 290, and the condition number drops from 400 to 1.`,
num: String.raw`\(\mu\) = (<b>80, 2</b>), \(\sigma\) = (<b>20, 1</b>), \(\mathbf z\) = (<b>0.5, 2</b>), \(\hat y = 70 + 2x_1 + 10x_2\), price <b>290</b>, \(\kappa\) <b>400</b> to <b>1</b>, about <b>1,840</b> steps against one.`,
note: String.raw`With an uncentered ones column next to the raw features, the curvature matrix of this problem has a condition number of about 144,000. Centering alone fixes most of that, scaling fixes the rest.`,
r(fig, ctl) { board(fig, ctl, B5); }},

{s: "B6. Probability", t: "B6: two maximum likelihood fits, Bayes rule, and the loss that comes from the noise (10 points)",
intu: String.raw`Lecture 5 and HW7 in five parts. A Bernoulli fit from counts, a Gaussian fit from five readings, a sensor with false alarms through Bayes rule, the mean against the median when one reading is far off, and Huber's loss at a small and a large residual. Every part has a picture you can move: the log-likelihood with its peak, the bell over the readings, a thousand parts colored by what the sensor says, the two losses of a constant, and Huber against the square.`,
eq: String.raw`\[ \hat p = \frac{k}{m}, \qquad \hat\sigma^2 = \frac{1}{m}\sum_i (x_i - \bar x)^2, \qquad P(D\mid F) = \frac{P(F\mid D)P(D)}{P(F)} \]`,
sym: [[String.raw`\(\ell(p)\)`, "the log-likelihood"], [String.raw`\(\hat p, \hat\mu, \hat\sigma\)`, "maximum likelihood estimates"], ["D and F", "defective and flagged"], [String.raw`\(\delta\)`, "Huber's switch point"]],
how: ["Write the likelihood as a product, then take the log.", "Set the derivative to zero.", "Divide by m, not m − 1, for the MLE.", "For Bayes, compute P(flag) as a sum over both cases first.", "For Huber, pick the branch by comparing |e| with δ."],
say: String.raw`The Bernoulli MLE is 0.15 with log-likelihood minus 8.454, the Gaussian MLE is 4.1 and 0.2, a flagged part is defective with probability 0.279, the MSE picks the mean 4 and the MAE the median 2, and Huber at 3 is 2.5 instead of 4.5.`,
num: String.raw`\(\hat p\) = <b>0.15</b>, \(\ell\) = <b>−8.454</b> against <b>−8.622</b>, \(\hat\mu\) = <b>4.1</b>, \(\hat\sigma\) = <b>0.2</b>, posterior <b>0.279</b>, MSE <b>16.4</b> at 4, MAE <b>2.4</b> at 2, Huber <b>0.125</b> and <b>2.5</b>.`,
note: String.raw`The Bayes part is where intuition fails most often. Turn the probabilities into counts out of 1,000 parts and the answer is a fraction you can read off the picture.`,
r(fig, ctl) { board(fig, ctl, B6); }},

{s: "B7. Regularization", t: "B7: reading a validation table, the regularized cost, weight decay and cross-validation (8 points)",
intu: String.raw`Four parts on choosing a model. Part (a) gives a table of training and validation errors for polynomials of degree 0 to 8 on fresh data. Move the degree and watch the curve bend to the training points while the validation rings drift away. Parts (b) and (c) compute Ng's regularized cost and one weight decay step. Part (d) reads a five-fold cross-validation table and applies the one standard error rule.`,
eq: String.raw`\[ J = \frac{1}{2m}\sum_i e_i^2 + \frac{\lambda}{2m}\sum_{j=1}^{n} w_j^2, \qquad w_j := w_j\left(1 - \alpha\frac{\lambda}{m}\right) - \alpha\,\frac1m\sum_i e_i x_{ij} \]`,
sym: [["train, validation", "errors on the fitted rows and on held-out rows"], [String.raw`\(\lambda\)`, "the regularization strength"], [String.raw`\(1 - \alpha\lambda/m\)`, "the shrink factor per step"], ["SE", "standard error, sample SD over the square root of the fold count"]],
how: ["Compare both errors with the noise level, then with each other.", "Leave the bias out of the penalty.", "Shrink first, then take the data step.", "Average the folds, then add one SE to the best mean.", "Pick the simplest model under that bar."],
say: String.raw`Degree one underfits, degree eight overfits, degree two is chosen, the regularized cost is 0.3675, one decay step takes 1.5 to 1.43, and the one standard error rule moves the choice from lambda 0.1 to 0.3.`,
num: String.raw`degree 2 at <b>0.0244</b> and <b>0.0260</b>, degree 8 at <b>0</b> and <b>25.04</b>, \(J\) = <b>0.3675</b>, shrink <b>0.98</b>, \(w\) = <b>1.43</b>, CV means <b>0.300, 0.270, 0.276, 0.320</b>, bar <b>0.277</b>.`,
note: String.raw`A part that asks you to choose a model also expects one sentence on the test set: it is used once, after the choice, and never to make it.`,
r(fig, ctl) { board(fig, ctl, B7); }},

{s: "B8. Classes and PyTorch", t: "B8: inheritance with super(), tensor shapes, autograd and a training step (8 points)",
intu: String.raw`Lecture 4 in four parts. Trace a small class with a parent and super(), read the shapes of four tensor expressions, predict what autograd prints when backward runs twice, and count the parameters of a two-layer model before putting one training step in order. Step through the calls in (a), pick an expression in (b), press backward in (c) until the accumulation is obvious, and resize the network in (d).`,
eq: String.raw`\[ \text{params}(\texttt{Linear}(n_{\text{in}}, n_{\text{out}})) = n_{\text{in}}n_{\text{out}} + n_{\text{out}} \]`,
sym: [["super()", "calls the parent class's version of a method"], ["dim", "the axis that a reduction removes"], ["keepdim", "keeps that axis with size 1"], ["w.grad", "where backward adds the gradient"]],
how: ["Follow each call to the class where the method is defined.", "Write the shape of x before every reduction.", "Differentiate by hand, then remember that backward adds.", "Count weights as in times out, plus one bias per output.", "Clear the gradients before every backward."],
say: String.raw`The program prints 4.0 and the list 11.0, 7.0, the four shapes are (4,), (3, 1), (3, 4) and (3,), the gradient prints 8 then 16, and the 4, 3, 1 network has 19 parameters.`,
num: String.raw`output <b>4.0 [11.0, 7.0]</b>, shapes <b>(4,)</b>, <b>(3, 1)</b>, <b>(3, 4)</b>, <b>(3,)</b>, w.grad <b>8</b> then <b>16</b>, <b>19</b> parameters.`,
note: String.raw`These outputs were run in Python and PyTorch 2.15. When a part asks what a program prints, the format counts: tensor(8.) for a tensor, and 4.0 for a Python float division.`,
r(fig, ctl) { board(fig, ctl, B8); }},

{s: "Score sheet", t: "Add up the marks and see what to reopen",
intu: String.raw`The sliders start at the marks you gave yourself on the board problems. Set Part A to twice the number you got right. Bars turn teal at 70% of their points. Every section below that is listed with the lesson to reopen. The total is shown on the common 90, 80, 70, 60 scale as a rough guide only. The course's own scale may differ.`,
eq: String.raw`\[ \text{total} = \text{A} + \sum_{k=1}^{8}\text{B}k, \qquad \text{reopen if a section is below } 70\% \]`,
sym: [["A", "Part A points, 0 to 24"], ["B1 to B8", "board points from your self-marks"], ["70%", "the line below which a section needs work"]],
how: ["Set Part A from your quiz score.", "Check the board sliders against your marks.", "Reopen the lessons listed for each coral bar.", "Redo only those problems two days later.", "Write the date and the total at the top of your notes."],
say: String.raw`The score sheet adds Part A and the eight board problems out of one hundred and lists the lessons behind every section below seventy percent.`,
num: String.raw`Total out of <b>100</b>. A section needs work below <b>70%</b> of its points.`,
note: String.raw`A practice score is only useful if the marks are honest. Half marks are for a correct method with one slip, not for a correct final number without the steps.`,
r(fig, ctl) {
  const init = sc => { const m = MARK[sc.key]; if (m && m.some(v => v != null)) return m.reduce((s, v) => s + (v || 0), 0); return Math.round(0.7 * sc.pts); };
  ctl.innerHTML = SECS.map((sc, i) => sl("e1sc" + i, sc.short, 0, sc.pts, sc.key === "A" ? 2 : 1, sc.key === "A" ? 18 : init(sc))).join("") + `<div id="e1so"></div>`;
  const u = () => {
    const v = SECS.map((_, i) => +$("e1sc" + i).value);
    v.forEach((x, i) => { $("e1sc" + i + "v").textContent = x + " / " + SECS[i].pts; });
    const tot = v.reduce((a, b) => a + b, 0);
    const a = ML.axes(60, 20, 430, 220, { xmin: 0, xmax: 9, ymin: 0, ymax: 100, nx: 9, ny: 5, fx: () => "", fy: v => v + "%", yl: "share of points", grid: false });
    let s = a.s + ln(a.X(0), a.Y(70), a.X(9), a.Y(70), C.coral, 1.2, "6 4") + tx(a.X(9) + 6, a.Y(70) + 4, "70%", null);
    v.forEach((x, i) => { const p = 100 * x / SECS[i].pts, x0 = a.X(i + 0.15), w = a.X(i + 0.85) - x0; s += `<rect x="${x0}" y="${a.Y(p)}" width="${w}" height="${a.Y(0) - a.Y(p)}" rx="3" fill="${p >= 70 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, SECS[i].short, "middle"); });
    const band = tot >= 90 ? "A range" : tot >= 80 ? "B range" : tot >= 70 ? "C range" : tot >= 60 ? "D range" : "below 60";
    s += tx(530, 70, `total ${tot} / 100`, null, "th") + tx(530, 96, band, null, "t") + tx(530, 120, "on a 90, 80, 70, 60 scale", null);
    fig.innerHTML = svg(270, s);
    const weak = v.map((x, i) => [x, i]).filter(([x, i]) => x < 0.7 * SECS[i].pts);
    $("e1so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SECS[i].name}</b> at ${x} of ${SECS[i].pts}: reopen ${SECS[i].lessons}, then ${i === 0 ? "retake Part A" : "redo the problem with the solution hidden"}.</p>`).join("")}</div>` : `<p class="note">Every section is at 70% or above. Take Lesson 20's Part 4 test for speed, then move on to E2.</p>`;
  };
  SECS.forEach((_, i) => { $("e1sc" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: check every board answer in code",
intu: String.raw`Once the paper is done, let the agent recompute every board number and pin it in tests. Each assertion is one of your hand results, so a failing test means either the paper or the code is wrong, and finding out which is the best revision there is. The command asks for NumPy only, except one PyTorch test for B8, and forbids the explicit inverse where a solve will do.`,
eq: String.raw`\[ \texttt{b1\_linalg} \to \texttt{b3\_fit} \to \texttt{b4\_gd} \to \texttt{b6\_mle} \to \texttt{b7\_cv} \to \texttt{b8\_torch} \]`,
sym: [["b3 fit", "normal equation, residuals, J, R², SST split"], ["b4 gd", "two batch steps, eigenvalues of XᵀX over m"], ["b6 mle", "Bernoulli and Gaussian fits, Bayes, Huber"], ["b7 cv", "fold means, SE and the one SE choice"], ["b8 torch", "shapes, accumulated grad, parameter count"]],
how: ["Finish the paper first.", "Paste the command.", "Read every assert: is each number one of yours?", "Run pytest and resolve each failure on paper.", "Commit the script with its tests."],
say: String.raw`The agent recomputes the board problems with NumPy and PyTorch and pins each hand result in a pytest test, so a slip on paper or in code shows up as a failing assertion.`,
num: String.raw`Tests expect \(\mathbf v\) = (<b>1, 2</b>), \(\boldsymbol\theta\) = (<b>0.2, 1.1</b>), \(J\) = <b>0.1125</b>, step 2 (<b>0.2419, 0.9178</b>), limit <b>0.163</b>, \(\hat p\) = <b>0.15</b>, posterior <b>0.279</b>, one SE choice <b>0.3</b>, and w.grad <b>16</b>.`,
note: String.raw`Ask for tolerances that match what you wrote by hand, 1e-3 for four-digit answers. Tighter tests fail on your rounding, not on a mistake.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/e1_check.py and tests/test_e1.py that recompute my practice midterm answers. NumPy only, plus torch for the last test. Use np.linalg.solve, never np.linalg.inv, except where noted. Tests, with tolerance 1e-3: (B1) M = [[4, 2], [1, 3]] has det 10 and solve(M, [8, 7]) = (1, 2), S = [[5, 2], [2, 2]] has eigenvalues 1 and 6, the design matrix with columns 1, x, 3x - 1 for x = 0..3 has rank 2 and with x**2 rank 3 and det(X.T @ X) = 80. (B3) x = [1, 2, 4, 5], y = [1, 3, 4, 6]: theta = (0.2, 1.1), residuals sum to 0 and x times residuals sum to 0, J with 1/(2m) is 0.1125, R2 is 0.931, SST 13 = SSR 12.1 + SSE 0.9. (B4) two batch steps from zeros at alpha 0.05 give (0.175, 0.6625) then (0.2419, 0.9178), the eigenvalues of X.T @ X / m are 0.2033 and 12.297, 2 / lambda_max is 0.163, and a run at alpha 0.17 diverges. (B6) the Bernoulli MLE for 3 of 20 is 0.15 with log-likelihood -8.454, the Gaussian MLE of [4.1, 3.8, 4.4, 4.0, 4.2] is (4.1, 0.2) with ddof=0, the Bayes posterior is 0.279, Huber with delta 1 gives 0.125 and 2.5. (B7) the fold table for lambda 0.01, 0.1, 0.3, 1 gives means 0.300, 0.270, 0.276, 0.320 and the one standard error rule returns 0.3. (B8) in torch, arange(12.).reshape(3, 4) gives the shapes (4,), (3, 1), (3, 4), (3,), two backward calls on w**3 - 4*w at w = 2 leave w.grad = 16, and nn.Sequential(nn.Linear(4, 3), nn.ReLU(), nn.Linear(3, 1)) has 19 parameters. Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_e1.py", "......                                                   [100%]", "6 passed"],
    checks: ["solve is used for every linear system, inv appears nowhere", "J divides by 2m, so the test value is 0.1125, not 0.225", "the Gaussian σ uses ddof=0 and the test value is 0.2", "the one SE rule picks the largest λ under the bar, not the lowest mean", "the divergence test checks that the cost grows, not a fixed number", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`The practice midterm is 100 points: twelve short questions for 24 and eight board problems for 76. The board problems ask for the hand calculations the course is built on. In B1 a 2 by 2 inverse, an area, eigenvalues and a rank. In B2 a gradient, the chain rule and a numerical check. B3 is least squares on four readings, from the design matrix to R² and the projection picture, and B4 is two descent steps and the stable learning rate. B5 standardizes with training statistics and converts back to raw units. B6 asks for two maximum likelihood fits, Bayes rule, the mean against the median and Huber. B7 reads a validation table, a regularized cost, a decay step and a cross-validation table, and B8 traces a class, four tensor shapes, autograd and a training step. Mark every part honestly, reopen the lessons the score sheet lists, and redo those problems with the solutions hidden.`,
sheet: [[String.raw`\[ M^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a\end{bmatrix}, \qquad \det(S - \lambda I) = 0 \]`, "B1: the 2 by 2 inverse and the eigenvalue equation"],
  [String.raw`\[ \nabla J = \frac1m X^\top(X\boldsymbol\theta - \mathbf y), \qquad \frac{f(w + \varepsilon) - f(w - \varepsilon)}{2\varepsilon} \]`, "B2: Ng's gradient and the central difference"],
  [String.raw`\[ X^\top X\,\boldsymbol\theta = X^\top\mathbf y, \qquad J = \frac{1}{2m}\lVert X\boldsymbol\theta - \mathbf y\rVert^2, \qquad \mathrm{SST} = \mathrm{SSR} + \mathrm{SSE} \]`, "B3: least squares, Ng's cost and the split of the variance"],
  [String.raw`\[ \boldsymbol\theta := \boldsymbol\theta - \alpha\nabla J, \qquad 0 \lt \alpha \lt \frac{2}{\lambda_{\max}(X^\top X/m)} \]`, "B4: the update and its stability limit"],
  [String.raw`\[ z = \frac{x - \mu_{\text{train}}}{\sigma_{\text{train}}}, \qquad w = \frac{w'}{\sigma}, \qquad b = b' - \sum_j w_j\mu_j \]`, "B5: standardize and convert back"],
  [String.raw`\[ \hat p = \frac{k}{m}, \qquad \hat\sigma^2 = \frac{\mathrm{SSE}}{m}, \qquad P(D\mid F) = \frac{P(F\mid D)P(D)}{P(F)} \]`, "B6: maximum likelihood and Bayes rule"],
  [String.raw`\[ J = \frac{1}{2m}\sum_i e_i^2 + \frac{\lambda}{2m}\sum_j w_j^2, \qquad \mathrm{SE} = \frac{s}{\sqrt k} \]`, "B7: the regularized cost and the standard error of k folds"],
  [String.raw`\[ \text{params} = (n_{\text{in}} + 1)\,n_{\text{out}} \ \text{per Linear layer} \]`, "B8: counting parameters"]],
sources: ["AME 5970 Lectures 1 to 5 and the midterm review, topic order (the slide and note PDFs and the midterm examples were not available in this session, so the order follows the syllabus weeks 1 to 7 and this shelf's records of the lectures)", "AME 5970 HW1 and HW2 solutions docs (names, lists, views, broadcasting, axis reductions), the model for Part A", "AME 5970 HW3 solutions doc (cost by hand, gradient, normal equation, pinv on a redundant column), the model for B1(e), B3 and B4", "AME 5970 HW4 solutions doc (tensors, autograd, nn.Module, parameter counts, the training loop), the model for B8", "AME 5970 HW5 and HW6 solutions docs (learning rate stability, standardization with training statistics, back to raw units), the model for B4(c) and B5", "AME 5970 HW7 questions and solutions docs (Bernoulli and Gaussian likelihood, Bayes, Huber, under and overfitting), the model for B6 and B7(a)", "Lessons 1 to 23 of this shelf, and Lesson 20's board problem as the pattern for the board format", "Andrew Ng, Machine Learning Specialization, course 1, weeks 1 to 3 (cost, gradient descent, feature scaling, regularization), and course 2, week 3 (bias and variance, cross-validation)", "Andrew Ng, CS229 lecture notes, Part I (least squares, the normal equations, the probabilistic interpretation) and the notes on regularization and model selection"]
});
})();
