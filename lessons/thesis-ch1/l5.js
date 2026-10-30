addLesson("thesis", "ch1", {
level: "Advanced",
id: "thesis-ch1-l5", title: "Optical selection rules", short: "5. Selection rules",
big: String.raw`A photon carries angular momentum \(\pm 1\) along \(z\) (\(\sigma^{+}\), \(\sigma^{-}\)) or 0 (\(\pi\)). Angular momentum must be conserved in every transition, so for a trion with a pure heavy hole only the vertical transitions in Fig. 1.1 are allowed, and the diagonals need the light-hole admixture. A magnetic field splits the levels (Zeeman effect) so the transitions get different colors. Its direction decides the geometry: along \(z\) (Faraday) gives circular cycling transitions, in the plane (Voigt) gives four linear transitions of equal strength.`,
bridge: "Lesson 3 gave the levels of Fig. 1.1: a single electron and the trion. Lesson 4 gave the dipoles and polarizations. This lesson combines them into the selection rules shown in Fig. 1.1.",
cards: [
{s: "1. Bookkeeping", t: "Angular momentum bookkeeping: which jumps are allowed",
intu: String.raw`Each state has an angular momentum along \(z\). The trion's comes from its hole, \(M = \pm 3/2\). The ground state is a single electron, \(M = \pm\tfrac{1}{2}\). When the trion decays, the photon must carry away the difference \(\Delta M\). A photon can carry +1 (\(\sigma^{+}\)), −1 (\(\sigma^{-}\)) or 0 (\(\pi\), but only in the \(z\) direction). Pick a start and an end state. \(\Delta M = \pm 1\) is allowed. \(\Delta M = \pm 2\) is impossible for a single photon, so with a pure heavy hole it is forbidden. That is the rule behind the strong vertical and the forbidden diagonal arrows in Fig. 1.1.`,
eq: String.raw`\[ \Delta M = M_{\mathrm{initial}} - M_{\mathrm{final}} = m_{\mathrm{photon}} \]\[ m_{\mathrm{photon}} = +1\ (\sigma^{+}),\ -1\ (\sigma^{-}),\ 0\ (\pi) \qquad \lvert \Delta M \rvert = 2 \;\Longrightarrow\; \text{forbidden} \]`,
sym: [[String.raw`\(M\)`, String.raw`angular momentum along \(z\) of a state`], [String.raw`\(\text{trion } \lvert \uparrow\downarrow, \Uparrow \rangle\)`, String.raw`\(M = +3/2\) (paired electrons, heavy hole \(\Uparrow\))`], [String.raw`\(\text{electron } \lvert \uparrow \rangle\)`, String.raw`\(M = +\tfrac{1}{2}\)`], [String.raw`\(m_{\mathrm{photon}}\)`, "angular momentum carried away by the photon"]],
how: [String.raw`With the field (or growth axis) along \(z\), the system is symmetric under rotation about \(z\), so angular momentum along \(z\) is conserved.`, String.raw`The photon's angular momentum is set by its polarization: \(\sigma^{\pm}\) carry \(\pm 1\), \(\pi\) carries 0.`, String.raw`So the allowed transitions are those with \(\Delta M = \pm 1\) or 0.`, String.raw`Heavy-hole trion to electron gives \(\Delta M = \pm 1\) (vertical) or \(\pm 2\) (diagonal). The diagonal would need a photon carrying 2, so it is forbidden.`],
say: String.raw`For a pure heavy-hole trion, the vertical transitions are allowed with \(\sigma^{+}\) and \(\sigma^{-}\) light, and the diagonal transitions are forbidden because they would need \(\Delta M = \pm 2\).`,
num: String.raw`Four possible transitions: <b>2 allowed</b> (\(\Delta M = \pm 1\)), <b>2 forbidden</b> (\(\Delta M = \pm 2\)) for a pure heavy hole.<br>Check: \(\Uparrow\) (\(+3/2\)) → \(\uparrow\) (\(+\tfrac{1}{2}\)): \(\Delta M = +1\), \(\sigma^{+}\). \(\Uparrow\) (\(+3/2\)) → \(\downarrow\) (\(-\tfrac{1}{2}\)): \(\Delta M = +2\), forbidden.`,
r(fig, ctl) {
  let i = 3, f = 1;
  ctl.innerHTML = `<div class="row"><label>Start (trion)</label><button data-i="3">|↑↓, ⇑⟩ +3/2</button><button data-i="-3">|↑↓, ⇓⟩ −3/2</button></div><div class="row"><label>End (electron)</label><button data-f="1">|↑⟩ +½</button><button data-f="-1">|↓⟩ −½</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "i", i); pick(ctl, "f", f);
    const dM = (i - f) / 2, xs = { 3: 250, "-3": 430 }, xg = { 1: 250, "-1": 430 };
    const ok = Math.abs(dM) === 1, col = ok ? "#1D9E75" : "#D85A30";
    const mini = (y, hs, tri) => `<text class="ts" x="20" y="${y - 12}">CB</text><line x1="45" x2="155" y1="${y - 16}" y2="${y - 16}" stroke="#378ADD" stroke-width="2"/><text class="ts" x="20" y="${y + 32}">VB</text><line x1="45" x2="155" y1="${y + 28}" y2="${y + 28}" stroke="#D85A30" stroke-width="2"/>` + (tri ? EL(85, y - 16) + EL(115, y - 16) + `<text class="ts" x="85" y="${y - 27}" text-anchor="middle">↑</text><text class="ts" x="115" y="${y - 27}" text-anchor="middle">↓</text>` + HO(100, y + 28) + `<text class="ts" x="${hs ? 112 : 100}" y="${y + 18}">${hs}</text>` : EL(100, y - 16) + `<text class="ts" x="100" y="${y - 27}" text-anchor="middle">${f > 0 ? "↑" : "↓"}</text>`);
    fig.innerHTML = svg(285, `${lvl(190, 310, 60, "|↑↓, ⇑⟩")}${lvl(370, 490, 60, "|↑↓, ⇓⟩")}${lvl(190, 310, 220, "|↑⟩")}${lvl(370, 490, 220, "|↓⟩")}${mini(60, i > 0 ? "⇑" : "⇓", true)}${mini(220, "", false)}<text class="ts" x="100" y="112" text-anchor="middle">trion: 2e in CB + 1h in VB</text><text class="ts" x="100" y="272" text-anchor="middle">one electron, VB full</text>
      <line x1="${xs[i]}" y1="68" x2="${xg[f]}" y2="196" stroke="${col}" stroke-width="3" ${ok ? "" : 'stroke-dasharray="6 5"'} marker-end="url(#ar)"/>
      <text class="th" x="590" y="130" text-anchor="middle">ΔM = ${dM > 0 ? "+" : ""}${dM}</text><text class="ts" x="590" y="152" text-anchor="middle">${ok ? (dM > 0 ? "σ⁺ photon" : "σ⁻ photon") : "forbidden"}</text><text class="ts" x="420" y="258" text-anchor="middle">each line = whole-dot state, not a band. B along z</text>`);
    $("ro").innerHTML = `<div><span>start M</span><b>${i > 0 ? "+" : "−"}3/2</b></div><div><span>end M</span><b>${f > 0 ? "+" : "−"}1/2</b></div><div><span>result</span><b class="${ok ? "good" : "badc"}">${ok ? "allowed" : "forbidden"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => { i = +b.dataset.i; u(); });
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { f = +b.dataset.f; u(); });
  u();
}},

{s: "2. Zeeman", t: "A magnetic field gives each transition its own color",
intu: String.raw`Without a field, \(\uparrow\) and \(\downarrow\) have the same energy, and so do \(\Uparrow\) and \(\Downarrow\). All transitions have the same color, and a laser cannot address one spin. A magnetic field acts on each spin like a compass needle: aligned spins go down in energy and opposite spins go up. The electron levels split by \(\Delta_e\) and the trion levels by \(\Delta_h\), which depends on the hole \(g\) factor. Now the four transitions sit at four different energies. Drag \(B\) and watch the spectrum split. The \(g\) factors here are illustrative, chosen so that the trion splitting is larger, as drawn in Fig. 1.1.`,
eq: String.raw`\[ \Delta_e = \lvert g_e \rvert\, \mu_{\mathrm{B}} B \qquad \Delta_h = \lvert g_h \rvert\, \mu_{\mathrm{B}} B \]\[ \text{vertical lines: } E_0 \pm \frac{\Delta_h + \Delta_e}{2} \qquad \text{diagonal lines: } E_0 \pm \frac{\Delta_h - \Delta_e}{2} \]`,
sym: [[String.raw`\(\mu_{\mathrm{B}}\)`, "Bohr magneton, 57.88 µeV/T"], [String.raw`\(g_e\)`, String.raw`electron \(g\) factor in the dot`], [String.raw`\(g_h\)`, String.raw`effective hole \(g\) factor of the trion along the field`], [String.raw`\(B\)`, "magnetic field (T)"], [String.raw`\(E_0\)`, String.raw`transition energy at \(B = 0\)`]],
how: [String.raw`A magnetic moment in a field has energy \(-\boldsymbol{\mu}\cdot\mathbf{B}\). For a spin, \(\boldsymbol{\mu} \propto g\,\mu_{\mathrm{B}} \times \text{spin}\).`, String.raw`So each spin pair splits symmetrically by \(g\,\mu_{\mathrm{B}} B\).`, "Take the energy of the start level minus the end level for each of the four transitions.", "The vertical lines move apart by the sum of the splittings, the diagonals by their difference."],
say: "The Zeeman effect splits the electron and trion spin levels, so each transition has its own frequency and a narrow laser can address one spin state.",
num: String.raw`With the illustrative \(\lvert g_e \rvert = 0.4\) and \(\lvert g_h \rvert = 1.2\) at \(B = 1\,\mathrm{T}\):<br>\(\Delta_e = 0.4 \times 57.88 =\) <b>23 µeV</b>, &nbsp; \(\Delta_h =\) <b>69 µeV</b><br>vertical pair separated by <b>93 µeV</b>, about 140 lifetime-limited linewidths (Lesson 4, card 5)<br>Real \(g\) factors depend on the dot. Check your group's values before quoting them.`,
r(fig, ctl) {
  ctl.innerHTML = sl("B", "Magnetic field B", 0, 8, 0.1, 2) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const B = +$("B").value; $("Bv").textContent = B.toFixed(1) + " T";
    const De = 0.4 * MUB * B, Dh = 1.2 * MUB * B, s = 0.12;
    const yU = 70, yD = 220, tU = yU - Dh / 2 * s, tD = yU + Dh / 2 * s, gU = yD + De / 2 * s, gDn = yD - De / 2 * s;
    const E = { sp: (Dh + De) / 2, sm: -(Dh + De) / 2, d1: (Dh - De) / 2, d2: -(Dh - De) / 2 };
    const span = 700, sx = v => 560 + v / span * 90;
    fig.innerHTML = svg(290, `${lvl(120, 220, tU, "⇑")}${lvl(270, 370, tD, "⇓")}${lvl(120, 220, gU, "↑")}${lvl(270, 370, gDn, "↓")}
      <line x1="170" y1="${tU+5}" x2="170" y2="${gU-5}" stroke="#378ADD" stroke-width="2.5" marker-end="url(#ar)"/><line x1="320" y1="${tD+5}" x2="320" y2="${gDn-5}" stroke="#D85A30" stroke-width="2.5" marker-end="url(#ar)"/>
      <line x1="200" y1="${tU+5}" x2="290" y2="${gDn-5}" stroke="#888780" stroke-width="1" stroke-dasharray="4 4"/><line x1="290" y1="${tD+5}" x2="200" y2="${gU-5}" stroke="#888780" stroke-width="1" stroke-dasharray="4 4"/>
      <text class="ts" x="40" y="74">trion</text><text class="ts" x="40" y="224">electron</text>
      <text class="th" x="560" y="40" text-anchor="middle">spectrum</text><line x1="455" x2="665" y1="230" y2="230" stroke="var(--p)"/>
      <line x1="${sx(E.sp)}" x2="${sx(E.sp)}" y1="230" y2="90" stroke="#378ADD" stroke-width="3"/><line x1="${sx(E.sm)}" x2="${sx(E.sm)}" y1="230" y2="90" stroke="#D85A30" stroke-width="3"/>
      <line x1="${sx(E.d1)}" x2="${sx(E.d1)}" y1="230" y2="205" stroke="#888780" stroke-width="2"/><line x1="${sx(E.d2)}" x2="${sx(E.d2)}" y1="230" y2="205" stroke="#888780" stroke-width="2"/>
      <text class="ts" x="${sx(E.sp)}" y="82" text-anchor="middle">σ⁺</text><text class="ts" x="${sx(E.sm)}" y="82" text-anchor="middle">σ⁻</text><text class="ts" x="560" y="252" text-anchor="middle">energy, ±350 µeV around E₀</text><text class="ts" x="560" y="270" text-anchor="middle">grey: weak diagonals</text><text class="ts" x="245" y="282" text-anchor="middle">level splittings exaggerated</text>`);
    $("ro").innerHTML = `<div><span>Δ_e</span><b>${De.toFixed(0)} µeV</b></div><div><span>Δ_h</span><b>${Dh.toFixed(0)} µeV</b></div><div><span>σ⁺ to σ⁻</span><b>${(Dh + De).toFixed(0)} µeV</b></div>`;
  };
  $("B").oninput = u; u();
}},

{s: "3. Weak diagonals", t: "The forbidden becomes weak: light-hole mixing again",
intu: String.raw`Card 1 said the diagonals are forbidden for a pure heavy hole. Real holes are not pure (Lesson 2, card 6). (A second cause, the in-plane field of the nuclear spins, is covered in card 7. It mixes the electron spins and gives an in-plane dipole, not a \(z\) dipole.) The small light-hole part has \(m_j = \pm\tfrac{1}{2}\), and its \(Z\) orbital gives a dipole along \(z\). Through that part, the diagonal transition only needs \(\Delta M = \pm 1\) or 0 and becomes allowed, but weakly. Its strength grows with the light-hole fraction \(\varepsilon^2\). The \(z\)-dipole part of this transition is the dashed \(\pi\) (\(z\)) arrow in Fig. 1.1. Drag \(\varepsilon^2\) and watch the diagonal arrows thicken.`,
eq: String.raw`\[ \lvert \text{hole} \rangle = \sqrt{1 - \varepsilon^2}\, \lvert \mathrm{HH} \rangle + \varepsilon\, \lvert \mathrm{LH} \rangle \]\[ \frac{\Gamma_{\mathrm{diag}}}{\Gamma_{\mathrm{vert}}} \approx \frac{2}{3}\,\frac{\varepsilon^2}{1 - \varepsilon^2}\ (\text{simple model}) \]<div class="eqnote">measured</div>\[ \Gamma_{\mathrm{vert}} \approx 100\, \Gamma_{\mathrm{diag}} \]<div class="eqref">Javadi 2018</div>`,
sym: [[String.raw`\(\varepsilon^2\)`, "light-hole fraction of the trion's hole"], [String.raw`\(\Gamma_{\mathrm{vert}}\)`, "rate of the allowed vertical transition"], [String.raw`\(\Gamma_{\mathrm{diag}}\)`, "rate of the weak diagonal transition"], [String.raw`\(2/3\)`, String.raw`\(Z\) share of the light hole`]],
how: [String.raw`The HH part of the hole drives the vertical transition with strength \(\propto (1 - \varepsilon^2)\).`, String.raw`The LH part has \(m_j = \pm\tfrac{1}{2}\). Its \(Z\) component connects to the other electron spin with \(\Delta M = 0\) (\(\pi\), \(z\) polarized).`, String.raw`So the diagonal gains a rate \(\propto \varepsilon^2 \times 2/3\).`, "Their ratio gives the formula. Javadi et al. measured a ratio of about 1/100 in their InGaAs dots."],
say: String.raw`Heavy–light hole mixing makes the diagonal trion transitions weakly allowed, with a \(z\)-polarized component. In the reference experiment they are about 100 times slower than the vertical ones.`,
num: String.raw`Ratio 1/100 in this simple model ⟹ \(\varepsilon^2 \approx\) <b>1.5 %</b> (order of magnitude only).<br>Ratio for \(\varepsilon^2 = 5\,\%\): (2/3)(0.05/0.95) ≈ <b>1/29</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("e2", "Light-hole fraction ε²", 0, 0.2, 0.001, 0.015) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const e2 = +$("e2").value; $("e2v").textContent = (e2 * 100).toFixed(1) + " %";
    const r = e2 > 0 ? (2 / 3) * e2 / (1 - e2) : 0, w = Math.max(0.6, Math.min(6, 6 * Math.sqrt(r * 8)));
    fig.innerHTML = svg(270, `${lvl(190, 310, 60, "|↑↓, ⇑⟩")}${lvl(370, 490, 80, "|↑↓, ⇓⟩")}${lvl(190, 310, 220, "|↑⟩")}${lvl(370, 490, 205, "|↓⟩")}
      <line x1="250" y1="68" x2="250" y2="212" stroke="#378ADD" stroke-width="6" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#D85A30" stroke-width="6" marker-end="url(#ar)"/>
      ${r > 0 ? `<line x1="270" y1="68" x2="410" y2="197" stroke="#1D9E75" stroke-width="${w}" stroke-dasharray="6 4" marker-end="url(#ar)"/><line x1="410" y1="88" x2="270" y2="212" stroke="#1D9E75" stroke-width="${w}" stroke-dasharray="6 4" marker-end="url(#ar)"/>` : ""}
      <text class="ts" x="236" y="150" text-anchor="end">σ⁺</text><text class="ts" x="444" y="150">σ⁻</text><text class="ts" x="340" y="252" text-anchor="middle">teal dashed: diagonals with a π (z) part, thickness ∝ rate</text>`);
    $("ro").innerHTML = `<div><span>Γ_diag / Γ_vert</span><b>${r > 0 ? r.toFixed(4) : "0"}</b></div><div><span>about 1 in</span><b>${r > 0 ? Math.round(1 / r) : "∞"}</b></div>`;
  };
  $("e2").oninput = u; u();
}},

{s: "4. Faraday vs Voigt", t: "Turning the field: Faraday versus Voigt",
intu: String.raw`The direction of the magnetic field changes which spin states are the natural ones. In Faraday geometry (\(B\) along \(z\)) the spins stay quantized along \(z\): the pictures from cards 1 to 3 apply, with two strong circular verticals and two weak diagonals. In Voigt geometry (\(B\) in the plane, along \(x\)) the electron spin is quantized along \(x\) instead. Its eigenstates are equal mixtures of \(\uparrow\) and \(\downarrow\) along \(z\). Each of them now connects to both trion states, so all four transitions are allowed with equal strength, and they are linearly polarized: verticals along \(x\), diagonals along \(y\). Toggle the geometry.`,
eq: String.raw`<div class="eqnote">Faraday \((B \parallel z)\)</div>\[ \lvert \uparrow \rangle, \lvert \downarrow \rangle \text{ along } z, \qquad 2 \text{ strong } \sigma^{\pm} + 2 \text{ weak} \]<div class="eqnote">Voigt \((B \parallel x)\)</div>\[ \lvert \uparrow_x \rangle = \frac{\lvert \uparrow \rangle + \lvert \downarrow \rangle}{\sqrt{2}}, \qquad \lvert \downarrow_x \rangle = \frac{\lvert \uparrow \rangle - \lvert \downarrow \rangle}{\sqrt{2}} \]\[ 4 \text{ equal, linear } x \text{ and } y \]`,
sym: [["Faraday", String.raw`field along the growth axis \(z\) (also the light's direction for top collection)`], ["Voigt", String.raw`field in the sample plane, perpendicular to \(z\)`], [String.raw`\(\lvert \uparrow_x \rangle, \lvert \downarrow_x \rangle\)`, String.raw`electron spin states along \(x\)`], [String.raw`\(x, y\)`, "linear in-plane polarizations"]],
how: [String.raw`The Zeeman term is \(g\,\mu_{\mathrm{B}}\,\mathbf{B}\cdot\mathbf{S}\). With \(B\) along \(x\), it is diagonal in spin states along \(x\), not \(z\).`, String.raw`Write the \(x\) states as sums of \(z\) states with equal weight.`, String.raw`Each \(z\) component connects to one trion by a \(\sigma^{+}\) or \(\sigma^{-}\) transition. Adding both with equal weight gives a linear polarization (Lesson 4, card 4).`, "So each Voigt transition is linear, and all four have the same strength."],
say: "In Faraday geometry the trion has two strong circular cycling transitions and two weak diagonals. In Voigt geometry all four transitions are equally strong and linearly polarized, so the spin is distinguished by frequency only. All of them are in-plane dipoles.",
num: String.raw`Faraday: strength ratio vertical : diagonal ≈ <b>100 : 1</b> (Javadi 2018)<br>Voigt: <b>1 : 1</b>, verticals \(x\), diagonals \(y\) (Warburton 2013, Fig. 3)<br>This is exactly Fig. 1.1 and (b) in your thesis.`,
r(fig, ctl) {
  let g = "f";
  ctl.innerHTML = btns([["f", "Faraday, B ∥ z"], ["v", "Voigt, B ∥ x"]], "g");
  const u = () => {
    pick(ctl, "g", g);
    const F = g === "f";
    const vt = F ? `<line x1="250" y1="68" x2="250" y2="212" stroke="#378ADD" stroke-width="5" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#D85A30" stroke-width="5" marker-end="url(#ar)"/><line x1="270" y1="68" x2="410" y2="197" stroke="#888780" stroke-width="1" stroke-dasharray="5 4"/><line x1="410" y1="88" x2="270" y2="212" stroke="#888780" stroke-width="1" stroke-dasharray="5 4"/><text class="ts" x="236" y="150" text-anchor="end">σ⁺</text><text class="ts" x="444" y="150">σ⁻</text>`
      : `<line x1="250" y1="68" x2="250" y2="212" stroke="#1D9E75" stroke-width="3.5" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#1D9E75" stroke-width="3.5" marker-end="url(#ar)"/><line x1="270" y1="68" x2="410" y2="197" stroke="#7F77DD" stroke-width="3.5" marker-end="url(#ar)"/><line x1="410" y1="88" x2="270" y2="212" stroke="#7F77DD" stroke-width="3.5" marker-end="url(#ar)"/><text class="ts" x="236" y="150" text-anchor="end">x</text><text class="ts" x="444" y="150">x</text><text class="ts" x="340" y="118" text-anchor="middle">y</text>`;
    const bArrow = F ? `<line x1="600" y1="170" x2="600" y2="100" stroke="var(--t)" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="610" y="138">B ∥ z</text>` : `<line x1="570" y1="140" x2="640" y2="140" stroke="var(--t)" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="605" y="128" text-anchor="middle">B ∥ x</text>`;
    fig.innerHTML = svg(270, `${lvl(190, 310, 60, F ? "|↑↓, ⇑⟩" : "trion 1")}${lvl(370, 490, 80, F ? "|↑↓, ⇓⟩" : "trion 2")}${lvl(190, 310, 220, F ? "|↑⟩" : "|↑ₓ⟩")}${lvl(370, 490, 205, F ? "|↓⟩" : "|↓ₓ⟩")}${vt}${bArrow}<text class="ts" x="340" y="256" text-anchor="middle">${F ? "2 strong circular, 2 weak (Fig. 1.1a)" : "4 equal, linear, all in-plane (Fig. 1.1b)"}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { g = b.dataset.g; u(); }); u();
}},

{s: "5. Cycling or Λ", t: "Why each geometry is useful: cycling versus Λ",
intu: String.raw`Count how many photons a dot emits before its spin flips. Each time the trion decays, it takes the diagonal path with probability \(p\). In Faraday \(p\) is about 1 %, so the dot emits on average about 100 photons on the same transition before flipping. That is a cycling transition, good for reading out the spin: bright means one spin, dark means the other. In Voigt \(p\) is 50 %, so the spin flips after about 2 photons. Those two paths from one trion to the two spins form a \(\Lambda\) shape, which is what you want for fast spin preparation and for coherent spin control with lasers. Drag \(p\) and look at the distribution of photons before a flip.`,
eq: String.raw`\[ p = \frac{\Gamma_{\mathrm{diag}}}{\Gamma_{\mathrm{vert}} + \Gamma_{\mathrm{diag}}} \]\[ P(n \text{ photons, then flip}) = (1 - p)^{n-1}\, p \qquad \langle n \rangle = \frac{1}{p} \]`,
sym: [[String.raw`\(p\)`, "probability that one decay flips the spin (branching ratio)"], [String.raw`\(n\)`, "number of photons emitted up to and including the flip"], [String.raw`\(\langle n \rangle\)`, "average number of photons before the spin flips"], [String.raw`\(\Lambda\ \text{system}\)`, "two ground states sharing one excited state"]],
how: [String.raw`Each decay is an independent event: flip with probability \(p\), stay with probability \(1 - p\).`, String.raw`The chance that the first flip happens on the \(n\)-th decay is \((1 - p)^{n-1}\,p\) (a geometric distribution).`, String.raw`Its mean is \(1/p\).`, String.raw`Faraday: \(p \approx 1/101\) ⟹ about 100 photons. Voigt: \(p = 1/2\) ⟹ 2 photons.`],
say: String.raw`Faraday geometry gives nearly closed cycling transitions useful for spin readout. Voigt geometry gives a \(\Lambda\) system with equal branching, useful for fast optical spin pumping and coherent control.`,
num: String.raw`Faraday, \(\Gamma_{\mathrm{vert}} = 100\,\Gamma_{\mathrm{diag}}\): \(p = 1/101\), \(\langle n \rangle \approx\) <b>101</b> photons<br>Voigt: \(p = 0.5\), \(\langle n \rangle =\) <b>2</b> photons<br>Probability of more than 300 photons before a flip in Faraday: \((100/101)^{300} \approx\) <b>5 %</b>`,
r(fig, ctl) {
  ctl.innerHTML = btns([["0.0099", "Faraday (p ≈ 0.01)"], ["0.5", "Voigt (p = 0.5)"]], "p") + sl("pp", "Flip probability p", 0.005, 0.6, 0.001, 0.0099) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const p = +$("pp").value; $("ppv").textContent = p.toFixed(3);
    const N = Math.max(10, Math.min(400, Math.ceil(4 / p))), bins = 40, bw = Math.ceil(N / bins);
    const vals = []; for (let b = 0; b < bins; b++) { let s = 0; for (let n = b * bw + 1; n <= (b + 1) * bw; n++) s += Math.pow(1 - p, n - 1) * p; vals.push(s); }
    const mx = Math.max(...vals); let bars = "";
    vals.forEach((v, b) => { const h = v / mx * 170; bars += `<rect x="${60 + b * 14}" y="${220 - h}" width="11" height="${h}" fill="#378ADD" rx="1"/>`; });
    const mean = 1 / p, mx2 = 60 + (mean / bw) * 14;
    fig.innerHTML = svg(270, `<text class="th" x="340" y="34" text-anchor="middle">photons emitted before the spin flips</text>${bars}<line x1="56" x2="625" y1="220" y2="220" stroke="var(--p)"/>${mx2 < 625 ? `<line x1="${mx2}" x2="${mx2}" y1="40" y2="220" stroke="#EF9F27" stroke-width="2" stroke-dasharray="4 3"/><text class="ts" x="${mx2+4}" y="56">mean 1/p</text>` : ""}<text class="ts" x="60" y="240">1</text><text class="ts" x="625" y="240" text-anchor="end">${bins * bw}</text><text class="ts" x="340" y="258" text-anchor="middle">n (number of photons), ${bw} per bar</text>`);
    $("ro").innerHTML = `<div><span>mean photons ⟨n⟩</span><b>${mean.toFixed(1)}</b></div><div><span>best suited for</span><b>${p < 0.1 ? "spin readout" : "fast pumping, Λ control"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { $("pp").value = b.dataset.p; u(); });
  $("pp").oninput = u; u();
}},

{s: "6. To TE or TM", t: "From each transition to a waveguide mode",
intu: String.raw`Put everything together. Pick a geometry and a transition and follow the chain: transition → dipole direction → which waveguide mode family it couples to at the membrane mid-plane (Lesson 6 proves the last step). All strong transitions in both geometries have in-plane dipoles, so they go into TE-like modes. Only the \(z\) part of the weak Faraday diagonals goes into TM-like modes. That is the physical content of the label 'TE (strong) + TM (weak)' in Fig. 1.2(a), and it is why the PBS separates strong from weak transitions but cannot tell \(\sigma^{+}\) from \(\sigma^{-}\).`,
eq: String.raw`\[ \text{in-plane dipole } (x, y, \sigma^{\pm}) \longrightarrow \text{TE-like} \qquad z \text{ dipole } (\pi) \longrightarrow \text{TM-like} \]<div class="eqref">dot at the mid-plane</div>`,
sym: [["TE-like", String.raw`mode whose field at the mid-plane is in the plane (\(E_z = 0\) there)`], ["TM-like", String.raw`mode whose field at the mid-plane is along \(z\)`], ["mid-plane", "the plane halfway through the membrane thickness"]],
how: ["Selection rules give the polarization of each transition (cards 1 to 4).", "Polarization gives the dipole direction (Lesson 4).", String.raw`Coupling \(\propto \lvert \mathbf{d}\cdot\mathbf{E} \rvert^2\) (Lesson 4, card 3), so the dipole picks the mode whose field points the same way at the dot.`, "Mirror symmetry of the membrane fixes that direction for each mode family (Lesson 6)."],
say: String.raw`All strong transitions are in-plane dipoles and couple to TE-like modes. The weak diagonal transitions in Faraday geometry have a \(z\) component that couples to TM-like modes. A PBS therefore separates the strong and the weak transitions, but cannot separate \(\sigma^{+}\) from \(\sigma^{-}\), and it does not by itself read out the spin.`,
num: "Faraday: <b>2</b> transitions to TE (strong), <b>2</b> with a TM part (weak, about 1/100)<br>Voigt: all <b>4</b> to TE<br>So the TM port of the PBS carries only the weak diagonal light.",
r(fig, ctl) {
  let g = "f", t = "v1";
  ctl.innerHTML = `<div class="row"><label>Geometry</label><button data-g="f">Faraday</button><button data-g="v">Voigt</button></div><div class="row"><label>Transition</label><button data-t="v1">vertical 1</button><button data-t="v2">vertical 2</button><button data-t="d1">diagonal</button></div>`;
  const u = () => {
    pick(ctl, "g", g); pick(ctl, "t", t);
    const R = { f: { v1: ["σ⁺", "circular, in-plane", "TE-like", "strong"], v2: ["σ⁻", "circular, in-plane", "TE-like", "strong"], d1: ["weak, has π (z)", "z component", "TM-like (z part)", "weak, about 1/100"] }, v: { v1: ["linear x", "in-plane x", "TE-like", "equal"], v2: ["linear x", "in-plane x", "TE-like", "equal"], d1: ["linear y", "in-plane y", "TE-like", "equal"] } }[g][t];
    const tm = R[2].startsWith("TM");
    const box = (x, lab, val, cls) => `<g class="${cls}"><rect x="${x}" y="100" width="140" height="70" rx="8" stroke-width="0.8"/></g><text class="ts" x="${x+70}" y="122" text-anchor="middle">${lab}</text><text class="th" x="${x+70}" y="148" text-anchor="middle">${val}</text>`;
    fig.innerHTML = svg(260, `${box(20, "transition", R[0], "c-gray")}${box(190, "dipole", R[1], "c-purple")}${box(360, "polarization family", g === "f" ? "Faraday" : "Voigt", "c-gray")}${box(530, "couples to", R[2], tm ? "c-coral" : "c-blue")}<line x1="162" x2="188" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><line x1="332" x2="358" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><line x1="502" x2="528" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><text class="th" x="340" y="214" text-anchor="middle">strength: ${R[3]}</text><text class="ts" x="340" y="238" text-anchor="middle">dot assumed at the membrane mid-plane</text>`);
  };
  ctl.querySelectorAll("button[data-g]").forEach(b => b.onclick = () => { g = b.dataset.g; u(); });
  ctl.querySelectorAll("button[data-t]").forEach(b => b.onclick = () => { t = b.dataset.t; u(); });
  u();
}},
{s: "7. What the papers show", t: "What the papers show, figure by figure",
intu: String.raw`Your Chapter 1 builds Fig. 1.1 and the TE/TM argument on three papers. This card redraws their key figures as simple schematics (not the published images) and says what each one shows, the exact sentence you rely on, and where you cite it. Warburton 2013 gives the textbook selection rules in both geometries (his Fig. 3a and 3b). Javadi 2018 is the experiment your Fig. 1.1 follows (its Fig. 1a), and its main text names <b>two</b> causes of the weak diagonals: heavy-hole light-hole mixing and the in-plane Overhauser field of the nuclear spins. Only the mixing part carries a \(z\) dipole, which is why Sec. 1.3 says the diagonals "can also" emit into TM-like modes. Appel 2021 shows that a waveguide picks transitions by how their dipoles project onto the local field of the guided mode. Pick a paper figure.`,
eq: String.raw`\[ \text{Faraday: } \sigma^{\pm} \text{ strong}, \quad \text{diagonals weak:}\ \ \frac{\gamma}{\Gamma} \approx \frac{1}{100} \]<div class="eqref">Javadi 2018</div>\[ \text{Voigt: four equal linear transitions}, \quad \text{in a waveguide: } C = \frac{\gamma_y}{\gamma_x} \]<div class="eqref">Warburton 2013, Appel 2021</div>`,
sym: [[String.raw`\(\Gamma, \gamma\)`, "decay rates through the vertical and the diagonal transitions (Javadi's notation)"], [String.raw`\(T_1\)`, "lifetime of the electron spin in the ground state"], [String.raw`\(\gamma_x, \gamma_y\)`, "decay rates through the x- and y-polarized dipoles (Appel's notation)"], [String.raw`\(C\)`, "cyclicity: how many photons the dot emits before its spin flips, on average"], ["Overhauser field", "effective magnetic field on the electron from the nuclear spins of the dot. Its in-plane part mixes spin up and down"]],
how: [String.raw`<b>Warburton Fig. 3a (Faraday).</b> Each electron spin connects to one trion through \(\sigma^{+}\) or \(\sigma^{-}\). The diagonals are "weakly allowed through the light-hole" admixture. You cite it for the selection rules and as a source of Fig. 1.1.`, String.raw`<b>Warburton Fig. 3b (Voigt).</b> "All four transitions among the four levels are now allowed, each equally strong", verticals x, diagonals y. In Draft 4 this is the one Voigt sentence.`, String.raw`<b>Javadi Fig. 1a.</b> Same four levels as your Fig. 1.1, with \(\Gamma\), \(\gamma\) and \(T_1\). Main text: both the Overhauser field and HH-LH mixing cause the diagonals, mixing dominant at higher field. \(\gamma\) is two orders of magnitude below \(\Gamma\).`, String.raw`<b>Appel (main idea).</b> In Voigt the guided mode of a photonic crystal waveguide is polarized along \(y\) at the dot, so the \(y\) dipoles couple strongly and the \(x\) dipoles hardly at all. The waveguide, not the field, creates a cycling transition. You cite it for "coupling depends on how the dipole projects onto the local field".`],
say: "The selection rules follow Warburton 2013, and Fig. 1.1 follows Javadi 2018. The diagonal transitions are weakly allowed through heavy-hole light-hole mixing and the in-plane nuclear field, about 100 times slower than the circular ones. Only the light-hole part has a z dipole, so the diagonals can also emit into TM-like modes.",
num: String.raw`Javadi 2018: \(\Gamma \approx 100\,\gamma\), spin preparation up to <b>96 %</b>, field 0.55 T in the first data, InGaAs dots near 930 nm.<br>Appel 2021: cyclicity <b>11.6</b> (negative trion) and <b>14.7</b> (positive trion), y over x coupling about <b>21</b>, spin initialization <b>99.1 %</b>, dots near 947 nm.<br>None of these papers talks about TE and TM modes. That link is your own step (Lesson 6).`,
note: String.raw`If asked "which paper says the diagonals are TM?": none says it in those words. Javadi 2018 says the diagonals come from heavy-hole light-hole mixing and the in-plane Overhauser field. The light-hole part contains \(Z\), so it has a dipole along the growth axis, and Lesson 6 shows that a \(z\) dipole at the mid-plane couples only to TM-like modes. The nuclear-field part is in-plane, which is why the thesis says "can also emit into TM-like modes".`,
r(fig, ctl) {
  let k = "w3a";
  const P = {
    w3a: ["Warburton 2013, Fig. 3a", "Faraday geometry: B along z", "“the optical selection rules are particularly simple” … diagonals “weakly allowed through the light-hole” admixture", "Ch. 1 Sec. 1.1 (selection rules) and Fig. 1.1 (“after Warburton”)", "https://doi.org/10.1038/nmat3585"],
    w3b: ["Warburton 2013, Fig. 3b", "Voigt geometry: B in the plane (x)", "“all four transitions among the four levels are now allowed, each equally strong” … “the vertical transitions are driven with x linearly polarized light”", "Ch. 1 Sec. 1.1, the one Voigt sentence (Draft 4)", "https://doi.org/10.1038/nmat3585"],
    j1a: ["Javadi 2018, Fig. 1a", "Faraday geometry, negatively charged dot in a nanobeam", "Caption: “The diagonal transitions are inhibited due to optical selection rules, but weakly allowed due to heavy-hole light-hole mixing.” Main text: “weakly allowed due to the in-plane Overhauser field and heavy-hole light-hole mixing … with the latter being the dominant mechanism at higher magnetic fields.”", "Ch. 1 Sec. 1.1 (diagonals, rate 1/100, 96 % preparation) and Fig. 1.1", "https://arxiv.org/abs/1709.06369"],
    ap: ["Appel 2021, main idea", "Voigt geometry inside a photonic crystal waveguide", "coupling “determined by the projected coupling onto the single polarized waveguide mode”, “sensitively controlled by the position of the QD”", "Ch. 1 Sec. 1.1: coupling depends on how the dipole projects onto the local field of the guided mode", "https://doi.org/10.1103/PhysRevLett.126.013602"]
  };
  ctl.innerHTML = `<div class="row">${Object.keys(P).map(c => `<button data-c="${c}">${P[c][0]}</button>`).join("")}</div><div class="readout" id="ro"></div>`;
  const TE = "#378ADD", TM = "#D85A30", G = "#888780";
  const lv = (x, y, lab, up) => `<line x1="${x - 55}" x2="${x + 55}" y1="${y}" y2="${y}" stroke="var(--t)" stroke-width="2.5"/><text class="th" x="${x}" y="${up ? y - 10 : y + 22}" text-anchor="middle">${lab}</text>`;
  const ar = (x1, y1, x2, y2, c, w, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dash ? 'stroke-dasharray="7 5"' : ""} marker-start="url(#ar)" marker-end="url(#ar)"/>`;
  const four = (kind) => {
    const xl = 170, xr = 360, ey1 = 60, ey2 = 82, gy1 = 222, gy2 = 210;
    let s = lv(xl, ey1, "|↑↓,⇑⟩", true) + lv(xr, ey2, "|↑↓,⇓⟩", true) + lv(xl, gy1, kind === "voigt" ? "|↑ₓ⟩" : "|↑⟩") + lv(xr, gy2, kind === "voigt" ? "|↓ₓ⟩" : "|↓⟩");
    if (kind === "voigt") {
      s += ar(xl - 10, gy1 - 4, xl - 10, ey1 + 4, TE, 3) + ar(xr + 10, gy2 - 4, xr + 10, ey2 + 4, TE, 3) + ar(xl + 20, gy1 - 4, xr - 20, ey2 + 4, TM, 3) + ar(xr - 20, gy2 - 4, xl + 20, ey1 + 4, TM, 3);
      s += `<text class="th" x="${xl - 30}" y="150" text-anchor="end" fill="${TE}">x</text><text class="th" x="${xr + 30}" y="150" fill="${TE}">x</text><text class="th" x="265" y="128" text-anchor="middle" fill="${TM}">y</text>`;
    } else {
      s += ar(xl, gy1 - 4, xl, ey1 + 4, TE, 3) + ar(xr, gy2 - 4, xr, ey2 + 4, TM, 3) + ar(xl + 22, gy1 - 4, xr - 22, ey2 + 4, G, 1.5, 1) + ar(xr - 22, gy2 - 4, xl + 22, ey1 + 4, G, 1.5, 1);
      s += `<text class="th" x="${xl - 14}" y="150" text-anchor="end" fill="${TE}">σ⁺</text><text class="th" x="${xr + 14}" y="150" fill="${TM}">σ⁻</text>`;
    }
    return s;
  };
  const u = () => {
    ctl.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.c === k));
    const p = P[k]; let s = `<text class="th" x="265" y="22" text-anchor="middle">${p[1]}</text>`;
    if (k === "w3a") s += four("far") + `<text class="ts" x="265" y="128" text-anchor="middle" fill="${G}">weak</text><text class="ts" x="470" y="80">dashed: weakly allowed</text><text class="ts" x="470" y="98">through the light hole</text><text class="ts" x="470" y="130">σ⁺, σ⁻: circular,</text><text class="ts" x="470" y="148">in-plane dipoles</text>`;
    if (k === "w3b") s += four("voigt") + `<text class="ts" x="470" y="80">all four equally strong</text><text class="ts" x="470" y="110">verticals: x linear</text><text class="ts" x="470" y="128">diagonals: y linear</text><text class="ts" x="470" y="158">all in-plane</text><text class="ts" x="470" y="176">(TE-like in a membrane)</text>`;
    if (k === "j1a") s += four("far") + `<text class="ts" x="265" y="150" text-anchor="middle" fill="${G}">γ</text><text class="ts" x="156" y="172" text-anchor="end" fill="${TE}">Γ</text><text class="ts" x="374" y="172" fill="${TM}">Γ</text><path d="M120 236 Q265 268 410 224" fill="none" stroke="var(--p)" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#ar)"/><text class="ts" x="265" y="266" text-anchor="middle">T₁ (spin flip in the ground state)</text><text class="ts" x="500" y="70">γ ≈ Γ / 100</text><text class="ts" x="500" y="96">diagonals from two causes:</text><text class="ts" x="500" y="114" fill="${TM}">• HH-LH mixing: z dipole</text><text class="ts" x="500" y="132" fill="${TE}">• in-plane Overhauser field:</text><text class="ts" x="512" y="150" fill="${TE}">in-plane dipole</text><text class="ts" x="500" y="176">mixing dominates at higher B</text><text class="ts" x="500" y="208">B_z along the growth axis</text>`;
    if (k === "ap") {
      s += `<rect x="40" y="110" width="430" height="70" rx="6" fill="var(--sunk)" stroke="var(--b)"/>`;
      for (let i = 0; i < 9; i++) for (const yy of [90, 200]) s += `<circle cx="${70 + i * 48}" cy="${yy}" r="12" fill="none" stroke="var(--b)" stroke-width="1.5"/>`;
      s += `<text class="ts" x="50" y="174">photonic crystal waveguide (top view)</text><circle cx="255" cy="145" r="7" fill="#EF9F27" stroke="#854F0B"/>`;
      s += `<line x1="255" y1="145" x2="255" y2="122" stroke="${TE}" stroke-width="4" marker-end="url(#ar)"/><line x1="255" y1="145" x2="292" y2="145" stroke="${G}" stroke-width="2" marker-end="url(#ar)"/><text class="th" x="264" y="128" fill="${TE}">y</text><text class="ts" x="296" y="149" fill="${G}">x</text>`;
      s += `<text class="ts" x="255" y="236" text-anchor="middle">guided mode polarized along y at the dot</text><text class="ts" x="500" y="80">y dipole: projects onto the</text><text class="ts" x="500" y="98">mode field, couples strongly</text><text class="ts" x="500" y="128">x dipole: perpendicular,</text><text class="ts" x="500" y="146">hardly couples</text><text class="ts" x="500" y="176">C = γ_y / γ_x ≈ 12 to 15</text><text class="ts" x="500" y="206">same physics as your TE/TM</text><text class="ts" x="500" y="224">step: dipole · local field</text>`;
    }
    s += `<text class="ts" x="340" y="288" text-anchor="middle">schematic redrawn for this notebook, not the published figure</text>`;
    fig.innerHTML = svg(296, s) + `<p class="note"><b>What you rely on:</b> ${p[2]}</p>`;
    $("ro").innerHTML = `<div><span>where you cite it</span><b>${p[3]}</b></div><div><span>open the paper</span><b><a href="${p[4]}" target="_blank" rel="noopener">${p[4].includes("arxiv") ? "arXiv version" : "DOI link"} ↗</a></b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { k = b.dataset.c; u(); });
  u();
}}
],
summary: String.raw`Angular momentum along \(z\) is conserved, and a photon carries \(\pm 1\) (\(\sigma^{\pm}\)) or 0 (\(\pi\)). For a heavy-hole trion, the vertical transitions have \(\Delta M = \pm 1\) and are allowed, while the diagonals need \(\Delta M = \pm 2\) and are forbidden. A small light-hole admixture makes the diagonals weakly allowed with a \(z\)-polarized part, about 100 times slower in Javadi 2018. A magnetic field splits the levels so each transition has its own frequency. In Faraday geometry the verticals are circular cycling transitions, useful for readout. In Voigt geometry all four are linear and equally strong, a \(\Lambda\) system useful for spin pumping. All strong transitions are in-plane and couple to TE, and only the weak \(z\) part couples to TM.`,
sheet: [
[String.raw`\[ \Delta M = M_i - M_f = +1\ (\sigma^{+}),\ -1\ (\sigma^{-}),\ 0\ (\pi) \]`, "Angular momentum conservation"],
[String.raw`\[ \text{trion } M = \pm 3/2, \quad \text{electron } M = \pm 1/2 \]`, "Fig. 1.1 states"],
[String.raw`\[ \Delta = \lvert g \rvert\, \mu_{\mathrm{B}} B, \quad \mu_{\mathrm{B}} = 57.88\,\mu\mathrm{eV/T} \]`, "Zeeman splitting"],
[String.raw`\[ \text{vertical: } E_0 \pm \frac{\Delta_h + \Delta_e}{2}, \quad \text{diagonal: } E_0 \pm \frac{\Delta_h - \Delta_e}{2} \]`, "Line positions (Faraday)"],
[String.raw`\[ \frac{\Gamma_{\mathrm{diag}}}{\Gamma_{\mathrm{vert}}} \approx \frac{2}{3}\,\frac{\varepsilon^2}{1 - \varepsilon^2} \]`, "Weak diagonals from LH mixing (simple model)"],
[String.raw`\[ \lvert \uparrow_x \rangle = \frac{\lvert \uparrow \rangle + \lvert \downarrow \rangle}{\sqrt{2}} \]`, "Voigt spin eigenstate"],
[String.raw`\[ \langle n \rangle = \frac{1}{p}, \quad p = \frac{\Gamma_{\mathrm{diag}}}{\Gamma_{\mathrm{vert}} + \Gamma_{\mathrm{diag}}} \]`, "Photons before a spin flip"]],
consts: String.raw`\(\mu_{\mathrm{B}} = 57.88\,\mu\mathrm{eV/T}\). \(g\) factors on this page are illustrative.`,
sources: ["Warburton, Nature Materials 12, 483 (2013) (thesis ref., Fig. 3: Faraday and Voigt schemes)", "Javadi et al., Nature Nanotechnology 13, 398 (2018) (thesis ref., Γ ≈ 100 γ, spin pumping)", "Appel et al., Phys. Rev. Lett. 126, 013602 (2021) (thesis ref., Voigt geometry in a waveguide)", "Lodahl, Mahmoodian and Stobbe, Rev. Mod. Phys. 87, 347 (2015) (thesis ref.)"]
});
