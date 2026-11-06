(function () {
/* ML shelf, Part 5, Lesson 23: nn.Module. Follows the topic order of the AME 5970 Lecture 4 notes (OOP and PyTorch) and HW4 Parts 4 to 7 (classes and state, inheritance and super, TinyRegressor with named_parameters and state_dict, the three bugs of BuggyRegressor), with HW8 2B (SimpleNN, 3H + 1 parameters, the (N, 1) minus (N,) trap), HW9 4B (LinearDigits 7,850 and MLPDigits 101,770 parameters, Flatten) and HW10 (BatchNorm buffers, residual blocks). Andrew Ng's Deep Learning Specialization course 1 weeks 3 and 4 (layer sizes, the dimensions of W and b) is the spine, with Raschka chapter 13 (building models with torch.nn) and the PyTorch documentation for nn.Module. Every number and every error message was produced with PyTorch 2.15 on the CPU. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const fm = (v, d) => (+v).toFixed(d == null ? 2 : d).replace("-", "−");
const node = (x, y, w, lab, val, cls, on) => `<g class="${cls || "c-gray"}"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="9" stroke-width="${on ? 1.8 : 0.7}"/></g>` + tx(x, y - 3, lab, "middle", "th") + tx(x, y + 14, val, "middle", "t");
const lin = (i, o) => i * o + o;
const n0 = v => v.toLocaleString("en-US");
const TINY = ["class TinyRegressor(nn.Module):", "    def __init__(self):", "        super().__init__()", "        self.layer1 = nn.Linear(3, 5)", "        self.activation = nn.ReLU()", "        self.layer2 = nn.Linear(5, 1)", "", "    def forward(self, x):", "        x = self.layer1(x)", "        x = self.activation(x)", "        return self.layer2(x)"];

addLesson("ml", "torch", {
level: "Core", num: "Lesson 23",
id: "ml-torch-l23", title: "nn.Module", short: "23. nn.Module",
big: String.raw`Lesson 22 trained a line with two loose tensors, w and b. A real model has thousands or millions of parameters arranged in layers, and keeping track of them by hand is hopeless. <code>nn.Module</code> is the class that does the bookkeeping. You write a class that inherits from it, create layers as attributes in <code>__init__</code>, and describe the data flow in <code>forward</code>. In return the module finds every parameter for the optimizer, moves them all to a device in one call, switches dropout and BatchNorm between training and evaluation, and saves and loads them by name. This lesson opens the box: what <code>nn.Linear</code> stores and computes, how assignment registers a parameter and when it silently does not, what calling a model really runs, how to count parameters and trace shapes the way HW4, HW8 and HW9 ask, the containers, <code>state_dict</code> with its buffers, saving and loading, freezing, and the bugs that every first model file contains.`,
bridge: String.raw`The topics follow the professor's Lecture 4 notes on OOP and PyTorch in topic order, and the examples are HW4 Parts 4 to 7 (classes and object state, <code>super()</code>, TinyRegressor with its 26 parameters and <code>state_dict</code> keys, the three bugs of BuggyRegressor), HW8 2B (SimpleNN with 3H + 1 parameters and the broadcasting trap), HW9 4B (LinearDigits and MLPDigits with Flatten) and HW10 (BatchNorm buffers and residual blocks). Lesson 6 built the road to <code>nn.Module</code> from plain Python classes. Andrew Ng's Deep Learning Specialization, course 1 weeks 3 and 4 (layer sizes and the dimensions of W and b), is the spine, with Raschka chapter 13. Lesson 24 puts these modules into a full training loop with an optimizer.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. What a module is", t: "A module is an object that holds layers and parameters and knows how to compute",
intu: String.raw`HW4 Part 6 builds the smallest useful model: 3 input features, <code>Linear(3, 5)</code>, ReLU, <code>Linear(5, 1)</code>. Read it as a tree. The TinyRegressor object is the root. It holds three child modules, named by the attributes you assigned: layer1, activation and layer2. Each Linear child holds two parameters, a weight and a bias. ReLU holds none. The class is ordinary Python from Lesson 6: <code>__init__</code> builds the state and <code>forward</code> uses it. What <code>nn.Module</code> adds is that the tree is discovered automatically, so <code>parameters()</code>, <code>.to(device)</code>, <code>train()</code>, <code>eval()</code> and <code>state_dict()</code> reach every leaf. Click a node to see what it holds and which line created it.`,
eq: String.raw`\[ \hat y = W_2\,\mathrm{ReLU}(W_1 x + b_1) + b_2, \qquad W_1 \in \mathbb{R}^{5 \times 3},\ \ W_2 \in \mathbb{R}^{1 \times 5} \]`,
sym: [["nn.Module", "base class that registers children and parameters"], ["child module", "a layer stored as an attribute, layer1 here"], ["parameter", "a tensor the optimizer will update, weight and bias"], ["forward", "the method that defines the computation"], ["print(model)", "shows the tree of children with their settings"]],
how: ["Inherit from <code>nn.Module</code> and call <code>super().__init__()</code> first.", "Create each layer once in <code>__init__</code> and assign it to <code>self</code>.", "Write <code>forward(self, x)</code> using those layers.", "Call the model as <code>model(x)</code>.", "Print the model and count its parameters before training anything."],
say: String.raw`An nn.Module is a class whose initializer stores layers as attributes and whose forward method uses them, and the base class discovers the resulting tree so that parameters, device moves, modes and saving reach every layer.`,
num: String.raw`TinyRegressor: layer1.weight (5, 3) and layer1.bias (5,) give <b>20</b> parameters, layer2.weight (1, 5) and layer2.bias (1,) give <b>6</b>, ReLU has <b>0</b>, total <b>26</b>, the HW4 check. A batch of 5 samples goes from (5, 3) to (5, 5) to (5, 1).`,
r(fig, ctl) {
  const N = [["model", "TinyRegressor", "the root", 26, 0, "holds layer1, activation and layer2. Its own parameters() walks all of them."], ["layer1", "Linear(3, 5)", "weight (5, 3), bias (5,)", 20, 3, "15 weights and 5 biases. Maps 3 features to 5."], ["activation", "ReLU()", "no parameters", 0, 4, "max(0, x) elementwise. A module with nothing to learn."], ["layer2", "Linear(5, 1)", "weight (1, 5), bias (1,)", 6, 5, "5 weights and 1 bias. Maps 5 features to 1."]];
  let v = 0;
  ctl.innerHTML = btns(N.map((q, i) => [i, q[0]]), "m1");
  const u = () => {
    pick(ctl, "m1", v);
    let s = node(340, 40, 190, "TinyRegressor", "26 parameters", "c-purple", v === 0);
    const X = [130, 340, 550];
    [1, 2, 3].forEach((k, i) => {
      s += `<path d="M340 62 C 340 90, ${X[i]} 90, ${X[i]} 116" fill="none" stroke="var(--p)" stroke-width="1.2" marker-end="url(#ar)"/>`;
      s += node(X[i], 140, 186, N[k][0] + ": " + N[k][1], N[k][3] + " parameters", k === 2 ? "c-gray" : "c-blue", v === k);
    });
    [[1, "weight (5, 3)", 60], [1, "bias (5,)", 200], [3, "weight (1, 5)", 480], [3, "bias (1,)", 620]].forEach(([k, t, x]) => {
      s += `<line x1="${X[k === 1 ? 0 : 2]}" y1="162" x2="${x}" y2="206" stroke="var(--p)" stroke-width="1"/>` + `<g class="${v === k || v === 0 ? "c-teal" : "c-gray"}"><rect x="${x - 58}" y="206" width="116" height="30" rx="6" stroke-width="0.8"/></g>` + tx(x, 226, t, "middle", "t");
    });
    s += tx(340, 216, "no parameters", "middle");
    s += tx(30, 270, N[v][0] + ": " + N[v][2], null, "th") + tx(30, 292, N[v][5], null, "t");
    fig.innerHTML = svg(310, s) + ML.code(TINY, N[v][4]) + (v === 0 ? ML.term(["TinyRegressor(", "  (layer1): Linear(in_features=3, out_features=5, bias=True)", "  (activation): ReLU()", "  (layer2): Linear(in_features=5, out_features=1, bias=True)", ")"]) : "");
  };
  ctl.querySelectorAll("button[data-m1]").forEach(b => b.onclick = () => { v = +b.dataset.m1; u(); }); u();
}},

{s: "2. Inside nn.Linear", t: "nn.Linear stores W with shape (out, in) and computes x Wᵀ + b for every row",
intu: String.raw`<code>nn.Linear(in_features, out_features)</code> is Ng's layer z = Wx + b in batch form. It stores a weight of shape (out, in), one row per output unit, and a bias of shape (out,). Given a batch X with one sample per row, shape (B, in), it returns X Wᵀ + b with shape (B, out). The order (out, in) is the one Ng uses for \(W^{[l]}\), with \(n^{[l]}\) rows and \(n^{[l-1]}\) columns, and it is why a weight printout looks transposed compared with the layer's name. Each output is a dot product of the sample with one row of W, plus that row's bias. PyTorch starts the weights and biases uniformly in ±1/√in, so the first predictions are small. Move the two inputs and follow one output through its row.`,
eq: String.raw`\[ Y = X W^\top + b, \qquad X \in \mathbb{R}^{B \times \text{in}},\ \ W \in \mathbb{R}^{\text{out} \times \text{in}},\ \ Y \in \mathbb{R}^{B \times \text{out}} \]`,
sym: [["in", "number of input features, the last dimension of x"], ["out", "number of output units"], ["weight", "shape (out, in), one row per output unit"], ["bias", "shape (out,), added to every row of the batch"], ["default init", "uniform in ±1/√in for weight and bias"]],
how: ["Check that the last dimension of x equals <code>in_features</code>.", "Each output unit j takes the dot product of x with row j of W.", "Add bias j.", "Every sample in the batch uses the same W and b.", "Read the output shape as (B, out)."],
say: String.raw`nn.Linear stores a weight of shape out by in and a bias of length out, and maps a batch of shape B by in to X times W transposed plus b, of shape B by out.`,
num: String.raw`W = [[1, −1], [0.5, 2], [−1, 0]], b = (0.1, 0, −0.5). The sample (2, 1) gives <b>(1.1, 3.0, −2.5)</b>, the sample (0, −1) gives <b>(1.1, −2.0, −0.5)</b>. <code>nn.Linear(4, 3)</code> starts in ±1/√4 = <b>±0.5</b>.`,
r(fig, ctl) {
  const W = [[1, -1], [0.5, 2], [-1, 0]], b = [0.1, 0, -0.5];
  ctl.innerHTML = sl("m2a", "x₁", -3, 3, 0.5, 2) + sl("m2b", "x₂", -3, 3, 0.5, 1) + btns([[0, "unit 1"], [1, "unit 2"], [2, "unit 3"]], "m2");
  let j = 1;
  const u = () => {
    pick(ctl, "m2", j);
    const x = [+$("m2a").value, +$("m2b").value]; $("m2av").textContent = x[0]; $("m2bv").textContent = x[1];
    const y = W.map((r, k) => r[0] * x[0] + r[1] * x[1] + b[k]);
    const hlW = new Set([j + ",0", j + ",1"]);
    let s = ML.grid([x], { x: 40, y: 50, cell: 50, title: "x, shape (1, 2)", hl: new Set(["0,0", "0,1"]), rowLab: false, dec: 1 }).s;
    s += tx(158, 80, "·", "middle", "th");
    s += ML.grid(W, { x: 200, y: 50, cell: 50, title: "W, shape (3, 2)", hl: hlW, dec: 1 }).s;
    s += tx(318, 80, "+", "middle", "th");
    s += ML.grid([b], { x: 335, y: 50, cell: 50, title: "b, shape (3,)", hl: new Set(["0," + j]), rowLab: false, dec: 1 }).s;
    s += tx(500, 80, "=", "middle", "th");
    s += ML.grid([y], { x: 515, y: 50, cell: 50, title: "y, shape (1, 3)", hl2: new Set(["0," + j]), rowLab: false, dec: 2 }).s;
    s += tx(30, 230, `unit ${j + 1}: ${fm(W[j][0], 1)} × ${fm(x[0], 1)} + ${fm(W[j][1], 1)} × ${fm(x[1], 1)} + ${fm(b[j], 1)} = ${fm(y[j], 2)}`, null, "th");
    s += tx(30, 256, "row " + (j + 1) + " of W is the weight vector of output unit " + (j + 1) + ", so W has one row per output", null, "t");
    fig.innerHTML = svg(280, s) + ML.code(["layer = nn.Linear(2, 3)", "print(layer.weight.shape, layer.bias.shape)   # (3, 2) and (3,)", `y = layer(torch.tensor([[${x[0]}, ${x[1]}]]))`, "y == x @ layer.weight.T + layer.bias       # True"], 2) + ML.term([`tensor([[${y.map(v => v.toFixed(4)).join(", ")}]], grad_fn=<AddmmBackward0>)`]);
  };
  ctl.querySelectorAll("button[data-m2]").forEach(q => q.onclick = () => { j = +q.dataset.m2; u(); });
  $("m2a").oninput = u; $("m2b").oninput = u; u();
}},

{s: "3. Registration", t: "Assignment registers a parameter only if the module can see it",
intu: String.raw`When you write <code>self.layer1 = nn.Linear(3, 5)</code>, nn.Module's attribute hook notices a Module and files it under the name layer1. The same happens for an <code>nn.Parameter</code>. Anything else is just a Python attribute. A tensor created with <code>requires_grad=True</code> is not registered, so <code>parameters()</code> never returns it, the optimizer never updates it, and <code>.to(device)</code> leaves it behind. A plain Python list of layers is the classic silent bug: the layers run in forward, but the model reports 0 parameters for them. <code>nn.ModuleList</code> fixes it. A buffer, made with <code>register_buffer</code>, is state that is saved and moved but not trained, like a running mean. Try each way of storing state.`,
eq: String.raw`\[ \texttt{parameters()} = \text{every nn.Parameter reachable through registered children} \]`,
sym: [["nn.Parameter", "a tensor wrapped so the module registers it, requires grad by default"], ["plain tensor attribute", "invisible to <code>parameters()</code>, <code>.to()</code> and <code>state_dict</code>"], ["Python list of layers", "invisible, the layers are never trained"], ["nn.ModuleList", "a list that registers its modules as 0, 1, 2"], [String.raw`\(\texttt{register\_buffer}\)`, "saved and moved with the model, not returned by parameters()"]],
how: ["Store layers as attributes or inside ModuleList and ModuleDict.", "Wrap a free learnable tensor in <code>nn.Parameter</code>.", "Use <code>register_buffer</code> for fixed state such as statistics or masks.", "After building a model, print the parameter count and compare with your hand count.", "A count lower than expected means something is not registered."],
say: String.raw`A module registers submodules, Parameter objects and buffers that are assigned to it, while plain tensors and plain Python lists of layers stay invisible to parameters, device moves and the state dict.`,
num: String.raw`A Parameter of length 3 gives <b>3</b> parameters and key w. A tensor with <code>requires_grad</code> gives <b>0</b> and no key. A list of three Linear(4, 4) gives <b>0</b>, the same layers in a ModuleList give <b>60</b> with keys layers.0.weight to layers.2.bias. A buffer adds a key, mean, but <b>0</b> parameters.`,
r(fig, ctl) {
  const M = [
    ["nn.Parameter", "self.w = nn.Parameter(torch.zeros(3))", 3, ["w"], [true, true, true], "registered as a parameter"],
    ["tensor with requires_grad", "self.w = torch.zeros(3, requires_grad=True)", 0, [], [false, false, false], "a plain attribute, the module does not know it exists"],
    ["Python list of layers", "self.layers = [nn.Linear(4, 4) for _ in range(3)]", 0, [], [false, false, false], "the layers run in forward but are never trained or saved"],
    ["nn.ModuleList", "self.layers = nn.ModuleList([nn.Linear(4, 4) for _ in range(3)])", 60, ["layers.0.weight", "layers.0.bias", "layers.1.weight", "layers.1.bias", "layers.2.weight", "layers.2.bias"], [true, true, true], "three registered children, 3 × (16 + 4) = 60"],
    ["register_buffer", "self.register_buffer(\"mean\", torch.zeros(3))", 0, ["mean"], [false, true, true], "saved and moved, but not trained"]
  ];
  let v = 2;
  ctl.innerHTML = btns(M.map((m, i) => [i, m[0]]), "m3");
  const u = () => {
    pick(ctl, "m3", v); const [name, line, cnt, keys, fl, note] = M[v];
    let s = tx(30, 26, name, null, "th") + tx(30, 48, note, null, "t");
    const cols = [["returned by parameters()", fl[0]], ["moved by .to(device)", fl[1]], ["saved in state_dict()", fl[2]]];
    cols.forEach(([t, ok], i) => { const x = 30 + i * 215; s += `<g class="${ok ? "c-teal" : "c-coral"}"><rect x="${x}" y="66" width="200" height="56" rx="9" stroke-width="0.8"/></g>` + tx(x + 100, 90, t, "middle", "t") + tx(x + 100, 110, ok ? "yes" : "no", "middle", "th"); });
    s += tx(30, 150, "sum(p.numel() for p in m.parameters()) = " + cnt, null, "th");
    s += tx(30, 174, "state_dict keys: " + (keys.length ? (keys.length > 3 ? keys.slice(0, 3).join(", ") + ", ..." : keys.join(", ")) : "none"), null, "t");
    if (v === 2) s += tx(30, 200, "the optimizer built from m.parameters() would update nothing in these layers", null, "th");
    fig.innerHTML = svg(214, s) + ML.code(["class M(nn.Module):", "    def __init__(self):", "        super().__init__()", "        " + line, "", "m = M()", "print(sum(p.numel() for p in m.parameters()), list(m.state_dict()))"], 3) + ML.term([cnt + " " + JSON.stringify(keys).replace(/"/g, "'").replace(/,/g, ", ")]);
  };
  ctl.querySelectorAll("button[data-m3]").forEach(b => b.onclick = () => { v = +b.dataset.m3; u(); }); u();
}},

{s: "4. Calling a model", t: "model(x) runs __call__, which runs hooks and then forward",
intu: String.raw`You define <code>forward</code> but you never call it by name. <code>model(x)</code> goes through <code>nn.Module.__call__</code>, which runs any registered forward pre-hooks, then your <code>forward</code>, then the forward hooks, and returns the result. Inside forward, <code>self.layer1(x)</code> is again a call through <code>__call__</code>, so every layer gets the same treatment. Hooks are how tools such as profilers, activation loggers and some pruning and quantization code attach to a model, so calling <code>model.forward(x)</code> directly skips the model's own hooks and can give a different behavior from the one you tested. Step through a batch of 4 samples and switch between the two calls.`,
eq: String.raw`\[ \texttt{model(x)} \to \texttt{\_\_call\_\_} \to \text{pre-hooks} \to \texttt{forward(x)} \to \text{hooks} \to \text{output} \]`,
sym: [[String.raw`\(\texttt{\_\_call\_\_}\)`, "the Module method that runs when you write model(x)"], ["forward", "your computation, called by <code>__call__</code>"], ["forward hook", "a function run after forward with the module, its input and its output"], ["pre-hook", "a function run before forward"], ["model.forward(x)", "skips the model's own hooks, avoid it"]],
how: ["Always write <code>model(x)</code>, never <code>model.forward(x)</code>.", "Inside forward, call layers as <code>self.layer(x)</code>.", "To watch an intermediate shape, register a forward hook on that layer.", "Remove the hook with the handle it returns when you are done.", "Keep forward free of side effects such as printing in a real model."],
say: String.raw`Calling a model runs the Module's call method, which runs pre-hooks, then forward, then forward hooks, so a model is always called as model of x and never through forward directly.`,
num: String.raw`A hook on the model prints <b>(4, 1)</b> for <code>model(x)</code> and prints <b>nothing</b> for <code>model.forward(x)</code>. A hook on layer1 still prints <b>(4, 5)</b> in both cases, because forward calls <code>self.layer1(x)</code> the normal way.`,
r(fig, ctl) {
  let mode = 0;
  ctl.innerHTML = btns([[0, "model(x)"], [1, "model.forward(x)"]], "m4") + `<div id="m4s"></div>`;
  const names = ["call", "model pre-hooks", "forward starts", "self.layer1(x)", "self.activation(x)", "self.layer2(x)", "model forward hooks", "result"];
  const shp = ["(4, 3)", "(4, 3)", "(4, 3)", "(4, 5)", "(4, 5)", "(4, 1)", "(4, 1)", "(4, 1)"];
  const run = () => {
    pick(ctl, "m4", mode); $("m4s").innerHTML = "";
    ML.stepper($("m4s"), names.length, k => {
      let s = "";
      names.forEach((n, i) => {
        const skip = mode === 1 && (i === 1 || i === 6), y = 26 + i * 34, on = i === k;
        s += `<g class="${skip ? "c-gray" : on ? "c-teal" : i >= 3 && i <= 5 ? "c-blue" : "c-purple"}"><rect x="${i >= 3 && i <= 5 ? 70 : 30}" y="${y - 14}" width="${i >= 3 && i <= 5 ? 300 : 340}" height="26" rx="6" stroke-width="${on ? 1.8 : 0.6}" opacity="${skip ? 0.4 : 1}"/></g>` + tx(i >= 3 && i <= 5 ? 84 : 44, y + 4, skip ? n + ", skipped" : n, null, "t") + tx(360, y + 4, skip ? "" : shp[i], "end", "t");
      });
      s += tx(400, 40, mode ? "model.forward(x)" : "model(x)", null, "th") + tx(400, 66, "x has shape (4, 3)", null, "t");
      s += tx(400, 100, "the blue rows are layer calls,", null) + tx(400, 118, "each one its own __call__", null);
      s += tx(400, 160, "hook on the model:", null, "th") + tx(400, 180, mode ? "never runs" : (k >= 6 ? "printed (4, 1)" : "waiting"), null, "t");
      s += tx(400, 214, "hook on layer1:", null, "th") + tx(400, 234, k >= 3 ? "printed (4, 5)" : "waiting", null, "t");
      fig.innerHTML = svg(300, s) + ML.code(["show = lambda name: (lambda m, inp, out: print(name, tuple(out.shape)))", "model.register_forward_hook(show('model'))", "model.layer1.register_forward_hook(show('layer1'))", mode ? "out = model.forward(torch.randn(4, 3))" : "out = model(torch.randn(4, 3))"], 3) + ML.term(k < 3 ? ["(no output yet)"] : ["layer1 (4, 5)"].concat(k >= 6 && !mode ? ["model (4, 1)"] : []));
    }, names);
  };
  ctl.querySelectorAll("button[data-m4]").forEach(b => b.onclick = () => { mode = +b.dataset.m4; run(); }); run();
}},

{s: "5. Counting parameters", t: "Each Linear layer has out × in weights and out biases",
intu: String.raw`Counting parameters is the most common hand calculation on the course's homework and exams, and it catches architecture mistakes before any training. A Linear layer with <code>in_features</code> inputs and <code>out_features</code> outputs has out × in weights and out biases. Activations, Flatten and Dropout have none. Add the layers. HW8's SimpleNN maps 1 feature to H hidden units and back to 1, so it has H + H + H + 1 = 3H + 1 parameters, 4 at width 1 and 151 at width 50. HW9's linear digit model has 10 × 784 + 10 = 7,850 and the MLP with 128 hidden units has 101,770. Pick a model, change the hidden width and watch the count. The first layer dominates whenever the input is wide.`,
eq: String.raw`\[ P = \sum_{l=1}^{L} \left( n^{[l]} n^{[l-1]} + n^{[l]} \right) \]`,
sym: [[String.raw`\(n^{[l]}\)`, "number of units in layer l, Ng's notation"], [String.raw`\(n^{[0]}\)`, "number of input features"], [String.raw`\(n^{[l]} n^{[l-1]}\)`, "weights of layer l"], ["biases of layer l", "one per unit, so also the number of units"], ["P", "total trainable parameters"]],
how: ["List the layer widths from input to output.", "For each Linear layer multiply in by out, then add out.", "Add zero for ReLU, Flatten and Dropout.", "Sum the layers.", "Check with <code>sum(p.numel() for p in model.parameters())</code>."],
say: String.raw`A linear layer from n in to n out has n out times n in weights plus n out biases, activation layers have none, and the parameter count of a network is the sum over its linear layers.`,
num: String.raw`HW4 TinyRegressor 3, 5, 1: 20 + 6 = <b>26</b>. HW4 FixedRegressor 3, 4, 1: 16 + 5 = <b>21</b>. HW8 SimpleNN: 3H + 1, <b>4</b> at H = 1 and <b>151</b> at H = 50. HW9: <b>7,850</b> and 100,480 + 1,290 = <b>101,770</b>.`,
r(fig, ctl) {
  const P = [["TinyRegressor", 3, 5, 1, 1, 64], ["FixedRegressor", 3, 4, 1, 1, 64], ["SimpleNN", 1, 50, 1, 1, 200], ["LinearDigits", 784, 0, 10, 0, 256], ["MLPDigits", 784, 128, 10, 1, 256]];
  let v = 0;
  ctl.innerHTML = btns(P.map((p, i) => [i, p[0]]), "m5") + sl("m5h", "hidden width H", 1, 64, 1, 5);
  const set = () => { const p = P[v]; $("m5h").max = p[5]; $("m5h").value = p[2] || 1; $("m5h").disabled = !p[4]; };
  const u = () => {
    pick(ctl, "m5", v); const p = P[v], H = +$("m5h").value; $("m5hv").textContent = p[4] ? H : "none";
    const W = p[4] ? [p[1], H, p[3]] : [p[1], p[3]];
    const L = []; for (let i = 1; i < W.length; i++) L.push([W[i - 1], W[i], W[i] * W[i - 1], W[i]]);
    const tot = L.reduce((a, l) => a + l[2] + l[3], 0), mx = Math.max(...L.map(l => l[2] + l[3]));
    let s = tx(30, 26, p[0] + ": widths " + W.join(" → "), null, "th");
    L.forEach((l, i) => {
      const y = 50 + i * 62, ww = 360 * l[2] / mx, bw = Math.max(2, 360 * l[3] / mx);
      s += tx(30, y + 14, `Linear(${l[0]}, ${l[1]})`, null, "t") + `<rect x="190" y="${y}" width="${ww}" height="22" fill="${C.blue}" opacity="0.85"/><rect x="${190 + ww}" y="${y}" width="${bw}" height="22" fill="${C.amber}"/>`;
      s += tx(190, y + 40, `${l[1]} × ${l[0]} = ${n0(l[2])} weights + ${l[3]} biases = ${n0(l[2] + l[3])}`, null, "t");
      if (i < L.length - 1) s += tx(30, y + 40, "then ReLU, 0", null);
    });
    const y2 = 60 + L.length * 62;
    s += tx(30, y2, "total P = " + n0(tot), null, "th") + (v === 2 ? tx(250, y2, `3H + 1 = 3 × ${H} + 1 = ${3 * H + 1}`, null, "t") : "");
    s += `<rect x="460" y="${y2 - 13}" width="14" height="14" fill="${C.blue}"/>` + tx(480, y2 - 1, "weights", null) + `<rect x="560" y="${y2 - 13}" width="14" height="14" fill="${C.amber}"/>` + tx(580, y2 - 1, "biases", null);
    fig.innerHTML = svg(y2 + 20, s) + ML.code(["count = sum(p.numel() for p in model.parameters() if p.requires_grad)", "print(count)"], -1) + ML.term([n0(tot).replace(/,/g, "")]);
  };
  ctl.querySelectorAll("button[data-m5]").forEach(b => b.onclick = () => { v = +b.dataset.m5; set(); u(); });
  $("m5h").oninput = u; set(); u();
}},

{s: "6. Tracing shapes", t: "Trace the shape after every operation, and keep the batch dimension",
intu: String.raw`HW8 2B and HW9 4B ask for the shape after each operation with the batch size B kept symbolic. Do it for the MLP on MNIST images. A batch arrives as (B, 1, 28, 28). <code>nn.Flatten()</code> keeps dimension 0 and joins the rest, giving (B, 784). <code>Linear(784, 128)</code> changes only the last dimension, to (B, 128). ReLU keeps the shape. <code>Linear(128, 10)</code> gives (B, 10) raw logits, one row per image. The batch dimension must survive every step, including B = 1, which is exactly what the homework checks with batch sizes 1 and 7. Remove Flatten and see what Linear does with a 4D tensor: it treats every row of every image as a sample and fails with a shape message you will meet again.`,
eq: String.raw`\[ (B, 1, 28, 28) \xrightarrow{\text{Flatten}} (B, 784) \xrightarrow{\text{Linear}} (B, 128) \xrightarrow{\text{ReLU}} (B, 128) \xrightarrow{\text{Linear}} (B, 10) \]`,
sym: [["B", "batch size, kept symbolic, must work for B = 1"], ["nn.Flatten()", "joins every dimension after 0, <code>start_dim=1</code>"], ["Linear on many dims", "acts on the last dimension only"], ["logits", "raw scores, no softmax inside the model for training"], ["x.view(-1)", "would also flatten the batch, a bug"]],
how: ["Write the input shape with B.", "For Flatten multiply the trailing dimensions.", "For Linear replace the last dimension by <code>out_features</code>.", "Activations keep the shape.", "Check the code with B = 1 and B = 7, as HW8 and HW9 do."],
say: String.raw`Each layer changes the shape in a predictable way, Flatten joins everything after the batch dimension, Linear replaces the last dimension by its output width, and a correct model keeps the batch dimension for every batch size including one.`,
num: String.raw`B = 7: (7, 1, 28, 28) → (<b>7, 784</b>) → (7, 128) → (7, 128) → (<b>7, 10</b>). Without Flatten, Linear(784, 128) receives rows of length 28 and raises <i>mat1 and mat2 shapes cannot be multiplied (196x28 and 784x128)</i>, since 7 × 1 × 28 = 196.`,
r(fig, ctl) {
  let fl = true;
  ctl.innerHTML = sl("m6b", "batch size B", 1, 64, 1, 7) + btns([[1, "with Flatten"], [0, "without Flatten"]], "m6");
  const u = () => {
    pick(ctl, "m6", fl ? 1 : 0); const B = +$("m6b").value; $("m6bv").textContent = B;
    const st = fl ? [["input", `(${B}, 1, 28, 28)`, 0], ["Flatten()", `(${B}, 784)`, 0], ["Linear(784, 128)", `(${B}, 128)`, 100480], ["ReLU()", `(${B}, 128)`, 0], ["Linear(128, 10)", `(${B}, 10)`, 1290]] : [["input", `(${B}, 1, 28, 28)`, 0], ["Linear(784, 128)", "error", 100480]];
    let s = "";
    st.forEach(([n, sh, p], i) => {
      const x = 70 + i * 135, err = sh === "error";
      s += node(x, 70, 122, n, p ? n0(p) + " params" : "0 params", err ? "c-coral" : i === 0 ? "c-gray" : "c-blue", i === st.length - 1);
      s += `<g class="${err ? "c-coral" : "c-teal"}"><rect x="${x - 60}" y="112" width="120" height="28" rx="6" stroke-width="0.8"/></g>` + tx(x, 131, sh, "middle", "t");
      if (i < st.length - 1) s += arrow(x + 62, 70, x + 72, 70, "var(--p)", 1.5);
    });
    if (fl) s += tx(30, 180, `batch dimension ${B} survives every step, output: ${B} rows of 10 logits`, null, "th") + tx(30, 204, "parameters 100,480 + 1,290 = 101,770, the same for every B", null, "t");
    else s += tx(30, 180, "Linear multiplies the last dimension, 28, against in_features 784", null, "th") + tx(30, 204, `PyTorch folds the leading dims into ${B} × 1 × 28 = ${B * 28} rows`, null, "t");
    fig.innerHTML = svg(226, s) + ML.code(["model = nn.Sequential(", fl ? "    nn.Flatten()," : "    # no Flatten", "    nn.Linear(784, 128), nn.ReLU(),", "    nn.Linear(128, 10))", `out = model(torch.zeros(${B}, 1, 28, 28))`, "print(out.shape)"], 4) + ML.term(fl ? [`torch.Size([${B}, 10])`] : [`RuntimeError: addmm: mat1 and mat2 shapes cannot be multiplied (${B * 28}x28 and 784x128)`]);
  };
  ctl.querySelectorAll("button[data-m6]").forEach(b => b.onclick = () => { fl = b.dataset.m6 === "1"; u(); });
  $("m6b").oninput = u; u();
}},

{s: "7. Sequential and containers", t: "nn.Sequential chains layers, ModuleList and ModuleDict hold them",
intu: String.raw`When forward is just one layer after another, <code>nn.Sequential</code> writes it for you: it calls its children in order and passes each output to the next. The price is the names. A Sequential names its children 0, 1, 2, so the keys of the state dict are 0.weight and 2.weight, and the ReLU at position 1 has no keys at all. Pass an OrderedDict and you choose the names. Sequential supports indexing and slicing, so <code>seq[0]</code> is the first Linear and <code>seq[:2]</code> is a new Sequential of the first two layers, handy for looking at hidden features. Use a custom class when forward needs branches, skips or several inputs, and ModuleList or ModuleDict to hold a variable number of layers that your forward loops over. The three versions below compute the same function.`,
eq: String.raw`\[ \texttt{Sequential}(f_1, f_2, f_3)(x) = f_3(f_2(f_1(x))) \]`,
sym: [["nn.Sequential", "runs its children in order, names them 0, 1, 2 unless given an OrderedDict"], ["nn.ModuleList", "a registered list, you write the loop in forward"], ["nn.ModuleDict", "a registered dict, layers chosen by key"], ["seq[i], seq[:k]", "indexing returns a layer, slicing a new Sequential"], ["custom class", "needed for skips, branches and several inputs"]],
how: ["Use Sequential for a straight chain.", "Give it an OrderedDict when the names matter for saving or reading.", "Use a class when forward is not a plain chain.", "Hold a variable number of layers in ModuleList.", "Remember that changing the structure changes the state dict keys, card 9."],
say: String.raw`Sequential calls its children in order and names them by position unless given names, ModuleList and ModuleDict register layers that a custom forward uses, and a custom class is needed whenever the data flow is not a straight chain.`,
num: String.raw`<code>nn.Sequential(nn.Linear(3, 5), nn.ReLU(), nn.Linear(5, 1))</code> has keys <b>0.weight, 0.bias, 2.weight, 2.bias</b> and the same <b>26</b> parameters as TinyRegressor. With an OrderedDict of hidden, act, out the keys become <b>hidden.weight</b> to <b>out.bias</b>.`,
r(fig, ctl) {
  const V = [
    ["custom class", TINY, ["layer1.weight", "layer1.bias", "layer2.weight", "layer2.bias"], ["layer1", "activation", "layer2"]],
    ["nn.Sequential", ["model = nn.Sequential(", "    nn.Linear(3, 5),", "    nn.ReLU(),", "    nn.Linear(5, 1),", ")"], ["0.weight", "0.bias", "2.weight", "2.bias"], ["0", "1", "2"]],
    ["Sequential with names", ["model = nn.Sequential(OrderedDict([", "    (\"hidden\", nn.Linear(3, 5)),", "    (\"act\", nn.ReLU()),", "    (\"out\", nn.Linear(5, 1)),", "]))"], ["hidden.weight", "hidden.bias", "out.weight", "out.bias"], ["hidden", "act", "out"]]
  ];
  let v = 1;
  ctl.innerHTML = btns(V.map((q, i) => [i, q[0]]), "m7");
  const u = () => {
    pick(ctl, "m7", v); const [name, code, keys, ch] = V[v];
    let s = tx(30, 24, name + ": the same function, 26 parameters", null, "th");
    ["Linear(3, 5)", "ReLU()", "Linear(5, 1)"].forEach((t, i) => { const x = 110 + i * 230; s += node(x, 74, 160, t, "name: " + ch[i], i === 1 ? "c-gray" : "c-blue"); if (i < 2) s += arrow(x + 82, 74, x + 146, 74, "var(--p)", 1.5); });
    s += tx(30, 134, "state_dict keys", null, "th");
    keys.forEach((k, i) => s += `<g class="c-teal"><rect x="${30 + i * 160}" y="146" width="150" height="28" rx="6" stroke-width="0.8"/></g>` + tx(105 + i * 160, 165, k, "middle", "t"));
    s += tx(30, 204, v === 1 ? "position 1 is ReLU, it has no parameters, so there is no 1.weight" : v === 0 ? "the attribute names become the key prefixes" : "the OrderedDict names become the key prefixes", null, "t");
    s += tx(30, 226, v === 0 ? "a class can also add skips, branches and several inputs" : "model[0] is the first Linear, model[:2] is Linear then ReLU", null, "t");
    fig.innerHTML = svg(244, s) + ML.code(code, -1);
  };
  ctl.querySelectorAll("button[data-m7]").forEach(b => b.onclick = () => { v = +b.dataset.m7; u(); }); u();
}},

{s: "8. state_dict and buffers", t: "state_dict is every parameter and buffer, by name, as live tensors",
intu: String.raw`<code>model.state_dict()</code> is an ordered dictionary from dotted names to tensors. It holds every parameter and every buffer. A BatchNorm layer, Lesson 17 and HW10, shows why both exist: its scale and shift, weight and bias, are trained, while <code>running_mean</code>, <code>running_var</code> and <code>num_batches_tracked</code> are updated during training forward passes but never by the optimizer. They still have to be saved, or the evaluation mode of a loaded model would use the wrong statistics. Two facts about the dictionary matter later. Its values are the model's own tensors, not copies, so a saved best state changes when training continues unless you deep-copy it, the trap from Lessons 19 and 20. And it stores only tensors, not the class, so loading needs the code that builds the model.`,
eq: String.raw`\[ \texttt{state\_dict} = \text{parameters} \cup \text{buffers}, \qquad 29 + 9 = 38 \text{ numbers here} \]`,
sym: [[String.raw`\(\texttt{state\_dict()}\)`, "ordered dict of name to tensor, parameters and buffers"], [String.raw`\(\texttt{named\_parameters()}\)`, "trainable tensors only"], [String.raw`\(\texttt{named\_buffers()}\)`, "saved state the optimizer does not touch"], [String.raw`\(\texttt{running\_mean}\)`, "BatchNorm's estimate of the feature means, used in eval mode"], ["deepcopy", "<code>copy.deepcopy(model.state_dict())</code> freezes a snapshot"]],
how: ["Print the keys and shapes of the state dict of any new model.", "Separate parameters from buffers with <code>named_parameters</code> and <code>named_buffers</code>.", "Snapshot the best state with <code>copy.deepcopy</code>.", "Save with <code>torch.save(model.state_dict(), path)</code>.", "Keep the code that builds the model next to the checkpoint."],
say: String.raw`The state dict maps names to the live tensors of every parameter and buffer, buffers such as BatchNorm running statistics are saved but not trained, and a snapshot needs a deep copy because the values are not copies.`,
num: String.raw`Linear(3, 4), BatchNorm1d(4), ReLU, Linear(4, 1): parameters 16 + 8 + 5 = <b>29</b>, buffers 4 + 4 + 1 = <b>9</b>, <b>9</b> keys holding <b>38</b> numbers. An in-place +1 on the first weight changes the entry <b>−0.2517</b> to <b>0.7483</b> inside a state dict taken before it.`,
r(fig, ctl) {
  const R = [["0.weight", "(4, 3)", "parameter", 12], ["0.bias", "(4,)", "parameter", 4], ["1.weight", "(4,)", "parameter", 4], ["1.bias", "(4,)", "parameter", 4], ["1.running_mean", "(4,)", "buffer", 4], ["1.running_var", "(4,)", "buffer", 4], ["1.num_batches_tracked", "()", "buffer", 1], ["3.weight", "(1, 4)", "parameter", 4], ["3.bias", "(1,)", "parameter", 1]];
  let v = 2;
  ctl.innerHTML = btns([[0, "parameters()"], [1, "buffers()"], [2, "state_dict()"], [3, "the snapshot trap"]], "m8");
  const u = () => {
    pick(ctl, "m8", v);
    if (v === 3) {
      let s = tx(30, 26, "sd = model.state_dict() holds references to the live weights", null, "th");
      const box = (x, t1, t2, cls) => `<g class="${cls}"><rect x="${x}" y="50" width="190" height="70" rx="9" stroke-width="0.8"/></g>` + tx(x + 95, 78, t1, "middle", "th") + tx(x + 95, 102, t2, "middle", "t");
      s += box(30, "before training step", "sd[0.weight][0, 0] = −0.2517", "c-gray") + arrow(224, 85, 254, 85, "var(--p)", 1.5) + box(260, "after weight += 1", "sd[0.weight][0, 0] = 0.7483", "c-coral") + arrow(454, 85, 484, 85, "var(--p)", 1.5) + box(490, "deepcopy instead", "keeps −0.2517", "c-teal");
      s += tx(30, 152, "a best checkpoint kept as sd = model.state_dict() is silently the latest state", null, "t");
      fig.innerHTML = svg(170, s) + ML.code(["sd = model.state_dict()                 # references", "best = copy.deepcopy(model.state_dict())  # a frozen snapshot", "with torch.no_grad():", "    model[0].weight.add_(1.0)", "print(sd['0.weight'][0, 0].item(), best['0.weight'][0, 0].item())"], 3) + ML.term(["0.7482607364654541 -0.2517392337322235"]);
      return;
    }
    let s = tx(30, 22, "key", null, "th") + tx(270, 22, "shape", null, "th") + tx(370, 22, "kind", null, "th") + tx(480, 22, "trained by optimizer", null, "th");
    let cnt = 0, keys = 0;
    R.forEach((r, i) => {
      const on = v === 2 || (v === 0 && r[2] === "parameter") || (v === 1 && r[2] === "buffer"), y = 46 + i * 27;
      if (on) { cnt += r[3]; keys++; }
      s += `<rect x="20" y="${y - 17}" width="640" height="24" rx="5" fill="${on ? (r[2] === "buffer" ? "var(--purple-bg)" : "var(--accent-bg)") : "var(--sunk)"}" opacity="${on ? 1 : 0.45}"/>` + tx(30, y, r[0], null, "t") + tx(270, y, r[1], null, "t") + tx(370, y, r[2], null, "t") + tx(480, y, r[2] === "buffer" ? "no" : "yes", null, "t");
    });
    s += tx(30, 46 + 9 * 27 + 4, `${keys} entries, ${cnt} numbers`, null, "th");
    fig.innerHTML = svg(46 + 9 * 27 + 18, s) + ML.code(["model = nn.Sequential(nn.Linear(3, 4), nn.BatchNorm1d(4),", "                      nn.ReLU(), nn.Linear(4, 1))", ["for n, p in model.named_parameters(): print(n, tuple(p.shape))", "for n, b in model.named_buffers(): print(n, tuple(b.shape))", "for k, t in model.state_dict().items(): print(k, tuple(t.shape))"][v]], 2);
  };
  ctl.querySelectorAll("button[data-m8]").forEach(b => b.onclick = () => { v = +b.dataset.m8; u(); }); u();
}},

{s: "9. Saving and loading", t: "Save the state dict, rebuild the model, load by name, read the error",
intu: String.raw`The recommended pattern is to save only the state dict, then rebuild the same architecture from code and call <code>load_state_dict</code>. Loading matches by key, so it fails loudly in two ways. If the names differ, because an attribute was renamed or a class became a Sequential, the error lists the missing keys the model expected and the unexpected keys the file contained. If a name matches but a shape does not, because a hidden width changed, the error is a size mismatch. Both messages tell you exactly what differs. <code>strict=False</code> turns the missing and unexpected keys into a returned report instead of an error, which is useful for loading part of a model, and dangerous when nothing at all matched. Pick a situation.`,
eq: String.raw`\[ \text{load succeeds} \iff \text{same keys and the same shape for every key} \]`,
sym: [[String.raw`\(\texttt{torch.save(sd, path)}\)`, "writes the dict of tensors to a file"], [String.raw`\(\texttt{load\_state\_dict(sd)}\)`, "copies tensors into the model's parameters by name"], ["missing keys", "the model expects them, the file does not have them"], ["unexpected keys", "the file has them, the model does not"], [String.raw`\(\texttt{strict=False}\)`, "report mismatched keys instead of raising"]],
how: ["Save <code>model.state_dict()</code>, not the whole model object.", "Rebuild the model with the same class and the same widths.", "Call <code>model.load_state_dict(torch.load(path))</code>.", "On an error read the missing and unexpected keys first, then the shapes.", "With <code>strict=False</code> always print the returned report."],
say: String.raw`Load a model by rebuilding the same architecture and loading the saved state dict, which must match key by key and shape by shape, and read missing keys, unexpected keys and size mismatches as an exact description of what changed.`,
num: String.raw`TinyRegressor into TinyRegressor: <b>All keys matched successfully</b>. Into a copy with hidden width 6: three <b>size mismatch</b> lines, [5, 3] against [6, 3] first. Into a class with attributes hidden and out: <b>4 missing</b> and <b>4 unexpected</b> keys. With strict=False the same case loads <b>nothing</b> and returns the report.`,
r(fig, ctl) {
  const S = [
    ["same class", "TinyRegressor()", ["<All keys matched successfully>"], "c-teal", "the safe pattern"],
    ["renamed attributes", "Renamed()   # self.hidden, self.out", ["RuntimeError: Error(s) in loading state_dict for Renamed:", "    Missing key(s) in state_dict: \"hidden.weight\", \"hidden.bias\",", "        \"out.weight\", \"out.bias\".", "    Unexpected key(s) in state_dict: \"layer1.weight\", \"layer1.bias\",", "        \"layer2.weight\", \"layer2.bias\"."], "c-coral", "rename back, or map the keys before loading"],
    ["class into Sequential", "nn.Sequential(nn.Linear(3, 5), nn.ReLU(), nn.Linear(5, 1))", ["RuntimeError: Error(s) in loading state_dict for Sequential:", "    Missing key(s) in state_dict: \"0.weight\", \"0.bias\",", "        \"2.weight\", \"2.bias\".", "    Unexpected key(s) in state_dict: \"layer1.weight\", \"layer1.bias\",", "        \"layer2.weight\", \"layer2.bias\"."], "c-coral", "the structure is part of the names"],
    ["hidden width 6", "Wider()   # Linear(3, 6), Linear(6, 1)", ["RuntimeError: Error(s) in loading state_dict for Wider:", "    size mismatch for layer1.weight: copying a param with shape", "        torch.Size([5, 3]) from checkpoint, the shape in current", "        model is torch.Size([6, 3]).", "    size mismatch for layer1.bias: ... torch.Size([5]) ... torch.Size([6]).", "    size mismatch for layer2.weight: ... ([1, 5]) ... ([1, 6])."], "c-coral", "rebuild with the widths used for training"],
    ["strict=False", "Renamed()   # load_state_dict(sd, strict=False)", ["_IncompatibleKeys(missing_keys=['hidden.weight', 'hidden.bias',", "        'out.weight', 'out.bias'],", "    unexpected_keys=['layer1.weight', 'layer1.bias',", "        'layer2.weight', 'layer2.bias'])"], "c-purple", "no error, and nothing was loaded"]
  ];
  let v = 1;
  ctl.innerHTML = btns(S.map((q, i) => [i, q[0]]), "m9");
  const u = () => {
    pick(ctl, "m9", v); const [name, target, out, cls, note] = S[v];
    let s = `<g class="c-blue"><rect x="30" y="20" width="200" height="100" rx="10" stroke-width="0.8"/></g>` + tx(130, 46, "file: tiny.pt", "middle", "th") + ["layer1.weight (5, 3)", "layer1.bias (5,)", "layer2.weight (1, 5)", "layer2.bias (1,)"].map((k, i) => tx(130, 66 + i * 14, k, "middle")).join("");
    s += arrow(236, 70, 316, 70, "var(--p)", 1.8) + tx(276, 60, "load", "middle", "t");
    s += `<g class="${cls}"><rect x="322" y="20" width="330" height="100" rx="10" stroke-width="1.2"/></g>` + tx(487, 50, name, "middle", "th") + tx(487, 76, v === 0 ? "keys and shapes match" : v === 3 ? "keys match, shapes do not" : "keys do not match", "middle", "t") + tx(487, 100, note, "middle", "t");
    fig.innerHTML = svg(136, s) + ML.code(["torch.save(TinyRegressor().state_dict(), \"tiny.pt\")", "model = " + target, "print(model.load_state_dict(torch.load(\"tiny.pt\")" + (v === 4 ? ", strict=False))" : "))")], 2) + ML.term(out);
  };
  ctl.querySelectorAll("button[data-m9]").forEach(b => b.onclick = () => { v = +b.dataset.m9; u(); }); u();
}},

{s: "10. Freezing and modes", t: "Freeze parameters with requires_grad_(False), switch behavior with train() and eval()",
intu: String.raw`Two switches live on every module and reach every child. The first is per parameter: <code>requires_grad_(False)</code> on a layer freezes it, autograd stops computing its gradient, and the optimizer has nothing to apply. That is how a pretrained feature extractor is kept fixed while a new head is trained, Lesson 37. The second is per module: <code>model.train()</code> and <code>model.eval()</code> set a training flag on the model and on all of its children, and layers such as Dropout and BatchNorm read it. In training mode Dropout zeroes each value with probability p and scales the survivors by 1/(1 − p). In eval mode it passes values through unchanged. Neither switch does the other's job, eval does not freeze anything and freezing does not change dropout. Use both switches.`,
eq: String.raw`\[ \text{Dropout, train: } y_i = \frac{m_i\,x_i}{1 - p},\ \ m_i \sim \text{Bernoulli}(1 - p), \qquad \text{eval: } y_i = x_i \]`,
sym: [[String.raw`\(\texttt{requires\_grad\_(False)}\)`, "freeze, no gradient and no update"], ["model.train()", "training flag True on every child"], ["model.eval()", "training flag False, dropout off, BatchNorm uses running statistics"], ["p", "drop probability, 0.5 here"], ["trainable count", "sum of numel over parameters that still require grad"]],
how: ["Freeze with <code>layer.requires_grad_(False)</code> before building the optimizer.", "Count trainable parameters to confirm the freeze.", "Call <code>model.train()</code> before each training epoch.", "Call <code>model.eval()</code> and use <code>torch.no_grad()</code> for validation.", "Check <code>model.training</code> when results look random at evaluation."],
say: String.raw`Freezing sets requires grad to false so a parameter gets no gradient and no update, while train and eval set a training flag on every submodule that Dropout and BatchNorm read, and the two switches are independent.`,
num: String.raw`MLPDigits with a dropout layer has <b>101,770</b> parameters. Freezing the first Linear leaves <b>1,290</b> trainable and its weight.grad stays None after backward. Dropout with p = 0.5 on eight ones gave <b>(2, 2, 2, 2, 0, 2, 2, 0)</b> in train mode and eight ones in eval mode.`,
r(fig, ctl) {
  let fr = false, ev = false;
  ctl.innerHTML = btns([[0, "first layer trainable"], [1, "freeze first layer"]], "m10f") + btns([[0, "model.train()"], [1, "model.eval()"]], "m10e");
  const u = () => {
    pick(ctl, "m10f", fr ? 1 : 0); pick(ctl, "m10e", ev ? 1 : 0);
    const L = [["Linear(784, 128)", 100480, true], ["ReLU()", 0, false], ["Dropout(0.5)", 0, false], ["Linear(128, 10)", 1290, true]];
    let s = "";
    L.forEach(([n, p, has], i) => {
      const x = 90 + i * 165, frozen = fr && i === 0;
      s += node(x, 60, 150, n, has ? (frozen ? "frozen" : n0(p) + " trainable") : "no parameters", frozen ? "c-gray" : has ? "c-blue" : "c-purple", i === 2 || frozen);
      s += tx(x, 100, "training = " + (ev ? "False" : "True"), "middle", "t");
      if (i < 3) s += arrow(x + 76, 60, x + 88, 60, "var(--p)", 1.5);
    });
    const tr = fr ? 1290 : 101770;
    s += tx(30, 140, `trainable parameters: ${n0(tr)} of 101,770`, null, "th") + tx(30, 162, fr ? "after backward: 0.weight.grad is None, 3.weight.grad has shape (10, 128)" : "after backward: every weight has a gradient", null, "t");
    s += tx(30, 198, "Dropout(0.5) on eight ones, " + (ev ? "eval mode" : "train mode"), null, "th");
    const d = ev ? [1, 1, 1, 1, 1, 1, 1, 1] : [2, 2, 2, 2, 0, 2, 2, 0];
    s += ML.grid([d], { x: 40, y: 214, cell: 46, rowLab: false, colLab: false, hl2: new Set(d.map((q, i) => q === 0 ? "0," + i : "").filter(Boolean)), hl: new Set(ev ? [] : d.map((q, i) => q === 2 ? "0," + i : "").filter(Boolean)) }).s;
    s += tx(430, 240, ev ? "identity, nothing dropped" : "zeros dropped, survivors × 2", null, "t");
    fig.innerHTML = svg(272, s) + ML.code(["if freeze: model[0].requires_grad_(False)", "params = [p for p in model.parameters() if p.requires_grad]", "opt = torch.optim.SGD(params, lr=0.1)", ev ? "model.eval()" : "model.train()", "print(sum(p.numel() for p in params))"], ev ? 3 : fr ? 0 : 3) + ML.term([String(tr)]);
  };
  ctl.querySelectorAll("button[data-m10f]").forEach(b => b.onclick = () => { fr = b.dataset.m10f === "1"; u(); });
  ctl.querySelectorAll("button[data-m10e]").forEach(b => b.onclick = () => { ev = b.dataset.m10e === "1"; u(); }); u();
}},

{s: "11. Debugging a module", t: "Read the error, find the line, fix the structure",
intu: String.raw`HW4 Part 7 hides three structural bugs in BuggyRegressor, and they are the three bugs every first model file has. Without <code>super().__init__()</code> the registration machinery does not exist yet, so the very first layer assignment fails. With the hidden layer producing 4 features and the output layer expecting 3, the matrix product fails, and the message names both shapes: the batch matrix (8x4) and the transposed weight (3x1). With no <code>return</code>, forward returns None and the error appears later, in the loss. Then there are bugs in what you feed the model: the wrong number of features, float64 data against float32 weights, images without Flatten, and the silent one from HW8, a target of shape (N,) against a prediction of shape (N, 1). Step through them.`,
eq: String.raw`\[ \text{(B} \times \text{in) times (in}' \times \text{out)}: \text{ works only if } \text{in} = \text{in}' \]`,
sym: [["(8x4 and 3x1)", "the input to the layer is 8 by 4, the layer's transposed weight is 3 by 1"], ["NoneType", "something returned nothing, usually forward"], ["Double and Float", "NumPy float64 data meeting float32 weights"], ["broadcast warning", "target size differs from input size, the loss is wrong"], ["shape check", "<code>assert out.shape == (B, out_features)</code> in a test"]],
how: ["Read the last line of the traceback first.", "For a matmul error compare the second number of the first shape with the first number of the second shape.", "Print <code>x.shape</code> and <code>x.dtype</code> at the start of forward when in doubt.", "Make targets the same shape as predictions with <code>unsqueeze(1)</code> or <code>view(-1, 1)</code>.", "Pin the output shape for B = 1 and B = 7 in a test."],
say: String.raw`Structural bugs show up as a failed assignment without super, a matmul shape error when consecutive widths disagree, or None when forward does not return, and data bugs show up as feature, dtype or flatten errors, or silently as a broadcast between N by 1 and N.`,
num: String.raw`BuggyRegressor raises <b>cannot assign module before <code>Module.__init__()</code> call</b>, then <b>(8x4 and 3x1)</b>, then returns <b>None</b>. Fixed, it has <b>21</b> parameters. Predictions (1, 2, 3) against targets (1, 2, 4) of shape (3,) give a loss of <b>2.33</b> instead of the true <b>0.33</b>.`,
r(fig, ctl) {
  const B = [
    ["no super()", ["class BuggyRegressor(nn.Module):", "    def __init__(self):", "        self.hidden = nn.Linear(3, 4)", "        self.output = nn.Linear(3, 1)"], 2, ["AttributeError: cannot assign module before", "Module.__init__() call"], "add super().__init__() as the first line of __init__"],
    ["widths disagree", ["        super().__init__()", "        self.hidden = nn.Linear(3, 4)", "        self.output = nn.Linear(3, 1)", "    ...", "out = model(torch.randn(8, 3))"], 2, ["RuntimeError: addmm:", "mat1 and mat2 shapes cannot be multiplied (8x4 and 3x1)"], "the output layer must take 4 features: nn.Linear(4, 1)"],
    ["no return", ["    def forward(self, x):", "        h = torch.relu(self.hidden(x))", "        y = self.output(h)", "", "loss = nn.MSELoss()(model(x), y_true)"], 2, ["AttributeError: 'NoneType' object has no attribute 'size'"], "return self.output(h)"],
    ["wrong features", ["model = FixedRegressor()        # expects 3 features", "out = model(torch.randn(8, 4))"], 1, ["RuntimeError: addmm:", "mat1 and mat2 shapes cannot be multiplied (8x4 and 3x4)"], "the data has 4 columns, the first layer expects 3, fix the data or the layer"],
    ["float64 data", ["X = torch.from_numpy(np_array)  # float64", "out = model(X)"], 1, ["RuntimeError: mat1 and mat2 must have the same dtype,", "but got Double and Float"], "X = X.float(), or create the array as float32"],
    ["no Flatten", ["layer = nn.Linear(784, 10)", "out = layer(torch.randn(16, 1, 28, 28))"], 1, ["RuntimeError: addmm:", "mat1 and mat2 shapes cannot be multiplied (448x28 and 784x10)"], "put nn.Flatten() in front, 16 × 1 × 28 = 448 rows of 28"],
    ["target of shape (N,)", ["pred = model(x)                 # (3, 1): 1, 2, 3", "y = torch.tensor([1., 2., 4.])  # (3,)", "loss = nn.MSELoss()(pred, y)"], 2, ["UserWarning: Using a target size (torch.Size([3])) that is different", "to the input size (torch.Size([3, 1])). This will likely lead to", "incorrect results due to broadcasting.", "tensor(2.3333)"], "y = y.unsqueeze(1), then the loss is 0.3333"]
  ];
  let v = 0;
  ctl.innerHTML = btns(B.map((q, i) => [i, q[0]]), "m11");
  const u = () => {
    pick(ctl, "m11", v); const [name, code, ln, msg, fix] = B[v];
    let s = tx(30, 24, (v < 3 ? "HW4 BuggyRegressor, bug " + (v + 1) + ": " : "feeding the model: ") + name, null, "th");
    const kind = v < 3 ? "structure of the class" : v === 6 ? "silent, only a warning" : "the data does not fit the layer";
    s += `<g class="${v === 6 ? "c-purple" : "c-coral"}"><rect x="30" y="40" width="300" height="50" rx="9" stroke-width="0.8"/></g>` + tx(180, 70, kind, "middle", "t");
    s += `<g class="c-teal"><rect x="350" y="40" width="300" height="50" rx="9" stroke-width="0.8"/></g>` + tx(500, 62, "fix", "middle", "th") + tx(500, 80, fix.length > 46 ? fix.slice(0, 46) + "..." : fix, "middle");
    fig.innerHTML = svg(104, s) + ML.code(code, ln) + ML.term(msg) + `<p class="note">Fix: ${ML.esc(fix)}.</p>`;
  };
  ctl.querySelectorAll("button[data-m11]").forEach(b => b.onclick = () => { v = +b.dataset.m11; u(); }); u();
}},

{s: "12. Modules inside modules", t: "Build a block once, reuse it, and let the names nest",
intu: String.raw`Large models are modules made of modules. Write a small Block with its own <code>__init__</code> and <code>forward</code>, here a Linear and a ReLU with a skip connection, HW10's residual idea. The model holds an input layer, a ModuleList of n blocks and a head. Every name in the state dict is the path from the root: blocks.0.fc.weight is the weight of the fc layer inside block 0. <code>model.modules()</code> walks the whole tree, and <code>model.apply(fn)</code> calls fn on every module in it, the standard way to run a custom initialization. One subtlety: if the same layer object is assigned under two names, its weights are shared, <code>parameters()</code> counts them once, and the state dict lists them under both names. Change the width and the number of blocks.`,
eq: String.raw`\[ P = (2w + w) + n\,(w^2 + w) + (w + 1) = 4w + 1 + n\,(w^2 + w) \]`,
sym: [["Block", "a small module reused n times, Linear(w, w) and ReLU with a skip"], ["w", "width of every hidden layer"], ["n", "number of blocks"], ["dotted name", "the path from the root, blocks.0.fc.weight"], ["apply(fn)", "calls fn on every module, children first, then the parent"]],
how: ["Write each repeated piece as its own small Module.", "Hold the copies in a ModuleList and loop in forward.", "Read parameter names as paths from the root.", "Initialize with <code>model.apply(init_fn)</code>, testing isinstance inside <code>init_fn</code>.", "Count parameters again after any change in depth or width."],
say: String.raw`A model built from submodules names every parameter by its path from the root, modules walks the whole tree, apply runs a function on every module, and a layer assigned twice is shared and counted once.`,
num: String.raw`w = 8, n = 3: 3 × 8 + 3 × 72 + 9 = <b>249</b> parameters and <b>13</b> modules. w = 16, n = 2: <b>609</b>. n = 0 leaves the input layer and the head, <b>17</b> at w = 4. A Linear(4, 4) assigned twice: parameters() gives <b>20</b>, the state dict has <b>4</b> keys.`,
r(fig, ctl) {
  ctl.innerHTML = sl("m12w", "width w", 2, 16, 2, 8) + sl("m12n", "blocks n", 0, 4, 1, 3);
  const u = () => {
    const w = +$("m12w").value, n = +$("m12n").value; $("m12wv").textContent = w; $("m12nv").textContent = n;
    const P = 4 * w + 1 + n * (w * w + w), M = 4 + 3 * n;
    let s = node(80, 70, 120, "inp", `Linear(2, ${w})`, "c-blue") + tx(80, 110, 3 * w + " params", "middle");
    const bx = 170, bw = n ? Math.min(110, 360 / n) : 0;
    s += `<g class="c-gray"><rect x="${bx - 6}" y="28" width="${Math.max(120, n * bw + 12)}" height="116" rx="10" stroke-width="0.6" stroke-dasharray="4 4"/></g>` + tx(bx, 22, "blocks: ModuleList", null);
    for (let i = 0; i < n; i++) { const x = bx + i * bw + bw / 2; s += node(x, 70, bw - 10, "blocks." + i, "fc + act", "c-purple") + tx(x, 110, (w * w + w) + " params", "middle"); }
    if (!n) s += tx(bx + 54, 76, "empty", "middle");
    const hx = Math.max(bx + 140, bx + n * bw + 70);
    s += node(hx, 70, 110, "head", `Linear(${w}, 1)`, "c-blue") + tx(hx, 110, (w + 1) + " params", "middle");
    s += tx(30, 176, `P = 4w + 1 + n(w² + w) = ${4 * w + 1} + ${n} × ${w * w + w} = ${P}`, null, "th");
    s += tx(30, 200, `model.modules() visits ${M} modules: model, inp, ModuleList, ${n} × (block, fc, act), head`, null, "t");
    const names = ["inp.weight", "inp.bias"].concat(n ? ["blocks.0.fc.weight", "blocks.0.fc.bias"] : []).concat(n > 1 ? ["...", `blocks.${n - 1}.fc.bias`] : []).concat(["head.weight", "head.bias"]);
    s += tx(30, 228, "names: " + names.join(", "), null);
    fig.innerHTML = svg(246, s) + ML.code(["class Block(nn.Module):", "    def __init__(self, w):", "        super().__init__()", "        self.fc = nn.Linear(w, w)", "        self.act = nn.ReLU()", "    def forward(self, x):", "        return x + self.act(self.fc(x))", "", "class Net(nn.Module):", "    def __init__(self, w, n):", "        super().__init__()", "        self.inp = nn.Linear(2, w)", "        self.blocks = nn.ModuleList([Block(w) for _ in range(n)])", "        self.head = nn.Linear(w, 1)", "    def forward(self, x):", "        x = self.inp(x)", "        for block in self.blocks:", "            x = block(x)", "        return self.head(x)", "", `model = Net(${w}, ${n})`, "P = sum(p.numel() for p in model.parameters())", "print(P, len(list(model.modules())))"], 12) + ML.term([P + " " + M]);
  };
  $("m12w").oninput = u; $("m12n").oninput = u; u();
}},

{s: "13. With the agent", t: "Do it with the agent: a model file with its own tests",
intu: String.raw`The lesson as project code: a <code>models.py</code> with the MLP for 28 by 28 images and a configurable regressor, a helper that counts trainable parameters and one that prints the shape after every layer, and tests that pin the counts and the shapes for B = 1 and B = 7. These tests are cheap and catch most architecture mistakes before a single epoch runs, so the agent should write them for every model in your project. Ask for the state dict round trip as well, so saving and loading are tested from the start.`,
eq: String.raw`\[ \texttt{models.py} \to \texttt{count\_parameters} \to \texttt{pytest} \]`,
sym: [["models.py", "every architecture of the project in one file"], [String.raw`\(\texttt{count\_parameters}\)`, "trainable numel summed"], [String.raw`\(\texttt{trace\_shapes}\)`, "forward hooks that print each layer's output shape"], ["round trip", "save the state dict, load into a fresh model, same outputs"], ["tests", "this lesson's counts and shapes"]],
how: ["Paste the command.", "Read models.py: super first, every layer registered, forward returns.", "Read the tests: counts, shapes for B = 1 and B = 7, the round trip.", "Run pytest and compare the numbers with the cards.", "Commit, then add a test for every new model you write."],
say: String.raw`A models file with a parameter counter, a shape tracer and tests for counts, shapes and the state dict round trip catches architecture mistakes before any training.`,
num: String.raw`Tests expect <b>101,770</b> parameters for the MLP and <b>7,850</b> for the linear model, output <b>(1, 10)</b> and <b>(7, 10)</b>, <b>3H + 1</b> for the regressor at H = 1 and 50, and identical outputs after a state dict round trip.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/models.py with torch only. MLPDigits(hidden=128) uses nn.Flatten, nn.Linear(784, hidden), nn.ReLU and nn.Linear(hidden, 10) and returns raw logits. LinearDigits uses nn.Flatten and nn.Linear(784, 10). SimpleNN(hidden) maps (N, 1) to (N, 1) with one ReLU hidden layer and no activation on the output. Add count_parameters(model) that sums numel over parameters with requires_grad, and trace_shapes(model, x) that registers a forward hook on every child, runs one forward pass, removes the hooks and returns a list of (name, output shape). Create tests/test_models.py: count_parameters gives 101770, 7850, 4 for SimpleNN(1) and 151 for SimpleNN(50). Outputs have shape (1, 10) and (7, 10) for inputs of shape (1, 1, 28, 28) and (7, 1, 28, 28). trace_shapes on MLPDigits returns (7, 784), (7, 128), (7, 128), (7, 10). A state_dict saved with torch.save to a tmp_path file and loaded into a fresh MLPDigits gives identical outputs on the same input in eval mode. Freezing the first Linear leaves 1290 trainable parameters. Run pytest and show me the output.",
    actions: ["$ pytest -q tests/test_models.py", "......                                                   [100%]", "6 passed in 1.12s"],
    files: [["src/models.py", "MLPDigits, LinearDigits, SimpleNN, count_parameters, trace_shapes"], ["tests/test_models.py", "counts, shapes, hooks, round trip, freezing"]],
    checks: ["every __init__ starts with super().__init__()", "no layers kept in a plain Python list", "forward returns logits, no softmax inside the model", "trace_shapes removes its hooks with the returned handles", "the round trip test calls eval() on both models before comparing", "the freezing test counts only parameters with requires_grad"]
  });
}},

{s: "14. Test", t: "Lesson 23 test: nn.Module",
intu: String.raw`Twelve questions on layers, registration, counting, shapes, containers, the state dict, loading, freezing and debugging. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the widths out before counting.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to the training loop.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "How many parameters does <code>nn.Linear(20, 6)</code> have?", o: ["120", "126", "140", "26"], a: 1, why: "6 × 20 weights plus 6 biases = 126. Card 5." },
    { q: "What is the shape of <code>nn.Linear(6, 4).weight</code>?", o: ["(6, 4)", "(4, 6)", "(4,)", "(24,)"], a: 1, why: "The weight is (out, in), one row per output unit. Card 2." },
    { q: "W = [[2, 0], [1, −1], [0, 3]] and b = (1, 0, −2) in a Linear(2, 3). The output for x = (1, 2) is", o: ["(3, −1, 4)", "(2, −1, 6)", "(3, 1, 4)", "(1, −3, 4)"], a: 0, why: "Row by row: 2 + 0 + 1 = 3, 1 − 2 + 0 = −1, 0 + 6 − 2 = 4. Card 2." },
    { q: "A network Linear(10, 16), ReLU, Linear(16, 16), ReLU, Linear(16, 3) has how many parameters?", o: ["451", "499", "480", "547"], a: 1, why: "176 + 272 + 51 = 499. ReLU adds nothing. Card 5." },
    { q: "A model with 2 inputs, one hidden layer of width 12 and 1 output has how many parameters?", o: ["37", "49", "48", "61"], a: 1, why: "Linear(2, 12) has 36, Linear(12, 1) has 13, total 4H + 1 = 49. Card 5." },
    { q: "In <code>__init__</code>: <code>self.layers = [nn.Linear(5, 5), nn.Linear(5, 5)]</code> and <code>self.out = nn.Linear(5, 1)</code>. What does the parameter count report?", o: ["66", "6", "60", "0"], a: 1, why: "A plain list is not registered, only out counts: 5 + 1 = 6. Use nn.ModuleList. Card 3." },
    { q: "The keys of <code>nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Dropout(0.2), nn.Linear(8, 2)).state_dict()</code> are", o: ["0.weight, 0.bias, 1.weight, 1.bias", "0.weight, 0.bias, 3.weight, 3.bias", "linear.weight, linear.bias", "0.weight, 0.bias, 2.weight, 2.bias, 3.weight, 3.bias"], a: 1, why: "Children are named by position and ReLU and Dropout hold nothing, so only positions 0 and 3 have keys. Card 7." },
    { q: "<code>nn.BatchNorm1d(6)</code> has how many parameters and how many state dict entries?", o: ["12 and 2", "12 and 5", "24 and 5", "6 and 3"], a: 1, why: "weight and bias of length 6 are trained, running_mean, running_var and num_batches_tracked are buffers, so 5 entries. Card 8." },
    { q: "<code>nn.Linear(784, 10)</code> receives a batch of shape (16, 1, 28, 28). What happens?", o: ["output (16, 10)", "error: shapes cannot be multiplied (448x28 and 784x10)", "output (16, 1, 28, 10)", "error: expected 4D input"], a: 1, why: "Linear acts on the last dimension, 28, after folding 16 × 1 × 28 = 448 rows. Flatten first. Cards 6 and 11." },
    { q: "Linear(50, 20), ReLU, Linear(20, 5). After <code>model[0].requires_grad_(False)</code>, how many parameters are trainable?", o: ["1,125", "105", "1,020", "0"], a: 1, why: "Only Linear(20, 5) is trainable: 100 + 5 = 105 of 1,125. Card 10." },
    { q: "A forward hook is registered on the model itself. Which call runs it?", o: ["model.forward(x)", "model(x)", "both", "neither, hooks run only in eval mode"], a: 1, why: "Hooks run inside __call__, which model(x) uses and model.forward(x) skips. Card 4." },
    { q: "You renamed <code>self.fc</code> to <code>self.hidden</code> and load an old checkpoint. The error lists", o: ["a size mismatch for hidden.weight", "missing keys hidden.weight, hidden.bias and unexpected keys fc.weight, fc.bias", "nothing, loading matches by position", "a dtype mismatch"], a: 1, why: "Loading matches by name. Rename back or map the keys. Card 9." }
  ], "Lesson 23 test");
}}
],
summary: String.raw`An nn.Module is a Python class whose initializer stores layers as attributes after calling super, and whose forward method describes the computation. The base class discovers the tree of children, so parameters, device moves, train and eval, and the state dict reach every layer. nn.Linear stores a weight of shape out by in and a bias of length out and maps a batch B by in to X times W transposed plus b. Only modules, Parameter objects and buffers are registered, a plain tensor or a plain list of layers stays invisible, and ModuleList fixes the list. Calling model of x runs hooks around forward. A linear layer has out times in plus out parameters and activations have none, so counting is a sum over layers, and shape tracing replaces the last dimension at every Linear while the batch dimension survives. Sequential names children by position, the state dict holds parameters and buffers as live tensors that need a deep copy for a snapshot, and loading matches names and shapes exactly. Freezing stops gradients, eval changes dropout and BatchNorm, and the usual bugs are a missing super, widths that disagree, a missing return and data of the wrong shape or dtype.`,
sheet: [[String.raw`\[ Y = X W^\top + b \]`, "nn.Linear on a batch"], [String.raw`\[ W \in \mathbb{R}^{\text{out} \times \text{in}},\ \ b \in \mathbb{R}^{\text{out}} \]`, "weight and bias shapes"], [String.raw`\[ P_{\text{layer}} = n^{[l]} n^{[l-1]} + n^{[l]} \]`, "parameters of one Linear layer"], [String.raw`\[ P = 3H + 1 \]`, "one input, H hidden units, one output"], [String.raw`\[ 10 \cdot 784 + 10 = 7850 \]`, "linear model on MNIST"], [String.raw`\[ 128 \cdot 784 + 128 + 10 \cdot 128 + 10 = 101770 \]`, "MLP with 128 hidden units"], [String.raw`\[ (B, 1, 28, 28) \to (B, 784) \to (B, 128) \to (B, 10) \]`, "shape trace"], [String.raw`\[ \text{Dropout: } y = \frac{m \odot x}{1 - p} \]`, "training mode only"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW4 Parts 4 to 7 (classes and object state, inheritance and super, TinyRegressor with named_parameters and state_dict, BuggyRegressor and FixedRegressor)", "AME 5970 HW8 2B (SimpleNN, 3H + 1 parameters, the (N, 1) minus (N,) trap) and HW9 4B (LinearDigits and MLPDigits, Flatten, 7,850 and 101,770 parameters), with the HW8 and HW9 solutions docs", "AME 5970 HW10 (BatchNorm buffers, residual blocks) with the HW10 solutions doc", "Andrew Ng, Deep Learning Specialization, course 1 week 3 (neural network representation) and week 4 (getting your matrix dimensions right)", "Raschka, Liu and Mirjalili (2022), Machine Learning with PyTorch and Scikit-Learn, chapter 13 (building models with torch.nn)", "PyTorch documentation: torch.nn.Module, nn.Linear, nn.Sequential, nn.ModuleList, Saving and loading models, register_forward_hook"]
});
})();
