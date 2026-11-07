(function () {
/* ML shelf, Part 7, Lesson 33: Backpropagation by hand (Pro). The course has no lecture notes for week 10, so the order follows the homework: HW8 2B and HW9 4B (shapes of a one-hidden-layer network, what the ReLU does), HW10 C1 and C2 (activation derivatives by autograd, the gradient of one softmax output) and HW10 D1 (the gradient through a chain of blocks), with their questions and solutions docs. The spine is Andrew Ng's Deep Learning Specialization course 1 week 3 (Gradient descent for neural networks, Backpropagation intuition) and week 4 (Forward and backward propagation), course 2 week 1 (Vanishing and exploding gradients, Gradient checking) and the Machine Learning Specialization course 2 week 2 optional videos (Computation graph, Larger neural network example), with CS231n's backprop notes and Karpathy's micrograd. Card 6 of Lesson 32 introduced the 2-3-1 network and the two-example batch used here (N below is a copy, l32.js keeps N6 private). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const g4 = v => { if (v === 0) return "0"; const a = Math.abs(v); return a >= 1e-3 && a < 1e5 ? mn(String(+v.toPrecision(4))) : mn(v.toExponential(2)); };
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const vec = (a, d) => "(" + a.map(v => fm(v, d == null ? 2 : d).replace(/\.?0+$/, "") || "0").join(", ") + ")";
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const NODE = { in: ["var(--gray-bg)", C.gray], hid: ["var(--blue-bg)", C.blue], out: ["var(--teal-bg)", C.teal], off: ["var(--sunk)", "var(--line)"], hot: ["var(--coral-bg)", C.coral] };
const node = (x, y, r, kind, inner, below) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${NODE[kind][0]}" stroke="${NODE[kind][1]}" stroke-width="1.4"/>` + (inner != null ? `<text class="t" x="${x}" y="${y + 5}" text-anchor="middle" style="font-family:var(--mono);font-size:13px">${mn(inner)}</text>` : "") + (below ? tx(x, y + r + 15, below, "middle") : "");
const edge = (x1, y1, x2, y2, col, w, lab, at, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""} opacity="0.85"/>` + (lab != null ? `<text class="ts" x="${x1 + (x2 - x1) * (at || 0.5)}" y="${y1 + (y2 - y1) * (at || 0.5) - 4}" text-anchor="middle" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${mn(lab)}</text>` : "");
const lin = (a, b) => a.map((v, i) => v + b[i]);
const nrm = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0));
const rel = (a, b) => { const d = nrm(a.map((v, i) => v - b[i])), s = nrm(a) + nrm(b); return s ? d / s : 0; };

/* The 2-3-1 ReLU network and the two-example batch of Lesson 32 card 6 */
const N = { W1: [[1, -1], [2, 1], [-1, 0.5]], b1: [0.5, -1, 1], w2: [1, 1, -1], b2: 0.5, X: [[1, 2], [-1, 1]], Y: [2, -1] };
const ACT = {
  relu: [z => Math.max(0, z), (z, a) => (z > 0 ? 1 : 0)],
  tanh: [z => Math.tanh(z), (z, a) => 1 - a * a],
  sigmoid: [z => 1 / (1 + Math.exp(-z)), (z, a) => a * (1 - a)]
};
/* forward and backward in Ng's convention: dZ2 = 2(yhat - y) per example, 1/m in dW and db. bug: nomask, nom, sign, upd, tr */
const fb = (P, ex, an, bug) => {
  const [g, gd] = ACT[an || "relu"], m = ex.length, k = bug === "nom" ? 1 : m;
  const Xs = ex.map(i => N.X[i]), Ys = ex.map(i => N.Y[i]);
  const Z1 = Xs.map(x => P.W1.map((r, j) => r[0] * x[0] + r[1] * x[1] + P.b1[j])), A1 = Z1.map(r => r.map(g));
  const yh = A1.map(a => a.reduce((s, v, j) => s + v * P.w2[j], P.b2)), L = yh.reduce((s, v, i) => s + (v - Ys[i]) ** 2, 0) / m;
  const dZ2 = yh.map((v, i) => bug === "sign" ? 2 * (Ys[i] - v) : 2 * (v - Ys[i]));
  const dw2 = [0, 1, 2].map(j => dZ2.reduce((s, d, i) => s + d * A1[i][j], 0) / k), db2 = dZ2.reduce((s, d) => s + d, 0) / k;
  const w2u = bug === "upd" ? P.w2.map((w, j) => w - 0.1 * dw2[j]) : P.w2;
  const dA1 = dZ2.map(d => w2u.map(w => d * w)), GP = Z1.map((r, i) => r.map((z, j) => gd(z, A1[i][j])));
  const dZ1 = dA1.map((r, i) => r.map((v, j) => bug === "nomask" ? v : v * GP[i][j]));
  const dW1 = [0, 1, 2].map(j => [0, 1].map(c => dZ1.reduce((s, r, i) => s + r[j] * (bug === "tr" ? Xs[c][i] : Xs[i][c]), 0) / k));
  const db1 = [0, 1, 2].map(j => dZ1.reduce((s, r) => s + r[j], 0) / k);
  return { Z1, A1, yh, L, dZ2, dw2, db2, dA1, GP, dZ1, dW1, db1, Ys, Xs, m };
};
const flatG = r => [...r.dW1[0], ...r.dW1[1], ...r.dW1[2], ...r.db1, ...r.dw2, r.db2];
const flatP = P => [...P.W1[0], ...P.W1[1], ...P.W1[2], ...P.b1, ...P.w2, P.b2];
const unflat = t => ({ W1: [[t[0], t[1]], [t[2], t[3]], [t[4], t[5]]], b1: [t[6], t[7], t[8]], w2: [t[9], t[10], t[11]], b2: t[12] });
const PNAME = ["W¹₁₁", "W¹₁₂", "W¹₂₁", "W¹₂₂", "W¹₃₁", "W¹₃₂", "b¹₁", "b¹₂", "b¹₃", "w²₁", "w²₂", "w²₃", "b²"];
const numGrad = (t, eps, an) => t.map((_, i) => { const p = t.slice(), q = t.slice(); p[i] += eps; q[i] -= eps; return (fb(unflat(p), [0, 1], an).L - fb(unflat(q), [0, 1], an).L) / (2 * eps); });

/* Card 10: 40 fresh points, x uniform on (-2, 2), y = sin 2x + N(0, 0.1²), default_rng(3333), a 1-8-1 ReLU network, init rounded to 3 decimals */
const TX = [-1.99, -1.94, -1.93, -1.89, -1.65, -1.42, -1.32, -1.32, -1.05, -0.95, -0.92, -0.77, -0.71, -0.67, -0.64, -0.57, -0.53, -0.47, -0.41, -0.31, -0.26, -0.2, -0.16, -0.15, -0.14, 0.07, 0.09, 0.26, 0.32, 0.44, 0.55, 0.63, 0.78, 0.88, 0.94, 1.27, 1.31, 1.51, 1.52, 1.87];
const TY = [0.73, 0.77, 0.56, 0.74, 0.28, -0.21, -0.66, -0.57, -0.7, -1.17, -0.97, -0.84, -0.87, -1.11, -0.95, -1.15, -0.84, -0.76, -0.79, -0.62, -0.53, -0.19, -0.36, -0.2, -0.47, -0.05, 0.11, 0.44, 0.73, 0.62, 0.92, 0.91, 1.12, 1.23, 1.04, 0.57, 0.42, 0.11, 0.14, -0.53];
const TI = { w: [1.348, -2.096, -3.488, 1.401, 1.945, 0.831, 2.298, 0.101], b: [1.403, 0.517, 0.664, -0.136, -0.235, 1.336, -0.214, 1.014], v: [0.582, -0.296, -0.005, -0.724, -0.423, -0.109, -0.218, 0.218], c: 0 };
const trainStep = (S, lr) => {
  const m = TX.length, H = 8, dv = Array(H).fill(0), dw = Array(H).fill(0), db = Array(H).fill(0); let dc = 0, L = 0;
  for (let i = 0; i < m; i++) {
    const z = S.w.map((w, j) => w * TX[i] + S.b[j]), a = z.map(v => Math.max(0, v)), yh = a.reduce((s, q, j) => s + q * S.v[j], S.c), d = 2 * (yh - TY[i]);
    L += (yh - TY[i]) ** 2; dc += d;
    for (let j = 0; j < H; j++) { dv[j] += d * a[j]; if (z[j] > 0) { dw[j] += d * S.v[j] * TX[i]; db[j] += d * S.v[j]; } }
  }
  if (lr) { for (let j = 0; j < H; j++) { S.w[j] -= lr * dw[j] / m; S.b[j] -= lr * db[j] / m; S.v[j] -= lr * dv[j] / m; } S.c -= lr * dc / m; }
  return L / m;
};
const predict = (S, x) => S.w.reduce((s, w, j) => s + Math.max(0, w * x + S.b[j]) * S.v[j], S.c);

/* Card 11: a 30-layer chain of width 16 without biases, standard normals from mulberry32(3333) by Box and Muller, scaled by s / √16 */
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const DEPTH = (() => {
  const r = mulberry(3333), n = [], W = 16, D = 50, B = 32;
  const gauss = () => { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const Ws = Array.from({ length: D }, () => Array.from({ length: W }, () => Array.from({ length: W }, gauss)));
  const X0 = Array.from({ length: B }, () => Array.from({ length: W }, gauss)), G0 = Array.from({ length: B }, () => Array.from({ length: W }, gauss));
  return { Ws, X0, G0, W, B };
})();
const depthRun = (an, s, D) => {
  const { Ws, X0, G0, W, B } = DEPTH, sc = s / Math.sqrt(W), [g, gd] = an === "linear" ? [z => z, () => 1] : ACT[an];
  const As = [X0], Zs = [];
  for (let l = 0; l < D; l++) { const Z = As[l].map(a => Ws[l].map(row => sc * row.reduce((q, w, c) => q + w * a[c], 0))); Zs.push(Z); As.push(Z.map(r => r.map(g))); }
  const rms = M => Math.sqrt(M.reduce((q, r) => q + r.reduce((p, v) => p + v * v, 0), 0) / B);
  let G = G0; const gN = Array(D + 1).fill(0), aN = As.map(rms);
  gN[D] = rms(G);
  for (let l = D - 1; l >= 0; l--) {
    const Dl = G.map((r, b) => r.map((v, j) => v * gd(Zs[l][b][j], As[l + 1][b][j])));
    G = Dl.map(d => Array.from({ length: W }, (_, c) => sc * d.reduce((q, v, j) => q + v * Ws[l][j][c], 0)));
    gN[l] = rms(G);
  }
  return { gN, aN };
};
const DCACHE = {};
window.ML.L33 = { N, fb, flatG, flatP, unflat, numGrad, trainStep, predict, TI, depthRun, rel };

addLesson("ml", "deep", {
level: "Pro", num: "Lesson 33",
id: "ml-deep-l33", title: "Backpropagation by hand", short: "33. Backpropagation by hand",
big: String.raw`Training needs the gradient of the loss with respect to every weight. Backpropagation gets all of them in one backward sweep: run the network forward and keep every intermediate value, then start from the loss and apply the chain rule layer by layer, multiplying each upstream gradient by a local derivative that the forward pass already made easy to compute. This lesson does it by hand on Lesson 32's 2-3-1 ReLU network and two-example batch, first one example node by node, then the whole batch with Andrew Ng's six vectorized equations, \(dZ^{[2]}\), \(dW^{[2]}\), \(db^{[2]}\), \(dZ^{[1]}\), \(dW^{[1]}\) and \(db^{[1]}\), with every shape checked. Then the habits that make hand-written backprop trustworthy: per-example gradients that average to the batch gradient, activation derivatives read from the cache, gradient checking with Ng's relative difference, a step that really lowers the loss, and PyTorch autograd reproducing every number. The last cards train a network with your own backward pass, show how gradients vanish or explode through 30 layers, and collect the bugs a gradient check catches.`,
bridge: String.raw`The course has no lecture notes for week 10, so the topics follow the homework: HW8 2B and HW9 4B (the shapes of a one-hidden-layer network and what the ReLU does), HW10 C1 and C2 (activation derivatives with autograd, the gradient of one softmax output) and HW10 D1 (the derivative through a chain of 8 blocks, 1e-8 plain against 2.1436 residual), read with their questions and solutions docs. The spine is Andrew Ng's Deep Learning Specialization, course 1 week 3 (Gradient descent for neural networks, Backpropagation intuition) and week 4 (Forward and backward propagation), and course 2 week 1 (Vanishing and exploding gradients, Gradient checking), with CS231n's backprop notes and Karpathy's micrograd for the node by node view.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The cost of a gradient", t: "Why not nudge every weight and watch the loss",
intu: String.raw`The obvious way to get a gradient is to nudge one parameter up and down, rerun the network and see how the loss moves. That central difference costs two forward passes per parameter, so a network with P parameters needs 2P forward passes for one gradient. Pick a network: the 13 parameters of this lesson's 2-3-1 network cost 26 passes, HW9's MLPDigits 203,540, a ResNet-50 over 51 million. Backpropagation computes all P partial derivatives in one forward pass plus one backward pass, and the backward pass costs about twice the forward, so roughly three forward passes whatever P is. The trick is reuse. The derivative of the loss with respect to a hidden activation is computed once and then shared by every weight that feeds that unit. Ng's computation graph video in the Machine Learning Specialization puts it as roughly N + P steps instead of N times P. Finite differences are still useful, but only as a check, card 7.`,
eq: String.raw`\[ \frac{\partial J}{\partial \theta_i} \approx \frac{J(\boldsymbol\theta + \varepsilon\,\mathbf{e}_i) - J(\boldsymbol\theta - \varepsilon\,\mathbf{e}_i)}{2\varepsilon} \]
\[ \text{central differences: } 2P \text{ passes}, \qquad \text{backprop: about } 3 \]`,
sym: [[String.raw`\(P\)`, "number of trainable parameters"], [String.raw`\(\mathbf{e}_i\)`, "unit vector that nudges parameter i only"], [String.raw`\(\varepsilon\)`, "size of the nudge, for example 1e-7 in Ng's gradient check"], ["forward pass", "one evaluation of the network and the loss on the batch"], ["backward pass", "one sweep from the loss to the inputs, about twice the cost of a forward pass"]],
how: ["Count the parameters.", "Finite differences need two forward passes per parameter.", "Backprop needs one forward and one backward pass in total.", "Divide to see how many times cheaper backprop is.", "Keep finite differences for checking a gradient, not for training."],
say: String.raw`Backpropagation computes the gradient with respect to all parameters at the cost of about three forward passes, because each intermediate derivative is computed once and reused, while finite differences need two forward passes per parameter.`,
num: String.raw`At 1 ms per forward pass: 2-3-1 network 26 passes against 3. MLPDigits <b>203,540 passes, 203.5 s</b> against 3 ms. ResNet-50 with 25,557,032 parameters about <b>14.2 hours</b> for one finite difference gradient.`,
note: String.raw`An exam answer to "why backpropagation" names the reuse: one backward pass gives every partial derivative, its cost does not grow with the number of parameters the way finite differences do.`,
r(fig, ctl) {
  const NETS = [["this lesson, 2-3-1", 13], ["HW10 SmallClassifier", 418], ["HW10 MNISTCNN", 56714], ["HW9 MLPDigits", 101770], ["ResNet-50", 25557032]];
  ctl.innerHTML = btns(NETS.map((n, i) => [i, n[0]]), "b1n") + `<div id="b1o"></div>`;
  let ni = 3;
  const tm = s => s < 1 ? f(s, 3) + " s" : s < 120 ? f(s, 1) + " s" : s < 7200 ? f(s / 60, 1) + " min" : f(s / 3600, 1) + " h";
  const u = () => {
    pick(ctl, "b1n", ni);
    const P = NETS[ni][1], fd = 2 * P, X0 = 190, Wd = 450, lg = v => X0 + Wd * Math.log10(v) / 8;
    let s = tx(20, 24, "forward-pass equivalents for one gradient, log scale", null, "th");
    for (let e = 0; e <= 8; e++) s += `<line x1="${lg(10 ** e)}" y1="40" x2="${lg(10 ** e)}" y2="190" stroke="var(--line)" stroke-width="0.6"/>` + tx(lg(10 ** e), 206, e === 0 ? "1" : "10" + "⁰¹²³⁴⁵⁶⁷⁸"[e], "middle");
    NETS.forEach(([nm, p], i) => {
      const y = 46 + i * 29, on = i === ni;
      s += tx(X0 - 8, y + 13, nm, "end", on ? "th" : "ts") + `<rect x="${X0}" y="${y}" width="${lg(2 * p) - X0}" height="10" rx="3" fill="${on ? C.coral : "var(--coral-bg)"}" opacity="${on ? 1 : 0.8}"/>` + `<rect x="${X0}" y="${y + 11}" width="${lg(3) - X0}" height="8" rx="3" fill="${on ? C.teal : "var(--teal-bg)"}"/>`;
      if (on) s += tx(lg(2 * p) + 6, y + 10, (2 * p).toLocaleString("en-US")) + tx(lg(3) + 6, y + 20, "3");
    });
    s += `<rect x="190" y="222" width="12" height="10" fill="${C.coral}"/>` + tx(208, 231, "central differences, 2P passes") + `<rect x="420" y="222" width="12" height="10" fill="${C.teal}"/>` + tx(438, 231, "backprop, about 3 passes");
    fig.innerHTML = svg(244, s);
    $("b1o").innerHTML = RO([["parameters P", P.toLocaleString("en-US")], ["finite differences", fd.toLocaleString("en-US") + " passes"], ["at 1 ms per pass", tm(fd / 1000)], ["backprop", "about 3 passes, 3 ms"], ["backprop is cheaper by", Math.round(fd / 3).toLocaleString("en-US") + " times"]]);
  };
  ctl.querySelectorAll("button[data-b1n]").forEach(b => b.onclick = () => { ni = +b.dataset.b1n; u(); });
  u();
}},

{s: "2. One example, node by node", t: "Forward, keep everything, then walk back with the chain rule",
intu: String.raw`Here is Lesson 32's network on one example with the per-example loss \(\ell = (\hat y - y)^2\). Step through. The forward pass fills every node and keeps \(\mathbf{z}\) and \(\mathbf{a}\), the cache. The backward pass starts at the loss with \(d\ell/d\hat y = 2(\hat y - y)\), which is 1 for example 1. The output layer is linear, so the gradient of its weights is that number times the hidden activations it multiplied, and the gradient of its bias is the number itself. Going back through a weight sends the gradient to the hidden unit multiplied by that weight. Going back through the ReLU multiplies by 1 where the unit was on and by 0 where it was off, so unit 1 with \(z = -0.5\) passes nothing back. Finally every first-layer weight gets the unit's gradient times the input it multiplied. Every step is one local derivative times the gradient arriving from above, exactly the chain rule of Lesson 13, applied in the order that reuses each product.`,
eq: String.raw`\[ \frac{d\ell}{d\hat y} = 2(\hat y - y), \quad \frac{d\ell}{d\mathbf{w}^{[2]}} = \frac{d\ell}{d\hat y}\,\mathbf{a}^{[1]}, \quad \frac{d\ell}{d\mathbf{a}^{[1]}} = \frac{d\ell}{d\hat y}\,\mathbf{w}^{[2]} \]
\[ \frac{d\ell}{d\mathbf{z}^{[1]}} = \frac{d\ell}{d\mathbf{a}^{[1]}} \odot \mathbf{1}[\mathbf{z}^{[1]} \gt 0], \qquad \frac{d\ell}{dW^{[1]}} = \frac{d\ell}{d\mathbf{z}^{[1]}}\,\mathbf{x}^\top \]`,
sym: [[String.raw`\(\ell\)`, "loss of one example, here (ŷ − y)²"], [String.raw`\(\odot\)`, "elementwise product"], [String.raw`\(\mathbf{1}[\mathbf{z} \gt 0]\)`, "the ReLU mask, 1 where the unit was on in the forward pass"], ["cache", "z and a of every layer, stored by the forward pass for the backward pass"], ["upstream gradient", "the derivative of the loss arriving at a node from the layer above"]],
how: ["Run the forward pass and keep z and a.", "Start with dℓ/dŷ = 2(ŷ − y).", "Output weights: multiply by the hidden activations, the bias gets dℓ/dŷ.", "Hidden activations: multiply by the output weights.", "Through ReLU: keep the gradient where z was positive, zero elsewhere.", "First-layer weights: the unit's gradient times each input."],
say: String.raw`Backpropagation applies the chain rule from the loss towards the inputs, multiplying the upstream gradient by each node's local derivative, and the weight gradient of a layer is the gradient at its output times the input it multiplied.`,
num: String.raw`Example 1, x = (1, 2), y = 2: z⁽¹⁾ = (−0.5, 3, 1), a⁽¹⁾ = (0, 3, 1), ŷ = 2.5, ℓ = 0.25, dℓ/dŷ = 1, dℓ/dw⁽²⁾ = (0, 3, 1), dℓ/dz⁽¹⁾ = (0, 1, −1), dℓ/dW⁽¹⁾ rows <b>(0, 0), (1, 2), (−1, −2)</b>. Example 2: ŷ = −2, dℓ/dŷ = −2, dℓ/dw⁽²⁾ = (0, 0, −5), only unit 3 gets a gradient, row (−2, 2).`,
note: String.raw`A final-exam network by hand asks for exactly these steps. Write the forward values on the diagram first, then the backward values in a second color next to them, and check that every weight gradient is (gradient at its output) times (value at its input).`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "example 1, x = (1, 2), y = 2"], [1, "example 2, x = (−1, 1), y = −1"]], "b2e") + `<div id="b2s"></div><div id="b2o"></div>`;
  let ex = 0, k = 0;
  const NM = ["input x", "pre-activations z⁽¹⁾", "ReLU a⁽¹⁾", "output ŷ", "loss ℓ", "dℓ/dŷ", "output layer gradients", "dℓ/da⁽¹⁾", "through the ReLU", "first layer gradients"];
  const draw = () => {
    const r = fb(N, [ex]), x = N.X[ex], y = N.Y[ex], z = r.Z1[0], a = r.A1[0], d = r.dZ2[0], dz = r.dZ1[0], da = r.dA1[0];
    const XI = 70, XH = 280, XO = 470, XL = 610, YI = [95, 185], YH = [60, 140, 220], YO = 140;
    let s = tx(XI, 22, "input", "middle", "th") + tx(XH, 22, "hidden, ReLU", "middle", "th") + tx(XO, 22, "output", "middle", "th") + tx(XL, 22, "loss", "middle", "th");
    N.W1.forEach((row, j) => row.forEach((w, c) => {
      const back = k >= 9, gv = r.dW1[j][c], on = back ? gv !== 0 : true;
      s += edge(XI + 22, YI[c], XH - 24, YH[j], back ? (gv ? C.coral : "var(--line)") : (w > 0 ? C.blue : C.coral), back ? (gv ? 2.2 : 0.8) : 1 + Math.abs(w) * 0.5, back ? (gv ? f(gv, 1).replace(/\.0$/, "") : null) : String(w), c ? 0.25 : 0.72, back && !gv ? "3 4" : null);
    }));
    N.w2.forEach((w, j) => { const back = k >= 6; s += edge(XH + 24, YH[j], XO - 25, YO, back ? (r.dw2[j] ? C.coral : "var(--line)") : (w > 0 ? C.blue : C.coral), back ? (r.dw2[j] ? 2.2 : 0.8) : 1.5, back ? f(r.dw2[j], 1).replace(/\.0$/, "") : String(w), 0.5, back && !r.dw2[j] ? "3 4" : null); });
    s += edge(XO + 26, YO, XL - 40, YO, "var(--p)", 1.2);
    x.forEach((v, c) => { s += node(XI, YI[c], 21, "in", String(v)) + tx(XI, YI[c] + 38, "x" + "₁₂"[c], "middle"); });
    YH.forEach((yy, j) => {
      const dead = k >= 8 && z[j] <= 0;
      let inner = null, kind = "hid";
      if (k === 1) inner = String(z[j]); else if (k >= 2 && k <= 6) inner = String(a[j]);
      if (k === 7) { inner = String(da[j]); kind = "hot"; } else if (k >= 8) { inner = String(dz[j]); kind = dead ? "off" : "hot"; }
      s += node(XH, yy, 24, kind, inner) + tx(XH, yy + 41, "unit " + (j + 1) + (k >= 1 ? ", z = " + mn(z[j]) : ""), "middle") + tx(XH + 32, yy - 22, "b = " + mn(N.b1[j]));
    });
    s += node(XO, YO, 25, k === 5 ? "hot" : "out", k >= 5 ? String(d) : k >= 3 ? String(r.yh[0]) : null) + tx(XO, YO + 42, k >= 5 ? "dℓ/dŷ" : "ŷ", "middle") + tx(XO, YO - 32, "b = 0.5", "middle");
    s += `<g class="${k >= 4 ? "c-teal" : "c-gray"}"><rect x="${XL - 40}" y="${YO - 26}" width="80" height="52" rx="8" stroke-width="1"/></g>` + tx(XL, YO - 6, k >= 4 ? "ℓ = " + f(r.L, 2) : "ℓ", "middle", "th") + tx(XL, YO + 14, "y = " + mn(y), "middle");
    if (k >= 5) s += tx(340, 290, "coral numbers are gradients of ℓ, gray dashed edges get 0", "middle");
    const LINES = [
      `x = ${vec(x)}`, `z⁽¹⁾ = W⁽¹⁾x + b⁽¹⁾ = ${vec(z)}`, `a⁽¹⁾ = ReLU(z⁽¹⁾) = ${vec(a)}`, `ŷ = w⁽²⁾ · a⁽¹⁾ + b⁽²⁾ = ${mn(r.yh[0])}`, `ℓ = (ŷ − y)² = (${mn(r.yh[0])} − (${mn(y)}))² = ${f(r.L, 2)}`,
      `dℓ/dŷ = 2(ŷ − y) = ${mn(d)}`, `dℓ/dw⁽²⁾ = dℓ/dŷ · a⁽¹⁾ = ${vec(r.dw2)},   dℓ/db⁽²⁾ = ${mn(r.db2)}`, `dℓ/da⁽¹⁾ = dℓ/dŷ · w⁽²⁾ = ${vec(da)}`,
      `mask 1[z > 0] = ${vec(z.map(v => v > 0 ? 1 : 0))},   dℓ/dz⁽¹⁾ = ${vec(dz)}`, `dℓ/dW⁽¹⁾ rows ${r.dW1.map(q => vec(q)).join(", ")},   dℓ/db⁽¹⁾ = ${vec(r.db1)}`];
    fig.innerHTML = svg(304, s) + `<p class="note" style="font-family:var(--mono);font-size:13px">${LINES[k]}</p>`;
    $("b2o").innerHTML = RO([["phase", k <= 4 ? "forward" : "backward"], ["ŷ", f(r.yh[0], 2)], ["ℓ", f(r.L, 2)], ["units on", z.filter(v => v > 0).length + " of 3"]]);
  };
  $("b2s").innerHTML = "";
  ML.stepper($("b2s"), NM.length, i => { k = i; draw(); }, NM);
  ctl.querySelectorAll("button[data-b2e]").forEach(b => b.onclick = () => { ex = +b.dataset.b2e; pick(ctl, "b2e", ex); draw(); });
  pick(ctl, "b2e", ex);
}},

{s: "3. Six equations and their shapes", t: "Ng's vectorized backprop, one line per quantity",
intu: String.raw`Ng writes the backward pass of a two-layer network as six lines, with the m examples of a batch as columns. The output error \(dZ^{[2]}\) has one column per example. Each weight gradient is an error matrix times the transposed input of that layer, divided by m, so the product sums over the examples, and each bias gradient sums the errors along the example axis. The hidden error \(dZ^{[1]}\) sends \(dZ^{[2]}\) back through \(W^{[2]\top}\) and multiplies by the activation derivative elementwise. Pick a network and a batch size: every gradient has exactly the shape of the parameter it belongs to, and the m disappears in the products. That is the check Ng recommends before trusting any code. With a sigmoid output and cross-entropy, \(dZ^{[2]} = A^{[2]} - Y\) as in Lessons 29 and 30. For the regression of this lesson with the mean squared error \(\frac{1}{m}\sum(\hat y - y)^2\), the same line reads \(2(\hat Y - Y)\), and with Ng's \(\frac{1}{2m}\) cost the 2 disappears.`,
eq: String.raw`\[ dZ^{[2]} = 2(\hat Y - Y), \quad dW^{[2]} = \tfrac{1}{m}\,dZ^{[2]}A^{[1]\top}, \quad d\mathbf{b}^{[2]} = \tfrac{1}{m}\textstyle\sum_{\text{cols}} dZ^{[2]} \]
\[ dZ^{[1]} = W^{[2]\top}dZ^{[2]} \odot g'(Z^{[1]}), \quad dW^{[1]} = \tfrac{1}{m}\,dZ^{[1]}X^\top, \quad d\mathbf{b}^{[1]} = \tfrac{1}{m}\textstyle\sum_{\text{cols}} dZ^{[1]} \]`,
sym: [[String.raw`\(dZ^{[l]}\)`, "Ng's shorthand for the gradient of the per-example loss with respect to Z⁽ˡ⁾, shape (n⁽ˡ⁾, m)"], [String.raw`\(dW^{[l]}\)`, "gradient of the cost J with respect to W⁽ˡ⁾, same shape as W⁽ˡ⁾"], [String.raw`\(g'(Z^{[1]})\)`, "activation derivative at every cached pre-activation"], ["m", "number of examples in the batch, summed out by the matrix products"], ["sum over columns", "np.sum(dZ, axis=1, keepdims=True), one number per unit"]],
how: ["Write each layer's sizes n⁽⁰⁾, n⁽¹⁾, n⁽²⁾ and the batch size m.", "dZ has the shape of Z, (units, m).", "dW = dZ times the transposed layer input, over m.", "db sums dZ over the example axis, over m.", "dZ of the hidden layer: W⁽²⁾ᵀ dZ⁽²⁾ times g′(Z⁽¹⁾) elementwise.", "Check that dW has the shape of W."],
say: String.raw`In vectorized backprop every gradient has the shape of its parameter: the weight gradient is the error matrix times the transposed input of the layer divided by m, and the bias gradient is the error summed over the examples divided by m.`,
num: String.raw`This lesson with m = 2: dZ⁽²⁾ (1, 2), dW⁽²⁾ (1, 3), dZ⁽¹⁾ (3, 2), dW⁽¹⁾ (3, 2). HW9 MLPDigits with m = 64: dZ⁽²⁾ (10, 64), dW⁽²⁾ <b>(10, 128)</b>, dZ⁽¹⁾ (128, 64), dW⁽¹⁾ <b>(128, 784)</b>.`,
note: String.raw`PyTorch keeps examples as rows, so every matrix here is transposed: the hidden error is (m, n⁽¹⁾) and the weight gradient is dZᵀX over m, still of shape (out, in) like <code>nn.Linear.weight</code>.`,
r(fig, ctl) {
  const NETS = [["this lesson 2-3-1", [2, 3, 1]], ["HW10 SmallClassifier", [10, 32, 2]], ["HW9 MLPDigits", [784, 128, 10]]];
  ctl.innerHTML = btns(NETS.map((n, i) => [i, n[0]]), "b3n") + sl("b3m", "batch m", 1, 256, 1, 2) + `<div id="b3o"></div>`;
  let ni = 0;
  const u = () => {
    pick(ctl, "b3n", ni);
    const [n0, n1, n2] = NETS[ni][1], m = +$("b3m").value; $("b3mv").textContent = m;
    const sh = (a, b) => "(" + a + ", " + b + ")";
    const sc = v => 18 + 70 * Math.log10(v + 1) / Math.log10(785);
    const rect = (x, y, r, c, lab, col, hlc) => `<rect x="${x}" y="${y}" width="${sc(c)}" height="${sc(r)}" fill="var(--${col}-bg)" stroke="var(--${col})" stroke-width="1.2"/>` + tx(x + sc(c) / 2, y - 6, lab, "middle", "th") + tx(x + sc(c) / 2, y + sc(r) + 14, sh(r, c), "middle") + (hlc ? `<line x1="${x}" y1="${y + sc(r) + 20}" x2="${x + sc(c)}" y2="${y + sc(r) + 20}" stroke="${C.coral}" stroke-width="3"/>` : "");
    let s = tx(20, 22, "dW⁽¹⁾ = (1/m) dZ⁽¹⁾ Xᵀ, the m axis is summed out", null, "th");
    let x = 40; s += rect(x, 60, n1, m, "dZ⁽¹⁾", "coral", 1); x += sc(m) + 40; s += tx(x - 20, 100, "×", "middle", "th");
    s += `<rect x="${x}" y="60" width="${sc(n0)}" height="${sc(m)}" fill="var(--gray-bg)" stroke="var(--p)" stroke-width="1.2"/>` + tx(x + sc(n0) / 2, 54, "Xᵀ", "middle", "th") + tx(x + sc(n0) / 2, 60 + sc(m) + 14, sh(m, n0), "middle") + `<line x1="${x - 6}" y1="60" x2="${x - 6}" y2="${60 + sc(m)}" stroke="${C.coral}" stroke-width="3"/>`;
    x += sc(n0) + 40; s += tx(x - 20, 100, "=", "middle", "th") + rect(x, 60, n1, n0, "dW⁽¹⁾", "teal") + tx(x + sc(n0) + 12, 80, "same shape as W⁽¹⁾") + tx(x + sc(n0) + 12, 98, "nn.Linear(" + n0 + ", " + n1 + ").weight");
    fig.innerHTML = svg(170, s) + TB(["quantity", "formula", "Ng shape", "PyTorch shape"], [
      ["X", "input", sh(n0, m), sh(m, n0)], ["Z⁽¹⁾, A⁽¹⁾", "W⁽¹⁾X + b⁽¹⁾", sh(n1, m), sh(m, n1)], ["dZ⁽²⁾", "2(Ŷ − Y) or A⁽²⁾ − Y", sh(n2, m), sh(m, n2)],
      ["dW⁽²⁾", "dZ⁽²⁾A⁽¹⁾ᵀ / m", sh(n2, n1), sh(n2, n1)], ["db⁽²⁾", "row sums of dZ⁽²⁾ / m", sh(n2, 1), "(" + n2 + ",)"], ["dZ⁽¹⁾", "W⁽²⁾ᵀdZ⁽²⁾ ⊙ g′(Z⁽¹⁾)", sh(n1, m), sh(m, n1)],
      ["dW⁽¹⁾", "dZ⁽¹⁾Xᵀ / m", sh(n1, n0), sh(n1, n0)], ["db⁽¹⁾", "row sums of dZ⁽¹⁾ / m", sh(n1, 1), "(" + n1 + ",)"]]);
    $("b3o").innerHTML = RO([["weights in dW⁽¹⁾", (n1 * n0).toLocaleString("en-US")], ["products summed per entry", m], ["dZ⁽¹⁾ entries", (n1 * m).toLocaleString("en-US")]]);
  };
  ctl.querySelectorAll("button[data-b3n]").forEach(b => b.onclick = () => { ni = +b.dataset.b3n; $("b3m").value = [2, 128, 64][ni]; u(); });
  $("b3m").oninput = u; u();
}},

{s: "4. The batch by hand", t: "All six equations on the two-example batch",
intu: String.raw`Now both examples at once, in Ng's layout with examples as columns. Step through the six equations. The output errors are \(2(\hat y - y)\) for each column, 1 and −2. The output weight gradient multiplies that row by the transposed activations and divides by m = 2. The hidden error first sends the output error back through the transposed output weights, giving a 3 by 2 matrix, then the cached mask zeroes every entry whose unit was off for that example. Unit 1 was off for both examples, so its whole row is zero and its weights will not move this step. The first-layer gradient multiplies the hidden error by the transposed inputs and divides by 2. Compare with card 2: each entry here is the average of the two single-example gradients, which card 5 shows directly.`,
eq: String.raw`\[ \hat Y = (2.5,\ -2), \quad Y = (2,\ -1), \quad dZ^{[2]} = (1,\ -2) \]
\[ dW^{[1]} = \tfrac12\,dZ^{[1]}X^\top, \qquad X = \begin{pmatrix} 1 & -1 \\ 2 & 1 \end{pmatrix} \]`,
sym: [[String.raw`\(X\)`, "inputs as columns, (2, m), example 1 is (1, 2), example 2 is (−1, 1)"], [String.raw`\(dA^{[1]}\)`, "W⁽²⁾ᵀ dZ⁽²⁾, the gradient arriving at the hidden activations"], [String.raw`\(g'(Z^{[1]})\)`, "the ReLU mask from the cache, 1 where Z⁽¹⁾ > 0"], ["m", "2 examples"]],
how: ["Compute dZ⁽²⁾ = 2(Ŷ − Y).", "dW⁽²⁾ = dZ⁽²⁾ A⁽¹⁾ᵀ / m and db⁽²⁾ = sum of dZ⁽²⁾ / m.", "dA⁽¹⁾ = W⁽²⁾ᵀ dZ⁽²⁾.", "dZ⁽¹⁾ = dA⁽¹⁾ times the mask.", "dW⁽¹⁾ = dZ⁽¹⁾ Xᵀ / m and db⁽¹⁾ = row sums of dZ⁽¹⁾ / m."],
say: String.raw`For a batch, the hidden error is the output error sent back through the transposed weights and masked by the activation derivative, and each weight gradient averages the per-example products over the batch.`,
num: String.raw`dW⁽²⁾ = <b>(0, 1.5, −2)</b>, db⁽²⁾ = −0.5, dZ⁽¹⁾ columns (0, 1, −1) and (0, 0, 2), dW⁽¹⁾ rows <b>(0, 0), (0.5, 1), (−1.5, 0)</b>, db⁽¹⁾ = (0, 0.5, 0.5). Squared gradient norm over all 13 parameters 10.5.`,
note: String.raw`These are the board numbers the agent card pins in a test, and PyTorch reproduces every one on card 9.`,
r(fig, ctl) {
  const r = fb(N, [0, 1]), T = M => M[0].map((_, j) => M.map(row => row[j]));
  const gf = v => mn(+(+v).toFixed(2) === 0 ? 0 : +(+v).toFixed(2)), cell = 42;
  const NM = ["forward cache", "output error dZ⁽²⁾", "output layer gradients", "back through W⁽²⁾ᵀ", "the ReLU mask", "first layer gradients"];
  const G = (a, x, y, title, o) => ML.grid(a, Object.assign({ x, y, cell, fmt: gf, title, rowLab: false, colLab: false }, o || {})).s;
  const op = (x, y, t) => tx(x, y, t, "middle", "th");
  const draw = k => {
    let s = "", h = 200;
    if (k === 0) s = G(T(r.Z1), 40, 46, "Z⁽¹⁾ (3, 2)") + G(T(r.A1), 180, 46, "A⁽¹⁾ (3, 2)", { hl: new Set(["1,0", "2,0", "2,1"]) }) + G([r.yh], 320, 46, "Ŷ (1, 2)") + G([N.Y], 450, 46, "Y (1, 2)") + tx(40, 196, "columns are examples 1 and 2, the cache keeps Z⁽¹⁾ and A⁽¹⁾");
    if (k === 1) s = G([r.dZ2], 60, 46, "dZ⁽²⁾ = 2(Ŷ − Y)", { hl2: new Set(["0,0", "0,1"]) }) + tx(60, 120, "2(2.5 − 2) = 1 and 2(−2 − (−1)) = −2");
    if (k === 2) s = G([r.dZ2], 30, 46, "dZ⁽²⁾ (1, 2)") + op(130, 72, "×") + G(r.A1, 150, 46, "A⁽¹⁾ᵀ (2, 3)") + op(290, 72, "/ 2 =") + G([r.dw2], 330, 46, "dW⁽²⁾ (1, 3)", { hl: new Set(["0,1", "0,2"]) }) + G([[r.db2]], 520, 46, "db⁽²⁾") + tx(30, 160, "0.5 · (0, 3, 1) + (−1) · (0, 0, 2.5) = (0, 1.5, −2)");
    if (k === 3) s = G(N.w2.map(v => [v]), 40, 46, "W⁽²⁾ᵀ (3, 1)") + op(110, 110, "×") + G([r.dZ2], 130, 46, "dZ⁽²⁾ (1, 2)") + op(250, 110, "=") + G(T(r.dA1), 280, 46, "dA⁽¹⁾ (3, 2)", { hl2: new Set(["0,0", "1,0", "2,0", "0,1", "1,1", "2,1"]) });
    if (k === 4) s = G(T(r.dA1), 40, 46, "dA⁽¹⁾") + op(150, 110, "⊙") + G(T(r.GP), 175, 46, "g′(Z⁽¹⁾) mask", { hl: new Set(["1,0", "2,0", "2,1"]) }) + op(285, 110, "=") + G(T(r.dZ1), 310, 46, "dZ⁽¹⁾ (3, 2)", { hl2: new Set(["1,0", "2,0", "2,1"]), dim: new Set(["0,0", "0,1"]) }) + tx(420, 80, "unit 1 off for both") + tx(420, 98, "examples, its row is 0");
    if (k === 5) s = G(T(r.dZ1), 30, 46, "dZ⁽¹⁾ (3, 2)") + op(130, 110, "×") + G(N.X, 150, 46, "Xᵀ (2, 2)") + op(265, 110, "/ 2 =") + G(r.dW1, 300, 46, "dW⁽¹⁾ (3, 2)", { hl: new Set(["1,0", "1,1", "2,0"]) }) + G(r.db1.map(v => [v]), 430, 46, "db⁽¹⁾") + tx(480, 80, "row 3: (−1 · (1, 2)") + tx(480, 98, "+ 2 · (−1, 1)) / 2") + tx(480, 116, "= (−1.5, 0)");
    fig.innerHTML = svg(h, s);
  };
  ML.stepper(ctl, NM.length, draw, NM);
  ctl.insertAdjacentHTML("beforeend", RO([["loss J", f(r.L, 3)], ["‖g‖²", f(nrm(flatG(r)) ** 2, 2)], ["zero gradients", flatG(r).filter(v => v === 0).length + " of 13"]]));
}},

{s: "5. Per-example gradients add up", t: "The batch gradient is the average of the example gradients",
intu: String.raw`The batch cost is the mean of the per-example losses, and a derivative of a mean is the mean of the derivatives. So the batch gradient of card 4 is the average of the two single-example gradients of card 2, parameter by parameter. Toggle the views. Example 1 pushes unit 2 and unit 3, example 2 pushes only unit 3, and the average keeps both contributions at half strength. Three bars stay at zero in every view: unit 1 was off for both examples, so its two weights and its bias get no gradient from this batch. That is not a bug, it is the ReLU mask doing its job, but a unit that is off for every example of every batch never learns again, the dying ReLU of Lesson 34. The sum view is what <code>reduction='sum'</code> gives in PyTorch: twice the mean here, so the same learning rate takes a step twice as long.`,
eq: String.raw`\[ J = \frac{1}{m}\sum_{i=1}^{m} \ell^{(i)} \quad\Rightarrow\quad \nabla J = \frac{1}{m}\sum_{i=1}^{m} \nabla \ell^{(i)} \]
\[ \text{reduction sum: } \nabla\Big(\sum_i \ell^{(i)}\Big) = m\,\nabla J \]`,
sym: [[String.raw`\(\ell^{(i)}\)`, "loss of example i"], [String.raw`\(J\)`, "cost of the batch, the mean of the example losses"], [String.raw`\(\nabla\)`, "gradient with respect to all 13 parameters"], ["dead for this batch", "a unit with z ≤ 0 for every example, its incoming weights and bias get 0"]],
how: ["Backprop each example on its own.", "Add the gradients parameter by parameter.", "Divide by m for the mean cost.", "Compare with the vectorized batch gradient, they must agree.", "Look for parameters that are zero in every example."],
say: String.raw`Because the cost is the mean of the example losses, the batch gradient is the mean of the per-example gradients, and a reduction by sum multiplies it by the batch size.`,
num: String.raw`Example 1 gives dW⁽²⁾ = (0, 3, 1), example 2 gives (0, 0, −5), the mean is <b>(0, 1.5, −2)</b> and the sum (0, 3, −4). Bias b⁽²⁾: 1 and −2, mean −0.5. Unit 1 gets 0 in all views.`,
note: String.raw`The project's training loop uses the mean (the PyTorch default), so changing the batch size does not change the gradient's scale. With a sum the learning rate would have to shrink as the batch grows.`,
r(fig, ctl) {
  const g1 = flatG(fb(N, [0])), g2 = flatG(fb(N, [1])), gm = flatG(fb(N, [0, 1])), gs = gm.map(v => 2 * v);
  const V = [["example 1", g1], ["example 2", g2], ["mean, the batch gradient", gm], ["sum, reduction='sum'", gs]];
  ctl.innerHTML = btns(V.map((v, i) => [i, v[0]]), "b5v") + `<div id="b5o"></div>`;
  let vi = 2;
  const u = () => {
    pick(ctl, "b5v", vi);
    const ax = ML.axes(60, 30, 590, 190, { xmin: -0.5, xmax: 12.5, ymin: -5, ymax: 5, nx: 13, ny: 5, fx: () => "", fy: v => mn(+v.toFixed(0)), yl: "gradient" });
    let s = ax.s + `<line x1="60" y1="${ax.Y(0)}" x2="650" y2="${ax.Y(0)}" stroke="var(--p)" stroke-width="0.8"/>`;
    V[vi][1].forEach((v, i) => {
      const x = ax.X(i) - 14, ghost = vi >= 2 ? [g1[i], g2[i]] : [];
      ghost.forEach((q, j) => { s += `<rect x="${x + j * 15}" y="${Math.min(ax.Y(0), ax.Y(q))}" width="13" height="${Math.abs(ax.Y(q) - ax.Y(0))}" fill="none" stroke="${j ? C.purple : C.blue}" stroke-dasharray="3 2"/>`; });
      s += `<rect x="${x + 4}" y="${Math.min(ax.Y(0), ax.Y(v))}" width="20" height="${Math.max(1, Math.abs(ax.Y(v) - ax.Y(0)))}" fill="${v === 0 ? "var(--line)" : vi === 2 ? C.teal : vi === 3 ? C.coral : vi ? C.purple : C.blue}"/>`;
      s += tx(ax.X(i), 238, PNAME[i], "middle") + (v ? tx(ax.X(i), v > 0 ? ax.Y(v) - 4 : ax.Y(v) + 12, g4(v), "middle") : "");
      if (i === 0 || i === 1 || i === 6) s += `<rect x="${x}" y="226" width="28" height="18" fill="none" stroke="${C.gray}" stroke-dasharray="2 2"/>`;
    });
    s += tx(60, 262, "dashed boxes: unit 1, off for both examples" + (vi >= 2 ? ", dashed bars: example 1 (blue) and example 2 (purple)" : ""));
    fig.innerHTML = svg(272, s);
    $("b5o").innerHTML = RO([["view", V[vi][0]], ["‖gradient‖", f(nrm(V[vi][1]), 4)], ["mean equals (g₁ + g₂) / 2", rel(gm, lin(g1, g2).map(v => v / 2)) === 0 ? "yes, exactly" : "no"], ["zero entries", V[vi][1].filter(v => v === 0).length]]);
  };
  ctl.querySelectorAll("button[data-b5v]").forEach(b => b.onclick = () => { vi = +b.dataset.b5v; u(); });
  u();
}},

{s: "6. Activation derivatives from the cache", t: "ReLU, tanh and sigmoid each bring their own local factor",
intu: String.raw`The only line of the backward pass that depends on the activation is the elementwise factor \(g'(Z^{[1]})\), and Ng's trick is to read it from values the forward pass already stored. For ReLU it is the mask, 1 where z was positive. For tanh it is \(1 - a^2\) and for the sigmoid \(a(1 - a)\), both computed from the cached activation without another exponential. Switch the hidden activation on the same weights and batch. The curve shows \(g'(z)\) with the six cached pre-activations marked. ReLU passes the gradient untouched where a unit is on. Tanh passes almost nothing through unit 2 of example 1, whose z = 3 sits far out on the flat part, 0.0099. The sigmoid never passes more than a quarter. HW10 C1 plots these same derivatives with autograd, and Lesson 34 turns this card into the choice of activation.`,
eq: String.raw`\[ \text{ReLU: } g' = \mathbf{1}[z \gt 0], \qquad \tanh: g' = 1 - a^2 \]
\[ \sigma: g' = a(1 - a) \le 0.25 \]`,
sym: [[String.raw`\(a = g(z)\)`, "the cached activation"], [String.raw`\(g'(z)\)`, "local derivative of the activation, the factor the gradient is multiplied by"], [String.raw`\(\sigma\)`, "the sigmoid, its derivative peaks at 0.25 when z = 0"], ["saturation", "a region where g′ is close to 0, so almost no gradient passes"]],
how: ["Keep A⁽¹⁾ (or Z⁽¹⁾ for ReLU) from the forward pass.", "Compute g′ elementwise from the cached values.", "Multiply dA⁽¹⁾ by g′ to get dZ⁽¹⁾.", "Look for entries near 0, the gradient dies there."],
say: String.raw`The activation enters the backward pass only through its derivative, which for ReLU is the on or off mask, for tanh is one minus the activation squared and for the sigmoid is the activation times one minus itself, all read from the forward cache.`,
num: String.raw`ReLU: masks (0, 1, 1) and (0, 0, 1), J = 0.625, ‖dW⁽¹⁾‖ = 1.8708. tanh: g′ for example 1 = (0.7864, <b>0.0099</b>, 0.4200), J = 2.4132, ‖dW⁽¹⁾‖ = 3.5694. Sigmoid: largest g′ 0.2350, J = 0.7908, ‖dW⁽¹⁾‖ = <b>0.6028</b>.`,
note: String.raw`An exam asks for the sigmoid derivative in terms of its output: a(1 − a), so a unit at a = 0.9 passes 0.09 of the gradient. Writing σ(z)(1 − σ(z)) is correct but loses the point that the cache already holds a.`,
r(fig, ctl) {
  const AN = [["relu", "ReLU"], ["tanh", "tanh"], ["sigmoid", "sigmoid"]];
  ctl.innerHTML = btns(AN.map((a, i) => [i, a[1]]), "b6a") + `<div id="b6o"></div>`;
  let ai = 1;
  const u = () => {
    pick(ctl, "b6a", ai);
    const an = AN[ai][0], r = fb(N, [0, 1], an), gd = ACT[an][1], g = ACT[an][0];
    const ax = ML.axes(60, 24, 330, 190, { xmin: -3, xmax: 3, ymin: 0, ymax: 1, nx: 6, ny: 4, fy: v => f(v, 2), xl: "z", yl: "g′(z)" });
    let pts = []; for (let i = 0; i <= 240; i++) { const z = -3 + 6 * i / 240; pts.push([ax.X(z), ax.Y(gd(z, g(z)))]); }
    let s = ax.s + ML.path(pts, C.purple, 2);
    const cols = [C.blue, C.coral];
    r.Z1.forEach((row, i) => row.forEach((z, j) => { const zc = Math.max(-3, Math.min(3, z)); s += `<circle cx="${ax.X(zc)}" cy="${ax.Y(r.GP[i][j])}" r="5" fill="${cols[i]}" stroke="var(--panel)"/>` + tx(ax.X(zc) + 6, ax.Y(r.GP[i][j]) - 6 - i * 10, "u" + (j + 1)); }));
    s += tx(420, 34, "g′ at the cached z, by unit", null, "th");
    r.GP.forEach((row, i) => row.forEach((v, j) => {
      const y = 48 + j * 52 + i * 20;
      s += tx(420, y + 12, "ex " + (i + 1) + ", unit " + (j + 1)) + `<rect x="505" y="${y + 2}" width="${110 * v}" height="14" fill="${cols[i]}" opacity="0.85"/>` + `<rect x="505" y="${y + 2}" width="110" height="14" fill="none" stroke="var(--line)"/>` + tx(620, y + 13, f(v, 4));
    }));
    s += `<circle cx="70" cy="266" r="5" fill="${C.blue}"/>` + tx(80, 270, "example 1") + `<circle cx="170" cy="266" r="5" fill="${C.coral}"/>` + tx(180, 270, "example 2, points beyond ±3 drawn at the edge");
    fig.innerHTML = svg(280, s);
    $("b6o").innerHTML = RO([["outputs ŷ", vec(r.yh, 4)], ["J", f(r.L)], ["‖dW⁽¹⁾‖", f(nrm(r.dW1.flat()))], ["largest g′", f(Math.max(...r.GP.flat()))]]);
  };
  ctl.querySelectorAll("button[data-b6a]").forEach(b => b.onclick = () => { ai = +b.dataset.b6a; u(); });
  u();
}},

{s: "7. Gradient checking", t: "Compare backprop with central differences, Ng's relative difference",
intu: String.raw`Backprop code can be wrong in ways that still train, so Ng's course 2 week 1 adds a check: nudge each of the 13 parameters by ±ε, take the central difference of the cost, stack the 13 numbers into a vector and compare it with the backprop gradient by the relative difference below. Below about 1e-7 the gradient is right, near 1e-5 look carefully, above 1e-3 there is almost certainly a bug. Move ε. On this network the check gives about 1e-15 at ε = 0.1 and gets worse as ε shrinks, because rounding error in the two nearly equal costs grows like 1/ε. Now switch to the setting near a kink, where unit 1's bias is 0.999 so its z for example 1 is −0.001. Any ε larger than about 0.0005 pushes that unit across its kink, the cost is no longer smooth inside the nudge, and the check reports 0.04 to 0.11 even though backprop is correct. Ng's rules: check with a few points, not during training, include the regularization term, and switch dropout off.`,
eq: String.raw`\[ d\theta_{\text{approx},i} = \frac{J(\boldsymbol\theta + \varepsilon\,\mathbf{e}_i) - J(\boldsymbol\theta - \varepsilon\,\mathbf{e}_i)}{2\varepsilon} \]
\[ \text{difference} = \frac{\lVert d\theta_{\text{approx}} - d\theta \rVert_2}{\lVert d\theta_{\text{approx}} \rVert_2 + \lVert d\theta \rVert_2} \]`,
sym: [[String.raw`\(d\theta\)`, "the backprop gradient, all parameters stacked into one vector"], [String.raw`\(d\theta_{\text{approx}}\)`, "the central difference estimate, two cost evaluations per parameter"], [String.raw`\(\varepsilon\)`, "the nudge, Ng uses 1e-7 in float64"], [String.raw`\(\lVert\cdot\rVert_2\)`, "Euclidean norm of the vector"], ["kink", "a point where the cost is not differentiable, here z = 0 of a ReLU unit"]],
how: ["Flatten all parameters into one vector θ.", "For each i, evaluate J at θ + εeᵢ and θ − εeᵢ in float64.", "Divide the difference by 2ε.", "Compute the relative difference with the backprop vector.", "Read it against 1e-7, 1e-5 and 1e-3."],
say: String.raw`Gradient checking compares the backprop gradient with a central difference estimate through the relative difference of the two vectors, which should be around 1e-7 or smaller for correct code in float64.`,
num: String.raw`Correct backprop: 3.6e-16 at ε = 0.1, 8.8e-13 at 1e-4, 3.1e-10 at 1e-7. Near the kink: <b>0.108</b> at ε = 0.1, 0.0386 at 1e-3, back to 8.8e-13 at 1e-4.`,
note: String.raw`Run a gradient check once on a tiny network and batch after writing any backward pass by hand (the agent card asks for it), in float64. In float32 the rounding floor is about 1e-4, which hides small bugs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b7e", "log₁₀ ε", -9, -1, 0.5, -4) + btns([[0, "this lesson's weights"], [1, "unit 1 near its kink, b¹₁ = 0.999"]], "b7k") + `<div id="b7o"></div>`;
  let kk = 0; const CUR = {};
  const P0 = flatP(N), PK = P0.slice(); PK[6] = 0.999;
  const curve = t => { const ga = flatG(fb(unflat(t), [0, 1])), out = []; for (let e = -9; e <= -1.0001 + 1e-9; e += 0.25) out.push([e, rel(numGrad(t, 10 ** e), ga)]); out.push([-1, rel(numGrad(t, 0.1), ga)]); return out; };
  const u = () => {
    pick(ctl, "b7k", kk);
    const t = kk ? PK : P0, e = +$("b7e").value, eps = 10 ** e; $("b7ev").textContent = "ε = " + g4(eps);
    if (!CUR[kk]) CUR[kk] = curve(t);
    const ga = flatG(fb(unflat(t), [0, 1])), gn = numGrad(t, eps), rd = rel(gn, ga);
    const ax = ML.axes(70, 20, 560, 200, { xmin: -9, xmax: -1, ymin: -17, ymax: 0, nx: 8, ny: 17 / 1, fx: v => "1e" + mn(v), fy: v => v % 2 ? "" : "1e" + mn(v), xl: "ε", yl: "relative difference" });
    let s = `<rect x="70" y="${ax.Y(-7)}" width="560" height="${ax.Y(-17) - ax.Y(-7)}" fill="var(--teal-bg)" opacity="0.6"/><rect x="70" y="${ax.Y(-3)}" width="560" height="${ax.Y(-5) - ax.Y(-3)}" fill="var(--purple-bg)" opacity="0.5"/><rect x="70" y="${ax.Y(0)}" width="560" height="${ax.Y(-3) - ax.Y(0)}" fill="var(--coral-bg)" opacity="0.6"/>` + ax.s;
    s += tx(625, ax.Y(-8), "below 1e-7: right", "end") + tx(625, ax.Y(-4) + 4, "near 1e-5: look", "end") + tx(625, ax.Y(-1.5) + 4, "above 1e-3: bug", "end");
    s += ML.path(CUR[kk].map(([x, y]) => [ax.X(x), ax.Y(Math.max(-17, Math.log10(Math.max(y, 1e-17))))]), kk ? C.coral : C.blue, 2.2);
    s += `<circle cx="${ax.X(e)}" cy="${ax.Y(Math.max(-17, Math.log10(Math.max(rd, 1e-17))))}" r="6" fill="${C.purple}" stroke="var(--panel)" stroke-width="1.5"/>`;
    let worst = 0; gn.forEach((v, i) => { if (Math.abs(v - ga[i]) > Math.abs(gn[worst] - ga[worst])) worst = i; });
    fig.innerHTML = svg(254, s);
    $("b7o").innerHTML = RO([["relative difference", g4(rd)], ["verdict", rd < 1e-7 ? "right" : rd < 1e-3 ? "look carefully" : "bug or kink"], ["worst parameter", PNAME[worst] + ": " + g4(gn[worst]) + " against " + g4(ga[worst])], ["z of unit 1, example 1", f(fb(unflat(t), [0]).Z1[0][0], 3)]]);
  };
  $("b7e").oninput = u; ctl.querySelectorAll("button[data-b7k]").forEach(b => b.onclick = () => { kk = +b.dataset.b7k; u(); });
  u();
}},

{s: "8. One step downhill", t: "Use the gradient: the loss after one gradient descent step",
intu: String.raw`A gradient is only useful if stepping against it lowers the loss. Move the learning rate and every one of the 13 parameters takes the step \(\boldsymbol\theta - \alpha\,\nabla J\) at once. The purple curve is the real cost after the step. The dashed line is the first-order prediction \(J - \alpha\lVert\nabla J\rVert^2\), the tangent at α = 0, which is what the gradient promises for small steps. For α up to about 0.01 the two agree. The real curve then bends up because the cost is curved, reaches its lowest value 0.0186 near α = 0.128 and is back above the start at α = 0.3. The tangent keeps falling forever, which is why a learning rate can be too large even though the gradient is exact. The kinks along the curve are ReLU units switching on or off as the weights move.`,
eq: String.raw`\[ \boldsymbol\theta_{\text{new}} = \boldsymbol\theta - \alpha\,\nabla J(\boldsymbol\theta) \]
\[ J(\boldsymbol\theta_{\text{new}}) \approx J(\boldsymbol\theta) - \alpha\,\lVert \nabla J(\boldsymbol\theta) \rVert^2 \]`,
sym: [[String.raw`\(\alpha\)`, "learning rate"], [String.raw`\(\lVert\nabla J\rVert^2\)`, "squared length of the gradient, 10.5 here"], ["first-order prediction", "the tangent line, exact only in the limit of small α"], ["kink", "a point where a ReLU unit changes state as the weights move"]],
how: ["Compute the gradient by backprop.", "Update every parameter at once with the same α.", "Run the forward pass again to get the new cost.", "Compare with J − α‖∇J‖².", "If the new cost is higher, α is too large."],
say: String.raw`A small step against the gradient lowers the cost by about the learning rate times the squared gradient norm, and the true decrease falls short of that prediction as the step grows because the cost surface is curved.`,
num: String.raw`J = 0.625, ‖∇J‖² = 10.5. α = 0.01: real <b>0.5253</b>, predicted 0.52. α = 0.05: real 0.2250, predicted 0.10. α = 0.1: real 0.0427. Best α about 0.128, J = 0.0186. α = 0.3: real 0.6517, worse than the start.`,
note: String.raw`HW5 and Lesson 16 found the stable learning rate range on a quadratic cost. A network's cost is not quadratic, but the same picture holds locally, and the comparison with the tangent is a quick way to see whether a step is in the linear range.`,
r(fig, ctl) {
  ctl.innerHTML = sl("b8a", "learning rate α", 0, 0.3, 0.005, 0.05) + `<div id="b8o"></div>`;
  const t0 = flatP(N), g = flatG(fb(N, [0, 1])), g2 = nrm(g) ** 2, J0 = fb(N, [0, 1]).L;
  const Jat = a => fb(unflat(t0.map((v, i) => v - a * g[i])), [0, 1]).L;
  const CV = []; for (let i = 0; i <= 300; i++) CV.push([i / 1000, Jat(i / 1000)]);
  const u = () => {
    const a = +$("b8a").value; $("b8av").textContent = f(a, 3);
    const ax = ML.axes(70, 20, 540, 200, { xmin: 0, xmax: 0.3, ymin: 0, ymax: 0.8, nx: 6, ny: 4, fx: v => f(v, 2), fy: v => f(v, 1), xl: "learning rate α", yl: "cost after one step" });
    let s = ax.s + ML.path(CV.map(([x, y]) => [ax.X(x), ax.Y(y)]), C.purple, 2.4);
    s += ML.path([[ax.X(0), ax.Y(J0)], [ax.X(J0 / g2), ax.Y(0)]], C.gray, 1.6, "6 4") + `<line x1="70" y1="${ax.Y(J0)}" x2="610" y2="${ax.Y(J0)}" stroke="var(--line)" stroke-dasharray="2 3"/>` + tx(604, ax.Y(J0) - 5, "start 0.625", "end");
    const Ja = Jat(a), pr = J0 - a * g2;
    s += `<line x1="${ax.X(a)}" y1="20" x2="${ax.X(a)}" y2="220" stroke="${C.coral}" stroke-dasharray="3 3"/><circle cx="${ax.X(a)}" cy="${ax.Y(Ja)}" r="6" fill="${C.coral}"/>` + (pr >= 0 ? `<circle cx="${ax.X(a)}" cy="${ax.Y(pr)}" r="5" fill="none" stroke="${C.gray}" stroke-width="2"/>` : "");
    s += tx(ax.X(0.062) + 4, ax.Y(0.035), "tangent J − α‖∇J‖²", null);
    fig.innerHTML = svg(254, s);
    $("b8o").innerHTML = RO([["cost after the step", f(Ja)], ["first-order prediction", f(pr)], ["change", fm(Ja - J0)], ["verdict", Ja < J0 ? "the step helped" : "too large, cost went up"]]);
  };
  $("b8a").oninput = u; u();
}},

{s: "9. PyTorch does the same", t: "Autograd reproduces every hand number",
intu: String.raw`Load the same weights into <code>nn.Sequential(nn.Linear(2, 3), nn.ReLU(), nn.Linear(3, 1))</code>, call <code>loss.backward()</code> and print the gradients. Every number of card 4 comes back. Two details connect the conventions. PyTorch stores examples as rows, so its weight gradients are the same matrices but its hidden error is the transpose. And because <code>mse_loss</code> takes the mean, the gradient PyTorch sends into the hidden pre-activations already contains the 1/m: the 2 in example 2's column of \(dZ^{[1]}\) arrives as 1. Intermediate tensors do not keep their <code>.grad</code> unless you call <code>retain_grad()</code>, which is how HW10 C2 probed one softmax output. The graph view walks <code>grad_fn</code> from the loss back to the weights: the same nodes you differentiated by hand, recorded during the forward pass and run in reverse.`,
eq: String.raw`\[ \frac{\partial J}{\partial Z_{\text{torch}}} = \frac{1}{m}\big(dZ^{[1]}\big)^\top \]
\[ \texttt{weight.grad} = dW^{[l]}, \qquad \texttt{bias.grad} = d\mathbf{b}^{[l]} \]`,
sym: [[String.raw`\(Z_{\text{torch}}\)`, "the hidden pre-activations in PyTorch's row layout, (m, 3)"], [String.raw`\(\texttt{retain\_grad()}\)`, "keeps .grad on a tensor that is not a leaf"], [String.raw`\(\texttt{grad\_fn}\)`, "the backward node that created a tensor, MseLossBackward0, AddmmBackward0, ReluBackward0"], ["AccumulateGrad", "the node that adds a gradient into a leaf parameter's .grad"]],
how: ["Build the model and copy the hand weights in without recording gradients.", "Run the forward pass and ask z1 to keep its gradient if you want to read it.", "Call loss.backward().", "Compare each .grad with the hand values.", "Check the reduction: mean divides by m, sum does not."],
say: String.raw`Autograd records the forward operations as a graph of backward nodes and runs them in reverse on loss.backward(), producing in each parameter's .grad exactly the gradient that backpropagation by hand gives.`,
num: String.raw`Loss 0.625, output weight grad (0, 1.5, −2), bias −0.5, z1.grad rows <b>(0, 0.5, −0.5) and (0, 0, 1)</b>, first-layer weight grad rows (0, 0), (0.5, 1), (−1.5, 0). With reduction='sum': loss 1.25, gradients doubled.`,
note: String.raw`Before trusting a custom layer or loss in the project, compare its .grad with a hand or finite difference value on a tiny input, exactly as here.`,
r(fig, ctl) {
  const head = ["import torch", "from torch import nn", "model = nn.Sequential(nn.Linear(2, 3), nn.ReLU(), nn.Linear(3, 1))", "with torch.no_grad():", "    model[0].weight.copy_(torch.tensor([[1., -1.], [2., 1.], [-1., .5]]))", "    model[0].bias.copy_(torch.tensor([.5, -1., 1.]))", "    model[2].weight.copy_(torch.tensor([[1., 1., -1.]]))", "    model[2].bias.fill_(.5)", "X = torch.tensor([[1., 2.], [-1., 1.]])", "Y = torch.tensor([[2.], [-1.]])"];
  const V = [
    ["autograd gradients", ["z1 = model[0](X)", "z1.retain_grad()", "loss = nn.functional.mse_loss(model[2](model[1](z1)), Y)", "loss.backward()", "print(loss.item())", "print(model[2].weight.grad, model[2].bias.grad)", "print(z1.grad)", "print(model[0].weight.grad)", "print(model[0].bias.grad)"], 11,
      ["0.625", "tensor([[ 0.0000,  1.5000, -2.0000]]) tensor([-0.5000])", "tensor([[ 0.0000,  0.5000, -0.5000],", "        [ 0.0000,  0.0000,  1.0000]])", "tensor([[ 0.0000,  0.0000],", "        [ 0.5000,  1.0000],", "        [-1.5000,  0.0000]])", "tensor([0.0000, 0.5000, 0.5000])"],
      "Every gradient equals card 4. z1.grad is (dZ⁽¹⁾)ᵀ / m: the column (0, 0, 2) of example 2 arrives as (0, 0, 1)."],
    ["without retain_grad", ["z1 = model[0](X)", "loss = nn.functional.mse_loss(model[2](model[1](z1)), Y)", "loss.backward()", "print(z1.grad)"], 13,
      ["UserWarning: The .grad attribute of a Tensor that is not a leaf Tensor", "is being accessed. Its .grad attribute won't be populated during", "autograd.backward(). If you indeed want the .grad field to be populated", "for a non-leaf Tensor, use .retain_grad() on the non-leaf Tensor. ...", "None"],
      "Backward still ran and the parameters got their .grad. Intermediate gradients are freed as soon as they are used, unless retain_grad() asks to keep them."],
    ["reduction='sum'", ["loss = nn.functional.mse_loss(model(X), Y, reduction='sum')", "loss.backward()", "print(loss.item())", "print(model[2].weight.grad)", "print(model[0].weight.grad)"], 10,
      ["1.25", "tensor([[ 0.,  3., -4.]])", "tensor([[ 0.,  0.],", "        [ 1.,  2.],", "        [-3.,  0.]])"],
      "The sum of the two example losses, so every gradient is m = 2 times the mean version, the sum view of card 5."],
    ["the recorded graph", ["loss = nn.functional.mse_loss(model(X), Y)", "fn = loss.grad_fn", "while fn is not None:", "    print(type(fn).__name__, [type(g).__name__ for g, _ in fn.next_functions if g])", "    fn = next((g for g, _ in fn.next_functions if g and 'Backward' in type(g).__name__ and type(g).__name__ != 'TBackward0'), None)"], 13,
      ["MseLossBackward0 ['AddmmBackward0']", "AddmmBackward0 ['AccumulateGrad', 'ReluBackward0', 'TBackward0']", "ReluBackward0 ['AddmmBackward0']", "AddmmBackward0 ['AccumulateGrad', 'TBackward0']"],
      "Read from the top: the loss, the output layer (bias, ReLU input, transposed weight), the ReLU, the first layer. AccumulateGrad writes into a bias .grad, TBackward0 leads to a weight. These are the nodes of card 2 run in reverse."]];
  ctl.innerHTML = btns(V.map((v, i) => [i, v[0]]), "b9v") + `<div id="b9o"></div>`;
  let vi = 0;
  const u = () => {
    pick(ctl, "b9v", vi);
    const [nm, body, cur, out, note] = V[vi];
    fig.innerHTML = ML.code(head.concat(body), cur) + ML.term(out) + `<p class="note">${note}</p>`;
    $("b9o").innerHTML = RO([["view", nm], ["matches card 4", vi === 2 ? "times 2" : vi === 3 ? "graph only" : "yes"], ["torch", "2.15, CPU, float32"]]);
  };
  ctl.querySelectorAll("button[data-b9v]").forEach(b => b.onclick = () => { vi = +b.dataset.b9v; u(); });
  u();
}},

{s: "10. Train with your own backprop", t: "A 1-8-1 network fitted by the six equations",
intu: String.raw`Backprop by hand is not only for exams. This card trains a network with eight ReLU units on 40 fresh points of a noisy sine using exactly the equations of card 3, written in plain JavaScript, full batch, learning rate 0.05. Press the buttons. The first step drops the cost from 1.1664 to 0.8912, after 100 steps the fit has the rough shape, and by 1,000 steps it sits at 0.0153, close to the noise level of the data (the noise variance is 0.01). Each orange tick on the axis is a kink, where a unit's \(w_j x + b_j\) crosses zero, and you can watch the kinks slide to where the curve needs to bend. The same loop in PyTorch with SGD, starting from the same weights, gives 0.015276 after 1,000 steps against 0.015276 here, so the hand-written backward pass and autograd agree.`,
eq: String.raw`\[ \hat y = \sum_{j=1}^{8} v_j\,\text{ReLU}(w_j x + b_j) + c, \qquad J = \frac{1}{40}\sum_{i=1}^{40} (\hat y_i - y_i)^2 \]
\[ \frac{\partial J}{\partial w_j} = \frac{1}{40}\sum_i 2(\hat y_i - y_i)\,v_j\,\mathbf{1}[z_{ij} \gt 0]\,x_i \]`,
sym: [[String.raw`\(w_j, b_j\)`, "first layer weight and bias of unit j, its kink sits at x = −b/w"], [String.raw`\(v_j, c\)`, "output weights and bias"], [String.raw`\(z_{ij}\)`, "pre-activation of unit j on example i"], ["noise level", "the targets carry N(0, 0.1²) noise, so a cost near 0.01 is as good as it gets"]],
how: ["Forward pass on all 40 points, keep z and a.", "dz₂ = 2(ŷ − y) for each point.", "Output layer: dv = Aᵀdz₂ / m, dc = mean of dz₂.", "Hidden: dZ = dz₂ vᵀ times the mask.", "First layer: dw and db from dZ and x, over m.", "Update all parameters and repeat."],
say: String.raw`A network trains by repeating the forward pass, the backward pass and the update, and a hand-written backward pass that passes a gradient check gives the same training curve as autograd.`,
num: String.raw`Cost <b>1.1664</b> at step 0, 0.8912 after 1, 0.3920 after 10, 0.1242 after 100, <b>0.0153</b> after 1,000, 0.0141 after 5,000. Predicting the mean gives 0.5203. PyTorch float32: 1.166364, 0.015276, 0.014074.`,
note: String.raw`For the project, this is the reason to trust autograd: you have now seen one backward pass written out and matched. You will not write backprop by hand there, but you will read gradient norms and kinks when training stalls.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="b10a">+1 step</button><button id="b10b">+10</button><button id="b10c">+100</button><button id="b10d">+1,000</button><button id="b10r">Reset</button></div><div id="b10o"></div>`;
  let S, t, hist;
  const reset = () => { S = { w: TI.w.slice(), b: TI.b.slice(), v: TI.v.slice(), c: TI.c }; t = 0; hist = [[0, trainStep(S, 0)]]; };
  const run = n => { for (let i = 0; i < n && t < 6000; i++) { trainStep(S, 0.05); t++; if (t <= 10 || t % 10 === 0) hist.push([t, trainStep(S, 0)]); } u(); };
  const u = () => {
    const L = trainStep(S, 0);
    const ax = ML.axes(60, 20, 360, 200, { xmin: -2, xmax: 2, ymin: -1.5, ymax: 1.5, nx: 4, ny: 6, fy: v => f(v, 1), xl: "x", yl: "y" });
    let s = ax.s; TX.forEach((x, i) => { s += `<circle cx="${ax.X(x)}" cy="${ax.Y(TY[i])}" r="3.5" fill="${C.gray}" opacity="0.8"/>`; });
    const pts = []; for (let i = 0; i <= 200; i++) { const x = -2 + 4 * i / 200; pts.push([ax.X(x), ax.Y(Math.max(-1.5, Math.min(1.5, predict(S, x))))]); }
    s += ML.path(pts, C.purple, 2.4);
    S.w.forEach((w, j) => { const k = -S.b[j] / w; if (k > -2 && k < 2) s += `<line x1="${ax.X(k)}" y1="214" x2="${ax.X(k)}" y2="226" stroke="${C.amber}" stroke-width="2.5"/>`; });
    const bx = ML.axes(475, 20, 185, 200, { xmin: 0, xmax: 4, ymin: -2, ymax: 0.5, nx: 4, ny: 5, fx: v => v ? "1e" + v : "0", fy: v => Number.isInteger(+v.toFixed(6)) ? (Math.round(v) ? "1e" + mn(Math.round(v)) : "1") : "", xl: "step + 1, log", grid: false });
    s += bx.s + ML.path(hist.map(([k, l]) => [bx.X(Math.log10(k + 1)), bx.Y(Math.max(-2, Math.log10(l)))]), C.coral, 2) + `<line x1="470" y1="${bx.Y(-2)}" x2="660" y2="${bx.Y(-2)}" stroke="${C.teal}" stroke-dasharray="4 3"/>` + tx(655, bx.Y(-2) - 4, "noise 0.01", "end");
    fig.innerHTML = svg(262, s);
    $("b10o").innerHTML = RO([["step", t.toLocaleString("en-US")], ["cost J", f(L)], ["predict the mean", "0.5203"], ["kinks inside [−2, 2]", S.w.filter((w, j) => Math.abs(S.b[j] / w) < 2).length + " of 8"]]);
  };
  reset();
  $("b10a").onclick = () => run(1); $("b10b").onclick = () => run(10); $("b10c").onclick = () => run(100); $("b10d").onclick = () => run(1000); $("b10r").onclick = () => { reset(); u(); };
  u();
}},

{s: "11. Vanishing and exploding gradients", t: "Thirty layers multiply thirty local factors",
intu: String.raw`Backprop multiplies the gradient by \(g'(\mathbf{z}^{[l]})\) and by \(W^{[l]\top}\) once per layer, so depth turns a product of moderate factors into a tiny or a huge number. This card runs a real chain of 30 layers, each a 16 by 16 matrix of standard normals scaled by \(s/\sqrt{16}\), on 32 random inputs. It plots the size of the activations going forward and the size of the gradient \(dJ/d\mathbf{a}^{[l]}\) arriving at each layer from a random gradient at the top. With ReLU and s = 1 each layer passes back about \(1/\sqrt2\) of the gradient, so only 1.1e-5 of it reaches the input side and the first layers barely move. The sigmoid's derivative is at most 0.25, and 6.8e-20 survives. With ReLU and \(s = \sqrt2\) both curves stay level, the He initialization of Lesson 34, and s = 2 explodes. The forward curve moves with the backward one, so a bad scale is visible in the activations before training starts. HW10 D1's chain of 8 blocks, 1e-8 plain against 2.1436 residual, is the one-number version.`,
eq: String.raw`\[ d\mathbf{a}^{[l-1]} = W^{[l]\top}\big(d\mathbf{a}^{[l]} \odot g'(\mathbf{z}^{[l]})\big) \]
\[ \lVert d\mathbf{a}^{[0]} \rVert \approx \lVert d\mathbf{a}^{[L]} \rVert \prod_{l=1}^{L} \gamma_l, \qquad \gamma_l \approx s\,\sqrt{\mathbb{E}[g'^2]} \]`,
sym: [[String.raw`\(s\)`, "weight scale, every entry of W has standard deviation s / √n"], [String.raw`\(d\mathbf{a}^{[l]}\)`, "gradient of the cost with respect to the activations of layer l"], [String.raw`\(\gamma_l\)`, "how much one layer scales the gradient on average"], [String.raw`\(\mathbb{E}[g'^2]\)`, "average squared activation derivative, 1/2 for ReLU, at most 1/16 for the sigmoid"], ["L", "depth, up to 30 layers of width 16 here, no biases"]],
how: ["Pick an activation and a weight scale.", "Run the forward pass through all layers and keep the cache.", "Send a random gradient back from the top layer.", "Record the size of the gradient at every layer.", "Read the ratio between the input side and the top."],
say: String.raw`Because backprop multiplies one factor per layer, gradients shrink or grow exponentially with depth unless each layer's factor is close to one, which depends on both the activation derivative and the scale of the weights.`,
num: String.raw`Depth 30, gradient at layer 0 over the gradient at the top: ReLU s = 1 <b>1.1e-5</b>, ReLU s = √2 0.36, ReLU s = 2 1.2e4, tanh s = 1 0.14, sigmoid s = 1 <b>6.8e-20</b>, no activation s = 1 0.75.`,
note: String.raw`The fixes of the next lessons all target this product: ReLU instead of the sigmoid in hidden layers and He initialization (Lesson 34), BatchNorm and Adam (Lesson 35), residual connections (Lesson 37), and gradient clipping for the long products of RNNs (Lesson 39).`,
r(fig, ctl) {
  const AN = [["relu", "ReLU"], ["tanh", "tanh"], ["sigmoid", "sigmoid"], ["linear", "no activation"]], SC = [[0.5, "s = 0.5"], [1, "s = 1"], [Math.SQRT2, "s = √2"], [2, "s = 2"]];
  ctl.innerHTML = btns(AN.map((a, i) => [i, a[1]]), "b11a") + btns(SC.map((a, i) => [i, a[1]]), "b11s") + sl("b11d", "depth", 2, 30, 1, 30) + `<div id="b11o"></div>`;
  let ai = 0, si = 1;
  const u = () => {
    pick(ctl, "b11a", ai); pick(ctl, "b11s", si);
    const D = +$("b11d").value; $("b11dv").textContent = D;
    const key = AN[ai][0] + SC[si][0] + "_" + D; if (!DCACHE[key]) DCACHE[key] = depthRun(AN[ai][0], SC[si][0], D);
    const r = DCACHE[key], lg = v => Math.log10(Math.max(v, 1e-30)), gl = r.gN.map(lg), al = r.aN.map(lg);
    const lo = Math.min(-6, Math.floor(Math.min(...gl, ...al))), hi = Math.max(2, Math.ceil(Math.max(...gl, ...al)));
    const st = Math.ceil((hi - lo) / 10);
    const ax = ML.axes(70, 34, 560, 190, { xmin: 0, xmax: D, ymin: lo, ymax: hi, nx: Math.min(D, 10), ny: Math.round((hi - lo) / st), fx: v => Math.round(v), fy: v => "1e" + mn(Math.round(v)), xl: "layer l, the input is 0", yl: "size, log scale" });
    let s = ax.s + ML.path(al.map((v, l) => [ax.X(l), ax.Y(v)]), C.blue, 2) + ML.path(gl.map((v, l) => [ax.X(l), ax.Y(v)]), C.coral, 2.4);
    gl.forEach((v, l) => { s += `<circle cx="${ax.X(l)}" cy="${ax.Y(v)}" r="2.6" fill="${C.coral}"/>`; });
    s += `<rect x="80" y="12" width="12" height="4" fill="${C.blue}"/>` + tx(98, 18, "forward ‖a⁽ˡ⁾‖") + `<rect x="250" y="12" width="12" height="4" fill="${C.coral}"/>` + tx(268, 18, "backward ‖dJ/da⁽ˡ⁾‖, starts at the top layer");
    fig.innerHTML = svg(266, s);
    const back = r.gN[0] / r.gN[D], fwd = r.aN[D] / r.aN[0];
    $("b11o").innerHTML = RO([["backward, layer 0 / top", g4(back)], ["forward, top / input", g4(fwd)], ["per layer, backward", f(Math.pow(back, 1 / D), 3)], ["verdict", back < 1e-2 ? "vanishing" : back > 1e2 ? "exploding" : "healthy for this depth"]]);
  };
  ctl.querySelectorAll("button[data-b11a]").forEach(b => b.onclick = () => { ai = +b.dataset.b11a; u(); });
  ctl.querySelectorAll("button[data-b11s]").forEach(b => b.onclick = () => { si = +b.dataset.b11s; u(); });
  $("b11d").oninput = u; u();
}},

{s: "12. Bugs a gradient check catches", t: "Seven ways to get backprop wrong, and what each looks like",
intu: String.raw`Each button changes one line of a NumPy backward pass in Ng's column layout and runs the gradient check of card 7 on the two-example batch. Some numbers are worth remembering. A flipped sign gives a relative difference of exactly 1, and forgetting the 1/m gives exactly \((m - 1)/(m + 1)\), one third here. A missing ReLU mask gives 0.336 and updating \(W^{[2]}\) before using it in the backward pass gives 0.058, both well above 1e-3. Two bugs are about shapes. Multiplying by X instead of its transpose runs silently here only because this batch happens to be square, 2 examples of 2 features, and gives 0.548. With a third example NumPy raises the matmul error you see. Summing \(dZ^{[1]}\) over the wrong axis gives a (1, 2) bias gradient, and subtracting it from a (3, 1) bias broadcasts to a (3, 2) matrix without any error, so the check never even sees it unless you assert shapes.`,
eq: String.raw`\[ \text{sign flipped: } \frac{\lVert -g - g\rVert}{\lVert g\rVert + \lVert g\rVert} = 1, \qquad \text{no } \tfrac{1}{m}: \frac{(m-1)\lVert g\rVert}{(m+1)\lVert g\rVert} \]`,
sym: [["relative difference", "the number from card 7, compared with 1e-7"], ["silent bug", "code that runs and trains, only worse"], ["shape assertion", "assert dW.shape == W.shape after every gradient line"], ["square batch", "m equal to the number of features, which hides a missing transpose"]],
how: ["Pick a bug.", "Read the changed line in the code.", "Read the relative difference or the shape it produces.", "Ask whether the code would have crashed without the check.", "Add the assertion or test that catches it."],
say: String.raw`A gradient check catches wrong values such as a flipped sign, a missing mask or a missing average, and shape assertions catch the broadcasting and transpose bugs that a square test batch or NumPy broadcasting would hide.`,
num: String.raw`Relative differences: correct <b>6.6e-11</b>, missing mask 0.3359, missing 1/m 0.3333, flipped sign 1.0, W⁽²⁾ updated too early 0.0583, X not transposed 0.5480, wrong bias axis gives shape (3, 2) silently.`,
note: String.raw`Test hand-written backward passes with m different from every layer size, for example 3 examples of 2 features, so a missing transpose raises instead of passing.`,
r(fig, ctl) {
  const BASE = ["Z1 = W1 @ X + b1                       # (3, m)", "A1 = np.maximum(0, Z1)", "Yhat = W2 @ A1 + b2                     # (1, m)", "dZ2 = 2 * (Yhat - Y)", "dW2 = dZ2 @ A1.T / m", "db2 = dZ2.sum(axis=1, keepdims=True) / m", "dZ1 = (W2.T @ dZ2) * (Z1 > 0)", "dW1 = dZ1 @ X.T / m", "db1 = dZ1.sum(axis=1, keepdims=True) / m"];
  const B = [
    ["correct", null, -1, null],
    ["missing mask", "nomask", 6, "dZ1 = W2.T @ dZ2                        # mask forgotten"],
    ["missing 1/m", "nom", 4, "dW2 = dZ2 @ A1.T                        # and the same in db2, dW1, db1"],
    ["flipped sign", "sign", 3, "dZ2 = 2 * (Y - Yhat)"],
    ["W2 updated too early", "upd", 6, "W2 = W2 - lr * dW2; dZ1 = (W2.T @ dZ2) * (Z1 > 0)"],
    ["X not transposed", "tr", 7, "dW1 = dZ1 @ X / m"],
    ["wrong bias axis", "axis", 8, "db1 = dZ1.sum(axis=0, keepdims=True) / m"]];
  ctl.innerHTML = btns(B.map((b, i) => [i, b[0]]), "b12b") + `<div id="b12o"></div>`;
  let bi = 1;
  const gn = numGrad(flatP(N), 1e-6);
  const u = () => {
    pick(ctl, "b12b", bi);
    const [nm, bug, ln, line] = B[bi], code = BASE.slice(); if (line) code[ln] = line;
    let out, rd = null, ga = null;
    if (bug === "axis") out = [">>> db1.shape", "(1, 2)", ">>> (b1 - lr * db1).shape      # b1 is (3, 1)", "(3, 2)", "no error: the bias silently becomes a (3, 2) matrix"];
    else {
      ga = flatG(fb(N, [0, 1], "relu", bug)); rd = rel(gn, ga);
      out = [">>> grad_check(params, X, Y)", "relative difference " + rd.toExponential(2) + (rd < 1e-7 ? "   ok" : "   FAIL, above 1e-3")];
      if (bug === "tr") out = out.concat(["", ">>> # the same line with 3 examples of 2 features", "ValueError: matmul: Input operand 1 has a mismatch in its core", "dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?)", "(size 2 is different from 3)"]);
    }
    let s = "";
    if (ga) {
      const ax = ML.axes(60, 16, 590, 120, { xmin: -0.5, xmax: 12.5, ymin: -3, ymax: 3, nx: 13, ny: 3, fx: () => "", fy: v => mn(+v.toFixed(0)), grid: false });
      s = ax.s + `<line x1="60" y1="${ax.Y(0)}" x2="650" y2="${ax.Y(0)}" stroke="var(--p)" stroke-width="0.8"/>`;
      gn.forEach((v, i) => {
        const c = q => Math.max(-3, Math.min(3, q));
        s += `<rect x="${ax.X(i) - 15}" y="${Math.min(ax.Y(0), ax.Y(c(v)))}" width="13" height="${Math.abs(ax.Y(c(v)) - ax.Y(0))}" fill="${C.teal}"/><rect x="${ax.X(i) + 1}" y="${Math.min(ax.Y(0), ax.Y(c(ga[i])))}" width="13" height="${Math.abs(ax.Y(c(ga[i])) - ax.Y(0))}" fill="${Math.abs(ga[i] - v) > 1e-6 ? C.coral : C.blue}"/>` + tx(ax.X(i), 152, PNAME[i], "middle");
      });
      s += `<rect x="70" y="164" width="12" height="10" fill="${C.teal}"/>` + tx(88, 173, "central difference") + `<rect x="230" y="164" width="12" height="10" fill="${C.coral}"/>` + tx(248, 173, "this backward pass, coral where it disagrees");
      s = svg(182, s);
    }
    fig.innerHTML = ML.code(code, ln) + ML.term(out) + s;
    $("b12o").innerHTML = RO([["bug", nm], ["relative difference", rd == null ? "not computable, shapes differ" : g4(rd)], ["crashes on its own", bug === "axis" || bug === "tr" ? "no, only with other shapes" : bug ? "no" : "nothing to crash"]]);
  };
  ctl.querySelectorAll("button[data-b12b]").forEach(b => b.onclick = () => { bi = +b.dataset.b12b; u(); });
  u();
}},

{s: "13. With the agent", t: "Do it with the agent: a NumPy backward pass with a gradient check",
intu: String.raw`The lesson as code: a two-layer network in NumPy with an explicit cache, Ng's six backward equations, a gradient check, and tests that pin the board numbers of card 4, compare with autograd and plant the bugs of card 12 to prove the check fails on them.`,
eq: String.raw`\[ \texttt{forward} \to \texttt{cache} \to \texttt{backward} \to \texttt{grad\_check} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{forward(params, X)}\)`, "returns Ŷ and the cache (Z1, A1), examples as columns"], [String.raw`\(\texttt{backward(params, cache, X, Y)}\)`, "the six equations, returns a dict of gradients"], [String.raw`\(\texttt{grad\_check}\)`, "central differences in float64 and Ng's relative difference"], ["tests", "card 4 numbers, autograd agreement, planted bugs, shapes, a training run"]],
how: ["Paste the command.", "Read backward: one line per equation, with a shape assertion after each.", "Check that the tests use m = 3 somewhere, so a missing transpose fails.", "Run pytest and read the relative differences it prints.", "Commit the module with its tests."],
say: String.raw`A tested backward pass is pinned by hand-computed gradients, agrees with autograd, passes a float64 gradient check and makes the check fail when a known bug is planted.`,
num: String.raw`Tests expect dW⁽¹⁾ rows <b>(0, 0), (0.5, 1), (−1.5, 0)</b>, dW⁽²⁾ (0, 1.5, −2), a relative difference below 1e-7, above 1e-3 with the mask removed, and a cost below 0.02 after 1,000 steps on card 10's data.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/backprop.py with numpy only, examples as columns as in Andrew Ng's course. init_params(sizes, seed) returns W1, b1, W2, b2 with b as column vectors. forward(params, X) returns Yhat and a cache with Z1 and A1, ReLU hidden layer and linear output. cost(Yhat, Y) is the mean squared error. backward(params, cache, X, Y) implements dZ2 = 2(Yhat - Y), dW2 = dZ2 A1.T / m, db2 = row sums / m, dZ1 = W2.T dZ2 * (Z1 > 0), dW1 = dZ1 X.T / m, db1 = row sums / m, and asserts that every gradient has the shape of its parameter. grad_check(params, X, Y, eps=1e-7) returns the relative difference norm(approx - grad) / (norm(approx) + norm(grad)) in float64. Create tests/test_backprop.py with pytest: (1) with W1 = [[1, -1], [2, 1], [-1, 0.5]], b1 = [0.5, -1, 1], W2 = [[1, 1, -1]], b2 = 0.5 and X columns (1, 2) and (-1, 1), Y = [[2, -1]], the cost is 0.625, dW1 is [[0, 0], [0.5, 1], [-1.5, 0]], db1 [0, 0.5, 0.5], dW2 [[0, 1.5, -2]], db2 -0.5. (2) For a random 5-7-3 network and 4 examples the gradients match torch autograd with mse_loss to 1e-6. (3) grad_check on that network is below 1e-7. (4) A backward with the ReLU mask removed (a flag) gives grad_check above 1e-3. (5) With 3 examples of 2 features the shapes of all gradients are right. (6) Training a 1-8-1 network by gradient descent at lr 0.05 on 40 points of sin 2x plus noise brings the cost below 0.02 within 1000 steps. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/backprop.py", "init_params, forward, cost, backward, grad_check"], ["tests/test_backprop.py", "six tests with the numbers of cards 4, 7, 10 and 12"]],
    checks: ["backward has one line per equation and a shape assertion for every gradient", "the board test gets dW1 rows (0, 0), (0.5, 1), (−1.5, 0) and db2 −0.5", "the autograd test uses torch.float64 or a tolerance of 1e-6, not a printed number", "the planted-bug test really removes the mask and expects a difference above 1e-3", "one test uses 3 examples of 2 features so a missing transpose would fail"]
  });
}},

{s: "14. Test", t: "Lesson 33 test: backpropagation by hand",
intu: String.raw`Twelve questions on the backward pass of a small network, shapes, per-example and batch gradients, activation derivatives, gradient checking, the first-order step, depth and PyTorch's conventions. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Draw the network and write the forward values first.", "Then go backward one node at a time.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to activations and initialization.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A 1-2-1 ReLU network has x = 2, \\(\\mathbf{w}^{[1]} = (1, -1)\\), \\(\\mathbf{b}^{[1]} = (-1, 3)\\), \\(\\mathbf{w}^{[2]} = (2, 1)\\), \\(b^{[2]} = 0\\), target y = 4 and loss \\((\\hat y - y)^2\\). What is \\(d\\ell/d\\mathbf{w}^{[2]}\\)?", o: ["(2, 1)", "(−2, −2)", "(−4, −2)", "(1, 1)"], a: 1, why: "z = (1, 1), a = (1, 1), ŷ = 3, dℓ/dŷ = 2(3 − 4) = −2, and dℓ/dw⁽²⁾ = −2 · a = (−2, −2). Card 2." },
    { q: "Same network and example. What is \\(d\\ell/d\\mathbf{w}^{[1]}\\)?", o: ["(−4, −2)", "(−2, −2)", "(−8, −4)", "(8, 4)"], a: 2, why: "dℓ/da = −2 · (2, 1) = (−4, −2), both units are on, so dℓ/dz = (−4, −2), and each weight gets dℓ/dz times x = 2: (−8, −4). Card 2." },
    { q: "Change the first bias to \\(\\mathbf{b}^{[1]} = (-3, 3)\\), everything else the same. Which parameters get a zero gradient?", o: ["none, every parameter moves", "only \\(b^{[2]}\\)", "unit 2's weight and bias", "unit 1's weight and bias, and the output weight that reads unit 1"], a: 3, why: "z = (−1, 1), so unit 1 is off: its mask blocks the gradient to w₁ and b₁, and its activation 0 makes dℓ/dw⁽²⁾₁ = dℓ/dŷ · 0 = 0. Cards 2 and 5." },
    { q: "Layer sizes \\(n^{[0]} = 5\\), \\(n^{[1]} = 6\\), \\(n^{[2]} = 4\\), batch m = 32, Ng's column layout. The shape of \\(dW^{[1]}\\) is", o: ["(6, 5)", "(6, 32)", "(5, 6)", "(32, 5)"], a: 0, why: "dW⁽¹⁾ = dZ⁽¹⁾Xᵀ / m is (6, 32) times (32, 5), the batch axis sums out: (6, 5), the shape of W⁽¹⁾. Card 3." },
    { q: "Four examples give per-example gradients 0.6, −0.2, 1.0 and 0.2 for one weight. With PyTorch's default mean loss the batch gradient is", o: ["1.6", "0.5", "0.4", "0.1"], a: 2, why: "The gradient of a mean is the mean of the gradients: 1.6 / 4 = 0.4. With reduction='sum' it would be 1.6. Card 5." },
    { q: "A sigmoid unit has cached activation a = 0.8 and receives \\(d\\ell/da = 0.5\\). What is \\(d\\ell/dz\\)?", o: ["0.08", "0.4", "0.16", "0.32"], a: 0, why: "g′ = a(1 − a) = 0.8 · 0.2 = 0.16, times 0.5 is 0.08. Card 6." },
    { q: "Backprop gives the gradient (1, 2) and central differences give (1, 2.1). Ng's relative difference is about", o: ["2.2e-7, fine", "0.1", "0.048", "0.022, a bug"], a: 3, why: "‖(0, 0.1)‖ / (‖(1, 2.1)‖ + ‖(1, 2)‖) = 0.1 / (2.326 + 2.236) = 0.0219, far above 1e-3. Card 7." },
    { q: "A backward pass forgets to divide by m in every gradient, with m = 4. The gradient check reports", o: ["0.25", "0.6", "0.75", "1.0"], a: 1, why: "Every gradient is 4 times too large: (4 − 1) / (4 + 1) = 0.6. Card 12." },
    { q: "A gradient check reports a relative difference of exactly 1.0. The most likely bug is", o: ["the gradient has the wrong sign", "a missing 1/m", "ε is too small", "a ReLU kink"], a: 0, why: "If the code returns −g, the difference is 2‖g‖ over 2‖g‖ = 1. Card 12." },
    { q: "The cost is 2.0 and \\(\\lVert\\nabla J\\rVert^2 = 5\\). After one step with α = 0.1 the first-order prediction of the new cost is", o: ["1.9", "1.0", "1.5", "2.5"], a: 2, why: "J − α‖∇J‖² = 2.0 − 0.1 · 5 = 1.5. The real cost is usually a little higher because the surface curves up. Card 8." },
    { q: "Ten sigmoid layers in a chain with all weights equal to 1. The gradient reaching the first layer is at most what fraction of the gradient at the top?", o: ["0.25", "about 0.1", "about 1e-3", "about 1e-6"], a: 3, why: "Each sigmoid multiplies by at most 0.25: 0.25¹⁰ = 9.5e-7. Card 11." },
    { q: "In PyTorch with mse_loss over a batch of m = 4, Ng's hidden error for one example is (2, 0, −4). Its row of <code>z1.grad</code> (with retain_grad) is", o: ["(2, 0, −4)", "(0.5, 0, −1)", "(8, 0, −16)", "None"], a: 1, why: "The mean puts 1/m into the gradient that reaches z1: (2, 0, −4) / 4 = (0.5, 0, −1). Card 9." }
  ], "Lesson 33 test");
}}
],
summary: String.raw`Backpropagation gets the gradient of the cost with respect to every parameter for about the price of three forward passes, against two passes per parameter for finite differences, because each intermediate derivative is computed once and reused. The forward pass keeps a cache of every z and a. The backward pass starts at the loss and multiplies the upstream gradient by one local derivative per node: a weight gradient is the gradient at the layer's output times the input it multiplied, a hidden gradient goes back through the transposed weights, and an activation multiplies by its derivative, the on or off mask for ReLU, \(1 - a^2\) for tanh and \(a(1 - a)\) for the sigmoid. In Ng's six vectorized equations every gradient has the shape of its parameter and the batch axis sums out, so the batch gradient is the mean of the per-example gradients. A float64 gradient check with Ng's relative difference, around 1e-7 or below, confirms the code, except near a ReLU kink. One step against the gradient lowers the cost by about \(\alpha\lVert\nabla J\rVert^2\) when α is small. PyTorch autograd reproduces every hand number. Through many layers the per-layer factors multiply, so gradients vanish or explode unless activations and weight scales keep each factor near one.`,
sheet: [[String.raw`\[ \frac{\partial J}{\partial \theta_i} \approx \frac{J(\boldsymbol\theta + \varepsilon\mathbf{e}_i) - J(\boldsymbol\theta - \varepsilon\mathbf{e}_i)}{2\varepsilon} \]`, "central difference, 2P forward passes"], [String.raw`\[ dZ^{[2]} = 2(\hat Y - Y) \quad\text{or}\quad A^{[2]} - Y \]`, "MSE with mean, or sigmoid and cross-entropy"], [String.raw`\[ dW^{[l]} = \tfrac{1}{m}\,dZ^{[l]}A^{[l-1]\top} \]`, "weight gradient, A⁽⁰⁾ = X, shape of W⁽ˡ⁾"], [String.raw`\[ d\mathbf{b}^{[l]} = \tfrac{1}{m}\textstyle\sum_{\text{cols}} dZ^{[l]} \]`, "bias gradient, sum over examples"], [String.raw`\[ dZ^{[l-1]} = W^{[l]\top}dZ^{[l]} \odot g'(Z^{[l-1]}) \]`, "error of the layer below"], [String.raw`\[ g'_{\text{ReLU}} = \mathbf{1}[z \gt 0], \quad g'_{\tanh} = 1 - a^2, \quad g'_{\sigma} = a(1 - a) \]`, "activation derivatives from the cache"], [String.raw`\[ \nabla J = \tfrac{1}{m}\textstyle\sum_i \nabla\ell^{(i)} \]`, "batch gradient is the mean of example gradients"], [String.raw`\[ \frac{\lVert d\theta_{\text{approx}} - d\theta\rVert_2}{\lVert d\theta_{\text{approx}}\rVert_2 + \lVert d\theta\rVert_2} \]`, "gradient check, below 1e-7 is right"], [String.raw`\[ J(\boldsymbol\theta - \alpha\nabla J) \approx J - \alpha\lVert\nabla J\rVert^2 \]`, "first-order decrease of one step"], [String.raw`\[ \lVert dW^{[1]}\rVert \approx \lVert dW^{[L]}\rVert\textstyle\prod_l \gamma_l \]`, "vanishing when γ is below 1, exploding when above 1"]],
sources: ["AME 5970 has no lecture notes for week 10, so the topic order follows the homework below", "AME 5970 HW8 Part 2B, questions and solutions docs: the shapes of a one-hidden-layer ReLU network, (N, 1) through (N, H) and back", "AME 5970 HW9 Problem 4B, questions and solutions docs: MLPDigits shapes and the algebra of removing the ReLU", "AME 5970 HW10 C1 and C2, questions and solutions docs: activation values and derivatives with autograd on a fresh leaf, the gradient of one softmax output with retain-free probing", "AME 5970 HW10 D1, questions and solutions docs: the derivative through a chain of 8 blocks, 1e-8 plain against 2.1436 residual", "Andrew Ng, Deep Learning Specialization, course 1 week 3: Gradient descent for neural networks, Backpropagation intuition, and week 4: Forward and backward propagation, Getting your matrix dimensions right", "Andrew Ng, Deep Learning Specialization, course 2 week 1: Vanishing and exploding gradients, Weight initialization for deep networks, Numerical approximation of gradients, Gradient checking, Gradient checking implementation notes", "Andrew Ng, Machine Learning Specialization, course 2 week 2 optional videos: Computation graph, Larger neural network example (roughly N + P steps instead of N times P)", "Stanford CS231n, Backpropagation, Intuitions, and the notes on vector, matrix and tensor derivatives", "A. Karpathy, Neural Networks: Zero to Hero, lecture 1 (micrograd) and lecture 4 (becoming a backprop ninja)", "I. Goodfellow, Y. Bengio and A. Courville, Deep Learning (2016), section 6.5, Back-propagation and other differentiation algorithms", "PyTorch 2.15 documentation: autograd mechanics, Tensor.retain_grad, torch.nn.functional.mse_loss"]
});
})();
