addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l4", title: "Mirror symmetry, PEC and PMC", short: "4. Mirror symmetry",
big: String.raw`A membrane with air above and below looks the same in a mirror placed at its mid-plane. Every mode must then be even or odd under that mirror. Even modes have only in-plane \(\mathbf{E}\) at the mid-plane (TE-like), odd modes have only \(\mathbf{E}\) along \(z\) there (TM-like), and a symmetric structure can never convert one into the other. An FDTD solver uses this to cut the simulation in half: it replaces the mirror plane by a perfect magnetic conductor (PMC, keeps even fields) or a perfect electric conductor (PEC, keeps odd fields). In Tidy3D these are the symmetry values +1 and −1.`,
bridge: "This is the lesson that connects Chapter 1 (which dipole couples to which mode) with how every symmetric simulation in Chapters 3 to 5 is set up. Everything shown is general theory.",
cards: [
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

{s: "6. No conversion", t: "Symmetry forbids conversion, and how to break it",
intu: String.raw`Can a symmetric structure turn TE-like light into TM-like light, or an even mode into an odd one? The coupling between two modes caused by a change in the structure \(\Delta\varepsilon\) is an overlap integral of \(\Delta\varepsilon\) times the two mode fields. Here the even mode is TE0 and the odd mode is TE1 of a slab, computed live. If the change is symmetric (the same on top and bottom), even times odd times symmetric integrates to exactly zero. If the change is on one side only, like a substrate below, the integral is no longer zero and the modes mix. Move the one-sided layer away from the slab and watch the coupling die: that is Johnson's point that a thick enough buffer, like the air gap above a DBR, keeps the classification approximately valid.`,
eq: String.raw`\[ \kappa_{12} \propto \int \Delta\varepsilon(z)\, E_{1}(z)\, E_{2}(z)\, \mathrm{d}z \]\[ \Delta\varepsilon \text{ even},\ E_{1} \text{ even},\ E_{2} \text{ odd} \;\Longrightarrow\; \text{integrand odd} \;\Longrightarrow\; \kappa_{12} = 0 \]`,
sym: [[String.raw`\(\kappa_{12}\)`, "coupling coefficient between modes 1 and 2 (coupled-mode theory)"], [String.raw`\(\Delta\varepsilon(z)\)`, "change in permittivity, here a thin layer"], [String.raw`\(E_{1}, E_{2}\)`, "mode profiles, even (TE0) and odd (TE1)"]],
how: [String.raw`Coupled-mode theory: a perturbation \(\Delta\varepsilon\) couples two modes with strength \(\propto \int \Delta\varepsilon\, E_1 \cdot E_2^*\).`, "An odd function integrates to zero over a symmetric interval.", "Even × odd × even = odd, so a symmetric perturbation cannot couple an even mode to an odd one.", "A one-sided perturbation is neither even nor odd, so coupling appears. It shrinks as the perturbation moves into the weak evanescent tail."],
say: "A structure that keeps the mid-plane symmetry cannot couple even and odd modes, so it cannot convert TE-like into TM-like light. Breaking the symmetry, for example with a substrate on one side, allows coupling that decays with the gap.",
num: String.raw`Symmetric layers on both sides: coupling exactly <b>0</b>.<br>One-sided layer touching the slab: largest coupling. Moving it out by a few decay lengths \(1/\gamma\) reduces it by orders of magnitude (see the readout).`,
r(fig, ctl) {
  let mode = "one";
  ctl.innerHTML = btns([["one", "layer below only"], ["both", "layers above and below"]], "m") + sl("d", "Gap between slab and layer", 0, 400, 5, 40) + '<div class="readout" id="ro"></div>';
  const t = 300, n = 3.5, lam = 800, zs = range(-700, 700, 1401);
  const N0 = C2.slabN(n, 1, t, lam, 0, "TE"), N1 = C2.slabN(n, 1, t, lam, 1, "TE");
  const e = C2.slabProfile(n, 1, t, lam, 0, "TE", N0, zs).main, o = C2.slabProfile(n, 1, t, lam, 1, "TE", N1, zs).main;
  const nrm = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0)); const ne = nrm(e), no = nrm(o);
  let ref = null;
  const u = () => {
    pick(ctl, "m", mode); const d = +$("d").value; $("dv").textContent = d + " nm";
    const lay = z => { const lo = -t / 2 - d - 20, hi = -t / 2 - d; const below = z >= lo && z <= hi; const above = z <= -lo && z >= -hi; return below || (mode === "both" && above) ? 1 : 0; };
    let k = 0; const integ = zs.map((z, i) => { const v = lay(z) * e[i] * o[i] / (ne * no); k += v; return v; });
    if (ref === null) { let r = 0; zs.forEach((z, i) => { const lo = -t / 2 - 20, hi = -t / 2; if (z >= lo && z <= hi) r += e[i] * o[i] / (ne * no); }); ref = Math.abs(r); }
    const rel = Math.abs(k) / ref;
    const X = z => 60 + (z + 700) / 1400 * 560;
    let layers = ""; const ly = (lo, hi) => `<rect x="${X(lo)}" y="30" width="${X(hi) - X(lo)}" height="200" fill="#D85A30" opacity="0.18"/>`;
    layers += ly(-t / 2 - d - 20, -t / 2 - d); if (mode === "both") layers += ly(t / 2 + d, t / 2 + d + 20);
    fig.innerHTML = svg(270, `<rect x="${X(-t / 2)}" y="30" width="${X(t / 2) - X(-t / 2)}" height="200" fill="var(--blue-bg)"/>${layers}<line x1="60" x2="620" y1="130" y2="130" stroke="var(--p)" stroke-width="0.5"/>${plot(60, 30, 560, 200, zs, e, -700, 700, -1.1, 1.1, "#378ADD", 2)}${plot(60, 30, 560, 200, zs, o, -700, 700, -1.1, 1.1, "#7F77DD", 2, "5 4")}<text class="ts" x="66" y="46">blue TE0 (even), purple TE1 (odd). Coral: perturbing layer(s)</text><text class="ts" x="340" y="252" text-anchor="middle">z from −700 to 700 nm, slab 300 nm thick</text>`);
    $("ro").innerHTML = `<div><span>coupling ∝ |∫Δε E₀E₁|</span><b>${mode === "both" ? "0 (exact)" : rel.toExponential(2)}</b></div><div><span>relative to touching layer</span><b>${mode === "both" ? "0" : (rel * 100).toFixed(2) + " %"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { mode = b.dataset.m; u(); });
  $("d").oninput = u; u();
}}
],
summary: String.raw`Under a mirror, \(\mathbf{E}\) flips its normal component and \(\mathbf{H}\), an axial vector, flips its tangential components. A membrane symmetric about its mid-plane has only even and odd modes: even ones have only in-plane \(\mathbf{E}\) at the mid-plane and are TE-like, odd ones have only \(E_z\) there and are TM-like. An even mode satisfies the PMC condition on the mid-plane and an odd mode the PEC condition, so an FDTD solver can replace the plane by a PMC (Tidy3D +1) or PEC (−1) wall and simulate half the domain. The value depends on the plane: TE0 needs +1 at \(z = 0\) but −1 at \(y = 0\). A symmetric structure cannot couple even and odd modes, and a one-sided substrate breaks this only weakly if a gap separates it.`,
sheet: [
[String.raw`\[ \mathbf{E}:\ (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}) \]\[ \mathbf{H}:\ (H_{x}, H_{y}, H_{z}) \to (-H_{x}, -H_{y}, H_{z}) \]`, String.raw`Mirror \(z \to -z\)`],
[String.raw`\[ M[\mathbf{E}] = \sigma\mathbf{E}, \qquad \sigma = \pm 1 \]`, "Even and odd modes"],
[String.raw`\[ \text{PEC: } \hat{\mathbf{n}} \times \mathbf{E} = 0, \qquad \text{PMC: } \hat{\mathbf{n}} \times \mathbf{H} = 0 \]`, "Ideal walls"],
[String.raw`\[ \text{Tidy3D: } +1 = \text{even} = \text{PMC}, \qquad -1 = \text{odd} = \text{PEC} \]`, "Symmetry values"],
[String.raw`\[ z = 0:\ \text{TE0 } {+1},\ \text{TM0 } {-1}; \qquad y = 0:\ \text{TE0 } {-1},\ \text{TM0 } {+1} \]`, "Which value keeps which mode"],
[String.raw`\[ \frac{N_{\mathrm{cells}}}{2^{s}} \]`, String.raw`Cost with \(s\) planes`],
[String.raw`\[ \kappa_{12} \propto \int \Delta\varepsilon\, E_{1} E_{2}\, \mathrm{d}z \]`, "Coupling by a perturbation"]],
consts: String.raw`Card 6 uses a 300 nm slab, \(n = 3.5\), 800 nm, so that TE1 is well guided.`,
sources: ["Johnson et al., Phys. Rev. B 60, 5751 (1999) (even and odd classes, symmetry breaking by a substrate, buffer layer)", "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006) (parity table of slab modes)", "Tidy3D documentation, Simulation.symmetry (+1 PMC, −1 PEC)"]
});
