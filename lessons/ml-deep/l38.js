(function () {
/* ML shelf, Part 7, Lesson 38: the Part 6 and 7 test. A map, a formula drill, four scored sections of eight questions over Lessons 29 to 37, a nine-part board problem (a tiny CNN classifier forward and backward by hand, one SGD step, then a confusion matrix), a score sheet, and the agent card. The question style follows AME 5970 HW8 Part 3 and HW9 Problems 1 to 3 (logistic and softmax by hand, metrics and thresholds), HW8 2B and HW9 4B (parameter counts), and HW10 Parts A to D (losses, the CNN size formula and parameter count, activations, the residual gradient route). Every number was computed with NumPy and checked with PyTorch 2.15 and torchvision 0.29 on the CPU before it was written here. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const g = (v, d) => { const p = Math.pow(10, d == null ? 4 : d), r = Math.round(v * p) / p; return mn(String(r === 0 ? 0 : r)); };
const SEC = [["A. Logistic and softmax", "Lessons 29 and 30", [29, 30]], ["B. Evaluation and the MLP", "Lessons 31 and 32", [31, 32]], ["C. Backprop and activations", "Lessons 33 and 34", [33, 34]], ["D. Optimizers, CNNs, ResNets", "Lessons 35 to 37", [35, 36, 37]]];
const LESS = { 29: "Logistic", 30: "Softmax", 31: "Evaluating", 32: "MLP", 33: "Backprop", 34: "Activations", 35: "Optimizers", 36: "CNNs", 37: "ResNets" };
const TOPIC = {
  29: ["score to probability", "the boundary moves", "gradient (p − y)x", "stable logits"],
  30: ["cross-entropy by hand", "gradient p − y", "multi-label", "softmax twice"],
  31: ["the four ratios", "skewed data", "cost threshold", "AUC as pairs", "the threshold trade-off"],
  32: ["no activation, one layer", "counting parameters", "forward pass by hand"],
  33: ["the ReLU gate", "shapes of dZ and dW", "gradient check", "the cost of a gradient"],
  34: ["sigmoid saturation", "dying ReLU", "Xavier and He", "the output layer"],
  35: ["bias correction", "Adam's first step", "inverted dropout", "batch norm by hand"],
  36: ["the size formula", "conv parameters"],
  37: ["the residual route", "a new head"]
};

/* ---------- the board problem: Conv2d(1, 1, 2), ReLU, MaxPool2d(2), Flatten, Linear(4, 3) on one 5 by 5 image ---------- */
const P0 = {
  X: [[0, 1, 2, 1, 0], [1, 2, 1, 0, 0], [0, 1, 0, 1, 2], [2, 0, 1, 2, 1], [1, 0, 0, 1, 0]],
  K: [[1, 1], [-1, 0]], c: -1,
  W: [[0.5, -1, 1, 0], [0, 0.5, -0.5, 1], [-0.5, 1, 0, 0.5]], b: [0, -1, 0], y: 2
};
const fwd = P => {
  const Z = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => P.K[0][0] * P.X[i][j] + P.K[0][1] * P.X[i][j + 1] + P.K[1][0] * P.X[i + 1][j] + P.K[1][1] * P.X[i + 1][j + 1] + P.c));
  const A = Z.map(r => r.map(v => Math.max(0, v)));
  const arg = [], h = [];
  for (let bi = 0; bi < 2; bi++) for (let bj = 0; bj < 2; bj++) {
    let best = -Infinity, at = null;
    for (let di = 0; di < 2; di++) for (let dj = 0; dj < 2; dj++) { const v = A[2 * bi + di][2 * bj + dj]; if (v > best) { best = v; at = [2 * bi + di, 2 * bj + dj]; } }
    h.push(best); arg.push(at);
  }
  const s = P.W.map((w, k) => w.reduce((t, v, j) => t + v * h[j], P.b[k]));
  const m = Math.max(...s), e = s.map(v => Math.exp(v - m)), S = e.reduce((a, b) => a + b, 0), p = e.map(v => v / S);
  return { Z, A, arg, h, s, p, loss: -Math.log(p[P.y]), lse: m + Math.log(S), pred: p.indexOf(Math.max(...p)) };
};
const bwd = P => {
  const F = fwd(P), gs = F.p.map((v, k) => v - (k === P.y ? 1 : 0));
  const dW = gs.map(gk => F.h.map(hj => gk * hj)), db = gs.slice();
  const dh = [0, 1, 2, 3].map(j => P.W.reduce((t, w, k) => t + w[j] * gs[k], 0));
  const dA = [0, 1, 2, 3].map(() => [0, 0, 0, 0]);
  F.arg.forEach(([i, j], q) => { dA[i][j] = dh[q]; });
  const dZ = dA.map((r, i) => r.map((v, j) => F.Z[i][j] > 0 ? v : 0));
  const dK = [[0, 0], [0, 0]]; let dc = 0;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const d = dZ[i][j]; if (!d) continue; dK[0][0] += d * P.X[i][j]; dK[0][1] += d * P.X[i][j + 1]; dK[1][0] += d * P.X[i + 1][j]; dK[1][1] += d * P.X[i + 1][j + 1]; dc += d; }
  return { F, gs, dW, db, dh, dA, dZ, dK, dc };
};
const sgd = (P, G, lr) => ({ X: P.X, y: P.y, K: P.K.map((r, i) => r.map((v, j) => v - lr * G.dK[i][j])), c: P.c - lr * G.dc, W: P.W.map((r, k) => r.map((v, j) => v - lr * G.dW[k][j])), b: P.b.map((v, k) => v - lr * G.db[k]) });
const B0 = bwd(P0), F0 = B0.F, P1 = sgd(P0, B0, 0.1), F1 = fwd(P1);
/* the evaluation: 30 test images, ten per class, rows are the true class */
const CM = [[7, 2, 1], [1, 8, 1], [0, 3, 7]];
const MET = (() => {
  const n = CM.flat().reduce((a, b) => a + b, 0), acc = (CM[0][0] + CM[1][1] + CM[2][2]) / n;
  const cls = [0, 1, 2].map(k => { const tp = CM[k][k], col = CM[0][k] + CM[1][k] + CM[2][k], row = CM[k].reduce((a, b) => a + b, 0), P = tp / col, R = tp / row; return { tp, col, row, P, R, F: 2 * P * R / (P + R) }; });
  return { n, acc, cls, macro: cls.reduce((a, c) => a + c.F, 0) / 3 };
})();
ML.L38 = { P0, B0, F0, P1, F1, CM, MET, fwd, bwd, sgd };

const BOARD = [
  { t: "Shapes and parameters", q: String.raw`The model is <code>nn.Sequential(nn.Conv2d(1, 1, kernel_size=2), nn.ReLU(), nn.MaxPool2d(2), nn.Flatten(), nn.Linear(4, 3))</code> and it gets one 5 by 5 grayscale image. The convolution and the linear layer hold \[ K = \begin{bmatrix} 1 & 1 \\ -1 & 0\end{bmatrix}, \ c = -1, \qquad W = \begin{bmatrix} 0.5 & -1 & 1 & 0 \\ 0 & 0.5 & -0.5 & 1 \\ -0.5 & 1 & 0 & 0.5\end{bmatrix}, \ \mathbf b = (0, -1, 0) \] and the true class is 2. Give the shape after every layer and count the parameters.`,
    a: String.raw`The input is (1, 1, 5, 5): a batch of one, one channel. The convolution gives \(\lfloor (5 + 0 - 2)/1\rfloor + 1 = 4\), so (1, 1, 4, 4). ReLU keeps the shape. <code>MaxPool2d(2)</code> halves each side: (1, 1, 2, 2). Flatten gives (1, 4) and the linear layer (1, 3), three logits. The convolution has \(1\cdot 2\cdot 2\cdot 1 + 1 = 5\) parameters, the linear layer \(4\cdot 3 + 3 = 15\), so 20 in all. ReLU, pooling and Flatten have none.` },
  { t: "The convolution by hand", q: String.raw`Compute the 4 by 4 map \(z_{ij} = \sum K \odot X_{i:i+2,\,j:j+2} + c\). Use the slider to check one window at a time.`,
    a: String.raw`PyTorch's Conv2d is a cross-correlation, so the kernel is not flipped. With this kernel each output is the top pair of the window minus its bottom-left pixel minus 1: \(z_{ij} = x_{i,j} + x_{i,j+1} - x_{i+1,j} - 1\). The top-left window is \(\begin{bmatrix} 0 & 1 \\ 1 & 2\end{bmatrix}\), so \(z_{00} = 0 + 1 - 1 - 1 = -1\). All sixteen: \(Z = \begin{bmatrix} -1 & 0 & 1 & 0 \\ 2 & 1 & 0 & -2 \\ -2 & 0 & -1 & 0 \\ 0 & 0 & 2 & 1\end{bmatrix}\).` },
  { t: "ReLU and max pooling", q: String.raw`Apply the ReLU, then 2 by 2 max pooling, and flatten the result row by row into \(\mathbf h\). Note where each maximum came from.`,
    a: String.raw`ReLU zeroes the negatives and the zeros stay zero: \(A = \begin{bmatrix} 0 & 0 & 1 & 0 \\ 2 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 2 & 1\end{bmatrix}\). The top-left block's maximum is 2 at (1, 0), the top-right block's is 1 at (0, 2), the bottom-left block is all zero because every \(z \le 0\) there, and the bottom-right block's maximum is 2 at (3, 2). So the pooled map is \(\begin{bmatrix} 2 & 1 \\ 0 & 2\end{bmatrix}\) and \(\mathbf h = (2, 1, 0, 2)\). Keep the positions: the backward pass sends each gradient back to exactly that cell.` },
  { t: "Logits and softmax", q: String.raw`Compute the logits \(\mathbf s = W\mathbf h + \mathbf b\) and the softmax probabilities.`,
    a: String.raw`\(s_0 = 0.5\cdot 2 - 1\cdot 1 + 1\cdot 0 + 0\cdot 2 + 0 = 0\), \(s_1 = 0 + 0.5 - 0 + 2 - 1 = 1.5\), \(s_2 = -1 + 1 + 0 + 1 + 0 = 1\). The exponentials are \(1\), \(e^{1.5} = 4.4817\) and \(e^{1} = 2.7183\), summing to 8.2000, so \(\mathbf p = (0.1220, 0.5465, 0.3315)\). Subtracting the largest logit first gives the same probabilities and keeps the exponentials small.` },
  { t: "Loss, prediction and the PyTorch call", q: String.raw`Find the cross-entropy for the true class 2 and the predicted class. Write the PyTorch call with the right target. Then say what changes if an image can carry several of the three marks at once.`,
    a: String.raw`\(\ell = -\ln p_2 = -\ln 0.3315 = 1.1041\), the same as log-sum-exp minus the true logit: \(\ln 8.2000 - 1 = 2.1041 - 1\). The prediction is the largest logit, class 1, so this image is misclassified. In PyTorch: <code>F.cross_entropy(logits, torch.tensor([2]))</code> with logits of shape (1, 3) and a long target of shape (1,). Passing <code>logits.softmax(1)</code> instead runs softmax twice and returns 1.1154 without any error. For several marks at once, use three independent sigmoids: <code>BCEWithLogitsLoss</code> with a float target of shape (1, 3), for example <code>[[0., 1., 1.]]</code>, which gives 0.4026 here.` },
  { t: "The gradient at the logits and the linear layer", q: String.raw`Find \(\partial\ell/\partial\mathbf s\), \(\partial\ell/\partial W\) and \(\partial\ell/\partial\mathbf b\).`,
    a: String.raw`\(\partial\ell/\partial\mathbf s = \mathbf p - \mathbf e_2 = (0.1220, 0.5465, -0.6685)\). The weight gradient is an outer product, \(\partial\ell/\partial W = (\mathbf p - \mathbf e_2)\,\mathbf h^\top\): row 0 is \(0.1220\cdot(2, 1, 0, 2) = (0.2439, 0.1220, 0, 0.2439)\), row 1 is \((1.0931, 0.5465, 0, 1.0931)\), row 2 is \((-1.3370, -0.6685, 0, -1.3370)\). The bias gradient is \(\mathbf p - \mathbf e_2\) itself. The third column is zero because \(h_3 = 0\): a feature that is zero gives its weights no gradient.` },
  { t: "Back through pooling and ReLU to the kernel", q: String.raw`Carry the gradient back to \(\mathbf h\), through the max pooling and the ReLU, and find \(\partial\ell/\partial K\) and \(\partial\ell/\partial c\).`,
    a: String.raw`\(\partial\ell/\partial\mathbf h = W^\top(\mathbf p - \mathbf e_2) = (0.3952, -0.5172, -0.1513, 0.2123)\). Max pooling sends each value to the cell that won: 0.3952 to (1, 0), −0.5172 to (0, 2), 0.2123 to (3, 2), and −0.1513 to (2, 0), where \(z = -2\), so the ReLU blocks it. Every other cell gets 0. The kernel gradient adds each surviving \(\delta_{ij}\) times its window, and the windows at (1, 0) and (3, 2) hold the same pixels: \[ \frac{\partial\ell}{\partial K} = (0.3952 + 0.2123)\begin{bmatrix} 1 & 2 \\ 0 & 1\end{bmatrix} - 0.5172\begin{bmatrix} 2 & 1 \\ 1 & 0\end{bmatrix} \] \[ = \begin{bmatrix} -0.4268 & 0.6979 \\ -0.5172 & 0.6075\end{bmatrix} \] and \(\partial\ell/\partial c = 0.3952 - 0.5172 + 0.2123 = 0.0903\).` },
  { t: "One SGD step", q: String.raw`Take one SGD step with learning rate 0.1 on all 20 parameters. Give the new kernel, the new pooled features, the new probabilities and the new loss.`,
    a: String.raw`\[ K = \begin{bmatrix} 1.0427 & 0.9302 \\ -0.9483 & -0.0608\end{bmatrix}, \qquad c = -1.0090 \] and the new \(W\) and \(\mathbf b = (-0.0122, -1.0547, 0.0669)\) follow from part 6. The image now gives \(\mathbf h = (1.8333, 1.0583, 0.1280, 1.8333)\): the bottom-left block has a positive value at (3, 0) and switches on. The logits are \((-0.1281, 0.7851, 1.6861)\), \(\mathbf p = (0.1039, 0.2589, 0.6373)\), the loss falls from 1.1041 to 0.4505, and the prediction is now class 2.` },
  { t: "Evaluate on a test set", q: String.raw`After training, the model labels 30 test images, ten per class. Rows are the true class, columns the prediction: \[ \begin{bmatrix} 7 & 2 & 1 \\ 1 & 8 & 1 \\ 0 & 3 & 7\end{bmatrix} \] Find the accuracy, the precision, recall and F1 of each class, and the macro-F1. Which class does the model over-predict?`,
    a: String.raw`Accuracy is \(22/30 = 0.733\). Precision divides by the column sum, recall by the row sum. Class 0: \(7/8 = 0.875\) and \(7/10 = 0.7\), F1 0.778. Class 1: \(8/13 = 0.615\) and \(0.8\), F1 0.696. Class 2: \(7/9 = 0.778\) and \(0.7\), F1 0.737. Macro-F1 is the plain average, 0.737. The model calls 13 images class 1 when only 10 are, three of them class 2 images, so class 1 has the best recall and the worst precision. With ten images per class a recall of 0.7 has a 95% Wilson interval of 0.40 to 0.89, too wide to rank two models that differ by one image.` }
];

/* ---------- the formula drill ---------- */
const FORM = [
  [29, "The sigmoid and the logit", String.raw`\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad z = \ln\frac{p}{1 - p}`],
  [29, "Binary cross-entropy and its gradient", String.raw`\ell = -y\ln p - (1 - y)\ln(1 - p)`, String.raw`\frac{\partial\ell}{\partial\mathbf w} = (p - y)\,\mathbf x, \qquad \frac{\partial\ell}{\partial b} = p - y`],
  [30, "Softmax, the stable way", String.raw`p_k = \frac{e^{z_k - m}}{\sum_j e^{z_j - m}}, \qquad m = \max_j z_j`],
  [30, "Cross-entropy and its gradient", String.raw`\ell = -\ln p_y = \ln\sum_j e^{z_j} - z_y, \qquad \frac{\partial\ell}{\partial\mathbf z} = \mathbf p - \mathbf e_y`],
  [31, "Precision, recall and F1", String.raw`P = \frac{TP}{TP + FP}, \qquad R = \frac{TP}{TP + FN}, \qquad F_1 = \frac{2PR}{P + R}`],
  [31, "The threshold from error costs", String.raw`\text{flag when } p \gt \frac{c_{FP}}{c_{FP} + c_{FN}}`],
  [32, "One layer of an MLP", String.raw`\mathbf a^{[l]} = g\left(W^{[l]}\mathbf a^{[l-1]} + \mathbf b^{[l]}\right), \qquad n^{[l]}\left(n^{[l-1]} + 1\right) \text{ parameters}`],
  [33, "Backprop through a hidden layer, Ng's columns", String.raw`dZ^{[1]} = W^{[2]\top}dZ^{[2]} \odot g'\left(Z^{[1]}\right)`, String.raw`dW^{[1]} = \frac1m\,dZ^{[1]}A^{[0]\top}, \qquad db^{[1]} = \frac1m\sum_{\text{columns}} dZ^{[1]}`],
  [33, "Gradient checking", String.raw`g_i \approx \frac{J(\theta_i + \varepsilon) - J(\theta_i - \varepsilon)}{2\varepsilon}`, String.raw`\text{difference} = \frac{\lVert g_{\text{approx}} - g\rVert}{\lVert g_{\text{approx}}\rVert + \lVert g\rVert}, \qquad \approx 10^{-7} \text{ is good}`],
  [34, "Slopes of the sigmoid and tanh", String.raw`\sigma'(z) = \sigma(z)\left(1 - \sigma(z)\right) \le \tfrac14, \qquad \tanh'(z) = 1 - \tanh^2 z \le 1`],
  [34, "Xavier and He initialization", String.raw`\text{Xavier: } \operatorname{Var} w = \frac{2}{n_{\text{in}} + n_{\text{out}}}, \qquad \text{He: } \operatorname{Var} w = \frac{2}{n_{\text{in}}}`],
  [35, "Adam", String.raw`\mathbf m \leftarrow \beta_1\mathbf m + (1 - \beta_1)\mathbf g, \qquad \mathbf v \leftarrow \beta_2\mathbf v + (1 - \beta_2)\mathbf g^2`, String.raw`\boldsymbol\theta \leftarrow \boldsymbol\theta - \alpha\,\frac{\hat{\mathbf m}}{\sqrt{\hat{\mathbf v}} + \epsilon}, \qquad \hat{\mathbf m} = \frac{\mathbf m}{1 - \beta_1^t}, \ \hat{\mathbf v} = \frac{\mathbf v}{1 - \beta_2^t}`],
  [35, "Inverted dropout and batch norm", String.raw`\text{keep with probability } q, \text{ then divide by } q`, String.raw`\hat x = \frac{x - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}, \qquad y = \gamma\hat x + \beta`],
  [36, "Convolution size and parameters", String.raw`n_{\text{out}} = \left\lfloor\frac{n + 2p - f}{s}\right\rfloor + 1`, String.raw`\text{parameters} = \left(f\cdot f\cdot C_{\text{in}} + 1\right)C_{\text{out}}`],
  [37, "The residual block and its gradient", String.raw`\mathbf a^{[l+2]} = g\left(\mathbf z^{[l+2]} + \mathbf a^{[l]}\right)`, String.raw`\text{plain chain: } \prod_k a_k, \qquad \text{residual chain: } \prod_k\left(1 + a_k\right)`]
];
ML.L38.BOARD = BOARD; ML.L38.FORM = FORM;

/* a cell grid for the board picture: a is an array of rows, o = {fmt, hl, hl2, dim, fs, title, sub} */
const cells = (a, x0, y0, cw, ch, o) => {
  o = o || {}; const fmt = o.fmt || (v => g(v)), hl = o.hl || new Set(), hl2 = o.hl2 || new Set(), dim = o.dim || new Set();
  let s = o.title ? tx(x0, y0 - 8, o.title, null, "t") : "";
  a.forEach((r, i) => r.forEach((v, j) => {
    const k = i + "," + j, on = hl.has(k), on2 = hl2.has(k), dm = dim.has(k);
    s += `<rect x="${x0 + j * cw}" y="${y0 + i * ch}" width="${cw - 3}" height="${ch - 3}" rx="4" fill="${on ? "var(--teal-bg)" : on2 ? "var(--coral-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : on2 ? C.coral : "var(--line)"}" stroke-width="${on || on2 ? 2 : 1}" opacity="${dm ? 0.4 : 1}"/>`;
    s += `<text class="t" x="${x0 + j * cw + (cw - 3) / 2}" y="${y0 + i * ch + ch / 2 + 3}" text-anchor="middle" style="font-family:var(--mono);font-size:${o.fs || 11}px" opacity="${dm ? 0.45 : 1}">${fmt(v, i, j)}</text>`;
  }));
  if (o.sub) s += tx(x0, y0 + a.length * ch + 12, o.sub);
  return s;
};

addLesson("ml", "deep", {
level: "Core", num: "Lesson 38",
id: "ml-deep-l38", title: "Part 6 and 7 test", short: "38. Part 6 and 7 test",
big: String.raw`Thirty-two scored questions over Parts 6 and 7, in four sections of eight, plus a board problem in the final exam style. Section A is logistic regression and softmax, Section B evaluating classifiers and the multilayer perceptron, Section C backpropagation, activations and initialization, Section D optimizers, convolutional networks and residual networks. Each section is its own card with its own score, so you can retake the weak one without redoing the rest. Most questions ask for a number you can get on paper, the way HW9 and HW10 ask for a probability, a loss, a gradient, a parameter count or an output size before you run anything. The others show a few lines of PyTorch and ask what is wrong. Before the sections there is a formula drill. After them comes a nine-part board problem that runs a tiny convolutional classifier forward and backward by hand, takes one SGD step and then scores the trained model on a test set, and a score sheet that tells you which lessons to reopen.`,
bridge: String.raw`Part 6 turned the linear model into a classifier: the sigmoid and binary cross-entropy in Lesson 29, softmax and cross-entropy in Lesson 30, and the metrics that judge a classifier in Lesson 31. Part 7 made the model deep: the multilayer perceptron in Lesson 32, backpropagation in Lesson 33, activations and initialization in Lesson 34, optimizers and training tricks in Lesson 35, convolutions in Lesson 36 and residual networks in Lesson 37. Part 8 feeds sequences to the same machinery, and the final exam mixes all of it, which is what the board problem does.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. Map", t: "What the four sections cover",
intu: String.raw`Click a section to see which lessons it draws on and the topics its questions touch. Take the formula drill first if Parts 6 and 7 are more than a few days behind you, then the sections in order. Each section is scored out of 8 and is passed at 6. The whole test at 26 or above means Parts 6 and 7 are done. The board problem is not scored. Work it on paper with the solution hidden, then compare line by line.`,
eq: String.raw`\[ 4 \text{ sections} \times 8 \text{ questions} = 32, \qquad \text{pass: } 6 \text{ per section}, \ 26 \text{ overall} \]`,
sym: [["section A", "the sigmoid, the boundary, binary and multiclass cross-entropy, their gradients, the loss call"], ["section B", "precision, recall, F1, skewed data, cost thresholds, AUC, parameter counts, a forward pass"], ["section C", "the ReLU gate, backprop shapes, gradient checks, saturation, dying units, Xavier and He, output layers"], ["section D", "averages and Adam, dropout, batch norm, the convolution size and count, residual gradients, a new head"], ["board problem", "a tiny CNN classifier by hand, nine parts, worked solutions"]],
how: ["Do the formula drill.", "Take A, B, C, D in order, with paper, a calculator and no computer.", "Work out the number before you read the options.", "Work the board problem with each solution hidden.", "Enter your four scores on the score sheet and reopen what it names."],
say: String.raw`Four sections of eight questions over Lessons 29 to 37, pass at six per section and twenty-six overall, plus an unscored board problem with worked solutions.`,
num: String.raw`<b>32</b> scored questions, about <b>50 minutes</b> on a first pass, and about <b>40 minutes</b> for the board problem.`,
note: String.raw`The practice finals keep asking for the same things: a forward pass by hand, the Conv2d output size and parameter count, ReLU against sigmoid and tanh, multi-class against multi-label, and which loss fits a task. Sections A to D and the board problem cover every one of them.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns(SEC.map((s, i) => [i, s[0].slice(0, 1)]), "k") + `<div id="l38mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    const lessons = [29, 30, 31, 32, 33, 34, 35, 36, 37];
    lessons.forEach((L, i) => {
      const x = 6 + i * 74, on = SEC[k][2].includes(L);
      s += `<rect x="${x}" y="24" width="70" height="58" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 35, 48, "L" + L, "middle", "th") + tx(x + 35, 70, LESS[L], "middle");
    });
    SEC.forEach((sc, i) => {
      const x = 20 + i * 162, on = i === k;
      s += `<rect x="${x}" y="128" width="152" height="50" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 76, 148, sc[0].split(".")[0] + ". 8 questions", "middle", "th") + tx(x + 76, 166, sc[1], "middle");
      if (on) sc[2].forEach(L => { const xx = 6 + lessons.indexOf(L) * 74 + 35; s += `<line x1="${xx}" y1="84" x2="${x + 76}" y2="126" stroke="${C.teal}" stroke-width="1.4" stroke-dasharray="3 3"/>`; });
    });
    const tops = SEC[k][2].flatMap(L => TOPIC[L]);
    tops.forEach((t, i) => { const col = i % 4, rowi = Math.floor(i / 4), x = 20 + col * 162, y = 206 + rowi * 30; s += `<rect x="${x}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x + 76, y + 16, t, "middle"); });
    const H = 206 + Math.ceil(tops.length / 4) * 30 + 8;
    fig.innerHTML = svg(H, s);
    $("l38mx").innerHTML = `<p class="note"><b>${SEC[k][0]}</b> draws on ${SEC[k][2].map(L => "Lesson " + L + " (" + LESS[L] + ")").join(", ").replace(/, ([^,]*)$/, " and $1")}. The grey chips are the topics its eight questions touch.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "1. Formula drill", t: "Fifteen formulas to write from memory before the test",
intu: String.raw`Parts 6 and 7 rest on a short list of formulas: the sigmoid and softmax with their losses and gradients, the metrics and the cost threshold, the shape of a layer, the backward pass, the initialization variances, Adam, batch norm, the convolution size and the residual route. The drill shows the name of one, you write it on paper, then reveal it and mark yourself honestly. The bar chart counts what you knew per lesson. Run it until every bar is full, then start Section A.`,
eq: String.raw`\[ \text{15 formulas from Lessons 29 to 37} \]`,
sym: [["name", "what you are asked to write"], ["reveal", "shows the formula as the lesson wrote it"], ["I knew it", "counts toward that lesson's bar"], ["not yet", "keeps the item in the next round"]],
how: ["Read the name.", "Write the formula on paper.", "Reveal and compare every sign, every transpose and every factor.", "Mark yourself and go on.", "Start a new round with only the misses."],
say: String.raw`The drill checks that the sigmoid, softmax, both cross-entropies and their gradients, the classifier metrics, the cost threshold, a layer, the backward pass, the gradient check, the activation slopes, the initializations, Adam, dropout, batch norm, the convolution formulas and the residual block can be written from memory.`,
num: String.raw`<b>15</b> items, <b>2</b> each from Lessons 29, 30, 31, 33, 34 and 35 and <b>1</b> each from Lessons 32, 36 and 37.`,
note: String.raw`Two lost marks repeat on the practice finals: writing the cross-entropy gradient as y − p instead of p − y, and forgetting the + 1 in the convolution size formula. Check both every time.`,
r(fig, ctl) {
  let order = FORM.map((_, i) => i), pos = 0, shown = false;
  const known = new Set(), round = { n: 1 };
  ctl.innerHTML = `<div class="row"><button id="l38fs" class="on">Reveal</button><button id="l38fk">I knew it</button><button id="l38fn">Not yet</button><button id="l38fr">New round with misses</button><button id="l38fa">Start over</button></div><div id="l38fo"></div>`;
  const u = () => {
    const done = pos >= order.length;
    let s = "";
    const Ls = [29, 30, 31, 32, 33, 34, 35, 36, 37];
    Ls.forEach((L, i) => {
      const tot = FORM.filter(r => r[0] === L).length, kn = FORM.filter((r, j) => r[0] === L && known.has(j)).length, x = 16 + i * 73;
      s += `<rect x="${x}" y="30" width="62" height="14" rx="4" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="30" width="${62 * kn / tot}" height="14" rx="4" fill="${C.teal}"/>` + tx(x + 31, 22, "L" + L, "middle", "t") + tx(x + 31, 60, `${kn} of ${tot}`, "middle");
    });
    if (!done) {
      const it = FORM[order[pos]];
      s += `<rect x="30" y="80" width="620" height="70" rx="10" fill="var(--accent-bg)" stroke="var(--accent)"/>` + tx(340, 108, `Round ${round.n}, card ${pos + 1} of ${order.length}, Lesson ${it[0]}`, "middle") + tx(340, 134, it[1], "middle", "th");
      fig.innerHTML = svg(160, s) + (shown ? `<div class="eqbig">\\[${it[2]}\\]${it[3] ? `\\[${it[3]}\\]` : ""}</div>` : `<p class="note" style="text-align:center">Write it on paper, then press Reveal.</p>`);
    } else {
      const miss = FORM.length - known.size;
      s += `<rect x="30" y="80" width="620" height="70" rx="10" fill="${miss ? "var(--sunk)" : "var(--teal-bg)"}" stroke="${miss ? "var(--line)" : C.teal}"/>` + tx(340, 110, `Round ${round.n} done. ${known.size} of ${FORM.length} known.`, "middle", "th") + tx(340, 134, miss ? "Start a new round with the misses." : "All fifteen. Go to Section A.", "middle");
      fig.innerHTML = svg(160, s);
    }
    $("l38fs").disabled = done || shown; $("l38fk").disabled = done || !shown; $("l38fn").disabled = done || !shown;
    $("l38fr").disabled = !done || known.size === FORM.length;
    $("l38fo").innerHTML = ML.readout([["known", `${known.size} of ${FORM.length}`], ["this round", done ? "finished" : `${order.length - pos} left`]]);
    if (shown && !done) typesetMath(fig);
  };
  $("l38fs").onclick = () => { shown = true; u(); };
  $("l38fk").onclick = () => { known.add(order[pos]); pos++; shown = false; u(); };
  $("l38fn").onclick = () => { pos++; shown = false; u(); };
  $("l38fr").onclick = () => { order = FORM.map((_, i) => i).filter(i => !known.has(i)); pos = 0; shown = false; round.n++; u(); };
  $("l38fa").onclick = () => { known.clear(); order = FORM.map((_, i) => i); pos = 0; shown = false; round.n = 1; u(); };
  u();
}},

{s: "A. Logistic and softmax", t: "Section A: probabilities, losses and their gradients",
intu: String.raw`Eight questions from Lessons 29 and 30, in the style of HW9 Problems 1 and 2. Turn a score into a probability and a loss, move the boundary with the threshold, write the gradient of one example, say why PyTorch wants raw logits, compute a softmax cross-entropy by hand, read off its gradient, pick the loss for a multi-label task, and find the bug that runs without an error.`,
eq: String.raw`\[ \text{Section A: 8 questions, pass at 6} \]`,
sym: [["Lesson 29", "sigmoid and odds, one observation, the boundary, binary cross-entropy, the gradient, stable logits, the binary contract"], ["Lesson 30", "softmax, shift and scale, cross-entropy, the gradient, log-sum-exp, multi-label, choosing the loss, the multiclass contract"]],
how: ["Write the score z first, then the probability.", "Use the natural log for every loss.", "For a gradient, write p − y before anything else."],
say: String.raw`Section A tests whether you can go from weights to a probability, a loss and a gradient by hand, and whether you hand PyTorch the right thing.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: String.raw`A logistic model has \(\mathbf w = (0.5, -1)\) and \(b = 0.2\). For \(\mathbf x = (2, 0.4)\) with label \(y = 0\), what are \(p = \sigma(z)\) and the binary cross-entropy?`, o: ["p = 0.6900 and loss 0.3711", "p = 0.6900 and loss 1.1711", "p = 0.3100 and loss 1.1711", "p = 0.8000 and loss 1.6094"], a: 1, why: String.raw`\(z = 1 - 0.4 + 0.2 = 0.8\) and \(\sigma(0.8) = 0.6900\). For \(y = 0\) the loss is \(-\ln(1 - p) = -\ln 0.31 = 1.1711\). The value 0.3711 is the loss for \(y = 1\), and 0.8 is the score, not a probability. Lesson 29 cards 3 and 5.` },
    { q: String.raw`A model has \(\mathbf w = (2, -1)\) and \(b = 3\). You raise the threshold from 0.5 to 0.8. The boundary moves from \(2x_1 - x_2 + 3 = 0\) to`, o: [String.raw`\(2x_1 - x_2 + 3 = 0.8\)`, String.raw`\(2x_1 - x_2 + 3 = -1.386\)`, "it does not move, only the probabilities change", String.raw`\(2x_1 - x_2 + 3 = \ln 4 \approx 1.386\)`], a: 3, why: String.raw`\(p \ge 0.8\) exactly when \(z \ge \operatorname{logit} 0.8 = \ln(0.8/0.2) = \ln 4\). The line keeps its slope and moves parallel, toward the positive side, so fewer points are flagged. Lesson 29 card 4.` },
    { q: String.raw`One example has \(\mathbf x = (2, -3)\), \(y = 1\) and \(p = 0.7\). The gradient of its binary cross-entropy with respect to \(\mathbf w\) and \(b\) is`, o: ["(−0.6, 0.9) and −0.3", "(0.6, −0.9) and 0.3", "(−0.126, 0.189) and −0.063", "(−0.3, −0.3) and −0.3"], a: 0, why: String.raw`\((p - y)\mathbf x = -0.3\cdot(2, -3) = (-0.6, 0.9)\) and the bias gets \(p - y = -0.3\). The third option multiplies by \(\sigma'(z) = p(1 - p) = 0.21\), which the cross-entropy cancels. Lesson 29 card 7.` },
    { q: "Why does HW9 feed raw logits to BCEWithLogitsLoss instead of applying torch.sigmoid and then BCELoss?", o: ["it is faster because it skips the sigmoid", "BCELoss only accepts integer targets", "the two agree to rounding for every logit", "it computes the loss from the logit directly, so a confident wrong logit of −100 with y = 1 still gets loss 100 and gradient −1, while BCELoss clamps the log and passes back a gradient of 0"], a: 3, why: "The sigmoid of −100 rounds to 0 in float32, so BCELoss clamps the log at −100 and its gradient vanishes. BCEWithLogitsLoss uses the log-sum-exp form and keeps the gradient p − y = −1. Lesson 29 card 11." },
    { q: String.raw`Logits \(\mathbf z = (0.5, 2, -1)\) and the true class is 0. What are \(p_0\) and the cross-entropy?`, o: ["p₀ = 0.1753 and loss 1.7413", "p₀ = 0.7856 and loss 0.2413", "p₀ = 0.3333 and loss 1.0986", "p₀ = 0.1753 and loss 0.7563"], a: 0, why: String.raw`The exponentials are 1.6487, 7.3891 and 0.3679, summing to 9.4057, so \(p_0 = 0.1753\) and \(\ell = -\ln 0.1753 = 1.7413\), which is also log-sum-exp minus the true logit, \(2.2413 - 0.5\). The second option is class 1, the third divides the logits by their sum, and 0.7563 uses the base-10 log. Lesson 30 card 4.` },
    { q: String.raw`Softmax gives \(\mathbf p = (0.2, 0.5, 0.3)\) and the true class is 2. The gradient of the cross-entropy with respect to the logits is`, o: ["(0.2, 0.5, −0.7)", "(−0.2, −0.5, 0.7)", "(0, 0, −0.7)", "(0.2, 0.5, 0.3)"], a: 0, why: String.raw`\(\partial\ell/\partial\mathbf z = \mathbf p - \mathbf e_y\). The wrong classes are pushed down by their probabilities and the true class up by \(1 - p_y\). The gradient sums to zero because adding the same amount to every logit changes nothing. Lesson 30 card 6.` },
    { q: "A photo can show any of 5 defect types at once, including none. The right output and loss are", o: ["5 logits, CrossEntropyLoss and a long target of shape (B,)", "1 logit and BCEWithLogitsLoss", "5 logits through softmax and MSELoss", "5 logits, BCEWithLogitsLoss and a float target of shape (B, 5) of zeros and ones"], a: 3, why: "Multi-label means one independent yes or no per type, so five sigmoids. Softmax forces the five probabilities to compete and sum to 1, which is right only when exactly one type is present. Lesson 30 cards 10 and 11." },
    { q: "This code runs without an error. What is wrong?", code: ["logits = model(x)                     # (B, 3)", "probs = torch.softmax(logits, dim=1)", "loss = nn.CrossEntropyLoss()(probs, y)  # y: (B,) long"], o: ["y must be one-hot", "dim should be 0", "CrossEntropyLoss applies log-softmax itself, so softmax runs twice: the loss value is wrong and the gradients shrink", "nothing"], a: 2, why: "Pass the logits. On this lesson's board problem the double softmax gives 1.1154 instead of 1.1041, and in Lesson 30 it halved the gradient norm. Lesson 30 card 12." }
  ], "Section A");
}},

{s: "B. Evaluation and the MLP", t: "Section B: judging a classifier and building a network",
intu: String.raw`Eight questions from Lessons 31 and 32, in the style of HW9 Problem 3 and HW8 2B. Read four ratios off a confusion matrix, see through accuracy on skewed data, set a threshold from error costs, count correctly ordered pairs, say what a higher threshold does, explain why a stack of linear layers is one layer, count the parameters of an MLP, and run one example through a small ReLU network.`,
eq: String.raw`\[ \text{Section B: 8 questions, pass at 6} \]`,
sym: [["Lesson 31", "skewed data, the confusion matrix, the ratios, the trade-off, F1, cost thresholds, ROC and AUC, PR curves, calibration, many classes"], ["Lesson 32", "a layer, notation and shapes, nonlinearity, XOR, hinges, a forward pass, counting parameters, width and depth, symmetry"]],
how: ["Write the four cells TP, FP, FN, TN before any ratio.", "For a threshold, compare the expected cost of each decision.", "For an MLP, write in times out plus out for each layer."],
say: String.raw`Section B tests whether you can judge a classifier with the right number and build the network that feeds it.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "On 200 test parts a classifier has TP = 30, FP = 10, FN = 20 and TN = 140. Which line is right?", o: ["precision 0.60, recall 0.75, F1 0.667", "precision 0.75, recall 0.933, F1 0.832", "precision 0.75, recall 0.60, F1 0.675, accuracy 0.85", "precision 0.75, recall 0.60, F1 0.667, accuracy 0.85"], a: 3, why: "Precision 30/40 = 0.75, recall 30/50 = 0.60, F1 = 2(0.75)(0.60)/1.35 = 0.667, accuracy 170/200 = 0.85. The plain average of 0.75 and 0.60 is 0.675, and 0.933 is the specificity 140/150. Lesson 31 cards 2, 3 and 5." },
    { q: "3% of parts are defective. A rule that never flags anything has", o: ["accuracy 0.97 and recall 0", "accuracy 0.03 and recall 1", "accuracy 0.97 and precision 0.97", "accuracy 0.50, like a coin flip"], a: 0, why: "It is right on every good part, so 97% accuracy, and it finds none of the defects, so recall 0. Its precision is 0/0, undefined. This is why HW9 reports recall and cost, not accuracy alone. Lesson 31 card 1." },
    { q: "A missed defect costs 9 units and a false alarm costs 1. With calibrated probabilities you should flag a part when p is above", o: ["0.5", "0.9", "1/9 ≈ 0.111", "0.1"], a: 3, why: String.raw`Flagging costs \((1 - p)\cdot 1\), passing costs \(p\cdot 9\). Flag when \(9p \gt 1 - p\), that is \(p \gt 1/10\). In general \(\tau^\ast = c_{FP}/(c_{FP} + c_{FN})\). The cost ratio 1/9 is not the threshold. Lesson 31 card 6.` },
    { q: "Four positives score 0.9, 0.7, 0.4 and 0.35, five negatives 0.8, 0.5, 0.3, 0.2 and 0.1. The ROC AUC is", o: ["0.60", "0.75", "0.80", "0.85"], a: 1, why: "AUC is the share of (positive, negative) pairs that are ordered correctly. 0.9 beats all 5 negatives, 0.7 beats 4, 0.4 and 0.35 beat 3 each, so 15 of 20 pairs: 0.75. Lesson 31 card 8." },
    { q: "You raise the threshold from 0.5 to 0.7. Which is always true?", o: ["precision goes up", "recall cannot go up", "F1 goes up", "accuracy goes up"], a: 1, why: "A higher threshold flags a subset of what it flagged before, so true positives can only stay or fall while the positives stay fixed. Precision usually rises but can fall, and F1 and accuracy can move either way. Lesson 31 card 4." },
    { q: "nn.Sequential(nn.Linear(10, 50), nn.Linear(50, 1)) has no activation between the layers. It can represent", o: ["any continuous function, by universal approximation", "functions with up to 50 bends", "exactly the functions that one nn.Linear(10, 1) can", "only functions through the origin"], a: 2, why: String.raw`\(W_2(W_1\mathbf x + \mathbf b_1) + \mathbf b_2 = (W_2W_1)\mathbf x + (W_2\mathbf b_1 + \mathbf b_2)\), one linear map with 561 parameters doing the work of 11. The activation between the layers is what lets them bend. Lesson 32 card 3.` },
    { q: "How many parameters does nn.Sequential(nn.Linear(784, 256), nn.ReLU(), nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 10)) have?", o: ["217,728", "218,058", "200,960", "218,048"], a: 1, why: "784 · 256 + 256 = 200,960, 256 · 64 + 64 = 16,448 and 64 · 10 + 10 = 650, total 218,058. Leaving out the 330 biases gives 217,728. Lesson 32 card 8." },
    { q: String.raw`A 2-2-1 ReLU network has \(W_1\) with rows (1, 2) and (−1, 1), \(\mathbf b_1 = (0, 1)\), \(\mathbf w_2 = (2, -1)\) and \(b_2 = 0.5\). What does it output for \(\mathbf x = (-1, 2)\)?`, o: ["2.5", "0.5", "6.5", "−1.5"], a: 0, why: String.raw`\(\mathbf z_1 = (-1 + 4, 1 + 2 + 1) = (3, 4)\), both units are on, so \(\hat y = 2\cdot 3 - 1\cdot 4 + 0.5 = 2.5\). For \(\mathbf x = (1, -1)\) both units would be off and the output would be the bias 0.5. Lesson 32 card 6.` }
  ], "Section B");
}},

{s: "C. Backprop and activations", t: "Section C: the backward pass, activations and initialization",
intu: String.raw`Eight questions from Lessons 33 and 34, in the style of HW10 Part C. Pass a gradient through a ReLU, write the shapes of Ng's backward quantities, read a gradient check, count what numerical gradients cost, bound the gradient through a stack of sigmoids, explain a dead unit, compute Xavier and He scales, and choose the output layer for a regression.`,
eq: String.raw`\[ \text{Section C: 8 questions, pass at 6} \]`,
sym: [["Lesson 33", "the cost of a gradient, one example node by node, six equations, the batch, activation derivatives, gradient checking, vanishing and exploding gradients"], ["Lesson 34", "six activations, derivatives and saturation, zero-centered outputs, dying units, Leaky ReLU, ELU and GELU, Xavier, He, PyTorch init, choosing"]],
how: ["For a backward question, write the local factor of every node.", "For a shape, every gradient has the shape of what it is the gradient of.", "For initialization, write the variance first, then take the root."],
say: String.raw`Section C tests whether you can carry a gradient backward by hand and choose activations and initial weights that keep it alive.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A ReLU layer has z = (1.2, −0.3, 0) and the gradient arriving from above is (0.5, −2, 1). The gradient PyTorch passes back to z is", o: ["(0.5, −2, 1)", "(0.5, 0, 1)", "(0.5, 0, 0)", "(1, 0, 0)"], a: 2, why: "The ReLU gate passes the gradient where z > 0 and blocks it elsewhere. At exactly z = 0 PyTorch uses a slope of 0, so the third entry is blocked too. Lesson 33 card 6." },
    { q: String.raw`In Ng's column convention with \(n^{[0]} = 784\), \(n^{[1]} = 64\) and \(m = 32\) examples, the shapes of \(dZ^{[1]}\) and \(dW^{[1]}\) are`, o: ["(32, 64) and (784, 64)", "(64, 32) and (64, 784)", "(64, 784) and (64, 32)", "(64, 1) and (64, 784)"], a: 1, why: String.raw`\(dZ^{[1]}\) has the shape of \(Z^{[1]}\), one column per example. \(dW^{[1]} = \frac1m dZ^{[1]}A^{[0]\top}\) is (64, 32) times (32, 784), the shape of \(W^{[1]}\). In PyTorch's rows the first is (32, 64) and the weight gradient is still (64, 784). Lesson 33 card 3.` },
    { q: "Your gradient check with ε = 1e-7 returns a relative difference of 2e-3. You should", o: ["accept it, anything below 1 is fine", "make ε smaller until the difference drops", "suspect the backward pass and look at the components with the largest differences", "switch every ReLU to a sigmoid"], a: 2, why: "Ng's rule of thumb: about 1e-7 is right, 1e-5 needs a careful look, 1e-3 or more almost always means a bug. Away from a ReLU kink the check is a test of your code, so find which weights disagree. Lesson 33 card 7." },
    { q: "A network has 5,000 parameters. The full gradient by central differences needs about how many forward passes, against how many for backprop?", o: ["10,000 against about 3", "5,000 against 5,000", "2 against 1", "10,000 against 10,000"], a: 0, why: "Each parameter needs J(θ + ε) and J(θ − ε), so 2P = 10,000 passes. Backprop costs about one forward and two forward-sized backward passes whatever P is. Lesson 33 card 1." },
    { q: "A gradient passes through 10 sigmoid layers. The product of the 10 activation slopes is at most", o: ["0.25", "1", "about 9.5e-7", "2.5"], a: 2, why: String.raw`\(\sigma'(z) = \sigma(1 - \sigma) \le 0.25\), so ten of them give at most \(0.25^{10} \approx 9.5\times 10^{-7}\), before any weights. This is the vanishing gradient that ReLU's slope of 1 avoids. Lesson 34 card 2.` },
    { q: "After a large learning-rate step, a hidden ReLU unit has z < 0 for every training example. What happens next?", o: ["the bias gradient pushes it back on the next step", "it gets exactly zero gradient on every example, so gradient descent never changes its incoming weights again", "it starts to output negative values", "it becomes a linear unit"], a: 1, why: "With z < 0 everywhere the ReLU blocks every gradient, so the unit's weights and bias receive 0 and it stays dead. Leaky ReLU, ELU or a smaller learning rate prevent it. In Lesson 34, 24 of 32 units died at lr 0.3. Lesson 34 card 4." },
    { q: "A tanh layer has fan-in 200 and fan-out 300. The standard deviations from Xavier normal and from He normal on the fan-in are", o: ["0.1095 and 0.1", "0.0632 and 0.0707", "0.0040 and 0.0100", "0.0632 and 0.1"], a: 3, why: String.raw`Xavier: \(\sqrt{2/(200 + 300)} = 0.0632\). He: \(\sqrt{2/200} = 0.1\). 0.1095 is the Xavier uniform bound \(\sqrt{6/500}\), 0.0707 is \(\sqrt{1/200}\), and the third option gives variances, not standard deviations. Lesson 34 cards 8 and 9.` },
    { q: "A regression target lies between −3 and 5. Which output layer is right?", o: ["Linear followed by ReLU", "Linear followed by sigmoid", "a plain Linear layer with no activation, trained with MSELoss", "Linear followed by tanh"], a: 2, why: "ReLU cannot output the negative targets, and sigmoid and tanh squash into (0, 1) and (−1, 1). Hidden layers bend, the output layer of a regression stays linear. In Lesson 32 a ReLU on the output stuck at MSE 1.1464. Lesson 34 card 12." }
  ], "Section C");
}},

{s: "D. Optimizers, CNNs, ResNets", t: "Section D: training tricks, convolutions and residual networks",
intu: String.raw`Eight questions from Lessons 35, 36 and 37, in the style of HW5 and HW10 Parts B and D. Bias-correct a running average, predict Adam's first step, apply inverted dropout, run batch norm on one unit by hand, use the convolution size formula, count a convolution's parameters, compare a plain chain with a residual one, and count what a new head trains.`,
eq: String.raw`\[ \text{Section D: 8 questions, pass at 6} \]`,
sym: [["Lesson 35", "averages, momentum, RMSprop, Adam, schedules, weight decay, dropout, batch norm"], ["Lesson 36", "cross-correlation, padding, stride and the size formula, volumes, one layer and its parameters, pooling, receptive field"], ["Lesson 37", "degradation, the residual block, the gradient route, projection shortcuts, global pooling, transfer learning, fine-tuning"]],
how: ["For an average, write v₁ and v₂ before you correct.", "For a convolution, write n, p, f and s, then floor.", "For a frozen model, count only what requires a gradient."],
say: String.raw`Section D tests whether you can follow an optimizer and a normalization by hand and size a convolutional or residual network on paper.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: String.raw`Ng's average with \(\beta = 0.9\) starts at \(v_0 = 0\) and sees \(\theta_1 = 20\), then \(\theta_2 = 10\). What are \(v_2\) and its bias-corrected value?`, o: ["2.8 and 28", "15 and 15", "2.8 and 14.74", "11 and 14.74"], a: 2, why: String.raw`\(v_1 = 0.1\cdot 20 = 2\), \(v_2 = 0.9\cdot 2 + 0.1\cdot 10 = 2.8\), and \(2.8/(1 - 0.9^2) = 2.8/0.19 = 14.74\). Dividing by \(1 - \beta\) instead gives 28. Lesson 35 card 1.` },
    { q: "Adam with lr = 0.01 and the default betas sees a first gradient of (0.001, −50). Its first step moves the two weights by about", o: ["(−1e-5, 0.5)", "(−0.01, 0.01)", "(−0.001, 50)", "(0, 0), the first step only fills the averages"], a: 1, why: String.raw`After bias correction \(\hat m = g\) and \(\sqrt{\hat v} = \lvert g\rvert\), so the step is \(-\alpha\,\mathrm{sign}(g)\) whatever the gradient's size. PyTorch moves the weights to (−0.0100, 0.0100). Lesson 35 card 4.` },
    { q: "nn.Dropout(p=0.2) in training mode sees the activation 2.0. It outputs", o: ["2.5 or 0, and 2.0 in eval mode", "1.6 or 0", "2.0 or 0", "2.5 always"], a: 0, why: "p is the drop probability, so units are kept with probability 0.8 and divided by 0.8: 2.0 becomes 2.5 or 0, and the expected value stays 2.0. In eval mode dropout does nothing. Lesson 35 card 8." },
    { q: String.raw`One unit sees the batch (2, 4, 6, 8). Batch norm with \(\gamma = 2\), \(\beta = 1\) and \(\epsilon\) ignored turns the 8 into`, o: ["1.342", "3.324", "3.683", "1.894"], a: 2, why: String.raw`The batch mean is 5 and the batch variance, divided by 4, is 5. So \(\hat x = 3/\sqrt 5 = 1.342\) and \(y = 2\cdot 1.342 + 1 = 3.683\). The unbiased variance 6.667 gives 3.324, and 1.894 is the output for the 6. PyTorch gives (−1.6833, 0.1056, 1.8944, 3.6833). Lesson 35 card 10.` },
    { q: "A 32 by 32 image goes through nn.Conv2d(3, 24, kernel_size=5, padding=2, stride=2). The output is", o: ["14 by 14", "15 by 15", "32 by 32", "16 by 16"], a: 3, why: String.raw`\(\lfloor (32 + 4 - 5)/2\rfloor + 1 = \lfloor 15.5\rfloor + 1 = 16\). Forgetting the + 1 gives 15. With padding 2 and stride 1 the size would stay 32. Lesson 36 card 5.` },
    { q: "How many parameters does nn.Conv2d(3, 24, kernel_size=5) have?", o: ["1,824", "624", "1,800", "75"], a: 0, why: "Each of the 24 filters is 5 · 5 · 3 = 75 weights plus a bias, so 76 · 24 = 1,824, whatever the image size. 624 forgets the 3 input channels and 1,800 the biases. Lesson 36 card 7." },
    { q: "A chain of 6 layers multiplies the gradient by a = 0.2 at each layer. With a residual connection around each layer, each factor becomes 1 + a. The end-to-end factors are", o: ["6.4e-5 and 1.2", "1.2 and 7.2", "6.4e-5 and 2.986", "0.2 and 1.2"], a: 2, why: String.raw`\(0.2^6 = 6.4\times 10^{-5}\) against \(1.2^6 = 2.986\). The shortcut adds 1 to every local factor, so the product no longer collapses. HW10 D1 showed \(10^{-8}\) against 2.1436 with \(a = 0.1\) over 8 layers. Lesson 37 card 4.` },
    { q: "You load a pretrained ResNet-18, set requires_grad=False on every parameter, then replace model.fc with nn.Linear(512, 7). How many parameters will the optimizer train?", o: ["11,689,512", "3,584", "11,180,103", "3,591"], a: 3, why: "Only the new head requires a gradient: 512 · 7 + 7 = 3,591 of 11,180,103 parameters. Remember that model.train() still updates the frozen BatchNorm running statistics. Lesson 37 card 10." }
  ], "Section D");
}},

{s: "Board problem", t: "A board problem: a tiny CNN classifier forward and backward by hand",
intu: String.raw`The final exam asks for a network by hand, a Conv2d size and parameter count, a softmax loss and a metric. This board problem asks for all of them in nine parts, each using the last. One 5 by 5 image, a 2 by 2 kernel, ReLU, 2 by 2 max pooling and a linear layer to three classes. Step through the parts, work each on paper, then press Show solution. The picture follows along: the convolution window you choose, the pooled winners, the logits and probabilities, the gradients in coral, and the weights after one step. Every number was produced with PyTorch and is small enough to check with a calculator.`,
eq: String.raw`\[ \mathbf h = \mathrm{flatten}\,\mathrm{maxpool}\,\mathrm{ReLU}(K \star X + c), \qquad \mathbf s = W\mathbf h + \mathbf b, \qquad \ell = -\ln\,\mathrm{softmax}(\mathbf s)_y \]`,
sym: [["X", "the 5 by 5 image"], ["K, c", "the 2 by 2 kernel (1, 1 over −1, 0) and the bias −1"], ["h", "the four pooled features, flattened row by row"], ["W, b", "the (3, 4) weight and the 3 biases of the linear layer"], ["y", "the true class, 2"], [String.raw`\(\eta\)`, "0.1 for the SGD step"]],
how: ["Read the part.", "Work it on paper.", "Show the solution and compare line by line.", "Mark any part you got wrong and reopen its lesson.", "Go to the next part, which uses this one."],
say: String.raw`For this network the pooled features are 2, 1, 0 and 2, the logits 0, 1.5 and 1, the cross-entropy for class 2 is 1.1041, the kernel gradient has rows (−0.4268, 0.6979) and (−0.5172, 0.6075), and one SGD step at 0.1 brings the loss to 0.4505.`,
num: String.raw`h = (<b>${F0.h.map(v => g(v)).join(", ")}</b>), s = (<b>${F0.s.map(v => g(v)).join(", ")}</b>), p = (<b>${F0.p.map(v => fm(v)).join(", ")}</b>), ℓ = <b>${fm(F0.loss)}</b>, ∂ℓ/∂c = <b>${fm(B0.dc)}</b>, after one step ℓ = <b>${fm(F1.loss)}</b>, test accuracy <b>${f(MET.acc, 3)}</b>, macro-F1 <b>${f(MET.macro, 3)}</b>.`,
note: String.raw`Max pooling and ReLU decide where the gradient goes. Here only three of the sixteen convolution outputs receive any gradient, so the kernel learns from three windows. On the exam, circle the pooling winners and cross out the negative z values before you start the backward pass.`,
r(fig, ctl) {
  let open = false, cur = 0, win = 0, cls = 1;
  const Lab = ["shapes", "convolution", "ReLU and pooling", "logits", "loss", "linear gradients", "to the kernel", "SGD step", "evaluate"];
  const key = (i, j) => i + "," + j;
  const draw = k => {
    let s = "";
    if (k === 8) {
      /* the confusion matrix with one class picked */
      const x0 = 120, y0 = 60, cw = 64, ch = 46;
      s += tx(x0 + 1.5 * cw, 26, "predicted class", "middle", "t") + `<text class="t" x="${x0 - 46}" y="${y0 + 1.5 * ch}" text-anchor="middle" transform="rotate(-90 ${x0 - 46} ${y0 + 1.5 * ch})">true class</text>`;
      [0, 1, 2].forEach(j => { s += tx(x0 + j * cw + cw / 2 - 1, y0 - 8, String(j), "middle"); });
      [0, 1, 2].forEach(i => { s += tx(x0 - 12, y0 + i * ch + ch / 2 + 4, String(i), "middle"); });
      const hlc = new Set();
      [0, 1, 2].forEach(j => { hlc.add(key(j, cls)); });
      s += cells(CM, x0, y0, cw, ch, { fmt: v => v, hl: new Set([key(cls, cls)]), hl2: new Set([...hlc].filter(q => q !== key(cls, cls))), fs: 15 });
      [0, 1, 2].forEach(j => { if (j !== cls) s += `<rect x="${x0 + j * cw - 1}" y="${y0 + cls * ch - 1}" width="${cw - 1}" height="${ch - 1}" rx="5" fill="none" stroke="${C.blue}" stroke-width="2" stroke-dasharray="4 3"/>`; });
      s += tx(x0 - 50, y0 + 3 * ch + 24, "teal: correct for the class, coral: the rest of its column", null) + tx(x0 - 50, y0 + 3 * ch + 42, "blue dashed: the rest of its row", null);
      const m = MET.cls[cls], X2 = 400;
      s += tx(X2, 60, `class ${cls}`, null, "th") + tx(X2, 86, `precision = ${m.tp}/${m.col} = ${f(m.P, 3)}`, null, "t") + tx(X2, 108, "(divide by the column, coral)", null) + tx(X2, 134, `recall = ${m.tp}/${m.row} = ${f(m.R, 3)}`, null, "t") + tx(X2, 156, "(divide by the row, blue)", null) + tx(X2, 182, `F1 = ${f(m.F, 3)}`, null, "t");
      s += tx(X2, 214, `accuracy = 22/30 = ${f(MET.acc, 3)}`, null, "t") + tx(X2, 238, `macro-F1 = ${f(MET.macro, 3)}`, null, "t");
      fig.innerHTML = svg(290, s);
    } else {
      const P = k === 7 ? P1 : P0, F = k === 7 ? F1 : F0, Bk = B0;
      /* top row: image, kernel, map, pooled */
      const hlX = new Set(), hl2X = new Set();
      if (k === 1) { const wi = Math.floor(win / 4), wj = win % 4; [0, 1].forEach(a => [0, 1].forEach(b => hlX.add(key(wi + a, wj + b)))); }
      if (k === 6) Bk.dZ.forEach((r, i) => r.forEach((v, j) => { if (v) [0, 1].forEach(a => [0, 1].forEach(b => hl2X.add(key(i + a, j + b)))); }));
      s += cells(P.X, 24, 46, 26, 26, { fmt: v => v, hl: hlX, hl2: hl2X, title: "image X", sub: "(1, 1, 5, 5)" });
      const Kshow = k === 6 ? Bk.dK : P.K;
      s += cells(Kshow, 176, 46, 52, 30, { fmt: v => k === 6 || k === 7 ? g(v, 3) : g(v), hl2: k === 6 ? new Set(["0,0", "0,1", "1,0", "1,1"]) : new Set(), title: k === 6 ? "∂ℓ/∂K" : k === 7 ? "new K" : "kernel K", fs: k >= 6 ? 11 : 13 });
      s += tx(176, 124, k === 6 ? `∂ℓ/∂c = ${g(Bk.dc)}` : k === 7 ? `c = ${g(P.c)}` : "bias c = −1");
      s += tx(176, 142, k === 0 ? "5 parameters" : "", null);
      let Zs = F.Z, ztitle = "Z = K ⋆ X + c", zfmt = v => g(v, 2), zhl = new Set(), zhl2 = new Set(), zdim = new Set();
      if (k === 0) { zfmt = () => "?"; }
      if (k === 1) { const wi = Math.floor(win / 4), wj = win % 4; zfmt = (v, i, j) => i * 4 + j <= win ? g(v) : "·"; zhl.add(key(wi, wj)); }
      if (k >= 2 && k <= 5) { Zs = F.A; ztitle = "A = ReLU(Z)"; zfmt = v => g(v); F.arg.forEach(([i, j], q) => { if (F.h[q] > 0) zhl.add(key(i, j)); }); F.Z.forEach((r, i) => r.forEach((v, j) => { if (v <= 0) zdim.add(key(i, j)); })); }
      if (k === 6) { Zs = Bk.dZ; ztitle = "∂ℓ/∂Z after pool and ReLU"; zfmt = v => v ? g(v, 3) : "0"; Bk.dZ.forEach((r, i) => r.forEach((v, j) => { if (v) zhl2.add(key(i, j)); })); const [bi, bj] = F.arg[2]; zdim.add(key(bi, bj)); }
      if (k === 7) { ztitle = "new Z"; F.arg.forEach(([i, j]) => zhl.add(key(i, j))); }
      s += cells(Zs, 300, 46, 42, 26, { fmt: zfmt, hl: zhl, hl2: zhl2, dim: zdim, title: ztitle, sub: "(1, 1, 4, 4)", fs: k === 6 || k === 7 ? 10 : 11 });
      const Pm = [[F.h[0], F.h[1]], [F.h[2], F.h[3]]], dP = [[Bk.dh[0], Bk.dh[1]], [Bk.dh[2], Bk.dh[3]]];
      s += cells(k === 6 ? dP : Pm, 486, 46, 58, 30, { fmt: v => k <= 1 ? "?" : k >= 6 ? g(v, 3) : g(v), hl2: k === 6 ? new Set(["0,0", "0,1", "1,0", "1,1"]) : new Set(), title: k === 6 ? "∂ℓ/∂h" : "pooled", sub: "flatten: (1, 4)", fs: 11 });
      s += arrow(160, 100, 172, 100, "var(--p)", 1.2) + arrow(282, 100, 296, 100, "var(--p)", 1.2) + arrow(468, 100, 482, 100, "var(--p)", 1.2);
      if (k === 6) s += tx(486, 136, "−0.1513 hits z = −2: blocked", null);
      /* bottom row: the linear layer and the class table */
      const Wshow = k === 5 ? Bk.dW : P.W, bshow = k === 5 ? Bk.db : P.b;
      const wt = k === 5 ? "∂ℓ/∂W = (p − e₂) hᵀ" : k === 7 ? "new W" : "W (3, 4)";
      const coral = k === 5 ? new Set([0, 1, 2].flatMap(i => [0, 1, 2, 3].map(j => key(i, j)))) : new Set();
      s += cells(Wshow, 40, 214, 52, 28, { fmt: v => k === 5 || k === 7 ? g(v, 3) : g(v), hl2: coral, title: wt, fs: 11 });
      s += cells(bshow.map(v => [v]), 262, 214, 56, 28, { fmt: v => k === 5 || k === 7 ? g(v, 3) : g(v), hl2: k === 5 ? new Set(["0,0", "1,0", "2,0"]) : new Set(), title: k === 5 ? "∂ℓ/∂b" : "b", fs: 11 });
      const showS = k >= 3, showP = k >= 3, showG = k === 5 || k === 6;
      s += tx(350, 206, "class", null, "t") + tx(410, 206, "logit s", null, "t") + tx(490, 206, "p", null, "t") + tx(570, 206, showG ? "p − y" : "", null, "t");
      [0, 1, 2].forEach(c => {
        const y = 232 + c * 28, isT = c === P.y && k >= 4;
        if (isT) s += `<rect x="342" y="${y - 17}" width="320" height="24" rx="5" fill="var(--teal-bg)" stroke="${C.teal}"/>`;
        s += tx(360, y, String(c) + (isT ? " true" : ""), null) + tx(410, y, showS ? g(F.s[c]) : "?", null) + tx(490, y, showP ? fm(F.p[c]) : "?", null);
        if (showG) s += `<text class="ts" x="570" y="${y}" style="fill:${C.coral}">${fm(Bk.gs[c])}</text>`;
      });
      let foot = "";
      if (k === 0) foot = "Conv2d 5 + Linear 15 = 20 parameters. Output size ⌊(5 − 2)/1⌋ + 1 = 4, pooled 2.";
      if (k === 1) { const wi = Math.floor(win / 4), wj = win % 4, x = P.X; foot = `window (${wi}, ${wj}): ${x[wi][wj]} + ${x[wi][wj + 1]} − ${x[wi + 1][wj]} + 0·${x[wi + 1][wj + 1]} − 1 = ${g(F.Z[wi][wj])}`; }
      if (k === 2) foot = `teal cells win their block. h = (${F.h.map(v => g(v)).join(", ")}). The bottom-left block is all zero.`;
      if (k === 3) foot = `exponentials 1, 4.4817, 2.7183, sum ${f(Math.exp(F.lse), 4)}`;
      if (k === 4) foot = `ℓ = −ln ${fm(F.p[2])} = ${fm(F.loss)}. Predicted class ${F.pred}, so the image is misclassified.`;
      if (k === 5) foot = "Each row of ∂ℓ/∂W is (p − y) for that class times h. The column for h₃ = 0 is zero.";
      if (k === 6) foot = "Coral pixels: the three windows whose gradient survives pooling and ReLU.";
      if (k === 7) foot = `η = 0.1. Loss ${fm(F0.loss)} → ${fm(F1.loss)}, predicted class ${F1.pred}. h = (${F1.h.map(v => g(v)).join(", ")}).`;
      s += tx(24, 326, foot, null, "t");
      fig.innerHTML = svg(340, s);
    }
    fig.innerHTML += `<p style="font-weight:600;margin:6px 0 4px">Part ${k + 1}. ${BOARD[k].t}</p><p>${BOARD[k].q}</p>`;
    $("l38bs").innerHTML = open ? `<div class="dnote"><p><b>Solution.</b> ${BOARD[k].a}</p></div>` : `<p class="note">Work it on paper first.</p>`;
    $("l38bb").textContent = open ? "Hide solution" : "Show solution";
    typesetMath(fig, $("l38bs"));
  };
  const extra = k => {
    if (k === 1) {
      $("l38bx").innerHTML = sl("l38bw", "window", 0, 15, 1, win);
      const u = () => { win = +$("l38bw").value; $("l38bwv").textContent = `(${Math.floor(win / 4)}, ${win % 4})`; draw(cur); };
      $("l38bw").oninput = u; $("l38bwv").textContent = `(${Math.floor(win / 4)}, ${win % 4})`;
    } else if (k === 8) {
      $("l38bx").innerHTML = btns([[0, "class 0"], [1, "class 1"], [2, "class 2"]], "cl");
      $("l38bx").querySelectorAll("button[data-cl]").forEach(b => b.onclick = () => { cls = +b.dataset.cl; pick($("l38bx"), "cl", cls); draw(cur); });
      pick($("l38bx"), "cl", cls);
    } else $("l38bx").innerHTML = "";
  };
  ctl.innerHTML = `<div id="l38bt"></div><div id="l38bx"></div><div class="row"><button id="l38bb">Show solution</button></div><div id="l38bs"></div>`;
  $("l38bb").onclick = () => { open = !open; draw(cur); };
  ML.stepper($("l38bt"), BOARD.length, k => { if (k !== cur) open = false; cur = k; extra(k); draw(k); }, Lab);
}},

{s: "Score sheet", t: "Enter your section scores and see what to reopen",
intu: String.raw`Set the four sliders to your section scores. The bars turn teal at 6 or above. For every section below 6 the sheet lists the cards its questions came from, in the order to reopen them. The total decides whether Parts 6 and 7 are done: 26 of 32 or more. A total of 26 with one section at 5 is not a pass, because each section is a skill the project needs on its own.`,
eq: String.raw`\[ \text{pass} \iff \min_s \text{score}_s \ge 6 \ \text{and} \ \sum_s \text{score}_s \ge 26 \]`,
sym: [["score", "correct answers in a section, 0 to 8"], ["section pass", "6 or more"], ["Parts 6 and 7 pass", "every section passed and 26 or more overall"]],
how: ["Take each section once without notes.", "Enter the four scores.", "Reopen the listed cards for each red bar.", "Retake only those sections.", "Record the scores and the date in your notes."],
say: String.raw`Parts 6 and 7 are passed when every section scores at least six and the total is at least twenty-six.`,
num: String.raw`A pass needs <b>26 of 32</b>, about 81 %, with no section below <b>6 of 8</b>.`,
note: String.raw`Section B and Section D are the ones the project report leans on: the metric you quote, the threshold you choose, and the size of the network you describe. If either is weak, fix it before you write the results slide.`,
r(fig, ctl) {
  const REV = [["Lesson 29 cards 3, 4, 5, 7, 11", "Lesson 30 cards 4, 6, 10, 11, 12"], ["Lesson 31 cards 1, 2, 3, 4, 6, 8", "Lesson 32 cards 3, 6, 8"], ["Lesson 33 cards 1, 3, 6, 7", "Lesson 34 cards 2, 4, 8, 9, 12"], ["Lesson 35 cards 1, 4, 8, 10", "Lesson 36 cards 5, 7", "Lesson 37 cards 4, 10"]];
  ctl.innerHTML = SEC.map((sc, i) => sl("l38s" + i, sc[0], 0, 8, 1, 7)).join("") + `<div id="l38so"></div>`;
  const u = () => {
    const v = SEC.map((_, i) => +$("l38s" + i).value);
    v.forEach((x, i) => { $("l38s" + i + "v").textContent = x + " / 8"; });
    const tot = v.reduce((a, b) => a + b, 0), ok = v.every(x => x >= 6) && tot >= 26;
    const a = ML.axes(60, 20, 400, 220, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, nx: 4, ny: 8, fx: () => "", fy: v => v, yl: "score", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(6)}" x2="${a.X(4)}" y2="${a.Y(6)}" stroke="${C.coral}" stroke-dasharray="6 4"/>` + tx(a.X(4) + 6, a.Y(6) + 4, "pass 6", null);
    v.forEach((x, i) => { const x0 = a.X(i + 0.2), w = a.X(i + 0.8) - x0; s += `<rect x="${x0}" y="${a.Y(x)}" width="${w}" height="${a.Y(0) - a.Y(x)}" rx="4" fill="${x >= 6 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, "Section " + "ABCD"[i], "middle") + tx(x0 + w / 2, a.Y(x) - 6, String(x), "middle", "t"); });
    s += tx(530, 60, `total ${tot} / 32`, null, "th") + tx(530, 86, `${Math.round(100 * tot / 32)} %`, null, "t") + tx(530, 124, ok ? "Parts 6 and 7 passed" : "not yet", null, "th");
    if (!ok && tot >= 26) s += tx(530, 148, "a section is below 6", null);
    fig.innerHTML = svg(280, s);
    const weak = v.map((x, i) => [x, i]).filter(([x]) => x < 6);
    $("l38so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SEC[i][0]}</b> at ${x}: reopen ${REV[i].join(" and ")}, then retake the section.</p>`).join("")}</div>` : `<p class="note">${ok ? "Every section is at 6 or above. Go on to Part 8, which feeds sequences to this machinery." : "Every section is at 6 or above but the total is under 26. Retake the two lowest sections."}</p>`;
  };
  SEC.forEach((_, i) => { $("l38s" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: pin the board problem in PyTorch tests",
intu: String.raw`After working the board problem on paper, have the agent build the same tiny CNN in PyTorch, set its weights by hand and pin every one of your numbers in a test. Each assertion is one of your hand results, so a failing test means either your paper or the code is wrong, and finding out which is the best practice there is for the final. The command asks for autograd to be compared with your hand gradients, for the double-softmax bug to be shown on purpose, and for the metrics of part 9 to come from a small function you can reuse in the project.`,
eq: String.raw`\[ \texttt{build} \to \texttt{forward} \to \texttt{loss} \to \texttt{backward} \to \texttt{step} \to \texttt{metrics} \]`,
sym: [["build", "Sequential(Conv2d(1, 1, 2), ReLU(), MaxPool2d(2), Flatten(), Linear(4, 3)) with <code>copy_</code> under <code>no_grad</code>"], ["forward", "Z, the pooled features (2, 1, 0, 2) and the logits (0, 1.5, 1)"], ["loss", "1.1041, and 1.1154 when softmax is applied first"], ["backward", "autograd against the hand gradients of W, b, K and c"], ["step", "SGD at 0.1, new loss 0.4505"], ["metrics", "accuracy, per-class precision, recall and F1, macro-F1 from a confusion matrix"]],
how: ["Work the board problem on paper first.", "Paste the command.", "Read the tests: is every number one of yours?", "Run pytest and compare any failure with your paper.", "Commit the module with its tests."],
say: String.raw`The agent rebuilds the board network in PyTorch with the given weights and pins each hand result in a pytest test, so a mistake on paper or in code shows up as a failing assertion.`,
num: String.raw`Tests expect h = (<b>2, 1, 0, 2</b>), s = (<b>0, 1.5, 1</b>), ℓ = <b>1.1041</b>, <b>1.1154</b> with softmax first, ∂ℓ/∂K rows (<b>−0.4268, 0.6979</b>) and (<b>−0.5172, 0.6075</b>), ∂ℓ/∂c = <b>0.0903</b>, the new loss <b>0.4505</b>, and macro-F1 <b>0.737</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/part67_board.py with torch only. A function build() returns nn.Sequential(nn.Conv2d(1, 1, kernel_size=2), nn.ReLU(), nn.MaxPool2d(2), nn.Flatten(), nn.Linear(4, 3)) with weights set inside torch.no_grad() by copy_: conv weight [[[[1, 1], [-1, 0]]]], conv bias [-1], linear weight [[0.5, -1, 1, 0], [0, 0.5, -0.5, 1], [-0.5, 1, 0, 0.5]], linear bias [0, -1, 0]. The image X is the float32 tensor [[0,1,2,1,0],[1,2,1,0,0],[0,1,0,1,2],[2,0,1,2,1],[1,0,0,1,0]] reshaped to (1, 1, 5, 5) and the target is torch.tensor([2]). Also write metrics(cm) that takes a confusion matrix with true classes as rows and returns accuracy, per-class precision, recall and F1, and macro-F1. Create tests/test_part67_board.py with pytest: the model has 20 parameters; layer 0 gives [[-1,0,1,0],[2,1,0,-2],[-2,0,-1,0],[0,0,2,1]]; the first four layers give [[2, 1, 0, 2]]; the logits are [[0, 1.5, 1]]; F.cross_entropy is 1.10413 to 5 decimals and is 1.11540 when softmax is applied first; after backward the gradients are linear bias [0.12195, 0.54655, -0.66850], conv weight [[-0.42683, 0.69787], [-0.51718, 0.60753]] and conv bias [0.09035]; one torch.optim.SGD step with lr 0.1 gives a loss of 0.45054 and predicts class 2; metrics on [[7, 2, 1], [1, 8, 1], [0, 3, 7]] gives accuracy 0.73333 and macro-F1 0.73676. Use torch.testing.assert_close with atol 1e-4 for every tensor. Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_part67_board.py", ".........                                                [100%]", "9 passed"],
    checks: ["build sets the weights under torch.no_grad() with copy_, not by replacing the Parameters", "the target is a long tensor of shape (1,), not a one-hot float", "the double-softmax test expects 1.1154, a wrong value without an error", "every gradient test builds a fresh model or calls zero_grad first", "metrics divides precision by the column sum and recall by the row sum", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`Parts 6 and 7 are passed when all four sections score at least six and the total is at least twenty-six. Section A asks you to go from weights to a probability, a loss and a gradient: the sigmoid and the threshold, binary cross-entropy and its gradient (p − y)x, raw logits for stability, softmax cross-entropy by hand with its gradient p minus the one-hot label, one sigmoid per label for a multi-label task, and no softmax before CrossEntropyLoss. Section B asks you to judge a classifier with the right number: the four ratios, accuracy on skewed data, the cost threshold, AUC as ordered pairs, what a higher threshold does, and to build the network: no activation means one layer, parameter counts and a forward pass. Section C asks you to carry a gradient backward and keep it alive: the ReLU gate, the shapes of Ng's quantities, gradient checks and their cost, sigmoid saturation, dead units, Xavier and He, and a linear output for regression. Section D asks you to follow the training tricks and size a network: bias correction, Adam's first step, inverted dropout, batch norm by hand, the convolution size and parameter count, the residual route and a new head. The board problem runs a tiny CNN classifier forward and backward, takes a step and scores the result. Misses name a lesson and a card. Reopen them, retake the section, and move to Part 8.`,
sheet: [[String.raw`\[ \frac{\partial\ell}{\partial\mathbf w} = (p - y)\,\mathbf x, \qquad \frac{\partial\ell}{\partial\mathbf z} = \mathbf p - \mathbf e_y, \qquad \tau^\ast = \frac{c_{FP}}{c_{FP} + c_{FN}} \]`, "Sections A and B: the two gradients and the cost threshold"], [String.raw`\[ dZ^{[1]} = W^{[2]\top}dZ^{[2]} \odot g'\big(Z^{[1]}\big), \qquad \operatorname{Var} w = \frac{2}{n_{\text{in}} + n_{\text{out}}} \ \text{or} \ \frac{2}{n_{\text{in}}} \]`, "Section C: backprop through a layer, Xavier and He"], [String.raw`\[ n_{\text{out}} = \left\lfloor\frac{n + 2p - f}{s}\right\rfloor + 1, \qquad \left(f^2C_{\text{in}} + 1\right)C_{\text{out}} \]`, "Section D: convolution size and parameters"], [String.raw`\[ \frac{\partial\ell}{\partial K} = \sum_{i,j}\delta_{ij}\,X_{i:i+2,\,j:j+2}, \qquad \delta_{ij} = 0 \ \text{unless } (i, j) \text{ won its pool and } z_{ij} \gt 0 \]`, "the board problem: the kernel gradient"], [String.raw`\[ \text{pass} = 6/8 \text{ per section}, \ 26/32 \text{ overall} \]`, "the marks"]],
sources: ["AME 5970 has no lecture notes after Lecture 5, so the topic order follows the homework below and the final practice exams are cited by topic order (the PDFs were not available in this session, so the board problem follows the recurring final topics listed in the course map: a forward pass by hand, Conv2d output size and parameter count, multi-class against multi-label, and choosing the loss)", "AME 5970 HW8 questions and solutions doc, Part 2B and Part 3 (parameter counts, logistic regression by hand), the model for Sections A and B", "AME 5970 HW9 questions and solutions doc, Problems 1 to 3 (the binary and multiclass contracts, cross-entropy by hand, metrics, cost-based thresholds), the model for Sections A and B", "AME 5970 HW10 questions and solutions doc, Parts A to D (losses and the loop, the CNN size formula and parameter count B0 to B2, activations C0 to C3, the residual gradient route D1), the model for Sections C and D and the board problem", "AME 5970 HW5 solutions doc (BatchNorm by hand, learning rates), for Section D", "Lessons 29 to 37 of this shelf", "Andrew Ng, Machine Learning Specialization, course 1 week 3 (logistic regression) and course 2 weeks 1 to 3 (neural networks, softmax, evaluating and skewed data)", "Andrew Ng, Deep Learning Specialization, course 1 weeks 3 and 4 (backpropagation, activations, random initialization), course 2 weeks 1 to 3 (gradient checking, initialization, Adam, batch norm, dropout) and course 4 weeks 1 and 2 (convolutions, pooling, ResNets, transfer learning)", "Stanford CS231n notes on backpropagation and convolutional networks (the ReLU and max gates, the size formula)", "PyTorch 2.15 and torchvision 0.29 documentation (CrossEntropyLoss, BCEWithLogitsLoss, Conv2d, MaxPool2d, BatchNorm1d, Dropout, Adam, resnet18)"]
});
})();
