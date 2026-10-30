addLesson("thesis", "ch1", {
level: "Intermediate",
id: "thesis-ch1-l3", title: "Exciton, trion, biexciton", short: "3. Exciton, trion, biexciton",
big: "An electron and a hole attract each other, so they form bound complexes. One electron plus one hole is an exciton. Add one more electron and you get a negative trion, the excited state in Fig. 1.1. Two of each make a biexciton. Pauli pairing decides the spin of each complex, and the spin decides which light it can emit.",
bridge: "Lesson 1 gave the energy of one electron and one hole in the dot. This lesson adds their Coulomb attraction and counts how many carriers are in the dot at once.",
cards: [
{s: "1. Exciton", t: "A hydrogen atom made of an electron and a hole",
intu: String.raw`The electron is negative and the hole is positive, so they attract like the electron and proton in hydrogen. In bulk GaAs they can orbit each other as a bound pair called an exciton. Two things make it very different from hydrogen. The surrounding crystal screens the attraction by its dielectric constant \(\varepsilon_r\), and the particles are light (effective masses). Both make the pair weakly bound and very large. Drag the sliders: lowering \(\varepsilon_r\) or raising \(\mu\) shrinks the orbit and deepens the binding. At the GaAs values the orbit spans about 20 lattice constants, which is why the effective mass picture of Lesson 1 still works.`,
eq: String.raw`\[ E_{\mathrm{X}} = \mathrm{Ry} \times \frac{\mu/m_0}{\varepsilon_r^2} \qquad a_{\mathrm{X}} = a_{\mathrm{B}} \times \frac{\varepsilon_r}{\mu/m_0} \]\[ \mathrm{Ry} = 13.606\,\mathrm{eV}, \qquad a_{\mathrm{B}} = 0.0529\,\mathrm{nm} \]`,
sym: [[String.raw`\(E_{\mathrm{X}}\)`, "exciton binding energy: energy needed to separate the pair"], [String.raw`\(a_{\mathrm{X}}\)`, "exciton Bohr radius: size of the orbit"], [String.raw`\(\mu\)`, String.raw`reduced mass, \(1/\mu = 1/m_e^{*} + 1/m_h^{*}\)`], [String.raw`\(\varepsilon_r\)`, "relative dielectric constant of GaAs, about 12.9"], [String.raw`\(\mathrm{Ry}\)`, "hydrogen Rydberg energy, 13.606 eV"], [String.raw`\(a_{\mathrm{B}}\)`, "hydrogen Bohr radius, 0.0529 nm"]],
how: [String.raw`Write the hydrogen problem: kinetic energy of two particles plus the Coulomb attraction \(-e^2/(4\pi\varepsilon_0\varepsilon_r r)\).`, String.raw`Separate the center of mass motion. The relative motion has the reduced mass \(\mu\).`, String.raw`This is exactly hydrogen with \(m_0\) replaced by \(\mu\) and \(\varepsilon_0\) replaced by \(\varepsilon_0\varepsilon_r\).`, String.raw`Hydrogen gives \(E = 13.6\,\mathrm{eV}\) and \(a = 0.0529\,\mathrm{nm}\). Rescale: energy goes as \(\mu/\varepsilon_r^2\), size as \(\varepsilon_r/\mu\).`],
say: "The exciton is a hydrogen-like bound state of an electron and a hole, screened by the crystal. In bulk GaAs it is bound by only a few meV and is about 12 nm across.",
num: String.raw`GaAs: \(\varepsilon_r = 12.9\), \(\mu \approx 0.058\,m_0\)<br>\(E_{\mathrm{X}} = 13.606 \times 0.058 / 12.9^2 \approx\) <b>4.7 meV</b> (measured about 4.2 meV, so the simple model is close)<br>\(a_{\mathrm{X}} = 0.0529 \times 12.9 / 0.058 \approx\) <b>11.8 nm</b><br>Compare: hydrogen binding 13.6 eV, almost 3000 times larger.`,
r(fig, ctl) {
  ctl.innerHTML = sl("er", "Dielectric constant ε_r", 1, 15, 0.1, 12.9) + sl("mu", "Reduced mass μ/m₀", 0.02, 0.3, 0.002, 0.058) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const er = +$("er").value, mu = +$("mu").value; $("erv").textContent = er.toFixed(1); $("muv").textContent = mu.toFixed(3);
    const E = 13606 * mu / (er * er), a = 0.0529 * er / mu;
    const R = Math.min(150, 12 + a * 5);
    let lat = ""; for (let x = 70; x <= 610; x += 27) for (let y = 40; y <= 250; y += 27) lat += `<circle cx="${x}" cy="${y}" r="1.6" fill="var(--b)"/>`;
    fig.innerHTML = svg(290, `${lat}<circle cx="340" cy="145" r="${R}" fill="none" stroke="var(--p)" stroke-dasharray="5 4"/>${HO(340,145)}<text class="ts" x="340" y="149" text-anchor="middle">+</text>${EL(340+R*0.707,145-R*0.707)}<line x1="340" y1="145" x2="${340+R}" y2="145" stroke="#EF9F27" stroke-width="1.5"/><text class="ts" x="${340+R/2}" y="139" text-anchor="middle">a_X</text><text class="ts" x="340" y="280" text-anchor="middle">dots: GaAs lattice spacing about 0.57 nm (shown schematically)</text>`);
    $("ro").innerHTML = `<div><span>binding E_X</span><b>${E < 1000 ? E.toFixed(1) + " meV" : (E / 1000).toFixed(2) + " eV"}</b></div><div><span>Bohr radius a_X</span><b>${a.toFixed(1)} nm</b></div><div><span>orbit / lattice constant</span><b>${(a / 0.565).toFixed(0)}</b></div>`;
  };
  $("er").oninput = u; $("mu").oninput = u; u();
}},

{s: "2. Exciton in a dot", t: "Who wins: confinement or Coulomb?",
intu: String.raw`In a dot two energies compete. Squeezing the pair costs confinement energy that grows as \(1/L^2\) (Lesson 1). The Coulomb attraction grows only as \(1/L\), because the charges are closer in a small dot. The plot shows both on log scales. For a small dot the blue confinement line is far above the coral Coulomb line: the electron and hole each sit in their own box level and Coulomb is only a small correction. This is strong confinement. For a dot much larger than \(a_{\mathrm{X}}\), Coulomb wins and the whole exciton moves around as one particle. Your droplet-etched dots are a few nm tall (strongly confined along \(z\)) and tens of nm wide, comparable to \(a_{\mathrm{X}}\) in the plane.`,
eq: String.raw`\[ E_{\mathrm{conf}} \approx \frac{\hbar^2\pi^2}{2\mu L^2} \propto \frac{1}{L^2} \qquad E_{\mathrm{C}} \sim \frac{e^2}{4\pi\varepsilon_0\varepsilon_r L} \propto \frac{1}{L} \]\[ \text{strong confinement: } L \ll a_{\mathrm{X}} \qquad \text{weak confinement: } L \gg a_{\mathrm{X}} \]`,
sym: [[String.raw`\(L\)`, "dot size in the direction considered (nm)"], [String.raw`\(E_{\mathrm{conf}}\)`, "kinetic cost of confining the pair, from the particle in a box"], [String.raw`\(E_{\mathrm{C}}\)`, "order of magnitude of the electron–hole Coulomb energy"], [String.raw`\(e^2/4\pi\varepsilon_0\)`, "1.44 eV·nm"], [String.raw`\(a_{\mathrm{X}}\)`, "exciton Bohr radius, about 12 nm in GaAs"]],
how: [String.raw`Confinement: \(k \approx \pi/L\), so kinetic energy \(\propto \hbar^2k^2/2m \propto 1/L^2\).`, String.raw`Coulomb: energy of two charges at distance \(\sim L\) is \(e^2/(4\pi\varepsilon_0\varepsilon_r L) \propto 1/L\).`, String.raw`As \(L\) shrinks, \(1/L^2\) grows faster than \(1/L\), so confinement eventually dominates.`, String.raw`The two are comparable when \(L\) is a few times \(a_{\mathrm{X}}\). That sets the boundary between the regimes.`],
say: "In strong confinement the electron and hole are each quantized by the dot and Coulomb attraction is a small correction of a few meV to tens of meV. The exciton picture of the bulk no longer applies directly.",
num: String.raw`Pair confinement, \(L = 5\,\mathrm{nm}\): 0.376 / (0.058 × 25) ≈ <b>260 meV</b> (infinite wall estimate along one direction)<br>Coulomb scale, \(L = 5\,\mathrm{nm}\): 1.44 / (12.9 × 5) ≈ <b>22 meV</b><br>Measured exciton binding energies in quantum dots are typically a few to around 20 meV.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Dot size L", 2, 100, 1, 10) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const L = +$("L").value; $("Lv").textContent = L + " nm";
    const mu = 0.058, er = 12.9, ec = L => 376 / (mu * L * L), cc = L => 1440 / (er * L);
    const x0 = 80, y0 = 30, w = 520, h = 200, lx = v => x0 + (Math.log10(v) - Math.log10(2)) / (2 - Math.log10(2)) * w, ly = v => y0 + h - (Math.log10(v) + 1) / 5 * h;
    const xs = range(Math.log10(2), 2, 80).map(v => Math.pow(10, v));
    const path = f => { let d = ""; xs.forEach(L => { const v = f(L); if (v < 0.1 || v > 10000) return; d += (d ? "L" : "M") + lx(L).toFixed(1) + " " + ly(v).toFixed(1); }); return d; };
    let grid = ""; [0.1, 1, 10, 100, 1000, 10000].forEach(v => grid += `<line x1="${x0}" x2="${x0+w}" y1="${ly(v)}" y2="${ly(v)}" stroke="var(--b)" stroke-width="0.5"/><text class="ts" x="${x0-6}" y="${ly(v)+4}" text-anchor="end">${v}</text>`);
    [2, 5, 10, 20, 50, 100].forEach(v => grid += `<text class="ts" x="${lx(v)}" y="${y0+h+16}" text-anchor="middle">${v}</text>`);
    const ax = 11.8;
    fig.innerHTML = svg(280, `${grid}<rect x="${lx(2)}" y="${y0}" width="${lx(ax)-lx(2)}" height="${h}" fill="var(--blue)" opacity="0.07"/><line x1="${lx(ax)}" x2="${lx(ax)}" y1="${y0}" y2="${y0+h}" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="${lx(ax)+4}" y="${y0+12}">a_X ≈ 12 nm</text><text class="ts" x="${lx(3)}" y="${y0+h-8}">strong</text><text class="ts" x="${lx(60)}" y="${y0+h-8}">weak</text><path d="${path(ec)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${path(cc)}" fill="none" stroke="#D85A30" stroke-width="2.5"/><line x1="${lx(L)}" x2="${lx(L)}" y1="${y0}" y2="${y0+h}" stroke="#EF9F27" stroke-width="2"/><text class="ts" x="${x0+w/2}" y="${y0+h+34}" text-anchor="middle">dot size L (nm), log scale</text><text class="ts" x="20" y="${y0+h/2}" transform="rotate(-90 20 ${y0+h/2})" text-anchor="middle">energy (meV), log</text><text class="ts" x="${x0+w-4}" y="${ly(ec(60))-8}" text-anchor="end" fill="#378ADD">confinement ∝ 1/L²</text><text class="ts" x="${x0+w-4}" y="${ly(cc(100))-8}" text-anchor="end">Coulomb ∝ 1/L</text>`);
    $("ro").innerHTML = `<div><span>confinement</span><b>${ec(L).toFixed(1)} meV</b></div><div><span>Coulomb scale</span><b>${cc(L).toFixed(1)} meV</b></div><div><span>regime</span><b>${L < ax ? "strong" : L < 3 * ax ? "intermediate" : "weak"}</b></div>`;
  };
  $("L").oninput = u; u();
}},

{s: "3. Bright and dark", t: "Spin of the neutral exciton: bright and dark",
intu: String.raw`Now count angular momentum. In the dot the electron has spin \(s_z = \pm\tfrac{1}{2}\) and the heavy hole has \(j_z = \pm 3/2\) (Lesson 2). The exciton's total is \(M = s_z + j_z\), which can be \(\pm 1\) or \(\pm 2\). A photon can carry only \(\pm 1\), so only \(M = \pm 1\) excitons can emit. They are <b>bright</b>. \(M = \pm 2\) excitons cannot emit a photon on their own. They are <b>dark</b>. Pick the two spins and see which one you get. A small asymmetry of the dot shape mixes \(M = +1\) and \(-1\) through the electron–hole exchange interaction and splits them into two linearly polarized states, H and V. That splitting is the fine structure splitting.`,
eq: String.raw`\[ M = s_z + j_z, \quad s_z = \pm\tfrac{1}{2}, \quad j_z = \pm\tfrac{3}{2} \;\Longrightarrow\; M = \pm 1\ (\text{bright}),\ \pm 2\ (\text{dark}) \]\[ \lvert H \rangle = \frac{\lvert +1 \rangle + \lvert -1 \rangle}{\sqrt{2}}, \quad \lvert V \rangle = \frac{\lvert +1 \rangle - \lvert -1 \rangle}{i\sqrt{2}}, \quad E_H - E_V = \delta_1\ (\text{FSS}) \]`,
sym: [[String.raw`\(s_z\)`, String.raw`electron spin along \(z\), \(\pm\tfrac{1}{2}\)`], [String.raw`\(j_z\)`, String.raw`heavy-hole angular momentum along \(z\), \(\pm 3/2\)`], [String.raw`\(M\)`, String.raw`total angular momentum of the exciton along \(z\)`], [String.raw`\(\delta_1\)`, "fine structure splitting (FSS) between the H and V bright states"], [String.raw`\(H, V\)`, "two orthogonal linear polarizations in the plane"]],
how: [String.raw`Add the electron and hole angular momenta along \(z\): four combinations.`, String.raw`Opposite signs give \(\lvert M\rvert = 1\). Same signs give \(\lvert M\rvert = 2\).`, String.raw`A photon carries \(\pm 1\hbar\) along \(z\), so only \(\lvert M\rvert = 1\) can recombine by emitting one photon.`, "Electron–hole exchange in a slightly elongated dot couples +1 and −1. The new eigenstates are their sum and difference, which are linear polarizations."],
say: String.raw`Bright excitons have \(M = \pm 1\) and couple to light. Dark excitons have \(M = \pm 2\) and do not emit in the dipole approximation. Shape anisotropy gives a fine structure splitting between two linearly polarized bright states.`,
num: String.raw`4 spin combinations: <b>2 bright</b> (\(M = \pm 1\)) and <b>2 dark</b> (\(M = \pm 2\)).<br>FSS values in quantum dots range from below 1 µeV to over 100 µeV. GaAs droplet-etched dots are known for small FSS because they are nearly strain-free and fairly symmetric. Check the value for your group's dots before quoting one.`,
r(fig, ctl) {
  let e = -1, h = 3;
  ctl.innerHTML = `<div class="row"><label>Electron s_z</label><button data-e="1">↑ +½</button><button data-e="-1">↓ −½</button></div><div class="row"><label>Hole j_z</label><button data-h="3">⇑ +3/2</button><button data-h="-3">⇓ −3/2</button></div>`;
  const u = () => {
    pick(ctl, "e", e); pick(ctl, "h", h);
    const M = (e + h) / 2, bright = Math.abs(M) === 1;
    fig.innerHTML = svg(260, `<g class="c-gray"><rect x="200" y="40" width="280" height="150" rx="10" stroke-width="0.5"/></g><text class="ts" x="340" y="32" text-anchor="middle">one dot</text>
      ${EL(290, 90)}<text class="th" x="290" y="70" text-anchor="middle">${e > 0 ? "↑" : "↓"}</text><text class="ts" x="290" y="120" text-anchor="middle">electron ${e > 0 ? "+½" : "−½"}</text>
      ${HO(390, 140)}<text class="th" x="390" y="120" text-anchor="middle">${h > 0 ? "⇑" : "⇓"}</text><text class="ts" x="390" y="170" text-anchor="middle">hole ${h > 0 ? "+3/2" : "−3/2"}</text>
      <text class="th" x="340" y="222" text-anchor="middle">M = ${M > 0 ? "+" : ""}${M}: ${bright ? "BRIGHT, emits a photon" : "DARK, no photon"}</text>
      ${bright ? `<path d="M500 115 q8 -10 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#EF9F27" stroke-width="2.5" marker-end="url(#ar)"/><text class="ts" x="540" y="145" text-anchor="middle">${M > 0 ? "σ⁺" : "σ⁻"} photon, carries ${M > 0 ? "+1" : "−1"}</text>` : `<text class="ts" x="560" y="115" text-anchor="middle">a photon can carry</text><text class="ts" x="560" y="131" text-anchor="middle">only ±1, not ±2</text>`}`);
  };
  ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { e = +b.dataset.e; u(); });
  ctl.querySelectorAll("button[data-h]").forEach(b => b.onclick = () => { h = +b.dataset.h; u(); });
  u();
}},

{s: "4. Build a complex", t: "Build it yourself: X, X⁻, X⁺, XX",
intu: String.raw`Add and remove electrons and holes. The dot's lowest electron level and lowest hole level each hold at most two carriers, one of each spin (Pauli). When two electrons share the lowest level, their spins must be opposite, so together they have zero spin. The same holds for two holes. That is why the negative trion \(\mathrm{X}^{-}\) (two electrons, one hole) carries the angular momentum of its single hole, \(\Uparrow\) or \(\Downarrow\). This is exactly how your Fig. 1.1 labels the excited states: \(\lvert \uparrow\downarrow, \Uparrow \rangle\) and \(\lvert \uparrow\downarrow, \Downarrow \rangle\). And the ground states of Fig. 1.1 are just one electron, \(\lvert \uparrow \rangle\) or \(\lvert \downarrow \rangle\). Try: one electron, then add an electron and a hole.`,
eq: String.raw`\[ \mathrm{X} = 1e + 1h \qquad \mathrm{X}^{-} = 2e + 1h \]\[ \mathrm{X}^{+} = 1e + 2h \qquad \mathrm{XX} = 2e + 2h \]\[ \text{two carriers in one level: spins opposite (Pauli)} \;\Longrightarrow\; \text{total spin } 0 \]\[ \mathrm{X}^{-} \text{ angular momentum} = \text{hole's } j_z = \pm 3/2 \]`,
sym: [[String.raw`\(e, h\)`, "electron, hole in the dot's lowest (s-shell) level"], [String.raw`\(\mathrm{X}^{-}\)`, "negative trion: excited state of a dot that already holds one electron"], [String.raw`\(\mathrm{X}^{+}\)`, "positive trion: excited state of a dot holding one hole"], [String.raw`\(\mathrm{XX}\)`, "biexciton, all carriers paired, total angular momentum 0"], [String.raw`\(\lvert \uparrow\downarrow, \Uparrow \rangle\)`, String.raw`Fig. 1.1 notation: paired electrons plus a hole with spin \(\Uparrow\)`]],
how: ["The lowest level of each carrier type has two spin states, so it holds at most two carriers (Pauli exclusion).", "Two electrons in the same orbital form a singlet: spins opposite, total 0.", String.raw`So in \(\mathrm{X}^{-}\) the electrons contribute nothing to the angular momentum. Only the hole's \(\pm 3/2\) remains.`, String.raw`Because the electrons are paired, the electron–hole exchange cancels. \(\mathrm{X}^{-}\) has no fine structure splitting at zero field. Its two states are a degenerate pair until a magnetic field splits them (Lesson 5).`],
say: "Fig. 1.1 describes a negatively charged dot. Its ground states are a single electron spin, and its optically excited states are negative trions, whose spin is carried by the hole because the two electrons are paired.",
num: String.raw`Lines from the same dot are separated by Coulomb energies of a few meV, so X, \(\mathrm{X}^{-}\), \(\mathrm{X}^{+}\) and XX appear as separate lines in a spectrum.<br>Which charge states appear depends on doping and electric field. Fig. 1.1 assumes the dot holds one extra electron.`,
r(fig, ctl) {
  let ne = 1, nh = 0;
  ctl.innerHTML = `<div class="row"><label>Electrons</label><button id="em">−</button><button id="ep">+</button></div><div class="row"><label>Holes</label><button id="hm">−</button><button id="hp">+</button></div>`;
  const names = { "0,0": ["empty dot", ""], "1,0": ["one electron", "ground state |↑⟩ or |↓⟩ in Fig. 1.1"], "0,1": ["one hole", "charged dot, no light"], "1,1": ["neutral exciton X", "bright or dark (card 3)"], "2,1": ["negative trion X⁻", "excited state |↑↓, ⇑⟩ in Fig. 1.1"], "1,2": ["positive trion X⁺", "spin carried by the electron"], "2,2": ["biexciton XX", "everything paired, total 0"], "2,0": ["two electrons", "paired, no light"], "0,2": ["two holes", "paired, no light"] };
  const u = () => {
    const [n, d] = names[ne + "," + nh];
    const eS = ne === 2 ? ["↑", "↓"] : ne === 1 ? ["↑"] : [], hS = nh === 2 ? ["⇑", "⇓"] : nh === 1 ? ["⇑"] : [];
    let c = "";
    eS.forEach((s, i) => c += EL(310 + i * 60, 95) + `<text class="th" x="${310 + i * 60}" y="75" text-anchor="middle">${s}</text>`);
    hS.forEach((s, i) => c += HO(310 + i * 60, 205) + `<text class="th" x="${310 + i * 60}" y="235" text-anchor="middle">${s}</text>`);
    fig.innerHTML = svg(290, `<path d="M90 50 H230 V120 H450 V50 H590" fill="none" stroke="var(--p)" stroke-width="1.5"/><path d="M90 250 H230 V180 H450 V250 H590" fill="none" stroke="var(--p)" stroke-width="1.5"/><line x1="236" x2="444" y1="104" y2="104" stroke="#378ADD" stroke-width="2"/><line x1="236" x2="444" y1="196" y2="196" stroke="#D85A30" stroke-width="2"/><text class="ts" x="95" y="104">electron level (2 seats)</text><text class="ts" x="95" y="196">hole level (2 seats)</text><text class="ts" x="590" y="42" text-anchor="end">E_c (conduction band edge)</text><text class="ts" x="590" y="266" text-anchor="end">E_v (valence band edge)</text><text class="ts" x="160" y="42" text-anchor="middle">AlGaAs</text><text class="ts" x="340" y="140" text-anchor="middle">GaAs dot</text>${c}<text class="th" x="340" y="268" text-anchor="middle">${n}</text><text class="ts" x="340" y="286" text-anchor="middle">${d}</text>`);
    $("em").disabled = ne === 0; $("ep").disabled = ne === 2; $("hm").disabled = nh === 0; $("hp").disabled = nh === 2;
  };
  $("em").onclick = () => { ne--; u(); }; $("ep").onclick = () => { ne++; u(); }; $("hm").onclick = () => { nh--; u(); }; $("hp").onclick = () => { nh++; u(); };
  u();
}},

{s: "5. Biexciton cascade", t: "The biexciton cascade: two photons in a row",
intu: String.raw`A biexciton XX holds two electrons and two holes. It decays in two steps. First one electron–hole pair recombines and emits the XX photon, leaving a single exciton X behind. Then X recombines and emits the X photon, leaving an empty dot. The two photons have different energies, because the first pair also felt the attraction of the other pair. The difference is the biexciton binding energy \(\Delta_{\mathrm{XX}}\). Step through the cascade and change \(\Delta_{\mathrm{XX}}\) to see the XX line move relative to X.`,
eq: String.raw`\[ E(\mathrm{XX}) = 2E(\mathrm{X}) - \Delta_{\mathrm{XX}} \]\[ \hbar\omega_{\mathrm{XX}} = E(\mathrm{XX}) - E(\mathrm{X}) = E(\mathrm{X}) - \Delta_{\mathrm{XX}} \qquad \hbar\omega_{\mathrm{X}} = E(\mathrm{X}) \]`,
sym: [[String.raw`\(E(\mathrm{X}), E(\mathrm{XX})\)`, "total energies of the exciton and biexciton states, measured from the empty dot"], [String.raw`\(\Delta_{\mathrm{XX}}\)`, "biexciton binding energy. Positive means XX is bound and its line is red-shifted from X"], [String.raw`\(\hbar\omega_{\mathrm{XX}}, \hbar\omega_{\mathrm{X}}\)`, "energies of the first and second photon"]],
how: [String.raw`If the two pairs did not interact, \(E(\mathrm{XX})\) would be exactly \(2E(\mathrm{X})\).`, String.raw`Coulomb interactions between the pairs change this by \(\Delta_{\mathrm{XX}}\).`, String.raw`Energy conservation for the first step: \(\hbar\omega_{\mathrm{XX}} = E(\mathrm{XX}) - E(\mathrm{X})\).`, String.raw`Substituting gives \(\hbar\omega_{\mathrm{XX}} = E(\mathrm{X}) - \Delta_{\mathrm{XX}}\). The X line itself is at \(E(\mathrm{X})\).`],
say: "The biexciton decays through the exciton in a two-photon cascade. The XX line is shifted from the X line by the biexciton binding energy, typically a few meV, with sign and size depending on the dot.",
num: String.raw`Typical \(\lvert\Delta_{\mathrm{XX}}\rvert\) in quantum dots: <b>a few meV</b>.<br>If the X fine structure splitting is close to zero, the two cascade paths (H H and V V) cannot be told apart, and the photon pair is polarization entangled. That is a major reason GaAs droplet-etched dots are studied, but it is not part of your thesis.`,
r(fig, ctl) {
  let st = 0;
  ctl.innerHTML = `<div class="row"><button id="bb">Back</button><button id="bn">Next step</button><span class="note" id="stt"></span></div>` + sl("dx", "Δ_XX", -3, 5, 0.1, 2.5);
  const S = ["start: biexciton XX", "XX photon emitted, dot now holds X", "X photon emitted, dot is empty"];
  const u = () => {
    const d = +$("dx").value; $("dxv").textContent = d.toFixed(1) + " meV"; $("stt").textContent = S[st];
    const yXX = 40, yX = 150, y0 = 250;
    const tag = (y, on) => on ? `<circle cx="150" cy="${y}" r="9" fill="#EF9F27" stroke="#854F0B"/>` : "";
    const wave = (x, y, lab) => `<path d="M${x} ${y} q8 -10 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#EF9F27" stroke-width="2.5" marker-end="url(#ar)"/><text class="ts" x="${x+34}" y="${y+22}" text-anchor="middle">${lab}</text>`;
    const cx = 470, sc = 22, base = 600;
    fig.innerHTML = svg(290, `${lvl(90, 230, yXX, "XX", "r")}${lvl(90, 230, yX, "X", "r")}${lvl(90, 230, y0, "empty", "r")}${tag(yXX, st === 0)}${tag(yX, st === 1)}${tag(y0, st === 2)}
      <line x1="180" y1="${yXX+5}" x2="180" y2="${yX-5}" stroke="${st>=1?"#D85A30":"var(--b)"}" stroke-width="2" marker-end="url(#ar)"/><line x1="180" y1="${yX+5}" x2="180" y2="${y0-5}" stroke="${st>=2?"#378ADD":"var(--b)"}" stroke-width="2" marker-end="url(#ar)"/>
      ${st >= 1 ? wave(196, 98, "ħω_XX") : ""}${st >= 2 ? wave(196, 205, "ħω_X") : ""}
      <text class="th" x="${cx}" y="40" text-anchor="middle">spectrum (energy →)</text><line x1="${cx-150}" x2="${cx+150}" y1="220" y2="220" stroke="var(--p)"/>
      <line x1="${cx+40}" x2="${cx+40}" y1="220" y2="120" stroke="#378ADD" stroke-width="4"/><text class="ts" x="${cx+40}" y="112" text-anchor="middle">X</text>
      <line x1="${cx+40-d*sc}" x2="${cx+40-d*sc}" y1="220" y2="150" stroke="#D85A30" stroke-width="4"/><text class="ts" x="${cx+40-d*sc}" y="142" text-anchor="middle">XX</text>
      <line x1="${cx+40}" x2="${cx+40-d*sc}" y1="245" y2="245" stroke="var(--t)" stroke-width="1" ${Math.abs(d)>0.2?'marker-start="url(#ar)" marker-end="url(#ar)"':""}/><text class="ts" x="${cx+40-d*sc/2}" y="262" text-anchor="middle">Δ_XX</text><text class="ts" x="${cx}" y="284" text-anchor="middle">line heights not to scale</text>`);
    $("bb").disabled = st === 0; $("bn").disabled = st === 2;
  };
  $("bb").onclick = () => { st--; u(); }; $("bn").onclick = () => { st++; u(); }; $("dx").oninput = u; u();
}},

{s: "6. Power test", t: "Telling the lines apart: the power test",
intu: String.raw`A real spectrum shows several lines and you need to know which is which. The classic test is to change the laser power. The laser creates electron–hole pairs at random, so the average number in the dot, \(n\), grows in proportion to the power \(P\). Having one pair (X) is likely once \(n\) is not tiny, but having two pairs at once (XX) needs two random events, so at low power its probability grows as \(n^2\). On a log–log plot of intensity against power, X has slope 1 and XX has slope 2. At high power both saturate and then fall, because the dot is more likely to hold even more carriers. Drag the power and watch both the spectrum and the log–log plot.`,
eq: String.raw`\[ P(N = 1) = n\, e^{-n}, \qquad P(N = 2) = \frac{n^2}{2}\, e^{-n}, \qquad n \propto \text{laser power} \]<div class="eqnote">low power</div>\[ I_{\mathrm{X}} \propto P^1, \qquad I_{\mathrm{XX}} \propto P^2 \]`,
sym: [[String.raw`\(n\)`, "average number of electron–hole pairs captured per cycle, proportional to laser power"], [String.raw`\(N\)`, "actual number of pairs in the dot at a given moment"], [String.raw`\(P(N)\)`, String.raw`Poisson probability of \(N\) pairs`], [String.raw`\(I_{\mathrm{X}}, I_{\mathrm{XX}}\)`, "intensity of the exciton and biexciton lines"]],
how: [String.raw`Pairs are captured at random and independently, so the number in the dot follows Poisson statistics with mean \(n\).`, String.raw`The X line needs exactly one pair: \(n\,e^{-n}\), which is \(\approx n\) for small \(n\).`, String.raw`The XX line needs two: \(n^2/2\; e^{-n}\), which is \(\approx n^2/2\) for small \(n\).`, String.raw`Taking logs, \(\log I = \text{slope} \times \log P\) with slope 1 for X and 2 for XX.`],
say: "Excitons and biexcitons are identified by their power dependence: linear for X and quadratic for XX at low excitation, in a simple random population model. Charged complexes are identified with polarization and magnetic field measurements, not power alone.",
num: String.raw`Peak of \(I_{\mathrm{X}}\) at \(n =\) <b>1</b>. Peak of \(I_{\mathrm{XX}}\) at \(n =\) <b>2</b>.<br>At \(n = 0.1\): \(I_{\mathrm{XX}}/I_{\mathrm{X}} = n/2 =\) <b>0.05</b>. At \(n = 1\): <b>0.5</b>.<br>Line positions in the plot are illustrative, not from your dots.`,
r(fig, ctl) {
  ctl.innerHTML = sl("p", "Laser power (mean pairs n)", -2, 1, 0.02, -0.7) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const lg = +$("p").value, n = Math.pow(10, lg); $("pv").textContent = "n = " + n.toFixed(n < 0.1 ? 3 : 2);
    const IX = n * Math.exp(-n), IXX = n * n / 2 * Math.exp(-n);
    const spx = 40, spw = 280, base = 240, H = 160, sc = H / 0.37;
    const peak = (c, A, col) => { let d = ""; for (let i = 0; i <= 120; i++) { const x = spx + i * spw / 120, e = (i / 120) * 10 - 5; const y = base - A * sc * Math.exp(-Math.pow((e - c) / 0.25, 2)); d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2"/>`; };
    const lx = v => 380 + (v + 2) / 3 * 270, ly = v => 240 - (Math.log10(v) + 5) / 5 * 190;
    const xs = range(-2, 1, 60), pX = xs.map(v => { const m = Math.pow(10, v); return m * Math.exp(-m); }), pXX = xs.map(v => { const m = Math.pow(10, v); return m * m / 2 * Math.exp(-m); });
    const pp = (arr, col) => { let d = ""; arr.forEach((v, i) => { if (v < 1e-5) return; d += (d ? "L" : "M") + lx(xs[i]).toFixed(1) + " " + ly(v).toFixed(1); }); return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2"/>`; };
    fig.innerHTML = svg(280, `<text class="th" x="${spx+spw/2}" y="30" text-anchor="middle">spectrum</text><line x1="${spx}" x2="${spx+spw}" y1="${base}" y2="${base}" stroke="var(--p)"/>${peak(1.5, IX, "#378ADD")}${peak(-1.5, IXX, "#D85A30")}<text class="ts" x="${spx+spw*0.65}" y="${base+18}" text-anchor="middle">X</text><text class="ts" x="${spx+spw*0.35}" y="${base+18}" text-anchor="middle">XX</text><text class="ts" x="${spx+spw/2}" y="${base+36}" text-anchor="middle">energy (illustrative positions)</text>
      <text class="th" x="515" y="30" text-anchor="middle">intensity vs power, log–log</text><line x1="380" x2="650" y1="240" y2="240" stroke="var(--p)"/><line x1="380" x2="380" y1="50" y2="240" stroke="var(--p)"/>${pp(pX, "#378ADD")}${pp(pXX, "#D85A30")}<line x1="${lx(lg)}" x2="${lx(lg)}" y1="50" y2="240" stroke="#EF9F27" stroke-width="1.5"/><text class="ts" x="${lx(-1.6)}" y="${ly(0.03)-6}">slope 1 (X)</text><text class="ts" x="${lx(-1.1)}" y="${ly(0.0006)}">slope 2 (XX)</text><text class="ts" x="515" y="258" text-anchor="middle">power (log)</text>`);
    $("ro").innerHTML = `<div><span>I_X (relative)</span><b>${IX.toFixed(3)}</b></div><div><span>I_XX (relative)</span><b>${IXX.toFixed(3)}</b></div><div><span>I_XX / I_X</span><b>${(IXX / IX).toFixed(3)}</b></div>`;
  };
  $("p").oninput = u; u();
}}
],
summary: String.raw`An electron and a hole attract and form an exciton, a hydrogen-like state bound by only a few meV in bulk GaAs because of screening and light masses. In a small dot, confinement dominates and Coulomb becomes a correction. With a heavy hole, the exciton has \(M = \pm 1\) bright and \(\pm 2\) dark states. Adding a second electron gives the negative trion \(\mathrm{X}^{-}\), whose two electrons pair to zero spin, so its spin is the hole's \(\pm 3/2\). That is the excited state \(\lvert \uparrow\downarrow, \Uparrow \rangle\) in Fig. 1.1, and the single electron is the ground state. A biexciton decays in a two-photon cascade, and lines are identified by power dependence, linear for X and quadratic for XX.`,
sheet: [
[String.raw`\[ E_{\mathrm{X}} = \mathrm{Ry}\,\frac{\mu/m_0}{\varepsilon_r^2}, \quad a_{\mathrm{X}} = a_{\mathrm{B}}\,\frac{\varepsilon_r}{\mu/m_0} \]`, "Hydrogen model of the exciton"],
[String.raw`\[ E_{\mathrm{conf}} \propto \frac{1}{L^2}, \quad E_{\mathrm{C}} \propto \frac{1}{L} \]`, String.raw`Strong (\(L \ll a_{\mathrm{X}}\)) versus weak (\(L \gg a_{\mathrm{X}}\)) confinement`],
[String.raw`\[ M = s_z + j_z = \pm 1\ \text{bright},\ \pm 2\ \text{dark} \]`, "Exciton spin states"],
[String.raw`\[ \lvert H \rangle, \lvert V \rangle = \frac{\lvert +1 \rangle \pm \lvert -1 \rangle}{\sqrt{2}}\ (\text{up to phase}), \quad \delta_1 = E_H - E_V \]`, "Fine structure splitting"],
[String.raw`\[ \mathrm{X}^{-} = \lvert \uparrow\downarrow, \Uparrow \rangle \ \text{or}\ \lvert \uparrow\downarrow, \Downarrow \rangle \]`, "Negative trion: paired electrons, spin from the hole"],
[String.raw`\[ \hbar\omega_{\mathrm{XX}} = E(\mathrm{X}) - \Delta_{\mathrm{XX}} \]`, "Biexciton line"],
[String.raw`\[ P(N) = \frac{n^N e^{-n}}{N!}, \quad I_{\mathrm{X}} \propto P, \quad I_{\mathrm{XX}} \propto P^2\ (\text{low power}) \]`, "Power test"]],
consts: String.raw`\(\mathrm{Ry} = 13.606\,\mathrm{eV}\), \(a_{\mathrm{B}} = 0.0529\,\mathrm{nm}\), \(e^2/4\pi\varepsilon_0 = 1.44\,\mathrm{eV\cdot nm}\), \(\varepsilon_r(\mathrm{GaAs}) \approx 12.9\)`,
sources: ["M. Fox, Optical Properties of Solids, 2nd ed., Oxford (2010), Ch. 4 (excitons) and Ch. 6 (quantum dots)", "Warburton, Nature Materials 12, 483 (2013) (thesis ref., trion level scheme)", "Chuang, Physics of Photonic Devices, 2nd ed., Ch. 14 (excitons)"]
});
