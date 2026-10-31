(function () {
/* Part 1 Lesson 1: the optical link, part by part. All figures computed live with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const box = (x, y, w, h, t, col, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill || "var(--sunk)"}" stroke="${col || "var(--b)"}" stroke-width="1.5"/><text class="t" x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle">${t}</text>`;

/* the parts of one lane of an optical link */
const PARTS = [
  ["Laser", "Laser", "A III-V laser makes a steady beam at 1310 or 1550 nm. On silicon it is bonded, transfer printed, or kept outside the chip and brought in by fiber.", PC],
  ["Mod", "Modulator", "Turns electrical bits into light pulses. A Mach-Zehnder or a ring, driven by the plasma dispersion effect in silicon.", PB],
  ["Guide", "Waveguide", "A silicon or silicon nitride strip, 0.2 to 0.5 µm wide, that guides the pulses across the chip.", PT],
  ["Mux", "Mux", "Puts several wavelengths into one waveguide. Rings or an arrayed waveguide grating.", PP],
  ["Fiber", "Coupler and fiber", "An edge or grating coupler moves the light into a fiber. The fiber carries it 1 m to 2 km.", PA],
  ["Demux", "Demux", "Separates the wavelengths again at the far end.", PP],
  ["PD", "Photodetector", "Germanium on silicon turns each pulse back into a current.", PC],
  ["TIA", "TIA and decision", "A transimpedance amplifier makes a voltage, and a comparator decides 1 or 0.", PB]];

addLesson("pic", "basics", {
level: "Foundations",
id: "pic-basics-l1", title: "What a photonic chip is and why AI needs it", short: "1. The optical link",
big: String.raw`A photonic integrated circuit is a chip that guides, splits, modulates and detects light the way an electronic chip handles current. In an AI computer the chips that do the arithmetic are starved of data, and copper wires lose signal and burn power as the bit rate climbs. An optical link replaces the wire with a laser, a modulator, a waveguide, a fiber and a photodetector, and sends many wavelengths down one path. This lesson walks along one lane of such a link, then builds the three numbers every link is judged by: the power budget in decibels, the energy per bit, and the bit error rate. Every figure is computed live, so move the sliders and watch the budget change.`,
bridge: String.raw`The decibel bookkeeping, the Q to BER relation and the sensitivity estimate are the standard forms in Agrawal, Fiber-Optic Communication Systems (Wiley). Energy per bit and bandwidth density are how the co-packaged optics products of 2024 to 2026 are compared. Vendor power claims are relative, so the pJ/bit values here are labelled as estimates.`,
cards: [

{s: "1. One lane", t: "Walk along one lane of an optical link",
intu: String.raw`Light leaves the laser as a steady beam. The modulator chops it into pulses that carry the bits. The pulses ride a waveguide, join other wavelengths at the mux, leave the chip through a coupler into a fiber, split again at the demux and land on a photodetector, which turns them back into a current. Press Next step to light up each part and read what it does, or press Play to watch the pulses travel.`,
eq: String.raw`\[ \text{bits} \xrightarrow{\ \text{modulator}\ } \text{light pulses} \xrightarrow{\ \text{waveguide, mux, fiber, demux}\ } \text{photodetector} \xrightarrow{\ \text{TIA}\ } \text{bits} \]<div class="eqnote">one lane carries one wavelength. A link bundles 4 to 16 lanes.</div>`,
sym: [["lane", "one wavelength carrying one stream of bits"], ["mux, demux", "wavelength multiplexer and demultiplexer"], ["TIA", "transimpedance amplifier, current in, voltage out"]],
how: ["The transmitter side sits on one chip: laser, modulator, mux, coupler.", "The fiber is the only part that is not on a chip.", "The receiver side is the mirror image: coupler, demux, photodetector, TIA.", "Everything between the modulator and the photodetector only moves or sorts light. It adds loss but no new information."],
say: String.raw`An optical link is a modulator that writes bits onto light, passive optics that carry and sort it, and a photodetector that reads the bits back.`,
num: "A 2025 co-packaged optics engine runs 8 lanes at 200 Gb/s each, so 1.6 Tb/s per port. A fiber between two racks is 10 to 100 m. Pulses at 200 Gb/s are 5 ps apart.",
r(fig, ctl) {
  const W = 680, y = 70, bw = 68, gap = 10, x0 = 14;
  const xs = PARTS.map((_, i) => x0 + i * (bw + gap));
  let step = 0;
  const base = (tsec, playing) => {
    let s = "";
    for (let i = 0; i < PARTS.length; i++) { const on = i === step; s += `<rect x="${xs[i]}" y="${y}" width="${bw}" height="44" rx="7" fill="${on ? "var(--accent-bg)" : "var(--sunk)"}" stroke="${PARTS[i][3]}" stroke-width="${on ? 2.5 : 1.4}"/>` + tx(xs[i] + bw / 2, y + 27, PARTS[i][0], "middle", on ? "th" : "t"); if (i < PARTS.length - 1) s += `<line x1="${xs[i] + bw}" y1="${y + 22}" x2="${xs[i + 1]}" y2="${y + 22}" stroke="var(--p)" stroke-width="1.2"/>`; }
    // pulses travelling after the modulator
    const xa = xs[1] + bw, xb = xs[6];
    for (let k = 0; k < 6; k++) { const ph = ((tsec * 0.35 + k / 6) % 1); const x = xa + ph * (xb - xa); const bit = (k % 3) !== 1; if (bit) s += `<circle cx="${x.toFixed(1)}" cy="${y - 14}" r="5" fill="${PC}" opacity="0.9"/>`; else s += `<circle cx="${x.toFixed(1)}" cy="${y - 14}" r="5" fill="none" stroke="${PC}" stroke-dasharray="2 2"/>`; }
    s += tx(xs[0] + bw / 2, y - 28, "steady light", "middle") + tx((xa + xb) / 2, y - 30, "pulses: filled = 1, dashed = 0", "middle") + tx(xs[7] + bw / 2, y - 28, "bits out", "middle");
    // description box
    s += `<rect x="14" y="${y + 64}" width="${W - 28}" height="74" rx="6" fill="var(--panel)" stroke="var(--line)"/>` + tx(24, y + 86, PARTS[step][1], null, "th");
    const words = PARTS[step][2].split(" "); let line = "", ly = y + 108, out = "";
    for (const w of words) { if ((line + " " + w).length > 95) { out += tx(24, ly, line); ly += 17; line = w; } else line = line ? line + " " + w : w; } out += tx(24, ly, line);
    fig.innerHTML = svg(y + 150, s + out);
  };
  PIC.stepper(ctl, PARTS.length, k => { step = k; }, PARTS.map(p => p[1]));
  PIC.player(ctl, base);
}},

{s: "2. Decibels", t: "Loss in dB: why engineers add instead of multiply",
intu: String.raw`Each part lets through a fraction \(T\) of the light. Ten parts in a row multiply ten fractions, which is awkward. The decibel turns each fraction into a negative number that simply adds. Drag the slider for one part and read both forms. Notice that 0.5 is \(-3\) dB, 0.1 is \(-10\) dB and 0.01 is \(-20\) dB, so each extra 10 dB is another factor of ten.`,
eq: String.raw`\[ L_{\mathrm{dB}} = 10\log_{10}\frac{P_{\mathrm{out}}}{P_{\mathrm{in}}} , \qquad \frac{P_{\mathrm{out}}}{P_{\mathrm{in}}} = 10^{L_{\mathrm{dB}}/10} \]\[ L_{\mathrm{total,dB}} = \sum_i L_{i,\mathrm{dB}} \]`,
sym: [[String.raw`\(P_{\mathrm{in}}, P_{\mathrm{out}}\)`, "optical power before and after a part"], [String.raw`\(L_{\mathrm{dB}}\)`, "loss in decibels, negative for a lossy part, called insertion loss when quoted positive"], [String.raw`\(\sum_i\)`, "sum over the parts in the chain"]],
how: [String.raw`The power after a chain is \(P_{\mathrm{in}} T_1 T_2 \cdots T_n\).`, String.raw`Take \(10\log_{10}\) of both sides. The log of a product is the sum of the logs.`, String.raw`So the decibel losses add. A power in milliwatts written as \(10\log_{10}(P/1\ \mathrm{mW})\) is a dBm value, and dB losses subtract from it directly.`],
say: String.raw`Decibel losses add along a chain because a logarithm turns the product of transmissions into a sum.`,
num: "3 dB is half the power. 1 dB is 79 percent. 0.1 dB is 97.7 percent. A whole link of 10 dB loss delivers one tenth of the laser power.",
r(fig, ctl) {
  ctl.innerHTML = sl("T", "Transmission of one part", 0.01, 1, 0.01, 0.5) + sl("n", "Identical parts in a row", 1, 10, 1, 4);
  const u = () => {
    const T = +$("T").value, n = +$("n").value; $("Tv").textContent = T.toFixed(2); $("nv").textContent = n;
    const dB1 = PIC.dB(T), tot = n * dB1, Ttot = Math.pow(T, n);
    let s = tx(340, 22, "power along the chain, linear (top) and in dB (bottom)", "middle", "th");
    const x0 = 60, w = 560, yA = 70, yB = 170, hbar = 60;
    for (let i = 0; i <= n; i++) { const x = x0 + w * i / n; const P = Math.pow(T, i); s += `<rect x="${x - 10}" y="${yA + hbar - hbar * P}" width="20" height="${hbar * P}" fill="${PB}" opacity="0.8"/>` + tx(x, yA + hbar + 14, P < 0.01 ? P.toExponential(1) : P.toFixed(2), "middle"); const d = i * dB1; const hb = Math.min(hbar, Math.max(0, -d) * hbar / 40); s += `<rect x="${x - 10}" y="${yB}" width="20" height="${hb}" fill="${PC}" opacity="0.8"/>` + tx(x, yB + hb + 14, d.toFixed(1) + " dB", "middle"); }
    s += tx(x0 - 40, yA + hbar / 2, "P/P₀", "end") + tx(x0 - 40, yB + 20, "loss", "end");
    s += tx(340, 270, `one part: ${dB1.toFixed(2)} dB.  ${n} parts: ${tot.toFixed(1)} dB, which is a transmission of ${Ttot < 0.001 ? Ttot.toExponential(2) : Ttot.toFixed(3)}`, "middle", "t");
    fig.innerHTML = svg(290, s);
  };
  $("T").oninput = u; $("n").oninput = u; u();
}},

{s: "3. Link budget", t: "The link budget: does enough light reach the detector?",
intu: String.raw`Start with the laser power in dBm, subtract every loss in order, and see where the power lands at the receiver. The receiver needs at least its sensitivity, the lowest power at which it still reads bits with few errors. What is left over is the margin. Move the sliders. A grating coupler at 3 dB on each side eats more than the whole waveguide. Replace them with 1 dB edge couplers and watch the margin jump.`,
eq: String.raw`\[ P_{\mathrm{rx}} = P_{\mathrm{laser}} - \sum_i IL_i - \text{penalties} \]\[ \text{Margin} = P_{\mathrm{rx}} - S_{\mathrm{rx}} \ge 0 \]<div class="eqref">all in dBm and dB</div>`,
sym: [[String.raw`\(P_{\mathrm{laser}}\)`, "laser power coupled into the chip, dBm"], [String.raw`\(IL_i\)`, "insertion loss of part i, dB, quoted positive"], [String.raw`\(S_{\mathrm{rx}}\)`, "receiver sensitivity, the minimum power for the target BER, dBm"], ["penalties", "extra dB for finite extinction ratio, dispersion, crosstalk"]],
how: ["Write the laser power in dBm.", "Subtract the insertion loss of each part. The order does not matter for the total.", "Compare with the receiver sensitivity. The difference is the margin, which absorbs ageing, temperature drift and a bad fiber connector.", "Designers aim for 3 dB or more of margin."],
say: String.raw`The link budget subtracts every insertion loss in dB from the laser power in dBm and checks that the margin above receiver sensitivity is positive.`,
num: "Typical teaching values: laser coupling 1 to 2 dB, modulator 3 to 6 dB, waveguide 1 to 3 dB per cm, mux and demux 1 to 3 dB each, grating coupler 2 to 4 dB or edge coupler about 1 dB, receiver sensitivity about −12 dBm at 25 Gb/s OOK.",
r(fig, ctl) {
  ctl.innerHTML = sl("PL", "Laser power (dBm)", 0, 15, 0.5, 10) + sl("mod", "Modulator (dB)", 1, 8, 0.5, 4) + sl("wg", "Waveguides (dB)", 0, 5, 0.1, 1) + sl("mux", "Mux + demux (dB)", 0, 6, 0.5, 3) + sl("cpl", "Each chip-fiber coupler (dB)", 0.5, 5, 0.5, 3) + sl("sens", "Receiver sensitivity (dBm)", -25, -5, 0.5, -12);
  const u = () => {
    const PL = +$("PL").value, mod = +$("mod").value, wg = +$("wg").value, mux = +$("mux").value, cpl = +$("cpl").value, sens = +$("sens").value;
    $("PLv").textContent = PL + " dBm"; $("modv").textContent = mod + " dB"; $("wgv").textContent = wg.toFixed(1) + " dB"; $("muxv").textContent = mux + " dB"; $("cplv").textContent = cpl + " dB"; $("sensv").textContent = sens + " dBm";
    const steps = [["laser", 0], ["modulator", mod], ["waveguide", wg / 2], ["mux", mux / 2], ["coupler out", cpl], ["fiber", 0.5], ["coupler in", cpl], ["demux", mux / 2], ["waveguide", wg / 2], ["detector", 0]];
    let P = PL; const pts = [P]; for (let i = 1; i < steps.length; i++) { P -= steps[i][1]; pts.push(P); }
    const margin = P - sens;
    const x0 = 60, w = 580, y0 = 40, h = 170, ymin = -30, ymax = 16;
    const Y = v => y0 + h - (v - ymin) / (ymax - ymin) * h;
    let s = PIC.yaxis(x0, y0, h, ymin, ymax, 4, "power (dBm)", v => v.toFixed(0));
    s += `<line x1="${x0}" y1="${Y(sens)}" x2="${x0 + w}" y2="${Y(sens)}" stroke="${PC}" stroke-dasharray="5 4"/>` + tx(x0 + w, Y(sens) - 5, "sensitivity", "end");
    let d = ""; for (let i = 0; i < pts.length; i++) { const x = x0 + w * i / (pts.length - 1); d += (i ? "L" : "M") + x + " " + Y(pts[i]) + (i < pts.length - 1 ? " L" + (x0 + w * (i + 1) / (pts.length - 1)) + " " + Y(pts[i]) : ""); s += tx(x, y0 + h + 14, steps[i][0], "middle"); if (i) s += tx(x0 + w * (i - 0.5) / (pts.length - 1), Y(Math.max(pts[i - 1], pts[i])) - 6, steps[i][1] ? "−" + steps[i][1].toFixed(1) : "", "middle"); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2.5"/>`;
    s += `<rect x="${x0 + w - 30}" y="${Y(Math.max(P, sens))}" width="14" height="${Math.abs(Y(sens) - Y(P))}" fill="${margin >= 0 ? PT : PC}" opacity="0.6"/>`;
    s += tx(340, 20, `received ${P.toFixed(1)} dBm, margin ${margin.toFixed(1)} dB ${margin >= 3 ? "(healthy)" : margin >= 0 ? "(thin)" : "(link fails)"}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["PL", "mod", "wg", "mux", "cpl", "sens"].forEach(i => $(i).oninput = u); u();
}},

{s: "4. Energy per bit", t: "Energy per bit: the number that decides the AI data center",
intu: String.raw`Divide the power a link burns by the bits it carries per second and you get joules per bit, usually written in picojoules. A pluggable transceiver with its own DSP uses roughly 15 to 20 pJ/bit. A co-packaged engine next to the switch chip is estimated near 5 pJ/bit, and research targets are below 1 pJ/bit. Set a power and a bit rate, then multiply by the millions of links in a data center to see why this number matters.`,
eq: String.raw`\[ E_{\mathrm{bit}} = \frac{P_{\mathrm{link}}}{B} \qquad [\mathrm{J/bit}] \]\[ 1\ \mathrm{pJ/bit} \times 1\ \mathrm{Tb/s} = 1\ \mathrm{W} \]`,
sym: [[String.raw`\(P_{\mathrm{link}}\)`, "electrical power of the whole link: laser, driver, DSP, TIA"], [String.raw`\(B\)`, "bit rate, bits per second"], [String.raw`\(E_{\mathrm{bit}}\)`, "energy per bit"]],
how: ["Power is energy per second, bit rate is bits per second.", "Their ratio is energy per bit, independent of how long the link runs.", "At 1 Tb/s, every pJ/bit costs exactly 1 W, which makes the scaling easy to remember."],
say: String.raw`Energy per bit is link power divided by bit rate, and at terabit rates every picojoule per bit is a watt.`,
num: "A 30 W pluggable at 1.6 Tb/s is 18.75 pJ/bit. Six transceivers per GPU at about 30 W each is 180 W per GPU, a figure quoted by Nvidia in 2025. Vendor CPO claims are relative: 3.5 times better power efficiency (Nvidia) and more than 70 percent optical interconnect power saving (Broadcom).",
r(fig, ctl) {
  ctl.innerHTML = sl("P", "Link power (W)", 1, 40, 0.5, 30) + sl("B", "Bit rate (Tb/s)", 0.1, 3.2, 0.1, 1.6) + sl("N", "Links in the data center (thousands)", 1, 500, 1, 100);
  const u = () => {
    const P = +$("P").value, B = +$("B").value, N = +$("N").value; $("Pv").textContent = P + " W"; $("Bv").textContent = B.toFixed(1) + " Tb/s"; $("Nv").textContent = N + "k";
    const E = P / B; const tot = P * N * 1000 / 1e6;
    const bars = [["this link", E, PB], ["pluggable (est.)", 17.5, "var(--p)"], ["CPO engine (est.)", 5, PT], ["research target", 1, PP]];
    const x0 = 60, w = 560, y0 = 40, h = 160, ymax = 25;
    let s = PIC.yaxis(x0, y0, h, 0, ymax, 5, "pJ/bit", v => v.toFixed(0));
    bars.forEach(([n, v, c], i) => { const bw = 90, x = x0 + 50 + i * 130; const hb = Math.min(h, v / ymax * h); s += `<rect x="${x}" y="${y0 + h - hb}" width="${bw}" height="${hb}" fill="${c}" opacity="0.8"/>` + tx(x + bw / 2, y0 + h - hb - 6, v.toFixed(1), "middle") + tx(x + bw / 2, y0 + h + 16, n, "middle"); });
    s += tx(340, 20, `${E.toFixed(1)} pJ/bit.  ${N}k such links burn ${tot.toFixed(1)} MW`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 36, s);
  };
  ["P", "B", "N"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Bandwidth density", t: "Bandwidth density: bits per second per millimetre of chip edge",
intu: String.raw`A chip can only have so many fibers or couplers along its edge, the shoreline. Bandwidth density is the total bit rate divided by the length of edge it uses. You raise it by packing lanes closer, running each lane faster, or stacking more wavelengths onto each fiber. Drag the three sliders and see which one is the cheapest way to double the number.`,
eq: String.raw`\[ D = \frac{B_{\mathrm{total}}}{\ell_{\mathrm{edge}}} = \frac{n_{\lambda}\, R_{\mathrm{lane}}}{p} \qquad [\mathrm{Tb/s/mm}] \]`,
sym: [[String.raw`\(n_{\lambda}\)`, "wavelengths per fiber"], [String.raw`\(R_{\mathrm{lane}}\)`, "bit rate per wavelength"], [String.raw`\(p\)`, "pitch between fibers or couplers along the edge, mm"], [String.raw`\(\ell_{\mathrm{edge}}\)`, "length of edge used"]],
how: ["Each fiber carries n wavelengths at R each.", "Fibers sit every p mm along the edge, so there are 1/p fibers per mm.", "Multiply. Vertical grating couplers can also use the chip area, not just the edge, which is one of their advantages."],
say: String.raw`Bandwidth density is wavelengths per fiber times bit rate per wavelength divided by the fiber pitch along the edge.`,
num: "Standard fiber pitch is 127 or 250 µm. 8 wavelengths at 200 Gb/s on a 250 µm pitch gives 6.4 Tb/s/mm. Vendor shoreline figures are rarely published, so treat such numbers as estimates.",
r(fig, ctl) {
  ctl.innerHTML = sl("nl", "Wavelengths per fiber", 1, 16, 1, 8) + sl("R", "Gb/s per wavelength", 25, 400, 25, 200) + sl("p", "Fiber pitch (µm)", 50, 500, 10, 250);
  const u = () => {
    const nl = +$("nl").value, R = +$("R").value, p = +$("p").value; $("nlv").textContent = nl; $("Rv").textContent = R + " Gb/s"; $("pv").textContent = p + " µm";
    const D = nl * R / 1000 / (p / 1000);
    let s = tx(340, 22, `${D.toFixed(1)} Tb/s per mm of edge`, "middle", "th");
    // chip edge drawing
    const x0 = 40, y0 = 60, L = 600; s += `<rect x="${x0}" y="${y0}" width="${L}" height="90" fill="var(--sunk)" stroke="var(--b)"/>` + tx(x0 + L / 2, y0 + 50, "chip (1 mm of edge shown)", "middle");
    const nf = Math.min(60, Math.floor(1000 / p)); for (let i = 0; i < nf; i++) { const x = x0 + (i + 0.5) * L / (1000 / p); s += `<rect x="${x - 3}" y="${y0 - 40}" width="6" height="40" fill="${PA}"/>`; for (let k = 0; k < Math.min(nl, 8); k++) s += `<circle cx="${x}" cy="${y0 - 48 - k * 6}" r="2" fill="${PIC.heat(k / 8)}"/>`; }
    s += tx(x0, y0 - 100, `${nf} fibers per mm, ${nl} wavelengths each (colored dots), ${R} Gb/s per wavelength`, null);
    fig.innerHTML = svg(y0 + 110, s);
  };
  ["nl", "R", "p"].forEach(i => $(i).oninput = u); u();
}},

{s: "6. BER and Q", t: "Bit error rate: how noise turns into wrong bits",
intu: String.raw`The receiver sees a current for a 1 and a smaller current for a 0, each smeared by noise. The decision threshold sits between them. A bit is wrong when noise pushes a 1 below the threshold or a 0 above it. The quality factor \(Q\) is the separation of the two levels divided by the sum of their noise widths. Drag the noise slider and watch the eye close and the error rate climb. Play shows a stream of noisy bits arriving.`,
eq: String.raw`\[ Q = \frac{I_1 - I_0}{\sigma_1 + \sigma_0}, \qquad \mathrm{BER} = \tfrac{1}{2}\operatorname{erfc}\!\left(\frac{Q}{\sqrt{2}}\right) \]`,
sym: [[String.raw`\(I_1, I_0\)`, "mean photocurrent for a 1 and a 0"], [String.raw`\(\sigma_1, \sigma_0\)`, "noise standard deviations on each level"], [String.raw`\(\operatorname{erfc}\)`, "complementary error function, the tail of a Gaussian"]],
how: ["Model each level as a Gaussian with its own mean and width.", "Place the threshold where the two tails are equal. That gives the same error probability for a 1 and a 0.", "The probability that a Gaussian exceeds Q standard deviations is half the erfc of Q over root two.", "Q of 6 gives a BER near 1e-9. Q of 7 gives 1.3e-12. Modern links accept a raw BER of about 2.4e-4 and let forward error correction clean it up."],
say: String.raw`Q is the eye opening divided by the noise, and the bit error rate is half the complementary error function of Q over root two.`,
num: "Q = 3: BER 1.3e-3. Q = 4: 3.2e-5. Q = 6: 1.0e-9. Q = 7: 1.3e-12. IEEE 802.3dj 800G and 1.6T lanes require a pre-FEC BER below 2.4e-4.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Noise σ (fraction of eye)", 0.05, 0.6, 0.01, 0.17);
  const rng = C3 && C3.rng ? C3.rng(7) : Math.random;
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const bits = Array.from({ length: 160 }, () => rng() < 0.5 ? 1 : 0), noise = Array.from({ length: 160 }, gauss);
  let sg = 0.17;
  const draw = (tsec) => {
    sg = +$("sg").value; $("sgv").textContent = sg.toFixed(2);
    const Q = 1 / (2 * sg), ber = PIC.ber(Q);
    const x0 = 50, w = 380, y0 = 44, h = 160; const Y = v => y0 + h - (v + 0.2) / 1.4 * h;
    let s = tx(240, 20, `Q = ${Q.toFixed(2)}, BER = ${ber.toExponential(1)}`, "middle", "th");
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/>` + `<line x1="${x0}" y1="${Y(0.5)}" x2="${x0 + w}" y2="${Y(0.5)}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(x0 + w + 6, Y(0.5) + 4, "threshold");
    const off = Math.floor(tsec * 12) % 160; let errs = 0;
    for (let i = 0; i < 60; i++) { const k = (i + off) % 160; const b = bits[k], v = b + sg * noise[k]; const x = x0 + w * (i + 0.5) / 60; const wrong = (b === 1 && v < 0.5) || (b === 0 && v >= 0.5); if (wrong) errs++; s += `<circle cx="${x.toFixed(1)}" cy="${Y(Math.max(-0.2, Math.min(1.2, v))).toFixed(1)}" r="3.5" fill="${wrong ? PC : b ? PB : PT}"/>`; }
    s += tx(x0, y0 + h + 16, "received samples: blue 1, green 0, red decided wrong") + tx(x0 + w, y0 + h + 32, `${errs} wrong of 60 shown`, "end");
    // histograms on the right
    const hx = 470, hw = 170; for (let j = 0; j < 40; j++) { const v = -0.2 + 1.4 * (j + 0.5) / 40; const p1 = Math.exp(-0.5 * Math.pow((v - 1) / sg, 2)), p0 = Math.exp(-0.5 * Math.pow(v / sg, 2)); s += `<rect x="${hx}" y="${Y(v) - 2}" width="${p1 * hw}" height="3.5" fill="${PB}" opacity="0.7"/><rect x="${hx}" y="${Y(v) - 2}" width="${p0 * hw}" height="3.5" fill="${PT}" opacity="0.7"/>`; }
    s += tx(hx + hw / 2, y0 + h + 16, "level histograms", "middle");
    fig.innerHTML = svg(y0 + h + 44, s);
  };
  $("sg").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "7. Extinction and OMA", t: "Extinction ratio and optical modulation amplitude",
intu: String.raw`A modulator never fully blocks the light, so a 0 still carries some power. The extinction ratio compares the 1 and 0 levels. The receiver only uses their difference, the optical modulation amplitude. For a fixed average power, a poor extinction ratio wastes power on the zeros and shrinks the eye. Drag the extinction ratio and watch how much of the average power is actually useful.`,
eq: String.raw`\[ r_e = \frac{P_1}{P_0}, \qquad \mathrm{ER_{dB}} = 10\log_{10} r_e \]\[ \mathrm{OMA} = P_1 - P_0 = 2\bar P\,\frac{r_e - 1}{r_e + 1}, \qquad \bar P = \frac{P_1 + P_0}{2} \]`,
sym: [[String.raw`\(P_1, P_0\)`, "optical power of a 1 and a 0"], [String.raw`\(r_e\)`, "extinction ratio as a plain ratio"], [String.raw`\(\bar P\)`, "average power with equal numbers of ones and zeros"], ["OMA", "optical modulation amplitude, the eye opening in power"]],
how: [String.raw`Write \(P_1 = r_e P_0\) and the average as half their sum.`, String.raw`Solve for \(P_0\) in terms of the average, then OMA is \(P_1 - P_0\).`, String.raw`As \(r_e\) goes to infinity, OMA goes to twice the average. At \(r_e = 1\) nothing is modulated.`],
say: String.raw`OMA is the eye opening in power, and a finite extinction ratio makes it less than twice the average power.`,
num: "ER 6 dB: OMA is 1.2 times the average, a 2.2 dB penalty against infinite ER. ER 10 dB: 1.64 times the average, 0.9 dB penalty. Rings reach 6 to 10 dB. MZMs reach above 10 dB.",
r(fig, ctl) {
  ctl.innerHTML = sl("er", "Extinction ratio (dB)", 1, 20, 0.5, 6);
  const u = () => {
    const er = +$("er").value; $("erv").textContent = er + " dB"; const re = PIC.fromdB(er), Pavg = 1, P0 = 2 * Pavg / (re + 1), P1 = re * P0, oma = P1 - P0, pen = -PIC.dB(oma / (2 * Pavg));
    const x0 = 60, w = 400, y0 = 40, h = 160; const Y = v => y0 + h - v / 2 * h;
    let s = tx(340, 22, `OMA = ${oma.toFixed(2)} × average, penalty ${pen.toFixed(2)} dB`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, 2, 4, "power / average", v => v.toFixed(1));
    const pat = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1]; let d = ""; pat.forEach((b, i) => { const xa = x0 + w * i / pat.length, xb = x0 + w * (i + 1) / pat.length, y = Y(b ? P1 : P0); d += `${i ? "L" : "M"}${xa} ${y} L${xb} ${y} `; });
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2.5"/>` + `<line x1="${x0}" y1="${Y(Pavg)}" x2="${x0 + w}" y2="${Y(Pavg)}" stroke="var(--p)" stroke-dasharray="4 3"/>` + tx(x0 + w + 6, Y(Pavg) + 4, "average");
    s += `<rect x="${x0 + w + 60}" y="${Y(P1)}" width="18" height="${Y(P0) - Y(P1)}" fill="${PT}" opacity="0.6"/>` + tx(x0 + w + 69, Y(P1) - 6, "OMA", "middle") + tx(x0 + w + 69, Y(P0) + 14, `P₀ = ${P0.toFixed(2)}`, "middle");
    fig.innerHTML = svg(y0 + h + 30, s);
  };
  $("er").oninput = u; u();
}}
],
summary: String.raw`An optical link writes bits onto light with a modulator, moves and sorts the light with waveguides, couplers, fibers and wavelength filters, and reads the bits back with a photodetector and amplifier. Three numbers judge it. The link budget adds every insertion loss in dB and checks the margin above receiver sensitivity. Energy per bit is link power over bit rate, and at terabit rates every picojoule per bit is a watt. The bit error rate follows from Q, the eye opening over the noise. Bandwidth density and extinction ratio decide how much of the chip edge and the laser power are used well.`,
sheet: [
[String.raw`\[ L_{\mathrm{dB}} = 10\log_{10}(P_{\mathrm{out}}/P_{\mathrm{in}}), \quad L_{\mathrm{total}} = \sum_i L_i \]`, "Decibels add along a chain"],
[String.raw`\[ P_{\mathrm{rx}} = P_{\mathrm{laser}} - \sum_i IL_i, \quad \text{Margin} = P_{\mathrm{rx}} - S_{\mathrm{rx}} \]`, "Link budget"],
[String.raw`\[ E_{\mathrm{bit}} = P_{\mathrm{link}}/B \]`, "Energy per bit, 1 pJ/bit at 1 Tb/s is 1 W"],
[String.raw`\[ D = n_{\lambda} R_{\mathrm{lane}} / p \]`, "Bandwidth density along the chip edge"],
[String.raw`\[ Q = \frac{I_1 - I_0}{\sigma_1 + \sigma_0}, \quad \mathrm{BER} = \tfrac{1}{2}\operatorname{erfc}(Q/\sqrt{2}) \]`, "Bit error rate from the eye"],
[String.raw`\[ \mathrm{OMA} = 2\bar P \frac{r_e - 1}{r_e + 1} \]`, "Useful power at finite extinction ratio"]],
consts: String.raw`Receiver sensitivity values are typical for a PIN plus TIA at 25 Gb/s OOK. pJ/bit values for products are secondary estimates, since vendors publish relative claims only.`,
sources: ["G. P. Agrawal, Fiber-Optic Communication Systems, 4th ed., Wiley (2010), Ch. 4 (receivers, BER and Q) and Ch. 5 (link budgets)", "Nvidia, Spectrum-X and Quantum-X Photonics announcement, GTC March 2025 (3.5 times power efficiency, 1.6 Tb/s ports)", "Broadcom, Tomahawk 5 Bailly co-packaged optics release, March 2024 (more than 70 percent optical interconnect power saving)", "APNIC blog, Co-packaged optics: a deep dive, May 2025 (secondary pJ/bit estimates)", "IEEE P802.3dj draft, 800GBASE-R and 1.6TBASE-R PMD BER requirement 2.4e-4"]
});
})();
