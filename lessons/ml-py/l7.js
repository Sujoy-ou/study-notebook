(function () {
/* ML shelf, Part 2, Lesson 7: Pythonic tools. The idioms that appear in every PyTorch file: enumerate, zip, unpacking, generators, sorted with a key, decorators, context managers, type hints, dataclasses. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Pro", num: "Lesson 7",
id: "ml-py-l7", title: "Pythonic tools", short: "7. Pythonic tools",
big: String.raw`The lessons so far cover Python you could write. This one covers Python you will read in every file the agent produces and in every PyTorch example: <code>for i, (x, y) in enumerate(loader)</code>, a <code>@torch.no_grad()</code> decorator, <code>with open(path) as f</code>, a function signature full of type hints, a <code>@dataclass</code> for a config. None of it is hard once you know what each piece means, and all of it is opaque until you do. Each card takes one idiom, shows the plain-loop version next to it, and runs it.`,
bridge: String.raw`The professor's notebooks use these without comment: enumerate over a loader, zip over parameters, a generator expression inside sum for parameter counting, <code>torch.no_grad()</code> as a context manager and as a decorator, and type hints on every function. Ng's optional labs use the same idioms. After this lesson they read as plain language.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. enumerate, zip", t: "enumerate and zip: loop with an index, loop over pairs",
intu: String.raw`<code>enumerate(xs)</code> yields (index, item) pairs so you never write a manual counter. <code>zip(xs, ys)</code> yields pairs of corresponding items so you never index two lists in parallel. Step through both. The training loop <code>for step, (x, y) in enumerate(loader)</code> is both at once: enumerate gives the step number, and each item of the loader is already a (features, targets) pair that is unpacked.`,
eq: String.raw`\[ \texttt{enumerate(xs)} \to (0, x_0), (1, x_1), \ldots \qquad \texttt{zip(xs, ys)} \to (x_0, y_0), (x_1, y_1), \ldots \]`,
sym: [["enumerate(xs, start=0)", "pairs of index and item"], ["zip(a, b)", "pairs of items, stops at the shorter"], ["zip(..., strict=True)", "raises if the lengths differ, Python 3.10 and up"], ["for i, (x, y) in ...", "unpack the index and then the pair inside it"]],
how: ["Instead of <code>for i in range(len(xs))</code> and <code>xs[i]</code>, enumerate hands you both.", "Instead of indexing two lists with the same i, zip hands you the pair.", "Both are lazy: they produce one pair at a time, which matters for large data.", "zip stops at the shortest input silently. Use strict=True when the lengths must match, which for paired data they must.", "The MAE function in Lesson 5 already used zip over <code>y_true</code> and <code>y_pred</code>."],
say: String.raw`enumerate pairs each item with its index and zip pairs corresponding items of several sequences, and both replace manual indexing in a loop.`,
num: String.raw`<code>zip([1, 2, 3], [10, 20])</code> yields <b>2 pairs</b>. With strict=True it raises <b>ValueError</b> instead.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["names = [\"A\", \"B\", \"C\"]", "hv = [312.5, 298.0, 327.5]", "for i, name in enumerate(names):", "    print(i, name)", "for name, h in zip(names, hv):", "    print(name, h)", "for i, (name, h) in enumerate(zip(names, hv), start=1):", "    print(f\"row {i}: {name} {h}\")"],
    steps: [
      { ln: 1, vars: [["names", "N"], ["hv", "H"]], objs: [["N", "list", "['A', 'B', 'C']"], ["H", "list", "[312.5, 298.0, 327.5]"]], out: [] },
      { ln: 3, vars: [["names", "N"], ["hv", "H"], ["i", "i"], ["name", "n"]], objs: [["N", "list", "['A', 'B', 'C']"], ["H", "list", "[312.5, 298.0, 327.5]"], ["i", "int", "0"], ["n", "str", "'A'"]], out: ["0 A"], note: "enumerate gave (0, 'A') and the for unpacked it into i and name" },
      { ln: 3, vars: [["names", "N"], ["hv", "H"], ["i", "i"], ["name", "n"]], objs: [["N", "list", "['A', 'B', 'C']"], ["H", "list", "[312.5, 298.0, 327.5]"], ["i", "int", "2"], ["n", "str", "'C'"]], out: ["0 A", "1 B", "2 C"], note: "three passes, three pairs" },
      { ln: 5, vars: [["names", "N"], ["hv", "H"], ["name", "n"], ["h", "h"]], objs: [["N", "list", "['A', 'B', 'C']"], ["H", "list", "[312.5, 298.0, 327.5]"], ["n", "str", "'C'"], ["h", "float", "327.5"]], out: ["0 A", "1 B", "2 C", "A 312.5", "B 298.0", "C 327.5"], note: "zip walked both lists in step" },
      { ln: 7, vars: [["names", "N"], ["hv", "H"], ["i", "i"], ["name", "n"], ["h", "h"]], objs: [["N", "list", "['A', 'B', 'C']"], ["H", "list", "[312.5, 298.0, 327.5]"], ["i", "int", "3"], ["n", "str", "'C'"], ["h", "float", "327.5"]], out: ["0 A", "1 B", "2 C", "A 312.5", "B 298.0", "C 327.5", "row 1: A 312.5", "row 2: B 298.0", "row 3: C 327.5"], note: "both at once: enumerate numbers the pairs that zip makes, starting at 1" }
    ]
  });
}},

{s: "2. Unpacking", t: "Unpacking: many names from one sequence",
intu: String.raw`Assignment can split a sequence into names in one line. A star collects the rest. A function that returns several values returns a tuple that the caller unpacks. Click each form to see what lands where. The shape <code>(64, 1, 28, 28)</code> of an image batch is a tuple you will unpack as <code>B, C, H, W = x.shape</code> again and again.`,
eq: String.raw`\[ \texttt{a, b = pair} \qquad \texttt{first, *rest = xs} \qquad \texttt{B, C, H, W = x.shape} \qquad \texttt{f(*args, **kwargs)} \]`,
sym: [["a, b = t", "two names from a sequence of length two"], ["*rest", "collects whatever is left into a list"], ["a, b = b, a", "swap, because the right side is built first"], ["f(*xs)", "spread a list into positional arguments"], ["f(**d)", "spread a dictionary into keyword arguments"]],
how: ["The right side is evaluated to a sequence, then split across the names by position.", "The count must match, unless a starred name absorbs the surplus.", "A function returning <code>return train, val, test</code> returns one tuple, which the caller unpacks into three names.", "<code>*</code> in a call spreads a sequence into separate arguments, <code>**</code> spreads a dictionary into keyword arguments, which is how a config dictionary becomes <code>Model(**cfg)</code>."],
say: String.raw`Unpacking assigns the items of a sequence to several names by position, a star collects the rest, and in a call a star spreads a sequence into arguments.`,
num: String.raw`<code>B, C, H, W = (64, 1, 28, 28)</code>: B is <b>64</b>, W is <b>28</b>. <code>first, *rest = [1, 2, 3, 4]</code>: rest is <b>[2, 3, 4]</b>.`,
r(fig, ctl) {
  const F = [["pair", ["lo, hi = (331, 337)", "print(lo, hi)"], [["lo", "331"], ["hi", "337"]], "331 337"], ["shape", ["shape = (64, 1, 28, 28)", "B, C, H, W = shape", "print(B, H * W)"], [["B", "64"], ["C", "1"], ["H", "28"], ["W", "28"]], "64 784"], ["star", ["first, *rest = [10, 20, 30, 40]", "print(first, rest)"], [["first", "10"], ["rest", "[20, 30, 40]"]], "10 [20, 30, 40]"], ["swap", ["a, b = 1, 2", "a, b = b, a", "print(a, b)"], [["a", "2"], ["b", "1"]], "2 1"], ["multiple return", ["def split(xs):", "    return xs[:2], xs[2:]", "train, test = split([5, 6, 7, 8])", "print(train, test)"], [["train", "[5, 6]"], ["test", "[7, 8]"]], "[5, 6] [7, 8]"], ["** in a call", ["cfg = {\"hidden\": 64, \"lr\": 0.01}", "def make(hidden, lr):", "    return f\"hidden={hidden} lr={lr}\"", "print(make(**cfg))"], [["hidden", "64"], ["lr", "0.01"]], "hidden=64 lr=0.01"], ["mismatch", ["a, b = (1, 2, 3)"], [], "ValueError: too many values to unpack (expected 2)"]];
  let k = 1;
  ctl.innerHTML = btns(F.map((f, i) => [i, f[0]]), "k");
  const u = () => {
    pick(ctl, "k", k);
    const f = F[k];
    let s = "";
    f[2].forEach(([n, v], i) => { const x = 40 + i * 150; s += ML.box(x, 16, 136, 50, "c-teal", [n, "= " + v], true); });
    if (!f[2].length) s += ML.box(40, 16, 600, 50, "c-coral", ["no names bound", "the count did not match"], true);
    fig.innerHTML = svg(80, s) + ML.code(f[1], -1) + ML.term([f[3]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "3. Generators", t: "Iterators and generators: produce one item at a time",
intu: String.raw`A list holds every item in memory. A generator produces items on demand and forgets each one after yielding it. <code>yield</code> inside a function makes it a generator: the function pauses at each yield and resumes on the next request. Step through. This is how a DataLoader hands out batches: one at a time, from a dataset too large to load at once. A generator expression, a comprehension in round brackets, is the one-line version, and <code>sum(p.numel() for p in model.parameters())</code> counts parameters without ever building a list.`,
eq: String.raw`\[ \texttt{def gen(): yield x} \;\to\; \text{pause and resume} \qquad \texttt{sum(f(x) for x in xs)} \;\to\; \text{no list is built} \]`,
sym: [["iterator", "anything next() can pull one item from"], ["yield", "hand out one value and pause the function"], ["generator", "a function with yield, or a comprehension in round brackets"], ["lazy", "nothing is computed until it is asked for"], ["exhausted", "a generator gives each item once. A second loop over it gets nothing."]],
how: ["Calling a generator function returns a generator object. Nothing inside has run.", "The for loop calls next on it. The body runs until the first yield and hands out that value.", "On the next request it resumes after the yield, with its locals intact.", "When the function ends, the loop ends.", "Memory stays flat: one batch at a time, however many batches there are."],
say: String.raw`A generator produces one value at a time with yield, pausing between values, so a loop can consume a large or infinite sequence without holding it all in memory.`,
num: String.raw`A dataset of 60000 images as a list of tensors is <b>about 180 MB</b>. A generator yielding batches of 64 holds <b>one batch</b> at a time.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["def batches(xs, size):", "    for start in range(0, len(xs), size):", "        yield xs[start:start + size]", "", "gen = batches([1, 2, 3, 4, 5], 2)", "for b in gen:", "    print(b)", "print(sum(len(b) for b in batches([1, 2, 3, 4, 5], 2)))"],
    steps: [
      { ln: 4, vars: [["gen", "G"]], objs: [["G", "generator", "batches(...) paused at the start"]], out: [], note: "calling a generator function runs nothing. It returns a paused generator." },
      { ln: 2, vars: [["gen", "G"], ["b", "b"]], objs: [["G", "generator", "paused at yield, start=0"], ["b", "list", "[1, 2]"]], out: [], note: "the loop asked for an item. The function ran to its first yield." },
      { ln: 6, vars: [["gen", "G"], ["b", "b"]], objs: [["G", "generator", "paused at yield, start=0"], ["b", "list", "[1, 2]"]], out: ["[1, 2]"] },
      { ln: 2, vars: [["gen", "G"], ["b", "b"]], objs: [["G", "generator", "paused at yield, start=2"], ["b", "list", "[3, 4]"]], out: ["[1, 2]"], note: "resumed after the yield, start is now 2" },
      { ln: 6, vars: [["gen", "G"], ["b", "b"]], objs: [["G", "generator", "paused at yield, start=4"], ["b", "list", "[5]"]], out: ["[1, 2]", "[3, 4]", "[5]"], note: "the last batch is short. Then the range ends and so does the generator." },
      { ln: 7, vars: [["gen", "G"], ["b", "b"]], objs: [["G", "generator", "exhausted"], ["b", "list", "[5]"]], out: ["[1, 2]", "[3, 4]", "[5]", "5"], note: "a generator expression fed to sum: lengths 2, 2, 1 added as they are produced. No list was built." }
    ]
  });
}},

{s: "4. sorted and lambda", t: "sorted with a key, and lambda for a one-line function",
intu: String.raw`<code>sorted(xs, key=f)</code> sorts by what f returns for each item, without changing the items. <code>lambda x: x[1]</code> is a one-expression function written in place, handy as a key. Click a key to sort the experiment records differently. The same key idea drives <code>min(trials, key=...)</code> to pick the best run, and <code>max(counts, key=counts.get)</code> to find the majority class.`,
eq: String.raw`\[ \texttt{sorted(xs, key=lambda r: r[1], reverse=True)} \;\to\; \text{sorted by the second field, descending} \]`,
sym: [["key=f", "sort by f(item), items unchanged"], ["lambda a, b: expr", "an anonymous function of one expression"], ["reverse=True", "descending"], ["min(xs, key=f), max(xs, key=f)", "the item with the smallest or largest f(item)"], ["stable", "ties keep their original order"]],
how: ["sorted builds a new list. The original order is preserved elsewhere.", "key is called once per item, and the results decide the order.", "A lambda is just a short function. If it needs a name or more than one line, write def.", "<code>min(trials, key=lambda t: t[\"val_mse\"])</code> is the model selection line in the professor's HW6.", "A tuple key sorts by the first field, then the second: <code>key=lambda r: (r[1], r[0])</code>."],
say: String.raw`sorted, min and max take a key function that says what to compare, and a lambda is a one-expression function written where it is used.`,
num: String.raw`Three runs with validation MSE <b>0.42, 0.31, 0.35</b>: <code>min(runs, key=lambda r: r["val"])</code> returns the run with <b>0.31</b>.`,
r(fig, ctl) {
  const runs = [{ name: "lr 0.001", val: 0.42, secs: 12 }, { name: "lr 0.01", val: 0.31, secs: 11 }, { name: "lr 0.1", val: 0.35, secs: 9 }, { name: "lr 0.03", val: 0.31, secs: 14 }];
  const K = [["by val", r => r.val, "key=lambda r: r[\"val\"]", false], ["by val, descending", r => r.val, "key=lambda r: r[\"val\"], reverse=True", true], ["by seconds", r => r.secs, "key=lambda r: r[\"secs\"]", false], ["by (val, secs)", r => r.val * 1000 + r.secs, "key=lambda r: (r[\"val\"], r[\"secs\"])", false], ["by name", r => r.name, "key=lambda r: r[\"name\"]", false]];
  let k = 0;
  ctl.innerHTML = btns(K.map((x, i) => [i, x[0]]), "k") + `<div id="sk"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const key = K[k];
    const idx = runs.map((r, i) => i).sort((a, b) => { const ka = key[1](runs[a]), kb = key[1](runs[b]); return (ka < kb ? -1 : ka > kb ? 1 : a - b) * (key[3] ? -1 : 1); });
    let s = tx(40, 24, "original order", null, "th") + tx(380, 24, "sorted(runs, " + key[2].split(",")[0] + ")", null, "th");
    runs.forEach((r, i) => { s += ML.box(40, 36 + i * 44, 280, 36, "c-gray", [`${r.name}   val ${r.val}   ${r.secs} s`], false); });
    idx.forEach((j, i) => { const r = runs[j]; s += ML.box(380, 36 + i * 44, 280, 36, i === 0 ? "c-teal" : "c-blue", [`${r.name}   val ${r.val}   ${r.secs} s`], false) + `<path d="M322 ${54 + j * 44} C 350 ${54 + j * 44}, 350 ${54 + i * 44}, 378 ${54 + i * 44}" fill="none" stroke="${C.gray}" stroke-width="1"/>`; });
    fig.innerHTML = svg(220, s) + ML.code(["runs = [{\"name\": \"lr 0.001\", \"val\": 0.42, \"secs\": 12}, ...]", `ordered = sorted(runs, ${key[2]})`, "best = min(runs, key=lambda r: r[\"val\"])", "print(best[\"name\"])"], 1) + ML.term(["lr 0.01"]);
    $("sk").innerHTML = `<p class="note">${k === 3 ? "Tuple key: the two runs tied at 0.31 are then ordered by seconds." : k === 0 ? "Two runs tie at 0.31. The sort is stable, so lr 0.01 stays before lr 0.03 as in the original." : "min with the same key returns the first smallest item, lr 0.01."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "5. Decorators", t: "Decorators: a function that wraps a function",
intu: String.raw`A decorator takes a function and returns a new function that adds behavior around it. The <code>@name</code> line above a def is only shorthand for <code>f = name(f)</code>. Step through a timing decorator to see the wrapping happen, then look at the three decorators you will meet in PyTorch code: <code>@property</code> from Lesson 6, <code>@torch.no_grad()</code> which turns off gradient tracking for a whole function, and <code>@dataclass</code> from card 8.`,
eq: String.raw`\[ \texttt{@deco} \ \texttt{def f(): ...} \quad\equiv\quad \texttt{def f(): ...} \ \texttt{f = deco(f)} \]`,
sym: [["decorator", "a function that takes a function and returns a function"], ["wrapper", "the inner function that calls the original and adds something"], ["gradient-free decorator", "<code>@torch.no_grad()</code>: run the decorated function without building a gradient graph"], ["@property", "call a method like an attribute, from Lesson 6"], ["@dataclass", "generate <code>__init__</code> and <code>__repr__</code> for a class, card 8"]],
how: ["timed(f) defines wrapper, which records the time, calls f, prints the elapsed time and returns f's result.", "The @timed line replaces evaluate with that wrapper.", "Calling evaluate(...) now runs the wrapper, which runs the original inside.", "You do not need to write decorators. You need to know that @ above a def changes what the name refers to.", "The professor's evaluation functions use <code>@torch.no_grad()</code> exactly like this: the whole function body runs with gradients off."],
say: String.raw`A decorator wraps a function in another function, and the at sign above a def is shorthand for reassigning the name to the wrapped version.`,
num: String.raw`One <code>@torch.no_grad()</code> above an evaluation function replaces a <code>with torch.no_grad():</code> block inside it. Both <b>cut memory use</b> during evaluation by not storing the graph.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["import time", "def timed(f):", "    def wrapper(*args):", "        t0 = time.perf_counter()", "        result = f(*args)", "        print(f\"{f.__name__} took {time.perf_counter() - t0:.3f} s\")", "        return result", "    return wrapper", "", "@timed", "def evaluate(n):", "    return sum(i * i for i in range(n))", "", "print(evaluate(1000))"],
    steps: [
      { ln: 7, vars: [["timed", "T"]], objs: [["T", "function", "timed(f)"]], out: [] },
      { ln: 11, vars: [["timed", "T"], ["evaluate", "E"]], objs: [["T", "function", "timed(f)"], ["E", "function", "the original evaluate(n)"]], out: [], note: "the def ran and bound evaluate to the plain function" },
      { ln: 9, vars: [["timed", "T"], ["evaluate", "W"]], objs: [["T", "function", "timed(f)"], ["W", "function", "wrapper, holding the original inside as f"]], out: [], note: "@timed ran timed(evaluate) and rebound the name to the wrapper. The original lives on only inside it." },
      { ln: 4, vars: [["timed", "T"], ["evaluate", "W"], ["result (local)", "r"]], objs: [["T", "function", "timed(f)"], ["W", "function", "wrapper"], ["r", "int", "332833500"]], out: [], note: "evaluate(1000) called the wrapper, which called the original and got its result" },
      { ln: 13, vars: [["timed", "T"], ["evaluate", "W"]], objs: [["T", "function", "timed(f)"], ["W", "function", "wrapper"]], out: ["evaluate took 0.000 s", "332833500"], note: "the wrapper printed the time and returned the original's result" }
    ]
  });
}},

{s: "6. with", t: "Context managers: with sets up and cleans up",
intu: String.raw`<code>with X as name:</code> runs setup before the block and cleanup after it, even if the block raises. <code>with open(path) as f</code> closes the file no matter what. <code>with torch.no_grad():</code> turns gradient tracking off for the block and back on after. Step through the file case and watch the file object open and close. This is why evaluation code in the course sits inside a with block: the setting is guaranteed to be restored.`,
eq: String.raw`\[ \texttt{with cm as x:} \ \text{block} \quad\equiv\quad \texttt{x = cm.\_\_enter\_\_()}; \ \text{block}; \ \texttt{cm.\_\_exit\_\_()} \text{ always} \]`,
sym: [["context manager", "an object with enter and exit methods"], ["with open(p) as f", "open, use, and always close the file"], ["gradients off", "<code>with torch.no_grad()</code>: gradients off inside, restored after"], ["random state", "<code>with torch.random.fork_rng()</code>: random state restored after the block, used in HW8"], ["even on error", "the exit runs when the block raises, then the error continues"]],
how: ["Entering the block calls the manager's enter method and binds its result to the name after as.", "The block runs.", "Leaving the block, normally or by an error, calls the exit method: close the file, restore the setting.", "Without with, an error between open and close leaves the file open or the setting changed.", "Nesting: <code>with a, b:</code> enters both, exits in reverse order."],
say: String.raw`A with block runs setup on entry and guaranteed cleanup on exit, which is why files are opened with it and gradient tracking is turned off with it.`,
num: String.raw`After the block, <code>f.closed</code> is <b>True</b> and <code>torch.is_grad_enabled()</code> is <b>True</b> again, in both the normal and the error case.`,
r(fig, ctl) {
  let err = false;
  const build = () => ({
    code: ["with open(\"notes/log.txt\") as f:", "    text = f.read()", err ? "    value = int(text)      # raises ValueError" : "    value = len(text)", "print(f.closed)", err ? "# the ValueError continues after the file closed" : "print(value)"],
    steps: [
      { ln: 0, vars: [["f", "F"]], objs: [["F", "file", "log.txt, open"]], out: [], note: "entry: open() returned a file object, bound to f" },
      { ln: 1, vars: [["f", "F"], ["text", "t"]], objs: [["F", "file", "log.txt, open"], ["t", "str", "'val MAE 1.80'"]], out: [] },
      err ? { ln: 2, vars: [["f", "F"], ["text", "t"]], objs: [["F", "file", "log.txt, CLOSED"], ["t", "str", "'val MAE 1.80'"]], out: ["ValueError: invalid literal for int() with base 10: 'val MAE 1.80'"], note: "the block raised. The exit method still ran and closed the file before the error continued upward." } : { ln: 2, vars: [["f", "F"], ["text", "t"], ["value", "v"]], objs: [["F", "file", "log.txt, open"], ["t", "str", "'val MAE 1.80'"], ["v", "int", "12"]], out: [] },
      err ? { ln: 2, vars: [["f", "F"], ["text", "t"]], objs: [["F", "file", "log.txt, CLOSED"], ["t", "str", "'val MAE 1.80'"]], out: ["ValueError: invalid literal for int() with base 10: 'val MAE 1.80'"], note: "the program stops here unless something catches the error. The file is not left open." } : { ln: 3, vars: [["f", "F"], ["text", "t"], ["value", "v"]], objs: [["F", "file", "log.txt, CLOSED"], ["t", "str", "'val MAE 1.80'"], ["v", "int", "12"]], out: ["True"], note: "leaving the block closed the file. f still exists but is closed." },
      err ? { ln: 2, vars: [["f", "F"], ["text", "t"]], objs: [["F", "file", "log.txt, CLOSED"], ["t", "str", "'val MAE 1.80'"]], out: ["ValueError: invalid literal for int() with base 10: 'val MAE 1.80'"] } : { ln: 4, vars: [["f", "F"], ["text", "t"], ["value", "v"]], objs: [["F", "file", "log.txt, CLOSED"], ["t", "str", "'val MAE 1.80'"], ["v", "int", "12"]], out: ["True", "12"] }
    ]
  });
  const render = () => { ctl.innerHTML = btns([["0", "normal exit"], ["1", "an error inside the block"]], "e"); pick(ctl, "e", err ? 1 : 0); ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { err = b.dataset.e === "1"; render(); }); ML.memory(fig, ctl, build()); ctl.insertAdjacentHTML("beforeend", ML.code(["model.eval()", "with torch.no_grad():", "    predictions = model(x_val)   # no graph is built", "# gradient tracking is back on here"], 1) + `<p class="note">The same mechanism in PyTorch: the exit method restores gradient tracking, whatever happened inside.</p>`); };
  render();
}},

{s: "7. Type hints", t: "Type hints: the contract written in the signature",
intu: String.raw`A type hint says what kind of value a parameter and the return are expected to be. Python does not enforce it, but readers and tools do, and the agent writes them on every function because CLAUDE.md asks for it. Click a signature from the course's code and read it in words. Once you can read <code>def fit(model: nn.Module, loader: DataLoader, epochs: int = 10) -> dict[str, list[float]]</code>, you can read the contract of any function without opening its body.`,
eq: String.raw`\[ \texttt{def f(x: int, name: str = "a")} \to \texttt{float} \qquad \text{int in, str in with a default, float out} \]`,
sym: [["x: int", "x is expected to be an int"], ["-> float", "the function returns a float"], ["list[float]", "a list whose items are floats"], ["dict[str, float]", "keys are strings, values floats"], ["tuple[int, int]", "a pair of ints, such as a shape"], ["float | None", "a float, or None when absent"], ["Optional, Callable", "older spellings: Optional[float] is float | None, Callable is any function"]],
how: ["Read parameters left to right: name, colon, type, optional default.", "Read the arrow: what comes back.", "Brackets give the contents of a container.", "A vertical bar means either type. None is common for \"not set yet\", as in the scaler's mean.", "Hints are documentation first. A wrong hint is a bug in the documentation, and tools like mypy can catch the mismatch."],
say: String.raw`A type hint states the expected type of each parameter and of the return value, so a signature alone tells you the function's contract.`,
num: String.raw`The HW9 signature <code>evaluate(model, loader, criterion) -> tuple[float, Tensor, Tensor]</code> promises <b>three things back</b>: a loss and two tensors. That is why its callers write <code>loss, logits, targets = evaluate(...)</code>.`,
r(fig, ctl) {
  const S = [["def mae(y_true: list[float], y_pred: list[float]) -> float:", "takes two lists of floats, returns one float"], ["def split_ids(ids: list[str], n_train: int, seed: int = 42) -> tuple[set[str], set[str]]:", "takes a list of strings and an int, optional int seed, returns a pair of string sets"], ["def fit(model: nn.Module, loader: DataLoader, epochs: int = 10) -> dict[str, list[float]]:", "takes a model, a loader and an optional epoch count, returns a dictionary from names to lists of floats, the history"], ["def evaluate(model: nn.Module, loader: DataLoader, criterion) -> tuple[float, Tensor, Tensor]:", "returns three values: a loss and two tensors. criterion has no hint, which is allowed but less clear."], ["def load(path: str | Path, sep: str = \",\") -> pd.DataFrame:", "path may be a string or a Path object, returns a pandas table"], ["def best(runs: list[dict]) -> dict | None:", "returns a run dictionary, or None if the list was empty"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${S.map((x, i) => `<button data-k="${i}">${i + 1}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const sig = S[k][0];
    const parts = sig.replace("def ", "").replace(/:$/, "").split(" -> ");
    const nameArgs = parts[0], ret = parts[1];
    const fname = nameArgs.slice(0, nameArgs.indexOf("("));
    const args = nameArgs.slice(nameArgs.indexOf("(") + 1, -1).split(/, (?![^\[]*\])/);
    let s = tx(340, 22, fname + "(...)", "middle", "th");
    args.forEach((a, i) => { const [n, rest] = a.split(/: (.+)/); const [t, d] = (rest || "no hint").split(" = "); const y = 40 + i * 46; s += ML.box(40, y, 180, 36, "c-gray", [n.trim()], false) + arrow(224, y + 18, 258, y + 18, C.blue, 1.5) + ML.box(262, y, 240, 36, "c-blue", [t.trim()], false) + (d ? ML.box(512, y, 130, 36, "c-amber", ["default " + d], false) : ""); });
    const y = 40 + args.length * 46;
    s += ML.box(40, y, 180, 36, "c-gray", ["returns"], false) + arrow(224, y + 18, 258, y + 18, C.teal, 1.5) + ML.box(262, y, 380, 36, "c-teal", [ret], false);
    fig.innerHTML = svg(y + 48, s) + ML.code([sig, "    ..."], 0) + `<p class="note"><b>In words:</b> ${S[k][1]}.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "8. dataclass", t: "dataclasses: a config object in four lines",
intu: String.raw`A dataclass is a class whose <code>__init__</code>, <code>__repr__</code> and equality are generated from the field list. It is the standard way to hold a configuration: named fields with types and defaults, no boilerplate. Step through creating one and compare it with the hand-written class it replaces. Your project's config will be one of these, and <code>asdict(cfg)</code> turns it into a dictionary to save next to the results.`,
eq: String.raw`\[ \texttt{@dataclass class Config: hidden: int = 64} \;\Rightarrow\; \texttt{Config(hidden=128)} \text{ with init, repr, eq generated} \]`,
sym: [["@dataclass", "the decorator that generates the methods"], ["field: type = default", "one line per field"], ["frozen=True", "makes instances immutable, good for a config"], ["asdict(cfg)", "the fields as a dictionary"], ["replace(cfg, lr=0.1)", "a copy with one field changed"]],
how: ["List the fields with types and defaults in the class body. Order matters: fields without defaults come first.", "The decorator writes <code>__init__</code> taking those fields, <code>__repr__</code> printing them, and <code>__eq__</code> comparing them.", "Create with keywords. Unknown fields raise TypeError, which catches typos in a config.", "frozen=True prevents accidental edits after creation.", "Save asdict(cfg) with every run so a result can always be traced to its settings."],
say: String.raw`A dataclass generates the initializer, representation and equality from a list of typed fields, which makes it the natural shape for a configuration.`,
num: String.raw`The hand-written version of a 4-field config is <b>about 12 lines</b>. The dataclass is <b>6</b>, and it also gets a readable repr and equality for free.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["from dataclasses import dataclass, asdict", "", "@dataclass(frozen=True)", "class Config:", "    hidden: int = 64", "    lr: float = 0.001", "    epochs: int = 10", "    data: str = \"data/processed/fruit.csv\"", "", "cfg = Config(hidden=128, lr=0.01)", "print(cfg)", "print(asdict(cfg)[\"epochs\"])", "cfg.lr = 0.1"],
    steps: [
      { ln: 7, vars: [["Config", "K"]], objs: [["K", "class", "Config with generated __init__, __repr__, __eq__"]], out: [], note: "the decorator read the four fields and generated the methods" },
      { ln: 9, vars: [["Config", "K"], ["cfg", "c"]], objs: [["K", "class", "Config"], ["c", "Config instance", "hidden=128, lr=0.01, epochs=10, data='data/processed/fruit.csv'"]], out: [], note: "two fields given, two defaults filled in" },
      { ln: 10, vars: [["Config", "K"], ["cfg", "c"]], objs: [["K", "class", "Config"], ["c", "Config instance", "hidden=128, lr=0.01, epochs=10, data=..."]], out: ["Config(hidden=128, lr=0.01, epochs=10, data='data/processed/fruit.csv')"], note: "the generated repr prints every field, which a hand-written class would not" },
      { ln: 11, vars: [["Config", "K"], ["cfg", "c"]], objs: [["K", "class", "Config"], ["c", "Config instance", "hidden=128, lr=0.01, epochs=10, data=..."]], out: ["Config(hidden=128, lr=0.01, epochs=10, data='data/processed/fruit.csv')", "10"] },
      { ln: 12, vars: [["Config", "K"], ["cfg", "c"]], objs: [["K", "class", "Config"], ["c", "Config instance", "unchanged"]], out: ["Config(hidden=128, lr=0.01, epochs=10, data='data/processed/fruit.csv')", "10", "FrozenInstanceError: cannot assign to field 'lr'"], note: "frozen: the config cannot be edited after creation. Use replace(cfg, lr=0.1) for a changed copy." }
    ]
  });
}},

{s: "9. Read a real loop", t: "Read a real training loop with all of it in one place",
intu: String.raw`Here is an evaluation function and a training loop in the professor's style, with every idiom from this lesson. Click an idiom and the lines that use it light up with a plain-language reading. Nothing in this code is new now. That is the test of the lesson: a loop that looked dense in Lesson 3 reads line by line.`,
eq: String.raw`\[ \text{decorator} + \text{type hints} + \text{enumerate} + \text{unpacking} + \text{with} + \text{generator} + \text{key} \]`,
sym: [["gradient-free decorator", "<code>@torch.no_grad()</code>: evaluate never builds a gradient graph"], ["-> tuple[float, float]", "returns a loss and an accuracy"], ["for step, (x, y) in enumerate(loader)", "step counter plus an unpacked batch"], ["sum(... for ...)", "a generator counting parameters"], ["min(history, key=...)", "the best epoch by validation loss"]],
how: ["Read the signature first: types in, types out.", "Read the decorator or the with block: what setting applies to the body.", "Read the loop header: what is unpacked on every pass.", "Read the accumulators and what is returned.", "Read the selection line: which key decides the best."],
say: String.raw`I can read a training loop idiom by idiom: the decorator sets the mode, the hints give the contract, enumerate and unpacking drive the loop, and a key picks the best epoch.`,
num: String.raw`<b>7 idioms</b> in 20 lines. Each one you can now name.`,
r(fig, ctl) {
  const code = ["@torch.no_grad()", "def evaluate(model: nn.Module, loader: DataLoader) -> tuple[float, float]:", "    model.eval()", "    total, correct, n = 0.0, 0, 0", "    for x, y in loader:", "        logits = model(x)", "        total += F.cross_entropy(logits, y, reduction=\"sum\").item()", "        correct += (logits.argmax(1) == y).sum().item()", "        n += len(y)", "    return total / n, correct / n", "", "def fit(model: nn.Module, train_loader, val_loader, epochs: int = 10) -> list[dict]:", "    n_params = sum(p.numel() for p in model.parameters())", "    print(f\"training {n_params} parameters\")", "    history = []", "    for epoch in range(1, epochs + 1):", "        model.train()", "        for step, (x, y) in enumerate(train_loader):", "            loss = train_step(model, x, y)", "        val_loss, val_acc = evaluate(model, val_loader)", "        history.append({\"epoch\": epoch, \"val_loss\": val_loss, \"val_acc\": val_acc})", "    best = min(history, key=lambda h: h[\"val_loss\"])", "    return history"];
  const I = [["decorator", [0], "the whole function runs with gradient tracking off"], ["type hints", [1, 11], "evaluate returns a pair of floats, fit returns a list of dictionaries"], ["unpacking", [4, 19], "each batch is a (features, targets) pair, and evaluate's pair is unpacked into two names"], ["enumerate", [17], "step is the batch number, the pair is unpacked inside the parentheses"], ["generator", [12], "numel of every parameter, summed as they are produced, no list"], ["key", [21], "the dictionary with the smallest val_loss is the best epoch"], ["multiple assignment", [3], "three accumulators set in one line"]];
  let k = 0;
  ctl.innerHTML = btns(I.map((x, i) => [i, x[0]]), "k");
  const u = () => {
    pick(ctl, "k", k);
    const body = code.map((l, i) => `<span style="display:block;${I[k][1].includes(i) ? "background:var(--accent-bg);box-shadow:inset 3px 0 var(--accent);" : "opacity:.55;"}padding-left:6px">${ML.hl(l) || " "}</span>`).join("");
    fig.innerHTML = `<pre class="codebox" style="padding-left:6px;font-size:12px"><code>${body}</code></pre><p class="note"><b>${I[k][0]}:</b> ${I[k][2]}.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "10. With the agent", t: "Do it with the agent: a config and a batch generator",
intu: String.raw`Two pieces your project needs anyway: a frozen dataclass config that saves itself as JSON, and a batch generator with enumerate over it. The checks ask you to read the idioms, not just run them.`,
eq: String.raw`\[ \texttt{Config} \text{ (dataclass)} + \texttt{batches()} \text{ (generator)} + \texttt{enumerate} \to \text{a readable run script} \]`,
sym: [["Config", "frozen dataclass with typed fields and defaults, saved with asdict"], ["batches", "a generator yielding slices of a list"], ["run.py", "uses both under the main guard"]],
how: ["Paste the command.", "Read the dataclass: are the fields typed, with defaults, and is it frozen?", "Read batches: find the yield. Confirm no list of all batches is built.", "Read the loop: enumerate with start=1 and unpacking of the batch.", "Run it and compare the printed lines with what you predicted."],
say: String.raw`A config is a frozen dataclass saved as JSON beside the results, and batches come from a generator consumed with enumerate.`,
num: String.raw`With 10 items and a batch size of 4 the generator yields <b>3 batches</b>, the last of size 2, and the JSON file has <b>4 keys</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/config.py with a frozen dataclass Config holding hidden: int = 64, lr: float = 0.001, epochs: int = 10, batch_size: int = 4, and a method save(self, path: str) -> None that writes asdict(self) as JSON. Create src/batching.py with a generator batches(items: list, size: int) that yields consecutive slices of the list, raising ValueError if size is not positive. Create src/run.py that, under the main guard, builds Config(batch_size=4), saves it to results/config.json, then loops for i, batch in enumerate(batches(list(range(10)), cfg.batch_size), start=1) and prints f\"batch {i}: {batch}\". Type hints and docstrings everywhere. Run python src/run.py and paste the output and the contents of results/config.json.",
    actions: ["$ python src/run.py", "batch 1: [0, 1, 2, 3]", "batch 2: [4, 5, 6, 7]", "batch 3: [8, 9]", "$ cat results/config.json", "{\"hidden\": 64, \"lr\": 0.001, \"epochs\": 10, \"batch_size\": 4}"],
    checks: ["Config is decorated with @dataclass(frozen=True) and every field has a type and a default", "batches contains yield and builds no list of batches", "the loop uses enumerate with start=1 and unpacks i and batch", "the last printed batch has 2 items, not an error", "cfg.lr = 0.1 after creation raises FrozenInstanceError"]
  });
}},

{s: "11. Test", t: "Test: Pythonic tools",
intu: String.raw`Twelve questions on the idioms. Several ask what a line of real training code means.`,
eq: String.raw`\[ \text{idiom} \to \text{plain reading} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Translate each idiom into the loop or statement it replaces.", "For decorators and with, ask what happens before and after."],
say: String.raw`I can read enumerate, zip, unpacking, generators, keys, decorators, with blocks, type hints and dataclasses as plain language.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: "for i, v in enumerate([\"a\", \"b\"], start=1):\n    print(i, v)", o: ["0 a then 1 b", "1 a then 2 b", "a 1 then b 2", "Error"], a: 1, why: "enumerate yields (index, item) pairs, and start=1 begins the index at 1." },
    { q: "<code>list(zip([1, 2, 3], [\"x\", \"y\"]))</code> gives:", o: ["[(1, 'x'), (2, 'y'), (3, None)]", "[(1, 'x'), (2, 'y')]", "ValueError", "[1, 'x', 2, 'y']"], a: 1, why: "zip stops at the shortest input. strict=True would raise instead." },
    { q: "In <code>for step, (x, y) in enumerate(loader):</code>, what is (x, y)?", o: ["Two separate loader items", "One loader item, a pair, unpacked into x and y", "The step and the item", "A list"], a: 1, why: "Each loader item is a (features, targets) pair. The inner parentheses unpack it." },
    { q: "After <code>first, *rest = [1, 2, 3, 4]</code>, rest is:", o: ["[2, 3, 4]", "(2, 3, 4)", "4", "[1]"], a: 0, why: "A starred name collects the remaining items into a list." },
    { q: "What does <code>Model(**cfg)</code> do when cfg is <code>{\"hidden\": 64, \"lr\": 0.01}</code>?", o: ["Passes the dictionary as one argument", "Calls Model(hidden=64, lr=0.01)", "Calls Model(64, 0.01) positionally", "Error"], a: 1, why: "Two stars spread a dictionary into keyword arguments." },
    { q: "A function contains yield. Calling it:", o: ["Runs it to the end", "Returns a generator and runs nothing yet", "Returns a list", "Raises"], a: 1, why: "Nothing runs until the generator is asked for its first item." },
    { q: "<code>sum(p.numel() for p in model.parameters())</code> is:", o: ["A list comprehension summed", "A generator expression summed, no list built", "A syntax error", "A dictionary"], a: 1, why: "Round brackets make a generator. sum consumes it one value at a time." },
    { q: "<code>min(runs, key=lambda r: r[\"val\"])</code> returns:", o: ["The smallest val value", "The run dictionary whose val is smallest", "A sorted list", "The index of the best run"], a: 1, why: "min returns the item, and key says what to compare." },
    { q: "<code>@timed</code> above <code>def f(): ...</code> is equivalent to:", o: ["timed() runs before f every time", "def f(): ... then f = timed(f)", "f = timed", "Nothing, it is a comment"], a: 1, why: "The decorator syntax reassigns the name to whatever the decorator returns." },
    { q: "Inside <code>with open(p) as f:</code> an error is raised. What happens to the file?", o: ["It stays open", "It is closed by the exit method, then the error continues", "It is deleted", "The error is swallowed"], a: 1, why: "The with statement guarantees cleanup on exit, including an exit by error." },
    { q: "What does <code>-> tuple[float, Tensor, Tensor]</code> on a function tell you?", o: ["It takes three arguments", "It returns three values: a float and two tensors", "It returns a list", "Nothing, hints are ignored"], a: 1, why: "The arrow gives the return type. Callers unpack it into three names." },
    { q: "A <code>@dataclass(frozen=True)</code> instance cfg. <code>cfg.lr = 0.1</code>:", o: ["Changes lr", "Raises FrozenInstanceError", "Creates a copy", "Is ignored"], a: 1, why: "frozen makes the instance immutable. Use replace(cfg, lr=0.1) for a changed copy." }
  ], "Lesson 7 test");
}}
],
summary: String.raw`enumerate pairs items with their index and zip pairs corresponding items, and the training loop header uses both with unpacking of each (features, targets) batch. Unpacking splits a sequence into names, a star collects the rest, and in a call a star spreads a sequence and two stars spread a dictionary. A generator yields one value at a time and holds no list, which is how batches are served and parameters counted. sorted, min and max take a key, often a lambda, to decide what to compare. A decorator wraps a function, and the at sign is shorthand for reassigning the name. A with block guarantees cleanup, which is why files and gradient tracking use it. Type hints state the contract in the signature, and a frozen dataclass is the shape of a configuration.`,
sheet: [
[String.raw`\[ \texttt{for i, (x, y) in enumerate(loader)} \]`, "Index plus unpacked pair"],
[String.raw`\[ \texttt{a, *rest = xs}, \quad \texttt{f(*args, **kwargs)} \]`, "Unpacking and spreading"],
[String.raw`\[ \texttt{yield} \to \text{one value, then pause}, \quad \texttt{sum(g(x) for x in xs)} \]`, "Generators"],
[String.raw`\[ \texttt{sorted(xs, key=lambda r: r[k])}, \quad \texttt{min(xs, key=f)} \]`, "Keys"],
[String.raw`\[ \texttt{@deco def f} \equiv \texttt{f = deco(f)}, \quad \texttt{with cm as x:} \]`, "Decorators and context managers"],
[String.raw`\[ \texttt{def f(x: int)} \to \texttt{float}, \quad \texttt{@dataclass(frozen=True)} \]`, "Hints and dataclasses"]],
sources: ["AME 5970 HW4, HW6, HW8, HW9 and HW10 notebooks: enumerate over loaders, zip over parameters, generator expressions for parameter counts, torch.no_grad as decorator and context manager, type hints on every function", "The Python Tutorial, sections 4.9 (lambda), 5.1.3 (comprehensions), 8.7 (with), 9.9 (generators)", "Python documentation: dataclasses, typing, contextlib", "Ramalho, Fluent Python, 2nd ed., chapters 7 (functions as objects), 9 (decorators), 17 (iterators and generators)", "PyTorch documentation: torch.no_grad"]
});
})();
