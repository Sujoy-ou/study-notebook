(function () {
/* Journal Club, Weber et al. 2010. Lesson 2: defects and deep centers.
   Point-defect sketches, the hydrogenic (shallow donor) model, a nuclear spin bath slice,
   a rotatable 3D diamond cluster with the NV center, and charge states set by the Fermi level. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;

/* simple seeded random so the spin bath does not flicker when sliders move */
const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* diamond cluster around a vacancy at the origin, in units of the cubic lattice constant a */
const DIA = (() => {
  const fcc = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]], pts = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++)
    for (const f of fcc) for (const b of [[0, 0, 0], [.25, .25, .25]]) {
      const p = [i + f[0] + b[0], j + f[1] + b[1], k + f[2] + b[2]];
      if (Math.hypot(...p) < 0.72) pts.push(p);
    }
  const bonds = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
    if (Math.abs(d - Math.sqrt(3) / 4) < 0.01) bonds.push([i, j]);
  }
  return { pts, bonds };
})();

addLesson("jc", "weber", {
level: "Basic",
id: "jc-weber-l2", title: "Defects and deep centers", short: "2. Defects and deep centers",
labels: { note: "Journal club note" },
big: String.raw`The NV center is a <b>point defect</b>: a missing carbon atom (a vacancy) with a nitrogen atom sitting next to it. The paper argues that NV works because it is a <b>deep center</b>, meaning its electrons are held within about one lattice constant of the defect, with energy levels far from both bands. This lesson builds that picture. Card 1 shows the kinds of point defects and the broken bonds they leave. Card 2 contrasts a shallow donor, whose electron spreads over thousands of atoms, with a deep center. Card 3 shows why a small orbital protects the spin from the magnetic nuclei around it. Card 4 lets you rotate the real 3D structure of NV in diamond. Card 5 shows how the Fermi level decides how many electrons the defect holds, which decides its spin.`,
cards: [
{ s: "1. Point defects", t: "The point defect zoo, and the broken bonds a vacancy leaves",
intu: String.raw`In diamond every carbon atom bonds to four neighbors (drawn here flattened onto a square grid). A <b>vacancy</b> removes one atom, and its four neighbors are left with one unpaired bond each, pointing into the empty site. These are <b>dangling bonds</b> (red), and their electrons are what make the defect interesting. A <b>substitutional</b> impurity replaces a host atom. An <b>interstitial</b> squeezes in between. A <b>complex</b> combines them: NV is a nitrogen on a carbon site right next to a vacancy. Count the electrons left in the dangling bonds: each carbon neighbor keeps 1, the nitrogen keeps 2 (it has 5 valence electrons and still makes 3 bonds), so NV holds 5 electrons, and capturing one more from the crystal makes NV⁻ with 6.`,
eq: String.raw`\[ n_e = \sum_{\text{neighbors}} \left( v_i - b_i \right) - q \]\[ \text{NV}^-:\quad 3 \times (4 - 3) + (5 - 3) - (-1) = 6 \]`,
sym: [[String.raw`\(n_e\)`, "electrons that live in the defect's dangling bond orbitals"], [String.raw`\(v_i\)`, "valence electrons of neighbor i (C: 4, N: 5, Si: 4)"], [String.raw`\(b_i\)`, "bonds neighbor i still makes to the crystal (3 next to a vacancy)"], [String.raw`\(q\)`, "charge state of the defect, −1 means one extra electron"]],
how: [String.raw`Each covalent bond holds two electrons, one from each atom.`, String.raw`Remove an atom and each neighbor has one electron that no longer has a partner: a half-filled dangling bond.`, String.raw`A nitrogen neighbor has one more valence electron than carbon, so its dangling bond is full (2 electrons).`, String.raw`The defect can trade electrons with the rest of the crystal. A negative charge state \(q\) adds \(|q|\) electrons.`],
say: String.raw`NV⁻ is a substitutional nitrogen next to a carbon vacancy, and its six electrons come from three carbon dangling bonds, the nitrogen lone pair and one electron captured from the lattice.`,
num: String.raw`Vacancy in diamond, neutral: 4 × 1 = <b>4 electrons</b>. NV⁰: 3 + 2 = <b>5</b>. NV⁻: <b>6</b>. Silicon vacancy in SiC: its 4 neighbors are carbon, so \(V_{\text{Si}}^0\) has 4, \(V_{\text{Si}}^-\) 5 and \(V_{\text{Si}}^{2-}\) 6, exactly the counts in Table 1 of the paper.`,
r(fig, ctl) {
  let k = 4; const N = ["perfect crystal", "vacancy", "substitutional", "interstitial", "NV complex"];
  ctl.innerHTML = `<div class="row">${N.map((t, i) => `<button data-k="${i}">${t}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const g = 64, x0 = 340 - 2 * g, y0 = 40, n = 5, at = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) at.push({ i, j, x: x0 + i * g, y: y0 + j * g, t: "C" });
    const ctr = at.find(a => a.i === 2 && a.j === 2), nb = at.find(a => a.i === 3 && a.j === 2);
    if (k === 1 || k === 4) ctr.t = "V"; if (k === 2) ctr.t = "X"; if (k === 4) nb.t = "N";
    let s = "";
    at.forEach(a => {
      [[1, 0], [0, 1]].forEach(([di, dj]) => { const b = at.find(c => c.i === a.i + di && c.j === a.j + dj); if (!b) return;
        if (a.t === "V" || b.t === "V") return; s += ln(a.x, a.y, b.x, b.y, "var(--b)", 5, null, 'stroke-linecap="round"'); });
      [[-1, 0], [0, -1]].forEach(([di, dj]) => { if (a.i + di < 0 || a.j + dj < 0) s += ln(a.x, a.y, a.x + di * g / 2, a.y + dj * g / 2, "var(--b)", 5); });
      [[1, 0], [0, 1]].forEach(([di, dj]) => { if (a.i + di >= n || a.j + dj >= n) s += ln(a.x, a.y, a.x + di * g / 2, a.y + dj * g / 2, "var(--b)", 5); });
    });
    let ndb = 0, ne = 0;
    if (ctr.t === "V") at.filter(a => Math.abs(a.i - 2) + Math.abs(a.j - 2) === 1).forEach(a => { ndb++; const dx = (ctr.x - a.x) * 0.38, dy = (ctr.y - a.y) * 0.38;
      s += `<ellipse cx="${a.x + dx}" cy="${a.y + dy}" rx="${Math.abs(dx) > 1 ? 14 : 8}" ry="${Math.abs(dy) > 1 ? 14 : 8}" fill="${C.coral}" fill-opacity="0.35" stroke="${C.coral}"/>`;
      const e = a.t === "N" ? 2 : 1; ne += e; for (let q = 0; q < e; q++) s += ci(a.x + dx + (e > 1 ? (q - 0.5) * 9 : 0) * (Math.abs(dy) > 1 ? 1 : 0), a.y + dy + (e > 1 ? (q - 0.5) * 9 : 0) * (Math.abs(dx) > 1 ? 1 : 0), 3.5, C.blue); });
    at.forEach(a => {
      if (a.t === "V") s += `<circle cx="${a.x}" cy="${a.y}" r="15" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(a.x, a.y + 4, "V", "middle", "th");
      else s += ci(a.x, a.y, 15, a.t === "N" ? C.blue : a.t === "X" ? C.purple : "var(--gray-bg)", "var(--p)") + tx(a.x, a.y + 5, a.t === "X" ? "X" : a.t, "middle", "th", a.t === "N" || a.t === "X" ? 'fill="#fff"' : "");
    });
    if (k === 3) s += ci(x0 + 2.5 * g, y0 + 1.5 * g, 11, C.amber, "var(--p)") + tx(x0 + 2.5 * g, y0 + 1.5 * g + 4, "i", "middle", "th", 'fill="#fff"') + tx(x0 + 2.5 * g + 16, y0 + 1.5 * g - 14, "interstitial atom", "start");
    const lab = ["every atom has 4 bonds, all paired", "4 dangling bonds point into the empty site", "a foreign atom X sits on a host site", "an extra atom sits between host sites", "N next to the vacancy: 3 C dangling bonds plus an N lone pair"][k];
    s += tx(340, 345, lab, "middle", "th");
    fig.innerHTML = svg(360, s);
    $("ro").innerHTML = `<div><span>dangling bonds</span><b>${ndb}</b></div><div><span>electrons in them (neutral)</span><b>${ne}</b></div><div><span>after capturing one electron</span><b>${ne ? ne + 1 : "n/a"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{ s: "2. Shallow or deep", t: "Shallow donors spread out, deep centers stay put",
intu: String.raw`A phosphorus atom in silicon gives away one extra electron. That electron is bound only weakly, like a hydrogen atom living inside a material that screens the charge (dielectric constant \(\varepsilon_r\)) and makes the electron light (effective mass \(m^*\)). The result is a <b>shallow</b> level a few tens of meV below the conduction band, with an orbit several nanometers wide covering thousands of atoms. A <b>deep</b> center is different. Its electrons sit in dangling bond orbitals tied to a few atoms, the level lies deep in the gap (eV, not meV), and the orbit is about one lattice constant across. The hydrogen model fails completely for it. Try the presets: for nitrogen in diamond the hydrogen model predicts 0.24 eV, but the real donor level is about 1.9 eV below the band, as the paper notes. The gray dots show the host lattice to scale.`,
eq: String.raw`\[ E_b = \frac{m^*/m_0}{\varepsilon_r^2}\times 13.6\ \text{eV}, \qquad a^* = \frac{\varepsilon_r}{m^*/m_0}\times 0.0529\ \text{nm} \]`,
sym: [[String.raw`\(E_b\)`, "binding energy of the donor electron below the conduction band"], [String.raw`\(a^*\)`, "effective Bohr radius, the size of the orbit"], [String.raw`\(m^*/m_0\)`, "conduction band effective mass in units of the free electron mass"], [String.raw`\(\varepsilon_r\)`, "relative dielectric constant of the host"]],
how: [String.raw`Hydrogen: \(E = 13.6\) eV and \(a_0 = 0.0529\) nm, both set by the electron mass and the vacuum Coulomb force.`, String.raw`In a crystal the Coulomb force is screened by \(\varepsilon_r\), and the electron moves with mass \(m^*\).`, String.raw`Energy scales as \(m^*/\varepsilon_r^2\), radius as \(\varepsilon_r/m^*\). Large \(\varepsilon_r\) and small \(m^*\) give a shallow, huge orbit.`, String.raw`This only works if the orbit is much bigger than the lattice constant, so the electron sees an average crystal. When \(a^*\) comes out near one lattice constant, the model is not valid and the center is deep.`],
say: String.raw`A shallow donor is a hydrogen-like state with meV binding and a nanometer orbit, while a deep center is localized within about one lattice constant with levels deep in the gap.`,
num: String.raw`GaAs donor: \(m^* = 0.067\), \(\varepsilon_r = 12.9\): \(E_b = 5.5\) meV, \(a^* = 10\) nm. Si donor (model): \(m^* = 0.26\), \(\varepsilon_r = 11.7\): 26 meV, 2.4 nm (measured P: 45 meV). Diamond: \(m^* \approx 0.57\), \(\varepsilon_r = 5.7\): model 0.24 eV, 0.53 nm, but N is really ~1.9 eV deep.`,
r(fig, ctl) {
  const PR = [["GaAs donor", 0.067, 12.9, 0.565, 1.42, null], ["Si : P", 0.26, 11.7, 0.543, 1.12, null], ["diamond, H model", 0.57, 5.7, 0.357, 5.47, null], ["deep center (NV)", 0.57, 5.7, 0.357, 5.47, [2.0, 0.25]]];
  let p = 1;
  ctl.innerHTML = `<div class="row">${PR.map((x, i) => `<button data-p="${i}">${x[0]}</button>`).join("")}</div>` + sl("m", "m*/m₀", 0.03, 1, 0.005, 0.26) + sl("e", "ε_r", 3, 16, 0.1, 11.7) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "p", p);
    const m = +$("m").value, e = +$("e").value; $("mv").textContent = fmt(m, 3); $("ev").textContent = fmt(e, 1);
    const pr = PR[p], deep = pr[5], a = pr[3], Eg = pr[4];
    const Eb = deep ? deep[0] : 13.6 * m / (e * e), r = deep ? deep[1] : 0.0529 * e / m;
    // left: real-space picture, 6 nm wide window scaled so lattice dots are visible
    const W = 360, view = Math.max(3, Math.min(30, 4 * r)), sc = W / view, cx = 200, cy = 175;
    let s = `<clipPath id="cl2"><rect x="20" y="20" width="${W}" height="310"/></clipPath><g clip-path="url(#cl2)">`;
    const step = a * sc;
    if (step > 4) for (let x = cx % step; x < 20 + W; x += step) for (let y = cy % step; y < 330; y += step) s += ci(x, y, Math.min(3, step / 4), "var(--b)");
    else s += rc(20, 20, W, 310, "var(--gray-bg)");
    s += `<radialGradient id="wf2"><stop offset="0" stop-color="${C.blue}" stop-opacity="0.75"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${(2.5 * r * sc).toFixed(1)}" fill="url(#wf2)"/><circle cx="${cx}" cy="${cy}" r="${(r * sc).toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="2" stroke-dasharray="5 3"/>`;
    s += ci(cx, cy, 5, deep ? C.coral : C.purple) + `</g>` + rc(20, 20, W, 310, "none", "var(--b)");
    s += ln(30, 318, 30 + sc, 318, "var(--t)", 2) + tx(30 + sc / 2, 312, "1 nm", "middle");
    s += tx(200, 348, `orbit radius ${fmt(r, 2)} nm = ${fmt(r / a, 1)} lattice constants`, "middle", "th");
    // right: energy picture
    const B = JC.bands(440, 30, 200, 300, Eg, -0.6, Eg + 0.6);
    s += B.s + tx(540, B.Y(Eg / 2) + 4, `gap ${Eg} eV`, "middle");
    const yl = B.Y(Eg - Eb);
    s += ln(470, yl, 610, yl, deep ? C.coral : C.purple, 3) + `<line x1="625" y1="${B.Y(Eg)}" x2="625" y2="${yl}" stroke="var(--p)" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(540, yl + 18, `E_b = ${Eb < 0.1 ? fmt(Eb * 1000, 1) + " meV" : fmt(Eb, 2) + " eV"}`, "middle", "th");
    fig.innerHTML = svg(360, s);
    $("ro").innerHTML = `<div><span>binding energy</span><b>${Eb < 0.1 ? fmt(Eb * 1000, 1) + " meV" : fmt(Eb, 2) + " eV"}</b></div><div><span>orbit radius</span><b>${fmt(r, 2)} nm</b></div><div><span>atoms inside the orbit</span><b>≈ ${sci(4 / 3 * Math.PI * r ** 3 * 8 / a ** 3, 1)}</b></div><div><span>picture</span><b>${deep ? "deep" : r / a > 3 ? "shallow" : "model breaks"}</b></div>`;
  };
  const set = i => { p = i; if (!PR[i][5]) { $("m").value = PR[i][1]; $("e").value = PR[i][2]; } u(); };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => set(+b.dataset.p));
  $("m").oninput = () => { if (PR[p][5]) p = 2; u(); }; $("e").oninput = () => { if (PR[p][5]) p = 2; u(); }; u();
}},

{ s: "3. A quiet neighborhood", t: "Why a small orbit protects the spin",
intu: String.raw`The main enemy of a spin qubit is magnetic noise, and in a clean crystal the noise comes from <b>nuclear spins</b>. In diamond 98.9 % of carbon is \(^{12}\)C with no nuclear spin, and 1.1 % is \(^{13}\)C, which is a tiny magnet (orange dots). An electron spread over a large orbit touches many of them. A deep center's orbit is about one lattice constant, so very few nuclei sit inside it and the remaining ones are far away and weakly coupled. That is the paper's first reason for NV's long coherence. The second lever is the material: purify the isotopes (criterion H4) and the bath almost disappears. Slide the orbit size and the \(^{13}\)C fraction and count the magnetic nuclei inside the electron's reach.`,
eq: String.raw`\[ \langle N_{\text{nuc}} \rangle = \tfrac{4}{3}\pi r^3\, n_{\text{at}}\, c \qquad (n_{\text{at}} = 176\ \text{nm}^{-3}\ \text{in diamond}) \]\[ T_2 \propto c^{-1} \quad \text{(dilute bath)} \]`,
sym: [[String.raw`\(r\)`, "radius of the electron orbit"], [String.raw`\(n_{\text{at}}\)`, "atom density of the host"], [String.raw`\(c\)`, "fraction of lattice sites with a nuclear spin (natural diamond: 0.011)"], [String.raw`\(\langle N_{\text{nuc}}\rangle\)`, "average number of nuclear spins inside the orbit"]],
how: [String.raw`The electron feels each nucleus inside its orbit through the hyperfine interaction, and nuclei further out through weaker dipolar fields.`, String.raw`The nuclei slowly flip-flop with each other, so the field they make at the electron fluctuates.`, String.raw`Fewer nuclei means a smaller and slower fluctuating field, so the phase drifts less.`, String.raw`For a dilute bath, \(T_2\) grows roughly in inverse proportion to the spin concentration. Isotopically purified \(^{12}\)C diamond gave the 1.8 ms quoted in the paper.`],
say: String.raw`A deep center's compact orbit overlaps few nuclear spins, and isotopic purification of the host removes most of the remaining spin bath, which is why NV keeps its coherence for milliseconds.`,
num: String.raw`Natural diamond, \(r = 0.25\) nm: \(\tfrac{4}{3}\pi (0.25)^3 \times 176 \times 0.011 = 0.13\) nuclear spins inside the orbit. A shallow donor with \(r = 2.4\) nm in natural Si (\(n_{\text{at}} = 50\) nm\(^{-3}\), \(c = 0.047\)) has about 136.`,
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Orbit radius r (nm)", 0.15, 3, 0.05, 0.4) + sl("c", "¹³C fraction (log)", -4, -1, 0.05, Math.log10(0.011)) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const r = +$("r").value, c = Math.pow(10, +$("c").value); $("rv").textContent = fmt(r, 2) + " nm"; $("cv").textContent = c >= 0.01 ? fmt(c * 100, 1) + " %" : fmt(c * 100, 3) + " %";
    const view = 8, sc = 560 / view, a = 0.178 /* 2D projected site spacing for display */, R = rnd(7);
    let s = `<clipPath id="cl3"><rect x="60" y="20" width="560" height="300"/></clipPath><g clip-path="url(#cl3)">`;
    s += `<radialGradient id="wf3"><stop offset="0" stop-color="${C.blue}" stop-opacity="0.6"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>`;
    s += `<circle cx="340" cy="170" r="${(2 * r * sc).toFixed(1)}" fill="url(#wf3)"/>`;
    let inside = 0, tot = 0;
    for (let x = 0; x < view; x += a) for (let y = 0; y < 300 / sc; y += a) {
      const hit = R() < c * 3; // the 2D slice shows a projection of a slab, so we show 3× density for visibility
      const px = 60 + x * sc, py = 20 + y * sc;
      if (hit) { tot++; const d = Math.hypot(px - 340, py - 170) / sc; if (d < r) inside++; s += ci(px, py, 3.5, C.coral); }
    }
    s += `<circle cx="340" cy="170" r="${(r * sc).toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="2" stroke-dasharray="5 3"/>` + ci(340, 170, 5, C.purple) + `</g>` + rc(60, 20, 560, 300, "none", "var(--b)");
    s += ln(70, 308, 70 + sc, 308, "var(--t)", 2) + tx(70 + sc / 2, 302, "1 nm", "middle");
    s += tx(340, 345, "orange: nuclear spins (¹³C), purple: defect, blue: electron orbit", "middle");
    fig.innerHTML = svg(355, s);
    const N3 = 4 / 3 * Math.PI * r ** 3 * 176 * c;
    $("ro").innerHTML = `<div><span>nuclear spins inside orbit (3D average)</span><b>${fmt(N3, N3 < 1 ? 3 : 1)}</b></div><div><span>T₂ relative to natural diamond</span><b>× ${fmt(0.011 / c, c > 0.005 ? 2 : 0)}</b></div>`;
  };
  $("r").oninput = u; $("c").oninput = u; u();
}},

{ s: "4. NV in 3D", t: "The real structure: rotate the NV center in diamond",
intu: String.raw`Here is a cluster of diamond around the NV center, drawn to scale. Every carbon (gray) sits in a tetrahedron of four neighbors. At the center one carbon is missing (dashed ring), and one of its four neighbors has been replaced by nitrogen (blue). The line from the nitrogen through the vacancy is the <b>NV axis</b>, along a [111] crystal direction. Rotating the defect by 120° around this axis leaves it unchanged, and so do three mirror planes that contain the axis: this symmetry group is called \(C_{3v}\). It is lower than the full tetrahedral symmetry \(T_d\) of a plain vacancy, and lesson 5 shows that this drop in symmetry is exactly what splits the levels into the NV pattern. Drag the sliders or press Play to spin the cluster. Turn on the dangling bonds to see the three carbon orbitals pointing into the hole.`,
eq: String.raw`\[ d_{\text{C-C}} = \frac{\sqrt{3}}{4}a = 0.154\ \text{nm}, \qquad a_{\text{diamond}} = 0.357\ \text{nm} \]\[ T_d \;\longrightarrow\; C_{3v}: \quad \text{axis} \parallel [111] \]`,
sym: [[String.raw`\(a\)`, "cubic lattice constant of diamond"], [String.raw`\(d_{\text{C-C}}\)`, "nearest neighbor bond length"], [String.raw`\(T_d\)`, "tetrahedral symmetry: all four neighbors of a site equivalent"], [String.raw`\(C_{3v}\)`, "threefold axis plus three mirror planes, the symmetry of NV"]],
how: [String.raw`Diamond is two interpenetrating fcc lattices shifted by \((\tfrac14, \tfrac14, \tfrac14)a\), so every atom has four neighbors at the corners of a tetrahedron.`, String.raw`Remove one atom: its four neighbors are equivalent, so the vacancy keeps \(T_d\) symmetry.`, String.raw`Replace one neighbor by N: only rotations about the N to vacancy line and mirrors through it still map the defect onto itself. That is \(C_{3v}\).`, String.raw`There are four [111] directions, so NV centers in a crystal come in four orientations.`],
say: String.raw`NV⁻ is a nitrogen on a carbon site next to a carbon vacancy, with its symmetry axis along a [111] bond direction and C3v point symmetry.`,
num: String.raw`Bond length 0.154 nm. Distance between two carbon neighbors of the vacancy: \(a/\sqrt{2} = 0.252\) nm. In 4H-SiC the same distance is about 0.308 nm, which is why the dangling bonds overlap less there (lesson 6).`,
r(fig, ctl) {
  ctl.innerHTML = sl("yw", "Rotate (yaw)", 0, 360, 1, 35) + sl("pt", "Tilt", -60, 60, 1, 20) + `<div class="row"><button id="db">Show dangling bonds</button><button id="ax">Show NV axis</button></div>`;
  let show = true, axon = true, yawAdd = 0;
  const draw = () => {
    const yaw = (+$("yw").value + yawAdd) * Math.PI / 180, pit = +$("pt").value * Math.PI / 180;
    $("ywv").textContent = $("yw").value + "°"; $("ptv").textContent = $("pt").value + "°";
    const P = p => JC.proj(p, yaw, pit, 215, 340, 170), V = [0, 0, 0], Npos = [.25, .25, .25];
    const items = [];
    DIA.bonds.forEach(([i, j]) => { const a = DIA.pts[i], b = DIA.pts[j]; if (Math.hypot(...a) < 1e-6 || Math.hypot(...b) < 1e-6) return; const pa = P(a), pb = P(b); items.push({ z: (pa[2] + pb[2]) / 2 + 0.01, s: ln(pa[0], pa[1], pb[0], pb[1], "var(--b)", 4, null, 'stroke-linecap="round"') }); });
    DIA.pts.forEach(p => {
      const q = P(p), isV = Math.hypot(...p) < 1e-6, isN = Math.hypot(p[0] - Npos[0], p[1] - Npos[1], p[2] - Npos[2]) < 1e-6;
      const sh = 1 - 0.25 * (q[2] + 0.8) / 1.6, rr = (isN ? 15 : 12) * sh;
      if (isV) items.push({ z: q[2], s: `<circle cx="${q[0]}" cy="${q[1]}" r="14" fill="none" stroke="var(--p)" stroke-width="1.5" stroke-dasharray="4 3"/>` + tx(q[0], q[1] + 4, "V", "middle", "th") });
      else items.push({ z: q[2], s: ci(q[0], q[1], rr, isN ? C.blue : "var(--gray-bg)", "var(--p)") + (isN ? tx(q[0], q[1] + 5, "N", "middle", "th", 'fill="#fff"') : "") });
    });
    if (show) [[.25, .25, .25], [-.25, -.25, .25], [-.25, .25, -.25], [.25, -.25, -.25]].forEach((p, k) => {
      const m = [p[0] * 0.55, p[1] * 0.55, p[2] * 0.55], q = P(m), o = P(p);
      items.push({ z: q[2] - 0.02, s: `<ellipse cx="${(q[0] + o[0]) / 2}" cy="${(q[1] + o[1]) / 2}" rx="${Math.max(6, Math.hypot(q[0] - o[0], q[1] - o[1]) / 1.6)}" ry="8" transform="rotate(${Math.atan2(q[1] - o[1], q[0] - o[0]) * 180 / Math.PI} ${(q[0] + o[0]) / 2} ${(q[1] + o[1]) / 2})" fill="${k === 0 ? C.blue : C.coral}" fill-opacity="0.45" stroke="${k === 0 ? C.blue : C.coral}"/>` });
    });
    items.sort((a, b) => b.z - a.z);
    let s = items.map(i => i.s).join("");
    if (axon) { const a = P([.55, .55, .55]), b = P([-.45, -.45, -.45]); s += `<line x1="${b[0]}" y1="${b[1]}" x2="${a[0]}" y2="${a[1]}" stroke="${C.purple}" stroke-width="2.5" stroke-dasharray="7 4" marker-end="url(#ar)"/>` + tx(a[0] + 6, a[1] - 4, "NV axis [111]", "start", "th"); }
    s += tx(340, 350, "gray: C, blue: N, dashed ring: vacancy" + (show ? ", lobes: dangling bonds (blue = N lone pair)" : ""), "middle");
    fig.innerHTML = svg(360, s);
  };
  $("yw").oninput = draw; $("pt").oninput = draw;
  $("db").onclick = () => { show = !show; $("db").classList.toggle("on", show); draw(); };
  $("ax").onclick = () => { axon = !axon; $("ax").classList.toggle("on", axon); draw(); };
  $("db").classList.add("on"); $("ax").classList.add("on");
  JC.player(ctl, t => { yawAdd = t * 30; draw(); }, "Play rotation");
}},

{ s: "5. Charge and Fermi level", t: "The Fermi level decides how many electrons NV holds",
intu: String.raw`A defect can hold different numbers of electrons, and each number is a different <b>charge state</b> with a different spin. Which one you get depends on the <b>Fermi level</b> \(\varepsilon_F\), the energy up to which the crystal is filled with electrons. Think of the defect as a cup with marked levels: when \(\varepsilon_F\) rises above a marked level (a <b>charge transition level</b>), one more electron pours in. For NV the paper finds that the useful NV⁻ state (6 electrons, spin 1) is stable for \(\varepsilon_F\) between 2.78 and 5.14 eV above the valence band. In nitrogen-doped diamond the nitrogen donors pin \(\varepsilon_F\) near 3.5 eV, inside that window, so NV⁻ forms naturally. Slide \(\varepsilon_F\) to see the charge, electron count and spin.`,
eq: String.raw`\[ q(\varepsilon_F) = \begin{cases} +1 & \varepsilon_F \lt \varepsilon(+/0) \\ 0 & \varepsilon(+/0) \lt \varepsilon_F \lt \varepsilon(0/-) \\ -1 & \varepsilon(0/-) \lt \varepsilon_F \lt \varepsilon(-/2-) \\ -2 & \varepsilon_F \gt \varepsilon(-/2-) \end{cases} \]`,
sym: [[String.raw`\(\varepsilon_F\)`, "Fermi level, measured from the valence band maximum (VBM)"], [String.raw`\(\varepsilon(q/q')\)`, "charge transition level: the Fermi level where states q and q' cost the same energy"], [String.raw`\(q\)`, "charge state of the defect"], [String.raw`\(S\)`, "total spin of the defect electrons"]],
how: [String.raw`Adding an electron to the defect takes it from the electron reservoir at \(\varepsilon_F\).`, String.raw`If \(\varepsilon_F\) lies above the energy needed to add it, the defect gains the electron and becomes more negative.`, String.raw`The crossover energies are the charge transition levels. Lesson 6 shows how they come out of the formation energy plot (Fig. 2).`, String.raw`Each charge state fills the dangling bond levels differently, so each has its own spin. Only some are paramagnetic, which is criterion D1.`],
say: String.raw`The charge state of NV is set by the Fermi level, and NV⁻ with spin 1 is the stable state for Fermi levels between 2.78 and 5.14 eV above the valence band maximum, which N doping provides.`,
num: String.raw`Calculated gap (HSE06) 5.36 eV. Transition levels: \(\varepsilon(0/-) = 2.78\) eV, \(\varepsilon(-/2-) = 5.14\) eV (from the text), \(\varepsilon(+/0) \approx 0.7\) eV (read from Fig. 2A). N donor level about 1.9 eV below the CBM, so about 3.5 eV above the VBM.`,
r(fig, ctl) {
  ctl.innerHTML = sl("ef", "Fermi level ε_F (eV)", 0, 5.36, 0.01, 3.5) + `<div class="readout" id="ro"></div>`;
  const ST = [[0, 0.7, "+1", 4, "0", C.gray], [0.7, 2.78, "0", 5, "1/2", C.teal], [2.78, 5.14, "−1", 6, "1", C.coral], [5.14, 5.36, "−2", 7, "1/2", C.purple]];
  const u = () => {
    const ef = +$("ef").value; $("efv").textContent = fmt(ef, 2) + " eV";
    const st = ST.find(x => ef >= x[0] && ef <= x[1]) || ST[3];
    const B = JC.bands(70, 30, 250, 290, 5.36, -0.6, 6.0);
    let s = B.s;
    ST.forEach(x => { s += rc(330, B.Y(x[1]), 40, B.Y(x[0]) - B.Y(x[1]), x[5], "var(--panel)", 'fill-opacity="' + (x === st ? 0.85 : 0.25) + '"') + tx(378, (B.Y(x[0]) + B.Y(x[1])) / 2 + 4, "NV" + (x[2] === "+1" ? "⁺" : x[2] === "0" ? "⁰" : x[2] === "−1" ? "⁻" : "²⁻"), "start", x === st ? "th" : "ts"); });
    [[0.7, "ε(+/0) ≈ 0.7"], [2.78, "ε(0/−) = 2.78"], [5.14, "ε(−/2−) = 5.14"]].forEach(([e, l]) => s += ln(80, B.Y(e), 310, B.Y(e), "var(--p)", 1.5, "6 4") + tx(84, B.Y(e) - 5, l, "start"));
    s += rc(70, B.Y(ef), 250, B.Y(-0.6) - B.Y(ef), C.blue, "none", 'fill-opacity="0.12"') + ln(70, B.Y(ef), 320, B.Y(ef), C.blue, 2.5) + tx(316, B.Y(ef) - 6, "ε_F", "end", "th");
    s += ln(70, B.Y(3.5), 80, B.Y(3.5), C.amber, 4) + tx(84, B.Y(3.5) + 16, "N donors pin ε_F near 3.5 eV", "start");
    // cup picture
    const n = st[3], cx = 540;
    s += tx(cx, 40, `NV${st[2] === "+1" ? "⁺" : st[2] === "0" ? "⁰" : st[2] === "−1" ? "⁻" : "²⁻"} holds ${n} electrons`, "middle", "th");
    const lv = [["a₁(1)", 290, 2], ["a₁(2)", 220, 2], ["e", 130, 4]];
    let left = n; const sp = [];
    lv.forEach(([l, y, cap]) => { s += ln(cx - 70, y, cx + 70, y, "var(--p)", 3) + tx(cx + 78, y + 4, l, "start");
      const k = Math.min(cap, left); left -= k;
      if (cap === 2) { if (k >= 1) s += JC.up(cx - 12, y - 1, C.blue); if (k >= 2) s += JC.dn(cx + 12, y - 1, C.blue); }
      else { const ups = Math.min(2, k), dns = k - ups; for (let i = 0; i < ups; i++) s += JC.up(cx - 45 + i * 30, y - 1, C.blue); for (let i = 0; i < dns; i++) s += JC.dn(cx + 15 + i * 30, y - 1, C.blue); sp.push(ups - dns); } });
    s += tx(cx, 330, `spin S = ${st[4]}${st[4] === "1" ? ": a triplet, the qubit state" : st[4] === "0" ? ": not paramagnetic" : ""}`, "middle", "th");
    fig.innerHTML = svg(345, s);
    $("ro").innerHTML = `<div><span>charge state</span><b>${st[2]}</b></div><div><span>electrons</span><b>${n}</b></div><div><span>spin S</span><b>${st[4]}</b></div>`;
  };
  $("ef").oninput = u; u();
},
note: String.raw`<p>The (+/0) level of about 0.7 eV is read by eye from the kink in Fig. 2A. The paper gives only the NV⁻ window, 2.78 to 5.14 eV, in the text. The level filling on the right is the simple picture of lesson 5, with Hund's rule putting the two e electrons of NV⁻ parallel.</p>`}
],
summary: String.raw`Point defects are vacancies, substitutionals, interstitials and their complexes. NV is a nitrogen next to a carbon vacancy, with C₃ᵥ symmetry along [111]. Its electrons live in dangling bonds: 3 from carbon, 2 from nitrogen, plus 1 captured, giving 6 in NV⁻. Unlike a shallow hydrogen-like donor with a meV level and a nanometer orbit, NV is a deep center localized within about a lattice constant, with levels deep in the 5.5 eV gap. That compact orbit touches few nuclear spins, which helps protect coherence. The Fermi level picks the charge state, and NV⁻ (spin 1) is stable between 2.78 and 5.14 eV, which nitrogen doping provides.`,
sheet: [
[String.raw`\[ n_e = \sum_i (v_i - b_i) - q \]`, "Electron counting in dangling bonds"],
[String.raw`\[ E_b = 13.6\ \text{eV}\,\frac{m^*/m_0}{\varepsilon_r^2}, \quad a^* = 0.0529\ \text{nm}\,\frac{\varepsilon_r}{m^*/m_0} \]`, "Hydrogenic (shallow) donor"],
[String.raw`\[ \langle N_{\text{nuc}} \rangle = \tfrac43\pi r^3 n_{\text{at}} c, \quad T_2 \propto 1/c \]`, "Nuclear spins in reach of the orbit"],
[String.raw`\[ d = \tfrac{\sqrt3}{4}a, \quad T_d \to C_{3v} \]`, "Diamond bond length and NV symmetry"],
[String.raw`\[ \text{NV}^-:\ \varepsilon(0/-) = 2.78 \lt \varepsilon_F \lt \varepsilon(-/2-) = 5.14\ \text{eV} \]`, "Stability window of NV⁻"]],
consts: String.raw`\(a_{\text{diamond}} = 0.357\) nm, \(E_g\) = 5.47 eV (exp.), 5.36 eV (HSE06), \(^{13}\)C abundance 1.1 %`,
sources: ["Weber et al., PNAS 107, 8513 (2010), Fig. 2A and text", "Yu and Cardona, Fundamentals of Semiconductors, Ch. 4 (shallow and deep centers)", "Balasubramanian et al., Nat. Mater. 8, 383 (2009), isotopically engineered diamond", "Heremans et al., Appl. Phys. Lett. 94, 152102 (2009), N donor depth (paper ref. 22)"]
});
})();
