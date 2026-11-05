(function () {
/* ML shelf, Part 4, Lesson 18: Losses from probability. Follows AME 5970 HW7 Part 2 (regression losses and outliers: reduction and shapes, Huber loss, cost and influence, one corrupted measurement, three claims) with its solutions doc, HW7 Part 1.4 (why fixed-variance Gaussian noise leads to squared error), the Lecture 5 probability and maximum likelihood tutorial for topic order, and the CS229 lecture notes, Part I section 3 (probabilistic interpretation of least squares) as Andrew Ng's spine. All datasets except the HW7 readings are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const median = a => { const b = a.slice().sort((p, q) => p - q), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const hub = (e, d) => Math.abs(e) <= d ? 0.5 * e * e : d * (Math.abs(e) - 0.5 * d);
const psi = (e, d) => Math.max(-d, Math.min(d, e));
const phi = (t, s) => Math.exp(-t * t / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
const lap = (t, b) => Math.exp(-Math.abs(t) / b) / (2 * b);
/* Huber location: the c where the clipped residuals sum to zero, by bisection */
const hubLoc = (a, d) => { let lo = Math.min(...a), hi = Math.max(...a); for (let k = 0; k < 200; k++) { const c = (lo + hi) / 2, s = a.reduce((u, v) => u + psi(c - v, d), 0); if (s > 0) hi = c; else lo = c; } return (lo + hi) / 2; };
/* weighted least squares for a line, then IRLS for L1 and Huber */
const wls = (x, y, w) => { let S = 0, Sx = 0, Sxx = 0, Sy = 0, Sxy = 0; x.forEach((xi, i) => { S += w[i]; Sx += w[i] * xi; Sxx += w[i] * xi * xi; Sy += w[i] * y[i]; Sxy += w[i] * xi * y[i]; }); const det = S * Sxx - Sx * Sx; return [(Sxx * Sy - Sx * Sxy) / det, (S * Sxy - Sx * Sy) / det]; };
const irls = (x, y, wf, n) => { let t = wls(x, y, x.map(() => 1)); for (let k = 0; k < n; k++) { const r = x.map((xi, i) => y[i] - t[0] - t[1] * xi); t = wls(x, y, r.map(wf)); } return t; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const gauss = r => () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const LC = [C.blue, C.coral, C.teal];

addLesson("ml", "linear", {
level: "Core", num: "Lesson 18",
id: "ml-linear-l18", title: "Losses from probability", short: "18. Losses from probability",
big: String.raw`Lesson 15 minimized squared error because it is convenient. This lesson shows where it comes from and when to replace it. A loss is a statement about the noise: if each target is the model's prediction plus independent Gaussian noise with a fixed spread, then maximizing the likelihood is exactly minimizing the sum of squared residuals, Ng's cost J with its factor of one half. Change the noise to the heavier tailed Laplace distribution and the same argument produces the mean absolute error. The two losses then behave very differently with a bad measurement. Squared error chases the mean, so one corrupted reading drags the fit, while absolute error settles on the median and barely moves. Huber loss sits in between: quadratic for small residuals, linear for large ones, with a threshold δ in the target's units. You will compute the per-element losses and their reductions, watch the influence of a residual through the derivative, fit a constant and a line through corrupted data with all three losses, and use the residual histogram to decide which noise model, and so which loss, your data support.`,
bridge: String.raw`The source is the professor's HW7 Part 2 (regression losses and outliers) with its solutions doc, and HW7 Part 1.4 for the step from fixed-variance Gaussian noise to squared error. The Lecture 5 probability and maximum likelihood tutorial sets the topic order (its PDF was not available to this build). Andrew Ng's CS229 lecture notes, Part I section 3, the probabilistic interpretation of least squares, are the spine, with Ng's Machine Learning Specialization course 1, week 1 for the cost J with its factor of one half. Lesson 14 supplies the likelihood and the log-likelihood, and Lesson 15 the least squares fit this lesson reinterprets.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Residual, loss, reduction", t: "A loss turns each residual into a cost, then a reduction makes one number",
intu: String.raw`Four predictions miss four targets. HW7 writes the residual as e = ŷ − y, the prediction minus the target, so a positive residual means the model predicted too high. A loss maps each residual to a cost: e² for squared error, |e| for absolute error. The reduction then decides what PyTorch returns. With <code>reduction='none'</code> you get one value per element, <code>'sum'</code> adds them, and <code>'mean'</code>, the default, divides by the number of elements. Backpropagation needs the scalar. Now press the shape button. If the predictions have shape (4, 1) and the targets (4,), broadcasting compares every prediction with every target and averages 16 numbers. PyTorch only warns, and the loss is silently wrong.`,
eq: String.raw`\[ e_i = \hat y_i - y_i, \qquad \mathrm{MSE} = \frac{1}{m}\sum_{i=1}^{m} e_i^2, \qquad \mathrm{MAE} = \frac{1}{m}\sum_{i=1}^{m} |e_i| \]`,
sym: [[String.raw`\(e_i\)`, "residual, prediction minus target, in target units"], ["per-element loss", "the cost of one residual, before any reduction"], ["reduction", "none, sum or mean, mean is the PyTorch default"], ["(4, 1) and (4,)", "two shapes that broadcast to (4, 4) instead of matching"], ["scalar", "loss.backward() needs a single number"]],
how: ["Compute the residuals e = ŷ − y elementwise.", "Apply the per-element loss: square it, or take its absolute value.", "Reduce: sum for a total, mean for a per-sample average.", "Before any loss, assert prediction.shape == target.shape.", "Fix a mismatch with <code>target.view(-1, 1)</code> or <code>pred.squeeze(1)</code>, never by hoping broadcasting is right."],
say: String.raw`A loss assigns a cost to each residual and a reduction combines those costs into the single number that backpropagation needs, and the prediction and target shapes must match exactly before the loss is computed.`,
num: String.raw`Residuals (<b>0.5, −0.5, −1, 3</b>). Squared: 0.25, 0.25, 1, 9, sum <b>10.5</b>, mean <b>2.625</b>. Absolute: sum 5, mean <b>1.25</b>. Wrong shapes: 16 comparisons, mean <b>4.844</b>.`,
r(fig, ctl) {
  let red = 1, ls = 0, bad = 0;
  const P = [2.0, 5.0, 3.5, 6.0], T = [1.5, 5.5, 4.5, 3.0], E = P.map((p, i) => p - T[i]);
  const per = [e => e * e, e => Math.abs(e), e => hub(e, 1)], names = ["squared error", "absolute error", "Huber, δ = 1"], tor = ["nn.MSELoss", "nn.L1Loss", "nn.HuberLoss"];
  ctl.innerHTML = btns([[0, "MSE"], [1, "L1"], [2, "Huber δ = 1"]], "l") + btns([[0, "reduction none"], [1, "reduction mean"], [2, "reduction sum"]], "q") + btns([[0, "shapes (4, 1) and (4, 1)"], [1, "shapes (4, 1) and (4,)"]], "w") + `<div id="l18a"></div>`;
  const u = () => {
    pick(ctl, "l", ls); pick(ctl, "q", red); pick(ctl, "w", bad);
    const a = ML.axes(60, 20, 250, 170, { xmin: 0.5, xmax: 5.1, ymin: 0, ymax: 7, nx: 4, ny: 7, fx: () => "", fy: v => v, yl: "value", grid: false });
    let s = a.s + [1, 2, 3, 4].map(i => tx(a.X(i), 206, "row " + i, "middle")).join("");
    P.forEach((p, i) => { const x = a.X(i + 1); s += `<line x1="${x}" y1="${a.Y(T[i])}" x2="${x}" y2="${a.Y(p)}" stroke="${C.gray}" stroke-width="2"/>` + `<circle cx="${x}" cy="${a.Y(T[i])}" r="6" fill="${C.blue}"/><circle cx="${x}" cy="${a.Y(p)}" r="6" fill="${C.coral}"/>` + tx(x + 10, a.Y((p + T[i]) / 2) + 4, "e = " + (E[i] > 0 ? "+" : "") + E[i]); });
    s += tx(330, 34, "blue: target y, coral: prediction ŷ", null) + tx(330, 52, "gray bar: residual e = ŷ − y", null);
    let res, sh;
    if (!bad) {
      const v = E.map(per[ls]);
      s += ML.grid([v], { x: 360, y: 96, cell: 64, fmt: x => f(x, 3), title: "per element, " + names[ls], rowLab: false, colLab: ["row 1", "row 2", "row 3", "row 4"], hl: red === 0 ? new Set(["0,0", "0,1", "0,2", "0,3"]) : new Set() }).s;
      res = red === 0 ? "[" + v.map(x => f(x, 3)).join(", ") + "], shape (4, 1)" : red === 1 ? f(mean(v), 4) + ", a scalar" : f(v.reduce((p, q) => p + q, 0), 4) + ", a scalar";
      sh = "(4, 1) and (4, 1): elementwise, 4 comparisons";
    } else {
      const M = P.map(p => T.map(t => per[ls](p - t)));
      s += ML.grid(M, { x: 400, y: 84, cell: 40, fmt: x => f(x, 2), title: "broadcast (4, 4)", rowLab: ["ŷ1", "ŷ2", "ŷ3", "ŷ4"], colLab: ["y1", "y2", "y3", "y4"], hl: new Set(["0,0", "1,1", "2,2", "3,3"]), dec: 2 }).s;
      const all = M.flat();
      res = red === 0 ? "a (4, 4) array of 16 values" : red === 1 ? f(mean(all), 4) + ", averaged over 16 pairs" : f(all.reduce((p, q) => p + q, 0), 4) + ", summed over 16 pairs";
      sh = "(4, 1) against (4,) broadcasts to (4, 4): only the 4 teal cells are real pairs";
    }
    s += tx(60, 270, sh, null, "t") + tx(60, 292, "result: " + res, null, "th");
    fig.innerHTML = svg(310, s) + ML.code([`loss_fn = ${tor[ls]}(${ls === 2 ? "delta=1.0, " : ""}reduction='${["none", "mean", "sum"][red]}')`, bad ? "loss = loss_fn(pred, target)        # pred (4, 1), target (4,): UserWarning only" : "assert pred.shape == target.shape   # (4, 1) and (4, 1)", bad ? "" : "loss = loss_fn(pred, target)"].filter(Boolean), bad ? 1 : 2);
    $("l18a").innerHTML = ML.readout([["correct mean", f(mean(E.map(per[ls])), 4)], ["this call returns", red === 0 && !bad ? "4 values" : res.split(",")[0]]]);
  };
  ["l", "q", "w"].forEach(k => ctl.querySelectorAll(`button[data-${k}]`).forEach(b => b.onclick = () => { const v = +b.dataset[k]; if (k === "l") ls = v; else if (k === "q") red = v; else bad = v; u(); }));
  u();
}},

{s: "2. Gaussian noise gives MSE", t: "If the noise is Gaussian with a fixed spread, maximum likelihood is least squares",
intu: String.raw`CS229 makes the assumption explicit: each target is the model's prediction plus independent noise, yᵢ = θxᵢ + εᵢ with εᵢ drawn from a Gaussian of mean 0 and a fixed standard deviation σ. Each data point then has a density under the model, drawn here as a bell around the line at its x. The likelihood is the product of the five densities at the observed y values, the teal bars. Move θ: when the line passes close to the points, every bar is tall and the likelihood is large. Take the negative log and the product becomes a sum with one term that depends on θ, the sum of squared residuals divided by 2σ². So the best θ is the least squares θ for every σ. Move σ and watch: the negative log-likelihood curve changes height and sharpness, but its minimum stays at \(\hat\theta\) = 2.027.`,
eq: String.raw`\[ p(y_i \mid x_i; \theta) = \frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\left(-\frac{(y_i - \theta x_i)^2}{2\sigma^2}\right) \]
\[ -\log L(\theta) = m\log\sigma + \frac{m}{2}\log 2\pi + \frac{1}{2\sigma^2}\sum_{i=1}^{m}\left(y_i - \theta x_i\right)^2 \]`,
sym: [[String.raw`\(\varepsilon_i\)`, "noise on target i, independent, Gaussian, mean 0"], [String.raw`\(\sigma\)`, "noise standard deviation, the same for every point"], [String.raw`\(L(\theta)\)`, "likelihood, the product of the five densities"], [String.raw`\(\frac{1}{2\sigma^2}\)`, "a positive constant when σ is fixed, so it cannot move the minimum"], [String.raw`\(\hat\sigma^2 = \mathrm{SSE}/m\)`, "the maximum likelihood noise variance, found after θ"]],
how: ["State the noise model: independent Gaussian errors with one common σ.", "Write the likelihood as a product of Gaussian densities, one per point.", "Take the negative log: a constant, plus the sum of squared residuals over 2σ².", "Minimize over θ: that is least squares, the same θ for any σ.", "Then set the fitted σ to √(SSE/m), the typical size of the residuals."],
say: String.raw`Under independent Gaussian noise with a fixed variance, the negative log-likelihood equals a constant plus the sum of squared residuals over two sigma squared, so maximum likelihood estimation of the parameters is least squares.`,
num: String.raw`Data x = 1 to 5, y = (2.3, 3.6, 6.4, 7.7, 10.4). \(\hat\theta\) = Σxy/Σx² = <b>2.0273</b>, SSE = <b>0.6191</b>, \(\hat\sigma\) = √(0.6191/5) = <b>0.352</b>. At σ = 1, −log L = <b>4.904</b> at \(\hat\theta\), 5.725 at θ = 2.2 (SSE 2.26).`,
note: String.raw`HW7 Task 1.4 asks for exactly this argument, and it must name the assumption: if σ differed from point to point, each squared residual would carry its own weight 1/σᵢ², and the result would be weighted least squares.`,
r(fig, ctl) {
  const X = [1, 2, 3, 4, 5], Y = [2.3, 3.6, 6.4, 7.7, 10.4], m = 5, Sxx = 55, Sxy = X.reduce((s, x, i) => s + x * Y[i], 0), TH = Sxy / Sxx;
  const SSE = t => X.reduce((s, x, i) => s + (Y[i] - t * x) ** 2, 0), NLL = (t, s) => m * Math.log(s) + m / 2 * Math.log(2 * Math.PI) + SSE(t) / (2 * s * s);
  ctl.innerHTML = sl("l18t", "θ", 1.6, 2.4, 0.01, 1.8) + sl("l18s", "σ", 0.2, 1.5, 0.01, 0.6) + `<div id="l18b"></div>`;
  const u = () => {
    const t = +$("l18t").value, s = +$("l18s").value; $("l18tv").textContent = f(t, 2); $("l18sv").textContent = f(s, 2);
    const a = ML.axes(50, 20, 290, 250, { xmin: 0, xmax: 6, ymin: 0, ymax: 12, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "x", yl: "y", grid: false });
    const xe = Math.min(6, 12 / t);
    let g = a.s + ML.path([[a.X(0), a.Y(0)], [a.X(xe), a.Y(t * xe)]], C.coral, 2);
    const k = 0.45;
    X.forEach((x, i) => {
      const c = t * x, pts = []; for (let j = 0; j <= 60; j++) { const yy = c - 3 * s + 6 * s * j / 60; if (yy >= 0 && yy <= 12) pts.push([a.X(x + k * phi(yy - c, s)), a.Y(yy)]); }
      g += ML.path(pts, C.blue, 1.2) + `<line x1="${a.X(x)}" y1="${a.Y(Math.max(0, c - 3 * s))}" x2="${a.X(x)}" y2="${a.Y(Math.min(12, c + 3 * s))}" stroke="${C.blue}" stroke-width="0.6" opacity="0.6"/>`;
      const d = phi(Y[i] - c, s); g += `<line x1="${a.X(x)}" y1="${a.Y(Y[i])}" x2="${a.X(x + k * d)}" y2="${a.Y(Y[i])}" stroke="${C.teal}" stroke-width="3"/><circle cx="${a.X(x)}" cy="${a.Y(Y[i])}" r="4" fill="var(--p)"/>`;
    });
    const tg = range(1.6, 2.4, 81), nl = tg.map(v => NLL(v, s)), lo = Math.min(...nl), hi = Math.max(...nl);
    const b = ML.axes(420, 20, 230, 150, { xmin: 1.6, xmax: 2.4, ymin: lo, ymax: hi, nx: 4, ny: 3, fx: v => f(v, 1), fy: v => f(v, 0), xl: "θ", yl: "−log L", grid: false });
    g += b.s + ML.path(tg.map((v, i) => [b.X(v), b.Y(nl[i])]), C.purple, 2) + `<line x1="${b.X(TH)}" y1="20" x2="${b.X(TH)}" y2="170" stroke="${C.teal}" stroke-dasharray="3 3"/><circle cx="${b.X(t)}" cy="${b.Y(NLL(t, s))}" r="5" fill="${C.coral}"/>`;
    const dens = X.map((x, i) => phi(Y[i] - t * x, s)), Lk = dens.reduce((p, q) => p * q, 1);
    g += tx(420, 226, `SSE(θ) = ${f(SSE(t), 4)}`, null, "t") + tx(420, 246, `−log L = ${f(NLL(t, s), 3)}`, null, "t") + tx(420, 266, `L = product of bars = ${Lk < 1e-3 ? Lk.toExponential(2) : f(Lk, 5)}`, null, "t") + tx(420, 290, "dashed: best θ = 2.0273 for every σ", null);
    fig.innerHTML = svg(310, g);
    $("l18b").innerHTML = ML.readout([["best θ, least squares", f(TH, 4)], ["fitted σ = √(SSE/m)", f(Math.sqrt(SSE(TH) / m), 4)], ["teal bar heights", dens.map(v => f(v, 2)).join(", ")]]);
  };
  $("l18t").oninput = u; $("l18s").oninput = u; u();
}},

{s: "3. Laplace noise gives MAE", t: "Heavier tails in the noise model give the absolute error",
intu: String.raw`Replace the Gaussian with the Laplace distribution, density (1/2b) exp(−|e|/b). Both curves here have variance 1. The Laplace is taller at zero and has much heavier tails: a residual beyond three standard deviations is about five times as likely. The negative log density, the per-point loss, shows why. For the Gaussian it is a parabola, e²/2 plus a constant, so a far point costs a lot and the fit bends to reduce it. For the Laplace it is a V, |e|/b plus a constant, so a far point costs only in proportion to its distance. Repeat the argument of card 2 and maximum likelihood under Laplace noise minimizes the sum of absolute residuals. Switch the view and move the residual marker.`,
eq: String.raw`\[ p(e) = \frac{1}{2b}\exp\!\left(-\frac{|e|}{b}\right), \qquad \mathrm{Var}(e) = 2b^2 \]
\[ -\log L(\theta) = m\log(2b) + \frac{1}{b}\sum_{i=1}^{m}\left|y_i - h_\theta(x_i)\right| \]`,
sym: [["b", "Laplace scale, the mean absolute deviation, b = 1/√2 for variance 1"], [String.raw`\(-\log p(e)\)`, "the per-point loss implied by the noise model"], ["parabola", "Gaussian: cost grows like e², far points dominate"], ["V shape", "Laplace: cost grows like |e|, every point pulls equally hard"], [String.raw`\(\hat b\)`, "maximum likelihood scale, the mean absolute residual"]],
how: ["Write the Laplace density for each residual.", "Take the negative log: m log 2b plus the sum of |eᵢ| over b.", "With b fixed, minimize the sum of absolute residuals over θ.", "Afterwards estimate the scale b as the mean absolute residual.", "Use this loss when large errors are more common than a Gaussian allows."],
say: String.raw`Independent Laplace noise with a fixed scale makes the negative log-likelihood a constant plus the sum of absolute residuals over b, so maximum likelihood under Laplace noise minimizes the mean absolute error.`,
num: String.raw`Variance 1: Gaussian density at 0 is <b>0.399</b>, Laplace (b = 0.7071) <b>0.707</b>. P(|e| > 3): Gaussian <b>0.0027</b>, Laplace <b>0.0144</b>. Loss at e = 3: Gaussian 5.419, Laplace <b>4.589</b>.`,
note: String.raw`HW7 Task 2.4: an L1 prediction loss is not L1 regularization. The absolute error weighs residuals, a penalty λΣ|wⱼ| on the weights is what drives some of them to zero.`,
r(fig, ctl) {
  let v = 0; const b = 1 / Math.sqrt(2);
  ctl.innerHTML = btns([[0, "density"], [1, "negative log density (the loss)"]], "v") + sl("l18e", "residual e", 0, 5, 0.05, 3) + `<div id="l18c"></div>`;
  const u = () => {
    pick(ctl, "v", v);
    const e0 = +$("l18e").value; $("l18ev").textContent = f(e0, 2);
    const ymax = v ? 8 : 0.8;
    const a = ML.axes(60, 20, 400, 250, { xmin: -5, xmax: 5, ymin: 0, ymax, nx: 10, ny: 4, fx: x => x, fy: y => f(y, v ? 0 : 1), xl: "residual e", yl: v ? "−log p(e)" : "p(e)", grid: false });
    const E = range(-5, 5, 401), G = E.map(e => v ? -Math.log(phi(e, 1)) : phi(e, 1)), Lp = E.map(e => v ? -Math.log(lap(e, b)) : lap(e, b));
    let s = a.s + ML.path(E.map((e, i) => [a.X(e), a.Y(Math.min(ymax, G[i]))]).filter((p, i) => G[i] <= ymax), C.blue, 2.2) + ML.path(E.map((e, i) => [a.X(e), a.Y(Math.min(ymax, Lp[i]))]).filter((p, i) => Lp[i] <= ymax), C.coral, 2.2);
    if (!v) { const sh = E.filter(e => Math.abs(e) >= e0); [-1, 1].forEach(sg => { const pts = sh.filter(e => sg * e > 0); if (pts.length > 1) { s += `<path d="M${a.X(pts[0])} ${a.Y(0)} ${pts.map(e => "L" + a.X(e).toFixed(1) + " " + a.Y(lap(e, b)).toFixed(1)).join(" ")} L${a.X(pts[pts.length - 1])} ${a.Y(0)}Z" fill="${C.coral}" opacity="0.2"/>`; } }); }
    s += `<line x1="${a.X(e0)}" y1="20" x2="${a.X(e0)}" y2="270" stroke="${C.gray}" stroke-dasharray="4 3"/>`;
    const gv = v ? -Math.log(phi(e0, 1)) : phi(e0, 1), lv = v ? -Math.log(lap(e0, b)) : lap(e0, b);
    s += tx(480, 40, "blue: Gaussian, σ = 1", null, "t") + tx(480, 60, "coral: Laplace, b = 0.7071", null, "t") + tx(480, 80, "both have variance 1", null);
    s += tx(480, 120, `at e = ${f(e0, 2)}:`, null, "th") + tx(480, 142, `Gaussian ${f(gv, 4)}`, null, "t") + tx(480, 162, `Laplace ${f(lv, 4)}`, null, "t");
    const tg = 2 * (1 - (0.5 * (1 + erf(e0 / Math.SQRT2)))), tl = Math.exp(-e0 / b);
    s += tx(480, 200, "P(|e| above this):", null, "th") + tx(480, 222, `Gaussian ${tg < 1e-3 ? tg.toExponential(2) : f(tg, 4)}`, null, "t") + tx(480, 242, `Laplace ${tl < 1e-3 ? tl.toExponential(2) : f(tl, 4)}`, null, "t");
    fig.innerHTML = svg(310, s);
    $("l18c").innerHTML = ML.readout([["shape of the loss", v ? "parabola against V" : "switch view to see it"], ["tail ratio Laplace / Gaussian", f(tl / Math.max(tg, 1e-300), 1)]]);
  };
  const erf = z => { const t = 1 / (1 + 0.3275911 * Math.abs(z)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z); return z >= 0 ? y : -y; };
  ctl.querySelectorAll("button[data-v]").forEach(bt => bt.onclick = () => { v = +bt.dataset.v; u(); });
  $("l18e").oninput = u; u();
}},

{s: "4. Mean versus median", t: "Fit a constant: squared error picks the mean, absolute error the median",
intu: String.raw`The simplest model predicts one constant c for every reading. Its mean squared error is smallest at the mean of the readings, and its mean absolute error is smallest at the median. Set the derivative to zero to see why: the MSE derivative is the sum of the residuals, zero at the mean, while the MAE derivative counts readings below c minus readings above c, zero when half are on each side. Drag the last reading far to the right. The mean follows it, the median does not move. Then switch to six readings. With an even count the absolute error is flat between the two middle readings, so any c there is a minimizer. That is the tie HW7 Task 2.3 asks you to report.`,
eq: String.raw`\[ \frac{d}{dc}\,\frac{1}{m}\sum_i (c - y_i)^2 = \frac{2}{m}\sum_i (c - y_i) = 0 \ \Rightarrow \ c = \bar y \]
\[ \frac{d}{dc}\,\frac{1}{m}\sum_i |c - y_i| = \frac{\#\{y_i \lt c\} - \#\{y_i \gt c\}}{m} = 0 \ \Rightarrow \ c = \mathrm{median} \]`,
sym: [["c", "the constant prediction, the simplest possible model"], [String.raw`\(\bar y\)`, "the mean, minimizer of the squared error"], ["median", "the middle reading, minimizer of the absolute error"], ["tie", "with an even count, every c between the two middle readings"], ["breakdown", "one reading can move the mean anywhere, the median needs half of them"]],
how: ["Write the mean loss as a function of c.", "Differentiate and set to zero.", "Squared error: c is the mean.", "Absolute error: c is the median, a whole interval when the count is even.", "In a grid search, report which point of a flat minimum your argmin returns."],
say: String.raw`For a constant prediction the squared error is minimized by the mean and the absolute error by the median, so one extreme reading moves the squared error fit but leaves the absolute error fit almost unchanged.`,
num: String.raw`Readings 3.1, 3.4, 3.5, 3.8 and 12: mean <b>5.16</b>, median <b>3.5</b>. With 3.6 added: mean <b>4.9</b>, and the mean absolute error is <b>1.567</b> for every c in [3.5, 3.6].`,
r(fig, ctl) {
  let six = 0;
  ctl.innerHTML = sl("l18v", "last reading", 3, 15, 0.1, 12) + btns([[0, "five readings"], [1, "six readings (add 3.6)"]], "n") + `<div id="l18d"></div>`;
  const u = () => {
    pick(ctl, "n", six);
    const vv = +$("l18v").value; $("l18vv").textContent = f(vv, 1);
    const A = [3.1, 3.4, 3.5, 3.8, vv].concat(six ? [3.6] : []), mu = mean(A), md = median(A), so = A.slice().sort((p, q) => p - q), n = A.length;
    const lo = six ? so[n / 2 - 1] : md, hi = six ? so[n / 2] : md;
    const a = ML.axes(50, 30, 580, 40, { xmin: 2, xmax: 16, ymin: 0, ymax: 1, nx: 14, ny: 1, fx: v => v, fy: () => "", grid: false });
    let s = a.s + A.map(v => `<circle cx="${a.X(v)}" cy="${a.Y(0.5)}" r="6" fill="${C.gray}" opacity="0.8"/>`).join("");
    s += `<line x1="${a.X(mu)}" y1="22" x2="${a.X(mu)}" y2="78" stroke="${C.blue}" stroke-width="3"/>` + tx(a.X(mu), 18, "mean " + f(mu, 2), "middle", "t");
    s += `<rect x="${a.X(lo) - 2}" y="26" width="${a.X(hi) - a.X(lo) + 4}" height="48" fill="${C.coral}" opacity="0.5"/>` + tx(a.X(md), 114, six ? `median: any c in [${lo}, ${hi}]` : "median " + f(md, 2), "middle", "t");
    const cg = range(2, 16, 281), mse = cg.map(c => mean(A.map(y => (c - y) ** 2))), mae = cg.map(c => mean(A.map(y => Math.abs(c - y))));
    const b1 = ML.axes(60, 130, 240, 140, { xmin: 2, xmax: 16, ymin: 0, ymax: Math.max(...mse), nx: 7, ny: 3, fx: v => v, fy: v => f(v, 0), xl: "constant c", yl: "MSE", grid: false });
    const b2 = ML.axes(400, 130, 240, 140, { xmin: 2, xmax: 16, ymin: 0, ymax: Math.max(...mae), nx: 7, ny: 3, fx: v => v, fy: v => f(v, 1), xl: "constant c", yl: "MAE", grid: false });
    s += b1.s + ML.path(cg.map((c, i) => [b1.X(c), b1.Y(mse[i])]), C.blue, 2) + `<circle cx="${b1.X(mu)}" cy="${b1.Y(mean(A.map(y => (mu - y) ** 2)))}" r="5" fill="${C.blue}"/>`;
    s += b2.s + ML.path(cg.map((c, i) => [b2.X(c), b2.Y(mae[i])]), C.coral, 2) + `<line x1="${b2.X(lo)}" y1="${b2.Y(mean(A.map(y => Math.abs(lo - y))))}" x2="${b2.X(hi)}" y2="${b2.Y(mean(A.map(y => Math.abs(hi - y))))}" stroke="${C.coral}" stroke-width="6" opacity="0.6"/>`;
    fig.innerHTML = svg(320, s);
    $("l18d").innerHTML = ML.readout([["MSE minimizer", f(mu, 3)], ["MAE minimizer", six ? `[${lo}, ${hi}], flat` : f(md, 3)], ["minimum MAE", f(mean(A.map(y => Math.abs(md - y))), 4)]]);
  };
  $("l18v").oninput = u; ctl.querySelectorAll("button[data-n]").forEach(bt => bt.onclick = () => { six = +bt.dataset.n; u(); }); u();
}},

{s: "5. Influence", t: "The derivative of the loss is how hard a residual pulls on the model",
intu: String.raw`Gradient descent never sees the loss itself, only its derivative. The gradient for a weight is the sum over points of the loss derivative at that point's residual, times its feature, so the derivative is each point's influence on the update. HW7 Task 2.2 plots it with autograd. For the per-element squared error e² the derivative is 2e and grows without limit, so a residual of 10 pulls ten times as hard as a residual of 1. For the absolute error it is sign(e), every point pulls with strength 1 whatever its size, and PyTorch picks 0 at e = 0 exactly. For Huber with δ = 1 it is e inside the threshold and clipped to ±δ outside. Move the residual and compare the three pulls.`,
eq: String.raw`\[ \frac{d}{de}e^2 = 2e, \qquad \frac{d}{de}|e| = \mathrm{sign}(e), \qquad \frac{d}{de}h_\delta(e) = \mathrm{clip}(e, -\delta, \delta) \]
\[ \frac{\partial J}{\partial w_j} = \frac{1}{m}\sum_{i=1}^{m} \ell'\!\left(e_i\right) x_j^{(i)} \]`,
sym: [[String.raw`\(\ell'(e)\)`, "derivative of the per-element loss, the influence of one residual"], ["sign(e)", "+1 or −1, PyTorch uses 0 at exactly e = 0"], ["clip", "Huber's derivative: e inside the threshold, ±δ outside"], ["bounded influence", "no single point can dominate the update"], [String.raw`\(x_j^{(i)}\)`, "the feature multiplies the pull, so far-out inputs pull harder too"]],
how: ["Write the loss per element as a function of the residual.", "Differentiate with respect to e.", "Ask what happens as e grows: unbounded, constant, or clipped.", "Multiply by the feature to get the pull on each weight.", "Check with autograd: <code>loss_fn(e, zeros).backward()</code> with reduction sum, then read <code>e.grad</code>."],
say: String.raw`The derivative of the loss with respect to the residual is the influence of a data point on the gradient, unbounded for squared error, constant for absolute error, and bounded by delta for Huber.`,
num: String.raw`At e = 3 the pulls are <b>6</b> for squared error, <b>1</b> for absolute error and <b>1</b> for Huber with δ = 1. At e = 0.5 they are 1, 1 and <b>0.5</b>. At e = 0: 0, PyTorch's subgradient <b>0</b>, and 0.`,
r(fig, ctl) {
  ctl.innerHTML = sl("l18r", "residual e", -5, 5, 0.05, 3) + `<div id="l18f"></div>`;
  const L = [e => e * e, e => Math.abs(e), e => hub(e, 1)], D = [e => 2 * e, e => Math.sign(e), e => psi(e, 1)], N = ["e², MSE per element", "|e|, L1", "Huber δ = 1"];
  const u = () => {
    const e0 = +$("l18r").value; $("l18rv").textContent = f(e0, 2);
    const E = range(-5, 5, 401);
    const a = ML.axes(50, 20, 260, 230, { xmin: -5, xmax: 5, ymin: 0, ymax: 12, nx: 5, ny: 4, fx: v => v, fy: v => v, xl: "residual e", yl: "loss", grid: false });
    const b = ML.axes(390, 20, 260, 230, { xmin: -5, xmax: 5, ymin: -10, ymax: 10, nx: 5, ny: 4, fx: v => v, fy: v => v, xl: "residual e", yl: "derivative", grid: false });
    let s = a.s + b.s + `<line x1="${b.X(-5)}" y1="${b.Y(0)}" x2="${b.X(5)}" y2="${b.Y(0)}" stroke="var(--line)"/>`;
    [0, 1, 2].forEach(k => {
      s += ML.path(E.filter(e => L[k](e) <= 12).map(e => [a.X(e), a.Y(L[k](e))]), LC[k], 2) + ML.path(E.filter(e => Math.abs(D[k](e)) <= 10).map(e => [b.X(e), b.Y(D[k](e))]), LC[k], 2);
      const lv = L[k](e0), dv = D[k](e0);
      if (lv <= 12) s += `<circle cx="${a.X(e0)}" cy="${a.Y(lv)}" r="5" fill="${LC[k]}"/>`;
      s += `<circle cx="${b.X(e0)}" cy="${b.Y(Math.max(-10, Math.min(10, dv)))}" r="5" fill="${LC[k]}"/>`;
      s += tx(60 + k * 210, 312, N[k], null, "t") + `<rect x="${44 + k * 210}" y="303" width="10" height="10" fill="${LC[k]}"/>`;
    });
    fig.innerHTML = svg(322, s);
    $("l18f").innerHTML = ML.readout([0, 1, 2].map(k => [N[k].split(",")[0] + " pull", f(D[k](e0), 3)]));
  };
  $("l18r").oninput = u; u();
}},

{s: "6. Huber loss", t: "Quadratic near zero, linear in the tails, joined smoothly at δ",
intu: String.raw`Huber's loss takes the best of both. For |e| ≤ δ it is ½e², the half squared error, so small residuals are treated as Gaussian noise. For |e| above δ it is δ(|e| − ½δ), a straight line, so large residuals are charged like the absolute error. The two pieces meet at e = ±δ with the same value ½δ² and the same slope δ, which is why Huber is differentiable everywhere and safe for gradient descent. HW7 Task 2.1 implements it with <code>torch.where</code> and checks it against <code>nn.HuberLoss</code> at residuals exactly on the thresholds. Move δ: a small δ makes Huber behave like a scaled absolute error, a large δ makes it the half squared error.`,
eq: String.raw`\[ h_\delta(e) = \begin{cases} \tfrac{1}{2}e^2, & |e| \le \delta \\ \delta\left(|e| - \tfrac{1}{2}\delta\right), & |e| \gt \delta \end{cases} \]
\[ \text{at } |e| = \delta: \ \tfrac{1}{2}\delta^2 = \delta\left(\delta - \tfrac{1}{2}\delta\right), \qquad \text{slope } \tfrac{d}{de}\tfrac{1}{2}e^2 = e = \delta \]`,
sym: [[String.raw`\(\delta\)`, "threshold between the two regimes, in target units"], [String.raw`\(\tfrac{1}{2}e^2\)`, "the quadratic piece, note the half, unlike nn.MSELoss"], [String.raw`\(\delta(|e| - \tfrac{1}{2}\delta)\)`, "the linear piece, slope δ"], ["continuity", "value and slope agree at ±δ, so the loss is smooth enough to train"], ["torch.where", "chooses a branch per element and keeps the autograd graph"]],
how: ["Compute the residual and its absolute value.", "Compute both branches for every element.", "Select per element with <code>torch.where</code>: the quadratic branch where |e| ≤ δ, the linear one elsewhere.", "Reduce with none, mean or sum, and reject δ ≤ 0 and shape mismatches.", "Compare values and gradients with <code>nn.HuberLoss(delta=d)</code>, including e = ±δ."],
say: String.raw`Huber loss is one half e squared for residuals within delta and delta times the absolute residual minus half delta beyond it, with matching value and slope at the threshold, so it is quadratic for small errors and linear for large ones.`,
num: String.raw`δ = 1 at e = (−3, −1, 0, 1, 3): <b>2.5, 0.5, 0, 0.5, 2.5</b>. δ = 2 at e = (−3, −2, 0, 2, 3): <b>4, 2, 0, 2, 4</b>. The branches meet at ½δ²: 0.125, 0.5 and 2 for δ = 0.5, 1 and 2.`,
r(fig, ctl) {
  ctl.innerHTML = sl("l18d2", "δ", 0.25, 3, 0.25, 1) + `<div id="l18g"></div>`;
  const u = () => {
    const d = +$("l18d2").value; $("l18d2v").textContent = f(d, 2);
    const a = ML.axes(50, 20, 380, 230, { xmin: -4, xmax: 4, ymin: 0, ymax: 6, nx: 8, ny: 6, fx: v => v, fy: v => v, xl: "residual e", yl: "loss", grid: false });
    const E = range(-4, 4, 401);
    let s = a.s + ML.path(E.filter(e => 0.5 * e * e <= 6).map(e => [a.X(e), a.Y(0.5 * e * e)]), C.gray, 1.2, "4 4") + ML.path(E.map(e => [a.X(e), a.Y(Math.abs(e))]), C.gray, 1, "1 4");
    const inn = E.filter(e => Math.abs(e) <= d), out1 = E.filter(e => e < -d), out2 = E.filter(e => e > d);
    s += ML.path(inn.map(e => [a.X(e), a.Y(hub(e, d))]), C.teal, 3) + ML.path(out1.filter(e => hub(e, d) <= 6).map(e => [a.X(e), a.Y(hub(e, d))]), C.coral, 3) + ML.path(out2.filter(e => hub(e, d) <= 6).map(e => [a.X(e), a.Y(hub(e, d))]), C.coral, 3);
    [-d, d].forEach(e => { if (Math.abs(e) <= 4) s += `<line x1="${a.X(e)}" y1="20" x2="${a.X(e)}" y2="250" stroke="${C.purple}" stroke-dasharray="3 3"/><circle cx="${a.X(e)}" cy="${a.Y(0.5 * d * d)}" r="4" fill="${C.purple}"/>`; });
    s += tx(450, 40, "teal: ½e² inside ±δ", null, "t") + tx(450, 60, "coral: δ(|e| − ½δ) outside", null, "t") + tx(450, 80, "dashed gray: ½e², dotted: |e|", null) + tx(450, 100, `purple dots: both pieces = ${f(0.5 * d * d, 4)}`, null);
    const ev = [-3, -d, 0, d, 3];
    s += ML.grid([ev], { x: 440, y: 140, cell: 46, fmt: x => f(x, 2), title: "residual", rowLab: false, colLab: false }).s + ML.grid([ev.map(e => hub(e, d))], { x: 440, y: 216, cell: 46, fmt: x => f(x, 3), title: "Huber loss", rowLab: false, colLab: false, hl: new Set(["0,1", "0,3"]) }).s;
    fig.innerHTML = svg(300, s) + ML.code(["residual = pred - target", "absolute = residual.abs()", "per_element = torch.where(absolute <= delta, 0.5 * residual**2,", "                          delta * (absolute - 0.5 * delta))", `ref = nn.HuberLoss(delta=${d}, reduction='none')(pred, target)`, "torch.testing.assert_close(per_element, ref)"], 2);
    $("l18g").innerHTML = ML.readout([["value at ±δ", f(0.5 * d * d, 4)], ["slope at ±δ", f(d, 2)], ["loss at e = 3", f(hub(3, d), 4)]]);
  };
  $("l18d2").oninput = u; u();
}},

{s: "7. SmoothL1 and units", t: "SmoothL1 is Huber divided by δ, and δ carries the target's units",
intu: String.raw`Two traps from HW7 Task 2.4. First, PyTorch also has <code>nn.SmoothL1Loss(beta)</code>, which is Huber divided by β. The two agree only when the threshold is 1. With β = δ = 2 at a residual of 3, Huber gives 4 and SmoothL1 gives 2, so the losses and their gradients differ by a factor of 2, which acts like a different learning rate. Second, δ is a residual, so it has the target's units. A threshold of 1 for a target in millimeters means 1 mm. Rewrite the same target in micrometers and keep δ = 1, and a 0.4 mm residual, 400 µm, sits 400 times past the threshold, deep in the linear region. The physically equivalent threshold is 1000 µm.`,
eq: String.raw`\[ \mathrm{SmoothL1}_\beta(e) = \frac{h_\beta(e)}{\beta} = \begin{cases} \tfrac{1}{2}e^2/\beta, & |e| \lt \beta \\ |e| - \tfrac{1}{2}\beta, & |e| \ge \beta \end{cases} \]
\[ y' = k\,y \ \Rightarrow \ \delta' = k\,\delta \]`,
sym: [[String.raw`\(\beta\)`, "SmoothL1's threshold, called beta in PyTorch"], [String.raw`\(h_\beta / \beta\)`, "SmoothL1 has slope 1 in the tails, Huber has slope δ"], ["k", "unit conversion factor, 1000 from mm to µm"], [String.raw`\(\delta'\)`, "the threshold in the new units, scaled by the same k"], ["equivalence", "same physical residual, same regime, in any units"]],
how: ["Pick one: <code>HuberLoss(delta=d)</code> or <code>SmoothL1Loss(beta=d)</code>, and know they differ by the factor d.", "If you switch, rescale the learning rate by the same factor.", "Choose δ in target units, for example near the size of normal measurement error.", "When the target's units change by k, change δ by k.", "If you standardize the target, δ is in standard deviations of the target."],
say: String.raw`SmoothL1 with threshold beta equals the Huber loss with the same threshold divided by beta, so the two coincide only when the threshold is one, and because delta is a residual it must be rescaled whenever the target's units change.`,
num: String.raw`δ = β = 2 at e = 3: Huber <b>4</b>, SmoothL1 <b>2</b>. δ = 0.5 at e = 2.5: Huber 1.125, SmoothL1 <b>2.25</b>. Residual 0.4 mm with δ = 1 mm: <b>0.08</b> mm², quadratic. As 400 µm with δ = 1 µm: <b>399.5</b>, linear. With δ = 1000 µm: 80,000 µm², the same 0.08 mm².`,
r(fig, ctl) {
  let di = 2, un = 0;
  const DS = [0.5, 1, 2];
  ctl.innerHTML = btns([[0, "δ = β = 0.5"], [1, "δ = β = 1"], [2, "δ = β = 2"]], "d") + btns([[0, "target in mm, δ = 1"], [1, "target in µm, δ = 1"], [2, "target in µm, δ = 1000"]], "u") + `<div id="l18h"></div>`;
  const u = () => {
    pick(ctl, "d", di); pick(ctl, "u", un);
    const d = DS[di], E = range(-4, 4, 321);
    const a = ML.axes(50, 20, 300, 200, { xmin: -4, xmax: 4, ymin: 0, ymax: 6, nx: 4, ny: 3, fx: v => v, fy: v => v, xl: "residual e", yl: "loss", grid: false });
    let s = a.s + ML.path(E.filter(e => hub(e, d) <= 6).map(e => [a.X(e), a.Y(hub(e, d))]), C.blue, 2.4) + ML.path(E.filter(e => hub(e, d) / d <= 6).map(e => [a.X(e), a.Y(hub(e, d) / d)]), C.coral, 2.4, "6 3");
    s += `<circle cx="${a.X(3)}" cy="${a.Y(Math.min(6, hub(3, d)))}" r="5" fill="${C.blue}"/><circle cx="${a.X(3)}" cy="${a.Y(Math.min(6, hub(3, d) / d))}" r="5" fill="${C.coral}"/>`;
    s += tx(60, 290, `blue: HuberLoss(delta=${d}), coral: SmoothL1Loss(beta=${d})`, null, "t") + tx(60, 310, `at e = 3: ${f(hub(3, d), 3)} against ${f(hub(3, d) / d, 3)}, ratio ${d}`, null, "th");
    const r_mm = 0.4, k = un ? 1000 : 1, dd = un === 2 ? 1000 : 1, rv = r_mm * k, lv = hub(rv, dd), quad = rv <= dd;
    const W = 250, x0 = 400, scale = v => x0 + W * Math.min(1, v / (Math.max(rv, dd) * 1.25));
    s += tx(x0, 40, ["units: millimeters", "units: micrometers, δ kept at 1", "units: micrometers, δ rescaled"][un], null, "th");
    s += `<line x1="${x0}" y1="100" x2="${x0 + W}" y2="100" stroke="var(--p)"/><rect x="${x0}" y="80" width="${scale(dd) - x0}" height="40" fill="${C.teal}" opacity="0.25"/>` + tx(x0 + 4, 74, "quadratic zone, |e| ≤ δ", null);
    s += `<circle cx="${scale(rv)}" cy="100" r="7" fill="${C.coral}"/>` + tx(scale(rv), 140, `e = ${rv} ${un ? "µm" : "mm"}`, "middle", "t");
    s += tx(x0, 180, `δ = ${dd} ${un ? "µm" : "mm"}`, null, "t") + tx(x0, 202, `Huber = ${f(lv, lv > 100 ? 1 : 3)} ${quad ? "(quadratic)" : "(linear)"}`, null, "th") + tx(x0, 224, un === 1 ? `the same 0.4 mm error is ${rv / dd} δ deep in the tail` : un === 2 ? "80,000 µm² = 0.08 mm², the same regime" : "0.4 mm is inside δ = 1 mm", null);
    fig.innerHTML = svg(326, s);
    $("l18h").innerHTML = ML.readout([["SmoothL1 / Huber", "1/" + d], ["regime of the 0.4 mm residual", quad ? "quadratic" : "linear"]]);
  };
  ["d", "u"].forEach(kk => ctl.querySelectorAll(`button[data-${kk}]`).forEach(bt => bt.onclick = () => { if (kk === "d") di = +bt.dataset.d; else un = +bt.dataset.u; u(); }));
  u();
}},

{s: "8. One corrupted reading", t: "HW7 Task 2.3: one bad measurement against three losses",
intu: String.raw`Five clean readings, 1.8 to 2.2, and one corrupted reading of 20. Fit a constant with each loss on a grid, as HW7 Task 2.3 does. On the clean data all three choose 2.0. With the corrupted reading, squared error moves to the new mean, 5.0, three units away from every honest reading. Absolute error stays in the flat interval [2.0, 2.1] between the two middle readings, and the HW7 grid search returns its first point. Huber with δ = 1 lands at 2.2: the corrupted residual is clipped to a pull of δ, so it counts like one more reading at the edge of the quadratic zone. Slide the corrupted value. Huber stops moving once the reading is more than δ above the fit.`,
eq: String.raw`\[ \sum_i \mathrm{clip}(c - y_i, -\delta, \delta) = 0: \qquad (5c - 10) - \delta = 0 \ \Rightarrow \ c = 2 + \frac{\delta}{5} = 2.2 \]`,
sym: [["clean readings", "1.8, 1.9, 2.0, 2.1, 2.2, all within δ of the Huber fit"], ["corrupted reading", "20, its residual is clipped to a pull of −δ"], ["MSE fit", "the mean, 30/6 = 5.0"], ["L1 fit", "any c in [2.0, 2.1], the grid returns the first"], ["Huber fit", "2 + δ/5, independent of how large the corruption is"]],
how: ["Make a grid of candidate constants, 0 to 5 in steps of 0.001.", "For each c compute the mean L1, MSE and Huber loss over the readings.", "Take the argmin of each and record the tie convention for L1.", "Repeat with the corrupted reading and tabulate the change.", "Explain the change with the derivative: unbounded, constant, clipped."],
say: String.raw`One corrupted reading moves the squared error constant to the contaminated mean, leaves the absolute error constant inside the middle interval, and moves the Huber constant only by delta over the number of readings, because its pull is clipped.`,
num: String.raw`Clean: all three <b>2.0</b>. With 20: MSE <b>5.0</b> (change +3.0), L1 anywhere in [2.0, 2.1], HW7's grid gives <b>2.005</b>, Huber δ = 1 <b>2.2</b> (change +0.2). With 40 instead of 20: MSE 8.33, Huber still 2.2.`,
r(fig, ctl) {
  let di = 1; const DS = [0.5, 1, 2], CL = [1.8, 1.9, 2.0, 2.1, 2.2];
  ctl.innerHTML = sl("l18o", "corrupted reading", 2.2, 40, 0.1, 20) + btns([[0, "δ = 0.5"], [1, "δ = 1"], [2, "δ = 2"]], "d") + `<div id="l18i"></div>`;
  const u = () => {
    pick(ctl, "d", di);
    const o = +$("l18o").value; $("l18ov").textContent = f(o, 1);
    const d = DS[di], A = CL.concat([o]), mu = mean(A), so = A.slice().sort((p, q) => p - q), lo = so[2], hi = so[3], hb = hubLoc(A, d);
    const a = ML.axes(50, 30, 580, 40, { xmin: 1.5, xmax: 6, ymin: 0, ymax: 1, nx: 9, ny: 1, fx: v => f(v, 1), fy: () => "", grid: false });
    let s = a.s + CL.map(v => `<circle cx="${a.X(v)}" cy="${a.Y(0.5)}" r="6" fill="${C.gray}"/>`).join("") + (o <= 6 ? `<circle cx="${a.X(o)}" cy="${a.Y(0.5)}" r="7" fill="${C.purple}"/>` : tx(a.X(6), 22, `corrupted reading at ${f(o, 1)}, off the axis →`, "end", "t"));
    s += `<line x1="${a.X(Math.min(6, mu))}" y1="22" x2="${a.X(Math.min(6, mu))}" y2="78" stroke="${C.blue}" stroke-width="3"/><rect x="${a.X(lo) - 2}" y="24" width="${a.X(hi) - a.X(lo) + 4}" height="52" fill="${C.coral}" opacity="0.45"/><line x1="${a.X(hb)}" y1="22" x2="${a.X(hb)}" y2="78" stroke="${C.teal}" stroke-width="3"/>`;
    const cg = range(0, 6, 301), curves = [c => mean(A.map(y => (c - y) ** 2)), c => mean(A.map(y => Math.abs(c - y))), c => mean(A.map(y => hub(c - y, d)))];
    const b = ML.axes(60, 120, 330, 160, { xmin: 0, xmax: 6, ymin: 0, ymax: 1, nx: 6, ny: 2, fx: v => v, fy: v => v === 0 ? "min" : v === 1 ? "max" : "", xl: "constant c", yl: "mean loss, rescaled", grid: false });
    s += b.s;
    curves.forEach((cf, k) => { const vals = cg.map(cf), mn = Math.min(...vals), mx = Math.max(...vals); s += ML.path(cg.map((c, i) => [b.X(c), b.Y((vals[i] - mn) / (mx - mn))]), LC[k], 2); });
    const rows = [["loss", "clean", "corrupted", "change"], ["MSE", "2.0", f(mu, 3), "+" + f(mu - 2, 3)], ["L1", "2.0", `[${f(lo, 1)}, ${f(hi, 1)}]`, "≤ +0.1"], [`Huber δ = ${d}`, "2.0", f(hb, 3), "+" + f(hb - 2, 3)]];
    const CX = [398, 508, 588, 666];
    rows.forEach((r, i) => r.forEach((c, j) => s += tx(CX[j], 140 + i * 24, c, j ? "end" : null, i ? "t" : "th")));
    s += tx(420, 250, "blue: MSE, coral: L1, teal: Huber", null) + tx(420, 270, "each curve rescaled to [0, 1]", null);
    fig.innerHTML = svg(300, s);
    $("l18i").innerHTML = ML.readout([["mean (MSE)", f(mu, 3)], ["median interval (L1)", `[${f(lo, 2)}, ${f(hi, 2)}]`], [`Huber, δ = ${d}`, f(hb, 4)]]);
  };
  $("l18o").oninput = u; ctl.querySelectorAll("button[data-d]").forEach(bt => bt.onclick = () => { di = +bt.dataset.d; u(); }); u();
}},

{s: "9. A line through outliers", t: "Fit a line with each loss and watch two corrupted readings tilt it",
intu: String.raw`The same comparison for a real model. Ten readings follow y ≈ 2.3 + 0.46x. Corrupt the last one, then the last two, by adding 6 and 5. These are high-leverage points, at the right end, where a line can pivot cheaply. Least squares pivots: with two corrupted readings its slope more than doubles to 1.00 and the prediction at x = 12 rises from 7.8 to 12.4. The absolute error fit barely moves, slope 0.56. Huber with δ = 1 is in between, 0.76, and a smaller δ moves it toward the absolute error fit. The robust lines are found by iteratively reweighted least squares: each pass gives each point a weight, 1/|e| for absolute error and min(1, δ/|e|) for Huber.`,
eq: String.raw`\[ \min_{\theta}\sum_i \ell\!\left(y_i - \theta_0 - \theta_1 x_i\right) \]
\[ w_i^{\text{L1}} = \frac{1}{|e_i|}, \qquad w_i^{\text{Huber}} = \min\!\left(1, \frac{\delta}{|e_i|}\right) \]`,
sym: [["leverage", "a point far from the mean of x, where it can tilt the line"], ["IRLS", "iteratively reweighted least squares, solve, reweight, repeat"], [String.raw`\(w_i\)`, "weight of point i in the next weighted least squares solve"], ["clean data", "Huber with δ = 1 equals least squares, every residual is inside δ"], ["prediction at x = 12", "the number a user would act on, an extrapolation"]],
how: ["Fit least squares as the starting point.", "Compute the residuals and the weights for the chosen loss.", "Solve weighted least squares with those weights.", "Repeat until θ stops changing.", "Compare slopes and a prediction of interest across the three losses."],
say: String.raw`With corrupted high-leverage readings the least squares line pivots toward them, the absolute error line stays with the bulk of the data, and the Huber line lies between, closer to the robust fit as delta shrinks.`,
num: String.raw`Clean: slopes LS <b>0.463</b>, L1 0.455, Huber 0.463. One corrupted: LS <b>0.791</b>, L1 0.516, Huber 0.564. Two corrupted: LS <b>1.003</b>, L1 <b>0.563</b>, Huber δ = 1 <b>0.759</b>. Prediction at x = 12 with two corrupted: <b>12.44, 8.76, 10.36</b>.`,
r(fig, ctl) {
  let nc = 2, di = 1; const DS = [0.3, 1, 3];
  const X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], Y0 = [2.57, 3.22, 3.37, 4.4, 4.82, 5.04, 5.62, 6.18, 6.27, 6.7];
  ctl.innerHTML = btns([[0, "clean"], [1, "one corrupted (+6 at x = 10)"], [2, "two corrupted (+5 at x = 9)"]], "c") + btns([[0, "Huber δ = 0.3"], [1, "Huber δ = 1"], [2, "Huber δ = 3"]], "d") + `<div id="l18j"></div>`;
  const u = () => {
    pick(ctl, "c", nc); pick(ctl, "d", di);
    const Y = Y0.slice(); if (nc >= 1) Y[9] += 6; if (nc >= 2) Y[8] += 5;
    const d = DS[di], T = [wls(X, Y, X.map(() => 1)), irls(X, Y, r => 1 / Math.max(Math.abs(r), 1e-6), 2000), irls(X, Y, r => Math.min(1, d / Math.max(Math.abs(r), 1e-12)), 500)];
    const a = ML.axes(50, 20, 380, 260, { xmin: 0, xmax: 12, ymin: 0, ymax: 14, nx: 6, ny: 7, fx: v => v, fy: v => v, xl: "x", yl: "y", grid: false });
    let s = a.s;
    T.forEach((t, k) => { const xe = t[1] > 0 ? Math.min(12, (14 - t[0]) / t[1]) : 12; s += ML.path([[a.X(0), a.Y(t[0])], [a.X(xe), a.Y(t[0] + xe * t[1])]], LC[k], 2.2, k === 2 ? "7 3" : null); });
    X.forEach((x, i) => { const bad = (i === 9 && nc >= 1) || (i === 8 && nc >= 2); s += `<circle cx="${a.X(x)}" cy="${a.Y(Y[i])}" r="${bad ? 6 : 4}" fill="${bad ? C.purple : "var(--p)"}"/>`; if (bad) s += `<line x1="${a.X(x)}" y1="${a.Y(Y0[i])}" x2="${a.X(x)}" y2="${a.Y(Y[i])}" stroke="${C.purple}" stroke-dasharray="2 3"/>`; });
    const nm = ["least squares", "absolute error", `Huber δ = ${d}`];
    nm.forEach((n, k) => { s += `<rect x="460" y="${40 + k * 70}" width="12" height="12" fill="${LC[k]}"/>` + tx(480, 50 + k * 70, n, null, "th") + tx(480, 72 + k * 70, `θ = (${f(T[k][0], 3)}, ${f(T[k][1], 3)})`, null, "t") + tx(480, 92 + k * 70, `ŷ(12) = ${f(T[k][0] + 12 * T[k][1], 2)}`, null, "t"); });
    fig.innerHTML = svg(320, s);
    $("l18j").innerHTML = ML.readout([["slopes", T.map(t => f(t[1], 3)).join(", ")], ["purple", "corrupted readings"]]);
  };
  ["c", "d"].forEach(kk => ctl.querySelectorAll(`button[data-${kk}]`).forEach(bt => bt.onclick = () => { if (kk === "c") nc = +bt.dataset.c; else di = +bt.dataset.d; u(); }));
  u();
}},

{s: "10. Reading the residuals", t: "Let the residuals choose the noise model, and so the loss",
intu: String.raw`The loss should match the noise, so look at the noise. Fit a first model, take its residuals, and compare two fitted noise models by their average log-likelihood per point: a Gaussian with the residuals' standard deviation, and a Laplace with their mean absolute deviation from the median. Here 500 residuals come from three generators: pure Gaussian, pure Laplace, and Gaussian with 5 % of the points from a five times wider Gaussian, a common picture of occasional bad measurements. The Gaussian wins only on Gaussian data. The contaminated set looks Gaussian in the middle but its tails favor Laplace, and that is the case for Huber: quadratic for the bulk, linear for the few. Use validation data, never the test set, if you compare losses by fitting.`,
eq: String.raw`\[ \bar\ell_{\mathcal N} = -\tfrac{1}{2}\log\!\left(2\pi\hat\sigma^2\right) - \tfrac{1}{2}, \qquad \hat\sigma^2 = \frac{1}{m}\sum_i (e_i - \bar e)^2 \]
\[ \bar\ell_{\text{Lap}} = -\log\!\left(2\hat b\right) - 1, \qquad \hat b = \frac{1}{m}\sum_i \left|e_i - \mathrm{median}(e)\right| \]`,
sym: [[String.raw`\(\bar\ell\)`, "average log-likelihood per residual at the fitted noise parameters, higher is better"], [String.raw`\(\hat\sigma\)`, "maximum likelihood Gaussian spread"], [String.raw`\(\hat b\)`, "maximum likelihood Laplace scale"], ["contamination", "a small fraction of points from a much wider distribution"], ["Huber", "the compromise when the bulk is Gaussian and the tails are not"]],
how: ["Fit a first model, least squares is fine, and compute its residuals.", "Plot their histogram on a log count axis if the tails matter.", "Fit σ and b to the residuals and compare the average log-likelihoods.", "Gaussian clearly better: keep MSE. Laplace better or heavy tails: try MAE or Huber.", "Pick δ near where the histogram leaves the Gaussian, and confirm on validation data."],
say: String.raw`The residual distribution tells you which noise model, and so which loss, the data support, by comparing the maximized Gaussian and Laplace log-likelihoods, with Huber as the choice for a Gaussian bulk with heavy tails.`,
num: String.raw`Average log-likelihood per point, Gaussian against Laplace: Gaussian data <b>−1.493 against −1.536</b>, Laplace data −1.395 against <b>−1.300</b>, contaminated data −1.865 against <b>−1.744</b>. The contaminated set has <b>4.6 %</b> of residuals beyond ±3, the Gaussian set 0.4 %.`,
r(fig, ctl) {
  let gk = 0; const N = 500, b0 = 1 / Math.sqrt(2);
  const gen = k => { const r = rng(1818), g = gauss(r), out = []; for (let i = 0; i < N; i++) { if (k === 0) out.push(g()); else if (k === 1) { const uu = r() - 0.5; out.push(-b0 * (uu >= 0 ? 1 : -1) * Math.log(1 - 2 * Math.abs(uu))); } else { const z = g(); out.push(r() < 0.05 ? 5 * z : z); } } return out; };
  const SETS = [0, 1, 2].map(gen);
  ctl.innerHTML = btns([[0, "Gaussian noise"], [1, "Laplace noise"], [2, "Gaussian with 5 % wide outliers"]], "g") + `<div id="l18k"></div>`;
  const u = () => {
    pick(ctl, "g", gk);
    const e = SETS[gk], mu = mean(e), sg = Math.sqrt(mean(e.map(v => (v - mu) ** 2))), md = median(e), bb = mean(e.map(v => Math.abs(v - md)));
    const lg = -0.5 * Math.log(2 * Math.PI * sg * sg) - 0.5, ll = -Math.log(2 * bb) - 1;
    const W = 0.4, bins = Array(30).fill(0); e.forEach(v => { const k = Math.floor((v + 6) / W); if (k >= 0 && k < 30) bins[k]++; });
    const a = ML.axes(62, 20, 388, 250, { xmin: -6, xmax: 6, ymin: -4, ymax: 0, nx: 6, ny: 4, fx: v => v, fy: v => "1e" + v, xl: "residual", yl: "density, log scale", grid: false });
    let s = a.s;
    bins.forEach((n, k) => { if (n) { const dn = n / (N * W), y = a.Y(Math.max(-4, Math.log10(dn))); s += `<rect x="${a.X(-6 + k * W)}" y="${y}" width="${a.X(W) - a.X(0) - 1}" height="${a.Y(-4) - y}" fill="${C.gray}" opacity="0.45"/>`; } });
    const E = range(-6, 6, 241);
    s += ML.path(E.map(x => [a.X(x), a.Y(Math.max(-4, Math.log10(phi(x - mu, sg))))]), C.blue, 2.2) + ML.path(E.map(x => [a.X(x), a.Y(Math.max(-4, Math.log10(lap(x - md, bb))))]), C.coral, 2.2);
    const out = e.filter(v => Math.abs(v) > 3).length, win = lg > ll ? "Gaussian" : "Laplace";
    s += tx(470, 40, "blue: fitted Gaussian", null, "t") + tx(470, 60, "coral: fitted Laplace", null, "t") + tx(470, 80, "gray: histogram of 500 residuals", null);
    s += tx(470, 120, `fitted σ = ${f(sg, 3)}, b = ${f(bb, 3)}`, null, "t") + tx(470, 146, `avg log-lik Gaussian ${f(lg, 3)}`, null, "t") + tx(470, 166, `avg log-lik Laplace ${f(ll, 3)}`, null, "t");
    s += tx(470, 196, `better fit: ${win}`, null, "th") + tx(470, 218, `beyond ±3: ${out} of ${N} (${f(100 * out / N, 1)} %)`, null, "t") + tx(470, 248, gk === 0 ? "suggests: MSE" : gk === 1 ? "suggests: MAE" : "suggests: Huber, quadratic bulk, linear tails", null, "th");
    fig.innerHTML = svg(310, s);
    $("l18k").innerHTML = ML.readout([["largest |residual|", f(Math.max(...e.map(Math.abs)), 3)], ["log-lik difference, Laplace − Gaussian", f(ll - lg, 3)]]);
  };
  ctl.querySelectorAll("button[data-g]").forEach(bt => bt.onclick = () => { gk = +bt.dataset.g; u(); }); u();
}},

{s: "11. With the agent", t: "Do it with the agent: a tested loss module and a robust fit",
intu: String.raw`HW7 Part 2 as one tested module: Huber written with <code>torch.where</code> and checked against PyTorch, the Gaussian and Laplace negative log-likelihoods, the constant fits of the corrupted-reading experiment, and a line fitted with each loss. The tests pin numbers from these cards, so a missing one half, a SmoothL1 swapped for Huber, or a broadcasting shape bug fails on a value you can check here.`,
eq: String.raw`\[ \texttt{manual\_huber} \to \texttt{nll\_gaussian},\ \texttt{nll\_laplace} \to \texttt{fit\_constant} \to \texttt{fit\_line} \]`,
sym: [["manual huber", "torch.where, three reductions, rejects bad delta and shape mismatch"], ["nll gaussian, nll laplace", "per-sample negative log-likelihoods with σ or b given"], ["fit constant", "grid argmin for L1, MSE and Huber, first-minimizer tie rule"], ["fit line", "closed form for MSE, IRLS for L1 and Huber"], ["tests", "card 1, 2, 6, 8 and 9 numbers"]],
how: ["Paste the command.", "Read <code>manual_huber</code>: is the quadratic piece <code>0.5 * residual**2</code>, and is the shape checked before any arithmetic?", "Read the tests: do they include residuals exactly at ±δ?", "Run the tests.", "Commit the module with its tests."],
say: String.raw`A loss module implements Huber with an explicit branch, the Gaussian and Laplace negative log-likelihoods and robust fits, and its tests pin values that expose the factor of one half, the SmoothL1 scale and shape bugs.`,
num: String.raw`Tests expect Huber δ = 1 on (0.5, −0.5, −1, 3) to give mean <b>0.8125</b>, the Gaussian fit \(\hat\theta\) = <b>2.0273</b>, constants <b>5.0</b> and <b>2.2</b> for MSE and Huber on the corrupted readings, and slopes <b>1.003, 0.563, 0.759</b> for the two-outlier line.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/losses.py using torch and numpy. manual_huber(prediction, target, delta=1.0, reduction='mean'): raise ValueError for different shapes, delta <= 0 or a reduction other than none, mean, sum; residual = prediction - target; per_element = torch.where(residual.abs() <= delta, 0.5 * residual**2, delta * (residual.abs() - 0.5 * delta)); apply the reduction. nll_gaussian(residuals, sigma) and nll_laplace(residuals, b) returning the mean negative log-likelihood per sample. fit_constant(readings, loss, delta=1.0) that evaluates the mean loss on torch.linspace(0, 5, 5001, dtype=float64) and returns the first argmin. fit_line(x, y, loss, delta=1.0) returning (intercept, slope): least squares for 'mse', iteratively reweighted least squares from the least squares start for 'l1' (weights 1/max(|r|, 1e-6), 2000 passes) and 'huber' (weights min(1, delta/|r|), 500 passes). Create tests/test_losses.py with pytest: manual_huber matches nn.HuberLoss in values and gradients for delta 0.5, 1, 2 at residuals [-3, -delta, 0, delta, 3] for all reductions; on prediction [2, 5, 3.5, 6] and target [1.5, 5.5, 4.5, 3] the mean Huber with delta 1 is 0.8125; shapes (4, 1) and (4,) raise ValueError; for x = [1..5], y = [2.3, 3.6, 6.4, 7.7, 10.4] the theta minimizing nll_gaussian of y - theta*x on a fine grid is about 2.0273 for sigma 0.5 and for sigma 2; fit_constant on [1.8, 1.9, 2.0, 2.1, 2.2, 20.0] gives 5.0 for mse, 2.2 for huber, and a value in [2.0, 2.1] for l1; fit_line on x = 1..10, y = [2.57, 3.22, 3.37, 4.4, 4.82, 5.04, 5.62, 6.18, 11.27, 12.7] gives slopes close to 1.0027, 0.5625 and 0.7586 for mse, l1 and huber. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".......                                                  [100%]", "7 passed in 1.42s"],
    checks: ["manual_huber uses 0.5 * residual**2 inside delta and is compared with nn.HuberLoss, not SmoothL1Loss", "the shape check runs before any subtraction, so (4, 1) against (4,) raises", "the tests include residuals exactly at plus and minus delta", "the constant fit reports which minimizer the L1 grid returns", "fit_line starts from least squares and the robust slopes are below the least squares slope on the corrupted data"]
  });
}},

{s: "12. Test", t: "Lesson 18 test: losses from probability",
intu: String.raw`Twelve questions on residuals and reductions, Gaussian and Laplace likelihoods, mean and median, influence, Huber and SmoothL1, units and corrupted readings.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to overfitting and regularization.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Residuals e = ŷ − y are (1, −2, 0.5, 3). The mean squared error is", o: ["1.625", "3.5625", "14.25", "2.5"], a: 1, why: "Squares 1, 4, 0.25, 9 sum to 14.25, divided by 4 gives 3.5625. The MAE would be 6.5/4 = 1.625. Card 1." },
    { q: "Predictions have shape (8, 1) and targets shape (8,). nn.MSELoss(pred, target) averages over", o: ["8 matched pairs", "64 pairs, after broadcasting to (8, 8), with only a warning", "nothing, it raises an error", "8 pairs after squeezing automatically"], a: 1, why: "Broadcasting compares every prediction with every target. Assert equal shapes first. Card 1." },
    { q: "Targets are y = h(x) + ε with independent Gaussian ε of fixed σ. Doubling σ changes the maximum likelihood θ", o: ["by a factor of 2", "by a factor of 4", "not at all, σ only scales the squared error term", "only if m is small"], a: 2, why: "−log L = m log σ + const + SSE/(2σ²). The θ-dependent part is SSE times a positive constant. Card 2." },
    { q: "A least squares fit on 8 points has SSE = 2.0. The maximum likelihood noise standard deviation is", o: ["0.25", "0.5", "2.0", "0.0625"], a: 1, why: String.raw`\(\hat\sigma^2\) = SSE/m = 2/8 = 0.25, so \(\hat\sigma\) = 0.5. Card 2.` },
    { q: "Independent noise with density proportional to exp(−|e|/b) leads, by maximum likelihood, to minimizing", o: ["the sum of squared residuals", "the sum of absolute residuals", "the largest residual", "the Huber loss"], a: 1, why: "This is the Laplace density, whose negative log is |e|/b plus a constant. Card 3." },
    { q: "Fit a constant to 4, 5, 6, 7, 28. Squared error and absolute error choose", o: ["10 and 6", "6 and 10", "10 and 5.5", "6 and 6"], a: 0, why: "The mean is 50/5 = 10, the median is 6. The reading 28 drags only the mean. Card 4." },
    { q: "Fit a constant by absolute error to 1, 2, 3, 5, 8, 9. The minimizers are", o: ["only 4", "every c in [3, 5]", "only 3", "every c in [2, 8]"], a: 1, why: "With an even count the absolute error is flat between the two middle readings, 3 and 5. Card 4." },
    { q: "Huber loss with δ = 2 at a residual of 5 is", o: ["12.5", "10", "8", "6"], a: 2, why: "Outside δ: δ(|e| − δ/2) = 2(5 − 1) = 8. The quadratic piece would give 12.5. Card 6." },
    { q: "At a residual of −4, the derivatives of e², |e| and Huber with δ = 1 are", o: ["−8, −1, −1", "−4, −1, −4", "8, 1, 1", "−8, −4, −1"], a: 0, why: "2e = −8, sign(e) = −1, and Huber's derivative is clipped to −δ = −1. Card 5." },
    { q: "nn.SmoothL1Loss(beta=0.5) at a residual of 3 gives", o: ["1.375", "2.75", "4.5", "3"], a: 1, why: "Huber with δ = 0.5 gives 0.5(3 − 0.25) = 1.375, and SmoothL1 is Huber divided by β: 2.75. Card 7." },
    { q: "Huber with δ = 1 fits a constant to 7.0, 7.2, 7.4, 7.6, 30. The fit is", o: ["11.84", "7.4", "7.55", "7.3"], a: 2, why: "The four clean residuals stay inside δ and 30 pulls with −1: (4c − 29.2) − 1 = 0, so c = 30.2/4 = 7.55. Card 8." },
    { q: "A Huber threshold of 0.2 m was tuned with the target in meters. The target is now stored in centimeters. The equivalent δ is", o: ["0.2", "2", "20", "0.002"], a: 2, why: "δ is a residual in target units, so it scales by 100: 20 cm. Card 7." }
  ], "Lesson 18 test");
}}
],
summary: String.raw`A loss is a statement about the noise. Write the residual as e = ŷ − y, apply a per-element loss, and reduce with mean, sum or none, after checking that prediction and target shapes match, because (N, 1) against (N,) silently broadcasts. If targets are predictions plus independent Gaussian noise with one fixed σ, the negative log-likelihood is a constant plus the sum of squared residuals over 2σ², so maximum likelihood is least squares, and \(\hat\sigma^2\) = SSE/m afterwards. Laplace noise, with heavier tails, gives the absolute error instead. For a constant model squared error picks the mean and absolute error the median, a flat interval when the count is even. The derivative of the loss is each residual's influence: 2e without bound for squared error, sign(e) for absolute error, and e clipped to ±δ for Huber, which is ½e² inside δ and δ(|e| − ½δ) outside, smooth at the joint. SmoothL1 is Huber divided by its threshold, and δ must be rescaled with the target's units. With one corrupted reading or corrupted high-leverage points, least squares moves a lot, absolute error barely, and Huber in between. The residual histogram and the fitted Gaussian and Laplace log-likelihoods tell you which loss your data support.`,
sheet: [[String.raw`\[ -\log L = m\log\sigma + \tfrac{m}{2}\log 2\pi + \frac{1}{2\sigma^2}\sum_i e_i^2 \]`, String.raw`Gaussian noise: least squares, then \(\hat\sigma^2\) = SSE/m`], [String.raw`\[ -\log L = m\log 2b + \frac{1}{b}\sum_i |e_i| \]`, String.raw`Laplace noise: absolute error, then \(\hat b\) = mean |e|`], [String.raw`\[ h_\delta(e) = \tfrac{1}{2}e^2 \ (|e| \le \delta), \qquad \delta\left(|e| - \tfrac{1}{2}\delta\right) \ (|e| \gt \delta) \]`, "Huber loss"], [String.raw`\[ h'_\delta(e) = \mathrm{clip}(e, -\delta, \delta) \]`, "Huber influence, bounded by δ"], [String.raw`\[ \mathrm{SmoothL1}_\beta = h_\beta / \beta \]`, "PyTorch's SmoothL1Loss against HuberLoss"], [String.raw`\[ \arg\min_c \sum_i (c - y_i)^2 = \bar y, \qquad \arg\min_c \sum_i |c - y_i| = \mathrm{median} \]`, "constant fits"]],
sources: ["AME 5970 HW7 questions, Part 2 (regression losses and outliers: reduction and shapes, Task 2.1 Huber, Task 2.2 cost and influence, Task 2.3 one corrupted measurement, Task 2.4 three claims)", "AME 5970 HW7 solutions doc, Part 2 (manual_huber, derivatives at e = 3, the location table 2.0, 5.0, 2.005, 2.2) and Part 1.4 (fixed-variance Gaussian noise leads to squared error)", "AME 5970 Lecture 5 probability and maximum likelihood tutorial, topic order (the PDF was not available to this build)", "Andrew Ng, CS229 lecture notes, Part I section 3: Probabilistic interpretation of least squares", "Andrew Ng, Machine Learning Specialization, course 1, week 1: the cost function J with the factor of one half", "P. J. Huber, Robust estimation of a location parameter, Annals of Mathematical Statistics, 1964", "PyTorch documentation: MSELoss, L1Loss, HuberLoss, SmoothL1Loss (reductions and the beta scale relation)", "Goodfellow, Bengio and Courville, Deep Learning, section 5.5.1 (conditional log-likelihood and mean squared error)"]
});
})();
