(function () {
/* ML shelf, Part 9, Lesson 45: Finishing the project (Core). The course has no lecture notes on finishing a project, so the order follows the hand-in rules of course/term_project_brief.md (sections 2, 4, 5.7 to 5.9, 7 and 8) and course/project_status.md, with Andrew Ng's Deep Learning Specialization course 3 for test-set discipline and error analysis, and the habits of HW9 4D and HW10 B4 and D3.
   Data: every card uses a labeled synthetic stand-in for the bacterial Raman spectra written for this lesson (30 classes of 1,000-point spectra from 400 to 1800 cm⁻¹ sharing 18 peaks, each class changing three peak heights by a factor from 0.75 to 1.3 and shifting one peak by 1.5 to 3.5 cm⁻¹, with random intensity scale, cubic baselines (25% strong), noise (25% low signal) and calibration jitter). Peak set from default_rng(4545), finetune set of 100 per class from default_rng(4546), test set of 100 per class from default_rng(4547). Models: scikit-learn 1.9.1 LogisticRegression (C = 0.3) and MLPClassifier (128, 64) after StandardScaler fit on the training split, splits by train_test_split(test_size = 0.2, stratify) with random_state 5970, 5971, 5972. Every number was computed in Python and embedded rounded to 4 decimals. */
const C = ML.C;
const D45 = {"runs":[[5970,"raw","lr",0.9154,0.6417,0.6324,2.6],[5970,"raw","mlp",0.8771,0.3633,0.3687,8.0],[5970,"z","lr",0.9892,0.6533,0.6509,2.0],[5970,"z","mlp",0.9688,0.5167,0.5149,4.1],[5970,"sgz","lr",0.9375,0.6983,0.6962,2.1],[5970,"sgz","mlp",0.9317,0.5933,0.5934,4.4],[5970,"basez","lr",1.0,0.7167,0.7153,0.2],[5970,"basez","mlp",1.0,0.6017,0.6025,1.5],[5971,"raw","lr",0.9179,0.6117,0.6041,2.3],[5971,"raw","mlp",0.87,0.3483,0.3549,6.6],[5971,"z","lr",0.9825,0.6283,0.6264,1.9],[5971,"z","mlp",0.9371,0.4783,0.4818,3.5],[5971,"sgz","lr",0.9333,0.7117,0.71,2.1],[5971,"sgz","mlp",0.8971,0.5183,0.5136,4.9],[5971,"basez","lr",1.0,0.68,0.6792,0.2],[5971,"basez","mlp",1.0,0.575,0.5779,1.6],[5972,"raw","lr",0.9213,0.6183,0.6085,2.3],[5972,"raw","mlp",0.8583,0.3367,0.3346,7.0],[5972,"z","lr",0.9838,0.6433,0.6428,1.9],[5972,"z","mlp",0.945,0.4733,0.4717,3.4],[5972,"sgz","lr",0.9304,0.705,0.7032,2.1],[5972,"sgz","mlp",0.9287,0.5717,0.567,5.0],[5972,"basez","lr",1.0,0.68,0.6787,0.2],[5972,"basez","mlp",1.0,0.6167,0.6159,1.5]],"test":{"sgz":[0.691,0.6896],"basez":[0.695,0.6952]},"mc":{"both":1815,"only1":258,"only2":270,"neither":657,"p":0.6322},"val":{"acc":0.6983,"n":600,"errors":181,"low":76,"strong":57,"both":23,"none":71,"n_low":139,"n_strong":119,"n_none":377,"acc_low":0.4532,"acc_clean":0.8117},"lc":[[20,0.9217,0.53],[40,0.93,0.6583],[60,0.9344,0.695],[80,0.9363,0.7]],"seeded":[[0.5933,"21571f76"],[0.5933,"21571f76"]],"unseeded":[[0.5567,"a2026714"],[0.5617,"adf5f00f"]],"cm":[[59,3,3,0,0,0,1,0,3,2,2,0,0,0,5,2,3,0,1,1,2,0,4,2,0,1,3,1,0,2],[4,37,2,0,0,0,1,0,0,3,5,2,1,3,5,0,0,1,1,6,2,0,5,10,0,0,2,0,9,1],[1,0,82,0,2,0,0,0,0,0,2,0,0,2,0,2,0,0,4,1,0,0,1,1,0,0,0,1,1,0],[0,2,0,88,0,0,0,0,3,0,0,0,0,2,0,1,0,3,0,0,0,0,0,0,0,0,1,0,0,0],[1,1,1,0,93,1,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,84,4,1,0,1,0,0,0,0,1,0,0,0,4,0,0,0,2,0,0,1,0,1,0,0],[0,2,0,0,3,3,54,1,0,3,3,0,0,0,2,5,1,2,11,2,1,0,1,0,0,1,1,0,3,1],[0,0,0,0,0,1,2,90,0,1,0,0,0,0,1,0,1,0,0,2,0,0,0,1,0,0,0,0,0,1],[0,0,0,4,0,0,1,1,69,0,2,0,0,0,2,1,0,5,1,1,0,0,6,1,0,2,0,0,1,3],[0,0,0,1,0,0,0,0,1,90,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,2,0,0,2],[1,1,0,0,1,0,1,0,2,0,79,0,0,1,0,1,0,0,1,3,1,3,2,2,0,0,0,0,0,1],[0,3,1,0,0,0,0,0,0,4,0,61,1,1,9,2,0,0,1,5,1,2,2,4,0,0,0,0,2,1],[0,0,1,0,0,0,0,0,0,0,2,0,62,0,0,1,0,0,0,22,0,1,1,0,0,0,0,10,0,0],[0,2,0,0,0,0,0,0,2,0,2,0,0,76,0,0,1,0,0,2,1,3,0,0,0,5,2,1,3,0],[0,1,1,0,2,1,0,0,0,4,1,7,0,0,73,0,1,0,0,0,2,0,3,0,0,1,0,0,2,1],[1,0,0,0,0,1,2,0,2,0,0,0,1,1,0,60,0,0,11,0,0,1,2,0,0,0,4,0,0,14],[2,1,1,0,2,0,0,0,0,2,2,1,0,0,1,0,69,8,1,0,3,2,0,0,0,0,3,0,0,2],[0,0,0,10,2,0,1,0,5,2,4,0,0,4,1,0,1,58,0,0,3,1,1,1,0,3,0,0,1,2],[0,0,0,0,0,2,8,0,0,1,1,0,0,0,0,9,0,0,75,0,0,0,3,1,0,0,0,0,0,0],[2,0,0,0,0,1,0,1,0,0,0,2,13,0,0,0,0,1,0,67,0,1,2,0,0,1,1,5,0,3],[0,1,2,1,1,2,3,1,0,1,0,2,0,3,1,0,0,1,2,1,72,1,0,0,0,2,0,0,3,0],[0,0,0,0,1,0,0,0,1,3,3,0,2,4,1,1,1,1,0,0,1,38,2,1,0,5,22,0,6,7],[1,2,0,0,0,0,1,0,3,1,0,5,0,0,8,2,0,0,2,2,0,0,66,1,0,0,0,0,2,4],[0,9,0,0,0,1,0,0,1,1,0,0,0,1,0,2,0,0,2,3,0,0,0,76,0,0,1,0,0,3],[0,0,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,4,0,0,0,0,92,1,0,0,0,0],[0,0,1,0,0,1,0,0,1,1,0,0,0,1,1,0,1,0,3,0,1,6,0,0,1,64,13,0,3,2],[0,0,0,1,2,1,0,0,0,1,0,0,0,0,4,3,1,0,1,0,0,21,2,1,0,5,48,0,2,7],[0,0,2,1,0,0,0,0,0,0,0,0,9,1,1,1,0,0,0,8,0,0,0,0,0,0,0,76,1,0],[1,1,0,0,1,0,4,0,1,2,3,0,0,7,0,2,0,1,1,0,4,1,4,1,0,4,0,1,58,3],[0,4,0,0,1,2,2,0,0,1,2,1,0,1,0,11,0,0,2,2,3,1,1,2,1,0,4,0,2,57]]};
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => { const s = (+v).toFixed(d == null ? 4 : d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; };
const mn = v => String(v).replace(/-(?=[\d.])/g, "−");
const fm = (v, d) => mn(f(v, d));
const pc = (v, d) => mn(f(100 * v, d == null ? 1 : d)) + "%";
const RO = items => ML.readout(items.map(([k, v]) => [k, mn(v)]));
const TB = (head, rows, hl) => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr>${head.map(h => `<th style="text-align:left;padding:4px 6px;border-bottom:1.5px solid var(--line);color:var(--muted);font-weight:600">${h}</th>`).join("")}</tr>${rows.map((r, i) => `<tr style="${hl && hl.has(i) ? "background:var(--accent-bg)" : ""}">${r.map(c => `<td style="padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:top">${c}</td>`).join("")}</tr>`).join("")}</table>`;
const legend = (items, x0, y, dx) => items.map(([lab, col, dash], i) => `<line x1="${x0 + i * dx}" y1="${y - 4}" x2="${x0 + i * dx + 18}" y2="${y - 4}" stroke="${col}" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` + tx(x0 + i * dx + 23, y, lab)).join("");
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const sdv = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1)); };
const hbar = (x, y, w, h, v, col) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--sunk)" stroke="var(--line)"/><rect x="${x}" y="${y}" width="${Math.max(0, Math.min(1, v)) * w}" height="${h}" rx="3" fill="${col}" opacity="0.8"/>`;
const btnRow = (items, attr) => `<div class="row">${items.map(([v, t]) => `<button data-${attr}="${v}">${t}</button>`).join("")}</div>`;
const on = (ctl, attr, fn) => ctl.querySelectorAll(`button[data-${attr}]`).forEach(b => b.onclick = () => fn(b.dataset[attr]));
const node = (x, y, w, h, lab, sub, cls) => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="${cls === "c-coral" || cls === "c-teal" ? 1.6 : 0.7}"/></g>` + tx(x + w / 2, y + (sub ? h / 2 - 2 : h / 2 + 5), lab, "middle", "th") + (sub ? tx(x + w / 2, y + h / 2 + 14, sub, "middle") : "");
/* Wilson interval and exact two-sided McNemar (binomial with p = 0.5) */
const wilson = (p, n, z) => { z = z || 1.96; const c = (p + z * z / (2 * n)) / (1 + z * z / n), h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n); return [c - h, c + h]; };
const lgam = x => { const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (let j = 0; j < 6; j++) s += g[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); };
const mcnemar = (b, c) => { const n = b + c, k = Math.min(b, c); if (n === 0) return 1; let s = 0; for (let i = 0; i <= k; i++) s += Math.exp(lgam(n + 1) - lgam(i + 1) - lgam(n - i + 1) - n * Math.log(2)); return Math.min(1, 2 * s); };
const PRE = ["raw", "z", "sgz", "basez"], PRN = { raw: "raw spectra", z: "z-score per spectrum", sgz: "Savitzky-Golay + z-score", basez: "baseline removal + z-score" };
const MOD = { lr: "logistic regression", mlp: "MLP (128, 64)" };
const RUNS = D45.runs; /* [seed, pre, model, train acc, val acc, val macro-F1, seconds] */
const grp = (pre, mod) => RUNS.filter(r => r[1] === pre && r[2] === mod);

addLesson("ml", "proj", {
level: "Core", num: "Lesson 45",
id: "ml-proj-l45", title: "Finishing the project", short: "45. Finishing the project",
big: String.raw`Lesson 44 produced results. This lesson turns them into something a grader can run, read and believe. The course gives 80% of the project grade to well-commented code and 20% to a few slides, so the work of the last two weeks is mostly not new modeling. It is one command that reruns everything from the data to the figures, functions a stranger can read, tests that pin the preprocessing, a README and a pinned requirements file, results that live in CSV files and are reported as a mean and spread over seeds, figures that read from the back of the room, a short academic deck with assertion titles and equations, one honest look at the test set, and suggestions for improvement that come from evidence. Every card uses a 30-class synthetic stand-in for the bacterial Raman spectra, so each habit is shown on real numbers.`,
bridge: String.raw`The course has no lecture notes on finishing a project, so the order follows the hand-in rules in the project brief (deliverables, layout, figures, honesty, timeline and the final checklist) and the project status doc, with Ng's Deep Learning Specialization course 3 for test-set discipline and error analysis, and the habits of HW9 4D and HW10 B4 and D3. Lesson 44 built the experiments that this lesson reports. Lessons E1 to E3 turn to exam practice.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The hand-in at a glance", t: "What is graded, what goes in the ZIP, and how many days are left",
intu: String.raw`Start from the grading rule, because it tells you where the last weeks go. The project is 10% of the course grade. Inside it, well-commented source code is worth 80% and a PowerPoint with a few slides (the project, the results, suggestions to improve the model) is worth 20%. So the code carries 8 course points and the slides 2. Graduate students hand in two projects in one ZIP on Canvas. The brief sets a five-week plan that ends with the hand-in week, and a target of finishing both projects' results by about 7 December, a week before the final exam on 14 December. Move the date slider to see which week you are in, what that week should finish, and how many days remain.`,
eq: String.raw`\[ \text{project grade} = 0.8\,\text{code} + 0.2\,\text{slides} \]
\[ \text{course points} = 10 \times (0.8,\ 0.2) = (8,\ 2) \]`,
sym: [["code, 80%", "well-commented source code, PyTorch Lightning encouraged"], ["slides, 20%", "a few slides: the project, the results, suggestions to improve the model"], ["ZIP", "one file on Canvas with code, requirements.txt, README and the PowerPoint"], ["7 December", "the brief's target for finished results"], ["14 December", "the final exam"]],
how: ["Read the two rubric bars and the course points they carry.", "Drag the date to today and read the current week.", "Drag to 7 December and read what should be done.", "Open the ZIP view and read what it must contain."],
say: String.raw`The project is graded 80% on well-commented code and 20% on a few slides, so the last weeks go into code that runs end to end and reads well, and into a short deck that shows the project, the results and evidence-based suggestions to improve the model.`,
num: String.raw`Project 10% of the course: code 8 course points, slides 2. From 10 November there are <b>27 days</b> to the 7 December target and 34 days to the 14 December exam. Brief's weeks: 9 to 15 Nov Raman data and baselines, 16 to 22 Nov the 1D CNN and figures, 23 to 29 Nov and 30 Nov to 6 Dec the fault-tolerance project, 7 to 13 Dec slides, cleanup, README and the ZIP.`,
note: String.raw`The brief's checklist is the grader's view of your work: both projects run end to end from a clean environment with one command each, every file has a header comment and every function a docstring, every result comes from a saved CSV and every figure is regenerated by plots.py, seeds are fixed and reported, the slides contain the project, the method with equations, the results, the limitations and suggestions, and no slide text has semicolons or dashes. Cards 2 to 10 take these in order.`,
r(fig, ctl) {
  const W = [["Week 1", "Raman data loading, baselines, preprocessing study"], ["Week 2", "Raman 1D CNN, augmentation, test once, figures"], ["Week 3", "fault project data, model, fault code, first sweep"], ["Week 4", "noise-aware and fault-aware training, 10-seed sweep, figures"], ["Week 5", "slides, code cleanup and comments, README, ZIP"]];
  const MON = d => { const dt = new Date(Date.UTC(2026, 10, 9 + d)); return dt.getUTCDate() + " " + ["Nov", "Dec"][dt.getUTCMonth() - 10]; };
  let view = "plan";
  ctl.innerHTML = btnRow([["plan", "timeline and rubric"], ["zip", "what the ZIP holds"]], "h1v") + sl("h1d", "date", 0, 35, 1, 1) + `<div id="h1o"></div>`;
  const u = () => {
    pick(ctl, "h1v", view);
    const d = +$("h1d").value; $("h1dv").textContent = MON(d);
    const X = v => 40 + v * 600 / 35;
    let s = "";
    if (view === "plan") {
      s += tx(20, 22, "The brief's five weeks, 9 November to the 14 December exam", null, "th");
      W.forEach(([w, job], i) => { const cls = Math.floor(d / 7) === i && d < 35 ? "c-teal" : "c-gray"; s += `<g class="${cls}"><rect x="${X(7 * i) + 2}" y="38" width="${600 / 5 - 4}" height="52" rx="6" stroke-width="0.8"/></g>` + tx(X(7 * i) + 60, 58, w, "middle", "th") + tx(X(7 * i) + 60, 78, MON(7 * i) + " to " + MON(7 * i + 6), "middle"); });
      s += `<line x1="${X(28)}" y1="30" x2="${X(28)}" y2="112" stroke="${C.amber}" stroke-width="2" stroke-dasharray="4 3"/>` + tx(X(28), 126, "7 Dec target", "middle");
      s += `<line x1="${X(35)}" y1="30" x2="${X(35)}" y2="112" stroke="${C.coral}" stroke-width="2"/>` + tx(X(35) - 4, 126, "exam", "end");
      s += `<circle cx="${X(d)}" cy="102" r="7" fill="${C.blue}"/>` + tx(X(d), 146, MON(d), "middle", "th");
      s += tx(20, 182, "How the project grade splits", null, "th");
      s += tx(150, 210, "code, 80%", "end") + hbar(160, 196, 400, 20, 0.8, C.teal) + tx(568, 210, "8 course points");
      s += tx(150, 240, "slides, 20%", "end") + hbar(160, 226, 400, 20, 0.2, C.purple) + tx(568, 240, "2 course points");
      fig.innerHTML = svg(262, s);
    } else {
      const items = [["ame5970-projects/", 0], ["README.md", 1], ["requirements.txt", 1], ["common/  (seeding, plotting style)", 1], ["project1_raman/  data.py  preprocess.py  models.py  train.py  evaluate.py  plots.py", 1], ["project1_raman/results/  CSV files and PNG figures", 1], ["project2_fault_tolerance/  data.py  model.py  faults.py  train.py  evaluate.py  plots.py", 1], ["project2_fault_tolerance/results/", 1], ["slides/  the PowerPoint (.pptx)", 1], ["tests/  pytest files", 1]];
      s += tx(20, 22, "The ZIP, laid out as the brief suggests", null, "th");
      items.forEach(([t, lv], i) => { s += `<rect x="${30 + lv * 24}" y="${36 + i * 26}" width="${12}" height="12" rx="2" fill="${lv ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${C.teal}"/>` + tx(50 + lv * 24, 47 + i * 26, ML.esc(t)); });
      s += tx(30, 316, "Left out: .venv, __pycache__, the raw data files and large checkpoints (card 5).");
      fig.innerHTML = svg(330, s);
    }
    const wk = Math.min(4, Math.floor(d / 7));
    $("h1o").innerHTML = RO([["date", MON(d)], ["week", d >= 35 ? "exam day" : W[wk][0] + ": " + W[wk][1]], ["days to the 7 Dec target", Math.max(0, 28 - d)], ["days to the exam", 35 - d]]);
  };
  on(ctl, "h1v", v => { view = v; u(); }); $("h1d").oninput = u;
  u();
}},

{s: "2. One command, end to end", t: "Every number on a slide is rebuilt by one command from the data, the code, the config and the seed",
intu: String.raw`The first checklist item is that each project runs end to end from a clean environment with one command. That is only possible when every step is a script that reads files and writes files: data.py checks the arrays, preprocess.py writes the processed spectra, train.py writes checkpoints, evaluate.py writes results CSV files, plots.py turns the CSV files into PNG figures, and the slides only paste those figures and numbers. Then a result is a function of four things you can name, and changing one of them tells you exactly which steps must run again. Click a file to mark it changed and watch what goes stale downstream. The seed is the fourth input: with it fixed, two runs of the same MLP write byte-identical results rows, without it they do not.`,
eq: String.raw`\[ \text{result} = f(\text{data},\ \text{code},\ \text{config},\ \text{seed}) \]`,
sym: [[String.raw`\(\texttt{run\_all}\)`, "one entry point, for example <code>python -m project1_raman.run_all</code>, that calls every step in order"], ["config", "one file with every number you might change: preprocessing, model sizes, epochs, seeds"], ["results/*.csv", "the only place a number lives, the slides read from here"], ["seed", "fixed in numpy, torch and Lightning's <code>seed_everything</code>, and written in every results row"], ["md5", "a fingerprint of a file, equal fingerprints mean byte-identical files"]],
how: ["Click preprocess.py and read which steps go stale.", "Click plots.py: only the figures and slides change.", "Click config: everything downstream of the data reruns.", "Switch the seed off and compare the two reruns."],
say: String.raw`Each project is rebuilt by one command from the data, the code, the configuration and the seed, every step reads and writes files, so a change to one file names exactly which later steps must run again, and a fixed seed makes reruns byte-identical.`,
num: String.raw`MLP on Savitzky-Golay plus z-score spectra, validation split of seed 5970: with <code>random_state</code> 5970 both reruns give <b>0.5933</b> and the results row hashes to 21571f76 both times. With no seed the two reruns give 0.5567 and 0.5617 and hash to a2026714 and adf5f00f.`,
note: String.raw`A notebook run cell by cell in an order you no longer remember is the most common way to hand in a number nobody can reproduce, including you. Keep notebooks for looking, and put every step that feeds a slide in a script. Lesson 27's Lightning skeleton is already shaped this way, and Lesson 26 showed which random choices the seed controls.`,
r(fig, ctl) {
  const N = [["data.py", "checks arrays"], ["preprocess.py", "spectra"], ["train.py", "checkpoints"], ["evaluate.py", "results CSV"], ["plots.py", "figures PNG"], ["slides", "pastes both"]];
  let ch = 1, seed = 1;
  ctl.innerHTML = btnRow([[-1, "config"]].concat(N.slice(0, 5).map((n, i) => [i, n[0]])), "h2c") + btnRow([[1, "seed fixed"], [0, "no seed"]], "h2s") + `<div id="h2o"></div>`;
  const u = () => {
    pick(ctl, "h2c", ch); pick(ctl, "h2s", seed);
    const first = ch === -1 ? 1 : ch;
    let s = tx(20, 22, ch === -1 ? "config changed: every step that reads it reruns" : N[ch][0] + " changed: it and everything after it reruns", null, "th");
    N.forEach(([a, b], i) => { const x = 6 + i * 112, cls = i === ch ? "c-coral" : i >= first ? "c-teal" : "c-gray"; s += node(x, 70, 104, 56, a, b, cls); if (i < 5) s += arrow(x + 105, 98, x + 111, 98, "var(--p)", 1.4); });
    s += node(240, 160, 200, 40, "config.yaml", null, ch === -1 ? "c-coral" : "c-gray");
    [1, 2, 3].forEach(i => { s += `<line x1="340" y1="160" x2="${6 + i * 112 + 52}" y2="128" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3" marker-end="url(#ar)"/>`; });
    s += `<rect x="20" y="222" width="14" height="14" rx="3" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(40, 234, "must run again") + `<rect x="170" y="222" width="14" height="14" rx="3" fill="var(--sunk)" stroke="var(--line)"/>` + tx(190, 234, "still valid, reuse its files");
    const R = seed ? D45.seeded : D45.unseeded;
    s += tx(20, 272, "Two reruns of the same MLP, " + (seed ? "random_state = 5970" : "random_state = None"), null, "th");
    R.forEach(([acc, h], i) => { s += tx(40, 300 + i * 24, "run " + (i + 1) + ":  validation accuracy " + f(acc, 4) + "    results row md5 " + h); });
    s += tx(40, 352, R[0][1] === R[1][1] ? "identical files, the number on the slide can be rebuilt" : "different files, the number on the slide cannot be rebuilt", null, "th");
    fig.innerHTML = svg(366, s);
    const stale = ch === -1 ? N.slice(1).map(n => n[0]) : N.slice(ch).map(n => n[0]);
    $("h2o").innerHTML = RO([["steps to rerun", stale.length], ["first stale step", stale[0]], ["accuracy difference between reruns", f(Math.abs(R[0][0] - R[1][0]), 4)]]);
  };
  on(ctl, "h2c", v => { ch = +v; u(); }); on(ctl, "h2s", v => { seed = +v; u(); });
  u();
}},

{s: "3. Code that reads well", t: "The same baseline-removal code in four versions, scored by a checker as you go",
intu: String.raw`Code quality is 80% of the grade, and a grader reads code the way you read a paper: the header says what the file is for, the name says what a function does, the docstring says what goes in and what comes out, and nothing needs to be guessed. Step through four versions of one preprocessing function. Version 1 works but is called proc, has one-letter parameters and recomputes a pseudoinverse 31 times per spectrum. Version 2 adds a header comment and real names. Version 3 adds docstrings and type hints. Version 4 checks its input, computes the pseudoinverse once and splits two jobs into two functions. The checker above the code is computed from the code text shown, and the output of version 4 equals version 1 exactly.`,
eq: String.raw`\[ \text{one function} = \text{one job} + \text{a name} + \text{a docstring} + \text{checked inputs} \]`,
sym: [["header comment", "the first lines of the file: what it does and how to run it"], ["docstring", "the triple-quoted text under def: purpose, arguments with shapes, return value"], ["type hints", String.raw`<code>spectra: np.ndarray</code>, read by people and by tools, not enforced at run time`], ["magic number", "a bare constant such as 30 in a loop, give it a name or a config entry"], ["refactor", "a change in structure that keeps the output identical, checked by a test"]],
how: ["Read version 1 and guess what d and n mean.", "Step to version 2 and read the names.", "Step to version 3 and read the docstring.", "Step to version 4 and read the checker results."],
say: String.raw`Readable code has a header comment per file, a descriptive name, a docstring with shapes for every function, checked inputs, no unexplained constants and one job per function, and a refactor is accepted only when a test shows the output did not change.`,
num: String.raw`Versions 1 and 4 applied to 200 stand-in spectra: largest absolute difference <b>0.0</b>. Version 1 computes np.linalg.pinv 31 times per spectrum, version 4 once per call. The checker counts in the readout come from the code text of each version.`,
note: String.raw`Ask the agent for a refactor only with a test that compares old and new outputs on saved inputs, as card 4 does. Comments should say why, not repeat what the line says: "iterate so the fit sinks under the peaks" helps, "loop 30 times" does not. Keep Lightning's training_step short and put the science in named functions that are easy to test.`,
r(fig, ctl) {
  const V = [
    ["def proc(X, d=3, n=30):", "    t = np.linspace(-1, 1, X.shape[1])", "    V = np.vander(t, d + 1)", "    out = []", "    for x in X:", "        y = x.copy()", "        c = np.linalg.pinv(V) @ y", "        for i in range(n):", "            y = np.minimum(y, V @ c)", "            c = np.linalg.pinv(V) @ y", "        z = x - V @ c", "        out.append((z - z.mean()) / z.std())", "    return np.array(out)"],
    ["# preprocess.py: baseline removal and normalization for Raman spectra.", "# Run through run_all.py, settings come from config.yaml.", "def remove_baseline_and_normalize(spectra, degree=3, n_iter=30):", "    t = np.linspace(-1.0, 1.0, spectra.shape[1])", "    vander = np.vander(t, degree + 1)", "    out = []", "    for spectrum in spectra:", "        target = spectrum.copy()", "        coef = np.linalg.pinv(vander) @ target", "        for _ in range(n_iter):", "            target = np.minimum(target, vander @ coef)", "            coef = np.linalg.pinv(vander) @ target", "        corrected = spectrum - vander @ coef", "        out.append((corrected - corrected.mean()) / corrected.std())", "    return np.array(out)"],
    ["# preprocess.py: baseline removal and normalization for Raman spectra.", "# Run through run_all.py, settings come from config.yaml.", "def remove_baseline_and_normalize(spectra: np.ndarray, degree: int = 3,", "                                  n_iter: int = 30) -> np.ndarray:", "    \"\"\"Subtract an iterative polynomial baseline, then z-score each spectrum.", "", "    spectra: (n_spectra, n_points). Returns an array of the same shape.", "    \"\"\"", "    t = np.linspace(-1.0, 1.0, spectra.shape[1])", "    vander = np.vander(t, degree + 1)", "    out = []", "    for spectrum in spectra:", "        target = spectrum.copy()", "        coef = np.linalg.pinv(vander) @ target", "        for _ in range(n_iter):", "            target = np.minimum(target, vander @ coef)", "            coef = np.linalg.pinv(vander) @ target", "        corrected = spectrum - vander @ coef", "        out.append((corrected - corrected.mean()) / corrected.std())", "    return np.array(out)"],
    ["# preprocess.py: baseline removal and normalization for Raman spectra.", "# Run through run_all.py, settings come from config.yaml.", "def remove_baseline(spectra: np.ndarray, degree: int = 3,", "                    n_iter: int = 30) -> np.ndarray:", "    \"\"\"Subtract an iterative polynomial baseline (modified polyfit).", "", "    spectra: (n_spectra, n_points). Returns float corrected spectra.", "    \"\"\"", "    assert spectra.ndim == 2, \"expected (n_spectra, n_points)\"", "    t = np.linspace(-1.0, 1.0, spectra.shape[1])", "    vander = np.vander(t, degree + 1)", "    pinv = np.linalg.pinv(vander)  # same for every spectrum", "    corrected = np.empty_like(spectra, dtype=float)", "    for i, spectrum in enumerate(spectra):", "        target = spectrum.astype(float)", "        coef = pinv @ target", "        for _ in range(n_iter):  # the fit sinks under the peaks", "            target = np.minimum(target, vander @ coef)", "            coef = pinv @ target", "        corrected[i] = spectrum - vander @ coef", "    return corrected", "", "def zscore_per_spectrum(spectra: np.ndarray) -> np.ndarray:", "    \"\"\"Scale each spectrum (row) to mean 0 and standard deviation 1.\"\"\"", "    m = spectra.mean(axis=1, keepdims=True)", "    return (spectra - m) / spectra.std(axis=1, keepdims=True)"]];
  const check = L => {
    const defs = L.map((l, i) => [l, i]).filter(([l]) => /^\s*def /.test(l));
    const doc = defs.filter(([, i]) => { for (let j = i + 1; j < Math.min(L.length, i + 3); j++) if (/^\s*"""/.test(L[j])) return true; return false; }).length;
    const sig = defs.map(([l, i]) => { let s = l, j = i; while (!/:\s*$/.test(L[j]) && j < L.length - 1) { j++; s += L[j]; } return s; });
    const params = sig.flatMap(s => (s.match(/\(([^)]*)\)/) || ["", ""])[1].split(",").map(p => p.trim().split(/[:=\s]/)[0]).filter(Boolean));
    const short = params.filter(p => p.length === 1).length;
    const hints = sig.filter(s => /->/.test(s)).length;
    const pinvLoop = L.some(l => /^\s{8,}.*np\.linalg\.pinv/.test(l));
    return { header: /^#/.test(L[0]), defs: defs.length, doc, short, hints, check: L.some(l => /assert /.test(l)), pinvLoop, lines: L.length, comments: L.filter(l => /#/.test(l)).length };
  };
  ML.stepper(ctl, 4, k => {
    const c = check(V[k]);
    const rows = [["header comment", c.header], ["functions with a docstring", c.doc === c.defs], ["no one-letter parameters", c.short === 0], ["type hints on every function", c.hints === c.defs], ["input checked", c.check], ["no pinv recomputed in the loop", !c.pinvLoop]];
    const ok = rows.filter(r => r[1]).length;
    let s = tx(20, 22, "Checker on version " + (k + 1) + ": " + ok + " of 6 rules pass", null, "th");
    rows.forEach(([t, p], i) => { const y = 36 + i * 24; s += `<g class="${p ? "c-teal" : "c-coral"}"><rect x="20" y="${y}" width="16" height="16" rx="4" stroke-width="1"/></g>` + tx(28, y + 13, p ? "✓" : "✗", "middle") + tx(46, y + 13, t); });
    fig.innerHTML = svg(186, s) + ML.code(V[k], -1);
    ctl.querySelector("#h3o") ? 0 : ctl.insertAdjacentHTML("beforeend", `<div id="h3o"></div>`);
    $("h3o").innerHTML = RO([["functions", c.defs], ["with a docstring", c.doc], ["one-letter parameters", c.short], ["lines", c.lines], ["comment lines", c.comments], ["rules passed", ok + " of 6"]]);
  }, ["proc with one-letter names", "header and names", "docstring and type hints", "checked, faster, one job each"]);
}},

{s: "4. Tests that pin the preprocessing", t: "A spectrum with a known baseline: the test that catches a plain polynomial fit",
intu: String.raw`A test feeds a function an input whose right answer you know and fails loudly when the output is wrong. For baseline removal the right input is built by hand: three Gaussian peaks of known height (1.0, 0.6 and 1.4) on a known cubic baseline. A good method returns the peaks at their heights and nothing below zero. Try it. A plain least-squares polynomial of degree 3 is pulled up by the peaks, so it cuts into them and leaves negative dips, and the 0.6 peak comes back as 0.4966. Raise the iterations: each pass replaces the signal by the smaller of itself and the fit, so the fit sinks under the peaks and recovers the baseline (the modified polyfit of Lieber and Mahadevan-Jansen). Too low a degree cannot follow the baseline at all, too high a degree starts to bend into the peaks. The three test lines below the plot pass or fail live.`,
eq: String.raw`\[ c^{(k)} = \arg\min_c \lVert y^{(k)} - Vc \rVert^2 \]
\[ y^{(k+1)} = \min\!\big(y^{(k)},\ Vc^{(k)}\big) \]`,
sym: [[String.raw`\(V\)`, "Vandermonde matrix of the scaled axis, one column per power up to the degree"], [String.raw`\(y^{(0)}\)`, "the measured spectrum"], [String.raw`\(Vc^{(k)}\)`, "the baseline estimate after k passes"], ["degree", "polynomial order of the baseline, 3 in the brief's baseline removal"], ["tolerance", "how far a pinned number may move before the test fails, 0.01 here"]],
how: ["Start at degree 3 with no iterations and read the peak heights.", "Raise the iterations to 30 and watch the tests turn green.", "Drop the degree to 1 with 30 iterations.", "Try degree 6 and compare the baseline error with degree 3."],
say: String.raw`A preprocessing test builds an input with a known answer, here peaks of known height on a known cubic baseline, and asserts the output within a tolerance, which catches a plain polynomial fit that the peaks pull upward.`,
num: String.raw`Degree 3, no iterations: peaks 0.9214, 0.4966, 1.3326, lowest residual −0.102, baseline RMSE 0.0746. Degree 3 with 30 iterations: peaks <b>1.0016, 0.5997, 1.4006</b>, lowest −0.0002, RMSE 0.0028. Degree 1 with 30: RMSE 0.3989. Degree 6 with 30: RMSE 0.0122.`,
note: String.raw`On real spectra you do not know the baseline, which is why the test uses a synthetic one. Write the test before trusting the function, and keep the input in tests/ so a later change to preprocess.py has to pass the same check. The pytest version is three asserts with <code>abs(height - 0.6) &lt; 0.01</code>, the lowest residual and the baseline error.`,
r(fig, ctl) {
  const P = 1000, WNs = Array.from({ length: P }, (_, i) => 400 + 1400 * i / (P - 1)), tt = WNs.map(w => (w - 1100) / 700);
  const PK = [[700, 1.0, 12], [1000, 0.6, 20], [1450, 1.4, 10]];
  const base = tt.map(t => 1.5 + 0.8 * t - 0.6 * t * t + 0.4 * t * t * t);
  const y0 = WNs.map((w, i) => base[i] + PK.reduce((s, [c, h, wd]) => s + h * Math.exp(-0.5 * ((w - c) / wd) ** 2), 0));
  const ts = Array.from({ length: P }, (_, i) => -1 + 2 * i / (P - 1));
  const fit = (y, deg) => { const n = deg + 1, A = Array.from({ length: n }, () => new Array(n).fill(0)), b = new Array(n).fill(0);
    for (let i = 0; i < P; i++) { const pw = [1]; for (let j = 1; j < n; j++) pw.push(pw[j - 1] * ts[i]); for (let r = 0; r < n; r++) { b[r] += pw[r] * y[i]; for (let q = 0; q < n; q++) A[r][q] += pw[r] * pw[q]; } }
    for (let c = 0; c < n; c++) { let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]]; for (let r = c + 1; r < n; r++) { const fct = A[r][c] / A[c][c]; for (let q = c; q < n; q++) A[r][q] -= fct * A[c][q]; b[r] -= fct * b[c]; } }
    const x = new Array(n).fill(0); for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let q = r + 1; q < n; q++) s -= A[r][q] * x[q]; x[r] = s / A[r][r]; }
    return ts.map(t => { let s = 0, p = 1; for (let j = 0; j < n; j++) { s += x[j] * p; p *= t; } return s; }); };
  ctl.innerHTML = sl("h4d", "degree", 1, 6, 1, 3) + `<div class="row"><span class="sm">iterations</span>${[0, 10, 30, 100].map(v => `<button data-h4i="${v}">${v}</button>`).join("")}</div><div id="h4o"></div>`;
  let it = 0;
  const u = () => {
    pick(ctl, "h4i", it);
    const deg = +$("h4d").value; $("h4dv").textContent = deg;
    let y = y0.slice(), b = fit(y, deg);
    for (let k = 0; k < it; k++) { y = y.map((v, i) => Math.min(v, b[i])); b = fit(y, deg); }
    const r = y0.map((v, i) => v - b[i]), rm = Math.sqrt(mean(b.map((v, i) => (v - base[i]) ** 2)));
    const hs = PK.map(([c]) => { let m = 0; WNs.forEach((w, i) => { if (Math.abs(w - c) < Math.abs(WNs[m] - c)) m = i; }); return r[m]; });
    const lo = Math.min(...r);
    const ax = ML.axes(70, 30, 580, 150, { xmin: 400, xmax: 1800, ymin: 0, ymax: 4, nx: 7, ny: 4, fx: v => Math.round(v), fy: v => f(v, 0), yl: "intensity" });
    const ax2 = ML.axes(70, 214, 580, 110, { xmin: 400, xmax: 1800, ymin: -0.5, ymax: 1.5, nx: 7, ny: 4, fx: v => Math.round(v), fy: v => fm(v, 1), xl: "Raman shift (cm⁻¹)", yl: "corrected" });
    let s = tx(70, 20, "Test spectrum, true baseline and the fitted baseline", null, "th") + ax.s + ML.path(WNs.map((w, i) => [ax.X(w), ax.Y(y0[i])]), C.blue, 1.6) + ML.path(WNs.map((w, i) => [ax.X(w), ax.Y(base[i])]), C.teal, 2, "5 4") + ML.path(WNs.map((w, i) => [ax.X(w), ax.Y(b[i])]), C.coral, 2);
    s += legend([["spectrum", C.blue], ["true baseline", C.teal, "5 4"], ["fitted baseline", C.coral]], 90, 46, 150);
    s += ax2.s + `<line x1="70" y1="${ax2.Y(0)}" x2="650" y2="${ax2.Y(0)}" stroke="var(--muted)" stroke-width="1"/>` + ML.path(WNs.map((w, i) => [ax2.X(w), ax2.Y(Math.max(-0.5, r[i]))]), C.purple, 1.6);
    PK.forEach(([c, h]) => { s += `<line x1="${ax2.X(c) - 12}" y1="${ax2.Y(h)}" x2="${ax2.X(c) + 12}" y2="${ax2.Y(h)}" stroke="${C.teal}" stroke-width="2"/>`; });
    const T = [["test_peak_heights", hs.every((v, i) => Math.abs(v - PK[i][1]) < 0.01), "all three within 0.01 of 1.0, 0.6, 1.4"], ["test_no_negative_dips", lo > -0.01, "lowest corrected value above −0.01"], ["test_baseline_error", rm < 0.01, "baseline RMSE below 0.01"]];
    T.forEach(([n, p, d], i) => { const yy = 372 + i * 22; s += `<g class="${p ? "c-teal" : "c-coral"}"><rect x="70" y="${yy - 13}" width="58" height="18" rx="4" stroke-width="1"/></g>` + tx(99, yy, p ? "PASS" : "FAIL", "middle") + tx(138, yy, n + ": " + d); });
    fig.innerHTML = svg(430, s);
    $("h4o").innerHTML = RO([["peak heights", hs.map(v => f(v, 4)).join(", ")], ["lowest corrected value", f(lo, 4)], ["baseline RMSE", f(rm, 4)], ["tests passed", T.filter(t => t[1]).length + " of 3"]]);
  };
  $("h4d").oninput = u; on(ctl, "h4i", v => { it = +v; u(); });
  u();
}},

{s: "5. README, requirements and the ZIP", t: "What a grader reads first, the versions that make it run, and what stays out of the ZIP",
intu: String.raw`The README is the first file a grader opens, so it answers in order: what the project is, where the data come from and where to put them, how to set up the environment, the one command per project, what the results are, how the folders are laid out, and how to reproduce a number. The requirements file is the environment as text. Writing <code>torch</code> alone installs whatever is newest on the day the grader runs it, writing <code>torch==2.15.0</code> installs what you tested. Eight lines you write pull in many more packages that pip resolves. The ZIP holds code and small results and leaves out what the grader rebuilds or downloads: the virtual environment, caches, the data files and large checkpoints. Click each view.`,
eq: String.raw`\[ \text{bytes} = n_{\text{values}} \times \text{bytes per value} \]
\[ 3000 \times 1000 \times 8 = 24\ \text{MB} \]`,
sym: [["README.md", "project, data, setup, one command, results, layout, reproducibility, citation"], ["requirements.txt", "one package per line with an exact version, made from pip freeze in the working venv"], [String.raw`\(==\)`, "pin: install exactly this version"], ["float64", "8 bytes per value, float32 is 4"], ["checkpoint", "weights, plus optimizer state when saved by Lightning (Adam keeps two more values per weight)"]],
how: ["Click through the README sections and read what breaks without each.", "Open requirements and compare 8 lines with what pip resolves.", "Open the ZIP view and toggle the data and the checkpoints."],
say: String.raw`The README tells a stranger what the project is, where the data come from, how to install, the one command to run and the results, the requirements file pins every version that was tested, and the ZIP holds code and results but not the virtual environment, caches or the data.`,
num: String.raw`The brief's eight packages, resolved by pip on 10 November 2026 (Linux, Python 3.13): <b>63 packages</b>, 19 of them NVIDIA CUDA libraries a Windows CPU laptop does not get. Data: 3,000 by 1,000 spectra are 24 MB each in float64, 12 MB in float32. The brief's Raman CNN has 11,102 parameters, 44,408 bytes of weights and 133,224 bytes with Adam's two moments. The fault-tolerance CNN has 421,642 parameters, 1.69 MB and 5.06 MB.`,
note: String.raw`Make the requirements file from the environment that ran your final results (<code>pip freeze &gt; requirements.txt</code> on the laptop), then remove packages you only used for exploring. State the Python version in the README, the brief recommends 3.12. Say in the README that the Raman data are downloaded from the authors' links and cite Ho et al. (2019) and its MIT license.`,
r(fig, ctl) {
  const RD = [["# Title and one paragraph", "what the project does and the main result", "the grader does not know what they are running"], ["## Data", "source, license, the four .npy files and where to put them", "data.py fails with a missing file and no hint"], ["## Setup", "Python 3.12, python -m venv .venv, pip install -r requirements.txt", "the grader guesses versions"], ["## Run", "python -m project1_raman.run_all, about how long it takes", "nobody knows which script is the entry point"], ["## Results", "the main table from results/*.csv, mean ± SD over seeds", "numbers on the slides have no source"], ["## Layout", "one line per file: what it does", "the grader opens files at random"], ["## Reproducibility", "seeds, splits, hardware, the commit that made the figures", "a rerun gives different numbers with no explanation"], ["## References", "Ho et al. 2019, Li et al. 2023, the course", "the data source is not credited"]];
  const REQ = ["torch==2.15.0", "torchvision==0.29.2", "lightning==2.6.6", "numpy==2.5.4", "scipy==1.18.1", "matplotlib==3.11.2", "scikit-learn==1.9.1", "pandas==3.1.1"];
  const Z = [["code, tests, README, requirements", null, 1], ["results CSV files and PNG figures", null, 1], ["slides .pptx", null, 1], ["Raman CNN checkpoint, weights only", 44408, 1], ["Raman CNN checkpoint with Adam state", 133224, 0], ["fault CNN checkpoint, weights only", 1686568, 1], ["fault CNN checkpoint with Adam state", 5059704, 0], ["X_finetune.npy and X_test.npy, float64", 48000000, 0], [".venv and __pycache__", null, 0]];
  let view = "readme", sec = 3, inc = Z.map(z => z[2]);
  ctl.innerHTML = btnRow([["readme", "README"], ["req", "requirements"], ["zip", "ZIP contents"]], "h5v") + `<div id="h5x"></div><div id="h5o"></div>`;
  const u = () => {
    pick(ctl, "h5v", view);
    let s = "", ro = [];
    if (view === "readme") {
      $("h5x").innerHTML = btnRow(RD.map((r, i) => [i, r[0].replace(/^#+ /, "")]), "h5s"); pick(ctl, "h5s", sec);
      on(ctl, "h5s", v => { sec = +v; u(); });
      s += tx(20, 22, "README.md, top to bottom", null, "th");
      RD.forEach(([h, w], i) => { const y = 34 + i * 34; s += `<g class="${i === sec ? "c-teal" : "c-gray"}"><rect x="20" y="${y}" width="640" height="28" rx="6" stroke-width="${i === sec ? 1.5 : 0.6}"/></g>` + tx(32, y + 19, ML.esc(h), null, "th") + tx(260, y + 19, ML.esc(w)); });
      s += tx(20, 322, "Without this section: " + RD[sec][2] + ".", null, "th");
      fig.innerHTML = svg(336, s);
      ro = [["section", RD[sec][0].replace(/^#+ /, "")], ["sections", RD.length]];
    } else if (view === "req") {
      $("h5x").innerHTML = "";
      s += tx(20, 22, "requirements.txt you write", null, "th") + tx(360, 22, "what pip installs from it", null, "th");
      REQ.forEach((r, i) => { s += tx(30, 50 + i * 22, r); });
      const groups = [["the 8 you asked for", 8, C.teal], ["their other dependencies", 36, C.blue], ["NVIDIA CUDA libraries and triton (Linux only)", 19, C.gray]];
      let y0 = 40; groups.forEach(([t, n, col]) => { s += `<rect x="360" y="${y0}" width="40" height="${n * 3.4}" fill="${col}" opacity="0.75" rx="3"/>` + tx(410, y0 + n * 1.7 + 4, n + " " + t); y0 += n * 3.4 + 4; });
      s += tx(30, 250, "Unpinned, torch installs the newest release on the grader's day.");
      s += tx(30, 272, "Pinned with ==, it installs the version your results came from.");
      fig.innerHTML = svg(290, s);
      ro = [["lines you write", 8], ["packages pip resolves", 63], ["CUDA packages on Linux", 19], ["resolved for", "Python 3.13, Linux, 10 Nov 2026"]];
    } else {
      $("h5x").innerHTML = btnRow(Z.map((z, i) => [i, (inc[i] ? "✓ " : "☐ ") + z[0]]), "h5z");
      on(ctl, "h5z", v => { inc[+v] = 1 - inc[+v]; u(); });
      s += tx(20, 22, "What goes in the ZIP", null, "th");
      const mx = 48000000;
      Z.forEach(([t, b], i) => { const y = 36 + i * 28; s += tx(250, y + 14, t, "end") + (b == null ? tx(262, y + 14, i === 8 ? "hundreds of MB, never ship it" : "small") : hbar(260, y, 260, 18, Math.max(0.004, b / mx), inc[i] ? C.teal : C.gray) + tx(528, y + 14, (b / 1e6).toFixed(b < 1e6 ? 3 : 2) + " MB")) + (inc[i] ? "" : tx(660, y + 14, "left out", "end")); });
      fig.innerHTML = svg(300, s);
      const tot = Z.reduce((a, z, i) => a + (inc[i] && z[1] ? z[1] : 0), 0);
      ro = [["measured items included", (tot / 1e6).toFixed(2) + " MB"], ["venv included", inc[8] ? "yes, remove it" : "no"], ["data included", inc[7] ? "yes, 48 MB, link it instead" : "no, the README links it"]];
    }
    $("h5o").innerHTML = RO(ro);
  };
  on(ctl, "h5v", v => { view = v; u(); });
  u();
}},

{s: "6. Results as files, reported over seeds", t: "From runs.csv to the slide table: one seed, the mean and spread, and the best-seed trap",
intu: String.raw`Every run appends one row to results/runs.csv: seed, preprocessing, model and the metrics. The slide table is computed from that file, never typed. Here are the 24 runs of the brief's preprocessing study on the stand-in: four preprocessing choices, logistic regression and a two-layer MLP, three seeds that change both the split and the initialization. Look at seed 5970 alone and baseline removal wins. Average over the three seeds and Savitzky-Golay smoothing wins, with a third of the spread. Pick the best seed of each configuration and you report a number no rerun will give. The mean and standard deviation over seeds is what goes on the slide, written with as many digits as the uncertainty supports.`,
eq: String.raw`\[ \bar a = \frac{1}{S}\sum_{s=1}^{S} a_s, \qquad s_a = \sqrt{\frac{\sum_s (a_s - \bar a)^2}{S - 1}} \]
\[ \text{SE of one score} = \sqrt{a(1-a)/n} \]`,
sym: [[String.raw`\(a_s\)`, "validation accuracy of the run with seed s"], [String.raw`\(S\)`, "number of seeds, 3 here"], [String.raw`\(s_a\)`, "standard deviation over seeds, ddof = 1"], [String.raw`\(n\)`, "validation examples, 600 here"], ["runs.csv", "one row per run, appended by the training script"]],
how: ["Open runs.csv and read three rows.", "Switch to seed 5970 only and read the winner.", "Switch to the mean over seeds and read the winner and its spread.", "Switch to the best seed and see which number it invents."],
say: String.raw`Results are written by the scripts to a CSV file and the slide table is computed from it as the mean and standard deviation over seeds, because a single seed can pick a different winner and the best seed of each configuration is an optimistic number no rerun reproduces.`,
num: String.raw`Seed 5970 alone: baseline removal plus logistic regression wins at 0.7167. Mean over three seeds: Savitzky-Golay plus z-score with logistic regression wins at <b>0.7050 ± 0.0067</b>, baseline removal 0.6922 ± 0.0212, z-score 0.6416 ± 0.0126, raw 0.6239 ± 0.0158. The MLP trails everywhere (best 0.5978). One validation accuracy near 0.70 on 600 spectra has SE 0.0186, so report 70.5 ± 0.7%, not 70.50%.`,
note: String.raw`The standard deviation over seeds and the standard error of one score measure different things: the first is how much your choices of split and initialization move the result, the second is sampling noise of one validation set. Report the first on the slide and keep the second in mind before claiming a difference. The brief asks for accuracy and macro F1 per model and preprocessing choice, both are in the CSV.`,
r(fig, ctl) {
  let view = "mean";
  ctl.innerHTML = btnRow([["csv", "runs.csv"], ["one", "seed 5970 only"], ["mean", "mean ± SD over 3 seeds"], ["best", "best seed of 3"]], "h6v") + `<div id="h6o"></div>`;
  const u = () => {
    pick(ctl, "h6v", view);
    if (view === "csv") {
      const lines = ["seed,preprocess,model,train_acc,val_acc,val_f1,seconds"].concat(RUNS.map(r => r.join(",")));
      fig.innerHTML = ML.code(lines, -1, "text");
      $("h6o").innerHTML = RO([["rows", RUNS.length], ["configurations", 8], ["seeds", "5970, 5971, 5972"]]);
      return;
    }
    const cfg = []; PRE.forEach(p => ["lr", "mlp"].forEach(m => { const g = grp(p, m).map(r => r[4]); cfg.push({ p, m, v: view === "one" ? grp(p, m).find(r => r[0] === 5970)[4] : view === "best" ? Math.max(...g) : mean(g), sd: view === "mean" ? sdv(g) : 0, all: g }); }));
    const win = cfg.reduce((a, b) => b.v > a.v ? b : a);
    const ax = ML.axes(250, 30, 380, 300, { xmin: 0.3, xmax: 0.9, ymin: 0, ymax: 8, nx: 6, ny: 1, fx: v => f(v, 1), fy: () => "", xl: view === "one" ? "validation accuracy, seed 5970" : view === "best" ? "validation accuracy, best of 3 seeds" : "validation accuracy, mean ± SD over 3 seeds", grid: true });
    let s = ax.s.replace(/<text class="ts" x="243"[^<]*<\/text>/g, "");
    cfg.forEach((c, i) => { const y = 40 + i * 36, col = c.m === "lr" ? C.teal : C.purple; s += tx(240, y + 16, PRN[c.p] + ", " + (c.m === "lr" ? "LR" : "MLP"), "end");
      s += `<rect x="${ax.X(0.3)}" y="${y + 4}" width="${ax.X(c.v) - ax.X(0.3)}" height="18" rx="3" fill="${col}" opacity="${c === win ? 0.95 : 0.55}"/>`;
      if (view === "mean") { s += `<line x1="${ax.X(c.v - c.sd)}" y1="${y + 13}" x2="${ax.X(c.v + c.sd)}" y2="${y + 13}" stroke="var(--p)" stroke-width="2"/>`; c.all.forEach(a => { s += `<circle cx="${ax.X(a)}" cy="${y + 13}" r="2.6" fill="var(--p)"/>`; }); }
      s += tx(ax.X(c.v) + (view === "mean" ? ax.X(c.v + c.sd) - ax.X(c.v) + 6 : 6), y + 17, f(c.v, 4) + (view === "mean" ? " ± " + f(c.sd, 4) : "")); });
    s += tx(20, 20, view === "best" ? "Best seed per configuration: optimistic, not reproducible" : "Winner: " + PRN[win.p] + " with " + MOD[win.m], null, "th");
    fig.innerHTML = svg(370, s);
    $("h6o").innerHTML = RO([["winner", PRN[win.p] + ", " + MOD[win.m]], ["its number", f(win.v, 4) + (view === "mean" ? " ± " + f(win.sd, 4) : "")], ["on the slide", view === "mean" ? pc(win.v, 1).replace("%", "") + " ± " + f(100 * win.sd, 1) + "%" : "do not report this view"], ["SE of one score, n = 600", f(Math.sqrt(win.v * (1 - win.v) / 600), 4)]]);
  };
  on(ctl, "h6v", v => { view = v; u(); });
  u();
}},

{s: "7. Figures that read from the back of the room", t: "The 30 by 30 confusion matrix for the slides: counts, row shares, errors only and sorted classes",
intu: String.raw`The brief asks for a 30 by 30 confusion matrix normalized by row for the best model. Normalizing by row turns each row into the share of that true class sent to each prediction, so the diagonal reads as recall per class and rows of different sizes compare fairly. With 30 classes the diagonal dominates the color scale, so a second panel with the diagonal hidden shows where the errors go. Sorting classes by recall puts the hard classes together. Click a cell to read it. Whatever the view, a slide figure needs axis labels with what they mean, a color bar with its range, a font that is readable when the slide is projected, and a caption line that says what to look at.`,
eq: String.raw`\[ R_{ij} = \frac{N_{ij}}{\sum_k N_{ik}}, \qquad \text{recall}_i = R_{ii} \]`,
sym: [[String.raw`\(N_{ij}\)`, "test spectra of true class i predicted as class j"], [String.raw`\(R_{ij}\)`, "row-normalized share, each row sums to 1"], [String.raw`\(R_{ii}\)`, "recall of class i, the diagonal"], ["errors only", "the diagonal hidden so the color scale shows the mistakes"], ["sorted", "classes ordered by recall, hardest last"]],
how: ["Read the counts view and find the darkest off-diagonal cells.", "Switch to row shares and read the color bar.", "Switch to errors only and find the two pairs that swap.", "Sort by recall and click the worst class."],
say: String.raw`A confusion matrix for slides is normalized by row so the diagonal is recall per class, with a second view that hides the diagonal so the color scale shows where the errors go, and every axis, color bar and caption is readable when projected.`,
num: String.raw`Logistic regression on Savitzky-Golay plus z-score spectra, 3,000 stand-in test spectra: 2,073 correct, accuracy <b>0.691</b>. Recall ranges from 0.37 (class 1) to 0.93 (class 4). Largest confusions: 21 predicted as 26 (22), 12 as 19 (22), 26 as 21 (21), 15 as 29 (14), 19 as 12 (13). The pairs 21 and 26 and 12 and 19 hold 78 of the 927 errors.`,
note: String.raw`On the real data, label the axes with isolate names from the authors' config.py, as the brief says. Make figures with matplotlib at the slide's size (for example 6 by 6 inches at 200 dpi with 14 point labels) in plots.py, so a rerun rebuilds them. HW10 B4 read its CNN's most frequent mistake from the same kind of matrix.`,
r(fig, ctl) {
  const CM = D45.cm, K = 30;
  const rec = CM.map((r, i) => r[i] / r.reduce((a, b) => a + b, 0));
  let mode = "row", ord = "idx", sel = [21, 26];
  ctl.innerHTML = btnRow([["cnt", "counts"], ["row", "row shares"], ["err", "errors only"]], "h7m") + btnRow([["idx", "class order"], ["rec", "sorted by recall"]], "h7o") + `<div id="h7r"></div>`;
  const u = () => {
    pick(ctl, "h7m", mode); pick(ctl, "h7o", ord);
    const O = ord === "idx" ? [...Array(K).keys()] : [...Array(K).keys()].sort((a, b) => rec[b] - rec[a]);
    const val = (i, j) => { const n = mode === "cnt" ? CM[i][j] : CM[i][j] / 100; return mode === "err" && i === j ? null : n; };
    const vmax = mode === "cnt" ? 100 : mode === "row" ? 1 : 0.25;
    const cs = 13, x0 = 90, y0 = 40;
    let s = tx(x0, 24, (mode === "cnt" ? "Counts" : mode === "row" ? "Row-normalized shares" : "Row shares, diagonal hidden") + ", true class down, predicted class across", null, "th");
    O.forEach((i, a) => O.forEach((j, b) => { const v = val(i, j), t = v == null ? 0 : Math.min(1, v / vmax); const isSel = i === sel[0] && j === sel[1];
      s += `<rect data-i="${i}" data-j="${j}" x="${x0 + b * cs}" y="${y0 + a * cs}" width="${cs - 1}" height="${cs - 1}" fill="${v == null ? "var(--sunk)" : `rgba(55,138,221,${(0.04 + 0.94 * t).toFixed(3)})`}" ${isSel ? `stroke="${C.coral}" stroke-width="2"` : ""} style="cursor:pointer"/>`; }));
    O.forEach((i, a) => { if (a % 3 === 0 || ord === "rec") { s += `<text class="ts" x="${x0 - 4}" y="${y0 + a * cs + 10}" text-anchor="end" style="font-size:9px">${i}</text>`; s += `<text class="ts" x="${x0 + a * cs + 6}" y="${y0 + K * cs + 12}" text-anchor="middle" style="font-size:9px">${i}</text>`; } });
    s += tx(x0 + K * cs / 2, y0 + K * cs + 30, "predicted class", "middle") + `<text class="ts" x="${x0 - 30}" y="${y0 + K * cs / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 30} ${y0 + K * cs / 2})">true class</text>`;
    const bx = x0 + K * cs + 30; for (let k = 0; k < 20; k++) s += `<rect x="${bx}" y="${y0 + 380 - (k + 1) * 19}" width="16" height="19" fill="rgba(55,138,221,${(0.04 + 0.94 * k / 19).toFixed(3)})"/>`;
    s += tx(bx + 22, y0 + 10, mode === "cnt" ? "100" : f(vmax, 2)) + tx(bx + 22, y0 + 380, "0") + tx(bx + 22, y0 + 200, mode === "cnt" ? "count" : "share");
    const [i, j] = sel;
    fig.innerHTML = svg(y0 + K * cs + 44, s);
    fig.querySelectorAll("rect[data-i]").forEach(r => r.onclick = () => { sel = [+r.dataset.i, +r.dataset.j]; u(); });
    let off = []; for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) if (a !== b) off.push([CM[a][b], a, b]); off.sort((p, q) => q[0] - p[0]);
    $("h7r").innerHTML = RO([["accuracy", f(CM.reduce((a, r, k) => a + r[k], 0) / 3000, 4)], ["worst recall", "class " + rec.indexOf(Math.min(...rec)) + ", " + f(Math.min(...rec), 2)], ["best recall", "class " + rec.indexOf(Math.max(...rec)) + ", " + f(Math.max(...rec), 2)], ["largest confusion", off[0][1] + " as " + off[0][2] + ", " + off[0][0]], ["selected cell", "true " + i + ", predicted " + j + ": " + CM[i][j] + " of 100"], ["recall of class " + i, f(rec[i], 2)]]);
  };
  on(ctl, "h7m", v => { mode = v; u(); }); on(ctl, "h7o", v => { ord = v; u(); });
  u();
}},

{s: "8. The deck in academic style", t: "Titles first, the method step by step with its equations, then results, limits and suggestions",
intu: String.raw`The brief asks for an academic deck: titles first, then the method step by step with the main equations, then the results figures, the limitations and suggestions to improve the model. Nine slides per project fit a short talk. Each title should be an assertion, the one sentence you want remembered, with the slide body as its evidence. "Results" tells the audience nothing, "Smoothing then normalizing gives the best validation accuracy, 70.5 ± 0.7%" tells them what to see. Switch the title style and click through the storyboard. The second view is a text check for slide and README text: it flags the semicolons and dashes the brief forbids, claims of significance without a test, and percentages without a spread. Edit the draft and watch the count.`,
eq: String.raw`\[ \text{slide} = \text{assertion title} + \text{one piece of evidence} \]`,
sym: [["assertion title", "a full sentence stating the slide's finding"], ["evidence", "one figure, one table or one short derivation"], ["method slides", "preprocessing, models and protocol, each with its main equation"], ["limitations", "what the results do not show, from section 5.9 of the brief"], ["suggestions", "what to try next and the evidence for it, card 10"]],
how: ["Click each slide in topic style.", "Switch to assertion titles and read them again.", "Open the text check and read the four flags.", "Load the fixed draft and confirm zero flags."],
say: String.raw`An academic project deck states each slide's finding as its title and supports it with one figure, table or equation, in the order project, data, method with equations, protocol, results, limitations and suggestions.`,
num: String.raw`Nine slides for each project, two projects in the ZIP. The draft sentence in the text check carries <b>4</b> flags (one semicolon, one em dash, one percentage without a spread, one unsupported "significantly"), the fixed draft carries 0.`,
note: String.raw`Build the deck in PowerPoint, as the brief asks, not as a web page. Paste figures from results/ at their saved size rather than screenshots, put the equation for each method step on its slide (z-score, Savitzky-Golay, the polynomial baseline, softmax and cross-entropy, the convolution), and end with the slide the rubric names: suggestions to improve the model. Verify any number from the paper, such as Ho et al.'s 82.2 ± 0.3%, against the paper itself before it goes on a slide.`,
r(fig, ctl) {
  const SL = [["Title", "Deep learning classification of bacterial Raman spectra", "t"], ["Data", "Thirty isolates with 100 spectra each look almost identical", "spec"], ["Preprocessing", "Four preprocessing choices are compared on validation only", "eq1"], ["Models", "Logistic regression, an MLP and a 1D CNN share one split and seed set", "eq2"], ["Protocol", "Validation picks every choice and the test set is used once", "split"], ["Results", "Smoothing then normalizing gives the best validation accuracy, 70.5 ± 0.7%", "bars"], ["Confusion matrix", "Most test errors fall in pairs of similar classes", "cm"], ["Limitations", "One hundred spectra per class and no pretraining cap what any model reaches", "list"], ["Suggestions to improve", "Denoising and pretraining target the two largest error sources", "list2"]];
  const DRAFT = "Results; logistic regression reached 70.5% — the best of four preprocessing choices. The CNN is significantly better than the MLP.";
  const FIXED = "Smoothing then normalizing gave the best validation accuracy, 70.5 ± 0.7% over three seeds. The CNN beat the MLP on all three seeds.";
  let view = "deck", k = 5, sty = "as", txt = DRAFT;
  const flags = t => { const F = []; (t.match(/;/g) || []).forEach(() => F.push("semicolon")); (t.match(/—/g) || []).forEach(() => F.push("em dash")); (t.match(/–/g) || []).forEach(() => F.push("en dash")); (t.match(/ -- /g) || []).forEach(() => F.push("double hyphen as a dash"));
    (t.match(/\bsignificant(ly)?\b/gi) || []).forEach(() => { if (!/p\s*=|McNemar|test/i.test(t)) F.push("\"significant\" without a test"); });
    const re = /(\d+(\.\d+)?)\s*%/g; let m; while ((m = re.exec(t))) { const before = t.slice(Math.max(0, m.index - 3), m.index), after = t.slice(m.index, m.index + 14); if (!/±|\+-/.test(before) && !/±/.test(after)) F.push("percentage " + m[1] + "% without a spread"); }
    return F; };
  ctl.innerHTML = btnRow([["deck", "storyboard"], ["chk", "text check"]], "h8v") + `<div id="h8x"></div><div id="h8o"></div>`;
  const thumb = (x, y, w, h, sd, big) => { const sc = big ? 1 : 0.32; let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--sunk)" stroke="var(--line)"/>`;
    const title = sty === "as" ? sd[1] : sd[0];
    if (big) { s += `<foreignObject x="${x + 14}" y="${y + 8}" width="${w - 28}" height="56"><div xmlns="http://www.w3.org/1999/xhtml" style="font-weight:600;font-size:${sty === "as" ? 17 : 22}px;line-height:1.25">${ML.esc(title)}</div></foreignObject>`; }
    else s += `<rect x="${x + 6}" y="${y + 6}" width="${w * (sty === "as" ? 0.85 : 0.4)}" height="6" rx="2" fill="var(--p)" opacity="0.7"/>` + (sty === "as" ? `<rect x="${x + 6}" y="${y + 15}" width="${w * 0.6}" height="5" rx="2" fill="var(--p)" opacity="0.5"/>` : "");
    const bx = x + (big ? 30 : 8), by = y + (big ? 76 : 26), bw = w - (big ? 60 : 16), bh = h - (big ? 92 : 32);
    const kind = big ? sd[2] : "none";
    if (!big) s += `<rect x="${x + 6}" y="${y + 24}" width="${w - 12}" height="${h - 30}" rx="2" fill="var(--line)" opacity="0.6"/>`;
    if (kind === "t") s += big ? tx(x + w / 2, by + 50, "Sujoy, AME 5970, December 2026", "middle") : "";
    if (kind === "spec") for (let c = 0; c < 4; c++) s += ML.path(Array.from({ length: 40 }, (_, i) => [bx + i * bw / 39, by + bh * (0.85 - 0.15 * c) - bh * 0.5 * Math.exp(-0.5 * ((i - 12 - c) / 2.5) ** 2) - bh * 0.3 * Math.exp(-0.5 * ((i - 28) / 2) ** 2)]), [C.blue, C.teal, C.purple, C.coral][c], big ? 1.6 : 0.8);
    if (kind === "eq1" || kind === "eq2") { const E = kind === "eq1" ? ["z = (x − μ) / σ, per spectrum", "Savitzky-Golay: local cubic, window 11", "baseline: iterative cubic fit, 30 passes"] : ["p = softmax(Wx + b)", "L = −Σ y log p", "1D CNN: (w ∗ x)[i] = Σ w[k] x[i + k]"]; E.forEach((e, i) => { s += big ? tx(bx, by + 30 + i * 34, e) : `<rect x="${bx}" y="${by + 4 + i * 10}" width="${bw * 0.7}" height="4" rx="2" fill="var(--muted)"/>`; }); }
    if (kind === "split") { const parts = [["train 2,400", 0.64, C.teal], ["val 600", 0.16, C.amber], ["test 3,000, once", 0.2, C.coral]]; let xx = bx; parts.forEach(([t, p, col]) => { s += `<rect x="${xx}" y="${by + bh * 0.3}" width="${bw * p - 2}" height="${bh * 0.3}" fill="${col}" opacity="0.7"/>` + (big ? tx(xx + bw * p / 2, by + bh * 0.3 + bh * 0.15 + 5, t, "middle") : ""); xx += bw * p; }); }
    if (kind === "bars") { const v = [0.6239, 0.6416, 0.705, 0.6922]; v.forEach((a, i) => { s += `<rect x="${bx}" y="${by + i * bh / 4 + 2}" width="${bw * (a - 0.4) / 0.4}" height="${bh / 4 - 5}" fill="${i === 2 ? C.teal : C.gray}" opacity="0.8"/>` + (big ? tx(bx + bw * (a - 0.4) / 0.4 + 6, by + i * bh / 4 + bh / 8 + 4, PRN[PRE[i]] + ", " + f(a, 3)) : ""); }); }
    if (kind === "cm") { const n = 10, c = Math.min(bw, bh) / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += `<rect x="${bx + j * c}" y="${by + i * c}" width="${c - 0.5}" height="${c - 0.5}" fill="rgba(55,138,221,${i === j ? 0.8 : ((i * 7 + j * 3) % 10 === 0 ? 0.35 : 0.06)})"/>`; }
    if (kind === "list" || kind === "list2") { const L = kind === "list" ? ["100 spectra per class, no pretraining", "a stand-in here, 30 isolates and one instrument there", "accuracy from one test set of 3,000"] : ["denoise or average low-signal spectra, ceiling 82.5%", "fit the baseline after smoothing, ceiling 79.3%", "pretrain on more spectra, as the paper does"]; L.forEach((e, i) => { s += big ? tx(bx, by + 30 + i * 34, "• " + e) : `<rect x="${bx}" y="${by + 4 + i * 10}" width="${bw * 0.8}" height="4" rx="2" fill="var(--muted)"/>`; }); }
    return s; };
  const u = () => {
    pick(ctl, "h8v", view);
    if (view === "deck") {
      $("h8x").innerHTML = btnRow([["tp", "topic titles"], ["as", "assertion titles"]], "h8s") + btnRow(SL.map((x, i) => [i, (i + 1) + ". " + x[0]]), "h8k");
      pick(ctl, "h8s", sty); pick(ctl, "h8k", k);
      on(ctl, "h8s", v => { sty = v; u(); }); on(ctl, "h8k", v => { k = +v; u(); });
      let s = "";
      SL.forEach((sd, i) => { const x = 20 + i * 72; s += thumb(x, 14, 66, 46, sd, false); if (i === k) s += `<rect x="${x - 2}" y="12" width="70" height="50" rx="5" fill="none" stroke="${C.coral}" stroke-width="2"/>`; });
      s += thumb(110, 74, 460, 259, SL[k], true);
      fig.innerHTML = svg(344, s);
      $("h8o").innerHTML = RO([["slide", (k + 1) + " of 9"], ["title", sty === "as" ? SL[k][1] : SL[k][0]], ["title words", (sty === "as" ? SL[k][1] : SL[k][0]).split(/\s+/).length]]);
    } else {
      $("h8x").innerHTML = `<textarea id="h8t" rows="3" style="width:100%;font:inherit;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--sunk);color:inherit">${ML.esc(txt)}</textarea><div class="row"><button id="h8d">load the draft</button><button id="h8f">load the fixed draft</button></div>`;
      const show = () => { txt = $("h8t").value; const F = flags(txt); let s = tx(20, 22, F.length ? F.length + " flags in this text" : "No flags, ready for a slide", null, "th"); F.forEach((t, i) => { s += `<g class="c-coral"><rect x="20" y="${36 + i * 26}" width="16" height="16" rx="4" stroke-width="1"/></g>` + tx(28, 49 + i * 26, "!", "middle") + tx(46, 49 + i * 26, t); }); if (!F.length) s += `<g class="c-teal"><rect x="20" y="36" width="16" height="16" rx="4" stroke-width="1"/></g>` + tx(28, 49, "✓", "middle") + tx(46, 49, "no semicolons, no dashes, every percentage has a spread"); fig.innerHTML = svg(Math.max(80, 50 + F.length * 26), s); $("h8o").innerHTML = RO([["flags", F.length], ["characters", txt.length]]); };
      $("h8t").oninput = show; $("h8d").onclick = () => { $("h8t").value = DRAFT; show(); }; $("h8f").onclick = () => { $("h8t").value = FIXED; show(); };
      show();
    }
  };
  on(ctl, "h8v", v => { view = v; u(); });
  u();
}},

{s: "9. One look at the test set", t: "Freeze the choice, open the test set once, report an interval and test a difference",
intu: String.raw`Validation chose Savitzky-Golay smoothing with z-score and logistic regression, 0.705 against 0.692 for baseline removal. That choice is frozen before the test set is opened. Open it: the frozen model scores 0.691 and the runner-up 0.695. The temptation is to switch, and switching would turn the test set into a second validation set, so the reported number would be optimistic again. Instead report the frozen model with a 95% interval, and if you want to claim one model beats another on the same test spectra, use a paired test. McNemar's test looks only at the spectra the two models disagree on: here 258 against 270, a difference well inside chance. Use the sliders to try your own accuracy and disagreement counts.`,
eq: String.raw`\[ \text{Wilson: } \frac{\hat p + \frac{z^2}{2n} \pm z\sqrt{\frac{\hat p(1-\hat p)}{n} + \frac{z^2}{4n^2}}}{1 + z^2/n} \]
\[ \text{McNemar: } p = 2\,P\big(X \le \min(b, c)\big),\ X \sim \text{Bin}(b + c,\ \tfrac12) \]`,
sym: [[String.raw`\(\hat p\)`, "test accuracy"], [String.raw`\(n\)`, "test spectra, 3,000"], [String.raw`\(z\)`, "1.96 for a 95% interval"], [String.raw`\(b,\ c\)`, "spectra only model A gets right, and only model B gets right"], ["paired", "both models scored on the same spectra, so only disagreements carry information"]],
how: ["Read the frozen validation choice.", "Open the test set and read both scores with their intervals.", "Read the 2 by 2 table and the McNemar p-value.", "Move the sliders to b = 30 and c = 60 and read p."],
say: String.raw`The model is chosen on validation and frozen, the test set is opened once and the frozen model is reported with a confidence interval, and a claim that one model beats another on the same test set is checked with a paired test such as McNemar's on the disagreements.`,
num: String.raw`Frozen model on 3,000 stand-in test spectra: <b>0.691</b>, Wilson 95% interval 0.674 to 0.707. Runner-up 0.695. Both right 1,815, only the frozen model 258, only the runner-up 270, both wrong 657, exact McNemar p = 0.632. Ho et al. report 82.2 ± 0.3% isolate-level accuracy on their real test set, after pretraining on 60,000 reference spectra.`,
note: String.raw`The stand-in numbers are not comparable with the paper's, and your real numbers will not be either unless you also pretrain, which the brief says to state. If the test set has to be reused, for example to report a second final model as the brief allows, report both and say that neither choice used the test. Ng's rule from Lesson 44 holds: dev and test sets come from the same distribution and the test set gives an unbiased estimate only while nothing was chosen on it.`,
r(fig, ctl) {
  let open = 0;
  ctl.innerHTML = btnRow([[0, "test set sealed"], [1, "open the test set once"]], "h9t") + sl("h9a", "your accuracy", 0.5, 0.99, 0.001, 0.691) + sl("h9n", "test size n", 100, 5000, 100, 3000) + sl("h9b", "b, only A right", 0, 300, 1, 258) + sl("h9c", "c, only B right", 0, 300, 1, 270) + `<div id="h9o"></div>`;
  const u = () => {
    pick(ctl, "h9t", open);
    const a = +$("h9a").value, n = +$("h9n").value, b = +$("h9b").value, c = +$("h9c").value;
    $("h9av").textContent = f(a, 3); $("h9nv").textContent = n; $("h9bv").textContent = b; $("h9cv").textContent = c;
    const ax = ML.axes(220, 40, 420, 150, { xmin: 0.6, xmax: 0.9, ymin: 0, ymax: 4, nx: 6, ny: 1, fx: v => f(v, 2), fy: () => "", xl: "accuracy" });
    let s = tx(20, 24, open ? "Test set opened once, the choice was frozen before" : "Validation picked the model, the test set is still sealed", null, "th") + ax.s.replace(/<text class="ts" x="213"[^<]*<\/text>/g, "");
    const R = [["frozen choice, validation", 0.705, 0.0067, "sd", C.teal], ["runner-up, validation", 0.6922, 0.0212, "sd", C.gray], ["frozen choice, test", D45.test.sgz[0], null, "w", C.coral], ["runner-up, test", D45.test.basez[0], null, "w", C.gray], ["Ho et al. 2019, real data", 0.822, 0.003, "sd", C.purple]];
    R.forEach(([lab, v, e, kind, col], i) => { const y = 54 + i * 26; if (kind === "w" && !open) { s += tx(210, y + 4, lab, "end") + tx(230, y + 4, "sealed"); return; }
      const [lo, hi] = kind === "w" ? wilson(v, 3000) : [v - e, v + e];
      s += tx(210, y + 4, lab, "end") + `<line x1="${ax.X(lo)}" y1="${y}" x2="${ax.X(hi)}" y2="${y}" stroke="${col}" stroke-width="3"/><circle cx="${ax.X(v)}" cy="${y}" r="5" fill="${col}"/>` + tx(ax.X(hi) + 8, y + 4, f(v, 3)); });
    const mx = 400;
    s += tx(20, 252, "McNemar on the same test spectra" + (open ? "" : ", needs the opened test set"), null, "th");
    const T = [["", "B right", "B wrong"], ["A right", D45.mc.both, b], ["A wrong", c, D45.mc.neither]];
    T.forEach((r, i) => r.forEach((v, j) => { const x = 40 + j * 110, y = 264 + i * 28; s += `<rect x="${x}" y="${y}" width="104" height="24" rx="4" fill="${(i === 1 && j === 2) || (i === 2 && j === 1) ? "var(--accent-bg)" : "var(--sunk)"}" stroke="var(--line)"/>` + tx(x + 52, y + 16, open || i === 0 || j === 0 ? String(v) : "?", "middle"); }));
    const p = mcnemar(b, c), [wl, wh] = wilson(a, n);
    s += tx(400, 284, "disagreements b + c = " + (b + c)) + tx(400, 306, "exact p = " + (open ? f(p, 4) : "?")) + tx(400, 328, open ? (p < 0.05 ? "a real difference at the 5% level" : "no evidence of a difference") : "");
    fig.innerHTML = svg(352, s);
    $("h9o").innerHTML = RO([["your 95% Wilson interval", f(wl, 4) + " to " + f(wh, 4)], ["half width", f((wh - wl) / 2, 4)], ["McNemar p for your b and c", f(p, 4)], ["frozen model on test", open ? f(D45.test.sgz[0], 4) + ", macro-F1 " + f(D45.test.sgz[1], 4) : "sealed"]]);
  };
  on(ctl, "h9t", v => { open = +v; u(); }); ["h9a", "h9n", "h9b", "h9c"].forEach(id => $(id).oninput = u);
  u();
}},

{s: "10. Limitations and suggestions to improve", t: "The rubric's last slide, written from the learning curve, the error tally and the confusions",
intu: String.raw`The rubric asks for suggestions to improve the model, and a grader can tell a guess from a suggestion with evidence. Three pieces of evidence from Lesson 44's tools are enough. The learning curve trains the frozen model on 20 to 80 spectra per class: validation accuracy climbs fast and then flattens while training accuracy stays above 0.92, so a few more spectra of the same kind will not close the gap. The error tally counts validation errors by cause and gives each fix a ceiling. The confusion matrix names the class pairs that swap. Click through the evidence and read the suggestion each one supports, with the number that backs it. Limitations come from the same place: what the data and the protocol cannot show.`,
eq: String.raw`\[ \text{ceiling}_{\text{tag}} = \text{acc} + \frac{e_{\text{tag}}}{n} \]
\[ \text{variance} = \text{acc}_{\text{train}} - \text{acc}_{\text{val}} \]`,
sym: [[String.raw`\(e_{\text{tag}}\)`, "validation errors that carry the tag"], [String.raw`\(n\)`, "validation spectra, 600"], ["low signal", "spectra with about three times the usual noise, a quarter of the stand-in"], ["strong baseline", "spectra with about three times the usual baseline"], ["learning curve", "the same model trained on growing subsets of the training split"]],
how: ["Read the learning curve and the gap at 80 per class.", "Open the error tally and read the two ceilings.", "Open the confusions and read the pairs.", "Read the ranked suggestions and the numbers on each."],
say: String.raw`Suggestions to improve the model are ranked by evidence: the learning curve says whether more of the same data helps, the error tally gives each fix a ceiling, and the confusion matrix names the classes to look at, while limitations state what the data and protocol cannot show.`,
num: String.raw`Learning curve, validation accuracy at 20, 40, 60, 80 spectra per class: 0.53, 0.6583, 0.695, 0.70, training accuracy 0.92 to 0.94. Error tally on 600 validation spectra at accuracy 0.6983: 181 errors, 76 low signal (accuracy on those spectra 0.4532 against 0.8117 on clean ones, ceiling <b>0.825</b>), 57 strong baseline (ceiling 0.7933), 23 with both tags, 71 with neither.`,
note: String.raw`Write each suggestion as a sentence with its evidence and its ceiling, for example "Low-signal spectra cause 76 of 181 validation errors, so denoising or averaging repeated acquisitions could raise accuracy to at most 82.5%." State the limitations from the brief: 100 spectra per class, no pretraining on the reference set, one instrument and 30 isolates, so the model is not a general bacteria identifier.`,
r(fig, ctl) {
  let ev = "lc";
  const V = D45.val, n = V.n, acc = V.acc;
  const SUG = { lc: ["Use a model with built-in shift tolerance (the 1D CNN) or pretraining on more spectra, as the paper does with 60,000.", "From 60 to 80 spectra per class the frozen model gains 0.5 points while it still fits training at 0.94: more of the same small set will not close a 24-point gap."],
    tag: ["Denoise low-signal spectra (smoothing tuned on validation, noise augmentation, averaged acquisitions), then revisit the baseline fit.", "Low signal: 76 errors, ceiling 0.825. Strong baseline: 57 errors, ceiling 0.7933. Fix the larger cause first."],
    cm: ["Look at the mean spectra of the swapping pairs to find the bands that separate them, and check them with saliency on the CNN.", "On test, 21 and 26 swap 43 times and 12 and 19 swap 35 times, 78 of 927 errors. Describe this on the slide, do not tune on it."] };
  ctl.innerHTML = btnRow([["lc", "learning curve"], ["tag", "error tally"], ["cm", "confused pairs"]], "h10e") + `<div id="h10o"></div>`;
  const u = () => {
    pick(ctl, "h10e", ev);
    let s = "";
    if (ev === "lc") {
      const ax = ML.axes(80, 30, 540, 190, { xmin: 0, xmax: 100, ymin: 0.4, ymax: 1, nx: 5, ny: 6, fx: v => Math.round(v), fy: v => f(v, 1), xl: "training spectra per class", yl: "accuracy" });
      s += tx(80, 20, "Learning curve of the frozen model", null, "th") + ax.s;
      s += ML.path(D45.lc.map(r => [ax.X(r[0]), ax.Y(r[1])]), C.blue, 2.2) + ML.path(D45.lc.map(r => [ax.X(r[0]), ax.Y(r[2])]), C.coral, 2.2);
      D45.lc.forEach(r => { s += `<circle cx="${ax.X(r[0])}" cy="${ax.Y(r[1])}" r="4" fill="${C.blue}"/><circle cx="${ax.X(r[0])}" cy="${ax.Y(r[2])}" r="4" fill="${C.coral}"/>` + tx(ax.X(r[0]), ax.Y(r[2]) + 18, f(r[2], 3), "middle"); });
      s += `<line x1="${ax.X(100)}" y1="${ax.Y(0.822)}" x2="${ax.X(0)}" y2="${ax.Y(0.822)}" stroke="${C.purple}" stroke-dasharray="5 4"/>` + tx(ax.X(2), ax.Y(0.822) - 6, "paper, real data with pretraining, 0.822");
      s += legend([["training", C.blue], ["validation", C.coral]], 100, 276, 140);
    } else if (ev === "tag") {
      s += tx(20, 22, "Validation errors by cause, " + V.errors + " errors on " + n + " spectra", null, "th");
      const T = [["low signal", V.low, C.coral], ["strong baseline", V.strong, C.amber], ["both tags", V.both, C.gray], ["neither tag", V.none, C.blue]];
      T.forEach(([t, e, col], i) => { const y = 40 + i * 40; s += tx(170, y + 16, t, "end") + hbar(180, y, 300, 22, e / V.errors, col) + tx(488, y + 16, e + " errors" + (i < 2 ? ", ceiling " + f(acc + e / n, 4) : "")); });
      s += tx(20, 216, "Accuracy on low-signal spectra " + f(V.acc_low, 4) + " (" + V.n_low + " spectra) against " + f(V.acc_clean, 4) + " on clean ones (" + V.n_none + ").");
      s += tx(20, 240, "Tags overlap, so the ceilings do not add up.");
      s += tx(20, 276, "");
    } else {
      const CM = D45.cm, P = [[21, 26], [12, 19], [15, 29], [6, 18], [15, 18], [25, 26]];
      s += tx(20, 22, "Test confusions between class pairs (both directions)", null, "th");
      P.forEach(([a, b], i) => { const e = CM[a][b] + CM[b][a], y = 40 + i * 34; s += tx(170, y + 16, "classes " + a + " and " + b, "end") + hbar(180, y, 300, 22, e / 50, C.purple) + tx(488, y + 16, e + " errors (" + CM[a][b] + " + " + CM[b][a] + ")"); });
      s += tx(20, 262, "927 test errors in all. The two worst pairs hold 78 of them.");
    }
    s += `<g class="c-teal"><rect x="20" y="${ev === "lc" ? 292 : 284}" width="640" height="84" rx="8" stroke-width="1"/></g>` + `<foreignObject x="30" y="${ev === "lc" ? 298 : 290}" width="620" height="76"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:13.5px;line-height:1.4"><b>Suggestion.</b> ${SUG[ev][0]}<br><b>Evidence.</b> ${SUG[ev][1]}</div></foreignObject>`;
    fig.innerHTML = svg(ev === "lc" ? 386 : 378, s);
    $("h10o").innerHTML = RO(ev === "lc" ? [["validation at 80 per class", f(D45.lc[3][2], 4)], ["training at 80 per class", f(D45.lc[3][1], 4)], ["gap", f(D45.lc[3][1] - D45.lc[3][2], 4)], ["gain from 60 to 80", f(D45.lc[3][2] - D45.lc[2][2], 4)]] : ev === "tag" ? [["validation accuracy", f(acc, 4)], ["low-signal ceiling", f(acc + V.low / n, 4)], ["baseline ceiling", f(acc + V.strong / n, 4)], ["errors with neither tag", V.none]] : [["21 and 26", D45.cm[21][26] + D45.cm[26][21]], ["12 and 19", D45.cm[12][19] + D45.cm[19][12]], ["share of all test errors", f(78 / 927, 4)]]);
  };
  on(ctl, "h10e", v => { ev = v; u(); });
  u();
}},

{s: "11. With the agent", t: "Do it with the agent: a report toolkit with tests that pin this lesson",
intu: String.raw`The lesson as code for the hand-in. One module computes everything a slide or the README reports and checks what the brief forbids: the mean and standard deviation table from runs.csv, the Wilson interval, the exact McNemar test, the text check for slide and README text, and a docstring check over the source tree. The tests pin the numbers of cards 3, 4, 6, 8 and 9, so a population standard deviation, a normal-approximation interval, a one-sided p-value or a missed em dash fails a named test. Run the docstring check and the text check as the last step before you build the ZIP.`,
eq: String.raw`\[ \texttt{summarize\_runs} \to \texttt{wilson} \to \texttt{mcnemar\_exact} \to \texttt{check\_text} \to \texttt{docstring\_report} \]`,
sym: [[String.raw`\(\texttt{summarize\_runs(csv\_path)}\)`, "card 6: mean, SD (ddof = 1) and count per configuration"], [String.raw`\(\texttt{wilson(acc, n)}\)`, "card 9: the 95% Wilson interval"], [String.raw`\(\texttt{mcnemar\_exact(b, c)}\)`, "card 9: two-sided exact binomial p-value"], [String.raw`\(\texttt{check\_text(text)}\)`, "card 8: list of flags for semicolons, dashes, spreadless percentages, untested significance"], [String.raw`\(\texttt{docstring\_report(path)}\)`, "card 3: functions without a docstring, found with the ast module"]],
how: ["Paste the command.", "Check that the SD uses ddof = 1.", "Check that the McNemar p-value is two-sided and exact.", "Run pytest, then run <code>docstring_report</code> on your project folder."],
say: String.raw`A tested report toolkit computes every reported number from the saved results the same way each time and checks the code and the slide text against the brief before the ZIP is built.`,
num: String.raw`Tests expect Savitzky-Golay plus z-score with logistic regression at 0.7050 ± 0.0067 over three seeds, a Wilson interval of 0.6742 to 0.7073 for 0.691 on 3,000, McNemar p = 0.6322 for 258 and 270, four flags on card 8's draft and zero on the fixed one, version 1 of card 3 with 1 function missing a docstring and version 4 with none, and card 4's baseline test passing only with iterations.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/report_tools.py with: summarize_runs(csv_path) reading results/runs.csv with pandas and returning, per (preprocess, model), the mean and standard deviation (ddof=1) of val_acc and val_f1 and the run count, sorted by mean val_acc, wilson(acc, n, z=1.96) returning the Wilson score interval, mcnemar_exact(b, c) returning the two-sided exact p-value min(1, 2 * P(X <= min(b, c))) for X ~ Binomial(b + c, 0.5) using scipy.stats.binom, check_text(text) returning a list of flags for each semicolon, em dash, en dash, ' -- ', each percentage not next to a plus-minus sign, and the word significant or significantly when the text has no p-value, and docstring_report(path) walking every .py file under path with the ast module and returning the names of functions and classes without a docstring and files without a leading comment or module docstring. Create tests/test_report_tools.py with pytest: (1) summarize_runs on a temporary CSV with val_acc 0.6983, 0.7117, 0.705 for one configuration gives mean 0.7050 and sd 0.0067 to 1e-4, (2) wilson(0.691, 3000) is (0.6742, 0.7073) to 1e-4, (3) mcnemar_exact(258, 270) is 0.6322 to 1e-4 and mcnemar_exact(18, 30) is 0.1114, (4) check_text on 'Results; logistic regression reached 70.5% — the best of four preprocessing choices. The CNN is significantly better than the MLP.' returns 4 flags and on 'Smoothing then normalizing gave the best validation accuracy, 70.5 ± 0.7% over three seeds. The CNN beat the MLP on all three seeds.' returns none, (5) docstring_report on a temporary file containing def proc(X): return X finds proc, (6) iterative baseline removal of degree 3 with 30 iterations on three Gaussian peaks of heights 1.0, 0.6, 1.4 at 700, 1000, 1450 cm^-1 (widths 12, 20, 10) over the baseline 1.5 + 0.8t - 0.6t^2 + 0.4t^3 with t = (w - 1100)/700 on 1,000 points from 400 to 1800 returns all three heights within 0.01, and with 0 iterations does not. Do not change the tests to make them pass.",
    actions: ["$ pytest -q tests/test_report_tools.py", "......                                                   [100%]", "6 passed", "$ python -c \"from src.report_tools import docstring_report; print(docstring_report('project1_raman'))\""],
    files: [["src/report_tools.py", "summarize_runs, wilson, mcnemar_exact, check_text, docstring_report"], ["tests/test_report_tools.py", "six tests with the numbers of cards 3, 4, 6, 8 and 9"], ["results/summary.csv", "written by summarize_runs, read by plots.py and the slides"]],
    checks: ["the SD uses ddof = 1, as in card 6", "the Wilson interval is not the plain normal approximation", "the McNemar p-value is two-sided and exact for small b + c", "check_text is run on the README and on every slide's text", "docstring_report returns an empty list on both projects before the ZIP"]
  });
}},

{s: "12. Test", t: "Lesson 45 test: finishing the project",
intu: String.raw`Twelve questions on the rubric, reruns, tests, requirements, reporting over seeds, figures, slide titles, the text rules, the test set and suggestions. All numbers are new.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Write the formula before substituting.", "Say which file or set each number comes from.", "Ask what a grader would see.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to exam practice.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "A course gives the project 15% of the grade, with code worth 70% and slides 30% of the project. How many course points does the code carry?", o: ["7", "10.5", "4.5", "15"], a: 1, why: "0.15 × 0.70 = 0.105, so 10.5 course points. The slides carry 0.15 × 0.30 = 4.5. Card 1." },
    { q: "Your pipeline is data.py, preprocess.py, train.py, evaluate.py, plots.py, and you change only the colors in plots.py. What must run again?", o: ["everything, starting from data.py", "train.py onward", "plots.py, then the figures on the slides", "nothing, colors do not matter"], a: 2, why: "plots.py reads the results CSV files, which are still valid, so only the figures are rebuilt and pasted again. Card 2." },
    { q: "A plain degree-3 polynomial fit returns a known peak of height 0.8 as 0.69, and the corrected spectrum dips to −0.08 beside it. What is happening?", o: ["the degree is too high", "the peaks pull the least-squares baseline up, an iterative fit that sinks under the peaks fixes it", "the noise is too large", "z-scoring after the fit causes it"], a: 1, why: "Least squares treats the peaks as part of the baseline, so the fit rises under them and cuts into them. Replacing the signal by min(signal, fit) and refitting lets the fit sink under the peaks. Card 4." },
    { q: "Which requirements line lets a grader install what your results came from?", o: ["torch", "torch>=2.0", "torch==2.15.0", "pytorch-latest"], a: 2, why: "An exact pin installs the tested version. torch or torch>=2.0 installs whatever is newest on the grader's day. Card 5." },
    { q: "A validation accuracy is 0.71283 on 500 examples. How should it appear on a slide?", o: ["71.283%", "71.28%", "about 71%, since one score has a standard error near 2 points", "0.71283"], a: 2, why: "SE = √(0.7128 · 0.2872/500) = 0.0202, about 2 points, so digits beyond the units of a percent carry no information. Card 6." },
    { q: "Three seeds give validation accuracies 0.64, 0.66 and 0.68. What goes in the slide table?", o: ["0.68, the best seed", "0.66 ± 0.02", "0.66 ± 0.0163", "0.64 to 0.68"], a: 1, why: "Mean 1.98/3 = 0.66. With ddof = 1 the SD is √((0.02² + 0 + 0.02²)/2) = 0.02. The 0.0163 comes from ddof = 0. Card 6." },
    { q: "A class has 40 test spectra: 30 are right and 6 are predicted as class 7. What do the row-normalized diagonal and the cell for class 7 show?", o: ["30 and 6", "0.75 and 0.15", "0.75 and 0.20", "0.83 and 0.17"], a: 1, why: "Divide by the row total 40: 30/40 = 0.75 is the recall, 6/40 = 0.15 is the share sent to class 7. Card 7." },
    { q: "Which slide title follows the assertion style?", o: ["Results", "Model comparison", "Baseline removal raises validation accuracy by 6 points over raw spectra", "Figure 3"], a: 2, why: "An assertion title states the finding the slide's evidence supports. The others only name a topic. Card 8." },
    { q: "Which sentence passes the brief's text rules for slides?", o: ["Accuracy rose; the CNN won.", "Accuracy rose — the CNN won.", "Accuracy rose to 74.2 ± 1.1% and the CNN won on all seeds.", "Accuracy rose to 74.2% – the CNN won."], a: 2, why: "The brief forbids semicolons and em and en dashes, and a percentage should carry its spread. Card 8." },
    { q: "A frozen model scores 0.80 on 1,000 test examples. Which 95% Wilson interval is right?", o: ["0.7741 to 0.8236", "0.7747 to 0.8253", "0.79 to 0.81", "0.76 to 0.84"], a: 0, why: "With z = 1.96 the Wilson center is 0.7988 and the half width 0.0248, giving 0.7741 to 0.8236. The plain normal interval would be 0.7747 to 0.8253. Card 9." },
    { q: "On the same 1,000 test examples, model A alone is right on 30 and model B alone on 18. What does the exact McNemar test say?", o: ["p = 0.002, A is better", "p = 0.111, no evidence of a difference at the 5% level", "A is better because 30 > 18", "the test needs the 952 examples where they agree"], a: 1, why: "Only the 48 disagreements count: p = 2 P(X ≤ 18) for X ~ Bin(48, 0.5) = 0.111. Card 9." },
    { q: "Training accuracy stays at 0.99 while validation accuracy reads 0.61, 0.66, 0.675, 0.68 at 25, 50, 75 and 100% of the training set. Which suggestion has evidence?", o: ["collect 10% more spectra of the same kind", "the curve has flattened with a large gap, so change what the model can learn (regularization, augmentation, a better architecture or pretraining)", "train for more epochs", "lower the learning rate"], a: 1, why: "The last quarter of the data added 0.5 points, so more of the same adds little, and the 31-point gap is variance that needs a different model or prior knowledge. Card 10." }
  ], "Lesson 45 test");
}}
],
summary: String.raw`The project is graded 80% on code and 20% on slides, so the last weeks go into a pipeline that one command reruns from data to figures, with every step a script that reads and writes files and a fixed seed that makes reruns byte-identical. Code reads well when each file has a header, each function a name, a docstring with shapes and checked inputs, and a refactor is accepted only when a test shows identical output. Preprocessing is tested on inputs with a known answer, such as peaks on a known baseline, which catches a plain polynomial fit that the peaks pull up. The README says what, where the data come from, how to install, the one command and the results, and the requirements file pins tested versions. Results live in CSV files and are reported as mean and standard deviation over seeds with sensible digits. The confusion matrix is normalized by row with a view that hides the diagonal. The deck uses assertion titles, the method with its equations, results, limitations and suggestions, with no semicolons or dashes. The choice is frozen on validation, the test set is opened once and reported with an interval, and differences on it are checked with McNemar's test. Suggestions come from the learning curve, the error tally and the confusions.`,
sheet: [[String.raw`\[ 10 \times (0.8,\ 0.2) = (8,\ 2) \]`, "course points carried by code and slides"], [String.raw`\[ \text{result} = f(\text{data}, \text{code}, \text{config}, \text{seed}) \]`, "what one command must rebuild"], [String.raw`\[ y^{(k+1)} = \min\big(y^{(k)}, Vc^{(k)}\big) \]`, "iterative polynomial baseline"], [String.raw`\[ n \times p \times 8\ \text{bytes} \]`, "size of an n by p float64 array"], [String.raw`\[ \bar a \pm s_a, \quad s_a \text{ with } S - 1 \]`, "report over seeds"], [String.raw`\[ \sqrt{a(1-a)/n} \]`, "standard error of one score, sets the digits"], [String.raw`\[ R_{ij} = N_{ij} / \textstyle\sum_k N_{ik} \]`, "row-normalized confusion matrix, diagonal is recall"], [String.raw`\[ \frac{\hat p + \frac{z^2}{2n} \pm z\sqrt{\frac{\hat p(1-\hat p)}{n} + \frac{z^2}{4n^2}}}{1 + z^2/n} \]`, "Wilson interval for test accuracy"], [String.raw`\[ p = 2\,P(X \le \min(b, c)) \]`, String.raw`exact McNemar with \(X \sim \text{Bin}(b + c, 1/2)\)`], [String.raw`\[ \text{acc} + e_{\text{tag}}/n \]`, "ceiling of a fix from the error tally"]],
sources: ["AME 5970 has no lecture notes on finishing a project. The order follows the hand-in rules of the project brief course/term_project_brief.md (sections 2, 4, 5.4 to 5.9, 7 and 8) and course/project_status.md, with the course's grading rule (project 10%, code 80%, slides 20%) from course/README_course_map.md, and the habits of HW9 4D (frozen test report), HW10 B4 (confusion matrix and most frequent mistake) and HW10 D3 (paired comparison)", "Andrew Ng, Deep Learning Specialization, course 3 (Structuring machine learning projects): Train, dev and test sets, When to change dev and test sets, Carrying out error analysis, Cleaning up incorrectly labeled data", "Andrew Ng, Machine Learning Specialization, course 2 week 3: Learning curves, Error analysis", "C.-S. Ho et al., Rapid identification of pathogenic bacteria using Raman spectroscopy and deep learning, Nature Communications 10, 4927 (2019): 82.2 ± 0.3% average isolate-level accuracy on the 30-isolate test set after pretraining on 60,000 reference spectra, 100 fine-tuning and 100 test spectra per isolate, spectral range 381.98 to 1792.4 cm⁻¹ (checked against the paper on 10 November 2026)", "C. A. Lieber and A. Mahadevan-Jansen, Automated method for subtraction of fluorescence from biological Raman spectra, Applied Spectroscopy 57, 2003 (the modified polyfit baseline)", "E. B. Wilson, Probable inference, the law of succession, and statistical inference, Journal of the American Statistical Association 22, 1927, and Q. McNemar, Note on the sampling error of the difference between correlated proportions or percentages, Psychometrika 12, 1947", "T. G. Dietterich, Approximate statistical tests for comparing supervised classification learning algorithms, Neural Computation 10, 1998 (McNemar's test for two classifiers on one test set)", "Python Packaging User Guide, requirements files and pinning, and the pytest documentation", "Data: every card uses a labeled synthetic stand-in for the Raman spectra written for this lesson (30 classes, 1,000 points from 400 to 1800 cm⁻¹, peaks from default_rng(4545), 3,000 finetune spectra from default_rng(4546) split 80/20 with random_state 5970, 5971, 5972, 3,000 test spectra from default_rng(4547)), with scikit-learn 1.9.1 LogisticRegression (C = 0.3) and MLPClassifier (128, 64). The package count comes from pip's resolver on 10 November 2026. Every number was computed in Python before it was written on a card"]
});
})();
