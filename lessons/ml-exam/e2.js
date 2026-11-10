(function () {
/* ML shelf, Part 10, E2: final-style practice. A 100-point practice final over the material after the AME 5970 midterm (syllabus weeks 7 and 9 to 14, HW8 to HW10, and the RNN, LSTM, attention and transformer lessons of this shelf), with the recurring topics of the course's final practice exams as listed in course/README_course_map.md: choosing nn.Linear, nn.Conv2d or nn.LSTM, a forward pass and the MSE by hand, a two-layer ReLU network by hand, ReLU against sigmoid and tanh and dying ReLU, the Conv2d output size and parameter count, multi-class against multi-label, choosing the loss, exploding and vanishing gradients in RNNs, gradient clipping, LSTM gates, teacher forcing and exposure bias. Twelve short questions (Part A, 24 points) and eight board problems with worked solutions revealed one line at a time (Part B, 76 points), a score sheet that collects the self-marks, and the agent card. Follows HW8 Part 3, HW9 Problems 1 to 3 and HW10 Parts A to D, with Andrew Ng's Machine Learning Specialization course 1 week 3 and course 2 weeks 1 to 3 and the Deep Learning Specialization courses 1, 2, 4 and 5 as the spine. Every number was computed with NumPy and checked with PyTorch 2.15 on the CPU. All data and numbers are fresh. */
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

/* ---------- the exam: sections, points and the lessons behind them ---------- */
const SECS = [
  { key: "A", name: "Part A. Short questions", short: "A", pts: 24, lessons: "Lessons 29 to 42", topics: ["multi-label", "CrossEntropyLoss", "dying ReLU", "sigmoid depth", "Conv2d shape", "Conv2d count", "imbalance", "precision", "clipping", "teacher forcing", "LSTM shapes", "positions"] },
  { key: "B1", name: "B1. Logistic regression", short: "B1", pts: 8, lessons: "Lesson 29", topics: ["z and p", "binary cross-entropy", "p − y", "one step", "decision boundary", "threshold"] },
  { key: "B2", name: "B2. Softmax and choosing the loss", short: "B2", pts: 8, lessons: "Lesson 30", topics: ["softmax", "cross-entropy", "log-sum-exp", "multi-label", "loss chooser"] },
  { key: "B3", name: "B3. Evaluating a classifier", short: "B3", pts: 8, lessons: "Lesson 31", topics: ["confusion matrix", "precision, recall, F1", "threshold", "error costs", "AUC"] },
  { key: "B4", name: "B4. A two-layer ReLU network by hand", short: "B4", pts: 14, lessons: "Lessons 32 and 33", topics: ["parameter count", "forward pass", "MSE", "target shape", "backprop", "ReLU mask", "SGD step"] },
  { key: "B5", name: "B5. Activations, initialization and optimizers", short: "B5", pts: 8, lessons: "Lessons 34 and 35", topics: ["ReLU, sigmoid, tanh", "dying ReLU", "He and Xavier", "Adam", "dropout", "batch norm"] },
  { key: "B6", name: "B6. Convolutional networks", short: "B6", pts: 10, lessons: "Lessons 36 and 37", topics: ["cross-correlation", "output size", "parameter count", "max pooling", "residual shortcut"] },
  { key: "B7", name: "B7. A recurrent network by hand", short: "B7", pts: 10, lessons: "Lesson 39", topics: ["forward through time", "BPTT", "vanishing and exploding", "clipping", "teacher forcing"] },
  { key: "B8", name: "B8. LSTM, attention and choosing the layer", short: "B8", pts: 10, lessons: "Lessons 40 to 42", topics: ["LSTM step", "forget route", "LSTM count", "attention", "Linear, Conv2d or LSTM"] }
];
const MARK = {};

/* ---------- the board engine (the same as E1's) ----------
   P = { key, parts: [{t, pts, q, a: [lines], ans}], st: () => state, pic(k, st, shown) -> {h, s, html}, ctl(k, st) -> html, bind(k, st, redraw) }
   Solutions open one line at a time, the way they would be written on the board. Self-marks go into MARK for the score sheet. */
function board(fig, ctl, P) {
  const id = "e2" + P.key.toLowerCase(), st = P.st ? P.st() : {};
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
   B1. Logistic regression: w = (1.5, −2), b = 0.5, x = (1, 0.5), y = 0
   ==================================================================== */
const LW = [1.5, -2], LB = 0.5, LX = [1, 0.5];
const lstep = (al, x) => { const z = LW[0] * x[0] + LW[1] * x[1] + LB, p = sig(z), w = [LW[0] - al * p * x[0], LW[1] - al * p * x[1]], b = LB - al * p, z2 = w[0] * x[0] + w[1] * x[1] + b; return { z, p, w, b, z2, p2: sig(z2), l2: -Math.log(1 - sig(z2)) }; };
const B1 = {
  key: "B1",
  st: () => ({ x1: 1, x2: 0.5, al: 0.5, tau: 0.5 }),
  parts: [
    { t: "Score, probability and class", pts: 2, q: String.raw`A weld inspection model has \(\mathbf w = (1.5, -2)\) and \(b = 0.5\). A weld has features \(\mathbf x = (1, 0.5)\). Compute \(z\), \(p = \sigma(z)\) and the predicted class at \(\tau = 0.5\). Show the substitution.`,
      a: [String.raw`\(z = \mathbf w^\top\mathbf x + b = 1.5\cdot 1 + (-2)\cdot 0.5 + 0.5 = 1.5 - 1 + 0.5 = 1.0\).`,
        String.raw`\(p = \sigma(1) = \frac{1}{1 + e^{-1}} = \frac{1}{1 + 0.3679} = 0.7311\).`,
        String.raw`The rule predicts class 1 when \(p \ge \tau\). Since \(0.7311 \ge 0.5\), the prediction is class 1, a defective weld. The same decision follows from \(z \ge 0\) without the sigmoid.`],
      ans: String.raw`\(z = 1.0\), \(p = 0.7311\), predicted class 1.` },
    { t: "Binary cross-entropy", pts: 2, q: String.raw`The weld is in fact good, \(y = 0\). Compute the binary cross-entropy in nats. What would it be if the weld were defective, \(y = 1\)? And for \(y = 0\) if the model had said \(p = 0.99\)?`,
      a: [String.raw`\(\ell = -y\ln p - (1 - y)\ln(1 - p)\). With \(y = 0\) only the second term is left: \(\ell = -\ln(1 - 0.7311) = -\ln 0.2689 = 1.3133\).`,
        String.raw`With \(y = 1\) only the first term is left: \(\ell = -\ln 0.7311 = 0.3133\). The two differ by exactly \(z = 1\), because \(\ln\frac{p}{1 - p} = z\).`,
        String.raw`At \(p = 0.99\) and \(y = 0\): \(\ell = -\ln 0.01 = 4.6052\). A confident wrong answer costs far more than an unsure one, which is the point of the log.`],
      ans: String.raw`1.3133 for \(y = 0\), 0.3133 for \(y = 1\), and 4.6052 at \(p = 0.99\).` },
    { t: "The gradient and one step", pts: 2, q: String.raw`For \(y = 0\), find \(\partial\ell/\partial\mathbf w\) and \(\partial\ell/\partial b\). Take one gradient descent step with \(\alpha = 0.5\) and recompute \(p\) and the loss. How large would \(\alpha\) have to be for this one step to flip the prediction?`,
      a: [String.raw`For the sigmoid with binary cross-entropy, \(\partial\ell/\partial z = p - y = 0.7311\). Then \(\partial\ell/\partial\mathbf w = (p - y)\,\mathbf x = (0.7311, 0.3655)\) and \(\partial\ell/\partial b = 0.7311\).`,
        String.raw`\(\mathbf w := (1.5 - 0.5\cdot 0.7311,\ -2 - 0.5\cdot 0.3655) = (1.1345, -2.1828)\) and \(b := 0.5 - 0.3655 = 0.1345\).`,
        String.raw`New score \(z = 1.1345 - 1.0914 + 0.1345 = 0.1776\), so \(p = 0.5443\) and \(\ell = -\ln 0.4557 = 0.7859\). The loss fell from 1.3133, but the weld is still called defective.`,
        String.raw`Each step lowers \(z\) by \(\alpha(p - y)(\lVert\mathbf x\rVert^2 + 1) = \alpha\cdot 0.7311\cdot 2.25 = 1.6449\,\alpha\). The prediction flips when that passes 1, at \(\alpha \gt 0.608\).`],
      ans: String.raw`Gradient (0.7311, 0.3655) and 0.7311. After one step \(\mathbf w = (1.1345, -2.1828)\), \(b = 0.1345\), \(p = 0.5443\), loss 0.7859. A flip needs \(\alpha \gt 0.608\).` },
    { t: "Decision boundary and threshold", pts: 2, q: String.raw`Write the decision boundary of the original model at \(\tau = 0.5\) as a line in the \((x_1, x_2)\) plane. Where does it move at \(\tau = 0.8\), and what does the model now say about the weld at (1, 0.5)?`,
      a: [String.raw`At \(\tau = 0.5\) the boundary is \(z = 0\): \(1.5x_1 - 2x_2 + 0.5 = 0\), so \(x_2 = 0.75x_1 + 0.25\). Welds below the line have \(z \gt 0\) and are called defective.`,
        String.raw`At \(\tau\) the boundary is \(z = \ln\frac{\tau}{1 - \tau}\). For 0.8 that is \(\ln 4 = 1.3863\), so \(1.5x_1 - 2x_2 + 0.5 = 1.3863\) and \(x_2 = 0.75x_1 - 0.4431\).`,
        String.raw`The line keeps its slope 0.75 and moves down by 0.6931. The sigmoid does not bend it: a fixed probability of a linear score is still a straight line.`,
        String.raw`The weld has \(p = 0.7311 \lt 0.8\), so at \(\tau = 0.8\) it is called good. It sits between the two lines.`],
      ans: String.raw`\(x_2 = 0.75x_1 + 0.25\) at 0.5 and \(x_2 = 0.75x_1 - 0.4431\) at 0.8. At \(\tau = 0.8\) the weld is called good.` }
  ],
  ctl(k, st) {
    if (k <= 1) return sl("e2lx1", "x₁", -2, 3, 0.1, st.x1) + sl("e2lx2", "x₂", -2, 3, 0.1, st.x2);
    if (k === 2) return sl("e2lal", "learning rate α", 0, 2, 0.01, st.al);
    return sl("e2lta", "threshold τ", 0.05, 0.95, 0.01, st.tau);
  },
  bind(k, st, redraw) {
    if (k <= 1) bindSl(st, [["e2lx1", "x1", 1], ["e2lx2", "x2", 1]], redraw);
    if (k === 2) bindSl(st, [["e2lal", "al", 2]], redraw);
    if (k === 3) bindSl(st, [["e2lta", "tau", 2]], redraw);
  },
  pic(k, st) {
    let s = "";
    const z = LW[0] * st.x1 + LW[1] * st.x2 + LB, p = sig(z);
    if (k === 0) {
      const a = ML.axes(50, 14, 330, 250, { xmin: -6, xmax: 6, ymin: 0, ymax: 1, nx: 6, ny: 4, fx: v => v, fy: v => f(v, 2), xl: "score z", yl: "p = σ(z)" });
      const P = []; for (let i = 0; i <= 120; i++) { const v = -6 + 12 * i / 120; P.push([a.X(v), a.Y(sig(v))]); }
      const zc = Math.max(-6, Math.min(6, z));
      s += a.s + ML.path(P, C.blue, 2.2) + ln(a.X(-6), a.Y(0.5), a.X(6), a.Y(0.5), C.gray, 1, "5 4") + ln(a.X(zc), a.Y(0), a.X(zc), a.Y(sig(zc)), C.coral, 1.2, "3 3") + dot(a.X(zc), a.Y(sig(zc)), 6, p >= 0.5 ? C.coral : C.teal);
      s += tx(410, 34, `x = (${f(st.x1, 1)}, ${f(st.x2, 1)})`, null, "th") + tx(410, 62, `z = 1.5·${f(st.x1, 1)} − 2·${f(st.x2, 1)} + 0.5`, null, "t") + tx(410, 84, `  = ${f(z, 2)}`, null, "t") + tx(410, 112, `p = σ(z) = ${f(p, 4)}`, null, "t");
      s += tx(410, 140, `class ${p >= 0.5 ? "1, defective" : "0, good"}`, null, "th") + tx(410, 170, "grey dashes: τ = 0.5, where z = 0", null) + tx(410, 188, "coral dot: class 1, teal dot: class 0", null);
      return { h: 310, s };
    }
    if (k === 1) {
      const a = ML.axes(50, 14, 330, 250, { xmin: 0, xmax: 1, ymin: 0, ymax: 5, nx: 5, ny: 5, fx: v => f(v, 1), fy: v => v, xl: "model probability p", yl: "loss in nats" });
      const P1 = [], P0 = []; for (let i = 1; i < 200; i++) { const q = i / 200; P1.push([a.X(q), a.Y(Math.min(5, -Math.log(q)))]); P0.push([a.X(q), a.Y(Math.min(5, -Math.log(1 - q)))]); }
      const l1 = -Math.log(p), l0 = -Math.log(1 - p);
      s += a.s + ML.path(P1, C.teal, 2.2) + ML.path(P0, C.coral, 2.2) + ln(a.X(p), a.Y(0), a.X(p), a.Y(5), C.gray, 1, "4 4");
      if (l1 <= 5) s += dot(a.X(p), a.Y(l1), 5, C.teal); if (l0 <= 5) s += dot(a.X(p), a.Y(l0), 5, C.coral);
      s += tx(410, 34, `p = ${f(p, 4)}`, null, "th") + tx(410, 62, `y = 0: −ln(1 − p) = ${fe(l0)}`, null, "t") + tx(410, 86, `y = 1: −ln p = ${fe(l1)}`, null, "t") + tx(410, 110, `difference ${f(l0 - l1, 4)} = z`, null, "t");
      s += tx(410, 146, "coral: the loss when y = 0", null) + tx(410, 164, "teal: the loss when y = 1", null) + tx(410, 182, "both climb without bound at the", null) + tx(410, 200, "confident wrong end", null);
      return { h: 310, s };
    }
    if (k === 2) {
      const r = lstep(st.al, LX), a = ML.axes(50, 14, 330, 250, { xmin: 0, xmax: 2, ymin: 0, ymax: 1.5, nx: 4, ny: 3, fx: v => f(v, 1), fy: v => f(v, 1), xl: "learning rate α", yl: "loss after one step" });
      const P = []; for (let i = 0; i <= 100; i++) { const al = 2 * i / 100; P.push([a.X(al), a.Y(lstep(al, LX).l2)]); }
      s += a.s + ML.path(P, C.blue, 2.2) + ln(a.X(1 / 1.6449), a.Y(0), a.X(1 / 1.6449), a.Y(1.5), C.purple, 1.2, "5 4") + tx(a.X(1 / 1.6449) + 4, 30, "flip at 0.608", null) + dot(a.X(st.al), a.Y(r.l2), 6, C.coral);
      s += tx(410, 34, `α = ${f(st.al, 2)}`, null, "th") + tx(410, 62, `w = (${f(r.w[0], 4)}, ${f(r.w[1], 4)})`, null, "t") + tx(410, 84, `b = ${f(r.b, 4)}`, null, "t") + tx(410, 112, `z = ${f(r.z2, 4)}, p = ${f(r.p2, 4)}`, null, "t") + tx(410, 136, `loss ${f(r.l2, 4)} (was 1.3133)`, null, "t");
      s += tx(410, 164, r.p2 >= 0.5 ? "still called defective" : "now called good", null, "th") + tx(410, 192, "gradient (p − y)x = (0.7311, 0.3655)", null) + tx(410, 210, "bias gradient p − y = 0.7311", null);
      return { h: 310, s };
    }
    const t = st.tau, lg = Math.log(t / (1 - t)), a = ML.axes(50, 14, 300, 280, { xmin: -2, xmax: 3, ymin: -2, ymax: 3, nx: 5, ny: 5, fx: v => v, fy: v => v, xl: "x₁", yl: "x₂" });
    const yb = (x, c) => (1.5 * x + 0.5 - c) / 2;
    const poly = [[-2, yb(-2, lg)], [3, yb(3, lg)], [3, -2], [-2, -2]];
    s += clip("e2cpb1", 50, 14, 300, 280) + a.s + `<g clip-path="url(#e2cpb1)"><path d="M${poly.map(q => a.X(q[0]) + " " + a.Y(q[1])).join("L")}Z" fill="${C.coral}" fill-opacity="0.12"/>` + ln(a.X(-2), a.Y(yb(-2, 0)), a.X(3), a.Y(yb(3, 0)), C.gray, 1.4, "6 4") + ln(a.X(-2), a.Y(yb(-2, lg)), a.X(3), a.Y(yb(3, lg)), C.coral, 2.2) + `</g>`;
    const pw = sig(1), c1 = pw >= t;
    s += dot(a.X(1), a.Y(0.5), 6, c1 ? C.coral : C.teal) + tx(a.X(1) + 9, a.Y(0.5) - 8, "weld (1, 0.5)", null);
    s += tx(380, 34, `τ = ${f(t, 2)}, boundary z = ln(τ/(1 − τ)) = ${f(lg, 4)}`, null, "t") + tx(380, 60, `x₂ = 0.75 x₁ + ${f((0.5 - lg) / 2, 4)}`, null, "th");
    s += tx(380, 90, `weld: p = 0.7311 ${c1 ? "≥" : "<"} ${f(t, 2)}, class ${c1 ? 1 : 0}`, null, "t") + tx(380, 120, "shaded: called defective", null) + tx(380, 138, "grey dashes: the line at τ = 0.5", null) + tx(380, 156, "the slope stays 0.75 for every τ", null);
    return { h: 340, s };
  }
};

/* ====================================================================
   B2. Softmax, cross-entropy, multi-label and choosing the loss
   ==================================================================== */
const SZ = [1, 3, -1], TAGZ = [1.5, -1, 0, 3], TAGY = [1, 0, 1, 1], TAGN = ["crack", "pore", "inclusion", "scratch"], CLS = ["good", "crack", "pore"];
const softmax = z => { const m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
const TASKS = [
  { n: "tensile strength in MPa", out: "Linear(…, 1), no activation", inf: "the number itself", loss: "nn.MSELoss()", tg: "float32, shape (B, 1)", units: 1, kind: "reg" },
  { n: "weld passes or fails", out: "Linear(…, 1), one logit", inf: "torch.sigmoid(logit) ≥ τ", loss: "nn.BCEWithLogitsLoss()", tg: "float32 0 or 1, shape (B, 1)", units: 1, kind: "bin" },
  { n: "one of 5 defect types", out: "Linear(…, 5), five logits", inf: "argmax, or softmax for probabilities", loss: "nn.CrossEntropyLoss()", tg: "int64 class index, shape (B,)", units: 5, kind: "mc" },
  { n: "any of 4 defect tags", out: "Linear(…, 4), four logits", inf: "torch.sigmoid per tag ≥ τ", loss: "nn.BCEWithLogitsLoss()", tg: "float32 0 or 1, shape (B, 4)", units: 4, kind: "ml" }
];
const B2 = {
  key: "B2",
  st: () => ({ z0: 1, z1: 3, z2: -1, c: 0, mode: 0, task: 2 }),
  parts: [
    { t: "Softmax and cross-entropy", pts: 2, q: String.raw`A three-class model (good, crack, pore) outputs logits \(\mathbf z = (1, 3, -1)\). Compute the softmax probabilities, the predicted class, and the cross-entropy if the true class is 0, good.`,
      a: [String.raw`Exponentials: \(e^1 = 2.7183\), \(e^3 = 20.0855\), \(e^{-1} = 0.3679\). Their sum is 23.1717.`,
        String.raw`\(\mathbf p = (2.7183, 20.0855, 0.3679)/23.1717 = (0.1173, 0.8668, 0.0159)\). The three add to 1.`,
        String.raw`The largest logit wins: class 1, crack. Softmax keeps the order of the logits, so the argmax of \(\mathbf z\) is enough for the decision.`,
        String.raw`Cross-entropy for true class 0: \(\ell = -\ln p_0 = -\ln 0.1173 = 2.1429\). Written with logits: \(\ell = \ln\sum_j e^{z_j} - z_0 = \ln 23.1717 - 1 = 3.1429 - 1 = 2.1429\).`],
      ans: String.raw`\(\mathbf p = (0.1173, 0.8668, 0.0159)\), predicted crack, \(\ell = 2.1429\).` },
    { t: "Its gradient and big logits", pts: 2, q: String.raw`Give \(\partial\ell/\partial\mathbf z\) for the same example. Then the logits are \((1000, 1002, 998)\). What does a naive softmax in float32 return, and what do the stable softmax and the loss give?`,
      a: [String.raw`For softmax with cross-entropy, \(\partial\ell/\partial\mathbf z = \mathbf p - \mathbf e_y\). Subtract 1 from the true class only: \((0.1173 - 1,\ 0.8668,\ 0.0159) = (-0.8827, 0.8668, 0.0159)\). The components add to 0.`,
        String.raw`A step against it raises \(z_0\) and lowers \(z_1\) the most, which is what moves the prediction toward the true class.`,
        String.raw`Naive: \(e^{1000}\) is far above the float32 limit \(e^{88.7}\), so every exponential is inf and inf/inf gives nan for all three probabilities.`,
        String.raw`Stable: subtract the largest logit first. \((1000, 1002, 998) - 1002 = (-2, 0, -4)\), the same differences as \((1, 3, -1)\), so \(\mathbf p\) is again (0.1173, 0.8668, 0.0159).`,
        String.raw`The loss by log-sum-exp: \(\ln\sum_j e^{z_j} = 1002 + \ln(e^{-2} + 1 + e^{-4}) = 1002.1429\), and \(\ell = 1002.1429 - 1000 = 2.1429\). nn.CrossEntropyLoss does exactly this.`],
      ans: String.raw`\(\mathbf p - \mathbf e_0 = (-0.8827, 0.8668, 0.0159)\). Naive float32 gives nan, the stable form gives the same \(\mathbf p\) and \(\ell = 2.1429\).` },
    { t: "Multi-label", pts: 2, q: String.raw`A different model tags each part with any of four defects (crack, pore, inclusion, scratch). Its logits are \((1.5, -1, 0, 3)\) and the part has a crack, an inclusion and a scratch, target (1, 0, 1, 1). Compute the four probabilities, the four binary cross-entropies and their mean. Why is softmax wrong here?`,
      a: [String.raw`One sigmoid per tag: \(\sigma(1.5) = 0.8176\), \(\sigma(-1) = 0.2689\), \(\sigma(0) = 0.5\), \(\sigma(3) = 0.9526\).`,
        String.raw`Losses: \(-\ln 0.8176 = 0.2014\), \(-\ln(1 - 0.2689) = 0.3133\), \(-\ln 0.5 = 0.6931\), \(-\ln 0.9526 = 0.0486\).`,
        String.raw`Mean over the four tags: \((0.2014 + 0.3133 + 0.6931 + 0.0486)/4 = 0.3141\), the value of nn.BCEWithLogitsLoss with a float target of shape (B, 4).`,
        String.raw`Softmax would give (0.1728, 0.0142, 0.0386, 0.7745), which must add to 1. Three tags present cannot each get a high probability, so the model cannot say yes to all three.`],
      ans: String.raw`\(\mathbf p = (0.8176, 0.2689, 0.5, 0.9526)\), losses 0.2014, 0.3133, 0.6931, 0.0486, mean 0.3141. Tags are not exclusive, so each needs its own sigmoid.` },
    { t: "Choose the output and the loss", pts: 2, q: String.raw`For each task give the last layer, the PyTorch loss and the target dtype and shape: (i) tensile strength in MPa, (ii) a weld passes or fails, (iii) one of 5 defect types, (iv) any of 4 defect tags.`,
      a: [String.raw`(i) Regression: Linear(…, 1) with no activation, nn.MSELoss, float32 targets of shape (B, 1) to match the output.`,
        String.raw`(ii) Binary: one logit, nn.BCEWithLogitsLoss, float32 targets 0. or 1. of shape (B, 1). The sigmoid goes inside the loss, not in the model.`,
        String.raw`(iii) Multi-class: five logits, nn.CrossEntropyLoss, int64 class indices of shape (B,). No softmax in the model, the loss applies log-softmax itself.`,
        String.raw`(iv) Multi-label: four logits, nn.BCEWithLogitsLoss, float32 targets of shape (B, 4), one independent yes or no per tag.`],
      ans: String.raw`MSELoss with (B, 1) float, BCEWithLogitsLoss with (B, 1) float, CrossEntropyLoss with (B,) int64, BCEWithLogitsLoss with (B, 4) float.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e2sz0", "z₀ good", -4, 6, 0.1, st.z0) + sl("e2sz1", "z₁ crack", -4, 6, 0.1, st.z1) + sl("e2sz2", "z₂ pore", -4, 6, 0.1, st.z2);
    if (k === 1) return sl("e2sc", "add c to every logit", 0, 1000, 1, st.c);
    if (k === 2) return btns([[0, "one sigmoid per tag"], [1, "softmax over the tags"]], "e2smo");
    return btns(TASKS.map((t, i) => [i, `(${"i ii iii iv".split(" ")[i]}) ${t.n}`]), "e2stk");
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e2sz0", "z0", 1], ["e2sz1", "z1", 1], ["e2sz2", "z2", 1]], redraw);
    if (k === 1) bindSl(st, [["e2sc", "c", 0]], redraw);
    if (k === 2) bindBt("e2b2x", "e2smo", st, "mode", redraw);
    if (k === 3) bindBt("e2b2x", "e2stk", st, "task", redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0 || k === 1) {
      const z = k === 0 ? [st.z0, st.z1, st.z2] : SZ.map(v => v + st.c), p = softmax(z), E = z.map(Math.exp), sE = E.reduce((a, b) => a + b, 0);
      const naiveBad = k === 1 && Math.max(...z) > 88.72;
      const a = ML.axes(60, 20, 300, 230, { xmin: 0, xmax: 3, ymin: 0, ymax: 1, nx: 3, ny: 4, fx: () => "", fy: v => f(v, 2), yl: "probability", grid: false });
      s += a.s;
      p.forEach((q, i) => { const x0 = a.X(i + 0.18), w = a.X(i + 0.82) - x0; s += `<rect x="${x0}" y="${a.Y(q)}" width="${w}" height="${a.Y(0) - a.Y(q)}" rx="3" fill="${i === 0 ? C.teal : C.blue}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, CLS[i], "middle") + tx(x0 + w / 2, q > 0.88 ? a.Y(q) + 16 : a.Y(q) - 6, f(q, 4), "middle"); });
      if (k === 0) {
        s += tx(400, 34, `z = (${z.map(v => f(v, 1)).join(", ")})`, null, "th") + tx(400, 60, `e^z = (${E.map(v => f(v, 3)).join(", ")})`, null, "t") + tx(400, 82, `sum ${f(sE, 4)}`, null, "t");
        s += tx(400, 110, `predicted: ${CLS[p.indexOf(Math.max(...p))]}`, null, "t") + tx(400, 136, `loss if true class is good:`, null, "t") + tx(400, 158, `−ln ${f(p[0], 4)} = ${f(-Math.log(p[0]), 4)}`, null, "th") + tx(400, 190, "teal: the true class, good", null);
      } else {
        const g = p.map((q, i) => q - (i === 0 ? 1 : 0));
        s += tx(390, 34, `z = (${z.map(v => f(v, 0)).join(", ")})`, null, "th") + tx(390, 60, naiveBad ? "naive float32: e^z = (inf, inf, inf)" : `naive float32: e^z fits (max z ${f(Math.max(...z), 0)} < 88.72)`, null, "t");
        s += tx(390, 82, naiveBad ? "p = inf/inf = (nan, nan, nan)" : "naive and stable agree", null, naiveBad ? "th" : "t") + tx(390, 110, `stable: subtract ${f(Math.max(...z), 0)} first`, null, "t") + tx(390, 132, `p = (${p.map(v => f(v, 4)).join(", ")})`, null, "t");
        s += tx(390, 160, `loss −ln p₀ = ${f(-Math.log(p[0]), 4)} for every c`, null, "t") + tx(390, 192, `p − e₀ = (${g.map(v => f(v, 4)).join(", ")})`, null, "th") + tx(390, 214, "the gradient adds to 0", null);
      }
      return { h: 300, s };
    }
    if (k === 2) {
      const pr = st.mode === 0 ? TAGZ.map(sig) : softmax(TAGZ), a = ML.axes(60, 20, 330, 230, { xmin: 0, xmax: 4, ymin: 0, ymax: 1, nx: 4, ny: 4, fx: () => "", fy: v => f(v, 2), yl: "probability", grid: false });
      s += a.s + ln(a.X(0), a.Y(0.5), a.X(4), a.Y(0.5), C.gray, 1, "5 4");
      let tot = 0;
      pr.forEach((q, i) => { const x0 = a.X(i + 0.18), w = a.X(i + 0.82) - x0, l = -(TAGY[i] ? Math.log(q) : Math.log(1 - q)); tot += l; s += `<rect x="${x0}" y="${a.Y(q)}" width="${w}" height="${a.Y(0) - a.Y(q)}" rx="3" fill="${TAGY[i] ? C.coral : C.gray}" opacity="0.8"/>` + tx(x0 + w / 2, a.Y(0) + 16, TAGN[i], "middle") + tx(x0 + w / 2, q > 0.88 ? a.Y(q) + 16 : a.Y(q) - 6, f(q, 4), "middle"); });
      s += tx(420, 34, st.mode === 0 ? "sigmoid on each logit" : "softmax across the four", null, "th") + tx(420, 60, `sum of the bars ${f(pr.reduce((x, y) => x + y, 0), 4)}`, null, "t");
      s += tx(420, 88, "coral: tags present (1, 0, 1, 1)", null) + tx(420, 106, "grey dashes: τ = 0.5", null);
      s += tx(420, 134, "tags called present:", null, "t") + tx(420, 152, pr.map((q, i) => q >= 0.5 ? TAGN[i] : null).filter(Boolean).join(", ") || "none", null);
      if (st.mode === 0) s += tx(420, 180, `mean BCE ${f(tot / 4, 4)}`, null, "th"); else s += tx(420, 180, "only one tag can pass 0.5", null, "th") + tx(420, 200, "softmax forces the bars to share 1", null);
      return { h: 300, s };
    }
    const T = TASKS[st.task];
    s += tx(20, 26, `Task: ${T.n}`, null, "th");
    for (let i = 0; i < 4; i++) s += dot(60, 70 + i * 40, 12, C.gray, true);
    s += tx(60, 245, "features", "middle");
    for (let i = 0; i < 3; i++) s += dot(170, 90 + i * 40, 12, C.purple, true);
    s += tx(170, 245, "hidden", "middle");
    const n = T.units, oy = i => 150 - (n - 1) * 20 + i * 40;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) s += ln(72, 70 + i * 40, 158, 90 + j * 40, "var(--line)", 0.8);
    for (let j = 0; j < 3; j++) for (let i = 0; i < n; i++) s += ln(182, 90 + j * 40, 278, oy(i), "var(--line)", 0.8);
    for (let i = 0; i < n; i++) s += dot(290, oy(i), 12, T.kind === "reg" ? C.blue : T.kind === "mc" ? C.teal : C.coral);
    s += tx(290, 245, `${n} output${n > 1 ? "s" : ""}`, "middle");
    const rows = [["last layer", T.out], ["at inference", T.inf], ["training loss", T.loss], ["target", T.tg]];
    rows.forEach(([a, b], i) => { s += tx(350, 70 + i * 44, a, null) + tx(350, 90 + i * 44, b, null, "t"); });
    return { h: 260, s };
  }
};

/* ====================================================================
   B3. Evaluating a classifier: twelve parts, four defective
   ==================================================================== */
const SP = [0.92, 0.71, 0.45, 0.28], SN = [0.83, 0.55, 0.38, 0.22, 0.15, 0.12, 0.08, 0.05];
const cmAt = t => { const TP = SP.filter(v => v >= t).length, FP = SN.filter(v => v >= t).length, FN = 4 - TP, TN = 8 - FP, P = TP + FP ? TP / (TP + FP) : NaN, R = TP / 4, F1 = P + R > 0 && isFinite(P) ? 2 * P * R / (P + R) : 0; return { TP, FP, FN, TN, P, R, F1, A: (TP + TN) / 12, FPR: FP / 8 }; };
const ROC = (() => { const ts = [1.01, ...[...SP, ...SN].sort((a, b) => b - a), 0]; return ts.map(t => { const c = cmAt(t); return [c.FPR, c.R, t]; }); })();
const B3 = {
  key: "B3",
  st: () => ({ t: 0.5, cfn: 6 }),
  parts: [
    { t: "Confusion matrix at 0.5", pts: 2, q: String.raw`Twelve parts were scored by a defect model. Defective parts (positives): 0.92, 0.71, 0.45, 0.28. Good parts: 0.83, 0.55, 0.38, 0.22, 0.15, 0.12, 0.08, 0.05. At \(\tau = 0.5\) give the confusion matrix, precision, recall, F1 and accuracy.`,
      a: [String.raw`Flagged (score \(\ge 0.5\)): defective 0.92 and 0.71, good 0.83 and 0.55. So TP = 2, FP = 2, FN = 2 (0.45 and 0.28 are missed), TN = 6.`,
        String.raw`Precision = TP/(TP + FP) = 2/4 = 0.5, half of the flags are real. Recall = TP/(TP + FN) = 2/4 = 0.5, half of the defects are found.`,
        String.raw`F1 = \(\frac{2PR}{P + R} = \frac{2\cdot 0.5\cdot 0.5}{1.0} = 0.5\). Accuracy = (TP + TN)/12 = 8/12 = 0.667.`,
        String.raw`Compare a model that calls every part good: accuracy 8/12 = 0.667 as well, with recall 0. Accuracy alone cannot tell the two apart.`],
      ans: String.raw`TP 2, FP 2, FN 2, TN 6. Precision 0.5, recall 0.5, F1 0.5, accuracy 0.667, the same accuracy as calling everything good.` },
    { t: "Lower the threshold", pts: 2, q: String.raw`Repeat at \(\tau = 0.25\). Which numbers rise, which fall, and why can recall never fall when the threshold goes down?`,
      a: [String.raw`Flagged now: all four defective parts and the good parts 0.83, 0.55, 0.38. TP = 4, FP = 3, FN = 0, TN = 5.`,
        String.raw`Precision = 4/7 = 0.571, recall = 4/4 = 1.0, F1 = \(\frac{2\cdot 0.571\cdot 1}{1.571} = 0.727\), accuracy = 9/12 = 0.75.`,
        String.raw`Lowering \(\tau\) only adds flags. A part flagged at 0.5 is still flagged at 0.25, so TP can only grow and FN only shrink: recall never falls. Precision can go either way, because FP grows too.`],
      ans: String.raw`TP 4, FP 3, FN 0, TN 5. Precision 0.571, recall 1.0, F1 0.727, accuracy 0.75.` },
    { t: "A threshold from the cost of errors", pts: 2, q: String.raw`A missed defect costs 6 and a false alarm costs 1. Compute the total cost on these twelve parts at \(\tau\) = 0.5, 0.25, 0.14, and for flagging every part. What threshold does \(\tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}}\) suggest, and why does the scan disagree?`,
      a: [String.raw`Cost = 6 FN + 1 FP. At 0.5: \(6\cdot 2 + 2 = 14\). At 0.25: \(0 + 3 = 3\). At 0.14 (flags \(\ge 0.15\)): \(0 + 5 = 5\). Flag all: \(0 + 8 = 8\). Flag none: \(6\cdot 4 = 24\).`,
        String.raw`The formula: flag when \(p\,C_{FN} \gt (1 - p)\,C_{FP}\), so \(\tau^* = \frac{1}{1 + 6} = 0.143\).`,
        String.raw`The scan picks any \(\tau\) in (0.22, 0.28], cost 3. The formula assumes the scores are calibrated probabilities and many parts. Twelve parts are too few, and nothing says these scores are calibrated.`,
        String.raw`In practice: choose \(\tau\) by scanning the cost on the validation set, then use it once on the test set.`],
      ans: String.raw`Costs 14, 3, 5 and 8. \(\tau^* = 1/7 = 0.143\) for calibrated scores, the scan on these parts picks 0.25 at cost 3.` },
    { t: "ROC and AUC", pts: 2, q: String.raw`Compute the AUC by counting pairs: the share of (defective, good) pairs in which the defective part has the higher score. What does an AUC of 0.5 mean?`,
      a: [String.raw`There are \(4 \times 8 = 32\) pairs. For each defective score, count the good scores below it.`,
        String.raw`0.92 beats all 8. 0.71 beats 7 (not 0.83). 0.45 beats 6 (not 0.83, 0.55). 0.28 beats 5 (0.22, 0.15, 0.12, 0.08, 0.05).`,
        String.raw`AUC = \((8 + 7 + 6 + 5)/32 = 26/32 = 0.8125\). It is the area under the ROC curve, true positive rate against false positive rate as \(\tau\) sweeps from 1 to 0.`,
        String.raw`An AUC of 0.5 is a coin flip: a random defective part outranks a random good one half the time. AUC does not depend on \(\tau\), so it ranks models, not thresholds.`],
      ans: String.raw`AUC = 26/32 = 0.8125. AUC 0.5 means the scores rank no better than chance.` }
  ],
  ctl(k, st) {
    if (k <= 1 || k === 3) return sl("e2et", "threshold τ", 0, 1, 0.01, st.t);
    return sl("e2ec", "cost of a missed defect", 1, 12, 1, st.cfn) + sl("e2et", "threshold τ", 0, 1, 0.01, st.t);
  },
  bind(k, st, redraw) { bindSl(st, [["e2et", "t", 2]], redraw); if (k === 2) bindSl(st, [["e2ec", "cfn", 0]], redraw); },
  pic(k, st) {
    let s = "";
    const c = cmAt(st.t);
    if (k <= 1) {
      const X = v => 40 + v * 600;
      s += ln(40, 60, 640, 60, "var(--line)", 2);
      [0, 0.25, 0.5, 0.75, 1].forEach(v => { s += ln(X(v), 56, X(v), 64, "var(--p)", 1) + tx(X(v), 80, f(v, 2), "middle"); });
      SN.forEach((v, i) => { s += dot(X(v), 44, 6, C.blue, v < st.t) + tx(X(v), i % 2 ? 16 : 30, f(v, 2), "middle"); });
      SP.forEach(v => { s += dot(X(v), 98, 6, C.coral, v < st.t) + tx(X(v), 120, f(v, 2), "middle"); });
      s += ln(X(st.t), 20, X(st.t), 128, C.purple, 2, "5 4") + tx(X(st.t) + 6, 136, `τ = ${f(st.t, 2)}`, null);
      s += tx(40, 150, "blue: good parts, coral: defective, filled: flagged", null);
      const g = ML.grid([[c.TP, c.FN], [c.FP, c.TN]], { x: 150, y: 190, cell: 56, rowLab: ["defective", "good"], colLab: ["flagged", "passed"], hl: new Set(["0,0", "1,1"]), hl2: new Set(["0,1", "1,0"]) });
      s += g.s + tx(150, 178, "confusion matrix", null, "th");
      s += tx(380, 196, `precision ${isFinite(c.P) ? f(c.P, 3) : "none flagged"}`, null, "t") + tx(380, 220, `recall ${f(c.R, 3)}`, null, "t") + tx(380, 244, `F1 ${f(c.F1, 3)}`, null, "t") + tx(380, 268, `accuracy ${f(c.A, 3)}`, null, "t") + tx(380, 296, "teal: right, coral: errors", null);
      return { h: 320, s };
    }
    if (k === 2) {
      const cost = t => { const q = cmAt(t); return st.cfn * q.FN + q.FP; }, a = ML.axes(60, 14, 330, 250, { xmin: 0, xmax: 1, ymin: 0, ymax: 4 * st.cfn + 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => f(v, 0), xl: "threshold τ", yl: "total cost" });
      const P = []; for (let i = 0; i <= 400; i++) { const t = i / 400; P.push([a.X(t), a.Y(cost(t))]); }
      let best = [1e9, 0]; for (let i = 0; i <= 400; i++) { const t = i / 400, v = cost(t); if (v < best[0]) best = [v, t]; }
      const ts = 1 / (1 + st.cfn);
      s += a.s + ML.path(P, C.blue, 2) + ln(a.X(ts), a.Y(0), a.X(ts), a.Y(4 * st.cfn + 2), C.purple, 1.4, "5 4") + dot(a.X(st.t), a.Y(cost(st.t)), 6, C.coral);
      s += tx(420, 34, `miss costs ${st.cfn}, false alarm costs 1`, null, "t") + tx(420, 60, `at τ = ${f(st.t, 2)}: FN ${c.FN}, FP ${c.FP}`, null, "t") + tx(420, 84, `cost ${st.cfn}·${c.FN} + ${c.FP} = ${cost(st.t)}`, null, "th");
      s += tx(420, 116, `lowest cost on the scan: ${best[0]}`, null, "t") + tx(420, 140, `purple: τ* = 1/(1 + ${st.cfn}) = ${f(ts, 3)}`, null, "t") + tx(420, 158, `cost there ${cost(ts)}`, null) + tx(420, 186, "the formula needs calibrated scores", null) + tx(420, 204, "and many parts, the scan needs neither", null);
      return { h: 310, s };
    }
    const a = ML.axes(60, 14, 260, 260, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 4, ny: 4, fx: v => f(v, 2), fy: v => f(v, 2), xl: "false positive rate FP/8", yl: "recall TP/4" });
    const area = ROC.map(q => [a.X(q[0]), a.Y(q[1])]);
    s += a.s + `<path d="M${area.map(q => q[0] + " " + q[1]).join("L")}L${a.X(1)} ${a.Y(0)}L${a.X(0)} ${a.Y(0)}Z" fill="${C.teal}" fill-opacity="0.15"/>` + ML.path(area, C.teal, 2.2) + ln(a.X(0), a.Y(0), a.X(1), a.Y(1), C.gray, 1, "5 4");
    s += dot(a.X(c.FPR), a.Y(c.R), 6, C.coral);
    s += tx(360, 34, "AUC = 26 / 32 = 0.8125", null, "th") + tx(360, 60, `τ = ${f(st.t, 2)}: FPR ${f(c.FPR, 3)}, recall ${f(c.R, 3)}`, null, "t");
    const rows = SP.map(p => [p, SN.filter(n => n < p).length]);
    rows.forEach(([p, n], i) => { s += tx(360, 96 + i * 22, `defective ${f(p, 2)} beats ${n} of 8 good parts`, null); });
    s += tx(360, 196, "8 + 7 + 6 + 5 = 26 ordered pairs", null, "t") + tx(360, 222, "grey dashes: chance, AUC 0.5", null) + tx(360, 240, "each step up: one defect passes τ", null) + tx(360, 258, "each step right: one false alarm", null);
    return { h: 320, s };
  }
};

/* ====================================================================
   B4. A 3-2-1 ReLU network by hand
   ==================================================================== */
const NW1 = [[1, 0, 1], [-1, 2, 0.5]], NB1 = [0, 1], NW2 = [2, -1], NB2 = 0.5, NX1 = [1, -1, 2], NY1 = 6, NX2 = [0, 1, 1], NY2 = 1;
const nfwd = (x, W1, b1, W2, b2, leak) => { const z = W1.map((r, j) => r[0] * x[0] + r[1] * x[1] + r[2] * x[2] + b1[j]), a = z.map(v => v > 0 ? v : (leak || 0) * v); return { z, a, y: W2[0] * a[0] + W2[1] * a[1] + b2 }; };
const nbwd = (x, y, leak) => { const F = nfwd(x, NW1, NB1, NW2, NB2, leak), dy = 2 * (F.y - y), dW2 = F.a.map(v => dy * v), da = NW2.map(w => w * dy), dz = da.map((v, j) => v * (F.z[j] > 0 ? 1 : (leak || 0))), dW1 = dz.map(d => x.map(xi => d * xi)); return { F, dy, dW2, db2: dy, da, dz, dW1, db1: dz }; };
const nstep = (al, leak) => { const G = nbwd(NX1, NY1, leak), W1 = NW1.map((r, j) => r.map((w, i) => w - al * G.dW1[j][i])), b1 = NB1.map((b, j) => b - al * G.db1[j]), W2 = NW2.map((w, j) => w - al * G.dW2[j]), b2 = NB2 - al * G.db2, F = nfwd(NX1, W1, b1, W2, b2, leak); return { W1, b1, W2, b2, F, L: (F.y - NY1) ** 2 }; };
/* draw the network: node values and edge labels */
const NIX = 80, NHX = 320, NOX = 540, NIY = [60, 150, 240], NHY = [85, 215], NOY = 150;
/* vals = {x: [3 labels], h: [[above, inside] x 2], o}, edgeLab = {w1, w2} or null, hid = [below x 2], dead = [bool x 2] */
const netPic = (vals, edgeLab, hid, dead) => {
  let s = "";
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) { const x1 = NIX + 22, y1 = NIY[i], x2 = NHX - 30, y2 = NHY[j]; s += ln(x1, y1, x2, y2, dead && dead[j] ? "var(--line)" : (j ? C.purple : C.blue), dead && dead[j] ? 1 : 1.4); if (edgeLab) { const t = 0.28, xm = x1 + t * (x2 - x1), ym = y1 + t * (y2 - y1); s += `<rect x="${xm - 21}" y="${ym - 10}" width="42" height="17" rx="4" fill="var(--bg)" stroke="var(--line)" stroke-width="0.6"/>` + tx(xm, ym + 3, edgeLab.w1[j][i], "middle"); } }
  for (let j = 0; j < 2; j++) { const x1 = NHX + 30, y1 = NHY[j], x2 = NOX - 26, y2 = NOY; s += ln(x1, y1, x2, y2, dead && dead[j] ? "var(--line)" : C.teal, dead && dead[j] ? 1 : 1.6); if (edgeLab) { const xm = (x1 + x2) / 2, ym = (y1 + y2) / 2; s += `<rect x="${xm - 21}" y="${ym - 10}" width="42" height="17" rx="4" fill="var(--bg)" stroke="var(--line)" stroke-width="0.6"/>` + tx(xm, ym + 3, edgeLab.w2[j], "middle"); } }
  NIY.forEach((y, i) => { s += `<circle cx="${NIX}" cy="${y}" r="22" fill="var(--sunk)" stroke="${C.gray}" stroke-width="1.4"/>` + tx(NIX, y + 4, vals.x[i], "middle", "t") + tx(NIX - 30, y + 4, `x${"₁₂₃"[i]}`, "end"); });
  NHY.forEach((y, j) => { s += `<circle cx="${NHX}" cy="${y}" r="30" fill="${dead && dead[j] ? "var(--sunk)" : "var(--bg)"}" stroke="${j ? C.purple : C.blue}" stroke-width="1.8"/>` + tx(NHX, y - 38, vals.h[j][0], "middle", "t") + tx(NHX, y + 4, vals.h[j][1], "middle"); if (hid) s += tx(NHX, y + 48, hid[j], "middle"); });
  s += `<circle cx="${NOX}" cy="${NOY}" r="26" fill="var(--bg)" stroke="${C.teal}" stroke-width="2"/>` + tx(NOX, NOY + 4, vals.o, "middle", "t") + tx(NOX + 34, NOY + 4, "ŷ", null, "t");
  return s;
};
const B4 = {
  key: "B4",
  st: () => ({ nin: 3, nh: 2, x1: 1, x2: -1, x3: 2, view: 0, leak: 0, al: 0.01 }),
  parts: [
    { t: "Shapes and parameters", pts: 2, q: String.raw`The network is nn.Sequential(nn.Linear(3, 2), nn.ReLU(), nn.Linear(2, 1)). Give the shapes of \(W^{[1]}\), \(\mathbf b^{[1]}\), \(W^{[2]}\) and \(b^{[2]}\), and the number of parameters. What is the output shape for a batch of 16 examples?`,
      a: [String.raw`nn.Linear(n_in, n_out) stores its weight as (n_out, n_in) and its bias as (n_out,). So \(W^{[1]}\) is 2 by 3 and \(\mathbf b^{[1]}\) has 2 entries.`,
        String.raw`\(W^{[2]}\) is 1 by 2 and \(b^{[2]}\) has 1 entry.`,
        String.raw`Count: \(3\cdot 2 + 2 = 8\) in the first layer and \(2\cdot 1 + 1 = 3\) in the second, 11 in total. ReLU has none.`,
        String.raw`A batch of shape (16, 3) gives hidden activations (16, 2) and an output of shape (16, 1).`],
      ans: String.raw`(2, 3), (2,), (1, 2), (1,). 11 parameters. Output (16, 1).` },
    { t: "Forward pass", pts: 3, q: String.raw`\(W^{[1]} = \begin{bmatrix} 1 & 0 & 1 \\ -1 & 2 & 0.5\end{bmatrix}\), \(\mathbf b^{[1]} = (0, 1)\), \(W^{[2]} = \begin{bmatrix} 2 & -1\end{bmatrix}\), \(b^{[2]} = 0.5\). Compute \(\mathbf z^{[1]}\), \(\mathbf a^{[1]}\) and \(\hat y\) for \(\mathbf x = (1, -1, 2)\).`,
      a: [String.raw`Unit 1: \(z_1 = 1\cdot 1 + 0\cdot(-1) + 1\cdot 2 + 0 = 3\).`,
        String.raw`Unit 2: \(z_2 = -1\cdot 1 + 2\cdot(-1) + 0.5\cdot 2 + 1 = -1 - 2 + 1 + 1 = -1\).`,
        String.raw`ReLU: \(\mathbf a^{[1]} = (\max(0, 3), \max(0, -1)) = (3, 0)\). Unit 2 is off for this example.`,
        String.raw`Output: \(\hat y = 2\cdot 3 + (-1)\cdot 0 + 0.5 = 6.5\).`],
      ans: String.raw`\(\mathbf z^{[1]} = (3, -1)\), \(\mathbf a^{[1]} = (3, 0)\), \(\hat y = 6.5\).` },
    { t: "MSE on a batch, and a shape trap", pts: 2, q: String.raw`The target for \(\mathbf x\) is 6. A second example \((0, 1, 1)\) has target 1. Compute both outputs and the batch MSE. Then the targets are stored with shape (2,) while the output has shape (2, 1). What does nn.MSELoss return?`,
      a: [String.raw`Second example: \(\mathbf z^{[1]} = (0 + 0 + 1 + 0,\ 0 + 2 + 0.5 + 1) = (1, 3.5)\), both on, so \(\hat y = 2\cdot 1 - 3.5 + 0.5 = -1\).`,
        String.raw`Errors \(6.5 - 6 = 0.5\) and \(-1 - 1 = -2\). MSE \(= (0.25 + 4)/2 = 2.125\).`,
        String.raw`With targets (2,) and outputs (2, 1), broadcasting makes a 2 by 2 table of every output against every target: \(0.5^2, 5.5^2, 7^2, 2^2 = 0.25, 30.25, 49, 4\).`,
        String.raw`Its mean is \(83.5/4 = 20.875\). PyTorch only warns ("Using a target size … that is different to the input size"), it does not stop. Reshape the targets to (2, 1).`],
      ans: String.raw`Outputs 6.5 and −1, MSE 2.125. With (2,) targets the loss silently becomes 20.875.` },
    { t: "Backward pass", pts: 4, q: String.raw`For the first example alone with \(L = (\hat y - y)^2\), compute \(\partial L/\partial\hat y\), \(\partial L/\partial W^{[2]}\), \(\partial L/\partial b^{[2]}\), \(\partial L/\partial\mathbf a^{[1]}\), \(\partial L/\partial\mathbf z^{[1]}\), \(\partial L/\partial W^{[1]}\) and \(\partial L/\partial\mathbf b^{[1]}\).`,
      a: [String.raw`\(\partial L/\partial\hat y = 2(\hat y - y) = 2(6.5 - 6) = 1\).`,
        String.raw`Output layer: \(\partial L/\partial W^{[2]} = 1\cdot\mathbf a^{[1]\top} = (3, 0)\) and \(\partial L/\partial b^{[2]} = 1\).`,
        String.raw`Back into the hidden layer: \(\partial L/\partial\mathbf a^{[1]} = W^{[2]\top}\cdot 1 = (2, -1)\).`,
        String.raw`Through ReLU, multiply by \(g'(\mathbf z^{[1]}) = (1, 0)\) because \(z_2 = -1 \lt 0\): \(\partial L/\partial\mathbf z^{[1]} = (2, 0)\). The gradient stops at the off unit.`,
        String.raw`First layer: \(\partial L/\partial W^{[1]} = \partial L/\partial\mathbf z^{[1]}\,\mathbf x^\top = \begin{bmatrix} 2 & -2 & 4 \\ 0 & 0 & 0\end{bmatrix}\) and \(\partial L/\partial\mathbf b^{[1]} = (2, 0)\).`,
        String.raw`With Leaky ReLU at slope 0.01 the second row would be \(-0.01\,\mathbf x^\top = (-0.01, 0.01, -0.02)\) instead of zeros, and the unit could recover.`],
      ans: String.raw`1, (3, 0), 1, (2, −1), (2, 0), rows (2, −2, 4) and (0, 0, 0), and (2, 0). These are what PyTorch puts in .grad.` },
    { t: "One SGD step", pts: 3, q: String.raw`Take one SGD step with \(\alpha = 0.01\) and recompute \(\hat y\) and \(L\) for the first example. What happens with \(\alpha = 0.05\)?`,
      a: [String.raw`\(W^{[2]} := (2 - 0.03,\ -1 - 0) = (1.97, -1)\), \(b^{[2]} := 0.5 - 0.01 = 0.49\).`,
        String.raw`\(W^{[1]}\) row 1 := \((1 - 0.02,\ 0 + 0.02,\ 1 - 0.04) = (0.98, 0.02, 0.96)\). Row 2 is unchanged. \(\mathbf b^{[1]} := (-0.02, 1)\).`,
        String.raw`New forward: \(z_1 = 0.98 - 0.02 + 1.92 - 0.02 = 2.86\), \(z_2 = -1\) still. \(\hat y = 1.97\cdot 2.86 + 0.49 = 6.1242\).`,
        String.raw`\(L = 0.1242^2 = 0.0154\), down from 0.25.`,
        String.raw`With \(\alpha = 0.05\): \(z_1 = 2.3\) and \(\hat y = 1.85\cdot 2.3 + 0.45 = 4.705\), so \(L = 1.677\). The step overshot the target. The squared gradient norm is 38, so the first-order drop \(\alpha\cdot 38\) exceeds the whole loss 0.25 once \(\alpha \gt 0.0066\), and the curvature takes over.`],
      ans: String.raw`At \(\alpha = 0.01\): \(\hat y = 6.1242\), \(L = 0.0154\). At \(\alpha = 0.05\): \(\hat y = 4.705\), \(L = 1.677\), an overshoot.` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e2nin", "inputs", 1, 8, 1, st.nin) + sl("e2nh", "hidden units", 1, 8, 1, st.nh);
    if (k === 1) return sl("e2nx1", "x₁", -2, 3, 0.5, st.x1) + sl("e2nx2", "x₂", -2, 3, 0.5, st.x2) + sl("e2nx3", "x₃", -2, 3, 0.5, st.x3) + `<div class="row"><button id="e2nrs">Reset to (1, −1, 2)</button></div>`;
    if (k === 2) return btns([[0, "example 1"], [1, "example 2"], [2, "batch, target (2, 1)"], [3, "batch, target (2,)"]], "e2nv");
    if (k === 3) return btns([[0, "ReLU"], [1, "Leaky ReLU 0.01"]], "e2nlk");
    return sl("e2nal", "learning rate α", 0, 0.06, 0.001, st.al);
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e2nin", "nin", 0], ["e2nh", "nh", 0]], redraw);
    if (k === 1) { bindSl(st, [["e2nx1", "x1", 1], ["e2nx2", "x2", 1], ["e2nx3", "x3", 1]], redraw); $("e2nrs").onclick = () => { [["x1", 1], ["x2", -1], ["x3", 2]].forEach(([q, v], i) => { st[q] = v; $("e2nx" + (i + 1)).value = v; $("e2nx" + (i + 1) + "v").textContent = f(v, 1); }); redraw(); }; }
    if (k === 2) bindBt("e2b4x", "e2nv", st, "view", redraw);
    if (k === 3) bindBt("e2b4x", "e2nlk", st, "leak", redraw);
    if (k === 4) bindSl(st, [["e2nal", "al", 3]], redraw);
  },
  pic(k, st) {
    let s = "";
    const W1L = { w1: NW1.map(r => r.map(v => f(v, v % 1 ? 1 : 0))), w2: NW2.map(v => f(v, 0)) };
    if (k === 0) {
      const n = st.nin, h = st.nh, p1 = n * h + h, p2 = h + 1, cx = (cnt, i, top, gap) => top + i * gap - (cnt - 1) * gap / 2;
      for (let j = 0; j < h; j++) for (let i = 0; i < n; i++) s += ln(90, cx(n, i, 150, 30), 240, cx(h, j, 150, 30), "var(--line)", 0.8);
      for (let j = 0; j < h; j++) s += ln(240, cx(h, j, 150, 30), 380, 150, "var(--line)", 0.8);
      for (let i = 0; i < n; i++) s += dot(90, cx(n, i, 150, 30), 10, C.gray, true);
      for (let j = 0; j < h; j++) s += dot(240, cx(h, j, 150, 30), 11, C.blue, true);
      s += dot(380, 150, 11, C.teal, true) + tx(90, 290, `${n} inputs`, "middle") + tx(240, 290, `${h} hidden, ReLU`, "middle") + tx(380, 290, "1 output", "middle");
      s += tx(430, 40, `W[1]: (${h}, ${n}), b[1]: (${h},)`, null, "t") + tx(430, 64, `W[2]: (1, ${h}), b[2]: (1,)`, null, "t");
      s += tx(430, 100, `layer 1: ${n}·${h} + ${h} = ${p1}`, null, "t") + tx(430, 124, `layer 2: ${h}·1 + 1 = ${p2}`, null, "t") + tx(430, 152, `total ${p1 + p2}`, null, "th");
      s += tx(430, 190, `batch (16, ${n}) → (16, ${h}) → (16, 1)`, null) + tx(430, 214, "nn.Linear stores (out, in)", null);
      return { h: 310, s };
    }
    if (k === 1) {
      const x = [st.x1, st.x2, st.x3], F = nfwd(x, NW1, NB1, NW2, NB2), dead = F.z.map(v => v <= 0);
      s += netPic({ x: x.map(v => f(v, 1)), h: F.z.map((z, j) => [`z = ${f(z, 2)}`, `a = ${f(F.a[j], 2)}`]), o: f(F.y, 2) }, W1L, ["bias 0", "bias 1"], dead);
      s += tx(470, 230, "b[2] = 0.5", null) + tx(470, 254, `ŷ = 2·${f(F.a[0], 2)} − 1·${f(F.a[1], 2)} + 0.5`, null) + tx(470, 274, `   = ${f(F.y, 3)}`, null, "t");
      s += tx(20, 300, "grey unit: z ≤ 0, ReLU outputs 0 and passes no gradient", null);
      return { h: 312, s };
    }
    if (k === 2) {
      const F1 = nfwd(NX1, NW1, NB1, NW2, NB2), F2 = nfwd(NX2, NW1, NB1, NW2, NB2), v = st.view;
      if (v <= 1) {
        const x = v ? NX2 : NX1, F = v ? F2 : F1, y = v ? NY2 : NY1;
        s += netPic({ x: x.map(q => f(q, 0)), h: F.z.map((z, j) => [`z = ${f(z, 2)}`, `a = ${f(F.a[j], 2)}`]), o: f(F.y, 2) }, W1L, null, F.z.map(q => q <= 0));
        s += tx(470, 230, `target ${y}`, null, "t") + tx(470, 254, `error ${f(F.y - y, 2)}`, null, "t") + tx(470, 278, `squared ${f((F.y - y) ** 2, 4)}`, null, "th");
        return { h: 300, s };
      }
      const out = [F1.y, F2.y], tg = [NY1, NY2];
      if (v === 2) {
        const g = ML.grid([[out[0], tg[0], (out[0] - tg[0]) ** 2], [out[1], tg[1], (out[1] - tg[1]) ** 2]], { x: 120, y: 50, cell: 64, colLab: ["output (2, 1)", "target (2, 1)", "squared error"], rowLab: ["ex 1", "ex 2"], hl: new Set(["0,2", "1,2"]) });
        s += g.s + tx(120, 30, "shapes match: one error per example", null, "th") + tx(420, 90, "MSE = (0.25 + 4) / 2", null, "t") + tx(420, 116, "    = 2.125", null, "th");
      } else {
        const M = out.map(o => tg.map(t => (o - t) ** 2));
        const g = ML.grid(M, { x: 170, y: 60, cell: 72, colLab: ["target 6", "target 1"], rowLab: ["ŷ = 6.5", "ŷ = −1"], hl: new Set(["0,0", "1,1"]), hl2: new Set(["0,1", "1,0"]) });
        s += g.s + tx(120, 30, "(2, 1) minus (2,) broadcasts to (2, 2)", null, "th") + tx(420, 90, "mean of all four cells", null, "t") + tx(420, 116, "(0.25 + 30.25 + 49 + 4) / 4", null, "t") + tx(420, 142, "= 20.875, no error raised", null, "th") + tx(420, 176, "coral: pairs that should never meet", null);
      }
      return { h: 260, s };
    }
    if (k === 3) {
      const G = nbwd(NX1, NY1, st.leak ? 0.01 : 0);
      s += netPic({ x: NX1.map(q => f(q, 0)), h: G.dz.map((d, j) => [`∂L/∂a = ${f(G.da[j], 2)}`, `δ ${f(d, 2)}`]), o: "6.5" }, { w1: G.dW1.map(r => r.map(v => f(v, Math.abs(v) < 0.1 && v !== 0 ? 2 : 0))), w2: G.dW2.map(v => f(v, 0)) }, ["∂L/∂z = ∂L/∂b = " + f(G.db1[0], 2), "∂L/∂z = ∂L/∂b = " + f(G.db1[1], 2)], st.leak ? null : [false, true]);
      s += tx(470, 210, "∂L/∂ŷ = 2(6.5 − 6) = 1", null, "t") + tx(470, 234, "∂L/∂b[2] = 1", null) + tx(470, 256, "edge labels: ∂L/∂w", null) + tx(470, 278, st.leak ? "leaky: unit 2 slope 0.01" : "unit 2 off: its row is 0", null);
      return { h: 300, s };
    }
    const r = nstep(st.al), a = ML.axes(60, 14, 300, 240, { xmin: 0, xmax: 0.06, ymin: 0, ymax: 2, nx: 6, ny: 4, fx: v => f(v, 2), fy: v => f(v, 1), xl: "learning rate α", yl: "loss after one step" });
    const P = []; for (let i = 0; i <= 120; i++) { const al = 0.06 * i / 120; P.push([a.X(al), a.Y(Math.min(2, nstep(al).L))]); }
    s += a.s + ML.path(P, C.blue, 2.2) + ln(a.X(0), a.Y(0.25), a.X(0.06), a.Y(0.25), C.gray, 1, "5 4") + tx(a.X(0.06) - 4, a.Y(0.25) - 6, "before: 0.25", "end") + dot(a.X(st.al), a.Y(Math.min(2, r.L)), 6, C.coral);
    s += tx(390, 34, `α = ${f(st.al, 3)}`, null, "th") + tx(390, 60, `W[2] = (${f(r.W2[0], 3)}, ${f(r.W2[1], 0)}), b[2] = ${f(r.b2, 3)}`, null, "t") + tx(390, 82, `W[1] row 1 = (${r.W1[0].map(v => f(v, 3)).join(", ")})`, null, "t") + tx(390, 104, `b[1] = (${f(r.b1[0], 3)}, 1)`, null, "t");
    s += tx(390, 132, `z₁ = ${f(r.F.z[0], 4)}, ŷ = ${f(r.F.y, 4)}`, null, "t") + tx(390, 156, `L = ${f(r.L, 4)}`, null, "th") + tx(390, 186, "lowest loss near α = 0.0134", null) + tx(390, 204, "beyond it the step overshoots", null);
    return { h: 300, s };
  }
};

/* ====================================================================
   B5. Activations, initialization, Adam, dropout and batch norm
   ==================================================================== */
const ACTS = [["ReLU", z => Math.max(0, z), z => z > 0 ? 1 : 0, C.coral], ["sigmoid", sig, z => sig(z) * (1 - sig(z)), C.blue], ["tanh", th, z => 1 - th(z) ** 2, C.purple]];
const INITS = [["std 0.01", 0.01], ["Xavier √(2/384)", Math.sqrt(2 / 384)], ["He √(2/256)", Math.sqrt(2 / 256)], ["std 0.1", 0.1]];
const optRun = (s, kind) => { let w = 1, m = 0, v = 0; const W = [1]; [0.5, -1.5].forEach((g0, i) => { const g = g0 * s, t = i + 1; if (kind === 0) w -= 0.01 * g; else if (kind === 1) { m = 0.9 * m + 0.1 * g; w -= 0.01 * m; } else { m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g * g; w -= 0.01 * (m / (1 - 0.9 ** t)) / (Math.sqrt(v / (1 - 0.999 ** t)) + 1e-8); } W.push(w); }); return W; };
const BNX = [1, 2, 6, 7], DRA = [2, 4, 0, 1.2];
const B5 = {
  key: "B5",
  st: () => ({ z: 1.5, depth: 6, ini: 2, ls: 0, mask: [1, 0, 1, 1], keep: 0.75, train: 1, ga: 2, be: 0.5 }),
  parts: [
    { t: "ReLU, sigmoid, tanh and a dead unit", pts: 2, q: String.raw`Give the value and the derivative of ReLU, sigmoid and tanh at \(z = -2\), 0 and 1.5. If every layer of a 6-layer chain sits at \(z = 1.5\), by how much does each activation scale the gradient? A ReLU unit has \(\mathbf w = (0.5, -0.5)\) and \(b = -4\), and its inputs lie in \([0, 1]^2\). What happens to it?`,
      a: [String.raw`ReLU: values 0, 0, 1.5 and slopes 0, 0 (taken as 0 at 0), 1. Sigmoid: 0.1192, 0.5, 0.8176 with slopes \(\sigma(1 - \sigma)\) = 0.1050, 0.25, 0.1491. Tanh: −0.9640, 0, 0.9051 with slopes \(1 - \tanh^2\) = 0.0707, 1, 0.1807.`,
        String.raw`Six layers at \(z = 1.5\) multiply the gradient by \(0.1491^6 = 1.1\times 10^{-5}\) for sigmoid, \(0.1807^6 = 3.5\times 10^{-5}\) for tanh and \(1^6 = 1\) for ReLU. Even sigmoid's best slope 0.25 gives \(0.25^6 = 2.4\times 10^{-4}\).`,
        String.raw`The unit's largest score on \([0, 1]^2\) is \(0.5\cdot 1 - 0.5\cdot 0 - 4 = -3.5\). It is negative for every input, so the output and the gradient are 0 for every example. The unit is dead and gradient descent can never revive it.`,
        String.raw`Causes: a large step or a large negative bias. Remedies: a smaller learning rate, He initialization, or Leaky ReLU, whose slope 0.01 for \(z \lt 0\) keeps a small gradient flowing.`],
      ans: String.raw`Slopes at 1.5: ReLU 1, sigmoid 0.1491, tanh 0.1807, so six layers give 1, \(1.1\times 10^{-5}\) and \(3.5\times 10^{-5}\). The unit has \(z \le -3.5\) everywhere: dead.` },
    { t: "He and Xavier", pts: 2, q: String.raw`A ReLU layer has fan-in 256 and fan-out 128. Give the He and the Xavier (Glorot) standard deviations. With ReLU, each layer multiplies the signal's scale by about \(\sqrt{n_{\text{in}}\,\sigma^2/2}\). What is the scale after 10 such layers for std 0.01, Xavier, He and std 0.1?`,
      a: [String.raw`He: \(\sigma = \sqrt{2/n_{\text{in}}} = \sqrt{2/256} = 0.0884\). Xavier: \(\sigma = \sqrt{2/(n_{\text{in}} + n_{\text{out}})} = \sqrt{2/384} = 0.0722\).`,
        String.raw`Per layer factor \(\sqrt{256\,\sigma^2/2}\): std 0.01 gives 0.1131, Xavier 0.8165, He exactly 1, std 0.1 gives 1.1314.`,
        String.raw`After 10 layers: \(0.1131^{10} = 3.4\times 10^{-10}\), \(0.8165^{10} = 0.132\), \(1^{10} = 1\), \(1.1314^{10} = 3.44\). The gradient scales the same way on the way back.`,
        String.raw`He keeps the scale because ReLU zeroes half of its inputs, which the factor 2 makes up. Xavier was derived for tanh, which keeps both halves.`],
      ans: String.raw`He 0.0884, Xavier 0.0722. After 10 layers about \(3.4\times 10^{-10}\), 0.132, 1 and 3.44.` },
    { t: "Two Adam steps", pts: 2, q: String.raw`A weight starts at \(w = 1\) and sees the gradients 0.5 then −1.5. Take two Adam steps with \(\alpha = 0.01\), \(\beta_1 = 0.9\), \(\beta_2 = 0.999\) (ignore \(\varepsilon\)). Compare with plain SGD at the same \(\alpha\). What changes for each if every gradient is 100 times larger?`,
      a: [String.raw`Step 1: \(m = 0.1\cdot 0.5 = 0.05\), \(v = 0.001\cdot 0.25 = 0.00025\). Bias-corrected \(\hat m = 0.05/0.1 = 0.5\), \(\hat v = 0.00025/0.001 = 0.25\). Step \(0.01\cdot 0.5/\sqrt{0.25} = 0.01\), so \(w = 0.99\).`,
        String.raw`Step 2: \(m = 0.9\cdot 0.05 + 0.1\cdot(-1.5) = -0.105\), \(v = 0.999\cdot 0.00025 + 0.001\cdot 2.25 = 0.0024998\). \(\hat m = -0.105/0.19 = -0.5526\), \(\hat v = 0.0024998/0.001999 = 1.2505\).`,
        String.raw`Step \(0.01\cdot(-0.5526)/1.1183 = -0.00494\), so \(w = 0.99 + 0.00494 = 0.99494\).`,
        String.raw`SGD: \(w = 1 - 0.005 = 0.995\), then \(0.995 + 0.015 = 1.01\). With gradients 100 times larger SGD moves to 0.5 and then 2.0, while Adam's steps do not change: its first step is always \(\alpha\) in size, because it divides by the gradient's own scale.`],
      ans: String.raw`Adam: 0.99 then 0.99494. SGD: 0.995 then 1.01. Scaling the gradients by 100 changes SGD 100-fold and leaves Adam unchanged.` },
    { t: "Dropout and batch norm", pts: 2, q: String.raw`Inverted dropout with keep probability 0.75 draws the mask (1, 0, 1, 1) for the activations (2, 4, 0, 1.2). Give the output in training and in evaluation. Then batch norm sees one unit's values (1, 2, 6, 7) in a training batch. Normalize them, then apply \(\gamma = 2\), \(\beta = 0.5\).`,
      a: [String.raw`Training: keep and divide by 0.75, \((2, 4, 0, 1.2)\odot(1, 0, 1, 1)/0.75 = (2.6667, 0, 0, 1.6)\). The division keeps the expected value of each unit unchanged.`,
        String.raw`Evaluation (model.eval()): dropout does nothing, the output is (2, 4, 0, 1.2).`,
        String.raw`Batch norm: mean \(\mu = 16/4 = 4\), variance \(\sigma^2 = (9 + 4 + 4 + 9)/4 = 6.5\) (divide by m), \(\sigma = 2.5495\). \(\hat x = (-1.1767, -0.7845, 0.7845, 1.1767)\).`,
        String.raw`Scale and shift: \(2\hat x + 0.5 = (-1.8534, -1.0689, 2.0689, 2.8534)\). In evaluation the layer uses its running mean and variance instead of the batch's.`],
      ans: String.raw`Dropout: (2.6667, 0, 0, 1.6) in training, unchanged in eval. Batch norm: \(\hat x = (-1.1767, -0.7845, 0.7845, 1.1767)\), output (−1.8534, −1.0689, 2.0689, 2.8534).` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e2az", "pre-activation z", -4, 4, 0.1, st.z) + sl("e2ad", "layers in the chain", 1, 20, 1, st.depth);
    if (k === 1) return btns(INITS.map((q, i) => [i, q[0]]), "e2ai");
    if (k === 2) return sl("e2als", "gradient scale, log10", -2, 2, 0.1, st.ls);
    return `<div class="row">${[0, 1, 2, 3].map(i => `<button data-e2am="${i}">unit ${i + 1}: ${st.mask[i] ? "kept" : "dropped"}</button>`).join("")}</div>` + btns([[1, "training"], [0, "evaluation"]], "e2atr") + sl("e2ag", "γ", 0.5, 3, 0.1, st.ga) + sl("e2ab", "β", -2, 2, 0.1, st.be);
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e2az", "z", 1], ["e2ad", "depth", 0]], redraw);
    if (k === 1) bindBt("e2b5x", "e2ai", st, "ini", redraw);
    if (k === 2) bindSl(st, [["e2als", "ls", 1]], redraw, { ls: v => "×" + fe(Math.pow(10, v), 2) });
    if (k === 3) {
      $("e2b5x").querySelectorAll("button[data-e2am]").forEach(b => b.onclick = () => { const i = +b.dataset.e2am; st.mask[i] = 1 - st.mask[i]; b.textContent = `unit ${i + 1}: ${st.mask[i] ? "kept" : "dropped"}`; b.classList.toggle("on", !st.mask[i]); redraw(); });
      bindBt("e2b5x", "e2atr", st, "train", redraw); bindSl(st, [["e2ag", "ga", 1], ["e2ab", "be", 1]], redraw);
    }
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const a = ML.axes(50, 14, 300, 120, { xmin: -4, xmax: 4, ymin: -1, ymax: 4, nx: 8, ny: 5, fx: v => v, fy: v => v, yl: "g(z)" });
      const b = ML.axes(50, 170, 300, 110, { xmin: -4, xmax: 4, ymin: 0, ymax: 1, nx: 8, ny: 2, fx: v => v, fy: v => f(v, 1), xl: "z", yl: "g′(z)" });
      s += clip("e2cpb5", 50, 14, 300, 120) + a.s + b.s + `<g clip-path="url(#e2cpb5)">`;
      ACTS.forEach(([, g, d, col]) => { const P = [], Q = []; for (let i = 0; i <= 160; i++) { const z = -4 + 8 * i / 160; P.push([a.X(z), a.Y(g(z))]); Q.push([b.X(z), b.Y(d(z))]); } s += ML.path(P, col, 2); s += `</g>` + ML.path(Q, col, 2) + `<g clip-path="url(#e2cpb5)">`; });
      s += `</g>` + ln(a.X(st.z), 14, a.X(st.z), 134, C.gray, 1, "4 4") + ln(b.X(st.z), 170, b.X(st.z), 280, C.gray, 1, "4 4");
      ACTS.forEach(([n, g, d, col], i) => { const dv = d(st.z); s += tx(390, 34 + i * 62, n, null, "th") + tx(390, 54 + i * 62, `g = ${f(g(st.z), 4)}, g′ = ${f(dv, 4)}`, null, "t") + tx(390, 74 + i * 62, `g′ to the power ${st.depth}: ${fe(Math.pow(dv, st.depth), 2)}`, null); s += dot(390 - 12, 30 + i * 62, 5, col); });
      s += tx(390, 232, "dead unit: z ≤ 0.5 − 4 = −3.5", null, "t") + tx(390, 252, "on all of [0, 1]², so ReLU gives", null) + tx(390, 270, "0 and passes 0 back, forever", null);
      return { h: 300, s };
    }
    if (k === 1) {
      const a = ML.axes(60, 14, 360, 250, { xmin: 0, xmax: 10, ymin: -10, ymax: 2, nx: 10, ny: 6, fx: v => v, fy: v => "1e" + v, xl: "layer", yl: "signal scale, log scale" });
      s += a.s + ln(a.X(0), a.Y(0), a.X(10), a.Y(0), C.gray, 1, "5 4");
      INITS.forEach(([n, sd], i) => { const fac = Math.sqrt(256 * sd * sd / 2), P = []; for (let l = 0; l <= 10; l++) P.push([a.X(l), a.Y(Math.max(-10, l * Math.log10(fac)))]); s += ML.path(P, i === st.ini ? C.coral : "var(--line)", i === st.ini ? 2.6 : 1.4); });
      const [n, sd] = INITS[st.ini], fac = Math.sqrt(256 * sd * sd / 2);
      s += tx(450, 34, n, null, "th") + tx(450, 60, `σ = ${f(sd, 4)}`, null, "t") + tx(450, 84, `factor √(256σ²/2) = ${f(fac, 4)}`, null, "t") + tx(450, 108, `after 10 layers ${fe(Math.pow(fac, 10), 3)}`, null, "t");
      s += tx(450, 144, "He: 0.0884, factor exactly 1", null) + tx(450, 162, "Xavier: 0.0722, for tanh", null) + tx(450, 186, "the variance rule, not a run", null);
      return { h: 310, s };
    }
    if (k === 2) {
      const sc = Math.pow(10, st.ls), R = [0, 1, 2].map(q => optRun(sc, q)), lo = Math.min(0.97, ...R.flat()), hi = Math.max(1.03, ...R.flat());
      const a = ML.axes(60, 14, 300, 250, { xmin: 0, xmax: 2, ymin: lo, ymax: hi, nx: 2, ny: 4, fx: v => "step " + v, fy: v => fe(v, 3), yl: "w" });
      const cols = [C.gray, C.purple, C.coral], names = ["SGD α 0.01", "momentum β 0.9", "Adam"];
      s += a.s;
      R.forEach((W, q) => { s += ML.path(W.map((w, i) => [a.X(i), a.Y(w)]), cols[q], 2.2) + W.map((w, i) => dot(a.X(i), a.Y(w), 4, cols[q])).join(""); });
      s += tx(400, 34, `gradients ${fe(0.5 * sc, 3)} then ${fe(-1.5 * sc, 3)}`, null, "t");
      R.forEach((W, q) => { s += dot(400, 64 + q * 50, 5, cols[q]) + tx(412, 68 + q * 50, names[q], null, "t") + tx(412, 88 + q * 50, `w: 1 → ${fe(W[1], 5)} → ${fe(W[2], 5)}`, null); });
      s += tx(400, 230, "Adam's steps keep their size", null) + tx(400, 248, "at every gradient scale", null);
      return { h: 310, s };
    }
    const kp = st.keep, out = DRA.map((v, i) => st.train ? v * st.mask[i] / kp : v);
    const a = ML.axes(50, 20, 260, 200, { xmin: 0, xmax: 4, ymin: 0, ymax: 6, nx: 4, ny: 3, fx: () => "", fy: v => v, yl: "activation", grid: false });
    s += a.s;
    DRA.forEach((v, i) => { const x0 = a.X(i + 0.12), w = (a.X(i + 0.88) - x0) / 2; s += `<rect x="${x0}" y="${a.Y(v)}" width="${w - 2}" height="${a.Y(0) - a.Y(v)}" fill="${C.gray}" opacity="0.5"/><rect x="${x0 + w}" y="${a.Y(out[i])}" width="${w - 2}" height="${a.Y(0) - a.Y(out[i])}" fill="${C.teal}"/>` + tx(x0 + w, a.Y(0) + 16, f(out[i], 4), "middle"); });
    s += tx(50, 266, `dropout, ${st.train ? "training: mask / 0.75" : "evaluation: off"}`, null, "t") + tx(50, 286, "grey: input, teal: output", null);
    const mu = 4, sd = Math.sqrt(6.5), xh = BNX.map(v => (v - mu) / Math.sqrt(6.5 + 1e-5)), yb = xh.map(v => st.ga * v + st.be);
    const b = ML.axes(380, 20, 270, 200, { xmin: -4, xmax: 8, ymin: 0, ymax: 3, nx: 6, ny: 3, fx: v => v, fy: () => "", grid: false });
    s += b.s;
    BNX.forEach((v, i) => { s += dot(b.X(v), b.Y(2.6), 6, C.gray) + dot(b.X(xh[i]), b.Y(1.8), 6, C.blue) + dot(b.X(yb[i]), b.Y(1.0), 6, C.purple) + tx(b.X(yb[i]), b.Y(1.0) + (i % 2 ? 32 : 18), f(yb[i], 2), "middle"); });
    s += tx(b.X(8) + 4, b.Y(2.6) + 4, "x", null) + tx(b.X(8) + 4, b.Y(1.8) + 4, "x̂", null) + tx(b.X(8) + 4, b.Y(1.0) + 4, "γx̂+β", null);
    s += tx(380, 266, `batch norm: μ = 4, σ = ${f(sd, 4)}`, null, "t") + tx(380, 286, `x̂ = (${xh.map(v => f(v, 3)).join(", ")})`, null);
    return { h: 296, s };
  }
};

/* ====================================================================
   B6. Convolutional networks
   ==================================================================== */
const CI = [[1, 0, 2, 1], [3, 1, 0, 2], [0, 2, 1, 1], [1, 1, 3, 0]], CK = [[1, -1, 0], [0, 2, 0], [0, -1, 1]], CB = -1;
const xcorr = (I, K, b) => { const n = I.length - K.length + 1, O = []; for (let i = 0; i < n; i++) { O.push([]); for (let j = 0; j < n; j++) { let v = b; for (let p = 0; p < K.length; p++) for (let q = 0; q < K.length; q++) v += I[i + p][j + q] * K[p][q]; O[i].push(v); } } return O; };
const padI = (I, p) => { const n = I.length + 2 * p; return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i < p || j < p || i >= n - p || j >= n - p) ? 0 : I[i - p][j - p])); };
const PM = [[1, 3, 2, 0], [4, 2, 1, 5], [0, 1, 6, 2], [2, 1, 3, 1]], PG = [[1, 2], [-1, 0.5]];
const osz = (h, k, s, p) => Math.floor((h + 2 * p - k) / s) + 1;
const B6 = {
  key: "B6",
  st: () => ({ win: 0, pad: 0, H: 64, p2: 1, k1: 5, avg: 0, fp: -0.3, N: 10 }),
  parts: [
    { t: "Cross-correlation by hand", pts: 2, q: String.raw`Image \(\begin{bmatrix} 1 & 0 & 2 & 1 \\ 3 & 1 & 0 & 2 \\ 0 & 2 & 1 & 1 \\ 1 & 1 & 3 & 0\end{bmatrix}\), kernel \(\begin{bmatrix} 1 & -1 & 0 \\ 0 & 2 & 0 \\ 0 & -1 & 1\end{bmatrix}\), bias −1, stride 1, no padding. Compute the output as nn.Conv2d does, then apply ReLU. What is the output size with padding 1?`,
      a: [String.raw`nn.Conv2d does not flip the kernel: each output is the sum of the window times the kernel, element by element, plus the bias. The output is \(4 - 3 + 1 = 2\) by 2.`,
        String.raw`Top left, window rows 1 to 3 and columns 1 to 3: \(1\cdot 1 + 0\cdot(-1) + 1\cdot 2 + 2\cdot(-1) + 1\cdot 1 = 2\), plus the bias gives 1.`,
        String.raw`Top right: \(0 - 2 + 0 - 1 + 1 = -2\), so −3. Bottom left: \(3 - 1 + 4 - 1 + 3 = 8\), so 7. Bottom right: \(1 + 2 - 3 + 0 = 0\), so −1.`,
        String.raw`Output \(\begin{bmatrix} 1 & -3 \\ 7 & -1\end{bmatrix}\), after ReLU \(\begin{bmatrix} 1 & 0 \\ 7 & 0\end{bmatrix}\).`,
        String.raw`With padding 1 the output is \(4 + 2 - 3 + 1 = 4\) by 4, the same size as the input.`],
      ans: String.raw`\(\begin{bmatrix} 1 & -3 \\ 7 & -1\end{bmatrix}\), after ReLU \(\begin{bmatrix} 1 & 0 \\ 7 & 0\end{bmatrix}\). Padding 1 gives 4 by 4.` },
    { t: "Shapes through a CNN", pts: 2, q: String.raw`Input (8, 3, 64, 64). Conv2d(3, 16, 5, stride 2, padding 2), ReLU, MaxPool2d(2), Conv2d(16, 32, 3, padding 1), ReLU, MaxPool2d(2), Flatten, Linear(?, 10). Give every shape and the input size of the Linear layer.`,
      a: [String.raw`\(H_{\text{out}} = \lfloor (H + 2p - k)/s\rfloor + 1\). Conv 1: \(\lfloor (64 + 4 - 5)/2\rfloor + 1 = 31 + 1 = 32\), so (8, 16, 32, 32).`,
        String.raw`Max pool 2: (8, 16, 16, 16). Conv 2 with padding 1 and kernel 3 keeps the size: (8, 32, 16, 16). Max pool: (8, 32, 8, 8).`,
        String.raw`Flatten keeps the batch: \(32\cdot 8\cdot 8 = 2048\), so (8, 2048), and the last layer is Linear(2048, 10) with output (8, 10).`,
        String.raw`Without padding in conv 2 it would give 14, then 7, and Flatten 1568: Linear(2048, 10) would fail with "mat1 and mat2 shapes cannot be multiplied (8x1568 and 2048x10)".`],
      ans: String.raw`(8, 16, 32, 32), (8, 16, 16, 16), (8, 32, 16, 16), (8, 32, 8, 8), (8, 2048), (8, 10). Linear(2048, 10).` },
    { t: "Parameter count", pts: 2, q: String.raw`Count the parameters of each layer of the network in (b) and the total. How many weights would one fully connected layer from the 64 by 64 by 3 image to the 16 by 32 by 32 output of conv 1 need?`,
      a: [String.raw`Conv2d(C_in, C_out, k) has \(C_{\text{out}}(C_{\text{in}}k^2 + 1)\) parameters. Conv 1: \(16(3\cdot 25 + 1) = 1216\).`,
        String.raw`Conv 2: \(32(16\cdot 9 + 1) = 4640\). Linear(2048, 10): \(2048\cdot 10 + 10 = 20490\). Pooling, ReLU and Flatten have none.`,
        String.raw`Total \(1216 + 4640 + 20490 = 26346\). As in most small CNNs, the last Linear layer holds most of them (78%).`,
        String.raw`Dense instead of conv 1: \(12288\cdot 16384 + 16384 = 201{,}342{,}976\) parameters, about 165,000 times more. Weight sharing is why convolutions scale to images.`],
      ans: String.raw`1216, 4640 and 20490, total 26346. A dense layer would need about 201 million.` },
    { t: "Max pooling and its gradient", pts: 2, q: String.raw`Apply MaxPool2d(2) to \(\begin{bmatrix} 1 & 3 & 2 & 0 \\ 4 & 2 & 1 & 5 \\ 0 & 1 & 6 & 2 \\ 2 & 1 & 3 & 1\end{bmatrix}\). The gradient arriving at the pooled output is \(\begin{bmatrix} 1 & 2 \\ -1 & 0.5\end{bmatrix}\). What gradient reaches the input? How many parameters does the pooling layer have?`,
      a: [String.raw`Each 2 by 2 block gives its largest value: top left max(1, 3, 4, 2) = 4, top right max(2, 0, 1, 5) = 5, bottom left max(0, 1, 2, 1) = 2, bottom right max(6, 2, 3, 1) = 6. Output \(\begin{bmatrix} 4 & 5 \\ 2 & 6\end{bmatrix}\).`,
        String.raw`The max passes its gradient only to the input that won. The 4 sits at row 2 column 1, the 5 at row 2 column 4, the 2 at row 4 column 1 and the 6 at row 3 column 3.`,
        String.raw`Input gradient: 1, 2, −1 and 0.5 at those four positions, 0 at the other twelve.`,
        String.raw`Pooling has no parameters. Average pooling would instead give \(\begin{bmatrix} 2.5 & 2 \\ 1 & 3\end{bmatrix}\) and spread each gradient as a quarter to all four inputs.`],
      ans: String.raw`\(\begin{bmatrix} 4 & 5 \\ 2 & 6\end{bmatrix}\). The gradient goes only to the four winners, 0 elsewhere. No parameters.` },
    { t: "A residual block", pts: 2, q: String.raw`A residual block computes \(\mathbf y = F(\mathbf x) + \mathbf x\) on an input of shape (B, 16, 32, 32), where \(F\) starts with a 3 by 3 convolution with stride 2 and 32 output channels and padding 1. Why does the addition fail, and what does the shortcut need, with how many parameters? Then, in one dimension, each of 10 blocks has \(F'(x) = -0.3\). Compare the gradient through 10 plain layers with the gradient through 10 residual blocks.`,
      a: [String.raw`\(F(\mathbf x)\) has shape (B, 32, 16, 16) while \(\mathbf x\) is (B, 16, 32, 32): channels and size both differ, so the sum fails.`,
        String.raw`The shortcut becomes a projection, nn.Conv2d(16, 32, kernel_size=1, stride=2), which also gives (B, 32, 16, 16). It has \(32(16\cdot 1 + 1) = 544\) parameters, 512 without bias.`,
        String.raw`Plain chain: the gradient is a product of the local slopes, \((-0.3)^{10} = 5.9\times 10^{-6}\). It vanishes.`,
        String.raw`Residual: each block's slope is \(1 + F'(x) = 0.7\), so \(0.7^{10} = 0.0282\), about 4,800 times larger. The \(+\mathbf x\) gives the gradient a route that does not pass through \(F\).`],
      ans: String.raw`Shapes (B, 32, 16, 16) and (B, 16, 32, 32) differ. A 1 by 1 conv with stride 2, 544 parameters. \(5.9\times 10^{-6}\) plain against 0.0282 residual.` }
  ],
  ctl(k, st) {
    if (k === 0) return btns([[0, "window 1"], [1, "window 2"], [2, "window 3"], [3, "window 4"]], "e2cw") + btns([[0, "padding 0"], [1, "padding 1"]], "e2cp");
    if (k === 1 || k === 2) return btns([[32, "32 × 32"], [64, "64 × 64"], [96, "96 × 96"], [128, "128 × 128"]], "e2ch") + btns([[1, "conv 2 padding 1"], [0, "conv 2 padding 0"]], "e2cq") + (k === 2 ? btns([[3, "conv 1 kernel 3"], [5, "kernel 5"], [7, "kernel 7"]], "e2ck") : "");
    if (k === 3) return btns([[0, "max pooling"], [1, "average pooling"]], "e2ca");
    return sl("e2cf", "F′(x) in each block", -1, 1, 0.05, st.fp) + sl("e2cn", "number of blocks", 1, 30, 1, st.N);
  },
  bind(k, st, redraw) {
    if (k === 0) { bindBt("e2b6x", "e2cw", st, "win", redraw); bindBt("e2b6x", "e2cp", st, "pad", redraw); }
    if (k === 1 || k === 2) { bindBt("e2b6x", "e2ch", st, "H", redraw); bindBt("e2b6x", "e2cq", st, "p2", redraw); if (k === 2) bindBt("e2b6x", "e2ck", st, "k1", redraw); }
    if (k === 3) bindBt("e2b6x", "e2ca", st, "avg", redraw);
    if (k === 4) bindSl(st, [["e2cf", "fp", 2], ["e2cn", "N", 0]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const I = st.pad ? padI(CI, 1) : CI, O = xcorr(I, CK, CB), n = O.length, cell = st.pad ? 34 : 44;
      const w = st.pad ? Math.min(st.win, 3) : st.win, wi = st.pad ? [0, 0, 1, 2][st.win] : Math.floor(w / 2), wj = st.pad ? [0, 3, 1, 2][st.win] : w % 2;
      const hl = new Set(); for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) hl.add((wi + p) + "," + (wj + q));
      s += ML.grid(I, { x: 40, y: 34, cell, title: st.pad ? "image with padding 1" : "image", hl, rowLab: false, colLab: false, dec: 0 }).s;
      s += ML.grid(CK, { x: st.pad ? 270 : 260, y: 34, cell: 40, title: "kernel", rowLab: false, colLab: false, dec: 0 }).s + tx(st.pad ? 330 : 320, 170, "bias −1", "middle", "t");
      const ox = st.pad ? 420 : 430;
      s += ML.grid(O, { x: ox, y: 34, cell: st.pad ? 46 : 54, title: `output ${n} × ${n}`, rowLab: false, colLab: false, hl: new Set([wi + "," + wj]), dec: 0 }).s;
      let terms = []; for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) if (CK[p][q] && I[wi + p][wj + q]) terms.push(`${I[wi + p][wj + q]}·${CK[p][q] < 0 ? "(" + String(CK[p][q]).replace("-", "−") + ")" : CK[p][q]}`);
      s += tx(40, 250, `teal window: ${terms.join(" + ") || "all products 0"} − 1 = ${O[wi][wj]}`, null, "t") + tx(40, 274, `after ReLU: ${Math.max(0, O[wi][wj])}`, null);
      return { h: 290, s };
    }
    if (k === 1 || k === 2) {
      const H = st.H, h1 = osz(H, st.k1, 2, Math.floor(st.k1 / 2)), q1 = Math.floor(h1 / 2), h2 = osz(q1, 3, 1, st.p2), q2 = Math.floor(h2 / 2), flat = 32 * q2 * q2, ok = flat === 2048;
      const L = [["input", `(8, 3, ${H}, ${H})`, 0], [`Conv2d(3, 16, ${st.k1}, s 2, p ${Math.floor(st.k1 / 2)})`, `(8, 16, ${h1}, ${h1})`, 16 * (3 * st.k1 * st.k1 + 1)], ["MaxPool2d(2)", `(8, 16, ${q1}, ${q1})`, 0], [`Conv2d(16, 32, 3, p ${st.p2})`, `(8, 32, ${h2}, ${h2})`, 32 * (16 * 9 + 1)], ["MaxPool2d(2)", `(8, 32, ${q2}, ${q2})`, 0], ["Flatten", `(8, ${flat})`, 0], ["Linear(2048, 10)", ok ? "(8, 10)" : "shape error", 20490]];
      const tot = L.reduce((a, r) => a + r[2], 0);
      L.forEach(([n, sh, p], i) => { const y = 24 + i * 38, bad = !ok && i === 6; s += rect(20, y, 260, 30, bad ? "var(--coral-bg)" : "var(--sunk)", bad ? C.coral : "var(--line)") + tx(30, y + 20, n, null, "t") + tx(300, y + 20, sh, null, bad ? "th" : "t"); if (k === 2) { const w = p ? Math.max(3, 200 * Math.log10(p) / Math.log10(25000)) : 0; s += (p ? `<rect x="440" y="${y + 6}" width="${w}" height="18" rx="3" fill="${C.purple}" opacity="0.7"/>` : "") + tx(440 + w + 6, y + 20, p ? p.toLocaleString("en-US") : "0", null); } });
      if (k === 2) s += tx(440, 18, "parameters (log length)", null) + tx(440, 300, `total ${tot.toLocaleString("en-US")}`, null, "th");
      else s += tx(440, 60, ok ? "flatten matches 2048" : `flatten gives ${flat}, not 2048`, null, "th") + tx(440, 86, "H = ⌊(H + 2p − k)/s⌋ + 1", null, "t") + tx(440, 110, "pooling halves, rounding down", null);
      if (!ok) s += tx(20, 300, `mat1 and mat2 shapes cannot be multiplied (8x${flat} and 2048x10)`, null);
      return { h: 310, s };
    }
    if (k === 3) {
      const out = [[0, 0], [0, 0]], arg = [[0, 0], [0, 0]], G = PM.map(r => r.map(() => 0));
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { let best = -1e9, bi = 0, bj = 0, sum = 0; for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) { const v = PM[2 * i + p][2 * j + q]; sum += v; if (v > best) { best = v; bi = 2 * i + p; bj = 2 * j + q; } } out[i][j] = st.avg ? sum / 4 : best; arg[i][j] = [bi, bj]; if (st.avg) { for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) G[2 * i + p][2 * j + q] = PG[i][j] / 4; } else G[bi][bj] = PG[i][j]; }
      const hl = new Set(); if (!st.avg) arg.flat().forEach(([a, b]) => hl.add(a + "," + b));
      s += ML.grid(PM, { x: 30, y: 34, cell: 40, title: "input", hl, rowLab: false, colLab: false, dec: 0 }).s;
      s += ML.grid(out, { x: 230, y: 74, cell: 48, title: st.avg ? "average pooled" : "max pooled", rowLab: false, colLab: false, dec: 2 }).s;
      s += ML.grid(PG, { x: 360, y: 74, cell: 48, title: "upstream gradient", rowLab: false, colLab: false, dec: 1 }).s;
      s += ML.grid(G, { x: 500, y: 34, cell: 40, title: "input gradient", rowLab: false, colLab: false, hl, dec: st.avg ? 3 : 1 }).s;
      s += tx(30, 250, st.avg ? "average: each input gets a quarter of its block's gradient" : "max: only the winner of each block (teal) gets the gradient", null, "t") + tx(30, 274, "no weights, so no parameters", null);
      return { h: 290, s };
    }
    const fp = st.fp, N = st.N, a = ML.axes(70, 14, 300, 250, { xmin: 0, xmax: 30, ymin: -12, ymax: 4, nx: 6, ny: 4, fx: v => v, fy: v => "1e" + v, xl: "blocks", yl: "|gradient factor|, log scale" });
    const lp = Math.log10(Math.max(1e-300, Math.abs(fp))), lr = Math.log10(Math.max(1e-300, Math.abs(1 + fp)));
    const P = [], R = []; for (let n = 0; n <= 30; n++) { P.push([a.X(n), a.Y(Math.max(-12, Math.min(4, n * lp)))]); R.push([a.X(n), a.Y(Math.max(-12, Math.min(4, n * lr)))]); }
    s += clip("e2cpb6", 70, 14, 300, 250) + a.s + `<g clip-path="url(#e2cpb6)">` + ML.path(P, C.gray, 2.2) + ML.path(R, C.teal, 2.4) + `</g>` + ln(a.X(N), 14, a.X(N), 264, C.coral, 1.2, "4 4");
    s += tx(400, 34, `F′ = ${f(fp, 2)}, ${N} blocks`, null, "th") + tx(400, 62, `plain: |F′|^N = ${fe(Math.pow(Math.abs(fp), N), 3)}`, null, "t") + tx(400, 86, `residual: |1 + F′|^N = ${fe(Math.pow(Math.abs(1 + fp), N), 4)}`, null, "t");
    s += tx(400, 120, "grey: plain chain, teal: residual", null) + tx(400, 148, "shortcut for (B, 16, 32, 32) to", null) + tx(400, 166, "(B, 32, 16, 16): Conv2d(16, 32, 1,", null) + tx(400, 184, "stride=2), 16·32 + 32 = 544", null);
    return { h: 310, s };
  }
};

/* ====================================================================
   B7. A one-unit RNN through time: w = 0.8, u = 1, v = 1.5, x = (1, −0.5, 2), y = 1
   ==================================================================== */
const RU = 1, RV = 1.5, RY = 1;
const rnn = (w, xs) => { const h = [0], z = []; xs.forEach(x => { const q = w * h[h.length - 1] + RU * x; z.push(q); h.push(th(q)); }); const y = RV * h[h.length - 1]; return { z, h, y, L: 0.5 * (y - RY) ** 2 }; };
const bptt = (w, xs) => { const F = rnn(w, xs), T = xs.length, dy = F.y - RY, dv = dy * F.h[T]; let dh = dy * RV, dw = 0, du = 0; const dz = [], cw = [], cu = []; for (let t = T - 1; t >= 0; t--) { const d = dh * (1 - F.h[t + 1] ** 2); dz[t] = d; cw[t] = d * F.h[t]; cu[t] = d * xs[t]; dw += cw[t]; du += cu[t]; dh = d * w; } return { F, dy, dv, dz, cw, cu, dw, du }; };
const B7 = {
  key: "B7",
  st: () => ({ w: 0.8, x3: 2, wf: 0.8, K: 30, cn: 5, ga: 6, gb: -8, am: 0.95 }),
  parts: [
    { t: "Forward through time", pts: 2, q: String.raw`A one-unit RNN has \(h_t = \tanh(w h_{t-1} + u x_t)\), \(h_0 = 0\), and reads out \(\hat y = v h_3\) after three steps, with \(w = 0.8\), \(u = 1\), \(v = 1.5\) and no biases. The inputs are \(x = (1, -0.5, 2)\) and the target is \(y = 1\). Compute \(h_1, h_2, h_3\), \(\hat y\) and \(L = \frac12(\hat y - y)^2\).`,
      a: [String.raw`\(h_1 = \tanh(0.8\cdot 0 + 1) = \tanh 1 = 0.7616\).`,
        String.raw`\(h_2 = \tanh(0.8\cdot 0.7616 - 0.5) = \tanh(0.1093) = 0.1088\).`,
        String.raw`\(h_3 = \tanh(0.8\cdot 0.1088 + 2) = \tanh(2.0871) = 0.9697\).`,
        String.raw`\(\hat y = 1.5\cdot 0.9697 = 1.4545\) and \(L = \frac12(0.4545)^2 = 0.1033\). The same \(w\) and \(u\) are used at every step.`],
      ans: String.raw`\(h = (0.7616, 0.1088, 0.9697)\), \(\hat y = 1.4545\), \(L = 0.1033\).` },
    { t: "Backpropagation through time", pts: 2, q: String.raw`Compute \(\partial L/\partial v\), then \(\partial L/\partial z_t\) for t = 3, 2, 1, and \(\partial L/\partial w\) and \(\partial L/\partial u\) as sums of one term per step.`,
      a: [String.raw`\(\partial L/\partial\hat y = \hat y - y = 0.4545\), so \(\partial L/\partial v = 0.4545\cdot h_3 = 0.4408\) and \(\partial L/\partial h_3 = 0.4545\cdot 1.5 = 0.6818\).`,
        String.raw`Through each tanh multiply by \(1 - h_t^2\), and to step back multiply by \(w\): \(\partial L/\partial z_3 = 0.6818\cdot(1 - 0.9697^2) = 0.0407\), \(\partial L/\partial h_2 = 0.8\cdot 0.0407 = 0.0326\).`,
        String.raw`\(\partial L/\partial z_2 = 0.0326\cdot(1 - 0.1088^2) = 0.0322\), \(\partial L/\partial h_1 = 0.0257\), \(\partial L/\partial z_1 = 0.0257\cdot(1 - 0.7616^2) = 0.0108\).`,
        String.raw`\(\partial L/\partial w = \sum_t \frac{\partial L}{\partial z_t}h_{t-1}\), one term per step: \(0.0407\cdot 0.1088 + 0.0322\cdot 0.7616 + 0.0108\cdot 0\), which is \(0.0044 + 0.0245 + 0 = 0.0289\).`,
        String.raw`\(\partial L/\partial u = \sum_t \frac{\partial L}{\partial z_t}x_t = 0.0814 - 0.0161 + 0.0108 = 0.0761\). Autograd gives the same three numbers.`],
      ans: String.raw`\(\partial L/\partial v = 0.4408\), \(\partial L/\partial z = (0.0108, 0.0322, 0.0407)\) for t = 1, 2, 3, \(\partial L/\partial w = 0.0289\), \(\partial L/\partial u = 0.0761\).` },
    { t: "Vanishing and exploding", pts: 2, q: String.raw`Ignore the tanh for a moment, so each step back multiplies the gradient by \(w\). By how much is the gradient 30 steps back scaled for \(w = 0.8\) and for \(w = 1.2\)? What does the tanh add, and which of the two can gradient clipping fix?`,
      a: [String.raw`\(0.8^{30} = 0.0012\): a signal from 30 steps back reaches the weights at a thousandth of its size. The gradient vanishes, and long-range patterns are not learned.`,
        String.raw`\(1.2^{30} = 237\): the gradient explodes, and one update can throw the weights far away.`,
        String.raw`With tanh each factor is \(w(1 - h_t^2)\), which is never larger than \(|w|\). Here the three factors are 0.336, 0.791 and 0.048. Saturated units (\(|h| \to 1\)) make the vanishing worse.`,
        String.raw`Clipping fixes exploding gradients by capping the step. It cannot bring back a vanished signal. For that you need gated cells (LSTM, GRU), a forget bias, or shorter paths.`],
      ans: String.raw`\(0.8^{30} = 0.0012\) vanishes, \(1.2^{30} = 237\) explodes. tanh only shrinks the factors. Clipping fixes exploding, not vanishing.` },
    { t: "Gradient clipping", pts: 2, q: String.raw`A gradient is \(\mathbf g = (6, -8, 0)\). Clip it by norm with max_norm 5 (clip_grad_norm_), and by value at 5 (clip_grad_value_). Which keeps the direction? Where does the call go in the training loop?`,
      a: [String.raw`\(\lVert\mathbf g\rVert = \sqrt{36 + 64} = 10 \gt 5\), so scale by \(5/10\): \(\mathbf g = (3, -4, 0)\). Same direction, length 5.`,
        String.raw`By value, each entry is cut to \([-5, 5]\): \((5, -5, 0)\). The length is 7.07 and the direction has turned from \((0.6, -0.8)\) to \((0.71, -0.71)\).`,
        String.raw`Clipping by norm keeps the direction, which is why it is the usual choice for RNNs.`,
        String.raw`Order in the loop: zero_grad, forward, loss.backward(), clip_grad_norm_(model.parameters(), 5), optimizer.step(). Clipping before backward does nothing, after step it is too late.`],
      ans: String.raw`By norm (3, −4, 0), by value (5, −5, 0). Only the norm keeps the direction. Clip between backward and step.` },
    { t: "Teacher forcing and exposure bias", pts: 2, q: String.raw`A series follows \(x_{t+1} = 0.9\,x_t\) from \(x_0 = 10\). A model has learned \(x_{t+1} = 0.95\,x_t\). Trained with teacher forcing it always sees the true previous value. Give its largest one-step error, then its error after 10 steps when it runs free on its own outputs. Name the problem and one remedy.`,
      a: [String.raw`Teacher forcing: the prediction of \(x_{t+1}\) uses the true \(x_t\), so the error is \(0.05\,x_t\), at most \(0.05\cdot 10 = 0.5\) and shrinking with \(x_t\).`,
        String.raw`Free running: \(\hat x_{10} = 10\cdot 0.95^{10} = 5.987\) against \(x_{10} = 10\cdot 0.9^{10} = 3.487\). The error is 2.50, five times the worst one-step error.`,
        String.raw`Each prediction feeds the next, so the errors compound. The model was never trained on its own mistakes: this is exposure bias.`,
        String.raw`Remedies: scheduled sampling (feed the model's own output with a probability that grows during training), training on multi-step rollouts, or checking free-running error on validation, not only the one-step loss.`],
      ans: String.raw`At most 0.5 one step ahead, 2.50 after 10 free steps. Exposure bias. Scheduled sampling is one remedy.` }
  ],
  ctl(k, st) {
    if (k <= 1) return sl("e2rw", "recurrent weight w", -1.5, 1.5, 0.05, st.w) + sl("e2rx", "third input x₃", -2, 3, 0.1, st.x3);
    if (k === 2) return sl("e2rf", "factor per step w", 0.5, 1.5, 0.01, st.wf) + sl("e2rk", "steps back", 1, 60, 1, st.K);
    if (k === 3) return sl("e2rg1", "g₁", -10, 10, 0.5, st.ga) + sl("e2rg2", "g₂", -10, 10, 0.5, st.gb) + sl("e2rc", "max_norm and clip value", 1, 12, 0.5, st.cn);
    return sl("e2ra", "model coefficient", 0.8, 1, 0.01, st.am);
  },
  bind(k, st, redraw) {
    if (k <= 1) bindSl(st, [["e2rw", "w", 2], ["e2rx", "x3", 1]], redraw);
    if (k === 2) bindSl(st, [["e2rf", "wf", 2], ["e2rk", "K", 0]], redraw);
    if (k === 3) bindSl(st, [["e2rg1", "ga", 1], ["e2rg2", "gb", 1], ["e2rc", "cn", 1]], redraw);
    if (k === 4) bindSl(st, [["e2ra", "am", 2]], redraw);
  },
  pic(k, st) {
    let s = "";
    if (k <= 1) {
      const xs = [1, -0.5, st.x3], G = bptt(st.w, xs), F = G.F, X = [60, 220, 380, 540], bh = k === 1 ? 64 : 46, by = 112;
      s += rect(X[0] - 32, by + bh / 2 - 18, 64, 36, "var(--sunk)", C.gray) + tx(X[0], by + bh / 2 + 5, "h₀ = 0", "middle", "t");
      for (let t = 0; t < 3; t++) {
        const x = X[t + 1];
        s += arrow(X[t] + (t ? 48 : 34), by + bh / 2, x - 50, by + bh / 2, C.blue, 1.6) + tx((X[t] + x) / 2 + (t ? 0 : -8), by + bh / 2 - 8, `w = ${f(st.w, 2)}`, "middle");
        s += rect(x - 46, by, 92, bh, "var(--bg)", C.blue) + tx(x, by + 18, `z = ${f(F.z[t], 4)}`, "middle") + tx(x, by + 38, `h = ${f(F.h[t + 1], 4)}`, "middle", "t");
        if (k === 1) s += tx(x, by + 56, `∂L/∂z = ${f(G.dz[t], 4)}`, "middle", "th");
        s += arrow(x, 236, x, by + bh + 4, C.gray, 1.4) + tx(x, 254, `x${"₁₂₃"[t]} = ${f(xs[t], 1)}`, "middle", "t");
        if (k === 1) s += tx(x, 274, `w term ${f(G.cw[t], 4)}`, "middle") + tx(x, 292, `u term ${f(G.cu[t], 4)}`, "middle");
      }
      s += arrow(X[3], by - 2, X[3], 62, C.teal, 1.6) + tx(X[3] + 10, 76, `ŷ = ${f(F.y, 4)}`, null, "t") + tx(X[3] + 10, 96, "v = 1.5", null);
      s += tx(20, 30, `L = ½(ŷ − 1)² = ${f(F.L, 4)}`, null, "th");
      if (k === 1) s += tx(20, 54, `∂L/∂v = ${f(G.dv, 4)}`, null, "t") + tx(20, 76, `∂L/∂w = ${f(G.dw, 4)}, ∂L/∂u = ${f(G.du, 4)}`, null, "t") + tx(20, 312, "w term: ∂L/∂z times the previous h. u term: ∂L/∂z times x.", null);
      return { h: 322, s };
    }
    if (k === 2) {
      const a = ML.axes(70, 14, 330, 250, { xmin: 0, xmax: 60, ymin: -8, ymax: 6, nx: 6, ny: 7, fx: v => v, fy: v => "1e" + v, xl: "steps back", yl: "gradient factor, log scale" });
      const line = w => { const P = []; for (let n = 0; n <= 60; n++) P.push([a.X(n), a.Y(Math.max(-8, Math.min(6, n * Math.log10(w))))]); return P; };
      s += clip("e2cpb7", 70, 14, 330, 250) + a.s + `<g clip-path="url(#e2cpb7)">` + ML.path(line(0.8), C.gray, 1.2, "5 4") + ML.path(line(1.2), C.gray, 1.2, "5 4") + ML.path(line(st.wf), C.coral, 2.4) + `</g>` + ln(a.X(st.K), 14, a.X(st.K), 264, C.purple, 1.2, "4 4");
      s += tx(430, 34, `w = ${f(st.wf, 2)}, ${st.K} steps`, null, "th") + tx(430, 62, `w^${st.K} = ${fe(Math.pow(st.wf, st.K), 4)}`, null, "t") + tx(430, 90, st.wf < 1 ? "vanishing" : st.wf > 1 ? "exploding" : "neither, at w = 1", null, "t");
      s += tx(430, 124, "grey dashes: 0.8 and 1.2", null) + tx(430, 142, "0.8^30 = 0.0012, 1.2^30 = 237", null) + tx(430, 172, "tanh factors here are", null) + tx(430, 190, "0.336, 0.791, 0.048", null);
      return { h: 310, s };
    }
    if (k === 3) {
      const g = [st.ga, st.gb], n = Math.hypot(g[0], g[1]), c = st.cn, gn = n > c ? g.map(v => v * c / n) : g, gv = g.map(v => Math.max(-c, Math.min(c, v)));
      const a = ML.axes(50, 14, 270, 270, { xmin: -12, xmax: 12, ymin: -12, ymax: 12, nx: 4, ny: 4, fx: v => v, fy: v => v, xl: "g₁", yl: "g₂" });
      const circ = []; for (let i = 0; i <= 100; i++) { const t = 2 * Math.PI * i / 100; circ.push([a.X(c * Math.cos(t)), a.Y(c * Math.sin(t))]); }
      s += a.s + ML.path(circ, C.teal, 1.2, "4 4") + `<rect x="${a.X(-c)}" y="${a.Y(c)}" width="${a.X(c) - a.X(-c)}" height="${a.Y(-c) - a.Y(c)}" fill="none" stroke="${C.purple}" stroke-width="1.2" stroke-dasharray="2 3"/>`;
      s += arrow(a.X(0), a.Y(0), a.X(g[0]), a.Y(g[1]), C.gray, 2) + arrow(a.X(0), a.Y(0), a.X(gn[0]), a.Y(gn[1]), C.teal, 2.6) + arrow(a.X(0), a.Y(0), a.X(gv[0]), a.Y(gv[1]), C.purple, 2);
      const ang = v => Math.atan2(v[1], v[0]) * 180 / Math.PI;
      s += tx(350, 34, `g = (${f(g[0], 1)}, ${f(g[1], 1)}, 0), norm ${f(n, 3)}`, null, "th") + tx(350, 62, `by norm at ${f(c, 1)}: (${f(gn[0], 3)}, ${f(gn[1], 3)}, 0)`, null, "t") + tx(350, 84, `  angle ${f(ang(gn), 1)}°, same as g`, null);
      s += tx(350, 112, `by value at ${f(c, 1)}: (${f(gv[0], 2)}, ${f(gv[1], 2)}, 0)`, null, "t") + tx(350, 134, `  angle ${f(ang(gv), 1)}° against ${f(ang(g), 1)}°`, null) + tx(350, 168, "grey: raw, teal: by norm, purple: by value", null) + tx(350, 186, "teal circle and purple box: the limits", null);
      s += tx(350, 222, "loop: backward, clip, step", null, "t");
      return { h: 320, s };
    }
    const am = st.am, a = ML.axes(60, 14, 330, 250, { xmin: 0, xmax: 10, ymin: 0, ymax: 10, nx: 10, ny: 5, fx: v => v, fy: v => v, xl: "step t", yl: "x" });
    const tru = [], tf = [], fr = []; for (let t = 0; t <= 10; t++) { tru.push(10 * 0.9 ** t); fr.push(10 * am ** t); tf.push(t ? am * 10 * 0.9 ** (t - 1) : 10); }
    s += a.s + ML.path(tru.map((v, t) => [a.X(t), a.Y(v)]), C.gray, 2.2) + ML.path(fr.map((v, t) => [a.X(t), a.Y(Math.min(10, v))]), C.coral, 2.2) + tf.map((v, t) => dot(a.X(t), a.Y(Math.min(10, v)), 4, C.teal)).join("");
    const e1 = Math.max(...tf.map((v, t) => Math.abs(v - tru[t])));
    s += tx(420, 34, `model x(t+1) = ${f(am, 2)} x(t)`, null, "th") + tx(420, 60, `largest one-step error ${f(e1, 3)}`, null, "t") + tx(420, 84, `free-running error at t = 10: ${f(fr[10] - tru[10], 3)}`, null, "t");
    s += tx(420, 118, "grey: the true series", null) + tx(420, 136, "teal dots: teacher forced, each from", null) + tx(420, 154, "the true previous value", null) + tx(420, 172, "coral: free running on its own output", null) + tx(420, 204, "errors compound: exposure bias", null);
    return { h: 310, s };
  }
};

/* ====================================================================
   B8. An LSTM step, the forget route, counts, attention, and the layer to choose
   ==================================================================== */
const AK = [[2, 0], [0, 2], [1, 1]], AV = [[1, 0], [0, 1], [2, 2]];
const LAYERS = [
  { n: "yield from 12 process settings", x: "(B, 12)", lay: "nn.Linear, an MLP", why: "no order and no grid in the inputs", out: "(B, 1)" },
  { n: "64 × 64 micrographs, 5 phases", x: "(B, 1, 64, 64)", lay: "nn.Conv2d, a CNN", why: "nearby pixels form local patterns", out: "(B, 5)" },
  { n: "tool wear from a 500-step force signal", x: "(B, 500, 3)", lay: "nn.LSTM, batch_first=True", why: "the order in time carries the signal, and the head reads h_n[-1]", out: "(B, 1)" },
  { n: "melt pool video, 40 frames", x: "(B, 40, 1, 64, 64)", lay: "nn.Conv2d per frame, then nn.LSTM", why: "space inside a frame, time across frames", out: "(B, 2)" }
];
const B8 = {
  key: "B8",
  st: () => ({ bf: 1.5, cp: 1.2, fb: 1.5, T: 20, typ: 0, I: 10, H: 20, ang: 0, scaled: 1, task: 2 }),
  parts: [
    { t: "One LSTM step", pts: 2, q: String.raw`At one step an LSTM unit has \(c^{\langle t-1\rangle} = 1.2\) and gate pre-activations 1.5 (forget), −1 (update or input), 0.5 (output), and a candidate pre-activation of 1. Compute \(\Gamma_f\), \(\Gamma_u\), \(\Gamma_o\), \(\tilde c\), \(c^{\langle t\rangle}\) and \(a^{\langle t\rangle}\).`,
      a: [String.raw`The gates use the sigmoid: \(\Gamma_f = \sigma(1.5) = 0.8176\), \(\Gamma_u = \sigma(-1) = 0.2689\), \(\Gamma_o = \sigma(0.5) = 0.6225\). The candidate uses tanh: \(\tilde c = \tanh 1 = 0.7616\).`,
        String.raw`Cell: \(c^{\langle t\rangle} = \Gamma_f c^{\langle t-1\rangle} + \Gamma_u\tilde c\), so \(c^{\langle t\rangle} = 0.8176\cdot 1.2 + 0.2689\cdot 0.7616 = 0.9811 + 0.2048 = 1.1859\).`,
        String.raw`Output: \(a^{\langle t\rangle} = \Gamma_o\tanh c^{\langle t\rangle}\), so \(a^{\langle t\rangle} = 0.6225\cdot 0.8293 = 0.5162\).`,
        String.raw`The forget gate kept 82% of the old cell, the update gate let in 27% of the candidate, and the output gate showed 62% of the squashed cell.`],
      ans: String.raw`\(\Gamma_f = 0.8176\), \(\Gamma_u = 0.2689\), \(\Gamma_o = 0.6225\), \(\tilde c = 0.7616\), \(c = 1.1859\), \(a = 0.5162\).` },
    { t: "The forget route", pts: 2, q: String.raw`Along the cell, \(\partial c^{\langle t\rangle}/\partial c^{\langle t-1\rangle} = \Gamma_f\). Over 20 steps with \(\Gamma_f = 0.8176\) every step, what is the factor? What if a forget bias raises the gate to 0.98? Compare a plain RNN whose factor is 0.6 per step.`,
      a: [String.raw`The factors multiply: \(0.8176^{20} = 0.0178\).`,
        String.raw`With \(\Gamma_f = 0.98\): \(0.98^{20} = 0.668\). Two thirds of the signal survive 20 steps.`,
        String.raw`Plain RNN: \(0.6^{20} = 3.7\times 10^{-5}\). Its factor is \(w(1 - h^2)\), fixed by the weights and the saturation, while the LSTM's factor is a gate the network learns to hold near 1.`,
        String.raw`That is why nn.LSTM, not nn.RNN, is the choice when the target depends on inputs far back.`],
      ans: String.raw`\(0.8176^{20} = 0.0178\), \(0.98^{20} = 0.668\), against \(0.6^{20} = 3.7\times 10^{-5}\) for the plain RNN.` },
    { t: "Counting and shapes", pts: 2, q: String.raw`Count the parameters of nn.LSTM(10, 20), nn.GRU(10, 20) and nn.RNN(10, 20). With batch_first=True and an input of shape (8, 50, 10), give the shapes of out, h_n and c_n. What changes if batch_first is left out?`,
      a: [String.raw`Each gate block has an input weight (20 by 10), a hidden weight (20 by 20) and two biases of 20 in PyTorch: \(200 + 400 + 40 = 640\).`,
        String.raw`LSTM has 4 blocks (input, forget, cell, output): \(4\cdot 640 = 2560\). GRU has 3: 1920. RNN has 1: 640.`,
        String.raw`out is (8, 50, 20), one hidden state per step. h_n and c_n are (1, 8, 20): (layers times directions, batch, hidden).`,
        String.raw`Without batch_first, PyTorch reads (8, 50, 10) as 8 time steps of a batch of 50. No error is raised, out is (8, 50, 20) again, but h_n becomes (1, 50, 20) and the model learns the wrong thing.`],
      ans: String.raw`2560, 1920 and 640. out (8, 50, 20), h_n and c_n (1, 8, 20). Without batch_first h_n is silently (1, 50, 20).` },
    { t: "Scaled dot-product attention", pts: 2, q: String.raw`A query \(\mathbf q = (1, 0)\) attends to keys \((2, 0)\), \((0, 2)\), \((1, 1)\) with values \((1, 0)\), \((0, 1)\), \((2, 2)\), and \(d_k = 2\). Compute the scores, the weights and the output. What do the weights become without the \(\sqrt{d_k}\), and with the third key masked as a future position?`,
      a: [String.raw`Scores \(\mathbf q\cdot\mathbf k_i/\sqrt 2\): \((2, 0, 1)/1.4142 = (1.4142, 0, 0.7071)\).`,
        String.raw`Softmax: \(e^{1.4142} = 4.1133\), \(e^0 = 1\), \(e^{0.7071} = 2.0281\), sum 7.1414, so the weights are (0.5760, 0.1400, 0.2840).`,
        String.raw`Output: \(0.5760(1, 0) + 0.1400(0, 1) + 0.2840(2, 2) = (1.1440, 0.7080)\).`,
        String.raw`Without the scale the scores are (2, 0, 1) and the weights (0.6652, 0.0900, 0.2447), sharper. In high dimensions the unscaled softmax saturates and its gradient vanishes, which is why we divide by \(\sqrt{d_k}\).`,
        String.raw`Masked: the third score becomes \(-\infty\) before the softmax, so its weight is 0 and the others are (0.8044, 0.1956), output (0.8044, 0.1956).`],
      ans: String.raw`Weights (0.5760, 0.1400, 0.2840), output (1.1440, 0.7080). Unscaled (0.6652, 0.0900, 0.2447). Masked (0.8044, 0.1956, 0).` },
    { t: "Linear, Conv2d or LSTM?", pts: 2, q: String.raw`Choose the main layer type and give the input shape for: (i) predicting yield from 12 process settings, (ii) classifying 64 by 64 grayscale micrographs into 5 phases, (iii) predicting tool wear from a force signal of 500 time steps in 3 axes, (iv) classifying a 40-frame melt pool video as stable or unstable.`,
      a: [String.raw`(i) nn.Linear layers, an MLP. The 12 settings have no order or neighborhood to exploit. Input (B, 12), output (B, 1) with MSELoss.`,
        String.raw`(ii) nn.Conv2d layers, then a Linear head. Pixels have local structure and the same pattern can appear anywhere. Input (B, 1, 64, 64), output (B, 5) with CrossEntropyLoss.`,
        String.raw`(iii) nn.LSTM(input_size=3, hidden_size=H, batch_first=True), then Linear(H, 1) on h_n[-1]. The order in time matters and 500 steps is long for a plain RNN. Input (B, 500, 3).`,
        String.raw`(iv) A CNN on each frame to get a feature vector, then an LSTM over the 40 vectors. Input (B, 40, 1, 64, 64), output (B, 2) or one logit with BCEWithLogitsLoss.`],
      ans: String.raw`(i) Linear, (B, 12). (ii) Conv2d, (B, 1, 64, 64). (iii) LSTM, (B, 500, 3). (iv) Conv2d then LSTM, (B, 40, 1, 64, 64).` }
  ],
  ctl(k, st) {
    if (k === 0) return sl("e2lf", "forget pre-activation", -3, 5, 0.1, st.bf) + sl("e2lc", "previous cell c", -2, 3, 0.1, st.cp);
    if (k === 1) return sl("e2lfb", "forget pre-activation", -1, 6, 0.1, st.fb) + sl("e2lT", "steps T", 1, 100, 1, st.T);
    if (k === 2) return btns([[0, "LSTM"], [1, "GRU"], [2, "RNN"]], "e2lty") + sl("e2lI", "input_size", 1, 64, 1, st.I) + sl("e2lH", "hidden_size", 1, 128, 1, st.H);
    if (k === 3) return sl("e2la", "query angle, degrees", -180, 180, 5, st.ang) + btns([[1, "divide by √2"], [0, "no scaling"], [2, "mask key 3"]], "e2lsc");
    return btns(LAYERS.map((t, i) => [i, `(${"i ii iii iv".split(" ")[i]})`]), "e2lta");
  },
  bind(k, st, redraw) {
    if (k === 0) bindSl(st, [["e2lf", "bf", 1], ["e2lc", "cp", 1]], redraw);
    if (k === 1) bindSl(st, [["e2lfb", "fb", 1], ["e2lT", "T", 0]], redraw);
    if (k === 2) { bindBt("e2b8x", "e2lty", st, "typ", redraw); bindSl(st, [["e2lI", "I", 0], ["e2lH", "H", 0]], redraw); }
    if (k === 3) { bindSl(st, [["e2la", "ang", 0]], redraw); bindBt("e2b8x", "e2lsc", st, "scaled", redraw); }
    if (k === 4) bindBt("e2b8x", "e2lta", st, "task", redraw);
  },
  pic(k, st) {
    let s = "";
    if (k === 0) {
      const gf = sig(st.bf), gu = sig(-1), go = sig(0.5), ct = th(1), c = gf * st.cp + gu * ct, a = go * th(c);
      s += ln(40, 70, 640, 70, C.teal, 3) + tx(40, 58, `c⟨t−1⟩ = ${f(st.cp, 2)}`, null, "t") + tx(640, 58, `c⟨t⟩ = ${f(c, 4)}`, "end", "th");
      s += `<circle cx="200" cy="70" r="16" fill="var(--bg)" stroke="${C.coral}" stroke-width="2"/>` + tx(200, 75, "×", "middle", "th") + `<circle cx="380" cy="70" r="16" fill="var(--bg)" stroke="${C.purple}" stroke-width="2"/>` + tx(380, 75, "+", "middle", "th");
      const gate = (x, nm, pre, val, col, fn) => rect(x - 50, 170, 100, 52, "var(--bg)", col) + tx(x, 190, `${nm} = ${fn}(${f(pre, 1)})`, "middle") + tx(x, 210, f(val, 4), "middle", "t");
      s += gate(200, "Γf", st.bf, gf, C.coral, "σ") + arrow(200, 168, 200, 90, C.coral, 1.6);
      s += gate(320, "Γu", -1, gu, C.purple, "σ") + gate(440, "c̃", 1, ct, C.purple, "tanh") + ln(320, 168, 380, 90, C.purple, 1.6) + ln(440, 168, 380, 90, C.purple, 1.6) + tx(420, 112, `Γu·c̃ = ${f(gu * ct, 4)}`, null);
      s += gate(560, "Γo", 0.5, go, C.blue, "σ") + ln(560, 70, 560, 120, C.blue, 1.2, "3 3") + tx(570, 110, `tanh c = ${f(th(c), 4)}`, null);
      s += tx(210, 128, `Γf·c = ${f(gf * st.cp, 4)}`, null) + tx(560, 260, `a⟨t⟩ = Γo · tanh c = ${f(a, 4)}`, "middle", "th");
      s += tx(40, 290, "teal line: the cell, changed only by × and +", null);
      return { h: 300, s };
    }
    if (k === 1) {
      const gf = sig(st.fb), a = ML.axes(70, 14, 330, 250, { xmin: 0, xmax: 100, ymin: -10, ymax: 0, nx: 5, ny: 5, fx: v => v, fy: v => "1e" + v, xl: "steps T", yl: "factor along the route, log" });
      const L = q => { const P = []; for (let n = 0; n <= 100; n++) P.push([a.X(n), a.Y(Math.max(-10, n * Math.log10(q)))]); return P; };
      s += clip("e2cpb8", 70, 14, 330, 250) + a.s + `<g clip-path="url(#e2cpb8)">` + ML.path(L(0.6), C.gray, 2) + ML.path(L(0.98), C.teal, 1.4, "5 4") + ML.path(L(gf), C.coral, 2.4) + `</g>` + ln(a.X(st.T), 14, a.X(st.T), 264, C.purple, 1.2, "4 4");
      s += tx(430, 34, `Γf = σ(${f(st.fb, 1)}) = ${f(gf, 4)}`, null, "th") + tx(430, 62, `Γf^${st.T} = ${fe(Math.pow(gf, st.T), 4)}`, null, "t") + tx(430, 86, `plain RNN 0.6^${st.T} = ${fe(Math.pow(0.6, st.T), 3)}`, null, "t") + tx(430, 110, `0.98^${st.T} = ${fe(Math.pow(0.98, st.T), 3)}`, null, "t");
      s += tx(430, 146, "coral: your forget gate", null) + tx(430, 164, "grey: plain RNN at 0.6", null) + tx(430, 182, "teal dashes: Γf = 0.98", null);
      return { h: 310, s };
    }
    if (k === 2) {
      const nb = [4, 3, 1][st.typ], nm = ["LSTM", "GRU", "RNN"][st.typ], per = st.H * st.I + st.H * st.H + 2 * st.H, tot = nb * per;
      const names = [["input i", "forget f", "cell g", "output o"], ["reset r", "update z", "new n"], ["tanh"]][st.typ];
      names.forEach((g, i) => { s += rect(30 + i * 150, 30, 136, 70, "var(--sunk)", [C.purple, C.coral, C.teal, C.blue][i]) + tx(98 + i * 150, 54, g, "middle", "th") + tx(98 + i * 150, 74, `${st.H}·${st.I} + ${st.H}·${st.H}`, "middle") + tx(98 + i * 150, 92, `+ 2·${st.H} = ${per}`, "middle"); });
      s += tx(30, 132, `nn.${nm}(${st.I}, ${st.H}): ${nb} × ${per} = ${tot.toLocaleString("en-US")} parameters`, null, "th");
      s += tx(30, 168, `batch_first=True, input (8, 50, ${st.I}):`, null, "t") + tx(30, 190, `out (8, 50, ${st.H}), h_n (1, 8, ${st.H})${st.typ === 0 ? `, c_n (1, 8, ${st.H})` : ""}`, null);
      s += tx(30, 222, "without batch_first the same tensor is read as 8 steps", null, "t") + tx(30, 244, `of a batch of 50: h_n (1, 50, ${st.H}), and no error`, null);
      return { h: 260, s };
    }
    if (k === 4) {
      const T = LAYERS[st.task];
      s += tx(20, 28, `(${"i ii iii iv".split(" ")[st.task]}) ${T.n}`, null, "th");
      const box = (x, w, lab, sub, col) => rect(x, 60, w, 70, "var(--sunk)", col) + tx(x + w / 2, 90, lab, "middle", "t") + tx(x + w / 2, 112, sub, "middle");
      s += box(20, 150, "input", T.x, C.gray) + arrow(174, 95, 206, 95, "var(--p)", 1.5);
      if (st.task === 3) s += box(210, 150, "Conv2d per frame", "(B·40, 1, 64, 64)", C.purple) + arrow(364, 95, 396, 95, "var(--p)", 1.5) + box(400, 120, "nn.LSTM", "(B, 40, F)", C.teal);
      else s += box(210, 310, T.lay, st.task === 2 ? "out (B, 500, H), h_n (1, B, H)" : st.task === 1 ? "(B, C, H, W) then flatten" : "(B, hidden)", [C.blue, C.purple, C.teal][st.task]);
      s += arrow(524, 95, 556, 95, "var(--p)", 1.5) + box(560, 100, "Linear head", T.out, C.coral);
      s += tx(20, 170, `layer: ${T.lay}`, null, "t") + tx(20, 194, `why: ${T.why}`, null) + tx(20, 226, "Linear: no structure. Conv2d: a grid. LSTM: an order in time.", null);
      return { h: 240, s };
    }
    const t = st.ang * Math.PI / 180, q = [Math.cos(t), Math.sin(t)], raw = AK.map(k2 => k2[0] * q[0] + k2[1] * q[1]), sc = raw.map(v => st.scaled === 0 ? v : v / Math.SQRT2);
    if (st.scaled === 2) sc[2] = -Infinity;
    const mx = Math.max(...sc), e = sc.map(v => Math.exp(v - mx)), se = e.reduce((x, y) => x + y, 0), wv = e.map(v => v / se), out = [0, 1].map(j => wv.reduce((acc, w, i) => acc + w * AV[i][j], 0));
    const a = ML.axes(50, 14, 260, 260, { xmin: -1, xmax: 2.5, ymin: -1, ymax: 2.5, nx: 7, ny: 7, fx: v => v, fy: v => v });
    s += a.s + arrow(a.X(0), a.Y(0), a.X(q[0]), a.Y(q[1]), C.coral, 2.4) + tx(a.X(q[0]) + 6, a.Y(q[1]) - 6, "q", null, "th");
    AK.forEach((k2, i) => { s += dot(a.X(k2[0]), a.Y(k2[1]), 5 + 10 * wv[i], C.blue) + tx(a.X(k2[0]) + 12, a.Y(k2[1]) + 16, `k${i + 1}`, null); });
    AV.forEach((v, i) => { s += `<rect x="${a.X(v[0]) - 5}" y="${a.Y(v[1]) - 5}" width="10" height="10" fill="none" stroke="${C.purple}" stroke-width="1.4"/>`; });
    s += dot(a.X(out[0]), a.Y(out[1]), 6, C.teal);
    s += tx(350, 34, `q = (${f(q[0], 3)}, ${f(q[1], 3)})`, null, "th") + tx(350, 60, `scores ${sc.map(v => isFinite(v) ? f(v, 4) : "−∞").join(", ")}`, null, "t");
    wv.forEach((w, i) => { s += `<rect x="350" y="${80 + i * 26}" width="${200 * w}" height="18" rx="3" fill="${C.blue}" opacity="0.8"/>` + tx(356 + 200 * w, 94 + i * 26, `w${i + 1} = ${f(w, 4)}`, null); });
    s += tx(350, 178, `output (${f(out[0], 4)}, ${f(out[1], 4)})`, null, "th") + tx(350, 206, "blue dots: keys, size = weight", null) + tx(350, 224, "purple squares: values", null) + tx(350, 242, "teal: the output, a weighted mean", null);
    return { h: 300, s };
  }
};

/* ====================================================================
   Part A: twelve short questions, 2 points each
   ==================================================================== */
const QA = [
  { q: "A micrograph can show cracks, pores and inclusions, in any combination, including none. Which output and loss fit?", o: ["3 logits, softmax, nn.CrossEntropyLoss with an int64 target (B,)", "3 logits, nn.BCEWithLogitsLoss with a float target (B, 3)", "1 logit, nn.BCEWithLogitsLoss", "3 outputs, nn.MSELoss on one-hot targets"], a: 1, why: "The labels are not exclusive, so each defect gets its own yes or no: one sigmoid per logit inside BCEWithLogitsLoss, with a float target of 0s and 1s. Softmax would force the three to share a probability of 1. Lesson 30." },
  { q: "What does nn.CrossEntropyLoss expect for a batch of 16 examples and 4 classes?", o: ["probabilities after softmax (16, 4) and one-hot float targets (16, 4)", "raw logits (16, 4) and int64 class indices (16,)", "raw logits (16, 4) and int64 class indices (16, 1)", "log-probabilities (16, 4) and float targets (16,)"], a: 1, why: "It applies log-softmax itself, so it takes raw logits, and the usual target is one class index per example, int64 with shape (B,). A softmax in the model would be applied twice. Lessons 30 and 38." },
  { q: "During training, 40% of the hidden ReLU units output 0 for every training example and the loss stops improving. The most likely cause and fix?", o: ["vanishing gradients from ReLU's slope, switch to sigmoid", "dying ReLU after too large a step, lower the learning rate or use Leaky ReLU or He initialization", "overfitting, add dropout", "the units are saturated at 1, lower the bias"], a: 1, why: "A ReLU unit whose input is negative for every example outputs 0 and gets zero gradient, so it never recovers. Large steps or negative biases push units there. A smaller rate, He initialization or Leaky ReLU help. Lesson 34." },
  { q: "A 12-layer network uses sigmoid in every hidden layer. At best, by how much does the chain of sigmoid slopes scale the gradient that reaches the first layer?", o: ["0.5¹² ≈ 2.4 × 10⁻⁴", "0.25¹² ≈ 6.0 × 10⁻⁸", "1, sigmoid keeps the gradient", "e⁻¹² ≈ 6.1 × 10⁻⁶"], a: 1, why: "σ′(z) = σ(z)(1 − σ(z)) is at most 0.25, at z = 0. Twelve such factors give at most 0.25¹² = 5.96 × 10⁻⁸, the vanishing gradient that ReLU avoids. Lesson 34." },
  { q: "nn.Conv2d(3, 12, kernel_size=5, padding=2) receives a batch of shape (8, 3, 40, 40). What is the output shape?", o: ["(8, 12, 36, 36)", "(8, 12, 40, 40)", "(8, 3, 40, 40)", "(8, 12, 20, 20)"], a: 1, why: "H = (40 + 2·2 − 5)/1 + 1 = 40. Padding (k − 1)/2 with stride 1 keeps the size, and the channels become 12. Lesson 36." },
  { q: "How many parameters does nn.Conv2d(12, 24, kernel_size=3) have?", o: ["2,592", "2,616", "324", "3,480"], a: 1, why: "C_out (C_in k² + 1) = 24 (12 · 9 + 1) = 24 · 109 = 2,616. The weights are 2,592 and there is one bias per output channel. Lesson 36." },
  { q: "2% of parts are defective. A model that calls every part good scores accuracy 0.98. Which number exposes it?", o: ["its specificity, 1.0", "its recall on the defective class, 0", "its accuracy on the training set", "its log-loss on the good parts"], a: 1, why: "It finds none of the defects, so recall (TP / (TP + FN)) is 0 and F1 is 0. Accuracy is dominated by the large class. Lesson 31." },
  { q: "A model flags 50 parts. 40 of them are defective, and there are 60 defective parts in total. Precision and recall?", o: ["precision 0.667, recall 0.8", "precision 0.8, recall 0.667", "precision 0.8, recall 0.8", "precision 0.4, recall 0.6"], a: 1, why: "Precision = 40 / 50 = 0.8, the share of flags that are real. Recall = 40 / 60 = 0.667, the share of defects found. Lesson 31." },
  { q: "torch.nn.utils.clip_grad_norm_(params, max_norm=1.0) is applied to a gradient (3, 0, −4). What is the gradient afterwards?", o: ["(1, 0, −1)", "(0.6, 0, −0.8)", "(3, 0, −4)", "(0.75, 0, −1)"], a: 1, why: "The norm is 5, above 1, so every entry is scaled by 1/5. The direction is kept. Clipping by value at 1 would give (1, 0, −1) and turn the direction. Lesson 39." },
  { q: "A sequence model is trained with teacher forcing. What is exposure bias?", o: ["the model sees the test set during training", "at generation it is fed its own outputs, which it never saw during training, so errors compound", "the gradient vanishes over long sequences", "the first tokens get more weight in the loss"], a: 1, why: "Teacher forcing feeds the true previous token. At generation time the model consumes its own predictions, a distribution it was never trained on, and early errors snowball. Scheduled sampling is one remedy. Lesson 39." },
  { q: "x has shape (4, 100, 6). What does nn.LSTM(input_size=6, hidden_size=32, batch_first=True) return?", o: ["out (4, 100, 32), h_n (1, 4, 32), c_n (1, 4, 32)", "out (4, 32), h_n (4, 32), c_n (4, 32)", "out (100, 4, 32), h_n (1, 100, 32), c_n (1, 100, 32)", "out (4, 100, 6), h_n (1, 4, 6), c_n (1, 4, 6)"], a: 0, why: "out has one hidden state per step, (batch, time, hidden). h_n and c_n hold the last state of each layer: (layers, batch, hidden). Lesson 40." },
  { q: "A transformer encoder without positional encoding reads a sentence. The words are shuffled. What happens to the outputs?", o: ["they are unchanged", "they are shuffled in the same way, so word order is invisible to the model", "they become random", "the model raises a shape error"], a: 1, why: "Self-attention treats the inputs as a set: permuting the tokens permutes the outputs the same way. Positional encodings add the order back. Lessons 41 and 42." }
];
/* vary the position of the right answer */
const QPOS = [1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 0, 2];
QA.forEach((q, i) => { const c = q.o[q.a], rest = q.o.filter((_, j) => j !== q.a); rest.splice(QPOS[i], 0, c); q.o = rest; q.a = QPOS[i]; });

/* ====================================================================
   The lesson
   ==================================================================== */
addLesson("ml", "exam", {
level: "Core", num: "E2",
id: "ml-exam-e2", title: "Final-style practice", short: "E2. Final-style practice",
big: String.raw`A practice final worth 100 points over the material after the midterm: logistic regression, softmax and the choice of loss, evaluating a classifier, the multilayer perceptron and backpropagation, activations, initialization and optimizers, convolutional and residual networks, recurrent networks, LSTMs and attention. Part A is twelve short questions for 24 points. Part B is eight board problems for 76 points, built around the topics that come back on every practice final of the course: a two-layer ReLU network by hand, the Conv2d output size and parameter count, multi-class against multi-label, MSELoss against BCEWithLogitsLoss against CrossEntropyLoss, exploding and vanishing gradients, gradient clipping, the LSTM gates, teacher forcing, and choosing nn.Linear, nn.Conv2d or nn.LSTM for a task. Every part has a worked solution that opens one line at a time and a picture you can move. Mark yourself as you go, and the score sheet tells you which lessons to reopen. All numbers are new.`,
bridge: String.raw`E1 practiced the midterm on Parts 1 to 5. Lessons 38 and 43 tested Parts 6 to 8 section by section. This lesson mixes them the way the final does, under a clock and with partial credit. E3 is a full mock final over the whole course.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. The exam", t: "How the practice final is built and how to time it",
intu: String.raw`Part A is twelve multiple-choice questions at 2 points each. Part B is eight board problems that add up to 76 points, each split into parts of 2 to 4 points. The largest is B4, a two-layer ReLU network forward and backward, because that is the problem the course's practice finals return to most. Pick your time, then click a section to see what it covers and which lesson it draws on. The minutes are the points scaled to your time.`,
eq: String.raw`\[ 100 = \underbrace{12\times 2}_{\text{Part A}} + \underbrace{8 + 8 + 8 + 14 + 8 + 10 + 10 + 10}_{\text{Part B}} \]`,
sym: [["Part A", "12 short questions, 2 points each"], ["B1 to B8", "board problems with worked solutions"], ["minutes", "points times your time over 100"], ["self-mark", "none, half or full on each board part"]],
how: ["Choose the time, 120 minutes is a typical final.", "Take Part A without notes.", "Do B4 early, it carries the most points.", "Work each part on paper before opening a line of the solution.", "Mark each part honestly and open the score sheet."],
say: String.raw`The practice final has twelve short questions worth twenty-four points and eight board problems worth seventy-six, with the two-layer network by hand as the largest problem.`,
num: String.raw`<b>100</b> points, <b>12</b> short questions and <b>8</b> board problems with <b>36</b> parts, about <b>120</b> minutes.`,
note: String.raw`Bring a calculator that does \(e^x\), \(\ln\) and \(\tanh\). Every board number was chosen to be done by hand in a few lines.`,
r(fig, ctl) {
  let T = 120, k = 0;
  ctl.innerHTML = btns([[75, "75 min"], [90, "90 min"], [120, "120 min"], [150, "150 min"]], "e2t") + btns(SECS.map((s, i) => [i, s.short]), "e2k") + `<div id="e2cv"></div>`;
  const u = () => {
    pick(ctl, "e2t", T); pick(ctl, "e2k", k);
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
    $("e2cv").innerHTML = `<p class="note"><b>${sc.name}</b>: about ${f(sc.pts * T / 100, 0)} minutes at your pace. ${k === 0 ? "Answer in order and commit before reading the feedback." : "Open the card, work the parts on paper, then reveal the solution one line at a time."}</p>`;
  };
  ctl.querySelectorAll("button[data-e2t]").forEach(b => b.onclick = () => { T = +b.dataset.e2t; u(); });
  ctl.querySelectorAll("button[data-e2k]").forEach(b => b.onclick = () => { k = +b.dataset.e2k; u(); });
  u();
}},

{s: "Part A", t: "Part A: twelve short questions, 2 points each",
intu: String.raw`Twelve questions over the ground the final opens with: multi-label against multi-class, what CrossEntropyLoss expects, dying ReLU, sigmoid in a deep chain, Conv2d shapes and counts, precision and recall on skewed data, clipping, exposure bias, LSTM shapes and the order blindness of attention. About a minute each. Commit before reading the feedback and count 2 points per correct answer.`,
eq: String.raw`\[ \text{Part A} = 2 \times (\text{number correct}), \qquad \text{at most } 24 \]`,
sym: [["Lessons 29 to 31", "losses, metrics, imbalance"], ["Lessons 34 and 36", "activations, Conv2d shapes and counts"], ["Lessons 39 and 40", "clipping, teacher forcing, LSTM shapes"], ["Lessons 41 and 42", "attention and positions"]],
how: ["For a loss question, name the task type first.", "For a shape question, write the formula before the numbers.", "For a metric, write the confusion matrix cell it divides."],
say: String.raw`Part A checks the quick facts: which output and loss a task needs, what each layer does to a shape, which metric exposes a lazy model, and what goes wrong in sequence models.`,
num: String.raw`<b>12</b> questions, <b>2</b> points each, about a minute each, which leaves the rest of the clock for the board.`,
note: String.raw`The answer positions vary. Read every option before choosing, because two often differ only in a shape or a dtype.`,
r(fig, ctl) { ML.quiz(fig, ctl, QA, "Part A"); }},

{s: "B1. Logistic regression", t: "B1: a weld classifier by hand, its loss, one step and its boundary (8 points)",
intu: String.raw`The binary classifier of HW8 Part 3 and HW9 Problem 1 in four parts. Compute the score and the probability, the cross-entropy for both labels, the gradient \(p - y\) and one step, and the boundary at two thresholds. Move the weld's features in (a) and (b) and watch the probability and both losses. In (c) the curve shows the loss after one step for every learning rate. In (d) the threshold slides the line without turning it.`,
eq: String.raw`\[ p = \sigma(\mathbf w^\top\mathbf x + b), \qquad \ell = -y\ln p - (1 - y)\ln(1 - p), \qquad \frac{\partial\ell}{\partial z} = p - y \]`,
sym: [[String.raw`\(z\)`, "the score, or logit"], [String.raw`\(p\)`, "the model probability of class 1"], [String.raw`\(\tau\)`, "the decision threshold"], [String.raw`\(\ln\frac{\tau}{1 - \tau}\)`, "the score at the boundary"]],
how: ["Write z with every term substituted.", "Pick the loss term by the label.", "Gradient: (p − y) times x, and p − y for b.", "Step against it and recompute z.", "For a threshold, set z to ln(τ / (1 − τ))."],
say: String.raw`The weld scores z equal to 1 and p equal to 0.731, its loss is 1.313 for a good weld, one step at 0.5 lowers it to 0.786, and at threshold 0.8 the boundary drops by 0.693 and the weld is called good.`,
num: String.raw`\(z\) = <b>1.0</b>, \(p\) = <b>0.7311</b>, \(\ell\) = <b>1.3133</b> and <b>0.3133</b>, gradient (<b>0.7311, 0.3655</b>), after one step \(p\) = <b>0.5443</b> and \(\ell\) = <b>0.7859</b>, flip at \(\alpha\) > <b>0.608</b>.`,
note: String.raw`HW9 1A asks for the substitution, not only the result. Write \(1.5\cdot 1 + (-2)\cdot 0.5 + 0.5\) before the 1.0, and say which term of the loss survives.`,
r(fig, ctl) { board(fig, ctl, B1); }},

{s: "B2. Softmax and losses", t: "B2: softmax by hand, stable logits, multi-label tags and the loss to choose (8 points)",
intu: String.raw`Four parts on multi-class outputs. Compute a softmax and its cross-entropy, its gradient, and what happens when the logits are near 1000. Then four tags that can be present together, which need a sigmoid each. Finish with the table every final asks for: which last layer, which loss and which target for four tasks. Move the logits in (a), add a large constant in (b), and switch between sigmoid and softmax in (c).`,
eq: String.raw`\[ p_k = \frac{e^{z_k - \max_j z_j}}{\sum_i e^{z_i - \max_j z_j}}, \qquad \ell = \ln\sum_j e^{z_j} - z_y, \qquad \frac{\partial\ell}{\partial\mathbf z} = \mathbf p - \mathbf e_y \]`,
sym: [[String.raw`\(\mathbf z\)`, "the logits, one per class"], [String.raw`\(\mathbf e_y\)`, "the one-hot vector of the true class"], ["multi-class", "one class per example, softmax"], ["multi-label", "any set of tags, one sigmoid each"]],
how: ["Subtract the largest logit before exponentiating.", "Divide by the sum.", "Cross-entropy is minus the log of the true class's probability.", "For tags, average the binary cross-entropies.", "Match the target dtype to the loss."],
say: String.raw`Softmax of (1, 3, minus 1) is 0.117, 0.867 and 0.016, the loss for class 0 is 2.143 with gradient p minus e, the stable form gives the same at (1000, 1002, 998), and four independent tags average to a loss of 0.314.`,
num: String.raw`\(\mathbf p\) = (<b>0.1173, 0.8668, 0.0159</b>), \(\ell\) = <b>2.1429</b>, gradient (<b>−0.8827, 0.8668, 0.0159</b>), tag losses mean <b>0.3141</b>.`,
note: String.raw`nn.CrossEntropyLoss already contains the log-softmax. A softmax layer in front of it is the most common bug on the final, and it trains, slowly, without any error.`,
r(fig, ctl) { board(fig, ctl, B2); }},

{s: "B3. Evaluation", t: "B3: confusion matrix, threshold, error costs and AUC on twelve parts (8 points)",
intu: String.raw`Twelve parts with their scores, four of them defective, small enough to count by hand. Build the confusion matrix and the four metrics, lower the threshold, price the two kinds of error, and count ordered pairs for the AUC. Slide the threshold in every part and watch the matrix, the cost and the point on the ROC curve move together.`,
eq: String.raw`\[ \text{precision} = \frac{TP}{TP + FP}, \qquad \text{recall} = \frac{TP}{TP + FN}, \qquad F_1 = \frac{2PR}{P + R}, \qquad \tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}} \]`,
sym: [["TP, FP, FN, TN", "the four cells of the confusion matrix"], [String.raw`\(C_{FN}, C_{FP}\)`, "cost of a miss and of a false alarm"], ["ROC", "recall against false positive rate over all thresholds"], ["AUC", "share of correctly ordered (defective, good) pairs"]],
how: ["Sort the scores and draw the threshold.", "Count the four cells.", "Divide for precision and recall.", "Total cost is the miss cost times FN plus FP.", "For AUC, count the good scores below each defective one."],
say: String.raw`At 0.5 precision and recall are both 0.5 and accuracy equals that of the lazy model, at 0.25 recall is 1 and F1 is 0.727, the cost is lowest near 0.25 at 3, and the AUC is 26 of 32 pairs, 0.8125.`,
num: String.raw`at 0.5 TP <b>2</b>, FP <b>2</b>, FN <b>2</b>, TN <b>6</b>, F1 <b>0.5</b>, at 0.25 F1 <b>0.727</b>, costs <b>14</b> and <b>3</b>, \(\tau^*\) = <b>0.143</b>, AUC <b>0.8125</b>.`,
note: String.raw`HW9 Problem 3 chooses the threshold on validation by the cost and then reports the test cost once. Say that sentence on the final whenever a threshold is chosen.`,
r(fig, ctl) { board(fig, ctl, B3); }},

{s: "B4. Two-layer network", t: "B4: a 3-2-1 ReLU network forward, backward and one step (14 points)",
intu: String.raw`The problem the course's practice finals return to most. Count the parameters, run the forward pass, compute the MSE on a batch and the silent broadcasting trap, then the full backward pass with the ReLU mask, and one SGD step. Move the input in (b) and watch unit 2 switch on and off. Switch to Leaky ReLU in (d) to see a gradient reach the off unit. In (e) the curve shows the loss after one step for every learning rate.`,
eq: String.raw`\[ \mathbf z^{[1]} = W^{[1]}\mathbf x + \mathbf b^{[1]}, \quad \mathbf a^{[1]} = \max(0, \mathbf z^{[1]}), \quad \hat y = W^{[2]}\mathbf a^{[1]} + b^{[2]} \]
\[ \frac{\partial L}{\partial\mathbf z^{[1]}} = \left(W^{[2]\top}\frac{\partial L}{\partial\hat y}\right)\odot \mathbb 1[\mathbf z^{[1]} \gt 0], \qquad \frac{\partial L}{\partial W^{[1]}} = \frac{\partial L}{\partial\mathbf z^{[1]}}\,\mathbf x^\top \]`,
sym: [[String.raw`\(W^{[1]}\)`, "2 by 3, rows (1, 0, 1) and (−1, 2, 0.5)"], [String.raw`\(W^{[2]}\)`, "1 by 2, (2, −1)"], [String.raw`\(\odot\)`, "elementwise product"], [String.raw`\(\mathbb 1[z \gt 0]\)`, "the ReLU slope, 1 or 0"]],
how: ["Write every z with its bias.", "Apply ReLU and mark the off units.", "Start the backward pass at 2(ŷ − y).", "Through ReLU, zero the off units.", "Outer product with the layer input for each weight gradient.", "Step, then rerun the forward pass."],
say: String.raw`The network has eleven parameters, the first example gives z of 3 and minus 1 and an output of 6.5, the batch MSE is 2.125 but 20.875 with a flat target, the gradient reaches only the first hidden unit, and one step at 0.01 cuts the loss from 0.25 to 0.0154.`,
num: String.raw`<b>11</b> parameters, \(\mathbf z^{[1]}\) = (<b>3, −1</b>), \(\hat y\) = <b>6.5</b>, MSE <b>2.125</b> against <b>20.875</b>, \(\partial L/\partial W^{[1]}\) rows (<b>2, −2, 4</b>) and (<b>0, 0, 0</b>), after the step \(\hat y\) = <b>6.1242</b>, \(L\) = <b>0.0154</b>.`,
note: String.raw`Every number here was checked with PyTorch autograd on the same weights. On the exam, write the shape of each gradient next to it: a gradient always has the shape of the thing it belongs to.`,
r(fig, ctl) { board(fig, ctl, B4); }},

{s: "B5. Activations and optimizers", t: "B5: activation slopes, dying ReLU, He and Xavier, Adam, dropout and batch norm (8 points)",
intu: String.raw`Four parts on what makes deep networks train. The slopes of ReLU, sigmoid and tanh and what they do over many layers, and a ReLU unit that can never fire. The initialization scales that keep a signal alive through ten layers. Two Adam steps against plain SGD, and what happens when the gradients are a hundred times larger. Dropout in training and evaluation, and batch norm on one unit. Every part has a slider or a switch.`,
eq: String.raw`\[ \sigma' = \sigma(1 - \sigma) \le \tfrac14, \qquad \sigma_{\text{He}} = \sqrt{\frac{2}{n_{\text{in}}}} \]
\[ w := w - \alpha\frac{\hat m}{\sqrt{\hat v} + \varepsilon}, \qquad \hat x = \frac{x - \mu_B}{\sqrt{\sigma_B^2 + \varepsilon}} \]`,
sym: [[String.raw`\(g'(z)\)`, "the slope an activation passes back"], [String.raw`\(n_{\text{in}}, n_{\text{out}}\)`, "fan-in and fan-out"], [String.raw`\(\hat m, \hat v\)`, "Adam's bias-corrected moments"], ["keep probability", "the share of units kept by dropout"]],
how: ["Write each slope as a function of the value.", "Raise the slope to the number of layers.", "Check the unit's largest possible z.", "For Adam, update m and v, then correct both.", "Dropout divides by the keep probability in training only."],
say: String.raw`At z equal to 1.5 six sigmoid layers scale the gradient by about one in ninety thousand while ReLU passes it whole, He initialization keeps the scale at one, Adam moves 0.01 then 0.005 whatever the gradient scale, and dropout turns (2, 4, 0, 1.2) into (2.67, 0, 0, 1.6).`,
num: String.raw`slopes <b>1</b>, <b>0.1491</b>, <b>0.1807</b>, He <b>0.0884</b>, Xavier <b>0.0722</b>, Adam <b>0.99</b> then <b>0.99494</b>, dropout (<b>2.6667, 0, 0, 1.6</b>), batch norm \(\hat x\) = (<b>−1.1767, −0.7845, 0.7845, 1.1767</b>).`,
note: String.raw`The Adam numbers match torch.optim.Adam to 7 digits. Its first step always has size \(\alpha\), so a learning rate copied from an SGD run is usually far too large or too small for Adam.`,
r(fig, ctl) { board(fig, ctl, B5); }},

{s: "B6. CNNs", t: "B6: a convolution by hand, shapes and counts through a CNN, pooling and a residual shortcut (10 points)",
intu: String.raw`Five parts on convolutional networks. A 3 by 3 kernel on a 4 by 4 image by hand, the shapes and the parameter count of a small CNN, the max pooling forward and backward, and a residual block whose shortcut has to change shape. Step through the four windows in (a), change the image size and the padding in (b) and (c) until the Linear layer breaks, switch to average pooling in (d), and move the block slope in (e).`,
eq: String.raw`\[ H_{\text{out}} = \left\lfloor\frac{H + 2p - k}{s}\right\rfloor + 1, \qquad \text{params} = C_{\text{out}}\left(C_{\text{in}}k^2 + 1\right), \qquad \mathbf y = F(\mathbf x) + \mathbf x \]`,
sym: [["k, s, p", "kernel size, stride, padding"], [String.raw`\(C_{\text{in}}, C_{\text{out}}\)`, "input and output channels"], ["max pool", "keeps the largest of each block, no parameters"], ["projection", "a 1 by 1 convolution on the shortcut"]],
how: ["Do not flip the kernel.", "Write the size formula for every layer.", "Flatten keeps the batch dimension.", "Count weights plus one bias per output channel.", "A shortcut needs the same shape as F(x)."],
say: String.raw`The kernel gives 1, minus 3, 7 and minus 1, the network goes 64, 32, 16, 16, 8 and flattens to 2048, it has 26,346 parameters, the pooling gradient goes only to the four winners, and the shortcut needs a 1 by 1 convolution with stride 2.`,
num: String.raw`output (<b>1, −3, 7, −1</b>), flatten <b>2048</b>, parameters <b>1216</b>, <b>4640</b>, <b>20490</b>, total <b>26,346</b>, pooled (<b>4, 5, 2, 6</b>), projection <b>544</b>, gradients <b>5.9e-6</b> against <b>0.0282</b>.`,
note: String.raw`HW10 B1 asks for the same table of shapes before any code. The shape that breaks most often is the input of the first Linear layer, so write it down and check it against the error message.`,
r(fig, ctl) { board(fig, ctl, B6); }},

{s: "B7. RNNs", t: "B7: a recurrent unit through time, BPTT, vanishing gradients, clipping and teacher forcing (10 points)",
intu: String.raw`A one-unit RNN over three steps, small enough for a calculator, then the three ideas that every final asks about. Move the recurrent weight in (a) and (b) and watch the hidden states and the per-step gradient terms. In (c) the factor per step decides whether the gradient vanishes or explodes. In (d) clip a gradient two ways and compare the angles. In (e) a model that is only 5% wrong per step drifts far from the truth when it runs on its own outputs.`,
eq: String.raw`\[ h_t = \tanh(w h_{t-1} + u x_t), \qquad \frac{\partial L}{\partial w} = \sum_t \frac{\partial L}{\partial z_t}h_{t-1}, \qquad \frac{\partial L}{\partial h_{t-1}} = w\,(1 - h_t^2)\frac{\partial L}{\partial h_t} \]`,
sym: [[String.raw`\(w, u, v\)`, "recurrent, input and output weights, shared by every step"], [String.raw`\(z_t\)`, "the pre-activation at step t"], [String.raw`\(\texttt{max\_norm}\)`, "the length a clipped gradient may have"], ["teacher forcing", "feeding the true previous value in training"]],
how: ["Run the steps forward and keep every h.", "Start the backward pass at the output.", "At each step multiply by 1 − h² and then by w.", "Sum one term per step for each shared weight.", "Clip between backward and step."],
say: String.raw`The states are 0.762, 0.109 and 0.970, the loss is 0.103, the shared weight's gradient 0.0289 is a sum of three terms, 0.8 to the thirtieth vanishes while 1.2 to the thirtieth explodes, clipping by norm keeps the direction, and a 5% model error grows to 2.5 after ten free steps.`,
num: String.raw`\(h\) = (<b>0.7616, 0.1088, 0.9697</b>), \(L\) = <b>0.1033</b>, \(\partial L/\partial w\) = <b>0.0289</b>, \(\partial L/\partial u\) = <b>0.0761</b>, \(0.8^{30}\) = <b>0.0012</b>, \(1.2^{30}\) = <b>237</b>, clipped (<b>3, −4, 0</b>), free-running error <b>2.50</b>.`,
note: String.raw`When a final asks why an RNN fails on long sequences, give both halves: the product of factors \(w(1 - h^2)\), and the fix for each case, clipping for exploding and gates for vanishing.`,
r(fig, ctl) { board(fig, ctl, B7); }},

{s: "B8. LSTM and attention", t: "B8: one LSTM step, the forget route, counts and shapes, attention, and the layer to choose (10 points)",
intu: String.raw`Five parts on the models after the plain RNN. One LSTM step with every gate, the forget gate as the route a gradient can travel, the parameter counts and the <code>batch_first</code> trap, scaled dot-product attention by hand, and the question that closes every practice final: nn.Linear, nn.Conv2d or nn.LSTM. Move the forget gate in (a) and (b), change the sizes in (c), turn the query in (d) and click through the four tasks in (e).`,
eq: String.raw`\[ c^{\langle t\rangle} = \Gamma_f\,c^{\langle t-1\rangle} + \Gamma_u\,\tilde c^{\langle t\rangle}, \qquad a^{\langle t\rangle} = \Gamma_o\tanh c^{\langle t\rangle} \]
\[ \text{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V \]`,
sym: [[String.raw`\(\Gamma_f, \Gamma_u, \Gamma_o\)`, "forget, update and output gates, sigmoids"], [String.raw`\(\tilde c\)`, "the candidate cell, a tanh"], [String.raw`\(d_k\)`, "the key size"], [String.raw`\(\texttt{h\_n}, \texttt{c\_n}\)`, "the last hidden and cell states"]],
how: ["Sigmoid for gates, tanh for the candidate and the output.", "Multiply the old cell by the forget gate, add the gated candidate.", "Four blocks of (H·I + H² + 2H) for an LSTM.", "Scores, softmax, weighted sum of the values.", "Pick the layer by the structure of the input."],
say: String.raw`The LSTM step gives c equal to 1.186 and a equal to 0.516, the forget route keeps 0.668 over twenty steps at a gate of 0.98, nn.LSTM(10, 20) has 2,560 parameters, attention gives weights 0.576, 0.140, 0.284 and output (1.144, 0.708), and the input structure picks the layer.`,
num: String.raw`\(c\) = <b>1.1859</b>, \(a\) = <b>0.5162</b>, <b>0.0178</b> and <b>0.668</b> against <b>3.7e-5</b>, counts <b>2560</b>, <b>1920</b>, <b>640</b>, weights (<b>0.5760, 0.1400, 0.2840</b>), output (<b>1.1440, 0.7080</b>).`,
note: String.raw`PyTorch orders the LSTM gate rows as input, forget, cell, output, and names the update gate the input gate. Ng's \(\Gamma_u\) is PyTorch's \(i\), so say which notation you use.`,
r(fig, ctl) { board(fig, ctl, B8); }},

{s: "Score sheet", t: "Add up the marks and see what to reopen",
intu: String.raw`The sliders start at the marks you gave yourself on the board problems. Set Part A to twice the number you got right. Bars turn teal at 70% of their points. Every section below that is listed with the lessons to reopen. The total is shown on the common 90, 80, 70, 60 scale as a rough guide only, since the course's own scale may differ.`,
eq: String.raw`\[ \text{total} = \text{A} + \sum_{k=1}^{8}\text{B}k, \qquad \text{reopen if a section is below } 70\% \]`,
sym: [["A", "Part A points, 0 to 24"], ["B1 to B8", "board points from your self-marks"], ["70%", "the line below which a section needs work"]],
how: ["Set Part A from your quiz score.", "Check the board sliders against your marks.", "Reopen the lessons listed for each coral bar.", "Redo only those problems two days later.", "Then take E3, the full mock final."],
say: String.raw`The score sheet adds Part A and the eight board problems out of one hundred and lists the lessons behind every section below seventy percent.`,
num: String.raw`Total out of <b>100</b>. A section needs work below <b>70%</b> of its points.`,
note: String.raw`Half marks are for a correct method with one slip. A correct number without the steps earns little on a board problem, so mark it that way here too.`,
r(fig, ctl) {
  const init = sc => { const m = MARK[sc.key]; if (m && m.some(v => v != null)) return m.reduce((s, v) => s + (v || 0), 0); return Math.round(0.7 * sc.pts); };
  ctl.innerHTML = SECS.map((sc, i) => sl("e2sc" + i, sc.short, 0, sc.pts, sc.key === "A" ? 2 : 1, sc.key === "A" ? 18 : init(sc))).join("") + `<div id="e2so"></div>`;
  const u = () => {
    const v = SECS.map((_, i) => +$("e2sc" + i).value);
    v.forEach((x, i) => { $("e2sc" + i + "v").textContent = x + " / " + SECS[i].pts; });
    const tot = v.reduce((a, b) => a + b, 0);
    const a = ML.axes(60, 20, 430, 220, { xmin: 0, xmax: 9, ymin: 0, ymax: 100, nx: 9, ny: 5, fx: () => "", fy: v => v + "%", yl: "share of points", grid: false });
    let s = a.s + ln(a.X(0), a.Y(70), a.X(9), a.Y(70), C.coral, 1.2, "6 4") + tx(a.X(9) + 6, a.Y(70) + 4, "70%", null);
    v.forEach((x, i) => { const p = 100 * x / SECS[i].pts, x0 = a.X(i + 0.15), w = a.X(i + 0.85) - x0; s += `<rect x="${x0}" y="${a.Y(p)}" width="${w}" height="${a.Y(0) - a.Y(p)}" rx="3" fill="${p >= 70 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, SECS[i].short, "middle"); });
    const band = tot >= 90 ? "A range" : tot >= 80 ? "B range" : tot >= 70 ? "C range" : tot >= 60 ? "D range" : "below 60";
    s += tx(530, 70, `total ${tot} / 100`, null, "th") + tx(530, 96, band, null, "t") + tx(530, 120, "on a 90, 80, 70, 60 scale", null);
    fig.innerHTML = svg(270, s);
    const weak = v.map((x, i) => [x, i]).filter(([x, i]) => x < 0.7 * SECS[i].pts);
    $("e2so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SECS[i].name}</b> at ${x} of ${SECS[i].pts}: reopen ${SECS[i].lessons}, then ${i === 0 ? "retake Part A" : "redo the problem with the solution hidden"}.</p>`).join("")}</div>` : `<p class="note">Every section is at 70% or above. Take Lessons 38 and 43 for speed, then E3, the full mock final.</p>`;
  };
  SECS.forEach((_, i) => { $("e2sc" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: check every board answer in code",
intu: String.raw`Once the paper is done, let the agent recompute every board number with PyTorch and pin it in tests. Autograd checks your backward passes in B4 and B7, the real layers check your shapes and counts in B6 and B8, and torch.optim.Adam checks the two steps in B5. A failing test means the paper or the code is wrong, and finding out which is the best revision there is.`,
eq: String.raw`\[ \texttt{b1\_logreg} \to \texttt{b4\_mlp} \to \texttt{b6\_cnn} \to \texttt{b7\_rnn} \to \texttt{b8\_lstm\_attn} \]`,
sym: [["b4 mlp", "forward, MSE, autograd gradients, one SGD step"], ["b6 cnn", "F.conv2d, the shape chain, parameter counts, max pool gradient"], ["b7 rnn", "BPTT by autograd, <code>clip_grad_norm_</code>"], ["b8 lstm attn", "LSTM counts and shapes, <code>scaled_dot_product_attention</code>"]],
how: ["Finish the paper first.", "Paste the command.", "Read every assert: is each number one of yours?", "Run pytest and resolve each failure on paper.", "Commit the script with its tests."],
say: String.raw`The agent rebuilds each board problem in PyTorch and pins the hand results in pytest, so autograd and the real layers check every forward pass, gradient, shape and count.`,
num: String.raw`Tests expect \(p\) = <b>0.7311</b>, \(\ell\) = <b>2.1429</b>, AUC <b>0.8125</b>, \(\partial L/\partial W^{[1]}\) row (<b>2, −2, 4</b>), Adam <b>0.99494</b>, <b>26,346</b> parameters, \(\partial L/\partial w\) = <b>0.0289</b>, <b>2560</b>, and attention output (<b>1.1440, 0.7080</b>).`,
note: String.raw`Ask for the loss with reduction='sum' in B4, since \(L = (\hat y - y)^2\) on one example, or the gradients will differ from yours by the batch size.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/e2_check.py and tests/test_e2.py that recompute my practice final answers with torch and numpy. Tolerance 1e-3. (B1) w = (1.5, -2), b = 0.5, x = (1, 0.5): p = 0.7311, BCEWithLogitsLoss for y = 0 is 1.3133, w.grad = (0.7311, 0.3655). (B2) cross_entropy of logits (1, 3, -1) with class 0 is 2.1429, its gradient (-0.8827, 0.8668, 0.0159), the same loss for (1000, 1002, 998), and BCEWithLogitsLoss of (1.5, -1, 0, 3) against (1, 0, 1, 1) is 0.3141. (B3) for the twelve scores in my notes, precision and recall 0.5 at threshold 0.5, F1 0.727 at 0.25, cost 6 FN + FP is 3 at 0.25, and roc_auc_score is 0.8125. (B4) W1 = [[1, 0, 1], [-1, 2, 0.5]], b1 = (0, 1), W2 = [[2, -1]], b2 = 0.5, x = (1, -1, 2), y = 6: output 6.5, autograd grads of (yhat - y)**2 equal to W1 rows (2, -2, 4) and (0, 0, 0), W2 (3, 0), one SGD step at 0.01 gives loss 0.0154, and mse_loss of outputs (2, 1) against targets (2,) is 20.875 with a warning. (B5) torch.optim.Adam at lr 0.01 on gradients 0.5 then -1.5 gives 0.99 then 0.99494. (B6) F.conv2d of my 4x4 image and kernel with bias -1 gives [[1, -3], [7, -1]], the CNN in my notes has 26346 parameters and flattens to 2048, max_pool2d backward puts the upstream gradient only at the four maxima. (B7) the one-unit RNN with w 0.8, u 1, v 1.5 on x = (1, -0.5, 2) gives loss 0.1033 and grads 0.0289, 0.0761, 0.4408, and clip_grad_norm_ at 5 turns (6, -8, 0) into (3, -4, 0). (B8) nn.LSTM(10, 20) has 2560 parameters, GRU 1920, RNN 640, and scaled_dot_product_attention for my q, K, V gives (1.1440, 0.7080). Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_e2.py", "........                                                 [100%]", "8 passed"],
    checks: ["B4 uses autograd on the given weights, not a second hand formula", "the B4 loss uses reduction='sum' or a single example", "B2 uses F.cross_entropy on raw logits, no softmax first", "B6 uses F.conv2d, which does not flip the kernel", "the LSTM test counts parameters with p.numel(), not a formula", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`The practice final is 100 points: twelve short questions for 24 and eight board problems for 76. B1 is a logistic regression by hand, from the score to the loss, one step and the boundary at two thresholds. B2 is a softmax, its gradient, stable logits, four independent tags and the table of losses and targets. B3 counts a confusion matrix on twelve parts, prices the errors and counts pairs for the AUC. B4 is the two-layer ReLU network forward, backward and one step, with the broadcasting trap. B5 covers activation slopes and dying units, He and Xavier, two Adam steps, dropout and batch norm. B6 is a convolution by hand, the shapes and counts of a CNN, pooling and a residual shortcut. B7 runs an RNN through time and covers vanishing and exploding gradients, clipping and exposure bias. B8 is an LSTM step, the forget route, counts and shapes, attention, and the choice between nn.Linear, nn.Conv2d and nn.LSTM. Mark honestly, reopen what the score sheet names, and take E3 when every section is at 70%.`,
sheet: [[String.raw`\[ p = \sigma(\mathbf w^\top\mathbf x + b), \qquad \frac{\partial\ell}{\partial\mathbf w} = (p - y)\,\mathbf x, \qquad z_\tau = \ln\frac{\tau}{1 - \tau} \]`, "B1: logistic regression, its gradient and the boundary at a threshold"],
  [String.raw`\[ \ell = \ln\sum_j e^{z_j} - z_y, \qquad \frac{\partial\ell}{\partial\mathbf z} = \mathbf p - \mathbf e_y \]`, "B2: cross-entropy by log-sum-exp and its gradient"],
  [String.raw`\[ P = \frac{TP}{TP + FP}, \quad R = \frac{TP}{TP + FN}, \quad F_1 = \frac{2PR}{P + R}, \quad \tau^* = \frac{C_{FP}}{C_{FP} + C_{FN}} \]`, "B3: metrics and the cost threshold"],
  [String.raw`\[ \delta^{[1]} = \left(W^{[2]\top}\delta^{[2]}\right)\odot g'(\mathbf z^{[1]}), \qquad \frac{\partial L}{\partial W^{[l]}} = \delta^{[l]}\mathbf a^{[l-1]\top} \]`, "B4: backpropagation through one hidden layer"],
  [String.raw`\[ \sigma_{\text{He}} = \sqrt{2/n_{\text{in}}}, \qquad \sigma_{\text{Xavier}} = \sqrt{2/(n_{\text{in}} + n_{\text{out}})}, \qquad \hat m = \frac{m}{1 - \beta_1^t} \]`, "B5: initialization and Adam's bias correction"],
  [String.raw`\[ H_{\text{out}} = \left\lfloor\frac{H + 2p - k}{s}\right\rfloor + 1, \qquad C_{\text{out}}(C_{\text{in}}k^2 + 1) \]`, "B6: convolution size and parameters"],
  [String.raw`\[ \frac{\partial L}{\partial h_{t-1}} = w(1 - h_t^2)\frac{\partial L}{\partial h_t}, \qquad \mathbf g := \mathbf g\,\min\left(1, \frac{c}{\lVert\mathbf g\rVert}\right) \]`, "B7: one step of BPTT and clipping by norm"],
  [String.raw`\[ c^{\langle t\rangle} = \Gamma_f c^{\langle t-1\rangle} + \Gamma_u\tilde c^{\langle t\rangle}, \qquad 4(HI + H^2 + 2H) \text{ for nn.LSTM} \]`, "B8: the LSTM cell and its parameter count"]],
sources: ["AME 5970 final practice exams 1 to 3, topic order (the PDFs were not available in this session, so the recurring topics follow the list in course/README_course_map.md)", "AME 5970 HW8 questions and solutions docs, Part 3 (logistic regression by hand, BCELoss against BCEWithLogitsLoss), the model for B1", "AME 5970 HW9 questions and solutions docs, Problems 1 to 3 (substitution by hand, the binary and multiclass contracts, metrics, cost-based thresholds), the model for B1 to B3", "AME 5970 HW10 questions and solutions docs, Parts A to D (losses, the training loop, B1's shape table and parameter count, activations, the residual gradient route), the model for B2 and B4 to B6", "Lessons 29 to 42 of this shelf, and the board problems of Lessons 38 and 43", "Andrew Ng, Machine Learning Specialization, course 1, week 3 (logistic regression) and course 2, weeks 1 to 3 (neural networks, softmax, evaluating a model)", "Andrew Ng, Deep Learning Specialization, course 1 (backpropagation), course 2 (initialization, Adam, dropout, batch norm), course 4 (convolutions, ResNets) and course 5 (RNNs, LSTM, attention)", "Pascanu, Mikolov and Bengio (2013), On the difficulty of training recurrent neural networks, for clipping", "Bengio, Vinyals, Jaitly and Shazeer (2015), Scheduled sampling, for exposure bias", "Vaswani et al. (2017), Attention is all you need, section 3.2"]
});
})();
