/* helpers for the Adam lesson: a stretched quadratic bowl f = (x - 1)^2 + S^2 (y - 0.5)^2 to MINIMIZE */
const C3A = {
  grad: (p, S) => [2 * (p[0] - 1), 2 * S * S * (p[1] - 0.5)],
  f: (p, S) => (p[0] - 1) ** 2 + S * S * (p[1] - 0.5) ** 2,
  gd: (S, lr, n) => { let p = [-1.5, -0.7]; const path = [p]; for (let i = 0; i < n; i++) { const g = C3A.grad(p, S); p = [p[0] - lr * g[0], p[1] - lr * g[1]]; if (!isFinite(p[0]) || Math.abs(p[1]) > 50) break; path.push(p); } return path; },
  adam: (S, lr, n) => { let p = [-1.5, -0.7]; const path = [p], A = new C3.Adam(2, lr); for (let i = 0; i < n; i++) { const g = C3A.grad(p, S), s = A.step([-g[0], -g[1]]); p = [p[0] + s[0], p[1] + s[1]]; path.push(p); } return path; },
  view: (paths, S, cols) => {
    const X = C3.X(40, 600, -2, 2), Y = C3.Y(10, 230, -1.3, 1.3);
    let s = `<rect x="40" y="10" width="600" height="230" fill="none" stroke="var(--b)"/><clipPath id="cpA"><rect x="40" y="10" width="600" height="230"/></clipPath><g clip-path="url(#cpA)">`;
    for (const lv of [0.05, 0.25, 0.75, 1.75, 3.5, 6]) { const rx = Math.sqrt(lv), ry = Math.sqrt(lv) / S; s += `<ellipse cx="${X(1)}" cy="${Y(0.5)}" rx="${(X(1 + rx) - X(1)).toFixed(1)}" ry="${(Y(0.5) - Y(0.5 + ry)).toFixed(1)}" fill="none" stroke="var(--b)"/>`; }
    paths.forEach((P, k) => { let d = ""; P.forEach((p, i) => d += (i ? "L" : "M") + X(C3.clamp(p[0], -5, 5)).toFixed(1) + " " + Y(C3.clamp(p[1], -5, 5)).toFixed(1)); s += `<path d="${d}" fill="none" stroke="${cols[k]}" stroke-width="1.8"/>`; const e = P[P.length - 1]; s += `<circle cx="${X(C3.clamp(e[0], -5, 5))}" cy="${Y(C3.clamp(e[1], -5, 5))}" r="4" fill="${cols[k]}"/>`; });
    s += `</g><circle cx="${X(1)}" cy="${Y(0.5)}" r="5" fill="none" stroke="var(--t)" stroke-width="2"/><circle cx="${X(-1.5)}" cy="${Y(-0.7)}" r="4" fill="var(--t)"/><text class="ts" x="${X(-1.5) + 8}" y="${Y(-0.7) + 14}">start</text><text class="ts" x="${X(1) + 8}" y="${Y(0.5) - 8}">optimum</text>`;
    return s;
  }
};
addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l12", title: "The optimizer: Adam", short: "12. Adam",
big: "The adjoint method delivers a gradient. The optimizer decides how big a step to take along it. Plain gradient descent steps in proportion to the gradient, which fails when parameters differ greatly in sensitivity: a step small enough for the most sensitive parameter barely moves the others. Adam keeps, for every parameter, a running average of its gradient and of its squared gradient, and steps by the ratio of the two. Each parameter thus gets its own effective step size, about the learning rate α, whatever the scale of its gradient. Grating widths, DBR scales, taper points and pixel densities all have very different sensitivities, and Adam treats them on an equal footing.",
bridge: "This is Ch. 3 Sec. 3.6, the optimizer paragraph, which cites Algorithm 1 of Kingma and Ba 2015 (University of Amsterdam and University of Toronto). All thesis optimizations use Adam through the optax library with its default decay rates 0.9 and 0.999. Michaels and Yablonovitch used BFGS instead. The paths below are computed live on a stretched quadratic bowl.",
cards: [
{s: "1. Plain gradient descent", t: "Gradient descent in a stretched valley",
intu: "The bowl is stretched: moving along y is S times more sensitive than along x, so the contours are long ellipses. Gradient descent steps along −∇f. The step size must be small enough for the steep direction, otherwise it overshoots and diverges. But then the shallow direction crawls. Raise S and see the path zigzag across the valley or blow up, and need ever more steps to reach the optimum.",
eq: String.raw`\[ \mathbf{p}_{k+1} = \mathbf{p}_k - \alpha\, \nabla f(\mathbf{p}_k) \qquad f = (x - 1)^2 + S^2 (y - 0.5)^2 \]\[ \text{stable only if } \alpha \lt 1/S^2 \]`,
sym: [[String.raw`\(\alpha\)`, "learning rate"], [String.raw`\(S\)`, "sensitivity ratio between the two parameters"], [String.raw`\(1/S^2\)`, "largest stable step, set by the steep direction"]],
how: ["Along y the update is y ← y − 2αS²(y − 0.5), stable only if 2αS² < 2.", "Along x it is x ← x − 2α(x − 1), which needs α near ½ to be fast.", "Both cannot hold when S is large.", "So the number of steps grows like S²: the condition number problem."],
say: "Plain gradient descent struggles when parameters differ in sensitivity, because the step that is stable for the steepest one is too small for the rest.",
num: "At S = 10 the stable step is below 0.01, and the x direction then needs hundreds of steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Sensitivity ratio S", 1, 12, 0.5, 6) + sl("a", "Learning rate α (log)", -3, -0.3, 0.05, -1.7) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const S = +$("S").value, a = Math.pow(10, +$("a").value); $("Sv").textContent = S; $("av").textContent = a.toFixed(4);
    const P = C3A.gd(S, a, 60), e = P[P.length - 1], div = P.length < 61 || Math.abs(e[1]) > 5;
    fig.innerHTML = svg(250, C3A.view([P], S, ["#D85A30"]));
    $("ro").innerHTML = `<div><span>stable if α <</span><b>${(1 / (S * S)).toFixed(4)}</b></div><div><span>after 60 steps f</span><b>${div ? "diverged" : C3A.f(e, S).toExponential(2)}</b></div>`;
  };
  $("S").oninput = u; $("a").oninput = u; u();
}},

{s: "2. Adam", t: "Adam in the same valley",
intu: "Same valley, now with Adam. Each coordinate is stepped by its own averaged gradient divided by the root of its own averaged squared gradient. The ratio is about ±1 in each direction, so both coordinates move by about α per step regardless of S. The path heads almost diagonally toward the optimum. Compare with gradient descent (grey) at the same α.",
eq: String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2 \]\[ \hat m_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]<div class="eqref">Kingma and Ba, Alg. 1</div>`,
sym: [[String.raw`\(g_t\)`, "gradient at step t, per parameter"], [String.raw`\(m_t\)`, "first moment: running mean of the gradient"], [String.raw`\(v_t\)`, "second moment: running mean of the squared gradient"], [String.raw`\(\beta_1 = 0.9,\ \beta_2 = 0.999\)`, "decay rates, the optax defaults"], [String.raw`\(\epsilon = 10^{-8}\)`, "avoids division by zero"]],
how: ["Average the gradient over recent steps: m_t.", "Average its square: v_t, a measure of its typical size.", "Correct both for starting at zero (card 3).", "Step by m̂/√v̂: a signed, size-free number of order one, times α."],
say: "Adam steps each parameter by its averaged gradient divided by the root of its averaged squared gradient, so every parameter moves by about the learning rate whatever its sensitivity.",
num: "Kingma and Ba's defaults: α = 0.001, β₁ = 0.9, β₂ = 0.999, ε = 10<sup>−8</sup>. In photonic inverse design α is usually raised to between about 0.005 and 0.1.",
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Sensitivity ratio S", 1, 12, 0.5, 6) + sl("a", "Learning rate α", 0.01, 0.3, 0.005, 0.08) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const S = +$("S").value, a = +$("a").value; $("Sv").textContent = S; $("av").textContent = a.toFixed(3);
    const A = C3A.adam(S, a, 60), G = C3A.gd(S, a, 60), eA = A[A.length - 1], eG = G[G.length - 1], dG = G.length < 61 || Math.abs(eG[1]) > 5;
    fig.innerHTML = svg(250, C3A.view([G, A], S, ["var(--b)", "#1D9E75"]));
    $("ro").innerHTML = `<div><span>Adam, f after 60 steps</span><b>${C3A.f(eA, S).toExponential(2)}</b></div><div><span>gradient descent, same α</span><b>${dG ? "diverged" : C3A.f(eG, S).toExponential(2)}</b></div>`;
  };
  $("S").oninput = u; $("a").oninput = u; u();
}},

{s: "3. Moments and bias correction", t: "The running averages and why they are corrected",
intu: "Both averages start at zero. In the first steps they are therefore too small: after one step m is only 10 % of the gradient and v only 0.1 % of its square. Dividing by 1 − β<sup>t</sup> removes this start-up bias exactly for a constant gradient. Here the gradient is a constant 1 plus noise. Watch the raw averages creep up, the corrected ones sit near the true values from the start, and the step ratio m̂/√v̂ stay near 1.",
eq: String.raw`\[ \mathbb{E}[m_t] \approx (1 - \beta_1^t)\, \mathbb{E}[g] \qquad \mathbb{E}[v_t] \approx (1 - \beta_2^t)\, \mathbb{E}[g^2] \]\[ \Longrightarrow\quad \text{divide by } 1 - \beta^t \]`,
sym: [[String.raw`\(1 - \beta_1^t\)`, "0.1 at t = 1, 0.65 at t = 10, 0.99 at t = 44"], [String.raw`\(1 - \beta_2^t\)`, "0.001 at t = 1, 0.095 at t = 100, 0.63 at t = 1000"], ["noise", "spread of the gradient around its mean"]],
how: ["Unroll the recursion: m_t = (1 − β₁)Σβ₁^{t−i}g_i.", "For a constant gradient the weights sum to 1 − β₁^t.", "So m_t/(1 − β₁^t) is an unbiased average.", "The same holds for v_t, which matters longer because β₂ is close to 1."],
say: "Adam's averages start at zero, so it divides them by one minus the decay rate to the power of the step number to remove the start-up bias.",
num: "Without the correction the first steps would be far too large: m₁/√v₁ = 0.1g/(0.032|g|) ≈ 3.2 instead of 1.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Gradient noise", 0, 1.5, 0.05, 0.5) + sl("T", "Steps shown", 20, 300, 10, 120);
  const u = () => {
    const nz = +$("n").value, T = +$("T").value; $("nv").textContent = nz.toFixed(2); $("Tv").textContent = T;
    const r = C3.rng(4); let m = 0, v = 0; const M = [], V = [], Mh = [], Vh = [], R = [], ts = [];
    for (let t = 1; t <= T; t++) { const g = 1 + nz * (2 * r() - 1) * 1.7; m = 0.9 * m + 0.1 * g; v = 0.999 * v + 0.001 * g * g; const mh = m / (1 - Math.pow(0.9, t)), vh = v / (1 - Math.pow(0.999, t)); ts.push(t); M.push(m); V.push(v); Mh.push(mh); Vh.push(vh); R.push(mh / Math.sqrt(vh)); }
    const ym = 2.2;
    let s = C3.frame(70, 15, 560, 200, 1, T, 0, ym, [1, Math.round(T / 2), T], [0, 1, 2], "step t", "value") + plot(70, 15, 560, 200, ts, M, 1, T, 0, ym, "#378ADD", 1.5, "4 3") + plot(70, 15, 560, 200, ts, Mh, 1, T, 0, ym, "#378ADD", 2.5) + plot(70, 15, 560, 200, ts, V, 1, T, 0, ym, "#D85A30", 1.5, "4 3") + plot(70, 15, 560, 200, ts, Vh, 1, T, 0, ym, "#D85A30", 2.5) + plot(70, 15, 560, 200, ts, R, 1, T, 0, ym, "#1D9E75", 1.5);
    s += C3.legend(70, 262, [["m raw", "#378ADD", "4 3"], ["m̂", "#378ADD"], ["v raw", "#D85A30", "4 3"], ["v̂", "#D85A30"], ["m̂/√v̂", "#1D9E75"]]);
    fig.innerHTML = svg(272, s);
  };
  $("n").oninput = u; $("T").oninput = u; u();
}},

{s: "4. Scale invariance", t: "Rescaling one gradient changes nothing for Adam",
intu: "Kingma and Ba stress that Adam's step does not change when a gradient is multiplied by a constant: the factor appears in m and in √v and cancels. Here one parameter's sensitivity is multiplied by a factor from 1 to 1000. The readouts count the steps each method needs to bring both parameters within 1 % of the optimum, with gradient descent given its best stable learning rate. Adam's count barely moves, gradient descent's explodes.",
eq: String.raw`\[ g \to c\,g \quad\Longrightarrow\quad m \to c\,m, \qquad \sqrt{v} \to \lvert c \rvert \sqrt{v} \]\[ \Longrightarrow\quad \frac{\hat m}{\sqrt{\hat v}} \text{ unchanged} \quad \left(\text{for } \epsilon \ll \sqrt{\hat v}\right) \]`,
sym: [[String.raw`\(c\)`, "rescaling factor of one parameter's gradient"], ["steps to 1 %", "iterations until both parameters are within 0.01 of the optimum"]],
how: ["Multiply all gradients of one parameter by c.", "Its first moment scales by c, its second moment by c².", "The ratio m̂/√v̂ is unchanged, so the step is unchanged.", "For gradient descent the stable step falls like 1/c², so the other parameter slows down by c²."],
say: "Adam's update is invariant to rescaling a parameter's gradient, which is why it copes with parameters of very different sensitivity.",
num: "Ch. 3 cites exactly this property: Adam is robust to large differences in sensitivity between parameters.",
r(fig, ctl) {
  ctl.innerHTML = sl("c", "Sensitivity factor (log)", 0, 3, 0.05, 1) + '<div class="readout" id="ro"></div>';
  const steps = (S, adam) => { let p = [-1.5, -0.7]; const A = new C3.Adam(2, 0.05), lr = 0.9 / (S * S + 1); for (let i = 1; i <= 200000; i++) { const g = C3A.grad(p, S); if (adam) { const s = A.step([-g[0], -g[1]]); p = [p[0] + s[0], p[1] + s[1]]; } else p = [p[0] - lr * g[0], p[1] - lr * g[1]]; if (Math.abs(p[0] - 1) < 0.01 && Math.abs(p[1] - 0.5) < 0.01) return i; if (adam && i > 5000) return Infinity; } return Infinity; };
  const cs = range(0, 3, 13), sa = cs.map(l => steps(Math.pow(10, l), true)), sg = cs.map(l => steps(Math.pow(10, l), false));
  const u = () => {
    const l = +$("c").value, S = Math.pow(10, l); $("cv").textContent = S.toFixed(S < 10 ? 2 : 0);
    const a = steps(S, true), g = steps(S, false), Y = v => 200 - Math.log10(Math.max(1, v)) / 6 * 180, X = C3.X(70, 560, 0, 3);
    let s = `<rect x="70" y="20" width="560" height="180" fill="none" stroke="var(--b)"/>`;
    [1, 2, 3, 4, 5, 6].forEach(e => s += `<text class="ts" x="64" y="${Y(Math.pow(10, e)) + 4}" text-anchor="end">10${["", "¹", "²", "³", "⁴", "⁵", "⁶"][e]}</text>`);
    [0, 1, 2, 3].forEach(e => s += `<text class="ts" x="${X(e)}" y="218" text-anchor="middle">${Math.pow(10, e)}</text>`);
    s += plot(70, 20, 560, 180, cs, sa.map(v => 6 * (200 - Y(v)) / 180), 0, 3, 0, 6, "#1D9E75", 2.5) + plot(70, 20, 560, 180, cs, sg.map(v => 6 * (200 - Y(Math.min(v, 2e5))) / 180), 0, 3, 0, 6, "#D85A30", 2.5);
    s += `<line x1="${X(l)}" x2="${X(l)}" y1="20" y2="200" stroke="var(--p)" stroke-dasharray="3 3"/><text class="ts" x="350" y="236" text-anchor="middle">sensitivity factor S (log)</text>` + C3.legend(90, 258, [["Adam, α = 0.05", "#1D9E75"], ["gradient descent, best stable α", "#D85A30"]]);
    fig.innerHTML = svg(268, s);
    $("ro").innerHTML = `<div><span>Adam: steps to 1 %</span><b>${a}</b></div><div><span>gradient descent: steps to 1 %</span><b>${isFinite(g) ? g.toLocaleString("en-US") : "> 200 000"}</b></div>`;
  };
  $("c").oninput = u; u();
}},

{s: "5. The learning rate", t: "α bounds the step, and too large an α makes the design jump",
intu: "Because m̂/√v̂ is of order one, Adam's step per parameter is roughly bounded by α. That makes α easy to interpret: in the units of the free variables, it is the largest change per step. Too small and the run is slow. Too large and the parameters keep jumping around the optimum, or a design hops from one hill to another. The curves show the distance to the optimum versus step for three learning rates on the stretched bowl. Change α.",
eq: String.raw`\[ \lvert \Delta\theta_t \rvert \lesssim \alpha \]<div class="eqref">Kingma and Ba, Sec. 2.1, for typical gradients</div>`,
sym: [[String.raw`\(\Delta\theta_t\)`, "step of one parameter at iteration t"], [String.raw`\(\alpha\)`, "learning rate, in the units of the free variable"]],
how: ["The step is α m̂/√v̂, and |m̂/√v̂| is close to 1 when gradients are consistent.", "So α sets the scale of the step.", "Near the optimum the gradient changes sign, m̂ shrinks and the steps shrink.", "With large α the decay is slow and the iterate oscillates. In a non-convex problem it can even leave a good basin."],
say: "Adam's step is roughly bounded by the learning rate, so α directly sets how far the design can move per iteration.",
num: "Adam was designed for noisy objectives, and its convergence theory covers convex problems. Inverse design objectives are deterministic and non-convex, so Adam finds a local optimum that depends on the start, and a learning rate that is too large can make a run diverge.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "α (middle curve)", 0.01, 0.5, 0.01, 0.1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const a = +$("a").value; $("av").textContent = a.toFixed(2); const T = 150, S = 6;
    const runs = [a / 4, a, a * 4].map(lr => C3A.adam(S, lr, T).map(p => Math.hypot(p[0] - 1, p[1] - 0.5)));
    const ts = [...Array(T + 1).keys()], Y = v => C3.clamp(Math.log10(Math.max(v, 1e-4)), -4, 1);
    let s = C3.frame(70, 15, 560, 200, 0, T, -4, 1, [0, 50, 100, 150], [-4, -2, 0], "step", "distance to optimum", v => v, v => "10" + ({ "-4": "⁻⁴", "-2": "⁻²", "0": "⁰" })[v]);
    ["#378ADD", "#1D9E75", "#D85A30"].forEach((c, k) => s += plot(70, 15, 560, 200, ts, runs[k].map(Y), 0, T, -4, 1, c, 2));
    s += C3.legend(80, 262, [[`α/4 = ${(a / 4).toFixed(3)}`, "#378ADD"], [`α = ${a.toFixed(2)}`, "#1D9E75"], [`4α = ${(4 * a).toFixed(2)}`, "#D85A30"]]);
    fig.innerHTML = svg(272, s);
    $("ro").innerHTML = runs.map((r, k) => `<div><span>${["α/4", "α", "4α"][k]}: distance after ${T}</span><b>${r[T].toExponential(1)}</b></div>`).join("");
  };
  $("a").oninput = u; u();
}}
],
summary: "Adam keeps per-parameter running averages of the gradient (decay 0.9) and of its square (decay 0.999), corrects them for starting at zero, and steps by α m̂/(√v̂ + ε). The ratio m̂/√v̂ is of order one and unchanged when a gradient is rescaled, so every parameter moves by about α regardless of its sensitivity. That suits inverse design, where widths, layer scales, outline points and pixels differ greatly in sensitivity, and where plain gradient descent would need a step small enough for the most sensitive parameter. α sets the step size, too large an α makes the design jump, and like any gradient method Adam finds a local optimum.",
sheet: [
[String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2 \]`, "Moments (Kingma and Ba, Alg. 1)"],
[String.raw`\[ \hat m_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]`, "Bias correction"],
[String.raw`\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]`, "Update (gradient ascent: + for maximizing J)"],
[String.raw`\[ \beta_1 = 0.9 \qquad \beta_2 = 0.999 \qquad \epsilon = 10^{-8} \]`, "Defaults, also in optax"],
[String.raw`\[ \text{gradient descent stable for } \alpha \lt 1/S^2 \]`, "Why plain descent fails for ill-scaled parameters"]],
consts: "Test function f = (x − 1)² + S²(y − 0.5)², start (−1.5, −0.7). Thesis objectives are maximized, so the update adds the step.",
sources: ["Kingma and Ba, Adam: A method for stochastic optimization, ICLR 2015, arXiv:1412.6980 (Algorithm 1, bias correction, invariance to gradient rescaling)", "optax library documentation (adam with default b1 = 0.9, b2 = 0.999, eps = 1e-8)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (used BFGS for their taper)"]
});
