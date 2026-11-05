(function () {
/* ML shelf, Part 2, Lesson 5: Functions, modules and errors. Follows AME 5970 HW1 Part 1 (exercises 9, 10) and HW2 Part 1 (exercise 3). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Core", num: "Lesson 5",
id: "ml-py-l5", title: "Functions, modules and errors", short: "5. Functions, modules, errors",
big: String.raw`A function is a named contract: inputs go in, a result comes out, and the edge cases are handled on purpose. Every file the agent writes for your project is a set of these contracts, so reading a function signature and knowing what it promises is most of reading the project. This lesson covers how arguments are passed, where names live, how a file becomes a module you import, and how errors are raised and caught. The course's homework asks for exactly this: a metric function that rejects bad input, a split function that leaves the caller's list untouched, and a small statistics module you build and import.`,
bridge: String.raw`HW1 Exercise 9 is a tested MAE function that raises ValueError for unequal lengths. Exercise 10 is a seeded split that copies its input before shuffling. HW2 Exercise 3 writes a .py module and imports it. All three patterns reappear in every later notebook.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. def and return", t: "A function is a contract: inputs in, result out",
intu: String.raw`<code>def</code> names a block and lists its parameters. Calling the function binds the arguments to those names, runs the block, and <code>return</code> sends a value back to the caller. Step through a call to the MAE function. Notice that the names inside the function appear only while it runs, and vanish when it returns. The docstring under the def line states the contract in words. It is the first thing to read in any function the agent writes.`,
eq: String.raw`\[ \mathrm{MAE}(y, \hat{y}) = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i| \]`,
sym: [["def f(a, b):", "define f with parameters a and b"], ["argument", "the value passed in a call, bound to the parameter name"], ["return", "send a value back and end the function. No return means None."], ["docstring", "the string right under the def, saying what the function promises"], ["local name", "a name created inside the function, gone after it returns"]],
how: ["The call <code>mae([3, 5, 2], [2, 5, 4])</code> binds <code>y_true</code> and <code>y_pred</code> to the two lists.", "The loop accumulates absolute differences in a local total.", "return hands back total divided by n, and the local names are discarded.", "The caller binds the result to a name of its own.", "Without a return, the function returns None, a common bug when someone forgets the line."],
say: String.raw`A function binds its arguments to parameter names, runs its block with local names, and returns a value to the caller, and its docstring states the contract.`,
num: String.raw`<code>mae([3, 5, 2], [2, 5, 4])</code>: differences 1, 0, 2, mean <b>1.0</b>.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["def mae(y_true, y_pred):", "    \"\"\"Mean absolute error of paired values.\"\"\"", "    total = 0.0", "    for t, p in zip(y_true, y_pred):", "        total += abs(t - p)", "    return total / len(y_true)", "", "err = mae([3, 5, 2], [2, 5, 4])", "print(err)"],
    steps: [
      { ln: 0, vars: [["mae", "F"]], objs: [["F", "function", "mae(y_true, y_pred)"]], out: [], note: "def creates a function object and binds the name. Nothing inside runs yet." },
      { ln: 7, vars: [["mae", "F"], ["y_true", "A"], ["y_pred", "B"]], objs: [["F", "function", "mae(y_true, y_pred)"], ["A", "list", "[3, 5, 2]"], ["B", "list", "[2, 5, 4]"]], out: [], note: "the call binds the arguments to the parameter names" },
      { ln: 2, vars: [["mae", "F"], ["y_true", "A"], ["y_pred", "B"], ["total", "t"]], objs: [["F", "function", "mae(y_true, y_pred)"], ["A", "list", "[3, 5, 2]"], ["B", "list", "[2, 5, 4]"], ["t", "float", "0.0"]], out: [] },
      { ln: 4, vars: [["mae", "F"], ["y_true", "A"], ["y_pred", "B"], ["total", "t"]], objs: [["F", "function", "mae(y_true, y_pred)"], ["A", "list", "[3, 5, 2]"], ["B", "list", "[2, 5, 4]"], ["t", "float", "3.0"]], out: [], note: "after three passes: 1 + 0 + 2" },
      { ln: 5, vars: [["mae", "F"], ["err", "e"]], objs: [["F", "function", "mae(y_true, y_pred)"], ["e", "float", "1.0"]], out: [], note: "return 3.0 / 3. The local names y_true, y_pred and total are gone. The caller binds err." },
      { ln: 8, vars: [["mae", "F"], ["err", "e"]], objs: [["F", "function", "mae(y_true, y_pred)"], ["e", "float", "1.0"]], out: ["1.0"] }
    ]
  });
}},

{s: "2. Arguments", t: "Positional, keyword and default arguments",
intu: String.raw`Arguments can be passed by position or by name, and a parameter can have a default so the caller may omit it. Read a call like <code>split(data, n_train=6, seed=42)</code> and know which value lands where. Click a call to see the binding. Keyword arguments make calls readable and order-proof. A default is written once in the def and used whenever the caller leaves that argument out.`,
eq: String.raw`\[ \texttt{def split(values, n\_train, seed=42)} \qquad \texttt{split(xs, 6)} \equiv \texttt{split(values=xs, n\_train=6, seed=42)} \]`,
sym: [["positional", "matched to parameters left to right"], ["keyword", "<code>name=value</code>, matched by name, any order after the positionals"], ["default", "<code>seed=42</code> in the def: used when the caller omits it"], ["required", "a parameter with no default must be supplied"], ["TypeError", "the error for a missing required argument or an unknown keyword"]],
how: ["Positional arguments fill parameters in order.", "Keyword arguments fill the named parameter and may come in any order.", "Any parameter not filled takes its default. If it has none, TypeError.", "Prefer keywords for anything beyond the first one or two arguments. <code>train(model, data, 0.01, 60)</code> hides what 0.01 and 60 are.", "Defaults are evaluated once, when the def runs. Card 4 shows why that matters."],
say: String.raw`Arguments bind to parameters by position or by name, defaults fill what the caller omits, and a missing required argument is a TypeError.`,
num: String.raw`<code>split(xs, 6)</code> and <code>split(xs, n_train=6)</code> and <code>split(n_train=6, values=xs)</code> all bind the same way, with seed <b>42</b>.`,
r(fig, ctl) {
  const calls = [["split(xs, 6)", { values: "xs", n_train: "6", seed: "42 (default)" }, "ok"], ["split(xs, n_train=6, seed=7)", { values: "xs", n_train: "6", seed: "7" }, "ok"], ["split(n_train=6, values=xs)", { values: "xs", n_train: "6", seed: "42 (default)" }, "ok"], ["split(xs)", { values: "xs", n_train: "missing", seed: "42 (default)" }, "TypeError: split() missing 1 required positional argument: 'n_train'"], ["split(xs, 6, 7, 9)", { values: "xs", n_train: "6", seed: "7" }, "TypeError: split() takes from 2 to 3 positional arguments but 4 were given"], ["split(xs, 6, shuffle=True)", { values: "xs", n_train: "6", seed: "42 (default)" }, "TypeError: split() got an unexpected keyword argument 'shuffle'"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${calls.map((c, i) => `<button data-k="${i}"><code>${ML.esc(c[0])}</code></button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const [call, bind, res] = calls[k], ok = res === "ok";
    let s = tx(340, 24, "def split(values, n_train, seed=42)", "middle", "th");
    Object.entries(bind).forEach(([p, v], i) => { const x = 40 + i * 210, bad = v === "missing"; s += `<rect x="${x}" y="44" width="190" height="64" rx="8" fill="${bad ? "var(--coral-bg)" : "var(--teal-bg)"}" stroke="${bad ? C.coral : C.teal}"/>` + tx(x + 95, 68, p, "middle", "th") + tx(x + 95, 92, "= " + v, "middle", "t"); });
    fig.innerHTML = svg(120, s) + ML.code(["def split(values, n_train, seed=42):", "    ...", "", call], 3) + ML.term(ok ? ["(runs with the binding above)"] : [res]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "3. Scope", t: "Scope: where a name lives",
intu: String.raw`Names created inside a function are local: they exist while the call runs and are invisible outside. Names at the top of the file are global and readable from inside functions. Assigning inside a function always makes a local, even if a global with that name exists, which is the surprise in this card. Step through. The function reads the global learning rate but its own <code>lr = 0.5</code> creates a separate local, and the global stays 0.01.`,
eq: String.raw`\[ \text{lookup order: local} \to \text{enclosing} \to \text{global} \to \text{builtins} \]`,
sym: [["local", "created by assignment inside the function, gone after return"], ["global", "created at file level, readable everywhere in the file"], ["shadowing", "a local with the same name as a global hides the global inside the function"], ["global keyword", "makes assignment inside a function change the global. Avoid it, pass arguments instead."]],
how: ["Reading a global inside a function works: Python looks local first, then global.", "Assigning inside a function creates a local, so the global is untouched.", "That is why functions should take what they need as arguments and return what they produce.", "Mutating a global container from inside a function does change it, because mutation is not assignment. Avoid that too."],
say: String.raw`A function can read global names, but any name it assigns is local, so the clean design passes inputs as arguments and returns outputs.`,
num: String.raw`After the program, the global <code>lr</code> is still <b>0.01</b>. The local 0.5 lived only during the call.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["lr = 0.01", "", "def step(w, g):", "    lr = 0.5          # a new local, not the global", "    return w - lr * g", "", "w = step(1.0, 2.0)", "print(w, lr)"],
    steps: [
      { ln: 0, vars: [["lr (global)", "a"]], objs: [["a", "float", "0.01"]], out: [] },
      { ln: 2, vars: [["lr (global)", "a"], ["step", "F"]], objs: [["a", "float", "0.01"], ["F", "function", "step(w, g)"]], out: [] },
      { ln: 3, vars: [["lr (global)", "a"], ["step", "F"], ["w (local)", "b"], ["g (local)", "c"], ["lr (local)", "d"]], objs: [["a", "float", "0.01"], ["F", "function", "step(w, g)"], ["b", "float", "1.0"], ["c", "float", "2.0"], ["d", "float", "0.5"]], out: [], note: "inside the call: the assignment made a local lr. The global one is untouched." },
      { ln: 6, vars: [["lr (global)", "a"], ["step", "F"], ["w (global)", "e"]], objs: [["a", "float", "0.01"], ["F", "function", "step(w, g)"], ["e", "float", "0.0"]], out: [], note: "returned 1.0 − 0.5 × 2.0 = 0.0. The locals are gone." },
      { ln: 7, vars: [["lr (global)", "a"], ["step", "F"], ["w (global)", "e"]], objs: [["a", "float", "0.01"], ["F", "function", "step(w, g)"], ["e", "float", "0.0"]], out: ["0.0 0.01"] }
    ]
  });
}},

{s: "4. Don't mutate inputs", t: "Do not change what the caller gave you",
intu: String.raw`A list argument is passed as a reference, the alias from Lesson 4. If the function sorts or shuffles it, the caller's list changes. HW1 Exercise 10 guards against this: copy first, then shuffle the copy. Toggle the copy line and watch the caller's list. The same card shows the mutable default trap: a default <code>[]</code> is created once and shared by every call that omits the argument.`,
eq: String.raw`\[ \texttt{shuffled = list(values)} \;\Rightarrow\; \text{the caller's list is untouched} \]`,
sym: [["list(values)", "a copy, like <code>values.copy()</code> or <code>values[:]</code>"], ["random.Random(seed)", "a local generator, so the shuffle is reproducible without touching the global one"], ["mutable default", "<code>def f(xs=[])</code>: one list shared across calls"], ["the fix", "<code>def f(xs=None): if xs is None: xs = []</code>"]],
how: ["Make a copy of any input you intend to reorder or edit.", "Shuffle the copy with a seeded local generator.", "Return new objects. The caller decides what to do with them.", "Never use a list or dictionary as a default value. Use None and create the container inside."],
say: String.raw`A function must not mutate its arguments or share a mutable default, so copy what you will change and build fresh containers inside the call.`,
num: String.raw`Without the copy, after <code>split(measurements, 6)</code> the caller's list is in <b>shuffled order</b>. The HW check <code>assert measurements == measurements_before</code> fails.`,
note: String.raw`HW1 Exercise 10's first assertion is exactly this: the input list was not modified. A seeded local generator is the second requirement.`,
r(fig, ctl) {
  let copy = true, trap = false;
  ctl.innerHTML = btns([["1", "copy first"], ["0", "no copy (bug)"]], "c") + btns([["0", "the split function"], ["1", "mutable default trap"]], "t");
  const u = () => {
    pick(ctl, "c", copy ? 1 : 0); pick(ctl, "t", trap ? 1 : 0);
    if (!trap) {
      const code = ["import random", "def split(values, n_train, seed=42):", copy ? "    shuffled = list(values)      # copy" : "    shuffled = values            # alias!", "    random.Random(seed).shuffle(shuffled)", "    return shuffled[:n_train], shuffled[n_train:]", "", "m = [10, 12, 9, 14, 13, 11, 15, 8]", "train, val = split(m, 6)", "print(m)"];
      fig.innerHTML = ML.code(code, 2) + ML.term([copy ? "[10, 12, 9, 14, 13, 11, 15, 8]" : "[13, 10, 8, 15, 12, 9, 14, 11]"]) + `<p class="note">${copy ? "The caller's list m is unchanged. The function shuffled its own copy." : "The caller's list m was shuffled in place. Its order, and any index into it, is now wrong."}</p>`;
    } else {
      fig.innerHTML = ML.code(["def record(value, log=[]):      # default made once", "    log.append(value)", "    return log", "", "a = record(1)", "b = record(2)", "print(a, b, a is b)"], 0) + ML.term(["[1, 2] [1, 2] True"]) + ML.code(["def record(value, log=None):", "    if log is None:", "        log = []                  # fresh each call", "    log.append(value)", "    return log"], -1) + `<p class="note">The default list is created when def runs, once, and every call that omits log appends to the same object. With None as the default a new list is made per call.</p>`;
    }
  };
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { copy = b.dataset.c === "1"; u(); });
  ctl.querySelectorAll("button[data-t]").forEach(b => b.onclick = () => { trap = b.dataset.t === "1"; u(); });
  u();
}},

{s: "5. Modules", t: "A file is a module: import what you wrote",
intu: String.raw`A .py file is a module. <code>import stats_functions</code> runs the file once and gives you its names under that prefix. <code>from src.data import load_splits</code> pulls one name in directly. This is how the agent's project is organized: src/data.py, src/model.py, src/train.py, each importing the others. Click the import forms to see what each puts in your namespace, and the two ways to run a file that explain the main guard.`,
eq: String.raw`\[ \texttt{import m} \to \texttt{m.f()}, \qquad \texttt{from m import f} \to \texttt{f()}, \qquad \texttt{\_\_name\_\_ == "\_\_main\_\_"} \text{ only when run directly} \]`,
sym: [["module", "a .py file. Its top-level names are its contents."], ["package", "a folder with modules, imported with dots: <code>src.data</code>"], ["import m", "the module object m, use <code>m.f</code>"], ["from m import f", "just f, in the current namespace"], ["import m as alias", "shorter name, as in <code>import numpy as np</code>"], ["the main guard", "code under it runs when the file is executed, not when it is imported"]],
how: ["Write functions in a .py file under src/.", "Import them from another file or a notebook. The first import runs the file once and caches it.", "Keep the test or demo under the main guard so importing the module does not run it.", "<code>python src/data.py</code> runs it directly and the guard is true. <code>from src.data import load_splits</code> imports it and the guard is false.", "In a notebook, use <code>importlib.reload(m)</code> after editing m, or restart the kernel."],
say: String.raw`A Python file is a module whose functions you import, and the main guard separates what runs on import from what runs when the file is executed directly.`,
num: String.raw`A course project has about <b>4 to 8 modules</b> under src/. Every HW notebook imports at least numpy, torch and the file it builds.`,
note: String.raw`HW2 Exercise 3 writes stats_functions.py, imports it, and reloads it. The "why a list for modes" question is in the module's contract, not the import.`,
r(fig, ctl) {
  const F = [["import stats_functions", ["import stats_functions", "stats_functions.calculate_mean([2, 3, 4])"], "names you get: stats_functions", "3"], ["from ... import", ["from stats_functions import calculate_mean, calculate_median", "calculate_mean([2, 3, 4])"], "names you get: calculate_mean, calculate_median", "3"], ["import as", ["import numpy as np", "np.mean([2, 3, 4])"], "names you get: np", "3.0"], ["run directly", ["$ python src/stats_functions.py", "__name__ is __main__, the demo under the guard runs", "mean 4.6  median 5.0  modes [5]"], "the guard is true", null], ["imported", ["$ python -c \"import src.stats_functions\"", "__name__ is src.stats_functions, the demo does not run", "(no output)"], "the guard is false", null]];
  let k = 0;
  ctl.innerHTML = btns(F.map((f, i) => [i, f[0]]), "k");
  const u = () => {
    pick(ctl, "k", k);
    const f = F[k];
    const mod = ["# src/stats_functions.py", "import statistics", "", "def calculate_mean(numbers):", "    return statistics.mean(numbers)", "", "def calculate_median(numbers):", "    return statistics.median(numbers)", "", "if __name__ == \"__main__\":", "    data = [2, 3, 3, 4, 5, 5, 5, 6, 6, 7]", "    print(\"mean\", calculate_mean(data), \" median\", calculate_median(data))"];
    fig.innerHTML = `<p class="sec">the module</p>` + ML.code(mod, k >= 3 ? 9 : -1) + `<p class="sec">${k >= 3 ? "how it is run" : "how it is used"}</p>` + (k >= 3 ? ML.term(f[1]) : ML.code(f[1], -1) + ML.term([f[3]])) + `<p class="note">${f[2]}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "6. Raising errors", t: "Fail loudly: raise an error for a broken contract",
intu: String.raw`When a function gets input it cannot handle, silently returning something is the worst option. Raise an error with a message that names the problem. The two you will use most: ValueError for a value outside the contract, TypeError for the wrong kind of object. Click an input to the MAE function and see whether the contract accepts it. The checks sit at the top of the function, before any computation, so a bad input never produces a plausible wrong number.`,
eq: String.raw`\[ \text{check the contract first} \;\to\; \texttt{raise ValueError(message)} \;\text{ or compute} \]`,
sym: [["raise", "stop here and send the error up to the caller"], ["ValueError", "right type, unacceptable value: empty, negative, wrong length"], ["TypeError", "wrong type: a string where a number was needed"], ["the message", "names the value and the rule, so the reader can act"], ["assert", "a check that should never fail, used in tests and sanity checks"]],
how: ["Write the contract in the docstring: same nonzero length, numeric values.", "Check each rule at the top. Raise with a message naming the rule and the value.", "Only then compute.", "A truncated comparison of unequal lists would hide missing predictions. Failing loudly is safer.", "Use assert for checks a correct program never violates, like a shape after a reshape. It is not for validating user input."],
say: String.raw`A function checks its contract first and raises ValueError or TypeError with a clear message, because a loud failure is cheaper than a plausible wrong result.`,
num: String.raw`HW1's MAE contract: both inputs <b>same nonzero length</b>. The two rejected cases in the check were <code>([], [])</code> and <code>([1, 2], [1])</code>.`,
r(fig, ctl) {
  const T = [["mae([3, 5, 2], [2, 5, 4])", "1.0", null], ["mae([1], [1])", "0.0", null], ["mae([], [])", null, "ValueError: inputs must not be empty"], ["mae([1, 2], [1])", null, "ValueError: inputs must have the same length, got 2 and 1"], ["mae([1, \"a\"], [1, 2])", null, "TypeError: unsupported operand type(s) for -: 'str' and 'int'"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}"><code>${ML.esc(t[0])}</code></button>`).join("")}</div>`;
  const code = ["def mae(y_true, y_pred):", "    \"\"\"MAE of paired values. Both nonempty, same length.\"\"\"", "    if len(y_true) == 0:", "        raise ValueError(\"inputs must not be empty\")", "    if len(y_true) != len(y_pred):", "        raise ValueError(f\"inputs must have the same length, \"", "                         f\"got {len(y_true)} and {len(y_pred)}\")", "    total = 0.0", "    for t, p in zip(y_true, y_pred):", "        total += abs(t - p)", "    return total / len(y_true)"];
  const u = () => {
    pick(ctl, "k", k);
    const t = T[k], ln = k === 2 ? 3 : k === 3 ? 5 : k === 4 ? 9 : 10;
    let s = ML.box(40, 20, 240, 56, "c-gray", ["call", t[0]], true) + arrow(290, 48, 340, 48, t[1] != null ? C.teal : C.coral, 2) + ML.box(350, 20, 290, 56, t[1] != null ? "c-teal" : "c-coral", [t[1] != null ? "returns" : "raises", t[1] != null ? t[1] : t[2].split(":")[0]], true);
    fig.innerHTML = svg(90, s) + ML.code(code, ln) + ML.term(t[1] != null ? [t[1]] : ["Traceback (most recent call last):", "  ...", t[2]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "7. Catching errors", t: "try and except: handle what you expect, let the rest through",
intu: String.raw`A raised error travels up through the callers until something catches it, or the program stops with a traceback. <code>try</code> and <code>except</code> catch a named error so a program can continue, for example skip one bad row and keep loading. Catch the specific error you expect, never a bare <code>except:</code>, which would also hide bugs. Step through a loader that converts rows and keeps a list of the rows that failed.`,
eq: String.raw`\[ \texttt{try: risky()} \quad \texttt{except ValueError as e: handle(e)} \quad \texttt{else / finally: optional} \]`,
sym: [["try block", "the code that may raise"], ["except ValueError as e", "runs only if that error was raised inside the try, with e holding it"], ["traceback", "the printed chain of calls when nothing catches the error"], ["bare except", "catches everything including bugs and keyboard interrupts. Do not."], ["finally", "runs no matter what, for cleanup such as closing a file"]],
how: ["Put only the risky call inside try.", "Catch the specific error class. ValueError for a bad value, KeyError for a missing key, FileNotFoundError for a missing file.", "Decide what to do: skip the row and record it, use a default, or re-raise with more context.", "Report what was skipped. A silent except is as bad as a silent overwrite.", "Everything you did not expect should still crash, loudly, so you learn about it."],
say: String.raw`try and except catch a named error so the program can continue deliberately, and an error you did not expect should propagate and stop the program.`,
num: String.raw`Three rows, one with text in the count field: <b>2 converted, 1 reported</b> with its row number and the reason.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["rows = [\"4\", \"x\", \"7\"]", "counts, bad = [], []", "for i, r in enumerate(rows):", "    try:", "        counts.append(int(r))", "    except ValueError as e:", "        bad.append((i, str(e)))", "print(counts)", "print(bad)"],
    steps: [
      { ln: 1, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[]"], ["B", "list", "[]"]], out: [] },
      { ln: 4, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"], ["r", "r"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[4]"], ["B", "list", "[]"], ["r", "str", "'4'"]], out: [], note: "row 0: int('4') works, nothing raised, except is skipped" },
      { ln: 4, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"], ["r", "r"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[4]"], ["B", "list", "[]"], ["r", "str", "'x'"]], out: [], note: "row 1: int('x') raises ValueError inside the try" },
      { ln: 6, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"], ["r", "r"], ["e", "e"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[4]"], ["B", "list", "[(1, \"invalid literal for int() with base 10: 'x'\")]"], ["r", "str", "'x'"], ["e", "ValueError", "invalid literal ..."]], out: [], note: "the except caught it. The row is recorded and the loop continues." },
      { ln: 4, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"], ["r", "r"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[4, 7]"], ["B", "list", "[(1, ...)]"], ["r", "str", "'7'"]], out: [], note: "row 2 converts" },
      { ln: 8, vars: [["rows", "R"], ["counts", "L"], ["bad", "B"], ["r", "r"]], objs: [["R", "list", "['4', 'x', '7']"], ["L", "list", "[4, 7]"], ["B", "list", "[(1, ...)]"], ["r", "str", "'7'"]], out: ["[4, 7]", "[(1, \"invalid literal for int() with base 10: 'x'\")]"] }
    ]
  });
}},

{s: "8. Test a contract", t: "Test a function the way the homework does",
intu: String.raw`The homework's public checks are small tests: call the function on a known case and assert the answer, then call it on bad input and assert that it raises. That pattern is also how you check the agent's work. Click each test to see it run against the MAE function. A test that expects an error uses try and except in reverse: if no error comes, that is the failure.`,
eq: String.raw`\[ \texttt{assert f(known) == expected} \qquad \texttt{try: f(bad) except ValueError: pass else: fail} \]`,
sym: [["assert", "raises AssertionError if the condition is false"], ["math.isclose", "compare floats with a tolerance instead of =="], ["known case", "an input small enough to compute by hand"], ["edge case", "empty, length one, unequal lengths, a negative, a huge value"], ["expecting an error", "the test passes only if the error is raised"]],
how: ["Pick an input you can compute by hand and assert the exact result.", "Add the edge cases from the contract: empty, single item, unequal lengths.", "For the error cases, wrap the call in try. If it does not raise, fail with a message.", "Run the tests after every change. If the agent changes the function, the tests say whether the contract still holds.", "Put tests in a tests/ folder and run them with pytest once there are more than a few."],
say: String.raw`A function is tested by asserting known results and by asserting that bad inputs raise, and those tests are rerun after every change.`,
num: String.raw`HW1 Exercise 9 ships <b>4 checks</b>: two values, and two inputs that must raise. Five lines of tests for eleven lines of function is a normal ratio.`,
r(fig, ctl) {
  const T = [["known value", ["assert math.isclose(mae([3, 5, 2], [2, 5, 4]), 1.0)"], "passes: differences 1, 0, 2 average to 1.0"], ["perfect prediction", ["assert math.isclose(mae([1], [1]), 0.0)"], "passes: one pair, zero error"], ["empty must raise", ["try:", "    mae([], [])", "except ValueError:", "    pass", "else:", "    raise AssertionError(\"empty input must raise ValueError\")"], "passes: the ValueError was raised and caught, so else did not run"], ["unequal must raise", ["try:", "    mae([1, 2], [1])", "except ValueError:", "    pass", "else:", "    raise AssertionError(\"unequal lengths must raise\")"], "passes: raised as the contract requires"], ["a broken version", ["# suppose someone removed the length check", "try:", "    mae([1, 2], [1])      # now returns 0.0 silently", "except ValueError:", "    pass", "else:", "    raise AssertionError(\"unequal lengths must raise\")"], "FAILS: no error came, so else ran. The test caught the broken contract."]];
  let k = 0;
  ctl.innerHTML = btns(T.map((t, i) => [i, t[0]]), "k");
  const u = () => {
    pick(ctl, "k", k);
    const t = T[k], fail = k === 4;
    fig.innerHTML = ML.code(t[1], -1) + ML.term(fail ? ["Traceback (most recent call last):", "  ...", "AssertionError: unequal lengths must raise"] : ["(no output: the assertion held)"]) + `<p class="note"><b>${fail ? "Fails." : "Passes."}</b> ${t[2].replace(/^(passes|FAILS): /, "")}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "9. With the agent", t: "Do it with the agent: a metrics module with tests",
intu: String.raw`The first module of your project that other modules will import: metrics. Two functions with contracts, raised errors, and a test file that proves the contracts. This is the shape every src/ file should have, and the tests are how you will check the agent's later changes in seconds.`,
eq: String.raw`\[ \texttt{src/metrics.py} + \texttt{tests/test\_metrics.py} \;\to\; \texttt{pytest} \text{ green} \]`,
sym: [["mae, rmse", "two metric functions with the same contract"], ["tests", "known values, edge cases, expected errors"], ["pytest", "finds and runs every test function, reports pass or fail"]],
how: ["Paste the command.", "Read metrics.py: docstrings, the checks at the top, the computation after.", "Read the tests: can you compute each expected value by hand?", "Run pytest. All green. Then break something on purpose, rerun, and watch a test go red."],
say: String.raw`A module ships with tests that assert its contract, and pytest reruns them after every change so the contract cannot drift silently.`,
num: String.raw`<b>2 functions, 6 tests</b>, runs in under a second.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/metrics.py with two functions, mae(y_true, y_pred) and rmse(y_true, y_pred), taking two sequences of numbers. Both must raise ValueError if either input is empty or the lengths differ, with a message that states the rule and the lengths. Use plain Python loops, no NumPy. Docstrings and type hints. Then create tests/test_metrics.py with pytest tests: mae of [3, 5, 2] versus [2, 5, 4] is 1.0, rmse of the same is sqrt(5/3), a perfect prediction gives 0 for both, and empty or unequal inputs raise ValueError for both, using pytest.raises. Add an empty tests/__init__.py if needed. Run python -m pytest -q and paste the output.",
    actions: ["$ python -m pytest -q", "......                                                   [100%]", "6 passed in 0.03s"],
    code: "import pytest\nfrom src.metrics import mae, rmse\n\ndef test_mae_known():\n    assert mae([3, 5, 2], [2, 5, 4]) == pytest.approx(1.0)\n\ndef test_unequal_raises():\n    with pytest.raises(ValueError):\n        mae([1, 2], [1])",
    checks: ["both functions check the contract before computing", "the error messages name the rule and the actual lengths", "the rmse test expects sqrt(5/3), which I confirmed by hand: errors 1, 0, 2 squared are 1, 0, 4, mean 5/3", "pytest reports 6 passed", "removing the length check makes a test fail, so the tests really guard the contract"]
  });
}},

{s: "10. Test", t: "Test: functions, modules and errors",
intu: String.raw`Twelve questions on calls, arguments, scope, mutation, imports and errors.`,
eq: String.raw`\[ \text{contract} \to \text{call} \to \text{result or error} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Bind arguments to parameters before predicting.", "Ask whether a name is local or global.", "Ask whether the input could be mutated.", "Ask which error the contract raises."],
say: String.raw`I can read a function's contract, predict what a call returns or raises, and explain where its names live.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: "def f(x):\n    x = x * 2\n\nprint(f(3))", o: ["6", "3", "None", "Error"], a: 2, why: "The function has no return, so it returns None. The doubled x was a local that vanished." },
    { q: "Given <code>def split(values, n_train, seed=42)</code>, which call is invalid?", o: ["split(xs, 6)", "split(xs, n_train=6, seed=1)", "split(n_train=6, values=xs)", "split(xs)"], a: 3, why: "n_train has no default, so it must be supplied." },
    { q: "What does this print?", code: "lr = 0.01\ndef g():\n    lr = 0.5\n    return lr\ng()\nprint(lr)", o: ["0.5", "0.01", "None", "Error"], a: 1, why: "Assignment inside g makes a local lr. The global is unchanged." },
    { q: "A function does <code>values.sort()</code> on its list argument. After the call, the caller's list is:", o: ["Unchanged", "Sorted, because the list was passed by reference", "A copy", "Deleted"], a: 1, why: "The parameter is an alias of the caller's list, so sorting in place changes it. Copy first." },
    { q: "Why is <code>def f(log=[])</code> a bug?", o: ["Lists cannot be defaults", "The default list is created once and shared by every call that omits it", "It raises TypeError", "It is slower"], a: 1, why: "Defaults are evaluated when def runs. Use None and create the list inside." },
    { q: "After <code>import numpy as np</code>, which name exists?", o: ["numpy", "np", "both", "mean"], a: 1, why: "import as binds only the alias np." },
    { q: "When does the code under <code>if __name__ == \"__main__\":</code> run?", o: ["On every import", "Only when the file is executed directly", "Never", "Only in notebooks"], a: 1, why: "On import, __name__ is the module's name, so the guard is false." },
    { q: "mae([1, 2], [1]) should raise which error, by the HW1 contract?", o: ["TypeError", "ValueError", "KeyError", "IndexError"], a: 1, why: "The values are the right type but the lengths differ. That is a ValueError." },
    { q: "What does this print?", code: "out = []\nfor r in [\"4\", \"x\", \"7\"]:\n    try:\n        out.append(int(r))\n    except ValueError:\n        out.append(None)\nprint(out)", o: ["[4, 7]", "[4, None, 7]", "Error", "[4, 'x', 7]"], a: 1, why: "The bad row raises inside the try, the except appends None, and the loop continues." },
    { q: "Why is a bare <code>except:</code> discouraged?", o: ["It is slower", "It catches every error, including bugs you need to see", "It only catches ValueError", "It is a syntax error"], a: 1, why: "Catch the specific error you expect so unexpected ones still stop the program." },
    { q: "A test calls <code>f(bad)</code> inside try, has <code>except ValueError: pass</code>, and an else that raises AssertionError. When does the test pass?", o: ["When f returns a value", "When f raises ValueError", "Always", "Never"], a: 1, why: "The else runs only if no error was raised, which is the failure case here." },
    { q: "What is the right way to compare a computed float with 1.0 in a test?", o: ["==", "math.isclose or pytest.approx", "is", "round and =="], a: 1, why: "Floating point results differ in the last digits. A tolerance comparison is correct." }
  ], "Lesson 5 test");
}}
],
summary: String.raw`A function binds its arguments to parameters, runs with local names, and returns a value, with a docstring stating the contract. Arguments are passed by position or keyword, defaults fill what the caller omits, and a default container is a bug because it is created once. Names assigned inside a function are local, so functions take inputs as arguments and return outputs rather than touching globals, and they copy any argument they would change. A file is a module you import, and the main guard separates what runs on import from what runs directly. A function checks its contract first and raises ValueError or TypeError with a clear message, callers catch the specific errors they expect with try and except, and tests assert known results and expected errors so the contract cannot drift.`,
sheet: [
[String.raw`\[ \texttt{def f(a, b=default):} \ \ldots\ \texttt{return v} \]`, "Definition, default, return"],
[String.raw`\[ \text{local} \to \text{enclosing} \to \text{global} \to \text{builtins} \]`, "Name lookup order"],
[String.raw`\[ \texttt{shuffled = list(values)} \]`, "Copy before you change an argument"],
[String.raw`\[ \texttt{import m}, \quad \texttt{from m import f}, \quad \texttt{\_\_name\_\_ == "\_\_main\_\_"} \]`, "Modules and the main guard"],
[String.raw`\[ \texttt{raise ValueError(msg)} \quad \| \quad \texttt{try / except ValueError as e} \]`, "Raising and catching"],
[String.raw`\[ \texttt{assert isclose(f(x), y)} \quad \| \quad \texttt{with pytest.raises(ValueError)} \]`, "Testing a contract"]],
sources: ["AME 5970 HW1 Part 1, exercises 9 and 10 (a tested metric function, a seeded split that copies its input)", "AME 5970 HW2 Part 1, exercise 3 (write and import a statistics module) and exercise 6 (a contract with ValueError and TypeError)", "The Python Tutorial, sections 4.8 (defining functions), 6 (modules) and 8 (errors and exceptions)", "pytest documentation: getting started, pytest.raises and pytest.approx"]
});
})();
