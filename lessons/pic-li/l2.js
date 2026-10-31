(function () {
/* Part 3 Lesson 2: sub-photon-voltage LEDs, Li et al., Nat. Photonics 13, 588 (2019). Only the abstract and a figure caption were available,
   so device material and process details are not verified. Figures are models computed live with PIC (pic-common.js) and app.js helpers. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const rc = (x, y, w, h, fill, stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke || "none"}" stroke-width="1"/>`;

addLesson("pic", "li", {
level: "Advanced",
id: "pic-li-l2", title: "Sub-photon-voltage LEDs (Nat. Photonics 2019)", short: "2. Sub-photon-voltage LEDs",
big: String.raw`An LED converts electrical energy into photons. Common sense says the voltage across it must be at least the photon energy divided by the electron charge. It does not have to be. At very low current the diode can run below that voltage, and the missing energy is drawn from the heat of the lattice, so the device cools a little as it glows. Li and coworkers at IBM built an LED whose internal quantum efficiency is near unity at current densities below ten to the minus four amperes per square centimetre and whose bias sits about 30 percent below the photon voltage. The payoff is an optical link that needs microwatts. This lesson explains the energy bookkeeping, the efficiency at low current, why light extraction limits the real device, and what the link demonstration shows.`,
bridge: String.raw`Source: N. Li, K. Han, W. Spratt, S. Bedell, J. Ott, M. Hopstaken, F. Libsch, Q. Li and D. K. Sadana, Ultra-low-power sub-photon-voltage high-efficiency light-emitting diodes, Nature Photonics 13, 588 (2019), DOI 10.1038/s41566-019-0463-x. Only the abstract and one figure caption could be checked, so the quantum well composition, the passivation and the packaging described in secondary sources are marked as unverified. The ABC recombination model and the escape cone geometry are textbook physics, not the paper's own fits.`,
cards: [

{s: "1. The energy deficit", t: "What sub-photon-voltage means",
intu: String.raw`Each electron that crosses the diode delivers an energy \(qV\). Each photon that leaves carries \(h\nu\). If \(qV\) is less than \(h\nu\), the photon took more energy out than the electron brought in. The difference must come from somewhere, and it comes from lattice vibrations, so the crystal cools. Drag the bias voltage. Above the photon voltage the device heats, as a normal LED does. Below it, every photon is a tiny refrigerator, provided it escapes.`,
eq: String.raw`\[ qV \lt h\nu \quad\Longrightarrow\quad E_{\mathrm{from\ lattice}} = h\nu - qV \ \text{per emitted photon} \]`,
sym: [[String.raw`\(q\)`, "electron charge"], [String.raw`\(V\)`, "bias voltage across the diode"], [String.raw`\(h\nu\)`, "photon energy, about 1.3 eV for a 954 nm photon"], [String.raw`\(h\nu/q\)`, "the photon voltage, the bias at which electrical and photon energies match"]],
how: ["The electron enters with energy qV above the Fermi level of the contact.", "To recombine across the gap it needs about Eg, slightly more than qV when V is low.", "The extra energy is borrowed from phonons, thermal vibrations of the lattice, which the carrier absorbs on its way to the band edge.", "This is the electroluminescent cooling or thermophotonic effect, first discussed by Tauc in 1957."],
say: String.raw`Below the photon voltage each emitted photon carries away h nu minus qV of lattice heat, so the LED cools instead of heating.`,
num: "Paper (abstract): bias voltage about 30 percent below the photon voltage. With a photon voltage near 1.3 V (secondary sources quote a 954 nm emission, unverified) that is a bias near 0.9 V.",
r(fig, ctl) {
  ctl.innerHTML = sl("V", "Bias voltage V (V)", 0.5, 1.6, 0.01, 0.9) + sl("hv", "Photon energy hν (eV)", 1.0, 1.6, 0.01, 1.3);
  const draw = (t) => {
    const V = +$("V").value, hv = +$("hv").value; $("Vv").textContent = V.toFixed(2) + " V"; $("hvv").textContent = hv.toFixed(2) + " eV";
    const d = hv - V; const x0 = 60, y0 = 40, w = 560, h = 180; const Y = e => y0 + h - e / 1.8 * h;
    let s = tx(340, 20, d > 0 ? `qV below hν by ${d.toFixed(2)} eV: each photon pulls ${d.toFixed(2)} eV of heat out of the lattice` : `qV above hν by ${(-d).toFixed(2)} eV: a normal LED, it heats`, "middle", "th");
    s += PIC.yaxis(x0, y0, h, 0, 1.8, 3, "energy (eV)", v => v.toFixed(1));
    s += rc(x0 + 80, Y(V), 90, Y(0) - Y(V), "var(--blue-bg)", PB) + tx(x0 + 125, Y(V) - 6, `qV = ${V.toFixed(2)} eV`, "middle");
    s += rc(x0 + 360, Y(hv), 90, Y(0) - Y(hv), "var(--coral-bg)", PC) + tx(x0 + 405, Y(hv) - 6, `hν = ${hv.toFixed(2)} eV`, "middle");
    if (d > 0) { s += rc(x0 + 220, Y(hv), 90, Y(V) - Y(hv), "var(--teal-bg)", PT) + tx(x0 + 265, (Y(hv) + Y(V)) / 2 + 4, "from heat", "middle"); }
    else { s += rc(x0 + 220, Y(V), 90, Y(hv) - Y(V), "var(--sunk)", PA) + tx(x0 + 265, (Y(hv) + Y(V)) / 2 + 4, "to heat", "middle"); }
    // phonon wiggles drawn animated in the lattice box
    const k = Math.max(0, Math.min(1, d / 0.5));
    for (let i = 0; i < 8; i++) { const px = x0 + 60 + i * 60, py = y0 + h + 30 + 6 * Math.sin(2 * Math.PI * (t * (1 + 2 * (1 - k)) + i / 3)); s += `<circle cx="${px}" cy="${py.toFixed(1)}" r="5" fill="var(--p)"/>`; }
    s += tx(340, y0 + h + 58, d > 0 ? "lattice atoms vibrate less: cooling" : "lattice atoms vibrate more: heating", "middle");
    fig.innerHTML = svg(y0 + h + 70, s);
  };
  $("V").oninput = () => draw(0); $("hv").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "2. Cooling condition", t: "When does the device actually cool?",
intu: String.raw`Cooling per photon only helps if photons escape. Every photon that is absorbed inside turns back into heat, and every electron that recombines without a photon heats too. The electrical power in is \(IV\). The optical power out is the photon rate times the photon energy times the external efficiency. Net cooling needs the second to exceed the first, which gives a simple threshold on the external efficiency. Slide the efficiency and the bias and watch the sign of the net heat.`,
eq: String.raw`\[ P_{\mathrm{cool}} = \eta_{\mathrm{ext}}\frac{I}{q}h\nu - IV \gt 0 \quad\Longleftrightarrow\quad \eta_{\mathrm{ext}} \gt \frac{qV}{h\nu} \]`,
sym: [[String.raw`\(\eta_{\mathrm{ext}}\)`, "external quantum efficiency, photons out per electron in"], [String.raw`\(I\)`, "current"], [String.raw`\(P_{\mathrm{cool}}\)`, "net power removed from the device, positive means cooling"]],
how: ["Photons per second out: efficiency times I over q.", "Energy per second out: that times the photon energy.", "Energy per second in: I times V.", "Subtract. The current cancels in the inequality, so only the efficiency and the ratio of bias to photon voltage matter."],
say: String.raw`Net cooling needs the external efficiency to exceed the bias divided by the photon voltage, so a 30 percent sub-photon bias needs an external efficiency above 70 percent.`,
num: "Paper (abstract and figure caption): internal efficiency close to unity, actual light extraction about 8 percent, with projections at 95 and 100 percent extraction. At 8 percent extraction and a 0.9 V bias on a 1.3 eV photon the device does not cool. Net cooling is a projection, not a demonstrated result.",
r(fig, ctl) {
  ctl.innerHTML = sl("eta", "External efficiency η_ext (%)", 1, 100, 1, 8) + sl("Vr", "Bias as a fraction of photon voltage", 0.5, 1.2, 0.01, 0.7);
  const u = () => {
    const eta = +$("eta").value / 100, Vr = +$("Vr").value; $("etav").textContent = (eta * 100).toFixed(0) + " %"; $("Vrv").textContent = Vr.toFixed(2);
    const net = eta - Vr; // in units of I hν / q
    const x0 = 60, w = 560, y0 = 40, h = 170;
    let s = PIC.yaxis(x0, y0, h, 0, 1.2, 4, "bias / photon voltage", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0, 100, 5, "external efficiency (%)", v => v.toFixed(0));
    // cooling region: eta > Vr
    s += `<polygon points="${x0},${y0 + h} ${x0 + w},${y0 + h - 1 / 1.2 * h} ${x0 + w},${y0 + h}" fill="rgba(29,158,117,0.25)"/>` + tx(x0 + w - 10, y0 + h - 20, "cooling", "end") + tx(x0 + 20, y0 + 20, "heating");
    s += plot(x0, y0, w, h, [0, 100], [0, 1], 0, 100, 0, 1.2, PT, 2);
    const px = x0 + eta * w, py = y0 + h - Vr / 1.2 * h; s += `<circle cx="${px}" cy="${py}" r="7" fill="${net > 0 ? PT : PC}"/>`;
    s += tx(340, 20, `net heat per electron: ${(-net).toFixed(2)} × hν ${net > 0 ? "(cooling)" : "(heating)"}`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("eta").oninput = u; $("Vr").oninput = u; u();
}},

{s: "3. Efficiency vs current", t: "Why the efficiency is highest at tiny current",
intu: String.raw`Carriers recombine three ways. The Shockley-Read-Hall path through defects goes as \(A n\), the radiative path as \(B n^{2}\) and Auger as \(C n^{3}\). The radiative share is \(Bn/(A + Bn + Cn^{2})\), which climbs toward one only if \(A\) is tiny. A normal LED loses at low current because defects win there. The paper's quantum well was designed so that \(Bp/(A + Bp)\) is near one even at microamps. Slide \(A\) and \(B\) to see what interface quality does to the curve. This ABC model is a teaching model, not the paper's own fit.`,
eq: String.raw`\[ \eta_{\mathrm{int}} = \frac{B n}{A + B n + C n^{2}}, \qquad J = q\,d\,(A n + B n^{2} + C n^{3}) \]`,
sym: [[String.raw`\(A\)`, "non-radiative (SRH) coefficient, 1/s, set by defects and interfaces"], [String.raw`\(B\)`, "radiative coefficient, cm³/s"], [String.raw`\(C\)`, "Auger coefficient, cm⁶/s"], [String.raw`\(n\)`, "carrier density in the well"], [String.raw`\(d\)`, "well thickness"]],
how: ["Write the total recombination rate per volume as the sum of the three terms.", "The internal efficiency is the radiative term over the total.", "The current density is q times thickness times the total rate, which lets the page plot efficiency against current density instead of n.", String.raw`With a tiny \(A\), the efficiency is near one down to very low current, and Auger only matters at high current.`],
say: String.raw`Internal efficiency is the radiative rate over the total rate, and a near-defect-free well keeps it close to one even at microampere current densities.`,
num: "Paper (abstract): close to unity internal quantum efficiency at a current density below 1e-4 A/cm², more than three orders of magnitude below conventional LEDs. The well-cladding design and the interface quality are credited, with Bp over A plus Bp approaching one.",
r(fig, ctl) {
  ctl.innerHTML = sl("lA", "log10 A (1/s)", 2, 8, 0.1, 4) + sl("lB", "log10 B (cm³/s)", -11, -9, 0.1, -10);
  const u = () => {
    const A = Math.pow(10, +$("lA").value), B = Math.pow(10, +$("lB").value), C = 1e-30, d = 1e-6; $("lAv").textContent = A.toExponential(0); $("lBv").textContent = B.toExponential(0);
    const x0 = 60, w = 560, y0 = 40, h = 170; const ns = range(13, 19, 80).map(v => Math.pow(10, v));
    const Js = ns.map(n => Math.log10(1.602e-19 * d * (A * n + B * n * n + C * n * n * n))), es = ns.map(n => B * n / (A + B * n + C * n * n));
    let s = PIC.yaxis(x0, y0, h, 0, 1, 4, "internal efficiency", v => v.toFixed(2)) + PIC.xaxis(x0, y0 + h, w, -8, 2, 5, "log10 J (A/cm²)", v => v.toFixed(0));
    s += plot(x0, y0, w, h, Js, es, -8, 2, 0, 1, PB, 2.5);
    const ref = ns.map(n => 1e8 * n / (1e8 + B * n + C * n * n)), Jr = ns.map(n => Math.log10(1.602e-19 * d * (1e8 * n + B * n * n + C * n * n * n)));
    s += plot(x0, y0, w, h, Jr, ref, -8, 2, 0, 1, "var(--p)", 1.5, "4 3") + tx(x0 + w - 4, y0 + h - 0.5 * h, "A = 1e8, a conventional LED", "end");
    const X = x0 + (-4 + 8) / 10 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(X + 4, y0 + 12, "1e-4 A/cm²");
    const nAt = ns.find((n, i) => Js[i] >= -4) || ns[0]; const eAt = B * nAt / (A + B * nAt + C * nAt * nAt);
    s += tx(340, 20, `model efficiency at 1e-4 A/cm²: ${(100 * eAt).toFixed(1)} %`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("lA").oninput = u; $("lB").oninput = u; u();
}},

{s: "4. Extraction", t: "Light extraction: the escape cone that keeps 92 percent inside",
intu: String.raw`Making photons is the easy part. Getting them out of a crystal of index 3.5 is hard, because a photon reaching the surface at more than about 17 degrees from the normal is totally internally reflected. Only the narrow escape cone leaves, about 2 percent of the photons per flat face before Fresnel reflection takes its share. Slide the index. The paper's device reached 8 percent extraction, so the external efficiency, not the internal one, is what stops it from cooling. Press Play to watch photons bounce.`,
eq: String.raw`\[ \sin\theta_{c} = \frac{1}{n}, \qquad \eta_{\mathrm{esc}} \approx \frac{1 - \cos\theta_{c}}{2}\,(1 - R) \approx \frac{1}{4 n^{2}}\,(1 - R) \]\[ \eta_{\mathrm{ext}} = \eta_{\mathrm{int}}\,\eta_{\mathrm{esc}} \]`,
sym: [[String.raw`\(\theta_c\)`, "critical angle at the semiconductor-air surface"], [String.raw`\(\eta_{\mathrm{esc}}\)`, "fraction of isotropically emitted photons escaping through one face"], [String.raw`\(R\)`, "Fresnel reflection at normal incidence, about 30 percent for n = 3.5"]],
how: [String.raw`Snell's law with the refracted angle at 90 degrees gives \(\sin\theta_c = 1/n\).`, String.raw`The solid angle of the cone divided by the full sphere is \((1-\cos\theta_c)/2\), close to \(1/4n^2\) for large n.`, String.raw`Multiply by the Fresnel transmission. For n = 3.5 the cone holds 2.1 percent and 1.4 percent gets through the face. Textured surfaces, mirrors and encapsulation raise it.`],
say: String.raw`Only photons inside the escape cone of half angle arcsin one over n leave a flat face, about 2 percent for a high index semiconductor, so extraction limits the external efficiency.`,
num: "Paper (figure caption): actual 8 percent light extraction efficiency, with projected curves at 95 and 100 percent extraction. For n = 3.5, the critical angle is 16.6 degrees and the single face escape fraction is about 2 percent before reflection and 1.4 percent after, so 8 percent already implies help from the geometry, for example a mirror or a shaped surface.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n", 1.5, 4, 0.05, 3.5);
  const rng = C3.rng(11); const rays = Array.from({ length: 14 }, () => [rng() * 300 + 190, rng() * 2 * Math.PI]);
  const draw = (t) => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2);
    const thc = Math.asin(1 / n), R = Math.pow((n - 1) / (n + 1), 2), esc = (1 - Math.cos(thc)) / 2 * (1 - R);
    const x0 = 140, y0 = 60, w = 400, h = 130;
    let s = tx(340, 20, `critical angle ${(thc * 180 / Math.PI).toFixed(1)}°, escape per face ${(100 * esc).toFixed(1)} %`, "middle", "th");
    s += rc(x0, y0, w, h, "var(--blue-bg)", PB) + tx(x0 + 8, y0 + h - 8, `semiconductor, n = ${n.toFixed(2)}`) + tx(x0 + 8, y0 - 8, "air");
    const sx = x0 + w / 2, sy = y0 + h / 2;
    rays.forEach(([ph0, ang], i) => { const a = ang; const len = ((t * 60 + i * 23) % 140); const ex = sx + len * Math.cos(a), ey = sy + len * Math.sin(a); const up = Math.abs(a + Math.PI / 2) % (2 * Math.PI); const toward = Math.sin(a) < 0; const theta = Math.abs(Math.atan2(Math.cos(a), -Math.sin(a))); const escapes = toward && theta < thc; const col = escapes ? PT : PC; const cy = Math.max(y0 - (escapes ? 40 : 0), Math.min(y0 + h, ey)); s += `<line x1="${sx}" y1="${sy}" x2="${ex.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${col}" stroke-width="1.5" opacity="0.8"/>`; });
    // escape cone
    const cx1 = sx - (h / 2) * Math.tan(thc), cx2 = sx + (h / 2) * Math.tan(thc);
    s += `<polygon points="${sx},${sy} ${cx1.toFixed(1)},${y0} ${cx2.toFixed(1)},${y0}" fill="rgba(29,158,117,0.3)" stroke="${PT}"/>` + tx(sx, y0 + h + 22, "escape cone shaded, green rays leave, red rays are trapped", "middle");
    s += `<circle cx="${sx}" cy="${sy}" r="5" fill="${PA}"/>`;
    fig.innerHTML = svg(y0 + h + 36, s);
  };
  $("n").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "5. Unity IQE, low bias", t: "The headline numbers: near-unity IQE at microamps, bias 30 percent below the photon voltage",
intu: String.raw`Put the pieces together. The diode current follows an exponential in voltage. At a bias 30 percent below the photon voltage the current density is tiny, below ten to the minus four amperes per square centimetre. Because the well is nearly defect free, almost every one of those carriers still makes a photon. Slide the ideality factor and the saturation current to see how low the bias can go while the internal efficiency stays near one. The curve is a Shockley diode model, not the paper's measured I-V.`,
eq: String.raw`\[ J = J_{0}\left(e^{qV/n_{\mathrm{id}}kT} - 1\right), \qquad \eta_{\mathrm{int}}(J) \approx \frac{B n}{A + B n} \]`,
sym: [[String.raw`\(J_0\)`, "saturation current density"], [String.raw`\(n_{\mathrm{id}}\)`, "ideality factor, 1 for pure radiative diffusion current, 2 for recombination in the depletion region"], [String.raw`\(kT/q\)`, "thermal voltage, 25.9 mV at 300 K"]],
how: ["Lower bias means exponentially lower current density.", "At low density the ABC model says efficiency is set by A versus B times n, so only a very low A keeps it high.", "The paper reports both at once: near-unity internal efficiency and a bias about 30 percent below the photon voltage."],
say: String.raw`The LED keeps near-unity internal efficiency down to current densities below ten to the minus four amperes per square centimetre, where its bias is about 30 percent below the photon voltage.`,
num: "Paper (abstract): close to unity internal quantum efficiency at a current density below 1e-4 A/cm², more than three orders of magnitude lower than conventional LEDs. LED bias voltage reduced to about 30 percent below the photon voltage h nu over q.",
r(fig, ctl) {
  ctl.innerHTML = sl("nid", "Ideality factor", 1, 2, 0.05, 1.2) + sl("lJ0", "log10 J₀ (A/cm²)", -22, -14, 0.5, -18);
  const u = () => {
    const nid = +$("nid").value, J0 = Math.pow(10, +$("lJ0").value); $("nidv").textContent = nid.toFixed(2); $("lJ0v").textContent = J0.toExponential(0);
    const Vt = 0.02585, hv = 1.3; const x0 = 60, w = 560, y0 = 40, h = 170;
    const Vs = range(0.5, 1.4, 90), Js = Vs.map(V => Math.log10(J0 * (Math.exp(V / (nid * Vt)) - 1)));
    let s = PIC.yaxis(x0, y0, h, -10, 2, 4, "log10 J (A/cm²)", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 0.5, 1.4, 3, "bias V (V)", v => v.toFixed(1));
    s += plot(x0, y0, w, h, Vs, Js, 0.5, 1.4, -10, 2, PB, 2.5);
    const Xp = x0 + (hv - 0.5) / 0.9 * w; s += `<line x1="${Xp}" y1="${y0}" x2="${Xp}" y2="${y0 + h}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(Xp - 4, y0 + 12, "photon voltage 1.3 V", "end");
    const Xs = x0 + (0.7 * hv - 0.5) / 0.9 * w; s += `<line x1="${Xs}" y1="${y0}" x2="${Xs}" y2="${y0 + h}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(Xs - 4, y0 + 28, "30 % below", "end");
    const Jat = J0 * (Math.exp(0.7 * hv / (nid * Vt)) - 1); const Yj = y0 + h - (Math.log10(Jat) + 10) / 12 * h; s += `<line x1="${x0}" y1="${Yj}" x2="${x0 + w}" y2="${Yj}" stroke="${PT}" stroke-dasharray="2 3"/>`;
    s += tx(340, 20, `model current density at 0.91 V: ${Jat.toExponential(1)} A/cm²`, "middle", "th");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  $("nid").oninput = u; $("lJ0").oninput = u; u();
}},

{s: "6. A microwatt link", t: "The payoff: an optical link at microwatt power",
intu: String.raw`Why does an interconnect group care about a cooling LED? Because a near-unity efficiency at nanoamps means a transmitter that spends almost nothing. The paper demonstrates optical data transmission at very low power. In the link budget language of Part 1, a microwatt transmitter needs a receiver that can read a few hundred nanowatts after coupling loss, which is fine at kilobit to megabit rates for sensors and dust-sized computers, though not for a terabit AI link. Slide the LED current and the bit rate and watch the photons per bit.`,
eq: String.raw`\[ P_{\mathrm{opt}} = \eta_{\mathrm{ext}}\frac{I}{q}h\nu, \qquad N_{\mathrm{photons/bit}} = \frac{P_{\mathrm{opt}}}{B\, h\nu} = \frac{\eta_{\mathrm{ext}} I}{q B} \]`,
sym: [[String.raw`\(P_{\mathrm{opt}}\)`, "optical power leaving the LED"], [String.raw`\(B\)`, "bit rate"], [String.raw`\(N_{\mathrm{photons/bit}}\)`, "photons available per bit at the transmitter"]],
how: ["Electrons per second is I over q, photons per second is that times the external efficiency.", "Divide by the bit rate for photons per bit.", "A receiver needs on the order of a thousand photons per bit for a low error rate with a simple detector, so the ratio tells you the fastest usable rate."],
say: String.raw`A microwatt LED transmitter gives I over q times the external efficiency photons per second, enough for kilobit to megabit links at nanowatt receiver powers.`,
num: "Paper (abstract): low-power optical data transmission demonstrated with the device. Details of the rate and the receiver are in the full text, which was not available. Secondary sources describe a 1 MB file sent error free at about 1 µW average optical power, unverified.",
r(fig, ctl) {
  ctl.innerHTML = sl("lI", "log10 LED current (A)", -9, -3, 0.1, -6) + sl("lB", "log10 bit rate (b/s)", 3, 9, 0.1, 6) + sl("ex", "External efficiency (%)", 1, 100, 1, 8);
  const draw = (t) => {
    const I = Math.pow(10, +$("lI").value), B = Math.pow(10, +$("lB").value), ex = +$("ex").value / 100; $("lIv").textContent = I.toExponential(0) + " A"; $("lBv").textContent = B.toExponential(0) + " b/s"; $("exv").textContent = (ex * 100).toFixed(0) + " %";
    const hv = 1.3 * 1.602e-19, Popt = ex * I / 1.602e-19 * hv, Nb = ex * I / (1.602e-19 * B);
    let s = tx(340, 20, `optical power ${(Popt * 1e6).toExponential(1)} µW, ${Nb.toExponential(1)} photons per bit`, "middle", "th");
    const x0 = 40, y = 90, L = 600; s += rc(x0, y, 70, 40, "var(--coral-bg)", PC) + tx(x0 + 35, y + 25, "LED", "middle", "t") + rc(x0 + L - 70, y, 70, 40, "var(--blue-bg)", PB) + tx(x0 + L - 35, y + 25, "detector", "middle", "t");
    const dots = Math.max(1, Math.min(40, Math.round(Math.log10(Math.max(Nb, 1)) * 5))); for (let k = 0; k < dots; k++) { const ph = (t * 0.4 + k / dots) % 1; s += `<circle cx="${(x0 + 70 + ph * (L - 140)).toFixed(1)}" cy="${y + 20 + 10 * Math.sin(k)}" r="3" fill="${PA}"/>`; }
    s += tx(340, y + 60, `dots scale with log photons per bit. Receivers need about a thousand photons per bit${Nb < 1000 ? ": too few here" : ": enough here"}`, "middle");
    fig.innerHTML = svg(y + 80, s);
  };
  ["lI", "lB", "ex"].forEach(i => $(i).oninput = () => draw(0));
  PIC.player(ctl, draw);
}}
],
summary: String.raw`An LED biased below its photon voltage emits photons that carry more energy than the electrons bring, and the difference comes from lattice heat. The 2019 IBM device reaches near-unity internal quantum efficiency at current densities below ten to the minus four amperes per square centimetre and runs with its bias about 30 percent below the photon voltage, because the quantum well and its interfaces keep non-radiative recombination tiny. Net cooling needs the external efficiency to beat the bias over photon voltage ratio, and with about 8 percent extraction the real device heats slightly, so cooling is a projection at 95 to 100 percent extraction. The practical result is a transmitter for microwatt optical links.`,
sheet: [
[String.raw`\[ E_{\mathrm{from\ lattice}} = h\nu - qV \]`, "Energy borrowed per photon when qV is below the photon energy"],
[String.raw`\[ \eta_{\mathrm{ext}} \gt qV/h\nu \]`, "Net cooling condition"],
[String.raw`\[ \eta_{\mathrm{int}} = \frac{Bn}{A + Bn + Cn^2} \]`, "ABC recombination model (teaching model)"],
[String.raw`\[ \sin\theta_c = 1/n, \quad \eta_{\mathrm{esc}} \approx \frac{1 - \cos\theta_c}{2}(1 - R) \]`, "Escape cone extraction per face"],
[String.raw`\[ N_{\mathrm{photons/bit}} = \eta_{\mathrm{ext}} I / (qB) \]`, "Photons per bit at the transmitter"]],
consts: String.raw`Photon voltage taken as 1.3 V (954 nm, from secondary sources, unverified). kT/q = 25.9 mV at 300 K. n = 3.5 gives a 16.6 degree critical angle and about 2 percent escape per flat face.`,
sources: ["N. Li, K. Han, W. Spratt, S. Bedell, J. Ott, M. Hopstaken, F. Libsch, Q. Li and D. K. Sadana, Ultra-low-power sub-photon-voltage high-efficiency light-emitting diodes, Nature Photonics 13, 588 (2019), DOI 10.1038/s41566-019-0463-x (abstract and one figure caption checked, paywalled)", "J. Tauc, The share of thermal energy taken from the surroundings in the electro-luminescent energy radiated from a p-n junction, Czech. J. Phys. 7, 275 (1957) (electroluminescent cooling)", "E. F. Schubert, Light-Emitting Diodes, 2nd ed., Cambridge (2006), Ch. 5 (ABC model) and Ch. 9 (escape cone and extraction)"]
});
})();
