(function () {
/* ML shelf, Part 5, Lesson 26: Pro PyTorch. Follows the setup cells of HW6, HW8, HW9 and HW10 (DEVICE, seed_everything with the cudnn flags, torch.set_num_threads, seeded loader generators, the data-source fallback that prints every substitution), HW10's run_epoch (device taken from the parameters, loss.item() per batch) and collect_predictions (.cpu()), the checkpoint habits of HW6 1.4 and HW8 2C (copy.deepcopy of the state_dict, restore the best epoch), HW8's torch.random.fork_rng and the paired seeds of HW10 C3 and D3, with their solutions docs. Andrew Ng's Deep Learning Specialization is the spine: course 2 weeks 1 to 3 (an efficient, repeatable iteration loop, run many seeds before trusting a difference) and course 3 (orthogonalization, a single number to compare runs). The PyTorch documentation (CUDA semantics, Reproducibility, Saving and loading models, Automatic mixed precision, torch.profiler) and the CUDA notes of CS231n fill in the mechanics. The lesson data are fresh: 256 points of y = sin(1.5 x1) + 0.5 x2 plus N(0, 0.1²) from default_rng(2626), a 784 to 128 to 10 network on random batches for timing, and a million float32 draws. Every number was produced with PyTorch 2.15 and torchvision 0.29 on the 2-core CPU of this build. The GPU timeline on card 2 is a labeled model, and two CUDA error messages are quoted in PyTorch's wording because no GPU was available. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const fm = (v, d) => (+v).toFixed(d == null ? 2 : d).replace("-", "−");
const n0 = v => Math.round(v).toLocaleString("en-US");
const chip = (x, y, w, t, fill, stroke, sw) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw || 1}"/>` + `<text class="t" x="${x + w / 2}" y="${y + 16}" text-anchor="middle" style="font-family:var(--mono);font-size:12px">${t}</text>`;
const bind = (ctl, attr, f) => ctl.querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => f(+b.dataset[attr]));
const bytes = b => b >= 1e9 ? fm(b / 1e9, 2) + " GB" : b >= 1e6 ? fm(b / 1e6, 2) + " MB" : b >= 1e3 ? fm(b / 1e3, 1) + " kB" : Math.round(b) + " B";
/* float16 and bfloat16 rounding of a float32 value, round half to even, checked against torch on 20,011 values with no mismatch */
const RQ = (x, mant, emin, max) => {
  x = Math.fround(x); if (x === 0) return 0; const s = Math.sign(x), a = Math.abs(x);
  let e = Math.floor(Math.log2(a)); if (2 ** e > a) e--; if (2 ** (e + 1) <= a) e++;
  e = Math.max(e, emin); const step = 2 ** (e - mant), q = a / step, f = Math.floor(q);
  const r = q - f > 0.5 ? f + 1 : q - f < 0.5 ? f : (f % 2 === 0 ? f : f + 1);
  const v = r * step; return v > max ? s * Infinity : s * v;
};
const F16 = x => RQ(x, 10, -14, 65504), B16 = x => RQ(x, 7, -126, 3.3895313892515355e38);
/* validation MSE per epoch of the resume experiment (Adam lr 0.01, B = 32, 12 epochs, checkpoint after epoch 6) */
const STRAIGHT = [0.8329, 0.4044, 0.1977, 0.1449, 0.1511, 0.1419, 0.1218, 0.1132, 0.1116, 0.1072, 0.0992, 0.0965, 0.092];
const RESUME = [
  ["full checkpoint", [0.1132, 0.1116, 0.1072, 0.0992, 0.0965, 0.092], 0, 0.0169, 72, C.teal, "model, optimizer and loader generator restored, the curve continues exactly"],
  ["model only", [0.1079, 0.1127, 0.0922, 0.0817, 0.0786, 0.0725], 0.0195, 0.0806, 36, C.coral, "a new Adam starts at step 0 with zero moments, and the batch order restarts from epoch 1"],
  ["model and optimizer", [0.1115, 0.1121, 0.1083, 0.1012, 0.0936, 0.0906], 0.0028, 0.0204, 72, C.purple, "the update is right but the generator restarted, so epoch 7 repeats the batches of epoch 1"],
  ["model and generator", [0.1224, 0.1126, 0.0984, 0.0937, 0.0898, 0.0794], 0.0126, 0.0806, 36, C.blue, "the batches are right but Adam lost its moments and its step count"]
];

addLesson("ml", "torch", {
level: "Pro", num: "Lesson 26",
id: "ml-torch-l26", title: "Pro PyTorch", short: "26. Pro PyTorch",
big: String.raw`Lessons 21 to 25 built a training run that is correct. This lesson makes it portable, resumable, repeatable, fast enough and honest about what it measured. Portable means one line chooses the device and every tensor follows it. Resumable means a checkpoint holds everything the next epoch needs, not only the weights, and loads safely on another machine. Repeatable means you know which random choices a run makes, which seed controls each one, and how much the result moves when the seed moves. Fast enough means knowing where the time and the memory go, from the asynchronous GPU queue and the activation memory of a batch to half-precision numbers and the scaler that keeps their gradients alive. The homework setup cells already contain most of these habits in a few lines each, and the last cards collect the bugs that appear when one of them is missing.`,
bridge: String.raw`The examples follow the setup cells of HW6, HW8, HW9 and HW10 (<code>DEVICE</code>, <code>seed_everything</code> with the cuDNN flags, seeded loader generators, the documented data-source fallback), HW10's <code>run_epoch</code> and <code>collect_predictions</code>, the checkpoint habits of HW6 1.4 and HW8 2C and the paired seeds of HW10 C3 and D3, with their solutions docs. The spine is Ng's Deep Learning Specialization, course 2 (a fast and repeatable iteration loop) and course 3 (compare runs with one number and know its noise), with the PyTorch notes on CUDA semantics, reproducibility, serialization and mixed precision. The data on the cards are new. Lesson 27 hands much of this bookkeeping to PyTorch Lightning, so it pays to know what Lightning is doing for you.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. One device line", t: "Choose the device once, move the model once, move every batch inside the loop",
intu: String.raw`HW10 starts with <code>DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')</code> and never names a device again. The model moves once with <code>model.to(DEVICE)</code>, which moves every parameter and buffer in place and returns the same module. Each batch arrives from the DataLoader on the CPU and is copied with <code>x.to(DEVICE)</code>, which returns a <b>new</b> tensor, so the result must be assigned. Inside <code>run_epoch</code> the device is read from the model itself, <code>next(model.parameters()).device</code>, so the function works wherever the model lives. Results come back to the CPU with <code>.item()</code> for one number and <code>.cpu()</code> for a tensor, and only a CPU tensor can become a NumPy array. Step through one batch on a machine with a GPU, then switch to a CPU-only machine and watch the same code make no copies at all.`,
eq: String.raw`\[ \texttt{DEVICE} = \begin{cases} \texttt{cuda} & \text{if a GPU is available} \\ \texttt{cpu} & \text{otherwise} \end{cases} \]\[ \text{bytes moved per batch} = \text{numel} \times \text{bytes per element} \]`,
sym: [["DEVICE", "the one place the code names a device"], ["Module.to", "moves parameters and buffers in place, returns the same module"], ["Tensor.to", "returns a new tensor on the target device, or the same tensor if it is already there"], [".item()", "one number back to Python, a float or an int"], [".cpu()", "a copy of a tensor in host memory, needed before .numpy()"]],
how: ["Write the DEVICE line once at the top, with <code>mps</code> as a second choice on Apple machines if you use one.", "Call <code>model.to(DEVICE)</code> before you build the optimizer, as the PyTorch documentation asks.", "Move each batch with <code>x, y = x.to(DEVICE), y.to(DEVICE)</code>.", "Read the device from the model inside helper functions.", "Bring results back with <code>.item()</code> or <code>.cpu()</code> before NumPy or Matplotlib touch them."],
say: String.raw`One line chooses the device, the model is moved once and in place, every batch is copied to that device inside the loop because Tensor.to returns a new tensor, and results come back to the host with item or cpu before NumPy uses them.`,
num: String.raw`HW10's CNN has <b>56,714</b> parameters, 226,856 bytes in float32, moved once. Each MNIST batch of (64, 1, 28, 28) float32 is <b>200,704</b> bytes and its labels (64,) int64 are 512 bytes, copied every step. On a CPU-only machine <code>x.to('cpu') is x</code> prints <b>True</b>, no copy is made.`,
r(fig, ctl) {
  const code = ["DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')", "model = MNISTCNN().to(DEVICE)", "optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)", "for x, y in loader:", "    x, y = x.to(DEVICE), y.to(DEVICE)", "    logits = model(x)", "    loss = criterion(logits, y)", "    optimizer.zero_grad(); loss.backward(); optimizer.step()", "    total += loss.item() * len(y)", "preds = logits.argmax(1).cpu().numpy()"];
  const H = [
    [0, [["c", "DEVICE", "device(type='cuda')"]], "One decision, made once. Everything below reads DEVICE."],
    [1, [["c", "DEVICE", "device(type='cuda')"], ["g", "model parameters", "56,714 float32, 226,856 bytes"]], "Module.to moved every parameter to the GPU in place and returned the same module object."],
    [2, [["c", "DEVICE", "device(type='cuda')"], ["c", "optimizer", "references to the 10 parameter tensors"], ["g", "model parameters", "56,714 float32"]], "The optimizer holds references to the parameters, which already live on the GPU. Its Adam moments will be created there too."],
    [4, [["c", "x from the loader", "(64, 1, 28, 28) float32, 200,704 bytes"], ["c", "y from the loader", "(64,) int64, 512 bytes"], ["g", "model parameters", "56,714 float32"], ["g", "x", "a new copy on cuda:0"], ["g", "y", "a new copy on cuda:0"]], "Tensor.to returned new tensors. The names x and y now point to the GPU copies, and the CPU batch is freed when nothing refers to it."],
    [6, [["g", "model parameters", "56,714 float32"], ["g", "x, y", "the batch"], ["g", "logits", "(64, 10) float32"], ["g", "loss", "a 0-d tensor with grad_fn"]], "The forward pass and the loss run where their inputs are. Nothing has come back to the CPU yet."],
    [7, [["g", "model parameters", "updated in place"], ["g", ".grad", "56,714 more float32 numbers"], ["g", "Adam state", "2 × 56,714 float32"], ["g", "logits, loss", "kept until the next batch"]], "Gradients and optimizer state sit next to the parameters. Card 3 counts this memory."],
    [8, [["c", "total", "a Python float"], ["g", "loss", "a 0-d tensor"]], "loss.item() copies one number to the host. It has to wait until the GPU has finished computing it, card 2."],
    [9, [["c", "preds", "NumPy array (64,) int64"], ["g", "logits", "(64, 10) float32"]], "argmax runs on the GPU, .cpu() copies 64 integers to the host, and only then can .numpy() share them. Calling .numpy() on the GPU tensor raises a TypeError."]
  ];
  const Cc = H.map(([ln, objs, note]) => [ln, objs.map(o => ["c", o[1], o[2].replace("cuda:0", "cpu").replace("cuda", "cpu")]), note]);
  Cc[0][2] = "On a machine without a GPU the same line gives the CPU, and nothing else in the program changes.";
  Cc[3] = [4, [["c", "model parameters", "56,714 float32"], ["c", "x", "the same tensor, no copy"], ["c", "y", "the same tensor, no copy"]], "x.to('cpu') returns x itself when it is already there, so the line costs nothing."];
  Cc[6][2] = "loss.item() returns at once, there is no queue to wait for.";
  Cc[7][2] = ".cpu() on a CPU tensor returns the same tensor, and .numpy() shares its memory.";
  let v = 0;
  ctl.innerHTML = btns([[0, "machine with a GPU"], [1, "CPU only"]], "m1") + `<div id="m1st"></div>`;
  const run = () => {
    pick(ctl, "m1", v); const S = v ? Cc : H; $("m1st").innerHTML = "";
    ML.stepper($("m1st"), S.length, k => {
      const [ln, objs, note] = S[k];
      let s = `<g class="c-gray"><rect x="16" y="12" width="316" height="250" rx="10" stroke-width="0.7"/></g><g class="${v ? "c-gray" : "c-teal"}"><rect x="348" y="12" width="316" height="250" rx="10" stroke-width="0.7"/></g>`;
      s += tx(174, 34, "CPU memory (host)", "middle", "th") + tx(506, 34, v ? "no GPU on this machine" : "GPU memory (cuda:0)", "middle", "th");
      const col = { c: 0, g: 0 };
      objs.forEach(([where, name, desc]) => {
        const x = where === "c" ? 28 : 360, y = 48 + col[where] * 52; col[where]++;
        s += `<g class="${where === "c" ? "c-blue" : "c-purple"}"><rect x="${x}" y="${y}" width="292" height="44" rx="7" stroke-width="0.8"/></g>` + tx(x + 10, y + 18, name, null, "th") + `<text class="t" x="${x + 10}" y="${y + 36}" style="font-family:var(--mono);font-size:12px">${ML.esc(desc)}</text>`;
      });
      if (!v && ln === 4) s += arrow(322, 80, 356, 158, C.coral, 1.8) + tx(339, 132, "copy", "middle");
      if (!v && (ln === 8 || ln === 9)) s += arrow(356, 74, 322, 74, C.coral, 1.8);
      fig.innerHTML = svg(274, s) + ML.code(code, ln) + `<p class="note">${note}</p>`;
    }, S.map(q => "line " + (q[0] + 1)));
  };
  bind(ctl, "m1", i => { v = i; run(); }); run();
}},

{s: "2. The GPU works from a queue", t: "Python only queues GPU work, anything that needs a value on the host waits for the queue",
intu: String.raw`A CUDA operation called from Python is placed in a queue and the call returns at once, while the GPU works through the queue on its own. That is how the CPU can prepare step k + 1 while the GPU still computes step k. Some calls need a finished value on the host: <code>.item()</code>, <code>.cpu()</code>, <code>print(tensor)</code>, <code>.numpy()</code>, and a Python <code>if</code> on a tensor. Each of them is a synchronization point, the CPU stops until the queue has caught up. HW10's <code>run_epoch</code> calls <code>loss.item()</code> on every batch, which is simple and correct but stops the overlap every step. The same queue fools timers: a stopwatch around a GPU call without <code>torch.cuda.synchronize()</code> measures how long it took to queue the work, not to do it. The picture is a timing model with a CPU cost c and a GPU cost g per step.`,
eq: String.raw`\[ t_{\text{sync every } s} = \frac{K}{s} \max\big(s\,c + g,\; c + s\,g\big) \]\[ s = 1: \ t = K (c + g), \qquad s = K: \ t \approx \max(K c, K g) \]`,
sym: [["c", "CPU time per step to run the Python and queue the kernels"], ["g", "GPU time per step to execute them"], ["K", "steps per epoch, 100 here"], ["s", "steps between two synchronization points"], ["synchronize", "torch.cuda.synchronize() waits until every queued GPU operation has finished"]],
how: ["Accumulate the epoch loss on the device, <code>total += loss.detach() * len(y)</code>.", "Call <code>.item()</code> once per epoch, or every few hundred steps for logging.", "Avoid <code>print(loss)</code> and Python <code>if</code> on tensors inside the hot loop.", "Time GPU code with <code>torch.cuda.synchronize()</code> before both clock readings, after a few warm-up steps.", "Keep the HW10 version for small models on a CPU, where nothing is queued and the cost is zero."],
say: String.raw`GPU calls are queued and return immediately, so the CPU can run ahead, but item, cpu, printing and Python branches on tensors force the CPU to wait for the queue, which removes the overlap and also makes unsynchronized timers measure only the time to queue the work.`,
num: String.raw`Model with c = 2 ms, g = 6 ms and K = 100 steps: <b>800 ms</b> per epoch with <code>.item()</code> every step, 620 ms with one every 10 steps and <b>602 ms</b> with one per epoch. A stopwatch around one step reads <b>2 ms</b> without synchronize and 8 ms with it.`,
r(fig, ctl) {
  ctl.innerHTML = btns([[1, ".item() every step"], [10, "every 10 steps"], [100, "once per epoch"]], "m2s") + sl("m2c", "CPU cost c per step (ms)", 1, 10, 1, 2) + sl("m2g", "GPU cost g per step (ms)", 1, 12, 1, 6);
  let sv = 1;
  const u = () => {
    pick(ctl, "m2s", sv); const c = +$("m2c").value, g = +$("m2g").value; $("m2cv").textContent = c; $("m2gv").textContent = g;
    const K = 100, cpu = [], gpu = [], sync = [];
    let tc = 0, tg = 0;
    for (let k = 0; k < K; k++) {
      cpu.push([tc, tc + c]); const st = Math.max(tc + c, tg); gpu.push([st, st + g]); tg = st + g; tc += c;
      if ((k + 1) % sv === 0) { if (tg > tc) sync.push([tc, tg]); tc = Math.max(tc, tg); }
    }
    const tot = Math.max(tc, tg), show = 8, tmax = Math.max(gpu[show - 1][1], cpu[show - 1][1]) * 1.04;
    const X = t => 110 + t / tmax * 550;
    let s = tx(100, 48, "CPU", "end", "th") + tx(100, 96, "GPU", "end", "th");
    for (let k = 0; k < show; k++) {
      const [a, b] = cpu[k], [p, q] = gpu[k];
      s += `<rect x="${X(a)}" y="32" width="${Math.max(1, X(b) - X(a) - 1)}" height="24" rx="3" fill="var(--blue-bg)" stroke="${C.blue}" stroke-width="0.8"/>` + (X(b) - X(a) > 16 ? tx((X(a) + X(b)) / 2, 48, k + 1, "middle", "t") : "");
      s += `<rect x="${X(p)}" y="80" width="${Math.max(1, X(q) - X(p) - 1)}" height="24" rx="3" fill="var(--teal-bg)" stroke="${C.teal}" stroke-width="0.8"/>` + (X(q) - X(p) > 16 ? tx((X(p) + X(q)) / 2, 96, k + 1, "middle", "t") : "");
    }
    sync.filter(([a]) => a < tmax).forEach(([a, b]) => s += `<rect x="${X(a)}" y="32" width="${Math.max(1, X(Math.min(b, tmax)) - X(a))}" height="24" fill="none" stroke="${C.coral}" stroke-dasharray="3 3"/>`);
    s += tx(110, 128, "blue: Python queues step k, teal: the GPU runs it, red dashes: the CPU waits", null, "t");
    s += tx(30, 162, "epoch of 100 steps: " + n0(tot) + " ms", null, "th") + tx(260, 162, "item every step: " + n0(K * (c + g)) + " ms", null, "t") + tx(470, 162, "once per epoch: " + n0(Math.max(K * c + g, c + K * g)) + " ms", null, "t");
    s += tx(30, 190, "stopwatch around one step: " + c + " ms without synchronize, " + (c + g) + " ms with it", null, "t");
    s += tx(30, 214, g > c ? "the GPU is the bottleneck, the CPU can run ahead only if nothing forces it to wait" : "the CPU is the bottleneck, the GPU idles between steps whatever you do with item", null, "t");
    fig.innerHTML = svg(228, s) + ML.code(sv === 1 ? ["total = 0.0", "for x, y in loader:", "    ...", "    total += loss.item() * len(y)     # waits for the GPU"] : sv === 10 ? ["total = torch.zeros((), device=DEVICE)", "for step, (x, y) in enumerate(loader):", "    ...", "    total += loss.detach() * len(y)", "    if step % 10 == 9: print(total.item())   # a wait"] : ["total = torch.zeros((), device=DEVICE)", "for x, y in loader:", "    ...", "    total += loss.detach() * len(y)      # stays on the GPU", "epoch_loss = total.item() / len(loader.dataset)   # one wait"], -1);
  };
  bind(ctl, "m2s", i => { sv = i; u(); }); $("m2c").oninput = u; $("m2g").oninput = u; u();
}},

{s: "3. Where the memory goes", t: "Weights, gradients, optimizer state and saved activations, only the last grows with the batch",
intu: String.raw`A training step keeps four kinds of numbers in device memory. The weights, P numbers. The gradients, another P. The optimizer state, nothing for plain SGD, one buffer per parameter for momentum and two for Adam. And the activations that autograd saves during the forward pass because backward needs them, which grow in proportion to the batch size. The first three are fixed by the model, the last is what a batch-size change moves, which is why the usual fix for <code>CUDA out of memory</code> is a smaller batch. The activation sizes below were measured on this lesson's machine by recording every tensor autograd saved for backward in one forward pass. On top of these sit the CUDA context and the allocator's cache, a few hundred megabytes that the bars leave out.`,
eq: String.raw`\[ M \approx \underbrace{4P}_{\text{weights}} + \underbrace{4P}_{\text{gradients}} + \underbrace{s P}_{\text{optimizer}} + \underbrace{B\, a}_{\text{activations}} \]\[ s = 0 \ \text{(SGD)}, \quad 4 \ \text{(momentum)}, \quad 8 \ \text{(Adam)} \]`,
sym: [["P", "number of parameters"], ["s", "optimizer bytes per parameter in float32"], ["B", "batch size"], ["a", "bytes of saved activations per example, measured"], ["M", "device memory for one training step, without the CUDA context"]],
how: ["Count parameters with <code>sum(p.numel() for p in model.parameters())</code>.", "Multiply by 16 bytes for Adam in float32 to get the fixed part.", "Measure one batch with <code>torch.cuda.max_memory_allocated()</code> after a forward and backward pass.", "Halve the batch when you see out of memory, or use gradient accumulation (Lesson 22) to keep the effective batch.", "Wrap evaluation in <code>torch.no_grad()</code>, which saves no activations at all."],
say: String.raw`Training memory is four bytes per parameter for the weights, four for the gradients, zero, four or eight more for the optimizer, plus saved activations proportional to the batch size, so the batch is the knob that frees memory.`,
num: String.raw`Measured saved activations per example: HW9's MLP <b>552 bytes</b>, HW10's CNN 101,096 bytes, ResNet-18 at 224 by 224 <b>21.7 MB</b> and ResNet-50 85.7 MB. ResNet-50 with Adam needs 409 MB for its 25.6 million parameters and about <b>5.9 GB</b> at a batch of 64, and a 16 GB card fits at most 181 images. A 1 billion parameter model with Adam needs <b>16 GB</b> before a single activation.`,
r(fig, ctl) {
  const M = [["HW9 MLP", 101770, 552], ["HW10 CNN", 56714, 101096], ["ResNet-18, 224 px", 11689512, 21658528], ["ResNet-50, 224 px", 25557032, 85736352], ["1B parameters", 1e9, 0]];
  const OP = [["SGD", 0], ["SGD momentum", 4], ["Adam", 8]];
  let mi = 3, oi = 2;
  ctl.innerHTML = btns(M.map((m, i) => [i, m[0]]), "m3m") + btns(OP.map((o, i) => [i, o[0]]), "m3o") + sl("m3b", "batch size B = 2^k", 0, 10, 1, 6);
  const u = () => {
    pick(ctl, "m3m", mi); pick(ctl, "m3o", oi);
    const B = 2 ** +$("m3b").value; $("m3bv").textContent = B;
    const [name, P, a] = M[mi], s = OP[oi][1];
    const parts = [["weights", 4 * P, C.blue], ["gradients", 4 * P, C.teal], ["optimizer state", s * P, C.purple], ["activations", B * a, C.coral]];
    const tot = parts.reduce((t, p) => t + p[1], 0);
    const caps = [8e9, 16e9, 24e9, 80e9], top = Math.max(tot * 1.1, tot > 4e9 ? 18e9 : tot * 1.1);
    const X = v => 40 + v / top * 600;
    let s2 = tx(40, 26, name + ", " + OP[oi][0] + ", batch " + B, null, "th");
    let x0 = 0;
    parts.forEach(([lab, v, col]) => { if (v > 0) s2 += `<rect x="${X(x0)}" y="40" width="${Math.max(0.5, X(x0 + v) - X(x0))}" height="40" fill="${col}" opacity="0.75"/>`; x0 += v; });
    s2 += `<rect x="40" y="40" width="600" height="40" fill="none" stroke="var(--line)"/>`;
    caps.filter(cp => cp < top).forEach(cp => s2 += `<line x1="${X(cp)}" y1="32" x2="${X(cp)}" y2="88" stroke="var(--fg)" stroke-dasharray="4 3"/>` + tx(X(cp), 102, (cp / 1e9) + " GB card", "middle"));
    parts.forEach(([lab, v, col], i) => s2 += `<rect x="${40 + (i % 2) * 300}" y="${120 + Math.floor(i / 2) * 26}" width="14" height="14" fill="${col}" opacity="0.75"/>` + tx(62 + (i % 2) * 300, 132 + Math.floor(i / 2) * 26, lab + ": " + bytes(v), null, "t"));
    s2 += tx(40, 192, "total about " + bytes(tot) + (a ? ", activations are " + fm(100 * B * a / tot, 0) + "% of it" : ", activations not measured for this preset"), null, "th");
    const fixed = (8 + s) * P;
    s2 += tx(40, 216, a ? (fixed >= 16e9 ? "the fixed part alone does not fit on a 16 GB card" : "largest batch on a 16 GB card, ignoring the CUDA context: " + n0(Math.floor((16e9 - fixed) / a))) : "fixed part " + bytes(fixed) + (fixed >= 16e9 ? ", more than a 16 GB card holds" : ""), null, "t");
    fig.innerHTML = svg(230, s2) + ML.code(["P = sum(p.numel() for p in model.parameters())", "fixed = (4 + 4 + " + s + ") * P                  # weights, grads, " + OP[oi][0], "torch.cuda.reset_peak_memory_stats()", "loss = criterion(model(x), y); loss.backward()", "print(torch.cuda.max_memory_allocated() / 1e9, 'GB')"], -1);
  };
  bind(ctl, "m3m", i => { mi = i; u(); }); bind(ctl, "m3o", i => { oi = i; u(); }); $("m3b").oninput = u; u();
}},

{s: "4. A checkpoint you can resume from", t: "Weights are not enough, the optimizer state and the random state are part of the run",
intu: String.raw`HW6 and HW8 keep a <code>copy.deepcopy(model.state_dict())</code> of the best epoch, which is all you need to restore a model for testing. Resuming an interrupted training run needs more. Adam keeps two running averages per parameter and a step count, and a fresh optimizer starts them at zero, so its first update moves every weight by about the learning rate. The loader's generator decides the batch order of every future epoch, and a new generator seeded from scratch replays the order of epoch 1. A resumable checkpoint therefore stores the model, the optimizer, the epoch, the generator state and anything else that changes during training, such as a scheduler. This lesson's run trains for 12 epochs, and a copy is resumed after epoch 6 from four different checkpoints. Only the full one reproduces the uninterrupted curve.`,
eq: String.raw`\[ \text{run}(1 \ldots 12) \;=\; \text{run}(1 \ldots 6) \to \text{save} \to \text{load} \to \text{run}(7 \ldots 12) \]\[ \text{only if the saved state} = (\theta,\; m,\; v,\; t,\; \text{generator state},\; \text{epoch}) \]`,
sym: [[String.raw`\(\theta\)`, "model parameters and buffers, <code>model.state_dict()</code>"], ["m, v", "Adam's first and second moment buffers, one each per parameter"], ["t", "Adam's step count, used in its bias correction"], ["generator state", "<code>g.get_state()</code>, the position in the random stream that orders the batches"], ["epoch", "where the loop restarts"]],
how: ["Save a dict: <code>{'model': ..., 'optimizer': ..., 'epoch': ..., 'generator': g.get_state(), 'config': ...}</code>.", "Write it with <code>torch.save(ckpt, path)</code> at the end of an epoch.", "On resume, build the model and optimizer exactly as before, then load both state dicts.", "Restore the generator with <code>g.set_state(...)</code> before the loader is iterated.", "Test it once: an interrupted run must match an uninterrupted one."],
say: String.raw`A checkpoint for resuming stores the model state, the optimizer state with its moments and step count, the epoch and the random generator state, because without them the resumed run takes different steps on different batches.`,
num: String.raw`Resumed after epoch 6 of 12: the full checkpoint ends at validation MSE <b>0.0920</b>, identical to the uninterrupted run (largest difference <b>0</b>). Model only ends at 0.0725, model and optimizer at 0.0906, model and generator at 0.0794. A fresh Adam's first update moves the 65 weights by a norm of <b>0.0806</b> against 0.0169 for the true continuation.`,
r(fig, ctl) {
  let v = 0;
  ctl.innerHTML = btns(RESUME.map((r, i) => [i, r[0]]), "m4");
  const u = () => {
    pick(ctl, "m4", v); const [name, ys, md, fs, st, col, note] = RESUME[v];
    const a = ML.axes(70, 20, 300, 200, { xmin: 0, xmax: 12, ymin: 0, ymax: 0.9, nx: 6, ny: 3, xl: "epoch", yl: "validation MSE", fx: x => Math.round(x), fy: y => y.toFixed(1) });
    let s = a.s + `<line x1="${a.X(6)}" y1="20" x2="${a.X(6)}" y2="220" stroke="var(--fg)" stroke-dasharray="4 4"/>` + tx(a.X(6) + 4, 34, "save, then load");
    s += ML.path(STRAIGHT.map((y, i) => [a.X(i), a.Y(y)]), "var(--p)", 2) + STRAIGHT.map((y, i) => `<circle cx="${a.X(i)}" cy="${a.Y(y)}" r="2.5" fill="var(--p)"/>`).join("");
    s += ML.path([[a.X(6), a.Y(STRAIGHT[6])]].concat(ys.map((y, i) => [a.X(7 + i), a.Y(y)])), col, 2.5, v ? "5 3" : null) + ys.map((y, i) => `<circle cx="${a.X(7 + i)}" cy="${a.Y(y)}" r="3.5" fill="${col}"/>`).join("");
    const Z = ML.axes(450, 20, 200, 200, { xmin: 6, xmax: 12, ymin: 0.07, ymax: 0.125, nx: 3, ny: 1, xl: "epochs 6 to 12, zoomed", fx: x => Math.round(x), fy: y => y.toFixed(3) });
    s += Z.s + ML.path(STRAIGHT.slice(6).map((y, i) => [Z.X(6 + i), Z.Y(y)]), "var(--p)", 2) + STRAIGHT.slice(6).map((y, i) => `<circle cx="${Z.X(6 + i)}" cy="${Z.Y(y)}" r="2.5" fill="var(--p)"/>`).join("");
    s += ML.path([[Z.X(6), Z.Y(STRAIGHT[6])]].concat(ys.map((y, i) => [Z.X(7 + i), Z.Y(y)])), col, 2.5, v ? "5 3" : null) + ys.map((y, i) => `<circle cx="${Z.X(7 + i)}" cy="${Z.Y(y)}" r="3.5" fill="${col}"/>`).join("");
    s += tx(70, 276, "gray: the uninterrupted 12 epochs, colored: resumed from the " + name, null, "t");
    const cm = k => k ? "" : "# ";
    fig.innerHTML = svg(288, s) + ML.readout([["final validation MSE", fm(ys[5], 4)], ["uninterrupted", "0.0920"], ["largest difference", md ? fm(md, 4) : "0"], ["first update norm", fm(fs, 4)], ["Adam step count at the end", st]]) +
      ML.code(["ckpt = {'model': model.state_dict(), 'optimizer': optimizer.state_dict(),", "        'epoch': 6, 'generator': g.get_state()}", "torch.save(ckpt, 'last.pt')", "# a new process builds model, optimizer and g as before, then", "ckpt = torch.load('last.pt', map_location=DEVICE)", "model.load_state_dict(ckpt['model'])", cm(v === 0 || v === 2) + "optimizer.load_state_dict(ckpt['optimizer'])", cm(v === 0 || v === 3) + "g.set_state(ckpt['generator'])", "start_epoch = ckpt['epoch'] + 1"], -1) + `<p class="note">${note}.</p>`;
  };
  bind(ctl, "m4", i => { v = i; u(); }); u();
}},

{s: "5. Loading safely, anywhere", t: "Save the state_dict, load it with weights_only and map_location, and read the key lists when it fails",
intu: String.raw`<code>torch.save(model)</code> pickles the whole Python object, so loading it needs the same class definitions at the same import paths, and unpickling can run arbitrary code. Since PyTorch 2.6 <code>torch.load</code> defaults to <code>weights_only=True</code>, which accepts tensors, numbers, strings and containers but refuses pickled classes. Saving <code>model.state_dict()</code> avoids both problems: a dict of named tensors that any code able to build the model can load. Two more arguments make a checkpoint travel. <code>map_location</code> puts the tensors on the device you name, so a file written on a GPU loads on a laptop. And <code>strict=True</code>, the default, compares key names, so when loading fails the message lists the missing and unexpected keys, which almost always says exactly what went wrong. Choose a case and read both key lists.`,
eq: String.raw`\[ \text{load succeeds} \iff \text{keys}(\text{file}) = \text{keys}(\text{model}) \ \text{and every shape matches} \]`,
sym: [[String.raw`\(\texttt{state\_dict}\)`, "an ordered dict from names such as 0.weight to tensors"], [String.raw`\(\texttt{weights\_only}\)`, "True by default since PyTorch 2.6, refuses pickled Python objects"], [String.raw`\(\texttt{map\_location}\)`, "the device the loaded tensors are put on"], ["strict", "True by default, missing or unexpected keys raise an error"], ["module. prefix", "added by nn.DataParallel and DistributedDataParallel to every key"]],
how: ["Save <code>model.state_dict()</code> or a checkpoint dict, never the model object.", "Load with <code>torch.load(path, map_location=DEVICE, weights_only=True)</code>.", "Pass <code>ckpt['model']</code>, not the whole checkpoint, to <code>load_state_dict</code>.", "Strip a <code>module.</code> prefix with <code>k.removeprefix('module.')</code>.", "Print the result of <code>load_state_dict</code>, it reports the key match."],
say: String.raw`Save state dicts rather than model objects, load them with weights only and a map location, and when loading fails compare the missing and unexpected key lists, which name the mismatch.`,
num: String.raw`The lesson's model <code>Sequential(Linear(2, 16), Tanh(), Linear(16, 1))</code> has the four keys 0.weight, 0.bias, 2.weight and 2.bias, the Tanh at index 1 has none. Passing the whole checkpoint gives <b>4 missing</b> and 3 unexpected keys (model, optimizer, epoch). Loading a five-layer optimizer state into it raises <b>ValueError</b> because the parameter groups differ in size.`,
r(fig, ctl) {
  const MK = ["0.weight", "0.bias", "2.weight", "2.bias"];
  const K = [
    ["state_dict, done right", MK, ["torch.save(model.state_dict(), 'model.pt')", "sd = torch.load('model.pt', map_location=DEVICE, weights_only=True)", "print(model.load_state_dict(sd))"], ["<All keys matched successfully>"], "Every key in the file has a slot in the model and every shape matches."],
    ["whole model pickled", null, ["torch.save(model, 'whole.pt')", "model = torch.load('whole.pt')"], ["_pickle.UnpicklingError: Weights only load failed. This file can still be loaded, to do", "so you have two options, do those steps only if you trust the source of the checkpoint.", "  (1) In PyTorch 2.6, we changed the default value of the `weights_only` argument in", "`torch.load` from `False` to `True`. ...", "  WeightsUnpickler error: Unsupported global: GLOBAL torch.nn.modules.container.Sequential", "was not an allowed global by default. ..."], "The file holds a pickled Sequential object. weights_only=False would load it, but only do that for files you made yourself. Better, save the state_dict."],
    ["whole checkpoint passed", ["model", "optimizer", "epoch"], ["ckpt = torch.load('ckpt.pt', weights_only=True)", "model.load_state_dict(ckpt)                   # should be ckpt['model']"], ["RuntimeError: Error(s) in loading state_dict for Sequential:", "  Missing key(s) in state_dict: \"0.weight\", \"0.bias\", \"2.weight\", \"2.bias\".", "  Unexpected key(s) in state_dict: \"model\", \"optimizer\", \"epoch\"."], "The unexpected keys are the checkpoint's own fields. Index the dict first."],
    ["module. prefix", MK.map(k => "module." + k), ["sd = torch.load('ddp_model.pt', weights_only=True)    # saved from DataParallel", "model.load_state_dict(sd)"], ["RuntimeError: Error(s) in loading state_dict for Sequential:", "  Missing key(s) in state_dict: \"0.weight\", \"0.bias\", \"2.weight\", \"2.bias\".", "  Unexpected key(s) in state_dict: \"module.0.weight\", \"module.0.bias\", \"module.2.weight\",", "\"module.2.bias\".", "", "fix: model.load_state_dict({k.removeprefix('module.'): v for k, v in sd.items()})", "<All keys matched successfully>"], "The two lists are the same names with and without a prefix, a wrapper saved them. Strip it, or save model.module.state_dict() in the first place."],
    ["GPU file on a CPU machine", MK, ["ckpt = torch.load('trained_on_gpu.pt', weights_only=True)", "# fix: torch.load('trained_on_gpu.pt', map_location='cpu', weights_only=True)"], ["RuntimeError: Attempting to deserialize object on a CUDA device but", "torch.cuda.is_available() is False. If you are running on a CPU-only machine, please use", "torch.load with map_location=torch.device('cpu') to map your storages to the CPU.", "(PyTorch's wording, quoted because this build had no GPU)"], "Tensors remember the device they were saved from. map_location moves them while loading, so always pass it."],
    ["optimizer of another model", MK, ["model = make_deeper_model()                     # 5 layers, 6 parameter tensors", "optimizer = torch.optim.Adam(model.parameters())", "optimizer.load_state_dict(ckpt['optimizer'])     # saved for the 2-layer model"], ["ValueError: loaded state dict contains a parameter group that doesn't match the size of", "optimizer's group"], "Optimizer state is stored by parameter position, not by name, so it only fits an optimizer built over the same parameters in the same order."]
  ];
  let v = 0;
  ctl.innerHTML = btns(K.map((q, i) => [i, q[0]]), "m5");
  const u = () => {
    pick(ctl, "m5", v); const [name, fk, code, out, note] = K[v];
    let s = tx(30, 22, "keys in the file", null, "th") + tx(370, 22, "keys the model expects", null, "th");
    if (fk) fk.forEach((k, i) => { const ok = MK.includes(k); s += chip(30, 34 + i * 32, 280, k, ok ? "var(--teal-bg)" : "var(--coral-bg)", ok ? C.teal : C.coral); });
    else s += `<g class="c-coral"><rect x="30" y="34" width="280" height="88" rx="8" stroke-width="1"/></g>` + tx(170, 70, "a pickled Sequential object", "middle", "th") + tx(170, 92, "classes, not a dict of tensors", "middle", "t");
    MK.forEach((k, i) => { const ok = fk && fk.includes(k); s += chip(370, 34 + i * 32, 280, k, ok ? "var(--teal-bg)" : "var(--gray-bg)", ok ? C.teal : "var(--line)"); if (ok) s += arrow(312, 46 + fk.indexOf(k) * 32, 366, 46 + i * 32, C.teal, 1.4); });
    if (v === 4) s += tx(30, 176, "every tensor in the file says device cuda:0", null, "t");
    fig.innerHTML = svg(186, s) + ML.code(code, -1) + ML.term(out) + `<p class="note">${note}</p>`;
  };
  bind(ctl, "m5", i => { v = i; u(); }); u();
}},

{s: "6. Every random choice in a run", t: "Each source of randomness has its own seed, and each moves the result by a different amount",
intu: String.raw`One training run makes many random choices: the split, the initial weights, the order of the batches, the dropout masks and any augmentation. Python's <code>random</code>, NumPy and PyTorch keep separate random states, so a seed for one library does nothing for the others. HW10's <code>seed_everything</code> seeds all three plus every GPU and sets the two cuDNN flags. The left panel runs this lesson's network twice with the same seed calls, where the split uses NumPy and everything else uses PyTorch's global state. The right panel answers a different question, Ng's question of how much a result means: it changes one source at a time over 20 seeds and keeps the others fixed. The initial weights and the split move the validation loss most, the batch order and dropout much less. A difference between two models smaller than this spread is not evidence, which is why HW10 C3 and D3 report a mean and a seed standard deviation.`,
eq: String.raw`\[ \text{result} = f(\text{data}, \text{code}, s_{\text{split}}, s_{\text{init}}, s_{\text{order}}, s_{\text{dropout}}, \ldots) \]\[ \text{report } \bar{x} \pm \text{SD over seeds, not one run} \]`,
sym: [["random.seed", "Python's own generator, used by the standard library and some augmentation code"], ["np.random.seed", "NumPy's global generator, used here by the split"], [String.raw`\(\texttt{torch.manual\_seed}\)`, "PyTorch's generators on the CPU and on every GPU"], ["generator=g", "a private PyTorch generator for one consumer, such as a DataLoader"], ["SD", "standard deviation of a result across seeds"]],
how: ["Call a <code>seed_everything(seed)</code> like HW10's at the very top, before any model or data object is built.", "Give each DataLoader its own seeded generator.", "Change one seed at a time when you want to know which source matters.", "Run three or more seeds before you call one model better than another.", "Report the mean and the seed standard deviation, as HW10 does."],
say: String.raw`A run draws random numbers for the split, the initial weights, the batch order and dropout from separate generators, so every library must be seeded for a repeatable run, and a result is only meaningful against the spread you see when the seeds change.`,
num: String.raw`Seeding NumPy and PyTorch makes two runs agree exactly at validation MSE <b>0.119103</b>, seeding only one of them does not. Over 20 seeds with the other sources fixed the standard deviation of the validation MSE is <b>0.0237</b> for the initial weights, 0.0180 for the split, 0.0042 for the batch order and 0.0036 for dropout, and 0.0282 when all four move together.`,
r(fig, ctl) {
  const CFG = [["no seeds", [0, 0, 0, 0], 0.148263, 0.168039], ["torch only", [0, 1, 1, 1], 0.122493, 0.166135], ["numpy only", [1, 0, 0, 0], 0.130404, 0.112899], ["numpy and torch", [1, 1, 1, 1], 0.119103, 0.119103], ["seed_everything", [1, 1, 1, 1], 0.119103, 0.119103]];
  const SRC = [["split", "numpy", [0.1537, 0.1548, 0.162, 0.1265, 0.1416, 0.1522, 0.1431, 0.1554, 0.1497, 0.1469, 0.1096, 0.1399, 0.1331, 0.1629, 0.146, 0.1398, 0.1414, 0.1925, 0.1734, 0.1733], 0.0180],
    ["initial weights", "torch", [0.1537, 0.135, 0.1817, 0.1231, 0.1449, 0.1603, 0.1594, 0.1636, 0.1041, 0.1307, 0.1151, 0.1506, 0.1415, 0.0952, 0.1074, 0.1023, 0.15, 0.1475, 0.1374, 0.1589], 0.0237],
    ["batch order", "torch", [0.1537, 0.1598, 0.1635, 0.1599, 0.149, 0.1573, 0.1557, 0.1616, 0.156, 0.1556, 0.1611, 0.1673, 0.1601, 0.1577, 0.1532, 0.1553, 0.1531, 0.1539, 0.157, 0.157], 0.0042],
    ["dropout masks", "torch", [0.1537, 0.1557, 0.155, 0.1599, 0.1634, 0.1535, 0.1581, 0.1555, 0.1629, 0.1587, 0.1626, 0.1582, 0.1637, 0.1567, 0.1654, 0.1597, 0.1596, 0.163, 0.1555, 0.1607], 0.0036],
    ["all four", "both", [0.1537, 0.1265, 0.1509, 0.1014, 0.1368, 0.1451, 0.1203, 0.1527, 0.1084, 0.1166, 0.0855, 0.1371, 0.1264, 0.0878, 0.0999, 0.0974, 0.1238, 0.1807, 0.1518, 0.1837], 0.0282]];
  let v = 3;
  ctl.innerHTML = btns(CFG.map((c, i) => [i, c[0]]), "m6");
  const u = () => {
    pick(ctl, "m6", v); const [name, fx, r1, r2] = CFG[v];
    let s = tx(20, 22, "run twice with: " + name, null, "th");
    ["split (numpy)", "initial weights (torch)", "batch order (torch)", "dropout (torch)"].forEach((t, i) => s += chip(20, 34 + i * 30, 200, t, fx[i] ? "var(--teal-bg)" : "var(--coral-bg)", fx[i] ? C.teal : C.coral) + tx(228, 51 + i * 30, fx[i] ? "fixed" : "varies"));
    s += tx(20, 172, "run 1: " + r1.toFixed(6), null, "t") + tx(20, 194, "run 2: " + r2.toFixed(6), null, "t") + tx(20, 222, r1 === r2 ? "identical to every digit" : "different runs", null, "th");
    const a = ML.axes(380, 30, 270, 190, { xmin: 0.08, xmax: 0.2, ymin: -0.5, ymax: 4.5, nx: 3, ny: 1, xl: "validation MSE, 20 seeds each", fx: x => x.toFixed(2), fy: () => "", grid: false });
    s += a.s;
    SRC.forEach(([lab, lib, vals, sd], i) => {
      const y = a.Y(4 - i);
      s += tx(372, y + 4, lab, "end", "t");
      vals.forEach((x, j) => s += `<circle cx="${a.X(x)}" cy="${y + ((j % 5) - 2) * 3}" r="3" fill="${[C.blue, C.purple, C.teal, C.amber, C.coral][i]}" opacity="0.8"/>`);
      s += tx(a.X(0.2) - 2, y - 9, "SD " + sd.toFixed(4), "end", "ts");
    });
    fig.innerHTML = svg(266, s) + ML.code(v === 4 ? ["def seed_everything(seed):                         # HW10", "    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)", "    if torch.cuda.is_available():", "        torch.cuda.manual_seed_all(seed)", "    torch.backends.cudnn.benchmark = False", "    torch.backends.cudnn.deterministic = True"] : [(fx[0] ? "" : "# ") + "np.random.seed(26)", (fx[1] ? "" : "# ") + "torch.manual_seed(26)", "perm = np.random.permutation(256)        # the split", "model = make_model()                     # initial weights", "loader = DataLoader(train, batch_size=32, shuffle=True)  # order", "train(model, loader, epochs=10)          # dropout masks"], -1);
  };
  bind(ctl, "m6", i => { v = i; u(); }); u();
}},

{s: "7. One stream, many consumers", t: "Every call that draws from the global generator shifts what the next consumer receives",
intu: String.raw`<code>torch.manual_seed(0)</code> does not fix the weights of a particular layer. It fixes the start of one long stream of random numbers, and every consumer takes the next numbers in line: layer initializers, <code>torch.randn</code>, dropout, and a DataLoader without its own generator. Insert one extra draw, a debugging <code>torch.randn(3)</code> or a probe model built to check shapes, and every later consumer receives different numbers, so the same seed now gives different weights and a different batch order. Two tools isolate consumers. A private <code>torch.Generator</code> for the DataLoader, as HW6 and HW10 do, keeps the batch order independent of how many layers were built. And <code>torch.random.fork_rng()</code>, which HW8 uses around its augmentation figure, lets a block draw numbers and then restores the stream as if nothing had happened.`,
eq: String.raw`\[ \text{seed} \to u_1, u_2, u_3, \ldots \qquad \text{consumer } j \text{ takes the next } n_j \text{ values} \]`,
sym: [["global generator", "the stream behind <code>torch.manual_seed</code>, shared by default"], [String.raw`\(n_j\)`, "how many numbers consumer j draws, nn.Linear(2, 1) draws 3"], ["torch.Generator", "a separate stream with its own seed"], [String.raw`\(\texttt{fork\_rng}\)`, "saves the global state, runs a block, restores the state"], [String.raw`\(\texttt{initial\_seed}\)`, "the seed the global generator was last given"]],
how: ["Seed once, then build objects in a fixed order.", "Give every DataLoader <code>generator=torch.Generator().manual_seed(seed)</code>.", "Wrap debugging draws and figures in <code>with torch.random.fork_rng():</code>.", "Re-seed before each trial when comparing settings, as HW6 2.3 does.", "Never rely on a seed for the weights of one layer deep inside a script."],
say: String.raw`A seed fixes the start of one shared stream, and every draw by any consumer moves the position for the next one, so extra draws change later weights and batch orders unless the consumers use separate generators or the draw happens inside fork rng.`,
num: String.raw`After <code>torch.manual_seed(0)</code>, <code>nn.Linear(2, 1)</code> gets weights <b>[−0.0053, 0.3793]</b> and bias −0.5820. One <code>torch.randn(3)</code> before it gives [−0.0628, 0.1871], a probe <code>nn.Linear(4, 4)</code> gives [0.2568, 0.5872], and the same randn inside <code>fork_rng</code> gives the original weights back. A shuffled loader built after the layer starts with <b>[6, 9, 0, 2]</b>, or [0, 3, 5, 1] after the probe, while a loader with its own generator starts with [3, 7, 5, 2] either way.`,
r(fig, ctl) {
  const S = [
    ["seed, then the layer", [["nn.Linear(2, 1)", 3, C.teal]], "[−0.0053, 0.3793], bias −0.5820", "[6, 9, 0, 2]", ["torch.manual_seed(0)", "layer = nn.Linear(2, 1)", "loader = DataLoader(range(10), batch_size=4, shuffle=True)"]],
    ["an extra randn first", [["torch.randn(3)", 3, C.coral], ["nn.Linear(2, 1)", 3, C.teal]], "[−0.0628, 0.1871], bias −0.2137", "[5, 1, 6, 3]", ["torch.manual_seed(0)", "_ = torch.randn(3)                 # a debugging draw", "layer = nn.Linear(2, 1)", "loader = DataLoader(range(10), batch_size=4, shuffle=True)"]],
    ["a probe model first", [["nn.Linear(4, 4)", 20, C.coral], ["nn.Linear(2, 1)", 3, C.teal]], "[0.2568, 0.5872], bias −0.1455", "[0, 3, 5, 1]", ["torch.manual_seed(0)", "probe = nn.Linear(4, 4)            # built only to check a shape", "layer = nn.Linear(2, 1)", "loader = DataLoader(range(10), batch_size=4, shuffle=True)"]],
    ["the draw inside fork_rng", [["fork: randn(3)", 3, "var(--line)"], ["nn.Linear(2, 1)", 3, C.teal]], "[−0.0053, 0.3793], bias −0.5820", "[6, 9, 0, 2]", ["torch.manual_seed(0)", "with torch.random.fork_rng(devices=[]):", "    _ = torch.randn(3)             # restored afterwards", "layer = nn.Linear(2, 1)", "loader = DataLoader(range(10), batch_size=4, shuffle=True)"]],
    ["loader with its own generator", [["nn.Linear(4, 4)", 20, C.coral], ["nn.Linear(2, 1)", 3, C.teal]], "[0.2568, 0.5872], bias −0.1455", "[3, 7, 5, 2], with or without the probe", ["torch.manual_seed(0)", "probe = nn.Linear(4, 4)", "layer = nn.Linear(2, 1)", "g = torch.Generator().manual_seed(0)", "loader = DataLoader(range(10), batch_size=4, shuffle=True, generator=g)"]]
  ];
  let v = 0;
  ctl.innerHTML = btns(S.map((q, i) => [i, q[0]]), "m7");
  const u = () => {
    pick(ctl, "m7", v); const [name, cons, w, order, code] = S[v];
    let s = tx(20, 22, "the global stream after torch.manual_seed(0), simplified to one box per number drawn", null, "th");
    let pos = 0;
    for (let i = 0; i < 30; i++) s += `<rect x="${20 + i * 21}" y="34" width="19" height="22" rx="3" fill="var(--sunk)" stroke="var(--line)"/>` + tx(29 + i * 21, 49, i + 1, "middle", "ts");
    cons.forEach(([lab, n, col], j) => {
      const fork = lab.startsWith("fork"), x0 = 20 + (fork ? 0 : pos) * 21, wdt = Math.min(n, 30 - (fork ? 0 : pos)) * 21 - 2;
      s += `<rect x="${x0}" y="${fork ? 62 : 34}" width="${wdt}" height="22" rx="3" fill="${col}" opacity="${fork ? 0.35 : 0.55}"/>`;
      s += tx(x0 + 2, fork ? 98 : 74 + j * 16, lab + (fork ? ", then the state is restored" : ": numbers " + (pos + 1) + " to " + (pos + n)), null, "t");
      if (!fork) pos += n;
    });
    if (v !== 4) s += `<rect x="${20 + pos * 21}" y="34" width="${Math.max(0, 30 - pos) * 21 - 2}" height="22" rx="3" fill="${C.blue}" opacity="0.25"/>` + tx(Math.min(20 + pos * 21 + 2, 560), 122, "the loader draws from here", null, "t");
    else s += tx(20, 122, "the loader draws from its own stream, untouched by the layers", null, "t");
    s += tx(20, 160, "nn.Linear(2, 1) weights: " + w, null, "th") + tx(20, 186, "first batch of the shuffled loader: " + order, null, "th");
    fig.innerHTML = svg(200, s) + ML.code(code, -1);
  };
  bind(ctl, "m7", i => { v = i; u(); }); u();
}},

{s: "8. Repeatable is not the same as identical", t: "Floating point sums depend on their order, so bitwise equality needs deterministic kernels",
intu: String.raw`Floating point addition is not associative: (a + b) + c and a + (b + c) can differ in the last bits, and with very different magnitudes by far more. A GPU sums a large tensor in parallel and some kernels, for example atomic adds in scatter and index operations and some convolution backward algorithms, combine the partial sums in whatever order the threads finish. The same seed then gives runs that agree to six or seven digits but not bit for bit, and the tiny differences grow slowly as training continues. PyTorch offers switches that trade speed for bitwise repeatability: <code>torch.backends.cudnn.benchmark = False</code>, <code>torch.backends.cudnn.deterministic = True</code> (both in HW10's seed function) and <code>torch.use_deterministic_algorithms(True)</code>, which raises an error for any operation without a deterministic version. Even then results may differ across GPUs, drivers and PyTorch versions, as the HW6 notes say.`,
eq: String.raw`\[ \mathrm{fl}\big(\mathrm{fl}(a + b) + c\big) \ne \mathrm{fl}\big(a + \mathrm{fl}(b + c)\big) \text{ in general} \]\[ |\mathrm{fl}(x) - x| \le \tfrac{\varepsilon}{2} |x|, \quad \varepsilon_{32} = 2^{-23} \approx 1.19 \times 10^{-7} \]`,
sym: [["fl(x)", "x rounded to the nearest float32"], [String.raw`\(\varepsilon\)`, "machine epsilon, the gap between 1 and the next float"], ["cudnn.benchmark", "times several algorithms per input shape and keeps the fastest, which can differ run to run"], ["cudnn.deterministic", "restricts cuDNN to deterministic algorithms"], ["deterministic mode", "<code>torch.use_deterministic_algorithms(True)</code> errors on any nondeterministic operation, and may need the <code>CUBLAS_WORKSPACE_CONFIG</code> variable"]],
how: ["Use HW10's two cuDNN flags when you need repeatable comparisons.", "Turn on <code>torch.use_deterministic_algorithms(True)</code> to find the operations that are not deterministic.", "Compare results with <code>torch.testing.assert_close</code> and a tolerance, not with ==.", "Accept differences in the sixth digit, investigate differences in the second.", "Record the device, driver and library versions with every result, as HW8 and HW10 print them."],
say: String.raw`Because floating point addition depends on order, parallel kernels that sum in a varying order make same-seed runs agree only approximately, so bitwise repeatability needs deterministic algorithms and comparisons should use a tolerance.`,
num: String.raw`In float32, (10⁸ + 1) − 10⁸ gives <b>0</b> while (10⁸ − 10⁸) + 1 gives 1. One million standard normal draws sum to 544.299622 with torch.sum, <b>544.299683</b> in a shuffled order and 544.284119 added one by one, against 544.299624 in float64. Reversing the order inside each batch changes the weights by 1.5 × 10⁻⁸ after one step and <b>6 × 10⁻⁶</b> after 1,800, and both runs end at validation MSE 0.015767.`,
r(fig, ctl) {
  const D = [[1, 1.49e-08], [2, 5.96e-08], [8, 5.96e-08], [10, 1.19e-07], [69, 1.19e-07], [83, 1.79e-07], [101, 1.79e-07], [122, 2.38e-07], [148, 3.58e-07], [179, 4.17e-07], [217, 4.77e-07], [263, 5.96e-07], [319, 7.75e-07], [387, 9.54e-07], [469, 9.54e-07], [568, 1.19e-06], [689, 1.13e-06], [834, 1.25e-06], [1011, 1.25e-06], [1226, 1.61e-06], [1485, 2.86e-06], [1800, 5.96e-06]];
  let v = 0;
  ctl.innerHTML = btns([[0, "three numbers"], [1, "one million numbers"], [2, "a training run"]], "m8");
  const u = () => {
    pick(ctl, "m8", v); let s = "", code, out;
    if (v === 0) {
      s += tx(30, 30, "float32: a = 10⁸, b = 1, c = −10⁸", null, "th");
      [["(a + b) + c", "a + b = 100,000,001 is not a float32, it rounds to 100,000,000", "0"], ["a + (b + c)", "b + c = −99,999,999 rounds to −100,000,000", "0"], ["(a + c) + b", "a + c = 0 exactly, then 0 + 1", "1"]].forEach(([e, why, r], i) => s += chip(30, 48 + i * 50, 150, e, i === 2 ? "var(--teal-bg)" : "var(--coral-bg)", i === 2 ? C.teal : C.coral) + tx(196, 64 + i * 50, why, null, "t") + tx(640, 64 + i * 50, "= " + r, "end", "th"));
      s += tx(30, 214, "near 10⁸ the gap between float32 values is 8, so adding 1 is lost", null, "t");
      code = ["a, b, c = np.float32(1e8), np.float32(1), np.float32(-1e8)", "print((a + b) + c, a + (b + c), (a + c) + b)"]; out = ["0.0 0.0 1.0"];
    } else if (v === 1) {
      const R = [["torch.sum", 544.299622], ["shuffled, then torch.sum", 544.299683], ["1000 row sums, then their sum", 544.299683], ["one by one, left to right", 544.284119], ["float64 reference", 544.299624]];
      const a = ML.axes(250, 20, 390, 170, { xmin: 544.28, xmax: 544.305, ymin: -0.5, ymax: 4.5, nx: 5, ny: 1, xl: "sum of the same million float32 numbers", fx: x => x.toFixed(3), fy: () => "", grid: false });
      s += a.s;
      R.forEach(([lab, val], i) => { const y = a.Y(4 - i); s += tx(240, y + 4, lab, "end", "t") + `<circle cx="${a.X(val)}" cy="${y}" r="5" fill="${i === 4 ? "var(--fg)" : [C.blue, C.purple, C.teal, C.coral][i]}"/>` + tx(a.X(val) + (i === 3 ? 10 : -10), y - 8, val.toFixed(6), i === 3 ? null : "end", "ts"); });
      code = ["x = torch.randn(1_000_000, generator=torch.Generator().manual_seed(26))", "print(x.sum(), x[perm].sum(), x.view(1000, 1000).sum(1).sum())", "print(np.cumsum(x.numpy())[-1], x.double().sum())"]; out = ["tensor(544.2996) tensor(544.2997) tensor(544.2997)", "544.28412 tensor(544.2996, dtype=torch.float64)"];
    } else {
      const a = ML.axes(80, 20, 540, 170, { xmin: 0, xmax: Math.log10(1800), ymin: -8, ymax: -5, nx: 3, ny: 3, xl: "update step (log scale)", yl: "largest weight difference", fx: x => n0(10 ** x), fy: y => "1e" + Math.round(y) });
      s += a.s + ML.path(D.map(([k, d]) => [a.X(Math.log10(k)), a.Y(Math.log10(d))]), C.coral, 2.2) + D.map(([k, d]) => `<circle cx="${a.X(Math.log10(k))}" cy="${a.Y(Math.log10(d))}" r="2.5" fill="${C.coral}"/>`).join("");
      s += tx(90, 34, "same seed, same batches, each batch reversed: the gradient is the same in exact arithmetic", null, "t");
      code = ["idx = perm[k*32:(k+1)*32]", "if reverse: idx = idx.flip(0)          # same samples, other order", "loss = F.mse_loss(model(X[idx]), y[idx])"]; out = ["step 1: 1.49e-08   step 100: 1.79e-07   step 1800: 5.96e-06", "validation MSE 0.015767 and 0.015767"];
    }
    fig.innerHTML = svg(232, s) + ML.code(code, -1) + ML.term(out);
  };
  bind(ctl, "m8", i => { v = i; u(); }); u();
}},

{s: "9. Three number formats", t: "float16 trades range for speed, bfloat16 keeps the range and gives up precision",
intu: String.raw`A float stores a sign, an exponent and a fraction. float32 uses 8 exponent bits and 23 fraction bits. float16 uses 5 and 10, so it is half the memory and much faster on tensor cores, but its largest value is 65,504 and its smallest normal value is about 6.1 × 10⁻⁵, below which numbers lose precision as subnormals and then become 0. bfloat16 keeps float32's 8 exponent bits and keeps only 7 fraction bits, so it covers the same range as float32 with about three significant digits. The difference matters most for gradients, which are often tiny: a gradient of 10⁻⁸ survives in bfloat16 but becomes exactly 0 in float16. Move the value or pick a preset and read what each format actually stores.`,
eq: String.raw`\[ x = (-1)^{s} \cdot 1.f \cdot 2^{e} \]\[ \varepsilon = 2^{-23}, \; 2^{-10}, \; 2^{-7} \quad \text{for float32, float16, bfloat16} \]`,
sym: [["s, e, f", "sign bit, exponent, fraction bits"], [String.raw`\(\varepsilon\)`, "relative spacing of values near 1"], ["max", "3.4 × 10³⁸ for float32 and bfloat16, 65,504 for float16"], ["smallest normal", "1.2 × 10⁻³⁸ for float32 and bfloat16, 6.1 × 10⁻⁵ for float16"], ["subnormal", "float16 values from 6 × 10⁻⁸ up to the smallest normal, with fewer digits"]],
how: ["Keep weights and optimizer state in float32.", "Let autocast choose float16 or bfloat16 for matrix products, card 10.", "Prefer bfloat16 on hardware that supports it, it needs no loss scaling.", "Watch for values above 65,504 in float16 code, such as exponentials and squares.", "Check <code>torch.finfo(dtype)</code> for max, eps and tiny."],
say: String.raw`float16 has ten fraction bits and a maximum of 65,504, so large values overflow and small gradients vanish, while bfloat16 keeps the float32 exponent range with only seven fraction bits, so it rarely overflows or underflows but rounds more coarsely.`,
num: String.raw`0.1 is stored as 0.10000000149 in float32, <b>0.0999755859</b> in float16 and 0.1000976563 in bfloat16. 2,049 becomes 2,048 in both 16-bit formats. 70,000 becomes <b>inf</b> in float16 and 70,144 in bfloat16. A gradient of 2 × 10⁻⁸ becomes <b>0</b> in float16 and 2.0023 × 10⁻⁸ in bfloat16.`,
r(fig, ctl) {
  const PRE = [[0.1, "0.1"], [2049, "2,049"], [70000, "70,000"], [2e-8, "2e-8, a gradient"], [3e-5, "3e-5"], [1000.1, "1000.1"]];
  ctl.innerHTML = btns(PRE.map((p, i) => [i, p[1]]), "m9p") + sl("m9x", "log₁₀ of the value", -9, 6, 0.01, -1);
  const show = x => !isFinite(x) ? "inf" : x === 0 ? "0" : Math.abs(x) >= 1e5 || Math.abs(x) < 1e-3 ? x.toExponential(5).replace("e", " × 10^").replace("^+", "^") : String(+x.toPrecision(10));
  let pv = 0;
  const u = (fromPreset) => {
    const x = fromPreset != null ? PRE[fromPreset][0] : 10 ** +$("m9x").value;
    if (fromPreset != null) { $("m9x").value = Math.log10(x); pick(ctl, "m9p", fromPreset); } else pick(ctl, "m9p", -1);
    $("m9xv").textContent = show(x);
    const L = v => 20 + (Math.log10(v) + 9) / 15 * 640;
    let s = tx(20, 20, "float16 along a log scale from 10⁻⁹ to 10⁶", null, "th");
    s += `<rect x="${L(1e-9)}" y="30" width="${L(2.98e-8) - L(1e-9)}" height="22" fill="var(--coral-bg)" stroke="${C.coral}"/>` + `<rect x="${L(2.98e-8)}" y="30" width="${L(6.1e-5) - L(2.98e-8)}" height="22" fill="var(--purple-bg)" stroke="${C.purple}"/>` + `<rect x="${L(6.1e-5)}" y="30" width="${L(65504) - L(6.1e-5)}" height="22" fill="var(--teal-bg)" stroke="${C.teal}"/>` + `<rect x="${L(65504)}" y="30" width="${L(1e6) - L(65504)}" height="22" fill="var(--coral-bg)" stroke="${C.coral}"/>`;
    s += tx((L(1e-9) + L(2.98e-8)) / 2, 66, "→ 0", "middle") + tx((L(2.98e-8) + L(6.1e-5)) / 2, 66, "subnormal", "middle") + tx((L(6.1e-5) + L(65504)) / 2, 66, "normal, 3 to 4 digits", "middle") + tx((L(65504) + L(1e6)) / 2, 66, "→ inf", "middle");
    s += `<rect x="${L(1e-9)}" y="78" width="${L(1e6) - L(1e-9)}" height="10" fill="var(--blue-bg)" stroke="${C.blue}"/>` + tx(20, 104, "bfloat16 and float32: normal over the whole range shown", null, "t");
    const px = L(Math.min(Math.max(x, 1e-9), 1e6));
    s += `<line x1="${px}" y1="24" x2="${px}" y2="92" stroke="var(--fg)" stroke-width="2"/>`;
    const rows = [["float32", Math.fround(x)], ["float16", F16(x)], ["bfloat16", B16(x)]];
    s += tx(20, 134, "format", null, "th") + tx(130, 134, "stored value", null, "th") + tx(420, 134, "relative error", null, "th");
    rows.forEach(([n, y], i) => { const re = isFinite(y) ? Math.abs(y - x) / x : Infinity; s += tx(20, 160 + i * 26, n, null, "t") + `<text class="th" x="130" y="${160 + i * 26}" style="font-family:var(--mono)">${show(y)}</text>` + tx(420, 160 + i * 26, !isFinite(re) ? "overflow" : y === 0 ? "100%, the value is lost" : re < 1e-12 ? "0" : re.toExponential(2), null, re > 0.01 ? "th" : "t"); });
    fig.innerHTML = svg(240, s) + ML.code(["x = torch.tensor(" + (fromPreset != null ? PRE[fromPreset][0] : +x.toPrecision(6)) + ")", "print(x.float(), x.half(), x.bfloat16())", "print(torch.finfo(torch.float16).max, torch.finfo(torch.float16).tiny)"], -1) + ML.term([rows.map(r => show(r[1])).join("   "), "65504.0 6.103515625e-05"]);
  };
  bind(ctl, "m9p", i => { pv = i; u(i); }); $("m9x").oninput = () => u(); u(0);
}},

{s: "10. Mixed precision: autocast and the gradient scaler", t: "Run matrix products in 16 bits, keep weights in 32 bits, and scale the loss so float16 gradients survive",
intu: String.raw`Automatic mixed precision keeps a float32 master copy of every weight and lets <code>torch.autocast</code> pick the dtype of each operation inside the forward pass. Matrix products and convolutions, where 16 bits are fast and accurate enough, run in float16 or bfloat16. Operations that need range or careful sums, such as losses, log-softmax and large reductions on a GPU, are kept in float32. With float16 one problem remains: many gradient entries are smaller than float16 can hold and would become 0 in the backward pass. <code>GradScaler</code> multiplies the loss by a large factor S before backward, so every gradient is S times larger, then divides by S again in float32 before the optimizer step. If any gradient overflowed to inf, it skips that step and halves S, and after 2,000 clean steps it doubles S. bfloat16 has the float32 range and needs no scaler.`,
eq: String.raw`\[ \tilde g = \nabla_\theta (S \cdot L) = S\, g, \qquad g = \tilde g / S \ \text{in float32} \]\[ \text{inf in } \tilde g: \ S \leftarrow S/2, \text{ skip} \qquad 2000 \text{ clean steps}: \ S \leftarrow 2S \]`,
sym: [["S", "the loss scale, 65,536 at the start"], ["L", "the loss, computed in float32"], [String.raw`\(\tilde g\)`, "scaled gradients, what backward produces"], ["autocast", "a context that chooses the dtype per operation"], [String.raw`\(\texttt{growth\_interval}\)`, "clean steps before the scale doubles, 2,000 by default"]],
how: ["Create <code>scaler = torch.amp.GradScaler('cuda')</code> once.", "Run the forward pass and the loss inside <code>with torch.autocast('cuda', dtype=torch.float16):</code>.", "Call <code>scaler.scale(loss).backward()</code>, then <code>scaler.step(optimizer)</code> and <code>scaler.update()</code>.", "Call <code>scaler.unscale_(optimizer)</code> before gradient clipping, so the threshold is in true units.", "With bfloat16, use autocast alone and no scaler."],
say: String.raw`Autocast runs matrix products in sixteen bits and keeps sensitive operations and the master weights in thirty-two, and with float16 the gradient scaler multiplies the loss so small gradients do not underflow, divides them again before the step, and skips steps that overflowed while halving the scale.`,
num: String.raw`Measured on this CPU with bfloat16 autocast: the linear layer's output is <b>bfloat16</b>, the MSE and cross-entropy losses are float32, the weights and their gradients stay float32. A gradient of 10⁻⁸ becomes 0 in float16, scaled by 65,536 it is stored as <b>6.552 × 10⁻⁴</b> and unscales to 9.997 × 10⁻⁹. After an inf the CPU GradScaler went from 65,536 to <b>32,768</b> and left the weights unchanged.`,
r(fig, ctl) {
  let v = 0;
  ctl.innerHTML = btns([[0, "which dtype runs where"], [1, "small gradients rescued"], [2, "the scale over time"]], "m10") + `<div id="m10s"></div>`;
  const u = () => {
    pick(ctl, "m10", v); let s = "", code;
    $("m10s").innerHTML = v === 2 ? sl("m10g", "largest gradient entry G, log₁₀", -3, 2, 0.1, -0.3) : "";
    if (v === 0) {
      const R = [["nn.Linear, matmul, conv2d", "float16", "bfloat16", 1], ["ReLU, add, max pool", "follows its input", "follows its input", 1], ["softmax, log_softmax", "float32", "bfloat16", 0], ["sum and other reductions", "float32", "bfloat16", 0], ["mse_loss, cross_entropy", "float32", "float32", 0], ["weights and their .grad", "float32", "float32", 0], ["optimizer state", "float32", "float32", 0]];
      s += tx(20, 22, "operation", null, "th") + tx(300, 22, "CUDA, float16", null, "th") + tx(490, 22, "CPU, bfloat16 (measured)", null, "th");
      R.forEach(([op, a, b, low], i) => { const y = 34 + i * 30; s += tx(20, y + 16, op, null, "t") + chip(300, y, 170, a, a === "float32" ? "var(--blue-bg)" : "var(--teal-bg)", a === "float32" ? C.blue : C.teal) + chip(490, y, 170, b, b === "float32" ? "var(--blue-bg)" : "var(--teal-bg)", b === "float32" ? C.blue : C.teal); });
      s += tx(20, 260, "the CUDA column follows the autocast op lists in the PyTorch documentation", null, "t");
      code = ["with torch.autocast(device_type='cpu', dtype=torch.bfloat16):", "    out = model(x); loss = F.mse_loss(out, y)", "print(out.dtype, loss.dtype, model[0].weight.dtype)", "loss.backward(); print(model[0].weight.grad.dtype)"];
      fig.innerHTML = svg(272, s) + ML.code(code, -1) + ML.term(["torch.bfloat16 torch.float32 torch.float32", "torch.float32"]);
    } else if (v === 1) {
      const G = [3e-8, 1e-8, 2e-5], S = 65536;
      const L = x => 60 + (Math.log10(x) + 10) / 11 * 580;
      s += `<rect x="${L(1e-10)}" y="30" width="${L(2.98e-8) - L(1e-10)}" height="150" fill="var(--coral-bg)" opacity="0.6"/>` + `<rect x="${L(2.98e-8)}" y="30" width="${L(6.1e-5) - L(2.98e-8)}" height="150" fill="var(--purple-bg)" opacity="0.6"/>` + `<rect x="${L(6.1e-5)}" y="30" width="${L(10) - L(6.1e-5)}" height="150" fill="var(--teal-bg)" opacity="0.6"/>`;
      s += tx((L(1e-10) + L(2.98e-8)) / 2, 22, "float16 gives 0", "middle") + tx((L(2.98e-8) + L(6.1e-5)) / 2, 22, "subnormal, few digits", "middle") + tx((L(6.1e-5) + L(10)) / 2, 22, "normal float16", "middle");
      for (let e = -10; e <= 1; e++) s += tx(L(10 ** e), 198, "1e" + e, "middle", "ts");
      G.forEach((g, i) => {
        const y = 50 + i * 44, h = F16(g), sc = F16(g * S);
        s += `<circle cx="${L(g)}" cy="${y}" r="6" fill="${C.coral}"/>` + arrow(L(g) + 8, y, L(g * S) - 8, y + 14, "var(--p)", 1.2, "3 3") + `<circle cx="${L(g * S)}" cy="${y + 14}" r="6" fill="${C.teal}"/>`;
        s += tx(L(g) - 10, y + 4, "g = " + g.toExponential(0) + (h === 0 ? ", stored 0" : ", stored " + h.toExponential(3)), "end", "ts");
        s += tx(L(g * S) + 10, y + 18, "S·g stored " + sc.toExponential(3) + ", back to " + (sc / S).toExponential(3), null, "ts");
      });
      code = ["g = torch.tensor([3e-8, 1e-8, 2e-5])", "print(g.half())", "print((g * 65536).half())", "print((g * 65536).half().float() / 65536)"];
      fig.innerHTML = svg(212, s) + ML.code(code, -1) + ML.term(["tensor([5.9605e-08, 0.0000e+00, 2.0027e-05], dtype=torch.float16)", "tensor([1.9665e-03, 6.5517e-04, 1.3105e+00], dtype=torch.float16)", "tensor([3.0006e-08, 9.9972e-09, 1.9997e-05])"]);
    }
    if (v === 2) {
      const draw = () => {
        const G = 10 ** +$("m10g").value; $("m10gv").textContent = G < 0.01 ? G.toExponential(1) : +G.toPrecision(2);
        let S = 65536, tr = 0, skipped = 0; const pts = [], skips = [];
        for (let k = 0; k < 10000; k++) {
          if (!isFinite(F16(S * G))) { skipped++; skips.push(k); S /= 2; tr = 0; } else { tr++; if (tr === 2000) { S *= 2; tr = 0; } }
          if (k % 25 === 0 || skips[skips.length - 1] === k) pts.push([k, S]);
        }
        const lo = Math.min(...pts.map(p => Math.log2(p[1]))), hi = Math.max(...pts.map(p => Math.log2(p[1])));
        const a = ML.axes(80, 20, 540, 160, { xmin: 0, xmax: 10000, ymin: Math.min(lo, 16) - 1, ymax: Math.max(hi, 16) + 1, nx: 5, ny: Math.max(2, Math.min(6, Math.round(Math.max(hi, 16) - Math.min(lo, 16) + 2))), xl: "training step", yl: "log₂ of the scale S", fx: x => n0(x), fy: y => Math.round(y) });
        let s2 = a.s + ML.path(pts.map(([k, sc]) => [a.X(k), a.Y(Math.log2(sc))]), C.purple, 2) + skips.slice(0, 60).map(k => `<line x1="${a.X(k)}" y1="${a.Y(Math.min(lo, 16) - 1)}" x2="${a.X(k)}" y2="${a.Y(Math.min(lo, 16) - 1) - 10}" stroke="${C.coral}" stroke-width="2"/>`).join("");
        const Sinf = 65504 / G;
        s2 += tx(80, 232, "skipped steps in 10,000: " + skipped + ", red ticks", null, "th") + tx(330, 232, "S·G overflows float16 once S is above " + (Sinf >= 1e5 || Sinf < 1 ? Sinf.toExponential(2) : n0(Sinf)), null, "t");
        s2 += tx(80, 254, "smallest gradient that survives scaling at S = 65,536: " + (5.96e-8 / 65536).toExponential(2), null, "t");
        fig.innerHTML = svg(266, s2) + ML.code(["scaler = torch.amp.GradScaler('cuda')        # S = 65536, growth_interval 2000", "with torch.autocast('cuda', dtype=torch.float16):", "    loss = criterion(model(x), y)", "scaler.scale(loss).backward()", "scaler.step(optimizer)                        # skipped if a gradient is inf", "scaler.update()                               # halve or, after 2000 clean steps, double"], -1);
      };
      $("m10g").oninput = draw; draw();
    }
  };
  bind(ctl, "m10", i => { v = i; u(); }); u();
}},

{s: "11. Measure before you optimize", t: "Time each phase of a step after a warm-up, and let the profiler name the expensive operations",
intu: String.raw`Guessing where a training step spends its time is usually wrong, so measure. Run a few warm-up steps first, since the first step pays one-time costs such as memory allocation and library setup. Then time each phase with <code>time.perf_counter()</code>, with <code>torch.cuda.synchronize()</code> before each reading on a GPU (card 2), and take the median over many steps. <code>torch.profiler</code> goes one level deeper and lists the operations that used the most time. The numbers below were measured on this lesson's 2-core CPU for HW9's 784, 128, 10 network on random MNIST-sized batches, so yours will differ, but the pattern is common. At large batches the DataLoader was the biggest phase, because a TensorDataset is read one item at a time and collate stacks the items again. For data already in memory, indexing a whole batch at once removes most of that cost.`,
eq: String.raw`\[ t_{\text{step}} = t_{\text{data}} + t_{\text{forward}} + t_{\text{backward}} + t_{\text{step}} \]\[ \text{throughput} = B / t_{\text{step}} \ \text{samples per second} \]`,
sym: [["warm-up", "steps run and discarded before timing"], ["median", "robust against occasional slow steps"], [String.raw`\(t_{\text{data}}\)`, "time to get the next batch from the loader"], ["torch.profiler", "records the time of every operation in a block of steps"], ["throughput", "examples processed per second, the number to compare between settings"]],
how: ["Run 10 warm-up steps, then time 100 or more.", "Synchronize before each clock reading on a GPU.", "Time the data phase separately from the model phases.", "Profile a few steps with <code>torch.profiler.profile</code> and sort by self time.", "Change one thing, measure again, keep it only if the throughput improves."],
say: String.raw`Measure a training step after a warm-up, phase by phase with synchronized timers and medians, and use the profiler to find the operations that take the time, because the bottleneck is often the data path rather than the model.`,
num: String.raw`Measured medians at B = 64: data <b>0.25 ms</b>, forward 0.21, backward 0.22, optimizer step 0.11, about <b>81,000</b> samples per second, the first step 1.56 ms. At B = 1,024 the loader takes <b>2.7 ms</b> of 5.0 ms per step, and indexing the batch directly takes 0.20 ms. In the profiler the two matrix-product kernels addmm and mm take 43% of the self time.`,
r(fig, ctl) {
  const T = { 16: [0.086, 0.122, 0.148, 0.084, 36156, 2.98, 0.012], 64: [0.25, 0.206, 0.221, 0.108, 81157, 1.56, 0.021], 256: [0.728, 0.403, 0.398, 0.107, 156137, 2.50, 0.057], 1024: [2.735, 1.1, 1.081, 0.119, 203217, 6.62, 0.203] };
  let B = 64, sl2 = 0, prof = 0;
  ctl.innerHTML = btns([[16, "B = 16"], [64, "B = 64"], [256, "B = 256"], [1024, "B = 1024"]], "m11b") + btns([[0, "DataLoader, item by item"], [1, "index the whole batch"]], "m11d") + btns([[0, "phase timer"], [1, "profiler table"]], "m11v");
  const u = () => {
    pick(ctl, "m11b", B); pick(ctl, "m11d", sl2); pick(ctl, "m11v", prof);
    const r = T[B], ph = [["data", sl2 ? r[6] : r[0], C.coral], ["forward", r[1], C.blue], ["backward", r[2], C.purple], ["optimizer step", r[3], C.teal]];
    const tot = ph.reduce((a, p) => a + p[1], 0), full = r[0] + r[1] + r[2] + r[3], max = full * 1.08, stp = max > 2 ? 1 : max > 1 ? 0.25 : 0.1;
    let s = tx(20, 22, "median time per step, batch " + B + ", measured on a 2-core CPU", null, "th");
    let x = 0; const X = t => 20 + t / max * 640;
    ph.forEach(([lab, t, col]) => { s += `<rect x="${X(x)}" y="36" width="${Math.max(1, X(x + t) - X(x))}" height="34" fill="${col}" opacity="0.75"/>`; x += t; });
    ph.forEach(([lab, t, col], i) => s += `<rect x="${20 + i * 160}" y="84" width="14" height="14" fill="${col}" opacity="0.75"/>` + tx(40 + i * 160, 96, lab.replace("optimizer ", "") + " " + t.toFixed(3) + " ms", null, "t"));
    for (let k = 0; k <= max + 1e-9; k += stp) s += tx(X(k), 122, +k.toFixed(2) + " ms", "middle", "ts");
    s += tx(20, 150, "step " + tot.toFixed(2) + " ms, throughput about " + n0(B / tot * 1000) + " samples per second" + (sl2 ? "" : ", the first step took " + r[5] + " ms"), null, "th");
    s += tx(20, 174, sl2 ? "X[idx], y[idx] on a shuffled index: one indexing call per batch instead of " + B + " item calls and a stack" : "the loader calls __getitem__ " + B + " times and stacks the results, card 4 of Lesson 25", null, "t");
    const code = sl2 ? ["perm = torch.randperm(N, generator=g)", "for k in range(0, N, B):", "    idx = perm[k:k + B]", "    xb, yb = X[idx], y[idx]                  # one gather per tensor"] : ["for step in range(110):", "    t0 = time.perf_counter(); xb, yb = next(it)", "    t1 = time.perf_counter(); loss = crit(model(xb), yb)", "    t2 = time.perf_counter(); loss.backward()", "    t3 = time.perf_counter(); opt.step(); opt.zero_grad()", "    t4 = time.perf_counter()        # keep steps 10 to 109"];
    fig.innerHTML = svg(186, s) + (prof ? ML.code(["with torch.profiler.profile(activities=[ProfilerActivity.CPU]) as p:", "    for _ in range(20): train_step(xb, yb)", "print(p.key_averages().table(sort_by='self_cpu_time_total', row_limit=6))"], -1) + ML.term(["Name                          Self CPU %   Self CPU   # of Calls", "aten::addmm                       24.84%     2.140ms           40", "aten::mm                          17.82%     1.535ms           60", "Optimizer.step#SGD.step           10.64%   916.328us           20", "aten::add_                         8.97%   772.846us           80", "Optimizer.zero_grad#SGD.z...       3.32%   286.304us           20", "aten::t                            2.56%   220.791us          180", "Self CPU time total: 8.616ms     (B = 64, 20 steps, columns shortened)"]) : ML.code(code, -1));
  };
  bind(ctl, "m11b", i => { B = i; u(); }); bind(ctl, "m11d", i => { sl2 = i; u(); }); bind(ctl, "m11v", i => { prof = i; u(); }); u();
}},

{s: "12. Pro bugs", t: "Bugs that appear when a run moves to a GPU, gets resumed, or gets faster",
intu: String.raw`Each habit in this lesson exists because of a bug it prevents. Nine are collected here, each with the code that causes it, what PyTorch prints, and the fix. Some stop the run with an error, which is the good case. Others run quietly: a loss total that keeps every graph alive and slowly fills memory, an optimizer snapshot that keeps changing after it was taken, a seed set one line too late, a float16 exponential that overflows to inf, and a timer that measures the queue instead of the work. Two messages are quoted in PyTorch's wording because they need a GPU, every other output below was produced on this lesson's machine.`,
eq: String.raw`\[ \text{check: the device of every input}, \ \text{the keys on load}, \ \text{the seed before the build} \]\[ \text{a finite loss}, \ \text{synchronized timers} \]`,
sym: [["silent", "runs on with a wrong number, a leak or a slowdown"], ["loud", "raises an error that names the problem"], ["graph", "the autograd record kept alive by a tensor with a <code>grad_fn</code>"], ["snapshot", "a copy that must not change when training continues"], ["overflow", "a value above the largest float16, 65,504"]],
how: ["Assign the result of every Tensor.to.", "Accumulate <code>loss.item()</code> or <code>loss.detach()</code>, never <code>loss</code>.", "Snapshot model and optimizer states with <code>copy.deepcopy</code> or by saving to disk.", "Seed before you build anything random.", "Keep exponentials, squares and sums of large values in float32 or inside autocast."],
say: String.raw`Most pro bugs come from a tensor on the wrong device, a graph or a reference kept by accident, a seed set too late, a value outside the float16 range or a clock that did not wait for the GPU, and each has a short fix.`,
num: String.raw`Adding three losses as tensors prints <b>tensor(5.7535)</b> with <code>grad_fn</code> AddBackward0 attached, the same total as a float is a plain 5.7535. An optimizer snapshot taken at step 1 reads step <b>3</b> after two more updates. In float16, e¹² is inf and a hand-written softmax of (10, 12) gives <b>(0, nan)</b>, while torch.softmax gives (0.1192, 0.8809).`,
r(fig, ctl) {
  const B = [
    ["unassigned .to", 1, ["model.to(DEVICE)", "for x, y in loader:", "    x.to(DEVICE)                      # result thrown away", "    loss = criterion(model(x), y)"], ["RuntimeError: Expected all tensors to be on the same device, but found at least two", "devices, cuda:0 and cpu!", "(PyTorch's wording, quoted because this build had no GPU)"], "x = x.to(DEVICE). Tensor.to returns a new tensor, only Module.to works in place."],
    ["loss total as a tensor", 0, ["total = 0.0", "for x, y in loader:", "    loss = criterion(model(x), y); ...", "    total += loss                     # keeps every graph alive"], ["tensor(5.7535, grad_fn=<AddBackward0>)", "memory grows every step until the epoch ends, or out of memory"], "total += loss.item() * len(y), or loss.detach() on the device as on card 2."],
    ["optimizer snapshot", 0, ["best_opt = optimizer.state_dict()      # at step 1", "train_two_more_steps()", "print(best_opt['state'][0]['step'])"], ["tensor(3.)", "the snapshot shares the live moment tensors and step counter"], "best_opt = copy.deepcopy(optimizer.state_dict()), or torch.save it, the same trap as Lesson 23's model snapshot."],
    ["seed set after the model", 0, ["model = nn.Linear(2, 1)", "torch.manual_seed(0)                    # too late for the weights", "print(model.weight)"], ["run 1: [[0.4670, -0.5288]]", "run 2: [[-0.0053, 0.3793]]"], "Call seed_everything first, then build data, model and loaders."],
    ["GPU file, CPU machine", 1, ["ckpt = torch.load('best.pt', weights_only=True)    # saved on cuda"], ["RuntimeError: Attempting to deserialize object on a CUDA device but", "torch.cuda.is_available() is False. ... please use torch.load with", "map_location=torch.device('cpu') to map your storages to the CPU.", "(PyTorch's wording, quoted because this build had no GPU)"], "torch.load(path, map_location=DEVICE, weights_only=True), card 5."],
    ["whole model pickled", 1, ["torch.save(model, 'model.pt')", "model = torch.load('model.pt')"], ["_pickle.UnpicklingError: Weights only load failed. ...", "WeightsUnpickler error: Unsupported global: GLOBAL", "torch.nn.modules.container.Sequential was not an allowed global by default."], "Save model.state_dict() and rebuild the model in code, card 5."],
    ["module. prefix", 1, ["model.load_state_dict(torch.load('ddp.pt', weights_only=True))"], ["Missing key(s) in state_dict: \"0.weight\", \"0.bias\", \"2.weight\", \"2.bias\".", "Unexpected key(s) in state_dict: \"module.0.weight\", \"module.0.bias\", ..."], "Strip the prefix, or save model.module.state_dict() from the wrapper."],
    ["float16 overflow", 0, ["z = torch.tensor([10., 12.], dtype=torch.float16)", "e = z.exp(); print(e, e / e.sum())", "print(torch.tensor([300.], dtype=torch.float16) ** 2)"], ["tensor([22032., inf], dtype=torch.float16) tensor([0., nan], dtype=torch.float16)", "tensor([inf], dtype=torch.float16)"], "Use torch.softmax or log_softmax, which subtract the maximum, keep such operations in float32, or use bfloat16."],
    ["timer without synchronize", 0, ["t0 = time.perf_counter()", "out = model(x_gpu)", "print(time.perf_counter() - t0)       # time to queue, not to run"], ["0.002     # in the card 2 model, the true step takes 0.008"], "torch.cuda.synchronize() before both readings, after warm-up steps, card 11."]
  ];
  let v = 0;
  ctl.innerHTML = btns(B.map((q, i) => [i, q[0]]), "m12");
  const u = () => {
    pick(ctl, "m12", v); const [name, loud, code, out, fix] = B[v];
    let s = "";
    B.forEach((q, i) => { const x = 20 + (i % 3) * 216, y = 14 + Math.floor(i / 3) * 46; s += `<g class="${i === v ? (q[1] ? "c-coral" : "c-purple") : "c-gray"}"><rect x="${x}" y="${y}" width="206" height="38" rx="7" stroke-width="${i === v ? 1.6 : 0.6}"/></g>` + tx(x + 103, y + 17, q[0], "middle", "t") + tx(x + 103, y + 31, q[1] ? "loud, raises an error" : "silent, runs on", "middle", "ts"); });
    s += tx(20, 172, name + ": " + (loud ? "raises an error" : "runs, with a wrong number, a leak or a slowdown"), null, "th");
    fig.innerHTML = svg(184, s) + ML.code(code, -1) + ML.term(out) + `<p class="note"><b>Fix.</b> ${fix}</p>`;
  };
  bind(ctl, "m12", i => { v = i; u(); }); u();
}},

{s: "13. With the agent", t: "Do it with the agent: a train.py that runs anywhere, resumes exactly and reports seeds honestly",
intu: String.raw`The lesson as project code. A <code>utils.py</code> with <code>seed_everything</code> and <code>get_device</code>, and a <code>train.py</code> that saves a full checkpoint every epoch, resumes from it, uses autocast when a GPU is present, accumulates the loss on the device, and times its steps correctly. The tests carry the lesson's claims: an interrupted and resumed run matches an uninterrupted one, two runs with the same seed match, a GPU checkpoint loads on the CPU, a wrapped <code>state_dict</code> loads after stripping the prefix, and the loss total carries no graph. A last command runs three seeds and prints the mean and standard deviation, the number your project report should quote.`,
eq: String.raw`\[ \texttt{train.py} \to \texttt{last.pt}, \ \texttt{best.pt} \to \texttt{pytest} \to \bar x \pm \text{SD over 3 seeds} \]`,
sym: [[String.raw`\(\texttt{seed\_everything}\)`, "HW10's function, called before anything random is built"], [String.raw`\(\texttt{get\_device}\)`, "cuda, then mps, then cpu"], [String.raw`\(\texttt{save\_checkpoint}\)`, "model, optimizer, scaler, epoch, generator state, config"], ["resume test", "6 + 6 epochs must equal 12 epochs"], ["seed report", "mean and SD of the validation metric over seeds"]],
how: ["Paste the command.", "Read <code>save_checkpoint</code>: does it store the optimizer and the generator state?", "Read the loop: <code>loss.detach()</code> on the device, one <code>.item()</code> per epoch.", "Run pytest, then the three-seed command.", "Quote the mean and SD in your report, not the best seed."],
say: String.raw`A training script that chooses its device in one place, seeds everything first, saves and restores full checkpoints, accumulates on the device and reports results over several seeds turns this lesson's habits into code that tests can hold to account.`,
num: String.raw`The resume test uses this lesson's 256 points and network and expects the resumed run to match the uninterrupted one within <b>10⁻⁶</b>, as on card 4, where both end at validation MSE 0.0920. The seed report over seeds 0, 1 and 2 of this lesson's dropout network should print a mean near 0.14 with an SD of a few hundredths, the size of the spread on card 6.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/utils.py with seed_everything(seed) (random, numpy, torch, cuda, cudnn.benchmark False, cudnn.deterministic True) and get_device() (cuda, then mps, then cpu). Create src/train.py with train(config) that: calls seed_everything(config.seed) before building data or model, moves the model to get_device() and every batch with x = x.to(device), builds the training DataLoader with its own seeded torch.Generator, uses torch.autocast and torch.amp.GradScaler only when the device is cuda, accumulates the epoch loss as loss.detach() * len(y) on the device and calls .item() once per epoch, after every epoch saves last.pt with model, optimizer, scaler, epoch, generator state and config, and best.pt when validation improves, and resumes from last.pt when config.resume is set, restoring all of them, loading with map_location=device and weights_only=True. Create tests/test_train.py on 256 synthetic points with inputs a and b and target sin(1.5 a) + 0.5 b plus noise with a 2-16-1 Tanh network and Adam lr 0.01, batch 32: (1) 12 epochs straight and 6 epochs, stop, resume, 6 more give the same final validation MSE within 1e-6, (2) two runs with the same seed give identical state_dicts, (3) a checkpoint whose tensors were saved on another device loads with map_location='cpu', (4) a state_dict with every key prefixed by module. loads after stripping the prefix and load_state_dict reports all keys matched, (5) the returned epoch loss is a Python float, not a tensor with grad_fn. Add scripts/seeds.py that trains with seeds 0, 1, 2 and prints the mean and sample standard deviation of the best validation loss. Run pytest and the seeds script and show me both outputs.",
    actions: ["$ pytest -q tests/test_train.py", ".....                                                    [100%]", "5 passed in 6.41s", "$ python scripts/seeds.py", "seed 0: 0.1537  seed 1: 0.1265  seed 2: 0.1509", "best validation MSE 0.1437 ± 0.0150 (mean ± SD over 3 seeds)"],
    files: [["src/utils.py", "seed_everything, get_device"], ["src/train.py", "train(config), save and load checkpoints, AMP on cuda only"], ["tests/test_train.py", "resume, same seed, map_location, module. prefix, float loss"], ["scripts/seeds.py", "the three-seed report"]],
    checks: ["seed_everything runs before the first random object is built", "the checkpoint holds optimizer and generator state, not only the model", "torch.load uses map_location and weights_only=True", "the loop accumulates loss.detach() and calls .item() once per epoch", "the resume test compares to 1e-6, not with ==", "the report quotes a mean and SD over seeds"]
  });
}},

{s: "14. Test", t: "Lesson 26 test: pro PyTorch",
intu: String.raw`Twelve questions on devices, the GPU queue, memory, checkpoints, loading, seeds, number formats, mixed precision and timing. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper first.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to PyTorch Lightning.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A model has 30 million parameters and is trained in float32 with Adam. About how much device memory do the weights, gradients and Adam state take together, before activations?", o: ["120 MB", "240 MB", "480 MB", "360 MB"], a: 2, why: "4 + 4 + 8 = 16 bytes per parameter, 16 × 30 million = 480 MB. Card 3." },
    { q: "Activations take 40 MB per example and the fixed part is 200 MB. Ignoring the CUDA context, what is the largest batch that fits on a 16 GB card?", o: ["about 395", "400", "about 320", "256"], a: 0, why: "(16,000 − 200) / 40 = 395. The CUDA context and the allocator cache make the real limit somewhat lower. Card 3." },
    { q: "Which loop line moves the batch correctly?", o: ["<code>x.to(DEVICE)</code>", "<code>x = x.to(DEVICE)</code>", "<code>model.to(x)</code>", "<code>x.cuda</code>"], a: 1, why: "Tensor.to returns a new tensor and leaves x where it was, so the result must be assigned. Card 1 and card 12." },
    { q: "On a GPU, each step costs c = 3 ms of Python and g = 9 ms of GPU work. With <code>.item()</code> every step, about how long do 200 steps take, and with one <code>.item()</code> per epoch?", o: ["2.4 s and 2.4 s", "1.8 s and 0.6 s", "2.4 s and about 1.8 s", "1.8 s and 2.4 s"], a: 2, why: "Every step: 200 × (3 + 9) = 2,400 ms. Once per epoch the CPU runs ahead and the GPU sets the pace: 3 + 200 × 9 = 1,803 ms. Card 2." },
    { q: "Training with Adam is interrupted after epoch 5. The script restarts with <code>model.load_state_dict(ckpt['model'])</code> and a new optimizer. What is lost?", o: ["nothing, Adam has no state", "only the learning rate", "the model's buffers", "Adam's moment estimates and step count, so the next updates differ"], a: 3, why: "A fresh Adam starts with zero moments and step 0, and its first update moves every weight by about the learning rate. Save and load optimizer.state_dict() too. Card 4." },
    { q: "Loading prints Missing keys \"fc.weight\", \"fc.bias\" and Unexpected keys \"module.fc.weight\", \"module.fc.bias\". What happened?", o: ["the model was saved from a DataParallel or DDP wrapper", "the file is corrupted", "the layer sizes differ", "the file was saved on a GPU"], a: 0, why: "The wrappers prefix every key with module. Strip it with k.removeprefix('module.'). Card 5." },
    { q: "Which order makes the initial weights repeat from run to run?", o: ["build the model, then <code>torch.manual_seed(0)</code>", "<code>np.random.seed(0)</code>, then build the model", "<code>torch.manual_seed(0)</code>, then build the model", "any order, the seed applies to the whole script"], a: 2, why: "The seed sets the start of the stream, and the layers draw from it when they are built. NumPy's seed does not affect torch. Cards 6 and 7." },
    { q: "What does <code>torch.tensor(4097.).half()</code> store?", o: ["4097", "4096", "4098", "inf"], a: 1, why: "Between 4,096 and 8,192 float16 values are 4 apart, so 4,097 rounds to 4,096. Card 9." },
    { q: "A gradient entry of 1.5 × 10⁻⁸ is stored in float16. What happens without loss scaling, and with a scale of 65,536?", o: ["0, and about 9.8 × 10⁻⁴", "1.5 × 10⁻⁸ in both cases", "inf, and 0", "about 6 × 10⁻⁸, and inf"], a: 0, why: "It is below half the smallest float16 subnormal, 5.96 × 10⁻⁸, so it becomes 0. Scaled it is 9.8 × 10⁻⁴, a normal float16. Cards 9 and 10." },
    { q: "The GradScaler's scale is 32,768 and this step's scaled gradients contain an inf. What does <code>scaler.step</code> and <code>scaler.update</code> do?", o: ["step with the inf, then double the scale", "skip the step and set the scale to 16,384", "step anyway and keep the scale", "raise an error"], a: 1, why: "An inf skips the optimizer step and halves the scale. The scale grows again after 2,000 clean steps. Card 10." },
    { q: "A loop does <code>total += loss</code> with the loss tensor. What is wrong?", o: ["nothing", "the total is wrong by a factor B", "it raises a TypeError", "each step's graph stays alive, so memory grows during the epoch"], a: 3, why: "total gets a grad_fn and references every loss and its graph. Use loss.item() or loss.detach(). Card 12." },
    { q: "Two runs with the same seed on a GPU agree to six digits but not bit for bit. What is the most likely cause?", o: ["a bug in the seed function", "nondeterministic parallel reductions that sum in a different order", "the DataLoader shuffled differently", "float16 overflow"], a: 1, why: "Floating point addition depends on order. Deterministic algorithms remove it, otherwise compare with a tolerance. Card 8." }
  ], "Lesson 26 test");
}}
],
summary: String.raw`One line chooses the device, the model moves once in place and every batch is copied and reassigned inside the loop. GPU calls only fill a queue, so item, cpu, printing and branching on tensors make the CPU wait, and timers need synchronize. Training memory is about sixteen bytes per parameter with Adam plus activations proportional to the batch. A checkpoint for resuming holds the model, the optimizer with its moments and step count, the epoch and the generator state, it is saved as state dicts and loaded with weights only and a map location, and the key lists explain every failed load. A run draws randomness for the split, the weights, the batch order and dropout, so all libraries are seeded first, loaders get their own generators, and results are reported as a mean and spread over seeds. Floating point sums depend on order, so same-seed runs on a GPU agree only within a tolerance unless deterministic algorithms are on. Mixed precision runs matrix products in sixteen bits, keeps sensitive work in float32, and with float16 scales the loss so small gradients survive. Measure before optimizing.`,
sheet: [[String.raw`\[ M \approx (8 + s) P + B a, \quad s \in \{0, 4, 8\} \]`, "training memory, SGD, momentum, Adam"], [String.raw`\[ t = \tfrac{K}{s_{\text{sync}}} \max(s_{\text{sync}} c + g,\; c + s_{\text{sync}} g) \]`, "epoch time with a sync every s steps"], [String.raw`\[ \text{ckpt} = (\theta, m, v, t, \text{generator}, \text{epoch}) \]`, "what a resumable checkpoint holds"], [String.raw`\[ \text{float16: max } 65504, \ \varepsilon = 2^{-10}, \ \text{tiny} = 2^{-14} \]`, "float16 limits"], [String.raw`\[ \text{bfloat16: max} \approx 3.4 \times 10^{38}, \ \varepsilon = 2^{-7} \]`, "bfloat16 limits"], [String.raw`\[ g = \nabla(S L) / S \]`, "loss scaling"], [String.raw`\[ S \leftarrow S / 2 \text{ on inf}, \quad S \leftarrow 2 S \text{ after 2000 clean steps} \]`, "GradScaler update"], [String.raw`\[ |\mathrm{fl}(x) - x| \le \tfrac{\varepsilon}{2} |x| \]`, "rounding error"]],
sources: ["AME 5970 Lecture 4 notes (OOP and PyTorch), topic order only, the PDF was not available to this build", "AME 5970 HW6 setup cell and 1.4 (DEVICE_NAME, seed_everything, torch.set_num_threads, seeded generators, the deepcopy checkpoint) with the HW6 solutions doc", "AME 5970 HW8 setup cell, 1D (torch.random.fork_rng) and 2C (deepcopy of the best state) with the HW8 solutions doc", "AME 5970 HW9 setup cell (seed_everything with cudnn.benchmark False) with the HW9 solutions doc", "AME 5970 HW10 setup cell (DEVICE, seed_everything with the cuDNN flags, make_loader with a seeded generator), run_epoch, collect_predictions, the data-source fallback and the paired seeds of C3 and D3, with the HW10 solutions doc", "Andrew Ng, Deep Learning Specialization, course 2 (setting up an efficient iteration loop, mini-batch training) and course 3 (single number evaluation, comparing runs)", "PyTorch documentation: CUDA semantics (asynchronous execution, synchronization, memory management), Reproducibility, Saving and loading models (state_dict, map_location, weights_only), Automatic mixed precision (torch.autocast op lists, GradScaler), torch.profiler", "Stanford CS231n, notes on training neural networks and the PyTorch tutorial", "Raschka, Liu and Mirjalili (2022), Machine Learning with PyTorch and Scikit-Learn, chapters 12 and 13 (devices, saving and loading)", "Micikevicius et al. (2018), Mixed Precision Training, ICLR (loss scaling and float32 master weights)"]
});
})();
