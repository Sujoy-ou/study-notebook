(function () {
/* ML shelf, Part 3, Lesson 12: Linear algebra. Follows the AME 5970 Linear Algebra review notes (sections 01 to 12) and Andrew Ng's linear algebra review (Machine Learning course, week 1), using the professor's own matrices and numbers throughout. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 2 : d);
const fmtN = v => Number.isInteger(v) ? String(v) : (Math.abs(v - Math.round(v * 2) / 2) < 1e-9 ? String(Math.round(v * 2) / 2) : f(v, 2));
const matmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const T = A => A[0].map((_, j) => A.map(r => r[j]));
const key = (i, j) => i + "," + j;
const SUB = "₀₁₂₃₄₅₆₇₈₉";
/* a small 2D coordinate plane for vector pictures */
const plane = (x0, y0, w, h, lim) => {
  const X = v => x0 + w / 2 + v / lim * (w / 2), Y = v => y0 + h / 2 - v / lim * (h / 2);
  let s = "";
  for (let v = -lim; v <= lim; v++) { s += `<line x1="${X(v)}" y1="${y0}" x2="${X(v)}" y2="${y0 + h}" stroke="var(--line)" stroke-width="${v === 0 ? 1.4 : 0.5}"/><line x1="${x0}" y1="${Y(v)}" x2="${x0 + w}" y2="${Y(v)}" stroke="var(--line)" stroke-width="${v === 0 ? 1.4 : 0.5}"/>`; if (v !== 0 && v % 2 === 0) s += tx(X(v), Y(0) + 13, v, "middle") + tx(X(0) - 6, Y(v) + 4, v, "end"); }
  return { s, X, Y };
};
const vec = (P, a, b, col, w, lab) => { let s = arrow(P.X(0), P.Y(0), P.X(a), P.Y(b), col, w || 2.5); if (lab) s += tx(P.X(a) + (a >= 0 ? 6 : -6), P.Y(b) - 6, lab, a >= 0 ? "start" : "end", "th"); return s; };

addLesson("ml", "math", {
level: "Core", num: "Lesson 12",
id: "ml-math-l12", title: "Linear algebra", short: "12. Linear algebra",
big: String.raw`Every model in this course is a matrix expression. Predictions are <code>X @ theta</code>, the gradient is <code>X.T @ residual / m</code>, a neural network layer is <code>X @ W + b</code>, and the least squares solution hides inside <code>np.linalg.lstsq</code>. This lesson is the professor's Linear Algebra review, section by section, with his matrices drawn live: the shape and index conventions, addition and scaling, the matrix-vector product read two ways, the design matrix that turns a model into one multiplication, matrix-matrix products and why order matters, identity, inverse and singular matrices, the transpose with inner and outer products, the NumPy shape rules that bite, and the hardness example that puts it all together. The last content card previews least squares, which Part 4 derives.`,
bridge: String.raw`The professor's Linear Algebra review is the source, section numbers are given on each card. Andrew Ng's week 1 linear algebra review covers the same ground with the same house-price example. Lesson 13 differentiates these expressions, Lesson 15 solves the least squares problem, and Lesson 21 turns every one of them into a tensor.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Shapes and indices", t: "A matrix is a grid with a shape, and two index conventions",
intu: String.raw`A matrix of shape m × n has m rows and n columns. A vector is a column, shape n × 1 in the lecture, but NumPy also has a one-dimensional array of shape (n,), and the two behave differently. The lecture writes entries with 1-based subscripts, so A₃₂ is row 3, column 2. NumPy counts from 0, so the same entry is <code>A[2, 1]</code>. Click any cell of the professor's 4 × 2 house matrix to see both names. The y vector shows the three shapes one set of four numbers can take.`,
eq: String.raw`\[ A \in \mathbb{R}^{4 \times 2}, \qquad A_{32} = 1437 = \texttt{A[2, 1]}, \qquad y \in \mathbb{R}^{4}: \ \texttt{(4,)},\ \texttt{(4, 1)},\ \texttt{(1, 4)} \]`,
sym: [["m × n", "rows by columns, always in that order"], [String.raw`\(A_{ij}\)`, "entry in row i, column j, counted from 1 in the lecture"], ["A[i−1, j−1]", "the same entry in NumPy, counted from 0"], ["(n,)", "a one-dimensional NumPy array, neither row nor column"], ["(n, 1) and (1, n)", "a column and a row, both two-dimensional"]],
how: ["Shape first: write (rows, columns) before any operation.", "Subtract 1 from each lecture subscript to get the NumPy index.", "A (4,) array transposes to itself. reshape(4, 1) makes a column, reshape(1, 4) a row.", "The lecture's column vector is NumPy's (n, 1). Most of the course's code keeps y as (n,) and reshapes only when a loss demands it.", "Shape errors are the most common bug in Part 4 and Part 5, so read shapes aloud."],
say: String.raw`A matrix has shape rows by columns, the lecture indexes from one and NumPy from zero, and a NumPy vector can be one-dimensional, a column or a row, which are three different objects.`,
num: String.raw`A = [[1402, 191], [1371, 821], [949, 1437], [147, 1448]]. <b>A₃₂ = 1437</b> is <code>A[2, 1]</code>. <b>A₁₂ = 191</b> is <code>A[0, 1]</code>. <code>A.shape</code> is <b>(4, 2)</b>.`,
note: String.raw`The professor's note on section 01: a 1-based subscript in a derivation and a 0-based index in code describe the same entry. Keep a mental minus one and say which convention you are using.`,
r(fig, ctl) {
  const A = [[1402, 191], [1371, 821], [949, 1437], [147, 1448]], y = [460, 232, 315, 178];
  let sel = [2, 1], shape = 0;
  ctl.innerHTML = btns([[0, "y as (4,)"], [1, "y.reshape(4, 1)"], [2, "y.reshape(1, 4)"]], "k") + `<div id="ix"></div>`;
  const u = () => {
    pick(ctl, "k", shape);
    const g = ML.grid(A, { x: 60, y: 40, cell: 60, hl: new Set([key(sel[0], sel[1])]), title: "A, shape (4, 2)", rowLab: [1, 2, 3, 4].map(v => "row " + v), colLab: ["col 1", "col 2"] });
    let s = g.s;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) s += `<rect data-c="${i},${j}" x="${60 + j * 60}" y="${40 + i * 60}" width="57" height="57" fill="transparent" style="cursor:pointer"/>`;
    s += ML.box(220, 50, 180, 60, "c-teal", [`A${SUB[sel[0] + 1]}${SUB[sel[1] + 1]} = ${A[sel[0]][sel[1]]}`, `A[${sel[0]}, ${sel[1]}] in NumPy`]);
    s += tx(220, 140, "click a cell", null);
    if (shape === 0) { s += ML.grid(y, { x: 430, y: 60, cell: 50, title: "y, shape (4,)", colLab: false, rowLab: false }).s; s += tx(430, 140, "one axis, length 4", null) + tx(430, 158, "y.T is the same array", null); }
    else if (shape === 1) { s += ML.grid(y.map(v => [v]), { x: 470, y: 50, cell: 44, title: "y, shape (4, 1)", colLab: false, rowLab: false }).s; s += tx(540, 90, "a column: 4 rows, 1 column", null) + tx(540, 108, "the lecture's vector", null); }
    else { s += ML.grid(y, { x: 430, y: 60, cell: 50, title: "y, shape (1, 4)", colLab: false, rowLab: false }).s; s += tx(430, 140, "a row: 1 row, 4 columns", null) + tx(430, 158, "the transpose of the column", null); }
    fig.innerHTML = svg(300, s) + ML.code(["A = np.array([[1402, 191], [1371, 821], [949, 1437], [147, 1448]])", "y = np.array([460, 232, 315, 178])", ["print(A.shape, y.shape)", "col = y.reshape(4, 1)   # shape (4, 1)", "row = y.reshape(1, 4)   # shape (1, 4)"][shape], `print(A[${sel[0]}, ${sel[1]}])`], 3) + ML.term([["(4, 2) (4,)", "(4, 1)", "(1, 4)"][shape], String(A[sel[0]][sel[1]])]);
    fig.querySelectorAll("rect[data-c]").forEach(e => e.onclick = () => { sel = e.dataset.c.split(",").map(Number); u(); });
    $("ix").innerHTML = ML.readout([["lecture", `A${SUB[sel[0] + 1]}${SUB[sel[1] + 1]}`], ["NumPy", `A[${sel[0]}, ${sel[1]}]`], ["value", A[sel[0]][sel[1]]]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { shape = +b.dataset.k; u(); }); u();
}},

{s: "2. Add and scale", t: "Addition needs equal shapes, scaling touches every entry",
intu: String.raw`Two matrices add entry by entry, so they must have the same shape. A scalar times a matrix multiplies every entry. That is all, but it is the first place NumPy and the lecture part ways: NumPy will add a (3, 2) to a (2,) by broadcasting, which the lecture would call undefined. Click an entry of the sum to see the two numbers that made it, and drag the scalar to watch every entry scale together.`,
eq: String.raw`\[ (A + B)_{ij} = A_{ij} + B_{ij}, \qquad (cA)_{ij} = c A_{ij}, \qquad A + B \text{ requires equal shapes} \]`,
sym: [["A + B", "entrywise sum, same shape as both"], ["cA", "every entry multiplied by c, shape unchanged"], ["A − B", "A + (−1)B"], ["broadcasting", "NumPy's extension that adds a smaller array to each row or column, not part of the lecture's algebra"]],
how: ["Check the shapes are identical. If not, the sum is undefined in the lecture.", "Add the entries in the same position.", "For cA, multiply each entry by c. Signs flip when c is negative.", "In NumPy, A + B and c * A do exactly this when shapes match.", "If shapes differ and NumPy does not error, broadcasting happened. Decide whether you meant it."],
say: String.raw`Addition is entrywise and needs identical shapes, scaling multiplies every entry by the same number, and NumPy's broadcasting is a convenience outside this rule that you must apply on purpose.`,
num: String.raw`[[1, 0], [2, 5], [3, 1]] + [[4, 0.5], [2, 5], [0, 1]] = <b>[[5, 0.5], [4, 10], [3, 2]]</b>. With c = 3, 3A = <b>[[3, 0], [6, 15], [9, 3]]</b>.`,
r(fig, ctl) {
  const A = [[1, 0], [2, 5], [3, 1]], B = [[4, 0.5], [2, 5], [0, 1]];
  let sel = [1, 1], mode = 0;
  ctl.innerHTML = btns([[0, "A + B"], [1, "c · A"]], "k") + `<div id="sc"></div>`;
  const u = () => {
    pick(ctl, "k", mode);
    if (mode === 0) {
      const S = A.map((r, i) => r.map((v, j) => v + B[i][j])), hl = new Set([key(sel[0], sel[1])]);
      let s = ML.grid(A, { x: 40, y: 40, cell: 52, hl, title: "A (3, 2)", rowLab: false }).s + tx(160, 120, "+", "middle", "th") + ML.grid(B, { x: 190, y: 40, cell: 52, hl, title: "B (3, 2)", rowLab: false }).s + tx(310, 120, "=", "middle", "th") + ML.grid(S, { x: 340, y: 40, cell: 52, hl, title: "A + B (3, 2)", rowLab: false }).s;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) s += `<rect data-c="${i},${j}" x="${340 + j * 52}" y="${40 + i * 52}" width="49" height="49" fill="transparent" style="cursor:pointer"/>`;
      s += ML.box(470, 60, 190, 56, "c-teal", [`${fmtN(A[sel[0]][sel[1]])} + ${fmtN(B[sel[0]][sel[1]])} = ${fmtN(S[sel[0]][sel[1]])}`, `entry (${sel[0] + 1}, ${sel[1] + 1}) of each`]) + tx(470, 140, "click an entry of the sum", null);
      fig.innerHTML = svg(230, s) + ML.code(["A = np.array([[1, 0], [2, 5], [3, 1]], dtype=float)", "B = np.array([[4, 0.5], [2, 5], [0, 1]])", "S = A + B    # shapes (3, 2) and (3, 2)"], 2);
      fig.querySelectorAll("rect[data-c]").forEach(e => e.onclick = () => { sel = e.dataset.c.split(",").map(Number); u(); });
      $("sc").innerHTML = "";
    } else {
      $("sc").innerHTML = sl("c", "c", -3, 3, 0.5, 3);
      const draw = () => {
        const c = +$("c").value; $("cv").textContent = c;
        const S = A.map(r => r.map(v => c * v));
        let s = ML.grid(A, { x: 60, y: 40, cell: 52, title: "A", rowLab: false }).s + tx(200, 120, "× " + c + " =", "middle", "th") + ML.grid(S, { x: 270, y: 40, cell: 52, title: c + "A", rowLab: false }).s;
        s += tx(420, 70, "every entry times " + c, null) + tx(420, 90, c < 0 ? "negative c flips every sign" : c === 0 ? "c = 0 gives the zero matrix" : "shape stays (3, 2)", null);
        fig.innerHTML = svg(230, s) + ML.code(["A = np.array([[1, 0], [2, 5], [3, 1]], dtype=float)", `S = ${c} * A`], 1);
      };
      $("c").oninput = draw; draw();
    }
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { mode = +b.dataset.k; u(); }); u();
}},

{s: "3. Matrix times vector", t: "Matrix-vector product, row by row",
intu: String.raw`A matrix of shape m × n times a vector of length n gives a vector of length m. Each output entry is one row of the matrix dotted with the vector: multiply matching entries and add. The professor's example is a 3 × 2 matrix times (1, 5). Step through the three rows and watch each output number being assembled. The inner dimensions, the matrix's n and the vector's n, must match, and that single rule is what every shape error in the course violates.`,
eq: String.raw`\[ (Ax)_i = \sum_{j=1}^{n} A_{ij} x_j, \qquad (m \times n)(n \times 1) = (m \times 1) \]`,
sym: [["A", "the matrix, 3 × 2 here"], ["x", "the vector, length 2, written as a column"], [String.raw`\((Ax)_i\)`, "row i of A dotted with x"], ["inner dimension", "the n shared by A's columns and x's length, which must agree"], ["@", "NumPy's matrix multiplication operator"]],
how: ["Check: A has n columns and x has n entries.", String.raw`For each row i, multiply \(A_{i1}\) by \(x_1\), \(A_{i2}\) by \(x_2\), and so on, then add.`, "Stack the m results into a vector of length m.", "In NumPy, A @ x with A of shape (3, 2) and x of shape (2,) returns shape (3,).", "A one-dimensional x gives a one-dimensional result. A (2, 1) column gives a (3, 1) column."],
say: String.raw`Each entry of a matrix-vector product is one row dotted with the vector, the inner dimensions must agree, and the result has one entry per row of the matrix.`,
num: String.raw`[[1, 3], [4, 0], [2, 1]] @ [1, 5]: row 1 gives 1·1 + 3·5 = <b>16</b>, row 2 gives 4·1 + 0·5 = <b>4</b>, row 3 gives 2·1 + 1·5 = <b>7</b>. Result <b>[16, 4, 7]</b>.`,
r(fig, ctl) {
  const A = [[1, 3], [4, 0], [2, 1]], x = [1, 5], out = A.map(r => r[0] * x[0] + r[1] * x[1]);
  ctl.innerHTML = "";
  const draw = k => {
    const i = k;
    let s = ML.grid(A, { x: 40, y: 50, cell: 52, hl: new Set([key(i, 0), key(i, 1)]), title: "A (3, 2)", rowLab: ["row 1", "row 2", "row 3"] }).s;
    s += ML.grid(x.map(v => [v]), { x: 190, y: 50, cell: 52, hl: new Set([key(0, 0), key(1, 0)]), title: "x (2, 1)", rowLab: false, colLab: false }).s;
    s += tx(280, 110, "=", "middle", "th");
    s += ML.grid(out.map((v, r) => [r <= i ? v : "?"]), { x: 310, y: 50, cell: 52, hl: new Set([key(i, 0)]), title: "Ax (3, 1)", rowLab: false, colLab: false, fmt: v => v }).s;
    s += ML.box(420, 60, 240, 70, "c-teal", [`row ${i + 1} · x`, `${A[i][0]}·${x[0]} + ${A[i][1]}·${x[1]} = ${out[i]}`]);
    s += tx(420, 160, "inner dimension: A has 2 columns, x has 2 entries", null) + tx(420, 178, "result has 3 entries, one per row of A", null);
    fig.innerHTML = svg(240, s) + ML.code(["A = np.array([[1, 3], [4, 0], [2, 1]])", "x = np.array([1, 5])", "print(A @ x)"], 2) + ML.term([k === 2 ? "[16  4  7]" : "..."]);
  };
  ML.stepper(ctl, 3, draw, ["row 1", "row 2", "row 3"]);
}},

{s: "4. The column view", t: "The same product as a combination of columns",
intu: String.raw`Read the matrix-vector product a second way. Instead of dotting rows, scale each column of the matrix by the matching entry of the vector and add the scaled columns. Gx = x₁g₁ + x₂g₂. Geometrically, the matrix moves the standard directions to its columns, and any input is the same combination of those new directions. The professor's example is G with columns (2, 1) and (1, 2) acting on x = (1, 2). Drag x₁ and x₂ and watch the two scaled columns add to the output. This picture is what a linear layer does to its input.`,
eq: String.raw`\[ Gx = x_1 g_1 + x_2 g_2, \qquad G = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix},\ x = \begin{bmatrix} 1 \\ 2 \end{bmatrix} \Rightarrow Gx = \begin{bmatrix} 2 \\ 1 \end{bmatrix} + 2\begin{bmatrix} 1 \\ 2 \end{bmatrix} = \begin{bmatrix} 4 \\ 5 \end{bmatrix} \]`,
sym: [[String.raw`\(g_1, g_2\)`, "the columns of G, where the unit directions land"], [String.raw`\(x_1, x_2\)`, "the weights on those columns"], ["Gx", "the weighted sum of the columns"], ["linear", "G(x + z) = Gx + Gz and G(cx) = cGx, which is why the picture works"]],
how: [String.raw`Write G as its columns \(g_1\) and \(g_2\).`, String.raw`Scale \(g_1\) by \(x_1\) and \(g_2\) by \(x_2\).`, "Add the two scaled vectors tip to tail.", "The result equals the row-by-row calculation of card 3, always.", "A layer X @ W is this with many inputs stacked as rows and many columns of W as output directions."],
say: String.raw`A matrix times a vector is a weighted sum of the matrix's columns with the vector's entries as weights, and the rows and columns views always give the same numbers.`,
num: String.raw`With x = (1, 2): <b>1·(2, 1) + 2·(1, 2) = (4, 5)</b>. Row view: 2·1 + 1·2 = 4 and 1·1 + 2·2 = 5. Same answer.`,
r(fig, ctl) {
  const G = [[2, 1], [1, 2]];
  ctl.innerHTML = sl("x1", "x₁", -3, 3, 0.5, 1) + sl("x2", "x₂", -3, 3, 0.5, 2) + `<div id="cv"></div>`;
  const u = () => {
    const x1 = +$("x1").value, x2 = +$("x2").value; $("x1v").textContent = x1; $("x2v").textContent = x2;
    const P = plane(20, 20, 320, 320, 6);
    let s = P.s;
    const g1 = [G[0][0], G[1][0]], g2 = [G[0][1], G[1][1]];
    s += arrow(P.X(0), P.Y(0), P.X(g1[0]), P.Y(g1[1]), C.gray, 1.5) + tx(P.X(g1[0]) + 8, P.Y(g1[1]) + 12, "g₁", "start") + arrow(P.X(0), P.Y(0), P.X(g2[0]), P.Y(g2[1]), C.gray, 1.5) + tx(P.X(g2[0]) - 8, P.Y(g2[1]) - 4, "g₂", "end");
    const a = [x1 * g1[0], x1 * g1[1]], b = [x2 * g2[0], x2 * g2[1]], o = [a[0] + b[0], a[1] + b[1]];
    const mid = (p, q) => [(P.X(p[0]) + P.X(q[0])) / 2, (P.Y(p[1]) + P.Y(q[1])) / 2];
    if (x1 !== 0) { s += arrow(P.X(0), P.Y(0), P.X(a[0]), P.Y(a[1]), C.blue, 2.5); const m = mid([0, 0], a); s += tx(m[0] + 10, m[1] + 14, "x₁g₁", "start", "th"); }
    if (x2 !== 0) { s += arrow(P.X(a[0]), P.Y(a[1]), P.X(o[0]), P.Y(o[1]), C.teal, 2.5); const m = mid(a, o); s += tx(m[0] - 10, m[1] - 6, "x₂g₂", "end", "th"); }
    s += arrow(P.X(0), P.Y(0), P.X(o[0]), P.Y(o[1]), C.coral, 3) + tx(P.X(o[0]) + (o[0] >= 0 ? 8 : -8), P.Y(o[1]) - 8, "Gx", o[0] >= 0 ? "start" : "end", "th");
    s += ML.box(380, 40, 280, 64, "c-coral", [`Gx = (${fmtN(o[0])}, ${fmtN(o[1])})`, `${fmtN(x1)}·(2, 1) + ${fmtN(x2)}·(1, 2)`]);
    s += tx(380, 140, "row view check:", null, "th") + tx(380, 160, `2·${fmtN(x1)} + 1·${fmtN(x2)} = ${fmtN(o[0])}`, null, "t") + tx(380, 180, `1·${fmtN(x1)} + 2·${fmtN(x2)} = ${fmtN(o[1])}`, null, "t");
    s += tx(380, 220, "gray: the columns of G", null) + tx(380, 238, "blue: first column scaled by x₁", null) + tx(380, 256, "teal: second column scaled by x₂, tip to tail", null) + tx(380, 274, "coral: their sum, which is Gx", null);
    fig.innerHTML = svg(350, s) + ML.code(["G = np.array([[2, 1], [1, 2]])", `x = np.array([${x1}, ${x2}])`, "print(G @ x, x[0] * G[:, 0] + x[1] * G[:, 1])"], 2);
  };
  $("x1").oninput = u; $("x2").oninput = u; u();
}},

{s: "5. The design matrix", t: "A model as one multiplication: the house price example",
intu: String.raw`The lecture's model predicts price from size, h(s) = −40 + 0.25s. Put the four house sizes in a matrix with a column of ones in front, put the two parameters in a vector θ = (−40, 0.25), and the four predictions are one product Xθ. The column of ones is what carries the intercept. Three competing models become three columns of a parameter matrix Θ, and XΘ gives a 4 × 3 table of predictions, one column per model. Click any cell of the prediction table to see the row and column that produced it.`,
eq: String.raw`\[ \hat{y} = X\theta = \begin{bmatrix} 1 & 2104 \\ 1 & 1416 \\ 1 & 1534 \\ 1 & 852 \end{bmatrix} \begin{bmatrix} -40 \\ 0.25 \end{bmatrix} = \begin{bmatrix} 486 \\ 314 \\ 343.5 \\ 173 \end{bmatrix}, \qquad \hat{Y} = X\Theta \in \mathbb{R}^{4 \times 3} \]`,
sym: [["X", "the design matrix, one row per house, a column of ones then the size"], [String.raw`\(\theta\)`, "the parameters, intercept first to match the column of ones"], [String.raw`\(X\theta\)`, "all predictions at once, shape (4,) or (4, 1)"], [String.raw`\(\Theta\)`, "three parameter vectors side by side as columns, shape (2, 3)"], [String.raw`\(\hat{Y}_{ij}\)`, "prediction of model j for house i"]],
how: ["Build X with <code>np.column_stack((np.ones(4), sizes))</code>.", "Order θ the same way as the columns: intercept, then slope.", "Xθ performs intercept + slope × size for every row in one call.", "For several models, stack their θ vectors as columns of Θ. Ŷ = XΘ has one column per model.", "The entry Ŷ_ij is row i of X dotted with column j of Θ, the card 3 rule applied to a matrix on the right."],
say: String.raw`A linear model is a matrix-vector product once the design matrix has a column of ones, and several models at once are a matrix-matrix product with one parameter column per model.`,
num: String.raw`Ŷ₃₂ is house 3 (size 1534) under model 2 (θ = (200, 0.10)): 200 + 0.10 × 1534 = <b>353.4</b>. Model 1 for house 1: −40 + 0.25 × 2104 = <b>486</b>.`,
note: String.raw`The professor calls this the central idea of the review: the column of ones turns intercept plus slope into one multiplication. HW3 builds exactly this X with <code>add_intercept</code>.`,
r(fig, ctl) {
  const sizes = [2104, 1416, 1534, 852], X = sizes.map(s => [1, s]), TH = [[-40, 200, -150], [0.25, 0.10, 0.40]];
  const Yh = matmul(X, TH);
  let sel = [2, 1], three = false;
  ctl.innerHTML = btns([[0, "one model: Xθ"], [1, "three models: XΘ"]], "k") + `<div id="dm"></div>`;
  const u = () => {
    pick(ctl, "k", three ? 1 : 0);
    const cols = three ? [0, 1, 2] : [0], j = three ? sel[1] : 0, i = sel[0];
    let s = ML.grid(X, { x: 60, y: 50, cell: 56, hl: new Set([key(i, 0), key(i, 1)]), title: "X (4, 2)", rowLab: ["h1", "h2", "h3", "h4"], colLab: ["1", "size"] }).s;
    const Tsub = TH.map(r => cols.map(c => r[c]));
    s += ML.grid(Tsub, { x: 210, y: 50, cell: 56, hl: new Set([key(0, j), key(1, j)]), title: three ? "Θ (2, 3)" : "θ (2, 1)", rowLab: false, colLab: three ? ["m1", "m2", "m3"] : ["m1"], fmt: v => v }).s;
    const Ysub = Yh.map(r => cols.map(c => r[c]));
    const gx = three ? 420 : 330;
    s += tx(gx - 25, 160, "=", "middle", "th") + ML.grid(Ysub, { x: gx, y: 50, cell: 56, hl: new Set([key(i, j)]), title: three ? "Ŷ = XΘ (4, 3)" : "ŷ = Xθ (4, 1)", rowLab: false, colLab: three ? ["m1", "m2", "m3"] : ["m1"], fmt: v => fmtN(v) }).s;
    for (let r = 0; r < 4; r++) for (let c = 0; c < cols.length; c++) s += `<rect data-c="${r},${c}" x="${gx + c * 56}" y="${50 + r * 56}" width="53" height="53" fill="transparent" style="cursor:pointer"/>`;
    s += tx(60, 300, `row ${i + 1} of X · column ${j + 1} of ${three ? "Θ" : "θ"}: 1·(${TH[0][j]}) + ${sizes[i]}·${TH[1][j]} = ${fmtN(Yh[i][j])}`, null, "th");
    fig.innerHTML = svg(320, s) + ML.code(["X = np.column_stack((np.ones(4), np.array([2104, 1416, 1534, 852])))", three ? "Theta = np.array([[-40, 200, -150], [0.25, 0.10, 0.40]])" : "theta = np.array([-40, 0.25])", three ? "Y_hat = X @ Theta    # (4, 2) @ (2, 3) -> (4, 3)" : "y_hat = X @ theta    # (4, 2) @ (2,) -> (4,)"], 2);
    fig.querySelectorAll("rect[data-c]").forEach(e => e.onclick = () => { const p = e.dataset.c.split(",").map(Number); sel = [p[0], three ? p[1] : 0]; u(); });
    $("dm").innerHTML = `<p class="note">${three ? "Each column of Ŷ is one model's predictions for all four houses. Ŷ₃₂ = 353.4 is the lecture's example." : "The column of ones multiplies the intercept, so every prediction gets −40 added. Click a cell."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { three = b.dataset.k === "1"; u(); }); u();
}},

{s: "6. Matrix times matrix", t: "Matrix-matrix product: a dot product for every row-column pair",
intu: String.raw`AB is defined when the columns of A match the rows of B. The result has A's rows and B's columns, and entry (i, j) is row i of A dotted with column j of B. Step through the professor's 2 × 3 times 3 × 2 example and watch each of the four entries being computed. The shape rule (m × n)(n × p) = m × p is the one to say aloud before every @ in Part 5, where a layer's weight matrix is the B and the batch is the A.`,
eq: String.raw`\[ (AB)_{ij} = \sum_{k=1}^{n} A_{ik} B_{kj}, \qquad (m \times n)(n \times p) = (m \times p) \]`,
sym: [["A", "shape m × n, 2 × 3 here"], ["B", "shape n × p, 3 × 2 here"], ["AB", "shape m × p, 2 × 2 here"], ["inner n", "A's columns and B's rows, must match, disappears from the result"], ["cost", "m·n·p scalar multiplications"]],
how: ["Write the shapes side by side: (2 × 3)(3 × 2). The inner 3s match. The result is 2 × 2.", "For entry (1, 1): row 1 of A dotted with column 1 of B.", "For entry (1, 2): row 1 of A dotted with column 2 of B.", "Continue for every row-column pair.", "In NumPy, A @ B. With a (3,) vector on the right you get a vector, with a (3, 1) column you get a column."],
say: String.raw`A matrix product takes every row of the left matrix against every column of the right, the inner dimensions must match and vanish, and the result has the left's rows and the right's columns.`,
num: String.raw`A = [[1, 3, 2], [4, 0, 1]], B = [[1, 3], [0, 1], [5, 2]]. C₁₁ = 1·1 + 3·0 + 2·5 = <b>11</b>, C₁₂ = 1·3 + 3·1 + 2·2 = <b>10</b>, C₂₁ = <b>9</b>, C₂₂ = <b>14</b>.`,
r(fig, ctl) {
  const A = [[1, 3, 2], [4, 0, 1]], B = [[1, 3], [0, 1], [5, 2]], Cm = matmul(A, B);
  const cells = [[0, 0], [0, 1], [1, 0], [1, 1]];
  ctl.innerHTML = "";
  const draw = k => {
    const [i, j] = cells[k];
    let s = ML.grid(A, { x: 40, y: 50, cell: 48, hl: new Set([0, 1, 2].map(c => key(i, c))), title: "A (2, 3)", rowLab: false }).s;
    s += ML.grid(B, { x: 210, y: 50, cell: 48, hl: new Set([0, 1, 2].map(r => key(r, j))), title: "B (3, 2)", rowLab: false }).s;
    s += tx(335, 100, "=", "middle", "th");
    s += ML.grid(Cm.map((r, ri) => r.map((v, ci) => cells.findIndex(c => c[0] === ri && c[1] === ci) <= k ? v : "?")), { x: 360, y: 50, cell: 48, hl: new Set([key(i, j)]), title: "AB (2, 2)", rowLab: false, fmt: v => v }).s;
    s += ML.box(470, 50, 190, 70, "c-teal", [`entry (${i + 1}, ${j + 1})`, `${A[i].map((v, c) => v + "·" + B[c][j]).join(" + ")}`, `= ${Cm[i][j]}`]);
    s += tx(40, 230, "shapes: (2 × 3)(3 × 2) → (2 × 2). The inner 3 vanishes. Cost 2·3·2 = 12 multiplications.", null);
    fig.innerHTML = svg(250, s) + ML.code(["A = np.array([[1, 3, 2], [4, 0, 1]])", "B = np.array([[1, 3], [0, 1], [5, 2]])", "print(A @ B)"], 2) + ML.term(k === 3 ? ["[[11 10]", " [ 9 14]]"] : ["..."]);
  };
  ML.stepper(ctl, 4, draw, ["entry (1,1)", "entry (1,2)", "entry (2,1)", "entry (2,2)"]);
}},

{s: "7. Order matters", t: "AB is not BA, but (AB)C is A(BC)",
intu: String.raw`Matrix multiplication is not commutative. The professor's picture: rotate a vector by 90° then stretch it horizontally, or stretch first then rotate, and the two results point in different directions. Press the two orders and watch x = (1, 1) go to different places. Multiplication is associative, so the grouping of three factors does not change the answer, but it can change the cost enormously: the review's 1000 × 2 times 2 × 1000 times 1000 × 1 example costs 3,000,000 multiplications one way and 4,000 the other.`,
eq: String.raw`\[ AB \neq BA \text{ in general}, \qquad (AB)C = A(BC), \qquad A(B + C) = AB + AC \]`,
sym: [["R", "rotation by 90°, columns (0, 1) and (−1, 0)"], ["S", "stretch x by 2, columns (2, 0) and (0, 1)"], ["SRx", "rotate first, then stretch: (−2, 1)"], ["RSx", "stretch first, then rotate: (−1, 2)"], ["grouping", "same result, different intermediate shapes and cost"]],
how: ["Read a product right to left when it acts on a vector: SRx applies R first.", "Compute Rx = (−1, 1), then S(−1, 1) = (−2, 1).", "Compute Sx = (2, 1), then R(2, 1) = (−1, 2). Different.", "For three factors, group to keep intermediates small: with A 1000 × 2, B 2 × 1000, c 1000 × 1, compute Bc first.", "In floating point, groupings differ in the last digits. Compare with np.allclose, not ==."],
say: String.raw`The order of a product changes the result, the grouping does not, and the grouping is chosen for cost because the rule is m times n times p multiplications per product.`,
num: String.raw`A = [[1, 2], [0, 1]], B = [[2, 0], [1, 3]], c = (1, 2): AB = [[4, 6], [1, 3]], (AB)c = <b>(16, 7)</b>. Bc = (2, 7), A(Bc) = <b>(16, 7)</b>. Same.`,
r(fig, ctl) {
  const R = [[0, -1], [1, 0]], S = [[2, 0], [0, 1]], x = [1, 1];
  const ap = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
  let k = 0;
  ctl.innerHTML = btns([[0, "SRx: rotate, then stretch"], [1, "RSx: stretch, then rotate"], [2, "grouping and cost"]], "k") + `<div id="ox"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    if (k < 2) {
      const P = plane(20, 20, 300, 300, 3);
      s += P.s;
      const first = k === 0 ? R : S, second = k === 0 ? S : R, mid = ap(first, x), out = ap(second, mid);
      s += vec(P, x[0], x[1], C.gray, 2, "x") + vec(P, mid[0], mid[1], C.blue, 2.5, k === 0 ? "Rx" : "Sx") + vec(P, out[0], out[1], C.coral, 3, k === 0 ? "SRx" : "RSx");
      s += ML.box(360, 40, 300, 60, "c-coral", [`${k === 0 ? "SR" : "RS"}x = (${fmtN(out[0])}, ${fmtN(out[1])})`, `${k === 0 ? "R" : "S"} first gives (${fmtN(mid[0])}, ${fmtN(mid[1])})`]);
      s += tx(360, 130, "R = [[0, −1], [1, 0]]  rotates 90° counterclockwise", null) + tx(360, 150, "S = [[2, 0], [0, 1]]  doubles the x coordinate", null) + tx(360, 180, k === 0 ? "the other order lands at (−1, 2)" : "the other order lands at (−2, 1)", null, "th") + tx(360, 210, "SR = [[0, −2], [1, 0]] and RS = [[0, −1], [2, 0]]", null) + tx(360, 230, "two different matrices", null);
      fig.innerHTML = svg(330, s) + ML.code(["R = np.array([[0, -1], [1, 0]]); S = np.array([[2, 0], [0, 1]])", "x = np.array([1, 1])", k === 0 ? "print(S @ R @ x)   # R acts first" : "print(R @ S @ x)   # S acts first"], 2) + ML.term([`[${fmtN(out[0])} ${fmtN(out[1])}]`]);
    } else {
      const rows = [["(AB)c", "A B first: 1000 × 1000", "3,000,000"], ["A(Bc)", "B c first: 2 × 1", "4,000"]];
      rows.forEach((r, i) => { const y = 40 + i * 90; s += ML.box(20, y, 120, 60, i ? "c-teal" : "c-coral", [r[0]]) + ML.box(160, y, 230, 60, i ? "c-teal" : "c-coral", ["intermediate", r[1]], false) + ML.box(410, y, 250, 60, i ? "c-teal" : "c-coral", ["scalar multiplications", r[2]], false); });
      s += tx(20, 240, "A is 1000 × 2, B is 2 × 1000, c is 1000 × 1. Same answer, 750 times the work.", null, "th") + tx(20, 262, "Rule: (m × n)(n × p) costs m·n·p. AB costs 1000·2·1000, then (AB)c costs 1000·1000·1.", null);
      fig.innerHTML = svg(280, s) + ML.code(["left = (A @ B) @ c", "right = A @ (B @ c)", "assert np.allclose(left, right)   # not ==, rounding differs"], 2);
    }
    $("ox").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "8. Identity and inverse", t: "The matrix one, the matrix reciprocal, and when there is none",
intu: String.raw`The identity I has ones on the diagonal and leaves every input unchanged. A square matrix A has an inverse when some A⁻¹ undoes it: AA⁻¹ = I. For 2 × 2 there is a formula with the determinant ad − bc in the denominator, so a zero determinant means no inverse. The professor's picture is the unit square: a nonsingular matrix moves it to a parallelogram you can map back from, while the singular S = [[1, 2], [2, 4]] flattens it onto a line, and two different inputs land on the same output, so nothing can undo it. Pick a matrix and watch the square.`,
eq: String.raw`\[ A^{-1} = \frac{1}{ad - bc} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}, \qquad Ax = b \Rightarrow x = A^{-1} b, \qquad \det A = 0 \Rightarrow \text{singular} \]`,
sym: [[String.raw`\(I_n\)`, "n × n identity, <code>np.eye(n)</code>, with \\(I_m A = A I_n = A\\)"], ["A⁻¹", "the inverse, defined only for square nonsingular A"], ["det A", "ad − bc for 2 × 2, zero exactly when the columns are dependent"], ["singular", "no inverse: the columns are dependent and the map collapses a dimension"], ["np.linalg.solve", "solves Ax = b without forming the inverse"]],
how: ["Compute det = ad − bc. If zero, stop: singular.", "Otherwise swap a and d, negate b and c, divide by det.", "Check AA⁻¹ = I by multiplying.", "To solve Ax = b in code, call np.linalg.solve(A, b), not inv(A) @ b, and check the residual A @ x − b.", "1 / A in NumPy is entrywise reciprocals, not an inverse."],
say: String.raw`The identity is the matrix one, the inverse undoes a square nonsingular matrix, a zero determinant means the columns are dependent and the map loses a dimension, and code should solve systems rather than form inverses.`,
num: String.raw`A = [[2, 1], [1, 1]]: det = 2·1 − 1·1 = <b>1</b>, A⁻¹ = <b>[[1, −1], [−1, 2]]</b>. Solving Ax = (5, 3) gives x = <b>(2, 1)</b>. S = [[1, 2], [2, 4]]: det = <b>0</b>, singular, rank 1.`,
note: String.raw`Exam form: given a 2 × 2 matrix, say whether it is invertible and why. The answer is the determinant and the dependent columns, both in one sentence.`,
r(fig, ctl) {
  const MS = [["A = [[2, 1], [1, 1]]", [[2, 1], [1, 1]]], ["S = [[1, 2], [2, 4]]", [[1, 2], [2, 4]]], ["R = [[0, −1], [1, 0]]", [[0, -1], [1, 0]]], ["I = [[1, 0], [0, 1]]", [[1, 0], [0, 1]]]];
  let k = 0;
  ctl.innerHTML = btns(MS.map((m, i) => [i, m[0].split(" = ")[0]]), "k") + `<div id="iv"></div>`;
  const ap = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
  const u = () => {
    pick(ctl, "k", k);
    const M = MS[k][1], det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    const P = plane(20, 20, 300, 300, k === 1 ? 6 : 3);
    let s = P.s;
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]], img = sq.map(p => ap(M, p));
    s += `<polygon points="${sq.map(p => P.X(p[0]) + "," + P.Y(p[1])).join(" ")}" fill="${C.gray}" fill-opacity="0.25" stroke="${C.gray}"/>`;
    s += `<polygon points="${img.map(p => P.X(p[0]) + "," + P.Y(p[1])).join(" ")}" fill="${det === 0 ? C.coral : C.teal}" fill-opacity="0.3" stroke="${det === 0 ? C.coral : C.teal}" stroke-width="2"/>`;
    img.forEach((p, i) => s += `<circle cx="${P.X(p[0])}" cy="${P.Y(p[1])}" r="3.5" fill="${det === 0 ? C.coral : C.teal}"/>`);
    s += tx(360, 40, MS[k][0], null, "th") + tx(360, 62, `det = ${M[0][0]}·${M[1][1]} − ${M[0][1]}·${M[1][0]} = ${det}`, null, "t");
    if (det !== 0) { const inv = [[M[1][1] / det, -M[0][1] / det], [-M[1][0] / det, M[0][0] / det]]; s += tx(360, 90, "invertible: the square becomes a parallelogram", null) + tx(360, 108, "of area |det| = " + Math.abs(det) + ", every output has one input", null); s += ML.grid(inv, { x: 380, y: 150, cell: 44, title: "A⁻¹", rowLab: false, colLab: false, fmt: v => fmtN(v) }).s; s += tx(490, 180, "A @ A⁻¹ = I", null); }
    else { s += tx(360, 90, "singular: the square collapses onto a line", null) + tx(360, 108, "(1, 0) → (1, 2) and (0, 1) → (2, 4): same direction", null) + tx(360, 126, "rank 1, columns dependent (second = 2 × first)", null) + tx(360, 154, "Sx = (2, 4) has infinitely many solutions", null) + tx(360, 172, "Sx = (2, 5) has none, (2, 5) is off the line", null); }
    s += tx(360, 300, "gray: unit square. colored: its image under the matrix.", null);
    fig.innerHTML = svg(330, s) + ML.code([`M = np.array(${JSON.stringify(M).replace(/,/g, ", ")}, dtype=float)`, "print(np.linalg.det(M))", det !== 0 ? "x = np.linalg.solve(M, b)   # never np.linalg.inv(M) @ b" : "np.linalg.solve(M, b)       # raises LinAlgError: singular matrix"], 2);
    $("iv").innerHTML = ML.readout([["det", String(det)], ["rank", det !== 0 ? "2" : "1"], ["inverse", det !== 0 ? "exists" : "none"]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "9. Transpose", t: "Transpose, inner product, outer product",
intu: String.raw`The transpose turns rows into columns: (Aᵀ)ᵢⱼ = Aⱼᵢ, and an m × n matrix becomes n × m. Its use in the course is to line shapes up. xᵀx is 1 × 1, the squared length of x. xxᵀ is n × n, the outer product. Same symbols, opposite order, different objects. Two identities you will use: (Aᵀ)ᵀ = A and (AB)ᵀ = BᵀAᵀ, the order reverses. Click a cell of A to see where it lands in Aᵀ, then switch to the inner and outer products of x = (2, 3).`,
eq: String.raw`\[ (A^T)_{ij} = A_{ji}, \qquad x^T x = \|x\|^2 = 13, \qquad x x^T = \begin{bmatrix} 4 & 6 \\ 6 & 9 \end{bmatrix}, \qquad (AB)^T = B^T A^T \]`,
sym: [["Aᵀ", "rows become columns, shape m × n becomes n × m"], ["xᵀx", "inner product, a single number, the squared Euclidean length"], ["xxᵀ", "outer product, an n × n matrix of all pairwise products"], ["(AB)ᵀ", "equals BᵀAᵀ, the order reverses so the shapes still chain"], ["A.T", "NumPy transpose, a view with no copy, and a no-op on a 1D array"]],
how: ["Write row i of A as column i of Aᵀ.", "Shape check: A is 2 × 3, Aᵀ is 3 × 2. The entry A₂₃ = 9 becomes (Aᵀ)₃₂.", "xᵀx: (1 × 2)(2 × 1) = 1 × 1. Multiply matching entries, add.", "xxᵀ: (2 × 1)(1 × 2) = 2 × 2. Every entry of x times every entry of x.", "For AᵀA with A of shape 4 × 2 the result is 2 × 2. AAᵀ is 4 × 4. Both exist and mean different things."],
say: String.raw`Transposing swaps rows and columns, a row times a column is a number and a column times a row is a matrix, and the transpose of a product reverses the factors.`,
num: String.raw`A = [[1, 2, 0], [3, 5, 9]] has Aᵀ = <b>[[1, 3], [2, 5], [0, 9]]</b>. x = (2, 3): xᵀx = 4 + 9 = <b>13</b>, ‖x‖ = √13 ≈ 3.606, xxᵀ = <b>[[4, 6], [6, 9]]</b>.`,
r(fig, ctl) {
  const A = [[1, 2, 0], [3, 5, 9]], At = T(A), x = [2, 3];
  let k = 0, sel = [1, 2];
  ctl.innerHTML = btns([[0, "transpose"], [1, "inner xᵀx"], [2, "outer xxᵀ"]], "k") + `<div id="tp"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    if (k === 0) {
      s += ML.grid(A, { x: 40, y: 50, cell: 50, hl: new Set([key(sel[0], sel[1])]), hl2: new Set([0, 1, 2].map(c => key(0, c))), title: "A (2, 3)", rowLab: false }).s;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) s += `<rect data-c="${i},${j}" x="${40 + j * 50}" y="${50 + i * 50}" width="47" height="47" fill="transparent" style="cursor:pointer"/>`;
      s += arrow(205, 100, 245, 100, C.teal, 2) + tx(225, 90, "T", "middle", "th");
      s += ML.grid(At, { x: 270, y: 50, cell: 50, hl: new Set([key(sel[1], sel[0])]), hl2: new Set([0, 1, 2].map(r => key(r, 0))), title: "Aᵀ (3, 2)", rowLab: false }).s;
      s += ML.box(420, 50, 240, 60, "c-teal", [`A${SUB[sel[0] + 1]}${SUB[sel[1] + 1]} = ${A[sel[0]][sel[1]]} becomes (Aᵀ)${SUB[sel[1] + 1]}${SUB[sel[0] + 1]}`, "row i, column j → row j, column i"]);
      s += tx(420, 140, "coral: the first row of A is the first column of Aᵀ", null) + tx(420, 158, "click a cell of A", null);
      fig.innerHTML = svg(240, s) + ML.code(["A = np.array([[1, 2, 0], [3, 5, 9]])", "print(A.T.shape)", `print(A[${sel[0]}, ${sel[1]}] == A.T[${sel[1]}, ${sel[0]}])`], 2) + ML.term(["(3, 2)", "True"]);
      fig.querySelectorAll("rect[data-c]").forEach(e => e.onclick = () => { sel = e.dataset.c.split(",").map(Number); u(); });
    } else if (k === 1) {
      s += ML.grid([x], { x: 40, y: 60, cell: 50, title: "xᵀ (1, 2)", rowLab: false, colLab: false }).s + ML.grid(x.map(v => [v]), { x: 170, y: 40, cell: 50, title: "x (2, 1)", rowLab: false, colLab: false }).s + tx(250, 90, "=", "middle", "th") + ML.grid([[13]], { x: 280, y: 60, cell: 50, hl: new Set(["0,0"]), title: "(1, 1)", rowLab: false, colLab: false }).s;
      s += ML.box(380, 50, 280, 60, "c-teal", ["2·2 + 3·3 = 13", "the squared length, ‖x‖ = √13 ≈ 3.606"]) + tx(380, 140, "(1 × 2)(2 × 1): inner 2s match, result 1 × 1", null) + tx(380, 158, "in NumPy with 1D x: x @ x gives 13 with shape ()", null);
      fig.innerHTML = svg(200, s) + ML.code(["x = np.array([2.0, 3.0])", "print(x @ x, np.linalg.norm(x) ** 2)", "col = x.reshape(2, 1); print((col.T @ col).shape)"], 1) + ML.term(["13.0 13.000000000000002", "(1, 1)"]);
    } else {
      s += ML.grid(x.map(v => [v]), { x: 40, y: 40, cell: 50, title: "x (2, 1)", rowLab: false, colLab: false }).s + ML.grid([x], { x: 120, y: 60, cell: 50, title: "xᵀ (1, 2)", rowLab: false, colLab: false }).s + tx(250, 90, "=", "middle", "th") + ML.grid([[4, 6], [6, 9]], { x: 280, y: 40, cell: 50, title: "xxᵀ (2, 2)", rowLab: false, colLab: false }).s;
      s += ML.box(410, 50, 250, 60, "c-teal", ["entry (i, j) = x_i · x_j", "[[2·2, 2·3], [3·2, 3·3]]"]) + tx(410, 140, "(2 × 1)(1 × 2): inner 1s match, result 2 × 2", null) + tx(410, 158, "np.outer(x, x), or col @ col.T", null);
      fig.innerHTML = svg(200, s) + ML.code(["x = np.array([2.0, 3.0])", "col = x.reshape(2, 1)", "print(col @ col.T)"], 2) + ML.term(["[[4. 6.]", " [6. 9.]]"]);
    }
    $("tp").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "10. NumPy shape traps", t: "Elementwise is not matrix, and (3, 1) minus (3,) is a trap",
intu: String.raw`Two NumPy facts the review singles out. First, <code>*</code> multiplies matching entries, the Hadamard product, while <code>@</code> is the matrix product, and both run without complaint on the same two arrays. Second, broadcasting can manufacture a wrong answer: predictions stored as (3, 1) minus targets stored as (3,) gives a 3 × 3 matrix of every pair of differences, and the mean of its squares is 7/3 instead of the true MSE of 1/3. No error is raised. Toggle between the two traps.`,
eq: String.raw`\[ A \odot B \ne AB, \qquad (3, 1) - (3,) \to (3, 3) \text{ silently}, \quad \text{wrong MSE } \tfrac{7}{3} \text{ instead of } \tfrac{1}{3} \]`,
sym: [["A ⊙ B", "Hadamard product, entry by entry, same shape, NumPy *"], ["AB", "matrix product, NumPy @"], ["silent broadcast", "(n, 1) against (n,) becomes (n, n) with no error"], ["the fix", "reshape the target to (n, 1), or the prediction to (n,), then assert equal shapes"]],
how: ["Decide which product you mean before typing * or @.", "For residuals, print pred.shape and target.shape. They must be identical.", "If one is (n, 1) and the other (n,), reshape one of them.", "Assert pred.shape == target.shape before any mean or sum.", "A finished computation is not a verified one. Verify the shape, then the number."],
say: String.raw`Star is entrywise and at-sign is the matrix product, and a column minus a one-dimensional array broadcasts to a square matrix that averages to the wrong number without any error.`,
num: String.raw`A = [[1, 3], [2, 5]], B = [[0, 1], [3, 2]]: A * B = <b>[[0, 3], [6, 10]]</b>, A @ B = <b>[[9, 7], [15, 12]]</b>. pred (1, 2, 3) as (3, 1) minus target (1, 2, 4) as (3,): mean of squares <b>21/9 = 7/3</b>, correct MSE <b>1/3</b>.`,
note: String.raw`HW3 and HW6 both assert <code>y_hat.shape == y.shape</code> before the loss. The project should too. This is the single most common silent bug in student PyTorch code, where a (batch, 1) output meets a (batch,) target.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns([[0, "* versus @"], [1, "the broadcast trap"], [2, "the fix"]], "k") + `<div id="np"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    if (k === 0) {
      const A = [[1, 3], [2, 5]], B = [[0, 1], [3, 2]];
      s += ML.grid(A, { x: 40, y: 40, cell: 46, title: "A", rowLab: false, colLab: false }).s + ML.grid(B, { x: 150, y: 40, cell: 46, title: "B", rowLab: false, colLab: false }).s;
      s += ML.grid(A.map((r, i) => r.map((v, j) => v * B[i][j])), { x: 300, y: 40, cell: 46, title: "A * B (elementwise)", rowLab: false, colLab: false }).s + ML.grid(matmul(A, B), { x: 500, y: 40, cell: 46, title: "A @ B (matrix)", rowLab: false, colLab: false }).s;
      s += tx(300, 160, "(A * B)₁₁ = 1·0 = 0", null, "t") + tx(500, 160, "(A @ B)₁₁ = 1·0 + 3·3 = 9", null, "t") + tx(40, 200, "Both lines run. Only one of them is the product the math meant.", null, "th");
      fig.innerHTML = svg(220, s) + ML.code(["A = np.array([[1, 3], [2, 5]]); B = np.array([[0, 1], [3, 2]])", "elementwise = A * B", "matrix_product = A @ B"], -1);
    } else if (k === 1) {
      const pred = [1, 2, 3], tgt = [1, 2, 4], D = pred.map(p => tgt.map(t => p - t));
      s += ML.grid(pred.map(v => [v]), { x: 40, y: 50, cell: 44, title: "pred (3, 1)", rowLab: false, colLab: false }).s + tx(130, 110, "−", "middle", "th") + ML.grid(tgt, { x: 150, y: 90, cell: 44, title: "target (3,)", rowLab: false, colLab: false }).s + tx(300, 110, "=", "middle", "th");
      s += ML.grid(D, { x: 330, y: 50, cell: 44, hl2: new Set(["0,0", "1,1", "2,2"]), title: "(3, 3): every pred minus every target", rowLab: false, colLab: false }).s;
      s += tx(330, 200, "coral diagonal: the three residuals you wanted, (0, 0, −1)", null) + tx(330, 218, "mean of all nine squares: 21/9 = 2.333, true MSE: 1/3 = 0.333", null, "th");
      fig.innerHTML = svg(240, s) + ML.code(["pred = np.array([[1.0], [2.0], [3.0]])", "target = np.array([1.0, 2.0, 4.0])", "bad = pred - target          # shape (3, 3), no error", "print(np.mean(bad ** 2))      # 2.333..., wrong"], 2) + ML.term(["2.3333333333333335"]);
    } else {
      s += ML.grid([[1], [2], [3]], { x: 40, y: 50, cell: 44, title: "pred (3, 1)", rowLab: false, colLab: false }).s + tx(130, 110, "−", "middle", "th") + ML.grid([[1], [2], [4]], { x: 160, y: 50, cell: 44, title: "target (3, 1)", rowLab: false, colLab: false }).s + tx(250, 110, "=", "middle", "th") + ML.grid([[0], [0], [-1]], { x: 280, y: 50, cell: 44, hl: new Set(["0,0", "1,0", "2,0"]), title: "residual (3, 1)", rowLab: false, colLab: false }).s;
      s += ML.box(400, 60, 260, 60, "c-teal", ["MSE = (0 + 0 + 1) / 3 = 1/3", "one residual per sample"]) + tx(400, 150, "the assertion is the fix that stays fixed", null, "th");
      fig.innerHTML = svg(220, s) + ML.code(["target_col = target.reshape(3, 1)", "assert pred.shape == target_col.shape", "residual = pred - target_col", "mse = np.mean(residual ** 2)   # 0.333..."], 1) + ML.term(["0.3333333333333333"]);
    }
    $("np").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "11. All together", t: "The hardness example: design matrix to RMSE",
intu: String.raw`The review's section 10 chains every operation on an invented engineering table: four specimens with descriptors p and q, a model ĥ = 100 + 10p + 5q, and observed hardness values. The design matrix has a ones column then p and q, θ = (100, 10, 5), and Xθ gives the four predictions in one product. Residuals are prediction minus observation, the squared residuals average to the MSE, and the square root returns to the target's units. Step through it. This is the forward half of Lesson 15, and the gradient in Lesson 13 is one more product away.`,
eq: String.raw`\[ \hat{h} = X\theta, \qquad r = \hat{h} - h, \qquad \text{MSE} = \frac{r^T r}{m} = \frac{4 + 4 + 1 + 1}{4} = 2.5, \qquad \text{RMSE} = \sqrt{2.5} \approx 1.58 \]`,
sym: [["X", "4 × 3: ones, p, q"], [String.raw`\(\theta\)`, "(100, 10, 5), in the same order as the columns"], ["ĥ", "Xθ, four predictions"], ["r", "ĥ − h, positive means overprediction in this convention"], ["rᵀr", "the sum of squared residuals, an inner product"], ["RMSE", "square root of MSE, in the target's units"]],
how: ["Stack ones, p and q as columns of X with <code>np.column_stack</code>.", "Multiply: Xθ. Shapes (4, 3) @ (3, 1) → (4, 1).", "Subtract the observed column. Assert equal shapes first.", "Square, sum (that is rᵀr), divide by m.", "Square root for RMSE. Report it with its unit, HV here."],
say: String.raw`Predictions are the design matrix times the parameters, residuals are predictions minus observations with shapes asserted equal, MSE is the mean squared residual, and RMSE puts the error back in the target's units.`,
num: String.raw`X rows (1, 0, 1), (1, 1, 0), (1, 2, 1), (1, 3, 2). Predictions <b>(105, 110, 125, 140)</b>, observed (107, 108, 126, 139), residuals <b>(−2, 2, −1, 1)</b>, MSE <b>2.5</b>, RMSE <b>1.58 HV</b>.`,
note: String.raw`The professor's own caveat: the numbers are invented for arithmetic practice, not a hardness law. Say the same about any toy table in your project slides.`,
r(fig, ctl) {
  const F = [[0, 1], [1, 0], [2, 1], [3, 2]], X = F.map(r => [1, ...r]), th = [100, 10, 5], obs = [107, 108, 126, 139];
  const pred = X.map(r => r[0] * th[0] + r[1] * th[1] + r[2] * th[2]), res = pred.map((p, i) => p - obs[i]), sq = res.map(v => v * v), mse = sq.reduce((a, b) => a + b, 0) / 4;
  ctl.innerHTML = "";
  const draw = k => {
    let s = ML.grid(X, { x: 40, y: 50, cell: 44, hl: k === 0 ? new Set(X.flatMap((r, i) => r.map((_, j) => key(i, j)))) : undefined, title: "X (4, 3)", rowLab: ["s1", "s2", "s3", "s4"], colLab: ["1", "p", "q"] }).s;
    s += ML.grid(th.map(v => [v]), { x: 190, y: 50, cell: 44, title: "θ (3, 1)", rowLab: false, colLab: false, hl: k === 0 ? new Set(["0,0", "1,0", "2,0"]) : undefined }).s;
    const cols = [["ĥ = Xθ", pred, 0], ["h observed", obs, 1], ["r = ĥ − h", res, 2], ["r²", sq, 3]];
    cols.forEach(([t, v, at], c) => { if (k >= at) s += ML.grid(v.map(x => [x]), { x: 270 + c * 95, y: 50, cell: 44, title: t, rowLab: false, colLab: false, hl: k === at ? new Set(["0,0", "1,0", "2,0", "3,0"]) : undefined }).s; });
    const msg = ["row 1: 1·100 + 0·10 + 1·5 = 105. Each prediction is one row of X dotted with θ.", "The observed hardness, in HV. Shapes: ĥ is (4, 1), h must be (4, 1) too.", "Residual = prediction − observation. Specimen 1: 105 − 107 = −2, an underprediction. Specimen 2: +2, an overprediction.", "Square each residual: 4, 4, 1, 1.", "rᵀr = 10. MSE = 10 / 4 = 2.5. RMSE = √2.5 ≈ 1.58 HV, back in the target's units."][k];
    s += tx(40, 268, msg, null);
    if (k === 4) s += ML.box(40, 285, 620, 44, "c-teal", ["rᵀr = 10,   MSE = 2.5,   RMSE = 1.581 HV"]);
    fig.innerHTML = svg(k === 4 ? 340 : 280, s) + ML.code(["features = np.array([[0, 1], [1, 0], [2, 1], [3, 2]], dtype=float)", "X = np.column_stack((np.ones(4), features))", "theta = np.array([[100.0], [10.0], [5.0]])", "observed = np.array([[107.0], [108.0], [126.0], [139.0]])", "predicted = X @ theta", "assert predicted.shape == observed.shape", "residual = predicted - observed", "mse = np.mean(residual ** 2)   # 2.5", "rmse = np.sqrt(mse)            # 1.58"], [4, 3, 6, 7, 8][k]);
  };
  ML.stepper(ctl, 5, draw, ["predict", "observe", "residual", "square", "average and root"]);
}},

{s: "12. Least squares preview", t: "Learning θ: the line that minimizes the squared residuals",
intu: String.raw`So far θ was given. Learning reverses the question: which θ makes Xθ closest to y? The review's section 11 uses three points, (0, 1), (1, 2), (2, 2), that no line passes through. Least squares picks the θ that minimizes the sum of squared residuals. Drag the intercept and slope and watch the sum. Then press the button to jump to the optimum, where the residual vector is orthogonal to every column of X, which is the normal equations XᵀXθ = Xᵀy. Solving them by hand gives θ₁ = 1/2 and θ₀ = 7/6. Part 4 derives this and gradient descent reaches the same place.`,
eq: String.raw`\[ \min_\theta \|X\theta - y\|^2, \qquad X^T(X\theta - y) = 0 \ \Rightarrow\ X^T X \theta = X^T y, \qquad \theta = \left(\tfrac{7}{6}, \tfrac{1}{2}\right) \]`,
sym: [["X", "rows (1, 0), (1, 1), (1, 2): ones and the s values"], ["y", "(1, 2, 2)"], [String.raw`\(\|X\theta - y\|^2\)`, "the sum of squared residuals, the quantity to minimize"], ["normal equations", "XᵀXθ = Xᵀy, true at the minimum"], ["np.linalg.lstsq", "solves the rectangular problem directly, without forming (XᵀX)⁻¹"]],
how: ["Write X with a ones column and y as a column.", "For any θ, residual r = Xθ − y, cost rᵀr.", "At the optimum Xᵀr = 0: each column of X is orthogonal to the residual.", "XᵀX = [[3, 3], [3, 5]], Xᵀy = [[5], [6]]. Subtract the equations: 2θ₁ = 1, so θ₁ = 1/2, then 3θ₀ + 3/2 = 5 gives θ₀ = 7/6.", "In code, theta, *_ = np.linalg.lstsq(X, y, rcond=None), then check np.allclose(X.T @ (X @ theta − y), 0)."],
say: String.raw`Least squares chooses the parameters that minimize the sum of squared residuals, the minimum is where the residual is orthogonal to the columns of the design matrix, and code calls lstsq rather than inverting anything.`,
num: String.raw`Optimum θ = (7/6, 1/2): predictions <b>(7/6, 5/3, 13/6)</b>, residuals <b>(1/6, −1/3, 1/6)</b>, rᵀr = <b>1/6 ≈ 0.1667</b>. Xᵀr = (0, 0).`,
r(fig, ctl) {
  const S = [0, 1, 2], Y = [1, 2, 2], X = S.map(s => [1, s]);
  ctl.innerHTML = sl("t0", "θ₀ intercept", 0, 2.5, 0.05, 0.5) + sl("t1", "θ₁ slope", -0.5, 1.5, 0.05, 1) + `<div class="row"><button id="opt" class="on">Jump to least squares</button></div><div id="lq"></div>`;
  const u = () => {
    const t0 = +$("t0").value, t1 = +$("t1").value; $("t0v").textContent = f(t0, 2); $("t1v").textContent = f(t1, 2);
    const pred = S.map(s => t0 + t1 * s), r = pred.map((p, i) => p - Y[i]), cost = r.reduce((a, v) => a + v * v, 0);
    const xr = [r.reduce((a, v) => a + v, 0), r.reduce((a, v, i) => a + v * S[i], 0)];
    const a = ML.axes(60, 30, 340, 230, { xmin: -0.5, xmax: 2.5, ymin: 0, ymax: 3.5, nx: 3, ny: 7, fx: v => v, fy: v => v, xl: "s", yl: "y" });
    let s = a.s + ML.path([[a.X(-0.5), a.Y(t0 - 0.5 * t1)], [a.X(2.5), a.Y(t0 + 2.5 * t1)]], C.blue, 2);
    S.forEach((sv, i) => { s += `<line x1="${a.X(sv)}" y1="${a.Y(Y[i])}" x2="${a.X(sv)}" y2="${a.Y(pred[i])}" stroke="${C.coral}" stroke-width="2"/><circle cx="${a.X(sv)}" cy="${a.Y(Y[i])}" r="5" fill="${C.coral}"/>`; });
    s += ML.box(430, 40, 230, 60, "c-coral", ["sum of squared residuals", f(cost, 4)]);
    s += tx(430, 130, "Xᵀr = (" + f(xr[0], 3) + ", " + f(xr[1], 3) + ")", null, "t") + tx(430, 150, "zero at the optimum", null);
    s += tx(430, 190, "residuals r = Xθ − y:", null) + tx(430, 210, "(" + r.map(v => f(v, 3)).join(", ") + ")", null, "t");
    s += tx(430, 250, Math.abs(cost - 1 / 6) < 1e-3 ? "at the least squares solution" : "cost above the minimum 1/6 = 0.1667", null, "th");
    fig.innerHTML = svg(300, s) + ML.code(["s = np.array([0.0, 1.0, 2.0]); X = np.column_stack((np.ones(3), s))", "y = np.array([[1.0], [2.0], [2.0]])", "theta, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)   # [[7/6], [1/2]]", "assert np.allclose(X.T @ (X @ theta - y), 0.0)"], 2);
    $("lq").innerHTML = ML.readout([["θ", `(${f(t0, 3)}, ${f(t1, 3)})`], ["optimum", "(1.1667, 0.5)"]]);
  };
  $("t0").oninput = u; $("t1").oninput = u; $("opt").onclick = () => { $("t0").value = 7 / 6; $("t1").value = 0.5; u(); }; u();
}},

{s: "13. With the agent", t: "Do it with the agent: a shape-checked linear algebra module",
intu: String.raw`Every rule in this lesson as a tested function: a shape-checking matrix product, the design matrix builder, predictions, residuals with the shape assertion, MSE and RMSE, and a least squares fit checked against the normal equations. The tests use the professor's own numbers, so a wrong implementation fails on numbers you can verify by hand.`,
eq: String.raw`\[ \texttt{design(F)} \to \texttt{predict(X, θ)} \to \texttt{residual}(\hat{y}, y) \to \texttt{mse, rmse} \to \texttt{fit\_ls(X, y)} \]`,
sym: [["checked product", "<code>matmul_checked</code> raises with both shapes in the message when the inner dimensions differ"], ["design", "prepends a column of ones"], ["the fit", "<code>fit_ls</code> calls np.linalg.lstsq, then asserts Xᵀr is zero"], ["tests", "the review's numbers: (16, 4, 7), 353.4, 2.5 HV, (7/6, 1/2)"]],
how: ["Paste the command.", "Read the shape check: does the error message print both shapes?", "Read residual(): does it assert equal shapes before subtracting?", "Run the tests. Every expected number is on these cards.", "Commit."],
say: String.raw`A linear algebra module checks shapes before every product, asserts residual shapes before every reduction, and tests itself on numbers you can verify by hand.`,
num: String.raw`Tests expect <b>[16, 4, 7]</b>, <b>Ŷ₃₂ = 353.4</b>, <b>MSE 2.5</b>, <b>θ = (7/6, 1/2)</b>, and a raised error for (2, 3) @ (2, 3).`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/linalg.py using numpy only. Functions: matmul_checked(A, B) that raises ValueError(f\"inner dimensions differ: {A.shape} @ {B.shape}\") unless A.shape[-1] == B.shape[0], then returns A @ B. design(F) that returns np.column_stack((np.ones(len(F)), F)) for a 2D F. predict(X, theta) that calls matmul_checked. residual(y_hat, y) that asserts y_hat.shape == y.shape with a message showing both shapes, then returns y_hat - y. mse(r) and rmse(r). fit_ls(X, y) that calls np.linalg.lstsq(X, y, rcond=None), asserts np.allclose(X.T @ (X @ theta - y), 0, atol=1e-8), and returns theta. Create tests/test_linalg.py with pytest tests: A=[[1,3],[4,0],[2,1]] @ [1,5] equals [16,4,7]; design of sizes [2104,1416,1534,852] times Theta=[[-40,200,-150],[0.25,0.10,0.40]] has entry [2,1] equal to 353.4; the hardness example with features [[0,1],[1,0],[2,1],[3,2]], theta (100,10,5) and observed (107,108,126,139) gives mse 2.5; fit_ls on s=[0,1,2], y=[1,2,2] gives theta close to [7/6, 1/2]; matmul_checked on shapes (2,3) and (2,3) raises ValueError; residual on shapes (3,1) and (3,) raises AssertionError. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed in 0.21s"],
    checks: ["the ValueError message contains both shapes", "residual asserts shapes before subtracting, so (3, 1) against (3,) cannot broadcast", "fit_ls checks the normal equations instead of trusting lstsq blindly", "the test values match the cards: [16, 4, 7], 353.4, 2.5, (7/6, 1/2)", "no np.linalg.inv anywhere in the module"]
  });
}},

{s: "14. Test", t: "Lesson 12 test: linear algebra",
intu: String.raw`Twelve questions. Shapes, both views of the product, the design matrix, order and grouping, inverse and singularity, transpose, the NumPy traps, and the chain from X to RMSE.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the shapes before answering any product question.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to calculus.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A has shape (4, 2). The lecture's entry A₃₂ is which NumPy element?", o: ["A[3, 2]", "A[2, 1]", "A[1, 2]", "A[2, 3]"], a: 1, why: "Subtract one from each 1-based subscript. Card 1." },
    { q: "Which product is defined, and what is its shape? A is (2, 3), B is (3, 2).", o: ["AB only, shape (2, 2)", "BA only, shape (3, 3)", "both: AB is (2, 2) and BA is (3, 3)", "neither"], a: 2, why: "Both inner dimensions match in both orders, giving different shapes. Card 6." },
    { q: "G has columns (2, 1) and (1, 2). Gx for x = (1, 2) is", o: ["(4, 5)", "(5, 4)", "(2, 4)", "(3, 3)"], a: 0, why: "1·(2, 1) + 2·(1, 2) = (4, 5). Card 4." },
    { q: "Why does the design matrix have a column of ones?", o: ["to make it square", "so the intercept is multiplied in by the same product as the slopes", "NumPy requires it", "to center the data"], a: 1, why: "Ones times the intercept is added to every row, so prediction is one product. Card 5." },
    { q: "R rotates by 90° and S doubles x. For x = (1, 1), SRx and RSx are", o: ["equal", "(−2, 1) and (−1, 2)", "(−1, 2) and (−2, 1)", "(2, 2) and (2, 2)"], a: 1, why: "Rotate first then stretch gives (−2, 1). Stretch first then rotate gives (−1, 2). Card 7." },
    { q: "A is 1000 × 2, B is 2 × 1000, c is 1000 × 1. Which grouping of ABc is cheaper?", o: ["(AB)c", "A(Bc)", "they cost the same", "neither is defined"], a: 1, why: "Bc is 2 × 1 and costs 2,000 multiplications. AB is 1000 × 1000 and costs 2,000,000. Card 7." },
    { q: "S = [[1, 2], [2, 4]] has no inverse because", o: ["it is not square", "its determinant 1·4 − 2·2 is 0, the columns are dependent", "it has even entries", "its trace is 5"], a: 1, why: "Zero determinant, one column is twice the other, rank 1. Card 8." },
    { q: "To solve Ax = b for a square nonsingular A in NumPy, the recommended call is", o: ["np.linalg.inv(A) @ b", "np.linalg.solve(A, b)", "b / A", "A.T @ b"], a: 1, why: "solve avoids forming the inverse and is more accurate. 1 / A is entrywise. Card 8." },
    { q: "x = (2, 3). Which is a number and which is a matrix?", o: ["xᵀx = 13 is a number, xxᵀ is 2 × 2", "both are numbers", "xxᵀ = 13 is a number, xᵀx is 2 × 2", "both are 2 × 2"], a: 0, why: "Row times column is 1 × 1. Column times row is n × n. Card 9." },
    { q: "(AB)ᵀ equals", o: ["AᵀBᵀ", "BᵀAᵀ", "AB", "BA"], a: 1, why: "The order reverses so the shapes still chain. Card 9." },
    { q: "pred has shape (3, 1) and target has shape (3,). <code>np.mean((pred − target) ** 2)</code>", o: ["raises an error", "gives the MSE", "silently averages a 3 × 3 matrix of all pairwise differences", "returns a (3,) array"], a: 2, why: "Broadcasting makes (3, 3). Assert equal shapes first. Card 10." },
    { q: "Hardness example: residuals (−2, 2, −1, 1). MSE and RMSE are", o: ["2.5 and 1.58", "10 and 3.16", "0 and 0", "1.5 and 1.22"], a: 0, why: "Sum of squares 10, divided by 4 is 2.5, square root 1.58. Card 11." }
  ], "Lesson 12 test");
}}
],
summary: String.raw`A matrix has shape rows by columns, indexed from one in the lecture and from zero in NumPy, and a NumPy vector can be (n,), (n, 1) or (1, n). Addition is entrywise with equal shapes. A matrix-vector product is a dot product per row and equally a weighted sum of the columns. The design matrix with a ones column makes a linear model one product, and several models are one matrix product. Matrix products chain on inner dimensions, do not commute, do associate, and cost m·n·p. The identity is the matrix one, the inverse exists for square matrices with nonzero determinant, singular matrices collapse a dimension, and code uses solve or lstsq rather than inv. Transpose swaps rows and columns, giving inner products as numbers and outer products as matrices. Star is elementwise and at-sign is the matrix product, and a column minus a flat array broadcasts to a wrong matrix without an error. From X and θ to RMSE is one product, one assertion, one subtraction, one mean and one square root. Least squares chooses θ where the residual is orthogonal to the columns of X.`,
sheet: [[String.raw`\[ (Ax)_i = \sum_j A_{ij} x_j = \sum_j x_j a_j \]`, "row view and column view of a matrix-vector product"], [String.raw`\[ (m \times n)(n \times p) = (m \times p), \quad \text{cost } mnp \]`, "shape rule and cost"], [String.raw`\[ \hat{y} = X\theta, \quad X = [\mathbf{1}\ \ x], \quad \theta = (\theta_0, \theta_1) \]`, "the design matrix"], [String.raw`\[ AB \ne BA, \quad (AB)C = A(BC), \quad (AB)^T = B^T A^T \]`, "order, grouping, transpose of a product"], [String.raw`\[ A^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}, \quad \det A = 0 \Rightarrow \text{singular} \]`, "2 × 2 inverse"], [String.raw`\[ x^T x = \|x\|^2 \ (1 \times 1), \qquad x x^T \ (n \times n) \]`, "inner and outer products"], [String.raw`\[ \text{MSE} = \frac{1}{m} r^T r, \quad r = X\theta - y, \quad \text{RMSE} = \sqrt{\text{MSE}} \]`, "from residuals to an error in the target's units"], [String.raw`\[ X^T X \theta = X^T y \]`, "normal equations, derived in Part 4"]],
sources: ["AME 5970 Linear Algebra review notes, sections 01 to 12 (all matrices and numbers on these cards are the professor's)", "Andrew Ng, Machine Learning course, week 1: Linear algebra review (matrices and vectors, matrix-vector and matrix-matrix multiplication, properties, inverse and transpose)", "Gilbert Strang, Introduction to Linear Algebra, chapters 1 and 2 (the column picture of Ax)", "Andrew Ng and others, CS229 Linear Algebra Review and Reference", "NumPy user guide: Broadcasting, and numpy.linalg (solve, lstsq)"]
});
})();
