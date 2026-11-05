(function () {
/* ML shelf, Part 3, Lesson 13: Calculus and gradients. Follows AME 5970 Lecture 2 notes sections 07 to 11 (the calculus you need, gradient descent, from the cost to the update, the numerical example, simultaneous updates), Lecture 3 section 10 and 12 (multi-variable update, feature scaling), and Andrew Ng's week 1 and 2 lectures on gradient descent, the learning rate and feature scaling. All numbers are the professor's. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const key = (i, j) => i + "," + j;
/* the lecture's main data and half-MSE cost */
const DX = [1, 2, 3], DY = [2, 3, 5], M = 3;
const Jcost = (b, w, X, Y) => { X = X || DX; Y = Y || DY; let s = 0; for (let i = 0; i < X.length; i++) { const e = b + w * X[i] - Y[i]; s += e * e; } return s / (2 * X.length); };
const grad = (b, w, X, Y) => { X = X || DX; Y = Y || DY; let gb = 0, gw = 0; for (let i = 0; i < X.length; i++) { const e = b + w * X[i] - Y[i]; gb += e; gw += e * X[i]; } return [gb / X.length, gw / X.length]; };
/* run gradient descent from (b0, w0) with rate a for n steps, simultaneous updates */
const run = (b0, w0, a, n, X, Y) => { const P = [[b0, w0]]; let b = b0, w = w0; for (let k = 0; k < n; k++) { const [gb, gw] = grad(b, w, X, Y); b -= a * gb; w -= a * gw; P.push([b, w]); } return P; };
/* contour lines of a quadratic cost by marching squares on a grid */
const contours = (fn, ax, box, levels, nx, ny) => {
  nx = nx || 60; ny = ny || 60; const xs = range(box.xmin, box.xmax, nx + 1), ys = range(box.ymin, box.ymax, ny + 1);
  const Z = ys.map(y => xs.map(x => fn(x, y)));
  let s = "";
  const lerp = (p, q, vp, vq, lv) => { const t = (lv - vp) / (vq - vp); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
  levels.forEach((lv, li) => {
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const c = [[xs[i], ys[j], Z[j][i]], [xs[i + 1], ys[j], Z[j][i + 1]], [xs[i + 1], ys[j + 1], Z[j + 1][i + 1]], [xs[i], ys[j + 1], Z[j + 1][i]]];
      const pts = [];
      for (let e = 0; e < 4; e++) { const p = c[e], q = c[(e + 1) % 4]; if ((p[2] - lv) * (q[2] - lv) < 0) pts.push(lerp(p, q, p[2], q[2], lv)); }
      if (pts.length >= 2) s += `<line x1="${ax.X(pts[0][0])}" y1="${ax.Y(pts[0][1])}" x2="${ax.X(pts[1][0])}" y2="${ax.Y(pts[1][1])}" stroke="${C.blue}" stroke-width="1" opacity="${0.35 + 0.5 * (1 - li / levels.length)}"/>`;
      if (pts.length === 4) s += `<line x1="${ax.X(pts[2][0])}" y1="${ax.Y(pts[2][1])}" x2="${ax.X(pts[3][0])}" y2="${ax.Y(pts[3][1])}" stroke="${C.blue}" stroke-width="1" opacity="0.5"/>`;
    }
  });
  return s;
};
const BSTAR = 1 / 3, WSTAR = 1.5, JSTAR = Jcost(BSTAR, WSTAR);

addLesson("ml", "math", {
level: "Core", num: "Lesson 13",
id: "ml-math-l13", title: "Calculus and gradients", short: "13. Calculus and gradients",
big: String.raw`Every model in the course is trained the same way: write a cost, differentiate it with respect to each parameter, step every parameter a little against its derivative, repeat. This lesson is that machine taken apart. A derivative is a local slope and predicts small changes. Three rules, constant, power and chain, differentiate everything in Part 4. Gradient descent in one dimension on the professor's f(z) = z² + 5 shows what the learning rate does. Partial derivatives make a gradient, which points uphill, so we step the other way. The regression gradients are derived line by line and then carried out by hand on x = (1, 2, 3), y = (2, 3, 5), with the exact numbers from the lecture. The last cards cover why both updates must use the same old model, the matrix form Aᵀ(Aθ − y)/m, why feature scaling makes the bowl round, and how to check any gradient numerically before trusting it. PyTorch's autograd does the derivative step for you in Part 5, and these cards are what it computes.`,
bridge: String.raw`Lecture 2 notes sections 07 to 11 are the source, with Lecture 3 section 10 for the multi-variable form and section 12 for feature scaling. Andrew Ng's week 1 gradient descent lectures and week 2 feature scaling lecture say the same things with the same pictures. Lesson 15 runs this on the real HW3 data, and Lesson 21 replaces the hand derivative with <code>loss.backward()</code>.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The derivative", t: "A derivative is a local slope that predicts small changes",
intu: String.raw`The professor's optimization example is f(z) = z² + 5 with derivative f′(z) = 2z. At z = 2 the value is 9 and the derivative is 4. The two numbers answer different questions: the value says how high we are, the derivative says how fast the height changes per unit of z, right here. For a small step Δz = 0.01 the derivative predicts an increase of 4 × 0.01 = 0.04 and the exact increase is 0.0401. Drag z and watch the tangent line and the prediction. The sign of the derivative is the direction of uphill, which is all gradient descent needs.`,
eq: String.raw`\[ f(z) = z^2 + 5, \quad f'(z) = 2z, \quad f(z + \Delta z) \approx f(z) + f'(z)\,\Delta z, \quad f(2.01) - f(2) = 0.0401 \approx 4 \times 0.01 \]`,
sym: [["f(z)", "the function value, how high we are"], [String.raw`\(f'(z)\)`, "the derivative, the slope of the tangent at z"], [String.raw`\(\Delta z\)`, "a small change in z"], ["local", "the prediction is good for small steps, no promise for large ones"], ["sign", "positive means increasing z increases f, negative means it decreases f"]],
how: ["Pick a point z. The tangent line there has slope f′(z).", "Move Δz along the tangent: predicted change f′(z)·Δz.", "Compare with the exact change f(z + Δz) − f(z). They agree to first order.", "Halve Δz and the gap between predicted and exact shrinks by about four, which is the meaning of a local approximation.", "A positive derivative points uphill. To go downhill, move z against the sign of f′(z)."],
say: String.raw`The derivative is the slope of the tangent, it predicts the change in the function for a small step, and its sign says which way is uphill.`,
num: String.raw`At z = 2: f = <b>9</b>, f′ = <b>4</b>, predicted change for Δz = 0.01 is <b>0.04</b>, exact change <b>0.0401</b>. At z = −2: f = 9, f′ = <b>−4</b>, so increasing z decreases f.`,
r(fig, ctl) {
  ctl.innerHTML = sl("z", "z", -3, 3, 0.1, 2) + sl("dz", "Δz", 0.01, 1, 0.01, 0.5) + `<div id="dv"></div>`;
  const F = z => z * z + 5, dF = z => 2 * z;
  const u = () => {
    const z = +$("z").value, dz = +$("dz").value; $("zv").textContent = f(z, 1); $("dzv").textContent = f(dz, 2);
    const a = ML.axes(60, 20, 380, 240, { xmin: -3, xmax: 3, ymin: 4, ymax: 15, nx: 6, ny: 11, fx: v => v, fy: v => v, xl: "parameter z", yl: "f(z)" });
    let s = a.s + ML.path(range(-3, 3, 80).map(v => [a.X(v), a.Y(F(v))]), C.blue, 2);
    const sl0 = dF(z), t0 = Math.max(-3, z - 1.2), t1 = Math.min(3, z + 1.2);
    s += ML.path([[a.X(t0), a.Y(F(z) + sl0 * (t0 - z))], [a.X(t1), a.Y(F(z) + sl0 * (t1 - z))]], C.coral, 2);
    s += `<circle cx="${a.X(z)}" cy="${a.Y(F(z))}" r="5" fill="${C.coral}"/>`;
    const pred = F(z) + sl0 * dz, exact = F(z + dz);
    if (z + dz <= 3) { s += `<circle cx="${a.X(z + dz)}" cy="${a.Y(pred)}" r="4" fill="none" stroke="${C.coral}" stroke-width="2"/><circle cx="${a.X(z + dz)}" cy="${a.Y(exact)}" r="4" fill="${C.teal}"/>`; s += `<line x1="${a.X(z + dz)}" y1="${a.Y(pred)}" x2="${a.X(z + dz)}" y2="${a.Y(exact)}" stroke="${C.teal}" stroke-dasharray="3 3"/>`; }
    if (Math.abs(sl0) > 0.05) s += arrow(a.X(z), a.Y(F(z)) - 22, a.X(z) - Math.sign(sl0) * 36, a.Y(F(z)) - 22, C.gray, 2) + tx(a.X(z) - Math.sign(sl0) * 40, a.Y(F(z)) - 28, "downhill", sl0 > 0 ? "end" : "start");
    s += tx(470, 40, `f(${f(z, 1)}) = ${f(F(z), 2)}`, null, "t") + tx(470, 62, `f′(${f(z, 1)}) = ${f(sl0, 2)}`, null, "t");
    s += tx(470, 100, "step Δz = " + f(dz, 2), null, "th") + tx(470, 122, "predicted: " + f(sl0 * dz, 4), null, "t") + tx(470, 142, "exact: " + f(exact - F(z), 4), null, "t") + tx(470, 162, "gap: " + f(exact - F(z) - sl0 * dz, 4), null, "t") + tx(470, 190, "gap = (Δz)², the second", null) + tx(470, 206, "order term the tangent ignores", null);
    s += tx(470, 240, "coral: tangent and its prediction", null) + tx(470, 256, "teal: the exact new value", null);
    fig.innerHTML = svg(300, s);
    $("dv").innerHTML = ML.readout([["derivative sign", sl0 > 0 ? "positive: uphill is to the right" : sl0 < 0 ? "negative: uphill is to the left" : "zero: a flat point, the minimum here"]]);
  };
  $("z").oninput = u; $("dz").oninput = u; u();
}},

{s: "2. Three rules", t: "The rules you need: constant, power, chain, and a few friends",
intu: String.raw`The professor says three rules are enough for the regression derivation: the derivative of a constant is zero, the derivative of z² is 2z, and the chain rule differentiates a function of a function. The chain rule in the form you will use most: if an error e depends on a parameter u, then the derivative of ½e² is e times de/du. Pick a function and see its derivative plotted on top of a numerical slope check, so you can confirm each rule by eye. The last entries, exp, log and the sigmoid, arrive in Part 4 for logistic regression.`,
eq: String.raw`\[ \frac{d}{dz} c = 0, \qquad \frac{d}{dz} z^n = n z^{n-1}, \qquad \frac{d}{du}\left(\tfrac{1}{2} e^2\right) = e \, \frac{de}{du}, \qquad \frac{d}{dz}[f(z) + g(z)] = f'(z) + g'(z) \]`,
sym: [["constant rule", "a term that does not depend on z contributes nothing"], ["power rule", "bring the exponent down, reduce it by one"], ["chain rule", "outer derivative at the inner value, times the inner derivative"], ["sum rule", "differentiate term by term, which is why a sum over examples differentiates example by example"], ["numerical check", "the slope of a secant with a tiny step, drawn in gray"]],
how: ["Identify the outermost operation: a square, an exponential, a sum.", "Differentiate it, leaving the inside alone.", "Multiply by the derivative of the inside.", "For ½(u − y)² the outer derivative is (u − y) and the inner derivative of u − y with respect to u is 1.", "Check any derivative numerically once: (f(z + h) − f(z − h)) / 2h with h = 1e−5."],
say: String.raw`Constants vanish, powers come down by one, a function of a function is differentiated outside then inside and the two are multiplied, and sums differentiate term by term.`,
num: String.raw`d/dz (3z − 2)² = 2(3z − 2)·3 = <b>6(3z − 2)</b>. At z = 1: <b>6</b>. Numerical check with h = 1e−5: ((3.00003 − 2)² − (2.99997 − 2)²) / 2e−5 = <b>6.0000</b>.`,
r(fig, ctl) {
  const FN = [["z² + 5", z => z * z + 5, z => 2 * z, "2z", "power rule, constant vanishes"], ["z³", z => z ** 3, z => 3 * z * z, "3z²", "power rule"], ["(3z − 2)²", z => (3 * z - 2) ** 2, z => 6 * (3 * z - 2), "2(3z − 2)·3", "chain rule: outer 2(·), inner 3"], ["½(z − 1.5)²", z => 0.5 * (z - 1.5) ** 2, z => z - 1.5, "(z − 1.5)·1", "the ½e² form: derivative is e"], ["exp(z)", z => Math.exp(z), z => Math.exp(z), "exp(z)", "its own derivative"], ["ln(z), z > 0", z => z > 0.05 ? Math.log(z) : NaN, z => z > 0.05 ? 1 / z : NaN, "1/z", "Part 4 uses this in the log loss"], ["σ(z) = 1/(1 + e^{−z})", z => 1 / (1 + Math.exp(-z)), z => { const s = 1 / (1 + Math.exp(-z)); return s * (1 - s); }, "σ(z)(1 − σ(z))", "chain rule on the sigmoid, Lesson 17"]];
  let k = 2;
  ctl.innerHTML = btns(FN.map((fn, i) => [i, fn[0]]), "k") + sl("z0", "z", -2, 2, 0.1, 1) + `<div id="rx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const [name, F, dF, dname, note] = FN[k], z0 = +$("z0").value; $("z0v").textContent = f(z0, 1);
    const xs = range(-2, 2, 120), vals = xs.map(F).filter(v => isFinite(v)), dv = xs.map(dF).filter(v => isFinite(v));
    const lo = Math.min(...vals, ...dv, -1), hi = Math.max(...vals, ...dv, 1);
    const a = ML.axes(60, 20, 380, 240, { xmin: -2, xmax: 2, ymin: Math.floor(lo), ymax: Math.ceil(hi), nx: 4, ny: 4, fx: v => v, fy: v => +v.toFixed(1), xl: "z" });
    let s = a.s + ML.path(xs.map(v => [a.X(v), a.Y(F(v))]).filter(p => isFinite(p[1])), C.blue, 2) + ML.path(xs.map(v => [a.X(v), a.Y(dF(v))]).filter(p => isFinite(p[1])), C.coral, 2);
    const h = 1e-5, num = (F(z0 + h) - F(z0 - h)) / (2 * h);
    xs.filter((v, i) => i % 6 === 0).forEach(v => { const n = (F(v + h) - F(v - h)) / (2 * h); if (isFinite(n)) s += `<circle cx="${a.X(v)}" cy="${a.Y(n)}" r="3" fill="${C.gray}"/>`; });
    if (isFinite(F(z0))) { s += `<circle cx="${a.X(z0)}" cy="${a.Y(F(z0))}" r="5" fill="${C.blue}"/>`; const sl0 = dF(z0); s += ML.path([[a.X(z0 - 0.6), a.Y(F(z0) - 0.6 * sl0)], [a.X(z0 + 0.6), a.Y(F(z0) + 0.6 * sl0)]], C.blue, 1.5, "4 3"); }
    s += tx(470, 40, "f(z) = " + name, null, "th") + tx(470, 62, "f′(z) = " + dname, null, "t") + tx(470, 84, note, null);
    s += tx(470, 120, "at z = " + f(z0, 1) + ":", null, "th") + tx(470, 142, "rule: " + (isFinite(dF(z0)) ? f(dF(z0), 4) : "undefined"), null, "t") + tx(470, 162, "numerical: " + (isFinite(num) ? f(num, 4) : "undefined"), null, "t");
    s += tx(470, 200, "blue: f, with its tangent", null) + tx(470, 216, "coral: f′ from the rule", null) + tx(470, 232, "gray dots: numerical slope", null);
    fig.innerHTML = svg(300, s);
    $("rx").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); $("z0").oninput = u; u();
}},

{s: "3. Descent in 1D", t: "Gradient descent: step against the derivative, scaled by α",
intu: String.raw`If a positive derivative points uphill, moving the other way can lower the function. The rule is z ← z − α f′(z) with learning rate α. On f(z) = z² + 5 from z₀ = 2 with α = 0.1: the derivative is 4, so z₁ = 2 − 0.4 = 1.6 and f drops from 9 to 7.56. At 1.6 the derivative is 3.2, so the next step is smaller although α has not changed. Step through the lecture's table, then change α. Small α crawls, α near 1 overshoots and oscillates, α above 1 diverges. Ng's picture of the learning rate is this card.`,
eq: String.raw`\[ z_{k+1} = z_k - \alpha f'(z_k), \qquad z_1 = 2 - 0.1(4) = 1.6, \quad f(z_1) = 7.56, \quad z_{20} = 0.0231 \]`,
sym: [[String.raw`\(\alpha\)`, "the learning rate, a positive scale on the step"], ["k", "the update counter"], [String.raw`\(f'(z_k)\)`, "the derivative at the current point, recomputed every step"], ["converge", "steps shrink as the derivative shrinks near the minimum"], ["diverge", "α too large: each step overshoots by more than it gained"]],
how: ["Start at z₀. Compute f′(z₀).", "Step: z₁ = z₀ − α f′(z₀).", "Recompute the derivative at z₁. It is smaller if you are approaching a minimum.", "Repeat. The step length is α times the derivative, so steps shrink automatically near the bottom even with fixed α.", "If f goes up after a step, α is too large. Lower it. Ng's rule of thumb: try 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1."],
say: String.raw`Gradient descent subtracts the learning rate times the derivative, steps shrink on their own as the slope flattens, and a learning rate that is too large makes the function rise instead of fall.`,
num: String.raw`α = 0.1 from z₀ = 2: z = <b>2, 1.6, 1.28, 1.024, 0.8192, 0.6554</b>, f = 9, 7.56, 6.6384, 6.0486, 5.6711, 5.4295. After 20 steps z = <b>0.0231</b>, f = 5.0005. With α = 1 the point jumps between 2 and −2 forever. With α = 1.1 it diverges.`,
note: String.raw`Exam form: given f, z₀ and α, compute two updates by hand and the function value after each. The table above is the model answer.`,
r(fig, ctl) {
  const F = z => z * z + 5, dF = z => 2 * z;
  ctl.innerHTML = sl("al", "α", 0.05, 1.15, 0.05, 0.1) + `<div id="gd"></div>`;
  let kstep = 0, al = 0.1;
  const traj = () => { const Z = [2]; for (let i = 0; i < 20; i++) Z.push(Z[i] - al * dF(Z[i])); return Z; };
  const draw = () => {
    const Z = traj();
    const lim = Math.min(6, Math.max(3, Math.abs(Z[Math.min(kstep, 20)]) * 1.2));
    const a = ML.axes(60, 20, 380, 230, { xmin: -lim, xmax: lim, ymin: 4, ymax: 5 + lim * lim, nx: 4, ny: 4, fx: v => +v.toFixed(1), fy: v => +v.toFixed(0), xl: "z", yl: "f(z)" });
    let s = a.s + ML.path(range(-lim, lim, 100).map(v => [a.X(v), a.Y(F(v))]), C.blue, 2);
    for (let i = 0; i < kstep; i++) s += arrow(a.X(Z[i]), a.Y(F(Z[i])), a.X(Z[i + 1]), a.Y(F(Z[i + 1])), C.coral, 1.6);
    for (let i = 0; i <= kstep; i++) s += `<circle cx="${a.X(Z[i])}" cy="${a.Y(F(Z[i]))}" r="${i === kstep ? 5 : 3}" fill="${C.coral}"/>`;
    const zk = Z[kstep];
    s += tx(470, 40, `step ${kstep}`, null, "th") + tx(470, 62, `z = ${f(zk, 4)}`, null, "t") + tx(470, 82, `f′(z) = ${f(dF(zk), 4)}`, null, "t") + tx(470, 102, `f(z) = ${f(F(zk), 4)}`, null, "t");
    if (kstep < 20) s += tx(470, 132, `next: z − α f′ =`, null) + tx(470, 152, `${f(zk, 4)} − ${f(al, 2)}·${f(dF(zk), 4)}`, null, "t") + tx(470, 172, `= ${f(Z[kstep + 1], 4)}`, null, "t");
    s += tx(470, 210, al < 0.5 ? "converging: steps shrink with the slope" : al < 1 ? "overshooting past 0 each step, still converging" : al === 1 ? "α = 1: bouncing between 2 and −2 forever" : "α above 1: diverging, f rises every step", null, "th");
    fig.innerHTML = svg(290, s) + ML.code(["z, alpha = 2.0, " + al, "for k in range(20):", "    z = z - alpha * (2 * z)   # f'(z) = 2z", "    print(k + 1, round(z, 4), round(z**2 + 5, 4))"], 2) + ML.term(Z.slice(1, 6).map((z, i) => `${i + 1} ${f(z, 4)} ${f(F(z), 4)}`).concat(["...", `20 ${f(Z[20], 4)} ${f(F(Z[20]), 4)}`]));
  };
  ML.stepper(ctl, 21, k => { kstep = k; draw(); }, Array(21).fill(null).map((_, i) => "update " + i));
  $("al").oninput = () => { al = +$("al").value; $("alv").textContent = f(al, 2); draw(); };
}},

{s: "4. Partial derivatives", t: "Two parameters: the gradient is a vector of partial derivatives",
intu: String.raw`The regression cost J(b, w) depends on two parameters. A partial derivative changes one while holding the other fixed: ∂J/∂b is the slope along the b direction, ∂J/∂w along the w direction. Together they form the gradient ∇J, a vector that points in the direction of steepest increase. The contour plot shows J on the lecture's data x = (1, 2, 3), y = (2, 3, 5), with the minimum at (1/3, 1.5). Drag the point and watch the gradient arrow point uphill, across the contours, and the negative gradient point the way gradient descent will step.`,
eq: String.raw`\[ \nabla J(b, w) = \begin{bmatrix} \partial J / \partial b \\ \partial J / \partial w \end{bmatrix}, \qquad \begin{bmatrix} b \\ w \end{bmatrix} \leftarrow \begin{bmatrix} b \\ w \end{bmatrix} - \alpha \nabla J(b, w) \]`,
sym: [[String.raw`\(\partial J / \partial b\)`, "slope of J when only b changes"], [String.raw`\(\partial J / \partial w\)`, "slope of J when only w changes"], [String.raw`\(\nabla J\)`, "the gradient, both partials stacked, points uphill"], ["contour", "a curve of equal cost, the gradient is perpendicular to it"], ["steepest descent", "the negative gradient, for a small step of fixed length"]],
how: ["Hold w fixed, differentiate with respect to b: that is ∂J/∂b.", "Hold b fixed, differentiate with respect to w: that is ∂J/∂w.", "Stack them. The vector points toward higher J and is perpendicular to the contour through the point.", "Subtract α times the vector from (b, w). Both parameters move at once.", "No need to draw the whole surface. The gradient at the current point is all the algorithm uses."],
say: String.raw`A partial derivative varies one parameter at a time, the gradient stacks them into a vector that points uphill perpendicular to the contours, and gradient descent subtracts a scaled copy of it from every parameter together.`,
num: String.raw`At (b, w) = (0, 0): ∂J/∂b = <b>−10/3</b>, ∂J/∂w = <b>−23/3</b>. Both negative, so increasing either parameter lowers the cost, and the step goes up and to the right. At the minimum (1/3, 1.5) both are <b>0</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("pb", "b", -2, 3, 0.1, 0) + sl("pw", "w", -1, 3.5, 0.1, 0) + `<div id="pg"></div>`;
  const u = () => {
    const b = +$("pb").value, w = +$("pw").value; $("pbv").textContent = f(b, 1); $("pwv").textContent = f(w, 1);
    const box = { xmin: -2, xmax: 3, ymin: -1, ymax: 3.5, nx: 5, ny: 9, fx: v => v, fy: v => +v.toFixed(1), xl: "b (intercept)", yl: "w (slope)", grid: false };
    const a = ML.axes(60, 20, 360, 270, box);
    let s = a.s + contours((bb, ww) => Jcost(bb, ww), a, box, [0.1, 0.3, 0.7, 1.5, 3, 6, 10, 16]);
    s += `<circle cx="${a.X(BSTAR)}" cy="${a.Y(WSTAR)}" r="4" fill="${C.teal}"/>` + tx(a.X(BSTAR) + 8, a.Y(WSTAR) + 4, "minimum (1/3, 1.5)", null);
    const [gb, gw] = grad(b, w), n = Math.hypot(gb, gw), L = 0.9;
    if (n > 1e-6) { s += arrow(a.X(b), a.Y(w), a.X(b + L * gb / n), a.Y(w + L * gw / n), C.coral, 2.5) + arrow(a.X(b), a.Y(w), a.X(b - L * gb / n), a.Y(w - L * gw / n), C.gray, 2.5); }
    s += `<circle cx="${a.X(b)}" cy="${a.Y(w)}" r="5" fill="${C.blue}"/>`;
    s += tx(450, 40, `J(${f(b, 1)}, ${f(w, 1)}) = ${f(Jcost(b, w), 4)}`, null, "th") + tx(450, 66, `∂J/∂b = ${f(gb, 4)}`, null, "t") + tx(450, 86, `∂J/∂w = ${f(gw, 4)}`, null, "t") + tx(450, 116, "coral: ∇J, uphill", null) + tx(450, 134, "gray: −∇J, the descent direction", null) + tx(450, 152, "both drawn with unit length", null);
    s += tx(450, 190, "with α = 0.1 the next point is", null) + tx(450, 210, `(${f(b - 0.1 * gb, 3)}, ${f(w - 0.1 * gw, 3)})`, null, "t") + tx(450, 240, "blue contours: equal cost", null) + tx(450, 258, "the arrows cross them at right angles (equal axis scales)", null);
    fig.innerHTML = svg(340, s);
    $("pg").innerHTML = "";
  };
  $("pb").oninput = u; $("pw").oninput = u; u();
}},

{s: "5. Derive the gradients", t: "From the cost to the two derivatives, line by line",
intu: String.raw`The lecture's derivation, one step per click. Start from one example's error e = b + wx − y. Increasing b by a small amount raises every prediction by that amount, so ∂e/∂b = 1. Increasing w raises prediction i by that amount times xᵢ, so ∂e/∂w = xᵢ. The cost is a sum of ½e² terms over m examples divided by m, so the chain rule and the sum rule do the rest. The factor 2 from the square cancels the ½, which is the only reason the ½ was there. The results have plain meanings: the bias gradient is the mean error, the slope gradient is the mean of error times input.`,
eq: String.raw`\[ J(b, w) = \frac{1}{2m} \sum_{i=1}^{m} \left(e^{(i)}\right)^2, \qquad g_b = \frac{\partial J}{\partial b} = \frac{1}{m} \sum_i e^{(i)}, \qquad g_w = \frac{\partial J}{\partial w} = \frac{1}{m} \sum_i e^{(i)} x^{(i)} \]`,
sym: [[String.raw`\(e^{(i)}\)`, "error of example i: prediction minus target, b + wx − y"], [String.raw`\(\partial e / \partial b = 1\)`, "every prediction moves one for one with b"], [String.raw`\(\partial e / \partial w = x^{(i)}\)`, String.raw`prediction i moves by \(x_i\) per unit of w`], [String.raw`\(g_b\)`, "mean error: negative when the model underpredicts on average"], [String.raw`\(g_w\)`, "mean of error times input: large inputs weigh more"]],
how: ["Write the error of one example and differentiate it with respect to b and to w.", "Apply the chain rule to ½e²: derivative e times the inner derivative.", "Sum over examples and divide by m. The 2 and the ½ cancel.", String.raw`Read \(g_b\): the mean error. If it is negative, raise b.`, String.raw`Read \(g_w\): errors weighted by inputs. Observations with large |x| pull the slope hardest.`],
say: String.raw`The bias gradient is the mean error and the slope gradient is the mean of error times input, both from the chain rule on half the squared error summed over the examples.`,
num: String.raw`At (b, w) = (0, 0) on the lecture's data: errors (−2, −3, −5), \(g_b\) = (−2 − 3 − 5)/3 = <b>−10/3</b>, \(g_w\) = (−2 − 6 − 15)/3 = <b>−23/3</b>.`,
note: String.raw`The practice finals ask for exactly this: derive ∂J/∂w for a small network or a linear model by hand. Write the error, the chain rule step, and the sum, in that order.`,
r(fig, ctl) {
  const lines = [
    [String.raw`e^{(i)} = b + w x^{(i)} - y^{(i)}`, "the error of one example, prediction minus target"],
    [String.raw`\frac{\partial e^{(i)}}{\partial b} = 1, \qquad \frac{\partial e^{(i)}}{\partial w} = x^{(i)}`, "b shifts every prediction equally, w scales with the input"],
    [String.raw`J(b, w) = \frac{1}{2m} \sum_{i=1}^{m} \left(e^{(i)}\right)^2`, "the cost: half the mean squared error"],
    [String.raw`\frac{\partial J}{\partial b} = \frac{1}{2m} \sum_i 2 e^{(i)} \frac{\partial e^{(i)}}{\partial b} = \frac{1}{m} \sum_i e^{(i)}`, "chain rule on each term, the 2 cancels the half, inner derivative 1"],
    [String.raw`\frac{\partial J}{\partial w} = \frac{1}{2m} \sum_i 2 e^{(i)} \frac{\partial e^{(i)}}{\partial w} = \frac{1}{m} \sum_i e^{(i)} x^{(i)}`, "same, with inner derivative x"],
    [String.raw`b \leftarrow b - \alpha g_b, \qquad w \leftarrow w - \alpha g_w`, "the update, both errors computed from the same old (b, w)"]
  ];
  ctl.innerHTML = "";
  const draw = k => {
    fig.innerHTML = `<div style="padding:4px 0">${lines.map((l, i) => `<div style="margin:6px 0;padding:8px 10px;border-radius:8px;border:1px solid ${i === k ? C.teal : "var(--line)"};background:${i === k ? "var(--teal-bg)" : "var(--panel)"};opacity:${i <= k ? 1 : 0.25}">\\[ ${l[0]} \\]<div class="sm" style="margin-top:2px">${i <= k ? l[1] : ""}</div></div>`).join("")}</div>` + ML.code(["error = b + w * x - y           # e, shape (m,)", "grad_b = error.mean()           # g_b", "grad_w = (error * x).mean()     # g_w", "b, w = b - alpha * grad_b, w - alpha * grad_w"], k >= 5 ? 3 : k >= 4 ? 2 : k >= 3 ? 1 : 0);
    typesetMath(fig);
  };
  ML.stepper(ctl, lines.length, draw, ["error", "its partials", "the cost", "bias gradient", "slope gradient", "update"]);
}},

{s: "6. Two updates by hand", t: "The lecture's numerical example: x = (1, 2, 3), y = (2, 3, 5)",
intu: String.raw`Start at b₀ = w₀ = 0 with α = 0.1. The zero line predicts 0 for every point, so the errors are −2, −3, −5 and the cost is J₀ = (4 + 9 + 25)/6 = 6.3333. The gradients are \(g_b = -10/3\) and \(g_w = -23/3\), so both parameters increase: b₁ = 0.3333, w₁ = 0.7667 and J₁ = 1.2826. The second update gives b₂ = 0.48, w₂ = 1.1089, J₂ = 0.2807. Step through the table and watch the line move toward the points and the cost fall. Keep stepping past the lecture's two updates to see where it settles.`,
eq: String.raw`\[ g_b = \frac{-2 - 3 - 5}{3} = -\tfrac{10}{3}, \quad g_w = \frac{-2 - 6 - 15}{3} = -\tfrac{23}{3}, \quad b_1 = 0 + 0.1 \cdot \tfrac{10}{3} = 0.3333, \quad w_1 = 0.7667 \]`,
sym: [["ŷ", "current predictions b + wx"], ["e", "ŷ − y, one per example"], ["e·x", "the slope gradient's ingredients"], [String.raw`\(J_k\)`, "the cost after update k: 6.3333, 1.2826, 0.2807, ..."], ["the table", "x, y, ŷ, e, e·x, recomputed from the new parameters every step"]],
how: ["Fill the table with the current (b, w): predictions, errors, error times x.", String.raw`Average the error column for \(g_b\), the e·x column for \(g_w\).`, "Update both parameters from those two numbers.", "Recompute the table with the new parameters. Nothing about the data changed, only the predictions.", "Reusing the first gradient forever would not be gradient descent on the current model."],
say: String.raw`Each iteration recomputes predictions, errors and both gradients from the current parameters, then moves both parameters, and the data never changes.`,
num: String.raw`<b>J₀ = 6.3333, J₁ = 1.2826, J₂ = 0.2807</b>. After update 1 the errors are (−0.9, −1.1333, −2.3667) and \(g_b = -1.4667\), \(g_w = -3.4222\). The minimum is at (1/3, 1.5) with J = 0.0278.`,
r(fig, ctl) {
  const al = 0.1, P = run(0, 0, al, 60);
  ctl.innerHTML = sl("it", "update", 0, 60, 1, 0) + `<div id="hx"></div>`;
  const u = () => {
    const k = +$("it").value; $("itv").textContent = k;
    const [b, w] = P[k], yh = DX.map(x => b + w * x), e = yh.map((v, i) => v - DY[i]), ex = e.map((v, i) => v * DX[i]), [gb, gw] = grad(b, w), J = Jcost(b, w);
    const rows = DX.map((x, i) => [x, DY[i], yh[i], e[i], ex[i]]);
    let s = tx(40, 28, `after update ${k}: b = ${f(b, 6)}, w = ${f(w, 6)}`, null, "th");
    s += ML.grid(rows, { x: 50, y: 60, cell: 54, fmt: v => Number.isInteger(v) ? v : f(v, 3), colLab: ["x", "y", "ŷ", "e", "e·x"], rowLab: false, hl: new Set(["0,3", "1,3", "2,3"]), hl2: new Set(["0,4", "1,4", "2,4"]) }).s;
    s += tx(50, 270, `g_b = mean(e) = ${f(gb, 6)}`, null, "t") + tx(50, 290, `g_w = mean(e·x) = ${f(gw, 6)}`, null, "t") + tx(50, 316, `J = ${f(J, 6)}`, null, "th");
    if (k < 60) s += tx(330, 270, `next: b = ${f(b, 4)} − 0.1·(${f(gb, 4)}) = ${f(P[k + 1][0], 6)}`, null, "t") + tx(330, 290, `next: w = ${f(w, 4)} − 0.1·(${f(gw, 4)}) = ${f(P[k + 1][1], 6)}`, null, "t");
    const a = ML.axes(420, 50, 230, 170, { xmin: 0, xmax: 4, ymin: 0, ymax: 6, nx: 4, ny: 3, fx: v => v, fy: v => v, xl: "x", yl: "y" });
    s += a.s + ML.path([[a.X(0), a.Y(b)], [a.X(4), a.Y(b + 4 * w)]], C.blue, 2);
    DX.forEach((x, i) => s += `<line x1="${a.X(x)}" y1="${a.Y(DY[i])}" x2="${a.X(x)}" y2="${a.Y(yh[i])}" stroke="${C.coral}" stroke-width="1.5"/><circle cx="${a.X(x)}" cy="${a.Y(DY[i])}" r="4.5" fill="${C.coral}"/>`);
    fig.innerHTML = svg(330, s) + ML.code(["x = np.array([1.0, 2.0, 3.0]); y = np.array([2.0, 3.0, 5.0])", "b, w, alpha = 0.0, 0.0, 0.1", `for k in range(${Math.max(k, 1)}):`, "    error = b + w * x - y", "    grad_b, grad_w = error.mean(), (error * x).mean()", "    b, w = b - alpha * grad_b, w - alpha * grad_w"], -1);
    $("hx").innerHTML = ML.readout([["J₀, J₁, J₂", "6.3333, 1.2826, 0.2807"], ["this step", k <= 2 ? "matches the lecture table" : k < 60 ? "beyond the lecture, same rule" : "near the minimum (0.3333, 1.5)"]]);
  };
  $("it").oninput = u; u();
}},

{s: "7. Simultaneous updates", t: "Both updates must use the same old model",
intu: String.raw`The two gradient components describe the cost surface at one parameter pair. If you update b first and then recompute the derivative for w at the new b, the two derivatives describe two different points, and that is a different algorithm. On the first update, the correct slope gradient is −23/3 and w₁ = 0.7667. Updating b first to 1/3 and recomputing gives errors (−5/3, −8/3, −14/3), a slope gradient of −7 and w₁ = 0.7. Both lower the cost, but only one is the lecture's gradient descent. The safe pattern in code: compute both gradients, then assign both.`,
eq: String.raw`\[ \text{simultaneous: } w_1 = 0 - 0.1\left(-\tfrac{23}{3}\right) = 0.7667, \qquad \text{sequential: } w_1 = 0 - 0.1(-7) = 0.7 \]`,
sym: [["simultaneous", "all gradients from the old parameters, then all updates"], ["sequential", "update one, recompute, update the next: not the algorithm"], ["b, w = ..., ...", "Python evaluates the whole right side before assigning"], ["backward then step", "PyTorch keeps the two stages separate for the same reason"]],
how: [String.raw`Compute predictions and both gradients at \((b_k, w_k)\).`, String.raw`Only then assign \(b_{k+1}\) and \(w_{k+1}\).`, "In Python, one tuple assignment does this, or store <code>new_b</code> and <code>new_w</code> first.", "Two separate assignment lines are fine if both gradients were already computed.", "The issue is when the derivatives are evaluated, not how many lines the assignment takes."],
say: String.raw`A gradient descent step evaluates every partial derivative at the same old parameter values before changing any of them, and the tuple assignment or a stored pair is how code guarantees it.`,
num: String.raw`Simultaneous: (b₁, w₁) = <b>(0.3333, 0.7667)</b>. Sequential, b first: (b₁, w₁) = <b>(0.3333, 0.7)</b>. Same b, different w, different trajectory from then on.`,
note: String.raw`The lecture's own warning. In PyTorch, <code>loss.backward()</code> computes every gradient at the current parameters and <code>optimizer.step()</code> updates them all afterwards, which is the simultaneous pattern built into the API.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns([[0, "simultaneous (correct)"], [1, "sequential (b first)"]], "k") + `<div id="sq"></div>`;
  const seq = (b0, w0, al, n) => { const P = [[b0, w0]]; let b = b0, w = w0; for (let i = 0; i < n; i++) { b -= al * grad(b, w)[0]; w -= al * grad(b, w)[1]; P.push([b, w]); } return P; };
  const u = () => {
    pick(ctl, "k", k);
    const Ps = run(0, 0, 0.1, 4), Pq = seq(0, 0, 0.1, 4);
    const box = { xmin: -0.2, xmax: 1, ymin: -0.2, ymax: 1.8, nx: 6, ny: 5, fx: v => +v.toFixed(1), fy: v => +v.toFixed(1), xl: "b", yl: "w", grid: false };
    const a = ML.axes(60, 20, 360, 250, box);
    let s = a.s + contours((bb, ww) => Jcost(bb, ww), a, box, [0.05, 0.15, 0.4, 0.8, 1.5, 3, 5]);
    s += `<circle cx="${a.X(BSTAR)}" cy="${a.Y(WSTAR)}" r="4" fill="${C.teal}"/>`;
    const drawPath = (P, col, on) => { for (let i = 0; i < P.length - 1; i++) s += arrow(a.X(P[i][0]), a.Y(P[i][1]), a.X(P[i + 1][0]), a.Y(P[i + 1][1]), col, on ? 2.2 : 1.2); P.forEach(p => s += `<circle cx="${a.X(p[0])}" cy="${a.Y(p[1])}" r="${on ? 3.5 : 2.5}" fill="${col}" opacity="${on ? 1 : 0.5}"/>`); };
    drawPath(k === 0 ? Pq : Ps, C.gray, false); drawPath(k === 0 ? Ps : Pq, C.coral, true);
    const P = k === 0 ? Ps : Pq;
    s += tx(450, 40, k === 0 ? "simultaneous" : "sequential, b first", null, "th") + tx(450, 64, `(b₁, w₁) = (${f(P[1][0], 4)}, ${f(P[1][1], 4)})`, null, "t") + tx(450, 84, `(b₂, w₂) = (${f(P[2][0], 4)}, ${f(P[2][1], 4)})`, null, "t") + tx(450, 114, "coral: this rule, 4 steps", null) + tx(450, 132, "gray: the other rule", null) + tx(450, 160, k === 0 ? "slope gradient at (0, 0): −23/3" : "slope gradient at (1/3, 0): −7", null) + tx(450, 178, k === 0 ? "w₁ = 0.7667, the lecture's value" : "w₁ = 0.7, a different algorithm", null, "th");
    fig.innerHTML = svg(320, s) + ML.code(k === 0 ? ["error = b + w * x - y", "grad_b = error.mean()", "grad_w = (error * x).mean()", "b, w = b - alpha * grad_b, w - alpha * grad_w   # both from old (b, w)"] : ["b = b - alpha * (b + w * x - y).mean()          # b changes here", "error = b + w * x - y                            # recomputed with new b", "w = w - alpha * (error * x).mean()               # a different gradient"], k === 0 ? 3 : 1);
    $("sq").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "8. Matrix form", t: "The gradient as one product: Aᵀ(Aθ − y)/m",
intu: String.raw`Put a row [1, x⁽ⁱ⁾] per example in a matrix A of shape (m, 2) and the parameters in θ = (b, w). Predictions are Aθ, the residual is Aθ − y, and the whole gradient is Aᵀ(Aθ − y)/m, shape (2, 1). The first column of A is ones, so the first entry of the product is the mean error, which is \(g_b\). The second column is x, so the second entry is the mean of error times x, which is \(g_w\). Step through the shapes. Lecture 3 writes the same thing for p features: ∇_w J = Xᵀ(Xw + b1 − y)/m. The transpose is what folds all the examples back into one number per parameter.`,
eq: String.raw`\[ \nabla J = \frac{1}{m} A^T (A\theta - y), \qquad A = \begin{bmatrix} 1 & x^{(1)} \\ \vdots & \vdots \\ 1 & x^{(m)} \end{bmatrix}, \quad (2 \times m)(m \times 1) = (2 \times 1) \]`,
sym: [["A", "the design matrix, ones then x, shape (m, 2)"], [String.raw`\(\theta\)`, "(b, w) as a column, shape (2, 1)"], [String.raw`\(A\theta - y\)`, "the residual vector, shape (m, 1)"], [String.raw`\(A^T r / m\)`, "shape (2, 1): row 1 is the mean residual, row 2 the mean of x times residual"], [String.raw`\(X^T(Xw + b\mathbf{1} - y)/m\)`, "Lecture 3's form for p features, shape (p, 1)"]],
how: ["Build A with a ones column. Shapes: A (m, 2), θ (2, 1), y (m, 1).", "Residual r = Aθ − y, shape (m, 1). Assert it.", "Gradient = Aᵀ r / m. Shapes (2, m)(m, 1) = (2, 1).", "Read the two rows: ones column gives Σe/m, x column gives Σe·x/m.", "For p features the same line gives p + 1 numbers in one product. That is the whole of Lesson 15's training loop."],
say: String.raw`The gradient of the squared error cost is the transpose of the design matrix times the residual over m, one product that returns one derivative per parameter.`,
num: String.raw`At θ = (0, 0): r = (−2, −3, −5), Aᵀr = (−10, −23), Aᵀr/m = <b>(−10/3, −23/3)</b>, the same two numbers as card 5.`,
r(fig, ctl) {
  const A = DX.map(x => [1, x]), th = [0, 0], y = DY;
  const pred = A.map(r => r[0] * th[0] + r[1] * th[1]), res = pred.map((p, i) => p - y[i]);
  const At = [[1, 1, 1], DX.slice()], g = At.map(row => row.reduce((s, v, i) => s + v * res[i], 0)), gm = g.map(v => v / M);
  ctl.innerHTML = "";
  const draw = k => {
    let s = "";
    if (k === 0) {
      s += ML.grid(A, { x: 40, y: 50, cell: 48, title: "A (3, 2)", rowLab: false, colLab: ["1", "x"] }).s + ML.grid(th.map(v => [v]), { x: 170, y: 50, cell: 48, title: "θ (2, 1)", rowLab: false, colLab: false }).s + tx(250, 110, "−", "middle", "th") + ML.grid(y.map(v => [v]), { x: 270, y: 50, cell: 48, title: "y (3, 1)", rowLab: false, colLab: false }).s + tx(350, 110, "=", "middle", "th") + ML.grid(res.map(v => [v]), { x: 370, y: 50, cell: 48, hl: new Set(["0,0", "1,0", "2,0"]), title: "r = Aθ − y (3, 1)", rowLab: false, colLab: false }).s;
      s += tx(40, 240, "predictions Aθ are all 0 at θ = (0, 0), so r = −y. Shapes: (3, 2)(2, 1) − (3, 1) = (3, 1).", null);
    } else if (k === 1) {
      s += ML.grid(At, { x: 40, y: 50, cell: 48, hl: new Set(["0,0", "0,1", "0,2"]), hl2: new Set(["1,0", "1,1", "1,2"]), title: "Aᵀ (2, 3)", rowLab: ["ones", "x"], colLab: false }).s + ML.grid(res.map(v => [v]), { x: 220, y: 50, cell: 48, title: "r (3, 1)", rowLab: false, colLab: false }).s + tx(300, 100, "=", "middle", "th") + ML.grid(g.map(v => [v]), { x: 320, y: 50, cell: 48, hl: new Set(["0,0"]), hl2: new Set(["1,0"]), title: "Aᵀr (2, 1)", rowLab: false, colLab: false }).s;
      s += tx(430, 70, "row 1: 1·(−2) + 1·(−3) + 1·(−5) = −10", null, "t") + tx(430, 90, "row 2: 1·(−2) + 2·(−3) + 3·(−5) = −23", null, "t") + tx(430, 120, "the ones row sums the errors", null) + tx(430, 138, "the x row weights them by x", null) + tx(40, 240, "Shapes: (2, 3)(3, 1) = (2, 1). The transpose turns one row per example into one column per parameter.", null);
    } else {
      s += ML.grid(g.map(v => [v]), { x: 60, y: 50, cell: 48, title: "Aᵀr", rowLab: false, colLab: false }).s + tx(140, 100, "÷ 3 =", "middle", "th") + ML.grid(gm.map(v => [v]), { x: 180, y: 50, cell: 56, hl: new Set(["0,0", "1,0"]), title: "∇J (2, 1)", rowLab: false, colLab: false, fmt: v => f(v, 4) }).s;
      s += ML.box(300, 50, 360, 70, "c-teal", ["g_b = −10/3,  g_w = −23/3", "exactly card 5's numbers, in one product"]) + tx(300, 150, "Lecture 3, p features: ∇J = Xᵀ(Xw + b·1 − y) / m, shape (p, 1)", null) + tx(300, 168, "and ∂J/∂b = mean(Xw + b − y), the ones column done separately", null);
    }
    fig.innerHTML = svg(260, s) + ML.code(["A = np.column_stack((np.ones(3), np.array([1.0, 2.0, 3.0])))", "theta = np.zeros((2, 1)); y = np.array([[2.0], [3.0], [5.0]])", "r = A @ theta - y                 # (3, 1)", "assert r.shape == y.shape", "grad = A.T @ r / len(y)           # (2, 1): [[-3.3333], [-7.6667]]"], [2, 4, 4][k]);
  };
  ML.stepper(ctl, 3, draw, ["residual", "transpose times residual", "divide by m"]);
}},

{s: "9. Feature scaling", t: "Why scaling features makes the bowl round and the steps fast",
intu: String.raw`Lecture 3's point and Ng's week 2 lecture: when one feature ranges over thousands and another over ones, the cost surface is a long narrow valley. Gradient descent bounces across the narrow direction while crawling along the long one, and a learning rate small enough to be stable is then far too small to make progress. Standardizing the feature makes the contours nearly circular, and the same α reaches the bottom in a few steps. Same data, same algorithm, different coordinates. Toggle raw and scaled, then push α.`,
eq: String.raw`\[ z = \frac{x - \mu}{\sigma}, \qquad \text{raw } x \in [800, 3000] \Rightarrow \text{elongated contours}, \qquad z \in [-1.5, 1.5] \Rightarrow \text{round contours} \]`,
sym: [["elongated valley", "the cost changes fast along the large-scale feature's weight, slowly along the small one"], ["bouncing", "steps overshoot across the narrow direction while barely moving along the long one"], ["standardize", "subtract the training mean, divide by the training standard deviation"], ["round bowl", "every direction has a similar slope, so one α suits them all"], ["same minimum", "the fitted line is the same, only the coordinates of the parameters change"]],
how: ["Look at the feature ranges in the audit. Different orders of magnitude mean an elongated bowl.", "Standardize with training statistics only, as in Lesson 9 card 7.", "Choose α on the scaled problem. Values near 0.1 usually work.", "Watch the cost curve: monotone decrease means α is fine, a rise means it is too large.", "Undo the scaling in the report: a weight on z is a weight per standard deviation of x."],
say: String.raw`Features on very different scales stretch the cost surface into a valley that gradient descent crosses slowly, and standardizing them makes the surface round so the same learning rate works in every direction.`,
num: String.raw`Toy data with x in thousands: with α = 0.1 raw descent diverges immediately, and α must drop to about 1e−7 to be stable, taking thousands of steps. Scaled, α = 0.1 is within 1 % of the minimum cost in about <b>60</b> steps.`,
note: String.raw`HW3 Part 2 standardizes the housing features for exactly this reason, and HW6 does it with training statistics in PyTorch. The midterm asks why. The answer is this card.`,
r(fig, ctl) {
  const XR = [1000, 2000, 3000], mu = 2000, sd = Math.sqrt(2e6 / 3), XS = XR.map(x => (x - mu) / sd), Y = [2, 3, 5];
  let mode = 1;
  ctl.innerHTML = btns([[0, "raw x in thousands"], [1, "standardized z"]], "k") + sl("fa", "α", 0.02, 1.2, 0.02, 0.1) + sl("fn", "steps", 1, 80, 1, 20) + `<div id="fs"></div>`;
  const u = () => {
    pick(ctl, "k", mode);
    const al = +$("fa").value, n = +$("fn").value; $("fav").textContent = f(al, 2); $("fnv").textContent = n;
    const X = mode ? XS : XR;
    const P = run(0, 0, mode ? al : al * 1e-6, 80, X, Y);
    const box = mode ? { xmin: -1, xmax: 7, ymin: -1, ymax: 3, nx: 4, ny: 4, fx: v => v, fy: v => v, xl: "b", yl: "w (per standard deviation)", grid: false } : { xmin: -1, xmax: 7, ymin: -0.002, ymax: 0.004, nx: 4, ny: 3, fx: v => v, fy: v => v.toFixed(3), xl: "b", yl: "w (per unit of x)", grid: false };
    const a = ML.axes(60, 20, 360, 250, box);
    let s = a.s + contours((bb, ww) => Jcost(bb, ww, X, Y), a, box, mode ? [0.05, 0.2, 0.5, 1, 2, 4, 8] : [0.05, 0.5, 2, 5, 10, 20, 40]);
    const last = P[Math.min(P.length - 1, n)];
    for (let i = 0; i < Math.min(P.length - 1, n); i++) if (Math.abs(P[i + 1][0]) < 50 && Math.abs(P[i + 1][1]) < 50) s += arrow(a.X(P[i][0]), a.Y(P[i][1]), a.X(P[i + 1][0]), a.Y(P[i + 1][1]), C.coral, 1.6);
    const Jl = Jcost(last[0], last[1], X, Y);
    s += tx(450, 40, mode ? "standardized" : "raw, α shown × 1e−6", null, "th") + tx(450, 64, `after ${n} steps:`, null) + tx(450, 84, `J = ${isFinite(Jl) && Math.abs(Jl) < 1e6 ? f(Jl, 4) : "diverged"}`, null, "t");
    s += tx(450, 120, mode ? "round contours: the gradient" : "a valley: long in b,", null) + tx(450, 138, mode ? "points at the minimum," : "razor thin in w,", null) + tx(450, 156, mode ? "one α works for b and w" : "α must be tiny for w, so b crawls", null);
    s += tx(450, 190, "stable α for the raw problem is", null) + tx(450, 208, "around 1e−7, scaled around 0.1,", null) + tx(450, 226, "a million to one", null);
    fig.innerHTML = svg(320, s) + ML.code(mode ? ["mu, sd = x_train.mean(), x_train.std()", "z = (x - mu) / sd", "# then gradient descent on z with alpha = 0.1"] : ["# raw x around 2000: w's gradient is scaled by x", "# grad_w = (error * x).mean() is 1000x larger than grad_b", "# so alpha must shrink by 1e6 to keep w stable"], -1);
    $("fs").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { mode = +b.dataset.k; u(); }); $("fa").oninput = u; $("fn").oninput = u; u();
}},

{s: "10. Check a gradient", t: "Finite differences: verify any derivative before trusting it",
intu: String.raw`A gradient you derived by hand can be wrong by a factor, a sign, or a missing division by m, and the training loop will still run. The check is to compare the formula with a numerical slope: nudge one parameter by h, recompute the cost, and divide. The central difference (J(θ + h) − J(θ − h))/2h is accurate to order h², so h = 1e−5 gives about ten correct digits. Drag h and watch the error. The HW3 guide asks what finite-difference experiment would detect a missing division by m: the numerical slope would be m times smaller than the formula. PyTorch's autograd does the same job exactly, and the last line shows it.`,
eq: String.raw`\[ \frac{\partial J}{\partial w} \approx \frac{J(b, w + h) - J(b, w - h)}{2h}, \qquad \text{error} = O(h^2), \qquad \text{relative error} = \frac{|g_{\text{num}} - g_{\text{formula}}|}{|g_{\text{num}}| + |g_{\text{formula}}|} \]`,
sym: [["central difference", "symmetric nudge, error proportional to h²"], ["forward difference", "(J(w + h) − J(w))/h, error proportional to h, less accurate"], ["h", "about 1e−5 for double precision: smaller and rounding takes over"], ["relative error", "below 1e−7 means the formula is right, above 1e−3 means a bug"], ["autograd", "exact derivatives by the chain rule applied automatically, Lesson 21"]],
how: ["Write the cost as a function of the parameter vector.", "For each parameter, compute the central difference with h = 1e−5.", "Compare with your formula's value. Report the relative error.", "Try a deliberately broken formula (drop the /m) and watch the error jump to about 0.5.", "Keep this as a test in the project. Autograd replaces the formula, not the habit of checking."],
say: String.raw`A numerical derivative from a central difference checks a hand-derived gradient to many digits, and a missing factor or sign shows up as a relative error that cannot be rounding.`,
num: String.raw`At (0, 0) the formula gives \(g_w = -7.6667\). Central difference with h = 1e−5 gives <b>−7.6667</b> with relative error about <b>1e−11</b>. Dropping the /m gives −23, relative error <b>0.5</b>.`,
note: String.raw`The HW3 learning guide asks for exactly this experiment. In the project, one gradient check cell is a strong sign of commented, trustworthy code, which is 80 % of the project grade.`,
r(fig, ctl) {
  let bug = 0;
  ctl.innerHTML = btns([[0, "correct formula"], [1, "missing / m"], [2, "sign flipped"]], "k") + sl("lh", "log10 h", -10, -1, 0.5, -5) + `<div id="fd"></div>`;
  const u = () => {
    pick(ctl, "k", bug);
    const lh = +$("lh").value, h = 10 ** lh; $("lhv").textContent = lh;
    const b = 0.2, w = 0.5, [gb, gw] = grad(b, w);
    const gf = bug === 0 ? gw : bug === 1 ? gw * M : -gw;
    const cd = (Jcost(b, w + h) - Jcost(b, w - h)) / (2 * h), fd = (Jcost(b, w + h) - Jcost(b, w)) / h;
    const rel = Math.abs(cd - gf) / (Math.abs(cd) + Math.abs(gf));
    /* error curve over h */
    const hs = range(-10, -1, 37), errs = hs.map(l => { const hh = 10 ** l; return Math.abs((Jcost(b, w + hh) - Jcost(b, w - hh)) / (2 * hh) - gw); }), errsF = hs.map(l => { const hh = 10 ** l; return Math.abs((Jcost(b, w + hh) - Jcost(b, w)) / hh - gw); });
    const a = ML.axes(70, 20, 360, 230, { xmin: -10, xmax: -1, ymin: -12, ymax: 1, nx: 3, ny: 13, fx: v => "1e" + v, fy: v => (v % 3 === 0 ? "1e" + v : ""), xl: "h", yl: "|numerical − true|", grid: false });
    let s = a.s + ML.path(hs.map((l, i) => [a.X(l), a.Y(Math.max(-12, Math.log10(errs[i] + 1e-300)))]), C.teal, 2) + ML.path(hs.map((l, i) => [a.X(l), a.Y(Math.max(-12, Math.log10(errsF[i] + 1e-300)))]), C.gray, 2, "4 3");
    s += `<line x1="${a.X(lh)}" y1="20" x2="${a.X(lh)}" y2="250" stroke="${C.coral}" stroke-dasharray="4 3"/>`;
    s += tx(460, 40, "at (b, w) = (0.2, 0.5):", null, "th") + tx(460, 62, `formula g_w = ${f(gf, 6)}`, null, "t") + tx(460, 82, `central diff = ${f(cd, 6)}`, null, "t") + tx(460, 102, `forward diff = ${f(fd, 6)}`, null, "t") + tx(460, 130, `relative error = ${rel.toExponential(2)}`, null, "th") + tx(460, 152, rel < 1e-6 ? "formula verified" : rel < 1e-3 ? "suspicious: check h" : "bug: not rounding", null, "th");
    s += tx(460, 190, "teal: central difference error", null) + tx(460, 208, "gray: forward difference error", null) + tx(460, 226, "rounding wins below about 1e−8", null) + tx(460, 244, "truncation wins above about 1e−3", null);
    fig.innerHTML = svg(290, s) + ML.code(["def J(theta):", "    b, w = theta", "    return np.mean((b + w * x - y) ** 2) / 2", "h = 1e-5; e = np.array([0.0, h])", "num = (J(theta + e) - J(theta - e)) / (2 * h)", "assert abs(num - grad_w) / (abs(num) + abs(grad_w)) < 1e-7", "# PyTorch: theta.requires_grad_(); J(theta).backward(); theta.grad"], 4);
    $("fd").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { bug = +b.dataset.k; u(); }); $("lh").oninput = u; u();
}},

{s: "11. With the agent", t: "Do it with the agent: gradient descent with a gradient check",
intu: String.raw`The lesson as a module: the cost, the analytic gradient in matrix form, a central-difference gradient check, and a simultaneous-update descent loop that records the cost history and asserts it never rises. The tests pin the lecture's numbers, so a sequential update or a missing division by m fails on values you can verify on these cards.`,
eq: String.raw`\[ \texttt{cost}(\theta) \to \texttt{gradient}(\theta) = A^T(A\theta - y)/m \to \texttt{check}(\theta) \to \texttt{descend}(\theta_0, \alpha, n) \]`,
sym: [["cost", "half the mean squared error on the design matrix"], ["gradient", "the matrix form, one product"], ["check", "central difference per parameter, relative error returned"], ["descend", "simultaneous updates, cost history, monotone assertion"], ["tests", "J₀ = 6.3333, (b₁, w₁) = (0.3333, 0.7667), J₂ = 0.2807, relative error below 1e−7"]],
how: ["Paste the command.", "Read gradient(): is it A.T @ r / m with the shapes asserted?", "Read descend(): are both parameters updated from the same gradient vector?", "Run the tests. The values are the lecture's.", "Commit the module with its tests."],
say: String.raw`A training module computes the cost, the matrix-form gradient, a numerical check of that gradient, and a simultaneous-update loop whose cost history is asserted to decrease.`,
num: String.raw`Tests expect <b>J₀ = 6.3333</b>, <b>(b₁, w₁) = (0.3333, 0.7667)</b>, <b>J₂ ≈ 0.2807</b>, gradient check relative error <b>below 1e−7</b>, and a cost history that never rises at α = 0.1.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/gd.py using numpy only. Functions: cost(A, theta, y) returning np.mean((A @ theta - y) ** 2) / 2 with an assertion that (A @ theta).shape == y.shape. gradient(A, theta, y) returning A.T @ (A @ theta - y) / len(y). grad_check(A, theta, y, h=1e-5) that, for each parameter j, computes the central difference of cost along e_j and returns the maximum relative error |num - ana| / (|num| + |ana|). descend(A, y, theta0, alpha, n_steps) that performs simultaneous updates theta = theta - alpha * gradient(...), records the cost after every step in a list, asserts np.all(np.diff(history) <= 1e-12), and returns theta and history. Create tests/test_gd.py with pytest tests using x = [1, 2, 3], y = [2, 3, 5], A = column_stack of ones and x, y as a (3, 1) column, theta0 = zeros((2, 1)): cost at theta0 is close to 6.333333; gradient at theta0 is close to [[-10/3], [-23/3]]; after one step with alpha 0.1 theta is close to [[0.333333], [0.766667]]; after two steps the cost is close to 0.280733; grad_check at theta = [[0.2], [0.5]] is below 1e-7; and a deliberately wrong gradient (without the division by m) makes grad_check return a value above 0.1. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed in 0.19s"],
    checks: ["cost asserts the prediction and target shapes match before squaring", "gradient is A.T @ r / m, not r.T @ A, and returns shape (2, 1)", "descend updates both parameters from one gradient vector per step", "the cost history assertion would fail if alpha were set to 1.0", "the grad_check values match: below 1e-7 correct, about 0.5 without /m"]
  });
}},

{s: "12. Test", t: "Lesson 13 test: calculus and gradients",
intu: String.raw`Twelve questions. The derivative as a local slope, the three rules, the 1D update, partials and the gradient, the regression gradients and the lecture's numbers, simultaneous updates, the matrix form, feature scaling and the gradient check.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to probability.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "f(z) = z² + 5. At z = 2, the value and the derivative are", o: ["9 and 4", "4 and 9", "9 and 2", "5 and 4"], a: 0, why: "f(2) = 9, f′(2) = 2·2 = 4. Two different questions. Card 1." },
    { q: "Using the tangent at z = 2, the predicted change of f for Δz = 0.01 is", o: ["0.0401", "0.04", "0.4", "0.004"], a: 1, why: "f′(z)·Δz = 4 × 0.01 = 0.04. The exact change is 0.0401. Card 1." },
    { q: "d/du of ½(u − y)² is", o: ["u − y", "½(u − y)", "(u − y)²", "1"], a: 0, why: "Chain rule: the outer derivative (u − y) times the inner derivative 1. Card 2." },
    { q: "Gradient descent on f(z) = z² + 5 from z₀ = 2 with α = 0.1 gives z₁ =", o: ["1.6", "2.4", "1.8", "0.4"], a: 0, why: "z₁ = 2 − 0.1 × 4 = 1.6, and f falls from 9 to 7.56. Card 3." },
    { q: "With a fixed learning rate, why do the steps get smaller near the minimum?", o: ["α is reduced automatically", "the derivative shrinks, and the step is α times the derivative", "the function value shrinks", "they do not get smaller"], a: 1, why: "The step length is α f′(z), and f′ goes to zero at the minimum. Card 3." },
    { q: "The gradient ∇J(b, w) at a point", o: ["points along the contour", "points in the direction of steepest increase, perpendicular to the contour", "points toward the minimum", "is always negative"], a: 1, why: "Uphill, perpendicular to the level curves. Descent steps the other way. Card 4." },
    { q: "For J = (1/2m) Σ (b + wxᵢ − yᵢ)², the partial derivative with respect to b is", o: ["the mean error", "the mean of error times x", "the sum of squared errors", "zero"], a: 0, why: "Chain rule with inner derivative 1, the 2 cancels the ½, leaving Σe/m. Card 5." },
    { q: "On x = (1, 2, 3), y = (2, 3, 5) at (b, w) = (0, 0), the gradients are", o: ["(−10/3, −23/3)", "(−10, −23)", "(10/3, 23/3)", "(−2, −6)"], a: 0, why: "Errors (−2, −3, −5): mean is −10/3, mean of e·x is (−2 − 6 − 15)/3 = −23/3. Cards 5 and 6." },
    { q: "After the first update with α = 0.1, (b₁, w₁) is", o: ["(0.3333, 0.7667)", "(0.3333, 0.7)", "(1, 2.3)", "(−0.3333, −0.7667)"], a: 0, why: "Subtract 0.1 times the negative gradients: b₁ = 1/3, w₁ = 23/30 = 0.7667. The sequential version gives 0.7. Cards 6 and 7." },
    { q: "In matrix form with A = [1, x] per row, the gradient is", o: ["Aᵀ(Aθ − y)/m", "A(Aθ − y)/m", "(Aθ − y)ᵀ/m", "AᵀA/m"], a: 0, why: "The transpose folds m residuals into one value per parameter. Shape (2, 1). Card 8." },
    { q: "Features with ranges of thousands and of ones make gradient descent slow because", o: ["NumPy is slower on large numbers", "the cost surface is an elongated valley and one α cannot suit both directions", "the minimum moves", "the gradient becomes zero"], a: 1, why: "Standardizing makes the bowl round so one learning rate works for every parameter. Card 9." },
    { q: "A central-difference check gives −7.6667 and your formula gives −23. The most likely bug is", o: ["h is too small", "a missing division by m = 3", "a sign error", "the formula is right and the check is wrong"], a: 1, why: "The formula is exactly 3 times too large. Rounding could never explain a relative error of 0.5. Card 10." }
  ], "Lesson 13 test");
}}
],
summary: String.raw`A derivative is the slope of the tangent and predicts small changes to first order. Constants vanish, powers come down, a function of a function is differentiated outside then inside, sums go term by term. Gradient descent subtracts α times the derivative, and steps shrink as the slope flattens, while too large an α overshoots or diverges. With several parameters the gradient stacks the partial derivatives and points uphill across the contours. For half the mean squared error, the bias gradient is the mean error and the slope gradient is the mean of error times input, both evaluated at the same old parameters before either is updated. The matrix form Aᵀ(Aθ − y)/m gives every parameter's derivative in one product. Standardizing features turns a narrow valley into a round bowl so one learning rate works. A central difference verifies any gradient to many digits, and autograd will compute it exactly in Part 5.`,
sheet: [[String.raw`\[ f(z + \Delta z) \approx f(z) + f'(z)\,\Delta z \]`, "the derivative predicts small changes"], [String.raw`\[ \frac{d}{dz} z^n = n z^{n-1}, \quad \frac{d}{du} \tfrac{1}{2} e^2 = e \frac{de}{du} \]`, "power rule and the chain rule form used everywhere"], [String.raw`\[ z_{k+1} = z_k - \alpha f'(z_k) \]`, "gradient descent in one dimension"], [String.raw`\[ g_b = \frac{1}{m}\sum_i e^{(i)}, \qquad g_w = \frac{1}{m}\sum_i e^{(i)} x^{(i)}, \qquad e^{(i)} = b + w x^{(i)} - y^{(i)} \]`, "the regression gradients"], [String.raw`\[ \nabla J = \frac{1}{m} A^T (A\theta - y) \]`, "matrix form, one product"], [String.raw`\[ \frac{\partial J}{\partial w} \approx \frac{J(w + h) - J(w - h)}{2h}, \quad h = 10^{-5} \]`, "central-difference gradient check"], [String.raw`\[ z = \frac{x - \mu_{\text{train}}}{\sigma_{\text{train}}} \]`, "feature scaling, so one α fits every direction"]],
sources: ["AME 5970 Lecture 2 notes, sections 07 to 11 (the calculus you need, gradient descent, from the cost to the update, the complete numerical example, simultaneous updates)", "AME 5970 Lecture 3 notes, sections 10 and 12 (gradient descent for multiple variables, feature scaling)", "AME 5970 HW3 learning guide (the finite-difference experiment for a missing division by m)", "Andrew Ng, Machine Learning course, week 1: Gradient descent, gradient descent intuition, gradient descent for linear regression; week 2: Feature scaling, learning rate", "Andrew Ng, CS229 lecture notes, part I section 1 (LMS algorithm)", "Goodfellow, Bengio and Courville, Deep Learning, section 4.3 (gradient-based optimization) and 4.5 (numerical gradient checking in practice)"]
});
})();
