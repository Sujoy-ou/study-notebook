(function () {
/* ML shelf, Part 4, Lesson 20: the Part 4 test. A map, a formula drill, four scored sections of eight questions over Lessons 15 to 19, a nine-part board problem with worked solutions on one fresh dataset, a score sheet, and the agent card. The question style follows the hand calculations of AME 5970 HW3 (cost, gradient, normal equation), HW5 (learning rates, least squares), HW6 (batches, validation, standardization), HW7 Parts 2 and 3 (likelihood, Huber, degree selection) and HW8 Part 2 (capacity, checkpoints). Every number was computed with NumPy before it was written here. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const dot = (x, y, r, col, hollow) => hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="1.6"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const SEC = [["A. Linear regression", "Lesson 15", [15]], ["B. Gradient descent and scaling", "Lessons 16 and 17", [16, 17]], ["C. Losses from probability", "Lesson 18", [18]], ["D. Overfitting and regularization", "Lesson 19", [19]]];
const LESS = { 15: "Linear regression", 16: "Gradient descent", 17: "Feature scaling", 18: "Losses from probability", 19: "Overfitting and regularization" };
const TOPIC = {
  15: ["cost J with ½", "design matrix", "normal equation", "projection", "pinv", "R² and baseline"],
  16: ["the update rule", "α below 2/λmax", "factor 1 − αλ", "batches and epochs", "weighted epoch loss", "zero_grad"],
  17: ["units are curvature", "standardize", "training rows only", "correlation κ", "back to raw units"],
  18: ["MSE and MAE", "Gaussian MLE", "median and mean", "Huber", "SmoothL1", "residual diagnosis"],
  19: ["bias and variance", "regularized cost", "weight decay", "ridge", "lasso", "CV and one SE", "early stopping"]
};

/* ---------- the board problem data: x = 0..4, five readings ---------- */
const BX = [0, 1, 2, 3, 4], BY = [1.0, 2.4, 3.1, 4.9, 5.6], BM = 5;
const sol2 = (A, b) => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [(A[1][1] * b[0] - A[0][1] * b[1]) / d, (-A[1][0] * b[0] + A[0][0] * b[1]) / d]; };
const sums = Y => { let sx = 0, sxx = 0, sy = 0, sxy = 0; BX.forEach((x, i) => { sx += x; sxx += x * x; sy += Y[i]; sxy += x * Y[i]; }); return { sx, sxx, sy, sxy }; };
const S0 = sums(BY), XTX = [[BM, S0.sx], [S0.sx, S0.sxx]], XTY = [S0.sy, S0.sxy];
const TH = sol2(XTX, XTY);
const res = (th, Y) => BX.map((x, i) => th[0] + th[1] * x - Y[i]);
const SSE = res(TH, BY).reduce((s, e) => s + e * e, 0), YBAR = S0.sy / BM, SST = BY.reduce((s, y) => s + (y - YBAR) ** 2, 0);
const G0 = [-S0.sy / BM, -S0.sxy / BM], ALPHA = 0.05, TH1 = [-ALPHA * G0[0], -ALPHA * G0[1]];
const Jof = (th, Y) => res(th, Y || BY).reduce((s, e) => s + e * e, 0) / (2 * BM);
const HB = [[1, S0.sx / BM], [S0.sx / BM, S0.sxx / BM]], TRH = HB[0][0] + HB[1][1], DETH = HB[0][0] * HB[1][1] - HB[0][1] ** 2;
const LMAX = TRH / 2 + Math.sqrt(TRH * TRH / 4 - DETH), LMIN = TRH / 2 - Math.sqrt(TRH * TRH / 4 - DETH);
const MU = S0.sx / BM, SD = Math.sqrt(S0.sxx / BM - MU * MU);
const RID = sol2([[BM, S0.sx], [S0.sx, S0.sxx + 2]], XTY);
const BYO = BY.slice(); BYO[4] = 9.6;
const SO = sums(BYO), THO = sol2(XTX, [SO.sy, SO.sxy]);
/* Huber fit, delta = 1, by iteratively reweighted least squares (Lesson 18 card 9) */
const huberFit = (Y, d) => { let th = sol2(XTX, [sums(Y).sy, sums(Y).sxy]); for (let it = 0; it < 300; it++) { const r = res(th, Y), w = r.map(e => Math.abs(e) <= d ? 1 : d / Math.abs(e)); let a = 0, b = 0, c = 0, p = 0, q = 0; BX.forEach((x, i) => { a += w[i]; b += w[i] * x; c += w[i] * x * x; p += w[i] * Y[i]; q += w[i] * x * Y[i]; }); th = sol2([[a, b], [b, c]], [p, q]); } return th; };
const THH = huberFit(BYO, 1);
ML.L20 = { BX, BY, TH, SSE, TH1, LMAX, LMIN, RID, THO, THH };

const BOARD = [
  { t: "Design matrix", q: String.raw`Five readings: x = 0, 1, 2, 3, 4 and y = 1.0, 2.4, 3.1, 4.9, 5.6. Fit \(h_\theta(x) = \theta_0 + \theta_1 x\). Write the design matrix \(X\) and compute \(X^\top X\) and \(X^\top\mathbf y\).`,
    a: String.raw`Each row of \(X\) is \((1, x_i)\), so \(X\) is 5 by 2. Then \(X^\top X = \begin{bmatrix} m & \sum x \\ \sum x & \sum x^2\end{bmatrix} = \begin{bmatrix} 5 & 10 \\ 10 & 30\end{bmatrix}\) and \(X^\top\mathbf y = (\sum y, \sum xy) = (17.0, 45.7)\), with \(\sum xy = 0 + 2.4 + 6.2 + 14.7 + 22.4\).` },
  { t: "Normal equation", q: String.raw`Solve \(X^\top X\,\boldsymbol\theta = X^\top\mathbf y\) by hand.`,
    a: String.raw`The determinant is \(5\cdot 30 - 10\cdot 10 = 50\). \(\theta_0 = (30\cdot 17 - 10\cdot 45.7)/50 = 53/50 = 1.06\) and \(\theta_1 = (-10\cdot 17 + 5\cdot 45.7)/50 = 58.5/50 = 1.17\). Check the first equation: \(5(1.06) + 10(1.17) = 17.0\).` },
  { t: "Cost and R²", q: String.raw`At \(\boldsymbol\theta = (1.06, 1.17)\) compute the residuals, Ng's cost \(J = \frac{1}{2m}\sum e_i^2\) and \(R^2\).`,
    a: String.raw`Predictions 1.06, 2.23, 3.40, 4.57, 5.74, residuals \(e = h - y\) = 0.06, −0.17, 0.30, −0.33, 0.14. They sum to 0, as they must with an intercept column. SSE = 0.251, so \(J = 0.251/10 = 0.0251\). With \(\bar y = 3.4\), SST = 13.94 and \(R^2 = 1 - 0.251/13.94 = 0.982\).` },
  { t: "Noise model", q: String.raw`Assume Gaussian noise. What is the maximum likelihood \(\sigma\)? Compare the RMSE and the MAE.`,
    a: String.raw`\(\hat\sigma^2 = \mathrm{SSE}/m = 0.251/5 = 0.0502\), so \(\hat\sigma = 0.224\), which is exactly the RMSE. The MAE is \((0.06 + 0.17 + 0.30 + 0.33 + 0.14)/5 = 0.200\), a little below the RMSE, as it always is.` },
  { t: "One gradient step", q: String.raw`Start at \(\boldsymbol\theta = (0, 0)\) with \(\alpha = 0.05\). Take one batch gradient descent step on Ng's \(J\).`,
    a: String.raw`At zero every error is \(-y_i\). \(\partial J/\partial\theta_0 = \frac1m\sum e_i = -17/5 = -3.4\) and \(\partial J/\partial\theta_1 = \frac1m\sum e_i x_i = -45.7/5 = -9.14\). The step gives \(\boldsymbol\theta = (0.17, 0.457)\) and the cost falls from 7.174 to 3.215.` },
  { t: "Stable learning rate", q: String.raw`The curvature matrix of \(J\) is \(H = \frac1m X^\top X\). Find its eigenvalues, the largest stable \(\alpha\), and the per-step factors at \(\alpha = 0.05\).`,
    a: String.raw`\(H = \begin{bmatrix} 1 & 2 \\ 2 & 6\end{bmatrix}\), trace 7, determinant 2, so \(\lambda = (7 \pm \sqrt{41})/2\) = 6.702 and 0.298. Stable for \(\alpha \lt 2/6.702 = 0.298\). At \(\alpha = 0.05\) the errors shrink by \(1 - \alpha\lambda\) = 0.665 and 0.985 per step, so the soft direction is slow. The condition number is 22.5.` },
  { t: "Standardize first", q: String.raw`Standardize x with its mean and population standard deviation. What happens to \(H\), the condition number and \(\boldsymbol\theta\)?`,
    a: String.raw`\(\mu = 2\), \(\sigma = \sqrt 2 = 1.414\). The standardized column has mean 0 and variance 1, so \(H = I\), condition number 1, and \(\alpha = 1\) reaches the minimum in one step. The fit is \(\theta' = (3.4, 1.655)\). Back in raw units \(w = 1.655/1.414 = 1.17\) and \(b = 3.4 - 1.17\cdot 2 = 1.06\), the same line.` },
  { t: "Ridge", q: String.raw`Regularize the slope only, Ng's way, with \(\lambda = 2\): solve \((X^\top X + \lambda L)\boldsymbol\theta = X^\top\mathbf y\) with \(L = \mathrm{diag}(0, 1)\).`,
    a: String.raw`The matrix becomes \(\begin{bmatrix} 5 & 10 \\ 10 & 32\end{bmatrix}\), determinant 60. \(\theta_0 = (32\cdot 17 - 10\cdot 45.7)/60 = 1.45\) and \(\theta_1 = (-170 + 228.5)/60 = 0.975\). The slope shrinks from 1.17 and the intercept rises to keep the line near the mean point (2, 3.4).` },
  { t: "One corrupted reading", q: String.raw`The last reading is corrupted from 5.6 to 9.6. Recompute the least squares \(\boldsymbol\theta\) without redoing the whole solve.`,
    a: String.raw`Only \(X^\top\mathbf y\) changes, by \((4, 16)\). \((X^\top X)^{-1} = \frac{1}{50}\begin{bmatrix} 30 & -10 \\ -10 & 5\end{bmatrix}\), so \(\Delta\boldsymbol\theta = \frac{1}{50}(120 - 160, -40 + 80) = (-0.8, 0.8)\) and \(\boldsymbol\theta = (0.26, 1.97)\). The slope jumps by 68 %. A Huber fit with \(\delta = 1\) gives (0.49, 1.74): it helps, but a corrupted point at the end of the range has high leverage.` }
];

/* ---------- the formula drill ---------- */
const FORM = [
  [15, "Ng's cost for linear regression", String.raw`J(\boldsymbol\theta) = \frac{1}{2m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)^2`],
  [15, "The normal equation", String.raw`X^\top X\,\boldsymbol\theta = X^\top\mathbf y`],
  [15, "What least squares makes perpendicular", String.raw`X^\top\left(\mathbf y - X\hat{\boldsymbol\theta}\right) = \mathbf 0`],
  [15, "R² against the mean baseline", String.raw`R^2 = 1 - \frac{\sum_i (y_i - \hat y_i)^2}{\sum_i (y_i - \bar y)^2}`],
  [16, "Batch gradient descent in matrix form", String.raw`\boldsymbol\theta := \boldsymbol\theta - \frac{\alpha}{m}X^\top\left(X\boldsymbol\theta - \mathbf y\right)`],
  [16, "The stability limit on α", String.raw`e_k \to (1 - \alpha\lambda_k)\,e_k, \qquad 0 \lt \alpha \lt \frac{2}{\lambda_{\max}}`],
  [16, "The epoch loss over unequal batches", String.raw`\bar L = \frac{\sum_b n_b L_b}{\sum_b n_b}`],
  [17, "Standardize with training statistics", String.raw`z = \frac{x - \mu_{\text{train}}}{\sigma_{\text{train}}}, \qquad w = \frac{w'}{\sigma}, \quad b = b' - w\mu`],
  [17, "Condition number from correlation", String.raw`\kappa = \frac{1 + |\rho|}{1 - |\rho|}`],
  [18, "Gaussian negative log-likelihood", String.raw`-\log L = m\log\left(\sigma\sqrt{2\pi}\right) + \frac{\mathrm{SSE}}{2\sigma^2}, \qquad \hat\sigma^2 = \frac{\mathrm{SSE}}{m}`],
  [18, "Huber loss", String.raw`L_\delta(e) = \begin{cases} \tfrac12 e^2 & |e| \le \delta \\ \delta\left(|e| - \tfrac12\delta\right) & |e| \gt \delta \end{cases}`],
  [19, "Ng's regularized cost", String.raw`J = \frac{1}{2m}\sum_i\left(f(x^{(i)}) - y^{(i)}\right)^2 + \frac{\lambda}{2m}\sum_{j=1}^{n} w_j^2`],
  [19, "The regularized update", String.raw`w_j := w_j\left(1 - \alpha\frac{\lambda}{m}\right) - \alpha\,\frac1m\sum_i e_i x_j^{(i)}`],
  [19, "Ridge and lasso, orthonormal features", String.raw`w_j = \frac{z_j}{1 + \lambda}, \qquad w_j = \mathrm{sign}(z_j)\max(|z_j| - \lambda, 0)`],
  [19, "Bias and variance", String.raw`\mathbb E\left[(y - \hat f)^2\right] = \text{bias}^2 + \text{variance} + \sigma^2`]
];
ML.L20.BOARD = BOARD; ML.L20.FORM = FORM;

addLesson("ml", "linear", {
level: "Core", num: "Lesson 20",
id: "ml-linear-l20", title: "Part 4 test", short: "20. Part 4 test",
big: String.raw`Thirty-two scored questions over the whole of Part 4, in four sections of eight, plus a board problem in the midterm style. Section A is linear regression, Section B gradient descent and feature scaling, Section C losses from probability, Section D overfitting and regularization. Each section is its own card with its own score, so you can retake the weak one without redoing the rest. Most questions ask for a number you can get on paper in a minute or two, the way HW3, HW5 and HW7 ask: a cost, a normal equation, one gradient step, a stable learning rate, a Huber value, a regularized cost, a one standard error choice. The others ask you to find a bug in a few lines of NumPy or PyTorch, or to name what a pair of errors says about a model. Before the sections there is a formula drill, after them a nine-part board problem on five readings with a worked solution for every part, and a score sheet that tells you which lessons to reopen.`,
bridge: String.raw`Part 4 built one model, the linear model, and everything needed to train it and to trust it: the cost and the normal equation in Lesson 15, gradient descent in Lesson 16, feature scaling in Lesson 17, the losses that come from noise models in Lesson 18, and regularization and model selection in Lesson 19. The midterm covers exactly this ground. Part 5 rebuilds the same pipeline in PyTorch, so a gap here becomes a bug there.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. Map", t: "What the four sections cover",
intu: String.raw`Click a section to see which lessons it draws on and the topics its questions touch. Take the formula drill first if Part 4 is more than a few days behind you, then the sections in order. Each section is scored out of 8 and is passed at 6. The whole test at 26 or above means Part 4 is done. The board problem is not scored. Work it on paper with the solution hidden, then compare line by line.`,
eq: String.raw`\[ 4 \text{ sections} \times 8 \text{ questions} = 32, \qquad \text{pass: } 6 \text{ per section}, \ 26 \text{ overall} \]`,
sym: [["section A", "cost, normal equation, residuals, pinv, R²"], ["section B", "gradient steps, stable α, batches, epoch loss, scaling, κ"], ["section C", "MSE and MAE, Gaussian MLE, median, Huber, SmoothL1"], ["section D", "bias and variance, regularized cost, ridge, lasso, CV, early stopping"], ["board problem", "nine parts on one dataset, worked solutions"]],
how: ["Do the formula drill.", "Take A, B, C, D in order, with paper and no computer.", "Commit to an answer before reading the feedback.", "Work the board problem with each solution hidden.", "Enter your four scores on the score sheet and reopen what it names."],
say: String.raw`Four sections of eight questions over Lessons 15 to 19, pass at six per section and twenty-six overall, plus an unscored board problem with worked solutions.`,
num: String.raw`<b>32</b> scored questions, about <b>50 minutes</b> on a first pass, and about <b>30 minutes</b> for the board problem.`,
note: String.raw`Bring a calculator. The midterm asks for numbers computed by hand from small matrices, so the numbers here are chosen to be done the same way: two by two inverses, sums over five points, one step at a time.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns(SEC.map((s, i) => [i, s[0].slice(0, 1)]), "k") + `<div id="l20mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    const lessons = [15, 16, 17, 18, 19];
    lessons.forEach((L, i) => {
      const x = 20 + i * 130, on = SEC[k][2].includes(L);
      s += `<rect x="${x}" y="24" width="120" height="58" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 60, 48, "Lesson " + L, "middle", "th") + tx(x + 60, 70, LESS[L].replace("Losses from probability", "Losses").replace("Overfitting and regularization", "Regularization"), "middle");
    });
    SEC.forEach((sc, i) => {
      const x = 20 + i * 162, on = i === k;
      s += `<rect x="${x}" y="128" width="152" height="50" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 76, 148, sc[0].split(".")[0] + ". 8 questions", "middle", "th") + tx(x + 76, 166, sc[1], "middle");
      if (on) sc[2].forEach(L => { const xx = 20 + lessons.indexOf(L) * 130 + 60; s += `<line x1="${xx}" y1="84" x2="${x + 76}" y2="126" stroke="${C.teal}" stroke-width="1.4" stroke-dasharray="3 3"/>`; });
    });
    const tops = SEC[k][2].flatMap(L => TOPIC[L]);
    tops.forEach((t, i) => { const col = i % 4, rowi = Math.floor(i / 4), x = 20 + col * 162, y = 206 + rowi * 30; s += `<rect x="${x}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x + 76, y + 16, t, "middle"); });
    const H = 206 + Math.ceil(tops.length / 4) * 30 + 8;
    fig.innerHTML = svg(H, s);
    $("l20mx").innerHTML = `<p class="note"><b>${SEC[k][0]}</b> draws on ${SEC[k][2].map(L => "Lesson " + L + " (" + LESS[L] + ")").join(" and ")}. The grey chips are the topics its eight questions touch.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "1. Formula drill", t: "Fifteen formulas to write from memory before the test",
intu: String.raw`Every section needs a handful of formulas you should be able to write without looking. The drill shows the name of one, you write it on paper, then reveal it and mark yourself honestly. The bar chart counts what you knew per lesson. Run it until every bar is full, then start Section A. If a formula will not stick, the lesson tag says where it was derived, and a derivation is easier to remember than a string of symbols.`,
eq: String.raw`\[ \text{15 formulas from Lessons 15 to 19} \]`,
sym: [["name", "what you are asked to write"], ["reveal", "shows the formula as the lesson wrote it"], ["I knew it", "counts toward that lesson's bar"], ["not yet", "keeps the formula in the next round"]],
how: ["Read the name.", "Write the formula on paper, with its symbols.", "Reveal and compare every factor, including the ½ and the m.", "Mark yourself and go on.", "Start a new round with only the misses."],
say: String.raw`The drill checks that the cost, the normal equation, the update, the stability limit, the scaler, the likelihood, the Huber loss and the regularized cost can be written from memory.`,
num: String.raw`<b>15</b> formulas, <b>4</b> from Lesson 15, <b>3</b> from Lesson 16, <b>2</b> from Lesson 17, <b>2</b> from Lesson 18 and <b>4</b> from Lesson 19.`,
note: String.raw`The most common lost marks on hand calculations are a missing ½, a missing 1/m, and the sign of the error, h − y in Ng's gradient. Check those three every time.`,
r(fig, ctl) {
  let order = FORM.map((_, i) => i), pos = 0, shown = false;
  const known = new Set(), round = { n: 1 };
  ctl.innerHTML = `<div class="row"><button id="l20fs" class="on">Reveal</button><button id="l20fk">I knew it</button><button id="l20fn">Not yet</button><button id="l20fr">New round with misses</button><button id="l20fa">Start over</button></div><div id="l20fo"></div>`;
  const u = () => {
    const done = pos >= order.length;
    let s = "";
    const Ls = [15, 16, 17, 18, 19];
    Ls.forEach((L, i) => {
      const tot = FORM.filter(r => r[0] === L).length, kn = FORM.filter((r, j) => r[0] === L && known.has(j)).length, x = 30 + i * 128;
      s += `<rect x="${x}" y="30" width="96" height="14" rx="4" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="30" width="${96 * kn / tot}" height="14" rx="4" fill="${C.teal}"/>` + tx(x + 48, 22, "Lesson " + L, "middle", "t") + tx(x + 48, 60, `${kn} of ${tot}`, "middle");
    });
    if (!done) {
      const it = FORM[order[pos]];
      s += `<rect x="30" y="80" width="620" height="70" rx="10" fill="var(--accent-bg)" stroke="var(--accent)"/>` + tx(340, 108, `Round ${round.n}, card ${pos + 1} of ${order.length}, Lesson ${it[0]}`, "middle") + tx(340, 134, it[1], "middle", "th");
      fig.innerHTML = svg(160, s) + (shown ? `<div class="eqbig">\\[${it[2]}\\]</div>` : `<p class="note" style="text-align:center">Write it on paper, then press Reveal.</p>`);
    } else {
      const miss = FORM.length - known.size;
      s += `<rect x="30" y="80" width="620" height="70" rx="10" fill="${miss ? "var(--sunk)" : "var(--teal-bg)"}" stroke="${miss ? "var(--line)" : C.teal}"/>` + tx(340, 110, `Round ${round.n} done. ${known.size} of ${FORM.length} known.`, "middle", "th") + tx(340, 134, miss ? "Start a new round with the misses." : "All fifteen. Go to Section A.", "middle");
      fig.innerHTML = svg(160, s);
    }
    $("l20fs").disabled = done || shown; $("l20fk").disabled = done || !shown; $("l20fn").disabled = done || !shown;
    $("l20fr").disabled = !done || known.size === FORM.length;
    $("l20fo").innerHTML = ML.readout([["known", `${known.size} of ${FORM.length}`], ["this round", done ? "finished" : `${order.length - pos} left`]]);
    if (shown && !done) typesetMath(fig);
  };
  $("l20fs").onclick = () => { shown = true; u(); };
  $("l20fk").onclick = () => { known.add(order[pos]); pos++; shown = false; u(); };
  $("l20fn").onclick = () => { pos++; shown = false; u(); };
  $("l20fr").onclick = () => { order = FORM.map((_, i) => i).filter(i => !known.has(i)); pos = 0; shown = false; round.n++; u(); };
  $("l20fa").onclick = () => { known.clear(); order = FORM.map((_, i) => i); pos = 0; shown = false; round.n = 1; u(); };
  u();
}},

{s: "A. Linear regression", t: "Section A: cost, normal equation and fit quality",
intu: String.raw`Eight questions from Lesson 15. Costs by hand, the normal equation by hand, the shapes in the vectorized forms, the residual orthogonality, the pseudoinverse on a duplicated column, the right solver for the size of the problem, and R² against the mean baseline.`,
eq: String.raw`\[ \text{Section A: 8 questions, pass at 6} \]`,
sym: [["Lesson 15", "hypothesis, Ng's cost, design matrix, normal equation, projection, pinv, metrics, test reporting"]],
how: ["Write the residuals before squaring anything.", "For a two by two solve, write the determinant first.", "For shape questions write the shape of every operand."],
say: String.raw`Section A tests whether you can compute a least squares fit and its cost by hand and read what the numbers say.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: String.raw`Data (1, 3), (2, 4), (3, 8) and \(h_\theta(x) = \theta_0 + \theta_1 x\) with \(\boldsymbol\theta = (1, 2)\). Ng's cost \(J\) is`, o: ["0.667", "2.0", "0.333", "1.0"], a: 2, why: "Predictions 3, 5, 7, residuals 0, 1, −1, so the squares sum to 2 and J = 2/(2 · 3) = 0.333. Forgetting the ½ gives 0.667. Lesson 15 cards 1 and 2." },
    { q: "x = (0, 1, 2, 3) and y = (1, 3, 2, 4). The least squares θ = (θ₀, θ₁) is", o: ["(1.3, 0.8)", "(1.0, 1.0)", "(0.8, 1.3)", "(2.5, 0.0)"], a: 0, why: "XᵀX = [[4, 6], [6, 14]] and Xᵀy = (10, 19). The determinant is 20, θ₀ = (14 · 10 − 6 · 19)/20 = 1.3 and θ₁ = (−6 · 10 + 4 · 19)/20 = 0.8. Lesson 15 card 5." },
    { q: "This code fits a line to the food truck data. What is wrong?", code: ["X = x.reshape(-1, 1)", "theta = np.linalg.solve(X.T @ X, X.T @ y)", "pred = X @ theta"], o: ["nothing, solve is the right call", "X has no column of ones, so the line is forced through the origin", "solve needs the inverse of X", "pred has the wrong shape"], a: 1, why: "Without the ones column there is no intercept parameter. Prepend np.ones(m) as the first column, then θ has two entries. Lesson 15 card 4." },
    { q: "A least squares fit includes an intercept column. The sum of its training residuals is", o: ["the SSE", "m times the mean of y", "it depends on the data", "0"], a: 3, why: "Xᵀ(y − Xθ) = 0, and the row of Xᵀ that belongs to the ones column says Σeᵢ = 0. Lesson 15 card 6." },
    { q: "X has shape (97, 2), θ has shape (2,) and y has shape (97,). The gradient Xᵀ(Xθ − y)/m has shape", o: ["(97,)", "(2,)", "(97, 2)", "(2, 97)"], a: 1, why: "Xθ − y is (97,), and (2, 97) times (97,) gives (2,), one entry per parameter. Lesson 15 card 4." },
    { q: "y = 3x exactly. You fit with two columns, x and 2x, and no intercept, using np.linalg.pinv. The coefficients are", o: ["(3, 0)", "(1, 1)", "(0.6, 1.2)", "an error, XᵀX is singular"], a: 2, why: "Every pair with a + 2b = 3 fits perfectly. The pseudoinverse returns the one with the smallest norm, along (1, 2): (3/5)(1, 2) = (0.6, 1.2). Lesson 15 card 7." },
    { q: "A dataset has 1,000,000 rows and 3 features. Solving the normal equation is", o: ["impossible, m is too large", "cheap: XᵀX is only 4 by 4, and forming it costs about m · n² operations", "only possible on a GPU", "slower than one epoch of gradient descent"], a: 1, why: "The size of the solve depends on the number of features, not rows. The trouble starts when n is in the tens of thousands. Lesson 15 card 8." },
    { q: "On the same rows a model has MSE 4.0 and the mean baseline has MSE 12.5. R² is", o: ["0.32", "0.68", "3.125", "0.80"], a: 1, why: "R² = 1 − SSE/SST = 1 − 4.0/12.5 = 0.68, because the baseline's SSE is the SST. Lesson 15 card 9." }
  ], "Section A");
}},

{s: "B. Descent and scaling", t: "Section B: gradient descent, batches and feature scaling",
intu: String.raw`Eight questions from Lessons 16 and 17. One update by hand, the stability limit and the factor per step, how many steps a slow direction needs, batches and the epoch loss, a loop bug, standardized weights back in raw units, and the condition number that correlation leaves behind.`,
eq: String.raw`\[ \text{Section B: 8 questions, pass at 6} \]`,
sym: [["Lesson 16", "update rule, learning rate, eigen-direction factors, stopping, batches, epoch loss, the five PyTorch steps"], ["Lesson 17", "units and curvature, standardization, training-only statistics, back to raw units, correlation"]],
how: ["For an update, compute the errors h − y first.", "For a stability question, find the largest eigenvalue.", "For a scaling question, write z before anything else."],
say: String.raw`Section B tests whether you can run gradient descent by hand and predict when it is fast, slow or unstable.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Data (1, 2) and (2, 3), θ = (0, 0), α = 0.1, Ng's cost. After one batch gradient descent step θ is", o: ["(0.5, 0.8)", "(−0.25, −0.4)", "(0.25, 0.8)", "(0.25, 0.4)"], a: 3, why: "Errors h − y = (−2, −3). ∂J/∂θ₀ = (−2 − 3)/2 = −2.5 and ∂J/∂θ₁ = (−2 · 1 − 3 · 2)/2 = −4. Then θ = −0.1 · (−2.5, −4) = (0.25, 0.4). Doubling comes from the MSE without ½. Lesson 16 card 9." },
    { q: "The curvature matrix has eigenvalues 8 and 0.5. A run with α = 0.3 will", o: ["converge slowly", "diverge, with the error flipping sign and growing by 1.4 each step along the stiff direction", "converge in one step", "stall at a constant cost"], a: 1, why: "The limit is 2/8 = 0.25. The stiff factor is 1 − 0.3 · 8 = −1.4, larger than 1 in size. Lesson 16 cards 3 and 4." },
    { q: "Along a soft direction the factor per step is 1 − αλ = 0.9. How many steps reduce the error there by a factor of 100?", o: ["10", "22", "44", "100"], a: 2, why: "0.9ᵏ ≤ 0.01 needs k ≥ ln 0.01 / ln 0.9 = 43.7, so 44 steps. Lesson 16 card 4." },
    { q: "1,000 training rows, batch size 128, drop_last=True. Each epoch has", o: ["7 batches and 104 rows unused", "8 batches, the last with 104 rows", "7 batches, the last with 104 rows", "8 batches and no rows unused"], a: 0, why: "⌊1000/128⌋ = 7 full batches use 896 rows and the remaining 104 are dropped. Keep drop_last=False for evaluation. Lesson 16 card 7." },
    { q: "Batch mean losses 0.5 (100 rows), 0.7 (100 rows) and 1.3 (50 rows). The epoch MSE is", o: ["0.833", "0.74", "0.70", "2.5"], a: 1, why: "(100 · 0.5 + 100 · 0.7 + 50 · 1.3)/250 = 185/250 = 0.74. The plain mean of the three, 0.833, overweights the short batch. Lesson 16 card 7." },
    { q: "This loop runs without an error. What does it do wrong?", code: ["for xb, yb in loader:", "    pred = model(xb)", "    loss = loss_fn(pred, yb)", "    loss.backward()", "    optimizer.zero_grad()", "    optimizer.step()"], o: ["nothing", "the gradients are cleared before step, so the parameters never change", "the gradients accumulate across batches", "backward must come after step"], a: 1, why: "zero_grad belongs before backward. Here step sees zero gradients and the model stays at its initial weights. Lesson 16 card 10." },
    { q: "Training mean 1200, training std 400, and θ = (300, 80) on the standardized feature. In raw units the model is", o: ["ŷ = 60 + 0.2x", "ŷ = 300 + 0.2x", "ŷ = 60 + 80x", "ŷ = 300 + 32,000x"], a: 0, why: "w = 80/400 = 0.2 and b = 300 − 0.2 · 1200 = 60. Check at x = 2000: z = 2 and 300 + 160 = 460 = 60 + 400. Lesson 17 card 7." },
    { q: "Two standardized features have correlation −0.6. The condition number of their curvature matrix is", o: ["0.25", "1.6", "2.5", "4"], a: 3, why: "The eigenvalues are 1 ± 0.6 = 1.6 and 0.4 whatever the sign, so κ = 1.6/0.4 = 4. Scaling fixes units, not correlation. Lesson 17 card 3." }
  ], "Section B");
}},

{s: "C. Losses", t: "Section C: losses from probability",
intu: String.raw`Eight questions from Lesson 18. MSE and MAE of the same residuals, the Gaussian maximum likelihood σ, what the likelihood does to the squared error, the mean and the median, the Huber value and its pull, SmoothL1 against HuberLoss, and which noise model the residuals prefer.`,
eq: String.raw`\[ \text{Section C: 8 questions, pass at 6} \]`,
sym: [["Lesson 18", "reductions, Gaussian and Laplace likelihoods, mean and median, influence, Huber, SmoothL1, residual diagnosis"]],
how: ["Square or take absolute values first, average last.", "For Huber, check which side of δ the residual is on.", "For SmoothL1, remember it is Huber divided by β."],
say: String.raw`Section C tests whether you can connect each loss to its noise model and compute it at a residual.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Residuals (2, −1, 0, −3, 1). The MSE and the MAE are", o: ["3.75 and 1.75", "15 and 7", "3.0 and 1.4", "1.4 and 3.0"], a: 2, why: "Squares sum to 15 and absolute values to 7, both divided by 5. Dividing by 4 forgets the zero residual. Lesson 18 card 1." },
    { q: "A least squares fit on 20 points has SSE = 7.2. The maximum likelihood Gaussian σ is", o: ["0.36", "0.6", "1.2", "0.19"], a: 1, why: String.raw`\(\hat\sigma^2\) = SSE/m = 7.2/20 = 0.36, so \(\hat\sigma\) = 0.6. Lesson 18 card 2.` },
    { q: String.raw`With Gaussian noise of fixed \(\sigma = 2\), the negative log-likelihood is a constant plus SSE times`, o: ["1/8", "1/4", "1/2", "2"], a: 0, why: String.raw`\(-\log L = m\log(\sigma\sqrt{2\pi}) + \mathrm{SSE}/(2\sigma^2)\) and \(2\sigma^2 = 8\). The factor scales the cost but does not move the minimizing θ. Lesson 18 card 2.` },
    { q: "Fit a constant to 3, 9, 4, 100, 6. Absolute error and squared error choose", o: ["24.4 and 6", "4 and 24.4", "6 and 6", "6 and 24.4"], a: 3, why: "Absolute error picks the median 6, squared error the mean 122/5 = 24.4. One reading of 100 drags only the mean. Lesson 18 card 4." },
    { q: "Huber loss with δ = 1.5 at a residual of 4 is", o: ["8", "6", "4.875", "5.25"], a: 2, why: "Outside δ: δ(|e| − δ/2) = 1.5 · (4 − 0.75) = 4.875. The squared branch would give ½ · 16 = 8. Lesson 18 card 6." },
    { q: "Huber with δ = 1. The derivatives, the pull on the fit, at residuals 0.6 and −2.5 are", o: ["1.2 and −5", "0.6 and −1", "1 and −1", "0.6 and −2.5"], a: 1, why: "Inside δ the derivative is e, outside it is δ · sign(e). A large residual pulls no harder than δ. Lesson 18 card 5." },
    { q: "nn.SmoothL1Loss(beta=2) at residuals 1 and 5 gives", o: ["0.5 and 8", "0.25 and 4", "0.25 and 8", "1 and 4"], a: 1, why: "SmoothL1 is 0.5e²/β inside β and |e| − β/2 outside: 0.25 and 4. nn.HuberLoss(delta=2) gives 0.5 and 8, exactly β times more. Lesson 18 card 7." },
    { q: "On the residuals of one fit, the fitted Gaussian log-likelihood is −152.3 and the fitted Laplace log-likelihood is −138.9. The residuals point to", o: ["Gaussian noise, use MSE", "heavier tails than Gaussian, prefer MAE or Huber", "a bug, log-likelihoods must be positive", "nothing, the two are not comparable"], a: 1, why: "The higher log-likelihood fits the residuals better, here the Laplace model, whose maximum likelihood loss is the absolute error. Lesson 18 card 10." }
  ], "Section C");
}},

{s: "D. Regularization", t: "Section D: overfitting, regularization and model selection",
intu: String.raw`Eight questions from Lesson 19. Diagnose two models against a baseline, add up the error decomposition, compute a regularized cost and a shrink factor, ridge and lasso by hand, the one standard error rule, and a bug that defeats early stopping.`,
eq: String.raw`\[ \text{Section D: 8 questions, pass at 6} \]`,
sym: [["Lesson 19", "two-error diagnosis, bias and variance, learning curves, regularized cost and update, ridge, lasso, validation, k-fold CV, early stopping"]],
how: ["Compare the training error with the baseline first, then with the validation error.", "Leave b out of every penalty.", "For the one SE rule, compute the threshold, then pick the simplest model under it."],
say: String.raw`Section D tests whether you can name a model's problem from its errors and compute what regularization does to its weights.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Baseline error 0.10. Model P: training 0.31, validation 0.34. Model Q: training 0.06, validation 0.29. Which statement is right?", o: ["P has high variance, Q has high bias", "P has high bias, Q has high variance", "both have high bias", "both are fine"], a: 1, why: "P's training error is far above the baseline with a small gap to validation: bias. Q fits its training data below the baseline but validates far higher: variance. Lesson 19 card 2." },
    { q: "At some x the squared bias is 0.03, the variance across training sets 0.08, and the noise standard deviation 0.25. The expected squared error on a new point is", o: ["0.11", "0.36", "0.1725", "0.1425"], a: 2, why: "0.03 + 0.08 + 0.25² = 0.03 + 0.08 + 0.0625 = 0.1725. The noise enters as its variance, not its standard deviation. Lesson 19 card 3." },
    { q: "m = 5, SSE = 3.0, w = (2, −1, 0.5), b = 4 and λ = 2. Ng's regularized cost is", o: ["1.35", "4.55", "1.65", "0.30"], a: 0, why: "3.0/(2 · 5) + 2/(2 · 5) · (4 + 1 + 0.25) = 0.30 + 1.05 = 1.35. Penalizing b² = 16 as well gives 4.55. Lesson 19 card 5." },
    { q: "Regularized gradient descent with α = 0.01, λ = 50 and m = 25 multiplies each weight on every step by", o: ["0.5", "0.98", "0.99", "1.02"], a: 1, why: "1 − αλ/m = 1 − 0.01 · 50/25 = 0.98, before the data term pushes it. Lesson 19 card 6." },
    { q: "One centered feature with Σx² = 20 and Σxy = 30, so least squares gives w = 1.5. Ridge with λ = 5 gives", o: ["1.5", "0.857", "1.2", "6.0"], a: 2, why: "w = Σxy/(Σx² + λ) = 30/25 = 1.2. Lesson 19 card 7." },
    { q: "Orthonormal features, least squares weights z = (0.3, −2.0, 1.1), lasso with λ = 0.4. The weights are", o: ["(0.214, −1.429, 0.786)", "(0, −1.6, 0.7)", "(−0.1, −1.6, 0.7)", "(0.3, −2.0, 1.1)"], a: 1, why: "Soft thresholding: shrink each magnitude by 0.4 and stop at zero, so 0.3 becomes exactly 0. The first option is ridge, z/1.4. Lesson 19 card 8." },
    { q: "5-fold CV means and standard errors: degree 2: 0.142 (0.011), degree 5: 0.120 (0.009), degree 8: 0.118 (0.015). The one standard error rule picks", o: ["degree 2", "degree 5", "degree 8", "none, the means are too close"], a: 1, why: "The minimum is degree 8, so the threshold is 0.118 + 0.015 = 0.133. Degree 5 is the simplest model under it, degree 2 at 0.142 is above. Lesson 19 card 10." },
    { q: "This early stopping loop runs. What does the final line restore?", code: ["best, best_state = float(\"inf\"), None", "for epoch in range(500):", "    train_one_epoch(model)", "    v = evaluate(model, val_loader)", "    if v < best:", "        best, best_state = v, model.state_dict()", "model.load_state_dict(best_state)"], o: ["the best checkpoint", "the weights after the last epoch, because state_dict holds references to the live tensors", "random weights", "nothing, load_state_dict fails"], a: 1, why: "state_dict returns the parameter tensors themselves, which keep training. Save copy.deepcopy(model.state_dict()). Lesson 19 card 11." }
  ], "Section D");
}},

{s: "Board problem", t: "A board problem: nine parts on five readings, with worked solutions",
intu: String.raw`The midterm style is one small dataset and a chain of parts, each using the last. Five readings, x = 0 to 4. Step through the parts, work each on paper, then press Show solution. The picture follows along: the data, the fitted line, the line after one gradient step, the cost contours before and after standardizing, the ridge line, and what one corrupted reading does to least squares and to Huber. Every number in the solutions was computed with NumPy and is small enough to check by hand.`,
eq: String.raw`\[ X^\top X = \begin{bmatrix} 5 & 10 \\ 10 & 30 \end{bmatrix}, \qquad X^\top\mathbf y = \begin{bmatrix} 17.0 \\ 45.7 \end{bmatrix} \]`,
sym: [["x", "0, 1, 2, 3, 4"], ["y", "1.0, 2.4, 3.1, 4.9, 5.6"], [String.raw`\(\boldsymbol\theta\)`, "intercept and slope, Ng's notation"], [String.raw`\(\alpha\)`, "0.05 for the gradient step"], [String.raw`\(\lambda\)`, "2 for the ridge part, slope only"]],
how: ["Read the part.", "Work it on paper.", "Show the solution and compare line by line.", "Mark any part you got wrong and reopen its lesson.", "Go to the next part, which uses this one."],
say: String.raw`For this dataset the normal equation gives θ = (1.06, 1.17), one gradient step from zero gives (0.17, 0.457), the stable learning rate is below 0.298, standardizing makes the curvature matrix the identity, and ridge with λ = 2 gives (1.45, 0.975).`,
num: String.raw`θ = (<b>1.06, 1.17</b>), J = <b>0.0251</b>, R² = <b>0.982</b>, σ = <b>0.224</b>, one step to (<b>0.17, 0.457</b>), λ = <b>6.702</b> and <b>0.298</b>, ridge (<b>1.45, 0.975</b>), corrupted fit (<b>0.26, 1.97</b>), Huber (<b>${f(THH[0], 2)}, ${f(THH[1], 2)}</b>).`,
note: String.raw`Parts 2 and 9 use the same inverse of XᵀX. On an exam, write the inverse once and reuse it. Part 9 is also why a point at the end of the x range deserves a second look before you trust any fit.`,
r(fig, ctl) {
  let open = false;
  const Lab = ["data", "normal equation", "cost", "noise", "gradient step", "stability", "standardize", "ridge", "corrupted"];
  const ell = (a, c, H, ev, cols) => {
    /* contours of (t - t*)^T H (t - t*) = c in parameter space, centered at the minimum */
    let s = "";
    const tr = H[0][0] + H[1][1], det = H[0][0] * H[1][1] - H[0][1] ** 2, l1 = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det)), l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const v1 = Math.abs(H[0][1]) > 1e-12 ? [l1 - H[1][1], H[0][1]] : [1, 0], n1 = Math.hypot(v1[0], v1[1]), e1 = [v1[0] / n1, v1[1] / n1], e2 = [-e1[1], e1[0]];
    c.forEach((cc, k) => { const pts = []; for (let i = 0; i <= 90; i++) { const t = 2 * Math.PI * i / 90, p = Math.sqrt(cc / l1) * Math.cos(t), q = Math.sqrt(cc / l2) * Math.sin(t); pts.push([a.X(p * e1[0] + q * e2[0]), a.Y(p * e1[1] + q * e2[1])]); } s += ML.path(pts, cols, 1.4); });
    return { s, l1, l2, e1, e2 };
  };
  const draw = k => {
    let s = "";
    if (k === 5 || k === 6) {
      const std = k === 6;
      const a = ML.axes(60, 20, 300, 260, { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, nx: 6, ny: 6, fx: v => f(v, 1), fy: v => f(v, 1), xl: std ? "intercept, offset from best" : "θ₀ offset from best", yl: std ? "slope on z, offset" : "θ₁ offset from best", grid: false });
      const H = std ? [[1, 0], [0, 1]] : HB, E = ell(a, [0.02, 0.08, 0.18, 0.32], H, null, std ? C.teal : C.blue);
      s += a.s + E.s + dot(a.X(0), a.Y(0), 4, C.coral);
      s += tx(390, 40, std ? "standardized x: circles" : "raw x: long thin ellipses", null, "th");
      s += tx(390, 66, `eigenvalues ${f(E.l1, 3)} and ${f(E.l2, 3)}`, null, "t") + tx(390, 90, `condition number ${f(E.l1 / E.l2, 1)}`, null, "t") + tx(390, 114, `stable α below ${f(2 / E.l1, 3)}`, null, "t");
      if (!std) s += tx(390, 148, `at α = 0.05 the factors are`, null) + tx(390, 168, `${f(1 - ALPHA * LMAX, 3)} stiff and ${f(1 - ALPHA * LMIN, 3)} soft`, null) + tx(390, 202, "same contours of J, J = const", null);
      else s += tx(390, 148, `z = (x − 2)/${f(SD, 3)}`, null) + tx(390, 168, "α = 1 reaches the center in one step", null) + tx(390, 202, "the fitted line in x is unchanged", null);
    } else {
      const a = ML.axes(60, 20, 340, 260, { xmin: -0.5, xmax: 4.5, ymin: 0, ymax: 10, nx: 5, ny: 5, fx: v => f(v, 1), fy: v => f(v, 0), xl: "x", yl: "y", grid: false });
      s += a.s;
      const ln = (th, col, w, dash) => { let x1 = -0.5, x2 = 4.5; if (th[1] > 0) { x1 = Math.max(x1, -th[0] / th[1]); x2 = Math.min(x2, (10 - th[0]) / th[1]); } return ML.path([[a.X(x1), a.Y(th[0] + x1 * th[1])], [a.X(x2), a.Y(th[0] + x2 * th[1])]], col, w, dash); };
      const ys = k === 8 ? BYO : BY;
      if (k >= 1 && k !== 8) s += ln(TH, C.coral, 2.4);
      if (k === 2 || k === 3) BX.forEach((x, i) => { s += `<line x1="${a.X(x)}" y1="${a.Y(BY[i])}" x2="${a.X(x)}" y2="${a.Y(TH[0] + TH[1] * x)}" stroke="${C.purple}" stroke-width="2"/>`; });
      if (k === 4) s += ln(TH1, C.blue, 2.2, "6 4") + ln([0, 0], C.gray, 1.2, "3 3");
      if (k === 7) s += ln(RID, C.teal, 2.4, "6 4") + dot(a.X(MU), a.Y(YBAR), 5, C.teal, true);
      if (k === 8) s += ln(TH, C.gray, 1.4, "4 4") + ln(THO, C.purple, 2.4) + ln(THH, C.amber, 2.4, "6 4") + dot(a.X(4), a.Y(5.6), 5, C.gray, true);
      ys.forEach((y, i) => { s += dot(a.X(BX[i]), a.Y(y), 4.5, k === 8 && i === 4 ? C.coral : "var(--p)"); });
      const side = [];
      side.push(["th", `part ${k + 1}: ${BOARD[k].t}`]);
      if (k === 0) side.push(["t", "five readings, m = 5"], ["ts", "Σx = 10, Σx² = 30"], ["ts", "Σy = 17.0, Σxy = 45.7"]);
      if (k >= 1 && k !== 8) side.push(["t", `coral: θ = (${f(TH[0], 2)}, ${f(TH[1], 2)})`]);
      if (k === 2 || k === 3) side.push(["t", "purple: residuals"], ["ts", `SSE ${f(SSE, 3)}, J ${f(SSE / (2 * BM), 4)}`], ["ts", `R² ${f(1 - SSE / SST, 3)}`]);
      if (k === 3) side.push(["ts", `σ = √(SSE/m) = ${f(Math.sqrt(SSE / BM), 3)}`]);
      if (k === 4) side.push(["t", `blue: after one step (${f(TH1[0], 2)}, ${f(TH1[1], 3)})`], ["ts", "grey: the start, θ = (0, 0)"], ["ts", `J ${f(Jof([0, 0]), 3)} to ${f(Jof(TH1), 3)}`]);
      if (k === 7) side.push(["t", `teal: ridge λ = 2 (${f(RID[0], 2)}, ${f(RID[1], 3)})`], ["ts", "ring: the mean point (2, 3.4)"]);
      if (k === 8) side.push(["t", `purple: least squares (${f(THO[0], 2)}, ${f(THO[1], 2)})`], ["t", `amber: Huber δ = 1 (${f(THH[0], 2)}, ${f(THH[1], 2)})`], ["ts", "grey: the clean fit"], ["ts", "coral dot: 9.6, was 5.6 (ring)"]);
      side.forEach(([c, t], i) => { s += tx(420, 40 + i * 24, t, null, c); });
    }
    fig.innerHTML = svg(320, s) + `<p style="font-weight:600;margin:6px 0 4px">Part ${k + 1}. ${BOARD[k].t}</p><p>${BOARD[k].q}</p>`;
    $("l20bs").innerHTML = open ? `<div class="dnote"><p><b>Solution.</b> ${BOARD[k].a}</p></div>` : `<p class="note">Work it on paper first.</p>`;
    $("l20bb").textContent = open ? "Hide solution" : "Show solution";
    typesetMath(fig, $("l20bs"));
  };
  ctl.innerHTML = `<div id="l20bt"></div><div class="row"><button id="l20bb">Show solution</button></div><div id="l20bs"></div>`;
  let cur = 0;
  $("l20bb").onclick = () => { open = !open; draw(cur); };
  ML.stepper($("l20bt"), BOARD.length, k => { if (k !== cur) open = false; cur = k; draw(k); }, Lab);
}},

{s: "Score sheet", t: "Enter your section scores and see what to reopen",
intu: String.raw`Set the four sliders to your section scores. The bars turn teal at 6 or above. For every section below 6 the sheet lists the cards its questions came from, in the order to reopen them. The total decides whether Part 4 is done: 26 of 32 or more. A total of 26 with one section at 5 is not a pass, because the midterm does not let one strong topic cover a weak one.`,
eq: String.raw`\[ \text{pass} \iff \min_s \text{score}_s \ge 6 \ \text{and} \ \sum_s \text{score}_s \ge 26 \]`,
sym: [["score", "correct answers in a section, 0 to 8"], ["section pass", "6 or more"], ["Part 4 pass", "every section passed and 26 or more overall"]],
how: ["Take each section once without notes.", "Enter the four scores.", "Reopen the listed cards for each red bar.", "Retake only those sections.", "Record the scores and the date in your notes."],
say: String.raw`Part 4 is passed when every section scores at least six and the total is at least twenty-six.`,
num: String.raw`A pass needs <b>26 of 32</b>, about 81 %, with no section below <b>6 of 8</b>.`,
note: String.raw`Write the date and the four scores at the top of your midterm notes. A section that was weak once is the one to retake two days before the exam.`,
r(fig, ctl) {
  const REV = [["Lesson 15 cards 1, 2, 4, 5, 6, 7, 8, 9"], ["Lesson 16 cards 3, 4, 7, 9, 10", "Lesson 17 cards 3 and 7"], ["Lesson 18 cards 1, 2, 4, 5, 6, 7, 10"], ["Lesson 19 cards 2, 3, 5, 6, 7, 8, 10, 11"]];
  ctl.innerHTML = SEC.map((sc, i) => sl("l20s" + i, sc[0], 0, 8, 1, 7)).join("") + `<div id="l20so"></div>`;
  const u = () => {
    const v = SEC.map((_, i) => +$("l20s" + i).value);
    v.forEach((x, i) => { $("l20s" + i + "v").textContent = x + " / 8"; });
    const tot = v.reduce((a, b) => a + b, 0), ok = v.every(x => x >= 6) && tot >= 26;
    const a = ML.axes(60, 20, 400, 220, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, nx: 4, ny: 8, fx: () => "", fy: v => v, yl: "score", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(6)}" x2="${a.X(4)}" y2="${a.Y(6)}" stroke="${C.coral}" stroke-dasharray="6 4"/>` + tx(a.X(4) + 6, a.Y(6) + 4, "pass 6", null);
    v.forEach((x, i) => { const x0 = a.X(i + 0.2), w = a.X(i + 0.8) - x0; s += `<rect x="${x0}" y="${a.Y(x)}" width="${w}" height="${a.Y(0) - a.Y(x)}" rx="4" fill="${x >= 6 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, "Section " + "ABCD"[i], "middle") + tx(x0 + w / 2, a.Y(x) - 6, String(x), "middle", "t"); });
    s += tx(530, 60, `total ${tot} / 32`, null, "th") + tx(530, 86, `${Math.round(100 * tot / 32)} %`, null, "t") + tx(530, 124, ok ? "Part 4 passed" : "not yet", null, "th");
    if (!ok && tot >= 26) s += tx(530, 148, "a section is below 6", null);
    fig.innerHTML = svg(280, s);
    const weak = v.map((x, i) => [x, i]).filter(([x]) => x < 6);
    $("l20so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SEC[i][0]}</b> at ${x}: reopen ${REV[i].join(" and ")}, then retake the section.</p>`).join("")}</div>` : `<p class="note">${ok ? "Every section is at 6 or above. Go on to Part 5, which rebuilds this pipeline in PyTorch." : "Every section is at 6 or above but the total is under 26. Retake the two lowest sections."}</p>`;
  };
  SEC.forEach((_, i) => { $("l20s" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: check the board problem in code",
intu: String.raw`After working the board problem on paper, have the agent recompute every part with NumPy and pin the numbers in tests. The point is not the code, which is short, but the comparison: each assertion is one of your hand results. When a test fails, either your paper or the code is wrong, and finding out which is the best practice there is for the midterm. The command forbids the explicit inverse except where the part asks for it, and asks for the Huber fit by reweighted least squares so you can see that it converges.`,
eq: String.raw`\[ \texttt{normal\_eq} \to \texttt{gd\_step} \to \texttt{curvature} \to \texttt{ridge} \to \texttt{huber\_irls} \]`,
sym: [["normal eq", "solves XᵀXθ = Xᵀy with np.linalg.solve"], ["gd step", "one batch step on Ng's cost"], ["curvature", "eigenvalues of XᵀX/m and the stable α"], ["ridge", "(XᵀX + λL)θ = Xᵀy with L = diag(0, 1)"], ["huber irls", "weights min(1, δ/|e|), refit until θ stops moving"]],
how: ["Work the board problem on paper first.", "Paste the command.", "Read the tests: is every number one of yours?", "Run pytest and compare any failure with your paper.", "Commit the script with its tests."],
say: String.raw`The agent recomputes the nine board parts with NumPy and pins each hand result in a pytest test, so a mistake on paper or in code shows up as a failing assertion.`,
num: String.raw`Tests expect θ = (<b>1.06, 1.17</b>), J = <b>0.0251</b>, the step (<b>0.17, 0.457</b>), eigenvalues <b>6.702</b> and <b>0.298</b>, ridge (<b>1.45, 0.975</b>), the corrupted fit (<b>0.26, 1.97</b>) and Huber near (<b>${f(THH[0], 2)}, ${f(THH[1], 2)}</b>).`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/part4_board.py with numpy only. Data x = [0, 1, 2, 3, 4], y = [1.0, 2.4, 3.1, 4.9, 5.6]. Functions: design(x) that prepends a column of ones, normal_eq(X, y) using np.linalg.solve (no inverse), cost(theta, X, y) with Ng's 1/(2m), r2(theta, X, y), gd_step(theta, X, y, alpha) for one batch step on that cost, curvature(X) returning the eigenvalues of X.T @ X / m in descending order and the stable limit 2 / lambda_max, standardize(x) with the population std, ridge(X, y, lam) solving (X.T X + lam * diag(0, 1)) theta = X.T y, and huber_irls(X, y, delta) by iteratively reweighted least squares with weights min(1, delta / |e|), stopping when theta moves less than 1e-10. Create tests/test_part4_board.py with pytest: normal_eq gives (1.06, 1.17), the residuals sum to 0, cost is 0.0251, r2 is 0.982 to 3 decimals, gd_step from zeros with alpha 0.05 gives (0.17, 0.457), curvature gives 6.702 and 0.298 and a limit of 0.298, after standardize the curvature matrix is the identity and the fitted line in raw units is unchanged, ridge with lam 2 gives (1.45, 0.975), replacing the last y by 9.6 gives (0.26, 1.97) and equals the clean fit plus inv(X.T X) @ (4, 16), and huber_irls with delta 1 on the corrupted data gives a slope between 1.17 and 1.97. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "..........                                               [100%]", "10 passed in 0.41s"],
    checks: ["normal_eq calls np.linalg.solve, and inv appears only in the corrupted-reading test", "cost divides by 2m, and the test value is 0.0251, not 0.0502", "gd_step uses the errors h − y, so the step from zero moves θ up", "standardize uses ddof=0 and the test checks the identity matrix", "ridge leaves the intercept unpenalized", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`Part 4 is passed when all four sections score at least six and the total is at least twenty-six. Section A asks for least squares by hand: the residuals, Ng's cost with its ½, the two by two normal equation, and R² against the mean. Section B asks for gradient descent by hand: one step, the limit 2/λmax, the factor 1 − αλ per step, batches and the weighted epoch loss, and scaling back to raw units. Section C ties each loss to its noise model and asks for Huber and SmoothL1 values at a residual. Section D asks for the diagnosis from two errors and a baseline, the regularized cost without b, the shrink factor, ridge and lasso weights, and the one standard error choice. The board problem chains all of it on five readings. Misses name a lesson and a card. Reopen them, retake the section, and move to Part 5.`,
sheet: [[String.raw`\[ \boldsymbol\theta = (X^\top X)^{-1}X^\top\mathbf y, \qquad J = \frac{1}{2m}\lVert X\boldsymbol\theta - \mathbf y\rVert^2 \]`, "Section A: least squares and Ng's cost"], [String.raw`\[ \boldsymbol\theta := \boldsymbol\theta - \frac{\alpha}{m}X^\top(X\boldsymbol\theta - \mathbf y), \qquad 0 \lt \alpha \lt \frac{2}{\lambda_{\max}} \]`, "Section B: the update and its stability limit"], [String.raw`\[ \hat\sigma^2 = \frac{\mathrm{SSE}}{m}, \qquad L_\delta(e) = \delta\left(|e| - \tfrac12\delta\right) \ \text{for} \ |e| \gt \delta \]`, "Section C: the Gaussian MLE and Huber's linear branch"], [String.raw`\[ \left(X^\top X + \lambda L\right)\boldsymbol\theta = X^\top\mathbf y, \qquad w_j := w_j\left(1 - \alpha\tfrac{\lambda}{m}\right) - \alpha\,\partial_{w_j} J_{\text{data}} \]`, "Section D: ridge and weight decay"], [String.raw`\[ \text{pass} = 6/8 \text{ per section}, \ 26/32 \text{ overall} \]`, "the marks"]],
sources: ["AME 5970 HW3 (cost by hand, gradient descent loop, normal equation, pinv on a duplicated column), the model for Section A and board parts 1 to 3", "AME 5970 HW5 Problems 2 and 3 (learning rate stability on x², fair rate comparison, least squares two ways), the model for Section B and board parts 5 and 6", "AME 5970 HW6 Problems 1 and 2 (batches, sample-weighted epoch loss, training-only standardization, back to dollars)", "AME 5970 HW7 questions and solutions doc, Parts 2 and 3 (Gaussian likelihood, Huber on a corrupted reading, degree chosen on validation)", "AME 5970 HW8 questions and solutions doc, Part 2 (baseline, capacity, validation checkpoints with deepcopy)", "AME 5970 midterm examples, topic order (the exam PDFs were not available in this session, so the board problem follows the HW3 and HW5 hand calculations)", "Lessons 15 to 19 of this shelf", "Andrew Ng, Machine Learning Specialization, course 1, weeks 1 to 3, and course 2, week 3", "Andrew Ng, CS229 lecture notes, Part I (least squares, the normal equations, the probabilistic interpretation) and the notes on regularization and model selection"]
});
})();
