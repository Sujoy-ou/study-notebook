(function () {
/* ML shelf, Part 4, Lesson 16: Gradient descent. Follows AME 5970 Lecture 3 notes sections 1 to 11 (gradient descent for linear regression, the learning rate, convergence, batch and stochastic updates) and HW3 Part 2 (the traceable optimizer, the learning rate comparison on ex1data1), with HW5 Problem 2 (the quadratic stability condition) and HW6 Problem 1 (minibatch SGD in PyTorch, the hand update, epoch averaging). Andrew Ng's Machine Learning course weeks 1 and 2 and the Deep Learning Specialization course 2 week 2 (mini-batch gradient descent) are the spine. Lesson 13 already covers the derivative, the two hand updates and simultaneous updates, so this lesson is about the algorithm at scale. */
const C = ML.C, H3 = ML.HW3;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const fe = v => !isFinite(v) ? "inf" : Math.abs(v) >= 1e5 ? v.toExponential(2) : f(v, 4);
const { S, J1, TN, M1, contours, geom } = H3;
const JS = J1(TN[0], TN[1]);
/* batch gradient descent on the food truck data, with the cost after every update */
const bgd = (a, n) => { let t0 = 0, t1 = 0; const P = [[0, 0]], H = [J1(0, 0)]; for (let k = 0; k < n; k++) { const g0 = (M1 * t0 + t1 * S.x - S.y) / M1, g1 = (t0 * S.x + t1 * S.xx - S.xy) / M1; t0 -= a * g0; t1 -= a * g1; P.push([t0, t1]); H.push(J1(t0, t1)); } return { P, H }; };
/* eigenvalues of the food truck Hessian X^T X / m */
const tr = (1 + S.xx / M1), det = S.xx / M1 - (S.x / M1) ** 2, LMAX = tr / 2 + Math.sqrt(tr * tr / 4 - det), LMIN = tr / 2 - Math.sqrt(tr * tr / 4 - det);
/* HW6 Problem 1 training rows: y = 2x + 1 + N(0, 0.1^2), seed 42, the 210 training indices of the fixed split, rounded to 4 decimals */
const L6 = [[0.3258, 1.7299], [0.7224, 2.5001], [0.4667, 2.0162], [0.2297, 1.5047], [0.6698, 2.3329], [0.1238, 1.1932], [0.6031, 2.0496], [0.7968, 2.7501], [0.5045, 2.083], [0.4389, 1.8244], [0.5712, 2.1687], [0.554, 2.1409], [0.1646, 1.1703], [0.4823, 1.9288], [0.118, 1.28], [0.2936, 1.5747], [0.0876, 1.0959], [0.0139, 0.9992], [0.7611, 2.4986], [0.5536, 2.1885], [0.9692, 2.9438], [0.9756, 2.6946], [0.1533, 1.3157], [0.2146, 1.3428], [0.9086, 2.8448], [0.9027, 2.6981], [0.6519, 2.0644], [0.381, 1.893], [0.501, 1.8017], [0.8311, 2.8055], [0.3742, 1.6945], [0.5549, 2.3048], [0.8263, 2.5872], [0.8677, 2.7807], [0.4619, 2.1565], [0.2478, 1.4131], [0.5592, 2.2253], [0.4735, 1.9339], [0.9378, 2.7716], [0.0827, 1.3375], [0.4886, 2.0237], [0.7807, 2.6028], [0.0534, 1.0997], [0.1964, 1.3149], [0.1946, 1.4332], [0.9268, 2.8863], [0.0211, 0.9391], [0.8327, 2.6135], [0.2659, 1.3007], [0.1895, 1.454], [0.6347, 2.2123], [0.802, 2.8038], [0.1155, 1.1556], [0.7861, 2.5898], [0.4351, 1.7585], [0.7448, 2.5885], [0.7784, 2.7312], [0.0583, 1.2166], [0.739, 2.3277], [0.3171, 1.7419], [0.4674, 2.0751], [0.3469, 1.61], [0.2367, 1.4981], [0.0227, 1.1311], [0.5876, 2.3081], [0.4372, 1.7571], [0.9251, 2.9856], [0.9619, 2.9762], [0.8276, 2.6218], [0.4085, 1.8023], [0.6629, 2.1696], [0.0964, 1.2688], [0.8323, 2.5946], [0.7774, 2.4697], [0.4367, 1.9005], [0.8931, 2.8302], [0.8934, 2.6907], [0.3705, 1.7219], [0.4434, 1.9732], [0.2269, 1.2966], [0.0666, 1.1535], [0.6943, 2.1894], [0.7839, 2.4856], [0.7869, 2.3447], [0.4504, 1.8636], [0.3124, 1.6885], [0.5308, 1.9674], [0.1439, 1.3244], [0.2814, 1.4569], [0.9796, 3.0306], [0.8298, 2.6665], [0.0374, 1.1097], [0.1017, 1.3281], [0.2494, 1.492], [0.0308, 1.0851], [0.746, 2.4741], [0.0638, 1.0223], [0.5063, 1.9791], [0.256, 1.5433], [0.4462, 1.9031], [0.8044, 2.5896], [0.1815, 1.3818], [0.916, 2.8704], [0.7848, 2.5253], [0.3015, 1.4428], [0.6997, 2.2581], [0.3708, 1.5659], [0.0178, 1.1812], [0.1034, 1.3157], [0.0554, 0.9863], [0.0844, 1.0207], [0.4757, 2.0245], [0.3299, 1.6312], [0.1145, 1.2882], [0.875, 2.734], [0.774, 2.5187], [0.2722, 1.5583], [0.4158, 1.5983], [0.2024, 1.3343], [0.9924, 2.9389], [0.1398, 1.2205], [0.8586, 2.692], [0.7003, 2.5517], [0.5552, 2.1449], [0.7788, 2.5103], [0.9248, 2.841], [0.921, 2.8716], [0.7486, 2.6909], [0.6273, 2.3376], [0.6777, 2.4489], [0.4191, 2.0011], [0.5944, 2.088], [0.3936, 1.7107], [0.5811, 2.1713], [0.1462, 1.363], [0.1445, 1.3088], [0.1318, 1.2328], [0.8746, 2.7321], [0.6498, 2.17], [0.3316, 1.756], [0.6974, 2.41], [0.5717, 2.1909], [0.6303, 2.1354], [0.3618, 1.5635], [0.5207, 1.9808], [0.8962, 2.8351], [0.9276, 3.0972], [0.8566, 2.6739], [0.5687, 1.9312], [0.3709, 1.9495], [0.6425, 2.2012], [0.6643, 2.3489], [0.4696, 2.0562], [0.6619, 2.472], [0.8041, 2.6978], [0.8511, 2.637], [0.4907, 2.0207], [0.772, 2.5156], [0.306, 1.594], [0.683, 2.2964], [0.6722, 2.4765], [0.1793, 1.4166], [0.1228, 1.2678], [0.8534, 2.6916], [0.4163, 1.7426], [0.1402, 1.2616], [0.5151, 2.0275], [0.1523, 1.465], [0.5792, 2.1781], [0.933, 2.9996], [0.4389, 1.8674], [0.5652, 2.1673], [0.1086, 1.2533], [0.5909, 2.1224], [0.1613, 1.302], [0.1281, 1.2858], [0.0216, 0.9362], [0.1311, 0.9657], [0.1746, 1.2604], [0.9248, 2.6087], [0.7686, 2.5041], [0.7154, 2.3589], [0.167, 1.4668], [0.6649, 2.3601], [0.3009, 1.5459], [0.7468, 2.6], [0.2864, 1.5828], [0.7169, 2.4797], [0.6617, 2.3419], [0.267, 1.3509], [0.9586, 2.8283], [0.0435, 1.1418], [0.2909, 1.6151], [0.634, 2.3348], [0.318, 1.726], [0.3103, 1.6592], [0.8917, 2.754], [0.0249, 1.1288], [0.9368, 2.8743], [0.5811, 2.0127], [0.5007, 2.11], [0.1999, 1.5153], [0.3545, 1.8823], [0.3159, 1.5912], [0.4558, 1.9646], [0.4259, 1.9665], [0.5546, 2.103], [0.4126, 1.8889], [0.596, 2.1033], [0.3736, 1.6017]];
const N6 = L6.length, S6 = { x: 0, xx: 0, y: 0, xy: 0, yy: 0 }; L6.forEach(([x, y]) => { S6.x += x; S6.xx += x * x; S6.y += y; S6.xy += x * y; S6.yy += y * y; });
const MSE6 = (b, w) => (N6 * b * b + 2 * b * w * S6.x + w * w * S6.xx - 2 * b * S6.y - 2 * w * S6.xy + S6.yy) / N6;
const OLS6 = H3.solve([[N6, S6.x], [S6.x, S6.xx]], [S6.y, S6.xy]), MSE6S = MSE6(OLS6[0], OLS6[1]);
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const shuffle = (n, r) => { const o = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
/* minibatch SGD with the PyTorch MSE convention, mean over the batch, no 1/2 */
const sgd = (B, lr, epochs, seed, decay) => {
  const r = rng(seed || 201); let b = 0, w = 0, t = 0; const P = [[0, 0]];
  for (let e = 0; e < epochs; e++) { const o = shuffle(N6, r); for (let s = 0; s < N6; s += B) { const idx = o.slice(s, s + B); let gb = 0, gw = 0; idx.forEach(i => { const er = b + w * L6[i][0] - L6[i][1]; gb += er; gw += er * L6[i][0]; }); const a = decay ? lr / (1 + t / decay) : lr; b -= a * 2 * gb / idx.length; w -= a * 2 * gw / idx.length; t++; P.push([b, w]); } }
  return P;
};

addLesson("ml", "linear", {
level: "Core", num: "Lesson 16",
id: "ml-linear-l16", title: "Gradient descent", short: "16. Gradient descent",
big: String.raw`Lesson 13 derived the gradient and took two steps by hand. This lesson runs the algorithm for real and learns to read it. Gradient descent is a loop with a contract: copy the parameters, record every cost, stop with an error if the cost stops being finite. On HW3's food truck data it needs 1500 iterations at α = 0.01 and is still not quite at the bottom, because the bowl is a long valley. The learning rate has a hard ceiling, 2 divided by the largest curvature, and the speed along the valley floor is set by the smallest curvature, which is why α = 0.03 explodes and α = 0.001 crawls. A stopping rule based on a small change in cost can stop far too early on such a valley. Then the data side: batch, mini-batch and stochastic updates, how many updates an epoch contains, how to average a loss over unequal batches, and why SGD with a fixed learning rate never quite settles. The last cards do one update by hand in PyTorch's convention and then in PyTorch's own five lines.`,
bridge: String.raw`The topics are those of the professor's Lecture 3 notes, sections 1 to 11, and the code and experiments are HW3 Part 2's (Tasks 5.1, 5.2, 7.1, 7.2), with HW5 Problem 2 for the stability condition and HW6 Problem 1 for minibatch SGD and its averaging rules. Andrew Ng's Machine Learning course, week 1 (gradient descent for linear regression) and week 2 (gradient descent in practice: the learning rate, debugging), and Deep Learning Specialization course 2, week 2 (mini-batch gradient descent, understanding mini-batch, learning rate decay) are the spine.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The loop", t: "Gradient descent is a loop with a contract you can test",
intu: String.raw`HW3 Task 5.1 asks for a traceable optimizer, and the contract matters as much as the update. Copy θ so the caller's array is not changed. Compute the whole gradient from the current θ, then update every component at once. Record the cost after every update and every θ including the first, so the history arrays have lengths n and n + 1. Stop with a <code>FloatingPointError</code> the moment the cost is not finite, instead of returning garbage. Step through three iterations on HW3's toy data with α = 0.1 and watch both history arrays fill.`,
eq: String.raw`\[ \theta \leftarrow \theta - \alpha \nabla J(\theta), \qquad \nabla J(\theta) = \frac{1}{m} X^T (X\theta - y) \]`,
sym: [[String.raw`\(\alpha\)`, "learning rate, positive, checked at the top of the function"], ["cost history", "J after each update, length n"], ["theta history", "θ before the first and after each update, shape (n + 1, number of parameters)"], ["copy", "the caller's θ must not change"], ["FloatingPointError", "raised the first time J is inf or nan"]],
how: ["Validate inputs: α positive, the iteration count a positive integer.", "Copy θ with <code>np.asarray(theta, float).copy()</code>.", "Each iteration: gradient from the current θ, update, cost of the new θ.", "Store the cost and the new θ. If the cost is not finite, raise and say why.", "Return θ, the cost history and the θ history, with the shapes the tests expect."],
say: String.raw`A gradient descent function updates all parameters from one gradient per iteration, records the cost and parameters after every update, and stops with an error as soon as the cost is not finite.`,
num: String.raw`Toy data, α = 0.1, θ₀ = (0, 0), J = 1.5. Gradient (−1.6667, −2), θ₁ = (<b>0.1667, 0.2</b>), J₁ = <b>0.9028</b>. Then θ₂ = (0.2967, 0.35), J₂ = 0.5555, θ₃ = (0.3987, 0.462), J₃ = <b>0.3531</b>.`,
r(fig, ctl) {
  const X = [[1, 0], [1, 1], [1, 2]], y = [1, 2, 2], a = 0.1;
  const Jt = t => X.reduce((s, r, i) => s + (r[0] * t[0] + r[1] * t[1] - y[i]) ** 2, 0) / 6;
  const st = [{ t: [0, 0], g: null }]; for (let k = 0; k < 3; k++) { const t = st[k].t, e = X.map((r, i) => r[0] * t[0] + r[1] * t[1] - y[i]), g = [e.reduce((s, v) => s + v, 0) / 3, e.reduce((s, v, i) => s + v * X[i][1], 0) / 3]; st.push({ t: [t[0] - a * g[0], t[1] - a * g[1]], g }); }
  const draw = k => {
    const hist = st.slice(1, k + 1).map(q => Jt(q.t)), th = st.slice(0, k + 1).map(q => q.t);
    let s = tx(30, 22, k === 0 ? "before the loop: θ copied, histories allocated" : `after iteration ${k}`, null, "th");
    s += ML.grid(th, { x: 60, y: 60, cell: 56, fmt: v => f(v, 4), title: "theta_history", rowLab: th.map((_, i) => i), colLab: ["θ₀", "θ₁"], hl: new Set(k ? [k + ",0", k + ",1"] : []) }).s;
    s += ML.grid(hist.length ? [hist] : [[0]], { x: 250, y: 60, cell: 64, fmt: v => hist.length ? f(v, 4) : "empty", title: "cost_history", rowLab: false, colLab: hist.length ? hist.map((_, i) => i) : false, hl: new Set(hist.length ? ["0," + (hist.length - 1)] : []) }).s;
    if (k) { const g = st[k].g; s += tx(250, 170, `gradient at θ${["₀", "₁", "₂"][k - 1]} = (${f(g[0], 4)}, ${f(g[1], 4)})`, null, "t") + tx(250, 192, `θ${["₁", "₂", "₃"][k - 1]} = θ − 0.1 × gradient = (${f(st[k].t[0], 4)}, ${f(st[k].t[1], 4)})`, null, "t") + tx(250, 214, `J = ${f(Jt(st[k].t), 4)}, finite, so continue`, null, "t"); }
    else s += tx(250, 170, `J(0, 0) = ${f(Jt([0, 0]), 4)}, not stored: the history holds`, null) + tx(250, 188, "the cost after each update", null);
    s += tx(30, 270, `shapes: cost_history (${k},) of (3,), theta_history (${k + 1}, 2) of (4, 2)`, null);
    fig.innerHTML = svg(290, s) + ML.code(["theta = np.asarray(theta, dtype=float).copy()", "cost_history = np.empty(num_iterations)", "theta_history = np.empty((num_iterations + 1, theta.size)); theta_history[0] = theta", "for it in range(num_iterations):", "    theta = theta - learning_rate * compute_gradient(X, y, theta)", "    cost = half_mse_cost(X, y, theta)", "    if not np.isfinite(cost): raise FloatingPointError(f'iteration {it + 1}')", "    cost_history[it] = cost; theta_history[it + 1] = theta"], k === 0 ? 2 : 7);
  };
  ML.stepper(ctl, 4, draw, ["setup", "iteration 1", "iteration 2", "iteration 3"]);
}},

{s: "2. Descent on HW3", t: "1500 iterations on the food truck data, and the valley that slows them",
intu: String.raw`HW3's run: start at θ = (0, 0), α = 0.01, 1500 iterations. The first few steps drop the cost from 32.07 to about 5.9, by setting the slope roughly right. Then the path turns and creeps along the floor of the long valley of Lesson 15 card 3, trading intercept for slope, and the cost falls slowly from 5.9 to 4.48. After 1500 iterations θ = (−3.630, 1.166), close to but not at the exact minimum (−3.896, 1.193). Drag the iteration slider and watch the two phases on both panels. The cost plot is on a log scale of the gap above the minimum, so steady progress is a straight line.`,
eq: String.raw`\[ \theta^{(k+1)} = \theta^{(k)} - \frac{\alpha}{m} X^T\left(X\theta^{(k)} - y\right), \qquad \alpha = 0.01, \ k = 0, \dots, 1499 \]`,
sym: [["fast phase", "the stiff direction, slope, settles in a few steps"], ["slow phase", "the soft direction, along the valley, takes the rest"], ["gap", "J − J*, the distance above the exact minimum"], ["J*", "4.4770, from the normal equation"], ["log scale", "a straight line means a constant factor per iteration"]],
how: ["Run the loop and keep both histories.", "Plot cost against iteration. Use a log scale once the curve flattens.", "Overlay the θ history on the contour plot, a few dozen points are enough.", "Compare the end point with the normal equation solution.", "A remaining gap means more iterations, a larger stable α, or scaled features, Lesson 17."],
say: String.raw`Batch gradient descent on the food truck data falls fast along the stiff direction and then slowly along the valley floor, which is why it needs many iterations and still ends slightly above the exact minimum.`,
num: String.raw`J: 32.07 at the start, <b>6.737</b> after 1 iteration, 5.902 after 3, <b>4.4834</b> after 1500. Gap to J* = 4.4770 is <b>0.0064</b>. θ₁₅₀₀ = (<b>−3.6303, 1.1664</b>) against the exact (−3.8958, 1.1930).`,
note: String.raw`HW3 Task 5.2 asks whether the cost history supports convergence. The answer is the shape of this curve: decreasing every step and flattening. Agreement with the pseudoinverse is the stronger evidence, Task 9.3.`,
r(fig, ctl) {
  const R = bgd(0.01, 1500);
  ctl.innerHTML = sl("gi", "iteration", 0, 1500, 1, 40) + `<div id="gh"></div>`;
  const box = { xmin: -5, xmax: 1, ymin: -0.1, ymax: 1.5, nx: 6, ny: 4, fx: v => v, fy: v => v.toFixed(1), xl: "θ₀", yl: "θ₁", grid: false };
  const base = (() => { const a = ML.axes(60, 20, 300, 250, box); return a.s + contours(J1, a, box, geom(4.5, 120, 14), 70, 70); })();
  const u = () => {
    const k = +$("gi").value; $("giv").textContent = k;
    const a = ML.axes(60, 20, 300, 250, box);
    let s = base + `<path d="M${a.X(TN[0])} ${a.Y(TN[1]) - 7} l2 5 h5 l-4 3 l2 6 l-5 -4 l-5 4 l2 -6 l-4 -3 h5 z" fill="${C.amber}"/>`;
    const idx = []; for (let i = 0; i <= k; i++) if (i < 12 || i % 25 === 0 || i === k) idx.push(i);
    s += ML.path(idx.map(i => [a.X(R.P[i][0]), a.Y(R.P[i][1])]), C.coral, 1.6) + idx.map(i => `<circle cx="${a.X(R.P[i][0])}" cy="${a.Y(R.P[i][1])}" r="${i === k ? 5 : 2}" fill="${C.coral}"/>`).join("");
    const b = ML.axes(440, 20, 210, 170, { xmin: 0, xmax: 1500, ymin: -3, ymax: 2, nx: 3, ny: 5, fx: v => v, fy: v => "1e" + v, xl: "iteration", yl: "J − J*", grid: false });
    s += b.s + ML.path(R.H.map((h, i) => [b.X(i), b.Y(Math.max(-3, Math.log10(h - JS)))]).filter((_, i) => i % 5 === 0 || i < 10), C.teal, 1.8) + `<circle cx="${b.X(k)}" cy="${b.Y(Math.max(-3, Math.log10(R.H[k] - JS)))}" r="4.5" fill="${C.coral}"/>`;
    s += tx(440, 236, `θ = (${f(R.P[k][0], 4)}, ${f(R.P[k][1], 4)})`, null, "t") + tx(440, 256, `J = ${f(R.H[k], 4)}, gap ${f(R.H[k] - JS, 4)}`, null, "t") + tx(440, 276, k < 6 ? "fast phase: fixing the slope" : "slow phase: along the valley", null, "th");
    fig.innerHTML = svg(312, s);
    $("gh").innerHTML = ML.readout([["exact minimum", `(${f(TN[0], 4)}, ${f(TN[1], 4)})`], ["J*", f(JS, 4)]]);
  };
  $("gi").oninput = u; u();
}},

{s: "3. Learning rate", t: "Too small crawls, too large explodes, and the edge is sharp",
intu: String.raw`HW3 Task 7.1 compares α = 0.001, 0.01 and 0.03 from the same start for 1500 iterations. 0.001 is stable but far from done, 0.01 settles, and 0.03 overshoots more every step until the cost overflows. Here you can try the values in between. The surprise is how sharp the edge is: 0.024 converges faster than 0.01, but 0.025 already explodes. Rapid change in the cost is not evidence of learning, only a steady decrease is. Pick rates and read the gap above the minimum on a log scale.`,
eq: String.raw`\[ \text{stable} \iff 0 \lt \alpha \lt \frac{2}{\lambda_{\max}}, \qquad \lambda_{\max}\left(\tfrac{1}{m}X^TX\right) = 82.22 \ \Rightarrow \ \alpha \lt 0.0243 \]`,
sym: [["too small", "every step is safe but tiny, the cost is still falling at the end"], ["good", "a steady decrease that flattens"], ["too large", "the cost rises, oscillates in sign and overflows to inf"], [String.raw`\(\lambda_{\max}\)`, "the largest curvature of the cost, card 4"], ["Ng's ladder", "try 0.001, 0.003, 0.01, 0.03, 0.1 and keep the largest that decreases steadily"]],
how: ["Start every trial from the same θ and the same iteration budget, as HW3 and HW5 require.", "Catch the FloatingPointError and label the run diverged.", "Plot finite histories on a log scale, all on one axis.", "Choose the largest rate whose cost decreases at every step.", "A cost that rises even once is a rate that is too large, never a reason to train longer."],
say: String.raw`The learning rate must stay below two over the largest curvature of the cost, below that the largest stable rate converges fastest, and a rising cost is the signature of a rate that is too large.`,
num: String.raw`After 1500 iterations: α = 0.001 gives J = <b>5.3148</b>, α = 0.01 gives <b>4.4834</b>, α = 0.02 gives 4.4770, α = 0.024 gives <b>4.47697</b>. α = 0.025 reaches 8e71 and α = 0.03 overflows to inf.`,
r(fig, ctl) {
  const RATES = [0.001, 0.003, 0.01, 0.02, 0.024, 0.025, 0.03];
  let on = new Set([0.001, 0.01, 0.03]);
  ctl.innerHTML = `<div class="row">${RATES.map(a => `<button data-lr="${a}">${a}</button>`).join("")}</div><div id="lr"></div>`;
  const runs = {}; RATES.forEach(a => runs[a] = bgd(a, 1500).H);
  const cols = { 0.001: C.gray, 0.003: C.purple, 0.01: C.teal, 0.02: C.blue, 0.024: C.amber, 0.025: C.coral, 0.03: "#9E1B32" };
  const u = () => {
    ctl.querySelectorAll("button[data-lr]").forEach(b => b.classList.toggle("on", on.has(+b.dataset.lr)));
    const a = ML.axes(70, 20, 380, 250, { xmin: 0, xmax: 1500, ymin: -10, ymax: 6, nx: 5, ny: 8, fx: v => v, fy: v => "1e" + v, xl: "iteration", yl: "J − J* (log scale)" });
    let s = a.s; let rows = [];
    [...on].sort((p, q) => p - q).forEach(r => {
      const H = runs[r]; let last = -1; const pts = [];
      for (let i = 0; i < H.length; i++) { if (!isFinite(H[i]) || H[i] > 1e6) { last = i; break; } if (i % 3 === 0 || i < 30) pts.push([a.X(i), a.Y(Math.max(-10, Math.min(6, Math.log10(Math.max(1e-12, H[i] - JS)))))]); }
      s += ML.path(pts, cols[r], 2);
      if (last >= 0) s += `<circle cx="${a.X(last)}" cy="${a.Y(6)}" r="4" fill="${cols[r]}"/>`;
      rows.push([r, last >= 0 ? `diverged by iteration ${last}` : `J = ${f(H[1500], 5)}, gap ${(H[1500] - JS).toExponential(1)}`, last >= 0 ? "" : H.slice(1).every((h, i) => h <= H[i] + 1e-12) ? "decreasing every step" : "rose at least once"]);
    });
    const gap = Math.max(1, Math.min(7, rows.length)), dy = rows.length > 4 ? 34 : 48;
    rows.forEach((r, i) => { s += `<line x1="470" y1="${40 + i * dy}" x2="488" y2="${40 + i * dy}" stroke="${cols[r[0]]}" stroke-width="3"/>` + tx(494, 44 + i * dy, `α = ${r[0]}`, null, "th") + tx(494, 58 + i * dy, r[1], null) + (r[2] && dy > 40 ? tx(494, 72 + i * dy, r[2], null) : ""); });
    s += tx(470, 296, `stable below 2/λmax = ${f(2 / LMAX, 4)}`, null, "t");
    fig.innerHTML = svg(318, s);
    $("lr").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-lr]").forEach(b => b.onclick = () => { const r = +b.dataset.lr; if (on.has(r) && on.size > 1) on.delete(r); else on.add(r); u(); }); u();
}},

{s: "4. Why the limit", t: "Each direction of the bowl shrinks by a factor 1 − αλ per step",
intu: String.raw`HW5 Problem 2 does the one-dimensional case: on f(x) = x² the update is x ← (1 − 2η)x, so it converges only when |1 − 2η| \(\lt\) 1. A quadratic cost in two parameters splits into two such problems along the eigenvectors of its curvature matrix (1/m)XᵀX. Along each one the error is multiplied by 1 − αλ every step. The stiff direction, λ = 82.2, limits α: above 2/82.2 its factor passes −1 and the error grows with alternating sign. The soft direction, λ = 0.18, sets the speed: at α = 0.01 its factor is 0.9982, so 1500 steps shrink its error only to 6.7 %. That is the gap card 2 left behind. Slide α and read both factors.`,
eq: String.raw`\[ \theta^{(k)} - \theta^* = \sum_j c_j (1 - \alpha\lambda_j)^k v_j, \qquad |1 - \alpha\lambda_j| \lt 1 \ \text{for all } j \iff \alpha \lt \frac{2}{\lambda_{\max}} \]`,
sym: [[String.raw`\(\lambda_j, v_j\)`, "eigenvalues and eigenvectors of the curvature matrix (1/m)XᵀX"], [String.raw`\(1 - \alpha\lambda_j\)`, "the factor applied to the error along direction j each step"], ["stiff direction", "large λ, fixes the largest α"], ["soft direction", "small λ, fixes how many steps you need"], [String.raw`\(\kappa = \lambda_{\max}/\lambda_{\min}\)`, "condition number, 456 here, roughly the number of steps per factor e"]],
how: ["Write the cost as a quadratic around its minimum: the curvature matrix is (1/m)XᵀX.", "Diagonalize it. The error separates into independent directions.", "Each direction is HW5's one-dimensional problem with curvature λ.", "Stability needs every |1 − αλ| below 1, so α below 2/λmax.", "Speed is set by the soft direction: about κ steps per factor of e at the best α."],
say: String.raw`Gradient descent on a quadratic multiplies the error along each eigenvector of the curvature matrix by one minus the learning rate times that eigenvalue, so the largest eigenvalue limits the learning rate and the smallest one limits the speed.`,
num: String.raw`λ = <b>82.22</b> and <b>0.1803</b>, κ = 456. α = 0.01: factors 0.178 and <b>0.99820</b>, and 0.9982¹⁵⁰⁰ = <b>0.067</b>. Limit 2/82.22 = <b>0.0243</b>. HW5's x²: factor 1 − 2η, converges for 0 \(\lt\) η \(\lt\) 1, one step at η = 0.5.`,
note: String.raw`HW5's optional question asks how the stable interval changes for 10x². The curvature is 20, so the condition becomes η \(\lt\) 2/20 = 0.1. Ten times the curvature, a ten times smaller ceiling.`,
r(fig, ctl) {
  ctl.innerHTML = sl("ea", "α", 0.0005, 0.03, 0.0005, 0.01) + `<div id="ef"></div>`;
  const u = () => {
    const al = +$("ea").value; $("eav").textContent = f(al, 4);
    const a = ML.axes(60, 20, 360, 240, { xmin: 0, xmax: 0.03, ymin: -1.5, ymax: 1.5, nx: 6, ny: 6, fx: v => v.toFixed(3), fy: v => v.toFixed(1), xl: "learning rate α", yl: "factor 1 − αλ" });
    let s = a.s + `<rect x="${a.X(0)}" y="${a.Y(1)}" width="${a.X(0.03) - a.X(0)}" height="${a.Y(-1) - a.Y(1)}" fill="${C.teal}" opacity="0.07"/>`;
    s += [1, -1].map(v => `<line x1="${a.X(0)}" y1="${a.Y(v)}" x2="${a.X(0.03)}" y2="${a.Y(v)}" stroke="${C.gray}" stroke-dasharray="4 3"/>`).join("");
    s += ML.path(range(0, 0.03, 60).map(v => [a.X(v), a.Y(Math.max(-1.5, 1 - v * LMAX))]), C.coral, 2.2) + ML.path(range(0, 0.03, 60).map(v => [a.X(v), a.Y(1 - v * LMIN)]), C.teal, 2.2);
    s += `<line x1="${a.X(2 / LMAX)}" y1="20" x2="${a.X(2 / LMAX)}" y2="260" stroke="${C.coral}" stroke-dasharray="2 3"/>` + tx(a.X(2 / LMAX) + 4, 34, "2/λmax", null);
    s += `<line x1="${a.X(al)}" y1="20" x2="${a.X(al)}" y2="260" stroke="${C.blue}" stroke-width="1.5"/>`;
    const fs = 1 - al * LMAX, fl = 1 - al * LMIN, stable = Math.abs(fs) < 1;
    const steps = Math.log(0.01) / Math.log(Math.abs(fl));
    s += tx(450, 40, "coral: stiff direction, λ = " + f(LMAX, 2), null) + tx(450, 58, "teal: soft direction, λ = " + f(LMIN, 4), null);
    s += tx(450, 92, `stiff factor = ${f(fs, 4)}`, null, "t") + tx(450, 112, `soft factor = ${f(fl, 5)}`, null, "t") + tx(450, 140, stable ? "|stiff factor| below 1: stable" : "|stiff factor| above 1: diverges", null, "th");
    s += tx(450, 176, "soft error after 1500 steps:", null) + tx(450, 194, `${fl ** 1500 < 1e-4 ? fl ** 1500 < 1e-300 ? "0" : (fl ** 1500).toExponential(2) : f(fl ** 1500, 4)} of its start`, null, "t") + tx(450, 222, "steps to shrink it 100 times:", null) + tx(450, 240, `${Math.round(steps)}`, null, "t");
    fig.innerHTML = svg(290, s);
    $("ef").innerHTML = ML.readout([["κ = λmax/λmin", f(LMAX / LMIN, 0)], ["best α = 2/(λmax + λmin)", f(2 / (LMAX + LMIN), 4)]]);
  };
  $("ea").oninput = u; u();
}},

{s: "5. When to stop", t: "A small change in cost is not the same as being close",
intu: String.raw`Ng's automatic convergence test stops when the cost falls by less than some small ε in one iteration. It is a useful alarm, but on a long valley it can fire far from the minimum, because progress along the valley floor is slow by nature. On HW3's run at α = 0.01, ε = 0.01 stops after only 4 iterations, during a pause between the two phases, with a gap of 1.42 still to go. ε = 1e−3 stops at iteration 457 with a gap of 0.277. Move ε and watch where the rule fires. The honest checks are a flat curve on a log plot, a small gradient norm, and agreement with the normal equation.`,
eq: String.raw`\[ \text{stop at the first } k \text{ with } J^{(k-1)} - J^{(k)} \lt \varepsilon, \qquad \text{or when } \|\nabla J(\theta^{(k)})\| \lt \varepsilon_g \]`,
sym: [[String.raw`\(\varepsilon\)`, "tolerance on the per-iteration decrease in cost"], [String.raw`\(\|\nabla J\|\)`, "gradient norm, zero only at the minimum"], ["false stop", "a small decrease caused by a slow direction, not by arrival"], ["budget", "a fixed number of iterations, what HW3 uses"], ["reference", "the normal equation or lstsq, the ground truth for small problems"]],
how: ["Record the cost every iteration. It costs nothing.", "Plot it on a log scale. A curve still sloping down is not converged.", "If you use an ε rule, also check the gradient norm.", "For a linear model, compare with lstsq. HW3 asserts agreement to 1e−5.", "For networks there is no closed form, so use a validation curve, Lesson 24."],
say: String.raw`A stopping rule on the decrease in cost can fire early on an ill-conditioned problem, so convergence is judged by the cost curve, the gradient norm and, when available, a direct solution.`,
num: String.raw`α = 0.01: ε = 0.01 stops at k = <b>4</b>, gap 1.418. ε = 1e−3 stops at <b>457</b>, gap 0.277. ε = 1e−4 stops at 1096, gap 0.028. After the full 1500 the gap is still <b>0.0064</b>.`,
r(fig, ctl) {
  const R = bgd(0.01, 6000);
  ctl.innerHTML = sl("se", "log10 ε", -6, -1, 0.1, -2) + `<div id="sp"></div>`;
  const u = () => {
    const le = +$("se").value, eps = 10 ** le; $("sev").textContent = le.toFixed(1);
    let k = -1; for (let i = 1; i < R.H.length; i++) if (R.H[i - 1] - R.H[i] < eps) { k = i; break; }
    const a = ML.axes(70, 20, 370, 240, { xmin: 0, xmax: 6000, ymin: -8, ymax: 2, nx: 6, ny: 5, fx: v => v, fy: v => "1e" + v, xl: "iteration", yl: "" });
    let s = a.s;
    s += ML.path(R.H.slice(1).map((h, i) => [a.X(i + 1), a.Y(Math.max(-8, Math.log10(R.H[i] - h)))]).filter((_, i) => i % 6 === 0 || i < 20), C.purple, 1.6);
    s += ML.path(R.H.map((h, i) => [a.X(i), a.Y(Math.max(-8, Math.log10(h - JS)))]).filter((_, i) => i % 6 === 0 || i < 20), C.teal, 2);
    s += `<line x1="${a.X(0)}" y1="${a.Y(le)}" x2="${a.X(6000)}" y2="${a.Y(le)}" stroke="${C.coral}" stroke-dasharray="5 3"/>`;
    if (k > 0) s += `<line x1="${a.X(k)}" y1="20" x2="${a.X(k)}" y2="260" stroke="${C.coral}"/><circle cx="${a.X(k)}" cy="${a.Y(Math.log10(R.H[k] - JS))}" r="5" fill="${C.coral}"/>`;
    s += tx(470, 40, "purple: decrease per iteration", null) + tx(470, 58, "teal: gap J − J*", null) + tx(470, 76, "coral dashed: ε", null);
    s += tx(470, 116, k > 0 ? `rule fires at k = ${k}` : "rule never fires in 6000", null, "th") + (k > 0 ? tx(470, 138, `J = ${f(R.H[k], 4)}`, null, "t") + tx(470, 158, `gap still ${f(R.H[k] - JS, 4)}`, null, "t") : "");
    s += tx(470, 196, "HW3 budget, 1500 iterations:", null) + tx(470, 214, `gap ${f(R.H[1500] - JS, 4)}`, null, "t") + tx(470, 240, "the bump near k = 3 is the", null) + tx(470, 256, "turn into the valley", null);
    fig.innerHTML = svg(302, s);
    const P = (() => { let t0 = 0, t1 = 0; for (let i = 0; i < Math.max(k, 0); i++) { const g0 = (M1 * t0 + t1 * S.x - S.y) / M1, g1 = (t0 * S.x + t1 * S.xx - S.xy) / M1; t0 -= 0.01 * g0; t1 -= 0.01 * g1; } return [(M1 * t0 + t1 * S.x - S.y) / M1, (t0 * S.x + t1 * S.xx - S.xy) / M1]; })();
    $("sp").innerHTML = ML.readout([["gradient norm at the stop", k > 0 ? f(Math.hypot(P[0], P[1]), 4) : "none"], ["ε", eps.toExponential(1)]]);
  };
  $("se").oninput = u; u();
}},

{s: "6. Batch, mini-batch, SGD", t: "Use all rows, a batch of rows, or one row per update",
intu: String.raw`Batch gradient descent computes the gradient from all m rows before every update. Mini-batch uses B rows, stochastic gradient descent one row. A smaller batch gives a noisier gradient but many more updates per pass through the data. The data are HW6 Problem 1's 210 training rows from y = 2x + 1 plus noise, and the loss is PyTorch's MSE. With the same α = 0.1 and the same number of epochs, the full batch makes one update per epoch and is still far from the minimum, the batch of 32 makes seven and is close, and SGD makes 210 and jitters around the minimum. Change B and the epochs and compare the paths.`,
eq: String.raw`\[ \theta \leftarrow \theta - \alpha \frac{2}{|\mathcal B|} \sum_{i \in \mathcal B} \left(x^{(i)T}\theta - y^{(i)}\right) x^{(i)}, \qquad \text{updates per epoch} = \lceil m / B \rceil \]`,
sym: [[String.raw`\(\mathcal B\)`, "the batch, a set of row indices"], ["B = m", "batch gradient descent, the exact gradient"], ["1 \\(\\lt\\) B \\(\\lt\\) m", "mini-batch, the default in deep learning, often 32 to 256"], ["B = 1", "stochastic gradient descent, one row per update"], ["epoch", "one full pass through the shuffled training rows"]],
how: ["Shuffle the training rows at the start of every epoch.", "Cut them into batches of B. The last batch may be smaller.", "For each batch: mean loss on that batch, its gradient, one update.", "Count updates, not epochs, when comparing speed.", "A noisy path is the price of cheap updates. Card 8 shows how to calm it."],
say: String.raw`Batch, mini-batch and stochastic gradient descent differ only in how many rows estimate the gradient for each update, which trades the noise of the estimate against the number of updates per epoch.`,
num: String.raw`m = 210: B = 210 gives <b>1</b> update per epoch, B = 32 gives <b>7</b> (six of 32, one of 18), B = 1 gives <b>210</b>. Least squares minimum (b, w) = (<b>0.9999, 1.9942</b>) with MSE 0.01045.`,
r(fig, ctl) {
  let B = 32;
  ctl.innerHTML = btns([[210, "batch, B = 210"], [32, "mini-batch, B = 32"], [1, "SGD, B = 1"]], "k") + sl("me", "epochs", 1, 40, 1, 5) + sl("ml6", "α", 0.01, 0.5, 0.01, 0.1) + `<div id="mb"></div>`;
  const box = { xmin: -0.2, xmax: 2, ymin: -0.2, ymax: 2.5, nx: 4, ny: 5, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "b", yl: "w", grid: false };
  const base = (() => { const a = ML.axes(60, 20, 300, 260, box); return a.s + contours(MSE6, a, box, geom(0.02, 6, 10), 60, 60); })();
  const u = () => {
    pick(ctl, "k", B);
    const E = +$("me").value, lr = +$("ml6").value; $("mev").textContent = E; $("ml6v").textContent = f(lr, 2);
    const a = ML.axes(60, 20, 300, 260, box);
    let s = base + `<circle cx="${a.X(OLS6[0])}" cy="${a.Y(OLS6[1])}" r="5" fill="${C.amber}"/>`;
    const others = [210, 32, 1].filter(v => v !== B);
    others.forEach(bb => { const P = sgd(bb, lr, E); const st = Math.max(1, Math.floor(P.length / 400)); s += ML.path(P.filter((_, i) => i % st === 0 || i === P.length - 1).map(p => [a.X(Math.max(-0.2, Math.min(2, p[0]))), a.Y(Math.max(-0.2, Math.min(2.5, p[1])))]), C.gray, 1, "3 3"); });
    const P = sgd(B, lr, E), st = Math.max(1, Math.floor(P.length / 600));
    s += ML.path(P.filter((_, i) => i % st === 0 || i === P.length - 1).map(p => [a.X(Math.max(-0.2, Math.min(2, p[0]))), a.Y(Math.max(-0.2, Math.min(2.5, p[1])))]), C.coral, 1.6);
    const end = P[P.length - 1];
    s += `<circle cx="${a.X(Math.max(-0.2, Math.min(2, end[0])))}" cy="${a.Y(Math.max(-0.2, Math.min(2.5, end[1])))}" r="5" fill="${C.coral}"/>`;
    s += tx(400, 40, `B = ${B}, ${E} epoch${E > 1 ? "s" : ""}, α = ${f(lr, 2)}`, null, "th") + tx(400, 64, `updates: ${P.length - 1}`, null, "t") + tx(400, 84, `end: (b, w) = (${fe(end[0])}, ${fe(end[1])})`, null, "t") + tx(400, 104, `training MSE = ${fe(MSE6(end[0], end[1]))}`, null, "t");
    s += tx(400, 140, "amber: least squares minimum", null) + tx(400, 158, "gray dashed: the other two batch sizes", null) + tx(400, 194, "rows read per update: " + B, null) + tx(400, 212, "rows read in total: " + E * N6, null);
    fig.innerHTML = svg(320, s) + ML.code(["loader = DataLoader(train_ds, batch_size=" + B + ", shuffle=True)", "for epoch in range(" + E + "):", "    for xb, yb in loader:              # " + Math.ceil(N6 / B) + " batches per epoch", "        loss = ((model(xb) - yb) ** 2).mean()", "        optimizer.zero_grad(); loss.backward(); optimizer.step()"], 3);
    $("mb").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { B = +b.dataset.k; u(); }); $("me").oninput = u; $("ml6").oninput = u; u();
}},

{s: "7. Epochs and averages", t: "Count batches correctly and weight the epoch loss by batch size",
intu: String.raw`HW6 Task 1.2: 210 training rows in batches of 32 make seven batches, six of 32 and a last one of 18, unless <code>drop_last=True</code> throws those 18 rows away every epoch. Task 1.4 then asks for the epoch loss as a sample-weighted average, the sum of each batch's mean loss times its size, divided by the total count. Averaging the batch means with equal weights is wrong whenever the batches differ in size. HW6's own check: a zero model, 32 targets of 1 and 3 targets of 4. The correct MSE is 2.29, the naive average of the two batch means is 8.5. Change m and B and see the batches and both averages.`,
eq: String.raw`\[ L_{\text{epoch}} = \frac{\sum_b n_b L_b}{\sum_b n_b}, \qquad \text{batches} = \left\lceil \frac{m}{B} \right\rceil, \qquad \text{last batch} = m - B\left(\left\lceil \frac{m}{B} \right\rceil - 1\right) \]`,
sym: [[String.raw`\(L_b\)`, "mean loss of batch b, what nn.MSELoss returns"], [String.raw`\(n_b\)`, "number of rows in batch b, len(yb)"], [String.raw`\(\texttt{drop\_last}\)`, "False keeps the short batch, the HW6 setting"], ["running loss", "accumulated during training while θ changes, not a fixed-model score"], ["evaluated loss", "one pass at a fixed θ without gradients, the number to compare"]],
how: ["Accumulate <code>loss.item() * len(yb)</code> and <code>len(yb)</code> over the loader.", "Divide the two sums at the end of the epoch.", "Keep <code>drop_last=False</code> for evaluation loaders, every row must count.", "Report the evaluated training loss, not the running loss, when comparing with validation.", "Assert the batch sizes add up to m once, it catches a wrong split early."],
say: String.raw`An epoch loss is the sample-weighted average of the batch losses, and averaging batch means with equal weights is wrong whenever the last batch is smaller.`,
num: String.raw`m = 210, B = 32: batches <b>32 × 6 + 18</b>. HW6 check, 35 rows: weighted MSE = (32 × 1 + 3 × 16)/35 = <b>2.2857</b>, naive (1 + 16)/2 = <b>8.5</b>.`,
r(fig, ctl) {
  let drop = 0, demo = 0;
  ctl.innerHTML = btns([[0, "keep the last batch"], [1, "drop_last=True"]], "k") + `<div class="row"><button id="dm">HW6 check: 32 + 3 rows</button></div>` + sl("em", "m rows", 10, 300, 1, 210) + sl("eb", "batch size B", 1, 128, 1, 32) + `<div id="ea2"></div>`;
  const u = () => {
    pick(ctl, "k", drop);
    const m = demo ? 35 : +$("em").value, B = demo ? 32 : +$("eb").value; $("emv").textContent = m; $("ebv").textContent = B;
    const full = Math.floor(m / B), rem = m - full * B, sizes = Array(full).fill(B).concat(rem && !drop ? [rem] : []);
    let s = tx(20, 20, `${m} rows, B = ${B}: ${sizes.length} batches${rem ? (drop ? `, ${rem} rows dropped every epoch` : `, last batch ${rem}`) : ""}`, null, "th");
    const W = 640, sc = W / m; let x = 20;
    sizes.forEach((n, i) => { s += `<rect x="${x}" y="34" width="${Math.max(1, n * sc - 2)}" height="34" rx="3" fill="${n < B ? C.amber : C.blue}" opacity="0.75"/>`; if (n * sc > 22) s += tx(x + n * sc / 2, 56, n, "middle"); x += n * sc; });
    if (drop && rem) s += `<rect x="${x}" y="34" width="${rem * sc - 2}" height="34" rx="3" fill="none" stroke="${C.coral}" stroke-dasharray="3 3"/>` + tx(x + rem * sc / 2, 84, "dropped", "middle");
    /* averaging demonstration: targets 1 everywhere except the last batch, which is 4, zero model */
    const tg = i => (demo ? i >= 32 : i >= m - (rem || B)) ? 4 : 1;
    const used = sizes.reduce((a, b) => a + b, 0); let start = 0; const means = sizes.map(n => { let ss = 0; for (let i = start; i < start + n; i++) ss += tg(i) ** 2; start += n; return ss / n; });
    const wavg = means.reduce((a, L, i) => a + L * sizes[i], 0) / used, navg = means.reduce((a, b) => a + b, 0) / means.length;
    let tru = 0; for (let i = 0; i < m; i++) tru += tg(i) ** 2; tru /= m;
    s += tx(20, 120, "zero model, targets 1 except the rows of the last batch, which are 4:", null);
    s += tx(20, 146, `weighted Σ nb Lb / Σ nb = ${f(wavg, 4)}`, null, "t") + tx(20, 168, `naive mean of batch means = ${f(navg, 4)}`, null, "t") + tx(20, 190, `true MSE over all ${m} rows = ${f(tru, 4)}`, null, "t");
    s += tx(20, 222, drop && rem ? "with drop_last the dropped rows never count, so even the weighted loss misses them" : Math.abs(wavg - navg) < 1e-9 ? "equal batch sizes: both averages agree" : "unequal batch sizes: only the weighted average is the MSE", null, "th");
    fig.innerHTML = svg(240, s) + ML.code(["total, count = 0.0, 0", "for xb, yb in loader:", "    loss = nn.functional.mse_loss(model(xb), yb)   # mean over the batch", "    total += loss.item() * len(yb); count += len(yb)", "epoch_mse = total / count"], 3);
    $("ea2").innerHTML = ML.readout([["batches per epoch", sizes.length], ["rows used", `${used} of ${m}`]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { drop = +b.dataset.k; demo = 0; u(); });
  $("dm").onclick = () => { demo = 1; drop = 0; u(); };
  $("em").oninput = () => { demo = 0; u(); }; $("eb").oninput = () => { demo = 0; u(); }; u();
}},

{s: "8. SGD never settles", t: "With a fixed rate SGD hovers above the minimum, a decaying rate lets it land",
intu: String.raw`Each SGD step follows one row's gradient, which points at that row's own best line, not the overall minimum. Near the minimum the full gradient is tiny but the single-row gradients are not, so with a fixed α the parameters keep jittering and the training loss hovers above its minimum. The size of that noise floor grows with α. Two remedies: a larger batch averages the noise down, and a decaying rate α/(1 + t/τ) takes shrinking steps so the iterate settles. Ng's Deep Learning course calls the second learning rate decay. Run 10 epochs of SGD and compare the two curves of excess training loss.`,
eq: String.raw`\[ \alpha_t = \frac{\alpha_0}{1 + t/\tau}, \qquad E\left[\nabla L_i(\theta)\right] = \nabla L(\theta), \qquad \operatorname{Var}\left[\nabla L_i(\theta^*)\right] \gt 0 \]`,
sym: [["single-row gradient", "an unbiased but noisy estimate of the full gradient"], ["noise floor", "the excess loss SGD keeps at a fixed α, larger for larger α"], [String.raw`\(\alpha_t\)`, "learning rate at update t"], [String.raw`\(\tau\)`, "decay scale in updates, here 210, one epoch"], ["excess loss", "training MSE minus the least squares MSE, 0.01045"]],
how: ["Run SGD with a fixed α and plot the training loss after every update.", "It drops fast, then wobbles at a level that depends on α.", "Halve α: the floor drops, the start slows.", "Use a decaying schedule to get both, fast early, quiet late.", "In PyTorch the schedule is a scheduler object, Lesson 35."],
say: String.raw`Stochastic gradient descent with a constant learning rate keeps fluctuating around the minimum because single-example gradients do not vanish there, and a decaying learning rate or a larger batch reduces that fluctuation.`,
num: String.raw`B = 1, α₀ = 0.1, 10 epochs (2100 updates): fixed α averages an excess MSE of about <b>2e−3</b> over the last epoch, the decaying α with τ = 210 about <b>1e−4</b>. Both start from (0, 0) with MSE 4.27.`,
r(fig, ctl) {
  ctl.innerHTML = sl("na", "α₀", 0.01, 0.4, 0.01, 0.1) + `<div id="nf"></div>`;
  const u = () => {
    const a0 = +$("na").value; $("nav").textContent = f(a0, 2);
    const Pf = sgd(1, a0, 10, 77), Pd = sgd(1, a0, 10, 77, 210);
    const ex = P => P.map(p => Math.max(1e-7, MSE6(p[0], p[1]) - MSE6S));
    const Ef = ex(Pf), Ed = ex(Pd);
    const a = ML.axes(70, 20, 380, 240, { xmin: 0, xmax: 2100, ymin: -7, ymax: 1, nx: 7, ny: 8, fx: v => v, fy: v => "1e" + v, xl: "update", yl: "training MSE − minimum" });
    let s = a.s + ML.path(Ef.map((v, i) => [a.X(i), a.Y(Math.max(-7, Math.min(1, Math.log10(v))))]).filter((_, i) => i % 3 === 0), C.coral, 1.2) + ML.path(Ed.map((v, i) => [a.X(i), a.Y(Math.max(-7, Math.min(1, Math.log10(v))))]).filter((_, i) => i % 3 === 0), C.teal, 1.6);
    for (let e = 1; e < 10; e++) s += `<line x1="${a.X(210 * e)}" y1="20" x2="${a.X(210 * e)}" y2="260" stroke="var(--line)" stroke-dasharray="2 4"/>`;
    const last = E => { const t = E.slice(-210); return t.reduce((s, v) => s + v, 0) / t.length; };
    s += tx(480, 40, "coral: fixed α", null) + tx(480, 58, "teal: α₀/(1 + t/210)", null) + tx(480, 76, "dotted: epoch boundaries", null);
    s += tx(480, 116, "average excess, last epoch:", null, "th") + tx(480, 138, `fixed: ${last(Ef).toExponential(1)}`, null, "t") + tx(480, 158, `decaying: ${last(Ed).toExponential(1)}`, null, "t");
    s += tx(480, 196, "double α₀ and the fixed-rate", null) + tx(480, 212, "floor rises, the decaying", null) + tx(480, 228, "run still lands", null);
    fig.innerHTML = svg(302, s) + ML.code(["optimizer = torch.optim.SGD(model.parameters(), lr=" + f(a0, 2) + ")", "scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lambda t: 1 / (1 + t / 210))", "# after each optimizer.step(): scheduler.step()"], -1);
    $("nf").innerHTML = "";
  };
  $("na").oninput = u; u();
}},

{s: "9. One update, two conventions", t: "Mean squared error or half of it: the gradient differs by a factor 2",
intu: String.raw`HW6 Task 1.1 by hand: samples (0, 1) and (1, 3), start at w = b = 0, learning rate 0.1. The predictions are 0 and 0, the MSE is (1 + 9)/2 = 5. With PyTorch's MSE, the mean of squared errors without a half, the gradient carries a factor 2/N: ∂L/∂w = −3 and ∂L/∂b = −4. One simultaneous update gives w = 0.3, b = 0.4, and the loss falls to 2.825. Ng and HW3 use half the MSE, so their gradient is half as large and the same α takes half the step. Neither is wrong. They are the same algorithm with α rescaled by 2, which matters when you copy a learning rate from one convention to the other.`,
eq: String.raw`\[ L = \frac{1}{N}\sum_i (wx_i + b - y_i)^2, \qquad \frac{\partial L}{\partial w} = \frac{2}{N}\sum_i e_i x_i, \qquad \frac{\partial L}{\partial b} = \frac{2}{N}\sum_i e_i \]`,
sym: [[String.raw`\(e_i = wx_i + b - y_i\)`, "error of sample i, prediction minus target"], ["MSE", "PyTorch's nn.MSELoss, mean of e squared"], ["half MSE", "Ng and HW3, one half of the MSE, gradient without the 2"], ["factor 2", "the half-MSE step at α equals the MSE step at α/2"], ["simultaneous", "both partials at the old (w, b), then both updates"]],
how: ["Predictions at w = b = 0: both 0. Errors e = (−1, −3).", "MSE = (1 + 9)/2 = 5.", "∂L/∂w = (2/2)(−1·0 − 3·1) = −3, ∂L/∂b = (2/2)(−1 − 3) = −4.", "Update: w = 0 − 0.1(−3) = 0.3, b = 0 − 0.1(−4) = 0.4.", "New predictions 0.4 and 0.7, errors (−0.6, −2.3), MSE = (0.36 + 5.29)/2 = 2.825."],
say: String.raw`The gradient of the mean squared error carries a factor two over N, the gradient of half the mean squared error does not, so the two conventions take the same direction with steps that differ by a factor of two.`,
num: String.raw`MSE convention: gradients (<b>−3, −4</b>), (w, b) = (<b>0.3, 0.4</b>), loss 5 → <b>2.825</b>. Half-MSE convention: gradients (−1.5, −2), (w, b) = (0.15, 0.2), MSE 5 → <b>3.831</b>.`,
r(fig, ctl) {
  let cv = 0;
  ctl.innerHTML = btns([[0, "PyTorch MSE"], [1, "half MSE, Ng and HW3"]], "k") + `<div id="tc"></div>`;
  const xs = [0, 1], ys = [1, 3], lr = 0.1;
  const u = () => {
    pick(ctl, "k", cv);
    const e0 = xs.map((x, i) => -ys[i]), k = cv ? 1 : 2, gw = k / 2 * (e0[0] * xs[0] + e0[1] * xs[1]), gb = k / 2 * (e0[0] + e0[1]);
    const w1 = -lr * gw, b1 = -lr * gb, e1 = xs.map((x, i) => w1 * x + b1 - ys[i]), L = e => (e[0] ** 2 + e[1] ** 2) / 2 * (cv ? 0.5 : 1), mse = e => (e[0] ** 2 + e[1] ** 2) / 2;
    const rows = [["x", 0, 1], ["y", 1, 3], ["ŷ before", 0, 0], ["e before", e0[0], e0[1]], ["ŷ after", f(b1, 2), f(w1 + b1, 2)], ["e after", f(e1[0], 2), f(e1[1], 2)]];
    let s = tx(30, 22, cv ? "half MSE: J = (1/2N) Σ e², gradient (1/N) Σ e·x" : "MSE: L = (1/N) Σ e², gradient (2/N) Σ e·x", null, "th");
    rows.forEach((r, i) => s += tx(40, 56 + i * 24, r[0], null, "t") + tx(160, 56 + i * 24, r[1], "middle", "t") + tx(230, 56 + i * 24, r[2], "middle", "t"));
    s += tx(160, 40, "sample 1", "middle") + tx(230, 40, "sample 2", "middle");
    s += tx(320, 56, `loss before = ${f(L(e0), 4)}`, null, "t") + tx(320, 80, `∂/∂w = ${f(gw, 2)},  ∂/∂b = ${f(gb, 2)}`, null, "t") + tx(320, 104, `w = 0 − 0.1(${f(gw, 2)}) = ${f(w1, 2)}`, null, "t") + tx(320, 128, `b = 0 − 0.1(${f(gb, 2)}) = ${f(b1, 2)}`, null, "t") + tx(320, 152, `loss after = ${f(L(e1), 4)}`, null, "t") + tx(320, 176, `MSE after = ${f(mse(e1), 4)}`, null, "th");
    const a = ML.axes(320, 196, 180, 80, { xmin: -0.2, xmax: 1.2, ymin: 0, ymax: 3.5, nx: 2, ny: 2, fx: v => v.toFixed(1), fy: v => v, grid: false });
    s += a.s + xs.map((x, i) => `<circle cx="${a.X(x)}" cy="${a.Y(ys[i])}" r="4" fill="${C.coral}"/>`).join("") + ML.path([[a.X(-0.2), a.Y(Math.max(0, b1 - 0.2 * w1))], [a.X(1.2), a.Y(b1 + 1.2 * w1)]], C.blue, 2) + ML.path([[a.X(-0.2), a.Y(0)], [a.X(1.2), a.Y(0)]], C.gray, 1.5, "4 3");
    s += tx(520, 220, "gray: the start w = b = 0", null) + tx(520, 238, "blue: after one update", null);
    fig.innerHTML = svg(300, s);
    $("tc").innerHTML = ML.readout([["step length", f(Math.hypot(w1, b1), 4)], ["same as MSE with α", cv ? "0.05" : "0.1"]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { cv = +b.dataset.k; u(); }); u();
}},

{s: "10. The same step in PyTorch", t: "zero_grad, forward, loss, backward, step: card 9 in five lines",
intu: String.raw`HW6 Task 1.4 names the five operations of a training step: clear the gradients, predict, compute the mean MSE, backpropagate, step. Run card 9's update through them and watch the parameters and their gradients. After <code>backward()</code> the gradients are −3 and −4, exactly the hand values, because autograd applies the same chain rule. After <code>step()</code> the parameters are 0.3 and 0.4. Skip <code>zero_grad()</code> on the next update and the old gradients are added to the new ones, HW6's bug B. The step itself never computes a derivative, it only reads <code>.grad</code> and subtracts α times it.`,
eq: String.raw`\[ \texttt{zero\_grad} \to \hat y = wx + b \to L = \text{mean}(\hat y - y)^2 \to \texttt{backward} \to \theta \leftarrow \theta - \alpha\,\theta.\texttt{grad} \]`,
sym: [[String.raw`\(\texttt{zero\_grad}\)`, "sets every .grad to zero or None, gradients otherwise accumulate"], ["forward", "model(xb), builds the computation graph"], ["loss", "a scalar, mean over the batch"], ["backward", "fills .grad of every parameter by the chain rule"], ["step", "θ ← θ − α θ.grad for plain SGD, all parameters at once"]],
how: ["Clear the gradients before the forward pass.", "Forward: predictions with matching shapes, (N, 1) against (N, 1).", "Loss: a scalar. Check the shape before calling backward.", "Backward: read <code>w.grad</code> and compare with your hand gradient once.", "Step: plain SGD subtracts lr times grad from every parameter, the simultaneous update of Lesson 13 built in."],
say: String.raw`A PyTorch training step clears the gradients, runs the forward pass, computes a scalar loss, backpropagates to fill the parameter gradients, and lets the optimizer subtract the learning rate times those gradients.`,
num: String.raw`After <code>backward()</code>: w.grad = <b>−3</b>, b.grad = <b>−4</b>. After <code>step()</code>: w = <b>0.3</b>, b = <b>0.4</b>. Without <code>zero_grad()</code>, the second step would use −3 plus the new gradient.`,
r(fig, ctl) {
  const code = ["model = nn.Linear(1, 1); nn.init.zeros_(model.weight); nn.init.zeros_(model.bias)", "opt = torch.optim.SGD(model.parameters(), lr=0.1)", "x = torch.tensor([[0.0], [1.0]]); y = torch.tensor([[1.0], [3.0]])", "opt.zero_grad()", "pred = model(x)                      # shape (2, 1)", "loss = nn.functional.mse_loss(pred, y)", "loss.backward()", "opt.step()"];
  const steps = [
    { ln: 2, w: "0", b: "0", gw: "None", gb: "None", pred: "", loss: "", note: "parameters start at zero, no gradients yet" },
    { ln: 3, w: "0", b: "0", gw: "None", gb: "None", pred: "", loss: "", note: "1. clear: nothing left from a previous step" },
    { ln: 4, w: "0", b: "0", gw: "None", gb: "None", pred: "[[0.], [0.]]", loss: "", note: "2. forward: both predictions 0, graph recorded" },
    { ln: 5, w: "0", b: "0", gw: "None", gb: "None", pred: "[[0.], [0.]]", loss: "5.0", note: "3. loss: (1 + 9)/2, a scalar" },
    { ln: 6, w: "0", b: "0", gw: "−3.0", gb: "−4.0", pred: "[[0.], [0.]]", loss: "5.0", note: "4. backward: the hand gradients of card 9" },
    { ln: 7, w: "0.3", b: "0.4", gw: "−3.0", gb: "−4.0", pred: "[[0.], [0.]]", loss: "5.0", note: "5. step: w = 0 − 0.1(−3), b = 0 − 0.1(−4)" }
  ];
  const draw = k => {
    const st = steps[k];
    let s = "";
    const cell = (x, y, lab, v, on) => `<g class="${on ? "c-teal" : "c-gray"}"><rect x="${x}" y="${y}" width="140" height="44" rx="7" stroke-width="${on ? 1.6 : 0.6}"/></g>` + tx(x + 8, y + 16, lab, null) + tx(x + 70, y + 36, v || "·", "middle", "t");
    s += cell(20, 20, "model.weight", st.w, k === 5) + cell(180, 20, "model.bias", st.b, k === 5) + cell(20, 80, "weight.grad", st.gw, k === 4) + cell(180, 80, "bias.grad", st.gb, k === 4) + cell(360, 20, "pred", st.pred, k === 2) + cell(360, 80, "loss", st.loss, k === 3);
    s += tx(20, 160, st.note, null, "th");
    fig.innerHTML = svg(180, s) + ML.code(code, st.ln);
  };
  ML.stepper(ctl, steps.length, draw, ["setup", "zero_grad", "forward", "loss", "backward", "step"]);
}},

{s: "11. With the agent", t: "Do it with the agent: an optimizer you can trust",
intu: String.raw`The lesson as code: HW3's traceable batch optimizer, a learning rate sweep that labels divergence instead of crashing, a minibatch SGD loop with per-epoch shuffling and sample-weighted epoch losses, and tests that pin the numbers from these cards. A wrong stability edge, a missing copy, an equal-weight epoch average or a forgotten <code>zero_grad</code> each fails a test with a value you can check by hand.`,
eq: String.raw`\[ \texttt{gradient\_descent} \to \texttt{sweep\_rates} \to \texttt{minibatch\_sgd} \to \texttt{epoch\_mse} \]`,
sym: [["gradient descent", "HW3 contract: copy, histories, FloatingPointError"], ["sweep rates", "same start and budget, status finite or diverged"], ["minibatch SGD", "shuffle every epoch, PyTorch MSE convention"], ["epoch MSE", "Σ nb Lb / Σ nb"], ["tests", "the toy, the food truck and the 32 + 3 check"]],
how: ["Paste the command.", "Read the optimizer: is θ copied, and is the cost checked with np.isfinite?", "Read the epoch average: is it weighted by batch size?", "Run the tests. The values are from cards 1, 3, 7 and 9.", "Commit the module with its tests."],
say: String.raw`An optimizer module records its history, reports divergence as data, weights epoch losses by batch size, and is tested against values computed by hand.`,
num: String.raw`Tests expect J₁ = <b>0.9028</b> on the toy, a final cost of <b>4.4834</b> at α = 0.01 on ex1data1, <b>diverged</b> at α = 0.03, epoch MSE <b>2.2857</b> for the 32 + 3 check, and (w, b) = <b>(0.3, 0.4)</b> after one MSE step.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/optim.py using numpy only. Functions: gradient_descent(X, y, theta, lr, n) following HW3 Task 5.1: copy theta, return (theta, cost_history of shape (n,), theta_history of shape (n+1, p)), cost = half MSE, raise FloatingPointError when the cost is not finite. sweep_rates(X, y, rates, n) that runs gradient_descent from zeros for each rate and returns a list of dicts with rate, status ('finite' or 'diverged') and final_cost (nan when diverged). minibatch_sgd(X, y, theta, lr, batch_size, epochs, seed) using the PyTorch MSE convention (gradient 2/|B| * X_B.T @ (X_B @ theta - y_B)), shuffling with np.random.default_rng(seed).permutation each epoch and keeping the last short batch; return theta and a list of epoch_mse values. epoch_mse(batch_losses, batch_sizes) returning the sample-weighted mean. Create tests/test_optim.py with pytest: on X = [[1,0],[1,1],[1,2]], y = [1,2,2], lr 0.1, the first cost is close to 0.902778 and the input theta array is unchanged; on data/ex1data1.txt (no header) with an intercept, 1500 iterations at lr 0.01 end near 4.48339 and sweep_rates([0.001, 0.01, 0.03]) labels 0.03 as diverged; epoch_mse([1.0, 16.0], [32, 3]) is close to 2.285714; one minibatch_sgd epoch with batch_size 2 on x = [0, 1], y = [1, 3] from zeros at lr 0.1 gives w = 0.3 and b = 0.4. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".......                                                  [100%]", "7 passed in 0.31s"],
    checks: ["gradient_descent copies theta and the test proves the caller's array is unchanged", "divergence is returned as a status, not an unhandled exception in the sweep", "minibatch_sgd reshuffles every epoch and keeps the short last batch", "epoch_mse weights by batch size, and the 32 + 3 test would fail with an equal-weight mean", "the one-step test uses the factor 2 of the MSE convention"]
  });
}},

{s: "12. Test", t: "Lesson 16 test: gradient descent",
intu: String.raw`Twelve questions on the optimizer contract, the two phases on a valley, learning rate stability, the eigenvalue picture, stopping rules, batch sizes, epoch averages, SGD noise, the two loss conventions and the PyTorch step.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to feature scaling.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A gradient descent run of 200 iterations should return a theta history of shape (rows, 3) where rows is", o: ["200", "201", "199", "3"], a: 1, why: "The starting θ plus one row per update. The cost history has 200 entries. Card 1." },
    { q: "Batch gradient descent on a long thin valley typically shows", o: ["a slow start, then a fast finish", "a fast drop, then slow progress along the valley floor", "a constant rate throughout", "oscillation forever"], a: 1, why: "The stiff direction settles in a few steps, the soft one takes the rest. Card 2." },
    { q: "Your cost goes 10, 14, 25, 61. The first fix is", o: ["train longer", "reduce the learning rate", "add features", "increase the learning rate"], a: 1, why: "A rising cost means overshooting. More iterations make it worse. Card 3." },
    { q: "The curvature matrix of a quadratic cost has eigenvalues 50 and 2. The largest stable α is", o: ["0.04", "1", "0.02", "0.5"], a: 0, why: "α must be below 2/λmax = 2/50 = 0.04. Card 4." },
    { q: "Same eigenvalues 50 and 2, α = 0.02. The error along the soft direction is multiplied each step by", o: ["0.96", "0", "0.04", "−0.96"], a: 0, why: "1 − αλ = 1 − 0.02 × 2 = 0.96. The stiff factor is 1 − 1 = 0. Card 4." },
    { q: "On f(x) = 3x² the update x ← x − η f′(x) converges when", o: ["0 < η < 1", "0 < η < 1/3", "0 < η < 2/3", "0 < η < 2"], a: 1, why: "f′ = 6x, factor 1 − 6η, |1 − 6η| < 1 gives 0 < η < 1/3. Card 4." },
    { q: "An ε rule on the per-iteration decrease of the cost fires at iteration 12. You should", o: ["accept the result", "check the gradient norm and the cost curve, the rule can fire in a slow direction", "lower ε to zero", "raise α tenfold"], a: 1, why: "A small decrease can mean a slow valley, not arrival. Card 5." },
    { q: "500 training rows, batch size 64, drop_last=False. Batches per epoch and last batch size:", o: ["7 and 52", "8 and 52", "8 and 64", "7 and 64"], a: 1, why: "⌈500/64⌉ = 8 batches, the last has 500 − 7 × 64 = 52 rows. Cards 6 and 7." },
    { q: "Batch mean losses 2.0 (64 rows) and 8.0 (16 rows). The epoch MSE is", o: ["5.0", "3.2", "10", "4.0"], a: 1, why: "(64 × 2 + 16 × 8)/80 = (128 + 128)/80 = 3.2. The equal-weight mean 5.0 is wrong. Card 7." },
    { q: "SGD with a fixed learning rate reaches a training loss that wobbles above the minimum. Which change lowers the wobble?", o: ["a larger fixed α", "a decaying learning rate or a larger batch", "fewer epochs", "no shuffling"], a: 1, why: "Single-row gradients do not vanish at the minimum. Shrink the step or average more rows. Card 8." },
    { q: "Samples (0, 2) and (2, 2), w = b = 0, PyTorch MSE. ∂L/∂w is", o: ["−4", "−2", "−8", "0"], a: 0, why: "Errors (−2, −2). (2/N)Σ e x = (2/2)(0 − 4) = −4. Card 9." },
    { q: "In a training loop, forgetting <code>optimizer.zero_grad()</code> causes", o: ["no gradient at all", "gradients from earlier steps to accumulate into the new ones", "the learning rate to reset", "a shape error"], a: 1, why: "backward() adds to .grad. Clear it before each step. Card 10." }
  ], "Lesson 16 test");
}}
],
summary: String.raw`Gradient descent is a loop that updates every parameter from one gradient, records the cost and the parameters after each update, and raises an error the moment the cost is not finite. On a long valley such as HW3's food truck data it drops fast in the stiff direction and then creeps along the floor, so 1500 iterations at α = 0.01 still end slightly above the exact minimum. Along each eigenvector of the curvature matrix the error is multiplied by one minus α times the eigenvalue, so α must stay below two over the largest eigenvalue and the smallest eigenvalue sets the speed, which is why the edge between converging and exploding is sharp. A rule that stops on a small decrease in cost can fire far from the minimum, so judge convergence by the curve, the gradient norm and a direct solution. Mini-batch and stochastic updates use B rows or one row per update, an epoch holds the ceiling of m over B updates, and the epoch loss must be weighted by batch size. SGD with a fixed rate hovers above the minimum, a decaying rate or a larger batch lets it settle. PyTorch's MSE gradient carries a factor two that half-MSE lacks, and its five-line step of clearing gradients, forward, loss, backward and step is the same update.`,
sheet: [[String.raw`\[ \theta \leftarrow \theta - \frac{\alpha}{m} X^T(X\theta - y) \]`, "batch gradient descent for linear regression, half-MSE cost"], [String.raw`\[ 0 \lt \alpha \lt \frac{2}{\lambda_{\max}}, \qquad \lambda\left(\tfrac{1}{m}X^TX\right) \]`, "stability condition"], [String.raw`\[ e_j^{(k)} = (1 - \alpha\lambda_j)^k e_j^{(0)} \]`, "error along each eigen-direction"], [String.raw`\[ x_{k+1} = (1 - 2\eta)x_k \ \text{on} \ f = x^2 \]`, "HW5's one-dimensional case, converges for 0 < η < 1"], [String.raw`\[ \text{batches} = \lceil m/B \rceil, \qquad L_{\text{epoch}} = \frac{\sum_b n_b L_b}{\sum_b n_b} \]`, "epochs and sample-weighted averages"], [String.raw`\[ \frac{\partial}{\partial w}\frac{1}{N}\sum_i e_i^2 = \frac{2}{N}\sum_i e_i x_i \]`, "the PyTorch MSE gradient"], [String.raw`\[ \alpha_t = \frac{\alpha_0}{1 + t/\tau} \]`, "learning rate decay for SGD"]],
sources: ["AME 5970 Lecture 3 notes, topic order of sections 1 to 11 (gradient descent for linear regression, learning rate, convergence, batch and stochastic gradient descent)", "AME 5970 HW3 Part 2 solutions (Tasks 5.1, 5.2, 7.1, 7.2, 9.3) and the Linear Regression learning guide", "AME 5970 HW5 Problem 2 (learning rates on x², fair PyTorch comparisons) and HW6 Problem 1 (Tasks 1.1, 1.2, 1.4, minibatch SGD, sample-weighted epoch loss)", "Andrew Ng, Machine Learning course, week 1: Gradient descent for linear regression. Week 2: Gradient descent in practice II, learning rate", "Andrew Ng, Deep Learning Specialization, course 2 week 2: Mini-batch gradient descent, Understanding mini-batch gradient descent, Learning rate decay", "Goodfellow, Bengio and Courville, Deep Learning, sections 4.3 (gradient-based optimization, the condition number) and 8.1 to 8.3 (SGD and learning rate schedules)"]
});
})();
