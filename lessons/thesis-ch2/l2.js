/* TODO for this lesson: Thesis Sec. 2.2 first half (Johnson1999, Eq. 2.1). Rewrite big/bridge/summary/sheet. */
addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l2", title: "Mirror symmetry and the TE-like and TM-like modes", short: "2. Symmetry, TE-like and TM-like",
big: String.raw`A membrane with the same medium above and below supports two families of modes. TE modes have their electric field in the plane of the slab and parallel to the surfaces, so it is continuous across them. TM modes have their main electric field normal to the surfaces, and the boundary condition makes it jump up by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}}\), about 12, just outside. That jump pushes TM light out of the core and lowers its effective index. One equation, written by Andreani and Gerace in their Appendix C, gives both families.`,
bridge: "Lesson 1 showed why only certain angles survive. Here the same condition is solved properly, for both polarizations, with the field profiles. All curves are computed live.",
cards: [
/* from old ch2 L4 card 1 */
{s: "1. Mirrors and vectors", t: "What a mirror does to E and to H",
intu: String.raw`Put a mirror at \(z = 0\) and reflect a field. For the electric field it is simple: the parts parallel to the mirror stay, the part normal to it flips, exactly like an arrow you would see in a real mirror. The magnetic field behaves the opposite way, because it comes from circulating currents. Reflect a current loop and it circulates the other way, so the \(\mathbf{H}\) component normal to the mirror stays and the parallel parts flip. That is why \(\mathbf{E}\) is called a polar vector and \(\mathbf{H}\) an axial (pseudo) vector. Pick \(\mathbf{E}\) or \(\mathbf{H}\) and rotate the arrow to see its mirror image.`,
eq: String.raw`\[ \text{mirror } z \to -z: \qquad \begin{aligned} (E_{x}, E_{y}, E_{z}) &\to (E_{x}, E_{y}, -E_{z}) \\ (H_{x}, H_{y}, H_{z}) &\to (-H_{x}, -H_{y}, H_{z}) \end{aligned} \]`,
sym: [["polar vector", String.raw`\(\mathbf{E}\), \(\mathbf{D}\), current density \(\mathbf{J}\): flip the normal component`], ["axial vector", String.raw`\(\mathbf{H}\), \(\mathbf{B}\): flip the tangential components`], [String.raw`\(z = 0\)`, "the mirror plane, here the membrane mid-plane"]],
how: [String.raw`Reflect a moving charge: its velocity component normal to the mirror flips, the parallel parts stay. So \(\mathbf{J}\) and \(\mathbf{E}\) transform as polar vectors.`, String.raw`\(\mathbf{H}\) is produced by \(\mathbf{J}\) through a curl (Ampère). A curl involves a cross product, and reflecting both factors flips the result's tangential parts.`, String.raw`Check with a current loop in the \(xy\) plane: its mirror image circulates the same way, so \(H_z\) stays, consistent with the rule.`, "These two rules are all that is needed for the rest of the lesson."],
say: "Under a mirror reflection the electric field flips its normal component, while the magnetic field, being an axial vector, flips its tangential components.",
num: String.raw`Check: a field \(\mathbf{E} = \hat{\mathbf{z}}\) on one side maps to \(-\hat{\mathbf{z}}\) on the mirror side. A field \(\mathbf{H} = \hat{\mathbf{x}}\) maps to \(-\hat{\mathbf{x}}\). A field \(\mathbf{H} = \hat{\mathbf{z}}\) maps to \(+\hat{\mathbf{z}}\).`,
r(fig, ctl) {
  let f = "E";
  ctl.innerHTML = btns([["E", "electric field E"], ["H", "magnetic field H"]], "f") + sl("an", "Arrow angle from x", 0, 360, 1, 60);
  const u = () => {
    pick(ctl, "f", f); const an = +$("an").value * Math.PI / 180; $("anv").textContent = $("an").value + "°";
    const vx = Math.cos(an), vz = Math.sin(an), mx = f === "E" ? vx : -vx, mz = f === "E" ? -vz : vz, L = 60;
    const col = f === "E" ? "#378ADD" : "#D85A30";
    fig.innerHTML = svg(280, `<rect x="40" y="138" width="600" height="4" fill="var(--p)" opacity="0.6"/><text class="ts" x="640" y="132" text-anchor="end">mirror plane z = 0</text><line x1="340" y1="80" x2="${340 + L * vx}" y2="${80 - L * vz}" stroke="${col}" stroke-width="4" marker-end="url(#ar)"/><circle cx="340" cy="80" r="4" fill="${col}"/><text class="ts" x="250" y="60">original at z = +d</text><line x1="340" y1="200" x2="${340 + L * mx}" y2="${200 - L * mz}" stroke="${col}" stroke-width="4" marker-end="url(#ar)" opacity="0.8"/><circle cx="340" cy="200" r="4" fill="${col}"/><text class="ts" x="250" y="250">mirror image at z = −d</text>${axes(70, 260).replace(/>y</, '>y<')}<text class="ts" x="560" y="80">${f}x: ${vx.toFixed(2)} → ${mx.toFixed(2)}</text><text class="ts" x="560" y="100">${f}z: ${vz.toFixed(2)} → ${mz.toFixed(2)}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { f = b.dataset.f; u(); });
  $("an").oninput = u; u();
}},

/* from old ch2 L4 card 2 */
{s: "2. Even and odd", t: "Even and odd modes: apply the mirror and compare",
intu: String.raw`A mode is even if its mirror image is identical to itself, and odd if its mirror image is exactly minus itself. Here the arrows show the electric field in a cross-section of the membrane. TE0 points sideways (along \(y\)) with the same direction above and below the mid-plane. Mirror it: tangential arrows do not flip, so you get the same field. It is even. TM0 points up (along \(z\)) everywhere. Mirror it: normal arrows flip, so every arrow now points down, which is minus the original. It is odd. Press 'apply mirror' to see it happen. Johnson et al. 1999 used exactly this classification for photonic crystal slabs: the two classes do not interact.`,
eq: String.raw`\[ \text{even } (\sigma = +1): \ M[\mathbf{E}] = +\mathbf{E} \qquad \text{odd } (\sigma = -1): \ M[\mathbf{E}] = -\mathbf{E} \]\[ \text{at } z = 0: \quad \text{even} \Rightarrow E_{z} = 0, \qquad \text{odd} \Rightarrow E_{x} = E_{y} = 0 \]`,
sym: [[String.raw`\(M[\mathbf{E}]\)`, String.raw`the field after applying the mirror (card 1 rules) and moving each point \(z \to -z\)`], [String.raw`\(\sigma\)`, "parity eigenvalue, +1 even, −1 odd"], ["TE-like", "even family"], ["TM-like", "odd family"]],
how: [String.raw`The structure equals its mirror image, so if \(\mathbf{E}\) is a mode, \(M[\mathbf{E}]\) is also a mode at the same frequency.`, String.raw`For a single (non-degenerate) mode, \(M[\mathbf{E}]\) must be \(\mathbf{E}\) times a constant. Applying the mirror twice gives the original, so the constant is \(\pm 1\).`, String.raw`At \(z = 0\) the point maps to itself. For an even mode \(E_z(0) = -E_z(0)\), so \(E_z = 0\). For an odd mode the in-plane parts vanish.`, "This is why Johnson et al. call them TE-like and TM-like: exactly TE and TM at the mid-plane."],
say: String.raw`Because the membrane is symmetric, every mode is even or odd under the mid-plane mirror. Even modes have only in-plane electric field at the mid-plane and are TE-like. Odd modes have only \(E_z\) there and are TM-like.`,
num: "Two eigenvalues only: <b>+1</b> or <b>−1</b>, because mirroring twice is the identity.<br>Over a DBR or substrate on one side, the mirror symmetry is broken and the two classes mix (card 6).",
r(fig, ctl) {
  let md = "TE", mir = false;
  ctl.innerHTML = btns([["TE", "TE0 (even)"], ["TM", "TM0 (odd)"]], "m") + `<div class="row"><button id="mr">Apply mirror</button></div>` + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); $("mr").textContent = mir ? "Show original" : "Apply mirror";
    let a = ""; const zsp = [-100, -55, -15, 15, 55, 100], ys = [120, 220, 320, 420, 520];
    zsp.forEach(z => ys.forEach(y => {
      const inside = Math.abs(z) <= 80, amp = inside ? Math.cos(z / 80 * 0.9) : 0.35 * Math.exp(-(Math.abs(z) - 80) / 40) * (md === "TM" ? 3 : 1);
      const yy = 140 - z * 0.9;
      let dx = 0, dz = 0;
      if (md === "TE") dx = 28 * amp; else dz = 22 * Math.min(1.4, amp);
      if (mir) { if (md === "TM") dz = -dz; }
      a += `<line x1="${y - dx / 2}" y1="${yy + dz / 2}" x2="${y + dx / 2}" y2="${yy - dz / 2}" stroke="${md === "TE" ? "#378ADD" : "#D85A30"}" stroke-width="2" marker-end="url(#ar)"/>`;
    }));
    fig.innerHTML = svg(270, `<rect x="80" y="${140 - 72}" width="480" height="144" fill="var(--blue-bg)"/><line x1="70" x2="570" y1="140" y2="140" stroke="var(--t)" stroke-dasharray="5 4"/><text class="ts" x="574" y="144">mid-plane</text>${a}<text class="th" x="340" y="252" text-anchor="middle">${mir ? (md === "TE" ? "mirror image = original: even (+1)" : "mirror image = minus original: odd (−1)") : "original field"}</text>`);
    $("ro").innerHTML = `<div><span>main field</span><b>${md === "TE" ? "E_y (tangential)" : "E_z (normal)"}</b></div><div><span>parity</span><b>${md === "TE" ? "+1" : "−1"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; mir = false; u(); });
  $("mr").onclick = () => { mir = !mir; u(); }; u();
}},

/* NEW CARD: On the mid-plane even modes are purely TE and odd modes purely TM (Johnson 1999), so TE-like and TM-like */
{s: "3. On the mid-plane", t: "TODO: On the mid-plane even modes are purely TE and odd modes purely TM (Johnson 1999), so TE-like and TM-like", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* from old ch2 L2 card 1 */
{s: "1. The jump", t: "Boundary conditions: why the TM field jumps",
intu: String.raw`At a surface between two materials, Maxwell's equations fix two things. The field component parallel to the surface is the same on both sides. The normal component of the displacement field \(\mathbf{D} = \varepsilon\mathbf{E}\) is the same on both sides, so the normal component of \(\mathbf{E}\) itself must jump by the ratio of permittivities. For GaAs to air that ratio is \(n^2 \approx 12\). A TE mode has its \(\mathbf{E}\) field parallel to the surfaces, so nothing jumps. A TM mode has its \(\mathbf{E}\) field mostly normal to the surfaces, so just outside the membrane its field is about 12 times stronger than just inside. Drag the index and watch the jump grow.`,
eq: String.raw`\[ E_{\parallel}^{\mathrm{air}} = E_{\parallel}^{\mathrm{core}} \qquad \varepsilon_{\mathrm{air}} E_{z}^{\mathrm{air}} = \varepsilon_{\mathrm{core}} E_{z}^{\mathrm{core}} \]\[ \Longrightarrow\quad E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\, E_{z}^{\mathrm{core}} \]`,
sym: [[String.raw`\(E_{\parallel}\)`, "tangential electric field, parallel to the surface"], [String.raw`\(E_{z}\)`, "electric field normal to the membrane surfaces"], [String.raw`\(\varepsilon\)`, String.raw`permittivity, \(\varepsilon = n^2\) (relative)`], [String.raw`\(\mathbf{D}\)`, String.raw`displacement field \(\varepsilon\mathbf{E}\), whose normal part is continuous with no surface charge`]],
how: [String.raw`Faraday's law integrated around a thin loop across the surface gives continuity of tangential \(\mathbf{E}\).`, String.raw`Gauss's law over a thin pillbox gives continuity of normal \(\mathbf{D} = \varepsilon\mathbf{E}\) (no free surface charge).`, String.raw`So \(\varepsilon_1 E_{z1} = \varepsilon_2 E_{z2}\), and \(E_z\) jumps by \(\varepsilon_1/\varepsilon_2\).`, String.raw`This is Eq. 2.1 of your Chapter 2, and the same factor appears as \(\zeta\) in the TM slab equation.`],
say: String.raw`The tangential electric field is continuous at the surface and the normal displacement field is continuous. For TM-like light, whose field is normal to the surfaces, the field just outside is larger by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}}\), about 12 for GaAs.`,
num: String.raw`\(n = 3.5\): jump factor \(n^2\) = <b>12.25</b><br>\(n = 3.0\) (AlGaAs-like): <b>9</b><br>\(n = 1.45\) (oxide): <b>2.1</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.2, 3.8, 0.01, 3.5) + btns([["TE", "TE (field parallel)"], ["TM", "TM (field normal)"]], "p") + '<div class="readout" id="ro"></div>';
  let pol = "TM";
  const u = () => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2); pick(ctl, "p", pol);
    const N = C2.slabN(n, 1, 160, 800, 0, pol), zs = range(-300, 300, 300);
    const pr = C2.slabProfile(n, 1, 160, 800, 0, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    fig.innerHTML = svg(270, `<rect x="${340 - 80 * 0.9}" y="30" width="${160 * 0.9}" height="200" fill="var(--blue-bg)"/><text class="ts" x="340" y="248" text-anchor="middle">core, 160 nm</text>${plot(70, 30, 540, 200, zs, ys, -300, 300, 0, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<line x1="70" x2="610" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="76" y="44">${pol === "TE" ? "E_y (parallel to surfaces): continuous" : "E_z (normal to surfaces): jumps at both surfaces"}</text>`);
    $("ro").innerHTML = `<div><span>jump factor n²</span><b>${(n * n).toFixed(2)}</b></div><div><span>n<sub>eff</sub> of the ${pol}0 mode</span><b>${N ? N.toFixed(3) : "—"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { pol = b.dataset.p; u(); });
  $("n").oninput = u; u();
}},

/* from old ch2 L2 card 3 */
{s: "3. Profiles", t: "What the modes look like across the slab",
intu: String.raw`Each mode has a field shape across the thickness. Even modes (TE0, TM0) have no zero inside the core. Odd modes (TE1, TM1) have one zero at the mid-plane, so their field is positive on one side and negative on the other. Outside, every mode decays exponentially. Pick a mode and change the thickness. For TM, the curve shown is \(E_z\), so you can see the jump at the two surfaces. Notice that near cutoff (thin slab, or a higher-order mode) the tails get long: most of the light is then in the air.`,
eq: String.raw`\[ \text{inside: } f(z) = \begin{cases} \cos(\kappa z) & m \text{ even} \\ \sin(\kappa z) & m \text{ odd} \end{cases} \qquad \text{outside: } f(t/2)\, e^{-\gamma(|z| - t/2)} \]\[ \text{TE: } f = E_{y} \qquad \text{TM: } f = H_{y}, \quad E_{z} = \frac{\beta H_{y}}{\omega\varepsilon} \propto \frac{H_{y}}{n^{2}(z)} \]`,
sym: [[String.raw`\(f(z)\)`, "transverse profile of the main field"], [String.raw`\(E_{y}\)`, "TE main field, parallel to the surfaces"], [String.raw`\(H_{y}\)`, "TM magnetic field, continuous"], [String.raw`\(E_{z}\)`, String.raw`TM main electric field, \(\propto H_y/\varepsilon\), so it jumps`]],
how: [String.raw`Solve card 2 for \(n_{\mathrm{eff}}\), which gives \(\kappa\) and \(\gamma\).`, String.raw`Write \(\cos\) or \(\sin\) inside and an exponential tail outside, matched at the surfaces.`, String.raw`For TM, compute \(E_z\) from \(H_y\) using Maxwell's equations: \(E_z \propto H_y/\varepsilon\).`, "Normalize so the largest value is 1."],
say: "Fundamental modes have no node across the slab. First-order modes have one node at the mid-plane and are odd. TM electric fields peak just outside the surfaces because of the permittivity jump.",
num: "Mid-plane value: TE0 and TM0 are maximal there, TE1 and TM1 are exactly zero there. This sets which modes a dot at the mid-plane can couple to (Chapter 1, Lesson 6).",
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + sl("t", "Thickness t", 60, 400, 5, 220) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const t = +$("t").value; $("tv").textContent = t + " nm";
    const pol = md.slice(0, 2), m = +md[2], N = C2.slabN(3.5, 1, t, 800, m, pol), zs = range(-350, 350, 350);
    if (!N) { fig.innerHTML = svg(270, `<text class="th" x="340" y="130" text-anchor="middle">${md} is cut off at this thickness</text>`); $("ro").innerHTML = `<div><span>${md}</span><b>not guided</b></div>`; return; }
    const pr = C2.slabProfile(3.5, 1, t, 800, m, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    const w = t / 700 * 540;
    fig.innerHTML = svg(270, `<rect x="${340 - w / 2}" y="20" width="${w}" height="230" fill="var(--blue-bg)"/><line x1="70" x2="610" y1="135" y2="135" stroke="var(--p)" stroke-width="0.6"/><line x1="340" x2="340" y1="20" y2="250" stroke="var(--p)" stroke-dasharray="3 3" opacity="0.6"/>${plot(70, 20, 540, 230, zs, ys, -350, 350, -1.05, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<text class="ts" x="76" y="36">${pol === "TE" ? "E_y" : "E_z"} of ${md} across z, −350 to 350 nm</text><text class="ts" x="344" y="262">mid-plane</text>`);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub></span><b>${N.toFixed(3)}</b></div><div><span>decay length 1/γ</span><b>${(1 / pr.gamma).toFixed(0)} nm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("t").oninput = u; u();
}},

/* from old ch2 L2 card 6 */
{s: "6. TE above TM", t: "Why TE is always above TM, and why it matters",
intu: String.raw`Card 2 showed the reason in the equation: \(\zeta = (n/n_{\mathrm{c}})^2\) makes the TM right-hand side climb faster, which lowers its solution. Physically, TM light is pushed out into the air by the field jump of card 1, and light that travels more in air has a lower effective index. The gap between TE and TM grows with index contrast. Drag the core index from a weak waveguide to GaAs and watch the gap open. This gap is useful and harmful at once: it makes grating couplers strongly polarization selective (Lesson 5), and it gives the two polarizations different beat lengths in an MMI (Lesson 7), which is how an MMI can split them.`,
eq: String.raw`\[ n_{\mathrm{eff},m}^{\mathrm{TM}} \lt n_{\mathrm{eff},m}^{\mathrm{TE}} \qquad \text{gap grows with contrast } n/n_{\mathrm{c}} \ \text{(through } \zeta\text{)} \]`,
sym: [[String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}}, n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "effective indices of TE and TM modes of the same order"], [String.raw`\(n/n_{\mathrm{c}}\)`, "index contrast between core and cladding"]],
how: [String.raw`For a weak guide, \(\zeta \approx 1\) and TE and TM are nearly degenerate.`, String.raw`For strong contrast, \(\zeta \approx 12\) and the TM solution moves to a much lower \(n_{\mathrm{eff}}\).`, "So high-contrast membranes are strongly birefringent.", "Taillaert et al. 2006 report the same effect in silicon-on-insulator: TE 2.83 versus TM 1.89."],
say: "TM-like modes of a high-contrast membrane have a much lower effective index than TE-like modes, because the permittivity jump pushes their field into the cladding.",
num: String.raw`Taillaert et al. 2006, 220 nm silicon on oxide at 1550 nm: TE <b>2.83</b>, TM <b>1.89</b><br>This page, \(n = 3.5\) membrane in air at 800 nm, \(t = 160\) nm: gap ≈ <b>0.50</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.1, 3.8, 0.01, 3.5) + sl("t", "Thickness t", 60, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n = +$("n").value, t = +$("t").value; $("nv").textContent = n.toFixed(2); $("tv").textContent = t + " nm";
    const ns = range(1.05, 3.8, 80), te = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TE")), tm = ns.map(x => C2.slabN(x, 1, t, 800, 0, "TM"));
    const a = C2.slabN(n, 1, t, 800, 0, "TE"), b = C2.slabN(n, 1, t, 800, 0, "TM");
    const X = v => 60 + (v - 1.05) / 2.75 * 560, Y = v => 230 - (v - 1) / 2.8 * 200;
    const pth = arr => { let d = ""; arr.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(ns[i]).toFixed(1) + " " + Y(v).toFixed(1); }); return d; };
    fig.innerHTML = svg(260, `<path d="${pth(te)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pth(tm)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><line x1="${X(n)}" x2="${X(n)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">core index, 1.05 to 3.8 (cladding = air)</text><text class="ts" x="66" y="44">blue TE0, coral TM0: n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> versus core index</text>`);
    $("ro").innerHTML = `<div><span>TE0</span><b>${a.toFixed(3)}</b></div><div><span>TM0</span><b>${b.toFixed(3)}</b></div><div><span>gap</span><b>${(a - b).toFixed(3)}</b></div>`;
  };
  $("n").oninput = u; $("t").oninput = u; u();
}}

],
summary: String.raw`At a surface the tangential \(\mathbf{E}\) field and the normal \(\mathbf{D}\) field are continuous, so a field normal to the membrane jumps by \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}} \approx 12\). TE modes have their field parallel to the surfaces, TM modes normal to them. Both obey \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\), with \(\zeta = 1\) for TE and \((n/n_{\mathrm{c}})^2\) for TM, as in Andreani and Gerace's Appendix C. The TM factor lowers the TM effective index. Fundamental modes have no cutoff, mode \(m\) appears at \(t_m = m\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\), and the confinement factor grows with thickness.`,
sheet: [
[String.raw`\[ E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\, E_{z}^{\mathrm{core}} \]`, "Field jump (Ch. 2 Eq. 2.1)"],
[String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]`, "Slab equation (Ch. 2 Eq. 2.2, Andreani App. C)"],
[String.raw`\[ \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]`, "Transverse wavenumber and decay"],
[String.raw`\[ \zeta = 1 \ \text{(TE)}, \qquad \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]`, "Polarization factor"],
[String.raw`\[ t_m = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}} \]`, "Cutoff thickness"],
[String.raw`\[ \Gamma = \frac{\int_{\mathrm{core}} |E|^{2}}{\int |E|^{2}} \]`, "Confinement factor"]],
consts: String.raw`Examples: \(n = 3.5\), \(n_{\mathrm{c}} = 1\), \(\lambda_0 = 800\) nm. Computed live, not thesis values.`,
sources: ["Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), Appendix C, Eqs. (C1) to (C4) (guided-mode expansion study of photonic crystal slabs)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (slab thickness rule, energy in the slab)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (TE and TM indices in SOI)"]
});
