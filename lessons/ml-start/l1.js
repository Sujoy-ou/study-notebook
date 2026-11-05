(function () {
/* ML shelf, Part 1, Lesson 1: What machine learning is. Follows AME 5970 Lecture 1 (notes and slides) and Andrew Ng, ML Specialization course 1 week 1. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
/* a small deterministic fruit dataset: [mass g, color score, class] with 0 apple, 1 orange, 2 lemon */
const R = (s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; })(5970);
const FRUIT = [];
[[190, 0.45, 22, 0.08, 0], [148, 0.80, 14, 0.06, 1], [92, 0.90, 10, 0.05, 2]].forEach(([m, c, sm, sc, k]) => { for (let i = 0; i < 20; i++) { const u1 = R(), u2 = R(), u3 = R(), u4 = R(); const g1 = Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(2 * Math.PI * u2), g2 = Math.sqrt(-2 * Math.log(u3 + 1e-9)) * Math.cos(2 * Math.PI * u4); FRUIT.push([Math.round(m + sm * g1), +(c + sc * g2).toFixed(2), k]); } });
const FC = [C.coral, C.amber, C.teal], FN = ["apple", "orange", "lemon"];

addLesson("ml", "start", {
level: "Foundations", num: "Lesson 1",
id: "ml-start-l1", title: "What machine learning is", short: "1. What machine learning is",
big: String.raw`A program learns when its performance at a task improves with experience, and the improvement must show on examples it has not seen. That one sentence carries the whole course. It says there is a task, data to learn from and a measure to judge by. It separates a learned model from a written rule. It explains why data is split before anything is fitted, why a scaler fitted on the whole table leaks the answer, and why a test score only speaks for the conditions the test data came from. This lesson follows the first lecture of the course with the same fruit sorting example, and every card has a picture you can push on.`,
bridge: String.raw`The professor's Lecture 1 and Andrew Ng's first week cover the same ground. Ng's definition of learning, his split of supervised versus unsupervised, and his housing and spam examples all appear here beside the course's fruit, alloy and furnace examples.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Learning", t: "Learning means measurable improvement",
intu: String.raw`Tom Mitchell's definition, which both the professor and Ng use: a program learns from experience E with respect to a task T and performance measure P if its performance at T, measured by P, improves with E. Pick a system and read its T, E and P. Then look at the thermostat: it behaves sensibly, but its thresholds were typed in by a person, so nothing improved with experience. It did not learn. The last check is the one people forget: improvement must show on unseen examples, or the system has only memorized.`,
eq: String.raw`\[ \text{learns} \iff P(T) \text{ improves as } E \text{ grows, measured on examples not in } E \]`,
sym: [["T", "the task: what the system must do, such as classify a digit"], ["E", "the experience: the data it learns from, such as labeled digit images"], ["P", "the performance measure: how improvement is judged, such as accuracy on unseen digits"], ["unseen", "examples that were not used for fitting. Memorizing E is not learning."]],
how: ["Name the task as an input to output question.", "Name the experience: which examples, with what feedback.", "Name the measure, and ask who feels the consequences when it is wrong. A click is not satisfaction.", "Ask whether performance improved because of the data. If a person set the behavior, it is a rule, not learning.", "Ask whether the improvement holds on new examples. That is the generalization clause."],
say: String.raw`A system learns when its performance on a task, judged by a stated measure, improves with experience, and the improvement is checked on examples it did not learn from.`,
num: String.raw`Ng's spam example: T is classify email, E is a set of emails labeled spam or not, P is the fraction of new emails classified correctly. The classic digit example reaches <b>99 %</b> on unseen digits, which counts because the digits were unseen.`,
note: String.raw`Exam question seen on the practice midterms: give T, E and P for a defect detector. Answer with all three and add the unseen-data clause.`,
r(fig, ctl) {
  const S = [["Spam filter", "separate spam from mail", "messages labeled spam or not, plus user reports", "false positives and false negatives on new mail", true], ["Autocorrect", "suggest the intended word", "your edits and accepted suggestions", "fewer wrong corrections next week", true], ["Navigation", "estimate the route time", "traffic and trip histories", "arrival time error on new trips", true], ["Fruit sorter", "assign fruit type from measurements", "measured fruits with known type", "accuracy on fruits not in the training set", true], ["Thermostat", "keep the room at 21 °C", "none, the thresholds were typed in", "comfort, but it never changed with data", false]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${S.map((s, i) => `<button data-k="${i}">${s[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    const s = S[k];
    let g = "";
    [["Task T", s[1], C.blue], ["Experience E", s[2], C.amber], ["Performance P", s[3], C.teal]].forEach(([h, t, c], i) => { const y = 20 + i * 62; g += `<rect x="30" y="${y}" width="620" height="50" rx="8" fill="${c}" fill-opacity="0.14" stroke="${c}"/>` + tx(44, y + 22, h, null, "th") + tx(44, y + 42, t, null, "t"); });
    g += `<rect x="30" y="210" width="620" height="44" rx="8" fill="${s[4] ? "var(--teal-bg)" : "var(--coral-bg)"}" stroke="${s[4] ? C.teal : C.coral}"/>` + tx(340, 237, s[4] ? "Learns: P on new examples improves as E grows" : "Does not learn: behavior came from a person, not from E", "middle", "th");
    fig.innerHTML = svg(266, g);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  u();
}},

{s: "2. Rules or models", t: "Rules are written, models learn from examples",
intu: String.raw`A rule-based fraud check is a sentence a person wrote: flag any transaction above a threshold. A learned model estimates the boundary from labeled examples instead. Drag the rule's threshold and see how many fraud cases (orange) it catches and how many honest ones (blue) it flags. Then switch to the learned boundary, which uses both amount and the hour of the day and was placed by the examples. Rules are transparent and brittle. Models combine signals and depend on the data. Real systems use both: hard rules for law and safety, a learned score for patterns, a person for the uncertain cases.`,
eq: String.raw`\[ \text{rule:}\ \texttt{if amount} \gt T \ \texttt{then flag} \qquad \text{model:}\ \text{risk} = f_\theta(\text{amount}, \text{hour}, \ldots) \]`,
sym: [["rule", "logic written by a person, true in the cases they thought of"], [String.raw`\(f_\theta\)`, "a model with parameters \\(\\theta\\) estimated from examples"], ["boundary", "the surface where the model's decision changes"], ["hybrid", "rules for constraints, model for patterns, human for the hard cases"]],
how: ["A rule is one threshold on one feature. Move it and one error type trades against the other.", "The learned boundary is tilted because it uses two features at once. It separates more cases than any single threshold.", "Its position depends entirely on the examples. Bad labels or a shifted population move it.", "Ask where a surprising decision came from: a rule, a pattern in the data, the objective, or their interaction."],
say: String.raw`A rule encodes what a person specified, a model encodes a pattern estimated from examples, and most working systems combine both with a human for uncertain cases.`,
num: String.raw`In the picture the best single threshold leaves about <b>5 mistakes</b>, the learned two-feature boundary about <b>1</b>. Count them yourself with the slider.`,
r(fig, ctl) {
  const pts = []; const r2 = (s => () => { s = (s * 48271) % 2147483647; return s / 2147483647; })(42);
  for (let i = 0; i < 26; i++) pts.push([200 + 2400 * r2(), 6 + 16 * r2(), 0]);
  for (let i = 0; i < 12; i++) pts.push([2200 + 2800 * r2(), (r2() < 0.75 ? 0 + 6 * r2() : 10 + 10 * r2()), 1]);
  let mode = "rule";
  ctl.innerHTML = btns([["rule", "Written rule"], ["model", "Learned boundary"]], "m") + sl("th", "rule threshold ($)", 500, 5000, 50, 2500) + `<div id="fr"></div>`;
  const u = () => {
    pick(ctl, "m", mode);
    const T = +$("th").value; $("thv").textContent = "$" + T;
    const A = ML.axes(70, 20, 560, 220, { xmin: 0, xmax: 5000, ymin: 0, ymax: 24, nx: 5, ny: 4, fx: x => "$" + Math.round(x), fy: y => Math.round(y), xl: "amount ($)", yl: "hour of day" });
    let s = A.s;
    const flag = p => mode === "rule" ? p[0] > T : (p[0] - 2200) / 1400 - (p[1] - 8) / 10 > 0.2;
    let fp = 0, fn = 0;
    pts.forEach(p => { const f = flag(p), bad = f !== (p[2] === 1); if (bad) p[2] ? fn++ : fp++; s += `<circle cx="${A.X(p[0])}" cy="${A.Y(p[1])}" r="6" fill="${p[2] ? C.amber : C.blue}" stroke="${bad ? C.coral : "var(--panel)"}" stroke-width="${bad ? 2.5 : 1}"/>`; });
    if (mode === "rule") s += `<line x1="${A.X(T)}" y1="20" x2="${A.X(T)}" y2="240" stroke="${C.coral}" stroke-width="2" stroke-dasharray="6 4"/>` + tx(A.X(T) + 6, 34, "flag →", null, "th");
    else { const x1 = 0, y1 = 8 + 10 * ((x1 - 2200) / 1400 - 0.2), x2 = 5000, y2 = 8 + 10 * ((x2 - 2200) / 1400 - 0.2); s += `<line x1="${A.X(x1)}" y1="${A.Y(Math.max(0, Math.min(24, y1)))}" x2="${A.X(x2)}" y2="${A.Y(Math.max(0, Math.min(24, y2)))}" stroke="${C.coral}" stroke-width="2" stroke-dasharray="6 4"/>`; }
    s += tx(90, 292, "blue: honest", null) + tx(200, 292, "orange: fraud", null) + tx(320, 292, "red ring: mistake", null);
    fig.innerHTML = svg(300, s);
    $("fr").innerHTML = ML.readout([["honest flagged (false positives)", fp], ["fraud missed (false negatives)", fn], ["total mistakes", fp + fn]]);
  };
  $("th").oninput = u; ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; u(); }); u();
}},

{s: "3. Representation", t: "Representation is the bridge: the model sees only numbers",
intu: String.raw`A fruit is not a number. Before anything can be learned, someone decides which measurements become the columns. That choice is the representation, and a model can only use what is in it. Choose which two features to plot for the sorting station's fruit. With mass and color the three types separate. With width and height alone the oranges and apples overlap, and no model can undo that, because the information was discarded before learning. Deep learning moves part of this choice into the model, which learns features from raw pixels, but it still cannot recover what the sensor never recorded.`,
eq: String.raw`\[ \text{physical object} \xrightarrow{\ \text{measure}\ } \mathbf{x} \in \mathbb{R}^p \xrightarrow{\ \text{learn}\ } \hat{y} \]`,
sym: [[String.raw`\(\mathbf{x}\)`, "the feature vector: the numbers that represent one object"], [String.raw`\(p\)`, "number of features, here mass, width, height and color score"], ["feature design", "choosing and computing the columns, by hand or by a learned layer"], ["separable", "classes that a boundary can divide in the chosen representation"]],
how: ["List what can be measured at decision time. The sorting station has a scale, a camera and a gauge.", "Turn each into a number with a unit: mass in grams, color as a score from 0 to 1.", "Plot pairs of features by class. Where classes overlap in every pair, the representation is missing something.", "A richer sensor, a derived feature such as a ratio, or a learned representation can add what is missing. Wishful thinking cannot."],
say: String.raw`The representation is the set of numbers a model receives, and information left out of it cannot be recovered by any amount of learning.`,
num: String.raw`Typical values in the picture: apples about <b>190 g</b> with color 0.45, oranges <b>150 g</b> with 0.80, lemons <b>90 g</b> with 0.90. Mass alone already separates lemons from apples, and color separates apples from the rest.`,
r(fig, ctl) {
  const feats = ["mass (g)", "color score", "width (cm)", "height (cm)"];
  const val = (p, j) => j === 0 ? p[0] : j === 1 ? p[1] : j === 2 ? 4.5 + p[0] / 60 + 0.3 * Math.sin(p[0]) : 5 + p[0] / 70 + (p[2] === 2 ? 1.4 : 0) + 0.3 * Math.cos(p[1] * 40);
  const rng = [[60, 240], [0.3, 1.05], [5, 9], [5, 10]];
  let a = 0, b = 1;
  ctl.innerHTML = `<div class="row"><label>horizontal</label>${feats.map((f, i) => `<button data-a="${i}">${f}</button>`).join("")}</div><div class="row"><label>vertical</label>${feats.map((f, i) => `<button data-b="${i}">${f}</button>`).join("")}</div><div id="rp"></div>`;
  const u = () => {
    pick(ctl, "a", a); pick(ctl, "b", b);
    const A = ML.axes(70, 20, 540, 230, { xmin: rng[a][0], xmax: rng[a][1], ymin: rng[b][0], ymax: rng[b][1], nx: 4, ny: 4, fx: x => +x.toFixed(a === 1 ? 2 : 0), fy: y => +y.toFixed(b === 1 ? 2 : 0), xl: feats[a], yl: feats[b] });
    let s = A.s;
    FRUIT.forEach(p => { s += `<circle cx="${A.X(val(p, a))}" cy="${A.Y(val(p, b))}" r="5.5" fill="${FC[p[2]]}" fill-opacity="0.85" stroke="var(--panel)"/>`; });
    FN.forEach((n, i) => { s += `<circle cx="${110 + i * 110}" cy="272" r="5" fill="${FC[i]}"/>` + tx(120 + i * 110, 276, n); });
    fig.innerHTML = svg(286, s);
    const sep = (a === 0 || b === 0) && (a === 1 || b === 1) ? "all three classes separate" : (a === 0 || b === 0) ? "lemons separate by mass, apples and oranges nearly" : (a === 1 || b === 1) ? "apples separate by color, oranges and lemons overlap" : "apples and oranges overlap, no boundary fixes this";
    $("rp").innerHTML = `<p class="note"><b>In this representation:</b> ${sep}.</p>`;
  };
  ctl.querySelectorAll("button[data-a]").forEach(x => x.onclick = () => { a = +x.dataset.a; u(); });
  ctl.querySelectorAll("button[data-b]").forEach(x => x.onclick = () => { b = +x.dataset.b; u(); });
  u();
}},

{s: "4. Three settings", t: "Learning settings differ by the feedback they get",
intu: String.raw`Ask what tells the learner whether it is doing well. In supervised learning every example comes with a target y, and the learner fits a map from x to y. In unsupervised learning there is only x, and the learner finds structure: groups, directions, outliers. In reinforcement learning an agent acts, the environment answers with a reward, and the reward may come late. Click a setting to see its picture, then click the examples and name the feedback signal, not the application area.`,
eq: String.raw`\[ \text{supervised: } (\mathbf{x}, y) \to f_\theta \qquad \text{unsupervised: } \{\mathbf{x}\} \to \text{structure} \qquad \text{reinforcement: } s_t \xrightarrow{a_t} r_t, s_{t+1} \]`,
sym: [[String.raw`\(y\)`, "the target that comes with each example in supervised learning"], ["structure", "clusters, low-dimensional directions, densities or anomalies found without y"], [String.raw`\(s_t, a_t, r_t\)`, "state, action and reward at step t in reinforcement learning"], ["policy", "the map from state to action that reinforcement learning learns"]],
how: ["Look for a target column. If one exists and the goal is to predict it, the setting is supervised.", "If there is no target and the goal is to organize the observations, it is unsupervised.", "If the system chooses actions and learns from a reward signal over time, it is reinforcement.", "One application can mix settings: a robot uses supervised vision and reinforcement control.", "Ng's examples: housing price and spam are supervised, grouping news articles and the cocktail party problem are unsupervised."],
say: String.raw`Supervised learning gets a target for every example, unsupervised learning gets only the inputs and looks for structure, and reinforcement learning gets a reward for actions taken in an environment.`,
num: String.raw`Practice from the lecture: alloy strength from composition is <b>supervised regression</b>, grouping micrographs without labels is <b>unsupervised</b>, furnace control with a reward per batch is <b>reinforcement</b>, flagging unusual server behavior from normal histories is <b>unsupervised anomaly detection</b>, fruit type from labeled records is <b>supervised classification</b>.`,
r(fig, ctl) {
  const EX = [["Alloy strength from composition and processing", 0, "a measured strength is the target"], ["Group micrographs with no phase labels", 1, "only images, no target"], ["Furnace controls with an energy and quality reward per batch", 2, "actions and a delayed reward"], ["Flag unusual server behavior from normal histories", 1, "no labels for the unusual cases, structure of normal x"], ["Fruit type from labeled measurement records", 0, "the fruit type is the target"], ["Which news articles belong together", 1, "no categories given, group by content"]];
  let k = 0, ex = -1;
  ctl.innerHTML = btns([[0, "Supervised"], [1, "Unsupervised"], [2, "Reinforcement"]], "k") + `<div class="row">${EX.map((e, i) => `<button data-e="${i}" style="font-size:13px">${e[0]}</button>`).join("")}</div><div id="fb"></div>`;
  const u = () => {
    pick(ctl, "k", k); pick(ctl, "e", ex);
    let s = "";
    if (k === 0) { s = ML.box(30, 40, 150, 56, "c-blue", ["examples", "(x, y) pairs"]) + arrow(184, 68, 236, 68, "var(--p)", 2) + ML.box(240, 40, 150, 56, "c-purple", ["learn f", "fit θ to reduce error"]) + arrow(394, 68, 446, 68, "var(--p)", 2) + ML.box(450, 40, 180, 56, "c-teal", ["predict ŷ", "for a new x"]) + tx(340, 130, "feedback: the target y on every training example", "middle", "t"); }
    else if (k === 1) { s = ML.box(30, 40, 150, 56, "c-blue", ["observations", "x only"]) + arrow(184, 68, 236, 68, "var(--p)", 2) + ML.box(240, 40, 150, 56, "c-purple", ["find structure", "groups, directions"]) + arrow(394, 68, 446, 68, "var(--p)", 2) + ML.box(450, 40, 180, 56, "c-teal", ["interpret", "with domain evidence"]) + tx(340, 130, "feedback: none from a target, only the geometry of x", "middle", "t"); }
    else { s = ML.box(60, 30, 200, 56, "c-purple", ["agent", "policy: state → action"]) + ML.box(420, 30, 200, 56, "c-blue", ["environment", "process, robot, experiment"]) + `<path d="M264 46 L416 46" stroke="var(--p)" stroke-width="2" marker-end="url(#ar)"/>` + tx(340, 40, "action a_t", "middle") + `<path d="M416 72 L264 72" stroke="${C.amber}" stroke-width="2" marker-end="url(#ar)"/>` + tx(340, 90, "reward r_t and next state", "middle") + tx(340, 130, "feedback: a reward, often sparse and delayed, for actions taken", "middle", "t"); }
    fig.innerHTML = svg(146, s);
    $("fb").innerHTML = ex < 0 ? `<p class="note">Click an example and say which setting it is before reading the answer.</p>` : `<p class="note"><b>${["Supervised", "Unsupervised", "Reinforcement"][EX[ex][1]]}.</b> ${EX[ex][2]}.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { ex = +b.dataset.e; k = EX[ex][1]; u(); });
  u();
}},

{s: "5. Class or number", t: "Classification asks which, regression asks how much",
intu: String.raw`Inside supervised learning the type of the target decides everything downstream. If y is one of a finite set of categories, the task is classification: the model outputs scores or probabilities and a rule turns them into a decision. If y is a number with a unit, the task is regression: the error has a magnitude and a unit, and the pattern of residuals tells you where the model is wrong. Switch between the two on the same fruit. The data is the same, the question is not.`,
eq: String.raw`\[ \text{classification: } y \in \{\text{apple}, \text{orange}, \text{lemon}\} \qquad \text{regression: } y \in \mathbb{R},\ \text{e.g. mass in g} \]`,
sym: [["classification", "target is a category. Output: class scores, then a decision."], ["regression", "target is a number. Output: a value in the target's unit."], ["residual", String.raw`\(y - \hat{y}\) for regression, with the unit of y`], ["encoded class", "0, 1, 2 standing for apple, orange, lemon is still categorical"]],
how: ["Read the meaning of y, not its storage type. A class stored as 0, 1, 2 is not a number to regress.", "For classification, the picture is a boundary between regions and the error is a count of wrong labels.", "For regression, the picture is a fitted curve and the error is a distance with a unit, such as grams.", "The loss, the output layer and the metric all follow from this choice, which is why it comes first."],
say: String.raw`Classification predicts a category and is judged by which examples it gets wrong, regression predicts a number and is judged by how far off it is in the target's unit.`,
num: String.raw`Regression in the picture: predict mass from width. Typical residuals are <b>about 15 g</b>. Classification: predict the type from mass and color, with <b>0 or 1 wrong</b> among 60.`,
r(fig, ctl) {
  let mode = 0;
  ctl.innerHTML = btns([[0, "Classification: which fruit?"], [1, "Regression: how heavy?"]], "m") + `<div id="cr"></div>`;
  const width = p => 4.5 + p[0] / 60 + 0.3 * Math.sin(p[0]);
  const u = () => {
    pick(ctl, "m", mode);
    let s = "";
    if (mode === 0) {
      const A = ML.axes(70, 20, 540, 220, { xmin: 60, xmax: 240, ymin: 0.3, ymax: 1.05, nx: 4, ny: 3, fx: x => Math.round(x), fy: y => y.toFixed(2), xl: "mass (g)", yl: "color score" });
      s = A.s + `<path d="M${A.X(60)} ${A.Y(0.66)} L${A.X(240)} ${A.Y(0.60)}" stroke="var(--p)" stroke-dasharray="6 4"/><path d="M${A.X(118)} ${A.Y(1.05)} L${A.X(122)} ${A.Y(0.3)}" stroke="var(--p)" stroke-dasharray="6 4"/>`;
      FRUIT.forEach(p => { s += `<circle cx="${A.X(p[0])}" cy="${A.Y(p[1])}" r="5.5" fill="${FC[p[2]]}" stroke="var(--panel)"/>`; });
      s += tx(A.X(190), A.Y(0.42), "apple region", "middle") + tx(A.X(190), A.Y(0.98), "orange region", "middle") + tx(A.X(85), A.Y(0.98), "lemon region", "middle");
      $("cr").innerHTML = ML.readout([["output", "one of three classes"], ["error", "count of wrong labels"], ["picture", "regions and boundaries"]]);
    } else {
      const A = ML.axes(70, 20, 540, 220, { xmin: 5, xmax: 9, ymin: 60, ymax: 240, nx: 4, ny: 3, fx: x => x.toFixed(1), fy: y => Math.round(y), xl: "width (cm)", yl: "mass (g)" });
      s = A.s;
      let sx = 0, sy = 0, sxx = 0, sxy = 0, n = FRUIT.length; FRUIT.forEach(p => { const w = width(p); sx += w; sy += p[0]; sxx += w * w; sxy += w * p[0]; });
      const b1 = (n * sxy - sx * sy) / (n * sxx - sx * sx), b0 = (sy - b1 * sx) / n;
      FRUIT.forEach(p => { const w = width(p); s += `<line x1="${A.X(w)}" y1="${A.Y(p[0])}" x2="${A.X(w)}" y2="${A.Y(b0 + b1 * w)}" stroke="${C.gray}" stroke-width="1"/><circle cx="${A.X(w)}" cy="${A.Y(p[0])}" r="4.5" fill="${C.blue}" stroke="var(--panel)"/>`; });
      s += ML.path([[A.X(5), A.Y(b0 + 5 * b1)], [A.X(9), A.Y(b0 + 9 * b1)]], C.coral, 2.5);
      let rss = 0; FRUIT.forEach(p => { const e = p[0] - (b0 + b1 * width(p)); rss += e * e; });
      $("cr").innerHTML = ML.readout([["output", "a mass in grams"], ["error", "RMSE " + Math.sqrt(rss / n).toFixed(1) + " g"], ["picture", "a fitted line and residuals"]]);
    }
    fig.innerHTML = svg(266, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = +b.dataset.m; u(); }); u();
}},

{s: "6. X and y", t: "Rows are samples, columns are features",
intu: String.raw`With n fruits and p measurements each, the feature matrix X has n rows and p columns, and the target y has n entries. Click any cell to see what it is: one row is one fruit, one column is one measurement across all fruits, one entry is one measurement of one fruit. This shape convention runs through the whole course. Every NumPy array, every PyTorch batch, every loss function assumes rows are samples. The warning at the bottom matters for your project: ten crops cut from one specimen are ten rows but not ten independent samples.`,
eq: String.raw`\[ X \in \mathbb{R}^{n \times p}, \qquad y \in \mathcal{C}^{\,n} \text{ or } \mathbb{R}^{n}, \qquad \mathbf{x}_i = \text{row } i \text{ of } X \]`,
sym: [[String.raw`\(n\)`, "number of samples, the rows"], [String.raw`\(p\)`, "number of features, the columns"], [String.raw`\(X_{ij}\)`, "feature j of sample i"], [String.raw`\(\mathbf{x}_i\)`, "all features of sample i, a vector of length p"], [String.raw`\(y_i\)`, "the target of sample i"]],
how: ["Write the shape before writing code: X is (n, p), y is (n,).", "A row is one independent observational unit. If rows share a specimen, batch or machine, they are not independent.", "A column has one unit and one meaning. Mixed units in a column are a data bug.", "The target is a separate vector, never a column of X, or the model would see the answer."],
say: String.raw`X has one row per sample and one column per feature, y has one entry per sample, and a row is only a sample if it is an independent unit of observation.`,
num: String.raw`The lecture's practice question: 240 fruits with 4 measurements give X of shape <b>(240, 4)</b> and y of shape <b>(240,)</b>.`,
note: String.raw`Independence decides how you split. Rows from the same specimen go to the same split, or the test score is optimistic. The lecture calls this splitting at the physical-unit level.`,
r(fig, ctl) {
  const rows = [[192, 7.3, 7.1, 0.46, "apple"], [146, 6.8, 6.6, 0.81, "orange"], [91, 5.4, 7.8, 0.89, "lemon"], [205, 7.6, 7.0, 0.52, "apple"], [139, 6.5, 6.4, 0.78, "orange"]];
  const cols = ["mass_g", "width_cm", "height_cm", "color"];
  let sel = null;
  ctl.innerHTML = `<div id="xy"></div>`;
  const u = () => {
    let s = tx(40, 24, "X: n = 5 samples × p = 4 features", null, "th") + tx(520, 24, "y: n targets", null, "th");
    cols.forEach((c, j) => s += tx(70 + j * 100 + 40, 50, c, "middle"));
    rows.forEach((r, i) => {
      const y = 60 + i * 38;
      s += tx(44, y + 24, "i = " + i, null);
      r.slice(0, 4).forEach((v, j) => { const x = 70 + j * 100; const on = sel && ((sel.t === "cell" && sel.i === i && sel.j === j) || (sel.t === "row" && sel.i === i) || (sel.t === "col" && sel.j === j)); s += `<rect x="${x}" y="${y}" width="92" height="32" rx="4" fill="${on ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${on ? "var(--accent)" : "var(--line)"}" data-i="${i}" data-j="${j}" style="cursor:pointer"/>` + tx(x + 46, y + 21, v, "middle", "t"); });
      const onY = sel && sel.t === "y" && sel.i === i;
      s += `<rect x="520" y="${y}" width="110" height="32" rx="4" fill="${onY ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${onY ? C.teal : "var(--line)"}" data-y="${i}" style="cursor:pointer"/>` + tx(575, y + 21, r[4], "middle", "t");
    });
    s += tx(40, 268, "click a cell. Shift-click a cell to select its row, Alt-click to select its column.", null);
    fig.innerHTML = svg(280, s);
    fig.querySelectorAll("rect[data-i]").forEach(r => r.onclick = e => { sel = { t: e.shiftKey ? "row" : e.altKey ? "col" : "cell", i: +r.dataset.i, j: +r.dataset.j }; u(); });
    fig.querySelectorAll("rect[data-y]").forEach(r => r.onclick = () => { sel = { t: "y", i: +r.dataset.y }; u(); });
    const msg = !sel ? "nothing selected" : sel.t === "cell" ? `X[${sel.i}, ${sel.j}] = ${rows[sel.i][sel.j]}: feature ${cols[sel.j]} of sample ${sel.i}` : sel.t === "row" ? `X[${sel.i}, :] = [${rows[sel.i].slice(0, 4).join(", ")}]: all features of one fruit, the vector x_${sel.i} of length p = 4` : sel.t === "col" ? `X[:, ${sel.j}]: the feature ${cols[sel.j]} across all n = 5 fruits, one unit throughout` : `y[${sel.i}] = "${rows[sel.i][4]}": the target of sample ${sel.i}`;
    $("xy").innerHTML = ML.readout([["selection", msg], ["shapes", "X (5, 4), y (5,)"]]);
  };
  u();
}},

{s: "7. Split, then fit", t: "Split before fitting, or the test set leaks into the model",
intu: String.raw`Training data fit the parameters and every fitted preprocessing statistic. Validation data choose between models, features and thresholds. Test data are used once, at the end, for the final estimate. Leakage is any information crossing those lines. The clearest case is the one in the lecture: a scaler fitted on the whole table before the split. Step through the two orders. In the wrong order the scaler's mean and standard deviation already contain the test rows, so the model has seen a summary of its exam. The numbers are small here. The habit matters because in a real project the leak is invisible.`,
eq: String.raw`\[ \text{wrong: } \text{fit}(X) \to \text{split} \qquad \text{right: } \text{split} \to \text{fit}(X_{\text{train}}) \to \text{apply to } X_{\text{val}}, X_{\text{test}} \]`,
sym: [["train", "fits parameters and preprocessing statistics, about 65 % in the lecture's illustration"], ["validation", "compares model choices, thresholds, features, hyperparameters, about 20 %"], ["test", "one final estimate after all decisions are fixed, about 15 %"], ["leakage", "training uses information unavailable at prediction time, or evaluation data shape the fitted pipeline"]],
how: ["Split first, at the level of independent units, and keep groups and time order when they matter.", "Fit the scaler, the imputer, the feature selector and the model on the training split only.", "Apply the fitted transformations unchanged to validation and test data.", "The timestamp test: for each feature and statistic, could it be known at the moment the prediction is requested? If not, it is a leakage candidate.", "Every time you tune on the test set, it becomes a validation set and the final number turns optimistic."],
say: String.raw`Split the data first, fit every preprocessing step and the model on the training split only, choose with validation, and open the test split once at the end.`,
num: String.raw`In the picture the wrong-order scaler uses a mean of <b>all 8 rows</b>, the right-order scaler a mean of the <b>5 training rows</b>. The two means differ, and that difference is information from the test rows inside the model.`,
note: String.raw`Every homework in the course, from HW1 on, contains a leakage check: statistics from training data only. Expect it on the midterm.`,
r(fig, ctl) {
  const m = [192, 146, 91, 205, 139, 88, 198, 151];
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const steps = [
    { t: "the table: 8 fruits, mass in grams, rows 6 to 8 will be the test set", w: null },
    { t: "WRONG ORDER: fit the scaler on all 8 rows. Its mean already includes the three test masses.", w: true, k: 1 },
    { t: "WRONG ORDER: then split. The model trains on values scaled with a statistic that saw the test set.", w: true, k: 2 },
    { t: "RIGHT ORDER: split first. Rows 1 to 5 train, rows 6 to 8 test, nothing fitted yet.", w: false, k: 1 },
    { t: "RIGHT ORDER: fit the scaler on the 5 training rows only, then apply it unchanged to the test rows.", w: false, k: 2 }
  ];
  const draw = k => {
    const st = steps[k];
    let s = "";
    m.forEach((v, i) => { const x = 40 + i * 76, test = i >= 5, split = st.k >= 2 || (st.w === false && st.k >= 1); s += `<rect x="${x}" y="40" width="66" height="40" rx="6" fill="${split && test ? "var(--coral-bg)" : split ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${split && test ? C.coral : split ? C.teal : "var(--line)"}"/>` + tx(x + 33, 65, v + " g", "middle", "t") + tx(x + 33, 96, "row " + (i + 1), "middle"); });
    if (st.k >= 2 || (st.w === false && st.k >= 1)) s += tx(230, 120, "training rows", "middle") + tx(534, 120, "test rows", "middle");
    if (st.w === true && st.k >= 1) { s += `<rect x="40" y="140" width="598" height="54" rx="8" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(340, 162, "scaler fitted on all 8 rows", "middle", "th") + tx(340, 184, `mean = ${mean(m).toFixed(1)} g, contains the test masses 88, 198 and 151`, "middle", "t"); }
    if (st.w === false && st.k >= 2) { s += `<rect x="40" y="140" width="598" height="54" rx="8" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(340, 162, "scaler fitted on the 5 training rows", "middle", "th") + tx(340, 184, `mean = ${mean(m.slice(0, 5)).toFixed(1)} g, test rows transformed with this same value`, "middle", "t"); }
    s += tx(340, 224, st.t, "middle", "t");
    fig.innerHTML = svg(236, s) + ML.code(st.w === true ? ["scaler.fit(X)            # all rows, including test", "X_scaled = scaler.transform(X)", "X_train, X_test = split(X_scaled)   # too late"] : st.w === false ? ["X_train, X_test = split(X)         # first", "scaler.fit(X_train)                # training rows only", "X_train_s = scaler.transform(X_train)", "X_test_s = scaler.transform(X_test) # same statistics, unchanged"] : ["# the table X, 8 rows"], st.w == null ? -1 : st.k - 1);
  };
  ML.stepper(ctl, steps.length, draw);
}},

{s: "8. Inspect first", t: "Inspect the data before trusting the model",
intu: String.raw`Many apparent model failures are data contract failures. Before fitting anything, ask five questions of the table: is anything missing, is every value plausible, are the classes balanced, could any column leak the outcome, are rows repeated or correlated. Click each check to see what it catches in the small table. The -999 is a placeholder someone typed for a failed sensor. The color of 1.42 is outside the score's range. The heavy apple with an orange-like color may be a mislabel. None of these would stop a model from training, and all of them would make its result wrong.`,
eq: String.raw`\[ \text{audit} = \{\text{missing},\ \text{plausible},\ \text{balanced},\ \text{leaking},\ \text{repeated}\} \ \text{before any fit} \]`,
sym: [["missing", "blanks, failed sensors, placeholders such as -999 or 0 where 0 is impossible"], ["plausible", "ranges and units: negative mass, a score above 1, a temperature in the wrong unit"], ["balanced", "enough examples of every class and operating regime"], ["leaking", "columns created after the outcome, or identifiers that encode it"], ["repeated", "duplicate rows, or many rows from one physical unit"]],
how: ["Print shapes, types, the count of missing values per column and the minimum and maximum of each.", "Plot each feature by class. Overlap shows where a boundary will be uncertain, isolated points show measurement or label errors.", "Count the classes. A model trained on 95 % one class learns to say that class.", "For every column ask when it was recorded. Anything recorded after the decision is a leak.", "Check for duplicates and for groups. Repeated rows inflate the apparent sample size."],
say: String.raw`Before fitting, check for missing and implausible values, class balance, leaking columns and repeated rows, because a model will happily learn from all of them.`,
num: String.raw`The lecture's tiny table has <b>4 rows and 3 issues</b>: a -999 placeholder, a color score of 1.42, and an apple whose color says orange.`,
r(fig, ctl) {
  const rows = [["apple", "192", "0.46", "A1"], ["orange", "-999", "0.82", "A2"], ["lemon", "91", "1.42", "A3"], ["apple", "208", "0.88", "A1"]];
  const checks = [["missing", "row 2: mass -999 is a placeholder for a failed sensor, not a mass", [1]], ["plausible", "row 3: color score 1.42 is outside the 0 to 1 range of the sensor", [2]], ["balanced", "two apples, one orange, one lemon: with four rows no class is well represented", [0, 1, 2, 3]], ["leaking", "the batch column A1 to A3 may encode the supplier, who ships one fruit type", [0, 1, 2, 3]], ["repeated", "rows 1 and 4 share batch A1: are they the same specimen measured twice?", [0, 3]]];
  let k = -1;
  ctl.innerHTML = `<div class="row">${checks.map((c, i) => `<button data-k="${i}">${c[0]}?</button>`).join("")}</div><div id="ck"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const hl = k < 0 ? [] : checks[k][2];
    let s = "";
    ["fruit", "mass_g", "color", "batch"].forEach((h, j) => s += tx(70 + j * 140 + 60, 30, h, "middle", "th"));
    rows.forEach((r, i) => { const y = 42 + i * 40, on = hl.includes(i); r.forEach((v, j) => { const bad = (k === 0 && i === 1 && j === 1) || (k === 1 && i === 2 && j === 2) || (k === 3 && j === 3) || (k === 4 && j === 3 && (i === 0 || i === 3)); s += `<rect x="${70 + j * 140}" y="${y}" width="124" height="32" rx="4" fill="${bad ? "var(--coral-bg)" : on ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${bad ? C.coral : "var(--line)"}"/>` + tx(70 + j * 140 + 62, y + 21, v, "middle", "t"); }); });
    fig.innerHTML = svg(210, s);
    $("ck").innerHTML = k < 0 ? `<p class="note">Click a check.</p>` : `<p class="note"><b>${checks[k][0]}:</b> ${checks[k][1]}.</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "9. Evaluate", t: "Evaluation asks whether the model is useful, not only accurate",
intu: String.raw`Accuracy is one number. A confusion matrix shows which mistakes were made: rows are the actual class, columns the predicted class, the diagonal is right, everything else is wrong. Edit the cells and watch accuracy, per-class recall and the baseline change. The baseline is the simplest rule, predicting the most common class, and a model that does not beat it has learned nothing useful. Then ask the decision questions: what happens after a wrong route, can a person check the uncertain items, which error costs more.`,
eq: String.raw`\[ \text{accuracy} = \frac{\sum_k M_{kk}}{\sum_{k,l} M_{kl}}, \qquad \text{recall}_k = \frac{M_{kk}}{\sum_l M_{kl}} \]`,
sym: [[String.raw`\(M_{kl}\)`, "count of samples of actual class k predicted as class l"], [String.raw`\(M_{kk}\)`, "the diagonal: correct predictions of class k"], [String.raw`\(\text{recall}_k\)`, "fraction of actual class k that was recognized"], ["baseline", "always predict the most common class"]],
how: ["Build the matrix from held-out predictions, never from training predictions.", "Read each row: of the actual apples, how many were called apple, orange, lemon.", "Compute accuracy, then recall per class. A high accuracy can hide one class that is almost never recognized.", "Compare with the majority baseline. The gain over it is the evidence that the model learned.", "Attach a cost to each off-diagonal cell. The best metric is the one whose behavior matches the real cost."],
say: String.raw`A confusion matrix separates the kinds of mistakes, accuracy summarizes the diagonal, and a model is useful only when it beats a simple baseline on the errors that cost the most.`,
num: String.raw`The lecture's matrix: 18, 16 and 17 on the diagonal out of 57 gives accuracy <b>89.5 %</b>. The majority baseline on the same test set is <b>19 of 57, 33 %</b>.`,
r(fig, ctl) {
  const M = [[18, 1, 0], [2, 16, 1], [0, 2, 17]];
  let sel = [0, 0];
  ctl.innerHTML = `<div class="row"><button id="mm">−1</button><button id="mp">+1</button><span class="note">on the selected cell</span></div><div id="ev"></div>`;
  const u = () => {
    let s = tx(300, 22, "predicted class", "middle", "th") + tx(40, 150, "actual", "middle", "th");
    FN.forEach((n, j) => s += tx(190 + j * 100 + 40, 48, n, "middle"));
    FN.forEach((n, i) => s += tx(130, 60 + i * 60 + 30, n, "middle"));
    M.forEach((r, i) => r.forEach((v, j) => { const on = sel[0] === i && sel[1] === j, d = i === j; s += `<rect x="${190 + j * 100}" y="${60 + i * 60}" width="80" height="50" rx="6" fill="${d ? "var(--teal-bg)" : "var(--coral-bg)"}" fill-opacity="${0.3 + 0.7 * v / 20}" stroke="${on ? "var(--accent)" : d ? C.teal : C.coral}" stroke-width="${on ? 2.5 : 1}" data-i="${i}" data-j="${j}" style="cursor:pointer"/>` + tx(230 + j * 100, 90 + i * 60, v, "middle", "th"); }));
    const tot = M.flat().reduce((a, b) => a + b, 0), diag = M[0][0] + M[1][1] + M[2][2], rows = M.map(r => r.reduce((a, b) => a + b, 0)), maj = Math.max(...rows);
    s += tx(560, 48, "recall", "middle", "th");
    M.forEach((r, i) => s += tx(560, 60 + i * 60 + 30, rows[i] ? (100 * M[i][i] / rows[i]).toFixed(0) + " %" : "n/a", "middle", "t"));
    fig.innerHTML = svg(250, s);
    fig.querySelectorAll("rect[data-i]").forEach(r => r.onclick = () => { sel = [+r.dataset.i, +r.dataset.j]; u(); });
    $("ev").innerHTML = ML.readout([["accuracy", tot ? (100 * diag / tot).toFixed(1) + " %" : "n/a"], ["majority baseline", tot ? (100 * maj / tot).toFixed(1) + " %" : "n/a"], ["gain over baseline", tot ? (100 * (diag - maj) / tot).toFixed(1) + " points" : "n/a"], ["total samples", tot]]);
  };
  $("mm").onclick = () => { M[sel[0]][sel[1]] = Math.max(0, M[sel[0]][sel[1]] - 1); u(); };
  $("mp").onclick = () => { M[sel[0]][sel[1]] = Math.min(40, M[sel[0]][sel[1]] + 1); u(); };
  u();
}},

{s: "10. Shift", t: "A test score is conditional evidence",
intu: String.raw`The test score says how the model does on data like the test data. Change the conditions and the claim expires. Here the model was trained on one supplier's fruit. Slide to a new supplier whose oranges are larger and whose camera reads colors differently, and watch the fixed boundary start to misroute. This is distribution shift. The fix is not a cleverer model. It is monitoring the inputs against the training conditions, tracking errors as labels arrive, and saying out loud which conditions the score was measured under.`,
eq: String.raw`\[ p_{\text{deploy}}(\mathbf{x}, y) \neq p_{\text{train}}(\mathbf{x}, y) \;\Rightarrow\; \text{test score no longer applies} \]`,
sym: [["distribution shift", "a change between training and deployment in the inputs, the targets or their relation"], ["covariate shift", "the inputs move, for example larger oranges from a new supplier"], ["monitor inputs", "compare ranges, missingness and feature distributions with training"], ["monitor outcomes", "track error by time, subgroup and supplier once labels arrive"]],
how: ["State the conditions the test data came from: supplier, season, camera, calibration.", "Before deployment on new conditions, compare the new inputs with the training ranges.", "After deployment, measure error on new labeled items and look for drift by subgroup.", "Investigate a change before retraining blindly. A camera recalibration is fixed at the camera, not in the model."],
say: String.raw`A held-out score applies to data drawn from the same conditions as the test set, so deployment on a new supplier, season or sensor needs new evidence.`,
num: String.raw`In the picture, a <b>20 g shift</b> in orange mass and a <b>0.15 drop</b> in color readings turn a nearly perfect classifier into one that misroutes about a third of the oranges.`,
r(fig, ctl) {
  ctl.innerHTML = sl("sh", "new supplier shift", 0, 1, 0.05, 0) + `<div id="sr"></div>`;
  const u = () => {
    const t = +$("sh").value; $("shv").textContent = t === 0 ? "training supplier" : (100 * t).toFixed(0) + " % of the way";
    const A = ML.axes(70, 20, 540, 220, { xmin: 60, xmax: 260, ymin: 0.2, ymax: 1.05, nx: 4, ny: 3, fx: x => Math.round(x), fy: y => y.toFixed(2), xl: "mass (g)", yl: "color score" });
    let s = A.s + `<path d="M${A.X(60)} ${A.Y(0.66)} L${A.X(260)} ${A.Y(0.59)}" stroke="var(--p)" stroke-dasharray="6 4"/><path d="M${A.X(118)} ${A.Y(1.05)} L${A.X(122)} ${A.Y(0.2)}" stroke="var(--p)" stroke-dasharray="6 4"/>`;
    let wrong = 0, n = 0;
    FRUIT.forEach(p => { const m = p[0] + (p[2] === 1 ? 22 * t : 6 * t), c = p[1] - 0.15 * t; const pred = c < 0.66 - 0.00035 * (m - 60) ? 0 : m < 120 ? 2 : 1; const bad = pred !== p[2]; if (bad) wrong++; n++; s += `<circle cx="${A.X(m)}" cy="${A.Y(c)}" r="5.5" fill="${FC[p[2]]}" stroke="${bad ? C.coral : "var(--panel)"}" stroke-width="${bad ? 2.5 : 1}"/>`; });
    fig.innerHTML = svg(266, s);
    $("sr").innerHTML = ML.readout([["boundary", "fixed, learned on the training supplier"], ["misrouted", wrong + " of " + n], ["accuracy now", (100 * (1 - wrong / n)).toFixed(0) + " %"]]);
  };
  $("sh").oninput = u; u();
}},

{s: "11. With the agent", t: "Do it with the agent: audit your project's data",
intu: String.raw`The lecture says the first program should expose the data, not fit a model. That is the command here: an audit script for your own project dataset that prints the contract (shapes, types, missing values, ranges, class counts) and saves one plot per feature by class. The checks are the five questions from card 8. Replace the file name and columns with your own.`,
eq: String.raw`\[ \text{raw table} \to \text{audit script} \to \text{contract printed} + \text{plots in results/} \]`,
sym: [["the contract", "shape of X and y, dtype per column, missing count per column, min and max, class counts"], ["the plots", "one histogram per feature split by class, saved under results/figures"], ["the decision", "which rows and columns to drop, fix or question before any model"]],
how: ["Paste the command with your file and column names.", "Read the printed audit. Every number should be plausible in its unit.", "Open the figures. Look for overlap, isolated points and impossible values.", "Write what you found and decided in notes/decisions.md. That is the first entry of your project log."],
say: String.raw`The first script of a project prints the data contract and plots every feature by class, so that data problems are found before a model can learn them.`,
num: String.raw`For a table of a few thousand rows this runs in <b>seconds</b>. For the fruit table it prints 4 feature ranges, 3 class counts and saves 4 figures.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Write src/audit.py for the raw dataset data/raw/fruit.csv with columns mass_g, width_cm, height_cm, color, fruit. Load it with pandas and print: the shape, the dtype of each column, the count of missing values per column, the min and max of each numeric column, the count of each fruit class, and the number of exact duplicate rows. Treat -999 as missing. Then save one histogram per numeric feature, colored by fruit class, to results/figures/audit_<feature>.png with labeled axes and units. Do not fit any model and do not split the data. Run it and paste the printed audit.",
    actions: ["$ python src/audit.py", "shape (240, 5)", "dtypes: mass_g float64, width_cm float64, height_cm float64, color float64, fruit object", "missing: mass_g 3, width_cm 0, height_cm 0, color 0, fruit 0", "range mass_g 71.0 to 236.0 | width_cm 5.1 to 8.9 | height_cm 5.3 to 9.8 | color 0.31 to 1.42", "classes: apple 84, orange 80, lemon 76", "duplicate rows: 2", "saved results/figures/audit_mass_g.png ... audit_color.png"],
    checks: ["the shape matches the number of rows in the file", "-999 values were counted as missing, not as masses", "a color maximum above 1 was reported, so I can go and look at that row", "class counts add up to the number of rows", "four figures exist in results/figures with axis labels and units", "the script contains no fit, no split and no model"]
  });
}},

{s: "12. Test", t: "Test: what machine learning is",
intu: String.raw`Twelve questions on the definition of learning, the three settings, classification versus regression, shapes, splits, leakage, auditing, evaluation and shift. Answer without looking back.`,
eq: String.raw`\[ \text{12 questions} \;\to\; \text{score} \;\to\; \text{review} \]`,
sym: [["pass mark", "10 of 12"], ["style", "the lecture's self-check and the practice midterm questions"]],
how: ["Name T, E and P before deciding whether something learned.", "Name the feedback signal before naming the setting.", "For every split question, ask what was fitted on what."],
say: String.raw`I can state what learning is, name the setting from its feedback, write the shapes of X and y, protect the test set, and read a confusion matrix against a baseline.`,
num: String.raw`<b>12 questions.</b>`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A thermostat with hand-coded thresholds keeps the room comfortable. Has it learned?", o: ["Yes, it performs the task well", "No, its behavior did not improve from experience", "Yes, if it is accurate on unseen days", "Only if it uses a neural network"], a: 1, why: "Learning requires improvement with experience E. The thresholds came from a person, not from data." },
    { q: "In Mitchell's definition, what is P for a spam filter?", o: ["The set of labeled emails", "Classifying emails", "The fraction of new emails classified correctly", "The number of rules"], a: 2, why: "P is the performance measure. The labeled emails are E and classifying is T." },
    { q: "Which setting fits: choose furnace set points and receive an energy and quality reward after each batch?", o: ["Supervised regression", "Unsupervised clustering", "Reinforcement learning", "Supervised classification"], a: 2, why: "Actions change future states and a delayed reward is the feedback. That is reinforcement learning." },
    { q: "Which setting fits: flag unusual server behavior using only histories of normal operation?", o: ["Supervised classification", "Unsupervised anomaly detection", "Reinforcement learning", "Regression"], a: 1, why: "There are no labels for the unusual cases. The structure of normal x is the only feedback." },
    { q: "A target column stores fruit type as 0, 1 and 2. The task is:", o: ["Regression, since y is numeric", "Classification, since y is categorical", "Unsupervised, since the numbers are arbitrary", "Reinforcement"], a: 1, why: "Interpret the meaning of y, not its storage type. Three categories encoded as integers are still categories." },
    { q: "A dataset has 240 fruits with 4 measurements each. The shapes of X and y are:", o: ["(4, 240) and (4,)", "(240, 4) and (240,)", "(240, 5) and (240,)", "(240, 4) and (4,)"], a: 1, why: "Rows are samples and columns are features, so X is (240, 4). y has one entry per sample." },
    { q: "Why is fitting a scaler on the whole table before the split a form of leakage?", o: ["It changes the units", "The scaler's statistics include the test rows, so the model has seen a summary of the test set", "Scalers must be fitted after the model", "It is not leakage"], a: 1, why: "The mean and standard deviation were computed from all rows, including the test rows, and they shape the training representation." },
    { q: "What is the validation set for?", o: ["Fitting parameters", "The final performance estimate", "Choosing between models, features, thresholds and hyperparameters", "Nothing, it is a backup"], a: 2, why: "Training fits, validation chooses, test gives one final estimate after choices are fixed." },
    { q: "Ten micrographs cropped from one specimen appear as ten rows. For splitting they are:", o: ["Ten independent samples", "One group that must stay in the same split", "Test data", "Duplicates to delete"], a: 1, why: "They share a physical unit. Split at the unit level, or the test score is optimistic." },
    { q: "A mass column contains the value -999. The right reading is:", o: ["A very light fruit", "A placeholder for a missing measurement", "A sign error, take the absolute value", "A leak"], a: 1, why: "Negative mass is impossible. -999 is a typical placeholder for a failed sensor and must be treated as missing." },
    { q: "A confusion matrix has 18, 16, 17 on the diagonal, 57 samples in total, and the largest class has 19. The gain over the majority baseline is about:", o: ["89 points", "33 points", "56 points", "0 points"], a: 2, why: "Accuracy is 51/57 = 89.5 %, the baseline is 19/57 = 33.3 %, so the gain is about 56 points." },
    { q: "A classifier scored 95 % on fruit from supplier A. For supplier B with different varieties and a different camera, the score:", o: ["Still applies, the model is accurate", "No longer applies until checked on B's conditions", "Will be higher", "Applies if the model is a neural network"], a: 1, why: "A test score is conditional on the test conditions. A new supplier is a distribution shift that needs new evidence." }
  ], "Lesson 1 test");
}}
],
summary: String.raw`A program learns when its performance on a task, measured by a stated measure, improves with experience and the improvement holds on unseen examples. Written rules encode what a person specified, learned models encode patterns from data, and the representation decides what a model can see at all. Settings differ by feedback: a target for supervised learning, structure only for unsupervised, a reward for reinforcement. Inside supervised learning the target's meaning decides classification versus regression. X has one row per independent sample and one column per feature. Split first, fit everything on the training split, choose with validation, test once. Audit the data before any fit, read the confusion matrix against a baseline, and remember that the score belongs to the conditions it was measured under.`,
sheet: [
[String.raw`\[ \text{learns} \iff P(T) \text{ improves with } E, \text{ on unseen examples} \]`, "Mitchell's definition with the generalization clause"],
[String.raw`\[ (\mathbf{x}, y) \to f_\theta \quad\|\quad \{\mathbf{x}\} \to \text{structure} \quad\|\quad s_t \xrightarrow{a_t} r_t \]`, "Supervised, unsupervised, reinforcement"],
[String.raw`\[ X \in \mathbb{R}^{n \times p}, \quad y \in \mathcal{C}^n \text{ or } \mathbb{R}^n \]`, "Rows are samples, columns are features"],
[String.raw`\[ \text{split} \to \text{fit on train} \to \text{choose on val} \to \text{test once} \]`, "The order that prevents leakage"],
[String.raw`\[ \text{accuracy} = \frac{\sum_k M_{kk}}{n}, \quad \text{recall}_k = \frac{M_{kk}}{\sum_l M_{kl}} \]`, "Reading a confusion matrix"]],
sources: ["AME 5970 Lecture 1 notes and slides (Introduction to Applied Machine Learning): the definition, settings, workflow and fruit case followed card by card", "Andrew Ng, Machine Learning Specialization, course 1 week 1 (what is machine learning, supervised and unsupervised learning)", "Mitchell, Machine Learning (1997), chapter 1, the T, E, P definition", "scikit-learn user guide, common pitfalls: data leakage and the pipeline", "AME 5970 practice midterms, the questions on learning settings and splits"]
});
})();
