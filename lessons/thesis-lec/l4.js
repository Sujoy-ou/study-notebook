addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 4",
id: "thesis-lec-l4", title: "Geometry and the design region", short: "4. Geometry and pixels",
big: String.raw`Next the code places the structures. The fixed ones never change: the GaAs membrane, the input strip and the two output strips. Each material is just a permittivity, \(\varepsilon_r = n^2\). Then comes the design region, \(2.5 \times 2.5\) µm, cut into \(220 \times 220\) pixels. Every pixel has a density \(\rho\) between 0 (air) and 1 (GaAs). Before the densities become permittivity they are smoothed (filter) and pushed toward 0 or 1 (projection), so the design stays makeable. The densities are what the optimizer changes.`,
bridge: "Thesis Ch. 3 Sec. 3.3, Eqs. (3.8) to (3.10), and Ch. 4 Sec. 4.2 (start design: a Y-splitter with density 0.9 in the arms and 0.1 elsewhere).",
cards: [
{s: "1. Fixed geometry", t: "Every material is a permittivity",
intu: String.raw`Switch between the top view and the side view. From the top, the fixed parts are the 200 nm input strip and the two output strips at \(\pm 0.6\) µm. From the side, everything is one 160 nm GaAs layer with air above and below. For the solver, all of this is only a map of \(\varepsilon_r(\mathbf{r})\): 12.19 where there is GaAs and 1 where there is air.`,
eq: String.raw`\[ \varepsilon_r(\mathbf{r}) = n(\mathbf{r})^2, \qquad \varepsilon_\mathrm{GaAs} = 3.492^2 \approx 12.19, \qquad \varepsilon_\mathrm{air} = 1 \]`,
sym: [[String.raw`\(\varepsilon_r(\mathbf{r})\)`, "permittivity map, the only thing the solver knows about the device"]],
how: ["Draw each structure as a shape with a material.", "The material gives its permittivity.", "The solver turns the shapes into a permittivity value on every grid cell (Lesson 5)."],
say: String.raw`For the solver the device is only a permittivity map: \(n^2\) of GaAs inside the structures and 1 in the air around.`,
num: "Membrane 160 nm thick. Strips 200 nm wide. Ports at y = ±0.6 µm.",
r(fig, ctl) {
  let v = "top"; ctl.innerHTML = btns([["top", "Top view"], ["side", "Side view"]], "v");
  const u = () => {
    pick(ctl, "v", v);
    if (v === "top") fig.innerHTML = LC.pbs(["ports"], { note: "blue: GaAs (ε ≈ 12.19). White: air (ε = 1)." });
    else fig.innerHTML = svg(200, `<rect x="40" y="30" width="600" height="140" fill="none" stroke="var(--b)"/><rect x="40" y="88" width="600" height="24" fill="var(--blue-bg)" stroke="var(--blue)"/><text class="ts" x="340" y="104" text-anchor="middle">GaAs membrane, 160 nm, ε ≈ 12.19</text><text class="ts" x="340" y="60" text-anchor="middle">air, ε = 1</text><text class="ts" x="340" y="150" text-anchor="middle">air, ε = 1 (the membrane is suspended)</text>` + arrow(660, 160, 660, 40, "var(--t)", 1) + `<text class="ts" x="664" y="36">z</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { v = b.dataset.v; u(); }); u();
}},
{s: "2. Pixels", t: "48,400 pixels, each with a density",
intu: String.raw`The design region is a grid of \(220 \times 220\) pixels of 11.38 nm (drawn coarser here). Each pixel has a density \(\rho\): 0 is air, 1 is GaAs, and values in between are a blend that only exists during the optimization. Move the slider to see how one pixel's density sets its permittivity. The optimization starts from a Y-splitter: 0.9 in the two arms, 0.1 elsewhere.`,
eq: String.raw`\[ \varepsilon = \varepsilon_\mathrm{air} + \hat\rho\,\big(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}\big) \]<div class="eqref">Ch. 3 Eq. (3.10)</div>`,
sym: [[String.raw`\(\rho\)`, "density of a pixel, what the optimizer changes"], [String.raw`\(\hat\rho\)`, "the density after filter and projection (card 3)"]],
how: ["Divide the 2.5 µm square into 220 × 220 pixels.", "Give each pixel a density between 0 and 1.", "Map the (processed) density linearly to permittivity."],
say: "Each of the 48,400 pixels has a density between 0 and 1, and after filtering and projection it sets the pixel's permittivity between air and GaAs.",
num: "2.5 µm / 220 = 11.38 nm per pixel, the same size as the solver cell (Lesson 5).",
r(fig, ctl) {
  ctl.innerHTML = sl("rh", "Density of one pixel", 0, 1, 0.01, 0.9) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const r = +$("rh").value; $("rhv").textContent = r.toFixed(2); const e = 1 + r * 11.19;
    fig.innerHTML = LC.pbs(["pix", "ports"], { note: "Y-splitter start: 0.9 in the arms, 0.1 elsewhere (20 × 20 drawn, 220 × 220 real)" });
    $("ro").innerHTML = `<div><span>density ρ</span><b>${r.toFixed(2)}</b></div><div><span>permittivity ε</span><b>${e.toFixed(2)}</b></div><div><span>index √ε</span><b>${Math.sqrt(e).toFixed(2)}</b></div>`;
  };
  $("rh").oninput = u; u();
}},
{s: "3. Filter and projection", t: "Smooth, then push toward air or GaAs",
intu: String.raw`One row of 220 pixels. Top: raw densities, which can be noisy. Middle: after the filter, each pixel is a weighted average of its neighbours within \(R = 120\) nm, so features smaller than that fade. Bottom: after the projection, values are pushed toward 0 or 1. Raise \(\beta\) to make the push sharper. During the PBS optimization \(\beta\) rises from 1 to 100, so the design ends almost binary.`,
eq: String.raw`\[ \tilde\rho_i = \frac{\sum_j K(d_{ij})\,\rho_j}{\sum_j K(d_{ij})}, \qquad \hat\rho = \frac{\tanh(\beta\eta) + \tanh\big(\beta(\tilde\rho - \eta)\big)}{\tanh(\beta\eta) + \tanh\big(\beta(1-\eta)\big)} \]<div class="eqref">Ch. 3 Eqs. (3.8) and (3.9)</div>`,
sym: [[String.raw`\(K(d) = \max(0, 1 - d/R)\)`, "cone-shaped weight, radius R = 120 nm"], [String.raw`\(\beta\)`, "sharpness, 1 to 100"], [String.raw`\(\eta = 0.5\)`, "threshold"]],
how: ["Filter: average over a cone of radius R. Removes tiny features.", String.raw`Projection: a smooth step at \(\eta\). Pushes grey toward 0 or 1.`, String.raw`Raise \(\beta\) slowly, so the optimizer is not frozen too early.`],
say: "The densities are filtered over 120 nm to remove tiny features and then projected toward 0 or 1, with the sharpness raised from 1 to 100 during the optimization.",
num: "R = 120 nm, rounded up by Tidy3D to 11 pixels. β from 1 to 100 in 11 levels of 7 steps.",
r(fig, ctl) {
  ctl.innerHTML = sl("bb", "Projection sharpness β", 1, 100, 1, 8) + `<div class="row"><button id="nw">New random row</button></div>`;
  let seed = 4, raw;
  const mk = () => { const r = C3.rng(seed); raw = Float64Array.from({ length: 220 }, () => r()); };
  const u = () => {
    const b = +$("bb").value; $("bbv").textContent = b;
    const f = C3.filter1D(raw, 11), p = f.map(v => C3.proj(v, b, 0.5));
    let s = "";
    [["raw ρ", raw], ["filtered ρ̃", f], ["projected ρ̂", p]].forEach(([t, a], k) => { const y = 20 + k * 62; s += `<text class="ts" x="20" y="${y + 22}">${t}</text>` + C3.stripe(130, y, 520, 34, a); });
    s += `<line x1="130" x2="${130 + 11 / 220 * 520}" y1="200" y2="200" stroke="var(--coral)" stroke-width="3"/><text class="ts" x="${136 + 11 / 220 * 520}" y="204">R = 120 nm (11 pixels)</text>`;
    fig.innerHTML = svg(215, s);
  };
  $("bb").oninput = u; $("nw").onclick = () => { seed++; mk(); u(); }; mk(); u();
}}
],
summary: String.raw`The fixed geometry (membrane, input strip, output strips) and the design pixels together form the permittivity map \(\varepsilon_r(\mathbf{r})\), the only thing the solver knows about the device. The design region has 48,400 pixels of 11.38 nm, each with a density \(\rho\). The densities are filtered over 120 nm, projected toward 0 or 1 with a sharpness \(\beta\) raised from 1 to 100, and mapped linearly to permittivity.`,
sheet: [
[String.raw`\[ \varepsilon_r = n^2 \]`, "Material to permittivity"],
[String.raw`\[ \rho \;\xrightarrow{\text{filter}}\; \tilde\rho \;\xrightarrow{\text{projection}}\; \hat\rho \;\rightarrow\; \varepsilon = \varepsilon_\mathrm{air} + \hat\rho(\varepsilon_\mathrm{GaAs} - \varepsilon_\mathrm{air}) \]`, "From a pixel density to its permittivity (Ch. 3 Eqs. 3.8 to 3.10)"]],
consts: "Design region 2.5 × 2.5 µm, 220 × 220 pixels, R = 120 nm, η = 0.5.",
sources: ["Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021), Eqs. (9), (18), (19) (projection and linear interpolation)", "Tidy3D documentation, ConicFilter, Flexcompute", "Ch. 3 Sec. 3.3 and Ch. 4 Sec. 4.2 of the thesis"]
});
