/* Lesson 1.4: The 2D and 3D Yee cell. */
/* Project a 3D point (cube coordinates 0..1) to the figure with azimuth az and elevation el in degrees. */
function FD14_proj(p, az, el) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180, x = p[0] - 0.5, y = p[1] - 0.5, z = p[2] - 0.5;
  const X = x * Math.cos(a) - y * Math.sin(a), Y = x * Math.sin(a) + y * Math.cos(a);
  const Z = z * Math.cos(e) - Y * Math.sin(e), D = Y * Math.cos(e) + z * Math.sin(e);
  return [340 + X * 210, 150 - Z * 210, D];
}
const FD14_COMP = {
  Ex: { f: "E", pos: [[0.5, 0, 0], [0.5, 1, 0], [0.5, 0, 1], [0.5, 1, 1]], dir: [1, 0, 0] },
  Ey: { f: "E", pos: [[0, 0.5, 0], [1, 0.5, 0], [0, 0.5, 1], [1, 0.5, 1]], dir: [0, 1, 0] },
  Ez: { f: "E", pos: [[0, 0, 0.5], [1, 0, 0.5], [0, 1, 0.5], [1, 1, 0.5]], dir: [0, 0, 1] },
  Hx: { f: "H", pos: [[0, 0.5, 0.5], [1, 0.5, 0.5]], dir: [1, 0, 0] },
  Hy: { f: "H", pos: [[0.5, 0, 0.5], [0.5, 1, 0.5]], dir: [0, 1, 0] },
  Hz: { f: "H", pos: [[0.5, 0.5, 0], [0.5, 0.5, 1]], dir: [0, 0, 1] }
};
/* For each selectable component: the one copy highlighted and the four neighbours its update uses (some outside the cube). */
const FD14_SEL = {
  Hz: { at: [0.5, 0.5, 0], nb: [["Ex", [0.5, 0, 0]], ["Ex", [0.5, 1, 0]], ["Ey", [0, 0.5, 0]], ["Ey", [1, 0.5, 0]]], eq: String.raw`\mu_0\,\partial_t H_z = -\big(\partial_x E_y - \partial_y E_x\big)` },
  Hx: { at: [0, 0.5, 0.5], nb: [["Ey", [0, 0.5, 0]], ["Ey", [0, 0.5, 1]], ["Ez", [0, 0, 0.5]], ["Ez", [0, 1, 0.5]]], eq: String.raw`\mu_0\,\partial_t H_x = -\big(\partial_y E_z - \partial_z E_y\big)` },
  Hy: { at: [0.5, 0, 0.5], nb: [["Ex", [0.5, 0, 0]], ["Ex", [0.5, 0, 1]], ["Ez", [0, 0, 0.5]], ["Ez", [1, 0, 0.5]]], eq: String.raw`\mu_0\,\partial_t H_y = -\big(\partial_z E_x - \partial_x E_z\big)` },
  Ez: { at: [1, 1, 0.5], nb: [["Hy", [0.5, 1, 0.5]], ["Hy", [1.5, 1, 0.5]], ["Hx", [1, 0.5, 0.5]], ["Hx", [1, 1.5, 0.5]]], eq: String.raw`\varepsilon\,\partial_t E_z = \partial_x H_y - \partial_y H_x` },
  Ex: { at: [0.5, 1, 1], nb: [["Hz", [0.5, 0.5, 1]], ["Hz", [0.5, 1.5, 1]], ["Hy", [0.5, 1, 0.5]], ["Hy", [0.5, 1, 1.5]]], eq: String.raw`\varepsilon\,\partial_t E_x = \partial_y H_z - \partial_z H_y` },
  Ey: { at: [1, 0.5, 1], nb: [["Hx", [1, 0.5, 0.5]], ["Hx", [1, 0.5, 1.5]], ["Hz", [0.5, 0.5, 1]], ["Hz", [1.5, 0.5, 1]]], eq: String.raw`\varepsilon\,\partial_t E_y = \partial_z H_x - \partial_x H_z` }
};

addLesson("fdtd", "a1", {
level: "Core", num: "Lesson 1.4",
id: "fdtd-1-4", title: "The 2D and 3D Yee cell", short: "1.4 The 2D and 3D Yee cell",
big: String.raw`In 3D there are six field components, and Yee's trick is to place each one where its curl needs it: the electric components on the edges of a cubic cell and the magnetic components at the centres of its faces. Then every magnetic component is surrounded by a loop of four electric components and every electric component by a loop of four magnetic ones, which is exactly what the curl equations ask for. In 2D, where nothing changes along \(z\), the six components split into two independent families. Their names (TE and TM) mean something different from the waveguide names, and mixing the two languages is a classic mistake.`,
bridge: String.raw`Yee (1966) Fig. 1, Taflove and Hagness Ch. 3, Schneider Ch. 8 (2D) and Ch. 9 (3D). Lesson 2.1 gives the 3D time-step limit, Lesson 3.4 uses the parity of these families for symmetry planes.`,
cards: [
{s: "1. The 2D cell", t: "Two independent families in 2D",
intu: String.raw`When nothing changes along \(z\), the curl equations split into two sets that never talk to each other. In the TM\(_z\) family (\(E_z, H_x, H_y\)) the electric field points along \(z\) and the magnetic field lies in the plane. In the TE\(_z\) family (\(H_z, E_x, E_y\)) it is the other way round. Pick a family and a component: the highlighted neighbours are the only values its update reads. Each \(z\) component sits at a node and is ringed by four in-plane components of the other field, the discrete curl.`,
eq: String.raw`\[ \text{TM}_z:\ \varepsilon\,\partial_t E_z = \partial_x H_y - \partial_y H_x \qquad \text{TE}_z:\ \mu_0\,\partial_t H_z = \partial_y E_x - \partial_x E_y \]`,
sym: [[String.raw`TM\(_z\)`, String.raw`magnetic field transverse to z: \((E_z, H_x, H_y)\)`], [String.raw`TE\(_z\)`, String.raw`electric field transverse to z: \((H_z, E_x, E_y)\)`]],
how: [String.raw`Set \(\partial/\partial z = 0\) in the six curl equations.`, String.raw`Three equations contain only \(E_z, H_x, H_y\), the other three only \(H_z, E_x, E_y\).`, "Place each family on its own staggered 2D grid."],
say: String.raw`In 2D FDTD the fields split into TM\(_z\), with \(E_z\) out of plane, and TE\(_z\), with \(H_z\) out of plane. Each is a separate simulation.`,
num: "Each 2D family stores 3 components per cell instead of 6.",
r(fig, ctl) {
  let fam = "tm", c = "z";
  ctl.innerHTML = btns([["tm", "TMz: Ez, Hx, Hy"], ["te", "TEz: Hz, Ex, Ey"]], "f") + btns([["z", "z component"], ["x", "x component"], ["y", "y component"]], "c");
  const u = () => {
    pick(ctl, "f", fam); pick(ctl, "c", c);
    const d = 90, x0 = 115, y0 = 40, Z = fam === "tm" ? "E_z" : "H_z", P = fam === "tm" ? "H" : "E";
    const zc = fam === "tm" ? ["var(--blue)", "var(--blue-bg)"] : ["var(--coral)", "var(--coral-bg)"], pc = fam === "tm" ? ["var(--coral)", "var(--coral-bg)"] : ["var(--blue)", "var(--blue-bg)"];
    let s = "";
    for (let i = 0; i <= 5; i++) s += `<line x1="${x0 + i * d}" x2="${x0 + i * d}" y1="${y0}" y2="${y0 + 2 * d}" stroke="var(--b)"/>`;
    for (let j = 0; j <= 2; j++) s += `<line x1="${x0}" x2="${x0 + 5 * d}" y1="${y0 + j * d}" y2="${y0 + j * d}" stroke="var(--b)"/>`;
    const on = new Set(), ci = 2, cj = 1;
    if (c === "z") { on.add(`y${ci}-${cj}`); on.add(`y${ci - 1}-${cj}`); on.add(`x${ci}-${cj}`); on.add(`x${ci}-${cj - 1}`); on.add(`z${ci}-${cj}`); }
    if (c === "x") { on.add(`x${ci}-${cj}`); on.add(`z${ci}-${cj}`); on.add(`z${ci}-${cj + 1}`); }
    if (c === "y") { on.add(`y${ci}-${cj}`); on.add(`z${ci}-${cj}`); on.add(`z${ci + 1}-${cj}`); }
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 2; j++) { const k = `z${i}-${j}`; s += `<circle cx="${x0 + i * d}" cy="${y0 + j * d}" r="${on.has(k) ? 9 : 6}" fill="${on.has(k) ? zc[0] : zc[1]}" stroke="${zc[0]}"/>`; }
    for (let i = 0; i <= 5; i++) for (let j = 0; j < 2; j++) { const k = `x${i}-${j}`, X = x0 + i * d, Y = y0 + (j + 0.5) * d; s += `<rect x="${X - 6}" y="${Y - 6}" width="12" height="12" fill="${on.has(k) ? pc[0] : pc[1]}" stroke="${pc[0]}"/>`; }
    for (let i = 0; i < 5; i++) for (let j = 0; j <= 2; j++) { const k = `y${i}-${j}`, X = x0 + (i + 0.5) * d, Y = y0 + j * d; s += `<path d="M${X - 7} ${Y + 6}L${X} ${Y - 7}L${X + 7} ${Y + 6}z" fill="${on.has(k) ? pc[0] : pc[1]}" stroke="${pc[0]}"/>`; }
    s += FD.txt(340, 248, `dots: ${Z} on the nodes. Squares: ${P}_x half a cell down. Triangles: ${P}_y half a cell right.`, "ts", "middle");
    s += FD.txt(340, 24, c === "z" ? `${Z} needs the loop of four ${P} around it` : c === "x" ? `${P}_x needs the two ${Z} above and below` : `${P}_y needs the two ${Z} left and right`, "th", "middle");
    fig.innerHTML = svg(260, s);
  };
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { fam = b.dataset.f; u(); });
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { c = b.dataset.c; u(); }); u();
}},
{s: "2. Two languages", t: "TE in a waveguide is not TE in 2D FDTD",
intu: String.raw`Two communities use the same letters. In 2D FDTD, TE\(_z\) names the field that is transverse to the invariant axis \(z\): \(\mathbf{E}\) lies in the simulated plane. In waveguide language, a TE slab mode has its electric field parallel to the slab and transverse to the propagation direction. Toggle the views. For a membrane simulated from the top (a 2D model in the \(xy\) plane, the effective index method), the membrane's TE-like mode has \(E\) in the plane of the membrane, so it is the TE\(_z\) family of the 2D grid. For a slab cross-section simulated from the side (the \(xz\) plane, invariant along \(y\)), the same TE mode has \(E\) along \(y\), out of that plane: now it is the \(\text{TM}_y\)-type family of that 2D grid. The physics is the same, the label depends on which axis is invariant.`,
eq: String.raw`\[ \text{membrane TE-like, top view } (xy): \ (E_x, E_y, H_z) = \text{TE}_z \qquad \text{side view } (xz): \ (E_y, H_x, H_z) \]`,
sym: [["TE (waveguide)", "E transverse to the propagation direction, parallel to the slab"], [String.raw`TE\(_z\) (FDTD)`, "E transverse to the invariant axis z"], ["TE-like, TM-like", "the names for modes of a real 3D membrane strip, which are neither purely TE nor TM"]],
how: ["Ask which axis the 2D model is invariant along.", "Ask whether E of the mode lies in the simulated plane or along the invariant axis.", "In the plane: the family with H out of plane. Along the invariant axis: the family with E out of plane."],
say: "Always say which convention you use. A TE-like membrane mode is the TE\(_z\) family in a top-view 2D simulation, but its E points out of the plane in a side-view 2D simulation.",
num: "A strip in a membrane supports TE-like and TM-like modes, not pure TE and TM, because it is confined in two directions.",
r(fig, ctl) {
  let v = "top";
  ctl.innerHTML = btns([["mode", "The mode (cross-section)"], ["top", "Top-view 2D model (xy)"], ["side", "Side-view 2D model (xz)"]], "v") + `<p class="note" id="lt"></p>`;
  const u = () => {
    pick(ctl, "v", v); let s = "";
    if (v === "mode") {
      s += `<rect x="190" y="110" width="300" height="50" fill="var(--blue-bg)" stroke="var(--blue)"/>` + FD.txt(340, 182, "membrane cross-section (light goes into the page, along x)", "ts", "middle");
      for (let i = 0; i < 5; i++) s += arrow(250 + i * 45, 135, 280 + i * 45, 135, "var(--blue)", 2.4);
      s += FD.txt(340, 100, "TE-like: E mostly along y, in the plane of the membrane", "ts", "middle") + FD.txt(520, 60, "z ↑   y →", "ts");
      $("lt").textContent = "The mode itself: its electric field lies along y, parallel to the membrane.";
    } else if (v === "top") {
      s += `<rect x="40" y="40" width="600" height="180" fill="none" stroke="var(--b)"/><rect x="40" y="115" width="600" height="30" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      for (let i = 0; i < 6; i++) s += arrow(100 + i * 95, 145, 100 + i * 95, 115, "var(--blue)", 2.2);
      s += FD.txt(340, 240, "simulated plane xy, invariant along z. E (arrows, along y) lies in the plane: the TE_z family (Ex, Ey, Hz)", "ts", "middle") + FD.txt(560, 34, "y ↑   x →", "ts");
      $("lt").textContent = "Top view: E in the plane, so the 2D grid runs the TE_z family.";
    } else {
      s += `<rect x="40" y="40" width="600" height="180" fill="none" stroke="var(--b)"/><rect x="40" y="115" width="600" height="30" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
      for (let i = 0; i < 6; i++) s += `<circle cx="${100 + i * 95}" cy="130" r="8" fill="none" stroke="var(--blue)" stroke-width="2"/><circle cx="${100 + i * 95}" cy="130" r="2.5" fill="var(--blue)"/>`;
      s += FD.txt(340, 240, "simulated plane xz, invariant along y. E points out of the page (dots): the family (Ey, Hx, Hz)", "ts", "middle") + FD.txt(560, 34, "z ↑   x →", "ts");
      $("lt").textContent = "Side view: the same E now points along the invariant axis, out of the simulated plane.";
    }
    fig.innerHTML = svg(250, s);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { v = b.dataset.v; u(); }); u();
}},
{s: "3. The 3D cell", t: "E on the edges, H on the faces",
intu: String.raw`Rotate the cube with the sliders. Blue arrows are the electric components on the twelve edges, each pointing along its edge. Coral arrows are the magnetic components at the six face centres, each pointing normal to its face. Pick a component to update. An H component is ringed by the four E edges of its face, a loop that is the discrete curl of E. An E component is ringed by four H face centres, two in this cell and two in the neighbouring cells (dashed). Every component in 3D has this same picture.`,
eq: String.raw`\[ \oint_{\partial A}\mathbf{E}\cdot d\boldsymbol{\ell} = -\mu_0\frac{\partial}{\partial t}\int_A \mathbf{H}\cdot d\mathbf{A} \]`,
sym: [[String.raw`\(\partial A\)`, "the edge loop around one face"], ["edges", String.raw`E at \((i+\tfrac12, j, k)\), \((i, j+\tfrac12, k)\), \((i, j, k+\tfrac12)\)`], ["face centres", String.raw`H at \((i, j+\tfrac12, k+\tfrac12)\), \((i+\tfrac12, j, k+\tfrac12)\), \((i+\tfrac12, j+\tfrac12, k)\)`]],
how: ["Faraday's law in integral form: the loop of E around a face drives the H through it.", "So put H at the face centre and E on the four edges.", "Ampère's law is the same picture on the dual grid, with E through the face of a cell shifted by half a cell."],
say: "In the 3D Yee cell, E sits on the cell edges and H at the face centres, so each component is driven by the loop of the other field around it.",
num: "Six components per cell. In 32-bit floats that is 24 bytes for the fields alone.",
r(fig, ctl) {
  let sel = "Hz";
  ctl.innerHTML = sl("az", "Turn", -80, 80, 1, 35) + sl("el", "Tilt", 0, 60, 1, 22) + btns(["Ex", "Ey", "Ez", "Hx", "Hy", "Hz"].map(c => [c, "update " + c]), "c") + `<div class="eqbig" id="ceq"></div>`;
  const u = () => {
    const az = +$("az").value, el = +$("el").value; $("azv").textContent = az + "°"; $("elv").textContent = el + "°"; pick(ctl, "c", sel);
    const P = p => FD14_proj(p, az, el); let s = "";
    const V = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) { const d = V[a].reduce((t, v, i) => t + Math.abs(v - V[b][i]), 0); if (d === 1) { const p = P(V[a]), q = P(V[b]); s += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--b)" stroke-width="1.2"/>`; } }
    const S = FD14_SEL[sel], nbKey = new Set(S.nb.map(([c, p]) => c + p.join(","))), items = [];
    for (const c in FD14_COMP) for (const p of FD14_COMP[c].pos) items.push([c, p, false]);
    S.nb.forEach(([c, p]) => { if (p.some(v => v < 0 || v > 1)) items.push([c, p, true]); });
    items.sort((A, B) => P(A[1])[2] - P(B[1])[2]);
    for (const [c, p, outside] of items) {
      const C = FD14_COMP[c], isE = C.f === "E", col = isE ? "var(--blue)" : "var(--coral)", hit = nbKey.has(c + p.join(",")), me = c === sel && p.join(",") === S.at.join(",");
      const a = P(p), tip = P([p[0] + C.dir[0] * 0.18, p[1] + C.dir[1] * 0.18, p[2] + C.dir[2] * 0.18]), op = me || hit ? 1 : 0.3;
      s += `<g opacity="${op}"><line x1="${a[0]}" y1="${a[1]}" x2="${tip[0]}" y2="${tip[1]}" stroke="${col}" stroke-width="${me ? 4 : hit ? 3 : 2}" ${outside ? 'stroke-dasharray="4 3"' : ""} marker-end="url(#ar)"/><circle cx="${a[0]}" cy="${a[1]}" r="${me ? 6 : 3.5}" fill="${col}"/></g>`;
      if (me || hit) s += FD.txt(a[0] + 8, a[1] - 6, c, "ts");
    }
    s += C3.legend(40, 318, [["E on edges", "var(--blue)"], ["H at face centres", "var(--coral)"], ["dashed: in the next cell", "var(--p)"]]);
    fig.innerHTML = svg(326, s);
    $("ceq").innerHTML = `\\[${S.eq}\\]`; typesetMath($("ceq"));
  };
  $("az").oninput = u; $("el").oninput = u;
  ctl.querySelectorAll("button[data-c]").forEach(b => b.onclick = () => { sel = b.dataset.c; u(); }); u();
}},
{s: "4. Cost in 3D", t: "Cells, memory and time steps",
intu: String.raw`The 3D update is six lines like the 1D one. Its cost is what changes. Set the size of a box and the cells per wavelength in the highest-index material. The number of cells grows as the cube of the resolution, and because the time step shrinks with the cell (Lesson 2.1), the number of steps for a fixed simulated time grows too. So doubling the resolution costs about 16 times more work. This uniform-grid estimate is an upper bound: Tidy3D's automatic grid uses larger cells in air.`,
eq: String.raw`\[ N_\text{cells} = \frac{L_xL_yL_z}{\Delta^3}, \qquad \Delta t = \frac{S\,\Delta}{c\sqrt3}, \qquad \text{work} \propto N_\text{cells}\,\frac{t_\text{run}}{\Delta t} \propto \Delta^{-4} \]`,
sym: [[String.raw`\(\Delta\)`, "cell size, here uniform"], ["S", "Courant factor, 0.99 by default in Tidy3D"], [String.raw`\(t_\text{run}\)`, "simulated time"]],
how: ["Cell from the wavelength in the material and the cells per wavelength.", "Cells: the volume over the cell volume.", "Time step from the 3D Courant limit. Steps: the run time over the time step.", "Work: cells times steps."],
say: "In 3D the work grows as the fourth power of the resolution: cubed from the cells and once more from the smaller time step.",
num: "Memory here counts only the six field components in 32-bit floats.",
r(fig, ctl) {
  ctl.innerHTML = sl("lx", "Box length x (µm)", 1, 12, 0.5, 6) + sl("ly", "Box width y (µm)", 1, 8, 0.1, 3.6) + sl("lz", "Box height z (µm)", 0.5, 4, 0.1, 1.6) + sl("nn", "Cells per wavelength in the material", 6, 40, 1, 20) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const lx = +$("lx").value, ly = +$("ly").value, lz = +$("lz").value, N = +$("nn").value;
    $("lxv").textContent = lx; $("lyv").textContent = ly.toFixed(1); $("lzv").textContent = lz.toFixed(1); $("nnv").textContent = N;
    const d = 0.795 / (N * 3.492), cells = lx * ly * lz / (d * d * d), dt = 0.99 * d * 1e-6 / (FD.c * Math.sqrt(3)), steps = 1e-12 / dt;
    const work = cells * steps, ref = (6 * 3.6 * 1.6 / Math.pow(0.795 / (20 * 3.492), 3)) * (1e-12 / (0.99 * 0.795 / (20 * 3.492) * 1e-6 / (FD.c * Math.sqrt(3))));
    let s = ""; const bar = (y, lab, v, mx, txt) => { const w = Math.max(3, Math.min(1, v / mx) * 420); return FD.txt(20, y + 15, lab) + `<rect x="170" y="${y}" width="${w}" height="20" rx="3" fill="var(--teal)"/>` + FD.txt(176 + w, y + 15, txt); };
    s += bar(20, "cells", cells, 6e8, FD.sci(cells, 2)) + bar(56, "time steps (1 ps)", steps, 2e5, FD.int(steps)) + bar(92, "relative work", work / ref, 20, FD.f(work / ref, 2) + " × the default box at 20 cells");
    fig.innerHTML = svg(130, s);
    $("ro").innerHTML = FD.ro([["cell Δ", FD.f(d * 1000, 2) + " nm"], ["Δt", FD.f(dt * 1e15, 4) + " fs"], ["field memory", FD.f(cells * 24 / 1e9, 2) + " GB"]]);
  };
  ["lx", "ly", "lz", "nn"].forEach(i => $(i).oninput = u); u();
}},
FD.ckpt({ step: 3, t: "The PBS grid, counted by Tidy3D itself",
  intu: String.raw`For a PBS-like box of 6 × 3.6 × 1.6 µm (an example domain with the PBS strips and design region, PML on all sides), the tidy3d 2.11.2 package counts its own non-uniform grid. At 20 cells per membrane wavelength it builds about 12.5 million cells and a time step of 0.021 fs, so 1 ps of simulated time is about 47,500 steps. At 30 cells per wavelength, for validation, it is about 35 million cells and 70,700 steps. A mirror symmetry through the middle of the membrane (Lesson 3.4) halves the cells that are actually computed.`,
  code: ["sim = td.Simulation(size=(6, 3.6, 1.6), run_time=1e-12,", "    grid_spec=td.GridSpec.auto(min_steps_per_wvl=20, wavelength=0.795),", "    structures=[wg_in, wg_te, wg_tm, design], boundary_spec=td.BoundarySpec.all_sides(td.PML()))", "print(sim.num_cells)        # 12,519,360 for this example box", "print(sim.dt)               # 2.10e-17 s = 0.021 fs", "print(sim.num_time_steps)   # 47,529 for 1 ps", "sim.plot_grid(z=0)          # draw the cells on a cut through the membrane"],
  hi: [3, 4, 5],
  on: ["design", "ports", "pml"], cap: "the grey frame is the PML, it adds cells on every side",
  eq: String.raw`\[ 10: 2.50\times10^6, \quad 15: 6.21\times10^6, \quad 20: 1.25\times10^7, \quad 30: 3.49\times10^7 \ \text{cells} \]`,
  sym: [["10, 15, 20, 30", "values of <code>min_steps_per_wvl</code>, all four used in the thesis codes"]],
  how: ["Build the Simulation with the grid specification.", "Ask Tidy3D for <code>num_cells</code>, <code>dt</code> and <code>num_time_steps</code> before running anything.", "Use these to estimate the cost and choose the resolution."],
  say: "For a PBS-sized box Tidy3D builds about 12 million cells at 20 steps per wavelength, with a 0.021 fs time step, so the grid is the main cost driver.",
  num: "Computed with tidy3d 2.11.2 for the example box, before any run. The cell count is not the thesis domain, which is not stored in the project notes."
})
],
summary: String.raw`In 2D the fields split into TM\(_z\) (\(E_z, H_x, H_y\)) and TE\(_z\) (\(H_z, E_x, E_y\)), named by the field transverse to the invariant axis, which is a different convention from the TE and TM names of waveguide modes. In 3D, E sits on the edges of each cell and H at the face centres, so each component is driven by the loop of the other field around it, the discrete form of Faraday's and Ampère's laws. The work grows as the fourth power of the resolution.`,
sheet: [
[String.raw`\[ \text{TM}_z: (E_z, H_x, H_y), \qquad \text{TE}_z: (H_z, E_x, E_y) \]`, "The 2D families"],
[String.raw`\[ \mu_0\,\partial_t H_z = \partial_y E_x - \partial_x E_y \]`, "One of the six 3D updates (a face loop of E)"],
[String.raw`\[ \text{work} \propto \Delta^{-4} \]`, "3D cost against cell size"]],
teach: [
  "Draw a cube. Put an arrow along each edge for E, and one through each face centre for H.",
  "Pick the bottom face. Trace the loop of four E arrows around it and say: that loop drives the H through the face.",
  "Draw a square for 2D. Put Ez at the corners and Hx, Hy between them. Say: nothing depends on z, so this family is independent.",
  "Warn about names: TE in a waveguide means E parallel to the slab. TE_z in FDTD means E in the simulated plane. Say which one you mean.",
  "End with cost: cells go as one over Δ cubed, steps as one over Δ, work as one over Δ to the fourth."
],
qa: [
  ["Why put E on edges and H on faces, and not the reverse?", "Either works, the two grids are duals of each other. Yee's choice puts the tangential E on the cell surfaces, which makes PEC boundaries and the sampling of material edges simple. Some codes use the dual placement."],
  ["Is a 2D simulation of a membrane device exact?", "No. A top-view 2D model replaces the membrane by its slab effective index, which ignores the vertical structure, radiation out of the plane and mixing between TE-like and TM-like modes. It is a fast screening tool. Final numbers need 3D."],
  ["How many cells does a 3D PBS need?", "For a box of about 6 × 3.6 × 1.6 µm at 20 cells per membrane wavelength, Tidy3D builds about 12.5 million cells with a 0.021 fs time step. A mirror symmetry halves that."],
  ["Why is the time step smaller in 3D?", String.raw`The Courant limit contains the sum over all three directions: \(c\Delta t \le 1/\sqrt{1/\Delta x^2 + 1/\Delta y^2 + 1/\Delta z^2}\), which is \(\Delta/\sqrt3\) for cubic cells (Lesson 2.1).`]
],
mistakes: [
  "Saying \"TE\" without the convention. A reviewer will read it in their own convention.",
  "Expecting a 2D TE_z simulation to show the TM-like mode. It cannot: that family is a different simulation.",
  "Estimating 3D cost from the cell count alone and forgetting that the time step also shrinks.",
  "Placing two different components at the same point when writing your own solver. The staggering is the method."
],
videos: [FD.vid("f101page", "Lecture 1 introduces the 3D Yee cell and how Tidy3D uses it."), FD.vid("m1h", "From about 35:20 the 3D implementation."), ["webgl-fdtd, an open-source 2D FDTD that runs in the browser (GitHub, for ideas)", "https://github.com/timdrysdale/webgl-fdtd", ""]],
sources: [FD.R.yee, FD.R.taflove + ", Ch. 3", FD.R.schneider + ", Ch. 8 (two-dimensional FDTD) and Ch. 9 (three-dimensional FDTD)", "R. C. Rumpf, EMP 5337 Lectures 4b and 4c, the Yee grid (empossible.net)", FD.R.td + ". Grid counts computed with tidy3d 2.11.2 Simulation.num_cells, dt and num_time_steps"]
});
