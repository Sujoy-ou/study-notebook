(function () {
/* ML shelf, Part 5, Lesson 28: the Part 5 test. A map, a formula drill, four scored sections of eight questions over Lessons 21 to 27, a nine-part board problem (a two-layer network forward and backward by hand, then in PyTorch), a score sheet, and the agent card. The question style follows AME 5970 HW4 (shapes, indexing, broadcasting, views, from_numpy, nn.Module, counting parameters, debugging a model), HW6 (batches and checkpoints), HW8 2B and 2C (target shapes, deepcopy checkpoints) and HW10 Part A (the training loop). Every number and message was produced with PyTorch 2.15, torchvision 0.29 and Lightning 2.6.6 on the CPU before it was written here. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const g = v => { const r = Math.round(v * 1e6) / 1e6; return String(r).replace("-", "−"); };
const SEC = [["A. Tensors", "Lesson 21", [21]], ["B. Autograd and modules", "Lessons 22 and 23", [22, 23]], ["C. Loop and data", "Lessons 24 and 25", [24, 25]], ["D. Pro and Lightning", "Lessons 26 and 27", [26, 27]]];
const LESS = { 21: "Tensors", 22: "Autograd", 23: "nn.Module", 24: "Training loop", 25: "Data", 26: "Pro PyTorch", 27: "Lightning" };
const TOPIC = {
  21: ["indexing", "reductions and dim", "broadcasting", "the (N, 1) target", "dtype traps", "bytes", "strides and view", "from_numpy"],
  22: ["paths add", "accumulation", "detach", "in-place on a leaf"],
  23: ["counting parameters", "weight is (out, in)", "registration", "state_dict and buffers"],
  24: ["freed graph", "steps per run", "epoch loss", "eval is not no_grad", "patience"],
  25: ["collate dtypes", "ToTensor and Normalize", "shared Subset transform"],
  26: ["one device line", "16 bytes per parameter", "resume with the optimizer", "float16 and bfloat16", "the gradient scaler"],
  27: ["steps with accumulation", "return the loss", "the sanity check"]
};

/* ---------- the board problem: Linear(2, 2), ReLU, Linear(2, 1) on two rows ---------- */
const P0 = { X: [[1, 2], [2, -1]], Y: [0, 2], W1: [[1, -1], [0.5, 1]], b1: [0, -1], W2: [1, -1], b2: 0.5 };
const fwd = (P, rows) => {
  rows = rows || [0, 1];
  const R = rows.map(i => {
    const x = P.X[i], z = P.W1.map((w, j) => w[0] * x[0] + w[1] * x[1] + P.b1[j]), a = z.map(v => Math.max(0, v));
    const yh = P.W2[0] * a[0] + P.W2[1] * a[1] + P.b2;
    return { i, x, z, a, yh, y: P.Y[i], e: yh - P.Y[i] };
  });
  return { R, loss: R.reduce((s, r) => s + r.e * r.e, 0) / R.length };
};
const bwd = (P, rows) => {
  const F = fwd(P, rows), N = F.R.length;
  const G = { W1: [[0, 0], [0, 0]], b1: [0, 0], W2: [0, 0], b2: 0, per: [] };
  F.R.forEach(r => {
    const gy = 2 * r.e / N, dA = [gy * P.W2[0], gy * P.W2[1]], dZ = dA.map((v, j) => r.z[j] > 0 ? v : 0);
    G.W2[0] += gy * r.a[0]; G.W2[1] += gy * r.a[1]; G.b2 += gy;
    dZ.forEach((d, j) => { G.W1[j][0] += d * r.x[0]; G.W1[j][1] += d * r.x[1]; G.b1[j] += d; });
    G.per.push({ gy, dA, dZ });
  });
  return { F, G };
};
const sgd = (P, G, lr) => ({ X: P.X, Y: P.Y, W1: P.W1.map((w, j) => w.map((v, k) => v - lr * G.W1[j][k])), b1: P.b1.map((v, j) => v - lr * G.b1[j]), W2: P.W2.map((v, j) => v - lr * G.W2[j]), b2: P.b2 - lr * G.b2 });
const B0 = bwd(P0), P1 = sgd(P0, B0.G, 0.1), F1 = fwd(P1);
const MB = [bwd(P0, [0]).G, bwd(P0, [1]).G];
/* the (2,) target trap: every prediction minus every target */
const TRAP = [];
B0.F.R.forEach(r => P0.Y.forEach(y => TRAP.push(r.yh - y)));
const TRAPL = TRAP.reduce((s, e) => s + e * e, 0) / TRAP.length;
ML.L28 = { P0, B0, P1, F1, MB, TRAPL, fwd, bwd, sgd };

const BOARD = [
  { t: "Shapes and parameters", q: String.raw`The model is <code>nn.Sequential(nn.Linear(2, 2), nn.ReLU(), nn.Linear(2, 1))</code>. The batch is \(X = \begin{bmatrix} 1 & 2 \\ 2 & -1\end{bmatrix}\) with targets \(\mathbf y = \begin{bmatrix} 0 \\ 2\end{bmatrix}\), and the weights are \(W_1 = \begin{bmatrix} 1 & -1 \\ 0.5 & 1\end{bmatrix}\), \(\mathbf b_1 = (0, -1)\), \(W_2 = \begin{bmatrix} 1 & -1\end{bmatrix}\), \(b_2 = 0.5\). Write the shape of every tensor and count the parameters.`,
    a: String.raw`\(X\) is (2, 2), two rows of two features. \(W_1\) is stored as (out, in) = (2, 2) and \(\mathbf b_1\) is (2,). \(W_2\) is (1, 2) and \(b_2\) is (1,). The hidden activations are (2, 2) and the output is (2, 1), one prediction per row, the same shape as \(\mathbf y\). The first layer has \(2\cdot 2 + 2 = 6\) parameters, the second \(1\cdot 2 + 1 = 3\), so 9 in all. The ReLU has none.` },
  { t: "The first layer", q: String.raw`Compute \(Z_1 = XW_1^\top + \mathbf b_1\), one row per example.`,
    a: String.raw`Row 1, \(\mathbf x = (1, 2)\): unit 1 is \(1\cdot 1 + 2\cdot(-1) + 0 = -1\), unit 2 is \(1\cdot 0.5 + 2\cdot 1 - 1 = 1.5\). Row 2, \(\mathbf x = (2, -1)\): unit 1 is \(2 + 1 + 0 = 3\), unit 2 is \(1 - 1 - 1 = -1\). So \(Z_1 = \begin{bmatrix} -1 & 1.5 \\ 3 & -1\end{bmatrix}\). Each row of \(W_1\) is one hidden unit, which is why the product uses \(W_1^\top\).` },
  { t: "ReLU and the output", q: String.raw`Apply the ReLU and compute \(\hat{\mathbf y} = A_1W_2^\top + b_2\).`,
    a: String.raw`\(A_1 = \max(0, Z_1) = \begin{bmatrix} 0 & 1.5 \\ 3 & 0\end{bmatrix}\). Row 1: \(\hat y = 1\cdot 0 - 1\cdot 1.5 + 0.5 = -1.0\). Row 2: \(\hat y = 1\cdot 3 - 1\cdot 0 + 0.5 = 3.5\). Each row switches off a different hidden unit: unit 1 for row 1, unit 2 for row 2.` },
  { t: "MSE and the target shape", q: String.raw`Compute <code>nn.MSELoss()</code> on \(\hat{\mathbf y}\) of shape (2, 1) and \(\mathbf y\) of shape (2, 1). Then say what the loss would be if \(\mathbf y\) had been stored with shape (2,).`,
    a: String.raw`The errors are \(\hat y - y = (-1, 1.5)\), so \(L = (1 + 2.25)/2 = 1.625\). With \(\mathbf y\) of shape (2,), the difference broadcasts to (2, 2), every prediction minus every target: \(-1, -3, 3.5, 1.5\). PyTorch warns and returns \((1 + 9 + 12.25 + 2.25)/4 = 6.125\), a wrong loss with wrong gradients.` },
  { t: "The gradient at the output", q: String.raw`With the mean over \(N = 2\) rows, find \(\partial L/\partial\hat y_i\), \(\partial L/\partial W_2\) and \(\partial L/\partial b_2\).`,
    a: String.raw`\(\partial L/\partial\hat y_i = 2(\hat y_i - y_i)/N = (-1, 1.5)\). The weight gradient sums each row's output gradient times that row's activations: \(\partial L/\partial W_2 = -1\cdot(0, 1.5) + 1.5\cdot(3, 0) = (4.5, -1.5)\). The bias gets the sum, \(-1 + 1.5 = 0.5\).` },
  { t: "Back through the ReLU", q: String.raw`Carry the gradient to the hidden layer and find \(\partial L/\partial W_1\) and \(\partial L/\partial\mathbf b_1\).`,
    a: String.raw`The gradient on the activations is \(\frac{\partial L}{\partial\hat y_i}W_2\): row 1 gets \((-1, 1)\), row 2 gets \((1.5, -1.5)\). The ReLU passes it only where \(z \gt 0\): row 1 keeps \((0, 1)\), row 2 keeps \((1.5, 0)\). Then \(\partial L/\partial W_1 = \sum_i \boldsymbol\delta_i\mathbf x_i^\top\): the first row is \(0\cdot(1, 2) + 1.5\cdot(2, -1) = (3, -1.5)\), the second \(1\cdot(1, 2) + 0\cdot(2, -1) = (1, 2)\). \(\partial L/\partial\mathbf b_1 = (1.5, 1)\).` },
  { t: "One SGD step", q: String.raw`Take one <code>torch.optim.SGD</code> step with <code>lr=0.1</code>. Give the new weights and the new loss.`,
    a: String.raw`\(W_1 = \begin{bmatrix} 0.7 & -0.85 \\ 0.4 & 0.8\end{bmatrix}\), \(\mathbf b_1 = (-0.15, -1.1)\), \(W_2 = (0.55, -0.85)\), \(b_2 = 0.45\). The new predictions are \(-0.315\) and \(1.605\), so \(L = (0.099225 + 0.156025)/2 = 0.1276\), down from 1.625. The same unit is still off for each row, so the ReLU pattern did not change.` },
  { t: "The same in PyTorch", q: String.raw`List the keys of <code>model.state_dict()</code> with their shapes, say how to set the weights, and say what <code>model[2].weight.grad</code> holds if <code>loss.backward()</code> runs twice, each time on a fresh forward pass, without <code>zero_grad</code>.`,
    a: String.raw`The keys are <code>0.weight</code> (2, 2), <code>0.bias</code> (2,), <code>2.weight</code> (1, 2) and <code>2.bias</code> (1,). Index 1 is the ReLU, which has no parameters and no key. Set the weights inside <code>with torch.no_grad():</code> with <code>model[0].weight.copy_(...)</code>. Two backward calls add into <code>.grad</code>, so <code>2.weight.grad</code> holds \((9, -3)\), twice the true gradient.` },
  { t: "Two micro-batches", q: String.raw`Run each row as its own batch of one and call backward on each loss without clearing. What is the gradient of \(W_2\)? How do you make it equal the full-batch gradient, and which Lightning flag does this for you?`,
    a: String.raw`Each one-row loss is a mean over one row, so its output gradient is \(2(\hat y - y)\): row 1 gives \(2(-1)(0, 1.5) = (0, -3)\), row 2 gives \(2(1.5)(3, 0) = (9, 0)\). The sum is \((9, -3)\), twice the full-batch gradient. Divide each loss by \(k = 2\) before backward and the sum is \((4.5, -1.5)\), the full-batch gradient. <code>Trainer(accumulate_grad_batches=2)</code> scales the loss this way and steps once per two batches.` }
];

/* ---------- the formula drill ---------- */
const FORM = [
  [21, "The broadcasting rule", String.raw`\text{align shapes from the right: each pair of sizes is equal or one of them is } 1`],
  [21, "Memory of a tensor", String.raw`\text{bytes} = \text{numel}\times\text{element size}, \qquad \text{float32: } 4, \ \text{float16: } 2, \ \text{int64: } 8`],
  [21, "Strides of a contiguous tensor", String.raw`\text{stride}_k = \prod_{j \gt k} n_j, \qquad (4, 3, 2) \to (6, 2, 1)`],
  [22, "The chain rule on a graph", String.raw`\frac{\partial L}{\partial w} = \sum_{\text{paths } w \to L}\ \prod_{\text{edges}} \frac{\partial\,\text{child}}{\partial\,\text{parent}}`],
  [22, "Accumulating k equal micro-batches", String.raw`\nabla L_{\text{batch}} = \frac1k\sum_{j=1}^{k}\nabla L_j`],
  [23, "What nn.Linear computes", String.raw`Y = XW^\top + \mathbf b, \qquad W \in \mathbb R^{\text{out}\times\text{in}}`],
  [23, "Parameters of nn.Linear", String.raw`\text{in}\cdot\text{out} + \text{out}`],
  [24, "The SGD update", String.raw`\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta\,\nabla_{\boldsymbol\theta} L`],
  [24, "The epoch loss over unequal batches", String.raw`\bar L = \frac{\sum_b n_b L_b}{\sum_b n_b}`],
  [25, "Batches per epoch", String.raw`\left\lceil N/B \right\rceil, \qquad \left\lfloor N/B \right\rfloor \ \text{with } \texttt{drop\_last=True}`],
  [25, "ToTensor, then Normalize", String.raw`z = \frac{p/255 - \mu}{\sigma}`],
  [26, "Training memory with Adam in float32", String.raw`4 + 4 + 8 = 16 \ \text{bytes per parameter, plus activations}`],
  [26, "The gradient scaler", String.raw`\text{backward on } sL, \quad \mathbf g = \mathbf g_s / s`, String.raw`\text{inf or nan: skip the step, } s \leftarrow s/2`],
  [27, "Optimizer steps per epoch with accumulation", String.raw`\left\lceil \frac{\lceil N/B \rceil}{a} \right\rceil`],
  [27, "When early stopping ends the run", String.raw`\text{best epoch } e^\ast, \ \text{patience } p: \ \text{stop after } e^\ast + p, \ \text{restore } e^\ast`]
];
ML.L28.BOARD = BOARD; ML.L28.FORM = FORM;

addLesson("ml", "torch", {
level: "Core", num: "Lesson 28",
id: "ml-torch-l28", title: "Part 5 test", short: "28. Part 5 test",
big: String.raw`Thirty-two scored questions over the whole of Part 5, in four sections of eight, plus a board problem in the final exam style. Section A is tensors, Section B autograd and nn.Module, Section C the training loop and data, Section D pro PyTorch and Lightning. Each section is its own card with its own score, so you can retake the weak one without redoing the rest. Most questions show a few lines of PyTorch and ask what they print, what shape comes out, or why they fail, the way HW4 asks you to predict before you run. The others ask for a number you can get on paper: a parameter count, a gradient, a step count, a memory budget. Before the sections there is a formula drill, after them a nine-part board problem that runs a two-layer network forward and backward by hand and then in PyTorch, and a score sheet that tells you which lessons to reopen.`,
bridge: String.raw`Part 5 rebuilt the linear model of Part 4 in PyTorch and then went past it: tensors in Lesson 21, autograd in Lesson 22, modules in Lesson 23, the loop in Lesson 24, the data pipeline in Lesson 25, devices, checkpoints, seeds and number formats in Lesson 26, and Lightning in Lesson 27. Part 6 trains classifiers with exactly this machinery, and the final exam asks for a forward pass and a backward pass by hand, which is the board problem here.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. Map", t: "What the four sections cover",
intu: String.raw`Click a section to see which lessons it draws on and the topics its questions touch. Take the formula drill first if Part 5 is more than a few days behind you, then the sections in order. Each section is scored out of 8 and is passed at 6. The whole test at 26 or above means Part 5 is done. The board problem is not scored. Work it on paper with the solution hidden, then compare line by line.`,
eq: String.raw`\[ 4 \text{ sections} \times 8 \text{ questions} = 32, \qquad \text{pass: } 6 \text{ per section}, \ 26 \text{ overall} \]`,
sym: [["section A", "indexing, reductions, broadcasting, dtypes, bytes, strides, NumPy sharing"], ["section B", "gradients on a graph, accumulation, detach, leaf updates, parameter counts, registration, the state dict"], ["section C", "loop order, step counts, epoch loss, eval, patience, collate, transforms, shared Subsets"], ["section D", "devices, memory, resuming, float16 and bfloat16, the scaler, Lightning steps and hooks"], ["board problem", "a two-layer network by hand, nine parts, worked solutions"]],
how: ["Do the formula drill.", "Take A, B, C, D in order, with paper and no computer.", "Predict the output before you read the options.", "Work the board problem with each solution hidden.", "Enter your four scores on the score sheet and reopen what it names."],
say: String.raw`Four sections of eight questions over Lessons 21 to 27, pass at six per section and twenty-six overall, plus an unscored board problem with worked solutions.`,
num: String.raw`<b>32</b> scored questions, about <b>50 minutes</b> on a first pass, and about <b>30 minutes</b> for the board problem.`,
note: String.raw`The final exam asks for a two-layer network with ReLU by hand, a forward pass with MSE, and which loss or layer fits a task. The board problem is that question. Do it twice, a week apart.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns(SEC.map((s, i) => [i, s[0].slice(0, 1)]), "k") + `<div id="l28mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    const lessons = [21, 22, 23, 24, 25, 26, 27];
    lessons.forEach((L, i) => {
      const x = 12 + i * 94, on = SEC[k][2].includes(L);
      s += `<rect x="${x}" y="24" width="86" height="58" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 43, 48, "Lesson " + L, "middle", "th") + tx(x + 43, 70, LESS[L], "middle");
    });
    SEC.forEach((sc, i) => {
      const x = 20 + i * 162, on = i === k;
      s += `<rect x="${x}" y="128" width="152" height="50" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 76, 148, sc[0].split(".")[0] + ". 8 questions", "middle", "th") + tx(x + 76, 166, sc[1], "middle");
      if (on) sc[2].forEach(L => { const xx = 12 + lessons.indexOf(L) * 94 + 43; s += `<line x1="${xx}" y1="84" x2="${x + 76}" y2="126" stroke="${C.teal}" stroke-width="1.4" stroke-dasharray="3 3"/>`; });
    });
    const tops = SEC[k][2].flatMap(L => TOPIC[L]);
    tops.forEach((t, i) => { const col = i % 4, rowi = Math.floor(i / 4), x = 20 + col * 162, y = 206 + rowi * 30; s += `<rect x="${x}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x + 76, y + 16, t, "middle"); });
    const H = 206 + Math.ceil(tops.length / 4) * 30 + 8;
    fig.innerHTML = svg(H, s);
    $("l28mx").innerHTML = `<p class="note"><b>${SEC[k][0]}</b> draws on ${SEC[k][2].map(L => "Lesson " + L + " (" + LESS[L] + ")").join(" and ")}. The grey chips are the topics its eight questions touch.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "1. Formula drill", t: "Fifteen rules and formulas to write from memory before the test",
intu: String.raw`PyTorch questions are mostly about rules rather than long formulas: how shapes broadcast, how many bytes a tensor takes, how many parameters a layer has, how many steps a run takes. The drill shows the name of one, you write it on paper, then reveal it and mark yourself honestly. The bar chart counts what you knew per lesson. Run it until every bar is full, then start Section A.`,
eq: String.raw`\[ \text{15 rules and formulas from Lessons 21 to 27} \]`,
sym: [["name", "what you are asked to write"], ["reveal", "shows the rule as the lesson wrote it"], ["I knew it", "counts toward that lesson's bar"], ["not yet", "keeps the item in the next round"]],
how: ["Read the name.", "Write the rule or formula on paper.", "Reveal and compare every factor and every ceiling.", "Mark yourself and go on.", "Start a new round with only the misses."],
say: String.raw`The drill checks that the broadcasting rule, tensor memory, strides, the chain rule, accumulation, the Linear layer, the update, the epoch loss, batch counts, the transforms, training memory, the scaler, Lightning step counts and early stopping can be written from memory.`,
num: String.raw`<b>15</b> items, <b>3</b> from Lesson 21 and <b>2</b> from each of Lessons 22 to 27.`,
note: String.raw`The two most common lost marks on PyTorch shape questions are forgetting that nn.Linear stores W as (out, in) and forgetting the ceiling when counting batches. Check both every time.`,
r(fig, ctl) {
  let order = FORM.map((_, i) => i), pos = 0, shown = false;
  const known = new Set(), round = { n: 1 };
  ctl.innerHTML = `<div class="row"><button id="l28fs" class="on">Reveal</button><button id="l28fk">I knew it</button><button id="l28fn">Not yet</button><button id="l28fr">New round with misses</button><button id="l28fa">Start over</button></div><div id="l28fo"></div>`;
  const u = () => {
    const done = pos >= order.length;
    let s = "";
    const Ls = [21, 22, 23, 24, 25, 26, 27];
    Ls.forEach((L, i) => {
      const tot = FORM.filter(r => r[0] === L).length, kn = FORM.filter((r, j) => r[0] === L && known.has(j)).length, x = 20 + i * 94;
      s += `<rect x="${x}" y="30" width="80" height="14" rx="4" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="30" width="${80 * kn / tot}" height="14" rx="4" fill="${C.teal}"/>` + tx(x + 40, 22, "Lesson " + L, "middle", "t") + tx(x + 40, 60, `${kn} of ${tot}`, "middle");
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
    $("l28fs").disabled = done || shown; $("l28fk").disabled = done || !shown; $("l28fn").disabled = done || !shown;
    $("l28fr").disabled = !done || known.size === FORM.length;
    $("l28fo").innerHTML = ML.readout([["known", `${known.size} of ${FORM.length}`], ["this round", done ? "finished" : `${order.length - pos} left`]]);
    if (shown && !done) typesetMath(fig);
  };
  $("l28fs").onclick = () => { shown = true; u(); };
  $("l28fk").onclick = () => { known.add(order[pos]); pos++; shown = false; u(); };
  $("l28fn").onclick = () => { pos++; shown = false; u(); };
  $("l28fr").onclick = () => { order = FORM.map((_, i) => i).filter(i => !known.has(i)); pos = 0; shown = false; round.n++; u(); };
  $("l28fa").onclick = () => { known.clear(); order = FORM.map((_, i) => i); pos = 0; shown = false; round.n = 1; u(); };
  u();
}},

{s: "A. Tensors", t: "Section A: shapes, dtypes and memory",
intu: String.raw`Eight questions from Lesson 21, in the style of HW4 Parts 1 to 3. Index a three-dimensional tensor, reduce along a named axis, broadcast two shapes, catch the (N, 1) against (N,) trap, predict a uint8 overflow, count the bytes of a batch, explain why view fails after a transpose, and tell which conversion from NumPy shares memory.`,
eq: String.raw`\[ \text{Section A: 8 questions, pass at 6} \]`,
sym: [["Lesson 21", "creation, dtype, device, indexing, reductions, shape tricks, broadcasting, strides, sharing, NumPy, batch prediction"]],
how: ["Write the shape of every operand before you compute anything.", "For broadcasting, align the shapes from the right.", "For a memory question, ask whether the result is a view or a copy."],
say: String.raw`Section A tests whether you can predict the shape, dtype and memory behavior of a tensor operation before running it.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What are a and b.shape?", code: ["t = torch.arange(36).reshape(3, 4, 3)", "a = t[1, 2, 0]", "b = t[1:, ::2, -1]"], o: ["a = 18 and b.shape = (2, 2)", "a = 21 and b.shape = (2, 2)", "a = 18 and b.shape = (2, 2, 1)", "a = 15 and b.shape = (2, 4)"], a: 0, why: "Index [1, 2, 0] is matrix 1 (offset 12), row 2 (offset 2 · 3 = 6), column 0, so 18. In b, 1: keeps matrices 1 and 2, ::2 keeps rows 0 and 2, and the integer index −1 removes the column axis: b = [[14, 20], [26, 32]] with shape (2, 2). Lesson 21 card 5." },
    { q: "What are s and m.shape?", code: ["x = torch.tensor([[1., 4., 2.], [3., 0., 5.]])", "s = x.sum(dim=0)", "m = x.mean(dim=1, keepdim=True)"], o: ["tensor([7., 8.]) and (2,)", "tensor([4., 4., 7.]) and (2, 1)", "tensor([4., 4., 7.]) and (1, 3)", "tensor([7., 8.]) and (2, 1)"], a: 1, why: "dim names the axis that disappears. Summing over dim 0 adds the two rows: (1 + 3, 4 + 0, 2 + 5). The mean over dim 1 gives one value per row, 2.333 and 2.667, and keepdim leaves that axis as size 1: (2, 1). Lesson 21 card 6." },
    { q: "a has shape (6, 1, 4) and b has shape (3, 1). What is the shape of a + b?", o: ["an error, the ranks differ", "(6, 1, 4)", "(18, 4)", "(6, 3, 4)"], a: 3, why: "Align from the right: (6, 1, 4) against (3, 1) read as (1, 3, 1). 4 with 1 gives 4, 1 with 3 gives 3, and the missing leading axis of b counts as 1, giving 6. Lesson 21 card 8." },
    { q: "pred has shape (8, 1) and the targets y have shape (8,). What is (pred − y).shape?", o: ["(8,)", "(8, 1)", "an error", "(8, 8)"], a: 3, why: "(8, 1) against (8,) aligns as (8, 1) and (1, 8), so every prediction is paired with every target. nn.MSELoss warns and averages 64 numbers instead of 8. Keep targets as (N, 1), the HW8 2B rule. Lesson 21 card 12." },
    { q: "What does this print?", code: ["u = torch.tensor([200], dtype=torch.uint8)", "print(u + 100)"], o: ["tensor([300])", "tensor([44], dtype=torch.uint8)", "tensor([255], dtype=torch.uint8)", "an overflow error"], a: 1, why: "uint8 holds 0 to 255 and wraps around without a warning: 300 − 256 = 44. Adding the float 100.0 instead promotes to float32 and gives 300. Image pixels arrive as uint8, so convert before you do arithmetic. Lesson 21 card 3." },
    { q: "A float32 image batch has shape (32, 3, 64, 64). It holds", o: ["393,216 numbers in 1.5 MiB", "393,216 numbers in 393 kB", "12,288 numbers in 48 kB", "1,572,864 numbers in 6 MiB"], a: 0, why: "32 · 3 · 64 · 64 = 393,216 numbers at 4 bytes each is 1,572,864 bytes, exactly 1.5 MiB. The last option counts bytes as numbers. Lesson 21 card 1." },
    { q: "Which statement is right?", code: ["x = torch.arange(6).reshape(2, 3)", "y = x.T", "z = y.reshape(-1)"], o: ["y.view(-1) works too and gives the same z", "z is tensor([0, 1, 2, 3, 4, 5])", "z is tensor([0, 3, 1, 4, 2, 5]), a new copy, because y has strides (1, 3) and is not contiguous", "z is a view, so z[0] = 100 changes x"], a: 2, why: "x has strides (3, 1) and the transpose only swaps them, so y reads memory out of order. y.view(-1) raises 'view size is not compatible with input tensor's size and stride', reshape copies the values in y's logical order, and writing into z leaves x unchanged. HW4 Part 2. Lesson 21 card 9." },
    { q: "What does this print?", code: ["a = np.zeros(3, dtype=np.float32)", "t1 = torch.from_numpy(a)", "t2 = torch.tensor(a)", "a[0] = 7", "print(t1[0].item(), t2[0].item())"], o: ["7.0 7.0", "0.0 0.0", "0.0 7.0", "7.0 0.0"], a: 3, why: "from_numpy shares the array's memory, torch.tensor copies it. HW4 Part 3 shows the same with 99.0. Lesson 21 card 11." }
  ], "Section A");
}},

{s: "B. Autograd and modules", t: "Section B: gradients, parameters and registration",
intu: String.raw`Eight questions from Lessons 22 and 23. Read a gradient off a small graph, predict what two backward calls leave in .grad, see what detach cuts, update a leaf the right way, count the parameters of a Sequential, read the shape of a Linear weight, find the layers a plain list hides, and count what <code>state_dict</code> holds.`,
eq: String.raw`\[ \text{Section B: 8 questions, pass at 6} \]`,
sym: [["Lesson 22", "graph, requires grad, backward, local rules, accumulation, gradient check, no grad, detach, manual loop"], ["Lesson 23", "Linear, registration, calling a model, counting, shapes, containers, state dict, buffers, saving, debugging"]],
how: ["For a gradient, add the contributions of every path.", "For a parameter count, write in times out plus out for each Linear.", "For a registration question, ask whether the module can see the attribute."],
say: String.raw`Section B tests whether you can predict what autograd stores and what a module registers.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What are x.grad and y.grad?", code: ["x = torch.tensor(2., requires_grad=True)", "y = torch.tensor(3., requires_grad=True)", "z = x * y + x ** 2", "z.backward()"], o: ["7 and 2", "3 and 2", "4 and 3", "10 and 10"], a: 0, why: "x reaches z along two paths and the contributions add: y from the product and 2x from the square, 3 + 4 = 7. The product swaps its inputs, so y.grad = x = 2. Lesson 22 cards 1 and 4." },
    { q: "What does this print?", code: ["w = torch.tensor(1.5, requires_grad=True)", "for _ in range(2):", "    loss = (3 * w) ** 2", "    loss.backward()", "print(w.grad)"], o: ["tensor(27.)", "tensor(54.)", "tensor(13.5000)", "an error, the graph was freed"], a: 1, why: "d(9w²)/dw = 18w = 27 per call. The loss is rebuilt inside the loop, so no graph is reused, and backward adds into .grad: 27 + 27 = 54. Lesson 22 card 5." },
    { q: "What is a.grad?", code: ["a = torch.tensor(2., requires_grad=True)", "b = a * 3", "c = b.detach() * a", "c.backward()"], o: ["12", "24", "6", "None"], a: 2, why: "detach keeps the value 6 but cuts the path through b, so autograd sees c = 6a and the gradient is 6. Without detach c = 3a² and the gradient is 12. Lesson 22 card 8." },
    { q: "What does the last line do?", code: ["w = torch.ones(3, requires_grad=True)", "loss = (2 * w).sum()", "loss.backward()", "w -= 0.1 * w.grad"], o: ["sets every entry of w to 0.8", "raises RuntimeError: a leaf Variable that requires grad is being used in an in-place operation", "updates w and records the update in the graph", "nothing, because w.grad is None"], a: 1, why: "An in-place change of a leaf that requires grad is refused while autograd records. Put the update inside with torch.no_grad(): and every entry becomes 0.8. Lesson 22 cards 7 and 9." },
    { q: "How many parameters does nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 16), nn.ReLU(), nn.Linear(16, 3)) have?", o: ["880", "931", "1,027", "883"], a: 1, why: "10 · 32 + 32 = 352, 32 · 16 + 16 = 528 and 16 · 3 + 3 = 51, total 931. The ReLUs have none. Leaving out the biases gives 880. Lesson 23 card 5." },
    { q: "layer = nn.Linear(4, 2). What are layer.weight.shape and layer(torch.zeros(7, 4)).shape?", o: ["(4, 2) and (7, 2)", "(2, 4) and (2, 7)", "(2, 4) and (7, 2)", "(4, 2) and (2, 7)"], a: 2, why: "The weight is stored as (out, in) and the layer computes x Wᵀ + b, so each of the 7 rows maps to 2 outputs. HW4 Part 6 records the same shapes. Lesson 23 card 2." },
    { q: "What is sum(p.numel() for p in Net().parameters())?", code: ["class Net(nn.Module):", "    def __init__(self):", "        super().__init__()", "        self.layers = [nn.Linear(3, 3), nn.Linear(3, 1)]", "    def forward(self, x):", "        for layer in self.layers:", "            x = layer(x)", "        return x"], o: ["16", "12", "0", "an error in __init__"], a: 2, why: "A plain Python list hides the layers from the module, so nothing is registered. torch.optim.SGD(model.parameters(), lr=0.1) then raises 'optimizer got an empty parameter list'. With nn.ModuleList the count is 12 + 4 = 16. Lesson 23 card 3." },
    { q: "model = nn.Sequential(nn.Linear(5, 8), nn.BatchNorm1d(8), nn.ReLU(), nn.Linear(8, 2)). How many entries does model.state_dict() have, and how many numbers do the parameters hold?", o: ["4 entries and 82 numbers", "9 entries and 99 numbers", "9 entries and 82 numbers", "6 entries and 66 numbers"], a: 2, why: "Parameters: Linear(5, 8) has 48, the BatchNorm weight and bias 16, Linear(8, 2) has 18, so 82. state_dict adds the buffers running_mean, running_var and num_batches_tracked, giving 9 entries that hold 99 numbers. Lesson 23 card 8." }
  ], "Section B");
}},

{s: "C. Loop and data", t: "Section C: the training loop and the data pipeline",
intu: String.raw`Eight questions from Lessons 24 and 25. A loss built outside the loop, the number of optimizer steps in a run, the epoch loss over a short last batch, what eval does and does not do, early stopping with patience, the dtype that collate gives a Python float, ToTensor followed by Normalize, and the transform that two splits of one dataset share.`,
eq: String.raw`\[ \text{Section C: 8 questions, pass at 6} \]`,
sym: [["Lesson 24", "five steps, their order, optimizers, epochs and iterations, epoch loss, modes, checkpoints, early stopping, fair comparisons, curves"], ["Lesson 25", "Dataset contract, TensorDataset, collate, shuffling, stratified splits, transforms, augmentation, separate views, workers"]],
how: ["For a loop question, ask what runs once and what runs every batch.", "For a count, write the ceiling first.", "For a data question, trace one example from storage to the batch."],
say: String.raw`Section C tests whether you can count, order and debug the steps of a training run and the path an example takes into a batch.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What happens?", code: ["loss = loss_fn(model(X), y)", "for step in range(100):", "    optimizer.zero_grad()", "    loss.backward()", "    optimizer.step()"], o: ["it trains normally", "step 0 works, then step 1 raises: Trying to backward through the graph a second time", "nothing trains, but there is no error", "the gradients double every step"], a: 1, why: "The forward pass ran once, so there is one graph, and the first backward frees it. Forward and loss belong inside the loop so that each step builds a new graph from the updated weights. Lesson 24 card 2." },
    { q: "1,250 training rows, batch size 64, drop_last=False, 30 epochs. How many optimizer steps does the run take?", o: ["570", "586", "600", "1,920"], a: 2, why: "⌈1250/64⌉ = 20 batches per epoch, 19 full ones and a last one of 34 rows, so 20 · 30 = 600 steps. With drop_last=True it would be 19 · 30 = 570. Lesson 24 card 4." },
    { q: "An epoch has batches of 64, 64 and 22 rows with mean losses 0.40, 0.50 and 0.95. The epoch loss is", o: ["0.617", "0.523", "0.950", "0.450"], a: 1, why: "(64 · 0.40 + 64 · 0.50 + 22 · 0.95)/150 = 78.5/150 = 0.523. The mean of the three means, 0.617, counts the short batch like a full one. Lesson 24 card 5." },
    { q: "Which statement about model.eval() is right?", o: ["it turns gradient tracking off", "it is the same as torch.no_grad()", "it freezes the parameters so the optimizer cannot change them", "it switches Dropout off and makes BatchNorm use its running statistics, and gradient tracking stays on"], a: 3, why: "eval() only changes how layers behave. Validation needs both eval() and torch.no_grad(), and training needs train() again afterwards. Lesson 24 card 6." },
    { q: "Validation losses per epoch are 0.90, 0.71, 0.64, 0.66, 0.62, 0.63, 0.65, 0.64, 0.67 with patience 3. Training stops after epoch ___ and restores epoch ___.", o: ["8 and 5", "9 and 5", "6 and 3", "8 and 8"], a: 0, why: "Epoch 5 is the best at 0.62. Epochs 6, 7 and 8 do not beat it (0.64 at epoch 8 beats epoch 7 but not 0.62), so patience runs out after epoch 8 and the deep copy from epoch 5 is restored. Lesson 24 card 8." },
    { q: "X is a float32 tensor of shape (20, 3). What are yb.dtype and yb.shape?", code: ["class Rows(Dataset):", "    def __init__(self, X, y):", "        self.X, self.y = X, y", "    def __len__(self):", "        return len(self.X)", "    def __getitem__(self, i):", "        return self.X[i], float(self.y[i])", "", "xb, yb = next(iter(DataLoader(Rows(X, y), batch_size=8)))"], o: ["torch.float32 and (8, 1)", "torch.float64 and (8,)", "torch.float32 and (8,)", "a list of 8 Python floats"], a: 1, why: "default_collate turns Python floats into a float64 tensor and stacks them into (8,). Feeding float64 into a Linear layer raises 'mat1 and mat2 must have the same dtype'. Return torch.tensor([y], dtype=torch.float32) to get float32 (8, 1). Lesson 25 card 4." },
    { q: "A uint8 pixel with value 51 goes through ToTensor() and then Normalize(mean=(0.5,), std=(0.25,)). The result is", o: ["−1.2", "203.0", "0.2", "−0.8"], a: 0, why: "ToTensor divides by 255: 51/255 = 0.2. Normalize gives (0.2 − 0.5)/0.25 = −1.2. Lesson 25 card 7." },
    { q: "Which transform do the training images get?", code: ["full = ImageFolder(root)", "train_ds, val_ds = random_split(full, [800, 200])", "train_ds.dataset.transform = augment", "val_ds.dataset.transform = plain"], o: ["augment", "plain, because both splits share one dataset and the last assignment wins", "none", "augment for training and plain for validation, as intended"], a: 1, why: "random_split returns two Subsets that point at the same dataset object, so there is only one transform attribute. Wrap each split in its own view, as HW8's TransformView does. Lesson 25 card 9." }
  ], "Section C");
}},

{s: "D. Pro and Lightning", t: "Section D: devices, memory, checkpoints, precision and Lightning",
intu: String.raw`Eight questions from Lessons 26 and 27. A device bug that hides on a laptop, the memory a model needs before any activations, what a model-only resume does to Adam, float16 and bfloat16 at a large value, what the gradient scaler does with an inf, a Lightning step count with accumulation, a training step that returns nothing, and what runs before the first training batch.`,
eq: String.raw`\[ \text{Section D: 8 questions, pass at 6} \]`,
sym: [["Lesson 26", "device line, GPU queue, memory, resumable checkpoints, safe loading, seeds, number formats, mixed precision, profiling"], ["Lesson 27", "LightningModule, hook order, logging, DataModule, Trainer flags, checkpoints, early stopping, resuming, bugs"]],
how: ["For a device question, ask where every tensor lives.", "For memory, count bytes per parameter first.", "For Lightning, ask which line of the plain loop the Trainer now runs."],
say: String.raw`Section D tests whether a run will work on another machine, fit in memory, resume exactly and train the number of steps you planned.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "This runs on your laptop and fails on the GPU cluster. Why?", code: ["device = 'cuda' if torch.cuda.is_available() else 'cpu'", "model = model.to(device)", "for xb, yb in loader:", "    xb.to(device)", "    yb.to(device)", "    loss = loss_fn(model(xb), yb)"], o: ["the model must be moved inside the loop", "the loader needs pin_memory=True", ".to returns a new tensor and the result is thrown away, so the batch stays on the CPU while the model is on the GPU", "the loss function must be moved to the GPU"], a: 2, why: "Tensor .to is not in place. On a CPU-only machine nothing needs to move, so the bug hides. Write xb, yb = xb.to(device), yb.to(device). Module .to does work in place, which is why the model line is fine. Lesson 26 card 1." },
    { q: "A model with 25 million parameters trains in float32 with Adam. Before any activations, training needs about", o: ["100 MB", "200 MB", "300 MB", "400 MB"], a: 3, why: "4 bytes of weights, 4 of gradients and 8 for Adam's two moments make 16 bytes per parameter: 25e6 · 16 = 400 MB. Activations come on top and grow with the batch. Lesson 26 card 3." },
    { q: "You resume an Adam run after epoch 6 by loading only model.state_dict() into a fresh model with a fresh Adam. What happens?", o: ["the run continues exactly", "Adam's moments restart at zero, so the first updates are close to lr in every coordinate, larger than the run was taking", "the learning rate resets to zero", "loading fails because the optimizer state is missing"], a: 1, why: "In Lesson 26 the first update after a model-only resume had norm 0.0806 against 0.0169 in the uninterrupted run. Save and load the optimizer state, the epoch and the generator states as well. Lesson 26 card 4." },
    { q: "x = torch.tensor(70000.). What do x.half() and x.bfloat16() give?", o: ["70000 and 70000", "65504 and 70000", "inf and inf", "inf and 70144"], a: 3, why: "float16 tops out at 65504, so 70000 overflows to inf. bfloat16 keeps float32's range with 8 bits of precision, so above 2¹⁶ its spacing is 512 and 70000 rounds to 137 · 512 = 70144. Lesson 26 card 9." },
    { q: "During float16 training the GradScaler finds an inf in the scaled gradients at scale 65,536. It", o: ["clips the gradient to 65,504", "skips this optimizer step and halves the scale to 32,768", "raises an error", "steps anyway and doubles the scale"], a: 1, why: "scaler.step unscales the gradients, finds the inf and skips the step, then scaler.update multiplies the scale by 0.5. After 2,000 clean steps it doubles the scale again. Lesson 26 card 10." },
    { q: "Lightning, 3,000 training rows, batch size 32, accumulate_grad_batches=4, max_epochs=10. After fit, trainer.global_step is", o: ["940", "230", "240", "235"], a: 2, why: "⌈3000/32⌉ = 94 batches per epoch. Lightning steps every 4 batches and once more at the end of the epoch, so ⌈94/4⌉ = 24 steps per epoch and 240 in all. A real run printed 240. Lesson 27 card 6." },
    { q: "The run finishes without an error. What did the model learn?", code: ["def training_step(self, batch, batch_idx):", "    x, y = batch", "    loss = F.mse_loss(self(x), y)", "    self.log('train_loss', loss)"], o: ["the same as with return loss", "nothing: with no loss returned Lightning skips backward and the step, and the weights stay at their initial values", "it trains, but the log is empty", "it trains at half speed"], a: 1, why: "Lightning runs backward and the optimizer step on what training_step returns, and None means skip this batch. A real one-epoch run of 94 batches ended with unchanged weights while global_step still read 94. Lesson 27 card 12." },
    { q: "A Trainer gets a training loader and a validation loader. Before the first training_step, it calls validation_step on", o: ["no batches, validation waits for the end of epoch 1", "2 validation batches, the sanity check", "the whole validation set", "one training batch in eval mode"], a: 1, why: "num_sanity_val_steps defaults to 2, so a bug in validation_step shows up in seconds rather than after a full epoch. The recorded run began val, val, train, train. Lesson 27 card 3." }
  ], "Section D");
}},

{s: "Board problem", t: "A board problem: a two-layer network forward and backward by hand",
intu: String.raw`The final exam asks for a small network by hand, and this board problem is that question in nine parts, each using the last. Two rows, two features, two ReLU units and one output. Step through the parts, work each on paper, then press Show solution. The picture follows along: the values at each node for the row you pick, the weights on the edges, then the gradients on the edges, then the weights after one step. Every number in the solutions was produced with PyTorch and is small enough to check by hand.`,
eq: String.raw`\[ \hat{\mathbf y} = \mathrm{ReLU}\left(XW_1^\top + \mathbf b_1\right)W_2^\top + b_2, \qquad L = \frac1N\sum_i \left(\hat y_i - y_i\right)^2 \]`,
sym: [["X", "rows (1, 2) and (2, −1)"], ["y", "targets 0 and 2, shape (2, 1)"], [String.raw`\(W_1\)`, "rows (1, −1) and (0.5, 1), stored as (out, in)"], [String.raw`\(\mathbf b_1\)`, "(0, −1)"], [String.raw`\(W_2\)`, "(1, −1), with \\(b_2 = 0.5\\)"], [String.raw`\(\eta\)`, "0.1 for the SGD step"]],
how: ["Pick a row with the buttons and read the part.", "Work it on paper.", "Show the solution and compare line by line.", "Mark any part you got wrong and reopen its lesson.", "Go to the next part, which uses this one."],
say: String.raw`For this network the outputs are −1 and 3.5, the loss is 1.625, the output weight gradient is (4.5, −1.5), the first layer gradient has rows (3, −1.5) and (1, 2), and one SGD step at 0.1 brings the loss to 0.1276.`,
num: String.raw`ŷ = (<b>−1, 3.5</b>), L = <b>${g(B0.F.loss)}</b>, with a (2,) target <b>${g(TRAPL)}</b>, ∂L/∂W₂ = (<b>${g(B0.G.W2[0])}, ${g(B0.G.W2[1])}</b>), ∂L/∂b₂ = <b>${g(B0.G.b2)}</b>, ∂L/∂W₁ rows (<b>3, −1.5</b>) and (<b>1, 2</b>), after one step L = <b>${f(F1.loss, 4)}</b>.`,
note: String.raw`The ReLU decides which weights get a gradient. Row 1 has unit 1 off, so the first row of W₁ learns only from row 2. On the exam, write the ReLU mask next to Z₁ before you start the backward pass.`,
r(fig, ctl) {
  let open = false, cur = 0, smp = 0;
  const Lab = ["shapes", "first layer", "ReLU and output", "loss", "output gradient", "through ReLU", "SGD step", "in PyTorch", "micro-batches"];
  const IN = [[60, 90], [60, 210]], HID = [[250, 90], [250, 210]], OUT = [430, 150];
  const lab = (x, y, t, col) => `<rect x="${x - 32}" y="${y - 13}" width="64" height="22" rx="5" fill="var(--sunk)" stroke="${col || "var(--line)"}"/>` + `<text class="t" x="${x}" y="${y + 4}" text-anchor="middle" style="font-family:var(--mono);font-size:13px;${col ? `fill:${col}` : ""}">${t}</text>`;
  const node = (x, y, top, val, cls) => `<g class="${cls || "c-gray"}"><circle cx="${x}" cy="${y}" r="32" stroke-width="1.2" style="fill:var(--${(cls || "c-gray").slice(2)}-bg);stroke:var(--${(cls || "c-gray") === "c-gray" ? "p" : (cls || "").slice(2)})"/></g>` + tx(x, y - 5, top, "middle", "t") + (val != null ? `<text class="ts" x="${x}" y="${y + 13}" text-anchor="middle" style="font-family:var(--mono)">${val}</text>` : "");
  const draw = k => {
    const P = k === 6 ? P1 : P0, F = fwd(P), r = F.R[smp], G = B0.G;
    const W1lab = (j, i) => k === 5 ? g(G.W1[j][i]) : k === 6 ? g(P1.W1[j][i]) : g(P0.W1[j][i]);
    const W2lab = j => k === 4 ? g(G.W2[j]) : k === 8 ? g(MB[smp].W2[j]) : k === 6 ? g(P1.W2[j]) : g(P0.W2[j]);
    const gradOn1 = k === 5, gradOn2 = k === 4 || k === 8;
    let s = "";
    /* edges */
    IN.forEach((pi, i) => HID.forEach((ph, j) => { s += `<line x1="${pi[0] + 30}" y1="${pi[1]}" x2="${ph[0] - 30}" y2="${ph[1]}" stroke="${gradOn1 ? C.coral : "var(--p)"}" stroke-width="1.3" opacity="0.7"/>`; }));
    HID.forEach((ph, j) => { s += `<line x1="${ph[0] + 30}" y1="${ph[1]}" x2="${OUT[0] - 30}" y2="${OUT[1]}" stroke="${gradOn2 ? C.coral : "var(--p)"}" stroke-width="1.3" opacity="0.7"/>`; });
    const pos = [[[155, 76], [122, 122]], [[122, 178], [155, 224]]]; /* pos[i][j] label for input i to hidden j */
    IN.forEach((_, i) => HID.forEach((_, j) => { s += lab(pos[i][j][0], pos[i][j][1], W1lab(j, i), gradOn1 ? C.coral : null); }));
    s += lab(340, 112, W2lab(0), gradOn2 ? C.coral : null) + lab(340, 190, W2lab(1), gradOn2 ? C.coral : null);
    /* nodes */
    const showX = k >= 1 && k !== 7, xs = r.x;
    IN.forEach((p, i) => { s += node(p[0], p[1], "x" + "₁₂"[i], showX ? g(xs[i]) : null); });
    HID.forEach((p, j) => {
      let val = null, cls = "c-gray";
      if (k === 1) { val = "z " + g(r.z[j]); cls = "c-blue"; }
      if (k === 2 || k === 3 || k === 6) { val = "a " + g(r.a[j]); cls = r.z[j] > 0 ? "c-teal" : "c-gray"; }
      if (k === 4 || k === 8) { val = "a " + g(r.a[j]); cls = r.z[j] > 0 ? "c-teal" : "c-gray"; }
      if (k === 5) { val = "δ " + g(B0.G.per[smp].dZ[j]); cls = r.z[j] > 0 ? "c-coral" : "c-gray"; }
      s += node(p[0], p[1], "h" + "₁₂"[j], val, cls);
      const bv = k === 5 ? "∂b " + g(G.b1[j]) : "b " + g(P.b1[j]);
      s += tx(p[0], p[1] + 48, bv, "middle");
    });
    const outv = k >= 2 && k !== 5 && k !== 7 ? "ŷ " + g(r.yh) : k === 5 ? "g " + g(B0.G.per[smp].gy) : null;
    s += node(OUT[0], OUT[1], "out", outv, k >= 2 && k !== 7 ? "c-purple" : "c-gray");
    s += tx(OUT[0], OUT[1] + 48, k === 4 ? "∂b₂ " + g(G.b2) : "b₂ " + g(P.b2), "middle");
    if (k === 4) s += tx(OUT[0], OUT[1] + 72, `row ${smp + 1}: g = 2(ŷ − y)/N = ` + g(B0.G.per[smp].gy), "middle");
    /* right panel */
    const side = [];
    if (k === 0) side.push(["th", "shapes"], ["ts", "X (2, 2), y (2, 1)"], ["ts", "W₁ (2, 2), b₁ (2,)"], ["ts", "W₂ (1, 2), b₂ (1,)"], ["ts", "hidden (2, 2), out (2, 1)"], ["t", "6 + 3 = 9 parameters"]);
    if (k === 1 || k === 2) side.push(["th", `row ${smp + 1}`], ["ts", `x = (${g(r.x[0])}, ${g(r.x[1])})`], ["ts", `z = (${g(r.z[0])}, ${g(r.z[1])})`]);
    if (k === 2) side.push(["ts", `a = (${g(r.a[0])}, ${g(r.a[1])})`], ["t", `ŷ = ${g(r.yh)}`], ["ts", "grey unit: off for this row"]);
    if (k === 3) side.push(["th", "MSE"], ["ts", `ŷ − y = (${g(F.R[0].e)}, ${g(F.R[1].e)})`], ["t", `L = ${g(F.loss)}`], ["ts", "with y of shape (2,):"], ["ts", "(2, 2) differences"], ["t", `L = ${g(TRAPL)}, wrong`]);
    if (k === 4) side.push(["th", "coral: gradients"], ["ts", `∂L/∂W₂ = (${g(G.W2[0])}, ${g(G.W2[1])})`], ["ts", `∂L/∂b₂ = ${g(G.b2)}`], ["ts", "sum over both rows"]);
    if (k === 5) side.push(["th", "coral: ∂L/∂W₁"], ["ts", `row 1 (${g(G.W1[0][0])}, ${g(G.W1[0][1])})`], ["ts", `row 2 (${g(G.W1[1][0])}, ${g(G.W1[1][1])})`], ["ts", `∂L/∂b₁ = (${g(G.b1[0])}, ${g(G.b1[1])})`], ["ts", `δ for row ${smp + 1} shown`]);
    if (k === 6) side.push(["th", "after one step"], ["ts", "η = 0.1, new weights"], ["ts", `ŷ = (${g(F.R[0].yh)}, ${g(F.R[1].yh)})`], ["t", `L ${g(B0.F.loss)} → ${f(F.loss, 4)}`]);
    if (k === 7) side.push(["th", "state_dict keys"], ["ts", "0.weight (2, 2)"], ["ts", "0.bias (2,)"], ["ts", "1 is the ReLU: no key"], ["ts", "2.weight (1, 2)"], ["ts", "2.bias (1,)"]);
    if (k === 8) side.push(["th", `micro-batch: row ${smp + 1}`], ["ts", `its ∂L/∂W₂ (${g(MB[smp].W2[0])}, ${g(MB[smp].W2[1])})`], ["ts", `sum (${g(MB[0].W2[0] + MB[1].W2[0])}, ${g(MB[0].W2[1] + MB[1].W2[1])})`], ["t", `÷ 2 = (${g((MB[0].W2[0] + MB[1].W2[0]) / 2)}, ${g((MB[0].W2[1] + MB[1].W2[1]) / 2)})`], ["ts", "the full-batch gradient"]);
    side.forEach(([c, t], i) => { s += tx(492, 40 + i * 22, t, null, c); });
    if (k === 7) s += tx(155, 288, "0: nn.Linear(2, 2)", "middle") + tx(250, 160, "1: ReLU", "middle") + tx(340, 288, "2: nn.Linear(2, 1)", "middle");
    fig.innerHTML = svg(300, s) + `<p style="font-weight:600;margin:6px 0 4px">Part ${k + 1}. ${BOARD[k].t}</p><p>${BOARD[k].q}</p>`;
    $("l28bs").innerHTML = open ? `<div class="dnote"><p><b>Solution.</b> ${BOARD[k].a}</p></div>` : `<p class="note">Work it on paper first.</p>`;
    $("l28bb").textContent = open ? "Hide solution" : "Show solution";
    pick(ctl, "rw", smp);
    typesetMath(fig, $("l28bs"));
  };
  ctl.innerHTML = `<div id="l28bt"></div>` + btns([[0, "row 1: x = (1, 2)"], [1, "row 2: x = (2, −1)"]], "rw") + `<div class="row"><button id="l28bb">Show solution</button></div><div id="l28bs"></div>`;
  ctl.querySelectorAll("button[data-rw]").forEach(b => b.onclick = () => { smp = +b.dataset.rw; draw(cur); });
  $("l28bb").onclick = () => { open = !open; draw(cur); };
  ML.stepper($("l28bt"), BOARD.length, k => { if (k !== cur) open = false; cur = k; draw(k); }, Lab);
}},

{s: "Score sheet", t: "Enter your section scores and see what to reopen",
intu: String.raw`Set the four sliders to your section scores. The bars turn teal at 6 or above. For every section below 6 the sheet lists the cards its questions came from, in the order to reopen them. The total decides whether Part 5 is done: 26 of 32 or more. A total of 26 with one section at 5 is not a pass, because each section is a skill the project needs on its own.`,
eq: String.raw`\[ \text{pass} \iff \min_s \text{score}_s \ge 6 \ \text{and} \ \sum_s \text{score}_s \ge 26 \]`,
sym: [["score", "correct answers in a section, 0 to 8"], ["section pass", "6 or more"], ["Part 5 pass", "every section passed and 26 or more overall"]],
how: ["Take each section once without notes.", "Enter the four scores.", "Reopen the listed cards for each red bar.", "Retake only those sections.", "Record the scores and the date in your notes."],
say: String.raw`Part 5 is passed when every section scores at least six and the total is at least twenty-six.`,
num: String.raw`A pass needs <b>26 of 32</b>, about 81 %, with no section below <b>6 of 8</b>.`,
note: String.raw`Section C and Section D are the ones the project leans on. If either is weak, fix it before you write the project's train.py, because those bugs give numbers, not errors.`,
r(fig, ctl) {
  const REV = [["Lesson 21 cards 1, 3, 5, 6, 8, 9, 11, 12"], ["Lesson 22 cards 1, 4, 5, 7, 8, 9", "Lesson 23 cards 2, 3, 5, 8"], ["Lesson 24 cards 2, 4, 5, 6, 8", "Lesson 25 cards 4, 7, 9"], ["Lesson 26 cards 1, 3, 4, 9, 10", "Lesson 27 cards 3, 6, 12"]];
  ctl.innerHTML = SEC.map((sc, i) => sl("l28s" + i, sc[0], 0, 8, 1, 7)).join("") + `<div id="l28so"></div>`;
  const u = () => {
    const v = SEC.map((_, i) => +$("l28s" + i).value);
    v.forEach((x, i) => { $("l28s" + i + "v").textContent = x + " / 8"; });
    const tot = v.reduce((a, b) => a + b, 0), ok = v.every(x => x >= 6) && tot >= 26;
    const a = ML.axes(60, 20, 400, 220, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, nx: 4, ny: 8, fx: () => "", fy: v => v, yl: "score", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(6)}" x2="${a.X(4)}" y2="${a.Y(6)}" stroke="${C.coral}" stroke-dasharray="6 4"/>` + tx(a.X(4) + 6, a.Y(6) + 4, "pass 6", null);
    v.forEach((x, i) => { const x0 = a.X(i + 0.2), w = a.X(i + 0.8) - x0; s += `<rect x="${x0}" y="${a.Y(x)}" width="${w}" height="${a.Y(0) - a.Y(x)}" rx="4" fill="${x >= 6 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, "Section " + "ABCD"[i], "middle") + tx(x0 + w / 2, a.Y(x) - 6, String(x), "middle", "t"); });
    s += tx(530, 60, `total ${tot} / 32`, null, "th") + tx(530, 86, `${Math.round(100 * tot / 32)} %`, null, "t") + tx(530, 124, ok ? "Part 5 passed" : "not yet", null, "th");
    if (!ok && tot >= 26) s += tx(530, 148, "a section is below 6", null);
    fig.innerHTML = svg(280, s);
    const weak = v.map((x, i) => [x, i]).filter(([x]) => x < 6);
    $("l28so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SEC[i][0]}</b> at ${x}: reopen ${REV[i].join(" and ")}, then retake the section.</p>`).join("")}</div>` : `<p class="note">${ok ? "Every section is at 6 or above. Go on to Part 6, which trains classifiers with this machinery." : "Every section is at 6 or above but the total is under 26. Retake the two lowest sections."}</p>`;
  };
  SEC.forEach((_, i) => { $("l28s" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: pin the board problem in PyTorch tests",
intu: String.raw`After working the board problem on paper, have the agent build the same network in PyTorch, set its weights by hand and pin every one of your numbers in a test. Each assertion is one of your hand results, so a failing test means either your paper or the code is wrong, and finding out which is the best practice there is for the final. The command asks for autograd to be compared with your hand gradients, for the (2,) target trap to be shown on purpose, and for the micro-batch sum to be checked against the full batch.`,
eq: String.raw`\[ \texttt{build} \to \texttt{forward} \to \texttt{loss} \to \texttt{backward} \to \texttt{step} \to \texttt{accumulate} \]`,
sym: [["build", "Sequential(Linear(2, 2), ReLU(), Linear(2, 1)) with <code>copy_</code> under <code>no_grad</code>"], ["forward", "Z₁, A₁ and the outputs −1 and 3.5"], ["loss", "1.625, and 6.125 with the warning for a (2,) target"], ["backward", "autograd against the hand gradients"], ["step", "SGD at 0.1, new loss 0.1276"], ["accumulate", "two one-row losses divided by 2 give the full gradient"]],
how: ["Work the board problem on paper first.", "Paste the command.", "Read the tests: is every number one of yours?", "Run pytest and compare any failure with your paper.", "Commit the module with its tests."],
say: String.raw`The agent rebuilds the board network in PyTorch with the given weights and pins each hand result in a pytest test, so a mistake on paper or in code shows up as a failing assertion.`,
num: String.raw`Tests expect ŷ = (<b>−1, 3.5</b>), L = <b>1.625</b>, <b>6.125</b> with the warning, ∂L/∂W₂ = (<b>4.5, −1.5</b>), ∂L/∂W₁ rows (<b>3, −1.5</b>) and (<b>1, 2</b>), ∂L/∂b₁ = (<b>1.5, 1</b>), the new loss <b>0.1276</b>, and (<b>9, −3</b>) for two unscaled backward calls.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/part5_board.py with torch only. A function build() returns nn.Sequential(nn.Linear(2, 2), nn.ReLU(), nn.Linear(2, 1)) with weights set inside torch.no_grad() by copy_: layer 0 weight [[1, -1], [0.5, 1]], bias [0, -1], layer 2 weight [[1, -1]], bias [0.5]. Data X = [[1., 2.], [2., -1.]] and y = [[0.], [2.]] with shape (2, 1). Create tests/test_part5_board.py with pytest: the model has 9 parameters and state_dict keys 0.weight, 0.bias, 2.weight, 2.bias; layer 0 applied to X gives [[-1, 1.5], [3, -1]]; the model gives [[-1], [3.5]]; nn.MSELoss gives 1.625; with y.squeeze(1) the loss is 6.125 and a UserWarning about the target size is raised (use pytest.warns); after loss.backward() the gradients are 0.weight [[3, -1.5], [1, 2]], 0.bias [1.5, 1], 2.weight [[4.5, -1.5]], 2.bias [0.5]; one torch.optim.SGD step with lr 0.1 gives 0.weight [[0.7, -0.85], [0.4, 0.8]] and a new loss of 0.127625 to 5 decimals; two backward calls on fresh forward passes without zero_grad give 2.weight.grad [[9, -3]]; and backward on each one-row loss divided by 2 gives exactly the full-batch gradients. Use torch.testing.assert_close for every tensor. Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_part5_board.py", "........                                                 [100%]", "8 passed"],
    checks: ["build sets the weights under torch.no_grad() with copy_, not by replacing the Parameters", "y has shape (2, 1) everywhere except the one test that shows the trap", "the trap test expects the warning and the value 6.125", "every gradient test calls zero_grad or builds a fresh model first", "the accumulation test divides each one-row loss by 2", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`Part 5 is passed when all four sections score at least six and the total is at least twenty-six. Section A asks you to predict shapes, dtypes and memory: indexing and reductions, broadcasting from the right, the (N, 1) target, uint8 wrap-around, bytes of a batch, view after a transpose, and <code>from_numpy</code> sharing. Section B asks what autograd stores and what a module registers: gradients that add over paths and over backward calls, detach, updates under <code>no_grad</code>, parameter counts, the (out, in) weight, plain lists and <code>state_dict</code> buffers. Section C asks you to count and order a run: the graph built inside the loop, steps per run, the weighted epoch loss, eval against <code>no_grad</code>, patience, collate dtypes, ToTensor and Normalize, and shared Subsets. Section D asks whether a run survives another machine, a resume and a faster format: the device line, 16 bytes per parameter, the optimizer state, float16 against bfloat16, the scaler, and Lightning's step count, return value and sanity check. The board problem runs a two-layer network forward and backward by hand. Misses name a lesson and a card. Reopen them, retake the section, and move to Part 6.`,
sheet: [[String.raw`\[ \text{bytes} = \text{numel}\times\text{element size}, \qquad Y = XW^\top + \mathbf b, \ W \in \mathbb R^{\text{out}\times\text{in}} \]`, "Section A and B: memory and the Linear layer"], [String.raw`\[ \frac{\partial L}{\partial W_2} = \sum_i g_i\,\mathbf a_i^\top, \qquad \boldsymbol\delta_i = \left(g_iW_2\right)\odot\mathbf 1[\mathbf z_i \gt 0], \qquad \frac{\partial L}{\partial W_1} = \sum_i \boldsymbol\delta_i\mathbf x_i^\top \]`, "the board problem: backward through one ReLU layer"], [String.raw`\[ \bar L = \frac{\sum_b n_b L_b}{\sum_b n_b}, \qquad \text{steps} = \text{epochs}\cdot\left\lceil N/B \right\rceil \]`, "Section C: the epoch loss and the step count"], [String.raw`\[ 16 \ \text{bytes per parameter with Adam}, \qquad \text{steps per epoch} = \left\lceil \frac{\lceil N/B \rceil}{a} \right\rceil \]`, "Section D: memory and Lightning accumulation"], [String.raw`\[ \text{pass} = 6/8 \text{ per section}, \ 26/32 \text{ overall} \]`, "the marks"]],
sources: ["AME 5970 HW4 solutions doc (Parts 1 to 3: indexing a (4, 3, 2) tensor, broadcasting, view after a transpose, from_numpy and clone, Parts 6 and 7: TinyRegressor with 26 parameters, BuggyRegressor), the model for Sections A and B", "AME 5970 HW6 solutions doc (Problem 1: make_loader, sample-weighted epoch loss, validation checkpoints), the model for Section C", "AME 5970 HW8 questions and solutions doc, 2B and 2C (target shape (N, 1), parameter counts, deepcopy checkpoints, fork_rng) and Part 1 (TransformView)", "AME 5970 HW10 questions and solutions doc, Part A (the training loop and run_epoch) and Part B (the MNIST CNN setup)", "AME 5970 Lecture 4 PyTorch and OOP notes and the final practice exams, topic order (the PDFs were not available in this session, so the board problem follows the recurring final topics listed in the course map: a forward pass and MSE by hand, and a two-layer network with ReLU by hand)", "Lessons 21 to 27 of this shelf", "Andrew Ng, Deep Learning Specialization, course 1 weeks 2 to 4 (computation graph, vectorization, forward and backward propagation for a shallow network) and course 2 weeks 1 and 2 (mini-batches, Adam)", "Stanford CS231n notes on backpropagation (local gradients, the ReLU gate)", "PyTorch 2.15 documentation (broadcasting semantics, autograd mechanics, nn.Module, DataLoader and default_collate, serialization with weights_only, automatic mixed precision) and Lightning 2.6 documentation (Trainer, accumulate_grad_batches, num_sanity_val_steps)", "Raschka et al. (2022), Machine Learning with PyTorch and Scikit-Learn, chapters 12 and 13"]
});
})();
