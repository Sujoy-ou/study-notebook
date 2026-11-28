/* Prologue: the PBS in one picture. */
const FDP1_STEPS = [
  { n: "Pulse", l: "fdtd-4-1", ln: "Lesson 4.1", d: String.raw`A short Gaussian pulse in time has a wide spectrum, so one run covers the whole band from 735 to 835 nm.` },
  { n: "Source", l: "fdtd-4-2", ln: "Lesson 4.2", d: String.raw`The mode source injects the TE\(_0\) or TM\(_0\) mode of the input waveguide, shaped in space by the mode solver and in time by the pulse.` },
  { n: "Yee grid", l: "fdtd-1-3", ln: "Lessons 1.3, 1.4 and 2.3", d: String.raw`Space is cut into cells. E and H sit half a cell apart, so every curl becomes a difference of neighbours.` },
  { n: "Fields in time", l: "fdtd-1-3", ln: "Lesson 1.3", d: String.raw`The leapfrog updates H, then E, half a time step apart, until the pulse has passed through and left the box.` },
  { n: "Frequency domain", l: "fdtd-4-4", ln: "Lesson 4.4", d: String.raw`Each monitor keeps a running Fourier sum, so after the run it holds the field at every wavelength of the band.` },
  { n: "FOM", l: "fdtd-4-5", ln: "Lessons 4.5 and 6.3", d: String.raw`The power in the right output mode at each port, from the mode overlap, averaged over the band, is the figure of merit.` },
  { n: "Adjoint source", l: "thesis-lec-l11", ln: "Part B, Chapter 9 (early version now)", d: String.raw`The output mode is sent backwards from the port monitor, with the conjugate of the forward amplitude.` },
  { n: "Gradient", l: "thesis-lec-l12", ln: "Part B, Chapter 9 (early version now)", d: String.raw`The forward field times the adjoint field, in every pixel, gives the slope of the FOM for all pixels from two runs.` },
  { n: "Adam", l: "thesis-lec-l13", ln: "Part B, Chapter 10 (early version now)", d: String.raw`Adam changes every pixel by a step of sensible size, then the loop goes back to step 4.` }
];
/* A small picture for each storyline step, t is time in seconds for the animated ones. */
function FDP1_mini(k, t) {
  const X = C3.X(60, 560, 0, 1), base = 150;
  let s = "";
  if (k === 0) {
    const xs = range(0, 1, 400);
    s += plot(60, 40, 560, 160, xs, xs.map(x => FD.pulse(x, 0.5, 0.08, 2 * Math.PI * 22)), 0, 1, -1.1, 1.1, "var(--blue)", 1.6);
    s += plot(60, 40, 560, 160, xs, xs.map(x => Math.exp(-Math.pow((x - 0.5) / 0.08, 2) / 2)), 0, 1, -1.1, 1.1, "var(--coral)", 1.4, "5 4");
    s += FD.txt(340, 222, "the field the source puts in, against time (dashed: its envelope)", "ts", "middle");
  } else if (k === 1) {
    const zs = range(-1, 1, 200), N = C2.slabN(3.5, 1, 0.4, 1.6, 0, "TE"), p = C2.slabProfile(3.5, 1, 0.4, 1.6, 0, "TE", N, zs).main;
    s += `<rect x="${X(0.4)}" y="40" width="${X(0.6) - X(0.4)}" height="160" fill="var(--blue-bg)"/>` + plot(60, 40, 560, 160, zs.map(z => (z + 1) / 2), p, 0, 1, -0.1, 1.1, "var(--purple)", 2.4);
    s += FD.txt(340, 222, "the input mode across the waveguide (shaded): the shape the source launches", "ts", "middle");
  } else if (k === 2) {
    for (let i = 0; i <= 8; i++) s += `<line x1="${140 + i * 50}" x2="${140 + i * 50}" y1="30" y2="210" stroke="var(--b)"/>`;
    for (let j = 0; j <= 3; j++) s += `<line x1="140" x2="540" y1="${30 + j * 60}" y2="${30 + j * 60}" stroke="var(--b)"/>`;
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 3; j++) s += `<circle cx="${140 + i * 50}" cy="${30 + j * 60}" r="4" fill="var(--blue)"/>`;
    for (let i = 0; i < 8; i++) for (let j = 0; j <= 3; j++) s += `<rect x="${163 + i * 50 - 3}" y="${30 + j * 60 - 3}" width="6" height="6" fill="var(--coral)"/>`;
    s += FD.txt(340, 230, "E (dots) and H (squares) half a cell apart", "ts", "middle");
  } else if (k === 3) {
    const xs = range(0, 1, 300), c = (t * 0.25) % 1.3 - 0.15;
    s += plot(60, 40, 560, 160, xs, xs.map(x => FD.pulse(x, c, 0.05, 2 * Math.PI * 16)), 0, 1, -1.1, 1.1, "var(--blue)", 2);
    s += FD.txt(340, 222, "the pulse moving through the grid, one time step after another", "ts", "middle");
  } else if (k === 4) {
    const ls = range(735, 835, 101), T = ls.map(l => 0.55 + 0.35 * Math.cos(2 * Math.PI * (l - 735) / 60));
    s += C3.frame(70, 30, 540, 160, 735, 835, 0, 1, [735, 785, 835], [0, 1], "wavelength (nm)", "") + plot(70, 30, 540, 160, ls, T, 735, 835, 0, 1, "var(--teal)", 2);
    s += FD.txt(340, 232, "one run gives a value at all 101 wavelengths (made-up curve)", "ts", "middle");
  } else if (k === 5) {
    s += `<rect x="140" y="${200 - 0.8 * 150}" width="120" height="${0.8 * 150}" fill="var(--teal)"/><rect x="400" y="${200 - 0.7 * 150}" width="120" height="${0.7 * 150}" fill="var(--purple)"/>`;
    s += FD.txt(200, 220, "TE input, TE port", "ts", "middle") + FD.txt(460, 220, "TM input, TM port", "ts", "middle") + FD.txt(340, 40, "FOM = sum of the two band-averaged powers (made-up values)", "ts", "middle");
  } else if (k === 6) {
    s = LC.pbs(["design", "ports", "adj"], { note: "the output mode launched backwards from the port" });
    return s;
  } else if (k === 7) {
    const r = C3.rng(5); let g = ""; const n = 16, c = 10;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = Math.sin(i * 0.5 + j * 0.3) * Math.cos(j * 0.45) + 0.3 * (r() - 0.5), col = C2.color(v); g += `<rect x="${260 + i * c}" y="${40 + j * c}" width="${c}" height="${c}" fill="rgb(${col.join(",")})"/>`; }
    s += g + FD.txt(340, 222, "one number per pixel: red, more GaAs helps, blue, less helps (made-up map)", "ts", "middle");
  } else {
    const f = (x, y) => 0.15 * x * x + 2 * y * y; let p = [-2.6, 0.9], d = `M ${340 + p[0] * 80} ${120 - p[1] * 80}`;
    const m = [0, 0], v = [0, 0];
    for (let it = 1; it <= 30; it++) { const g = [0.3 * p[0], 4 * p[1]]; for (let q = 0; q < 2; q++) { m[q] = 0.9 * m[q] + 0.1 * g[q]; v[q] = 0.999 * v[q] + 0.001 * g[q] * g[q]; p[q] -= 0.25 * (m[q] / (1 - 0.9 ** it)) / (Math.sqrt(v[q] / (1 - 0.999 ** it)) + 1e-8); } d += ` L ${340 + p[0] * 80} ${120 - p[1] * 80}`; }
    for (const r of [0.2, 0.6, 1.2, 2]) s += `<ellipse cx="340" cy="120" rx="${Math.sqrt(r / 0.15) * 80}" ry="${Math.sqrt(r / 2) * 80}" fill="none" stroke="var(--b)"/>`;
    s += `<path d="${d}" fill="none" stroke="var(--coral)" stroke-width="2"/>` + FD.txt(340, 232, "Adam steps toward the best design on a stretched bowl", "ts", "middle");
    void f; void base;
  }
  return svg(240, s);
}

addLesson("fdtd", "pro", {
level: "Start here", num: "Prologue",
id: "fdtd-p1", title: "The PBS in one picture", short: "P. The PBS in one picture",
big: String.raw`This shelf teaches FDTD and Tidy3D through one device: the polarization beam splitter (PBS). TE\(_0\) light entering the input waveguide must leave through the TE port and TM\(_0\) light through the TM port, across the band from 735 to 835 nm. A free-form design region in between decides where the light goes. To design it, the code runs the same nine steps again and again: a pulse, a mode source, the Yee grid, the fields stepped in time, a Fourier transform to every wavelength, the figure of merit, an adjoint source, the gradient, and an Adam update. Part A teaches steps 1 to 6. Part B teaches steps 7 to 9 and the code.`,
bridge: "Every later lesson ends with a PBS checkpoint card that points back to one of the nine steps on this page.",
cards: [
{s: "1. The device", t: "What the PBS must do",
intu: String.raw`Light enters on the left in a 200 nm wide strip of a suspended semiconductor membrane. The square is the design region, the only part the optimizer may change. Two output strips leave on the right. Pick an input. TE\(_0\) has its electric field mostly in the plane of the membrane, TM\(_0\) mostly normal to it. They see the design region differently, and that difference is what the design uses to send them to different ports.`,
eq: String.raw`\[ \text{TE}_0 \rightarrow \text{TE port}, \qquad \text{TM}_0 \rightarrow \text{TM port}, \qquad 735 \le \lambda_0 \le 835\ \text{nm} \]`,
sym: [["TE0, TM0", "the fundamental guided modes with E mostly in the plane (TE) or normal to it (TM)"], ["design region", "a square of pixels, each either membrane or air"], ["ports", "the two output waveguides"]],
how: ["Fix the input and output waveguides.", "Leave a square region free.", "Let an optimizer choose, pixel by pixel, where the material goes, so each polarization ends in its own port over the whole band."],
say: "FDTD solves Maxwell's curl equations step by step in time. It does not solve the Helmholtz equation at one frequency, although its Fourier-transformed fields satisfy it.",
num: String.raw`Method settings used as the example on this shelf: 160 nm membrane, index 3.492, air above and below, 200 nm strips at \(y = \pm 0.6\) µm, a 2.5 × 2.5 µm design region.`,
r(fig, ctl) {
  let k = "all"; ctl.innerHTML = btns([["all", "Whole device"], ["te", "TE0 input"], ["tm", "TM0 input"]], "k");
  const u = () => { pick(ctl, "k", k); fig.innerHTML = LC.pbs(k === "all" ? ["design", "ports", "src"] : k === "te" ? ["design", "ports", "src", "fwd"] : ["design", "ports", "src", "fwdTM"], { note: k === "all" ? "drawn to scale, 64 px per µm. The shading is a starting Y-splitter." : k === "te" ? "goal: TE0 in, TE port out" : "goal: TM0 in, TM port out" }); };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = b.dataset.k; u(); }); u();
}},
{s: "2. The nine steps", t: "One optimization step, from pulse to Adam",
intu: String.raw`Click a step. The picture shows what that step does and the line below says which lesson teaches it. Steps 1 to 3 only set things up, nothing is computed yet. Steps 4 to 6 are the forward calculation. Steps 7 and 8 are the adjoint gradient. Step 9 changes the design and the loop returns to step 4. One optimization step of the PBS does steps 4 to 8 twice, once for TE\(_0\) input and once for TM\(_0\).`,
eq: String.raw`\[ \underbrace{\text{pulse, source, grid}}_{\text{set up}} \;\rightarrow\; \underbrace{\text{fields, frequency, FOM}}_{\text{forward}} \;\rightarrow\; \underbrace{\text{adjoint source, gradient}}_{\text{adjoint}} \;\rightarrow\; \text{Adam} \]`,
sym: [["set up", "steps 1 to 3, defined once"], ["forward", "steps 4 to 6, one FDTD run per input"], ["adjoint", "steps 7 and 8, one more FDTD run per input"], ["update", "step 9, then back to step 4"]],
how: ["Define the pulse, the source and the grid once.", "Run FDTD forward, transform to frequency and measure the FOM.", "Run FDTD once more with the adjoint source and combine the two fields into the gradient.", "Let Adam change the pixels and repeat."],
say: "One optimization step is a forward run and an adjoint run for each input polarization, followed by one Adam update of all pixels.",
num: "Per optimization step: 2 forward and 2 adjoint FDTD runs, whatever the number of pixels.",
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row">${FDP1_STEPS.map((p, i) => `<button data-k="${i}">${i + 1}. ${p.n}</button>`).join("")}</div><p class="note" id="p1c"></p>`;
  const u = () => {
    pick(ctl, "k", k);
    const p = FDP1_STEPS[k];
    $("p1c").innerHTML = `<b>Step ${k + 1}, ${p.n}.</b> ${p.d} Taught in <a href="#${p.l}">${p.ln}</a>.`;
    typesetMath($("p1c"));
    if (k === 3) anim(t => { fig.innerHTML = FD.storyStrip(k + 1) + FDP1_mini(k, t); });
    else { stopAnim(); fig.innerHTML = FD.storyStrip(k + 1) + FDP1_mini(k, 0); }
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},
{s: "3. The study map", t: "Which lesson needs which",
intu: String.raw`This is Part A as a map. An arrow means the lesson at its tail must come first. The number in each box is the study order, and the Next button at the bottom of every lesson follows it. Two things look out of order on purpose. Modes (Chapter 6) come before Sources (Chapter 4), because a mode source needs the mode solver first. Symmetry (Lesson 3.4) and Bloch boundaries (Lesson 3.3) wait for the lessons they use. Click a box to open that lesson.`,
eq: String.raw`\[ \text{Ch 1} \rightarrow \text{Ch 2} \rightarrow 3.1, 3.2 \rightarrow \text{Ch 6} \rightarrow 3.4 \rightarrow 4.1\text{ to }4.3 \rightarrow 3.3 \rightarrow 4.4, 4.5 \rightarrow \text{Ch 5} \]`,
sym: [["boxes", "lessons, numbered by chapter"], ["small number", "study order"], ["arrows", "this one first"]],
how: ["Start with the Prologue and Chapter 1.", "Follow the study order numbers.", "Use the Next button at the end of each lesson."],
say: "The chapters are numbered by topic, but the study order puts modes before sources because a mode source needs the eigenmode solver.",
num: "Part A: 1 prologue and 23 lessons.",
r(fig, ctl) {
  const N = FD.ORDER_A, pos = {};
  const cols = [["fdtd-1-1", "fdtd-1-2", "fdtd-1-3", "fdtd-1-4"], ["fdtd-2-1", "fdtd-2-2", "fdtd-2-3", "fdtd-2-4"], ["fdtd-3-1", "fdtd-3-2", "fdtd-3-4", "fdtd-3-3"], ["fdtd-6-1", "fdtd-6-2", "fdtd-6-3"], ["fdtd-4-1", "fdtd-4-2", "fdtd-4-3", "fdtd-4-4", "fdtd-4-5"], ["fdtd-5-1", "fdtd-5-2", "fdtd-5-3"]];
  const heads = ["Ch 1 Yee", "Ch 2 Grid", "Ch 3 Boundaries", "Ch 6 Modes", "Ch 4 Sources", "Ch 5 Materials"];
  let s = "";
  cols.forEach((c, i) => { s += FD.txt(62 + i * 108, 18, heads[i], "ts", "middle"); c.forEach((id, j) => { pos[id] = [62 + i * 108, 44 + j * 50]; }); });
  const E = [["fdtd-1-4", "fdtd-2-1"], ["fdtd-1-4", "fdtd-3-1"], ["fdtd-1-4", "fdtd-6-1"], ["fdtd-6-1", "fdtd-3-4"], ["fdtd-6-3", "fdtd-4-2"], ["fdtd-4-3", "fdtd-3-3"], ["fdtd-2-3", "fdtd-5-3"], ["fdtd-4-4", "fdtd-5-1"]];
  E.forEach(([a, b]) => { const [x1, y1] = pos[a], [x2, y2] = pos[b]; s += `<line x1="${x1 + 44}" y1="${y1}" x2="${x2 - 46}" y2="${y2}" stroke="var(--b)" stroke-width="1.4" marker-end="url(#ar)"/>`; });
  for (const id in pos) {
    const [x, y] = pos[id], ord = N.indexOf(id), lab = id.replace("fdtd-", "").replace("-", ".");
    s += `<a href="#${id}"><g class="c-${id.startsWith("fdtd-6") ? "purple" : id.startsWith("fdtd-3-3") || id.startsWith("fdtd-3-4") ? "coral" : "blue"}"><rect x="${x - 44}" y="${y - 16}" width="88" height="32" rx="6" stroke-width="1.2"/><text class="th" x="${x - 8}" y="${y + 5}" text-anchor="middle">${lab}</text><text class="ts" x="${x + 30}" y="${y + 5}" text-anchor="middle">#${ord}</text></g></a>`;
  }
  fig.innerHTML = svg(300, s) + `<p class="note">Purple: Chapter 6, studied before Chapter 4. Coral: lessons of Chapter 3 studied later than their chapter. Arrows: the dependencies between chapters. Inside a column, lessons go top to bottom.</p>`;
}}
],
summary: String.raw`The PBS must send TE\(_0\) to one port and TM\(_0\) to the other from 735 to 835 nm, using a free-form design region. Each optimization step runs the same nine steps: pulse, source, Yee grid, fields in time, Fourier transform, figure of merit, adjoint source, gradient, Adam. Part A teaches the physics and numerics of steps 1 to 6, Part B the adjoint, the optimizer and the code.`,
sheet: [
[String.raw`\[ \text{TE}_0 \rightarrow \text{TE port}, \quad \text{TM}_0 \rightarrow \text{TM port} \]`, "The goal"],
[String.raw`\[ \text{per step: } 2 \text{ forward} + 2 \text{ adjoint runs} \]`, "Cost of one optimization step, independent of the number of pixels"]],
teach: [
  "Draw a waveguide coming in from the left, a square, and two waveguides leaving on the right. Label the ports TE and TM.",
  String.raw`Say the goal: TE\(_0\) to the TE port and TM\(_0\) to the TM port over the whole band.`,
  "Write the nine steps in a row: pulse, source, grid, fields in time, frequency, FOM, adjoint source, gradient, Adam.",
  "Circle steps 4 to 8 and write \"twice per step\" (TE and TM inputs). Draw an arrow from Adam back to step 4.",
  "End with the key point: the gradient for every pixel costs only one extra run per input, which is why FDTD plus the adjoint method can design a device with tens of thousands of pixels."
],
qa: [
  ["Why FDTD and not a frequency-domain solver?", "The figure of merit is averaged over a band of wavelengths. One FDTD run with a broadband pulse gives every wavelength at once, while a frequency-domain solver needs one solve per wavelength. FDTD also needs no large matrix, only local updates, so it scales to large 3D problems on GPUs."],
  ["What exactly does FDTD solve?", String.raw`Faraday's and Ampère's laws in time, discretized on the Yee grid. Because the materials are linear and do not change in time, the Fourier transform of the recorded fields at one frequency also solves the frequency-domain Maxwell equations at that frequency, up to a small numerical dispersion error.`],
  ["Why does the cost not grow with the number of pixels?", "Because of the adjoint method. The gradient for all pixels comes from the product of the forward field and one extra (adjoint) field, so it costs one more simulation per input, whether there are ten pixels or a hundred thousand. Part B derives this."]
],
mistakes: [
  "Calling FDTD a frequency-domain method. It steps in time and gets frequencies by a Fourier transform at the monitors.",
  "Forgetting that the PBS needs two inputs. Every optimization step simulates TE0 and TM0 input separately.",
  "Thinking the optimizer changes the waveguides. Only the design region changes."
],
videos: [FD.vid("idao", "Watch the chapters \"Introduction to inverse design\" and \"Practical waveguide example\" for the same big picture.")],
sources: [FD.R.molesky, FD.R.td, "Method settings of the thesis PBS (Ch. 3 and Ch. 4 Sec. 4.1), used here as a worked example without results"]
});
