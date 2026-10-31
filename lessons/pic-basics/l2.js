(function () {
/* Part 1 Lesson 2: platforms. Slab modes are computed live with C2.slabN and C2.slabProfile (thesis Ch. 2 tools),
   everything else with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const PLAT = { si: { name: "Silicon on insulator", n: 3.48, nc: 1.44, t: 0.22, w: 0.5, loss: 2, R0: 1.2, col: PB }, sin: { name: "Silicon nitride", n: 2.0, nc: 1.44, t: 0.4, w: 1.0, loss: 0.1, R0: 12, col: PT } };
const LAM = 1.55;

addLesson("pic", "basics", {
level: "Foundations",
id: "pic-basics-l2", title: "Platforms: silicon, silicon nitride and what index contrast buys you", short: "2. Platforms",
big: String.raw`A platform is the stack of materials a foundry gives you: a thin film of high index on top of a thick oxide. Silicon on insulator uses a 220 nm silicon film with index about 3.48 on silicon dioxide at 1.44. Silicon nitride uses a thicker film at index 2.0 on the same oxide. The difference in index between film and cladding, the index contrast, sets almost everything that follows: how tightly the mode is held, how sharp a bend can be, how fast the chip can be made small, and how much light is lost to rough sidewalls. High contrast buys small devices and pays with loss and sensitivity to fabrication. This lesson computes the slab modes live so you can see the trade.`,
bridge: String.raw`The slab mode solver is the same one used in the thesis Chapter 2 Lesson 2, now applied to the two interconnect platforms. Index values follow the Tidy3D material library entries for cSi, SiO2 and Si3N4 at 1550 nm. The sidewall loss scaling is the Payne and Lacey model (Opt. Quantum Electron. 1994), shown in its qualitative form. The bend loss curve is an illustrative exponential model, not a measurement.`,
cards: [

{s: "1. Index contrast", t: "Two platforms, one idea: a high index film on a low index cladding",
intu: String.raw`Light stays in the film because the film has a higher index than the oxide around it, the same total internal reflection that holds light in a fiber. The bigger the index step, the more strongly the light is held. Press a platform button to switch the cross-section and read the index step \(\Delta n\). Silicon's step is about 2.0, nitride's about 0.56, roughly four times smaller.`,
eq: String.raw`\[ \Delta n = n_{\mathrm{core}} - n_{\mathrm{clad}}, \qquad \text{NA} = \sqrt{n_{\mathrm{core}}^2 - n_{\mathrm{clad}}^2} \]<div class="eqnote">numerical aperture measures how steep a ray can be and still be trapped</div>`,
sym: [[String.raw`\(n_{\mathrm{core}}\)`, "index of the guiding film: 3.48 for silicon, 2.0 for nitride"], [String.raw`\(n_{\mathrm{clad}}\)`, "index of the oxide cladding, 1.44"], [String.raw`\(\Delta n\)`, "index contrast"], ["NA", "numerical aperture, the sine of the largest trapped ray angle"]],
how: ["A ray inside the film hits the oxide at an angle. Above the critical angle it is fully reflected.", String.raw`The critical angle is \(\arcsin(n_{\mathrm{clad}}/n_{\mathrm{core}})\), so a larger contrast traps steeper rays.`, "Steeper trapped rays means the field can be squeezed into a thinner, narrower core."],
say: String.raw`Index contrast is the index step between the film and the oxide, and it sets how tightly a platform can hold light.`,
num: "Silicon: contrast 2.04, NA 3.17, critical angle 24 degrees. Nitride: contrast 0.56, NA 1.39, critical angle 46 degrees. Both are on 2 to 3 µm of buried oxide so the mode never touches the silicon substrate.",
r(fig, ctl) {
  ctl.innerHTML = btns([["si", "Silicon on insulator"], ["sin", "Silicon nitride"]], "p");
  let cur = "si";
  const u = () => {
    pick(ctl, "p", cur); const P = PLAT[cur];
    const sc = 260; // px per um
    const x0 = 120, yb = 230, w = P.w * sc, h = P.t * sc;
    let s = tx(340, 20, P.name + ", cross-section to scale", "middle", "th");
    s += `<rect x="40" y="${yb}" width="600" height="60" fill="#d9d2c5" stroke="var(--b)"/>` + tx(50, yb + 36, "silicon substrate");
    s += `<rect x="40" y="${yb - 150}" width="600" height="150" fill="var(--sunk)" stroke="var(--b)"/>` + tx(50, yb - 130, "buried oxide, n = 1.44, 2 to 3 µm thick");
    s += `<rect x="40" y="40" width="600" height="${yb - 150 - 40}" fill="var(--panel)" stroke="var(--b)"/>` + tx(50, 60, "oxide cladding, n = 1.44");
    s += `<rect x="${340 - w / 2}" y="${yb - 150 - h}" width="${w}" height="${h}" fill="${P.col}" opacity="0.85"/>` + tx(340, yb - 150 - h - 8, `${P.name.split(" ")[0]} film, n = ${P.n}, ${(P.t * 1000).toFixed(0)} nm × ${(P.w * 1000).toFixed(0)} nm`, "middle", "t");
    const theta = Math.asin(P.nc / P.n) * 180 / Math.PI;
    fig.innerHTML = svg(yb + 70, s);
    ctl.querySelector("#ro") && ctl.querySelector("#ro").remove();
    ctl.insertAdjacentHTML("beforeend", `<div id="ro">${PIC.readout([["contrast Δn", (P.n - P.nc).toFixed(2)], ["NA", Math.sqrt(P.n * P.n - P.nc * P.nc).toFixed(2)], ["critical angle", theta.toFixed(0) + "°"]])}</div>`);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { cur = b.dataset.p; u(); }); u();
}},

{s: "2. Slab mode", t: "The slab effective index, computed live",
intu: String.raw`Take the film alone, infinitely wide, and solve for the guided wave. Its phase travels with an effective index between the cladding and the core. A thicker film or a higher index pulls the effective index up toward the core value. Drag the thickness and watch the index and the field profile change. Below a certain thickness the mode spreads far into the oxide, and for a very thin film the solver returns no bound mode at all.`,
eq: String.raw`\[ \tan\!\left(\frac{k_x t}{2}\right) = \frac{\gamma}{k_x}, \qquad k_x = k_0\sqrt{n_{\mathrm{core}}^2 - n_{\mathrm{eff}}^2}, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2} \]<div class="eqref">TE fundamental mode of a symmetric slab</div>`,
sym: [[String.raw`\(n_{\mathrm{eff}}\)`, "effective index, phase velocity is c over this"], [String.raw`\(k_x\)`, "transverse wavenumber inside the core"], [String.raw`\(\gamma\)`, "decay constant of the evanescent tail in the cladding"], [String.raw`\(t\)`, "film thickness"], [String.raw`\(k_0 = 2\pi/\lambda\)`, "free space wavenumber"]],
how: ["Inside the core the field is a cosine, outside it decays exponentially.", "Matching the field and its slope at the two interfaces gives the transcendental equation.", "The solver finds the root by bisection between the cladding and core indices.", "The same equation with the squared index ratio in front of the right side gives the TM mode."],
say: String.raw`The effective index is the root of the slab equation and lies between the cladding and core indices, rising with film thickness.`,
num: "Silicon 220 nm slab at 1550 nm: TE effective index about 2.83. Nitride 400 nm slab: about 1.60. A 220 nm by 450 nm silicon strip has an effective index near 2.4 and a group index near 4.2.",
r(fig, ctl) {
  ctl.innerHTML = btns([["si", "Silicon"], ["sin", "Nitride"]], "p") + sl("t", "Film thickness (nm)", 60, 800, 10, 220);
  let cur = "si";
  const u = () => {
    pick(ctl, "p", cur); const P = PLAT[cur]; const t = +$("t").value / 1000; $("tv").textContent = (t * 1000).toFixed(0) + " nm";
    const ts = range(0.05, 0.8, 76), ns = ts.map(tt => C2.slabN(P.n, P.nc, tt, LAM, 0, "TE"));
    const N = C2.slabN(P.n, P.nc, t, LAM, 0, "TE");
    const x0 = 60, w = 320, y0 = 36, h = 180;
    let s = C3.frame(x0, y0, w, h, 0, 0.8, 1.4, 3.5, [0, 0.2, 0.4, 0.6, 0.8], [1.5, 2, 2.5, 3, 3.5], "film thickness (µm)", "effective index");
    s += plot(x0, y0, w, h, ts, ns.map(v => v == null ? NaN : v), 0, 0.8, 1.4, 3.5, P.col, 2.5);
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${C3.Y(y0, h, 1.4, 3.5)(P.n)}" y2="${C3.Y(y0, h, 1.4, 3.5)(P.n)}" stroke="var(--b)" stroke-dasharray="3 3"/>` + tx(x0 + w - 4, C3.Y(y0, h, 1.4, 3.5)(P.n) - 4, "core index", "end");
    if (N) s += `<circle cx="${C3.X(x0, w, 0, 0.8)(t)}" cy="${C3.Y(y0, h, 1.4, 3.5)(N)}" r="6" fill="${PC}"/>`;
    // profile on the right
    const px = 430, pw = 220; s += tx(px + pw / 2, y0 - 10, "field profile Ey", "middle");
    if (N) { const zs = range(-1, 1, 161), pr = C2.slabProfile(P.n, P.nc, t, LAM, 0, "TE", N, zs); s += `<rect x="${px}" y="${y0 + h / 2 - t / 2 * h / 2}" width="${pw}" height="${t * h / 2}" fill="${P.col}" opacity="0.25"/>`; let d = ""; zs.forEach((z, i) => { const X = px + pr.main[i] * (pw - 10), Y = y0 + h / 2 - z * h / 2; d += (i ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${PC}" stroke-width="2"/>` + tx(px + pw / 2, y0 + h + 16, "shaded band is the film, z from −1 to 1 µm", "middle"); }
    else s += tx(px + pw / 2, y0 + h / 2, "no bound TE mode", "middle", "t");
    fig.innerHTML = svg(y0 + h + 40, s);
    ctl.querySelector("#ro") && ctl.querySelector("#ro").remove();
    ctl.insertAdjacentHTML("beforeend", `<div id="ro">${PIC.readout([["n_eff (TE)", N ? N.toFixed(3) : "none"], ["tail decay 1/γ", N ? (1 / (2 * Math.PI / LAM * Math.sqrt(N * N - P.nc * P.nc)) * 1000).toFixed(0) + " nm" : "—"]])}</div>`);
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { cur = b.dataset.p; u(); }); $("t").oninput = u; u();
}},

{s: "3. Confinement", t: "Mode size and confinement: how much light sits in the core",
intu: String.raw`The confinement factor is the fraction of the mode's power inside the film. Silicon at 220 nm keeps about three quarters of the light in the core. A thin nitride film keeps much less, so its mode is wide, which is good for coupling to fibers and bad for packing devices close together. Press Play to watch the film thin out and thicken while the confinement follows.`,
eq: String.raw`\[ \Gamma = \frac{\int_{\mathrm{core}} |E|^2\, dx}{\int_{-\infty}^{\infty} |E|^2\, dx} \]`,
sym: [[String.raw`\(\Gamma\)`, "confinement factor, between 0 and 1"], [String.raw`\(|E|^2\)`, "field intensity profile of the mode"]],
how: ["Integrate the intensity over the core only, then over everything.", "Their ratio is the fraction of power that feels the core material.", String.raw`\(\Gamma\) also sets how strongly the mode feels a change of the core index, which matters for modulators and thermal tuning.`],
say: String.raw`The confinement factor is the fraction of modal power inside the core, high for silicon and lower for thin nitride.`,
num: "Silicon 220 nm slab, TE: about 0.76. Nitride 400 nm slab: about 0.55. Nitride 100 nm: below 0.1, with a mode several micrometres wide, used for low loss delay lines.",
r(fig, ctl) {
  ctl.innerHTML = btns([["si", "Silicon"], ["sin", "Nitride"]], "p");
  let cur = "si";
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { cur = b.dataset.p; pick(ctl, "p", cur); });
  pick(ctl, "p", cur);
  PIC.player(ctl, (tsec) => {
    const P = PLAT[cur]; const t = 0.08 + 0.36 * (0.5 - 0.5 * Math.cos(tsec * 0.9)) * (cur === "si" ? 1 : 2);
    const N = C2.slabN(P.n, P.nc, t, LAM, 0, "TE");
    const x0 = 60, w = 560, y0 = 36, h = 170;
    let s = tx(340, 20, `${P.name}, film ${(t * 1000).toFixed(0)} nm`, "middle", "th");
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)" stroke="var(--b)"/>`;
    s += `<rect x="${x0}" y="${y0 + h / 2 - t / 2 * h / 2.4}" width="${w}" height="${t * h / 2.4}" fill="${P.col}" opacity="0.3"/>`;
    let G = 0;
    if (N) { const zs = range(-1.2, 1.2, 241), pr = C2.slabProfile(P.n, P.nc, t, LAM, 0, "TE", N, zs); G = C2.slabConfinement(P.n, P.nc, t, LAM, 0, N); let d = ""; zs.forEach((z, i) => { const v = pr.main[i] * pr.main[i]; const X = x0 + 20 + v * (w - 40), Y = y0 + h / 2 - z * h / 2.4; d += (i ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); }); s += `<path d="${d}" fill="${PC}" fill-opacity="0.15" stroke="${PC}" stroke-width="2"/>`; }
    s += tx(x0 + 8, y0 + 16, "intensity across the film (vertical axis is z, ±1.2 µm)") + tx(x0 + w - 8, y0 + h - 8, N ? `Γ = ${G.toFixed(2)}, n_eff = ${N.toFixed(3)}` : "no bound mode", "end", "t");
    fig.innerHTML = svg(y0 + h + 16, s);
  });
}},

{s: "4. Bends", t: "Why silicon bends in 5 µm and nitride needs 50",
intu: String.raw`In a bend the outer part of the mode must travel faster to keep up. Past a certain radius it would have to exceed the speed of light in the cladding, so that part radiates away. The radiation loss falls off exponentially with radius, and the scale of that exponential is set by how tightly the mode is held. Drag the radius and switch platforms. Play shows light leaking from the outside of the bend when the radius is too small. The curve is an illustrative model with the right shape, not a measurement.`,
eq: String.raw`\[ \alpha_{\mathrm{bend}} \approx A\, e^{-R/R_0}, \qquad R_0 \propto \frac{\lambda}{(n_{\mathrm{eff}}^2 - n_{\mathrm{clad}}^2)^{3/2}} \]<div class="eqnote">Marcuse style scaling, shown as a model</div>`,
sym: [[String.raw`\(\alpha_{\mathrm{bend}}\)`, "radiation loss per unit length in the bend"], [String.raw`\(R\)`, "bend radius"], [String.raw`\(R_0\)`, "characteristic radius, small for high contrast"], [String.raw`\(A\)`, "prefactor set by the mode shape"]],
how: ["Write the mode in the bend as a mode of a straight guide with a tilted index profile.", "The tail beyond the radiation caustic is no longer bound and leaks.", "The result is an exponential in the radius with a scale that shrinks as the contrast grows.", "Design rule: pick a radius where the bend loss is far below the propagation loss."],
say: String.raw`Bend loss falls exponentially with radius, and high index contrast makes the characteristic radius a few micrometres instead of tens.`,
num: "Silicon strip: usable radii of 2 to 5 µm. Nitride 200 nm core in the Shang 2015 multilayer platform: 50 µm. Thick nitride: about 20 µm. Thin low confinement nitride: hundreds of µm.",
r(fig, ctl) {
  ctl.innerHTML = btns([["si", "Silicon"], ["sin", "Nitride"]], "p") + sl("R", "Bend radius (µm)", 1, 120, 1, 10);
  let cur = "si";
  const curve = () => { const P = PLAT[cur], R = +$("R").value; $("Rv").textContent = R + " µm"; return { P, R, a: 30 * Math.exp(-R / P.R0) }; };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { cur = b.dataset.p; pick(ctl, "p", cur); });
  pick(ctl, "p", cur);
  PIC.player(ctl, (tsec) => {
    const { P, R, a } = curve();
    const x0 = 60, w = 300, y0 = 36, h = 170;
    const Rm = cur === "si" ? 20 : 120;
    const Rs = range(0.5, Rm, 120), as = Rs.map(r => 30 * Math.exp(-r / P.R0));
    let s = C3.frame(x0, y0, w, h, 0, Rm, -3, 2, [0, Rm / 4, Rm / 2, 3 * Rm / 4, Rm], [-3, -2, -1, 0, 1, 2], "radius (µm)", "log10 bend loss (dB/90°)");
    s += plot(x0, y0, w, h, Rs, as.map(v => Math.max(-3, Math.log10(v))), 0, Rm, -3, 2, P.col, 2.5);
    s += `<circle cx="${C3.X(x0, w, 0, Rm)(Math.min(R, Rm))}" cy="${C3.Y(y0, h, -3, 2)(Math.max(-3, Math.log10(a)))}" r="6" fill="${PC}"/>`;
    // bend drawing with leaking light
    const cx = 560, cy = y0 + h + 10, rr = 60 + Math.min(R, 60) * 1.2; const leak = Math.min(1, a / 3);
    s += `<path d="M${cx - rr} ${cy} A${rr} ${rr} 0 0 1 ${cx} ${cy - rr}" fill="none" stroke="${P.col}" stroke-width="12" opacity="0.45"/>` + tx(cx - rr - 6, cy - 4, "in", "end") + tx(cx + 4, cy - rr + 4, "out");
    for (let k = 0; k < 8; k++) { const ph = ((tsec * 0.5 + k / 8) % 1) * Math.PI / 2; const x = cx - rr * Math.cos(ph), y = cy - rr * Math.sin(ph); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${PC}"/>`; if (leak > 0.02) { const d = 8 + ((tsec * 0.7 + k / 8) % 1) * 50 * leak; s += `<circle cx="${(x - d * Math.cos(ph)).toFixed(1)}" cy="${(y - d * Math.sin(ph)).toFixed(1)}" r="2.5" fill="${PA}" opacity="${Math.max(0, 1 - d / 60).toFixed(2)}"/>`; } }
    s += tx(cx - 40, y0 + 14, `R = ${R} µm, loss ${a < 0.01 ? a.toExponential(1) : a.toFixed(2)} dB per 90° (model)`, "middle", "t");
    fig.innerHTML = svg(y0 + h + 40, s);
  });
  $("R").oninput = () => {};
}},

{s: "5. Propagation loss", t: "Loss per centimetre and what it means for a chip",
intu: String.raw`Even a straight waveguide loses light to sidewall scattering and absorption. The loss is quoted in dB per cm. Silicon strips are at 1 to 3 dB/cm, nitride near 0.1 dB/cm, and the best thick nitride far below that. Set a length and a platform and watch the power fall along the guide. For a short link on a chip a few millimetres long, silicon's loss is fine. For a delay line or a ring with a long path, only nitride works.`,
eq: String.raw`\[ P(z) = P_0\, 10^{-\alpha_{\mathrm{dB}} z / 10} = P_0\, e^{-\alpha z}, \qquad \alpha_{\mathrm{dB/cm}} = 4.343\,\alpha_{\mathrm{cm^{-1}}} \]`,
sym: [[String.raw`\(\alpha_{\mathrm{dB}}\)`, "loss in dB per cm"], [String.raw`\(\alpha\)`, "power attenuation coefficient per cm"], [String.raw`\(z\)`, "distance along the guide"]],
how: ["Each centimetre removes the same fraction of what is left, so the decay is exponential.", String.raw`\(10\log_{10} e = 4.343\) converts between the two forms.`, "Multiply the loss per cm by the path length to get the budget entry for a waveguide."],
say: String.raw`Power decays exponentially along a waveguide, and the dB per cm number times the length is its entry in the link budget.`,
num: "Silicon strip 2 dB/cm over 5 mm: 1 dB. Nitride 0.1 dB/cm over 5 mm: 0.05 dB. A 2026 multilayer nitride interposer reports 0.038 dB/cm (arXiv 2604.12566).",
r(fig, ctl) {
  ctl.innerHTML = sl("al", "Loss (dB/cm)", 0.02, 5, 0.02, 2) + sl("L", "Length (mm)", 1, 50, 1, 10);
  PIC.player(ctl, (tsec) => {
    const al = +$("al").value, L = +$("L").value; $("alv").textContent = al.toFixed(2) + " dB/cm"; $("Lv").textContent = L + " mm";
    const x0 = 60, w = 560, y0 = 36, h = 150;
    const zs = range(0, L / 10, 100), ps = zs.map(z => Math.pow(10, -al * z / 10));
    let s = C3.frame(x0, y0, w, h, 0, L, 0, 1, [0, L / 4, L / 2, 3 * L / 4, L], [0, 0.5, 1], "distance (mm)", "P / P₀", v => v.toFixed(1));
    s += plot(x0, y0, w, h, zs.map(z => z * 10), ps, 0, L, 0, 1, PB, 2.5);
    for (let k = 0; k < 10; k++) { const ph = (tsec * 0.3 + k / 10) % 1; const z = ph * L; const p = Math.pow(10, -al * z / 100); s += `<circle cx="${C3.X(x0, w, 0, L)(z).toFixed(1)}" cy="${(y0 + h + 14).toFixed(1)}" r="${(2 + 4 * p).toFixed(1)}" fill="${PC}" opacity="${(0.3 + 0.7 * p).toFixed(2)}"/>`; }
    s += tx(x0 + w, y0 + 16, `total ${(al * L / 10).toFixed(2)} dB, ${(100 * Math.pow(10, -al * L / 100)).toFixed(1)} % arrives`, "end", "t");
    fig.innerHTML = svg(y0 + h + 44, s);
  });
}},

{s: "6. Rough walls", t: "Sidewall roughness: the loss that scales with contrast squared",
intu: String.raw`Etched sidewalls are not smooth. Their bumps scatter light out of the guide. Payne and Lacey showed that the loss grows with the square of the roughness amplitude and strongly with the index contrast, and that it peaks when the bump spacing is comparable to the wavelength in the material. Drag the roughness and the correlation length. Silicon pays about ten times more than nitride for the same roughness, which is the real reason nitride is the low loss platform.`,
eq: String.raw`\[ \alpha \;\propto\; \frac{\sigma^2}{k_0\, d^4\, n_1}\, g(V)\, f_e(L_c) \qquad (n_1^2 - n_2^2 \text{ enters through } V) \]<div class="eqref">Payne and Lacey 1994, qualitative form</div>`,
sym: [[String.raw`\(\sigma\)`, "RMS roughness of the sidewall, 1 to 5 nm"], [String.raw`\(L_c\)`, "correlation length of the roughness, 30 to 100 nm"], [String.raw`\(d\)`, "half width of the guide"], [String.raw`\(V = k_0 d\sqrt{n_1^2 - n_2^2}\)`, "normalized frequency, grows with contrast"], [String.raw`\(g, f_e\)`, "mode shape and spectral factors"]],
how: ["Treat the rough wall as a small perturbation of the index at the boundary.", "The perturbation couples the guided mode to radiation modes. The coupling strength is the roughness spectrum at the right spatial frequency.", "The spectrum of exponentially correlated roughness is a Lorentzian in spatial frequency, which gives the dependence on the correlation length.", "Halving the roughness cuts the loss by four. Lowering the contrast lowers the field at the wall and the loss with it."],
say: String.raw`Sidewall scattering loss scales with roughness squared and rises steeply with index contrast, which is why nitride is quieter than silicon.`,
num: "Typical values: σ 2 nm, correlation length 50 nm, silicon 450 nm strip: 1 to 3 dB/cm. Same roughness on nitride: about 0.1 dB/cm. Wider waveguides lower the field at the wall and the loss.",
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Roughness σ (nm)", 0.5, 6, 0.1, 2) + sl("lc", "Correlation length (nm)", 10, 300, 5, 50) + sl("wd", "Guide width (nm)", 300, 1200, 10, 450);
  const rng = C3.rng(3); const noise = Array.from({ length: 200 }, () => 0); { let v = 0; for (let i = 0; i < 200; i++) { v = 0.8 * v + 0.6 * (rng() - 0.5); noise[i] = v; } }
  const u = () => {
    const sg = +$("sg").value, lc = +$("lc").value, wd = +$("wd").value; $("sgv").textContent = sg + " nm"; $("lcv").textContent = lc + " nm"; $("wdv").textContent = wd + " nm";
    const model = (P) => { const d = wd / 2000; const V = 2 * Math.PI / LAM * d * Math.sqrt(P.n * P.n - P.nc * P.nc); const kz = 2 * Math.PI / LAM * 2.4 * (P.n / 3.48); const spec = lc / 1000 / (1 + Math.pow(kz * lc / 1000, 2)); const g = Math.pow(V, 2) / (1 + V * V); return 1.6e5 * Math.pow(sg / 1000, 2) / Math.pow(d, 3) * g * spec * Math.pow((P.n * P.n - P.nc * P.nc) / (3.48 * 3.48 - 1.44 * 1.44), 1.5); };
    const aSi = model(PLAT.si), aSiN = model(PLAT.sin);
    const x0 = 40, y0 = 36; let s = tx(340, 20, `model: silicon ${aSi.toFixed(2)} dB/cm, nitride ${aSiN.toFixed(3)} dB/cm`, "middle", "th");
    // rough wall drawing
    const wpx = 120 + (wd - 300) * 0.2; const ya = y0 + 20, yb = ya + wpx;
    let top = "", bot = ""; for (let i = 0; i < 200; i++) { const x = x0 + i * 3; const n = noise[i] * sg * 6 * Math.max(0.3, Math.min(1, 50 / lc)); top += (i ? "L" : "M") + x + " " + (ya + n).toFixed(1); bot += (i ? "L" : "M") + x + " " + (yb - n).toFixed(1); }
    s += `<path d="${top} L${x0 + 597} ${yb} ${bot.replace("M", "L").split("L").reverse().join("L")} Z" fill="${PB}" opacity="0.35"/><path d="${top}" fill="none" stroke="${PB}" stroke-width="1.5"/><path d="${bot}" fill="none" stroke="${PB}" stroke-width="1.5"/>`;
    s += tx(x0 + 300, ya - 8, "top view of a waveguide with exaggerated sidewall roughness", "middle");
    // bars
    const by = yb + 30; const sc = 60 / Math.max(aSi, 0.5); s += `<rect x="${x0 + 60}" y="${by}" width="${Math.min(500, aSi * sc)}" height="18" fill="${PB}"/>` + tx(x0, by + 13, "silicon") + `<rect x="${x0 + 60}" y="${by + 26}" width="${Math.max(2, Math.min(500, aSiN * sc))}" height="18" fill="${PT}"/>` + tx(x0, by + 39, "nitride") + tx(x0 + 70 + Math.min(500, aSi * sc), by + 13, aSi.toFixed(2) + " dB/cm") + tx(x0 + 70 + Math.max(2, Math.min(500, aSiN * sc)), by + 39, aSiN.toFixed(3) + " dB/cm");
    fig.innerHTML = svg(by + 60, s);
  };
  ["sg", "lc", "wd"].forEach(i => $(i).oninput = u); u();
}},

{s: "7. Compare", t: "Platform comparison: what each one is good for",
intu: String.raw`Put the numbers side by side. Silicon wins on size, modulators and detectors, because it is a semiconductor you can dope and because germanium grows on it. Nitride wins on loss, power handling and temperature stability, because it is a glass with no free carriers and a small thermo-optic coefficient. The modern answer is both: silicon for the active devices and nitride layers above for routing and filters, which is the multilayer platform of Part 2. Press a row to highlight it.`,
eq: String.raw`\[ \text{size} \propto \frac{1}{\Delta n}, \qquad \text{loss} \propto \sigma^2 (\Delta n)^{p},\ p \gt 1, \qquad \frac{dn}{dT}: \ \mathrm{Si}\ 1.8\times10^{-4},\ \mathrm{SiN}\ 2.5\times10^{-5}\ \mathrm{K^{-1}} \]`,
sym: [[String.raw`\(dn/dT\)`, "thermo-optic coefficient, how much the index drifts per kelvin"], [String.raw`\(\Delta n\)`, "index contrast"]],
how: ["Device footprint scales inversely with contrast through the bend radius.", "Scattering loss scales with contrast faster than linearly.", "Only silicon can host carriers for modulators and detectors.", "Nitride handles watts of power without two-photon absorption, which silicon cannot at 1550 nm."],
say: String.raw`Silicon gives small, active devices with more loss, and nitride gives low loss passive routing, so interconnect chips combine the two.`,
num: "Bend radius: Si 5 µm, SiN 20 to 100 µm. Loss: Si 1 to 3 dB/cm, SiN 0.04 to 0.1 dB/cm. Ring Q: Si about 1e4 to 1e5, SiN above 1e6. Modulator and detector: Si yes, SiN no.",
r(fig, ctl) {
  const rows = [["index at 1550 nm", "3.48", "2.0"], ["contrast to oxide", "2.04", "0.56"], ["film thickness", "220 nm", "200 to 800 nm"], ["bend radius", "2 to 5 µm", "20 to 100 µm"], ["loss (dB/cm)", "1 to 3", "0.04 to 0.1"], ["ring Q", "1e4 to 1e5", "above 1e6"], ["thermo-optic dn/dT", "1.8e-4 /K", "2.5e-5 /K"], ["modulator, detector", "yes (carriers, Ge)", "no"], ["power handling", "limited (TPA)", "high"], ["best use", "active devices", "routing, filters, delay"]];
  ctl.innerHTML = btns(rows.map((r, i) => [i, r[0]]), "row");
  let cur = 3;
  const u = () => {
    pick(ctl, "row", cur);
    let s = tx(70, 24, "property", null, "th") + tx(330, 24, "silicon on insulator", "middle", "th") + tx(560, 24, "silicon nitride", "middle", "th");
    rows.forEach((r, i) => { const y = 44 + i * 26; if (i === cur) s += `<rect x="20" y="${y - 17}" width="640" height="24" fill="var(--accent-bg)" rx="4"/>`; s += tx(30, y, r[0], null, i === cur ? "t" : "ts") + tx(330, y, r[1], "middle", i === cur ? "t" : "ts") + tx(560, y, r[2], "middle", i === cur ? "t" : "ts"); s += `<line x1="20" x2="660" y1="${y + 8}" y2="${y + 8}" stroke="var(--line)"/>`; });
    fig.innerHTML = svg(44 + rows.length * 26 + 10, s);
  };
  ctl.querySelectorAll("button[data-row]").forEach(b => b.onclick = () => { cur = +b.dataset.row; u(); }); u();
}}
],
summary: String.raw`A platform is a high index film on oxide, and its index contrast decides everything. Silicon's contrast of about 2 holds three quarters of the light in a 220 nm film, bends in a few micrometres, and hosts modulators and germanium detectors, but its rough sidewalls cost 1 to 3 dB/cm. Nitride's contrast of about 0.56 spreads the mode, needs 20 to 100 µm bends and cannot be doped, but loses only 0.1 dB/cm or less, handles high power and drifts little with temperature. Interconnect chips use silicon for the active parts and nitride layers for routing and filtering.`,
sheet: [
[String.raw`\[ \Delta n = n_{\mathrm{core}} - n_{\mathrm{clad}}, \quad \text{NA} = \sqrt{n_{\mathrm{core}}^2 - n_{\mathrm{clad}}^2} \]`, "Index contrast and numerical aperture"],
[String.raw`\[ \tan(k_x t/2) = \gamma/k_x, \quad k_x = k_0\sqrt{n_1^2 - n_{\mathrm{eff}}^2}, \quad \gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_2^2} \]`, "TE slab mode equation"],
[String.raw`\[ \Gamma = \int_{\mathrm{core}}|E|^2 dx \Big/ \int |E|^2 dx \]`, "Confinement factor"],
[String.raw`\[ \alpha_{\mathrm{bend}} \approx A e^{-R/R_0} \]`, "Bend loss model, exponential in radius"],
[String.raw`\[ P(z) = P_0 10^{-\alpha_{\mathrm{dB}} z/10}, \quad \alpha_{\mathrm{dB/cm}} = 4.343\,\alpha \]`, "Propagation loss"],
[String.raw`\[ \alpha_{\mathrm{wall}} \propto \sigma^2 \cdot f(\Delta n, L_c) \]`, "Payne and Lacey sidewall scattering scaling"]],
consts: String.raw`\(\lambda = 1.55\) µm, \(n_{\mathrm{Si}} = 3.48\), \(n_{\mathrm{SiN}} = 2.0\), \(n_{\mathrm{SiO_2}} = 1.44\). The bend and roughness curves are models with the right scaling, calibrated to the typical loss values quoted in the numbers.`,
sources: ["F. P. Payne and J. P. R. Lacey, A theoretical analysis of scattering loss from planar optical waveguides, Opt. Quantum Electron. 26, 977 (1994)", "D. Marcuse, Bending losses of the asymmetric slab waveguide, Bell Syst. Tech. J. 50, 2551 (1971)", "W. Bogaerts et al., Silicon microring resonators, Laser Photon. Rev. 6, 47 (2012)", "Tidy3D material library documentation (cSi, SiO2, Si3N4 index values at 1550 nm)", "Shang et al., Low-loss compact multilayer silicon nitride platform for 3D photonic integrated circuits, Opt. Express 23, 21334 (2015)", "3D silicon nitride photonic interposer, arXiv 2604.12566 (2026), 0.038 dB/cm"]
});
})();
