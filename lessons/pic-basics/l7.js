(function () {
/* Part 1 Lesson 7: photodetectors and the receiver. Responsivity, bandwidth, noise and sensitivity computed live. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
/* Ge absorption model: strong below 1.55 um, falling to zero near 1.62 um (direct gap with tensile strain) */
const geAlpha = lam => 4000 / (1 + Math.exp((lam - 1.575) / 0.018));   // cm^-1, illustrative

addLesson("pic", "basics", {
level: "Core",
id: "pic-basics-l7", title: "Photodetectors and the receiver: reading the bits back", short: "7. Photodetectors",
big: String.raw`At the end of the link a photodetector turns light back into current. Silicon is transparent at 1310 and 1550 nm, so the detector is germanium grown on top of the silicon waveguide. Light couples up into the germanium, is absorbed, and the electron hole pairs are swept out by a field across a PIN junction. Four numbers describe the detector: responsivity, how many amperes per watt, bandwidth, set by the carrier transit time and the RC time, dark current, the current with no light, and the noise, which together with the amplifier sets the sensitivity. This lesson builds the receiver from the junction up and ends with the bit error rate as a function of received power, the curve that closes the link budget of Lesson 1.`,
bridge: String.raw`Responsivity and the shot and thermal noise expressions are the textbook forms (Agrawal, Fiber-Optic Communication Systems, Ch. 4). The transit time bandwidth rule is the standard 0.45 times saturation velocity over absorber width. Reported germanium detector values, 0.84 to 1.09 A/W with dark currents from 70 nA to a few microamps and bandwidths above 40 GHz, are from Chinese Physics B 24, 038502 (2015) and Optics Express 24, 27738 (2016). Prof. Ning Li's early work on InGaAs photodiodes and avalanche detectors (IEEE PTL 2004, APL 2003) is the III-V version of the same physics.`,
cards: [

{s: "1. The PIN detector", t: "Germanium on silicon: absorb, separate, collect",
intu: String.raw`The waveguide runs under a strip of germanium. Light leaks up into the germanium, which absorbs at 1550 nm because its bandgap is smaller than silicon's. Each absorbed photon makes an electron and a hole. The germanium sits inside a PIN junction with a reverse bias, so a field sweeps the electron to the n side and the hole to the p side, and that is the photocurrent. Play the animation and drag the bias. More bias means a stronger field, faster carriers and a wider depletion region.`,
eq: String.raw`\[ I_{\mathrm{ph}} = \mathcal{R}\, P_{\mathrm{opt}}, \qquad \text{one photon} \to \text{one electron hole pair, with probability } \eta \]`,
sym: [[String.raw`\(I_{\mathrm{ph}}\)`, "photocurrent"], [String.raw`\(\mathcal{R}\)`, "responsivity, amperes per watt"], [String.raw`\(\eta\)`, "quantum efficiency, fraction of photons that give a collected pair"], ["PIN", "p doped, intrinsic, n doped: the intrinsic region holds the field and absorbs the light"]],
how: ["Germanium's bandgap is 0.66 eV, so it absorbs up to about 1.6 µm. Silicon's 1.12 eV gap stops at 1.1 µm.", "Germanium is grown selectively on the silicon by epitaxy, with an anneal to reduce the threading dislocations from the 4 percent lattice mismatch.", "Reverse bias depletes the intrinsic region. The field there separates the pairs before they recombine.", "Vertical PIN puts the contacts above and below, lateral PIN puts them at the sides. Both are used."],
say: String.raw`A germanium on silicon PIN photodetector absorbs the light the silicon cannot and sweeps the carriers out with a reverse bias to make the photocurrent.`,
num: "Germanium absorption at 1550 nm: about 4000 per cm, so 10 µm of length absorbs most of the light. Typical detector: 10 to 40 µm long, 0.5 to 1 µm wide, bias 1 to 2 V.",
r(fig, ctl) {
  ctl.innerHTML = sl("V", "Reverse bias (V)", 0, 3, 0.1, 1);
  PIC.player(ctl, (tsec) => {
    const V = +$("V").value; $("Vv").textContent = V.toFixed(1) + " V";
    let s = tx(340, 20, "cross-section along the waveguide", "middle", "th");
    const x0 = 60, y0 = 60, w = 560;
    s += `<rect x="${x0}" y="${y0 + 110}" width="${w}" height="40" fill="var(--sunk)" stroke="var(--b)"/>` + tx(x0 + 8, y0 + 135, "buried oxide");
    s += `<rect x="${x0}" y="${y0 + 90}" width="${w}" height="20" fill="${PB}" opacity="0.6"/>` + tx(x0 + 8, y0 + 104, "silicon waveguide, p doped", null, "ts");
    s += `<rect x="${x0 + 200}" y="${y0 + 30}" width="300" height="60" fill="${PP}" opacity="0.45" stroke="${PP}"/>` + tx(x0 + 350, y0 + 84, "germanium absorber (intrinsic)", "middle") + `<rect x="${x0 + 260}" y="${y0 + 18}" width="180" height="12" fill="var(--p)"/>` + tx(x0 + 350, y0 + 12, "n contact", "middle");
    // photons travelling in the waveguide and absorbed in Ge
    for (let k = 0; k < 7; k++) { const ph = (tsec * 0.3 + k / 7) % 1; const x = x0 + ph * 480; if (x < x0 + 200) s += `<circle cx="${x.toFixed(1)}" cy="${y0 + 100}" r="4" fill="${PC}"/>`; else { const dec = Math.exp(-(x - x0 - 200) / 120); s += `<circle cx="${x.toFixed(1)}" cy="${(y0 + 100 - (x - x0 - 200) * 0.15).toFixed(1)}" r="4" fill="${PC}" opacity="${dec.toFixed(2)}"/>`; } }
    // carriers drifting: electrons up, holes down, speed grows with bias
    const sp = 0.3 + V * 0.7; for (let k = 0; k < 6; k++) { const ph = (tsec * sp + k / 6) % 1; const x = x0 + 230 + k * 45; s += `<circle cx="${x}" cy="${(y0 + 75 - 40 * ph).toFixed(1)}" r="4" fill="${PB}" stroke="#0C447C"/><circle cx="${x + 12}" cy="${(y0 + 60 + 40 * ph).toFixed(1)}" r="4" fill="none" stroke="${PC}" stroke-width="2"/>`; }
    s += tx(x0 + 520, y0 + 60, "E field", null) + `<line x1="${x0 + 540}" y1="${y0 + 36}" x2="${x0 + 540}" y2="${y0 + 86}" stroke="${PA}" stroke-width="${1 + V}" marker-end="url(#ar)"/>`;
    s += tx(x0, y0 + 172, "red: photons leaking from the waveguide into the germanium and being absorbed.") + tx(x0, y0 + 188, "blue: electrons drift to the n contact. hollow red: holes drift to the p silicon.");
    fig.innerHTML = svg(y0 + 200, s);
  });
}},

{s: "2. Responsivity", t: "Responsivity: amperes per watt, and why it rises with wavelength",
intu: String.raw`Each photon carries energy h c over lambda. A watt of longer wavelength light has more photons, so it makes more electrons. That is why responsivity grows with wavelength, until the photons no longer have enough energy to cross the bandgap and the absorption collapses. Drag the quantum efficiency and the wavelength. Germanium is excellent at 1310 nm, good at 1550 nm, and fades beyond 1600 nm unless strained.`,
eq: String.raw`\[ \mathcal{R} = \frac{\eta\, q\, \lambda}{h c} = \frac{\eta\,\lambda[\mathrm{µm}]}{1.24}\ \ \mathrm{A/W} \]`,
sym: [[String.raw`\(q\)`, "electron charge"], [String.raw`\(h c/\lambda\)`, "photon energy"], [String.raw`\(\eta\)`, "quantum efficiency, absorbed and collected fraction"], ["1.24", "h c over q in electron volt micrometres"]],
how: ["Photons per second is power over photon energy.", "Electrons per second is eta times that. Multiply by q for current.", "Responsivity is current over power, which leaves eta q lambda over h c.", "The quantum efficiency itself falls near the band edge because the absorption length becomes longer than the device."],
say: String.raw`Responsivity is quantum efficiency times wavelength in micrometres over 1.24, so it rises with wavelength until the band edge.`,
num: "η = 0.8 at 1.55 µm: 1.0 A/W. Reported germanium on silicon: 0.84 A/W (Chin. Phys. B 2015) and 1.09 A/W (Opt. Express 2016) at 1550 nm. At 1310 nm a perfect detector gives at most 1.06 A/W.",
r(fig, ctl) {
  ctl.innerHTML = sl("eta", "Quantum efficiency at 1310 nm", 0.3, 1, 0.01, 0.85) + sl("lam", "Wavelength (nm)", 1250, 1650, 5, 1550) + sl("Lg", "Germanium length (µm)", 2, 40, 1, 10);
  const u = () => {
    const eta0 = +$("eta").value, lam = +$("lam").value / 1000, Lg = +$("Lg").value; $("etav").textContent = eta0.toFixed(2); $("lamv").textContent = (lam * 1000).toFixed(0) + " nm"; $("Lgv").textContent = Lg + " µm";
    const etaAt = l => eta0 * (1 - Math.exp(-geAlpha(l) * Lg * 1e-4 * 0.5)) / (1 - Math.exp(-geAlpha(1.31) * Lg * 1e-4 * 0.5));
    const R = l => PIC.responsivity(Math.min(1, etaAt(l)), l);
    const x0 = 60, w = 560, y0 = 36, h = 160; const ls = range(1.25, 1.65, 161);
    let s = C3.frame(x0, y0, w, h, 1250, 1650, 0, 1.4, [1250, 1350, 1450, 1550, 1650], [0, 0.5, 1], "wavelength (nm)", "responsivity (A/W)", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls.map(l => l * 1000), ls.map(l => l / 1.24), 1250, 1650, 0, 1.4, "var(--b)", 1.5, "4 3") + plot(x0, y0, w, h, ls.map(l => l * 1000), ls.map(R), 1250, 1650, 0, 1.4, PB, 2.5);
    s += `<circle cx="${C3.X(x0, w, 1250, 1650)(lam * 1000)}" cy="${C3.Y(y0, h, 0, 1.4)(R(lam))}" r="6" fill="${PC}"/>` + C3.legend(x0 + 10, y0 + 16, [["η = 1 limit", "var(--b)", "4 3"], ["germanium model", PB]]);
    s += tx(340, 20, `at ${(lam * 1000).toFixed(0)} nm: η = ${Math.min(1, etaAt(lam)).toFixed(2)}, R = ${R(lam).toFixed(2)} A/W`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["eta", "lam", "Lg"].forEach(i => $(i).oninput = u); u();
}},

{s: "3. Bandwidth", t: "Bandwidth: carriers must cross, and the capacitor must charge",
intu: String.raw`Two clocks again. A carrier created in the middle of the absorber must drift to a contact, and at high field it moves at the saturation velocity, about 6 times 10 to the 6 centimetres per second in germanium. A thinner absorber is faster but absorbs less. The junction is also a capacitor that charges through the load, which is the RC time. Drag the width and the capacitance. Both limits must be above the symbol rate, which is 50 to 100 Gbaud in today's links.`,
eq: String.raw`\[ f_{\mathrm{tr}} \approx \frac{0.45\, v_{\mathrm{sat}}}{w}, \qquad f_{RC} = \frac{1}{2\pi R_L C}, \qquad \frac{1}{f_{3\mathrm{dB}}^2} \approx \frac{1}{f_{\mathrm{tr}}^2} + \frac{1}{f_{RC}^2} \]`,
sym: [[String.raw`\(v_{\mathrm{sat}}\)`, "saturation drift velocity, about 6e6 cm/s in germanium"], [String.raw`\(w\)`, "width of the depleted absorber the carriers cross"], [String.raw`\(R_L\)`, "load resistance, typically 50 ohm"], [String.raw`\(C\)`, "junction plus parasitic capacitance, tens of femtofarads"]],
how: ["A carrier generated uniformly across w takes on average half the transit time, and the frequency response of that smeared current gives the 0.45 factor.", "The capacitor and load form a single pole low pass filter.", "Two poles combine roughly as the root sum of squares of the inverse bandwidths.", "A thinner absorber raises the transit bandwidth and lowers the capacitance per area but shortens the absorption path, so detectors are long and thin."],
say: String.raw`Detector bandwidth is set by the carrier transit time across the absorber and by the RC time of the junction, combined as a root sum of squares.`,
num: "w = 0.5 µm, saturation velocity 6e6 cm/s: 54 GHz. C = 20 fF, 50 ohm: 159 GHz. Combined: 51 GHz. A reported Ge detector reaches 42.5 GHz with 1.09 A/W (Opt. Express 2016).",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Absorber width (µm)", 0.2, 2, 0.05, 0.5) + sl("C", "Capacitance (fF)", 5, 100, 5, 20) + sl("RL", "Load (ohm)", 25, 200, 5, 50);
  const u = () => {
    const w = +$("w").value, C = +$("C").value * 1e-15, RL = +$("RL").value; $("wv").textContent = w.toFixed(2) + " µm"; $("Cv").textContent = (C * 1e15).toFixed(0) + " fF"; $("RLv").textContent = RL + " Ω";
    const ftr = 0.45 * 6e6 / (w * 1e-4) / 1e9, frc = 1 / (2 * Math.PI * RL * C) / 1e9, f3 = 1 / Math.sqrt(1 / (ftr * ftr) + 1 / (frc * frc));
    const x0 = 60, ww = 560, y0 = 36, h = 150; const ws = range(0.2, 2, 91);
    let s = C3.frame(x0, y0, ww, h, 0.2, 2, 0, 150, [0.2, 0.5, 1, 1.5, 2], [0, 50, 100, 150], "absorber width (µm)", "bandwidth (GHz)", v => v, v => v);
    s += plot(x0, y0, ww, h, ws, ws.map(v => 0.45 * 6e6 / (v * 1e-4) / 1e9), 0.2, 2, 0, 150, PT, 1.5, "4 3") + plot(x0, y0, ww, h, ws, ws.map(() => frc), 0.2, 2, 0, 150, PC, 1.5, "4 3") + plot(x0, y0, ww, h, ws, ws.map(v => { const a = 0.45 * 6e6 / (v * 1e-4) / 1e9; return 1 / Math.sqrt(1 / (a * a) + 1 / (frc * frc)); }), 0.2, 2, 0, 150, PB, 2.5);
    s += `<circle cx="${C3.X(x0, ww, 0.2, 2)(w)}" cy="${C3.Y(y0, h, 0, 150)(Math.min(150, f3))}" r="6" fill="${PC}"/>` + C3.legend(x0 + 200, y0 + 16, [["transit", PT, "4 3"], ["RC", PC, "4 3"], ["combined", PB]]);
    s += tx(340, 20, `f_tr = ${ftr.toFixed(0)} GHz, f_RC = ${frc.toFixed(0)} GHz, combined ${f3.toFixed(0)} GHz`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["w", "C", "RL"].forEach(i => $(i).oninput = u); u();
}},

{s: "4. Noise", t: "Dark current, shot noise and thermal noise",
intu: String.raw`Even in the dark some current flows, from thermal generation at defects and the dislocations left by growing germanium on silicon. That dark current adds shot noise, and the signal current adds its own shot noise. The load resistor and the amplifier add thermal noise, which usually dominates a PIN receiver. Drag the three sliders and compare the noise currents. The thermal term is why receivers use a transimpedance amplifier with a large feedback resistor rather than a bare 50 ohm load.`,
eq: String.raw`\[ \sigma_{\mathrm{sh}}^2 = 2q\,(I_{\mathrm{ph}} + I_d)\,\Delta f, \qquad \sigma_{\mathrm{th}}^2 = \frac{4 k_B T}{R_L}\,\Delta f \]<div class="eqnote">σ in amperes, Δf the receiver bandwidth</div>`,
sym: [[String.raw`\(I_d\)`, "dark current, 70 nA to a few µA for germanium on silicon"], [String.raw`\(\Delta f\)`, "electrical bandwidth, about 0.7 times the bit rate"], [String.raw`\(k_B T\)`, "thermal energy, 4.1e-21 J at room temperature"], [String.raw`\(R_L\)`, "load or feedback resistance"]],
how: ["Current is a stream of discrete electrons, so its arrival count fluctuates with a variance equal to the mean count, which gives the shot noise formula.", "A resistor's electrons move randomly with thermal energy, which gives the Johnson noise formula.", "Noise powers add, so the total variance is the sum.", "A TIA converts a small current into a large voltage with low noise, effectively raising R without adding RC delay."],
say: String.raw`Receiver noise is the shot noise of photocurrent plus dark current and the thermal noise of the load, and for a PIN receiver the thermal noise usually dominates.`,
num: "Dark current 100 nA, bandwidth 20 GHz: shot noise 25 nA. Load 50 ohm at 20 GHz: thermal noise 2.6 µA. Load 1 kΩ in a TIA: 0.57 µA. Signal of 10 µW at 1 A/W: 10 µA, so Q about 15 at 1 kΩ.",
r(fig, ctl) {
  ctl.innerHTML = sl("Id", "log10 dark current (A)", -9, -5, 0.1, -7) + sl("bw", "Bandwidth (GHz)", 1, 60, 1, 20) + sl("RLn", "Load (ohm)", 50, 5000, 50, 1000) + sl("Pin", "Received power (µW)", 0.5, 100, 0.5, 10);
  const u = () => {
    const Id = Math.pow(10, +$("Id").value), bw = +$("bw").value * 1e9, RL = +$("RLn").value, Pin = +$("Pin").value * 1e-6; $("Idv").textContent = Id.toExponential(1) + " A"; $("bwv").textContent = (bw / 1e9).toFixed(0) + " GHz"; $("RLnv").textContent = RL + " Ω"; $("Pinv").textContent = (Pin * 1e6).toFixed(1) + " µW";
    const Iph = 1.0 * Pin; const ssh = Math.sqrt(2 * PIC.q * (Iph + Id) * bw), sshd = Math.sqrt(2 * PIC.q * Id * bw), sth = Math.sqrt(4 * PIC.kB * 300 / RL * bw); const stot = Math.sqrt(ssh * ssh + sth * sth);
    const bars = [["signal I_ph", Iph, PB], ["shot (signal + dark)", ssh, PP], ["shot (dark only)", sshd, PA], ["thermal", sth, PC], ["total noise", stot, "var(--p)"]];
    const x0 = 160, w = 440, y0 = 30, rh = 30;
    let s = ""; const lmin = -9, lmax = -4;
    bars.forEach(([n, v, c], i) => { const y = y0 + i * (rh + 10); const L = (Math.log10(v) - lmin) / (lmax - lmin) * w; s += tx(x0 - 8, y + 20, n, "end") + `<rect x="${x0}" y="${y}" width="${Math.max(2, L)}" height="${rh}" fill="${c}" opacity="0.8"/>` + tx(x0 + Math.max(2, L) + 6, y + 20, v.toExponential(2) + " A"); });
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + 5 * 40 + 6}" y2="${y0 + 5 * 40 + 6}" stroke="var(--p)"/>`; for (let e = -9; e <= -4; e++) s += tx(x0 + (e - lmin) / (lmax - lmin) * w, y0 + 5 * 40 + 22, "1e" + e, "middle"); s += tx(x0 + w / 2, y0 + 5 * 40 + 38, "amperes, log scale", "middle");
    s += tx(x0 + w, 18, `Q = I_ph / σ_total = ${(Iph / stot).toFixed(1)}`, "end", "th");
    fig.innerHTML = svg(y0 + 5 * 40 + 48, s);
  };
  ["Id", "bw", "RLn", "Pin"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Sensitivity", t: "Sensitivity: the least power that still reads the bits",
intu: String.raw`Turn the noise around. For a target bit error rate you need a certain Q, from Lesson 1. The noise is fixed by the receiver. So the photocurrent, and therefore the optical power, must be at least Q times the noise over the responsivity. That power is the sensitivity, the number the link budget compares against. Drag the target BER, the responsivity and the noise and watch the sensitivity in dBm. Every 3 dB of better sensitivity is 3 dB of margin for the rest of the link.`,
eq: String.raw`\[ \bar P_{\mathrm{sens}} \approx \frac{Q\,\sigma_{\mathrm{th}}}{\mathcal{R}} \quad(\text{OOK, infinite extinction, thermal noise limited}), \qquad \bar P_{\mathrm{sens}} = \frac{Q\,\sigma}{\mathcal{R}}\cdot\frac{r_e + 1}{r_e - 1}\ \text{with finite ER}\]`,
sym: [[String.raw`\(\bar P_{\mathrm{sens}}\)`, "average received power at which the target BER is just met"], [String.raw`\(Q\)`, "quality factor needed for the target BER, 6 for 1e-9, 3.5 for 2.4e-4"], [String.raw`\(\sigma\)`, "noise current standard deviation"], [String.raw`\(r_e\)`, "extinction ratio of the transmitted signal"]],
how: ["With a 1 at power 2 P average and a 0 at zero, the eye opening in current is 2 R P.", "Q is the eye over the sum of the two noise widths, which are equal and thermal here, so Q = 2 R P over 2 sigma.", "Solve for P. A finite extinction ratio wastes power on the zeros and multiplies the requirement by the factor shown.", "Shot noise and amplifier noise add in quadrature if they matter."],
say: String.raw`Sensitivity is the target Q times the noise current over the responsivity, and a finite extinction ratio raises it further.`,
num: "Q = 6, σ = 0.57 µA, R = 1 A/W: 3.4 µW, which is −24.7 dBm. With forward error correction, Q = 3.5 is enough: −27 dBm. A 6 dB extinction ratio adds 2.2 dB.",
r(fig, ctl) {
  ctl.innerHTML = sl("lber", "Target log10 BER", -12, -3, 0.5, -9) + sl("Rr", "Responsivity (A/W)", 0.3, 1.2, 0.05, 1) + sl("sig", "Noise σ (µA)", 0.1, 5, 0.1, 0.57) + sl("er", "Extinction ratio (dB)", 3, 20, 0.5, 10);
  const u = () => {
    const lber = +$("lber").value, R = +$("Rr").value, sig = +$("sig").value * 1e-6, er = +$("er").value; $("lberv").textContent = "1e" + lber; $("Rrv").textContent = R.toFixed(2) + " A/W"; $("sigv").textContent = (sig * 1e6).toFixed(2) + " µA"; $("erv").textContent = er + " dB";
    // invert BER(Q) by bisection
    let lo = 0, hi = 10; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Math.log10(PIC.ber(m)) > lber) lo = m; else hi = m; } const Q = (lo + hi) / 2;
    const re = PIC.fromdB(er); const Ps = Q * sig / R * (re + 1) / (re - 1); const Psd = PIC.dBm(Ps * 1e3);
    const x0 = 60, w = 560, y0 = 36, h = 150; const qs = range(1, 9, 81);
    let s = C3.frame(x0, y0, w, h, 1, 9, -35, -10, [1, 3, 5, 7, 9], [-35, -30, -25, -20, -15, -10], "required Q", "sensitivity (dBm)", v => v, v => v);
    s += plot(x0, y0, w, h, qs, qs.map(q => PIC.dBm(q * sig / R * (re + 1) / (re - 1) * 1e3)), 1, 9, -35, -10, PB, 2.5) + `<circle cx="${C3.X(x0, w, 1, 9)(Q)}" cy="${C3.Y(y0, h, -35, -10)(Math.max(-35, Math.min(-10, Psd)))}" r="6" fill="${PC}"/>`;
    s += tx(340, 20, `BER 1e${lber} needs Q = ${Q.toFixed(2)}, sensitivity ${Psd.toFixed(1)} dBm (${(Ps * 1e6).toFixed(2)} µW)`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["lber", "Rr", "sig", "er"].forEach(i => $(i).oninput = u); u();
}},

{s: "6. BER vs power", t: "The waterfall: bit error rate against received power",
intu: String.raw`Plot the error rate against the power arriving at the detector and you get a waterfall. Above the sensitivity the errors vanish fast, every extra dB cutting the error rate by orders of magnitude. Below it the link is useless. Drag the received power, which is what the link budget of Lesson 1 delivers, and watch the eye and the error rate together. The flat floor at low power is where the noise fully closes the eye. Forward error correction moves the usable point from 1e-12 up to 2.4e-4, which is worth several dB of budget.`,
eq: String.raw`\[ Q(\bar P) = \frac{2\mathcal{R}\bar P}{2\sigma}\cdot\frac{r_e - 1}{r_e + 1}, \qquad \mathrm{BER}(\bar P) = \tfrac{1}{2}\operatorname{erfc}\!\left(\frac{Q(\bar P)}{\sqrt 2}\right) \]`,
sym: [[String.raw`\(\bar P\)`, "average received power"], [String.raw`\(\mathcal{R}\)`, "responsivity"], [String.raw`\(\sigma\)`, "noise current, taken equal on both levels"], ["FEC threshold", "the BER the error correction can clean up, 2.4e-4 in 800G and 1.6T Ethernet"]],
how: ["Combine the sensitivity relation with the BER formula of Lesson 1.", "Q grows linearly with power, and the erfc tail then falls faster than any power law.", "In dB, the waterfall is steep: from 1e-3 to 1e-12 takes only about 4 dB of extra power.", "The link budget margin is the horizontal distance between the delivered power and the sensitivity on this plot."],
say: String.raw`The bit error rate falls off a cliff above the sensitivity because Q grows linearly with power and the Gaussian tail shrinks faster than exponentially.`,
num: "σ = 0.57 µA, R = 1 A/W, ER 10 dB: BER 1e-3 at −26.5 dBm, 1e-9 at −23.6 dBm, 1e-12 at −23.0 dBm. The FEC threshold of 2.4e-4 sits at about −25.4 dBm.",
r(fig, ctl) {
  ctl.innerHTML = sl("Prx", "Received power (dBm)", -32, -14, 0.1, -24) + sl("sig2", "Noise σ (µA)", 0.1, 3, 0.05, 0.57);
  const R = 1, re = 10;
  PIC.player(ctl, (tsec) => {
    const Prx = +$("Prx").value, sig = +$("sig2").value * 1e-6; $("Prxv").textContent = Prx.toFixed(1) + " dBm"; $("sig2v").textContent = (sig * 1e6).toFixed(2) + " µA";
    const Qof = p => R * PIC.fromdBm(p) * 1e-3 / sig * (re - 1) / (re + 1);
    const x0 = 60, w = 380, y0 = 36, h = 160; const ps = range(-32, -14, 181);
    let s = C3.frame(x0, y0, w, h, -32, -14, -15, 0, [-32, -26, -20, -14], [-15, -12, -9, -6, -3, 0], "received power (dBm)", "log10 BER", v => v, v => v);
    s += plot(x0, y0, w, h, ps, ps.map(p => Math.max(-15, Math.log10(PIC.ber(Qof(p))))), -32, -14, -15, 0, PB, 2.5);
    const fec = Math.log10(2.4e-4); s += `<line x1="${x0}" x2="${x0 + w}" y1="${C3.Y(y0, h, -15, 0)(fec)}" y2="${C3.Y(y0, h, -15, 0)(fec)}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(x0 + w - 4, C3.Y(y0, h, -15, 0)(fec) - 5, "FEC threshold 2.4e-4", "end");
    const Q = Qof(Prx), ber = PIC.ber(Q); s += `<circle cx="${C3.X(x0, w, -32, -14)(Prx)}" cy="${C3.Y(y0, h, -15, 0)(Math.max(-15, Math.log10(ber)))}" r="6" fill="${PC}"/>`;
    // eye at the right
    const ex = 480, ew = 150, ey = y0, eh = h; s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="var(--sunk)" stroke="var(--b)"/>`;
    const sgn = 1 / (2 * Math.max(Q, 0.3)); const rng = C3.rng(5 + Math.floor(tsec * 4));
    for (let i = 0; i < 40; i++) { const b = i % 2; let u1 = 0, u2 = 0; while (u1 === 0) u1 = rng(); u2 = rng(); const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); const v = b + sgn * g; s += `<circle cx="${(ex + 10 + (i * 37 % (ew - 20))).toFixed(1)}" cy="${(ey + eh - 20 - Math.max(-0.3, Math.min(1.3, v)) * (eh - 40)).toFixed(1)}" r="3" fill="${b ? PB : PT}"/>`; }
    s += tx(ex + ew / 2, ey + eh + 16, "eye samples at this power", "middle");
    s += tx(340, 20, `${Prx.toFixed(1)} dBm: Q = ${Q.toFixed(1)}, BER = ${ber < 1e-15 ? "below 1e-15" : ber.toExponential(1)}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}}
],
summary: String.raw`A germanium on silicon PIN detector absorbs the light the silicon cannot, and a reverse bias sweeps the carriers out as photocurrent. Responsivity is quantum efficiency times wavelength over 1.24 in amperes per watt, about 1 A/W at 1550 nm. Bandwidth is set by the carrier transit time, 0.45 times saturation velocity over absorber width, combined with the RC time. The noise is the shot noise of photocurrent and dark current plus the thermal noise of the load, and a transimpedance amplifier keeps the thermal term small. Sensitivity is Q times the noise over the responsivity, raised by a finite extinction ratio, and the bit error rate falls like a waterfall above it.`,
sheet: [
[String.raw`\[ \mathcal{R} = \frac{\eta q\lambda}{hc} = \frac{\eta\,\lambda[\mathrm{µm}]}{1.24}\ \mathrm{A/W} \]`, "Responsivity"],
[String.raw`\[ f_{\mathrm{tr}} \approx \frac{0.45 v_{\mathrm{sat}}}{w}, \quad f_{RC} = \frac{1}{2\pi R_L C} \]`, "Transit and RC bandwidth"],
[String.raw`\[ \sigma_{\mathrm{sh}}^2 = 2q(I_{\mathrm{ph}} + I_d)\Delta f, \quad \sigma_{\mathrm{th}}^2 = \frac{4k_BT}{R_L}\Delta f \]`, "Shot and thermal noise"],
[String.raw`\[ \bar P_{\mathrm{sens}} \approx \frac{Q\sigma}{\mathcal{R}}\cdot\frac{r_e + 1}{r_e - 1} \]`, "Sensitivity with finite extinction ratio"],
[String.raw`\[ \mathrm{BER}(\bar P) = \tfrac{1}{2}\operatorname{erfc}\!\left(\frac{Q(\bar P)}{\sqrt 2}\right) \]`, "Waterfall curve"]],
consts: String.raw`\(q = 1.602\times10^{-19}\) C, \(k_BT = 4.14\times10^{-21}\) J at 300 K, \(v_{\mathrm{sat}}(\mathrm{Ge}) \approx 6\times10^{6}\) cm/s. The germanium absorption curve is an illustrative model of the band edge near 1.6 µm.`,
sources: ["G. P. Agrawal, Fiber-Optic Communication Systems, 4th ed., Wiley (2010), Ch. 4 (photodetectors, noise, sensitivity)", "J. Michel, J. Liu and L. C. Kimerling, High-performance Ge-on-Si photodetectors, Nat. Photon. 4, 527 (2010)", "Chin. Phys. B 24, 038502 (2015): Ge on Si detector, 0.842 A/W at 1550 nm, 70 nA dark current at 1 V", "Opt. Express 24, 27738 (2016): Ge on Si detector, 1.09 A/W, 42.5 GHz, 3.5 µA at 2 V", "N. Li et al., High saturation current InGaAs/InP uni-travelling-carrier photodiode, IEEE Photon. Technol. Lett. 16, 864 (2004)", "IEEE P802.3dj, pre-FEC BER limit 2.4e-4"]
});
})();
