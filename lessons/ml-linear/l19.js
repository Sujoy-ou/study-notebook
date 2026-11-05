(function () {
/* ML shelf, Part 4, Lesson 19: Overfitting and regularization. Follows Andrew Ng's Machine Learning Specialization as the spine (course 1 week 3: the problem of overfitting, addressing it, the regularized cost and regularized linear regression; course 2 week 3: bias and variance, the baseline, learning curves, choosing lambda) with the CS229 notes on regularization and model selection, and the professor's HW7 Part 3 (underfitting, overfitting, select once then test, the optional ridge extension) and HW8 Part 2 (capacity, validation checkpoints) with their solutions docs. All lesson data are fresh: y = sin(2 pi x) + N(0, 0.3^2), generated with the mulberry32 generator below and checked against a NumPy port. ML.L19 exposes the data and the fitting helpers for the Part 4 test. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const median = a => { const b = a.slice().sort((p, q) => p - q), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const gauss = r => () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const SIG = 0.3, TAU = 2 * Math.PI, truth = x => Math.sin(TAU * x);
/* random inputs in [0, 1], or an even grid (i + 0.5)/n, targets sin(2 pi x) + 0.3 z */
const draw = (seed, n) => { const r = rng(seed), g = gauss(r), X = [], Y = []; for (let i = 0; i < n; i++) { const x = r(); X.push(x); Y.push(truth(x) + SIG * g()); } return [X, Y]; };
const drawGrid = (seed, n) => { const r = rng(seed), g = gauss(r), X = [], Y = []; for (let i = 0; i < n; i++) { const x = (i + 0.5) / n; X.push(x); Y.push(truth(x) + SIG * g()); } return [X, Y]; };
/* polynomial features 1, u, ..., u^d with u = 2x - 1 in [-1, 1] */
const row = (x, d) => { const u = 2 * x - 1, o = [1]; for (let j = 1; j <= d; j++) o.push(Math.pow(u, j)); return o; };
/* least squares by Householder QR, stable even for degree 11 on 12 points */
const lsq = (A, b) => {
  const n = A.length, p = A[0].length, R = A.map(r => r.slice()), y = b.slice();
  for (let k = 0; k < p; k++) {
    let nr = 0; for (let i = k; i < n; i++) nr += R[i][k] * R[i][k]; nr = Math.sqrt(nr); if (nr === 0) continue;
    const s = R[k][k] > 0 ? -nr : nr, v = []; for (let i = k; i < n; i++) v.push(R[i][k]); v[0] -= s;
    let vn = 0; v.forEach(t => { vn += t * t; }); if (vn === 0) continue;
    for (let j = k; j < p; j++) { let dd = 0; for (let i = k; i < n; i++) dd += v[i - k] * R[i][j]; dd = 2 * dd / vn; for (let i = k; i < n; i++) R[i][j] -= dd * v[i - k]; }
    let dd = 0; for (let i = k; i < n; i++) dd += v[i - k] * y[i]; dd = 2 * dd / vn; for (let i = k; i < n; i++) y[i] -= dd * v[i - k];
  }
  const x = Array(p).fill(0); for (let k = p - 1; k >= 0; k--) { let s = y[k]; for (let j = k + 1; j < p; j++) s -= R[k][j] * x[j]; x[k] = s / R[k][k]; } return x;
};
/* Ng's regularized least squares: minimize sum of squared errors + lambda * sum w_j^2, j >= 1, the intercept is not penalized */
const fit = (X, Y, d, lam) => {
  const A = X.map(x => row(x, d)), b = Y.slice();
  if (lam > 0) for (let j = 1; j <= d; j++) { const r = Array(d + 1).fill(0); r[j] = Math.sqrt(lam); A.push(r); b.push(0); }
  return lsq(A, b);
};
const pr = (th, x) => row(x, th.length - 1).reduce((s, v, j) => s + v * th[j], 0);
const mseOf = (th, X, Y) => mean(X.map((x, i) => (pr(th, x) - Y[i]) ** 2));
const [XT, YT] = drawGrid(1900, 12), [XV, YV] = draw(2000, 40), [XS, YS] = draw(3000, 40);
ML.L19 = { rng, gauss, draw, drawGrid, row, lsq, fit, pr, mseOf, XT, YT, XV, YV, XS, YS };
/* plotting helpers: a function curve clipped to the frame, log axes */
const fcurve = (a, fn, lo, hi, col, w, dash) => { let d = "", pen = false; for (let i = 0; i <= 240; i++) { const x = i / 240, y = fn(x); if (isFinite(y) && y >= lo && y <= hi) { d += (pen ? "L" : "M") + a.X(x).toFixed(1) + " " + a.Y(y).toFixed(1); pen = true; } else pen = false; } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 2}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
const lg = v => Math.log10(Math.max(v, 1e-9));
const pw = v => { const t = Math.pow(10, v); return t >= 1 ? String(Math.round(t)) : String(+t.toPrecision(1)); };
const logPath = (a, xs, ys, lo, hi, col, w, dash) => ML.path(xs.map((x, i) => [a.X(x), a.Y(Math.max(lo, Math.min(hi, lg(ys[i]))))]), col, w, dash);
const dot = (x, y, r, col, hollow) => hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="1.4"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const dataPts = (a, val) => (val ? XV.map((x, i) => dot(a.X(x), a.Y(YV[i]), 3.2, C.blue, true)).join("") : "") + XT.map((x, i) => dot(a.X(x), a.Y(YT[i]), 4.5, "var(--p)")).join("");
const DEG = []; for (let d = 0; d <= 11; d++) { const th = fit(XT, YT, d, 0); DEG.push({ th, tr: mseOf(th, XT, YT), va: mseOf(th, XV, YV), te: mseOf(th, XS, YS) }); }
const LAMS = [0]; for (let k = -16; k <= 4; k++) LAMS.push(Math.pow(10, k / 2));
const lamTxt = l => l === 0 ? "0" : l >= 1 ? String(+l.toPrecision(3)) : l.toExponential(1).replace("e", "e");
const RID = LAMS.map(l => { const th = fit(XT, YT, 9, l); return { l, th, tr: mseOf(th, XT, YT), va: mseOf(th, XV, YV), te: mseOf(th, XS, YS), w2: th.slice(1).reduce((s, v) => s + v * v, 0) }; });

addLesson("ml", "linear", {
level: "Core", num: "Lesson 19",
id: "ml-linear-l19", title: "Overfitting and regularization", short: "19. Overfitting and regularization",
big: String.raw`A model is useful only if it predicts data it has not seen. Give a polynomial too few terms and it misses the pattern on the training data and on new data alike: it underfits, it has high bias. Give it too many and it threads every training point, noise included, and then swings wildly between them: it overfits, it has high variance. Andrew Ng's recipe for telling the two apart is to compute two numbers, the training error and the cross-validation error, and compare them with a baseline. His three remedies for overfitting are more data, fewer features, and regularization, which keeps all the features but charges the cost function for large weights, λ/(2m) times the sum of the squared weights, so that gradient descent shrinks every weight a little on each step. This lesson builds all of it on one fresh dataset, a sine wave with Gaussian noise of known spread: underfit and overfit fits, the bias and variance of a fit across many training sets, learning curves, the regularized cost and its update, the ridge normal equation, L1 and sparse weights, choosing λ and the degree on validation data or by k-fold cross-validation, and early stopping, with the test set opened once at the end.`,
bridge: String.raw`The professor's syllabus puts regularization in week 4 and overfitting and underfitting in week 6, and the course export has no lecture notes for either, so the order here is Andrew Ng's: Machine Learning Specialization course 1, week 3 (the problem of overfitting, addressing it, the regularized cost, regularized linear regression) and course 2, week 3 (bias and variance, the baseline, learning curves, regularization and bias and variance). The homework is HW7 Part 3 (polynomial degree chosen on validation, then the test set once, with ridge as the optional extension) and HW8 Part 2 (capacity and validation checkpoints), with their solutions docs. Lesson 15 supplies least squares and the pseudoinverse, Lesson 16 gradient descent, Lesson 17 feature scaling, and Lesson 18 the noise model behind the squared error.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Underfit and overfit", t: "Too few terms miss the pattern, too many memorize the noise",
intu: String.raw`Twelve training points come from y = sin(2πx) plus Gaussian noise with standard deviation 0.3, and forty validation points come from the same process. Fit polynomials of degree 0 to 11 by least squares and watch two numbers. At degree 0 and 1 the curve cannot bend enough: training and validation errors are both high. That is underfitting, Ng's high bias. At degree 3 the curve follows the wave and the validation error is lowest. Past degree 8 the training error keeps falling while the curve swings between the points, and at degree 11, twelve parameters for twelve points, it passes through every training point exactly and misses the validation points by a mile. That is overfitting, high variance. The training error alone would choose degree 11.`,
eq: String.raw`\[ f_{\mathbf w,b}(x) = b + w_1 u + w_2 u^2 + \dots + w_d u^d, \qquad u = 2x - 1 \]
\[ J_{\text{train}} = \frac{1}{m}\sum_{i=1}^{m}\left(f(x^{(i)}) - y^{(i)}\right)^2, \qquad J_{\text{cv}} = \frac{1}{m_{\text{cv}}}\sum_{i=1}^{m_{\text{cv}}}\left(f(x_{\text{cv}}^{(i)}) - y_{\text{cv}}^{(i)}\right)^2 \]`,
sym: [["d", "polynomial degree, the model's capacity, d + 1 parameters"], [String.raw`\(J_{\text{train}}\)`, "mean squared error on the 12 points used to fit"], [String.raw`\(J_{\text{cv}}\)`, "mean squared error on 40 validation points never used to fit"], ["underfit", "high bias: both errors high"], ["overfit", "high variance: training error low, validation error much higher"]],
how: ["Fit each candidate on the training set only.", "Compute the training and the validation error for each.", "Underfit: both errors high and close together.", "Overfit: the training error small, the validation error far above it.", "Pick the candidate with the lowest validation error, not the lowest training error."],
say: String.raw`A model underfits when it has too little capacity to capture the pattern, so both training and validation errors are high, and it overfits when it has so much capacity that it fits the noise, so the training error is low but the validation error is high.`,
num: String.raw`Degree 0: train 0.662, validation 0.612. Degree 3: train <b>0.029</b>, validation <b>0.099</b>, the best. Degree 9: train 0.009, validation <b>0.762</b>. Degree 11 puts 12 parameters through 12 points: train <b>0.000</b>, validation <b>205.9</b>. The noise variance is 0.3² = <b>0.09</b>.`,
note: String.raw`Ng lists three ways to address overfitting: collect more training data, select fewer features, and regularize. Expect the exam to ask you to read a train and validation pair and name the problem before naming the fix.`,
r(fig, ctl) {
  let showV = 1;
  ctl.innerHTML = sl("l19d", "degree d", 0, 11, 1, 1) + btns([[1, "show validation points"], [0, "training points only"]], "v") + `<div id="l19a"></div>`;
  const u = () => {
    pick(ctl, "v", showV);
    const d = +$("l19d").value, D = DEG[d]; $("l19dv").textContent = d;
    const a = ML.axes(50, 20, 380, 260, { xmin: 0, xmax: 1, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "y", grid: false });
    let s = a.s + fcurve(a, truth, -2, 2, C.gray, 1.4, "5 4") + dataPts(a, showV) + fcurve(a, x => pr(D.th, x), -2, 2, C.coral, 2.4);
    const maxAbs = Math.max(...range(0, 1, 201).map(x => Math.abs(pr(D.th, x))));
    const verdict = D.tr > 0.2 ? "underfit, high bias" : D.va > 1.5 * DEG[3].va ? "overfit, high variance" : "generalizes";
    s += tx(450, 40, "black: 12 training points", null, "t") + tx(450, 60, "blue rings: 40 validation points", null, "t") + tx(450, 80, "dashed: noiseless sin 2πx", null) + tx(450, 98, "coral: fitted polynomial", null);
    s += tx(450, 140, `degree ${d}, ${d + 1} parameters`, null, "th") + tx(450, 166, `train MSE ${f(D.tr, 4)}`, null, "t") + tx(450, 188, `validation MSE ${f(D.va, 4)}`, null, "t") + tx(450, 222, verdict, null, "th");
    if (maxAbs > 2) s += tx(450, 250, `curve leaves the frame, max |ŷ| ${f(maxAbs, 1)}`, null);
    fig.innerHTML = svg(310, s);
    $("l19a").innerHTML = ML.readout([["lowest validation", "degree 3, " + f(DEG[3].va, 4)], ["lowest training", "degree 11, " + f(DEG[11].tr, 4)], ["noise variance", "0.09"]]);
  };
  $("l19d").oninput = u; ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { showV = +b.dataset.v; u(); }); u();
}},

{s: "2. Diagnose with two errors", t: "Training error against a baseline shows bias, the gap to validation error shows variance",
intu: String.raw`Plot both errors against the degree. The training error only falls, because every extra term can do no worse on the points it was fitted to. The validation error falls, bottoms out and climbs, the U that every course draws. Ng adds a baseline, the error level you could hope for. Here we know it exactly: the noise variance 0.09, since no model can predict the noise. A training error a little below it is normal, the fit has absorbed some of the noise in its own points. The gap from the baseline up to the training error measures bias, the gap from the training error up to the validation error measures variance. Then switch to the HW7 Part 3 table, a sine on [0, 10] with noise 0.35: degree 5 is chosen, while degrees 10 and 15 lower the training error and raise the validation error.`,
eq: String.raw`\[ \text{bias gap} = J_{\text{train}} - J_{\text{baseline}}, \qquad \text{variance gap} = J_{\text{cv}} - J_{\text{train}} \]
\[ d^\ast = \arg\min_d J_{\text{cv}}(d) \]`,
sym: [[String.raw`\(J_{\text{baseline}}\)`, "the error you could hope for: human level, a strong benchmark, or the noise variance when it is known"], ["bias gap", "large: the model cannot even fit its own training data"], ["variance gap", "large: the fit does not carry over to new data"], [String.raw`\(d^\ast\)`, "the degree chosen by the validation error"], ["½ in Ng's J", "Ng's errors carry a factor ½, which halves every number and moves no minimum"]],
how: ["Fix a baseline before looking at the model's errors.", "Compute the training and validation errors for each candidate.", "Training error far above the baseline: high bias, add capacity or features, lower λ.", "Validation error far above the training error: high variance, more data, fewer features, raise λ.", "Both gaps can be large at once, fix the bias first."],
say: String.raw`The difference between the training error and the baseline measures bias and the difference between the validation error and the training error measures variance, so a high training error signals underfitting and a large train to validation gap signals overfitting.`,
num: String.raw`This lesson's data, baseline 0.09. Degree 1: bias gap 0.2755 − 0.09 = <b>0.186</b>, variance gap <b>0.005</b>. Degree 9: training error 0.009 sits below the baseline, it has fitted noise, variance gap <b>0.752</b>. HW7: degree 5 validation <b>0.1499</b> against noise 0.1225, degree 15 train 0.1166 and validation <b>0.2630</b>.`,
note: String.raw`HW7 Task 3.4 warns that 18 validation points cannot separate close candidates: degree 10 lost to degree 5 by 0.05, a gap that one or two points could reverse. Repeated splits or k-fold cross-validation (card 10) give the spread.`,
r(fig, ctl) {
  let view = 0;
  ctl.innerHTML = btns([[0, "this lesson's data"], [1, "HW7 Part 3 table"]], "w") + sl("l19g", "degree", 0, 11, 1, 3) + `<div id="l19b"></div>`;
  const HW = { d: [0, 1, 3, 5, 10, 15], tr: [0.5307, 0.5305, 0.4344, 0.1524, 0.1226, 0.1166], va: [0.3657, 0.3800, 0.3615, 0.1499, 0.2032, 0.2630] };
  const u = () => {
    pick(ctl, "w", view);
    const sld = $("l19g");
    let s;
    if (view === 0) {
      sld.max = 11; const d = +sld.value; $("l19gv").textContent = d;
      const a = ML.axes(60, 20, 400, 260, { xmin: 0, xmax: 11, ymin: -3, ymax: 3, nx: 11, ny: 6, fx: v => v, fy: pw, xl: "degree d", yl: "MSE, log scale", grid: false });
      const ds = DEG.map((_, i) => i);
      s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(lg(0.09))}" x2="${a.X(11)}" y2="${a.Y(lg(0.09))}" stroke="${C.teal}" stroke-dasharray="6 4"/>` + tx(a.X(5.5), a.Y(lg(0.09)) + 14, "baseline 0.09", "middle");
      s += logPath(a, ds, DEG.map(D => D.tr), -3, 3, C.blue, 2.2) + logPath(a, ds, DEG.map(D => D.va), -3, 3, C.coral, 2.2);
      ds.forEach(i => { s += dot(a.X(i), a.Y(Math.max(-3, lg(DEG[i].tr))), 3.5, C.blue) + dot(a.X(i), a.Y(Math.min(3, lg(DEG[i].va))), 3.5, C.coral); });
      s += `<line x1="${a.X(d)}" y1="20" x2="${a.X(d)}" y2="280" stroke="${C.gray}" stroke-dasharray="3 3"/>` + dot(a.X(3), a.Y(lg(DEG[3].va)), 7, C.coral, true);
      const D = DEG[d];
      s += tx(480, 40, "blue: training MSE", null, "t") + tx(480, 60, "coral: validation MSE", null, "t") + tx(480, 80, "ring: lowest validation", null);
      s += tx(480, 124, `degree ${d}`, null, "th") + tx(480, 148, `bias gap ${f(D.tr - 0.09, 4)}`, null, "t") + tx(480, 170, `variance gap ${f(D.va - D.tr, 4)}`, null, "t");
      s += tx(480, 204, D.tr - 0.09 > 0.1 ? "high bias" : D.va - D.tr > 0.3 ? "high variance" : "both gaps small", null, "th");
      if (d === 11) s += tx(480, 230, "training MSE is 0, drawn at the floor", null);
      fig.innerHTML = svg(320, s);
      $("l19b").innerHTML = ML.readout([["train", f(D.tr, 4)], ["validation", f(D.va, 4)], ["chosen degree", "3"]]);
    } else {
      sld.max = 5; const k = Math.min(5, +sld.value); sld.value = k; $("l19gv").textContent = HW.d[k] === 0 ? "constant" : HW.d[k];
      const a = ML.axes(60, 20, 400, 260, { xmin: 0, xmax: 15, ymin: 0, ymax: 0.6, nx: 5, ny: 6, fx: v => v, fy: v => f(v, 1), xl: "degree (0 = constant baseline)", yl: "MSE", grid: false });
      s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(0.1225)}" x2="${a.X(15)}" y2="${a.Y(0.1225)}" stroke="${C.teal}" stroke-dasharray="6 4"/>` + tx(a.X(10.5), a.Y(0.1225) + 16, "noise 0.35² = 0.1225", null);
      s += ML.path(HW.d.map((d, i) => [a.X(d), a.Y(HW.tr[i])]), C.blue, 2.2) + ML.path(HW.d.map((d, i) => [a.X(d), a.Y(HW.va[i])]), C.coral, 2.2);
      HW.d.forEach((d, i) => { s += dot(a.X(d), a.Y(HW.tr[i]), 4, C.blue) + dot(a.X(d), a.Y(HW.va[i]), 4, C.coral); });
      s += `<line x1="${a.X(HW.d[k])}" y1="20" x2="${a.X(HW.d[k])}" y2="280" stroke="${C.gray}" stroke-dasharray="3 3"/>` + dot(a.X(5), a.Y(0.1499), 7, C.coral, true);
      s += tx(480, 40, "HW7 Part 3: sin(x) on [0, 10]", null, "t") + tx(480, 60, "54 train, 18 validation, 18 test", null) + tx(480, 104, HW.d[k] === 0 ? "constant baseline" : `degree ${HW.d[k]}`, null, "th") + tx(480, 128, `train ${f(HW.tr[k], 4)}`, null, "t") + tx(480, 150, `validation ${f(HW.va[k], 4)}`, null, "t") + tx(480, 184, "chosen: degree 5", null, "th") + tx(480, 206, "test MSE once: 0.1465", null, "t");
      fig.innerHTML = svg(320, s);
      $("l19b").innerHTML = ML.readout([["variance gap", f(HW.va[k] - HW.tr[k], 4)], ["source", "HW7 solutions, Task 3.1 and 3.2"]]);
    }
  };
  $("l19g").oninput = u; ctl.querySelectorAll("button[data-w]").forEach(b => b.onclick = () => { view = +b.dataset.w; $("l19g").value = view ? 3 : 3; u(); }); u();
}},

{s: "3. Bias and variance", t: "Refit on many training sets: bias is the average miss, variance is the spread",
intu: String.raw`The words bias and variance come from imagining many training sets. Keep the twelve inputs fixed and draw the noise again 200 times, refitting each time. Twenty of the 200 fits are drawn faint, their average thick. Bias is how far the average fit sits from the true curve, variance is how much the individual fits scatter around their average. A straight line has a large bias, every fit misses the wave the same way, and a small variance. A degree 9 polynomial has almost no bias but its fits scatter wildly between the points. The expected squared error on a new point adds the two and the noise, which no model can remove. The sum is smallest at degree 3, the degree that validation picked on card 1.`,
eq: String.raw`\[ \mathbb E\left[(y - \hat f(x))^2\right] = \underbrace{\left(\bar f(x) - f(x)\right)^2}_{\text{bias}^2} + \underbrace{\mathbb E\left[(\hat f(x) - \bar f(x))^2\right]}_{\text{variance}} + \sigma^2 \]`,
sym: [[String.raw`\(\hat f\)`, "the fit from one training set, a random function"], [String.raw`\(\bar f\)`, "the average fit over many training sets"], [String.raw`\(f\)`, "the true curve, sin 2πx, known here because we simulated"], [String.raw`\(\sigma^2\)`, "noise variance, 0.09, the irreducible error"], ["averaged over x", "bias² and variance are averaged over 101 points in [0, 1]"]],
how: ["Fix the inputs and draw many noisy training sets.", "Fit the same model to each one.", "Average the fits, then measure the squared gap to the truth: bias².", "Measure the spread of the fits around their average: variance.", "Add the noise variance to predict the error on new data."],
say: String.raw`The expected squared error on a new point is the squared bias of the average fit plus the variance of the fits across training sets plus the noise variance, and adding capacity trades bias for variance.`,
num: String.raw`Degree 1: bias² <b>0.204</b>, variance 0.015, total 0.309. Degree 3: bias² 0.006, variance 0.035, total <b>0.130</b>, the lowest. Degree 9: bias² 0.001, variance <b>1.426</b>, total 1.517. Degree 2 has the same bias² as degree 1, 0.204, because sin 2πx is antisymmetric about x = 0.5 and gains nothing from u².`,
r(fig, ctl) {
  const r = rng(4000), g = gauss(r), SETS = [];
  for (let s = 0; s < 200; s++) SETS.push(XT.map(x => truth(x) + SIG * g()));
  const XG = range(0, 1, 101), cache = {};
  const stats = d => {
    if (cache[d]) return cache[d];
    const P = SETS.map(Y => { const th = fit(XT, Y, d, 0); return XG.map(x => pr(th, x)); });
    const avg = XG.map((_, j) => mean(P.map(p => p[j])));
    const b2 = mean(XG.map((x, j) => (avg[j] - truth(x)) ** 2)), vr = mean(XG.map((_, j) => mean(P.map(p => (p[j] - avg[j]) ** 2))));
    return (cache[d] = { P, avg, b2, vr });
  };
  ctl.innerHTML = sl("l19bv", "degree d", 0, 9, 1, 1) + `<div id="l19c"></div>`;
  const u = () => {
    const d = +$("l19bv").value; $("l19bvv").textContent = d;
    const S = stats(d);
    const a = ML.axes(50, 20, 360, 230, { xmin: 0, xmax: 1, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "fitted value", grid: false });
    let s = a.s;
    for (let k = 0; k < 20; k++) { let dd = "", pen = false; S.P[k].forEach((v, j) => { if (v >= -2 && v <= 2) { dd += (pen ? "L" : "M") + a.X(XG[j]).toFixed(1) + " " + a.Y(v).toFixed(1); pen = true; } else pen = false; }); s += `<path d="${dd}" fill="none" stroke="${C.coral}" stroke-width="1" opacity="0.35"/>`; }
    s += fcurve(a, truth, -2, 2, "var(--p)", 1.6, "5 4") + ML.path(XG.map((x, j) => [a.X(x), a.Y(Math.max(-2, Math.min(2, S.avg[j])))]), C.blue, 3);
    const tot = S.b2 + S.vr + 0.09, B = 470, Hh = 220, sc = v => Hh * Math.min(1, v / 0.6);
    let y0 = 270;
    [[S.b2, C.purple, "bias²"], [S.vr, C.coral, "variance"], [0.09, C.gray, "noise"]].forEach(([v, col], q) => { const h = sc(v); y0 -= h; s += `<rect x="${B}" y="${y0}" width="50" height="${h}" fill="${col}" opacity="0.75"/><rect x="528" y="${50 + q * 24}" width="9" height="9" fill="${col}" opacity="0.75"/>`; });
    s += `<line x1="${B - 6}" y1="${270 - sc(0.6)}" x2="${B + 56}" y2="${270 - sc(0.6)}" stroke="var(--line)"/>` + tx(B - 8, 270 - sc(0.6) + 4, "0.6", "end") + tx(B - 8, 274, "0", "end") + tx(B + 25, 288, "expected error", "middle");
    s += tx(544, 59, `bias² ${f(S.b2, 4)}`, null, "t") + tx(544, 83, `variance ${f(S.vr, 4)}`, null, "t") + tx(544, 107, "noise 0.0900", null, "t") + tx(540, 140, `total ${f(tot, 4)}`, null, "th") + tx(540, 164, `card 1 validation ${f(DEG[d].va, 3)}`, null);
    if (tot > 0.6) s += tx(540, 190, "bar clipped at 0.6", null);
    s += tx(50, 306, "faint coral: 20 of 200 fits, blue: their average, dashed: the truth", null);
    fig.innerHTML = svg(316, s);
    $("l19c").innerHTML = ML.readout([["lowest total", "degree 3, 0.1301"], ["degree " + d + " total", f(tot, 4)]]);
  };
  $("l19bv").oninput = u; u();
}},

{s: "4. Learning curves", t: "More data cures variance but not bias",
intu: String.raw`Ng's learning curve plots both errors against the training set size m. Each point here is the median over 30 random training sets, scored on 200 validation points. For a straight line, high bias, the training error rises as more points must share one line, the validation error falls, and both flatten together near 0.28, far above the noise level. Collecting more data would waste the effort. For degree 9, high variance, the validation error starts enormous, the fit swings between few points, and falls steadily toward the noise level as m grows, while the gap to the training error closes. More data is exactly the cure. Degree 3 sits near the baseline already at m = 40.`,
eq: String.raw`\[ m \uparrow: \quad J_{\text{train}}(m) \uparrow, \qquad J_{\text{cv}}(m) \downarrow \]
\[ \text{high bias: } J_{\text{train}} \approx J_{\text{cv}} \gg J_{\text{baseline}}, \qquad \text{high variance: } J_{\text{cv}} \gg J_{\text{train}} \]`,
sym: [["m", "training set size, from 12 to 80"], ["median over 30 sets", "a few small random sets give exploding fits, the median is robust to them"], ["plateau", "both curves flat and close: more data will not help"], ["closing gap", "validation still falling: more data will help"], ["baseline", "noise variance 0.09"]],
how: ["Train on the first m examples for several values of m.", "Record the training error on those m and the validation error on a fixed set.", "Plot both against m.", "Curves meet high above the baseline: high bias, change the model.", "Large gap that shrinks with m: high variance, get more data or regularize."],
say: String.raw`A learning curve plots training and validation error against the training set size, and it shows that more data helps a high variance model, whose validation error keeps falling, but not a high bias model, whose two errors meet on a plateau above the baseline.`,
num: String.raw`Degree 1: m = 12 train <b>0.194</b>, validation 0.310, m = 80 train 0.268, validation <b>0.278</b>. Degree 9: validation <b>0.690</b> at m = 20, 0.145 at m = 40, <b>0.095</b> at m = 80. Degree 3: validation 0.089 at m = 40.`,
r(fig, ctl) {
  let dk = 0; const DS = [1, 3, 9], cache = {};
  const [XB, YB] = draw(5000, 200), SETS = []; for (let s = 0; s < 30; s++) SETS.push(draw(6000 + s, 80));
  const MS = range(12, 80, 69).map(Math.round);
  const curves = d => cache[d] || (cache[d] = MS.map(m => { const tr = [], va = []; SETS.forEach(([X, Y]) => { const th = fit(X.slice(0, m), Y.slice(0, m), d, 0); tr.push(mseOf(th, X.slice(0, m), Y.slice(0, m))); va.push(mseOf(th, XB, YB)); }); return [median(tr), median(va)]; }));
  ctl.innerHTML = btns([[0, "degree 1"], [1, "degree 3"], [2, "degree 9"]], "k") + sl("l19m", "training size m", 12, 80, 1, 40) + `<div id="l19e"></div>`;
  const u = () => {
    pick(ctl, "k", dk);
    const m = +$("l19m").value; $("l19mv").textContent = m;
    const d = DS[dk], cv = curves(d), i = m - 12;
    const a = ML.axes(60, 20, 400, 260, { xmin: 12, xmax: 80, ymin: -2.5, ymax: 1, nx: 4, ny: 7, fx: v => Math.round(v), fy: v => Number.isInteger(v) ? pw(v) : "", xl: "training set size m", yl: "MSE, log scale", grid: false });
    let s = a.s + `<line x1="${a.X(12)}" y1="${a.Y(lg(0.09))}" x2="${a.X(80)}" y2="${a.Y(lg(0.09))}" stroke="${C.teal}" stroke-dasharray="6 4"/>` + tx(a.X(70), a.Y(lg(0.09)) + 16, "baseline 0.09", "middle");
    s += logPath(a, MS, cv.map(c => c[0]), -2.5, 1, C.blue, 2.2) + logPath(a, MS, cv.map(c => c[1]), -2.5, 1, C.coral, 2.2);
    s += `<line x1="${a.X(m)}" y1="20" x2="${a.X(m)}" y2="280" stroke="${C.gray}" stroke-dasharray="3 3"/>` + dot(a.X(m), a.Y(Math.max(-2.5, lg(cv[i][0]))), 5, C.blue) + dot(a.X(m), a.Y(Math.min(1, lg(cv[i][1]))), 5, C.coral);
    s += tx(480, 40, "blue: training MSE", null, "t") + tx(480, 60, "coral: validation MSE", null, "t") + tx(480, 80, "medians over 30 training sets", null);
    s += tx(480, 124, `degree ${d}, m = ${m}`, null, "th") + tx(480, 148, `train ${f(cv[i][0], 4)}`, null, "t") + tx(480, 170, `validation ${f(cv[i][1], cv[i][1] > 100 ? 1 : 4)}`, null, "t");
    s += tx(480, 210, d === 1 ? "plateau above baseline:" : d === 9 ? "gap closes as m grows:" : "near the baseline", null, "th") + tx(480, 232, d === 1 ? "more data will not help" : d === 9 ? "more data helps" : "a good capacity for this data", null, "t");
    if (cv[i][1] > 10) s += tx(480, 256, "validation clipped at 10", null);
    fig.innerHTML = svg(316, s);
    $("l19e").innerHTML = ML.readout([["gap at m = " + m, f(cv[i][1] - cv[i][0], cv[i][1] > 100 ? 1 : 4)], ["at m = 80", f(cv[68][0], 4) + " and " + f(cv[68][1], 4)]]);
  };
  $("l19m").oninput = u; ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { dk = +b.dataset.k; u(); }); u();
}},

{s: "5. The regularized cost", t: "Keep every feature, but charge the cost for large weights",
intu: String.raw`Regularization is Ng's third remedy. Keep the degree 9 polynomial, all ten parameters, and add a penalty to the cost: λ/(2m) times the sum of the squared weights w₁ to w₉. The intercept b is not penalized, it only sets the level. With λ = 0 the least squares weights reach about ±150 and their squares sum to 42,200, the cost of bending sharply between points. Raise λ and the minimizer trades a little training error for much smaller weights, so the curve calms down. At λ = 10⁻⁴ the validation error drops from 0.762 to 0.110. Push λ to 100 and every weight is driven toward zero, the fit is almost the flat line b, and the model underfits. λ dials capacity continuously.`,
eq: String.raw`\[ J(\mathbf w, b) = \frac{1}{2m}\sum_{i=1}^{m}\left(f_{\mathbf w,b}(x^{(i)}) - y^{(i)}\right)^2 + \frac{\lambda}{2m}\sum_{j=1}^{n} w_j^2 \]`,
sym: [[String.raw`\(\lambda\)`, "regularization strength, chosen on validation data, never on training or test data"], [String.raw`\(\frac{\lambda}{2m}\)`, "Ng scales the penalty like the data term, so the same λ suits different m"], [String.raw`\(\sum_{j=1}^{n} w_j^2\)`, "squared length of the weight vector, b excluded"], ["n", "number of weights, here n = 9 for degree 9"], [String.raw`\(\lambda = 0\) or large \(\lambda\)`, "plain least squares at one end, the constant b at the other"]],
how: ["Add λ/(2m) Σ wⱼ² to the cost, for j = 1 to n.", "Leave b out of the penalty.", "Put the features on a common scale first, the penalty treats every weight alike.", "Minimize the new cost by gradient descent or in closed form.", "Report errors without the penalty term, the penalty is part of training, not of evaluation."],
say: String.raw`Regularization adds lambda over two m times the sum of the squared weights to the cost, which keeps all the features but makes large weights expensive, so increasing lambda lowers the model's effective capacity.`,
num: String.raw`Degree 9 on the 12 points. λ = 0: Σwⱼ² = <b>42,200</b>, train 0.009, validation 0.762. λ = 10⁻⁴: Σwⱼ² = <b>139</b>, train 0.016, validation <b>0.110</b>. λ = 1: Σwⱼ² = 1.40, train 0.197, validation 0.205. λ = 100: train <b>0.628</b>, close to the constant model's 0.662.`,
note: String.raw`The features here are powers of u = 2x − 1, all within [−1, 1], so one λ fits every weight. With raw features in different units the penalty would mostly hit the small-unit features, so scale first (Lesson 17).`,
r(fig, ctl) {
  ctl.innerHTML = sl("l19l", "λ index, 0 means λ = 0", 0, 21, 1, 0) + `<div id="l19f"></div>`;
  const u = () => {
    const k = +$("l19l").value, R = RID[k]; $("l19lv").textContent = "λ = " + lamTxt(R.l);
    const a = ML.axes(50, 20, 300, 230, { xmin: 0, xmax: 1, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "y", grid: false });
    let s = a.s + fcurve(a, truth, -2, 2, C.gray, 1.4, "5 4") + dataPts(a, 1) + fcurve(a, x => pr(R.th, x), -2, 2, C.coral, 2.4);
    const bx = 400, bw = 26, y0 = 140, sc = 36;
    s += tx(bx, 26, "weights w₁ to w₉, sign · log₁₀(1 + |w|)", null, "t") + `<line x1="${bx}" y1="${y0}" x2="${bx + 9 * (bw + 4)}" y2="${y0}" stroke="var(--p)"/>`;
    [-2, -1, 1, 2].forEach(t => { s += `<line x1="${bx}" y1="${y0 - t * sc}" x2="${bx + 9 * (bw + 4)}" y2="${y0 - t * sc}" stroke="var(--line)" stroke-width="0.6"/>` + tx(bx - 6, y0 - t * sc + 4, (t > 0 ? "" : "−") + ["", "9", "99"][Math.abs(t)], "end"); });
    R.th.slice(1).forEach((w, j) => { const h = Math.sign(w) * Math.log10(1 + Math.abs(w)) * sc, x = bx + j * (bw + 4); s += `<rect x="${x}" y="${h > 0 ? y0 - h : y0}" width="${bw}" height="${Math.abs(h)}" fill="${w > 0 ? C.blue : C.coral}" opacity="0.8"/>` + tx(x + bw / 2, 236, "w" + (j + 1), "middle"); });
    const data = 0.5 * R.tr, pen = R.l / 24 * R.w2;
    s += tx(400, 262, `Σwⱼ² = ${R.w2 > 1000 ? Math.round(R.w2).toLocaleString("en-US") : f(R.w2, 3)}, b = ${f(R.th[0], 3)}`, null, "t") + tx(400, 284, `J = ${f(data, 5)} + ${f(pen, 5)} = ${f(data + pen, 5)}`, null, "t");
    fig.innerHTML = svg(300, s);
    $("l19f").innerHTML = ML.readout([["train MSE", f(R.tr, 4)], ["validation MSE", f(R.va, 4)], ["penalty share of J", f(100 * pen / (data + pen), 1) + " %"]]);
  };
  $("l19l").oninput = u; u();
}},

{s: "6. Regularized gradient descent", t: "One update by hand: every weight is shrunk, then pushed by the data",
intu: String.raw`Differentiate the regularized cost and one extra term appears in each weight's gradient, (λ/m)wⱼ. Rearranged, Ng's update says: first multiply wⱼ by a number slightly below 1, then take the usual gradient step. That multiplier, 1 − αλ/m, is why L2 regularization is also called weight decay. The intercept b gets the plain update. Step through one update on three points with α = 0.1 and λ = 3: the data alone would move w from 1 to 1.2167, the penalty pulls it back to 1.1167, and the shrink factor is exactly 0.9. Move λ and watch the shrink factor and the new w.`,
eq: String.raw`\[ w_j := w_j - \alpha\left[\frac{1}{m}\sum_{i=1}^{m}\left(f(x^{(i)}) - y^{(i)}\right)x_j^{(i)} + \frac{\lambda}{m}w_j\right] \]
\[ w_j := w_j\left(1 - \alpha\frac{\lambda}{m}\right) - \alpha\,\frac{1}{m}\sum_{i=1}^{m}\left(f(x^{(i)}) - y^{(i)}\right)x_j^{(i)} \]`,
sym: [[String.raw`\(\frac{\lambda}{m}w_j\)`, "the penalty's gradient, it always points back toward zero"], [String.raw`\(1 - \alpha\frac{\lambda}{m}\)`, "the shrink factor, slightly below 1 on every step"], ["b", "updated without the penalty term"], ["weight decay", "another name for the L2 penalty, from the shrink factor"], [String.raw`\(\alpha\)`, "learning rate, 0.1 here"]],
how: ["Predict with the current w and b.", "Compute the errors f − y.", "Data gradients: the mean of error times feature for w, the mean error for b.", "Add (λ/m)w to the gradient for w only.", "Update both at once, simultaneously, with the learning rate."],
say: String.raw`Regularized gradient descent multiplies each weight by one minus alpha lambda over m before the usual gradient step, so the L2 penalty shrinks the weights a little on every update, while the bias is updated as before.`,
num: String.raw`x = (1, 2, 3), y = (2, 2.5, 4.5), w = 1, b = 0, α = 0.1, λ = 3, m = 3. Errors (<b>−1, −0.5, −1.5</b>). Data gradient for w: −6.5/3 = <b>−2.1667</b>, penalty λw/m = <b>1</b>. New w = 1 − 0.1(−2.1667 + 1) = <b>1.1167</b>, without λ 1.2167. Shrink factor <b>0.9</b>. New b = 0 − 0.1(−1) = 0.1.`,
note: String.raw`In PyTorch, <code>weight_decay=wd</code> adds wd·p to the gradient of every parameter, the bias included unless you put it in its own parameter group. Because <code>nn.MSELoss</code> has no ½, Ng's update is reproduced with lr = α/2 and wd = 2λ/m, here lr 0.05 and wd 2, which also gives 1.1167.`,
r(fig, ctl) {
  const X = [1, 2, 3], Y = [2, 2.5, 4.5], m = 3, al = 0.1, w = 1, b = 0;
  ctl.innerHTML = sl("l19h", "λ", 0, 6, 0.5, 3) + `<div id="l19hs"></div><div id="l19i"></div>`;
  const NAMES = ["predict", "errors", "data gradients", "add the penalty", "update"];
  let k = 0;
  const draw = kk => {
    k = kk; const lam = +$("l19h").value; $("l19hv").textContent = f(lam, 1);
    const F = X.map(x => w * x + b), E = F.map((v, i) => v - Y[i]), EX = E.map((e, i) => e * X[i]);
    const gw = mean(EX), gb = mean(E), pen = lam / m * w, wn = w - al * (gw + pen), bn = b - al * gb, shr = 1 - al * lam / m;
    const cols = ["x", "y", "f = wx + b", "e = f − y", "e · x"], T = X.map((x, i) => [x, Y[i], F[i], E[i], EX[i]]);
    const hl = new Set(), hl2 = new Set();
    for (let i = 0; i < 3; i++) { if (k === 0) hl.add(i + ",2"); if (k === 1) hl.add(i + ",3"); if (k >= 2) hl.add(i + ",4"); if (k >= 2) hl2.add(i + ",3"); }
    let s = ML.grid(T, { x: 110, y: 40, cell: 70, fmt: v => Number.isInteger(v) ? v : f(v, 2), colLab: cols, rowLab: ["i = 1", "i = 2", "i = 3"], title: `w = ${w}, b = ${b}, α = ${al}, λ = ${f(lam, 1)}, m = ${m}` }).s;
    const L = [];
    if (k >= 0) L.push(["predictions f = (1, 2, 3)", 0]);
    if (k >= 1) L.push(["errors e = (−1, −0.5, −1.5)", 1]);
    if (k >= 2) L.push([`data gradient w: (1/3)(${EX.map(v => f(v, 1)).join(" ")}) = ${f(gw, 4)}`, 2], [`data gradient b: (1/3)(${E.map(v => f(v, 1)).join(" ")}) = ${f(gb, 4)}`, 2]);
    if (k >= 3) L.push([`penalty gradient (λ/m) w = ${f(lam, 1)}/3 · 1 = ${f(pen, 4)}, none for b`, 3]);
    if (k >= 4) L.push([`w := 1 − 0.1 (${f(gw, 4)} + ${f(pen, 4)}) = ${f(wn, 4)}`, 4], [`same as 1 · ${f(shr, 3)} − 0.1 (${f(gw, 4)}) = ${f(wn, 4)}`, 4], [`b := 0 − 0.1 (${f(gb, 1)}) = ${f(bn, 4)}`, 4]);
    L.forEach(([t, kk2], i) => { s += tx(110, 296 + i * 22, t, null, kk2 === k ? "th" : "t"); });
    fig.innerHTML = svg(454, s) + ML.code(["err = w * x + b - y", "dw = (err * x).mean() + lam / m * w   # penalty only on w", "db = err.mean()", "w, b = w - alpha * dw, b - alpha * db"], [0, 0, 1, 1, 3][k]);
    $("l19i").innerHTML = ML.readout([["shrink factor 1 − αλ/m", f(shr, 4)], ["new w", f(wn, 4)], ["new w without λ", f(w - al * gw, 4)]]);
  };
  ML.stepper($("l19hs"), 5, draw, NAMES);
  $("l19h").oninput = () => draw(k);
}},

{s: "7. Ridge in closed form", t: "The normal equation gains λ on the diagonal, and that fixes singular matrices",
intu: String.raw`Set the gradient of the regularized cost to zero and Lesson 15's normal equation gains one term: λ added to the diagonal of XᵀX, except at the intercept. That is ridge regression. Here two centered features are 91 % correlated, so XᵀX has eigenvalues 21.05 and 0.95, a condition number of 22. The picture shows the contours of the squared error in the (w₁, w₂) plane and the ridge path: as λ grows, the solution slides from the least squares point toward the origin, along the point where a circle around the origin just touches a contour. Switch to the duplicated column. XᵀX is now singular and plain least squares has a whole line of minimizers, but XᵀX + λI is invertible for every λ above zero, and as λ shrinks the ridge solution lands on the pseudoinverse answer, the equal split.`,
eq: String.raw`\[ \left(X^\top X + \lambda L\right)\boldsymbol\theta = X^\top\mathbf y, \qquad L = \mathrm{diag}(0, 1, \dots, 1) \]
\[ \text{centered features: } \mathbf w = \left(X^\top X + \lambda I\right)^{-1}X^\top\mathbf y, \qquad \kappa = \frac{\mu_{\max} + \lambda}{\mu_{\min} + \lambda} \]`,
sym: [["L", "identity with a 0 for the intercept, so b is not penalized"], [String.raw`\(\mu_{\max}, \mu_{\min}\)`, "largest and smallest eigenvalues of XᵀX"], [String.raw`\(\kappa\)`, "condition number, lowered by every λ above zero"], ["ridge path", "the solution w(λ) from least squares at λ = 0 to the origin as λ grows"], ["min-norm limit", "with a singular XᵀX, ridge tends to the pinv solution as λ goes to 0"]],
how: ["Center the features, then b is the mean of y.", "Form XᵀX and Xᵀy.", "Add λ to every diagonal entry that belongs to a weight.", "Solve the system with np.linalg.solve, never by inverting.", "Check: w shrinks in length as λ grows, and the condition number falls."],
say: String.raw`Ridge regression solves the normal equation with lambda added to the diagonal of X transpose X, except for the intercept, which shrinks the weights, lowers the condition number and makes the system solvable even when X transpose X is singular.`,
num: String.raw`XᵀX = [[12, 10], [10, 10]], Xᵀy = (23.8, 20.9). λ = 0: w = (<b>1.45, 0.64</b>), κ = 22.15. λ = 1: (<b>1.2279, 0.7837</b>), κ = 11.31. λ = 20: (0.5872, 0.5009). Duplicated column: XᵀX = [[12, 12], [12, 12]], singular. λ = 1: (0.952, 0.952), κ = 25. As λ goes to 0: (<b>0.9917, 0.9917</b>), the pinv answer of Lesson 15.`,
r(fig, ctl) {
  let dup = 0; const LL = [0, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  const x1 = [-2, -1, -1, 0, 1, 1, 2], x2c = [-2, -1, 0, 0, 0, 1, 2], y = [-4.1, -2.3, -1.5, 0, 1.4, 2.6, 3.9];
  ctl.innerHTML = btns([[0, "correlated features"], [1, "duplicated column"]], "u") + sl("l19r", "λ", 0, 10, 1, 4) + `<div id="l19j"></div>`;
  const u = () => {
    pick(ctl, "u", dup);
    const lam = LL[+$("l19r").value]; $("l19rv").textContent = lam;
    const x2 = dup ? x1 : x2c, dt = (p, q) => p.reduce((s, v, i) => s + v * q[i], 0);
    const G = [[dt(x1, x1), dt(x1, x2)], [dt(x2, x1), dt(x2, x2)]], h = [dt(x1, y), dt(x2, y)];
    const solve = l => { const a = G[0][0] + l, bq = G[0][1], d = G[1][1] + l, det = a * d - bq * bq; if (Math.abs(det) < 1e-12) { const s2 = (h[0] + h[1]) / (2 * (G[0][0] + G[0][1])); return [s2, s2]; } return [(d * h[0] - bq * h[1]) / det, (a * h[1] - bq * h[0]) / det]; };
    const W = solve(lam), tr = G[0][0] + G[1][1], dg = Math.sqrt((G[0][0] - G[1][1]) ** 2 / 4 + G[0][1] ** 2), mu1 = tr / 2 + dg, mu2 = tr / 2 - dg;
    const th = 0.5 * Math.atan2(2 * G[0][1], G[0][0] - G[1][1]), v1 = [Math.cos(th), Math.sin(th)], v2 = [-Math.sin(th), Math.cos(th)];
    const W0 = solve(0), sse = w => dt(x1.map((v, i) => v * w[0] + x2[i] * w[1] - y[i]), x1.map((v, i) => v * w[0] + x2[i] * w[1] - y[i]));
    const a = ML.axes(60, 20, 270, 270, { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 2.5, nx: 6, ny: 6, fx: v => f(v, 1), fy: v => f(v, 1), xl: "w₁", yl: "w₂", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(-0.5)}" x2="${a.X(0)}" y2="${a.Y(2.5)}" stroke="var(--line)"/><line x1="${a.X(-0.5)}" y1="${a.Y(0)}" x2="${a.X(2.5)}" y2="${a.Y(0)}" stroke="var(--line)"/>`;
    const inF = p => p[0] >= -0.5 && p[0] <= 2.5 && p[1] >= -0.5 && p[1] <= 2.5;
    [0.3, 1.5, 4, 8, 14].forEach(c => {
      if (mu2 > 1e-9) { const pts = range(0, TAU, 121).map(t => [W0[0] + Math.sqrt(c / mu1) * Math.cos(t) * v1[0] + Math.sqrt(c / mu2) * Math.sin(t) * v2[0], W0[1] + Math.sqrt(c / mu1) * Math.cos(t) * v1[1] + Math.sqrt(c / mu2) * Math.sin(t) * v2[1]]); let d = "", pen = false; pts.forEach(p => { if (inF(p)) { d += (pen ? "L" : "M") + a.X(p[0]).toFixed(1) + " " + a.Y(p[1]).toFixed(1); pen = true; } else pen = false; }); s += `<path d="${d}" fill="none" stroke="${C.blue}" stroke-width="1" opacity="0.7"/>`; }
      else [-1, 1].forEach(sg => { const o = [W0[0] + sg * Math.sqrt(c / mu1) * v1[0], W0[1] + sg * Math.sqrt(c / mu1) * v1[1]]; const pts = range(-4, 4, 81).map(t => [o[0] + t * v2[0], o[1] + t * v2[1]]).filter(inF); if (pts.length > 1) s += ML.path(pts.map(p => [a.X(p[0]), a.Y(p[1])]), C.blue, 1); });
    });
    if (mu2 <= 1e-9) { const pts = range(-4, 4, 81).map(t => [W0[0] + t * v2[0], W0[1] + t * v2[1]]).filter(inF); s += ML.path(pts.map(p => [a.X(p[0]), a.Y(p[1])]), C.blue, 2.4) + tx(a.X(1.9), a.Y(2.3), "thick line: every point", "middle") + tx(a.X(1.9), a.Y(2.3) + 14, "has the least SSE", "middle"); }
    const path = range(-3, 3, 121).map(t => solve(Math.pow(10, t)));
    s += ML.path([W0].concat(path).map(p => [a.X(p[0]), a.Y(p[1])]), C.purple, 2, "4 3");
    const rad = Math.hypot(W[0], W[1]); { let d = "", pen = false; range(0, TAU, 181).forEach(t => { const p = [rad * Math.cos(t), rad * Math.sin(t)]; if (inF(p)) { d += (pen ? "L" : "M") + a.X(p[0]).toFixed(1) + " " + a.Y(p[1]).toFixed(1); pen = true; } else pen = false; }); s += `<path d="${d}" fill="none" stroke="${C.gray}" stroke-dasharray="3 3"/>`; }
    s += dot(a.X(W0[0]), a.Y(W0[1]), 5, C.blue) + dot(a.X(W[0]), a.Y(W[1]), 6, C.coral);
    const k = (mu1 + lam) / (mu2 + lam);
    s += tx(400, 40, dup ? "x₂ is a copy of x₁" : "x₁ and x₂ correlated 0.91", null, "th") + tx(400, 64, `XᵀX = [[${G[0][0]}, ${G[0][1]}], [${G[1][0]}, ${G[1][1]}]]`, null, "t") + tx(400, 86, `eigenvalues ${f(mu1, 2)} and ${f(Math.max(0, mu2), 2)}`, null, "t");
    s += tx(400, 124, `λ = ${lam}`, null, "th") + tx(400, 148, `w = (${f(W[0], 4)}, ${f(W[1], 4)})`, null, "t") + tx(400, 170, `‖w‖ = ${f(rad, 4)}`, null, "t") + tx(400, 192, `SSE = ${f(sse(W), 4)}`, null, "t") + tx(400, 214, `κ = ${isFinite(k) && mu2 + lam > 1e-9 ? f(k, 2) : "infinite, singular"}`, null, "t");
    s += tx(400, 250, "blue dot: least squares, or pinv", null) + tx(400, 268, "purple dashes: ridge path", null) + tx(400, 286, "gray circle: radius ‖w(λ)‖", null);
    fig.innerHTML = svg(330, s);
    $("l19j").innerHTML = ML.readout([["w at λ = 0", dup ? "(0.9917, 0.9917), pinv" : "(1.4500, 0.6400)"], ["w now", `(${f(W[0], 4)}, ${f(W[1], 4)})`]]);
  };
  $("l19r").oninput = u; ctl.querySelectorAll("button[data-u]").forEach(b => b.onclick = () => { dup = +b.dataset.u; u(); }); u();
}},

{s: "8. L1 and sparse weights", t: "An L1 penalty sets small weights exactly to zero, L2 only shrinks them",
intu: String.raw`Replace the squared weights by their absolute values, λ Σ |wⱼ|, and you get the lasso. The difference shows most clearly when the features are orthonormal, XᵀX = I, so each weight can be solved alone from its least squares value z. Ridge divides every z by 1 + λ: everything shrinks, nothing reaches zero. Lasso subtracts λ from |z| and stops at zero: small weights vanish and large ones move by a fixed amount. Move λ and count the zeros. Lasso therefore selects features. This is the L1 penalty on the weights. It has nothing to do with the L1 loss of Lesson 18, which weighs residuals, as HW7 Task 2.4 insists.`,
eq: String.raw`\[ \text{ridge: } \min_{\mathbf w}\ \tfrac{1}{2}\|\mathbf y - X\mathbf w\|^2 + \tfrac{\lambda}{2}\|\mathbf w\|_2^2 \ \Rightarrow \ w_j = \frac{z_j}{1 + \lambda} \]
\[ \text{lasso: } \min_{\mathbf w}\ \tfrac{1}{2}\|\mathbf y - X\mathbf w\|^2 + \lambda\|\mathbf w\|_1 \ \Rightarrow \ w_j = \mathrm{sign}(z_j)\max\left(|z_j| - \lambda, 0\right) \]`,
sym: [[String.raw`\(z_j\)`, "least squares weight, with orthonormal features z = Xᵀy"], [String.raw`\(\|\mathbf w\|_1\)`, "sum of absolute weights, the L1 norm"], ["soft threshold", "shift toward zero by λ, then clip at zero"], ["sparse", "many weights exactly zero, the model uses few features"], ["L1 loss", "absolute error on residuals, a different thing entirely"]],
how: ["Fit least squares to get z, here with orthonormal features.", "Ridge: divide each weight by 1 + λ.", "Lasso: shrink each |weight| by λ, set it to zero if it would cross zero.", "Count the zero weights: the features the lasso dropped.", "For correlated features there is no closed form, use sklearn's Lasso or coordinate descent."],
say: String.raw`An L1 penalty on the weights soft thresholds them, subtracting lambda from each magnitude and setting small weights exactly to zero, so it selects features, while an L2 penalty only scales every weight toward zero.`,
num: String.raw`z = (2.5, −1.2, 0.6, 0.25, −0.1). λ = 0.5: ridge (1.667, −0.8, 0.4, 0.167, −0.067), no zeros, lasso (<b>2.0, −0.7, 0.1, 0, 0</b>), two zeros. λ = 1: lasso (<b>1.5, −0.2, 0, 0, 0</b>), three zeros.`,
r(fig, ctl) {
  const Z = [2.5, -1.2, 0.6, 0.25, -0.1];
  ctl.innerHTML = sl("l19s", "λ", 0, 3, 0.05, 0.5) + `<div id="l19k"></div>`;
  const u = () => {
    const lam = +$("l19s").value; $("l19sv").textContent = f(lam, 2);
    const R = Z.map(z => z / (1 + lam)), L1 = Z.map(z => Math.sign(z) * Math.max(Math.abs(z) - lam, 0));
    const a = ML.axes(50, 20, 260, 260, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "least squares weight z", yl: "regularized weight", grid: false });
    const E = range(-3, 3, 241);
    let s = a.s + ML.path(E.map(z => [a.X(z), a.Y(z)]), C.gray, 1.2, "4 4") + ML.path(E.map(z => [a.X(z), a.Y(z / (1 + lam))]), C.blue, 2.2) + ML.path(E.map(z => [a.X(z), a.Y(Math.sign(z) * Math.max(Math.abs(z) - lam, 0))]), C.coral, 2.2);
    if (lam > 0) s += `<rect x="${a.X(-lam)}" y="20" width="${a.X(lam) - a.X(-lam)}" height="260" fill="${C.coral}" opacity="0.08"/>`;
    const bx = 360, y0 = 150, sc = 40, bw = 16;
    s += `<line x1="${bx}" y1="${y0}" x2="${bx + 5 * 60}" y2="${y0}" stroke="var(--p)"/>`;
    Z.forEach((z, j) => { const x = bx + 8 + j * 60; [[z, "none", "var(--p)"], [R[j], C.blue, C.blue], [L1[j], C.coral, C.coral]].forEach(([v, fill, st], q) => { const h = v * sc; s += `<rect x="${x + q * (bw + 1)}" y="${h > 0 ? y0 - h : y0}" width="${bw}" height="${Math.max(0.5, Math.abs(h))}" fill="${fill}" stroke="${st}" opacity="${q ? 0.8 : 1}"/>`; }); s += tx(x + 25, 280, "w" + (j + 1), "middle"); if (L1[j] === 0) s += tx(x + 42, y0 - 6, "0", "middle", "th"); });
    s += tx(360, 30, "outline: z, blue: ridge, coral: lasso", null, "t");
    const zr = L1.filter(v => v === 0).length;
    fig.innerHTML = svg(326, s);
    $("l19k").innerHTML = ML.readout([["ridge", R.map(v => f(v, 3)).join(", ")], ["lasso", L1.map(v => f(v, 3)).join(", ")], ["lasso zeros", zr + " of 5"]]);
  };
  $("l19s").oninput = u; u();
}},

{s: "9. Choosing λ on validation", t: "Sweep λ, pick it on the validation set, then open the test set once",
intu: String.raw`λ is a hyperparameter, so it is chosen like the degree: fit with each candidate on the training set, score on the validation set, keep the best. Ng's plot of the two errors against λ is the mirror image of the plot against degree. Small λ is high capacity: low training error, high validation error. Large λ is low capacity: both errors high. Here the validation minimum is at λ = 10⁻⁴. Only now open the test set, once, for the frozen choice. Then press the cheat button: had λ been chosen by the test error, the reported number would look better, 0.1036, only because the choice was tuned to those 40 points. HW7 Task 3.2 explains why that number would overstate performance.`,
eq: String.raw`\[ \lambda^\ast = \arg\min_{\lambda \in \Lambda} J_{\text{cv}}\!\left(\mathbf w(\lambda), b(\lambda)\right), \qquad \text{report } J_{\text{test}}\!\left(\mathbf w(\lambda^\ast), b(\lambda^\ast)\right) \text{ once} \]`,
sym: [[String.raw`\(\Lambda\)`, "the candidate grid: 0 and 10⁻⁸ to 10² in half decades"], [String.raw`\(\lambda^\ast\)`, "the value with the lowest validation error"], [String.raw`\(\mathbf w(\lambda)\)`, "weights fitted on the training set with that λ"], ["test once", "the test error of the frozen choice, never used to choose"], ["cheat", "choosing on the test set turns the test error into a training error"]],
how: ["Choose a log-spaced grid of λ values, including 0.", "Fit on the training set for each λ.", "Score each fit on the validation set, without the penalty term.", "Freeze the λ with the lowest validation error.", "Report the test error of that single model, once."],
say: String.raw`Lambda is a hyperparameter chosen by the lowest validation error over a log-spaced grid, after which the test set is used once to report the error of the frozen model.`,
num: String.raw`Degree 9. λ = 0: validation 0.762. Best on validation: λ = <b>10⁻⁴</b>, validation <b>0.1099</b>, train 0.0156. Test once: <b>0.1087</b>. Chosen by test instead: λ = 0.0032, test 0.1036, an optimistic number. For comparison degree 3 without penalty: validation 0.0989, test 0.1064.`,
note: String.raw`HW7's optional extension asks for exactly this: add ridge to the polynomial pipeline and choose its strength on validation data, with the test set untouched until the end.`,
r(fig, ctl) {
  let open = 0;
  const xs = RID.map((R, i) => i === 0 ? -9 : Math.log10(R.l)), bi = RID.reduce((b, R, i) => R.va < RID[b].va ? i : b, 0), ti = RID.reduce((b, R, i) => R.te < RID[b].te ? i : b, 0);
  ctl.innerHTML = sl("l19q", "λ index", 0, 21, 1, bi) + btns([[0, "test set closed"], [1, "open the test set once"], [2, "cheat: choose λ by test"]], "o") + `<div id="l19m2"></div>`;
  const u = () => {
    pick(ctl, "o", open);
    const k = +$("l19q").value, R = RID[k]; $("l19qv").textContent = "λ = " + lamTxt(R.l);
    const a = ML.axes(60, 20, 400, 250, { xmin: -9, xmax: 2, ymin: -2.5, ymax: 0, nx: 11, ny: 5, fx: v => Math.round(v) === -9 ? "0" : Math.round(v) % 2 === 0 ? "1e" + Math.round(v) : "", fy: v => f(Math.pow(10, v), 3), xl: "λ, log scale (left end: λ = 0)", yl: "MSE, log scale", grid: false });
    let s = a.s + logPath(a, xs, RID.map(R2 => R2.tr), -2.5, 0, C.blue, 2.2) + logPath(a, xs, RID.map(R2 => R2.va), -2.5, 0, C.coral, 2.2);
    if (open) s += logPath(a, xs, RID.map(R2 => R2.te), -2.5, 0, C.teal, 1.6, "5 3");
    s += `<line x1="${a.X(xs[k])}" y1="20" x2="${a.X(xs[k])}" y2="270" stroke="${C.gray}" stroke-dasharray="3 3"/>` + dot(a.X(xs[bi]), a.Y(lg(RID[bi].va)), 7, C.coral, true);
    if (open === 1) s += dot(a.X(xs[bi]), a.Y(lg(RID[bi].te)), 6, C.teal);
    if (open === 2) s += dot(a.X(xs[ti]), a.Y(lg(RID[ti].te)), 6, C.purple);
    s += tx(480, 40, "blue: train, coral: validation", null, "t") + (open ? tx(480, 60, "teal dashes: test", null, "t") : tx(480, 60, "test set still closed", null));
    s += tx(480, 100, `λ = ${lamTxt(R.l)}`, null, "th") + tx(480, 124, `train ${f(R.tr, 4)}`, null, "t") + tx(480, 146, `validation ${f(R.va, 4)}`, null, "t");
    s += tx(480, 184, `chosen: λ = ${lamTxt(RID[bi].l)}`, null, "th");
    if (open === 1) s += tx(480, 208, `test, once: ${f(RID[bi].te, 4)}`, null, "t");
    if (open === 2) s += tx(480, 208, `test-picked λ = ${lamTxt(RID[ti].l)}`, null, "t") + tx(480, 230, `reports ${f(RID[ti].te, 4)}, optimistic`, null, "th");
    fig.innerHTML = svg(310, s);
    $("l19m2").innerHTML = ML.readout([["validation minimum", f(RID[bi].va, 4)], ["Σwⱼ² there", f(RID[bi].w2, 1)]]);
  };
  $("l19q").oninput = u; ctl.querySelectorAll("button[data-o]").forEach(b => b.onclick = () => { open = +b.dataset.o; u(); }); u();
}},

{s: "10. k-fold cross-validation", t: "Rotate the validation role through k folds, then prefer the simpler model within one standard error",
intu: String.raw`One validation split of a few points is noisy, HW7's own diagnosis. k-fold cross-validation uses all the development data: split it into k folds, train on k − 1, score the fold left out, rotate so every fold is held out once, and average. Here 40 points form 5 folds of 8. Click through the folds for one degree and watch the score move: the folds disagree on the best degree, 4, 4, 3, 7 and 5. The average is lowest at degree 6, but the standard error of that average is 0.0145, and degree 3 is within one standard error of the minimum. The one standard error rule picks the simplest such model, degree 3. Then refit it on all 40 points before the single test.`,
eq: String.raw`\[ \mathrm{CV}(d) = \frac{1}{k}\sum_{j=1}^{k} J_{\text{fold } j}(d), \qquad \mathrm{SE}(d) = \frac{s_{\text{folds}}(d)}{\sqrt{k}} \]
\[ \text{choose the simplest } d \text{ with } \mathrm{CV}(d) \le \mathrm{CV}(d_{\min}) + \mathrm{SE}(d_{\min}) \]`,
sym: [["k", "number of folds, 5 here, 5 or 10 in practice"], [String.raw`\(J_{\text{fold } j}\)`, "MSE on fold j of the model trained on the other folds"], [String.raw`\(s_{\text{folds}}\)`, "standard deviation of the k fold scores, with ddof = 1"], ["SE", "standard error of the CV mean"], ["one SE rule", "prefer the simpler model when the difference is within noise"]],
how: ["Set the test set aside first.", "Split the remaining data into k folds, shuffled once with a seed.", "For each candidate and each fold, train on the other folds and score the held-out fold.", "Average the k scores and compute their standard error.", "Choose with the one SE rule, refit on all development data, test once."],
say: String.raw`k-fold cross-validation trains on k minus 1 folds and scores the held-out fold, rotating through all k folds and averaging, which uses all the development data for validation and gives a standard error that shows which differences between candidates are real.`,
num: String.raw`CV means: degree 1 0.394, degree 3 <b>0.0787 ± 0.0129</b>, degree 6 <b>0.0687 ± 0.0145</b>, the lowest, degree 8 0.133. Threshold 0.0687 + 0.0145 = <b>0.0832</b>, so the one SE rule picks degree 3. Per-fold best degrees: 4, 4, 3, 7, 5. Degree 3 refitted on all 40: test <b>0.0961</b>.`,
note: String.raw`The cost is k fits per candidate, plus one final refit. Never fit a scaler or choose features on all the development data before the folds are split, that leaks the held-out fold into training, the trap HW8 Task 3E fragment C shows for a single split.`,
r(fig, ctl) {
  const [X, Y] = draw(7000, 40), K = 5;
  const tr = j => X.map((_, i) => i).filter(i => Math.floor(i / 8) !== j), te = j => X.map((_, i) => i).filter(i => Math.floor(i / 8) === j);
  const FS = []; for (let d = 0; d <= 9; d++) { const sc = []; for (let j = 0; j < K; j++) { const I = tr(j), O = te(j), th = fit(I.map(i => X[i]), I.map(i => Y[i]), d, 0); sc.push(mseOf(th, O.map(i => X[i]), O.map(i => Y[i]))); } const mu = mean(sc), sd = Math.sqrt(sc.reduce((s, v) => s + (v - mu) ** 2, 0) / (K - 1)); FS.push({ sc, mu, se: sd / Math.sqrt(K) }); }
  const dmin = FS.reduce((b, F, i) => F.mu < FS[b].mu ? i : b, 0), thr = FS[dmin].mu + FS[dmin].se, d1 = FS.findIndex(F => F.mu <= thr);
  let fold = 0;
  ctl.innerHTML = btns([0, 1, 2, 3, 4].map(j => [j, "fold " + (j + 1)]), "j") + sl("l19c2", "degree d", 0, 9, 1, 3) + `<div id="l19n"></div>`;
  const u = () => {
    pick(ctl, "j", fold);
    const d = +$("l19c2").value; $("l19c2v").textContent = d;
    const I = tr(fold), O = te(fold), th = fit(I.map(i => X[i]), I.map(i => Y[i]), d, 0);
    const a = ML.axes(50, 20, 260, 220, { xmin: 0, xmax: 1, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "y", grid: false });
    let s = a.s + I.map(i => dot(a.X(X[i]), a.Y(Y[i]), 3.5, C.gray)).join("") + O.map(i => dot(a.X(X[i]), a.Y(Y[i]), 5, C.coral)).join("") + fcurve(a, x => pr(th, x), -2, 2, C.blue, 2.2);
    for (let j = 0; j < K; j++) s += `<rect x="${50 + j * 52}" y="290" width="48" height="16" rx="3" fill="${j === fold ? C.coral : C.gray}" opacity="${j === fold ? 0.8 : 0.35}"/>` + tx(74 + j * 52, 302, "fold " + (j + 1), "middle");
    const b = ML.axes(380, 20, 270, 220, { xmin: -0.5, xmax: 9.5, ymin: 0, ymax: 0.8, nx: 10, ny: 4, fx: () => "", fy: v => f(v, 1), xl: "degree d", yl: "CV mean MSE", grid: false });
    s += b.s;
    FS.forEach((F, i) => { const top = Math.min(0.8, F.mu); s += `<rect x="${b.X(i) - 9}" y="${b.Y(top)}" width="18" height="${b.Y(0) - b.Y(top)}" fill="${i === d1 ? C.teal : i === dmin ? C.purple : C.blue}" opacity="${i === d ? 0.95 : 0.55}"/>` + `<line x1="${b.X(i)}" y1="${b.Y(Math.min(0.8, F.mu + F.se))}" x2="${b.X(i)}" y2="${b.Y(Math.max(0, F.mu - F.se))}" stroke="var(--p)" stroke-width="1.4"/>` + tx(b.X(i), 256, i, "middle"); });
    s += `<line x1="${b.X(-0.5)}" y1="${b.Y(thr)}" x2="${b.X(9.5)}" y2="${b.Y(thr)}" stroke="${C.teal}" stroke-dasharray="4 3"/>` + tx(b.X(9.4), b.Y(thr) - 6, "min + 1 SE", "end");
    s += tx(380, 300, "purple: lowest mean, teal: one SE pick", null);
    fig.innerHTML = svg(316, s);
    $("l19n").innerHTML = ML.readout([[`fold ${fold + 1} MSE, degree ${d}`, f(FS[d].sc[fold], 4)], ["all 5 folds", FS[d].sc.map(v => f(v, 3)).join(", ")], ["CV mean ± SE", f(FS[d].mu, 4) + " ± " + f(FS[d].se, 4)]]);
  };
  $("l19c2").oninput = u; ctl.querySelectorAll("button[data-j]").forEach(bt => bt.onclick = () => { fold = +bt.dataset.j; u(); }); u();
}},

{s: "11. Early stopping", t: "Watch the validation error during training and keep the best checkpoint",
intu: String.raw`Training itself can be the regularizer. Run plain gradient descent on the degree 9 model from all-zero weights with α = 1, safely below the stability edge 2/μmax = 1.649. The well-determined directions of the cost are learned in a few steps, the poorly determined ones, the wild high-order wiggles, need millions, because their curvature is tiny. Stopping early therefore acts like ridge with a λ that shrinks as training goes on. The validation curve is not a clean U: it dips at step 24, rises, then reaches its real minimum near step 178,000, before climbing to the least squares value 0.762. A patience of a few checkpoints would have stopped at the first dip. HW8 Task 2C keeps a deep copy of the best state and restores it at the end.`,
eq: String.raw`\[ \boldsymbol\theta_{k+1} = \boldsymbol\theta_k - \frac{\alpha}{m}X^\top\left(X\boldsymbol\theta_k - \mathbf y\right), \qquad k^\ast = \arg\min_k J_{\text{cv}}(\boldsymbol\theta_k) \]
\[ \text{along eigenvector } j: \ 1 - \left(1 - \alpha\mu_j\right)^k \text{ of the least squares component is learned after } k \text{ steps} \]`,
sym: [["k", "number of gradient steps, a log axis from 1 to 10⁹"], [String.raw`\(\mu_j\)`, "eigenvalues of XᵀX/m, from 1.21 down to 9 × 10⁻⁸"], [String.raw`\(k^\ast\)`, "the checkpoint with the lowest validation error"], ["patience", "how many checkpoints without improvement before you stop"], ["deepcopy", "the saved dictionary holds live tensors, copy it or the best checkpoint changes with training"]],
how: ["Evaluate the validation loss at regular checkpoints during training.", "When it improves, save <code>copy.deepcopy(model.state_dict())</code>.", "Allow generous patience, validation curves can dip and rise more than once.", "At the end, load the saved state and confirm its validation loss.", "Report the test error of the restored model, once."],
say: String.raw`Early stopping monitors the validation error during training and keeps the checkpoint where it is lowest, which regularizes because gradient descent learns the poorly determined directions of the weights last.`,
num: String.raw`α = 1, 2/μmax = <b>1.649</b>. Validation: step 1 0.388, step 24 <b>0.1523</b> (first dip), step 133 0.2025, best step <b>177,828</b> with <b>0.1082</b> and test 0.1124, after 10⁸ steps 0.7617, the degree 9 least squares value. HW8: width 50 best epoch <b>809</b> of 1500, validation 0.1639 against 0.1678 at the end, test 0.1373.`,
note: String.raw`In HW8 the best checkpoint was not the last epoch, and the solution checks that the saved state survives later updates. <code>best = model.state_dict()</code> without deepcopy restores the final weights and silently throws early stopping away.`,
r(fig, ctl) {
  const d = 9, m = 12, A = XT.map(x => row(x, d)), P = d + 1;
  const mm = (U, V) => U.map(r => V[0].map((_, j) => r.reduce((s, v, k) => s + v * V[k][j], 0))), mv = (U, v) => U.map(r => r.reduce((s, x, k) => s + x * v[k], 0));
  const H = [], g = []; for (let i = 0; i < P; i++) { H.push([]); g.push(A.reduce((s, r, q) => s + r[i] * YT[q], 0) / m); for (let j = 0; j < P; j++) H[i].push(A.reduce((s, r) => s + r[i] * r[j], 0) / m); }
  const M0 = H.map((r, i) => r.map((v, j) => (i === j ? 1 : 0) - v)), PW = [[M0, g.slice()]];
  for (let j = 0; j < 31; j++) { const [Mj, cj] = PW[j]; PW.push([mm(Mj, Mj), mv(Mj, cj).map((v, i) => v + cj[i])]); }
  const at = k => { let th = Array(P).fill(0), j = 0; while (k > 0) { if (k % 2 === 1) { const [Mj, cj] = PW[j]; th = mv(Mj, th).map((v, i) => v + cj[i]); } k = Math.floor(k / 2); j++; } return th; };
  const KS = []; for (let j = 0; j <= 72; j++) { const k = Math.round(Math.pow(10, j / 8)); if (!KS.includes(k)) KS.push(k); }
  const CK = KS.map(k => { const th = at(k); return { k, th, tr: mseOf(th, XT, YT), va: mseOf(th, XV, YV), te: mseOf(th, XS, YS) }; });
  const bi = CK.reduce((b, c, i) => c.va < CK[b].va ? i : b, 0);
  let li = 0; for (let i = 1; i < CK.length - 1; i++) if (CK[i].va < CK[i - 1].va && CK[i].va < CK[i + 1].va) { li = i; break; }
  ctl.innerHTML = sl("l19es", "checkpoint", 0, CK.length - 1, 1, 12) + btns([[li, "first dip"], [bi, "best checkpoint"], [CK.length - 1, "train to the end"]], "z") + `<div id="l19o"></div>`;
  const u = () => {
    const i = +$("l19es").value, c = CK[i]; $("l19esv").textContent = "step " + c.k.toLocaleString("en-US");
    const a = ML.axes(50, 20, 240, 230, { xmin: 0, xmax: 1, ymin: -2, ymax: 2, nx: 5, ny: 4, fx: v => f(v, 1), fy: v => v, xl: "x", yl: "y", grid: false });
    let s = a.s + fcurve(a, truth, -2, 2, C.gray, 1.4, "5 4") + dataPts(a, 1) + fcurve(a, x => pr(c.th, x), -2, 2, C.coral, 2.4);
    const b = ML.axes(370, 20, 280, 230, { xmin: 0, xmax: 9, ymin: -2.5, ymax: 0, nx: 9, ny: 5, fx: v => "1e" + v, fy: v => f(Math.pow(10, v), 3), xl: "gradient steps k, log scale", yl: "MSE, log scale", grid: false });
    const lx = CK.map(q => Math.log10(q.k));
    s += b.s + logPath(b, lx, CK.map(q => q.tr), -2.5, 0, C.blue, 2) + logPath(b, lx, CK.map(q => q.va), -2.5, 0, C.coral, 2);
    s += `<line x1="${b.X(lx[i])}" y1="20" x2="${b.X(lx[i])}" y2="250" stroke="${C.gray}" stroke-dasharray="3 3"/>` + dot(b.X(lx[bi]), b.Y(lg(CK[bi].va)), 7, C.teal, true) + dot(b.X(lx[li]), b.Y(lg(CK[li].va)), 6, C.purple, true);
    s += tx(370, 308, "blue: train, coral: validation", null) + tx(370, 326, "purple ring: first dip, teal ring: best", null);
    s += tx(50, 308, `step ${c.k.toLocaleString("en-US")}: train ${f(c.tr, 4)}`, null, "t") + tx(50, 328, `validation ${f(c.va, 4)}`, null, "t");
    fig.innerHTML = svg(340, s);
    $("l19o").innerHTML = ML.readout([["best step", CK[bi].k.toLocaleString("en-US")], ["best validation", f(CK[bi].va, 4)], ["its test, once", f(CK[bi].te, 4)]]);
  };
  $("l19es").oninput = u; ctl.querySelectorAll("button[data-z]").forEach(bt => bt.onclick = () => { $("l19es").value = bt.dataset.z; u(); }); u();
}},

{s: "12. With the agent", t: "Do it with the agent: a tested regularization module",
intu: String.raw`This lesson as one tested module: polynomial features on a common scale, ridge with an unpenalized intercept by an augmented least squares solve, the regularized gradient step, soft thresholding, k-fold scores with the one SE rule, and an early stopping helper that deep-copies its best state. The tests pin numbers from these cards that need no random data, so a penalized intercept, a missing ½ or a shallow copy fails on a value you can check here.`,
eq: String.raw`\[ \texttt{ridge\_fit} \to \texttt{reg\_gd\_step} \to \texttt{soft\_threshold} \to \texttt{kfold\_scores} \to \texttt{EarlyStopper} \]`,
sym: [["ridge fit", "solves (XᵀX + λL)θ = Xᵀy with L = diag(0, 1, ..., 1)"], ["reg gd step", "Ng's update with the shrink factor, no penalty on b"], ["soft threshold", "the lasso solution for orthonormal features"], ["kfold scores", "mean, SE and the one SE choice"], ["EarlyStopper", "deep copy of the best model state, configurable patience"]],
how: ["Paste the command.", "Read <code>ridge_fit</code>: is the first diagonal entry of the penalty zero?", "Read <code>EarlyStopper</code>: does it call <code>copy.deepcopy</code>?", "Run the tests.", "Commit the module with its tests."],
say: String.raw`A regularization module implements ridge with an unpenalized intercept, the regularized gradient step, soft thresholding, k-fold scoring with the one standard error rule and a deep-copying early stopper, and its tests pin values from the lesson.`,
num: String.raw`Tests expect w = (<b>1.2279, 0.7837</b>) at λ = 1 and (0.9917, 0.9917) for the duplicated column as λ goes to 0, the hand update <b>1.1167</b> and b = 0.1, lasso (2.0, −0.7, 0.1, 0, 0) at λ = 0.5, and the one SE rule choosing degree 3 from the card 10 table.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/regularization.py with numpy and torch. ridge_fit(X, y, lam) that prepends a column of ones and solves (A^T A + lam * L) theta = A^T y with L = diag(0, 1, ..., 1), returning (b, w), by np.linalg.solve, and by np.linalg.pinv when lam == 0. reg_gd_step(w, b, x, y, alpha, lam) for one feature using Ng's cost (1/2m) sum err^2 + lam/(2m) w^2: w gets the penalty gradient lam/m * w, b does not. soft_threshold(z, lam) = sign(z) * max(|z| - lam, 0). kfold_scores(scores) taking an array of shape (n_candidates, k) and returning means, standard errors with ddof=1, the argmin and the one standard error choice (the smallest index whose mean is at most min mean + its SE). class EarlyStopper(patience) with step(val_loss, model) that stores copy.deepcopy(model.state_dict()) on improvement and returns True when patience runs out, and restore(model). Create tests/test_regularization.py with pytest: ridge_fit on x1 = [-2,-1,-1,0,1,1,2], x2 = [-2,-1,0,0,0,1,2], y = [-4.1,-2.3,-1.5,0,1.4,2.6,3.9] gives w close to (1.4500, 0.6400) at lam 0, (1.2279, 0.7837) at lam 1 and b close to 0; with x2 = x1 it gives (0.9520, 0.9520) at lam 1 and (0.9917, 0.9917) at lam 0; reg_gd_step(1.0, 0.0, [1,2,3], [2,2.5,4.5], 0.1, 3.0) returns (1.11667, 0.1) and with lam 0 returns w 1.21667; soft_threshold([2.5,-1.2,0.6,0.25,-0.1], 0.5) is [2.0,-0.7,0.1,0,0]; kfold_scores on means [0.6899,0.3940,0.4664,0.0787,0.0748,0.0706,0.0687,0.0770,0.1332,0.0938] built from fold arrays gives argmin 6 and one SE choice 3 (build each row as mean plus offsets that give the SEs 0.0129 for row 3 and 0.0145 for row 6); EarlyStopper on a tiny nn.Linear restores the weights saved at the best step, not the last. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "........                                                 [100%]", "8 passed in 1.17s"],
    checks: ["the penalty matrix has 0 in the intercept position, so b is never shrunk", "reg_gd_step applies lam/m * w to w only and matches 1.11667", "EarlyStopper uses copy.deepcopy and a test changes the model after saving", "kfold_scores uses ddof=1 for the fold standard deviation", "no test set appears anywhere in the selection code"]
  });
}},

{s: "13. Test", t: "Lesson 19 test: overfitting and regularization",
intu: String.raw`Twelve questions on diagnosing bias and variance, the decomposition, learning curves, the regularized cost and update, ridge and lasso, cross-validation and early stopping.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to the Part 4 test.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A model has training MSE 0.02, validation MSE 0.45, and the baseline is 0.05. The main problem is", o: ["high bias", "high variance", "both high bias and high variance", "neither, the model is fine"], a: 1, why: "The training error is at the baseline, so bias is small, and the validation error is far above the training error, a large variance gap. Card 2." },
    { q: "Training MSE 0.40, validation MSE 0.42, baseline 0.05. Which change is most likely to help?", o: ["collect more training data", "raise λ", "add features or polynomial terms, or lower λ", "use fewer features"], a: 2, why: "Both errors sit far above the baseline and close together: high bias. More data, a larger λ and fewer features all fight variance. Cards 2 and 4." },
    { q: String.raw`At some x, the squared bias is 0.02, the variance across training sets is 0.05 and the noise variance is 0.09. The expected squared error on a new point there is`, o: ["0.07", "0.16", "0.11", "0.0441"], a: 1, why: "Bias² + variance + noise = 0.02 + 0.05 + 0.09 = 0.16. Card 3." },
    { q: String.raw`With m = 4, the sum of squared errors is 2.0, w = (1, −2), b = 3 and λ = 0.8. Ng's regularized cost \(J\) is`, o: ["0.75", "1.65", "0.25", "0.70"], a: 0, why: String.raw`\(\frac{2.0}{2\cdot 4} + \frac{0.8}{2\cdot 4}(1 + 4) = 0.25 + 0.5 = 0.75\). b is not penalized, including b² = 9 would give 1.65. Card 5.` },
    { q: "Regularized gradient descent with α = 0.05, λ = 10 and m = 20 multiplies each weight on every step by", o: ["0.5", "0.95", "1.025", "0.975"], a: 3, why: "The shrink factor is 1 − αλ/m = 1 − 0.05 · 10/20 = 0.975. Card 6." },
    { q: "In PyTorch, SGD(lr=0.1, weight_decay=0.01) updates a weight of 2.0 whose loss gradient is 0.3 to", o: ["1.968", "1.970", "1.998", "1.770"], a: 0, why: "weight_decay adds 0.01 · 2.0 = 0.02 to the gradient: 2.0 − 0.1(0.3 + 0.02) = 1.968. Card 6 note." },
    { q: String.raw`One centered feature with \(\sum x^2 = 8\) and \(\sum xy = 12\). Least squares gives w = 1.5. Ridge with λ = 4 gives`, o: ["1.0", "0.375", "1.5", "3.0"], a: 0, why: "w = Σxy/(Σx² + λ) = 12/(8 + 4) = 1.0. Card 7." },
    { q: "With orthonormal features and least squares weights z = (1.8, −0.4, 0.9), the lasso with λ = 0.5 gives", o: ["(1.2, −0.267, 0.6)", "(1.3, −0.4, 0.4)", "(1.3, 0, 0.4)", "(1.8, 0, 0.9)"], a: 2, why: "Soft thresholding subtracts 0.5 from each magnitude and stops at zero: 1.3, 0, 0.4. The first option is ridge, z/1.5. Card 8." },
    { q: "5-fold CV gives degree 7 a mean of 0.090 with standard error 0.010, and degree 4 a mean of 0.097 with standard error 0.012. The one standard error rule chooses", o: ["degree 7, it has the lowest mean", "degree 4, its mean is within 0.090 + 0.010", "neither, the means differ", "degree 4, because its SE is larger"], a: 1, why: "The threshold is 0.090 + 0.010 = 0.100 and degree 4's 0.097 is below it, so the simpler model wins. Card 10." },
    { q: "A learning curve shows training and validation errors meeting at 0.31 as m grows, with a baseline of 0.05. Doubling the training set will most likely", o: ["bring the validation error close to 0.05", "raise both errors a lot", "make the model overfit", "change little"], a: 3, why: "Converged curves far above the baseline mean high bias. More data cannot fix a model that cannot fit the pattern. Card 4." },
    { q: "An early stopping loop saves best = model.state_dict() when the validation loss improves and loads it at the end. The restored model is", o: ["the best checkpoint", "the final weights, because the saved dict holds the live tensors", "random weights", "an error, state_dict cannot be saved"], a: 1, why: "state_dict returns references to the parameter tensors, which keep changing. Use copy.deepcopy. Card 11." },
    { q: "Someone tries 15 values of λ and reports the lowest test error among them. That number is", o: ["optimistic, because λ was chosen on the test set", "an unbiased estimate of performance on new data", "pessimistic, because the test set is small", "the same as the validation error"], a: 0, why: "Choosing on the test set makes it part of training. Choose on validation or by CV, then use the test set once. Card 9." }
  ], "Lesson 19 test");
}}
],
summary: String.raw`A model underfits when it lacks the capacity to fit even its training data, high bias, and overfits when it fits the noise, so the training error is low but the validation error high, high variance. Compare the training error with a baseline for bias and the validation error with the training error for variance. Across many training sets the expected error is bias² plus variance plus the noise variance, and capacity trades one for the other. Learning curves show that more data cures variance but not bias. Ng's regularized cost adds λ/(2m) Σ wⱼ², without b, so each gradient step first multiplies the weights by 1 − αλ/m, and the normal equation becomes (XᵀX + λL)θ = Xᵀy, solvable even when XᵀX is singular. An L1 penalty soft thresholds the weights to exact zeros and selects features, unlike the L1 loss. Choose λ and the degree on validation data or by k-fold cross-validation with the one standard error rule, keep the best checkpoint by deep copy when stopping early, and open the test set once.`,
sheet: [[String.raw`\[ J = \frac{1}{2m}\sum_i\left(f(x^{(i)}) - y^{(i)}\right)^2 + \frac{\lambda}{2m}\sum_{j=1}^{n} w_j^2 \]`, "Ng's regularized cost, b not penalized"], [String.raw`\[ w_j := w_j\left(1 - \alpha\tfrac{\lambda}{m}\right) - \alpha\,\tfrac{1}{m}\sum_i e_i x_j^{(i)} \]`, "regularized gradient descent, weight decay"], [String.raw`\[ \left(X^\top X + \lambda L\right)\boldsymbol\theta = X^\top\mathbf y \]`, "ridge normal equation, L = diag(0, 1, ..., 1)"], [String.raw`\[ w_j = \frac{z_j}{1 + \lambda}, \qquad w_j = \mathrm{sign}(z_j)\max(|z_j| - \lambda, 0) \]`, "ridge and lasso with orthonormal features"], [String.raw`\[ \mathbb E\left[(y - \hat f)^2\right] = \text{bias}^2 + \text{variance} + \sigma^2 \]`, "bias and variance decomposition"], [String.raw`\[ \mathrm{CV} = \frac{1}{k}\sum_j J_{\text{fold } j}, \qquad \mathrm{SE} = \frac{s}{\sqrt k} \]`, "k-fold cross-validation and its standard error"]],
sources: ["Andrew Ng, Machine Learning Specialization, course 1, week 3: The problem of overfitting, Addressing overfitting, Cost function with regularization, Regularized linear regression", "Andrew Ng, Machine Learning Specialization, course 2, week 3: Diagnosing bias and variance, Regularization and bias and variance, Establishing a baseline level of performance, Learning curves, Deciding what to try next", "Andrew Ng, CS229 lecture notes: Regularization and model selection (cross-validation, feature selection)", "AME 5970 syllabus, week 4 (regularization) and week 6 (overfitting and underfitting), topic order (no lecture notes for these weeks were in the course export)", "AME 5970 HW7 questions and solutions doc, Part 3 (degree selection on validation, select once then test, Task 3.4 diagnosis) and the optional ridge extension", "AME 5970 HW8 questions and solutions doc, Part 2 (baseline, capacity 3H + 1 parameters, validation checkpoints with deepcopy, best epoch 809, test once)", "Hastie, Tibshirani and Friedman, The Elements of Statistical Learning, sections 3.4 (ridge and lasso) and 7.10 (cross-validation, the one standard error rule)", "R. Tibshirani, Regression shrinkage and selection via the lasso, JRSS B, 1996", "Goodfellow, Bengio and Courville, Deep Learning, sections 7.1 (parameter norm penalties) and 7.8 (early stopping as L2 regularization)", "PyTorch documentation: torch.optim.SGD weight_decay"]
});
})();
