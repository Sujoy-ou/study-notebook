(function () {
/* ML shelf, Part 8, Lesson 43: the Part 8 test. A map, a formula drill, four scored sections of eight questions over Lessons 39 to 42, a nine-part board problem (a one-unit RNN forward and backward through time by hand, clipping and one SGD step, one LSTM step, the forget route, attention over the hidden states, then the same model at real size in PyTorch), a score sheet, and the agent card. The course export has no material on RNNs, LSTMs, attention or transformers, so the question style follows the final practice topics listed in the course map (RNN gradients, gradient clipping, LSTM gates, teacher forcing, choosing nn.LSTM) and the hand calculations of HW8 to HW10. Every number was computed with NumPy and checked with PyTorch 2.15 on the CPU before it was written here. All data and numbers are fresh. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-/g, "−");
const fm = (v, d) => mn(f(v, d));
const g = (v, d) => { const p = Math.pow(10, d == null ? 4 : d), r = Math.round(v * p) / p; return mn(String(r === 0 ? 0 : r)); };
const ex = v => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e <= 4) return fm(v, e >= 2 ? 1 : 4); return mn((v / Math.pow(10, e)).toFixed(2)) + "e" + mn(String(e)); };
const sig = z => 1 / (1 + Math.exp(-z));
const SEC = [["A. Recurrent networks", "Lesson 39", [39]], ["B. LSTM and GRU", "Lesson 40", [40]], ["C. Attention", "Lesson 41", [41]], ["D. Transformers", "Lesson 42", [42]]];
const LESS = { 39: "RNNs", 40: "LSTM and GRU", 41: "Attention", 42: "Transformers" };
const TOPIC = {
  39: ["counting parameters", "two steps by hand", "the batch_first trap", "the shared weight", "vanishing and exploding", "clipping by norm", "exposure bias", "choosing the layer"],
  40: ["the GRU update", "PyTorch's z gate", "the LSTM cell by hand", "the forget bias", "counting parameters", "the state tuple", "bidirectional shapes", "padding and packing"],
  41: ["weights and context", "scaled dot-product", "why the square root", "masking", "counting parameters", "the batch_first trap", "Boolean masks", "memory cost"],
  42: ["heads and shapes", "a block's parameters", "positional encoding", "order without it", "layer norm by hand", "the causal mask", "ViT tokens", "cross-attention"]
};

/* ---------- the board problem: a one-unit RNN without biases, h_t = tanh(w h_{t-1} + u x_t), y_hat = v h_3, L = (y_hat - y)^2 / 2 ---------- */
const R0 = { w: 1.5, u: 0.5, v: 2, x: [-1, 2, 1], y: 0.5 };
const run = P => {
  const z = [], h = [0];
  P.x.forEach(xt => { const zt = P.w * h[h.length - 1] + P.u * xt; z.push(zt); h.push(Math.tanh(zt)); });
  const yh = P.v * h[3], L = 0.5 * (yh - P.y) * (yh - P.y), dyh = yh - P.y, dv = dyh * h[3];
  const dh = [0, 0, 0], dz = [0, 0, 0], cw = [0, 0, 0], cu = [0, 0, 0];
  let d = dyh * P.v, dw = 0, du = 0;
  for (let t = 2; t >= 0; t--) { dh[t] = d; dz[t] = d * (1 - h[t + 1] * h[t + 1]); cw[t] = dz[t] * h[t]; cu[t] = dz[t] * P.x[t]; dw += cw[t]; du += cu[t]; d = dz[t] * P.w; }
  const slope = [1, 2, 3].map(t => 1 - h[t] * h[t]);
  return { z, h: h.slice(1), yh, L, dyh, dv, dh, dz, cw, cu, dw, du, slope, grad: [dw, du, dv] };
};
const norm = v => Math.sqrt(v.reduce((a, b) => a + b * b, 0));
const clip = (gv, c, mode) => { if (mode === "none") return gv.slice(); if (mode === "value") return gv.map(v => Math.max(-c, Math.min(c, v))); const n = norm(gv); return n > c ? gv.map(v => v * c / n) : gv.slice(); };
const step = (P, gv, eta) => ({ w: P.w - eta * gv[0], u: P.u - eta * gv[1], v: P.v - eta * gv[2], x: P.x, y: P.y });
const B0 = run(R0);
const GN = clip(B0.grad, 1, "norm"), GV = clip(B0.grad, 1, "value");
const PN = step(R0, GN, 0.5), PP = step(R0, B0.grad, 0.5), PV = step(R0, GV, 0.5);
const BN = run(PN), BP = run(PP), BV = run(PV);
/* one LSTM step: a0 = 0.5, c0 = 1, x = 1, each gate sees (w_a, w_x, b) */
const LS = { a0: 0.5, c0: 1, x: 1, f: [0, 1, 1], u: [2, -1, 0], c: [1, 0.5, 0], o: [-2, 1, 1] };
const lstm = S => {
  const pre = k => S[k][0] * S.a0 + S[k][1] * S.x + S[k][2];
  const zf = pre("f"), zu = pre("u"), zc = pre("c"), zo = pre("o");
  const Gf = sig(zf), Gu = sig(zu), ct = Math.tanh(zc), Go = sig(zo), c1 = Gu * ct + Gf * S.c0, a1 = Go * Math.tanh(c1);
  return { zf, zu, zc, zo, Gf, Gu, ct, Go, c1, a1, route: Go * (1 - Math.tanh(c1) ** 2) * Gf };
};
const L6 = lstm(LS);
/* attention over the hidden states of part 1, d_k = 1 */
const att = (q, n) => { const hs = B0.h.slice(0, n), s = hs.map(h => q * h), m = Math.max(...s), e = s.map(v => Math.exp(v - m)), S = e.reduce((a, b) => a + b, 0), a = e.map(v => v / S); return { s, a, ctx: a.reduce((t, v, i) => t + v * hs[i], 0) }; };
const A8 = att(2, 3), A8c = att(2, 2);
/* the PyTorch scale-up: nn.LSTM(8, 16, batch_first=True) on (4, 30, 8), Linear on h_n[-1] to 5 classes */
const cnt = (G, nx, H, d) => d * G * H * (nx + H + 2);
ML.L43 = { R0, run, clip, step, B0, BN, BP, BV, LS, lstm, L6, att, A8, A8c, cnt };

const BOARD = [
  { t: "The forward pass", q: String.raw`A one-unit RNN without biases reads \(x = (-1, 2, 1)\) from \(h_0 = 0\) and is scored only at the end: \[ h_t = \tanh(w\,h_{t-1} + u\,x_t), \qquad \hat y = v\,h_3, \qquad L = \tfrac12(\hat y - y)^2 \] with \(w = 1.5\), \(u = 0.5\), \(v = 2\) and target \(y = 0.5\). In PyTorch it is <code>nn.RNN(1, 1, bias=False)</code> and <code>nn.Linear(1, 1, bias=False)</code>, 3 parameters. Compute every \(z_t\) and \(h_t\), then \(\hat y\) and \(L\). The slider shows one step at a time.`,
    a: String.raw`\(z_1 = 0.5\cdot(-1) = -0.5\) and \(h_1 = \tanh(-0.5) = -0.4621\). Then \(z_2 = 1.5\cdot(-0.4621) + 0.5\cdot 2 = 0.3068\) and \(h_2 = 0.2975\). Then \(z_3 = 1.5\cdot 0.2975 + 0.5\cdot 1 = 0.9463\) and \(h_3 = 0.7381\). The readout is \(\hat y = 2\cdot 0.7381 = 1.4762\) and \(L = \tfrac12(0.9762)^2 = 0.4765\). The same \(w\) and \(u\) are used at every step, which is why the model has 3 parameters for any length.` },
  { t: "Back to the output weight and the last state", q: String.raw`Find \(\partial L/\partial\hat y\), \(\partial L/\partial v\) and \(\partial L/\partial h_3\).`,
    a: String.raw`\(\partial L/\partial\hat y = \hat y - y = 0.9762\). The output weight multiplies \(h_3\), so \(\partial L/\partial v = 0.9762\cdot 0.7381 = 0.7206\). The last state is multiplied by \(v\), so \(\partial L/\partial h_3 = 0.9762\cdot 2 = 1.9524\). Only \(h_3\) feeds the loss directly. The earlier states get their gradient through \(h_3\) in the next part.` },
  { t: "Back through time to w and u", q: String.raw`Walk the gradient back from \(h_3\) to \(h_1\). At each step find \(\partial L/\partial z_t\), then add up the contributions to \(\partial L/\partial w\) and \(\partial L/\partial u\).`,
    a: String.raw`Multiply by the tanh slope \(1 - h_t^2\) to reach \(z_t\), and by \(w\) to move one step back: \(\partial L/\partial z_3 = 1.9524\cdot 0.4552 = 0.8887\), \(\partial L/\partial h_2 = 0.8887\cdot 1.5 = 1.3331\), \(\partial L/\partial z_2 = 1.3331\cdot 0.9115 = 1.2151\), \(\partial L/\partial h_1 = 1.8226\), \(\partial L/\partial z_1 = 1.8226\cdot 0.7864 = 1.4334\). The shared weights collect one term per step, \(\partial L/\partial z_t\) times what the weight multiplied: \[ \frac{\partial L}{\partial w} = 0.8887\cdot 0.2975 + 1.2151\cdot(-0.4621) + 1.4334\cdot 0 = -0.2971 \] \[ \frac{\partial L}{\partial u} = 0.8887\cdot 1 + 1.2151\cdot 2 + 1.4334\cdot(-1) = 1.8855 \] The step-1 term of \(w\) is 0 because \(h_0 = 0\).` },
  { t: "How the gradient fades or grows", q: String.raw`Write \(\partial h_3/\partial h_1\) as a product of per-step factors and evaluate it. Then say what a factor of 0.6828 per step does over 50 steps, and what \(\lvert w\rvert^{50}\) does when tanh stays in its linear part.`,
    a: String.raw`One step back multiplies by \(w\,(1 - h_t^2)\): \(1.5\cdot 0.4552 = 0.6828\) from \(h_3\) to \(h_2\) and \(1.5\cdot 0.9115 = 1.3672\) from \(h_2\) to \(h_1\), so \(\partial h_3/\partial h_1 = 0.9335\). Over 50 steps a factor of 0.6828 gives \(0.6828^{50} \approx 5.2\times 10^{-9}\): the first inputs stop reaching the gradient. With small states the slope stays near 1 and the factor is close to \(w = 1.5\), and \(1.5^{50} \approx 6.4\times 10^{8}\): the gradient explodes. Since \(\lvert\tanh'\rvert \le 1\), \(\lvert\partial h_T/\partial h_0\rvert \le \lvert w\rvert^T\), so \(\lvert w\rvert \lt 1\) always vanishes, and \(\lvert w\rvert \gt 1\) can explode.` },
  { t: "Clip, then step", q: String.raw`The gradient is \(\mathbf g = (\partial L/\partial w, \partial L/\partial u, \partial L/\partial v)\). Clip it by norm at 1, as <code>clip_grad_norm_(params, 1.0)</code> does, and take one SGD step with learning rate 0.5. Compare the new loss with a step that is not clipped and with clipping each component at 1.`,
    a: String.raw`\(\mathbf g = (-0.2971, 1.8855, 0.7206)\) and \(\lVert\mathbf g\rVert = 2.0402 \gt 1\), so every component is multiplied by \(1/2.0402 = 0.4901\): \(\mathbf g = (-0.1456, 0.9242, 0.3532)\), same direction, length 1. The step gives \(w = 1.5728\), \(u = 0.0379\), \(v = 1.8234\), the states shrink to \((-0.0379, 0.0162, 0.0634)\), \(\hat y = 0.1155\) and the loss falls from 0.4765 to 0.0739. Without clipping the step lands at \(u = -0.4428\) and the loss rises to 1.2149. Clipping by value at 1 changes only \(u\), to exactly 0, which turns the direction: every state becomes 0 and the loss is 0.125.` },
  { t: "One LSTM step by hand", q: String.raw`A one-unit LSTM holds \(a^{\langle 0\rangle} = 0.5\) and \(c^{\langle 0\rangle} = 1\) and reads \(x = 1\). Each gate is \(\sigma(w_a a^{\langle 0\rangle} + w_x x + b)\) and the candidate uses tanh, with \((w_a, w_x, b)\) equal to \((0, 1, 1)\) for forget, \((2, -1, 0)\) for update, \((1, 0.5, 0)\) for the candidate and \((-2, 1, 1)\) for output. Find the gates, \(c^{\langle 1\rangle}\) and \(a^{\langle 1\rangle}\).`,
    a: String.raw`The pre-activations are 2, 0, 1 and 1. So \(\Gamma_f = \sigma(2) = 0.8808\), \(\Gamma_u = \sigma(0) = 0.5\), \(\tilde c = \tanh 1 = 0.7616\) and \(\Gamma_o = \sigma(1) = 0.7311\). The cell keeps most of its old value and adds half the candidate: \(c^{\langle 1\rangle} = 0.5\cdot 0.7616 + 0.8808\cdot 1 = 1.2616\). The hidden state is \(a^{\langle 1\rangle} = 0.7311\cdot\tanh 1.2616 = 0.7311\cdot 0.8515 = 0.6225\). In PyTorch, <code>nn.LSTM(1, 1)</code> stacks the gates in the order i, f, g, o, so <code>weight_ih_l0</code> is \((-1, 1, 0.5, 1)\), <code>weight_hh_l0</code> is \((2, 0, 1, -2)\), <code>bias_ih_l0</code> is \((0, 1, 0, 1)\) with <code>bias_hh_l0</code> zero, and it returns the same 0.6225 and 1.2616.` },
  { t: "The cell highway", q: String.raw`Along the direct route \(c^{\langle 0\rangle} \to c^{\langle 1\rangle}\), what is the derivative? What does the same forget gate give over 30 steps, what does a forget pre-activation of 4 give, and how does that compare with the RNN factor 0.6828 of part 4?`,
    a: String.raw`The cell update adds \(\Gamma_f\,c^{\langle 0\rangle}\), so the direct derivative is \(\Gamma_f = 0.8808\), with no tanh slope and no weight matrix in the way. Over 30 steps with the same gate, \(0.8808^{30} = 0.0222\). With a forget pre-activation of 4, \(\sigma(4)^{30} = 0.9820^{30} = 0.5801\). The RNN of part 4 gives \(0.6828^{30} = 1.07\times 10^{-5}\). This is why Lesson 40 set the forget bias: the cell can only carry a gradient far if its forget gate starts near 1. To reach \(a^{\langle 1\rangle}\) the route also passes the output gate and a tanh: \(\Gamma_o\,(1 - \tanh^2 c^{\langle 1\rangle})\,\Gamma_f = 0.1770\).` },
  { t: "Attention over the hidden states", q: String.raw`A decoder holds the query \(q = 2\) and reads the three hidden states of part 1 as keys and values, with \(d_k = 1\). Find the scores, the weights and the context. Then mask key 3, as a causal mask would at step 2.`,
    a: String.raw`The scores are \(q\,h_t/\sqrt 1 = (-0.9242, 0.5951, 1.4762)\). The softmax gives \(\alpha = (0.0603, 0.2753, 0.6645)\) and the context is \(\sum_t \alpha_t h_t = 0.5445\), pulled toward \(h_3\), the state most aligned with the query. Masking key 3 with \(-\infty\) before the softmax leaves \(\alpha = (0.1796, 0.8204, 0)\) and the context 0.1611. Setting its score to 0 instead would still give it weight, and zeroing its weight after the softmax would leave weights that do not sum to 1.` },
  { t: "Scale it up in PyTorch", q: String.raw`A sensor classifier reads 30 readings of 8 channels and picks one of 5 classes: <code>nn.LSTM(8, 16, batch_first=True)</code>, then <code>nn.Linear(16, 5)</code> on <code>h_n[-1]</code>. For a batch of 4, give every shape and the parameter counts, the loss and its target, the counts for a GRU and a plain RNN, and what changes with <code>bidirectional=True</code>.`,
    a: String.raw`The input is (4, 30, 8). <code>out</code> is (4, 30, 16), <code>h_n</code> and <code>c_n</code> are (1, 4, 16), <code>h_n[-1]</code> is (4, 16) and the logits are (4, 5). Train with <code>CrossEntropyLoss</code> and a long target of shape (4,). The LSTM has \(4\cdot 16\,(8 + 16 + 2) = 1{,}664\) parameters and the head 85, so 1,749 in all. A GRU has \(3\cdot 16\cdot 26 = 1{,}248\) and a plain RNN 416. Bidirectional doubles the LSTM to 3,328, makes <code>out</code> (4, 30, 32) and <code>h_n</code> (2, 4, 16), and the head becomes <code>nn.Linear(32, 5)</code> on the two final states joined, 165 parameters. A classifier needs no teacher forcing. A forecaster that feeds its own outputs back does, and then it faces exposure bias.` }
];

/* ---------- the formula drill ---------- */
const FORM = [
  [39, "The RNN cell and its readout", String.raw`a^{\langle t \rangle} = \tanh\big(W_{aa} a^{\langle t-1 \rangle} + W_{ax} x^{\langle t \rangle} + b_a\big)`, String.raw`\hat y^{\langle t \rangle} = W_{ya} a^{\langle t \rangle} + b_y`],
  [39, "Parameters of one nn.RNN layer", String.raw`n_a\,(n_x + n_a + 2)`],
  [39, "Backpropagation through time, one unit", String.raw`\frac{\partial L}{\partial h_{t-1}} = \frac{\partial L}{\partial h_t}\,(1 - h_t^2)\,w`, String.raw`\frac{\partial L}{\partial w} = \sum_t \frac{\partial L}{\partial z_t}\,h_{t-1}`],
  [39, "Clipping by norm", String.raw`\mathbf g \leftarrow \mathbf g\,\frac{c}{\lVert\mathbf g\rVert} \quad \text{if } \lVert\mathbf g\rVert \gt c`],
  [40, "The GRU, Ng's notation", String.raw`\tilde c^{\langle t \rangle} = \tanh\big(W_c [\Gamma_r * c^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_c\big)`, String.raw`c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + (1 - \Gamma_u) * c^{\langle t-1 \rangle}`],
  [40, "The LSTM cell and hidden state", String.raw`c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + \Gamma_f * c^{\langle t-1 \rangle}`, String.raw`a^{\langle t \rangle} = \Gamma_o * \tanh c^{\langle t \rangle}`],
  [40, "The forget route", String.raw`\frac{\partial c^{\langle T \rangle}}{\partial c^{\langle 0 \rangle}}\Big|_{\text{direct}} = \prod_t \Gamma_f^{\langle t \rangle} \approx \sigma(b_f)^T`],
  [40, "Parameters of nn.LSTM and nn.GRU", String.raw`4H\,(n_x + H + 2), \qquad 3H\,(n_x + H + 2)`],
  [41, "Ng's attention weights and context", String.raw`\alpha^{\langle t, t' \rangle} = \frac{\exp(e^{\langle t, t' \rangle})}{\sum_{t''} \exp(e^{\langle t, t'' \rangle})}`, String.raw`c^{\langle t \rangle} = \sum_{t'} \alpha^{\langle t, t' \rangle} a^{\langle t' \rangle}`],
  [41, "Scaled dot-product attention", String.raw`\text{Attention}(Q, K, V) = \text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big) V`],
  [41, "Masking", String.raw`\alpha = \text{softmax}(\mathbf s + \mathbf m), \qquad m_j \in \{0, -\infty\}`],
  [41, "Parameters of nn.MultiheadAttention", String.raw`4d^2 + 4d`],
  [42, "Multi-head attention", String.raw`\text{head}_i = \text{softmax}\Big(\frac{Q_i K_i^\top}{\sqrt{d_k}}\Big) V_i`, String.raw`\text{MultiHead} = [\text{head}_1, \dots, \text{head}_h]\, W^O, \qquad d_k = d/h`],
  [42, "Sinusoidal positional encoding", String.raw`PE_{(pos, 2i)} = \sin\big(pos / 10000^{2i/d}\big)`, String.raw`PE_{(pos, 2i+1)} = \cos\big(pos / 10000^{2i/d}\big)`],
  [42, "Post-norm and pre-norm blocks", String.raw`H = \text{LN}\big(X + \text{MHA}(X)\big), \qquad Y = \text{LN}\big(H + \text{FFN}(H)\big)`, String.raw`x \leftarrow x + \text{MHA}(\text{LN}(x)), \qquad x \leftarrow x + \text{FFN}(\text{LN}(x))`]
];
ML.L43.BOARD = BOARD; ML.L43.FORM = FORM;

/* ---------- board pictures ---------- */
const XS = [170, 310, 450];
const rnnFig = (k, o) => {
  /* the unrolled RNN of parts 1 to 4. o.show = steps revealed in part 1, o.back = first step reached in part 3 */
  const B = B0, H = 300;
  let s = "";
  const showF = t => k > 0 || t < o.show;
  const ink = "var(--p)";
  s += `<circle cx="50" cy="150" r="24" fill="var(--sunk)" stroke="var(--line)"/>` + tx(50, 146, "h₀", "middle", "t") + tx(50, 162, "0", "middle");
  XS.forEach((x, t) => {
    const on = showF(t);
    s += `<rect x="${x - 26}" y="236" width="52" height="30" rx="6" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x, 256, `x${"₁₂₃"[t]} = ${mn(R0.x[t])}`, "middle");
    s += arrow(x, 234, x, 180, ink, 1.3) + tx(x - 8, 214, "u", "end");
    const px = t === 0 ? 76 : XS[t - 1] + 26;
    s += arrow(px, 150, x - 28, 150, ink, 1.3);
    const fac = k === 3 ? `× ${f(R0.w * B.slope[t], 4)}` : "w";
    s += tx((px + x - 28) / 2, 142, fac, "middle", k === 3 ? "t" : "ts");
    const hl = k === 0 && t === o.show - 1;
    s += `<circle cx="${x}" cy="150" r="28" fill="${hl ? "var(--teal-bg)" : on ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${hl ? C.teal : on ? "var(--accent)" : "var(--line)"}" stroke-width="${hl ? 2 : 1}"/>`;
    s += tx(x, 146, `h${"₁₂₃"[t]}`, "middle", "t") + tx(x, 163, on ? fm(B.h[t]) : "?", "middle");
    s += tx(x + 8, 202, on ? `z = ${fm(B.z[t])}` : "", null);
    if (k === 2 && t >= o.back) {
      s += `<text class="ts" x="${x}" y="104" text-anchor="middle" style="fill:${C.coral}">∂L/∂h = ${fm(B.dh[t])}</text>`;
      s += `<text class="ts" x="${x}" y="88" text-anchor="middle" style="fill:${C.coral}">∂L/∂z = ${fm(B.dz[t])}</text>`;
      s += `<text class="ts" x="${x}" y="72" text-anchor="middle" style="fill:${C.coral}">slope ${f(B.slope[t])}</text>`;
    }
  });
  const yOn = k > 0 || o.show === 3;
  s += arrow(476, 150, 548, 150, ink, 1.3) + tx(512, 142, "v", "middle");
  s += `<rect x="550" y="128" width="110" height="44" rx="8" fill="${yOn ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${yOn ? "var(--accent)" : "var(--line)"}"/>` + tx(605, 146, "ŷ = v h₃", "middle", "t") + tx(605, 164, yOn ? fm(B.yh) : "?", "middle");
  s += arrow(605, 126, 605, 74, ink, 1.3);
  s += `<rect x="550" y="30" width="110" height="42" rx="8" fill="${yOn ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${yOn ? "var(--accent)" : "var(--line)"}"/>` + tx(605, 48, "L, y = 0.5", "middle", "t") + tx(605, 64, yOn ? fm(B.L) : "?", "middle");
  if (k >= 1 && k <= 2) {
    s += `<text class="ts" x="555" y="196" style="fill:${C.coral}">∂L/∂ŷ = ${fm(B.dyh)}</text><text class="ts" x="555" y="214" style="fill:${C.coral}">∂L/∂v = ${fm(B.dv)}</text>`;
    if (k === 1) s += `<text class="ts" x="450" y="104" text-anchor="middle" style="fill:${C.coral}">∂L/∂h₃ = ${fm(B.dh[2])}</text>`;
  }
  let foot = "";
  if (k === 0) foot = o.show === 3 ? `ŷ = 2 · ${fm(B.h[2])} = ${fm(B.yh)}, L = ½(${fm(B.dyh)})² = ${fm(B.L)}` : `step ${o.show}: z = ${o.show === 1 ? "0" : "1.5 · " + fm(B.h[o.show - 2])} + 0.5 · ${mn(R0.x[o.show - 1])} = ${fm(B.z[o.show - 1])}, h = tanh z = ${fm(B.h[o.show - 1])}`;
  if (k === 1) foot = "Only h₃ touches the loss. The earlier states are reached through it.";
  if (k === 2) {
    const ts = [2, 1, 0].filter(t => t >= o.back);
    const sw = ts.reduce((a, t) => a + B.cw[t], 0), su = ts.reduce((a, t) => a + B.cu[t], 0);
    foot = `terms so far: ∂L/∂w = ${ts.map(t => fm(B.cw[t])).join(" + ")} = ${fm(sw)},   ∂L/∂u = ${ts.map(t => fm(B.cu[t])).join(" + ")} = ${fm(su)}`;
  }
  if (k === 3) foot = `∂h₃/∂h₁ = ${f(R0.w * B.slope[2])} × ${f(R0.w * B.slope[1])} = ${f(R0.w * R0.w * B.slope[2] * B.slope[1])}. Each factor is w(1 − h²).`;
  s += tx(24, 292, foot.replace(/\+ −/g, "− "), null, "t");
  return svg(H, s);
};
const fadeFig = fac => {
  const a = ML.axes(80, 20, 520, 200, { xmin: 0, xmax: 50, ymin: -12, ymax: 12, nx: 5, ny: 6, fx: v => v, fy: v => "1e" + mn(v), xl: "steps back T", yl: "factor^T (log scale)" });
  let s = a.s;
  const line = (r, col, dash) => ML.path(Array.from({ length: 51 }, (_, T) => [a.X(T), a.Y(Math.max(-12, Math.min(12, T * Math.log10(r))))]), col, 2, dash);
  s += `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(50)}" y2="${a.Y(0)}" stroke="var(--p)" stroke-dasharray="4 3"/>`;
  s += line(0.6828, C.coral) + line(1.5, C.purple) + line(fac, C.teal);
  s += tx(a.X(50) - 4, a.Y(50 * Math.log10(0.6828)) - 8, "0.6828", "end") + tx(a.X(50) - 4, a.Y(50 * Math.log10(1.5)) - 8, "w = 1.5", "end") + `<text class="ts" x="${a.X(25)}" y="${a.Y(Math.max(-12, Math.min(12, 25 * Math.log10(fac)))) + 16}" text-anchor="middle" style="fill:${C.teal}">slider ${f(fac, 2)}</text>`;
  return svg(260, s);
};
const clipFig = (c, mode) => {
  const gc = clip(B0.grad, c, mode), P = step(R0, gc, 0.5), R = run(P);
  const a = ML.axes(80, 24, 300, 200, { xmin: 0, xmax: 3, ymin: -1, ymax: 2, nx: 3, ny: 3, fx: () => "", fy: v => g(v), yl: "gradient component", grid: true });
  let s = a.s;
  ["∂L/∂w", "∂L/∂u", "∂L/∂v"].forEach((nm, i) => {
    const bar = (v, dx, col, op) => { const y0 = a.Y(0), y1 = a.Y(Math.max(-1, Math.min(2, v))); return `<rect x="${a.X(i + dx)}" y="${Math.min(y0, y1)}" width="${a.X(0.32) - a.X(0)}" height="${Math.abs(y1 - y0)}" fill="${col}" opacity="${op}" rx="3"/>`; };
    s += bar(B0.grad[i], 0.14, C.gray, 0.55) + bar(gc[i], 0.52, C.teal, 0.9) + tx(a.X(i + 0.5), a.Y(-1) + 16, nm, "middle");
  });
  s += `<line x1="${a.X(0)}" y1="${a.Y(0)}" x2="${a.X(3)}" y2="${a.Y(0)}" stroke="var(--p)"/>`;
  s += `<rect x="410" y="34" width="12" height="12" fill="${C.gray}" opacity="0.55"/>` + tx(428, 44, "raw gradient") + `<rect x="410" y="54" width="12" height="12" fill="${C.teal}"/>` + tx(428, 64, mode === "none" ? "no clipping" : `clipped by ${mode} at ${g(c, 2)}`);
  s += tx(410, 100, `‖g‖ = ${f(norm(B0.grad))} → ${f(norm(gc))}`, null, "t") + tx(410, 124, `after one step at 0.5:`, null) + tx(410, 146, `w ${fm(P.w)}, u ${fm(P.u)}, v ${fm(P.v)}`, null) + tx(410, 172, `loss ${fm(B0.L)} → ${fm(R.L)}`, null, "th");
  const cos = gc.reduce((t, v, i) => t + v * B0.grad[i], 0) / (norm(gc) * norm(B0.grad) || 1);
  s += tx(410, 198, `angle to the raw gradient ${f(Math.acos(Math.min(1, cos)) * 180 / Math.PI, 1)}°`, null);
  return { s: svg(260, s), R, P, gc };
};
const lstmFig = (k, S) => {
  const L = lstm(S);
  let s = "";
  /* the cell line along the top, the gates below */
  s += tx(30, 64, "c⁽⁰⁾", null, "t") + tx(30, 82, fm(S.c0), null);
  s += arrow(66, 70, 168, 70, k === 6 ? C.teal : "var(--p)", k === 6 ? 3 : 1.4);
  s += `<circle cx="190" cy="70" r="18" fill="var(--sunk)" stroke="var(--line)"/>` + tx(190, 75, "×", "middle", "t");
  s += arrow(212, 70, 318, 70, k === 6 ? C.teal : "var(--p)", k === 6 ? 3 : 1.4);
  s += `<circle cx="340" cy="70" r="18" fill="var(--sunk)" stroke="var(--line)"/>` + tx(340, 75, "+", "middle", "t");
  s += arrow(362, 70, 560, 70, k === 6 ? C.teal : "var(--p)", k === 6 ? 3 : 1.4);
  s += tx(570, 64, "c⁽¹⁾", null, "t") + tx(570, 82, fm(L.c1), null, "t");
  const gate = (x, y, nm, val, pre, col) => `<rect x="${x - 46}" y="${y - 22}" width="92" height="44" rx="8" fill="var(--accent-bg)" stroke="${col || "var(--accent)"}"/>` + tx(x, y - 4, nm, "middle", "t") + tx(x, y + 13, `${val}  (z ${g(pre)})`, "middle");
  s += gate(190, 170, "Γf = σ", f(L.Gf), L.zf, k === 6 ? C.teal : null) + arrow(190, 148, 190, 90, "var(--p)", 1.2);
  s += gate(300, 170, "Γu = σ", f(L.Gu), L.zu) + gate(400, 170, "c̃ = tanh", f(L.ct), L.zc);
  s += `<circle cx="340" cy="120" r="14" fill="var(--sunk)" stroke="var(--line)"/>` + tx(340, 125, "×", "middle", "t") + arrow(300, 148, 332, 132, "var(--p)", 1.2) + arrow(400, 148, 350, 132, "var(--p)", 1.2) + arrow(340, 106, 340, 90, "var(--p)", 1.2);
  s += tx(352, 112, `${f(L.Gu * L.ct)}`, null);
  s += `<rect x="470" y="96" width="70" height="30" rx="6" fill="var(--sunk)" stroke="var(--line)"/>` + tx(505, 116, "tanh", "middle") + arrow(505, 72, 505, 94, "var(--p)", 1.2);
  s += gate(600, 170, "Γo = σ", f(L.Go), L.zo);
  s += `<circle cx="560" cy="226" r="14" fill="var(--sunk)" stroke="var(--line)"/>` + tx(560, 231, "×", "middle", "t") + arrow(505, 128, 552, 214, "var(--p)", 1.2) + arrow(596, 194, 570, 214, "var(--p)", 1.2);
  s += arrow(560, 242, 560, 262, "var(--p)", 1.2) + tx(560, 278, `a⁽¹⁾ = ${fm(L.a1)}`, "middle", "th");
  s += tx(30, 216, `a⁽⁰⁾ = ${g(S.a0)}, x = ${g(S.x)}`, null, "t") + tx(30, 236, "feed every gate", null);
  s += tx(30, 278, k === 6 ? `direct route: ∂c⁽¹⁾/∂c⁽⁰⁾ = Γf = ${f(L.Gf)}` : `c⁽¹⁾ = ${f(L.Gu)} · ${f(L.ct)} + ${f(L.Gf)} · ${g(S.c0)} = ${f(L.c1)}`, null, "t");
  return svg(296, s);
};
const routeFig = (zf, T) => {
  const a = ML.axes(80, 20, 520, 190, { xmin: 0, xmax: 60, ymin: -8, ymax: 0, nx: 6, ny: 4, fx: v => v, fy: v => "1e" + mn(v), xl: "steps T", yl: "gradient kept (log scale)" });
  let s = a.s;
  const line = (r, col) => ML.path(Array.from({ length: 61 }, (_, t) => [a.X(t), a.Y(Math.max(-8, t * Math.log10(r)))]), col, 2);
  s += line(sig(zf), C.teal) + line(0.6828, C.coral) + line(sig(2), C.gray);
  s += `<line x1="${a.X(T)}" y1="${a.Y(0)}" x2="${a.X(T)}" y2="${a.Y(-8)}" stroke="var(--p)" stroke-dasharray="4 3"/>`;
  s += tx(a.X(60) - 4, a.Y(Math.max(-8, 60 * Math.log10(0.6828))) - 6, "RNN 0.6828", "end") + tx(a.X(60) - 4, a.Y(60 * Math.log10(sig(2))) + 14, "σ(2)", "end") + `<text class="ts" x="${a.X(20)}" y="${a.Y(Math.max(-8, 20 * Math.log10(sig(zf)))) - 8}" text-anchor="middle" style="fill:${C.teal}">σ(${g(zf, 1)}) = ${f(sig(zf))}</text>`;
  return svg(250, s);
};
const attFig = (q, causal) => {
  const n = causal ? 2 : 3, A = att(q, n);
  let s = "";
  s += tx(30, 30, `query q = ${g(q, 2)}, keys and values h = (${B0.h.map(v => fm(v)).join(", ")})`, null, "t");
  [0, 1, 2].forEach(t => {
    const y = 60 + t * 62, on = t < n, sc = q * B0.h[t], w = on ? A.a[t] : 0;
    s += `<circle cx="70" cy="${y + 18}" r="27" fill="${on ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${on ? "var(--accent)" : "var(--line)"}" opacity="${on ? 1 : 0.5}"/>` + tx(70, y + 15, `h${"₁₂₃"[t]}`, "middle", "t") + tx(70, y + 31, fm(B0.h[t]), "middle");
    s += tx(112, y + 22, on ? `score ${fm(sc)}` : "score −∞ (masked)", null);
    s += `<rect x="250" y="${y + 6}" width="300" height="24" rx="5" fill="var(--sunk)" stroke="var(--line)"/><rect x="250" y="${y + 6}" width="${300 * w}" height="24" rx="5" fill="${C.teal}" opacity="0.85"/>` + tx(560, y + 23, `α = ${f(w)}`, null, "t");
  });
  s += tx(30, 270, `context = Σ α h = ${fm(A.ctx)}`, null, "th");
  return svg(290, s);
};
const shapeFig = (G, bi) => {
  const d = bi ? 2 : 1, H = 16, nm = { 4: "nn.LSTM", 3: "nn.GRU", 1: "nn.RNN" }[G], pc = cnt(G, 8, H, d), hd = d * H * 5 + 5;
  const box = (x, y, w, t1, t2, hl) => `<rect x="${x}" y="${y}" width="${w}" height="46" rx="8" fill="${hl ? "var(--teal-bg)" : "var(--accent-bg)"}" stroke="${hl ? C.teal : "var(--accent)"}"/>` + tx(x + w / 2, y + 19, t1, "middle", "t") + tx(x + w / 2, y + 36, t2, "middle");
  let s = "";
  s += box(20, 40, 130, "x", "(4, 30, 8)") + arrow(152, 63, 196, 63, "var(--p)", 1.3);
  s += box(198, 40, 200, `${nm}(8, 16${bi ? ", bidir." : ""})`, `${pc.toLocaleString("en-US")} parameters`, true);
  s += arrow(400, 63, 444, 63, "var(--p)", 1.3) + box(446, 20, 210, "out", `(4, 30, ${d * H})`);
  s += box(446, 76, 210, G === 4 ? "h_n and c_n" : "h_n", `(${d}, 4, 16)`);
  s += arrow(551, 124, 551, 158, "var(--p)", 1.3) + box(436, 160, 230, bi ? "cat(h_n[-2], h_n[-1])" : "h_n[-1]", `(4, ${d * H})`);
  s += arrow(551, 208, 551, 232, "var(--p)", 1.3) + box(436, 234, 230, `nn.Linear(${d * H}, 5)`, `${hd} parameters → logits (4, 5)`, true);
  s += tx(20, 150, "parameters", null, "th") + tx(20, 174, `${nm}: ${d} × ${G} × 16 × (8 + 16 + 2) = ${pc.toLocaleString("en-US")}`, null, "t") + tx(20, 196, `head: ${d * H} × 5 + 5 = ${hd}`, null) + tx(20, 218, `total ${(pc + hd).toLocaleString("en-US")}`, null, "t");
  s += tx(20, 254, "loss: CrossEntropyLoss, target (4,) long", null) + tx(20, 274, "flattened instead: Linear(240, 16) = 3,856,", null) + tx(20, 292, "and it only accepts length 30", null);
  return svg(304, s);
};

addLesson("ml", "seq", {
level: "Core", num: "Lesson 43",
id: "ml-seq-l43", title: "Part 8 test", short: "43. Part 8 test",
big: String.raw`Thirty-two scored questions over Part 8, in four sections of eight, plus a board problem in the final exam style. Section A is recurrent networks, Section B LSTM and GRU, Section C attention and Section D transformers. Each section is its own card with its own score, so you can retake the weak one without redoing the rest. Most questions ask for a number you can get on paper: a hidden state, a gradient through time, a clipped vector, a gate, an attention weight, a parameter count or a shape. The others show a few lines of PyTorch and ask what is wrong, because sequence models fail silently more often than any other layer on the shelf. Before the sections there is a formula drill. After them comes a nine-part board problem that runs a one-unit RNN forward and backward through time by hand, clips and steps, takes one LSTM step, follows the cell highway, attends over the hidden states and then sizes the same model in PyTorch, and a score sheet that tells you which lessons to reopen.`,
bridge: String.raw`Part 8 fed sequences to the networks of Parts 6 and 7. Lesson 39 built the recurrent network and its gradient through time, Lesson 40 added the gates of the LSTM and the GRU, Lesson 41 replaced the single summary vector with attention, and Lesson 42 built the transformer from attention alone. The practice finals ask about RNN gradients, clipping, LSTM gates, teacher forcing and choosing nn.LSTM on every paper, which is what Sections A and B and the board problem drill. Part 9 turns to the project.`,
labels: { note: "Exam and project note" },
cards: [

{s: "0. Map", t: "What the four sections cover",
intu: String.raw`Click a section to see which lesson it draws on and the topics its questions touch. Take the formula drill first if Part 8 is more than a few days behind you, then the sections in order. Each section is scored out of 8 and is passed at 6. The whole test at 26 or above means Part 8 is done. The board problem is not scored. Work it on paper with the solution hidden, then compare line by line.`,
eq: String.raw`\[ 4 \text{ sections} \times 8 \text{ questions} = 32, \qquad \text{pass: } 6 \text{ per section}, \ 26 \text{ overall} \]`,
sym: [["section A", "the RNN cell, its parameters and shapes, backpropagation through time, vanishing and exploding, clipping, teacher forcing, choosing the layer"], ["section B", "the GRU and LSTM by hand, PyTorch's gate conventions, the forget bias, counts, the state tuple, bidirectional shapes, padding"], ["section C", "Ng's attention, scaled dot-product attention, the square root, masks, nn.MultiheadAttention and its traps, memory"], ["section D", "heads and shapes, block parameters, positional encoding, layer norm, the causal mask, BERT, GPT and ViT, cross-attention"], ["board problem", "an RNN, an LSTM step and attention by hand, nine parts, worked solutions"]],
how: ["Do the formula drill.", "Take A, B, C, D in order, with paper, a calculator and no computer.", "Work out the number before you read the options.", "Work the board problem with each solution hidden.", "Enter your four scores on the score sheet and reopen what it names."],
say: String.raw`Four sections of eight questions over Lessons 39 to 42, pass at six per section and twenty-six overall, plus an unscored board problem with worked solutions.`,
num: String.raw`<b>32</b> scored questions, about <b>50 minutes</b> on a first pass, and about <b>40 minutes</b> for the board problem.`,
note: String.raw`The practice finals ask for the same five things every time: why RNN gradients vanish or explode, what gradient clipping does, what each LSTM gate does, what teacher forcing and exposure bias are, and when to choose nn.LSTM over nn.Linear or nn.Conv2d. Section A, Section B and the board problem cover all five.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns(SEC.map((s, i) => [i, s[0].slice(0, 1)]), "k") + `<div id="l43mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    const lessons = [39, 40, 41, 42];
    lessons.forEach((L, i) => {
      const x = 20 + i * 162, on = SEC[k][2].includes(L);
      s += `<rect x="${x}" y="24" width="152" height="58" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 76, 48, "Lesson " + L, "middle", "th") + tx(x + 76, 70, LESS[L], "middle");
    });
    SEC.forEach((sc, i) => {
      const x = 20 + i * 162, on = i === k;
      s += `<rect x="${x}" y="128" width="152" height="50" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 76, 148, sc[0].split(".")[0] + ". 8 questions", "middle", "th") + tx(x + 76, 166, sc[1], "middle");
      if (on) s += `<line x1="${x + 76}" y1="84" x2="${x + 76}" y2="126" stroke="${C.teal}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
    });
    const tops = SEC[k][2].flatMap(L => TOPIC[L]);
    tops.forEach((t, i) => { const col = i % 4, rowi = Math.floor(i / 4), x = 20 + col * 162, y = 206 + rowi * 30; s += `<rect x="${x}" y="${y}" width="152" height="24" rx="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x + 76, y + 16, t, "middle"); });
    fig.innerHTML = svg(206 + Math.ceil(tops.length / 4) * 30 + 8, s);
    $("l43mx").innerHTML = `<p class="note"><b>${SEC[k][0]}</b> draws on Lesson ${SEC[k][2][0]} (${LESS[SEC[k][2][0]]}). The grey chips are the topics its eight questions touch, one chip per question.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "1. Formula drill", t: "Fifteen formulas to write from memory before the test",
intu: String.raw`Part 8 rests on a short list of formulas: the RNN cell, its parameter count, one step of backpropagation through time and the clipping rule, the GRU and LSTM updates with the forget route and their counts, Ng's attention, scaled dot-product attention, the mask and the count of nn.MultiheadAttention, then multi-head attention, the positional code and the two block layouts. The drill shows the name of one, you write it on paper, then reveal it and mark yourself honestly. The bar chart counts what you knew per lesson. Run it until every bar is full, then start Section A.`,
eq: String.raw`\[ \text{15 formulas from Lessons 39 to 42} \]`,
sym: [["name", "what you are asked to write"], ["reveal", "shows the formula as the lesson wrote it"], ["I knew it", "counts toward that lesson's bar"], ["not yet", "keeps the item in the next round"]],
how: ["Read the name.", "Write the formula on paper.", "Reveal and compare every gate, every sum and every square root.", "Mark yourself and go on.", "Start a new round with only the misses."],
say: String.raw`The drill checks that the RNN cell, backpropagation through time, clipping, the GRU and LSTM updates, the forget route, the parameter counts, both kinds of attention, the mask, multi-head attention, the positional code and the transformer block can be written from memory.`,
num: String.raw`<b>15</b> items, <b>4</b> each from Lessons 39, 40 and 41 and <b>3</b> from Lesson 42.`,
note: String.raw`Two lost marks repeat in sequence questions: writing the GRU update with the two weights swapped, so that the new candidate gets 1 − Γu, and forgetting the square root in the attention scale. Check both every time.`,
r(fig, ctl) {
  let order = FORM.map((_, i) => i), pos = 0, shown = false;
  const known = new Set(), round = { n: 1 };
  ctl.innerHTML = `<div class="row"><button id="l43fs" class="on">Reveal</button><button id="l43fk">I knew it</button><button id="l43fn">Not yet</button><button id="l43fr">New round with misses</button><button id="l43fa">Start over</button></div><div id="l43fo"></div>`;
  const u = () => {
    const done = pos >= order.length;
    let s = "";
    [39, 40, 41, 42].forEach((L, i) => {
      const tot = FORM.filter(r => r[0] === L).length, kn = FORM.filter((r, j) => r[0] === L && known.has(j)).length, x = 40 + i * 160;
      s += `<rect x="${x}" y="30" width="130" height="14" rx="4" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="30" width="${130 * kn / tot}" height="14" rx="4" fill="${C.teal}"/>` + tx(x + 65, 22, "Lesson " + L, "middle", "t") + tx(x + 65, 60, `${kn} of ${tot}`, "middle");
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
    $("l43fs").disabled = done || shown; $("l43fk").disabled = done || !shown; $("l43fn").disabled = done || !shown;
    $("l43fr").disabled = !done || known.size === FORM.length;
    $("l43fo").innerHTML = ML.readout([["known", `${known.size} of ${FORM.length}`], ["this round", done ? "finished" : `${order.length - pos} left`]]);
    if (shown && !done) typesetMath(fig);
  };
  $("l43fs").onclick = () => { shown = true; u(); };
  $("l43fk").onclick = () => { known.add(order[pos]); pos++; shown = false; u(); };
  $("l43fn").onclick = () => { pos++; shown = false; u(); };
  $("l43fr").onclick = () => { order = FORM.map((_, i) => i).filter(i => !known.has(i)); pos = 0; shown = false; round.n++; u(); };
  $("l43fa").onclick = () => { known.clear(); order = FORM.map((_, i) => i); pos = 0; shown = false; round.n = 1; u(); };
  u();
}},

{s: "A. Recurrent networks", t: "Section A: the RNN cell, its gradient through time, and choosing it",
intu: String.raw`Eight questions from Lesson 39, in the style of the practice finals. Count the parameters of nn.RNN, run two steps by hand, catch the <code>batch_first</code> trap, add up the gradient of a shared weight, say what a per-step factor does over many steps, clip a gradient by its norm, name exposure bias, and choose the layer for a sensor task.`,
eq: String.raw`\[ \text{Section A: 8 questions, pass at 6} \]`,
sym: [["Lesson 39", "sequence problems, the cell by hand, parameter sharing, nn.RNN shapes, backpropagation through time, vanishing and exploding gradients, clipping, memory, teacher forcing, choosing the layer"]],
how: ["Write z before tanh at every step.", "For a shared weight, write one term per step, then add.", "For a shape, write which axis is time before anything else."],
say: String.raw`Section A tests whether you can run a recurrent network forward and backward by hand and hand PyTorch the right shapes.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "How many parameters does nn.RNN(input_size=12, hidden_size=20) have?", o: ["640", "680", "1,520", "660"], a: 1, why: String.raw`\(20\,(12 + 20 + 2) = 680\): the input weights \(20\cdot 12 = 240\), the recurrent weights \(20\cdot 20 = 400\) and two bias vectors of 20, because PyTorch keeps <code>bias_ih</code> and <code>bias_hh</code> apart. 640 leaves out the biases and 1,520 is two layers. The count does not depend on the sequence length. Lesson 39 card 3.` },
    { q: String.raw`A one-unit RNN has \(h_t = \tanh(w\,h_{t-1} + u\,x_t)\) with \(w = -0.5\), \(u = 2\) and \(h_0 = 0\). It reads \(x = (0.5, 1)\). What is \(h_2\)?`, o: ["0.9246", "0.9640", "1.6192", "0.7616"], a: 0, why: String.raw`\(h_1 = \tanh(2\cdot 0.5) = 0.7616\), then \(z_2 = -0.5\cdot 0.7616 + 2\cdot 1 = 1.6192\) and \(h_2 = \tanh 1.6192 = 0.9246\). 0.9640 drops the recurrent term, 1.6192 forgets the tanh, and 0.7616 is \(h_1\). Lesson 39 card 2.` },
    { q: "This code runs without an error. What did it compute?", code: ["rnn = nn.RNN(8, 16)", "x = torch.randn(32, 50, 8)   # 32 sequences of 50 steps", "out, h_n = rnn(x)"], o: ["it raises an error about the input size", "the intended thing, with h_n of shape (1, 32, 16)", "it read 50 sequences of 32 steps, so h_n has shape (1, 50, 16) and the batch was mixed into time", "out has shape (32, 16)"], a: 2, why: String.raw`Without <code>batch_first=True</code> nn.RNN expects (T, B, n_x), so it takes 32 as the length and 50 as the batch. Both sizes are legal, so nothing complains. Pass <code>batch_first=True</code> and check that <code>h_n</code> is (1, 32, 16). Lesson 39 card 4.` },
    { q: String.raw`A linear one-unit RNN has \(h_t = w\,h_{t-1} + x_t\), \(h_0 = 0\), \(w = 0.5\) and reads \(x = (2, 1, -1)\). The loss is \(L = h_3\). What is \(\partial L/\partial w\)?`, o: ["2", "0", "1", "3"], a: 3, why: String.raw`One term per step, \(\partial L/\partial z_t\) times \(h_{t-1}\): step 3 gives \(1\cdot h_2 = 2\), step 2 gives \(w\cdot h_1 = 0.5\cdot 2 = 1\), step 1 gives 0 because \(h_0 = 0\). The sum is 3. As a check, \(h_3 = 2w^2 + w - 1\) has derivative \(4w + 1 = 3\). The value 2 keeps only the last step, and 0 is \(h_3\) itself. Lesson 39 card 5.` },
    { q: "A gradient moves back through 30 steps and is multiplied by about 0.8 at each one. Another RNN multiplies by about 1.25. What reaches the first step in each case?", o: ["0.0012 times the gradient, and 808 times", "24 times and 37.5 times", "0.2 times and 1.25 times", "0.0012 times, and 1.25 times because tanh caps it"], a: 0, why: String.raw`\(0.8^{30} = 1.24\times 10^{-3}\) and \(1.25^{30} = 807.8\). Factors multiply, they do not add. Tanh caps the states, not the gradient, which can still grow whenever the states sit in tanh's linear part. Lesson 39 card 6.` },
    { q: "The gradient is (3, −4, 12). What does torch.nn.utils.clip_grad_norm_ with max_norm 2.6 leave in the .grad fields?", o: ["(2.6, −2.6, 2.6)", "(0.6, −0.8, 2.4)", "(3, −4, 2.6)", "(0.23, −0.31, 0.92)"], a: 1, why: String.raw`The norm is \(\sqrt{9 + 16 + 144} = 13 \gt 2.6\), so every component is multiplied by \(2.6/13 = 0.2\). The direction is kept and the length becomes 2.6. The first option clips each value and turns the direction, the last one rescales to length 1. The call returns 13, the norm before clipping, which is worth logging. Lesson 39 card 7.` },
    { q: "A character model trained with teacher forcing reaches 0.02 nats per character on validation text. When it writes on its own, one wrong character derails the rest of the line. What is this and what helps?", o: ["overfitting, so add dropout", "vanishing gradients, so clip harder", "exposure bias: in training it always saw the true previous character and never its own mistakes. Scheduled sampling feeds it some of its own outputs during training", "a learning rate that is too high"], a: 2, why: "Teacher forcing feeds the true past at every step, which is fast and stable, but the model never practises recovering from its own errors. At generation one mistake puts it in states it never saw. The low teacher-forced loss measures one-step prediction, not free running. Lesson 39 card 9." },
    { q: "Each sample is 10 seconds of a 3-axis accelerometer at 100 readings per second, and the label is walking, running or sitting. Which model fits?", o: ["nn.Linear(3, 3) applied to each reading", "nn.LSTM(input_size=3, hidden_size=64, batch_first=True) on (B, 1000, 3), then nn.Linear(64, 3) on h_n[-1] with CrossEntropyLoss", "nn.LSTM(input_size=1000, hidden_size=64) on (B, 3, 1000)", "nn.Conv2d(1, 16, 3) on the 1000 by 3 table, trained with MSELoss"], a: 1, why: "The input is a sequence of 1,000 steps, each a 3-vector, so input_size is 3 and the final hidden state summarizes the window for a 3-class head. A per-reading Linear has no memory, input_size 1000 treats time as features, and MSELoss is for regression. A 1D convolution would also be reasonable. Lesson 39 card 10." }
  ], "Section A");
}},

{s: "B. LSTM and GRU", t: "Section B: gates by hand and the PyTorch traps that come with them",
intu: String.raw`Eight questions from Lesson 40. Update a GRU by hand, translate PyTorch's GRU gate into Ng's notation, update an LSTM cell and hidden state, compute the forget route over many steps, count the parameters of nn.LSTM, find the bug in the state tuple, give the shapes of a deep bidirectional LSTM, and say what padding does to the last step.`,
eq: String.raw`\[ \text{Section B: 8 questions, pass at 6} \]`,
sym: [["Lesson 40", "why plain RNNs forget, the GRU and LSTM by hand, gates as soft switches, the forget bias, nn.LSTM and nn.GRU, the memory experiment, deep and bidirectional, sequences of different lengths"]],
how: ["Write each gate value before the update.", "Write the update in Ng's form, then check which term gets which weight.", "For PyTorch shapes, write the number of layers times the directions first."],
say: String.raw`Section B tests whether you can run the gates by hand and read what nn.LSTM and nn.GRU hand back.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: String.raw`A GRU unit in Ng's notation has \(\Gamma_u = 0.25\), \(\tilde c^{\langle t\rangle} = 0.8\) and \(c^{\langle t-1\rangle} = -0.4\). What is \(c^{\langle t\rangle}\)?`, o: ["0.5", "−0.1", "0.4", "−0.08"], a: 1, why: String.raw`\(c^{\langle t\rangle} = \Gamma_u\tilde c + (1 - \Gamma_u)c^{\langle t-1\rangle} = 0.25\cdot 0.8 + 0.75\cdot(-0.4) = 0.2 - 0.3 = -0.1\). A small update gate keeps most of the old value. Swapping the two weights gives 0.5. Lesson 40 card 2.` },
    { q: String.raw`PyTorch documents the GRU as \(h_t = (1 - z_t) * n_t + z_t * h_{t-1}\). A unit has \(z_t = 0.95\). In Ng's notation this means`, o: [String.raw`\(\Gamma_u = 0.95\), so the unit mostly takes the new candidate`, "the relevance gate is 0.95", "the unit is dead and passes no gradient", String.raw`\(\Gamma_u = 0.05\), so the unit mostly keeps its old state`], a: 3, why: String.raw`PyTorch's \(z\) multiplies the old state, Ng's \(\Gamma_u\) multiplies the candidate, so \(\Gamma_u = 1 - z = 0.05\). Both describe a unit that is holding its memory. Read the formula, not the letter, when you move between the two. Lesson 40 card 2.` },
    { q: String.raw`An LSTM unit has \(\Gamma_f = 0.9\), \(\Gamma_u = 0.2\), \(\tilde c = -0.5\), \(c^{\langle t-1\rangle} = 2\) and \(\Gamma_o = 0.5\). What are \(c^{\langle t\rangle}\) and \(a^{\langle t\rangle}\)?`, o: [String.raw`\(c = 1.7\) and \(a = 0.85\)`, String.raw`\(c = 1.9\) and \(a = 0.4781\)`, String.raw`\(c = 1.7\) and \(a = 0.4677\)`, String.raw`\(c = 2.1\) and \(a = 0.4852\)`], a: 2, why: String.raw`\(c = 0.2\cdot(-0.5) + 0.9\cdot 2 = 1.7\) and \(a = 0.5\cdot\tanh 1.7 = 0.5\cdot 0.9354 = 0.4677\). 0.85 forgets the tanh on the cell, 1.9 drops the minus sign of the candidate, and 2.1 forgets the forget gate. Lesson 40 card 4.` },
    { q: String.raw`Along the cell's direct route the gradient over \(T\) steps is about \(\sigma(b_f)^T\). For \(T = 25\), what does it give with forget bias \(b_f = 0\) and with \(b_f = 3\)?`, o: [String.raw`\(3.0\times 10^{-8}\) and 0.30`, "0.5 and 0.95", "12.5 and 23.8", String.raw`\(3.0\times 10^{-8}\) and 1`], a: 0, why: String.raw`\(\sigma(0)^{25} = 0.5^{25} = 2.98\times 10^{-8}\) and \(\sigma(3)^{25} = 0.9526^{25} = 0.297\). A gate that starts half open forgets almost everything in 25 steps, one that starts near 1 keeps a usable signal. That is why Lesson 40 raised the forget bias. Lesson 40 cards 5 and 7.` },
    { q: "How many parameters does nn.LSTM(16, 32) have?", o: ["4,800", "6,272", "6,400", "1,600"], a: 2, why: String.raw`\(4\cdot 32\,(16 + 32 + 2) = 6{,}400\): four stacked gate blocks, each with input and recurrent weights and two bias vectors. nn.GRU(16, 32) has three blocks, 4,800, and nn.RNN one, 1,600. 6,272 counts only one bias vector. Lesson 40 card 6.` },
    { q: "This code runs. What is wrong?", code: ["lstm = nn.LSTM(10, 32, batch_first=True)", "out, h = lstm(x)", "logits = head(h[-1])"], o: ["nothing, h[-1] is the last hidden state", "h[-1] raises an IndexError", "out should be used because h is empty", "h is the tuple (h_n, c_n), so h[-1] is c_n, the cell state of shape (1, B, 32). Write out, (h_n, c_n) = lstm(x) and use h_n[-1]"], a: 3, why: "nn.LSTM returns two states, and indexing the tuple with −1 picks the cell state, not the hidden state. The shapes still fit a head, so no error is raised. Unpack the tuple. Lesson 40 card 6." },
    { q: "nn.LSTM(10, 32, num_layers=2, bidirectional=True, batch_first=True) gets an input of shape (4, 15, 10). What are the shapes of out and h_n?", o: ["out (4, 15, 64) and h_n (4, 4, 32)", "out (4, 15, 32) and h_n (2, 4, 32)", "out (4, 15, 64) and h_n (2, 4, 64)", "out (15, 4, 64) and h_n (4, 4, 32)"], a: 0, why: "out joins the two directions of the last layer on the feature axis, 2 · 32 = 64. h_n keeps one row per layer and direction, 2 · 2 = 4 rows of 32. The last layer's forward summary is h_n[-2] and its backward summary h_n[-1]. Lesson 40 card 9." },
    { q: "A batch holds sequences of lengths 6, 4 and 2, padded with zeros to length 6. The model reads out[:, -1, :] as each sequence's summary. What is wrong?", o: ["nothing, zero inputs do not change an LSTM", "for the shorter sequences the last column comes after 2 or 4 padding steps, so their summaries have run over zeros. Pack with pack_padded_sequence or take out[b, len_b − 1]", "only the longest sequence is wrong", "PyTorch skips zero rows on its own"], a: 1, why: "A zero input still passes through the biases and the recurrent weights, so the state keeps changing over the padding. Lesson 40 showed padded and packed final states that disagree. Packing stops each sequence at its own length. Lesson 40 card 10." }
  ], "Section B");
}},

{s: "C. Attention", t: "Section C: weights, scores, masks and the traps of the PyTorch calls",
intu: String.raw`Eight questions from Lesson 41. Turn attention scores into a context, run scaled dot-product attention by hand, say why the scale is a square root, mask a padding key the right way, count the parameters of nn.MultiheadAttention, catch its <code>batch_first</code> trap, read a Boolean mask correctly, and size the memory of an attention matrix.`,
eq: String.raw`\[ \text{Section C: 8 questions, pass at 6} \]`,
sym: [["Lesson 41", "the bottleneck, Ng's attention model, queries, keys and values, scaled dot-product attention, the square root of the key length, self-attention, masks, attention in PyTorch, order and cost"]],
how: ["Write the scores, then subtract the largest before the exponentials.", "Divide by the square root of the key length before the softmax.", "For a mask, ask what True means in that call."],
say: String.raw`Section C tests whether you can compute attention by hand and use PyTorch's attention calls without a silent mistake.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: String.raw`Ng's attention model gives the scores \(e = (1, 2, 0)\) over three encoder states \(a = (4, -2, 10)\). What is the context?`, o: ["4, the mean of the states", "−2, the state with the highest score", "0.5487", "0, weights proportional to the scores"], a: 2, why: String.raw`The softmax gives \(\alpha = (0.2447, 0.6652, 0.0900)\), so \(c = 0.2447\cdot 4 + 0.6652\cdot(-2) + 0.0900\cdot 10 = 0.5487\). The weights are a softmax, not the scores divided by their sum, and the context blends every state. Lesson 41 card 2.` },
    { q: String.raw`One query \(\mathbf q = (1, 2, 0, 1)\) attends to keys \(\mathbf k_1 = (1, 0, 1, 1)\) and \(\mathbf k_2 = (0, 1, 0, -1)\) with values \(\mathbf v_1 = (2, 0)\) and \(\mathbf v_2 = (0, 4)\). Scaled dot-product attention returns`, o: ["(1.4621, 1.0758)", "(1.2449, 1.5102)", "(1, 2)", "(0.6225, 0.3775)"], a: 1, why: String.raw`The dot products are 2 and 1, divided by \(\sqrt 4 = 2\) they are 1 and 0.5. The softmax gives (0.6225, 0.3775), so the output is \(0.6225\,(2, 0) + 0.3775\,(0, 4) = (1.2449, 1.5102)\). Without the scale the weights are (0.7311, 0.2689) and the output is the first option. The last option is the weights. Lesson 41 card 5.` },
    { q: String.raw`Queries and keys have \(d_k = 256\) entries, independent with mean 0 and variance 1. What is the standard deviation of \(\mathbf q\cdot\mathbf k\) before and after dividing by \(\sqrt{d_k}\)?`, o: ["16 and 1", "256 and 16", "1 and 1/16", "16 and 1/16"], a: 0, why: String.raw`The dot product is a sum of 256 terms of variance 1, so its variance is 256 and its standard deviation 16. Dividing by 16 brings it to 1, where the softmax is not saturated and still passes gradient. A simulation gives 15.96 and 0.997. Lesson 41 card 6.` },
    { q: "Scores (2, 1, 3) go into a softmax, and key 3 is padding. Which weights are right, and how are they made?", o: ["(0.6652, 0.2447, 0.0900), by setting the padding score to 0", "(0.2447, 0.0900, 0), by zeroing the padding weight after the softmax", "(0.7311, 0.2689, 0), by adding −∞ to the padding score before the softmax", "(0.5, 0.5, 0), by averaging the real keys"], a: 2, why: String.raw`Only \(-\infty\) before the softmax gives the padding exactly 0 and leaves the rest summing to 1. A score of 0 still earns weight, and zeroing afterwards leaves weights that sum to 0.3347. Lesson 41 card 8.` },
    { q: "How many parameters does nn.MultiheadAttention(embed_dim=64, num_heads=8) have?", o: ["16,384", "133,120", "12,480", "16,640"], a: 3, why: String.raw`\(4d^2 + 4d = 4\cdot 4{,}096 + 256 = 16{,}640\): the query, key, value and output projections with their biases. The heads split the 64 features into 8 groups of 8, they add no parameters. 16,384 leaves out the biases, 133,120 multiplies by the 8 heads, and 12,480 forgets the output projection. Lesson 41 card 9.` },
    { q: "This code runs without an error. What did it compute?", code: ["mha = nn.MultiheadAttention(32, 4)", "x = torch.randn(8, 20, 32)   # 8 sentences of 20 tokens", "out, w = mha(x, x, x)"], o: ["it raises a shape error", "it attended across the 8 sentences: without batch_first it reads (T, B, d), so w has shape (20, 8, 8)", "the intended thing, with w of shape (8, 20, 20)", "out has shape (8, 32)"], a: 1, why: "nn.MultiheadAttention defaults to batch_first=False, so 8 is taken as the length and 20 as the batch. Each token then attends to the tokens at the same position in the other sentences. Pass batch_first=True and check that w is (8, 20, 20). Lesson 41 card 9." },
    { q: "pad is a Boolean tensor that is True at padding tokens. What is wrong with F.scaled_dot_product_attention(q, k, v, attn_mask=pad[:, None, None, :])?", o: ["in this function True means take part, so every query attends only to the padding. Pass ~pad here, or pass pad as key_padding_mask to nn.MultiheadAttention, where True means ignore", "nothing, True always means blocked", "the mask must be float", "it masks only the first head"], a: 0, why: "The two PyTorch calls read a Boolean mask in opposite ways: the function keeps the True positions, the module's key_padding_mask drops them. Lesson 41 card 9 shows both on the same tokens." },
    { q: "One float32 attention matrix, for one head and one sequence, has n by n entries. How much memory does it take at n = 2,048 and at n = 4,096?", o: ["16 MiB and 64 MiB", "8 KiB and 16 KiB", "16 MiB and 32 MiB", "4 MiB and 8 MiB"], a: 0, why: String.raw`\(2048^2\cdot 4\) bytes is 16 MiB, and doubling n multiplies the entries by 4, so 64 MiB. Multiply by heads, layers and batch for the real cost. An RNN keeps one hidden state per step instead, which grows only linearly. Lesson 41 card 10.` }
  ], "Section C");
}},

{s: "D. Transformers", t: "Section D: heads, blocks, positions and the three families",
intu: String.raw`Eight questions from Lesson 42. Give the shapes inside multi-head attention, count the parameters of an encoder block, write a positional code, say what self-attention does without one, run layer norm on one token, read a causal mask, count the tokens of a vision transformer, and give the shapes of cross-attention.`,
eq: String.raw`\[ \text{Section D: 8 questions, pass at 6} \]`,
sym: [["Lesson 42", "the transformer at a glance, multi-head attention, splitting into heads, positional encoding, one encoder block, layer norm, the causal mask, cross-attention, BERT, GPT and ViT, a tiny GPT"]],
how: [String.raw`Write \(d\) and \(h\), then \(d_k = d/h\).`, "For a block, count attention and feed-forward separately.", "For cross-attention, the queries decide the rows."],
say: String.raw`Section D tests whether you can size a transformer on paper and say what each of its parts does.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Multi-head attention with d = 512 and h = 8 heads gets an input of shape (2, 10, 512). What is d_k, and what is the shape of the attention scores?", o: ["512 and (2, 10, 10)", "64 and (2, 8, 10, 10)", "64 and (2, 10, 8, 8)", "8 and (2, 64, 10, 10)"], a: 1, why: String.raw`\(d_k = 512/8 = 64\). The projections are viewed as (2, 10, 8, 64) and transposed to (2, 8, 10, 64), so every head scores 10 queries against 10 keys: (2, 8, 10, 10). The third option forgets the transpose. Lesson 42 card 3.` },
    { q: "How many parameters does nn.TransformerEncoderLayer(d_model=256, nhead=4, dim_feedforward=1024) have?", o: ["786,432", "263,168", "525,568", "789,760"], a: 3, why: String.raw`With \(d_{ff} = 4d\) a block has \(12d^2 + 13d = 786{,}432 + 3{,}328 = 789{,}760\): attention 263,168, the feed-forward network 525,568 and two layer norms 1,024. The first option leaves out every bias and norm, the next two are the parts alone. Lesson 42 card 1.` },
    { q: String.raw`With \(d = 4\), what is the sinusoidal positional encoding of position 2, in the order \((\sin, \cos, \sin, \cos)\)?`, o: ["(0.9093, −0.4161, 0.0200, 0.9998)", "(0.9093, 0.0200, −0.4161, 0.9998)", "(0.0349, 0.9994, 0.0003, 1.0000)", "(2, 2, 0.02, 0.02)"], a: 0, why: String.raw`For \(i = 0\) the angle is \(2/10000^0 = 2\) radians: \(\sin 2 = 0.9093\), \(\cos 2 = -0.4161\). For \(i = 1\) it is \(2/10000^{2/4} = 0.02\): \(0.0200\) and \(0.9998\). The third option uses degrees, the last one forgets the sine and cosine. Lesson 42 card 4.` },
    { q: "A self-attention layer has no positional encoding. It reads \"dog bites man\" and then \"man bites dog\". What comes out?", o: ["completely different vectors for every word", "the same three output vectors in a different order, so a pooled summary is identical and the model cannot tell who bit whom", "an error, because the order is undefined", "equal attention weights for every pair"], a: 1, why: "Self-attention is permutation equivariant: shuffling the tokens shuffles the outputs and changes nothing else. The positional code is the only thing that tells the model where a word is. Lesson 41 card 10 and Lesson 42 card 4." },
    { q: String.raw`Layer norm with \(\gamma = 1\), \(\beta = 0\) and \(\epsilon\) ignored is applied to one token with features (1, 3, 5, 7). What does the 7 become?`, o: ["0.75", "1.1619", "1.3416", "7, layer norm needs a batch"], a: 2, why: String.raw`The mean over the 4 features is 4 and the variance, divided by 4, is 5, so \(3/\sqrt 5 = 1.3416\). PyTorch gives (−1.3416, −0.4472, 0.4472, 1.3416). The unbiased variance gives 1.1619. Layer norm works on one token at a time, unlike batch norm. Lesson 42 card 6.` },
    { q: "A causal mask for T = 5 tokens is a 5 by 5 matrix. How many entries are −∞, and which tokens can token 3 attend to?", o: ["10, and tokens 1 to 3", "15, and tokens 3 to 5", "10, and tokens 4 and 5", "5 on the diagonal, and every token but itself"], a: 0, why: String.raw`Everything above the diagonal is \(-\infty\): \(4 + 3 + 2 + 1 = 10\) entries, which is what <code>nn.Transformer.generate_square_subsequent_mask(5)</code> returns. Row 3 keeps columns 1 to 3, itself and the past. Lesson 42 card 7.` },
    { q: "A vision transformer cuts 384 by 384 images into 16 by 16 patches and adds a class token. How many tokens does each image give?", o: ["197", "576", "577", "1,152"], a: 2, why: String.raw`\((384/16)^2 = 24^2 = 576\) patches plus the class token is 577. At 224 by 224 it is 197. The attention matrix grows with the square, from 38,809 to 332,929 entries. Lesson 42 card 9.` },
    { q: "In cross-attention a decoder of 7 tokens reads an encoder output of 12 tokens, with d = 64, 4 heads and a batch of 2 and batch_first=True. What does nn.MultiheadAttention return?", o: ["weights (2, 12, 7) and output (2, 12, 64)", "weights (2, 7, 12) averaged over the heads and output (2, 7, 64)", "weights (2, 7, 7) and output (2, 7, 64)", "weights (2, 19, 19) and output (2, 19, 64)"], a: 1, why: "The queries come from the decoder and the keys and values from the encoder, so every decoder token gets one row of 12 weights and one output vector. The module averages the weights over the heads unless average_attn_weights=False. Lesson 42 card 8." }
  ], "Section D");
}},

{s: "Board problem", t: "A board problem: an RNN, an LSTM step and attention by hand",
intu: String.raw`The final exam asks for an RNN gradient, clipping, the LSTM gates and choosing nn.LSTM. This board problem asks for all of them in nine parts, each using the last. A one-unit RNN without biases reads three numbers and is scored at the end. You run it forward, carry the gradient back through time, watch the per-step factor, clip and step, then take one LSTM step, follow its cell highway, attend over the RNN's hidden states and size the same kind of model in PyTorch. Step through the parts, work each on paper, then press Show solution. The picture follows along and its sliders let you test the parts beyond the numbers asked. Every number was produced with PyTorch and is small enough to check with a calculator.`,
eq: String.raw`\[ h_t = \tanh(w\,h_{t-1} + u\,x_t), \qquad \hat y = v\,h_3, \qquad L = \tfrac12(\hat y - y)^2 \]`,
sym: [["x", "(−1, 2, 1), read from h₀ = 0"], [String.raw`\(w, u, v\)`, "1.5, 0.5 and 2, the recurrent, input and output weights"], ["y", "the target, 0.5"], ["c", "the clipping threshold, 1, and the SGD rate 0.5"], [String.raw`\(\Gamma_f, \Gamma_u, \Gamma_o\)`, "the LSTM gates of parts 6 and 7"], ["q", "the decoder query of part 8, 2"]],
how: ["Read the part.", "Work it on paper.", "Show the solution and compare line by line.", "Mark any part you got wrong and reopen its lesson.", "Go to the next part, which uses this one."],
say: String.raw`For this RNN the hidden states are minus 0.4621, 0.2975 and 0.7381, the loss is 0.4765, the gradients of w, u and v are minus 0.2971, 1.8855 and 0.7206, clipping to norm one and a step of 0.5 bring the loss to 0.0739, the LSTM step gives a cell of 1.2616 and a hidden state of 0.6225, and attention with query two gives a context of 0.5445.`,
num: String.raw`h = (<b>${B0.h.map(v => fm(v)).join(", ")}</b>), ŷ = <b>${fm(B0.yh)}</b>, L = <b>${fm(B0.L)}</b>, ∂L/∂(w, u, v) = (<b>${B0.grad.map(v => fm(v)).join(", ")}</b>), norm <b>${f(norm(B0.grad))}</b>, loss after the clipped step <b>${fm(BN.L)}</b> against <b>${fm(BP.L)}</b> unclipped, LSTM c = <b>${f(L6.c1)}</b> and a = <b>${f(L6.a1)}</b>, attention weights (<b>${A8.a.map(v => f(v)).join(", ")}</b>) and context <b>${f(A8.ctx)}</b>.`,
note: String.raw`Write the tanh slope 1 − h² next to every state during the forward pass. The backward pass needs exactly those numbers, and a sign error in one of them is the most common way to lose the BPTT marks on the exam.`,
r(fig, ctl) {
  let open = false, cur = 0;
  const st = { show: 1, walk: 1, fac: 0.9, c: 1, mode: "norm", zf: 2, T: 30, q: 2, causal: false, G: 4, bi: false };
  const Lab = ["forward", "output gradients", "through time", "fade or grow", "clip and step", "LSTM step", "cell highway", "attention", "PyTorch"];
  const draw = k => {
    let h = "";
    if (k <= 2) h = rnnFig(k, { show: st.show, back: 3 - st.walk });
    else if (k === 3) h = rnnFig(3, { show: 3, back: 0 }) + fadeFig(st.fac) + ML.readout([["per-step factor", f(st.fac, 2)], ["after 50 steps", ex(Math.pow(st.fac, 50))], ["0.6828⁵⁰", ex(Math.pow(0.6828, 50))], ["1.5⁵⁰", ex(Math.pow(1.5, 50))]]);
    else if (k === 4) { const Cf = clipFig(st.c, st.mode); h = Cf.s + ML.readout([["clipped g", `(${Cf.gc.map(v => fm(v)).join(", ")})`], ["new states", `(${Cf.R.h.map(v => fm(v)).join(", ")})`], ["new ŷ", fm(Cf.R.yh)], ["new loss", fm(Cf.R.L)]]); }
    else if (k === 5) h = lstmFig(5, LS);
    else if (k === 6) h = lstmFig(6, LS) + routeFig(st.zf, st.T) + ML.readout([[`σ(${g(st.zf, 1)}) = Γf`, f(sig(st.zf))], [`Γf^${st.T}`, ex(Math.pow(sig(st.zf), st.T))], [`RNN 0.6828^${st.T}`, ex(Math.pow(0.6828, st.T))], ["to a⁽¹⁾", f(L6.route)]]);
    else if (k === 7) { const A = att(st.q, st.causal ? 2 : 3); h = attFig(st.q, st.causal) + ML.readout([["weights", `(${A.a.map(v => f(v)).join(", ")}${st.causal ? ", 0" : ""})`], ["context", fm(A.ctx)]]); }
    else h = shapeFig(st.G, st.bi);
    fig.innerHTML = h + `<p style="font-weight:600;margin:6px 0 4px">Part ${k + 1}. ${BOARD[k].t}</p><p>${BOARD[k].q}</p>`;
    $("l43bs").innerHTML = open ? `<div class="dnote"><p><b>Solution.</b> ${BOARD[k].a}</p></div>` : `<p class="note">Work it on paper first.</p>`;
    $("l43bb").textContent = open ? "Hide solution" : "Show solution";
    typesetMath(fig, $("l43bs"));
  };
  const bx = () => $("l43bx");
  const slider = (id, lab, a, b, s, key, show) => {
    bx().insertAdjacentHTML("beforeend", sl(id, lab, a, b, s, st[key]));
    const u = () => { st[key] = +$(id).value; $(id + "v").textContent = show(st[key]); draw(cur); };
    $(id).oninput = u; $(id + "v").textContent = show(st[key]);
  };
  const toggle = (attr, items, key) => {
    bx().insertAdjacentHTML("beforeend", btns(items, attr));
    bx().querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => { const v = b.dataset[attr]; st[key] = typeof st[key] === "number" ? +v : typeof st[key] === "boolean" ? v === "1" : v; pick(bx(), attr, typeof st[key] === "boolean" ? (st[key] ? 1 : 0) : st[key]); draw(cur); });
    pick(bx(), attr, typeof st[key] === "boolean" ? (st[key] ? 1 : 0) : st[key]);
  };
  const extra = k => {
    bx().innerHTML = "";
    if (k === 0) slider("l43b1", "steps shown", 1, 3, 1, "show", v => String(v));
    if (k === 2) slider("l43b3", "steps walked back", 1, 3, 1, "walk", v => `to t = ${4 - v}`);
    if (k === 3) slider("l43b4", "per-step factor", 0.5, 1.5, 0.01, "fac", v => f(v, 2));
    if (k === 4) { slider("l43b5", "threshold c", 0.25, 3, 0.05, "c", v => f(v, 2)); toggle("cm", [["norm", "clip by norm"], ["value", "clip by value"], ["none", "no clipping"]], "mode"); }
    if (k === 6) { slider("l43b7", "forget pre-activation", -1, 6, 0.1, "zf", v => f(v, 1)); slider("l43b7t", "steps T", 1, 60, 1, "T", v => String(v)); }
    if (k === 7) { slider("l43b8", "query q", -4, 4, 0.1, "q", v => f(v, 1)); toggle("ca", [[0, "all three keys"], [1, "causal at step 2"]], "causal"); }
    if (k === 8) { toggle("ce", [[1, "nn.RNN"], [3, "nn.GRU"], [4, "nn.LSTM"]], "G"); toggle("bd", [[0, "one direction"], [1, "bidirectional"]], "bi"); }
  };
  ctl.innerHTML = `<div id="l43bt"></div><div id="l43bx"></div><div class="row"><button id="l43bb">Show solution</button></div><div id="l43bs"></div>`;
  $("l43bb").onclick = () => { open = !open; draw(cur); };
  ML.stepper($("l43bt"), BOARD.length, k => { if (k !== cur) open = false; cur = k; extra(k); draw(k); }, Lab);
}},

{s: "Score sheet", t: "Enter your section scores and see what to reopen",
intu: String.raw`Set the four sliders to your section scores. The bars turn teal at 6 or above. For every section below 6 the sheet lists the cards its questions came from, in the order to reopen them. The total decides whether Part 8 is done: 26 of 32 or more. A total of 26 with one section at 5 is not a pass, because each section is a skill the final asks for on its own.`,
eq: String.raw`\[ \text{pass} \iff \min_s \text{score}_s \ge 6 \ \text{and} \ \sum_s \text{score}_s \ge 26 \]`,
sym: [["score", "correct answers in a section, 0 to 8"], ["section pass", "6 or more"], ["Part 8 pass", "every section passed and 26 or more overall"]],
how: ["Take each section once without notes.", "Enter the four scores.", "Reopen the listed cards for each red bar.", "Retake only those sections.", "Record the scores and the date in your notes."],
say: String.raw`Part 8 is passed when every section scores at least six and the total is at least twenty-six.`,
num: String.raw`A pass needs <b>26 of 32</b>, about 81 %, with no section below <b>6 of 8</b>.`,
note: String.raw`Sections A and B carry the questions every practice final repeats, so fix those first if time before the exam is short. Sections C and D matter most if your project uses attention or a pretrained transformer.`,
r(fig, ctl) {
  const REV = [["Lesson 39 cards 2, 3, 4, 5, 6, 7, 9, 10"], ["Lesson 40 cards 2, 4, 5, 6, 9, 10"], ["Lesson 41 cards 2, 5, 6, 8, 9, 10"], ["Lesson 42 cards 1, 3, 4, 6, 7, 8, 9"]];
  ctl.innerHTML = SEC.map((sc, i) => sl("l43s" + i, sc[0], 0, 8, 1, 7)).join("") + `<div id="l43so"></div>`;
  const u = () => {
    const v = SEC.map((_, i) => +$("l43s" + i).value);
    v.forEach((x, i) => { $("l43s" + i + "v").textContent = x + " / 8"; });
    const tot = v.reduce((a, b) => a + b, 0), ok = v.every(x => x >= 6) && tot >= 26;
    const a = ML.axes(60, 20, 400, 220, { xmin: 0, xmax: 4, ymin: 0, ymax: 8, nx: 4, ny: 8, fx: () => "", fy: v => v, yl: "score", grid: false });
    let s = a.s + `<line x1="${a.X(0)}" y1="${a.Y(6)}" x2="${a.X(4)}" y2="${a.Y(6)}" stroke="${C.coral}" stroke-dasharray="6 4"/>` + tx(a.X(4) + 6, a.Y(6) + 4, "pass 6", null);
    v.forEach((x, i) => { const x0 = a.X(i + 0.2), w = a.X(i + 0.8) - x0; s += `<rect x="${x0}" y="${a.Y(x)}" width="${w}" height="${a.Y(0) - a.Y(x)}" rx="4" fill="${x >= 6 ? C.teal : C.coral}" opacity="0.85"/>` + tx(x0 + w / 2, a.Y(0) + 16, "Section " + "ABCD"[i], "middle") + tx(x0 + w / 2, a.Y(x) - 6, String(x), "middle", "t"); });
    s += tx(530, 60, `total ${tot} / 32`, null, "th") + tx(530, 86, `${Math.round(100 * tot / 32)} %`, null, "t") + tx(530, 124, ok ? "Part 8 passed" : "not yet", null, "th");
    if (!ok && tot >= 26) s += tx(530, 148, "a section is below 6", null);
    fig.innerHTML = svg(280, s);
    const weak = v.map((x, i) => [x, i]).filter(([x]) => x < 6);
    $("l43so").innerHTML = weak.length ? `<div class="dnote">${weak.map(([x, i]) => `<p><b>${SEC[i][0]}</b> at ${x}: reopen ${REV[i].join(" and ")}, then retake the section.</p>`).join("")}</div>` : `<p class="note">${ok ? "Every section is at 6 or above. Go on to Part 9 and the project." : "Every section is at 6 or above but the total is under 26. Retake the two lowest sections."}</p>`;
  };
  SEC.forEach((_, i) => { $("l43s" + i).oninput = u; }); u();
}},

{s: "With the agent", t: "Do it with the agent: pin the board problem in PyTorch tests",
intu: String.raw`After working the board problem on paper, have the agent build the same RNN, LSTM step and attention in PyTorch, set the weights by hand and pin every one of your numbers in a test. Each assertion is one of your hand results, so a failing test means either your paper or the code is wrong, and finding out which is the best practice there is for the final. The command asks for autograd to be compared with your BPTT gradients, for <code>clip_grad_norm_</code> to be checked against your clipped vector, and for the LSTM gate order to be set explicitly, because that is where the real bugs hide.`,
eq: String.raw`\[ \texttt{rnn} \to \texttt{backward} \to \texttt{clip} \to \texttt{step} \to \texttt{lstm} \to \texttt{attention} \to \texttt{shapes} \]`,
sym: [["rnn", "nn.RNN(1, 1, bias=False) and nn.Linear(1, 1, bias=False) with w 1.5, u 0.5, v 2"], ["backward", "autograd against your three BPTT gradients"], ["clip", "<code>clip_grad_norm_</code> at 1, the returned norm 2.0402 and the clipped vector"], ["step", "SGD at 0.5, new loss 0.0739"], ["lstm", "nn.LSTM(1, 1) with the gates set in the order i, f, g, o"], ["attention", "<code>F.scaled_dot_product_attention</code> over the three hidden states, with and without the causal key"], ["shapes", "the part 9 shapes and counts"]],
how: ["Work the board problem on paper first.", "Paste the command.", "Read the tests: is every number one of yours?", "Run pytest and compare any failure with your paper.", "Commit the module with its tests."],
say: String.raw`The agent rebuilds the board models in PyTorch with the given weights and pins each hand result in a pytest test, so a mistake on paper or in code shows up as a failing assertion.`,
num: String.raw`Tests expect h = (<b>−0.4621, 0.2975, 0.7381</b>), L = <b>0.4765</b>, gradients (<b>−0.2971, 1.8855, 0.7206</b>), norm <b>2.0402</b>, loss after the step <b>0.0739</b>, LSTM c = <b>1.2616</b> and a = <b>0.6225</b>, context <b>0.5445</b> and <b>0.1611</b>, and <b>1,749</b> parameters for part 9.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/part8_board.py with torch only. build_rnn() returns nn.RNN(1, 1, bias=False, batch_first=True) and nn.Linear(1, 1, bias=False) with weight_hh_l0 = 1.5, weight_ih_l0 = 0.5 and the linear weight 2, set inside torch.no_grad() by copy_. The input is torch.tensor([-1., 2., 1.]).reshape(1, 3, 1), the target 0.5, and the loss is 0.5 * F.mse_loss of the readout of h_n[-1]. build_lstm() returns nn.LSTM(1, 1, batch_first=True) with weight_ih_l0 = [[-1], [1], [0.5], [1]], weight_hh_l0 = [[2], [0], [1], [-2]], bias_ih_l0 = [0, 1, 0, 1] and bias_hh_l0 zero (gate order i, f, g, o). Create tests/test_part8_board.py with pytest: the RNN outputs [-0.46212, 0.29755, 0.73811] and the loss 0.47651; after backward the gradients of weight_hh, weight_ih and the linear weight are -0.29707, 1.88550 and 0.72056; clip_grad_norm_ on the three parameters with max_norm 1.0 returns 2.04024 and leaves [-0.14561, 0.92416, 0.35317]; one torch.optim.SGD step with lr 0.5 gives a loss of 0.07391; build_lstm() run on x = 1 from h0 = 0.5 and c0 = 1 returns h 0.62250 and c 1.26159; F.scaled_dot_product_attention with query 2 over the three RNN outputs as keys and values (shape (1, 1, 1) and (1, 3, 1)) returns 0.54452, and 0.16110 with the third key masked by a Boolean attn_mask where True means take part; nn.LSTM(8, 16, batch_first=True) on (4, 30, 8) returns out (4, 30, 16) and h_n (1, 4, 16) and has 1,664 parameters, and with nn.Linear(16, 5) 1,749. Use torch.testing.assert_close with atol 1e-4 for every tensor. Run pytest -q and paste the output.",
    actions: ["$ pytest -q tests/test_part8_board.py", "........                                                 [100%]", "8 passed"],
    checks: ["the RNN is built with batch_first=True and bias=False, so it has exactly 3 parameters with the head", "the loss carries the factor 0.5, so the gradients match the board and not twice the board", "the gradient test calls backward once on a fresh model, never twice without zero_grad", "the clipping test checks both the returned norm and the clipped .grad values", "the LSTM weights follow PyTorch's gate order i, f, g, o, not Ng's order", "the attention mask uses True for keys that take part, as F.scaled_dot_product_attention reads it", "every asserted number matches your paper"]
  });
}}
],
summary: String.raw`Part 8 is passed when all four sections score at least six and the total is at least twenty-six. Section A asks you to run a recurrent network by hand and feed it correctly: the parameter count of nn.RNN, two steps of the cell, the <code>batch_first</code> trap, one gradient term per step for a shared weight, factors that multiply over time, clipping by norm that keeps the direction, exposure bias from teacher forcing, and nn.LSTM with the right input size for a sensor task. Section B asks you to work the gates: the GRU update and PyTorch's opposite z, the LSTM cell and hidden state, the forget route that shrinks like a power of the forget gate, the count of nn.LSTM, the state tuple, bidirectional shapes and padding. Section C asks for attention by hand and safely in PyTorch: weights and context, the square-root scale, minus infinity before the softmax, 4d² + 4d, and the opposite Boolean masks. Section D asks you to size a transformer: heads and shapes, 12d² + 13d per block, the positional code, layer norm, the causal mask, ViT tokens and cross-attention. The board problem runs an RNN forward and back through time, clips and steps, takes an LSTM step, attends over the states and sizes the model in PyTorch. Misses name a lesson and a card. Reopen them, retake the section, and move to Part 9.`,
sheet: [[String.raw`\[ \frac{\partial L}{\partial h_{t-1}} = \frac{\partial L}{\partial h_t}(1 - h_t^2)\,w, \qquad \frac{\partial L}{\partial w} = \sum_t \frac{\partial L}{\partial z_t}h_{t-1} \]`, "Section A: backpropagation through time"], [String.raw`\[ \mathbf g \leftarrow \mathbf g\,\frac{c}{\lVert\mathbf g\rVert} \ \text{if } \lVert\mathbf g\rVert \gt c, \qquad n_a(n_x + n_a + 2) \]`, "Section A: clipping and the nn.RNN count"], [String.raw`\[ c^{\langle t \rangle} = \Gamma_u * \tilde c^{\langle t \rangle} + \Gamma_f * c^{\langle t-1 \rangle}, \qquad a^{\langle t \rangle} = \Gamma_o * \tanh c^{\langle t \rangle} \]`, "Section B: the LSTM"], [String.raw`\[ 4H(n_x + H + 2), \qquad \prod_t \Gamma_f \approx \sigma(b_f)^T \]`, "Section B: the count and the forget route"], [String.raw`\[ \text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}} + M\Big)V, \qquad 4d^2 + 4d \]`, "Section C: attention with a mask and its parameters"], [String.raw`\[ d_k = d/h, \qquad 12d^2 + 13d, \qquad PE_{(pos, 2i)} = \sin\big(pos/10000^{2i/d}\big) \]`, "Section D: heads, a block and the positional code"], [String.raw`\[ \text{pass} = 6/8 \text{ per section}, \ 26/32 \text{ overall} \]`, "the marks"]],
sources: ["AME 5970 has no lecture notes, slides or homework on RNNs, LSTMs, attention or transformers (syllabus weeks 12 to 14), so the topic order follows the lessons below, and the final practice exams are cited by topic order (the PDFs were not available in this session, so the questions and the board problem follow the recurring final topics listed in the course map: RNN exploding and vanishing gradients, gradient clipping, LSTM gates, teacher forcing and exposure bias, and choosing nn.Linear, nn.Conv2d or nn.LSTM for a task)", "AME 5970 HW8 to HW10 questions and solutions docs, for the style of the hand calculations (a forward pass, a gradient, a parameter count before any code)", "Lessons 39 to 42 of this shelf", "Andrew Ng, Deep Learning Specialization, course 5 week 1 (recurrent neural networks, backpropagation through time, vanishing gradients, GRU, LSTM, bidirectional and deep RNNs), week 3 (attention model) and week 4 (self-attention, multi-head attention, transformer network)", "Goodfellow, Bengio and Courville, Deep Learning, chapter 10 (sequence modeling, teacher forcing, gradient clipping, gated RNNs)", "Pascanu, Mikolov and Bengio (2013), On the difficulty of training recurrent neural networks (clipping by norm)", "Hochreiter and Schmidhuber (1997) and Gers, Schmidhuber and Cummins (2000), for the LSTM and its forget gate", "Bahdanau, Cho and Bengio (2015) and Vaswani et al. (2017), for additive and scaled dot-product attention and the transformer", "Zhang, Lipton, Li and Smola, Dive into Deep Learning, chapters 9 to 11", "PyTorch 2.15 documentation (nn.RNN, nn.LSTM, nn.GRU, clip_grad_norm_, nn.MultiheadAttention, F.scaled_dot_product_attention, nn.TransformerEncoderLayer)"]
});
})();
