/* Lesson 2.3: Grid resolution with your numbers. */
/* Graded 1D grid across a layer: fine cells inside [a, b], growing by at most `scale` per cell outside up to dAir. */
function FD23_grid(z0, z1, a, b, dIn, dAir, scale) {
  const nIn = Math.max(1, Math.ceil((b - a) / dIn)), d = (b - a) / nIn, lines = [];
  for (let i = 0; i <= nIn; i++) lines.push(a + i * d);
  let z = b, s = d; while (z < z1) { s = Math.min(dAir, s * scale); z += s; lines.push(z); }
  z = a; s = d; while (z > z0) { s = Math.min(dAir, s * scale); z -= s; lines.unshift(z); }
  return { lines, nIn, d };
}

addLesson("fdtd", "a2", {
level: "Core", num: "Lesson 2.3",
id: "fdtd-2-3", title: "Grid resolution with your numbers", short: "2.3 Grid resolution",
big: String.raw`Tidy3D's automatic grid makes the cell in every material equal to the local wavelength divided by the number of steps you ask for, so cells are fine in the membrane and coarse in air, with a smooth grading between them. Three things then decide whether the grid is good enough: the cells per wavelength in the highest-index material (numerical dispersion, Lesson 2.2), the cells across the smallest feature (how well the geometry is drawn), and the cells across thin layers and evanescent tails. At 795 nm in a medium of index 3.49 the wavelength is about 228 nm, so 10, 15, 20 and 30 steps give cells of 22.8, 15.2, 11.4 and 7.6 nm.`,
bridge: String.raw`Tidy3D documentation, "Using automatic nonuniform meshing" and the Grid Specification examples. AutoGrid defaults read from tidy3d 2.11.2: <code>min_steps_per_wvl</code> 10, <code>max_scale</code> 1.4.`,
cards: [
{s: "1. The automatic grid", t: "Fine in the membrane, coarse in air, graded in between",
intu: String.raw`This is a cut through a 160 nm membrane in air along \(z\), with the grid lines Tidy3D's rule would draw. Inside the membrane the cell is \(\lambda_0/(nN)\), adjusted so a whole number of cells fits the thickness exactly (the grid snaps to the faces). Outside, the cell grows by at most a factor of 1.4 per cell until it reaches the air value \(\lambda_0/N\). Change the steps and the index. Compare the number of cells with a uniform grid at the fine size: the graded grid saves most of the cells in air.`,
eq: String.raw`\[ \Delta_\text{material} = \frac{\lambda_0}{n\,N}, \qquad \frac{\Delta_{j+1}}{\Delta_j} \le 1.4 \]`,
sym: [["N", String.raw`<code>min_steps_per_wvl</code> (default 10)`], ["1.4", String.raw`<code>max_scale</code>, the largest allowed growth from one cell to the next`], [String.raw`\(\lambda_0\)`, "the wavelength given to the grid, usually the centre of the band"]],
how: ["Find the material at each position.", "Set the target cell from its index.", "Snap grid lines to every structure face.", "Grade between regions with neighbouring cells differing by at most 1.4 times."],
say: "The automatic grid uses the local wavelength divided by <code>min_steps_per_wvl</code> in each material, snaps to interfaces, and grades the cell size by at most 1.4 between regions.",
num: String.raw`\(n = 3.492\), \(\lambda_0 = 795\) nm: N = 10, 15, 20, 30 give 22.8, 15.2, 11.4, 7.6 nm inside and 79.5, 53.0, 39.8, 26.5 nm in air.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength N", 6, 40, 1, 20) + sl("n", "Membrane index n", 1.5, 3.6, 0.01, 3.49) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const N = +$("N").value, n = +$("n").value; $("Nv").textContent = N; $("nv").textContent = n.toFixed(2);
    const G = FD23_grid(-0.8, 0.8, -0.08, 0.08, 0.795 / (n * N), 0.795 / N, 1.4), X = C3.X(40, 600, -0.8, 0.8);
    let s = `<rect x="${X(-0.08)}" y="30" width="${X(0.08) - X(-0.08)}" height="120" fill="var(--blue-bg)" stroke="var(--blue)"/>` + FD.txt(340, 24, "membrane, 160 nm", "ts", "middle");
    G.lines.forEach(z => { if (z >= -0.8 && z <= 0.8) s += `<line x1="${X(z)}" x2="${X(z)}" y1="40" y2="140" stroke="var(--p)" stroke-width="0.8"/>`; });
    s += `<line x1="40" x2="640" y1="170" y2="170" stroke="var(--b)"/>` + FD.txt(40, 190, "−0.8 µm") + FD.txt(600, 190, "+0.8 µm") + FD.txt(340, 190, "z", "ts", "middle");
    fig.innerHTML = svg(205, s);
    const uni = Math.ceil(1.6 / G.d);
    $("ro").innerHTML = FD.ro([["cell in the membrane", FD.f(G.d * 1000, 2) + " nm"], ["cells across 160 nm", G.nIn], ["cell far in air", FD.f(795 / N, 1) + " nm"], ["cells along z", G.lines.length - 1 + " (uniform: " + uni + ")"]]);
  };
  $("N").oninput = u; $("n").oninput = u; u();
}},
{s: "2. Cells across a feature", t: "Drawing a 120 nm feature with square cells",
intu: String.raw`The grid draws every shape with square cells, so curved and slanted edges become staircases. The figure draws a 120 nm wide bar at an angle and a round hole on the grid for the steps per wavelength you choose (cells as in a medium of index 3.49 at 795 nm). With few cells the hole is a jagged blob and the bar width varies along its length. Subpixel averaging (Lesson 5.3) softens this by giving boundary cells an averaged permittivity, but the features still need several cells across to be represented well.`,
eq: String.raw`\[ \text{cells across a feature} = \frac{w}{\Delta} = \frac{w\,n\,N}{\lambda_0} \]`,
sym: [["w", "feature width, here 120 nm"], [String.raw`\(\Delta\)`, "cell size"]],
how: ["Compute the cell size.", "Divide the smallest feature by it.", "Aim for at least about 5 cells across the smallest feature, more if its exact width matters."],
say: "A 120 nm feature spans about 5 cells at 10 steps per wavelength and about 16 cells at 30, in a material of index 3.49 at 795 nm.",
num: "10: 5.3 cells. 15: 7.9. 20: 10.5. 30: 15.8 cells across 120 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength N", 6, 40, 1, 10) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N; const d = 795 / (3.49 * N), sc = 1.2;
    const W = 600 / sc, H = 230 / sc; let s = "";
    for (let x = 0; x < W; x += d) for (let y = 0; y < H; y += d) {
      const cx = x + d / 2, cy = y + d / 2;
      const inHole = Math.hypot(cx - 95, cy - 100) <= 60;
      const u2 = (cx - 320) * Math.cos(0.5) + (cy - 100) * Math.sin(0.5), v2 = -(cx - 320) * Math.sin(0.5) + (cy - 100) * Math.cos(0.5), inBar = Math.abs(v2) <= 60 && Math.abs(u2) <= 90;
      const fill = inBar ? "var(--blue)" : inHole ? "var(--panel)" : "var(--blue-bg)";
      if (x < 200 || inBar) s += `<rect x="${20 + x * sc}" y="${20 + y * sc}" width="${d * sc}" height="${d * sc}" fill="${x < 200 ? (inHole ? "var(--panel)" : "var(--blue)") : fill}" stroke="var(--b)" stroke-width="0.3"/>`;
    }
    s += `<circle cx="${20 + 95 * sc}" cy="${20 + 100 * sc}" r="${60 * sc}" fill="none" stroke="var(--coral)" stroke-width="2"/>`;
    s += `<g transform="translate(${20 + 320 * sc} ${20 + 100 * sc}) rotate(${0.5 * 180 / Math.PI})"><rect x="${-90 * sc}" y="${-60 * sc}" width="${180 * sc}" height="${120 * sc}" fill="none" stroke="var(--coral)" stroke-width="2"/></g>`;
    s += FD.txt(20 + 95 * sc, 300, "120 nm hole, high-index material around it", "ts", "middle") + FD.txt(20 + 320 * sc, 300, "120 nm wide bar, tilted", "ts", "middle");
    fig.innerHTML = svg(310, s);
    $("ro").innerHTML = FD.ro([["cell", FD.f(d, 1) + " nm"], ["cells across 120 nm", FD.f(120 / d, 1)]]);
  };
  $("N").oninput = u; u();
}},
{s: "3. Thin layers and tails", t: "Resolving the mode inside and outside the membrane",
intu: String.raw`The guided mode of a 160 nm membrane is a cosine inside and decays exponentially into the air. Both parts must be sampled. The dots are the grid samples for your setting. The thickness gives only 15 cells at 20 steps per wavelength, and the decay length outside is about 44 nm, which the graded grid covers with a few fine cells near the faces. If the grid outside were coarse right away, the tail would be under-resolved and the effective index of the mode, which sets every phase in the device, would be off.`,
eq: String.raw`\[ E(z) \propto e^{-\gamma(|z| - t/2)}, \qquad \gamma = k_0\sqrt{n_\text{eff}^2 - 1} \]`,
sym: [[String.raw`\(\gamma\)`, "decay rate of the evanescent tail in air"], [String.raw`\(1/\gamma\)`, "decay length"], ["t", "membrane thickness"]],
how: ["Solve the slab mode (Lesson 6.1).", "Compute the decay length in air.", "Count the cells across the thickness and across one decay length."],
say: "A thin membrane needs enough cells across its thickness and across the evanescent decay length, which the graded automatic grid provides near the faces.",
num: String.raw`TE\(_0\) of a 160 nm slab of index 3.492 at 795 nm: \(n_\text{eff} \approx 3.07\), decay length about 44 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength N", 6, 40, 1, 20) + `<div class="readout" id="ro"></div>`;
  const ne = C2.slabN(3.492, 1, 0.16, 0.795, 0, "TE"), zs = range(-0.4, 0.4, 400), P = C2.slabProfile(3.492, 1, 0.16, 0.795, 0, "TE", ne, zs);
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N;
    const G = FD23_grid(-0.4, 0.4, -0.08, 0.08, 0.795 / (3.492 * N), 0.795 / N, 1.4), X = C3.X(60, 560, -0.4, 0.4), Y = C3.Y(30, 160, -0.05, 1.05);
    let s = `<rect x="${X(-0.08)}" y="30" width="${X(0.08) - X(-0.08)}" height="160" fill="var(--blue-bg)"/>` + C3.frame(60, 30, 560, 160, -0.4, 0.4, -0.05, 1.05, [-0.4, -0.2, 0, 0.2, 0.4], [0, 1], "z (µm)", "|Ey|") + plot(60, 30, 560, 160, zs, P.main, -0.4, 0.4, -0.05, 1.05, "var(--blue)", 2);
    const prof = z => { const i = Math.round((z + 0.4) / 0.8 * 399); return P.main[Math.max(0, Math.min(399, i))]; };
    G.lines.forEach(z => { if (z > -0.4 && z < 0.4) s += `<circle cx="${X(z)}" cy="${Y(prof(z))}" r="3" fill="var(--coral)"/>`; });
    fig.innerHTML = svg(232, s);
    const dec = 1 / P.gamma, near = G.lines.filter(z => z > 0.08 && z < 0.08 + dec).length;
    $("ro").innerHTML = FD.ro([["n_eff of TE0", FD.f(ne, 3)], ["decay length 1/γ", FD.f(dec * 1000, 0) + " nm"], ["cells across 160 nm", G.nIn], ["cells within one decay length", near]]);
  };
  $("N").oninput = u; u();
}},
{s: "4. Override where it matters", t: "One cell per design pixel",
intu: String.raw`Toggle between the two grids over the top view of a design region. The automatic grid follows whatever material is there, so while the optimizer is still changing pixels the cells inside the region would change from one iteration to the next. A mesh override fixes a uniform cell over the design region. Choosing the pixel equal to the cell means each design variable is exactly one grid cell, the permittivity map needs no interpolation, and the grid stays the same throughout the optimization. Outside the region the automatic grid still saves cells.`,
eq: String.raw`\[ \Delta_\text{override} = \text{pixel} = \frac{2.5\ \mu\text{m}}{220} = 11.36\ \text{nm} \approx \frac{\lambda_0}{20\,n} \]`,
sym: [["override", "a region where you set the cell size yourself"], ["pixel", "one design variable of the density map"]],
how: ["Put a MeshOverrideStructure on the design region with the pixel size.", "Keep the automatic grid elsewhere.", "Check the result with <code>sim.plot_grid</code> before running."],
say: "A mesh override over the design region keeps the grid fixed while the design changes and lets each pixel be exactly one cell.",
num: "220 × 220 = 48,400 pixels over 2.5 × 2.5 µm.",
r(fig, ctl) {
  let g = "auto"; ctl.innerHTML = btns([["auto", "Automatic grid"], ["ovr", "With override"]], "g");
  const u = () => {
    pick(ctl, "g", g); let s = "";
    const x0 = 160, y0 = 20, L = 220, r = C3.rng(7);
    for (let j = 0; j < 22; j++) for (let i = 0; i < 22; i++) if (r() > 0.55) s += `<rect x="${x0 + i * 10}" y="${y0 + j * 10}" width="10" height="10" fill="var(--blue)" fill-opacity="0.7"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${L}" height="${L}" fill="none" stroke="var(--coral)" stroke-width="2"/>`;
    if (g === "auto") { let x = x0 - 60; const xs = []; while (x < x0 + L + 60) { const inside = x >= x0 && x < x0 + L, d = inside ? (r() > 0.5 ? 10 : 20) : 28; xs.push(x); x += d; } xs.forEach(v => s += `<line x1="${v}" x2="${v}" y1="${y0}" y2="${y0 + L}" stroke="var(--p)" stroke-width="0.7"/>`); s += FD.txt(340, 262, "automatic: cell size follows the current material, it changes as pixels change", "ts", "middle"); }
    else { for (let i = 0; i <= 22; i++) s += `<line x1="${x0 + i * 10}" x2="${x0 + i * 10}" y1="${y0}" y2="${y0 + L}" stroke="var(--p)" stroke-width="0.7"/><line x1="${x0}" x2="${x0 + L}" y1="${y0 + i * 10}" y2="${y0 + i * 10}" stroke="var(--p)" stroke-width="0.7"/>`; for (let x = x0 - 60; x < x0; x += 28) s += `<line x1="${x}" x2="${x}" y1="${y0}" y2="${y0 + L}" stroke="var(--p)" stroke-width="0.7"/>`; for (let x = x0 + L + 28; x < x0 + L + 60; x += 28) s += `<line x1="${x}" x2="${x}" y1="${y0}" y2="${y0 + L}" stroke="var(--p)" stroke-width="0.7"/>`; s += FD.txt(340, 262, "override: one cell per pixel inside, automatic outside, fixed for every iteration", "ts", "middle"); }
    fig.innerHTML = svg(272, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { g = b.dataset.g; u(); }); u();
}},
FD.ckpt({ step: 3, t: "Your four resolutions, in nanometres",
  intu: String.raw`The thesis codes use four resolutions: 10 and 15 steps per wavelength for quick 2D and screening runs, 20 for optimization, and 30 for the final validation. In the membrane at 795 nm those are 22.8, 15.2, 11.4 and 7.6 nm cells, so a 120 nm minimum feature spans 5, 8, 11 and 16 cells and the 160 nm thickness 8, 11, 15 and 22 cells. The PBS pixel was chosen equal to the cell at 20 steps, so in the optimization every pixel is one cell. Switch to the code to see how an override fixes that.`,
  code: ["# the PBS pixel equals the cell at 20 steps per wavelength: 0.795 / (20 * 3.492) = 0.01138 um", "design_mesh = td.MeshOverrideStructure(", "    geometry=td.Box(center=(0, 0, 0), size=(2.5, 2.5, 0.16)),", "    dl=(0.01138, 0.01138, None))          # x and y fixed, z left to the automatic grid", "grid_spec = td.GridSpec.auto(min_steps_per_wvl=20, wavelength=0.795,", "                             override_structures=[design_mesh])", "sim.plot_grid(z=0)   # always look at the grid before you run"],
  hi: [1, 2, 3],
  on: ["design", "pix", "ports"], cap: "each pixel of the design region is one grid cell",
  eq: String.raw`\[ N = 10, 15, 20, 30 \ \Rightarrow\ \Delta = 22.8,\ 15.2,\ 11.4,\ 7.6\ \text{nm} \]`,
  sym: [["N", "<code>min_steps_per_wvl</code>"], [String.raw`\(\Delta\)`, "cell in a medium of index 3.492 at 795 nm"]],
  how: ["Pick N from the job: screening, optimization or validation.", "Check cells across the smallest feature and across the thickness.", "Fix the design region with an override if the pixels must match the cells."],
  say: "At 20 steps per wavelength the membrane cell is 11.4 nm, equal to the PBS pixel, so a 120 nm feature spans about 11 cells.",
  num: "The override shown is a way to force pixel equal to cell. Whether a given thesis script used an override or relied on the automatic grid is in its own GridSpec."
})
],
summary: String.raw`The automatic grid sets the cell in each material to \(\lambda_0/(nN)\), snaps to interfaces and grades by at most 1.4 between neighbouring cells. Check three things: cells per wavelength in the highest-index material, cells across the smallest feature, and cells across thin layers and evanescent tails. At 795 nm in a medium of index 3.49 the cells are 22.8, 15.2, 11.4 and 7.6 nm at N = 10, 15, 20 and 30. A mesh override fixes the grid over a design region so that each pixel is one cell.`,
sheet: [
[String.raw`\[ \Delta = \frac{\lambda_0}{nN} \]`, "Cell size from the steps per wavelength"],
[String.raw`\[ \frac{w}{\Delta} = \frac{w\,n\,N}{\lambda_0} \]`, "Cells across a feature of width w"],
[String.raw`\[ \gamma = k_0\sqrt{n_\text{eff}^2 - n_\text{clad}^2} \]`, "Decay rate of the evanescent tail"]],
consts: String.raw`\(\lambda_0 = 795\) nm, \(n = 3.492\) (method value), AutoGrid defaults: <code>min_steps_per_wvl</code> 10, <code>max_scale</code> 1.4.`,
teach: [
  "Write Δ = λ0/(nN) and fill in 795 nm, 3.49 and 20: 11.4 nm.",
  "Draw a membrane cut with dense lines inside and sparse lines outside, growing gradually.",
  "Draw a circle on squared paper. Say: this is staircasing, it needs enough cells.",
  "Sketch the mode: cosine inside, exponential outside. Say: the tail must be sampled too.",
  "Finish with the three checks: cells per wavelength, cells per feature, cells per thin layer."
],
qa: [
  ["Why 20 steps per wavelength for optimization and 30 for validation?", "20 keeps each forward and adjoint run affordable during dozens of iterations, with a phase speed error of about 0.3 %. The final design is then re-simulated at 30 (about 0.1 %) to show the result does not depend on the grid."],
  ["Why is the cell in air not a problem when it is much larger?", "Because the wavelength in air is 3.5 times longer, the same number of cells per wavelength is kept. The grading limit of 1.4 avoids sudden jumps, which would reflect waves at the grid itself."],
  ["Could a coarse grid make the optimizer cheat?", "Yes. An optimizer exploits any error it can, including numerical dispersion and staircasing, and can design a device that only works on that grid. Validating on a finer grid is the check against this."],
  ["What does sim.plot_grid show?", "The grid lines on a cut through the simulation, on top of the structures, so you can see the cell size in each region before paying for a run."]
],
mistakes: [
  "Setting <code>min_steps_per_wvl</code> with the wavelength of the wrong end of the band. Use the shortest wavelength, or the centre with a margin.",
  "Forgetting that a thin layer can force small cells across its thickness regardless of the steps per wavelength.",
  "Letting the grid inside a design region change between iterations, which adds noise to the figure of merit.",
  "Never looking at the grid. <code>plot_grid</code> takes seconds and catches most mistakes."
],
videos: [FD.vid("f9", "How material values are assigned to Yee cells, and why staircasing matters."), FD.vid("f101page", "The course notebooks include grid specification examples.")],
sources: [FD.R.td + ": GridSpec.auto, AutoGrid (<code>min_steps_per_wvl</code>, <code>max_scale</code>), MeshOverrideStructure, Simulation.<code>plot_grid</code>", "Tidy3D example library: Using automatic nonuniform meshing, Automatic mesh refinement in layered structures (Grid Specification section)", FD.R.taflove + ", Ch. 4"]
});
