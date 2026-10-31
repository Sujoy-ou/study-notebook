(function () {
/* Part 1 Lesson 4: directional couplers and coupled mode theory. Power transfer computed live with PIC.dcTransfer. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const LAM = 1.55;
/* model of the supermode splitting for two 450 x 220 nm silicon strips: dn = dn0 exp(-g/g0), calibrated so that
   a 200 nm gap gives a coupling length near 15 um (dn about 0.05) */
const G0 = 0.240, DN0 = 0.05 * Math.exp(0.2 / G0);
const dn = g => DN0 * Math.exp(-g / G0);           // g in um
const kappa = g => Math.PI * dn(g) / LAM;          // rad/um
const Lc = g => LAM / (2 * dn(g));                 // um

addLesson("pic", "basics", {
level: "Core",
id: "pic-basics-l4", title: "Directional couplers and coupled mode theory", short: "4. Directional couplers",
big: String.raw`Bring two waveguides close together and light leaks from one to the other through the evanescent tails. Keep them parallel long enough and all of the light crosses over, then crosses back. The directional coupler is the simplest device built on this, and it is everywhere: splitters, ring couplings, interferometer arms, switches. There are two equal ways to understand it. In the supermode picture the pair of guides has an even and an odd mode with slightly different indices, and their beating moves the power back and forth. In the coupled mode picture each guide keeps its own mode and a coupling coefficient transfers amplitude between them. This lesson shows both, animates the power swap, and ends with the design of a 3 dB coupler.`,
bridge: String.raw`Coupled mode theory in the form used here is Yariv's (IEEE J. Quantum Electron. 1973) and Huang's review (J. Opt. Soc. Am. A 1994). The supermode splitting for two silicon strips is modelled as an exponential in the gap and calibrated to typical coupling lengths. In the Tidy3D lessons you compute the two supermode indices directly with the mode solver and get the coupling length from them.`,
cards: [

{s: "1. Supermodes", t: "Two guides, two supermodes: even and odd",
intu: String.raw`Put two identical guides side by side and solve for the modes of the pair. You get an even mode, with the fields in phase, and an odd mode, with opposite signs. The even mode sees a little more high index material between the guides, so its effective index is slightly higher. Drag the gap. Far apart the two indices are equal and the guides ignore each other. Close together they split, and the split is what drives the coupling.`,
eq: String.raw`\[ n_{\mathrm{even}} \gt n_{\mathrm{odd}}, \qquad \Delta n = n_{\mathrm{even}} - n_{\mathrm{odd}} \approx \Delta n_0\, e^{-g/g_0} \]<div class="eqnote">the exponential in the gap is a model of the evanescent overlap</div>`,
sym: [[String.raw`\(n_{\mathrm{even}}, n_{\mathrm{odd}}\)`, "effective indices of the symmetric and antisymmetric supermodes"], [String.raw`\(g\)`, "gap between the guides"], [String.raw`\(g_0\)`, "decay length of the evanescent field, about 0.24 µm for silicon strips at 1550 nm"], [String.raw`\(\Delta n_0\)`, "splitting extrapolated to zero gap"]],
how: ["The coupled pair is itself a waveguide with its own modes, found by the same solver as any other cross-section.", "Symmetry splits them into even and odd families.", "The field in the gap is the tail of each guide's mode, which decays exponentially, so the splitting does too."],
say: String.raw`A pair of guides has an even and an odd supermode, and their index splitting decays exponentially with the gap.`,
num: "Two 450 by 220 nm silicon strips at 1550 nm: gap 200 nm gives a splitting near 0.05, gap 300 nm near 0.03, gap 500 nm near 0.01. Nitride guides need gaps of 1 µm or more for the same coupling.",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Gap (nm)", 100, 700, 10, 200);
  const u = () => {
    const g = +$("g").value / 1000; $("gv").textContent = (g * 1000).toFixed(0) + " nm"; const d = dn(g);
    const xs = range(-2, 2, 241); const prof = (sgn) => xs.map(x => Math.exp(-Math.pow((x + 0.225 + g / 2) / 0.35, 2)) + sgn * Math.exp(-Math.pow((x - 0.225 - g / 2) / 0.35, 2)));
    const x0 = 60, w = 260, h = 90;
    let s = tx(340, 20, `gap ${(g * 1000).toFixed(0)} nm: Δn ≈ ${d.toFixed(4)} (model)`, "middle", "th");
    [["even supermode", 1, PB, 40], ["odd supermode", -1, PC, 160]].forEach(([lab, sgn, col, y0]) => {
      s += tx(x0, y0 - 6, lab) + `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/>`;
      const gw = x => x0 + (x + 2) / 4 * w; s += `<rect x="${gw(-0.45 - g / 2)}" y="${y0 + 30}" width="${0.45 / 4 * w}" height="30" fill="${PB}" opacity="0.35"/><rect x="${gw(g / 2)}" y="${y0 + 30}" width="${0.45 / 4 * w}" height="30" fill="${PB}" opacity="0.35"/>`;
      s += plot(x0, y0, w, h, xs, prof(sgn), -2, 2, -1.2, 1.2, col, 2);
    });
    // index ladder
    const lx = 420, ly = 60, lh = 180; s += `<line x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly + lh}" stroke="var(--p)"/>` + tx(lx, ly - 10, "effective index", "middle");
    const n0 = 2.4; const Y = n => ly + lh - (n - 2.3) / 0.2 * lh;
    s += `<line x1="${lx - 30}" x2="${lx + 30}" y1="${Y(n0 + d / 2)}" y2="${Y(n0 + d / 2)}" stroke="${PB}" stroke-width="3"/>` + tx(lx + 36, Y(n0 + d / 2) + 4, `even ${(n0 + d / 2).toFixed(4)}`) + `<line x1="${lx - 30}" x2="${lx + 30}" y1="${Y(n0 - d / 2)}" y2="${Y(n0 - d / 2)}" stroke="${PC}" stroke-width="3"/>` + tx(lx + 36, Y(n0 - d / 2) + 4, `odd ${(n0 - d / 2).toFixed(4)}`) + `<line x1="${lx - 40}" x2="${lx + 40}" y1="${Y(n0)}" y2="${Y(n0)}" stroke="var(--b)" stroke-dasharray="3 3"/>` + tx(lx - 46, Y(n0) + 4, "single guide", "end");
    fig.innerHTML = svg(270, s);
  };
  $("g").oninput = u; u();
}},

{s: "2. Beating", t: "Beating: the power swaps between the guides",
intu: String.raw`Launch light into one guide. That excites the even and odd supermodes equally. Because they travel with different indices, their phases drift apart. Where they are in phase the light sits in the first guide, where they are opposite it sits in the second. The swap repeats with a period set by the index difference. Press Play and watch the light hop from guide to guide. Shorten the gap and the hop gets faster.`,
eq: String.raw`\[ P_2(z) = \sin^2(\kappa z), \quad P_1(z) = \cos^2(\kappa z), \qquad \kappa = \frac{\pi\,\Delta n}{\lambda} \]`,
sym: [[String.raw`\(P_1, P_2\)`, "power in the launch guide and the other guide, normalized"], [String.raw`\(\kappa\)`, "coupling coefficient, radians per micrometre"], [String.raw`\(z\)`, "distance along the coupler"]],
how: [String.raw`Field in guide 1 is the sum of the two supermodes: \(e^{i\beta_e z} + e^{i\beta_o z}\). In guide 2 it is their difference.`, String.raw`Factor out the average phase. What is left is \(2\cos(\Delta\beta z/2)\) in guide 1 and \(2i\sin(\Delta\beta z/2)\) in guide 2.`, String.raw`Square for power. With \(\Delta\beta = 2\pi\Delta n/\lambda\) the half difference is \(\kappa\).`],
say: String.raw`Power in the second guide grows as sine squared of kappa z, with kappa equal to pi times the supermode splitting over the wavelength.`,
num: "Gap 200 nm: κ ≈ 0.10 rad/µm, full transfer after 15 µm. Gap 300 nm: κ ≈ 0.066, 24 µm. Gap 400 nm: 36 µm.",
r(fig, ctl) {
  ctl.innerHTML = sl("g2", "Gap (nm)", 100, 500, 10, 200);
  PIC.player(ctl, (tsec) => {
    const g = +$("g2").value / 1000; $("g2v").textContent = (g * 1000).toFixed(0) + " nm"; const k = kappa(g), L = 60;
    const x0 = 40, w = 600, y1 = 60, y2 = 130;
    let s = tx(340, 20, `κ = ${k.toFixed(3)} rad/µm, coupling length ${Lc(g).toFixed(1)} µm`, "middle", "th");
    s += `<rect x="${x0}" y="${y1 - 8}" width="${w}" height="16" fill="${PB}" opacity="0.25"/><rect x="${x0}" y="${y2 - 8}" width="${w}" height="16" fill="${PB}" opacity="0.25"/>` + tx(x0, y1 - 14, "guide 1 (launch)") + tx(x0, y2 + 26, "guide 2");
    for (let i = 0; i < 60; i++) { const z = L * i / 60; const p1 = Math.pow(Math.cos(k * z), 2); const x = x0 + w * i / 60; s += `<rect x="${x}" y="${y1 - 8}" width="${w / 60 + 0.5}" height="16" fill="${PC}" opacity="${(0.85 * p1).toFixed(2)}"/><rect x="${x}" y="${y2 - 8}" width="${w / 60 + 0.5}" height="16" fill="${PC}" opacity="${(0.85 * (1 - p1)).toFixed(2)}"/>`; }
    for (let kk = 0; kk < 6; kk++) { const ph = (tsec * 0.25 + kk / 6) % 1; const z = ph * L; const p1 = Math.pow(Math.cos(k * z), 2); const x = x0 + ph * w; s += `<circle cx="${x.toFixed(1)}" cy="${y1}" r="${(2 + 5 * p1).toFixed(1)}" fill="${PA}"/><circle cx="${x.toFixed(1)}" cy="${y2}" r="${(2 + 5 * (1 - p1)).toFixed(1)}" fill="${PA}"/>`; }
    // curve
    const py = 175, ph2 = 90; const zs = range(0, L, 121);
    s += C3.frame(x0 + 20, py, w - 20, ph2, 0, L, 0, 1, [0, 15, 30, 45, 60], [0, 0.5, 1], "z (µm)", "power", v => v, v => v.toFixed(1));
    s += plot(x0 + 20, py, w - 20, ph2, zs, zs.map(z => Math.pow(Math.cos(k * z), 2)), 0, L, 0, 1, PB, 2) + plot(x0 + 20, py, w - 20, ph2, zs, zs.map(z => Math.pow(Math.sin(k * z), 2)), 0, L, 0, 1, PC, 2);
    s += C3.legend(x0 + 30, py + 14, [["P₁", PB], ["P₂", PC]]);
    fig.innerHTML = svg(py + ph2 + 40, s);
  });
}},

{s: "3. Coupling length", t: "The coupling length: where all the light has crossed",
intu: String.raw`The distance for full transfer is the coupling length. It is a quarter of a beat of the two supermodes, so it is simply the wavelength divided by twice the index splitting. A splitting of 0.05 at 1550 nm gives 15.5 µm. Drag the gap and read the length. This is the number you get from a mode solver in two runs: solve the pair once, read the two indices, done.`,
eq: String.raw`\[ L_c = \frac{\pi}{2\kappa} = \frac{\lambda}{2\,(n_{\mathrm{even}} - n_{\mathrm{odd}})} \]`,
sym: [[String.raw`\(L_c\)`, "coupling length for 100 percent transfer"], [String.raw`\(\kappa\)`, "coupling coefficient"], [String.raw`\(n_{\mathrm{even}} - n_{\mathrm{odd}}\)`, "supermode splitting from a mode solver"]],
how: [String.raw`Full transfer when \(\sin^2(\kappa L) = 1\), so \(\kappa L_c = \pi/2\).`, String.raw`Substitute \(\kappa = \pi \Delta n/\lambda\).`, "Any fraction is available by stopping earlier. Half the power crosses at half the coupling length."],
say: String.raw`The coupling length is the wavelength over twice the supermode splitting, the distance for the light to cross completely.`,
num: "Δn 0.05: Lc 15.5 µm. Δn 0.02: 39 µm. Δn 0.005: 155 µm. The Tidy3D mode solver gives both indices in one call with <code>num_modes=2</code>.",
r(fig, ctl) {
  ctl.innerHTML = sl("g3", "Gap (nm)", 100, 700, 10, 250);
  const u = () => {
    const g = +$("g3").value / 1000; $("g3v").textContent = (g * 1000).toFixed(0) + " nm";
    const gs = range(0.1, 0.7, 61); const x0 = 60, w = 540, y0 = 36, h = 170;
    let s = C3.frame(x0, y0, w, h, 100, 700, 0, 2.5, [100, 300, 500, 700], [0, 0.5, 1, 1.5, 2, 2.5], "gap (nm)", "log10 coupling length (µm)", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, gs.map(v => v * 1000), gs.map(v => Math.log10(Lc(v))), 100, 700, 0, 2.5, PB, 2.5);
    s += `<circle cx="${C3.X(x0, w, 100, 700)(g * 1000)}" cy="${C3.Y(y0, h, 0, 2.5)(Math.log10(Lc(g)))}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `gap ${(g * 1000).toFixed(0)} nm: Δn = ${dn(g).toFixed(4)}, Lc = ${Lc(g).toFixed(1)} µm`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("g3").oninput = u; u();
}},

{s: "4. Detuning", t: "Unequal guides: detuning caps the transfer",
intu: String.raw`If the two guides are not identical, their propagation constants differ by a detuning. Then the light can never fully cross. The maximum transfer drops and the beat gets faster. Drag the width mismatch. This is both a nuisance, because fabrication always leaves a small mismatch, and a tool, because a deliberately detuned coupler is a wavelength or polarization filter.`,
eq: String.raw`\[ P_2(z) = \frac{\kappa^2}{\kappa^2 + \delta^2}\, \sin^2\!\left(\sqrt{\kappa^2 + \delta^2}\; z\right), \qquad \delta = \frac{\beta_1 - \beta_2}{2} \]`,
sym: [[String.raw`\(\delta\)`, "half the difference of the two propagation constants"], [String.raw`\(\beta_{1,2} = 2\pi n_{\mathrm{eff},1,2}/\lambda\)`, "propagation constants of the two isolated guides"], [String.raw`\(\kappa^2/(\kappa^2+\delta^2)\)`, "maximum power that can cross"]],
how: ["Write coupled mode equations for the two amplitudes with a coupling term and a phase mismatch term.", "Solve the two by two system. The eigenvalues split by the root of kappa squared plus delta squared.", "The prefactor is the mismatch penalty, the argument is the faster beat."],
say: String.raw`With a detuning delta the maximum transfer is kappa squared over kappa squared plus delta squared, and the beat is faster.`,
num: "κ = 0.1 rad/µm, width mismatch 10 nm in a 450 nm guide: δ about 0.04 rad/µm, maximum transfer 86 percent. Mismatch 30 nm: δ about 0.12, maximum 41 percent.",
r(fig, ctl) {
  ctl.innerHTML = sl("dw", "Width mismatch (nm)", 0, 40, 1, 10) + sl("g4", "Gap (nm)", 100, 400, 10, 200);
  const u = () => {
    const dw = +$("dw").value, g = +$("g4").value / 1000; $("dwv").textContent = dw + " nm"; $("g4v").textContent = (g * 1000).toFixed(0) + " nm";
    const k = kappa(g), d = dw * 0.004; const L = 60, zs = range(0, L, 181);
    const x0 = 60, w = 540, y0 = 36, h = 170;
    let s = C3.frame(x0, y0, w, h, 0, L, 0, 1, [0, 15, 30, 45, 60], [0, 0.5, 1], "z (µm)", "P₂", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, zs, zs.map(z => PIC.dcTransfer(k, 0, z)), 0, L, 0, 1, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, zs, zs.map(z => PIC.dcTransfer(k, d, z)), 0, L, 0, 1, PC, 2.5);
    const mx = k * k / (k * k + d * d); s += `<line x1="${x0}" x2="${x0 + w}" y1="${C3.Y(y0, h, 0, 1)(mx)}" y2="${C3.Y(y0, h, 0, 1)(mx)}" stroke="${PC}" stroke-dasharray="2 3"/>` + tx(x0 + w - 4, C3.Y(y0, h, 0, 1)(mx) - 5, `max ${(100 * mx).toFixed(0)} %`, "end");
    s += C3.legend(x0 + 10, y0 + 16, [["identical guides", "var(--b)", "4 3"], ["detuned", PC]]);
    s += tx(340, 20, `δ = ${d.toFixed(3)} rad/µm, κ = ${k.toFixed(3)} rad/µm`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("dw").oninput = u; $("g4").oninput = u; u();
}},

{s: "5. κ versus gap", t: "Coupling decays exponentially with the gap",
intu: String.raw`The coupling strength is the overlap of one guide's evanescent tail with the other guide's core. The tail decays exponentially, so the coupling does too, with the decay constant of the mode in the cladding. On a logarithmic plot the curve is a straight line. Drag the slider to see how an 80 nm change in gap, about one lithography tolerance, changes the coupling by a factor of about 1.4. Play sweeps the gap and draws the tails.`,
eq: String.raw`\[ \kappa(g) \approx \kappa_0\, e^{-\gamma g}, \qquad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2} \]`,
sym: [[String.raw`\(\gamma\)`, "decay constant of the evanescent field, about 4 per µm for silicon strips at 1550 nm"], [String.raw`\(\kappa_0\)`, "coupling extrapolated to zero gap"]],
how: ["The coupling coefficient is an overlap integral of mode 1 with the index perturbation that is guide 2.", "Mode 1 in the gap goes as exp of minus gamma times distance.", "The integral over guide 2 inherits that exponential in the gap."],
say: String.raw`The coupling coefficient falls exponentially with the gap, with the decay constant of the evanescent field.`,
num: "Silicon strip: γ ≈ 4.2 per µm, so each 165 nm of gap halves the coupling. Nitride: γ ≈ 1.3 per µm, each 530 nm halves it, which is why nitride couplers are long and tolerant.",
r(fig, ctl) {
  ctl.innerHTML = sl("g5", "Gap (nm)", 100, 700, 10, 250);
  PIC.player(ctl, (tsec) => {
    const g = +$("g5").value / 1000; $("g5v").textContent = (g * 1000).toFixed(0) + " nm";
    const gs = range(0.1, 0.7, 61); const x0 = 60, w = 300, y0 = 36, h = 170;
    let s = C3.frame(x0, y0, w, h, 100, 700, -2.5, 0, [100, 300, 500, 700], [-2.5, -2, -1.5, -1, -0.5, 0], "gap (nm)", "log10 κ (rad/µm)", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, gs.map(v => v * 1000), gs.map(v => Math.log10(kappa(v))), 100, 700, -2.5, 0, PB, 2.5);
    s += `<circle cx="${C3.X(x0, w, 100, 700)(g * 1000)}" cy="${C3.Y(y0, h, -2.5, 0)(Math.log10(kappa(g)))}" r="6" fill="${PC}"/>`;
    // tails picture
    const px = 420, pw = 220, pc = y0 + h / 2; const gpx = g * 180; const cw = 40;
    s += `<rect x="${px + 50}" y="${pc - 14}" width="${cw}" height="28" fill="${PB}" opacity="0.4"/><rect x="${px + 50 + cw + gpx}" y="${pc - 14}" width="${cw}" height="28" fill="${PB}" opacity="0.4"/>`;
    const pulse = 0.5 + 0.5 * Math.sin(tsec * 3);
    for (let i = 0; i <= 60; i++) { const xx = px + 50 + cw + gpx * i / 60; const amp = Math.exp(-4.2 * g * i / 60) * 40 * (0.7 + 0.3 * pulse); s += `<line x1="${xx.toFixed(1)}" y1="${pc}" x2="${xx.toFixed(1)}" y2="${(pc - amp).toFixed(1)}" stroke="${PC}" stroke-width="2" opacity="0.6"/>`; }
    s += tx(px + 110, pc + 36, "tail of guide 1 reaching guide 2", "middle") + tx(340, 20, `κ(${(g * 1000).toFixed(0)} nm) = ${kappa(g).toFixed(4)} rad/µm`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "6. Design a 3 dB coupler", t: "Design: a 3 dB splitter and how sensitive it is",
intu: String.raw`A 50:50 splitter is a coupler stopped at half its coupling length. Choose a gap, read the coupling length, set the length to half of it, and check the split. Then look at the two sliders that fabrication and the laser control: the gap error and the wavelength. A 3 dB coupler drifts a few percent per 10 nm of wavelength and per 20 nm of gap, which is why interferometer designs often use a 2 by 2 MMI or a curved coupler instead when they need a flat response. The thesis Chapter 2 Lesson 7 covers the MMI alternative.`,
eq: String.raw`\[ L_{3\mathrm{dB}} = \frac{L_c}{2} = \frac{\lambda}{4\,\Delta n(g)}, \qquad \frac{P_2}{P_1 + P_2} = \sin^2\!\left(\frac{\pi \Delta n(g, \lambda)\, L}{\lambda}\right) \]`,
sym: [[String.raw`\(L_{3\mathrm{dB}}\)`, "length for a 50:50 split"], [String.raw`\(\Delta n(g, \lambda)\)`, "splitting, which depends on the gap and grows slowly with wavelength"], [String.raw`\(L\)`, "the length actually fabricated"]],
how: ["Pick the gap from lithography limits, usually 150 to 300 nm in silicon.", "Compute the coupling length from the splitting, set L to half.", "Longer wavelengths are less confined, so the splitting grows with wavelength and the split ratio drifts.", "Quote the split in dB on each arm and the imbalance in dB."],
say: String.raw`A 3 dB coupler is half a coupling length long, and its split ratio drifts with gap error and wavelength because the splitting does.`,
num: "Gap 200 nm, Δn 0.05: L3dB = 7.75 µm. A 20 nm gap error changes the split from 50:50 to about 46:54. A 30 nm wavelength shift changes it by a similar amount.",
r(fig, ctl) {
  ctl.innerHTML = sl("gd", "Design gap (nm)", 150, 400, 10, 200) + sl("L", "Fabricated length (µm)", 2, 40, 0.1, 7.8) + sl("ge", "Gap error (nm)", -30, 30, 1, 0) + sl("lm", "Wavelength (nm)", 1500, 1600, 1, 1550);
  const u = () => {
    const gd = +$("gd").value / 1000, L = +$("L").value, ge = +$("ge").value / 1000, lm = +$("lm").value / 1000;
    $("gdv").textContent = (gd * 1000).toFixed(0) + " nm"; $("Lv").textContent = L.toFixed(1) + " µm"; $("gev").textContent = (ge * 1000).toFixed(0) + " nm"; $("lmv").textContent = (lm * 1000).toFixed(0) + " nm";
    const dnl = (g, lam) => dn(g) * Math.pow(lam / LAM, 3);   // splitting grows with wavelength (model)
    const L3 = LAM / (4 * dn(gd)); const p2 = Math.pow(Math.sin(Math.PI * dnl(gd + ge, lm) * L / lm), 2);
    const x0 = 60, w = 400, y0 = 36, h = 150; const Ls = range(0, 40, 161);
    let s = C3.frame(x0, y0, w, h, 0, 40, 0, 1, [0, 10, 20, 30, 40], [0, 0.5, 1], "length (µm)", "fraction crossed", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, Ls, Ls.map(l => Math.pow(Math.sin(Math.PI * dn(gd) * l / LAM), 2)), 0, 40, 0, 1, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, Ls, Ls.map(l => Math.pow(Math.sin(Math.PI * dnl(gd + ge, lm) * l / lm), 2)), 0, 40, 0, 1, PC, 2.5);
    s += `<line x1="${C3.X(x0, w, 0, 40)(L)}" x2="${C3.X(x0, w, 0, 40)(L)}" y1="${y0}" y2="${y0 + h}" stroke="${PB}" stroke-dasharray="4 3"/>` + `<circle cx="${C3.X(x0, w, 0, 40)(L)}" cy="${C3.Y(y0, h, 0, 1)(p2)}" r="6" fill="${PC}"/>`;
    s += C3.legend(x0 + 10, y0 + 16, [["design", "var(--b)", "4 3"], ["as built", PC]]);
    const bx = 500; s += tx(bx + 60, y0 + 10, "output split", "middle") + `<rect x="${bx}" y="${y0 + 20}" width="120" height="${h - 20}" fill="var(--sunk)" stroke="var(--b)"/><rect x="${bx}" y="${y0 + 20 + (h - 20) * (1 - (1 - p2))}" width="60" height="${(h - 20) * (1 - p2)}" fill="${PB}"/><rect x="${bx + 60}" y="${y0 + 20 + (h - 20) * (1 - p2)}" width="60" height="${(h - 20) * p2}" fill="${PC}"/>` + tx(bx + 30, y0 + h + 16, "bar", "middle") + tx(bx + 30, y0 + h + 30, `${(100 * (1 - p2)).toFixed(1)} %`, "middle") + tx(bx + 90, y0 + h + 16, "cross", "middle") + tx(bx + 90, y0 + h + 30, `${(100 * p2).toFixed(1)} %`, "middle");
    s += tx(340, 20, `L3dB for this gap: ${L3.toFixed(2)} µm. Imbalance ${Math.abs(PIC.dB(p2) - PIC.dB(1 - p2)).toFixed(2)} dB`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["gd", "L", "ge", "lm"].forEach(i => $(i).oninput = u); u();
}}
],
summary: String.raw`Two guides close together share light through their evanescent tails. The pair has an even and an odd supermode whose index splitting decays exponentially with the gap. Launching into one guide excites both, and their beating swaps the power back and forth as sine squared of kappa z, with kappa equal to pi times the splitting over the wavelength. Full transfer takes the coupling length, the wavelength over twice the splitting. Unequal guides cap the transfer at kappa squared over kappa squared plus delta squared. A 3 dB coupler is half a coupling length and drifts with gap and wavelength, which a mode solver run on the pair lets you predict.`,
sheet: [
[String.raw`\[ \Delta n = n_{\mathrm{even}} - n_{\mathrm{odd}}, \quad \kappa = \pi\Delta n/\lambda \]`, "Supermode splitting and coupling coefficient"],
[String.raw`\[ P_2(z) = \sin^2(\kappa z) \]`, "Power transfer for identical guides"],
[String.raw`\[ L_c = \frac{\pi}{2\kappa} = \frac{\lambda}{2\Delta n} \]`, "Coupling length"],
[String.raw`\[ P_2 = \frac{\kappa^2}{\kappa^2 + \delta^2}\sin^2\!\left(\sqrt{\kappa^2+\delta^2}\,z\right), \quad \delta = \frac{\beta_1 - \beta_2}{2} \]`, "Transfer with detuning"],
[String.raw`\[ \kappa(g) \approx \kappa_0 e^{-\gamma g} \]`, "Exponential decay with gap"],
[String.raw`\[ L_{3\mathrm{dB}} = L_c/2 \]`, "3 dB coupler length"]],
consts: String.raw`\(\lambda = 1.55\) µm. Splitting model \(\Delta n = \Delta n_0 e^{-g/g_0}\) with \(g_0 = 0.24\) µm, calibrated so a 200 nm gap between 450 by 220 nm silicon strips gives \(L_c \approx 15\) µm. Replace it with mode solver values for a real design.`,
sources: ["A. Yariv, Coupled-mode theory for guided-wave optics, IEEE J. Quantum Electron. 9, 919 (1973)", "W. P. Huang, Coupled-mode theory for optical waveguides: an overview, J. Opt. Soc. Am. A 11, 963 (1994)", "L. Chrostowski and M. Hochberg, Silicon Photonics Design, Cambridge (2015), Ch. 4 (directional couplers)", "Tidy3D example notebook DirectionalCouplerSurrogate and the ModeSolver notebook (supermode indices)"]
});
})();
