(function () {
/* ML shelf, Part 5, Lesson 21: Tensors. Follows the topic order of the AME 5970 Lecture 4 notes (PyTorch and OOP) and HW4 Parts 1 to 3 (shapes, indexing, reductions, broadcasting, reshape and memory layout, NumPy interoperability), with HW7 section 2 (reductions and the wrong target shape), HW8 (shape conventions and the (N, 1) minus (N,) trap) and HW9 2B (feature and target dtypes). Andrew Ng's Deep Learning Specialization course 1 week 2 (vectorization, broadcasting, the note on rank 1 vectors) is the spine, with Raschka chapter 12 and the PyTorch documentation for the tensor API. Every number on the cards was computed with PyTorch 2.15 on the CPU. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const shp = s => s.length === 0 ? "()" : s.length === 1 ? `(${s[0]},)` : `(${s.join(", ")})`;
const prod = s => s.reduce((p, v) => p * v, 1);
/* shape chips: one box per axis with its size, and a label under it */
const chips = (x, y, shape, labs, col, w) => {
  w = w || 92; let s = "";
  if (!shape.length) return { s: `<g class="c-gray"><rect x="${x}" y="${y}" width="${w}" height="40" rx="7" stroke-width="0.8"/></g>` + tx(x + w / 2, y + 26, "( )", "middle", "th") + tx(x + w / 2, y + 56, "no axes", "middle"), w: w };
  shape.forEach((n, i) => {
    const xi = x + i * (w + 8);
    s += `<g class="${col || "c-blue"}"><rect x="${xi}" y="${y}" width="${w}" height="40" rx="7" stroke-width="0.8"/></g>` + tx(xi + w / 2, y + 26, n, "middle", "th");
    if (labs && labs[i]) s += tx(xi + w / 2, y + 56, labs[i], "middle");
    s += tx(xi + 6, y + 12, "dim " + i, null);
  });
  return { s, w: shape.length * (w + 8) - 8 };
};
/* draw values of a tensor with shape s (0 to 3 axes) as cells */
const cells = (x, y, s, vals, o) => {
  o = o || {}; const c = o.cell || 34, fmt = o.fmt || (v => v); let out = "";
  const box = (xx, yy, v, on) => `<rect x="${xx}" y="${yy}" width="${c - 3}" height="${c - 3}" rx="4" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 1.6 : 1}"/>` + `<text class="t" x="${xx + (c - 3) / 2}" y="${yy + c / 2 + 3}" text-anchor="middle" style="font-family:var(--mono);font-size:${c > 32 ? 12 : 11}px">${fmt(v)}</text>`;
  if (s.length === 0) return box(x, y, vals[0], true);
  if (s.length === 1) { vals.forEach((v, i) => out += box(x + i * c, y, v, true)); return out; }
  if (s.length === 2) { for (let i = 0; i < s[0]; i++) for (let j = 0; j < s[1]; j++) out += box(x + j * c, y + i * c, vals[i * s[1] + j], true); return out; }
  for (let k = 0; k < s[0]; k++) for (let i = 0; i < s[1]; i++) for (let j = 0; j < s[2]; j++) out += box(x + k * (s[2] * c + 16) + j * c, y + i * c, vals[(k * s[1] + i) * s[2] + j], true);
  return out;
};

addLesson("ml", "torch", {
level: "Foundations", num: "Lesson 21",
id: "ml-torch-l21", title: "Tensors", short: "21. Tensors",
big: String.raw`Everything PyTorch computes is a tensor: a block of numbers with a shape, a dtype and a device. A tensor is a NumPy array that can also live on a GPU and record the operations that made it, and this lesson is about the first three facts, autograd comes in Lesson 22. You will create tensors from data, by shape and at random, read their dtype and see why float32 is the default, why labels are int64 and what goes wrong when a float64 NumPy array meets a float32 model. Then the shape work that fills every homework from HW4 on: indexing a (4, 3, 2) tensor, reductions that remove the axis you name, squeeze, flatten and permute, and broadcasting with its silent (N, 1) minus (N,) trap. The last cards open the box: a tensor is a view on flat storage with strides, so a transpose is free, view can fail where reshape copies, and <code>from_numpy</code> shares memory with the array it came from. The final card puts it together as one matrix product that predicts a whole batch.`,
bridge: String.raw`The topics follow the professor's Lecture 4 notes on PyTorch in topic order, and the examples are HW4 Parts 1 to 3 (shapes, indexing, reductions, broadcasting, reshape and memory layout, NumPy interoperability), with the shape conventions and the broadcasting trap from HW8, the reduction example from HW7 section 2 and the feature and target dtypes from HW9 2B. Andrew Ng's Deep Learning Specialization, course 1 week 2 (vectorization, broadcasting in Python, a note on Python and NumPy vectors) is the spine, and the tensor API follows chapter 12 of the course textbook by Raschka and the PyTorch documentation. Lessons 8 and 9 did the same ideas in NumPy, so this lesson concentrates on what is new or different in PyTorch.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. What a tensor is", t: "A tensor is a block of numbers with a shape, a dtype and a device",
intu: String.raw`A tensor is PyTorch's array. It stores numbers of one dtype on one device and arranges them along axes, and the shape lists the size of each axis. The same object holds a single loss value, one house from HW3 with two features, the whole table of 47 houses, a column of targets, a vector of class labels and a batch of 64 digit images. HW8 states the conventions this shelf uses from now on: tabular data are (N, D), a one-output model returns (N, 1), one grayscale image is (1, H, W) and a batch is (B, 1, H, W). Pick an example and read every axis out loud before you write code that uses it.`,
eq: String.raw`\[ \text{numel} = \prod_{k} n_k, \qquad \text{bytes} = \text{numel} \times \text{element size} \]`,
sym: [["shape", "a tuple of axis sizes, <code>x.shape</code> or <code>x.size()</code>"], ["ndim", "the number of axes, the length of the shape"], ["numel", "how many numbers, the product of the shape"], ["dtype", "the type of every element, float32 by default for real numbers"], ["device", "where the numbers live, cpu or cuda:0"]],
how: ["Print <code>x.shape</code>, <code>x.dtype</code> and <code>x.device</code> the first time you meet a tensor.", "Name every axis: samples, features, outputs, channels, height, width.", "Check that the batch axis comes first, PyTorch layers expect it there.", "Multiply out the shape to know the memory: 4 bytes per float32, 8 per int64.", "Keep the batch axis even for one sample: (1, D), never (D,), when it goes into a model."],
say: String.raw`A tensor is an array of one dtype on one device, its shape lists the size of each axis, and the first axis of anything that enters a model is the batch.`,
num: String.raw`A batch of 64 digits, shape (64, 1, 28, 28), holds <b>50,176</b> numbers, <b>200,704</b> bytes in float32. Its 64 labels, shape (64,) in int64, take <b>512</b> bytes. HW3's table of houses, (47, 2), holds 94 numbers.`,
note: String.raw`On the exam, a shape question is answered axis by axis with the meaning of each axis, for example (64, 1, 28, 28) is 64 images, 1 channel, 28 rows, 28 columns.`,
r(fig, ctl) {
  const K = [
    ["a loss value", [], "float32", [], "loss = torch.tensor(0.4834)", "one number, the mean loss of a batch"],
    ["one house", [2], "float32", ["features"], "x = torch.tensor([2104.0, 3.0])", "size in square feet and bedrooms, HW3 ex1data2"],
    ["a table", [47, 2], "float32", ["samples", "features"], "X = torch.tensor(data[:, :2], dtype=torch.float32)", "47 houses, one row each"],
    ["targets", [47, 1], "float32", ["samples", "outputs"], "y = torch.tensor(data[:, 2:3], dtype=torch.float32)", "one price per row, the shape a one-output model returns"],
    ["class labels", [64], "int64", ["samples"], "labels = torch.randint(0, 10, (64,))", "one class index per image, the target of CrossEntropyLoss"],
    ["one image", [1, 28, 28], "float32", ["channel", "height", "width"], "img = torch.zeros(1, 28, 28)", "one grayscale digit"],
    ["image batch", [64, 1, 28, 28], "float32", ["batch", "channel", "height", "width"], "xb = torch.zeros(64, 1, 28, 28)", "what a DataLoader hands you for MNIST"],
    ["color batch", [32, 3, 32, 32], "float32", ["batch", "channels", "height", "width"], "xb = torch.zeros(32, 3, 32, 32)", "32 RGB images of CIFAR-10 size"]
  ];
  let v = 6;
  ctl.innerHTML = btns(K.map((k, i) => [i, k[0]]), "k1") + `<div id="k1r"></div>`;
  const u = () => {
    pick(ctl, "k1", v);
    const [name, s, dt, labs, code, what] = K[v], n = prod(s), bytes = n * (dt === "int64" ? 8 : 4);
    let g = tx(30, 22, `${name}: shape ${shp(s)}`, null, "th") + tx(30, 40, what, null);
    g += chips(30, 56, s, labs).s;
    /* schematic of the block */
    const c = 12, y0 = 150;
    const grid = (x, y, r, cc, col) => { let o = ""; for (let i = 0; i < r; i++) for (let j = 0; j < cc; j++) o += `<rect x="${x + j * c}" y="${y + i * c}" width="${c - 2}" height="${c - 2}" rx="2" fill="${col}" fill-opacity="0.35" stroke="${col}" stroke-width="0.6"/>`; return o; };
    if (s.length === 0) g += grid(60, y0 + 30, 1, 1, C.coral);
    else if (s.length === 1) { g += grid(60, y0 + 30, 1, Math.min(s[0], 32), s[0] > 32 ? C.purple : C.teal); if (s[0] > 32) g += tx(60 + 32 * c + 6, y0 + 40, "… " + s[0] + " in all", null); }
    else if (s.length === 2) { g += grid(60, y0, Math.min(s[0], 9), Math.min(s[1], 8), C.blue); if (s[0] > 9) g += tx(60, y0 + 9 * c + 14, `… ${s[0]} rows in all`, null); }
    else if (s.length === 3) { for (let k = s[0] - 1; k >= 0; k--) g += grid(60 + k * 10, y0 - k * 10 + 20, 7, 7, C.purple); g += tx(60, y0 + 116, `${s[0]} channel, each ${s[1]} by ${s[2]} (drawn 7 by 7)`, null); }
    else { for (let b = 0; b < 4; b++) for (let k = Math.min(s[1], 3) - 1; k >= 0; k--) g += grid(60 + b * 110 + k * 8, y0 - k * 8 + 20, 6, 6, s[1] === 3 ? [C.coral, C.teal, C.blue][k] : C.purple); g += tx(500, y0 + 56, `… ${s[0]} images`, null) + tx(60, y0 + 116, `each image ${s[1]} by ${s[2]} by ${s[3]} (drawn 6 by 6)`, null); }
    fig.innerHTML = svg(286, g) + ML.code([code, "print(x.shape, x.dtype, x.device)"], 0);
    $("k1r").innerHTML = ML.readout([["ndim", s.length], ["numel", n.toLocaleString("en-US")], ["dtype", dt], ["bytes", bytes.toLocaleString("en-US")], ["device", "cpu"]]);
  };
  ctl.querySelectorAll("button[data-k1]").forEach(b => b.onclick = () => { v = +b.dataset.k1; u(); }); u();
}},

{s: "2. Creating tensors", t: "Make a tensor from data, by shape, by range or at random",
intu: String.raw`There are four ways to get a tensor. From data: <code>torch.tensor</code> copies a list or an array and infers the dtype, integers become int64 and decimals become float32. By shape: <code>zeros</code>, <code>ones</code>, <code>full</code> and <code>eye</code> take the sizes of the axes. By range: <code>arange</code> stops before the end like Python's range, <code>linspace</code> includes the end and takes a count. At random: <code>randn</code> draws from N(0, 1) and <code>manual_seed</code> makes the draw repeatable, HW4 starts with <code>torch.manual_seed(7)</code>. The last button is HW4's first surprise: <code>arange</code> of integers cannot take a mean.`,
eq: String.raw`\[ \texttt{arange(0, 10, 3)} = [0, 3, 6, 9] \]
\[ \texttt{linspace(0, 1, 5)} = [0, 0.25, 0.5, 0.75, 1] \]`,
sym: [["torch.tensor(data)", "copies the data, infers int64, float32 or bool"], ["zeros, ones, full, eye", "fill a given shape, float32 unless you pass dtype"], ["arange(start, stop, step)", "stop excluded, integer inputs give int64"], ["linspace(a, b, n)", "n points, both ends included, float32"], [String.raw`\(\texttt{manual\_seed(s)}\)`, "fixes the random generator so randn repeats"]],
how: ["Pick the constructor by what you have: data, a shape, a range or a distribution.", "Pass <code>dtype=torch.float32</code> when the data come from somewhere you do not control.", "Seed once at the top of the notebook, as HW4 does, before any random tensor.", "Use <code>zeros_like(x)</code> to copy the shape, dtype and device of x.", "Convert integer tensors with <code>.float()</code> before mean, std or a model."],
say: String.raw`torch.tensor copies data and infers the dtype, zeros, ones and full build a shape, arange excludes its end while linspace includes it, and <code>manual_seed</code> makes random tensors repeatable.`,
num: String.raw`After <code>torch.manual_seed(0)</code>, <code>torch.randn(2, 3)</code> starts with <b>1.5410, −0.2934, −2.1788</b>. <code>torch.arange(1, 25).mean()</code> raises, and <code>.float().mean()</code> gives <b>12.5</b>, HW4 Part 1.`,
r(fig, ctl) {
  const K = [
    ["torch.tensor([[1, 2], [3, 4]])", [2, 2], [1, 2, 3, 4], "int64", "integers in, int64 out", 0],
    ["torch.tensor([1.0, 2.5])", [2], [1, 2.5], "float32", "a decimal point makes it float32", 1],
    ["torch.zeros(2, 3)", [2, 3], [0, 0, 0, 0, 0, 0], "float32", "the sizes of the axes, as arguments or a tuple", 1],
    ["torch.full((2, 2), 7.0)", [2, 2], [7, 7, 7, 7], "float32", "a shape and a fill value", 1],
    ["torch.eye(3)", [3, 3], [1, 0, 0, 0, 1, 0, 0, 0, 1], "float32", "the identity matrix of Lesson 12", 1],
    ["torch.arange(0, 10, 3)", [4], [0, 3, 6, 9], "int64", "stops before 10, like range", 0],
    ["torch.linspace(0, 1, 5)", [5], [0, 0.25, 0.5, 0.75, 1], "float32", "5 points, both ends included", 2],
    ["torch.manual_seed(0); torch.randn(2, 3)", [2, 3], [1.5410, -0.2934, -2.1788, 0.5684, -1.0845, -1.3986], "float32", "N(0, 1) draws, the same every time after this seed", 4],
    ["torch.arange(1, 25).mean()", null, null, "int64", "", 0]
  ];
  let v = 0;
  ctl.innerHTML = `<div class="row">${K.map((k, i) => `<button data-k2="${i}" style="font-family:var(--mono);font-size:12px">${k[0].replace("torch.manual_seed(0); ", "seed 0, ")}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k2", v);
    const [code, s, vals, dt, note, d] = K[v];
    if (!s) {
      fig.innerHTML = svg(70, tx(30, 26, "integers cannot be averaged without a float dtype", null, "th") + tx(30, 50, "HW4 Part 1 converts first: tensor_3d.float().mean()", null)) +
        ML.code(["t = torch.arange(1, 25)        # int64", "t.mean()", "t.float().mean()               # tensor(12.5000)"], 1) +
        ML.term(["NotImplementedError: mean(): could not infer output dtype. Input dtype must be either a floating point or complex dtype. Got: Long"]);
      return;
    }
    let g = tx(30, 22, `shape ${shp(s)}, dtype ${dt}`, null, "th") + tx(30, 40, note, null);
    g += cells(40, 60, s, vals, { cell: 50, fmt: x => dt === "int64" ? x : d ? (+x).toFixed(d) : (+x).toFixed(0) + "." });
    const h = 60 + (s.length === 2 ? s[0] : 1) * 50 + 20;
    fig.innerHTML = svg(h, g) + ML.code([code.replace("; ", "\n").split("\n")].flat(), -1);
  };
  ctl.querySelectorAll("button[data-k2]").forEach(b => b.onclick = () => { v = +b.dataset.k2; u(); }); u();
}},

{s: "3. dtype", t: "The dtype sets precision, memory and which operations are allowed",
intu: String.raw`Every element of a tensor has the same dtype. float32 is PyTorch's default for real numbers and the dtype of every layer's weights. NumPy's default is float64, which is why arrays need a conversion before they meet a model. Integer labels are int64, the dtype CrossEntropyLoss expects, and comparisons give bool masks. When two dtypes meet, the result takes the higher one in the order bool, uint8, int64, float16, float32, float64, and an integer tensor divided by 2 becomes float32 because / is always true division. Pick two dtypes to read the result off the table, then read what each dtype can and cannot hold.`,
eq: String.raw`\[ \text{bool} \lt \text{uint8} \lt \text{int64} \lt \text{float16} \lt \text{float32} \lt \text{float64} \]`,
sym: [["float32", "default, 4 bytes, about 7 significant digits"], ["float64", "NumPy's default, 8 bytes, about 16 digits"], ["int64", "labels and indices, also called long"], ["bool", "masks from comparisons, a sum counts the True values"], ["promotion", "an operation on two dtypes returns the higher one"]],
how: ["Read <code>x.dtype</code> after every conversion from NumPy or pandas.", "Convert features with <code>.float()</code> or <code>dtype=torch.float32</code> before the model.", "Keep class labels as int64 with <code>.long()</code> for CrossEntropyLoss.", "Use <code>/</code> for true division and <code>//</code> only when you want the floor.", "Never store image arithmetic in uint8, it wraps around at 256."],
say: String.raw`Model weights are float32 by default, labels are int64, masks are bool, and when dtypes mix the result takes the higher dtype, so features from NumPy must be converted to float32 before they reach a layer.`,
num: String.raw`float32 has machine epsilon <b>1.19e-7</b>, so 16,777,217 is stored as 16,777,216. float16 overflows above <b>65,504</b>. In uint8, 250 + 10 gives <b>4</b>. <code>torch.tensor([7, −7]) // 2</code> gives <b>(3, −4)</b>, the floor.`,
note: String.raw`HW9 2B prints features (7, 2) float32, logits (7, 3) float32 and targets (7,) int64. Those three dtypes are the ones to expect in every classification project.`,
r(fig, ctl) {
  const D = ["bool", "uint8", "int64", "float16", "float32", "float64"], AB = ["bool", "u8", "i64", "f16", "f32", "f64"];
  const R = ["Python int 2", "Python float 2.5"];
  const INFO = {
    bool: ["1 byte", "True or False", "masks: <code>x[x > 0]</code>", "<code>torch.tensor([True, False, True]).sum()</code> gives tensor(2), int64"],
    uint8: ["1 byte", "0 to 255", "raw image pixels before ToTensor", "<code>torch.tensor([250], dtype=torch.uint8) + 10</code> gives tensor([4]), it wraps"],
    int64: ["8 bytes", "±9.2e18, whole numbers", "class labels, indices, counts", "<code>torch.arange(1, 25).mean()</code> raises, convert with .float() first"],
    float16: ["2 bytes", "max 65,504, eps 9.8e-4", "mixed precision on a GPU, Lesson 26", "<code>torch.tensor(70000., dtype=torch.float16)</code> gives inf, 0.1 is stored as 0.0999756"],
    float32: ["4 bytes", "max 3.4e38, eps 1.19e-7", "weights, features, losses: the default", "<code>torch.tensor(16777217.0)</code> gives 16777216., 0.1 is stored as 0.10000000149"],
    float64: ["8 bytes", "max 1.8e308, eps 2.2e-16", "NumPy arrays, high precision checks", "a float64 batch into a float32 nn.Linear raises RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float"]
  };
  let a = 2, b = 4;
  ctl.innerHTML = `<div class="sec">left: a tensor of dtype</div>` + btns(D.map((d, i) => [i, d]), "da") + `<div class="sec">right: a tensor of dtype, or a Python number</div>` + btns(D.map((d, i) => [i, d]).concat(R.map((r, i) => [6 + i, r])), "db");
  const res = (i, j) => j < 6 ? D[Math.max(i, j)] : j === 6 ? (i === 0 ? "int64" : D[i]) : (i < 3 ? "float32" : D[i]);
  const u = () => {
    pick(ctl, "da", a); pick(ctl, "db", b);
    let g = tx(30, 22, "result dtype of left + right for two tensors", null, "th");
    const x0 = 110, y0 = 52, c = 44;
    AB.forEach((t, j) => g += tx(x0 + j * c + c / 2, y0 - 8, t, "middle"));
    AB.forEach((t, i) => g += tx(x0 - 10, y0 + i * c + c / 2 + 4, t, "end"));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const on = i === a && j === b, r = D[Math.max(i, j)];
      g += `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c - 3}" height="${c - 3}" rx="4" fill="${on ? "var(--teal-bg)" : (i === a || j === b) && b < 6 ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x0 + j * c + (c - 3) / 2, y0 + i * c + c / 2 + 3, AB[D.indexOf(r)], "middle", "t");
    }
    g += tx(x0 + 3 * c, y0 + 6 * c + 20, "rows: left dtype, columns: right dtype", "middle");
    const r = res(a, b), I = INFO[D[a]];
    g += tx(410, 60, `${D[a]} + ${b < 6 ? D[b] : R[b - 6]}`, null, "th") + tx(410, 84, `gives ${r}`, null, "th");
    g += tx(410, 120, `${D[a]}: ${I[0]}, ${I[1]}`, null, "t") + tx(410, 142, `used for ${I[2].replace(/<[^>]+>/g, "")}`, null);
    g += tx(410, 178, b === 7 && a < 3 ? "a Python float makes an integer" : b === 6 && a === 0 ? "a Python int makes a bool" : "", null) + tx(410, 196, b === 7 && a < 3 ? "tensor float32, the default dtype" : b === 6 && a === 0 ? "tensor int64" : "", null);
    fig.innerHTML = svg(340, g) + `<p class="note">${D[a]} trap: ${I[3]}</p>`;
  };
  ctl.querySelectorAll("button[data-da]").forEach(x => x.onclick = () => { a = +x.dataset.da; u(); });
  ctl.querySelectorAll("button[data-db]").forEach(x => x.onclick = () => { b = +x.dataset.db; u(); }); u();
}},

{s: "4. Device", t: "Every tensor lives on one device, and an operation needs all its inputs on the same one",
intu: String.raw`A tensor's numbers sit either in the computer's main memory, device cpu, or in a GPU's own memory, cuda:0 or mps on a Mac. HW4 opens by choosing the device: cuda if available, else mps, else cpu. An operation runs where its inputs are, so all of them must be on the same device, and a model and its batch must move together. Two details catch everyone. <code>x.to(device)</code> returns a new tensor and leaves x where it was unless you assign the result, while <code>model.to(device)</code> moves the model's parameters in place. And NumPy only reads main memory, so a GPU tensor must come back with <code>.cpu()</code> before <code>.numpy()</code>. Step through the six situations.`,
eq: String.raw`\[ \texttt{x = x.to(device)}, \qquad \texttt{model.to(device)} \]
\[ \texttt{pred.detach().cpu().numpy()} \]`,
sym: [["cpu", "main memory, always available, what NumPy uses"], ["cuda:0", "the first NVIDIA GPU"], ["mps", "Apple silicon GPU"], [".to(device)", "copies a tensor to a device and returns it, a no-op if it is already there"], [".cpu()", "copies a tensor back to main memory"]],
how: ["Choose <code>device</code> once at the top, as HW4 does.", "Move the model once: <code>model.to(device)</code>.", "Move every batch inside the loop: <code>xb, yb = xb.to(device), yb.to(device)</code>.", "Create new tensors with <code>device=x.device</code> so they land next to x.", "Bring results back with <code>.detach().cpu()</code> before NumPy or Matplotlib."],
say: String.raw`A tensor lives on one device, every input of an operation must be on the same device, tensor.to returns a moved copy that must be assigned, module.to moves parameters in place, and NumPy needs the tensor back on the CPU.`,
num: String.raw`The mismatch error begins <b>Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu</b>. On the CPU, <code>x.to("cpu") is x</code> is <b>True</b>, nothing is copied.`,
note: String.raw`Write code that runs on any device: never type "cuda" in more than one place. The machine used for these cards has no GPU, the messages are PyTorch's own wording.`,
r(fig, ctl) {
  const S = [
    ["both on the CPU", [["x", 0], ["model", 0]], "pred on cpu", true, ["x = torch.randn(64, 2)", "model = nn.Linear(2, 1)", "pred = model(x)                # works, everything on cpu"], 2, "Works. Nothing has moved, and everything is in main memory."],
    ["only the batch moved", [["x", 1], ["model", 0]], "RuntimeError", false, ["x = x.to(device)", "pred = model(x)"], 1, "RuntimeError: Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu!"],
    ["both moved", [["x", 1], ["model", 1]], "pred on cuda:0", true, ["model.to(device)              # in place for a module", "x = x.to(device)               # assign for a tensor", "pred = model(x)"], 2, "Works. The product runs on the GPU and pred lives there too."],
    ["moved but not assigned", [["x", 0], ["x copy", 1], ["model", 1]], "RuntimeError", false, ["model.to(device)", "x.to(device)                   # result thrown away", "pred = model(x)"], 2, "x is still on the CPU. The moved copy was never stored, so this is the same error as situation 2."],
    ["NumPy on a GPU tensor", [["pred", 1]], "TypeError", false, ["arr = pred.numpy()"], 0, "TypeError: can't convert cuda:0 device type tensor to numpy. Use Tensor.cpu() to copy the tensor to host memory first."],
    ["detach, cpu, numpy", [["pred", 1], ["arr", 0]], "NumPy array", true, ["arr = pred.detach().cpu().numpy()"], 0, "Works. detach drops the autograd link, cpu copies to main memory, numpy wraps it."]
  ];
  let v = 0;
  ctl.innerHTML = btns(S.map((s, i) => [i, (i + 1) + ". " + s[0]]), "k4");
  const u = () => {
    pick(ctl, "k4", v);
    const [name, items, out, ok, code, ln, msg] = S[v];
    let g = `<g class="c-gray"><rect x="20" y="30" width="300" height="190" rx="10" stroke-width="0.8"/></g><g class="c-purple"><rect x="360" y="30" width="300" height="190" rx="10" stroke-width="0.8"/></g>`;
    g += tx(170, 22, "cpu: main memory", "middle", "th") + tx(510, 22, "cuda:0: GPU memory", "middle", "th");
    const cnt = [0, 0];
    items.forEach(([n, d]) => { const x = d ? 390 : 50, y = 50 + cnt[d]++ * 54; g += `<g class="${n === "model" ? "c-teal" : "c-blue"}"><rect x="${x}" y="${y}" width="160" height="40" rx="7" stroke-width="0.8"/></g>` + tx(x + 80, y + 25, n, "middle", "th"); });
    g += `<g class="${ok ? "c-teal" : "c-coral"}"><rect x="20" y="236" width="640" height="40" rx="8" stroke-width="1"/></g>` + tx(340, 261, ok ? "result: " + out : "error: " + out, "middle", "th");
    fig.innerHTML = svg(290, g) + ML.code(code, ln) + (ok ? `<p class="note">${ML.esc(msg)}</p>` : ML.term([msg]));
  };
  ctl.querySelectorAll("button[data-k4]").forEach(b => b.onclick = () => { v = +b.dataset.k4; u(); }); u();
}},

{s: "5. Indexing", t: "Index a (4, 3, 2) tensor: first the matrix, then the row, then the column",
intu: String.raw`HW4 Part 1 builds <code>t = torch.arange(1, 25).reshape(4, 3, 2)</code> and asks you to read it as four matrices of 3 rows and 2 columns. The three indices pick a matrix, a row and a column, in that order. A single integer removes its axis, a slice keeps it, <code>...</code> stands for all the axes you did not write, and negative indices count from the end. A Boolean mask picks the elements where a condition holds and always returns a flat vector. Pick an expression, watch the cells it selects and read the shape before you look at the values. Basic indexing returns a view of the same numbers, a mask or a list of indices returns a copy.`,
eq: String.raw`\[ \texttt{t[2, 1, 0]} = 15, \qquad \texttt{t[2:, 1:, :]}\ \text{has shape}\ (2, 2, 2) \]`,
sym: [["integer", "selects one position and removes the axis"], ["slice a:b", "keeps the axis, a included, b excluded"], ["...", "all remaining axes"], ["mask", "a bool tensor of the same shape, the result is 1D"], ["index list", "<code>t[[0, 3]]</code>, picks positions along axis 0 and copies"]],
how: ["Write the shape above the expression: (4, 3, 2).", "Go index by index: an integer deletes that axis, a slice keeps it with its new length.", "Write the result shape before you run the line.", "Remember that basic indexing gives a view, so writing into it changes t.", "Use <code>.item()</code> to turn a one-element tensor into a Python number."],
say: String.raw`Each index addresses one axis in order, an integer removes the axis, a slice keeps it, a mask returns a flat copy of the selected elements, and basic indexing returns a view.`,
num: String.raw`HW4: <code>t[2, 1, 0]</code> = <b>15</b>, <code>t[2:, 1:, :]</code> has shape <b>(2, 2, 2)</b>, <code>t[t > 18]</code> = <b>(19, 20, 21, 22, 23, 24)</b>, <code>t[1, :, 1]</code> = (8, 10, 12).`,
r(fig, ctl) {
  const E = [
    ["t[2, 1, 0]", (k, i, j) => k === 2 && i === 1 && j === 0, [], "view", "three integers remove all three axes, a 0-dimensional tensor"],
    ["t[2]", k => k === 2, [3, 2], "view", "one integer removes the matrix axis"],
    ["t[:, 0, :]", (k, i) => i === 0, [4, 2], "view", "the first row of every matrix"],
    ["t[2:, 1:, :]", (k, i) => k >= 2 && i >= 1, [2, 2, 2], "view", "slices keep their axes, HW4 Task 4"],
    ["t[..., 1]", (k, i, j) => j === 1, [4, 3], "view", "... fills in the first two axes"],
    ["t[1, :, 1]", (k, i, j) => k === 1 && j === 1, [3], "view", "matrix 1, every row, column 1"],
    ["t[-1, -1]", (k, i) => k === 3 && i === 2, [2], "view", "the last row of the last matrix"],
    ["t[t > 18]", (k, i, j) => k * 6 + i * 2 + j + 1 > 18, [6], "copy", "a mask always returns a flat copy, HW4 Task 6"],
    ["t[[0, 3]]", k => k === 0 || k === 3, [2, 3, 2], "copy", "a list of indices copies the chosen matrices"]
  ];
  let v = 3;
  ctl.innerHTML = `<div class="row">${E.map((e, i) => `<button data-k5="${i}" style="font-family:var(--mono)">${e[0]}</button>`).join("")}</div><div id="k5r"></div>`;
  const u = () => {
    pick(ctl, "k5", v);
    const [ex, sel, s, kind, note] = E[v];
    let g = tx(30, 22, "t = torch.arange(1, 25).reshape(4, 3, 2)", null, "th");
    const c = 34, vals = [];
    for (let k = 0; k < 4; k++) {
      const x0 = 40 + k * 156;
      g += tx(x0 + c, 50, `t[${k}]`, "middle");
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const val = k * 6 + i * 2 + j + 1, on = sel(k, i, j); if (on) vals.push(val);
        g += `<rect x="${x0 + j * c}" y="${60 + i * c}" width="${c - 3}" height="${c - 3}" rx="4" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x0 + j * c + 15, 60 + i * c + 20, val, "middle", "t");
      }
      if (k === 0) { g += tx(x0 - 6, 80, "row 0", "end") + tx(x0 - 6, 114, "row 1", "end") + tx(x0 - 6, 148, "row 2", "end") + tx(x0 + 15, 176, "col 0", "middle") + tx(x0 + 49, 176, "col 1", "middle"); }
    }
    g += tx(30, 210, `${ex}  →  shape ${shp(s)}, a ${kind}`, null, "th") + tx(30, 230, note, null);
    g += cells(40, 246, s, vals, { cell: 32 });
    const h = 246 + (s.length === 2 ? s[0] : s.length === 3 ? s[1] : 1) * 32 + 16;
    fig.innerHTML = svg(h, g);
    $("k5r").innerHTML = ML.readout([["result shape", shp(s)], ["numel", vals.length], ["shares t's memory", kind === "view" ? "yes" : "no"]]);
  };
  ctl.querySelectorAll("button[data-k5]").forEach(b => b.onclick = () => { v = +b.dataset.k5; u(); }); u();
}},

{s: "6. Reductions", t: "A reduction removes the axis you name in dim",
intu: String.raw`sum, mean, amax and argmax collapse numbers into fewer numbers. Without <code>dim</code> they collapse everything to one value. With <code>dim=0</code> they collapse down the rows and leave one value per column, with <code>dim=1</code> across the columns and leave one value per row. The named axis disappears from the shape, unless <code>keepdim=True</code> keeps it with size 1, which is what you want when the result is subtracted from the original, card 8. HW4 Task 5 reduces two axes at once with <code>amax(dim=(1, 2))</code> to get one maximum per matrix. Choose an operation and an axis and watch the arrows and the shape.`,
eq: String.raw`\[ A \in \mathbb{R}^{3 \times 4}: \quad \texttt{A.sum(dim=0)} \in \mathbb{R}^{4} \]
\[ \texttt{A.sum(dim=1, keepdim=True)} \in \mathbb{R}^{3 \times 1} \]`,
sym: [["dim", "the axis that is collapsed and removed"], ["keepdim", "keep the collapsed axis with size 1"], ["amax", "maximum values only"], ["argmax", "the index of the maximum, int64, flat when dim is not given"], ["A.max(dim=1)", "returns both values and indices"]],
how: ["Name the axis in words before you choose dim: per column means dim 0, per row means dim 1.", "Cross the named axis out of the shape to get the result shape.", "Use keepdim=True when the result will be broadcast back against A.", "Reduce a float tensor, convert integers with .float() first.", "For a loss, <code>reduction='mean'</code> and <code>'sum'</code> are the same reductions, HW7 section 2."],
say: String.raw`A reduction over dim collapses that axis and removes it from the shape, keepdim keeps it with size one, and the per-column statistics of a data table are reductions over dim zero.`,
num: String.raw`For A = ((3, 1, 4, 1), (5, 9, 2, 6), (5, 3, 5, 8)): <code>A.sum(dim=0)</code> = <b>(13, 13, 11, 15)</b>, <code>A.mean(dim=1)</code> = (2.25, 5.5, 5.25), <code>A.argmax()</code> = <b>5</b>, the flat position of 9. HW4: <code>amax(dim=(1, 2))</code> = (6, 12, 18, 24).`,
r(fig, ctl) {
  const A = [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8]];
  let op = "sum", d = 0, kd = false;
  ctl.innerHTML = btns([["sum", "sum"], ["mean", "mean"], ["amax", "amax"], ["argmax", "argmax"]], "k6o") + btns([["n", "no dim"], ["0", "dim=0"], ["1", "dim=1"]], "k6d") + btns([["0", "keepdim=False"], ["1", "keepdim=True"]], "k6k");
  const red = (xs) => op === "sum" ? xs.reduce((a, b) => a + b, 0) : op === "mean" ? xs.reduce((a, b) => a + b, 0) / xs.length : op === "amax" ? Math.max(...xs) : xs.indexOf(Math.max(...xs));
  const u = () => {
    pick(ctl, "k6o", op); pick(ctl, "k6d", d === null ? "n" : d); pick(ctl, "k6k", kd ? 1 : 0);
    let vals, s;
    if (d === null) { vals = [red(A.flat())]; s = []; }
    else if (d === 0) { vals = [0, 1, 2, 3].map(j => red(A.map(r => r[j]))); s = kd ? [1, 4] : [4]; }
    else { vals = A.map(r => red(r)); s = kd ? [3, 1] : [3]; }
    const fm = x => op === "mean" ? (Number.isInteger(x) ? x : (+x).toFixed(2)) : x;
    let g = tx(30, 22, `A.${op}(${d === null ? "" : "dim=" + d}${d !== null && kd ? ", keepdim=True" : ""})`, null, "th");
    const c = 46, x0 = 60, y0 = 50;
    g += ML.grid(A, { x: x0, y: y0, cell: c, axes: true }).s;
    if (d === 0) for (let j = 0; j < 4; j++) g += arrow(x0 + j * c + 21, y0 + 3 * c + 30, x0 + j * c + 21, y0 + 3 * c + 52, C.coral, 2);
    if (d === 1) for (let i = 0; i < 3; i++) g += arrow(x0 + 4 * c + 4, y0 + i * c + 21, x0 + 4 * c + 30, y0 + i * c + 21, C.coral, 2);
    if (d === null) g += `<rect x="${x0 - 6}" y="${y0 - 6}" width="${4 * c + 9}" height="${3 * c + 9}" rx="8" fill="none" stroke="${C.coral}" stroke-width="2" stroke-dasharray="5 4"/>`;
    /* result */
    const rx = d === 1 ? 300 : 400, ry = d === 0 ? y0 + 3 * c + 60 : y0;
    let rs = "";
    const cel = (x, y, val) => `<rect x="${x}" y="${y}" width="${c - 3}" height="${c - 3}" rx="5" fill="var(--teal-bg)" stroke="${C.teal}" stroke-width="1.6"/>` + tx(x + (c - 3) / 2, y + c / 2 + 3, fm(val), "middle", "t");
    if (d === null) rs = cel(rx, ry + 40, vals[0]);
    else if (d === 0) vals.forEach((val, j) => rs += cel(x0 + j * c, ry, val));
    else if (kd) vals.forEach((val, i) => rs += cel(rx, ry + i * c, val));
    else vals.forEach((val, i) => rs += cel(rx + i * c, ry + 40, val));
    g += rs;
    const H = d === 0 ? ry + 80 : 260;
    g += tx(d === 0 ? 400 : 300, d === 0 ? ry + 30 : 220, `result shape ${shp(s)}`, null, "th");
    if (d === 1 && !kd) g += tx(300, 240, "a 1D row of 3: one value per row of A", null);
    if (d === 0 && kd) g += tx(400, ry + 50, "a 1 by 4 row, ready to broadcast", null);
    if (op === "argmax" && d === null) g += tx(300, 240, "flat index 5 = row 1, column 1", null);
    fig.innerHTML = svg(Math.max(H, 270), g);
  };
  ctl.querySelectorAll("button[data-k6o]").forEach(b => b.onclick = () => { op = b.dataset.k6o; u(); });
  ctl.querySelectorAll("button[data-k6d]").forEach(b => b.onclick = () => { d = b.dataset.k6d === "n" ? null : +b.dataset.k6d; u(); });
  ctl.querySelectorAll("button[data-k6k]").forEach(b => b.onclick = () => { kd = b.dataset.k6k === "1"; u(); }); u();
}},

{s: "7. Shape tricks", t: "unsqueeze, squeeze, flatten, view, permute, cat and stack",
intu: String.raw`Models are picky about shape, so you will spend real time moving axes around. <code>unsqueeze(i)</code> inserts an axis of size 1 at position i and <code>squeeze(i)</code> removes one. <code>flatten(1)</code> merges every axis after the batch, the step between a CNN and a linear layer. <code>view</code> and <code>reshape</code> take a new shape, and one size may be −1 to let PyTorch work it out. <code>permute</code> reorders axes. <code>cat</code> joins tensors along an existing axis and <code>stack</code> creates a new one. HW8 warns about the classic bug: plain <code>squeeze()</code> removes every size 1 axis, so a batch of one image loses its batch axis. Switch the batch size to 1 and try it.`,
eq: String.raw`\[ (B, 1, 28, 28) \xrightarrow{\ \texttt{flatten(1)}\ } (B, 784) \]
\[ (1, 1, 28, 28) \xrightarrow{\ \texttt{squeeze()}\ } (28, 28) \]`,
sym: [["unsqueeze(i)", "new axis of size 1 at position i"], ["squeeze(i)", "removes axis i if its size is 1"], ["flatten(1)", "keeps axis 0, merges the rest"], ["view, reshape", "a new shape with the same numel, −1 is inferred"], ["cat, stack", "join along an existing axis, or along a new one"]],
how: ["Write the shape with axis names before and after each line.", "Always pass the axis to squeeze and unsqueeze.", "Use <code>flatten(1)</code> or <code>view(B, -1)</code> so the batch axis survives.", "Never flatten the batch axis into the features: <code>reshape(-1)</code> mixes samples.", "cat needs equal sizes on every axis except the joined one, stack needs equal shapes."],
say: String.raw`unsqueeze and squeeze add and remove axes of size one, flatten from axis one keeps the batch, view and reshape change the shape with the same number of elements, and squeeze must always be given its axis.`,
num: String.raw`For B = 64: <code>flatten(1)</code> gives <b>(64, 784)</b>, <code>stack([x, x])</code> gives (2, 64, 1, 28, 28), <code>cat([x, x])</code> gives (128, 1, 28, 28). For B = 1, <code>squeeze()</code> gives <b>(28, 28)</b> and the batch axis is gone.`,
note: String.raw`A column of targets from a 1D tensor: <code>y.unsqueeze(1)</code>, <code>y[:, None]</code> and <code>y.view(-1, 1)</code> all turn (N,) into (N, 1).`,
r(fig, ctl) {
  let B = 64, v = 0;
  const O = [
    ["x.squeeze()", b => b === 1 ? [[28, 28], ["height", "width"]] : [[b, 28, 28], ["batch", "height", "width"]], "removes every axis of size 1"],
    ["x.squeeze(1)", b => [[b, 28, 28], ["batch", "height", "width"]], "removes only the channel axis"],
    ["x.flatten(1)", b => [[b, 784], ["batch", "pixels"]], "28 × 28 = 784 pixels per image, the batch survives"],
    ["x.view(B, -1)", b => [[b, 784], ["batch", "pixels"]], "−1 is inferred: numel / B = 784"],
    ["x.reshape(-1)", b => [[b * 784], ["everything"]], "all samples run into one axis, never feed this to a model"],
    ["x.permute(0, 2, 3, 1)", b => [[b, 28, 28, 1], ["batch", "height", "width", "channel"]], "channels last, the layout Matplotlib expects"],
    ["x.unsqueeze(0)", b => [[1, b, 1, 28, 28], ["new", "batch", "channel", "height", "width"]], "a new leading axis of size 1"],
    ["torch.cat([x, x], dim=0)", b => [[2 * b, 1, 28, 28], ["batch", "channel", "height", "width"]], "twice as many images"],
    ["torch.cat([x, x], dim=1)", b => [[b, 2, 28, 28], ["batch", "channels", "height", "width"]], "two channels per image"],
    ["torch.stack([x, x], dim=0)", b => [[2, b, 1, 28, 28], ["new", "batch", "channel", "height", "width"]], "a new axis that counts the inputs"]
  ];
  ctl.innerHTML = btns([[64, "B = 64"], [1, "B = 1"]], "k7b") + `<div class="row">${O.map((o, i) => `<button data-k7="${i}" style="font-family:var(--mono);font-size:12px">${o[0]}</button>`).join("")}</div><div id="k7r"></div>`;
  const u = () => {
    pick(ctl, "k7b", B); pick(ctl, "k7", v);
    const [ex, fn, note] = O[v], [s, labs] = fn(B);
    let g = tx(30, 22, `x = torch.zeros(${B}, 1, 28, 28)`, null, "th");
    g += chips(30, 34, [B, 1, 28, 28], ["batch", "channel", "height", "width"], "c-gray", 100).s;
    g += tx(30, 130, ex, null, "th");
    g += chips(30, 142, s, labs, "c-blue", s.length > 4 ? 100 : 100).s;
    const trap = B === 1 && v === 0;
    g += tx(30, 232, note, null) + (trap ? tx(30, 252, "the batch axis is gone: a model now reads 28 images of 28 numbers", null, "th") : "");
    fig.innerHTML = svg(266, g);
    $("k7r").innerHTML = ML.readout([["result shape", shp(s)], ["numel", prod(s).toLocaleString("en-US")], ["batch axis kept", trap || v === 4 ? "no" : "yes"]]);
  };
  ctl.querySelectorAll("button[data-k7b]").forEach(b => b.onclick = () => { B = +b.dataset.k7b; u(); });
  ctl.querySelectorAll("button[data-k7]").forEach(b => b.onclick = () => { v = +b.dataset.k7; u(); }); u();
}},

{s: "8. Broadcasting", t: "Align the shapes from the right: each pair of sizes must match or contain a 1",
intu: String.raw`Broadcasting lets a smaller tensor act as if it were copied along the missing axes, without the copy. Write the two shapes right aligned. A missing axis counts as size 1. In each column the sizes must be equal or one of them must be 1, and the 1 is stretched. HW4 Part 2 adds an offset of shape (4,) to a (3, 4) matrix this way. The dangerous case is the one that works when it should not: a prediction of shape (N, 1) minus a target of shape (N,) is (N, 1) minus (1, N), which broadcasts to an (N, N) table of every prediction minus every target, HW8 2B. No error is raised and the loss is wrong. Andrew Ng's advice in his note on NumPy vectors is the cure: avoid 1D vectors where a column is meant and assert shapes.`,
eq: String.raw`\[ (3, 4) + (4,) \to (3, 4), \qquad (N, 1) - (N,) \to (N, N) \]`,
sym: [["right alignment", "compare the last axes first"], ["size 1", "stretched to match the other size"], ["missing axis", "treated as size 1 at the left"], ["conflict", "two different sizes, neither 1, gives a RuntimeError"], ["silent trap", "(N, 1) and (N,) broadcast to (N, N) without an error"]],
how: ["Write both shapes, right aligned, one above the other.", "Pad the shorter one with 1 on the left.", "Check each column: equal, or one of them 1.", "The result takes the larger size in every column.", "Before any loss, assert <code>pred.shape == target.shape</code>."],
say: String.raw`Broadcasting aligns shapes from the right, treats missing axes as size one, stretches every size one to match, and fails only when two sizes differ and neither is one, so a column minus a row silently becomes a matrix.`,
num: String.raw`HW4: (3, 4) + offset (10, 20, 30, 40) gives a first row of <b>(11, 22, 33, 44)</b>. Predictions (1, 2, 3) as (3, 1) against targets (1.5, 2, 2) as (3,): the broadcast MSE is <b>0.75</b>, the correct MSE is <b>0.4167</b>.`,
r(fig, ctl) {
  const P = [
    [[3, 4], [4], "+", "HW4 Part 2: one offset per column"],
    [[3, 4], [3, 1], "+", "one offset per row, a column vector"],
    [[3, 4], [3], "+", "a 1D vector of row offsets does not align"],
    [[3, 1], [3], "−", "predictions minus 1D targets: the silent trap"],
    [[8, 3], [1, 3], "−", "X − X.mean(dim=0, keepdim=True): center each feature"],
    [[8, 3], [8], "−", "X − X.mean(dim=1): one mean per row, wrong axis for broadcasting"],
    [[8, 3], [8, 1], "−", "X − X.mean(dim=1, keepdim=True) works"],
    [[64, 3, 32, 32], [3, 1, 1], "−", "subtract one mean per color channel"],
    [[64, 3, 32, 32], [3], "−", "a (3,) vector aligns with width, not channels"],
    [[2, 1, 3], [4, 1], "+", "both tensors stretch"]
  ];
  let v = 3;
  ctl.innerHTML = `<div class="row">${P.map((p, i) => `<button data-k8="${i}" style="font-family:var(--mono);font-size:12px">${shp(p[0])} ${p[2]} ${shp(p[1])}</button>`).join("")}</div><div id="k8r"></div>`;
  const u = () => {
    pick(ctl, "k8", v);
    const [a, b, opn, note] = P[v], n = Math.max(a.length, b.length);
    const pa = Array(n - a.length).fill(null).concat(a), pb = Array(n - b.length).fill(null).concat(b);
    const out = [], verdict = []; let bad = -1;
    for (let k = 0; k < n; k++) {
      const x = pa[k] == null ? 1 : pa[k], y = pb[k] == null ? 1 : pb[k];
      if (x === y) { out.push(x); verdict.push(pa[k] == null || pb[k] == null ? "missing, 1" : "equal"); }
      else if (x === 1 || y === 1) { out.push(Math.max(x, y)); verdict.push("stretch the 1"); }
      else { out.push("?"); verdict.push("conflict"); bad = k; }
    }
    const w = 96, x0 = 680 - 30 - n * (w + 8);
    let g = tx(30, 22, note, null, "th");
    const row = (y, arr, lab, col) => { let s = tx(30, y + 25, lab, null, "t"); arr.forEach((sz, k) => { const x = x0 + k * (w + 8); s += sz == null ? `<rect x="${x}" y="${y}" width="${w}" height="40" rx="7" fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>` + tx(x + w / 2, y + 25, "(1)", "middle") : `<g class="${col}"><rect x="${x}" y="${y}" width="${w}" height="40" rx="7" stroke-width="0.8"/></g>` + tx(x + w / 2, y + 25, sz, "middle", "th"); }); return s; };
    g += row(40, pa, "a  " + shp(a), "c-blue") + row(92, pb, "b  " + shp(b), "c-purple");
    g += `<line x1="${x0}" y1="142" x2="650" y2="142" stroke="var(--p)" stroke-width="1"/>`;
    g += row(152, out, "result", bad >= 0 ? "c-coral" : "c-teal");
    verdict.forEach((t, k) => g += tx(x0 + k * (w + 8) + w / 2, 212, t, "middle"));
    const dimIdx = bad;
    g += bad >= 0 ? tx(30, 246, "RuntimeError, no result", null, "th") : tx(30, 246, `result shape ${shp(out)}` + (v === 3 ? ", every prediction minus every target" : ""), null, "th");
    let extra = "";
    if (v === 0) extra = ML.code(["X = torch.tensor([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])", "X + torch.tensor([10, 20, 30, 40])"], 1) + ML.term(["tensor([[11, 22, 33, 44],", "        [15, 26, 37, 48],", "        [19, 30, 41, 52]])"]);
    else if (v === 3) extra = ML.code(["p = torch.tensor([[1.], [2.], [3.]])     # (3, 1)", "y = torch.tensor([1.5, 2., 2.])          # (3,)", "((p - y) ** 2).mean()                   # 0.7500, wrong", "((p - y.unsqueeze(1)) ** 2).mean()      # 0.4167, right"], 2);
    else if (bad >= 0) extra = ML.term([`RuntimeError: The size of tensor a (${pa[dimIdx]}) must match the size of tensor b (${pb[dimIdx]}) at non-singleton dimension ${dimIdx}`]);
    fig.innerHTML = svg(262, g) + extra;
    $("k8r").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k8]").forEach(b => b.onclick = () => { v = +b.dataset.k8; u(); }); u();
}},

{s: "9. Storage and strides", t: "A tensor is a view on flat storage: shape, stride and offset",
intu: String.raw`Under every tensor is a flat row of numbers, the storage. The shape says how to read it as a grid and the stride says how many storage steps one step along each axis takes. For <code>X = torch.arange(1, 13).reshape(3, 4)</code> the strides are (4, 1): the next row is 4 steps on, the next column 1 step. A transpose costs nothing, it only swaps the strides to (1, 4), but the result is no longer contiguous, its rows are not in storage order. <code>view</code> must reuse the storage, so <code>X.T.view(-1)</code> fails, which is HW4 Part 2's lesson. <code>reshape</code> returns a view when it can and quietly copies when it cannot. Pick an expression and follow the numbers through the storage in the order the result reads them.`,
eq: String.raw`\[ \text{address}(i, j) = \text{offset} + i\, s_0 + j\, s_1 \]`,
sym: [["storage", "the flat row of numbers a tensor reads from"], ["stride", "storage steps per index step, one per axis"], ["offset", "where the first element sits in the storage"], ["contiguous", "elements read in storage order, row after row"], ["view, reshape", "view always shares or fails, reshape shares when it can and copies otherwise"]],
how: ["Print <code>x.stride()</code> and <code>x.is_contiguous()</code> when a view fails.", "Expect transpose, permute and stepped slices to be non-contiguous.", "Use <code>reshape</code> when a copy is acceptable, or <code>.contiguous().view(...)</code> to make the copy explicit.", "Do not rely on writing through the result of reshape, it may be a copy, HW4 Q3.", "A contiguous tensor of shape (a, b, c) has strides (b·c, c, 1)."],
say: String.raw`A tensor reads a flat storage through its shape, strides and offset, a transpose only swaps strides and makes the tensor non-contiguous, view must share the storage and fails when it cannot, and reshape copies in that case.`,
num: String.raw`X has strides <b>(4, 1)</b>, X.T has <b>(1, 4)</b> and is not contiguous. <code>X[1:, 2:]</code> starts at offset <b>6</b>. <code>X.T.reshape(-1)</code> = (1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12) in new storage.`,
r(fig, ctl) {
  const E = [
    ["X", [3, 4], [4, 1], 0, true, "the original, row after row", true],
    ["X.T", [4, 3], [1, 4], 0, true, "same storage, strides swapped, not contiguous", false],
    ["X.view(3, 2, 2)", [3, 2, 2], [4, 2, 1], 0, true, "a new shape on the same storage", true],
    ["X[:, 1]", [3], [4], 1, true, "column 1: start at offset 1, step 4", false],
    ["X[1:, 2:]", [2, 2], [4, 1], 6, true, "a block: offset 6, rows still 4 apart", false],
    ["X[:, ::2]", [3, 2], [4, 2], 0, true, "every second column, step 2", false],
    ["X.T.view(-1)", null, null, 0, true, "view would have to read 1, 5, 9, 2, ... as one steady step"],
    ["X.T.reshape(-1)", [12], [1], 0, false, "cannot be a view, so reshape copies into new storage", true],
    ["X.T.contiguous()", [4, 3], [3, 1], 0, false, "an explicit copy in the transposed order", true]
  ];
  let v = 1;
  ctl.innerHTML = `<div class="row">${E.map((e, i) => `<button data-k9="${i}" style="font-family:var(--mono);font-size:12px">${e[0]}</button>`).join("")}</div><div id="k9r"></div>`;
  const u = () => {
    pick(ctl, "k9", v);
    const [ex, s, st, off, share, note, contig] = E[v];
    let g = tx(30, 22, `${ex}: ${note}`, null, "th");
    if (!s) {
      g += tx(30, 50, "X.T has shape (4, 3) and strides (1, 4). Read row by row it visits", null) + tx(30, 70, "storage positions 0, 4, 8, 1, 5, 9, ... and no single stride does that.", null);
      fig.innerHTML = svg(90, g) + ML.term(["RuntimeError: view size is not compatible with input tensor's size and stride (at least one dimension spans across two contiguous subspaces). Use .reshape(...) instead."]);
      $("k9r").innerHTML = ML.readout([["fix", "X.T.reshape(-1)"], ["or", "X.T.contiguous().view(-1)"]]);
      return;
    }
    /* storage index of every element in reading order */
    const idx = [];
    const rec = (k, base) => { if (k === s.length) { idx.push(base); return; } for (let i = 0; i < s[k]; i++) rec(k + 1, base + i * st[k]); };
    rec(0, off);
    const vals = share ? idx.map(i => i + 1) : (ex === "X.T.reshape(-1)" || ex === "X.T.contiguous()" ? [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12] : idx.map(i => i + 1));
    g += cells(40, 44, s, vals, { cell: s.length === 1 && s[0] > 6 ? 40 : 34 });
    const hgt = s.length === 1 ? 1 : s.length === 2 ? s[0] : s[1];
    const yS = 44 + hgt * 34 + 52;
    g += tx(30, yS - 22, share ? "storage of X, the order the result reads it" : "storage of X, untouched", null, "t");
    const c = 46;
    for (let p = 0; p < 12; p++) {
      const k = share ? idx.indexOf(p) : -1;
      g += `<rect x="${40 + p * c}" y="${yS}" width="${c - 3}" height="34" rx="4" fill="${k >= 0 ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${k >= 0 ? C.teal : "var(--line)"}" stroke-width="${k >= 0 ? 2 : 1}"/>` + tx(40 + p * c + 21, yS + 22, p + 1, "middle", "t") + tx(40 + p * c + 21, yS + 50, p, "middle");
      if (k >= 0) g += `<circle cx="${40 + p * c + 21}" cy="${yS - 10}" r="8" fill="${C.coral}"/>` + `<text x="${40 + p * c + 21}" y="${yS - 6}" text-anchor="middle" style="font-size:10px;fill:#fff">${k + 1}</text>`;
    }
    g += tx(30, yS + 50, "pos", null);
    let h2 = yS + 66;
    if (!share) {
      g += tx(30, h2 + 10, "new storage, written in the result's order", null, "t");
      vals.forEach((val, p) => g += `<rect x="${40 + p * c}" y="${h2 + 20}" width="${c - 3}" height="34" rx="4" fill="var(--coral-bg)" stroke="${C.coral}" stroke-width="1.6"/>` + tx(40 + p * c + 21, h2 + 42, val, "middle", "t"));
      h2 += 64;
    }
    fig.innerHTML = svg(h2 + 6, g);
    $("k9r").innerHTML = ML.readout([["shape", shp(s)], ["stride", shp(st)], ["offset", off], ["contiguous", contig ? "yes" : "no"], ["shares X's storage", share ? "yes" : "no, a copy"]]);
  };
  ctl.querySelectorAll("button[data-k9]").forEach(b => b.onclick = () => { v = +b.dataset.k9; u(); }); u();
}},

{s: "10. Who shares memory", t: "Views, in-place operations and clone: when a change shows up somewhere else",
intu: String.raw`Lesson 2's rule about names and objects holds for tensors with one extra layer: several tensors can read the same storage. A view such as <code>a.view(2, 3)</code> or a slice shares it, so writing through one changes the other. <code>clone()</code> allocates new storage. Methods that end in an underscore, like <code>add_</code>, and augmented assignment <code>+=</code> change the storage in place. A plain expression like <code>a * 2</code> creates a new tensor, and assigning it to a moves the name a, while any other name keeps the old storage. Step through and predict each line before you see it.`,
eq: String.raw`\[ \texttt{b = a.view(2, 3)} \Rightarrow \text{shared}, \qquad \texttt{c = a.clone()} \Rightarrow \text{independent} \]`,
sym: [["view or slice", "a new tensor object on the same storage"], ["clone()", "new storage with the same values, still tracked by autograd"], ["in-place methods", "names ending in an underscore, such as add_: the storage changes, every view sees it"], ["x += 1", "in place for tensors"], ["x = x + 1", "a new tensor, the name moves to it"]],
how: ["Ask of every line: new storage or the same storage?", "Clone before you modify a tensor that someone else may still use.", "Avoid in-place operations on tensors that need gradients, autograd may need the old values.", "Use <code>torch.equal</code> or <code>data_ptr()</code> checks in tests when sharing matters.", "When in doubt, print the tensor from both names."],
say: String.raw`Views and slices share storage with their source, clone makes independent storage, methods ending in an underscore and plus-equals change storage in place, and an ordinary expression makes a new tensor that the assigned name moves to.`,
num: String.raw`After the eight lines: <code>e[0]</code> = <b>101.0</b>, <code>c[0]</code> = <b>0.0</b>, <code>d[0]</code> = <b>102.0</b>, <code>a[0]</code> = <b>202.0</b>.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["a = torch.arange(6.)", "b = a.view(2, 3)", "c = a.clone()", "b[0, 0] = 100.", "a.add_(1)", "d = a + 1", "e = a", "a = a * 2", "print(e[0].item(), c[0].item(), d[0].item(), a[0].item())"],
    steps: [
      { ln: 0, vars: [["a", "S"]], objs: [["S", "storage, 6 float32", "0. 1. 2. 3. 4. 5."]], out: [], note: "one tensor, one storage" },
      { ln: 1, vars: [["a", "S"], ["b", "S"]], objs: [["S", "storage, read by a as (6,), by b as (2, 3)", "0. 1. 2. 3. 4. 5."]], out: [], note: "b is a second tensor object on the same storage" },
      { ln: 2, vars: [["a", "S"], ["b", "S"], ["c", "T"]], objs: [["S", "storage of a and b", "0. 1. 2. 3. 4. 5."], ["T", "storage of c, a copy", "0. 1. 2. 3. 4. 5."]], out: [], note: "clone allocates new storage" },
      { ln: 3, vars: [["a", "S"], ["b", "S"], ["c", "T"]], objs: [["S", "storage of a and b", "100. 1. 2. 3. 4. 5."], ["T", "storage of c, a copy", "0. 1. 2. 3. 4. 5."]], out: [], note: "writing through b changed a, not c" },
      { ln: 4, vars: [["a", "S"], ["b", "S"], ["c", "T"]], objs: [["S", "storage of a and b", "101. 2. 3. 4. 5. 6."], ["T", "storage of c, a copy", "0. 1. 2. 3. 4. 5."]], out: [], note: "add_ works in place, b sees it too" },
      { ln: 5, vars: [["a", "S"], ["b", "S"], ["c", "T"], ["d", "U"]], objs: [["S", "storage of a and b", "101. 2. 3. 4. 5. 6."], ["T", "storage of c", "0. 1. 2. 3. 4. 5."], ["U", "storage of d, new", "102. 3. 4. 5. 6. 7."]], out: [], note: "a + 1 is a new tensor" },
      { ln: 6, vars: [["a", "S"], ["b", "S"], ["c", "T"], ["d", "U"], ["e", "S"]], objs: [["S", "storage of a, b and e", "101. 2. 3. 4. 5. 6."], ["T", "storage of c", "0. 1. 2. 3. 4. 5."], ["U", "storage of d", "102. 3. 4. 5. 6. 7."]], out: [], note: "e is another name for the same tensor as a" },
      { ln: 7, vars: [["a", "V"], ["b", "S"], ["c", "T"], ["d", "U"], ["e", "S"]], objs: [["S", "storage of b and e", "101. 2. 3. 4. 5. 6."], ["T", "storage of c", "0. 1. 2. 3. 4. 5."], ["U", "storage of d", "102. 3. 4. 5. 6. 7."], ["V", "storage of the new a", "202. 4. 6. 8. 10. 12."]], out: [], note: "a now names a new tensor, e still holds the old one" },
      { ln: 8, vars: [["a", "V"], ["b", "S"], ["c", "T"], ["d", "U"], ["e", "S"]], objs: [["S", "storage of b and e", "101. 2. 3. 4. 5. 6."], ["T", "storage of c", "0. 1. 2. 3. 4. 5."], ["U", "storage of d", "102. 3. 4. 5. 6. 7."], ["V", "storage of a", "202. 4. 6. 8. 10. 12."]], out: ["101.0 0.0 102.0 202.0"] }
    ]
  });
}},

{s: "11. NumPy and PyTorch", t: "from_numpy shares, torch.tensor copies, and .numpy() needs detach and cpu",
intu: String.raw`Data usually arrive as NumPy arrays, so the border between the two libraries matters. <code>torch.from_numpy(n)</code> wraps the array's memory without copying, so an edit to n shows up in the tensor, HW4 Part 3. <code>torch.as_tensor(n)</code> also shares when it can, and copies when you ask for another dtype. <code>torch.tensor(n)</code> always copies. Going back, <code>t.numpy()</code> shares too, refuses a tensor that requires gradients and cannot read GPU memory, which is why the safe exit is <code>t.detach().cpu().numpy()</code>, plus <code>.copy()</code> when later edits must stay apart. Watch the dtype as well: NumPy's float64 survives the trip and meets a float32 model.`,
eq: String.raw`\[ \texttt{from\_numpy}: \text{shared}, \qquad \texttt{torch.tensor}: \text{copy} \]
\[ \texttt{t.detach().cpu().numpy().copy()}: \text{independent} \]`,
sym: [[String.raw`\(\texttt{from\_numpy}\)`, "shares the array's memory, keeps its dtype"], [String.raw`\(\texttt{as\_tensor}\)`, "shares if dtype and device allow, else copies"], ["torch.tensor", "always copies"], [".numpy()", "shares with a CPU tensor that has no gradient"], [String.raw`\(\texttt{np.shares\_memory}\)`, "the test that tells you which case you are in"]],
how: ["Decide whether you want shared memory or a copy, then pick the function.", "Convert features with <code>torch.tensor(n, dtype=torch.float32)</code> to get a float32 copy in one step.", "Leave the graph and the GPU with <code>.detach().cpu()</code> before <code>.numpy()</code>.", "Add <code>.copy()</code> when the NumPy result will be edited, HW4 Part 3 Task 8.", "Check with <code>np.shares_memory</code> in a test."],
say: String.raw`<code>from_numpy</code> and <code>numpy</code> share memory across the border, torch.tensor copies, <code>as_tensor</code> shares only when no conversion is needed, and the safe way out of PyTorch is detach, cpu, numpy and copy.`,
num: String.raw`HW4 Part 3: after <code>n[0, 0] = 99.</code> the tensor from <code>from_numpy</code> reads <b>99.0</b>, while a copy made with <code>torch.tensor</code> before the edit still reads <b>0.0</b>. <code>torch.from_numpy(np.zeros(3)).dtype</code> is <b>torch.float64</b>.`,
r(fig, ctl) {
  const R = [
    ["t = torch.from_numpy(n)", true, "n[0, 0] = 99.", "99.0", "float32", "wraps n's memory"],
    ["t = torch.as_tensor(n)", true, "n[0, 0] = 99.", "99.0", "float32", "shares, no conversion was needed"],
    ["t = torch.tensor(n)", false, "n[0, 0] = 99.", "0.0", "float32", "always a copy"],
    ["t = torch.as_tensor(n, dtype=torch.float64)", false, "n[0, 0] = 99.", "0.0", "float64", "a new dtype forces a copy"],
    ["back = t.numpy()", true, "back[0, 0] = 99.", "99.0", "float32", "the reverse trip shares too"],
    ["back = t.detach().cpu().numpy().copy()", false, "back[0, 0] = 99.", "0.0", "float32", "the safe exit, independent"]
  ];
  let v = 0, ed = false;
  ctl.innerHTML = `<div class="row">${R.map((r, i) => `<button data-k11="${i}" style="font-family:var(--mono);font-size:12px">${r[0]}</button>`).join("")}</div>` + btns([[0, "before the edit"], [1, "after the edit"]], "k11e");
  const u = () => {
    pick(ctl, "k11", v); pick(ctl, "k11e", ed ? 1 : 0);
    const [code, share, edit, after, dt, note] = R[v], rev = v >= 4;
    const nv = ed ? "99." : "0.", tv = ed && share ? "99." : "0.";
    let g = tx(30, 22, `${code}: ${note}`, null, "th");
    g += `<g class="c-gray"><rect x="30" y="44" width="250" height="120" rx="10" stroke-width="0.8"/></g><g class="c-blue"><rect x="400" y="44" width="250" height="120" rx="10" stroke-width="0.8"/></g>`;
    g += tx(155, 64, rev ? "NumPy: back" : "NumPy: n", "middle", "th") + tx(525, 64, rev ? "PyTorch: t" : "PyTorch: t", "middle", "th");
    const r0 = (x, first) => [first, "1.", "2.", "3."].map((q, j) => `<rect x="${x + 22 + j * 52}" y="84" width="48" height="34" rx="4" fill="${j === 0 && first === "99." ? "var(--coral-bg)" : "var(--sunk)"}" stroke="${j === 0 && first === "99." ? C.coral : "var(--line)"}"/>` + tx(x + 46 + j * 52, 106, q, "middle", "t")).join("");
    g += r0(30, nv) + r0(400, tv);
    g += tx(155, 150, "first row, float32 array", "middle") + tx(525, 150, `first row, ${rev ? "float32" : dt} tensor`, "middle");
    g += share ? `<line x1="282" y1="104" x2="398" y2="104" stroke="${C.teal}" stroke-width="3"/>` + tx(340, 96, "same memory", "middle", "t") : tx(340, 96, "separate", "middle", "t") + tx(340, 114, "memory", "middle", "t");
    g += tx(30, 196, ed ? `after ${edit}: t[0, 0] is ${after}` : `next: ${edit}`, null, "th");
    fig.innerHTML = svg(214, g) + ML.code(rev ? ["t = torch.arange(12, dtype=torch.float32).reshape(3, 4)", code, edit, "print(t[0, 0].item())"] : ["n = np.arange(12, dtype=np.float32).reshape(3, 4)", code, edit, "print(t[0, 0].item())"], ed ? 2 : 1) + (ed ? ML.term([after]) : "");
  };
  ctl.querySelectorAll("button[data-k11]").forEach(b => b.onclick = () => { v = +b.dataset.k11; ed = false; u(); });
  ctl.querySelectorAll("button[data-k11e]").forEach(b => b.onclick = () => { ed = b.dataset.k11e === "1"; u(); }); u();
}},

{s: "12. A batch prediction", t: "One matrix product predicts the whole batch: (N, D) @ (D, 1) + b",
intu: String.raw`Lesson 9 did batch prediction in NumPy, and the tensor version is the same line. Stack N samples as the rows of X, shape (N, D). Put the weights in a column w of shape (D, 1). Then <code>X @ w + b</code> has shape (N, 1), one prediction per row, and the bias broadcasts down the column. <code>@</code> is the matrix product, <code>*</code> is elementwise and gives an (N, D) table of products instead. The weight shape must line up with the features, and the target must be (N, 1) for the loss, or card 8's trap returns. Change the batch size and the mode and check every shape.`,
eq: String.raw`\[ \hat y = X w + b, \qquad (N, D)\,(D, 1) \to (N, 1) \]`,
sym: [["X", "the batch, one sample per row, shape (N, D)"], ["w", "weights as a column, shape (D, 1)"], ["b", "the bias, shape (1,), broadcast to every row"], ["@", "matrix product, inner sizes must match"], ["*", "elementwise product with broadcasting"]],
how: ["Write the shapes: (N, D) @ (D, 1) needs the inner sizes to match.", "Add the bias and check that broadcasting keeps (N, 1).", "Make the target (N, 1) with <code>unsqueeze(1)</code> if it arrived as (N,).", "Assert <code>pred.shape == y.shape</code> before the loss.", "nn.Linear stores its weight as (out, in) and computes <code>X @ W.T + b</code>, Lesson 23."],
say: String.raw`A linear model predicts a batch with one matrix product of the (N, D) batch and the (D, 1) weight column plus a broadcast bias, and the targets must have the same (N, 1) shape before the loss.`,
num: String.raw`With w = (0.4, −0.2) and b = 0.1 the six predictions are <b>0.1, 0.5, 1.3, 0.6, −0.4, −0.7</b>. Against y as (6, 1) the MSE is <b>0.0767</b>, against y as (6,) it is <b>0.9989</b> from a (6, 6) table.`,
r(fig, ctl) {
  const X = [[1, 2], [0.5, -1], [3, 0], [2, 1.5], [-1, 0.5], [0, 4]], w = [0.4, -0.2], b = 0.1, Y = [0, 1, 1, 0.5, -0.5, -1];
  let mode = 0, ycol = true;
  ctl.innerHTML = sl("k12n", "batch size N", 1, 6, 1, 6) + btns([[0, "X @ w + b"], [1, "X * w.T"], [2, "X @ w.T"]], "k12m") + btns([[1, "y as (N, 1)"], [0, "y as (N,)"]], "k12y") + `<div id="k12r"></div>`;
  const u = () => {
    const N = +$("k12n").value; $("k12nv").textContent = N;
    pick(ctl, "k12m", mode); pick(ctl, "k12y", ycol ? 1 : 0);
    const Xs = X.slice(0, N), ys = Y.slice(0, N);
    let g = tx(30, 22, mode === 0 ? `(${N}, 2) @ (2, 1) + (1,)  →  (${N}, 1)` : mode === 1 ? `(${N}, 2) * (1, 2)  →  (${N}, 2), elementwise` : `(${N}, 2) @ (1, 2): inner sizes 2 and 1 differ`, null, "th");
    g += ML.grid(Xs, { x: 60, y: 54, cell: 44, title: "X", fmt: q => (+q).toFixed(1), rowLab: false, colLab: false }).s;
    g += ML.grid(mode === 0 ? [[w[0]], [w[1]]] : [w], { x: 190, y: 54, cell: 44, title: mode === 0 ? "w (2, 1)" : "w.T (1, 2)", fmt: q => (+q).toFixed(1), rowLab: false, colLab: false }).s;
    g += tx(170, 80, mode === 1 ? "*" : "@", "middle", "th");
    let rv = "";
    if (mode === 0) {
      const yh = Xs.map(r => r[0] * w[0] + r[1] * w[1] + b);
      g += tx(290, 80, "+ 0.1 =", "middle", "th") + ML.grid(yh.map(q => [q]), { x: 330, y: 54, cell: 44, title: "pred", fmt: q => (+q).toFixed(1), rowLab: false, colLab: false, hl: new Set(yh.map((_, i) => i + ",0")) }).s;
      g += ML.grid(ycol ? ys.map(q => [q]) : [ys], { x: 420, y: 54, cell: ycol ? 44 : 36, title: ycol ? "y (N, 1)" : "y (N,)", fmt: q => (+q).toFixed(1), rowLab: false, colLab: false }).s;
      const right = yh.reduce((s, q, i) => s + (q - ys[i]) ** 2, 0) / N;
      let wrong = 0; yh.forEach(p => ys.forEach(t => wrong += (p - t) ** 2)); wrong /= N * N;
      rv = ML.readout([["pred shape", shp([N, 1])], ["(pred − y) shape", ycol ? shp([N, 1]) : shp([N, N])], ["MSE", f(ycol ? right : wrong, 4)], ["correct MSE", f(right, 4)]]);
    } else if (mode === 1) {
      const P = Xs.map(r => [r[0] * w[0], r[1] * w[1]]);
      g += tx(290, 80, "=", "middle", "th") + ML.grid(P, { x: 330, y: 54, cell: 44, title: "products", fmt: q => (+q).toFixed(1), rowLab: false, colLab: false }).s;
      rv = ML.readout([["result shape", shp([N, 2])], ["what it is", "each feature times its weight, not yet summed"]]);
    } else rv = ML.readout([["error", "RuntimeError"], ["fix", "w as (2, 1), or X @ w.T.T"]]);
    fig.innerHTML = svg(Math.max(54 + N * 44 + 30, 190), g) + (mode === 2 ? ML.term([`RuntimeError: mat1 and mat2 shapes cannot be multiplied (${N}x2 and 1x2)`]) : "");
    $("k12r").innerHTML = rv;
  };
  $("k12n").oninput = u;
  ctl.querySelectorAll("button[data-k12m]").forEach(x => x.onclick = () => { mode = +x.dataset.k12m; u(); });
  ctl.querySelectorAll("button[data-k12y]").forEach(x => x.onclick = () => { ycol = x.dataset.k12y === "1"; u(); }); u();
}},

{s: "13. With the agent", t: "Do it with the agent: tensor utilities with shape and memory tests",
intu: String.raw`The lesson as code you will reuse in every PyTorch homework and in the project: a function that describes a tensor, one that turns a NumPy array into an independent float32 tensor, one that makes targets a column, a shape guard to call before every loss, and a safe exit to NumPy. The tests pin HW4's numbers and the traps from cards 3, 7, 8, 9 and 11, so a forgotten dtype conversion, a plain squeeze, a silent broadcast or a shared buffer fails a test you can read.`,
eq: String.raw`\[ \texttt{describe} \to \texttt{to\_float32} \to \texttt{as\_column} \to \texttt{check\_same\_shape} \to \texttt{to\_numpy} \]`,
sym: [["describe", "shape, dtype, device, contiguous, numel in one dict"], ["to float32", "an independent float32 copy of an array"], ["as column", "(N,) or (N, 1) in, (N, 1) out, anything else raises"], ["check same shape", "ValueError naming both shapes"], ["to numpy", "detach, cpu, numpy, copy"]],
how: ["Paste the command.", "Read <code>to_float32</code>: does it copy, or does it share through <code>as_tensor</code>?", "Read <code>check_same_shape</code>: does it refuse broadcasting instead of fixing it?", "Run the tests and compare the pinned values with cards 5, 8 and 11.", "Commit the module and import it in the next homework."],
say: String.raw`A small tensor utility module with tests turns this lesson's traps into errors you see at once: wrong dtype, lost batch axis, silent broadcasting and shared memory.`,
num: String.raw`Tests expect <b>15</b>, <b>(2, 2, 2)</b> and <b>(6, 12, 18, 24)</b> from HW4's tensor, a ValueError for (5, 1) against (5,), float32 from a float64 array, and no shared memory after <code>to_numpy</code>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/tensor_utils.py using torch and numpy. Functions: describe(t) returning a dict with shape (tuple), dtype (str), device (str), contiguous (bool) and numel (int). to_float32(array) returning an independent float32 tensor (torch.tensor with dtype=torch.float32, never from_numpy). as_column(y) that returns y unchanged if it has shape (N, 1), returns y.unsqueeze(1) if it has shape (N,), and raises ValueError otherwise. check_same_shape(pred, target) that raises ValueError with both shapes in the message when they differ and never broadcasts. to_numpy(t) returning t.detach().cpu().numpy().copy(). Create tests/test_tensor_utils.py with pytest: t = torch.arange(1, 25).reshape(4, 3, 2) gives t[2, 1, 0].item() == 15, t[2:, 1:, :].shape == (2, 2, 2) and t.amax(dim=(1, 2)).tolist() == [6, 12, 18, 24]; describe(t.transpose(0, 2)) reports contiguous False; check_same_shape(torch.zeros(5, 1), torch.zeros(5)) raises ValueError; as_column(torch.zeros(5)).shape == (5, 1) and as_column(torch.zeros(5, 2)) raises; to_float32(np.zeros((3, 2))) has dtype torch.float32 and nn.Linear(2, 1) accepts it, and changing the array afterwards does not change the tensor; to_numpy works on a tensor with requires_grad=True and np.shares_memory with the source is False. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "........                                                 [100%]", "8 passed in 1.07s"],
    files: [["src/tensor_utils.py", "five small functions, no global state"], ["tests/test_tensor_utils.py", "eight tests with the numbers from cards 5, 8 and 11"]],
    checks: ["to_float32 copies: the test edits the array after the call and the tensor is unchanged", "check_same_shape raises for (5, 1) against (5,) instead of reshaping either one", "as_column passes the axis to unsqueeze and never calls a bare squeeze", "to_numpy calls detach and cpu before numpy and copy after it", "the HW4 numbers 15, (2, 2, 2) and (6, 12, 18, 24) appear in the tests"]
  });
}},

{s: "14. Test", t: "Lesson 21 test: tensors",
intu: String.raw`Twelve questions on dtypes, indexing, reductions, squeeze, broadcasting, views, strides and the NumPy border. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the shape of every tensor in the question first.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to autograd.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What is the dtype of <code>torch.tensor([4, 7, 1])</code>?", o: ["torch.int32", "torch.int64", "torch.float32", "torch.float64"], a: 1, why: "Python integers become int64, also called long. A decimal point would give float32. Cards 2 and 3." },
    { q: "<code>x = torch.arange(1, 31).reshape(5, 3, 2)</code>. What is <code>x[3, 2, 1].item()</code>?", o: ["22", "23", "24", "30"], a: 2, why: "Matrix 3 starts at 3 × 6 + 1 = 19, row 2 adds 4, column 1 adds 1: 24. Card 5." },
    { q: "Same x. The shape of <code>x[1:4, :2, :]</code> is", o: ["(3, 2, 2)", "(4, 2, 2)", "(3, 2)", "(3, 3, 2)"], a: 0, why: "1:4 keeps 3 matrices, :2 keeps 2 rows, : keeps both columns. Slices keep their axes. Card 5." },
    { q: "<code>q = torch.tensor([[2., 0., 1.], [4., 6., 5.]])</code>. What is <code>q.sum(dim=1, keepdim=True)</code>?", o: ["tensor([6., 6., 6.])", "tensor([[3.], [15.]])", "tensor([3., 15.])", "tensor([[6., 6., 6.]])"], a: 1, why: "dim=1 sums across each row, 3 and 15, and keepdim leaves shape (2, 1). Card 6." },
    { q: "<code>x = torch.zeros(1, 1, 28, 28)</code>. What is <code>x.squeeze().shape</code>?", o: ["(1, 28, 28)", "(28, 28)", "(1, 784)", "(1, 1, 28, 28)"], a: 1, why: "A bare squeeze removes every axis of size 1, including the batch axis. Use squeeze(1). Card 7." },
    { q: "What is the shape of <code>torch.zeros(4, 1, 5) + torch.zeros(3, 1)</code>?", o: ["an error", "(4, 3, 5)", "(4, 1, 5)", "(3, 4, 5)"], a: 1, why: "Right aligned: (4, 1, 5) and (1, 3, 1). Each column has a 1 or equal sizes, so the result is (4, 3, 5). Card 8." },
    { q: "<code>pred</code> has shape (6, 1) and <code>target</code> has shape (6,). <code>((pred - target) ** 2).mean()</code>", o: ["raises a RuntimeError", "averages a (6, 6) table without any error", "averages 6 values correctly", "averages a (6, 1) column"], a: 1, why: "(6, 1) against (1, 6) broadcasts to (6, 6). Fix it with target.unsqueeze(1) and assert the shapes. Cards 8 and 12." },
    { q: "<code>a = torch.arange(6)</code>, <code>b = a.view(3, 2)</code>, <code>b[1, 0] = 50</code>. What is <code>a</code>?", o: ["tensor([0, 1, 2, 3, 4, 5])", "tensor([0, 1, 50, 3, 4, 5])", "tensor([0, 50, 2, 3, 4, 5])", "tensor([50, 1, 2, 3, 4, 5])"], a: 1, why: "b is a view, row 1 column 0 is storage position 1 × 2 + 0 = 2, so a[2] becomes 50. Card 10." },
    { q: "<code>X = torch.arange(12).reshape(3, 4)</code>. Which line raises an error?", o: ["X.view(-1)", "X.T.reshape(-1)", "X.T.view(-1)", "X.T.contiguous().view(-1)"], a: 2, why: "X.T is not contiguous, so view cannot reuse the storage. reshape copies, contiguous copies first. Card 9." },
    { q: "A contiguous tensor of shape (2, 3, 4) has strides", o: ["(1, 2, 6)", "(4, 3, 2)", "(12, 4, 1)", "(24, 12, 4)"], a: 2, why: "The last axis steps 1, the middle 4, the first 3 × 4 = 12. Card 9." },
    { q: "<code>n = np.ones(3)</code>, <code>t = torch.from_numpy(n)</code>, <code>n[0] = 5</code>. Then <code>t[0]</code> and <code>t.dtype</code> are", o: ["1.0 and float32", "5.0 and float64", "5.0 and float32", "1.0 and float64"], a: 1, why: "from_numpy shares memory and keeps NumPy's float64 dtype. Card 11." },
    { q: "<code>nn.Linear(2, 1)(torch.from_numpy(np.ones((3, 2))))</code> raises <i>mat1 and mat2 must have the same dtype</i>. The fix is", o: ["call .double() on the array", "convert the input with .float() or dtype=torch.float32", "use torch.no_grad()", "move the model to the GPU"], a: 1, why: "The array is float64 and the layer's weights are float32. Convert the data, not the model. Cards 3 and 11." }
  ], "Lesson 21 test");
}}
],
summary: String.raw`A tensor is an array of one dtype on one device, its shape lists the size of each axis, and anything that enters a model has the batch axis first. torch.tensor copies data and infers int64 or float32, zeros and full build a shape, arange excludes its end and linspace includes it, and <code>manual_seed</code> makes random draws repeatable. Weights and features are float32, labels int64, masks bool, and mixed dtypes promote to the higher one, so float64 arrays from NumPy must be converted before a layer sees them. Every input of an operation must be on the same device, tensor.to returns a moved copy that must be assigned, and NumPy needs the tensor back on the CPU. Integer indices remove axes and slices keep them, masks return flat copies, and a reduction over dim removes that axis unless keepdim keeps it. squeeze must be given its axis or a batch of one loses its batch axis, and flatten from axis one keeps the batch. Broadcasting aligns shapes from the right and stretches sizes of one, so an (N, 1) prediction minus an (N,) target silently becomes an (N, N) table. Under the shape is flat storage read through strides: a transpose swaps strides, view must share storage and fails when it cannot, reshape copies instead, and <code>from_numpy</code> and <code>numpy</code> share memory across the border. A whole batch is predicted by one product of an (N, D) batch with a (D, 1) weight column plus a broadcast bias.`,
sheet: [[String.raw`\[ \text{numel} = \prod_k n_k, \qquad \text{bytes} = \text{numel} \times \text{element size} \]`, "size of a tensor"], [String.raw`\[ \text{bool} \lt \text{uint8} \lt \text{int64} \lt \text{float16} \lt \text{float32} \lt \text{float64} \]`, "type promotion order"], [String.raw`\[ \texttt{A.sum(dim=k)}: \ (n_0, \dots, n_k, \dots) \to (n_0, \dots, \widehat{n_k}, \dots) \]`, "a reduction removes axis k"], [String.raw`\[ (a, 1) \text{ with } (b,) \to (a, b) \]`, "broadcasting, the column and row trap"], [String.raw`\[ \text{address} = \text{offset} + \sum_k i_k s_k \]`, "strides map indices to storage"], [String.raw`\[ \text{contiguous } (a, b, c): \ s = (bc, c, 1) \]`, "strides of a contiguous tensor"], [String.raw`\[ \hat y = X w + b, \qquad (N, D)(D, 1) \to (N, 1) \]`, "batch prediction"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW4 solutions, Parts 1 to 3 (shapes, indexing and reductions, broadcasting, reshape and memory layout, NumPy interoperability and the autograd boundary)", "AME 5970 HW7 section 2 (the reduction worked example and the wrong target shape), HW8 (tensor shape conventions, the squeeze warning, 2B broadcasting trap) and HW9 2B (float32 features and int64 targets)", "Andrew Ng, Deep Learning Specialization, course 1 week 2: Vectorization, Broadcasting in Python, A note on Python/NumPy vectors", "Raschka, Liu and Mirjalili (2022), Machine Learning with PyTorch and Scikit-Learn, chapter 12: creating tensors, manipulating the data type and shape of a tensor, mathematical operations, split, stack and concatenate", "PyTorch documentation: Tensors tutorial, Broadcasting semantics, Tensor views, torch.finfo and type promotion"]
});
})();
