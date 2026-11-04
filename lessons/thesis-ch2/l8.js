/* TODO for this lesson: Thesis Sec. 2.6 first half. Rewrite big/bridge/summary/sheet. */
addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l8", title: "FDTD 1: from Maxwell to the Yee cell", short: "8. FDTD 1, Maxwell to Yee",
big: String.raw`FDTD takes Maxwell's two curl equations and marches them forward in time on a grid. Derivatives become differences between neighbouring grid values. The trick that makes it accurate and simple is staggering: \(\mathbf{E}\) and \(\mathbf{H}\) live half a cell apart in space and half a step apart in time, so every difference is a centered one. Then each field is updated from the other, back and forth, a leapfrog. One run with a short pulse gives the whole spectrum at once.`,
bridge: "Your Chapter 2 writes Maxwell's equations in the form of Oskooi et al. 2010, Eqs. (1) and (2), the MEEP paper. MEEP is a free FDTD package from MIT, and the paper explains its design: the Yee grid, the leapfrog, PML, sources and subpixel averaging. Tidy3D uses the same standard Yee scheme. The 1D simulations on this page run live in your browser.",
cards: [
/* from old ch2 L8 card 1 */
{s: "1. Maxwell", t: "The two equations FDTD solves",
intu: String.raw`Only the two curl equations are needed. The first says a magnetic field that circulates around a line makes the electric field along that line grow. The second says a circulating electric field makes the magnetic field change, with a minus sign. A light wave is these two feeding each other: \(\mathbf{E}\) changes in space, which pushes \(\mathbf{H}\), which changes in space, which pushes \(\mathbf{E}\), and the pattern moves forward. Watch the plane wave: \(\mathbf{E}\) (blue) and \(\mathbf{H}\) (coral) are perpendicular, in phase, and move together. Changing the index slows the wave and changes the \(\mathbf{E}\) to \(\mathbf{H}\) ratio.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0 \varepsilon_r} \nabla \times \mathbf{H} \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0} \nabla \times \mathbf{E} \]<div class="eqnote">1D (wave along \(x\), \(\mathbf{E} = E_z\hat{\mathbf{z}}\), \(\mathbf{H} = H_y\hat{\mathbf{y}}\))</div>\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon} \frac{\partial H_y}{\partial x}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0} \frac{\partial E_z}{\partial x} \]<div class="eqref">Ch. 2 Eq. 2.16, Oskooi Eqs. 1 and 2</div>`,
sym: [[String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"], [String.raw`\(\varepsilon_r\)`, String.raw`relative permittivity of the material, \(n^2\)`], [String.raw`\(\nabla \times\)`, "curl: how much a field circulates around a point"], [String.raw`\(E_z, H_y\)`, String.raw`the two field components of a wave travelling along \(x\)`]],
how: [String.raw`Start from Ampère's law with no free current, \(\nabla \times \mathbf{H} = \partial\mathbf{D}/\partial t\), with \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\).`, String.raw`Faraday's law: \(\nabla \times \mathbf{E} = -\partial\mathbf{B}/\partial t\), with \(\mathbf{B} = \mu_0\mathbf{H}\).`, String.raw`Oskooi et al. write these with \(\mathbf{D}\) and \(\mathbf{B}\). Substituting the material relations gives the form above.`, String.raw`For fields that depend only on \(x\), the curls reduce to single \(x\) derivatives.`],
say: "FDTD solves the two Maxwell curl equations directly in the time domain. The divergence equations are satisfied automatically by the Yee scheme if they hold initially.",
num: String.raw`Speed in a material: \(c/n\). For \(n = 3.5\) the wave travels at <b>\(0.29c\)</b>.<br>Ratio \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\) with \(\eta_0\) = <b>377 Ω</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n", 1, 3.5, 0.01, 1);
  anim(t => {
    const n = $("n") ? +$("n").value : 1; if ($("nv")) $("nv").textContent = n.toFixed(2);
    const xs = range(0, 6, 200), k = 2 * Math.PI * n / 2, w = 2 * Math.PI * 0.4;
    const E = xs.map(x => Math.sin(k * x - w * t)), H = xs.map(x => Math.sin(k * x - w * t) / n);
    let ea = "", ha = ""; for (let i = 0; i < 200; i += 8) { const X = 60 + xs[i] / 6 * 560; ea += `<line x1="${X}" y1="120" x2="${X}" y2="${120 - E[i] * 70}" stroke="#378ADD" stroke-width="1.2"/>`; ha += `<line x1="${X}" y1="120" x2="${X + H[i] * 40 * 0.6}" y2="${120 + H[i] * 40 * 0.6}" stroke="#D85A30" stroke-width="1.2"/>`; }
    fig.innerHTML = svg(250, `<line x1="50" x2="630" y1="120" y2="120" stroke="var(--p)" marker-end="url(#ar)"/><text class="ts" x="634" y="124">x</text>${ea}${ha}${plot(60, 50, 560, 140, xs, E, 0, 6, -1, 1, "#378ADD", 2.5)}<text class="ts" x="60" y="30">blue: E_z (up), coral: H_y (into the page, drawn slanted). Wave moves right.</text><text class="ts" x="340" y="236" text-anchor="middle">n = ${n.toFixed(2)}: wavelength and speed both shrink by n</text>`);
  });
  $("n").oninput = () => {};
}},

/* from old ch2 L8 card 2 */
{s: "2. Differences", t: "Derivatives on a grid: why centered differences",
intu: String.raw`A computer stores the field only at grid points \(\Delta x\) apart. A derivative becomes a difference. The forward difference (value ahead minus value here) is the obvious choice, but it is lopsided and its error shrinks only in proportion to \(\Delta x\). The centered difference (value half a step ahead minus half a step behind) is symmetric, and its error shrinks as \(\Delta x^2\), much faster. The plot is computed for a sine wave: error against points per wavelength on log scales. The centered line falls twice as steeply. FDTD is built so that every derivative is centered.`,
eq: String.raw`<div class="eqnote">forward</div>\[ f'(x) \approx \frac{f(x + \Delta x) - f(x)}{\Delta x}, \qquad \text{error} \propto \Delta x \]<div class="eqnote">centered</div>\[ f'(x) \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error} \approx \frac{f'''\,\Delta x^2}{24} \]`,
sym: [[String.raw`\(\Delta x\)`, "grid spacing"], [String.raw`\(f', f'''\)`, "first and third derivatives"], ["points per wavelength", String.raw`\(\lambda/\Delta x\), the usual way to state resolution`]],
how: [String.raw`Taylor expand \(f(x \pm \Delta x/2) = f \pm (\Delta x/2)f' + (\Delta x^2/8)f'' \pm (\Delta x^3/48)f''' + \dots\)`, String.raw`Subtract: even terms cancel, leaving \(\Delta x\, f' + (\Delta x^3/24)f'''\).`, String.raw`Divide by \(\Delta x\): the error is \((\Delta x^2/24)f'''\), second order.`, String.raw`The forward difference keeps the \(f''\) term, so its error is \((\Delta x/2)f''\), first order.`],
say: "FDTD uses centered differences, which are second-order accurate: halving the grid step cuts the derivative error by four.",
num: String.raw`For \(\sin(kx)\), centered relative error = \((k\Delta x)^2/24\) at the worst point.<br>20 points per wavelength: \((2\pi/20)^2/24\) ≈ <b>0.41 %</b>. The same number reappears as the phase error bound in Lesson 10.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Points per wavelength", 4, 60, 1, 20) + '<div class="readout" id="ro"></div>';
  const errs = N => { const k = 2 * Math.PI, dx = 1 / N; let ef = 0, ec = 0; for (let x = 0; x < 1; x += 0.01) { const tr = k * Math.cos(k * x); ef = Math.max(ef, Math.abs((Math.sin(k * (x + dx)) - Math.sin(k * x)) / dx - tr) / k); ec = Math.max(ec, Math.abs((Math.sin(k * (x + dx / 2)) - Math.sin(k * (x - dx / 2))) / dx - tr) / k); } return [ef, ec]; };
  const Ns = range(4, 60, 57), E = Ns.map(errs);
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N; const [ef, ec] = errs(N);
    const X = v => 60 + (Math.log10(v) - Math.log10(4)) / (Math.log10(60) - Math.log10(4)) * 560, Y = v => 30 + (-Math.log10(v)) / 4 * 190;
    const pth = idx => { let d = ""; Ns.forEach((n, i) => { d += (i ? "L" : "M") + X(n).toFixed(1) + " " + Y(Math.max(E[i][idx], 1e-4)).toFixed(1); }); return d; };
    let grid = ""; [1, 0.1, 0.01, 0.001, 0.0001].forEach(v => grid += `<line x1="60" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-width="0.5"/><text class="ts" x="54" y="${Y(v) + 4}" text-anchor="end">${v * 100} %</text>`);
    fig.innerHTML = svg(260, `${grid}<path d="${pth(0)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><path d="${pth(1)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><line x1="${X(N)}" x2="${X(N)}" y1="30" y2="220" stroke="#EF9F27" stroke-width="2"/><text class="ts" x="340" y="244" text-anchor="middle">points per wavelength, 4 to 60 (log). Coral: forward, blue: centered</text>`);
    $("ro").innerHTML = `<div><span>forward error</span><b>${(ef * 100).toFixed(2)} %</b></div><div><span>centered error</span><b>${(ec * 100).toFixed(3)} %</b></div><div><span>(kΔx)²/24</span><b>${(Math.pow(2 * Math.PI / N, 2) / 24 * 100).toFixed(3)} %</b></div>`;
  };
  $("N").oninput = u; u();
}},

/* from old ch2 L8 card 3 */
{s: "3. Leapfrog", t: "The staggered grid and the leapfrog",
intu: String.raw`To make every difference centered, \(E\) and \(H\) are not stored at the same places. \(E\) sits on whole grid points, \(H\) halfway between them. In time, \(E\) is known at whole steps and \(H\) at half steps. Now look at the update: the new \(H\) at a half-point uses the two \(E\) values on either side, a centered difference in space, and its own old value half a step back, a centered difference in time. Then the new \(E\) uses the two freshly updated \(H\) values beside it. Step through the space-time diagram: each step, one row of values is computed from the row below.`,
eq: String.raw`\[ \begin{aligned} H_y\big|_{i+1/2}^{n+1/2} &= H_y\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\right) \\ E_z\big|_{i}^{n+1} &= E_z\big|_{i}^{n} + \frac{\Delta t}{\varepsilon \Delta x}\left(H_y\big|_{i+1/2}^{n+1/2} - H_y\big|_{i-1/2}^{n+1/2}\right) \end{aligned} \]`,
sym: [[String.raw`\(i,\ i + 1/2\)`, String.raw`\(E\) positions and \(H\) positions along \(x\)`], [String.raw`\(n,\ n + 1/2\)`, String.raw`\(E\) times and \(H\) times`], [String.raw`\(\Delta t\)`, "time step"], ["leapfrog", String.raw`\(H\) jumps over \(E\), then \(E\) jumps over \(H\)`]],
how: [String.raw`Write \(\partial H_y/\partial t = (1/\mu_0)\partial E_z/\partial x\) at the point \((i + 1/2, n)\).`, "Replace both derivatives by centered differences around that point.", String.raw`Solve for the newest value \(H_y\) at \(n + 1/2\). Do the same for \(E_z\) at \((i, n + 1/2)\).`, String.raw`Oskooi et al. describe exactly this alternating half-step update of \(E\) and \(H\) (their Secs. 2 and 3), and Dohlus and Zagorodnov write it as their Eq. (7).`],
say: String.raw`In FDTD, \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell in space and half a step in time, and updated alternately in a leapfrog. All derivatives are then centered and second-order accurate.`,
num: "Each update uses only the nearest neighbours, so one time step costs a fixed few operations per cell. That is why FDTD scales well to big 3D problems.",
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row"><button id="lb">Back</button><button id="ln">Next half step</button><span class="note" id="lt"></span></div>`;
  const u = () => {
    const X = i => 100 + i * 80, Y = s => 230 - s * 40;
    let s = "";
    for (let row = 0; row <= 4; row++) { const isE = row % 2 === 0; for (let i = 0; i < 6; i++) { const x = isE ? X(i) : X(i) + 40; if (!isE && i === 5) continue; const done = row <= k; s += isE ? `<circle cx="${x}" cy="${Y(row)}" r="7" fill="${done ? "#378ADD" : "none"}" stroke="#378ADD" stroke-width="1.5"/>` : `<rect x="${x - 7}" y="${Y(row) - 7}" width="14" height="14" fill="${done ? "#D85A30" : "none"}" stroke="#D85A30" stroke-width="1.5"/>`; } s += `<text class="ts" x="60" y="${Y(row) + 4}" text-anchor="end">${isE ? "E, n = " + row / 2 : "H, n = " + ((row - 1) / 2 + 0.5)}</text>`; }
    if (k >= 1 && k <= 4) { const isE = k % 2 === 0, i = 2, x = isE ? X(i) : X(i) + 40; const y = Y(k); const nb = isE ? [[X(i) - 40, Y(k - 1)], [X(i) + 40, Y(k - 1)]] : [[X(i), Y(k - 1)], [X(i + 1), Y(k - 1)]]; nb.forEach(([a, b]) => s += `<line x1="${a}" y1="${b - 8}" x2="${x}" y2="${y + 9}" stroke="#EF9F27" stroke-width="2" marker-end="url(#ar)"/>`); s += `<line x1="${x}" y1="${Y(k - 2) - 8}" x2="${x}" y2="${y + 9}" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#ar)"/>`; }
    fig.innerHTML = svg(270, `${s}<line x1="80" x2="620" y1="255" y2="255" stroke="var(--p)" marker-end="url(#ar)"/><text class="ts" x="624" y="259">x</text><text class="ts" x="340" y="20" text-anchor="middle">time runs upward. Filled: already computed. Orange: neighbours used. Purple dashed: own old value</text>`);
    $("lt").textContent = k === 0 ? "start: E known at n = 0" : k % 2 ? "update H from the E row below" : "update E from the H row below"; $("lb").disabled = k === 0; $("ln").disabled = k === 4;
  };
  $("lb").onclick = () => { k--; u(); }; $("ln").onclick = () => { k++; u(); }; u();
}},

/* from old ch2 L8 card 4 */
{s: "4. Run it", t: "A live 1D FDTD simulation",
intu: String.raw`This is a real FDTD simulation running in your browser with exactly the update equations of card 3, in units where \(\Delta x = 1\) and \(c = 1\). A short pulse starts at the left, travels right, and meets a dielectric slab (shaded). Watch three things. Part of the pulse reflects at the slab's front face, as Lesson 6 predicts. Inside the slab the pulse is squeezed and slows to \(c/n\). Several echoes leak out as the pulse bounces inside the slab: that is a Fabry-Perot resonator in the time domain. Change the slab permittivity and press restart.`,
eq: String.raw`<div class="eqnote">normalized units</div>\[ \Delta x = 1, \quad c = 1, \quad S = \frac{c\,\Delta t}{\Delta x} = 0.5 \]\[ H_i \leftarrow H_i + S\,(E_{i+1} - E_i), \qquad E_i \leftarrow E_i + \frac{S}{\varepsilon_i}\,(H_i - H_{i-1}) \]`,
sym: [[String.raw`\(S\)`, String.raw`Courant number, \(c\Delta t/\Delta x\) (Lesson 10)`], [String.raw`\(\varepsilon_i\)`, String.raw`relative permittivity at cell \(i\)`], ["soft source", String.raw`a value added to \(E\) at one cell each step, which lets waves pass through it`]],
how: [String.raw`Scale fields so \(\varepsilon_0 = \mu_0 = 1\), then the update coefficients become \(S\) and \(S/\varepsilon\).`, String.raw`Every step: update all \(H\), then all \(E\), then add the source.`, "The edges have absorbing layers so waves leave without reflecting (Lesson 11).", "Nothing else is needed: reflection, slowing and resonances all come out of the two update lines."],
say: String.raw`Reflection, refraction and resonances are not programmed into FDTD. They emerge from repeatedly applying the two update equations with the material's \(\varepsilon\) on the grid.`,
num: String.raw`Slab \(\varepsilon = 4\) (\(n = 2\)): front-face reflection \(((2 - 1)/(2 + 1))^2\) = <b>11 %</b> of the power, speed inside <b>\(c/2\)</b>.<br>\(\varepsilon = 12.25\) (\(n = 3.5\)): reflection <b>31 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "Slab permittivity ε", 1, 13, 0.25, 4) + `<div class="row"><button id="rs">Restart</button><button id="pp">Pause</button></div>`;
  let sim, run = true;
  const N = 600, a = 330, b = 400;
  const reset = () => { const eps = new Float64Array(N).fill(1); const e = +$("e").value; for (let i = a; i < b; i++) eps[i] = e; sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); };
  $("e").oninput = () => { $("ev").textContent = (+$("e").value).toFixed(2); };
  $("ev").textContent = "4.00";
  reset(); $("rs").onclick = reset; $("pp").onclick = () => { run = !run; $("pp").textContent = run ? "Pause" : "Play"; };
  anim(() => {
    if (run) for (let s = 0; s < 4; s++) { const t = sim.t; sim.step([80, Math.exp(-Math.pow((t - 60) / 18, 2))]); }
    const xs = range(0, N - 1, N), ys = Array.from(sim.ez);
    fig.innerHTML = svg(240, `<rect x="${40 + a / N * 600}" y="20" width="${(b - a) / N * 600}" height="190" fill="var(--blue-bg)"/><rect x="40" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><rect x="${40 + (N - 40) / N * 600}" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><line x1="40" x2="640" y1="115" y2="115" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 190, xs, ys, 0, N - 1, -1.1, 1.1, "#378ADD", 1.8)}<text class="ts" x="44" y="232">absorbing layer</text><text class="ts" x="${40 + (a + b) / 2 / N * 600}" y="232" text-anchor="middle">slab</text><text class="ts" x="636" y="232" text-anchor="end">step ${sim.t}</text>`);
  });
}},

/* from old ch2 L9 card 1 */
{s: "1. The Yee cell", t: "Where the six components live",
intu: String.raw`Rotate the cell. Blue arrows are \(\mathbf{E}\) components, each at the middle of an edge and pointing along it: four \(E_x\) on the edges parallel to \(x\), four \(E_y\), four \(E_z\). Coral arrows are \(\mathbf{H}\) components, each at the centre of a face and pointing out of it. Click an \(\mathbf{H}\) component: the four \(\mathbf{E}\) components circling its face light up. Those four are exactly what the curl of \(\mathbf{E}\) needs to update that \(\mathbf{H}\). Click an \(\mathbf{E}\) component: the \(\mathbf{H}\) components on the faces that share its edge light up (two in this cell, two more in the neighbouring cells).`,
eq: String.raw`\[ E_x(i+\tfrac{1}{2}, j, k), \quad E_y(i, j+\tfrac{1}{2}, k), \quad E_z(i, j, k+\tfrac{1}{2}) \]\[ H_x(i, j+\tfrac{1}{2}, k+\tfrac{1}{2}), \quad H_y(i+\tfrac{1}{2}, j, k+\tfrac{1}{2}), \quad H_z(i+\tfrac{1}{2}, j+\tfrac{1}{2}, k) \]`,
sym: [[String.raw`\((i, j, k)\)`, "integer grid indices, one per cell corner"], [String.raw`\(+\tfrac{1}{2}\)`, "half a cell along that axis"], ["edge centre", String.raw`where each \(\mathbf{E}\) component sits`], ["face centre", String.raw`where each \(\mathbf{H}\) component sits`]],
how: [String.raw`The curl of \(\mathbf{E}\) at a face centre needs the \(\mathbf{E}\) components tangential to that face, around its edges.`, String.raw`Placing \(\mathbf{E}\) on edges puts exactly four of them around each face.`, String.raw`Likewise the curl of \(\mathbf{H}\) along an edge needs the \(\mathbf{H}\) components on the four faces that meet at that edge.`, "So the curl equations become sums of four neighbours, all centered. This is Yee's arrangement."],
say: "In the Yee cell the electric field components sit at the centres of the cell edges and the magnetic components at the centres of the faces, so each component is surrounded by a loop of the other field, as the curl equations require.",
num: String.raw`One cell: <b>12</b> edge positions (\(\mathbf{E}\)) and <b>6</b> face positions (\(\mathbf{H}\)), but each is shared with neighbours, so a large grid has 3 \(\mathbf{E}\) and 3 \(\mathbf{H}\) values per cell.`,
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

/* from old ch2 L9 card 2 */
{s: "2. A loop on a face", t: "The curl is a loop: updating one H",
intu: String.raw`Take the bottom face of a cell. \(H_z\) sits at its centre. Around it, on the four edges, are two \(E_x\) and two \(E_y\). Faraday's law says the change of \(H_z\) is set by how much \(\mathbf{E}\) circulates around that loop. Going counterclockwise: \(E_x\) on the front edge counts positive, \(E_y\) on the right edge positive, \(E_x\) on the back edge negative, \(E_y\) on the left edge negative. Set the four edge values and see the circulation and the resulting change in \(H_z\). If all four point the same way around, \(H_z\) changes a lot. If they just point in one straight direction, the loop cancels and \(H_z\) does not change.`,
eq: String.raw`\[ \frac{\partial H_z}{\partial t} = -\frac{1}{\mu_0}\left(\frac{\partial E_y}{\partial x} - \frac{\partial E_x}{\partial y}\right) \]\[ H_z^{\,n+1/2} = H_z^{\,n-1/2} - \frac{\Delta t}{\mu_0}\left[\frac{E_y\big|_{i+1} - E_y\big|_{i}}{\Delta x} - \frac{E_x\big|_{j+1} - E_x\big|_{j}}{\Delta y}\right] \]`,
sym: [["circulation", String.raw`sum of \(\mathbf{E}\) along the loop, counterclockwise seen from \(+z\)`], [String.raw`\(E_y\big|_{i+1}, E_y\big|_{i}\)`, String.raw`\(E_y\) on the right and left edges of the face`], [String.raw`\(E_x\big|_{j+1}, E_x\big|_{j}\)`, String.raw`\(E_x\) on the back and front edges`]],
how: [String.raw`Stokes: the loop integral of \(\mathbf{E}\) around a face equals the curl's normal component times the face area.`, String.raw`Approximate each side of the loop by the \(\mathbf{E}\) value at its centre times its length. That is exactly where Yee puts \(\mathbf{E}\).`, String.raw`Divide by the area \(\Delta x\Delta y\) to get the curl at the face centre.`, String.raw`Faraday's law then gives the change of \(H_z\) over one time step.`],
say: "Each magnetic component is updated from the circulation of the four electric components around its face, which is a centered, second-order approximation of Faraday's law.",
num: String.raw`Uniform \(\mathbf{E}\) (all \(E_x = 1\), all \(E_y = 0\)): circulation <b>0</b>, \(H_z\) unchanged.<br>All four pointing around the loop with value 1: circulation <b>4</b> (in units of \(E\cdot\Delta\)), the largest change.`,
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

/* from old ch2 L9 card 3 */
{s: "3. The 2D grid", t: "2D: the grid splits into two independent sets",
intu: String.raw`If nothing changes along \(z\) (an infinitely long structure, or a 2D cross-section approximation), the six components split into two groups that never talk to each other. One group is \(E_z, H_x, H_y\) (called \(\mathrm{TM}_z\) in FDTD texts), the other is \(H_z, E_x, E_y\) (\(\mathrm{TE}_z\)). Each can be simulated alone. The grid for the first group is drawn here: \(E_z\) at the nodes, \(H_x\) between nodes vertically, \(H_y\) between nodes horizontally. Click a node or an \(H\) to see its update stencil. Careful: FDTD's \(\mathrm{TE}_z\) and \(\mathrm{TM}_z\) names refer to the \(z\) axis of the simulation, which is not the same as the TE-like and TM-like waveguide modes of Lessons 2 and 3.`,
eq: String.raw`\[ \mathrm{TM}_z:\quad \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon}\left(\frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y}\right) \]\[ \frac{\partial H_x}{\partial t} = -\frac{1}{\mu_0}\frac{\partial E_z}{\partial y}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0}\frac{\partial E_z}{\partial x} \]`,
sym: [[String.raw`\(\mathrm{TM}_z\)`, String.raw`the set \(E_z, H_x, H_y\) (\(\mathbf{E}\) normal to the simulation plane)`], [String.raw`\(\mathrm{TE}_z\)`, String.raw`the set \(H_z, E_x, E_y\)`], ["stencil", "the neighbours used in one update"]],
how: [String.raw`Set \(\partial/\partial z = 0\) in both curl equations.`, String.raw`The equations for \(E_z, H_x, H_y\) only involve each other, and so do those for \(H_z, E_x, E_y\).`, "So a 2D simulation needs only one of the two sets for a given polarization.", "The staggering is the 3D Yee cell seen from above."],
say: String.raw`In two dimensions the Yee scheme splits into two independent polarizations, \(\mathrm{TM}_z\) (\(E_z, H_x, H_y\)) and \(\mathrm{TE}_z\) (\(H_z, E_x, E_y\)). These names refer to the simulation axis, not to waveguide mode labels.`,
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

/* from old ch2 L9 card 4 */
{s: "4. Run 2D", t: "A live 2D FDTD simulation",
intu: String.raw`This runs the 2D \(\mathrm{TM}_z\) Yee updates of card 3 on a 200 × 120 grid. Choose a scene. In free space, a point source sends out circular waves. With a dielectric block, the waves slow down inside it, reflect from it and bend around it. With a slab waveguide (a high-index strip, \(n = 3.5\)), a source inside the strip launches light that stays trapped and travels along it, with only a little radiated at the start: total internal reflection, computed from nothing but the curl equations. The colours are the sign and size of \(E_z\). The frame is an absorbing layer.`,
eq: String.raw`\[ \begin{aligned} E_z &\leftarrow E_z + \frac{S}{\varepsilon}\Big[\left(H_y\big|_{i} - H_y\big|_{i-1}\right) - \left(H_x\big|_{j} - H_x\big|_{j-1}\right)\Big] \\ H_x &\leftarrow H_x - S\left(E_z\big|_{j+1} - E_z\big|_{j}\right) \\ H_y &\leftarrow H_y + S\left(E_z\big|_{i+1} - E_z\big|_{i}\right) \end{aligned} \]`,
sym: [[String.raw`\(S\)`, String.raw`Courant number, 0.5 here (below the 2D limit \(1/\sqrt{2} \approx 0.707\))`], [String.raw`\(\varepsilon\)`, "relative permittivity per cell"], ["source", "a sine added at one cell each step, smoothly switched on"]],
how: [String.raw`Same leapfrog as 1D, now with two \(H\) components.`, String.raw`\(\varepsilon\) is stored per cell, so any geometry can be drawn into the grid.`, "A graded absorbing frame damps waves before they reach the edge.", String.raw`Light inside the strip at \(N\) above 1 cannot leak out, the guiding of Lesson 1.`],
say: "A 2D FDTD simulation reproduces radiation, refraction and waveguiding directly from the discretized curl equations, given only the permittivity on the grid.",
num: String.raw`Wavelength in air \(\lambda_0 = 40\) cells. Inside the strip (\(n = 3.5\)) the wavelength is about 11 cells, close to the minimum for reasonable accuracy (Lesson 10).`,
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
}}

],
summary: String.raw`FDTD solves the two curl equations, \(\partial\mathbf{E}/\partial t = (1/\varepsilon)\nabla \times \mathbf{H}\) and \(\partial\mathbf{H}/\partial t = -(1/\mu_0)\nabla \times \mathbf{E}\), in the form of Oskooi et al. Derivatives become centered differences, which are second-order accurate. \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell and half a step and updated alternately in a leapfrog. Reflection, slowing and resonances all emerge from these local updates. The time step is limited by the Courant condition, \(S \le 1\) in 1D, and one run with a short pulse gives the whole spectrum through a Fourier transform.`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla \times \mathbf{E} \]`, "Maxwell curl equations (Ch. 2 Eq. 2.16)"],
[String.raw`\[ f' \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error } \frac{\Delta x^2}{24}\, f''' \]`, "Centered difference"],
[String.raw`\[ H\big|_{i+1/2}^{n+1/2} = H\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E\big|_{i+1}^{n} - E\big|_{i}^{n}\right) \]`, String.raw`\(H\) update`],
[String.raw`\[ E\big|_{i}^{n+1} = E\big|_{i}^{n} + \frac{\Delta t}{\varepsilon \Delta x}\left(H\big|_{i+1/2}^{n+1/2} - H\big|_{i-1/2}^{n+1/2}\right) \]`, String.raw`\(E\) update`],
[String.raw`\[ S = \frac{c\,\Delta t}{\Delta x} \le 1 \quad \text{(1D)} \]`, "Courant condition"],
[String.raw`\[ T(f) = \frac{|\tilde{E}_{\mathrm{slab}}|^2}{|\tilde{E}_{\mathrm{ref}}|^2} \]`, "Transmission from one pulse"]],
consts: String.raw`Simulations here use normalized units \(\Delta x = 1\), \(c = 1\).`,
sources: ["Oskooi et al., Comput. Phys. Commun. 181, 687 (2010), Eqs. (1) and (2), Secs. 2 and 3 (the MEEP FDTD package: Yee grid, leapfrog, broadband output)", "Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Eqs. (7) and (8) (Yee leapfrog and stability limit)"]
});
