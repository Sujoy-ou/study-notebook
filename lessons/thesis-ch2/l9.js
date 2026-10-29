addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l9", title: "FDTD 2: the Yee cell in 2D and 3D", short: "9. FDTD 2: the Yee cell",
big: "In 3D each grid cell holds six field components, but not at the same point. The three E components sit at the centres of the cell edges, pointing along them. The three H components sit at the centres of the faces, pointing normal to them. With this arrangement every H is surrounded by a loop of four E components, and every E by a loop of four H components, which is exactly what a curl needs. Kane Yee proposed it in 1966, and it is the grid Tidy3D and MEEP use. In 2D it splits into two independent sets, and you can run one live here.",
bridge: "Your Chapter 2 Fig. 2.7 shows the Yee cell. This lesson lets you rotate it, see which components feed which, and then watch a 2D Yee grid guide light in a high-index slab.",
cards: [
{s: "1. The Yee cell", t: "Where the six components live",
intu: "Rotate the cell. Blue arrows are E components, each at the middle of an edge and pointing along it: four E<sub>x</sub> on the edges parallel to x, four E<sub>y</sub>, four E<sub>z</sub>. Coral arrows are H components, each at the centre of a face and pointing out of it. Click an H component: the four E components circling its face light up. Those four are exactly what the curl of E needs to update that H. Click an E component: the H components on the faces that share its edge light up (two in this cell, two more in the neighbouring cells).",
eq: "E<sub>x</sub>(i+½, j, k), &nbsp; E<sub>y</sub>(i, j+½, k), &nbsp; E<sub>z</sub>(i, j, k+½)<br>H<sub>x</sub>(i, j+½, k+½), &nbsp; H<sub>y</sub>(i+½, j, k+½), &nbsp; H<sub>z</sub>(i+½, j+½, k)",
sym: [["(i, j, k)", "integer grid indices, one per cell corner"], ["+½", "half a cell along that axis"], ["edge centre", "where each E component sits"], ["face centre", "where each H component sits"]],
how: ["The curl of E at a face centre needs the E components tangential to that face, around its edges.", "Placing E on edges puts exactly four of them around each face.", "Likewise the curl of H along an edge needs the H components on the four faces that meet at that edge.", "So the curl equations become sums of four neighbours, all centered. This is Yee's arrangement."],
say: "In the Yee cell the electric field components sit at the centres of the cell edges and the magnetic components at the centres of the faces, so each component is surrounded by a loop of the other field, as the curl equations require.",
num: "One cell: <b>12</b> edge positions (E) and <b>6</b> face positions (H), but each is shared with neighbours, so a large grid has 3 E and 3 H values per cell.",
r(fig, ctl) {
  let sel = "Hz0", ang = 35;
  const E = [], H = [];
  [0, 1].forEach(j => [0, 1].forEach(k => E.push({ id: `Ex${j}${k}`, p: [0.5, j, k], d: [1, 0, 0], c: "x" })));
  [0, 1].forEach(i => [0, 1].forEach(k => E.push({ id: `Ey${i}${k}`, p: [i, 0.5, k], d: [0, 1, 0], c: "y" })));
  [0, 1].forEach(i => [0, 1].forEach(j => E.push({ id: `Ez${i}${j}`, p: [i, j, 0.5], d: [0, 0, 1], c: "z" })));
  [0, 1].forEach(i => H.push({ id: `Hx${i}`, p: [i, 0.5, 0.5], d: [1, 0, 0] }));
  [0, 1].forEach(j => H.push({ id: `Hy${j}`, p: [0.5, j, 0.5], d: [0, 1, 0] }));
  [0, 1].forEach(k => H.push({ id: `Hz${k}`, p: [0.5, 0.5, k], d: [0, 0, 1] }));
  const near = (h, e) => { for (let a = 0; a < 3; a++) if (h.d[a] === 1) { if (e.d[a] === 1) return false; if (Math.abs(e.p[a] - h.p[a]) > 1e-9) return false; } return Math.abs(e.p[0] - h.p[0]) + Math.abs(e.p[1] - h.p[1]) + Math.abs(e.p[2] - h.p[2]) <= 0.5 + 1e-9; };
  ctl.innerHTML = sl("ang", "Rotate view", 0, 90, 1, 35) + `<div class="row"><label>H on a face</label>${H.map(h => `<button data-s="${h.id}">${h.id.slice(0, 2)}${h.id[2] === "0" ? " (lower)" : " (upper)"}</button>`).join("")}</div><div class="row"><label>E on an edge</label><button data-s="Ez00">Ez</button><button data-s="Ex00">Ex</button><button data-s="Ey00">Ey</button></div><div class="readout" id="ro"></div>`;
  const P = ([x, y, z]) => { const a = ang * Math.PI / 180, xr = x * Math.cos(a) - y * Math.sin(a), yr = x * Math.sin(a) + y * Math.cos(a); return [250 + 170 * xr, 245 - 160 * z - 60 * yr]; };
  const u = () => {
    pick(ctl, "s", sel); ang = +$("ang").value; $("angv").textContent = ang + "°";
    let s = "";
    const cs = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], ed = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    ed.forEach(([a, b]) => { const p = P(cs[a]), q = P(cs[b]); s += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--b)" stroke-width="1.2"/>`; });
    const sh = H.find(h => h.id === sel), se = E.find(e => e.id === sel);
    const hot = new Set(); if (sh) E.forEach(e => { if (near(sh, e)) hot.add(e.id); }); if (se) H.forEach(h => { if (near(h, se)) hot.add(h.id); });
    const arrow = (o, col, on, len) => { const a = P([o.p[0] - o.d[0] * len, o.p[1] - o.d[1] * len, o.p[2] - o.d[2] * len]), b = P([o.p[0] + o.d[0] * len, o.p[1] + o.d[1] * len, o.p[2] + o.d[2] * len]); return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${on ? 4 : 2}" opacity="${on ? 1 : 0.45}" marker-end="url(#ar)"/>`; };
    E.forEach(e => s += arrow(e, "#378ADD", hot.has(e.id) || e.id === sel, 0.13));
    H.forEach(h => s += arrow(h, "#D85A30", hot.has(h.id) || h.id === sel, 0.13));
    const o = P([0, 0, 0]);
    fig.innerHTML = svg(310, `${s}<text class="ts" x="${o[0] - 6}" y="${o[1] + 16}" text-anchor="end">(i, j, k)</text><text class="ts" x="480" y="60">blue: E on edges</text><text class="ts" x="480" y="80">coral: H on faces</text><text class="ts" x="480" y="110">highlighted: the loop</text><text class="ts" x="480" y="126">that updates the</text><text class="ts" x="480" y="142">selected component</text>`);
    $("ro").innerHTML = `<div><span>selected</span><b>${sel.slice(0, 2)}</b></div><div><span>loop partners shown</span><b>${hot.size}${se ? " here (+2 in neighbour cells)" : ""}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sel = b.dataset.s; u(); });
  $("ang").oninput = u; u();
}},

{s: "2. A loop on a face", t: "The curl is a loop: updating one H",
intu: "Take the bottom face of a cell. H<sub>z</sub> sits at its centre. Around it, on the four edges, are two E<sub>x</sub> and two E<sub>y</sub>. Faraday's law says the change of H<sub>z</sub> is set by how much E circulates around that loop. Going counterclockwise: E<sub>x</sub> on the front edge counts positive, E<sub>y</sub> on the right edge positive, E<sub>x</sub> on the back edge negative, E<sub>y</sub> on the left edge negative. Set the four edge values and see the circulation and the resulting change in H<sub>z</sub>. If all four point the same way around, H<sub>z</sub> changes a lot. If they just point in one straight direction, the loop cancels and H<sub>z</sub> does not change.",
eq: "∂H<sub>z</sub>/∂t = −(1/μ<sub>0</sub>)(∂E<sub>y</sub>/∂x − ∂E<sub>x</sub>/∂y)<br>H<sub>z</sub><sup>n+½</sup> = H<sub>z</sub><sup>n−½</sup> − (Δt/μ<sub>0</sub>)[(E<sub>y</sub>|<sub>i+1</sub> − E<sub>y</sub>|<sub>i</sub>)/Δx − (E<sub>x</sub>|<sub>j+1</sub> − E<sub>x</sub>|<sub>j</sub>)/Δy]",
sym: [["circulation", "sum of E along the loop, counterclockwise seen from +z"], ["E_y|_{i+1}, E_y|_i", "E_y on the right and left edges of the face"], ["E_x|_{j+1}, E_x|_j", "E_x on the back and front edges"]],
how: ["Stokes: the loop integral of E around a face equals the curl's normal component times the face area.", "Approximate each side of the loop by the E value at its centre times its length. That is exactly where Yee puts E.", "Divide by the area ΔxΔy to get the curl at the face centre.", "Faraday's law then gives the change of H_z over one time step."],
say: "Each magnetic component is updated from the circulation of the four electric components around its face, which is a centered, second-order approximation of Faraday's law.",
num: "Uniform E (all E<sub>x</sub> = 1, all E<sub>y</sub> = 0): circulation <b>0</b>, H<sub>z</sub> unchanged.<br>All four pointing around the loop with value 1: circulation <b>4</b> (in units of E·Δ), the largest change.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "E_x front edge", -1, 1, 0.05, 1) + sl("b", "E_y right edge", -1, 1, 0.05, 1) + sl("c", "E_x back edge", -1, 1, 0.05, -1) + sl("d", "E_y left edge", -1, 1, 0.05, -1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const a = +$("a").value, b = +$("b").value, c = +$("c").value, d = +$("d").value;["a", "b", "c", "d"].forEach(k => $(k + "v").textContent = (+$(k).value).toFixed(2));
    const circ = a + b - c - d, x0 = 200, y0 = 50, s = 160;
    const ar = (x, y, dx, dy, v) => `<line x1="${x - dx * 35 * v}" y1="${y - dy * 35 * v}" x2="${x + dx * 35 * v}" y2="${y + dy * 35 * v}" stroke="#378ADD" stroke-width="3.5" ${Math.abs(v) > 0.02 ? 'marker-end="url(#ar)"' : ""}/>`;
    fig.innerHTML = svg(260, `<rect x="${x0}" y="${y0}" width="${s}" height="${s}" fill="var(--blue-bg)" stroke="var(--p)"/>${ar(x0 + s / 2, y0 + s, 1, 0, a)}${ar(x0 + s, y0 + s / 2, 0, -1, b)}${ar(x0 + s / 2, y0, 1, 0, c)}${ar(x0, y0 + s / 2, 0, -1, d)}<circle cx="${x0 + s / 2}" cy="${y0 + s / 2}" r="${6 + Math.min(30, Math.abs(circ) * 7)}" fill="#D85A30" opacity="0.35"/><text class="th" x="${x0 + s / 2}" y="${y0 + s / 2 + 5}" text-anchor="middle">H_z</text><path d="M${x0 + s / 2 + 52} ${y0 + s / 2} A52 52 0 1 0 ${x0 + s / 2 + 51} ${y0 + s / 2 - 10}" fill="none" stroke="var(--p)" stroke-dasharray="3 4" marker-end="url(#ar)"/><text class="ts" x="${x0 + s / 2}" y="${y0 + s + 34}" text-anchor="middle">x →, y ↑ (seen from +z). Dashed: counterclockwise</text><text class="th" x="560" y="120" text-anchor="middle">circulation</text><text class="th" x="560" y="146" text-anchor="middle" style="font-size:22px">${circ.toFixed(2)}</text><text class="ts" x="560" y="170" text-anchor="middle">ΔH_z ∝ −circulation</text>`);
    $("ro").innerHTML = `<div><span>(E_x front − E_x back)</span><b>${(a - c).toFixed(2)}</b></div><div><span>(E_y right − E_y left)</span><b>${(b - d).toFixed(2)}</b></div><div><span>ΔH_z (relative)</span><b>${(-circ).toFixed(2)}</b></div>`;
  };
  ["a", "b", "c", "d"].forEach(k => $(k).oninput = u); u();
}},

{s: "3. The 2D grid", t: "2D: the grid splits into two independent sets",
intu: "If nothing changes along z (an infinitely long structure, or a 2D cross-section approximation), the six components split into two groups that never talk to each other. One group is E<sub>z</sub>, H<sub>x</sub>, H<sub>y</sub> (called TM<sub>z</sub> in FDTD texts), the other is H<sub>z</sub>, E<sub>x</sub>, E<sub>y</sub> (TE<sub>z</sub>). Each can be simulated alone. The grid for the first group is drawn here: E<sub>z</sub> at the nodes, H<sub>x</sub> between nodes vertically, H<sub>y</sub> between nodes horizontally. Click a node or an H to see its update stencil. Careful: FDTD's TE<sub>z</sub> and TM<sub>z</sub> names refer to the z axis of the simulation, which is not the same as the TE-like and TM-like waveguide modes of Lessons 2 and 3.",
eq: "TM<sub>z</sub>: &nbsp; ∂E<sub>z</sub>/∂t = (1/ε)(∂H<sub>y</sub>/∂x − ∂H<sub>x</sub>/∂y), &nbsp; ∂H<sub>x</sub>/∂t = −(1/μ<sub>0</sub>)∂E<sub>z</sub>/∂y, &nbsp; ∂H<sub>y</sub>/∂t = (1/μ<sub>0</sub>)∂E<sub>z</sub>/∂x",
sym: [["TM_z", "the set E_z, H_x, H_y (E normal to the simulation plane)"], ["TE_z", "the set H_z, E_x, E_y"], ["stencil", "the neighbours used in one update"]],
how: ["Set ∂/∂z = 0 in both curl equations.", "The equations for E_z, H_x, H_y only involve each other, and so do those for H_z, E_x, E_y.", "So a 2D simulation needs only one of the two sets for a given polarization.", "The staggering is the 3D Yee cell seen from above."],
say: "In two dimensions the Yee scheme splits into two independent polarizations, TM_z (E_z, H_x, H_y) and TE_z (H_z, E_x, E_y). These names refer to the simulation axis, not to waveguide mode labels.",
num: "2D cost: 3 field values per cell instead of 6, and far fewer cells. That is why a grating is often designed first in 2D and only checked in 3D.",
r(fig, ctl) {
  let sel = "e,2,1";
  ctl.innerHTML = `<p class="note">Click a dot (E_z) or a square (H) in the picture.</p><div class="readout" id="ro"></div>`;
  const u = () => {
    const X = i => 120 + i * 90, Y = j => 220 - j * 70;
    const [kind, si, sj] = sel.split(","), I = +si, J = +sj;
    const hot = new Set();
    if (kind === "e") { hot.add(`hy,${I},${J}`); hot.add(`hy,${I - 1},${J}`); hot.add(`hx,${I},${J}`); hot.add(`hx,${I},${J - 1}`); }
    if (kind === "hx") { hot.add(`e,${I},${J}`); hot.add(`e,${I},${J + 1}`); }
    if (kind === "hy") { hot.add(`e,${I},${J}`); hot.add(`e,${I + 1},${J}`); }
    let s = "";
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const k = `e,${i},${j}`; s += `<circle data-k="${k}" cx="${X(i)}" cy="${Y(j)}" r="${k === sel ? 10 : 8}" fill="${k === sel || hot.has(k) ? "#378ADD" : "var(--panel)"}" stroke="#378ADD" stroke-width="2" style="cursor:pointer"/>`; }
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const k = `hx,${i},${j}`; s += `<rect data-k="${k}" x="${X(i) - 7}" y="${Y(j) - 35 - 7}" width="14" height="14" fill="${k === sel || hot.has(k) ? "#D85A30" : "var(--panel)"}" stroke="#D85A30" stroke-width="2" style="cursor:pointer"/>`; }
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const k = `hy,${i},${j}`; s += `<rect data-k="${k}" x="${X(i) + 45 - 7}" y="${Y(j) - 7}" width="14" height="14" fill="${k === sel || hot.has(k) ? "#7F77DD" : "var(--panel)"}" stroke="#7F77DD" stroke-width="2" style="cursor:pointer"/>`; }
    fig.innerHTML = svg(270, `${s}<text class="ts" x="120" y="258">blue dots: E_z at nodes. Coral squares: H_x (between nodes in y). Purple: H_y (between nodes in x)</text>`);
    fig.querySelectorAll("[data-k]").forEach(el => el.onclick = () => { sel = el.getAttribute("data-k"); u(); });
    $("ro").innerHTML = `<div><span>selected</span><b>${kind === "e" ? "E_z" : kind === "hx" ? "H_x" : "H_y"}</b></div><div><span>uses</span><b>${kind === "e" ? "2 H_x and 2 H_y around it" : "the 2 E_z on either side"}</b></div>`;
  };
  u();
}},

{s: "4. Run 2D", t: "A live 2D FDTD simulation",
intu: "This runs the 2D TM<sub>z</sub> Yee updates of card 3 on a 200 × 120 grid. Choose a scene. In free space, a point source sends out circular waves. With a dielectric block, the waves slow down inside it, reflect from it and bend around it. With a slab waveguide (a high-index strip, n = 3.5), a source inside the strip launches light that stays trapped and travels along it, with only a little radiated at the start: total internal reflection, computed from nothing but the curl equations. The colours are the sign and size of E<sub>z</sub>. The frame is an absorbing layer.",
eq: "E<sub>z</sub> ← E<sub>z</sub> + (S/ε)[(H<sub>y</sub>|<sub>i</sub> − H<sub>y</sub>|<sub>i−1</sub>) − (H<sub>x</sub>|<sub>j</sub> − H<sub>x</sub>|<sub>j−1</sub>)]<br>H<sub>x</sub> ← H<sub>x</sub> − S(E<sub>z</sub>|<sub>j+1</sub> − E<sub>z</sub>|<sub>j</sub>), &nbsp;&nbsp; H<sub>y</sub> ← H<sub>y</sub> + S(E<sub>z</sub>|<sub>i+1</sub> − E<sub>z</sub>|<sub>i</sub>)",
sym: [["S", "Courant number, 0.5 here (below the 2D limit 1/√2 ≈ 0.707)"], ["ε", "relative permittivity per cell"], ["source", "a sine added at one cell each step, smoothly switched on"]],
how: ["Same leapfrog as 1D, now with two H components.", "ε is stored per cell, so any geometry can be drawn into the grid.", "A graded absorbing frame damps waves before they reach the edge.", "Light inside the strip at N above 1 cannot leak out, the guiding of Lesson 1."],
say: "A 2D FDTD simulation reproduces radiation, refraction and waveguiding directly from the discretized curl equations, given only the permittivity on the grid.",
num: "Wavelength in air λ₀ = 40 cells. Inside the strip (n = 3.5) the wavelength is about 11 cells, close to the minimum for reasonable accuracy (Lesson 10).",
r(fig, ctl) {
  let scene = "wg", run = true, sim;
  ctl.innerHTML = btns([["free", "free space"], ["block", "dielectric block"], ["wg", "slab waveguide"]], "s") + `<div class="row"><button id="rs">Restart</button><button id="pp">Pause</button></div>`;
  const nx = 200, ny = 120, lam = 40;
  const reset = () => { const eps = new Float32Array(nx * ny).fill(1); for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { if (scene === "block" && i > 110 && i < 150 && j > 35 && j < 85) eps[j * nx + i] = 6; if (scene === "wg" && j >= 55 && j <= 64) eps[j * nx + i] = 12.25; } sim = new C2.FDTD2D(nx, ny, 0.5, eps, 15); pick(ctl, "s", scene); };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { scene = b.dataset.s; reset(); });
  $("rs").onclick = reset; $("pp").onclick = () => { run = !run; $("pp").textContent = run ? "Pause" : "Play"; };
  reset();
  const { ctx, img } = C2.canvas(fig, nx, ny, 3, "E_z: red positive, blue negative. Grey lines mark the high-index region.");
  anim(() => {
    if (run) for (let s = 0; s < 3; s++) { const t = sim.t, ramp = Math.min(1, t / 80); const sx = scene === "wg" ? 40 : 60; sim.step([sx, 60, 0.6 * ramp * Math.sin(2 * Math.PI * t * 0.5 / lam)]); }
    for (let k = 0; k < nx * ny; k++) { const [r, g, b] = C2.color(sim.ez[k] * 3); let o = k * 4; const e = sim.eps[k]; img.data[o] = e > 1 ? r * 0.85 : r; img.data[o + 1] = e > 1 ? g * 0.85 : g; img.data[o + 2] = e > 1 ? b * 0.85 : b; img.data[o + 3] = 255; }
    const flip = ctx.createImageData(nx, ny); for (let j = 0; j < ny; j++) flip.data.set(img.data.subarray(j * nx * 4, (j + 1) * nx * 4), (ny - 1 - j) * nx * 4);
    ctx.putImageData(flip, 0, 0);
  });
}},

{s: "5. Geometry on a grid", t: "Curved shapes on a square grid: staircasing",
intu: "The grid only knows ε per cell. A smooth shape, like a circle or a slanted wall, has to be drawn with square pixels, which gives a staircase. That makes the shape slightly wrong in size and position, and the error falls only slowly as the grid is refined. The fix used by MEEP, which Oskooi et al. describe, and by Tidy3D, is subpixel averaging: a cell cut by an interface gets an effective ε from the fraction of each material inside it (and, done properly, from the field direction). Then the effective boundary sits in the right place even between grid points. Change the resolution and compare the staircased and the averaged circle.",
eq: "staircase: &nbsp; ε<sub>cell</sub> = ε(centre of the cell) &nbsp;&nbsp;&nbsp; averaged: &nbsp; ε<sub>cell</sub> = f ε<sub>1</sub> + (1 − f) ε<sub>2</sub> &nbsp; (simplest form)<br>f = fraction of the cell inside material 1",
sym: [["f", "filling fraction of the cell"], ["staircasing", "representing a smooth boundary by whole cells"], ["subpixel averaging", "assigning an effective ε to cells cut by a boundary"]],
how: ["Sample the shape at the centre of each cell: each cell is all one material or all the other.", "The area represented jumps by whole cells as the shape moves, so small changes in shape are invisible until a cell flips.", "Averaging gives each boundary cell an intermediate ε, so the represented shape changes smoothly.", "A careful average that treats field components parallel and normal to the interface differently restores second-order accuracy."],
say: "On a Cartesian grid, curved or slanted boundaries are staircased. Subpixel averaging of the permittivity at boundary cells reduces this error, which is important for small, shape-sensitive features.",
num: "This is one reason inverse-designed shapes are sensitive to grid resolution: a small boundary change only shows up once it moves a whole cell, unless averaging is used.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Cells across the circle", 4, 40, 1, 10) + sl("off", "Shift the circle (fraction of a cell)", 0, 1, 0.05, 0.3) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value, off = +$("off").value; $("nv").textContent = n; $("offv").textContent = off.toFixed(2);
    const R = n / 2, cx = n / 2 + 1 + off, cy = n / 2 + 1, M = n + 3, cs = 240 / M;
    let s1 = "", s2 = "", A1 = 0, A2 = 0;
    for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
      const inC = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) < R ? 1 : 0; let f = 0; const q = 6; for (let a = 0; a < q; a++) for (let b = 0; b < q; b++) if (Math.hypot(i + (a + 0.5) / q - cx, j + (b + 0.5) / q - cy) < R) f++; f /= q * q;
      A1 += inC; A2 += f;
      if (inC) s1 += `<rect x="${40 + i * cs}" y="${20 + j * cs}" width="${cs}" height="${cs}" fill="#378ADD"/>`;
      if (f > 0) s2 += `<rect x="${380 + i * cs}" y="${20 + j * cs}" width="${cs}" height="${cs}" fill="#378ADD" opacity="${f}"/>`;
    }
    const grid = x0 => { let g = ""; for (let k = 0; k <= M; k++) g += `<line x1="${x0 + k * cs}" x2="${x0 + k * cs}" y1="20" y2="${20 + M * cs}" stroke="var(--b)" stroke-width="0.5"/><line x1="${x0}" x2="${x0 + M * cs}" y1="${20 + k * cs}" y2="${20 + k * cs}" stroke="var(--b)" stroke-width="0.5"/>`; return g; };
    const circ = x0 => `<circle cx="${x0 + cx * cs}" cy="${20 + cy * cs}" r="${R * cs}" fill="none" stroke="#D85A30" stroke-width="2"/>`;
    const At = Math.PI * R * R;
    fig.innerHTML = svg(290, `${s1}${grid(40)}${circ(40)}${s2}${grid(380)}${circ(380)}<text class="ts" x="160" y="282" text-anchor="middle">staircase</text><text class="ts" x="500" y="282" text-anchor="middle">subpixel average</text>`);
    $("ro").innerHTML = `<div><span>area error, staircase</span><b>${((A1 / At - 1) * 100).toFixed(1)} %</b></div><div><span>area error, averaged</span><b>${((A2 / At - 1) * 100).toFixed(2)} %</b></div>`;
  };
  $("n").oninput = u; $("off").oninput = u; u();
}},

{s: "6. What it costs", t: "How big a 3D simulation gets",
intu: "A 3D FDTD simulation stores six numbers per cell and updates all of them every step. The cell size is set by the shortest wavelength in the structure: λ₀ divided by the steps per wavelength and by the highest index. The time step is tied to the cell size by the Courant limit, so a finer grid also needs more steps for the same physical time. Together the cost grows as the fourth power of the resolution. Change the numbers: going from 20 to 30 steps per wavelength makes the run about five times more expensive. Symmetry planes (Lesson 4) cut the cells by 2 each.",
eq: "Δx = λ<sub>0</sub>/(N<sub>λ</sub> n<sub>max</sub>) &nbsp;&nbsp; cells = (L<sub>x</sub>L<sub>y</sub>L<sub>z</sub>)/Δx³ &nbsp;&nbsp; Δt ≈ 0.99 Δx/(c√3)<br>cost ∝ cells × steps ∝ N<sub>λ</sub>⁴",
sym: [["N_λ", "steps per wavelength in the highest-index material"], ["n_max", "largest refractive index in the domain"], ["L_x, L_y, L_z", "domain size"], ["steps", "number of time steps for the run time T, T/Δt"]],
how: ["Cell size from resolution: Δx = λ₀/(N_λ n_max).", "Number of cells scales as N_λ³.", "Courant: Δt ∝ Δx, so the number of time steps for a fixed physical time scales as N_λ.", "Total work ∝ N_λ⁴. Memory ∝ N_λ³."],
say: "The cost of a 3D FDTD simulation grows as the fourth power of the grid resolution, three powers from the number of cells and one from the time step. Resolution, domain size and symmetry are therefore chosen together.",
num: "λ₀ = 800 nm, n = 3.5, 20 steps per wavelength: Δx = <b>11.4 nm</b>. At 30 steps: <b>7.6 nm</b>.<br>(30/20)⁴ ≈ <b>5.1×</b> the work.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Steps per wavelength", 8, 40, 1, 20) + sl("Lx", "Domain L_x (µm)", 1, 20, 0.5, 6) + sl("Ly", "Domain L_y (µm)", 1, 10, 0.5, 4) + sl("Lz", "Domain L_z (µm)", 0.5, 6, 0.25, 2) + sl("T", "Run time (ps)", 0.2, 5, 0.1, 1) + `<div class="row"><label>Symmetry planes</label>${[0, 1, 2].map(v => `<button data-s="${v}">${v}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  let sy = 0;
  const u = () => {
    pick(ctl, "s", sy);
    const N = +$("N").value, Lx = +$("Lx").value, Ly = +$("Ly").value, Lz = +$("Lz").value, T = +$("T").value;["N", "Lx", "Ly", "Lz", "T"].forEach(k => $(k + "v").textContent = (+$(k).value));
    const dx = 0.8 / (N * 3.5), cells = Lx * Ly * Lz / Math.pow(dx, 3) / Math.pow(2, sy), dt = 0.99 * dx * 1e-6 / (3e8 * Math.sqrt(3)), steps = T * 1e-12 / dt, mem = cells * 6 * 4 / 1e9, work = cells * steps;
    const ref = (() => { const d = 0.8 / (20 * 3.5); const c = Lx * Ly * Lz / Math.pow(d, 3) / Math.pow(2, sy); const st = T * 1e-12 / (0.99 * d * 1e-6 / (3e8 * Math.sqrt(3))); return c * st; })();
    const ns = range(8, 40, 33), ws = ns.map(n => Math.pow(n / 20, 4));
    fig.innerHTML = svg(230, `${plot(60, 30, 560, 160, ns, ws, 8, 40, 0, 16, "#378ADD", 2.5)}<line x1="${60 + (N - 8) / 32 * 560}" x2="${60 + (N - 8) / 32 * 560}" y1="30" y2="190" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="190" y2="190" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="190" stroke="var(--p)"/><text class="ts" x="340" y="212" text-anchor="middle">relative work versus steps per wavelength (1 at 20), up to 16×</text>`);
    $("ro").innerHTML = `<div><span>cell size</span><b>${(dx * 1000).toFixed(1)} nm</b></div><div><span>cells</span><b>${(cells / 1e6).toFixed(1)} million</b></div><div><span>time steps</span><b>${Math.round(steps).toLocaleString()}</b></div><div><span>field memory</span><b>${mem.toFixed(2)} GB</b></div><div><span>work vs 20 steps</span><b>${(work / ref).toFixed(2)}×</b></div>`;
  };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { sy = +b.dataset.s; u(); });
  ["N", "Lx", "Ly", "Lz", "T"].forEach(k => $(k).oninput = u); u();
}}
],
summary: "In the Yee cell, E components sit at the centres of the cell edges and H components at the centres of the faces, so each component is updated from the loop of four components of the other field around it: a centered approximation of the curl. In 2D the scheme splits into two independent sets, TM_z (E_z, H_x, H_y) and TE_z (H_z, E_x, E_y), named after the simulation axis. A live 2D run shows radiation, refraction and waveguiding emerging from the updates. Curved boundaries are staircased unless ε is averaged at boundary cells, and the cost of a 3D run grows as the fourth power of the resolution.",
sheet: [
["E<sub>x</sub>(i+½, j, k), E<sub>y</sub>(i, j+½, k), E<sub>z</sub>(i, j, k+½)", "E on edge centres"],
["H<sub>x</sub>(i, j+½, k+½), H<sub>y</sub>(i+½, j, k+½), H<sub>z</sub>(i+½, j+½, k)", "H on face centres"],
["∂H<sub>z</sub>/∂t = −(1/μ<sub>0</sub>)(∂E<sub>y</sub>/∂x − ∂E<sub>x</sub>/∂y)", "Face loop update"],
["TM<sub>z</sub>: E<sub>z</sub>, H<sub>x</sub>, H<sub>y</sub>; &nbsp; TE<sub>z</sub>: H<sub>z</sub>, E<sub>x</sub>, E<sub>y</sub>", "2D split"],
["ε<sub>cell</sub> = fε<sub>1</sub> + (1 − f)ε<sub>2</sub>", "Simplest subpixel average"],
["Δx = λ<sub>0</sub>/(N<sub>λ</sub>n<sub>max</sub>), &nbsp; cost ∝ N<sub>λ</sub>⁴", "Grid size and cost"]],
consts: "2D simulation: 200 × 120 cells, S = 0.5, λ₀ = 40 cells.",
sources: ["Oskooi et al., Comput. Phys. Commun. 181, 687 (2010) (Yee grid, subpixel averaging in MEEP)", "K. S. Yee, IEEE Trans. Antennas Propag. 14, 302 (1966) (the original Yee scheme)", "Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Eq. (8) (3D stability limit)", "Your Chapter 2, Fig. 2.7 (the Yee cell)"]
});
