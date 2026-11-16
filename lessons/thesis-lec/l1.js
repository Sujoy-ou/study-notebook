addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 1",
id: "thesis-lec-l1", title: "Maxwell's equations: what the solver solves", short: "1. Maxwell's equations",
big: String.raw`Tidy3D solves two equations, Faraday's and Ampère's laws, written as "how E and H change in the next instant". For GaAs and air (linear, not magnetic, no free charge) the device appears in them only through the permittivity \(\varepsilon_r(\mathbf{r})\). Changing the PBS design means changing \(\varepsilon_r\) in the design region and nothing else. A source current \(\mathbf{J}\) on the input plane is what creates the light.`,
bridge: "Thesis Ch. 2 Sec. 2.6 writes these in the source-free form of Taflove and Hagness. Here the source term is added.",
cards: [
{s: "1. The two equations", t: "Four Maxwell equations become the two the solver steps",
intu: String.raw`Step through. We start with the four Maxwell equations, say what GaAs and air are like (linear, not magnetic, no free charge), and solve for the time derivatives. Two equations are left. The orange term is the only place the PBS geometry enters. The divergence equations need no solving: if they hold at the start, the curl equations keep them true.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r(\mathbf{r})}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big), \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]`,
sym: [[String.raw`\(\varepsilon_r(\mathbf{r})\)`, "permittivity at each point: the device (12.19 in GaAs, 1 in air)"], [String.raw`\(\mathbf{J}\)`, "source current, only on the source plane"]],
how: [String.raw`Faraday and Ampère, with \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\) and \(\mathbf{B} = \mu_0\mathbf{H}\).`, "Solve each for its time derivative.", "Divergence of a curl is zero, so the divergence equations stay true by themselves."],
say: String.raw`The solver steps Faraday's and Ampère's laws, and the device enters only through \(\varepsilon_r(\mathbf{r})\).`,
num: String.raw`GaAs: \(n = 3.492\), \(\varepsilon_r = n^2 \approx 12.19\). Air: \(\varepsilon_r = 1\).`,
r(fig, ctl) {
  const T = [
    [String.raw`\nabla\times\mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}, \qquad \nabla\times\mathbf{H} = \frac{\partial \mathbf{D}}{\partial t} + \mathbf{J}`, String.raw`\nabla\cdot\mathbf{D} = \rho, \qquad \nabla\cdot\mathbf{B} = 0`],
    [String.raw`\mathbf{D} = \varepsilon_0\,\varepsilon_r(\mathbf{r})\,\mathbf{E}, \qquad \mathbf{B} = \mu_0\,\mathbf{H}, \qquad \rho = 0`],
    [String.raw`\frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\,{\color{#c9562e}\varepsilon_r(\mathbf{r})}}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big)`, String.raw`\frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E}`]
  ];
  const cap = ["The four Maxwell equations.", "What GaAs and air are like: linear, not magnetic, no free charge.", "Solve for the time derivatives. These two are what FDTD steps. The device is only in the orange term."];
  LC.steps(ctl, 3, k => { LC.mathFig(fig, T[k]); return cap[k]; });
}},
{s: "2. E and H chase", t: "Light is E and H creating each other",
intu: String.raw`Press Play. A short pulse starts in the middle. A changing \(\mathbf{H}\) creates \(\mathbf{E}\) next to it (Faraday), and a changing \(\mathbf{E}\) creates \(\mathbf{H}\) next to it (Ampère). So the pattern moves. For this pair of components (\(E_z\) and \(H_y\)), the wave going right has \(E\) and \(H\) of opposite sign and the wave going left has the same sign, because the power flow \(\mathbf{E}\times\mathbf{H}\) points the other way.`,
eq: String.raw`\[ \mathbf{S} = \mathbf{E}\times\mathbf{H} \]`,
sym: [[String.raw`\(\mathbf{S}\)`, "Poynting vector: where the power flows"]],
how: ["The source kicks E at one point.", "E changes, so H next to it changes.", "H changes, so E one step further changes. The pattern travels."],
say: "Light is a changing electric field creating a magnetic field and the changing magnetic field creating the electric field again, one step further along.",
num: "A real 1D FDTD run: 400 cells, absorbing ends of 40 cells.",
r(fig, ctl) {
  ctl.innerHTML = `<div class="row"><button id="lpl">Play again</button></div>`;
  let sim;
  const go = () => { sim = new LC.FD1(400); anim(() => { for (let i = 0; i < 3; i++) sim.step(200, n => Math.exp(-Math.pow((n - 60) / 16, 2) / 2)); fig.innerHTML = svg(215, LC.draw1D(sim, { hy: true, src: 200, pml: 40, amp: 0.8 }) + C3.legend(60, 205, [["Ez", "var(--blue)"], ["Hy", "var(--coral)"]]) + `<text class="ts" x="640" y="205" text-anchor="end">time step ${sim.t}</text>`); if (sim.t > 900) stopAnim(); }); };
  $("lpl").onclick = go; go();
}},
{s: "3. Slower in GaAs", t: "In GaAs the wave is 3.49 times slower and shorter",
intu: String.raw`A steady wave comes from the left and enters a material of index \(n\) (shaded). Move the slider. Inside, the speed is \(c/n\), so the wavelength shrinks to \(\lambda_0/n\). At 795 nm in GaAs that is about 228 nm. This shortest wavelength is what sets the grid size later (Lesson 5).`,
eq: String.raw`\[ v = \frac{c}{n}, \qquad \lambda = \frac{\lambda_0}{n} \]`,
sym: [[String.raw`\(n = \sqrt{\varepsilon_r}\)`, "refractive index"], [String.raw`\(\lambda_0\)`, "wavelength in vacuum"]],
how: ["Combine the two curl equations: a wave equation.", String.raw`Its speed is \(c/n\).`, "Same frequency, lower speed, so a shorter wavelength."],
say: String.raw`Inside a material of index \(n\) light travels at \(c/n\) and its wavelength is \(\lambda_0/n\).`,
num: String.raw`GaAs at 795 nm: \(\lambda = 795/3.492 \approx 228\) nm. Here \(\lambda_0 = 40\) cells.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nn", "Index n", 1, 3.5, 0.1, 2) + `<div class="readout" id="ro"></div>`;
  let sim;
  const reset = () => { const n = +$("nn").value; $("nnv").textContent = n.toFixed(1); const eps = new Float64Array(400).fill(1); for (let i = 200; i < 400; i++) eps[i] = n * n; sim = new LC.FD1(400, eps); $("ro").innerHTML = `<div><span>wavelength outside</span><b>40 cells</b></div><div><span>wavelength inside</span><b>${(40 / n).toFixed(1)} cells</b></div>`; };
  $("nn").oninput = reset; reset();
  anim(() => { for (let i = 0; i < 4; i++) sim.step(60, t => 0.5 * Math.sin(2 * Math.PI * 0.5 * t / 40) * (1 - Math.exp(-t / 80))); fig.innerHTML = svg(205, LC.draw1D(sim, { src: 60, pml: 40, amp: 1.6 }) + `<text class="ts" x="${50 + 200 / 399 * 600 + 8}" y="196">material, index n</text><text class="ts" x="60" y="196">air</text>`); });
}}
],
summary: String.raw`FDTD steps two equations: \(\partial\mathbf{E}/\partial t = (\nabla\times\mathbf{H} - \mathbf{J})/(\varepsilon_0\varepsilon_r)\) and \(\partial\mathbf{H}/\partial t = -\nabla\times\mathbf{E}/\mu_0\). The PBS design enters only through \(\varepsilon_r(\mathbf{r})\). E and H create each other, so light travels, at \(c/n\) inside a material, with wavelength \(\lambda_0/n\), about 228 nm in GaAs at 795 nm.`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\Big(\nabla\times\mathbf{H} - \mathbf{J}\Big), \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla\times\mathbf{E} \]`, "The two equations FDTD steps"],
[String.raw`\[ \lambda = \lambda_0/n \]`, "Wavelength in a material"]],
consts: "1D runs in normalized units: cell 1, Courant number 0.5.",
sources: ["Taflove and Hagness, Computational Electrodynamics: The Finite-Difference Time-Domain Method, 3rd ed., Artech House (2005)", "Ch. 2 Sec. 2.6 of the thesis"]
});
