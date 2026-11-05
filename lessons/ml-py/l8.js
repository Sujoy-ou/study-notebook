(function () {
/* ML shelf, Part 2, Lesson 8: NumPy arrays. Follows AME 5970 HW1 Part 2 (exercises 1 to 2) and the HW2 learning guide sections 11 to 14, with Lecture 4 chapter 3 (tensors and shape reasoning). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const key = (i, j) => i + "," + j;

addLesson("ml", "py", {
level: "Core", num: "Lesson 8",
id: "ml-py-l8", title: "NumPy arrays", short: "8. NumPy arrays",
big: String.raw`A dataset in this course is a rectangle of numbers: rows are samples, columns are features. NumPy's array is that rectangle as one object, with a shape, one data type for every entry, and operations that act on whole axes at once. The professor's rule for the whole course is shape first: before any array expression, write the shape of every input and of the result. This lesson builds the array model with a grid you can see: shape and dtype, indexing and slicing, the view-versus-copy question from Lesson 4 again but sharper, reshape as reinterpretation, and axes as the thing a reduction removes. PyTorch tensors follow the same rules, so this lesson is paid back twice.`,
bridge: String.raw`HW1 Part 2 and HW2 Part 2 are the professor's NumPy exercises, and the HW2 learning guide (sections 11 to 14) is the text this lesson follows. Lecture 4 chapter 3 repeats the same shape reasoning for tensors.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The array", t: "An array is values plus structure: shape, ndim, size, dtype",
intu: String.raw`An array stores values in a rectangle and carries metadata about the rectangle. <code>shape</code> is the length along each axis, <code>ndim</code> the number of axes, <code>size</code> the total count, <code>dtype</code> how each value is stored. Change the shape and watch the four numbers. For a feature matrix of shape (n, p), axis 0 runs down the samples and axis 1 across the features. A Python list is not an array: <code>values * 2</code> repeats a list and doubles an array.`,
eq: String.raw`\[ X \in \mathbb{R}^{n \times p}: \quad \texttt{X.shape} = (n, p), \quad \texttt{X.ndim} = 2, \quad \texttt{X.size} = np, \quad \texttt{X.dtype} = \texttt{float64} \]`,
sym: [["shape", "a tuple, the length of each axis, such as (4, 3)"], ["ndim", "how many axes, the length of the shape tuple"], ["size", "total number of elements, the product of the shape"], ["dtype", "the storage type of every element: float64, int64, bool"], ["axis 0, axis 1", "down the rows, across the columns"]],
how: ["<code>np.array([...], dtype=float)</code> builds an array and fixes its dtype. State it explicitly when fractions will appear later.", "<code>np.zeros((3, 3))</code>, <code>np.ones</code>, <code>np.full((2, 2), 7)</code>, <code>np.arange(0, 5, 0.5)</code> make arrays with a given shape or range.", "Every element has the same dtype. Putting one float into an int array converts the whole array.", "Read shape as a sentence: (4, 3) is four samples with three features each.", "A 1D array of shape (3,) is not a row (1, 3) or a column (3, 1). The difference matters for matrix multiplication and broadcasting."],
say: String.raw`An array is a rectangle of values with one dtype, and its shape names the length of every axis, with axis 0 down the samples and axis 1 across the features.`,
num: String.raw`<code>np.arange(0, 5, 0.5)</code> has <b>10</b> elements, shape (10,). Reshaped to (2, 5) it has the same 10 elements and <b>2</b> axes.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nr", "rows n", 1, 6, 1, 4) + sl("nc", "columns p", 1, 7, 1, 3) + btns([["f", "dtype float"], ["i", "dtype int"], ["b", "dtype bool"]], "d") + `<div id="ar"></div>`;
  let dt = "f";
  const u = () => {
    pick(ctl, "d", dt);
    const n = +$("nr").value, p = +$("nc").value; $("nrv").textContent = n; $("ncv").textContent = p;
    const rows = Array.from({ length: n }, (_, i) => Array.from({ length: p }, (_, j) => dt === "f" ? (700 + 25 * i + 10 * j) / 10 : dt === "i" ? i * p + j : (i + j) % 2 === 0));
    const g = ML.grid(rows, { axes: true, fmt: v => dt === "b" ? (v ? "T" : "F") : dt === "f" ? v.toFixed(1) : v });
    fig.innerHTML = svg(g.h + 10, g.s) + ML.code([`X = np.${dt === "f" ? "array([...], dtype=float)" : dt === "i" ? "arange(" + (n * p) + ").reshape(" + n + ", " + p + ")" : "array([...], dtype=bool)"}`, "print(X.shape, X.ndim, X.size, X.dtype)"], -1) + ML.term([`(${n}, ${p}) ${n === 1 && false ? 1 : 2} ${n * p} ${dt === "f" ? "float64" : dt === "i" ? "int64" : "bool"}`]);
    $("ar").innerHTML = ML.readout([["shape", `(${n}, ${p})`], ["ndim", 2], ["size", n * p], ["bytes", n * p * (dt === "b" ? 1 : 8)]]);
  };
  $("nr").oninput = u; $("nc").oninput = u; ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { dt = b.dataset.d; u(); }); u();
}},

{s: "2. Indexing", t: "Indexing and slicing in two dimensions",
intu: String.raw`One index per axis, separated by commas. <code>X[i, j]</code> is one value, <code>X[i, :]</code> is row i, <code>X[:, j]</code> is column j, <code>X[a:b, c:d]</code> is a block with the stops excluded, and negatives count from the end. Pick an expression and the selected cells light up with the result's shape. Notice which expressions drop an axis: a single integer index removes that axis, a slice keeps it even if it selects one element.`,
eq: String.raw`\[ \texttt{X[i, j]} \to \text{scalar}, \qquad \texttt{X[i, :]} \to (p,), \qquad \texttt{X[:, j]} \to (n,), \qquad \texttt{X[a:b, c:d]} \to (b-a,\ d-c) \]`,
sym: [["X[i, j]", "row i, column j, a scalar"], ["X[i] or X[i, :]", "row i as a 1D array of length p"], ["X[:, j]", "column j as a 1D array of length n"], ["X[:2, -2:]", "first two rows, last two columns"], ["X[::2]", "every second row"], ["integer vs slice", "an integer index drops the axis, a slice keeps it"]],
how: ["Count from 0 on each axis.", "A slice start:stop:step is the same as for strings: stop excluded, negatives from the end.", "<code>X[1]</code> and <code>X[1, :]</code> are the same row. The colon is implied for trailing axes.", "<code>X[1:2, :]</code> keeps the row axis with length 1, shape (1, p). <code>X[1, :]</code> drops it, shape (p,).", "<code>X[-1, -1]</code> is the bottom right corner."],
say: String.raw`A 2D array takes one index per axis, slices keep an axis while integers drop it, and the stop of every slice is excluded.`,
num: String.raw`For <code>image = np.arange(20).reshape(4, 5)</code>: <code>image[1, :]</code> is <b>[5, 6, 7, 8, 9]</b>, <code>image[:, 2]</code> is <b>[2, 7, 12, 17]</b>, <code>image[:2, -2:]</code> is <b>[[3, 4], [8, 9]]</b>.`,
note: String.raw`HW1 Part 2 Exercise 2 is exactly this grid: second row, third column, top right 2 by 2, and every third element of a line.`,
r(fig, ctl) {
  const X = Array.from({ length: 4 }, (_, i) => Array.from({ length: 5 }, (_, j) => i * 5 + j));
  const E = [["X[1, 2]", (i, j) => i === 1 && j === 2, "scalar", "7"], ["X[1, :]", (i, j) => i === 1, "(5,)", "[5 6 7 8 9]"], ["X[:, 2]", (i, j) => j === 2, "(4,)", "[ 2  7 12 17]"], ["X[:2, -2:]", (i, j) => i < 2 && j >= 3, "(2, 2)", "[[3 4]\n [8 9]]"], ["X[1:2, :]", (i, j) => i === 1, "(1, 5)", "[[5 6 7 8 9]]"], ["X[::2, ::2]", (i, j) => i % 2 === 0 && j % 2 === 0, "(2, 3)", "[[ 0  2  4]\n [10 12 14]]"], ["X[-1, -1]", (i, j) => i === 3 && j === 4, "scalar", "19"], ["X[1:3, 1:4]", (i, j) => i >= 1 && i < 3 && j >= 1 && j < 4, "(2, 3)", "[[ 6  7  8]\n [11 12 13]]"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${E.map((e, i) => `<button data-k="${i}"><code>${e[0]}</code></button>`).join("")}</div><div id="ix"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const e = E[k], hl = new Set();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) if (e[1](i, j)) hl.add(key(i, j));
    const g = ML.grid(X, { hl, axes: true, title: "X = np.arange(20).reshape(4, 5)" });
    fig.innerHTML = svg(g.h + 10, g.s) + ML.code(["X = np.arange(20).reshape(4, 5)", "print(" + e[0] + ")", "print(" + e[0] + ".shape)"], 1) + ML.term(e[3].split("\n").concat([e[2] === "scalar" ? "()" : e[2]]));
    $("ix").innerHTML = ML.readout([["selected", hl.size + " element" + (hl.size > 1 ? "s" : "")], ["result shape", e[2]], ["axes kept", e[2] === "scalar" ? "none, both indices were integers" : e[2].startsWith("(") && e[2].includes(",") && !e[2].endsWith(",)") ? "both, both were slices" : "one, the other index was an integer"]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "3. View or copy", t: "A slice is a view: it shares memory with the base",
intu: String.raw`This is Lesson 4's alias trap with a twist. A basic slice of an array does not copy the data. It is a view: a window onto the same memory. Write into the view and the base changes. <code>.copy()</code> makes independent storage. An arithmetic result such as <code>base * 2</code> is a new, derived array that does not update later. Step through the professor's three-way example and watch which arrays change. <code>np.shares_memory</code> answers the question when you are not sure.`,
eq: String.raw`\[ \texttt{view = base[1:3]} \to \text{shared}, \qquad \texttt{snap = base.copy()} \to \text{independent}, \qquad \texttt{derived = base * 2} \to \text{new values, frozen} \]`,
sym: [["view", "shares memory with the base. A write through either is seen by both."], ["copy", "owns its own memory"], ["derived array", "computed once. It does not recompute if the base changes."], ["memory check", "<code>np.shares_memory(a, b)</code> is True if the two arrays overlap in memory"], ["fancy indexing", "<code>X[[0, 2]]</code> and <code>X[mask]</code> always copy"]],
how: ["Line 2 makes a view of positions 1 and 2. No data was copied.", "Line 3 copies. Line 4 computes new values.", "Writing 99 into view[0] writes into base[1], because they are the same memory.", "The copy still shows 20. The derived array still shows 40, computed before the write.", "Reshape and transpose also give views when they can. A write into a reshaped array changes the original."],
say: String.raw`A basic slice of an array is a view that shares memory with the base, a copy owns independent memory, and a derived array holds values computed at that moment.`,
num: String.raw`After <code>view[0] = 99</code>: base is <b>[10, 99, 30, 40]</b>, snapshot <b>[10, 20, 30, 40]</b>, derived <b>[20, 40, 60, 80]</b>.`,
note: String.raw`HW2 Part 2 Exercise 1 has the same three arrays plus the correction the professor stresses: a Fahrenheit conversion is a derived array, not a view, and must be recomputed when Celsius changes.`,
r(fig, ctl) {
  const steps = [
    { ln: 0, base: [10, 20, 30, 40], view: null, snap: null, der: null, note: "the base array owns four floats" },
    { ln: 1, base: [10, 20, 30, 40], view: [20, 30], snap: null, der: null, note: "the view points into the base's memory at positions 1 and 2" },
    { ln: 3, base: [10, 20, 30, 40], view: [20, 30], snap: [10, 20, 30, 40], der: [20, 40, 60, 80], note: "the copy has its own memory, the derived array holds computed values" },
    { ln: 5, base: [10, 99, 30, 40], view: [99, 30], snap: [10, 20, 30, 40], der: [20, 40, 60, 80], note: "writing into the view wrote into the base. The copy and the derived array did not move." },
    { ln: 8, base: [10, 99, 30, 40], view: [99, 30], snap: [10, 20, 30, 40], der: [20, 40, 60, 80], note: "shares_memory confirms it: True, False, False" }
  ];
  const draw = k => {
    const st = steps[k];
    let s = "";
    const row = (lab, a, y, cls, hl) => { s += tx(20, y + 25, lab, null, "th"); if (!a) { s += tx(130, y + 25, "not created yet", null); return; } a.forEach((v, j) => { const on = hl && hl.includes(j); s += `<rect x="${130 + j * 60}" y="${y}" width="54" height="40" rx="5" fill="${on ? "var(--coral-bg)" : cls}" stroke="${on ? C.coral : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(157 + j * 60, y + 25, v, "middle", "t"); }); };
    row("base", st.base, 10, "var(--sunk)", k >= 3 ? [1] : []);
    if (st.view) { s += `<path d="M190 52 L190 70" stroke="${C.teal}" stroke-width="2" marker-end="url(#ar)"/><path d="M250 52 L250 70" stroke="${C.teal}" stroke-width="2" marker-end="url(#ar)"/>` + tx(320, 66, "view = base[1:3] shares these two cells", null); }
    row("view", st.view, 74, "var(--teal-bg)", k >= 3 ? [0] : []);
    row("snapshot", st.snap, 138, "var(--sunk)", []);
    row("derived", st.der, 202, "var(--blue-bg)", []);
    fig.innerHTML = svg(252, s) + ML.code(["base = np.array([10., 20., 30., 40.])", "view = base[1:3]", "", "snapshot = base.copy()", "derived = base * 2", "view[0] = 99", "print(base)", "print(snapshot, derived)", "print(np.shares_memory(view, base), np.shares_memory(snapshot, base), np.shares_memory(derived, base))"], st.ln) + ML.term(k >= 3 ? ["[10. 99. 30. 40.]", "[10. 20. 30. 40.] [20. 40. 60. 80.]"].concat(k >= 4 ? ["True False False"] : []) : ["(nothing printed yet)"]) + `<p class="note">${st.note}</p>`;
  };
  ML.stepper(ctl, steps.length, draw);
}},

{s: "4. Reshape", t: "Reshape changes the interpretation, not the order",
intu: String.raw`Reshape takes the same elements, in the same order, and reads them into new axes. Twenty-eight daily temperatures become 4 weeks by 7 days, or 2 periods by 2 weeks by 7 days, as long as the counts multiply to 28. Drag the row count and watch the same sequence fold differently. Nothing is sorted or moved. <code>-1</code> lets NumPy infer one dimension. Reshape to one dimension and back and <code>np.array_equal</code> confirms the order survived.`,
eq: String.raw`\[ \texttt{flat.reshape(4, 7)}: \ \text{element } k \mapsto \text{row } \lfloor k/7 \rfloor, \text{ column } k \bmod 7, \qquad \prod \text{shape} = \texttt{size} \]`,
sym: [["reshape(r, c)", "the same elements read row by row into r rows and c columns"], ["-1", "infer this one dimension from the size"], ["ravel(), flatten()", "back to 1D. ravel gives a view when it can, flatten always copies."], ["row-major", "the last axis varies fastest: NumPy fills row by row"], ["(2, 2, 7)", "a 3D shape: period, week, day"]],
how: ["The size must not change: 28 elements can be (4, 7), (7, 4), (2, 14), (2, 2, 7), but not (3, 10).", "Elements are read in order and placed row by row, last axis first.", "A reshape is usually a view. A write into the reshaped array writes into the original.", "Name the axes after reshaping: week is axis 0, day is axis 1. Card 5 needs those names.", "Transpose <code>.T</code> swaps the axes and is a different operation: it changes which element sits where."],
say: String.raw`Reshape reinterprets the same ordered elements under a new shape with the same size, filling the last axis fastest, and it does not reorder anything.`,
num: String.raw`28 values: <code>reshape(4, -1)</code> gives <b>(4, 7)</b>. <code>reshape(2, 2, 7)</code> gives three axes. <code>reshape(3, 10)</code> raises because 30 is not 28.`,
r(fig, ctl) {
  const flat = Array.from({ length: 28 }, (_, k) => k + 1);
  const shapes = [[1, 28], [2, 14], [4, 7], [7, 4], [14, 2]];
  let k = 2, hi = 9;
  ctl.innerHTML = btns(shapes.map((s, i) => [i, `reshape(${s[0]}, ${s[1]})`]), "k") + sl("el", "follow element number", 1, 28, 1, 10) + `<div id="rs"></div>`;
  const u = () => {
    pick(ctl, "k", k); hi = +$("el").value - 1; $("elv").textContent = "value " + (hi + 1);
    const [r, c] = shapes[k], rows = Array.from({ length: r }, (_, i) => flat.slice(i * c, (i + 1) * c));
    const cell = c > 10 ? 22 : c > 7 ? 30 : 42;
    const g = ML.grid(rows, { cell, hl: new Set([key(Math.floor(hi / c), hi % c)]), axes: r > 1, title: `shape (${r}, ${c})`, colLab: c > 14 ? false : undefined });
    fig.innerHTML = svg(g.h + 12, g.s) + ML.code(["flat = np.arange(1, 29)", `weeks = flat.reshape(${r}, ${c})`, `print(weeks[${Math.floor(hi / c)}, ${hi % c}])`, "print(np.array_equal(weeks.ravel(), flat))"], 1) + ML.term([String(hi + 1), "True"]);
    $("rs").innerHTML = ML.readout([["element " + (hi + 1) + " sits at", `row ${Math.floor(hi / c)}, column ${hi % c}`], ["rule", `row = (k − 1) // ${c}, col = (k − 1) % ${c}`], ["size", r * c]]);
  };
  $("el").oninput = u; ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "5. Axes", t: "Axes tell a reduction what to combine",
intu: String.raw`A reduction such as mean, max or sum collapses an axis. <code>axis=0</code> combines down the rows and leaves one value per column. <code>axis=1</code> combines across the columns and leaves one value per row. No axis combines everything. The professor's advice: say the sentence before writing the code. "I want one mean per week, so I combine the day axis, axis 1." Click an axis and watch which cells merge into which result.`,
eq: String.raw`\[ \texttt{X.mean(axis=0)} \to (p,) \ \text{one per column}, \qquad \texttt{X.mean(axis=1)} \to (n,) \ \text{one per row}, \qquad \texttt{X.mean()} \to \text{scalar} \]`,
sym: [["axis=0", "combine along axis 0: down the rows, result has shape (p,)"], ["axis=1", "combine along axis 1: across the columns, result has shape (n,)"], ["axis=(1, 2)", "combine two axes of a 3D array at once"], ["keepdims=True", "keep the reduced axis with length 1, so (n, 1) instead of (n,)"], ["the sentence", "name what each axis means, then name the one you want to collapse"]],
how: ["Write the shape and name the axes: (weeks, days) is (4, 7).", "Decide which axis should disappear. One value per week means the day axis goes: axis 1.", "The result's shape is the input shape with that axis removed.", "keepdims keeps the axis as length 1, which card 6 of Lesson 9 needs for broadcasting back.", "For (period, week, day) = (2, 2, 7), <code>max(axis=(1, 2))</code> leaves one value per period."],
say: String.raw`A reduction removes the axis you name and returns one value for every position along the remaining axes, so the axis argument is the one you want to collapse.`,
num: String.raw`For <code>np.arange(1, 13).reshape(3, 4)</code>: <code>mean(axis=1)</code> is <b>[2.5, 6.5, 10.5]</b>, shape (3,). <code>mean(axis=0)</code> is <b>[5, 6, 7, 8]</b>, shape (4,).`,
note: String.raw`The axis question appears in HW1 Part 2 Exercise 4 (feature mean versus sample mean) and in every standardization in the course: feature statistics are axis 0.`,
r(fig, ctl) {
  const X = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  let ax = 1, op = "mean", keep = false;
  const OPS = { mean: a => mean(a), sum: a => a.reduce((x, y) => x + y, 0), max: a => Math.max(...a) };
  ctl.innerHTML = btns([[0, "axis=0"], [1, "axis=1"], [2, "no axis"]], "a") + btns([["mean", "mean"], ["sum", "sum"], ["max", "max"]], "o") + btns([[0, "keepdims=False"], [1, "keepdims=True"]], "kd") + `<div id="ax"></div>`;
  const u = () => {
    pick(ctl, "a", ax); pick(ctl, "o", op); pick(ctl, "kd", keep ? 1 : 0);
    const g = ML.grid(X, { axes: true, cell: 46, title: "X, shape (3, 4)" });
    let s = g.s; let res, shape;
    if (ax === 0) { res = [0, 1, 2, 3].map(j => OPS[op](X.map(r => r[j]))); shape = keep ? "(1, 4)" : "(4,)"; [0, 1, 2, 3].forEach(j => { s += arrow(60 + j * 46 + 21, 30 + 3 * 46 + 30, 60 + j * 46 + 21, 30 + 3 * 46 + 52, C.coral, 2); s += `<rect x="${60 + j * 46}" y="${30 + 3 * 46 + 56}" width="43" height="36" rx="5" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(60 + j * 46 + 21, 30 + 3 * 46 + 79, +res[j].toFixed(1), "middle", "t"); }); s += tx(300, 30 + 3 * 46 + 79, "← one value per column, axis 0 collapsed", null); }
    else if (ax === 1) { res = X.map(r => OPS[op](r)); shape = keep ? "(3, 1)" : "(3,)"; X.forEach((r, i) => { s += arrow(60 + 4 * 46 + 2, 30 + i * 46 + 21, 60 + 4 * 46 + 28, 30 + i * 46 + 21, C.coral, 2); s += `<rect x="${60 + 4 * 46 + 32}" y="${30 + i * 46}" width="52" height="43" rx="5" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(60 + 4 * 46 + 58, 30 + i * 46 + 26, +res[i].toFixed(1), "middle", "t"); }); s += tx(360, 30 + 1 * 46 + 26, "← one value per row, axis 1 collapsed", null); }
    else { res = OPS[op](X.flat()); shape = keep ? "(1, 1)" : "()"; s += `<rect x="330" y="60" width="90" height="50" rx="6" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(375, 90, +res.toFixed(2), "middle", "th") + tx(430, 90, "← everything combined", null); }
    fig.innerHTML = svg(g.h + 80, s) + ML.code(["X = np.arange(1, 13).reshape(3, 4)", `r = X.${op}(${ax === 2 ? "" : "axis=" + ax}${keep ? (ax === 2 ? "" : ", ") + "keepdims=True" : ""})`, "print(r, r.shape)"], 1) + ML.term([(Array.isArray(res) ? (keep ? (ax === 0 ? "[[" + res.map(v => +v.toFixed(1)).join(" ") + "]]" : res.map(v => "[" + (+v.toFixed(1)) + "]").join("\n ").replace(/^/, "[").concat("]")) : "[" + res.map(v => +v.toFixed(1)).join(" ") + "]") : String(+res.toFixed(2))) + " " + shape]);
    $("ax").innerHTML = `<p class="note"><b>Say it:</b> ${ax === 0 ? "I want one value per column, so I combine the row axis, axis 0." : ax === 1 ? "I want one value per row, so I combine the column axis, axis 1." : "I want one number for the whole array, so I combine both axes."}${keep ? " keepdims keeps the collapsed axis as length 1." : ""}</p>`;
  };
  ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { ax = +b.dataset.a; u(); });
  ctl.querySelectorAll("button[data-o]").forEach(b => b.onclick = () => { op = b.dataset.o; u(); });
  ctl.querySelectorAll("button[data-kd]").forEach(b => b.onclick = () => { keep = b.dataset.kd === "1"; u(); });
  u();
}},

{s: "6. Three axes", t: "Three axes: period, week, day",
intu: String.raw`Arrays are not limited to two axes. The 28 temperatures as (2, 2, 7) are two periods, each with two weeks of seven days. An image batch in PyTorch is (batch, channels, height, width), four axes. The reasoning is the same: name each axis, then say which ones a reduction collapses. Pick the axes to reduce and watch the result shape. The professor's example <code>cube.max(axis=(1, 2))</code> leaves one maximum per period.`,
eq: String.raw`\[ \text{shape } (2, 2, 7) = (\text{period}, \text{week}, \text{day}), \qquad \texttt{max(axis=(1, 2))} \to (2,) \]`,
sym: [["3D array", "a stack of 2D arrays, indexed [period, week, day]"], ["axis=(1, 2)", "collapse weeks and days together, one value per period"], ["X[0]", "the first period, a (2, 7) array"], ["X[:, :, 0]", "the first day of every week in every period, shape (2, 2)"], ["(B, C, H, W)", "the four axes of an image batch, coming in Part 5"]],
how: ["Write the shape and name the axes in order.", "An index on one axis selects a slab and drops that axis: X[0] has shape (2, 7).", "A reduction over a tuple of axes removes all of them at once.", "The result shape is the input shape with the named axes deleted, in order.", "Nothing new is needed for 4 or 5 axes, only the discipline of naming them."],
say: String.raw`A multidimensional array is indexed with one position per axis, and a reduction over several axes removes exactly those axes from the shape.`,
num: String.raw`(2, 2, 7) reduced over axes (1, 2) gives shape <b>(2,)</b>. Reduced over axis 2 only, <b>(2, 2)</b>, one value per week in each period.`,
r(fig, ctl) {
  const T = [25, 28, 23, 24, 27, 26, 24, 22, 21, 23, 25, 26, 28, 27, 26, 24, 23, 24, 25, 27, 28, 29, 30, 28, 26, 25, 24, 23];
  const cube = [0, 1].map(p => [0, 1].map(w => T.slice((p * 2 + w) * 7, (p * 2 + w) * 7 + 7)));
  let sel = new Set([1, 2]);
  ctl.innerHTML = `<div class="row"><label>axes to reduce</label>${[0, 1, 2].map(a => `<button data-a="${a}">axis ${a} (${["period", "week", "day"][a]})</button>`).join("")}</div><div id="cb"></div>`;
  const u = () => {
    ctl.querySelectorAll("button[data-a]").forEach(b => b.classList.toggle("on", sel.has(+b.dataset.a)));
    let s = "";
    cube.forEach((per, p) => { const g = ML.grid(per, { x: 40 + p * 330, y: 36, cell: 36, rowLab: ["w0", "w1"], colLab: ["d0", "d1", "d2", "d3", "d4", "d5", "d6"], title: "period " + p, dec: 0 }); s += g.s; });
    const axes = [...sel].sort();
    const shape = [2, 2, 7].filter((_, i) => !sel.has(i));
    let out;
    if (axes.length === 3) out = Math.max(...T);
    else if (axes.length === 0) out = "the whole cube";
    else {
      const vals = [];
      for (let p = 0; p < 2; p++) for (let w = 0; w < 2; w++) for (let d = 0; d < 7; d++) vals.push([[p, w, d], cube[p][w][d]]);
      const groups = {};
      vals.forEach(([idx, v]) => { const k = idx.filter((_, i) => !sel.has(i)).join(","); groups[k] = Math.max(groups[k] == null ? -1e9 : groups[k], v); });
      out = Object.values(groups);
    }
    fig.innerHTML = svg(150, s) + ML.code(["cube = flat.reshape(2, 2, 7)    # (period, week, day)", `r = cube.max(${axes.length ? "axis=" + (axes.length === 1 ? axes[0] : "(" + axes.join(", ") + ")") : ""})`, "print(r.shape)"], 1) + ML.term([`(${shape.join(", ")}${shape.length === 1 ? "," : ""})`]);
    $("cb").innerHTML = ML.readout([["axes removed", axes.length ? axes.map(a => ["period", "week", "day"][a]).join(", ") : "none"], ["result shape", `(${shape.join(", ")}${shape.length === 1 ? "," : ""})`], ["one value per", shape.length === 0 ? "whole cube" : [0, 1, 2].filter(i => !sel.has(i)).map(i => ["period", "week", "day"][i]).join(" and ")], ["values", Array.isArray(out) ? out.join(" ") : out]]);
  };
  ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { const a = +b.dataset.a; sel.has(a) ? sel.delete(a) : sel.add(a); u(); }); u();
}},

{s: "7. dtype traps", t: "dtype decides what the arithmetic means",
intu: String.raw`Every element shares one dtype, and the dtype decides the arithmetic. Integer division stays integer in some operations, floats carry rounding, booleans add as 0 and 1, and a float assigned into an integer array is truncated. Click a case. The two that cost people real time in this course: an integer array that silently truncates a probability, and a comparison that produces a bool array you then sum to count.`,
eq: String.raw`\[ \texttt{a.astype(float)} \text{ converts}, \qquad \texttt{(X} \gt \texttt{5).sum()} \text{ counts}, \qquad \texttt{int array} \leftarrow 0.7 \ \text{stores } 0 \]`,
sym: [["astype(t)", "a converted copy with dtype t"], ["bool arithmetic", "True is 1, so a mask's sum is a count and its mean a fraction"], ["int truncation", "assigning 0.7 into an int64 array stores 0"], ["float32 vs float64", "PyTorch defaults to float32, NumPy to float64. Mixing them is a common tensor bug."], ["np.isclose", "compare floats with a tolerance"]],
how: ["Check <code>X.dtype</code> when a result looks off by truncation.", "Create arrays that will hold fractions as float from the start.", "A comparison on an array returns a bool array of the same shape. Sum it to count, mean it for a fraction.", "<code>0.1 + 0.2 == 0.3</code> is False for arrays too. Use np.isclose or np.allclose.", "np.log1p and np.expm1 exist because log(1 + x) loses x when x is tiny, a HW1 point."],
say: String.raw`The dtype governs the arithmetic, so build float arrays for fractions, treat comparisons as bool arrays that count when summed, and compare floats with a tolerance.`,
num: String.raw`<code>np.array([1, 2, 3])</code> is int64. <code>x[0] = 0.7</code> stores <b>0</b>. <code>(np.arange(10) > 6).sum()</code> is <b>3</b>.`,
r(fig, ctl) {
  const T = [["x = np.array([1, 2, 3]); x[0] = 0.7; print(x, x.dtype)", "[0 2 3] int64", "an int array truncates the float toward zero"], ["x = np.array([1, 2, 3], dtype=float); x[0] = 0.7; print(x)", "[0.7 2.  3. ]", "a float array keeps it"], ["m = np.arange(10) > 6; print(m.dtype, m.sum(), m.mean())", "bool 3 0.3", "a comparison is a bool array, its sum counts and its mean is a fraction"], ["print(np.array([0.1 + 0.2]) == 0.3, np.isclose(0.1 + 0.2, 0.3))", "[False] True", "binary floats need a tolerance"], ["print(np.log(1 + 1e-16), np.log1p(1e-16))", "0.0 1e-16", "1 + 1e-16 rounds to 1.0 before the log. log1p keeps the small value."], ["a = np.arange(3); print(a / 2, (a / 2).dtype)", "[0.  0.5 1. ] float64", "true division always makes floats, even from an int array"], ["print(np.float32(0.1) == np.float64(0.1))", "False", "the same decimal stored at two precisions is two different numbers, a tensor dtype bug in waiting"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}">${i + 1}</button>`).join("")}</div>`;
  const u = () => { pick(ctl, "k", k); const t = T[k]; fig.innerHTML = ML.code(t[0].split("; "), -1) + ML.term([t[1]]) + `<p class="note">${t[2]}.</p>`; };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "8. With the agent", t: "Do it with the agent: load a table and audit its shapes",
intu: String.raw`The project's data module starts here: load the processed table into a feature matrix and a target vector, print shapes, dtypes and per-feature statistics with the right axis, and prove that a slice is a view and a copy is not. The checks are shape sentences you say out loud.`,
eq: String.raw`\[ \text{CSV} \to X \in \mathbb{R}^{n \times p},\ y \in \mathbb{R}^{n} \to \text{shapes, dtypes, per-feature statistics} \]`,
sym: [["the loader", "<code>load_xy</code> returns X of shape (n, p) as float64 and y of shape (n,)"], ["feature statistics", "mean and std with axis=0, shape (p,)"], ["the view check", "X[:5] shares memory, X[:5].copy() does not"]],
how: ["Paste the command.", "Read the shapes it prints and say them: n samples with p features, n targets.", "Check that the statistics have shape (p,), one per feature, not (n,).", "Confirm the two memory-sharing lines print True then False.", "Change a value in the view on purpose and confirm the original changed. Then put it back."],
say: String.raw`Loading data means producing X and y with stated shapes and dtypes, and every statistic is computed along the axis I can name.`,
num: String.raw`For the fruit table: X is <b>(240, 4)</b> float64, y is <b>(240,)</b>, the feature means have shape <b>(4,)</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "In src/data.py write load_xy(path: str, features: list[str], target: str) -> tuple[np.ndarray, np.ndarray] that reads the CSV with pandas, returns X as a float64 array of shape (n, len(features)) and y as a 1D array of length n, and raises ValueError if any requested column is missing. Under the main guard, load data/processed/fruit.csv with features mass_g, width_cm, height_cm, color and target fruit. Print X.shape, X.dtype, y.shape, then the per-feature mean and std with axis=0 and their shapes, then np.shares_memory(X[:5], X) and np.shares_memory(X[:5].copy(), X). Run it and paste the output.",
    actions: ["$ python src/data.py", "X (240, 4) float64  y (240,)", "mean [152.3   6.6   7.2   0.71] shape (4,)", "std  [ 41.8   0.9   1.1   0.19] shape (4,)", "view shares memory: True", "copy shares memory: False"],
    checks: ["X.shape is (n, 4) and y.shape is (n,), and I can say both as sentences", "the statistics were computed with axis=0 and have shape (4,)", "a missing column name raises ValueError instead of a KeyError deep in pandas", "the view line prints True and the copy line prints False", "X.dtype is float64, not object, so arithmetic will work"]
  });
}},

{s: "9. Test", t: "Test: NumPy arrays",
intu: String.raw`Twelve questions: shapes, indexing, views, reshape and axes. Say the shape before you click.`,
eq: String.raw`\[ \text{shape in} \to \text{operation} \to \text{shape out} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Write the input shape.", "Decide which axes an index or reduction removes.", "Ask whether memory is shared."],
say: String.raw`I can state the shape of any indexing, reshaping or reduction result before running it, and I know when two arrays share memory.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "An array has shape (4, 3). What are ndim and size?", o: ["2 and 7", "2 and 12", "4 and 3", "12 and 2"], a: 1, why: "ndim is the number of axes, 2. size is the product of the shape, 12." },
    { q: "For <code>X = np.arange(20).reshape(4, 5)</code>, what is <code>X[:, 2]</code>?", o: ["[10, 11, 12, 13, 14]", "[2, 7, 12, 17]", "12", "[[2], [7], [12], [17]]"], a: 1, why: "A colon on axis 0 keeps every row, index 2 on axis 1 picks the third column. Shape (4,)." },
    { q: "What is the shape of <code>X[1:2, :]</code> when X is (4, 5)?", o: ["(5,)", "(1, 5)", "(2, 5)", "()"], a: 1, why: "A slice keeps the axis even when it selects one row. An integer index would drop it." },
    { q: "<code>view = base[1:3]; view[0] = 99</code>. What happened to base?", o: ["Nothing, view is a copy", "base[1] is now 99", "base[0] is now 99", "Error"], a: 1, why: "A basic slice is a view sharing memory. view[0] is base[1]." },
    { q: "<code>f = c * 9 / 5 + 32</code>. Later c changes. What does f show?", o: ["The updated conversion", "The old values, it was computed once", "Error", "Zeros"], a: 1, why: "Arithmetic makes a derived array with values computed at that moment. Recompute to update." },
    { q: "Which reshape of 28 elements fails?", o: ["(4, 7)", "(2, 14)", "(3, 10)", "(2, 2, 7)"], a: 2, why: "3 × 10 = 30 is not 28. Reshape never changes the size." },
    { q: "After <code>w = np.arange(1, 29).reshape(4, 7)</code>, where is the value 10?", o: ["w[1, 2]", "w[2, 1]", "w[1, 3]", "w[0, 9]"], a: 0, why: "Elements fill row by row. Value 10 is element index 9, which is row 9 // 7 = 1, column 9 % 7 = 2." },
    { q: "X has shape (4, 7) as (weeks, days). One mean per week is:", o: ["X.mean(axis=0)", "X.mean(axis=1)", "X.mean()", "X.mean(axis=(0, 1))"], a: 1, why: "To get one value per week, collapse the day axis, axis 1. Result shape (4,)." },
    { q: "The shape of <code>X.mean(axis=0, keepdims=True)</code> for X of shape (4, 7) is:", o: ["(7,)", "(1, 7)", "(4, 1)", "(4,)"], a: 1, why: "keepdims keeps the reduced axis with length 1." },
    { q: "cube has shape (2, 2, 7). <code>cube.max(axis=(1, 2)).shape</code> is:", o: ["(2,)", "(2, 2)", "(7,)", "()"], a: 0, why: "Both named axes are removed, leaving axis 0 of length 2." },
    { q: "<code>x = np.array([1, 2, 3]); x[0] = 0.7</code>. x[0] is:", o: ["0.7", "0", "1", "Error"], a: 1, why: "The array is int64, so the float is truncated toward zero." },
    { q: "<code>(np.arange(10) > 6).sum()</code> returns:", o: ["True", "3", "[7, 8, 9]", "24"], a: 1, why: "The comparison is a bool array and True counts as 1. Three values exceed 6." }
  ], "Lesson 8 test");
}}
],
summary: String.raw`An array is a rectangle of values with one dtype, and shape, ndim and size describe the rectangle, with axis 0 down the samples and axis 1 across the features. Indexing takes one position per axis, slices keep an axis and integers drop it, and every stop is excluded. A basic slice is a view that shares memory with the base, a copy is independent, and an arithmetic result is a derived array frozen at the moment it was computed. Reshape reinterprets the same ordered elements under a new shape of the same size, filling the last axis fastest. A reduction removes the axis you name, so say which axis should disappear before writing it, and keepdims keeps it as length 1. The dtype governs arithmetic: ints truncate, bools count, floats need tolerances.`,
sheet: [
[String.raw`\[ X \in \mathbb{R}^{n \times p}: \ \texttt{shape} = (n, p), \ \texttt{size} = np \]`, "The array and its metadata"],
[String.raw`\[ \texttt{X[i, j]} \to (), \quad \texttt{X[i, :]} \to (p,), \quad \texttt{X[:, j]} \to (n,), \quad \texttt{X[a:b, :]} \to (b-a, p) \]`, "Index drops an axis, slice keeps it"],
[String.raw`\[ \texttt{base[a:b]} \to \text{view}, \quad \texttt{.copy()} \to \text{independent}, \quad \texttt{base * 2} \to \text{derived} \]`, "Memory relationships"],
[String.raw`\[ \texttt{reshape(r, c)}: \ k \mapsto (\lfloor k / c \rfloor,\ k \bmod c), \quad rc = \texttt{size} \]`, "Reshape, row-major"],
[String.raw`\[ \texttt{mean(axis=0)} \to (p,), \quad \texttt{mean(axis=1)} \to (n,), \quad \texttt{keepdims} \to (n, 1) \]`, "Reductions remove the named axis"]],
sources: ["AME 5970 HW1 Part 2, exercises 1 to 4 (creation, metadata, slicing and copies, vectorized math, axes)", "AME 5970 HW2 learning guide, sections 11 to 14 (the NumPy mental model, views and copies, reshape, axes) and HW2 Part 2 exercises 1 and 2", "AME 5970 Lecture 4 notes, chapter 3 (tensors and shape reasoning), the same rules for torch tensors", "NumPy user guide: the absolute basics for beginners, indexing on ndarrays, copies and views"]
});
})();
