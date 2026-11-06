(function () {
/* ML shelf, Part 6, Lesson 29: Logistic regression. The course has no lecture notes for week 7 (logistic regression), so the topics follow the homework: HW8 Part 3 (logistic regression from scores to decisions, 3A to 3E) and HW9 Problem 1 (binary logits, data preparation, reliable training, 1A to 1D), with their solutions docs. Andrew Ng's Machine Learning Specialization course 1 week 3 (classification with logistic regression, cost function, gradient descent, regularized logistic regression) is the spine, with CS229 Part II for the likelihood view. Evaluation (confusion matrix, thresholds by cost, ROC) is Lesson 31, softmax is Lesson 30. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const sig = z => 1 / (1 + Math.exp(-z));
const sp = z => Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));
const bceZ = (z, y) => sp(z) - y * z;
const lgt = p => Math.log(p / (1 - p));
const mn = v => String(v).replace(/-/g, "−");
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const lin = (ws, names, b) => "z = " + ws.map((w, i) => (i ? (w < 0 ? " − " : " + ") : (w < 0 ? "−" : "")) + f(Math.abs(w), 1) + names[i]).join("") + (b < 0 ? " − " : " + ") + f(Math.abs(b), 1);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const sup = n => String(n).split("").map(c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("");
/* batch gradient descent on the mean cross-entropy plus lam/(2m) sum w^2, from zeros. F rows of features, y labels. Returns the final state and, if keep, every state. */
const fitLog = (F, y, a, n, lam, keep) => {
  const m = y.length, d = F[0].length; let w = new Array(d).fill(0), b = 0;
  const J = () => { let s = 0; for (let i = 0; i < m; i++) s += bceZ(dot(w, F[i]) + b, y[i]); return s / m + (lam ? lam / (2 * m) * dot(w, w) : 0); };
  const H = keep ? [J()] : null, P = keep ? [[w.slice(), b]] : null;
  for (let k = 0; k < n; k++) {
    const gw = new Array(d).fill(0); let gb = 0;
    for (let i = 0; i < m; i++) { const e = sig(dot(w, F[i]) + b) - y[i]; gb += e; for (let j = 0; j < d; j++) gw[j] += e * F[i][j]; }
    w = w.map((v, j) => v - a * (gw[j] / m + (lam ? lam / m * v : 0))); b -= a * gb / m;
    if (keep) { H.push(J()); P.push([w.slice(), b]); }
  }
  return { w, b, J: J(), H, P };
};
/* least squares line through (x, y) */
const lsq = (x, y) => { const m = x.length, sx = x.reduce((s, v) => s + v, 0), sxx = x.reduce((s, v) => s + v * v, 0), sy = y.reduce((s, v) => s + v, 0), sxy = x.reduce((s, v, i) => s + v * y[i], 0); const det = m * sxx - sx * sx; return [(sxx * sy - sx * sxy) / det, (m * sxy - sx * sy) / det]; };
/* marching squares for the zero set of fz on a box, drawn with the axes maps */
const zeroSet = (fz, a, box, n, col, w) => {
  const dx = (box.xmax - box.xmin) / n, dy = (box.ymax - box.ymin) / n, V = [];
  for (let i = 0; i <= n; i++) { V.push([]); for (let j = 0; j <= n; j++) V[i].push(fz(box.xmin + i * dx, box.ymin + j * dy)); }
  let d = "";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pts = [];
    for (let k = 0; k < 4; k++) { const [i1, j1] = c[k], [i2, j2] = c[(k + 1) % 4], v1 = V[i1][j1], v2 = V[i2][j2]; if ((v1 < 0) !== (v2 < 0)) { const t = v1 / (v1 - v2); pts.push([box.xmin + (i1 + t * (i2 - i1)) * dx, box.ymin + (j1 + t * (j2 - j1)) * dy]); } }
    for (let k = 0; k + 1 < pts.length; k += 2) d += `M${a.X(pts[k][0]).toFixed(1)} ${a.Y(pts[k][1]).toFixed(1)}L${a.X(pts[k + 1][0]).toFixed(1)} ${a.Y(pts[k + 1][1]).toFixed(1)}`;
  }
  return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 2.2}" stroke-linecap="round"/>` : "";
};
/* probability shading on a box: coral for class 1, blue for class 0, stronger when further from 0.5 */
const shade = (pz, a, box, n, tau) => {
  let s = ""; const dx = (box.xmax - box.xmin) / n, dy = (box.ymax - box.ymin) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = box.xmin + (i + 0.5) * dx, y = box.ymin + (j + 0.5) * dy, p = pz(x, y);
    const x0 = a.X(box.xmin + i * dx), y0 = a.Y(box.ymin + (j + 1) * dy), w = a.X(box.xmin + (i + 1) * dx) - x0 + 0.4, h = a.Y(box.ymin + j * dy) - y0 + 0.4;
    s += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${p >= tau ? C.coral : C.blue}" opacity="${(0.06 + 0.3 * Math.abs(p - 0.5) * 2).toFixed(2)}"/>`;
  }
  return s;
};
const dot1 = (a, x, y, cls, r) => cls ? `<path d="M${a.X(x) - (r || 4.5)} ${a.Y(y) + (r || 4.5) * 0.8} L${a.X(x)} ${a.Y(y) - (r || 4.5)} L${a.X(x) + (r || 4.5)} ${a.Y(y) + (r || 4.5) * 0.8} Z" fill="${C.coral}" stroke="#fff" stroke-width="0.6"/>` : `<circle cx="${a.X(x)}" cy="${a.Y(y)}" r="${(r || 4.5) - 0.5}" fill="${C.blue}" stroke="#fff" stroke-width="0.6"/>`;
const legend = (x, y) => `<path d="M${x - 4} ${y + 3} L${x} ${y - 5} L${x + 4} ${y + 3} Z" fill="${C.coral}"/>` + tx(x + 9, y + 3, "class 1") + `<circle cx="${x + 64}" cy="${y}" r="4" fill="${C.blue}"/>` + tx(x + 73, y + 3, "class 0");

/* Card 8 data: 60 fresh points, class 0 around (-1, -0.5), class 1 around (1, 0.8), unit spread, default_rng(2929), rounded to 2 decimals */
const D8 = [[-1.57,-1.32,0],[1.08,-0.42,0],[-1.26,-0.65,0],[-1.1,-1.45,0],[0.83,0.65,1],[-2.34,0.85,0],[1.0,0.92,1],[-1.93,0.39,0],[2.65,0.67,1],[-1.77,-0.97,0],[1.64,0.83,1],[-2.17,0.5,0],[-0.36,-1.21,0],[-0.2,-1.4,0],[-0.63,0.13,0],[-1.07,0.02,0],[1.5,0.84,1],[-1.8,0.02,0],[-2.06,-0.84,0],[-1.16,-0.12,1],[1.46,0.16,1],[-1.86,-0.12,1],[-2.01,-0.12,0],[0.99,0.65,1],[2.19,0.38,1],[0.65,0.98,1],[2.26,1.37,1],[-2.48,-0.42,0],[1.55,0.28,1],[-3.58,-1.0,0],[-0.09,-0.13,0],[-0.78,0.18,0],[0.89,1.22,1],[-2.19,0.81,1],[0.2,1.56,0],[0.55,0.88,0],[1.3,1.73,1],[1.96,0.58,1],[2.41,0.17,1],[1.66,0.49,1],[0.9,-0.45,1],[-1.16,-0.2,0],[0.78,-0.69,0],[-2.38,-1.31,0],[0.73,0.83,1],[1.52,0.91,1],[3.04,0.23,1],[2.61,-0.14,1],[1.49,0.26,1],[-1.45,-1.3,0],[0.3,-1.44,1],[-1.27,-1.71,0],[-1.6,0.79,0],[-0.12,2.51,1],[-2.88,1.52,0],[-1.16,0.4,0],[1.06,-1.17,1],[1.46,-0.49,1],[-2.14,2.27,0],[2.0,1.24,1]];
/* Card 10 data: 30 class-1 points inside radius 1, 40 class-0 points on a ring from 1.5 to 2.4, default_rng(3030), rounded to 2 decimals */
const RING = [[0.07,-0.7,1],[0.88,0.26,1],[0.0,0.6,1],[-0.12,0.9,1],[-0.45,-0.34,1],[0.75,-0.38,1],[-0.7,0.67,1],[-0.62,-0.6,1],[-0.6,-0.14,1],[0.1,0.39,1],[-0.52,0.59,1],[0.34,0.19,1],[0.45,0.5,1],[0.58,-0.6,1],[-0.33,0.2,1],[-0.32,0.0,1],[-0.96,0.06,1],[0.18,0.91,1],[-0.31,-0.23,1],[0.54,-0.5,1],[-0.48,0.05,1],[0.79,0.61,1],[0.7,0.32,1],[0.03,0.66,1],[0.55,0.36,1],[0.25,0.56,1],[0.17,0.06,1],[0.28,0.41,1],[-0.62,0.79,1],[0.02,-0.06,1],[1.73,-1.38,0],[-1.44,-1.16,0],[0.84,-1.37,0],[-1.5,-0.73,0],[1.76,-0.48,0],[-0.94,1.61,0],[-1.78,-0.94,0],[-1.12,1.79,0],[0.26,-2.29,0],[-1.42,1.13,0],[2.23,0.54,0],[0.03,-2.05,0],[1.05,-1.45,0],[0.6,2.21,0],[0.45,2.13,0],[-0.87,-1.44,0],[-1.39,1.74,0],[-1.48,-1.47,0],[-1.46,0.93,0],[-1.41,1.72,0],[1.12,-1.65,0],[-1.75,1.48,0],[-1.26,1.14,0],[-1.59,-1.25,0],[0.77,-2.03,0],[-0.09,-1.7,0],[1.77,1.45,0],[0.3,-2.24,0],[0.33,1.63,0],[-1.69,1.52,0],[-0.68,1.91,0],[-1.41,-1.21,0],[2.16,0.7,0],[0.57,2.16,0],[1.52,1.65,0],[2.09,-0.42,0],[1.06,-2.11,0],[1.74,-1.4,0],[-1.03,-1.64,0],[-1.62,0.03,0]];
/* Card 11: every value from PyTorch 2.15, float32, one example: [p, naive -(y log p + (1-y) log(1-p)), BCELoss on sigmoid, its dL/dz, BCEWithLogitsLoss, its dL/dz] */
const STAB = {"-100,1":["0","inf","100","0","100","-1"],"-100,0":["0","nan","0","0","0","0"],"-80,1":["1.805e-35","80","80","-1.805e-23","80","-1"],"-80,0":["1.805e-35","0","1.805e-35","0","0","1.805e-35"],"-20,1":["2.061e-09","20","20","-1","20","-1"],"-20,0":["2.061e-09","0","2.061e-09","2.061e-09","0","2.061e-09"],"-5,1":["0.006693","5.007","5.007","-0.9933","5.007","-0.9933"],"-5,0":["0.006693","0.006715","0.006715","0.006693","0.006715","0.006693"],"0,1":["0.5","0.6931","0.6931","-0.5","0.6931","-0.5"],"0,0":["0.5","0.6931","0.6931","0.5","0.6931","0.5"],"5,1":["0.9933","0.006715","0.006715","-0.006693","0.006715","-0.006693"],"5,0":["0.9933","5.007","5.007","0.9933","5.007","0.9933"],"20,1":["1","nan","0","0","2.061e-09","0"],"20,0":["1","inf","100","0","20","1"],"40,1":["1","nan","0","0","4.248e-18","0"],"40,0":["1","inf","100","0","40","1"]};

addLesson("ml", "class", {
level: "Core", num: "Lesson 29",
id: "ml-class-l29", title: "Logistic regression", short: "29. Logistic regression",
big: String.raw`Regression predicts a number. Classification predicts a label, here one of two: defective or acceptable, malignant or benign. Andrew Ng starts by showing why a straight line fitted to 0 and 1 labels is the wrong tool, then builds the right one in four moves. Compute a score z = wᵀx + b, any real number. Squash it with the sigmoid into a probability p between 0 and 1. Decide class 1 when p is at least a threshold, which for 0.5 means z ≥ 0, so the boundary is a straight line unless you change the features. Train by minimizing binary cross-entropy, which is the negative log of the Bernoulli likelihood from Lesson 14 and gives a convex cost. Its gradient is the error p − y times the features, the same formula as linear regression with a sigmoid inside. The lesson then runs gradient descent on fresh data, shows what goes wrong when the classes separate perfectly and how regularization fixes it, bends the boundary with squared features for HW8's ring, and ends in PyTorch: raw logits, BCEWithLogitsLoss for stable arithmetic, and HW9's (B, 1) shape contract. Lesson 30 extends this to many classes, Lesson 31 judges the decisions.`,
bridge: String.raw`The course has no lecture notes for logistic regression, week 7 of the syllabus, so the topics follow the homework: HW8 Part 3 (logistic regression from scores to decisions, tasks 3A to 3E) and HW9 Problem 1 (binary logits, data preparation and reliable training, tasks 1A to 1D), with the solutions docs for both. The spine is Andrew Ng's Machine Learning Specialization, course 1 week 3: motivation, logistic regression, decision boundary, cost function, simplified cost, gradient descent, and regularized logistic regression. CS229 Part II supplies the likelihood derivation.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Why not a line", t: "Why a straight line is the wrong tool for a yes or no label",
intu: String.raw`Ng opens classification with tumor sizes labeled 0 (benign) and 1 (malignant). Fit linear regression and predict 1 when the line is at least 0.5. On these eight tumors the line crosses 0.5 at 2.75 cm, right between the classes. Now add one very large malignant tumor. It is the easiest case in the data, yet least squares tilts the line to reach it, the crossing moves right past 3 cm and the tumor at 3.0 cm is now called benign. The line also predicts values below 0 and above 1, which no probability can be. Logistic regression, the teal curve, squashes the score through a sigmoid, so the far tumor sits on the flat top of the curve and barely pulls.`,
eq: String.raw`\[ \text{line: } h(x) = \theta_0 + \theta_1 x \]
\[ \text{logistic: } h(x) = \sigma(\theta_0 + \theta_1 x) \in (0, 1) \]`,
sym: [["y", "label, 1 malignant and 0 benign"], ["0.5 rule", "predict 1 when h(x) is at least 0.5"], ["crossing", "the size where the fitted curve equals 0.5"], ["far tumor", "an easy, correctly labeled point far from the boundary"], [String.raw`\(\sigma\)`, "the sigmoid, card 2"]],
how: ["Fit the least squares line to the 0 and 1 labels.", "Find where the line equals 0.5 and classify by side.", "Add the far tumor and refit.", "Watch the crossing move and a correct point flip.", "Compare the logistic curve, whose crossing barely moves."],
say: String.raw`Linear regression on 0 and 1 labels gives outputs outside 0 to 1 and a boundary that moves when easy far points are added, so classification needs a model whose output is a probability.`,
num: String.raw`Without the far tumor the line is h = −0.5476 + 0.3810x and crosses 0.5 at <b>2.75</b>. With a malignant tumor at 12 cm it becomes h = 0.2015 + 0.0937x, crosses at <b>3.185</b>, calls the 3.0 cm tumor benign and predicts <b>1.33</b> at 12 cm. The logistic fit crosses at <b>2.73</b> in both cases (5000 steps at α = 0.3).`,
note: String.raw`Ng's argument in one exam sentence: a good classifier should not get worse when you add a point it already classifies correctly, and linear regression does.`,
r(fig, ctl) {
  const X1 = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5], Y1 = [0, 0, 0, 0, 1, 1, 1, 1];
  ctl.innerHTML = btns([[0, "Eight tumors"], [1, "Add one large malignant tumor"]], "lra") + sl("lrf", "far tumor size", 6, 20, 1, 12) + `<div id="lrro"></div>`;
  let on = 1;
  const u = () => {
    pick(ctl, "lra", on); const far = +$("lrf").value; $("lrfv").textContent = far + " cm";
    const xs = on ? X1.concat([far]) : X1, ys = on ? Y1.concat([1]) : Y1;
    const t = lsq(xs, ys), cross = (0.5 - t[0]) / t[1], L = fitLog(xs.map(v => [v]), ys, 0.3, 5000), lc = -L.b / L.w[0];
    const XM = on ? 2 * Math.ceil((far + 1) / 2) : 6, box = { xmin: 0, xmax: XM, ymin: -0.5, ymax: 1.5, nx: on ? XM / 2 : 6, ny: 4, fx: v => +v.toFixed(1), fy: v => v.toFixed(1), xl: "tumor size (cm)", yl: "label or prediction" };
    const a = ML.axes(70, 16, 570, 230, box);
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(0.5)}" x2="${a.X(XM)}" y2="${a.Y(0.5)}" stroke="var(--p)" stroke-dasharray="5 4"/>`;
    const lp = []; for (let x = 0; x <= XM + 1e-9; x += XM / 400) { const v = t[0] + t[1] * x; if (v >= -0.5 && v <= 1.5) lp.push([a.X(x), a.Y(v)]); }
    s += ML.path(lp, C.coral, 2.2) + ML.path(Array.from({ length: 401 }, (_, i) => { const x = i * XM / 400; return [a.X(x), a.Y(sig(L.w[0] * x + L.b))]; }), C.teal, 2.2);
    s += `<line x1="${a.X(cross)}" y1="${a.Y(-0.5)}" x2="${a.X(cross)}" y2="${a.Y(1.5)}" stroke="${C.coral}" stroke-dasharray="3 3"/><line x1="${a.X(lc)}" y1="${a.Y(-0.5)}" x2="${a.X(lc)}" y2="${a.Y(1.5)}" stroke="${C.teal}" stroke-dasharray="3 3"/>`;
    let wrong = 0;
    xs.forEach((x, i) => { const bad = ((t[0] + t[1] * x) >= 0.5) !== (ys[i] === 1); if (bad) { wrong++; s += `<circle cx="${a.X(x)}" cy="${a.Y(ys[i])}" r="10" fill="none" stroke="${C.coral}" stroke-width="2"/>`; } s += `<circle cx="${a.X(x)}" cy="${a.Y(ys[i])}" r="5" fill="${ys[i] ? C.coral : C.blue}"/>`; });
    s += `<rect x="420" y="170" width="212" height="68" rx="6" fill="var(--panel)" opacity="0.9"/><line x1="428" y1="188" x2="450" y2="188" stroke="${C.coral}" stroke-width="2.2"/>` + tx(456, 192, "line crosses 0.5 at " + f(cross, 3), null, "t") + `<line x1="428" y1="210" x2="450" y2="210" stroke="${C.teal}" stroke-width="2.2"/>` + tx(456, 214, "logistic crosses at " + f(lc, 3), null, "t") + tx(428, 232, "dotted: the two crossings");
    fig.innerHTML = svg(290, s);
    $("lrro").innerHTML = RO([["line", `${f(t[0], 4)} + ${f(t[1], 4)}x`], ["misclassified by the line", wrong ? `${wrong} (the 3.0 cm tumor)` : "0"], ["line at the largest tumor", f(t[0] + t[1] * Math.max(...xs), 3)], ["logistic crossing", f(lc, 3)]]);
  };
  ctl.querySelectorAll("button[data-lra]").forEach(b => b.onclick = () => { on = +b.dataset.lra; u(); });
  $("lrf").oninput = u; u();
}},

{s: "2. Sigmoid and odds", t: "The sigmoid turns any score into a probability, the logit turns it back",
intu: String.raw`The model computes a score z, any real number, then the sigmoid \(\sigma(z) = 1/(1 + e^{-z})\) maps it into the interval from 0 to 1. Slide z. At 0 the probability is exactly 0.5, at 2 it is 0.8808, at −2 it is 0.1192, and the curve is symmetric: σ(−z) = 1 − σ(z). Read backwards, z is the log of the odds p/(1 − p), which is why the score is called a logit. The slope σ(z)(1 − σ(z)), the purple curve, is largest at z = 0 where it is 0.25, and nearly zero once |z| passes 5. On that flat tail the probability hardly changes, which matters in card 6.`,
eq: String.raw`\[ \sigma(z) = \frac{1}{1 + e^{-z}}, \qquad z = \log\frac{p}{1 - p} \]
\[ \sigma'(z) = \sigma(z)\left(1 - \sigma(z)\right) \]`,
sym: [[String.raw`\(z\)`, "logit or score, any real number"], [String.raw`\(\sigma(z)\)`, "probability of class 1, between 0 and 1"], ["odds", "p/(1 − p), from 0 to infinity"], ["log-odds", "the log of the odds, equal to z"], [String.raw`\(\sigma'(z)\)`, "the slope, at most 0.25"]],
how: ["Exponentiate minus z, add 1, take the reciprocal.", "Large positive z gives p near 1, large negative z gives p near 0.", "To go back, compute log(p/(1 − p)).", "Use σ(−z) = 1 − σ(z) to check a hand calculation.", "Remember the slope p(1 − p), it returns in the gradient."],
say: String.raw`The sigmoid maps a real-valued logit to a probability between 0 and 1, and the logit is the log-odds of that probability.`,
num: String.raw`σ(0) = <b>0.5</b>, σ(2) = <b>0.8808</b>, σ(−2) = 0.1192. A probability of 0.8 has odds 4 and logit log 4 = <b>1.3863</b>. A probability of 0.25 has odds 1/3 and logit −1.0986. The slope is 0.25 at z = 0 and 0.1050 at z = 2.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lrz", "score z", -8, 8, 0.1, 2) + `<div id="lrzo"></div>`;
  const u = () => {
    const z = +$("lrz").value, p = sig(z); $("lrzv").textContent = f(z, 1);
    const a = ML.axes(60, 16, 580, 230, { xmin: -8, xmax: 8, ymin: 0, ymax: 1, nx: 8, ny: 4, fx: v => v, fy: v => v.toFixed(2), xl: "score z (logit)", yl: "probability" });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(0)}" y2="${a.Y(1)}" stroke="var(--p)" stroke-dasharray="3 4"/><line x1="${a.X(-8)}" y1="${a.Y(0.5)}" x2="${a.X(8)}" y2="${a.Y(0.5)}" stroke="var(--p)" stroke-dasharray="3 4"/>`;
    const zs = Array.from({ length: 321 }, (_, i) => -8 + i * 0.05);
    s += ML.path(zs.map(v => [a.X(v), a.Y(sig(v))]), C.teal, 2.4) + ML.path(zs.map(v => [a.X(v), a.Y(sig(v) * (1 - sig(v)))]), C.purple, 1.8, "5 3");
    s += `<line x1="${a.X(z)}" y1="${a.Y(0)}" x2="${a.X(z)}" y2="${a.Y(p)}" stroke="${C.coral}" stroke-width="1.2"/><line x1="${a.X(-8)}" y1="${a.Y(p)}" x2="${a.X(z)}" y2="${a.Y(p)}" stroke="${C.coral}" stroke-width="1.2"/><circle cx="${a.X(z)}" cy="${a.Y(p)}" r="6" fill="${C.coral}"/><circle cx="${a.X(-z)}" cy="${a.Y(1 - p)}" r="4" fill="none" stroke="${C.coral}" stroke-width="1.5"/>`;
    s += tx(470, 150, "σ(z)", null, "th") + `<line x1="510" y1="146" x2="534" y2="146" stroke="${C.teal}" stroke-width="2.4"/>` + tx(470, 170, "σ′(z)", null, "th") + `<line x1="510" y1="166" x2="534" y2="166" stroke="${C.purple}" stroke-width="1.8" stroke-dasharray="5 3"/>` + tx(470, 190, "open dot: σ(−z) = 1 − σ(z)");
    fig.innerHTML = svg(290, s);
    $("lrzo").innerHTML = RO([["p = σ(z)", f(p, 4)], ["1 − p", f(1 - p, 4)], ["odds p/(1 − p)", p > 0.99995 || p < 5e-5 ? (p / (1 - p)).toExponential(2) : f(p / (1 - p), 4)], ["log-odds", f(z, 4)], ["slope p(1 − p)", f(p * (1 - p), 4)]]);
  };
  $("lrz").oninput = u; u();
}},

{s: "3. One observation", t: "One part through the model: score, probability, class and loss",
intu: String.raw`HW9 Problem 1A, the professor's defect example. A part has two features x = (2, −1), the model has w = (0.4, −0.6) and b = −0.2, and the part is defective, y = 1. The score is z = 0.8 + 0.6 − 0.2 = 1.2, the probability 0.7685, the class at τ = 0.5 is 1, and the loss is −log 0.7685 = 0.2633 nats. Move the features and flip the label. Lowering the score by 0.5 lowers the probability of the true class, so the loss rises to 0.4032. The class can stay right while the loss changes, because the loss scores the probability and not the decision.`,
eq: String.raw`\[ z = \mathbf{w}^T\mathbf{x} + b, \quad p = \sigma(z), \quad \hat{y} = [\,p \ge \tau\,] \]
\[ \ell = -y\log p - (1 - y)\log(1 - p) \]`,
sym: [[String.raw`\(\mathbf{w}, b\)`, "weights and bias, learned from data"], [String.raw`\(\tau\)`, "threshold, a decision choice, 0.5 here"], [String.raw`\(\hat{y}\)`, "predicted class, 1 when p is at least the threshold"], [String.raw`\(\ell\)`, "per-sample loss"], ["nats", "loss units when the log is natural"]],
how: ["Multiply and add for z, and show the substitution.", "Apply the sigmoid for p.", "Compare p with τ using ≥, so a tie predicts 1.", "Take −log of the probability given to the true class.", "Check with BCEWithLogitsLoss on the raw z."],
say: String.raw`For one example the model forms the logit, converts it to a probability with the sigmoid, thresholds the probability for a class, and scores the probability of the true label with the negative log.`,
num: String.raw`z = <b>1.2</b>, p = <b>0.7685</b>, class 1, loss <b>0.2633</b> nats. If the part were acceptable, y = 0, the loss would be −log 0.2315 = 1.4633. At z − 0.5 = 0.7 the probability is 0.6682 and the loss <b>0.4032</b>.`,
r(fig, ctl) {
  const w = [0.4, -0.6], b = -0.2;
  ctl.innerHTML = sl("lrx1", "x₁", -3, 3, 0.5, 2) + sl("lrx2", "x₂", -3, 3, 0.5, -1) + btns([[1, "label y = 1 (defect)"], [0, "label y = 0"]], "lry") + `<div class="row"><button id="lrlow">Lower the score by 0.5</button></div>`;
  let y = 1, low = false;
  const u = () => {
    pick(ctl, "lry", y); $("lrlow").classList.toggle("on", low);
    const x1 = +$("lrx1").value, x2 = +$("lrx2").value; $("lrx1v").textContent = x1; $("lrx2v").textContent = x2;
    const z0 = w[0] * x1 + w[1] * x2 + b, z = low ? z0 - 0.5 : z0, p = sig(z), cls = p >= 0.5 ? 1 : 0, loss = bceZ(z, y);
    const n = v => v < 0 ? `(${f(v, 1)})` : f(v, 1);
    const rows = [["features", `x = (${f(x1, 1)}, ${f(x2, 1)}), label y = ${y}`], ["score", `z = 0.4·${n(x1)} + (−0.6)·${n(x2)} − 0.2${low ? " − 0.5" : ""} = ${f(z, 4)}`], ["probability", `p = σ(${f(z, 4)}) = ${f(p, 4)}`], ["class", `p ${p >= 0.5 ? "≥" : "below"} 0.5, so class ${cls}${cls === y ? ", correct" : ", wrong"}`], ["loss", `${y ? "−log p" : "−log(1 − p)"} = ${f(loss, 4)} nats`]];
    let s = "";
    rows.forEach(([k, v], i) => { s += `<g class="${i === 4 ? "c-coral" : i === 2 ? "c-teal" : "c-gray"}"><rect x="16" y="${12 + i * 46}" width="104" height="36" rx="7" stroke-width="0.8"/></g>` + tx(68, 35 + i * 46, k, "middle", "th") + tx(134, 35 + i * 46, v.replace(/-/g, "−"), null, "t"); if (i < 4) s += arrow(68, 49 + i * 46, 68, 57 + i * 46, "var(--p)", 1.2); });
    const a = ML.axes(470, 20, 190, 150, { xmin: -5, xmax: 5, ymin: 0, ymax: 1, nx: 2, ny: 2, fx: v => v, fy: v => v.toFixed(1), grid: false });
    s += a.s + ML.path(Array.from({ length: 101 }, (_, i) => { const v = -5 + i * 0.1; return [a.X(v), a.Y(sig(v))]; }), C.teal, 2) + `<circle cx="${a.X(Math.max(-5, Math.min(5, z)))}" cy="${a.Y(p)}" r="5.5" fill="${C.coral}"/>`;
    if (low) s += `<circle cx="${a.X(Math.max(-5, Math.min(5, z0)))}" cy="${a.Y(sig(z0))}" r="4" fill="none" stroke="${C.coral}" stroke-width="1.5"/>` + tx(565, 230, `before: loss ${f(bceZ(z0, y), 4)}`, "middle");
    s += tx(565, 206, "where p sits on σ", "middle");
    fig.innerHTML = svg(250, s);
  };
  ctl.querySelectorAll("button[data-lry]").forEach(bt => bt.onclick = () => { y = +bt.dataset.lry; u(); });
  $("lrlow").onclick = () => { low = !low; u(); };
  $("lrx1").oninput = u; $("lrx2").oninput = u; u();
}},

{s: "4. Decision boundary", t: "The decision boundary is where the score is zero",
intu: String.raw`Predicting 1 when p ≥ 0.5 is the same as predicting 1 when z ≥ 0, because σ is increasing and σ(0) = 0.5. With two features, z = 0 is a straight line. Ng's example uses w = (1, 1) and b = −3, the line x₁ + x₂ = 3. Move the threshold and the line slides parallel to itself to z = log(τ/(1 − τ)), but it never bends. To get a curve you change the features, not the sigmoid. Switch to squared features with weights (1, 1) and b = −1 and the boundary becomes Ng's circle x₁² + x₂² = 1. The shading is the probability, stronger color further from 0.5.`,
eq: String.raw`\[ p \ge \tau \iff z \ge \log\frac{\tau}{1 - \tau} \]
\[ \tau = 0.5: \quad w_1 x_1 + w_2 x_2 + b = 0 \]`,
sym: [["boundary", "the set of inputs where z equals the threshold logit"], ["linear features", "z = w₁x₁ + w₂x₂ + b, a line"], ["squared features", "z = w₁x₁² + w₂x₂² + b, an ellipse or circle"], [String.raw`\(\mathbf{w}\)`, "normal to the line, pointing toward class 1"], [String.raw`\(\tau\)`, "moves the boundary, never bends it"]],
how: ["Set z = 0 and solve for x₂ to draw the line.", "The weight vector points to the class 1 side.", "For another threshold, set z equal to its logit.", "For a curved boundary, add features such as x₁² and x₂².", "The model stays linear in its parameters either way."],
say: String.raw`The logistic regression decision boundary is the level set where the linear score equals the logit of the threshold, which is a hyperplane in the feature space and becomes curved only through nonlinear features.`,
num: String.raw`Ng's line: the point (2, 2) has z = 1 and p = <b>0.7311</b>, class 1. At τ = 0.8 the boundary moves to x₁ + x₂ = 3 + 1.3863. Ng's circle: (0.5, 0.5) has z = −0.5 and p = <b>0.3775</b>, class 0. HW9's model w = (0.4, −0.6), b = −0.2 has the boundary 0.4x₁ − 0.6x₂ = 0.2.`,
note: String.raw`HW8 3E asks why a sigmoid on a linear score cannot separate a ring. Every probability contour p = t is the line z = log(t/(1 − t)). Card 10 fixes it with features.`,
r(fig, ctl) {
  const P = { ng: [1, 1, -3, 0], circ: [1, 1, -1, 1], hw9: [0.4, -0.6, -0.2, 0] };
  ctl.innerHTML = btns([["ng", "Ng's line"], ["circ", "Ng's circle"], ["hw9", "HW9 model"]], "lrp") + btns([[0, "features x₁, x₂"], [1, "features x₁², x₂²"]], "lrq") + sl("lrw1", "w₁", -3, 3, 0.1, 1) + sl("lrw2", "w₂", -3, 3, 0.1, 1) + sl("lrb", "b", -5, 5, 0.1, -3) + sl("lrt", "threshold τ", 0.1, 0.9, 0.05, 0.5) + `<div id="lrbo"></div>`;
  let q = 0, pre = "ng";
  const set = k => { const v = P[k]; $("lrw1").value = v[0]; $("lrw2").value = v[1]; $("lrb").value = v[2]; q = v[3]; $("lrt").value = 0.5; pre = k; };
  const u = () => {
    pick(ctl, "lrq", q); pick(ctl, "lrp", pre);
    const w1 = +$("lrw1").value, w2 = +$("lrw2").value, b = +$("lrb").value, tau = +$("lrt").value;
    $("lrw1v").textContent = f(w1, 1); $("lrw2v").textContent = f(w2, 1); $("lrbv").textContent = f(b, 1); $("lrtv").textContent = f(tau, 2);
    const zf = (x, y) => q ? w1 * x * x + w2 * y * y + b : w1 * x + w2 * y + b, c = lgt(tau);
    const box = { xmin: -4, xmax: 4, ymin: -4, ymax: 4, nx: 8, ny: 8, fx: v => v, fy: v => v, xl: "x₁", yl: "x₂", grid: false };
    const a = ML.axes(150, 12, 300, 300, box);
    let s = shade((x, y) => sig(zf(x, y)), a, box, 40, tau) + a.s + zeroSet((x, y) => zf(x, y) - c, a, box, 60, "var(--t)", 2.4);
    if (Math.abs(tau - 0.5) > 1e-9) s += zeroSet(zf, a, box, 60, C.gray, 1.2);
    if (!q && (w1 || w2)) { const n = Math.hypot(w1, w2), cx = -b * w1 / n / n, cy = -b * w2 / n / n; if (Math.abs(cx) < 3.4 && Math.abs(cy) < 3.4) s += arrow(a.X(cx), a.Y(cy), a.X(cx + w1 / n * 0.9), a.Y(cy + w2 / n * 0.9), C.purple, 2); }
    s += tx(470, 40, "boundary at τ = " + f(tau, 2), null, "th") + tx(470, 62, lin([w1, w2], q ? ["x₁²", "x₂²"] : ["x₁", "x₂"], b), null, "t") + tx(470, 84, "= log(τ/(1 − τ)) = " + mn(f(c, 4)), null, "t");
    s += `<rect x="470" y="110" width="14" height="14" fill="${C.coral}" opacity="0.5"/>` + tx(490, 122, "p ≥ τ, class 1") + `<rect x="470" y="132" width="14" height="14" fill="${C.blue}" opacity="0.5"/>` + tx(490, 144, "p below τ, class 0");
    if (Math.abs(tau - 0.5) > 1e-9) s += `<line x1="470" y1="166" x2="490" y2="166" stroke="${C.gray}" stroke-width="1.2"/>` + tx(496, 170, "the τ = 0.5 boundary");
    if (!q) s += `<line x1="470" y1="188" x2="490" y2="188" stroke="${C.purple}" stroke-width="2"/>` + tx(496, 192, "w, toward class 1");
    fig.innerHTML = svg(350, s);
    $("lrbo").innerHTML = RO([["point (2, 2)", mn(`z = ${f(zf(2, 2), 3)}, p = ${f(sig(zf(2, 2)), 4)}`)], ["point (0.5, 0.5)", mn(`z = ${f(zf(0.5, 0.5), 3)}, p = ${f(sig(zf(0.5, 0.5)), 4)}`)]]);
  };
  ctl.querySelectorAll("button[data-lrp]").forEach(bt => bt.onclick = () => { set(bt.dataset.lrp); u(); });
  ctl.querySelectorAll("button[data-lrq]").forEach(bt => bt.onclick = () => { q = +bt.dataset.lrq; pre = ""; u(); });
  ["lrw1", "lrw2", "lrb"].forEach(k => $(k).oninput = () => { pre = ""; u(); }); $("lrt").oninput = u;
  set("ng"); u();
}},

{s: "5. Loss from likelihood", t: "Binary cross-entropy is the negative log of the Bernoulli likelihood",
intu: String.raw`Lesson 14 wrote the Bernoulli likelihood \(p^y(1 - p)^{1 - y}\). For y = 1 it is p, for y = 0 it is 1 − p: the probability the model gave to what actually happened. Take −log and you get the loss Ng draws as two curves. For y = 1, −log p is 0 at p = 1 and climbs without limit as p falls to 0. For y = 0 it is the mirror image. Multiplying the likelihoods of independent examples and taking −log turns the product into a sum, so minimizing the mean loss is maximum likelihood. Slide p and flip y. A confident wrong answer, p = 0.99 for a y = 0 part, costs 4.6052, while a hesitant p = 0.5 costs only 0.6931.`,
eq: String.raw`\[ P(y \mid x) = p^{y}(1 - p)^{1 - y} \]
\[ J(\mathbf{w}, b) = -\frac{1}{m}\sum_{i=1}^{m}\Big[y_i\log p_i + (1 - y_i)\log(1 - p_i)\Big] \]`,
sym: [["likelihood", "the probability the model assigns to the observed label"], ["−log", "turns products into sums and small probabilities into large losses"], [String.raw`\(J\)`, "mean loss over m examples, Ng's logistic cost"], ["convex", "in w and b, so gradient descent has one bowl to find"], ["nats", "units of the natural log"]],
how: ["For each example pick p if y is 1 and 1 − p if y is 0.", "Take minus the natural log.", "Average over the examples.", "Check that a correct, confident prediction costs almost nothing.", "Check that a confident wrong prediction costs a lot."],
say: String.raw`Binary cross-entropy is the negative log of the Bernoulli likelihood of the observed label, so minimizing its mean over independent examples is maximum likelihood estimation.`,
num: String.raw`p = 0.9: loss <b>0.1054</b> if y = 1 and <b>2.3026</b> if y = 0. p = 0.5: 0.6931 either way. p = 0.99 with y = 0: <b>4.6052</b>. The HW8 3A logits (−2, 0, 2) with labels (0, 1, 1) give 0.1269, 0.6931 and 0.1269, mean <b>0.3157</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lrpp", "model probability p", 0.01, 0.99, 0.01, 0.9) + btns([[1, "true label y = 1"], [0, "true label y = 0"]], "lryy") + `<div id="lrpo"></div>`;
  let y = 1;
  const u = () => {
    pick(ctl, "lryy", y); const p = +$("lrpp").value; $("lrppv").textContent = f(p, 2);
    const a = ML.axes(60, 16, 580, 230, { xmin: 0, xmax: 1, ymin: 0, ymax: 5, nx: 10, ny: 5, fx: v => v.toFixed(1), fy: v => v, xl: "model probability of class 1, p", yl: "loss (nats)" });
    const ps = Array.from({ length: 199 }, (_, i) => 0.005 + i * 0.005);
    let s = a.s + ML.path(ps.filter(v => -Math.log(v) <= 5).map(v => [a.X(v), a.Y(-Math.log(v))]), C.coral, y ? 2.6 : 1.2, y ? null : "4 3") + ML.path(ps.filter(v => -Math.log(1 - v) <= 5).map(v => [a.X(v), a.Y(-Math.log(1 - v))]), C.blue, y ? 1.2 : 2.6, y ? "4 3" : null);
    const L = y ? -Math.log(p) : -Math.log(1 - p);
    s += `<circle cx="${a.X(p)}" cy="${a.Y(Math.min(5, L))}" r="6" fill="${y ? C.coral : C.blue}"/><line x1="${a.X(p)}" y1="${a.Y(0)}" x2="${a.X(p)}" y2="${a.Y(Math.min(5, L))}" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    s += tx(a.X(0.06), a.Y(4.4), "y = 1: −log p", null, "th") + tx(a.X(0.94), a.Y(4.4), "y = 0: −log(1 − p)", "end", "th");
    fig.innerHTML = svg(290, s);
    $("lrpo").innerHTML = RO([[y ? "likelihood p" : "likelihood 1 − p", f(y ? p : 1 - p, 4)], ["loss −log of it", f(L, 4)], ["prediction at 0.5", p >= 0.5 ? "class 1" : "class 0"], ["verdict", (p >= 0.5 ? 1 : 0) === y ? (L < 0.2 ? "right and confident" : "right but hesitant") : (L > 2 ? "confidently wrong" : "wrong")]]);
  };
  ctl.querySelectorAll("button[data-lryy]").forEach(bt => bt.onclick = () => { y = +bt.dataset.lryy; u(); });
  $("lrpp").oninput = u; u();
}},

{s: "6. Why not squared error", t: "Squared error on a sigmoid gives a cost with flat plateaus",
intu: String.raw`Why not keep the 1/2m squared error of linear regression and just put σ inside? Ng's answer is the shape of J. On six points with one label out of place, both costs are drawn against a single weight w with the bias fixed at 0. Cross-entropy, on the right, is a bowl, convex everywhere. Squared error, on the left, flattens to a plateau near 0.3333 and bends the wrong way, concave, outside the shaded window from −0.28 to 1.26, so it is not convex. On its plateau the slope at w = −4 is −0.00012 while cross-entropy's is −1.66. A confidently wrong example gets almost no push from squared error, because its gradient carries the extra factor p(1 − p).`,
eq: String.raw`\[ \frac{\partial}{\partial z}\,\tfrac12(p - y)^2 = (p - y)\,p(1 - p) \]
\[ \frac{\partial}{\partial z}\,\ell_{\text{BCE}} = p - y \]`,
sym: [["squared error", "(1/2m) Σ (σ(wx) − y)²"], ["cross-entropy", "the mean of card 5's loss"], ["convex", "curves up everywhere, any local minimum is the global one"], ["plateau", "a flat region where gradient descent barely moves"], [String.raw`\(p(1 - p)\)`, "the sigmoid slope, near 0 when the model is confident"]],
how: ["Fix the bias and scan w over a range.", "Compute both costs at every w.", "Look for regions where a cost curves downward.", "Compare the slopes at a badly wrong start such as w = −4.", "Use cross-entropy for classification."],
say: String.raw`Squared error composed with the sigmoid is not convex in the parameters and its gradient vanishes for confidently wrong predictions, while cross-entropy is convex with gradient p − y, so logistic regression uses cross-entropy.`,
num: String.raw`x = (−3, −2, −1, 1, 2, 3), y = (0, 0, 1, 0, 1, 1). Minima: squared error at w = 0.57 (J = 0.0817), cross-entropy at w = 0.73 (J = 0.4794). At w = −4: squared error 0.3333 with slope <b>−0.00012</b>, cross-entropy 6.6728 with slope <b>−1.6604</b>. One example at z = −5 with y = 1: gradient <b>−0.9933</b> for cross-entropy against −0.0066 for squared error.`,
r(fig, ctl) {
  const X = [-3, -2, -1, 1, 2, 3], Y = [0, 0, 1, 0, 1, 1], m = 6;
  const Jm = w => X.reduce((s, x, i) => s + (sig(w * x) - Y[i]) ** 2, 0) / (2 * m), Jb = w => X.reduce((s, x, i) => s + bceZ(w * x, Y[i]), 0) / m;
  const gm = w => X.reduce((s, x, i) => { const p = sig(w * x); return s + (p - Y[i]) * p * (1 - p) * x; }, 0) / m, gb = w => X.reduce((s, x, i) => s + (sig(w * x) - Y[i]) * x, 0) / m;
  ctl.innerHTML = sl("lrw", "weight w", -6, 6, 0.05, -4) + `<div id="lrwo"></div>`;
  const ws = Array.from({ length: 241 }, (_, i) => -6 + i * 0.05);
  const u = () => {
    const w = +$("lrw").value; $("lrwv").textContent = f(w, 2);
    const a = ML.axes(60, 24, 250, 210, { xmin: -6, xmax: 6, ymin: 0, ymax: 0.4, nx: 4, ny: 4, fx: v => v, fy: v => v.toFixed(2), xl: "w", yl: "J", grid: false });
    const b = ML.axes(400, 24, 250, 210, { xmin: -6, xmax: 6, ymin: 0, ymax: 10, nx: 4, ny: 5, fx: v => v, fy: v => v, xl: "w", grid: false });
    let s = `<rect x="${a.X(-0.28)}" y="24" width="${a.X(1.26) - a.X(-0.28)}" height="210" fill="${C.teal}" opacity="0.12"/>` + a.s + b.s;
    s += ML.path(ws.map(v => [a.X(v), a.Y(Jm(v))]), C.coral, 2.2) + ML.path(ws.map(v => [b.X(v), b.Y(Math.min(10, Jb(v)))]), C.teal, 2.2);
    s += `<circle cx="${a.X(w)}" cy="${a.Y(Jm(w))}" r="5.5" fill="${C.coral}"/><circle cx="${b.X(w)}" cy="${b.Y(Math.min(10, Jb(w)))}" r="5.5" fill="${C.teal}"/>`;
    s += tx(185, 16, "squared error on σ(wx)", "middle", "th") + tx(525, 16, "cross-entropy", "middle", "th") + tx(a.X(0.49), 46, "convex window", "middle");
    fig.innerHTML = svg(280, s);
    $("lrwo").innerHTML = RO([["squared error J", f(Jm(w), 4)], ["its slope", Math.abs(gm(w)) < 1e-3 ? gm(w).toExponential(2) : f(gm(w), 4)], ["cross-entropy J", f(Jb(w), 4)], ["its slope", f(gb(w), 4)]]);
  };
  $("lrw").oninput = u; u();
}},

{s: "7. The gradient", t: "The gradient is the error p − y, the same form as linear regression",
intu: String.raw`Chain rule on one example, as in Lesson 13. The loss depends on p, p depends on z, z on w and b. The two local derivatives are dℓ/dp = −y/p + (1 − y)/(1 − p) and dp/dz = p(1 − p). Multiply them and almost everything cancels, leaving dℓ/dz = p − y. Then \(\partial\ell/\partial w_j = (p - y)x_j\) and \(\partial\ell/\partial b = p - y\). Averaged over m examples this is (1/m)Xᵀ(p − y), the same formula as linear regression with h replaced by σ(Xw + b). Ng stresses that the formulas look identical but the models are not, because h is now a sigmoid. Step through a fresh example, then compare with autograd.`,
eq: String.raw`\[ \frac{d\ell}{dz} = \left(-\frac{y}{p} + \frac{1 - y}{1 - p}\right)p(1 - p) = p - y \]
\[ \nabla_{\mathbf{w}} J = \frac{1}{m}X^T(\mathbf{p} - \mathbf{y}), \qquad \frac{\partial J}{\partial b} = \frac{1}{m}\sum_i (p_i - y_i) \]`,
sym: [[String.raw`\(p - y\)`, "the error, positive when the model says too much class 1"], [String.raw`\(x_j\)`, "feature j scales its weight's gradient"], [String.raw`\(X^T\)`, "sums each feature times the errors over the examples"], ["same form", "as linear regression, with p = σ(Xw + b) instead of Xθ"], ["autograd", "PyTorch gives the same numbers, card 12"]],
how: ["Forward: z, then p, then the loss.", "Backward: dℓ/dp, then dp/dz.", "Multiply them to get p − y.", "Multiply by each feature for the weight gradients, the bias gets p − y.", "Average over examples for the batch gradient."],
say: String.raw`For logistic regression with cross-entropy the derivative of the loss with respect to the logit is p minus y, so the weight gradient is the feature vector times that error, averaged over the examples.`,
num: String.raw`x = (1, 3), w = (0.5, 0.2), b = −0.3, y = 0. z = <b>0.8</b>, p = 0.6900, loss 1.1711. dℓ/dp = 3.2255, dp/dz = 0.2139, product <b>0.6900</b> = p − y. ∂ℓ/∂w = (<b>0.6900, 2.0699</b>), ∂ℓ/∂b = 0.6900. PyTorch prints the same.`,
r(fig, ctl) {
  const x = [1, 3], w = [0.5, 0.2], b = -0.3, y = 0, z = dot(w, x) + b, p = sig(z), L = bceZ(z, y), dp = -y / p + (1 - y) / (1 - p), dz = p * (1 - p);
  const N = { x: [70, 50], w: [70, 120], b: [70, 190], z: [260, 120], p: [430, 120], l: [600, 120] };
  const steps = [
    { on: ["x", "w", "b", "z"], v: { z: "z = " + f(z, 4) }, t: "Forward: z = 0.5·1 + 0.2·3 − 0.3 = 0.8" },
    { on: ["z", "p"], v: { z: "z = 0.8", p: "p = " + f(p, 4) }, t: "Forward: p = σ(0.8) = 0.6900" },
    { on: ["p", "l"], v: { z: "z = 0.8", p: "p = 0.6900", l: "ℓ = " + f(L, 4) }, t: "Forward: y = 0, so ℓ = −log(1 − p) = 1.1711" },
    { on: ["l", "p"], v: { p: "dℓ/dp = " + f(dp, 4), l: "ℓ = 1.1711" }, t: "Backward: dℓ/dp = −y/p + (1 − y)/(1 − p) = 1/0.31 = 3.2255" },
    { on: ["p", "z"], v: { z: "dp/dz = " + f(dz, 4), p: "dℓ/dp = 3.2255" }, t: "Backward: dp/dz = p(1 − p) = 0.6900 × 0.3100 = 0.2139" },
    { on: ["z"], v: { z: "dℓ/dz = " + f(dp * dz, 4) }, t: "Multiply: 3.2255 × 0.2139 = 0.6900, exactly p − y" },
    { on: ["w", "b", "z"], v: { z: "dℓ/dz = 0.6900", w: "∂ℓ/∂w = (" + f(p * x[0], 4) + ", " + f(p * x[1], 4) + ")", b: "∂ℓ/∂b = " + f(p, 4) }, t: "Weights get (p − y) times their feature, the bias gets p − y" },
    { on: ["w", "b"], v: { w: "(0.6900, 2.0699)", b: "0.6900" }, t: "Autograd agrees", code: true }
  ];
  const lab = { x: "x = (1, 3)", w: "w = (0.5, 0.2)", b: "b = −0.3", z: "z", p: "p", l: "ℓ" };
  const draw = k => {
    const st = steps[k]; let s = "";
    [["x", "z"], ["w", "z"], ["b", "z"], ["z", "p"], ["p", "l"]].forEach(([a, c]) => { const back = k >= 3 && k <= 6; s += back ? arrow(N[c][0] - 52, N[c][1] + (a === "x" ? -10 : a === "b" ? 10 : 0), N[a][0] + 62, N[a][1], C.coral, 1.4, "5 3") : arrow(N[a][0] + 62, N[a][1], N[c][0] - 52, N[c][1] + (a === "x" ? -10 : a === "b" ? 10 : 0), "var(--p)", 1.3); });
    Object.entries(N).forEach(([k2, [cx, cy]]) => { const on = st.on.includes(k2), wd = k2 === "x" || k2 === "w" || k2 === "b" ? 124 : 100; s += `<g class="${on ? "c-teal" : "c-gray"}"><rect x="${cx - wd / 2}" y="${cy - 20}" width="${wd}" height="40" rx="8" stroke-width="${on ? 1.6 : 0.6}"/></g>` + tx(cx, cy + 5, lab[k2], "middle", "th"); if (st.v[k2]) s += tx(cx, cy + 40, st.v[k2], "middle", "t"); });
    s += tx(340, 250, st.t, "middle", "th") + tx(70, 24, "y = 0", "middle");
    fig.innerHTML = svg(270, s) + (st.code ? ML.code(["x = torch.tensor([1.0, 3.0])", "w = torch.tensor([0.5, 0.2], requires_grad=True)", "b = torch.tensor(-0.3, requires_grad=True)", "z = w @ x + b", "loss = F.binary_cross_entropy_with_logits(z, torch.tensor(0.0))", "loss.backward()", "print(round(z.item(), 4), round(torch.sigmoid(z).item(), 4), round(loss.item(), 4))", "print(w.grad, b.grad)"], 5) + ML.term(["0.8 0.69 1.1711", "tensor([0.6900, 2.0699]) tensor(0.6900)"]) : "");
  };
  ML.stepper(ctl, steps.length, draw, ["z", "p", "loss", "dℓ/dp", "dp/dz", "p − y", "weights and bias", "autograd"]);
}},

{s: "8. Gradient descent", t: "Gradient descent on a two-feature dataset",
intu: String.raw`Sixty fresh points, two overlapping classes, features already on similar scales. Start at w = 0 and b = 0, where every probability is 0.5 and J = log 2 = 0.6931. Each step moves the parameters by α times the averaged error times the features. Drag the iteration slider and watch the boundary turn into place while the cost falls. Because cross-entropy is convex, every stable α reaches the same minimum, 0.3392, only the speed differs. At α = 10 the cost goes up on one step, the sign of a step that is too large. The fitted weights read as odds ratios: one unit more of x₁ multiplies the odds of class 1 by \(e^{1.3647} = 3.91\).`,
eq: String.raw`\[ \mathbf{w} \leftarrow \mathbf{w} - \frac{\alpha}{m}X^T\left(\sigma(X\mathbf{w} + b) - \mathbf{y}\right) \]
\[ b \leftarrow b - \frac{\alpha}{m}\sum_i (p_i - y_i), \qquad \text{odds ratio}_j = e^{w_j} \]`,
sym: [[String.raw`\(\alpha\)`, "learning rate"], ["J at zero", "log 2 = 0.6931, every p is 0.5"], ["convex", "one minimum, every stable α finds it"], ["accuracy", "fraction of training points on the right side"], [String.raw`\(e^{w_j}\)`, "factor on the odds per unit of feature j"]],
how: ["Initialize w and b at zero.", "Each iteration: p = σ(Xw + b), gradient, simultaneous update.", "Record J after every update.", "Stop when J stops falling, and check the gradient is near zero.", "Report the weights, the cost and the accuracy at threshold 0.5."],
say: String.raw`Batch gradient descent on the convex logistic cost moves the boundary toward the maximum likelihood solution, and every learning rate below the stability limit reaches the same minimum.`,
num: String.raw`J₀ = 0.6931, first gradient (−0.6113, −0.1701) and 0 for the bias. At α = 0.5: J₁ = 0.5272, J₁₀ = 0.3511, J₃₀₀ = <b>0.3392</b>, w = (<b>1.3647, 0.6361</b>), b = −0.0347, training accuracy <b>52 of 60</b>. Odds ratios 3.91 and 1.89.`,
r(fig, ctl) {
  const F = D8.map(r => [r[0], r[1]]), Y = D8.map(r => r[2]), cache = {};
  ctl.innerHTML = btns([[0.1, "α = 0.1"], [0.5, "α = 0.5"], [2, "α = 2"], [10, "α = 10"]], "lral") + sl("lrit", "iteration", 0, 300, 1, 10) + `<div id="lrgo"></div>`;
  let al = 0.5;
  const u = () => {
    pick(ctl, "lral", al); const k = +$("lrit").value; $("lritv").textContent = k;
    const R = cache[al] || (cache[al] = fitLog(F, Y, al, 300, 0, true)), [w, b] = R.P[k];
    const box = { xmin: -4, xmax: 4, ymin: -2, ymax: 3, nx: 8, ny: 5, fx: v => v, fy: v => v, xl: "x₁", yl: "x₂", grid: false };
    const a = ML.axes(50, 14, 300, 240, box);
    let s = shade((x, y) => sig(w[0] * x + w[1] * y + b), a, box, 30, 0.5) + a.s;
    if (k) s += zeroSet((x, y) => w[0] * x + w[1] * y + b, a, box, 40, "var(--t)", 2.4);
    D8.forEach(r => { s += dot1(a, r[0], r[1], r[2]); });
    const c = ML.axes(430, 14, 220, 200, { xmin: 0, xmax: Math.sqrt(300), ymin: 0.3, ymax: 0.7, nx: 4, ny: 4, fx: v => Math.round(v * v), fy: v => v.toFixed(2), xl: "iteration, square-root scale", yl: "J", grid: false });
    s += c.s + ML.path(R.H.map((h, i) => [c.X(Math.sqrt(i)), c.Y(Math.max(0.3, Math.min(0.7, h)))]), C.teal, 1.8) + `<circle cx="${c.X(Math.sqrt(k))}" cy="${c.Y(Math.max(0.3, Math.min(0.7, R.H[k])))}" r="5" fill="${C.coral}"/>` + `<line x1="${c.X(0)}" y1="${c.Y(0.33921)}" x2="${c.X(Math.sqrt(300))}" y2="${c.Y(0.33921)}" stroke="var(--p)" stroke-dasharray="3 4"/>` + tx(c.X(Math.sqrt(300)) - 4, c.Y(0.33921) - 6, "minimum 0.3392", "end");
    s += legend(440, 272);
    let up = 0; for (let i = 1; i <= 300; i++) if (R.H[i] > R.H[i - 1] + 1e-12) up++;
    const acc = D8.filter(r => ((w[0] * r[0] + w[1] * r[1] + b) >= 0) === (r[2] === 1)).length;
    fig.innerHTML = svg(290, s);
    $("lrgo").innerHTML = RO([["w", `(${f(w[0], 4)}, ${f(w[1], 4)})`], ["b", f(b, 4)], ["J", f(R.H[k], 4)], ["accuracy at 0.5", `${acc} of 60`], ["odds ratios", `${f(Math.exp(w[0]), 2)}, ${f(Math.exp(w[1]), 2)}`], ["steps where J rose", up]]);
  };
  ctl.querySelectorAll("button[data-lral]").forEach(bt => bt.onclick = () => { al = +bt.dataset.lral; u(); });
  $("lrit").oninput = u; u();
}},

{s: "9. Separable data", t: "Separable data sends the weights to infinity, regularization stops them",
intu: String.raw`Eight points on a line with every negative left of every positive. Any steep enough sigmoid classifies them all, and a steeper one always has a lower loss, so gradient descent never settles: w is 5.0 after 100 steps, 10.0 after 1,000, 16.4 after 10,000 and 22.9 after 100,000, growing like a logarithm. The probabilities become exactly 0 and 1 in float64 and the naive loss formula returns nan, because it multiplies 0 by log 0. Ng's fix is the regularized cost, which adds λ/2m times the squared weights and leaves the bias alone. With λ = 0.1 the weight stops at 3.23, with λ = 1 at 1.32, and the probabilities stay honest.`,
eq: String.raw`\[ J_\lambda(\mathbf{w}, b) = J(\mathbf{w}, b) + \frac{\lambda}{2m}\sum_j w_j^2 \]
\[ w_j \leftarrow w_j - \alpha\left[\frac{1}{m}\sum_i (p_i - y_i)x_{ij} + \frac{\lambda}{m}w_j\right] \]`,
sym: [["separable", "a line puts every class 1 point on one side"], [String.raw`\(\lambda\)`, "regularization strength, chosen on validation"], ["bias", "not penalized, as in Ng's course"], ["stable loss", String.raw`\(\max(z, 0) - zy + \log(1 + e^{-|z|})\), card 11`], ["naive loss", "−y log p − (1 − y) log(1 − p) on rounded p"]],
how: ["Check whether the training classes are separable.", "Run gradient descent and watch the weight norm, not only the loss.", "Add λ/2m times the squared weights to the cost.", "Add λw/m to each weight gradient, never to the bias.", "Pick λ on validation data as in Lesson 19."],
say: String.raw`On linearly separable data the unregularized logistic loss has no finite minimizer, so the weights grow without bound, and an L2 penalty restores a finite solution with calibrated probabilities.`,
num: String.raw`α = 1, λ = 0: w = 4.98, 10.05, 16.37, 22.93 after 10², 10³, 10⁴, 10⁵ steps, stable loss 0.0453, 0.0074, 0.00081, <b>0.000082</b>, naive loss <b>nan</b> at 10⁵. λ = 0.1: w = <b>3.2277</b>, b = −0.2176, regularized cost 0.1571. λ = 1: w = 1.3192. The point nearest the boundary gets probability 0.9997 for its label at 10⁵ steps with λ = 0, 0.7453 with λ = 0.1 and 0.6006 with λ = 1.`,
note: String.raw`HW8 3C trained for 800 epochs on noisy, overlapping data, so the weights settled. If your project's classes separate, watch the weight norm or use weight_decay.`,
r(fig, ctl) {
  const X = [-2.0, -1.2, -0.7, -0.3, 0.4, 0.9, 1.5, 2.2], Y = [0, 0, 0, 0, 1, 1, 1, 1], CK = [1, 10, 100, 1000, 10000, 100000], cache = {};
  const run = lam => { if (cache[lam]) return cache[lam]; let w = 0, b = 0; const out = {}; for (let k = 1; k <= 100000; k++) { let gw = 0, gb = 0; for (let i = 0; i < 8; i++) { const e = sig(w * X[i] + b) - Y[i]; gw += e * X[i]; gb += e; } w -= gw / 8 + lam / 8 * w; b -= gb / 8; if (CK.includes(k)) { let st = 0, nv = 0, pm = 1; for (let i = 0; i < 8; i++) { const z = w * X[i] + b, p = sig(z); st += bceZ(z, Y[i]); nv += -(Y[i] * Math.log(p) + (1 - Y[i]) * Math.log(1 - p)); pm = Math.min(pm, Y[i] ? p : 1 - p); } out[k] = { w, b, st: st / 8, nv: nv / 8, reg: st / 8 + lam / 16 * w * w, pm }; } } return (cache[lam] = out); };
  ctl.innerHTML = btns([[0, "λ = 0"], [0.1, "λ = 0.1"], [1, "λ = 1"]], "lrlm") + btns(CK.map(k => [k, k >= 1000 ? "10" + sup(Math.log10(k)) : String(k)]), "lrck") + `<div id="lrso"></div>`;
  let lam = 0, ck = 1000;
  const fm = v => isNaN(v) ? "nan" : Math.abs(v) < 1e-3 ? v.toExponential(2) : f(v, 4);
  const u = () => {
    pick(ctl, "lrlm", lam); pick(ctl, "lrck", ck);
    const O = run(lam), st = O[ck];
    const a = ML.axes(60, 16, 330, 220, { xmin: -3, xmax: 3, ymin: 0, ymax: 1, nx: 6, ny: 4, fx: v => v, fy: v => v.toFixed(2), xl: "x", yl: "p", grid: false });
    let s = a.s;
    CK.filter(k => k <= ck).forEach(k => { const q = O[k]; s += ML.path(Array.from({ length: 241 }, (_, i) => { const x = -3 + i * 0.025; return [a.X(x), a.Y(sig(q.w * x + q.b))]; }), k === ck ? C.teal : C.gray, k === ck ? 2.4 : 0.9); });
    X.forEach((x, i) => { s += `<circle cx="${a.X(x)}" cy="${a.Y(Y[i])}" r="5" fill="${Y[i] ? C.coral : C.blue}"/>`; });
    s += tx(420, 30, "λ = " + lam + ", α = 1", null, "th");
    let row = 54; s += tx(420, row, "steps") + tx(480, row, "w") + tx(540, row, "stable J") + tx(615, row, "naive J");
    CK.forEach(k => { row += 22; const q = O[k]; s += `<text class="${k === ck ? "th" : "ts"}" x="420" y="${row}">${k >= 1000 ? "10" + sup(Math.log10(k)) : k}</text>` + tx(480, row, f(q.w, 2)) + tx(540, row, fm(q.st)) + tx(615, row, fm(q.nv)); });
    s += tx(420, row + 30, "gray: earlier checkpoints");
    fig.innerHTML = svg(280, s);
    $("lrso").innerHTML = RO([["w", f(st.w, 4)], ["b", f(st.b, 4)], ["boundary at x", f(-st.b / st.w, 4)], ["regularized cost", fm(st.reg)], ["smallest probability of the true label", fm(st.pm)]]);
  };
  ctl.querySelectorAll("button[data-lrlm]").forEach(bt => bt.onclick = () => { lam = +bt.dataset.lrlm; u(); });
  ctl.querySelectorAll("button[data-lrck]").forEach(bt => bt.onclick = () => { ck = +bt.dataset.lrck; u(); });
  u();
}},

{s: "10. Curved boundaries", t: "A ring needs new features, not a different threshold",
intu: String.raw`HW8 3E asks why a sigmoid cannot separate a ring-shaped class. Here 30 parts sit inside radius 1 and 40 on a ring between 1.5 and 2.4. With the raw features x₁ and x₂ every boundary is a line, and after 300 steps the model is worse than guessing the majority, 0.457 against 0.571, with a loss of 0.6753, barely below the constant model's 0.6829. Add x₁² and x₂² as features to the same logistic regression and the boundary closes into an ellipse that separates every point. The model is still linear in its parameters, which keeps the cost convex. This is Ng's feature mapping, and the idea a hidden layer automates in Lesson 32.`,
eq: String.raw`\[ z = w_1x_1 + w_2x_2 + w_3x_1^2 + w_4x_2^2 + b \]`,
sym: [["feature map", "new inputs built from the old ones, here squares"], ["linear in parameters", "z is still a weighted sum, so J stays convex"], ["majority baseline", "always predict the larger class"], ["constant model", "p = 30/70 for everyone, loss 0.6829"], ["separable again", "card 9 applies, so add λ in practice"]],
how: ["Plot the training data before choosing a model.", "If the classes curve around each other, add polynomial features.", "Standardize the new features with training statistics, Lesson 17.", "Fit the same logistic regression on the extended inputs.", "Compare with the majority baseline and the constant model."],
say: String.raw`Logistic regression draws a linear boundary in whatever feature space it is given, so a curved boundary in the original inputs requires nonlinear features such as squares.`,
num: String.raw`α = 0.5, 300 steps. Raw features: accuracy <b>0.457</b>, loss 0.6753. Squared features: accuracy <b>1.000</b>, loss 0.0259, w = (0.438, 0.579, −2.443, −2.788), b = 4.621, boundary radii about 1.38 and 1.29. Majority baseline 40 of 70 = 0.571.`,
r(fig, ctl) {
  const Y = RING.map(r => r[2]), FS = [RING.map(r => [r[0], r[1]]), RING.map(r => [r[0], r[1], r[0] * r[0], r[1] * r[1]])], R = [];
  ctl.innerHTML = btns([[0, "features x₁, x₂"], [1, "features x₁, x₂, x₁², x₂²"]], "lrrf") + `<div id="lrfo"></div>`;
  let q = 0;
  const u = () => {
    pick(ctl, "lrrf", q); const M = R[q] || (R[q] = fitLog(FS[q], Y, 0.5, 300)), w = M.w, b = M.b;
    const zf = (x, y) => w[0] * x + w[1] * y + b + (q ? w[2] * x * x + w[3] * y * y : 0);
    const box = { xmin: -3, xmax: 3, ymin: -3, ymax: 3, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "x₁", yl: "x₂", grid: false };
    const a = ML.axes(60, 12, 280, 280, box);
    let s = shade((x, y) => sig(zf(x, y)), a, box, 36, 0.5) + a.s + zeroSet(zf, a, box, 60, "var(--t)", 2.4);
    RING.forEach(r => { s += dot1(a, r[0], r[1], r[2]); });
    const acc = RING.filter(r => (zf(r[0], r[1]) >= 0) === (r[2] === 1)).length;
    s += tx(380, 40, q ? "squared features" : "raw features", null, "th") + tx(380, 64, `accuracy ${acc} of 70 = ${f(acc / 70, 3)}`, null, "t") + tx(380, 86, `loss ${f(M.J, 4)}`, null, "t") + tx(380, 116, "majority baseline 0.571") + tx(380, 136, "constant model loss 0.6829") + legend(388, 170);
    s += tx(380, 210, q ? "boundary: an ellipse in x₁, x₂," : "boundary: a line, the best one", null) + tx(380, 228, q ? "a plane in the four features" : "still cuts through both classes", null);
    fig.innerHTML = svg(330, s);
    $("lrfo").innerHTML = RO([["w", "(" + w.map(v => f(v, 3)).join(", ") + ")"], ["b", f(b, 3)]]);
  };
  ctl.querySelectorAll("button[data-lrrf]").forEach(bt => bt.onclick = () => { q = +bt.dataset.lrrf; u(); });
  u();
}},

{s: "11. Stable logits", t: "Why PyTorch wants raw logits: BCEWithLogitsLoss",
intu: String.raw`In float32, σ(20) is stored as exactly 1 and σ(−100) as exactly 0. Then log p or log(1 − p) is −inf. nn.BCELoss guards against this by clamping each log at −100, so the loss reads 100, but its gradient through σ is 0, and a confidently wrong model stops learning. nn.BCEWithLogitsLoss never forms p. It computes \(\max(z, 0) - zy + \log(1 + e^{-|z|})\), which is exact for any z, and its gradient σ(z) − y stays −1 for a hopeless positive. Pick a score and a label and read the table. Every value comes from PyTorch.`,
eq: String.raw`\[ \ell(z, y) = \max(z, 0) - zy + \log\left(1 + e^{-|z|}\right) \]
\[ \frac{\partial \ell}{\partial z} = \sigma(z) - y \]`,
sym: [["logit loss", "BCEWithLogitsLoss, takes raw z"], ["probability loss", "BCELoss, takes p and clamps each log at −100"], ["float32", "about 7 significant digits, 1 − 2e-9 rounds to 1"], ["naive formula", "nan when 0 multiplies log 0"], ["gradient", "what actually trains the model"]],
how: ["Let the model output raw logits.", "Pass them to BCEWithLogitsLoss.", "Apply torch.sigmoid only for reporting probabilities and decisions.", "Never apply a sigmoid before BCEWithLogitsLoss, card 12.", "If you must use BCELoss, know that its gradient dies for extreme scores."],
say: String.raw`BCEWithLogitsLoss computes binary cross-entropy directly from the logit with the log-sum-exp trick, so it stays finite and keeps the gradient sigma of z minus y for any score, unlike a sigmoid followed by BCELoss.`,
num: String.raw`z = −100, y = 1: p = 0, naive loss inf, BCELoss <b>100</b> with gradient <b>0</b>, BCEWithLogitsLoss 100 with gradient <b>−1</b>. z = −80, y = 1: the BCELoss gradient is −1.8e-23. z = 20, y = 0: BCELoss 100, the logit loss 20.`,
r(fig, ctl) {
  const ZS = [-100, -80, -20, -5, 0, 5, 20, 40];
  ctl.innerHTML = btns(ZS.map(z => [z, "z = " + mn(z)]), "lrsz") + btns([[1, "y = 1"], [0, "y = 0"]], "lrsy") + `<div id="lrst"></div>`;
  let z = -100, y = 1;
  const u = () => {
    pick(ctl, "lrsz", z); pick(ctl, "lrsy", y);
    const T = STAB[z + "," + y];
    const a = ML.axes(70, 16, 570, 200, { xmin: -100, xmax: 40, ymin: 0, ymax: 120, nx: 7, ny: 6, fx: v => mn(v), fy: v => v, xl: "logit z", yl: "loss for y = " + y, grid: false });
    let s = a.s + ML.path(Array.from({ length: 281 }, (_, i) => { const v = -100 + i * 0.5; return [a.X(v), a.Y(Math.min(120, bceZ(v, y)))]; }), C.teal, 2.2);
    s += `<line x1="${a.X(-100)}" y1="${a.Y(100)}" x2="${a.X(40)}" y2="${a.Y(100)}" stroke="${C.coral}" stroke-dasharray="4 3" stroke-width="1"/>` + tx(a.X(38), a.Y(100) - 6, "BCELoss clamp at 100", "end");
    ZS.forEach(v => { const r = STAB[v + "," + y]; s += `<circle cx="${a.X(v)}" cy="${a.Y(+r[2])}" r="${v === z ? 7 : 4}" fill="${C.coral}"${v === z ? ` stroke="var(--t)" stroke-width="1.5"` : ""}/>`; });
    s += `<line x1="90" y1="262" x2="114" y2="262" stroke="${C.teal}" stroke-width="2.2"/>` + tx(120, 266, "exact loss, which is what BCEWithLogitsLoss returns") + `<circle cx="452" cy="262" r="4" fill="${C.coral}"/>` + tx(460, 266, "nn.BCELoss values");
    fig.innerHTML = svg(280, s);
    $("lrst").innerHTML = RO([["σ(z) in float32", T[0]], ["naive formula", T[1]], ["BCELoss", T[2]], ["BCELoss dℓ/dz", T[3]], ["BCEWithLogitsLoss", T[4]], ["BCEWithLogitsLoss dℓ/dz", T[5]]]);
  };
  ctl.querySelectorAll("button[data-lrsz]").forEach(bt => bt.onclick = () => { z = +bt.dataset.lrsz; u(); });
  ctl.querySelectorAll("button[data-lrsy]").forEach(bt => bt.onclick = () => { y = +bt.dataset.lrsy; u(); });
  u();
}},

{s: "12. In PyTorch", t: "The binary contract in PyTorch: (B, 1) logits, (B, 1) float targets",
intu: String.raw`HW9's data contract for a binary task: features (B, d) float32, the model returns raw logits of shape (B, 1), the target is float32 of shape (B, 1) holding 0 and 1, and the loss is BCEWithLogitsLoss. The model is one nn.Linear(d, 1) with no sigmoid inside. Apply σ only when you need probabilities or decisions. Pick a case to see what PyTorch says. Four mistakes raise an error you can read. The double sigmoid runs silently with a wrong loss, which is worse, and HW8 3E asks you to spot it.`,
eq: String.raw`\[ \text{logits } (B, 1) \text{ float32} \ \longleftrightarrow \ \text{target } (B, 1) \text{ float32} \]`,
sym: [["nn.Linear(d, 1)", "the whole logistic model, d weights and one bias"], ["raw logits", "the model output, no sigmoid"], ["target", "float32, shape (B, 1), values 0.0 and 1.0"], ["torch.sigmoid", "only for probabilities and decisions"], ["squeeze", "can erase the batch axis when B = 1"]],
how: ["Define the model as one nn.Linear(d, 1).", "Build float32 targets and give them shape (B, 1) with reshape(-1, 1).", "Pass raw logits and targets to BCEWithLogitsLoss.", "Assert logits.shape == targets.shape before the loss.", "Use reshape(-1) or squeeze(1), never a bare squeeze."],
say: String.raw`A binary classifier in PyTorch returns raw logits of shape (B, 1), takes float targets of the same shape, and is trained with BCEWithLogitsLoss, with the sigmoid applied only for reporting.`,
num: String.raw`Weight (0.5, −1) and bias 0.25 on four rows: logits (−1.25, 1.25, 1.25, −1.25), loss <b>0.2519</b>, gradients (−0.1114, 0.2227) for the weight and 7.5e-09, zero up to float32 rounding, for the bias. Sigmoid applied twice: <b>0.5944</b>, wrong and silent.`,
note: String.raw`HW9's tensor_loader builds binary targets with reshape(-1, 1) and float32 for exactly this reason. Lesson 30 uses CrossEntropyLoss with (B, C) logits and (B,) long targets instead.`,
r(fig, ctl) {
  const head = ["model = nn.Linear(2, 1)   # weight (0.5, -1), bias 0.25", "X = torch.tensor([[1., 2.], [0., -1.], [2., 0.], [-1., 1.]])", "y = torch.tensor([[0.], [1.], [1.], [0.]])   # (4, 1) float32", "loss_fn = nn.BCEWithLogitsLoss()"];
  const CASES = {
    ok: ["Correct", ["logits = model(X)", "print(logits.shape, logits.dtype)", "loss = loss_fn(logits, y)", "loss.backward()", "print(round(loss.item(), 4))", "print(model.weight.grad, model.bias.grad)"], ["torch.Size([4, 1]) torch.float32", "0.2519", "tensor([[-0.1114,  0.2227]]) tensor([7.4506e-09])"], "Shapes match, the loss uses raw logits. The bias gradient is the mean of p − y, zero here up to float32 rounding."],
    flat: ["Target (B,)", ["loss = loss_fn(model(X), y.reshape(-1))"], ["ValueError: Target size (torch.Size([4])) must be the same as", "input size (torch.Size([4, 1]))"], "BCEWithLogitsLoss refuses to broadcast. Reshape the target to (B, 1). MSELoss would only warn, Lesson 25."],
    long: ["Target long", ["loss = loss_fn(model(X), y.long())"], ["RuntimeError: result type Float can't be cast to the desired", "output type Long"], "Binary targets are float32 0.0 and 1.0. Long class indices are for CrossEntropyLoss."],
    sq: ["Bare squeeze, B = 1", ["logits = model(X[:1]).squeeze()   # shape () not (1, 1)", "loss = loss_fn(logits, y[:1])"], ["ValueError: Target size (torch.Size([1, 1])) must be the same", "as input size (torch.Size([]))"], "A bare squeeze removes every axis of size 1, including the batch axis when the last batch has one row. HW9 1C tests exactly this."],
    bce: ["BCELoss on logits", ["loss = nn.BCELoss()(model(X), y)"], ["RuntimeError: all elements of input should be between 0 and 1"], "BCELoss expects probabilities. With logits use BCEWithLogitsLoss."],
    dbl: ["Sigmoid twice", ["probs = torch.sigmoid(model(X))", "loss = loss_fn(probs, y)   # sigmoid applied again inside", "print(round(loss.item(), 4))"], ["0.5944"], "No error, wrong number. The loss sees σ(σ(z)), always between 0.5 and 0.731, so a positive can never cost less than 0.3133. HW8 3E Fragment A."],
    ce: ["CrossEntropyLoss, one output", ["loss = nn.CrossEntropyLoss()(model(X), y.reshape(-1).long())"], ["IndexError: Target 1 is out of bounds."], "With one output column the only valid class index is 0. Two classes need either one logit with BCEWithLogitsLoss or two logits with CrossEntropyLoss, Lesson 30."]
  };
  ctl.innerHTML = btns(Object.entries(CASES).map(([k, v]) => [k, v[0]]), "lrcs");
  let cs = "ok";
  const u = () => {
    pick(ctl, "lrcs", cs); const c = CASES[cs];
    let s = "";
    [["features", "(B, 2)", "float32"], ["logits", cs === "sq" ? "( )" : "(B, 1)", "float32"], ["target", cs === "flat" ? "(B,)" : cs === "ce" ? "(B,)" : "(B, 1)", cs === "long" || cs === "ce" ? "int64" : "float32"]].forEach(([k, sh, dt], i) => {
      const bad = (i === 1 && cs === "sq") || (i === 2 && ["flat", "long", "ce"].includes(cs));
      s += `<g class="${bad ? "c-coral" : "c-teal"}"><rect x="${30 + i * 220}" y="12" width="180" height="50" rx="8" stroke-width="1"/></g>` + tx(120 + i * 220, 32, (i === 1 ? "model → " : "") + k + " " + sh, "middle", "th") + tx(120 + i * 220, 52, dt, "middle");
      if (i < 2) s += arrow(212 + i * 220, 37, 246 + i * 220, 37, "var(--p)", 1.3, null, i === 1);
    });
    s += tx(340, 84, cs === "dbl" ? "a sigmoid before the loss: the loss applies a second one" : cs === "bce" ? "BCELoss expects probabilities, not logits" : "the loss compares logits with targets row by row", "middle");
    fig.innerHTML = svg(96, s) + ML.code(head.concat(c[1]), head.length + c[1].length - 1) + ML.term(c[2]) + `<p class="note">${c[3]}</p>`;
  };
  ctl.querySelectorAll("button[data-lrcs]").forEach(bt => bt.onclick = () => { cs = bt.dataset.lrcs; u(); });
  u();
}},

{s: "13. With the agent", t: "Do it with the agent: logistic regression you can test",
intu: String.raw`The lesson as code: a NumPy logistic regression with a stable loss, the gradient p − y, batch gradient descent with an optional L2 penalty, and tests that pin the numbers from these cards. A sigmoid applied twice, a missing 1/m, a penalized bias, a naive loss that turns nan, or a threshold written with > instead of ≥ each fails a test with a value you can check by hand.`,
eq: String.raw`\[ \texttt{sigmoid} \to \texttt{bce\_with\_logits} \to \texttt{gradients} \to \texttt{fit} \to \texttt{predict} \]`,
sym: [["sigmoid", "no overflow warning for z = ±1000"], ["bce with logits", "max(z, 0) − zy + log1p(exp(−|z|))"], ["gradients", "(1/m)Xᵀ(p − y) plus (λ/m)w, bias unpenalized"], ["fit", "batch gradient descent from zeros, cost history"], ["tests", "cards 3, 7, 9 and 11 numbers plus a finite difference check"]],
how: ["Paste the command.", "Read the loss: is it computed from z, not from a rounded p?", "Read the gradient: is the bias left out of the penalty?", "Run the tests. The expected values come from the cards.", "Commit the module with its tests."],
say: String.raw`A logistic regression module computes its loss from logits, has a gradient checked against finite differences and against PyTorch, and is tested against values computed by hand.`,
num: String.raw`Tests expect loss <b>0.263282</b> for HW9 1A, gradient <b>(0.689974, 2.069923)</b> and 0.689974 for card 7, loss <b>1000</b> at z = −1000 with y = 1, and w close to <b>3.2277</b> on card 9's data with λ = 0.1.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/logreg.py using numpy only. Functions: sigmoid(z) that gives no overflow warning for z = ±1000. bce_with_logits(z, y) returning the mean of max(z, 0) - z*y + log1p(exp(-|z|)). gradients(X, y, w, b, lam=0.0) returning (grad_w, grad_b) of that mean loss plus lam/(2m)*sum(w**2), with the bias not penalized. fit(X, y, lr, n_steps, lam=0.0) running batch gradient descent from zeros and returning w, b and a cost history of length n_steps + 1. predict_proba(X, w, b) and predict(X, w, b, threshold=0.5) using p >= threshold. Create tests/test_logreg.py with pytest: x = (2, -1), w = (0.4, -0.6), b = -0.2, y = 1 gives loss close to 0.263282. x = (1, 3), w = (0.5, 0.2), b = -0.3, y = 0 gives gradient close to (0.689974, 2.069923) and 0.689974. gradients match a central finite difference to 1e-6 on random data with lam = 0.5. bce_with_logits is finite at z = -1000 and 1000 and equals 1000 for z = -1000, y = 1. it matches torch.nn.BCEWithLogitsLoss on 20 random logits to 1e-6. on x = [-2, -1.2, -0.7, -0.3, 0.4, 0.9, 1.5, 2.2] with labels four 0 then four 1, fit with lr 1, 1000 steps and lam 0.1 gives w close to 3.2277. predict returns 1 when p is exactly 0.5. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".......                                                  [100%]", "7 passed"],
    files: [["src/logreg.py", "sigmoid, bce_with_logits, gradients, fit, predict_proba, predict"], ["tests/test_logreg.py", "seven tests with the values from cards 3, 7, 9 and 11"]],
    checks: ["the loss is computed from logits with log1p, never from a rounded probability", "the gradient divides by m and leaves the bias out of the penalty", "the finite difference test uses a nonzero lam, so the penalty term is checked too", "predict uses >= so a tie predicts class 1, as in HW8 and HW9", "the torch comparison passes raw logits to BCEWithLogitsLoss, not sigmoid outputs"]
  });
}},

{s: "14. Test", t: "Lesson 29 test: logistic regression",
intu: String.raw`Twelve questions on the sigmoid and the logit, one example by hand, the decision boundary, the loss and its likelihood, why squared error is not used, the gradient, separable data, and the PyTorch contract. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to softmax and multiclass.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A model gives probability 0.8 for class 1. Its logit is", o: ["0.8", "4", "log 4 = 1.3863", "1.25"], a: 2, why: "z = log(p/(1 − p)) = log(0.8/0.2) = log 4. The odds are 4. Card 2." },
    { q: "x = (1, 2), w = (0.5, −1), b = 0.5. The probability of class 1 and the class at τ = 0.5 are", o: ["0.7311, class 1", "0.2689, class 0", "0.5, class 1", "0.3775, class 0"], a: 1, why: "z = 0.5 − 2 + 0.5 = −1 and σ(−1) = 0.2689, below 0.5. Card 3." },
    { q: "The true label is 0 and the model says p = 0.8. The cross-entropy loss in nats is", o: ["0.2231", "0.8", "1.6094", "0.6931"], a: 2, why: "For y = 0 the loss is −log(1 − p) = −log 0.2 = 1.6094. Card 5." },
    { q: "One example with x = (2, −1), y = 1 and p = 0.7. The gradient of its loss with respect to w is", o: ["(−0.6, 0.3)", "(0.6, −0.3)", "(−0.3, 0.3)", "(1.4, −0.7)"], a: 0, why: "(p − y)x = (−0.3)(2, −1) = (−0.6, 0.3). Card 7." },
    { q: "w = (2, −1) and b = 4. At threshold 0.5 the decision boundary is", o: ["x₂ = 2x₁ − 4", "x₂ = −2x₁ + 4", "x₂ = 2x₁ + 4", "2x₁ + x₂ = 4"], a: 2, why: "Set z = 2x₁ − x₂ + 4 = 0, so x₂ = 2x₁ + 4. Card 4." },
    { q: "You raise the threshold from 0.5 to 0.8. In terms of the logit, the model now predicts class 1 when", o: ["z ≥ 0.8", "z ≥ log 4 = 1.3863", "z ≥ 0.3", "z ≥ −1.3863"], a: 1, why: "p ≥ τ is z ≥ log(τ/(1 − τ)) = log 4. The boundary moves parallel, it does not bend. Card 4." },
    { q: "Why does logistic regression not use the squared error (1/2m)Σ(σ(z) − y)²?", o: ["It cannot be differentiated", "It is not convex in the parameters and its gradient vanishes for confident mistakes", "It gives the same model, only slower", "It needs labels other than 0 and 1"], a: 1, why: "The extra factor p(1 − p) flattens the cost and kills the push on confidently wrong examples. Card 6." },
    { q: "A training set is perfectly separable and you run gradient descent with no regularization. What happens?", o: ["It converges to a finite w with zero loss", "The weights keep growing and the loss approaches but never reaches 0", "It diverges to a loss of infinity", "The bias goes to zero"], a: 1, why: "A steeper sigmoid always lowers the loss, so the norm grows like a logarithm of the step count. Add λ/2m Σ w². Card 9." },
    { q: "Which change lets logistic regression separate a class that sits inside a circle?", o: ["A threshold of 0.3", "Adding x₁² and x₂² as features", "Training for more epochs", "Using sigmoid twice"], a: 1, why: "With linear features every boundary is a line. Squared features make it an ellipse while the model stays linear in its parameters. Card 10." },
    { q: "<code>loss = nn.BCEWithLogitsLoss()(torch.sigmoid(model(X)), y)</code> runs without an error. What is wrong?", o: ["Nothing, it is the recommended form", "The sigmoid is applied twice, so the loss sees values between 0.5 and 0.731", "The target must be long", "BCEWithLogitsLoss does not accept (B, 1) tensors"], a: 1, why: "BCEWithLogitsLoss applies the sigmoid itself. Pass raw logits. Cards 11 and 12." },
    { q: "Logits of shape (32, 1) and a target of shape (32,) passed to BCEWithLogitsLoss give", o: ["a (32, 32) loss by broadcasting", "ValueError: Target size must be the same as input size", "the correct loss", "IndexError: Target 1 is out of bounds"], a: 1, why: "BCEWithLogitsLoss checks sizes. Reshape the target with reshape(-1, 1) and keep it float32. Card 12." },
    { q: "A fitted model has weight 0.7 on a feature. One unit more of that feature multiplies the odds of class 1 by", o: ["0.7", "1.7", "e^0.7 = 2.01", "σ(0.7) = 0.668"], a: 2, why: "The log-odds rise by 0.7, so the odds are multiplied by e^0.7. Card 8." }
  ], "Lesson 29 test");
}}
],
summary: String.raw`Logistic regression is the classifier built on linear regression's score. It computes a logit z = wᵀx + b and passes it through the sigmoid, which maps any real number to a probability between 0 and 1, and the logit is the log-odds of that probability. A straight line fitted to 0 and 1 labels fails because its outputs leave the interval and easy far points move its boundary. Predicting class 1 when p ≥ 0.5 is the same as z ≥ 0, so the boundary is a line in the features, and other thresholds move it parallel without bending it. Curved boundaries need new features such as squares. The loss is binary cross-entropy, the negative log of the Bernoulli likelihood, which is convex in the parameters, while squared error on a sigmoid is not and its gradient vanishes for confident mistakes. The derivative of the loss with respect to the logit is p − y, so the gradient is (1/m)Xᵀ(p − y), the linear regression formula with a sigmoid inside, and batch gradient descent reaches the single minimum for any stable learning rate. On separable data the weights grow without bound, and Ng's penalty λ/2m times the squared weights stops them. In PyTorch the model is nn.Linear(d, 1) returning raw logits of shape (B, 1), the targets are float32 of the same shape, and BCEWithLogitsLoss computes the loss stably from the logits, with the sigmoid applied only for reporting.`,
sheet: [[String.raw`\[ \sigma(z) = \frac{1}{1 + e^{-z}}, \qquad \sigma'(z) = \sigma(z)(1 - \sigma(z)) \]`, "the sigmoid and its slope, at most 0.25"], [String.raw`\[ z = \mathbf{w}^T\mathbf{x} + b = \log\frac{p}{1 - p} \]`, "the logit is the log-odds"], [String.raw`\[ p \ge \tau \iff z \ge \log\frac{\tau}{1 - \tau} \]`, "the decision boundary, a line for linear features"], [String.raw`\[ \ell = -y\log p - (1 - y)\log(1 - p) \]`, "binary cross-entropy, minus the log of the Bernoulli likelihood"], [String.raw`\[ \frac{\partial \ell}{\partial z} = p - y, \qquad \nabla_{\mathbf{w}}J = \frac{1}{m}X^T(\mathbf{p} - \mathbf{y}) \]`, "the gradient"], [String.raw`\[ J_\lambda = J + \frac{\lambda}{2m}\sum_j w_j^2 \]`, "regularized logistic regression, bias not penalized"], [String.raw`\[ \ell(z, y) = \max(z, 0) - zy + \log(1 + e^{-|z|}) \]`, "the stable form inside BCEWithLogitsLoss"], [String.raw`\[ \text{odds ratio}_j = e^{w_j} \]`, "effect of one unit of feature j on the odds"]],
sources: ["AME 5970 has no lecture notes for week 7 (logistic regression), so the topic order follows the homework below", "AME 5970 HW8 Part 3, Logistic regression from scores to decisions (3A to 3E), questions and solutions docs: sigmoid by hand, split then scale, raw-logit model, thresholds, Fragment A and the ring boundary", "AME 5970 HW9 Problem 1, Binary logistic regression (1A to 1D), questions and solutions docs: the defect example, the data contract, BinaryLogistic, train_epoch and evaluate", "Andrew Ng, Machine Learning Specialization, course 1 week 3: Motivations, Logistic regression, Decision boundary, Cost function for logistic regression, Simplified cost function, Gradient descent implementation, Regularized logistic regression", "Andrew Ng, CS229 lecture notes, Part II: Classification and logistic regression (the likelihood derivation and the gradient)", "Goodfellow, Bengio and Courville, Deep Learning, section 6.2.2.2 (sigmoid units for Bernoulli outputs and the softplus form of the loss)", "PyTorch documentation: torch.nn.BCEWithLogitsLoss and torch.nn.BCELoss"]
});
})();
