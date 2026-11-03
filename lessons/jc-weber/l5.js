(function () {
/* Journal Club, Weber et al. 2010. Lesson 5: from dangling bonds to defect levels (Fig. 3, Fig. 5, Table 1).
   A four-orbital (Hückel) model of the vacancy: on-site energy ε of each dangling bond, hopping −|β| between them.
   Defaults are fitted to Table 1: |β| = 1.0 eV and ε = 1.6 eV reproduce V_C²⁻ (a1 −1.46, t2 2.66),
   and an N orbital 2.0 eV lower reproduces NV⁻ (a1(1) −2.04, a1(2) 1.31). */
const { tx, rc, ln, ci, fmt, sci, C } = JC;
const TET = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map(v => v.map(x => x / Math.sqrt(3)));
/* C3v model: returns a1(1), a1(2), e for carbon DB energy eC, hopping b (>0), N DB lowered by d, N-C hopping bp */
function c3v(eC, b, d, bp) {
  const A = eC - d, Bv = eC - 2 * b, off = Math.sqrt(3) * bp;
  const m = (A + Bv) / 2, r = Math.sqrt(((A - Bv) / 2) ** 2 + off * off);
  return { a1: m - r, a2: m + r, e: eC + b, wN: (() => { const x = m - r - Bv; return x * x / (x * x + off * off); })() };
}
/* fill spin orbitals in energy order. levels: [{E, deg, name}], exchange shift X for minority */
function fill(levels, n, X) {
  const so = []; levels.forEach((l, i) => { for (let k = 0; k < l.deg; k++) { so.push({ i, k, s: 1, E: l.E }); so.push({ i, k, s: -1, E: l.E + X }); } });
  so.sort((a, b) => a.E - b.E || b.s - a.s);
  so.forEach((o, j) => o.occ = j < n);
  let up = 0, dn = 0; so.forEach(o => { if (o.occ) { if (o.s > 0) up++; else dn++; } });
  // partially filled degenerate level in one spin channel = orbitally degenerate, Jahn-Teller unstable
  let jt = false; levels.forEach((l, i) => { if (l.deg < 2) return; [1, -1].forEach(sg => { const c = so.filter(o => o.i === i && o.s === sg && o.occ).length; if (c > 0 && c < l.deg) jt = true; }); });
  return { so, S: (up - dn) / 2, up, dn, jt };
}

addLesson("jc", "weber", {
level: "Core",
id: "jc-weber-l5", title: "From dangling bonds to defect levels (Fig. 3, Fig. 5, Table 1)", short: "5. Dangling bonds to levels",
labels: { note: "Journal club note" },
big: String.raw`Where do the levels \(a_1(1)\), \(a_1(2)\), \(e_x\), \(e_y\) in Table 1 come from, and why does NV⁻ end up with spin 1? The paper's answer (Fig. 5) is a molecule-in-a-crystal picture. The four dangling bonds around a vacancy talk to each other and form four new orbitals: one symmetric \(a_1\) and three degenerate \(t_2\). Put a nitrogen next door and the symmetry drops to \(C_{3v}\): the \(a_1\) is pulled down onto the nitrogen and \(t_2\) splits into \(a_1(2)\) plus a doubly degenerate \(e\). Fill six electrons with Hund's rule and the last two sit parallel in \(e\): a triplet. This lesson computes each step live with a four-orbital model whose parameters are fitted to Table 1, then lets you read every defect of Fig. 3 and Table 1.`,
cards: [
{ s: "1. Four dangling bonds", t: "Four sp³ orbitals point into the empty site",
intu: String.raw`Each carbon atom in diamond makes four bonds with four \(sp^3\) hybrid orbitals, mixtures of one s and three p orbitals pointing to the corners of a tetrahedron. Remove an atom and its four neighbors are each left with one hybrid pointing into the hole: the four <b>dangling bonds</b> (DBs). They are only about 0.25 nm apart, so they overlap and an electron can hop between them. That hopping, of size \(\beta\), is what turns four separate orbitals into the defect's molecular orbitals in the next card. Rotate the picture and switch to NV to see one of the four lobes replaced by the nitrogen lone pair.`,
eq: String.raw`\[ |h_1\rangle = \tfrac12\left(|s\rangle + |p_x\rangle + |p_y\rangle + |p_z\rangle\right), \quad |h_2\rangle = \tfrac12\left(|s\rangle - |p_x\rangle - |p_y\rangle + |p_z\rangle\right), \ \dots \]\[ \langle h_i | H | h_i \rangle = \varepsilon_{\text{DB}}, \qquad \langle h_i | H | h_j \rangle = -|\beta| \ (i \neq j) \]`,
sym: [[String.raw`\(|h_i\rangle\)`, "sp³ hybrid on neighbor i, pointing toward the vacancy"], [String.raw`\(\varepsilon_{\text{DB}}\)`, "energy of an isolated dangling bond"], [String.raw`\(\beta\)`, "hopping (overlap) between two dangling bonds across the vacancy"]],
how: [String.raw`Four equal mixtures of s and p, with sign patterns chosen so they are orthogonal, point along \((1,1,1)\), \((-1,-1,1)\), \((-1,1,-1)\), \((1,-1,-1)\).`, String.raw`Around a vacancy we keep only the four hybrids that point inward. Everything else stays bonded and forms the bands.`, String.raw`By symmetry all four have the same energy \(\varepsilon_{\text{DB}}\) and every pair has the same hopping.`, String.raw`This is the paper's Fig. 5A: atomic sp³ DBs before they interact.`],
say: String.raw`A vacancy in a tetrahedral semiconductor leaves four sp³ dangling bonds pointing into the empty site, with equal energies and equal mutual hopping.`,
num: String.raw`Distance between two carbon DB sites in diamond: \(a/\sqrt2\) = 0.252 nm. Fitted to Table 1: \(\varepsilon_{\text{DB}} \approx 1.6\) eV above the VBM and \(|\beta| \approx 1.0\) eV for diamond.`,
r(fig, ctl) {
  let nv = false;
  ctl.innerHTML = sl("yw", "Rotate", 0, 360, 1, 30) + `<div class="row"><button id="nv">Make it NV (one N)</button></div>`;
  let add = 0;
  const draw = () => {
    const yaw = (+$("yw").value + add) * Math.PI / 180, P = p => JC.proj(p, yaw, 0.35, 130, 340, 170);
    $("ywv").textContent = $("yw").value + "°";
    const items = [];
    const o = P([0, 0, 0]);
    items.push({ z: 0, s: `<circle cx="${o[0]}" cy="${o[1]}" r="16" fill="none" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(o[0], o[1] + 4, "V", "middle", "th") });
    TET.forEach((v, i) => {
      const at = P(v), isN = nv && i === 0, lob = P(v.map(x => x * 0.45)), col = isN ? C.blue : C.coral;
      const dx = lob[0] - at[0], dy = lob[1] - at[1], L2 = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx) * 180 / Math.PI;
      items.push({ z: (at[2] + lob[2]) / 2 - 0.01, s: `<ellipse cx="${(at[0] + lob[0]) / 2 + dx * 0.15}" cy="${(at[1] + lob[1]) / 2 + dy * 0.15}" rx="${L2 * 0.62}" ry="15" transform="rotate(${ang} ${(at[0] + lob[0]) / 2 + dx * 0.15} ${(at[1] + lob[1]) / 2 + dy * 0.15})" fill="${col}" fill-opacity="0.4" stroke="${col}"/>` });
      // three back bonds
      TET.forEach((w, j) => { if (j === i) return; const q = P(v.map((x, m) => x - w[m] * 0.6)); items.push({ z: (at[2] + q[2]) / 2 + 0.02, s: ln(at[0], at[1], q[0], q[1], "var(--b)", 4, null, 'stroke-linecap="round"') }); });
      items.push({ z: at[2], s: ci(at[0], at[1], 15, isN ? C.blue : "var(--gray-bg)", "var(--p)") + tx(at[0], at[1] + 5, isN ? "N" : "C", "middle", "th", isN ? 'fill="#fff"' : "") + (isN ? "" : ci(lob[0], lob[1], 3.5, C.blue)) + (isN ? ci(lob[0] - 4, lob[1], 3.5, "#fff") + ci(lob[0] + 4, lob[1], 3.5, "#fff") : "") });
    });
    items.sort((a, b) => b.z - a.z);
    let s = items.map(i => i.s).join("");
    s += tx(340, 340, nv ? "NV: 3 carbon DBs with 1 electron each, N lone pair with 2" : "carbon vacancy: 4 dangling bonds, 1 electron each (neutral)", "middle", "th");
    fig.innerHTML = svg(350, s);
  };
  $("yw").oninput = draw;
  $("nv").onclick = () => { nv = !nv; $("nv").classList.toggle("on", nv); draw(); };
  JC.player(ctl, t => { add = t * 30; draw(); }, "Play rotation");
}},

{ s: "2. Td: a₁ + t₂", t: String.raw`Four orbitals become one \(a_1\) and three \(t_2\)`,
intu: String.raw`Let the four dangling bonds interact. Because every pair hops equally, the new orbitals are easy to guess from symmetry. The all-in-phase combination (all lobes the same color) gains the most bonding: it is pushed down by \(3|\beta|\). That is the \(a_1\) level. The three combinations with two lobes of each sign have equal energy, raised by \(|\beta|\): the triply degenerate \(t_2\) level. Slide \(|\beta|\) and the dangling bond energy and watch the levels move inside the diamond gap. With the values fitted to Table 1, \(a_1\) lands below the VBM and \(t_2\) at 2.66 eV in the middle of the gap, as in the paper's Fig. 3A for the carbon vacancy. This is the paper's Fig. 5B.`,
eq: String.raw`\[ H = \begin{pmatrix} \varepsilon & -|\beta| & -|\beta| & -|\beta| \\ -|\beta| & \varepsilon & -|\beta| & -|\beta| \\ -|\beta| & -|\beta| & \varepsilon & -|\beta| \\ -|\beta| & -|\beta| & -|\beta| & \varepsilon \end{pmatrix} \]\[ E_{a_1} = \varepsilon - 3|\beta|, \qquad E_{t_2} = \varepsilon + |\beta|\ (\times 3), \qquad \Delta = 4|\beta| \]`,
sym: [[String.raw`\(\varepsilon\)`, "dangling bond energy, \\(\\varepsilon_{\\text{DB}}\\)"], [String.raw`\(a_1\)`, "fully symmetric combination, (1, 1, 1, 1) / 2"], [String.raw`\(t_2\)`, "three combinations like (1, 1, −1, −1) / 2, degenerate in \\(T_d\\)"], [String.raw`\(\Delta\)`, "a₁ to t₂ splitting, called \\(\\Delta_{\\text{CV}}\\) or \\(\\Delta_{\\text{AV}}\\) in Fig. 5B"]],
how: [String.raw`Write \(H = (\varepsilon + |\beta|)\,I - |\beta|\,J\), where \(J\) is the 4 × 4 matrix of all ones.`, String.raw`\(J\) has eigenvalue 4 for the vector (1, 1, 1, 1) and 0 for the three vectors orthogonal to it.`, String.raw`So \(E = \varepsilon + |\beta| - 4|\beta| = \varepsilon - 3|\beta|\) once, and \(\varepsilon + |\beta|\) three times.`, String.raw`The trace is conserved: \((\varepsilon - 3|\beta|) + 3(\varepsilon + |\beta|) = 4\varepsilon\).`],
say: String.raw`In tetrahedral symmetry the four dangling bonds of a vacancy combine into a low-lying symmetric a₁ orbital and a threefold degenerate t₂ level 4|β| higher.`,
num: String.raw`Fit to Table 1 (\(\mathrm{V_C^{2-}}\) majority): \(a_1 = -1.46\) and \(t_2 = 2.66\) eV give \(\Delta = 4.12\) eV, so \(|\beta| = 1.03\) eV and \(\varepsilon = 1.63\) eV. The gap of diamond is 5.36 eV in the calculation, so \(t_2\) sits deep in the middle.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e", "DB energy ε (eV above VBM)", -0.5, 4, 0.01, 1.63) + sl("b", "Hopping |β| (eV)", 0, 1.6, 0.01, 1.03) + `<div class="readout" id="ro"></div>`;
  const lobes = (x, y, sg) => sg.map((g, i) => { const a = [-135, -45, 45, 135][i] * Math.PI / 180, cx = x + 17 * Math.cos(a), cy = y + 17 * Math.sin(a); return `<circle cx="${cx}" cy="${cy}" r="9" fill="${g > 0 ? C.blue : C.coral}" fill-opacity="0.75"/>`; }).join("") + ci(x, y, 3, "var(--p)");
  const u = () => {
    const e = +$("e").value, b = +$("b").value; $("ev").textContent = fmt(e, 2) + " eV"; $("bv").textContent = fmt(b, 2) + " eV";
    const B = JC.bands(70, 20, 330, 300, 5.36, -2.5, 6.2);
    let s = B.s;
    const yE = B.Y(e), ya = B.Y(e - 3 * b), yt = B.Y(e + b);
    s += ln(90, yE, 150, yE, "var(--p)", 3) + tx(120, yE - 8, "4 DBs", "middle");
    s += ln(250, ya, 330, ya, C.blue, 3) + tx(338, ya + 4, "a₁", "start", "th") + ln(250, yt, 330, yt, C.coral, 3) + tx(338, yt + 4, "t₂ (×3)", "start", "th");
    s += ln(150, yE, 250, ya, "var(--b)", 1, "3 3") + ln(150, yE, 250, yt, "var(--b)", 1, "3 3");
    s += `<line x1="380" y1="${ya}" x2="380" y2="${yt}" stroke="var(--p)" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(372, (ya + yt) / 2, `Δ = ${fmt(4 * b, 2)}`, "end");
    // sign patterns
    s += tx(545, 30, "sign pattern of each orbital", "middle", "th") + tx(545, 46, "(blue +, orange −)", "middle");
    s += lobes(545, 95, [1, 1, 1, 1]) + tx(545, 140, `a₁: ${fmt(e - 3 * b, 2)} eV`, "middle", "th");
    [[1, 1, -1, -1], [1, -1, 1, -1], [1, -1, -1, 1]].forEach((sg, i) => s += lobes(470 + i * 75, 200, sg));
    s += tx(545, 248, `t₂: ${fmt(e + b, 2)} eV, three of them`, "middle", "th");
    s += tx(545, 290, "all in phase = most bonding = lowest", "middle");
    fig.innerHTML = svg(330, s);
    $("ro").innerHTML = `<div><span>a₁</span><b>${fmt(e - 3 * b, 2)} eV</b></div><div><span>t₂</span><b>${fmt(e + b, 2)} eV</b></div><div><span>Table 1, V_C²⁻</span><b>−1.46 / 2.66</b></div>`;
  };
  $("e").oninput = u; $("b").oninput = u; u();
}},

{ s: "3. Add a nitrogen: C₃ᵥ", t: String.raw`A nitrogen neighbor splits \(t_2\) into \(a_1(2) + e\)`,
intu: String.raw`Now replace one neighbor by nitrogen. Nitrogen is more electronegative, so its dangling bond (its lone pair) is lower in energy by \(\delta\). The symmetry drops from \(T_d\) to \(C_{3v}\), and the levels rearrange. Combinations that are symmetric about the NV axis can mix with the nitrogen orbital: the lowest becomes \(a_1(1)\), pulled down and concentrated on nitrogen, and the other becomes \(a_1(2)\), the old \(t_2\) partner left on the three carbons. The two combinations that are antisymmetric cannot touch the nitrogen at all, so they stay together as the degenerate pair \(e_x, e_y\). Slide \(\delta\) up from zero and watch the correlation diagram: at \(\delta = 2\) eV the model comes close to the NV values of Table 1, \(a_1(1) = -2.04\) and \(a_1(2) = 1.31\) eV. The bar shows how much of \(a_1(1)\) sits on the nitrogen.`,
eq: String.raw`\[ \begin{pmatrix} \varepsilon - \delta & -\sqrt{3}\,|\beta'| \\ -\sqrt{3}\,|\beta'| & \varepsilon - 2|\beta| \end{pmatrix} \begin{pmatrix} c_N \\ c_C \end{pmatrix} = E \begin{pmatrix} c_N \\ c_C \end{pmatrix}, \qquad E_e = \varepsilon + |\beta| \]`,
sym: [[String.raw`\(\delta\)`, "how far the N lone pair lies below a carbon DB (\\(\\delta_{\\text{CV}}\\) in Fig. 5C is the resulting splitting)"], [String.raw`\(\beta'\)`, "hopping between the N orbital and a carbon DB"], [String.raw`\(c_N, c_C\)`, "weights on the N orbital and on the symmetric combination of the three carbon DBs"], [String.raw`\(e_x, e_y\)`, "the two carbon combinations orthogonal to the symmetric one, untouched by N"]],
how: [String.raw`Split the problem by symmetry. The three carbon DBs form one symmetric combination \((h_2 + h_3 + h_4)/\sqrt3\) and two others.`, String.raw`The symmetric carbon combination has energy \(\varepsilon - 2|\beta|\) (each carbon hops to two others) and couples to N with \(\sqrt3\,|\beta'|\).`, String.raw`Diagonalizing the 2 × 2 block gives \(a_1(1)\) (bonding, mostly N) and \(a_1(2)\) (antibonding, mostly C).`, String.raw`The other two carbon combinations sum to zero at the N site, so they do not couple. They form \(e\) at \(\varepsilon + |\beta|\).`],
say: String.raw`Replacing one neighbor of the vacancy by nitrogen lowers the symmetry to C₃ᵥ, pulling a₁(1) down onto the nitrogen and splitting the t₂ level into a₁(2) and a doubly degenerate e level.`,
num: String.raw`With \(\varepsilon = 1.63\), \(|\beta| = |\beta'| = 1.0\) and \(\delta = 2.0\) eV the model gives \(a_1(1) = -2.07\), \(a_1(2) = 1.30\), \(e = 2.66\) eV. Table 1 (NV⁻ majority): −2.04, 1.31, 2.33. The 0.3 eV miss in \(e\) comes from relaxation and the extra electron, which the model ignores.`,
r(fig, ctl) {
  ctl.innerHTML = sl("d", "N orbital lower by δ (eV)", 0, 4, 0.01, 1.97) + sl("bp", "N to C hopping |β′| (eV)", 0.2, 1.6, 0.01, 0.97) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const d = +$("d").value, bp = +$("bp").value, e = 1.63, b = 1.03; $("dv").textContent = fmt(d, 2) + " eV"; $("bpv").textContent = fmt(bp, 2) + " eV";
    const m = c3v(e, b, d, bp);
    const B = JC.bands(60, 50, 430, 280, 5.36, -3.4, 5.9);
    let s = B.s;
    const L = (x, y, col, lab) => ln(x, y, x + 80, y, col, 3) + (lab ? tx(x + 88, y + 4, lab, "start", "th") : "");
    const yA = B.Y(e - 3 * b), yT = B.Y(e + b);
    s += tx(110, 30, "T_d vacancy", "middle", "th") + tx(370, 30, "C₃ᵥ (N next door)", "middle", "th");
    s += L(70, yA, C.blue, "a₁") + L(70, yT, C.coral, "t₂");
    s += L(330, B.Y(m.a1), C.blue, `a₁(1) ${fmt(m.a1, 2)}`) + L(330, B.Y(m.a2), C.purple, `a₁(2) ${fmt(m.a2, 2)}`) + L(330, B.Y(m.e), C.coral, `e ${fmt(m.e, 2)}`);
    s += ln(150, yA, 330, B.Y(m.a1), "var(--b)", 1, "3 3") + ln(150, yT, 330, B.Y(m.a2), "var(--b)", 1, "3 3") + ln(150, yT, 330, B.Y(m.e), "var(--b)", 1, "3 3");
    const yN = B.Y(e - d); s += ln(220, yN, 270, yN, C.teal, 3) + tx(245, yN + 16, "N lone pair", "middle", "ts") + ln(270, yN, 330, B.Y(m.a1), C.teal, 1, "3 3");
    // Table 1 markers
    [[-2.04, "−2.04"], [1.31, "1.31"], [2.33, "2.33"]].forEach(([v, l]) => s += `<path d="M${505} ${B.Y(v)} l8 -5 v10 z" fill="${C.gold}"/>`);
    s += tx(500, 345, "gold marks: Table 1 values for NV⁻", "end", "ts");
    // N weight bar
    s += rc(560, 60, 90, 16, "var(--sunk)") + rc(560, 60, 90 * m.wN, 16, C.teal) + tx(605, 52, "a₁(1) on N", "middle") + tx(605, 92, fmt(100 * m.wN, 0) + " %", "middle", "th");
    fig.innerHTML = svg(355, s);
    $("ro").innerHTML = `<div><span>a₁(1)</span><b>${fmt(m.a1, 2)} eV</b></div><div><span>a₁(2)</span><b>${fmt(m.a2, 2)} eV</b></div><div><span>e (×2)</span><b>${fmt(m.e, 2)} eV</b></div><div><span>a₁(2) to e</span><b>${fmt(m.e - m.a2, 2)} eV</b></div>`;
  };
  $("d").oninput = u; $("bp").oninput = u; u();
}},

{ s: "4. Fill and count spin", t: "Fill the electrons with Hund's rule and read off the spin",
intu: String.raw`Now pour in the electrons. Each orbital holds one spin up and one spin down. <b>Exchange</b> makes it cheaper for electrons in the same degenerate level to line up their spins, which in a spin-polarized calculation shows up as the minority (spin down) levels sitting higher than the majority ones. That is why Fig. 3 has two columns. Choose the symmetry and the electron count and watch what happens. NV⁻ (\(C_{3v}\), 6 electrons) puts two parallel electrons in \(e\): \(S = 1\), and the level is either full or empty in each spin channel. The plain vacancy with 6 electrons (\(T_d\)) also has two more up than down, but its last minority electron sits alone in a triply degenerate \(t_2\) level. That partly filled degenerate level is unstable (Jahn-Teller) and has no empty level of the same spin to excite into. The paper concludes the isolated high-symmetry vacancy does not give an NV-like triplet.`,
eq: String.raw`\[ S = \frac{N_\uparrow - N_\downarrow}{2}, \qquad 2S + 1 = \text{multiplicity} \]`,
sym: [[String.raw`\(N_\uparrow, N_\downarrow\)`, "occupied majority and minority spin orbitals"], [String.raw`\(S\)`, "total spin of the defect"], [String.raw`\(X\)`, "exchange splitting: minority levels sit higher by X in a spin-polarized calculation"], [String.raw`\(2S + 1\)`, "3 for a triplet, 4 for a quartet"]],
how: [String.raw`Fill spin orbitals from the bottom, majority before minority at equal energy (Hund's first rule).`, String.raw`Count up and down electrons. Their difference gives \(S\).`, String.raw`Check each degenerate level in each spin channel. Full or empty is stable. Partly full means an orbitally degenerate state that will distort (Jahn-Teller).`, String.raw`An NV-like qubit wants an orbital singlet triplet ground state (like ³A₂) and an empty level of the same spin to excite into.`],
say: String.raw`Filling the six NV⁻ electrons into a₁(1), a₁(2) and e with Hund's rule leaves two parallel electrons in e, which gives the S = 1 ground state that criterion D1 requires.`,
num: String.raw`C₃ᵥ: 4 electrons gives \(S = 1\) (\(e^0\), but needs low \(a_1(2)\)), 5 gives \(S = \tfrac12\) (NV⁰), 6 gives \(S = 1\) (NV⁻), 7 gives \(S = \tfrac12\). \(T_d\) with a modest exchange: 4 gives \(S = 1\), 5 gives \(S = \tfrac32\), matching \(\mathrm{V_{Si}^-}\) in Table 1, a quartet.`,
r(fig, ctl) {
  let sym = 1;
  ctl.innerHTML = `<div class="row"><button data-y="0">T_d (vacancy)</button><button data-y="1">C₃ᵥ (NV-like)</button></div>` + sl("n", "Electrons", 2, 8, 1, 6) + sl("x", "Exchange X (eV)", 0, 1.5, 0.05, 0.6) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "y", sym);
    const n = +$("n").value, X = +$("x").value; $("nv").textContent = n; $("xv").textContent = fmt(X, 2) + " eV";
    const m = c3v(1.63, 1.03, 1.97, 0.97);
    const levels = sym ? [{ E: m.a1, deg: 1, n: "a₁(1)" }, { E: m.a2, deg: 1, n: "a₁(2)" }, { E: m.e, deg: 2, n: "e" }] : [{ E: 1.63 - 3 * 1.03, deg: 1, n: "a₁" }, { E: 1.63 + 1.03, deg: 3, n: "t₂" }];
    const f = fill(levels, n, X);
    const B = JC.bands(70, 30, 400, 290, 5.36, -3.4, 6.0);
    let s = B.s + ln(270, 40, 270, 320, "var(--b)", 1, "3 3") + tx(170, 50, "majority ↑", "middle", "th") + tx(370, 50, "minority ↓", "middle", "th");
    levels.forEach((l, i) => {
      [1, -1].forEach(sg => {
        const xc = sg > 0 ? 170 : 370, y = B.Y(l.E + (sg < 0 ? X : 0));
        for (let k = 0; k < l.deg; k++) { const x = xc + (k - (l.deg - 1) / 2) * 40, o = f.so.find(q => q.i === i && q.k === k && q.s === sg); s += ln(x - 15, y, x + 15, y, o.occ ? C.coral : "var(--p)", 3); if (o.occ) s += sg > 0 ? JC.up(x, y - 1, C.blue) : JC.dn(x, y - 1, C.blue); }
        s += tx(xc + (l.deg * 20 + 6), y + 4, l.n, "start");
      });
    });
    s += rc(490, 40, 170, 120, f.jt ? "var(--coral-bg)" : "var(--teal-bg)", "none", 'rx="8"');
    s += tx(575, 70, `S = ${f.S % 1 ? (2 * f.S) + "/2" : f.S}`, "middle", "th", 'font-size="22"') + tx(575, 94, ["singlet", "doublet", "triplet", "quartet", "quintet"][Math.round(2 * f.S)] || "", "middle");
    s += tx(575, 120, f.jt ? "partly filled degenerate" : "every degenerate level", "middle", "th") + tx(575, 138, f.jt ? "level: Jahn-Teller unstable" : "full or empty: stable", "middle", "th");
    fig.innerHTML = svg(330, s);
    $("ro").innerHTML = `<div><span>N↑ / N↓</span><b>${f.up} / ${f.dn}</b></div><div><span>spin S</span><b>${f.S}</b></div><div><span>NV-like triplet?</span><b>${sym && f.S === 1 && !f.jt ? "yes" : "no"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-y]").forEach(b => b.onclick = () => { sym = +b.dataset.y; u(); });
  $("n").oninput = u; $("x").oninput = u; u();
},
note: String.raw`<p>Fig. 3A shows the minority \(t_2\) of \(\mathrm{V_C^{2-}}\) with one of three slots filled, and the paper states that "because of the high symmetry of the isolated vacancy, this level structure does not lead to a ground-state triplet." The model here makes the reason visible as a partly filled degenerate level. A sharper statement needs many-body theory, a good point to discuss.</p>`},

{ s: "5. Read Fig. 3 and Table 1", t: "Read every defect of Fig. 3 and Table 1",
intu: String.raw`Here are the paper's actual numbers. Pick a defect and the diagram is drawn from Table 1: majority levels on the left, minority on the right, occupied levels in orange with an arrow for the electron, the valence band below 0 and the conduction band above the calculated gap. The spin is counted for you, and the green dashed arrow marks the lowest spin-conserving excitation from a filled level to an empty level of the same spin inside the gap. Compare NV⁻ in diamond with \(\mathrm{N_C V_{Si}^-}\) in SiC: the same pattern, squeezed into a smaller gap. Then look at \(\mathrm{V_{Si}^0}\): the excitation now happens in the majority channel, and the occupied \(a_1(2)\) sits only 0.14 eV above the valence band. Finally \(\mathrm{V_{Si}^-}\) has five electrons and spin 3/2.`,
eq: String.raw`\[ S = \tfrac12\left(\sum_{\uparrow} n_i - \sum_{\downarrow} n_i\right), \qquad \Delta\varepsilon_{\text{KS}} = \varepsilon_{\text{LUMO}}^{\sigma} - \varepsilon_{\text{HOMO}}^{\sigma} \]`,
sym: [[String.raw`\(n_i\)`, "occupation of level i (the underlined values of Table 1)"], [String.raw`\(\sigma\)`, "spin channel, majority or minority"], [String.raw`\(\Delta\varepsilon_{\text{KS}}\)`, "single-particle gap between the highest filled and lowest empty level of one spin, a rough guide to the optical energy"]],
how: [String.raw`Table 1 lists four levels per spin channel, measured from the calculated VBM, and underlines the occupied ones.`, String.raw`Count occupied levels per channel to get \(S\). Six electrons with 4 up and 2 down give \(S = 1\).`, String.raw`Spin-conserving excitation means moving an electron within one channel, from the highest filled to an empty level.`, String.raw`The single-particle gap overestimates the optical energy. Constrained DFT (lesson 6) gives the proper number, for NV 2.27 eV instead of 3.0 eV.`],
say: String.raw`Table 1 shows that NV⁻ in diamond, \(\mathrm{N_C V_{Si}^-}\) in 4H-SiC and \(\mathrm{V_{Si}^{2-}}\) all have six electrons and S = 1, with a spin-conserving minority a₁(2) to e excitation inside the gap, while \(\mathrm{V_{Si}^-}\) is a spin 3/2 quartet.`,
num: String.raw`Single-particle gaps (minority \(a_1(2) \to e_x\)): NV⁻ 5.07 − 2.06 = 3.01 eV, \(\mathrm{N_C V_{Si}^-}\) 2.35 − 0.93 = 1.42 eV, \(\mathrm{V_{Si}^{2-}}\) 2.66 − 1.66 = 1.00 eV. \(\mathrm{V_{Si}^0}\) majority \(e_x \to e_y\): 2.42 − 0.20 = 2.22 eV.`,
r(fig, ctl) {
  let k = 1;
  ctl.innerHTML = `<div class="row">${JC.TABLE1.map((d, i) => `<button data-k="${i}">${d.label}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const d = JC.TABLE1[k], x = JC.excite(d), S = JC.spinOf(d);
    let s = JC.dld(d, 80, 20, 520, 320, true);
    fig.innerHTML = svg(350, s);
    $("ro").innerHTML = `<div><span>electrons</span><b>${d.n}</b></div><div><span>spin S</span><b>${S % 1 ? (2 * S) + "/2" : S}</b></div><div><span>excitation (single particle)</span><b>${x ? (x.ch === "maj" ? "↑ " : "↓ ") + fmt(x.dE, 2) + " eV" : "none in gap"}</b></div><div><span>lowest occupied level above VBM</span><b>${fmt(Math.min(...[...d.maj.filter((e, i) => d.majo[i] && e > 0), ...d.min.filter((e, i) => d.mino[i] && e > 0)]), 2)} eV</b></div>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}}
],
summary: String.raw`Around a vacancy, four sp³ dangling bonds with hopping β form an a₁ level 3|β| below and a threefold t₂ level |β| above the bare DB energy. A nitrogen neighbor (lower orbital by δ) lowers the symmetry to C₃ᵥ, pulls a₁(1) onto nitrogen and splits t₂ into a₁(2) and a degenerate e. With parameters fitted to Table 1 (|β| ≈ 1.0 eV, ε ≈ 1.6 eV, δ ≈ 2.0 eV) this simple model reproduces the NV levels. Filling six electrons with Hund's rule puts two parallel spins in e: S = 1, with an empty minority e to excite into from a₁(2). The same pattern appears in \(\mathrm{N_C V_{Si}^-}\) and \(\mathrm{V_{Si}^{2-}}\) in SiC, compressed into the smaller gap, while \(\mathrm{V_{Si}^0}\) (4 electrons) is a triplet with a level close to the VBM and \(\mathrm{V_{Si}^-}\) is a quartet.`,
sheet: [
[String.raw`\[ H_{ij} = \varepsilon\,\delta_{ij} - |\beta|(1 - \delta_{ij}) \]`, "Four dangling bond model"],
[String.raw`\[ E_{a_1} = \varepsilon - 3|\beta|, \quad E_{t_2} = \varepsilon + |\beta| \]`, "\\(T_d\\) vacancy levels (Fig. 5B)"],
[String.raw`\[ E_{a_1(1,2)} = \tfrac{A + B}{2} \mp \sqrt{\left(\tfrac{A - B}{2}\right)^2 + 3\beta'^2}, \ A = \varepsilon - \delta,\ B = \varepsilon - 2|\beta| \]`, "C₃ᵥ a₁ levels (Fig. 5C)"],
[String.raw`\[ E_e = \varepsilon + |\beta| \]`, "C₃ᵥ e level"],
[String.raw`\[ S = (N_\uparrow - N_\downarrow)/2 \]`, "Spin from occupations"]],
consts: String.raw`Fitted: \(\varepsilon = 1.63\) eV, \(|\beta| = 1.03\) eV (\(\mathrm{V_C^{2-}}\)), \(\delta = 1.97\) eV, \(|\beta'| = 0.97\) eV (NV⁻). Calculated diamond gap 5.36 eV.`,
sources: ["Weber et al., PNAS 107, 8513 (2010), Fig. 3, Fig. 5 and Table 1", "Lannoo and Bourgoin, Point Defects in Semiconductors I (Springer, 1981), the defect molecule model (paper ref. 19)", "Coulson and Kearsley, Proc. R. Soc. A 241, 433 (1957), the original vacancy molecular orbital model", "Lenef and Rand, Phys. Rev. B 53, 13441 (1996), NV electronic structure (paper ref. 21)"]
});
})();
