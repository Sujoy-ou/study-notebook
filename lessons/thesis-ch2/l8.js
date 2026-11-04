/* Thesis Sec. 2.6, first half: Maxwell's curl equations (Eq. 2.16), central differences, the Yee cell (Fig. 2.7) and the leapfrog. */
const C2L8_sub = (a, b) => `${a}<tspan baseline-shift="sub" font-size="9">${b}</tspan>`;
addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l8", title: "FDTD 1: from Maxwell to the Yee cell", short: "8. FDTD 1, Maxwell to Yee",
big: String.raw`Every device result in the thesis comes from the finite-difference time-domain (FDTD) method in Tidy3D. FDTD solves Maxwell's two curl equations, Eq. 2.16, directly in time on a grid. The derivatives become central differences. For that to work, the field components are placed at staggered positions in the Yee cell: each electric component sits at the center of a loop of four magnetic components, and each magnetic component at the center of a loop of four electric components, which is exactly what is needed to evaluate the curls. The electric and magnetic fields are then updated in alternating half time steps, a leapfrog. This lesson builds that picture from the equations to a live 1D and 2D simulation.`,
bridge: String.raw`Thesis Sec. 2.6, first half, with Eq. 2.16 and the Yee cell of Fig. 2.7. The equations follow Taflove and Hagness 2016, Eqs. (1), (2), (4a), (4b), and the Yee algorithm of their Sec. 5. Card 5 is the board drawing of the Yee cell, built one edge and one face at a time. The simulations on this page run live in your browser in normalized units. How large the time step may be, and how fast light travels on a grid, are in Beyond the thesis B2.`,
cards: [
/* from old ch2 L8 card 1 */
{s: "1. Maxwell", t: "The two equations FDTD solves (Eq. 2.16)",
intu: String.raw`Only the two curl equations are needed. The first says a magnetic field that circulates around a line makes the electric field along that line grow. The second says a circulating electric field makes the magnetic field change, with a minus sign. A light wave is these two feeding each other: \(\mathbf{E}\) changes in space, which drives \(\mathbf{H}\), which changes in space, which drives \(\mathbf{E}\), and the pattern moves forward. Watch the plane wave: \(\mathbf{E}\) (blue, along \(z\)) and \(\mathbf{H}\) (coral, along \(y\), drawn in perspective) are perpendicular, in phase, and move together. A higher index slows and shortens the wave, and since \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\), \(\mathbf{H}\) grows relative to \(\mathbf{E}\) (here \(\mathbf{E}\) is kept fixed).`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0 \varepsilon_r} \nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0} \nabla \times \mathbf{E} \]<div class="eqref">Ch. 2 Eq. 2.16, Taflove and Hagness Eqs. (1), (2) with (4a), (4b)</div><div class="eqnote">linear, non-magnetic, no sources: \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\), \(\mathbf{B} = \mu_0\mathbf{H}\)</div><div class="eqnote">1D (wave along \(x\), \(\mathbf{E} = E_z\hat{\mathbf{z}}\), \(\mathbf{H} = H_y\hat{\mathbf{y}}\))</div>\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r} \frac{\partial H_y}{\partial x}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0} \frac{\partial E_z}{\partial x} \]`,
sym: [[String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"], [String.raw`\(\varepsilon_r\)`, String.raw`relative permittivity of the material, \(n^2\), stored cell by cell on the grid`], [String.raw`\(\nabla \times\)`, "curl: how much a field circulates around a point"], [String.raw`\(\mathbf{D}, \mathbf{B}\)`, "displacement field and magnetic flux density"], [String.raw`\(E_z, H_y\)`, String.raw`the two field components of a wave travelling along \(x\)`]],
how: [String.raw`Start from the two curl equations of Taflove and Hagness, their Eqs. (1) and (2). Without sources they read \(\partial\mathbf{D}/\partial t = \nabla \times \mathbf{H}\) (Ampère) and \(\partial\mathbf{B}/\partial t = -\nabla \times \mathbf{E}\) (Faraday).`, String.raw`For a linear, non-magnetic material, \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\) and \(\mathbf{B} = \mu_0\mathbf{H}\), their Eqs. (4a) and (4b). The thesis treats both GaAs, with the real index \(n = 3.492\), and air this way.`, String.raw`Substitute and divide by \(\varepsilon_0\varepsilon_r\) and by \(\mu_0\). That is Eq. 2.16, the form the thesis uses.`, String.raw`For fields that depend only on \(x\), with \(\mathbf{E}\) along \(z\) and \(\mathbf{H}\) along \(y\), each curl keeps a single \(x\) derivative, which gives the 1D pair.`],
say: String.raw`FDTD solves the two Maxwell curl equations directly in the time domain. For a linear, non-magnetic material without sources they are \(\partial\mathbf{E}/\partial t = (1/\varepsilon_0\varepsilon_r)\nabla \times \mathbf{H}\) and \(\partial\mathbf{H}/\partial t = -(1/\mu_0)\nabla \times \mathbf{E}\).`,
num: String.raw`Speed in a material: \(c/n\). For \(n = 3.5\) the wave travels at <b>\(0.29c\)</b>.<br>Ratio \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\) with \(\eta_0\) = <b>377 Ω</b>, so <b>108 Ω</b> in GaAs.`,
note: String.raw`If asked about the other two Maxwell equations: the divergence conditions \(\nabla\cdot\mathbf{D} = 0\) and \(\nabla\cdot\mathbf{B} = 0\) are not solved separately. The Yee arrangement keeps them satisfied as the fields are updated, provided they hold at the start.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n", 1, 3.5, 0.01, 1);
  const s = C2L8_sub;
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const n = $("n") ? +$("n").value : 1; if ($("nv")) $("nv").textContent = n.toFixed(2);
    const xs = range(0, 6, 200), k = 2 * Math.PI * n / 2, w = 2 * Math.PI * 0.4;
    const E = xs.map(x => Math.sin(k * x - w * t)), H = xs.map(x => -Math.sin(k * x - w * t) * n / 3.5);
    let ea = "", ha = ""; for (let i = 0; i < 200; i += 8) { const X = 60 + xs[i] / 6 * 560; ea += `<line x1="${X}" y1="120" x2="${X}" y2="${120 - E[i] * 70}" stroke="#378ADD" stroke-width="1.2"/>`; ha += `<line x1="${X}" y1="120" x2="${X + H[i] * 40}" y2="${120 + H[i] * 40}" stroke="#D85A30" stroke-width="1.2"/>`; }
    fig.innerHTML = svg(250, `<line x1="50" x2="630" y1="120" y2="120" stroke="var(--p)" marker-end="url(#ar)"/><text class="ts" x="634" y="124">x</text>${ea}${ha}${plot(60, 50, 560, 140, xs, E, 0, 6, -1, 1, "#378ADD", 2.5)}<text class="ts" x="60" y="30">blue: ${s("E", "z")} (up). Coral: ${s("H", "y")}, drawn in perspective. The wave moves right.</text><text class="ts" x="340" y="236" text-anchor="middle">n = ${n.toFixed(2)}: wavelength and speed shrink by n, H grows by n relative to E</text>`);
  });
}},

/* from old ch2 L8 card 2 */
{s: "2. Differences", t: "Derivatives on a grid: why central differences",
intu: String.raw`A computer stores the field only at grid points \(\Delta x\) apart, so a derivative becomes a difference. The forward difference (value ahead minus value here) is the obvious choice, but it is lopsided and its error shrinks only in proportion to \(\Delta x\). The central difference (value half a step ahead minus half a step behind) is symmetric, and its error shrinks as \(\Delta x^2\), much faster. The plot is computed for a sine wave: error against points per wavelength on log scales. The central line falls twice as steeply. This is why the thesis says the derivatives in Eq. 2.16 become central differences, and why the Yee cell puts each field half a cell from the other.`,
eq: String.raw`<div class="eqnote">forward</div>\[ f'(x) \approx \frac{f(x + \Delta x) - f(x)}{\Delta x}, \qquad \text{error} \propto \Delta x \]<div class="eqnote">central</div>\[ f'(x) \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error} \approx \frac{f'''\,\Delta x^2}{24} \]`,
sym: [[String.raw`\(\Delta x\)`, "grid spacing"], [String.raw`\(f', f'''\)`, "first and third derivatives"], ["points per wavelength", String.raw`\(\lambda/\Delta x\), the usual way to state resolution (Lesson 9, card 6)`]],
how: [String.raw`Taylor expand \(f(x \pm \Delta x/2) = f \pm (\Delta x/2)f' + (\Delta x^2/8)f'' \pm (\Delta x^3/48)f''' + \dots\)`, String.raw`Subtract: the even terms cancel, leaving \(\Delta x\, f' + (\Delta x^3/24)f'''\).`, String.raw`Divide by \(\Delta x\): the error is \((\Delta x^2/24)f'''\), second order.`, String.raw`The forward difference keeps the \(f''\) term, so its error is \((\Delta x/2)f''\), first order.`],
say: "FDTD uses central differences, which are second-order accurate: halving the grid step cuts the derivative error by four.",
num: String.raw`For \(\sin(kx)\), the central relative error is \((k\Delta x)^2/24\) at the worst point.<br>20 points per wavelength: \((2\pi/20)^2/24\) ≈ <b>0.41 %</b>. 30 points: <b>0.18 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Points per wavelength", 4, 60, 1, 20) + '<div class="readout" id="ro"></div>';
  const errs = N => { const k = 2 * Math.PI, dx = 1 / N; let ef = 0, ec = 0; for (let x = 0; x < 1; x += 0.01) { const tr = k * Math.cos(k * x); ef = Math.max(ef, Math.abs((Math.sin(k * (x + dx)) - Math.sin(k * x)) / dx - tr) / k); ec = Math.max(ec, Math.abs((Math.sin(k * (x + dx / 2)) - Math.sin(k * (x - dx / 2))) / dx - tr) / k); } return [ef, ec]; };
  const Ns = range(4, 60, 57), E = Ns.map(errs);
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N; const [ef, ec] = errs(N);
    const X = v => 60 + (Math.log10(v) - Math.log10(4)) / (Math.log10(60) - Math.log10(4)) * 560, Y = v => 30 + (-Math.log10(v)) / 4 * 190;
    const pth = idx => { let d = ""; Ns.forEach((n, i) => { d += (i ? "L" : "M") + X(n).toFixed(1) + " " + Y(Math.max(E[i][idx], 1e-4)).toFixed(1); }); return d; };
    let grid = ""; [1, 0.1, 0.01, 0.001, 0.0001].forEach(v => grid += `<line x1="60" x2="620" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--b)" stroke-width="0.5"/><text class="ts" x="54" y="${Y(v) + 4}" text-anchor="end">${v * 100} %</text>`);
    fig.innerHTML = svg(260, `${grid}<path d="${pth(0)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><path d="${pth(1)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><line x1="${X(N)}" x2="${X(N)}" y1="30" y2="220" stroke="#EF9F27" stroke-width="2"/><text class="ts" x="340" y="244" text-anchor="middle">points per wavelength, 4 to 60 (log). Coral: forward, blue: central</text>`);
    $("ro").innerHTML = `<div><span>forward error</span><b>${(ef * 100).toFixed(2)} %</b></div><div><span>central error</span><b>${(ec * 100).toFixed(3)} %</b></div><div><span>(kΔx)²/24</span><b>${(Math.pow(2 * Math.PI / N, 2) / 24 * 100).toFixed(3)} %</b></div>`;
  };
  $("N").oninput = u; u();
}},

/* from old ch2 L8 card 3 */
{s: "3. Leapfrog", t: "The staggered grid and the leapfrog",
intu: String.raw`To make every difference central, \(E\) and \(H\) are not stored at the same places. \(E\) sits on whole grid points, \(H\) halfway between them. In time, \(E\) is known at whole steps and \(H\) at half steps. Now look at the update: the new \(H\) at a half-point uses the two \(E\) values on either side, a central difference in space, and its own old value one step back, a central difference in time. Then the new \(E\) uses the two freshly updated \(H\) values beside it. Step through the space-time diagram: each step, one row of values is computed from the row below. This is the 1D version of "updated in alternating half time steps" in Sec. 2.6.`,
eq: String.raw`\[ \begin{aligned} H_y\big|_{i+1/2}^{n+1/2} &= H_y\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E_z\big|_{i+1}^{n} - E_z\big|_{i}^{n}\right) \\ E_z\big|_{i}^{n+1} &= E_z\big|_{i}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r \Delta x}\left(H_y\big|_{i+1/2}^{n+1/2} - H_y\big|_{i-1/2}^{n+1/2}\right) \end{aligned} \]`,
sym: [[String.raw`\(i,\ i + 1/2\)`, String.raw`\(E\) positions and \(H\) positions along \(x\)`], [String.raw`\(n,\ n + 1/2\)`, String.raw`\(E\) times and \(H\) times`], [String.raw`\(\Delta t\)`, "time step"], ["leapfrog", String.raw`\(H\) jumps over \(E\), then \(E\) jumps over \(H\)`]],
how: [String.raw`Write \(\partial H_y/\partial t = (1/\mu_0)\partial E_z/\partial x\) at the point \((i + 1/2, n)\).`, "Replace both derivatives by central differences around that point.", String.raw`Solve for the newest value, \(H_y\) at \(n + 1/2\). Do the same for \(E_z\) at \((i, n + 1/2)\).`, String.raw`Taflove and Hagness describe this alternating half-step update of \(\mathbf{E}\) and \(\mathbf{H}\) as the Yee algorithm, their Sec. 5.`],
say: String.raw`In FDTD, \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell in space and half a step in time, and updated alternately in a leapfrog. All derivatives are then central and second-order accurate.`,
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
{s: "4. Run 1D", t: "A live 1D FDTD simulation",
intu: String.raw`This is a real FDTD simulation running in your browser with exactly the update equations of card 3, in units where \(\Delta x = 1\) and \(c = 1\). A short pulse starts at the left, travels right, and meets a dielectric slab (shaded). Watch three things. Part of the pulse reflects at the slab's front face, as the Fresnel coefficient of Lesson 5 (Eq. 2.4) predicts. Inside the slab the pulse is squeezed and slows to \(c/n\). Several echoes leak out as the pulse bounces inside the slab: a Fabry-Perot resonator seen in the time domain. Change the slab permittivity and press Restart.`,
eq: String.raw`<div class="eqnote">normalized units</div>\[ \Delta x = 1, \quad c = 1, \quad S = \frac{c\,\Delta t}{\Delta x} = 0.5 \]\[ H_i \leftarrow H_i + S\,(E_{i+1} - E_i), \qquad E_i \leftarrow E_i + \frac{S}{\varepsilon_{r,i}}\,(H_i - H_{i-1}) \]`,
sym: [[String.raw`\(S\)`, String.raw`time step in units of \(\Delta x/c\). It cannot be made too large (Beyond the thesis B2), 0.5 is safe`], [String.raw`\(\varepsilon_{r,i}\)`, String.raw`relative permittivity at cell \(i\)`], ["soft source", String.raw`a value added to \(E\) at one cell each step, which lets waves pass through it`]],
how: [String.raw`Scale the fields so that \(\varepsilon_0 = \mu_0 = 1\). The update coefficients become \(S\) and \(S/\varepsilon_r\).`, String.raw`Every step: update all \(H\), then all \(E\), then add the source.`, "The ends have absorbing layers so waves leave without reflecting (Lesson 9, card 3).", "Nothing else is needed: reflection, slowing and resonances all come out of the two update lines."],
say: String.raw`Reflection, refraction and resonances are not programmed into FDTD. They emerge from repeatedly applying the two update equations with the material's \(\varepsilon_r\) on the grid.`,
num: String.raw`Slab \(\varepsilon_r = 4\) (\(n = 2\)): front-face reflection \(((2 - 1)/(2 + 1))^2\) = <b>11 %</b> of the power, speed inside <b>\(c/2\)</b>.<br>\(\varepsilon_r = 12.25\) (\(n = 3.5\)): reflection <b>31 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "Slab permittivity ε<sub>r</sub>", 1, 13, 0.25, 4) + `<div class="row"><button id="rs">Restart</button><button id="pp">Pause</button></div>`;
  let sim, run = true;
  const N = 600, a = 330, b = 400;
  const reset = () => { const eps = new Float64Array(N).fill(1); const e = +$("e").value; for (let i = a; i < b; i++) eps[i] = e; sim = new C2.FDTD1D(N, 0.5, eps, { pml: 40, smax: 0.6, wall: "pec" }); };
  $("e").oninput = () => { $("ev").textContent = (+$("e").value).toFixed(2); };
  $("ev").textContent = "4.00";
  reset(); $("rs").onclick = reset; $("pp").onclick = () => { run = !run; $("pp").textContent = run ? "Pause" : "Play"; };
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (run) for (let s = 0; s < 4; s++) { const t = sim.t; sim.step([80, Math.exp(-Math.pow((t - 60) / 18, 2))]); }
    const xs = range(0, N - 1, N), ys = Array.from(sim.ez);
    fig.innerHTML = svg(240, `<rect x="${40 + a / N * 600}" y="20" width="${(b - a) / N * 600}" height="190" fill="var(--blue-bg)"/><rect x="40" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><rect x="${40 + (N - 40) / N * 600}" y="20" width="${40 / N * 600}" height="190" fill="#888780" opacity="0.15"/><line x1="40" x2="640" y1="115" y2="115" stroke="var(--p)" stroke-width="0.5"/>${plot(40, 20, 600, 190, xs, ys, 0, N - 1, -1.1, 1.1, "#378ADD", 1.8)}<text class="ts" x="44" y="232">absorbing layer</text><text class="ts" x="${40 + (a + b) / 2 / N * 600}" y="232" text-anchor="middle">slab</text><text class="ts" x="636" y="232" text-anchor="end">step ${sim.t}</text>`);
  });
}},

/* NEW: board drawing of the Yee cell, thesis Fig. 2.7 */
{s: "5. Draw the Yee cell", t: "Draw the Yee cell on the board, edge by edge",
intu: String.raw`This is the drawing to make on the board, in the order to make it. Press Play, or step with Back and Next, and rotate the cube with the view buttons. First the cell, one edge at a time. Then the electric components, blue, one at the middle of each of the 12 edges and pointing along it: four \(E_x\), four \(E_y\), four \(E_z\). Then the magnetic components, rust, one at the center of each of the 6 faces and pointing normal to it. Components on hidden edges and faces are drawn lighter, as in thesis Fig. 2.7. Steps 8 and 9 show why this arrangement is chosen: each magnetic component sits at the center of a loop of four electric components, and each electric component at the center of a loop of four magnetic components, which is what is needed to evaluate the curls. Step 10 is the timing: E and H are updated in alternating half time steps.`,
eq: String.raw`\[ \frac{\partial H_z}{\partial t} = -\frac{1}{\mu_0}\left(\frac{\partial E_y}{\partial x} - \frac{\partial E_x}{\partial y}\right) \qquad \text{loop of four } E \text{ around a face} \]\[ \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y}\right) \qquad \text{loop of four } H \text{ around an edge} \]<div class="eqref">\(z\) components of Ch. 2 Eq. 2.16, Fig. 2.7, Taflove and Hagness Sec. 5</div>`,
sym: [[String.raw`\(E_x, E_y, E_z\)`, "on the edge centers, pointing along the edge (blue)"], [String.raw`\(H_x, H_y, H_z\)`, "on the face centers, pointing normal to the face (rust)"], ["loop of four", "the four components of the other field that circle a component, at half a cell from it"], ["dual arrangement", String.raw`the same drawing with \(\mathbf{E}\) and \(\mathbf{H}\) exchanged, which is equivalent`]],
how: [String.raw`Draw the cube \(\Delta x\) by \(\Delta y\) by \(\Delta z\), mark the corner \((i, j, k)\) and the axes.`, String.raw`Put \(E_x\), \(E_y\), \(E_z\) at the middle of the edges along \(x\), \(y\), \(z\): four of each.`, String.raw`Put \(H_x\), \(H_y\), \(H_z\) at the centers of the faces normal to \(x\), \(y\), \(z\): two of each.`, String.raw`Point at the top face: \(H_z\) is circled by two \(E_x\) and two \(E_y\). Their circulation divided by the face area is \((\nabla \times \mathbf{E})_z\), so Faraday's law updates \(H_z\).`, String.raw`Point at a vertical edge: \(E_z\) is circled by two \(H_x\) and two \(H_y\), two in this cell and two in its neighbours. Their circulation is \((\nabla \times \mathbf{H})_z\), so Ampère's law updates \(E_z\).`, String.raw`Every difference in these loops spans one cell with the updated component in the middle, so each is a central difference.`],
say: "In the Yee cell the electric components sit at the centers of the cell edges and point along them, and the magnetic components sit at the centers of the faces and point normal to them. Each electric component is then at the center of a loop of four magnetic components and each magnetic component at the center of a loop of four electric components, which is what the curls need, and the two fields are updated in alternating half time steps.",
num: String.raw`One cell: <b>12</b> edge positions for \(\mathbf{E}\) and <b>6</b> face positions for \(\mathbf{H}\). Each is shared with neighbouring cells, so a large grid stores <b>3</b> \(\mathbf{E}\) and <b>3</b> \(\mathbf{H}\) values per cell.<br>Every loop has <b>4</b> members, each half a cell from the center.`,
note: String.raw`A common question: why not put all six components at the cell corners? Then a curl would need differences across two cells, a central difference of width \(2\Delta x\), which is less accurate and lets a grid-scale zigzag pattern go unseen. Staggering by half a cell gives the most compact central difference.`,
r(fig, ctl) {
  const BL = "#378ADD", RU = "#D85A30", AM = "#BA7517", s = C2L8_sub;
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let step = 0, playing = !reduce, t0 = 0, tNow = 0, az = -32, el = 24, azT = -32, elT = 24;
  ctl.innerHTML = `<div class="row"><button id="yb">Back</button><button id="yp">${playing ? "Pause" : "Play"}</button><button id="yn">Next step</button><span class="note" id="ys" style="margin-left:6px"></span></div><div class="row"><label>View</label><button data-v="l">◀ rotate</button><button data-v="r">rotate ▶</button><button data-v="u">from higher</button><button data-v="d">from lower</button><button data-v="0">reset view</button></div>`;
  fig.innerHTML = `<div id="ysv"></div><p class="note" id="yc" style="font-size:14.5px;color:var(--fg);min-height:66px"></p>`;
  const E = [], H = [];
  [0, 1].forEach(j => [0, 1].forEach(k => E.push({ a: 0, p: [0.5, j, k] })));
  [0, 1].forEach(i => [0, 1].forEach(k => E.push({ a: 1, p: [i, 0.5, k] })));
  [0, 1].forEach(i => [0, 1].forEach(j => E.push({ a: 2, p: [i, j, 0.5] })));
  [0, 1, 2].forEach(a => [0, 1].forEach(v => { const p = [0.5, 0.5, 0.5]; p[a] = v; H.push({ a, p }); }));
  const ORDER = [0, 6, 2, 4, 1, 7, 3, 5, 8, 10, 11, 9];
  const LOOP_E = [1, 7, 3, 5];            // E around the top face (z = 1), counterclockwise from +z
  const EZ = 10;                          // E_z on the edge x = 1, y = 0
  const GH = [{ a: 1, p: [1.5, 0, 0.5] }, { a: 0, p: [1, -0.5, 0.5] }]; // H in the neighbouring cells
  const LOOP_H = [H[2], H[1]];            // H_y on y = 0 and H_x on x = 1, inside this cell
  const DUR = [5, 3.2, 3.2, 3.2, 3, 3, 3, 5, 5.5, 6];
  const CAP = [
    `Step 1. Draw one cell of the grid, a cube Δx by Δy by Δz, edge by edge, and mark its corner (i, j, k). The fields will sit on the edges and faces of this cube, not on its corners.`,
    `Step 2. E<sub>x</sub>: an arrow at the middle of each of the four edges that run along x, pointing along the edge. Its position is (i + ½, j, k) and the three copies.`,
    `Step 3. E<sub>y</sub> on the four edges along y, at (i, j + ½, k).`,
    `Step 4. E<sub>z</sub> on the four edges along z, at (i, j, k + ½). All 12 edges now carry an electric component.`,
    `Step 5. H<sub>x</sub> at the centers of the two faces normal to x, pointing normal to the face, at (i, j + ½, k + ½).`,
    `Step 6. H<sub>y</sub> at the centers of the two faces normal to y, at (i + ½, j, k + ½).`,
    `Step 7. H<sub>z</sub> at the centers of the top and bottom faces, at (i + ½, j + ½, k). All 6 faces now carry a magnetic component. Exchanging E and H gives the dual arrangement, which works the same way.`,
    `Step 8. Each magnetic component sits at the center of a loop of four electric components. Around the top face: E<sub>x</sub>, E<sub>y</sub>, then back along E<sub>x</sub> and E<sub>y</sub>. That circulation is (∇ × E)<sub>z</sub>, which updates H<sub>z</sub>.`,
    `Step 9. Each electric component sits at the center of a loop of four magnetic components. This E<sub>z</sub> is circled by two H in this cell and two in the neighbouring cells (dashed faces). Their circulation is (∇ × H)<sub>z</sub>, which updates E<sub>z</sub>.`,
    `Step 10. Leapfrog in time: all E are updated at whole steps from their H loops, then all H half a step later from their E loops, alternating (Taflove and Hagness Sec. 5).`];
  const ang = () => [az * Math.PI / 180, el * Math.PI / 180];
  const P = (x, y, z) => { const [a, e] = ang(), X = x - 0.5, Y = y - 0.5, Z = z - 0.5; const xr = X * Math.cos(a) - Y * Math.sin(a), yr = X * Math.sin(a) + Y * Math.cos(a); return [235 + 140 * xr, 205 - 140 * (Z * Math.cos(e) + yr * Math.sin(e))]; };
  const D = () => { const [a, e] = ang(); return [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), -Math.sin(e)]; };
  const faceVis = (ax, v) => (v ? 1 : -1) * D()[ax] < 0;
  const edgeVis = it => { const o = [0, 1, 2].filter(b => b !== it.a); return faceVis(o[0], it.p[o[0]]) || faceVis(o[1], it.p[o[1]]); };
  const ln = (p, q, col, w, op, dash) => { const A = P(...p), B = P(...q); return `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`; };
  const arr = (it, col, w, op) => { const d = [0, 0, 0]; d[it.a] = 0.17; const A = P(it.p[0] - d[0], it.p[1] - d[1], it.p[2] - d[2]), B = P(it.p[0] + d[0], it.p[1] + d[1], it.p[2] + d[2]); return `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" opacity="${op}" marker-end="url(#ar)"/>`; };
  const face = (it, fill, op, dash) => { const o = [0, 1, 2].filter(b => b !== it.a), c = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map(([u, v]) => { const q = it.p.slice(); q[o[0]] += u; q[o[1]] += v; return P(...q); }); return `<polygon points="${c.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ")}" fill="${fill}" fill-opacity="${op}" stroke="${dash ? RU : "none"}" stroke-width="1" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
  const loop = (c, r, f, col) => { let d = ""; const n = 40; for (let i = 0; i <= n; i++) { const ph = -Math.PI / 2 + 2 * Math.PI * 0.9 * f * i / n, q = P(c[0] + r * Math.cos(ph), c[1] + r * Math.sin(ph), c[2]); d += (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#ar)"/>`; };
  const draw = () => {
    if (reduce) { az = azT; el = elT; } else { az += (azT - az) * 0.15; el += (elT - el) * 0.15; }
    const tt = reduce ? 1e9 : tNow - t0;
    let g = "";
    // cube edges, edge by edge in step 1
    ORDER.forEach((ix, n) => { if (step === 0 && tt < 0.35 * n) return; const it = E[ix], d = [0, 0, 0]; d[it.a] = 0.5; const vis = edgeVis(it); g += ln([it.p[0] - d[0], it.p[1] - d[1], it.p[2] - d[2]], [it.p[0] + d[0], it.p[1] + d[1], it.p[2] + d[2]], "var(--t)", vis ? 1.4 : 1, vis ? 0.85 : 0.35, vis ? "" : "4 3"); });
    // shaded faces of the H set being introduced, and the faces used by the loops
    if (step >= 4 && step <= 6) H.filter(h => h.a === step - 4).forEach(h => g += face(h, RU, faceVis(h.a, h.p[h.a]) ? 0.12 : 0.05));
    if (step === 7) g += face(H[5], RU, 0.1);
    if (step === 8) { LOOP_H.forEach(h => g += face(h, RU, 0.1)); GH.forEach(h => g += face(h, RU, 0.06, "4 3")); }
    const leap = step === 9 ? Math.floor(tt / 1.3) % 2 : -1;
    // E arrows
    E.forEach((it, ix) => {
      if (step < it.a + 1) return;
      const nth = E.filter(e => e.a === it.a).indexOf(it);
      if (step === it.a + 1 && tt < 0.5 * nth) return;
      let op = edgeVis(it) ? 1 : 0.35, w = 2.6;
      if (step >= 1 && step <= 3 && it.a !== step - 1) op *= 0.45;
      if (step === 7) { if (LOOP_E.includes(ix)) w = 3.6; else op *= 0.2; }
      if (step === 8) { if (ix === EZ) w = 3.8; else op *= 0.2; }
      if (leap === 1) op *= 0.25;
      g += arr(it, BL, w, op);
    });
    // H arrows
    H.forEach(h => {
      if (step < h.a + 4) return;
      const nth = H.filter(q => q.a === h.a).indexOf(h);
      if (step === h.a + 4 && tt < 0.6 * nth) return;
      let op = faceVis(h.a, h.p[h.a]) ? 1 : 0.35, w = 2.6;
      if (step >= 4 && step <= 6 && h.a !== step - 4) op *= 0.45;
      if (step === 7) { if (h === H[5]) w = 3.8; else op *= 0.2; }
      if (step === 8) { if (LOOP_H.includes(h)) w = 3.6; else op *= 0.2; }
      if (leap === 0) op *= 0.25;
      g += arr(h, RU, w, op);
    });
    if (step === 8) GH.forEach(h => g += arr(h, RU, 3.6, 1));
    if (step === 7) g += loop([0.5, 0.5, 1], 0.33, Math.min(1, tt / 1.5), AM);
    if (step === 8) g += loop([1, 0, 0.5], 0.5, Math.min(1, tt / 1.8), AM);
    // corner label and axes
    const o = P(0, 0, 0); g += `<circle cx="${o[0].toFixed(1)}" cy="${o[1].toFixed(1)}" r="3" fill="var(--t)"/><text class="ts" x="${(o[0] - 8).toFixed(1)}" y="${(o[1] + 16).toFixed(1)}" text-anchor="end">(i, j, k)</text>`;
    const ax0 = [60, 370], dir = a => { const q = [0, 0, 0]; q[a] = 1; const A = P(0, 0, 0), B = P(...q); return [(B[0] - A[0]) / 140 * 34, (B[1] - A[1]) / 140 * 34]; };
    ["x", "y", "z"].forEach((nm, a) => { const [dx, dy] = dir(a); g += arrow(ax0[0], ax0[1], ax0[0] + dx, ax0[1] + dy, "var(--t)", 1.2) + `<text class="ts" x="${(ax0[0] + dx * 1.35).toFixed(1)}" y="${(ax0[1] + dy * 1.35 + 4).toFixed(1)}" text-anchor="middle">${nm}</text>`; });
    // legend
    const LX = 462; let L = `<text class="th" x="${LX}" y="40" style="fill:${BL}">On the 12 edges: E</text>`;
    ["x", "y", "z"].forEach((nm, a) => { if (step >= a + 1) L += `<text class="ts" x="${LX}" y="${62 + a * 20}"${step === a + 1 ? ` style="fill:var(--fg);font-weight:600"` : ""}>${s("E", nm)} on the 4 edges along ${nm}</text>`; });
    L += `<text class="th" x="${LX}" y="140" style="fill:${RU}">On the 6 faces: H</text>`;
    ["x", "y", "z"].forEach((nm, a) => { if (step >= a + 4) L += `<text class="ts" x="${LX}" y="${162 + a * 20}"${step === a + 4 ? ` style="fill:var(--fg);font-weight:600"` : ""}>${s("H", nm)} on the 2 faces normal to ${nm}</text>`; });
    if (step === 7) L += `<text class="th" x="${LX}" y="246" style="fill:${AM}">loop of 4 E around a face</text><text class="ts" x="${LX}" y="266">circulation = (∇ × E)${"<tspan baseline-shift='sub' font-size='9'>z</tspan>"}</text><text class="ts" x="${LX}" y="284">updates ${s("H", "z")} at its center</text>`;
    if (step === 8) L += `<text class="th" x="${LX}" y="246" style="fill:${AM}">loop of 4 H around an edge</text><text class="ts" x="${LX}" y="266">circulation = (∇ × H)${"<tspan baseline-shift='sub' font-size='9'>z</tspan>"}</text><text class="ts" x="${LX}" y="284">updates ${s("E", "z")} at its center</text><text class="ts" x="${LX}" y="302">2 H here, 2 in the next cells</text>`;
    if (step === 9) {
      const TX = v => LX + 10 + v * 120, ty = 290, mk = (tt / 1.3) % 2;
      L += `<text class="th" x="${LX}" y="246">time</text><line x1="${LX}" x2="${LX + 200}" y1="${ty}" y2="${ty}" stroke="var(--t)" marker-end="url(#ar)"/>`;
      [[0, "n", BL], [0.5, "n + ½", RU], [1, "n + 1", BL], [1.5, "n + 3/2", RU]].forEach(([v, lb, col]) => L += `<line x1="${TX(v * 0.8)}" x2="${TX(v * 0.8)}" y1="${ty - 6}" y2="${ty + 6}" stroke="${col}" stroke-width="2"/><text class="ts" x="${TX(v * 0.8)}" y="${v % 1 ? ty - 12 : ty + 20}" text-anchor="middle" style="fill:${col}">${lb}</text>`);
      L += `<circle cx="${TX(Math.floor(mk) * 0.4 + (Math.floor(tt / 2.6) % 2) * 0.8)}" cy="${ty}" r="6" fill="${leap === 0 ? BL : RU}"/><text class="ts" x="${LX}" y="${ty + 44}">${leap === 0 ? "now: update all E" : "now: update all H"}</text><text class="ts" x="${LX}" y="${ty + 62}">${leap === 0 ? "from their H loops" : "from their E loops"}</text>`;
    }
    $("ysv").innerHTML = svg(410, g + L);
    $("yc").innerHTML = CAP[step];
    $("ys").textContent = `step ${step + 1} of 10`;
    $("yb").disabled = step === 0; $("yn").disabled = step === 9;
  };
  const go = k => { step = Math.max(0, Math.min(9, k)); t0 = tNow; playing = false; $("yp").textContent = "Play"; draw(); };
  $("yb").onclick = () => go(step - 1); $("yn").onclick = () => go(step + 1);
  $("yp").onclick = () => { playing = !playing; if (playing && step === 9) step = 0; t0 = tNow; $("yp").textContent = playing ? "Pause" : "Play"; draw(); };
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { const v = b.dataset.v; if (v === "l") azT -= 25; if (v === "r") azT += 25; if (v === "u") elT = Math.min(40, elT + 12); if (v === "d") elT = Math.max(0, elT - 12); if (v === "0") { azT = -32; elT = 24; } draw(); });
  anim(t => {
    if (!fig.isConnected || !$("ysv")) { stopAnim(); return; }
    tNow = t;
    if (playing && tNow - t0 > DUR[step]) { if (step < 9) { step++; t0 = tNow; } else { playing = false; $("yp").textContent = "Play"; } }
    draw();
  });
}},

/* from old ch2 L9 card 1 */
{s: "6. The Yee cell", t: "Click a component and see its loop",
intu: String.raw`The finished drawing of card 5, now to explore. Blue arrows are \(\mathbf{E}\) components, each at the middle of an edge and pointing along it. Coral arrows are \(\mathbf{H}\) components, each at the center of a face and pointing normal to it. Click an \(\mathbf{H}\) component: the four \(\mathbf{E}\) components circling its face light up. Each magnetic component sits at the center of this loop of four electric components, which is exactly what the curl of \(\mathbf{E}\) needs to update it. Click an \(\mathbf{E}\) component: the \(\mathbf{H}\) components on the faces that share its edge light up, two in this cell and two more in the neighbouring cells, so each electric component also sits at the center of a loop of four magnetic components. The two fields are then updated in alternating half time steps.`,
eq: String.raw`\[ E_x(i+\tfrac{1}{2}, j, k), \quad E_y(i, j+\tfrac{1}{2}, k), \quad E_z(i, j, k+\tfrac{1}{2}) \]\[ H_x(i, j+\tfrac{1}{2}, k+\tfrac{1}{2}), \quad H_y(i+\tfrac{1}{2}, j, k+\tfrac{1}{2}), \quad H_z(i+\tfrac{1}{2}, j+\tfrac{1}{2}, k) \]<div class="eqref">Ch. 2 Fig. 2.7, Taflove and Hagness Sec. 5</div>`,
sym: [[String.raw`\((i, j, k)\)`, "integer grid indices, one per cell corner"], [String.raw`\(+\tfrac{1}{2}\)`, "half a cell along that axis"], ["edge center", String.raw`where each \(\mathbf{E}\) component sits`], ["face center", String.raw`where each \(\mathbf{H}\) component sits`]],
how: [String.raw`The curl of \(\mathbf{E}\) at a face center needs the \(\mathbf{E}\) components tangential to that face, around its edges.`, String.raw`Placing \(\mathbf{E}\) on edges puts exactly four of them around each face.`, String.raw`Likewise the curl of \(\mathbf{H}\) along an edge needs the \(\mathbf{H}\) components on the four faces that meet at that edge.`, "So each curl becomes a sum over a loop of four neighbours, all at half a cell, all central. This is the arrangement of the thesis Fig. 2.7."],
say: "Each electric component sits at the center of a loop of four magnetic components, and each magnetic component at the center of a loop of four electric components, which is the arrangement needed to evaluate the curls.",
num: String.raw`Select an \(\mathbf{H}\): <b>4</b> \(\mathbf{E}\) partners, all in this cell.<br>Select an \(\mathbf{E}\): <b>2</b> \(\mathbf{H}\) partners in this cell, <b>2</b> in the neighbouring cells.`,
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
  ctl.innerHTML = sl("ang", "Rotate view", 0, 90, 1, 35) + `<div class="row"><label>H on a face</label>${H.map(h => `<button data-s="${h.id}">H<sub>${h.id[1]}</sub> (${h.id[1]} = ${h.id[2]})</button>`).join("")}</div><div class="row"><label>E on an edge</label><button data-s="Ez00">E<sub>z</sub></button><button data-s="Ex00">E<sub>x</sub></button><button data-s="Ey00">E<sub>y</sub></button></div><div class="readout" id="ro"></div>`;
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
    $("ro").innerHTML = `<div><span>selected</span><b>${sel[0]}<sub>${sel[1]}</sub></b></div><div><span>loop partners shown</span><b>${hot.size}${se ? " here (+2 in neighbour cells)" : ""}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sel = b.dataset.s; u(); });
  $("ang").oninput = u; u();
}},

/* from old ch2 L9 card 2 */
{s: "7. A loop on a face", t: "The curl is a loop: updating one H",
intu: String.raw`Take the bottom face of a cell. \(H_z\) sits at its center. Around it, on the four edges, are two \(E_x\) and two \(E_y\). Faraday's law says the change of \(H_z\) is set by how much \(\mathbf{E}\) circulates around that loop. Going counterclockwise: \(E_x\) on the front edge counts positive, \(E_y\) on the right edge positive, \(E_x\) on the back edge negative, \(E_y\) on the left edge negative. Set the four edge values and see the circulation and the resulting change in \(H_z\). If all four point the same way around, \(H_z\) changes a lot. If they just point in one straight direction, the loop cancels and \(H_z\) does not change.`,
eq: String.raw`\[ \frac{\partial H_z}{\partial t} = -\frac{1}{\mu_0}\left(\frac{\partial E_y}{\partial x} - \frac{\partial E_x}{\partial y}\right) \]\[ H_z^{\,n+1/2} = H_z^{\,n-1/2} - \frac{\Delta t}{\mu_0}\left[\frac{E_y\big|_{i+1} - E_y\big|_{i}}{\Delta x} - \frac{E_x\big|_{j+1} - E_x\big|_{j}}{\Delta y}\right] \]`,
sym: [["circulation", String.raw`sum of \(\mathbf{E}\) along the loop, counterclockwise seen from \(+z\)`], [String.raw`\(E_y\big|_{i+1}, E_y\big|_{i}\)`, String.raw`\(E_y\) on the right and left edges of the face`], [String.raw`\(E_x\big|_{j+1}, E_x\big|_{j}\)`, String.raw`\(E_x\) on the back and front edges`]],
how: [String.raw`Stokes: the loop integral of \(\mathbf{E}\) around a face equals the curl's normal component times the face area.`, String.raw`Approximate each side of the loop by the \(\mathbf{E}\) value at its center times its length. That is exactly where the Yee cell puts \(\mathbf{E}\).`, String.raw`Divide by the area \(\Delta x\Delta y\) to get the curl at the face center.`, String.raw`Faraday's law, the second half of Eq. 2.16, then gives the change of \(H_z\) over one time step.`],
say: "Each magnetic component is updated from the circulation of the four electric components around its face, which is a central, second-order approximation of Faraday's law.",
num: String.raw`Uniform \(\mathbf{E}\) (all \(E_x = 1\), all \(E_y = 0\)): circulation <b>0</b>, \(H_z\) unchanged.<br>All four pointing around the loop with value 1: circulation <b>4</b> (in units of \(E\cdot\Delta\)), the largest change.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "E<sub>x</sub> front edge", -1, 1, 0.05, 1) + sl("b", "E<sub>y</sub> right edge", -1, 1, 0.05, 1) + sl("c", "E<sub>x</sub> back edge", -1, 1, 0.05, -1) + sl("d", "E<sub>y</sub> left edge", -1, 1, 0.05, -1) + '<div class="readout" id="ro"></div>';
  const S = C2L8_sub;
  const u = () => {
    const a = +$("a").value, b = +$("b").value, c = +$("c").value, d = +$("d").value; ["a", "b", "c", "d"].forEach(k => $(k + "v").textContent = (+$(k).value).toFixed(2));
    const circ = a + b - c - d, x0 = 200, y0 = 50, s = 160;
    const ar = (x, y, dx, dy, v) => `<line x1="${x - dx * 35 * v}" y1="${y - dy * 35 * v}" x2="${x + dx * 35 * v}" y2="${y + dy * 35 * v}" stroke="#378ADD" stroke-width="3.5" ${Math.abs(v) > 0.02 ? 'marker-end="url(#ar)"' : ""}/>`;
    fig.innerHTML = svg(260, `<rect x="${x0}" y="${y0}" width="${s}" height="${s}" fill="var(--blue-bg)" stroke="var(--p)"/>${ar(x0 + s / 2, y0 + s, 1, 0, a)}${ar(x0 + s, y0 + s / 2, 0, -1, b)}${ar(x0 + s / 2, y0, 1, 0, c)}${ar(x0, y0 + s / 2, 0, -1, d)}<circle cx="${x0 + s / 2}" cy="${y0 + s / 2}" r="${6 + Math.min(30, Math.abs(circ) * 7)}" fill="#D85A30" opacity="0.35"/><text class="th" x="${x0 + s / 2}" y="${y0 + s / 2 + 5}" text-anchor="middle">${S("H", "z")}</text><path d="M${x0 + s / 2 + 52} ${y0 + s / 2} A52 52 0 1 0 ${x0 + s / 2 + 51} ${y0 + s / 2 - 10}" fill="none" stroke="var(--p)" stroke-dasharray="3 4" marker-end="url(#ar)"/><text class="ts" x="${x0 + s / 2}" y="${y0 + s + 34}" text-anchor="middle">x →, y ↑ (seen from +z). Dashed: counterclockwise</text><text class="th" x="560" y="120" text-anchor="middle">circulation</text><text class="th" x="560" y="146" text-anchor="middle" style="font-size:22px">${circ.toFixed(2)}</text><text class="ts" x="560" y="170" text-anchor="middle">Δ${S("H", "z")} ∝ −circulation</text>`);
    $("ro").innerHTML = `<div><span>(E<sub>x</sub> front − E<sub>x</sub> back)</span><b>${(a - c).toFixed(2)}</b></div><div><span>(E<sub>y</sub> right − E<sub>y</sub> left)</span><b>${(b - d).toFixed(2)}</b></div><div><span>ΔH<sub>z</sub> (relative)</span><b>${(-circ).toFixed(2)}</b></div>`;
  };
  ["a", "b", "c", "d"].forEach(k => $(k).oninput = u); u();
}},

/* from old ch2 L9 card 3 */
{s: "8. The 2D grid", t: "2D: the grid splits into two independent sets",
intu: String.raw`If nothing changes along \(z\) (an infinitely long structure, or a 2D cross-section approximation), the six components split into two groups that never talk to each other. One group is \(E_z, H_x, H_y\) (called \(\mathrm{TM}_z\) in FDTD texts), the other is \(H_z, E_x, E_y\) (\(\mathrm{TE}_z\)). Each can be simulated alone. The grid for the first group is drawn here: \(E_z\) at the nodes, \(H_x\) between nodes vertically, \(H_y\) between nodes horizontally. Click a node or an \(H\) to see its update stencil. Careful: FDTD's \(\mathrm{TE}_z\) and \(\mathrm{TM}_z\) names refer to the \(z\) axis of the simulation, which is not the same as the TE-like and TM-like waveguide modes of Lessons 2 and 3. The 2D grating designs of the thesis use this kind of grid, in the plane of the waveguide axis and the fiber.`,
eq: String.raw`\[ \mathrm{TM}_z:\quad \frac{\partial E_z}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\left(\frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y}\right) \]\[ \frac{\partial H_x}{\partial t} = -\frac{1}{\mu_0}\frac{\partial E_z}{\partial y}, \qquad \frac{\partial H_y}{\partial t} = \frac{1}{\mu_0}\frac{\partial E_z}{\partial x} \]`,
sym: [[String.raw`\(\mathrm{TM}_z\)`, String.raw`the set \(E_z, H_x, H_y\) (\(\mathbf{E}\) normal to the simulation plane)`], [String.raw`\(\mathrm{TE}_z\)`, String.raw`the set \(H_z, E_x, E_y\)`], ["stencil", "the neighbours used in one update"]],
how: [String.raw`Set \(\partial/\partial z = 0\) in both curl equations of Eq. 2.16.`, String.raw`The equations for \(E_z, H_x, H_y\) only involve each other, and so do those for \(H_z, E_x, E_y\).`, "So a 2D simulation needs only one of the two sets for a given polarization.", "The staggering is the 3D Yee cell seen from above."],
say: String.raw`In two dimensions the Yee scheme splits into two independent polarizations, \(\mathrm{TM}_z\) (\(E_z, H_x, H_y\)) and \(\mathrm{TE}_z\) (\(H_z, E_x, E_y\)). These names refer to the simulation axis, not to waveguide mode labels.`,
num: "2D cost: 3 field values per cell instead of 6, and far fewer cells. That is why the gratings are designed in 2D, and only the final designs are checked in 3D (Ch. 3 Sec. 3.6).",
r(fig, ctl) {
  let sel = "e,2,1";
  const S = C2L8_sub;
  ctl.innerHTML = `<p class="note">Click a dot (E<sub>z</sub>) or a square (H) in the picture.</p><div class="readout" id="ro"></div>`;
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
    fig.innerHTML = svg(270, `${s}<text class="ts" x="120" y="258">blue dots: ${S("E", "z")} at nodes. Coral squares: ${S("H", "x")} (between nodes in y). Purple: ${S("H", "y")} (between nodes in x)</text>`);
    fig.querySelectorAll("[data-k]").forEach(el => el.onclick = () => { sel = el.getAttribute("data-k"); u(); });
    $("ro").innerHTML = `<div><span>selected</span><b>${kind === "e" ? "E<sub>z</sub>" : kind === "hx" ? "H<sub>x</sub>" : "H<sub>y</sub>"}</b></div><div><span>uses</span><b>${kind === "e" ? "2 H<sub>x</sub> and 2 H<sub>y</sub> around it" : "the 2 E<sub>z</sub> on either side"}</b></div>`;
  };
  u();
}},

/* from old ch2 L9 card 4 */
{s: "9. Run 2D", t: "A live 2D FDTD simulation",
intu: String.raw`This runs the 2D \(\mathrm{TM}_z\) Yee updates of card 8 on a 200 × 120 grid. Choose a scene. In free space, a point source sends out circular waves. With a dielectric block, the waves slow down inside it, reflect from it and bend around it. With a slab waveguide (a high-index strip, \(n = 3.5\)), a source inside the strip launches light that stays trapped and travels along it, with only a little radiated at the start: total internal reflection, computed from nothing but the curl equations. The colours are the sign and size of \(E_z\). The frame is an absorbing layer.`,
eq: String.raw`<div class="eqnote">normalized units, \(\Delta x = \Delta y = 1\), \(c = 1\)</div>\[ \begin{aligned} E_z &\leftarrow E_z + \frac{S}{\varepsilon_r}\Big[\left(H_y\big|_{i} - H_y\big|_{i-1}\right) - \left(H_x\big|_{j} - H_x\big|_{j-1}\right)\Big] \\ H_x &\leftarrow H_x - S\left(E_z\big|_{j+1} - E_z\big|_{j}\right) \\ H_y &\leftarrow H_y + S\left(E_z\big|_{i+1} - E_z\big|_{i}\right) \end{aligned} \]`,
sym: [[String.raw`\(S\)`, String.raw`time step in units of \(\Delta x/c\), 0.5 here`], [String.raw`\(\varepsilon_r\)`, "relative permittivity per cell"], ["source", "a sine added at one cell each step, smoothly switched on"]],
how: [String.raw`Same leapfrog as 1D, now with two \(H\) components.`, String.raw`\(\varepsilon_r\) is stored per cell, so any geometry can be drawn into the grid.`, "A graded absorbing frame damps waves before they reach the edge (Lesson 9, card 3).", String.raw`A guided mode has \(n_{\mathrm{eff}}\) above the index of air, so it cannot leak out of the strip: the guiding of Lesson 1.`],
say: "A 2D FDTD simulation reproduces radiation, refraction and waveguiding directly from the discretized curl equations, given only the permittivity on the grid.",
num: String.raw`Wavelength in air \(\lambda_0 = 40\) cells. Inside the strip (\(n = 3.5\)) the wavelength is about <b>11 cells</b>, coarse but enough to show the physics. Lesson 9, card 6 explains how the resolution is chosen.`,
r(fig, ctl) {
  let scene = "wg", run = true, sim;
  ctl.innerHTML = btns([["free", "free space"], ["block", "dielectric block"], ["wg", "slab waveguide"]], "s") + `<div class="row"><button id="rs">Restart</button><button id="pp">Pause</button></div>`;
  const nx = 200, ny = 120, lam = 40;
  const reset = () => { const eps = new Float32Array(nx * ny).fill(1); for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { if (scene === "block" && i > 110 && i < 150 && j > 35 && j < 85) eps[j * nx + i] = 6; if (scene === "wg" && j >= 55 && j <= 64) eps[j * nx + i] = 12.25; } sim = new C2.FDTD2D(nx, ny, 0.5, eps, 15); pick(ctl, "s", scene); };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { scene = b.dataset.s; reset(); });
  $("rs").onclick = reset; $("pp").onclick = () => { run = !run; $("pp").textContent = run ? "Pause" : "Play"; };
  reset();
  const { ctx, img } = C2.canvas(fig, nx, ny, 3, "E<sub>z</sub>: red positive, blue negative. Darker cells mark the high-index region.");
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    if (run) for (let s = 0; s < 3; s++) { const t = sim.t, ramp = Math.min(1, t / 80); const sx = scene === "wg" ? 40 : 60; sim.step([sx, 60, 0.6 * ramp * Math.sin(2 * Math.PI * t * 0.5 / lam)]); }
    for (let k = 0; k < nx * ny; k++) { const [r, g, b] = C2.color(sim.ez[k] * 3); let o = k * 4; const e = sim.eps[k]; img.data[o] = e > 1 ? r * 0.85 : r; img.data[o + 1] = e > 1 ? g * 0.85 : g; img.data[o + 2] = e > 1 ? b * 0.85 : b; img.data[o + 3] = 255; }
    const flip = ctx.createImageData(nx, ny); for (let j = 0; j < ny; j++) flip.data.set(img.data.subarray(j * nx * 4, (j + 1) * nx * 4), (ny - 1 - j) * nx * 4);
    ctx.putImageData(flip, 0, 0);
  });
}}

],
summary: String.raw`FDTD solves Maxwell's curl equations, Eq. 2.16, \(\partial\mathbf{E}/\partial t = (1/\varepsilon_0\varepsilon_r)\nabla \times \mathbf{H}\) and \(\partial\mathbf{H}/\partial t = -(1/\mu_0)\nabla \times \mathbf{E}\), the form of Taflove and Hagness for a linear, non-magnetic material without sources. The derivatives become central differences, which are second-order accurate. In the Yee cell the electric components sit on the edge centers and the magnetic components on the face centers, so each electric component is at the center of a loop of four magnetic components and each magnetic component at the center of a loop of four electric components, as the curls require. The two fields are updated in alternating half time steps. Reflection, slowing, resonances and guiding all emerge from these local updates.`,
sheet: [
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_0\varepsilon_r}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_0}\nabla \times \mathbf{E} \]`, String.raw`Maxwell curl equations (Ch. 2 Eq. 2.16), with \(\mathbf{D} = \varepsilon_0\varepsilon_r\mathbf{E}\), \(\mathbf{B} = \mu_0\mathbf{H}\)`],
[String.raw`\[ f' \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error } \frac{\Delta x^2}{24}\, f''' \]`, "Central difference"],
[String.raw`\[ H\big|_{i+1/2}^{n+1/2} = H\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_0 \Delta x}\left(E\big|_{i+1}^{n} - E\big|_{i}^{n}\right) \]`, "1D H update"],
[String.raw`\[ E\big|_{i}^{n+1} = E\big|_{i}^{n} + \frac{\Delta t}{\varepsilon_0\varepsilon_r \Delta x}\left(H\big|_{i+1/2}^{n+1/2} - H\big|_{i-1/2}^{n+1/2}\right) \]`, "1D E update, half a step later"],
[String.raw`\[ E_x(i+\tfrac{1}{2}, j, k), \ E_y(i, j+\tfrac{1}{2}, k), \ E_z(i, j, k+\tfrac{1}{2}) \]\[ H_x(i, j+\tfrac{1}{2}, k+\tfrac{1}{2}), \ H_y(i+\tfrac{1}{2}, j, k+\tfrac{1}{2}), \ H_z(i+\tfrac{1}{2}, j+\tfrac{1}{2}, k) \]`, "Yee cell: E on edge centers, H on face centers (Fig. 2.7)"],
[String.raw`\[ \frac{\partial H_z}{\partial t} = -\frac{1}{\mu_0}\left(\frac{\partial E_y}{\partial x} - \frac{\partial E_x}{\partial y}\right) \]`, "A loop of four E updates one H"]],
consts: String.raw`Simulations here use normalized units \(\Delta x = 1\), \(c = 1\).`,
sources: ["Taflove and Hagness, \"Finite-difference time-domain solution of Maxwell's equations\", in Wiley Encyclopedia of Electrical and Electronics Engineering, ed. J. G. Webster, Wiley (2016), Eqs. (1), (2), (4a), (4b) and Sec. 5 (curl equations, material relations, Yee algorithm)", "Tidy3D documentation and source, Flexcompute, version 2.11.2 (the FDTD solver used for every device in the thesis)"]
});
