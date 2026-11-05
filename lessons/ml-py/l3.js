(function () {
/* ML shelf, Part 2, Lesson 3: Control flow. Follows AME 5970 HW1 Part 1 (exercises 4 to 6) and HW2 Part 1 (exercises 2 and 5). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Foundations", num: "Lesson 3",
id: "ml-py-l3", title: "Control flow", short: "3. Control flow",
big: String.raw`Lesson 2 ran programs top to bottom. Real programs branch and repeat. An <code>if</code> chooses one path from several, a <code>for</code> loop repeats a block once per item, and a <code>while</code> loop repeats until a condition stops being true. Those three shapes are the whole of control flow, and every training loop in this course is built from them: for each epoch, for each batch, if the validation loss improved then save, while the error is above tolerance keep going. Each card runs a short program step by step so you can watch the path the program actually takes, which is the skill you need to read what the agent writes.`,
bridge: String.raw`The course's HW1 uses exactly these pieces: a temperature classifier with if and elif, a for loop with an accumulator, and a while loop that halves an error until it is below a tolerance, with a safety cap on the iterations.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. if, elif, else", t: "if, elif, else: one path out of several",
intu: String.raw`An <code>if</code> chain tests conditions in order and runs the first block whose condition is true, then skips the rest. Nothing after a true branch is tested. Move the temperature and watch which branch lights up. The boundaries are where the bugs live: 700 and 750 both belong to "acceptable" here because the first comparison is strict and the second is "less than or equal". Change the second to strict and 750 becomes "too high".`,
eq: String.raw`\[ \texttt{if } c_1\!: A \quad \texttt{elif } c_2\!: B \quad \texttt{else}\!: C \qquad\Rightarrow\qquad \text{run the first true branch only} \]`,
sym: [["if", "test a condition, run the block if it is true"], ["elif", "else if: tested only when every earlier condition was false"], ["else", "the fallback when nothing above was true"], ["indentation", "the four spaces that say which lines belong to a block"]],
how: ["Python evaluates the first condition. If true, it runs that block and jumps past the whole chain.", "Only if it is false does it evaluate the next elif.", "The else needs no condition because it only runs when everything above failed.", "Because earlier branches already excluded their cases, the second condition can be written as <code>t <= 750</code> without repeating <code>t >= 700</code>.", "Test every boundary value explicitly: 699, 700, 750, 751."],
say: String.raw`An if, elif, else chain runs exactly one block, the first whose condition is true, and the boundary values decide which block that is.`,
num: String.raw`Five test inputs cover the chain: <b>699</b> too low, <b>700</b> acceptable, <b>725</b> acceptable, <b>750</b> acceptable, <b>751</b> too high.`,
note: String.raw`HW1 Exercise 4 is this function. The graded question was which two inputs test the boundary convention, and what bug a strict comparison at 750 would cause.`,
r(fig, ctl) {
  const code = ["def classify(t):", "    if t < 700:", "        return \"too low\"", "    elif t <= 750:", "        return \"acceptable\"", "    else:", "        return \"too high\"", "", "print(classify(t))"];
  let strict = false;
  ctl.innerHTML = sl("tt", "temperature t (°C)", 680, 770, 1, 725) + btns([["0", "elif t <= 750"], ["1", "elif t < 750 (bug)"]], "s") + `<div id="cf"></div>`;
  const u = () => {
    pick(ctl, "s", strict ? 1 : 0);
    const t = +$("tt").value; $("ttv").textContent = t + " °C";
    const c = code.slice(); c[3] = strict ? "    elif t < 750:" : "    elif t <= 750:";
    const branch = t < 700 ? 1 : (strict ? t < 750 : t <= 750) ? 3 : 5;
    const out = branch === 1 ? "too low" : branch === 3 ? "acceptable" : "too high";
    const body = c.map((l, i) => { const on = i === branch || i === branch + 1 || i === 8; const skip = i >= 1 && i <= 6 && !on; return `<span style="display:block;${on ? "background:var(--accent-bg);box-shadow:inset 3px 0 var(--accent);" : skip ? "opacity:.4;" : ""}padding-left:6px">${ML.hl(l) || " "}</span>`; }).join("");
    let s = "";
    [["t < 700", t < 700, 1], [strict ? "t < 750" : "t <= 750", branch === 3, 3], ["else", branch === 5, 5]].forEach(([lab, on, b], i) => { const x = 40 + i * 210, tested = b <= branch; s += `<rect x="${x}" y="20" width="190" height="50" rx="8" fill="${on ? "var(--teal-bg)" : tested ? "var(--coral-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : tested ? C.coral : "var(--line)"}" ${tested ? "" : 'stroke-dasharray="4 4"'}/>` + tx(x + 95, 42, lab, "middle", "th") + tx(x + 95, 62, on ? "true, run this" : tested ? "false, next" : "never tested", "middle"); if (i < 2) s += arrow(x + 194, 45, x + 206, 45, "var(--p)", 1.5); });
    fig.innerHTML = svg(80, s) + `<pre class="codebox" style="padding-left:6px"><code>${body}</code></pre>` + ML.term([out]);
    $("cf").innerHTML = (t === 750 && strict) ? `<p class="note"><b>The bug.</b> With the strict comparison, exactly 750 falls through to else and is called too high.</p>` : "";
  };
  $("tt").oninput = u; ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { strict = b.dataset.s === "1"; u(); }); u();
}},

{s: "2. for and range", t: "for loops: once per item, with an accumulator",
intu: String.raw`A <code>for</code> loop takes items from a sequence one at a time, binds the loop name to each, and runs the block. <code>range(1, 11)</code> produces 1 through 10, stop excluded. The pattern to learn is the accumulator: a name set before the loop and updated inside it. Step through and watch <code>total</code> grow and <code>squares</code> lengthen. After the loop, the loop name keeps its last value.`,
eq: String.raw`\[ \texttt{for x in range(a, b):} \quad x = a, a+1, \ldots, b-1 \qquad \text{acc} \leftarrow \text{acc} + f(x) \]`,
sym: [["range(a, b)", "integers from a up to but not including b"], ["range(n)", "0 through n − 1, the n indices of a list of length n"], ["accumulator", "a running total or list, created before the loop and updated each pass"], ["append", "add one item to the end of a list"]],
how: ["Create the accumulators before the loop: an empty list and a zero.", "Each pass binds the loop name to the next item and runs the whole block.", "Inside, compute, then append to the list and add to the total.", "When range is exhausted the loop ends. The accumulators hold the result.", "<code>sum(squares)</code> would give the same total. Writing the accumulator by hand shows what sum does."],
say: String.raw`A for loop runs its block once per item in the sequence, and an accumulator carries a result across the passes.`,
num: String.raw`<code>range(1, 11)</code> has <b>10</b> items. The squares sum to <b>385</b>. <code>range(10)</code> would give 0 through 9 instead.`,
r(fig, ctl) {
  const code = ["squares = []", "total = 0", "for n in range(1, 5):", "    sq = n ** 2", "    squares.append(sq)", "    total += sq", "print(squares, total)"];
  const steps = [{ ln: 1, vars: [["squares", "L"], ["total", "t0"]], objs: [["L", "list", "[]"], ["t0", "int", "0"]], out: [] }];
  let sq = [], tot = 0;
  for (let n = 1; n <= 4; n++) {
    steps.push({ ln: 2, vars: [["squares", "L"], ["total", "t"], ["n", "n"]], objs: [["L", "list", "[" + sq.join(", ") + "]"], ["t", "int", String(tot)], ["n", "int", String(n)]], out: [], note: `pass ${n}: n is bound to ${n}` });
    sq = sq.concat([n * n]); tot += n * n;
    steps.push({ ln: 5, vars: [["squares", "L"], ["total", "t"], ["n", "n"], ["sq", "s"]], objs: [["L", "list", "[" + sq.join(", ") + "]"], ["t", "int", String(tot)], ["n", "int", String(n)], ["s", "int", String(n * n)]], out: [], note: `the block ran for n = ${n}: appended ${n * n}, total is now ${tot}` });
  }
  steps.push({ ln: 6, vars: [["squares", "L"], ["total", "t"], ["n", "n"], ["sq", "s"]], objs: [["L", "list", "[1, 4, 9, 16]"], ["t", "int", "30"], ["n", "int", "4"], ["s", "int", "16"]], out: ["[1, 4, 9, 16] 30"], note: "range is exhausted. n keeps its last value, 4." });
  ML.memory(fig, ctl, { code, steps });
}},

{s: "3. while", t: "while loops: repeat until a condition fails",
intu: String.raw`A <code>while</code> loop checks its condition before every pass and stops the first time it is false. It is the shape of every iterative algorithm: halve the error until it is below tolerance, update the weights until the loss stops improving. Because the number of passes is not known in advance, a safety cap is standard practice. Change the reduction factor and the tolerance and watch how many passes it takes, and what the cap does when the error never gets small.`,
eq: String.raw`\[ e_{k+1} = r\, e_k \;\Rightarrow\; e_k = r^k e_0, \qquad \text{stop when } e_k \le \tau \;\Rightarrow\; k = \left\lceil \frac{\ln(\tau / e_0)}{\ln r} \right\rceil \]`,
sym: [[String.raw`\(e_k\)`, "the error after k passes"], [String.raw`\(r\)`, "reduction factor per pass, 0.5 halves the error each time"], [String.raw`\(\tau\)`, "tolerance: the loop stops once the error is at or below it"], ["the cap", "<code>max_iterations</code>, the safety cap that ends the loop even if the condition never fails"]],
how: ["Set the error, the counter and the history before the loop.", "The condition is checked first. If the error is already small, the block never runs.", "Each pass shrinks the error, records it and counts.", "The loop ends when the error is at or below tolerance, or when the cap is reached. Check which one happened.", "With r = 0.5 and τ = 0.01 the error passes below tolerance on pass 7, since 0.5⁷ = 0.0078."],
say: String.raw`A while loop keeps running while its condition is true, so an iterative algorithm needs both a stopping condition and a cap on the number of passes.`,
num: String.raw`r = 0.5, τ = 0.01: <b>7 passes</b>. r = 0.9: <b>44 passes</b>. r = 1.0: the error never shrinks and the cap of 100 stops the loop, which the program must report.`,
note: String.raw`HW1 Exercise 6 asks why the safeguard is useful and which condition stopped the loop. The answer names the condition, not just the count.`,
r(fig, ctl) {
  ctl.innerHTML = sl("rf", "reduction factor r", 0.3, 1.0, 0.05, 0.5) + sl("tl", "tolerance τ (log10)", -4, -1, 1, -2) + `<div id="wr"></div>`;
  const u = () => {
    const r = +$("rf").value, tau = Math.pow(10, +$("tl").value); $("rfv").textContent = r.toFixed(2); $("tlv").textContent = tau;
    let e = 1, k = 0; const hist = [1];
    while (e > tau && k < 100) { e *= r; hist.push(e); k++; }
    const A = ML.axes(70, 20, 540, 180, { xmin: 0, xmax: Math.max(10, k), ymin: -4, ymax: 0, nx: 5, ny: 4, fx: x => Math.round(x), fy: y => "1e" + Math.round(y), xl: "pass k", yl: "error (log)" });
    let s = A.s + `<line x1="70" y1="${A.Y(Math.log10(tau))}" x2="610" y2="${A.Y(Math.log10(tau))}" stroke="${C.coral}" stroke-dasharray="6 4"/>` + tx(606, A.Y(Math.log10(tau)) - 6, "tolerance", "end");
    s += ML.path(hist.map((v, i) => [A.X(i), A.Y(Math.max(-4, Math.log10(v)))]), C.blue, 2);
    hist.forEach((v, i) => { if (i % Math.ceil(hist.length / 25) === 0) s += `<circle cx="${A.X(i)}" cy="${A.Y(Math.max(-4, Math.log10(v)))}" r="3" fill="${C.blue}"/>`; });
    fig.innerHTML = svg(236, s) + ML.code(["error, k = 1.0, 0", `while error > ${tau} and k < 100:`, `    error *= ${r}`, "    k += 1", "print(k, error)"], -1) + ML.term([`${k} ${e.toExponential(3)}`]);
    $("wr").innerHTML = ML.readout([["passes", k], ["stopped by", e <= tau ? "error <= tolerance" : "the cap of 100 passes"], ["final error", e.toExponential(2)]]);
  };
  $("rf").oninput = u; $("tl").oninput = u; u();
}},

{s: "4. break, continue", t: "break and continue: leaving early and skipping",
intu: String.raw`Two statements change the path inside a loop. <code>continue</code> skips the rest of the block and starts the next pass. <code>break</code> leaves the loop entirely. Step through a loop over sensor readings that skips placeholders and stops at the first implausible value. Watch which lines run on each pass. This is the shape of a data cleaning loop and of early stopping in training: keep going, skip the bad batch, stop when the condition is met.`,
eq: String.raw`\[ \texttt{continue} \to \text{next pass} \qquad \texttt{break} \to \text{after the loop} \]`,
sym: [["continue", "abandon this pass, go to the next item"], ["break", "abandon the loop, go to the first line after it"], ["else on a loop", "a rarely used block that runs only if the loop ended without break"]],
how: ["The loop visits the readings in order.", "A -999 placeholder hits continue: nothing below runs for that item.", "A reading above 500 hits break: the loop ends, and the remaining readings are never visited.", "Normal readings reach the bottom of the block and are kept.", "After the loop, the kept list and the counter tell you what happened."],
say: String.raw`continue skips to the next item and break leaves the loop, so a loop can ignore bad items and stop as soon as it has seen enough.`,
num: String.raw`Readings <code>[312, -999, 298, 510, 333]</code>: 312 and 298 are kept, -999 is skipped, 510 breaks, and <b>333 is never seen</b>.`,
r(fig, ctl) {
  const code = ["kept = []", "for r in [312, -999, 298, 510, 333]:", "    if r == -999:", "        continue", "    if r > 500:", "        break", "    kept.append(r)", "print(kept)"];
  const S = [];
  const st = (ln, kept, r, out, note) => S.push({ ln, vars: r == null ? [["kept", "L"]] : [["kept", "L"], ["r", "r"]], objs: r == null ? [["L", "list", "[" + kept.join(", ") + "]"]] : [["L", "list", "[" + kept.join(", ") + "]"], ["r", "int", String(r)]], out, note });
  st(0, [], null, [], "an empty list to collect the good readings");
  st(2, [], 312, [], "r = 312: not a placeholder, not above 500");
  st(6, [312], 312, [], "312 is appended");
  st(2, [312], -999, [], "r = -999: the placeholder test is true");
  st(3, [312], -999, [], "continue: lines 5 to 7 are skipped for this item");
  st(2, [312], 298, [], "r = 298: passes both tests");
  st(6, [312, 298], 298, [], "298 is appended");
  st(2, [312, 298], 510, [], "r = 510: not a placeholder");
  st(5, [312, 298], 510, [], "break: the loop ends here. 333 is never visited.");
  st(7, [312, 298], 510, ["[312, 298]"], "after the loop. r still holds 510, the value that caused the break.");
  ML.memory(fig, ctl, { code, steps: S });
}},

{s: "5. Nested loops", t: "Nested loops: a loop inside a loop",
intu: String.raw`A loop inside a loop runs the inner loop completely for every pass of the outer one. That is how a training loop is shaped: for each epoch, for each batch. The total number of inner passes is the product of the two counts. Watch the grid fill in. Each cell is one run of the inner block, and the order is row by row. Change the counts and read the total before the picture confirms it.`,
eq: String.raw`\[ \texttt{for i in range(E):}\ \texttt{for j in range(B):}\ \ldots \qquad \text{inner block runs } E \times B \text{ times} \]`,
sym: [["outer loop", "epochs: passes over the whole dataset"], ["inner loop", "batches: the chunks of one pass"], [String.raw`\(E \times B\)`, "total number of parameter updates in training"], ["step counter", "a single accumulator that counts inner passes across the whole run"]],
how: ["The outer loop binds i to 0 and runs the inner loop from j = 0 to B − 1.", "Then i becomes 1 and the inner loop starts again from j = 0.", "A counter incremented in the inner block counts every cell.", "In a training loop the inner block does one forward pass, one loss, one backward pass and one update.", "If an epoch is too slow, the fix is usually in the inner block, which runs E × B times."],
say: String.raw`A nested loop runs the inner loop fully for every pass of the outer loop, so the inner block executes the product of the two counts.`,
num: String.raw`MNIST with 60000 images and batches of 64 has <b>938 batches</b> per epoch. Ten epochs mean <b>9380 updates</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("ne", "epochs E", 1, 6, 1, 3) + sl("nb", "batches B", 1, 10, 1, 5) + sl("st", "animate step", 0, 60, 1, 60) + `<div id="nl"></div>`;
  const u = () => {
    const E = +$("ne").value, B = +$("nb").value, tot = E * B; $("st").max = tot; let k = Math.min(+$("st").value, tot); $("nev").textContent = E; $("nbv").textContent = B; $("stv").textContent = k + " of " + tot;
    let s = tx(40, 24, "each cell is one run of the inner block, filled row by row", null);
    for (let i = 0; i < E; i++) for (let j = 0; j < B; j++) { const idx = i * B + j, done = idx < k, cur = idx === k - 1; s += `<rect x="${110 + j * 50}" y="${40 + i * 36}" width="44" height="30" rx="4" fill="${done ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${cur ? C.coral : done ? C.teal : "var(--line)"}" stroke-width="${cur ? 2.5 : 1}"/>` + tx(132 + j * 50, 60 + i * 36, `${i},${j}`, "middle"); }
    for (let i = 0; i < E; i++) s += tx(100, 60 + i * 36, "epoch " + i, "end");
    fig.innerHTML = svg(50 + E * 36, s) + ML.code(["step = 0", `for epoch in range(${E}):`, `    for batch in range(${B}):`, "        step += 1   # one update", "print(step)"], k > 0 && k < tot ? 3 : -1) + ML.term([k >= tot ? String(tot) : "(running)"]);
    $("nl").innerHTML = ML.readout([["inner passes so far", k], ["total E × B", tot]]);
  };
  ["ne", "nb", "st"].forEach(id => $(id).oninput = u); u();
}},

{s: "6. Comprehensions", t: "Comprehensions: a loop that builds a list in one line",
intu: String.raw`A list comprehension is a for loop whose only job is to build a list, written in one expression: the value to keep, the loop, and an optional filter. It reads like set notation. Click each form to see the loop it replaces and the result. Comprehensions are everywhere in ML code, for example building a list of file paths, or the transformed features of every row, so you must be able to read them without pausing.`,
eq: String.raw`\[ \texttt{[f(x) for x in xs if c(x)]} \;\equiv\; \{\, f(x) : x \in xs,\ c(x) \,\} \]`,
sym: [["f(x)", "the expression kept for each item, evaluated first in reading order but written first"], ["for x in xs", "the loop"], ["if c(x)", "the filter: items where it is false are dropped"], ["dict comprehension", "the same with <code>{key: value for ...}</code>"]],
how: ["Read the loop part first: for which items.", "Then the filter: which of them survive.", "Then the expression: what is stored for each survivor.", "Expand it into a for loop with an append when it is not obvious. They are equivalent.", "If a comprehension needs more than one filter and a nested loop, write the loop. Readability wins."],
say: String.raw`A list comprehension builds a list from an expression applied to each item of a loop, optionally filtered, and is exactly a for loop with an append.`,
num: String.raw`<code>[n**2 for n in range(1, 11)]</code> has <b>10</b> items. <code>[w for w in words if len(w) > 3]</code> on "The quick brown fox jumps over the lazy dog" keeps <b>5</b> words.`,
note: String.raw`HW2 Exercise 5 builds squares, long words, a power table and a dictionary of hardness labels with comprehensions. Expect to read one on the midterm.`,
r(fig, ctl) {
  const F = [
    ["squares", "[n ** 2 for n in range(1, 6)]", ["out = []", "for n in range(1, 6):", "    out.append(n ** 2)"], "[1, 4, 9, 16, 25]"],
    ["long words", "[w.lower() for w in s.split() if len(w) > 3]", ["out = []", "for w in s.split():", "    if len(w) > 3:", "        out.append(w.lower())"], "['quick', 'brown', 'jumps', 'over', 'lazy']"],
    ["power table", "[(n, n**2, n**3) for n in range(1, 4)]", ["out = []", "for n in range(1, 4):", "    out.append((n, n**2, n**3))"], "[(1, 1, 1), (2, 4, 8), (3, 9, 27)]"],
    ["labels (dict)", "{k: (\"high\" if v >= 315 else \"regular\") for k, v in hv.items()}", ["out = {}", "for k, v in hv.items():", "    out[k] = \"high\" if v >= 315 else \"regular\""], "{'A': 'regular', 'B': 'regular', 'C': 'high'}"],
    ["evens only", "[x for x in nums if x % 2 == 0]", ["out = []", "for x in nums:", "    if x % 2 == 0:", "        out.append(x)"], "[0, -2, 8, 4]"]
  ];
  let k = 0;
  ctl.innerHTML = btns(F.map((f, i) => [i, f[0]]), "k");
  const u = () => {
    pick(ctl, "k", k);
    const f = F[k];
    fig.innerHTML = `<p class="sec">comprehension</p>` + ML.code(["s = \"The quick brown fox jumps over the lazy dog\"", "hv = {\"A\": 312.5, \"B\": 298.0, \"C\": 327.5}", "nums = [0, 5, -2, 8, 11, -3, 4]", "out = " + f[1]], 3) + `<p class="sec">the same as a loop</p>` + ML.code(f[2], -1) + `<p class="sec">result</p>` + ML.term([f[3]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "7. Trace a loop", t: "Trace the training loop shape before you meet the real one",
intu: String.raw`Here is the skeleton of every training loop in the course, with the numbers faked so you can watch the control flow alone. An outer for over epochs, an inner for over batches, an if that saves the best validation loss, and a break for early stopping when nothing improved for two epochs. Step through it. By Part 5 the fake numbers become real tensors, and the loop shape will be the one you already know.`,
eq: String.raw`\[ \text{for epoch: } \big[\text{for batch: update}\big],\ \text{if } L_{\text{val}} \lt L_{\text{best}}\!: \text{save},\ \text{else wait},\ \text{if wait} \ge 2\!: \text{break} \]`,
sym: [[String.raw`\(L_{\text{val}}\)`, "validation loss after the epoch"], [String.raw`\(L_{\text{best}}\)`, "lowest validation loss seen so far"], ["patience", "how many epochs without improvement to tolerate before stopping"], ["checkpoint", "the saved copy of the model at the best epoch"]],
how: ["Each epoch runs all batches, then measures the validation loss.", "If the loss improved, record it, reset the wait counter and save a checkpoint.", "If not, count one more epoch of waiting.", "When waiting reaches the patience, break. The best checkpoint, not the last epoch, is the model to keep.", "Read the printed log: the epoch numbers tell you which branch ran."],
say: String.raw`A training loop is a for over epochs around a for over batches, with an if that keeps the best validation checkpoint and a break that stops once improvement has stalled.`,
num: String.raw`With validation losses <b>0.9, 0.7, 0.6, 0.65, 0.64</b> and patience 2, the loop breaks after epoch 5 and keeps the checkpoint from <b>epoch 3</b>.`,
r(fig, ctl) {
  const losses = [0.9, 0.7, 0.6, 0.65, 0.64, 0.5];
  const code = ["best, wait = 1e9, 0", "for epoch in range(1, 7):", "    for batch in range(3):", "        pass          # one update", "    val = losses[epoch - 1]", "    if val < best:", "        best, wait = val, 0", "        save_checkpoint()", "    else:", "        wait += 1", "    if wait >= 2:", "        break", "print(\"best\", best)"];
  const S = []; let best = 1e9, wait = 0; const out = [];
  const st = (ln, ep, val, note) => S.push({ ln, vars: [["best", "b"], ["wait", "w"], ["epoch", "e"]].concat(val == null ? [] : [["val", "v"]]), objs: [["b", "float", best === 1e9 ? "1e9" : String(best)], ["w", "int", String(wait)], ["e", "int", String(ep)]].concat(val == null ? [] : [["v", "float", String(val)]]), out: out.slice(), note });
  for (let ep = 1; ep <= 6; ep++) {
    st(3, ep, null, `epoch ${ep}: the inner loop runs its 3 batches`);
    const v = losses[ep - 1];
    if (v < best) { best = v; wait = 0; out.push(`epoch ${ep} val ${v} improved, saved`); st(7, ep, v, `val ${v} is below best, so save and reset wait`); }
    else { wait++; out.push(`epoch ${ep} val ${v} no improvement, wait ${wait}`); st(9, ep, v, `val ${v} is not below best ${best}, wait is now ${wait}`); }
    if (wait >= 2) { out.push("early stop"); st(11, ep, v, "wait reached 2: break. The remaining epochs never run."); break; }
  }
  out.push("best " + best); S.push({ ln: 12, vars: S[S.length - 1].vars, objs: S[S.length - 1].objs, out: out.slice(), note: "the model to keep is the checkpoint saved at epoch 3, not the state after epoch 5" });
  ML.memory(fig, ctl, { code, steps: S });
}},

{s: "8. With the agent", t: "Do it with the agent: a cleaning loop with a report",
intu: String.raw`A loop that walks through raw readings, skips placeholders, stops on an impossible value and reports what it did. This is small enough to read in full, which is the point: after the agent writes it, trace it the way the cards did and predict the printed report before you run it.`,
eq: String.raw`\[ \text{readings} \to \text{for loop with continue and break} \to \text{kept list} + \text{report} \]`,
sym: [["kept", "the readings that passed every check"], ["skipped", "a count of placeholders"], ["stop index", "<code>stopped_at</code>, the index of the implausible value, or None"]],
how: ["Paste the command.", "Before running, trace the function by hand on the example list and write down the expected report.", "Run it. Compare line by line with your prediction.", "Change the example list to include no bad values and confirm that <code>stopped_at</code> is None."],
say: String.raw`I can predict what a loop with continue and break reports before running it, which is how I check loops the agent writes.`,
num: String.raw`On the example list the report should be <b>3 kept, 1 skipped, stopped at index 4</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "In src/clean.py write clean_readings(readings: list[float], placeholder: float = -999.0, limit: float = 500.0) -> dict. Loop over the readings with their index. Skip any reading equal to the placeholder and count it. Stop at the first reading above limit and record its index. Keep every other reading. Return a dict with keys kept, skipped and stopped_at (None if the loop finished). Add a docstring. Under the main guard call it on [312.0, -999.0, 298.0, 333.0, 510.0, 305.0] and print the dict. Run it and paste the output.",
    actions: ["$ python src/clean.py", "{'kept': [312.0, 298.0, 333.0], 'skipped': 1, 'stopped_at': 4}"],
    code: "def clean_readings(readings, placeholder=-999.0, limit=500.0):\n    \"\"\"Keep plausible readings, skip placeholders, stop at the first value above limit.\"\"\"\n    kept, skipped, stopped_at = [], 0, None\n    for i, r in enumerate(readings):\n        if r == placeholder:\n            skipped += 1\n            continue\n        if r > limit:\n            stopped_at = i\n            break\n        kept.append(r)\n    return {\"kept\": kept, \"skipped\": skipped, \"stopped_at\": stopped_at}",
    checks: ["my hand trace of the example matches the printed dict", "the reading after the stop (305.0) is not in kept", "the placeholder was counted and not kept", "with a list containing no bad values, stopped_at prints None", "the function has a docstring and the loop uses continue and break as asked"]
  });
}},

{s: "9. Test", t: "Test: control flow",
intu: String.raw`Twelve questions, mostly predict the output. Trace the path the program takes before you answer.`,
eq: String.raw`\[ \text{trace} \to \text{predict} \to \text{click} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["For if chains, find the first true condition.", "For loops, write the accumulator's value after each pass.", "For break and continue, mark which lines are skipped."],
say: String.raw`I can trace branches and loops by hand and predict what they print.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: "t = 750\nif t < 700:\n    print(\"low\")\nelif t < 750:\n    print(\"ok\")\nelse:\n    print(\"high\")", o: ["low", "ok", "high", "nothing"], a: 2, why: "750 < 750 is false, so the elif fails and else runs. With <= 750 it would print ok." },
    { q: "How many items does <code>range(1, 11)</code> produce, and what is the last?", o: ["11 items, last 11", "10 items, last 10", "10 items, last 11", "9 items, last 10"], a: 1, why: "The stop value is excluded. 1 through 10 is 10 items." },
    { q: "What does this print?", code: "total = 0\nfor n in range(4):\n    total += n\nprint(total, n)", o: ["6 3", "10 4", "6 4", "10 3"], a: 0, why: "range(4) is 0, 1, 2, 3 with sum 6, and the loop name keeps its last value 3." },
    { q: "error starts at 1.0 and is halved each pass while error > 0.01. How many passes?", o: ["6", "7", "100", "10"], a: 1, why: "0.5^6 = 0.0156 is still above 0.01, and 0.5^7 = 0.0078 is below, so the loop runs 7 times." },
    { q: "Why add <code>and k < 100</code> to a while condition?", o: ["To make the loop faster", "To stop the loop if the error never reaches the tolerance", "Because while loops need two conditions", "To skip bad values"], a: 1, why: "A cap guarantees the loop ends even when the update does not shrink the error." },
    { q: "What does this print?", code: "out = []\nfor x in [3, -999, 5, 900, 7]:\n    if x == -999:\n        continue\n    if x > 500:\n        break\n    out.append(x)\nprint(out)", o: ["[3, 5, 7]", "[3, 5]", "[3, -999, 5]", "[3, 5, 900]"], a: 1, why: "-999 is skipped by continue, 900 triggers break, and 7 is never visited." },
    { q: "In <code>for i in range(3): for j in range(4): step += 1</code>, what is step at the end?", o: ["7", "12", "3", "4"], a: 1, why: "The inner block runs 3 × 4 = 12 times." },
    { q: "What does <code>[n * 2 for n in range(5) if n % 2 == 1]</code> give?", o: ["[0, 2, 4, 6, 8]", "[2, 6]", "[1, 3]", "[2, 4]"], a: 1, why: "The filter keeps the odd n, 1 and 3, and the expression doubles them." },
    { q: "Which loop is equivalent to <code>[w.upper() for w in words if len(w) > 3]</code>?", o: ["for w in words: out.append(w.upper())", "for w in words: if len(w) > 3: out.append(w.upper())", "for w in words: if len(w) > 3: out.append(w)", "for w in words: out.append(len(w) > 3)"], a: 1, why: "The filter becomes an if inside the loop, and the expression is what gets appended." },
    { q: "A training loop has patience 2. Validation losses are 0.9, 0.7, 0.6, 0.65, 0.64, 0.5. When does it stop, and which epoch's checkpoint is kept?", o: ["After epoch 6, keep epoch 6", "After epoch 5, keep epoch 3", "After epoch 4, keep epoch 3", "After epoch 5, keep epoch 5"], a: 1, why: "Epochs 4 and 5 do not improve on 0.6, so wait reaches 2 after epoch 5. The checkpoint from epoch 3 is kept." },
    { q: "What does this print?", code: "k = 0\nwhile k < 3:\n    k += 1\nprint(k)", o: ["2", "3", "4", "0"], a: 1, why: "The block runs for k = 0, 1, 2 and raises k to 3, where the condition fails." },
    { q: "Which statement about else in an if chain is true?", o: ["It needs a condition", "It runs only when every earlier condition was false", "It always runs", "It runs after the first true branch"], a: 1, why: "else is the fallback, reached only when no earlier branch was taken." }
  ], "Lesson 3 test");
}}
],
summary: String.raw`An if, elif, else chain runs exactly one block, the first whose condition is true, and boundary values decide which. A for loop runs its block once per item of a sequence, usually with an accumulator carrying a result across passes, and range stops one short of its stop value. A while loop runs while its condition holds and needs a cap so it cannot run forever. continue skips to the next item, break leaves the loop. A nested loop runs the inner block the product of the counts, which is the shape of every training loop: epochs around batches, an if to keep the best checkpoint, a break for early stopping. A comprehension is a for loop with an append written as one expression.`,
sheet: [
[String.raw`\[ \texttt{if } c_1\!: A \ \texttt{elif } c_2\!: B \ \texttt{else}\!: C \]`, "First true branch only"],
[String.raw`\[ \texttt{range(a, b)} = a, \ldots, b-1 \]`, "Stop excluded"],
[String.raw`\[ e_k = r^k e_0 \le \tau \Rightarrow k = \lceil \ln(\tau/e_0) / \ln r \rceil \]`, "Passes of a while loop that shrinks an error"],
[String.raw`\[ E \text{ epochs} \times B \text{ batches} = \text{updates} \]`, "Nested loop count"],
[String.raw`\[ \texttt{[f(x) for x in xs if c(x)]} \]`, "List comprehension"]],
sources: ["AME 5970 HW1 Part 1, exercises 4 to 6 (if chains with boundaries, for with accumulator, while as convergence with a cap)", "AME 5970 HW2 Part 1, exercises 2 and 5 (loops versus comprehensions)", "The Python Tutorial, section 4 (control flow tools) and 5.1.3 (list comprehensions)", "Andrew Ng, Machine Learning Specialization course 1, the optional labs: the loop structure of gradient descent"]
});
})();
