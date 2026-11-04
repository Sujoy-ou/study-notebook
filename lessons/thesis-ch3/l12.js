/* Lesson 12: simulation settings, thesis Ch. 3 Sec. 3.6 (grid and dimensions, symmetry, boundaries and sources). */
/* helpers for this lesson only (prefix C3L12_) */
const C3L12_NG = 3.492, C3L12_L0 = 795;
/* grid lines on [a, b]: uniform cells dg inside [g0, g1], growing by at most ms per cell outside, up to da */
const C3L12_lines = (a, b, g0, g1, dg, da, ms) => {
  const n = Math.max(1, Math.round((g1 - g0) / dg)), d = (g1 - g0) / n, L = [];
  for (let i = 0; i <= n; i++) L.push(g0 + i * d);
  let x = g1, s = d; while (x < b) { s = Math.min(s * ms, da); x += s; L.push(Math.min(x, b)); }
  const left = []; x = g0; s = d; while (x > a) { s = Math.min(s * ms, da); x -= s; left.push(Math.max(x, a)); }
  return left.reverse().concat(L);
};
/* Back / Play / Next stepper. draw(S) is called every frame, S.k is the step, S.t the time since the step began. */
const C3L12_steps = (fig, ctl, n, dur, draw, idp) => {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${idp}b">Back</button><button id="${idp}p">Pause</button><button id="${idp}n">Next step</button><span id="${idp}s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`);
  const S = { k: 1, play: true, t: 0 };
  let last = performance.now();
  const ui = () => { $(idp + "s").textContent = `step ${S.k} of ${n}`; $(idp + "b").disabled = S.k === 1; $(idp + "n").disabled = S.k === n; $(idp + "p").textContent = S.play ? "Pause" : "Play"; };
  S.go = k => { S.k = Math.max(1, Math.min(n, k)); S.t = 0; ui(); draw(S); };
  $(idp + "b").onclick = () => { S.play = false; S.go(S.k - 1); };
  $(idp + "n").onclick = () => { S.play = false; S.go(S.k + 1); };
  $(idp + "p").onclick = () => { S.play = !S.play; if (S.play && S.k === n) S.go(1); ui(); };
  ui();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; S.t += dt;
    if (S.play && S.t > dur) { if (S.k < n) { S.k++; S.t = 0; } else S.play = false; ui(); }
    draw(S);
  });
  return S;
};
const C3L12_fmt = v => v >= 1e9 ? (v / 1e9).toFixed(1) + " G" : v >= 1e6 ? (v / 1e6).toFixed(1) + " M" : v >= 1e3 ? (v / 1e3).toFixed(0) + " k" : v.toFixed(0);
const C3L12_hatch = `<defs><pattern id="C3L12h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#7F77DD" fill-opacity="0.12"/><line x1="0" y1="0" x2="0" y2="7" stroke="#7F77DD" stroke-width="1.6" stroke-opacity="0.5"/></pattern></defs>`;

addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l12", title: "Simulation settings: grid, symmetry, sources and boundaries", short: "12. Simulation settings",
big: String.raw`Every forward and adjoint run of the optimization is an FDTD simulation, and four settings decide what it computes and what it costs. The grid: Tidy3D builds a non-uniform grid from a set number of steps per wavelength in each material, and the thesis quotes that number for GaAs. At 20 steps the GaAs cell is \(\lambda_0/(20\,n_{\mathrm{GaAs}}) = 11.38\) nm, the same size as the PBS pixels. The dimension: the gratings are designed in 2D, in the plane that holds the waveguide axis and the fiber, at 30 steps per wavelength, while the tapers and the PBS are optimized in 3D at 20. Symmetry: a mirror plane set to +1 keeps even fields and acts as a perfect magnetic conductor, −1 keeps odd fields and acts as a perfect electric conductor, and each plane halves the domain. Boundaries and sources: perfectly matched layers absorb what leaves the box, the waveguides run through them, a mode source launches TE0 or TM0 into the tapers and the PBS, and a tilted Gaussian beam stands in for the fiber above a grating.`,
bridge: "This is Ch. 3 Sec. 3.6, the paragraphs on grid and dimensions, symmetry, and boundaries and sources. The FDTD background behind them is Ch. 2 Sec. 2.6, taught in Chapter 2, Lessons 8 and 9, and the even and odd mode families come from Chapter 2, Lesson 2. The optimizer paragraph of the same section is Lesson 13. The settings are those of the Tidy3D solver (Flexcompute). Pictures are schematic unless a scale is given.",
cards: [
/* NEW CARD: grid */
{s: "1. Steps per wavelength", t: "The grid: steps per wavelength in each material",
intu: String.raw`Tidy3D does not ask for a cell size. It asks for a number of steps per wavelength, \(N_\lambda\), and in each material it makes the cells small enough that one local wavelength \(\lambda_0/n\) holds \(N_\lambda\) of them. GaAs has the highest index, so it gets the finest cells, and the air around it gets cells about 3.5 times larger. Between the two the cell size grows gradually. That is why the thesis quotes the resolution for GaAs. The top panel cuts one wavelength in GaAs into \(N_\lambda\) steps. The bottom panel is the grid over the cross-section of a 200 nm wide strip in the 160 nm membrane. Move the slider and read the GaAs cell. At \(N_\lambda = 20\) it is 11.38 nm, the size the thesis chose for the PBS pixels, so that design pixels and solver cells have the same scale.`,
eq: String.raw`\[ \Delta_{\mathrm{GaAs}} = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \qquad \Delta_{\mathrm{air}} = \frac{\lambda_0}{N_\lambda} \]\[ N_\lambda = 20: \quad \Delta_{\mathrm{GaAs}} = \frac{795\ \mathrm{nm}}{20 \times 3.492} = 11.38\ \mathrm{nm} = \text{PBS pixel} \]<div class="eqref">Ch. 3 Sec. 3.6, grid and dimensions</div>`,
sym: [[String.raw`\(N_\lambda\)`, "steps per wavelength, set in Tidy3D and quoted for GaAs"], [String.raw`\(\lambda_0\)`, "free-space wavelength, 795 nm"], [String.raw`\(n_{\mathrm{GaAs}}\)`, "refractive index of GaAs, 3.492"], [String.raw`\(\Delta\)`, "local cell size"], ["grading", "the cell size grows step by step from the fine to the coarse region"]],
how: [String.raw`In a material of index \(n\) the wavelength is \(\lambda_0/n\).`, String.raw`Ask for \(N_\lambda\) cells per local wavelength: \(\Delta = \lambda_0/(N_\lambda n)\).`, "GaAs has the largest index, so its cells are the smallest and set the accuracy where the field is strongest.", "Outside the GaAs the cells grow gradually, here by at most 1.4 times per cell, until they reach the air size.", String.raw`At \(N_\lambda = 20\): \(795/(20 \times 3.492) = 11.38\) nm. The PBS pixels were given exactly this size, so one design pixel is about one solver cell.`],
say: String.raw`Tidy3D builds a non-uniform grid from a number of steps per wavelength in each material. The thesis quotes it for GaAs. At 20 steps the GaAs cell is \(\lambda_0/(20\,n_{\mathrm{GaAs}}) = 11.38\) nm, which is also the PBS pixel size, so design pixels and solver cells have the same scale.`,
num: String.raw`\(N_\lambda = 20\): GaAs cell <b>11.38 nm</b>, air cell up to <b>39.8 nm</b>, about 14 cells across the 160 nm membrane.<br>\(N_\lambda = 30\): GaAs cell <b>7.59 nm</b>, about 21 cells across the membrane.`,
note: "If asked why the pixel equals the cell: a pixel much smaller than a cell would hold detail the solver cannot see, and a pixel much larger would waste resolution. Matching them keeps every pixel resolved without wasting cells.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength N<sub>λ</sub> (in GaAs)", 10, 40, 1, 20) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N;
    const dg = C3L12_L0 / (N * C3L12_NG), da = C3L12_L0 / N, lg = C3L12_L0 / C3L12_NG;
    let s = `<text class="ts" x="20" y="18">one wavelength in GaAs, λ₀/n = ${lg.toFixed(0)} nm, cut into N<tspan baseline-shift="sub" font-size="9">λ</tspan> = ${N} steps</text>`;
    const wx = 70, ww = 540, wy = 52, wa = 20;
    let d = ""; for (let i = 0; i <= 200; i++) { const f = i / 200; d += (i ? "L" : "M") + (wx + f * ww).toFixed(1) + " " + (wy - wa * Math.sin(2 * Math.PI * f)).toFixed(1); }
    s += `<line x1="${wx}" x2="${wx + ww}" y1="${wy}" y2="${wy}" stroke="var(--b)"/><path d="${d}" fill="none" stroke="#378ADD" stroke-width="2"/>`;
    for (let i = 0; i <= N; i++) { const f = i / N, x = wx + f * ww, y = wy - wa * Math.sin(2 * Math.PI * f); s += `<line x1="${x}" x2="${x}" y1="${wy + 24}" y2="${wy + 30}" stroke="var(--p)"/><circle cx="${x}" cy="${y}" r="3" fill="#D85A30"/>`; }
    s += `<text class="ts" x="${wx + ww / N / 2}" y="${wy + 42}" text-anchor="middle">Δ</text>`;
    // cross-section grid
    const sc = 0.55, cx = 340, cy = 245, Y = v => cx + v * sc, Z = v => cy - v * sc, y0 = -560, y1 = 560, z0 = -200, z1 = 200;
    const ly = C3L12_lines(y0, y1, -100, 100, dg, da, 1.4), lz = C3L12_lines(z0, z1, -80, 80, dg, da, 1.4);
    s += `<rect x="${Y(y0)}" y="${Z(z1)}" width="${(y1 - y0) * sc}" height="${(z1 - z0) * sc}" fill="none" stroke="var(--b)"/>`;
    s += `<rect x="${Y(-100)}" y="${Z(80)}" width="${200 * sc}" height="${160 * sc}" fill="#378ADD" fill-opacity="0.18" stroke="#378ADD" stroke-width="1.5"/>`;
    ly.forEach(v => s += `<line x1="${Y(v).toFixed(2)}" x2="${Y(v).toFixed(2)}" y1="${Z(z1)}" y2="${Z(z0)}" stroke="var(--p)" stroke-width="0.6" opacity="0.7"/>`);
    lz.forEach(v => s += `<line x1="${Y(y0)}" x2="${Y(y1)}" y1="${Z(v).toFixed(2)}" y2="${Z(v).toFixed(2)}" stroke="var(--p)" stroke-width="0.6" opacity="0.7"/>`);
    s += `<text class="ts" x="${Y(0)}" y="${Z(z0) + 16}" text-anchor="middle">cross-section of a 200 nm × 160 nm GaAs strip in air (to scale)</text>`;
    s += `<rect x="${Y(-100) - 128}" y="${Z(80) - 22}" width="122" height="20" rx="4" fill="var(--sunk)"/><text class="th" x="${Y(-100) - 12}" y="${Z(80) - 7}" text-anchor="end" style="font-size:12px">GaAs: Δ = ${dg.toFixed(2)} nm</text><rect x="${Y(y1) - 132}" y="${Z(z1) + 3}" width="128" height="18" rx="4" fill="var(--sunk)"/><text class="ts" x="${Y(y1) - 8}" y="${Z(z1) + 16}" text-anchor="end">air: Δ up to ${da.toFixed(1)} nm</text>`;
    const match = Math.abs(dg - 11.38) < 0.01;
    s += `<rect x="${Y(100) + 6}" y="${Z(-80) + 4}" width="172" height="20" rx="4" fill="var(--sunk)"/><text class="th" x="${Y(100) + 12}" y="${Z(-80) + 18}" style="font-size:12px;fill:${match ? "#1D9E75" : "var(--muted)"}">${match ? "cell = PBS pixel, 11.38 nm" : `PBS pixel 11.38 nm = ${(11.38 / dg).toFixed(2)} cells`}</text>`;
    fig.innerHTML = svg(384, s);
    $("ro").innerHTML = `<div><span>GaAs cell λ₀/(N<sub>λ</sub> n)</span><b>${dg.toFixed(2)} nm</b></div><div><span>air cell λ₀/N<sub>λ</sub></span><b>${da.toFixed(1)} nm</b></div><div><span>cells across 160 nm</span><b>${(160 / dg).toFixed(1)}</b></div><div><span>PBS pixel / cell</span><b>${(11.38 / dg).toFixed(2)}</b></div>`;
  };
  $("N").oninput = u; u();
}},

/* NEW CARD: 2D and 3D */
{s: "2. 2D and 3D", t: "Gratings in 2D, tapers and the PBS in 3D",
intu: String.raw`A grating coupler is wide and its teeth run straight across it, so along \(y\) almost nothing changes, and the fiber beam arrives in the plane that holds the waveguide axis. The physics of the grating, phase matching along \(x\) and the light radiated up and down, lives in that \(x\)-\(z\) plane. So the gratings are designed in 2D, on that cross-section, at 30 steps per wavelength. A 2D model treats the teeth as infinitely long and cannot hold a taper, which narrows along \(y\). The tapers and the PBS, whose shapes change along \(y\), are optimized in 3D at 20 steps per wavelength. The finished designs are then evaluated: the 2D grating designs and the PBS and MMI results at 30 steps, and the 3D gratings, now with their taper, at 20. Press Play and watch the 3D grating collapse onto its cross-section, then compare the cell counts.`,
eq: String.raw`\[ \text{cells}_{\mathrm{2D}} \approx \frac{L_x}{\Delta}\,\frac{L_z}{\Delta} \qquad \text{cells}_{\mathrm{3D}} \approx \frac{L_x}{\Delta}\,\frac{L_y}{\Delta}\,\frac{L_z}{\Delta} \qquad \Delta = \frac{\lambda_0}{N_\lambda\, n_{\mathrm{GaAs}}} \]<div class="eqnote">upper bound, with the GaAs cell everywhere. The non-uniform grid needs fewer.</div><div class="eqref">Ch. 3 Sec. 3.6, grid and dimensions</div>`,
sym: [[String.raw`\(L_x, L_y, L_z\)`, "size of the simulation box"], [String.raw`\(x\)-\(z\) plane`, "the plane that contains the waveguide axis and the fiber"], ["30 steps", "2D grating design, and evaluation of the 2D gratings, the PBS and the MMI"], ["20 steps", "3D optimization of the tapers and the PBS, and evaluation of the 3D gratings with their taper"]],
how: ["The grating teeth are straight and the grating is wide, so the field changes slowly along y.", String.raw`The fiber beam and the guided mode both lie in the \(x\)-\(z\) plane, so phase matching (Ch. 2 Eq. 2.2) is a 2D problem.`, "A 2D run has one dimension fewer, so it is far cheaper and allows a finer grid, 30 steps per wavelength.", "The taper and the PBS change along y, so they need 3D, at 20 steps per wavelength.", "The 2D grating is finally checked in 3D with its taper, where the finite width matters."],
say: "The gratings are designed in 2D, in the plane that contains the waveguide axis and the fiber, at 30 steps per wavelength. The tapers and the PBS change along y and are optimized in 3D at 20 steps. The 2D gratings, the PBS and the MMI are evaluated at 30 steps, the 3D gratings with their taper at 20.",
num: String.raw`Toy box 10 × 5 × 3 µm³, GaAs cell everywhere: 2D at 30 steps about <b>0.5 million</b> cells, 3D at 20 steps about <b>100 million</b>. Each 3D run also needs more time steps per unit time when the cells shrink, so the gap in cost is larger still.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n2", "2D steps per wavelength", 10, 40, 1, 30) + sl("n3", "3D steps per wavelength", 10, 40, 1, 20) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="g2s"></div><p class="note" id="g2c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const Lx = 10, Ly = 5, Lz = 3;
  const cost = () => {
    const n2 = +$("n2").value, n3 = +$("n3").value; $("n2v").textContent = n2; $("n3v").textContent = n3;
    const d2 = C3L12_L0 / (n2 * C3L12_NG) / 1000, d3 = C3L12_L0 / (n3 * C3L12_NG) / 1000, c2 = (Lx / d2) * (Lz / d2), c3 = (Lx / d3) * (Ly / d3) * (Lz / d3);
    $("ro").innerHTML = `<div><span>2D cells, ${n2} steps</span><b>${C3L12_fmt(c2)}</b></div><div><span>3D cells, ${n3} steps</span><b>${C3L12_fmt(c3)}</b></div><div><span>3D / 2D</span><b>${(c3 / c2).toFixed(0)}×</b></div>`;
    return { c2, c3, n2, n3 };
  };
  const CAP = ["", "Step 1. The 3D grating: GaAs teeth etched through the membrane, each running straight across y, fed by a taper. The fiber beam comes down in the plane of the waveguide axis (purple).",
    "Step 2. Nothing changes along the teeth, so collapse the y direction. The 3D grating folds onto its x-z cross-section.",
    "Step 3. The 2D model: a row of teeth and gaps in the x-z plane, infinitely long along y. The taper cannot appear here, it needs y.",
    "Step 4. Count the cells. Removing one dimension divides the count by about L_y/Δ, which pays for the finer 2D grid.",
    "Step 5. What was done where in the thesis: the design runs on the left, the evaluation runs on the right."];
  const draw = S => {
    const k = S.k, cc = cost();
    const c = k === 1 ? 1 : k === 2 ? Math.max(0, 1 - S.t / 2) : 0;
    const ox = 60, oy = 200, sx = 36, sz = 75, dep = 130 * c, ex = dep * 0.87, ey = dep * 0.5;
    const P = (x, y, z) => [ox + x * sx + y * ex, oy - z * sz - y * ey]; // y in 0..1 (fraction of width)
    const poly = (pts, f, st, op) => `<path d="M${pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L")}Z" fill="${f}" fill-opacity="${op || 1}" stroke="${st}" stroke-width="0.8"/>`;
    const t = 0.16 * 1.2, teeth = []; for (let i = 0; i < 11; i++) teeth.push([0.3 + i * 0.6, 0.3 + i * 0.6 + 0.3]);
    let s = `<text class="ts" x="20" y="18">${c > 0.02 ? "3D view (schematic, thickness exaggerated)" : "2D model: the x-z cross-section"}</text>`;
    // purple plane through the axis
    if (k <= 2 && c > 0.02) s += poly([P(-0.2, 0.5, -0.6), P(13.2, 0.5, -0.6), P(13.2, 0.5, 1.5), P(-0.2, 0.5, 1.5)], "#7F77DD", "#7F77DD", 0.1);
    // taper and waveguide (top faces), drawn first
    const tp = [P(6.9, 0, t), P(10.4, 0.48, t), P(13, 0.48, t), P(13, 0.52, t), P(10.4, 0.52, t), P(6.9, 1, t)];
    if (c > 0.02) s += poly(tp, "#378ADD", "#0C447C", 0.45);
    s += `<rect x="${P(6.9, 0, 0)[0]}" y="${P(0, 0, t)[1]}" width="${(13 - 6.9) * sx}" height="${t * sz}" fill="#378ADD" fill-opacity="0.75"/>`;
    for (let i = teeth.length - 1; i >= 0; i--) {
      const [a, b] = teeth[i];
      if (c > 0.02) { s += poly([P(a, 0, t), P(b, 0, t), P(b, 1, t), P(a, 1, t)], "#378ADD", "#0C447C", 0.45); s += poly([P(a, 0, 0), P(a, 1, 0), P(a, 1, t), P(a, 0, t)], "#378ADD", "#0C447C", 0.3); }
      s += poly([P(a, 0, 0), P(b, 0, 0), P(b, 0, t), P(a, 0, t)], "#378ADD", "#0C447C", 0.9);
    }
    // fiber beam
    const th = 5 * Math.PI / 180, bx = 3.4, w0 = 0.77, top = 1.6, b1 = P(bx - w0 + top * Math.tan(th) * -1, 0.5, top), b2 = P(bx + w0 - top * Math.tan(th), 0.5, top), b3 = P(bx + w0, 0.5, t + 0.05), b4 = P(bx - w0, 0.5, t + 0.05);
    s += poly([b1, b2, b3, b4], "#EF9F27", "#BA7517", 0.35);
    s += `<text class="ts" x="${b2[0] + 8}" y="${b2[1] + 10}">fiber beam</text>`;
    if (c > 0.02) s += `<text class="ts" x="${P(10.5, 0.5, t)[0]}" y="${P(10.5, 0.9, t)[1] - 10}" text-anchor="middle">taper</text>`;
    s += `<text class="ts" x="${P(3.2, 0, 0)[0]}" y="${oy + 22}" text-anchor="middle">grating: teeth and gaps</text><text class="ts" x="${P(11, 0, 0)[0]}" y="${oy + 22}" text-anchor="middle">${c > 0.02 ? "waveguide" : "slab (no taper in 2D)"}</text>`;
    s += `<line x1="${ox - 20}" x2="${ox - 20 + 36}" y1="${oy + 40}" y2="${oy + 40}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ox + 22}" y="${oy + 44}">x</text><line x1="${ox - 20}" x2="${ox - 20}" y1="${oy + 40}" y2="${oy + 4}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ox - 24}" y="${oy}" text-anchor="end">z</text>`;
    if (c > 0.02) s += `<line x1="${ox - 20}" x2="${ox - 20 + 30 * c}" y1="${oy + 40}" y2="${oy + 40 - 17 * c}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ox - 14 + 30 * c}" y="${oy + 36 - 17 * c}">y</text>`;
    // bottom panel
    if (k >= 4) {
      const L = v => Math.log10(v), X0 = 90, XW = 230, xb = v => X0 + (L(v) - 4) / 5 * XW;
      s += `<text class="th" x="20" y="262" style="font-size:12px">cells (log scale, toy box ${Lx} × ${Ly} × ${Lz} µm)</text>`;
      [[`2D, ${cc.n2}`, cc.c2, "#378ADD", 280], [`3D, ${cc.n3}`, cc.c3, "#D85A30", 310]].forEach(([lab, v, col, y]) => s += `<text class="ts" x="${X0 - 6}" y="${y + 4}" text-anchor="end">${lab}</text><rect x="${X0}" y="${y - 9}" width="${Math.max(2, xb(v) - X0)}" height="18" fill="${col}" opacity="0.8"/><text class="ts" x="${xb(v) + 6}" y="${y + 4}">${C3L12_fmt(v)}</text>`);
      [4, 6, 8].forEach(e => s += `<text class="ts" x="${xb(Math.pow(10, e))}" y="342" text-anchor="middle">10${e === 4 ? "⁴" : e === 6 ? "⁶" : "⁸"}</text>`);
    }
    if (k >= 5) {
      const tx = 380; s += `<rect x="${tx - 10}" y="248" width="300" height="104" rx="8" fill="var(--sunk)"/>`;
      s += `<text class="th" x="${tx}" y="268" style="font-size:12px">designed</text><text class="th" x="${tx + 150}" y="268" style="font-size:12px">evaluated</text>`;
      s += `<text class="ts" x="${tx}" y="290">gratings: 2D, 30 steps</text><text class="ts" x="${tx}" y="310">tapers: 3D, 20 steps</text><text class="ts" x="${tx}" y="330">PBS: 3D, 20 steps</text>`;
      s += `<text class="ts" x="${tx + 150}" y="290">2D gratings: 30 steps</text><text class="ts" x="${tx + 150}" y="310">PBS and MMI: 30 steps</text><text class="ts" x="${tx + 150}" y="330">3D grating + taper: 20</text>`;
    }
    $("g2s").innerHTML = svg(356, s);
    $("g2c").textContent = CAP[k];
  };
  C3L12_steps(fig, ctl, 5, 4, draw, "g2");
  $("n2").oninput = () => cost(); $("n3").oninput = () => cost();
}},

/* from old ch2 L2 (symmetry) card 3, edited for Ch. 3 Sec. 3.6 */
{s: "3. PEC and PMC", t: "A mirror plane as a wall: +1 is PMC, −1 is PEC",
intu: String.raw`Where the structure has a mirror plane, the fields of the device are either even or odd under the reflection, and the simulation can keep only one half. In Tidy3D a mirror plane set to +1 keeps fields that are even and acts as a perfect magnetic conductor (PMC), which forces the tangential \(\mathbf{H}\) to zero. A plane set to −1 keeps odd fields and acts as a perfect electric conductor (PEC), which forces the tangential \(\mathbf{E}\) to zero. So a PEC plane keeps a mode whose electric field is normal to the plane, and a PMC plane a mode whose electric field lies in it. At the mid-plane \(z = 0\) of the membrane, TE0 has its main field \(E_y\) lying in the plane and TM0 has \(E_z\) normal to it. Choose a mode and a wall and see whether they are compatible.`,
eq: String.raw`\[ \begin{aligned} +1,\ \text{PMC:}\quad \hat{\mathbf{n}} \times \mathbf{H} &= 0 \quad (\mathbf{E} \text{ lies in the plane}) \\ -1,\ \text{PEC:}\quad \hat{\mathbf{n}} \times \mathbf{E} &= 0 \quad (\mathbf{E} \text{ normal to the plane}) \end{aligned} \]\[ z = 0:\quad \text{TE}_0\ (E_y) \longleftrightarrow \text{PMC} \qquad \text{TM}_0\ (E_z) \longleftrightarrow \text{PEC} \]<div class="eqref">Ch. 3 Sec. 3.6, symmetry</div>`,
sym: [[String.raw`\(\hat{\mathbf{n}}\)`, "unit normal of the mirror plane"], ["PEC", "perfect electric conductor, tangential E = 0, Tidy3D value −1"], ["PMC", "perfect magnetic conductor, tangential H = 0, Tidy3D value +1"], ["even, odd", "the field equals plus or minus its own mirror image"]],
how: [String.raw`Under the mirror the tangential part of \(\mathbf{E}\) keeps its sign and the normal part flips. \(\mathbf{H}\) is an axial vector, so for it the opposite holds (Chapter 2, Lesson 2).`, String.raw`Even field: on the plane the normal \(\mathbf{E}\) and the tangential \(\mathbf{H}\) must equal minus themselves, so both vanish. That is a PMC, value +1, and \(\mathbf{E}\) lies in the plane.`, String.raw`Odd field: the tangential \(\mathbf{E}\) must equal minus itself, so it vanishes. That is a PEC, value −1, and \(\mathbf{E}\) is normal to the plane.`, "A wall that matches the field's own symmetry changes nothing for it. A wall of the other type removes that mode, and only the other family survives."],
say: "In Tidy3D a mirror plane set to +1 keeps even fields and acts as a PMC, and −1 keeps odd fields and acts as a PEC. A PEC plane keeps a mode whose electric field is normal to the plane, a PMC plane a mode whose electric field lies in it.",
num: String.raw`At \(z = 0\): TE0, with \(E_y\) in the plane, needs a PMC, <b>+1</b>. TM0, with \(E_z\) normal to the plane, needs a PEC, <b>−1</b>.`,
r(fig, ctl) {
  let md = "TE", wl = "PMC";
  ctl.innerHTML = `<div class="row"><label>Mode</label><button data-m="TE">TE0 (even in z)</button><button data-m="TM">TM0 (odd in z)</button></div><div class="row"><label>Wall at z = 0</label><button data-w="PMC">PMC, +1</button><button data-w="PEC">PEC, −1</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "m", md); pick(ctl, "w", wl);
    const ok = (md === "TE" && wl === "PMC") || (md === "TM" && wl === "PEC");
    let a = ""; [-15, 30, 75].forEach(z => [140, 240, 340, 440, 540].forEach(y => { const yy = 150 - z; const amp = Math.cos(z / 80 * 0.9); if (md === "TE") a += `<line x1="${y - 14 * amp}" y1="${yy}" x2="${y + 14 * amp}" y2="${yy}" stroke="#378ADD" stroke-width="2" marker-end="url(#ar)"/>`; else a += `<line x1="${y}" y1="${yy + 11}" x2="${y}" y2="${yy - 11}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>`; }));
    fig.innerHTML = svg(260, `<rect x="100" y="70" width="480" height="80" fill="var(--blue-bg)"/><rect x="90" y="150" width="500" height="8" fill="${wl === "PEC" ? "#888780" : "#7F77DD"}"/><text class="ts" x="596" y="158">${wl} wall</text><text class="ts" x="100" y="62">upper half of the membrane, arrows: E</text>${a}<text class="ts" x="340" y="182" text-anchor="middle">only this half is simulated. The other half is implied by the symmetry.</text><text class="th" x="340" y="222" text-anchor="middle">${ok ? "compatible: this mode is kept" : "incompatible: this mode is removed"}</text>`);
    $("ro").innerHTML = `<div><span>E on the plane</span><b>${md === "TE" ? "lies in it (E_y)" : "normal to it (E_z)"}</b></div><div><span>${wl} requires</span><b>${wl === "PEC" ? "tangential E = 0" : "tangential H = 0"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  ctl.querySelectorAll("button[data-w]").forEach(b => b.onclick = () => { wl = b.dataset.w; u(); }); u();
}},

/* from old ch2 L2 (symmetry) card 4, edited for Ch. 3 Sec. 3.6 */
{s: "4. Symmetry in Tidy3D", t: "Which value keeps which mode, and when a plane is allowed",
intu: String.raw`The membrane waveguide has two candidate mirror planes: the mid-plane \(z = 0\) and the axis plane \(y = 0\), with \(x\) along the waveguide. The rule of card 3 gives the value for each: if the main electric field of the mode lies in the plane, use a PMC, +1. If it is normal to the plane, use a PEC, −1. TE0 has its main field \(E_y\), which lies in \(z = 0\) but is normal to \(y = 0\). TM0 has \(E_z\), normal to \(z = 0\) and lying in \(y = 0\). A plane may only be used if the structure is mirror symmetric about it. The plane \(z = 0\) is used only where there is air above and below the membrane, because the DBR under the gratings breaks this symmetry. The plane \(y = 0\) can be used for the grating couplers and the tapers, which are mirror symmetric about their axis. Pick a plane, a mode and what lies under the membrane.`,
eq: String.raw`<div class="eqnote">Tidy3D:</div>\[ \texttt{symmetry} = (s_{x}, s_{y}, s_{z}), \qquad +1 = \text{even} = \text{PMC}, \quad -1 = \text{odd} = \text{PEC}, \quad 0 = \text{none} \]\[ z = 0:\ \text{TE}_0 \to +1,\ \text{TM}_0 \to -1 \qquad y = 0:\ \text{TE}_0 \to -1,\ \text{TM}_0 \to +1 \]<div class="eqnote">\(z = 0\) only with air above and below. \(y = 0\) for the grating couplers and the tapers.</div><div class="eqref">Ch. 3 Sec. 3.6, symmetry</div>`,
sym: [[String.raw`\(s_{y}, s_{z}\)`, String.raw`symmetry value for the plane through the simulation center normal to \(y\) or \(z\)`], ["TE0", String.raw`main field \(E_y\)`], ["TM0", String.raw`main field \(E_z\)`], ["DBR", "the mirror under the gratings, present only below the membrane"]],
how: [String.raw`Plane \(z = 0\), TE0: \(E_y\) lies in the plane, so PMC, +1.`, String.raw`Plane \(z = 0\), TM0: \(E_z\) is normal to the plane, so PEC, −1.`, String.raw`Plane \(y = 0\), TE0: \(E_y\) is normal to the plane, so PEC, −1.`, String.raw`Plane \(y = 0\), TM0: \(E_z\) lies in the plane, so PMC, +1.`, String.raw`With a DBR below, what lies under \(z = 0\) differs from what lies above, the fields are neither even nor odd in \(z\), and \(s_z\) must be 0. The DBR is the same on both sides of \(y = 0\), so that plane stays valid.`],
say: "TE0 needs +1 at the mid-plane and −1 at the axis plane, and TM0 the opposite. The mid-plane is used only with air above and below, because the DBR under the gratings breaks that symmetry. The axis plane can be used for the grating couplers and the tapers.",
num: String.raw`A common surprise: the same TE0 needs <b>+1</b> at \(z = 0\) but <b>−1</b> at \(y = 0\), because \(E_y\) lies in the first plane and is normal to the second.`,
r(fig, ctl) {
  let pl = "z", md = "TE", sub = "air";
  ctl.innerHTML = `<div class="row"><label>Plane</label><button data-p="z">z = 0 (mid-plane)</button><button data-p="y">y = 0 (axis plane)</button></div><div class="row"><label>Mode</label><button data-m="TE">TE0</button><button data-m="TM">TM0</button></div><div class="row"><label>Below</label><button data-u="air">air</button><button data-u="dbr">DBR (gratings)</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", pl); pick(ctl, "m", md); pick(ctl, "u", sub);
    const broken = pl === "z" && sub === "dbr", val = broken ? 0 : (pl === "z") === (md === "TE") ? 1 : -1;
    const cx = 340, cy = 110, w = 200, h = 64;
    let arr = ""; for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) { const x = cx + i * 40, y = cy + j * 20; if (md === "TE") arr += `<line x1="${x - 13}" y1="${y}" x2="${x + 13}" y2="${y}" stroke="#378ADD" stroke-width="2" marker-end="url(#ar)"/>`; else arr += `<line x1="${x}" y1="${y + 9}" x2="${x}" y2="${y - 9}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>`; }
    let dbr = ""; if (sub === "dbr") for (let k = 0; k < 8; k++) dbr += `<rect x="150" y="${cy + 62 + k * 9}" width="380" height="5" fill="#BA7517" opacity="0.55"/><rect x="150" y="${cy + 67 + k * 9}" width="380" height="4" fill="#EF9F27" opacity="0.25"/>`;
    const plane = pl === "z" ? `<line x1="${cx - 200}" x2="${cx + 200}" y1="${cy}" y2="${cy}" stroke="${broken ? "#E24B4A" : "#7F77DD"}" stroke-width="4" opacity="0.7" ${broken ? 'stroke-dasharray="8 6"' : ""}/>` : `<line x1="${cx}" x2="${cx}" y1="${cy - 70}" y2="${cy + (sub === "dbr" ? 140 : 80)}" stroke="#7F77DD" stroke-width="4" opacity="0.7"/>`;
    const tang = md === "TE" ? (pl === "z" ? "E_y lies in the plane" : "E_y is normal to the plane") : (pl === "z" ? "E_z is normal to the plane" : "E_z lies in the plane");
    fig.innerHTML = svg(270, `${dbr}<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="var(--blue-bg)" stroke="var(--p)"/>${arr}${plane}<text class="th" x="${cx}" y="26" text-anchor="middle" ${broken ? 'style="fill:#E24B4A"' : ""}>${broken ? "no mirror symmetry in z: s_z = 0" : `symmetry value ${val > 0 ? "+1 (PMC)" : "−1 (PEC)"}`}</text><text class="ts" x="${cx}" y="262" text-anchor="middle">strip cross-section (y across, z up). Purple: candidate mirror plane${sub === "dbr" ? ". Amber: DBR" : ""}</text>`);
    $("ro").innerHTML = `<div><span>main field</span><b>${tang}</b></div><div><span>plane allowed?</span><b>${broken ? "no, the DBR breaks it" : "yes"}</b></div><div><span>Tidy3D value</span><b>${broken ? "0" : val > 0 ? "+1" : "−1"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pl = b.dataset.p; u(); });
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  ctl.querySelectorAll("button[data-u]").forEach(b => b.onclick = () => { sub = b.dataset.u; u(); }); u();
}},

/* from old ch2 L2 (symmetry) card 5, edited for Ch. 3 Sec. 3.6 */
{s: "5. Half the work", t: "Each plane halves the domain, if the value is right",
intu: String.raw`Each symmetry plane halves the number of grid cells, and with it the memory and the run time. A membrane device has at most two such planes, \(z = 0\) and \(y = 0\). Along \(x\), the direction of propagation, the source itself breaks the mirror. The price is that the whole problem must be symmetric: the structure, the source and the boundaries. The monitors may sit anywhere, since the solver rebuilds the other half by mirroring. And the value must match the mode that is launched. With the wrong value the launched mode belongs to the removed family, the source excites almost nothing, and the transmission comes out near zero. The thesis checks that each symmetry plane reproduces the full-domain result and gives those checks with the devices in Chapters 4 and 5. Choose the number of planes and toggle a wrong value.`,
eq: String.raw`\[ \text{cells with } s \text{ symmetry planes: } \frac{N_{\mathrm{cells}}}{2^{s}}, \qquad s = 0, 1, 2 \]<div class="eqnote">requirement: \(\varepsilon(\mathbf{r})\) and the source are symmetric under every chosen mirror</div>`,
sym: [[String.raw`\(s\)`, "number of symmetry planes used"], [String.raw`\(N_{\mathrm{cells}}\)`, "grid cells of the full domain"], ["wrong value", "the value of the other family, which removes the launched mode"]],
how: ["The fields in the missing half follow from the mirror rule, so they need not be stored or updated.", "The symmetry plane acts as a PEC or PMC wall for the fields in the kept half (card 3).", "If the structure or the source is not symmetric, the true field is neither even nor odd, and forcing a symmetry gives a wrong answer.", "So the symmetric run is compared once with the full domain. The thesis gives these comparisons with the devices in Chapters 4 and 5."],
say: "Each symmetry plane halves the simulated volume. It is valid only when the structure and the source share the symmetry, and the value must keep the mode family that is launched. A comparison with the full domain confirms the setting.",
num: "1 plane: <b>50 %</b> of the cells. 2 planes: <b>25 %</b>.<br>A wrong value gives a transmission near <b>zero</b>, because the launched mode belongs to the removed family.",
r(fig, ctl) {
  let s = 1, wrong = false;
  ctl.innerHTML = `<div class="row"><label>Symmetry planes</label><button data-s="0">none</button><button data-s="1">y = 0</button><button data-s="2">y = 0 and z = 0</button></div><div class="row"><button id="wr">Use the wrong value</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "s", s); $("wr").textContent = wrong ? "Use the right value" : "Use the wrong value"; $("wr").disabled = s === 0;
    const ox = 170, oy = 70, a = 220, b = 110, d = 70;
    const box = (x0, y0, ww, hh, dd, op) => `<path d="M${x0} ${y0} L${x0 + ww} ${y0} L${x0 + ww} ${y0 + hh} L${x0} ${y0 + hh} Z" fill="#378ADD" fill-opacity="${op}" stroke="var(--p)"/><path d="M${x0} ${y0} L${x0 + dd * 0.87} ${y0 - dd * 0.5} L${x0 + ww + dd * 0.87} ${y0 - dd * 0.5} L${x0 + ww} ${y0} Z" fill="#378ADD" fill-opacity="${op * 0.7}" stroke="var(--p)"/><path d="M${x0 + ww} ${y0} L${x0 + ww + dd * 0.87} ${y0 - dd * 0.5} L${x0 + ww + dd * 0.87} ${y0 + hh - dd * 0.5} L${x0 + ww} ${y0 + hh} Z" fill="#378ADD" fill-opacity="${op * 0.5}" stroke="var(--p)"/>`;
    const fy = s >= 1 ? 0.5 : 1, fz = s >= 2 ? 0.5 : 1, T = s > 0 && wrong ? 0.002 : 0.9;
    const yy = oy + d * 0.5, dk = d * fy, x0 = ox + (d - dk) * 0.87, y0 = yy - (d - dk) * 0.5;
    let g = box(ox, yy, a, b, d, 0.07) + box(x0, y0, a, b * fz, dk, 0.55);
    const ax = ox - 80, ay = yy + b + 6;
    g += `<line x1="${ax}" x2="${ax + 40}" y1="${ay}" y2="${ay}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ax + 46}" y="${ay + 4}">x</text><line x1="${ax}" x2="${ax + 26}" y1="${ay}" y2="${ay - 15}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ax + 30}" y="${ay - 18}">y</text><line x1="${ax}" x2="${ax}" y1="${ay}" y2="${ay - 32}" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="${ax - 6}" y="${ay - 30}" text-anchor="end">z</text>`;
    fig.innerHTML = svg(270, `${g}<text class="ts" x="${ox + a / 2 + 30}" y="258" text-anchor="middle">dark: simulated part. Light: rebuilt by mirroring</text><text class="th" x="590" y="80" text-anchor="middle">transmission</text><rect x="565" y="${230 - T * 130}" width="50" height="${Math.max(1, T * 130)}" fill="${wrong && s ? "#D85A30" : "#1D9E75"}"/><line x1="550" x2="630" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="590" y="250" text-anchor="middle">${wrong && s ? "≈ 0: wrong family" : "correct"}</text>`);
    $("ro").innerHTML = `<div><span>cells simulated</span><b>${(100 / Math.pow(2, s)).toFixed(0)} %</b></div><div><span>speed-up</span><b>about ${Math.pow(2, s)}×</b></div>`;
  };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { s = +b.dataset.s; if (!s) wrong = false; u(); });
  $("wr").onclick = () => { wrong = !wrong; u(); }; u();
}},

/* NEW CARD: sources and boundaries, step-through build */
{s: "6. Sources and boundaries", t: "Building the simulation box, piece by piece",
intu: String.raw`This is the picture to draw on the board, one piece at a time. A finite box of cells is surrounded by perfectly matched layers (PML), absorbing regions that take up the outgoing light so that the box behaves like open space. The input and output waveguides run straight through the PML, so guided light leaves the box without being reflected back. The tapers and the PBS are excited by a mode source in the input waveguide, which launches the fundamental TE or TM mode computed by the mode solver, and mode monitors in the output waveguides measure the transmission with the overlap of Eq. (3.12). The grating couplers are excited by a Gaussian beam that represents the fiber. Its mode field diameter is 1.53 µm, it is tilted 5° from the surface normal and launched 0.5 µm above the membrane, and its electric field is along \(y\) for TE and in the plane of incidence for TM. Choose a device and a polarization, then step through.`,
eq: String.raw`\[ a_m = \frac14 \int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]<div class="eqref">Ch. 3 Eq. (3.12), used by every mode monitor</div>\[ \text{Gaussian beam: } \mathrm{MFD} = 2w_0 = 1.53\ \mu\mathrm{m}, \quad \theta = 5^\circ, \quad h = 0.5\ \mu\mathrm{m} \]<div class="eqref">Ch. 3 Sec. 3.6, boundaries and sources</div>`,
sym: [["PML", "perfectly matched layer, an absorbing region around the domain"], ["mode source", "launches the fundamental TE or TM mode of the input waveguide, from the mode solver"], ["mode monitor", "plane where the field is projected on an output mode with Eq. (3.12)"], [String.raw`\(w_0\)`, "waist radius of the Gaussian beam, half the mode field diameter"], [String.raw`\(\theta\)`, "tilt of the beam from the surface normal"], [String.raw`\(h\)`, "height of the beam source above the membrane"], ["plane of incidence", String.raw`the \(x\)-\(z\) plane that holds the beam axis and the surface normal`]],
how: ["Draw the box of cells.", "Line every side with PML, so outgoing light is absorbed and the box acts like open space (Chapter 2, Lesson 9).", "Extend the waveguides through the PML, so guided light leaves without reflection at the edge of the box.", "Add the source: a mode source for the tapers and the PBS, a tilted Gaussian beam for the gratings.", String.raw`Add mode monitors at the outputs. Since sources inject 1 W per frequency and modes have unit power, \(T_m = |a_m|^2\) is a fraction of the injected power.`],
say: "PML surround the domain and the waveguides run through them. The tapers and the PBS are excited by a mode source that launches TE0 or TM0, and mode monitors measure the transmission with the overlap of Eq. (3.12). The gratings are excited by a Gaussian beam for the fiber, 1.53 µm mode field diameter, tilted 5°, launched 0.5 µm above the membrane, with E along y for TE and in the plane of incidence for TM.",
num: String.raw`Gaussian beam: \(w_0 = 1.53/2 = 0.765\) µm. A 5° tilt gives an in-plane wavevector \(k_0 \sin 5^\circ = 0.087\,k_0\).<br>Taper: 4 µm long, 200 nm to 1.9 µm wide (Sec. 3.3). PBS design region: 2.5 µm × 2.5 µm.`,
note: "If asked why the waveguides must cross the PML: a waveguide that ended inside the box would act as a mirror, and its reflection would come back into the monitor and the device. Running it through the PML lets the mode leave as if the guide were infinitely long.",
r(fig, ctl) {
  let dev = "taper", pol = "TE";
  ctl.innerHTML = `<div class="row"><label>Device</label><button data-d="taper">Taper (mode source)</button><button data-d="pbs">PBS (mode source)</button><button data-d="gc">Grating (Gaussian beam)</button></div><div class="row"><label>Polarization</label><button data-q="TE">TE</button><button data-q="TM">TM</button></div>`;
  fig.innerHTML = `<div id="g6s"></div><p class="note" id="g6c" style="font-size:14.5px;color:var(--fg);min-height:62px"></p>`;
  const CAPM = ["", "Step 1. The simulation domain: a finite box of grid cells around the device (top view).",
    "Step 2. Perfectly matched layers (hatched) line every side. They absorb the outgoing light, so the finite box behaves like open space.",
    "Step 3. The input and output waveguides run straight through the PML, so guided light leaves the box without being reflected back.",
    { taper: "Step 4. The device: the taper, 4 µm long, from the 200 nm waveguide to the 1.9 µm wide end.", pbs: "Step 4. The device: the PBS design region, 2.5 µm × 2.5 µm, with a TE port and a TM port." },
    "Step 5. A mode source in the input waveguide launches the fundamental mode computed by the mode solver, TE0 or TM0.",
    "Step 6. Mode monitors in the output waveguides project the field on the output mode with Eq. (3.12). T = |a_m|² is the fraction of the injected power.",
    "Step 7. Run: the pulse travels through the device, crosses the monitor and dies out in the PML."];
  const CAPG = ["", "Step 1. The simulation domain, now seen from the side (x along the waveguide, z up). Membrane, beam and DBR are drawn to scale.",
    "Step 2. Perfectly matched layers (hatched) on every side absorb the outgoing light, so the finite box behaves like open space.",
    "Step 3. The membrane, with the access waveguide running through the PML on the right, and the air gap and the DBR below (14 pairs, drawn to scale, running on below the frame).",
    "Step 4. The grating: GaAs teeth and air gaps etched through the membrane.",
    { TE: "Step 5. A Gaussian beam stands in for the fiber: mode field diameter 1.53 µm, tilted 5° from the normal, launched 0.5 µm above the membrane. TE: E along y, out of the page (dots).", TM: "Step 5. A Gaussian beam stands in for the fiber: mode field diameter 1.53 µm, tilted 5° from the normal, launched 0.5 µm above the membrane. TM: E in the plane of incidence (arrows across the beam)." },
    "Step 6. A mode monitor in the access waveguide. CE = |a_m|² for the fundamental mode traveling from the grating toward the waveguide.",
    "Step 7. Run: the beam reaches the grating, part of it is turned into the guided mode and carried past the monitor, and the rest leaves through the PML."];
  const pml = (x0, y0, w, h, p) => `<path d="M${x0} ${y0}h${w}v${h}h${-w}Z M${x0 + p} ${y0 + p}v${h - 2 * p}h${w - 2 * p}v${-(h - 2 * p)}Z" fill="url(#C3L12h)" fill-rule="evenodd" stroke="#7F77DD" stroke-width="0.8"/><text class="ts" x="${x0 + w - 4}" y="${y0 + 15}" text-anchor="end" style="fill:#7F77DD">PML</text>`;
  const draw = S => {
    const k = S.k, tt = S.T || 0; let s = C3L12_hatch;
    const BX = 40, BY = 28, BW = 600, BH = 250, P = 22;
    s += `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" fill="none" stroke="var(--t)" stroke-width="1.5"/>`;
    if (k >= 2) s += pml(BX, BY, BW, BH, P);
    if (dev !== "gc") {
      const cy = BY + BH / 2, sc = 50, hw = 0.1 * sc, HW = 0.95 * sc, xs = BX + P + 50, xm = BX + BW - P - 60;
      const tap = x => hw + (HW - hw) * Math.pow(Math.min(1, Math.max(0, (x - 240) / 200)), 1.6);
      if (k >= 3) {
        if (dev === "taper") { s += `<rect x="${BX}" y="${cy - hw}" width="${240 - BX}" height="${2 * hw}" fill="#378ADD" fill-opacity="0.55"/><rect x="440" y="${cy - HW}" width="${BX + BW - 440}" height="${2 * HW}" fill="#378ADD" fill-opacity="0.55"/>`; }
        else { s += `<rect x="${BX}" y="${cy - hw}" width="${278 - BX}" height="${2 * hw}" fill="#378ADD" fill-opacity="0.55"/>`; [-1, 1].forEach(sg => s += `<rect x="402" y="${cy + sg * 40 - hw}" width="${BX + BW - 402}" height="${2 * hw}" fill="#378ADD" fill-opacity="0.55"/>`); }
      }
      if (k >= 4) {
        if (dev === "taper") { let d = `M240 ${cy - hw}`; for (let x = 240; x <= 440; x += 5) d += `L${x} ${(cy - tap(x)).toFixed(1)}`; for (let x = 440; x >= 240; x -= 5) d += `L${x} ${(cy + tap(x)).toFixed(1)}`; s += `<path d="${d}Z" fill="#378ADD" fill-opacity="0.55" stroke="#0C447C" stroke-width="1"/><text class="ts" x="340" y="${cy - HW - 10}" text-anchor="middle">taper, 4 µm</text>`; }
        else { s += `<rect x="278" y="${cy - 62}" width="124" height="124" fill="var(--sunk)" stroke="#0C447C" stroke-dasharray="4 3"/><path d="M278 ${cy - 6} L320 ${cy - 6} Q360 ${cy - 6} 402 ${cy - 46} L402 ${cy - 34} Q360 ${cy + 6} 320 ${cy + 6} L278 ${cy + 6}Z M320 ${cy + 6} Q360 ${cy + 6} 402 ${cy + 34} L402 ${cy + 46} Q360 ${cy + 6} 320 ${cy - 6}Z" fill="#378ADD" fill-opacity="0.35"/><text class="ts" x="340" y="${cy - 70}" text-anchor="middle">design region 2.5 × 2.5 µm</text><text class="ts" x="${xm - 50}" y="${cy - 52}" text-anchor="middle">TE port</text><text class="ts" x="${xm - 50}" y="${cy + 62}" text-anchor="middle">TM port</text>`; }
      }
      if (k >= 5) {
        s += `<line x1="${xs}" x2="${xs}" y1="${cy - 34}" y2="${cy + 34}" stroke="#1D9E75" stroke-width="3"/><text class="ts" x="${xs}" y="${cy + 50}" text-anchor="middle" style="fill:#1D9E75">mode source</text><text class="ts" x="${xs}" y="${cy + 64}" text-anchor="middle" style="fill:#1D9E75">${pol}0</text>`;
        let d = ""; for (let i = 0; i <= 40; i++) { const yy = -30 + 60 * i / 40, f = Math.exp(-Math.pow(yy / 9, 2)); d += (i ? "L" : "M") + (xs - 6 - 26 * f).toFixed(1) + " " + (cy + yy).toFixed(1); }
        s += `<path d="${d}" fill="none" stroke="#1D9E75" stroke-width="1.8"/>` + arrow(xs + 4, cy - 26, xs + 30, cy - 26, "#1D9E75", 2);
      }
      if (k >= 6) {
        const mons = dev === "taper" ? [[cy, HW + 10, "monitor"]] : [[cy - 40, 22, "TE port monitor"], [cy + 40, 22, "TM port monitor"]];
        mons.forEach(([y, h]) => s += `<line x1="${xm}" x2="${xm}" y1="${y - h}" y2="${y + h}" stroke="#EF9F27" stroke-width="3"/>`);
        if (dev === "taper") s += `<text class="ts" x="${xm - 6}" y="${cy + HW + 24}" text-anchor="end">mode monitor, T = |a|²</text>`;
        if (dev !== "taper") s += `<text class="ts" x="${xm}" y="${BY + BH - P - 6}" text-anchor="middle">mode monitors, T = |a|²</text>`;
      }
      if (k >= 7) {
        const v = 170, L = 26, pos = xs + ((tt * v) % (BX + BW - xs + 80));
        for (let j = -3; j <= 3; j++) {
          const x = pos + j * L; if (x < xs || x > BX + BW) continue;
          const env = Math.exp(-j * j / 5) * (x > BX + BW - P ? Math.max(0, 1 - (x - (BX + BW - P)) / P) : 1);
          let y = cy, h = hw;
          if (dev === "taper") h = x < 240 ? hw : x > 440 ? HW : tap(x);
          else if (x > 330) { const yo = pol === "TE" ? -40 : 40; y = cy + yo * Math.min(1, (x - 330) / 72); h = x < 402 ? 10 : hw; }
          s += `<line x1="${x}" x2="${x}" y1="${y - h + 1}" y2="${y + h - 1}" stroke="#D85A30" stroke-width="3" opacity="${(0.9 * env).toFixed(2)}"/>`;
        }
      }
      s += `<text class="ts" x="${BX}" y="${BY + BH + 16}">top view (x along the waveguide, y across), 50 px per µm</text>`;
    } else {
      const sc = 60, my = 150, mt = 0.16 * sc, gx0 = 100, gx1 = 330, xmon = 545;
      if (k >= 3) {
        s += `<rect x="${gx1}" y="${my}" width="${BX + BW - gx1}" height="${mt}" fill="#378ADD" fill-opacity="0.8"/>`;
        const gy = my + mt + 0.5 * sc; for (let i = 0; i < 14; i++) { const yl = gy + i * 0.124 * sc; if (yl < BY + BH - 3) s += `<rect x="${BX}" y="${yl}" width="${BW}" height="${Math.min(0.057 * sc, BY + BH - yl)}" fill="#BA7517" fill-opacity="0.6"/>`; }
        s += `<text class="ts" x="${BX + P + 6}" y="${gy + 40}">DBR</text><text class="ts" x="${BX + P + 6}" y="${my + mt + 14}">air gap</text>`;
      }
      if (k >= 4) for (let x = gx0; x + 9 <= gx1; x += 19) s += `<rect x="${x}" y="${my}" width="9.5" height="${mt}" fill="#378ADD" fill-opacity="0.8"/>`;
      if (k >= 4) s += `<text class="ts" x="${(gx0 + gx1) / 2}" y="${my + mt + 14}" text-anchor="middle">grating</text>`;
      const th = 5 * Math.PI / 180, bc = 215, w0 = 0.765 * sc, h = 0.5 * sc, uy = Math.cos(th), ux = Math.sin(th);
      const sx0 = bc - h * Math.tan(th), sy0 = my - h;
      if (k >= 5) {
        const px = uy, pz = -ux; // across the beam, unit vector in the x-z plane (screen coords: x, y down)
        const e1 = [sx0 - w0 * px, sy0 - w0 * pz], e2 = [sx0 + w0 * px, sy0 + w0 * pz];
        s += `<path d="M${e1[0]} ${e1[1]} L${e2[0]} ${e2[1]} L${e2[0] + h * ux} ${my} L${e1[0] + h * ux} ${my}Z" fill="#EF9F27" fill-opacity="0.25"/>`;
        s += `<line x1="${e1[0] - 0.5 * w0 * px}" y1="${e1[1] - 0.5 * w0 * pz}" x2="${e2[0] + 0.5 * w0 * px}" y2="${e2[1] + 0.5 * w0 * pz}" stroke="#1D9E75" stroke-width="3"/>`;
        let d = ""; for (let i = 0; i <= 40; i++) { const r = -1.5 + 3 * i / 40, f = Math.exp(-r * r); d += (i ? "L" : "M") + (sx0 + r * w0 * px - 30 * f * ux).toFixed(1) + " " + (sy0 + r * w0 * pz - 30 * f * uy).toFixed(1); }
        s += `<path d="${d}" fill="none" stroke="#1D9E75" stroke-width="1.6"/>`;
        s += `<line x1="${sx0}" y1="${sy0 - 60}" x2="${sx0}" y2="${my}" stroke="var(--p)" stroke-dasharray="3 3"/>` + arrow(sx0, sy0 - 42, sx0 + 42 * ux, sy0 - 42 + 42 * uy, "#BA7517", 2);
        s += `<text class="ts" x="${sx0 + 10}" y="${sy0 - 46}">5°</text>`;
        s += `<text class="ts" x="${e2[0] + 26}" y="${e2[1] - 8}" style="fill:#1D9E75">Gaussian beam (fiber)</text><text class="ts" x="${e2[0] + 26}" y="${e2[1] + 8}" style="fill:#1D9E75">MFD 1.53 µm, tilt 5°</text>`;
        s += `<line x1="${e1[0] - 24}" x2="${e1[0] - 24}" y1="${sy0}" y2="${my}" stroke="var(--t)" marker-end="url(#ar)" marker-start="url(#ar)"/><text class="ts" x="${e1[0] - 28}" y="${my - 6}" text-anchor="end">0.5 µm</text>`;
        for (let j = -1; j <= 1; j++) { const qx = sx0 + j * 0.6 * w0 * px + 10 * ux, qy = sy0 + j * 0.6 * w0 * pz + 10 * uy; if (pol === "TE") s += `<circle cx="${qx}" cy="${qy}" r="4.5" fill="none" stroke="#378ADD" stroke-width="1.5"/><circle cx="${qx}" cy="${qy}" r="1.4" fill="#378ADD"/>`; else s += `<line x1="${qx - 9 * px}" y1="${qy - 9 * pz}" x2="${qx + 9 * px}" y2="${qy + 9 * pz}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)" marker-start="url(#ar)"/>`; }
        s += `<text class="ts" x="${BX + BW - P - 6}" y="${BY + P + 16}" text-anchor="end">${pol === "TE" ? "TE: E along y, out of the page" : "TM: E in the plane of incidence"}</text>`;
      }
      if (k >= 6) s += `<line x1="${xmon}" x2="${xmon}" y1="${my - 30}" y2="${my + mt + 30}" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="${xmon}" y="${my - 36}" text-anchor="middle">mode monitor, CE = |a|²</text>` + arrow(xmon + 10, my + mt + 22, xmon + 46, my + mt + 22, "#EF9F27", 2);
      if (k >= 7) {
        for (let j = 0; j < 4; j++) { const f = ((tt * 0.7 + j / 4) % 1), qx = sx0 + f * h * ux, qy = sy0 + f * h * uy; s += `<line x1="${qx - w0 * uy}" y1="${qy + w0 * ux}" x2="${qx + w0 * uy}" y2="${qy - w0 * ux}" stroke="#D85A30" stroke-width="2" opacity="${(0.9 * (1 - f * 0.4)).toFixed(2)}"/>`; }
        let d = ""; for (let x = gx1 - 40; x <= BX + BW; x += 3) { const fade = x > BX + BW - P ? Math.max(0, 1 - (x - (BX + BW - P)) / P) : 1; d += (d ? "L" : "M") + x + " " + (my + mt / 2 + 5 * fade * Math.sin((x - tt * 120) / 10)).toFixed(1); }
        s += `<path d="${d}" fill="none" stroke="#D85A30" stroke-width="2"/>`;
        for (let j = 0; j < 3; j++) { const f = ((tt * 0.5 + j / 3) % 1); s += `<circle cx="${bc + 40 - f * 30}" cy="${my - 10 - f * 80}" r="${2 + 4 * f}" fill="none" stroke="#D85A30" opacity="${(0.6 * (1 - f)).toFixed(2)}"/>`; }
      }
      s += `<text class="ts" x="${BX}" y="${BY + BH + 16}">side view (x along the waveguide, z up), 60 px per µm</text>`;
    }
    $("g6s").innerHTML = svg(300, s);
    const C = dev === "gc" ? CAPG[k] : CAPM[k];
    $("g6c").textContent = typeof C === "string" ? C : C[dev === "gc" ? pol : dev];
  };
  const S = C3L12_steps(fig, ctl, 7, 3.6, draw, "g6");
  const sync = () => { pick(ctl, "d", dev); pick(ctl, "q", pol); };
  ctl.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => { dev = b.dataset.d; sync(); draw(S); });
  ctl.querySelectorAll("button[data-q]").forEach(b => b.onclick = () => { pol = b.dataset.q; sync(); draw(S); });
  sync(); draw(S);
}}

],
summary: String.raw`Tidy3D builds a non-uniform grid from a number of steps per wavelength in each material, \(\Delta = \lambda_0/(N_\lambda n)\), quoted in the thesis for GaAs. At 20 steps the GaAs cell is 11.38 nm, which is also the PBS pixel size. The gratings are designed in 2D in the plane of the waveguide axis and the fiber at 30 steps, the tapers and the PBS in 3D at 20. The 2D gratings, the PBS and the MMI are evaluated at 30 steps and the 3D gratings with their taper at 20. A mirror plane set to +1 keeps even fields and acts as a PMC, −1 keeps odd fields and acts as a PEC, so a PEC plane keeps a mode whose E is normal to it. The mid-plane is used only with air above and below, the axis plane for the gratings and tapers. PML surround the box, the waveguides run through them, mode sources and mode monitors serve the tapers and the PBS, and a Gaussian beam of 1.53 µm mode field diameter, tilted 5° and launched 0.5 µm above the membrane, serves the gratings.`,
sheet: [
[String.raw`\[ \Delta = \frac{\lambda_0}{N_\lambda\, n} \qquad \Delta_{\mathrm{GaAs}}(N_\lambda = 20) = \frac{795\ \mathrm{nm}}{20 \times 3.492} = 11.38\ \mathrm{nm} \]`, "Cell size from steps per wavelength, equal to the PBS pixel"],
[String.raw`\[ \text{gratings: 2D, } N_\lambda = 30 \qquad \text{tapers, PBS: 3D, } N_\lambda = 20 \]`, "Design runs"],
[String.raw`\[ \text{2D gratings, PBS, MMI: } N_\lambda = 30 \qquad \text{3D gratings with taper: } N_\lambda = 20 \]`, "Evaluation runs"],
[String.raw`\[ +1 = \text{even} = \text{PMC} \ (\mathbf{E} \text{ in the plane}) \qquad -1 = \text{odd} = \text{PEC} \ (\mathbf{E} \text{ normal}) \]`, "Tidy3D symmetry values"],
[String.raw`\[ z = 0:\ \text{TE}_0 \to +1,\ \text{TM}_0 \to -1 \qquad y = 0:\ \text{TE}_0 \to -1,\ \text{TM}_0 \to +1 \]`, String.raw`Which value keeps which mode. \(z = 0\) only with air above and below`],
[String.raw`\[ T_m = |a_m|^2 \qquad \mathrm{MFD} = 1.53\ \mu\mathrm{m}, \quad \theta = 5^\circ, \quad h = 0.5\ \mu\mathrm{m} \]`, "Mode monitors (Eq. 3.12) and the Gaussian beam for the fiber"]],
consts: String.raw`\(\lambda_0 = 795\) nm, \(n_{\mathrm{GaAs}} = 3.492\). Grid picture: cells grow by at most 1.4 times per cell outside the GaAs. Cell counts in card 2 use a toy box of 10 × 5 × 3 µm³ with the GaAs cell everywhere, an upper bound.`,
sources: ["Flexcompute, Tidy3D documentation and 2.11.2 source: AutoGrid (min_steps_per_wvl), Simulation.symmetry, PML, ModeSource, ModeMonitor, GaussianBeam", "Taflove and Hagness, \"Finite-difference time-domain solution of Maxwell's equations\", in Wiley Encyclopedia of Electrical and Electronics Engineering, Wiley (2016) (the FDTD method behind every run)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (even and odd modes of a membrane slab, mirror symmetry)"]
});
