(function () {
/* ML shelf, Part 2, Lesson 2: Values, types and names. Code cards run line by line with ML.memory (ml-common.js). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Foundations", num: "Lesson 2",
id: "ml-py-l2", title: "Values, types and names", short: "2. Values, types and names",
big: String.raw`A Python program is a list of lines that run from top to bottom. Each line makes values, and each value has a type: an integer, a decimal number, a piece of text, true or false, or nothing. A name is a label you stick on a value so you can use it later. That is the whole mental model, and every card here runs a few lines and shows the memory as it changes: names on the left, the objects they point to on the right, and the output underneath. By the end you can predict what a short program prints before it runs, which is the one skill that makes reading the agent's code possible.`,
bridge: String.raw`You do not need to write Python fluently for this course. You need to read it accurately. These cards teach reading by running: predict the output, step the program, compare.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Top to bottom", t: "A program runs one line at a time",
intu: String.raw`Step through the program. Each step shows the memory after one line has run: the names that exist, the objects they point to, and what has been printed so far. Nothing exists before its line runs, which is why using a name too early is an error. The arrow from a name to an object is the assignment. Notice that <code>print</code> shows a value but changes nothing in memory.`,
eq: String.raw`\[ \texttt{name = expression} \]\[ \text{evaluate the right side, then point the name at the result} \]`,
sym: [["line", "one instruction. Python runs it fully before moving to the next."], ["name", "a label, such as <code>n</code> or <code>total</code>, that points at one object"], ["object", "a value stored in memory with a type"], ["print(...)", "writes a value to the output. It does not store anything."]],
how: ["Python reads line 1, evaluates everything on the right of <code>=</code>, and makes the name on the left point to the result.", "Line 2 does the same with a new name.", "Line 3 evaluates <code>n * per</code> using the two objects, makes a new object 60, and points <code>total</code> at it.", "Line 4 prints. The memory is unchanged.", "Using a name before its line, for example <code>print(total)</code> on line 1, raises <code>NameError</code>."],
say: String.raw`Assignment evaluates the right side first, then binds the name on the left to the resulting object, and lines run strictly in order.`,
num: String.raw`Three names, three objects, one printed line. The program has <b>4 lines</b> and the memory changes <b>3 times</b>.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["n = 12", "per = 5", "total = n * per", "print(total)"],
    steps: [
      { ln: -1, vars: [], objs: [], out: [], note: "Before the first line runs, the memory is empty." },
      { ln: 0, vars: [["n", "a"]], objs: [["a", "int", "12"]], out: [] },
      { ln: 1, vars: [["n", "a"], ["per", "b"]], objs: [["a", "int", "12"], ["b", "int", "5"]], out: [] },
      { ln: 2, vars: [["n", "a"], ["per", "b"], ["total", "c"]], objs: [["a", "int", "12"], ["b", "int", "5"], ["c", "int", "60"]], out: [], note: "n * per is computed from the objects, and a new object 60 is created." },
      { ln: 3, vars: [["n", "a"], ["per", "b"], ["total", "c"]], objs: [["a", "int", "12"], ["b", "int", "5"], ["c", "int", "60"]], out: ["60"], note: "print writes to the output and leaves memory as it was." }
    ]
  });
}},

{s: "2. Numbers", t: "int, float, and the order of operations",
intu: String.raw`Python has two everyday number types. <code>int</code> is a whole number of any size. <code>float</code> is a decimal with about 16 significant digits, stored in binary, which is why <code>0.1 + 0.2</code> is not exactly <code>0.3</code>. Division with <code>/</code> always gives a float. Integer division <code>//</code> and remainder <code>%</code> stay whole. Operators run in a fixed order: power first, then multiply and divide, then add and subtract, left to right within a level. Try an expression and watch the evaluation.`,
eq: String.raw`\[ \texttt{**} \;\succ\; \texttt{*}\ \texttt{/}\ \texttt{//}\ \texttt{\%} \;\succ\; \texttt{+}\ \texttt{-} \qquad \texttt{7 / 2 = 3.5}, \quad \texttt{7 // 2 = 3}, \quad \texttt{7 \% 2 = 1} \]`,
sym: [["int", "whole number, exact, any size: <code>12</code>, <code>-3</code>, <code>10**30</code>"], ["float", "decimal, approximate, written with a point or <code>e</code>: <code>2.5</code>, <code>1e-3</code>"], ["/", "true division, always a float"], ["//", "floor division, rounds toward minus infinity"], ["%", "remainder after floor division"], ["**", "power, evaluated before everything else"]],
how: ["Find the highest level operator first: <code>**</code>.", "Then <code>*</code>, <code>/</code>, <code>//</code>, <code>%</code> from left to right.", "Then <code>+</code> and <code>-</code> from left to right.", "Parentheses override the order. Use them whenever a reader might hesitate.", "If any operand is a float, the result is a float. <code>/</code> gives a float even for <code>6 / 3</code>."],
say: String.raw`Integers are exact and floats are approximate, true division always returns a float, and power binds tighter than multiplication, which binds tighter than addition.`,
num: String.raw`<code>0.1 + 0.2</code> prints <b>0.30000000000000004</b>. Compare floats with a tolerance, <code>abs(a - b) < 1e-9</code>, never with <code>==</code>.`,
note: String.raw`HW1 of the course asks for exactly this: a stress formula with <code>**</code> and parentheses, and a precedence expression. The same rules decide what a PyTorch expression computes.`,
r(fig, ctl) {
  const EX = [["10 + 20 * 3 - 40 / 2", [["20 * 3", "60"], ["40 / 2", "20.0"], ["10 + 60", "70"], ["70 - 20.0", "50.0"]]], ["2 ** 3 * 4", [["2 ** 3", "8"], ["8 * 4", "32"]]], ["(10 + 20) * 3", [["10 + 20", "30"], ["30 * 3", "90"]]], ["7 // 2 + 7 % 2", [["7 // 2", "3"], ["7 % 2", "1"], ["3 + 1", "4"]]], ["3.14 * (5 / 2) ** 2", [["5 / 2", "2.5"], ["2.5 ** 2", "6.25"], ["3.14 * 6.25", "19.625"]]]];
  let e = 0, k = 0;
  ctl.innerHTML = `<div class="row">${EX.map((x, i) => `<button data-e="${i}"><code>${x[0]}</code></button>`).join("")}</div><div id="stp"></div>`;
  const u = () => {
    pick(ctl, "e", e);
    const [expr, st] = EX[e];
    let s = tx(340, 28, expr, "middle", "th");
    st.forEach((p, i) => {
      const y = 62 + i * 40, on = i < k;
      s += `<rect x="150" y="${y - 20}" width="380" height="30" rx="6" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(165, y, `${i + 1}. ${p[0]}`, null, "t") + (on ? tx(515, y, "= " + p[1], "end", "th") : "");
    });
    s += tx(340, 62 + st.length * 40 + 2, k >= st.length ? "result: " + st[st.length - 1][1] + "  (" + (st[st.length - 1][1].includes(".") ? "float" : "int") + ")" : "press Next step", "middle", "th");
    fig.innerHTML = svg(80 + st.length * 40, s);
  };
  const stp = () => { $("stp").innerHTML = ""; k = 0; ML.stepper($("stp"), EX[e][1].length + 1, j => { k = j; u(); }, EX[e][1].map((p, i) => "evaluate " + p[0]).concat(["done"])); };
  ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { e = +b.dataset.e; stp(); });
  stp();
}},

{s: "3. Names", t: "Names point to objects, and can be re-pointed",
intu: String.raw`A name is not a box that holds a value. It is an arrow to an object. When you assign again, the arrow moves to a new object and the old one is left alone. Step through: <code>b = a</code> makes two names point at the same object, and then <code>a = a + 1</code> moves only <code>a</code>. <code>b</code> still points at 10. This is the single most common confusion in reading code, and it matters even more for lists and tensors later.`,
eq: String.raw`\[ \texttt{b = a} \;\Rightarrow\; \text{b points where a points} \]\[ \texttt{a = a + 1} \;\Rightarrow\; \text{a points at a new object, b unchanged} \]`,
sym: [["binding", "the arrow from a name to an object, made by <code>=</code>"], ["rebinding", "assigning the same name again: the arrow moves"], ["a += 1", "for numbers, the same as <code>a = a + 1</code>: a new object"], ["type(a)", "returns the type of the object a currently points to"]],
how: ["Line 1 binds <code>a</code> to the int 10.", "Line 2 evaluates <code>a</code>, which is the object 10, and binds <code>b</code> to that same object. No copy is made.", "Line 3 evaluates <code>a + 1</code>, creating a new int 11, and rebinds <code>a</code> to it.", "<code>b</code> was never touched, so it still prints 10.", "A name can be rebound to a different type. <code>a = \"ten\"</code> would be allowed, and usually a bad idea."],
say: String.raw`Assignment binds a name to an object without copying it, and reassigning a name moves that one arrow while every other name keeps pointing where it was.`,
num: String.raw`After the program, there are <b>2 names and 2 objects</b> in use: <code>a</code> at 11, <code>b</code> at 10.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["a = 10", "b = a", "a = a + 1", "print(a, b)", "print(type(a))"],
    steps: [
      { ln: 0, vars: [["a", "x"]], objs: [["x", "int", "10"]], out: [] },
      { ln: 1, vars: [["a", "x"], ["b", "x"]], objs: [["x", "int", "10"]], out: [], note: "Both names point at the same object. Nothing was copied." },
      { ln: 2, vars: [["a", "y"], ["b", "x"]], objs: [["x", "int", "10"], ["y", "int", "11"]], out: [], note: "a + 1 creates a new object. Only a moves." },
      { ln: 3, vars: [["a", "y"], ["b", "x"]], objs: [["x", "int", "10"], ["y", "int", "11"]], out: ["11 10"] },
      { ln: 4, vars: [["a", "y"], ["b", "x"]], objs: [["x", "int", "10"], ["y", "int", "11"]], out: ["11 10", "<class 'int'>"] }
    ]
  });
}},

{s: "4. Strings", t: "Strings: text you can index, slice and transform",
intu: String.raw`A string is a sequence of characters. Positions count from 0, and negative positions count from the end. A slice <code>s[a:b]</code> takes positions <code>a</code> up to but not including <code>b</code>. Methods like <code>.strip()</code>, <code>.upper()</code> and <code>.split()</code> return new strings, because strings cannot be changed in place. Move the slice handles and watch which characters come out.`,
eq: String.raw`\[ \texttt{s[i]} \;\text{is position } i, \qquad \texttt{s[a:b]} \;\text{has } b - a \text{ characters}, \qquad \texttt{s[-1]} \;\text{is the last} \]`,
sym: [["s[0]", "first character"], ["s[-1]", "last character"], ["s[a:b]", "from a up to b, b excluded"], ["s[:3], s[3:]", "first three, and everything from position 3"], [".strip()", "remove spaces at both ends"], [".upper(), .lower()", "change case"], [".split(sep)", "cut at every separator, for example <code>s.split(\"_\")</code>, giving a list of pieces"], ["len(s)", "number of characters"]],
how: ["Count positions from 0. The last valid index is <code>len(s) - 1</code>.", "A slice stop is excluded, so <code>s[0:4]</code> and <code>s[:4]</code> both give 4 characters.", "Negative indices wrap from the end: <code>s[-2:]</code> is the last two.", "Methods never change <code>s</code>. They return a new string you must assign if you want to keep it.", "<code>\"ab\" + \"cd\"</code> joins. <code>\"ab\" * 3</code> repeats. <code>\"24\" * 6</code> repeats text, it does not multiply."],
say: String.raw`Indices start at zero, a slice runs from the start index up to but not including the stop, and string methods return new strings instead of changing the original.`,
num: String.raw`For <code>s = "ti64_sample_07"</code>: <code>len(s)</code> is <b>14</b>, <code>s[-2:]</code> is <b>"07"</b>, <code>s.split("_")[0]</code> is <b>"ti64"</b>.`,
note: String.raw`Sample identifiers in HW1 are cleaned exactly like this: strip, upper, split, then <code>int</code> of the last two characters.`,
r(fig, ctl) {
  const s = "ti64_sample_07";
  ctl.innerHTML = sl("sa", "start a", -14, 14, 1, 5) + sl("sb", "stop b", -14, 14, 1, 11) + `<div id="sr"></div>`;
  const u = () => {
    const a = +$("sa").value, b = +$("sb").value;
    $("sav").textContent = a; $("sbv").textContent = b;
    const A = a < 0 ? a + s.length : a, B = b < 0 ? b + s.length : b;
    const out = s.slice(a, b);
    let g = "";
    for (let i = 0; i < s.length; i++) {
      const x = 40 + i * 42, on = i >= A && i < B;
      g += `<rect x="${x}" y="40" width="38" height="40" rx="5" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(x + 19, 66, s[i] === "_" ? "_" : s[i], "middle", "th") + tx(x + 19, 30, i, "middle") + tx(x + 19, 98, i - s.length, "middle");
    }
    g += tx(20, 30, "index", "end") + tx(20, 98, "neg", "end") + tx(340, 136, `s[${a}:${b}] = "${out}"   (${out.length} characters)`, "middle", "th");
    fig.innerHTML = svg(150, g) + ML.code([`s = "${s}"`, `print(s[${a}:${b}])`, `print(s.strip().upper())`, `print(s.split("_"))`, `print(int(s[-2:]) + 1)`], -1);
    $("sr").innerHTML = ML.term([out, s.toUpperCase(), "['ti64', 'sample', '07']", "8"]);
  };
  $("sa").oninput = u; $("sb").oninput = u; u();
}},

{s: "5. Booleans", t: "True, False, comparisons and truthiness",
intu: String.raw`A comparison such as <code>x > 700</code> produces a <code>bool</code>, either <code>True</code> or <code>False</code>. Comparisons combine with <code>and</code>, <code>or</code> and <code>not</code>. Any value can also be asked for its truth: zero, empty text, empty list and <code>None</code> count as false, everything else as true. That last rule has a trap: <code>bool("False")</code> is <code>True</code>, because the text is not empty. Move the temperature and watch each expression.`,
eq: String.raw`\[ \texttt{700} \le \texttt{t} \le \texttt{750} \;\equiv\; \texttt{(700} \le \texttt{t) and (t} \le \texttt{750)} \qquad \texttt{not (a and b)} \;\equiv\; \texttt{(not a) or (not b)} \]`,
sym: [["==, !=", "equal, not equal (one = assigns, two == compare)"], ["<, <=, >, >=", "ordering comparisons"], ["and", "True only if both sides are True"], ["or", "True if either side is True"], ["not", "flips"], ["falsy values", "<code>0</code>, <code>0.0</code>, <code>\"\"</code>, <code>[]</code>, <code>None</code>, <code>False</code>"]],
how: ["Evaluate each comparison to a bool.", "Apply <code>not</code> first, then <code>and</code>, then <code>or</code>.", "A chained comparison <code>a < b < c</code> means both halves hold.", "<code>and</code> and <code>or</code> stop early: <code>False and f()</code> never calls <code>f</code>.", "To turn text into a real bool, compare it: <code>text.strip().lower() == \"true\"</code>."],
say: String.raw`Comparisons return booleans, and combines them so both must hold, or so either may hold, and every object has a truth value with zero, empty and None being false.`,
num: String.raw`<code>bool("False")</code> is <b>True</b>. <code>bool(0.0)</code> is <b>False</b>. <code>bool([0])</code> is <b>True</b>, because the list has one element.`,
r(fig, ctl) {
  ctl.innerHTML = sl("tt", "temperature t (°C)", 650, 800, 1, 725) + `<div id="tr"></div>`;
  const u = () => {
    const t = +$("tt").value; $("ttv").textContent = t + " °C";
    const E = [["t < 700", t < 700], ["t <= 750", t <= 750], ["700 <= t <= 750", t >= 700 && t <= 750], ["t < 700 or t > 750", t < 700 || t > 750], ["not (t < 700)", !(t < 700)]];
    const A = ML.axes(60, 20, 560, 60, { xmin: 650, xmax: 800, ymin: 0, ymax: 1, nx: 6, ny: 1, fy: () => "", fx: x => Math.round(x), grid: false });
    let s = A.s + `<rect x="${A.X(700)}" y="20" width="${A.X(750) - A.X(700)}" height="60" fill="var(--teal-bg)"/>` + tx((A.X(700) + A.X(750)) / 2, 54, "acceptable", "middle") + `<line x1="${A.X(t)}" y1="12" x2="${A.X(t)}" y2="88" stroke="${C.coral}" stroke-width="2.5"/>` + tx(A.X(t), 106, "t = " + t, "middle", "th");
    E.forEach((e, i) => { const y = 136 + i * 30; s += `<rect x="60" y="${y - 18}" width="300" height="26" rx="5" fill="var(--sunk)"/>` + tx(70, y, e[0], null, "t") + `<rect x="380" y="${y - 18}" width="80" height="26" rx="5" fill="${e[1] ? "var(--teal-bg)" : "var(--coral-bg)"}" stroke="${e[1] ? C.teal : C.coral}"/>` + tx(420, y, String(e[1]), "middle", "th"); });
    fig.innerHTML = svg(290, s);
    $("tr").innerHTML = ML.code(["t = " + t, "ok = 700 <= t <= 750", "print(ok, type(ok))", "print(bool(\"False\"), bool(0), bool(\"\"))"], -1) + ML.term([`${t >= 700 && t <= 750 ? "True" : "False"} <class 'bool'>`, "True False False"]);
  };
  $("tt").oninput = u; u();
}},

{s: "6. Conversion", t: "Converting between types, and what fails",
intu: String.raw`Data from a file arrives as text. <code>"24"</code> looks like a number but is a string, and <code>"24" * 6</code> repeats it. <code>int("24")</code> parses it. Click a conversion to see whether it works, and if not, why. <code>int</code> of a float truncates toward zero. <code>float</code> of text with a point works, <code>int</code> of the same text does not. <code>str</code> of anything works. <code>None</code> is its own type with one value, meaning no value yet.`,
eq: String.raw`\[ \texttt{int("24") = 24}, \quad \texttt{int(3.9) = 3}, \quad \texttt{float("2.5") = 2.5}, \quad \texttt{str(60) = "60"}, \quad \texttt{int("2.5")} \to \texttt{ValueError} \]`,
sym: [["int(x)", "parse text or truncate a float toward zero"], ["float(x)", "parse text or widen an int"], ["str(x)", "the printed form of any object"], ["bool(x)", "truth value, see card 5. Not a parser."], ["None", "the single value of <code>NoneType</code>, meaning nothing here"], ["ValueError", "the error when the text cannot be parsed"], ["TypeError", "the error when the operation does not fit the types, like <code>\"24\" + 6</code>"]],
how: ["Decide the type you need before computing. Text is for identifiers, numbers for arithmetic.", "Convert at the boundary where data enters: right after reading a file.", "Expect <code>ValueError</code> on bad text and handle it, rather than letting one bad row stop a run.", "Never use <code>bool(text)</code> to read a yes or no field. Compare the normalized text instead.", "A name bound to <code>None</code> is a placeholder, not zero. <code>None + 1</code> is a TypeError."],
say: String.raw`Conversion functions parse text or change numeric type, int truncates floats, a failed parse raises ValueError, and mixing a string with a number raises TypeError.`,
num: String.raw`<code>"24" * 6</code> is <b>"242424242424"</b>, a string of 12 characters. <code>int("24") * 6</code> is <b>144</b>.`,
r(fig, ctl) {
  const T = [["int(\"24\")", "24", "int", true], ["\"24\" * 6", "'242424242424'", "str", true, "repeats the text, no multiplication"], ["int(\"24\") * 6", "144", "int", true], ["int(3.9)", "3", "int", true, "truncates toward zero, not rounding"], ["int(-3.9)", "-3", "int", true], ["float(\"2.5\")", "2.5", "float", true], ["int(\"2.5\")", "ValueError: invalid literal for int() with base 10: '2.5'", "", false], ["\"24\" + 6", "TypeError: can only concatenate str (not \"int\") to str", "", false], ["str(60) + \"0\"", "'600'", "str", true, "text joined, not arithmetic"], ["bool(\"False\")", "True", "bool", true, "the text is not empty"], ["round(2.675, 2)", "2.67", "float", true, "binary floats cannot store 2.675 exactly"], ["None + 1", "TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'", "", false]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}"><code>${ML.esc(t[0])}</code></button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const t = T[k];
    let s = ML.box(40, 30, 220, 60, "c-gray", ["expression", t[0]], true) + arrow(270, 60, 330, 60, t[3] ? C.teal : C.coral, 2) + ML.box(340, 30, 300, 60, t[3] ? "c-teal" : "c-coral", [t[3] ? "result, type " + t[2] : "error", t[3] ? t[1] : t[1].split(":")[0]], true);
    if (t[4]) s += tx(340, 118, t[4], "middle", "t");
    fig.innerHTML = svg(130, s) + ML.term([`>>> ${t[0]}`, ...(t[3] ? [t[1]] : ["Traceback (most recent call last):", "  File \"<stdin>\", line 1, in <module>", t[1]])]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  u();
}},

{s: "7. f-strings", t: "Printing numbers the way a reader needs them",
intu: String.raw`An f-string puts values into text. Inside the braces you can add a format: <code>:.2f</code> for two decimals, <code>:,</code> for thousands separators, <code>:>8</code> to right-align in 8 characters, <code>:.3e</code> for scientific notation. Every result you report in this course goes through one of these, so change the format and watch the output. The value is unchanged. Only its printed form changes.`,
eq: String.raw`\[ \texttt{f"\{value:.2f\}"} \;\to\; \text{two decimals}, \qquad \texttt{f"\{value:,.0f\}"} \;\to\; \text{thousands, no decimals} \]`,
sym: [["f\"...\"", "a string with expressions in braces, evaluated when the line runs"], [":.2f", "fixed point with 2 decimals"], [":.3e", "scientific with 3 decimals"], [":,", "thousands separator"], [":>10 and :<10", "right or left align in a field of 10 characters"], [":.1%", "multiply by 100 and add a percent sign"]],
how: ["Write the text, and where a value goes, write the name inside braces.", "After the name, a colon and the format.", "Pick decimals that match what the number means. A validation MAE of 1.8034 °C is reported as 1.80.", "Line up columns in a table with alignment and a fixed width.", "Keep full precision in the data. Formatting is only for display."],
say: String.raw`An f-string evaluates the expressions in its braces and formats each one with the specification after the colon, without changing the stored value.`,
num: String.raw`<code>f"{0.30000000000000004:.2f}"</code> prints <b>0.30</b>. <code>f"{1234567.891:,.1f}"</code> prints <b>1,234,567.9</b>. <code>f"{0.8034:.1%}"</code> prints <b>80.3%</b>.`,
r(fig, ctl) {
  const F = [[".2f", "fixed, 2 decimals"], [".4f", "fixed, 4 decimals"], [".3e", "scientific"], [",.1f", "thousands, 1 decimal"], [".1%", "percent"], [">12.2f", "right-aligned in 12"], ["", "default"]];
  let k = 0;
  ctl.innerHTML = sl("fv", "value", 0, 2000000, 1, 1234.5678) + btns(F.map((f, i) => [i, f[1]]), "f");
  const fmt = (v, f) => {
    if (f === "") return String(v);
    const m = f.match(/^(>?)(\d*)(,?)\.(\d+)([fe%])$/); if (!m) return String(v);
    const d = +m[4]; let s;
    if (m[5] === "e") { s = v.toExponential(d); const [a, b] = s.split("e"); s = a + "e" + (b[0] === "-" ? "-" : "+") + String(Math.abs(+b)).padStart(2, "0"); }
    else if (m[5] === "%") s = (v * 100).toFixed(d) + "%";
    else s = v.toFixed(d);
    if (m[3]) { const [a, b] = s.split("."); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b != null ? "." + b : ""); }
    if (m[2]) s = s.padStart(+m[2], " ");
    return s;
  };
  const u = () => {
    pick(ctl, "f", k);
    const v = +$("fv").value; $("fvv").textContent = v;
    const f = F[k][0], out = fmt(v, f);
    fig.innerHTML = svg(70, ML.box(40, 12, 180, 46, "c-gray", ["value " + v], true) + arrow(228, 35, 300, 35, C.teal, 2) + tx(264, 26, f ? ":" + f : "none", "middle", "th") + ML.box(310, 12, 330, 46, "c-teal", ["printed: " + out.replace(/ /g, "·")], true)) + ML.code(["mae = " + v, `print(f"validation MAE: {mae${f ? ":" + f : ""}} C")`], -1) + ML.term(["validation MAE: " + out + " C"]) + `<p class="note">Dots in the picture stand for padding spaces. The value itself never changes.</p>`;
  };
  $("fv").oninput = u; ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { k = +b.dataset.f; u(); }); u();
}},

{s: "8. With the agent", t: "Do it with the agent: a typed record from raw text",
intu: String.raw`The first useful script for any project reads a raw record and converts every field to the right type. This command asks the agent for exactly that, with the conversion rules from cards 5 and 6 and a check you can read. The point of the exercise is the third view: can you tell from the output that each field has the right type?`,
eq: String.raw`\[ \text{raw text} \to \text{typed record} \to \text{printed types} \]`,
sym: [["raw record", "a dictionary of strings, as a CSV reader would give"], ["typed record", "the same fields as int, float, bool and str"], ["the check", "a line per field showing value and type"]],
how: ["Paste the command. Change the field names to the ones in your own data.", "Read the agent's function. Find where each conversion happens and confirm the bool is parsed by comparison.", "Run it. Every printed type must match the table in the command.", "Try a bad value, like <code>\"abc\"</code> for the count, and confirm you get a clear error instead of a wrong number."],
say: String.raw`Convert each field at the point where data enters, parse booleans by comparing normalized text, and print value and type together so the check is readable.`,
num: String.raw`Four fields, <b>four conversions</b>, one of which, the bool, must not use <code>bool()</code>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "In src/records.py write a function typed_record(raw: dict) -> dict. The input has string values for the keys alloy, temperature_c, passed_check and replicates. Return a dict with alloy as str, temperature_c as float, passed_check as bool, replicates as int. Parse passed_check by stripping and lowercasing the text and comparing with \"true\" and \"false\", and raise ValueError for anything else. Add a docstring and type hints. At the bottom, under if __name__ == \"__main__\", call it on {\"alloy\": \"Ti-6Al-4V\", \"temperature_c\": \"23.5\", \"passed_check\": \"True\", \"replicates\": \"4\"} and print each key, its value and type(value).__name__ on one line. Run it and paste the output.",
    actions: ["$ python src/records.py", "alloy          Ti-6Al-4V   str", "temperature_c  23.5        float", "passed_check   True        bool", "replicates     4           int"],
    code: "def typed_record(raw: dict) -> dict:\n    \"\"\"Convert the string fields of one raw record to typed values.\"\"\"\n    flag = raw[\"passed_check\"].strip().lower()\n    if flag not in (\"true\", \"false\"):\n        raise ValueError(f\"passed_check must be true/false, got {raw['passed_check']!r}\")\n    return {\n        \"alloy\": str(raw[\"alloy\"]),\n        \"temperature_c\": float(raw[\"temperature_c\"]),\n        \"passed_check\": flag == \"true\",\n        \"replicates\": int(raw[\"replicates\"]),\n    }",
    checks: ["the output shows four lines with the types str, float, bool, int", "the bool is produced by a comparison, not by bool(text)", "an unknown flag text raises ValueError with a message naming the bad value", "the function has a docstring and type hints", "replicates \"abc\" raises ValueError rather than returning something"]
  });
}},

{s: "9. Test", t: "Test: values, types and names",
intu: String.raw`Twelve questions. Most show a short program and ask what it prints. Predict before you click, and say why. The review at the end lists what you missed with the answer.`,
eq: String.raw`\[ \text{predict} \to \text{click} \to \text{read the reason} \]`,
sym: [["pass mark", "10 of 12"], ["types", "predict the output, spot the error, name the type"]],
how: ["Run the program in your head line by line, as in card 1.", "Check the type of every value before applying an operator.", "Remember that slices exclude the stop and that strings do not change in place."],
say: String.raw`I can predict what a short program prints by tracking names, objects and types one line at a time.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: "a = 7\nb = a\na = a * 2\nprint(a, b)", o: ["14 14", "14 7", "7 7", "7 14"], a: 1, why: "b was bound to the object 7. Rebinding a to a new object 14 does not move b." },
    { q: "What is the type of <code>7 / 7</code>?", o: ["int", "float", "bool", "str"], a: 1, why: "True division always returns a float, here 1.0." },
    { q: "What does <code>10 + 20 * 3 - 40 / 2</code> evaluate to?", o: ["50.0", "70", "45.0", "50"], a: 0, why: "20 * 3 = 60 and 40 / 2 = 20.0 first, then 10 + 60 - 20.0 = 50.0, a float because of the division." },
    { q: "What does this print?", code: "s = \"ti64_sample_07\"\nprint(s[5:11])", o: ["sample_", "sample", "_sample", "ample_0"], a: 1, why: "Positions 5 to 10 are s, a, m, p, l, e. The stop 11 is excluded." },
    { q: "What does <code>\"24\" * 3</code> give?", o: ["72", "'242424'", "TypeError", "'72'"], a: 1, why: "Multiplying a string by an int repeats the text." },
    { q: "Which expression raises an error?", o: ["int(\"24\")", "float(\"2.5\")", "int(\"2.5\")", "int(2.5)"], a: 2, why: "int cannot parse text with a decimal point. int(2.5) truncates a float and is fine." },
    { q: "What does <code>bool(\"False\")</code> return?", o: ["False", "True", "ValueError", "None"], a: 1, why: "A non-empty string is truthy regardless of its content." },
    { q: "What does this print?", code: "t = 750\nprint(700 <= t <= 750, t > 750)", o: ["True True", "False False", "True False", "False True"], a: 2, why: "750 is inside the closed range, and 750 > 750 is false." },
    { q: "What does this print?", code: "s = \"  ab  \"\ns.strip()\nprint(len(s))", o: ["2", "6", "4", "0"], a: 1, why: "strip returns a new string that was not assigned. s is unchanged with 6 characters." },
    { q: "What does <code>int(-3.9)</code> give?", o: ["-4", "-3", "3", "ValueError"], a: 1, why: "int truncates toward zero, so -3.9 becomes -3." },
    { q: "What does this print?", code: "x = 0.1 + 0.2\nprint(x == 0.3, f\"{x:.2f}\")", o: ["True 0.30", "False 0.30", "True 0.3", "False 0.3"], a: 1, why: "Binary floats make 0.1 + 0.2 slightly above 0.3, so == is False, while the formatted text is 0.30." },
    { q: "What does this print?", code: "print(total)\ntotal = 5", o: ["5", "None", "NameError", "0"], a: 2, why: "Lines run in order. On line 1 the name total does not exist yet." }
  ], "Lesson 2 test");
}}
],
summary: String.raw`A program runs top to bottom. Each line evaluates its right side and binds a name to the resulting object, and rebinding a name moves only that one arrow. Integers are exact, floats approximate, and the operator order is power, then multiply and divide, then add and subtract. Strings are sequences indexed from zero, slices exclude their stop, and string methods return new strings. Comparisons give booleans, zero and empty values are false, and bool of text is not a parser. Conversions happen where data enters, a failed parse raises ValueError, and f-strings format values for display without changing them.`,
sheet: [
[String.raw`\[ \texttt{name = expr} \;\Rightarrow\; \text{evaluate, then bind} \]`, "Assignment"],
[String.raw`\[ \texttt{**} \succ \texttt{* / // \%} \succ \texttt{+ -} \]`, "Operator order, left to right within a level"],
[String.raw`\[ \texttt{s[a:b]} \;\text{has } b - a \text{ characters}, \quad \texttt{s[-1]} \text{ is the last} \]`, "Slicing"],
[String.raw`\[ \text{falsy: } 0,\ 0.0,\ \texttt{""},\ \texttt{[]},\ \texttt{None},\ \texttt{False} \]`, "Truth values"],
[String.raw`\[ \texttt{int("2.5")} \to \texttt{ValueError}, \quad \texttt{"a" + 1} \to \texttt{TypeError} \]`, "The two errors to expect"],
[String.raw`\[ \texttt{f"\{x:.2f\}"}, \quad \texttt{f"\{x:,.0f\}"}, \quad \texttt{f"\{x:.1\%\}"} \]`, "Formatting for display"]],
sources: ["The Python Tutorial, sections 3 and 4 (python.org)", "AME 5970 HW1 Part 1 and HW2 Part 1: types, conversion, strings as sample identifiers, precedence", "Ramalho, Fluent Python, 2nd ed., chapter 6 (object references)", "Python Tutor (pythontutor.com) for the names-and-objects memory model used in the cards"]
});
})();
