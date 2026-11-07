(function () {
/* ML shelf, Part 7, Lesson 32: The multilayer perceptron. The course has no lecture notes for week 10 (feedforward neural networks), so the order follows the homework: HW8 Part 2 (SimpleNN, a one-hidden-layer ReLU regressor with 3H + 1 parameters, widths 1 and 50), HW9 Problem 4B and 4C (LinearDigits against MLPDigits, 7,850 against 101,770 parameters, and what removing the ReLU does) and HW10 A2 (SmallClassifier, 418 parameters), with their questions and solutions docs. Andrew Ng's Machine Learning Specialization course 2 week 1 (neurons and layers, demand prediction, layer notation, forward propagation) and Deep Learning Specialization course 1 weeks 3 and 4 (vectorizing across examples, matrix dimensions, why activation functions, random initialization, why deep representations) are the spine. XOR follows Goodfellow, Bengio and Courville section 6.1. Backpropagation is left to Lesson 33 and the activation zoo and initialization scales to Lesson 34. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const sig = z => 1 / (1 + Math.exp(-z));
const relu = z => Math.max(0, z);
const TB = (head, rows) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
/* a node of a network diagram: colored circle, value inside, label below */
const NODE = { in: ["var(--gray-bg)", C.gray], hid: ["var(--blue-bg)", C.blue], out: ["var(--teal-bg)", C.teal], off: ["var(--sunk)", "var(--line)"], hot: ["var(--coral-bg)", C.coral] };
const node = (x, y, r, kind, inner, below) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${NODE[kind][0]}" stroke="${NODE[kind][1]}" stroke-width="1.4"/>` + (inner != null ? `<text class="t" x="${x}" y="${y + 5}" text-anchor="middle" style="font-family:var(--mono);font-size:13px">${mn(inner)}</text>` : "") + (below ? tx(x, y + r + 15, below, "middle") : "");
const edge = (x1, y1, x2, y2, w, lab, dim, at) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${w > 0 ? C.blue : w < 0 ? C.coral : "var(--line)"}" stroke-width="${dim ? 0.8 : Math.min(4, 0.9 + Math.abs(w) * 0.5)}" ${dim ? `stroke-dasharray="3 4"` : ""} opacity="${dim ? 0.6 : 0.85}"/>` + (lab != null ? `<text class="ts" x="${x1 + (x2 - x1) * (at || 0.5)}" y="${y1 + (y2 - y1) * (at || 0.5) - 4}" text-anchor="middle" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${mn(lab)}</text>` : "");
/* least squares by the normal equations, small systems only */
const solve = (A, b) => { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; } } return M.map((r, i) => r[n] / r[i]); };
const lstsq = (F, y) => { const p = F[0].length, A = Array.from({ length: p }, () => Array(p).fill(0)), b = Array(p).fill(0); F.forEach((r, i) => { for (let a = 0; a < p; a++) { b[a] += r[a] * y[i]; for (let c = 0; c < p; c++) A[a][c] += r[a] * r[c]; } }); return solve(A, b); };

/* Card 1: Ng's demand prediction with hand-set weights. Inputs on a 0 to 1 scale. */
const DEM = { names: ["price", "shipping", "marketing", "material"], hid: ["affordability", "awareness", "perceived quality"],
  W: [[-4, -3, 0, 0], [0, 0, 5, 0], [2, 0, 0, 4]], b: [3, -2, -3], v: [3, 2, 3], c: -4 };
/* Card 6 and 7: a fresh 2-3-1 ReLU network and a two-example batch */
const N6 = { W1: [[1, -1], [2, 1], [-1, 0.5]], b1: [0.5, -1, 1], w2: [1, 1, -1], b2: 0.5, X: [[1, 2], [-1, 1]], Y: [2, -1] };
const fwd6 = (x, act) => { const z1 = N6.W1.map((r, j) => r[0] * x[0] + r[1] * x[1] + N6.b1[j]), a1 = z1.map(z => act ? relu(z) : z), yh = a1.reduce((s, a, j) => s + a * N6.w2[j], N6.b2); return { z1, a1, yh }; };
/* Card 10: 200 fresh points, label 1 inside x1² + x2² < 1.6 with 5% of labels flipped, default_rng(3232), first 140 train, last 60 validation. RW holds 2-H-1 ReLU networks trained with BCEWithLogitsLoss and Adam (lr 0.03, 3000 full-batch steps, best of five seeds by training loss), weights rounded to 3 decimals. */
const RX = [[-1.14,-1.31],[1.65,-1.26],[0.55,-0.67],[0.61,-0.39],[-1.48,1.83],[1.91,0.38],[-1.77,1.94],[0.15,-1.47],[1.54,-0.71],[-1.11,-0.25],[-0.13,0.27],[-0.73,1.67],[1.01,1.45],[-0.04,0.08],[1.84,0.04],[-1.25,-0.63],[-0.72,0.04],[-1.06,0.23],[-0.27,-1.52],[0.3,-1.47],[0.24,-1.06],[0.99,-0.01],[0.73,0.65],[-1.32,-1.87],[1.86,-0.46],[0.29,-1.72],[1.31,0.98],[0.97,-1.93],[-1.33,1.59],[1.64,-1.83],[1.08,-0.78],[1.39,0.96],[-0.11,-1.32],[-0.81,0.94],[-1.35,1.72],[-1.22,-1.09],[-0.52,0.5],[0.95,1.18],[-1.2,-1.25],[0.71,-0.62],[-1.71,-1.25],[-1.37,-1.94],[-0.39,-1.51],[-1.79,-1.75],[0.85,-0.23],[1.98,-1.2],[-0.81,1.36],[1.24,1.92],[-0.27,-1.51],[0.37,0.37],[0.92,1.26],[-0.93,0.56],[-0.96,-0.13],[0.82,-1.38],[-0.01,0.44],[0.75,-1.86],[1.06,0.9],[-0.55,0.0],[0.98,0.1],[0.14,1.25],[-0.04,-0.87],[1.84,0.03],[1.39,1.4],[1.45,-1.57],[1.67,-0.65],[-0.62,-1.28],[0.17,1.42],[1.19,1.55],[0.34,-0.22],[0.5,-1.74],[-0.28,0.13],[1.79,1.77],[-1.04,1.32],[-1.72,-1.35],[-0.96,-0.4],[-0.76,0.95],[-1.06,0.53],[1.66,-1.49],[-1.59,1.5],[-1.96,-0.71],[1.74,0.47],[-0.01,-0.82],[1.95,-0.78],[-0.13,0.32],[0.75,0.68],[0.6,-0.1],[-1.67,-0.89],[-1.95,0.14],[0.09,-0.8],[0.64,1.51],[1.41,1.31],[0.09,1.69],[-1.92,1.68],[1.91,-0.65],[0.31,-0.16],[1.41,1.94],[-1.82,-1.14],[0.82,1.33],[-1.92,-1.56],[-0.81,0.49],[0.25,1.42],[1.42,1.85],[-0.55,1.21],[-0.03,-0.64],[-0.74,-0.66],[0.28,1.82],[-0.38,-0.64],[0.87,0.66],[-1.71,1.22],[-1.57,1.39],[-0.2,-1.23],[-0.79,-0.06],[-1.4,-0.62],[-0.72,-0.43],[1.12,-1.07],[0.52,-1.41],[-0.56,-1.65],[-1.77,-1.16],[-1.76,-1.06],[-1.24,-1.21],[0.06,1.11],[-1.9,1.41],[-1.08,1.75],[-1.97,-1.6],[-0.56,0.71],[1.69,-0.04],[-1.17,-1.2],[-1.4,1.25],[-0.39,-1.39],[1.97,-1.58],[1.66,1.48],[-0.77,0.22],[0.45,-0.86],[-1.75,-1.95],[0.82,-0.9],[-1.84,1.41],[-0.61,0.81],[-0.03,1.76],[-1.39,0.64],[-1.03,0.73],[1.46,1.85],[1.59,-0.62],[-0.56,-1.55],[1.03,1.48],[-0.0,0.34],[0.87,1.56],[-1.09,-0.17],[-0.21,1.44],[0.82,1.23],[1.91,1.91],[1.37,1.99],[-0.73,0.15],[0.86,-1.53],[-1.64,-1.4],[0.12,0.72],[1.9,-0.4],[-1.33,-0.77],[0.45,-0.85],[0.94,0.99],[-1.58,0.96],[0.08,-0.43],[0.74,-0.92],[-1.6,1.19],[-0.18,-0.64],[-0.72,0.14],[-0.37,1.86],[0.29,-0.44],[-1.28,0.72],[-1.07,0.02],[-1.03,-1.53],[0.51,0.22],[-1.62,1.18],[0.76,0.13],[0.82,-1.19],[-1.56,0.99],[-0.54,1.86],[1.6,-1.75],[1.84,-1.52],[0.23,-0.27],[-1.09,-1.73],[1.98,-1.51],[-0.22,1.18],[-0.08,-0.33],[-1.83,-0.03],[0.29,-1.43],[1.1,1.2],[-0.33,-1.77],[-0.91,-1.25],[-1.83,1.11],[0.51,1.36],[1.18,1.91],[-1.93,-1.35],[0.61,0.16],[-0.28,-0.83],[-0.9,-1.88],[-0.98,0.65],[-0.46,1.56],[0.77,0.32],[-0.3,-1.78],[1.88,-0.3]];
const RY = "00110000011001001000111000000000010010010100100001011010011110000000101000111000010111001000001000110001101100100100000010001000000110111001000010100001001001001101101010101000001011100000000011010100";
const RW = {"1":{"W1":[[6.783,0.548]],"b1":[-6.725],"w2":[-10.419],"b2":-0.194},"2":{"W1":[[0.131,-2.049],[0.62,1.935]],"b1":[-0.499,-0.776],"w2":[-1.482,-2.192],"b2":1.473},"3":{"W1":[[2.8,-3.385],[1.831,3.528],[-3.023,-0.628]],"b1":[-2.732,-1.633,1.763],"w2":[-3.415,-2.878,-1.645],"b2":8.739},"4":{"W1":[[2.641,-3.186],[1.411,2.695],[-3.246,-0.781],[0.235,1.698]],"b1":[-2.568,-1.199,1.532,-1.346],"w2":[-3.369,-3.329,-1.482,-0.866],"b2":7.972},"8":{"W1":[[-1.522,-0.853],[0.014,0.144],[5.85,1.237],[-0.633,0.986],[3.641,-3.394],[1.98,3.502],[1.479,2.913],[3.859,0.912]],"b1":[-1.693,-0.597,-2.526,1.123,-1.665,-1.362,-1.382,3.865],"w2":[-0.918,-0.087,-4.706,-0.429,-5.431,-6.133,-2.404,5.106],"b2":0.169}};
/* Card 5: the 1-H-1 ReLU network as hinges. Knots equally spaced inside (−3, 3), units left of 0 face left, the rest face right, output layer fitted by least squares to x² on 601 grid points. */
const XG = Array.from({ length: 601 }, (_, i) => -3 + i * 0.01);
const hingeFit = H => {
  const k = Array.from({ length: H }, (_, j) => -3 + 6 * (j + 1) / (H + 1)), s = k.map(v => v < -1e-12 ? -1 : 1);
  const feat = x => [1, ...k.map((kk, j) => relu(s[j] * (x - kk)))];
  const v = lstsq(XG.map(feat), XG.map(x => x * x));
  const g = x => feat(x).reduce((a, q, j) => a + q * v[j], 0);
  let mse = 0, mx = 0; XG.forEach(x => { const e = g(x) - x * x; mse += e * e; mx = Math.max(mx, Math.abs(e)); });
  return { k, s, v, g, mse: mse / XG.length, mx };
};
const HF = {}; [1, 2, 4, 6, 8, 10].forEach(H => { HF[H] = hingeFit(H); });
/* Card 9: the tent map T(x) = ReLU(2x) − ReLU(4x − 2) composed L times */
const tent = (x, L) => { for (let i = 0; i < L; i++) x = relu(2 * x) - relu(4 * x - 2); return x; };
/* Card 11: a 1-3-1 ReLU network fitting y = |x| on 21 points by full-batch gradient descent, three starting points */
const SX = Array.from({ length: 21 }, (_, i) => -2 + i * 0.2), SY = SX.map(Math.abs);
const INITS = { same: { W: [0.5, 0.5, 0.5], b: [0.1, 0.1, 0.1], v: [0.5, 0.5, 0.5], c: 0 }, diff: { W: [0.9, -0.7, 0.4], b: [0.2, 0.3, -0.1], v: [0.6, 0.5, -0.4], c: 0 }, zero: { W: [0, 0, 0], b: [0, 0, 0], v: [0, 0, 0], c: 0 } };
const SYM = {};
Object.keys(INITS).forEach(key => {
  const I = INITS[key]; let W = [...I.W], b = [...I.b], v = [...I.v], c = I.c; const hist = [];
  for (let t = 0; t <= 3000; t++) {
    const z = SX.map(x => W.map((w, j) => w * x + b[j])), a = z.map(r => r.map(relu)), e = a.map((r, i) => r.reduce((s, q, j) => s + q * v[j], c) - SY[i]);
    if (t % 10 === 0) hist.push({ L: e.reduce((s, q) => s + q * q, 0) / SX.length, W: [...W], b: [...b], v: [...v], c });
    if (t === 3000) break;
    const g = e.map(q => 2 * q / SX.length), gv = [0, 0, 0], gW = [0, 0, 0], gb = [0, 0, 0]; let gc = 0;
    g.forEach((q, i) => { gc += q; for (let j = 0; j < 3; j++) { gv[j] += q * a[i][j]; if (z[i][j] > 0) { gW[j] += q * v[j] * SX[i]; gb[j] += q * v[j]; } } });
    for (let j = 0; j < 3; j++) { W[j] -= 0.05 * gW[j]; b[j] -= 0.05 * gb[j]; v[j] -= 0.05 * gv[j]; } c -= 0.05 * gc;
  }
  SYM[key] = hist;
});
const pcount = sizes => sizes.slice(1).map((n, i) => ({ w: sizes[i] * n, b: n }));

addLesson("ml", "deep", {
level: "Core", num: "Lesson 32",
id: "ml-deep-l32", title: "The multilayer perceptron", short: "32. The multilayer perceptron",
big: String.raw`Logistic regression draws one straight boundary and linear regression one straight line. A multilayer perceptron stacks layers of such units, each computing a weighted sum and passing it through a nonlinear activation, so the next layer works on features the network computed itself. Andrew Ng starts with a demand prediction network whose hidden units read like affordability, awareness and perceived quality, then writes every layer as \(\mathbf{a}^{[l]} = g(W^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]})\) with \(W^{[l]}\) of shape \((n^{[l]}, n^{[l-1]})\). This lesson builds the idea from the ground up. Without an activation, any stack of linear layers collapses to one linear layer. With ReLU, a hidden layer can bend the input space so XOR becomes separable, a 1-H-1 network on one input becomes a sum of H hinges, and depth can multiply the number of linear pieces. Then the practical side: a forward pass by hand, a batch at once in Ng's column layout and PyTorch's row layout, counting parameters for the course's networks from 4 to 101,770, why all hidden units must start different, and the shape bugs that break an MLP in PyTorch. How the gradients flow back is Lesson 33.`,
bridge: String.raw`The course has no lecture notes for week 10 (feedforward neural networks), so the topics follow the homework: HW8 Part 2 (SimpleNN with 3H + 1 parameters, widths 1 and 50 against a parabola), HW9 Problem 4B and 4C (LinearDigits against MLPDigits, 7,850 against 101,770 parameters, and the algebra of removing the ReLU) and HW10 A2 (SmallClassifier, 418 parameters), read with their questions and solutions docs. The spine is Andrew Ng's Machine Learning Specialization, course 2 week 1 (Neurons and layers, Demand prediction, Neural network layer, Forward propagation) and Deep Learning Specialization, course 1 weeks 3 and 4 (Vectorizing across multiple examples, Why do you need nonlinear activation functions, Random initialization, Getting your matrix dimensions right, Why deep representations). XOR follows Goodfellow, Bengio and Courville section 6.1.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. A layer of neurons", t: "From one neuron to a layer: Ng's demand prediction",
intu: String.raw`Each circle in the middle is a logistic regression unit from Lesson 29: a weighted sum of its inputs plus a bias, passed through the sigmoid. Andrew Ng's example predicts whether a T-shirt becomes a top seller from price, shipping cost, marketing and material quality. Three hidden units estimate affordability from price and shipping, awareness from marketing, and perceived quality from price and material. Their three outputs form a vector, the activations of the hidden layer, and the output unit is one more logistic regression that reads that vector instead of the raw inputs. Move the sliders: a higher price lowers affordability but raises perceived quality, so the top seller probability changes less than either unit alone suggests. The weights here were set by hand so the units have names. In a real network every hidden unit is connected to every input, the fully connected view, and training chooses the weights, so the features the network computes are learned, not designed.`,
eq: String.raw`\[ a^{[1]}_j = g\big(\mathbf{w}^{[1]}_j \cdot \mathbf{x} + b^{[1]}_j\big), \qquad j = 1, 2, 3 \]
\[ a^{[2]} = g\big(\mathbf{w}^{[2]} \cdot \mathbf{a}^{[1]} + b^{[2]}\big), \qquad g(z) = \frac{1}{1 + e^{-z}} \]`,
sym: [[String.raw`\(\mathbf{x}\)`, "the input features, also written a⁽⁰⁾, four numbers on a 0 to 1 scale here"], [String.raw`\(a^{[1]}_j\)`, "activation of unit j in layer 1, a number between 0 and 1 for the sigmoid"], [String.raw`\(\mathbf{w}^{[1]}_j, b^{[1]}_j\)`, "weights and bias of unit j in layer 1"], [String.raw`\(\mathbf{a}^{[1]}\)`, "the vector of all hidden activations, the features the output unit reads"], [String.raw`\(g\)`, "the activation function, the sigmoid on this card"]],
how: ["Pick the inputs.", "For each hidden unit, form its weighted sum plus bias and apply g.", "Collect the hidden activations into one vector.", "Feed that vector to the output unit the same way.", "Read the output as the probability of a top seller."],
say: String.raw`A layer is a set of units that each apply an activation function to a weighted sum of the same inputs, and a neural network feeds the activation vector of one layer into the next.`,
num: String.raw`Inputs (0.5, 0.2, 0.6, 0.7): hidden sums (0.4, 1.0, 0.8), activations <b>(0.5987, 0.7311, 0.6900)</b>, output sum 1.3281, probability <b>0.7905</b>. Price 0.9: affordability 0.2315, quality 0.8320, probability 0.6576. No marketing: awareness 0.1192, probability 0.5261.`,
note: String.raw`Ng's point in course 2 week 1 is the last sentence of the intuition: you do not tell the network what affordability is. In the project, resist naming hidden units, inspect what they respond to instead.`,
r(fig, ctl) {
  ctl.innerHTML = DEM.names.map((n, i) => sl("dmx" + i, n, 0, 1, 0.05, [0.5, 0.2, 0.6, 0.7][i])).join("") + btns([[0, "Ng's sketch"], [1, "Fully connected"]], "dmv") + `<div id="dmo"></div>`;
  let full = 0;
  const u = () => {
    pick(ctl, "dmv", full);
    const x = DEM.names.map((_, i) => +$("dmx" + i).value); x.forEach((v, i) => { $("dmx" + i + "v").textContent = f(v, 2); });
    const z = DEM.W.map((r, j) => r.reduce((s, w, i) => s + w * x[i], DEM.b[j])), a = z.map(sig), zo = a.reduce((s, q, j) => s + q * DEM.v[j], DEM.c), p = sig(zo);
    const XI = 100, XH = 350, XO = 590, YI = [50, 112, 174, 236], YH = [70, 143, 216];
    let s = tx(XI, 20, "inputs x", "middle", "th") + tx(XH, 20, "hidden layer a⁽¹⁾", "middle", "th") + tx(XO, 20, "output", "middle", "th");
    DEM.W.forEach((r, j) => r.forEach((w, i) => { if (w || full) s += edge(XI + 22, YI[i], XH - 24, YH[j], w, w ? w : null, !w); }));
    DEM.v.forEach((w, j) => { s += edge(XH + 24, YH[j], XO - 26, 143, w, w); });
    x.forEach((v, i) => { s += node(XI, YI[i], 21, "in", f(v, 2)) + tx(XI - 28, YI[i] + 4, DEM.names[i], "end"); });
    a.forEach((v, j) => { s += node(XH, YH[j], 23, "hid", f(v, 3)) + tx(XH, YH[j] + 38, DEM.hid[j], "middle") + tx(XH + 30, YH[j] - 20, "b = " + mn(DEM.b[j])); });
    s += node(XO, 143, 25, "out", f(p, 3)) + tx(XO, 186, "P(top seller)", "middle") + tx(XO, 202, "b = " + mn(DEM.c), "middle");
    fig.innerHTML = svg(270, s);
    $("dmo").innerHTML = RO([["affordability", f(a[0])], ["awareness", f(a[1])], ["quality", f(a[2])], ["output sum", f(zo)], ["P(top seller)", f(p)]]);
  };
  DEM.names.forEach((_, i) => { $("dmx" + i).oninput = u; });
  ctl.querySelectorAll("button[data-dmv]").forEach(b => b.onclick = () => { full = +b.dataset.dmv; u(); });
  u();
}},

{s: "2. Notation and shapes", t: "Layers, superscripts and the shape of every weight matrix",
intu: String.raw`Ng's notation puts the layer in square brackets as a superscript and the unit as a subscript, so \(a^{[2]}_3\) is unit 3 of layer 2. The input is layer 0 and is not counted, so a network with two hidden layers and an output layer is a 3-layer network. Stack the weight vectors of a layer's units as rows and you get the matrix \(W^{[l]}\): one row per unit in layer l, one column per unit in layer l − 1, shape \((n^{[l]}, n^{[l-1]})\). Pick a network and a layer below. Ng's handwritten digit network in the course 2 lab reads 400 pixels, then has 25, 15 and 1 units, so \(W^{[1]}\) is 25 by 400. PyTorch stores <code>nn.Linear(in, out).weight</code> with exactly the same shape, (out, in), so Ng's \(W^{[l]}\) and the PyTorch weight are the same matrix. Getting these shapes right before writing code is Ng's own debugging advice in course 1 week 4.`,
eq: String.raw`\[ \mathbf{a}^{[l]} = g^{[l]}\big(W^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]}\big), \qquad \mathbf{a}^{[0]} = \mathbf{x} \]
\[ W^{[l]} \in \mathbb{R}^{n^{[l]} \times n^{[l-1]}}, \qquad \mathbf{b}^{[l]}, \mathbf{a}^{[l]} \in \mathbb{R}^{n^{[l]}} \]`,
sym: [[String.raw`\(l\)`, "layer index, 1 to L, the input is layer 0"], [String.raw`\(n^{[l]}\)`, "number of units in layer l"], [String.raw`\(W^{[l]}\)`, "weight matrix of layer l, row j holds the weights of unit j"], [String.raw`\(\mathbf{b}^{[l]}\)`, "bias vector of layer l, one bias per unit"], [String.raw`\(g^{[l]}\)`, "activation of layer l, ReLU or sigmoid, none for a regression output"], ["L", "number of layers with parameters, the input layer is not counted"]],
how: ["List the layer sizes from input to output.", "For layer l, the weight matrix has n⁽ˡ⁾ rows and n⁽ˡ⁻¹⁾ columns.", "The bias and the activation have n⁽ˡ⁾ entries.", "In PyTorch write nn.Linear(n⁽ˡ⁻¹⁾, n⁽ˡ⁾), its weight is (n⁽ˡ⁾, n⁽ˡ⁻¹⁾).", "Check that each layer's columns match the previous layer's units."],
say: String.raw`The weight matrix of layer l has one row per unit in layer l and one column per unit in layer l − 1, so it maps a vector of length n of layer l − 1 to a vector of length n of layer l.`,
num: String.raw`Ng's digits 400-25-15-1: \(W^{[1]}\) (25, 400), \(W^{[2]}\) (15, 25), \(W^{[3]}\) (1, 15), L = 3. HW9 MLPDigits 784-128-10: (128, 784) and (10, 128). HW10 SmallClassifier 10-32-2: (32, 10) and (2, 32).`,
note: String.raw`An exam question that gives layer sizes and asks for the shape of \(W^{[2]}\) wants (units of layer 2, units of layer 1). Write the sizes as a list first, then read the shapes off neighbouring pairs.`,
r(fig, ctl) {
  const NETS = [["Ng demand", [4, 3, 1]], ["Ng digits lab", [400, 25, 15, 1]], ["HW10 SmallClassifier", [10, 32, 2]], ["HW9 MLPDigits", [784, 128, 10]]];
  ctl.innerHTML = btns(NETS.map((n, i) => [i, n[0]]), "nsn") + `<div id="nsl"></div><div id="nso"></div>`;
  let ni = 1, li = 1;
  const u = () => {
    pick(ctl, "nsn", ni); const sz = NETS[ni][1], L = sz.length - 1; if (li > L) li = 1;
    $("nsl").innerHTML = btns(sz.slice(1).map((_, i) => [i + 1, "layer " + (i + 1)]), "nsla"); pick(ctl, "nsla", li);
    ctl.querySelectorAll("button[data-nsla]").forEach(b => b.onclick = () => { li = +b.dataset.nsla; u(); });
    const gap = 600 / (sz.length - 1);
    let s = "";
    sz.forEach((n, l) => {
      const x = 40 + l * gap, h = 30 + 110 * Math.log10(n + 1) / Math.log10(785), on = l === li || l === li - 1;
      s += `<rect x="${x - 18}" y="${110 - h / 2}" width="36" height="${h}" rx="6" fill="${l === li ? "var(--teal-bg)" : l === li - 1 ? "var(--blue-bg)" : "var(--sunk)"}" stroke="${l === li ? C.teal : l === li - 1 ? C.blue : "var(--line)"}" stroke-width="${on ? 1.8 : 1}"/>`;
      s += tx(x, 110 + h / 2 + 16, "n⁽" + l + "⁾ = " + n, "middle", on ? "th" : "ts") + tx(x, 110 - h / 2 - 8, l === 0 ? "input" : l === L ? "output" : "hidden", "middle");
      if (l) s += arrow(x - gap + 22, 110, x - 22, 110, l === li ? C.teal : "var(--line)", l === li ? 2 : 1);
    });
    const a = sz[li - 1], b = sz[li], sc = 80 / Math.max(a, b), rw = Math.max(8, a * sc), rh = Math.max(8, b * sc);
    s += tx(40, 222, "W⁽" + li + "⁾ is " + b + " by " + a, null, "th") + `<rect x="40" y="234" width="${rw}" height="${rh}" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(40 + rw / 2, 234 + rh + 14, a + " columns", "middle") + tx(40 + rw + 8, 234 + rh / 2 + 4, b + " rows");
    s += tx(300, 246, "row j = weights of unit j in layer " + li) + tx(300, 266, "b⁽" + li + "⁾ and a⁽" + li + "⁾ have " + b + " entries") + tx(300, 286, "PyTorch: nn.Linear(" + a + ", " + b + ").weight.shape = (" + b + ", " + a + ")");
    fig.innerHTML = svg(340, s);
    $("nso").innerHTML = RO([["layers L", L], ["W shape", "(" + b + ", " + a + ")"], ["weights", (a * b).toLocaleString("en-US")], ["biases", b]]);
  };
  ctl.querySelectorAll("button[data-nsn]").forEach(b => b.onclick = () => { ni = +b.dataset.nsn; li = 1; u(); });
  u();
}},

{s: "3. Why nonlinearity", t: "Without an activation, every stack of linear layers is one linear layer",
intu: String.raw`This network has one input, two hidden units and one output. With no activation the hidden layer computes \(h_1 = x\) and \(h_2 = 1 - x\), and the output \(2h_1 + h_2 - 1\) simplifies to exactly \(x\): four weights, three biases and a hidden layer, and the result is the identity line. The algebra is general. A linear map of a linear map is a linear map, with weights \(W^{[2]}W^{[1]}\) and bias \(W^{[2]}\mathbf{b}^{[1]} + \mathbf{b}^{[2]}\) as in the equation, so ten linear layers are still one. Switch on ReLU with the same weights. Now \(h_2\) switches off for x above 1 and \(h_1\) for x below 0, and the output bends twice: it becomes \(-x\) on the left, \(x\) in the middle and \(2x - 1\) on the right. This is Ng's answer in course 1 week 3 to why you need nonlinear activations, and HW9 4B asks the same about MLPDigits: remove its ReLU and the two layers collapse to one 10 by 784 matrix, the linear model with extra parameters.`,
eq: String.raw`\[ W^{[2]}\big(W^{[1]}\mathbf{x} + \mathbf{b}^{[1]}\big) + \mathbf{b}^{[2]} = W'\mathbf{x} + \mathbf{b}' \]
\[ W' = W^{[2]}W^{[1]}, \qquad \mathbf{b}' = W^{[2]}\mathbf{b}^{[1]} + \mathbf{b}^{[2]} \]`,
sym: [[String.raw`\(W', \mathbf{b}'\)`, "the single equivalent layer of a stack without activations"], [String.raw`\(h_1, h_2\)`, "the two hidden units, h₁ = x and h₂ = 1 − x before the activation"], ["ReLU", "max(0, z), passes positive values and blocks negative ones"], ["kink", "a point where the slope changes, one per hidden ReLU unit at most"]],
how: ["Write the hidden layer as W⁽¹⁾x + b⁽¹⁾.", "Substitute it into the output layer.", "Multiply out: the weights become W⁽²⁾W⁽¹⁾ and the bias W⁽²⁾b⁽¹⁾ + b⁽²⁾.", "Conclude that depth without activations adds parameters, not shapes.", "Insert ReLU and find where each unit switches on or off."],
say: String.raw`Without a nonlinear activation the composition of linear layers is itself a single linear layer, so the hidden layers add parameters but cannot represent any function the one-layer model could not.`,
num: String.raw`Weights \(W^{[1]} = (1, -1)\), \(\mathbf{b}^{[1]} = (0, 1)\), \(\mathbf{w}^{[2]} = (2, 1)\), \(b^{[2]} = -1\). Linear: \(W' = 2 - 1 = 1\), \(b' = 1 - 1 = 0\), so y = x. ReLU at x = −2 gives <b>2</b> instead of −2, at x = 2 gives <b>3</b> instead of 2. MLPDigits without ReLU: one (10, 784) matrix, checked in PyTorch to agree with the two layers to 1e-5.`,
note: String.raw`A model that "trains but never beats logistic regression" is worth one look at its forward method for a missing activation. The parameter count does not reveal it, 101,770 either way.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "No activation"], [1, "ReLU"]], "nla") + sl("nlx", "input x", -2, 2, 0.1, 1.5) + `<div id="nlo"></div>`;
  let act = 0;
  const F = (x, ac) => { const h1 = x, h2 = -x + 1, a1 = ac ? relu(h1) : h1, a2 = ac ? relu(h2) : h2; return { h1, h2, a1, a2, y: 2 * a1 + a2 - 1 }; };
  const u = () => {
    pick(ctl, "nla", act); const x = +$("nlx").value; $("nlxv").textContent = fm(x, 1); const r = F(x, act);
    const A = ML.axes(330, 24, 320, 220, { xmin: -2, xmax: 2, ymin: -3, ymax: 4, nx: 4, ny: 7, fx: v => mn(v), fy: v => mn(v), xl: "input x", yl: "output y" });
    const xs = Array.from({ length: 81 }, (_, i) => -2 + i * 0.05);
    let s = A.s + ML.path(xs.map(v => [A.X(v), A.Y(F(v, 0).y)]), C.gray, act ? 1.5 : 2.5, act ? "5 4" : null) + ML.path(xs.map(v => [A.X(v), A.Y(F(v, 1).y)]), C.teal, act ? 2.5 : 1.5, act ? null : "5 4");
    s += tx(A.X(-1.9), A.Y(-2.4), "no activation: y = x", null);
    s += tx(A.X(-1.9), A.Y(3.4), "ReLU: three straight pieces", null) + `<circle cx="${A.X(x)}" cy="${A.Y(r.y)}" r="6" fill="${act ? C.teal : C.gray}"/>`;
    [0, 1].forEach(k => { s += `<line x1="${A.X(k)}" y1="${A.Y(-3)}" x2="${A.X(k)}" y2="${A.Y(4)}" stroke="${C.purple}" stroke-dasharray="3 4" opacity="${act ? 0.8 : 0.25}"/>`; });
    s += node(40, 130, 20, "in", f(x, 1)) + node(160, 80, 22, act && r.a1 === 0 ? "off" : "hid", f(r.a1, 2), "h₁") + node(160, 190, 22, act && r.a2 === 0 ? "off" : "hid", f(r.a2, 2), "h₂") + node(270, 135, 22, "out", f(r.y, 2));
    s += edge(60, 126, 138, 86, 1, "1") + edge(60, 134, 138, 184, -1, "−1") + edge(182, 84, 248, 130, 2, "2") + edge(182, 186, 248, 140, 1, "1");
    s += tx(186, 62, "b = 0") + tx(184, 222, "b = 1") + tx(270, 176, "b = −1", "middle");
    fig.innerHTML = svg(290, s);
    $("nlo").innerHTML = RO([["h₁ before g", f(r.h1, 2)], ["h₂ before g", f(r.h2, 2)], ["after g", "(" + f(r.a1, 2) + ", " + f(r.a2, 2) + ")"], ["output y", f(r.y, 2)], ["one linear layer", "y = x"]]);
  };
  $("nlx").oninput = u; ctl.querySelectorAll("button[data-nla]").forEach(b => b.onclick = () => { act = +b.dataset.nla; u(); });
  u();
}},

{s: "4. XOR", t: "XOR: a hidden layer moves the points until a line separates them",
intu: String.raw`XOR is 1 when exactly one input is 1. No straight line puts (0, 1) and (1, 0) on one side and (0, 0) and (1, 1) on the other, so logistic regression fails, and the best linear least squares fit is the useless constant 0.5 for all four points. Goodfellow, Bengio and Courville solve it with two ReLU units that both compute \(x_1 + x_2\), the second shifted down by 1. Step through. In the hidden space the four inputs land on (0, 0), (1, 0), (1, 0) and (2, 1): the two XOR-true points now sit on the same spot, and the line \(h_1 - 2h_2 = 0.5\) separates them from the rest. The output \(h_1 - 2h_2\) is exactly 0, 1, 1, 0. Nothing magic happened to the output layer, it is still linear. The hidden layer changed the coordinates the output layer works in, which is the whole job of a hidden layer.`,
eq: String.raw`\[ \mathbf{h} = \text{ReLU}\left(\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}\mathbf{x} + \begin{pmatrix} 0 \\ -1 \end{pmatrix}\right) \]
\[ \hat{y} = h_1 - 2h_2 \]`,
sym: [[String.raw`\(\mathbf{h}\)`, "the hidden representation of an input, two numbers"], ["linearly separable", "a straight line (a hyperplane) puts the two classes on opposite sides"], ["hidden space", "the coordinates (h₁, h₂) the output layer sees"], ["XOR", "exclusive or, 1 for inputs (0, 1) and (1, 0), 0 for (0, 0) and (1, 1)"]],
how: ["Plot the four inputs and check that no line separates the classes.", "Compute h for each input with the hidden weights.", "Plot the points again in the (h₁, h₂) plane.", "Find a line that separates them there.", "Read the output layer as that line."],
say: String.raw`A hidden layer with a nonlinear activation maps the inputs into a new representation in which the classes can become linearly separable, and the output layer then draws a straight boundary in that representation.`,
num: String.raw`Hidden points: (0, 0) → <b>(0, 0)</b>, (0, 1) → (1, 0), (1, 0) → (1, 0), (1, 1) → <b>(2, 1)</b>. Outputs <b>0, 1, 1, 0</b>. Best linear fit: weights (0, 0), bias 0.5, MSE 0.25 on all four points.`,
note: String.raw`The same idea is behind HW8 3E and Lesson 29 card 10: adding \(x_1^2 + x_2^2\) by hand made a ring separable. A hidden layer learns such features instead of you choosing them, card 10 shows it on a ring.`,
r(fig, ctl) {
  const P = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
  const H = p => [relu(p[0] + p[1]), relu(p[0] + p[1] - 1)];
  const draw = k => {
    const A = ML.axes(50, 30, 240, 200, { xmin: -0.5, xmax: 1.5, ymin: -0.5, ymax: 1.5, nx: 4, ny: 4, fx: v => mn(v), fy: v => mn(v), xl: "x₁", yl: "x₂" });
    const B = ML.axes(400, 30, 240, 200, { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 1.5, nx: 6, ny: 4, fx: v => mn(v), fy: v => mn(v), xl: "h₁", yl: "h₂" });
    let s = A.s + tx(170, 18, "input space", "middle", "th") + B.s + tx(520, 18, "hidden space", "middle", "th");
    if (k >= 1) { s += ML.path([[A.X(-0.5), A.Y(0.5)], [A.X(0.5), A.Y(-0.5)]], C.purple, 1.5, "5 4") + ML.path([[A.X(-0.5), A.Y(1.5)], [A.X(1.5), A.Y(-0.5)]], C.purple, 1.5, "5 4") + tx(A.X(1.05), A.Y(1.38), "h₂ switches on", null) + tx(A.X(-0.45), A.Y(-0.38), "h₁ on", null); }
    if (k === 0) s += tx(A.X(0.5), A.Y(1.38), "no line separates the colors", "middle");
    P.forEach(p => { s += `<circle cx="${A.X(p[0])}" cy="${A.Y(p[1])}" r="9" fill="${p[2] ? C.coral : C.blue}"/>` + tx(A.X(p[0]) + 12, A.Y(p[1]) - 10, `(${p[0]}, ${p[1]})`); });
    if (k >= 1) {
      const seen = {};
      P.forEach(p => { const h = H(p), key = h.join(","); seen[key] = (seen[key] || 0) + 1; s += `<circle cx="${B.X(h[0]) + (seen[key] - 1) * 7}" cy="${B.Y(h[1])}" r="9" fill="${p[2] ? C.coral : C.blue}" opacity="0.9"/>`; });
      s += tx(B.X(1) + 14, B.Y(0) - 12, "(0, 1) and (1, 0) land here") ;
    }
    if (k >= 2) s += ML.path([[B.X(0.5), B.Y(0)], [B.X(2.5), B.Y(1)]], C.teal, 2.5) + tx(B.X(1.55), B.Y(1.25), "h₁ − 2h₂ = 0.5", "middle");
    const rows = P.map(p => { const h = H(p); return [`(${p[0]}, ${p[1]})`, String(p[2]), k >= 1 ? `(${h[0]}, ${h[1]})` : "", k >= 2 ? String(h[0] - 2 * h[1]) : ""]; });
    fig.innerHTML = svg(270, s) + TB(["input x", "XOR", "hidden h", "output h₁ − 2h₂"], rows);
  };
  ML.stepper(ctl, 3, draw, ["four points, no separating line", "the hidden layer moves them", "a line in the hidden space"]);
}},

{s: "5. Hinges", t: "One hidden ReLU layer on one input: a sum of hinges",
intu: String.raw`HW8's SimpleNN has one input, H hidden ReLU units and one output. Each hidden unit \(\text{ReLU}(w_j x + b_j)\) is a hinge: zero on one side of its knot \(x = -b_j/w_j\) and a straight ramp on the other. The output adds the hinges with weights \(v_j\) and a bias, so the network draws a connected chain of at most H + 1 straight pieces. Here the knots are fixed at equal spacing and only the output layer is fitted, by least squares to \(x^2\) on \([-3, 3]\). That makes the output layer exactly a linear regression on the hidden features, Lesson 15 again. With one hinge the fit follows one arm of the parabola and stays flat on the other, which is what HW8 saw for width 1 (validation MSE 4.93). Two hinges already take the error from 5.889 to 0.0895, and ten reach 0.0005. Now widen the view to \([-6, 6]\): outside the data every ReLU network continues in straight lines, so at x = 5 the 10-unit fit says 19.87 where \(x^2\) is 25.`,
eq: String.raw`\[ \hat{y}(x) = \sum_{j=1}^{H} v_j\,\text{ReLU}(w_j x + b_j) + c \]
\[ \text{knot of unit } j: \; x = -b_j / w_j \]`,
sym: [["H", "number of hidden units, the width"], [String.raw`\(w_j, b_j\)`, "weight and bias of hidden unit j, they set the knot and the side the ramp faces"], [String.raw`\(v_j, c\)`, "output weights and bias, fitted here by least squares"], ["knot", "the input where a hidden unit switches on"], ["universal approximation", "with enough hidden units one hidden layer approximates any continuous function on a bounded interval"]],
how: ["Place a knot for each hidden unit.", "Compute the hidden features ReLU(w x + b) for every input.", "Fit the output weights by least squares on those features.", "Count the pieces: at most one more than the number of units.", "Check the fit outside the training range before trusting it there."],
say: String.raw`A one-hidden-layer ReLU network on a scalar input is a continuous piecewise linear function with at most one more piece than it has hidden units, and outside the range of its knots it continues linearly.`,
num: String.raw`MSE to \(x^2\) on \([-3, 3]\): one hinge <b>5.889</b> (the constant 3.01 gives 7.248), 2 hinges <b>0.0895</b>, 4 hinges 0.0116, 6 hinges 0.0030, 8 hinges 0.0011, 10 hinges <b>0.0005</b>. At x = 5 the fits say 8.12, 16.35, 18.37, 19.17, 19.60 and 19.87 against 25. Parameters 3H + 1, so 31 for H = 10.`,
note: String.raw`Universal approximation (Cybenko 1989, Hornik 1991) says such a network exists, not how many units it needs, whether gradient descent finds it, or what it does outside the data. HW8's width-50 network reached test MSE 0.137 inside \([-3, 3]\), and it would also go straight beyond 3.`,
r(fig, ctl) {
  ctl.innerHTML = btns([1, 2, 4, 6, 8, 10].map(h => [h, h + (h === 1 ? " hinge" : " hinges")]), "hgh") + btns([[0, "view [−3, 3], the data"], [1, "view [−6, 6], extrapolate"]], "hgv") + `<div id="hgo"></div>`;
  let H = 1, wide = 0;
  const u = () => {
    pick(ctl, "hgh", H); pick(ctl, "hgv", wide); const R = HF[H], lim = wide ? 6 : 3;
    const A = ML.axes(60, 20, 590, 250, { xmin: -lim, xmax: lim, ymin: -2, ymax: wide ? 36 : 10, nx: wide ? 12 : 6, ny: wide ? 4 : 6, fx: v => mn(v), fy: v => mn(+v.toFixed(0)), xl: "input x", yl: "output" });
    const xs = Array.from({ length: 241 }, (_, i) => -lim + i * lim / 120);
    let s = A.s;
    if (wide) s += `<rect x="${A.X(-3)}" y="20" width="${A.X(3) - A.X(-3)}" height="250" fill="${C.teal}" opacity="0.06"/>` + tx(A.X(0), 36, "training range", "middle");
    s += ML.path(xs.map(x => [A.X(x), A.Y(x * x)]).filter(p => p[1] >= 18), C.gray, 2, "6 4");
    if (H <= 4) R.k.forEach((k, j) => { s += ML.path(xs.map(x => [A.X(x), A.Y(R.v[j + 1] * relu(R.s[j] * (x - k)))]).filter(p => p[1] >= 18 && p[1] <= 272), C.purple, 1.2, "2 3"); });
    s += ML.path(xs.map(x => [A.X(x), A.Y(R.g(x))]).filter(p => p[1] >= 18 && p[1] <= 272), C.teal, 2.6);
    R.k.forEach(k => { s += `<circle cx="${A.X(k)}" cy="${A.Y(R.g(k))}" r="4.5" fill="${C.purple}"/>`; });
    s += tx(A.X(-lim) + 10, 36 + (wide ? 18 : 0), "dashed gray: x², teal: network, dots: knots" + (H <= 4 ? ", dotted: each hinge times its v" : ""));
    if (wide) s += `<circle cx="${A.X(5)}" cy="${A.Y(25)}" r="4" fill="${C.gray}"/><circle cx="${A.X(5)}" cy="${A.Y(R.g(5))}" r="5" fill="${C.coral}"/>` + tx(A.X(5) - 8, A.Y(R.g(5)) + 18, "net " + f(R.g(5), 2), "end");
    fig.innerHTML = svg(310, s);
    $("hgo").innerHTML = RO([["pieces", H + 1], ["parameters 3H + 1", 3 * H + 1], ["MSE on [−3, 3]", f(R.mse)], ["largest error", f(R.mx, 3)], ["network at x = 5", f(R.g(5), 2) + " vs 25"]]);
  };
  ctl.querySelectorAll("button[data-hgh]").forEach(b => b.onclick = () => { H = +b.dataset.hgh; u(); });
  ctl.querySelectorAll("button[data-hgv]").forEach(b => b.onclick = () => { wide = +b.dataset.hgv; u(); });
  u();
}},

{s: "6. Forward pass by hand", t: "A forward pass by hand, one layer at a time",
intu: String.raw`This is the calculation an exam asks for, on a 2-3-1 network with ReLU in the hidden layer and no activation at the output, because the output is a regression. Step through it. First each hidden unit forms its weighted sum: for the first example, unit 1 gets \(1 \cdot 1 + (-1) \cdot 2 + 0.5 = -0.5\). Then ReLU clips the negative sum to 0, so unit 1 is off for this input and contributes nothing, whatever its outgoing weight. The output unit adds \(1 \cdot 0 + 1 \cdot 3 + (-1) \cdot 1 + 0.5 = 2.5\), and against the target 2 the squared error is 0.25. Switch to the second example: two of the three hidden units are off, so the prediction depends only on unit 3. Which units are on is decided example by example, and that pattern is exactly what makes the network nonlinear. Without the ReLU the same weights would predict 2.0 and −5.5.`,
eq: String.raw`\[ \mathbf{z}^{[1]} = W^{[1]}\mathbf{x} + \mathbf{b}^{[1]}, \qquad \mathbf{a}^{[1]} = \text{ReLU}(\mathbf{z}^{[1]}) \]
\[ \hat{y} = \mathbf{w}^{[2]} \cdot \mathbf{a}^{[1]} + b^{[2]}, \qquad L = (\hat{y} - y)^2 \]`,
sym: [[String.raw`\(\mathbf{z}^{[1]}\)`, "pre-activations of the hidden layer, the weighted sums before ReLU"], [String.raw`\(\mathbf{a}^{[1]}\)`, "hidden activations after ReLU"], [String.raw`\(W^{[1]}\)`, "rows (1, −1), (2, 1), (−1, 0.5), bias (0.5, −1, 1)"], [String.raw`\(\mathbf{w}^{[2]}, b^{[2]}\)`, "output weights (1, 1, −1) and bias 0.5"], [String.raw`\(\hat{y}\)`, "the prediction, no activation on a regression output"]],
how: ["Write W⁽¹⁾ with one row per hidden unit.", "For each row, multiply by x, add the bias, write the sum.", "Apply ReLU: negative sums become 0.", "Combine the hidden activations with the output weights and add the bias.", "Compare with the target, and average the squared errors over the batch."],
say: String.raw`A forward pass computes each layer's pre-activations as weights times the previous activations plus biases, applies the activation, and passes the result on until the output gives the prediction and the loss.`,
num: String.raw`Example 1, x = (1, 2), y = 2: \(\mathbf{z}^{[1]} = (-0.5, 3, 1)\), \(\mathbf{a}^{[1]} = (0, 3, 1)\), \(\hat{y} = \) <b>2.5</b>, error 0.25. Example 2, x = (−1, 1), y = −1: \(\mathbf{z}^{[1]} = (-1.5, -2, 2.5)\), \(\mathbf{a}^{[1]} = (0, 0, 2.5)\), \(\hat{y} = \) <b>−2</b>, error 1. Batch MSE <b>0.625</b>, the value <code>nn.MSELoss</code> returns for these weights.`,
note: String.raw`On paper keep the pre-activation and the activation as separate rows, as in the table. Lesson 33 runs the backward pass on this same network and needs both: the gradient through ReLU is 1 where z was positive and 0 where it was not.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Example 1: x = (1, 2), y = 2"], [1, "Example 2: x = (−1, 1), y = −1"]], "fpe") + `<div id="fps"></div>`;
  let ex = 0, k = 0;
  const draw = kk => {
    k = kk; pick(ctl, "fpe", ex);
    const x = N6.X[ex], y = N6.Y[ex], r = fwd6(x, true), YI = [95, 175], YH = [55, 135, 215], XI = 80, XH = 330, XO = 570;
    let s = tx(XI, 22, "input", "middle", "th") + tx(XH, 22, k >= 2 ? "a⁽¹⁾ = ReLU(z⁽¹⁾)" : "z⁽¹⁾", "middle", "th") + tx(XO, 22, "output", "middle", "th");
    N6.W1.forEach((row, j) => row.forEach((w, i) => { s += edge(XI + 22, YI[i], XH - 24, YH[j], w, w, false, i ? 0.72 : 0.28); }));
    N6.w2.forEach((w, j) => { s += edge(XH + 24, YH[j], XO - 25, 135, k >= 3 && r.a1[j] === 0 ? 0 : w, w, k >= 3 && r.a1[j] === 0); });
    x.forEach((v, i) => { s += node(XI, YI[i], 22, "in", v, "x" + (i + 1)); });
    YH.forEach((yy, j) => { const val = k === 0 ? null : k === 1 ? r.z1[j] : r.a1[j]; s += node(XH, yy, 24, k >= 2 && r.a1[j] === 0 ? "off" : k >= 1 ? "hid" : "off", val) + tx(XH + 32, yy - 18, "b = " + mn(N6.b1[j])); });
    s += node(XO, 135, 26, k >= 3 ? "out" : "off", k >= 3 ? r.yh : null, "ŷ") + tx(XO, 194, "b = 0.5", "middle");
    if (k >= 4) s += tx(XO, 220, "target " + mn(y), "middle", "th") + tx(XO, 240, "(ŷ − y)² = " + f((r.yh - y) ** 2, 2), "middle", "th");
    const rows = N6.W1.map((row, j) => [`unit ${j + 1}`, k >= 1 ? mn(`${row[0]}·${x[0]} + ${row[1]}·${x[1]} + ${N6.b1[j]}`).replace(/\+ −/g, "− ") : "", k >= 1 ? fm(r.z1[j], 1) : "", k >= 2 ? fm(r.a1[j], 1) : ""]);
    rows.push(["output", k >= 3 ? mn(`1·${r.a1[0]} + 1·${r.a1[1]} − 1·${r.a1[2]} + 0.5`) : "", k >= 3 ? fm(r.yh, 1) : "", k >= 4 ? "loss " + f((r.yh - y) ** 2, 2) : ""]);
    fig.innerHTML = svg(270, s) + TB(["unit", "weighted sum plus bias", "z", "after ReLU"], rows);
  };
  ML.stepper($("fps"), 5, draw, ["the inputs", "hidden weighted sums z⁽¹⁾", "ReLU", "the output", "the loss"]);
  ctl.querySelectorAll("button[data-fpe]").forEach(b => b.onclick = () => { ex = +b.dataset.fpe; draw(k); });
}},

{s: "7. A batch at once", t: "A batch at once: Ng's columns and PyTorch's rows",
intu: String.raw`Looping over examples is slow, so a layer processes the whole batch in one matrix product. Ng's courses stack the examples as columns: \(X\) is \((n_x, m)\) and \(Z^{[1]} = W^{[1]}X + \mathbf{b}^{[1]}\) is \((n^{[1]}, m)\), with the bias column broadcast across the m columns. PyTorch stacks them as rows: the batch is \((m, n_x)\) and <code>nn.Linear</code> computes \(XW^{\top} + \mathbf{b}\), giving \((m, n^{[1]})\), with the bias row broadcast down the rows. Same weight matrix, same numbers, transposed layout. Pick an example and find its numbers in both: in Ng's layout it is a column of Z, in PyTorch's a row. The two examples of card 6 give exactly the pre-activations computed there by hand.`,
eq: String.raw`\[ \text{Ng: } Z^{[1]} = W^{[1]}X + \mathbf{b}^{[1]}, \qquad (n^{[1]}, m) = (n^{[1]}, n_x)(n_x, m) \]
\[ \text{PyTorch: } Z = XW^{\top} + \mathbf{b}, \qquad (m, n^{[1]}) = (m, n_x)(n_x, n^{[1]}) \]`,
sym: [["m", "number of examples in the batch, B in the PyTorch lessons"], [String.raw`\(n_x\)`, "number of input features, n⁽⁰⁾"], [String.raw`\(X\)`, "the batch, examples as columns in Ng's notation and as rows in PyTorch"], [String.raw`\(Z^{[1]}\)`, "all pre-activations of layer 1 for the whole batch"], ["broadcasting", "the bias vector is added to every example without being copied"]],
how: ["Decide the layout: Ng columns or PyTorch rows.", "Write the shapes next to each matrix.", "Check the inner dimensions match before multiplying.", "Add the bias to every example.", "Read one example's numbers off one column (Ng) or one row (PyTorch)."],
say: String.raw`Vectorizing over a batch applies a layer to all examples in one matrix product, with examples as columns in Ng's notation and as rows in PyTorch, which computes X times W transposed plus b.`,
num: String.raw`Ng: \(X = \begin{pmatrix} 1 & -1 \\ 2 & 1 \end{pmatrix}\), \(Z^{[1]}\) is 3 by 2 with columns \((-0.5, 3, 1)\) and \((-1.5, -2, 2.5)\). PyTorch: X is 2 by 2 with rows (1, 2) and (−1, 1), Z is 2 by 3 with the same numbers as rows. For HW9 MLPDigits at B = 64: (64, 784) times (784, 128) gives (64, 128).`,
note: String.raw`When reading Ng's code next to PyTorch code, transpose in your head once: his \(A^{[l]}\) of shape \((n^{[l]}, m)\) is PyTorch's activation of shape \((m, n^{[l]})\). Exam answers should say which convention they use.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[0, "Ng: examples as columns"], [1, "PyTorch: examples as rows"]], "bal") + btns([[0, "highlight example 1"], [1, "highlight example 2"]], "bae") + `<div id="bao"></div>`;
  let lay = 0, ex = 0;
  const u = () => {
    pick(ctl, "bal", lay); pick(ctl, "bae", ex);
    const Z = N6.X.map(x => fwd6(x, false).z1), W = N6.W1, cell = 40, gf = v => mn(Number.isInteger(v) ? String(v) : f(v, 1));
    const hlCol = (R, c) => new Set(Array.from({ length: R }, (_, i) => i + "," + c)), hlRow = (Cc, r) => new Set(Array.from({ length: Cc }, (_, j) => r + "," + j));
    let s = "";
    if (!lay) {
      const XT = [[1, -1], [2, 1]], ZT = [0, 1, 2].map(j => Z.map(z => z[j]));
      s += ML.grid(W, { x: 40, y: 50, cell, fmt: gf, title: "W⁽¹⁾ (3, 2)", colLab: false, rowLab: false }).s + tx(140, 115, "×", "middle", "th");
      s += ML.grid(XT, { x: 160, y: 50, cell, fmt: gf, title: "X (2, m)", colLab: ["ex 1", "ex 2"], rowLab: false, hl: hlCol(2, ex) }).s + tx(260, 115, "+", "middle", "th");
      s += ML.grid(N6.b1.map(v => [v]), { x: 280, y: 50, cell, fmt: gf, title: "b⁽¹⁾ (3, 1)", colLab: false, rowLab: false }).s + tx(345, 115, "=", "middle", "th");
      s += ML.grid(ZT, { x: 370, y: 50, cell: 48, fmt: gf, title: "Z⁽¹⁾ (3, m)", colLab: ["ex 1", "ex 2"], rowLab: false, hl: hlCol(3, ex) }).s;
      s += tx(40, 230, "example " + (ex + 1) + " is a column of X and a column of Z⁽¹⁾", null, "th") + tx(40, 252, "b⁽¹⁾ is one column, broadcast across the m columns");
    } else {
      const WT = [0, 1].map(i => W.map(r => r[i]));
      s += ML.grid(N6.X, { x: 40, y: 50, cell, fmt: gf, title: "X (m, 2)", rowLab: ["ex 1", "ex 2"], colLab: false, hl: hlRow(2, ex) }).s + tx(140, 95, "×", "middle", "th");
      s += ML.grid(WT, { x: 160, y: 50, cell, fmt: gf, title: "Wᵀ (2, 3)", colLab: false, rowLab: false }).s + tx(300, 95, "+", "middle", "th");
      s += ML.grid([N6.b1], { x: 320, y: 50, cell, fmt: gf, title: "b (3,)", colLab: false, rowLab: false }).s + tx(460, 95, "=", "middle", "th");
      s += ML.grid(Z, { x: 480, y: 50, cell: 48, fmt: gf, title: "Z (m, 3)", rowLab: false, colLab: false, hl: hlRow(3, ex) }).s;
      s += tx(40, 230, "example " + (ex + 1) + " is a row of X and a row of Z", null, "th") + tx(40, 252, "nn.Linear(2, 3) computes X @ W.T + b, the bias row is broadcast down the m rows");
    }
    fig.innerHTML = svg(280, s);
    $("bao").innerHTML = RO([["layout", lay ? "rows, PyTorch" : "columns, Ng"], ["X shape", lay ? "(m, 2)" : "(2, m)"], ["Z shape", lay ? "(m, 3)" : "(3, m)"], ["example " + (ex + 1), "(" + Z[ex].map(v => fm(v, 1)).join(", ") + ")"]]);
  };
  ctl.querySelectorAll("button[data-bal]").forEach(b => b.onclick = () => { lay = +b.dataset.bal; u(); });
  ctl.querySelectorAll("button[data-bae]").forEach(b => b.onclick = () => { ex = +b.dataset.bae; u(); });
  u();
}},

{s: "8. Counting parameters", t: "Counting parameters, from SimpleNN to MLPDigits",
intu: String.raw`A layer from \(n_{\text{in}}\) units to \(n_{\text{out}}\) units has \(n_{\text{out}} n_{\text{in}}\) weights and \(n_{\text{out}}\) biases, and activations have none. Add the layers. HW8's SimpleNN of width H has \(H + H\) in the first layer and \(H + 1\) in the second, \(3H + 1\) in total: 4 at width 1 and 151 at width 50. HW9's LinearDigits has 7,850 and MLPDigits 101,770, of which 100,352 sit in the first weight matrix. That is the pattern for image inputs: the first layer holds almost everything, 98.6% here, because every hidden unit sees all 784 pixels. Try the presets, then type your own sizes. A count you derived by hand should always be checked against <code>sum(p.numel() for p in model.parameters())</code>, which is what HW9 4B does.`,
eq: String.raw`\[ P = \sum_{l=1}^{L} \big(n^{[l]} n^{[l-1]} + n^{[l]}\big) \]
\[ \text{SimpleNN: } P = 3H + 1 \]
\[ \text{MLPDigits: } 784 \cdot 128 + 128 + 128 \cdot 10 + 10 = 101{,}770 \]`,
sym: [["P", "total number of trainable parameters"], [String.raw`\(n^{[l]} n^{[l-1]}\)`, "weights of layer l, the entries of W⁽ˡ⁾"], [String.raw`\(n^{[l]}\)`, "biases of layer l"], ["numel", "number of entries of a tensor, summed over model.parameters()"]],
how: ["Write the layer sizes as a list.", "For each neighbouring pair, multiply the sizes for the weights.", "Add the size of the later layer for the biases.", "Sum over the layers. Activations, Flatten and ReLU add nothing.", "Check with numel in PyTorch."],
say: String.raw`A fully connected layer from n in to n out has n out times n in weights plus n out biases, and the parameter count of a multilayer perceptron is the sum over its layers.`,
num: String.raw`SimpleNN: <b>4</b> and <b>151</b>. LinearDigits <b>7,850</b>, MLPDigits <b>101,770</b>. SmallClassifier 10-32-2: 352 + 66 = <b>418</b>. Ng's digits lab 400-25-15-1: 10,025 + 390 + 16 = <b>10,431</b>. Card 6's 2-3-1 network: 9 + 4 = 13.`,
note: String.raw`More parameters is not the same as better. HW9's MLP has 13 times the parameters of the linear model and gained 3.7 points of validation accuracy (0.920 against 0.883), and HW8's 151-parameter network did not overfit 30 points. Report the count beside every result anyway, it is the first thing a reader asks.`,
r(fig, ctl) {
  const PRE = [["SimpleNN H = 1", "1, 1, 1"], ["SimpleNN H = 50", "1, 50, 1"], ["LinearDigits", "784, 10"], ["MLPDigits", "784, 128, 10"], ["SmallClassifier", "10, 32, 2"], ["Ng digits lab", "400, 25, 15, 1"]];
  ctl.innerHTML = btns(PRE.map((p, i) => [i, p[0]]), "pcp") + `<div class="row"><label for="pcin">layer sizes</label><input id="pcin" type="text" value="784, 128, 10" style="flex:1;min-width:160px;font-family:var(--mono);font-size:14px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--fg)"></div><div id="pco"></div>`;
  let cur = 3;
  const u = () => {
    pick(ctl, "pcp", cur);
    const sz = $("pcin").value.split(/[,\s]+/).filter(Boolean).map(Number);
    if (sz.length < 2 || sz.length > 8 || sz.some(n => !Number.isInteger(n) || n < 1 || n > 100000)) { fig.innerHTML = svg(60, tx(20, 34, "Type two to eight whole numbers from 1 to 100,000, separated by commas.", null, "th")); $("pco").innerHTML = ""; return; }
    const L = pcount(sz), tot = L.reduce((s, q) => s + q.w + q.b, 0);
    let s = tx(20, 22, "parameters per layer, weights in blue and biases in coral", null, "th");
    L.forEach((q, i) => {
      const y = 40 + i * 36, ww = 340 * q.w / tot, wb = Math.max(2, 340 * q.b / tot);
      s += tx(20, y + 18, "layer " + (i + 1) + ": " + sz[i] + " → " + sz[i + 1]) + `<rect x="170" y="${y + 4}" width="${Math.max(1, ww)}" height="20" fill="${C.blue}" opacity="0.8"/><rect x="${170 + ww}" y="${y + 4}" width="${wb}" height="20" fill="${C.coral}"/>`;
      s += tx(170 + ww + wb + 8, y + 18, (q.w + q.b).toLocaleString("en-US") + " (" + (100 * (q.w + q.b) / tot).toFixed(1) + "%)");
    });
    const H = 40 + L.length * 36 + 30;
    s += tx(20, H - 6, "total " + tot.toLocaleString("en-US") + " trainable parameters", null, "th");
    fig.innerHTML = svg(H + 6, s);
    $("pco").innerHTML = RO([["layers L", L.length], ["weights", L.reduce((a, q) => a + q.w, 0).toLocaleString("en-US")], ["biases", L.reduce((a, q) => a + q.b, 0).toLocaleString("en-US")], ["total", tot.toLocaleString("en-US")]]);
  };
  ctl.querySelectorAll("button[data-pcp]").forEach(b => b.onclick = () => { cur = +b.dataset.pcp; $("pcin").value = PRE[cur][1]; u(); });
  $("pcin").oninput = () => { cur = PRE.findIndex(p => p[1].replace(/\s/g, "") === $("pcin").value.replace(/\s/g, "")); u(); };
  u();
}},

{s: "9. Width and depth", t: "Width against depth: how many straight pieces a network can draw",
intu: String.raw`Two ReLU units can build the tent \(T(x) = \text{ReLU}(2x) - \text{ReLU}(4x - 2)\), which rises from 0 to 1 and falls back on \([0, 1]\). Feed the tent into another tent and every rising and falling half is folded again, so L layers of two units each draw \(2^L\) straight pieces. Move the slider. One hidden layer can only add hinges, at most one new piece per unit, so it needs \(2^L - 1\) units to draw the same zigzag. At depth 1 and 2 the shallow network is the smaller one, at depth 3 they are about even, and from there the gap explodes: 31 parameters against 94 at depth 5, 61 against 3,070 at depth 10. This is the argument behind Ng's "why deep representations" video in course 1 week 4, where computing the parity of many inputs takes a small deep circuit but an exponentially wide shallow one. It is a statement about what can be represented. Whether training finds such weights is a separate question, and Lessons 33 to 35 are about making it find good ones.`,
eq: String.raw`\[ T(x) = \text{ReLU}(2x) - \text{ReLU}(4x - 2), \qquad T^{(L)} = T \circ \cdots \circ T \;\; (L \text{ times}) \]
\[ \text{pieces} = 2^L, \qquad P_{\text{deep}} = 6L + 1, \qquad P_{\text{shallow}} \geq 3(2^L - 1) + 1 \]`,
sym: [["T", "the tent, two ReLU units, 0 at both ends and 1 in the middle"], ["L", "number of hidden layers of two units each"], ["pieces", "straight segments of the drawn function on [0, 1]"], [String.raw`\(P_{\text{deep}}\)`, "parameters of the 1-2-2-...-2-1 network: 4 + 6(L − 1) + 3"], [String.raw`\(P_{\text{shallow}}\)`, "parameters of a 1-H-1 network with H = 2ᴸ − 1, the fewest units that give 2ᴸ pieces"]],
how: ["Build one tent from two ReLU units.", "Compose: the next layer's units read the previous tent's output.", "Count the pieces: each layer doubles them.", "Count the hinges a single hidden layer needs for the same number of pieces.", "Compare the parameter counts as L grows."],
say: String.raw`A deep ReLU network can represent functions with a number of linear pieces exponential in its depth using only a few units per layer, while a single hidden layer needs a number of units that grows with the number of pieces.`,
num: String.raw`Depth 1: 2 pieces, 7 against 4 parameters. Depth 3: 8 pieces, 19 against 22. Depth 5: <b>32</b> pieces, <b>31</b> against <b>94</b>. Depth 6: 64 pieces, 37 against 190. Depth 10: 1,024 pieces, 61 against 3,070.`,
note: String.raw`This explains why deep networks can be efficient, it does not say deeper is always better. For a smooth target like HW8's parabola, one hidden layer of 50 units was plenty. Choose depth by validation, as for any other capacity setting in Lesson 19.`,
r(fig, ctl) {
  ctl.innerHTML = sl("wdl", "depth L", 1, 6, 1, 3) + `<div id="wdo"></div>`;
  const u = () => {
    const L = +$("wdl").value; $("wdlv").textContent = L;
    const A = ML.axes(60, 20, 590, 170, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, nx: 8, ny: 2, fx: v => v.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""), fy: v => v.toFixed(1), xl: "input x", yl: "T applied L times" });
    const xs = Array.from({ length: 2049 }, (_, i) => i / 2048);
    let s = A.s + ML.path(xs.map(x => [A.X(x), A.Y(tent(x, L))]), C.teal, 2);
    if (L <= 4) for (let k = 0; k <= 2 ** L; k++) s += `<circle cx="${A.X(k / 2 ** L)}" cy="${A.Y(tent(k / 2 ** L, L))}" r="3" fill="${C.purple}"/>`;
    const rows = [1, 2, 3, 4, 5, 6, 10].map(l => [l === L ? `<b>${l}</b>` : String(l), (2 ** l).toLocaleString("en-US"), String(6 * l + 1), (2 ** l - 1).toLocaleString("en-US"), (3 * 2 ** l - 2).toLocaleString("en-US")]);
    fig.innerHTML = svg(230, s) + TB(["depth L", "pieces", "deep: parameters", "shallow: units needed", "shallow: parameters"], rows);
    $("wdo").innerHTML = RO([["pieces", 2 ** L], ["deep 1-2-...-2-1", (6 * L + 1) + " parameters"], ["one hidden layer", (2 ** L - 1) + " units, " + (3 * 2 ** L - 2) + " parameters"]]);
  };
  $("wdl").oninput = u; u();
}},

{s: "10. Learned features", t: "Learned features: what each hidden unit contributes on a ring",
intu: String.raw`Two hundred fresh points, label 1 inside a circle of radius about 1.26 with 5% of the labels flipped, 140 for training and 60 for validation. Lesson 29 separated a ring like this by adding \(x_1^2 + x_2^2\) by hand. Here a 2-H-1 ReLU network was trained with <code>BCEWithLogitsLoss</code> and finds its own features. Each hidden unit is a straight line in the input plane, the dashed lines, on one side of which the unit is on. The output adds the units, so the decision region is a polygon built from those lines. With one unit the network found nothing better than calling every point outside, which is the majority rule at 0.65, the same as logistic regression. Two units cut a wedge, three already make a triangle that reaches 0.933 on validation, and four give a rounder polygon. Eight units fit the training points a little better but bring no gain on validation.`,
eq: String.raw`\[ h_j = \text{ReLU}(\mathbf{w}_j \cdot \mathbf{x} + b_j), \qquad z = \sum_{j=1}^{H} v_j h_j + c \]
\[ \text{class 1 when } z \geq 0, \qquad P = 4H + 1 \]`,
sym: [[String.raw`\(\mathbf{w}_j \cdot \mathbf{x} + b_j = 0\)`, "the line where hidden unit j switches on, dashed in the picture"], ["z", "the logit, BCEWithLogitsLoss applies the sigmoid inside the loss"], ["decision region", "the inputs with z ≥ 0, shaded"], ["P", "parameters of a 2-H-1 network, 2H + H + H + 1"]],
how: ["Draw the line of each hidden unit.", "Mark on which side each unit is active.", "Add the active units' contributions with their output weights.", "Shade where the logit is at least 0.", "Compare training and validation accuracy as the width grows."],
say: String.raw`Each ReLU unit of the first hidden layer is active on one side of a hyperplane in input space, and the output layer combines these half-space features into a piecewise linear decision boundary that can enclose a curved class.`,
num: String.raw`Validation accuracy: H = 1 <b>0.650</b> (the majority rule, logistic regression also 0.650), H = 2 0.717, H = 3 <b>0.933</b>, H = 4 0.950, H = 8 0.950. Training loss 0.533, 0.430, 0.205, 0.205, 0.142. Parameters 5, 9, 13, 17, 33.`,
note: String.raw`H = 8 matches H = 4 on validation accuracy but its validation loss is 0.756 against 0.408: it is more confident on the points it gets wrong. As in HW9 4C, the model with the lowest validation loss need not win every metric, so state which one you select on before you look.`,
r(fig, ctl) {
  ctl.innerHTML = btns([1, 2, 3, 4, 8].map(h => [h, "H = " + h]), "rgh") + btns([[1, "show unit lines"], [0, "hide unit lines"]], "rgl") + `<div id="rgo"></div>`;
  let H = 3, lines = 1;
  const Y = RY.split("").map(Number);
  const u = () => {
    pick(ctl, "rgh", H); pick(ctl, "rgl", lines); const R = RW[H];
    const z = x => R.W1.reduce((s, w, j) => s + R.w2[j] * relu(w[0] * x[0] + w[1] * x[1] + R.b1[j]), R.b2);
    const A = ML.axes(50, 15, 300, 300, { xmin: -2.2, xmax: 2.2, ymin: -2.2, ymax: 2.2, nx: 4, ny: 4, fx: v => mn(+v.toFixed(1)), fy: v => mn(+v.toFixed(1)), xl: "x₁", yl: "x₂", grid: false });
    let s = "", n = 50, d = 4.4 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = -2.2 + (i + 0.5) * d, cy = -2.2 + (j + 0.5) * d; if (z([cx, cy]) >= 0) s += `<rect x="${A.X(cx - d / 2)}" y="${A.Y(cy + d / 2)}" width="${300 / n + 0.4}" height="${300 / n + 0.4}" fill="${C.coral}" opacity="0.16"/>`; }
    s += A.s + `<circle cx="${A.X(0)}" cy="${A.Y(0)}" r="${A.X(Math.sqrt(1.6)) - A.X(0)}" fill="none" stroke="${C.gray}" stroke-dasharray="2 4"/>`;
    s += `<clipPath id="rgclip"><rect x="50" y="15" width="300" height="300"/></clipPath><g clip-path="url(#rgclip)">`;
    if (lines) R.W1.forEach((w, j) => { const b = R.b1[j]; let p; if (Math.abs(w[1]) > Math.abs(w[0])) p = [[-2.2, (-b - w[0] * -2.2) / w[1]], [2.2, (-b - w[0] * 2.2) / w[1]]]; else p = [[(-b - w[1] * -2.2) / w[0], -2.2], [(-b - w[1] * 2.2) / w[0], 2.2]]; s += ML.path(p.map(q => [A.X(q[0]), A.Y(q[1])]), C.purple, 1.6, "6 4"); });
    s += `</g>`;
    RX.forEach((x, i) => { const tr = i < 140, col = Y[i] ? C.coral : C.blue; s += `<circle cx="${A.X(x[0])}" cy="${A.Y(x[1])}" r="${tr ? 3.6 : 4.2}" fill="${tr ? col : "none"}" stroke="${col}" stroke-width="${tr ? 0.6 : 1.6}"/>`; });
    let ctr = 0, cva = 0, ltr = 0, lva = 0;
    RX.forEach((x, i) => { const zz = z(x), ok = (zz >= 0 ? 1 : 0) === Y[i], l = Math.max(zz, 0) - zz * Y[i] + Math.log1p(Math.exp(-Math.abs(zz))); if (i < 140) { ctr += ok; ltr += l; } else { cva += ok; lva += l; } });
    s += tx(380, 40, "2-" + H + "-1 ReLU network", null, "th") + tx(380, 64, "shaded: predicted class 1 (z ≥ 0)") + tx(380, 84, "dotted circle: the true boundary") + tx(380, 104, "filled: training, hollow: validation") + tx(380, 124, "coral: label 1, blue: label 0") + (lines ? tx(380, 144, "dashed: where each hidden unit turns on") : "");
    s += tx(380, 184, "training accuracy " + f(ctr / 140, 3), null, "th") + tx(380, 206, "validation accuracy " + f(cva / 60, 3), null, "th") + tx(380, 228, "logistic regression: 0.650");
    fig.innerHTML = svg(350, s);
    $("rgo").innerHTML = RO([["hidden units", H], ["parameters", 4 * H + 1], ["training loss", f(ltr / 140)], ["validation loss", f(lva / 60)], ["validation accuracy", f(cva / 60, 3)]]);
  };
  ctl.querySelectorAll("button[data-rgh]").forEach(b => b.onclick = () => { H = +b.dataset.rgh; u(); });
  ctl.querySelectorAll("button[data-rgl]").forEach(b => b.onclick = () => { lines = +b.dataset.rgl; u(); });
  u();
}},

{s: "11. Breaking symmetry", t: "Why the hidden units must start different",
intu: String.raw`The target is \(y = |x|\) on 21 points, which needs two hinges, and the network is 1-3-1 with ReLU trained by full-batch gradient descent at learning rate 0.05. Start all three hidden units with the same weights. Every unit then computes the same activation, receives the same gradient and makes the same update, so after any number of steps they are still identical, the dots in the right panel stay on top of each other, and the network behaves like one unit. It settles at loss 0.25397, which is exactly the best a single hinge can do. Start them at different values and they spread out, two of them become the two arms of the V, and the loss drops to 0.00001. With every weight at zero it is worse: ReLU passes no gradient at 0, the hidden layer never moves, and only the output bias learns, to the mean 1.0476. This is Ng's random initialization video in course 1 week 3. PyTorch's <code>nn.Linear</code> draws its weights at random, which is why you rarely see the problem until you write your own initialization.`,
eq: String.raw`\[ \mathbf{w}^{[1]}_1 = \mathbf{w}^{[1]}_2 = \mathbf{w}^{[1]}_3 \;\Rightarrow\; \frac{\partial J}{\partial \mathbf{w}^{[1]}_1} = \frac{\partial J}{\partial \mathbf{w}^{[1]}_2} = \frac{\partial J}{\partial \mathbf{w}^{[1]}_3} \]
\[ \text{so the units stay equal after every update} \]`,
sym: [["symmetry", "hidden units with identical weights, which gradient descent cannot tell apart"], ["random initialization", "small random starting weights, different for every unit"], [String.raw`\(J\)`, "the training cost, the mean squared error here"], ["dead start", "all weights zero with ReLU: every hidden gradient is zero"]],
how: ["Pick an initialization.", "Run gradient descent and watch the hidden units' weights.", "Equal units get equal gradients and stay equal.", "Compare the final loss with the best one-unit fit.", "Use random initial weights, PyTorch's default, to break the tie."],
say: String.raw`If all hidden units start with the same weights they receive the same gradients and remain identical, so the layer acts as a single unit, and random initialization breaks this symmetry.`,
num: String.raw`After 3,000 steps: equal start, loss <b>0.25397</b> with all three units at w = 0.505, b = −0.438 (best single hinge 0.25397). Different start, loss <b>0.00001</b>. All zero, loss <b>0.36916</b>, the constant 1.0476. The different start was checked against PyTorch SGD after 1,000 steps.`,
note: String.raw`The bias may start at zero, Ng says, as long as the weights are random. How large the random weights should be depends on the layer width, which is Xavier and He initialization in Lesson 34.`,
r(fig, ctl) {
  ctl.innerHTML = btns([["same", "All units equal"], ["diff", "Different starts"], ["zero", "All zero"]], "syi") + sl("syt", "gradient descent steps", 0, 3000, 10, 0) + `<div id="syo"></div>`;
  let key = "same";
  const COL = [C.coral, C.blue, C.purple];
  const u = () => {
    pick(ctl, "syi", key); const t = +$("syt").value; $("sytv").textContent = t; const H = SYM[key], st = H[t / 10];
    const A = ML.axes(50, 20, 290, 230, { xmin: -2, xmax: 2, ymin: -0.5, ymax: 2.5, nx: 4, ny: 6, fx: v => mn(v), fy: v => mn(v.toFixed(1)), xl: "input x", yl: "output" });
    const xs = Array.from({ length: 81 }, (_, i) => -2 + i * 0.05), g = x => st.W.reduce((s, w, j) => s + st.v[j] * relu(w * x + st.b[j]), st.c);
    let s = A.s + SX.map((x, i) => `<circle cx="${A.X(x)}" cy="${A.Y(SY[i])}" r="3.5" fill="${C.gray}"/>`).join("") + ML.path(xs.map(x => [A.X(x), A.Y(g(x))]), C.teal, 2.5);
    const B = ML.axes(420, 20, 230, 230, { xmin: -1.5, xmax: 1.5, ymin: -0.6, ymax: 0.6, nx: 6, ny: 4, fx: v => mn(v), fy: v => mn(v.toFixed(1)), xl: "hidden weight w", yl: "hidden bias b" });
    s += B.s;
    for (let j = 0; j < 3; j++) { s += ML.path(H.slice(0, t / 10 + 1).map(q => [B.X(q.W[j]), B.Y(Math.max(-0.6, Math.min(0.6, q.b[j])))]), COL[j], 1.2); s += `<circle cx="${B.X(st.W[j])}" cy="${B.Y(Math.max(-0.6, Math.min(0.6, st.b[j])))}" r="${7 - 2 * j}" fill="${COL[j]}" opacity="0.85"/>`; }
    s += tx(535, 14, key === "diff" ? "three units, three paths" : "three units on one spot", "middle");
    fig.innerHTML = svg(290, s);
    $("syo").innerHTML = RO([["loss", st.L < 1e-4 ? st.L.toExponential(1) : f(st.L, 5)], ["w (3 units)", st.W.map(v => f(v, 3)).join(", ")], ["b (3 units)", st.b.map(v => f(v, 3)).join(", ")], ["output weights", st.v.map(v => f(v, 3)).join(", ")]]);
  };
  $("syt").oninput = u; ctl.querySelectorAll("button[data-syi]").forEach(b => b.onclick = () => { key = b.dataset.syi; u(); });
  u();
}},

{s: "12. In PyTorch", t: "The MLP in PyTorch: HW9's MLPDigits and the bugs that break it",
intu: String.raw`HW9's MLPDigits flattens a \((B, 1, 28, 28)\) batch to \((B, 784)\), maps it to 128 hidden units, applies ReLU and maps to 10 logits, 101,770 parameters. Move the batch size and watch every shape keep its leading B. Then try the five bugs. A missing ReLU raises nothing and keeps the parameter count, but the model is now one 10 by 784 linear map. Images of the wrong size fail loudly at the first linear layer. A bare <code>x.flatten()</code> merges the batch axis too: at B = 7 it fails, at B = 1 it silently runs and returns a loss, which is how a shape bug survives a one-example test. A ReLU after the last layer is wrong twice: on logits it clips every negative score to 0 and blocks the gradient of a true class whose logit is negative, and on a regression output it makes negative predictions impossible, the reason HW8 2B says no ReLU on the final regression output.`,
eq: String.raw`\[ (B, 1, 28, 28) \xrightarrow{\text{Flatten}} (B, 784) \xrightarrow{\text{Linear}} (B, 128) \]
\[ (B, 128) \xrightarrow{\text{ReLU}} (B, 128) \xrightarrow{\text{Linear}} (B, 10) \]`,
sym: [[String.raw`\(\texttt{nn.Flatten(start\_dim=1)}\)`, "merges every axis after the batch axis, which is also what nn.Flatten() does by default"], [String.raw`\(\texttt{x.flatten()}\)`, "merges every axis including the batch axis"], ["logits", "the raw outputs, CrossEntropyLoss applies log-softmax itself"], ["B", "the batch size, kept as the first axis through every layer"]],
how: ["Write the shape after every layer with B kept symbolic.", "Test the forward pass with B = 1 and B = 7, as HW9 4B does.", "Count parameters with numel and compare with your hand count.", "Keep a nonlinearity between linear layers and none after the last one.", "Return raw logits for classification and raw values for regression."],
say: String.raw`A PyTorch multilayer perceptron flattens each example while keeping the batch axis, alternates linear layers and nonlinear activations, and returns unactivated outputs that the loss function interprets.`,
num: String.raw`Correct model at B = 7: (7, 784), (7, 128), (7, 128), (7, 10), <b>101,770</b> parameters. No ReLU: same count, equal to one (10, 784) map, rank 10. 32 by 32 images: (7x1024 and 784x128). <code>x.flatten()</code>: (1x5488 and 784x128) at B = 7, a silent loss 2.5733 at B = 1. ReLU on logits (2, −1, 0.5, −3) with true class 1: gradient on the true logit <b>0</b> instead of −0.9611. ReLU on a regression output: training MSE <b>1.1464</b> against 0.0002.`,
note: String.raw`HW9 and HW10 both check a model at B = 1 and B = 7 for this reason. Put the same two-line check in the project's tests next to the parameter count.`,
r(fig, ctl) {
  const BASE = ["class MLPDigits(nn.Module):", "    def __init__(self):", "        super().__init__()", "        self.net = nn.Sequential(", "            nn.Flatten(start_dim=1),", "            nn.Linear(784, 128), nn.ReLU(),", "            nn.Linear(128, 10))", "    def forward(self, x):", "        return self.net(x)"];
  const CASES = [
    ["Correct", BASE, -1],
    ["No ReLU", BASE.map((l, i) => i === 5 ? "            nn.Linear(784, 128),          # ReLU forgotten" : l), 5],
    ["32 by 32 images", [...BASE, "", "model(torch.randn(7, 1, 32, 32))"], 10],
    ["x.flatten()", BASE.map((l, i) => i === 4 ? "            # no Flatten layer" : i === 8 ? "        return self.net(x.flatten())" : l), 8],
    ["ReLU on logits", BASE.map((l, i) => i === 6 ? "            nn.Linear(128, 10), nn.ReLU())  # then CrossEntropyLoss" : l), 6],
    ["ReLU on a regression output", ["net = nn.Sequential(", "    nn.Linear(1, 16), nn.ReLU(),", "    nn.Linear(16, 1), nn.ReLU())   # targets x² − 1.5 can be negative", "# Adam lr 0.02, 2000 full-batch steps on 41 points in [−2, 2]"], 2]
  ];
  ctl.innerHTML = btns(CASES.map((c, i) => [i, c[0]]), "ptc") + `<div id="ptb"></div><div id="pto"></div>`;
  let ci = 0;
  const u = () => {
    pick(ctl, "ptc", ci);
    $("ptb").innerHTML = ci === 0 ? sl("ptB", "batch size B", 1, 64, 1, $("ptB") ? +$("ptB").value : 7) : "";
    let out;
    if (ci === 0) { const B = +$("ptB").value; $("ptBv").textContent = B; out = ["$ python check_shapes.py", `input     (${B}, 1, 28, 28)`, `Flatten   (${B}, 784)`, `Linear    (${B}, 128)`, `ReLU      (${B}, 128)`, `Linear    (${B}, 10)`, "parameters 101770"]; $("ptB").oninput = u; }
    else if (ci === 1) out = ["$ python check_shapes.py", "Flatten (7, 784)  Linear (7, 128)  Linear (7, 10)", "parameters 101770", "same output as x @ (W2 @ W1).T + (W2 @ b1 + b2): True", "effective weight shape (10, 784), rank 10"];
    else if (ci === 2) out = ["Traceback (most recent call last):", "  ...", "RuntimeError: addmm: mat1 and mat2 shapes cannot be multiplied (7x1024 and 784x128)"];
    else if (ci === 3) out = ["$ B = 7", "RuntimeError: addmm: mat1 and mat2 shapes cannot be multiplied (1x5488 and 784x128)", "$ B = 1", "output shape torch.Size([10])   # the batch axis is gone", "cross_entropy(output, tensor([3])) = 2.5733   # no error"];
    else if (ci === 4) out = ["logits            tensor([[ 2.0000, -1.0000,  0.5000, -3.0000]])   true class 1", "after ReLU        tensor([[2.0000, 0.0000, 0.5000, 0.0000]])", "loss 2.4013   grad tensor([[0.6694, 0.0000, 0.1494, 0.0000]])", "without ReLU: loss 3.2466   grad tensor([[ 0.7815, -0.9611,  0.1744,  0.0053]])"];
    else out = ["targets below 0: 61% of the 41 points", "without final ReLU: training MSE 0.0002, smallest prediction -1.5062", "with final ReLU:    training MSE 1.1464, smallest prediction 0.0000", "best possible with outputs >= 0: MSE 0.7169"];
    const NOTE = ["Every shape keeps B in front, from 1 to 64.", "No error and no warning. Only the algebra, or a validation score stuck at the linear model's, gives it away.", "The first Linear expects 784 = 28 · 28 features and receives 1,024 = 32 · 32.", "Test with two batch sizes, never only with one example.", "The true class sits at −1, ReLU turns it into 0, and its gradient becomes 0, so the loss can never push it up.", "A ReLU output can only fit the nonnegative half of the targets, and dead output units make training stall above even that floor."][ci];
    fig.innerHTML = ML.code(CASES[ci][1], CASES[ci][2]) + ML.term(out) + `<p class="note">${NOTE}</p>`;
    $("pto").innerHTML = RO([["case", CASES[ci][0]], ["parameters", ci === 5 ? "49" : "101,770"], ["raises an error", ci === 2 || ci === 3 ? "yes" + (ci === 3 ? ", at B = 7 only" : "") : "no"]]);
  };
  ctl.querySelectorAll("button[data-ptc]").forEach(b => b.onclick = () => { ci = +b.dataset.ptc; u(); });
  u();
}},

{s: "13. With the agent", t: "Do it with the agent: an MLP module with tests that pin the hand numbers",
intu: String.raw`The lesson as code: one <code>MLP</code> class that takes a list of layer sizes, a parameter counter, and a NumPy forward pass you can compare with PyTorch. The tests pin the numbers on these cards, so a missing activation, an activation after the last layer, a flatten that eats the batch axis or a miscounted layer fails with a value you can check by hand.`,
eq: String.raw`\[ \texttt{sizes} \to \texttt{MLP} \to \texttt{count\_parameters} \to \texttt{forward\_by\_hand} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{MLP(sizes, activation)}\)`, "Flatten, then Linear layers with the activation between them and none after the last"], [String.raw`\(\texttt{count\_parameters}\)`, "sum of numel over the trainable parameters"], [String.raw`\(\texttt{forward\_by\_hand}\)`, "the same forward pass in NumPy, layer by layer"], ["tests", "the counts of card 8, the forward pass of card 6, the collapse of card 3, XOR and symmetry"]],
how: ["Paste the command.", "Read the model: is there an activation between layers and none after the last one?", "Read the flatten: does it keep dimension 0?", "Run the tests, the expected values come from the cards.", "Commit the module with its tests."],
say: String.raw`A tested MLP module builds the network from a list of layer sizes and is checked against hand-computed parameter counts, a forward pass by hand, the collapse without activations and batch sizes of one and seven.`,
num: String.raw`Tests expect <b>101,770</b>, 418, 10,431 and 151 parameters, predictions <b>(2.5, −2.0)</b> with MSE 0.625 for card 6, XOR outputs (0, 1, 1, 0), and three equal rows after 100 steps from an equal start.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/mlp.py with PyTorch and numpy. class MLP(nn.Module) takes sizes (a list such as [784, 128, 10]) and activation ('relu' or None). It starts with nn.Flatten(start_dim=1), then one nn.Linear per neighbouring pair of sizes, with the activation between linear layers and nothing after the last one. count_parameters(model) returns the sum of numel over parameters with requires_grad. forward_by_hand(weights, biases, x) does the same forward pass in numpy with ReLU between layers. Create tests/test_mlp.py with pytest: (1) MLP([784, 128, 10]) has 101770 parameters, MLP([10, 32, 2]) 418, MLP([400, 25, 15, 1]) 10431 and MLP([1, 50, 1]) 151. (2) MLP([784, 128, 10]) maps inputs of shape (1, 1, 28, 28) and (7, 1, 28, 28) to (1, 10) and (7, 10). (3) With W1 = [[1, -1], [2, 1], [-1, 0.5]], b1 = [0.5, -1, 1], W2 = [[1, 1, -1]], b2 = [0.5], the inputs [[1, 2], [-1, 1]] give predictions [2.5, -2.0] and MSE 0.625 against targets [2, -1], both with forward_by_hand and with these weights copied into MLP([2, 3, 1]). (4) MLP([5, 8, 3], activation=None) gives the same output as one nn.Linear(5, 3) with weight W2 @ W1 and bias W2 @ b1 + b2, to 1e-5. (5) forward_by_hand with W = [[1, 1], [1, 1]], b = [0, -1], w = [[1, -2]], c = [0] gives 0, 1, 1, 0 for the four XOR inputs. (6) MLP([1, 3, 1]) with every first-layer weight 0.5 and bias 0.1 and every output weight 0.5, trained for 100 SGD steps at lr 0.05 on y = |x| for 21 points from -2 to 2, still has three equal rows in its first weight. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed"],
    files: [["src/mlp.py", "MLP, count_parameters, forward_by_hand"], ["tests/test_mlp.py", "six tests with the values from cards 3, 4, 6, 8 and 11"]],
    checks: ["nn.Flatten(start_dim=1) is the first layer, and the shape test uses B = 1 and B = 7", "there is an activation between linear layers and none after the last layer", "the parameter counts match the hand counts of card 8", "the forward pass test uses card 6's weights and gets 2.5, −2.0 and 0.625", "the collapse test compares with a real nn.Linear built from W2 @ W1, not with a printed number"]
  });
}},

{s: "14. Test", t: "Lesson 32 test: the multilayer perceptron",
intu: String.raw`Twelve questions on layers and notation, why activations are needed, forward passes, shapes in both conventions, parameter counts, hinges, depth, initialization and PyTorch bugs. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to backpropagation by hand.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A fully connected network has layer sizes 6, 16, 8, 2 with biases everywhere. How many trainable parameters does it have?", o: ["266", "240", "250", "292"], a: 0, why: "6 · 16 + 16 = 112, 16 · 8 + 8 = 136, 8 · 2 + 2 = 18, total 266. Without biases it would be 240. Card 8." },
    { q: "In Ng's notation the layer sizes are \\(n^{[0]} = 5\\), \\(n^{[1]} = 7\\), \\(n^{[2]} = 3\\). The shape of \\(W^{[2]}\\) is", o: ["(7, 3)", "(3, 7)", "(3, 5)", "(7, 5)"], a: 1, why: "One row per unit of layer 2 and one column per unit of layer 1: (3, 7). Card 2." },
    { q: "A 1-2-1 network without activations has \\(W^{[1]} = (2, -1)^\\top\\), \\(\\mathbf{b}^{[1]} = (1, 3)\\), \\(\\mathbf{w}^{[2]} = (1, 2)\\), \\(b^{[2]} = -4\\). It outputs", o: ["3 for every x", "x + 3", "4x + 3", "a line with one bend"], a: 0, why: "(2x + 1) + 2(−x + 3) − 4 = 3. The x terms cancel, the stack is one linear map with slope 0. Card 3." },
    { q: "x = (1, −2), \\(W^{[1]}\\) has rows (2, 1) and (−1, −1), \\(\\mathbf{b}^{[1]} = (0, 1)\\), ReLU, \\(\\mathbf{w}^{[2]} = (3, -2)\\), \\(b^{[2]} = 1\\). The output is", o: ["1", "3", "−3", "−1"], a: 2, why: "z = (2 − 2 + 0, −1 + 2 + 1) = (0, 2), ReLU keeps (0, 2), output 3 · 0 − 2 · 2 + 1 = −3. Card 6." },
    { q: "The weight of <code>nn.Linear(784, 64)</code> has shape", o: ["(784, 64)", "(784,)", "(64,)", "(64, 784)"], a: 3, why: "PyTorch stores (out, in), the same as Ng's \\(W^{[l]}\\) of shape \\((n^{[l]}, n^{[l-1]})\\). Card 2." },
    { q: "A network with one input, one hidden layer of 5 ReLU units and one output can draw at most how many straight pieces?", o: ["5", "6", "10", "32"], a: 1, why: "Each unit adds at most one knot, so 5 knots and 6 pieces. Card 5." },
    { q: "Why does the XOR network of Goodfellow et al. work with a linear output layer?", o: ["the output layer uses a sigmoid", "ReLU makes the output layer nonlinear", "the hidden layer maps (0, 1) and (1, 0) to the same point, where a line separates the classes", "XOR is linearly separable after scaling"], a: 2, why: "The hidden layer changes the coordinates. In the (h₁, h₂) plane the classes are separable by h₁ − 2h₂ = 0.5. Card 4." },
    { q: "Every first-layer weight of an MLP is initialized to 0.3 and every bias to 0. After training, the hidden layer", o: ["behaves like a single unit, its units stayed identical", "works normally, training breaks the tie", "has all weights 0", "has random weights"], a: 0, why: "Identical units get identical gradients and identical updates, so they never separate. Card 11." },
    { q: "A batch of shape (32, 3, 16, 16) goes through <code>nn.Flatten()</code>. The result is", o: ["(24576,)", "(32, 3, 256)", "(32, 48, 16)", "(32, 768)"], a: 3, why: "nn.Flatten keeps dimension 0 and merges the rest: 3 · 16 · 16 = 768. A bare x.flatten() would give (24576,). Card 12." },
    { q: "A regression network's targets lie between −5 and 5, and its last layer is followed by <code>nn.ReLU()</code>. What happens?", o: ["nothing, ReLU is the identity for regression", "it can never predict a negative value", "the loss becomes nan", "training is faster"], a: 1, why: "ReLU clips the output at 0, so the negative targets are out of reach and the loss stalls. Card 12." },
    { q: "Four hidden layers of two ReLU units each compose the tent map four times. The function has how many straight pieces on [0, 1]?", o: ["8", "9", "16", "25"], a: 2, why: "Each tent doubles the pieces: 2⁴ = 16. A single hidden layer would need 15 units for that. Card 9." },
    { q: "In PyTorch a batch of shape (50, 4) goes through Linear(4, 6), ReLU, Linear(6, 3). In Ng's column convention the same output \\(A^{[2]}\\) has shape", o: ["(50, 3)", "(6, 50)", "(3, 6)", "(3, 50)"], a: 3, why: "PyTorch gives (50, 3) with examples as rows. Ng puts examples in columns, so (n⁽²⁾, m) = (3, 50). Card 7." }
  ], "Lesson 32 test");
}}
],
summary: String.raw`A multilayer perceptron stacks layers of units, each a weighted sum of the previous layer's activations plus a bias, passed through an activation. In Ng's notation \(\mathbf{a}^{[l]} = g(W^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]})\), with \(W^{[l]}\) of shape \((n^{[l]}, n^{[l-1]})\), the same as the weight of <code>nn.Linear</code>. Without a nonlinear activation the layers collapse into one linear map, so the activation is what gives depth its power. A hidden layer re-maps the inputs, which makes XOR separable, and a one-hidden-layer ReLU network on one input is a sum of hinges with at most H + 1 pieces that goes straight outside its data. Depth composes such maps, so a few units per layer can draw exponentially many pieces. A forward pass computes pre-activations, activations and the output layer by layer, for a whole batch with examples as columns in Ng's notation and as rows in PyTorch. A layer from n in to n out has n out times n in weights plus n out biases, 101,770 for HW9's MLPDigits. Hidden units must start with different random weights or they stay identical. In PyTorch flatten from dimension 1, test with B = 1 and B = 7, and put no activation after the last layer.`,
sheet: [[String.raw`\[ \mathbf{a}^{[l]} = g^{[l]}\big(W^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]}\big) \]`, "one layer, a⁽⁰⁾ = x"], [String.raw`\[ W^{[l]} \in \mathbb{R}^{n^{[l]} \times n^{[l-1]}} \]`, "weight shape, nn.Linear(in, out).weight is (out, in)"], [String.raw`\[ W^{[2]}(W^{[1]}\mathbf{x} + \mathbf{b}^{[1]}) + \mathbf{b}^{[2]} = W'\mathbf{x} + \mathbf{b}' \]`, "no activation, one linear layer"], [String.raw`\[ \hat{y} = \sum_{j=1}^{H} v_j\,\text{ReLU}(w_j x + b_j) + c \]`, "1-H-1 network, at most H + 1 pieces"], [String.raw`\[ Z^{[1]} = W^{[1]}X + \mathbf{b}^{[1]}, \quad X \in \mathbb{R}^{n_x \times m} \]`, "Ng, examples as columns"], [String.raw`\[ Z = XW^{\top} + \mathbf{b}, \quad X \in \mathbb{R}^{m \times n_x} \]`, "PyTorch, examples as rows"], [String.raw`\[ P = \sum_{l=1}^{L}\big(n^{[l]}n^{[l-1]} + n^{[l]}\big) \]`, "parameter count"], [String.raw`\[ P_{\text{SimpleNN}} = 3H + 1 \]`, "HW8, one input, H hidden units, one output"], [String.raw`\[ T(x) = \text{ReLU}(2x) - \text{ReLU}(4x - 2) \]`, "tent map, L compositions give 2ᴸ pieces"]],
sources: ["AME 5970 has no lecture notes for week 10 (feedforward neural networks), so the topic order follows the homework below", "AME 5970 HW8 Part 2, Model capacity and honest generalization (2A to 2E), questions and solutions docs: SimpleNN with 3H + 1 parameters, widths 1 and 50 on a noisy parabola, no ReLU on the regression output", "AME 5970 HW9 Problem 4B and 4C, questions and solutions docs: LinearDigits against MLPDigits, 7,850 against 101,770 parameters, removing the ReLU, batch sizes 1 and 7", "AME 5970 HW10 A2, questions and solutions docs: SmallClassifier 10-32-2 with 418 parameters", "Andrew Ng, Machine Learning Specialization, course 2 week 1: Neurons and layers, Demand prediction, Neural network layer, More complex neural networks, Inference: making predictions (forward propagation), the handwritten digit lab 400-25-15-1", "Andrew Ng, Deep Learning Specialization, course 1 week 3: Neural network representation, Vectorizing across multiple examples, Why do you need nonlinear activation functions, Random initialization, and week 4: Getting your matrix dimensions right, Why deep representations", "I. Goodfellow, Y. Bengio and A. Courville, Deep Learning (2016), section 6.1, Example: learning XOR", "G. Cybenko, Approximation by superpositions of a sigmoidal function (1989), and K. Hornik, Approximation capabilities of multilayer feedforward networks (1991)", "M. Telgarsky, Benefits of depth in neural networks, COLT 2016 (the tent map construction)", "PyTorch documentation: nn.Linear, nn.Flatten, nn.Sequential"]
});
})();
