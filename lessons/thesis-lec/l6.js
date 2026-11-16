addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 6",
id: "thesis-lec-l6", title: "PML, monitors and the Simulation object", short: "6. PML, monitors, Simulation",
big: String.raw`Three more things finish the setup. The PML is an absorbing layer around the box, so light leaving the box does not bounce back: the finite box behaves like open space. Monitors are where results are recorded: mode monitors on the TE and TM ports measure how much of each mode arrives, and a field monitor on the design region stores the field needed for the gradient. Finally everything is put into one Simulation object, with the grid, the run time and a symmetry plane. Nothing has been computed yet.`,
bridge: "Thesis Ch. 3 Sec. 3.6 (boundaries, sources, symmetry), Ch. 3 Sec. 3.4 (mode overlap at the monitors).",
cards: [
{s: "1. PML", t: "An absorbing layer so the box looks like open space",
intu: String.raw`A pulse travels to the edges of a 1D box. With a hard wall it reflects and comes back, as if the device sat inside a mirror box. With a PML (grey) the field fades inside the layer before it reaches the wall, and nothing returns. In the PBS the input and output strips run straight through the PML, so guided light leaves the box without bouncing off a waveguide end.`,
eq: String.raw`\[ \frac{\partial}{\partial x} \;\rightarrow\; \frac{1}{1 + i\sigma(x)/\omega}\,\frac{\partial}{\partial x} \]`,
sym: [[String.raw`\(\sigma(x)\)`, "absorption, zero at the inner edge, growing slowly toward the wall"]],
how: ["Inside the PML the equations get a damping term.", "It starts at zero and grows slowly, so the wave sees no sudden change and does not reflect.", "By the time it reaches the wall, almost nothing is left."],
say: "The PML is an absorbing layer whose damping grows slowly, so outgoing light is absorbed without reflection and the box behaves like open space.",
num: "Here: 40 cells of PML. Tidy3D default: 12 layers (check the docs before quoting).",
r(fig, ctl) {
  let p = 1; ctl.innerHTML = btns([["0", "Hard wall"], ["1", "PML"]], "p") + `<div class="readout" id="ro"></div>`;
  const go = () => {
    pick(ctl, "p", p); const sim = new LC.FD1(400, null, p ? 40 : 0), g = n => Math.exp(-Math.pow((n - 50) / 12, 2) / 2) * Math.sin(2 * Math.PI * 0.5 * n / 20);
    anim(() => {
      for (let i = 0; i < 4; i++) sim.step(200, sim.t < 140 ? g : null);
      let U = 0; for (let i = 0; i < 400; i++) U += sim.ez[i] ** 2;
      fig.innerHTML = svg(205, LC.draw1D(sim, { src: 200, pml: p ? 40 : 0, amp: 1 }) + `<text class="ts" x="340" y="198" text-anchor="middle">time step ${sim.t}</text>`);
      $("ro").innerHTML = `<div><span>boundary</span><b>${p ? "PML" : "hard wall"}</b></div><div><span>field energy left in the box</span><b>${U.toFixed(3)}</b></div>`;
      if (sim.t > 1400) stopAnim();
    });
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { p = +b.dataset.p; go(); }); go();
}},
{s: "2. Monitors", t: "Where the results are recorded",
intu: String.raw`Pick a monitor. The mode monitors sit across the TE port and the TM port. They record the field on their plane and later compare it with the port mode to give the mode amplitude \(a_m(\omega)\) at every wavelength (Lesson 9). The field monitor covers the design region and stores \(\mathbf{E}_\mathrm{fwd}(\mathbf{r},\omega)\) on every pixel, which the gradient needs (Lesson 12). Monitors only watch: they never change the fields.`,
eq: String.raw`\[ \text{mode monitor} \rightarrow a_m(\omega_j), \qquad \text{field monitor} \rightarrow \mathbf{E}_\mathrm{fwd}(\mathbf{r},\omega_j) \]`,
sym: [[String.raw`\(a_m(\omega_j)\)`, "complex amplitude of the port mode at wavelength j"], [String.raw`\(\mathbf{E}_\mathrm{fwd}\)`, "forward field in the design region"]],
how: ["Place a plane across each output strip.", "Place a box over the design region.", "Ask for the 101 frequencies of the band."],
say: "Mode monitors on the two ports give the mode amplitudes at every wavelength, and a field monitor on the design region stores the field needed for the gradient.",
num: "101 frequencies per monitor. In the Tidy3D adjoint workflow the design-region fields are recorded automatically.",
r(fig, ctl) {
  let m = "mon"; ctl.innerHTML = btns([["mon", "Mode monitors"], ["fmon", "Field monitor"]], "m");
  const u = () => { pick(ctl, "m", m); fig.innerHTML = LC.pbs(["design", m, "ports", "src"], { note: m === "mon" ? "teal lines: mode monitors on the TE and TM ports" : "dashed box: field monitor over the design region" }); };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { m = b.dataset.m; u(); }); u();
}},
{s: "3. The Simulation", t: "Everything put together, still nothing computed",
intu: String.raw`Step through the Simulation object line by line. Each line is something from Lessons 2 to 6. Two new items: the run time (how long to simulate, with an automatic stop once the field in the box has died away, Lesson 7), and the symmetry plane. The PBS membrane has air above and below, so the plane through its middle is a mirror and half the box can be skipped. Only after this object exists can the solver run.`,
eq: String.raw`\[ \text{Simulation} = \big\{\varepsilon_r(\mathbf{r};\mathbf{p}),\ \text{source},\ \text{monitors},\ \text{grid},\ \text{PML},\ t_\mathrm{run},\ \text{symmetry}\big\} \]`,
sym: [["run time", "longest time to simulate. The run stops earlier once the field energy has decayed"], ["symmetry", "mirror plane z = 0 through the membrane: half the box"]],
how: ["Collect structures, source, monitors.", "Add the grid rule and the PML on all sides.", "Set the run time and the symmetry, then create the object."],
say: "The Simulation object collects the permittivity map, the source, the monitors, the grid, the PML, the run time and the symmetry, and only then can FDTD run.",
num: "The z = 0 mirror is allowed for the PBS because there is air above and below. It is not used for the gratings, where the mirror below breaks it.",
r(fig, ctl) {
  const L = ["sim = td.Simulation(", "    size=sim_size,", "    medium=air,", "    structures=[membrane, input_wg, te_port, tm_port, design],", "    sources=[mode_source],", "    monitors=[te_monitor, tm_monitor, design_field_monitor],", "    grid_spec=td.GridSpec.auto(min_steps_per_wvl=20),", "    boundary_spec=td.BoundarySpec.all_sides(td.PML()),", "    run_time=run_time,", "    symmetry=(0, 0, sym_z),   # +1 for the TE run, -1 for the TM run", ")"];
  const cap = ["The box size and the background, air.", "The structures: fixed membrane and strips (Lesson 4) plus the design region with its pixels.", "The mode source with its Gaussian pulse (Lessons 2 and 3).", "The monitors: two mode monitors and the design field monitor (card 2).", "The grid: 20 steps per wavelength in each material (Lesson 5).", "PML on all sides (card 1).", "Run time: an upper limit, the run stops earlier when the field has decayed (Lesson 7).", "Mirror symmetry through the middle of the membrane: half the box is computed. +1 (a PMC mirror) keeps the TE mode, whose field lies in the plane. -1 (a PEC mirror) keeps the TM mode."];
  const H = [[1, 2], [3], [4], [5], [6], [7], [8], [9]];
  LC.steps(ctl, cap.length, k => { fig.innerHTML = LC.code(L, H[k]); return cap[k]; });
}}
],
summary: String.raw`The PML absorbs outgoing light so the box acts like open space, and the strips run through it. Mode monitors on the TE and TM ports give the mode amplitudes at all 101 wavelengths, and a field monitor stores the forward field on the design region. The Simulation object collects the permittivity map, source, monitors, grid, PML, run time and the z = 0 symmetry. Only then can FDTD run.`,
sheet: [
[String.raw`\[ \partial_x \rightarrow \frac{1}{1 + i\sigma/\omega}\,\partial_x \]`, "PML as a stretched coordinate"],
[String.raw`\[ a_m(\omega_j), \quad \mathbf{E}_\mathrm{fwd}(\mathbf{r},\omega_j) \]`, "What the monitors give"]],
consts: "1D PML demo: 40 cells, normalized units.",
sources: ["Berenger, J. Comput. Phys. 114, 185 (1994) (the PML)", "Tidy3D documentation: Simulation, PML, ModeMonitor, FieldMonitor, symmetry, Flexcompute", "Ch. 3 Sec. 3.6 of the thesis"]
});
