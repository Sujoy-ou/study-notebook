(function () {
/* ML shelf, Part 2, Lesson 6: Classes and objects. Follows AME 5970 Lecture 4 notes, chapter 2 (Object-oriented Python), sections 2.1 to 2.10, and HW4 Parts 4 to 6. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "py", {
level: "Core", num: "Lesson 6",
id: "ml-py-l6", title: "Classes and objects", short: "6. Classes and objects",
big: String.raw`A function does one job and forgets everything when it returns. A model cannot work that way: it has weights that persist, a configuration, and a prediction method that uses them, and there may be dozens of models at once. An object groups state with the operations that use it, and a class is the blueprint that makes objects. Every PyTorch model you will read is a class that inherits from <code>nn.Module</code>, stores its layers as attributes in <code>__init__</code>, and computes in <code>forward</code>. This lesson builds that reading skill with the professor's own examples, a fruit, a sample, an experiment, a thermostat, and ends with the exact map from those examples to a PyTorch model.`,
bridge: String.raw`The professor's Lecture 4 notes, chapter 2, go from a function to an object, through self, local names versus attributes, class defaults, initialization, inheritance, polymorphism, encapsulation and composition, and end with a table mapping each idea to PyTorch. The cards follow that order. HW4 Parts 4 to 6 test the same ideas with a Car, an Animal and a TinyRegressor.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Why objects", t: "From a function to an object",
intu: String.raw`The function on the left predicts strength from grain size, but the slope and intercept must be passed in on every call, and with dozens of models it is easy to use one model's parameters with another model's data. The object on the right keeps its own slope and intercept as state and carries a <code>predict</code> method that uses them. Move the grain size and see both give the same answer. The difference is not the arithmetic. It is ownership: the parameters live with the method that needs them.`,
eq: String.raw`\[ \text{function: } \hat{y} = f(x, w, b) \qquad \text{object: } \hat{y} = \text{model.predict}(x), \ \text{with } w, b \text{ stored in model} \]`,
sym: [["state", "the values an object keeps: weights, bias, configuration"], ["behavior", "the methods that use that state: predict, describe, train"], ["class", "the definition of a type of object and its methods"], ["instance", "one particular object made from the class"], ["attribute", "a value reached with a dot, such as <code>model.slope</code>"]],
how: ["A function's local names belong to one call and vanish after it.", "An object's attributes persist between calls, so a model remembers its parameters.", "The method reads them through <code>self</code>, so the caller passes only the input.", "The professor's rule: use a function for a simple transformation, a class when persistent state and related operations belong together.", "Two models from the same class have different attribute values, which is why two networks of the same architecture can have different trained weights."],
say: String.raw`An object bundles state with the methods that use it, so a model keeps its own parameters and a caller only supplies the input.`,
num: String.raw`Grain size 10 µm with slope <b>−2.0</b> and intercept <b>300</b> gives a strength of <b>280 MPa</b>, from the function and from the object alike.`,
r(fig, ctl) {
  ctl.innerHTML = sl("gs", "grain size (µm)", 2, 40, 1, 10) + `<div id="fo"></div>`;
  const u = () => {
    const g = +$("gs").value; $("gsv").textContent = g + " µm"; const y = -2 * g + 300;
    let s = ML.box(30, 20, 290, 130, "c-gray", ["function", "predict_strength(grain, slope, intercept)", "no memory between calls", "caller must pass slope and intercept"], true);
    s += ML.box(360, 20, 290, 130, "c-teal", ["object: model", "state  slope = −2.0, intercept = 300", "behavior  predict(grain)", "caller passes only the input"], true);
    s += tx(175, 176, `predict_strength(${g}, -2.0, 300.0) = ${y}`, "middle", "t") + tx(505, 176, `model.predict(${g}) = ${y}`, "middle", "t");
    fig.innerHTML = svg(190, s) + ML.code(["def predict_strength(grain, slope, intercept):", "    return slope * grain + intercept", "", "class StrengthModel:", "    def __init__(self, slope, intercept):", "        self.slope, self.intercept = slope, intercept", "    def predict(self, grain):", "        return self.slope * grain + self.intercept", "", "model = StrengthModel(-2.0, 300.0)", `print(predict_strength(${g}, -2.0, 300.0), model.predict(${g}))`], -1) + ML.term([`${y}.0 ${y}.0`]);
  };
  $("gs").oninput = u; u();
}},

{s: "2. Class and instance", t: "One class, many instances",
intu: String.raw`Running a class definition creates the class. It does not create a single fruit. Calling <code>Fruit("apple", "red")</code> creates an instance and runs <code>__init__</code> to fill its attributes. Step through. The class object holds the method definitions once. Each instance holds its own attribute values. That is why the method is shared and the data is not, and why changing the apple's colour cannot change the banana's.`,
eq: String.raw`\[ \texttt{class Fruit:} \ \ldots \ \Rightarrow \text{one class object} \qquad \texttt{Fruit("apple", "red")} \Rightarrow \text{a new instance} \]`,
sym: [["class Fruit:", "defines the type. Running it creates the class object."], ["the initializer", "<code>__init__</code>, run automatically on every new instance"], ["Fruit(...)", "a call to the class makes an instance"], ["apple.details()", "a method call through the instance"], ["apple.colour", "an attribute read from that instance"]],
how: ["Lines 1 to 6 run once and bind the name Fruit to a class object holding two functions.", "Line 8 creates an instance, runs <code>__init__</code> with that instance as self, and stores name and colour on it.", "Line 9 does the same for a second, independent instance.", "The two instances share the class's methods but each keeps its own attribute values.", "The method body is reused. The data is per object."],
say: String.raw`Executing a class definition creates the class once, each call to the class creates an independent instance with its own attributes, and the methods are shared by all instances.`,
num: String.raw`One class object, <b>two instances</b>, and <b>two attributes each</b>. Reading <code>apple.name</code> looks on the apple, not on the class.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["class Fruit:", "    def __init__(self, name, colour):", "        self.name = name", "        self.colour = colour", "    def details(self):", "        return f\"My {self.name} is {self.colour}.\"", "", "apple = Fruit(\"apple\", \"red\")", "banana = Fruit(\"banana\", \"yellow\")", "print(apple.details())", "print(banana.details())"],
    steps: [
      { ln: 5, vars: [["Fruit", "K"]], objs: [["K", "class", "Fruit: __init__, details"]], out: [], note: "the class exists. No fruit exists yet." },
      { ln: 7, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit: __init__, details"], ["a", "Fruit instance", "name='apple', colour='red'"]], out: [], note: "Fruit(...) made an instance and __init__ stored two attributes on it" },
      { ln: 8, vars: [["Fruit", "K"], ["apple", "a"], ["banana", "b"]], objs: [["K", "class", "Fruit: __init__, details"], ["a", "Fruit instance", "name='apple', colour='red'"], ["b", "Fruit instance", "name='banana', colour='yellow'"]], out: [], note: "a second instance with its own attributes" },
      { ln: 9, vars: [["Fruit", "K"], ["apple", "a"], ["banana", "b"]], objs: [["K", "class", "Fruit: __init__, details"], ["a", "Fruit instance", "name='apple', colour='red'"], ["b", "Fruit instance", "name='banana', colour='yellow'"]], out: ["My apple is red."], note: "details ran with self = apple and read the apple's attributes" },
      { ln: 10, vars: [["Fruit", "K"], ["apple", "a"], ["banana", "b"]], objs: [["K", "class", "Fruit: __init__, details"], ["a", "Fruit instance", "name='apple', colour='red'"], ["b", "Fruit instance", "name='banana', colour='yellow'"]], out: ["My apple is red.", "My banana is yellow."], note: "the same method body, with self = banana" }
    ]
  });
}},

{s: "3. self", t: "What self actually means",
intu: String.raw`<code>self</code> is the instance a method is working on. It is the method's first parameter, and Python fills it in when you call the method through an object: <code>apple.details()</code> is the same as <code>Fruit.details(apple)</code>. Step through the trace of an initializer call. The four names in the table, self, name, self.name and apple, are different things even though two are spelled alike: self is the instance, name is a local argument, self.name is saved state, apple is the caller's label.`,
eq: String.raw`\[ \texttt{apple.details()} \;\equiv\; \texttt{Fruit.details(apple)} \qquad \texttt{self.name = name} \;\Rightarrow\; \text{local argument saved as state} \]`,
sym: [["self", "the current instance, available during the call"], ["name", "the argument received by this call, a local name"], ["self.name", "the instance's saved attribute, persists after the call"], ["apple", "a name in the caller that refers to the instance"]],
how: ["Fruit(\"apple\", \"red\") creates an empty instance and calls <code>__init__</code> with it as self.", "The local name holds \"apple\". It would vanish at the end of <code>__init__</code>.", "self.name = name copies the local value onto the instance. Now it persists.", "Writing <code>name = name</code> instead of <code>self.name = name</code> stores nothing, a common mistake the professor flags.", "In PyTorch, <code>self.linear = nn.Linear(2, 1)</code> stores the layer on the model so forward can find it. Without self, the layer is a local that is lost."],
say: String.raw`self is the instance a method runs on, supplied automatically by the call, and assigning to self dot something is what turns a local argument into persistent state.`,
num: String.raw`In the trace, <b>2 local names</b> die at the end of <code>__init__</code> and <b>2 attributes</b> survive on the instance.`,
note: String.raw`The professor's warning for PyTorch: omitting self leaves a layer in a local variable that forward cannot reach. HW4 Part 7's buggy model has a related mistake.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["class Fruit:", "    def __init__(self, name, colour):", "        self.name = name", "        self.colour = colour", "    def details(self):", "        return f\"My {self.name} is {self.colour}.\"", "", "apple = Fruit(\"apple\", \"red\")", "print(apple.details())", "print(Fruit.details(apple))", "apple.colour = \"green\"", "print(apple.details())"],
    steps: [
      { ln: 1, vars: [["Fruit", "K"], ["self (local)", "a"], ["name (local)", "n"], ["colour (local)", "c"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "(empty so far)"], ["n", "str", "'apple'"], ["c", "str", "'red'"]], out: [], note: "inside __init__: self is the new empty instance, name and colour are locals" },
      { ln: 3, vars: [["Fruit", "K"], ["self (local)", "a"], ["name (local)", "n"], ["colour (local)", "c"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='red'"], ["n", "str", "'apple'"], ["c", "str", "'red'"]], out: [], note: "two assignments to self copied the locals onto the instance" },
      { ln: 7, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='red'"]], out: [], note: "__init__ returned. The locals are gone, the attributes remain, and the caller named the instance apple." },
      { ln: 8, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='red'"]], out: ["My apple is red."] },
      { ln: 9, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='red'"]], out: ["My apple is red.", "My apple is red."], note: "the explicit form: the instance passed as the first argument. Same result." },
      { ln: 10, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='green'"]], out: ["My apple is red.", "My apple is red."], note: "an attribute can be changed from outside through the dot" },
      { ln: 11, vars: [["Fruit", "K"], ["apple", "a"]], objs: [["K", "class", "Fruit"], ["a", "Fruit instance", "name='apple', colour='green'"]], out: ["My apple is red.", "My apple is red.", "My apple is green."] }
    ]
  });
}},

{s: "4. Local or attribute", t: "Local variables die, attributes persist",
intu: String.raw`Inside a method, a plain assignment makes a local that lives only during that call. An assignment to <code>self.something</code> saves it on the object, where every other method can read it later. Step through the professor's Sample class: <code>temperature</code> is first a local, then saved, while <code>unit</code> in <code>describe</code> stays local and <code>hasattr(sample, "unit")</code> is False. One method cannot see another method's locals just because they share a class.`,
eq: String.raw`\[ \texttt{temperature = 800.0} \to \text{local, gone after the call} \qquad \texttt{self.temperature = temperature} \to \text{attribute, persists} \]`,
sym: [["local", "a name assigned inside a method without self"], ["attribute", "a name assigned with self dot, stored on the instance"], ["hasattr(obj, \"x\")", "True if the instance has attribute x"], ["return vs print", "return hands a value to the caller, print only displays it"]],
how: ["In <code>__init__</code>, temperature is local, then copied to self.temperature.", "In describe, unit is local. It is used and discarded.", "describe reads self.temperature, which was saved earlier.", "A method's locals are never visible to another method. Save on self, pass as an argument, or recompute.", "forward in PyTorch should return its prediction, not store it. Storing every prediction on the model keeps computation graphs alive."],
say: String.raw`A name assigned without self is local to one call, and a name assigned through self is an attribute that persists and that other methods can read.`,
num: String.raw`After the program, the instance has <b>2 attributes</b>, label and temperature. <code>unit</code> was a local and <code>hasattr</code> reports <b>False</b>.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["class Sample:", "    def __init__(self, label):", "        self.label = label", "        temperature = 800.0      # local", "        self.temperature = temperature", "    def describe(self):", "        unit = \"degrees C\"       # local", "        return f\"{self.label}: {self.temperature} {unit}\"", "", "sample = Sample(\"Ti-A\")", "print(sample.describe())", "print(hasattr(sample, \"unit\"))"],
    steps: [
      { ln: 3, vars: [["self (local)", "a"], ["label (local)", "l"], ["temperature (local)", "t"]], objs: [["a", "Sample instance", "label='Ti-A'"], ["l", "str", "'Ti-A'"], ["t", "float", "800.0"]], out: [], note: "temperature is a local so far. The instance does not have it." },
      { ln: 4, vars: [["self (local)", "a"], ["label (local)", "l"], ["temperature (local)", "t"]], objs: [["a", "Sample instance", "label='Ti-A', temperature=800.0"], ["l", "str", "'Ti-A'"], ["t", "float", "800.0"]], out: [], note: "now it is saved on the instance" },
      { ln: 9, vars: [["sample", "a"]], objs: [["a", "Sample instance", "label='Ti-A', temperature=800.0"]], out: [], note: "__init__ returned. Only the attributes survive." },
      { ln: 6, vars: [["sample", "a"], ["self (local)", "a"], ["unit (local)", "u"]], objs: [["a", "Sample instance", "label='Ti-A', temperature=800.0"], ["u", "str", "'degrees C'"]], out: [], note: "inside describe: unit is local. self.temperature is read from the instance." },
      { ln: 10, vars: [["sample", "a"]], objs: [["a", "Sample instance", "label='Ti-A', temperature=800.0"]], out: ["Ti-A: 800.0 degrees C"], note: "describe returned a string, which print displayed. unit is gone." },
      { ln: 11, vars: [["sample", "a"]], objs: [["a", "Sample instance", "label='Ti-A', temperature=800.0"]], out: ["Ti-A: 800.0 degrees C", "False"] }
    ]
  });
}},

{s: "5. Shared defaults", t: "Class defaults, instance state, and the alias again",
intu: String.raw`A name assigned in the class body is a class attribute, shared by every instance as a default. A name assigned on self in <code>__init__</code> is per instance. The trap: a mutable class attribute, such as a list, is one object shared by all instances, so appending through one instance shows up in every other. Toggle between the professor's correct version, a fresh list per object, and the broken one. The second toggle revisits aliasing: a second name for an instance is not a second instance.`,
eq: String.raw`\[ \texttt{instrument = "Load frame"} \ (\text{class, shared}) \qquad \texttt{self.measurements = []} \ (\text{instance, fresh each time}) \]`,
sym: [["class attribute", "assigned in the class body, one value shared as a default"], ["instance attribute", "assigned on self, one per object"], ["shared mutable", "a list in the class body is one list for all instances"], ["alias", "<code>second = apple</code> is the same instance under a second name"], ["new instance", "<code>Fruit(apple.name, apple.colour)</code> is an independent object with equal values"]],
how: ["Reading a.instrument finds no instance attribute, so Python looks on the class and finds the shared default.", "With self.measurements = [] in <code>__init__</code>, each instance gets its own list.", "With measurements = [] in the class body, all instances append to one list.", "An alias of an instance follows every change. A new instance built from the same values does not.", "This is the reason training loops deep-copy the best <code>state_dict</code> instead of keeping a reference."],
say: String.raw`Class attributes are shared defaults, instance attributes are per object, a mutable class attribute is one shared object, and a second name for an instance is still the same instance.`,
num: String.raw`Correct version: a.measurements is <b>[12.0]</b> and b.measurements is <b>[]</b>. Broken version: both show <b>[12.0]</b>.`,
note: String.raw`Lecture 4 section 2.5 ends with the training connection: an ordinary reference to a mutable state follows later updates, so the capstone uses deepcopy of the state_dict for the best model.`,
r(fig, ctl) {
  let broken = false, view = 0;
  ctl.innerHTML = btns([[0, "shared default list"], [1, "alias of an instance"]], "v") + btns([[0, "correct: self.measurements = []"], [1, "broken: list in the class body"]], "b") + `<div id="sd"></div>`;
  const u = () => {
    pick(ctl, "v", view); pick(ctl, "b", broken ? 1 : 0);
    ctl.querySelectorAll("button[data-b]").forEach(x => x.style.display = view === 0 ? "" : "none");
    if (view === 0) {
      const code = ["class Experiment:", "    instrument = \"Load frame\"       # class attribute, shared", broken ? "    measurements = []               # BUG: one list for all" : "", "    def __init__(self, label):", "        self.label = label", broken ? "" : "        self.measurements = []      # fresh list per object", "", "a = Experiment(\"A\")", "b = Experiment(\"B\")", "a.measurements.append(12.0)", "print(a.instrument, b.instrument)", "print(a.measurements, b.measurements)"].filter(l => l !== "");
      let s = ML.box(40, 20, 260, 70, "c-purple", ["class Experiment", "instrument = 'Load frame'", broken ? "measurements = [12.0]  (shared)" : ""], true);
      s += ML.box(360, 20, 130, 70, "c-blue", ["a", "label='A'", broken ? "" : "measurements=[12.0]"], true) + ML.box(510, 20, 130, 70, "c-blue", ["b", "label='B'", broken ? "" : "measurements=[]"], true);
      s += arrow(425, 92, 300, 60, C.gray, 1, "3 3") + arrow(575, 92, 300, 70, C.gray, 1, "3 3") + tx(340, 120, "instances read the class for anything they lack", "middle");
      fig.innerHTML = svg(130, s) + ML.code(code, code.findIndex(l => l.includes("measurements = []"))) + ML.term(["Load frame Load frame", broken ? "[12.0] [12.0]" : "[12.0] []"]);
      $("sd").innerHTML = `<p class="note">${broken ? "<b>Broken.</b> Both instances append to the one list stored on the class, so b sees a's measurement." : "<b>Correct.</b> Each __init__ makes its own list, so the histories stay separate."}</p>`;
    } else {
      fig.innerHTML = ML.code(["apple = Fruit(\"apple\", \"red\")", "second_name = apple               # alias", "second_name.colour = \"blue\"", "print(apple.colour)", "", "new_fruit = Fruit(apple.name, apple.colour)   # new instance", "new_fruit.colour = \"purple\"", "print(apple.colour, new_fruit.colour)"], -1) + ML.term(["blue", "blue purple"]) + svg(90, ML.box(40, 14, 120, 40, "c-gray", ["apple"], true) + ML.box(40, 60, 120, 24, "c-gray", ["second_name"], false) + arrow(164, 34, 236, 44, C.coral, 1.8) + arrow(164, 72, 236, 50, C.coral, 1.8) + ML.box(240, 24, 170, 44, "c-blue", ["Fruit: 'apple', 'blue'"], true) + ML.box(460, 14, 120, 40, "c-gray", ["new_fruit"], true) + arrow(584, 34, 600, 34, C.coral, 1.8) + tx(640, 38, "→ separate Fruit", "middle"));
      $("sd").innerHTML = `<p class="note"><b>Alias.</b> Changing the fruit through second_name changes the apple, because there is one instance. new_fruit was built from the same values but is a separate object.</p>`;
    }
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = +b.dataset.v; u(); });
  ctl.querySelectorAll("button[data-b]").forEach(b => b.onclick = () => { broken = b.dataset.b === "1"; u(); });
  u();
}},

{s: "6. __init__", t: "Initialization with defaults and validation",
intu: String.raw`<code>__init__</code> runs on every new instance and should leave it in a valid state. Give it the information the object needs, use defaults only where they express a sensible choice, and reject bad input immediately, because an object that starts invalid fails mysteriously much later. Click the calls to the professor's Reading class. A negative strength raises at construction, not at the first calculation that uses it.`,
eq: String.raw`\[ \texttt{Reading(value, unit="MPa")}: \quad \text{validate} \to \text{convert} \to \text{store on self} \to \text{return None} \]`,
sym: [["the initializer", "<code>__init__(self, ...)</code>.  Python calls it after creating the instance."], ["default", "<code>unit=\"MPa\"</code>, used when the caller omits it"], ["validation", "a check that raises before storing anything"], ["returns None", "<code>__init__</code> must not return a value"], ["keyword call", "<code>Reading(value=250.0)</code> says which parameter gets the number"]],
how: ["Check the inputs first and raise ValueError with a message.", "Convert to the intended type, here float, so later arithmetic is predictable.", "Store on self. Writing <code>value = value</code> would store nothing.", "Misspelling <code>__init__</code> makes Python skip it silently, and the instance has no attributes.", "For a network, the initializer takes sizes such as input features and hidden units. The data batch belongs to forward, not to <code>__init__</code>."],
say: String.raw`The initializer validates its arguments, converts them and stores them on self so that no instance ever starts in an invalid state.`,
num: String.raw`<code>Reading(value=250.0)</code> stores <b>250.0 MPa</b>. <code>Reading(-3.0)</code> raises <b>ValueError</b> before any attribute is set.`,
note: String.raw`HW4 Part 4's Car class asks for exactly this: accelerate and brake reject negative amounts, and brake never produces a negative speed.`,
r(fig, ctl) {
  const T = [["Reading(value=250.0)", "value=250.0, unit='MPa'", null], ["Reading(180, unit=\"ksi\")", "value=180.0, unit='ksi'", null], ["Reading(\"250\")", null, "TypeError: '<' not supported between instances of 'str' and 'int'"], ["Reading(-3.0)", null, "ValueError: Strength must be nonnegative."], ["Reading()", null, "TypeError: __init__() missing 1 required positional argument: 'value'"]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}"><code>${ML.esc(t[0])}</code></button>`).join("")}</div>`;
  const code = ["class Reading:", "    def __init__(self, value, unit=\"MPa\"):", "        if value < 0:", "            raise ValueError(\"Strength must be nonnegative.\")", "        self.value = float(value)", "        self.unit = unit", "", "reading = Reading(value=250.0)", "print(reading.value, reading.unit)"];
  const u = () => {
    pick(ctl, "k", k);
    const t = T[k], ok = t[1] != null;
    fig.innerHTML = svg(90, ML.box(40, 20, 240, 56, "c-gray", ["call", t[0]], true) + arrow(290, 48, 340, 48, ok ? C.teal : C.coral, 2) + ML.box(350, 20, 290, 56, ok ? "c-teal" : "c-coral", [ok ? "instance with attributes" : "raises", ok ? t[1] : t[2].split(":")[0]], true)) + ML.code(code.slice(0, 7).concat([t[0].replace("Reading(", "reading = Reading(")]), k === 3 ? 3 : k === 2 ? 2 : k === 4 ? 1 : 5) + ML.term(ok ? [t[1].replace("value=", "").replace(", unit=", " ").replace(/'/g, "")] : ["Traceback (most recent call last):", "  ...", t[2]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "7. Inheritance", t: "Inheritance and super: reuse, then specialize",
intu: String.raw`<code>class Bird(Animal)</code> says a bird is an animal. Bird reuses Animal's initializer through <code>super().__init__(name)</code>, adds its own attribute, inherits <code>speak</code> unchanged, and adds <code>fly</code>. Step through the call. When a method is looked up on an instance, Python checks the instance's class first, then its base classes in order. <code>isinstance(sparrow, Animal)</code> is True. In PyTorch, <code>super().__init__()</code> in a model sets up the bookkeeping that registers your layers. Forget it and registration fails.`,
eq: String.raw`\[ \texttt{class Bird(Animal)} \;\Rightarrow\; \text{lookup order: Bird} \to \text{Animal} \to \text{object} \]`,
sym: [["base class", "Animal, the general type"], ["subclass", "Bird, the specialized type that inherits from Animal"], ["super call", "<code>super().__init__(...)</code> runs the base class initializer on this instance"], ["inherited method", "speak is found on Animal when Bird has none"], ["isinstance(x, Animal)", "True for any Animal or subclass instance"]],
how: ["Bird(\"Sparrow\", 0.2) runs <code>Bird.__init__</code> with the new instance as self.", "<code>super().__init__(name)</code> runs <code>Animal.__init__</code> on that same instance, storing name.", "<code>Bird.__init__</code> continues and stores <code>wing_span</code>.", "sparrow.speak(): no speak on Bird, so Animal.speak is used with self = sparrow.", "sparrow.fly(): found on Bird directly."],
say: String.raw`A subclass inherits the base class's methods, calls super to reuse its initializer, and adds or overrides what is specific to it.`,
num: String.raw`The sparrow has <b>2 attributes</b>, name from Animal's initializer and <code>wing_span</code> from Bird's, and <b>2 methods</b> reachable, one inherited and one its own.`,
note: String.raw`HW4 Part 5 is Dog(Animal) with super, an overridden make_sound and an added fetch. Part 7's first bug is a missing super().__init__() in an nn.Module.`,
r(fig, ctl) {
  ML.memory(fig, ctl, {
    code: ["class Animal:", "    def __init__(self, name):", "        self.name = name", "    def speak(self):", "        return f\"{self.name} makes a sound.\"", "", "class Bird(Animal):", "    def __init__(self, name, wing_span):", "        super().__init__(name)", "        self.wing_span = wing_span", "    def fly(self):", "        return f\"{self.name} can fly.\"", "", "sparrow = Bird(\"Sparrow\", 0.2)", "print(sparrow.speak())", "print(sparrow.fly())", "print(isinstance(sparrow, Animal))"],
    steps: [
      { ln: 11, vars: [["Animal", "A"], ["Bird", "B"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"]], out: [], note: "two class objects. Bird records Animal as its base." },
      { ln: 8, vars: [["Animal", "A"], ["Bird", "B"], ["self (local)", "s"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"], ["s", "Bird instance", "name='Sparrow'"]], out: [], note: "super().__init__(name) ran Animal's initializer on the new Bird instance" },
      { ln: 9, vars: [["Animal", "A"], ["Bird", "B"], ["sparrow", "s"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"], ["s", "Bird instance", "name='Sparrow', wing_span=0.2"]], out: [], note: "Bird's own line added wing_span" },
      { ln: 14, vars: [["Animal", "A"], ["Bird", "B"], ["sparrow", "s"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"], ["s", "Bird instance", "name='Sparrow', wing_span=0.2"]], out: ["Sparrow makes a sound."], note: "speak is not on Bird, so the lookup continued to Animal" },
      { ln: 15, vars: [["Animal", "A"], ["Bird", "B"], ["sparrow", "s"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"], ["s", "Bird instance", "name='Sparrow', wing_span=0.2"]], out: ["Sparrow makes a sound.", "Sparrow can fly."] },
      { ln: 16, vars: [["Animal", "A"], ["Bird", "B"], ["sparrow", "s"]], objs: [["A", "class", "Animal: __init__, speak"], ["B", "class Bird(Animal)", "__init__, fly   base: Animal"], ["s", "Bird instance", "name='Sparrow', wing_span=0.2"]], out: ["Sparrow makes a sound.", "Sparrow can fly.", "True"] }
    ]
  });
}},

{s: "8. Polymorphism", t: "Polymorphism: one call, different behavior",
intu: String.raw`If every subclass provides <code>speak</code>, a loop can call <code>animal.speak()</code> without knowing which animal it holds. The instance's class decides what runs. That is why one training function works for a linear model and for an MLP: both provide <code>model(x)</code>, <code>parameters()</code>, <code>train()</code> and <code>eval()</code>. Click an animal, or switch to the training view and click a model, to see the same call land in different bodies.`,
eq: String.raw`\[ \texttt{for animal in animals: animal.speak()} \qquad \texttt{for model in models: train(model, data)} \]`,
sym: [["override", "a subclass defines a method with the same name, replacing the inherited one"], ["interface", "the small set of methods a caller relies on"], ["duck typing", "any object with the right methods works, with or without a common base class"], ["the training interface", "<code>model(x)</code>, <code>model.parameters()</code>, <code>model.train()</code>, <code>model.eval()</code>"]],
how: ["Dog and Cat both inherit Animal's initializer and both override speak.", "The loop holds a Dog, then a Cat, and calls the same method name.", "Python looks up speak on each instance's own class first, so each body runs.", "A training loop depends only on the model interface. Swapping the model's internals does not change the loop.", "The professor's pipeline question: a DataLoader works on any dataset that supports len and indexing, without knowing how the measurements were collected."],
say: String.raw`Polymorphism means the caller uses one method name and each object's class supplies the behavior, so a training loop can stay the same while the model changes.`,
num: String.raw`One loop, <b>2 classes</b>, 2 different outputs. One <code>fit</code> function, <b>any number</b> of model classes.`,
r(fig, ctl) {
  let view = 0, k = 0;
  const AN = [["Dog(\"Rex\")", "Rex barks."], ["Cat(\"Mia\")", "Mia meows."], ["Animal(\"Generic\")", "Generic makes a sound."]];
  const MD = [["nn.Linear(3, 1)", "y = x @ W.T + b", "4 parameters"], ["TinyMLP()", "y = W2 relu(W1 x + b1) + b2", "26 parameters"], ["TinyCNN()", "y = fc(pool(relu(conv(x))))", "thousands of parameters"]];
  ctl.innerHTML = btns([[0, "animals"], [1, "models in one training loop"]], "v") + `<div id="pk"></div>`;
  const u = () => {
    pick(ctl, "v", view);
    const items = view === 0 ? AN : MD;
    $("pk").innerHTML = `<div class="row">${items.map((it, i) => `<button data-k="${i}" class="${i === k ? "on" : ""}"><code>${ML.esc(it[0])}</code></button>`).join("")}</div>`;
    $("pk").querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
    let s = ML.box(40, 20, 220, 56, "c-gray", ["the same call", view === 0 ? "animal.speak()" : "train(model, data)"], true) + arrow(270, 48, 330, 48, C.teal, 2);
    items.forEach((it, i) => { const y = 14 + i * 54; s += ML.box(340, y, 300, 44, i === k ? "c-teal" : "c-gray", [it[0] + (view === 0 ? "" : "   " + it[2])], false); if (i === k) s += tx(490, y + 60, view === 0 ? "runs its own speak" : "forward: " + it[1], "middle"); });
    fig.innerHTML = svg(190, s) + (view === 0 ? ML.code(["class Dog(Animal):", "    def speak(self):", "        return f\"{self.name} barks.\"", "class Cat(Animal):", "    def speak(self):", "        return f\"{self.name} meows.\"", "", "for animal in [Dog(\"Rex\"), Cat(\"Mia\")]:", "    print(animal.speak())"], -1) + ML.term(["Rex barks.", "Mia meows."]) : ML.code(["def train(model, x, y, steps=100):", "    opt = torch.optim.SGD(model.parameters(), lr=0.01)", "    for _ in range(steps):", "        model.train()", "        loss = ((model(x) - y) ** 2).mean()", "        opt.zero_grad(); loss.backward(); opt.step()", "    return loss.item()", "", "for model in [nn.Linear(3, 1), TinyMLP(), TinyCNN()]:", "    print(type(model).__name__, train(model, x, y))"], 4) + `<p class="note">The loop never mentions what is inside the model. It needs only the interface.</p>`);
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = +b.dataset.v; k = 0; u(); }); u();
}},

{s: "9. Encapsulation", t: "Encapsulation and composition",
intu: String.raw`Encapsulation groups state with the rules for changing it. The professor's Thermostat stores the value in <code>_temperature</code> and exposes <code>temperature</code> as a property whose setter checks the range, so an out-of-range assignment fails loudly, from the constructor or from outside. Composition is the other relationship: a station has a sensor, it is not a sensor, so it stores one and calls its method. Try the thermostat, then switch to the station and swap in a fake sensor without touching the station's code.`,
eq: String.raw`\[ \text{is a} \Rightarrow \text{inheritance}, \qquad \text{has a} \Rightarrow \text{composition} \]`,
sym: [["property", "a method that is read like an attribute"], ["setter", "the method that runs on assignment and can validate"], ["underscore prefix", "<code>_temperature</code>: a single underscore marks an internal detail by convention, not a lock"], ["composition", "an object stores another object and delegates to it"], ["abstraction", "<code>optimizer.step()</code> hides many updates behind one call with a clear contract"]],
how: ["Assigning <code>oven.temperature = 850.0</code> calls the setter, which checks 0 to 1000 and stores the float in _temperature.", "The constructor assigns through the same property, so the initial value obeys the same rule.", "Reading oven.temperature calls the getter and returns the stored value.", "The station takes a sensor object and calls sensor.read(). Any object with read() works, including a fake one for testing.", "A PyTorch model is both: it is a Module by inheritance and has layers by composition."],
say: String.raw`Encapsulation lets an object enforce rules on its own state through properties, and composition lets an object hold and delegate to another object instead of inheriting from it.`,
num: String.raw`Thermostat range <b>0 to 1000 °C</b>. The station returns the sensor's <b>23.5</b>, or whatever a substitute sensor reads.`,
r(fig, ctl) {
  let view = 0;
  ctl.innerHTML = btns([[0, "encapsulation: a validated property"], [1, "composition: a station has a sensor"]], "v") + `<div id="ec"></div>`;
  const u = () => {
    pick(ctl, "v", view);
    if (view === 0) {
      $("ec").innerHTML = sl("tv", "assign oven.temperature =", -200, 1300, 10, 850) + `<div id="ev"></div>`;
      const draw = () => {
        const v = +$("tv").value; $("tvv").textContent = v + " °C"; const ok = v >= 0 && v <= 1000;
        fig.innerHTML = svg(100, ML.box(40, 20, 200, 60, "c-gray", ["oven.temperature = " + v], true) + arrow(248, 50, 300, 50, ok ? C.teal : C.coral, 2) + ML.box(310, 20, 150, 60, "c-purple", ["setter", "0 <= value <= 1000 ?"], true) + arrow(468, 50, 520, 50, ok ? C.teal : C.coral, 2) + ML.box(530, 20, 110, 60, ok ? "c-teal" : "c-coral", [ok ? "_temperature" : "ValueError", ok ? v + ".0" : "rejected"], true)) + ML.code(["class Thermostat:", "    def __init__(self, temperature):", "        self.temperature = temperature      # goes through the setter", "    @property", "    def temperature(self):", "        return self._temperature", "    @temperature.setter", "    def temperature(self, value):", "        if not 0.0 <= value <= 1000.0:", "            raise ValueError(\"Use 0 to 1000 degrees C.\")", "        self._temperature = float(value)", "", "oven = Thermostat(800.0)", `oven.temperature = ${v}`, "print(oven.temperature)"], ok ? 10 : 9) + ML.term(ok ? [v + ".0"] : ["ValueError: Use 0 to 1000 degrees C."]);
      };
      $("tv").oninput = draw; draw();
    } else {
      $("ec").innerHTML = btns([[0, "real Sensor"], [1, "FakeSensor for a test"]], "s");
      let which = 0;
      const draw = () => {
        pick($("ec"), "s", which);
        fig.innerHTML = svg(100, ML.box(40, 20, 260, 60, "c-blue", ["ExperimentStation", "self.sensor = " + (which ? "FakeSensor()" : "Sensor())")], true) + arrow(308, 50, 360, 50, C.teal, 2) + tx(334, 42, "has a", "middle") + ML.box(370, 20, 270, 60, which ? "c-coral" : "c-teal", [which ? "FakeSensor" : "Sensor", "read() → " + (which ? "99.0 (fixed, for testing)" : "23.5")], true)) + ML.code(["class Sensor:", "    def read(self):", "        return 23.5", "", "class FakeSensor:", "    def read(self):", "        return 99.0", "", "class ExperimentStation:", "    def __init__(self, sensor):", "        self.sensor = sensor         # the station HAS a sensor", "    def measure(self):", "        return self.sensor.read()", "", `station = ExperimentStation(${which ? "FakeSensor()" : "Sensor()"})`, "print(station.measure())"], 12) + ML.term([which ? "99.0" : "23.5"]) + `<p class="note">The station's code did not change. Any object with a read method can be plugged in, which is how a pipeline is tested with a simulated component before the real instrument is attached.</p>`;
      };
      $("ec").querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { which = +b.dataset.s; draw(); }); draw();
    }
  };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = +b.dataset.v; u(); }); u();
}},

{s: "10. To nn.Module", t: "The road to nn.Module",
intu: String.raw`Everything in this lesson maps onto a PyTorch model. Click a row of the professor's table and the matching lines light up in a TinyRegressor, the model from HW4 Part 6. The class inherits from <code>nn.Module</code>, calls super so the module can register layers, stores layers as attributes in <code>__init__</code> by composition, and defines <code>forward</code> as the method that uses that state. The training loop then relies on the common interface, which is polymorphism. You now know how to read every model file the agent will write.`,
eq: String.raw`\[ \texttt{class TinyRegressor(nn.Module)}: \ \texttt{super().\_\_init\_\_()}, \ \texttt{self.layer = ...}, \ \texttt{def forward(self, x)} \]`,
sym: [["nn.Module", "the base class of every PyTorch model"], ["super in the initializer", "<code>super().__init__()</code> sets up registration so that layers assigned to self are found by parameters()"], ["self.layer1", "a child module held by composition"], ["forward(self, x)", "the method that computes the prediction from the stored layers"], ["model(x)", "calls forward through the Module's machinery"]],
how: ["Class and instance: TinyRegressor is the class, model = TinyRegressor() is one instance with its own weights.", "Attribute: self.layer1 is state stored on the instance, found later by forward.", "Inheritance: TinyRegressor(nn.Module) reuses the Module's parameters, to, train, eval and <code>state_dict</code>.", "Composition: the network has layers. The layers are themselves Modules.", "Polymorphism: one training loop calls model(x) for any Module."],
say: String.raw`A PyTorch model is a class that inherits from nn.Module, calls super in its initializer, stores its layers as attributes, and defines forward to compute from them.`,
num: String.raw`TinyRegressor from HW4: Linear(3, 5) has <b>20</b> parameters, Linear(5, 1) has <b>6</b>, total <b>26</b>. The number comes from the stored layers, not from forward.`,
note: String.raw`HW4 Part 7's buggy model had three faults: no super().__init__(), a shape mismatch between layers, and a forward with no return. All three are mistakes from this lesson.`,
r(fig, ctl) {
  const code = ["import torch.nn as nn", "", "class TinyRegressor(nn.Module):", "    def __init__(self):", "        super().__init__()", "        self.layer1 = nn.Linear(3, 5)", "        self.activation = nn.ReLU()", "        self.layer2 = nn.Linear(5, 1)", "", "    def forward(self, x):", "        x = self.layer1(x)", "        x = self.activation(x)", "        return self.layer2(x)", "", "model = TinyRegressor()", "prediction = model(torch.randn(5, 3))"];
  const T = [["Class / instance", "Fruit / apple", "TinyRegressor / model", [2, 14]], ["Attribute", "apple.colour", "model.layer1", [5, 6, 7]], ["Method", "apple.details()", "model.forward(x)", [9, 10, 11, 12]], ["Inheritance", "Bird(Animal)", "TinyRegressor(nn.Module)", [2, 4]], ["Composition", "Station has a sensor", "Network has layers", [5, 6, 7]], ["Polymorphism", "one speak() call", "one training function, model(x)", [15]]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}">${t[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const t = T[k];
    let s = "";
    T.forEach((r, i) => { const y = 18 + i * 30, on = i === k; s += `<rect x="30" y="${y - 14}" width="620" height="26" rx="5" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(44, y + 4, r[0], null, on ? "th" : "t") + tx(230, y + 4, r[1], null, "t") + tx(440, y + 4, r[2], null, "t"); });
    s += tx(230, 204, "ordinary Python", null) + tx(440, 204, "PyTorch", null);
    const body = code.map((l, i) => `<span style="display:block;${t[3].includes(i) ? "background:var(--accent-bg);box-shadow:inset 3px 0 var(--accent);" : "opacity:.55;"}padding-left:6px">${ML.hl(l) || " "}</span>`).join("");
    fig.innerHTML = svg(212, s) + `<pre class="codebox" style="padding-left:6px"><code>${body}</code></pre>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "11. With the agent", t: "Do it with the agent: a model class, done right",
intu: String.raw`A class with validated initialization, per-instance state, a method that uses it, a subclass with super, and tests that prove the aliasing and validation rules. Everything in this lesson in one file. When you read what the agent writes, find each of the five ideas and check it against the cards.`,
eq: String.raw`\[ \text{Scaler} \to \text{RobustScaler(Scaler)} \to \text{tests for state, validation, inheritance} \]`,
sym: [["Scaler", "fit stores mean and std on self, transform uses them"], ["validation", "transform before fit raises, a constant column raises"], ["RobustScaler", "a subclass that overrides fit to use median and IQR"], ["tests", "two instances keep separate state, errors are raised, the subclass reuses transform"]],
how: ["Paste the command. The scaler is the first real object in your project pipeline.", "Read <code>__init__</code>: does it create fresh state per instance and nothing shared on the class?", "Read fit and transform: does transform refuse to run before fit?", "Read the subclass: does it call <code>super().__init__()</code> and override only fit?", "Run pytest. Then make two scalers, fit each on different data, and confirm their means differ."],
say: String.raw`A scaler object stores training statistics as instance state, validates its use, and a subclass changes the statistics while reusing the rest.`,
num: String.raw`<b>2 classes, 5 tests</b>, and one deliberate check that two instances do not share a list or a mean.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "In src/scaling.py write class Scaler with __init__ that sets self.mean = None and self.std = None, fit(values: list[float]) that stores the mean and population standard deviation on self and raises ValueError for an empty list or zero standard deviation, transform(values) that returns [(v - mean) / std for v in values] and raises RuntimeError if fit was not called, and __repr__ showing the stored statistics. Then class RobustScaler(Scaler) that calls super().__init__() and overrides fit to store the median as self.mean and the interquartile range as self.std, reusing transform unchanged. Docstrings and type hints. In tests/test_scaling.py: transform before fit raises RuntimeError, a constant list raises ValueError, two Scaler instances fitted on different lists keep different means, RobustScaler is an instance of Scaler, and RobustScaler.transform works after its fit. Run python -m pytest -q tests/test_scaling.py and paste the output.",
    actions: ["$ python -m pytest -q tests/test_scaling.py", ".....                                                    [100%]", "5 passed in 0.02s"],
    code: "class Scaler:\n    \"\"\"Standardize values with statistics learned by fit.\"\"\"\n    def __init__(self) -> None:\n        self.mean: float | None = None\n        self.std: float | None = None\n\n    def transform(self, values: list[float]) -> list[float]:\n        if self.mean is None:\n            raise RuntimeError(\"call fit before transform\")\n        return [(v - self.mean) / self.std for v in values]\n\nclass RobustScaler(Scaler):\n    def __init__(self) -> None:\n        super().__init__()",
    checks: ["state is created in __init__ on self, nothing mutable sits in the class body", "transform checks that fit ran and raises RuntimeError otherwise", "RobustScaler calls super().__init__() and overrides only fit", "the two-instance test proves that fitting one scaler does not change the other", "pytest reports 5 passed"]
  });
}},

{s: "12. Test", t: "Test: classes and objects",
intu: String.raw`Twelve questions on classes, instances, self, attributes, defaults, inheritance, polymorphism and the mapping to nn.Module.`,
eq: String.raw`\[ \text{class} \to \text{instance} \to \text{self} \to \text{attribute} \]`,
sym: [["pass mark", "10 of 12"]],
how: ["Ask whether a name is local, an attribute, or a class attribute.", "Ask which class a method is looked up on.", "Ask whether two names are two objects."],
say: String.raw`I can read a class, trace what an instance holds, and explain why a PyTorch model is written the way it is.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does executing a class definition create?", o: ["One instance", "The class object, no instances", "An instance per method", "Nothing until __init__ runs"], a: 1, why: "The class statement creates the class. Instances come from calling it." },
    { q: "What does this print?", code: "class Fruit:\n    def __init__(self, name):\n        name = name\n\nf = Fruit(\"apple\")\nprint(hasattr(f, \"name\"))", o: ["True", "False", "apple", "Error"], a: 1, why: "name = name rebinds the local. Only self.name = name would store an attribute." },
    { q: "<code>apple.details()</code> is equivalent to:", o: ["Fruit.details()", "Fruit.details(apple)", "details(Fruit)", "apple.Fruit.details"], a: 1, why: "A method call through an instance passes that instance as self." },
    { q: "In describe, <code>unit = \"degrees C\"</code> is assigned. Can another method read unit?", o: ["Yes, methods share locals", "No, it is local to that call unless saved on self", "Only if the class is small", "Yes, through hasattr"], a: 1, why: "Locals belong to one call. Save it as self.unit or pass it explicitly." },
    { q: "What does this print?", code: "class E:\n    log = []\n    def __init__(self, k):\n        self.k = k\n\na, b = E(1), E(2)\na.log.append(9)\nprint(b.log)", o: ["[]", "[9]", "Error", "None"], a: 1, why: "log is a class attribute, one list shared by all instances. Use self.log = [] in __init__." },
    { q: "<code>second = apple; second.colour = \"blue\"</code>. What is apple.colour?", o: ["Its old value", "'blue'", "Error", "None"], a: 1, why: "second is an alias of the same instance." },
    { q: "Which is the correct way to validate in an initializer?", o: ["Return False from __init__", "Raise ValueError before storing attributes", "Store the value and check it in every method", "Print a warning"], a: 1, why: "__init__ returns None. Raising immediately keeps the object from starting in an invalid state." },
    { q: "In <code>class Bird(Animal)</code>, what does <code>super().__init__(name)</code> do?", o: ["Creates a second instance", "Runs Animal's initializer on this instance", "Copies Animal", "Calls Bird's own __init__ again"], a: 1, why: "super delegates to the next class in the lookup order, here Animal, on the same instance." },
    { q: "Dog and Cat both override speak. The loop <code>for a in [Dog(), Cat()]: a.speak()</code> shows:", o: ["Polymorphism: each instance's class decides the behavior", "Encapsulation", "Composition", "An error, since speak is ambiguous"], a: 0, why: "One method name, behavior chosen by the instance's class." },
    { q: "A station stores a sensor and calls sensor.read(). This relationship is:", o: ["Inheritance, is a", "Composition, has a", "Polymorphism", "Aliasing"], a: 1, why: "The station has a sensor. It does not inherit from Sensor." },
    { q: "Why does a PyTorch model call <code>super().__init__()</code> first?", o: ["To make it faster", "So that layers assigned to self are registered and found by parameters()", "It is optional", "To create the input tensor"], a: 1, why: "nn.Module's initializer sets up the registration machinery. Without it, assigning a layer fails." },
    { q: "In TinyRegressor, which line is composition?", o: ["class TinyRegressor(nn.Module)", "self.layer1 = nn.Linear(3, 5)", "def forward(self, x)", "model = TinyRegressor()"], a: 1, why: "The network has a layer stored as an attribute. Inheriting from nn.Module is the is-a relationship." }
  ], "Lesson 6 test");
}}
],
summary: String.raw`A class defines a type and its methods, and each call to the class makes an instance with its own attributes, so the methods are shared and the state is not. self is the instance a method runs on, and assigning to self dot something turns a local into persistent state, while a plain local dies with the call. Class attributes are shared defaults, and a mutable one is a trap. The initializer validates, converts and stores, and never returns a value. A subclass reuses the base class through super and overrides what differs, and a caller that relies on a small interface gets polymorphism, which is why one training loop fits every model. Properties enforce rules on state, composition lets an object hold another, and a PyTorch model uses all of it: it is a Module, has layers, and computes in forward.`,
sheet: [
[String.raw`\[ \texttt{class C:} \to \text{class object}, \qquad \texttt{C(...)} \to \text{instance} \]`, "Definition versus instantiation"],
[String.raw`\[ \texttt{obj.m()} \equiv \texttt{C.m(obj)} \]`, "What self is"],
[String.raw`\[ \texttt{x = v} \to \text{local}, \qquad \texttt{self.x = v} \to \text{attribute} \]`, "Local versus state"],
[String.raw`\[ \texttt{class Sub(Base)}, \quad \texttt{super().\_\_init\_\_(...)} \]`, "Inheritance and super"],
[String.raw`\[ \text{is a} \Rightarrow \text{inherit}, \qquad \text{has a} \Rightarrow \text{compose} \]`, "The design question"],
[String.raw`\[ \texttt{class M(nn.Module)}: \ \texttt{super().\_\_init\_\_()}, \ \texttt{self.layer}, \ \texttt{forward} \]`, "The PyTorch pattern"]],
sources: ["AME 5970 Lecture 4 notes, chapter 2, sections 2.1 to 2.10 (Object-oriented Python): the Fruit, Sample, Experiment, Reading, Animal, Thermostat and Station examples, followed in order", "AME 5970 HW4 Parts 4 to 7 (Car class, Dog(Animal), TinyRegressor, debugging a buggy Module)", "The Python Tutorial, section 9 (classes)", "Ramalho, Fluent Python, 2nd ed., chapters 11 to 14 (a Pythonic object, interfaces, inheritance)", "PyTorch documentation, nn.Module and the model-building tutorial"]
});
})();
