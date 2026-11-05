(function () {
/* ML shelf, Part 5, Lesson 22: Autograd. Follows the topic order of the AME 5970 Lecture 4 notes (PyTorch) and HW4 Part 3 (requires_grad, grad_fn, detach), with HW5 Problem 2c and HW6 Problem 1 (the five-step loop, zero_grad), HW7 2.1 and 2.2 (gradients through backward, the L1 derivative at zero) and HW10 (the warm-up gradient, eval does not disable autograd, the D1 chain derivative). Andrew Ng's Deep Learning Specialization course 1 week 2 (computation graph, derivatives with a computation graph) is the spine, with CS231n's backpropagation notes for the gate patterns, Karpathy's micrograd for the graph picture and the PyTorch autograd mechanics notes. Every number was computed with PyTorch 2.15 on the CPU. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const fm = (v, d) => !isFinite(v) ? (isNaN(v) ? "nan" : v > 0 ? "inf" : "−inf") : (+v).toFixed(d == null ? 4 : d).replace("-", "−");
const node = (x, y, w, lab, val, cls, on) => `<g class="${cls || "c-gray"}"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="9" stroke-width="${on ? 1.8 : 0.7}"/></g>` + tx(x, y - 3, lab, "middle", "th") + tx(x, y + 14, val, "middle", "t");
/* fresh regression data for cards 6 and 9: y about 2x + 1 */
const XS = [0, 1, 2, 3, 4], YS = [1.2, 2.8, 5.1, 7.0, 8.9], N = 5;
const mse = (w, b) => XS.reduce((s, x, i) => s + (w * x + b - YS[i]) ** 2, 0) / N;
const grad = (w, b) => { let gw = 0, gb = 0; XS.forEach((x, i) => { const e = w * x + b - YS[i]; gw += 2 * e * x / N; gb += 2 * e / N; }); return [gw, gb]; };

addLesson("ml", "torch", {
level: "Core", num: "Lesson 22",
id: "ml-torch-l22", title: "Autograd", short: "22. Autograd",
big: String.raw`Lesson 13 derived gradients by hand and Lesson 16 used them for descent. Autograd is PyTorch doing that derivation for you. Every operation on a tensor that requires gradients is recorded in a graph, and <code>backward()</code> walks the graph from the loss back to the leaves, multiplying local derivatives by the chain rule and storing the result in <code>.grad</code>. This lesson builds that picture: Andrew Ng's computation graph with live numbers, the attributes that record the graph, the local rules of each gate, and a check that autograd agrees with the hand formula and with a finite difference. Then the rules of use that every training loop depends on: gradients accumulate until you clear them, updates must happen under <code>no_grad</code>, <code>detach</code> cuts a path, and <code>model.eval()</code> does not switch autograd off. A manual gradient descent loop puts it together, and the last cards show what autograd returns at kinks and how gradients shrink or grow through a deep chain, HW10's residual example.`,
bridge: String.raw`The topics follow the professor's Lecture 4 notes on PyTorch in topic order, and the examples are HW4 Part 3 (<code>requires_grad</code>, <code>grad_fn</code>, detach), HW5 Problem 2c and HW6 Problem 1 (<code>zero_grad</code>, backward, step, evaluation under <code>no_grad</code>), HW7 2.1 and 2.2 (gradients checked through backward, the L1 derivative at zero) and HW10 (the warm-up gradient, evaluation mode, the D1 chain derivative). Andrew Ng's Deep Learning Specialization, course 1 week 2 (computation graph, derivatives with a computation graph) is the spine, with the CS231n backpropagation notes for the gate patterns and Karpathy's micrograd for the graph as a data structure. Lesson 33 will do backpropagation through a whole network by hand.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The computation graph", t: "A computation is a graph, and the chain rule runs it backward",
intu: String.raw`Andrew Ng's example: J = 3(a + bc). Break it into one operation per node: u = bc, v = a + u, J = 3v. The forward pass computes the values left to right. The backward pass starts at J with dJ/dJ = 1 and moves right to left. At each node it multiplies the gradient arriving from the right by that node's own local derivative, so dJ/dv = 3, then dJ/du = 3 × 1 and dJ/da = 3 × 1, then dJ/db = 3 × c and dJ/dc = 3 × b. That is all autograd does, for graphs with millions of nodes. Set the inputs, step forward, then backward.`,
eq: String.raw`\[ \frac{\partial J}{\partial b} = \frac{\partial J}{\partial v}\,\frac{\partial v}{\partial u}\,\frac{\partial u}{\partial b} = 3 \cdot 1 \cdot c \]`,
sym: [["forward pass", "values, from the inputs to J"], ["backward pass", "gradients, from J back to the inputs"], ["local derivative", "how one node's output changes with its own input"], ["upstream gradient", "dJ/d(node output), arriving from the right"], ["leaf", "an input you created, a, b and c here"]],
how: ["Write one operation per node.", "Run forward and write each value on its node.", "Start backward with 1 at the output.", "At each node multiply the upstream gradient by the local derivative.", "Read the leaf gradients: they are dJ/da, dJ/db, dJ/dc."],
say: String.raw`A computation graph has one node per operation, the forward pass computes values from the inputs to the output, and the backward pass multiplies upstream gradients by local derivatives from the output back to every input.`,
num: String.raw`With a = 4, b = −2, c = 3: u = <b>−6</b>, v = <b>−2</b>, J = <b>−6</b>. Backward: dJ/da = <b>3</b>, dJ/db = 3c = <b>9</b>, dJ/dc = 3b = <b>−6</b>, the values PyTorch puts in a.grad, b.grad and c.grad.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g1a", "a", -4, 4, 1, 4) + sl("g1b", "b", -4, 4, 1, -2) + sl("g1c", "c", -4, 4, 1, 3) + `<div id="g1s"></div>`;
  let k = 0;
  const draw = kk => {
    k = kk; const a = +$("g1a").value, b = +$("g1b").value, c = +$("g1c").value;
    ["a", "b", "c"].forEach((q, i) => $("g1" + q + "v").textContent = [a, b, c][i]);
    const u = b * c, v = a + u, J = 3 * v;
    const P = { a: [70, 70], b: [70, 160], c: [70, 250], u: [250, 205], v: [420, 120], J: [600, 120] };
    let s = "";
    const edge = (p, q) => arrow(P[p][0] + 46, P[p][1], P[q][0] - 50, P[q][1], "var(--p)", 1.2);
    s += edge("b", "u") + edge("c", "u") + edge("a", "v") + edge("u", "v") + edge("v", "J");
    const fv = { a: k >= 0, b: k >= 0, c: k >= 0, u: k >= 1, v: k >= 2, J: k >= 3 };
    const g = { J: k >= 3 ? 1 : null, v: k >= 4 ? 3 : null, a: k >= 5 ? 3 : null, u: k >= 5 ? 3 : null, b: k >= 6 ? 3 * c : null, c: k >= 6 ? 3 * b : null };
    const lab = { a: "a", b: "b", c: "c", u: "u = b·c", v: "v = a + u", J: "J = 3v" }, val = { a, b, c, u, v, J };
    Object.keys(P).forEach(n => {
      const leaf = "abc".includes(n);
      s += node(P[n][0], P[n][1], leaf ? 80 : 100, lab[n], fv[n] ? "= " + val[n] : "?", leaf ? "c-blue" : "c-purple", (k === 1 && n === "u") || (k === 2 && n === "v") || (k === 3 && n === "J"));
      if (g[n] != null) s += `<g class="c-coral"><rect x="${P[n][0] - 40}" y="${P[n][1] + 26}" width="80" height="22" rx="6" stroke-width="0.8"/></g>` + tx(P[n][0], P[n][1] + 41, "grad " + g[n], "middle", "t");
    });
    const notes = ["inputs set, nothing computed", "u = b·c", "v = a + u", "J = 3v, the forward pass is done", "dJ/dv = 3, the local derivative of 3v", "a and u receive 3 × 1, an add passes the gradient on", "b receives 3 × c and c receives 3 × b, a multiply swaps its inputs"];
    s += tx(30, 312, notes[k], null, "th");
    fig.innerHTML = svg(326, s) + ML.code(["a = torch.tensor(" + a + ".0, requires_grad=True)   # b and c the same way", "J = 3 * (a + b * c)", "J.backward()", "print(a.grad, b.grad, c.grad)"], k <= 3 ? 1 : 2);
  };
  ML.stepper($("g1s"), 7, draw, ["inputs", "u", "v", "J", "dJ/dv", "dJ/da, dJ/du", "dJ/db, dJ/dc"]);
  ["a", "b", "c"].forEach(q => $("g1" + q).oninput = () => draw(k));
}},

{s: "2. Recording the graph", t: "requires_grad, grad_fn and is_leaf: how PyTorch records the graph",
intu: String.raw`Autograd records only what it is asked to. A tensor you create with <code>requires_grad=True</code> is a leaf: it has no <code>grad_fn</code> and it is where gradients end up. Every operation on it produces a tensor that also requires gradients and carries a <code>grad_fn</code>, the backward node that knows the local derivative: MulBackward0 for a product, AddBackward0, PowBackward0, SumBackward0. A tensor made without <code>requires_grad</code>, like data, records nothing until it meets one that does. After <code>backward()</code> only leaves keep <code>.grad</code>, intermediate tensors return None with a warning. HW4 Part 3 checks exactly this: <code>derived = tracked * 2 + 1</code> must have a <code>grad_fn</code>.`,
eq: String.raw`\[ s = \sum_i (2x_i + 1)^2, \qquad \frac{\partial s}{\partial x_i} = 4(2x_i + 1) \]`,
sym: [[String.raw`\(\texttt{requires\_grad}\)`, "record operations on this tensor"], [String.raw`\(\texttt{grad\_fn}\)`, "the backward node that made this tensor, None for a leaf"], [String.raw`\(\texttt{is\_leaf}\)`, "created by you, not by an operation on a tracked tensor"], [".grad", "filled by backward, on leaves only"], [String.raw`\(\texttt{retain\_grad()}\)`, "ask an intermediate tensor to keep its .grad"]],
how: ["Create parameters with <code>requires_grad=True</code>, or let nn.Module do it, Lesson 23.", "Leave data tensors without it.", "Print <code>grad_fn</code> to see which operation made a tensor.", "Read gradients on the leaves after backward.", "Call <code>retain_grad()</code> before backward if you need an intermediate gradient for debugging."],
say: String.raw`A tensor that requires gradients makes every result of an operation on it record a backward node in its grad function, and backward fills the grad attribute of the leaf tensors only.`,
num: String.raw`For x = (1, 2, 3): y = 2x, z = y + 1, s = Σz². After <code>s.backward()</code>, x.grad = <b>(12, 20, 28)</b> and y.grad is <b>None</b>. <code>grad_fn</code> names: MulBackward0, AddBackward0, SumBackward0.`,
r(fig, ctl) {
  const T = [["x", "torch.tensor([1., 2., 3.], requires_grad=True)", true, true, "None", "(12., 20., 28.)"], ["y", "x * 2", true, false, "MulBackward0", "None + warning"], ["z", "y + 1", true, false, "AddBackward0", "None + warning"], ["s", "(z ** 2).sum()", true, false, "SumBackward0", "None + warning"], ["t", "torch.ones(3)", false, true, "None", "None"], ["t * x", "t * x", true, false, "MulBackward0", "None + warning"]];
  let v = 0;
  ctl.innerHTML = btns([[0, "the tensors"], [1, "the backward graph"], [2, "after s.backward()"]], "g2");
  const u = () => {
    pick(ctl, "g2", v); let s = "";
    if (v === 1) {
      const nodes = [["s", "SumBackward0"], ["z ** 2", "PowBackward0"], ["z", "AddBackward0"], ["y", "MulBackward0"], ["x", "AccumulateGrad"]];
      nodes.forEach(([n, fn], i) => { const x = 80 + i * 130; s += node(x, 90, 116, fn, "makes " + n, i === 4 ? "c-blue" : "c-purple"); if (i < 4) s += arrow(x + 60, 90, x + 70, 90, C.coral, 2); });
      s += tx(30, 30, "s.grad_fn.next_functions leads from the loss back to the leaf", null, "th") + tx(30, 150, "backward runs these nodes right to left from s, each one applies its local derivative", null) + tx(30, 170, "AccumulateGrad adds the arriving gradient into x.grad", null);
      fig.innerHTML = svg(190, s); return;
    }
    s += tx(30, 24, "name", null, "th") + tx(110, 24, "requires_grad", null, "th") + tx(240, 24, "is_leaf", null, "th") + tx(330, 24, "grad_fn", null, "th") + tx(480, 24, v === 2 ? ".grad after backward" : "", null, "th");
    T.forEach((r, i) => { const y = 54 + i * 34; s += `<rect x="20" y="${y - 20}" width="640" height="30" rx="5" fill="${r[2] ? "var(--accent-bg)" : "var(--sunk)"}"/>` + tx(30, y, r[0], null, "t") + tx(110, y, r[2], null, "t") + tx(240, y, r[3], null, "t") + tx(330, y, r[4], null, "t") + (v === 2 ? tx(480, y, r[5], null, r[0] === "x" ? "th" : "t") : ""); });
    fig.innerHTML = svg(260, s) + ML.code(T.map(r => (r[0] === "t * x" ? "w" : r[0]) + " = " + r[1]).concat(v === 2 ? ["s.backward()", "print(x.grad)          # tensor([12., 20., 28.])"] : []), -1);
  };
  ctl.querySelectorAll("button[data-g2]").forEach(b => b.onclick = () => { v = +b.dataset.g2; u(); }); u();
}},

{s: "3. backward on a scalar", t: "backward computes a gradient and changes nothing else",
intu: String.raw`HW10's warm-up: <code>w = torch.tensor(3., requires_grad=True)</code>, loss (w − 1)², <code>loss.backward()</code>. The printout is w = 3, loss = 4, dloss/dw = 4. The gradient is the slope of the loss at the current w, and computing it does not move w at all. Moving w is the optimizer's job, a separate step. backward needs a scalar to start from, because the chain rule starts with dL/dL = 1. A vector output raises an error unless you reduce it first with sum or mean. Drag w and watch the tangent, the gradient and the step that would follow.`,
eq: String.raw`\[ L(w) = (w - 1)^2, \qquad \frac{dL}{dw} = 2(w - 1), \qquad w_{\text{new}} = w - \alpha \frac{dL}{dw} \]`,
sym: [["loss", "a scalar, shape ()"], ["backward()", "fills w.grad with dL/dw"], ["w.grad", "the slope at the current w"], ["w", "unchanged by backward"], ["scalar rule", "a non-scalar output needs .sum() or .mean() first"]],
how: ["Build the loss as a scalar.", "Call <code>loss.backward()</code>.", "Read <code>w.grad</code> and compare with the hand derivative.", "Notice that w has not moved.", "Move it with an explicit update or an optimizer step, cards 7 and 9."],
say: String.raw`backward on a scalar loss stores the slope of the loss with respect to each leaf in its grad attribute and does not change the leaf itself, the update is a separate step.`,
num: String.raw`HW10: w = <b>3</b>, loss = <b>4</b>, w.grad = <b>4</b>. One step with α = 0.1 would give w = 3 − 0.4 = <b>2.6</b>. <code>(q * 2).backward()</code> on a vector raises <i>grad can be implicitly created only for scalar outputs</i>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g3w", "w", -1, 3, 0.25, 3) + `<div id="g3r"></div>`;
  const u = () => {
    const w = +$("g3w").value; $("g3wv").textContent = w;
    const L = (w - 1) ** 2, g = 2 * (w - 1), wn = w - 0.1 * g;
    const a = ML.axes(70, 20, 360, 250, { xmin: -1, xmax: 3, ymin: 0, ymax: 4.5, nx: 4, ny: 3, xl: "w", yl: "loss", fx: v => v, fy: v => v.toFixed(1) });
    let s = a.s + ML.path(Array.from({ length: 81 }, (_, i) => { const x = -1 + i / 20; return [a.X(x), a.Y((x - 1) ** 2)]; }), C.blue, 2.2);
    const t0 = w - 0.8, t1 = w + 0.8;
    s += ML.path([[a.X(t0), a.Y(L + g * (t0 - w))], [a.X(t1), a.Y(L + g * (t1 - w))]].map(p => [p[0], Math.max(20, Math.min(270, p[1]))]), C.coral, 2, "5 4");
    s += `<circle cx="${a.X(w)}" cy="${a.Y(L)}" r="6" fill="${C.coral}"/>`;
    if (Math.abs(g) > 1e-9) s += `<circle cx="${a.X(wn)}" cy="${a.Y((wn - 1) ** 2)}" r="5" fill="none" stroke="${C.teal}" stroke-width="2"/>` + tx(a.X(wn), a.Y((wn - 1) ** 2) - 10, "after a step", "middle");
    s += tx(460, 50, `w = ${fm(w, 2)}`, null, "th") + tx(460, 76, `loss = ${fm(L, 4)}`, null, "t") + tx(460, 100, `w.grad = 2(w − 1) = ${fm(g, 2)}`, null, "t") + tx(460, 130, "after backward: w is still " + fm(w, 2), null) + tx(460, 160, `step, α = 0.1: w → ${fm(wn, 2)}`, null, "t");
    s += tx(460, 200, g > 0 ? "slope positive: step left" : g < 0 ? "slope negative: step right" : "slope zero: the minimum", null, "th");
    fig.innerHTML = svg(310, s) + ML.code(["w = torch.tensor(" + w + ", requires_grad=True)", "loss = (w - 1) ** 2", "loss.backward()", "print(w.item(), loss.item(), w.grad.item())"], 2) + ML.term([`${Number.isInteger(w) ? w.toFixed(1) : w} ${fm(L, 4)} ${fm(g, 4)}`.replace(/−/g, "-")]);
  };
  $("g3w").oninput = u; u();
}},

{s: "4. Local rules", t: "Each gate has a simple local rule: add distributes, multiply swaps, max routes",
intu: String.raw`The CS231n notes give backprop a memorable shape. Every node only needs its own local derivative and the gradient arriving from above. An add gate passes the upstream gradient unchanged to both inputs. A multiply gate gives each input the upstream gradient times the other input, so it swaps them. A max gate sends the whole gradient to the larger input and nothing to the other, and ReLU is a max with 0. When one value feeds two places, the gradients from both places add. Pick a gate, change the inputs and watch where the upstream gradient of 2 goes.`,
eq: String.raw`\[ \text{add: } \bar x = \bar y = g, \qquad \text{multiply: } \bar x = g\,y,\ \ \bar y = g\,x \]
\[ \text{max: } \bar x = g\,[x \gt y], \ \ \bar y = g\,[y \gt x] \]`,
sym: [["g", "upstream gradient, dL/d(output)"], ["add", "copies g to every input"], ["multiply", "each input gets g times the other input"], ["max, ReLU", "the winner gets g, the loser 0"], ["branch", "a value used twice receives the sum of both gradients"]],
how: ["Find the gate type.", "Write the upstream gradient g above its output.", "Apply the local rule to get each input's gradient.", "When a value has several outgoing edges, add the gradients that come back.", "Check one case with autograd when in doubt."],
say: String.raw`In backpropagation an add gate distributes the upstream gradient, a multiply gate scales it by the other input, a max gate routes it to the larger input, and a value used in several places sums the gradients from each use.`,
num: String.raw`With x = 3, y = −1 and g = 2: add gives (<b>2, 2</b>), multiply gives (<b>−2, 6</b>), max gives (<b>2, 0</b>), ReLU at an input of −1 gives <b>0</b>, and x used twice in x·x gets 2 × 3 + 2 × 3 = <b>12</b>.`,
r(fig, ctl) {
  let v = 1;
  const G = [["add x + y", (x, y) => x + y, (g, x, y) => [g, g]], ["multiply x · y", (x, y) => x * y, (g, x, y) => [g * y, g * x]], ["max(x, y)", (x, y) => Math.max(x, y), (g, x, y) => x > y ? [g, 0] : x < y ? [0, g] : [g / 2, g / 2]], ["ReLU(x)", x => Math.max(0, x), (g, x) => [x > 0 ? g : 0]], ["branch x · x", x => x * x, (g, x) => [g * x + g * x]]];
  ctl.innerHTML = btns(G.map((q, i) => [i, q[0]]), "g4") + sl("g4x", "x", -3, 3, 1, 3) + sl("g4y", "y", -3, 3, 1, -1);
  const u = () => {
    pick(ctl, "g4", v); const x = +$("g4x").value, y = +$("g4y").value, g = 2; $("g4xv").textContent = x; $("g4yv").textContent = y;
    const [name, fwd, bwd] = G[v], one = v >= 3, out = one ? fwd(x) : fwd(x, y), gr = one ? bwd(g, x) : bwd(g, x, y);
    let s = node(350, 140, 140, name, "= " + fm(out, 0), "c-purple", true);
    s += arrow(420, 140, 560, 140, "var(--p)", 1.5) + tx(490, 128, "out " + fm(out, 0), "middle", "t") + tx(490, 166, "grad g = 2", "middle", "th");
    if (v === 4) { s += node(110, 140, 80, "x", "= " + x, "c-blue") + `<path d="M150 130 C 220 90, 250 110, 280 128" fill="none" stroke="var(--p)" stroke-width="1.2" marker-end="url(#ar)"/><path d="M150 150 C 220 190, 250 170, 280 152" fill="none" stroke="var(--p)" stroke-width="1.2" marker-end="url(#ar)"/>` + tx(215, 92, "use 1: g·x = " + fm(g * x, 0), "middle", "t") + tx(215, 200, "use 2: g·x = " + fm(g * x, 0), "middle", "t") + tx(110, 196, "x.grad = " + fm(gr[0], 0), "middle", "th"); }
    else {
      const ins = one ? [["x", x, 140]] : [["x", x, 90], ["y", y, 190]];
      ins.forEach(([n, val, yy], i) => { s += node(110, yy, 80, n, "= " + val, "c-blue") + arrow(150, yy, 278, 140 + (yy - 140) * 0.3, "var(--p)", 1.2); s += `<g class="c-coral"><rect x="70" y="${yy + 26}" width="80" height="22" rx="6" stroke-width="0.8"/></g>` + tx(110, yy + 41, "grad " + fm(gr[i], 0), "middle", "t"); });
    }
    const rule = ["add: both inputs receive g", "multiply: each input receives g times the other", "max: the larger input receives g", "ReLU: g passes if x > 0, else 0", "branch: the two gradients add"][v];
    s += tx(30, 260, rule, null, "th");
    fig.innerHTML = svg(280, s);
  };
  ctl.querySelectorAll("button[data-g4]").forEach(b => b.onclick = () => { v = +b.dataset.g4; u(); });
  $("g4x").oninput = u; $("g4y").oninput = u; u();
}},

{s: "5. Gradients accumulate", t: "backward adds into .grad, so clear it before every step",
intu: String.raw`backward does not overwrite <code>.grad</code>, it adds to it. That is a design choice: a value used in two places needs its gradients summed, card 4, and the same mechanism lets you add the gradients of several small batches before one update. The price is that a training loop must clear the gradients before each backward, which is what <code>optimizer.zero_grad()</code> does, HW6's bug B when it is missing. A second rule: the graph is freed after backward, so calling backward twice on the same loss raises an error. Build a new loss each iteration. Step through three iterations with and without clearing.`,
eq: String.raw`\[ \texttt{x.grad} \leftarrow \texttt{x.grad} + \frac{\partial L}{\partial x} \]`,
sym: [["accumulate", "backward adds to whatever is in .grad"], [String.raw`\(\texttt{zero\_grad()}\)`, "sets every parameter's .grad to None, the default since PyTorch 2.0"], [String.raw`\(\texttt{x.grad = None}\)`, "the same by hand"], ["graph freed", "a second backward on one graph raises unless <code>retain_graph=True</code>"], ["accumulation steps", "sum gradients of k micro-batches, scale each loss by 1/k"]],
how: ["Clear gradients at the start of every step.", "Build a fresh loss inside the loop, never reuse one across iterations.", "To imitate a large batch with small ones, divide each loss by the number of micro-batches.", "Step once after the micro-batches, then clear.", "If a gradient looks k times too large, look for a missing clear."],
say: String.raw`backward adds the new gradient into the grad attribute, so a training loop clears the gradients before every step, and deliberate accumulation over micro-batches scales each loss by one over their number.`,
num: String.raw`L = x² at x = 2 three times without clearing: x.grad = <b>4, 8, 12</b>. With clearing: <b>4, 4, 4</b>. Four points in two halves of 2: the full-batch gradient <b>−7.5</b>, two unscaled halves add to −15, halves scaled by ½ give <b>−7.5</b>.`,
r(fig, ctl) {
  let mode = 0;
  ctl.innerHTML = btns([[0, "without clearing"], [1, "x.grad = None each time"], [2, "two micro-batches"]], "g5") + `<div id="g5s"></div>`;
  const run = () => {
    pick(ctl, "g5", mode); $("g5s").innerHTML = "";
    if (mode === 2) {
      const rows = [["full batch of 4, mean MSE", "−7.5", "the gradient you want"], ["half 1 + half 2, each a mean", "−2.5 + (−12.5) = −15", "twice too large"], ["half 1 / 2 + half 2 / 2", "−1.25 + (−6.25) = −7.5", "equal to the full batch"]];
      let s = tx(30, 24, "X = (0, 1, 2, 3), y = (1, 3, 2, 5), w = 0.5, loss = mean((wX − y)²)", null, "th");
      rows.forEach((r, i) => s += `<rect x="20" y="${44 + i * 54}" width="640" height="44" rx="7" fill="${i === 1 ? "var(--coral-bg)" : "var(--teal-bg)"}"/>` + tx(34, 64 + i * 54, r[0], null, "t") + tx(34, 82 + i * 54, r[2], null) + tx(640, 72 + i * 54, "w.grad = " + r[1], "end", "th"));
      fig.innerHTML = svg(214, s) + ML.code(["optimizer.zero_grad()", "for xb, yb in [(X[:2], y[:2]), (X[2:], y[2:])]:", "    loss = ((w * xb - yb) ** 2).mean() / 2   # 2 micro-batches", "    loss.backward()                          # adds into w.grad", "optimizer.step()"], 2);
      return;
    }
    ML.stepper($("g5s"), 4, k => {
      const gs = [], cur = mode ? 4 : 4 * k;
      for (let i = 1; i <= k; i++) gs.push(mode ? 4 : 4 * i);
      let s = tx(30, 24, k === 0 ? "x = 2, x.grad is None" : `after iteration ${k}: x.grad = ${cur}`, null, "th");
      const a = ML.axes(70, 44, 300, 200, { xmin: 0, xmax: 3, ymin: 0, ymax: 12, nx: 3, ny: 3, xl: "iteration", yl: "x.grad", fx: v => v, fy: v => v });
      s += a.s + gs.map((g, i) => `<rect x="${a.X(i + 1) - 18}" y="${a.Y(g)}" width="36" height="${a.Y(0) - a.Y(g)}" fill="${mode ? C.teal : C.coral}" opacity="0.8"/>` + tx(a.X(i + 1), a.Y(g) - 6, g, "middle", "t")).join("");
      s += tx(410, 80, "true dL/dx at x = 2 is 2x = 4", null, "t") + tx(410, 106, mode ? "cleared every time: 4 each time" : "added every time: 4, 8, 12", null, "t") + tx(410, 140, mode ? "an update would use the right slope" : "an update would use 3 × the slope", null, "th");
      fig.innerHTML = svg(290, s) + ML.code(["x = torch.tensor(2.0, requires_grad=True)", "for it in range(3):", mode ? "    x.grad = None" : "    pass                       # no clearing", "    loss = x ** 2              # a fresh graph each time", "    loss.backward()", "    print(x.grad.item())"], k ? 4 : 0);
    }, ["start", "iteration 1", "iteration 2", "iteration 3"]);
  };
  ctl.querySelectorAll("button[data-g5]").forEach(b => b.onclick = () => { mode = +b.dataset.g5; run(); }); run();
}},

{s: "6. Check autograd", t: "Autograd, the hand formula and a finite difference agree",
intu: String.raw`Trust, then verify. For a line ŷ = wx + b and the PyTorch mean squared error, Lesson 16 derived ∂L/∂w = (2/N) Σ eᵢxᵢ and ∂L/∂b = (2/N) Σ eᵢ with eᵢ = ŷᵢ − yᵢ. Autograd must return the same numbers, and a central difference in float64 must agree with both to about six digits, the gradient check of Lesson 13. Move w and b. The three columns move together, and the bars show how each data point contributes to ∂L/∂w. A check like this belongs in the tests of any loss you write yourself, HW7 2.1 compares a hand-written Huber loss with PyTorch's through backward.`,
eq: String.raw`\[ \frac{\partial L}{\partial w} = \frac{2}{N}\sum_i e_i x_i, \qquad \frac{\partial L}{\partial w} \approx \frac{L(w + h) - L(w - h)}{2h} \]`,
sym: [[String.raw`\(e_i\)`, "error of sample i, ŷᵢ − yᵢ"], ["N", "5 samples"], ["h", "1e-6, in float64"], ["central difference", "error of order h², far better than a one-sided difference"], ["gradcheck", "torch.autograd.gradcheck automates this in float64"]],
how: ["Compute the loss and call backward.", "Compute the hand formula with the same tensors.", "Compute the central difference in float64.", "Compare with a relative tolerance, about 1e-5 in float64.", "Put the check in a test for every custom loss or layer."],
say: String.raw`Autograd returns the same gradient as the hand derivation, and a central finite difference in float64 confirms both, which is how a custom loss or layer is tested.`,
num: String.raw`Data x = 0 to 4, y = (1.2, 2.8, 5.1, 7.0, 8.9). At w = b = 0: loss <b>32.70</b>, ∂L/∂w = <b>−27.84</b>, ∂L/∂b = <b>−10.0</b> from autograd, the formula and the finite difference. The minimum is at w = <b>1.96</b>, b = <b>1.08</b> with loss 0.0168.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g6w", "w", -1, 3, 0.1, 0) + sl("g6b", "b", -1, 3, 0.1, 0) + `<div id="g6r"></div>`;
  const u = () => {
    const w = +$("g6w").value, b = +$("g6b").value; $("g6wv").textContent = w.toFixed(1); $("g6bv").textContent = b.toFixed(1);
    const [gw, gb] = grad(w, b), h = 1e-6, fw = (mse(w + h, b) - mse(w - h, b)) / (2 * h), fb = (mse(w, b + h) - mse(w, b - h)) / (2 * h);
    const a = ML.axes(60, 20, 250, 200, { xmin: -0.5, xmax: 4.5, ymin: -2, ymax: 12, nx: 5, ny: 7, xl: "x", yl: "y", fx: v => v, fy: v => v });
    let s = a.s + ML.path([[a.X(-0.5), a.Y(b - 0.5 * w)], [a.X(4.5), a.Y(b + 4.5 * w)]].map(p => [p[0], Math.max(20, Math.min(220, p[1]))]), C.blue, 2);
    XS.forEach((x, i) => { const yh = w * x + b; s += `<line x1="${a.X(x)}" y1="${a.Y(YS[i])}" x2="${a.X(x)}" y2="${Math.max(20, Math.min(220, a.Y(yh)))}" stroke="${C.coral}" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="${a.X(x)}" cy="${a.Y(YS[i])}" r="4.5" fill="${C.coral}"/>`; });
    const contrib = XS.map((x, i) => 2 * (w * x + b - YS[i]) * x / N), mx = Math.max(1, ...contrib.map(Math.abs));
    s += tx(360, 30, "contribution of each point to ∂L/∂w", null, "th");
    contrib.forEach((c, i) => { const y = 50 + i * 26, wd = 120 * Math.abs(c) / mx; s += tx(370, y + 13, "x = " + XS[i], null) + `<rect x="${c < 0 ? 520 - wd : 520}" y="${y}" width="${wd}" height="18" fill="${c < 0 ? C.purple : C.teal}" opacity="0.8"/>` + tx(660, y + 13, fm(c, 2), "end", "t"); });
    s += `<line x1="520" y1="46" x2="520" y2="178" stroke="var(--p)"/>`;
    const rows = [["", "∂L/∂w", "∂L/∂b"], ["hand formula", fm(gw, 4), fm(gb, 4)], ["autograd", fm(gw, 4), fm(gb, 4)], ["central difference", fm(fw, 4), fm(fb, 4)]];
    rows.forEach((r, i) => s += tx(60, 276 + i * 22, r[0], null, i ? "t" : "th") + tx(260, 276 + i * 22, r[1], "end", i ? "t" : "th") + tx(360, 276 + i * 22, r[2], "end", i ? "t" : "th"));
    s += tx(400, 298, `loss = ${fm(mse(w, b), 4)}`, null, "th") + tx(400, 320, `|formula − difference| = ${Math.max(Math.abs(gw - fw), Math.abs(gb - fb)).toExponential(1)}`, null);
    fig.innerHTML = svg(354, s);
  };
  $("g6w").oninput = u; $("g6b").oninput = u; u();
}},

{s: "7. no_grad and eval", t: "Turn recording off for updates and evaluation, and know what eval does not do",
intu: String.raw`Recording costs memory, because every saved input of every node is kept until backward. Inside <code>with torch.no_grad():</code> operations are not recorded, results have no <code>grad_fn</code>, and memory stays flat. You need it in two places. The parameter update itself must not be recorded, and PyTorch refuses an in-place update of a leaf that requires gradients outside it. Evaluation should not build a graph either, HW5 2c measures validation loss under <code>no_grad</code>, HW9 uses <code>inference_mode</code>, a stricter and faster version. And a trap HW10 spells out: <code>model.eval()</code> only switches layers such as dropout and BatchNorm to evaluation behavior. It does not disable autograd.`,
eq: String.raw`\[ \texttt{with torch.no\_grad(): w -= lr * w.grad} \]`,
sym: [[String.raw`\(\texttt{no\_grad}\)`, "no recording inside the block, results do not require gradients"], [String.raw`\(\texttt{inference\_mode}\)`, "like <code>no_grad</code>, faster, results can never enter a graph later"], ["model.eval()", "dropout off, BatchNorm uses running statistics, autograd still on"], ["model.train()", "back to training behavior"], ["in-place leaf update", "raises outside <code>no_grad</code>"]],
how: ["Wrap a manual update in <code>torch.no_grad()</code>.", "Evaluate with <code>model.eval()</code> and <code>torch.no_grad()</code> together.", "Switch back with <code>model.train()</code> before the next epoch.", "Use <code>inference_mode</code> for pure prediction code.", "Never call backward on something computed under <code>no_grad</code>, there is no graph."],
say: String.raw`The no grad context stops autograd from recording so updates and evaluation build no graph, inference mode is a stricter faster version, and model eval only changes layer behavior and does not turn autograd off.`,
num: String.raw`w = 2, x = 3: <code>w * x</code> has <code>grad_fn</code> <b>MulBackward0</b>, under <code>no_grad</code> it has <b>None</b>. <code>w -= 0.1 * w.grad</code> outside <code>no_grad</code> raises <i>a leaf Variable that requires grad is being used in an in-place operation</i>. After <code>model.eval()</code> an output still has <code>requires_grad</code> <b>True</b>.`,
r(fig, ctl) {
  const M = [
    ["default grad mode", ["y = w * x"], "True", "MulBackward0", "a graph is recorded, backward possible"],
    ["torch.no_grad()", ["with torch.no_grad():", "    y = w * x"], "False", "None", "nothing recorded, no memory for saved inputs"],
    ["torch.inference_mode()", ["with torch.inference_mode():", "    y = w * x"], "False", "None", "an inference tensor, it can never join a graph"],
    ["model.eval() only", ["model.eval()", "y = model(xb)"], "True", "AddmmBackward0", "eval changed dropout and BatchNorm, autograd still records"],
    ["update without no_grad", ["loss.backward()", "w -= 0.1 * w.grad"], "error", "", "RuntimeError: a leaf Variable that requires grad is being used in an in-place operation."],
    ["update under no_grad", ["loss.backward()", "with torch.no_grad():", "    w -= 0.1 * w.grad", "w.grad = None"], "True", "None", "w is still a leaf that requires grad, now with a new value"]
  ];
  let v = 0;
  ctl.innerHTML = btns(M.map((m, i) => [i, m[0]]), "g7");
  const u = () => {
    pick(ctl, "g7", v); const [name, code, rq, fn, note] = M[v], err = rq === "error";
    let s = tx(30, 24, name, null, "th");
    s += `<g class="${err ? "c-coral" : v === 0 || v === 3 ? "c-purple" : "c-teal"}"><rect x="30" y="40" width="300" height="110" rx="10" stroke-width="0.8"/></g>`;
    s += tx(180, 70, v >= 4 ? "w after the update" : "the result y", "middle", "th") + tx(180, 98, err ? "no update, an exception" : "requires_grad = " + rq, "middle", "t") + tx(180, 122, err ? "" : "grad_fn = " + fn, "middle", "t");
    s += tx(360, 70, v === 3 ? "eval is about layers, not about autograd" : v === 1 || v === 2 ? "use for validation and prediction" : v >= 4 ? "the update must not be recorded" : "use for the training forward pass", null, "t");
    fig.innerHTML = svg(170, s) + ML.code(["w = torch.tensor(2.0, requires_grad=True); x = torch.tensor(3.0)"].concat(code), code.length) + (err ? ML.term([note]) : `<p class="note">${note}</p>`);
  };
  ctl.querySelectorAll("button[data-g7]").forEach(b => b.onclick = () => { v = +b.dataset.g7; u(); }); u();
}},

{s: "8. detach", t: "detach cuts a path: the value stays, the gradient through it is gone",
intu: String.raw`<code>z.detach()</code> returns a tensor with the same numbers and the same storage but no history, so gradients do not flow back through it. Take L = z·x with z = x·y. Through both paths dL/dx = 2xy, since L = x²y. Detach z and the path through z is cut: z is treated as a constant and dL/dx = z, while y receives no gradient at all. You detach on purpose when a value must act as a fixed target, when you log or plot a tensor, and on the way to NumPy, HW4 Part 3. <code>loss.item()</code> is the safe way to record a loss, a Python number with no graph attached.`,
eq: String.raw`\[ L = (xy)\,x: \ \frac{\partial L}{\partial x} = 2xy, \qquad L = \text{const}(xy)\,x: \ \frac{\partial L}{\partial x} = xy \]`,
sym: [["detach()", "same values and storage, no <code>grad_fn</code>, <code>requires_grad</code> False"], ["cut path", "no gradient flows back through the detached tensor"], ["item()", "a Python float, for logging losses"], ["stop-gradient", "the general name for detach in other libraries"], ["accumulating losses", "<code>total += loss.item()</code>, never <code>total += loss</code>"]],
how: ["Decide which paths should carry gradient.", "Detach a tensor that must act as a constant.", "Log losses with <code>loss.item()</code> so the graph is freed.", "Use <code>.detach().cpu().numpy()</code> before plotting.", "Check the effect: the detached input's leaves get no gradient from that path."],
say: String.raw`detach returns the same values without history, so gradients stop at it, and it is used for fixed targets, for logging and plotting, and before converting to NumPy.`,
num: String.raw`x = 2, y = 3: L = z·x = <b>12</b>. Without detach x.grad = 2xy = <b>12</b> and y.grad = x² = <b>4</b>. With <code>z.detach()</code>: x.grad = z = <b>6</b> and y.grad is <b>None</b>.`,
r(fig, ctl) {
  let d = false;
  ctl.innerHTML = btns([[0, "L = z * x"], [1, "L = z.detach() * x"]], "g8");
  const u = () => {
    pick(ctl, "g8", d ? 1 : 0);
    let s = node(90, 70, 80, "x", "= 2", "c-blue") + node(90, 200, 80, "y", "= 3", "c-blue") + node(300, 140, 110, "z = x·y", "= 6", "c-purple") + node(530, 100, 110, "L = z·x", "= 12", "c-purple", true);
    s += arrow(132, 76, 243, 130, "var(--p)", 1.2) + arrow(132, 196, 243, 150, "var(--p)", 1.2) + arrow(132, 66, 472, 92, "var(--p)", 1.2);
    s += d ? `<line x1="357" y1="136" x2="472" y2="108" stroke="var(--p)" stroke-width="1.2" stroke-dasharray="5 4"/>` + `<g transform="translate(414 122)"><line x1="-9" y1="-9" x2="9" y2="9" stroke="${C.coral}" stroke-width="3"/><line x1="-9" y1="9" x2="9" y2="-9" stroke="${C.coral}" stroke-width="3"/></g>` + tx(414, 160, "cut", "middle", "th") : arrow(357, 136, 472, 108, "var(--p)", 1.2);
    s += `<g class="c-coral"><rect x="40" y="100" width="110" height="22" rx="6" stroke-width="0.8"/></g>` + tx(95, 115, "x.grad " + (d ? 6 : 12), "middle", "t");
    s += `<g class="c-coral"><rect x="40" y="230" width="110" height="22" rx="6" stroke-width="0.8"/></g>` + tx(95, 245, "y.grad " + (d ? "None" : 4), "middle", "t");
    s += tx(300, 230, d ? "x gets only the direct path: z = 6" : "x gets z = 6 directly plus y·x = 6 through z", null) + tx(300, 250, d ? "y is reached only through z, so nothing" : "y gets x · x = 4 through z", null);
    fig.innerHTML = svg(270, s) + ML.code(["x = torch.tensor(2.0, requires_grad=True); y = torch.tensor(3.0, requires_grad=True)", "z = x * y", d ? "L = z.detach() * x" : "L = z * x", "L.backward()", "print(x.grad, y.grad)"], 2) + ML.term([d ? "tensor(6.) None" : "tensor(12.) tensor(4.)"]);
  };
  ctl.querySelectorAll("button[data-g8]").forEach(b => b.onclick = () => { d = b.dataset.g8 === "1"; u(); }); u();
}},

{s: "9. A manual loop", t: "Gradient descent with autograd: forward, loss, backward, update, clear",
intu: String.raw`This is Lesson 16's loop with autograd doing the derivative. Each iteration builds the loss from w and b, calls backward, updates the parameters under <code>no_grad</code> and clears the gradients. On the five points of card 6 the curvature matrix of the MSE has eigenvalues 13.40 and 0.60, so the learning rate must stay below 2/13.40 = 0.149. Try the rates and the iteration count. Then switch off the clearing: the gradients pile up, every update uses the sum of all past slopes, and the fit wanders like a ball with momentum and no friction.`,
eq: String.raw`\[ L = \frac{1}{N}\sum_i (w x_i + b - y_i)^2, \qquad (w, b) \leftarrow (w, b) - \alpha\,\nabla L \]`,
sym: [[String.raw`\(\alpha\)`, "learning rate"], ["curvature", "eigenvalues 13.40 and 0.60 of the MSE Hessian here"], ["edge", "α below 0.149"], ["clear", "<code>w.grad = None</code> after each update"], ["optimizer", "torch.optim.SGD does the update and the clearing for you, Lesson 24"]],
how: ["Create w and b with <code>requires_grad=True</code>.", "Forward and loss as tensors.", "<code>loss.backward()</code>.", "Update both under <code>torch.no_grad()</code>.", "Clear both gradients, then record <code>loss.item()</code>."],
say: String.raw`A manual autograd loop computes the loss, calls backward, updates the parameters under no grad and clears the gradients, and without the clearing each update uses the sum of all earlier gradients.`,
num: String.raw`200 iterations from (0, 0): α = 0.01 gives (w, b) = (<b>1.997, 0.974</b>), loss 0.0205. α = 0.05 gives (<b>1.960, 1.079</b>), loss 0.0168, the minimum. α = 0.15 diverges. α = 0.05 without clearing ends at loss <b>28.80</b>.`,
r(fig, ctl) {
  const R = [0.01, 0.05, 0.1, 0.14, 0.15];
  let lr = 0.05, clr = true;
  ctl.innerHTML = btns(R.map(r => [r, "α = " + r]), "g9") + btns([[1, "clear gradients"], [0, "forget to clear"]], "g9c") + sl("g9n", "iterations", 0, 200, 1, 200) + `<div id="g9r"></div>`;
  const run = n => { let w = 0, b = 0, gw = 0, gb = 0; const H = [mse(0, 0)], P = [[0, 0]]; for (let t = 0; t < n; t++) { const [dw, db] = grad(w, b); gw = clr ? dw : gw + dw; gb = clr ? db : gb + db; w -= lr * gw; b -= lr * gb; H.push(mse(w, b)); P.push([w, b]); } return { w, b, H }; };
  const u = () => {
    pick(ctl, "g9", lr); pick(ctl, "g9c", clr ? 1 : 0);
    const n = +$("g9n").value; $("g9nv").textContent = n;
    const r = run(n), ok = isFinite(r.w) && Math.abs(r.w) < 1e6;
    const a = ML.axes(60, 20, 250, 200, { xmin: -0.5, xmax: 4.5, ymin: -2, ymax: 12, nx: 5, ny: 7, xl: "x", yl: "y", fx: v => v, fy: v => v });
    let s = a.s + XS.map((x, i) => `<circle cx="${a.X(x)}" cy="${a.Y(YS[i])}" r="4.5" fill="${C.coral}"/>`).join("");
    if (ok) s += ML.path([[a.X(-0.5), a.Y(r.b - 0.5 * r.w)], [a.X(4.5), a.Y(r.b + 4.5 * r.w)]].map(p => [p[0], Math.max(20, Math.min(220, p[1]))]), C.blue, 2);
    const b2 = ML.axes(400, 20, 250, 200, { xmin: 0, xmax: 200, ymin: -2, ymax: 4, nx: 4, ny: 6, xl: "iteration", yl: "loss", fx: v => v, fy: v => "1e" + v });
    s += b2.s + ML.path(r.H.map((h, i) => [b2.X(i), b2.Y(Math.max(-2, Math.min(4, Math.log10(Math.max(h, 1e-9)))))]), clr ? C.teal : C.coral, 2);
    s += tx(60, 268, ok ? `w = ${fm(r.w, 4)}, b = ${fm(r.b, 4)}, loss = ${fm(r.H[n], 4)}` : "diverged: the parameters blew up", null, "th") + tx(60, 290, lr >= 0.149 ? "α is above 2/13.40 = 0.149" : clr ? "the minimum is w = 1.96, b = 1.08, loss 0.0168" : "each update uses the sum of every gradient so far", null);
    fig.innerHTML = svg(304, s) + ML.code(["w = torch.zeros((), requires_grad=True)", "b = torch.zeros((), requires_grad=True)", "for it in range(n):", "    loss = ((w * x + b - y) ** 2).mean()", "    loss.backward()", "    with torch.no_grad():", `        w -= ${lr} * w.grad; b -= ${lr} * b.grad`, clr ? "    w.grad = None; b.grad = None" : "    # gradients never cleared"], 7);
  };
  ctl.querySelectorAll("button[data-g9]").forEach(b => b.onclick = () => { lr = +b.dataset.g9; u(); });
  ctl.querySelectorAll("button[data-g9c]").forEach(b => b.onclick = () => { clr = b.dataset.g9c === "1"; u(); });
  $("g9n").oninput = u; u();
}},

{s: "10. Kinks and traps", t: "What autograd returns where the derivative does not exist",
intu: String.raw`Many functions in ML have kinks. At a kink there is no derivative, so PyTorch picks a value by convention: |x| and ReLU return 0 at x = 0, which is why HW7 2.2 prints an L1 derivative of 0 at a residual of exactly zero. When several entries tie for the maximum, the gradient is shared equally among them. At the edge of a domain the slope is infinite, so sqrt and log at 0 return inf. The nastiest trap is <code>torch.where</code>: both branches are computed, and a nan in the branch you did not select still poisons the gradient through 0 × nan = nan. The fix is to make the unused branch safe before the function is applied. Pick a case.`,
eq: String.raw`\[ \frac{d}{dx}|x|\Big|_{x=0} := 0, \qquad \frac{d}{dx}\sqrt{x}\Big|_{x=0} = \infty, \qquad 0 \times \text{nan} = \text{nan} \]`,
sym: [["kink", "a point where the slope changes suddenly"], ["subgradient", "PyTorch picks 0 for abs and ReLU at 0"], ["ties", "max shares the gradient equally among tied entries"], ["domain edge", "sqrt and log at 0 give an infinite gradient"], ["where trap", "a nan in the unused branch still reaches the gradient"]],
how: ["Look for abs, ReLU, max, sqrt, log and division in a loss.", "Add a small epsilon inside sqrt and log, for example <code>torch.sqrt(x + 1e-12)</code>.", "With torch.where, clamp or replace the input before the risky function.", "Assert <code>torch.isfinite(p.grad).all()</code> while debugging.", "Turn on <code>torch.autograd.set_detect_anomaly(True)</code> to find the first nan."],
say: String.raw`At kinks PyTorch returns a conventional subgradient, zero for abs and ReLU at zero, ties share the gradient, domain edges give infinite gradients, and torch where passes a nan from the unused branch into the gradient.`,
num: String.raw`At x = 0: abs and ReLU give grad <b>0</b>, sqrt gives <b>inf</b>, log gives <b>inf</b>. max of (1, 3, 3) gives (<b>0, 0.5, 0.5</b>). <code>torch.where(x > 0, torch.sqrt(x), 0)</code> at x = (−1, 4) gives grad (<b>nan</b>, 0.25), the safe version gives (<b>0</b>, 0.25).`,
r(fig, ctl) {
  const F = [["abs", x => Math.abs(x), x => x > 0 ? 1 : x < 0 ? -1 : 0], ["ReLU", x => Math.max(0, x), x => x > 0 ? 1 : 0], ["sqrt", x => x < 0 ? NaN : Math.sqrt(x), x => x < 0 ? NaN : x === 0 ? Infinity : 0.5 / Math.sqrt(x)], ["log", x => x < 0 ? NaN : x === 0 ? -Infinity : Math.log(x), x => x < 0 ? NaN : x === 0 ? Infinity : 1 / x]];
  let v = 0;
  ctl.innerHTML = btns(F.map((q, i) => [i, q[0]]).concat([[4, "max with ties"], [5, "torch.where trap"]]), "g10") + sl("g10x", "x", -2, 2, 0.25, 0) + `<div id="g10r"></div>`;
  const u = () => {
    pick(ctl, "g10", v); const x = +$("g10x").value; $("g10xv").textContent = x;
    if (v === 4) {
      let s = tx(30, 24, "x = (1, 3, 3), loss = x.max()", null, "th");
      [1, 3, 3].forEach((q, i) => s += node(150 + i * 150, 90, 110, "x[" + i + "] = " + q, "grad " + [0, 0.5, 0.5][i], i ? "c-teal" : "c-gray"));
      s += tx(30, 160, "the two tied maxima share the upstream gradient 1", null);
      fig.innerHTML = svg(180, s); $("g10r").innerHTML = ""; return;
    }
    if (v === 5) {
      let s = tx(30, 24, "x = (−1, 4), y = torch.where(x > 0, torch.sqrt(x), 0), loss = y.sum()", null, "th");
      s += node(150, 90, 140, "x = −1", "sqrt gives nan", "c-coral") + node(450, 90, 140, "x = 4", "sqrt gives 2", "c-teal");
      s += tx(150, 140, "selected branch: 0", "middle", "t") + tx(150, 160, "grad = 0 × nan = nan", "middle", "th") + tx(450, 140, "selected branch: sqrt", "middle", "t") + tx(450, 160, "grad = 1/(2·2) = 0.25", "middle", "th");
      fig.innerHTML = svg(180, s) + ML.code(["y = torch.where(x > 0, torch.sqrt(x), torch.zeros_like(x))          # grad (nan, 0.25)", "safe = torch.where(x > 0, x, torch.ones_like(x))                    # no negative input", "y = torch.where(x > 0, torch.sqrt(safe), torch.zeros_like(x))       # grad (0, 0.25)"], 0);
      $("g10r").innerHTML = ""; return;
    }
    const [name, fn, df] = F[v];
    const a = ML.axes(60, 20, 260, 220, { xmin: -2, xmax: 2, ymin: -2, ymax: 2, nx: 4, ny: 4, xl: "x", yl: name + "(x)", fx: q => q, fy: q => q });
    const pts = []; for (let i = 0; i <= 200; i++) { const q = -2 + i / 50, yv = fn(q); if (isFinite(yv) && yv > -2.2 && yv < 2.2) pts.push([a.X(q), a.Y(yv)]); }
    let s = a.s + ML.path(pts, C.blue, 2.2);
    const b = ML.axes(400, 20, 260, 220, { xmin: -2, xmax: 2, ymin: -2, ymax: 2, nx: 4, ny: 4, xl: "x", yl: "grad", fx: q => q, fy: q => q });
    const gp = []; for (let i = 0; i <= 200; i++) { const q = -2 + i / 50, gv = df(q); if (isFinite(gv) && Math.abs(gv) < 2.2 && q !== 0) gp.push([b.X(q), b.Y(gv)]); }
    s += b.s + gp.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.1" fill="${C.teal}"/>`).join("");
    const yv = fn(x), gv = df(x);
    if (isFinite(yv) && Math.abs(yv) <= 2) s += `<circle cx="${a.X(x)}" cy="${a.Y(yv)}" r="6" fill="${C.coral}"/>`;
    if (isFinite(gv) && Math.abs(gv) <= 2) s += `<circle cx="${b.X(x)}" cy="${b.Y(gv)}" r="6" fill="${C.coral}"/>`;
    s += tx(60, 300, `${name}(${x}) = ${fm(yv, 4)}`, null, "th") + tx(400, 300, `autograd: x.grad = ${fm(gv, 4)}`, null, "th");
    fig.innerHTML = svg(314, s);
    $("g10r").innerHTML = ML.readout([["at x = 0 PyTorch returns", fm(df(0), 0)], ["why", v < 2 ? "a convention at the kink" : "the slope is infinite at the edge"]]);
  };
  ctl.querySelectorAll("button[data-g10]").forEach(b => b.onclick = () => { v = +b.dataset.g10; u(); });
  $("g10x").oninput = u; u();
}},

{s: "11. Through depth", t: "Local derivatives multiply, so depth can shrink or grow a gradient",
intu: String.raw`The chain rule multiplies one local derivative per layer. HW10 D1 makes the point with a scalar chain: each plain block computes h ← a·h, so after L blocks dh/dx = a to the power L, and with a = 0.1 and L = 8 that is 1e-8, the gradient has vanished. A residual block computes h ← h + a·h, its local derivative is 1 + a, and the same chain gives 1.1⁸ = 2.1436. A local derivative above 1 makes the plain chain explode instead. Move a and the depth and watch both curves on a log scale. Lessons 33, 34 and 37 come back to this with real layers.`,
eq: String.raw`\[ \text{plain: } \frac{dh_L}{dx} = a^L, \qquad \text{residual: } \frac{dh_L}{dx} = (1 + a)^L \]`,
sym: [["a", "local derivative of one plain block"], ["L", "number of blocks"], ["vanishing", "|a| below 1: the gradient shrinks like a power"], ["exploding", "|a| above 1: the gradient grows like a power"], ["residual", "the identity path adds 1 to every factor"]],
how: ["Write the local derivative of one block.", "Raise it to the number of blocks.", "Compare the result with 1: far below vanishes, far above explodes.", "Check it with autograd on a scalar chain, as HW10 D1 does.", "In real networks watch the gradient norm per layer, Lesson 33."],
say: String.raw`Through a chain of blocks the gradient is the product of the local derivatives, so it vanishes when they are below one and explodes when they are above one, and an identity shortcut adds one to each factor.`,
num: String.raw`HW10 D1, a = 0.1, L = 8: plain <b>1.0e-8</b>, residual <b>2.1436</b>. a = 0.5, L = 8: plain 0.0039, residual 25.63. a = 1.5, L = 10: plain 57.67, residual 9,537.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g11a", "a, local derivative", 0.05, 1.5, 0.05, 0.1) + sl("g11L", "depth L", 1, 30, 1, 8) + `<div id="g11r"></div>`;
  const u = () => {
    const a = +$("g11a").value, L = +$("g11L").value; $("g11av").textContent = a.toFixed(2); $("g11Lv").textContent = L;
    const ax = ML.axes(70, 20, 520, 240, { xmin: 0, xmax: 30, ymin: -12, ymax: 6, nx: 6, ny: 6, xl: "depth", yl: "dh/dx (log scale)", fx: q => q, fy: q => "1e" + q });
    const cl = q => Math.max(-12, Math.min(6, q));
    let s = ax.s + `<line x1="${ax.X(0)}" y1="${ax.Y(0)}" x2="${ax.X(30)}" y2="${ax.Y(0)}" stroke="var(--p)" stroke-dasharray="4 4"/>`;
    s += ML.path(Array.from({ length: 31 }, (_, l) => [ax.X(l), ax.Y(cl(l * Math.log10(a)))]), C.coral, 2.2) + ML.path(Array.from({ length: 31 }, (_, l) => [ax.X(l), ax.Y(cl(l * Math.log10(1 + a)))]), C.teal, 2.2);
    s += `<circle cx="${ax.X(L)}" cy="${ax.Y(cl(L * Math.log10(a)))}" r="5" fill="${C.coral}"/><circle cx="${ax.X(L)}" cy="${ax.Y(cl(L * Math.log10(1 + a)))}" r="5" fill="${C.teal}"/>`;
    s += tx(600, 40, "residual", null, "t") + `<line x1="600" y1="48" x2="650" y2="48" stroke="${C.teal}" stroke-width="3"/>` + tx(600, 70, "plain", null, "t") + `<line x1="600" y1="78" x2="650" y2="78" stroke="${C.coral}" stroke-width="3"/>`;
    const p = a ** L, r = (1 + a) ** L, e = q => q >= 1e5 || q < 1e-3 ? q.toExponential(2) : q.toFixed(4);
    fig.innerHTML = svg(300, s);
    $("g11r").innerHTML = ML.readout([["plain aᴸ", e(p)], ["residual (1 + a)ᴸ", e(r)], ["plain verdict", p < 1e-3 ? "vanished" : p > 1e3 ? "exploded" : "usable"]]);
  };
  $("g11a").oninput = u; $("g11L").oninput = u; u();
}},

{s: "12. With the agent", t: "Do it with the agent: gradient checks for your own code",
intu: String.raw`The lesson as reusable code: a function that compares autograd with a central difference for any scalar function of a tensor, a manual gradient descent loop that clears its gradients and updates under <code>no_grad</code>, and tests that pin this lesson's numbers. Every custom loss in HW7 onward, and every custom layer in the project, can then be checked in one line before you trust a training curve.`,
eq: String.raw`\[ \texttt{grad\_check} \to \texttt{fit\_line} \to \texttt{pytest} \]`,
sym: [["grad check", "autograd against a central difference, float64, relative tolerance"], ["fit line", "manual loop, returns the loss history"], ["tests", "the numbers of cards 1, 5, 6, 8, 9 and 11"], ["float64", "finite differences need the extra digits"], ["gradcheck", "torch.autograd.gradcheck as a second opinion"]],
how: ["Paste the command.", "Read <code>grad_check</code>: float64, central difference, both tolerances.", "Read <code>fit_line</code>: is the update under <code>no_grad</code> and are the gradients cleared?", "Run the tests and compare with the cards.", "Commit, then use <code>grad_check</code> on your next custom loss."],
say: String.raw`A gradient check module compares autograd with finite differences, and a tested manual loop proves that the update and the clearing of gradients are in the right place.`,
num: String.raw`Tests expect grads <b>(3, 9, −6)</b> for card 1, <b>(−27.84, −10.0)</b> at the origin for card 6, x.grad <b>6</b> with detach for card 8, w = <b>1.960</b> after 200 steps at 0.05 for card 9, and <b>2.1436</b> for the residual chain.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/autograd_tools.py with torch only. grad_check(f, x, h=1e-6, rtol=1e-5, atol=1e-7) takes a function returning a scalar tensor and a float tensor x, computes the autograd gradient of f at x.double().requires_grad_(), computes the central difference elementwise in float64, and returns (max_abs_error, ok). fit_line(x, y, lr, steps) runs manual gradient descent on w and b from zero with the mean squared error, updates under torch.no_grad(), sets w.grad and b.grad to None after every update, and returns w, b and a list of loss.item() values. chain_derivative(a, depth, residual) builds h = a*h or h = h + a*h on x = 1 and returns dh/dx from backward. Create tests/test_autograd_tools.py: J = 3*(a + b*c) at a=4, b=-2, c=3 gives grads 3, 9, -6; grad_check passes for the MSE of the line on x = [0,1,2,3,4], y = [1.2,2.8,5.1,7.0,8.9] at w = b = 0, where the gradient is (-27.84, -10.0); with z = x*y and L = z.detach()*x at x=2, y=3, x.grad is 6 and y.grad is None; fit_line with lr 0.05 and 200 steps ends near w = 1.9603, b = 1.0792; chain_derivative(0.1, 8, True) is close to 2.143589 and the plain chain is close to 1e-8. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".....                                                    [100%]", "5 passed in 0.88s"],
    files: [["src/autograd_tools.py", "grad_check, fit_line, chain_derivative"], ["tests/test_autograd_tools.py", "five tests with this lesson's numbers"]],
    checks: ["grad_check converts to float64 before both computations", "the update in fit_line is inside torch.no_grad()", "gradients are cleared after every update, the test at lr 0.05 would fail otherwise", "losses are recorded with .item(), not as tensors", "the detach test checks that y.grad is None, not zero"]
  });
}},

{s: "13. Test", t: "Lesson 22 test: autograd",
intu: String.raw`Twelve questions on graphs, the local rules, accumulation, <code>no_grad</code>, detach, kinks and depth. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Draw the graph for any question with a formula.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to nn.Module.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "<code>x = torch.tensor(2., requires_grad=True)</code>, <code>y = x ** 3 + 4 * x</code>, <code>y.backward()</code>. What is <code>x.grad</code>?", o: ["12", "16", "20", "8"], a: 1, why: "dy/dx = 3x² + 4 = 12 + 4 = 16. Cards 1 and 3." },
    { q: "p = 1.5, q = −2, r = (p·q + p)². What are ∂r/∂p and ∂r/∂q?", o: ["3 and −4.5", "−3 and 4.5", "3 and 4.5", "2.25 and −3"], a: 0, why: "Inner value −1.5. ∂r/∂p = 2(−1.5)(q + 1) = 3, ∂r/∂q = 2(−1.5)p = −4.5. Cards 1 and 4." },
    { q: "A multiply gate has inputs 5 and −2 and upstream gradient 3. The gradients of the two inputs are", o: ["3 and 3", "−6 and 15", "15 and −6", "−2 and 5"], a: 1, why: "Each input gets the upstream gradient times the other input: 3 × (−2) = −6 and 3 × 5 = 15. Card 4." },
    { q: "Which tensor has <code>grad_fn = None</code>?", o: ["x * 2 where x requires grad", "a parameter created with requires_grad=True", "(x ** 2).sum() where x requires grad", "x + 1 where x requires grad"], a: 1, why: "A leaf you created has no grad_fn. Results of operations on tracked tensors carry one. Card 2." },
    { q: "In a loop, <code>loss = (3 * w - 1) ** 2</code> and <code>loss.backward()</code> run twice at w = 1 with no clearing. <code>w.grad</code> is", o: ["12", "24", "6", "36"], a: 1, why: "Each backward adds 6(3w − 1) = 12, so the total is 24. Card 5." },
    { q: "Calling <code>loss.backward()</code> a second time on the same loss raises an error because", o: ["the loss is not a scalar", "the graph's saved values were freed by the first backward", "w.grad is not None", "no_grad is active"], a: 1, why: "backward frees the graph. Build a new loss each iteration. Card 5." },
    { q: "You split a batch into 4 equal micro-batches and call backward on each mean loss before one step. To match the full-batch gradient, each loss should be", o: ["multiplied by 4", "divided by 4", "left as it is", "detached"], a: 1, why: "Four means summed give four times the full-batch mean gradient, so scale each by 1/4. Card 5." },
    { q: "<code>w -= lr * w.grad</code> on a leaf that requires grad, outside any context manager,", o: ["works and is recorded", "raises a RuntimeError about an in-place operation on a leaf", "silently does nothing", "clears w.grad"], a: 1, why: "Updates must run under torch.no_grad(). Card 7." },
    { q: "After <code>model.eval()</code>, the output of <code>model(x)</code> without no_grad", o: ["has requires_grad False", "still has requires_grad True and a grad_fn", "is on the CPU", "has dropout applied"], a: 1, why: "eval changes dropout and BatchNorm only. Use no_grad as well when evaluating. Card 7." },
    { q: "x = 5 requires grad, <code>z = x * x</code>, <code>L = z.detach() * x + z</code>. What is <code>x.grad</code>?", o: ["25", "35", "50", "10"], a: 1, why: "The detached z is the constant 25, giving 25. The second term z = x² gives 2x = 10. Total 35. Card 8." },
    { q: "<code>torch.relu(torch.tensor(0., requires_grad=True))</code> followed by backward gives x.grad =", o: ["0", "0.5", "1", "nan"], a: 0, why: "At the kink PyTorch uses 0 for ReLU, as for abs. Card 10." },
    { q: "A chain of 6 plain blocks with local derivative 0.5. The gradient dh/dx, and with identity shortcuts?", o: ["0.5 and 1.5", "0.015625 and 11.39", "3 and 9", "0.015625 and 1"], a: 1, why: "0.5⁶ = 0.015625 and 1.5⁶ = 11.39. Card 11." }
  ], "Lesson 22 test");
}}
],
summary: String.raw`Autograd records every operation on tensors that require gradients as a graph of backward nodes, and backward runs that graph from a scalar loss to the leaves, multiplying upstream gradients by local derivatives and storing the results in the grad attribute of the leaves. Locally an add gate passes the gradient on, a multiply gate scales it by the other input, a max gate routes it to the winner, and a value used twice sums its gradients. backward computes a slope and changes nothing else, and the result agrees with the hand formula and with a central difference in float64, which is how custom code is tested. Gradients accumulate, so a loop clears them before every step, and the graph is freed after backward, so each iteration builds a new loss. Updates and evaluation run under no grad, inference mode is a stricter version, and model eval changes layer behavior without stopping autograd. detach keeps the values and cuts the gradient path, and losses are logged with item. At kinks PyTorch returns conventional subgradients such as zero for ReLU at zero, at domain edges it returns infinite gradients, and torch where can leak a nan from the unused branch. Through a deep chain the local derivatives multiply, so gradients vanish or explode, and an identity shortcut adds one to every factor.`,
sheet: [[String.raw`\[ \frac{\partial J}{\partial x} = \frac{\partial J}{\partial y}\,\frac{\partial y}{\partial x} \]`, "chain rule along one edge"], [String.raw`\[ \bar x = g\,y, \qquad \bar y = g\,x \]`, "multiply gate"], [String.raw`\[ \texttt{x.grad} \leftarrow \texttt{x.grad} + \frac{\partial L}{\partial x} \]`, "accumulation"], [String.raw`\[ \frac{\partial L}{\partial w} = \frac{2}{N}\sum_i e_i x_i \]`, "MSE gradient for a line"], [String.raw`\[ \frac{\partial L}{\partial w} \approx \frac{L(w + h) - L(w - h)}{2h} \]`, "central difference"], [String.raw`\[ \frac{dh_L}{dx} = a^L \ \text{or}\ (1 + a)^L \]`, "plain and residual chains"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW4 Part 3 (requires_grad, grad_fn, detach), HW5 Problem 2c (evaluation under no_grad), HW6 Problem 1 Task 1.4 (the five-step loop, bug B)", "AME 5970 HW7 2.1 and 2.2 (gradients through backward, the L1 derivative at zero) and HW10 (warm-up gradient, eval does not disable autograd, D1 chain derivative), with the HW7 and HW10 solutions docs", "Andrew Ng, Deep Learning Specialization, course 1 week 2: Computation graph, Derivatives with a computation graph", "Stanford CS231n, Backpropagation, intuitions: patterns in backward flow (add, multiply, max gates)", "Andrej Karpathy, Neural Networks: Zero to Hero, lecture 1 (micrograd)", "PyTorch documentation: Autograd mechanics, torch.no_grad, torch.inference_mode, Tensor.detach"]
});
})();
