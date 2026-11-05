(function () {
/* ML shelf, Part 2, Lesson 4: Data structures. Follows AME 5970 HW1 Part 1 (exercises 7, 8) and HW2 Part 1 (exercises 1, 4, 6). */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Foundations", num: "Lesson 4",
id: "ml-py-l4", title: "Data structures", short: "4. Data structures",
big: String.raw`Python has four containers you will read every day. A list is an ordered sequence you can change. A tuple is an ordered sequence you cannot. A dictionary maps keys to values. A set holds unique items. The thing that trips everyone is not the syntax but the memory model from Lesson 2 applied to containers: a list is one object, two names can point at it, and changing it through one name changes what the other sees. The cards run each case with the memory diagram so you see the arrows, not just the output. By the end you can read a nested record like <code>config["model"]["layers"][0]</code> and know exactly what it is.`,
bridge: String.raw`HW1 Exercise 7 is the copy-versus-alias trap with a list of defect counts, Exercise 8 is a dictionary record with a tuple of measurements, and HW2 Exercise 4 builds a lookup dictionary that refuses duplicates. Every PyTorch <code>state_dict</code>, every config and every batch of data uses these shapes.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Lists", t: "Lists: ordered, indexed, changeable",
intu: String.raw`A list keeps items in order and lets you read them by position, exactly like a string, and unlike a string you can change it in place: append, remove, sort, assign to a position. Step through the program and watch the list object change while the name stays the same. That is the key word, in place: <code>append</code> and <code>sort</code> return nothing useful, they modify the object. <code>sorted(xs)</code> is different, it returns a new list.`,
eq: String.raw`\[ \texttt{xs[i]},\ \texttt{xs[a:b]},\ \texttt{len(xs)},\ \texttt{xs.append(v)},\ \texttt{xs.remove(v)},\ \texttt{xs.sort()},\ \texttt{sorted(xs)} \]`,
sym: [["xs[i]", "item at position i, counted from 0, negative from the end"], ["xs[a:b]", "a new list with positions a up to b"], [".append(v)", "add v at the end, in place, returns None"], [".remove(v)", "delete the first item equal to v, in place"], [".sort()", "sort in place, returns None"], ["sorted(xs)", "a new sorted list, xs unchanged"]],
how: ["The list is created once. Its name points at it.", "append adds to that same object. No new list is made.", "remove deletes the first match only. A second 1 stays.", "sort reorders the object in place. Writing <code>xs = xs.sort()</code> binds xs to None, a classic bug.", "Slicing makes a new list that shares nothing with the original."],
say: String.raw`A list is a mutable ordered sequence, and its methods append, remove and sort change the object in place rather than returning a new one.`,
num: String.raw`<code>[3, 1, 4, 1, 5]</code> after append 2, remove 1, sort is <b>[1, 2, 3, 4, 5]</b>. Note only one of the two 1s was removed.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["xs = [3, 1, 4, 1, 5]", "xs.append(2)", "xs.remove(1)", "xs.sort()", "ys = sorted(xs)", "print(xs[0], xs[-1], len(xs))"],
    steps: [
      { ln: 0, vars: [["xs", "L"]], objs: [["L", "list", "[3, 1, 4, 1, 5]"]], out: [] },
      { ln: 1, vars: [["xs", "L"]], objs: [["L", "list", "[3, 1, 4, 1, 5, 2]"]], out: [], note: "the same object grew. append returned None, which was discarded." },
      { ln: 2, vars: [["xs", "L"]], objs: [["L", "list", "[3, 4, 1, 5, 2]"]], out: [], note: "only the first 1 was removed" },
      { ln: 3, vars: [["xs", "L"]], objs: [["L", "list", "[1, 2, 3, 4, 5]"]], out: [], note: "sorted in place, still the same object" },
      { ln: 4, vars: [["xs", "L"], ["ys", "M"]], objs: [["L", "list", "[1, 2, 3, 4, 5]"], ["M", "list", "[1, 2, 3, 4, 5]"]], out: [], note: "sorted() made a second, independent list" },
      { ln: 5, vars: [["xs", "L"], ["ys", "M"]], objs: [["L", "list", "[1, 2, 3, 4, 5]"], ["M", "list", "[1, 2, 3, 4, 5]"]], out: ["1 5 5"] }
    ]
  });
}},

{s: "2. Alias or copy", t: "Two names, one list: alias versus copy",
intu: String.raw`This is HW1 Exercise 7 and the most important card in the lesson. <code>b = a</code> does not copy a list. It makes a second arrow to the same object, so appending through <code>b</code> changes what <code>a</code> shows. <code>a.copy()</code> makes a new list with the same items. Step through both versions and watch the arrows. In data analysis an accidental alias silently alters the original data, and the bug surfaces far from where it was made.`,
eq: String.raw`\[ \texttt{b = a} \;\Rightarrow\; \text{one object, two names} \qquad \texttt{b = a.copy()} \;\Rightarrow\; \text{two objects} \]`,
sym: [["alias", "a second name for the same object"], [".copy()", "a new list with the same items, also written <code>a[:]</code> or <code>list(a)</code>"], ["is", "True when two names point at the same object"], ["==", "True when two objects have equal contents, even if they are different objects"]],
how: ["Line 1 creates the list. Line 2 either aliases it or copies it, depending on the button.", "Line 3 appends through b.", "With the alias, a shows the change too, because there is only one list.", "With the copy, a is untouched.", "<code>a is b</code> tells the two cases apart. <code>a == b</code> cannot, before the append."],
say: String.raw`Assigning a list to a second name makes an alias of the same object, and only an explicit copy makes an independent list.`,
num: String.raw`Alias: after <code>b.append(9)</code>, <code>len(a)</code> is <b>4</b>. Copy: <code>len(a)</code> is <b>3</b>.`,
note: String.raw`HW1 asked what happens with plain assignment instead of a copy. The answer: both names refer to the same mutable list, so the original data is changed through either name.`,
r(fig, ctl) {
  let mode = "alias";
  const build = () => {
    const copy = mode === "copy";
    return { code: ["a = [3, 1, 4]", copy ? "b = a.copy()" : "b = a", "b.append(9)", "print(a)", "print(a is b)"],
      steps: [
        { ln: 0, vars: [["a", "L"]], objs: [["L", "list", "[3, 1, 4]"]], out: [] },
        copy ? { ln: 1, vars: [["a", "L"], ["b", "M"]], objs: [["L", "list", "[3, 1, 4]"], ["M", "list", "[3, 1, 4]"]], out: [], note: "copy: a second list with the same items" } : { ln: 1, vars: [["a", "L"], ["b", "L"]], objs: [["L", "list", "[3, 1, 4]"]], out: [], note: "alias: both names point at the one list" },
        copy ? { ln: 2, vars: [["a", "L"], ["b", "M"]], objs: [["L", "list", "[3, 1, 4]"], ["M", "list", "[3, 1, 4, 9]"]], out: [], note: "only b's list changed" } : { ln: 2, vars: [["a", "L"], ["b", "L"]], objs: [["L", "list", "[3, 1, 4, 9]"]], out: [], note: "the one list changed, so a sees it too" },
        copy ? { ln: 3, vars: [["a", "L"], ["b", "M"]], objs: [["L", "list", "[3, 1, 4]"], ["M", "list", "[3, 1, 4, 9]"]], out: ["[3, 1, 4]"] } : { ln: 3, vars: [["a", "L"], ["b", "L"]], objs: [["L", "list", "[3, 1, 4, 9]"]], out: ["[3, 1, 4, 9]"] },
        copy ? { ln: 4, vars: [["a", "L"], ["b", "M"]], objs: [["L", "list", "[3, 1, 4]"], ["M", "list", "[3, 1, 4, 9]"]], out: ["[3, 1, 4]", "False"] } : { ln: 4, vars: [["a", "L"], ["b", "L"]], objs: [["L", "list", "[3, 1, 4, 9]"]], out: ["[3, 1, 4, 9]", "True"] }
      ] };
  };
  const render = () => { ctl.innerHTML = btns([["alias", "b = a"], ["copy", "b = a.copy()"]], "m"); pick(ctl, "m", mode); ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; render(); }); ML.memory(fig, ctl, build()); };
  render();
}},

{s: "3. Tuples", t: "Tuples: ordered and fixed",
intu: String.raw`A tuple is a list you cannot change. Round brackets, or just commas. Use one when the items belong together and must not be edited by accident: a set of three hardness measurements, an (x, y) pair, the shape of an array. Tuples unpack: <code>a, b = pair</code> gives two names in one line, and a function that returns two things returns a tuple. Step through to see unpacking and the error that an edit raises.`,
eq: String.raw`\[ \texttt{t = (331, 337, 334)}, \quad \texttt{t[1]} = 337, \quad \texttt{t[1] = 0} \to \texttt{TypeError} \]`,
sym: [["tuple", "ordered, indexable, immutable"], ["unpacking", "<code>a, b, c = t</code> binds three names from one tuple"], ["return a, b", "returns the tuple (a, b)"], ["shape", "NumPy and PyTorch report shapes as tuples, for example (4, 3)"]],
how: ["Create the tuple. Indexing and slicing work like a list.", "Unpack it into named values when you need them separately.", "An attempt to assign to a position raises TypeError. The data is protected.", "A tuple can hold a list, and that list is still mutable. Immutability is shallow.", "Tuples can be dictionary keys, lists cannot, because keys must be unchangeable."],
say: String.raw`A tuple is an immutable ordered sequence, used for values that belong together and should not be edited, and it unpacks into separate names in one line.`,
num: String.raw`<code>(331, 337, 334)</code>: mean <b>334.0</b>, computed with <code>sum(t) / len(t)</code>. A one-item tuple needs a comma: <code>(5,)</code>.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["hv = (331, 337, 334)", "lo, mid, hi = hv", "mean = sum(hv) / len(hv)", "print(mid, mean)", "hv[1] = 0"],
    steps: [
      { ln: 0, vars: [["hv", "T"]], objs: [["T", "tuple", "(331, 337, 334)"]], out: [] },
      { ln: 1, vars: [["hv", "T"], ["lo", "a"], ["mid", "b"], ["hi", "c"]], objs: [["T", "tuple", "(331, 337, 334)"], ["a", "int", "331"], ["b", "int", "337"], ["c", "int", "334"]], out: [], note: "unpacking: three names from one tuple, in order" },
      { ln: 2, vars: [["hv", "T"], ["lo", "a"], ["mid", "b"], ["hi", "c"], ["mean", "m"]], objs: [["T", "tuple", "(331, 337, 334)"], ["a", "int", "331"], ["b", "int", "337"], ["c", "int", "334"], ["m", "float", "334.0"]], out: [] },
      { ln: 3, vars: [["hv", "T"], ["lo", "a"], ["mid", "b"], ["hi", "c"], ["mean", "m"]], objs: [["T", "tuple", "(331, 337, 334)"], ["a", "int", "331"], ["b", "int", "337"], ["c", "int", "334"], ["m", "float", "334.0"]], out: ["337 334.0"] },
      { ln: 4, vars: [["hv", "T"], ["lo", "a"], ["mid", "b"], ["hi", "c"], ["mean", "m"]], objs: [["T", "tuple", "(331, 337, 334)"], ["a", "int", "331"], ["b", "int", "337"], ["c", "int", "334"], ["m", "float", "334.0"]], out: ["337 334.0", "TypeError: 'tuple' object does not support item assignment"], note: "the tuple refused the edit. The measurements are safe." }
    ]
  });
}},

{s: "4. Dictionaries", t: "Dictionaries: a name for every field",
intu: String.raw`A dictionary maps keys to values. Where a list makes you remember that position 2 is the temperature, a dictionary lets you write <code>record["temperature_c"]</code>. Keys are usually strings, values are anything. Step through a record being built, read, extended with a computed field, and queried for a key that is not there. The two ways to read a key differ: square brackets raise KeyError when the key is missing, <code>.get</code> returns a default.`,
eq: String.raw`\[ \texttt{d[k]} \to v, \qquad \texttt{d[k] = v} \text{ adds or replaces}, \qquad \texttt{d.get(k, default)} \text{ never raises} \]`,
sym: [["key", "the label, usually a string, must be immutable"], ["value", "anything: a number, a tuple, a list, another dictionary"], ["d[k] = v", "insert or overwrite"], ["k in d", "True if the key exists"], [".items()", "pairs of (key, value) for looping"], [".keys(), .values()", "the keys alone, the values alone"]],
how: ["Build the record with curly braces and colon pairs.", "Read a field by key. Positions do not exist.", "Add a field by assigning to a new key. A dictionary grows like that.", "Loop over <code>.items()</code> to visit every pair.", "A missing key with square brackets is a KeyError. Use <code>.get</code> or <code>in</code> when the key may be absent."],
say: String.raw`A dictionary stores values under keys, so a record's fields have names instead of positions, and reading a missing key with brackets raises KeyError.`,
num: String.raw`The HW1 record has <b>4 fields</b>, then <b>5</b> after the mean is added. <code>len(d)</code> counts keys.`,
note: String.raw`A PyTorch state_dict is a dictionary from parameter names such as "layer1.weight" to tensors. A config file loads into a dictionary. Knowing dictionaries is knowing how models are stored.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["rec = {\"id\": \"TI64-07\", \"temp_c\": 725,", "       \"hv\": (331, 337, 334)}", "rec[\"mean_hv\"] = sum(rec[\"hv\"]) / 3", "print(rec[\"id\"], rec[\"mean_hv\"])", "print(rec.get(\"alloy\", \"unknown\"))", "print(rec[\"alloy\"])"],
    steps: [
      { ln: 1, vars: [["rec", "D"]], objs: [["D", "dict", "{id: 'TI64-07', temp_c: 725, hv: (331, 337, 334)}"]], out: [] },
      { ln: 2, vars: [["rec", "D"]], objs: [["D", "dict", "{id, temp_c, hv, mean_hv: 334.0}"]], out: [], note: "a new key was added to the same dictionary object" },
      { ln: 3, vars: [["rec", "D"]], objs: [["D", "dict", "{id, temp_c, hv, mean_hv: 334.0}"]], out: ["TI64-07 334.0"] },
      { ln: 4, vars: [["rec", "D"]], objs: [["D", "dict", "{id, temp_c, hv, mean_hv: 334.0}"]], out: ["TI64-07 334.0", "unknown"], note: "get returned the default because there is no alloy key" },
      { ln: 5, vars: [["rec", "D"]], objs: [["D", "dict", "{id, temp_c, hv, mean_hv: 334.0}"]], out: ["TI64-07 334.0", "unknown", "KeyError: 'alloy'"], note: "square brackets on a missing key raise. The program stops here." }
    ]
  });
}},

{s: "5. Build a lookup", t: "Build a lookup and refuse duplicates",
intu: String.raw`HW2 Exercise 4: turn a list of (id, hardness) pairs into a dictionary, and raise an error if an id appears twice instead of silently replacing the earlier value. Step through. The loop unpacks each tuple, checks the key, and inserts. The second A triggers the check. This pattern, validate then insert, is how a data loader should treat every record, because silent replacement discards a measurement without a trace.`,
eq: String.raw`\[ \text{for } (k, v) \in \text{records}: \quad k \in d \Rightarrow \texttt{ValueError}, \quad \text{else } d[k] \leftarrow v \]`,
sym: [["records", "a list of tuples, one per measurement"], ["lookup", "the dictionary being built"], ["k in lookup", "the duplicate check, before the insert"], ["raise ValueError", "stop with a message that names the duplicate"]],
how: ["Start with an empty dictionary.", "Loop over the records, unpacking each tuple into id and value.", "If the id is already a key, raise with the id in the message.", "Otherwise insert.", "The error forces the data owner to decide: a typo, a repeat experiment, or a deliberate replacement."],
say: String.raw`Building a lookup means validating each key before inserting it, because a dictionary silently overwrites a repeated key and the lost value leaves no trace.`,
num: String.raw`Three records insert fine. A fourth with a repeated id <b>A</b> raises before anything is overwritten, so the dictionary still has 3 entries.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["records = [(\"A\", 312.5), (\"B\", 298.0), (\"A\", 315.0)]", "lookup = {}", "for sid, hv in records:", "    if sid in lookup:", "        raise ValueError(f\"duplicate id {sid}\")", "    lookup[sid] = hv", "print(lookup)"],
    steps: [
      { ln: 1, vars: [["records", "R"], ["lookup", "D"]], objs: [["R", "list", "[('A', 312.5), ('B', 298.0), ('A', 315.0)]"], ["D", "dict", "{}"]], out: [] },
      { ln: 5, vars: [["records", "R"], ["lookup", "D"], ["sid", "s"], ["hv", "h"]], objs: [["R", "list", "[('A', 312.5), ('B', 298.0), ('A', 315.0)]"], ["D", "dict", "{'A': 312.5}"], ["s", "str", "'A'"], ["h", "float", "312.5"]], out: [], note: "first record: A is new, inserted" },
      { ln: 5, vars: [["records", "R"], ["lookup", "D"], ["sid", "s"], ["hv", "h"]], objs: [["R", "list", "[('A', 312.5), ('B', 298.0), ('A', 315.0)]"], ["D", "dict", "{'A': 312.5, 'B': 298.0}"], ["s", "str", "'B'"], ["h", "float", "298.0"]], out: [], note: "second record: B is new, inserted" },
      { ln: 3, vars: [["records", "R"], ["lookup", "D"], ["sid", "s"], ["hv", "h"]], objs: [["R", "list", "[('A', 312.5), ('B', 298.0), ('A', 315.0)]"], ["D", "dict", "{'A': 312.5, 'B': 298.0}"], ["s", "str", "'A'"], ["h", "float", "315.0"]], out: [], note: "third record: A is already a key, the check is true" },
      { ln: 4, vars: [["records", "R"], ["lookup", "D"], ["sid", "s"], ["hv", "h"]], objs: [["R", "list", "[('A', 312.5), ('B', 298.0), ('A', 315.0)]"], ["D", "dict", "{'A': 312.5, 'B': 298.0}"], ["s", "str", "'A'"], ["h", "float", "315.0"]], out: ["ValueError: duplicate id A"], note: "raised before the overwrite. 312.5 was not lost. The print never runs." }
    ]
  });
}},

{s: "6. Sets", t: "Sets: unique items, fast membership",
intu: String.raw`A set holds each item once, in no particular order, and answers "is this in here" instantly. Two sets intersect, unite and subtract like the sets in mathematics. The ML use is checking splits: the training ids and the test ids must have an empty intersection, and together they must cover every row. Edit the two id lists and watch the three set operations.`,
eq: String.raw`\[ A \cap B = \texttt{A \& B}, \quad A \cup B = \texttt{A | B}, \quad A \setminus B = \texttt{A - B}, \quad \texttt{set(xs)} \text{ removes duplicates} \]`,
sym: [["set(xs)", "the unique items of xs"], ["x in s", "membership, fast even for millions of items"], ["A & B", "items in both"], ["A | B", "items in either"], ["A - B", "items in A but not B"], ["isdisjoint", "True when the intersection is empty"]],
how: ["Make sets from the two id lists.", "Their intersection must be empty, or a sample is in both splits and the test score is optimistic.", "Their union must equal the set of all ids, or some samples were dropped.", "len(set(xs)) less than len(xs) means xs has duplicates.", "Sets are unordered, so never rely on the order you see when printing one."],
say: String.raw`A set stores unique items and supports intersection, union and difference, which is how you prove that two data splits do not overlap and together cover everything.`,
num: String.raw`The HW notebooks assert exactly this: <code>set(train_idx).isdisjoint(set(test_idx))</code> and the union has length <b>n</b>.`,
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><label>train ids</label><input id="ta" value="0, 1, 2, 3, 4, 5" style="flex:1;font:inherit;font-size:14px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--fg)"></div><div class="row"><label>test ids</label><input id="tb" value="6, 7, 8, 9" style="flex:1;font:inherit;font-size:14px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--fg)"></div><div class="row"><button id="t1">make them overlap</button><button id="t2">drop a sample</button><button id="t3">reset</button></div><div id="so"></div>`;
  const parse = v => v.split(",").map(x => x.trim()).filter(x => x !== "").map(Number).filter(x => !isNaN(x));
  const u = () => {
    const a = parse($("ta").value), b = parse($("tb").value), A = new Set(a), B = new Set(b);
    const inter = [...A].filter(x => B.has(x)), uni = [...new Set([...A, ...B])].sort((x, y) => x - y), all = [...Array(10).keys()], missing = all.filter(x => !uni.includes(x));
    let s = "";
    s += `<circle cx="260" cy="110" r="90" fill="${C.blue}" fill-opacity="0.18" stroke="${C.blue}"/><circle cx="420" cy="110" r="90" fill="${C.coral}" fill-opacity="0.18" stroke="${C.coral}"/>` + tx(200, 30, "train", "middle", "th") + tx(480, 30, "test", "middle", "th");
    const onlyA = [...A].filter(x => !B.has(x)), onlyB = [...B].filter(x => !A.has(x));
    s += tx(215, 115, onlyA.join(" "), "middle", "t") + tx(465, 115, onlyB.join(" "), "middle", "t") + tx(340, 115, inter.join(" ") || "", "middle", "th");
    s += tx(340, 225, `A & B = {${inter.join(", ")}}   A | B has ${uni.length} ids   missing: {${missing.join(", ")}}`, "middle", "t");
    fig.innerHTML = svg(240, s) + ML.code([`train = set([${a.join(", ")}])`, `test = set([${b.join(", ")}])`, "print(train.isdisjoint(test), len(train | test))"], -1) + ML.term([`${inter.length === 0 ? "True" : "False"} ${uni.length}`]);
    $("so").innerHTML = ML.readout([["overlap", inter.length ? "YES, " + inter.length + " shared ids, leakage" : "none"], ["coverage of 10 ids", missing.length ? "incomplete, " + missing.length + " dropped" : "complete"], ["duplicates in train list", a.length - A.size]]);
  };
  $("ta").oninput = u; $("tb").oninput = u;
  $("t1").onclick = () => { $("tb").value = "5, 6, 7, 8, 9"; u(); };
  $("t2").onclick = () => { $("ta").value = "0, 1, 2, 3, 4"; $("tb").value = "6, 7, 8, 9"; u(); };
  $("t3").onclick = () => { $("ta").value = "0, 1, 2, 3, 4, 5"; $("tb").value = "6, 7, 8, 9"; u(); };
  u();
}},

{s: "7. Nesting", t: "Nested structures: a config is a dictionary of dictionaries",
intu: String.raw`Real data nests. A config has a model section with a list of layer sizes. A batch is a list of records, each a dictionary. Reading a nested value is one bracket per level, left to right. Click a path to see it resolve step by step. The copy trap returns here with more force: <code>copy()</code> copies only the outer container, the inner lists are still shared. <code>copy.deepcopy</code> copies all the way down, which is why the course's training loops deep-copy the best <code>state_dict</code>.`,
eq: String.raw`\[ \texttt{cfg["model"]["layers"][0]} \;\to\; \texttt{cfg["model"]} \to \texttt{["layers"]} \to \texttt{[0]} \]`,
sym: [["nesting", "a container whose values are containers"], ["path", "one bracket per level, evaluated left to right"], ["shallow copy", "<code>.copy()</code>: new outer container, same inner objects"], ["deep copy", "<code>copy.deepcopy(x)</code>: new objects at every level"]],
how: ["Start from the outermost name and apply one bracket at a time.", "After each bracket, know the type of what you are holding: dictionary, list, number.", "To change a nested value, use the same path on the left of an equals sign.", "A shallow copy shares inner lists. Changing one changes both.", "Deep copy when you need an independent snapshot, such as the best model weights during training."],
say: String.raw`A nested structure is read one bracket per level, a shallow copy shares the inner objects, and a deep copy makes an independent copy at every level.`,
num: String.raw`<code>cfg["model"]["layers"]</code> is a list of <b>3</b> sizes. <code>cfg["model"]["layers"][0]</code> is the number <b>128</b>.`,
note: String.raw`Every HW training loop stores <code>best_state = copy.deepcopy(model.state_dict())</code>. A plain reference would keep changing as training continues, so the saved checkpoint would be the last epoch, not the best.`,
r(fig, ctl) {
  const cfg = { model: { name: "mlp", layers: [128, 64, 10], dropout: 0.2 }, train: { lr: 0.001, epochs: 10, batch: 64 }, data: { path: "data/processed/fruit.csv", features: ["mass_g", "color"] } };
  const P = [["cfg[\"model\"]", [["model"]]], ["cfg[\"model\"][\"layers\"]", [["model"], ["layers"]]], ["cfg[\"model\"][\"layers\"][0]", [["model"], ["layers"], [0]]], ["cfg[\"train\"][\"lr\"]", [["train"], ["lr"]]], ["cfg[\"data\"][\"features\"][-1]", [["data"], ["features"], [-1]]]];
  let k = 2, deep = 0;
  ctl.innerHTML = btns(P.map((p, i) => [i, p[0]]), "k") + btns([[0, "shallow copy then edit"], [1, "deep copy then edit"]], "d") + `<div id="np"></div>`;
  const fmt = v => Array.isArray(v) ? "[" + v.join(", ") + "]" : typeof v === "object" ? "{" + Object.keys(v).join(", ") + "}" : JSON.stringify(v);
  const u = () => {
    pick(ctl, "k", k); pick(ctl, "d", deep);
    const path = P[k][1]; let cur = cfg; let s = ""; let y = 30;
    s += tx(62, y, "cfg", null, "th") + tx(160, y, fmt(cfg), null, "t"); y += 34;
    path.forEach(([key]) => { const kk = typeof key === "number" && key < 0 ? cur.length + key : key; cur = cur[kk]; s += arrow(48, y - 24, 48, y - 10, C.coral, 1.5) + tx(62, y + 2, "[" + JSON.stringify(key) + "]", null, "th") + tx(160, y + 2, fmt(cur), null, "t") + tx(600, y + 2, Array.isArray(cur) ? "list" : typeof cur === "object" ? "dict" : typeof cur, "end"); y += 34; });
    const code = ["import copy", `c2 = ${deep ? "copy.deepcopy(cfg)" : "cfg.copy()"}`, "c2[\"model\"][\"layers\"][0] = 999", "print(cfg[\"model\"][\"layers\"][0])"];
    fig.innerHTML = svg(y, s) + ML.code(code, -1) + ML.term([deep ? "128" : "999"]);
    $("np").innerHTML = `<p class="note">${deep ? "<b>Deep copy:</b> c2 has its own inner dictionaries and lists, so editing c2 leaves cfg at 128." : "<b>Shallow copy:</b> c2 is a new outer dictionary, but c2[\"model\"] is the same inner dictionary as cfg[\"model\"], so the edit shows up in cfg."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { deep = +b.dataset.d; u(); });
  u();
}},

{s: "8. Which one", t: "Choosing the container",
intu: String.raw`Four containers, four questions. Does order matter? Will it change? Do the items have names? Must items be unique? Click a situation from ML practice and see which container fits and why. The choice is also documentation: a tuple says "these belong together and are fixed", a dictionary says "these fields have names", a set says "membership is the question".`,
eq: String.raw`\[ \text{list: ordered, mutable} \quad \text{tuple: ordered, fixed} \quad \text{dict: named fields} \quad \text{set: unique, membership} \]`,
sym: [["list", "a sequence that grows: file paths, losses per epoch, a batch of records"], ["tuple", "a fixed group: a shape, a coordinate pair, a function's multiple return"], ["dict", "a record or a config: fields by name, parameters by name"], ["set", "ids for checking overlap, vocabulary of unique tokens"]],
how: ["If items have names, dictionary.", "If the group is fixed and small, tuple.", "If the question is membership or uniqueness, set.", "Otherwise, list."],
say: String.raw`Choose a list for a changing sequence, a tuple for a fixed group, a dictionary for named fields and a set for unique items and membership tests.`,
num: String.raw`A training run's loss history: a <b>list</b> of about 100 floats. The model's parameters: a <b>dict</b> of name to tensor. An array's shape: a <b>tuple</b>.`,
r(fig, ctl) {
  const Q = [["validation loss after each epoch", "list", "ordered, grows by one each epoch, used for plotting"], ["the shape (64, 1, 28, 28) of a batch", "tuple", "fixed, belongs together, never edited"], ["model parameters by name", "dict", "each tensor has a name such as layer1.weight"], ["ids of samples already used for training", "set", "the question is: is this id in here already"], ["one data record with mass, color and class", "dict", "fields with names, read by name"], ["the (x, y) coordinates of a point", "tuple", "two values that belong together and are fixed"], ["the unique words in a text", "set", "uniqueness is the point, order is not"], ["file paths found in a folder", "list", "an ordered collection you can sort and extend"]];
  let k = -1;
  ctl.innerHTML = `<div class="row">${Q.map((q, i) => `<button data-k="${i}" style="font-size:13px">${q[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    ["list", "tuple", "dict", "set"].forEach((n, i) => { const on = k >= 0 && Q[k][1] === n; s += `<rect x="${40 + i * 155}" y="20" width="140" height="60" rx="10" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}" stroke-width="${on ? 2.5 : 1}"/>` + tx(110 + i * 155, 44, n, "middle", "th") + tx(110 + i * 155, 66, ["[a, b, c]", "(a, b, c)", "{k: v}", "{a, b, c}"][i], "middle"); });
    s += tx(340, 120, k < 0 ? "click a situation" : Q[k][2], "middle", "t");
    fig.innerHTML = svg(136, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "9. With the agent", t: "Do it with the agent: records in, lookup out, with checks",
intu: String.raw`A loader that reads records, validates each, builds a lookup, and proves the splits do not overlap. It uses every container from this lesson, which is why it is the exercise. After the agent writes it, trace the duplicate case and the overlap check by hand before you run them.`,
eq: String.raw`\[ \text{list of tuples} \to \text{validated dict} \to \text{sets of ids} \to \text{disjoint check} \]`,
sym: [["records", "list of (id, hardness) tuples"], ["lookup", "dictionary from id to hardness, duplicates refused"], ["split ids", "two sets that must be disjoint and cover all ids"]],
how: ["Paste the command.", "Read <code>build_lookup</code> and find the duplicate check. It must come before the insert.", "Read <code>split_ids</code> and find the two set assertions.", "Run it. Then feed it a duplicate and an overlapping split and confirm both raise."],
say: String.raw`A loader validates every record before inserting it and proves its splits are disjoint with sets, so bad data fails loudly instead of leaking.`,
num: String.raw`On the example, <b>5 records</b> build a lookup of 5, split <b>3 train and 2 test</b>, with an empty intersection.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "In src/records.py add two functions. build_lookup(records: list[tuple[str, float]]) -> dict[str, float] builds a dict from sample id to hardness, raising ValueError naming the id if an id repeats, and ValueError if a hardness is not a finite positive number. split_ids(ids: list[str], n_train: int, seed: int = 42) -> tuple[set[str], set[str]] shuffles a copy of the ids with random.Random(seed), returns the first n_train as the train set and the rest as the test set, and asserts the two sets are disjoint and their union equals set(ids). Docstrings and type hints on both. Under the main guard, build a lookup from [(\"A\", 312.5), (\"B\", 298.0), (\"C\", 327.5), (\"D\", 301.0), (\"E\", 318.2)], split the ids 3 and 2, and print the lookup, both sets and len(train & test). Run it and paste the output.",
    actions: ["$ python src/records.py", "{'A': 312.5, 'B': 298.0, 'C': 327.5, 'D': 301.0, 'E': 318.2}", "train {'D', 'A', 'C'} test {'B', 'E'}", "0"],
    checks: ["the duplicate check happens before the insert, so no value is overwritten", "a repeated id raises ValueError with the id in the message", "the split shuffles a copy, so the caller's list is unchanged", "train & test prints 0 and the two asserts are present", "the printed sets may appear in any order, since sets are unordered"]
  });
}},

{s: "10. Test", t: "Test: data structures",
intu: String.raw`Twelve questions. Most are about what happens in memory: alias or copy, in place or new, error or value.`,
eq: String.raw`\[ \text{names} \to \text{objects} \to \text{what changed} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Draw the arrows before you answer alias questions.", "Ask whether a method changes in place or returns a new object.", "For dictionaries, ask whether the key exists."],
say: String.raw`I can tell an alias from a copy, an in-place change from a new object, and a list from a tuple, a dictionary and a set.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does this print?", code: "a = [3, 1, 4]\nb = a\nb.append(1)\nprint(len(a))", o: ["3", "4", "Error", "1"], a: 1, why: "b is an alias of the same list, so the append is visible through a." },
    { q: "What does this print?", code: "a = [3, 1, 4]\nb = a.copy()\nb.append(1)\nprint(len(a), a is b)", o: ["4 True", "3 True", "3 False", "4 False"], a: 2, why: "copy made a new list. a is unchanged, and the two names point at different objects." },
    { q: "What does <code>xs = [3, 1, 2]; xs = xs.sort(); print(xs)</code> print?", o: ["[1, 2, 3]", "None", "[3, 1, 2]", "Error"], a: 1, why: "sort works in place and returns None, which is then bound to xs." },
    { q: "What does <code>[3, 1, 4, 1, 5]</code> become after <code>.remove(1)</code>?", o: ["[3, 4, 5]", "[3, 4, 1, 5]", "[3, 1, 4, 5]", "Error"], a: 1, why: "remove deletes only the first matching item." },
    { q: "What happens on <code>t = (1, 2, 3); t[0] = 9</code>?", o: ["t becomes (9, 2, 3)", "TypeError", "t becomes [9, 2, 3]", "Nothing"], a: 1, why: "Tuples are immutable. Item assignment raises TypeError." },
    { q: "What does <code>a, b = (5, 7); print(b)</code> print?", o: ["5", "7", "(5, 7)", "Error"], a: 1, why: "Unpacking binds a to 5 and b to 7." },
    { q: "What does <code>d = {\"x\": 1}; print(d.get(\"y\", 0), d[\"y\"])</code> do?", o: ["Prints 0 0", "Prints 0 then raises KeyError", "Prints None None", "Prints 0 None"], a: 1, why: "get returns the default 0, but square brackets on a missing key raise KeyError before the print completes." },
    { q: "A loop inserts (id, value) pairs into a dict without checking. Two records share an id. The result:", o: ["Both values are kept", "An error is raised", "The later value silently replaces the earlier one", "The dict refuses the second"], a: 2, why: "Assignment to an existing key overwrites. The first measurement is lost without any message." },
    { q: "<code>set([1, 2, 2, 3, 3, 3])</code> has how many items?", o: ["6", "3", "1", "2"], a: 1, why: "A set keeps each item once." },
    { q: "train = {0, 1, 2, 3}, test = {3, 4}. What does <code>train & test</code> give, and what does it mean?", o: ["{3}, one sample leaks into both splits", "{}, the splits are fine", "{0, 1, 2, 3, 4}", "Error"], a: 0, why: "The intersection is {3}. Sample 3 is in both splits, which makes the test score optimistic." },
    { q: "<code>cfg = {\"m\": {\"layers\": [128, 64]}}; c2 = cfg.copy(); c2[\"m\"][\"layers\"][0] = 1</code>. What is <code>cfg[\"m\"][\"layers\"][0]</code>?", o: ["128", "1", "Error", "None"], a: 1, why: "copy is shallow. The inner dictionary and list are shared, so the edit shows in cfg. deepcopy would keep 128." },
    { q: "Why does a training loop store <code>copy.deepcopy(model.state_dict())</code> rather than the state_dict itself?", o: ["It is faster", "A reference would keep changing as training continues, so the saved best would be the last epoch", "state_dict cannot be stored", "deepcopy frees memory"], a: 1, why: "The tensors inside keep being updated. A deep copy freezes the best epoch's values." }
  ], "Lesson 4 test");
}}
],
summary: String.raw`Lists are ordered and mutable, and append, remove and sort change them in place. Assigning a list to a second name makes an alias of the same object, and only copy makes an independent list, which is the bug HW1 warns about. Tuples are ordered and fixed, unpack into names, and are the shape of multiple returns and array shapes. Dictionaries map keys to values, so records and configs have named fields, brackets raise on a missing key and get returns a default. A lookup must validate before inserting, because repeated keys overwrite silently. Sets hold unique items and prove that data splits are disjoint. Nested structures are read one bracket per level, a shallow copy shares the inner objects, and a deep copy, as used for the best checkpoint, copies all the way down.`,
sheet: [
[String.raw`\[ \texttt{b = a} \Rightarrow \text{alias}, \qquad \texttt{b = a.copy()} \Rightarrow \text{new list} \]`, "The alias trap"],
[String.raw`\[ \texttt{xs.sort()} \to \texttt{None}\ (\text{in place}), \qquad \texttt{sorted(xs)} \to \text{new list} \]`, "In place versus new"],
[String.raw`\[ \texttt{d[k]} \to \texttt{KeyError} \text{ if missing}, \qquad \texttt{d.get(k, v)} \to v \]`, "Reading a dictionary"],
[String.raw`\[ A \cap B = \varnothing \ \text{and}\ A \cup B = \text{all ids} \]`, "A valid split"],
[String.raw`\[ \texttt{copy()} \text{ shallow}, \qquad \texttt{copy.deepcopy()} \text{ all levels} \]`, "Copying nested data"]],
sources: ["AME 5970 HW1 Part 1, exercises 7 and 8 (lists, mutation and copying, tuples and dictionaries for a record)", "AME 5970 HW2 Part 1, exercises 1, 4 and 6 (typed records, a validated lookup, contracts)", "The Python Tutorial, section 5 (data structures)", "Ramalho, Fluent Python, 2nd ed., chapters 2 to 3 and 6 (sequences, dictionaries, references and copies)", "AME 5970 HW6 and HW8 training loops: copy.deepcopy of the best state_dict"]
});
})();
