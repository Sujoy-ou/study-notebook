/* Lesson 2 of Chapter 2: thesis Sec. 2.2, first half (mirror symmetry, Johnson 1999, TE-like and TM-like, Eq. 2.1). */

/* Step-through controller of this file (same behaviour as in Lesson 1). */
const C2L2_stepper = (fig, n, draw, o) => {
  o = o || {};
  const RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const st = { k: o.start || 0, p: RM || o.full ? 1 : 0, playing: !!o.play && !RM, hold: 0, t: 0 };
  const D = () => { draw(st); $(o.p).textContent = st.playing ? "Pause" : "Play"; $(o.b).disabled = st.k === 0; $(o.n).disabled = st.k === n - 1; };
  const go = k => { st.k = Math.max(0, Math.min(n - 1, k)); st.p = RM ? 1 : 0; st.hold = 0; D(); };
  $(o.b).onclick = () => { st.playing = false; go(st.k - 1); };
  $(o.n).onclick = () => { st.playing = false; go(st.k + 1); };
  $(o.p).onclick = () => {
    if (st.playing) { st.playing = false; D(); return; }
    if (RM) { go(st.k < n - 1 ? st.k + 1 : 0); return; }
    st.playing = true; if (st.k >= n - 1) go(0); else D();
  };
  let last = performance.now();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; st.t = t;
    if (st.p < 1) { st.p = Math.min(1, st.p + dt / (o.dur || 0.9)); D(); }
    else if (st.playing) { st.hold += dt; if (st.hold > (o.hold || 2.8)) { if (st.k < n - 1) go(st.k + 1); else { st.playing = false; D(); } } }
  });
  D();
  return { st, redraw: D, go };
};

/* Fundamental (even) slab profile: cos inside |z| <= d/2, exponential tail outside, and its slope. */
const C2L2_prof = (nCore, N, d, lam) => {
  const k0 = 2 * Math.PI / lam, ka = k0 * Math.sqrt(Math.max(nCore * nCore - N * N, 0)), ga = k0 * Math.sqrt(Math.max(N * N - 1, 0)), e = Math.cos(ka * d / 2);
  return { ka, ga,
    f: z => Math.abs(z) <= d / 2 ? Math.cos(ka * z) : e * Math.exp(-ga * (Math.abs(z) - d / 2)),
    f1: z => Math.abs(z) <= d / 2 ? -ka * Math.sin(ka * z) : -Math.sign(z) * ga * e * Math.exp(-ga * (Math.abs(z) - d / 2)) };
};

/* Approximate vector field of the fundamental even (TE-like) or odd (TM-like) mode of a strip w x t in air.
   The main magnetic field is separable, F(z) G(y), from the two slab problems of the effective index method.
   The other five components follow from Maxwell's equations through derivatives of F and G (units with eta0 = 1).
   It has the exact mirror parities, which is all card 3 needs. Illustration only, not a full vector solution. */
const C2L2_model = (fam, n, t, w, lam) => {
  const k0 = 2 * Math.PI / lam, Ns = C2.slabN(n, 1, t, lam, 0, fam), Ne = C2.slabN(Ns, 1, w, lam, 0, fam === "TE" ? "TM" : "TE"), b = k0 * Ne;
  const F = C2L2_prof(n, Ns, t, lam), G = C2L2_prof(Ns, Ne, w, lam);
  const nl = y => Math.abs(y) <= w / 2 ? Ns * Ns : 1, nv = z => Math.abs(z) <= t / 2 ? n * n : 1;
  const at = (y, z) => {
    const f = F.f(z), f1 = F.f1(z), g = G.f(y), g1 = G.f1(y);
    if (fam === "TE") { const e = nl(y); return { Ex: f * g1 / (k0 * e), Ey: b * f * g / (k0 * e), Hz: f * g, Ez: f1 * g1 / (k0 * e * b), Hx: f1 * g / b, Hy: f1 * g1 / (k0 * k0 * e) }; }
    const e = nv(z); return { Ex: f1 * g / (k0 * e), Ey: f1 * g1 / (k0 * e * b), Hz: f1 * g1 / (k0 * k0 * e), Ez: b * f * g / (k0 * e), Hx: f * g1 / b, Hy: f * g };
  };
  return { Ns, Ne, at };
};
const C2L2_sub = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;

addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l2", title: "Mirror symmetry and the TE-like and TM-like modes", short: "2. Symmetry, TE-like and TM-like",
big: String.raw`Section 2.2 starts with symmetry. The membrane has air on both sides, so it looks the same in a mirror placed at its mid-plane \(z = 0\), and every guided mode is either even or odd under that mirror (Johnson et al. 1999). On the mid-plane itself, even modes are purely TE and odd modes purely TM. Away from it the field components mix, so the fundamental even and odd modes are called TE-like and TM-like. The second idea is a boundary condition. The normal displacement field \(\varepsilon E_z\) is continuous at the surfaces, so \(E_z\) just outside is \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\), about 12, times \(E_z\) just inside (Eq. 2.1). The main field of a TM-like mode is \(E_z\), so its field is strongest just outside the two surfaces, and the same boundary condition gives it a lower effective index than the TE-like mode.`,
bridge: "Lesson 1 drew the mirror plane z = 0 on the strip cross-section. Here that mirror is used. The slab curves are computed live with round values (n = 3.5, air, 800 nm) from the analytic slab equation, which is derived in Beyond the thesis, B1. Lesson 3 shows how a mode solver finds the same modes numerically, and how the strip modes are named.",
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
    fig.innerHTML = svg(280, `<rect x="40" y="138" width="600" height="4" fill="var(--p)" opacity="0.6"/><text class="ts" x="640" y="132" text-anchor="end">mirror plane z = 0</text><line x1="340" y1="80" x2="${340 + L * vx}" y2="${80 - L * vz}" stroke="${col}" stroke-width="4" marker-end="url(#ar)"/><circle cx="340" cy="80" r="4" fill="${col}"/><text class="ts" x="250" y="60">original at z = +d</text><line x1="340" y1="200" x2="${340 + L * mx}" y2="${200 - L * mz}" stroke="${col}" stroke-width="4" marker-end="url(#ar)" opacity="0.8"/><circle cx="340" cy="200" r="4" fill="${col}"/><text class="ts" x="250" y="250">mirror image at z = −d</text>${axes(70, 260)}<text class="ts" x="560" y="80">${f}${C2L2_sub("x")}: ${vx.toFixed(2)} → ${mx.toFixed(2)}</text><text class="ts" x="560" y="100">${f}${C2L2_sub("z")}: ${vz.toFixed(2)} → ${mz.toFixed(2)}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { f = b.dataset.f; u(); });
  $("an").oninput = u; u();
}},

/* from old ch2 L4 card 2, now with the mirror operation animated */
{s: "2. Even and odd", t: "Even and odd modes: apply the mirror and compare",
intu: String.raw`A mode is even if its mirror image is identical to itself, and odd if its mirror image is exactly minus itself. Here the arrows show the electric field in a cross-section of the membrane. The fundamental TE mode points sideways (along \(y\)) with the same direction above and below the mid-plane. Press 'Apply mirror' and watch the two things a mirror does: every arrow moves from \(z\) to \(-z\), and its normal part flips. Tangential arrows do not flip, so you get the same field back. It is even. The fundamental TM mode points up (along \(z\)) everywhere. Mirror it and every arrow ends up pointing down, which is minus the original. It is odd. Johnson et al. 1999 used exactly this classification for photonic crystal slabs, and the thesis uses it in Sec. 2.2: every guided mode of the membrane is either even or odd.`,
eq: String.raw`\[ \text{even } (\sigma = +1): \ M[\mathbf{E}] = +\mathbf{E} \qquad \text{odd } (\sigma = -1): \ M[\mathbf{E}] = -\mathbf{E} \]\[ M[\mathbf{E}](x,y,z) = \big(E_{x}, E_{y}, -E_{z}\big)(x,y,-z) \]`,
sym: [[String.raw`\(M[\mathbf{E}]\)`, String.raw`the field after applying the mirror: move each point \(z \to -z\) and flip the normal part (card 1 rules)`], [String.raw`\(\sigma\)`, "parity eigenvalue, +1 even, −1 odd"], ["TE-like", "the fundamental even mode"], ["TM-like", "the fundamental odd mode"]],
how: [String.raw`The structure equals its mirror image, \(\varepsilon_r(y,-z) = \varepsilon_r(y,z)\), so if \(\mathbf{E}\) is a mode, \(M[\mathbf{E}]\) is also a mode at the same frequency and with the same \(\beta\).`, String.raw`For a single (non-degenerate) mode, \(M[\mathbf{E}]\) must be \(\mathbf{E}\) times a constant. Applying the mirror twice gives the original, so the constant squared is 1, and it is \(+1\) or \(-1\).`, "So every guided mode is even or odd. Nothing in between is allowed.", "Card 3 shows what this means on the mid-plane itself."],
say: "Because the membrane is the same above and below, every guided mode is either even or odd under the mirror at the mid-plane. The fundamental even mode is the TE-like mode and the fundamental odd mode is the TM-like mode.",
num: String.raw`Two eigenvalues only: <b>+1</b> or <b>−1</b>, because mirroring twice is the identity.<br>With the DBR on one side, under a grating coupler, the mirror symmetry is broken and the two classes can mix (Beyond the thesis, B3).`,
r(fig, ctl) {
  let md = "TE", target = 0, s = 0, last = performance.now();
  const RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  ctl.innerHTML = btns([["TE", "fundamental TE (even)"], ["TM", "fundamental TM (odd)"]], "m") + `<div class="row"><button id="mr">Apply mirror</button></div>` + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); $("mr").textContent = target ? "Show original" : "Apply mirror";
    let a = ""; const zsp = [-100, -55, -15, 15, 55, 100], ys = [120, 220, 320, 420, 520];
    const q = 1 - 2 * s; // 1 = original, -1 = mirrored
    zsp.forEach(z => ys.forEach(y => {
      const inside = Math.abs(z) <= 80, amp = inside ? Math.cos(z / 80 * 0.9) : 0.35 * Math.exp(-(Math.abs(z) - 80) / 40) * (md === "TM" ? 3 : 1);
      const yy = 140 - z * 0.9 * q;
      let dx = 0, dz = 0;
      if (md === "TE") dx = 28 * amp; else dz = 22 * Math.min(1.4, amp) * q;
      const tag = z === 55 && y === 420 ? 1 : 0;
      a += `<line x1="${y - dx / 2}" y1="${yy + dz / 2}" x2="${y + dx / 2}" y2="${yy - dz / 2}" stroke="${md === "TE" ? "#378ADD" : "#D85A30"}" stroke-width="${tag ? 3.5 : 2}" marker-end="url(#ar)"/>${tag ? `<circle cx="${y}" cy="${yy}" r="12" fill="none" stroke="#7F77DD" stroke-width="1.5"/>` : ""}`;
    }));
    const done = s > 0.999;
    fig.innerHTML = svg(270, `<rect x="80" y="${140 - 72}" width="480" height="144" fill="var(--blue-bg)"/><line x1="70" x2="570" y1="140" y2="140" stroke="var(--t)" stroke-dasharray="5 4"/><text class="ts" x="574" y="144">mid-plane</text>${a}<text class="ts" x="574" y="${140 - 55 * 0.9 * q + 4}" fill="#7F77DD">tracked arrow</text><text class="th" x="340" y="252" text-anchor="middle">${done ? (md === "TE" ? "mirror image = original: even (+1)" : "mirror image = minus original: odd (−1)") : s > 0.001 ? "mirroring: z → −z, normal part flips" : "original field"}</text>`);
    $("ro").innerHTML = `<div><span>main field</span><b>${md === "TE" ? "E<sub>y</sub> (tangential)" : "E<sub>z</sub> (normal)"}</b></div><div><span>parity σ</span><b>${md === "TE" ? "+1, even" : "−1, odd"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { md = b.dataset.m; target = 0; s = 0; u(); });
  $("mr").onclick = () => { target = target ? 0 : 1; if (RM) s = target; u(); };
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (s !== target) { s = target > s ? Math.min(target, s + dt / 1.2) : Math.max(target, s - dt / 1.2); u(); }
  });
  u();
}},

/* new: Johnson 1999, purely TE and TM on the mid-plane, mixed away from it */
{s: "3. On the mid-plane", t: "On the mid-plane: purely TE or purely TM, and mixed elsewhere",
intu: String.raw`Card 2 showed that the mirror sends every field component either to itself or to minus itself at the mirrored point. Now look only at the plane \(z = 0\), where a point and its mirror image are the same point. A component that must be odd in \(z\) equals minus itself there, so it is zero. For an even mode the odd components are \(E_z\), \(H_x\) and \(H_y\), so on the mid-plane only \(E_x\), \(E_y\) and \(H_z\) survive: the electric field lies in the plane and the magnetic field is normal to it, exactly a TE field. For an odd mode the roles swap and only \(E_z\), \(H_x\) and \(H_y\) survive, a TM field. Move the observation plane away from \(z = 0\), or press Sweep, and the forbidden components switch on. Much of this mixing is the longitudinal components \(E_x\) and \(H_x\), which a strongly confined mode carries even in a uniform slab. That is why Johnson et al. 1999, and the thesis, call the fundamental even and odd modes TE-like and TM-like. The map shows the largest forbidden component over the cross-section, with its sign (red positive, blue negative). The bars come from an approximate vector model of the 200 nm strip computed in the page, for illustration.`,
eq: String.raw`\[ \text{even mode: } \ E_x, E_y, H_z \ \text{even in } z, \qquad E_z, H_x, H_y \ \text{odd in } z \]\[ z = 0: \quad \text{even} \Rightarrow E_z = H_x = H_y = 0 \ \ (\text{purely TE}), \qquad \text{odd} \Rightarrow E_x = E_y = H_z = 0 \ \ (\text{purely TM}) \]<div class="eqref">Johnson et al. 1999, p. 5753, as stated in Sec. 2.2 of the thesis</div>`,
sym: [["TE set", String.raw`\(E_x, E_y, H_z\): electric field in the plane of the membrane, magnetic field normal to it`], ["TM set", String.raw`\(E_z, H_x, H_y\): electric field normal to the membrane, magnetic field in the plane`], ["TE-like", "fundamental even mode: only the TE set on the mid-plane"], ["TM-like", "fundamental odd mode: only the TM set on the mid-plane"], [String.raw`\(z\)`, "height of the observation plane above the mid-plane"]],
how: [String.raw`Mirror rules (card 1): \(E_x\), \(E_y\) keep their sign and \(E_z\) flips. \(H_x\), \(H_y\) flip and \(H_z\) keeps its sign.`, String.raw`Even mode: the mirrored field equals the field, so \(E_z(-z) = -E_z(z)\), \(H_x(-z) = -H_x(z)\) and \(H_y(-z) = -H_y(z)\). These three are odd functions of \(z\).`, String.raw`An odd function is zero at \(z = 0\). So on the mid-plane an even mode has only \(E_x\), \(E_y\) and \(H_z\): electric field in the plane, magnetic field normal to it. That is a TE field.`, String.raw`Odd mode: every sign is reversed, so \(E_x\), \(E_y\) and \(H_z\) are the odd functions and vanish, leaving \(E_z\), \(H_x\) and \(H_y\). That is a TM field.`, String.raw`Off the mid-plane nothing forces the odd components to vanish. Even in a uniform slab the even mode has \(H_x \ne 0\) above and below the mid-plane, because \(H_x\) follows the slope of \(E_y\). In a strip \(E_z\) appears too. So the modes are only TE-like and TM-like, exactly TE or TM on \(z = 0\) alone.`],
say: String.raw`On the mid-plane an even mode has only \(E_x\), \(E_y\) and \(H_z\), so it is purely TE there, and an odd mode has only \(E_z\), \(H_x\) and \(H_y\), purely TM. Away from the mid-plane the other components appear, which is why the fundamental even and odd modes are called TE-like and TM-like.`,
num: String.raw`On \(z = 0\) the forbidden bars are exactly zero for any width, index and wavelength, because the result follows from symmetry alone.<br>Off the mid-plane the forbidden set grows roughly in proportion to \(z\) near the centre, since an odd function starts linearly. Crossing a surface, \(z = \pm 80\) nm, the bars of the odd mode jump, which is Eq. 2.1 at work (card 4).`,
note: String.raw`If asked why this matters for the thesis devices: a quantum dot sits near the mid-plane of the membrane and its transition dipoles lie in the plane. On \(z = 0\) the odd modes have \(E_x = E_y = 0\), so an in-plane dipole there couples only to the even, TE-like modes. This is also why a symmetric (air on both sides) simulation can keep only one symmetry class.`,
r(fig, ctl) {
  let fam = "TE", sweep = false, last = performance.now(), ph = 0;
  ctl.innerHTML = btns([["TE", "even mode (TE-like)"], ["TM", "odd mode (TM-like)"]], "m") + sl("zp", "Observation plane z", -240, 240, 2, 0) + `<div class="row"><button id="zs">Sweep z</button></div><div class="readout" id="ro"></div>`;
  const cache = {}, getM = f => cache[f] || (cache[f] = C2L2_model(f, 3.5, 160, 200, 800));
  const ys = range(-700, 700, 701), maps = {};
  const MX = 20, MY = 46, SC = 0.5, YL = 280, ZL = 250, CS = 7;
  const mapSVG = f => {
    if (maps[f]) return maps[f];
    const M = getM(f), key = f === "TE" ? "Ez" : "Ex", nY = Math.round(2 * YL * SC / CS), nZ = Math.round(2 * ZL * SC / CS), V = [];
    let mx = 0;
    for (let j = 0; j < nZ; j++) for (let i = 0; i < nY; i++) { const y = -YL + (i + 0.5) * CS / SC, z = ZL - (j + 0.5) * CS / SC, v = M.at(y, z)[key]; V.push(v); mx = Math.max(mx, Math.abs(v)); }
    let s = "";
    for (let j = 0; j < nZ; j++) for (let i = 0; i < nY; i++) { const [r, g, b] = C2.color(V[j * nY + i] / (mx || 1)); s += `<rect x="${MX + i * CS}" y="${MY + j * CS}" width="${CS + 0.4}" height="${CS + 0.4}" fill="rgb(${r},${g},${b})"/>`; }
    s += `<rect x="${MX + (YL - 100) * SC}" y="${MY + (ZL - 80) * SC}" width="${200 * SC}" height="${160 * SC}" fill="none" stroke="var(--t)" stroke-width="1.5"/><line x1="${MX}" x2="${MX + 2 * YL * SC}" y1="${MY + ZL * SC}" y2="${MY + ZL * SC}" stroke="var(--t)" stroke-dasharray="5 4"/>`;
    s += `<text class="ts" x="${MX}" y="${MY - 10}">map: ${f === "TE" ? `E${C2L2_sub("z")}` : `E${C2L2_sub("x")}`}, must vanish on z = 0</text>`;
    return (maps[f] = s);
  };
  const u = () => {
    pick(ctl, "m", fam); const z = +$("zp").value; $("zpv").textContent = z + " nm"; $("zs").textContent = sweep ? "Stop sweep" : "Sweep z";
    const M = getM(fam), acc = { Ex: 0, Ey: 0, Ez: 0, Hx: 0, Hy: 0, Hz: 0 };
    ys.forEach(y => { const c = M.at(y, z); for (const k in acc) acc[k] += c[k] * c[k]; });
    const r = {}; for (const k in acc) r[k] = Math.sqrt(acc[k]);
    const mE = Math.max(r.Ex, r.Ey, r.Ez) || 1, mH = Math.max(r.Hx, r.Hy, r.Hz) || 1;
    const rows = [["TE set: E in the plane, H normal", null], ["Ex", "E", "TE"], ["Ey", "E", "TE"], ["Hz", "H", "TE"], ["TM set: E normal, H in the plane", null], ["Ez", "E", "TM"], ["Hx", "H", "TM"], ["Hy", "H", "TM"]];
    let s = mapSVG(fam);
    const zy = MY + (ZL - z) * SC;
    s += `<line x1="${MX - 4}" x2="${MX + 2 * YL * SC + 4}" y1="${zy}" y2="${zy}" stroke="#EF9F27" stroke-width="3"/><text class="ts" x="${MX}" y="${MY + 2 * ZL * SC + 18}">amber line: observation plane, z = ${z} nm</text><text class="ts" x="${MX}" y="${MY + 2 * ZL * SC + 34}">box: the 200 × 160 nm strip, dashed: z = 0</text>`;
    let yb = 52; const BX = 372, BW = 200;
    rows.forEach(rw => {
      if (!rw[1]) { s += `<text class="ts" x="330" y="${yb}" font-weight="600">${rw[0]}</text>`; yb += 22; return; }
      const [k, f, set] = rw, v = r[k] / (f === "E" ? mE : mH), forb = (fam === "TE") !== (set === "TE");
      const col = set === "TE" ? "#378ADD" : "#D85A30";
      s += `<text class="t" x="336" y="${yb + 4}">${k[0]}${C2L2_sub(k[1])}</text><rect x="${BX}" y="${yb - 9}" width="${BW}" height="16" fill="var(--sunk)"/><rect x="${BX}" y="${yb - 9}" width="${(BW * v).toFixed(1)}" height="16" fill="${col}" opacity="${forb ? 0.95 : 0.6}"/><text class="ts" x="${BX + BW + 6}" y="${yb + 4}">${v.toFixed(2)}${forb ? " forbidden" : ""}</text>`;
      yb += 26;
    });
    const zero = z === 0;
    s += `<text class="th" x="330" y="${yb + 14}">${zero ? (fam === "TE" ? "z = 0: purely TE" : "z = 0: purely TM") : (fam === "TE" ? "z ≠ 0: mixed, so TE-like" : "z ≠ 0: mixed, so TM-like")}</text>`;
    s += `<text class="ts" x="330" y="${yb + 34}">bars: rms of each component along the line,</text><text class="ts" x="330" y="${yb + 50}">E and H each scaled to their largest bar.</text><text class="ts" x="330" y="${yb + 66}">"forbidden": must be zero on z = 0</text>`;
    fig.innerHTML = svg(350, s);
    const fE = fam === "TE" ? r.Ez / mE : Math.max(r.Ex, r.Ey) / mE, fH = fam === "TE" ? Math.max(r.Hx, r.Hy) / mH : r.Hz / mH;
    $("ro").innerHTML = `<div><span>largest forbidden E bar</span><b>${fE.toFixed(2)}</b></div><div><span>largest forbidden H bar</span><b>${fH.toFixed(2)}</b></div><div><span>on this plane</span><b>${zero ? (fam === "TE" ? "purely TE" : "purely TM") : "mixed"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { fam = b.dataset.m; u(); });
  $("zp").oninput = () => { sweep = false; u(); };
  $("zs").onclick = () => { sweep = !sweep; if (!sweep) { $("zp").value = 0; } u(); };
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (sweep) { ph += dt * 0.9; $("zp").value = Math.round(120 * Math.sin(ph) / 2) * 2; u(); }
  });
  u();
}},

/* from old ch2 L2 card 1, now a step-through of Eq. 2.1 and its two consequences */
{s: "4. The jump", t: String.raw`The jump of \(E_z\) (Eq. 2.1), and why TM-like modes have a lower \(n_{\mathrm{eff}}\)`,
intu: String.raw`At the top and bottom surfaces Gauss's law fixes the normal displacement field \(\varepsilon E_z\): it is the same on both sides. GaAs has \(\varepsilon \approx 12\) and air \(\varepsilon = 1\), so \(E_z\) itself must be about 12 times larger just outside than just inside. That is Eq. 2.1. A TE-like mode has its main field parallel to the surfaces, which is continuous, so nothing jumps. A TM-like mode has its main field \(E_z\) normal to the surfaces, so its field is strongest just outside the two surfaces. The same boundary condition also lowers its effective index: the tangential \(E_x\) is continuous too, and with \(\nabla\cdot\mathbf{D} = 0\) that makes the slope of \(E_z\) continuous. The field inside must then bend over steeply enough to meet a tail that starts 12 times higher, which needs a larger transverse wavenumber \(\kappa\), and \(n_{\mathrm{eff}}^2 = n^2 - (\kappa/k_0)^2\) drops. Press Play and narrate the five steps, and drag the index to see the jump grow.`,
eq: String.raw`\[ E_z^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\, E_z^{\mathrm{GaAs}} \]<div class="eqref">Ch. 2 Eq. (2.1), continuity of the normal displacement field \(\varepsilon E_z\). With \(n = 3.5\) the ratio is \(12.25\).</div>\[ \text{TE: } \tan\frac{\kappa t}{2} = \frac{\gamma}{\kappa} \qquad \text{TM: } \tan\frac{\kappa t}{2} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\,\frac{\gamma}{\kappa} \qquad n_{\mathrm{eff}}^{2} = n^{2} - \left(\frac{\kappa}{k_0}\right)^{2} \]<div class="eqref">Fundamental modes of the symmetric slab, from matching value and slope at \(z = t/2\) (derived in Beyond the thesis, B1)</div>`,
sym: [[String.raw`\(E_z^{\mathrm{air}}, E_z^{\mathrm{GaAs}}\)`, "normal electric field just outside and just inside a surface"], [String.raw`\(\varepsilon_{\mathrm{GaAs}}, \varepsilon_{\mathrm{air}}\)`, String.raw`relative permittivities, \(n^2 \approx 12.25\) and 1`], [String.raw`\(\kappa\)`, String.raw`transverse wavenumber inside the core, field \(\propto \cos\kappa z\)`], [String.raw`\(\gamma\)`, String.raw`decay constant of the tail in air, \(k_0\sqrt{n_{\mathrm{eff}}^2 - 1}\)`]],
how: [String.raw`Gauss's law over a flat pillbox straddling the surface, with no free surface charge: the flux of \(\mathbf{D}\) through its top equals that through its bottom, so \(\varepsilon_{\mathrm{air}}E_z^{\mathrm{air}} = \varepsilon_{\mathrm{GaAs}}E_z^{\mathrm{GaAs}}\).`, String.raw`Divide by \(\varepsilon_{\mathrm{air}}\): this is Eq. 2.1. For GaAs and air the factor is \(n^2 \approx 12\). Faraday's law around a thin loop gives the other condition, tangential \(\mathbf{E}\) continuous, so a TE field does not jump.`, String.raw`A TM-like mode has \(E_z\) as its main field. Inside it is small near the surface, outside it starts 12 times higher and then decays as \(e^{-\gamma z}\). So the field is strongest just outside both surfaces.`, String.raw`In each region \(\nabla\cdot\mathbf{D} = 0\) gives \(\partial E_z/\partial z = -i\beta E_x\), and \(E_x\) is tangential, so the slope of \(E_z\) is continuous. Inside the slope must therefore match \(\gamma\) times a value 12 times larger: \(\kappa\tan(\kappa t/2) = 12\gamma\) instead of \(\gamma\).`, String.raw`That pushes \(\kappa t/2\) close to \(\pi/2\), so the field inside bends over almost to zero at the surfaces. A larger \(\kappa\) means a smaller \(\beta = \sqrt{k_0^2 n^2 - \kappa^2}\), a lower \(n_{\mathrm{eff}}\).`],
say: String.raw`The normal displacement field is continuous, so \(E_z\) just outside the surface is \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\), about 12, times \(E_z\) just inside. The TM-like field is mostly \(E_z\), so it is strongest just outside both surfaces, and to meet that tail it must bend over more strongly inside, which gives it a lower effective index than the TE-like mode.`,
num: String.raw`\(n = 3.5\): jump factor \(n^2\) = <b>12.25</b>. \(n = 3.0\): <b>9</b>. \(n = 1.45\) (oxide): <b>2.1</b>.<br>Slab 160 nm thick at 800 nm, computed by this card: \(\kappa t/2 \approx\) <b>1.05</b> rad for TE and <b>1.49</b> rad for TM, close to \(\pi/2 \approx 1.57\). So the TM field inside falls to about 8 % of its centre value at the surfaces.`,
note: String.raw`Careful with the plain-language version "TM light lives more in air". The electric energy density \(\varepsilon|\mathbf{E}|^2\) just outside is 12 times that just inside, but the lower index comes from the curvature argument above. Say it that way if a committee member pushes.`,
r(fig, ctl) {
  const S = [String.raw`Zoom on the top surface: GaAs below, air above. Draw a flat pillbox across it.`,
    String.raw`Gauss's law, no surface charge: the normal D = εE<sub>z</sub> is the same on both sides of the surface.`,
    String.raw`So E<sub>z</sub> jumps up by ε<sub>GaAs</sub>/ε<sub>air</sub> = n² on the air side. This is Eq. 2.1.`,
    String.raw`The TM mode's main field is E<sub>z</sub>. Across the membrane it is small inside near the surfaces and strongest just outside both of them.`,
    String.raw`The slope of E<sub>z</sub> is continuous too. To meet a tail that starts n² times higher, the TM field must bend over more inside (larger κ) than the TE field, so its n<sub>eff</sub> is lower.`];
  ctl.innerHTML = sl("n", "Core index n", 1.2, 3.8, 0.01, 3.5) + `<div class="row"><button id="jb">Back</button><button id="jp">Play</button><button id="jn">Next</button></div><p class="note" id="jc" style="min-height:44px;font-size:14px;color:var(--fg)"></p><div class="readout" id="ro"></div>`;
  const draw = st => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2);
    const k = st.k, P = j => j < k ? 1 : j === k ? st.p : 0, g = (j, b) => P(j) > 0.001 ? `<g opacity="${P(j).toFixed(3)}">${b}</g>` : "";
    const e = n * n, t = 160, lam = 800, k0 = 2 * Math.PI / lam;
    const Nte = C2.slabN(n, 1, t, lam, 0, "TE"), Ntm = C2.slabN(n, 1, t, lam, 0, "TM");
    const Pte = C2L2_prof(n, Nte, t, lam), Ptm = C2L2_prof(n, Ntm, t, lam);
    let s = "";
    // left: zoom on the top surface
    s += `<rect x="20" y="150" width="280" height="110" fill="var(--blue-bg)"/><line x1="20" x2="300" y1="150" y2="150" stroke="var(--p)" stroke-width="1.5"/><text class="ts" x="26" y="250">GaAs, ε = n² = ${e.toFixed(2)}</text><text class="ts" x="26" y="40">air, ε = 1</text><text class="ts" x="160" y="22" text-anchor="middle">zoom on the top surface</text>`;
    s += g(0, `<rect x="70" y="118" width="70" height="64" fill="none" stroke="var(--t)" stroke-width="1.5" stroke-dasharray="5 4"/><text class="ts" x="146" y="128">pillbox</text>`);
    s += g(1, `${arrow(92, 232, 92, 188, "#7F77DD", 3)}${arrow(92, 140, 92, 96, "#7F77DD", 3)}<text class="ts" x="100" y="90" fill="#7F77DD">D${C2L2_sub("z")}</text><text class="ts" x="100" y="226" fill="#7F77DD">D${C2L2_sub("z")}, same</text>`);
    const Lin = 8, Lout = Math.min(110, Lin * e);
    s += g(2, `${arrow(230, 226, 230, 226 - Lin, "#D85A30", 3)}${arrow(230, 144, 230, 144 - Lout, "#D85A30", 3)}<text class="ts" x="238" y="${144 - Lout / 2}" fill="#D85A30">E${C2L2_sub("z")} × ${e.toFixed(1)}</text><text class="ts" x="238" y="222" fill="#D85A30">E${C2L2_sub("z")}</text>`);
    // right: profile across the membrane, both normalized to their value at z = 0
    const zs = range(-300, 300, 241), X0 = 340, W = 320, Y0 = 40, H = 200;
    const ezTM = zs.map(z => Ptm.f(z) * (Math.abs(z) <= t / 2 ? 1 : e)), eyTE = zs.map(z => Pte.f(z));
    const ymax = Math.max(1.05, ...ezTM) * 1.08, X = z => X0 + (z + 300) / 600 * W;
    s += g(3, `<rect x="${X(-80)}" y="${Y0}" width="${X(80) - X(-80)}" height="${H}" fill="var(--blue-bg)"/><line x1="${X0}" x2="${X0 + W}" y1="${Y0 + H}" y2="${Y0 + H}" stroke="var(--p)"/>${plot(X0, Y0, W, H, zs, ezTM, -300, 300, 0, ymax, "#D85A30", 2.5)}<text class="ts" x="${X0}" y="${Y0 - 12}">across the membrane, z from −300 to 300 nm</text><text class="ts" x="${X0}" y="${Y0 + 8}" fill="#D85A30">TM: E${C2L2_sub("z")}, peaks just</text><text class="ts" x="${X0}" y="${Y0 + 22}" fill="#D85A30">outside both surfaces</text><text class="ts" x="${X(0)}" y="${Y0 + H + 16}" text-anchor="middle">GaAs</text>`);
    s += g(4, `${plot(X0, Y0, W, H, zs, eyTE, -300, 300, 0, ymax, "#378ADD", 2.5, "6 4")}<text class="ts" x="${X0 + 4}" y="${Y0 + H + 34}" fill="#378ADD">TE: E${C2L2_sub("y")}, continuous, κt/2 = ${(Pte.ka * t / 2).toFixed(2)}</text><text class="ts" x="${X0 + 4}" y="${Y0 + H + 50}" fill="#D85A30">TM: bends over more, κt/2 = ${(Ptm.ka * t / 2).toFixed(2)}</text>`);
    fig.innerHTML = svg(300, s);
    $("jc").innerHTML = `Step ${k + 1} of 5. ${S[k]}`;
    $("ro").innerHTML = `<div><span>jump factor ε<sub>GaAs</sub>/ε<sub>air</sub></span><b>${e.toFixed(2)}</b></div><div><span>n<sub>eff</sub> TE0 (slab, 160 nm)</span><b>${Nte.toFixed(3)}</b></div><div><span>n<sub>eff</sub> TM0 (slab, 160 nm)</span><b>${Ntm.toFixed(3)}</b></div>`;
  };
  const C = C2L2_stepper(fig, S.length, draw, { b: "jb", p: "jp", n: "jn", play: true, dur: 0.9, hold: 3 });
  $("n").oninput = () => C.redraw();
}},

/* from old ch2 L2 card 3 */
{s: "5. Profiles", t: "What the modes look like across the slab",
intu: String.raw`Each mode has a field shape across the thickness. The fundamental modes TE0 and TM0 have no zero inside the core. The first-order modes TE1 and TM1 have one zero at the mid-plane, so their main field is positive on one side and negative on the other. Outside, every mode decays exponentially. Pick a mode and change the thickness. For TM, the curve shown is \(E_z\), so you can see the jump of card 4 at the two surfaces. Notice that near cutoff (thin slab, or a higher-order mode) the tails get long: most of the light is then in the air.`,
eq: String.raw`\[ \text{inside: } f(z) = \begin{cases} \cos(\kappa z) & m \text{ even} \\ \sin(\kappa z) & m \text{ odd} \end{cases} \qquad \text{outside: } f(t/2)\, e^{-\gamma(|z| - t/2)} \]\[ \text{TE: } f = E_{y} \qquad \text{TM: } f = H_{y}, \quad E_{z} = \frac{\beta H_{y}}{\omega\varepsilon} \propto \frac{H_{y}}{n^{2}(z)} \]`,
sym: [[String.raw`\(f(z)\)`, "transverse profile of the main field"], [String.raw`\(E_{y}\)`, "TE main field, parallel to the surfaces"], [String.raw`\(H_{y}\)`, "TM magnetic field, continuous"], [String.raw`\(E_{z}\)`, String.raw`TM main electric field, \(\propto H_y/\varepsilon\), so it jumps`]],
how: [String.raw`Solve the slab equation for \(n_{\mathrm{eff}}\) (Beyond the thesis, B1), or let a mode solver do it (Lesson 3). This gives \(\kappa\) and \(\gamma\).`, String.raw`Write \(\cos\) or \(\sin\) inside and an exponential tail outside, matched at the surfaces.`, String.raw`For TM, compute \(E_z\) from \(H_y\) using Maxwell's equations: \(E_z \propto H_y/\varepsilon\).`, "Normalize so the largest value is 1."],
say: "Fundamental modes have no node across the slab. First-order modes have one node at the mid-plane. TM electric fields peak just outside the surfaces because of the permittivity jump.",
num: "Mid-plane value of the main field: TE0 and TM0 are maximal there, TE1 and TM1 are exactly zero there. This sets which modes a dot at the mid-plane can couple to (Chapter 1, Lesson 6).",
note: String.raw`Do not confuse the shape of the plotted curve with the mirror parity \(\sigma\). TE0 has a symmetric \(E_y\), so \(\sigma = +1\). TM0 has a symmetric \(E_z\), but \(E_z\) flips under the mirror, so \(\sigma = -1\). TE1 has an antisymmetric \(E_y\), so \(\sigma = -1\), the same class as TM0. TM1 has an antisymmetric \(E_z\), so \(\sigma = +1\), the same class as TE0. This is why the thesis names only the fundamental even and odd modes TE-like and TM-like.`,
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + sl("t", "Thickness t", 60, 400, 5, 220) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const t = +$("t").value; $("tv").textContent = t + " nm";
    const pol = md.slice(0, 2), m = +md[2], N = C2.slabN(3.5, 1, t, 800, m, pol), zs = range(-350, 350, 350);
    if (!N) { fig.innerHTML = svg(270, `<text class="th" x="340" y="130" text-anchor="middle">${md} is cut off at this thickness</text>`); $("ro").innerHTML = `<div><span>${md}</span><b>not guided</b></div>`; return; }
    const pr = C2.slabProfile(3.5, 1, t, 800, m, pol, N, zs), ys = pol === "TE" ? pr.main : pr.ez;
    const w = t / 700 * 540;
    fig.innerHTML = svg(270, `<rect x="${340 - w / 2}" y="20" width="${w}" height="230" fill="var(--blue-bg)"/><line x1="70" x2="610" y1="135" y2="135" stroke="var(--p)" stroke-width="0.6"/><line x1="340" x2="340" y1="20" y2="250" stroke="var(--p)" stroke-dasharray="3 3" opacity="0.6"/>${plot(70, 20, 540, 230, zs, ys, -350, 350, -1.05, 1.05, pol === "TE" ? "#378ADD" : "#D85A30", 2.5)}<text class="ts" x="76" y="36">${pol === "TE" ? `E${C2L2_sub("y")}` : `E${C2L2_sub("z")}`} of ${md} across z, −350 to 350 nm</text><text class="ts" x="344" y="262">mid-plane</text>`);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub></span><b>${N.toFixed(3)}</b></div><div><span>decay length 1/γ</span><b>${(1 / pr.gamma).toFixed(0)} nm</b></div><div><span>mirror parity σ</span><b>${md === "TE0" || md === "TM1" ? "+1, even" : "−1, odd"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("t").oninput = u; u();
}},

/* from old ch2 L2 card 6 */
{s: "6. TE above TM", t: "Why TE is always above TM, and why it matters",
intu: String.raw`Card 4 gave the reason: the boundary condition of Eq. 2.1 forces the TM field to bend over more strongly inside the core, which lowers its effective index. The factor that does it is \(\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}}\), so the gap between TE and TM grows with the index contrast. Drag the core index from a weak waveguide to GaAs and watch the gap open. For a weak guide the two are almost degenerate. This gap is useful and harmful at once: it makes grating couplers strongly polarization selective, because the period depends on \(n_{\mathrm{eff}}\) (Eq. 2.3, Lesson 4), and it gives the two polarizations different beat lengths in a two-mode section (Eq. 2.15, Lesson 7), which is how such a section can split them.`,
eq: String.raw`\[ n_{\mathrm{eff},m}^{\mathrm{TM}} \lt n_{\mathrm{eff},m}^{\mathrm{TE}}, \qquad \text{gap grows with } \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}} = \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \]`,
sym: [[String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}}, n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "effective indices of TE and TM modes of the same order"], [String.raw`\(n/n_{\mathrm{c}}\)`, "index contrast between core and cladding"]],
how: [String.raw`For a weak guide, \(\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{clad}} \approx 1\), the two boundary conditions are nearly the same and TE and TM are nearly degenerate.`, String.raw`For strong contrast the ratio is about 12, and the TM solution moves to a much lower \(n_{\mathrm{eff}}\).`, "So high-contrast membranes are strongly birefringent.", "Taillaert et al. 2006 report the same effect in silicon-on-insulator: TE 2.83 versus TM 1.89."],
say: "TM-like modes of a high-contrast membrane have a much lower effective index than TE-like modes, because the permittivity jump at the surfaces forces their field to bend over more inside the core.",
num: String.raw`Taillaert et al. 2006, 220 nm silicon on oxide at 1550 nm: TE <b>2.83</b>, TM <b>1.89</b><br>This page, \(n = 3.5\) slab in air at 800 nm, \(t = 160\) nm: gap ≈ <b>0.50</b>`,
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
summary: String.raw`The membrane has air on both sides, so it is symmetric under the mirror \(z \to -z\). The mirror keeps tangential \(\mathbf{E}\) and normal \(\mathbf{H}\) and flips the rest, and every guided mode comes back as itself (even) or minus itself (odd). On the mid-plane an even mode has only \(E_x\), \(E_y\) and \(H_z\), so it is purely TE there, and an odd mode only \(E_z\), \(H_x\) and \(H_y\), purely TM. Away from the mid-plane they mix, so the fundamental even and odd modes are called TE-like and TM-like (Johnson et al. 1999). At the surfaces \(\varepsilon E_z\) is continuous, so \(E_z^{\mathrm{air}} = (\varepsilon_{\mathrm{GaAs}}/\varepsilon_{\mathrm{air}})E_z^{\mathrm{GaAs}}\) (Eq. 2.1). The TM-like field is strongest just outside both surfaces, and the same condition makes it bend over more inside, so its effective index is lower than that of the TE-like mode.`,
sheet: [
[String.raw`\[ (E_x, E_y, E_z) \to (E_x, E_y, -E_z), \qquad (H_x, H_y, H_z) \to (-H_x, -H_y, H_z) \]`, "Mirror z → −z: E polar, H axial"],
[String.raw`\[ M[\mathbf{E}] = \sigma\,\mathbf{E}, \qquad \sigma = \pm 1 \]`, "Every mode is even or odd"],
[String.raw`\[ z = 0: \ \text{even} \Rightarrow E_z = H_x = H_y = 0, \quad \text{odd} \Rightarrow E_x = E_y = H_z = 0 \]`, "Purely TE or TM on the mid-plane (Johnson 1999)"],
[String.raw`\[ E_z^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\, E_z^{\mathrm{GaAs}} \]`, "Field jump (Ch. 2 Eq. 2.1)"],
[String.raw`\[ \tan\frac{\kappa t}{2} = \frac{\varepsilon_{\mathrm{GaAs}}}{\varepsilon_{\mathrm{air}}}\,\frac{\gamma}{\kappa}, \qquad n_{\mathrm{eff}}^{2} = n^{2} - \left(\frac{\kappa}{k_0}\right)^{2} \]`, "Why TM is lower: larger κ (TE has 1 in place of the ratio)"],
[String.raw`\[ n_{\mathrm{eff}}^{\mathrm{TM}} \lt n_{\mathrm{eff}}^{\mathrm{TE}} \]`, "TE above TM, gap grows with contrast"]],
consts: String.raw`Examples: \(n = 3.5\), \(n_{\mathrm{c}} = 1\), \(\lambda_0 = 800\) nm, membrane 160 nm, strip 200 nm. Computed live, not thesis values.`,
sources: ["Johnson, Fan, Villeneuve, Joannopoulos and Kolodziejski, Phys. Rev. B 60, 5751 (1999), p. 5753 (even and odd modes, purely TE and TM on the mid-plane, TE-like and TM-like)", "Thesis Ch. 2, Sec. 2.2 and Eq. (2.1) (field jump at the surfaces)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (TE and TM indices in SOI)"]
});
