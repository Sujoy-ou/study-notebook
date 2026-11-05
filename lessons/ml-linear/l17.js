(function () {
/* ML shelf, Part 4, Lesson 17: Feature scaling and normalization. Follows AME 5970 Lecture 3 notes section 12 (feature scaling), HW3 Part 2 Task 8 (training-only standardization, the leakage boundary, predicting a future house), HW6 Problem 2 (the audit, fit and apply, back to original units), HW5 Problem 1 (BatchNorm1d) and the distribution shift discussion of HW7 Part 4, with Andrew Ng's Machine Learning course week 2 (feature scaling, mean normalization) as the spine. Data: the HW3 ex1data2 housing file and the HW3 seeded split. */
const C = ML.C, H3 = ML.HW3, D2 = H3.D2, PERM = H3.PERM;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const money = v => (v < 0 ? "−$" : "$") + Math.round(Math.abs(v)).toLocaleString("en-US");
const M = D2.length, col = j => D2.map(r => r[j]);
const mean = a => a.reduce((s, v) => s + v, 0) / a.length, sd = (a, dd) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - (dd || 0))); };
/* eigenvalues of a small symmetric matrix by Jacobi rotations */
const eig = A0 => { const n = A0.length, A = A0.map(r => r.slice()); for (let sw = 0; sw < 60; sw++) { let off = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2; if (off < 1e-22) break; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) { if (Math.abs(A[p][q]) < 1e-300) continue; const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c; for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; } for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; } } } return A.map((r, i) => r[i]).sort((a, b) => a - b); };
/* curvature matrix X^T X / m of a design with an intercept column */
const hess = F => { const X = F.map(r => [1].concat(r)), p = X[0].length, Hm = []; for (let i = 0; i < p; i++) { Hm.push([]); for (let j = 0; j < p; j++) Hm[i].push(X.reduce((s, r) => s + r[i] * r[j], 0) / X.length); } return Hm; };
/* batch gradient descent on half-MSE from zero, returning the cost gap after each step */
const gdGap = (F, y, a, n) => { const X = F.map(r => [1].concat(r)), p = X[0].length, th = H3.lstsq(X, y), Jf = t => X.reduce((s, r, i) => s + (r.reduce((u, v, j) => u + v * t[j], 0) - y[i]) ** 2, 0) / (2 * X.length), Js = Jf(th); let t = Array(p).fill(0); const G = [Jf(t) - Js]; for (let k = 0; k < n; k++) { const e = X.map((r, i) => r.reduce((u, v, j) => u + v * t[j], 0) - y[i]); t = t.map((v, j) => v - a * X.reduce((s, r, i) => s + r[j] * e[i], 0) / X.length); G.push(Jf(t) - Js); } return G; };
const SZ = col(0), BR = col(1), PR = col(2);
/* HW3 split statistics */
const TR = PERM.slice(0, 37), TE = PERM.slice(37);
const muT = [0, 1].map(j => mean(TR.map(i => D2[i][j]))), sdT = [0, 1].map(j => sd(TR.map(i => D2[i][j])));
const muA = [0, 1].map(j => mean(col(j))), sdA = [0, 1].map(j => sd(col(j)));
const THZ = H3.lstsq(TR.map(i => [1, (D2[i][0] - muT[0]) / sdT[0], (D2[i][1] - muT[1]) / sdT[1]]), TR.map(i => D2[i][2]));
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const gauss = r => () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

addLesson("ml", "linear", {
level: "Core", num: "Lesson 17",
id: "ml-linear-l17", title: "Feature scaling and normalization", short: "17. Feature scaling",
big: String.raw`The housing data have house sizes in the thousands of square feet and bedroom counts near three. The model does not care, the least squares line is the same in any units, but gradient descent cares a great deal: the curvature of the cost along each parameter scales with the square of its feature, so the condition number of HW3's raw design is about 94 million and no single learning rate suits every direction. Scaling the features changes the coordinates of the bowl, not its minimum. This lesson measures that, compares standardization with Ng's mean normalization and min-max scaling, and shows what scaling cannot fix: two correlated features still tilt the bowl. Then the habits that keep a scaled model honest: fit the statistics on the training rows only, reuse them on every later input, handle the population versus sample standard deviation and constant columns, and convert the coefficients back to dollars per square foot. Scaling is not calibration, as a sensor offset shows. The last card previews BatchNorm, which applies the same idea inside a network, batch by batch.`,
bridge: String.raw`The source is the professor's Lecture 3 notes, section 12, with HW3 Task 8 for the training-only standardizer and the future prediction, HW6 Problem 2 for the audit, the fit and apply pattern and the back-transformation of coefficients, HW5 Problem 1 for BatchNorm1d, and HW7 Part 4 for the warning that scaling does not remove a shift. Andrew Ng's Machine Learning course, week 2 (gradient descent in practice I: feature scaling and mean normalization) is the spine, with Deep Learning Specialization course 2, week 1 (normalizing inputs) and week 3 (batch normalization).`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Units are curvature", t: "Change a feature's units and you change the curvature of the bowl",
intu: String.raw`The curvature matrix of the half-MSE cost is (1/m)XᵀX, so a feature measured in large numbers gives a huge curvature along its own weight, while the intercept column of ones gives a curvature near 1. Choose the units of the two housing features and read the three eigenvalues, and κ below the picture. In square feet and bedroom counts, κ is about 94 million. Gradient descent at its best learning rate needs roughly κ steps per factor e of progress, so it is hopeless. Size in thousands of square feet brings κ to 324, and standardizing both features brings it to 3.5. The right panel runs gradient descent at the best rate for each choice, from the same start, and plots the remaining cost gap.`,
eq: String.raw`\[ H = \frac{1}{m}X^TX, \qquad \kappa = \frac{\lambda_{\max}(H)}{\lambda_{\min}(H)}, \qquad \alpha^* = \frac{2}{\lambda_{\max} + \lambda_{\min}}, \qquad \text{factor per step} = \frac{\kappa - 1}{\kappa + 1} \]`,
sym: [["H", "curvature matrix of the half-MSE cost, with the ones column, 3 × 3 here"], [String.raw`\(\kappa\)`, "condition number, how elongated the bowl is"], [String.raw`\(\alpha^*\)`, "the best fixed learning rate for a quadratic"], [String.raw`\((\kappa - 1)/(\kappa + 1)\)`, "error factor per step at that rate, close to 1 when κ is large"], ["same minimum", "units move the coordinates, the fitted line is unchanged"]],
how: ["Multiply a feature by c: its column of X, and so its curvature, scale by c and c².", "Compute H = XᵀX/m with the intercept and take its eigenvalues.", "κ = largest over smallest. Above about 1000, plain gradient descent will be slow.", "Rescale or standardize until κ is small, then α near 1/λmax works for every direction.", "The normal equation of Lesson 15 is unaffected by units. Only iterative methods care."],
say: String.raw`The units of a feature set the curvature of the cost along its weight, so features on very different scales give a large condition number, and gradient descent then needs a tiny learning rate and very many steps.`,
num: String.raw`Raw (sq ft, count): eigenvalues <b>0.049, 1.06, 4.6 million</b>, κ ≈ <b>9.4e7</b>. Size in thousands: κ = <b>324</b>. Both standardized: eigenvalues 0.44, 1, 1.56, κ = <b>3.55</b>.`,
r(fig, ctl) {
  let us = 0, ub = 0;
  ctl.innerHTML = btns([[0, "size in sq ft"], [1, "size in 1000 sq ft"], [2, "size standardized"]], "s") + btns([[0, "bedrooms as counts"], [1, "bedrooms standardized"]], "b") + `<div id="uc"></div>`;
  const u = () => {
    pick(ctl, "s", us); pick(ctl, "b", ub);
    const F = D2.map(r => [us === 0 ? r[0] : us === 1 ? r[0] / 1000 : (r[0] - muA[0]) / sdA[0], ub === 0 ? r[1] : (r[1] - muA[1]) / sdA[1]]);
    const ev = eig(hess(F)), kap = ev[2] / ev[0], ast = 2 / (ev[2] + ev[0]), fac = (kap - 1) / (kap + 1);
    const a = ML.axes(60, 20, 250, 230, { xmin: 0, xmax: 3, ymin: -2, ymax: 7, nx: 3, ny: 9, fx: () => "", fy: v => "1e" + v, yl: "eigenvalue of H", grid: false });
    let s = a.s;
    ev.forEach((v, i) => { const y0 = a.Y(-2), y1 = a.Y(Math.log10(v)); s += `<rect x="${a.X(i + 0.2)}" y="${y1}" width="${a.X(0.6) - a.X(0)}" height="${y0 - y1}" fill="${[C.teal, C.blue, C.coral][i]}" opacity="0.8"/>` + tx(a.X(i + 0.5), y1 - 5, v < 100 ? f(v, 3) : v.toExponential(2), "middle"); });
    s += tx(a.X(0.5), 266, "λmin", "middle") + tx(a.X(2.5), 266, "λmax", "middle");
    const G = gdGap(F, PR, ast, 300);
    const b = ML.axes(390, 20, 260, 230, { xmin: 0, xmax: 300, ymin: -10, ymax: 12, nx: 3, ny: 11, fx: v => v, fy: v => v % 4 === 0 ? "1e" + v : "", xl: "iteration at α*", yl: "J − J*", grid: false });
    s += b.s + ML.path(G.map((g, i) => [b.X(i), b.Y(Math.max(-10, Math.min(12, Math.log10(Math.max(g, 1e-12)))))]), C.coral, 2);
    fig.innerHTML = svg(290, s);
    $("uc").innerHTML = ML.readout([["κ", kap < 1e4 ? f(kap, 2) : kap.toExponential(2)], ["best α", ast < 1e-3 ? ast.toExponential(2) : f(ast, 4)], ["factor per step", fac > 0.9999 ? "1 − " + (1 - fac).toExponential(1) : f(fac, 4)], ["gap after 300 steps", G[300].toExponential(2)]]);
  };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { us = +b.dataset.s; u(); });
  ctl.querySelectorAll("button[data-b]").forEach(b => b.onclick = () => { ub = +b.dataset.b; u(); }); u();
}},

{s: "2. Three recipes", t: "Standardize, mean normalize, or min-max: they are not equally good",
intu: String.raw`Ng's lecture offers two recipes: divide by the range so every feature is roughly within ±1, or subtract the mean and divide by the range, which he calls mean normalization. The course uses standardization, subtract the mean and divide by the standard deviation. A fourth common recipe, min-max, maps each feature to [0, 1]. All four tame the raw κ of 94 million, but not equally. Min-max leaves the features uncentered, so they correlate with the intercept column. Dividing by the range leaves a variance near 0.05, much smaller than the intercept's 1. Standardization gives every column mean 0 and variance 1, the same as the ones column, which is why it wins. Pick a recipe and compare the strips and κ.`,
eq: String.raw`\[ z_{\text{std}} = \frac{x - \mu}{\sigma}, \qquad z_{\text{mean}} = \frac{x - \mu}{x_{\max} - x_{\min}}, \qquad z_{\text{minmax}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}} \]`,
sym: [["standardization", "mean 0, standard deviation 1, the course default"], ["mean normalization", "Ng's recipe, mean 0, spread by the range"], ["min-max", "values in [0, 1], not centered"], ["centering", "makes the feature columns orthogonal to the ones column"], ["Ng's rule of thumb", "roughly −1 to 1 is fine, ±3 is fine, ±100 or ±0.0001 is not"]],
how: ["Compute the statistics on the training rows: mean, standard deviation, minimum and maximum.", "Apply one recipe to every feature column, never to the ones column.", "Check the result: means near 0 and spreads near 1 for standardization.", "Compute κ of the scaled design once. It tells you whether α near 0.1 will work.", "Store the statistics. Every later input needs exactly the same transform."],
say: String.raw`Standardization centers each feature and divides by its standard deviation, which makes the feature columns orthogonal to the intercept and of unit variance and gives the smallest condition number of the common recipes.`,
num: String.raw`κ with the intercept: raw <b>9.4e7</b>, min-max <b>85</b>, mean normalization <b>57</b>, standardization <b>3.55</b>. Size statistics: μ = 2000.7, σ = 786.2, range 852 to 4478.`,
r(fig, ctl) {
  let k = 3;
  const R = [["raw", v => v], ["min-max", (v, j) => (v - Math.min(...col(j))) / (Math.max(...col(j)) - Math.min(...col(j)))], ["mean normalization", (v, j) => (v - muA[j]) / (Math.max(...col(j)) - Math.min(...col(j)))], ["standardization", (v, j) => (v - muA[j]) / sdA[j]]];
  ctl.innerHTML = btns(R.map((r, i) => [i, r[0]]), "k") + `<div id="rc"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const F = D2.map(r => [R[k][1](r[0], 0), R[k][1](r[1], 1)]), ev = eig(hess(F)), kap = ev[2] / ev[0];
    const all = F.flat(), lo = Math.min(...all, -0.1), hi = Math.max(...all, 1.1);
    const sc = k === 0 ? (v => 40 + 600 * Math.log10(Math.max(v, 0.5)) / Math.log10(5000)) : (v => 40 + 600 * (v - lo) / (hi - lo));
    let s = tx(40, 20, k === 0 ? "raw values on a log axis: bedrooms near 3, size near 2000" : `scaled values, axis from ${f(lo, 2)} to ${f(hi, 2)}`, null, "th");
    [["size", 0, C.blue, 70], ["bedrooms", 1, C.coral, 130]].forEach(([n, j, c, y]) => { s += tx(40, y - 18, n, null, "t") + `<line x1="40" y1="${y}" x2="640" y2="${y}" stroke="var(--line)"/>` + F.map(r => `<circle cx="${sc(r[j])}" cy="${y + (j ? 0 : 0)}" r="4" fill="${c}" opacity="0.45"/>`).join(""); });
    if (k) [0, 1].forEach(v => { if (v >= lo && v <= hi) s += `<line x1="${sc(v)}" y1="40" x2="${sc(v)}" y2="150" stroke="${C.gray}" stroke-dasharray="3 3"/>` + tx(sc(v), 166, v, "middle"); });
    const st = j => { const c2 = F.map(r => r[j]); return [mean(c2), sd(c2), Math.min(...c2), Math.max(...c2)].map(v => Math.abs(v) < 5e-4 ? 0 : v); };
    const rows = [["", "mean", "std", "min", "max"], ["size"].concat(st(0).map(v => Math.abs(v) >= 100 ? f(v, 0) : f(v, 3))), ["bedrooms"].concat(st(1).map(v => f(v, 3)))];
    rows.forEach((r, i) => r.forEach((c, j) => s += tx(j ? 140 + j * 85 : 40, 196 + i * 20, c, j ? "end" : null, i ? "t" : "th")));
    s += tx(560, 196, `κ = ${kap < 1e4 ? f(kap, 2) : kap.toExponential(2)}`, "middle", "th") + tx(560, 216, `α* = ${(2 / (ev[0] + ev[2])).toExponential(2)}`, "middle");
    fig.innerHTML = svg(260, s);
    $("rc").innerHTML = ML.readout([["recipe", R[k][0]], ["condition number", kap < 1e4 ? f(kap, 2) : kap.toExponential(2)]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "3. Correlation tilts", t: "Scaling fixes the units, not the correlation between features",
intu: String.raw`After standardization each feature has variance 1, but bigger houses tend to have more bedrooms, correlation ρ = 0.56. The curvature matrix of the two weights is then [[1, ρ], [ρ, 1]], with eigenvalues 1 + ρ and 1 − ρ along the diagonals. The bowl is tilted 45° and still elongated, κ = (1 + ρ)/(1 − ρ) = 3.55. That is harmless at 0.56, but two nearly duplicate features with ρ = 0.99 give κ = 199 even when perfectly standardized, and ρ = 1 is the rank-deficient case of Lesson 15. Slide ρ and watch the ellipses and the gradient descent path. Removing correlation takes a rotation, PCA whitening from Lesson 12, which neither standardization nor BatchNorm performs.`,
eq: String.raw`\[ H = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix}, \qquad \lambda = 1 \pm \rho, \qquad \kappa = \frac{1 + \rho}{1 - \rho} \]`,
sym: [[String.raw`\(\rho\)`, "correlation of the two standardized features"], [String.raw`\(1 + \rho\)`, "curvature along the direction where both weights move together"], [String.raw`\(1 - \rho\)`, "curvature along the direction where they move oppositely"], ["whitening", "rotate to the eigenvectors and rescale, κ becomes 1"], [String.raw`\(\rho \to 1\)`, "the features become duplicates, Lesson 15's rank deficiency"]],
how: ["Standardize, then compute the correlation matrix of the features.", "Its eigenvalues are the curvatures of the scaled problem.", "κ above about 100 from correlation means near-duplicate features.", "Drop or combine one of them, or use PCA, or add L2 regularization (Lesson 19).", "Do not expect standardization alone to fix it."],
say: String.raw`Standardized but correlated features give a curvature matrix equal to their correlation matrix, so the bowl stays elongated with condition number one plus rho over one minus rho.`,
num: String.raw`Housing ρ = <b>0.560</b>: eigenvalues <b>1.560 and 0.440</b>, κ = <b>3.55</b>. ρ = 0.9 gives κ = 19, ρ = 0.99 gives κ = <b>199</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("rr", "ρ", -0.98, 0.98, 0.01, 0.56) + `<div id="rh"></div>`;
  const u = () => {
    const r = +$("rr").value; $("rrv").textContent = f(r, 2);
    const box = { xmin: -3, xmax: 3, ymin: -3, ymax: 3, nx: 6, ny: 6, fx: v => v, fy: v => v, xl: "w₁ − w₁*", yl: "w₂ − w₂*", grid: false };
    const a = ML.axes(60, 20, 260, 260, box);
    let s = a.s;
    const Q = (x, y) => 0.5 * (x * x + 2 * r * x * y + y * y);
    for (let lv = 0.25; lv <= 4.1; lv *= 1.9) { const pts = range(0, 2 * Math.PI, 120).map(t => { const ux = Math.cos(t), uy = Math.sin(t), q = Q(ux, uy), rr = Math.sqrt(lv / q); return [a.X(rr * ux), a.Y(rr * uy)]; }).filter(p => p[0] > 55 && p[0] < 325 && p[1] > 15 && p[1] < 285); s += ML.path(pts, C.blue, 1); }
    const ast = 2 / ((1 + Math.abs(r)) + (1 - Math.abs(r))), P = [[2.5, -1.2]]; for (let i = 0; i < 25; i++) { const [x, y] = P[i]; P.push([x - ast * (x + r * y), y - ast * (r * x + y)]); }
    s += ML.path(P.map(p => [a.X(p[0]), a.Y(p[1])]), C.coral, 1.6) + P.map(p => `<circle cx="${a.X(p[0])}" cy="${a.Y(p[1])}" r="2.5" fill="${C.coral}"/>`).join("");
    const kap = (1 + Math.abs(r)) / (1 - Math.abs(r)), d10 = Math.hypot(P[10][0], P[10][1]) / Math.hypot(2.5, 1.2);
    s += tx(380, 44, `eigenvalues ${f(1 + r, 3)} and ${f(1 - r, 3)}`, null, "t") + tx(380, 66, `κ = ${f(kap, 2)}`, null, "th") + tx(380, 100, "coral: gradient descent at the best α,", null) + tx(380, 116, "25 steps from (2.5, −1.2)", null) + tx(380, 140, `distance left after 10 steps: ${f(100 * d10, 1)} %`, null, "t");
    s += tx(380, 182, Math.abs(r) < 0.05 ? "uncorrelated: round contours" : r > 0 ? "positive ρ: ellipses along w₁ = −w₂" : "negative ρ: ellipses along w₁ = w₂", null) + tx(380, 200, "the long axis is the direction the", null) + tx(380, 216, "data cannot pin down well", null);
    fig.innerHTML = svg(320, s);
    $("rh").innerHTML = ML.readout([["housing", "ρ = 0.560, κ = 3.55"], ["this ρ", `κ = ${f(kap, 2)}`]]);
  };
  $("rr").oninput = u; u();
}},

{s: "4. Training rows only", t: "Fit the scaler on the training rows, then reuse it everywhere",
intu: String.raw`HW3 Task 8.1: the test houses stand for future inputs, which do not exist when the model is built. If their values help compute the mean and standard deviation, information from the test set leaks into training and the evaluation stops imitating the future. So fit the statistics on the 37 training houses only, store them, and apply the same stored numbers to the training rows, the 10 test rows and every later house. A consequence surprises students: the scaled test features do not have mean 0. They have mean −0.24 and −0.28 here, and HW3 even asserts that. Switch between the correct fit and the leaky fit and compare the statistics.`,
eq: String.raw`\[ \mu_j = \frac{1}{m_{\text{train}}}\sum_{i \in \text{train}} x_j^{(i)}, \quad \sigma_j = \sqrt{\frac{1}{m_{\text{train}}}\sum_{i \in \text{train}}\left(x_j^{(i)} - \mu_j\right)^2}, \quad z_j = \frac{x_j - \mu_j}{\sigma_j} \ \text{for every row} \]`,
sym: [["fit", "compute and store μ and σ, training rows only"], ["transform", "apply the stored μ and σ, never refit"], ["leakage", "test values shaping the preprocessing"], ["test mean", "not 0 after the training transform, and that is correct"], ["pipeline", "the stored statistics are part of the model, saved with θ"]],
how: ["Split first, with a seed.", "<code>mean, scale = fit_standardizer(X_train)</code>.", "<code>transform(X_train)</code>, <code>transform(X_test)</code>, <code>transform(X_new)</code> with the same two arrays.", "Assert the training z has mean 0 and std 1, and that the test z does not.", "Save the statistics with the parameters. A model without its scaler cannot predict."],
say: String.raw`Scaling statistics are fitted on the training rows only and then applied unchanged to training, test and future inputs, so the test set never influences the model and its scaled mean need not be zero.`,
num: String.raw`Training fit: μ = (<b>2044.5, 3.216</b>), σ = (844.5, 0.776). Test z means (<b>−0.244, −0.279</b>). All 47 rows: μ = (2000.7, 3.170), σ = (786.2, 0.753), the leak.`,
note: String.raw`HW6 Task 2.2 adds the subtle version: standardizing each split with its own statistics is also wrong, even if no test row reaches the optimizer, because then each split lives in different coordinates.`,
r(fig, ctl) {
  let leak = 0;
  ctl.innerHTML = btns([[0, "fit on the 37 training rows"], [1, "fit on all 47 rows (leak)"]], "k") + `<div id="tl"></div>`;
  const u = () => {
    pick(ctl, "k", leak);
    const mu = leak ? muA : muT, sg = leak ? sdA : sdT;
    const a = ML.axes(60, 30, 400, 120, { xmin: 500, xmax: 4600, ymin: 0, ymax: 2, nx: 4, ny: 2, fx: v => Math.round(v), fy: () => "", xl: "house size (sq ft)", grid: false });
    let s = a.s + `<rect x="${a.X(mu[0] - sg[0])}" y="30" width="${a.X(mu[0] + sg[0]) - a.X(mu[0] - sg[0])}" height="120" fill="${C.teal}" opacity="0.1"/><line x1="${a.X(mu[0])}" y1="30" x2="${a.X(mu[0])}" y2="150" stroke="${C.teal}" stroke-width="2"/>` + tx(a.X(mu[0]), 24, "μ ± σ used by the scaler", "middle");
    TR.forEach(i => s += `<circle cx="${a.X(D2[i][0])}" cy="${a.Y(1.3)}" r="4" fill="${C.blue}" opacity="0.7"/>`); TE.forEach(i => s += `<circle cx="${a.X(D2[i][0])}" cy="${a.Y(0.6)}" r="5" fill="${C.coral}"/>`);
    s += tx(470, 70, "blue: 37 training houses", null) + tx(470, 90, "coral: 10 test houses", null);
    const zt = TE.map(i => [(D2[i][0] - mu[0]) / sg[0], (D2[i][1] - mu[1]) / sg[1]]), ztr = TR.map(i => [(D2[i][0] - mu[0]) / sg[0], (D2[i][1] - mu[1]) / sg[1]]);
    const mz = A => [mean(A.map(r => r[0])), mean(A.map(r => r[1]))];
    s += tx(60, 210, "", null) + tx(60, 214, `μ = (${f(mu[0], 1)}, ${f(mu[1], 3)}), σ = (${f(sg[0], 1)}, ${f(sg[1], 3)})`, null, "th");
    s += tx(60, 240, `training z mean = (${f(mz(ztr)[0], 3)}, ${f(mz(ztr)[1], 3)})`, null, "t") + tx(60, 262, `test z mean = (${f(mz(zt)[0], 3)}, ${f(mz(zt)[1], 3)})`, null, "t");
    s += tx(60, 292, leak ? "the test rows helped choose μ and σ: the evaluation is no longer a rehearsal of the future" : "the test rows never touched the scaler: a fair rehearsal of new houses", null, "th");
    fig.innerHTML = svg(310, s) + ML.code(["mean, scale, constant = fit_standardizer(" + (leak ? "X_house_raw)       # leak: includes test rows" : "X_house_train_raw)") , "X_train = add_intercept(transform_standardizer(X_house_train_raw, mean, scale))", "X_test = add_intercept(transform_standardizer(X_house_test_raw, mean, scale))", "assert not np.allclose(X_test[:, 1:].mean(axis=0), 0.0)   # expected"], 0);
    $("tl").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { leak = +b.dataset.k; u(); }); u();
}},

{s: "5. Edge cases", t: "Which standard deviation, and what to do with a constant column",
intu: String.raw`Two details decide whether your numbers match the homework. First, NumPy's <code>std</code> defaults to the population formula, dividing by m, <code>ddof=0</code>, which HW3, HW5 and HW6 all use. pandas and MATLAB default to dividing by m − 1, and Ng's exercise code inherits that. For house size the two differ by 1 %, harmless for optimization but enough to fail a test. Second, a column that never varies has σ = 0, and dividing by it gives NaN. HW3 replaces that scale by 1 and records the column in a mask, HW6 raises a <code>ValueError</code>, and BatchNorm adds a small ε under the square root. Pick a column and a policy and see the first five scaled values.`,
eq: String.raw`\[ \sigma_{\text{pop}} = \sqrt{\tfrac{1}{m}\textstyle\sum_i (x_i - \mu)^2}, \qquad \sigma_{\text{sample}} = \sqrt{\tfrac{1}{m - 1}\textstyle\sum_i (x_i - \mu)^2}, \qquad z = \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} \]`,
sym: [["ddof = 0", "population standard deviation, NumPy default, the course choice"], ["ddof = 1", "sample standard deviation, pandas and MATLAB default"], ["safe scale", "HW3: replace σ = 0 by 1, the column becomes all zeros"], ["raise", "HW6: refuse to standardize a constant column"], [String.raw`\(\varepsilon\)`, "BatchNorm's 1e−5 under the square root, keeps the division finite"]],
how: ["State the ddof in the code, even when it is the default: <code>X.std(axis=0, ddof=0)</code>.", "Match the reference when reproducing a number: Ng's 794.7 is ddof = 1.", "Check for constant columns before dividing: <code>np.isclose(scale, 0)</code>.", "Choose a policy on purpose and test it: safe scale, an error, or ε.", "A constant column carries no information. Dropping it is often the cleanest fix."],
say: String.raw`Standardization in this course uses the population standard deviation, and a constant column must be handled explicitly with a safe scale, an error or a small epsilon, because its standard deviation is zero.`,
num: String.raw`Size: σ = <b>786.20</b> with ddof = 0 and <b>794.70</b> with ddof = 1, ratio 0.9893. Constant column of 3s: safe scale gives z = <b>0</b>, ε = 1e−5 gives 0, plain division gives <b>NaN</b>.`,
r(fig, ctl) {
  let cj = 0, pol = 0;
  ctl.innerHTML = btns([[0, "size"], [1, "bedrooms"], [2, "a constant column of 3s"]], "c") + btns([[0, "ddof = 0"], [1, "ddof = 1"], [2, "HW3 safe scale"], [3, "HW6 raise"], [4, "ε = 1e−5"], [5, "plain division"]], "p") + `<div id="ed"></div>`;
  const u = () => {
    pick(ctl, "c", cj); pick(ctl, "p", pol);
    const v = cj === 2 ? D2.map(() => 3) : col(cj), mu = mean(v), s0 = sd(v), s1 = sd(v, 1);
    let scale = pol === 1 ? s1 : s0, msg = "", z;
    if (s0 === 0) { if (pol === 2) { scale = 1; msg = "σ = 0, replaced by 1, column recorded in constant_mask"; } else if (pol === 3) msg = "ValueError: a constant column cannot be standardized"; else if (pol === 4) { msg = "σ² + ε = 1e−5 under the root, output 0"; } else if (pol === 5 || pol <= 1) msg = "0 / 0 gives nan, which spreads into every later number"; }
    if (pol === 3 && s0 === 0) z = null;
    else if (pol === 4) z = v.slice(0, 5).map(x => (x - mu) / Math.sqrt(s0 * s0 + 1e-5));
    else z = v.slice(0, 5).map(x => scale === 0 ? NaN : (x - mu) / scale);
    let s = tx(30, 24, ["size (sq ft)", "bedrooms", "constant column"][cj], null, "th") + tx(30, 48, `μ = ${f(mu, 3)}, σ with ddof 0 = ${f(s0, 3)}, with ddof 1 = ${f(s1, 3)}`, null, "t");
    s += ML.grid([v.slice(0, 5)], { x: 120, y: 84, cell: 70, fmt: x => f(x, cj === 0 ? 0 : 0), title: "first five raw values", rowLab: false, colLab: false }).s;
    s += z ? ML.grid([z.map(x => isFinite(x) ? x : 0)], { x: 120, y: 190, cell: 70, fmt: x => f(x, 4), title: "scaled", rowLab: false, colLab: false, hl: new Set([0, 1, 2, 3, 4].map(j => "0," + j)) }).s.replace(/>0\.0000</g, z.every(x => isFinite(x)) ? ">0.0000<" : ">nan<") : tx(120, 200, "no output: the function raised", null, "th");
    s += tx(30, 280, msg || (pol === 1 ? "ddof = 1: every z is 0.989 times the ddof = 0 value for size" : "ddof = 0: the course convention"), null, "th");
    fig.innerHTML = svg(300, s);
    $("ed").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { cj = +b.dataset.c; u(); });
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pol = +b.dataset.p; u(); }); u();
}},

{s: "6. A new house", t: "Predict a future house with the stored training transform",
intu: String.raw`HW3 Task 8.4: price a 1650 square foot, three bedroom house. The model was fitted on standardized features, so the raw input must go through exactly the training pipeline: put the features in training column order, subtract the stored training means, divide by the stored training scales, add the intercept, multiply by θ. Step through it. The answer is $300,081. Forget the scaling and feed the raw numbers to the standardized θ, and the model predicts $194.7 million, a bug that no shape check catches. Ng's version of this exercise fits all 47 houses with the normal equation and gets $293,081, a different but equally valid number from different training rows.`,
eq: String.raw`\[ z = \left(\frac{1650 - 2044.51}{844.47}, \ \frac{3 - 3.2162}{0.7758}\right) = (-0.4672, -0.2787), \qquad \hat y = \theta^T [1, z_1, z_2] \]`,
sym: [["column order", "size then bedrooms, exactly as in training"], [String.raw`\(\mu, \sigma\)`, "the stored training statistics, not refitted on the new house"], [String.raw`\(\theta\)`, "(353,621, 117,775, −5,313), in dollars per standard deviation"], ["intercept", "353,621 is the training mean price, because z is centered"], ["silent bug", "raw input into a standardized model, no error, absurd output"]],
how: ["Arrange the raw input as one row: [[1650, 3]].", "Subtract the stored training means.", "Divide by the stored training scales.", "Add the leading 1 and multiply by θ.", "Sanity check: a typical house should cost near the training mean price."],
say: String.raw`A prediction for a new input applies the stored training transformation in the training column order before the model, and skipping that transformation gives a wrong answer without any error.`,
num: String.raw`z = (<b>−0.4672, −0.2787</b>). Price = 353,621 + 117,775 × (−0.4672) − 5,313 × (−0.2787) = <b>$300,081</b>. Without scaling: <b>$194,667,010</b>.`,
r(fig, ctl) {
  let bug = 0;
  ctl.innerHTML = btns([[0, "with the stored transform"], [1, "forgot to scale"]], "k");
  const raw = [1650, 3], z = [(raw[0] - muT[0]) / sdT[0], (raw[1] - muT[1]) / sdT[1]];
  const host = document.createElement("div"); ctl.appendChild(host);
  const draw = k => {
    pick(ctl, "k", bug);
    const inp = bug ? raw : z, pr = THZ[0] + THZ[1] * inp[0] + THZ[2] * inp[1];
    const stages = [["raw row", `[${raw[0]}, ${raw[1]}]`], ["minus μ", bug ? "skipped" : `[${f(raw[0] - muT[0], 2)}, ${f(raw[1] - muT[1], 4)}]`], ["divide by σ", bug ? "skipped" : `[${f(z[0], 4)}, ${f(z[1], 4)}]`], ["add the 1", `[1, ${f(inp[0], bug ? 0 : 4)}, ${f(inp[1], bug ? 0 : 4)}]`], ["times θ", money(pr)]];
    let s = "";
    stages.forEach(([lab, val], i) => { const x = 20 + i * 132, on = i === k; s += `<g class="${on ? "c-teal" : i < k ? "c-blue" : "c-gray"}"><rect x="${x}" y="40" width="120" height="70" rx="8" stroke-width="${on ? 1.6 : 0.6}"/></g>` + tx(x + 60, 64, lab, "middle", "th") + tx(x + 60, 90, i <= k ? val : "", "middle", "t"); if (i < 4) s += arrow(x + 120, 75, x + 132, 75, "var(--p)", 1.4); });
    s += tx(20, 150, `stored μ = (${f(muT[0], 2)}, ${f(muT[1], 4)}), σ = (${f(sdT[0], 2)}, ${f(sdT[1], 4)})`, null, "t") + tx(20, 172, `θ = (${THZ.map(v => Math.round(v).toLocaleString("en-US")).join(", ")})`, null, "t");
    s += tx(20, 206, k === 4 ? (bug ? "absurd: the raw 1650 was read as 1650 standard deviations" : "near the training mean price of $353,621, as a typical house should be") : "", null, "th");
    fig.innerHTML = svg(230, s) + ML.code(["def predict_house_price(size_sqft, bedrooms, mean, scale, theta):", "    raw = np.array([[size_sqft, bedrooms]], dtype=float)", bug ? "    scaled = raw                                   # the bug" : "    scaled = transform_standardizer(raw, mean, scale)", "    return float(predict_linear(add_intercept(scaled), theta)[0])"], k >= 3 ? 3 : k >= 1 ? 2 : 1);
  };
  let cur = 0;
  ML.stepper(host, 5, k => { cur = k; draw(k); }, ["raw", "center", "scale", "intercept", "predict"]);
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { bug = +b.dataset.k; draw(cur); });
}},

{s: "7. Back to dollars", t: "Convert standardized coefficients back to original units",
intu: String.raw`HW6 Task 2.6. A weight on a standardized feature means dollars per standard deviation of that feature, which nobody can use. Expand the standardized model and collect terms: each raw weight is the standardized weight divided by the feature's scale, times the target's scale if the target was standardized too, and the raw intercept absorbs the means. On HW3's model the size weight 117,775 dollars per standard deviation becomes 139.47 dollars per square foot, and the bedroom weight −5,313 becomes −6,849 dollars per bedroom at fixed size. Step through the algebra, then check that both routes give the same $300,081. If the target was scaled, RMSE in dollars is the target's σ times the standardized RMSE.`,
eq: String.raw`\[ w_j = \frac{s_y\,w'_j}{s_j}, \qquad b = \mu_y + s_y b' - \sum_j w_j \mu_j, \qquad \mathrm{RMSE}_{\$} = s_y\,\mathrm{RMSE}_z \]`,
sym: [[String.raw`\(w'_j, b'\)`, "weights and intercept learned in standardized units"], [String.raw`\(\mu_j, s_j\)`, "training mean and scale of feature j"], [String.raw`\(\mu_y, s_y\)`, "training mean and scale of the target, 0 and 1 if it was not scaled"], [String.raw`\(w_j\)`, "dollars per square foot, dollars per bedroom"], ["at fixed", "each raw weight is a change with the other features held fixed"]],
how: ["Write ŷ = μy + sy(b' + Σ w'ⱼ(xⱼ − μⱼ)/sⱼ).", "Collect the coefficient of each raw xⱼ: sy w'ⱼ/sⱼ.", "Collect the constant: μy + sy b' − Σ wⱼμⱼ.", "Check numerically: raw X @ w + b equals the scaled route to rounding.", "Interpret each raw weight with the other features held fixed, and only within the data's range."],
say: String.raw`A standardized weight is converted to original units by multiplying by the target scale and dividing by the feature scale, and the intercept absorbs the means, so both routes give identical predictions.`,
num: String.raw`HW3 model, target not scaled: w = (117,775/844.47, −5,313/0.7758) = (<b>139.47 $/sq ft, −6,849 $/bedroom</b>), b = <b>$90,507</b>. 90,507 + 139.47 × 1650 − 6,849 × 3 = <b>$300,081</b>.`,
r(fig, ctl) {
  const w = [THZ[1] / sdT[0], THZ[2] / sdT[1]], b = THZ[0] - w[0] * muT[0] - w[1] * muT[1];
  const lines = [
    [String.raw`\hat y = b' + w'_1 \frac{x_1 - \mu_1}{s_1} + w'_2 \frac{x_2 - \mu_2}{s_2}`, `the model as trained: b' = ${Math.round(THZ[0]).toLocaleString()}, w' = (${Math.round(THZ[1]).toLocaleString()}, ${Math.round(THZ[2]).toLocaleString()})`],
    [String.raw`w_1 = \frac{w'_1}{s_1} = \frac{117{,}775}{844.47} = 139.47`, "dollars per square foot, bedrooms held fixed"],
    [String.raw`w_2 = \frac{w'_2}{s_2} = \frac{-5{,}313}{0.7758} = -6{,}849`, "dollars per extra bedroom, size held fixed"],
    [String.raw`b = b' - w_1\mu_1 - w_2\mu_2 = 90{,}507`, "the price at zero size and zero bedrooms, far outside the data"],
    [String.raw`90{,}507 + 139.47(1650) - 6{,}849(3) = 300{,}081`, "the same prediction as card 6, by the raw route"]
  ];
  const draw = k => {
    fig.innerHTML = `<div style="padding:4px 0">${lines.map((l, i) => `<div style="margin:5px 0;padding:6px 10px;border-radius:8px;border:1px solid ${i === k ? C.teal : "var(--line)"};background:${i === k ? "var(--teal-bg)" : "var(--panel)"};opacity:${i <= k ? 1 : 0.25}">\\[ ${l[0]} \\]<div class="sm" style="margin-top:2px">${i <= k ? l[1] : ""}</div></div>`).join("")}</div>` + ML.code(["w_raw = theta[1:] / scale                     # [139.47, -6848.71]", "b_raw = theta[0] - mean @ w_raw              # 90507.22", "np.allclose(X_raw @ w_raw + b_raw, X_scaled @ theta)   # True"], k >= 4 ? 2 : k >= 3 ? 1 : k >= 1 ? 0 : -1) + ML.readout([["raw weights", `${f(w[0], 2)} $/sq ft, ${Math.round(w[1]).toLocaleString()} $/bedroom`], ["raw intercept", money(b)]]);
    typesetMath(fig);
  };
  ML.stepper(ctl, lines.length, draw, ["the trained model", "size weight", "bedroom weight", "intercept", "check"]);
}},

{s: "8. Not calibration", t: "Scaling with training statistics does not remove a shift",
intu: String.raw`HW7 Part 4's warning, with fresh numbers. A model learns y = 3x − 2 from training readings x between 0 and 10. In deployment the observed readings run from 2 to 12. Two different worlds can produce that: a sensor that now reads 2 too high, or a real population of larger inputs. The training scaler maps both to the same shifted z values, so scaling cannot tell them apart and does not undo either. With the sensor offset, predictions are 6 too high, and subtracting the known offset before scaling fixes it. Re-centering the deployment batch also looks like a fix in that world, but in the real-shift world it creates an error of −6. Try every combination.`,
eq: String.raw`\[ x_{\text{obs}} = x + 2 \ \Rightarrow \ \hat y - E[y \mid x] = 3 \times 2 = 6, \qquad z = \frac{x_{\text{obs}} - \mu_{\text{train}}}{\sigma_{\text{train}}} \ \text{stays shifted} \]`,
sym: [["sensor offset", "the measurement changed, the physics did not"], ["population shift", "the inputs really are larger, the rule y = 3x − 2 still holds"], ["same histogram", "both worlds show readings from 2 to 12, unlabeled data cannot separate them"], ["known correction", "subtract the calibrated offset before the stored scaler"], ["re-centering", "standardizing each deployment batch with its own mean, not a general fix"]],
how: ["Keep the training scaler fixed in deployment.", "If a calibration offset is known, correct the raw reading first, then scale.", "Do not re-standardize deployment batches to make them look like training.", "Monitor the deployment input histogram. A shift is a question to investigate, not to normalize away.", "Labeled deployment data, even a few, are what separate the two worlds."],
say: String.raw`Standardizing with training statistics is an invertible change of coordinates, so it leaves a shifted deployment input shifted, and only knowledge of the measurement process tells a sensor offset from a real change in the population.`,
num: String.raw`Sensor offset +2: bias <b>+6</b>, MSE ≈ 36 + 1 = <b>37</b>, corrected bias <b>0</b>. Real shift: no treatment bias <b>0</b>, re-centering bias <b>−6</b>. Noise σ = 1 in both worlds.`,
r(fig, ctl) {
  let w = 0, tr = 0;
  const r = rng(17), g = gauss(r), N = 300;
  const xt = Array.from({ length: N }, () => 10 * r()), mu = mean(xt), sg = sd(xt);
  const xa = Array.from({ length: N }, () => 10 * r()), na = Array.from({ length: N }, () => g());
  ctl.innerHTML = btns([[0, "world A: sensor reads 2 high"], [1, "world B: real inputs 2 larger"]], "w") + btns([[0, "no treatment"], [1, "subtract the known offset"], [2, "re-center the batch"]], "t") + `<div id="cb"></div>`;
  const u = () => {
    pick(ctl, "w", w); pick(ctl, "t", tr);
    const xp = w ? xa.map(x => x + 2) : xa, xo = xa.map(x => x + 2), yT = xp.map((x, i) => 3 * x - 2 + na[i]);
    const xin = tr === 1 ? xo.map(x => x - 2) : xo, bm = mean(xin), z = tr === 2 ? xin.map(x => (x - bm) / sg) : xin.map(x => (x - mu) / sg);
    const yh = z.map(v => 3 * (mu + sg * v) - 2), bias = mean(yh.map((v, i) => v - yT[i])), mse = mean(yh.map((v, i) => (v - yT[i]) ** 2));
    const a = ML.axes(60, 20, 260, 120, { xmin: -2.5, xmax: 2.5, ymin: 0, ymax: 1, nx: 5, ny: 1, fx: v => v, fy: () => "", xl: "z with the training scaler", grid: false });
    let s = a.s;
    const hist = (Z, c, op) => { const bins = Array(25).fill(0); Z.forEach(v => { const k = Math.floor((v + 2.5) / 0.2); if (k >= 0 && k < 25) bins[k]++; }); const mx = 40; return bins.map((n, k) => `<rect x="${a.X(-2.5 + k * 0.2)}" y="${a.Y(n / mx)}" width="${a.X(0.2) - a.X(0) - 1}" height="${a.Y(0) - a.Y(n / mx)}" fill="${c}" opacity="${op}"/>`).join(""); };
    s += hist(xt.map(x => (x - mu) / sg), C.blue, 0.35) + hist(z, C.coral, 0.6);
    s += tx(60, 14, "blue: training z, coral: deployment z as fed to the model", null);
    const b = ML.axes(60, 190, 260, 110, { xmin: -5, xmax: 40, ymin: -5, ymax: 40, nx: 3, ny: 3, fx: v => v, fy: v => v, xl: "true y", yl: "predicted", grid: false });
    s += b.s + `<line x1="${b.X(-5)}" y1="${b.Y(-5)}" x2="${b.X(40)}" y2="${b.Y(40)}" stroke="${C.gray}" stroke-dasharray="4 3"/>` + yT.slice(0, 120).map((v, i) => `<circle cx="${b.X(v)}" cy="${b.Y(Math.max(-5, Math.min(40, yh[i])))}" r="2" fill="${C.coral}" opacity="0.6"/>`).join("");
    s += tx(380, 40, w ? "world B: the inputs really grew" : "world A: the sensor is off by +2", null, "th") + tx(380, 62, ["no treatment", "known offset subtracted, then scaled", "deployment batch re-centered"][tr], null, "t");
    s += tx(380, 100, `mean prediction error = ${f(bias, 2)}`, null, "th") + tx(380, 122, `MSE = ${f(mse, 2)}`, null, "t") + tx(380, 150, Math.abs(bias) < 0.5 ? "unbiased here" : "biased", null, "th");
    s += tx(380, 196, "the coral histogram looks the same", null) + tx(380, 212, "in both worlds without treatment:", null) + tx(380, 228, "the data alone cannot say which", null) + tx(380, 244, "correction is right", null);
    fig.innerHTML = svg(340, s);
    $("cb").innerHTML = ML.readout([["training scaler", `μ = ${f(mu, 2)}, σ = ${f(sg, 2)}`], ["deployment mean reading", f(mean(xo), 2)]]);
  };
  ctl.querySelectorAll("button[data-w]").forEach(b => b.onclick = () => { w = +b.dataset.w; u(); });
  ctl.querySelectorAll("button[data-t]").forEach(b => b.onclick = () => { tr = +b.dataset.t; u(); }); u();
}},

{s: "9. BatchNorm preview", t: "BatchNorm standardizes inside the network, one batch at a time",
intu: String.raw`HW5 Problem 1 runs the same standardization on a batch of four specimens with three features, axis 0 over the rows. In training mode BatchNorm1d uses the current batch's mean and population variance, with ε = 1e−5 inside the square root, so the constant third feature becomes zeros instead of NaN. It also updates running estimates with momentum 0.1, and those use the sample variance, dividing by N − 1. In evaluation mode it uses the running estimates instead, which after one batch are still mostly their initial values 0 and 1. So a new specimen is scaled very differently in the two modes. Step through the batch. Lesson 35 puts this layer to work.`,
eq: String.raw`\[ z_{ij} = \frac{x_{ij} - \mu_j}{\sqrt{v_j + \varepsilon}}, \qquad \hat\mu_j \leftarrow 0.9\,\hat\mu_j + 0.1\,\mu_j, \qquad \hat v_j \leftarrow 0.9\,\hat v_j + 0.1\,v_j^{\text{sample}} \]`,
sym: [[String.raw`\(\mu_j, v_j\)`, "batch mean and population variance of feature j, used in training mode"], [String.raw`\(\varepsilon\)`, "1e−5, keeps a constant feature finite"], [String.raw`\(\hat\mu_j, \hat v_j\)`, "running estimates, start at 0 and 1, used in eval mode"], ["momentum 0.1", "the weight of the newest batch in the running estimate"], ["affine=True", "adds a learned scale γ and shift β after normalizing"]],
how: ["Compute each column's mean over the batch rows, axis 0.", "Compute the population variance, divide by N.", "Normalize with ε under the root. A constant column gives zeros.", "Update the running mean and the running variance, the latter with the sample variance.", "In eval mode, use the running estimates, not the batch. Call <code>model.eval()</code> before validation."],
say: String.raw`BatchNorm standardizes each feature with the current batch's mean and population variance in training mode and with running estimates in evaluation mode, which is the training-statistics rule applied inside the network.`,
num: String.raw`Feature 1: μ = <b>4</b>, v = <b>5</b>, z₁₁ = −3/√5.00001 = <b>−1.34164</b>. Running mean (0.4, 1.3, 0.3), running variance 0.9 + 0.1 × 20/3 = <b>1.5667</b>. New specimen (9, 18, 3) in eval mode: (<b>6.871, 13.342, 2.846</b>).`,
r(fig, ctl) {
  const D = [[1, 10, 3], [3, 12, 3], [5, 14, 3], [7, 16, 3]], eps = 1e-5;
  const mu = [0, 1, 2].map(j => mean(D.map(r => r[j]))), v = [0, 1, 2].map(j => mean(D.map(r => (r[j] - mu[j]) ** 2))), vs = v.map(x => x * 4 / 3);
  const Z = D.map(r => r.map((x, j) => (x - mu[j]) / Math.sqrt(v[j] + eps))), rm = mu.map(m => 0.1 * m), rv = vs.map(x => 0.9 + 0.1 * x), nw = [9, 18, 3], ev = nw.map((x, j) => (x - rm[j]) / Math.sqrt(rv[j] + eps));
  const draw = k => {
    let s = ML.grid(D, { x: 70, y: 40, cell: 52, title: "batch (4, 3)", rowLab: ["1", "2", "3", "4"], colLab: ["f1", "f2", "f3"], hl: k === 1 ? new Set(["0,0", "1,0", "2,0", "3,0"]) : new Set() }).s;
    if (k >= 1) s += ML.grid([mu, v], { x: 260, y: 40, cell: 52, title: "batch mean and pop. variance", rowLab: ["μ", "v"], colLab: false, hl: k === 1 ? new Set(["0,0", "1,0"]) : new Set() }).s;
    if (k >= 2) s += ML.grid(Z, { x: 460, y: 40, cell: 52, fmt: x => f(x, 3), title: "train-mode output", rowLab: false, colLab: false, hl: k === 2 ? new Set(["0,0"]) : new Set(), hl2: k === 2 ? new Set(["0,2", "1,2", "2,2", "3,2"]) : new Set() }).s;
    if (k >= 3) s += ML.grid([rm, rv], { x: 260, y: 180, cell: 52, fmt: x => f(x, 4), title: "running mean and variance", rowLab: ["μ̂", "v̂"], colLab: false, hl: k === 3 ? new Set(["1,0"]) : new Set() }).s;
    if (k >= 4) s += ML.grid([ev], { x: 460, y: 230, cell: 52, fmt: x => f(x, 3), title: "eval mode, new (9, 18, 3)", rowLab: false, colLab: false, hl: new Set(["0,0", "0,1", "0,2"]) }).s;
    const notes = ["four specimens, three features, normalize down each column", "feature 1: mean (1 + 3 + 5 + 7)/4 = 4, variance 20/4 = 5, feature 3 has variance 0", "z = (x − μ)/√(v + ε): −1.34164 for the first row, zeros for the constant column", "running: 0.9 × 0 + 0.1 × 4 = 0.4 and 0.9 × 1 + 0.1 × 20/3 = 1.5667, sample variance", "eval mode uses the running estimates: (9 − 0.4)/√1.5667 = 6.871, not (9 − 4)/√5"];
    s += tx(30, 300, notes[k], null, "th");
    fig.innerHTML = svg(320, s) + ML.code(["bn = nn.BatchNorm1d(3, affine=False, eps=1e-5, dtype=torch.float64)", "bn.train(); z = bn(batch)              # batch statistics", "bn.running_mean, bn.running_var        # [0.4 1.3 0.3], [1.5667 1.5667 0.9]", "bn.eval(); bn(torch.tensor([[9., 18., 3.]]))   # running statistics"], [0, 1, 1, 2, 3][k]);
  };
  ML.stepper(ctl, 5, draw, ["the batch", "statistics", "normalize", "running estimates", "eval mode"]);
}},

{s: "10. With the agent", t: "Do it with the agent: a scaler you cannot misuse",
intu: String.raw`HW3's standardizer and HW6's back-transformation as one tested module: fit on training rows, transform without refitting, a declared policy for constant columns, a condition-number check, and the conversion of coefficients to original units. The tests pin the numbers from these cards, so a scaler fitted on all rows, a ddof mismatch or a forgotten transform fails on a number you can check here.`,
eq: String.raw`\[ \texttt{fit\_standardizer} \to \texttt{transform} \to \texttt{condition\_number} \to \texttt{to\_original\_units} \]`,
sym: [["fit standardizer", "mean and std with ddof = 0 on the training rows, safe scale for constant columns"], ["transform", "applies stored statistics, never computes new ones"], ["condition number", "κ of XᵀX/m with the intercept"], ["to original units", "w = sy w′/s and b = μy + sy b′ − w·μ"], ["tests", "card 1, 4, 6 and 7 numbers"]],
how: ["Paste the command.", "Read transform: does it take the statistics as arguments and never call mean or std?", "Read the tests: is the scaler fitted on the training rows of the seeded split?", "Run the tests.", "Commit the module with its tests."],
say: String.raw`A scaling module separates fitting from transforming, handles constant columns by a declared policy, reports the condition number, and converts coefficients back to original units, with tests on known values.`,
num: String.raw`Tests expect κ ≈ <b>9.4e7</b> raw and <b>3.55</b> standardized, training μ = (<b>2044.51, 3.2162</b>), a price of <b>$300,081</b> for 1650 sq ft and 3 bedrooms, and raw weights (<b>139.47, −6848.7</b>).`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/scaling.py using numpy only. Functions: fit_standardizer(X_train) returning (mean, safe_scale, constant_mask) with X.std(axis=0, ddof=0) and safe_scale = 1.0 where the std is 0 (HW3 policy). transform(X, mean, safe_scale) that checks the column count and returns (X - mean) / safe_scale without computing any statistics. condition_number(X_features) returning the ratio of the largest to smallest eigenvalue of A.T @ A / m where A has a leading ones column. to_original_units(theta_scaled, mean, scale, y_mean=0.0, y_scale=1.0) returning (b, w) with w = y_scale * theta_scaled[1:] / scale and b = y_mean + y_scale * theta_scaled[0] - mean @ w. Create tests/test_scaling.py with pytest using data/ex1data2.txt (no header, columns size_sqft, bedrooms, price_usd) and the HW3 split indices = np.random.default_rng(5970).permutation(47), train = indices[:37]: condition_number of the raw features is above 1e7 and of the training-standardized features below 5; the fitted training mean is close to [2044.5135, 3.2162]; the transformed test features do not have mean 0; fitting theta with np.linalg.lstsq on the standardized training design and predicting 1650 sq ft and 3 bedrooms gives about 300080.86; to_original_units gives w close to [139.4665, -6848.7131] and b close to 90507.22, and X_raw @ w + b matches the scaled predictions; a constant column gets safe_scale 1 and transforms to zeros. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed in 0.27s"],
    checks: ["fit_standardizer uses ddof=0 and the test would fail with ddof=1 values", "transform never calls mean or std on its input", "the scaler in the tests is fitted on the 37 training rows, not all 47", "the 1650 sq ft prediction goes through transform, not raw values", "to_original_units reproduces the scaled predictions on every training row"]
  });
}},

{s: "11. Test", t: "Lesson 17 test: feature scaling and normalization",
intu: String.raw`Twelve questions on curvature and units, the recipes, correlation, training-only statistics, ddof and constant columns, predicting a new input, coefficients in original units, shift and calibration, and BatchNorm.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to losses from probability.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A feature measured in meters is converted to millimeters. The curvature of the cost along its weight is multiplied by", o: ["1000", "1,000,000", "1/1000", "it does not change"], a: 1, why: "The column scales by 1000, and the curvature by its square. Card 1." },
    { q: "Feature scaling changes", o: ["the least squares predictions", "the coordinates of the bowl and the speed of gradient descent, not the fitted predictions", "the training data's information", "the minimum cost"], a: 1, why: "Scaling is a change of coordinates. The normal equation gives the same predictions in any units. Card 1." },
    { q: "Which recipe gives each feature mean 0 and standard deviation 1?", o: ["min-max", "mean normalization", "standardization", "dividing by the maximum"], a: 2, why: "z = (x − μ)/σ. Min-max gives [0, 1], mean normalization divides by the range. Card 2." },
    { q: "Two standardized features have correlation 0.8. The condition number of their curvature matrix is", o: ["1.8", "9", "4", "0.2"], a: 1, why: "(1 + 0.8)/(1 − 0.8) = 1.8/0.2 = 9. Card 3." },
    { q: "After fitting the scaler on training rows, the scaled test features have mean 0.3. This means", o: ["a bug: refit on the test rows", "nothing wrong: the test rows differ a little from the training rows", "leakage", "the scaler used ddof = 1"], a: 1, why: "Test rows use the training statistics, so their mean need not be 0. HW3 asserts exactly this. Card 4." },
    { q: "Standardizing each split with its own mean and std is", o: ["correct as long as no test row reaches the optimizer", "wrong: the splits then live in different coordinates", "equivalent to the training-only fit", "required by HW6"], a: 1, why: "HW6 Task 2.2. The model's zero and unit must be the same for every row it sees. Card 4." },
    { q: "Values 2, 4, 6, 8. The population and the sample standard deviations are", o: ["2.236 and 2.582", "2.582 and 2.236", "5 and 6.67", "2 and 2.5"], a: 0, why: "Squared deviations sum to 20. √(20/4) = 2.236 with ddof 0, √(20/3) = 2.582 with ddof 1. Card 5." },
    { q: "A training column is constant. HW3's standardizer", o: ["returns NaN", "replaces the zero scale by 1, so the column becomes zeros, and records it in a mask", "raises an error", "drops the column silently"], a: 1, why: "Safe scale and a constant mask. HW6 raises instead, BatchNorm uses ε. Card 5." },
    { q: "Training mean 50, training std 10, θ = (200, 30) on the standardized feature. The prediction for x = 70 is", o: ["260", "2300", "230", "200"], a: 0, why: "z = (70 − 50)/10 = 2, prediction 200 + 30 × 2 = 260. Using raw 70 would give 2300. Card 6." },
    { q: "Same model. The weight in original units, per unit of x, is", o: ["30", "3", "300", "0.3"], a: 1, why: "w = w'/s = 30/10 = 3, and b = 200 − 3 × 50 = 50. Check: 50 + 3 × 70 = 260. Card 7." },
    { q: "Deployment readings are shifted by a known sensor offset of +4. The right order is", o: ["scale with training statistics, then subtract 4", "subtract the offset from the raw reading, then apply the training scaler", "refit the scaler on deployment data", "nothing, scaling removes the offset"], a: 1, why: "Correct the measurement first, then use the stored transform. Re-centering is not a general fix. Card 8." },
    { q: "In eval mode, BatchNorm1d normalizes an input with", o: ["that input's own mean", "the current batch statistics", "the running mean and running variance", "mean 0 and variance 1 always"], a: 2, why: "Train mode uses batch statistics, eval mode the running estimates. Call model.eval() before validating. Card 9." }
  ], "Lesson 17 test");
}}
],
summary: String.raw`The curvature of the half-MSE cost is (1/m)XᵀX, so a feature's units set the curvature along its weight, and HW3's raw housing design has a condition number near 94 million that makes plain gradient descent hopeless. Scaling changes the coordinates of the bowl, not its minimum or the fitted predictions. Standardization, which centers each feature and divides by its standard deviation, beats min-max and mean normalization because it makes the feature columns orthogonal to the intercept and of unit variance, reaching κ = 3.55. What remains is correlation: standardized features with correlation ρ give κ = (1 + ρ)/(1 − ρ), which only a rotation such as PCA whitening removes. The statistics are fitted on the training rows only and reused unchanged on test and future rows, whose scaled means need not be zero. The course uses the population standard deviation and handles constant columns by a declared policy. A new input goes through the stored transform before the model, and the coefficients convert back to dollars per unit by dividing by the feature scale. Scaling is not calibration, since a sensor offset and a real shift look the same after it. BatchNorm applies the same standardization inside a network, with batch statistics in training and running estimates in evaluation.`,
sheet: [[String.raw`\[ z_j = \frac{x_j - \mu_j^{\text{train}}}{\sigma_j^{\text{train}}} \]`, "standardization with training statistics"], [String.raw`\[ \kappa = \frac{\lambda_{\max}}{\lambda_{\min}}\left(\tfrac{1}{m}X^TX\right) \]`, "condition number of the design"], [String.raw`\[ \kappa = \frac{1 + \rho}{1 - \rho} \]`, "two standardized features with correlation ρ"], [String.raw`\[ w_j = \frac{s_y w'_j}{s_j}, \qquad b = \mu_y + s_y b' - \sum_j w_j\mu_j \]`, "back to original units"], [String.raw`\[ \mathrm{RMSE}_{\text{orig}} = s_y\,\mathrm{RMSE}_z \]`, "metrics after target scaling"], [String.raw`\[ z = \frac{x - \mu_B}{\sqrt{v_B + \varepsilon}}, \quad \hat\mu \leftarrow 0.9\hat\mu + 0.1\mu_B \]`, "BatchNorm in training mode and its running mean"]],
sources: ["AME 5970 Lecture 3 notes, section 12 (feature scaling)", "AME 5970 HW3 Part 2 solutions, Tasks 8.1 to 8.4 (training-only standardizer, leakage boundary, predicting a future house) and the Linear Regression learning guide", "AME 5970 HW6 Problem 2 solutions, Tasks 2.1, 2.2 and 2.6 (audit, fit and apply, coefficients in original units, standardized MSE)", "AME 5970 HW5 Problem 1 solutions (manual batch normalization and BatchNorm1d in train and eval mode)", "AME 5970 HW7 Part 4 explanatory text (standardization does not remove distribution shift). The graded HW7 tasks are not solved here, the card uses different numbers", "Andrew Ng, Machine Learning course, week 2: Gradient descent in practice I, feature scaling and mean normalization", "Andrew Ng, Deep Learning Specialization, course 2: Normalizing inputs (week 1), Batch normalization (week 3)", "Ioffe and Szegedy, Batch Normalization, ICML 2015"]
});
})();
