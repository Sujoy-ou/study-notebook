(function () {
/* ML shelf, Part 10, E3: full mock final. A 100-point mock final over the whole AME 5970 course (Parts 1 to 8 of this shelf: Python and NumPy, linear algebra, linear regression and gradient descent, scaling, likelihood and losses, regularization, PyTorch, classification and its evaluation, neural networks and backpropagation, CNNs and residual networks, RNNs and gated units, attention and transformers), weighted toward the recurring topics of the course's final practice exams as listed in course/README_course_map.md. Twelve short questions (Part A, 24 points) and eight board problems with worked solutions revealed one line at a time (Part B, 76 points), a score sheet that collects the self-marks, and the agent card. The board engine is E1's and E2's. Follows HW1 to HW10 and their solutions docs, with Andrew Ng's Machine Learning Specialization and Deep Learning Specialization as the spine and CS229 for the likelihood. Every number was computed with NumPy and checked with PyTorch 2.15 on the CPU. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const fe = (v, d) => { if (!isFinite(v)) return "inf"; const a = Math.abs(v); return a !== 0 && (a < 1e-3 || a >= 1e5) ? v.toExponential(d == null ? 2 : d) : f(v, d == null ? 4 : d); };
const dot = (x, y, r, col, hollow) => hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--bg)" stroke="${col}" stroke-width="1.8"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const LET = "abcdefgh";
const ln = (x1, y1, x2, y2, col, w, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w || 1.5}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const clip = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
const rect = (x, y, w, h, fill, stroke, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1.2"${op != null ? ` opacity="${op}"` : ""}/>`;
const sig = z => 1 / (1 + Math.exp(-z));
const th = Math.tanh;
const softmax = z => { const m = Math.max(...z.filter(v => isFinite(v))), e = z.map(v => isFinite(v) ? Math.exp(v - m) : 0), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
const vbar = (x, y0, h, w, col, op) => `<rect x="${x}" y="${h >= 0 ? y0 - h : y0}" width="${w}" height="${Math.abs(h)}" rx="2" fill="${col}" opacity="${op == null ? 0.85 : op}"/>`;

/* ---------- the exam: sections, points and the lessons behind them ---------- */
const SECS = [
  { key: "A", name: "Part A. Short questions", short: "A", pts: 24, lessons: "Lessons 1 to 42", topics: ["leakage", "list aliasing", "broadcasting", "learning rate", "noise and loss", "variance", "accumulation", "eval and no_grad", "logit", "Conv2d stride", "LSTM memory", "scaling by √d"] },
  { key: "B1", name: "B1. Linear regression and gradient descent", short: "B1", pts: 10, lessons: "Lessons 12, 13 and 15 to 17", topics: ["normal equation", "residuals and R²", "one gradient step", "stability limit", "standardization"] },
  { key: "B2", name: "B2. Likelihood, losses and regularization", short: "B2", pts: 8, lessons: "Lessons 14, 18 and 19", topics: ["Bernoulli MLE", "mean or median", "outliers", "ridge", "bias or variance"] },
  { key: "B3", name: "B3. Reading PyTorch code", short: "B3", pts: 8, lessons: "Lessons 21 to 26", topics: ["shapes", "reductions", "autograd", "detach", "zero_grad", "state_dict"] },
  { key: "B4", name: "B4. A softmax classifier and its evaluation", short: "B4", pts: 10, lessons: "Lessons 29 to 31", topics: ["softmax", "cross-entropy", "p − e_y", "confusion matrix", "macro-F1", "cost threshold", "AUC"] },
  { key: "B5", name: "B5. A two-layer classifier by hand", short: "B5", pts: 14, lessons: "Lessons 32 to 34", topics: ["parameter count", "forward pass", "BCEWithLogitsLoss", "double sigmoid", "backprop", "dead unit", "SGD step"] },
  { key: "B6", name: "B6. Convolutional and residual networks", short: "B6", pts: 10, lessons: "Lessons 36 and 37", topics: ["stride 2 by hand", "shape chain", "parameter count", "pooling", "receptive field", "shortcut"] },
  { key: "B7", name: "B7. Recurrent networks and gates", short: "B7", pts: 8, lessons: "Lessons 39 and 40", topics: ["forward through time", "BPTT", "GRU step", "gate route", "nn.GRU shapes", "clipping"] },
  { key: "B8", name: "B8. Attention and transformers", short: "B8", pts: 8, lessons: "Lessons 41 and 42", topics: ["self-attention", "√d scaling", "causal mask", "multi-head count", "encoder layer", "positions"] }
];
const MARK = {};

/* ---------- the board engine (the same as E1's and E2's) ----------
   P = { key, parts: [{t, pts, q, a: [lines], ans}], st: () => state, pic(k, st, shown) -> {h, s, html}, ctl(k, st) -> html, bind(k, st, redraw) }
   Solutions open one line at a time, the way they would be written on the board. Self-marks go into MARK for the score sheet. */
function board(fig, ctl, P) {
  const id = "e3" + P.key.toLowerCase(), st = P.st ? P.st() : {};
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
/* a slider bound to st[key], with its live value */
const bindSl = (st, pairs, redraw, fmt) => pairs.forEach(([id, key, d]) => {
  const el = $(id); if (!el) return;
  const show = () => { $(id + "v").textContent = fmt && fmt[key] ? fmt[key](st[key]) : f(st[key], d == null ? 2 : d); };
  el.oninput = () => { st[key] = +el.value; show(); redraw(); }; show();
});
/* a button row bound to st[key] inside the board's control box */
const bindBt = (box, attr, st, key, redraw) => {
  const u = () => pick($(box), attr, st[key]);
  $(box).querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => { st[key] = isNaN(+b.dataset[attr]) ? b.dataset[attr] : +b.dataset[attr]; u(); redraw(); });
  u();
};

/* ====================================================================
   B1. Linear regression and gradient descent: x = (0, 1, 2, 3), y = (2, 2, 4, 5)
   ==================================================================== */
const RX = [0, 1, 2, 3], RY = [2, 2, 4, 5];
const rJ = (t0, t1) => RX.reduce((s, x, i) => s + (t0 + t1 * x - RY[i]) ** 2, 0) / 8;
const rG = (t0, t1) => { let g0 = 0, g1 = 0; RX.forEach((x, i) => { const e = t0 + t1 * x - RY[i]; g0 += e; g1 += e * x; }); return [g0 / 4, g1 / 4]; };
const rGD = (al, n) => { const P = [[0, 0]]; let t = [0, 0]; for (let i = 0; i < n; i++) { const g = rG(t[0], t[1]); t = [t[0] - al * g[0], t[1] - al * g[1]]; P.push(t); } return P; };
const B1 = {
  key: "B1",
  st: () => ({ t0: 1, t1: 1.5, view: 0, al: 0.1, n: 1, sc: 0 }),
  parts: [
    { t: "The normal equation by hand", pts: 3, q: String.raw`Four measurements: \(x = (0, 1, 2, 3)\) and \(y = (2, 2, 4, 5)\). Fit \(h_\theta(x) = \theta_0 + \theta_1 x\) by the normal equation. Write the design matrix, \(X^\top X\), \(X^\top\mathbf y\), the inverse, and \(\boldsymbol\theta\).`,
      a: [String.raw`The design matrix has a column of ones and a column of \(x\): rows \((1, 0), (1, 1), (1, 2), (1, 3)\), shape 4 by 2.`,
        String.raw`\(X^\top X = \begin{bmatrix} m & \sum x \\ \sum x & \sum x^2\end{bmatrix} = \begin{bmatrix} 4 & 6 \\ 6 & 14\end{bmatrix}\) and \(X^\top\mathbf y = \begin{bmatrix}\sum y \\ \sum xy\end{bmatrix} = \begin{bmatrix} 13 \\ 0 + 2 + 8 + 15\end{bmatrix} = \begin{bmatrix} 13 \\ 25\end{bmatrix}\).`,
        String.raw`\(\det = 4\cdot 14 - 6\cdot 6 = 20\), so \((X^\top X)^{-1} = \frac{1}{20}\begin{bmatrix} 14 & -6 \\ -6 & 4\end{bmatrix}\).`,
        String.raw`\(\boldsymbol\theta = \frac{1}{20}\begin{bmatrix} 14\cdot 13 - 6\cdot 25 \\ -6\cdot 13 + 4\cdot 25\end{bmatrix} = \frac{1}{20}\begin{bmatrix} 32 \\ 22\end{bmatrix} = \begin{bmatrix} 1.6 \\ 1.1\end{bmatrix}\).`],
      ans: String.raw`\(X^\top X = \begin{bmatrix} 4 & 6 \\ 6 & 14\end{bmatrix}\), \(X^\top\mathbf y = (13, 25)\), \(\boldsymbol\theta = (1.6, 1.1)\), so \(h(x) = 1.6 + 1.1x\).` },
    { t: "Residuals, cost and R²", pts: 2, q: String.raw`For the fitted line, list the predictions and the residuals \(y - \hat y\). Check the two sums the normal equation forces to zero. Compute \(J = \frac{1}{2m}\sum(\hat y - y)^2\), the RMSE and \(R^2\).`,
      a: [String.raw`Predictions \(1.6, 2.7, 3.8, 4.9\). Residuals \(0.4, -0.7, 0.2, 0.1\).`,
        String.raw`\(\sum r = 0\) and \(\sum r x = 0 - 0.7 + 0.4 + 0.3 = 0\). These are the two rows of \(X^\top\mathbf r = \mathbf 0\): the residual is orthogonal to both columns.`,
        String.raw`\(\text{SSE} = 0.16 + 0.49 + 0.04 + 0.01 = 0.70\), so \(J = 0.70/8 = 0.0875\) and \(\text{RMSE} = \sqrt{0.70/4} = 0.418\).`,
        String.raw`\(\bar y = 3.25\), \(\text{SST} = 1.5625 + 1.5625 + 0.5625 + 3.0625 = 6.75\), so \(R^2 = 1 - 0.70/6.75 = 0.896\).`],
      ans: String.raw`Residuals \(0.4, -0.7, 0.2, 0.1\), both sums 0, \(J = 0.0875\), RMSE 0.418, \(R^2 = 0.896\).` },
    { t: "One gradient descent step and the stability limit", pts: 3, q: String.raw`Start gradient descent at \(\boldsymbol\theta = (0, 0)\) with \(\alpha = 0.1\). Compute \(J\), the gradient, \(\boldsymbol\theta\) after one step and the new \(J\). The matrix \(\frac1m X^\top X\) has eigenvalues 4.2026 and 0.2974. Which learning rates converge?`,
      a: [String.raw`At \((0, 0)\) every prediction is 0, so \(J = \frac18(4 + 4 + 16 + 25) = 6.125\).`,
        String.raw`\(\nabla J = \frac1m X^\top(X\boldsymbol\theta - \mathbf y) = -\frac14(13, 25) = (-3.25, -6.25)\).`,
        String.raw`\(\boldsymbol\theta := (0, 0) - 0.1\,(-3.25, -6.25) = (0.325, 0.625)\), and \(J = 2.2036\). Both parameters are updated from the same old gradient.`,
        String.raw`The cost is a quadratic bowl with curvature \(H = \frac1m X^\top X\). Gradient descent converges when \(\alpha \lt 2/\lambda_{\max} = 2/4.2026 = 0.476\). At \(\alpha = 0.5\) the cost grows every step.`],
      ans: String.raw`\(J = 6.125\), gradient \((-3.25, -6.25)\), one step to \((0.325, 0.625)\) with \(J = 2.2036\). Converges for \(\alpha \lt 0.476\).` },
    { t: "Standardize the feature", pts: 2, q: String.raw`Standardize \(x\) with its mean and population standard deviation. Fit again, convert \(\boldsymbol\theta\) back to raw units and predict at \(x = 4\) both ways. What happens to the condition number \(\kappa = \lambda_{\max}/\lambda_{\min}\)?`,
      a: [String.raw`\(\mu = 1.5\), \(\sigma = \sqrt{1.25} = 1.118\), so \(z = (-1.342, -0.447, 0.447, 1.342)\).`,
        String.raw`With a centered, unit-variance feature, \(\frac1m Z^\top Z = I\). The fit splits: \(\theta_0' = \bar y = 3.25\) and \(\theta_1' = \frac1m\sum zy = 1.2298\).`,
        String.raw`Back to raw units: \(\theta_1 = 1.2298/1.118 = 1.1\) and \(\theta_0 = 3.25 - 1.1\cdot 1.5 = 1.6\). The same line, so at \(x = 4\) both give \(1.6 + 4.4 = 6.0\), and in scaled units \(3.25 + 1.2298\cdot 2.236 = 6.0\).`,
        String.raw`\(\kappa\) falls from \(4.2026/0.2974 = 14.1\) to 1. Raw, at \(\alpha = 1/\lambda_{\max}\) the slow direction shrinks by \(0.929\) per step, about 63 steps per factor 100. Scaled, one step at \(\alpha = 1\) lands on the minimum.`],
      ans: String.raw`\(\theta' = (3.25, 1.2298)\), back to \((1.6, 1.1)\), \(\hat y(4) = 6.0\) both ways, \(\kappa\) from 14.1 to 1.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e3rt0", "θ₀", -1, 4, 0.05, st.t0) + sl("e3rt1", "θ₁", -0.5, 2.5, 0.05, st.t1) + `<div class="row"><button id="e3rfit">Set to the normal equation</button></div>`;
    if (k === 1) return btns([[0, "residuals"], [1, "SST = SSR + SSE"]], "e3rv");
    if (k === 2) return sl("e3ral", "learning rate α", 0.02, 0.52, 0.01, st.al) + sl("e3rn", "steps", 1, 40, 1, st.n);
    return btns([[0, "raw x"], [1, "standardized z"]], "e3rsc");
  },
  bind(k, st, redraw) {
    if (k === 0) { bindSl(st, [["e3rt0", "t0", 2], ["e3rt1", "t1", 2]], redraw); $("e3rfit").onclick = () => { if (!$("e3rt0")) return; st.t0 = 1.6; st.t1 = 1.1; $("e3rt0").value = 1.6; $("e3rt1").value = 1.1; $("e3rt0v").textContent = "1.60"; $("e3rt1v").textContent = "1.10"; redraw(); }; }
    if (k === 1) bindBt("e3b1x", "e3rv", st, "view", redraw);
    if (k === 2) bindSl(st, [["e3ral", "al", 2], ["e3rn", "n", 0]], redraw);
    if (k === 3) bindBt("e3b1x", "e3rsc", st, "sc", redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const a = ML.axes(50, 14, 320, 250, { xmin: -0.5, xmax: 4, ymin: 0, ymax: 7, nx: 9, ny: 7, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "y" });
      s += clip("e3cpr0", 50, 14, 320, 250) + a.s + `<g clip-path="url(#e3cpr0)">` + ln(a.X(-0.5), a.Y(st.t0 - 0.5 * st.t1), a.X(4), a.Y(st.t0 + 4 * st.t1), C.blue, 2.2);
      RX.forEach((x, i) => { s += ln(a.X(x), a.Y(RY[i]), a.X(x), a.Y(st.t0 + st.t1 * x), C.coral, 1.4, "3 3"); });
      s += `</g>`; RX.forEach((x, i) => { s += dot(a.X(x), a.Y(RY[i]), 5, C.teal); });
      const J = rJ(st.t0, st.t1);
      s += tx(400, 34, `h(x) = ${f(st.t0, 2)} + ${f(st.t1, 2)} x`, null, "th") + tx(400, 62, `J(θ) = ${f(J, 4)}`, null, "t") + tx(400, 86, "best J = 0.0875 at (1.6, 1.1)", null);
      s += tx(400, 120, "XᵀX = [[4, 6], [6, 14]]", null, "t") + tx(400, 144, "Xᵀy = (13, 25), det 20", null, "t") + tx(400, 178, "coral dashes: the residuals", null) + tx(400, 196, J < 0.08751 ? "you are at the minimum" : "move both sliders to lower J", null);
      return { h: 310, s };
    }
    if (k === 1) {
      const yh = RX.map(x => 1.6 + 1.1 * x), r = RY.map((y, i) => y - yh[i]);
      if (!st.view) {
        const a = ML.axes(60, 20, 300, 220, { xmin: -0.5, xmax: 3.5, ymin: -1, ymax: 1, nx: 4, ny: 4, fx: () => "", fy: v => f(v, 1), xl: "x", yl: "residual y − ŷ" });
        s += a.s + ln(a.X(-0.5), a.Y(0), a.X(3.5), a.Y(0), C.gray, 1);
        r.forEach((v, i) => { s += vbar(a.X(RX[i]) - 14, a.Y(0), a.Y(0) - a.Y(v), 28, v >= 0 ? C.teal : C.coral) + tx(a.X(RX[i]), v >= 0 ? a.Y(v) - 6 : a.Y(v) + 16, f(v, 1), "middle") + tx(a.X(RX[i]), a.Y(-1) + 16, "x = " + RX[i], "middle"); });
        s += tx(400, 40, "Σ r = 0.4 − 0.7 + 0.2 + 0.1 = 0", null, "t") + tx(400, 66, "Σ r·x = 0 − 0.7 + 0.4 + 0.3 = 0", null, "t") + tx(400, 100, "SSE = 0.70, J = 0.70 / 8 = 0.0875", null, "t") + tx(400, 124, "RMSE = √(0.70 / 4) = 0.418", null, "t") + tx(400, 148, "MAE = 1.4 / 4 = 0.35", null, "t");
        return { h: 290, s };
      }
      const bars = [["SST", 6.75, C.gray], ["SSR", 6.05, C.blue], ["SSE", 0.7, C.coral]];
      bars.forEach(([n, v, c], i) => { s += vbar(80 + i * 110, 250, v * 32, 70, c) + tx(115 + i * 110, 268, n, "middle", "t") + tx(115 + i * 110, 244 - v * 32, f(v, 2), "middle"); });
      s += tx(420, 50, "ȳ = 3.25", null, "t") + tx(420, 76, "SST = Σ (y − ȳ)² = 6.75", null, "t") + tx(420, 100, "SSR = Σ (ŷ − ȳ)² = 6.05", null, "t") + tx(420, 124, "SSE = Σ (y − ŷ)² = 0.70", null, "t") + tx(420, 158, "R² = 1 − 0.70 / 6.75 = 0.896", null, "th") + tx(420, 186, "the split holds because the", null) + tx(420, 204, "residual is orthogonal to ŷ − ȳ", null);
      return { h: 290, s };
    }
    if (k === 2) {
      const a = ML.axes(50, 14, 300, 270, { xmin: -1, xmax: 4, ymin: -1, ymax: 3, nx: 5, ny: 4, fx: v => v, fy: v => v, xl: "θ₀", yl: "θ₁" });
      s += clip("e3cpr2", 50, 14, 300, 270) + a.s + `<g clip-path="url(#e3cpr2)">`;
      [0.1, 0.4, 1, 2.5, 6].forEach(c => { const P = []; for (let i = 0; i <= 120; i++) { const ang = 2 * Math.PI * i / 120; /* level set of the quadratic around (1.6, 1.1) */ const d = [Math.cos(ang), Math.sin(ang)], q = (d[0] ** 2 + 3 * d[0] * d[1] + 3.5 * d[1] ** 2) / 2, rr = Math.sqrt(Math.max(0, c - 0.0875) / q); P.push([a.X(1.6 + rr * d[0]), a.Y(1.1 + rr * d[1])]); } s += ML.path(P, "var(--line)", 1.2); });
      const P = rGD(st.al, st.n), end = P[P.length - 1];
      s += ML.path(P.map(p => [a.X(Math.max(-50, Math.min(50, p[0]))), a.Y(Math.max(-50, Math.min(50, p[1])))]), C.coral, 1.8) + P.slice(0, 41).map(p => Math.abs(p[0]) < 50 && Math.abs(p[1]) < 50 ? dot(a.X(p[0]), a.Y(p[1]), 3, C.coral) : "").join("") + `</g>` + dot(a.X(1.6), a.Y(1.1), 5, C.teal);
      const J = rJ(end[0], end[1]);
      s += tx(380, 34, `α = ${f(st.al, 2)}, ${st.n} step${st.n > 1 ? "s" : ""}`, null, "th") + tx(380, 60, `θ = (${fe(end[0], 3)}, ${fe(end[1], 3)})`, null, "t") + tx(380, 84, `J = ${fe(J, 4)}`, null, "t");
      s += tx(380, 116, "step 1 from (0, 0): gradient (−3.25, −6.25)", null) + tx(380, 134, `θ₁ = (${f(st.al * 3.25, 3)}, ${f(st.al * 6.25, 3)})`, null) + tx(380, 162, "limit 2 / 4.2026 = 0.476", null, "t") + tx(380, 186, st.al < 0.476 ? "below the limit: it converges" : "above the limit: it diverges", null, "th") + tx(380, 214, "teal dot: the normal equation answer", null);
      return { h: 330, s };
    }
    const sc = st.sc, a = ML.axes(50, 14, 280, 270, { xmin: -2, xmax: 2, ymin: -2, ymax: 2, nx: 4, ny: 4, fx: v => v, fy: v => v, xl: sc ? "θ₀′ − 3.25" : "θ₀ − 1.6", yl: sc ? "θ₁′ − 1.2298" : "θ₁ − 1.1" });
    s += clip("e3cpr3", 50, 14, 280, 270) + a.s + `<g clip-path="url(#e3cpr3)">`;
    [0.05, 0.2, 0.5, 1].forEach(c => { const P = []; for (let i = 0; i <= 120; i++) { const ang = 2 * Math.PI * i / 120, d = [Math.cos(ang), Math.sin(ang)], q = sc ? 0.5 : (d[0] ** 2 + 3 * d[0] * d[1] + 3.5 * d[1] ** 2) / 2, rr = Math.sqrt(c / q); P.push([a.X(rr * d[0]), a.Y(rr * d[1])]); } s += ML.path(P, sc ? C.teal : C.blue, 1.4); });
    s += `</g>`;
    s += tx(360, 34, sc ? "z = (x − 1.5) / 1.118" : "raw x = 0, 1, 2, 3", null, "th") + tx(360, 62, sc ? "H = (1/m) ZᵀZ = I" : "H = [[1, 1.5], [1.5, 3.5]]", null, "t") + tx(360, 86, sc ? "eigenvalues 1 and 1, κ = 1" : "eigenvalues 4.2026, 0.2974", null, "t") + tx(360, 110, sc ? "θ′ = (3.25, 1.2298)" : "κ = 14.1, tilted narrow valley", null, "t");
    s += tx(360, 144, "both fits give h(4) = 6.0", null, "t") + tx(360, 172, sc ? "one step at α = 1 reaches the minimum" : "about 63 steps per factor 100 at α = 1/λmax", null) + tx(360, 190, "contours of J around the minimum", null);
    return { h: 330, s };
  }
};

/* ====================================================================
   B2. Likelihood, losses and regularization
   ==================================================================== */
const BK = 7, BN = 25, BD = [1, 4, 5, 6, 19], RXX = [1, 2, 3], RYY = [2, 3, 7];
const bll = p => BK * Math.log(p) + (BN - BK) * Math.log(1 - p);
const B2 = {
  key: "B2",
  st: () => ({ p: 0.4, c: 7, out: 19, lam: 2, mdl: 0 }),
  parts: [
    { t: "A Bernoulli maximum likelihood", pts: 2, q: String.raw`An inspector finds 7 defective parts in a sample of 25. Model each part as Bernoulli with defect probability \(p\). Write the log-likelihood, find \(\hat p\) by setting its derivative to zero, and compare \(\ell(\hat p)\) with \(\ell(0.3)\).`,
      a: [String.raw`\(L(p) = p^{7}(1 - p)^{18}\), so \(\ell(p) = 7\ln p + 18\ln(1 - p)\). The log turns the product into a sum.`,
        String.raw`\(\ell'(p) = \frac{7}{p} - \frac{18}{1 - p} = 0\) gives \(7(1 - p) = 18p\), so \(\hat p = 7/25 = 0.28\).`,
        String.raw`\(\ell(0.28) = 7\ln 0.28 + 18\ln 0.72 = -8.911 - 5.913 = -14.824\). \(\ell(0.3) = -14.848\), lower, as it must be.`,
        String.raw`Minimizing \(-\ell(p)/25\) is the binary cross-entropy of a model that always says \(p\). This is the loss of logistic regression.`],
      ans: String.raw`\(\ell(p) = 7\ln p + 18\ln(1 - p)\), \(\hat p = 0.28\), \(\ell(\hat p) = -14.824 \gt \ell(0.3) = -14.848\).` },
    { t: "Gaussian or Laplace noise, mean or median", pts: 2, q: String.raw`Five readings of one quantity: 1, 4, 5, 6, 19. Under Gaussian noise the maximum likelihood estimate minimizes the MSE, under Laplace noise the MAE. Give each estimate and its loss. What happens to each if the 19 is misread as 39?`,
      a: [String.raw`Gaussian: minimize \(\frac1n\sum(y_i - c)^2\). The derivative \(-\frac2n\sum(y_i - c)\) is zero at the mean, \(c = 35/5 = 7\), with MSE \((36 + 9 + 4 + 1 + 144)/5 = 38.8\).`,
        String.raw`Laplace: minimize \(\frac1n\sum|y_i - c|\). The slope counts readings above minus readings below, zero at the median, \(c = 5\), with MAE \((4 + 1 + 0 + 1 + 14)/5 = 4\).`,
        String.raw`With 39 instead of 19 the mean moves to 11, while the median stays at 5. In the MSE an outlier pulls with a force proportional to its residual, in the MAE with a force of 1.`,
        String.raw`The Gaussian fit also gives \(\hat\sigma = \sqrt{38.8} = 6.23\), inflated by the one bad reading. Huber loss with \(\delta = 1\) also lands on 5 here.`],
      ans: String.raw`Gaussian: mean 7 with MSE 38.8. Laplace: median 5 with MAE 4. With 39 the mean goes to 11 and the median stays 5.` },
    { t: "Ridge regression in one weight", pts: 2, q: String.raw`Fit \(\hat y = wx\) (no intercept) to \(x = (1, 2, 3)\), \(y = (2, 3, 7)\) with \(J(w) = \frac{1}{2m}\left[\sum(wx_i - y_i)^2 + \lambda w^2\right]\). Find \(w\) for \(\lambda = 0\) and \(\lambda = 2\). In gradient descent with \(\alpha = 0.1\), \(\lambda = 3\), \(m = 3\), by what factor does the penalty shrink \(w\) each step?`,
      a: [String.raw`\(J'(w) = \frac1m\left[\sum x_i(wx_i - y_i) + \lambda w\right] = 0\) gives \(w = \frac{\sum x_iy_i}{\sum x_i^2 + \lambda}\).`,
        String.raw`\(\sum xy = 2 + 6 + 21 = 29\), \(\sum x^2 = 14\). So \(w = 29/14 = 2.071\) at \(\lambda = 0\) and \(29/16 = 1.8125\) at \(\lambda = 2\).`,
        String.raw`The update is \(w := w\left(1 - \alpha\frac{\lambda}{m}\right) - \alpha\frac1m\sum x_i(wx_i - y_i)\). The factor is \(1 - 0.1\cdot 3/3 = 0.9\), weight decay.`,
        String.raw`As \(\lambda\) grows, \(w\) shrinks toward 0 but never reaches it. That is L2. An L1 penalty can set a weight to exactly 0.`],
      ans: String.raw`\(w = 2.071\) at \(\lambda = 0\), \(w = 1.8125\) at \(\lambda = 2\), shrink factor 0.9 per step.` },
    { t: "Bias or variance, and choosing λ", pts: 2, q: String.raw`A human expert reaches error 1.0. Model A has training error 2.1 and validation error 2.3. Model B has training error 0.4 and validation error 3.0. Diagnose each and name one fix. Then for ridge with \(\lambda \in \{0, 0.1, 1, 10\}\) the validation errors are 3.0, 1.4, 1.2, 2.6. Which \(\lambda\), and when is the test set used?`,
      a: [String.raw`A: the gap to the baseline is \(2.1 - 1.0 = 1.1\), the train to validation gap only 0.2. High bias. Fix: a larger model, more features, less regularization.`,
        String.raw`B: the gap to the baseline is small (\(-0.6\), it even beats it on training data), the train to validation gap is 2.6. High variance. Fix: more data, regularization, early stopping.`,
        String.raw`Choose \(\lambda = 1\), the lowest validation error 1.2. \(\lambda = 0\) overfits and \(\lambda = 10\) underfits.`,
        String.raw`Refit with \(\lambda = 1\) and report the test error once at the end. Choosing on the test set would make it optimistic.`],
      ans: String.raw`A high bias, B high variance. Choose \(\lambda = 1\) on validation, then test once.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e3bp", "p", 0.02, 0.8, 0.01, st.p);
    if (k === 1) return sl("e3bc", "constant c", 0, 20, 0.1, st.c) + sl("e3bo", "last reading", 6, 40, 1, st.out);
    if (k === 2) return sl("e3bl", "λ", 0, 30, 0.5, st.lam);
    return btns([[0, "model A"], [1, "model B"], [2, "ridge λ sweep"]], "e3bm");
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e3bp", "p", 2]], redraw);
    if (k === 1) bindSl(st, [["e3bc", "c", 1], ["e3bo", "out", 0]], redraw);
    if (k === 2) bindSl(st, [["e3bl", "lam", 1]], redraw);
    if (k === 3) bindBt("e3b2x", "e3bm", st, "mdl", redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const a = ML.axes(60, 14, 320, 250, { xmin: 0, xmax: 0.8, ymin: -30, ymax: -14, nx: 8, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "p", yl: "log-likelihood ℓ(p)" });
      const P = []; for (let i = 1; i <= 160; i++) { const p = 0.8 * i / 160; P.push([a.X(p), a.Y(Math.max(-30, bll(p)))]); }
      s += clip("e3cpb0", 60, 14, 320, 250) + a.s + `<g clip-path="url(#e3cpb0)">` + ML.path(P, C.blue, 2.2) + ln(a.X(0.28), a.Y(-30), a.X(0.28), a.Y(-14), C.teal, 1.2, "5 4") + `</g>` + dot(a.X(st.p), a.Y(Math.max(-30, bll(st.p))), 6, C.coral);
      s += tx(410, 34, `p = ${f(st.p, 2)}`, null, "th") + tx(410, 60, `ℓ = 7 ln p + 18 ln(1 − p)`, null, "t") + tx(410, 84, `   = ${f(bll(st.p), 3)}`, null, "t") + tx(410, 116, `slope 7/p − 18/(1 − p) = ${f(BK / st.p - 18 / (1 - st.p), 2)}`, null, "t");
      s += tx(410, 150, "teal line: p̂ = 7/25 = 0.28", null) + tx(410, 168, "ℓ(0.28) = −14.824, the top", null);
      return { h: 310, s };
    }
    if (k === 1) {
      const D = [1, 4, 5, 6, st.out], mse = c => D.reduce((s, y) => s + (y - c) ** 2, 0) / 5, mae = c => D.reduce((s, y) => s + Math.abs(y - c), 0) / 5;
      const mean = D.reduce((a, b) => a + b, 0) / 5, med = [...D].sort((a, b) => a - b)[2];
      const a = ML.axes(60, 14, 320, 210, { xmin: 0, xmax: 20, ymin: 0, ymax: 12, nx: 5, ny: 4, fx: v => v, fy: v => v, xl: "constant c", yl: "loss" });
      const P1 = [], P2 = []; for (let i = 0; i <= 200; i++) { const c = 20 * i / 200; P1.push([a.X(c), a.Y(Math.min(12, mse(c) / 10))]); P2.push([a.X(c), a.Y(Math.min(12, mae(c)))]); }
      s += clip("e3cpb1", 60, 14, 320, 210) + a.s + `<g clip-path="url(#e3cpb1)">` + ML.path(P1, C.blue, 2.2) + ML.path(P2, C.coral, 2.2) + `</g>` + ln(a.X(st.c), a.Y(0), a.X(st.c), a.Y(12), C.gray, 1, "4 4");
      D.forEach((y, i) => { s += dot(a.X(Math.min(20, y)), 262, 5, i === 4 ? C.purple : C.teal); }); s += tx(60, 282, "the readings on the c axis", null) + (st.out > 20 ? tx(380, 266, `${st.out} →`, "end") : "");
      s += tx(410, 34, `c = ${f(st.c, 1)}`, null, "th") + tx(410, 60, `MSE = ${f(mse(st.c), 2)} (blue, shown / 10)`, null, "t") + tx(410, 84, `MAE = ${f(mae(st.c), 2)} (coral)`, null, "t") + tx(410, 118, `mean ${f(mean, 1)}, MSE there ${f(mse(mean), 2)}`, null, "t") + tx(410, 142, `median ${med}, MAE there ${f(mae(med), 2)}`, null, "t") + tx(410, 176, "move the last reading: the mean", null) + tx(410, 194, "follows it, the median does not", null);
      return { h: 296, s };
    }
    if (k === 2) {
      const w = 29 / (14 + st.lam), a = ML.axes(50, 14, 260, 240, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, nx: 4, ny: 4, fx: v => v, fy: v => v, xl: "x", yl: "y" });
      s += a.s + ln(a.X(0), a.Y(0), a.X(4), a.Y(4 * 29 / 14), C.gray, 1.2, "5 4") + ln(a.X(0), a.Y(0), a.X(4), a.Y(4 * w), C.blue, 2.2); RXX.forEach((x, i) => { s += dot(a.X(x), a.Y(RYY[i]), 5, C.teal); });
      const b = ML.axes(380, 14, 240, 240, { xmin: 0, xmax: 30, ymin: 0, ymax: 2.2, nx: 3, ny: 4, fx: v => v, fy: v => f(v, 1), xl: "λ", yl: "" });
      const P = []; for (let i = 0; i <= 120; i++) { const l = 30 * i / 120; P.push([b.X(l), b.Y(29 / (14 + l))]); }
      s += b.s + ML.path(P, C.blue, 2.2) + dot(b.X(st.lam), b.Y(w), 6, C.coral) + tx(b.X(30) - 4, 34, `w = 29 / (14 + λ) = ${f(w, 4)}`, "end", "t") + tx(b.X(30) - 4, 56, "grey dashes: λ = 0, w = 2.071", "end");
      return { h: 300, s };
    }
    if (st.mdl < 2) {
      const v = st.mdl ? [1.0, 0.4, 3.0] : [1.0, 2.1, 2.3], lab = ["expert", "train", "validation"];
      v.forEach((x, i) => { s += vbar(80 + i * 100, 250, x * 60, 64, [C.gray, C.blue, C.coral][i]) + tx(112 + i * 100, 268, lab[i], "middle") + tx(112 + i * 100, 244 - x * 60, f(x, 1), "middle", "t"); });
      s += ln(60, 250 - 60, 380, 250 - 60, C.gray, 1, "4 4");
      s += tx(410, 50, st.mdl ? "model B" : "model A", null, "th") + tx(410, 78, `bias gap ${f(v[1] - v[0], 1)}`, null, "t") + tx(410, 102, `variance gap ${f(v[2] - v[1], 1)}`, null, "t") + tx(410, 136, st.mdl ? "high variance" : "high bias", null, "th") + tx(410, 164, st.mdl ? "more data, regularize," : "bigger model, more", null) + tx(410, 182, st.mdl ? "stop early" : "features, less λ", null);
      return { h: 290, s };
    }
    const L = [0, 0.1, 1, 10], V = [3.0, 1.4, 1.2, 2.6], T = [0.3, 0.8, 1.0, 2.4];
    const a = ML.axes(60, 14, 320, 240, { xmin: 0, xmax: 3, ymin: 0, ymax: 3.5, nx: 3, ny: 7, fx: v => ["0", "0.1", "1", "10"][Math.round(v)], fy: v => f(v, 1), xl: "λ", yl: "error" });
    s += a.s + ML.path(T.map((t, i) => [a.X(i), a.Y(t)]), C.blue, 2.2) + ML.path(V.map((t, i) => [a.X(i), a.Y(t)]), C.coral, 2.2) + T.map((t, i) => dot(a.X(i), a.Y(t), 4, C.blue) + dot(a.X(i), a.Y(V[i]), i === 2 ? 7 : 4, C.coral)).join("");
    s += tx(410, 40, "blue: training, coral: validation", null) + tx(410, 70, "lowest validation 1.2 at λ = 1", null, "th") + tx(410, 98, "λ = 0: gap 2.7, overfits", null, "t") + tx(410, 122, "λ = 10: both high, underfits", null, "t") + tx(410, 156, "refit at λ = 1, test once", null);
    return { h: 300, s };
  }
};

/* ====================================================================
   B3. Reading PyTorch code
   ==================================================================== */
const PA = [[0, 1, 2], [3, 4, 5]];
const PCODE = ["a = torch.arange(6.).reshape(2, 3)", "b = torch.tensor([[1.], [2.]])", "print(a * b)", "print(a.sum(dim=0))", "print(a.mean(dim=1, keepdim=True))", "print(a + torch.tensor([1., 2.]))"];
const PAUTO = ["x = torch.tensor(2., requires_grad=True)", "y = x**3 - 3*x", "y.backward(); print(x.grad)", "y = x**3 - 3*x", "y.backward(); print(x.grad)", "x.grad = None", "z = x * x.detach()", "z.backward(); print(x.grad)"];
const PAOUT = [["x is a leaf that autograd tracks", "2.0", "None"], ["y", "2.0, grad_fn SubBackward0", "grad None"], ["dy/dx = 3x² − 3", "9", "tensor(9.)"], ["new y, new graph", "2.0", "grad still 9"], ["9 added to 9", "18", "tensor(18.)"], ["grad cleared", "", "grad None"], ["x.detach() is a constant 2", "z = 2x", "grad None"], ["dz/dx = 2, not 2x = 4", "2", "tensor(2.)"]];
const zgRun = (zero, n) => { let w = 0, g = 0; const W = [0]; for (let i = 0; i < n; i++) { const gi = 2 * (w - 2); g = zero ? gi : g + gi; w -= 0.1 * g; W.push(w); } return W; };
const MODS = [["0", "Linear(6, 10)", 70, "0.weight (10, 6), 0.bias (10,)", 0], ["1", "BatchNorm1d(10)", 20, "1.weight, 1.bias (10,), running_mean, running_var (10,), num_batches_tracked ()", 21], ["2", "ReLU()", 0, "nothing", 0], ["3", "Dropout(0.3)", 0, "nothing", 0], ["4", "Linear(10, 3)", 33, "4.weight (3, 10), 4.bias (3,)", 0]];
const B3 = {
  key: "B3",
  st: () => ({ line: 2, aline: 0, zero: 0, n: 3, mode: 0 }),
  parts: [
    { t: "Shapes and reductions", pts: 2, q: String.raw`Predict what each print shows, or the error it raises.` + `<pre class="codebox"><code>${PCODE.join("\n")}</code></pre>`,
      a: [String.raw`\(a\) is \(\begin{bmatrix} 0 & 1 & 2 \\ 3 & 4 & 5\end{bmatrix}\), shape (2, 3), and \(b\) has shape (2, 1).`,
        String.raw`a * b: (2, 3) against (2, 1) broadcasts along the columns, row 1 times 1 and row 2 times 2: \(\begin{bmatrix} 0 & 1 & 2 \\ 6 & 8 & 10\end{bmatrix}\).`,
        String.raw`a.sum(dim=0) removes dimension 0, the rows: \((0 + 3, 1 + 4, 2 + 5) = (3, 5, 7)\), shape (3,).`,
        String.raw`a.mean(dim=1, keepdim=True) averages each row and keeps the axis: \(\begin{bmatrix} 1 \\ 4\end{bmatrix}\), shape (2, 1).`,
        String.raw`(2, 3) plus (2,): shapes are aligned from the right, 3 against 2, neither is 1, so it raises "The size of tensor a (3) must match the size of tensor b (2) at non-singleton dimension 1".`],
      ans: String.raw`[[0, 1, 2], [6, 8, 10]], then (3, 5, 7), then [[1], [4]], then a RuntimeError from broadcasting.` },
    { t: "Autograd: accumulation and detach", pts: 2, q: String.raw`Predict the three printed gradients.` + `<pre class="codebox"><code>${PAUTO.join("\n")}</code></pre>`,
      a: [String.raw`\(y = x^3 - 3x\), so \(dy/dx = 3x^2 - 3 = 3\cdot 4 - 3 = 9\). The first print shows tensor(9.).`,
        String.raw`The second forward builds a new graph and backward adds its gradient into x.grad: \(9 + 9 = 18\). Gradients accumulate until someone clears them.`,
        String.raw`After x.grad = None, \(z = x\cdot\) x.detach(). The detached copy is a constant 2 to autograd, so \(z = 2x\) and \(dz/dx = 2\).`,
        String.raw`Without detach, \(z = x^2\) would give \(2x = 4\). The detach cut one of the two paths.`],
      ans: String.raw`tensor(9.), tensor(18.), tensor(2.).` },
    { t: "A loop without zero_grad", pts: 2, q: String.raw`A one-weight model \(\hat y = wx\) is trained on the single example \(x = 1\), \(y = 2\) with loss \((wx - y)^2\), SGD at lr 0.1 from \(w = 0\). Give \(w\) after three steps with optimizer.zero_grad() in the loop and without it. What does the missing line turn SGD into?`,
      a: [String.raw`The gradient is \(2(w - 2)\). With zero_grad: \(w\) goes \(0 \to 0.4 \to 0.72 \to 0.976\), each step closing 20% of the gap to 2.`,
        String.raw`Without it, .grad keeps the sum of all gradients so far: step 1 uses \(-4\) (\(w = 0.4\)), step 2 uses \(-4 - 3.2 = -7.2\) (\(w = 1.12\)), step 3 uses \(-7.2 - 1.76 = -8.96\) (\(w = 2.016\)).`,
        String.raw`That is momentum with \(\beta = 1\): old gradients never fade. \(w\) overshoots to about 4.0 by step 6 and swings back, and it does not settle.`],
      ans: String.raw`0.976 with zero_grad, 2.016 without it, and the run oscillates like undamped momentum.` },
    { t: "Parameters, state_dict and eval", pts: 2, q: String.raw`model = nn.Sequential(nn.Linear(6, 10), nn.BatchNorm1d(10), nn.ReLU(), nn.Dropout(0.3), nn.Linear(10, 3)). Count the parameters. How many entries does model.state_dict() have, and what is the key and shape of the last weight? What does model.eval() change, and what does it not do?`,
      a: [String.raw`Linear(6, 10): \(60 + 10 = 70\). BatchNorm1d(10): \(\gamma\) and \(\beta\), 20. Linear(10, 3): \(30 + 3 = 33\). ReLU and Dropout have none. Total 123.`,
        String.raw`state_dict holds parameters and buffers: 0.weight, 0.bias, 1.weight, 1.bias, 1.running_mean, 1.running_var, 1.num_batches_tracked, 4.weight, 4.bias, 9 entries. The last weight is 4.weight with shape (3, 10), because the keys use the position in the Sequential.`,
        String.raw`model.eval() makes Dropout pass everything through and makes BatchNorm use its running statistics instead of the batch's. It does not stop autograd, which is the job of torch.no_grad().`],
      ans: String.raw`123 parameters, 9 state_dict entries (21 buffer numbers), last weight 4.weight (3, 10). eval switches Dropout and BatchNorm, no_grad stops the graph.` }
  ],
  ctl(k, st) {
    if (k === 0) return btns([[2, "a * b"], [3, "sum dim 0"], [4, "mean dim 1"], [5, "a + (2,)"]], "e3pl");
    if (k === 1) return `<div class="row"><button id="e3pab">Back</button><button id="e3pan">Run next line</button></div>`;
    if (k === 2) return btns([[0, "without zero_grad"], [1, "with zero_grad"]], "e3pz") + sl("e3pn", "steps", 1, 12, 1, st.n);
    return btns([[0, "parameters"], [1, "state_dict"], [2, "train or eval"]], "e3pm");
  },
  bind(k, st, redraw) {
    if (k === 0) bindBt("e3b3x", "e3pl", st, "line", redraw);
    if (k === 1) { $("e3pab").onclick = () => { st.aline = Math.max(0, st.aline - 1); redraw(); }; $("e3pan").onclick = () => { st.aline = Math.min(PAUTO.length - 1, st.aline + 1); redraw(); }; }
    if (k === 2) { bindBt("e3b3x", "e3pz", st, "zero", redraw); bindSl(st, [["e3pn", "n", 0]], redraw); }
    if (k === 3) bindBt("e3b3x", "e3pm", st, "mode", redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const L = st.line;
      s += ML.grid(PA, { x: 30, y: 34, cell: 44, title: "a (2, 3)", rowLab: false, colLab: false, dec: 0 }).s;
      if (L === 2) { s += ML.grid([[1], [2]], { x: 200, y: 34, cell: 44, title: "b (2, 1)", rowLab: false, colLab: false, dec: 0 }).s + tx(270, 90, "→ stretched", null) + ML.grid([[0, 1, 2], [6, 8, 10]], { x: 380, y: 34, cell: 44, title: "a * b (2, 3)", rowLab: false, colLab: false, dec: 0, hl: new Set(["1,0", "1,1", "1,2"]) }).s + tx(30, 170, "row 1 times 1, row 2 times 2: b is copied along the columns", null, "t"); }
      if (L === 3) s += ML.grid([[3, 5, 7]], { x: 260, y: 56, cell: 44, title: "a.sum(dim=0) (3,)", rowLab: false, colLab: false, dec: 0, hl: new Set(["0,0", "0,1", "0,2"]) }).s + tx(30, 170, "dim 0 is the row axis: it is summed away, one number per column", null, "t");
      if (L === 4) s += ML.grid([[1], [4]], { x: 260, y: 34, cell: 44, title: "mean(dim=1, keepdim) (2, 1)", rowLab: false, colLab: false, dec: 0, hl: new Set(["0,0", "1,0"]) }).s + tx(30, 170, "one mean per row, and keepdim leaves a column of size 1", null, "t");
      if (L === 5) s += tx(240, 60, "shapes, right aligned:", null, "t") + tx(240, 86, "a:      2   3", null, "t") + tx(240, 108, "other:      2", null, "t") + tx(240, 134, "3 against 2, neither is 1", null, "th") + tx(30, 172, "RuntimeError: The size of tensor a (3) must match the size of tensor b (2) at non-singleton dimension 1", null);
      s += tx(30, 200, PCODE[L], null, "t");
      return { h: 216, s };
    }
    if (k === 1) {
      const i = st.aline, o = PAOUT[i];
      return { h: 4, s: "", html: ML.code(PAUTO, i) + ML.readout([["line", `${i + 1} of ${PAUTO.length}`], ["what happens", o[0]], ["value", o[1] || "none"], ["x.grad", o[2]]]) };
    }
    if (k === 2) {
      const W = zgRun(st.zero, 12), a = ML.axes(60, 14, 320, 240, { xmin: 0, xmax: 12, ymin: 0, ymax: 4.5, nx: 6, ny: 3, fx: v => v, fy: v => f(v, 1), xl: "step", yl: "w" });
      s += a.s + ln(a.X(0), a.Y(2), a.X(12), a.Y(2), C.teal, 1.2, "5 4") + ML.path(W.slice(0, st.n + 1).map((w, i) => [a.X(i), a.Y(w)]), st.zero ? C.blue : C.coral, 2.2) + W.slice(0, st.n + 1).map((w, i) => dot(a.X(i), a.Y(w), 3.5, st.zero ? C.blue : C.coral)).join("");
      s += tx(410, 34, st.zero ? "with zero_grad" : "without zero_grad", null, "th") + tx(410, 60, `w after ${st.n} steps = ${f(W[st.n], 4)}`, null, "t") + tx(410, 92, "teal dashes: the answer w = 2", null) + tx(410, 122, st.zero ? "gap shrinks by 0.8 per step" : ".grad = sum of all gradients", null) + tx(410, 140, st.zero ? "smooth approach" : "momentum with β = 1, no fading", null);
      return { h: 300, s };
    }
    if (st.mode === 0) {
      MODS.forEach((m, i) => { const y = 30 + i * 48; s += rect(30, y, 210, 36, "var(--sunk)", m[2] ? C.blue : "var(--line)") + tx(44, y + 23, `${m[0]}  ${m[1]}`, null, "t") + tx(270, y + 23, m[2] ? `${m[2]} parameters` : "no parameters", null, m[2] ? "t" : null); });
      s += tx(470, 70, "70 + 20 + 33", null, "t") + tx(470, 96, "= 123", null, "th") + tx(470, 130, "BatchNorm adds γ and β,", null) + tx(470, 148, "one each per feature", null);
      return { h: 280, s };
    }
    if (st.mode === 1) {
      const K = [["0.weight", "(10, 6)", "parameter"], ["0.bias", "(10,)", "parameter"], ["1.weight", "(10,)", "parameter"], ["1.bias", "(10,)", "parameter"], ["1.running_mean", "(10,)", "buffer"], ["1.running_var", "(10,)", "buffer"], ["1.num_batches_tracked", "()", "buffer"], ["4.weight", "(3, 10)", "parameter"], ["4.bias", "(3,)", "parameter"]];
      K.forEach((r, i) => { const y = 30 + i * 26; s += tx(40, y, r[0], null, "t") + tx(260, y, r[1], null, "t") + tx(360, y, r[2], null, r[2] === "buffer" ? null : "t"); });
      s += tx(470, 60, "9 entries", null, "th") + tx(470, 86, "buffers: 10 + 10 + 1 = 21", null) + tx(470, 104, "numbers, saved but not trained", null) + tx(470, 136, "keys use the Sequential index,", null) + tx(470, 154, "so the head is 4, not 2", null);
      return { h: 270, s };
    }
    const rows = [["", "model.train()", "model.eval()"], ["Dropout(0.3)", "zeros 30%, scales by 1/0.7", "passes everything"], ["BatchNorm1d", "batch mean and variance", "running mean and variance"], ["running stats", "updated each batch", "frozen"], ["autograd", "on", "still on, use no_grad"]];
    rows.forEach((r, i) => { const y = 40 + i * 40; r.forEach((c, j) => { s += tx([30, 190, 420][j], y, c, null, i === 0 || j === 0 ? "th" : "t"); }); if (i) s += ln(30, y - 26, 650, y - 26, "var(--line)", 0.6); });
    return { h: 240, s };
  }
};

/* ====================================================================
   B4. A softmax classifier and its evaluation
   ==================================================================== */
const CM = [[52, 2, 1], [6, 15, 4], [2, 5, 13]], CMN = ["good", "crack", "pore"];
const SPOS = [0.9, 0.6, 0.35], SNEG = [0.7, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05];
const bcm = t => { const TP = SPOS.filter(v => v >= t).length, FP = SNEG.filter(v => v >= t).length; return { TP, FP, FN: 3 - TP, TN: 7 - FP }; };
const B4 = {
  key: "B4",
  st: () => ({ z0: 0.5, z1: 2, z2: -0.5, y: 1, x1: 1, x2: 2, cls: 1, t: 0.5, cfn: 4 }),
  parts: [
    { t: "Softmax, cross-entropy and its gradient", pts: 3, q: String.raw`A three-class model (good, crack, pore) outputs logits \(\mathbf z = (0.5, 2, -0.5)\) for a micrograph whose true class is crack, \(y = 1\). Compute the softmax, the cross-entropy and \(\partial\ell/\partial\mathbf z\). What would the loss be if the true class were good?`,
      a: [String.raw`\(e^{0.5} = 1.6487\), \(e^{2} = 7.3891\), \(e^{-0.5} = 0.6065\), sum 9.6443.`,
        String.raw`\(\mathbf p = (0.1710, 0.7662, 0.0629)\). The probabilities sum to 1 and keep the order of the logits.`,
        String.raw`\(\ell = -\ln p_1 = -\ln 0.7662 = 0.2664\). Equivalently \(\ln\sum e^{z_j} - z_1 = 2.2664 - 2 = 0.2664\).`,
        String.raw`\(\partial\ell/\partial\mathbf z = \mathbf p - \mathbf e_1 = (0.1710, -0.2338, 0.0629)\). The entries sum to 0: raising the true logit lowers the loss.`,
        String.raw`If the true class were good, \(\ell = -\ln 0.1710 = 1.7664\), larger by exactly \(z_1 - z_0 = 1.5\).`],
      ans: String.raw`\(\mathbf p = (0.1710, 0.7662, 0.0629)\), \(\ell = 0.2664\), gradient \((0.1710, -0.2338, 0.0629)\), and 1.7664 for class good.` },
    { t: "The weight gradient of a linear softmax layer", pts: 2, q: String.raw`The logits come from \(\mathbf z = W\mathbf x + \mathbf b\) with \(W\) of shape (3, 2) and \(\mathbf x = (1, 2)\). Give \(\partial\ell/\partial W\) and \(\partial\ell/\partial\mathbf b\) for \(y = 1\), with their shapes.`,
      a: [String.raw`By the chain rule, \(\partial\ell/\partial W = (\mathbf p - \mathbf e_y)\,\mathbf x^\top\), an outer product of a 3-vector and a 2-vector, shape (3, 2), the shape of \(W\).`,
        String.raw`Rows: \(0.1710\cdot(1, 2) = (0.1710, 0.3419)\), \(-0.2338\cdot(1, 2) = (-0.2338, -0.4677)\), \(0.0629\cdot(1, 2) = (0.0629, 0.1258)\).`,
        String.raw`\(\partial\ell/\partial\mathbf b = \mathbf p - \mathbf e_y = (0.1710, -0.2338, 0.0629)\), shape (3,).`,
        String.raw`Gradient descent raises the crack row of \(W\) along \(\mathbf x\) and lowers the other two. Every column of the gradient sums to 0.`],
      ans: String.raw`\(\partial\ell/\partial W\) rows \((0.1710, 0.3419)\), \((-0.2338, -0.4677)\), \((0.0629, 0.1258)\), shape (3, 2), and \(\partial\ell/\partial\mathbf b = (0.1710, -0.2338, 0.0629)\).` },
    { t: "A three-class confusion matrix", pts: 3, q: String.raw`On 100 validation micrographs the confusion matrix (rows true, columns predicted, order good, crack, pore) is \(\begin{bmatrix} 52 & 2 & 1 \\ 6 & 15 & 4 \\ 2 & 5 & 13\end{bmatrix}\). Compute the accuracy, the precision and recall of each class, and the macro-F1.`,
      a: [String.raw`Accuracy is the diagonal over the total: \((52 + 15 + 13)/100 = 0.80\).`,
        String.raw`Precision divides by the column sums (60, 22, 18): good \(52/60 = 0.867\), crack \(15/22 = 0.682\), pore \(13/18 = 0.722\).`,
        String.raw`Recall divides by the row sums (55, 25, 20): good \(52/55 = 0.945\), crack \(15/25 = 0.600\), pore \(13/20 = 0.650\).`,
        String.raw`\(F_1 = 2PR/(P + R)\): good 0.904, crack 0.638, pore 0.684. Macro-F1 is their plain mean, 0.742, below the accuracy because the two rare classes are the weak ones.`],
      ans: String.raw`Accuracy 0.80, precision 0.867, 0.682, 0.722, recall 0.945, 0.600, 0.650, macro-F1 0.742.` },
    { t: "A threshold from costs, and the AUC", pts: 2, q: String.raw`A binary defect model scores ten parts. Defective: 0.9, 0.6, 0.35. Good: 0.7, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05. A missed defect costs 4, a false alarm costs 1. Give the confusion counts and cost at \(\tau = 0.5\), the cost-optimal threshold for calibrated scores, the best threshold on these ten parts, and the AUC.`,
      a: [String.raw`At 0.5: TP 2 (0.9, 0.6), FP 1 (0.7), FN 1 (0.35), TN 6. Cost \(4\cdot 1 + 1\cdot 1 = 5\), precision and recall both 0.667.`,
        String.raw`For calibrated probabilities, flag when \(p\,C_{FN} \gt (1 - p)\,C_{FP}\), so \(\tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}} = \frac{1}{5} = 0.2\).`,
        String.raw`Scanning these ten scores, \(\tau = 0.35\) flags all three defects with 2 false alarms (0.7, 0.4): cost 2, the lowest. At 0.2 the cost is 4. The two disagree because ten scores are not calibrated.`,
        String.raw`AUC counts the (defective, good) pairs in the right order: 0.9 beats all 7, 0.6 beats 6, 0.35 beats 5, so \(18/21 = 0.857\).`],
      ans: String.raw`At 0.5: TP 2, FP 1, FN 1, TN 6, cost 5. \(\tau^* = 0.2\). Best on these parts \(\tau = 0.35\) with cost 2. AUC 0.857.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e3sz0", "logit good", -3, 4, 0.1, st.z0) + sl("e3sz1", "logit crack", -3, 4, 0.1, st.z1) + sl("e3sz2", "logit pore", -3, 4, 0.1, st.z2) + btns([[0, "true good"], [1, "true crack"], [2, "true pore"]], "e3sy");
    if (k === 1) return sl("e3sx1", "x₁", -2, 3, 0.5, st.x1) + sl("e3sx2", "x₂", -2, 3, 0.5, st.x2);
    if (k === 2) return btns(CMN.map((n, i) => [i, n]), "e3sc");
    return sl("e3st", "threshold τ", 0, 1, 0.05, st.t) + sl("e3sf", "cost of a miss", 1, 10, 1, st.cfn);
  },
  bind(k, st, redraw) {
    if (k === 0) { bindSl(st, [["e3sz0", "z0", 1], ["e3sz1", "z1", 1], ["e3sz2", "z2", 1]], redraw); bindBt("e3b4x", "e3sy", st, "y", redraw); }
    if (k === 1) bindSl(st, [["e3sx1", "x1", 1], ["e3sx2", "x2", 1]], redraw);
    if (k === 2) bindBt("e3b4x", "e3sc", st, "cls", redraw);
    if (k === 3) bindSl(st, [["e3st", "t", 2], ["e3sf", "cfn", 0]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const z = [st.z0, st.z1, st.z2], p = softmax(z), L = -Math.log(p[st.y]);
      z.forEach((v, i) => { const x = 50 + i * 70; s += vbar(x, 150, v * 25, 44, C.purple, 0.7) + tx(x + 22, v >= 0 ? 144 - v * 25 : 166 - v * 25, f(v, 1), "middle") + tx(x + 22, 290, CMN[i], "middle", i === st.y ? "th" : null); });
      s += ln(40, 150, 260, 150, C.gray, 1) + tx(150, 22, "logits z", "middle", "t");
      p.forEach((v, i) => { const x = 320 + i * 70; s += vbar(x, 270, v * 220, 44, i === st.y ? C.teal : C.blue) + tx(x + 22, 264 - v * 220, f(v, 4), "middle") + tx(x + 22, 290, CMN[i], "middle", i === st.y ? "th" : null); });
      s += tx(425, 22, "softmax p", "middle", "t") + tx(560, 60, `ℓ = −ln ${f(p[st.y], 4)}`, null, "t") + tx(560, 84, `  = ${f(L, 4)}`, null, "th") + tx(560, 118, "∂ℓ/∂z = p − e_y", null) + p.map((v, i) => tx(560, 138 + i * 18, `${f(v - (i === st.y ? 1 : 0), 4)}`, null)).join("");
      return { h: 300, s };
    }
    if (k === 1) {
      const p = softmax([0.5, 2, -0.5]), d = p.map((v, i) => v - (i === 1 ? 1 : 0)), x = [st.x1, st.x2], G = d.map(v => x.map(xi => v * xi));
      s += ML.grid(d.map(v => [v]), { x: 40, y: 40, cell: 64, title: "p − e_y (3, 1)", rowLab: CMN, colLab: false, dec: 4 }).s + tx(150, 140, "×", "middle", "th");
      s += ML.grid([x], { x: 180, y: 108, cell: 56, title: "xᵀ (1, 2)", rowLab: false, colLab: false, dec: 1 }).s + tx(320, 140, "=", "middle", "th");
      s += ML.grid(G, { x: 360, y: 40, cell: 72, title: "∂ℓ/∂W (3, 2)", rowLab: false, colLab: false, dec: 4, hl: new Set(["1,0", "1,1"]) }).s;
      s += tx(40, 286, `column sums ${f(Math.abs(G[0][0] + G[1][0] + G[2][0]) < 1e-9 ? 0 : G[0][0] + G[1][0] + G[2][0], 4)} and ${f(Math.abs(G[0][1] + G[1][1] + G[2][1]) < 1e-9 ? 0 : G[0][1] + G[1][1] + G[2][1], 4)}: the crack row goes up, the others down`, null);
      return { h: 300, s };
    }
    if (k === 2) {
      const c = st.cls, colS = [0, 1, 2].map(j => CM[0][j] + CM[1][j] + CM[2][j]), rowS = CM.map(r => r[0] + r[1] + r[2]), P = CM[c][c] / colS[c], R = CM[c][c] / rowS[c], F1 = 2 * P * R / (P + R);
      const hl = new Set([0, 1, 2].map(j => c + "," + j)), hl2 = new Set([0, 1, 2].filter(i => i !== c).map(i => i + "," + c));
      s += ML.grid(CM, { x: 90, y: 40, cell: 62, title: "rows true, columns predicted", rowLab: CMN, colLab: CMN, dec: 0, hl, hl2 }).s;
      s += tx(420, 50, `class ${CMN[c]}`, null, "th") + tx(420, 78, `precision ${CM[c][c]} / ${colS[c]} = ${f(P, 3)}`, null, "t") + tx(420, 102, `recall ${CM[c][c]} / ${rowS[c]} = ${f(R, 3)}`, null, "t") + tx(420, 126, `F1 = ${f(F1, 3)}`, null, "t");
      s += tx(420, 160, "accuracy 80 / 100 = 0.80", null) + tx(420, 178, "macro-F1 (0.904 + 0.638 + 0.684) / 3", null) + tx(420, 196, "= 0.742", null, "t") + tx(420, 226, "row: recall, column: precision", null);
      return { h: 280, s };
    }
    const c = bcm(st.t), cost = st.cfn * c.FN + c.FP, a = ML.axes(30, 30, 380, 60, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 10, ny: 1, fx: v => f(v, 1), fy: () => "", grid: false });
    s += a.s + `<rect x="${a.X(st.t)}" y="30" width="${a.X(1) - a.X(st.t)}" height="60" fill="${C.coral}" opacity="0.1"/>` + ln(a.X(st.t), 24, a.X(st.t), 96, C.coral, 2);
    SPOS.forEach(v => { s += dot(a.X(v), 48, 6, C.coral); }); SNEG.forEach(v => { s += dot(a.X(v), 72, 6, C.teal, true); });
    s += tx(420, 52, "filled: defective", null) + tx(420, 76, "hollow: good", null);
    const R = ML.axes(60, 150, 160, 140, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 2, ny: 2, fx: v => f(v, 1), fy: v => f(v, 1), xl: "false positive rate", yl: "recall" });
    const pts = [1.01, 0.9, 0.7, 0.6, 0.4, 0.35, 0.3, 0.2, 0.15, 0.1, 0.05, 0].map(t => { const q = bcm(t); return [R.X(q.FP / 7), R.Y(q.TP / 3)]; });
    s += R.s + ML.path(pts, C.blue, 2) + dot(R.X(c.FP / 7), R.Y(c.TP / 3), 6, C.coral);
    const tau = 1 / (1 + st.cfn);
    s += tx(300, 160, `τ = ${f(st.t, 2)}: TP ${c.TP}, FP ${c.FP}, FN ${c.FN}, TN ${c.TN}`, null, "t") + tx(300, 186, `cost = ${st.cfn}·${c.FN} + ${c.FP} = ${cost}`, null, "th") + tx(300, 212, `calibrated rule τ* = 1/(1 + ${st.cfn}) = ${f(tau, 3)}`, null, "t") + tx(300, 240, "AUC = 18 / 21 = 0.857", null, "t") + tx(300, 264, st.cfn === 4 ? "best on these ten: τ = 0.35, cost 2" : "", null);
    return { h: 340, s };
  }
};

/* ====================================================================
   B5. A 2-2-1 classifier: ReLU hidden layer, one logit, BCEWithLogitsLoss
   ==================================================================== */
const QW1 = [[1, -1], [0.5, 2]], QB1 = [0.5, -4], QW2 = [2, -1], QB2 = -0.5, QX1 = [2, 1], QY1 = 0, QX2 = [-1, 1], QY2 = 1;
const qf = (x, W1, b1, W2, b2, leak) => { const z = W1.map((r, j) => r[0] * x[0] + r[1] * x[1] + b1[j]), a = z.map(v => v > 0 ? v : (leak || 0) * v), o = W2[0] * a[0] + W2[1] * a[1] + b2; return { z, a, o, p: sig(o) }; };
const bce = (p, y) => -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
const qb = leak => { const F = qf(QX1, QW1, QB1, QW2, QB2, leak), d2 = F.p - QY1, dW2 = F.a.map(v => d2 * v), da = QW2.map(w => w * d2), dz = da.map((v, j) => v * (F.z[j] > 0 ? 1 : (leak || 0))), dW1 = dz.map(d => QX1.map(xi => d * xi)); return { F, d2, dW2, da, dz, dW1 }; };
const qs = al => { const G = qb(0), W1 = QW1.map((r, j) => r.map((w, i) => w - al * G.dW1[j][i])), b1 = QB1.map((b, j) => b - al * G.dz[j]), W2 = QW2.map((w, j) => w - al * G.dW2[j]), b2 = QB2 - al * G.d2, F = qf(QX1, W1, b1, W2, b2); return { W1, b1, W2, b2, F, L: bce(F.p, QY1) }; };
const QIX = 80, QHX = 320, QOX = 540, QIY = [90, 210], QHY = [90, 210], QOY = 150;
/* vals = {x: [2 labels], h: [[above, inside] x 2], o}, edgeLab = {w1, w2} or null, hid = [below x 2], dead = [bool x 2] */
const netPic2 = (vals, edgeLab, hid, dead) => {
  let s = "";
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const x1 = QIX + 22, y1 = QIY[i], x2 = QHX - 30, y2 = QHY[j]; s += ln(x1, y1, x2, y2, dead && dead[j] ? "var(--line)" : (j ? C.purple : C.blue), dead && dead[j] ? 1 : 1.4); if (edgeLab) { const t = i === j ? 0.5 : 0.3, xm = x1 + t * (x2 - x1), ym = y1 + t * (y2 - y1) + (i === j ? -10 : 0); s += `<rect x="${xm - 26}" y="${ym - 10}" width="52" height="17" rx="4" fill="var(--bg)" stroke="var(--line)" stroke-width="0.6"/>` + tx(xm, ym + 3, edgeLab.w1[j][i], "middle"); } }
  for (let j = 0; j < 2; j++) { const x1 = QHX + 30, y1 = QHY[j], x2 = QOX - 26, y2 = QOY; s += ln(x1, y1, x2, y2, dead && dead[j] ? "var(--line)" : C.teal, dead && dead[j] ? 1 : 1.6); if (edgeLab) { const xm = (x1 + x2) / 2, ym = (y1 + y2) / 2; s += `<rect x="${xm - 26}" y="${ym - 10}" width="52" height="17" rx="4" fill="var(--bg)" stroke="var(--line)" stroke-width="0.6"/>` + tx(xm, ym + 3, edgeLab.w2[j], "middle"); } }
  QIY.forEach((y, i) => { s += `<circle cx="${QIX}" cy="${y}" r="22" fill="var(--sunk)" stroke="${C.gray}" stroke-width="1.4"/>` + tx(QIX, y + 4, vals.x[i], "middle", "t") + tx(QIX - 30, y + 4, `x${"₁₂"[i]}`, "end"); });
  QHY.forEach((y, j) => { s += `<circle cx="${QHX}" cy="${y}" r="30" fill="${dead && dead[j] ? "var(--sunk)" : "var(--bg)"}" stroke="${j ? C.purple : C.blue}" stroke-width="1.8"/>` + tx(QHX, y - 38, vals.h[j][0], "middle", "t") + tx(QHX, y + 4, vals.h[j][1], "middle"); if (hid) s += tx(QHX, y + 48, hid[j], "middle"); });
  s += `<circle cx="${QOX}" cy="${QOY}" r="28" fill="var(--bg)" stroke="${C.teal}" stroke-width="2"/>` + tx(QOX, QOY + 4, vals.o, "middle", "t") + tx(QOX, QOY - 36, vals.oa || "", "middle", "t");
  return s;
};
const B5 = {
  key: "B5",
  st: () => ({ nin: 2, nh: 2, x1: 2, x2: 1, view: 0, leak: 0, al: 0.1 }),
  parts: [
    { t: "Shapes, parameters and the loss", pts: 2, q: String.raw`A defect classifier is nn.Sequential(nn.Linear(2, 2), nn.ReLU(), nn.Linear(2, 1)) and returns one logit per part. Give the shapes of \(W^{[1]}\), \(\mathbf b^{[1]}\), \(W^{[2]}\), \(b^{[2]}\), the number of parameters, and the loss and target dtype and shape to train it on batches of 32.`,
      a: [String.raw`nn.Linear(n_in, n_out) stores (n_out, n_in): \(W^{[1]}\) is 2 by 2, \(\mathbf b^{[1]}\) has 2 entries, \(W^{[2]}\) is 1 by 2, \(b^{[2]}\) has 1.`,
        String.raw`\(2\cdot 2 + 2 = 6\) plus \(2\cdot 1 + 1 = 3\): 9 parameters.`,
        String.raw`The output is a raw logit of shape (32, 1). Binary with one logit means nn.BCEWithLogitsLoss, which applies the sigmoid inside, in a stable form.`,
        String.raw`The target must be float, 0. or 1., with the same shape (32, 1). An int64 target raises an error, and a (32,) target is broadcast or rejected.`],
      ans: String.raw`(2, 2), (2,), (1, 2), (1,), 9 parameters. nn.BCEWithLogitsLoss with a float target of shape (32, 1).` },
    { t: "Forward pass", pts: 3, q: String.raw`\(W^{[1]} = \begin{bmatrix} 1 & -1 \\ 0.5 & 2\end{bmatrix}\), \(\mathbf b^{[1]} = (0.5, -4)\), \(W^{[2]} = \begin{bmatrix} 2 & -1\end{bmatrix}\), \(b^{[2]} = -0.5\). For the part \(\mathbf x = (2, 1)\) compute \(\mathbf z^{[1]}\), \(\mathbf a^{[1]}\), the logit \(z^{[2]}\), \(p = \sigma(z^{[2]})\) and the predicted class at 0.5.`,
      a: [String.raw`Unit 1: \(z_1 = 1\cdot 2 - 1\cdot 1 + 0.5 = 1.5\). Unit 2: \(z_2 = 0.5\cdot 2 + 2\cdot 1 - 4 = -1\).`,
        String.raw`ReLU: \(\mathbf a^{[1]} = (1.5, 0)\). Unit 2 is off.`,
        String.raw`Logit: \(z^{[2]} = 2\cdot 1.5 - 1\cdot 0 - 0.5 = 2.5\).`,
        String.raw`\(p = \sigma(2.5) = 1/(1 + e^{-2.5}) = 1/1.0821 = 0.9241\), so the part is called defective, class 1.`],
      ans: String.raw`\(\mathbf z^{[1]} = (1.5, -1)\), \(\mathbf a^{[1]} = (1.5, 0)\), \(z^{[2]} = 2.5\), \(p = 0.9241\), class 1.` },
    { t: "The loss on a batch, and the double sigmoid", pts: 2, q: String.raw`The part \((2, 1)\) is in fact good, \(y = 0\). A second part \((-1, 1)\) is defective, \(y = 1\). Compute both binary cross-entropies and the batch mean. Then someone adds nn.Sigmoid() at the end of the model and keeps nn.BCEWithLogitsLoss. What does the loss read now?`,
      a: [String.raw`Part 1: \(\ell = -\ln(1 - 0.9241) = -\ln 0.0759 = 2.5789\).`,
        String.raw`Part 2: \(\mathbf z^{[1]} = (-1 - 1 + 0.5,\ -0.5 + 2 - 4) = (-1.5, -2.5)\), both units off, so \(z^{[2]} = b^{[2]} = -0.5\), \(p = 0.3775\) and \(\ell = -\ln 0.3775 = 0.9741\).`,
        String.raw`Batch mean \((2.5789 + 0.9741)/2 = 1.7765\), the value nn.BCEWithLogitsLoss returns with reduction 'mean'.`,
        String.raw`With the extra sigmoid the loss sees \(\sigma(\sigma(z))\): \(\sigma(0.9241) = 0.7158\) and \(\sigma(0.3775) = 0.5933\), losses 1.2584 and 0.5221, mean 0.8902. It looks better, raises no error, and every output now sits between 0.5 and 0.73, so the model cannot become confident.`],
      ans: String.raw`2.5789 and 0.9741, mean 1.7765. With a sigmoid in the model the loss silently reads 0.8902.` },
    { t: "Backward pass", pts: 4, q: String.raw`For part 1 alone (\(y = 0\)) compute \(\partial\ell/\partial z^{[2]}\), \(\partial\ell/\partial W^{[2]}\), \(\partial\ell/\partial b^{[2]}\), \(\partial\ell/\partial\mathbf a^{[1]}\), \(\partial\ell/\partial\mathbf z^{[1]}\), \(\partial\ell/\partial W^{[1]}\) and \(\partial\ell/\partial\mathbf b^{[1]}\).`,
      a: [String.raw`Sigmoid with binary cross-entropy: \(\partial\ell/\partial z^{[2]} = p - y = 0.9241\).`,
        String.raw`\(\partial\ell/\partial W^{[2]} = 0.9241\,\mathbf a^{[1]\top} = (1.3862, 0)\) and \(\partial\ell/\partial b^{[2]} = 0.9241\).`,
        String.raw`\(\partial\ell/\partial\mathbf a^{[1]} = W^{[2]\top}\cdot 0.9241 = (1.8483, -0.9241)\).`,
        String.raw`ReLU slopes \((1, 0)\): \(\partial\ell/\partial\mathbf z^{[1]} = (1.8483, 0)\). Unit 2 gets nothing.`,
        String.raw`\(\partial\ell/\partial W^{[1]} = \partial\ell/\partial\mathbf z^{[1]}\,\mathbf x^\top = \begin{bmatrix} 3.6966 & 1.8483 \\ 0 & 0\end{bmatrix}\), \(\partial\ell/\partial\mathbf b^{[1]} = (1.8483, 0)\).`,
        String.raw`Part 2 has both units off, so it sends no gradient into \(W^{[1]}\) at all. Unit 2 is off for both parts: on this batch it is a dead unit. With Leaky ReLU at 0.01 its row would be \((-0.0185, -0.0092)\).`],
      ans: String.raw`0.9241, (1.3862, 0), 0.9241, (1.8483, −0.9241), (1.8483, 0), rows (3.6966, 1.8483) and (0, 0), and (1.8483, 0). These match PyTorch's .grad.` },
    { t: "One SGD step, and a step too far", pts: 3, q: String.raw`Take one SGD step on part 1 with \(\alpha = 0.1\) and recompute \(z_1\), the logit, \(p\) and the loss. Above which \(\alpha\) does this one step switch off unit 1 as well, and what is the model then?`,
      a: [String.raw`\(W^{[2]} := (2 - 0.1386,\ -1) = (1.8614, -1)\), \(b^{[2]} := -0.5 - 0.0924 = -0.5924\).`,
        String.raw`\(W^{[1]}\) row 1 \(:= (1 - 0.3697,\ -1 - 0.1848) = (0.6303, -1.1848)\), \(b^{[1]}_1 := 0.5 - 0.1848 = 0.3152\). Row 2 and \(b^{[1]}_2\) do not move.`,
        String.raw`\(z_1 = 0.6303\cdot 2 - 1.1848 + 0.3152 = 0.3910\), logit \(1.8614\cdot 0.3910 - 0.5924 = 0.1354\), \(p = 0.5338\), \(\ell = -\ln 0.4662 = 0.7632\). Down from 2.5789.`,
        String.raw`\(z_1\) falls by \(\alpha(3.6966\cdot 2 + 1.8483\cdot 1 + 1.8483) = 11.09\,\alpha\), so it crosses 0 at \(\alpha = 1.5/11.09 = 0.135\).`,
        String.raw`Beyond that both units are off for this part, the output is the constant \(b^{[2]}\) and no gradient reaches \(W^{[1]}\) from it. The loss is lower (0.3236 at \(\alpha = 0.5\)), but the network has killed its only live unit: dying ReLU in one step.`],
      ans: String.raw`At \(\alpha = 0.1\): \(z_1 = 0.391\), logit 0.1354, \(p = 0.5338\), \(\ell = 0.7632\). Above \(\alpha = 0.135\) unit 1 switches off too.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e3qin", "inputs", 1, 8, 1, st.nin) + sl("e3qh", "hidden units", 1, 8, 1, st.nh);
    if (k === 1) return sl("e3qx1", "x₁", -2, 3, 0.5, st.x1) + sl("e3qx2", "x₂", -2, 3, 0.5, st.x2);
    if (k === 2) return btns([[0, "part 1"], [1, "part 2"], [2, "batch"], [3, "sigmoid twice"]], "e3qv");
    if (k === 3) return btns([[0, "ReLU"], [1, "Leaky ReLU 0.01"]], "e3qlk");
    return sl("e3qal", "learning rate α", 0, 0.6, 0.005, st.al);
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e3qin", "nin", 0], ["e3qh", "nh", 0]], redraw);
    if (k === 1) bindSl(st, [["e3qx1", "x1", 1], ["e3qx2", "x2", 1]], redraw);
    if (k === 2) bindBt("e3b5x", "e3qv", st, "view", redraw);
    if (k === 3) bindBt("e3b5x", "e3qlk", st, "leak", redraw);
    if (k === 4) bindSl(st, [["e3qal", "al", 3]], redraw);
  },
  pic(k, st) {
    let s = "";
    const WL = { w1: QW1.map(r => r.map(v => f(v, v % 1 ? 1 : 0))), w2: QW2.map(v => f(v, 0)) };
    if (k === 0) {
      const n = st.nin, h = st.nh, p1 = n * h + h, p2 = h + 1, cx = (cnt, i, gap) => 150 + i * gap - (cnt - 1) * gap / 2;
      for (let j = 0; j < h; j++) for (let i = 0; i < n; i++) s += ln(90, cx(n, i, 30), 240, cx(h, j, 30), "var(--line)", 0.8);
      for (let j = 0; j < h; j++) s += ln(240, cx(h, j, 30), 380, 150, "var(--line)", 0.8);
      for (let i = 0; i < n; i++) s += dot(90, cx(n, i, 30), 10, C.gray, true);
      for (let j = 0; j < h; j++) s += dot(240, cx(h, j, 30), 11, C.blue, true);
      s += dot(380, 150, 11, C.teal, true) + tx(90, 290, `${n} inputs`, "middle") + tx(240, 290, `${h} hidden, ReLU`, "middle") + tx(380, 290, "1 logit", "middle");
      s += tx(430, 40, `W[1]: (${h}, ${n}), b[1]: (${h},)`, null, "t") + tx(430, 64, `W[2]: (1, ${h}), b[2]: (1,)`, null, "t") + tx(430, 100, `${n}·${h} + ${h} + ${h} + 1 = ${p1 + p2}`, null, "th");
      s += tx(430, 140, "batch (32, " + n + ") → logits (32, 1)", null) + tx(430, 160, "BCEWithLogitsLoss", null, "t") + tx(430, 180, "target float (32, 1)", null);
      return { h: 310, s };
    }
    if (k === 1) {
      const x = [st.x1, st.x2], F = qf(x, QW1, QB1, QW2, QB2);
      s += netPic2({ x: x.map(v => f(v, 1)), h: F.z.map((z, j) => [`z = ${f(z, 2)}`, `a = ${f(F.a[j], 2)}`]), o: f(F.o, 2), oa: `p = ${f(F.p, 4)}` }, WL, ["bias 0.5", "bias −4"], F.z.map(v => v <= 0));
      s += tx(470, 240, "b[2] = −0.5", null) + tx(470, 262, `class ${F.p >= 0.5 ? "1, defective" : "0, good"}`, null, "th") + tx(20, 300, "grey unit: z ≤ 0, it outputs 0 and passes no gradient. Unit 2 needs 0.5x₁ + 2x₂ > 4", null);
      return { h: 312, s };
    }
    if (k === 2) {
      const F1 = qf(QX1, QW1, QB1, QW2, QB2), F2 = qf(QX2, QW1, QB1, QW2, QB2), v = st.view;
      if (v <= 1) {
        const x = v ? QX2 : QX1, F = v ? F2 : F1, y = v ? QY2 : QY1;
        s += netPic2({ x: x.map(q => f(q, 0)), h: F.z.map((z, j) => [`z = ${f(z, 2)}`, `a = ${f(F.a[j], 2)}`]), o: f(F.o, 2), oa: `p = ${f(F.p, 4)}` }, WL, null, F.z.map(q => q <= 0));
        s += tx(470, 236, `target y = ${y}`, null, "t") + tx(470, 260, `ℓ = −ln ${y ? "p" : "(1 − p)"} = ${f(bce(F.p, y), 4)}`, null, "th");
        return { h: 300, s };
      }
      const two = v === 3, P = [F1, F2].map(F => two ? sig(F.p) : F.p), L = [bce(P[0], 0), bce(P[1], 1)];
      const g = ML.grid([[two ? F1.p : F1.o, P[0], 0, L[0]], [two ? F2.p : F2.o, P[1], 1, L[1]]], { x: 60, y: 50, cell: 92, colLab: [two ? "sigmoid output" : "logit", two ? "σ again" : "p = σ(z)", "target", "loss"], rowLab: ["part 1", "part 2"], dec: 4, hl: new Set(["0,3", "1,3"]) });
      s += g.s + tx(60, 30, two ? "nn.Sigmoid in the model, then BCEWithLogitsLoss" : "BCEWithLogitsLoss on raw logits", null, "th") + tx(60, 210, `mean ${f((L[0] + L[1]) / 2, 4)}`, null, "th") + tx(60, 236, two ? "lower, wrong, and no error: every p is squeezed into (0.5, 0.73)" : "(2.5789 + 0.9741) / 2 = 1.7765", null);
      return { h: 260, s };
    }
    if (k === 3) {
      const G = qb(st.leak ? 0.01 : 0), dg = v => f(v, Math.abs(v) < 0.1 && v !== 0 ? 4 : 4);
      s += netPic2({ x: QX1.map(q => f(q, 0)), h: G.dz.map((d, j) => [`∂ℓ/∂a = ${f(G.da[j], 4)}`, `δ ${f(d, 4)}`]), o: f(G.d2, 4), oa: "p − y" }, { w1: G.dW1.map(r => r.map(dg)), w2: G.dW2.map(v => f(v, 4)) }, ["∂ℓ/∂b = " + f(G.dz[0], 4), "∂ℓ/∂b = " + f(G.dz[1], 4)], st.leak ? null : [false, true]);
      s += tx(450, 236, "edge labels: ∂ℓ/∂w", null) + tx(450, 256, "∂ℓ/∂b[2] = " + f(G.d2, 4), null) + tx(450, 276, st.leak ? "leaky: unit 2 slope 0.01" : "unit 2 off: its row is 0", null);
      return { h: 300, s };
    }
    const r = qs(st.al), a = ML.axes(60, 14, 300, 240, { xmin: 0, xmax: 0.6, ymin: 0, ymax: 3, nx: 6, ny: 3, fx: v => f(v, 1), fy: v => f(v, 1), xl: "learning rate α", yl: "loss on part 1 after one step" });
    const P = []; for (let i = 0; i <= 120; i++) { const al = 0.6 * i / 120; P.push([a.X(al), a.Y(Math.min(3, qs(al).L))]); }
    s += a.s + `<rect x="${a.X(0.1353)}" y="14" width="${a.X(0.6) - a.X(0.1353)}" height="240" fill="${C.gray}" opacity="0.12"/>` + ML.path(P, C.blue, 2.2) + ln(a.X(0), a.Y(2.5789), a.X(0.6), a.Y(2.5789), C.gray, 1, "5 4") + tx(a.X(0.6) - 4, a.Y(2.5789) - 6, "before: 2.5789", "end") + tx(a.X(0.1353) + 6, 34, "unit 1 off too", null) + dot(a.X(st.al), a.Y(Math.min(3, r.L)), 6, C.coral);
    s += tx(390, 34, `α = ${f(st.al, 3)}`, null, "th") + tx(390, 60, `W[1] row 1 = (${r.W1[0].map(v => f(v, 4)).join(", ")})`, null, "t") + tx(390, 82, `b[1] = (${f(r.b1[0], 4)}, −4)`, null, "t") + tx(390, 104, `W[2] = (${f(r.W2[0], 4)}, −1), b[2] = ${f(r.b2, 4)}`, null, "t");
    s += tx(390, 132, `z₁ = ${f(r.F.z[0], 4)}, logit ${f(r.F.o, 4)}`, null, "t") + tx(390, 156, `p = ${f(r.F.p, 4)}, ℓ = ${f(r.L, 4)}`, null, "th") + tx(390, 186, r.F.z[0] > 0 ? "unit 1 still on" : "both units off: output = b[2]", null) + tx(390, 204, "shaded: the step kills unit 1", null);
    return { h: 300, s };
  }
};

/* ====================================================================
   B6. Convolutional and residual networks
   ==================================================================== */
const VI = [[1, 0, 2, 1, 0], [0, 1, 1, 0, 2], [2, 1, 0, 1, 1], [1, 0, 1, 2, 0], [0, 2, 1, 0, 1]], VK = [[0, 1, 0], [1, -2, 1], [0, 1, 0]], VB = 1;
const vconv = s => { const n = Math.floor((5 - 3) / s) + 1, O = []; for (let i = 0; i < n; i++) { O.push([]); for (let j = 0; j < n; j++) { let v = VB; for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) v += VI[i * s + p][j * s + q] * VK[p][q]; O[i].push(v); } } return O; };
const VPM = [[3, 1, 0, 2], [4, 2, 5, 1], [0, 6, 1, 1], [2, 1, 3, 7]];
const osz = (h, k, s, p) => Math.floor((h + 2 * p - k) / s) + 1;
const B6 = {
  key: "B6",
  st: () => ({ s: 2, win: 0, H: 28, pad: 1, avg: 0, rf: 4, a: 0.1, L: 10 }),
  parts: [
    { t: "A stride-2 convolution by hand", pts: 3, q: String.raw`A 5 by 5 image \(\begin{bmatrix} 1&0&2&1&0 \\ 0&1&1&0&2 \\ 2&1&0&1&1 \\ 1&0&1&2&0 \\ 0&2&1&0&1\end{bmatrix}\) goes through nn.Conv2d(1, 1, 3, stride=2) with kernel \(\begin{bmatrix} 0&1&0 \\ 1&-2&1 \\ 0&1&0\end{bmatrix}\) and bias 1. Give the output size and all its values.`,
      a: [String.raw`Size: \(\lfloor(5 + 0 - 3)/2\rfloor + 1 = 2\), so the output is 2 by 2. The windows start at rows and columns 0 and 2.`,
        String.raw`PyTorch's convolution is a cross-correlation: multiply each window by the kernel as it stands, no flip, and add the bias.`,
        String.raw`Only five kernel entries are nonzero: up, left, right and down with weight 1, the center with weight \(-2\). Top left (rows 0 to 2, columns 0 to 2): up 0, left 0, center \(-2\cdot 1\), right 1, down 1, sum \(0\), plus the bias: 1.`,
        String.raw`Top right (columns 2 to 4): up 1, left 1, center \(-2\cdot 0\), right 2, down 1, sum 5, plus 1: 6. Bottom left (rows 2 to 4): up 1, left 1, center 0, right 1, down 2, sum 5, plus 1: 6.`,
        String.raw`Bottom right: up 1, left 1, center \(-2\cdot 2 = -4\), right 0, down 0, sum \(-2\), plus 1: \(-1\). Output \(\begin{bmatrix} 1 & 6 \\ 6 & -1\end{bmatrix}\). With stride 1 it would be 3 by 3.`],
      ans: String.raw`2 by 2: \(\begin{bmatrix} 1 & 6 \\ 6 & -1\end{bmatrix}\).` },
    { t: "Shapes and parameters through a CNN", pts: 3, q: String.raw`A batch (16, 1, 28, 28) goes through Conv2d(1, 8, 3, padding=1), ReLU, MaxPool2d(2), Conv2d(8, 16, 3), ReLU, MaxPool2d(2), Flatten, Linear(F, 10). Give every shape, the value of F, and the parameters of each layer. What happens with 32 by 32 images?`,
      a: [String.raw`Conv 1 keeps the size with padding 1: \((28 + 2 - 3)/1 + 1 = 28\), so (16, 8, 28, 28). Pool: (16, 8, 14, 14).`,
        String.raw`Conv 2 has no padding: \(14 - 3 + 1 = 12\), so (16, 16, 12, 12). Pool: (16, 16, 6, 6). Flatten: \(16\cdot 6\cdot 6 = 576\), so F = 576 and the batch is (16, 576).`,
        String.raw`Parameters: \(8(1\cdot 9 + 1) = 80\), \(16(8\cdot 9 + 1) = 1168\), \(576\cdot 10 + 10 = 5770\). Total 7,018, fewer than the 7,850 of one Linear(784, 10) on raw pixels.`,
        String.raw`At 32 by 32 the flatten gives \(16\cdot 7\cdot 7 = 784\) and the Linear layer raises "mat1 and mat2 shapes cannot be multiplied (16x784 and 576x10)".`],
      ans: String.raw`(16, 8, 28, 28), (16, 8, 14, 14), (16, 16, 12, 12), (16, 16, 6, 6), (16, 576), (16, 10). F = 576. Parameters 80, 1168, 5770, total 7,018.` },
    { t: "Pooling and the receptive field", pts: 2, q: String.raw`Apply MaxPool2d(2) to \(\begin{bmatrix} 3&1&0&2 \\ 4&2&5&1 \\ 0&6&1&1 \\ 2&1&3&7\end{bmatrix}\). Where does an upstream gradient go in the backward pass? Then, in the network of (b), how many input pixels does one cell of the final 6 by 6 map see?`,
      a: [String.raw`Max of each 2 by 2 block: \(\begin{bmatrix} 4 & 5 \\ 6 & 7\end{bmatrix}\). Average pooling would give \(\begin{bmatrix} 2.5 & 2 \\ 2.25 & 3\end{bmatrix}\).`,
        String.raw`Max pooling sends each upstream gradient only to the winner of its block (the 4, 5, 6 and 7), the other 12 inputs get 0. Average pooling sends a quarter to each.`,
        String.raw`Receptive field \(r\) and jump \(j\): conv 3 gives \(r = 3, j = 1\), pool 2 gives \(r = 4, j = 2\), conv 3 gives \(r = 4 + 2\cdot 2 = 8\), pool 2 gives \(r = 8 + 1\cdot 2 = 10, j = 4\).`,
        String.raw`Each final cell sees a 10 by 10 patch of the 28 by 28 image.`],
      ans: String.raw`\(\begin{bmatrix} 4 & 5 \\ 6 & 7\end{bmatrix}\), gradient only to the four maxima, receptive field 10 by 10.` },
    { t: "A residual shortcut and transfer learning", pts: 2, q: String.raw`A residual block maps (B, 8, 14, 14) to (B, 24, 7, 7). What must the shortcut be, and how many parameters does it have (with bias)? If each block's branch has derivative 0.1, compare the gradient through 10 plain blocks with 10 residual blocks. Finally, a pretrained ResNet-18 is frozen and its head replaced by nn.Linear(512, 4): how many parameters train?`,
      a: [String.raw`\(F(\mathbf x) + \mathbf x\) needs equal shapes. The shortcut must change 8 channels to 24 and halve the size: a 1 by 1 convolution with stride 2, \(24(8\cdot 1 + 1) = 216\) parameters.`,
        String.raw`Plain: \(0.1^{10} = 10^{-10}\). Residual: each block passes \(1 + 0.1\), so \(1.1^{10} = 2.59\). The identity route keeps the gradient alive.`,
        String.raw`Only the new head trains: \(512\cdot 4 + 4 = 2052\) parameters.`],
      ans: String.raw`A 1 by 1 stride-2 convolution, 216 parameters. \(10^{-10}\) against 2.59. 2,052 trainable.` }
  ],
  ctl(k, st) {
    if (k === 0) return btns([[2, "stride 2"], [1, "stride 1"]], "e3vs") + `<div class="row"><button id="e3vb">Previous window</button><button id="e3vn">Next window</button></div>`;
    if (k === 1) return btns([[24, "24 by 24"], [28, "28 by 28"], [32, "32 by 32"]], "e3vh") + btns([[1, "conv 1 padding 1"], [0, "conv 1 no padding"]], "e3vp");
    if (k === 2) return btns([[0, "max pool"], [1, "average pool"]], "e3va") + sl("e3vr", "layers so far", 0, 4, 1, st.rf);
    return sl("e3vg", "branch derivative a", -1, 1, 0.05, st.a) + sl("e3vl", "blocks L", 1, 30, 1, st.L);
  },
  bind(k, st, redraw) {
    if (k === 0) { bindBt("e3b6x", "e3vs", st, "s", () => { st.win = 0; redraw(); }); $("e3vb").onclick = () => { const n = st.s === 2 ? 4 : 9; st.win = (st.win + n - 1) % n; redraw(); }; $("e3vn").onclick = () => { const n = st.s === 2 ? 4 : 9; st.win = (st.win + 1) % n; redraw(); }; }
    if (k === 1) { bindBt("e3b6x", "e3vh", st, "H", redraw); bindBt("e3b6x", "e3vp", st, "pad", redraw); }
    if (k === 2) { bindBt("e3b6x", "e3va", st, "avg", redraw); bindSl(st, [["e3vr", "rf", 0]], redraw); }
    if (k === 3) bindSl(st, [["e3vg", "a", 2], ["e3vl", "L", 0]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const O = vconv(st.s), n = O.length, wi = Math.floor(st.win / n), wj = st.win % n, hl = new Set();
      for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) hl.add((wi * st.s + p) + "," + (wj * st.s + q));
      s += ML.grid(VI, { x: 30, y: 34, cell: 40, title: "image 5 × 5", hl, rowLab: false, colLab: false, dec: 0 }).s;
      s += ML.grid(VK, { x: 270, y: 54, cell: 38, title: "kernel, bias 1", rowLab: false, colLab: false, dec: 0 }).s;
      s += ML.grid(O, { x: st.s === 2 ? 470 : 440, y: 54, cell: st.s === 2 ? 56 : 46, title: `output ${n} × ${n}`, rowLab: false, colLab: false, hl: new Set([wi + "," + wj]), dec: 0 }).s;
      let terms = []; for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) if (VK[p][q]) terms.push(`${VK[p][q]}·${VI[wi * st.s + p][wj * st.s + q]}`);
      s += tx(30, 270, `window (${wi}, ${wj}): ${terms.join(" + ").replace(/\+ -/g, "− ")} + 1 = ${O[wi][wj]}`, null, "t");
      return { h: 290, s };
    }
    if (k === 1) {
      const H = st.H, h1 = osz(H, 3, 1, st.pad), h2 = Math.floor(h1 / 2), h3 = osz(h2, 3, 1, 0), h4 = Math.floor(h3 / 2), Fl = 16 * h4 * h4, ok = Fl === 576;
      const rows = [["input", `(16, 1, ${H}, ${H})`, ""], [`Conv2d(1, 8, 3${st.pad ? ", padding=1" : ""})`, `(16, 8, ${h1}, ${h1})`, "80"], ["ReLU, MaxPool2d(2)", `(16, 8, ${h2}, ${h2})`, "0"], ["Conv2d(8, 16, 3)", `(16, 16, ${h3}, ${h3})`, "1168"], ["ReLU, MaxPool2d(2)", `(16, 16, ${h4}, ${h4})`, "0"], ["Flatten", `(16, ${Fl})`, "0"], ["Linear(576, 10)", ok ? "(16, 10)" : "error", "5770"]];
      rows.forEach((r, i) => { const y = 34 + i * 34; s += tx(30, y, r[0], null, "t") + tx(300, y, r[1], null, i === 6 && !ok ? "th" : "t") + tx(500, y, r[2], null) + ln(30, y + 12, 600, y + 12, "var(--line)", 0.5); });
      s += tx(500, 14, "parameters", null) + tx(300, 14, "shape", null);
      s += tx(30, 284, ok ? "total 80 + 1168 + 5770 = 7,018 parameters" : `RuntimeError: mat1 and mat2 shapes cannot be multiplied (16x${Fl} and 576x10)`, null, ok ? "th" : "t");
      return { h: 300, s };
    }
    if (k === 2) {
      const out = [[0, 0], [0, 0]], G = VPM.map(r => r.map(() => 0)), hl = new Set();
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const b = [VPM[2 * i][2 * j], VPM[2 * i][2 * j + 1], VPM[2 * i + 1][2 * j], VPM[2 * i + 1][2 * j + 1]]; out[i][j] = st.avg ? b.reduce((a, c) => a + c, 0) / 4 : Math.max(...b); for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) { if (st.avg) G[2 * i + p][2 * j + q] = 0.25; else if (VPM[2 * i + p][2 * j + q] === out[i][j]) { G[2 * i + p][2 * j + q] = 1; hl.add((2 * i + p) + "," + (2 * j + q)); } } }
      s += ML.grid(VPM, { x: 20, y: 34, cell: 32, title: "input", hl, rowLab: false, colLab: false, dec: 0 }).s + ML.grid(out, { x: 180, y: 66, cell: 40, title: st.avg ? "average" : "max", rowLab: false, colLab: false, dec: 2 }).s + ML.grid(G, { x: 20, y: 196, cell: 24, title: "gradient share", rowLab: false, colLab: false, dec: st.avg ? 2 : 0 }).s;
      const R = [[1, 1], [3, 1], [4, 2], [8, 2], [10, 4]], names = ["input pixel", "after conv 3", "after pool 2", "after conv 3", "after pool 2"], r = R[st.rf][0], cell = 7.2, x0 = 340, y0 = 30;
      s += `<rect x="${x0}" y="${y0}" width="${28 * cell}" height="${28 * cell}" fill="var(--sunk)" stroke="var(--line)"/>` + `<rect x="${x0 + 9 * cell}" y="${y0 + 9 * cell}" width="${r * cell}" height="${r * cell}" fill="${C.coral}" opacity="0.5"/>`;
      s += tx(x0, y0 + 28 * cell + 20, `${names[st.rf]}: one cell sees ${r} × ${r} pixels`, null, "t") + tx(x0, y0 + 28 * cell + 40, `jump ${R[st.rf][1]}, r grows by (k − 1) × jump`, null);
      return { h: 300, s };
    }
    const a = st.a, L = st.L, plain = Math.abs(a) ** L, res = Math.abs(1 + a) ** L, A = ML.axes(60, 14, 300, 230, { xmin: 0, xmax: 30, ymin: -12, ymax: 6, nx: 6, ny: 6, fx: v => v, fy: v => "1e" + v, xl: "blocks", yl: "|gradient factor|" });
    const P1 = [], P2 = []; for (let l = 1; l <= 30; l++) { P1.push([A.X(l), A.Y(Math.max(-12, Math.min(6, l * Math.log10(Math.abs(a) || 1e-12))))]); P2.push([A.X(l), A.Y(Math.max(-12, Math.min(6, l * Math.log10(Math.abs(1 + a) || 1e-12))))]); }
    s += A.s + ML.path(P1, C.coral, 2.2) + ML.path(P2, C.teal, 2.2) + ln(A.X(L), A.Y(-12), A.X(L), A.Y(6), C.gray, 1, "4 4");
    s += tx(390, 34, `a = ${f(a, 2)}, L = ${L}`, null, "th") + tx(390, 60, `plain |a|^L = ${fe(plain, 3)}`, null, "t") + tx(390, 84, `residual |1 + a|^L = ${fe(res, 3)}`, null, "t") + tx(390, 116, "coral: plain chain", null) + tx(390, 134, "teal: with the identity shortcut", null);
    s += tx(390, 170, "shortcut (B, 8, 14, 14) → (B, 24, 7, 7):", null) + tx(390, 190, "1 × 1 conv, stride 2, 24·(8 + 1) = 216", null, "t") + tx(390, 222, "frozen ResNet-18, new Linear(512, 4):", null) + tx(390, 242, "512·4 + 4 = 2,052 trainable", null, "t");
    return { h: 290, s };
  }
};

/* ====================================================================
   B7. Recurrent networks and gates: one tanh unit, then a GRU step
   ==================================================================== */
const GU = 1, GV = 2, GY = 1;
const grun = (w, x2) => { const xs = [1, x2], h = [0], z = []; xs.forEach(x => { const q = w * h[h.length - 1] + GU * x; z.push(q); h.push(th(q)); }); const y = GV * h[2]; return { xs, z, h, y, L: 0.5 * (y - GY) ** 2 }; };
const gbp = (w, x2) => { const F = grun(w, x2), dy = F.y - GY, dv = dy * F.h[2], dh2 = dy * GV, dz2 = dh2 * (1 - F.h[2] ** 2), dh1 = dz2 * w, dz1 = dh1 * (1 - F.h[1] ** 2); return { F, dy, dv, dh2, dz2, dh1, dz1, cw: [dz1 * F.h[0], dz2 * F.h[1]], cu: [dz1 * F.xs[0], dz2 * F.xs[1]], dw: dz2 * F.h[1], du: dz1 * F.xs[0] + dz2 * F.xs[1] }; };
const B7 = {
  key: "B7",
  st: () => ({ w: -0.5, x2: 2, bu: -2, T: 20, mx: 3 }),
  parts: [
    { t: "Two steps forward", pts: 2, q: String.raw`A one-unit RNN has \(h_t = \tanh(w h_{t-1} + u x_t)\) with \(w = -0.5\), \(u = 1\), \(h_0 = 0\), and output \(\hat y = v h_2\) with \(v = 2\). The inputs are \(x = (1, 2)\) and the target is \(y = 1\), with \(L = \frac12(\hat y - y)^2\). Compute \(z_1, h_1, z_2, h_2, \hat y\) and \(L\).`,
      a: [String.raw`Step 1: \(z_1 = -0.5\cdot 0 + 1\cdot 1 = 1\), \(h_1 = \tanh 1 = 0.7616\).`,
        String.raw`Step 2: \(z_2 = -0.5\cdot 0.7616 + 1\cdot 2 = 1.6192\), \(h_2 = \tanh 1.6192 = 0.9245\).`,
        String.raw`\(\hat y = 2\cdot 0.9245 = 1.8490\) and \(L = \frac12(0.8490)^2 = 0.3604\).`,
        String.raw`The same \(w\) and \(u\) are used at both steps. That sharing is what makes the network recurrent.`],
      ans: String.raw`\(z = (1, 1.6192)\), \(h = (0.7616, 0.9245)\), \(\hat y = 1.8490\), \(L = 0.3604\).` },
    { t: "Backpropagation through time", pts: 2, q: String.raw`Compute \(\partial L/\partial v\), \(\partial L/\partial z_2\), \(\partial L/\partial z_1\), and \(\partial L/\partial w\) and \(\partial L/\partial u\) as sums of one term per step.`,
      a: [String.raw`\(\partial L/\partial\hat y = \hat y - y = 0.8490\), so \(\partial L/\partial v = 0.8490\cdot h_2 = 0.7849\).`,
        String.raw`\(\partial L/\partial h_2 = 0.8490\cdot v = 1.6980\), and through tanh \(\partial L/\partial z_2 = 1.6980(1 - 0.9245^2) = 1.6980\cdot 0.1453 = 0.2467\).`,
        String.raw`One step back: \(\partial L/\partial h_1 = w\cdot 0.2467 = -0.1233\), \(\partial L/\partial z_1 = -0.1233(1 - 0.7616^2) = -0.0518\).`,
        String.raw`\(\partial L/\partial w = \sum_t \frac{\partial L}{\partial z_t}h_{t-1} = -0.0518\cdot 0 + 0.2467\cdot 0.7616 = 0.1879\).`,
        String.raw`\(\partial L/\partial u = \sum_t \frac{\partial L}{\partial z_t}x_t = -0.0518\cdot 1 + 0.2467\cdot 2 = 0.4416\). Autograd gives the same three numbers.`],
      ans: String.raw`\(\partial L/\partial v = 0.7849\), \(\partial L/\partial z_2 = 0.2467\), \(\partial L/\partial z_1 = -0.0518\), \(\partial L/\partial w = 0.1879\), \(\partial L/\partial u = 0.4416\).` },
    { t: "One GRU step and the gate route", pts: 2, q: String.raw`A one-unit GRU in Ng's simplified form has \(\tilde c = \tanh(0.5\,c_{\text{prev}} + x - 0.25)\), \(\Gamma_u = \sigma(x - 2)\) and \(c = \Gamma_u\tilde c + (1 - \Gamma_u)c_{\text{prev}}\). With \(c_{\text{prev}} = 0.5\) and \(x = 1\), compute \(\tilde c\), \(\Gamma_u\) and \(c\). Along the direct route, by what factor is a gradient scaled over 20 steps at this gate, and at \(\Gamma_u = 0.05\)?`,
      a: [String.raw`\(\tilde c = \tanh(0.25 + 1 - 0.25) = \tanh 1 = 0.7616\) and \(\Gamma_u = \sigma(-1) = 0.2689\).`,
        String.raw`\(c = 0.2689\cdot 0.7616 + 0.7311\cdot 0.5 = 0.2048 + 0.3655 = 0.5704\).`,
        String.raw`The direct route \(c_{\text{prev}} \to c\) has factor \(1 - \Gamma_u\), with no tanh slope on it. Over 20 steps: \(0.7311^{20} = 0.0019\). At \(\Gamma_u = 0.05\): \(0.95^{20} = 0.358\).`,
        String.raw`A gate near 0 copies the memory forward almost unchanged, which is how gated units keep a gradient alive. PyTorch's nn.GRU calls the same gate \(z = 1 - \Gamma_u\).`],
      ans: String.raw`\(\tilde c = 0.7616\), \(\Gamma_u = 0.2689\), \(c = 0.5704\). Route factor 0.0019 over 20 steps, 0.358 at \(\Gamma_u = 0.05\).` },
    { t: "nn.GRU shapes and gradient clipping", pts: 2, q: String.raw`x has shape (8, 40, 5). What does nn.GRU(5, 16, batch_first=True) return, and how many parameters does it have? Compare with nn.LSTM(5, 16) and nn.RNN(5, 16). Then clip the gradient (2, 4, −4) by norm at 3, and by value at 3.`,
      a: [String.raw`out holds every step: (8, 40, 16). h_n holds the last state of each layer: (1, 8, 16).`,
        String.raw`Each block has \(HI + H^2 + 2H = 80 + 256 + 32 = 368\). The GRU has 3 blocks, 1,104 parameters. The LSTM has 4, 1,472. The plain RNN has 1, 368.`,
        String.raw`The norm is \(\sqrt{4 + 16 + 16} = 6 \gt 3\), so clip_grad_norm_ scales by \(3/6\): \((1, 2, -2)\), the same direction.`,
        String.raw`clip_grad_value_ cuts each entry to \([-3, 3]\): \((2, 3, -3)\), a different direction. Clip after backward and before optimizer.step().`],
      ans: String.raw`out (8, 40, 16), h_n (1, 8, 16), 1,104 parameters (LSTM 1,472, RNN 368). By norm \((1, 2, -2)\), by value \((2, 3, -3)\).` }
  ],
  ctl(k, st) {
    if (k <= 1) return sl("e3gw", "recurrent weight w", -2, 2, 0.05, st.w) + sl("e3gx", "input x₂", -2, 3, 0.1, st.x2);
    if (k === 2) return sl("e3gb", "gate bias b_u", -6, 2, 0.1, st.bu) + sl("e3gt", "steps T", 1, 60, 1, st.T);
    return sl("e3gm", "max_norm and clip value", 0.5, 7, 0.5, st.mx);
  },
  bind(k, st, redraw) {
    if (k <= 1) bindSl(st, [["e3gw", "w", 2], ["e3gx", "x2", 1]], redraw);
    if (k === 2) bindSl(st, [["e3gb", "bu", 1], ["e3gt", "T", 0]], redraw);
    if (k === 3) bindSl(st, [["e3gm", "mx", 1]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const F = grun(st.w, st.x2), X = [210, 410], bw = 108, bh = 54;
      s += rect(20, 83, 64, 54, "var(--sunk)", C.gray) + tx(52, 115, "h₀ = 0", "middle");
      X.forEach((x, t) => { const x1 = t ? X[0] + bw / 2 : 84; s += ln(x1, 110, x - bw / 2, 110, C.purple, 1.8) + tx((x1 + x - bw / 2) / 2, 100, `w = ${f(st.w, 2)}`, "middle") + ln(x, 216, x, 137, C.blue, 1.6) + tx(x + 8, 182, "u = 1", null) + rect(x - 24, 216, 48, 40, "var(--sunk)", C.gray) + tx(x, 241, f(F.xs[t], 1), "middle", "t") + tx(x, 276, `x${"₁₂"[t]}`, "middle") + rect(x - bw / 2, 83, bw, bh, "var(--bg)", C.purple) + tx(x, 105, `h = ${f(F.h[t + 1], 4)}`, "middle", "t") + tx(x, 125, `z = ${f(F.z[t], 4)}`, "middle"); });
      s += ln(X[1] + bw / 2, 110, 548, 110, C.teal, 1.8) + tx((X[1] + bw / 2 + 548) / 2, 100, "v = 2", "middle") + rect(548, 83, 100, bh, "var(--bg)", C.teal) + tx(598, 105, `ŷ = ${f(F.y, 4)}`, "middle", "t") + tx(598, 125, "output", "middle");
      s += tx(480, 210, `target 1`, null, "t") + tx(480, 234, `L = ½(ŷ − 1)² = ${f(F.L, 4)}`, null, "th");
      return { h: 296, s };
    }
    if (k === 1) {
      const G = gbp(st.w, st.x2), a = ML.axes(60, 20, 300, 220, { xmin: 0, xmax: 4, ymin: -0.6, ymax: 0.8, nx: 4, ny: 7, fx: () => "", fy: v => f(v, 1), yl: "term" });
      s += a.s + ln(a.X(0), a.Y(0), a.X(4), a.Y(0), C.gray, 1);
      [[G.cw[0], C.purple, "w, step 1"], [G.cw[1], C.purple, "w, step 2"], [G.cu[0], C.blue, "u, step 1"], [G.cu[1], C.blue, "u, step 2"]].forEach(([v, c, l], i) => { const vv = Math.max(-0.6, Math.min(0.8, v)); s += vbar(a.X(i + 0.2), a.Y(0), a.Y(0) - a.Y(vv), a.X(0.6) - a.X(0), c) + tx(a.X(i + 0.5), a.Y(-0.6) + 16, l, "middle") + tx(a.X(i + 0.5), vv >= 0 ? a.Y(vv) - 6 : a.Y(vv) + 14, f(v, 4), "middle"); });
      s += tx(400, 34, `∂L/∂ŷ = ${f(G.dy, 4)}`, null, "t") + tx(400, 58, `∂L/∂v = ${f(G.dv, 4)}`, null, "t") + tx(400, 82, `∂L/∂z₂ = ${f(G.dz2, 4)}`, null, "t") + tx(400, 106, `∂L/∂z₁ = ${f(G.dz1, 4)}`, null, "t") + tx(400, 138, `∂L/∂w = ${f(G.dw, 4)}`, null, "th") + tx(400, 162, `∂L/∂u = ${f(G.du, 4)}`, null, "th");
      s += tx(400, 196, `w(1 − h²) at step 2: ${f(st.w * (1 - G.F.h[2] ** 2), 4)}`, null) + tx(400, 214, `w(1 − h²) at step 1: ${f(st.w * (1 - G.F.h[1] ** 2), 4)}`, null) + tx(400, 238, "the step 1 term of w is 0", null) + tx(400, 256, "because h₀ = 0", null);
      return { h: 280, s };
    }
    if (k === 2) {
      const gu = sig(1 + st.bu), ct = th(0.5 * 0.5 + 1 - 0.25), c = gu * ct + (1 - gu) * 0.5, a = ML.axes(60, 14, 300, 230, { xmin: 0, xmax: 60, ymin: -12, ymax: 0, nx: 6, ny: 6, fx: v => v, fy: v => "1e" + v, xl: "steps", yl: "route factor" });
      const P1 = [], P2 = []; for (let t = 0; t <= 60; t++) { P1.push([a.X(t), a.Y(Math.max(-12, t * Math.log10(1 - gu)))]); P2.push([a.X(t), a.Y(Math.max(-12, t * Math.log10(0.5)))]); }
      s += a.s + ML.path(P2, C.coral, 1.8, "6 4") + ML.path(P1, C.teal, 2.2) + ln(a.X(st.T), a.Y(-12), a.X(st.T), a.Y(0), C.gray, 1, "4 4") + dot(a.X(st.T), a.Y(Math.max(-12, st.T * Math.log10(1 - gu))), 5, C.teal);
      s += tx(390, 34, `Γu = σ(1 ${st.bu < 0 ? "−" : "+"} ${f(Math.abs(st.bu), 1)}) = ${f(gu, 4)}`, null, "th") + tx(390, 60, `c̃ = tanh 1 = ${f(ct, 4)}`, null, "t") + tx(390, 84, `c = ${f(gu, 4)}·${f(ct, 4)} + ${f(1 - gu, 4)}·0.5`, null, "t") + tx(390, 106, `  = ${f(c, 4)}`, null, "t");
      s += tx(390, 140, `(1 − Γu)^${st.T} = ${fe((1 - gu) ** st.T, 4)}`, null, "th") + tx(390, 170, "teal: the gate route", null) + tx(390, 188, "coral dashes: a plain RNN with", null) + tx(390, 206, "factor 0.5 per step, for scale", null);
      return { h: 290, s };
    }
    const g = [2, 4, -4], m = st.mx, nrm = 6, byN = nrm > m ? g.map(v => v * m / nrm) : g, byV = g.map(v => Math.max(-m, Math.min(m, v))), cosv = (g[0] * byV[0] + g[1] * byV[1] + g[2] * byV[2]) / (6 * Math.hypot(...byV));
    const a = ML.axes(60, 20, 340, 220, { xmin: 0, xmax: 3, ymin: -5, ymax: 5, nx: 3, ny: 5, fx: () => "", fy: v => v, yl: "entry" });
    s += a.s + ln(a.X(0), a.Y(0), a.X(3), a.Y(0), C.gray, 1) + ln(a.X(0), a.Y(m), a.X(3), a.Y(m), C.coral, 1, "4 4") + ln(a.X(0), a.Y(-m), a.X(3), a.Y(-m), C.coral, 1, "4 4");
    [g, byN, byV].forEach((vec, j) => vec.forEach((v, i) => { const x = a.X(i + 0.15 + j * 0.24); s += vbar(x, a.Y(0), a.Y(0) - a.Y(v), a.X(0.2) - a.X(0), [C.gray, C.teal, C.purple][j]); }));
    [0, 1, 2].forEach(i => { s += tx(a.X(i + 0.5), a.Y(-5) + 16, `entry ${i + 1}`, "middle"); });
    s += tx(430, 40, `max = ${f(m, 1)}`, null, "th") + tx(430, 66, "grey: (2, 4, −4), norm 6", null) + tx(430, 90, `teal, by norm: (${byN.map(v => f(v, 2)).join(", ")})`, null, "t") + tx(430, 114, `purple, by value: (${byV.map(v => f(v, 2)).join(", ")})`, null, "t");
    s += tx(430, 146, `cosine with the original: 1 and ${f(cosv, 4)}`, null) + tx(430, 170, "by norm keeps the direction", null);
    return { h: 280, s };
  }
};

/* ====================================================================
   B8. Attention and transformers: three tokens in two dimensions
   ==================================================================== */
const AX = [[1, 0], [0, 1], [1, 1]], ATN = ["token 1", "token 2", "token 3"];
const attn = (scaled, causal) => AX.map((q, i) => { const sc = AX.map((k, j) => (causal && j > i) ? -Infinity : (q[0] * k[0] + q[1] * k[1]) / (scaled ? Math.SQRT2 : 1)), w = softmax(sc); return { sc, w, o: [w.reduce((s, v, j) => s + v * AX[j][0], 0), w.reduce((s, v, j) => s + v * AX[j][1], 0)] }; });
const pe = (pos, i, d) => (i % 2 ? Math.cos : Math.sin)(pos / Math.pow(10000, (i - i % 2) / d));
const heat = (W, x0, y0, cell, title) => { let s = tx(x0, y0 - 8, title, null, "t"); W.forEach((r, i) => r.forEach((v, j) => { s += `<rect x="${x0 + j * cell}" y="${y0 + i * cell}" width="${cell - 2}" height="${cell - 2}" rx="3" fill="${isFinite(v) ? C.blue : "var(--sunk)"}" opacity="${isFinite(v) ? 0.12 + 0.8 * v : 1}"/>` + tx(x0 + j * cell + cell / 2 - 1, y0 + i * cell + cell / 2 + 4, isFinite(v) ? f(v, 4) : "masked", "middle", v > 0.45 ? "t" : null); })); return s; };
const B8 = {
  key: "B8",
  st: () => ({ q: 0, scaled: 1, causal: 1, d: 96, h: 6, T: 50, pos: 3 }),
  parts: [
    { t: "Self-attention by hand", pts: 2, q: String.raw`Three tokens have embeddings \(\mathbf x_1 = (1, 0)\), \(\mathbf x_2 = (0, 1)\), \(\mathbf x_3 = (1, 1)\), and \(W_Q = W_K = W_V = I\), so \(Q = K = V = X\) with \(d_k = 2\). Compute the scores, the attention weights and the output for token 1.`,
      a: [String.raw`Scores for token 1: \(\mathbf q_1\cdot\mathbf k_j/\sqrt 2 = (1, 0, 1)/1.4142 = (0.7071, 0, 0.7071)\).`,
        String.raw`Softmax: \(e^{0.7071} = 2.0281\), so the weights are \((2.0281, 1, 2.0281)/5.0562 = (0.4011, 0.1978, 0.4011)\).`,
        String.raw`Output: \(0.4011(1, 0) + 0.1978(0, 1) + 0.4011(1, 1) = (0.8022, 0.5989)\).`,
        String.raw`By symmetry token 2 gives \((0.5989, 0.8022)\). Token 3 has scores \((0.7071, 0.7071, 1.4142)\), weights \((0.2483, 0.2483, 0.5035)\) and output \((0.7517, 0.7517)\).`],
      ans: String.raw`Scores \((0.7071, 0, 0.7071)\), weights \((0.4011, 0.1978, 0.4011)\), output \((0.8022, 0.5989)\).` },
    { t: "Why divide by the square root of d, and the causal mask", pts: 2, q: String.raw`Without the \(\sqrt{d_k}\), what are token 1's weights? Why does the scale matter for large \(d_k\)? Then add a causal mask, as in a GPT decoder. Give the weights and outputs of tokens 1 and 2, and say how the mask is applied.`,
      a: [String.raw`Unscaled scores \((1, 0, 1)\) give \((0.4223, 0.1554, 0.4223)\), a little sharper.`,
        String.raw`If the entries of \(\mathbf q\) and \(\mathbf k\) have variance 1, then \(\mathbf q\cdot\mathbf k\) has variance \(d_k\). At \(d_k = 64\) the scores spread by 8, the softmax saturates to one key and its gradient vanishes. Dividing by \(\sqrt{d_k}\) brings the spread back to 1.`,
        String.raw`The mask sets the scores of future tokens to \(-\infty\) before the softmax, so their weights are exactly 0. Token 1 sees only itself: weight 1, output \((1, 0)\).`,
        String.raw`Token 2 sees scores \((0, 0.7071)\): weights \((0.3302, 0.6698)\), output \((0.3302, 0.6698)\). Token 3 sees everything and is unchanged.`],
      ans: String.raw`Unscaled \((0.4223, 0.1554, 0.4223)\). Causal: token 1 \((1, 0)\), token 2 weights and output \((0.3302, 0.6698)\). Mask with \(-\infty\) before the softmax.` },
    { t: "Multi-head attention and the encoder layer", pts: 2, q: String.raw`nn.MultiheadAttention(embed_dim=96, num_heads=6). Give \(d_k\), the number of parameters, and the shape and float32 size of the attention weight tensor for a batch of 2 sequences of 50 tokens. How many parameters does nn.TransformerEncoderLayer(96, 6, dim_feedforward=384) have?`,
      a: [String.raw`\(d_k = 96/6 = 16\). The heads split one 96-wide projection, they do not add parameters.`,
        String.raw`Four 96 by 96 projections (\(W_Q, W_K, W_V, W_O\)) with biases: \(4\cdot 96^2 + 4\cdot 96 = 36864 + 384 = 37248\).`,
        String.raw`Weights (2, 6, 50, 50): 30,000 numbers, 120,000 bytes. They grow with the square of the length.`,
        String.raw`Encoder layer: attention 37,248, feed-forward \(96\cdot 384 + 384 + 384\cdot 96 + 96 = 74208\), two layer norms \(2\cdot 2\cdot 96 = 384\). Total 111,840.`],
      ans: String.raw`\(d_k = 16\), 37,248 parameters, weights (2, 6, 50, 50) at 120,000 bytes, encoder layer 111,840.` },
    { t: "Positional encoding and word order", pts: 2, q: String.raw`Write the sinusoidal code \(PE_{(pos, 2i)} = \sin(pos/10000^{2i/d})\), \(PE_{(pos, 2i+1)} = \cos(pos/10000^{2i/d})\) at position 3 for \(d = 4\). Without any positional code, what happens to the outputs of (a) when the tokens are fed in the order 3, 1, 2?`,
      a: [String.raw`\(d = 4\) has two frequencies, 1 and \(1/10000^{2/4} = 0.01\).`,
        String.raw`At position 3: \((\sin 3, \cos 3, \sin 0.03, \cos 0.03) = (0.1411, -0.9900, 0.0300, 0.9996)\).`,
        String.raw`Every code has squared length 2, and \(PE_p\cdot PE_{p+k}\) depends only on the offset \(k\): \(PE_1\cdot PE_3 = PE_2\cdot PE_4 = 0.5837\).`,
        String.raw`Without a code, self-attention is permutation equivariant: the outputs come back as \((0.7517, 0.7517), (0.8022, 0.5989), (0.5989, 0.8022)\), the same three rows in the new order. The model cannot tell the orders apart.`],
      ans: String.raw`\((0.1411, -0.9900, 0.0300, 0.9996)\). Without positions the outputs are only reordered, so order is invisible.` }
  ],
  ctl(k, st) {
    if (k === 0) return btns([[0, "token 1"], [1, "token 2"], [2, "token 3"]], "e3aq");
    if (k === 1) return btns([[1, "scaled"], [0, "unscaled"]], "e3as") + btns([[1, "causal mask"], [0, "no mask"]], "e3ac");
    if (k === 2) return btns([[1, "1 head"], [2, "2"], [4, "4"], [6, "6"], [8, "8"], [12, "12"]], "e3ah") + sl("e3ad", "model width d", 48, 768, 48, st.d) + sl("e3at", "tokens T", 10, 2000, 10, st.T);
    return sl("e3ap", "position", 0, 24, 1, st.pos);
  },
  bind(k, st, redraw) {
    if (k === 0) bindBt("e3b8x", "e3aq", st, "q", redraw);
    if (k === 1) { bindBt("e3b8x", "e3as", st, "scaled", redraw); bindBt("e3b8x", "e3ac", st, "causal", redraw); }
    if (k === 2) { bindBt("e3b8x", "e3ah", st, "h", redraw); bindSl(st, [["e3ad", "d", 0], ["e3at", "T", 0]], redraw); }
    if (k === 3) bindSl(st, [["e3ap", "pos", 0]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k <= 1) {
      const R = k === 0 ? attn(1, 0) : attn(st.scaled, st.causal), q = k === 0 ? st.q : -1, msk = k === 1 && st.causal;
      s += heat(R.map((r, i) => r.w.map((v, j) => msk && j > i ? -Infinity : v)), 30, 40, 62, k === 0 ? "weights, rows are queries" : `${st.scaled ? "scaled" : "unscaled"}${msk ? ", causal" : ", no mask"}`);
      ATN.forEach((n, i) => { s += tx(20, 40 + i * 62 + 35, `${i + 1}`, "end") + tx(30 + i * 62 + 30, 244, `key ${i + 1}`, "middle"); });
      const a = ML.axes(260, 20, 180, 200, { xmin: -0.2, xmax: 1.4, ymin: -0.2, ymax: 1.4, nx: 4, ny: 4, fx: v => f(v, 1), fy: v => f(v, 1) });
      s += a.s; AX.forEach((p, i) => { s += dot(a.X(p[0]), a.Y(p[1]), 5, C.teal) + tx(a.X(p[0]) + 8, a.Y(p[1]) - 6, `x${"₁₂₃"[i]}`, null); });
      R.forEach((r, i) => { s += dot(a.X(r.o[0]), a.Y(r.o[1]), i === q ? 7 : 4, C.coral, i !== q); });
      if (q >= 0) s += tx(a.X(R[q].o[0]) - 8, a.Y(R[q].o[1]) + 18, `out ${q + 1}`, "end");
      if (k === 0) s += tx(465, 40, `token ${q + 1}`, null, "th") + tx(465, 66, "scores", null) + tx(465, 84, `(${R[q].sc.map(v => f(v, 4)).join(", ")})`, null) + tx(465, 110, "weights", null) + tx(465, 128, `(${R[q].w.map(v => f(v, 4)).join(", ")})`, null) + tx(465, 154, "output", null) + tx(465, 172, `(${R[q].o.map(v => f(v, 4)).join(", ")})`, null, "t") + tx(465, 204, "teal: tokens, coral: outputs", null);
      else s += tx(465, 40, "outputs", null, "th") + R.map((r, i) => tx(465, 66 + i * 22, `${i + 1}: (${r.o.map(v => f(v, 4)).join(", ")})`, null, "t")).join("") + tx(465, 150, msk ? "future keys get −∞" : "every key visible", null) + tx(465, 168, msk ? "before the softmax" : "", null) + tx(465, 200, "hollow coral: outputs", null);
      return { h: 260, s };
    }
    if (k === 2) {
      const d = st.d, h = st.h, ok = d % h === 0, dk = d / h, P = 4 * d * d + 4 * d, E = P + 2 * d * 4 * d + 4 * d + d + 4 * d, mem = 2 * h * st.T * st.T * 4;
      s += tx(30, 34, `nn.MultiheadAttention(${d}, ${h})`, null, "th");
      if (!ok) { s += tx(30, 70, `AssertionError: embed_dim must be divisible by num_heads`, null, "t") + tx(30, 96, `${d} / ${h} = ${f(d / h, 2)} is not a whole number`, null); return { h: 140, s }; }
      for (let i = 0; i < h; i++) { s += `<rect x="${30 + i * 600 / h}" y="56" width="${600 / h - 4}" height="34" rx="4" fill="${i % 2 ? C.purple : C.blue}" opacity="0.6"/>`; if (h <= 8) s += tx(30 + i * 600 / h + 300 / h - 2, 78, `d_k ${dk}`, "middle"); }
      s += tx(30, 120, `d_k = ${d} / ${h} = ${dk}`, null, "t") + tx(30, 146, `parameters 4·${d}² + 4·${d} = ${P.toLocaleString("en-US")}, the same for every head count`, null, "t");
      s += tx(30, 176, `weights for B = 2, T = ${st.T}: (2, ${h}, ${st.T}, ${st.T}) = ${(2 * h * st.T * st.T).toLocaleString("en-US")} numbers`, null, "t") + tx(30, 200, `float32: ${mem >= 1048576 ? f(mem / 1048576, 1) + " MiB" : mem.toLocaleString("en-US") + " bytes"}`, null, "t");
      s += tx(30, 234, `TransformerEncoderLayer(${d}, ${h}, dim_feedforward=${4 * d}): ${E.toLocaleString("en-US")} parameters`, null, "th") + tx(30, 258, `attention ${P.toLocaleString("en-US")}, feed-forward ${(8 * d * d + 5 * d).toLocaleString("en-US")}, two layer norms ${4 * d}`, null);
      return { h: 280, s };
    }
    const D = 16, cell = 22, x0 = 40, y0 = 30;
    for (let p = 0; p < 25; p++) for (let i = 0; i < D; i++) { const v = pe(p, i, D); s += `<rect x="${x0 + i * cell}" y="${y0 + p * 9}" width="${cell - 1}" height="8" fill="${v >= 0 ? C.blue : C.coral}" opacity="${0.1 + 0.85 * Math.abs(v)}"/>`; }
    s += `<rect x="${x0 - 2}" y="${y0 + st.pos * 9 - 1}" width="${D * cell + 2}" height="10" fill="none" stroke="var(--fg)" stroke-width="1.5"/>` + tx(x0, 20, "d = 16, rows are positions 0 to 24, blue +, coral −", null);
    const v4 = [0, 1, 2, 3].map(i => pe(st.pos, i, 4)), v1 = [0, 1, 2, 3].map(i => pe(st.pos + 2, i, 4)), dt = v4.reduce((a, v, i) => a + v * v1[i], 0);
    s += tx(420, 50, `position ${st.pos}, d = 4:`, null, "th") + tx(420, 76, `(${v4.map(v => f(v, 4)).join(", ")})`, null, "t") + tx(420, 104, `PE_p · PE_p+2 = ${f(dt, 4)} for every p`, null) + tx(420, 130, "squared length 2 for every p", null);
    s += tx(420, 170, "without a code, order 3, 1, 2", null, "t") + tx(420, 192, "gives the rows of (a) reordered:", null) + tx(420, 212, "(0.7517, 0.7517), (0.8022, 0.5989),", null) + tx(420, 230, "(0.5989, 0.8022)", null);
    return { h: 270, s };
  }
};

/* ====================================================================
   Part A: twelve short questions over the whole course, 2 points each
   (the right answer is written first and moved by QPOS below)
   ==================================================================== */
const QA = [
  { q: "All 1,000 rows are standardized with StandardScaler, then split 800 and 200, and the test RMSE is reported. What is wrong?", o: ["the scaler's mean and standard deviation used the 200 test rows, so test information leaked. Fit it on the 800 training rows only", "nothing, scaling has no learned parameters", "the split must be 50 and 50 when a scaler is used", "the scaler must be fit after the model is trained"], a: 0, why: "A scaler has learned statistics. Fitting it on all rows lets the test rows shape the training features, so the test score is no longer a clean estimate. Fit on training rows, then transform validation and test with those numbers. Lessons 1 and 17." },
  { q: "a = [[0] * 2] * 2, then a[0][0] = 5, then print(a). What is printed?", o: ["[[5, 0], [5, 0]]", "[[5, 0], [0, 0]]", "[[5, 5], [0, 0]]", "a TypeError"], a: 0, why: "The outer * 2 repeats a reference to the same inner list, so both rows are one object and the change shows twice. [[0] * 2 for _ in range(2)] makes two lists. Lesson 4." },
  { q: "A is a NumPy array of shape (3, 4). Which line raises an error?", o: ["A + np.ones(3)", "A + np.ones(4)", "A * np.ones((3, 1))", "A @ np.ones(4)"], a: 0, why: "Shapes are compared from the right: 4 against 3, neither is 1. A + np.ones(4) broadcasts over rows, (3, 1) broadcasts over columns, and A @ np.ones(4) gives shape (3,). Lesson 9." },
  { q: "The Hessian of a quadratic cost has eigenvalues 8 and 0.5. For which learning rates does gradient descent converge?", o: ["0 < α < 0.25", "0 < α < 4", "0 < α < 2", "every α > 0"], a: 0, why: "Each eigen-direction shrinks by the factor 1 − αλ, which needs |1 − αλ| < 1, so α < 2/λmax = 2/8 = 0.25. The flat direction (0.5) then limits the speed. Lesson 16." },
  { q: "A regression's residuals are mostly small but a few sensor glitches give huge errors. Which loss suits this, and from which noise model?", o: ["MAE or Huber, from Laplace noise, because each point pulls with a bounded force", "MSE, from Gaussian noise, because it is differentiable", "cross-entropy, from Bernoulli noise", "R², because it is scale free"], a: 0, why: "MSE squares the residual, so one outlier dominates the fit. MAE follows from Laplace noise and estimates a median, Huber is quadratic near 0 and linear beyond δ. Lesson 18." },
  { q: "A model has training MSE 0.02 and validation MSE 1.8, and a simple baseline scores 1.0. What is the diagnosis and a fix?", o: ["high variance: get more data, regularize or stop earlier", "high bias: use a bigger model", "a data leak: the validation set is too easy", "a good fit: training error is low"], a: 0, why: "The gap between training and validation is large and validation is worse than the baseline: the model memorized the training set. Lesson 19." },
  { q: "x = torch.ones(3, requires_grad=True). Then (2 * x).sum().backward() is run twice. What is x.grad?", o: ["tensor([4., 4., 4.])", "tensor([2., 2., 2.])", "tensor([1., 1., 1.])", "an error, the graph was freed"], a: 0, why: "Each call builds a new graph with gradient 2 per entry, and .grad accumulates: 2 + 2 = 4. That is why the loop calls zero_grad. Lesson 22." },
  { q: "What does model.eval() do?", o: ["switches Dropout off and makes BatchNorm use its running statistics, while autograd stays on", "turns off gradient tracking", "freezes the weights so the optimizer cannot change them", "evaluates the model on the validation set"], a: 0, why: "eval() changes the behavior of layers like Dropout and BatchNorm. torch.no_grad() is the separate switch that stops building the graph. Lesson 24." },
  { q: "A binary classifier outputs the logit z = −1.3863 for a part. What is p = σ(z)?", o: ["0.2", "0.25", "0.8", "−0.2"], a: 0, why: "z is the log-odds: −1.3863 = ln 0.25, so the odds are 1 to 4 and p = 0.25/1.25 = 0.2. Lesson 29." },
  { q: "nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1) receives (4, 16, 30, 30). What is the output shape?", o: ["(4, 32, 15, 15)", "(4, 32, 14, 14)", "(4, 32, 30, 30)", "(4, 16, 15, 15)"], a: 0, why: "⌊(30 + 2 − 3)/2⌋ + 1 = ⌊14.5⌋ + 1 = 15, and the channels become 32. Lesson 36." },
  { q: "Which part of an LSTM lets information and gradients travel across many time steps?", o: ["the additive cell update c = Γf c_prev + Γu c̃, with a forget gate near 1", "the tanh on the hidden state", "the output gate", "gradient clipping inside the cell"], a: 0, why: "The cell state is carried forward by a multiplication with the forget gate only, with no squashing slope. A gate near 1 keeps both the memory and the gradient. Lesson 40." },
  { q: "Why does scaled dot-product attention divide the scores by √d_k?", o: ["with unit-variance entries a dot product has variance d_k, so large scores would saturate the softmax and shrink its gradient", "to make the weights sum to 1", "to save memory", "to make attention depend on word order"], a: 0, why: "Dividing by √d_k brings the spread of the scores back to about 1 whatever the key size. The softmax already makes the weights sum to 1. Lesson 41." }
];
/* vary the position of the right answer */
const QPOS = [1, 2, 3, 0, 2, 1, 3, 0, 1, 2, 0, 3];
QA.forEach((q, i) => { const c = q.o[q.a], rest = q.o.filter((_, j) => j !== q.a); rest.splice(QPOS[i], 0, c); q.o = rest; q.a = QPOS[i]; });

/* ====================================================================
   The lesson
   ==================================================================== */
addLesson("ml", "exam", {
level: "Core", num: "E3",
id: "ml-exam-e3", title: "Full mock final", short: "E3. Full mock final",
big: String.raw`A full mock final worth 100 points over the whole course. Part A is twelve short questions for 24 points, one or two from every part of the shelf: leakage, Python lists, broadcasting, learning rates, losses and noise, bias and variance, autograd, the training loop, logits, convolutions, LSTMs and attention. Part B is eight board problems for 76 points: linear regression and gradient descent by hand, likelihood and regularization, reading PyTorch code, a softmax classifier and its evaluation, a two-layer classifier forward and backward, a convolutional network, a recurrent unit and a GRU, and attention with the transformer. Every part has a worked solution that opens one line at a time and a picture you can move. Mark yourself as you go, and the score sheet tells you which lessons to reopen. All numbers are new and every one was checked in NumPy and PyTorch.`,
bridge: String.raw`E1 practiced the midterm and E2 the material after it. This lesson mixes the whole course the way a final that covers everything would, under one clock. It is the last lesson of the shelf.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. The exam", t: "How the mock final is built and how to time it",
intu: String.raw`Part A is twelve multiple-choice questions at 2 points each. Part B is eight board problems that add up to 76 points, each split into parts of 2 to 4 points. The largest is B5, a two-layer classifier forward and backward, because a network by hand comes back on every practice final of the course. Pick your time, then click a section to see what it covers and which lessons it draws on. The minutes are the points scaled to your time.`,
eq: String.raw`\[ 100 = \underbrace{12\times 2}_{\text{Part A}} + \underbrace{10 + 8 + 8 + 10 + 14 + 10 + 8 + 8}_{\text{Part B}} \]`,
sym: [["Part A", "12 short questions, 2 points each"], ["B1 to B8", "board problems with worked solutions"], ["minutes", "points times your time over 100"], ["self-mark", "none, half or full on each board part"]],
how: ["Choose the time, 120 minutes is a typical final.", "Take Part A without notes.", "Do B5 early, it carries the most points.", "Work each part on paper before opening a line of the solution.", "Mark each part honestly and open the score sheet."],
say: String.raw`The mock final has twelve short questions worth twenty-four points and eight board problems worth seventy-six, from linear regression by hand to attention, with the two-layer classifier as the largest problem.`,
num: String.raw`<b>100</b> points, <b>12</b> short questions and <b>8</b> board problems with <b>33</b> parts, about <b>120</b> minutes.`,
note: String.raw`Bring a calculator that does \(e^x\), \(\ln\), \(\tanh\) and square roots. Every board number was chosen to be done by hand in a few lines.`,
r(fig, ctl) {
  let T = 120, k = 0;
  ctl.innerHTML = btns([[90, "90 min"], [120, "120 min"], [150, "150 min"], [180, "180 min"]], "e3t") + btns(SECS.map((s, i) => [i, s.short]), "e3k") + `<div id="e3cv"></div>`;
  const u = () => {
    pick(ctl, "e3t", T); pick(ctl, "e3k", k);
    let s = "", x = 20;
    SECS.forEach((sc, i) => {
      const w = sc.pts * 6.4, on = i === k;
      s += `<rect x="${x}" y="30" width="${w - 2}" height="44" rx="5" fill="${on ? C.teal : i === 0 ? C.blue : C.purple}" opacity="${on ? 0.9 : 0.45}"/>` + tx(x + w / 2 - 1, 57, sc.short, "middle", "th");
      s += tx(x + w / 2 - 1, 94, sc.pts + " pt", "middle") + tx(x + w / 2 - 1, 112, f(sc.pts * T / 100, 0) + " min", "middle");
      x += w;
    });
    s += tx(20, 20, `${T} minutes for 100 points, ${f(T / 100 * 60, 0)} seconds per point`, null, "t");
    const sc = SECS[k];
    s += tx(20, 150, sc.name + ", " + sc.pts + " points, " + sc.lessons, null, "th");
    sc.topics.forEach((t, i) => { const c = i % 4, r = Math.floor(i / 4), xx = 20 + c * 162, y = 166 + r * 30; s += `<rect x="${xx}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(xx + 76, y + 16, t, "middle"); });
    fig.innerHTML = svg(166 + Math.ceil(sc.topics.length / 4) * 30 + 6, s);
    $("e3cv").innerHTML = `<p class="note"><b>${sc.name}</b>: about ${f(sc.pts * T / 100, 0)} minutes at your pace. ${k === 0 ? "Answer in order and commit before reading the feedback." : "Open the card, work the parts on paper, then reveal the solution one line at a time."}</p>`;
  };
  ctl.querySelectorAll("button[data-e3t]").forEach(b => b.onclick = () => { T = +b.dataset.e3t; u(); });
  ctl.querySelectorAll("button[data-e3k]").forEach(b => b.onclick = () => { k = +b.dataset.e3k; u(); });
  u();
}},

{s: "Part A", t: "Part A: twelve short questions over the whole course, 2 points each",
intu: String.raw`Twelve questions, one or two from every part of the shelf, in course order: a scaler that leaks, a list that is shared, a shape that does not broadcast, a learning rate limit, the loss for outliers, a bias or variance diagnosis, accumulated gradients, what eval does, a logit, a strided convolution, the LSTM memory and the attention scale. About a minute each. Commit before reading the feedback and count 2 points per correct answer.`,
eq: String.raw`\[ \text{Part A} = 2 \times (\text{number correct}), \qquad \text{at most } 24 \]`,
sym: [["Lessons 1 to 19", "data, Python, NumPy, linear models, losses"], ["Lessons 21 to 26", "autograd and the training loop"], ["Lessons 29 to 36", "logits and convolutions"], ["Lessons 39 to 42", "gated units and attention"]],
how: ["For a shape question, write the formula before the numbers.", "For a diagnosis, compare training, validation and the baseline.", "For a PyTorch question, ask what state the call changes."],
say: String.raw`Part A checks the quick facts across the course: where leakage hides, how Python and NumPy treat references and shapes, what limits a learning rate, which loss suits outliers, and what each PyTorch call and layer does.`,
num: String.raw`<b>12</b> questions, <b>2</b> points each, about a minute each, which leaves the rest of the clock for the board.`,
note: String.raw`The answer positions vary. Read every option before choosing, because two often differ only in a shape or a single word.`,
r(fig, ctl) { ML.quiz(fig, ctl, QA, "Part A"); }},

{s: "B1. Linear regression", t: "B1: a line by the normal equation, its residuals, one gradient step and scaling (10 points)",
intu: String.raw`The HW3 problem in miniature. Fit four points by the normal equation, check the residuals and the variance split, take one gradient descent step from zero and find the largest stable learning rate, then standardize the feature and watch the cost valley become round. Move \(\theta\) in (a) until the cost bottoms out, switch views in (b), slide the learning rate across the limit in (c), and toggle raw against standardized in (d).`,
eq: String.raw`\[ \boldsymbol\theta = (X^\top X)^{-1}X^\top\mathbf y, \qquad J(\boldsymbol\theta) = \frac{1}{2m}\lVert X\boldsymbol\theta - \mathbf y\rVert^2 \]
\[ \boldsymbol\theta := \boldsymbol\theta - \frac{\alpha}{m}X^\top(X\boldsymbol\theta - \mathbf y), \qquad \alpha \lt \frac{2}{\lambda_{\max}} \]`,
sym: [[String.raw`\(X\)`, "the design matrix, a column of ones and a column of x"], [String.raw`\(J\)`, "Ng's cost with the 1/2m factor"], [String.raw`\(\lambda_{\max}\)`, "the largest eigenvalue of (1/m) XᵀX"], [String.raw`\(\kappa\)`, "the condition number, the ratio of the eigenvalues"]],
how: ["Write the sums that fill XᵀX and Xᵀy.", "Invert the 2 by 2 by the determinant.", "Check that the residuals sum to 0.", "Update both parameters from the same gradient.", "Standardize with the training mean and standard deviation."],
say: String.raw`The normal equation gives theta equal to 1.6 and 1.1, the cost is 0.0875 and R squared 0.896, one step from zero at 0.1 lands at 0.325 and 0.625, rates above 0.476 diverge, and standardizing turns the condition number from 14.1 into 1.`,
num: String.raw`\(\boldsymbol\theta\) = (<b>1.6, 1.1</b>), residuals <b>0.4, −0.7, 0.2, 0.1</b>, \(J\) = <b>0.0875</b>, \(R^2\) = <b>0.896</b>, one step to (<b>0.325, 0.625</b>) with \(J\) = <b>2.2036</b>, limit <b>0.476</b>, \(\kappa\) <b>14.1</b> to <b>1</b>.`,
note: String.raw`HW3 checks the normal equation against gradient descent after 1500 steps. On the exam, say why they agree: the cost is convex, so both find the same minimum.`,
r(fig, ctl) { board(fig, ctl, B1); }},

{s: "B2. Likelihood and regularization", t: "B2: a Bernoulli MLE, mean against median, ridge in one weight, and a diagnosis (8 points)",
intu: String.raw`Four short parts on where losses come from and how to keep a model honest. Maximize a Bernoulli likelihood, pick the constant that Gaussian and Laplace noise each choose, shrink one weight with ridge, and read bias and variance off three numbers. Move \(p\) in (a), slide the constant and the outlier in (b), raise \(\lambda\) in (c) and switch between the two models and the sweep in (d).`,
eq: String.raw`\[ \ell(p) = k\ln p + (n - k)\ln(1 - p), \qquad \hat p = \frac{k}{n} \]
\[ w_{\text{ridge}} = \frac{\sum x_iy_i}{\sum x_i^2 + \lambda}, \qquad w := w\left(1 - \frac{\alpha\lambda}{m}\right) - \frac{\alpha}{m}\sum x_i(wx_i - y_i) \]`,
sym: [[String.raw`\(\ell(p)\)`, "the log-likelihood of k defects in n parts"], ["mean, median", "the MSE and the MAE minimizers"], [String.raw`\(\lambda\)`, "the L2 penalty weight"], ["bias, variance", "the gap to the baseline, the gap to validation"]],
how: ["Take the log, differentiate, set to zero.", "MSE picks the mean, MAE the median.", "Add λ to the denominator for ridge.", "Compare training with the baseline, then validation with training.", "Choose λ on validation and test once."],
say: String.raw`Seven defects in twenty-five give p hat equal to 0.28, the readings give a mean of 7 and a median of 5 that ignores the outlier, ridge with lambda 2 shrinks the weight from 2.071 to 1.8125, model A has high bias and model B high variance.`,
num: String.raw`\(\hat p\) = <b>0.28</b>, \(\ell\) = <b>−14.824</b>, mean <b>7</b> with MSE <b>38.8</b>, median <b>5</b> with MAE <b>4</b>, \(w\) = <b>2.071</b> and <b>1.8125</b>, shrink <b>0.9</b>, \(\lambda\) = <b>1</b>.`,
note: String.raw`HW7 Part 2 derives the MSE from Gaussian noise and Part 3 picks the degree on validation. When a final asks why MSE, answer with the noise model, not with convenience.`,
r(fig, ctl) { board(fig, ctl, B2); }},

{s: "B3. Reading PyTorch", t: "B3: predict the output of PyTorch code: shapes, gradients, a missing line and a module (8 points)",
intu: String.raw`Four code-reading parts, the kind of question that checks whether you can run PyTorch in your head. Predict the prints of a broadcasting snippet, follow gradients that accumulate and a detach that cuts a path, see what forgetting <code>zero_grad</code> does to a training run, and count a model's parameters and <code>state_dict</code> entries. Pick a line in (a), step through the code in (b), drag the step count in (c) and switch views in (d).`,
eq: String.raw`\[ \texttt{grad} \mathrel{+}= \frac{\partial L}{\partial x} \text{ on every backward}, \qquad \text{params} = \sum_{\text{layers}} (n_{\text{in}} n_{\text{out}} + n_{\text{out}}) \]`,
sym: [["broadcasting", "align shapes from the right, sizes must match or be 1"], ["accumulation", "backward adds into .grad until it is cleared"], [String.raw`\(\texttt{detach}\)`, "a copy autograd treats as a constant"], [String.raw`\(\texttt{state\_dict}\)`, "parameters and buffers by name"]],
how: ["Write each tensor's shape before its values.", "For a reduction, cross out the dimension it removes.", "For gradients, ask whether .grad was cleared.", "Count parameters layer by layer, then the buffers."],
say: String.raw`The broadcast product is 0, 1, 2 over 6, 8, 10, the second backward reads 18, the detach gives 2 instead of 4, without clearing the gradients the weight overshoots to 2.016 after three steps, and the model has 123 parameters and 9 state dictionary entries.`,
num: String.raw`sum (<b>3, 5, 7</b>), means (<b>1, 4</b>), gradients <b>9</b>, <b>18</b>, <b>2</b>, \(w\) = <b>0.976</b> against <b>2.016</b>, <b>123</b> parameters, <b>9</b> entries, <b>21</b> buffer numbers.`,
note: String.raw`HW4 asks the same kind of question with its BuggyRegressor. Run the snippet afterwards and compare, line by line, with what you wrote.`,
r(fig, ctl) { board(fig, ctl, B3); }},

{s: "B4. Softmax and evaluation", t: "B4: a softmax by hand, its weight gradient, a confusion matrix and a cost threshold (10 points)",
intu: String.raw`From the output of a classifier to the numbers you report. Compute a softmax, its cross-entropy and gradient, push the gradient into the weights, read a three-class confusion matrix, then choose a binary threshold by the cost of errors and count pairs for the AUC. Move the logits in (a), the input in (b), pick a class in (c), and slide the threshold and the miss cost in (d).`,
eq: String.raw`\[ \frac{\partial\ell}{\partial W} = (\mathbf p - \mathbf e_y)\,\mathbf x^\top, \qquad P = \frac{TP}{TP + FP}, \qquad R = \frac{TP}{TP + FN}, \qquad \tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}} \]`,
sym: [[String.raw`\(\mathbf e_y\)`, "the one-hot vector of the true class"], ["macro-F1", "the plain mean of the per-class F1"], [String.raw`\(C_{FN}, C_{FP}\)`, "cost of a miss and of a false alarm"], ["AUC", "share of (defective, good) pairs in the right order"]],
how: ["Exponentiate, sum, divide.", "Gradient: p minus the one-hot, times xᵀ.", "Precision divides by the column, recall by the row.", "Price each threshold with the two costs.", "Count the good scores below each defective one."],
say: String.raw`The softmax is 0.171, 0.766 and 0.063 with loss 0.266, the weight gradient is p minus e times x transposed, the matrix gives accuracy 0.80 and macro-F1 0.742, and with misses four times as costly the best threshold on these parts is 0.35 at cost 2, with AUC 0.857.`,
num: String.raw`\(\mathbf p\) = (<b>0.1710, 0.7662, 0.0629</b>), \(\ell\) = <b>0.2664</b>, accuracy <b>0.80</b>, macro-F1 <b>0.742</b>, cost <b>5</b> at 0.5, \(\tau^*\) = <b>0.2</b>, best <b>0.35</b> at cost <b>2</b>, AUC <b>0.857</b>.`,
note: String.raw`HW9 Problem 3 chooses the threshold on validation and reports the test cost once. A rule like \(\tau^*\) assumes calibrated probabilities, so check it against a scan.`,
r(fig, ctl) { board(fig, ctl, B4); }},

{s: "B5. Two-layer classifier", t: "B5: a 2-2-1 ReLU classifier forward, its loss, backward, and one step too far (14 points)",
intu: String.raw`The largest problem, because a network by hand is on every practice final. Count the parameters and choose the loss, run the forward pass to a probability, compute the batch loss and the silent double sigmoid, backpropagate through the ReLU, and take one SGD step. Move the input in (b) to switch units on and off, compare the four views in (c), switch to Leaky ReLU in (d), and in (e) watch a larger step kill the network's only live unit.`,
eq: String.raw`\[ \mathbf z^{[1]} = W^{[1]}\mathbf x + \mathbf b^{[1]}, \quad \mathbf a^{[1]} = \max(0, \mathbf z^{[1]}), \quad p = \sigma(W^{[2]}\mathbf a^{[1]} + b^{[2]}) \]
\[ \frac{\partial\ell}{\partial z^{[2]}} = p - y, \qquad \frac{\partial\ell}{\partial\mathbf z^{[1]}} = W^{[2]\top}(p - y)\odot\mathbb 1[\mathbf z^{[1]} \gt 0] \]`,
sym: [[String.raw`\(W^{[1]}\)`, "2 by 2, rows (1, −1) and (0.5, 2)"], [String.raw`\(W^{[2]}\)`, "1 by 2, (2, −1)"], [String.raw`\(p - y\)`, "the logit gradient of sigmoid with cross-entropy"], [String.raw`\(\mathbb 1[z \gt 0]\)`, "the ReLU slope, 1 or 0"]],
how: ["Write every z with its bias.", "Mark the units that are off.", "Start the backward pass at p − y.", "Through ReLU, zero the off units.", "Outer product with the layer input for each weight.", "Step, then rerun the forward pass."],
say: String.raw`The network has nine parameters, the part gives z of 1.5 and minus 1 and p equal to 0.924, the batch loss is 1.777 and a stray sigmoid makes it read 0.890, the gradient reaches only unit 1, and one step at 0.1 cuts the loss to 0.763 while a step above 0.135 switches unit 1 off too.`,
num: String.raw`<b>9</b> parameters, \(\mathbf z^{[1]}\) = (<b>1.5, −1</b>), \(p\) = <b>0.9241</b>, losses <b>2.5789</b> and <b>0.9741</b>, mean <b>1.7765</b> or <b>0.8902</b>, \(\partial\ell/\partial W^{[1]}\) rows (<b>3.6966, 1.8483</b>) and (<b>0, 0</b>), after the step \(\ell\) = <b>0.7632</b>, unit 1 off above \(\alpha\) = <b>0.135</b>.`,
note: String.raw`Every number was checked with PyTorch autograd and torch.optim.SGD on the same weights. Write each gradient's shape next to it, and say which units are off before you start the backward pass.`,
r(fig, ctl) { board(fig, ctl, B5); }},

{s: "B6. CNNs", t: "B6: a stride-2 convolution by hand, shapes and counts, pooling, receptive field and a shortcut (10 points)",
intu: String.raw`Four parts on convolutional and residual networks. Slide a 3 by 3 kernel over a 5 by 5 image with stride 2, follow the shapes and parameters of a small CNN until the Linear layer breaks, pool a block forward and backward and grow the receptive field layer by layer, then size a residual shortcut and compare plain and residual gradients. Step through the windows in (a), change the image size and the padding in (b), add layers in (c) and move the branch slope in (d).`,
eq: String.raw`\[ H_{\text{out}} = \left\lfloor\frac{H + 2p - k}{s}\right\rfloor + 1, \qquad \text{params} = C_{\text{out}}(C_{\text{in}}k^2 + 1) \]
\[ r_l = r_{l-1} + (k_l - 1)\,j_{l-1}, \qquad \frac{\partial\mathbf y}{\partial\mathbf x} = I + \frac{\partial F}{\partial\mathbf x} \]`,
sym: [["k, s, p", "kernel size, stride, padding"], [String.raw`\(r, j\)`, "receptive field and jump, in input pixels"], ["projection", "a 1 by 1 convolution on the shortcut"], ["frozen", "parameters with <code>requires_grad</code> False"]],
how: ["Do not flip the kernel.", "Write the size formula for every layer.", "Flatten keeps the batch dimension.", "Count weights plus one bias per output channel.", "A shortcut needs the same shape as F(x)."],
say: String.raw`The stride-2 convolution gives 1, 6, 6 and minus 1, the network flattens to 576 and has 7,018 parameters, max pooling sends the gradient only to the four winners, each final cell sees ten by ten pixels, and the shortcut is a one by one convolution with 216 parameters.`,
num: String.raw`output (<b>1, 6, 6, −1</b>), flatten <b>576</b>, parameters <b>80</b>, <b>1168</b>, <b>5770</b>, total <b>7,018</b>, pooled (<b>4, 5, 6, 7</b>), receptive field <b>10</b>, shortcut <b>216</b>, \(0.1^{10}\) against \(1.1^{10}\) = <b>2.59</b>, <b>2,052</b> trainable.`,
note: String.raw`HW10 B0 and B1 ask for this table of shapes before any code. The CNN here has fewer parameters than logistic regression on the raw pixels, which is the point of weight sharing.`,
r(fig, ctl) { board(fig, ctl, B6); }},

{s: "B7. RNNs and gates", t: "B7: a recurrent unit through two steps, BPTT, a GRU step, shapes and clipping (8 points)",
intu: String.raw`A one-unit RNN over two steps, small enough for a calculator, then the gated unit that fixes its memory. Move the recurrent weight and the second input in (a) and (b) and watch the states and the per-step gradient terms. In (c) the update gate sets how fast the memory route decays. In (d) clip one gradient two ways and compare the directions.`,
eq: String.raw`\[ h_t = \tanh(w h_{t-1} + u x_t), \qquad \frac{\partial L}{\partial w} = \sum_t\frac{\partial L}{\partial z_t}h_{t-1} \]
\[ c = \Gamma_u\tilde c + (1 - \Gamma_u)\,c_{\text{prev}}, \qquad \mathbf g := \mathbf g\,\min\left(1, \frac{c_{\max}}{\lVert\mathbf g\rVert}\right) \]`,
sym: [[String.raw`\(w, u, v\)`, "recurrent, input and output weights, shared by every step"], [String.raw`\(\Gamma_u\)`, "Ng's update gate, PyTorch's 1 − z"], [String.raw`\(\tilde c\)`, "the candidate memory"], [String.raw`\(c_{\max}\)`, "the length a clipped gradient may have"]],
how: ["Run the steps forward and keep every h.", "Start the backward pass at the output.", "Multiply by 1 − h² and then by w for each step back.", "Sum one term per step for each shared weight.", "Clip after backward and before step."],
say: String.raw`The states are 0.762 and 0.925, the loss is 0.360, the shared weight's gradient 0.188 is a sum of per-step terms, the GRU step gives 0.570 with a route that keeps 0.358 over twenty steps at a gate of 0.05, and clipping by norm halves the gradient without turning it.`,
num: String.raw`\(h\) = (<b>0.7616, 0.9245</b>), \(L\) = <b>0.3604</b>, \(\partial L/\partial w\) = <b>0.1879</b>, \(\partial L/\partial u\) = <b>0.4416</b>, \(c\) = <b>0.5704</b>, <b>0.0019</b> against <b>0.358</b>, <b>1,104</b> parameters, clipped (<b>1, 2, −2</b>).`,
note: String.raw`When a final asks why an RNN fails on long sequences, give the product of factors \(w(1 - h^2)\), then the fix for each case: clipping for exploding, gates for vanishing.`,
r(fig, ctl) { board(fig, ctl, B7); }},

{s: "B8. Attention", t: "B8: self-attention on three tokens, the scale and the causal mask, heads and positions (8 points)",
intu: String.raw`Three tokens in two dimensions, small enough to attend by hand. Compute one row of self-attention, remove the scale and add a causal mask, size a multi-head layer and an encoder block, and write a positional code. Pick a query in (a), toggle the scale and the mask in (b), change the width, heads and length in (c), and move the position in (d).`,
eq: String.raw`\[ \text{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} + M\right)V \]
\[ PE_{(pos, 2i)} = \sin\frac{pos}{10000^{2i/d}}, \qquad PE_{(pos, 2i+1)} = \cos\frac{pos}{10000^{2i/d}} \]`,
sym: [[String.raw`\(d_k\)`, "the key size, d over the number of heads"], [String.raw`\(M\)`, "the mask, 0 or minus infinity"], ["heads", "parallel attentions on slices of width d over h"], [String.raw`\(PE\)`, "the sinusoidal positional code"]],
how: ["Scores: dot products over the square root of the key size.", "Mask before the softmax.", "Weights times values gives the output.", "Four d by d projections for multi-head attention.", "Add the positional code to the embeddings."],
say: String.raw`Token 1 attends with weights 0.401, 0.198 and 0.401 to give 0.802 and 0.599, the causal mask leaves token 2 with 0.330 and 0.670, the six-head layer of width 96 has 37,248 parameters, and without positions a reordered sentence only reorders the outputs.`,
num: String.raw`weights (<b>0.4011, 0.1978, 0.4011</b>), output (<b>0.8022, 0.5989</b>), causal (<b>0.3302, 0.6698</b>), \(d_k\) = <b>16</b>, <b>37,248</b> and <b>111,840</b> parameters, \(PE_3\) = (<b>0.1411, −0.9900, 0.0300, 0.9996</b>).`,
note: String.raw`F.scaled_dot_product_attention reproduces (a) and (b) exactly, with is_causal=True for the mask. Say where the mask goes: on the scores, before the softmax, never on the weights after it.`,
r(fig, ctl) { board(fig, ctl, B8); }},

{s: "Score sheet", t: "Add up the marks and see what to reopen",
intu: String.raw`The sliders start at the marks you gave yourself on the board problems. Set Part A to twice the number you got right. Bars turn teal at 70% of their points. Every section below that is listed with the lessons to reopen. The total is shown on the common 90, 80, 70, 60 scale as a rough guide only, since the course's own scale may differ.`,
eq: String.raw`\[ \text{total} = \text{A} + \sum_{k=1}^{8}\text{B}k, \qquad \text{reopen if a section is below } 70\% \]`,
sym: [["A", "Part A points, 0 to 24"], ["B1 to B8", "board points from your self-marks"], ["70%", "the line below which a section needs work"]],
how: ["Set Part A from your quiz score.", "Check the board sliders against your marks.", "Reopen the lessons listed for each coral bar.", "Redo only those problems two days later.", "Then retake the Part tests of the weak parts."],
say: String.raw`The score sheet adds Part A and the eight board problems out of one hundred and lists the lessons behind every section below seventy percent.`,
num: String.raw`Total out of <b>100</b>. A section needs work below <b>70%</b> of its points.`,
note: String.raw`Half marks are for a correct method with one slip. A correct number without the steps earns little on a board problem, so mark it that way here too.`,
r(fig, ctl) {
  const init = sc => { const m = MARK[sc.key]; if (m && m.some(v => v != null)) return m.reduce((s, v) => s + (v || 0), 0); return Math.round(0.7 * sc.pts); };
  ctl.innerHTML = SECS.map((sc, i) => sl("e3sc" + i, sc.short, 0, sc.pts, sc.key === "A" ? 2 : 1, sc.key === "A" ? 18 : init(sc))).join("") + `<div id="e3so"></div>`;
  const u = () => {
    const v = SECS.map((_, i) => +$("e3sc" + i).value);
    v.forEach((x, i) => { $("e3sc" + i + "v").textContent = x + " / " + SECS[i].pts; });
    const tot = v.reduce((a, b) => a + b, 0);
    const a = ML.axes(60, 20, 430, 220, { xmin: 0, xmax: 9, ymin: 0, ymax: 100, nx: 9, ny: 5, fx: () => "", fy: v => v + "%", yl: "share of points", grid: false });
    let s = a.s + ln(a.X(0), a.Y(70), a.X(9), a.Y(70), C.coral, 1.2, "6 4") + tx(a.X(9) + 6, a.Y(70) + 4, "70%", null);
    v.forEach((x, i) => { const p = 100 * x / SECS[i].pts, x0 = a.X(i + 0.15), w = a.X(i + 0.85) - x0; s += `<rect x="${x0}" y="${a.Y(p)}" width="${w}" height="${a.Y(0) - a.Y(p)}" rx="3" fill="${p >= 70 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, SECS[i].short, "middle"); });
    const band = tot >= 90 ? "A range" : tot >= 80 ? "B range" : tot >= 70 ? "C range" : tot >= 60 ? "D range" : "below 60";
    s += tx(530, 70, `total ${tot} / 100`, null, "th") + tx(530, 96, band, null, "t") + tx(530, 120, "on a 90, 80, 70, 60 scale", null);
    fig.innerHTML = svg(270, s);
    const weak = v.map((x, i) => [x, i]).filter(([x, i]) => x < 0.7 * SECS[i].pts);
    $("e3so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SECS[i].name}</b> at ${x} of ${SECS[i].pts}: reopen ${SECS[i].lessons}, then ${i === 0 ? "retake Part A" : "redo the problem with the solution hidden"}.</p>`).join("")}</div>` : `<p class="note">Every section is at 70% or above. Keep it there with the Part tests (Lessons 11, 20, 28, 38 and 43) and the board problems of E1 and E2 in the last week.</p>`;
  };
  SECS.forEach((_, i) => { $("e3sc" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: check every board answer in code",
intu: String.raw`Once the paper is done, let the agent recompute every board number with NumPy and PyTorch and pin it in tests. np.linalg.solve checks B1, autograd checks the backward passes of B5 and B7, the real layers check the shapes and counts of B3, B6, B7 and B8, and <code>F.scaled_dot_product_attention</code> checks B8. A failing test means the paper or the code is wrong, and finding out which is the best revision there is.`,
eq: String.raw`\[ \texttt{b1\_linreg} \to \texttt{b3\_torch} \to \texttt{b5\_mlp} \to \texttt{b6\_cnn} \to \texttt{b8\_attention} \]`,
sym: [["b1 linreg", "normal equation, cost, one gradient step, eigenvalues"], ["b5 mlp", "forward, BCEWithLogitsLoss, autograd gradients, one SGD step"], ["b6 cnn", "F.conv2d with stride 2, the shape chain, parameter counts"], ["b8 attention", "<code>scaled_dot_product_attention</code>, counts, the positional code"]],
how: ["Finish the paper first.", "Paste the command.", "Read every assert: is each number one of yours?", "Run pytest and resolve each failure on paper.", "Commit the script with its tests."],
say: String.raw`The agent rebuilds each board problem in NumPy and PyTorch and pins the hand results in pytest, so the solver, autograd and the real layers check every fit, gradient, shape and count.`,
num: String.raw`Tests expect \(\boldsymbol\theta\) = (<b>1.6, 1.1</b>), \(\hat p\) = <b>0.28</b>, <b>123</b> parameters, \(\ell\) = <b>0.2664</b>, \(\partial\ell/\partial W^{[1]}\) row (<b>3.6966, 1.8483</b>), <b>7,018</b> parameters, \(\partial L/\partial w\) = <b>0.1879</b>, and attention output (<b>0.8022, 0.5989</b>).`,
note: String.raw`Ask for the B7 loss as \(\frac12(\hat y - y)^2\) and the B5 loss on part 1 alone, or the gradients will differ from yours by a factor of 2 or by the batch size.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/e3_check.py and tests/test_e3.py that recompute my mock final answers with numpy and torch. Tolerance 1e-3. (B1) x = (0, 1, 2, 3), y = (2, 2, 4, 5): np.linalg.solve gives theta (1.6, 1.1), J with 1/(2m) is 0.0875, R2 0.896, one gradient step from 0 at alpha 0.1 gives (0.325, 0.625), and the eigenvalues of X.T @ X / 4 are 0.2974 and 4.2026. (B2) 7 defects in 25: p_hat 0.28 and log-likelihood -14.824, the readings (1, 4, 5, 6, 19) give mean 7 and median 5, ridge w = 29 / (14 + 2) = 1.8125. (B3) the snippets in my notes print [[0, 1, 2], [6, 8, 10]], (3, 5, 7), [[1], [4]], gradients 9, 18 and 2, w after 3 SGD steps 0.976 with zero_grad and 2.016 without, and nn.Sequential(Linear(6, 10), BatchNorm1d(10), ReLU, Dropout(0.3), Linear(10, 3)) has 123 parameters and 9 state_dict keys. (B4) F.cross_entropy of logits (0.5, 2, -0.5) with class 1 is 0.2664 with gradient (0.1710, -0.2338, 0.0629), the confusion matrix in my notes has accuracy 0.80 and macro-F1 0.742, and roc_auc_score of my ten scores is 0.857. (B5) W1 = [[1, -1], [0.5, 2]], b1 = (0.5, -4), W2 = [[2, -1]], b2 = -0.5: logits 2.5 and -0.5 for x = (2, 1) and (-1, 1), BCEWithLogitsLoss mean 1.7765 for targets (0, 1), autograd on part 1 gives W1.grad rows (3.6966, 1.8483) and (0, 0), and one SGD step at 0.1 gives loss 0.7632. (B6) F.conv2d with stride 2 of my 5x5 image and kernel with bias 1 gives [[1, 6], [6, -1]], the CNN in my notes flattens to 576 and has 7018 parameters. (B7) the RNN with w -0.5, u 1, v 2 on x = (1, 2), y = 1 gives L 0.3604 and grads w 0.1879, u 0.4416, v 0.7849, nn.GRU(5, 16) has 1104 parameters, and clip_grad_norm_ at 3 turns (2, 4, -4) into (1, 2, -2). (B8) scaled_dot_product_attention with Q = K = V = [[1, 0], [0, 1], [1, 1]] gives row 1 (0.8022, 0.5989), with is_causal row 2 (0.3302, 0.6698), nn.MultiheadAttention(96, 6) has 37248 parameters and nn.TransformerEncoderLayer(96, 6, 384) 111840. Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_e3.py", "........                                                 [100%]", "8 passed"],
    checks: ["B1 uses np.linalg.solve or lstsq, not a second hand formula", "B5 and B7 use autograd on the given weights, with the loss on one example", "B4 uses F.cross_entropy on raw logits, no softmax first", "B6 uses F.conv2d with stride=2, which does not flip the kernel", "parameter counts use p.numel(), not a formula", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`The mock final is 100 points over the whole course: twelve short questions for 24 and eight board problems for 76. B1 fits a line by the normal equation, checks the residuals, takes one gradient step and standardizes the feature. B2 maximizes a Bernoulli likelihood, picks the mean or the median by the noise model, shrinks a weight with ridge and diagnoses bias and variance. B3 reads PyTorch code: broadcasting, accumulated gradients, detach, a missing <code>zero_grad</code> and a <code>state_dict</code>. B4 is a softmax and its gradient, a three-class confusion matrix, a cost threshold and the AUC. B5 is the two-layer classifier forward, backward and one step, with the double sigmoid and a unit that dies. B6 is a stride-2 convolution, the shapes and counts of a CNN, pooling, the receptive field and a residual shortcut. B7 runs an RNN through two steps, backpropagates through time, takes a GRU step and clips a gradient. B8 is self-attention on three tokens with the scale, the causal mask, the head count and the positional code. Mark honestly, and reopen what the score sheet names.`,
sheet: [[String.raw`\[ \boldsymbol\theta = (X^\top X)^{-1}X^\top\mathbf y, \qquad \alpha \lt \frac{2}{\lambda_{\max}\left(\frac1m X^\top X\right)} \]`, "B1: the normal equation and the gradient descent limit"],
  [String.raw`\[ \hat p = \frac{k}{n}, \qquad w_{\text{ridge}} = \frac{\sum x_iy_i}{\sum x_i^2 + \lambda} \]`, "B2: Bernoulli maximum likelihood and ridge in one weight"],
  [String.raw`\[ \text{params of nn.Linear}(n_{\text{in}}, n_{\text{out}}) = n_{\text{in}}n_{\text{out}} + n_{\text{out}} \]`, "B3: counting parameters"],
  [String.raw`\[ \frac{\partial\ell}{\partial W} = (\mathbf p - \mathbf e_y)\mathbf x^\top, \qquad \tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}} \]`, "B4: the softmax weight gradient and the cost threshold"],
  [String.raw`\[ \delta^{[1]} = \left(W^{[2]\top}(p - y)\right)\odot\mathbb 1[\mathbf z^{[1]} \gt 0], \qquad \frac{\partial\ell}{\partial W^{[1]}} = \delta^{[1]}\mathbf x^\top \]`, "B5: backpropagation through a ReLU layer to a sigmoid output"],
  [String.raw`\[ H_{\text{out}} = \left\lfloor\frac{H + 2p - k}{s}\right\rfloor + 1, \qquad r_l = r_{l-1} + (k_l - 1)j_{l-1} \]`, "B6: convolution size and the receptive field"],
  [String.raw`\[ \frac{\partial L}{\partial h_{t-1}} = w(1 - h_t^2)\frac{\partial L}{\partial h_t}, \qquad c = \Gamma_u\tilde c + (1 - \Gamma_u)c_{\text{prev}} \]`, "B7: one step of BPTT and the GRU memory"],
  [String.raw`\[ \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} + M\right)V, \qquad 4d^2 + 4d \text{ for nn.MultiheadAttention} \]`, "B8: attention with a mask and its parameter count"]],
sources: ["AME 5970 final practice exams 1 to 3, topic order (the PDFs were not available in this session, so the recurring topics follow the list in course/README_course_map.md)", "AME 5970 HW1 and HW2 solutions docs (lists, copies, broadcasting), the model for Part A", "AME 5970 HW3 solutions doc (normal equation, cost, gradient descent, scaling), the model for B1", "AME 5970 HW4 to HW6 solutions docs (autograd, nn.Module, the training loop, BatchNorm), the model for B3", "AME 5970 HW7 questions and solutions docs (likelihood, Huber, under and overfitting), the model for B2", "AME 5970 HW8 and HW9 questions and solutions docs (logistic regression by hand, metrics, cost thresholds), the model for B4 and B5", "AME 5970 HW10 questions and solutions docs (shape tables, Conv2d counts, residual gradient route), the model for B6", "Lessons 1 to 42 of this shelf, and the board problems of Lessons 20, 28, 38 and 43 and of E1 and E2", "Andrew Ng, Machine Learning Specialization, course 1 (linear and logistic regression, gradient descent, scaling, regularization) and course 2 (neural networks, softmax, evaluating a model)", "Andrew Ng, Deep Learning Specialization, course 1 (backpropagation), course 2 (initialization, optimization), course 4 (convolutions, ResNets) and course 5 (RNNs, GRU, LSTM, attention, transformers)", "Stanford CS229 lecture notes, Part I (least squares and the Gaussian likelihood) and Part II (the Bernoulli likelihood)", "Pascanu, Mikolov and Bengio (2013), On the difficulty of training recurrent neural networks, for clipping", "Cho et al. (2014), the GRU", "Vaswani et al. (2017), Attention is all you need, sections 3.2 and 3.5"]
});
})();
