(function () {
/* Part 1 Lesson 3: getting light on and off the chip. Overlap integrals and spectra are computed live. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const LAM = 1.55;
/* Gaussian overlap of two spots with waists w1, w2 and lateral offset d (Joyce and DeLoach 1984) */
const overlap = (w1, w2, d) => Math.pow(2 * w1 * w2 / (w1 * w1 + w2 * w2), 2) * Math.exp(-2 * d * d / (w1 * w1 + w2 * w2));
/* model mode field diameter of an inverted taper tip of width wt (nm), silicon on oxide: grows as the tip narrows */
const mfdTip = wt => 0.6 + 3.0 * Math.exp(-Math.pow(Math.max(0, wt - 60) / 120, 1.8));

addLesson("pic", "basics", {
level: "Core",
id: "pic-basics-l3", title: "Getting light on and off the chip: grating and edge couplers", short: "3. Couplers",
big: String.raw`A silicon waveguide mode is about half a micrometre wide. A fiber mode is ten micrometres. Pushing light between them is the single biggest loss in many links. There are two ways. A grating coupler diffracts the light upward out of the chip, so a fiber can sit above the surface, which is easy to test at wafer level but narrow in bandwidth and tied to one polarization. An edge coupler lets the waveguide taper down to a thin tip so the mode balloons outward to fiber size and leaves through a polished facet, which is broadband and polarization friendly but needs a cleaved edge and sub-micrometre alignment. This lesson shows the physics of both and lets you compute the overlap loss yourself.`,
bridge: String.raw`The grating phase matching condition is the one derived in the thesis Chapter 2 Lesson 5, so it is only recalled here. The overlap integral and its Gaussian closed form follow Joyce and DeLoach, Appl. Opt. 23, 4187 (1984). The inverted taper mode expansion is the mechanism of Almeida, Panepucci and Lipson, Opt. Lett. 28, 1302 (2003). Typical losses are teaching values, not one foundry's numbers.`,
cards: [

{s: "1. Two doors", t: "Two ways out: through the surface or through the edge",
intu: String.raw`Press the buttons to switch between the two couplers and play the animation. In the grating coupler, light moving along the waveguide hits a row of etched teeth and is thrown upward at a small angle into a fiber held above the chip. In the edge coupler, the waveguide narrows into a tip, the mode grows wider and wider, and it exits sideways through the chip facet into a fiber held against the edge.`,
eq: String.raw`\[ \eta_{\mathrm{grating}} \sim 40\text{ to }60\ \% \ (2\text{ to }4\ \mathrm{dB}), \qquad \eta_{\mathrm{edge}} \sim 80\ \%\text{ or more}\ (\le 1\ \mathrm{dB}) \]<div class="eqnote">typical values. Optimized gratings reach below 2 dB</div>`,
sym: [[String.raw`\(\eta\)`, "coupling efficiency, fraction of power transferred"], ["grating", "periodic etch that diffracts light out of plane"], ["edge, inverted taper", "waveguide that narrows so the mode expands, then meets the facet"]],
how: ["A grating is a surface device. The fiber is vertical or nearly so, and testing needs no polishing.", "An edge coupler is an in-plane device. The chip must be diced and polished, and the fiber is held at the facet.", "Both are passive. Their loss goes straight into the link budget, twice, once per chip."],
say: String.raw`A grating coupler sends light up through the surface and an edge coupler sends it out through the facet after a taper has expanded the mode.`,
num: "Grating couplers: 2 to 4 dB, 1 dB bandwidth 30 to 40 nm, one polarization. Edge couplers: about 1 dB, more than 100 nm bandwidth, both polarizations. Fiber mode field diameter 10.4 µm, lensed fiber 2.5 to 4 µm.",
r(fig, ctl) {
  ctl.innerHTML = btns([["g", "Grating coupler"], ["e", "Edge coupler"]], "k");
  let cur = "g"; ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { cur = b.dataset.k; pick(ctl, "k", cur); }); pick(ctl, "k", cur);
  PIC.player(ctl, (tsec) => {
    let s = "";
    if (cur === "g") {
      s += tx(340, 20, "grating coupler, side view", "middle", "th");
      s += `<rect x="40" y="150" width="600" height="60" fill="var(--sunk)" stroke="var(--b)"/>` + tx(50, 190, "buried oxide") + `<rect x="40" y="134" width="330" height="16" fill="${PB}"/>` + tx(60, 128, "waveguide");
      for (let i = 0; i < 12; i++) s += `<rect x="${370 + i * 20}" y="134" width="11" height="16" fill="${PB}"/>`;
      s += tx(480, 128, "etched teeth, period Λ", "middle");
      // fiber above, tilted
      s += `<g transform="rotate(10 520 60)"><rect x="505" y="-20" width="30" height="110" fill="${PA}" opacity="0.5" stroke="${PA}"/></g>` + tx(560, 40, "fiber, tilted about 10°");
      for (let k = 0; k < 8; k++) { const ph = (tsec * 0.5 + k / 8) % 1; if (ph < 0.5) { const x = 60 + ph * 2 * 330; s += `<circle cx="${x.toFixed(1)}" cy="142" r="4" fill="${PC}"/>`; } else { const q = (ph - 0.5) * 2; const x = 380 + q * 130, y = 134 - q * 120; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${PC}"/>`; } }
      for (let i = 0; i < 6; i++) s += `<line x1="${380 + i * 40}" y1="130" x2="${398 + i * 40}" y2="40" stroke="${PC}" stroke-dasharray="3 3" opacity="0.5"/>`;
    } else {
      s += tx(340, 20, "edge coupler, top view", "middle", "th");
      s += `<rect x="40" y="60" width="520" height="160" fill="var(--sunk)" stroke="var(--b)"/>` + tx(50, 80, "chip, oxide cladding");
      s += `<polygon points="40,132 420,136 560,139 560,141 420,144 40,148" fill="${PB}"/>` + tx(120, 125, "waveguide 450 nm wide") + tx(470, 160, "tip about 150 nm", "middle");
      s += `<line x1="560" y1="60" x2="560" y2="220" stroke="var(--b)" stroke-width="3"/>` + tx(566, 230, "facet");
      s += `<rect x="570" y="110" width="80" height="60" fill="${PA}" opacity="0.5" stroke="${PA}"/>` + tx(610, 100, "fiber", "middle");
      for (let k = 0; k < 8; k++) { const ph = (tsec * 0.5 + k / 8) % 1; const x = 60 + ph * 580; const w = x < 420 ? 6 : 6 + (x - 420) / 140 * 40; s += `<ellipse cx="${x.toFixed(1)}" cy="140" rx="4" ry="${w.toFixed(1)}" fill="${PC}" opacity="${(0.9 - 0.5 * (w - 6) / 40).toFixed(2)}"/>`; }
      s += tx(300, 200, "the mode (red) grows as the core narrows, then matches the fiber", "middle");
    }
    fig.innerHTML = svg(240, s);
  });
}},

{s: "2. Phase matching", t: "The grating recalled: period picks the angle",
intu: String.raw`A grating only works when the light scattered from every tooth adds in phase in one direction. That fixes the output angle for a given period and wavelength. Drag the period and watch the beam angle move. A fiber is usually tilted about 10 degrees so that the second order reflection does not bounce straight back into the waveguide. The full derivation is in the thesis Chapter 2 Lesson 5. Here the point is that the angle depends on wavelength, which is where the limited bandwidth comes from.`,
eq: String.raw`\[ n_{\mathrm{eff}} - n_{c}\sin\theta = \frac{\lambda}{\Lambda} \quad\Longrightarrow\quad \sin\theta = \frac{n_{\mathrm{eff}} - \lambda/\Lambda}{n_c} \]<div class="eqref">thesis Ch. 2 Lesson 5, first order diffraction</div>`,
sym: [[String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(\theta\)`, "beam angle from the surface normal, in the cladding"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the grating region, about 2.8 for a shallow etched 220 nm film"], [String.raw`\(n_c\)`, "cladding index, 1.44 for oxide"]],
how: ["Each tooth is a scatterer. Their contributions add when the phase difference per period equals the free space phase advance along the output direction.", "That is the Bragg condition with the first diffraction order.", String.raw`Differentiate with respect to \(\lambda\): the angle drifts by about 0.1 degree per nanometre, so a fixed fiber only captures a band of wavelengths.`],
say: String.raw`The grating period sets the output angle through phase matching, and because the angle moves with wavelength the coupler is narrowband.`,
num: "Effective index 2.83, cladding 1.44, period 630 nm at 1550 nm: angle 14.6 degrees. Period 600 nm: 10.3 degrees. The angle moves about 0.1 degrees per nm of wavelength.",
r(fig, ctl) {
  ctl.innerHTML = sl("per", "Period Λ (nm)", 540, 720, 2, 630) + sl("lam", "Wavelength (nm)", 1500, 1600, 1, 1550);
  const u = () => {
    const per = +$("per").value / 1000, lam = +$("lam").value / 1000; $("perv").textContent = (per * 1000).toFixed(0) + " nm"; $("lamv").textContent = (lam * 1000).toFixed(0) + " nm";
    const neff = 2.83, nc = 1.44; const sin = (neff - lam / per) / nc; const th = Math.abs(sin) <= 1 ? Math.asin(sin) * 180 / Math.PI : NaN;
    let s = tx(340, 20, Number.isFinite(th) ? `beam angle θ = ${th.toFixed(1)}°` : "no radiating order", "middle", "th");
    s += `<rect x="40" y="170" width="600" height="40" fill="var(--sunk)" stroke="var(--b)"/>`;
    const N = 14, px = Math.max(8, per * 70); for (let i = 0; i < N; i++) s += `<rect x="${200 + i * px}" y="156" width="${px * 0.5}" height="14" fill="${PB}"/>`;
    s += `<rect x="40" y="156" width="160" height="14" fill="${PB}"/>` + tx(60, 150, "light in →");
    if (Number.isFinite(th)) { const a = th * Math.PI / 180; const cx = 200 + N * px / 2; for (let i = -2; i <= 2; i++) { const x = cx + i * 30; s += `<line x1="${x}" y1="156" x2="${(x + 120 * Math.sin(a)).toFixed(1)}" y2="${(156 - 120 * Math.cos(a)).toFixed(1)}" stroke="${PC}" stroke-width="2" opacity="0.7"/>`; } s += `<line x1="${cx}" y1="156" x2="${cx}" y2="40" stroke="var(--b)" stroke-dasharray="4 3"/>` + `<path d="M${cx} 90 A66 66 0 0 1 ${(cx + 66 * Math.sin(a)).toFixed(1)} ${(156 - 66 * Math.cos(a)).toFixed(1)}" fill="none" stroke="var(--p)"/>` + tx(cx + 10, 84, "θ"); }
    fig.innerHTML = svg(224, s);
  };
  $("per").oninput = u; $("lam").oninput = u; u();
}},

{s: "3. Inverted taper", t: "The inverted taper: a thinner core makes a bigger mode",
intu: String.raw`It sounds backwards. To make the mode large, make the waveguide small. As the silicon core narrows to a tip of about 100 to 150 nm, it can no longer hold the light tightly. The effective index drops toward the oxide value and the field spreads out to several micrometres, close to the size of a lensed fiber. Drag the tip width and watch the mode balloon. Play runs the light down the taper.`,
eq: String.raw`\[ w_{\mathrm{tip}} \downarrow \;\Rightarrow\; n_{\mathrm{eff}} \to n_{\mathrm{clad}} \;\Rightarrow\; \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2} \to 0 \;\Rightarrow\; \text{MFD} \sim \frac{2}{\gamma} \uparrow \]`,
sym: [[String.raw`\(w_{\mathrm{tip}}\)`, "width of the silicon at the tip"], [String.raw`\(\gamma\)`, "decay constant of the field outside the core"], ["MFD", "mode field diameter, the width at which the field falls to 1/e"]],
how: ["A narrow core raises the fraction of the mode in the cladding, which lowers the effective index.", "A smaller effective index means a smaller decay constant outside the core, so the tail reaches further.", "The taper must be long and gentle, typically 100 to 300 µm, so the mode follows adiabatically without scattering.", "Often an oxide or nitride overlay waveguide a few micrometres wide takes over at the tip to fix the final mode size."],
say: String.raw`An inverted taper narrows the core until the mode is barely bound, so it expands to fiber size before the facet.`,
num: "Tip 120 nm: mode about 3 µm, matching a lensed fiber. Tip 450 nm: mode about 0.6 µm. Taper length 150 to 300 µm. Loss near 1 dB with a lensed fiber, 2 to 3 dB to a standard 10 µm fiber without an overlay.",
r(fig, ctl) {
  ctl.innerHTML = sl("wt", "Tip width (nm)", 60, 450, 5, 120);
  PIC.player(ctl, (tsec) => {
    const wt = +$("wt").value; $("wtv").textContent = wt + " nm"; const m = mfdTip(wt);
    let s = tx(340, 20, `mode field diameter at the tip ≈ ${m.toFixed(1)} µm (model)`, "middle", "th");
    const x0 = 40, x1 = 560, yc = 130;
    const wAt = x => 450 - (450 - wt) * (x - x0) / (x1 - x0);   // nm
    const mAt = x => mfdTip(wAt(x));
    s += `<polygon points="${x0},${yc - 6} ${x1},${yc - wt / 150} ${x1},${yc + wt / 150} ${x0},${yc + 6}" fill="${PB}"/>` + tx(x0, yc - 14, "silicon core, 450 nm → " + wt + " nm");
    let top = "", bot = ""; for (let i = 0; i <= 60; i++) { const x = x0 + (x1 - x0) * i / 60; const r = mAt(x) * 26; top += (i ? "L" : "M") + x.toFixed(1) + " " + (yc - r).toFixed(1); bot = "L" + x.toFixed(1) + " " + (yc + r).toFixed(1) + " " + bot; }
    s += `<path d="${top} ${bot.replace(/^L/, "L")} Z" fill="${PC}" fill-opacity="0.18" stroke="${PC}" stroke-width="1.5"/>`;
    for (let k = 0; k < 7; k++) { const ph = (tsec * 0.35 + k / 7) % 1; const x = x0 + ph * (x1 - x0); const r = mAt(x) * 26; s += `<ellipse cx="${x.toFixed(1)}" cy="${yc}" rx="3" ry="${r.toFixed(1)}" fill="${PC}" opacity="0.5"/>`; }
    s += `<line x1="${x1}" y1="40" x2="${x1}" y2="220" stroke="var(--b)" stroke-width="3"/>` + tx(x1 + 6, 230, "facet") + `<rect x="${x1 + 10}" y="${yc - 36}" width="70" height="72" fill="${PA}" opacity="0.4"/>` + tx(x1 + 45, yc - 44, "fiber", "middle");
    s += tx(300, 230, "red envelope: mode width along the taper (vertical scale exaggerated)", "middle");
    fig.innerHTML = svg(244, s);
  });
}},

{s: "4. Overlap", t: "The overlap integral: how much of one mode fits in the other",
intu: String.raw`Coupling efficiency between two beams is the squared overlap of their fields. For two Gaussian spots there is a closed formula. Two spots of equal size and perfect alignment give 100 percent. A silicon mode of 0.6 µm against a 10 µm fiber gives about 1.4 percent, a loss of 18 dB, which is why a bare facet is useless and the taper is needed. Drag the two widths and the offset and read the loss in dB.`,
eq: String.raw`\[ \eta = \frac{\left|\int E_1^{*} E_2\, dA\right|^2}{\int |E_1|^2 dA \int |E_2|^2 dA} \quad\xrightarrow{\text{Gaussians}}\quad \eta = \left(\frac{2 w_1 w_2}{w_1^2 + w_2^2}\right)^{2} \exp\!\left(-\frac{2 d^2}{w_1^2 + w_2^2}\right) \]`,
sym: [[String.raw`\(E_1, E_2\)`, "transverse fields of the two modes"], [String.raw`\(w_1, w_2\)`, "1/e field radii of the two Gaussian spots"], [String.raw`\(d\)`, "lateral misalignment between the spot centres"], [String.raw`\(\eta\)`, "power coupling efficiency"]],
how: ["Expand the fiber field in the modes of the waveguide. The coefficient of the guided mode is the overlap integral.", "Power goes as the square of the coefficient, normalized by both mode powers.", "For Gaussians the integral is elementary and gives the closed form.", "The exponential factor shows how fast misalignment hurts: an offset equal to the spot radius costs about 4 dB."],
say: String.raw`Coupling efficiency is the normalized squared overlap of the two mode fields, and for Gaussians it depends only on the size ratio and the offset.`,
num: "w1 = w2, d = 0: 100 percent. Size ratio 2: 64 percent, 1.9 dB. Ratio 3: 36 percent, 4.4 dB. 0.6 µm against 10.4 µm: 1.3 percent, 19 dB. Offset of 1 µm between 3 µm spots: 0.8 dB.",
r(fig, ctl) {
  ctl.innerHTML = sl("w1", "Chip mode MFD (µm)", 0.5, 12, 0.1, 3) + sl("w2", "Fiber MFD (µm)", 2, 12, 0.1, 3.5) + sl("d", "Offset (µm)", 0, 4, 0.1, 0);
  const u = () => {
    const w1 = +$("w1").value / 2, w2 = +$("w2").value / 2, d = +$("d").value; $("w1v").textContent = (2 * w1).toFixed(1) + " µm"; $("w2v").textContent = (2 * w2).toFixed(1) + " µm"; $("dv").textContent = d.toFixed(1) + " µm";
    const eta = overlap(w1, w2, d);
    const x0 = 60, w = 380, y0 = 36, h = 170; const xs = range(-8, 8, 161);
    let s = C3.frame(x0, y0, w, h, -8, 8, 0, 1.05, [-8, -4, 0, 4, 8], [0, 0.5, 1], "position (µm)", "field", v => v.toFixed(0), v => v.toFixed(1));
    s += plot(x0, y0, w, h, xs, xs.map(x => Math.exp(-x * x / (w1 * w1))), -8, 8, 0, 1.05, PB, 2.5) + plot(x0, y0, w, h, xs, xs.map(x => Math.exp(-(x - d) * (x - d) / (w2 * w2))), -8, 8, 0, 1.05, PA, 2.5);
    s += C3.legend(x0 + 10, y0 + 16, [["chip mode", PB], ["fiber mode", PA]]);
    // efficiency gauge
    const gx = 500, gy = y0, gh = h; s += `<rect x="${gx}" y="${gy}" width="40" height="${gh}" fill="var(--sunk)" stroke="var(--b)"/><rect x="${gx}" y="${gy + gh - gh * eta}" width="40" height="${gh * eta}" fill="${PT}"/>` + tx(gx + 20, gy + gh + 16, "η", "middle") + tx(gx + 60, gy + gh / 2 - 8, `${(100 * eta).toFixed(1)} %`, null, "t") + tx(gx + 60, gy + gh / 2 + 12, `${(-PIC.dB(eta)).toFixed(1)} dB loss`, null, "t");
    fig.innerHTML = svg(y0 + h + 40, s);
  };
  ["w1", "w2", "d"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Bandwidth", t: "Bandwidth: why a grating sees 35 nm and an edge sees 100",
intu: String.raw`Sweep the wavelength and watch the two couplers. The grating's efficiency falls off on both sides of its design wavelength because the beam angle walks away from the fiber. The edge coupler barely cares. For a single wavelength link both work. For a wavelength division link with 8 or 16 channels spread over 30 to 60 nm, the grating's roll off eats the outer channels and the edge coupler keeps them.`,
eq: String.raw`\[ \eta_{g}(\lambda) \approx \eta_0 \exp\!\left[-\left(\frac{\lambda - \lambda_0}{\Delta\lambda_{e}}\right)^{2}\right], \qquad \Delta\lambda_{1\mathrm{dB}} \approx 0.96\,\Delta\lambda_e \]<div class="eqnote">a Gaussian fit to a typical uniform grating response</div>`,
sym: [[String.raw`\(\lambda_0\)`, "design wavelength of the grating"], [String.raw`\(\Delta\lambda_e\)`, "1/e half width of the response, about 36 nm for a 220 nm SOI grating"], [String.raw`\(\Delta\lambda_{1\mathrm{dB}}\)`, "full width where efficiency is within 1 dB of the peak"]],
how: ["The angle shift per nm from card 2 moves the beam across the fiber core.", "The fiber captures a Gaussian window of angles, so the response in wavelength is close to Gaussian.", "Edge couplers have no grating, so only the slow change of mode size with wavelength matters."],
say: String.raw`A grating coupler's response is a Gaussian a few tens of nanometres wide because the output angle moves with wavelength, while an edge coupler is nearly flat over 100 nm.`,
num: "Typical grating: peak 3 dB, 1 dB bandwidth 35 nm, 3 dB bandwidth 60 nm. Edge coupler: 1 dB over more than 100 nm. An 8 channel WDM grid at 100 GHz spans 5.6 nm, at 400 GHz 22 nm.",
r(fig, ctl) {
  ctl.innerHTML = sl("nch", "WDM channels", 1, 16, 1, 8) + sl("sp", "Channel spacing (nm)", 0.8, 6.4, 0.8, 3.2);
  PIC.player(ctl, (tsec) => {
    const nch = +$("nch").value, sp = +$("sp").value; $("nchv").textContent = nch; $("spv").textContent = sp.toFixed(1) + " nm";
    const lam = 1500 + 50 * (1 + Math.sin(tsec * 0.6));
    const g = l => -3 - 4.343 * Math.pow((l - 1550) / 36, 2), e = l => -1 - 0.3 * Math.pow((l - 1550) / 60, 2);
    const x0 = 60, w = 560, y0 = 36, h = 170; const ls = range(1480, 1620, 141);
    let s = C3.frame(x0, y0, w, h, 1480, 1620, -12, 0, [1480, 1520, 1560, 1600], [-12, -9, -6, -3, 0], "wavelength (nm)", "coupling (dB)", v => v.toFixed(0), v => v.toFixed(0));
    s += plot(x0, y0, w, h, ls, ls.map(g), 1480, 1620, -12, 0, PB, 2.5) + plot(x0, y0, w, h, ls, ls.map(e), 1480, 1620, -12, 0, PT, 2.5);
    for (let i = 0; i < nch; i++) { const lc = 1550 + (i - (nch - 1) / 2) * sp; s += `<line x1="${C3.X(x0, w, 1480, 1620)(lc)}" x2="${C3.X(x0, w, 1480, 1620)(lc)}" y1="${y0 + h}" y2="${C3.Y(y0, h, -12, 0)(Math.max(-12, g(lc)))}" stroke="${PP}" stroke-width="2" opacity="0.6"/>`; }
    const xm = C3.X(x0, w, 1480, 1620)(lam); s += `<line x1="${xm}" x2="${xm}" y1="${y0}" y2="${y0 + h}" stroke="${PC}" stroke-dasharray="4 3"/>` + tx(xm, y0 - 8, `${lam.toFixed(0)} nm: grating ${g(lam).toFixed(1)} dB, edge ${e(lam).toFixed(1)} dB`, "middle", "t");
    s += C3.legend(x0 + 330, y0 + 60, [["grating", PB], ["edge", PT], ["WDM", PP]]);
    const worst = g(1550 + (nch - 1) / 2 * sp); s += tx(x0 + 8, y0 + h - 8, `outer channel on the grating: ${worst.toFixed(1)} dB`);
    fig.innerHTML = svg(y0 + h + 40, s);
  });
}},

{s: "6. Polarization", t: "Polarization: gratings pick one, edges take both",
intu: String.raw`The grating phase matching uses the effective index of the grating region, and TE and TM have different effective indices. A grating tuned for TE sends TM to the wrong angle, so TM light is largely lost. Fibers scramble polarization, so a grating receiver needs a two dimensional grating or a polarization splitting grating. An edge coupler expands both polarizations to nearly the same size and takes both. Drag the period to see the TE and TM angles separate.`,
eq: String.raw`\[ \sin\theta_{\mathrm{TE}} = \frac{n_{\mathrm{eff,TE}} - \lambda/\Lambda}{n_c}, \qquad \sin\theta_{\mathrm{TM}} = \frac{n_{\mathrm{eff,TM}} - \lambda/\Lambda}{n_c} \]<div class="eqnote">different effective indices, different angles</div>`,
sym: [[String.raw`\(n_{\mathrm{eff,TE}}, n_{\mathrm{eff,TM}}\)`, "effective indices of the two polarizations in the grating region, about 2.83 and 2.0 for a 220 nm film"], [String.raw`\(\theta_{\mathrm{TE}}, \theta_{\mathrm{TM}}\)`, "their output angles"]],
how: ["The 220 nm film is thin, so the TM mode is much less confined and its effective index is far lower.", "Phase matching then gives a different angle, tens of degrees away for the same period.", "Solutions: a 2D grating with two output waveguides, or a polarization splitter before the coupler.", "The inverted taper tip is nearly symmetric, so its mode is nearly polarization independent."],
say: String.raw`Because TE and TM have different effective indices a grating couples only one of them, while an edge coupler takes both.`,
num: "220 nm SOI grating, period 630 nm at 1550 nm: TE at 14.6 degrees, TM at about minus 30 degrees, far outside the fiber acceptance. Polarization dependent loss of an edge coupler: below 0.5 dB.",
r(fig, ctl) {
  ctl.innerHTML = sl("per2", "Period Λ (nm)", 540, 900, 5, 630);
  const u = () => {
    const per = +$("per2").value / 1000; $("per2v").textContent = (per * 1000).toFixed(0) + " nm";
    const nc = 1.44; const ang = n => { const sn = (n - LAM / per) / nc; return Math.abs(sn) <= 1 ? Math.asin(sn) * 180 / Math.PI : NaN; };
    const tTE = ang(2.83), tTM = ang(2.0);
    let s = tx(340, 20, `TE at ${Number.isFinite(tTE) ? tTE.toFixed(1) + "°" : "no order"}, TM at ${Number.isFinite(tTM) ? tTM.toFixed(1) + "°" : "no order"}`, "middle", "th");
    s += `<rect x="40" y="170" width="600" height="40" fill="var(--sunk)" stroke="var(--b)"/>`; for (let i = 0; i < 16; i++) s += `<rect x="${200 + i * 20}" y="156" width="10" height="14" fill="${PB}"/>`; s += `<rect x="40" y="156" width="160" height="14" fill="${PB}"/>`;
    const cx = 360; s += `<line x1="${cx}" y1="156" x2="${cx}" y2="40" stroke="var(--b)" stroke-dasharray="4 3"/>`;
    const draw = (t, col, lab) => { if (!Number.isFinite(t)) return; const a = t * Math.PI / 180; s += `<line x1="${cx}" y1="156" x2="${(cx + 120 * Math.sin(a)).toFixed(1)}" y2="${(156 - 120 * Math.cos(a)).toFixed(1)}" stroke="${col}" stroke-width="3"/>` + tx((cx + 135 * Math.sin(a)).toFixed(1), (156 - 135 * Math.cos(a)).toFixed(1), lab, "middle", "t"); };
    draw(tTE, PB, "TE"); draw(tTM, PC, "TM");
    s += `<path d="M${cx - 40} 36 L${cx - 20} 36 L${cx + 20} 36 L${cx + 40} 36" stroke="${PA}" stroke-width="10" opacity="0.4"/>` + tx(cx + 50, 40, "fiber acceptance cone (near vertical)");
    fig.innerHTML = svg(224, s);
  };
  $("per2").oninput = u; u();
}}
],
summary: String.raw`Getting light between a half micrometre silicon mode and a ten micrometre fiber mode is the costliest step in a link. A grating coupler diffracts the light out of the surface at an angle set by phase matching, which makes it easy to test but narrowband, about 35 nm at 1 dB, and single polarization. An edge coupler narrows the core to a tip so the mode expands, then matches a lensed fiber through the facet with about 1 dB loss, broadband and for both polarizations. The loss of either is the squared overlap integral of the two mode fields, and for Gaussians it depends only on the size ratio and the offset.`,
sheet: [
[String.raw`\[ n_{\mathrm{eff}} - n_c \sin\theta = \lambda/\Lambda \]`, "Grating phase matching (thesis Ch. 2 Lesson 5)"],
[String.raw`\[ \eta = \frac{|\int E_1^* E_2\, dA|^2}{\int|E_1|^2 dA \int |E_2|^2 dA} \]`, "Overlap integral, coupling efficiency"],
[String.raw`\[ \eta = \left(\frac{2 w_1 w_2}{w_1^2 + w_2^2}\right)^2 e^{-2d^2/(w_1^2 + w_2^2)} \]`, "Gaussian overlap with size mismatch and offset"],
[String.raw`\[ \text{MFD} \sim 2/\gamma, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2} \]`, "Inverted taper: weak confinement expands the mode"],
[String.raw`\[ \eta_g(\lambda) \approx \eta_0 e^{-((\lambda - \lambda_0)/\Delta\lambda_e)^2} \]`, "Grating coupler bandwidth, Gaussian fit"]],
consts: String.raw`\(\lambda = 1.55\) µm, grating region \(n_{\mathrm{eff,TE}} = 2.83\), \(n_{\mathrm{eff,TM}} = 2.0\), oxide 1.44. The taper mode size curve is a model calibrated to published tip widths and mode sizes.`,
sources: ["V. R. Almeida, R. R. Panepucci and M. Lipson, Nanotaper for compact mode conversion, Opt. Lett. 28, 1302 (2003)", "W. B. Joyce and B. C. DeLoach, Alignment of Gaussian beams, Appl. Opt. 23, 4187 (1984)", "D. Taillaert et al., Grating couplers for coupling between optical fibers and nanophotonic waveguides, Jpn. J. Appl. Phys. 45, 6071 (2006)", "Thesis Chapter 2 Lesson 5, grating couplers (phase matching derivation)", "Tidy3D example notebooks Autograd6GratingCoupler and Autograd16BilayerCoupler (inverse designed couplers)"]
});
})();
