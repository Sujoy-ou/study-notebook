(function () {
/* ML shelf, Part 5, Lesson 25: Data in PyTorch. Follows HW6 Problem 1.2 (make_loader with TensorDataset and DataLoader, a seeded generator, float32, drop_last=False, shapes (N, 1), 7 training batches with a last of 18), HW8 Part 1 (the raw image pool DigitsPractice, make_image_transforms with ToTensor, RandomRotation and RandomAffine, the TransformView wrapper with separate training and evaluation transforms, the stratified split 1,437 and 360, the paired augmentation audit) and HW10 (balanced_split per class, the ArrayImages dataset over uint8 arrays, Normalize((0.5,), (0.5,))), with their solutions docs. Andrew Ng's Deep Learning Specialization is the spine: course 2 week 1 (train, dev and test sets from one distribution), course 2 week 2 (mini-batches made by shuffling then partitioning, a new shuffle every epoch) and course 4 week 2 (data augmentation, and distortions computed by CPU threads in parallel with training). Raschka chapters 12 and 14 and the PyTorch data tutorial fill in the API. The lesson data are fresh: ten points of y = 1 + 2x plus noise from default_rng(2525), a 100-sample label set with classes of 60, 30 and 10, a 4 by 4 uint8 image and two drawn glyphs. Every number on the cards was produced with PyTorch 2.15 and torchvision 0.29 on the CPU. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const fm = (v, d) => (+v).toFixed(d == null ? 2 : d).replace("-", "−");
const n0 = v => Math.round(v).toLocaleString("en-US");
const node = (x, y, w, lab, val, cls, on) => `<g class="${cls || "c-gray"}"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="9" stroke-width="${on ? 1.8 : 0.7}"/></g>` + tx(x, y - 3, lab, "middle", "th") + tx(x, y + 14, val, "middle", "t");
const chip = (x, y, w, t, fill, stroke, sw) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw || 1}"/>` + `<text class="t" x="${x + w / 2}" y="${y + 16}" text-anchor="middle" style="font-family:var(--mono);font-size:12px">${t}</text>`;
const bind = (ctl, attr, f) => ctl.querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => f(+b.dataset[attr]));
/* ten points of y = 1 + 2x plus N(0, 0.1²) from default_rng(2525), rounded to 2 decimals */
const DX = [0.5, 0.6, 0.01, 0.96, 0.38, 0.87, 0.18, 0.31, 0.91, 0.94];
const DY = [2.19, 2.15, 0.86, 2.97, 1.69, 2.77, 1.40, 1.67, 2.89, 2.92];
/* validation indices of random_split(range(100), [80, 20], generator=manual_seed(s)) for s = 0 to 29, and of the stratified split */
const VIDX = [[13, 14, 17, 18, 21, 27, 33, 38, 39, 43, 48, 51, 58, 64, 67, 73, 75, 86, 88, 99], [14, 18, 27, 29, 30, 42, 47, 51, 53, 56, 60, 65, 67, 68, 71, 86, 87, 93, 94, 97], [5, 11, 17, 23, 24, 26, 32, 35, 36, 39, 43, 46, 57, 65, 68, 72, 79, 83, 89, 93], [1, 16, 17, 21, 26, 33, 45, 47, 51, 59, 63, 66, 76, 77, 79, 80, 82, 84, 97, 98], [1, 3, 6, 11, 18, 26, 39, 41, 43, 45, 46, 56, 76, 82, 83, 87, 88, 93, 94, 96], [9, 10, 21, 24, 26, 32, 33, 41, 43, 44, 47, 48, 56, 57, 65, 70, 88, 90, 93, 95], [6, 7, 8, 13, 23, 24, 27, 35, 39, 40, 43, 55, 57, 67, 68, 69, 72, 82, 88, 94], [7, 11, 13, 18, 19, 20, 21, 22, 30, 44, 47, 49, 55, 69, 72, 74, 77, 82, 88, 94], [6, 7, 9, 12, 17, 21, 24, 30, 36, 38, 45, 47, 63, 65, 66, 67, 69, 75, 90, 92], [11, 23, 25, 27, 31, 32, 39, 41, 46, 49, 55, 57, 64, 68, 69, 80, 91, 92, 94, 95], [0, 21, 22, 36, 38, 46, 49, 53, 57, 58, 62, 63, 65, 69, 70, 78, 79, 80, 81, 85], [2, 22, 25, 36, 46, 51, 52, 56, 58, 63, 64, 67, 69, 71, 81, 82, 84, 90, 94, 96], [1, 19, 21, 22, 28, 33, 40, 42, 44, 46, 48, 55, 67, 72, 75, 77, 93, 95, 97, 99], [3, 5, 11, 13, 14, 16, 19, 41, 43, 46, 54, 65, 68, 73, 75, 83, 84, 91, 98, 99], [5, 7, 8, 15, 16, 23, 26, 28, 30, 33, 34, 36, 42, 49, 56, 65, 68, 73, 84, 99], [0, 11, 25, 26, 29, 36, 37, 40, 43, 47, 49, 55, 56, 64, 69, 80, 87, 91, 95, 99], [4, 8, 27, 30, 31, 39, 41, 42, 45, 47, 49, 58, 61, 64, 68, 70, 74, 82, 92, 95], [3, 11, 17, 25, 58, 61, 62, 64, 66, 67, 69, 71, 81, 84, 89, 91, 93, 96, 98, 99], [3, 8, 9, 23, 26, 32, 36, 39, 40, 56, 57, 59, 74, 78, 80, 81, 82, 95, 96, 98], [0, 4, 14, 27, 32, 38, 40, 43, 44, 46, 47, 56, 64, 69, 71, 73, 77, 81, 86, 97], [2, 4, 9, 11, 14, 23, 28, 29, 32, 40, 44, 56, 58, 59, 60, 71, 76, 78, 80, 98], [1, 2, 3, 4, 19, 22, 29, 33, 34, 35, 37, 40, 54, 55, 70, 78, 85, 92, 95, 99], [16, 18, 28, 33, 34, 37, 45, 48, 66, 68, 70, 72, 74, 76, 77, 78, 80, 81, 88, 98], [2, 6, 15, 16, 17, 21, 23, 24, 25, 26, 39, 44, 52, 54, 62, 69, 74, 83, 89, 93], [1, 11, 22, 24, 35, 37, 48, 56, 57, 59, 62, 65, 66, 73, 79, 80, 84, 87, 93, 96], [0, 2, 10, 23, 25, 28, 29, 30, 35, 38, 45, 53, 58, 62, 65, 67, 68, 85, 89, 98], [1, 12, 15, 16, 20, 23, 27, 28, 42, 44, 48, 55, 69, 74, 79, 85, 91, 92, 96, 98], [0, 15, 17, 26, 30, 32, 35, 37, 40, 58, 61, 68, 70, 76, 84, 86, 87, 88, 95, 96], [10, 14, 18, 25, 26, 28, 41, 44, 46, 47, 49, 55, 59, 61, 63, 68, 81, 90, 91, 99], [0, 4, 7, 8, 17, 20, 21, 22, 23, 26, 32, 34, 38, 44, 66, 75, 77, 78, 87, 92]];
const SIDX = [1, 4, 6, 7, 12, 13, 21, 27, 28, 33, 55, 56, 63, 70, 71, 80, 87, 88, 94, 99];
/* class counts of the 1,000 random splits: how many of the 10 class-2 samples landed in validation */
const HIST2 = [87, 280, 328, 182, 94, 25, 4];
const CLS = i => i < 60 ? 0 : i < 90 ? 1 : 2;
const CCOL = [C.blue, C.teal, C.coral];

addLesson("ml", "torch", {
level: "Core", num: "Lesson 25",
id: "ml-torch-l25", title: "Data in PyTorch", short: "25. Data in PyTorch",
big: String.raw`Lesson 24 fed the loop with hand-made batches. Real projects hand that job to two classes. A <code>Dataset</code> answers two questions, how many examples there are and what example number i is, and a <code>DataLoader</code> asks it for indices in some order, stacks the answers into batches and hands them to the loop. Between the stored data and the batch sit the decisions that quietly decide whether a result can be trusted: the shapes and dtypes that come out of collate, a fresh shuffle every epoch for training and a fixed order for evaluation, splits that keep every class, transforms that turn pixels into tensors, augmentation that must keep the label true, separate views so the training transform never leaks into validation, lazy loading when the data do not fit in memory, and worker processes so the model never waits. HW6, HW8 and HW10 build each of these pieces, and the last card collects the bugs that make a pipeline wrong without making it crash.`,
bridge: String.raw`The examples follow HW6 Problem 1.2 (<code>make_loader</code> with <code>TensorDataset</code>, a seeded generator and <code>drop_last=False</code>), HW8 Part 1 (the raw image pool, <code>make_image_transforms</code>, the <code>TransformView</code> wrapper, the stratified 1,437 and 360 split and the paired augmentation audit) and HW10 (<code>balanced_split</code>, the <code>ArrayImages</code> dataset and <code>Normalize((0.5,), (0.5,))</code>), with their solutions docs. The spine is Ng's Deep Learning Specialization: course 2 week 1 (train, dev and test sets from the same distribution), course 2 week 2 (mini-batches built by shuffling and then partitioning, again every epoch) and course 4 week 2 (data augmentation computed on CPU threads while training runs). The data on the cards are new. Lesson 26 moves the batches to the GPU and makes runs reproducible.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The data path", t: "A stored example passes through four stages before the model sees it",
intu: String.raw`HW8's table of the data path is the map for this lesson. The raw dataset retrieves one stored example and its label, untouched. A transform converts or changes that one example, for images a PIL picture into a tensor of shape (1, 28, 28) with a random tilt and shift during training. A dataset view ties one split to its own transform, so training and validation can read the same stored pool in different ways. The DataLoader's sampler chooses which indices form the next batch, and collate stacks the B answers into one tensor with a new first dimension. Step through one batch of HW8's digits, then switch to HW6's line, where the raw data are already tensors and there is no transform at all.`,
eq: String.raw`\[ \text{raw}[i] \;\to\; T(x_i) \;\to\; \text{view}[k] \;\to\; \text{sampler} \;\to\; \text{collate} \]\[ \texttt{xb.shape} = (B, \ldots), \qquad K = \lceil N_{\text{train}} / B \rceil \]`,
sym: [["raw dataset", "returns one stored example and its label"], ["T", "the transform applied to one example when it is requested"], ["view", "one split, a list of indices into the raw pool with its own transform"], ["sampler", "chooses the order of the indices, a new permutation each epoch when shuffle=True"], ["collate", "stacks B examples into one batch along a new dimension 0"]],
how: ["Keep the raw pool free of transforms.", "Attach one transform per split through a view.", "Give the view to a DataLoader with a batch size and a shuffle setting.", "Print one item and one batch with their shapes and dtypes before training.", "Loop over the loader, every iteration gets one batch."],
say: String.raw`A raw dataset returns stored examples, a transform turns one example into a tensor, a view binds a split to its transform, the sampler picks the indices of a batch and collate stacks them into tensors whose first dimension is the batch.`,
num: String.raw`HW8 digits route: 1,797 stored images, a stratified split of <b>1,437</b> and 360, one item of shape (1, 28, 28), batches of (64, 1, 28, 28) float32 with labels (64,) int64, <b>23</b> batches per epoch with a last of 29, and 200,704 bytes per image batch. HW6 line: 210 training rows, items of shape (1,), batches (32, 1), <b>7</b> batches with a last of 18.`,
r(fig, ctl) {
  const ST = ["raw dataset", "transform", "dataset view", "sampler", "collate"];
  const P = [
    { name: "HW8 digits", code: ["raw = DigitsPractice()                 # 1,797 stored images, no transform", "train_tf, eval_tf = make_image_transforms()", "train_view = TransformView(raw, train_idx, train_tf)", "loader = DataLoader(train_view, batch_size=64, shuffle=True, generator=g)", "for xb, yb in loader:", "    logits = model(xb)"],
      steps: [
        [0, 0, "the raw pool", [["object", "DigitsPractice, a map-style Dataset"], ["len(raw)", "1,797 stored examples"], ["raw[i]", "(PIL Image, int), mode L, 28 × 28"], ["stored as", "uint8 arrays and int64 labels"]]],
        [1, 1, "one transform call", [["input", "PIL Image 28 × 28, pixels 0 to 255"], ["ToTensor", "tensor (1, 28, 28) float32 in [0, 1]"], ["RandomRotation(30)", "a new angle in [−30°, 30°] on every call"], ["RandomAffine translate 0.1", "a whole-pixel shift from −3 to 3"]]],
        [2, 2, "the training view", [["object", "TransformView(raw, train_idx, train_tf)"], ["len(train_view)", "1,437 training indices"], ["train_view[k]", "train_tf(raw[train_idx[k]]) and the label"], ["validation view", "the other 360 indices with eval_tf"]]],
        [3, 3, "the sampler", [["shuffle=True", "a new permutation of 0 to 1,436 every epoch"], ["generator", "seeded, so the orders repeat run to run"], ["batches per epoch", "23, the last one has 29 samples"], ["validation loader", "shuffle=False, the same order every time"]]],
        [4, 4, "collate", [["input", "64 pairs of (tensor (1, 28, 28), int)"], ["xb", "(64, 1, 28, 28) float32"], ["yb", "(64,) int64 class indices 0 to 9"], ["memory", "200,704 bytes for the images"]]],
        [4, 5, "what the model receives", [["logits", "(64, 10) from model(xb)"], ["loss", "CrossEntropyLoss(logits, yb)"], ["batch axis", "dimension 0 everywhere"], ["the last batch", "(29, 1, 28, 28), the code must not assume 64"]]]
      ] },
    { name: "HW6 line", code: ["X_tr, y_tr = line_data['train']              # NumPy (210, 1) float32", "                                             # no transform at all", "train = TensorDataset(torch.tensor(X_tr), torch.tensor(y_tr))", "loader = DataLoader(train, batch_size=32, shuffle=True, generator=g)", "for xb, yb in loader:", "    pred = model(xb)"],
      steps: [
        [0, 0, "the raw pool", [["object", "NumPy arrays X and y"], ["shapes", "(300, 1) and (300, 1)"], ["split", "210, 45 and 45 rows"], ["dtype", "float32, checked to be finite"]]],
        [1, 1, "the transform", [["transform", "none, the rows are already numbers"], ["conversion", "torch.tensor once for the whole array"], ["scaling", "Problem 2 standardizes with training statistics before this step"], ["result", "tensors (210, 1) float32"]]],
        [2, 2, "the dataset", [["object", "TensorDataset(X, y)"], ["len(train)", "210"], ["train[k]", "(X[k], y[k]), shapes (1,) and (1,)"], ["check", "both tensors must have 210 rows"]]],
        [3, 3, "the sampler", [["shuffle=True", "a new order every epoch"], ["generator", "torch.Generator().manual_seed(seed)"], ["batches per epoch", "7, six of 32 and one of 18"], ["evaluation loaders", "shuffle=False, drop_last=False"]]],
        [4, 4, "collate", [["input", "32 pairs of (tensor (1,), tensor (1,))"], ["xb", "(32, 1) float32"], ["yb", "(32, 1) float32"], ["last batch", "(18, 1) and (18, 1)"]]],
        [4, 5, "what the model receives", [["pred", "(32, 1) from nn.Linear(1, 1)"], ["loss", "MSELoss(pred, yb), shapes match"], ["epoch loss", "weighted by batch size, Lesson 24"], ["the same loop", "works for every dataset"]]]
      ] }
  ];
  let p = 0;
  ctl.innerHTML = btns(P.map((q, i) => [i, q.name]), "k1p") + `<div id="k1st"></div>`;
  const run = () => {
    pick(ctl, "k1p", p); const Q = P[p];
    $("k1st").innerHTML = "";
    ML.stepper($("k1st"), Q.steps.length, k => {
      const [st, ln, name, rows] = Q.steps[k];
      let s = "";
      ST.forEach((n, i) => { const x = 72 + i * 134; s += node(x, 44, 118, n, i <= st ? "✓" : "", i === st ? "c-teal" : i < st ? "c-blue" : "c-gray", i === st); if (i < 4) s += arrow(x + 60, 44, x + 72, 44, "var(--p)", 1.5); });
      s += tx(30, 104, Q.name + ": " + name, null, "th");
      rows.forEach(([a, b], i) => { s += tx(30, 134 + i * 26, a, null, "t") + tx(250, 134 + i * 26, b, null, "th"); });
      fig.innerHTML = svg(236, s) + ML.code(Q.code, ln);
    }, Q.steps.map(q => q[2]));
  };
  bind(ctl, "k1p", i => { p = i; run(); }); run();
}},

{s: "2. The Dataset contract", t: "Two methods, __len__ and __getitem__, make any object a dataset",
intu: String.raw`A map-style dataset is any object with two methods. <code>__len__</code> says how many examples exist and <code>__getitem__(i)</code> returns example number i, usually as a tuple (input, target). Python calls them for <code>len(ds)</code> and <code>ds[i]</code>, the dunder methods of Lesson 6. Nothing else is required, which is why a dataset can hold arrays in memory, file paths on disk or a generator of synthetic samples. The DataLoader never looks inside, it only asks for a length and for items by index. Step through a tiny dataset over the ten points of this lesson and notice two things. The dataset stores references to X and Y, not copies, and an index past the end raises the same IndexError as the tensor it wraps.`,
eq: String.raw`\[ \texttt{len(ds)} = N, \qquad \texttt{ds[i]} = (x_i, y_i), \quad 0 \le i \lt N \]`,
sym: [[String.raw`\(\texttt{\_\_len\_\_}\)`, "called by len(ds), returns N"], [String.raw`\(\texttt{\_\_getitem\_\_}\)`, "called by ds[i], returns example i"], ["map-style", "items are reached by index, the kind DataLoader shuffles"], ["iterable-style", "IterableDataset, items arrive as a stream, for data that cannot be indexed"], ["N", "the number of examples, 10 here"]],
how: ["Subclass <code>torch.utils.data.Dataset</code>.", "Store what you need in <code>__init__</code>, cheap things such as arrays or paths.", "Return the count from <code>__len__</code>.", "Return one (input, target) pair from <code>__getitem__</code>.", "Test <code>len(ds)</code>, <code>ds[0]</code> and the last index before you build a loader."],
say: String.raw`A map-style Dataset is any object whose length method returns the number of examples and whose getitem method returns example i, usually as an input and target pair, and the DataLoader only ever calls these two.`,
num: String.raw`The ten points are x = 0.50, 0.60, 0.01, 0.96, … with y close to 1 + 2x. <code>len(ds)</code> is <b>10</b>, <code>ds[3]</code> is <b>(tensor([0.9600]), tensor([2.9700]))</b> with shapes (1,) and (1,), and <code>ds[10]</code> raises <b>IndexError: index 10 is out of bounds for dimension 0 with size 10</b>.`,
r(fig, ctl) {
  const code = ["class LineData(Dataset):", "    def __init__(self, x, y):", "        self.x, self.y = x, y", "    def __len__(self):", "        return len(self.x)", "    def __getitem__(self, i):", "        return self.x[i], self.y[i]", "ds = LineData(X, Y)", "print(len(ds))", "print(ds[3])", "x3, y3 = ds[3]", "print(x3.shape, y3.shape)", "print(ds[10])"];
  const tX = ["X", "tensor (10, 1)", "[[0.50], [0.60], [0.01], …]"], tY = ["Y", "tensor (10, 1)", "[[2.19], [2.15], [0.86], …]"];
  const base = [["X", "X"], ["Y", "Y"]], bo = [tX, tY];
  const cls = ["C", "class", "LineData(Dataset)"], dso = ["D", "LineData object", "x → X, y → Y, no copy"];
  ML.memory(fig, ctl, { code, steps: [
    { ln: -1, vars: base, objs: bo, note: "Before the class: two tensors of ten rows." },
    { ln: 6, vars: base.concat([["LineData", "C"]]), objs: bo.concat([cls]), note: "The class statement only defines the methods. Nothing runs yet." },
    { ln: 7, vars: base.concat([["LineData", "C"], ["ds", "D"]]), objs: bo.concat([cls, dso]), note: "__init__ stores references. ds.x is X itself, so changing X in place would change the dataset too." },
    { ln: 8, vars: base.concat([["LineData", "C"], ["ds", "D"]]), objs: bo.concat([cls, dso]), out: ["10"], note: "len(ds) calls ds.__len__(), which returns len(self.x)." },
    { ln: 9, vars: base.concat([["LineData", "C"], ["ds", "D"]]), objs: bo.concat([cls, dso]), out: ["10", "(tensor([0.9600]), tensor([2.9700]))"], note: "ds[3] calls ds.__getitem__(3) and returns a tuple of row 3 of X and row 3 of Y." },
    { ln: 10, vars: base.concat([["ds", "D"], ["x3", "a"], ["y3", "b"]]), objs: bo.concat([dso, ["a", "tensor (1,)", "[0.9600]"], ["b", "tensor (1,)", "[2.9700]"]]), out: ["10", "(tensor([0.9600]), tensor([2.9700]))"], note: "Unpacking the tuple gives two tensors of shape (1,). Indexing a row of a (10, 1) tensor drops the first dimension." },
    { ln: 11, vars: base.concat([["ds", "D"], ["x3", "a"], ["y3", "b"]]), objs: bo.concat([dso, ["a", "tensor (1,)", "[0.9600]"], ["b", "tensor (1,)", "[2.9700]"]]), out: ["10", "(tensor([0.9600]), tensor([2.9700]))", "torch.Size([1]) torch.Size([1])"], note: "One item has no batch dimension. Collate adds it later (card 4)." },
    { ln: 12, vars: base.concat([["ds", "D"]]), objs: bo.concat([dso]), out: ["10", "(tensor([0.9600]), tensor([2.9700]))", "torch.Size([1]) torch.Size([1])", "IndexError: index 10 is out of bounds for dimension 0 with size 10"], note: "Valid indices are 0 to 9. The error comes from the tensor inside, the Dataset adds no check of its own." }
  ] });
}},

{s: "3. TensorDataset and the shapes it returns", t: "Row i of every tensor is example i, so the target shape survives into the batch",
intu: String.raw`When the data are already tensors in memory, <code>TensorDataset(X, y)</code> is the whole Dataset: item i is the tuple of row i of each tensor. It only checks that every tensor has the same number of rows. HW6's <code>make_loader</code> adds the checks that TensorDataset does not make: a 2D input, a target of shape (N, 1), finite values, float32 and a seeded generator. The target check matters because the shape of y passes unchanged through the item and the batch. A target of shape (N,) gives items of shape () and batches of shape (B,), and subtracting that from a prediction of shape (B, 1) broadcasts to a (B, B) table, the trap of Lessons 18 and 21. Change the target layout and the batch size and read the shapes that come out.`,
eq: String.raw`\[ \texttt{ds[i]} = (X_{i,:},\, y_{i,:}), \qquad \texttt{yb.shape} = (B, 1) \]\[ (B, 1) - (B,) \to (B, B), \quad \frac{1}{B^2} \sum_{i,j} (\hat y_i - y_j)^2 \ne \frac{1}{B} \sum_i (\hat y_i - y_i)^2 \]`,
sym: [["TensorDataset", "wraps tensors with the same first dimension"], ["X", "inputs, shape (N, d)"], ["y", "targets, shape (N, 1) for one output"], ["(B, B)", "the broadcast table of every prediction minus every target"], [String.raw`\(\hat y = 1 + 2x\)`, "the noiseless line, used here as the model"]],
how: ["Reshape targets with <code>y.reshape(-1, 1)</code> before building the dataset.", "Convert once with <code>torch.tensor(a, dtype=torch.float32)</code>.", "Check <code>len(X) == len(y)</code>, TensorDataset raises if not.", "Print <code>xb.shape</code> and <code>yb.shape</code> for the first batch.", "Assert <code>pred.shape == yb.shape</code> inside the loss function."],
say: String.raw`TensorDataset returns row i of each tensor, so a target stored as N by 1 gives batches of B by 1 that match the prediction, while a target stored as a flat vector gives batches of shape B that broadcast against B by 1 into a B by B table.`,
num: String.raw`On all ten points with the line 1 + 2x as the model, the correct MSE is <b>0.0083</b> and the broadcast MSE is <b>0.9150</b>, with PyTorch's UserWarning about a target size of [10] against an input of [10, 1]. A target with 9 rows fails at once with AssertionError: Size mismatch between tensors.`,
r(fig, ctl) {
  let v = 0;
  ctl.innerHTML = btns([[0, "y shape (N, 1)"], [1, "y shape (N,)"], [2, "y with 9 rows"]], "k3") + sl("k3b", "batch size B", 1, 10, 1, 4);
  const u = () => {
    pick(ctl, "k3", v); const B = +$("k3b").value; $("k3bv").textContent = B;
    let s = tx(40, 22, "X (10, 1)", null, "th") + tx(130, 22, v === 1 ? "y (10,)" : v === 2 ? "y (9, 1)" : "y (10, 1)", null, "th");
    for (let i = 0; i < 10; i++) {
      const on = i < B && v !== 2, y0 = 32 + i * 22;
      s += `<rect x="40" y="${y0}" width="70" height="20" rx="4" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(75, y0 + 14, DX[i].toFixed(2), "middle", "t");
      if (v === 2 && i === 9) s += `<rect x="130" y="${y0}" width="70" height="20" rx="4" fill="var(--coral-bg)" stroke="${C.coral}" stroke-dasharray="3 3"/>` + tx(165, y0 + 14, "missing", "middle", "t");
      else s += `<rect x="130" y="${y0}" width="70" height="20" rx="4" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(165, y0 + 14, DY[i].toFixed(2), "middle", "t");
      s += tx(32, y0 + 14, i, "end");
    }
    if (v !== 2) s += tx(210, 32 + B * 22 - 6, "← first batch", null, "t");
    const pr = DX.slice(0, B).map(x => 1 + 2 * x), ys = DY.slice(0, B);
    const ok = pr.reduce((a, p, i) => a + (p - ys[i]) ** 2, 0) / B;
    let bc = 0; pr.forEach(p => ys.forEach(y => bc += (p - y) ** 2)); bc /= B * B;
    const rows = v === 2 ? [["TensorDataset(X, y)", "AssertionError"], ["reason", "X has 10 rows, y has 9"], ["when", "at construction, before any loop"]] :
      [["ds[0]", v ? "(tensor (1,), tensor ())" : "(tensor (1,), tensor (1,))"], ["xb.shape", `(${B}, 1)`], ["yb.shape", v ? `(${B},)` : `(${B}, 1)`], ["pred = model(xb)", `(${B}, 1)`], ["pred − yb", v ? `(${B}, ${B})` : `(${B}, 1)`], ["MSE of the first batch", fm(v ? bc : ok, 4)], ["correct MSE", fm(ok, 4)]];
    rows.forEach(([a, b], i) => s += tx(320, 50 + i * 28, a, null, "t") + tx(500, 50 + i * 28, b, null, "th"));
    if (v === 1 && B > 1) s += tx(320, 50 + 7 * 28, "every prediction minus every target", null, "t");
    const term = v === 2 ? ["AssertionError: Size mismatch between tensors"] : v === 1 ? [`torch.Size([${B}, 1]) torch.Size([${B}])`, "UserWarning: Using a target size (torch.Size([" + B + "])) that is different to the", "input size (torch.Size([" + B + ", 1])). This will likely lead to incorrect results", "due to broadcasting. Please ensure they have the same size.", "loss " + bc.toFixed(4)] : [`torch.Size([${B}, 1]) torch.Size([${B}, 1])`, "loss " + ok.toFixed(4)];
    fig.innerHTML = svg(262, s) + ML.code([v === 1 ? "ds = TensorDataset(X, y.reshape(-1))          # flat target" : v === 2 ? "ds = TensorDataset(X, y[:9])                    # one row short" : "ds = TensorDataset(X, y)                        # y is (10, 1)", `xb, yb = next(iter(DataLoader(ds, batch_size=${B})))`, "print(xb.shape, yb.shape)", "print('loss', nn.MSELoss()(1 + 2 * xb, yb))"], -1) + ML.term(term);
  };
  bind(ctl, "k3", i => { v = i; u(); }); $("k3b").oninput = u; u();
}},

{s: "4. Collate: from samples to a batch", t: "default_collate stacks tensors and turns Python numbers into tensors with fixed dtypes",
intu: String.raw`The DataLoader collects B items and passes the list to a collate function. The default one follows the structure of the first item. Tensors are stacked along a new dimension 0, so items of shape (2,) become (B, 2). A Python int becomes an int64 tensor, which is what CrossEntropyLoss wants for class labels. A Python float becomes a <b>float64</b> tensor, while NumPy float32 values stay float32. Tuples and dicts keep their shape and each position is collated on its own. A Python list is treated the same way, so a list of two features comes out as a list of two tensors of shape (B,), not one (B, 2) tensor. Tensors of different sizes cannot be stacked. Choose what <code>__getitem__</code> returns and watch the batch.`,
eq: String.raw`\[ \text{collate}\big((x_1, y_1), \dots, (x_B, y_B)\big) = \big(\text{stack}(x_1, \dots, x_B),\; \text{tensor}(y_1, \dots, y_B)\big) \]\[ x_i \in \mathbb{R}^{d} \;\Rightarrow\; \texttt{xb.shape} = (B, d) \]`,
sym: [[String.raw`\(\texttt{default\_collate}\)`, "the collate function a DataLoader uses unless you pass another"], ["stack", "joins equal-shaped tensors along a new dimension 0"], ["int64", "the dtype of collated Python ints, right for class indices"], ["float64", "the dtype of collated Python floats, nn.Linear weights are float32"], [String.raw`\(\texttt{collate\_fn}\)`, "your own function for items that <code>default_collate</code> cannot stack"]],
how: ["Return tensors, or NumPy float32 arrays, from <code>__getitem__</code>, not Python lists.", "Return class labels as Python ints or int64 tensors.", "Return regression targets as float32 tensors of shape (1,).", "Give items with different sizes a custom <code>collate_fn</code> that pads them.", "Print the dtype of <code>xb</code> and <code>yb</code> once."],
say: String.raw`Default collate stacks tensors along a new batch dimension, turns Python ints into int64 and Python floats into float64 tensors, collates tuples, lists and dicts position by position, and fails when tensors have different sizes.`,
num: String.raw`Three items (tensor([0.5, 1.0]), 2), (tensor([1.5, 3.0]), 0), (tensor([2.5, 5.0]), 1) give xb of shape <b>(3, 2)</b> float32 and yb <b>tensor([2, 0, 1])</b> int64. With the labels as floats yb is <b>float64</b>. With lists the features arrive as two float64 tensors of shape (3,), and nn.Linear then raises mat1 and mat2 must have the same dtype, but got Double and Float.`,
r(fig, ctl) {
  const K = [
    { b: "tensor, int", smp: ["(tensor([0.5, 1.0]), 2)", "(tensor([1.5, 3.0]), 0)", "(tensor([2.5, 5.0]), 1)"], out: [["xb", "(3, 2) float32", 1], ["yb", "(3,) int64", 1]], term: ["[tensor([[0.5000, 1.0000],", "        [1.5000, 3.0000],", "        [2.5000, 5.0000]]), tensor([2, 0, 1])]"], note: "The usual classification item: features stacked, labels as int64 class indices." },
    { b: "tensor, float", smp: ["(tensor([0.5, 1.0]), 2.0)", "(tensor([1.5, 3.0]), 0.0)", "(tensor([2.5, 5.0]), 1.0)"], out: [["xb", "(3, 2) float32", 1], ["yb", "(3,) float64", 0]], term: ["[tensor([[0.5000, 1.0000],", "        [1.5000, 3.0000],", "        [2.5000, 5.0000]]), tensor([2., 0., 1.], dtype=torch.float64)]"], note: "Python floats become float64. The loss is then computed in float64 and the shape is (3,), not (3, 1). Return torch.tensor([y], dtype=torch.float32) instead." },
    { b: "list, float", smp: ["([0.5, 1.0], 2.0)", "([1.5, 3.0], 0.0)", "([2.5, 5.0], 1.0)"], out: [["xb", "list of 2 tensors (3,) float64", 0], ["yb", "(3,) float64", 0]], term: ["[[tensor([0.5000, 1.5000, 2.5000], dtype=torch.float64), tensor([1., 3., 5.],", "dtype=torch.float64)], tensor([2., 0., 1.], dtype=torch.float64)]", "RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float"], note: "A list is collated position by position, so each feature becomes its own column tensor. The model cannot take a list, and torch.stack would still give float64." },
    { b: "NumPy float32", smp: ["(array([0.5, 1.0], float32), float32(2.0))", "(array([1.5, 3.0], float32), float32(0.0))", "(array([2.5, 5.0], float32), float32(1.0))"], out: [["xb", "(3, 2) float32", 1], ["yb", "(3,) float32", 1]], term: ["[tensor([[0.5000, 1.0000],", "        [1.5000, 3.0000],", "        [2.5000, 5.0000]]), tensor([2., 0., 1.])]"], note: "NumPy arrays and NumPy scalars keep their dtype through collate." },
    { b: "dict", smp: ["{'x': tensor([0.5, 1.0]), 'y': 2}", "{'x': tensor([1.5, 3.0]), 'y': 0}", "{'x': tensor([2.5, 5.0]), 'y': 1}"], out: [["batch['x']", "(3, 2) float32", 1], ["batch['y']", "(3,) int64", 1]], term: ["{'x': tensor([[0.5000, 1.0000],", "        [1.5000, 3.0000],", "        [2.5000, 5.0000]]), 'y': tensor([2, 0, 1])}"], note: "Dicts keep their keys, a readable choice when an item has many parts." },
    { b: "unequal sizes", smp: ["(tensor([0.5, 1.0]), 2)", "(tensor([1.5, 3.0, 4.0]), 0)", "…"], out: [["xb", "cannot stack", 0], ["yb", "not reached", 0]], term: ["RuntimeError: stack expects each tensor to be equal size, but got [2] at entry 0", "and [3] at entry 1"], note: "Sequences of different lengths need a collate_fn that pads them to one length, Part 8 does this for text." }
  ];
  let v = 0;
  ctl.innerHTML = btns(K.map((q, i) => [i, q.b]), "k4");
  const u = () => {
    pick(ctl, "k4", v); const q = K[v];
    let s = tx(30, 22, "three items from __getitem__", null, "th") + tx(470, 22, "the batch", null, "th");
    q.smp.forEach((t, i) => s += `<g class="c-gray"><rect x="20" y="${36 + i * 44}" width="330" height="34" rx="7" stroke-width="0.7"/></g>` + `<text class="t" x="34" y="${58 + i * 44}" style="font-family:var(--mono);font-size:12px">${ML.esc(t)}</text>`);
    s += arrow(360, 102, 420, 102, "var(--p)", 2) + tx(390, 92, "collate", "middle");
    q.out.forEach(([a, b, ok], i) => s += `<g class="${ok ? "c-teal" : "c-coral"}"><rect x="430" y="${50 + i * 56}" width="230" height="44" rx="8" stroke-width="1"/></g>` + tx(545, 68 + i * 56, a, "middle", "th") + tx(545, 86 + i * 56, b, "middle", "t"));
    fig.innerHTML = svg(176, s) + ML.term(q.term) + `<p class="note">${q.note}</p>`;
  };
  bind(ctl, "k4", i => { v = i; u(); }); u();
}},

{s: "5. Shuffling and the sampler", t: "Training gets a new order every epoch, evaluation keeps one order",
intu: String.raw`Ng builds mini-batches in two steps, shuffle the training set and then cut it into pieces of B, and he shuffles again every epoch so that no batch is always the same group of examples. <code>shuffle=True</code> does exactly that through a RandomSampler: every time you start iterating over the loader it draws a new permutation. A seeded <code>torch.Generator</code> makes the sequence of permutations repeat from run to run, which is how HW6 and HW8 make their batch orders reproducible. Evaluation loaders use <code>shuffle=False</code>, because order does not change a summed loss and a fixed order lets you pair predictions with stored labels. One habit breaks all this: <code>next(iter(loader))</code> starts a new epoch every time it is called.`,
eq: String.raw`\[ \pi_e = \text{a random permutation of } \{0, \dots, N-1\} \text{ for epoch } e \]\[ \text{batch } k = \big(\pi_e(kB), \dots, \pi_e(kB + B - 1)\big) \]`,
sym: [[String.raw`\(\pi_e\)`, "the order used in epoch e"], ["RandomSampler", "what shuffle=True builds, one permutation per pass"], ["SequentialSampler", "what shuffle=False builds, 0, 1, 2, … every time"], ["generator", "a seeded torch.Generator that fixes the sequence of permutations"], ["iter(loader)", "starts a new pass, and with shuffle a new permutation"]],
how: ["Shuffle the training loader and give it a seeded generator.", "Never shuffle validation or test loaders.", "Loop with <code>for xb, yb in loader</code>, one pass per epoch.", "Use <code>next(iter(loader))</code> only to inspect one batch.", "Split by group or by time first when examples are not independent, then shuffle inside the training split."],
say: String.raw`With shuffle set to true the sampler draws a new permutation of the indices every time the loader is iterated, a seeded generator makes those permutations reproducible, and evaluation loaders keep the natural order.`,
num: String.raw`Ten indices, B = 4, generator seed 2525. Epoch 1 is <b>[0, 2, 3, 8], [9, 5, 6, 1], [4, 7]</b>, epoch 2 is [9, 0, 4, 8], [5, 7, 2, 6], [1, 3], epoch 3 is [3, 1, 7, 5], [4, 6, 2, 0], [8, 9]. Without shuffling, every epoch is [0, 1, 2, 3], [4, 5, 6, 7], [8, 9], and three calls of <code>next(iter(loader))</code> give <b>[0, 1, 2, 3]</b> three times.`,
r(fig, ctl) {
  const O = { 0: [[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]], [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]], [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]]],
    1: [[[0, 2, 3, 8], [9, 5, 6, 1], [4, 7]], [[9, 0, 4, 8], [5, 7, 2, 6], [1, 3]], [[3, 1, 7, 5], [4, 6, 2, 0], [8, 9]]],
    2: [[[0, 1, 2, 3]], [[0, 1, 2, 3]], [[0, 1, 2, 3]]], 3: [[[0, 2, 3, 8]], [[3, 0, 1, 9]], [[6, 5, 1, 8]]] };
  const L = ["shuffle=False", "shuffle=True, seed 2525", "next(iter(loader)), no shuffle", "next(iter(loader)), shuffle"];
  const CODE = [["loader = DataLoader(range(10), batch_size=4, shuffle=False)", "for epoch in range(3):", "    print([b.tolist() for b in loader])"], ["g = torch.Generator().manual_seed(2525)", "loader = DataLoader(range(10), batch_size=4, shuffle=True, generator=g)", "for epoch in range(3):", "    print([b.tolist() for b in loader])"], ["loader = DataLoader(range(10), batch_size=4, shuffle=False)", "for step in range(3):", "    xb = next(iter(loader))       # a new pass every call", "    print(xb.tolist())"], ["g = torch.Generator().manual_seed(2525)", "loader = DataLoader(range(10), batch_size=4, shuffle=True, generator=g)", "for step in range(3):", "    print(next(iter(loader)).tolist())"]];
  const BC = [["var(--teal-bg)", C.teal], ["var(--blue-bg)", C.blue], ["var(--purple-bg)", C.purple]];
  let v = 1;
  ctl.innerHTML = btns(L.map((t, i) => [i, t]), "k5");
  const u = () => {
    pick(ctl, "k5", v); const E = O[v];
    let s = "";
    E.forEach((ep, e) => {
      const y = 30 + e * 54; let x = 120;
      s += tx(30, y + 16, v >= 2 ? "call " + (e + 1) : "epoch " + (e + 1), null, "th");
      ep.forEach((b, k) => { b.forEach(i => { s += chip(x, y, 40, i, BC[k][0], BC[k][1]); x += 44; }); x += 18; });
      if (v === 2) s += tx(x + 10, y + 16, "indices 4 to 9 are never reached", null, "t");
    });
    s += tx(30, 196, v === 0 ? "the same three batches every epoch, fine for evaluation" : v === 1 ? "a new permutation every pass, the batches mix differently each epoch" : v === 2 ? "training on the first batch over and over, the model never sees 6 of 10 examples" : "a fresh pass on every call, the first batch of a new permutation each time", null, "t");
    fig.innerHTML = svg(208, s) + ML.code(CODE[v], -1) + ML.term(E.map(ep => JSON.stringify(v >= 2 ? ep[0] : ep).replace(/,/g, ", ")));
  };
  bind(ctl, "k5", i => { v = i; u(); }); u();
}},

{s: "6. Splitting without losing a class", t: "A random split can starve a rare class, a stratified split keeps the proportions",
intu: String.raw`Ng's rule for dev and test sets is that they must come from the same distribution as the data the model will meet. A purely random split respects that only on average. With a rare class, one split can easily get too few examples, or none, and then validation says nothing about that class. <code>random_split(ds, [80, 20], generator=g)</code> returns two Subsets, views that hold the dataset and a list of indices. HW8 instead calls <code>train_test_split(..., stratify=labels)</code>, which keeps each class's share in both parts, and HW10's <code>balanced_split</code> takes the same number from every class. The 100 dots below have classes of 60, 30 and 10, and a ring marks the 20 that go to validation. Move the seed of the random split and compare with the stratified split.`,
eq: String.raw`\[ P(\text{no rare example in validation}) = \frac{\binom{N - r}{n}}{\binom{N}{n}} \]\[ \text{stratified: } n_c = n \cdot \frac{N_c}{N} \text{ for every class } c \]`,
sym: [["N", "samples, 100 here"], ["n", "validation size, 20 here"], ["r", "examples of the rare class, 10 here"], [String.raw`\(N_c\)`, "examples of class c"], ["Subset", "what <code>random_split</code> returns, a dataset and a list of indices"]],
how: ["Count the examples per class before you split.", "Use a stratified split for classification, HW8's <code>train_test_split(..., stratify=labels)</code>.", "Use a seeded generator or <code>random_state</code> so the split repeats.", "Check that the index sets are disjoint and cover every example once.", "Print the class counts of every split."],
say: String.raw`A random split keeps class proportions only on average, so a rare class can be missing from validation, while a stratified split takes the same share of every class for each part.`,
num: String.raw`Classes 60, 30, 10, validation 20. Stratified always gives <b>12, 6, 2</b>. Random split with seed 0 gives 13, 6, 1. Over 1,000 seeds the rare class got 0 to 6 validation examples and <b>none in 87</b> of them, close to the exact probability <b>0.0951</b>. <code>random_split</code> also accepts fractions, [0.7, 0.15, 0.15] of 300 gives 210, 45, 45, and lengths that do not add up raise a ValueError.`,
r(fig, ctl) {
  let strat = 0;
  ctl.innerHTML = btns([[0, "random_split"], [1, "stratified"]], "k6") + sl("k6s", "seed of random_split", 0, 29, 1, 0);
  const u = () => {
    pick(ctl, "k6", strat); const sd = +$("k6s").value; $("k6sv").textContent = strat ? "not used" : sd;
    const V = new Set(strat ? SIDX : VIDX[sd]), cnt = [0, 0, 0];
    V.forEach(i => cnt[CLS(i)]++);
    let s = tx(30, 20, strat ? "stratified split, random_state 2525" : "random_split, seed " + sd, null, "th");
    for (let i = 0; i < 100; i++) {
      const x = 40 + (i % 10) * 26, y = 40 + Math.floor(i / 10) * 24, c = CCOL[CLS(i)], on = V.has(i);
      s += `<circle cx="${x}" cy="${y}" r="7" fill="${c}" opacity="${on ? 1 : 0.35}"/>` + (on ? `<circle cx="${x}" cy="${y}" r="10.5" fill="none" stroke="var(--fg)" stroke-width="1.6"/>` : "");
    }
    ["class 0, 60", "class 1, 30", "class 2, 10"].forEach((t, k) => s += `<circle cx="${40 + k * 92}" cy="${290}" r="6" fill="${CCOL[k]}"/>` + tx(50 + k * 92, 294, t));
    s += tx(330, 48, "validation counts", null, "th");
    ["class 0", "class 1", "class 2"].forEach((t, k) => s += tx(330, 74 + k * 24, t) + tx(420, 74 + k * 24, cnt[k], null, "th") + tx(460, 74 + k * 24, "stratified gives " + [12, 6, 2][k], null, "t"));
    const a = ML.axes(370, 168, 270, 90, { xmin: -0.5, xmax: 6.5, ymin: 0, ymax: 350, nx: 1, ny: 2, xl: "class 2 examples in validation", fx: () => "", fy: v => Math.round(v), grid: false });
    for (let k = 0; k <= 6; k++) s += tx(a.X(k), 274, k, "middle");
    s += a.s + tx(330, 160, "1,000 random seeds", null, "th");
    HIST2.forEach((h, k) => s += `<rect x="${a.X(k - 0.35)}" y="${a.Y(h)}" width="${a.X(k + 0.35) - a.X(k - 0.35)}" height="${a.Y(0) - a.Y(h)}" fill="${k === cnt[2] ? C.coral : "var(--blue-bg)"}" stroke="${k === cnt[2] ? C.coral : C.blue}" stroke-width="0.8"/>`);
    fig.innerHTML = svg(306, s) + ML.code(strat ? ["train_idx, val_idx = train_test_split(np.arange(100), test_size=0.2,", "                                    random_state=2525, stratify=labels)", "print(np.bincount(labels[val_idx]))"] : [`g = torch.Generator().manual_seed(${sd})`, "train_ds, val_ds = random_split(ds, [80, 20], generator=g)", "print(np.bincount(labels[val_ds.indices]))"], -1) + ML.term([`[${cnt.join(" ")}]`]);
  };
  bind(ctl, "k6", i => { strat = i; u(); }); $("k6s").oninput = () => { strat = 0; u(); }; u();
}},

{s: "7. Transforms: from pixels to tensors", t: "ToTensor scales uint8 to [0, 1] and moves channels first, Normalize shifts and scales each channel",
intu: String.raw`A transform is any callable that takes one example and returns a new one, and <code>transforms.Compose</code> applies a list of them in order inside <code>__getitem__</code>. Two of them appear in every image homework. <code>ToTensor</code> turns a PIL image or a uint8 array of shape (H, W) or (H, W, C) into a float32 tensor of shape (C, H, W) and divides by 255, so pixels land in [0, 1]. <code>Normalize(mean, std)</code> then computes (x − mean) / std for each channel. HW10 uses mean 0.5 and std 0.5, which maps [0, 1] onto [−1, 1]. Using the training set's own mean and standard deviation instead gives inputs with mean near 0 and spread near 1, the same idea as the feature scaling of Lesson 17, and those statistics come from the training split only. Two traps sit here: ToTensor divides only uint8 data, and Normalize needs a tensor, so its place is after ToTensor.`,
eq: String.raw`\[ \texttt{ToTensor}: \ x \mapsto \frac{x}{255}, \quad (H, W, C) \to (C, H, W) \]\[ \texttt{Normalize}: \ x_c \mapsto \frac{x_c - \mu_c}{\sigma_c} \]`,
sym: [[String.raw`\(\mu_c\)`, "mean of channel c, from the training images"], [String.raw`\(\sigma_c\)`, "standard deviation of channel c"], ["Compose", "applies a list of transforms in order"], ["uint8", "pixel values 0 to 255, the only dtype ToTensor divides by 255"], ["(C, H, W)", "channels first, the layout every nn.Conv2d expects"]],
how: ["Keep stored images as uint8 arrays or PIL images.", "Put <code>ToTensor()</code> first in the Compose.", "Compute the mean and std of the training images only, after ToTensor.", "Add <code>Normalize(mean, std)</code> after ToTensor in every split's transform.", "Check one item: shape, dtype, minimum and maximum."],
say: String.raw`ToTensor turns a uint8 image of height, width and channels into a float tensor of channels, height and width with values divided by 255, and Normalize subtracts a per-channel mean and divides by a per-channel standard deviation estimated on the training images.`,
num: String.raw`The 4 by 4 image has pixels 0 to 255. ToTensor gives 0, 0.2510, <b>0.5020</b>, 1 in the first row and shape (1, 4, 4). Normalize((0.5,), (0.5,)) maps them to −1, −0.4980, <b>0.0039</b>, 1. With the MNIST training statistics 0.1307 and 0.3081 the pixel 255 becomes <b>2.8215</b>. The same pixels as a float32 array stay 0 to <b>255</b> after ToTensor.`,
r(fig, ctl) {
  const IMG = [[0, 64, 128, 255], [32, 96, 160, 224], [0, 0, 255, 255], [16, 48, 80, 112]];
  const S = [
    ["uint8 array", IMG, 0, "(4, 4)", "uint8", ["img = np.array(..., dtype=np.uint8)     # 4 by 4 pixels", "print(img.shape, img.dtype)"], ["(4, 4) uint8"]],
    ["ToTensor", IMG.map(r => r.map(v => v / 255)), 4, "(1, 4, 4)", "float32", ["t = transforms.ToTensor()(img)", "print(t.shape, t.dtype, t.min(), t.max())"], ["torch.Size([1, 4, 4]) torch.float32 tensor(0.) tensor(1.)"]],
    ["Normalize 0.5, 0.5", IMG.map(r => r.map(v => (v / 255 - 0.5) / 0.5)), 4, "(1, 4, 4)", "float32", ["tf = transforms.Compose([transforms.ToTensor(),", "                         transforms.Normalize((0.5,), (0.5,))])", "print(tf(img).min(), tf(img).max())"], ["tensor(-1.) tensor(1.)"]],
    ["Normalize MNIST stats", IMG.map(r => r.map(v => (v / 255 - 0.1307) / 0.3081)), 4, "(1, 4, 4)", "float32", ["tf = transforms.Compose([transforms.ToTensor(),", "                         transforms.Normalize((0.1307,), (0.3081,))])", "print(tf(img).min(), tf(img).max())"], ["tensor(-0.4242) tensor(2.8215)"]],
    ["trap: float32 array", IMG, 1, "(1, 4, 4)", "float32", ["t = transforms.ToTensor()(img.astype(np.float32))", "print(t.max())"], ["tensor(255.)"]],
    ["trap: Normalize first", null, 0, "none", "none", ["tf = transforms.Compose([transforms.Normalize((0.5,), (0.5,)),", "                         transforms.ToTensor()])", "tf(Image.fromarray(img))"], ["TypeError: img should be Tensor Image. Got <class 'PIL.Image.Image'>"]]
  ];
  let v = 1;
  ctl.innerHTML = btns(S.map((q, i) => [i, q[0]]), "k7");
  const u = () => {
    pick(ctl, "k7", v); const [name, A, dec, sh, dt] = S[v];
    let s = "";
    if (A) {
      const g = ML.grid(A, { x: 60, y: 40, cell: 66, dec, title: name, rowLab: false, colLab: false, fmt: x => dec ? fm(x, 4) : String(x) });
      s += g.s;
      const flat = A.flat();
      [["shape", sh], ["dtype", dt], ["minimum", dec ? fm(Math.min(...flat), 4) : Math.min(...flat)], ["maximum", dec ? fm(Math.max(...flat), 4) : Math.max(...flat)], ["mean", fm(flat.reduce((a, b) => a + b, 0) / 16, 4)]].forEach(([a, b], i) => s += tx(380, 60 + i * 30, a, null, "t") + tx(480, 60 + i * 30, b, null, "th"));
      s += tx(380, 232, "the image itself", null, "t"); IMG.forEach((row, r) => row.forEach((p, c) => s += `<rect x="${500 + c * 18}" y="${218 + r * 18}" width="18" height="18" fill="rgb(${p},${p},${p})" stroke="var(--line)" stroke-width="0.5"/>`));
      if (v === 4) s += tx(380, 310, "not divided by 255, the network sees 0 to 255", null, "t");
      if (v === 2) s += tx(380, 310, "0.5 and 0.5 map [0, 1] onto [−1, 1]", null, "t");
      if (v === 3) s += tx(380, 310, "the dark pixel 0 becomes −0.4242", null, "t");
    } else s += tx(340, 120, "Normalize receives a PIL image and stops", "middle", "th") + tx(340, 148, "transforms run in the order of the list", "middle", "t");
    fig.innerHTML = svg(324, s) + ML.code(S[v][5], -1) + ML.term(S[v][6]);
  };
  bind(ctl, "k7", i => { v = i; u(); }); u();
}},

{s: "8. Augmentation keeps the label true", t: "A random change on every access, only if the change cannot change the answer",
intu: String.raw`Augmentation puts random transforms into the training view. Every time an example is requested it comes back slightly different, a new tilt, a new shift, so over many epochs the model sees many plausible versions of each stored image. Ng presents the usual menu for images, mirroring, random cropping, rotation, shearing and color shifts, and HW8 uses rotation up to 30° and a shift up to 10% of the width. Two facts keep this honest. The dataset length does not change, 1,437 stored images stay 1,437 per epoch, and the variants are correlated copies, not new handwriting. And the transform must not change the label: a mirrored 7 is not a digit anyone writes, and a 6 turned upside down is a 9. Move the sliders, draw random HW8 transforms and try the two label breakers.`,
eq: String.raw`\[ \theta \sim U(-30^\circ, 30^\circ), \qquad t_x = \text{round}\big(U(-0.1 W, 0.1 W)\big) \]\[ W = 28: \ t_x \in \{-3, \dots, 3\}, \quad P(t_x = 0) = \frac{1}{5.6} = 0.179 \]`,
sym: [[String.raw`\(\theta\)`, "rotation angle, counterclockwise, drawn again on every access"], [String.raw`\(t_x, t_y\)`, "shift in whole pixels, RandomAffine rounds the draw"], ["W", "image width, 28 for MNIST"], ["bilinear", "interpolation that blends the four nearest pixels"], ["fill=0", "black background for the pixels that rotate in"]],
how: ["Write down why each transform keeps the label before you add it.", "Put random transforms only in the training transform.", "Look at one image and several augmented versions side by side, as HW8 1D does.", "Keep the epoch budget fixed and compare with and without augmentation on the same validation view.", "Drop a transform that crops strokes or turns one class into another."],
say: String.raw`Augmentation applies a fresh random transform each time a training example is read, which adds variation but no new independent examples, and it is valid only for transforms that leave the true label unchanged.`,
num: String.raw`HW8 settings on a 28 pixel image: angle uniform in ±30°, shift uniform in ±2.8 pixels and rounded, so whole shifts from −3 to 3 with probability <b>0.054</b> for ±3 and 0.179 for each of the others. Two calls of the training transform on the same image gave different tensors, pixel sums 63.81 and 64.00. The dataset still has <b>1,437</b> items per epoch.`,
r(fig, ctl) {
  const N = 28;
  const raster = pts => { const a = []; for (let r = 0; r < N; r++) { a.push([]); for (let c = 0; c < N; c++) { const px = c + 0.5, py = r + 0.5; let d = 99; for (let k = 0; k + 1 < pts.length; k++) { const [x1, y1] = pts[k], [x2, y2] = pts[k + 1], vx = x2 - x1, vy = y2 - y1, L2 = vx * vx + vy * vy; let t = L2 ? ((px - x1) * vx + (py - y1) * vy) / L2 : 0; t = Math.max(0, Math.min(1, t)); d = Math.min(d, Math.hypot(px - x1 - t * vx, py - y1 - t * vy)); } a[r].push(Math.max(0, Math.min(1, 1.9 - d))); } } return a; };
  const ring6 = []; for (let k = 0; k <= 24; k++) { const an = Math.PI + k * 2 * Math.PI / 24; ring6.push([14 + 5 * Math.cos(an), 18.5 + 5 * Math.sin(an)]); }
  const G = { 7: raster([[8, 7], [20, 7], [12.5, 22.5]]), 6: raster([[18, 4.5], [13.5, 7.5], [10.2, 12.5], [9, 18.5]].concat(ring6)) };
  const P3 = [0.0536, 0.1786, 0.1786, 0.1786, 0.1786, 0.1786, 0.0536];
  let gl = 7, flip = 0;
  ctl.innerHTML = btns([[7, "digit 7"], [6, "digit 6"]], "k8g") + sl("k8a", "rotation angle (degrees)", -180, 180, 1, 0) + sl("k8x", "shift right (pixels)", -3, 3, 1, 0) + sl("k8y", "shift down (pixels)", -3, 3, 1, 0) + btns([[0, "random HW8 draw"], [1, "flip left right"], [2, "rotate 180°"], [3, "reset"]], "k8b");
  const tf = (img, ang, sx, sy) => {
    const th = ang * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th), o = [];
    const at = (r, c) => (r < 0 || c < 0 || r >= N || c >= N) ? 0 : img[r][c];
    for (let r = 0; r < N; r++) { o.push([]); for (let c = 0; c < N; c++) {
      let x = c + 0.5 - sx, y = r + 0.5 - sy;
      if (flip) x = N - x;
      const dx = x - 14, dy = y - 14, xs = 14 + dx * cs - dy * sn - 0.5, ys = 14 + dx * sn + dy * cs - 0.5;
      const c0 = Math.floor(xs), r0 = Math.floor(ys), fx = xs - c0, fy = ys - r0;
      o[r].push(at(r0, c0) * (1 - fx) * (1 - fy) + at(r0, c0 + 1) * fx * (1 - fy) + at(r0 + 1, c0) * (1 - fx) * fy + at(r0 + 1, c0 + 1) * fx * fy);
    } }
    return o;
  };
  const draw = (img, x0, y0, cs) => { let s = `<rect x="${x0}" y="${y0}" width="${N * cs}" height="${N * cs}" fill="#000"/>`; img.forEach((row, r) => row.forEach((v, c) => { if (v > 0.02) s += `<rect x="${x0 + c * cs}" y="${y0 + r * cs}" width="${cs}" height="${cs}" fill="#fff" fill-opacity="${v.toFixed(2)}" shape-rendering="crispEdges"/>`; })); return s; };
  const u = () => {
    pick(ctl, "k8g", gl);
    const ang = +$("k8a").value, sx = +$("k8x").value, sy = +$("k8y").value;
    $("k8av").textContent = ang + "°"; $("k8xv").textContent = sx; $("k8yv").textContent = sy;
    const src = G[gl], out = tf(src, ang, sx, sy);
    const ink0 = src.flat().reduce((a, b) => a + b, 0), ink1 = out.flat().reduce((a, b) => a + b, 0), kept = ink1 / ink0;
    const inRange = Math.abs(ang) <= 30 && !flip;
    let verdict = inRange ? "inside HW8's range, the label still reads " + gl : "outside HW8's range, look before you trust the label";
    if (flip) verdict = gl === 7 ? "a mirrored 7 is not a digit, the label is no longer typical" : "a mirrored 6 is not a digit anyone writes";
    else if (Math.abs(ang) >= 150) verdict = gl === 6 ? "this reads as a 9, but the label still says 6" : "an upside down 7 reads as no digit at all";
    if (kept < 0.95) verdict += ", and strokes are cut at the border";
    let s = tx(30, 20, "stored image, label " + gl, null, "th") + tx(262, 20, "what the model sees this epoch", null, "th");
    s += draw(src, 30, 30, 7) + draw(out, 262, 30, 7);
    s += tx(30, 250, "angle " + ang + "°, shift (" + sx + ", " + sy + ")" + (flip ? ", mirrored" : "") + ", ink kept " + (100 * kept).toFixed(1) + "%", null, "t");
    s += tx(30, 274, verdict, null, "th");
    const a = ML.axes(512, 40, 150, 120, { xmin: -3.5, xmax: 3.5, ymin: 0, ymax: 0.2, nx: 1, ny: 2, fx: () => "", fy: v => v.toFixed(1), grid: false });
    for (let k = -3; k <= 3; k++) s += tx(a.X(k), 176, k, "middle");
    s += tx(500, 20, "shift probabilities", null, "th") + a.s;
    P3.forEach((p, k) => s += `<rect x="${a.X(k - 3 - 0.35)}" y="${a.Y(p)}" width="${a.X(0.35) - a.X(-0.35)}" height="${a.Y(0) - a.Y(p)}" fill="${k - 3 === sx ? C.coral : "var(--blue-bg)"}" stroke="${k - 3 === sx ? C.coral : C.blue}" stroke-width="0.8"/>`);
    s += tx(587, 196, "shift in pixels", "middle");
    fig.innerHTML = svg(290, s) + ML.code(["BIL = InterpolationMode.BILINEAR", "train_tf = transforms.Compose([", "    transforms.ToTensor(),", "    transforms.RandomRotation(degrees=30, interpolation=BIL, fill=0),", "    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1),", "                            interpolation=BIL, fill=0)])", "eval_tf = transforms.Compose([transforms.ToTensor()])"], -1);
  };
  bind(ctl, "k8g", i => { gl = i; u(); });
  bind(ctl, "k8b", i => {
    if (i === 0) { flip = 0; $("k8a").value = Math.round(-30 + 60 * Math.random()); $("k8x").value = Math.round(-2.8 + 5.6 * Math.random()); $("k8y").value = Math.round(-2.8 + 5.6 * Math.random()); }
    if (i === 1) flip = 1 - flip;
    if (i === 2) { flip = 0; $("k8a").value = 180; $("k8x").value = 0; $("k8y").value = 0; }
    if (i === 3) { flip = 0; $("k8a").value = 0; $("k8x").value = 0; $("k8y").value = 0; }
    u();
  });
  ["k8a", "k8x", "k8y"].forEach(i => $(i).oninput = u); u();
}},

{s: "9. Separate views for training and evaluation", t: "A Subset shares its dataset, so changing one split's transform changes both",
intu: String.raw`The obvious way to give validation a plain transform fails silently. <code>random_split</code> returns two Subsets that point at the same dataset object, so setting <code>val_ds.dataset.transform = eval_tf</code> changes the transform of the training split too, and training quietly loses its augmentation. HW8 avoids this with <code>TransformView</code>: a raw pool with no transform, and one small view per split that holds its own index list and its own transform. Both views read the same stored images, neither can change the other. Step through the trap and the fix. The two transforms are stand-ins that only report their names, so the printout shows which one ran.`,
eq: String.raw`\[ \texttt{train\_ds.dataset} \texttt{ is } \texttt{val\_ds.dataset} \;\Rightarrow\; \text{one shared transform} \]\[ \text{view}_s[k] = T_s\big(\text{raw}[I_s[k]]\big), \quad I_{\text{train}} \cap I_{\text{val}} = \varnothing \]`,
sym: [["Subset", "a dataset reference plus a list of indices"], ["TransformView", "HW8's wrapper, raw pool, indices and its own transform"], [String.raw`\(I_s\)`, "the index list of split s"], [String.raw`\(T_s\)`, "the transform of split s"], ["raw pool", "the dataset with no transform, shared safely because nothing changes it"]],
how: ["Load the stored data once with no transform.", "Split the indices, stratified for classification.", "Build one view per split with its own transform.", "Assert that the index sets are disjoint.", "Check that two passes over the validation loader give identical tensors."],
say: String.raw`Subsets from random split share one dataset object, so a transform set through one of them applies to both, which is why each split should be a separate view over an untransformed raw pool with its own transform.`,
num: String.raw`With seed 0, <code>random_split</code> of ten items gives training indices [4, 1, 7, 5, 3, 9, 0, 8] and validation [6, 2]. After the assignment <code>train_ds.dataset is val_ds.dataset</code> prints <b>True</b> and <code>train_ds[0]</code> returns <b>('plain(4)', 0)</b>, the augmentation is gone. With two TransformViews the training item is ('aug(4)', 0) and the validation item ('plain(6)', 0).`,
r(fig, ctl) {
  const code = ["train_tf = lambda x: f'aug({x})'     # stands for rotation and shift", "eval_tf = lambda x: f'plain({x})'    # stands for ToTensor only", "full = Digits(transform=train_tf)", "train_ds, val_ds = random_split(full, [8, 2], generator=g)", "val_ds.dataset.transform = eval_tf", "print(train_ds.dataset is val_ds.dataset)", "print(train_ds[0], val_ds[0])", "raw = Digits()                       # no transform", "train_ds = TransformView(raw, train_ds.indices, train_tf)", "val_ds = TransformView(raw, val_ds.indices, eval_tf)", "print(train_ds[0], val_ds[0])"];
  const fA = ["A", "function", "aug(x)"], fP = ["P", "function", "plain(x)"];
  const T = [["train_tf", "A"], ["eval_tf", "P"]];
  const D1 = ["D", "Digits", "transform → aug"], D2 = ["D", "Digits", "transform → plain"];
  const S1 = ["S", "Subset", "dataset → full, [4, 1, 7, 5, 3, 9, 0, 8]"], S2 = ["V", "Subset", "dataset → full, [6, 2]"];
  const R = ["R", "Digits", "transform None"], W1 = ["W", "TransformView", "raw, 8 indices, aug"], W2 = ["X", "TransformView", "raw, 2 indices, plain"];
  const o1 = ["True", "('plain(4)', 0) ('plain(6)', 0)"];
  ML.memory(fig, ctl, { code, steps: [
    { ln: 1, vars: T, objs: [fA, fP], note: "Two stand-in transforms. The real ones are the Compose pipelines of card 8." },
    { ln: 2, vars: T.concat([["full", "D"]]), objs: [fA, fP, D1], note: "One dataset object with the training transform attached." },
    { ln: 3, vars: T.concat([["full", "D"], ["train_ds", "S"], ["val_ds", "V"]]), objs: [fA, fP, D1, S1, S2], note: "Both Subsets hold a reference to the same full dataset, plus their own index lists." },
    { ln: 4, vars: T.concat([["full", "D"], ["train_ds", "S"], ["val_ds", "V"]]), objs: [fA, fP, D2, S1, S2], note: "The assignment changes the one shared dataset. The training split now uses eval_tf as well." },
    { ln: 5, vars: T.concat([["full", "D"], ["train_ds", "S"], ["val_ds", "V"]]), objs: [fA, fP, D2, S1, S2], out: ["True"], note: "The same object, so there is only one transform." },
    { ln: 6, vars: T.concat([["full", "D"], ["train_ds", "S"], ["val_ds", "V"]]), objs: [fA, fP, D2, S1, S2], out: o1, note: "No error, no warning, and the training loader serves unaugmented images for the whole run." },
    { ln: 7, vars: T.concat([["raw", "R"], ["train_ds", "S"], ["val_ds", "V"]]), objs: [fA, fP, R, S1, S2], out: o1, note: "The fix starts from a raw pool with no transform." },
    { ln: 9, vars: T.concat([["raw", "R"], ["train_ds", "W"], ["val_ds", "X"]]), objs: [fA, fP, R, W1, W2], out: o1, note: "Each view holds the raw pool, its own indices and its own transform. Rebinding the names drops the old Subsets." },
    { ln: 10, vars: T.concat([["raw", "R"], ["train_ds", "W"], ["val_ds", "X"]]), objs: [fA, fP, R, W1, W2], out: o1.concat(["('aug(4)', 0) ('plain(6)', 0)"]), note: "Training augments, validation does not, and neither view can change the other." }
  ] });
}},

{s: "10. Datasets for real files", t: "Load eagerly when the data fit in memory, lazily when they do not",
intu: String.raw`HW10's <code>ArrayImages</code> keeps every image in memory as a uint8 array and converts one image at a time in <code>__getitem__</code>, which is the right design for MNIST and CIFAR-10. A dataset of large photos does not fit, so a lazy dataset stores only the file paths and labels in <code>__init__</code> and opens one file per <code>__getitem__</code> call. Then memory holds the batches in flight, not the dataset. Two habits matter in both designs. Store pixels as uint8, a quarter of the memory of float32, and convert per item. And build the label list once, with a fixed mapping from class name to index, sorted so it is the same on every machine. Pick a dataset and compare the memory of the three choices.`,
eq: String.raw`\[ M_{\text{eager}} = N \cdot H \cdot W \cdot C \cdot b, \qquad b = 1 \text{ for uint8}, \ 4 \text{ for float32} \]\[ M_{\text{lazy}} \approx (\text{batches in flight}) \cdot B \cdot H \cdot W \cdot C \cdot 4 \]`,
sym: [["N", "number of stored images"], ["H, W, C", "height, width and channels"], ["b", "bytes per value"], ["eager", "everything loaded in the constructor"], ["lazy", "paths in the constructor, one file opened per item"]],
how: ["Estimate N · H · W · C bytes before you write the dataset.", "Keep uint8 storage and convert in the transform.", "Store paths and integer labels when the data do not fit.", "Build <code>class_to_idx</code> from the sorted class names once.", "Time <code>ds[0]</code> and one batch, then decide on workers."],
say: String.raw`An eager dataset loads every example in its constructor and fits only when N times H times W times C bytes fit in memory, while a lazy dataset stores paths and reads one file per item, so its memory is the batches in flight.`,
num: String.raw`MNIST, 60,000 images of 28 × 28: <b>47.0 MB</b> as uint8 and 188.2 MB as float32. CIFAR-10, 50,000 of 32 × 32 × 3: 153.6 MB and <b>614.4 MB</b>. ImageNet at 224 × 224 × 3, 1,281,167 images: about <b>193 GB</b> as uint8, so it must be lazy, while one float32 batch of 64 is 38.5 MB.`,
r(fig, ctl) {
  const P = [["MNIST", 60000, 28, 1], ["CIFAR-10", 50000, 32, 3], ["ImageNet at 224", 1281167, 224, 3]];
  let ram = 16;
  ctl.innerHTML = btns(P.map((q, i) => [i, q[0]]), "k10") + sl("k10n", "images N (thousands)", 1, 1300, 1, 60) + sl("k10h", "side H = W (pixels)", 8, 512, 4, 28) + btns([[1, "C = 1"], [3, "C = 3"]], "k10c") + sl("k10b", "batch size B", 8, 512, 8, 64) + sl("k10r", "your RAM (GB)", 4, 64, 4, 16);
  let Cn = 1, preset = 0, Nx = 60000;
  const fmtB = b => b >= 1e9 ? (b / 1e9).toFixed(1) + " GB" : b >= 1e6 ? (b / 1e6).toFixed(1) + " MB" : (b / 1e3).toFixed(1) + " kB";
  const u = () => {
    pick(ctl, "k10", preset); pick(ctl, "k10c", Cn);
    const H = +$("k10h").value, B = +$("k10b").value; ram = +$("k10r").value;
    const N = preset >= 0 ? Nx : +$("k10n").value * 1000;
    $("k10nv").textContent = n0(N); $("k10hv").textContent = H; $("k10bv").textContent = B; $("k10rv").textContent = ram;
    const px = H * H * Cn, M = [["eager, uint8 storage", N * px], ["eager, float32 storage", N * px * 4], ["lazy, 2 batches in flight", 2 * B * px * 4]];
    const a = ML.axes(200, 30, 440, 150, { xmin: 4, xmax: 13, ymin: 0, ymax: 3, nx: 9, ny: 3, grid: true, xl: "bytes, log scale", fx: v => ["", "", "10 kB", "100 kB", "1 MB", "10 MB", "100 MB", "1 GB", "10 GB", "100 GB", "1 TB"][Math.round(v) - 2] || "", fy: () => "" });
    let s = a.s;
    M.forEach(([t, b], i) => { const y = 40 + i * 50, lg = Math.max(4, Math.min(13, Math.log10(Math.max(b, 1)))); const over = b > ram * 1e9; s += `<rect x="200" y="${y}" width="${a.X(lg) - 200}" height="30" fill="${over ? "var(--coral-bg)" : "var(--teal-bg)"}" stroke="${over ? C.coral : C.teal}"/>` + tx(190, y + 20, t, "end", "t") + tx(Math.min(a.X(lg) + 6, 600), y + 20, fmtB(b), null, "th"); });
    const xr = a.X(Math.log10(ram * 1e9)); s += `<line x1="${xr}" y1="30" x2="${xr}" y2="180" stroke="${C.coral}" stroke-width="2" stroke-dasharray="5 4"/>` + tx(xr, 24, "RAM " + ram + " GB", "middle", "t");
    s += tx(30, 230, preset >= 0 ? P[preset][0] + ": " + n0(N) + " images of " + H + " × " + H + " × " + Cn : "your dataset: " + n0(N) + " images of " + H + " × " + H + " × " + Cn, null, "th");
    s += tx(30, 254, M[0][1] > ram * 1e9 ? "too large to load eagerly, store paths and load lazily" : M[1][1] > ram * 1e9 ? "fits only as uint8, convert per item in the transform" : "fits in memory, an eager dataset like ArrayImages is fine", null, "t");
    fig.innerHTML = svg(266, s) + ML.code(["class FileImages(Dataset):                  # lazy", "    def __init__(self, paths, labels, transform):", "        self.paths, self.labels, self.transform = paths, labels, transform", "    def __len__(self):", "        return len(self.paths)", "    def __getitem__(self, i):", "        img = Image.open(self.paths[i]).convert('RGB')   # one file per call", "        return self.transform(img), self.labels[i]"], 6);
  };
  bind(ctl, "k10", i => { preset = i; const q = P[i]; Nx = q[1]; $("k10n").value = Math.round(q[1] / 1000); $("k10h").value = q[2]; Cn = q[3]; u(); });
  bind(ctl, "k10c", i => { Cn = i; preset = -1; u(); });
  $("k10n").oninput = () => { preset = -1; u(); }; $("k10h").oninput = () => { preset = -1; u(); }; $("k10b").oninput = u; $("k10r").oninput = u; u();
}},

{s: "11. Workers: loading while the model trains", t: "num_workers processes prepare the next batches in parallel with the training step",
intu: String.raw`Ng describes how large image models are trained in practice: CPU threads load and distort images and pass mini-batches to the training process, which runs at the same time. <code>num_workers=k</code> does this with k worker processes, each building whole batches and keeping a few ready ahead. With k = 0, as in the homework, the main process loads a batch, then trains on it, then loads the next, which is simple and exactly reproducible but leaves the model waiting. With enough workers the epoch time is set by the slower of the two jobs. The picture uses a simple timing model with a load time L per batch, a training step T and two batches prefetched per worker. Each worker seeds its own random generators from a base seed, so seeded runs stay repeatable.`,
eq: String.raw`\[ t_{0} = K (L + T) \]\[ t_{k} \approx L + K \max\!\left(T, \frac{L}{k}\right) \]`,
sym: [["L", "time to load and transform one batch"], ["T", "time of one training step"], ["k", "<code>num_workers</code>, the number of worker processes"], ["K", "batches per epoch, 100 here"], [String.raw`\(\texttt{pin\_memory}\)`, "page-locked batches for faster copies to a GPU, Lesson 26"]],
how: ["Start with <code>num_workers=0</code> until the pipeline is correct.", "Time one epoch, then try 2, 4 and 8 workers.", "Stop adding workers once the step time T dominates.", "On Windows and macOS put the training code under <code>if __name__ == '__main__':</code>.", "Define Dataset classes in a .py file, not only in a notebook, when workers are used."],
say: String.raw`With zero workers loading and training alternate, so an epoch costs K times L plus T, while k workers prepare batches in parallel and the epoch approaches L plus K times the larger of T and L over k.`,
num: String.raw`L = 40 ms, T = 10 ms, K = 100 batches: <b>5.0 s</b> with no workers, 4.01 s with one, 2.02 s with two and <b>1.04 s</b> with four, after which more workers do not help because T = 10 ms is now the limit.`,
r(fig, ctl) {
  ctl.innerHTML = sl("k11l", "load time L per batch (ms)", 5, 100, 5, 40) + sl("k11t", "training step T (ms)", 2, 60, 2, 10) + sl("k11k", "num_workers k", 0, 8, 1, 0);
  const sim = (K, L, T, k, pf) => {
    const ld = [], st = [], en = [];
    if (k === 0) { let t = 0; for (let b = 0; b < K; b++) { ld.push([0, t, t + L]); st.push(t + L); en.push(t + L + T); t += L + T; } return { ld, st, en, tot: K * (L + T) }; }
    const wf = Array(k).fill(0);
    for (let b = 0; b < K; b++) { const w = b % k, gate = b - pf * k >= 0 ? st[b - pf * k] : 0, s0 = Math.max(wf[w], gate); wf[w] = s0 + L; ld.push([w, s0, s0 + L]); st.push(Math.max(s0 + L, b ? en[b - 1] : 0)); en.push(st[b] + T); }
    return { ld, st, en, tot: en[K - 1] };
  };
  const u = () => {
    const L = +$("k11l").value, T = +$("k11t").value, k = +$("k11k").value; $("k11lv").textContent = L; $("k11tv").textContent = T; $("k11kv").textContent = k;
    const R = sim(100, L, T, k, 2), show = 12, tmax = R.en[show - 1] * 1.02, rows = Math.max(k, 1);
    const X = t => 120 + t / tmax * 530;
    let s = "";
    for (let w = 0; w < rows; w++) s += tx(110, 38 + w * 22 + 14, k ? "worker " + (w + 1) : "main loads", "end", "t");
    const ym = 38 + rows * 22 + 10;
    s += tx(110, ym + 14, "main trains", "end", "t");
    for (let b = 0; b < show; b++) {
      const [w, a, e] = R.ld[b];
      s += `<rect x="${X(a)}" y="${38 + w * 22}" width="${Math.max(1, X(e) - X(a) - 1)}" height="18" rx="3" fill="var(--blue-bg)" stroke="${C.blue}" stroke-width="0.8"/>` + (X(e) - X(a) > 18 ? tx((X(a) + X(e)) / 2, 38 + w * 22 + 13, b + 1, "middle", "t") : "");
      s += `<rect x="${X(R.st[b])}" y="${ym}" width="${Math.max(1, X(R.en[b]) - X(R.st[b]) - 1)}" height="18" rx="3" fill="var(--teal-bg)" stroke="${C.teal}" stroke-width="0.8"/>`;
    }
    s += `<line x1="120" y1="${ym + 30}" x2="650" y2="${ym + 30}" stroke="var(--line)"/>` + tx(120, ym + 46, "0 ms", null, "t") + tx(650, ym + 46, Math.round(tmax) + " ms, first 12 of 100 batches", "end", "t");
    const busy = 100 * 100 * T / R.tot;
    s += tx(30, ym + 78, "epoch of 100 batches: " + (R.tot / 1000).toFixed(2) + " s, the training step is busy " + busy.toFixed(0) + "% of the time", null, "th");
    s += tx(30, ym + 102, k === 0 ? "no workers: the model waits for every batch" : L / k > T ? "loading is still the bottleneck, more workers would help" : "training is the bottleneck, more workers would not help", null, "t");
    fig.innerHTML = svg(ym + 116, s) + ML.code([`loader = DataLoader(train_view, batch_size=64, shuffle=True, generator=g,`, `                    num_workers=${k}${k ? ", persistent_workers=True" : ""})`], -1);
  };
  ["k11l", "k11t", "k11k"].forEach(i => $(i).oninput = u); u();
}},

{s: "12. Data bugs, silent and loud", t: "Most pipeline bugs give a number, not an error",
intu: String.raw`A broken model usually fails loudly. A broken data pipeline usually trains, prints a loss and reports a score, which is why HW6, HW8 and HW10 surround every loader with checks. Nine common bugs are collected here. Each one comes with the code that causes it, what PyTorch prints, the number it produces on this lesson's data, and the fix. The silent ones are the dangerous ones: a flat target, a shuffled validation loader compared with stored labels, a dropped last batch, augmentation in validation, statistics from all rows and a single batch reused for training. The loud ones at least stop the run, but only on the batch that triggers them.`,
eq: String.raw`\[ \text{check: } \ \texttt{len}, \ \texttt{ds[0]}, \ \texttt{xb.shape}, \ \texttt{xb.dtype}, \ \min, \max, \ \text{class counts} \]`,
sym: [["silent", "runs to the end with a wrong number"], ["loud", "raises an error, sometimes only on a rare batch"], ["leakage", "information from validation or test rows used for training choices"], ["contract check", "an assert on shape, dtype, range or count"], ["paired order", "predictions and labels taken from the same batch"]],
how: ["Assert <code>pred.shape == yb.shape</code> in the loss function.", "Collect predictions and labels from the same loop.", "Keep <code>shuffle=False</code> and <code>drop_last=False</code> for evaluation.", "Fit every statistic on the training split only.", "Look at a batch of images and its labels before training."],
say: String.raw`Data bugs mostly run without errors, so a pipeline needs explicit checks of length, item and batch shapes, dtypes, value ranges, class counts and paired order before its numbers can be trusted.`,
num: String.raw`On this lesson's data: the flat target turns MSE <b>0.0083</b> into 0.9150, a perfect classifier scored against a shuffled validation loader gets accuracy <b>0.1060</b> instead of 1.0, and dropping the last 13 of 45 validation samples turns an MSE of <b>2.6</b> into 0.0.`,
r(fig, ctl) {
  const B = [
    ["flat target", 0, ["ds = TensorDataset(X, y.reshape(-1))      # y is (N,)", "loss = nn.MSELoss()(model(xb), yb)        # (B, 1) against (B,)"], ["UserWarning: Using a target size (torch.Size([10])) that is different to the", "input size (torch.Size([10, 1])). This will likely lead to incorrect results ...", "loss 0.9150      # the correct value is 0.0083"], "Store y as (N, 1) and assert pred.shape == yb.shape."],
    ["shuffled validation", 0, ["val_loader = DataLoader(val_ds, batch_size=64, shuffle=True, generator=g)", "preds = torch.cat([model(xb).argmax(1) for xb, _ in val_loader])", "acc = (preds == val_ds.tensors[1]).float().mean()   # labels in stored order"], ["tensor(0.1060)     # a perfect model, 10 balanced classes, 500 samples"], "Use shuffle=False and collect yb inside the same loop as the predictions."],
    ["drop_last in evaluation", 0, ["val_loader = DataLoader(val_ds, batch_size=32, drop_last=True)", "print(evaluate_mse(zero_model, val_loader))     # 45 samples, 13 with target 3"], ["0.0      # 32 samples scored, the correct value over 45 is 2.6"], "drop_last=False for every evaluation loader, HW6 keeps partial batches."],
    ["augmentation in validation", 0, ["val_view = TransformView(raw, val_idx, train_tf)    # the wrong transform", "v1, v2 = next(iter(val_loader)), next(iter(val_loader))", "assert torch.equal(v1[0], v2[0])                   # HW8's check"], ["AssertionError"], "Validation uses eval_tf, deterministic, so two passes give identical tensors."],
    ["statistics from all rows", 0, ["mean, std = X_all.mean(0), X_all.std(0)          # before the split", "X_tr, X_val = split((X_all - mean) / std)"], ["(no error, the validation score is slightly optimistic)"], "Split first, compute mean and std on the training rows, reuse them everywhere."],
    ["one batch reused", 0, ["for step in range(1000):", "    xb, yb = next(iter(train_loader))     # a new pass every time", "    ..."], ["shuffle=False: [0, 1, 2, 3] [0, 1, 2, 3] [0, 1, 2, 3] ...", "shuffle=True:  the first batch of a new permutation every step"], "Loop with for xb, yb in train_loader inside a loop over epochs."],
    ["labels 1 to 10", 1, ["y = digit_labels + 1                      # classes 1 to 10", "loss = nn.CrossEntropyLoss()(logits, yb)  # logits (B, 10)"], ["IndexError: Target 10 is out of bounds."], "Class indices run from 0 to C − 1, map names to indices with a sorted list."],
    ["ToTensor on float pixels", 0, ["img = np.load('scan.npy').astype(np.float32)   # values 0 to 255", "x = transforms.ToTensor()(img)", "print(x.max())"], ["tensor(255.)     # not scaled, ToTensor divides only uint8"], "Keep uint8, or divide by 255 yourself, and assert 0 ≤ x ≤ 1."],
    ["features as a list", 1, ["def __getitem__(self, i):", "    return [self.area[i], self.age[i]], self.price[i]     # Python floats"], ["[[tensor([...], dtype=torch.float64), tensor([...], dtype=torch.float64)], ...]", "RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float"], "Return torch.tensor([area, age], dtype=torch.float32)."]
  ];
  let v = 0;
  ctl.innerHTML = btns(B.map((q, i) => [i, q[0]]), "k12");
  const u = () => {
    pick(ctl, "k12", v); const [name, loud, code, out, fix] = B[v];
    let s = "";
    B.forEach((q, i) => { const x = 20 + (i % 3) * 216, y = 14 + Math.floor(i / 3) * 46; s += `<g class="${i === v ? (q[1] ? "c-coral" : "c-purple") : "c-gray"}"><rect x="${x}" y="${y}" width="206" height="38" rx="7" stroke-width="${i === v ? 1.6 : 0.6}"/></g>` + tx(x + 103, y + 17, q[0], "middle", "t") + tx(x + 103, y + 31, q[1] ? "loud, raises an error" : "silent, a wrong number", "middle", "ts"); });
    s += tx(20, 172, name + ": " + (loud ? "raises an error" : "runs and returns a wrong number"), null, "th");
    fig.innerHTML = svg(184, s) + ML.code(code, -1) + ML.term(out) + `<p class="note"><b>Fix.</b> ${fix}</p>`;
  };
  bind(ctl, "k12", i => { v = i; u(); }); u();
}},

{s: "13. With the agent", t: "Do it with the agent: a data.py with tests that pin the pipeline's contract",
intu: String.raw`The lesson as project code: a <code>data.py</code> that splits with stratification, wraps one raw pool in a training view and an evaluation view, computes normalization statistics from the training split, and builds the loaders, plus tests for every contract on the cards. The tests are the point. They check disjoint and stratified splits, that the two views really have different transforms, that evaluation is deterministic, that a seed reproduces the batch order, the shapes, dtypes and pixel range of a batch, that partial batches count, and that the statistics ignore validation images. With those in place, a new dataset in your project only needs a new raw pool.`,
eq: String.raw`\[ \texttt{data.py} \to \texttt{make\_splits}, \ \texttt{TransformView}, \ \texttt{make\_loaders} \to \texttt{pytest} \]`,
sym: [[String.raw`\(\texttt{make\_splits}\)`, "stratified, seeded, disjoint index arrays"], ["TransformView", "one split, its indices and its own transform"], [String.raw`\(\texttt{train\_stats}\)`, "mean and std from the training images only"], [String.raw`\(\texttt{make\_loaders}\)`, "seeded shuffle for training, fixed order for evaluation"], ["contract tests", "this lesson's checks as pytest functions"]],
how: ["Paste the command.", "Read <code>make_splits</code>: stratify, seed, and an assert that the sets are disjoint.", "Read <code>make_loaders</code>: <code>shuffle=False</code> and <code>drop_last=False</code> for evaluation.", "Run pytest and compare the numbers with the cards.", "Swap the fake uint8 images for your project's raw pool."],
say: String.raw`A data module with stratified splits, separate views, training-only statistics and seeded loaders, pinned by tests for disjointness, transforms, determinism, reproducibility, shapes, dtypes, ranges and partial batches, makes every later experiment rest on a checked pipeline.`,
num: String.raw`The split test uses labels with classes of 60, 30 and 10 and expects validation counts <b>12, 6, 2</b>. The partial batch test feeds 45 targets, 13 of them 3, to a zero model with batches of 32 and expects <b>2.6</b>. The batch test expects images of shape (64, 1, 28, 28) float32 in [0, 1] and labels int64 in 0 to 9.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/data.py with torch, torchvision, numpy and scikit-learn. make_splits(labels, val_frac, test_frac, seed) returns stratified, disjoint train, val and test index arrays (train_test_split twice, stratify each time) and asserts they cover every index once. TransformView(raw, indices, transform) is a Dataset whose __getitem__ returns transform(image) and int(label) for raw[indices[k]]. train_stats(raw, train_idx) returns the per-channel mean and std of ToTensor images over the training indices only. make_loaders(raw, splits, train_tf, eval_tf, batch_size, seed, num_workers=0) returns three DataLoaders: training with shuffle=True and torch.Generator().manual_seed(seed), validation and test with shuffle=False and drop_last=False. Create tests/test_data.py with a fake raw pool of 100 uint8 images 28 by 28 and labels with classes of 60, 30 and 10: (1) the 20 percent validation split has class counts 12, 6, 2 and the three index sets are disjoint, (2) after building both views, the training view still uses train_tf and the validation view eval_tf, (3) two passes over the validation loader give identical tensors, (4) two training loaders with the same seed give the same first-epoch order and the second epoch differs from the first, (5) one batch has images (64, 1, 28, 28) float32 in [0, 1] and labels int64 in 0 to 9 when the transform is ToTensor, (6) a zero model on 45 targets, 13 of them 3, with batch size 32 gives an evaluation MSE of 2.6, (7) changing a validation image does not change train_stats. Run pytest and show me the output.",
    actions: ["$ pytest -q tests/test_data.py", ".......                                                  [100%]", "7 passed in 1.83s"],
    files: [["src/data.py", "make_splits, TransformView, train_stats, make_loaders"], ["tests/test_data.py", "splits, views, determinism, seeds, shapes, partial batches, statistics"]],
    checks: ["the raw pool has no transform, each view has its own", "evaluation loaders have shuffle=False and drop_last=False", "the training loader gets a seeded generator", "train_stats reads training indices only", "the split test expects 12, 6, 2 and checks disjointness", "the partial batch test expects 2.6, not 0.0"]
  });
}},

{s: "14. Test", t: "Lesson 25 test: data in PyTorch",
intu: String.raw`Twelve questions on the Dataset contract, TensorDataset shapes, collate, shuffling, splits, transforms, augmentation, views, evaluation loaders, memory and workers. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the shapes down before answering shape questions.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to pro PyTorch.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A training view holds 1,000 stored images and its transform rotates every image by a random angle. What does <code>len(train_view)</code> return after 5 epochs?", o: ["5,000", "1,000", "1,000 times the number of random transforms", "a different number every epoch"], a: 1, why: "Augmentation changes what an item looks like, not how many items there are. The loop reads 5,000 variants of the same 1,000 images. Card 8." },
    { q: "<code>ds = TensorDataset(X, y)</code> with X of shape (250, 3) and y of shape (250,). With batches of 50, what is the shape of <code>model(xb) - yb</code> when the model returns (50, 1)?", o: ["(50, 1)", "(50,)", "(50, 50)", "an error is raised"], a: 2, why: "yb has shape (50,), so (50, 1) minus (50,) broadcasts to a 50 by 50 table. Store y as (250, 1). Card 3." },
    { q: "<code>__getitem__</code> returns <code>(torch.tensor([0.2, 0.4]), 0.75)</code> with the target as a Python float. What dtype does the collated target batch have?", o: ["float64", "float32", "int64", "it stays a Python list"], a: 0, why: "default_collate turns Python floats into a float64 tensor. Return torch.tensor([0.75], dtype=torch.float32) instead. Card 4." },
    { q: "A loader over 23 samples uses <code>batch_size=5</code>, <code>shuffle=False</code> and the default <code>drop_last</code>. Which indices are in the last batch?", o: ["[18, 19, 20, 21, 22]", "[20, 21, 22]", "none, the last batch is dropped by default", "[20, 21, 22, 0, 1]"], a: 1, why: "Batches are [0 to 4], [5 to 9], [10 to 14], [15 to 19] and the remainder [20, 21, 22]. drop_last is False by default. Card 5 and Lesson 24." },
    { q: "200 samples include 8 of a rare class. A random split puts 50 of them in validation. About how likely is it that validation contains none of the rare class?", o: ["about 0.25", "about 0.0001", "about 0.5", "about 0.095"], a: 3, why: "C(192, 50) / C(200, 50) = 0.0954. A stratified split would put exactly 2 there. Card 6." },
    { q: "A uint8 pixel of value 51 goes through <code>ToTensor()</code> and then <code>Normalize((0.5,), (0.5,))</code>. What value comes out?", o: ["−0.6", "0.2", "−0.3", "0.6"], a: 0, why: "51 / 255 = 0.2, then (0.2 − 0.5) / 0.5 = −0.6. Card 7." },
    { q: "A perfect classifier is scored on 500 validation images of 10 balanced classes. The predictions come from a loader with <code>shuffle=True</code> and are compared with the labels in stored order. What accuracy is printed?", o: ["100%", "about 10%", "about 50%", "0%"], a: 1, why: "The predictions are in a random order, so they match the stored labels only by chance, about 1 in 10. Card 12." },
    { q: "<code>RandomAffine(degrees=0, translate=(0.1, 0.1))</code> is applied to 32 by 32 images. What is the largest horizontal shift it can produce?", o: ["3.2 pixels", "4 pixels", "3 pixels", "10% of the pixels"], a: 2, why: "The shift is drawn uniformly in ±3.2 and rounded to a whole number, so it lies between −3 and 3. Card 8." },
    { q: "After <code>train_ds, val_ds = random_split(full, [800, 200])</code> the code runs <code>val_ds.dataset.transform = eval_tf</code>. Which transform does the training split use now?", o: ["eval_tf, the augmentation is gone", "train_tf, unchanged", "both, one after the other", "none, an error is raised"], a: 0, why: "Both Subsets reference the same full dataset, so there is only one transform attribute. Use separate views. Card 9." },
    { q: "A validation loader over 1,000 samples uses <code>batch_size=64</code> and <code>drop_last=True</code>. How many samples are scored?", o: ["1,000", "960", "936", "64"], a: 1, why: "15 full batches of 64 make 960. The last 40 samples are never scored. Card 12." },
    { q: "20,000 RGB images of 64 by 64 pixels are loaded eagerly and stored as float32. About how much memory do they take?", o: ["3.9 GB", "61.4 MB", "245.8 MB", "983.0 MB"], a: 3, why: "20,000 × 64 × 64 × 3 × 4 bytes = 983.04 MB. As uint8 it would be 245.8 MB. Card 10." },
    { q: "Loading a batch takes 30 ms and a training step 12 ms. With 3 workers, about how long does an epoch of 200 batches take?", o: ["about 2.0 s", "about 8.4 s", "about 2.4 s", "about 6.0 s"], a: 2, why: "L / k = 10 ms is below T = 12 ms, so training sets the pace: 30 ms + 200 × 12 ms = 2.43 s. Without workers it is 200 × 42 ms = 8.4 s. Card 11." }
  ], "Lesson 25 test");
}}
],
summary: String.raw`A map-style Dataset only needs a length and an item for each index, and TensorDataset gives one for tensors already in memory, row i of each tensor, so a target stored as N by 1 gives batches of B by 1 that match the prediction. The DataLoader asks a sampler for indices, a new permutation every epoch when shuffle is on, and default collate stacks the items, turning Python ints into int64 and Python floats into float64. Splits should keep every class, so classification uses a stratified split. ToTensor turns uint8 pixels into float32 values in [0, 1] with channels first, and Normalize uses statistics from the training images. Augmentation draws a new random transform on every access, adds variation but no new examples, and must keep the label true. Each split gets its own view over an untransformed raw pool, because Subsets share one dataset and one transform. Large data are loaded lazily, workers prepare batches while the model trains, and evaluation loaders keep a fixed order and every sample.`,
sheet: [[String.raw`\[ K = \lceil N / B \rceil, \quad \texttt{drop\_last}: \ \lfloor N / B \rfloor \]`, "batches per epoch"], [String.raw`\[ x \mapsto \frac{x}{255}, \quad (H, W, C) \to (C, H, W) \]`, "ToTensor on uint8"], [String.raw`\[ x_c \mapsto \frac{x_c - \mu_c}{\sigma_c} \]`, "Normalize with training statistics"], [String.raw`\[ P(\text{none}) = \binom{N - r}{n} \Big/ \binom{N}{n} \]`, "a rare class missing from a random split"], [String.raw`\[ n_c = n \, \frac{N_c}{N} \]`, "stratified split"], [String.raw`\[ |t_x| \le \text{round}(0.1 W) \]`, "RandomAffine whole-pixel shift"], [String.raw`\[ M = N H W C \, b \]`, "eager memory, b bytes per value"], [String.raw`\[ t_k \approx L + K \max(T, L / k) \]`, "epoch time with k workers"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW6 Problem 1.2 (make_loader with TensorDataset and DataLoader, a seeded generator, shapes (N, 1), drop_last=False, 7 training batches with a last of 18)", "AME 5970 HW8 Part 1 (DigitsPractice, make_image_transforms, TransformView, the stratified 1,437 and 360 split, the paired augmentation figure and its audit) with the HW8 solutions doc", "AME 5970 HW10 (balanced_split, ArrayImages, Normalize((0.5,), (0.5,)), the documented data-source fallback) with the HW10 solutions doc", "Andrew Ng, Deep Learning Specialization, course 2 week 1 (train, dev and test sets), course 2 week 2 (mini-batch gradient descent: shuffling and partitioning) and course 4 week 2 (data augmentation, distortions computed in parallel with training)", "Raschka, Liu and Mirjalili (2022), Machine Learning with PyTorch and Scikit-Learn, chapter 12 (Dataset, DataLoader, TensorDataset, shuffling and batching) and chapter 14 (data augmentation with torchvision)", "PyTorch documentation: Datasets and DataLoaders tutorial, torch.utils.data (Dataset, TensorDataset, Subset, random_split, DataLoader, default_collate, worker seeding), torchvision.transforms (ToTensor, Normalize, RandomRotation, RandomAffine)", "scikit-learn documentation: train_test_split with stratify"]
});
})();
