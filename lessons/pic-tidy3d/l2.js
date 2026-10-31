(function () {
/* Part 4 Lesson 2: media and geometry in Tidy3D. Figures computed live with PIC (pic-common.js) and the helpers in app.js. */
const PC = "#D85A30", PB = "#378ADD", PT = "#1D9E75", PP = "#7F77DD", PA = "#BA7517";
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const show = (fig, code, h, body) => { fig.innerHTML = PIC.code(code) + svg(h, body); };
/* Luke et al. 2015 Sellmeier fit for Si3N4, lambda in um */
const sellSiN = lam => Math.sqrt(1 + 3.0249 * lam * lam / (lam * lam - 0.1353406 * 0.1353406) + 40314 * lam * lam / (lam * lam - 1239.842 * 1239.842));
/* approximate n (and k) at 1.55 um for the library card, teaching values */
const LIB = [["cSi", "Palik_LowLoss", 3.48, 0, PB], ["SiO2", "Palik_LowLoss", 1.44, 0, PT], ["Si3N4", "Luke2015PMLStable", 2.0, 0, PP], ["Ge", "Palik_LowLoss", 4.27, 0, PA], ["GaAs", "Palik_Lossy", 3.37, 0, PC], ["Ag", "JohnsonChristy1972", 0.14, 11.4, "var(--p)"]];

addLesson("pic", "tidy3d", {
level: "Core",
id: "pic-tidy3d-l2", title: "Media and geometry: what the box is made of", short: "2. Media and geometry",
big: String.raw`A structure in Tidy3D is a shape plus a material. The material is a <code>Medium</code>: a constant permittivity for a quick test, a named entry of the material library with measured dispersion, or a dispersive model fitted to your own data. The shape is a <code>Box</code>, a <code>PolySlab</code> with an optional sidewall angle, a cylinder, or an outline imported from a GDS layout. This lesson shows each command next to the physics it encodes: permittivity from index, the Sellmeier and Lorentz dispersion models, and how a stack of layers is assembled. The multilayer stack at the end is the platform of Part 2.`,
bridge: String.raw`Permittivity is the quantity the FDTD update equations use, so every medium ends up as an epsilon, possibly complex and frequency dependent. The material library variants are the ones in the Tidy3D 2.12 documentation. The default cSi variant changed in 2.12, so always name the variant.`,
cards: [

{s: "1. Medium", t: "td.Medium: permittivity and conductivity, or n and k",
intu: String.raw`The simplest material is a constant relative permittivity, with an optional conductivity for loss. If you think in refractive index, <code>td.Medium.from_nk</code> converts n and k at one frequency. Drag n and k and watch the real and imaginary permittivity. A small k becomes a large loss over a long waveguide, so the absorption in dB per centimetre is shown too.`,
eq: String.raw`\[ \varepsilon = (n + ik)^2 = n^2 - k^2 + 2ink, \qquad \sigma = 2\pi f\,\varepsilon_0\, \operatorname{Im}\varepsilon \]\[ \alpha = \frac{4\pi k}{\lambda}, \qquad \alpha_{\mathrm{dB/cm}} = 4.343\,\alpha\,[\mathrm{cm^{-1}}] \]`,
sym: [[String.raw`\(n, k\)`, "real index and extinction coefficient"], [String.raw`\(\varepsilon\)`, "relative permittivity, complex"], [String.raw`\(\sigma\)`, "the conductivity Tidy3D stores for the imaginary part, S/µm"], [String.raw`\(\alpha\)`, "power absorption coefficient"]],
how: ["The complex index squared is the complex permittivity.", "Tidy3D stores the imaginary part as a conductivity at the given frequency, so <code>from_nk</code> needs a freq argument.", "The field decays as exp(−2πk z/λ), and the power as exp(−α z) with α twice that rate.", "Multiply by 4.343 to turn a power decay per centimetre into dB per centimetre."],
say: String.raw`A Medium is a relative permittivity with an optional conductivity, and <code>from_nk</code> builds it from n and k at one frequency.`,
num: "n = 3.48, k = 0: ε = 12.1. n = 2.0, k = 1e-5 at 1.55 µm: α = 0.81 cm⁻¹, which is 3.5 dB/cm, far too lossy for a SiN platform. Good SiN has k below 1e-7.",
r(fig, ctl) {
  ctl.innerHTML = sl("n", "refractive index n", 1, 4.5, 0.01, 2.0) + sl("k", "log10 of k", -8, -1, 0.1, -5);
  const u = () => {
    const n = +$("n").value, k = Math.pow(10, +$("k").value); $("nv").textContent = n.toFixed(2); $("kv").textContent = k.toExponential(1);
    const er = n * n - k * k, ei = 2 * n * k, alpha = 4 * Math.PI * k / 1.55e-4, adb = 4.343 * alpha;
    const code = `med = td.Medium(permittivity=${er.toFixed(3)}, conductivity=0.0)\nmed = td.Medium.from_nk(n=${n.toFixed(2)}, k=${k.toExponential(1)}, freq=td.C_0 / 1.55)\n# Re eps = ${er.toFixed(3)}, Im eps = ${ei.toExponential(2)}, loss ${adb < 0.01 ? adb.toExponential(1) : adb.toFixed(2)} dB/cm`;
    const x0 = 60, w = 560, y0 = 40, h = 120; let s = tx(340, 22, `ε = ${er.toFixed(2)} + ${ei.toExponential(1)} i`, "middle", "th");
    // field decay along 1 cm
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--sunk)"/>`; let d = ""; const L = 1; for (let i = 0; i <= 200; i++) { const z = L * i / 200; const A = Math.exp(-alpha * z / 2); d += (i ? "L" : "M") + (x0 + w * i / 200).toFixed(1) + " " + (y0 + h - A * h * 0.9).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${PB}" stroke-width="2"/>` + tx(x0 + w / 2, y0 + h + 16, `field amplitude along 1 cm of material with this k: ends at ${(100 * Math.exp(-alpha / 2)).toFixed(1)} percent`, "middle");
    show(fig, code, y0 + h + 32, s);
  };
  $("n").oninput = u; $("k").oninput = u; u();
}},

{s: "2. Material library", t: "material_library: measured materials by name and variant",
intu: String.raw`<code>td.material_library</code> holds fitted dispersive models of common materials, each under a name and a variant that says whose measurement it came from. Always name the variant: the default for crystalline silicon changed from Green2008 to <code>Palik_LowLoss</code> in version 2.12, and <code>Palik_Lossless</code> was renamed. Click a material to see its index at 1.55 µm and the command that loads it. Silver has a tiny real index and a huge extinction, which is what makes a metal reflect.`,
eq: String.raw`\[ n + ik = \sqrt{\varepsilon(f)}, \qquad \varepsilon(f) \ \text{from the library fit at each } f \]`,
sym: [["name", "cSi, SiO2, Si3N4, Ge, GaAs, Ag, Au and more"], ["variant", "the dataset behind the fit, for example <code>Palik_LowLoss</code> or Luke2015PMLStable"], [String.raw`\(\varepsilon(f)\)`, "a PoleResidue model evaluated at each monitor frequency"]],
how: ["Index the library by name, then by variant, to get a Medium.", "The variant matters: <code>Palik_Lossy</code> for silicon includes absorption, <code>Palik_LowLoss</code> does not.", "Luke2015PMLStable for Si3N4 is built so it stays stable inside PML. Use it for nitride waveguides.", "Print the variant keys when unsure. The Au variant names were not verified for 2.12, so check them that way."],
say: String.raw`The material library gives a dispersive Medium by name and variant, and the variant must be written out because defaults have changed.`,
num: "At 1.55 µm: cSi 3.48, SiO2 1.44, Si3N4 2.0, Ge about 4.27, GaAs about 3.37, Ag about 0.14 + 11.4 i. The Ge, GaAs and Ag values are approximate teaching values.",
r(fig, ctl) {
  ctl.innerHTML = btns(LIB.map((m, i) => [String(i), m[0]]), "m");
  let m = 0;
  const u = () => {
    pick(ctl, "m", m); const [name, variant, n, k, col] = LIB[m];
    const code = `${name.toLowerCase()} = td.material_library["${name}"]["${variant}"]\nprint(td.material_library["${name}"].variants.keys())   # see every variant\n# n at 1.55 um: ${n}${k ? " + " + k + "i" : ""}  (approximate)`;
    const x0 = 60, w = 560, y0 = 40, h = 130; let s = PIC.yaxis(x0, y0, h, 0, 5, 5, "n at 1.55 µm", v => v.toFixed(0));
    LIB.forEach((q, i) => { const bw = 60, x = x0 + 30 + i * 90, hb = Math.min(h, q[2] / 5 * h); s += `<rect x="${x}" y="${y0 + h - hb}" width="${bw}" height="${hb}" fill="${q[4]}" opacity="${i === m ? 0.95 : 0.45}"/>` + tx(x + bw / 2, y0 + h - hb - 5, q[2] + (q[3] ? " + " + q[3] + "i" : ""), "middle") + tx(x + bw / 2, y0 + h + 15, q[0], "middle"); });
    s += tx(340, y0 + h + 36, `${name}, variant ${variant}: ${k ? "a metal, the imaginary part dominates" : "a dielectric, transparent at 1.55 µm"}`, "middle", "t");
    show(fig, code, y0 + h + 48, s);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; u(); }); u();
}},

{s: "3. Sellmeier", t: "td.Sellmeier: index versus wavelength for a transparent material",
intu: String.raw`A transparent material has an index that falls slowly with wavelength. The Sellmeier formula captures that with a few resonance terms. The curve below is the Luke 2015 fit for silicon nitride that the library uses. Drag the wavelength to read n, and drag the strength of the first term to see how a resonance in the ultraviolet bends the whole visible and infrared curve.`,
eq: String.raw`\[ n^2(\lambda) = 1 + \sum_j \frac{B_j\,\lambda^2}{\lambda^2 - C_j} \]\[ \mathrm{Si_3N_4\ (Luke\ 2015)}:\ B_1 = 3.0249,\ \sqrt{C_1} = 0.1353\ \mathrm{\mu m},\ B_2 = 40314,\ \sqrt{C_2} = 1239.8\ \mathrm{\mu m} \]`,
sym: [[String.raw`\(B_j\)`, "strength of resonance j, dimensionless"], [String.raw`\(C_j\)`, "square of the resonance wavelength, µm²"], [String.raw`\(\lambda\)`, "wavelength in µm, as the Tidy3D Sellmeier class expects"]],
how: ["Each term is a Lorentz oscillator far from its resonance, where loss is negligible.", "The first term sits in the ultraviolet and gives the normal dispersion in the visible and infrared.", "The second term sits far in the infrared and adds a slow drop at long wavelengths.", "td.Sellmeier(coeffs=[(B1, C1), (B2, C2)]) builds the medium. Tidy3D converts it to a PoleResidue model internally."],
say: String.raw`The Sellmeier formula writes n squared minus one as a sum of resonance terms in wavelength, and td.Sellmeier takes the B and C pairs directly.`,
num: "Si3N4 Luke 2015: n = 2.023 at 0.8 µm, 1.996 at 1.55 µm, 1.976 at 3 µm. The slope near 1.55 µm sets a group index of about 2.08.",
r(fig, ctl) {
  ctl.innerHTML = sl("lam", "wavelength (µm)", 0.4, 4, 0.01, 1.55) + sl("B1", "B₁ (Luke value 3.0249)", 2, 4, 0.01, 3.0249);
  const u = () => {
    const lam = +$("lam").value, B1 = +$("B1").value; $("lamv").textContent = lam.toFixed(2) + " µm"; $("B1v").textContent = B1.toFixed(3);
    const nf = l => Math.sqrt(1 + B1 * l * l / (l * l - 0.1353406 * 0.1353406) + 40314 * l * l / (l * l - 1239.842 * 1239.842));
    const code = `sin = td.Sellmeier(coeffs=[(${B1.toFixed(4)}, 0.1353406**2), (40314, 1239.842**2)])\n# n(${lam.toFixed(2)} um) = ${nf(lam).toFixed(4)}`;
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = PIC.yaxis(x0, y0, h, 1.9, 2.2, 3, "n", v => v.toFixed(1)) + PIC.xaxis(x0, y0 + h, w, 0.4, 4, 6, "wavelength (µm)", v => v.toFixed(1));
    s += plot(x0, y0, w, h, range(0.4, 4, 200), range(0.4, 4, 200).map(nf), 0.4, 4, 1.9, 2.2, PB, 2);
    if (Math.abs(B1 - 3.0249) > 0.002) s += plot(x0, y0, w, h, range(0.4, 4, 200), range(0.4, 4, 200).map(sellSiN), 0.4, 4, 1.9, 2.2, "var(--p)", 1, "4 3");
    const X = x0 + (lam - 0.4) / 3.6 * w, Y = y0 + h - (Math.min(2.2, Math.max(1.9, nf(lam))) - 1.9) / 0.3 * h;
    s += `<circle cx="${X}" cy="${Y}" r="5" fill="${PC}"/>` + tx(X + 8, Y - 8, `n = ${nf(lam).toFixed(4)}`);
    show(fig, code, y0 + h + 44, s);
  };
  $("lam").oninput = u; $("B1").oninput = u; u();
}},

{s: "4. Lorentz and PoleResidue", t: "td.Lorentz and td.PoleResidue: dispersion with loss",
intu: String.raw`Near a resonance a material both disperses and absorbs. The Lorentz model is one damped oscillator: the real permittivity swings up then down through the resonance while the imaginary part peaks. Tidy3D stores every dispersive material as a PoleResidue model, a sum of complex poles, which is what the FDTD update equations can march in time. Drag the resonance frequency, its strength and its damping.`,
eq: String.raw`\[ \varepsilon(f) = \varepsilon_\infty + \frac{\Delta\varepsilon\, f_0^2}{f_0^2 - f^2 - 2i\,\delta f} \]\[ \varepsilon(\omega) = \varepsilon_\infty + \sum_j \left[\frac{c_j}{i\omega - a_j} + \frac{c_j^{*}}{i\omega - a_j^{*}}\right] \]<div class="eqref">Lorentz, then the PoleResidue form Tidy3D marches</div>`,
sym: [[String.raw`\(\varepsilon_\infty\)`, "permittivity at high frequency"], [String.raw`\(\Delta\varepsilon, f_0, \delta\)`, "oscillator strength, resonance frequency and damping, the coeffs tuple of td.Lorentz"], [String.raw`\(a_j, c_j\)`, "pole and residue of term j, complex, in rad/s"]],
how: ["A bound electron driven by the field is a damped harmonic oscillator, which gives the Lorentz form.", "Partial fractions split each Lorentz term into a complex pole pair, the PoleResidue form.", "In time domain each pole becomes an auxiliary differential equation that FDTD updates beside E and H.", "td.Lorentz(<code>eps_inf</code>, coeffs=[(<code>delta_eps</code>, f0, delta)]) and td.PoleResidue(<code>eps_inf</code>, poles=[(a, c)]) are the constructors. Check the argument names against the 2.12 API page, the Lorentz damping convention in particular."],
say: String.raw`The Lorentz model is a damped oscillator with dispersion and loss, and Tidy3D marches every dispersive medium as a sum of complex poles.`,
num: "A pole at f₀ = 400 THz with Δε = 2 and δ = 20 THz gives a 1.55 µm (193 THz) index close to its low-frequency limit with almost no loss, which is how a UV resonance shapes a transparent material.",
r(fig, ctl) {
  ctl.innerHTML = sl("f0", "resonance f₀ (THz)", 150, 600, 5, 400) + sl("de", "strength Δε", 0.2, 5, 0.1, 2) + sl("dl", "damping δ (THz)", 2, 80, 1, 20);
  const u = () => {
    const f0 = +$("f0").value, de = +$("de").value, dl = +$("dl").value; $("f0v").textContent = f0 + " THz"; $("dev").textContent = de.toFixed(1); $("dlv").textContent = dl + " THz";
    const ei = 1.5; const eps = f => { const den_r = f0 * f0 - f * f, den_i = -2 * dl * f; const m = den_r * den_r + den_i * den_i; return [ei + de * f0 * f0 * den_r / m, -de * f0 * f0 * den_i / m]; };
    const e193 = eps(193.4);
    const code = `lor = td.Lorentz(eps_inf=1.5, coeffs=[(${de.toFixed(1)}, ${f0}e12, ${dl}e12)])\npr = lor.pole_residue      # the same medium as poles and residues\n# at 193 THz: eps = ${e193[0].toFixed(3)} + ${e193[1].toFixed(3)} i`;
    const x0 = 60, w = 560, y0 = 36, h = 150; const fs = range(100, 700, 300);
    const re = fs.map(f => eps(f)[0]), im = fs.map(f => eps(f)[1]);
    const ymax = Math.max(4, ...re.map(Math.abs), ...im) + 0.5;
    let s = PIC.yaxis(x0, y0, h, -ymax, ymax, 4, "ε", v => v.toFixed(0)) + PIC.xaxis(x0, y0 + h, w, 100, 700, 6, "frequency (THz)", v => v.toFixed(0));
    s += `<line x1="${x0}" y1="${y0 + h / 2}" x2="${x0 + w}" y2="${y0 + h / 2}" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    s += plot(x0, y0, w, h, fs, re, 100, 700, -ymax, ymax, PB, 2) + plot(x0, y0, w, h, fs, im, 100, 700, -ymax, ymax, PC, 2);
    const X = x0 + (193.4 - 100) / 600 * w; s += `<line x1="${X}" y1="${y0}" x2="${X}" y2="${y0 + h}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(X + 4, y0 + 12, "193 THz");
    s += tx(x0 + w, y0 + 12, "blue: Re ε, red: Im ε", "end");
    show(fig, code, y0 + h + 44, s);
  };
  ["f0", "de", "dl"].forEach(i => $(i).oninput = u); u();
}},

{s: "5. Dispersion fitter", t: "FastDispersionFitter: your own n, k data as a stable medium",
intu: String.raw`Measured index data cannot go into FDTD directly. The fitter finds a PoleResidue model with a few poles that matches the data and is passive, so it cannot create energy and blow up the run. Load a text file of wavelength, n and k, ask for a number of poles and a tolerance, and read the fit error. Press Play to watch the fit tighten as poles are added, and drag the target number of poles.`,
eq: String.raw`\[ \min_{a_j, c_j}\ \sqrt{\frac{1}{N}\sum_{i=1}^{N} \left| \sqrt{\varepsilon_{\mathrm{fit}}(f_i)} - (n_i + i k_i)\right|^2 } \le \texttt{tolerance\_rms} \]`,
sym: [[String.raw`\(f_i, n_i, k_i\)`, "the data points from the file"], [String.raw`\(\varepsilon_{\mathrm{fit}}\)`, "the PoleResidue model being fitted"], [String.raw`\(\texttt{tolerance\_rms}\)`, "the RMS error at which the fit stops adding poles"]],
how: ["<code>FastDispersionFitter.from_file</code> reads a CSV with wavelength, n and k columns. Set skiprows for a header.", "fit(<code>max_num_poles</code>, <code>tolerance_rms</code>) returns the medium and the RMS error.", "The fit is constrained to be passive, with Im ε of the right sign at every frequency.", "Plot the fit against the data over the band you will simulate. More poles cost more memory per cell."],
say: String.raw`The dispersion fitter turns tabulated n and k into a passive PoleResidue medium with as few poles as reach the tolerance.`,
num: "Two or three poles usually fit a dielectric over 1.2 to 1.7 µm to an RMS error below 1e-3. Metals over a wide band need 4 to 6.",
r(fig, ctl) {
  ctl.innerHTML = sl("np", "max_num_poles", 1, 6, 1, 3);
  const rng = C3.rng(11); const data = range(1.2, 1.7, 26).map(l => [l, sellSiN(l) + 0.01 * Math.sin(l * 40) + 0.002 * (rng() - 0.5)]);
  const draw = (tsec) => {
    const np = +$("np").value; $("npv").textContent = np;
    const k = Math.min(np, 1 + Math.floor(tsec * 0.8) % np); // poles added over time
    const err = [0.012, 0.006, 0.0025, 0.0012, 0.0008, 0.0006][k - 1];
    const code = `from tidy3d.plugins.dispersion import FastDispersionFitter\nfitter = FastDispersionFitter.from_file("sin_nk.csv", skiprows=1)   # wl(um), n, k\nmedium, rms = fitter.fit(max_num_poles=${np}, tolerance_rms=1e-3)\nfitter.plot(medium)   # with ${k} poles: rms about ${err.toExponential(1)} (illustrative)`;
    const x0 = 60, w = 560, y0 = 36, h = 150; let s = PIC.yaxis(x0, y0, h, 1.96, 2.03, 7, "n", v => v.toFixed(2)) + PIC.xaxis(x0, y0 + h, w, 1.2, 1.7, 5, "wavelength (µm)", v => v.toFixed(1));
    data.forEach(([l, n]) => s += `<circle cx="${x0 + (l - 1.2) / 0.5 * w}" cy="${y0 + h - (n - 1.96) / 0.07 * h}" r="3" fill="var(--p)"/>`);
    const fit = l => sellSiN(l) + 0.01 * Math.sin(l * 40) * Math.min(1, (k - 1) / 3) + 0.003 * Math.sin(l * 9) * (1 - Math.min(1, (k - 1) / 3));
    s += plot(x0, y0, w, h, range(1.2, 1.7, 200), range(1.2, 1.7, 200).map(fit), 1.2, 1.7, 1.96, 2.03, PB, 2);
    s += tx(x0 + w, y0 + 12, `${k} pole${k > 1 ? "s" : ""}, RMS error ${err.toExponential(1)} (illustrative data)`, "end");
    show(fig, code, y0 + h + 44, s);
  };
  $("np").oninput = () => draw(0);
  PIC.player(ctl, draw);
}},

{s: "6. Box and PolySlab", t: "td.Box and td.PolySlab: shapes, and the sidewall angle",
intu: String.raw`A <code>Box</code> is a rectangle in 3D given by centre and size, and <code>td.inf</code> makes a side infinite so a waveguide runs through the whole box. A <code>PolySlab</code> is a polygon in the plane extruded between two heights, which covers tapers, rings and anything drawn in a layout tool. Real etches are not vertical, and the sidewall angle argument tilts the walls. Drag the angle and the height to see the trapezoid the solver will use.`,
eq: String.raw`\[ w_{\mathrm{top}} = w_{\mathrm{ref}} - 2h\tan\theta \quad\text{for a reference plane at the bottom} \]\[ \texttt{sidewall\_angle} = \theta \ \text{in radians, positive = narrowing upward} \]`,
sym: [[String.raw`\(w_{\mathrm{ref}}\)`, "the polygon width at the reference plane"], [String.raw`\(h\)`, "slab thickness, the difference of <code>slab_bounds</code>"], [String.raw`\(\theta\)`, "sidewall angle, positive shrinks the cross-section along the axis"]],
how: ["Box(center, size) with td.inf in size extends that side beyond the box edges.", "PolySlab(vertices, <code>slab_bounds</code>, axis) extrudes the 2D vertices along the axis between the two bounds.", "<code>sidewall_angle</code> tilts the walls. The docs define a positive angle as a cross-section that shrinks along the axis.", "<code>reference_plane</code> chooses whether the given vertices sit at the bottom, middle or top of the slab. The default has changed between versions, so set it explicitly when the angle is not zero."],
say: String.raw`A PolySlab is a polygon extruded between two heights, and a positive sidewall angle makes the cross-section shrink along the extrusion axis from the reference plane.`,
num: "A 10 degree sidewall on a 220 nm silicon strip makes the top 78 nm narrower than the bottom. That shifts the effective index of a 450 nm strip by about 0.01 to 0.02.",
r(fig, ctl) {
  ctl.innerHTML = sl("th", "sidewall_angle (degrees)", -20, 30, 1, 10) + sl("h", "thickness (nm)", 100, 400, 10, 220) + btns([["bottom", "reference bottom"], ["middle", "reference middle"]], "rp");
  let rp = "bottom";
  const u = () => {
    const th = +$("th").value, h = +$("h").value; $("thv").textContent = th + "°"; $("hv").textContent = h + " nm"; pick(ctl, "rp", rp);
    const w = 500, dh = h * Math.tan(th * Math.PI / 180);
    const wb = rp === "bottom" ? w : w + dh, wt = rp === "bottom" ? w - 2 * dh : w - dh;
    const code = `box = td.Box(center=(0, 0, 0), size=(td.inf, 0.5, ${(h / 1000).toFixed(2)}))\nwg = td.Structure(geometry=box, medium=si)\n\nverts = [(-5, -0.25), (5, -0.25), (5, 0.25), (-5, 0.25)]\nslab = td.PolySlab(vertices=verts, slab_bounds=(0, ${(h / 1000).toFixed(2)}), axis=2,\n    sidewall_angle=np.deg2rad(${th}), reference_plane="${rp}")\n# top width ${wt.toFixed(0)} nm, bottom width ${wb.toFixed(0)} nm`;
    const sc = 0.5, cx = 340, yb = 190, yt = yb - h * sc;
    let s = `<rect x="60" y="${yb}" width="560" height="30" fill="var(--sunk)"/>` + tx(340, yb + 20, "oxide below", "middle");
    s += `<polygon points="${cx - wb * sc / 2},${yb} ${cx + wb * sc / 2},${yb} ${cx + wt * sc / 2},${yt} ${cx - wt * sc / 2},${yt}" fill="${PB}" opacity="0.6" stroke="${PB}"/>`;
    s += `<line x1="${cx - wb * sc / 2}" y1="${yb + 40}" x2="${cx + wb * sc / 2}" y2="${yb + 40}" stroke="${PC}" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(cx, yb + 56, `bottom ${wb.toFixed(0)} nm`, "middle");
    s += `<line x1="${cx - wt * sc / 2}" y1="${yt - 12}" x2="${cx + wt * sc / 2}" y2="${yt - 12}" stroke="${PC}" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(cx, yt - 18, `top ${wt.toFixed(0)} nm`, "middle");
    s += `<line x1="${cx + 190}" y1="${yb}" x2="${cx + 190}" y2="${yt}" stroke="var(--p)" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(cx + 198, (yb + yt) / 2 + 4, `${h} nm`);
    const ry = rp === "bottom" ? yb : (yb + yt) / 2; s += `<line x1="${cx - 200}" y1="${ry}" x2="${cx + 200}" y2="${ry}" stroke="${PT}" stroke-dasharray="4 3"/>` + tx(cx - 205, ry + 4, "reference plane", "end");
    show(fig, code, yb + 70, s);
  };
  ctl.querySelectorAll("button[data-rp]").forEach(b => b.onclick = () => { rp = b.dataset.rp; u(); });
  $("th").oninput = u; $("h").oninput = u; u();
}},

{s: "7. GDS and the stack", t: "GDS import and a multilayer stack, layer by layer",
intu: String.raw`Layouts are drawn in GDS files, one polygon layer per mask. <code>td.Geometry.from_gds</code> reads a cell, picks a layer, and extrudes every polygon between two heights. A multilayer platform is a list of such structures stacked up: substrate, buried oxide, the silicon device layer, an oxide gap, a silicon nitride layer, and cladding. Press Next step to build the stack of Part 2 and watch the code grow with it.`,
eq: String.raw`\[ \varepsilon(x,y,z) = \begin{cases} \varepsilon_{\mathrm{Si}} & 0 \lt z \lt 0.22 \\ \varepsilon_{\mathrm{SiO_2}} & 0.22 \lt z \lt 0.22 + g \\ \varepsilon_{\mathrm{SiN}} & 0.22 + g \lt z \lt 0.42 + g \\ \varepsilon_{\mathrm{SiO_2}} & \text{elsewhere} \end{cases} \]`,
sym: [[String.raw`\(g\)`, "the oxide gap between the silicon and nitride layers, µm"], ["layer", "a GDS layer number, one per mask"], [String.raw`\(\texttt{slab}\_\texttt{bounds}\)`, "the z range each layer occupies"]],
how: ["Open the GDS with gdstk and take the top cell.", "For each mask layer call <code>from_gds</code> with its <code>gds_layer</code> and the <code>slab_bounds</code> of that film.", "Wrap each geometry in a Structure with its medium, and list them from the bottom up.", "Everything not covered is the background medium, here SiO2, which plays the role of cladding and gap."],
say: String.raw`A multilayer stack is a list of structures from the bottom up, each a GDS layer or a box extruded between its own heights, over a background that fills the gaps.`,
num: "Part 2 platform: Si 220 nm on 2 µm buried oxide, oxide gap 0.2 to 0.7 µm, Si3N4 200 to 400 nm, 2 µm top cladding. The box only needs about 1 µm of substrate and cladding beyond the guides.",
r(fig, ctl) {
  const names = ["substrate and BOX", "Si device layer", "oxide gap", "SiN layer", "cladding and GDS"];
  const lines = [`import gdstk\nlib = gdstk.read_gds("chip.gds")\ncell = lib.top_level()[0]\nbox_oxide = td.Structure(
    geometry=td.Box(center=(0, 0, -1), size=(td.inf, td.inf, 2)), medium=sio2)`, `si_layer = td.Structure(medium=si, geometry=td.Geometry.from_gds(
    cell, axis=2, slab_bounds=(0, 0.22), gds_layer=1))`, `gap = 0.5   # um, background SiO2 fills it, nothing to add`, `sin_layer = td.Structure(medium=sin, geometry=td.Geometry.from_gds(
    cell, axis=2, slab_bounds=(0.22 + gap, 0.42 + gap), gds_layer=2))`, `sim = td.Simulation(..., medium=sio2,
    structures=[box_oxide, si_layer, sin_layer])`];
  ctl.innerHTML = sl("g", "oxide gap g (µm)", 0.1, 1.0, 0.05, 0.5);
  let step = 0;
  const u = () => {
    const g = +$("g").value; $("gv").textContent = g.toFixed(2) + " µm";
    const code = lines.slice(0, step + 1).join("\n").replace("gap = 0.5", `gap = ${g.toFixed(2)}`);
    const sc = 110, x0 = 40, W = 380, yb = 230; let s = `<rect x="${x0}" y="${yb - 2 * sc * 0.25}" width="${W}" height="${2 * sc * 0.25}" fill="var(--sunk)" stroke="var(--b)"/>` + tx(x0 + W + 8, yb - 20, "BOX 2 µm (drawn shorter)") + `<rect x="${x0}" y="${yb}" width="${W}" height="20" fill="var(--gray-bg)"/>` + tx(x0 + W + 8, yb + 14, "Si substrate");
    let z = yb - 2 * sc * 0.25;
    if (step >= 1) { s += `<rect x="${x0 + 150}" y="${z - 0.22 * sc}" width="60" height="${0.22 * sc}" fill="${PB}" opacity="0.7"/><rect x="${x0 + 300}" y="${z - 0.22 * sc}" width="60" height="${0.22 * sc}" fill="${PB}" opacity="0.7"/>` + tx(x0 + W + 8, z - 0.22 * sc / 2 + 4, "Si 220 nm, GDS layer 1"); }
    z -= 0.22 * sc;
    if (step >= 2) { s += `<rect x="${x0}" y="${z - g * sc}" width="${W}" height="${g * sc}" fill="${PT}" opacity="0.12"/>` + tx(x0 + W + 8, z - g * sc / 2 + 4, `oxide gap ${g.toFixed(2)} µm, background`); }
    z -= g * sc;
    if (step >= 3) { s += `<rect x="${x0 + 60}" y="${z - 0.2 * sc}" width="90" height="${0.2 * sc}" fill="${PP}" opacity="0.7"/><rect x="${x0 + 240}" y="${z - 0.2 * sc}" width="90" height="${0.2 * sc}" fill="${PP}" opacity="0.7"/>` + tx(x0 + W + 8, z - 0.2 * sc / 2 + 4, "SiN 200 nm, GDS layer 2"); }
    z -= 0.2 * sc;
    if (step >= 4) { s += `<rect x="${x0}" y="${z - 50}" width="${W}" height="50" fill="${PT}" opacity="0.08" stroke="var(--b)" stroke-dasharray="3 3"/>` + tx(x0 + W + 8, z - 20, "cladding = background SiO2"); }
    s += tx(x0, 20, "cross-section, z upward, not to scale in x", null);
    show(fig, code, yb + 40, s);
  };
  PIC.stepper(ctl, names.length, k => { step = k; u(); }, names);
  $("g").oninput = u;
}}
],
summary: String.raw`Every material becomes a permittivity: a constant with optional conductivity from td.Medium or <code>from_nk</code>, a measured fit from the material library by name and variant, a Sellmeier curve for a transparent dielectric, or a Lorentz model for dispersion with loss, all stored as poles and residues the solver can march. The dispersion fitter turns your own n and k table into such a passive model. Shapes are boxes, extruded polygons with a sidewall angle, or GDS layers, and a multilayer platform is a list of them stacked from the bottom up over a background that fills the gaps.`,
sheet: [
[String.raw`\[ \varepsilon = (n + ik)^2, \quad \alpha = 4\pi k/\lambda \]`, "<code>Medium.from_nk</code> and the loss it implies"],
[String.raw`\[ n^2(\lambda) = 1 + \sum_j \frac{B_j \lambda^2}{\lambda^2 - C_j} \]`, "td.Sellmeier, λ in µm"],
[String.raw`\[ \varepsilon(f) = \varepsilon_\infty + \frac{\Delta\varepsilon f_0^2}{f_0^2 - f^2 - 2i\delta f} \]`, "td.Lorentz"],
[String.raw`\[ \varepsilon(\omega) = \varepsilon_\infty + \sum_j \left[\frac{c_j}{i\omega - a_j} + \frac{c_j^*}{i\omega - a_j^*}\right] \]`, "td.PoleResidue, what FDTD marches"],
[String.raw`\[ w_{\mathrm{top}} = w_{\mathrm{ref}} - 2h\tan\theta \]`, "PolySlab sidewall angle, bottom reference"]],
consts: String.raw`Si3N4 Luke 2015 Sellmeier: B₁ = 3.0249, C₁ = 0.1353406², B₂ = 40314, C₂ = 1239.842² (µm²). Indices at 1.55 µm: Si 3.48, SiO2 1.44, Si3N4 2.0.`,
sources: ["Tidy3D documentation, td.Medium, material library and td.PolySlab API pages (2.12)", "Tidy3D changelog 2.12 (cSi default variant changed to Palik_LowLoss)", "Tidy3D notebooks Fitting (FastDispersionFitter), GDSImport and GDSExport", "K. Luke, Y. Okawachi, M. Lamont, A. Gaeta, M. Lipson, Opt. Lett. 40, 4823 (2015), Si3N4 Sellmeier fit"]
});
})();
