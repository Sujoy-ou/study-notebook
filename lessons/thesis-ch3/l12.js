/* TODO for this lesson: NEW LESSON, thesis Sec. 3.6. Write big/bridge/summary/sheet/sources from scratch (head and tail were copied from the Adam lesson as a placeholder). */
addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l12", title: "Simulation settings: grid, symmetry, sources and boundaries", short: "12. Simulation settings",
big: String.raw`The adjoint method delivers a gradient. The optimizer decides how big a step to take along it. Plain gradient descent steps in proportion to the gradient, which fails when parameters differ greatly in sensitivity: a step small enough for the most sensitive parameter barely moves the others. Adam keeps, for every parameter, a running average of its gradient and of its squared gradient, and steps by the ratio of the two. Each parameter thus gets its own effective step size, about the learning rate \(\alpha\), whatever the scale of its gradient. Grating widths, DBR scales, taper points and pixel densities all have very different sensitivities, and Adam treats them on an equal footing.`,
bridge: "This is Ch. 3 Sec. 3.6, the optimizer paragraph, which cites Algorithm 1 of Kingma and Ba 2015 (University of Amsterdam and University of Toronto). All thesis optimizations use Adam through the optax library with its default decay rates 0.9 and 0.999. Michaels and Yablonovitch used BFGS instead. The paths below are computed live on a stretched quadratic bowl.",
cards: [
/* NEW CARD: Non-uniform grid set by steps per wavelength in each material, quoted for GaAs, nominal cell lambda0/(N n); pixel matched to cell */
{s: "1. Steps per wavelength", t: "TODO: Non-uniform grid set by steps per wavelength in each material, quoted for GaAs, nominal cell lambda0/(N n); pixel matched to cell", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: Gratings designed in 2D in the x-z plane containing the fiber, tapers and PBS in 3D, why */
{s: "2. 2D and 3D", t: "TODO: Gratings designed in 2D in the x-z plane containing the fiber, tapers and PBS in 3D, why", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* from old ch2 L4 card 3 */
{s: "3. PEC and PMC", t: "Replacing the mirror by a wall: PEC and PMC",
intu: String.raw`If a mode is even, we know \(E_z\) and the tangential \(\mathbf{H}\) are zero on the mid-plane. If it is odd, the tangential \(\mathbf{E}\) is zero there. Both are exactly the conditions at an ideal wall. A perfect electric conductor (PEC) forces tangential \(\mathbf{E}\) to zero. A perfect magnetic conductor (PMC), its magnetic twin, forces tangential \(\mathbf{H}\) to zero. So you can delete half the membrane, put a PMC on the cut, and the remaining half carries exactly the even modes. Put a PEC there instead and it carries exactly the odd modes. Choose a mode and a wall and see whether the wall is compatible.`,
eq: String.raw`\[ \begin{aligned} \text{PEC:}\quad \hat{\mathbf{n}} \times \mathbf{E} &= 0 \quad (\text{tangential } \mathbf{E} = 0) \\ \text{PMC:}\quad \hat{\mathbf{n}} \times \mathbf{H} &= 0 \quad (\text{tangential } \mathbf{H} = 0) \end{aligned} \]\[ \text{even (TE-like)} \longleftrightarrow \text{PMC} \qquad \text{odd (TM-like)} \longleftrightarrow \text{PEC} \]`,
sym: [[String.raw`\(\hat{\mathbf{n}}\)`, "unit normal of the wall"], ["PEC", "perfect electric conductor, ideal metal"], ["PMC", "perfect magnetic conductor, a mathematical dual of PEC"]],
how: [String.raw`Even mode: by card 1, \(\mathbf{H}\)'s tangential parts flip under the mirror, so on the plane \(\mathbf{H}_{\mathrm{tan}} = -\mathbf{H}_{\mathrm{tan}} = 0\). That is a PMC condition.`, String.raw`Odd mode: \(\mathbf{E}\)'s tangential parts must equal minus themselves on the plane, so \(\mathbf{E}_{\mathrm{tan}} = 0\). That is a PEC condition.`, "A wall that matches the field's own symmetry changes nothing for that family.", "A wall of the wrong type forbids that family entirely: only the other family survives."],
say: "A PMC plane at the mid-plane keeps the even, TE-like modes, and a PEC plane keeps the odd, TM-like modes. This is how a symmetry plane in an FDTD simulation selects one mode family.",
num: String.raw`PEC: tangential \(\mathbf{E} = 0\) on the wall. PMC: tangential \(\mathbf{H} = 0\) on the wall.<br>Even modes satisfy the PMC condition automatically on the mid-plane, odd modes satisfy the PEC condition.`,
r(fig, ctl) {
  let md = "TE", wl = "PMC";
  ctl.innerHTML = `<div class="row"><label>Mode</label><button data-m="TE">TE0 (even)</button><button data-m="TM">TM0 (odd)</button></div><div class="row"><label>Wall at z = 0</label><button data-w="PMC">PMC</button><button data-w="PEC">PEC</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "m", md); pick(ctl, "w", wl);
    const ok = (md === "TE" && wl === "PMC") || (md === "TM" && wl === "PEC");
    let a = ""; [-15, 30, 75].forEach(z => [140, 240, 340, 440, 540].forEach(y => { const yy = 150 - z; const amp = Math.cos(z / 80 * 0.9); if (md === "TE") a += `<line x1="${y - 14 * amp}" y1="${yy}" x2="${y + 14 * amp}" y2="${yy}" stroke="#378ADD" stroke-width="2" marker-end="url(#ar)"/>`; else a += `<line x1="${y}" y1="${yy + 11}" x2="${y}" y2="${yy - 11}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>`; }));
    fig.innerHTML = svg(260, `<rect x="100" y="70" width="480" height="80" fill="var(--blue-bg)"/><rect x="90" y="150" width="500" height="8" fill="${wl === "PEC" ? "#888780" : "#7F77DD"}"/><text class="ts" x="596" y="158">${wl} wall</text>${a}<text class="ts" x="340" y="182" text-anchor="middle">simulated half only. The other half is implied by symmetry.</text><text class="th" x="340" y="222" text-anchor="middle">${ok ? "compatible: this mode family is kept" : "incompatible: this mode family is removed"}</text>`);
    $("ro").innerHTML = `<div><span>field on the plane</span><b>${md === "TE" ? "E tangential ≠ 0, H tangential = 0" : "E tangential = 0, E_z ≠ 0"}</b></div><div><span>${wl} requires</span><b>${wl === "PEC" ? "E tangential = 0" : "H tangential = 0"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  ctl.querySelectorAll("button[data-w]").forEach(b => b.onclick = () => { wl = b.dataset.w; u(); }); u();
}},

/* from old ch2 L4 card 4 */
{s: "4. Symmetry in Tidy3D", t: "Which symmetry value keeps which mode",
intu: String.raw`A strip has two mirror planes: the mid-plane \(z = 0\) and the axis plane \(y = 0\) (\(x\) is the propagation direction). For each plane the rule is the same: look at which electric field components are tangential to the plane and ask whether they vanish there for your mode. If they vanish, the mode is compatible with a PEC (−1). If they do not, it needs a PMC (+1). For \(z = 0\) the tangential components are \(E_x, E_y\). For \(y = 0\) they are \(E_x, E_z\). Pick a plane and a mode to get the value. In Tidy3D's Simulation.symmetry, +1 means even (PMC) and −1 means odd (PEC).`,
eq: String.raw`<div class="eqnote">Tidy3D:</div>\[ \texttt{symmetry} = (s_{x}, s_{y}, s_{z}) \]\[ +1 = \text{even} = \text{PMC}, \qquad -1 = \text{odd} = \text{PEC}, \qquad 0 = \text{none} \]\[ z = 0:\ \text{TE0} \to +1,\ \text{TM0} \to -1 \qquad y = 0:\ \text{TE0} \to -1,\ \text{TM0} \to +1 \]`,
sym: [[String.raw`\(s_{y}, s_{z}\)`, String.raw`symmetry setting for the plane through the simulation center normal to \(y\) or \(z\)`], [String.raw`tangential \(\mathbf{E}\)`, "components lying in the plane"], ["TE0", String.raw`main field \(E_y\)`], ["TM0", String.raw`main field \(E_z\)`]],
how: [String.raw`Plane \(z = 0\), TE0: \(E_y\) is large on the mid-plane, so tangential \(\mathbf{E} \neq 0\) → not PEC → PMC, +1.`, String.raw`Plane \(z = 0\), TM0: \(E_x\) and \(E_y\) vanish on the mid-plane → PEC, −1.`, String.raw`Plane \(y = 0\), TE0: the tangential parts are \(E_x\) and \(E_z\), both zero on the axis (\(E_x\) vanishes on axis, see Chapter 1, Lesson 6) → PEC, −1. \(E_y\) itself is normal to this plane.`, String.raw`Plane \(y = 0\), TM0: \(E_z\) is large on the axis → PMC, +1.`],
say: "In Tidy3D the symmetry value +1 is a PMC plane and keeps fields whose tangential electric field is nonzero on the plane, −1 is a PEC plane and keeps fields whose tangential electric field vanishes there. Which value keeps TE0 depends on the plane.",
num: String.raw`A common surprise: the same TE0 mode needs <b>+1</b> at \(z = 0\) but <b>−1</b> at \(y = 0\), because \(E_y\) is tangential to the first plane and normal to the second.`,
r(fig, ctl) {
  let pl = "z", md = "TE";
  ctl.innerHTML = `<div class="row"><label>Plane</label><button data-p="z">z = 0 (mid-plane)</button><button data-p="y">y = 0 (axis plane)</button></div><div class="row"><label>Mode</label><button data-m="TE">TE0</button><button data-m="TM">TM0</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", pl); pick(ctl, "m", md);
    const val = (pl === "z") === (md === "TE") ? 1 : -1;
    const cx = 340, cy = 130, w = 200, h = 80;
    let arr = ""; for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) { const x = cx + i * 40, y = cy + j * 26; if (md === "TE") arr += `<line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}" stroke="#378ADD" stroke-width="2" marker-end="url(#ar)"/>`; else arr += `<line x1="${x}" y1="${y + 11}" x2="${x}" y2="${y - 11}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/>`; }
    const plane = pl === "z" ? `<line x1="${cx - 180}" x2="${cx + 180}" y1="${cy}" y2="${cy}" stroke="#7F77DD" stroke-width="4" opacity="0.7"/>` : `<line x1="${cx}" x2="${cx}" y1="${cy - 90}" y2="${cy + 90}" stroke="#7F77DD" stroke-width="4" opacity="0.7"/>`;
    const tang = pl === "z" ? "E_x, E_y" : "E_x, E_z";
    const tz = (pl === "z" && md === "TM") || (pl === "y" && md === "TE");
    fig.innerHTML = svg(270, `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="var(--blue-bg)" stroke="var(--p)"/>${arr}${plane}<text class="ts" x="${cx}" y="${cy + 110}" text-anchor="middle">strip cross-section (y across, z up). Purple: symmetry plane</text><text class="th" x="${cx}" y="34" text-anchor="middle">symmetry value ${val > 0 ? "+1 (PMC)" : "−1 (PEC)"}</text><text class="ts" x="${cx}" y="258" text-anchor="middle">tangential E on the plane: ${tang}, which ${tz ? "vanish" : "do not vanish"} for ${md}0</text>`);
    $("ro").innerHTML = `<div><span>tangential E</span><b>${tang}</b></div><div><span>on the plane</span><b>${tz ? "zero" : "nonzero"}</b></div><div><span>Tidy3D value</span><b>${val > 0 ? "+1" : "−1"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { pl = b.dataset.p; u(); });
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; u(); }); u();
}},

/* from old ch2 L4 card 5 */
{s: "5. Half the work", t: "Cutting the simulation in half, and the rules",
intu: String.raw`Each symmetry plane halves the number of grid cells, and with it the memory and the run time. Two planes give a quarter, three an eighth. The price is that the whole problem must be symmetric: the structure, the source and the boundary conditions. The monitors can be anywhere, since the solver reconstructs the other half by mirroring. And the value must match the mode you launch. If you put a PMC at \(y = 0\) and launch TE0, the source cannot excite anything in the kept family and the transmission comes out near zero. That near-zero result is a useful check that the value really selects the family you think. Choose the number of planes and toggle a wrong value.`,
eq: String.raw`\[ \text{cells with } s \text{ symmetry planes: } \frac{N_{\mathrm{cells}}}{2^{s}}, \qquad s = 0, 1, 2, 3 \]<div class="eqnote">requirement: \(\varepsilon(\mathbf{r})\) and the source are symmetric under every chosen mirror</div>`,
sym: [[String.raw`\(s\)`, "number of symmetry planes used"], [String.raw`\(N_{\mathrm{cells}}\)`, "grid cells of the full domain"], ["wrong value", "symmetry value of the other family, which removes the mode you launch"]],
how: ["The fields in the missing half are fixed by the mirror rule, so they need not be stored or updated.", "The symmetry plane acts as a PEC or PMC wall for the fields in the kept half.", "If the structure or source is not symmetric, the true field is not even or odd, and forcing a symmetry gives a wrong answer.", "A good habit is to compare one case with and without symmetry. They should agree."],
say: "Each symmetry plane halves the simulated volume. It is valid only when the structure and source share the symmetry, and the value must select the mode family that is launched. A full-domain check confirms the setting.",
num: "1 plane: <b>50 %</b> of the cells. 2 planes: <b>25 %</b>. 3 planes: <b>12.5 %</b>.<br>A wrong value gives a transmission near <b>zero</b>, because the launched mode belongs to the removed family.",
r(fig, ctl) {
  let s = 1, wrong = false;
  ctl.innerHTML = `<div class="row"><label>Symmetry planes</label>${[0, 1, 2, 3].map(v => `<button data-s="${v}">${v}</button>`).join("")}</div><div class="row"><button id="wr">Use the wrong value</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "s", s); $("wr").textContent = wrong ? "Use the right value" : "Use the wrong value"; $("wr").disabled = s === 0;
    const ox = 230, oy = 60, a = 150, b = 110, d = 60;
    const box = (x0, y0, ww, hh, dd, op) => `<path d="M${x0} ${y0 + dd} L${x0 + ww} ${y0 + dd} L${x0 + ww} ${y0 + dd + hh} L${x0} ${y0 + dd + hh} Z" fill="#378ADD" opacity="${op}" stroke="var(--p)"/><path d="M${x0} ${y0 + dd} L${x0 + dd} ${y0} L${x0 + ww + dd} ${y0} L${x0 + ww} ${y0 + dd} Z" fill="#378ADD" opacity="${op * 0.7}" stroke="var(--p)"/><path d="M${x0 + ww} ${y0 + dd} L${x0 + ww + dd} ${y0} L${x0 + ww + dd} ${y0 + hh} L${x0 + ww} ${y0 + dd + hh} Z" fill="#378ADD" opacity="${op * 0.5}" stroke="var(--p)"/>`;
    const fx = s >= 1 ? 0.5 : 1, fy = s >= 2 ? 0.5 : 1, fz = s >= 3 ? 0.5 : 1;
    const T = s > 0 && wrong ? 0.002 : 0.9;
    fig.innerHTML = svg(270, `${box(ox, oy, a, b, d, 0.08)}${box(ox + a * (1 - fx), oy + d * (1 - fz) * 0 + b * 0 + (1 - fy) * 0, a * fx, b * fz, d * fy, 0.55)}<text class="ts" x="${ox + a / 2}" y="${oy + b + d + 24}" text-anchor="middle">dark: simulated part. Light: rebuilt by mirroring</text><text class="th" x="560" y="80" text-anchor="middle">transmission</text><rect x="535" y="${230 - T * 130}" width="50" height="${Math.max(1, T * 130)}" fill="${wrong && s ? "#D85A30" : "#1D9E75"}"/><line x1="520" x2="600" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="560" y="250" text-anchor="middle">${wrong && s ? "≈ 0: wrong family" : "correct"}</text>`);
    $("ro").innerHTML = `<div><span>cells simulated</span><b>${(100 / Math.pow(2, s)).toFixed(1)} %</b></div><div><span>speed-up</span><b>about ${Math.pow(2, s)}×</b></div>`;
  };
  ctl.querySelectorAll("button[data-s]").forEach(b => b.onclick = () => { s = +b.dataset.s; if (!s) wrong = false; u(); });
  $("wr").onclick = () => { wrong = !wrong; u(); }; u();
}},

/* NEW CARD: PML around the domain, mode source launching TE or TM mode, mode monitors, Gaussian beam for the fiber: MFD, tilt 5 deg, 0.5 um above, E along y for TE, in plane of incidence for TM */
{s: "6. Sources and boundaries", t: "TODO: PML around the domain, mode source launching TE or TM mode, mode monitors, Gaussian beam for the fiber: MFD, tilt 5 deg, 0.5 um above, E along y for TE, in plane of incidence for TM", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }}

],
summary: String.raw`Adam keeps per-parameter running averages of the gradient (decay 0.9) and of its square (decay 0.999), corrects them for starting at zero, and steps by \(\alpha \hat m/(\sqrt{\hat v} + \epsilon)\). The ratio \(\hat m/\sqrt{\hat v}\) is of order one and unchanged when a gradient is rescaled, so every parameter moves by about \(\alpha\) regardless of its sensitivity. That suits inverse design, where widths, layer scales, outline points and pixels differ greatly in sensitivity, and where plain gradient descent would need a step small enough for the most sensitive parameter. \(\alpha\) sets the step size, too large an \(\alpha\) makes the design jump, and like any gradient method Adam finds a local optimum.`,
sheet: [
[String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2 \]`, "Moments (Kingma and Ba, Alg. 1)"],
[String.raw`\[ \hat m_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]`, "Bias correction"],
[String.raw`\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]`, String.raw`Update (gradient ascent: + for maximizing \(J\))`],
[String.raw`\[ \beta_1 = 0.9 \qquad \beta_2 = 0.999 \qquad \epsilon = 10^{-8} \]`, "Defaults, also in optax"],
[String.raw`\[ \text{gradient descent stable for } \alpha \lt 1/S^2 \]`, "Why plain descent fails for ill-scaled parameters"]],
consts: String.raw`Test function \(f = (x - 1)^2 + S^2(y - 0.5)^2\), start \((-1.5, -0.7)\). Thesis objectives are maximized, so the update adds the step.`,
sources: ["Kingma and Ba, Adam: A method for stochastic optimization, ICLR 2015, arXiv:1412.6980 (Algorithm 1, bias correction, invariance to gradient rescaling)", "optax library documentation (adam with default b1 = 0.9, b2 = 0.999, eps = 1e-8)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (used BFGS for their taper)"]
});
