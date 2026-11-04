(function () {
/* ML shelf, Part 1, Lesson 0: Your ML workbench. Visuals built with ML (ml-common.js) and app.js helpers. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;

addLesson("ml", "start", {
level: "Foundations", num: "Lesson 0", zero: true,
id: "ml-start-l0", title: "Your ML workbench", short: "0. Your ML workbench",
big: String.raw`You will not type most of the code in this course. The Claude agent in VS Code will. Your job is different and harder: decide what to build, say it precisely, read what comes back, and check that it is right. This lesson sets up that loop before any machine learning appears. You will see what a project folder looks like, which text files steer the agent, how an environment keeps packages in order, how git keeps every version of your work, how to write a command the agent cannot misread, and how to read code and results you did not write. Every later lesson ends with a "Do it with the agent" card that uses exactly this loop.`,
bridge: String.raw`The course project is graded 80 % on code quality and functionality and 20 % on the presentation. Code the agent writes is still your code at grading time, so the checking habits here are what earn the marks.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The loop", t: "The work loop: you decide, the agent writes, you check",
intu: String.raw`Every piece of work goes around one loop. You decide what should exist and write a command. The agent reads your files, writes or changes code, runs it and reports. You read the report and the code, run your own check, and either accept and commit or send the next command. Click a step to see what each side owns. The loop is short on purpose: one small goal per round, checked before the next. Big vague commands produce big vague code.`,
eq: String.raw`\[ \text{command} \to \text{code} \to \text{run} \to \text{check} \to \text{commit or correct} \]`,
sym: [["command", "one clear goal with context, constraints and a way to verify it"], ["code", "files the agent creates or edits inside your project folder"], ["run", "the agent runs the script or tests and shows the output"], ["check", "you read the output and the code against what you asked for"], ["commit", "a saved snapshot in git with a message saying what changed"]],
how: ["Decide the next small goal, for example a function that loads the CSV and prints its shape.", "Write the command with the goal, where the data lives, any rule to follow, and the check you expect.", "The agent works and reports. Read the report first, then open the files it touched.", "Run the check yourself, or ask the agent to run it and paste the output.", "If right, commit. If wrong, say exactly what is wrong in the next command."],
say: String.raw`The agent writes the code, but I own the goal, the check and the commit, so every file in the repository is something I asked for and verified.`,
num: String.raw`A healthy round is <b>5 to 15 minutes</b>. If a round takes an hour, the goal was too big. Split it.`,
note: String.raw`Graders read the code, not the chat. Comments and a README that explain what each part does are part of the loop, not an afterthought.`,
r(fig, ctl) {
  let k = 0;
  const S = [["You decide", "pick one small goal and write the command", C.teal], ["Agent writes", "reads your files, writes code, runs it, reports", C.blue], ["Agent runs", "executes the script or tests, shows the output", C.blue], ["You check", "read report, open files, run your own check", C.teal], ["Commit or correct", "git commit if right, next command if not", C.coral]];
  ctl.innerHTML = `<div class="row">${S.map((s, i) => `<button data-k="${i}">${i + 1}. ${s[0]}</button>`).join("")}</div><div id="lp"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    S.forEach((st, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = 340 + 190 * Math.cos(a), y = 150 + 110 * Math.sin(a), on = i === k;
      s += `<rect x="${x - 70}" y="${y - 24}" width="140" height="48" rx="10" fill="${on ? st[2] : "var(--panel)"}" fill-opacity="${on ? 0.18 : 1}" stroke="${st[2]}" stroke-width="${on ? 2.2 : 1}"/>` + tx(x, y + 5, st[0], "middle", on ? "th" : "t");
      const b = -Math.PI / 2 + (i + 1) * 2 * Math.PI / 5, x2 = 340 + 190 * Math.cos(b), y2 = 150 + 110 * Math.sin(b);
      const mx = (x + x2) / 2, my = (y + y2) / 2, dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy);
      s += arrow(mx - dx / L * 36, my - dy / L * 36, mx + dx / L * 36, my + dy / L * 36, "var(--p)", 1.5);
    });
    s += tx(340, 290, S[k][1], "middle", "t");
    fig.innerHTML = svg(300, s);
    $("lp").innerHTML = ML.readout([["who owns this step", S[k][2] === C.blue ? "the agent" : "you"], ["output of the step", ["a command", "changed files", "printed output", "a verdict", "a git snapshot"][k]]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  u();
}},

{s: "2. The folder", t: "What a project folder looks like",
intu: String.raw`A project is one folder. Everything the agent is allowed to touch lives inside it, and VS Code opens that folder, not a single file. Click each item to see what it is for. Data, code, notebooks, results and notes each get their own place, so a command like "put the plot in results" has one meaning. The two files at the top, README.md and CLAUDE.md, are read by people and by the agent before anything else.`,
eq: String.raw`\[ \texttt{project/} = \texttt{README.md} + \texttt{CLAUDE.md} + \texttt{data/} + \texttt{src/} + \texttt{notebooks/} + \texttt{results/} + \texttt{notes/} \]`,
sym: [["README.md", "what the project is, how to run it, written for a reader"], ["CLAUDE.md", "standing instructions for the agent: rules, layout, style"], ["data/", "raw and processed data, never edited by hand, often not committed"], ["src/", "Python modules the agent writes: data loading, model, training"], ["notebooks/", "exploration and figures, not the main code"], ["results/", "figures, metrics tables, saved models"], ["notes/", "your experiment log and decisions, one md file per topic"]],
how: ["Create the folder and open it in VS Code with File, Open Folder.", "Ask the agent to create this layout with empty placeholder files.", "Keep raw data read-only. Processed data is produced by code in src/, so it can be regenerated.", "Put every figure and metric the agent produces under results/ with a name that says what it is.", "Write what you decided and why in notes/ as you go. It becomes the presentation later."],
say: String.raw`The folder is the whole project: code in src, data in data, outputs in results, and two markdown files at the top that tell readers and the agent how it fits together.`,
num: String.raw`A typical course project has <b>4 to 8 files in src/</b>, one notebook, and a results folder with 5 to 20 figures by the end.`,
r(fig, ctl) {
  const T = [["project/", 0, "the folder VS Code opens. Everything lives inside.", C.gray], ["README.md", 1, "for humans: title, goal, how to install, how to run, results summary", C.teal], ["CLAUDE.md", 1, "for the agent: rules it follows in every command (card 3)", C.teal], ["requirements.txt", 1, "the packages and versions the project needs (card 4)", C.amber], [".gitignore", 1, "what git should not track: data files, caches, saved models", C.amber], ["data/", 1, "raw/ is never edited, processed/ is made by code", C.blue], ["src/", 1, "data.py, model.py, train.py, evaluate.py", C.purple], ["notebooks/", 1, "explore.ipynb for looking at data and figures", C.purple], ["results/", 1, "figures/, metrics.csv, checkpoints/", C.coral], ["notes/", 1, "experiments.md, decisions.md, presentation outline", C.coral]];
  let k = 0;
  ctl.innerHTML = `<div class="row">${T.map((t, i) => `<button data-k="${i}">${t[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "k", k);
    let s = "";
    T.forEach((t, i) => {
      const y = 22 + i * 30, x = 40 + t[1] * 28, on = i === k;
      if (on) s += `<rect x="${x - 10}" y="${y - 18}" width="300" height="26" rx="5" fill="${t[3]}" fill-opacity="0.18"/>`;
      s += `<text class="t" x="${x}" y="${y}" style="font-family:var(--mono);font-size:13px;${on ? "font-weight:600" : ""}">${t[0].endsWith("/") ? "📁 " : "📄 "}${t[0]}</text>`;
    });
    s += `<rect x="360" y="16" width="300" height="100" rx="8" fill="var(--sunk)"/>` + tx(372, 40, T[k][0], null, "th") + tx(372, 64, T[k][2].slice(0, 44), null, "t") + tx(372, 84, T[k][2].slice(44, 90), null, "t") + tx(372, 104, T[k][2].slice(90), null, "t");
    fig.innerHTML = svg(330, s);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); });
  u();
}},

{s: "3. md files", t: "The markdown files that steer the agent",
intu: String.raw`The agent reads CLAUDE.md at the start of every session, so rules you put there never need repeating. The README is the project's front page. The notes folder is your memory of what was tried. Switch between the three files to see a good version of each. Short and specific beats long and general: a rule the agent can check, like "every function has a docstring", works better than "write good code".`,
eq: String.raw`\[ \text{CLAUDE.md: rules} \qquad \text{README.md: how to run} \qquad \text{notes/experiments.md: what happened} \]`,
sym: [["rule", "a sentence the agent can obey or violate, nothing in between"], ["layout", "where files go, so the agent never invents a new folder"], ["style", "naming, comments, no notebooks in src, seeds fixed"], ["log entry", "date, what changed, the numbers, the decision"]],
how: ["Write CLAUDE.md first, before the first command. Ten lines is enough to start.", "Add a rule the moment the agent does something you dislike twice.", "Keep README.md current: ask the agent to update it whenever a command changes how the project runs.", "After every experiment, add one line to notes/experiments.md with the metric and the decision."],
say: String.raw`CLAUDE.md holds the standing rules, README.md explains the project to a reader, and the notes folder records every experiment and decision, so the agent and I always start from the same facts.`,
num: String.raw`A good CLAUDE.md is <b>10 to 30 lines</b>. The experiment log grows by one line per run, <b>30 to 80 lines</b> by the end of the project.`,
note: String.raw`The decisions file is the skeleton of the final presentation: what you tried, what the numbers said, what you chose and why.`,
r(fig, ctl) {
  const F = {
    "CLAUDE.md": ["# Project rules for the agent", "", "- Python 3.11, PyTorch, PyTorch Lightning. Use the venv in .venv.", "- Layout: code in src/, data in data/, outputs in results/, notes in notes/.", "- Every function has a docstring and type hints. Comment the why, not the what.", "- Fix all random seeds. Never fit a scaler on validation or test data.", "- Never edit files in data/raw. Processed data is made by src/data.py.", "- After training, save metrics to results/metrics.csv and a figure to results/figures/.", "- Before saying a task is done, run the script and paste the real output.", "- Keep README.md up to date when the run commands change."],
    "README.md": ["# Weather prediction with a small LSTM", "", "Predicts next-day temperature from the last 30 days of station data.", "", "## Setup", "    python -m venv .venv && source .venv/bin/activate", "    pip install -r requirements.txt", "", "## Run", "    python src/train.py --config configs/base.yaml", "", "## Results", "Validation MAE 1.8 C against a 2.6 C persistence baseline. See results/."],
    "notes/experiments.md": ["# Experiment log", "", "| date | change | val MAE | decision |", "|---|---|---|---|", "| Nov 10 | persistence baseline | 2.61 | the number to beat |", "| Nov 11 | linear model on 30 lags | 2.14 | keep as second baseline |", "| Nov 12 | LSTM 64 units, lr 1e-3 | 1.92 | overfits after epoch 8, add early stopping |", "| Nov 13 | + early stopping, dropout 0.2 | 1.80 | keep |", "", "Open question: does adding humidity help? Try next."]
  };
  let k = "CLAUDE.md";
  ctl.innerHTML = btns(Object.keys(F).map(x => [x, x]), "f");
  const u = () => { pick(ctl, "f", k); fig.innerHTML = ML.code(F[k], -1, "text"); };
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { k = b.dataset.f; u(); });
  u();
}},

{s: "4. Environment", t: "Environments and packages",
intu: String.raw`Python code calls packages such as NumPy and PyTorch, and each package has versions. A virtual environment is a private folder of packages for one project, so a version change elsewhere cannot break this project. The requirements file lists what the environment contains, so anyone, including a grader, can rebuild it. Step through what each command does to the picture.`,
eq: String.raw`\[ \texttt{python -m venv .venv} \;\to\; \texttt{activate} \;\to\; \texttt{pip install -r requirements.txt} \]`,
sym: [[".venv/", "the private package folder for this project, never committed"], ["activate", "tells the terminal to use .venv's Python and pip"], ["requirements.txt", "package names with versions, for example torch==2.5.1"], ["pip freeze", "prints every installed package with its exact version"]],
how: ["Create the environment once, inside the project folder.", "Activate it in every new terminal. VS Code can do this automatically when you select the interpreter.", "Install from requirements.txt. When the agent adds a package, it must add it to this file.", "Check by running <code>python -c \"import torch\"</code> in the activated terminal. No error means the package is in this environment, and card 9 prints the version."],
say: String.raw`A virtual environment gives the project its own packages, and requirements.txt records them, so the code runs the same on my laptop, the agent's runs, and the grader's machine.`,
num: String.raw`A PyTorch environment is <b>2 to 5 GB</b> on disk. That is why .venv goes in .gitignore and is never pushed to GitHub.`,
r(fig, ctl) {
  const steps = [
    ["$ cd weather-project", "$ python -m venv .venv", "created .venv/ with a fresh Python and pip"],
    ["$ source .venv/bin/activate", "(.venv) $ which python", "/home/sujoy/weather-project/.venv/bin/python"],
    ["(.venv) $ pip install -r requirements.txt", "Collecting numpy==2.1.3 ...", "Collecting torch==2.5.1 ...", "Successfully installed numpy-2.1.3 torch-2.5.1 lightning-2.4.0 pandas-2.2.3"],
    ["(.venv) $ python -c \"import torch; print(torch.__version__)\"", "2.5.1"]
  ];
  const draw = k => {
    const pk = k >= 2 ? ["numpy 2.1.3", "torch 2.5.1", "lightning 2.4.0", "pandas 2.2.3"] : [];
    let s = ML.box(40, 30, 200, 150, "c-gray", ["system Python", "shared by everything", "do not install here"], true);
    s += ML.box(300, 30, 340, 150, k >= 1 ? "c-teal" : "c-blue", [".venv (this project)", k === 0 ? "created, empty" : k === 1 ? "active in this terminal" : "active, packages installed"], true);
    pk.forEach((p, i) => { s += `<rect x="${320 + (i % 2) * 160}" y="${100 + Math.floor(i / 2) * 32}" width="150" height="26" rx="5" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(395 + (i % 2) * 160, 117, p, "middle"); });
    if (k >= 1) s += arrow(170, 215, 300, 160, C.teal, 2) + tx(150, 236, "terminal uses this Python", "middle");
    fig.innerHTML = svg(246, s) + ML.term(steps[k]);
  };
  ML.stepper(ctl, 4, draw, ["create", "activate", "install", "verify"]);
}},

{s: "5. git and GitHub", t: "git keeps every version, GitHub keeps a copy",
intu: String.raw`git stores snapshots of the project called commits. Each commit points to the one before it, so the history is a chain you can walk back along. A branch is a name for the latest commit on a line of work. GitHub holds a copy of the chain online, which is your backup and what you submit. Step through a day of work to see the chain grow, a branch for an experiment, and the merge back.`,
eq: String.raw`\[ \texttt{git add} \to \texttt{git commit -m "..."} \to \texttt{git push} \]\[ \texttt{git checkout -b try-lstm} \to \ldots \to \texttt{git merge} \]`,
sym: [["commit", "a snapshot of every tracked file plus a message, identified by a hash"], ["main", "the branch that always works"], ["feature branch", "a line of commits for one experiment, merged if it helps, deleted if not"], ["push, pull", "send commits to GitHub, fetch commits from it"], ["pull request", "a GitHub page that shows a branch's changes before merging"]],
how: ["git init once, then commit early and often, one logical change per commit.", "Write the message as what changed and why: \"add persistence baseline, MAE 2.61\".", "Start an experiment on a branch so main stays working.", "Merge the branch when it improves the result, or delete it if it does not. The log keeps the record either way.", "Push to GitHub at the end of every session. Unpushed work exists on one laptop only."],
say: String.raw`Every commit is a snapshot I can return to, a branch isolates an experiment, and pushing to GitHub makes the history safe and shareable.`,
num: String.raw`Aim for <b>3 to 10 commits per working session</b>. A commit that touches 30 files with the message "stuff" is a sign the round was too big.`,
note: String.raw`The submission is a ZIP of the code and slides, but keep the GitHub repo too. It shows the history of the work if a grader asks how it was built.`,
r(fig, ctl) {
  const steps = [
    { n: 1, b: 0, t: "git init, first commit: folder layout and README", cmd: ["$ git init", "$ git add .", "$ git commit -m \"project layout, README and CLAUDE.md\""] },
    { n: 2, b: 0, t: "second commit on main: data loader", cmd: ["$ git add src/data.py", "$ git commit -m \"load station CSV, print shape and date range\""] },
    { n: 3, b: 0, t: "third commit: persistence baseline, pushed to GitHub", cmd: ["$ git commit -am \"persistence baseline, val MAE 2.61\"", "$ git push origin main"] },
    { n: 3, b: 1, t: "new branch try-lstm for the experiment", cmd: ["$ git checkout -b try-lstm", "Switched to a new branch 'try-lstm'"] },
    { n: 3, b: 2, t: "two commits on the branch", cmd: ["$ git commit -am \"LSTM model and training loop\"", "$ git commit -am \"early stopping, val MAE 1.80\""] },
    { n: 4, b: 3, t: "it helped, so merge into main and push", cmd: ["$ git checkout main", "$ git merge try-lstm", "$ git push origin main"] }
  ];
  const draw = k => {
    const st = steps[k];
    let s = tx(40, 30, "main", null, "th");
    const cx = i => 80 + i * 110;
    for (let i = 0; i < st.n; i++) { if (i) s += `<line x1="${cx(i - 1) + 14}" y1="70" x2="${cx(i) - 14}" y2="70" stroke="var(--p)" stroke-width="2"/>`; s += `<circle cx="${cx(i)}" cy="70" r="14" fill="${C.blue}" stroke="var(--panel)" stroke-width="2"/>` + tx(cx(i), 100, ["c1", "c2", "c3", "c6"][i], "middle"); }
    if (st.b >= 1) {
      s += tx(40, 150, "try-lstm", null, "th") + `<path d="M${cx(2) + 8} 82 C ${cx(2) + 60} 120, ${cx(2) + 60} 150, ${cx(3) - 14} 160" fill="none" stroke="${C.coral}" stroke-width="2" ${st.b < 2 ? 'marker-end="url(#ar)"' : ""}/>`;
      const nb = st.b >= 2 ? 2 : 0;
      for (let i = 0; i < nb; i++) { if (i) s += `<line x1="${cx(3 + i - 1) + 14}" y1="160" x2="${cx(3 + i) - 14}" y2="160" stroke="${C.coral}" stroke-width="2"/>`; s += `<circle cx="${cx(3 + i)}" cy="160" r="14" fill="${C.coral}" stroke="var(--panel)" stroke-width="2"/>` + tx(cx(3 + i), 190, ["c4", "c5"][i], "middle"); }
      if (st.b === 3) s += `<path d="M${cx(4) + 10} 150 C ${cx(4) + 20} 110, ${cx(3) - 40} 100, ${cx(3) - 16} 76" fill="none" stroke="${C.coral}" stroke-width="2" marker-end="url(#ar)"/>` + tx(cx(3), 40, "merge", "middle");
    }
    if (k === 2 || k === 5) s += ML.box(470, 120, 180, 60, "c-teal", ["GitHub", "has main up to " + (k === 2 ? "c3" : "c6")], true);
    s += tx(340, 228, st.t, "middle", "t");
    fig.innerHTML = svg(240, s) + ML.term(st.cmd);
  };
  ML.stepper(ctl, steps.length, draw);
}},

{s: "6. The command", t: "Writing a command the agent cannot misread",
intu: String.raw`A command has four parts: the goal, the context the agent needs, the constraints it must respect, and the check that defines done. Toggle each part on and off and watch the command. With all four, the agent has one way to succeed. With only the goal, it has to guess the file names, the metric, the output location and when to stop, and each guess is a chance to be wrong. The guessing is what people call the agent "hallucinating". It is usually a missing part of the command.`,
eq: String.raw`\[ \text{command} = \text{goal} + \text{context} + \text{constraints} + \text{check} \]`,
sym: [["goal", "one outcome: a function, a figure, a number, a fix"], ["context", "which files, which data, which columns, what already exists"], ["constraints", "rules for this task: library, seed, no test data, where outputs go"], ["check", "what you will look at to decide it is done: a printed shape, an assertion, a plot"]],
how: ["State the goal in one sentence with a verb: add, fix, plot, compare.", "Name the files and columns. The agent can read them, but naming them removes the guess.", "Add constraints that matter for this task. Standing rules are already in CLAUDE.md.", "End with the check. \"Print the shape and the first three rows\" is a check. \"Make it work\" is not.", "When the result is wrong, the next command quotes the wrong output and says what the right one looks like."],
say: String.raw`A good command names the goal, the files, the rules and the check, so done means something I can see, not something the agent decides.`,
num: String.raw`A good command is <b>3 to 8 sentences</b>. Shorter leaves guesses. Much longer usually hides two goals that should be two commands.`,
r(fig, ctl) {
  const P = [["goal", "Add a persistence baseline to the project: predict tomorrow's temperature as today's temperature.", C.teal], ["context", "The processed data is data/processed/station.csv with columns date, tmax, tmin, humidity. Splits are already defined in src/data.py as load_splits().", C.blue], ["constraints", "Put it in src/baselines.py as a function persistence_mae(df). Use only the validation split for the number. No PyTorch needed.", C.amber], ["check", "Run it and paste the validation MAE. Save it as a row in results/metrics.csv with the name persistence.", C.coral]];
  const on = [true, true, true, true];
  ctl.innerHTML = `<div class="row">${P.map((p, i) => `<button data-p="${i}" class="on">${p[0]}</button>`).join("")}</div><div id="cmd"></div>`;
  const u = () => {
    ctl.querySelectorAll("button[data-p]").forEach(b => b.classList.toggle("on", on[+b.dataset.p]));
    let s = "";
    P.forEach((p, i) => { const y = 20 + i * 52; s += `<rect x="30" y="${y}" width="620" height="42" rx="8" fill="${p[2]}" fill-opacity="${on[i] ? 0.2 : 0.04}" stroke="${p[2]}" stroke-width="${on[i] ? 1.6 : 0.6}" ${on[i] ? "" : 'stroke-dasharray="4 4"'}/>` + tx(46, y + 26, p[0], null, "th") + tx(150, y + 26, on[i] ? "included" : "missing, the agent will guess " + ["what to build", "file names and columns", "where it goes and what split to use", "when it is done"][i], null, "t"); });
    const n = on.filter(Boolean).length;
    s += tx(340, 246, n === 4 ? "one way to succeed" : `${4 - n} guess${4 - n > 1 ? "es" : ""} the agent has to make`, "middle", "th");
    fig.innerHTML = svg(260, s);
    $("cmd").innerHTML = `<div style="background:var(--accent-bg);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;margin:8px 0;font-size:14px;line-height:1.55">${P.filter((p, i) => on[i]).map(p => p[1]).join(" ") || "(empty command)"}</div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { on[+b.dataset.p] = !on[+b.dataset.p]; u(); });
  u();
}},

{s: "7. Reading code", t: "Reading code you did not write",
intu: String.raw`You do not need to write Python to read it, but you need a method. Read a file top to bottom in four passes: imports tell you which tools it uses, function signatures tell you what goes in and out, the body of each function tells you how, and the bottom tells you what runs. Step through the four passes on a file the agent might produce. The questions in each pass are the ones to ask about every file in your project.`,
eq: String.raw`\[ \text{imports} \to \text{signatures} \to \text{bodies} \to \text{what runs} \]`,
sym: [["import", "brings a package or module into the file. Unknown import, unknown behavior."], ["def name(args) -> type:", "a function: inputs, output type, and a docstring saying what it promises"], ["body", "the steps. Look for data splits, seeds, and anything fit on data."], ["the main guard", "the block <code>if __name__ == \"__main__\":</code> at the bottom, what happens when the file is run directly"]],
how: ["Pass 1: list the imports. Anything you cannot name, ask the agent what it is for.", "Pass 2: read each def line and docstring. Can you say what each function returns without reading the body?", "Pass 3: in each body, find where data is split and where anything is fit. Fitting on validation or test data is the bug to hunt.", "Pass 4: read the bottom. Does it run what the command asked, and print the check?"],
say: String.raw`I read imports, then signatures, then bodies, then the entry point, and in every body I look for where the data is split and what is fit on which split.`,
num: String.raw`A 60-line file takes <b>about 5 minutes</b> to read this way. That is cheaper than one wrong result in the presentation.`,
note: String.raw`The course's own homework asks you to explain every line you submit. Reading in passes is how you get there for code the agent wrote.`,
r(fig, ctl) {
  const code = ["import numpy as np", "import pandas as pd", "from src.data import load_splits", "", "def persistence_mae(df: pd.DataFrame) -> float:", "    \"\"\"MAE of predicting tomorrow's tmax as today's tmax.\"\"\"", "    pred = df[\"tmax\"].shift(1)        # yesterday's value", "    err = (df[\"tmax\"] - pred).abs()", "    return float(err.iloc[1:].mean())  # skip the first row", "", "if __name__ == \"__main__\":", "    train, val, test = load_splits()", "    mae = persistence_mae(val)", "    print(f\"persistence val MAE: {mae:.2f}\")"];
  const passes = [[[0, 1, 2], "Imports: numpy, pandas, and our own load_splits. Nothing unexpected."], [[4, 5], "Signature: takes a DataFrame, returns a float. The docstring says which column and what prediction."], [[6, 7, 8], "Body: shift(1) uses the previous row, so no future information leaks. The first row has no previous value and is skipped."], [[10, 11, 12, 13], "Entry point: loads the splits, computes on val only, prints the check the command asked for."]];
  const draw = k => {
    const [ls, msg] = passes[k];
    const body = code.map((l, i) => `<span style="display:block;${ls.includes(i) ? "background:var(--accent-bg);box-shadow:inset 3px 0 var(--accent);" : "opacity:.45;"}padding-left:6px">${ML.hl(l) || " "}</span>`).join("");
    fig.innerHTML = `<pre class="codebox" style="padding-left:6px"><code>${body}</code></pre><p class="note"><b>Pass ${k + 1}.</b> ${msg}</p>`;
  };
  ML.stepper(ctl, 4, draw, ["imports", "signatures", "bodies", "what runs"]);
}},

{s: "8. Reading results", t: "Reading results: numbers, curves, and the baseline",
intu: String.raw`A result is a number next to a baseline, or it is nothing. Drag the model's validation error and watch the verdict. Below the baseline means the model learned something. Near the training error with a small gap means it generalizes. A big gap between training and validation means it memorized. The curve on the right shows the same story over epochs: the validation curve is the one that decides, and the epoch where it is lowest is the checkpoint to keep.`,
eq: String.raw`\[ \text{gain} = \text{baseline error} - \text{validation error}, \qquad \text{gap} = \text{validation error} - \text{training error} \]`,
sym: [["baseline", "the simplest rule: predict the mean, or yesterday's value"], ["training error", "error on the data the model fit. Always optimistic."], ["validation error", "error on held-out data used to choose models and epochs"], ["test error", "reported once at the end, never used to choose anything"]],
how: ["Find the baseline number first. Without it a validation MAE of 1.8 means nothing.", "Compare validation to baseline. No gain means the model is not using the inputs.", "Compare validation to training. A large gap means overfitting, so regularize or get more data.", "On a learning curve, pick the epoch with the lowest validation error, not the last epoch.", "Report the test error once, for the model you already chose."],
say: String.raw`I judge a model by its validation error against a baseline and against its own training error, and I pick the checkpoint where validation error is lowest.`,
num: String.raw`For the example station data, persistence MAE is <b>2.61 °C</b>, so a model must be clearly below that. A validation MAE of 1.8 with training MAE 1.7 is a good result. Training 0.4 with validation 1.8 is memorization.`,
r(fig, ctl) {
  ctl.innerHTML = sl("vm", "validation MAE", 0.5, 3.5, 0.05, 1.8) + sl("tm", "training MAE", 0.2, 3.5, 0.05, 1.7) + `<div id="rv"></div>`;
  const u = () => {
    const v = +$("vm").value, t = +$("tm").value, base = 2.61;
    $("vmv").textContent = v.toFixed(2) + " °C"; $("tmv").textContent = t.toFixed(2) + " °C";
    const A = ML.axes(70, 20, 220, 200, { xmin: 0, xmax: 3, ymin: 0, ymax: 3.5, nx: 3, ny: 7, fy: x => x.toFixed(1), yl: "MAE (°C)", fx: () => "" });
    let s = A.s;
    [["baseline", base, C.gray], ["train", t, C.blue], ["val", v, C.coral]].forEach(([n, y, c], i) => { const x = A.X(0.5 + i); s += `<rect x="${x - 30}" y="${A.Y(y)}" width="60" height="${A.Y(0) - A.Y(y)}" fill="${c}" fill-opacity="0.55"/>` + tx(x, A.Y(0) + 16, n, "middle") + tx(x, A.Y(y) - 6, y.toFixed(2), "middle"); });
    s += `<line x1="70" y1="${A.Y(base)}" x2="290" y2="${A.Y(base)}" stroke="${C.gray}" stroke-dasharray="5 4"/>`;
    const B = ML.axes(380, 20, 270, 200, { xmin: 0, xmax: 30, ymin: 0, ymax: 3.5, nx: 3, ny: 7, fy: x => x.toFixed(1), xl: "epoch", fx: x => Math.round(x) });
    s += B.s;
    const ep = range(0, 30, 61), tr = ep.map(e => t + (3.2 - t) * Math.exp(-e / 5)), va = ep.map(e => v + (3.2 - v) * Math.exp(-e / 5) + Math.max(0, (t < v ? (v - t) : 0)) * 0.35 * Math.max(0, e - 12) / 18 * (v > t ? 1 : 0));
    s += ML.path(ep.map((e, i) => [B.X(e), B.Y(tr[i])]), C.blue, 2) + ML.path(ep.map((e, i) => [B.X(e), B.Y(va[i])]), C.coral, 2);
    let im = 0; va.forEach((y, i) => { if (y < va[im]) im = i; });
    s += `<line x1="${B.X(ep[im])}" y1="20" x2="${B.X(ep[im])}" y2="220" stroke="var(--p)" stroke-dasharray="3 3"/>` + tx(B.X(ep[im]), 14, "keep epoch " + Math.round(ep[im]), "middle");
    s += `<line x1="380" y1="${B.Y(base)}" x2="650" y2="${B.Y(base)}" stroke="${C.gray}" stroke-dasharray="5 4"/>`;
    fig.innerHTML = svg(262, s);
    const gain = base - v, gap = v - t;
    const verdict = gain <= 0.05 ? "No gain over the baseline. The model is not using the inputs, or something is wrong in the pipeline." : gap > 0.6 ? "Clear gain, but a large train to validation gap. The model memorizes. Regularize, stop earlier, or add data." : gap < -0.2 ? "Validation below training is unusual. Check the split, the scaler and for leakage." : "Clear gain and a small gap. A sound result to report with its test error.";
    $("rv").innerHTML = ML.readout([["gain over baseline", gain.toFixed(2) + " °C"], ["train to val gap", gap.toFixed(2) + " °C"]]) + `<p class="note"><b>Verdict.</b> ${verdict}</p>`;
  };
  $("vm").oninput = u; $("tm").oninput = u; u();
}},

{s: "9. With the agent", t: "Do it with the agent: set up the project",
intu: String.raw`The first real command of your project creates the workbench itself. Read the command, then what the agent does with it, then the checks you run before accepting. This card has the same three views in every lesson of the shelf. Copy the command, replace the project name and the data file, and you have started.`,
eq: String.raw`\[ \text{command} \to \text{folder} + \text{venv} + \text{git} + \text{first commit} \]`,
sym: [["the command", "goal, context, constraints, check, as in card 6"], ["what the agent does", "the commands it runs and the files it writes"], ["how you check", "the boxes to tick before you accept"]],
how: ["Open an empty folder in VS Code and open the Claude panel.", "Paste the command with your own names.", "Read the agent's report. Open CLAUDE.md and README.md and read them in full.", "Run the verification commands yourself in the terminal.", "Tick every check. Then commit and push."],
say: String.raw`My first command builds the workbench: layout, rules file, environment, requirements and the first commit, each one checked before I move on.`,
num: String.raw`This round takes <b>about 10 minutes</b> including the package download.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Set up a new ML project called weather-lstm in this folder. Create the layout: README.md, CLAUDE.md, requirements.txt, .gitignore, data/raw, data/processed, src, notebooks, results/figures, notes. Write CLAUDE.md with these rules: Python 3.11 in .venv, code in src only, every function has a docstring and type hints, fix random seeds, never fit anything on validation or test data, outputs go to results, update README when run commands change, run scripts and paste real output before saying done. Create a venv in .venv and install numpy, pandas, matplotlib, torch, lightning, and write requirements.txt with pinned versions. Initialize git, add .venv and data to .gitignore, and make the first commit. Check: paste the output of git log --oneline and python -c \"import torch, lightning; print(torch.__version__, lightning.__version__)\".",
    actions: ["$ mkdir -p data/raw data/processed src notebooks results/figures notes", "$ python -m venv .venv && source .venv/bin/activate", "$ pip install numpy pandas matplotlib torch lightning", "$ pip freeze > requirements.txt", "$ git init && git add . && git commit -m \"project layout, rules and environment\"", "[main (root-commit) 3f2a9c1] project layout, rules and environment", "$ python -c \"import torch, lightning; print(torch.__version__, lightning.__version__)\"", "2.5.1 2.4.0"],
    files: [["CLAUDE.md", "the rules you dictated, as a list"], ["README.md", "project name, one-line goal, setup and run sections"], ["requirements.txt", "pinned versions from pip freeze"], [".gitignore", ".venv/, data/, results/checkpoints/, __pycache__/"]],
    checks: ["CLAUDE.md contains every rule I asked for, in my words", "requirements.txt has version numbers, not bare names", "git log --oneline shows one commit with a clear message", "git status shows .venv and data are not tracked", "the import check prints two version numbers with no error", "README.md tells a stranger how to install and run"]
  });
}},

{s: "10. Test", t: "Test: the workbench",
intu: String.raw`Twelve questions on the loop, the folder, the md files, environments, git, commands, reading code and reading results. Answer without looking back. Each answer comes with the reason. At the end you get a score and a review of what you missed.`,
eq: String.raw`\[ \text{12 questions} \;\to\; \text{score} \;\to\; \text{review} \]`,
sym: [["pass mark", "10 of 12, with a reason you can say out loud for each"], ["review", "the missed questions with their answers, shown at the end"]],
how: ["Read the question and all options before clicking.", "Say the reason before you click.", "After the score, reopen the card for each missed question."],
say: String.raw`A test is passed when I can defend every answer, not when the score is high.`,
num: String.raw`<b>12 questions.</b> No time limit.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "In the work loop, which step belongs to you and not the agent?", o: ["Writing the function body", "Running the script", "Deciding the goal and running the check", "Installing packages"], a: 2, why: "The agent writes, runs and installs. You decide what should exist and verify that it does." },
    { q: "Which file does the agent read at the start of every session for standing rules?", o: ["README.md", "CLAUDE.md", "requirements.txt", "notes/experiments.md"], a: 1, why: "CLAUDE.md holds rules for the agent. README.md is for human readers." },
    { q: "Where should a figure produced by a training script be saved?", o: ["src/", "data/raw/", "results/figures/", "notebooks/"], a: 2, why: "Outputs go under results/. src holds code, data/raw is never written by code." },
    { q: "Why is .venv listed in .gitignore?", o: ["It contains secrets", "It is several gigabytes of packages that requirements.txt can rebuild", "git cannot track folders", "It is deleted after each run"], a: 1, why: "The environment is large and reproducible from requirements.txt, so it is not committed." },
    { q: "What does pip freeze > requirements.txt do?", o: ["Installs the packages", "Deletes unused packages", "Writes every installed package with its exact version to the file", "Creates the virtual environment"], a: 2, why: "It records the environment so someone else can rebuild it with pip install -r." },
    { q: "A command says only: make the model better. What is missing?", o: ["Nothing, the agent knows the project", "Context, constraints and a check", "Only the check", "Only the goal"], a: 1, why: "It has a vague goal and no files, rules or definition of done, so the agent must guess all three." },
    { q: "What is a git commit?", o: ["A copy of the project on GitHub", "A snapshot of tracked files plus a message", "A branch", "A package version"], a: 1, why: "A commit is a snapshot in the local history. Pushing sends commits to GitHub." },
    { q: "You want to try an LSTM without risking the working code on main. What do you do?", o: ["git push", "Create a branch, commit there, merge only if it helps", "Delete main first", "Work in a second folder"], a: 1, why: "A branch isolates the experiment. Merge it if it improves the result, otherwise leave it." },
    { q: "In the four-pass reading method, which pass hunts for data fit on the wrong split?", o: ["Imports", "Signatures", "Bodies", "Entry point"], a: 2, why: "Leakage lives inside function bodies, where splits are made and scalers or models are fit." },
    { q: "Baseline MAE 2.61, training MAE 0.4, validation MAE 1.8. What is the verdict?", o: ["Excellent, report it", "No gain over baseline", "Large gain but the model memorizes, regularize or stop earlier", "The split is wrong"], a: 2, why: "Gain is 0.81, good, but the train to validation gap of 1.4 means overfitting." },
    { q: "On a learning curve, which epoch's weights should you keep?", o: ["The last epoch", "The epoch with the lowest training error", "The epoch with the lowest validation error", "Epoch 1"], a: 2, why: "Validation error decides the checkpoint. Training error keeps falling even when the model memorizes." },
    { q: "When is the test error used?", o: ["To pick the learning rate", "To pick the epoch", "Once, at the end, for the model already chosen", "After every epoch"], a: 2, why: "Using the test set to choose anything makes it part of training, and the reported number becomes optimistic." }
  ], "Lesson 0 test");
}}
],
summary: String.raw`You run a loop: decide a small goal, command the agent with goal, context, constraints and a check, let it write and run, then read the code in four passes and judge the result against a baseline before committing. The project is one folder with code in src, data in data, outputs in results and notes in notes, steered by CLAUDE.md for the agent and README.md for readers. A virtual environment and requirements.txt make the code run anywhere, and git with GitHub keeps every version safe. The checkpoint to keep is the one with the lowest validation error, and the test error is reported once at the end.`,
sheet: [
[String.raw`\[ \text{command} = \text{goal} + \text{context} + \text{constraints} + \text{check} \]`, "What every command contains"],
[String.raw`\[ \text{decide} \to \text{write} \to \text{run} \to \text{check} \to \text{commit} \]`, "The work loop, one small goal per round"],
[String.raw`\[ \text{gain} = e_{\text{baseline}} - e_{\text{val}}, \quad \text{gap} = e_{\text{val}} - e_{\text{train}} \]`, "How to read a result"],
[String.raw`\[ \texttt{venv} \to \texttt{activate} \to \texttt{pip install -r requirements.txt} \]`, "Environment setup"],
[String.raw`\[ \texttt{add} \to \texttt{commit} \to \texttt{push}, \qquad \texttt{checkout -b} \to \ldots \to \texttt{merge} \]`, "git, one line of work at a time"]],
sources: ["AME 5970 project guidelines (Fall 2026): 80 % code quality and functionality, 20 % presentation, PyTorch Lightning encouraged", "Pro Git, Chacon and Straub, chapters 2 and 3 (commits and branches)", "Python documentation: venv and pip user guide", "Anthropic, Claude Code best practices (CLAUDE.md, clear commands, verification)", "Hands-on advice from Andrew Ng's Machine Learning Specialization, course 2 (baselines, learning curves)"]
});
})();
