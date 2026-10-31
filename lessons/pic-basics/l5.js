(function () {
/* Part 1 Lesson 5: ring resonators and WDM. Spectra computed live with PIC.ringAllPass and PIC.ringAddDrop (Bogaerts 2012). */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const NEFF = 2.4, NG = 4.2, LAM0 = 1.55;
/* round trip phase at wavelength lam (um) for ring length L (um), with group index dispersion about 1550 nm */
const phase = (lam, L) => 2 * Math.PI * L * (NEFF - NG * (lam - LAM0) / LAM0) / lam;
const alphaToA = (dBcm, L) => Math.pow(10, -dBcm * L * 1e-4 / 20);   // amplitude round trip, L in um
const fsrNm = L => LAM0 * LAM0 / (NG * L) * 1000;

addLesson("pic", "basics", {
level: "Core",
id: "pic-basics-l5", title: "Ring resonators and wavelength division multiplexing", short: "5. Rings and WDM",
big: String.raw`Bend a waveguide into a loop and couple it to a straight bus. Light at a wavelength that fits a whole number of times around the loop builds up inside it and is pulled out of the bus. Every other wavelength passes untouched. That is a ring resonator, the smallest wavelength filter in integrated photonics, and the building block of modulators, multiplexers and sensors. Its spectrum is a comb of dips whose spacing, depth and width are set by three numbers: the ring length, the coupling to the bus and the round trip loss. This lesson computes the full spectrum live, shows what critical coupling means, and ends with a bank of rings sorting the channels of a WDM link.`,
bridge: String.raw`The transfer functions are the ones in Bogaerts et al., Silicon microring resonators, Laser Photon. Rev. 6, 47 (2012), with self coupling r and round trip amplitude a. The dispersion of the silicon strip (group index 4.2) sets the free spectral range. The thermal shift of 0.08 nm per kelvin is for a 500 by 220 nm silicon ring. The cards use a silicon ring, but the same formulas hold for nitride with a smaller index and a much higher Q.`,
cards: [

{s: "1. Resonance", t: "Resonance: a whole number of wavelengths around the loop",
intu: String.raw`A wave going around the ring comes back to its starting point. If it arrives in phase with itself, each round trip adds constructively and the field grows. That happens when the loop holds a whole number of wavelengths, measured in the material. Drag the wavelength slider and watch the wave around the ring. At a resonance the crests line up and the ring lights up. Between resonances they misalign and the wave cancels.`,
eq: String.raw`\[ m\,\lambda_{\mathrm{res}} = n_{\mathrm{eff}}\, L, \qquad L = 2\pi R \]`,
sym: [[String.raw`\(m\)`, "an integer, the number of wavelengths around the loop"], [String.raw`\(\lambda_{\mathrm{res}}\)`, "a resonance wavelength in vacuum"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the ring waveguide"], [String.raw`\(L, R\)`, "circumference and radius"]],
how: [String.raw`The round trip phase is \(\beta L = 2\pi n_{\mathrm{eff}} L/\lambda\).`, String.raw`Constructive return needs that phase to be a multiple of \(2\pi\).`, "Divide by 2 pi. The result is the resonance condition."],
say: String.raw`A ring resonates when the effective index times the circumference is a whole number of wavelengths.`,
num: "R = 5 µm, L = 31.4 µm, effective index 2.4: m = 48.6 at 1550 nm, so the nearest resonances are at m = 48 and 49, near 1570 and 1538 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("lam", "Wavelength (nm)", 1530, 1570, 0.1, 1550);
  const L = 31.4;
  PIC.player(ctl, (tsec) => {
    const lam = +$("lam").value / 1000; $("lamv").textContent = (lam * 1000).toFixed(1) + " nm";
    const m = NEFF * L / lam; const frac = m - Math.round(m); const build = Math.max(0, 1 - Math.abs(frac) * 6);
    const cx = 250, cy = 130, R = 90; let s = tx(340, 20, `m = n_eff L / λ = ${m.toFixed(2)}, ${Math.abs(frac) < 0.05 ? "on resonance" : "off resonance"}`, "middle", "th");
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${PB}" stroke-width="12" opacity="0.3"/><line x1="40" y1="${cy + R + 18}" x2="460" y2="${cy + R + 18}" stroke="${PB}" stroke-width="12" opacity="0.3"/>`;
    // standing wave drawn as radial wiggle, m cycles around the ring, phase advancing with time
    let d = ""; const N = 240; for (let i = 0; i <= N; i++) { const th = 2 * Math.PI * i / N; const amp = 6 + 10 * build; const w = Math.sin(m * th - tsec * 6) * amp; const rr = R + w; d += (i ? "L" : "M") + (cx + rr * Math.cos(th)).toFixed(1) + " " + (cy + rr * Math.sin(th)).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2" opacity="${(0.4 + 0.6 * build).toFixed(2)}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R - 20}" fill="${PC}" opacity="${(0.25 * build).toFixed(2)}"/>` + tx(cx, cy + 5, `build up ${(100 * build).toFixed(0)} %`, "middle", "t");
    // ladder of m
    s += tx(520, 60, "nearest integers", null, "th"); [Math.floor(m), Math.ceil(m)].forEach((mm, i) => { const lr = NEFF * L / mm * 1000; s += tx(520, 90 + i * 24, `m = ${mm}: λ = ${lr.toFixed(1)} nm`); });
    fig.innerHTML = svg(cy + R + 44, s);
  });
}},

{s: "2. FSR", t: "Free spectral range: the comb spacing",
intu: String.raw`The resonances form a comb. The spacing between teeth is the free spectral range. It is the wavelength squared over the group index times the length, so a small ring has a wide spacing and a long ring a narrow one. Drag the radius. A 5 µm silicon ring has an FSR near 18 nm, enough to park eight WDM channels between two of its own resonances. The group index appears, not the effective index, because the spacing depends on how fast the phase changes with wavelength.`,
eq: String.raw`\[ \mathrm{FSR} = \frac{\lambda^2}{n_g L}, \qquad n_g = n_{\mathrm{eff}} - \lambda\frac{dn_{\mathrm{eff}}}{d\lambda} \]`,
sym: [[String.raw`\(n_g\)`, "group index, about 4.2 for a silicon strip, higher than the effective index 2.4"], [String.raw`\(\Delta\nu_{\mathrm{FSR}} = c/(n_g L)\)`, "the same spacing in frequency"]],
how: [String.raw`Two neighbouring resonances differ by one in \(m\): \(n_{\mathrm{eff}}(\lambda) L/\lambda\) changes by 1.`, String.raw`Differentiate \(n_{\mathrm{eff}}/\lambda\) with respect to \(\lambda\). The derivative brings in \(n_{\mathrm{eff}} - \lambda\, dn_{\mathrm{eff}}/d\lambda\), which is the group index.`, "Solve for the wavelength step. In frequency the spacing is simply c over the optical path length."],
say: String.raw`The free spectral range is lambda squared over group index times circumference, so small rings have widely spaced resonances.`,
num: "R = 5 µm, group index 4.2: FSR 18.2 nm, or 2.27 THz. R = 20 µm: 4.6 nm. R = 100 µm nitride ring, group index 2.1: 1.8 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("R", "Radius (µm)", 3, 40, 0.5, 5) + sl("k", "Coupling r", 0.8, 0.99, 0.005, 0.95);
  const u = () => {
    const R = +$("R").value, r = +$("k").value; $("Rv").textContent = R + " µm"; $("kv").textContent = r.toFixed(3); const L = 2 * Math.PI * R, a = alphaToA(3, L);
    const x0 = 60, w = 560, y0 = 36, h = 160; const ls = range(1520, 1580, 1201);
    let s = C3.frame(x0, y0, w, h, 1520, 1580, 0, 1, [1520, 1540, 1560, 1580], [0, 0.5, 1], "wavelength (nm)", "through port", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls, ls.map(l => PIC.ringAllPass(r, a, phase(l / 1000, L))), 1520, 1580, 0, 1, PB, 2);
    const fsr = fsrNm(L); s += tx(340, 20, `L = ${L.toFixed(1)} µm, FSR = ${fsr.toFixed(2)} nm = ${(PIC.c / (NG * L * 1e-6) / 1e9).toFixed(0)} GHz`, "middle", "th");
    s += `<line x1="${x0 + 60}" x2="${x0 + 60 + fsr / 60 * w}" y1="${y0 + 20}" y2="${y0 + 20}" stroke="${PC}" stroke-width="2" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(x0 + 60 + fsr / 120 * w, y0 + 14, "FSR", "middle");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("R").oninput = u; $("k").oninput = u; u();
}},

{s: "3. All-pass", t: "The all-pass ring: coupling and loss shape the dip",
intu: String.raw`One bus, one ring. Two numbers describe the coupler and the loop. The self coupling \(r\) is the fraction of field that stays in the bus at the coupler, so \(1 - r^2\) is the power coupled in. The round trip amplitude \(a\) is what survives one lap of loss. Drag both and watch the dip. Weak coupling makes narrow dips. More loss makes them wider and shallower. The whole spectrum is one formula.`,
eq: String.raw`\[ T_{\mathrm{ap}} = \frac{a^2 - 2ra\cos\phi + r^2}{1 - 2ra\cos\phi + (ra)^2}, \qquad \phi = \beta L = \frac{2\pi n_{\mathrm{eff}} L}{\lambda} \]<div class="eqref">Bogaerts 2012, Eq. 4</div>`,
sym: [[String.raw`\(r\)`, "self coupling coefficient of the coupler, field that passes straight"], [String.raw`\(\kappa_c = \sqrt{1 - r^2}\)`, "cross coupling, field that enters the ring"], [String.raw`\(a\)`, "round trip amplitude transmission, 1 for a lossless ring"], [String.raw`\(\phi\)`, "round trip phase"]],
how: ["Write the coupler as a lossless 2 by 2 matrix with r and kappa.", "The field in the ring after one lap is a times exp of i phi times what entered.", "Sum the geometric series of laps. The output field is the bus field plus the leak back out of the ring.", "Take the modulus squared. The cosine terms come from the interference of the direct and the circulated paths."],
say: String.raw`The all-pass transmission is set by the self coupling r and the round trip amplitude a, and dips at every multiple of two pi in the round trip phase.`,
num: "R = 5 µm, 20 dB/cm: a = 0.993. With r = 0.95 the dip reaches 0.56, FWHM 0.34 nm, Q about 4600. With r = 0.993 the ring is critically coupled and the dip reaches zero. A real 3 dB/cm ring has a = 0.999 and needs r near 0.999 for a deep dip.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "Self coupling r", 0.8, 0.995, 0.005, 0.95) + sl("al", "Round trip loss (dB/cm)", 0, 60, 1, 20);
  const L = 2 * Math.PI * 5;
  const u = () => {
    const r = +$("r").value, dB = +$("al").value; $("rv").textContent = r.toFixed(3); $("alv").textContent = dB + " dB/cm"; const a = alphaToA(dB, L);
    const x0 = 60, w = 560, y0 = 36, h = 160; const ls = range(1548, 1552, 801);
    let s = C3.frame(x0, y0, w, h, 1548, 1552, 0, 1, [1548, 1549, 1550, 1551, 1552], [0, 0.5, 1], "wavelength (nm)", "T", v => v, v => v.toFixed(1));
    const T = ls.map(l => PIC.ringAllPass(r, a, phase(l / 1000, L) - phase(LAM0, L) + 2 * Math.PI * Math.round(phase(LAM0, L) / (2 * Math.PI))));
    s += plot(x0, y0, w, h, ls, T, 1548, 1552, 0, 1, PB, 2.5);
    const Tmin = Math.min(...T); s += tx(340, 20, `a = ${a.toFixed(4)}, 1 − r² = ${(1 - r * r).toFixed(3)} coupled, dip to ${Tmin.toFixed(3)}`, "middle", "th");
    // ring drawing
    s += `<circle cx="${x0 + w - 60}" cy="${y0 + 55}" r="28" fill="none" stroke="${PB}" stroke-width="6" opacity="0.4"/><line x1="${x0 + w - 110}" x2="${x0 + w - 10}" y1="${y0 + 92}" y2="${y0 + 92}" stroke="${PB}" stroke-width="6" opacity="0.4"/>` + tx(x0 + w - 60, y0 + 59, "a", "middle", "t") + tx(x0 + w - 60, y0 + 108, "r", "middle", "t");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("r").oninput = u; $("al").oninput = u; u();
}},

{s: "4. Critical coupling", t: "Critical coupling: when the dip goes to zero",
intu: String.raw`Set the coupling equal to the loss and something special happens. The light that leaks out of the ring exactly cancels the light going straight past, and nothing comes out at resonance. That is critical coupling, r equal to a. Couple harder and you are over coupled, the dip is shallow and the phase swings through a full 2 pi. Couple weaker and you are under coupled, the dip is also shallow and the phase only wobbles. Drag r across a and watch the dip bottom out and the phase curve flip.`,
eq: String.raw`\[ T_{\mathrm{ap}}(\phi = 2\pi m) = \left(\frac{a - r}{1 - ra}\right)^{2} = 0 \iff r = a \]<div class="eqnote">r \(\lt\) a over coupled, r \(\gt\) a under coupled</div>`,
sym: [[String.raw`\(r = a\)`, "critical coupling condition"], ["over coupled", "coupling loss exceeds round trip loss, phase sweeps 2 pi"], ["under coupled", "round trip loss exceeds coupling, phase returns to zero"]],
how: [String.raw`Put \(\cos\phi = 1\) in the all-pass formula.`, "Numerator and denominator factor into squares.", "The transmission is zero only when the two amplitudes r and a are equal. Then the direct and circulated fields have equal size and opposite sign."],
say: String.raw`Critical coupling means the coupling equals the round trip loss, r equals a, and the through port goes to zero at resonance.`,
num: "The card uses a deliberately lossy ring, 50 dB/cm, so a = 0.982 and critical coupling sits at r = 0.982 with 3.6 percent of the power coupled. A 3 dB/cm ring has a = 0.999 and is critical at r = 0.999. Modulators sit slightly over coupled so the on state has low loss while the dip stays deep.",
r(fig, ctl) {
  ctl.innerHTML = sl("r2", "Self coupling r", 0.9, 0.999, 0.001, 0.95);
  const L = 2 * Math.PI * 5, a = alphaToA(50, L);
  const u = () => {
    const r = +$("r2").value; $("r2v").textContent = r.toFixed(3);
    const x0 = 60, w = 260, y0 = 36, h = 150; const ls = range(1549, 1551, 401);
    const ph0 = 2 * Math.PI * Math.round(phase(LAM0, L) / (2 * Math.PI)); const phs = ls.map(l => phase(l / 1000, L) - phase(LAM0, L) + ph0);
    let s = C3.frame(x0, y0, w, h, 1549, 1551, 0, 1, [1549, 1550, 1551], [0, 0.5, 1], "wavelength (nm)", "T", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls, phs.map(p => PIC.ringAllPass(r, a, p)), 1549, 1551, 0, 1, PB, 2.5);
    // phase of the output field
    const x1 = 400; s += C3.frame(x1, y0, w - 20, h, 1549, 1551, -Math.PI, Math.PI, [1549, 1550, 1551], [-Math.PI, 0, Math.PI], "wavelength (nm)", "phase", v => v, v => v === 0 ? "0" : v > 0 ? "π" : "−π");
    const pha = phs.map(p => { const num = { re: a * Math.cos(p) - r, im: a * Math.sin(p) }, den = { re: 1 - r * a * Math.cos(p), im: -r * a * Math.sin(p) }; const re = (num.re * den.re + num.im * den.im), im = (num.im * den.re - num.re * den.im); return Math.atan2(im, re) - Math.atan2(a * Math.sin(0), -1) ; });
    const unwrapped = pha.map(v => { let q = v - Math.PI; while (q > Math.PI) q -= 2 * Math.PI; while (q < -Math.PI) q += 2 * Math.PI; return q; });
    s += plot(x1, y0, w - 20, h, ls, unwrapped, 1549, 1551, -Math.PI, Math.PI, PC, 2.5);
    const regime = Math.abs(r - a) < 0.002 ? "critically coupled" : r < a ? "over coupled" : "under coupled";
    s += tx(340, 20, `a = ${a.toFixed(3)}, r = ${r.toFixed(3)}: ${regime}, dip ${Math.pow((a - r) / (1 - r * a), 2).toFixed(3)}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("r2").oninput = u; u();
}},

{s: "5. Add-drop", t: "The add-drop ring: a second bus takes the resonant light away",
intu: String.raw`Add a second bus on the other side of the ring. Now the resonant light does not vanish into loss, it leaves through the drop port. The through port shows a dip and the drop port shows a peak at the same wavelength. This is the filter that pulls one channel out of a WDM stream. Drag the two couplings. Equal couplings and low loss give a drop peak near 100 percent. Unequal couplings leave some light in the through port.`,
eq: String.raw`\[ T_{\mathrm{thr}} = \frac{r_2^2a^2 - 2r_1r_2a\cos\phi + r_1^2}{1 - 2r_1r_2a\cos\phi + (r_1r_2a)^2}, \qquad T_{\mathrm{drop}} = \frac{(1 - r_1^2)(1 - r_2^2)\,a}{1 - 2r_1r_2a\cos\phi + (r_1r_2a)^2} \]<div class="eqref">Bogaerts 2012, Eqs. 11 and 12</div>`,
sym: [[String.raw`\(r_1, r_2\)`, "self coupling at the input bus and at the drop bus"], [String.raw`\(a\)`, "round trip amplitude, here for the whole loop"], [String.raw`\(T_{\mathrm{thr}}, T_{\mathrm{drop}}\)`, "power at the through and drop ports"]],
how: ["Two couplers now sit in the loop. The field circulates through both.", "The drop port collects what crosses the second coupler on each lap, summed over laps.", "Critical coupling for the add-drop ring is r1 equal to r2 times a, when the through port dip reaches zero.", "The drop peak is a Lorentzian whose width is the loaded linewidth."],
say: String.raw`An add-drop ring routes the resonant wavelength to the drop port and passes everything else, with a Lorentzian peak set by the two couplings and the loss.`,
num: "r1 = r2 = 0.95, a = 0.99: drop peak 0.90, through dip 0.0004, FWHM 0.22 nm for a 5 µm ring. Channel spacing of 100 GHz needs a width below about 0.3 nm, so this ring works.",
r(fig, ctl) {
  ctl.innerHTML = sl("r1", "Input coupling r₁", 0.8, 0.995, 0.005, 0.95) + sl("rr2", "Drop coupling r₂", 0.8, 0.995, 0.005, 0.95);
  const L = 2 * Math.PI * 5, a = alphaToA(3, L);
  const u = () => {
    const r1 = +$("r1").value, r2 = +$("rr2").value; $("r1v").textContent = r1.toFixed(3); $("rr2v").textContent = r2.toFixed(3);
    const x0 = 60, w = 560, y0 = 36, h = 160; const ls = range(1548, 1552, 801);
    const ph0 = 2 * Math.PI * Math.round(phase(LAM0, L) / (2 * Math.PI)); const res = ls.map(l => PIC.ringAddDrop(r1, r2, a, phase(l / 1000, L) - phase(LAM0, L) + ph0));
    let s = C3.frame(x0, y0, w, h, 1548, 1552, 0, 1, [1548, 1549, 1550, 1551, 1552], [0, 0.5, 1], "wavelength (nm)", "T", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls, res.map(v => v.thr), 1548, 1552, 0, 1, PB, 2.5) + plot(x0, y0, w, h, ls, res.map(v => v.drop), 1548, 1552, 0, 1, PC, 2.5);
    s += C3.legend(x0 + 10, y0 + 16, [["through", PB], ["drop", PC]]);
    const pk = Math.max(...res.map(v => v.drop)); const half = res.filter(v => v.drop > pk / 2).length * (4 / 800);
    s += tx(340, 20, `drop peak ${pk.toFixed(3)}, FWHM ${half.toFixed(3)} nm, loaded Q ${(1550 / half).toFixed(0)}`, "middle", "th");
    s += `<circle cx="${x0 + w - 60}" cy="${y0 + 80}" r="24" fill="none" stroke="${PB}" stroke-width="5" opacity="0.4"/><line x1="${x0 + w - 110}" x2="${x0 + w - 10}" y1="${y0 + 112}" y2="${y0 + 112}" stroke="${PB}" stroke-width="5" opacity="0.4"/><line x1="${x0 + w - 110}" x2="${x0 + w - 10}" y1="${y0 + 48}" y2="${y0 + 48}" stroke="${PC}" stroke-width="5" opacity="0.4"/>` + tx(x0 + w - 115, y0 + 44, "drop", "end") + tx(x0 + w - 115, y0 + 116, "in", "end");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("r1").oninput = u; $("rr2").oninput = u; u();
}},

{s: "6. Q and finesse", t: "Quality factor and finesse: how sharp is the filter",
intu: String.raw`Two numbers say how sharp a resonance is. The loaded Q is the resonance wavelength over the linewidth, how many oscillations the light makes before it leaks out. The finesse is the spacing over the linewidth, how many channels fit between two resonances. Drag the loss and the coupling. Q is highest for low loss and weak coupling, which also makes the ring slow to respond, so a modulator wants a Q of a few thousand and a filter wants more.`,
eq: String.raw`\[ \mathrm{FWHM} = \frac{(1 - ra)\,\lambda_{\mathrm{res}}^2}{\pi n_g L\sqrt{ra}}, \qquad Q_L = \frac{\lambda_{\mathrm{res}}}{\mathrm{FWHM}}, \qquad \mathcal{F} = \frac{\mathrm{FSR}}{\mathrm{FWHM}} \]<div class="eqref">Bogaerts 2012, Eqs. 15 to 17 (all-pass)</div>`,
sym: [[String.raw`\(\mathrm{FWHM}\)`, "full width of the dip at half depth"], [String.raw`\(Q_L\)`, "loaded quality factor, including the coupling loss"], [String.raw`\(\mathcal{F}\)`, "finesse, number of linewidths per free spectral range"], [String.raw`\(Q_i\)`, "intrinsic Q, with r set to 1, set by loss alone"]],
how: ["Expand the all-pass formula near resonance. The dip is a Lorentzian.", "Its half width comes from the denominator, which gives the (1 minus ra) factor.", "Q counts stored energy over energy lost per cycle, which is the same as wavelength over linewidth.", "The photon lifetime is Q over the angular frequency, which limits how fast a ring modulator can switch."],
say: String.raw`Loaded Q is the resonance wavelength over the linewidth and finesse is the free spectral range over the linewidth, both rising as coupling and loss fall.`,
num: "Silicon, 3 dB/cm, r = 0.95, R = 5 µm: FWHM 0.30 nm, Q 5100, finesse 60, photon lifetime 4.2 ps, so a modulator bandwidth near 38 GHz. Nitride, 0.05 dB/cm, R = 100 µm, group index 2.1: Q about 5e5 at r = 0.995 and above 1e6 at r = 0.999.",
r(fig, ctl) {
  ctl.innerHTML = sl("r3", "Self coupling r", 0.8, 0.999, 0.001, 0.95) + sl("al3", "Loss (dB/cm)", 0.05, 30, 0.05, 3) + sl("R3", "Radius (µm)", 3, 100, 1, 5);
  const u = () => {
    const r = +$("r3").value, dB = +$("al3").value, R = +$("R3").value; $("r3v").textContent = r.toFixed(3); $("al3v").textContent = dB.toFixed(2) + " dB/cm"; $("R3v").textContent = R + " µm";
    const L = 2 * Math.PI * R, a = alphaToA(dB, L), fw = (1 - r * a) * LAM0 * LAM0 / (Math.PI * NG * L * Math.sqrt(r * a)) * 1000, Q = 1550 / fw, F = fsrNm(L) / fw, Qi = (1 - a) > 0 ? 1550 / ((1 - a) * LAM0 * LAM0 / (Math.PI * NG * L * Math.sqrt(a)) * 1000) : Infinity;
    const tau = Q * LAM0 * 1e-6 / (2 * Math.PI * PIC.c);
    const x0 = 60, w = 560, y0 = 36, h = 140; const half = Math.max(fw * 4, 0.02); const ls = range(1550 - half, 1550 + half, 601);
    const ph0 = 2 * Math.PI * Math.round(phase(LAM0, L) / (2 * Math.PI));
    let s = C3.frame(x0, y0, w, h, 1550 - half, 1550 + half, 0, 1, [1550 - half, 1550, 1550 + half], [0, 0.5, 1], "wavelength (nm)", "T", v => v.toFixed(3), v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls, ls.map(l => PIC.ringAllPass(r, a, phase(l / 1000, L) - phase(LAM0, L) + ph0)), 1550 - half, 1550 + half, 0, 1, PB, 2.5);
    s += `<line x1="${C3.X(x0, w, 1550 - half, 1550 + half)(1550 - fw / 2)}" x2="${C3.X(x0, w, 1550 - half, 1550 + half)(1550 + fw / 2)}" y1="${y0 + h / 2}" y2="${y0 + h / 2}" stroke="${PC}" stroke-width="2" marker-end="url(#ar)" marker-start="url(#ar)"/>` + tx(340, y0 + h / 2 - 8, "FWHM", "middle");
    fig.innerHTML = svg(y0 + h + 40, s);
    ctl.querySelector("#ro") && ctl.querySelector("#ro").remove();
    ctl.insertAdjacentHTML("beforeend", `<div id="ro">${PIC.readout([["FWHM", fw < 0.001 ? fw.toExponential(2) + " nm" : fw.toFixed(4) + " nm"], ["loaded Q", Q.toExponential(2)], ["intrinsic Q", Number.isFinite(Qi) ? Qi.toExponential(2) : "∞"], ["finesse", F.toFixed(0)], ["photon lifetime", (tau * 1e12).toFixed(1) + " ps"]])}</div>`);
  };
  ["r3", "al3", "R3"].forEach(i => $(i).oninput = u); u();
}},

{s: "7. Thermal drift", t: "Temperature moves the comb: 0.08 nm per kelvin",
intu: String.raw`Silicon's index rises with temperature, about 1.8 times 10 to the minus 4 per kelvin. That shifts every resonance by about 0.08 nm per kelvin for a 500 by 220 nm ring. A 100 GHz channel is 0.8 nm wide, so ten degrees moves a ring a full channel. Play the animation: a laser line sits still while the ring resonance drifts with a slowly changing temperature. Real chips use a heater on each ring and a feedback loop to hold the resonance on the channel.`,
eq: String.raw`\[ \frac{d\lambda_{\mathrm{res}}}{dT} = \frac{\lambda}{n_g}\left(\frac{dn_{\mathrm{eff}}}{dT}\right) \approx \frac{1.55\ \mathrm{µm}}{4.2}\cdot 2.2\times10^{-4}\ \mathrm{K^{-1}} \approx 0.08\ \mathrm{nm/K} \]`,
sym: [[String.raw`\(dn_{\mathrm{eff}}/dT\)`, "thermo-optic response of the mode, about 2.2e-4 per K for a silicon strip (the material value 1.8e-4 scaled by the confinement and the cladding)"], [String.raw`\(d\lambda/dT\)`, "resonance drift per kelvin"]],
how: [String.raw`Differentiate the resonance condition \(m\lambda = n_{\mathrm{eff}} L\) with respect to temperature at fixed \(m\).`, "The group index appears again because the effective index itself depends on wavelength.", "Nitride has a thermo-optic coefficient seven times smaller, so nitride rings drift about 0.01 nm per K."],
say: String.raw`A silicon ring resonance drifts about 0.08 nm per kelvin, so rings need heaters and feedback to stay on a WDM channel.`,
num: "Si ring: 0.08 nm/K, a 10 K change is one 100 GHz channel. Heater power to tune one FSR: a few mW to tens of mW. SiN ring: about 0.01 nm/K.",
r(fig, ctl) {
  ctl.innerHTML = sl("dT", "Temperature swing (K)", 0, 20, 0.5, 6);
  const L = 2 * Math.PI * 5, a = alphaToA(3, L), r = 0.96;
  PIC.player(ctl, (tsec) => {
    const dT = +$("dT").value; $("dTv").textContent = dT + " K"; const T = dT * 0.5 * (1 + Math.sin(tsec * 0.8)); const shift = 0.08 * T;
    const x0 = 60, w = 560, y0 = 36, h = 150; const ls = range(1549, 1552, 601);
    const ph0 = 2 * Math.PI * Math.round(phase(LAM0, L) / (2 * Math.PI));
    let s = C3.frame(x0, y0, w, h, 1549, 1552, 0, 1, [1549, 1550, 1551, 1552], [0, 0.5, 1], "wavelength (nm)", "T", v => v, v => v.toFixed(1));
    const Tf = l => PIC.ringAllPass(r, a, phase((l - shift) / 1000, L) - phase(LAM0, L) + ph0);
    s += plot(x0, y0, w, h, ls, ls.map(Tf), 1549, 1552, 0, 1, PB, 2.5);
    const xl = C3.X(x0, w, 1549, 1552)(1550); s += `<line x1="${xl}" x2="${xl}" y1="${y0}" y2="${y0 + h}" stroke="${PC}" stroke-width="2"/>` + tx(xl + 6, y0 + 14, "laser");
    s += tx(340, 20, `ΔT = ${T.toFixed(1)} K, resonance shifted ${shift.toFixed(2)} nm, laser sees T = ${Tf(1550).toFixed(2)}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "8. WDM bank", t: "A bank of rings sorts the channels of a WDM link",
intu: String.raw`Put several rings along one bus, each a little larger than the last so its resonance sits one channel over. Each ring drops its own wavelength to its own detector and passes the rest. That is a demultiplexer in a few hundred square micrometres. Drag the number of channels and the spacing. The FSR of the rings must be wider than the whole band, or a ring would also drop a channel one FSR away. Watch the spectra: each colour is one ring's drop port.`,
eq: String.raw`\[ \lambda_k = \lambda_1 + (k - 1)\,\Delta\lambda, \qquad \Delta\lambda = \frac{\lambda^2}{c}\,\Delta f \;\;(100\ \mathrm{GHz} \to 0.80\ \mathrm{nm}), \qquad \mathrm{FSR} \gt N\,\Delta\lambda \]`,
sym: [[String.raw`\(\lambda_k\)`, "centre of channel k"], [String.raw`\(\Delta f, \Delta\lambda\)`, "channel spacing in frequency and wavelength"], [String.raw`\(N\)`, "number of channels"], ["crosstalk", "light from a neighbouring channel that leaks into a drop port"]],
how: [String.raw`\(\lambda = c/f\), so \(d\lambda = -(\lambda^2/c)\, df\). At 1550 nm, 100 GHz is 0.80 nm.`, "Each ring is tuned by a slightly different radius or by its heater.", "A drop port's crosstalk from the neighbour is the Lorentzian tail one spacing away, so narrow linewidths and wide spacings help.", "Nvidia's 2025 co-packaged optics uses microring modulators on the same principle in reverse, each ring writing data onto its own wavelength."],
say: String.raw`A ring bank demultiplexes a WDM link by giving each channel its own resonant ring, with the free spectral range wider than the band.`,
num: "8 channels at 100 GHz: 5.6 nm of band, so a 5 µm ring with 18 nm FSR is safe. 16 channels at 200 GHz: 24 nm, which exceeds the FSR of a 5 µm silicon ring, so smaller rings or interleavers are needed.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Channels", 2, 16, 1, 8) + sl("sp", "Spacing (GHz)", 50, 400, 50, 100) + sl("fw", "Ring linewidth (GHz)", 10, 100, 5, 30);
  PIC.player(ctl, (tsec) => {
    const N = +$("N").value, sp = +$("sp").value, fwG = +$("fw").value; $("Nv").textContent = N; $("spv").textContent = sp + " GHz"; $("fwv").textContent = fwG + " GHz";
    const dl = sp * 1.55 * 1.55 / 299.792458, fw = fwG * 1.55 * 1.55 / 299.792458;   // nm (GHz times lambda squared over c)
    const x0 = 60, w = 560, y0 = 36, h = 130; const lo = 1550 - dl, hi = 1550 + N * dl; const ls = range(lo, hi, 601);
    let s = C3.frame(x0, y0, w, h, lo, hi, 0, 1, [lo, (lo + hi) / 2, hi], [0, 0.5, 1], "wavelength (nm)", "drop ports", v => v.toFixed(1), v => v.toFixed(1));
    let thr = ls.map(() => 1);
    for (let k = 0; k < N; k++) { const lc = 1550 + k * dl; const col = PIC.heat(k / Math.max(1, N - 1)); const dr = ls.map(l => 1 / (1 + Math.pow(2 * (l - lc) / fw, 2))); s += plot(x0, y0, w, h, ls, dr, lo, hi, 0, 1, col, 1.8); thr = thr.map((v, i) => v * (1 - dr[i])); }
    // crosstalk from the neighbour
    const xtalk = PIC.dB(1 / (1 + Math.pow(2 * dl / fw, 2)));
    // ring bank drawing with a pulse travelling along the bus and dropping
    const by = y0 + h + 72; s += `<line x1="${x0}" x2="${x0 + w}" y1="${by}" y2="${by}" stroke="${PB}" stroke-width="6" opacity="0.4"/>`;
    const pulseK = Math.floor(tsec * 1.2) % N; const ph = (tsec * 1.2) % 1;
    for (let k = 0; k < N; k++) { const cx = x0 + 30 + k * (w - 60) / Math.max(1, N - 1); const col = PIC.heat(k / Math.max(1, N - 1)); s += `<circle cx="${cx}" cy="${by - 22}" r="12" fill="none" stroke="${col}" stroke-width="4"/>`; if (k === pulseK) s += `<circle cx="${(x0 + ph * (cx - x0)).toFixed(1)}" cy="${by}" r="5" fill="${col}"/>` + (ph > 0.97 ? `<circle cx="${cx}" cy="${by - 22}" r="7" fill="${col}"/>` : ""); }
    s += tx(x0, by + 20, "bus with one ring per channel. The travelling pulse drops into its own ring.") + tx(340, 20, `spacing ${dl.toFixed(2)} nm, neighbour crosstalk ${xtalk.toFixed(1)} dB, band ${(N * dl).toFixed(1)} nm`, "middle", "th");
    fig.innerHTML = svg(by + 36, s);
  });
}}
],
summary: String.raw`A ring resonates when its circumference holds a whole number of wavelengths, and its resonances form a comb spaced by the free spectral range, lambda squared over group index times length. The all-pass and add-drop spectra follow from two numbers, the self coupling r and the round trip amplitude a. At critical coupling, r equal to a, the through port goes to zero. The loaded Q is wavelength over linewidth and the finesse is FSR over linewidth. Silicon rings drift 0.08 nm per kelvin and need heaters. A bank of rings, one per channel and with an FSR wider than the band, demultiplexes a WDM link.`,
sheet: [
[String.raw`\[ m\lambda_{\mathrm{res}} = n_{\mathrm{eff}} L \]`, "Resonance condition"],
[String.raw`\[ \mathrm{FSR} = \frac{\lambda^2}{n_g L} \]`, "Free spectral range"],
[String.raw`\[ T_{\mathrm{ap}} = \frac{a^2 - 2ra\cos\phi + r^2}{1 - 2ra\cos\phi + (ra)^2} \]`, "All-pass transmission (Bogaerts 2012)"],
[String.raw`\[ T_{\mathrm{thr}} = \frac{r_2^2a^2 - 2r_1r_2a\cos\phi + r_1^2}{1 - 2r_1r_2a\cos\phi + (r_1r_2a)^2}, \quad T_{\mathrm{drop}} = \frac{(1-r_1^2)(1-r_2^2)a}{1 - 2r_1r_2a\cos\phi + (r_1r_2a)^2} \]`, "Add-drop ring"],
[String.raw`\[ r = a \]`, "Critical coupling, zero through transmission"],
[String.raw`\[ \mathrm{FWHM} = \frac{(1-ra)\lambda^2}{\pi n_g L\sqrt{ra}}, \quad Q_L = \frac{\lambda}{\mathrm{FWHM}}, \quad \mathcal{F} = \frac{\mathrm{FSR}}{\mathrm{FWHM}} \]`, "Linewidth, Q, finesse"],
[String.raw`\[ \frac{d\lambda}{dT} \approx \frac{\lambda}{n_g}\frac{dn_{\mathrm{eff}}}{dT} \approx 0.08\ \mathrm{nm/K} \]`, "Thermal drift of a silicon ring"],
[String.raw`\[ \Delta\lambda = \frac{\lambda^2}{c}\Delta f \]`, "Channel spacing, 100 GHz is 0.80 nm at 1550 nm"]],
consts: String.raw`Silicon strip: \(n_{\mathrm{eff}} = 2.4\), \(n_g = 4.2\), \(\lambda_0 = 1.55\) µm. Round trip amplitude \(a = 10^{-\alpha_{\mathrm{dB}} L / 20}\) with \(L\) in cm.`,
sources: ["W. Bogaerts et al., Silicon microring resonators, Laser Photon. Rev. 6, 47 (2012), Eqs. 4, 11, 12, 15 to 17", "A. Yariv, Universal relations for coupling of optical power between microresonators and dielectric waveguides, Electron. Lett. 36, 321 (2000)", "US patent RE48654, silicon ring resonance sensitivity about 0.08 nm/K for a 500 by 220 nm ring", "Nvidia, Spectrum-X and Quantum-X Photonics announcement, GTC March 2025 (microring modulators in co-packaged optics)"]
});
})();
