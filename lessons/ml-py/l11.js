(function () {
/* ML shelf, Part 2, Lesson 11: the Part 2 test. 32 questions in four sections drawing on Lessons 2 to 10, in the style of the AME 5970 HW1 and HW2 exercises. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const SEC = [["A. Values, control flow, containers", "Lessons 2 to 4", [2, 3, 4]], ["B. Functions, classes, Pythonic tools", "Lessons 5 to 7", [5, 6, 7]], ["C. NumPy arrays and NumPy for ML", "Lessons 8 and 9", [8, 9]], ["D. pandas, Matplotlib, the pipeline", "Lessons 9 and 10", [9, 10]]];
const LESS = { 2: "Values, types, names", 3: "Control flow", 4: "Data structures", 5: "Functions, modules, errors", 6: "Classes and objects", 7: "Pythonic tools", 8: "NumPy arrays", 9: "NumPy for ML", 10: "pandas and Matplotlib" };

addLesson("ml", "py", {
level: "Core", num: "Lesson 11",
id: "ml-py-l11", title: "Part 2 test", short: "11. Part 2 test",
big: String.raw`Thirty-two questions over the whole of Part 2, in four sections of eight. Each section is its own card with its own score, so you can retake the weak one without redoing the rest. The questions are written the way HW1 and HW2 ask: read a short program and say what it prints, name the shape an expression produces, or pick the line that fixes a bug. Nothing here needs a computer. If you want to check an answer, that is what the Python panel in VS Code is for, after you have committed to one. Score each section, then reopen the lessons the feedback names before moving to Part 3.`,
bridge: String.raw`HW1 and HW2 are the course's own version of this test. Their exercises on shapes, masks, vectorization and the standardization pipeline reappear here as questions. Part 3 assumes all of it: the linear algebra lesson uses NumPy shapes from the first card, and the calculus lesson uses the training loop shape from Lesson 3.`,
labels: { note: "How to use this card" },
cards: [

{s: "0. Map", t: "What the four sections cover",
intu: String.raw`Click a section to see which lessons it draws on and how many questions it has. Take the sections in order the first time. Each is scored out of 8. A section at 6 or above is passed. Below that, reopen the lessons listed and take that section again. The whole test at 26 or above means Part 2 is done.`,
eq: String.raw`\[ 4 \text{ sections} \times 8 \text{ questions} = 32, \qquad \text{pass: } 6 \text{ per section}, \ 26 \text{ overall} \]`,
sym: [["section A", "values, control flow, lists, dicts, sets"], ["section B", "functions, errors, classes, generators, decorators, dataclasses"], ["section C", "arrays, shapes, views, axes, broadcasting, masks, vectorization"], ["section D", "matrix prediction, MSE, standardization, pandas, plots"]],
how: ["Take A, B, C, D in order.", "Commit to an answer before reading the feedback.", "Note each miss and the lesson it names.", "Reopen those lessons, then retake only the sections below 6.", "Record the four scores in your notes with the date."],
say: String.raw`Four sections, eight questions each, pass at six per section and twenty-six overall.`,
num: String.raw`<b>32</b> questions, about <b>40 minutes</b> on a first pass.`,
note: String.raw`The HW1 and HW2 exercises are open book. This test is not. Closed book is how the midterm and final work, so practice that here.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns(SEC.map((s, i) => [i, s[0].slice(0, 1)]), "k") + `<div id="mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    const lessons = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    lessons.forEach((L, i) => {
      const x = 20 + i * 72, on = SEC[k][2].includes(L);
      s += `<rect x="${x}" y="30" width="64" height="64" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 32, 56, "L" + L, "middle", "th") + tx(x + 32, 78, ["Values", "Control", "Containers", "Functions", "Classes", "Tools", "Arrays", "NumPy ML", "pandas"][i], "middle");
    });
    SEC.forEach((sc, i) => {
      const x = 20 + i * 160, on = i === k;
      s += `<rect x="${x}" y="130" width="150" height="50" rx="8" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2 : 1}"/>` + tx(x + 75, 150, sc[0].split(".")[0] + ". 8 questions", "middle", "th") + tx(x + 75, 168, sc[1], "middle");
      const xs = sc[2].map(L => 20 + lessons.indexOf(L) * 72 + 32);
      if (on) xs.forEach(xx => s += `<line x1="${xx}" y1="96" x2="${x + 75}" y2="128" stroke="${C.teal}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
    });
    fig.innerHTML = svg(196, s);
    $("mx").innerHTML = `<p class="note"><b>${SEC[k][0]}</b> draws on ${SEC[k][2].map(L => "Lesson " + L + " (" + LESS[L] + ")").join(", ")}.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "A. Values to containers", t: "Section A: values, control flow and containers",
intu: String.raw`Eight questions from Lessons 2, 3 and 4. Read each program as the interpreter would, one line at a time, and keep track of which name points to which object.`,
eq: String.raw`\[ \text{Section A: 8 questions, pass at 6} \]`,
sym: [["Lesson 2", "int and float, names and objects, strings, truthiness, conversion, f-strings"], ["Lesson 3", "if, for, while, break, comprehensions, the loop trace"], ["Lesson 4", "lists, alias versus copy, tuples, dicts, sets"]],
how: ["Trace, do not guess.", "For alias questions ask: how many list objects exist?", "For comprehension questions write the equivalent loop in your head."],
say: String.raw`Section A tests whether you read Python the way the interpreter runs it.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: ["x = 7 / 2", "y = 7 // 2", "print(type(x).__name__, y)"], o: ["float 3", "float 3.5", "int 3", "float 4"], a: 0, why: "True division always gives a float, floor division of ints gives an int rounded down. Lesson 2 card 2." },
    { q: "After these lines, what is <code>a</code>?", code: ["a = [1, 2, 3]", "b = a", "b.append(4)", "b = [0]"], o: ["[1, 2, 3]", "[1, 2, 3, 4]", "[0]", "[1, 2, 3, 4, 0]"], a: 1, why: "b was an alias of the same list when append ran, so a sees the 4. The later assignment re-points b to a new list and does not touch a. Lesson 4 card 2." },
    { q: "Which value is falsy?", o: ["\"0\"", "[0]", "0.0", "\"False\""], a: 2, why: "Zero of any numeric type is falsy. A non-empty string or list is truthy whatever it contains. Lesson 2 card 5." },
    { q: "What does this print?", code: ["total = 0", "for i in range(1, 5):", "    if i % 2 == 0:", "        continue", "    total += i", "print(total)"], o: ["10", "6", "4", "3"], a: 2, why: "range(1, 5) is 1, 2, 3, 4. Even values are skipped, so total is 1 + 3 = 4. Lesson 3 cards 2 and 4." },
    { q: "Which expression builds <code>[0.5, 1.0, 1.5]</code> from <code>xs = [1, 2, 3]</code>?", o: ["[x / 2 for x in xs]", "[xs / 2]", "xs / 2", "[x // 2 for x in xs]"], a: 0, why: "A list comprehension applies the expression to each item. A plain list cannot be divided, that needs NumPy. Lesson 3 card 6." },
    { q: "What does <code>print(f\"{3.14159:.2f} {1234567:,}\")</code> show?", o: ["3.14 1,234,567", "3.14159 1234567", "3.1 1,234,567", "3.14 1.234.567"], a: 0, why: ".2f gives two decimals, the comma option groups thousands. Lesson 2 card 7." },
    { q: "A function must look up a sample's record by its id in constant time and refuse duplicate ids on insert. Which container?", o: ["a list of tuples", "a dict keyed by id, checking <code>id in records</code> before inserting", "a set of ids only", "a tuple of dicts"], a: 1, why: "A dict gives a name for every field and O(1) lookup, and the membership check refuses duplicates. Lesson 4 cards 5 and 8." },
    { q: "What does this print?", code: ["cfg = {\"lr\": 0.1, \"epochs\": 5}", "cfg[\"lr\"] = 0.01", "cfg.setdefault(\"epochs\", 50)", "print(cfg[\"lr\"], cfg[\"epochs\"], len(cfg))"], o: ["0.01 50 2", "0.01 5 2", "0.1 5 2", "0.01 5 3"], a: 1, why: "Assignment replaces lr. setdefault only inserts when the key is missing, and epochs already exists, so it stays 5. Lesson 4 card 4." }
  ], "Section A");
}},

{s: "B. Functions to tools", t: "Section B: functions, errors, classes and Pythonic tools",
intu: String.raw`Eight questions from Lessons 5, 6 and 7. Scope, mutation of inputs, raising and catching, self and attributes, inheritance, generators, decorators and dataclasses.`,
eq: String.raw`\[ \text{Section B: 8 questions, pass at 6} \]`,
sym: [["Lesson 5", "def, arguments, scope, not mutating inputs, modules, raise, try, tests"], ["Lesson 6", "class, instance, self, attributes, <code>__init__</code>, inheritance, nn.Module"], ["Lesson 7", "enumerate, zip, unpacking, generators, sorted, decorators, with, hints, dataclass"]],
how: ["For scope questions ask where each name is assigned.", "For class questions ask which object self is at that call.", "For generator questions remember nothing runs until next is called."],
say: String.raw`Section B tests whether you can read a function, a class and a loop written the way the course's code is written.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: ["def bump(xs, by=1):", "    xs = xs + [by]", "    return xs", "a = [1]", "b = bump(a)", "print(a, b)"], o: ["[1, 1] [1, 1]", "[1] [1, 1]", "[1] [1]", "[1, 1] [1]"], a: 1, why: "xs + [by] builds a new list. The local xs is re-pointed, the caller's list is untouched. Lesson 5 card 4." },
    { q: "A function is asked for the mean of an empty list. The course's rule says it should", o: ["return 0", "return None", "raise ValueError with a clear message", "print a warning and return 0"], a: 2, why: "A broken contract fails loudly. The caller catches it if that is sensible. Lesson 5 card 6." },
    { q: "What does the except clause catch here?", code: ["try:", "    v = float(text)", "except ValueError:", "    v = None"], o: ["any error", "only a ValueError, such as float(\"abc\")", "only a TypeError", "nothing, the syntax is wrong"], a: 1, why: "Handle what you expect by name and let the rest propagate. float(None) raises TypeError and would pass through. Lesson 5 card 7." },
    { q: "What does this print?", code: ["class Counter:", "    def __init__(self):", "        self.n = 0", "    def hit(self):", "        self.n += 1", "        return self", "c = Counter()", "c.hit().hit()", "print(c.n)"], o: ["0", "1", "2", "an error, hit takes no arguments"], a: 2, why: "Each call binds self to c and returns c, so the second hit acts on the same object. Lesson 6 cards 3 and 4." },
    { q: "In <code>class Net(nn.Module)</code>, why does <code>__init__</code> start with <code>super().__init__()</code>?", o: ["Python requires it in every class", "the parent's initializer sets up the machinery that registers parameters and submodules", "it copies the parent's forward method", "it is only a style convention"], a: 1, why: "Without the parent's init, assigning nn.Linear layers as attributes would not register them. Lesson 6 cards 7 and 10." },
    { q: "What does this print?", code: ["def batches(xs, size):", "    for i in range(0, len(xs), size):", "        yield xs[i:i + size]", "g = batches([1, 2, 3, 4, 5], 2)", "print(next(g), next(g))"], o: ["[1, 2] [3, 4]", "[1, 2, 3, 4, 5]", "[1, 2] [1, 2]", "an error, generators cannot be sliced"], a: 0, why: "A generator produces one item per next. The first slice is [1, 2], the second [3, 4]. Lesson 7 card 3." },
    { q: "Which line sorts records by loss, smallest first, without changing the list?", o: ["records.sort(key=lambda r: r[\"loss\"])", "sorted(records, key=lambda r: r[\"loss\"])", "sorted(records)[\"loss\"]", "records.sorted(\"loss\")"], a: 1, why: "sorted returns a new list. sort changes the list in place. The key function extracts the field. Lesson 7 card 4." },
    { q: "What does a decorator written as <code>@timed</code> above <code>def train():</code> do?", o: ["runs train immediately", "replaces the name train with timed(train), a wrapped function", "adds a timer attribute to the module", "makes train a method"], a: 1, why: "A decorator is a function that takes a function and returns a function, applied at definition time. Lesson 7 card 5." }
  ], "Section B");
}},

{s: "C. NumPy", t: "Section C: arrays, shapes and NumPy for ML",
intu: String.raw`Eight questions from Lessons 8 and 9. Shapes, views, axes, dtype, broadcasting, masks, vectorization. These are the HW1 Part 2 and HW2 Part 2 questions in miniature.`,
eq: String.raw`\[ \text{Section C: 8 questions, pass at 6} \]`,
sym: [["Lesson 8", "shape, ndim, dtype, indexing, views, reshape, axes"], ["Lesson 9", "broadcasting, masks, vectorization, X @ w + b, seeded randomness"]],
how: ["Write the shape of every operand before the operation.", "For axis questions remember the axis named is the one that disappears.", "For views ask whether the base array can change."],
say: String.raw`Section C tests whether you can predict a shape and a value without running NumPy.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "<code>A = np.arange(12).reshape(3, 4)</code>. What is <code>A[1:, ::2].shape</code>?", o: ["(2, 2)", "(3, 2)", "(2, 4)", "(1, 2)"], a: 0, why: "Rows 1 and 2, columns 0 and 2. Lesson 8 card 2." },
    { q: "After this, what is <code>A[0, 0]</code>?", code: ["A = np.zeros((2, 2))", "r = A[0]", "r[0] = 5", "c = A[:, 1].copy()", "c[0] = 9"], o: ["0.0", "5.0", "9.0", "an error"], a: 1, why: "A[0] is a view, so writing through r changes A. The copy is independent. Lesson 8 card 3." },
    { q: "<code>M</code> has shape (5, 3). What is <code>M.sum(axis=0).shape</code>?", o: ["(5,)", "(3,)", "(5, 3)", "()"], a: 1, why: "axis 0 is combined away, leaving one value per column. Lesson 8 card 5." },
    { q: "Which pair of shapes broadcasts to (4, 3)?", o: ["(4, 3) and (4,)", "(4, 3) and (3,)", "(4,) and (3,)", "(3, 4) and (4, 3)"], a: 1, why: "Aligned from the right, 3 matches 3 and the missing dimension becomes 1 and stretches to 4. A (4,) vector conflicts with the trailing 3. Lesson 9 card 1." },
    { q: "<code>x = np.array([1, 2, 3])</code> and <code>x[0] = 2.7</code>. What is <code>x[0]</code>?", o: ["2.7", "2", "3", "an error"], a: 1, why: "The array was created with int dtype, so the float is truncated on assignment. Lesson 8 card 7." },
    { q: "Which line keeps readings between 0 and 100 inclusive?", o: ["r[0 <= r <= 100]", "r[(r >= 0) & (r <= 100)]", "r[r >= 0 and r <= 100]", "r.between(0, 100)"], a: 1, why: "Each comparison gives a bool array, and & combines them elementwise. Chained comparisons and the keyword and do not work on arrays. Lesson 9 card 3." },
    { q: "<code>X</code> is (100, 4), <code>w</code> is (4,), <code>b</code> is a float. What is <code>(X @ w + b).shape</code>?", o: ["(100, 4)", "(4,)", "(100,)", "(100, 1)"], a: 2, why: "(100, 4) @ (4,) gives (100,), one prediction per row, and the scalar broadcasts. Lesson 9 card 5." },
    { q: "Why does the course use <code>rng = np.random.default_rng(seed)</code> instead of <code>np.random.seed(seed)</code>?", o: ["it is faster", "a local generator is reproducible and does not interfere with other code's randomness", "default_rng gives better random numbers", "np.random.seed no longer exists"], a: 1, why: "A seeded local generator gives the same sequence every run and belongs to your code alone. Lesson 9 card 8." }
  ], "Section C");
}},

{s: "D. The pipeline", t: "Section D: residuals, standardization, pandas and plots",
intu: String.raw`Eight questions from Lessons 9 and 10. The pipeline that every later lesson assumes: split, standardize on train, predict, measure, and the table and plot work around it.`,
eq: String.raw`\[ \text{Section D: 8 questions, pass at 6} \]`,
sym: [["Lesson 9", "residuals, MSE, standardization without leakage, the pipeline"], ["Lesson 10", "DataFrame, audit, selection, missing values, groupby, <code>to_numpy</code>, Figure and Axes, diagnostics"]],
how: ["For leakage questions ask which rows the statistic was computed from.", "For pandas questions ask what type the expression returns.", "For plot questions ask which object owns the method."],
say: String.raw`Section D tests whether the pipeline in your head matches the one the homework grades.`,
num: String.raw`Pass at <b>6 of 8</b>.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "<code>y</code> is (48,) and <code>y_hat</code> is (48, 1). What is <code>np.mean((y - y_hat) ** 2)</code>?", o: ["the MSE", "an error", "the mean of a (48, 48) matrix of every pair of differences, which is not the MSE", "the same as np.mean((y_hat - y) ** 2) and both are the MSE"], a: 2, why: "Broadcasting silently produces 48 by 48 differences. Assert equal shapes before any reduction. Lesson 9 card 6 and Lesson 10 card 9." },
    { q: "Standardization statistics for the test set should be", o: ["computed on the test set", "computed on train and test together", "the training mean and std, applied unchanged", "skipped for the test set"], a: 2, why: "Fitting anything on test rows leaks them into the model. Lesson 9 card 7." },
    { q: "A feature column has standard deviation 0 on the training rows. The pipeline should", o: ["divide anyway", "set its scale to 1 so the column becomes 0 instead of not a number", "delete the test set", "raise an error and stop"], a: 1, why: "Guard the constant column so standardization cannot produce a not-a-number result. Lesson 9 card 7." },
    { q: "What type does <code>housing[[\"size_sqft\"]]</code> return?", o: ["a Series", "a DataFrame with one column", "a NumPy array", "a list"], a: 1, why: "Double brackets select a list of columns, giving a DataFrame even for one name. Lesson 10 cards 1 and 3." },
    { q: "The audit prints <code>isna().sum()</code> as thick_mm 3. Before training you should", o: ["ignore it, pandas skips NaN", "decide per column whether to drop or fill, fill from training statistics, and keep a flag of what was filled", "replace with 0", "delete the column"], a: 1, why: "Silent skipping is the danger. The decision is deliberate and recorded. Lesson 10 card 4." },
    { q: "<code>housing.groupby(\"bedrooms\")[\"price_usd\"].agg([\"mean\", \"count\"])</code> gives a 5 bedroom mean of 699,900 with count 1. The honest reading is", o: ["5 bedroom houses cost about 700k", "one house, so no trend can be claimed", "the data has an error", "the mean should be replaced by the median"], a: 1, why: "A statistic needs the count beside it. Lesson 10 card 5." },
    { q: "In the course plot template, where do xlabel, ylabel and title go?", o: ["plt.xlabel(...) after the figure", "ax.set(xlabel=..., ylabel=..., title=...) on the Axes", "in fig.suptitle only", "in the scatter call"], a: 1, why: "The Axes owns the labels, and set applies several at once. Lesson 10 card 7." },
    { q: "In observed versus predicted, a good model's points", o: ["lie on a horizontal line", "lie along the identity line y = x", "form a U shape", "cluster at the origin"], a: 1, why: "Observed equals predicted is the diagonal. The residual panel should then be a shapeless band around zero. Lesson 10 card 9." }
  ], "Section D");
}}
],
summary: String.raw`Part 2 is passed when all four sections are at six or above and the total is at least twenty-six. Misses name a lesson and a card. Reopen them, redo the section, and move to Part 3, which starts with linear algebra using the NumPy shapes from Section C.`,
sheet: [[String.raw`\[ \text{A: L2 to L4} \quad \text{B: L5 to L7} \quad \text{C: L8, L9} \quad \text{D: L9, L10} \]`, "the four sections"], [String.raw`\[ \text{pass} = 6/8 \text{ per section}, \ 26/32 \text{ overall} \]`, "the marks"]],
sources: ["AME 5970 HW1 and HW2 (Python and NumPy exercises, the models for the question style)", "Lessons 2 to 10 of this shelf", "Allen Downey, Think Python, 3rd ed. (chapter exercises)", "NumPy user guide: Indexing, Broadcasting", "pandas user guide: 10 minutes to pandas"]
});
})();
