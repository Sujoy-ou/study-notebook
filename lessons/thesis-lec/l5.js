addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 5",
id: "thesis-lec-l5", title: "The Yee grid and the mesh size", short: "5. Yee grid and mesh",
big: String.raw`The solver cuts space into small cells and stores the fields on them. On the Yee grid, \(\mathbf{E}\) and \(\mathbf{H}\) do not sit at the same points: they are shifted by half a cell, so every curl becomes a simple difference of neighbours. The cell must be small compared with the shortest wavelength, which is inside GaAs. With 20 steps per wavelength in GaAs at 795 nm the cell is 11.38 nm, exactly the PBS pixel size. The time step then follows from the cell size: light must not cross more than one cell per step.`,
bridge: "Thesis Ch. 2 Sec. 2.6 and Fig. 2.7 (Yee cell), Ch. 3 Sec. 3.6 (20 steps per wavelength for optimization, 30 for reported results).",
cards: [
{s: "1. The Yee cell", t: "E and H are shifted by half a cell",
intu: String.raw`This is a 2D slice of the Yee grid for a field with \(E_z\), \(H_x\), \(H_y\). Blue dots are \(E_z\), orange marks are \(H_x\) and \(H_y\), half a cell away. Pick a component: the highlighted neighbours are the only values its update needs. \(E_z\) is surrounded by a loop of four H values, which is exactly the curl of H around it. Each H sits between two E values, which is the curl of E. In 3D, E sits on the cell edges and H on the faces (thesis Fig. 2.7), with the same idea.`,
eq: String.raw`\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y}\right) \approx \frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{H_y\big|_{i+\frac12} - H_y\big|_{i-\frac12}}{\Delta x} - \frac{H_x\big|_{j+\frac12} - H_x\big|_{j-\frac12}}{\Delta y}\right) \]`,
sym: [[String.raw`\(\Delta x, \Delta y\)`, "cell size"], [String.raw`\(i \pm \tfrac12\)`, "half a cell to either side"]],
how: ["Place E and H half a cell apart.", "Each derivative becomes a difference of the two neighbours around a point.", "That central difference is accurate to second order, and the loops match the curls exactly."],
say: "On the Yee grid E and H are staggered by half a cell, so each curl is a central difference around a loop of neighbouring values.",
num: "Each cell stores 3 E and 3 H components in 3D.",
r(fig, ctl) {
  let c = "ez"; ctl.innerHTML = btns([["ez", "E_z"], ["hx", "H_x"], ["hy", "H_y"]], "c");
  const u = () => {
    pick(ctl, "c", c); const d = 90, x0 = 115, y0 = 40; let s = "";
    for (let i = 0; i <= 5; i++) s += `<line x1="${x0 + i * d}" x2="${x0 + i * d}" y1="${y0}" y2="${y0 + 2 * d}" stroke="var(--b)"/>`;
    for (let j = 0; j <= 2; j++) s += `<line x1="${x0}" x2="${x0 + 5 * d}" y1="${y0 + j * d}" y2="${y0 + j * d}" stroke="var(--b)"/>`;
    const on = new Set(); const ci = 2, cj = 1;
    if (c === "ez") { on.add(`hy${ci}-${cj}`); on.add(`hy${ci - 1}-${cj}`); on.add(`hx${ci}-${cj}`); on.add(`hx${ci}-${cj - 1}`); on.add(`ez${ci}-${cj}`); }
    if (c === "hx") { on.add(`hx${ci}-${cj}`); on.add(`ez${ci}-${cj}`); on.add(`ez${ci}-${cj + 1}`); }
    if (c === "hy") { on.add(`hy${ci}-${cj}`); on.add(`ez${ci}-${cj}`); on.add(`ez${ci + 1}-${cj}`); }
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 2; j++) { const k = `ez${i}-${j}`; s += `<circle cx="${x0 + i * d}" cy="${y0 + j * d}" r="${on.has(k) ? 9 : 6}" fill="${on.has(k) ? "var(--blue)" : "var(--blue-bg)"}" stroke="var(--blue)"/>`; }
    for (let i = 0; i <= 5; i++) for (let j = 0; j < 2; j++) { const k = `hx${i}-${j}`, X = x0 + i * d, Y = y0 + (j + 0.5) * d; s += `<rect x="${X - 6}" y="${Y - 6}" width="12" height="12" fill="${on.has(k) ? "var(--coral)" : "var(--coral-bg)"}" stroke="var(--coral)"/>`; }
    for (let i = 0; i < 5; i++) for (let j = 0; j <= 2; j++) { const k = `hy${i}-${j}`, X = x0 + (i + 0.5) * d, Y = y0 + j * d; s += `<path d="M${X - 7} ${Y + 6}L${X} ${Y - 7}L${X + 7} ${Y + 6}z" fill="${on.has(k) ? "var(--coral)" : "var(--coral-bg)"}" stroke="var(--coral)"/>`; }
    s += `<text class="ts" x="340" y="248" text-anchor="middle">dots: E_z on the nodes. Squares: H_x half a cell up. Triangles: H_y half a cell right.</text>`;
    s += `<text class="th" x="340" y="24" text-anchor="middle">${c === "ez" ? "E_z needs the loop of four H around it" : c === "hx" ? "H_x needs the two E_z above and below" : "H_y needs the two E_z left and right"}</text>`;
    fig.innerHTML = svg(260, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { c = b.dataset.c; u(); }); u();
}},
{s: "2. Mesh size", t: "20 steps per wavelength in GaAs: 11.38 nm",
intu: String.raw`The curve is one wavelength inside GaAs (about 228 nm at 795 nm). The dots are the grid points. Move the slider. With too few points per wavelength the wave travels at a slightly wrong speed on the grid (numerical dispersion). Tidy3D sets the cell from a number of steps per wavelength inside each material, so the grid is fine in GaAs and coarser in air. At 20 steps the GaAs cell is 11.38 nm, chosen equal to the PBS pixel.`,
eq: String.raw`\[ \Delta = \frac{\lambda_0}{N_\mathrm{spw}\; n} \]`,
sym: [[String.raw`\(N_\mathrm{spw}\)`, "steps (cells) per wavelength"], [String.raw`\(n\)`, "index of the material (3.492 for GaAs, 1 for air)"]],
how: ["Find the shortest wavelength: inside GaAs, 795/3.492 ≈ 228 nm.", "Divide it by the steps per wavelength.", "Use a coarser cell where the index is lower (non-uniform grid)."],
say: "The cell size is the wavelength inside the material divided by the steps per wavelength: 11.38 nm in GaAs at 20 steps, the same as the pixel size.",
num: "20 steps: 11.38 nm in GaAs, 39.8 nm in air (optimization). 30 steps: 7.59 nm in GaAs (reported results).",
r(fig, ctl) {
  ctl.innerHTML = sl("ns", "Steps per wavelength", 6, 40, 1, 20) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const N = +$("ns").value; $("nsv").textContent = N; const lg = 795 / 3.492, d = lg / N;
    const xs = range(0, lg, 300), X = C3.X(60, 560, 0, lg);
    let s = C3.frame(60, 30, 560, 150, 0, lg, -1.2, 1.2, [0, Math.round(lg / 2), Math.round(lg)], [], "position in GaAs (nm)", "", v => v) + plot(60, 30, 560, 150, xs, xs.map(x => Math.sin(2 * Math.PI * x / lg)), 0, lg, -1.2, 1.2, "var(--blue)", 2);
    for (let k = 0; k <= N; k++) { const x = k * d, y = 30 + 150 * (1.2 - Math.sin(2 * Math.PI * x / lg)) / 2.4; s += `<circle cx="${X(x)}" cy="${y}" r="4" fill="var(--coral)"/>`; }
    fig.innerHTML = svg(225, s);
    $("ro").innerHTML = `<div><span>cell in GaAs</span><b>${d.toFixed(2)} nm</b></div><div><span>cell in air</span><b>${(795 / N).toFixed(1)} nm</b></div><div><span>matches the pixel?</span><b>${N === 20 ? "yes, 11.38 nm" : "no"}</b></div>`;
  };
  $("ns").oninput = u; u();
}},
{s: "3. Time step", t: "Light may not jump over a cell in one step",
intu: String.raw`The time step follows from the cell size. In one step, light must not travel farther than one cell, or the simulation blows up. In 3D with cubic cells the limit is \(\Delta/(c\sqrt3)\). For the 11.38 nm cell that is about 0.022 fs, roughly 120 steps per optical period at 795 nm. Move the slider to see how the time step and the number of steps for a 1 ps run change with the cell.`,
eq: String.raw`\[ \Delta t \le \frac{1}{c\sqrt{\dfrac{1}{\Delta x^2} + \dfrac{1}{\Delta y^2} + \dfrac{1}{\Delta z^2}}} = \frac{\Delta}{c\sqrt3} \]`,
sym: [[String.raw`\(\Delta t\)`, "time step"], ["Courant limit", "the largest stable time step"]],
how: ["Information moves one cell per step on the grid.", "Light must not move faster than that.", "So the smallest cell sets the time step for the whole run."],
say: "The time step is set by the smallest cell through the Courant limit, about 0.022 fs for an 11.38 nm cell.",
num: String.raw`11.38 nm: \(\Delta t \approx 0.022\) fs. Tidy3D runs at 0.99 of the limit (check the docs before quoting).`,
r(fig, ctl) {
  ctl.innerHTML = sl("dc", "Smallest cell (nm)", 4, 40, 0.01, 11.38) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const d = +$("dc").value; $("dcv").textContent = d.toFixed(2); const dt = d * 1e-9 / (2.998e8 * Math.sqrt(3)) * 1e15;
    const W = 500, sc = W / 40;
    let s = `<text class="ts" x="40" y="44">cell size Δ</text><rect x="150" y="30" width="${d * sc}" height="22" fill="var(--blue)"/>`;
    s += `<text class="ts" x="40" y="94">c Δt (limit)</text><rect x="150" y="80" width="${d / Math.sqrt(3) * sc}" height="22" fill="var(--teal)"/>`;
    s += `<text class="ts" x="40" y="144">one period</text><text class="ts" x="150" y="144">2.65 fs = ${Math.round(2.652 / dt)} time steps</text>`;
    fig.innerHTML = svg(165, s);
    $("ro").innerHTML = `<div><span>time step Δt</span><b>${dt.toFixed(4)} fs</b></div><div><span>steps for 1 ps</span><b>${Math.round(1000 / dt).toLocaleString("en-US")}</b></div>`;
  };
  $("dc").oninput = u; u();
}}
],
summary: String.raw`On the Yee grid E and H are staggered by half a cell, so each curl is a difference of neighbours around a loop. The cell size is \(\lambda_0/(N_\mathrm{spw} n)\): at 20 steps per wavelength it is 11.38 nm in GaAs, the PBS pixel size, and coarser in air. The time step is limited by the smallest cell, \(\Delta t \le \Delta/(c\sqrt3)\), about 0.022 fs.`,
sheet: [
[String.raw`\[ \Delta = \frac{\lambda_0}{N_\mathrm{spw}\, n} \]`, "Cell size"],
[String.raw`\[ \Delta t \le \frac{\Delta}{c\sqrt3} \]`, "Courant limit for cubic cells"]],
consts: String.raw`\(\lambda_0 = 795\) nm, \(n_\mathrm{GaAs} = 3.492\), \(c = 2.998\times10^8\) m/s.`,
sources: ["Yee, IEEE Trans. Antennas Propag. 14, 302 (1966)", "Taflove and Hagness, Computational Electrodynamics, 3rd ed. (2005), Ch. 3 and 4 (Yee grid, stability, numerical dispersion)", "Ch. 2 Sec. 2.6 and Ch. 3 Sec. 3.6 of the thesis"]
});
