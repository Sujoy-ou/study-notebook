addLesson("thesis", "lec", {
level: "Part A", num: "Lesson 1",
id: "thesis-lec-l1", title: "Maxwell's equations: which ones the solver uses", short: "1. Maxwell's equations",
big: String.raw`Four equations describe every electric and magnetic field. For the materials in this work (linear, non-magnetic, no free charge) they shrink to two curl equations, which are six scalar equations for six field components. The device enters only through the relative permittivity \(\varepsilon_r(\mathbf{r})\). The two divergence equations then stay true by themselves, and a source current \(\mathbf{J}\) on one plane is the only thing that creates light.`,
bridge: "Thesis Ch. 2 Sec. 2.6 writes these equations in the source-free form of Taflove (Eqs. 4a and 4b there). This lesson adds the source term and explains why the other two Maxwell equations are not stepped.",
cards: [
{s: "1. Four to two", t: "From four Maxwell equations to the two the solver steps",
intu: String.raw`Step through. Start with the four equations. Then say what the materials are like: the polarization follows the field linearly (\(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\)), nothing is magnetic (\(\mathbf{B} = \mu_0\mathbf{H}\)) and there is no free charge. Put that in, and the two curl equations become the two update equations of FDTD. Notice where the device appears: only in \(\varepsilon_r(\mathbf{r})\).`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r(\mathbf{r})}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big) \]\[ \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]<div class="eqref">Ch. 2 Sec. 2.6 (source-free form), with the source current added</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "electric and magnetic field"], [String.raw`\(\varepsilon_r(\mathbf{r})\)`, "relative permittivity at each point: the device"], [String.raw`\(\varepsilon_0, \mu_0\)`, "permittivity and permeability of vacuum"], [String.raw`\(\mathbf{J}\)`, "source current, only on the source plane"]],
how: [String.raw`Faraday: \(\nabla\times\mathbf{E} = -\partial\mathbf{B}/\partial t\). Ampère: \(\nabla\times\mathbf{H} = \partial\mathbf{D}/\partial t + \mathbf{J}\).`, String.raw`Linear dielectric: \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\). Non-magnetic: \(\mathbf{B} = \mu_0\mathbf{H}\).`, "Substitute and solve each equation for its time derivative.", "The result says how each field changes in the next instant, which is exactly what a time-stepping solver needs."],
say: String.raw`For linear, non-magnetic materials without free charge, Maxwell's equations reduce to two curl equations, and the device enters only through \(\varepsilon_r(\mathbf{r})\).`,
num: String.raw`GaAs, the oxide and air in this work are all treated as linear and non-magnetic. Changing the design means changing \(\varepsilon_r\) in the design region and nothing else.`,
r(fig, ctl) {
  const T = [
    [String.raw`\nabla\times\mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}`, String.raw`\nabla\times\mathbf{H} = \frac{\partial \mathbf{D}}{\partial t} + \mathbf{J}`, String.raw`\nabla\cdot\mathbf{D} = \rho \qquad \nabla\cdot\mathbf{B} = 0`],
    [String.raw`\mathbf{D} = \varepsilon_0\,\varepsilon_r(\mathbf{r})\,\mathbf{E} \qquad \text{(linear dielectric)}`, String.raw`\mathbf{B} = \mu_0\,\mathbf{H} \qquad \text{(non-magnetic)}`, String.raw`\rho = 0 \qquad \text{(no free charge)}`],
    [String.raw`\nabla\times\mathbf{E} = -\mu_0\frac{\partial \mathbf{H}}{\partial t}`, String.raw`\nabla\times\mathbf{H} = \varepsilon_0\varepsilon_r\frac{\partial \mathbf{E}}{\partial t} + \mathbf{J}`],
    [String.raw`\frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\,{\color{#c9562e}\varepsilon_r(\mathbf{r})}}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big)`, String.raw`\frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E}`]
  ];
  const cap = ["The four Maxwell equations: two curl equations and two divergence equations.", "What the materials are like. These three facts are the only assumptions.", "Put them into the two curl equations.", String.raw`Solve for the time derivatives. These two are what FDTD steps. The device appears only in \(\varepsilon_r(\mathbf{r})\), in orange.`];
  LC.steps(ctl, 4, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},

{s: "2. E and H feed each other", t: "Light is the two curl equations chasing each other",
intu: String.raw`Press Play. A short pulse is launched in the middle of empty space. The blue curve is \(E_z\), the coral curve is \(H_y\). A changing \(\mathbf{H}\) makes a curling \(\mathbf{E}\) (Faraday), and a changing \(\mathbf{E}\) makes a curling \(\mathbf{H}\) (Ampère). Each keeps creating the other one step further along, so the pattern moves. In the wave going right, E and H have the same sign. In the wave going left, they have opposite signs, because the direction of power flow \(\mathbf{E}\times\mathbf{H}\) is reversed.`,
eq: String.raw`\[ \text{changing } \mathbf{H} \;\Rightarrow\; \nabla\times\mathbf{E} \neq 0 \qquad \text{changing } \mathbf{E} \;\Rightarrow\; \nabla\times\mathbf{H} \neq 0 \]\[ \mathbf{S} = \mathbf{E}\times\mathbf{H} \]`,
sym: [[String.raw`\(E_z, H_y\)`, "the two field components of a 1D wave moving along x"], [String.raw`\(\mathbf{S}\)`, "Poynting vector: direction and size of the power flow"]],
how: ["The source puts a short kick into E at one point.", "That E changes in time, so H around it starts to change.", "That H changes, so E a bit further away starts to change.", "Repeat: the disturbance travels away from the source in both directions."],
say: "Light is a pattern in which a changing electric field creates a magnetic field and the changing magnetic field creates the electric field again, one step further along.",
num: "The simulation here is a real 1D FDTD run in normalized units: 400 cells, Courant number 0.5, absorbing layers of 40 cells at each end.",
r(fig, ctl) {
  LC.player(ctl);
  let sim, run = false;
  const reset = () => { sim = new C2.FDTD1D(400, 0.5, null, { pml: 40, smax: 0.6, wall: "pec" }); draw(); };
  const draw = () => { fig.innerHTML = svg(215, LC.draw1D(sim, { hy: true, src: 200, pml: 40, amp: 0.8 }) + C3.legend(60, 205, [["Ez", "var(--blue)"], ["Hy", "var(--coral)"]]) + `<text class="ts" x="640" y="205" text-anchor="end">time step ${sim.t}</text>`); };
  const go = () => anim(() => { if (!run) return; for (let i = 0; i < 3; i++) { const t = sim.t; sim.step([200, Math.exp(-Math.pow((t - 60) / 16, 2) / 2)]); } draw(); if (sim.t > 900) run = false; });
  $("lpl").onclick = () => { if (sim.t > 900) reset(); run = true; go(); };
  $("lps").onclick = () => { run = false; };
  $("lpr").onclick = () => { run = false; stopAnim(); reset(); };
  reset(); run = true; go();
}},

{s: "3. Why only two", t: "The divergence equations take care of themselves",
intu: String.raw`Step through the argument. The divergence of a curl is always zero. So if Ampère's law holds, the divergence of \(\mathbf{D}\) can only change where there is a source current. Away from the source it never changes. It starts at zero, so it stays zero. The same holds for \(\mathbf{B}\). That is why FDTD steps only the two curl equations.`,
eq: String.raw`\[ \frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{D}\right) = -\nabla\cdot\mathbf{J} \]`,
sym: [[String.raw`\(\nabla\cdot\mathbf{D}\)`, "divergence of D, equal to the free charge"], [String.raw`\(\nabla\cdot(\nabla\times\mathbf{H}) = 0\)`, "a vector identity, true for any field"]],
how: [String.raw`Take the divergence of Ampère's law.`, String.raw`The left side \(\nabla\cdot(\nabla\times\mathbf{H})\) is zero.`, String.raw`So \(\partial(\nabla\cdot\mathbf{D})/\partial t = -\nabla\cdot\mathbf{J}\), which is zero away from the source.`, String.raw`Fields start at zero, so \(\nabla\cdot\mathbf{D} = 0\) for all time. The Yee grid keeps this exactly in discrete form too (Lesson 4).`],
say: "If the curl equations hold and there is no charge at the start, the divergence equations stay satisfied forever, so the solver only needs the two curl equations.",
num: "Six unknowns per point, six scalar equations from the two curls. No extra equation is needed.",
r(fig, ctl) {
  const T = [
    [String.raw`\nabla\times\mathbf{H} = \frac{\partial\mathbf{D}}{\partial t} + \mathbf{J}`],
    [String.raw`\nabla\cdot\left(\nabla\times\mathbf{H}\right) = \frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{D}\right) + \nabla\cdot\mathbf{J}`],
    [String.raw`0 = \frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{D}\right) + \nabla\cdot\mathbf{J}`],
    [String.raw`\frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{D}\right) = 0 \quad \text{away from the source}`, String.raw`\nabla\cdot\mathbf{D}(t) = \nabla\cdot\mathbf{D}(0) = 0`]
  ];
  const cap = ["Start from Ampère's law.", "Take the divergence of both sides.", "The divergence of a curl is always zero.", "Away from the source nothing changes it, and it starts at zero. So the divergence equation never needs to be solved."];
  LC.steps(ctl, 4, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},

{s: "4. Six equations", t: "Six components, each driven by the other field",
intu: String.raw`Pick a component. The picture shows which two components of the other field drive it, and the equation appears below. Every E component is driven by two H components, and every H component by two E components. Nothing drives itself. That pattern is what the Yee grid in Lesson 4 is built around.`,
eq: String.raw`\[ \frac{\partial E_x}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{\partial H_z}{\partial y} - \frac{\partial H_y}{\partial z} - J_x\right) \]<div class="eqnote">and five more with the same pattern (pick them in the picture)</div>`,
sym: [[String.raw`\(E_x, E_y, E_z\)`, "three components of the electric field"], [String.raw`\(H_x, H_y, H_z\)`, "three components of the magnetic field"]],
how: ["Write the curl as a determinant with unit vectors, derivatives and field components.", "Each row of the result is one component.", "Each component of one field needs space derivatives of two components of the other field."],
say: "The two curl equations are six scalar equations, and the time change of each component depends only on space derivatives of two components of the other field.",
num: "In 3D every grid cell carries six numbers. A region of 17 million cells therefore holds about 100 million field values.",
r(fig, ctl) {
  const C = { Ex: ["Hz", "y", "Hy", "z", 1], Ey: ["Hx", "z", "Hz", "x", 1], Ez: ["Hy", "x", "Hx", "y", 1], Hx: ["Ez", "y", "Ey", "z", -1], Hy: ["Ex", "z", "Ez", "x", -1], Hz: ["Ey", "x", "Ex", "y", -1] };
  const P = { Ex: [100, 60], Ey: [100, 130], Ez: [100, 200], Hx: [560, 60], Hy: [560, 130], Hz: [560, 200] };
  let c = "Ex";
  ctl.innerHTML = btns(Object.keys(C).map(k => [k, k[0] + "<sub>" + k[1] + "</sub>"]), "c");
  const u = () => {
    pick(ctl, "c", c);
    const [a, da, b, db, sg] = C[c];
    let s = `<text class="th" x="100" y="26" text-anchor="middle">E components</text><text class="th" x="560" y="26" text-anchor="middle">H components</text>`;
    for (const k in P) { const on = k === c || k === a || k === b; s += LC.box(P[k][0] - 45, P[k][1] - 20, 90, 40, [k[0] + k[1]], k[0] === "E" ? "blue" : "coral", !on); }
    const [x0, y0] = P[c];
    for (const k of [a, b]) { const [x1, y1] = P[k]; s += arrow(x1 + (x1 > x0 ? -47 : 47), y1, x0 + (x1 > x0 ? 47 : -47), y0, "var(--p)", 1.8); }
    s += `<text class="ts" x="330" y="245" text-anchor="middle">${c} changes in time because ${a} varies along ${da} and ${b} varies along ${db}</text>`;
    const num = sg > 0 ? String.raw`\frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{\partial ${a[0]}_${a[1]}}{\partial ${da}} - \frac{\partial ${b[0]}_${b[1]}}{\partial ${db}} - J_${c[1]}\right)` : String.raw`-\frac{1}{\mu_0}\left(\frac{\partial ${a[0]}_${a[1]}}{\partial ${da}} - \frac{\partial ${b[0]}_${b[1]}}{\partial ${db}}\right)`;
    fig.innerHTML = svg(260, s) + `<div class="eqbig">\\[\\frac{\\partial ${c[0]}_${c[1]}}{\\partial t} = ${num}\\]</div>`;
    typesetMath(fig);
  };
  ctl.querySelectorAll("button").forEach(bt => bt.onclick = () => { c = bt.dataset.c; u(); }); u();
}},

{s: "5. Speed c/n", t: "The equations describe a wave that slows down in GaAs",
intu: String.raw`A steady wave comes in from the left and enters a material with index \(n\) (shaded). Move the slider. Inside the material the wave travels at \(c/n\), so at the same frequency its wavelength shrinks to \(\lambda_0/n\). Part of the wave reflects at the surface, which is why the left side shows a partly standing pattern. The shortest wavelength in a simulation is the one inside the highest-index material, which is why the grid is set there (Lesson 6).`,
eq: String.raw`\[ \nabla^2\mathbf{E} = \frac{n^2}{c^2}\frac{\partial^2\mathbf{E}}{\partial t^2} \quad\Rightarrow\quad v = \frac{c}{n}, \qquad \lambda = \frac{\lambda_0}{n} \]`,
sym: [[String.raw`\(n = \sqrt{\varepsilon_r}\)`, "refractive index"], [String.raw`\(c = 1/\sqrt{\mu_0\varepsilon_0}\)`, "speed of light in vacuum"], [String.raw`\(\lambda_0\)`, "wavelength in vacuum"]],
how: ["Take the curl of Faraday's law.", "Insert Ampère's law for the curl of H (uniform material, no source).", String.raw`Use \(\nabla\times\nabla\times\mathbf{E} = \nabla(\nabla\cdot\mathbf{E}) - \nabla^2\mathbf{E}\) with \(\nabla\cdot\mathbf{E} = 0\).`, String.raw`The result is a wave equation with speed \(c/n\).`],
say: String.raw`Combining the two curl equations gives a wave equation with speed \(c/n\), so inside a material of index \(n\) the wavelength is \(\lambda_0/n\).`,
num: String.raw`Round example: \(\lambda_0 = 800\) nm and \(n = 3.5\) give \(\lambda \approx 229\) nm inside. Here: \(\lambda_0 = 40\) cells.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nn", "Index n", 1, 3.5, 0.1, 2) + `<div class="readout" id="ro"></div>`;
  let sim;
  const reset = () => { const n = +$("nn").value; $("nnv").textContent = n.toFixed(1); const eps = new Float64Array(400).fill(1); for (let i = 200; i < 400; i++) eps[i] = n * n; sim = new C2.FDTD1D(400, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); $("ro").innerHTML = `<div><span>wavelength outside</span><b>40 cells</b></div><div><span>wavelength inside</span><b>${(40 / n).toFixed(1)} cells</b></div><div><span>speed inside</span><b>c / ${n.toFixed(1)}</b></div>`; };
  $("nn").oninput = () => { reset(); };
  reset();
  anim(() => { for (let i = 0; i < 4; i++) { const t = sim.t; sim.step([60, 0.5 * Math.sin(2 * Math.PI * 0.5 * t / 40) * (1 - Math.exp(-t / 80))]); } fig.innerHTML = svg(205, LC.draw1D(sim, { src: 60, pml: 40, amp: 1.6 }) + `<text class="ts" x="${50 + 200 / 399 * 600 + 8}" y="196">material, index n</text><text class="ts" x="60" y="196">air</text>`); });
}},

{s: "6. The source", t: "Without a source current, nothing happens",
intu: String.raw`Start with the source off. All fields are zero and they stay zero, because every update only rearranges what is already there. Turn the source on: the current \(\mathbf{J}\) on one point (a plane in 3D) adds a little field every step and light appears. Turn it off again: the light already made keeps travelling and leaves through the absorbing ends, and the fields return to zero. Everywhere except the source plane, the equations are source-free.`,
eq: String.raw`\[ \mathbf{J}(\mathbf{r},t) \neq 0 \quad\text{only on the source plane, while the pulse is on} \]`,
sym: [[String.raw`\(\mathbf{J}\)`, "source current density"], ["source plane", "where the mode source or beam is placed (Lesson 8)"]],
how: [String.raw`With \(\mathbf{J} = 0\) and zero fields at the start, both time derivatives are zero.`, "So the fields never change: no light.", "A source current adds a known amount to E every step at the source plane.", "Everywhere else the light then follows the source-free equations."],
say: String.raw`Maxwell's equations only move light around. The source current \(\mathbf{J}\) on the source plane is what creates it, and everywhere else the equations are source-free.`,
num: "In this 1D run the source is a single cell. In a 3D mode source it is a sheet of current shaped like the waveguide mode.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button data-o="1">Source on</button><button data-o="0">Source off</button><button id="lr">Reset fields</button></div><div class="readout" id="ro"></div>`;
  let on = 0, sim;
  const reset = () => { sim = new C2.FDTD1D(400, 0.5, null, { pml: 40, smax: 0.6, wall: "pec" }); };
  ctl.querySelectorAll("button[data-o]").forEach(b => b.onclick = () => { on = +b.dataset.o; pick(ctl, "o", on); });
  $("lr").onclick = reset; reset(); pick(ctl, "o", on);
  anim(() => {
    for (let i = 0; i < 3; i++) { const t = sim.t; sim.step(on ? [200, 0.4 * Math.sin(2 * Math.PI * 0.5 * t / 40)] : null); }
    const mx = Math.max(...Array.from(sim.ez).map(Math.abs));
    fig.innerHTML = svg(200, LC.draw1D(sim, { src: 200, pml: 40, amp: 1 }) + `<text class="ts" x="340" y="196" text-anchor="middle">${on ? "J on: light is created at the source" : (mx < 1e-3 ? "J off and no field: nothing ever changes" : "J off: the light already made leaves through the ends")}</text>`);
    $("ro").innerHTML = `<div><span>source</span><b>${on ? "on" : "off"}</b></div><div><span>largest |E| now</span><b>${mx.toFixed(3)}</b></div>`;
  });
}}
],
summary: String.raw`For linear, non-magnetic materials without free charge, Maxwell's equations become two curl equations, six scalar equations for six components. The device appears only through \(\varepsilon_r(\mathbf{r})\). The divergence equations stay true by themselves, so FDTD steps only the curls. Combined, the two curls give a wave with speed \(c/n\) and wavelength \(\lambda_0/n\). A source current on one plane is the only thing that creates light.`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big), \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]`, "The two equations FDTD steps"],
[String.raw`\[ \frac{\partial}{\partial t}\left(\nabla\cdot\mathbf{D}\right) = -\nabla\cdot\mathbf{J} \]`, "Why the divergence equations need no solving"],
[String.raw`\[ v = \frac{c}{n}, \qquad \lambda = \frac{\lambda_0}{n} \]`, "Wave speed and wavelength in a material"]],
consts: String.raw`1D runs in normalized units: cell size 1, Courant number 0.5, absorbing layers of 40 cells. Worked example \(\lambda_0 = 800\) nm, \(n = 3.5\).`,
sources: ["Taflove and Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed., Artech House (2005), Ch. 3 (Maxwell's equations for FDTD)", "Taflove and Hagness, Wiley Encyclopedia of Electrical and Electronics Engineering (2016), Eqs. (4a) and (4b), cited in Ch. 2 Sec. 2.6", "Jackson, Classical Electrodynamics, 3rd ed., Wiley (1999), Sec. 6.1 and 7.1"]
});
