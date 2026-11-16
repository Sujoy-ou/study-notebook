const LC_STEPS = [
  ["Set up", "1", "Maxwell's equations: what the solver solves", "Maxwell"],
  ["Set up", "2", "Wavelengths and the Gaussian pulse", "Pulse"],
  ["Set up", "3", "The mode source at the input", "Mode source"],
  ["Set up", "4", "Geometry and the design region (pixels)", "Geometry, pixels"],
  ["Set up", "5", "The Yee grid and the mesh size", "Yee grid, mesh"],
  ["Set up", "6", "PML, monitors and the Simulation object", "PML, monitors"],
  ["Forward", "7", "The forward run in time", "Run in time"],
  ["Forward", "8", "From time to frequency", "Time to frequency"],
  ["Forward", "9", "Mode overlap and the figure of merit", "Overlap, FOM"],
  ["Gradient", "10", "The gradient we want", "Gradient"],
  ["Gradient", "11", "The adjoint source", "Adjoint source"],
  ["Gradient", "12", "The adjoint run and the gradient", "Adjoint run"],
  ["Update", "13", "Adam and the full loop", "Adam, loop"]
];

addLesson("thesis", "lec", {
level: "Start here", num: "Lesson 0",
id: "thesis-lec-l0", title: "The example and the whole procedure", short: "0. The PBS and the procedure",
big: String.raw`The whole series follows one example: the polarization beam splitter (PBS) of the thesis. TE\(_0\) light coming in must leave through the TE port and TM\(_0\) light through the TM port, using a free-form \(2.5 \times 2.5\) µm design region of GaAs pixels. Every lesson is one step of what the code and the solver actually do, in order: define the pulse and the source, the geometry and the pixels, the grid, the boundaries and the monitors, run FDTD in time, turn the fields into frequencies, measure the figure of merit, build the adjoint source, run the adjoint simulation, get the gradient, and let Adam change the pixels. Then the loop repeats.`,
bridge: "Thesis sections used: Ch. 2 Sec. 2.6 (FDTD), Ch. 3 (method), Ch. 4 Sec. 4.1 (the PBS setup). Only the method settings are used here, no results.",
cards: [
{s: "1. The example", t: "The PBS we design",
intu: String.raw`This is the device, drawn to scale. Light enters on the left in a 200 nm GaAs strip. The square is the design region, the only part the optimizer may change. Two output strips leave at \(y = +0.6\) µm (TM port) and \(y = -0.6\) µm (TE port). The goal: TE\(_0\) input ends in the TE port, TM\(_0\) input ends in the TM port, over the whole band from 735 to 835 nm. Everything is etched through a suspended 160 nm GaAs membrane with air above and below.`,
eq: String.raw`\[ \text{TE}_0 \rightarrow \text{TE port}, \qquad \text{TM}_0 \rightarrow \text{TM port}, \qquad 735 \text{ to } 835 \text{ nm} \]`,
sym: [["design region", "2.5 × 2.5 µm, 220 × 220 pixels of 11.38 nm"], ["ports", "200 nm strips at y = ±0.6 µm"], ["membrane", "160 nm GaAs, n = 3.492, air above and below"]],
how: ["Fix the input and output waveguides.", "Leave a square region free.", "Let the optimizer decide, pixel by pixel, where GaAs goes inside it."],
say: "The PBS has one input and two output ports, and inverse design chooses the GaAs pixels in a 2.5 µm square so that TE goes to one port and TM to the other over the whole band.",
num: "220 × 220 = 48,400 design pixels. 101 wavelengths from 735 to 835 nm. Centre 795 nm.",
r(fig, ctl) {
  let k = "all"; ctl.innerHTML = btns([["all", "Whole device"], ["te", "TE input"], ["tm", "TM input"]], "k");
  const u = () => { pick(ctl, "k", k); fig.innerHTML = LC.pbs(k === "all" ? ["design", "ports", "src"] : k === "te" ? ["design", "ports", "src", "fwd"] : ["design", "ports", "src", "fwdTM"], { note: k === "all" ? "the shading is the starting Y-splitter" : k === "te" ? "goal: TE0 in, TE port out" : "goal: TM0 in, TM port out" }); };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = b.dataset.k; u(); }); u();
}},
{s: "2. The procedure", t: "Thirteen steps, one lesson each",
intu: String.raw`Step through the procedure. The first six steps only define things: nothing is computed yet. Steps 7 to 9 are the forward calculation. Steps 10 to 12 are the adjoint gradient. Step 13 changes the design and sends you back to step 7. Each step is one lesson of this series.`,
eq: String.raw`\[ \text{set up} \rightarrow \text{forward} \rightarrow \text{figure of merit} \rightarrow \text{adjoint} \rightarrow \text{gradient} \rightarrow \text{update} \]`,
sym: [["Set up", "Lessons 1 to 6: what the code defines"], ["Forward", "Lessons 7 to 9: run and measure"], ["Gradient", "Lessons 10 to 12: adjoint"], ["Update", "Lesson 13: Adam and the loop"]],
how: ["Define everything once (Lessons 1 to 6).", "Each optimization step: forward runs, figure of merit, adjoint runs, gradient, update (Lessons 7 to 13).", "Repeat until the figure of merit stops improving."],
say: "The code first defines the pulse, source, geometry, grid, boundaries and monitors, then each step runs FDTD forward, measures the figure of merit, runs the adjoint, gets the gradient and updates the pixels.",
num: "Per optimization step: 2 forward runs (TE and TM input) and 2 adjoint runs.",
r(fig, ctl) {
  LC.steps(ctl, LC_STEPS.length, k => {
    let s = "";
    LC_STEPS.forEach((p, i) => {
      const col = i < 6 ? "blue" : i < 9 ? "teal" : i < 12 ? "purple" : "coral", x = 20 + (i % 5) * 130, y = 20 + Math.floor(i / 5) * 78;
      s += LC.box(x, y, 120, 62, ["Lesson " + p[1], p[3]], col, i > k);
    });
    fig.innerHTML = svg(260, s);
    return `<b>Lesson ${LC_STEPS[k][1]}.</b> ${LC_STEPS[k][2]}.`;
  });
}}
],
summary: String.raw`One example runs through the whole series: a PBS that sends TE\(_0\) to the TE port and TM\(_0\) to the TM port over 735 to 835 nm, using a \(2.5 \times 2.5\) µm region of 48,400 GaAs pixels. The procedure is: set up (pulse, source, geometry, grid, boundaries, monitors), forward run, figure of merit, adjoint source and adjoint run, gradient, Adam update, repeat.`,
sheet: [[String.raw`\[ \text{TE}_0 \rightarrow \text{TE port}, \quad \text{TM}_0 \rightarrow \text{TM port} \]`, "The goal"], [String.raw`\[ 220 \times 220 = 48{,}400 \text{ pixels} \]`, "Design variables"]],
sources: ["Ch. 3 and Ch. 4 Sec. 4.1 of the thesis (method and PBS setup)", "Tidy3D documentation, Flexcompute (the solver used)"]
});
