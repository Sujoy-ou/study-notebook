(function () {
/* ML shelf, Part 2, Lesson 9: NumPy for ML. Follows AME 5970 HW2 Part 2 (exercises 3 to 7), HW1 Part 2 (exercises 3 to 5) and the HW2 learning guide sections 15 to 20. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const key = (i, j) => i + "," + j;
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const std = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };

addLesson("ml", "py", {
level: "Core", num: "Lesson 9",
id: "ml-py-l9", title: "NumPy for ML", short: "9. NumPy for ML",
big: String.raw`Lesson 8 gave you the array. This lesson gives you the six operations that every model in the course is built from. Broadcasting applies one vector of offsets to every row without copying. Boolean masks turn a data quality rule into a filter or a replacement. Vectorization replaces an element loop with one array expression. Matrix multiplication turns a whole batch of predictions into <code>X @ w + b</code>. Residuals become a single mean squared error. Standardization rescales features using statistics from the training rows only. Each card runs the professor's own example from HW2 with the shapes drawn, and the last two cards turn them into the first real pipeline of your project.`,
bridge: String.raw`HW2 Part 2 exercises 3 to 7 are these six operations in order: broadcasting across sensors, masks, loops versus vectorization, matrix multiplication as batched prediction, and standardization with a constant column. The HW2 learning guide sections 15 to 20 are the text. Part 4 of the shelf reuses every one of these in linear regression.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Broadcasting", t: "Broadcasting: align shapes from the right",
intu: String.raw`Two arrays of different shapes can be combined if, comparing their shapes from the right, every pair of dimensions is equal or one of them is 1. A dimension of 1 is stretched to match. A missing leading dimension counts as 1. Pick two shapes and see the rule applied pair by pair. The common ML case is (n, p) with (p,): one row of per-feature values is reused for every sample. The common error is (n, p) with (n,): the trailing dimensions p and n conflict, and the fix is to make the second one (n, 1).`,
eq: String.raw`\[ (n, p) \circ (p,) \to (n, p), \qquad (n, p) \circ (n, 1) \to (n, p), \qquad (n, p) \circ (n,) \to \text{error if } n \neq p \]`,
sym: [["right alignment", "compare the last dimensions first, then move left"], ["compatible pair", "equal, or one of them is 1"], ["stretch", "a length-1 dimension is reused along the other array's length, without copying"], ["missing dimension", "treated as 1 on the left"], ["result shape", "the larger of each pair"]],
how: ["Write the two shapes right-aligned.", "Compare each column: equal passes, a 1 stretches, anything else is an error.", "The result takes the larger of each pair, plus any leading dimensions.", "A (p,) vector against (n, p) acts as one row repeated down.", "A (n,) vector against (n, p) fails. Reshape it to (n, 1) or use keepdims when reducing."],
say: String.raw`Broadcasting compares shapes from the right, stretches any dimension of length one, and errors where two dimensions differ and neither is one.`,
num: String.raw`The HW2 guide's practice: <b>(6, 1, 4) + (3, 4)</b> gives <b>(6, 3, 4)</b>. The 1 stretches to 3 and the missing leading dimension of the second array becomes 1 and stretches to 6.`,
r(fig, ctl) {
  const P = [["(4, 3) and (3,)", [4, 3], [3]], ["(4, 3) and (1, 3)", [4, 3], [1, 3]], ["(4, 3) and (4, 1)", [4, 3], [4, 1]], ["(4, 3) and (4,)", [4, 3], [4]], ["(2, 4, 3) and (3,)", [2, 4, 3], [3]], ["(6, 1, 4) and (3, 4)", [6, 1, 4], [3, 4]], ["(5, 1) and (1, 7)", [5, 1], [1, 7]]];
  let k = 0;
  ctl.innerHTML = btns(P.map((p, i) => [i, p[0]]), "k") + `<div id="bc"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const [_, A, B] = P[k], L = Math.max(A.length, B.length), a = Array(L - A.length).fill(null).concat(A), b = Array(L - B.length).fill(null).concat(B);
    let s = tx(130, 30, "A", "end", "th") + tx(130, 80, "B", "end", "th") + tx(130, 140, "result", "end", "th"); let ok = true; const res = [];
    for (let i = 0; i < L; i++) {
      const x = 170 + i * 110, av = a[i], bv = b[i];
      const pass = av == null || bv == null || av === bv || av === 1 || bv === 1;
      const r = av == null ? bv : bv == null ? av : av === 1 ? bv : bv === 1 ? av : av === bv ? av : "✗";
      if (!pass) ok = false; res.push(r);
      s += `<rect x="${x}" y="10" width="90" height="30" rx="5" fill="${av == null ? "var(--sunk)" : "var(--blue-bg)"}" stroke="${av == null ? "var(--line)" : C.blue}" ${av == null ? 'stroke-dasharray="3 3"' : ""}/>` + tx(x + 45, 30, av == null ? "(1)" : av, "middle", "t");
      s += `<rect x="${x}" y="60" width="90" height="30" rx="5" fill="${bv == null ? "var(--sunk)" : "var(--blue-bg)"}" stroke="${bv == null ? "var(--line)" : C.blue}" ${bv == null ? 'stroke-dasharray="3 3"' : ""}/>` + tx(x + 45, 80, bv == null ? "(1)" : bv, "middle", "t");
      s += tx(x + 45, 110, pass ? (av === bv ? "equal" : av == null || bv == null ? "missing → 1, stretch" : "1 stretches") : "conflict", "middle");
      s += `<rect x="${x}" y="120" width="90" height="30" rx="5" fill="${pass ? "var(--teal-bg)" : "var(--coral-bg)"}" stroke="${pass ? C.teal : C.coral}"/>` + tx(x + 45, 140, r, "middle", "th");
    }
    s += tx(340, 178, ok ? "compatible: result shape (" + res.join(", ") + (res.length === 1 ? "," : "") + ")" : "ValueError: operands could not be broadcast together", "middle", "th");
    fig.innerHTML = svg(190, s) + ML.code([`A = np.ones((${A.join(", ")}${A.length === 1 ? "," : ""}))`, `B = np.ones((${B.join(", ")}${B.length === 1 ? "," : ""}))`, "print((A + B).shape)"], 2) + ML.term([ok ? "(" + res.join(", ") + (res.length === 1 ? "," : "") + ")" : `ValueError: operands could not be broadcast together with shapes (${A.join(",")}${A.length === 1 ? "," : ""}) (${B.join(",")}${B.length === 1 ? "," : ""})`]);
    $("bc").innerHTML = `<p class="note">${k === 3 ? "<b>The classic error.</b> A per-sample vector of length 4 against 4 rows of 3 features: the trailing 3 and 4 conflict. Reshape the vector to (4, 1) so it aligns with the rows." : k === 0 ? "<b>The classic success.</b> One value per feature, reused for every row." : k === 2 ? "A column vector: one value per row, reused across the columns. This is what keepdims produces." : "Read the table left to right after aligning on the right."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "2. Offsets and centering", t: "Sensor offsets across rows, and centering across columns",
intu: String.raw`The HW2 example: four batches of readings from three sensors, and one calibration offset per sensor. Subtracting the (3,) offsets from the (4, 3) readings corrects every row at once. Centering each sensor column uses <code>mean(axis=0)</code>, shape (3,), which broadcasts the same way. Centering each batch row needs one value per row, and that is where <code>keepdims=True</code> earns its keep: the (4, 1) column aligns with the rows. Click each operation to see the shapes and the cells it touches.`,
eq: String.raw`\[ R - o: (4, 3) - (3,) \qquad R - \bar{R}_{\text{col}}: (4, 3) - (3,) \qquad R - \bar{R}_{\text{row}}: (4, 3) - (4, 1) \]`,
sym: [["R", "readings, 4 batches by 3 sensors"], ["o", "offsets, one per sensor, shape (3,)"], ["mean(axis=0)", "one mean per sensor column, shape (3,)"], ["mean(axis=1, keepdims=True)", "one mean per batch row, shape (4, 1)"], ["centered", "mean zero along the axis that was reduced"]],
how: ["R − o: the offset row is reused for each of the 4 rows.", "Column centering: subtract the (3,) column means. Each column's mean is now 0.", "Row centering: the row means have shape (4,) without keepdims, which cannot align with (4, 3). With keepdims they are (4, 1) and stretch across the columns.", "After row centering, each row's mean is 0.", "Standardization in card 7 is column centering followed by division by the column standard deviation."],
say: String.raw`Per-feature values broadcast as a row over every sample, per-sample values must be a column to broadcast over every feature, and keepdims is how a reduction keeps that column shape.`,
num: String.raw`First row of readings <b>[10.2, 10.8, 9.9]</b> minus offsets <b>[0.2, −0.1, 0.3]</b> is <b>[10.0, 10.9, 9.6]</b>.`,
note: String.raw`HW2 Exercise 3 asks you to write the shape of each result before running. The row-centering step is the one that fails without keepdims, and that is the point of the exercise.`,
r(fig, ctl) {
  const R = [[10.2, 10.8, 9.9], [10.5, 11.0, 10.1], [10.1, 10.7, 9.8], [10.4, 10.9, 10.0]], o = [0.2, -0.1, 0.3];
  const corr = R.map(r => r.map((v, j) => v - o[j]));
  const cm = [0, 1, 2].map(j => mean(corr.map(r => r[j]))), rm = corr.map(r => mean(r));
  const OPS = [["corrected = readings - offsets", corr, "(4, 3) − (3,) → (4, 3)", "o", [0.2, -0.1, 0.3]], ["sensor_centered = corrected - corrected.mean(axis=0)", corr.map(r => r.map((v, j) => v - cm[j])), "(4, 3) − (3,) → (4, 3)", "col", cm], ["batch_centered = corrected - corrected.mean(axis=1, keepdims=True)", corr.map((r, i) => r.map(v => v - rm[i])), "(4, 3) − (4, 1) → (4, 3)", "row", rm], ["corrected - corrected.mean(axis=1)   # no keepdims", null, "(4, 3) − (4,) → error", "err", rm]];
  let k = 0;
  ctl.innerHTML = btns(OPS.map((x, i) => [i, ["subtract offsets", "center columns", "center rows (keepdims)", "center rows, no keepdims"][i]]), "k") + `<div id="oc"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const op = OPS[k];
    const g1 = ML.grid(k === 0 ? R : corr, { x: 40, y: 36, cell: 48, dec: 1, title: k === 0 ? "readings" : "corrected", colLab: ["s0", "s1", "s2"] });
    let s = g1.s;
    if (op[3] === "o" || op[3] === "col") { s += tx(40 + 72, 262, "−", "end", "th"); op[4].forEach((v, j) => s += `<rect x="${40 + j * 48}" y="246" width="45" height="30" rx="5" fill="var(--amber-bg, #f3e6cc)" stroke="${C.amber}"/>` + tx(40 + j * 48 + 22, 266, (+v).toFixed(2), "middle", "t")); s += tx(200, 266, "shape (3,), reused for every row", null); }
    else { op[4].forEach((v, i) => s += `<rect x="200" y="${36 + i * 48}" width="56" height="45" rx="5" fill="${op[3] === "err" ? "var(--coral-bg)" : "var(--amber-bg, #f3e6cc)"}" stroke="${op[3] === "err" ? C.coral : C.amber}"/>` + tx(228, 36 + i * 48 + 27, v.toFixed(2), "middle", "t")); s += tx(270, 60, op[3] === "err" ? "shape (4,): aligns with the 3 columns, not the 4 rows" : "shape (4, 1): one value per row, stretched across columns", null); }
    if (op[1]) { const g2 = ML.grid(op[1], { x: 380, y: 36, cell: 48, dec: 2, title: "result", colLab: ["s0", "s1", "s2"] }); s += g2.s; s += arrow(330, 130, 372, 130, C.teal, 2); }
    else s += `<rect x="380" y="80" width="260" height="60" rx="8" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(510, 105, "ValueError", "middle", "th") + tx(510, 125, "shapes (4,3) and (4,) conflict", "middle");
    fig.innerHTML = svg(290, s) + ML.code(["readings = np.array([[10.2, 10.8, 9.9], [10.5, 11.0, 10.1], [10.1, 10.7, 9.8], [10.4, 10.9, 10.0]])", "offsets = np.array([0.2, -0.1, 0.3])", op[0]], 2);
    $("oc").innerHTML = ML.readout([["shapes", op[2]], ["check", k === 1 ? "column means now 0" : k === 2 ? "row means now 0" : k === 0 ? "first row [10.0, 10.9, 9.6]" : "fix: keepdims=True or reshape(4, 1)"]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "3. Masks", t: "Boolean masks: a data rule you can see",
intu: String.raw`A mask is a bool array the same shape as the data, True where a rule holds. Build it from comparisons joined with <code>&</code>, <code>|</code> and <code>~</code>, each comparison in parentheses. Then either filter, which keeps only the True positions and changes the length, or replace with <code>np.where</code>, which keeps the shape. Change the rule's bounds and watch the mask, the filtered array and the imputed array. Keep the mask: later analysis needs to know which values were observed and which were replaced.`,
eq: String.raw`\[ m = \text{isfinite}(x) \land (x \ge 0) \land (x \le 500), \qquad x[m] \to \text{fewer}, \qquad \text{where}(m, x, v) \to \text{same shape} \]`,
sym: [["mask", "bool array, same shape as the data"], ["& | ~", "elementwise and, or, not. Python's and, or do not work on arrays."], ["x[mask]", "filter: the True positions only, a copy with fewer elements"], ["np.where(mask, x, v)", "replace: x where True, v where False, shape kept"], ["np.isfinite", "False for nan and inf"], ["mask.sum()", "how many values pass"]],
how: ["Write each condition in parentheses and join with &.", "Filtering shrinks the array. Use it when invalid rows should be dropped.", "Replacing keeps the shape. Use it when positions matter, such as a time series.", "The replacement value, often the mean of the valid values, is not neutral: it shrinks the variance. Keep the mask so the replacement can be audited.", "A mask on a 2D feature matrix usually selects rows: <code>X[mask]</code> with mask of shape (n,)."],
say: String.raw`A Boolean mask records where a rule holds, filtering keeps only those positions and replacing keeps the shape, and the mask itself should be kept for later audit.`,
num: String.raw`HW2's hardness array <code>[312, nan, 298, 510, −5, 333, inf, 305]</code>: <b>4 valid</b>, mean <b>312.0</b>, and the imputed array still has <b>8</b> entries.`,
r(fig, ctl) {
  const x = [312, NaN, 298, 510, -5, 333, Infinity, 305];
  ctl.innerHTML = sl("lo", "lower bound", -50, 300, 5, 0) + sl("hi", "upper bound", 300, 600, 5, 500) + `<div id="mk"></div>`;
  const u = () => {
    const lo = +$("lo").value, hi = +$("hi").value; $("lov").textContent = lo; $("hiv").textContent = hi;
    const m = x.map(v => isFinite(v) && v >= lo && v <= hi), clean = x.filter((v, i) => m[i]), rep = clean.length ? mean(clean) : 0, imp = x.map((v, i) => m[i] ? v : rep);
    const fmtv = v => Number.isNaN(v) ? "nan" : v === Infinity ? "inf" : v;
    let s = "";
    const row = (lab, a, y, hl) => { s += tx(20, y + 24, lab, null, "th"); a.forEach((v, j) => { s += `<rect x="${110 + j * 66}" y="${y}" width="60" height="38" rx="5" fill="${hl ? (hl[j] ? "var(--teal-bg)" : "var(--coral-bg)") : "var(--sunk)"}" stroke="${hl ? (hl[j] ? C.teal : C.coral) : "var(--line)"}"/>` + tx(140 + j * 66, y + 24, typeof v === "boolean" ? (v ? "T" : "F") : typeof v === "number" && !Number.isInteger(v) && isFinite(v) ? v.toFixed(1) : fmtv(v), "middle", "t"); }); };
    row("hardness", x, 10);
    row("mask", m, 60, m);
    row("filtered", clean.concat(Array(8 - clean.length).fill("")), 110, null);
    row("imputed", imp, 160, m);
    fig.innerHTML = svg(210, s) + ML.code(["hardness = np.array([312., np.nan, 298., 510., -5., 333., np.inf, 305.])", `valid = np.isfinite(hardness) & (hardness >= ${lo}) & (hardness <= ${hi})`, "clean = hardness[valid]", "imputed = np.where(valid, hardness, clean.mean())", "print(valid.sum(), clean.mean(), imputed.shape)"], 1) + ML.term([`${clean.length} ${clean.length ? rep.toFixed(1) : "nan"} (8,)`]);
    $("mk").innerHTML = ML.readout([["valid count", clean.length], ["filtered shape", `(${clean.length},)`], ["imputed shape", "(8,)"], ["replacement value", clean.length ? rep.toFixed(1) : "none"]]);
  };
  $("lo").oninput = u; $("hi").oninput = u; u();
}},

{s: "4. Vectorize", t: "Loops reveal mechanics, vectorization expresses intent",
intu: String.raw`An explicit loop shows what happens to each element. The vectorized expression says the same thing at the array level and runs the loop in compiled code. Click a task to see both versions and that they agree. Then run the timing: for a million elements the array version is typically a hundred times faster. Write the loop when you are learning what an operation does, and the vectorized form in the code you keep.`,
eq: String.raw`\[ \sum_i x_i^2 = \texttt{np.sum(x ** 2)}, \qquad \max_j X_{ij} = \texttt{X.max(axis=1)}, \qquad \#\{x_i \gt \bar{x}\} = \texttt{np.count\_nonzero(x} \gt \texttt{x.mean())} \]`,
sym: [["elementwise", "an operator on an array applies to every element"], ["ufunc", "np.sqrt, np.exp, np.abs and friends: elementwise functions"], ["reduction", "sum, max, prod, mean along an axis"], ["counting a mask", "<code>np.count_nonzero(mask)</code>, how many True"], ["np.nditer", "a loop over every element of any array, for learning"]],
how: ["State the goal: a sum of squares, a maximum per row, a count above the mean.", "Write the loop with an accumulator to see the mechanics.", "Replace it with the array expression: operator, then reduction along an axis.", "Assert the two agree on a small case before trusting the fast one.", "Keep a loop only when the operation is truly sequential, such as a recurrence."],
say: String.raw`Vectorized NumPy expresses an operation on whole arrays and runs the element loop in compiled code, and a short explicit loop is the way to verify what it computes.`,
num: String.raw`Sum of squares of 1 to 5 is <b>55</b> both ways. For a million floats the loop takes about <b>0.3 s</b>, the array expression about <b>3 ms</b>.`,
r(fig, ctl) {
  const T = [["sum of squares", ["total = 0", "for v in x:", "    total += v ** 2"], "np.sum(x ** 2)", "55"], ["max per row", ["maxes = []", "for row in M:", "    best = row[0]", "    for v in row[1:]:", "        if v > best: best = v", "    maxes.append(best)"], "M.max(axis=1)", "[3 6 9]"], ["product along axis 0", ["result = np.ones(M.shape[1])", "for row in M:", "    result = result * row"], "np.prod(M, axis=0)", "[ 28  80 162]"], ["count above mean", ["count = 0", "for v in np.nditer(M):", "    if v > M.mean(): count += 1"], "np.count_nonzero(M > M.mean())", "4"]];
  let k = 0;
  ctl.innerHTML = btns(T.map((t, i) => [i, t[0]]), "k") + `<div class="row"><button id="tm">time it on a million elements</button></div><div id="vt"></div>`;
  const u = () => { pick(ctl, "k", k); const t = T[k]; fig.innerHTML = ML.code(["x = np.array([1, 2, 3, 4, 5])", "M = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])"], -1) + `<p class="sec">loop</p>` + ML.code(t[1], -1) + `<p class="sec">vectorized</p>` + ML.code([t[2]], 0) + ML.term([t[3], "(both agree)"]); };
  $("tm").onclick = () => {
    const n = 1e6, arr = new Float64Array(n); for (let i = 0; i < n; i++) arr[i] = Math.random();
    let t0 = performance.now(); let s1 = 0; for (let i = 0; i < n; i++) s1 += arr[i] * arr[i]; const tLoop = performance.now() - t0;
    t0 = performance.now(); const s2 = arr.reduce((a, v) => a + v * v, 0); const tVec = performance.now() - t0;
    $("vt").innerHTML = ML.readout([["JS element loop (this browser)", tLoop.toFixed(1) + " ms"], ["JS typed-array reduce", tVec.toFixed(1) + " ms"], ["Python loop, typical", "about 300 ms"], ["np.sum(x ** 2), typical", "about 3 ms"]]) + `<p class="note">The browser numbers are an illustration. The Python column is the usual ratio: pure Python loops cost about a hundred times what NumPy costs for the same arithmetic.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "5. X @ w + b", t: "Matrix multiplication is a batch of predictions",
intu: String.raw`Each row of X is one sample with p features, and w holds one weight per feature. The dot product of a row with w is that sample's prediction, and <code>X @ w</code> does every row at once: (n, p) times (p,) gives (n,). Add a scalar bias and you have a linear model's predictions for the whole batch. Pick a row and watch its dot product form. <code>X * w</code> without the @ is different: it is the elementwise contribution of each feature, (n, p), which summed along axis 1 gives the same predictions.`,
eq: String.raw`\[ \hat{y} = X w + b, \qquad \hat{y}_i = \sum_{j=1}^{p} X_{ij} w_j + b, \qquad (n, p) @ (p,) \to (n,) \]`,
sym: [[String.raw`\(X\)`, "features, one row per sample, shape (n, p)"], [String.raw`\(w\)`, "weights, one per feature, shape (p,)"], [String.raw`\(b\)`, "bias, a scalar added to every prediction"], [String.raw`\(\hat{y}\)`, "predictions, shape (n,)"], ["X * w", "elementwise contributions, shape (n, p). Sum along axis 1 to get X @ w"], ["@", "matrix multiplication. The inner dimensions must match: p with p."]],
how: ["Check the shapes: the number of columns of X must equal the length of w.", "Row i of X dotted with w: multiply pairwise and add.", "Do it for every row: that is X @ w, one number per sample.", "Add b. Broadcasting adds the scalar to every entry.", "This is the forward pass of a linear model, and of each layer of a neural network, where w becomes a matrix and the output has many columns."],
say: String.raw`X at w computes every sample's weighted sum of features in one operation, the inner dimensions must match, and adding the bias broadcasts to every prediction.`,
num: String.raw`HW2's example: row <b>[1.0, 0.5, 2.0]</b> with w <b>[0.4, −0.2, 1.5]</b> and b 0.3 gives 0.4 − 0.1 + 3.0 + 0.3 = <b>3.6</b>.`,
note: String.raw`This exact calculation, a forward pass through nn.Linear by hand with MSE after it, is Question 2 on all three practice finals.`,
r(fig, ctl) {
  const X = [[1.0, 0.5, 2.0], [0.0, 1.5, 1.0], [2.0, 1.0, 0.5], [1.5, 0.0, 1.0]], w = [0.4, -0.2, 1.5], b = 0.3;
  let i = 0;
  ctl.innerHTML = sl("ri", "sample row i", 0, 3, 1, 0) + `<div id="mm"></div>`;
  const u = () => {
    i = +$("ri").value; $("riv").textContent = "row " + i;
    const hl = new Set([0, 1, 2].map(j => key(i, j)));
    const gX = ML.grid(X, { x: 40, y: 36, cell: 46, dec: 1, hl, title: "X (4, 3)" });
    const gw = ML.grid(w.map(v => [v]), { x: 230, y: 36, cell: 46, dec: 1, hl: new Set(["0,0", "1,0", "2,0"]), title: "w (3,)", colLab: false, rowLab: false });
    const yh = X.map(r => r.reduce((a, v, j) => a + v * w[j], 0) + b);
    const gy = ML.grid(yh.map(v => [v]), { x: 540, y: 36, cell: 46, dec: 2, hl: new Set([key(i, 0)]), title: "X @ w + b (4,)", colLab: false, rowLab: false });
    let s = gX.s + gw.s + gy.s + tx(212, 100, "@", "middle", "th") + tx(300, 70, "row " + i + " · w + b", null, "th");
    s += tx(300, 95, X[i].map((v, j) => `${v}×${w[j]}`).join(" + ") + " + 0.3", null, "t") + tx(300, 118, "= " + X[i].map((v, j) => (v * w[j]).toFixed(2)).join(" + ") + " + 0.3", null, "t") + tx(300, 141, "= " + yh[i].toFixed(2), null, "th") + arrow(470, 135, 530, 60 + i * 46, C.teal, 2);
    fig.innerHTML = svg(gX.h + 30, s) + ML.code(["X = np.array([[1.0, 0.5, 2.0], [0.0, 1.5, 1.0], [2.0, 1.0, 0.5], [1.5, 0.0, 1.0]])", "w = np.array([0.4, -0.2, 1.5]); b = 0.3", "contributions = X * w            # (4, 3), elementwise", "predictions = X @ w + b          # (4,)", "print(predictions)", "print(np.allclose(predictions, contributions.sum(axis=1) + b))"], 3) + ML.term(["[" + yh.map(v => v.toFixed(2)).join(" ") + "]", "True"]);
    $("mm").innerHTML = ML.readout([["X.shape", "(4, 3)"], ["w.shape", "(3,)"], ["(X @ w).shape", "(4,)"], ["(X * w).shape", "(4, 3)"]]);
  };
  $("ri").oninput = u; u();
}},

{s: "6. Residuals and MSE", t: "Residuals and mean squared error",
intu: String.raw`A residual is the gap between a target and its prediction. Squaring makes every gap positive and punishes large gaps more, and the mean turns n gaps into one number, the mean squared error. Drag the bias and watch the residuals shrink and grow together, and the MSE trace its bowl shape. The bowl is the whole idea of Part 4: learning means walking down it.`,
eq: String.raw`\[ r_i = y_i - \hat{y}_i, \qquad \mathrm{MSE} = \frac{1}{n} \sum_{i=1}^{n} r_i^2 = \texttt{np.mean((y - y\_hat) ** 2)} \]`,
sym: [[String.raw`\(r_i\)`, "residual of sample i, observed minus predicted, in the target's unit"], [String.raw`\(\mathrm{MSE}\)`, "mean of the squared residuals, in the target's unit squared"], ["RMSE", "its square root, back in the target's unit"], ["sign convention", "state it: y − ŷ here. Squaring hides the sign, interpretation does not."], ["shape", "y and ŷ must both be (n,). A (n, 1) against (n,) broadcasts to (n, n) and gives a wrong, plausible number"]],
how: ["Compute predictions with X @ w + b.", "Subtract from the targets to get residuals, one per sample.", "Square elementwise, then mean. Three array operations, no loop.", "Check the shape of the residuals is (n,). If it is (n, n), a (n, 1) column met a (n,) vector.", "RMSE = sqrt(MSE) reports the typical error in the original unit."],
say: String.raw`The residual is observed minus predicted per sample, and the mean squared error averages the squared residuals into one number in the unit squared.`,
num: String.raw`HW2's targets <b>[3.5, 1.7, 1.5, 2.6]</b> against the predictions of card 5 give MSE <b>0.028125</b>, RMSE <b>0.168</b>.`,
note: String.raw`The (n, 1) versus (n,) broadcast is HW6 Problem 1.6 fragment A: a zero loss on zero data hid a (32, 32) error array. Assert equal shapes before any loss.`,
r(fig, ctl) {
  const X = [[1.0, 0.5, 2.0], [0.0, 1.5, 1.0], [2.0, 1.0, 0.5], [1.5, 0.0, 1.0]], w = [0.4, -0.2, 1.5], y = [3.5, 1.7, 1.5, 2.6];
  const base = X.map(r => r.reduce((a, v, j) => a + v * w[j], 0));
  ctl.innerHTML = sl("bb", "bias b", -1, 1.6, 0.02, 0.3) + `<div id="rm"></div>`;
  const u = () => {
    const b = +$("bb").value; $("bbv").textContent = b.toFixed(2);
    const yh = base.map(v => v + b), r = y.map((v, i) => v - yh[i]), mse = mean(r.map(v => v * v));
    const A = ML.axes(60, 20, 260, 180, { xmin: 0, xmax: 4, ymin: 0, ymax: 4.5, nx: 4, ny: 3, fx: v => Math.round(v), fy: v => v.toFixed(1), xl: "prediction ŷ", yl: "target y" });
    let s = A.s + ML.path([[A.X(0), A.Y(0)], [A.X(4), A.Y(4)]], C.gray, 1, "4 3");
    y.forEach((v, i) => { s += `<line x1="${A.X(yh[i])}" y1="${A.Y(v)}" x2="${A.X(yh[i])}" y2="${A.Y(yh[i])}" stroke="${C.coral}" stroke-width="2"/><circle cx="${A.X(yh[i])}" cy="${A.Y(v)}" r="5" fill="${C.blue}"/>`; });
    const B = ML.axes(400, 20, 240, 180, { xmin: -1, xmax: 1.6, ymin: 0, ymax: 1.2, nx: 2, ny: 3, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "bias b", yl: "MSE" });
    const bs = range(-1, 1.6, 80), ms = bs.map(bb => mean(y.map((v, i) => (v - base[i] - bb) ** 2)));
    s += B.s + ML.path(bs.map((bb, i) => [B.X(bb), B.Y(ms[i])]), C.blue, 2) + `<circle cx="${B.X(b)}" cy="${B.Y(mse)}" r="6" fill="${C.coral}"/>`;
    fig.innerHTML = svg(240, s) + ML.code(["predictions = X @ w + b", "residuals = targets - predictions      # (4,)", "mse = np.mean(residuals ** 2)", "print(residuals.round(3), mse.round(5))"], 2) + ML.term(["[" + r.map(v => v.toFixed(3)).join(" ") + "] " + mse.toFixed(5)]);
    $("rm").innerHTML = ML.readout([["MSE", mse.toFixed(5)], ["RMSE", Math.sqrt(mse).toFixed(4)], ["best b on this curve", "about " + (bs[ms.indexOf(Math.min(...ms))]).toFixed(2)]]);
  };
  $("bb").oninput = u; u();
}},

{s: "7. Standardize", t: "Standardize with training statistics only",
intu: String.raw`Features with different units and ranges are rescaled to mean 0 and standard deviation 1 so that no feature dominates by its scale. The statistics are computed along axis 0 from the training rows only and then applied unchanged to validation and test rows. Toggle the leak to see the professor's rule broken: fitting on all rows lets the test rows shape the transform. A constant column has zero standard deviation and would divide by zero, so it is mapped to zeros and flagged.`,
eq: String.raw`\[ Z = \frac{X - \mu_{\text{train}}}{\sigma_{\text{train}}}, \qquad \mu, \sigma = \texttt{X\_train.mean(axis=0)},\ \texttt{X\_train.std(axis=0)} \in \mathbb{R}^{p} \]`,
sym: [[String.raw`\(\mu_{\text{train}}, \sigma_{\text{train}}\)`, "per-feature mean and population standard deviation of the training rows, shape (p,)"], ["training output", "<code>Z_train</code> has mean 0 and std 1 per column, by construction"], ["test output", "<code>Z_test</code> is transformed with the training statistics, so not exactly 0 and 1, and that is correct"], ["constant column", "std 0: replace the divisor by 1 and record the column"], ["leakage", "any statistic computed from rows outside the training split"]],
how: ["Split first. Then compute mean and std with axis=0 on <code>X_train</code> only.", "Guard the divisor: where std is 0, use 1 and remember the column.", "<code>Z_train</code> = (<code>X_train</code> − mean) / std. <code>Z_test</code> uses the same mean and std.", "Check: <code>Z_train</code> columns have mean 0 and std 1. <code>Z_test</code> columns need not.", "The same mean and std are applied to every future input, which is why they are part of the fitted model."],
say: String.raw`Standardization subtracts the per-feature mean and divides by the per-feature standard deviation, both learned from the training rows only and reused unchanged everywhere else.`,
num: String.raw`HW1's pipeline: 6 training rows and 2 test rows. <code>Z_train</code> has column means <b>0</b> and stds <b>1</b>. <code>Z_test</code>'s first column mean is <b>about 2.3</b>, because those rows sit above the training range, and that is the honest number.`,
note: String.raw`HW1 Exercise 5, HW2 Exercise 7 and HW3 Task 8.2 all grade this: training statistics only, and a constant column handled without producing nan.`,
r(fig, ctl) {
  const Xall = [[700, 30, 0.10], [710, 35, 0.12], [720, 40, 0.11], [730, 45, 0.15], [740, 50, 0.14], [750, 55, 0.16], [760, 60, 0.18], [770, 65, 0.20]];
  let leak = false, constant = false;
  ctl.innerHTML = btns([[0, "fit on training rows"], [1, "leak: fit on all rows"]], "l") + btns([[0, "3 varying features"], [1, "make feature 2 constant"]], "c") + `<div id="sz"></div>`;
  const u = () => {
    pick(ctl, "l", leak ? 1 : 0); pick(ctl, "c", constant ? 1 : 0);
    const X = Xall.map(r => constant ? [r[0], 40, r[2]] : r.slice());
    const tr = X.slice(0, 6), te = X.slice(6), fitOn = leak ? X : tr;
    const mu = [0, 1, 2].map(j => mean(fitOn.map(r => r[j]))), sd = [0, 1, 2].map(j => std(fitOn.map(r => r[j])));
    const safe = sd.map(v => v === 0 ? 1 : v), Z = r => r.map((v, j) => sd[j] === 0 ? 0 : (v - mu[j]) / safe[j]);
    const Ztr = tr.map(Z), Zte = te.map(Z);
    const g1 = ML.grid(X, { x: 40, y: 36, cell: 48, dec: 2, title: "X, rows 0 to 5 train, 6 to 7 test", hl2: new Set(["6,0", "6,1", "6,2", "7,0", "7,1", "7,2"]), fmt: (v) => Number.isInteger(v) ? v : v.toFixed(2) });
    const g2 = ML.grid(Ztr.concat(Zte), { x: 330, y: 36, cell: 48, dec: 2, title: "Z = (X − μ) / σ", hl2: new Set(["6,0", "6,1", "6,2", "7,0", "7,1", "7,2"]), hl: leak ? new Set() : new Set() });
    let s = g1.s + g2.s;
    s += tx(40, g1.h + 10, `μ fitted on ${leak ? "ALL 8 rows" : "6 training rows"}: [${mu.map(v => v.toFixed(2)).join(", ")}]`, null, leak ? "th" : "t") + tx(40, g1.h + 30, `σ: [${sd.map(v => v.toFixed(3)).join(", ")}]${constant ? "   column 1 is constant: divisor set to 1, output 0" : ""}`, null, "t");
    fig.innerHTML = svg(g1.h + 44, s) + ML.code(["X_train, X_test = X_all[:6].copy(), X_all[6:].copy()", `mean = ${leak ? "X_all" : "X_train"}.mean(axis=0)${leak ? "        # LEAK: test rows inside the statistic" : "      # training rows only"}`, `std = ${leak ? "X_all" : "X_train"}.std(axis=0)`, "constant = std == 0", "safe = np.where(constant, 1.0, std)", "Z_train = (X_train - mean) / safe", "Z_test = (X_test - mean) / safe        # same statistics"], leak ? 1 : 6) + ML.term([`Z_train col means ${[0, 1, 2].map(j => mean(Ztr.map(r => r[j])).toFixed(2)).join(" ")}`, `Z_train col stds  ${[0, 1, 2].map(j => std(Ztr.map(r => r[j])).toFixed(2)).join(" ")}`, `Z_test  col means ${[0, 1, 2].map(j => mean(Zte.map(r => r[j])).toFixed(2)).join(" ")}`]);
    $("sz").innerHTML = `<p class="note">${leak ? "<b>Leak.</b> The training columns no longer have mean 0 and std 1, and the test rows influenced the transform the model trains on. The evaluation is now optimistic." : "<b>Honest.</b> Training columns are exactly 0 and 1. Test columns are not, because they were transformed with values learned elsewhere, and that is what deployment looks like."}${constant ? " The constant column was mapped to zeros instead of nan and is flagged for removal." : ""}</p>`;
  };
  ctl.querySelectorAll("button[data-l]").forEach(b => b.onclick = () => { leak = b.dataset.l === "1"; u(); });
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { constant = b.dataset.c === "1"; u(); });
  u();
}},

{s: "8. Randomness", t: "Reproducible randomness: a seeded generator",
intu: String.raw`Random numbers are needed for splits, shuffles, initial weights and synthetic data, and every one of those must be repeatable so a result can be checked. <code>np.random.default_rng(seed)</code> makes a local generator: the same seed gives the same sequence, and separate generators do not interfere. Change the seed and watch the permutation and the integers change, then set it back and watch them return. The professor's notebooks seed every generator, and the agent's CLAUDE.md should demand the same.`,
eq: String.raw`\[ \texttt{rng = np.random.default\_rng(42)}, \quad \texttt{rng.permutation(n)}, \quad \texttt{rng.integers(1, 101, size=10)}, \quad \texttt{rng.normal(0, 1, size=(n, p))} \]`,
sym: [["the generator", "<code>default_rng(seed)</code>, a generator object with its own state"], ["permutation(n)", "a shuffled order of 0 to n − 1, used for a random split"], ["integers(lo, hi, size)", "random ints from lo up to but not including hi"], ["normal(mean, std, size)", "Gaussian samples, for noise and initial weights"], ["uniform(lo, hi, size)", "flat samples, for synthetic inputs"], ["legacy np.random.seed", "sets a hidden global state. Prefer a local generator."]],
how: ["Create one generator per purpose with a fixed seed.", "Use its methods, never the module-level functions, so nothing else can disturb the sequence.", "A split is a permutation of row indices cut at the training size.", "Record the seed with the results. A result without its seed cannot be reproduced.", "Different seeds give different splits. Reporting a result across several seeds shows how much it depends on the split."],
say: String.raw`A seeded local generator makes every random choice repeatable without touching global state, and a random split is a seeded permutation of the row indices.`,
num: String.raw`<code>default_rng(42).integers(1, 101, size=10)</code> begins <b>9, 78, 66, 44, 44</b>, the values HW1's check expects. Any other seed gives a different sequence.`,
r(fig, ctl) {
  /* a small deterministic PRNG for the demo, mimicking per-seed reproducibility */
  const mk = seed => { let s = (seed * 2654435761 + 12345) >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; };
  ctl.innerHTML = sl("sd", "seed", 0, 100, 1, 42) + `<div class="row"><button id="rs">run again with the same seed</button></div><div id="rn"></div>`;
  let runs = 0;
  const u = () => {
    const seed = +$("sd").value; $("sdv").textContent = seed; runs++;
    const r = mk(seed), perm = [0, 1, 2, 3, 4, 5, 6, 7]; for (let i = 7; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const ints = Array.from({ length: 6 }, () => 1 + Math.floor(r() * 100));
    let s = tx(20, 30, "permutation(8)", null, "th"); perm.forEach((v, j) => { s += `<rect x="${150 + j * 58}" y="12" width="52" height="30" rx="5" fill="${j < 6 ? "var(--teal-bg)" : "var(--coral-bg)"}" stroke="${j < 6 ? C.teal : C.coral}"/>` + tx(176 + j * 58, 32, v, "middle", "t"); });
    s += tx(150, 62, "first 6 → train, last 2 → test", null);
    s += tx(20, 100, "integers(1, 101, 6)", null, "th"); ints.forEach((v, j) => { s += `<rect x="${150 + j * 58}" y="82" width="52" height="30" rx="5" fill="var(--sunk)" stroke="var(--line)"/>` + tx(176 + j * 58, 102, v, "middle", "t"); });
    s += tx(20, 140, `run ${runs}, seed ${seed}: identical to every other run with seed ${seed}`, null);
    fig.innerHTML = svg(150, s) + ML.code([`rng = np.random.default_rng(${seed})`, "order = rng.permutation(8)", "train_idx, test_idx = order[:6], order[6:]", "values = rng.integers(1, 101, size=6)", "assert set(train_idx).isdisjoint(test_idx)"], -1) + `<p class="note">The picture uses a small browser generator, so the digits differ from NumPy's, but the property is the same: same seed, same sequence, every time.</p>`;
    $("rn").innerHTML = ML.readout([["train rows", perm.slice(0, 6).join(" ")], ["test rows", perm.slice(6).join(" ")], ["overlap", "none"]]);
  };
  $("sd").oninput = u; $("rs").onclick = u; u();
}},

{s: "9. With the agent", t: "Do it with the agent: the first honest pipeline",
intu: String.raw`Everything in this lesson in one script: a seeded split, standardization fitted on the training rows, a linear prediction with X @ w + b, residuals and MSE against the training-mean baseline. The weights are not learned yet, that is Part 4, but the pipeline around them is complete and leakage-free, and it is the skeleton the project's model will drop into.`,
eq: String.raw`\[ \text{seeded split} \to \mu, \sigma \text{ on train} \to Z \to \hat{y} = Z w + b \to \text{MSE vs baseline} \]`,
sym: [["split", "a seeded permutation cut at 80 %"], ["standardize", "fit on train, apply to both, constant columns guarded"], ["predict", "Z @ w + b with w and b given"], ["baseline", "predict the training mean of y for every row"]],
how: ["Paste the command.", "Read the split: is the generator seeded and local? Are the two index sets disjoint?", "Read the standardization: axis=0 on the training rows only, applied unchanged to test.", "Read the prediction: do the shapes work, (n, p) @ (p,) + scalar?", "Compare the two MSE values. The model is not trained, so it may lose to the baseline. That is a fact, not a bug."],
say: String.raw`A pipeline splits with a seed, learns its statistics from the training rows, applies them everywhere, predicts a whole batch with one matrix multiplication, and judges itself against a baseline.`,
num: String.raw`For the fruit table, <b>192 training and 48 test rows</b>, feature statistics of shape <b>(4,)</b>, residuals of shape <b>(48,)</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/pipeline.py using numpy only. Functions: split_indices(n, train_frac, seed) -> tuple[np.ndarray, np.ndarray] using np.random.default_rng(seed).permutation, asserting the two index arrays are disjoint and together cover range(n). fit_standardizer(X_train) -> tuple[mean, scale, constant_mask] with axis=0 statistics, population std, and scale set to 1.0 where std is 0. transform(X, mean, scale) that applies them without refitting. predict_linear(Z, w, b) returning Z @ w + b with an assertion that Z.shape[1] == w.shape[0]. mse(y, y_hat) asserting y.shape == y_hat.shape. Under the main guard: load X and y with load_xy from src/data.py (features mass_g, width_cm, height_cm, color, target mass_g itself is not allowed, use target color), split 80/20 with seed 42, standardize, predict with w = np.zeros(4) and b = y_train.mean(), and print the shapes of Z_train, Z_test, the residuals, and the test MSE of this model and of the training-mean baseline. Run it and paste the output.",
    actions: ["$ python src/pipeline.py", "Z_train (192, 4)  Z_test (48, 4)", "residuals (48,)", "test MSE model 0.0359  baseline 0.0359", "(w is zero, so the model equals the baseline for now)"],
    checks: ["the generator is created with default_rng(42) and used for the permutation", "mean and std are computed on X_train with axis=0 and have shape (4,)", "the test set is transformed with the training statistics, never refitted", "predict_linear asserts the inner dimensions match", "mse asserts equal shapes so a (48, 1) against (48,) cannot slip through"]
  });
}},

{s: "10. Test", t: "Test: NumPy for ML",
intu: String.raw`Twelve questions on broadcasting, masks, vectorization, batch prediction, MSE, standardization and seeds. Write the shapes first.`,
eq: String.raw`\[ \text{shapes} \to \text{operation} \to \text{result} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Right-align shapes for every broadcast question.", "Ask which rows the statistics came from.", "Ask what shape a residual vector should have."],
say: String.raw`I can broadcast, mask, vectorize, predict a batch with a matrix product, compute MSE, and standardize without leakage.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "readings has shape (4, 3) and offsets shape (3,). <code>readings - offsets</code> has shape:", o: ["(4, 3)", "(3,)", "(4,)", "Error"], a: 0, why: "Trailing dimensions 3 and 3 match, the missing leading dimension becomes 1 and stretches to 4." },
    { q: "corrected is (4, 3). <code>corrected - corrected.mean(axis=1)</code>:", o: ["Centers each row", "Raises, because (4,) does not align with (4, 3)", "Centers each column", "Returns (4, 1)"], a: 1, why: "The row means have shape (4,), whose trailing 4 conflicts with 3. keepdims=True gives (4, 1), which works." },
    { q: "Result shape of (6, 1, 4) + (3, 4)?", o: ["(6, 3, 4)", "(6, 1, 4)", "(3, 4)", "Error"], a: 0, why: "Right-aligned: 4 and 4 match, 1 stretches to 3, the missing leading dimension stretches to 6." },
    { q: "Which expression builds a valid mask for values that are finite and between 0 and 500?", o: ["np.isfinite(x) and x >= 0 and x <= 500", "np.isfinite(x) & (x >= 0) & (x <= 500)", "np.isfinite(x) & x >= 0 & x <= 500", "(x >= 0) | (x <= 500)"], a: 1, why: "Elementwise & with each comparison in parentheses. Python's and does not work on arrays, and & binds tighter than >=." },
    { q: "x has 8 values, 4 of them valid. <code>x[mask].shape</code> and <code>np.where(mask, x, 0).shape</code> are:", o: ["(4,) and (4,)", "(4,) and (8,)", "(8,) and (8,)", "(8,) and (4,)"], a: 1, why: "Filtering shrinks to the valid count, replacing keeps the original shape." },
    { q: "Which is the vectorized sum of squares of x?", o: ["sum(x) ** 2", "np.sum(x ** 2)", "x.sum(axis=1) ** 2", "np.sum(x) * np.sum(x)"], a: 1, why: "Square elementwise, then reduce. The other forms square the sum." },
    { q: "X is (4, 3) and w is (3,). <code>(X @ w).shape</code> and <code>(X * w).shape</code> are:", o: ["(4,) and (4, 3)", "(4, 3) and (4,)", "(3,) and (4, 3)", "(4,) and (4,)"], a: 0, why: "@ contracts the inner dimension to give one prediction per row. * is elementwise and keeps (4, 3)." },
    { q: "Row [1.0, 0.5, 2.0], w [0.4, −0.2, 1.5], b 0.3. The prediction is:", o: ["3.3", "3.6", "3.9", "2.1"], a: 1, why: "0.4 − 0.1 + 3.0 + 0.3 = 3.6." },
    { q: "targets is (32,) and predictions is (32, 1). <code>((targets - predictions) ** 2).mean()</code> computes:", o: ["The correct MSE", "A mean over a (32, 32) array of all pairs, a wrong but plausible number", "An error", "Zero"], a: 1, why: "(32,) against (32, 1) broadcasts to (32, 32). Assert equal shapes before any loss." },
    { q: "Where must the mean and std for standardization come from?", o: ["All rows", "The test rows", "The training rows only, then applied to all", "Each split separately"], a: 2, why: "Statistics from outside the training split leak information into the fitted pipeline." },
    { q: "After standardizing with training statistics, the test columns have mean:", o: ["Exactly 0", "Not necessarily 0, and that is correct", "Exactly 1", "nan"], a: 1, why: "They were transformed with values learned on different rows. Forcing them to 0 would be a leak." },
    { q: "A training column has standard deviation 0. The right handling is:", o: ["Divide anyway", "Replace the divisor by 1, output zeros, and flag the column", "Drop the row", "Use the test std instead"], a: 1, why: "Dividing by 0 gives nan or inf. A constant column carries no information and is mapped to zeros and reported." }
  ], "Lesson 9 test");
}}
],
summary: String.raw`Broadcasting compares shapes from the right and stretches length-one dimensions, so a per-feature vector applies to every row and a per-sample column, made with keepdims, applies to every column. A Boolean mask records a rule, filtering keeps the True positions and np.where keeps the shape, and the mask is kept for audit. Vectorized expressions replace element loops, with a small loop as the check. A linear model predicts a whole batch as X at w plus b, with the inner dimensions matching, and the residuals, squared and averaged, give the mean squared error. Standardization uses per-feature statistics from the training rows only, applied unchanged to everything else, with constant columns guarded. Every random choice comes from a seeded local generator so it can be reproduced.`,
sheet: [
[String.raw`\[ (n, p) \circ (p,) \to (n, p), \qquad (n, p) \circ (n, 1) \to (n, p) \]`, "Broadcasting, aligned from the right"],
[String.raw`\[ m = (x \ge a) \land (x \le b), \quad x[m], \quad \text{where}(m, x, v) \]`, "Mask, filter, replace"],
[String.raw`\[ \hat{y} = X w + b, \quad (n, p) @ (p,) \to (n,) \]`, "Batch prediction"],
[String.raw`\[ \mathrm{MSE} = \frac{1}{n} \sum_i (y_i - \hat{y}_i)^2 \]`, "Mean squared error"],
[String.raw`\[ Z = \frac{X - \mu_{\text{train}}}{\sigma_{\text{train}}}, \quad \mu, \sigma = \text{axis 0 of } X_{\text{train}} \]`, "Standardization without leakage"],
[String.raw`\[ \texttt{rng = default\_rng(seed)}, \quad \texttt{rng.permutation(n)} \]`, "Reproducible randomness"]],
sources: ["AME 5970 HW2 Part 2, exercises 3 to 7 (broadcasting, masks, loops versus vectorization, matrix multiplication as batched prediction, standardization with a constant column)", "AME 5970 HW1 Part 2, exercises 3 to 5 (vectorized math, masks and axes, the leakage-aware pipeline)", "AME 5970 HW2 learning guide, sections 15 to 21", "NumPy user guide: broadcasting, indexing with Boolean arrays, random Generator", "Andrew Ng, Machine Learning Specialization course 1 week 2 (vectorization, feature scaling)"]
});
})();
