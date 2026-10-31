(function () {
/* Part 1 Lesson 6: silicon modulators. Soref-Bennett computed with PIC.sorefDn and PIC.sorefDa, ring spectra with PIC.ringAllPass. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const LAM = 1.55;

addLesson("pic", "basics", {
level: "Core",
id: "pic-basics-l6", title: "Modulators: writing bits onto light with free carriers", short: "6. Modulators",
big: String.raw`Silicon has no useful electro-optic effect, so a silicon modulator changes the refractive index by changing the number of free electrons and holes in the waveguide. Soref and Bennett measured how much in 1987, and every silicon modulator since uses their curves. Push carriers out of a pn junction with a reverse bias and the index rises a little, the light gets a phase shift, and an interferometer turns that phase shift into a change of power. A Mach-Zehnder does it with two long arms. A ring does it in a few micrometres by moving a resonance across the laser line. This lesson computes the plasma dispersion effect live, drives an animated Mach-Zehnder and a ring, and works out the figures of merit that limit speed.`,
bridge: String.raw`The index and absorption fits are those of Soref and Bennett, IEEE J. Quantum Electron. 23, 123 (1987), at 1550 nm. The ring modulator physics follows from Lesson 5. The VπL figure of merit, the RC and photon lifetime limits, and the lane rates are standard interconnect numbers, with the depletion diode value of 2.6 V mm from the Sacher and Poon multilayer platform (CLEO 2016) as one measured datapoint.`,
cards: [

{s: "1. Plasma dispersion", t: "Free carriers lower the index and raise the loss",
intu: String.raw`Add free carriers to silicon and two things happen. The refractive index drops, by about a thousandth at 10 to the 18 per cubic centimetre, and the material absorbs more. Holes do slightly more to the index per carrier than electrons, which is why many modulators use p type material. Drag the two carrier densities on the logarithmic sliders and read the index change and the extra loss. The index change is tiny, so a modulator needs either millimetres of length or a resonator.`,
eq: String.raw`\[ \Delta n = -\left[8.8\times10^{-22}\,\Delta N_e + 8.5\times10^{-18}\,(\Delta N_h)^{0.8}\right] \]\[ \Delta\alpha\,[\mathrm{cm^{-1}}] = 8.5\times10^{-18}\,\Delta N_e + 6.0\times10^{-18}\,\Delta N_h \]<div class="eqref">Soref and Bennett 1987, 1550 nm, densities in cm⁻³</div>`,
sym: [[String.raw`\(\Delta N_e, \Delta N_h\)`, "change in electron and hole density, per cubic centimetre"], [String.raw`\(\Delta n\)`, "change of refractive index, negative when carriers are added"], [String.raw`\(\Delta\alpha\)`, "change of absorption, per centimetre"]],
how: ["Free carriers respond to the light field like a plasma. The Drude model gives an index change proportional to the carrier density and the inverse mass.", "The absorption comes from scattering of the carriers, also proportional to density.", "Soref and Bennett fitted measured data. The hole term has a power of 0.8 rather than 1, which is why holes are more effective at low density.", "Removing carriers from a doped region, depletion, raises the index and lowers the loss by the same amounts."],
say: String.raw`Adding free carriers lowers silicon's index by about a thousandth per ten to the eighteen per cubic centimetre and adds absorption, following the Soref and Bennett fits.`,
num: "ΔN = 1e18 holes: Δn = −1.4e-3, Δα = 6 per cm, or 26 dB/cm. 1e17 holes: Δn = −2.3e-4, Δα = 0.6 per cm. Electrons at 1e18: Δn = −8.8e-4.",
r(fig, ctl) {
  ctl.innerHTML = sl("le", "log10 electrons (cm⁻³)", 16, 19, 0.05, 17.5) + sl("lh", "log10 holes (cm⁻³)", 16, 19, 0.05, 17.5);
  const u = () => {
    const Ne = Math.pow(10, +$("le").value), Nh = Math.pow(10, +$("lh").value); $("lev").textContent = Ne.toExponential(1); $("lhv").textContent = Nh.toExponential(1);
    const dn = PIC.sorefDn(Ne, Nh), da = PIC.sorefDa(Ne, Nh);
    const x0 = 60, w = 250, y0 = 36, h = 160; const xs = range(16, 19, 61);
    let s = C3.frame(x0, y0, w, h, 16, 19, -4, -1, [16, 17, 18, 19], [-4, -3, -2, -1], "log10 density (cm⁻³)", "log10 |Δn|", v => v, v => v);
    s += plot(x0, y0, w, h, xs, xs.map(v => Math.log10(-PIC.sorefDn(Math.pow(10, v), 0))), 16, 19, -4, -1, PB, 2.5) + plot(x0, y0, w, h, xs, xs.map(v => Math.log10(-PIC.sorefDn(0, Math.pow(10, v)))), 16, 19, -4, -1, PC, 2.5);
    s += C3.legend(x0 + 10, y0 + 16, [["electrons", PB], ["holes", PC]]);
    const x1 = 400; s += C3.frame(x1, y0, w, h, 16, 19, -2, 2, [16, 17, 18, 19], [-2, -1, 0, 1, 2], "log10 density (cm⁻³)", "log10 Δα (cm⁻¹)", v => v, v => v);
    s += plot(x1, y0, w, h, xs, xs.map(v => Math.log10(PIC.sorefDa(Math.pow(10, v), 0))), 16, 19, -2, 2, PB, 2.5) + plot(x1, y0, w, h, xs, xs.map(v => Math.log10(PIC.sorefDa(0, Math.pow(10, v)))), 16, 19, -2, 2, PC, 2.5);
    fig.innerHTML = svg(y0 + h + 40, s);
    ctl.querySelector("#ro") && ctl.querySelector("#ro").remove();
    ctl.insertAdjacentHTML("beforeend", `<div id="ro">${PIC.readout([["Δn", dn.toExponential(2)], ["Δα", da.toFixed(2) + " cm⁻¹"], ["extra loss", (4.343 * da).toFixed(1) + " dB/cm"]])}</div>`);
  };
  $("le").oninput = u; $("lh").oninput = u; u();
}},

{s: "2. Phase shifter", t: "The phase shifter: how long for a pi shift",
intu: String.raw`A phase shift of pi flips the light from adding to cancelling in an interferometer. The length needed is the wavelength over twice the index change, times a factor for how much of the mode overlaps the carriers. With a thousandth of index change that is close to a millimetre. Drag the carrier swing and the overlap and watch the required length and the loss you pay for it. Play shows the phase front sliding along the arm.`,
eq: String.raw`\[ \Delta\phi = \frac{2\pi}{\lambda}\,\Gamma\,\Delta n\, L, \qquad L_\pi = \frac{\lambda}{2\,\Gamma\,|\Delta n|} \]`,
sym: [[String.raw`\(\Delta\phi\)`, "phase change of the guided mode"], [String.raw`\(\Gamma\)`, "overlap of the optical mode with the region where carriers change, 0.3 to 1"], [String.raw`\(L_\pi\)`, "length for a phase shift of pi"]],
how: ["The phase of a guided wave is the effective index times the length times two pi over the wavelength.", "The effective index change is the material index change weighted by the mode overlap.", String.raw`Set the phase change to pi and solve for \(L\).`],
say: String.raw`The pi length is the wavelength over twice the overlap weighted index change, about a millimetre for a depletion modulator.`,
num: String.raw`Δn = 1e-3, Γ = 0.5: \(L_\pi\) = 1.55 mm. Δn = 5e-4, Γ = 0.3: 5.2 mm, which is why depletion MZMs are 1 to 3 mm long. Injection modulators reach 1e-2 but are slow.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lN", "log10 hole swing (cm⁻³)", 16.5, 18.5, 0.05, 17.8) + sl("G", "Mode overlap Γ", 0.1, 1, 0.05, 0.5);
  PIC.player(ctl, (tsec) => {
    const N = Math.pow(10, +$("lN").value), G = +$("G").value; $("lNv").textContent = N.toExponential(1); $("Gv").textContent = G.toFixed(2);
    const dn = -PIC.sorefDn(0, N), Lpi = LAM / (2 * G * dn), loss = 4.343 * PIC.sorefDa(0, N) * G * Lpi * 1e-4;
    const x0 = 40, w = 600, yc = 110;
    let s = tx(340, 20, `L_π = ${(Lpi / 1000).toFixed(2)} mm, loss over L_π ${loss.toFixed(2)} dB`, "middle", "th");
    s += `<rect x="${x0}" y="${yc - 12}" width="${w}" height="24" fill="${PB}" opacity="0.25"/>` + tx(x0, yc - 20, "phase shifter arm, length L_π") + tx(x0 + w, yc - 20, `${(Lpi / 1000).toFixed(2)} mm`, "end");
    // phase fronts: unshifted (gray) and shifted (red), the shifted ones lag more and more
    const n = 16; for (let i = 0; i < n; i++) { const ph = ((tsec * 0.2 + i / n) % 1); const x = x0 + ph * w; s += `<line x1="${x.toFixed(1)}" y1="${yc - 10}" x2="${x.toFixed(1)}" y2="${yc + 10}" stroke="var(--p)" stroke-width="1.5" opacity="0.5"/>`; const xs = x - ph * (w / n) * 0.5; s += `<line x1="${xs.toFixed(1)}" y1="${yc + 20}" x2="${xs.toFixed(1)}" y2="${yc + 40}" stroke="${PC}" stroke-width="2"/>`; }
    s += tx(x0, yc + 56, "gray: phase fronts with no carriers. red: with carriers removed, the fronts gain half a wavelength by the end");
    fig.innerHTML = svg(180, s);
  });
}},

{s: "3. Mach-Zehnder", t: "The Mach-Zehnder modulator: phase into power",
intu: String.raw`Split the light into two arms, shift the phase in one, recombine. Where the arms agree the light adds and exits bright. Where they are pi apart it cancels. The output power follows a cosine squared of half the phase difference. Press Play: the bit stream drives the arm voltage, the dot on the transfer curve jumps between the two states, and the output pulses appear at the right. Drag the swing to see what happens when the drive does not reach a full pi.`,
eq: String.raw`\[ \frac{P_{\mathrm{out}}}{P_{\mathrm{in}}} = \cos^2\!\left(\frac{\Delta\phi}{2}\right) = \cos^2\!\left(\frac{\pi}{2}\frac{V}{V_\pi}\right) \]`,
sym: [[String.raw`\(\Delta\phi\)`, "phase difference between the arms"], [String.raw`\(V_\pi\)`, "voltage that gives a phase difference of pi"], [String.raw`\(V\)`, "applied drive voltage"]],
how: ["Each arm carries half the field. After the phase shift the fields are 1 and exp of i delta phi, each times root half.", "Add them and take the modulus squared.", "The identity 1 plus cos equals 2 cos squared of the half angle gives the result.", "Biasing at the quadrature point, half power, gives a linear response for analog signals. Digital links drive between the peak and the null."],
say: String.raw`A Mach-Zehnder modulator turns a phase difference into power through cosine squared of half the phase, so a pi swing switches the output fully.`,
num: "Vπ 4 V with a 1.5 mm arm, drive 2 V peak to peak from the null: extinction ratio about 8 dB. Full Vπ swing: above 20 dB in principle, 10 to 15 dB in practice.",
r(fig, ctl) {
  ctl.innerHTML = sl("sw", "Drive swing (fraction of Vπ)", 0.2, 1, 0.02, 0.8);
  const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0];
  PIC.player(ctl, (tsec) => {
    const sw = +$("sw").value; $("swv").textContent = sw.toFixed(2);
    const T = v => Math.pow(Math.cos(Math.PI / 2 * v), 2);
    const k = Math.floor(tsec * 2) % bits.length; const bit = bits[k]; const v = 1 - sw * bit;   // V/Vpi: null at 1 for a 0, bright for a 1
    const x0 = 60, w = 240, y0 = 36, h = 150; const vs = range(0, 2, 101);
    let s = C3.frame(x0, y0, w, h, 0, 2, 0, 1, [0, 0.5, 1, 1.5, 2], [0, 0.5, 1], "V / Vπ", "P out / P in", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, vs, vs.map(T), 0, 2, 0, 1, PB, 2.5) + `<circle cx="${C3.X(x0, w, 0, 2)(v)}" cy="${C3.Y(y0, h, 0, 1)(T(v))}" r="7" fill="${PC}"/>`;
    // MZI drawing
    const mx = 340, my = y0 + 40; s += `<path d="M${mx} ${my + 40} L${mx + 30} ${my + 40} L${mx + 60} ${my} L${mx + 160} ${my} L${mx + 190} ${my + 40} L${mx + 220} ${my + 40}" fill="none" stroke="${PB}" stroke-width="5" opacity="0.5"/><path d="M${mx + 30} ${my + 40} L${mx + 60} ${my + 80} L${mx + 160} ${my + 80} L${mx + 190} ${my + 40}" fill="none" stroke="${PB}" stroke-width="5" opacity="0.5"/>`;
    s += `<rect x="${mx + 70}" y="${my - 16}" width="80" height="12" fill="${bit ? PT : PC}"/>` + tx(mx + 110, my - 22, `V = ${(v).toFixed(2)} Vπ`, "middle") + tx(mx + 110, my + 100, "phase shifter in the upper arm", "middle");
    // output pulses
    const ox = mx + 230; for (let i = 0; i < 8; i++) { const b = bits[(k - i + bits.length * 2) % bits.length]; const p = T(1 - sw * b); s += `<rect x="${ox + i * 10}" y="${my + 40 - 30 * p}" width="8" height="${30 * p}" fill="${PA}"/>`; }
    s += tx(ox + 40, my + 60, "output", "middle");
    s += tx(340, 20, `bit ${bit}: output ${(100 * T(v)).toFixed(0)} %. Extinction ratio ${(() => { const er = -PIC.dB(Math.max(T(1), 1e-3) / T(1 - sw)); return er >= 30 ? "above 30" : er.toFixed(1); })()} dB`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "4. VπL", t: "The figure of merit: Vπ times L",
intu: String.raw`A shorter modulator needs more voltage, a longer one less, and their product is nearly constant for a given junction design. That product, Vπ times L, is the number you compare modulators by. Depletion junctions in silicon sit at 1 to 2.5 volt centimetres. Drag the length and see the voltage the driver must supply and the loss the light pays. CMOS drivers like to stay near 1 volt, which pushes toward long arms or toward rings.`,
eq: String.raw`\[ V_\pi L = \text{const}, \qquad V_\pi = \frac{V_\pi L}{L}, \qquad \text{loss} = \alpha_{\mathrm{dB/cm}}\, L \]`,
sym: [[String.raw`\(V_\pi L\)`, "figure of merit of the phase shifter, volt centimetres, lower is better"], [String.raw`\(\alpha_{\mathrm{dB/cm}}\)`, "loss of the doped waveguide, 1 to 3 dB/cm from the carriers alone"]],
how: ["The phase shift is proportional to the index change times the length.", "In a reverse biased junction the depletion width, and so the index change, grows roughly with the root of the voltage, so the product is only approximately constant.", "A longer arm costs more loss and more capacitance, which slows the device."],
say: String.raw`Vπ times L is roughly constant for a junction design, so the designer trades drive voltage against arm length, loss and capacitance.`,
num: "Depletion silicon MZM: VπL 1 to 2.5 V cm, so a 2 mm arm needs 5 to 12 V. Sacher and Poon multilayer platform diode: 2.6 V mm, which is 0.26 V cm. Lithium niobate: about 2 V cm but with far lower loss.",
r(fig, ctl) {
  ctl.innerHTML = sl("vpl", "VπL (V cm)", 0.2, 3, 0.05, 1.5) + sl("L", "Arm length (mm)", 0.2, 5, 0.1, 2) + sl("al", "Doped waveguide loss (dB/cm)", 0.5, 5, 0.1, 2);
  const u = () => {
    const vpl = +$("vpl").value, L = +$("L").value, al = +$("al").value; $("vplv").textContent = vpl.toFixed(2) + " V cm"; $("Lv").textContent = L.toFixed(1) + " mm"; $("alv").textContent = al.toFixed(1) + " dB/cm";
    const Vpi = vpl / (L / 10), loss = al * L / 10;
    const x0 = 60, w = 560, y0 = 36, h = 150; const Ls = range(0.2, 5, 97);
    let s = C3.frame(x0, y0, w, h, 0, 5, 0, 15, [0, 1, 2, 3, 4, 5], [0, 5, 10, 15], "arm length (mm)", "Vπ (V)", v => v, v => v);
    s += plot(x0, y0, w, h, Ls, Ls.map(l => vpl / (l / 10)), 0, 5, 0, 15, PB, 2.5) + `<circle cx="${C3.X(x0, w, 0, 5)(L)}" cy="${C3.Y(y0, h, 0, 15)(Math.min(15, Vpi))}" r="6" fill="${PC}"/>`;
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${C3.Y(y0, h, 0, 15)(1)}" y2="${C3.Y(y0, h, 0, 15)(1)}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(x0 + w - 4, C3.Y(y0, h, 0, 15)(1) - 5, "CMOS friendly drive, about 1 V", "end");
    s += tx(340, 20, `Vπ = ${Vpi.toFixed(1)} V, arm loss ${loss.toFixed(2)} dB`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["vpl", "L", "al"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Ring modulator", t: "The ring modulator: move the dip, not the light",
intu: String.raw`Put the pn junction inside a ring. A tiny index change shifts the resonance by a few tens of picometres, and if the laser sits on the slope of the dip, that shift switches the output from dark to bright. The ring is a few micrometres across and needs only a fraction of a volt. Play the animation: the bits move the dip back and forth across the fixed laser line. Drag the detuning to find the best laser position and the shift to see how far a real junction moves the resonance.`,
eq: String.raw`\[ \Delta\lambda_{\mathrm{res}} = \lambda\,\frac{\Gamma\,\Delta n}{n_g}, \qquad \text{for a deep dip you want } \Delta\lambda_{\mathrm{res}} \approx \mathrm{FWHM} \]`,
sym: [[String.raw`\(\Delta\lambda_{\mathrm{res}}\)`, "shift of the resonance wavelength"], [String.raw`\(\Gamma\Delta n\)`, "overlap weighted index change from the junction"], [String.raw`\(n_g\)`, "group index"], ["detuning", "distance of the laser from the unshifted resonance"]],
how: ["Differentiate the resonance condition at fixed order m, exactly as for the thermal drift in Lesson 5.", "A shift of about one linewidth takes the laser from the dip bottom to the shoulder.", "A high Q makes the dip narrow, so a smaller shift suffices, but the photon lifetime then slows the response.", "Rings need a heater and feedback to stay aligned with the laser, which costs some of the power they save."],
say: String.raw`A ring modulator shifts its resonance by the overlap weighted index change over the group index, so a laser parked on the slope sees a large change in power.`,
num: "Γ Δn = 3e-4, group index 4.2: shift 110 pm. A ring with Q 5000 has a FWHM of 310 pm, so a 1 V swing gives a few dB of extinction. Nvidia's 2025 co-packaged engines use microring modulators.",
r(fig, ctl) {
  ctl.innerHTML = sl("det", "Laser detuning (pm)", -300, 300, 5, 60) + sl("sh", "Resonance shift per bit (pm)", 0, 300, 5, 110);
  const bits = [1, 0, 1, 1, 0, 1, 0, 0];
  PIC.player(ctl, (tsec) => {
    const det = +$("det").value / 1000, sh = +$("sh").value / 1000; $("detv").textContent = (det * 1000).toFixed(0) + " pm"; $("shv").textContent = (sh * 1000).toFixed(0) + " pm";
    const k = Math.floor(tsec * 2) % bits.length; const bit = bits[k]; const shift = bit * sh;
    const r = 0.985, a = 0.993, L = 2 * Math.PI * 5, NG = 4.2, NEFF = 2.4;
    const ph = lam => 2 * Math.PI * L * (NEFF - NG * (lam - 1.55) / 1.55) / lam; const ph0 = ph(1.55), phR = 2 * Math.PI * Math.round(ph0 / (2 * Math.PI));
    const T = (lam) => PIC.ringAllPass(r, a, ph(lam) - ph0 + phR);
    // find the resonance nearest 1550 by scanning
    const x0 = 60, w = 400, y0 = 36, h = 150; const ls = range(1549, 1551, 401);
    const base = ls.map(l => T(l / 1000)); let imin = 0; base.forEach((v, i) => { if (v < base[imin]) imin = i; }); const lres = ls[imin];
    const Ts = l => T((l - shift) / 1000);
    let s = C3.frame(x0, y0, w, h, 1549, 1551, 0, 1, [1549, 1550, 1551], [0, 0.5, 1], "wavelength (nm)", "T", v => v, v => v.toFixed(1));
    s += plot(x0, y0, w, h, ls, ls.map(Ts), 1549, 1551, 0, 1, bit ? PT : PB, 2.5) + plot(x0, y0, w, h, ls, base, 1549, 1551, 0, 1, "var(--b)", 1, "3 3");
    const lasL = lres + det; const xl = C3.X(x0, w, 1549, 1551)(lasL); s += `<line x1="${xl}" x2="${xl}" y1="${y0}" y2="${y0 + h}" stroke="${PC}" stroke-width="2"/>` + tx(xl + 6, y0 + 14, "laser");
    const T0 = Ts(lasL);
    const ox = 500; for (let i = 0; i < 8; i++) { const b = bits[(k - i + 16) % 8]; const p = T((lasL - b * sh) / 1000); s += `<rect x="${ox + i * 14}" y="${y0 + h - h * p}" width="11" height="${h * p}" fill="${PA}"/>`; } s += tx(ox + 56, y0 + h + 16, "output bits", "middle");
    const T1 = T((lasL - sh) / 1000), Tz = T(lasL / 1000);
    s += tx(340, 20, `bit ${bit}: T = ${T0.toFixed(2)}. Extinction ${Math.abs(PIC.dB(T1) - PIC.dB(Tz)).toFixed(1)} dB, insertion loss on the 1 ${(-PIC.dB(Math.max(T1, Tz))).toFixed(1)} dB`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "6. Bandwidth", t: "What limits the speed: RC and the photon lifetime",
intu: String.raw`Two clocks limit a modulator. The junction is a capacitor charged through a resistance, and its RC time sets how fast the carriers move. A ring also has a photon lifetime, the time light takes to leak out, so its resonance cannot move faster than that. Drag the junction values and the ring Q. A 50 GHz modulator needs an RC time under about 3 ps and, for a ring, a Q below about 5000. The two limits combine as the root sum of squares of the inverse bandwidths.`,
eq: String.raw`\[ f_{RC} = \frac{1}{2\pi R C}, \qquad f_{\mathrm{ph}} = \frac{1}{2\pi\tau_{\mathrm{ph}}} = \frac{c}{\lambda\, Q_L}, \qquad \frac{1}{f_{3\mathrm{dB}}^2} \approx \frac{1}{f_{RC}^2} + \frac{1}{f_{\mathrm{ph}}^2} \]`,
sym: [[String.raw`\(R\)`, "series resistance of the junction, 50 to 200 ohm for a ring"], [String.raw`\(C\)`, "junction capacitance, 10 to 50 fF for a ring, 0.2 to 0.5 pF per mm for an MZM"], [String.raw`\(\tau_{\mathrm{ph}} = Q_L\lambda/(2\pi c)\)`, "photon lifetime in the ring"]],
how: ["A step of voltage charges the junction with an exponential of time constant RC, which is a single pole low pass filter.", "The stored light in a ring decays with the photon lifetime, another single pole.", "Two cascaded single poles give a 3 dB bandwidth close to the root sum of squares rule.", "Travelling wave MZMs escape the lumped RC limit by matching the electrical and optical velocities."],
say: String.raw`Modulator bandwidth is limited by the junction RC time and, for a ring, by the photon lifetime set by its loaded Q.`,
num: "R = 100 ohm, C = 20 fF: 80 GHz. Q = 5000 at 1550 nm: 39 GHz. Combined: 35 GHz. Lane rates in 2025 products: 100 to 200 Gb/s with PAM4 at 50 to 100 Gbaud.",
r(fig, ctl) {
  ctl.innerHTML = sl("Rr", "R (ohm)", 20, 500, 10, 100) + sl("Cc", "C (fF)", 5, 200, 5, 20) + sl("Q", "Loaded Q", 1000, 30000, 500, 5000);
  const u = () => {
    const R = +$("Rr").value, C = +$("Cc").value * 1e-15, Q = +$("Q").value; $("Rrv").textContent = R + " Ω"; $("Ccv").textContent = (C * 1e15).toFixed(0) + " fF"; $("Qv").textContent = Q;
    const fRC = 1 / (2 * Math.PI * R * C) / 1e9, fph = PIC.c / (1.55e-6 * Q) / 1e9, f3 = 1 / Math.sqrt(1 / (fRC * fRC) + 1 / (fph * fph));
    const x0 = 60, w = 560, y0 = 36, h = 150; const fs = range(0, 2.3, 100);   // log10 GHz from 1 to 200
    const resp = f => -10 * Math.log10(1 + Math.pow(f / fRC, 2)) - 10 * Math.log10(1 + Math.pow(f / fph, 2));
    let s = C3.frame(x0, y0, w, h, 0, 2.3, -12, 0, [0, 1, 2], [-12, -9, -6, -3, 0], "frequency (GHz, log scale: 1, 10, 100)", "response (dB)", v => Math.pow(10, v).toFixed(0), v => v);
    s += plot(x0, y0, w, h, fs, fs.map(v => resp(Math.pow(10, v))), 0, 2.3, -12, 0, PB, 2.5) + plot(x0, y0, w, h, fs, fs.map(v => -10 * Math.log10(1 + Math.pow(Math.pow(10, v) / fRC, 2))), 0, 2.3, -12, 0, PT, 1.5, "4 3") + plot(x0, y0, w, h, fs, fs.map(v => -10 * Math.log10(1 + Math.pow(Math.pow(10, v) / fph, 2))), 0, 2.3, -12, 0, PC, 1.5, "4 3");
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${C3.Y(y0, h, -12, 0)(-3)}" y2="${C3.Y(y0, h, -12, 0)(-3)}" stroke="var(--b)" stroke-dasharray="2 3"/>`;
    s += C3.legend(x0 + 10, y0 + h - 8, [["combined", PB], ["RC only", PT, "4 3"], ["photon lifetime only", PC, "4 3"]]);
    s += tx(340, 20, `f_RC = ${fRC.toFixed(0)} GHz, f_ph = ${fph.toFixed(0)} GHz, combined 3 dB ${f3.toFixed(0)} GHz`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["Rr", "Cc", "Q"].forEach(i => $(i).oninput = u); u();
}},

{s: "7. PAM4", t: "PAM4: two bits per symbol and the price in eye height",
intu: String.raw`To double the bit rate without doubling the bandwidth, send four power levels instead of two. Each symbol then carries two bits. The cost is that the three eyes between the four levels are each a third of the height of the single NRZ eye, so the same noise causes far more errors. Links accept that and clean up with forward error correction. Play the animation and drag the noise to see the three eyes close.`,
eq: String.raw`\[ \text{bit rate} = 2 \times \text{symbol rate}, \qquad \text{eye height}_{\mathrm{PAM4}} = \frac{1}{3}\,\text{eye height}_{\mathrm{NRZ}} \;\Rightarrow\; \text{SNR penalty} \approx 9.5\ \mathrm{dB} \]`,
sym: [["NRZ", "non return to zero, two levels, one bit per symbol"], ["PAM4", "four level pulse amplitude modulation, two bits per symbol"], ["symbol rate", "symbols per second, in baud"]],
how: ["Four equally spaced levels between the same minimum and maximum leave three gaps of one third.", "Q scales with eye height, so each eye has one third the Q, a power penalty of 20 log of 3, about 9.5 dB.", "In exchange the symbol rate halves, which relaxes the modulator, detector and electronics bandwidth.", "Gray coding of the levels keeps most errors to single bit errors that FEC fixes."],
say: String.raw`PAM4 sends two bits per symbol with four levels, halving the bandwidth needed at the cost of three eyes each a third as tall.`,
num: "200 Gb/s per lane is 100 Gbaud PAM4. IEEE 802.3dj accepts a pre-FEC BER of 2.4e-4. The 9.5 dB penalty is why PAM4 links need more received power than NRZ at the same symbol rate.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Noise σ (fraction of full swing)", 0.01, 0.2, 0.005, 0.05);
  const rng = C3.rng(11); const gauss = () => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const sym = Array.from({ length: 120 }, () => Math.floor(rng() * 4)), noise = Array.from({ length: 120 }, gauss);
  PIC.player(ctl, (tsec) => {
    const sg = +$("sg").value; $("sgv").textContent = sg.toFixed(3);
    const x0 = 60, w = 360, y0 = 36, h = 160; const Y = v => y0 + h - Math.max(-0.15, Math.min(1.15, v)) / 1.3 * h - 0.15 / 1.3 * h * 0;
    const YY = v => y0 + h - (Math.max(-0.15, Math.min(1.15, v)) + 0.15) / 1.3 * h;
    let s = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/>`;
    [1 / 6, 1 / 2, 5 / 6].forEach(t => s += `<line x1="${x0}" x2="${x0 + w}" y1="${YY(t)}" y2="${YY(t)}" stroke="${PC}" stroke-dasharray="4 3"/>`);
    const off = Math.floor(tsec * 10) % 120; let errs = 0;
    for (let i = 0; i < 50; i++) { const k = (i + off) % 120; const lv = sym[k] / 3; const v = lv + sg * noise[k]; const dec = Math.min(3, Math.max(0, Math.round(v * 3))); const wrong = dec !== sym[k]; if (wrong) errs++; s += `<circle cx="${(x0 + w * (i + 0.5) / 50).toFixed(1)}" cy="${YY(v).toFixed(1)}" r="3.5" fill="${wrong ? PC : PIC.heat(sym[k] / 3)}"/>`; }
    s += tx(x0, y0 + h + 16, "four levels, dashed lines are the three decision thresholds") + tx(x0 + w, y0 + h + 32, `${errs} wrong of 50`, "end");
    const Qn = 1 / (2 * sg), Qp = 1 / (6 * sg);
    s += tx(520, y0 + 30, "NRZ at same swing", "middle", "th") + tx(520, y0 + 50, `Q = ${Qn.toFixed(1)}, BER ${PIC.ber(Qn).toExponential(1)}`, "middle") + tx(520, y0 + 90, "PAM4", "middle", "th") + tx(520, y0 + 110, `Q = ${Qp.toFixed(1)}, BER ${(0.75 * PIC.ber(Qp)).toExponential(1)}`, "middle") + tx(520, y0 + 140, "at twice the bit rate", "middle");
    fig.innerHTML = svg(y0 + h + 44, s);
  });
}}
],
summary: String.raw`Silicon modulators work through the plasma dispersion effect: free carriers lower the index by about a thousandth per ten to the eighteen per cubic centimetre and add absorption, following Soref and Bennett. A depletion phase shifter needs about a millimetre for a pi shift, and a Mach-Zehnder turns that phase into power through cosine squared of half the phase. The figure of merit Vπ times L sits at 1 to 2.5 volt centimetres. A ring modulator does the same job in micrometres by shifting its resonance across the laser line. Speed is limited by the junction RC time and, for rings, by the photon lifetime. PAM4 doubles the bit rate for a 9.5 dB eye penalty.`,
sheet: [
[String.raw`\[ \Delta n = -\left[8.8\times10^{-22}\Delta N_e + 8.5\times10^{-18}(\Delta N_h)^{0.8}\right] \]`, "Soref and Bennett index change at 1550 nm"],
[String.raw`\[ \Delta\alpha = 8.5\times10^{-18}\Delta N_e + 6.0\times10^{-18}\Delta N_h\ \ \mathrm{cm^{-1}} \]`, "Soref and Bennett absorption change"],
[String.raw`\[ L_\pi = \frac{\lambda}{2\Gamma|\Delta n|} \]`, "Length for a pi phase shift"],
[String.raw`\[ \frac{P_{\mathrm{out}}}{P_{\mathrm{in}}} = \cos^2\!\left(\frac{\pi}{2}\frac{V}{V_\pi}\right) \]`, "Mach-Zehnder transfer function"],
[String.raw`\[ V_\pi L \approx \text{const} \]`, "Phase shifter figure of merit"],
[String.raw`\[ \Delta\lambda_{\mathrm{res}} = \lambda\,\Gamma\Delta n/n_g \]`, "Ring modulator resonance shift"],
[String.raw`\[ f_{RC} = \frac{1}{2\pi RC}, \quad f_{\mathrm{ph}} = \frac{c}{\lambda Q_L} \]`, "Bandwidth limits"]],
consts: String.raw`\(\lambda = 1.55\) µm, silicon strip group index 4.2. The ring in card 5 has \(r = 0.95\), \(a = 0.993\), radius 5 µm.`,
sources: ["R. A. Soref and B. R. Bennett, Electrooptical effects in silicon, IEEE J. Quantum Electron. 23, 123 (1987)", "G. T. Reed et al., Silicon optical modulators, Nat. Photon. 4, 518 (2010)", "W. Bogaerts et al., Silicon microring resonators, Laser Photon. Rev. 6, 47 (2012)", "W. D. Sacher, J. K. S. Poon et al., multilayer silicon nitride on silicon platform with depletion diodes of VπL 2.6 V mm, CLEO 2016 JTh4C.3", "IEEE P802.3dj (800G and 1.6T Ethernet), PAM4 lanes and the 2.4e-4 pre-FEC BER limit"]
});
})();
