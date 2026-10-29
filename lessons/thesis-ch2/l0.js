(() => {
/* Small drawing helpers for this lesson only (kept inside this closure so they do not clash with other lessons). */
const CO = "#D85A30", BL = "#378ADD", TL = "#1D9E75", PU = "#7F77DD", AM = "#BA7517";
const fbox = (fig, tex) => { eqWords(fig, tex, '<div class="eqf"></div>'); return fig.querySelector(".eqf"); };
const lab = (x, y, s, anchor, cls, col) => `<text class="${cls || "ts"}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="${anchor || "start"}"${col ? ` style="fill:${col}"` : ""}>${s}</text>`;
const frame = (x0, y0, w, h) => `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--b)"/>`;
const xticks = (x0, y0, w, h, a, b, vals, fmt) => vals.map(v => lab(x0 + (v - a) / (b - a) * w, y0 + h + 15, fmt ? fmt(v) : v, "middle")).join("");
const yticks = (x0, y0, w, h, a, b, vals, fmt) => vals.map(v => lab(x0 - 6, y0 + h - (v - a) / (b - a) * h + 4, fmt ? fmt(v) : v, "end")).join("");
const ytitle = (x, y, s) => `<text class="ts" x="${x}" y="${y}" text-anchor="middle" transform="rotate(-90 ${x} ${y})">${s}</text>`;
const ax = (x0, y0, w, h, a, b, c, d) => ({ X: v => x0 + (v - a) / (b - a) * w, Y: v => y0 + h - (v - c) / (d - c) * h });
const dot = (x, y, col, r) => `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r || 5}" fill="${col}"/>`;
const vline = (x, y1, y2, col, dash) => `<line x1="${(+x).toFixed(1)}" y1="${y1}" x2="${(+x).toFixed(1)}" y2="${y2}" stroke="${col}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const hline = (x1, x2, y, col, dash) => `<line x1="${x1}" y1="${(+y).toFixed(1)}" x2="${x2}" y2="${(+y).toFixed(1)}" stroke="${col}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const ro = items => items.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("");

addLesson("thesis", "ch2", {
zero: true,
labels: { intu: "What it says", how: "How to read it" },
level: "Start here",
id: "thesis-ch2-l0", title: "The equations of Chapter 2 in words", short: "0. Equations in words",
big: String.raw`Every equation in this chapter is a sentence written in symbols. This lesson reads each one aloud: what every letter stands for, what each operation does, what the equation says in plain words, and where it is used later. Cards 1 to 14 are waveguide optics: how a membrane traps light, what a mode and its effective index are, how symmetry sorts the modes, and how a grating, a mirror stack and a multimode section handle the light. Cards 15 to 23 are the FDTD method that computes all of it, from Maxwell's equations to a transmission number you can trust. Colored braces under each part name it. Read this lesson first, and come back to it whenever a symbol in a later lesson looks unfamiliar.`,
bridge: String.raw`The equations are the ones on the equation sheets of Lessons 1 to 11, in the order they first appear. Worked numbers use the round textbook values of those lessons: \(n = 3.5\) for GaAs, air cladding, \(\lambda_0 = 800\) nm, and a 3.5/3.0 mirror stack.`,
cards: [

/* ---------------- 1. Total internal reflection ---------------- */
{s: "1. Total internal reflection", t: String.raw`Snell's law, the critical angle and the evanescent tail`,
intu: String.raw`When light crosses from one material into another, the part of its wave pattern that runs along the surface has to match on both sides. That is all Snell's law says: \(n\sin\theta\) is the same on both sides. Going from GaAs into air the angle opens up, and beyond the critical angle there is no real angle left in the air. The light is then totally reflected. The field still reaches a little way into the air, but it dies away exponentially within tens of nanometers and carries no power away. The decay constant \(\gamma\) grows with \(N = n_1\sin\theta_1\), so a steeper bounce gives a shorter tail.`,
eq: String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2}, \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \]\[ E(z) \propto e^{-\gamma z}, \qquad \gamma = k_{0}\sqrt{N^{2} - n_{\mathrm{c}}^{2}}, \qquad N = n_{1}\sin\theta_{1} \]<div class="eqref">Used in Lesson 1, cards 1 and 2</div>`,
sym: [[String.raw`\(n_{1}, n_{2}\)`, "refractive index on the incoming side (GaAs, 3.5) and on the far side (air, 1)"], [String.raw`\(\theta_{1}, \theta_{2}\)`, "angles of the rays measured from the surface normal, in degrees"], [String.raw`\(\theta_{\mathrm{c}}\)`, String.raw`critical angle: the incoming angle at which \(\theta_2\) reaches 90°. Only exists for \(n_1 \gt n_2\)`], [String.raw`\(\arcsin\)`, "inverse sine: the angle whose sine is the number in brackets"], [String.raw`\(E(z)\)`, "electric field in the cladding at height z above the surface"], [String.raw`\(\gamma\)`, "decay constant of the field in the cladding, in 1/nm"], [String.raw`\(1/\gamma\)`, String.raw`decay length: the field falls by a factor \(e \approx 2.7\) over this distance`], [String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\), 0.00785 nm⁻¹ at 800 nm`], [String.raw`\(N\)`, String.raw`effective index of that bounce angle, \(n_1\sin\theta_1\) (card 2)`], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index, here air, 1"]],
how: [String.raw`Read it aloud: "n one sine theta one equals n two sine theta two. The critical angle is the arcsine of n two over n one. Outside, the field falls off as e to the minus gamma z, with gamma equal to k zero times the square root of N squared minus n c squared".`, String.raw`\(k_0 n\sin\theta\) is the part of the wave vector that runs along the surface. Snell's law says this part is the same on both sides of a flat surface.`, String.raw`If \(n_1\sin\theta_1 \gt n_2\), then \(\sin\theta_2\) would have to be larger than 1. No transmitted ray exists and the field outside becomes evanescent. This can only happen going from high to low index.`, String.raw`Beyond the critical angle \(N \gt n_{\mathrm{c}}\), so the square root is real and the field decays. At the critical angle \(\gamma = 0\) and the tail becomes infinitely long.`, "Used in Lesson 1, cards 1 and 2, and again inside the slab equation (card 5 here)."],
say: String.raw`Light is held in the membrane by total internal reflection: beyond the critical angle, about 17° for GaAs in air, nothing is transmitted and the field outside decays as \(e^{-\gamma z}\).`,
num: String.raw`GaAs to air: \(\theta_{\mathrm{c}} = \arcsin(1/3.5) \approx\) <b>16.6°</b>.<br>\(\lambda_0 = 800\) nm, \(N = 3.0\): \(\gamma = (2\pi/800)\sqrt{9 - 1} \approx\) <b>0.0222 nm⁻¹</b>, decay length about <b>45 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Angle in the GaAs θ₁", 0, 60, 0.5, 25) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{n_{1}}}\sin{\color{#378ADD}{\theta_{1}}}}_{\text{along the surface, inside}} = \underbrace{{\color{#1D9E75}{n_{2}}}\sin\theta_{2}}_{\text{same outside}} \qquad \underbrace{{\color{#7F77DD}{\gamma}}}_{\text{decay rate}} = \overbrace{k_{0}}^{2\pi/\lambda_0}\sqrt{\underbrace{{\color{#BA7517}{N}}^{2}}_{N = n_1\sin\theta_1} - n_{\mathrm{c}}^{2}}`);
  const draw = () => {
    const a = +$("a").value; $("av").textContent = a.toFixed(1) + "°";
    const th = a * Math.PI / 180, thc = Math.asin(1 / 3.5), N = 3.5 * Math.sin(th), L = 110, px = 230, py = 130, sx = Math.sin(th), cx = Math.cos(th);
    let s = `<rect x="20" y="${py}" width="400" height="100" fill="${BL}" fill-opacity="0.13"/>` + hline(20, 420, py, "var(--p)");
    s += lab(28, 44, "air, n₂ = 1", "start", "t") + lab(28, 220, "GaAs, n₁ = 3.5", "start", "t");
    s += vline(px, 24, 232, "var(--t)", "3 3");
    s += `<line x1="${px - 100 * Math.sin(thc)}" y1="${py + 100 * Math.cos(thc)}" x2="${px}" y2="${py}" stroke="${PU}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    s += lab(414, 44, "dashed purple: critical angle", "end", "ts", PU);
    s += arrow(px - L * sx, py + L * cx, px, py, CO, 2.5);
    s += arrow(px, py, px + L * sx, py + L * cx, CO, N > 1 ? 2.5 : 1.2, N > 1 ? "" : "4 3");
    let res;
    if (N < 1) {
      const t2 = Math.asin(N);
      s += arrow(px, py, px + L * Math.sin(t2), py - L * Math.cos(t2), CO, 2.5) + lab(px + 50 * Math.sin(t2) + 10, py - 70, "θ₂", "start", "t", CO);
      res = ["transmitted angle θ₂", (t2 * 180 / Math.PI).toFixed(1) + "°"];
    } else res = ["total internal reflection", "nothing transmitted"];
    s += lab(px - 6, py + 64, "θ₁", "end", "t", CO);
    // inset: field in the air
    s += lab(565, 18, "field in the air above the surface", "middle", "th");
    s += `<line x1="480" y1="${py}" x2="480" y2="28" stroke="var(--t)" marker-end="url(#ar)"/>` + hline(480, 660, py, "var(--p)");
    s += yticks(480, 30, 170, 100, 0, 200, [0, 100, 200]) + ytitle(446, 80, "height z (nm)");
    let dec = ["decay length 1/γ", "no decay"];
    if (N > 1) {
      const g = 2 * Math.PI / 800 * Math.sqrt(N * N - 1), zs = range(0, 200, 81);
      s += plot(480, 30, 170, 100, zs.map(z => Math.exp(-g * z)), zs, 0, 1.05, 0, 200, PU, 2.5);
      if (1 / g <= 200) s += hline(480, 650, py - 50 / g, PU, "4 3") + lab(650, py - 50 / g - 5, "1/γ = " + (1 / g).toFixed(0) + " nm", "end", "ts", PU);
      dec = ["decay length 1/γ", (1 / g).toFixed(0) + " nm"];
    } else s += lab(570, 70, "θ₁ is below θc:", "middle") + lab(570, 88, "the light leaves into the air", "middle");
    s += lab(570, 150, "|E| along the horizontal axis", "middle");
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = ro([["critical angle θc", "16.6°"], ["N = n₁ sin θ₁", N.toFixed(3)], res, dec]);
  };
  $("a").oninput = draw; draw();
}},

/* ---------------- 2. Effective index ---------------- */
{s: "2. Effective index", t: String.raw`The effective index \(N\), the guiding window and the light line`,
intu: String.raw`A guided mode zigzags along the membrane, but for everything that follows only one thing matters: how fast its phase advances along the guide. That rate is the propagation constant \(\beta\). Dividing it by the vacuum wavenumber gives one plain number, the effective index \(N\). The mode behaves as if it were a plane wave in a material of index \(N\). \(N\) must be larger than the cladding index, or the light would leak out as in card 1, and smaller than the core index, because nothing in the core can travel slower than \(c/n\). On a plot of frequency against \(\beta\) this window is the wedge between the light line of the cladding and the line of the bulk core.`,
eq: String.raw`\[ \beta = k_{0}N = k_{0}n\sin\theta, \qquad n_{\mathrm{c}} \lt N \lt n \]\[ \lambda_{\mathrm{guide}} = \frac{\lambda_{0}}{N}, \qquad v_{\mathrm{phase}} = \frac{c}{N} \]\[ \text{light line: } \omega = \frac{c\beta}{n_{\mathrm{c}}}, \qquad \text{guided: } \frac{c\beta}{n} \lt \omega \lt \frac{c\beta}{n_{\mathrm{c}}} \]<div class="eqref">Used in Lesson 1, cards 3 and 5</div>`,
sym: [[String.raw`\(\beta\)`, "propagation constant: phase gained per unit length along the guide, in rad/nm"], [String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\)`], [String.raw`\(N\)`, "effective index of the mode, a pure number"], [String.raw`\(\theta\)`, "bounce angle inside the core, from the surface normal"], [String.raw`\(n, n_{\mathrm{c}}\)`, "core index (3.5) and cladding index (1)"], [String.raw`\(\lambda_{\mathrm{guide}}\)`, "wavelength measured along the guide"], [String.raw`\(v_{\mathrm{phase}}\)`, "speed at which the wave crests move along the guide"], [String.raw`\(\omega\)`, String.raw`angular frequency \(2\pi c/\lambda_0\)`], [String.raw`\(c\)`, String.raw`speed of light in vacuum, \(2.998 \times 10^{8}\) m/s`]],
how: [String.raw`Read it aloud: "beta equals k zero times N, and N lies between the cladding index and the core index. The guide wavelength is lambda zero over N. The light line is omega equals c beta over n c".`, String.raw`\(k_0 n\) is the full wave vector of light in the core. For a ray bouncing at angle \(\theta\), the part along the guide is \(k_0 n\sin\theta\). So \(N = n\sin\theta\) is the same \(N\) as in card 1.`, String.raw`The lower bound \(N \gt n_{\mathrm{c}}\) is total internal reflection. The upper bound \(N \lt n\) is just \(\sin\theta \lt 1\).`, String.raw`Writing \(N = c\beta/\omega\) turns the window into a wedge on the \(\omega\) against \(\beta\) plot. Above the light line, inside the light cone, light can escape into the cladding.`, String.raw`Used in Lesson 1, cards 3 and 5. The guide wavelength \(\lambda_0/N\) sets the grating period (card 10 here).`],
say: String.raw`The effective index is the propagation constant divided by the vacuum wavenumber. A guided mode lies below the light line of the cladding, so \(n_{\mathrm{c}} \lt N \lt n\).`,
num: String.raw`\(\lambda_0 = 800\) nm, \(N = 3.0\): guide wavelength <b>267 nm</b>, phase velocity \(c/3\).<br>\(N = 2.4\): guide wavelength <b>333 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Membrane thickness t (nm)", 20, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\beta}}}_{\text{phase per length}} = \underbrace{k_{0}}_{2\pi/\lambda_0}\,\underbrace{{\color{#378ADD}{N}}}_{\text{effective index}}, \qquad \underbrace{{\color{#1D9E75}{n_{\mathrm{c}}}}}_{\text{cladding}} \lt {\color{#378ADD}{N}} \lt \underbrace{{\color{#7F77DD}{n}}}_{\text{core}}`);
  const us = range(0.004, 0.5, 125), te0 = us.map(u => C2.slabN(3.5, 1, u, 1, 0, "TE")), te1 = us.map(u => C2.slabN(3.5, 1, u, 1, 1, "TE"));
  const x0 = 80, y0 = 20, w = 540, h = 180, A = ax(x0, y0, w, h, 0, 1.8, 0, 0.5);
  const draw = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    let s = `<polygon points="${A.X(0)},${A.Y(0)} ${A.X(0.5)},${A.Y(0.5)} ${A.X(1.75)},${A.Y(0.5)}" fill="${TL}" fill-opacity="0.12"/>` + frame(x0, y0, w, h);
    s += `<line x1="${A.X(0)}" y1="${A.Y(0)}" x2="${A.X(0.5)}" y2="${A.Y(0.5)}" stroke="${TL}" stroke-width="2"/><line x1="${A.X(0)}" y1="${A.Y(0)}" x2="${A.X(1.75)}" y2="${A.Y(0.5)}" stroke="${PU}" stroke-width="2"/>`;
    s += plot(x0, y0, w, h, us.map((u, i) => te0[i] * u), us, 0, 1.8, 0, 0.5, CO, 2.5);
    s += plot(x0, y0, w, h, us.map((u, i) => te1[i] ? te1[i] * u : NaN), us.map((u, i) => te1[i] ? u : NaN), 0, 1.8, 0, 0.5, CO, 1.5, "5 3");
    s += lab(A.X(0.04), A.Y(0.44), "light cone:", "start", "ts", TL) + lab(A.X(0.04), A.Y(0.40), "leaks into air", "start", "ts", TL);
    s += lab(A.X(0.5) + 4, A.Y(0.47), "air light line ω = cβ", "start", "ts", TL) + lab(A.X(1.42), A.Y(0.31), "GaAs line ω = cβ/3.5", "start", "ts", PU);
    s += lab(A.X(0.95), A.Y(0.43), "guided window", "middle", "th") + lab(A.X(1.25), A.Y(0.12), "TE0", "start", "t", CO) + lab(A.X(0.62), A.Y(0.36), "TE1", "start", "ts", CO);
    s += xticks(x0, y0, w, h, 0, 1.8, [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8]) + yticks(x0, y0, w, h, 0, 0.5, [0, 0.1, 0.2, 0.3, 0.4, 0.5]);
    s += lab(x0 + w / 2, y0 + h + 32, "propagation constant βt/2π", "middle") + ytitle(30, y0 + h / 2, "frequency t/λ₀");
    const u = t / 800, N = C2.slabN(3.5, 1, u, 1, 0, "TE");
    s += hline(x0, A.X(N * u), A.Y(u), "var(--t)", "3 3") + dot(A.X(N * u), A.Y(u), CO, 6);
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = ro([["TE0 effective index N", N.toFixed(3)], ["guide wavelength λ₀/N", (800 / N).toFixed(0) + " nm"], ["decay length 1/γ in air", (800 / (2 * Math.PI * Math.sqrt(N * N - 1))).toFixed(0) + " nm"]]);
  };
  $("t").oninput = draw; draw();
}},

/* ---------------- 3. Transverse resonance ---------------- */
{s: "3. Transverse resonance", t: String.raw`Transverse resonance: \(2\kappa t - 2\varphi_{\mathrm{r}} = 2\pi m\)`,
intu: String.raw`Not every bounce angle survives. Follow a ray across the membrane and back once. It gains a phase \(\kappa t\) on each crossing and loses a phase \(\varphi_{\mathrm{r}}\) at each total internal reflection. If the total after the round trip is a whole number of cycles, the wave meets itself in step and builds up. Otherwise successive bounces cancel out. Each whole number \(m\) picks one allowed angle, and each allowed angle is one mode. It is the same physics as a Fabry-Perot resonance, only across the guide instead of along it.`,
eq: String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}}(N) = 2\pi m, \qquad m = 0, 1, 2, \dots \]\[ \kappa = k_{0}\sqrt{n^{2} - N^{2}}, \qquad \varphi_{\mathrm{r}} = 2\arctan\!\left(\frac{\zeta\gamma}{\kappa}\right) \]<div class="eqref">Used in Lesson 1, card 4</div>`,
sym: [[String.raw`\(\kappa\)`, String.raw`transverse wavenumber in the core, \(k_0 n\cos\theta\), in 1/nm (Andreani's \(q\))`], [String.raw`\(t\)`, "core thickness, 160 nm in most examples"], [String.raw`\(2\kappa t\)`, "phase gained crossing the core and coming back"], [String.raw`\(\varphi_{\mathrm{r}}\)`, String.raw`phase lost at one total internal reflection, between 0 and \(\pi\)`], [String.raw`\(m\)`, "mode order: 0 is the fundamental mode, 1 the first-order mode, and so on"], [String.raw`\(\zeta\)`, String.raw`polarization factor, 1 for TE and \((n/n_{\mathrm{c}})^2\) for TM (card 4)`], [String.raw`\(\gamma\)`, "decay constant in the cladding, from card 1"], [String.raw`\(\arctan\)`, "inverse tangent"]],
how: [String.raw`Read it aloud: "two kappa t minus two phi r equals two pi m".`, String.raw`\(\kappa\) is the part of the core wave vector that points across the guide, so \(\kappa t\) is the phase for one crossing. Up and back gives \(2\kappa t\).`, String.raw`Each of the two reflections subtracts \(\varphi_{\mathrm{r}}\). It is zero at the critical angle, approaches \(\pi\) at grazing incidence, and depends on polarization through \(\zeta\).`, String.raw`Requiring the round trip to equal \(2\pi m\) picks out discrete values of \(N\). In a symmetric slab \(m = 0\) always has a solution, and higher \(m\) appear as the slab gets thicker.`, "Used in Lesson 1, card 4. Halve it and take the tangent and it becomes the slab equation of card 5."],
say: String.raw`Guided modes are the bounce angles whose round-trip phase, including the phase lost at the two reflections, is a whole multiple of \(2\pi\).`,
num: String.raw`Slab \(n = 3.5\) in air, \(\lambda_0 = 800\) nm, TE:<br>\(t = 100\) nm: only <b>TE0</b>.<br>\(t = 160\) nm: <b>TE0 and TE1</b>.<br>\(t = 400\) nm: <b>4 TE modes</b>, a new one every 119 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t (nm)", 40, 450, 5, 160) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{2{\color{#D85A30}{\kappa}}{\color{#378ADD}{t}}}_{\text{across and back}} - \underbrace{2{\color{#7F77DD}{\varphi_{\mathrm{r}}}}}_{\text{lost at two bounces}} = \underbrace{2\pi{\color{#1D9E75}{m}}}_{\text{whole cycles}}`);
  const x0 = 300, y0 = 20, w = 350, h = 180, A = ax(x0, y0, w, h, 1, 3.5, -1, 4), Ns = range(1.0005, 3.4995, 200);
  const draw = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    const k0 = 2 * Math.PI / 800;
    let s = `<rect x="20" y="80" width="200" height="80" fill="${BL}" fill-opacity="0.13" stroke="var(--b)"/>` + lab(120, 50, "one round trip across the slab", "middle", "th");
    const zz = [[30, 160], [70, 80], [110, 160], [150, 80], [190, 160]];
    for (let i = 0; i < 4; i++) s += arrow(zz[i][0], zz[i][1], zz[i + 1][0], zz[i + 1][1], CO, 2);
    s += lab(70, 74, "−φr", "middle", "ts", PU) + lab(150, 74, "−φr", "middle", "ts", PU) + lab(110, 176, "−φr", "middle", "ts", PU) + lab(44, 118, "κt", "end", "ts", CO);
    s += arrow(232, 82, 232, 158, "var(--t)", 1, "", true) + lab(240, 124, "t", "start", "t");
    s += lab(120, 214, "GaAs n = 3.5, air both sides", "middle");
    s += frame(x0, y0, w, h);
    for (let m = 0; m <= 3; m++) s += hline(x0, x0 + w, A.Y(m), "var(--t)", "3 3") + lab(x0 + w - 4, A.Y(m) - 4, "m = " + m, "end");
    const ph = Ns.map(N => { const ka = k0 * Math.sqrt(3.5 * 3.5 - N * N), ga = k0 * Math.sqrt(N * N - 1); return (2 * ka * t - 4 * Math.atan(ga / ka)) / (2 * Math.PI); });
    s += plot(x0, y0, w, h, Ns, ph, 1, 3.5, -1, 4, CO, 2.5);
    const modes = [];
    for (let m = 0; m < 6; m++) { const N = C2.slabN(3.5, 1, t, 800, m, "TE"); if (!N) break; modes.push(N); s += dot(A.X(N), A.Y(m), TL, 5); }
    s += xticks(x0, y0, w, h, 1, 3.5, [1, 1.5, 2, 2.5, 3, 3.5]) + yticks(x0, y0, w, h, -1, 4, [-1, 0, 1, 2, 3, 4]);
    s += lab(x0 + w / 2, y0 + h + 32, "effective index N", "middle") + ytitle(272, y0 + h / 2, "round-trip phase / 2π");
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = ro([["guided TE modes", modes.length], ["their N", modes.map(v => v.toFixed(3)).join(", ")]]);
  };
  $("t").oninput = draw; draw();
}},

/* ---------------- 4. Field jump ---------------- */
{s: "4. The field jump", t: String.raw`The field jump at a surface: \(E_z^{\mathrm{air}} = (\varepsilon_{\mathrm{core}}/\varepsilon_{\mathrm{air}})\,E_z^{\mathrm{core}}\)`,
intu: String.raw`Maxwell's equations fix what the fields do at a surface that carries no charge. The part of \(\mathbf{E}\) parallel to the surface is continuous. The part normal to it is not. Instead the normal part of \(\mathbf{D} = \varepsilon\mathbf{E}\) is continuous. So when the field points across the surface, the field just outside in air must be larger by the ratio of permittivities, \(n^2 \approx 12\) for GaAs. TE modes have their electric field along the surface and do not notice. TM modes have it across the surface, so a large part of their field sits outside the GaAs, and that lowers their effective index.`,
eq: String.raw`\[ E_{\parallel}^{\mathrm{air}} = E_{\parallel}^{\mathrm{core}}, \qquad \varepsilon_{\mathrm{air}}E_{z}^{\mathrm{air}} = \varepsilon_{\mathrm{core}}E_{z}^{\mathrm{core}} \]\[ \Longrightarrow\quad E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\,E_{z}^{\mathrm{core}} \]<div class="eqref">Ch. 2 Eq. (2.1), used in Lesson 2, cards 1 and 3</div>`,
sym: [[String.raw`\(E_{\parallel}\)`, "tangential electric field, the part parallel to the surface"], [String.raw`\(E_{z}\)`, "electric field normal to the membrane surfaces"], [String.raw`\(\varepsilon\)`, String.raw`relative permittivity, \(\varepsilon = n^2\): 12.25 for GaAs (3.5), 1 for air`], [String.raw`\(\mathbf{D}\)`, String.raw`displacement field \(\varepsilon_0\varepsilon\mathbf{E}\). Its normal part is continuous when there is no surface charge`], [String.raw`\(^{\mathrm{air}}, ^{\mathrm{core}}\)`, "superscripts: the value just outside and just inside the surface (labels, not powers)"], [String.raw`\(\Longrightarrow\)`, "therefore"]],
how: [String.raw`Read it aloud: "the tangential field is the same on both sides, and epsilon times the normal field is the same on both sides, so the normal field in air is epsilon core over epsilon air times the normal field in the core".`, "The first rule comes from Faraday's law around a thin loop that straddles the surface. The second comes from Gauss's law over a thin pillbox, with no charge on the surface.", String.raw`Dividing the second rule by \(\varepsilon_{\mathrm{air}}\) gives the jump. For GaAs in air the factor is \(n^2 = 12.25\).`, String.raw`TE: the main field \(E_y\) is tangential, so there is no jump. TM: the main field \(E_z\) is normal, so it jumps up just outside. This is where \(\zeta = (n/n_{\mathrm{c}})^2\) in the slab equation comes from.`, "Used in Lesson 2, cards 1 and 3, and for the bright edges of strip modes in Lesson 3, card 4."],
say: "The tangential electric field and the normal displacement field are continuous at a surface, so an electric field normal to the GaAs surface is about 12 times larger just outside.",
num: String.raw`\(n = 3.5\): jump factor \(n^2 =\) <b>12.25</b>.<br>\(n = 3.0\) (AlGaAs-like): <b>9</b>. \(n = 1.45\) (oxide): <b>2.1</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Core index n", 1.5, 3.5, 0.05, 3.5) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{E_{z}^{\mathrm{air}}}}}_{\text{just outside}} = \underbrace{\frac{{\color{#378ADD}{\varepsilon_{\mathrm{core}}}}}{{\color{#1D9E75}{\varepsilon_{\mathrm{air}}}}}}_{n^{2} \approx 12 \text{ for GaAs}}\;\underbrace{{\color{#7F77DD}{E_{z}^{\mathrm{core}}}}}_{\text{just inside}}`);
  const zs = range(-320, 320, 321), x0 = 70, y0 = 20, w = 560, h = 170, A = ax(x0, y0, w, h, -320, 320, 0, 1.08);
  const draw = () => {
    const n = +$("n").value; $("nv").textContent = n.toFixed(2);
    const Nte = C2.slabN(n, 1, 160, 800, 0, "TE"), Ntm = C2.slabN(n, 1, 160, 800, 0, "TM");
    const pe = C2.slabProfile(n, 1, 160, 800, 0, "TE", Nte, zs).main, pm = C2.slabProfile(n, 1, 160, 800, 0, "TM", Ntm, zs).ez;
    let s = `<rect x="${A.X(-80)}" y="${y0}" width="${A.X(80) - A.X(-80)}" height="${h}" fill="${BL}" fill-opacity="0.12"/>` + frame(x0, y0, w, h);
    s += vline(A.X(-80), y0, y0 + h, "var(--t)", "3 3") + vline(A.X(80), y0, y0 + h, "var(--t)", "3 3");
    s += plot(x0, y0, w, h, zs, pe, -320, 320, 0, 1.08, BL, 2.5) + plot(x0, y0, w, h, zs, pm, -320, 320, 0, 1.08, CO, 2.5);
    const inside = 1 / (n * n);
    s += arrow(A.X(80) + 14, A.Y(inside), A.X(80) + 14, A.Y(1) + 4, PU, 1.5) + lab(x0 + w - 8, y0 + 34, "jump at the surface × n² = " + (n * n).toFixed(2), "end", "ts", PU);
    s += lab(A.X(0), y0 + h - 8, "GaAs core, 160 nm", "middle", "ts") + lab(A.X(-300), y0 + 16, "air", "start") + lab(A.X(300), y0 + 16, "air", "end");
    s += lab(A.X(-200), A.Y(0.62), "TE0: Ey, continuous", "middle", "ts", BL) + lab(A.X(-210), A.Y(0.95), "TM0: Ez, jumps", "middle", "ts", CO);
    s += xticks(x0, y0, w, h, -320, 320, [-300, -150, 0, 150, 300]) + yticks(x0, y0, w, h, 0, 1.08, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "position across the membrane z (nm)", "middle") + ytitle(28, y0 + h / 2, "|field| (normalized)");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["jump factor ε_core/ε_air = n²", (n * n).toFixed(2)], ["TE0 N", Nte.toFixed(3)], ["TM0 N", Ntm.toFixed(3)]]);
  };
  $("n").oninput = draw; draw();
}},

/* ---------------- 5. Slab equation ---------------- */
{s: "5. Slab equation", t: String.raw`The slab equation: \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\)`,
intu: String.raw`This is the transverse resonance of card 3 written in the form Andreani and Gerace use. Inside the core the field oscillates with wavenumber \(\kappa\), outside it decays with \(\gamma\). Matching the field and its slope at the two surfaces works only for certain values of \(N\), and this equation says which. The left side belongs to the oscillation in the core, the right side to the decay in the cladding, and \(\zeta\) carries the TM field jump of card 4. One line gives every mode of a symmetric slab, TE and TM, even and odd.`,
eq: String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]\[ \kappa = k_{0}\sqrt{n^{2} - N^{2}}, \qquad \gamma = k_{0}\sqrt{N^{2} - n_{\mathrm{c}}^{2}} \]\[ \zeta = 1 \ \text{(TE)}, \qquad \zeta = \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]<div class="eqref">Ch. 2 Eq. (2.2), Andreani and Gerace App. C, used in Lesson 2, card 2</div>`,
sym: [[String.raw`\(\tan\)`, "tangent"], [String.raw`\(\kappa t/2\)`, "phase of the core oscillation from the centre to one surface"], [String.raw`\(m\pi/2\)`, String.raw`shift that selects even (\(m\) even, cosine) or odd (\(m\) odd, sine) profiles`], [String.raw`\(m\)`, "mode order, 0 is the fundamental mode"], [String.raw`\(\zeta\)`, "boundary factor: 1 for TE, 12.25 for TM in GaAs and air"], [String.raw`\(\kappa\)`, "transverse wavenumber in the core (their q)"], [String.raw`\(\gamma\)`, String.raw`decay constant in the cladding (their \(\chi_1\))`], [String.raw`\(N\)`, "the unknown effective index"], [String.raw`\(t, n, n_{\mathrm{c}}\)`, "thickness, core index, cladding index"], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\)`]],
how: [String.raw`Read it aloud: "the tangent of kappa t over two minus m pi over two equals zeta gamma over kappa".`, String.raw`Both \(\kappa\) and \(\gamma\) depend on the one unknown \(N\). As \(N\) rises from \(n_{\mathrm{c}}\) to \(n\), \(\kappa\) falls and \(\gamma\) rises, so the two sides cross at discrete points.`, String.raw`The shift \(m\pi/2\) switches between even and odd profiles. Even \(m\) are Andreani's Eqs. (C1) and (C4), odd \(m\) are (C2) and (C3).`, String.raw`For TM, \(\zeta = 12.25\) lifts the right side, the crossing moves to larger \(\kappa\), and so \(N_{\mathrm{TM}} \lt N_{\mathrm{TE}}\).`, "Used in Lesson 2, cards 2 to 6, and inside the effective index method of Lesson 3 (card 7 here)."],
say: String.raw`The slab modes satisfy \(\tan(\kappa t/2 - m\pi/2) = \zeta\gamma/\kappa\), with \(\zeta = 1\) for TE and \((n/n_{\mathrm{c}})^2\) for TM. This is the symmetric-slab result of Andreani and Gerace, Appendix C.`,
num: String.raw`\(n = 3.5\), \(t = 160\) nm, \(\lambda_0 = 800\) nm, air: TE0 \(N \approx\) <b>3.08</b>, TM0 \(N \approx\) <b>2.58</b>.<br>Andreani and Gerace call the fundamental mode first-order. Here \(m = 0\) is the fundamental.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t (nm)", 40, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\tan\!\left(\frac{{\color{#D85A30}{\kappa}}t}{2} - \frac{{\color{#1D9E75}{m}}\pi}{2}\right)}_{\text{oscillation in the core}} = \underbrace{{\color{#7F77DD}{\zeta}}}_{1 \text{ TE, } n^{2} \text{ TM}}\,\underbrace{\frac{{\color{#378ADD}{\gamma}}}{{\color{#D85A30}{\kappa}}}}_{\text{decay over oscillation}}`);
  const x0 = 70, y0 = 20, w = 560, h = 170;
  const draw = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    const k0 = 2 * Math.PI / 800, V = k0 * t / 2 * Math.sqrt(3.5 * 3.5 - 1), xm = Math.max(2.2, V * 1.08), A = ax(x0, y0, w, h, 0, xm, 0, 14);
    let s = frame(x0, y0, w, h);
    for (let m = 0; (m * Math.PI) / 2 < xm; m++) {
      const a = m * Math.PI / 2 + 1e-3, b = Math.min((m + 1) * Math.PI / 2 - 1e-3, xm), us = range(a, b, 90);
      s += plot(x0, y0, w, h, us, us.map(u => { const v = Math.tan(u - m * Math.PI / 2); return v > 14 ? NaN : v; }), 0, xm, 0, 14, "var(--t)", 1.5);
      s += lab(A.X(a) + 4, A.Y(0.7), "m = " + m, "start", "ts");
    }
    const us = range(0.005, V - 1e-6, 220);
    for (const [z, col] of [[1, BL], [12.25, CO]]) s += plot(x0, y0, w, h, us, us.map(u => { const v = z * Math.sqrt(V * V - u * u) / u; return v > 14 ? NaN : v; }), 0, xm, 0, 14, col, 2.5);
    const found = { TE: [], TM: [] };
    for (const [pol, z, col] of [["TE", 1, BL], ["TM", 12.25, CO]]) for (let m = 0; m < 6; m++) { const N = C2.slabN(3.5, 1, t, 800, m, pol); if (!N) break; found[pol].push(N); const u = k0 * t / 2 * Math.sqrt(3.5 * 3.5 - N * N), g = k0 * t / 2 * Math.sqrt(N * N - 1); const y = z * g / u; if (y <= 14) s += dot(A.X(u), A.Y(y), col, 5); }
    s += lab(x0, y0 + h + 52, "blue: right side for TE (ζ = 1)", "start", "ts", BL) + lab(x0 + w, y0 + h + 52, "coral: right side for TM (ζ = 12.25)", "end", "ts", CO) + lab(x0 + w / 2, y0 + h + 68, "grey: left side, one branch per m", "middle", "ts");
    const ticks = []; for (let k = 1; k * Math.PI / 2 <= xm; k++) ticks.push(k * Math.PI / 2);
    const nm = ["π/2", "π", "3π/2", "2π", "5π/2", "3π", "7π/2"];
    s += ticks.map((v, i) => lab(A.X(v), y0 + h + 15, nm[i], "middle")).join("") + yticks(x0, y0, w, h, 0, 14, [0, 4, 8, 12]);
    s += lab(x0 + w / 2, y0 + h + 32, "κt/2 (the dots are the modes)", "middle") + ytitle(30, y0 + h / 2, "value of each side");
    box.innerHTML = svg(268, s);
    $("ro").innerHTML = ro([["TE modes, N", found.TE.map(v => v.toFixed(3)).join(", ")], ["TM modes, N", found.TM.map(v => v.toFixed(3)).join(", ")]]);
  };
  $("t").oninput = draw; draw();
}},

/* ---------------- 6. Cutoff and confinement ---------------- */
{s: "6. Cutoff and confinement", t: String.raw`Cutoff thickness \(t_m\) and confinement factor \(\Gamma\)`,
intu: String.raw`Two practical questions about a slab: how thick can it be before a second mode appears, and how much of the light sits inside the GaAs. A new mode appears exactly when its \(N\) can just reach the cladding index, where its tail stops decaying. Putting \(N = n_{\mathrm{c}}\) into the slab equation gives the cutoff thickness, and a new mode appears every \(\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\). The confinement factor is simply the share of \(|E|^2\) that lies inside the core. Thin slabs push most of the mode into the air, thick slabs hold it in.`,
eq: String.raw`\[ t_{m} = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}} \]\[ \Gamma = \frac{\int_{\mathrm{core}} |E|^{2}\,\mathrm{d}z}{\int |E|^{2}\,\mathrm{d}z} \]<div class="eqref">Used in Lesson 2, cards 4 and 5</div>`,
sym: [[String.raw`\(t_{m}\)`, String.raw`cutoff thickness: the thickness at which mode \(m\) appears`], [String.raw`\(m\)`, "mode order"], [String.raw`\(\lambda_{0}\)`, "vacuum wavelength, 800 nm"], [String.raw`\(\sqrt{n^{2} - n_{\mathrm{c}}^{2}}\)`, "index contrast term, 3.354 for GaAs in air"], [String.raw`\(\Gamma\)`, "confinement factor, between 0 and 1"], [String.raw`\(\int_{\mathrm{core}}\)`, "integral over the core only"], [String.raw`\(\int\)`, "integral over all z, core and cladding"], [String.raw`\(|E|^{2}\)`, String.raw`field intensity of the mode (for TE, \(|E_y|^2\))`], [String.raw`\(\mathrm{d}z\)`, "small step across the slab"]],
how: [String.raw`Read it aloud: "the cutoff thickness of mode m is m lambda zero over two root n squared minus n c squared. Gamma is the integral of E squared over the core divided by the integral over all space".`, String.raw`At cutoff \(\gamma = 0\), the right side of the slab equation vanishes and \(\kappa t/2 = m\pi/2\) with \(\kappa = k_0\sqrt{n^2 - n_{\mathrm{c}}^2}\). Solving for \(t\) gives \(t_m\).`, String.raw`For \(m = 0\) the cutoff is zero: the fundamental TE and TM modes of a symmetric slab have no cutoff. TE and TM modes of the same order share the same \(t_m\).`, String.raw`For TE, weighting by \(|E_y|^2\) is a good estimate of the fraction of power in the core. A mode near cutoff has small \(\Gamma\) and is weakly guided.`, "Used in Lesson 2, cards 4 and 5. The same cutoff formula across the width gives the lateral cutoff of Lesson 3 (card 7 here)."],
say: String.raw`In a symmetric slab the fundamental modes have no cutoff and mode \(m\) appears at \(t_m = m\lambda_0/(2\sqrt{n^2 - n_{\mathrm{c}}^2})\). The confinement factor, the share of \(|E|^2\) inside the core, grows with thickness.`,
num: String.raw`\(n = 3.5\) in air at 800 nm: \(t_1 = 800/(2\sqrt{11.25}) \approx\) <b>119 nm</b>, \(t_2 \approx\) <b>239 nm</b>.<br>TE0 confinement: \(t = 80\) nm about <b>70 %</b>, 160 nm about <b>91 %</b>, 300 nm about <b>98 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Thickness t (nm)", 20, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{t_{m}}}}_{\text{mode } m \text{ appears}} = \frac{{\color{#1D9E75}{m}}\,{\color{#378ADD}{\lambda_{0}}}}{2\underbrace{\sqrt{n^{2} - n_{\mathrm{c}}^{2}}}_{\text{index contrast}}} \qquad \underbrace{{\color{#7F77DD}{\Gamma}}}_{\text{share in the core}} = \frac{\int_{\mathrm{core}} |E|^{2}}{\int |E|^{2}}`);
  const ts = range(20, 400, 39), tc = 800 / (2 * Math.sqrt(3.5 * 3.5 - 1));
  const G = [0, 1, 2].map(m => ts.map(t => { const N = C2.slabN(3.5, 1, t, 800, m, "TE"); return N ? C2.slabConfinement(3.5, 1, t, 800, m, N) : NaN; }));
  const x0 = 70, y0 = 20, w = 560, h = 170, A = ax(x0, y0, w, h, 0, 400, 0, 1);
  const draw = () => {
    const t = +$("t").value; $("tv").textContent = t + " nm";
    let s = frame(x0, y0, w, h);
    for (let m = 1; m <= 3; m++) s += vline(A.X(m * tc), y0, y0 + h, PU, "4 3") + lab(A.X(m * tc) + 4, y0 + 14, "t" + ["", "₁", "₂", "₃"][m] + " = " + (m * tc).toFixed(0), "start", "ts", PU);
    [CO, BL, TL].forEach((col, m) => { s += plot(x0, y0, w, h, ts, G[m], 0, 400, 0, 1, col, 2.5); });
    s += lab(A.X(40), A.Y(0.62), "TE0", "start", "t", CO) + lab(A.X(150), A.Y(0.12), "TE1", "start", "t", BL) + lab(A.X(262), A.Y(0.12), "TE2", "start", "t", TL);
    const N0 = C2.slabN(3.5, 1, t, 800, 0, "TE"), g0 = C2.slabConfinement(3.5, 1, t, 800, 0, N0);
    s += vline(A.X(t), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(t), A.Y(g0), CO, 6);
    s += xticks(x0, y0, w, h, 0, 400, [0, 100, 200, 300, 400]) + yticks(x0, y0, w, h, 0, 1, [0, 0.25, 0.5, 0.75, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "thickness t (nm)", "middle") + ytitle(28, y0 + h / 2, "confinement Γ");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["TE0 confinement Γ", (g0 * 100).toFixed(0) + " %"], ["guided TE modes", Math.floor(t / tc) + 1], ["next cutoff", (Math.floor(t / tc + 1) * tc).toFixed(0) + " nm"]]);
  };
  $("t").oninput = draw; draw();
}},

/* ---------------- 7. Effective index method ---------------- */
{s: "7. Effective index method", t: String.raw`The effective index method: two slabs make a strip`,
intu: String.raw`A strip has both a width and a thickness, so its modes are a 2D problem. The effective index method replaces it by two 1D problems. First solve the vertical slab of thickness \(t\) and get its index \(N_{\mathrm{s}}\). Then pretend there is a slab of width \(w\) made of a material with index \(N_{\mathrm{s}}\), and solve again across the width. The second answer estimates the strip's effective index. The cutoff formula of card 6 then says how wide the strip may be before a second lateral mode appears, and for very wide sections the strip index approaches the slab index with a correction that falls as \(1/w^2\).`,
eq: String.raw`\[ \mathrm{slab}(n, t) \to N_{\mathrm{s}}, \qquad \mathrm{slab}(N_{\mathrm{s}}, w) \to N_{\mathrm{eff}} \]\[ w_{p} = \frac{p\lambda_{0}}{2\sqrt{N_{\mathrm{s}}^{2} - n_{\mathrm{c}}^{2}}} \]\[ N_{\mathrm{s}} - N_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8N_{\mathrm{s}}w^{2}} \]<div class="eqref">Used in Lesson 3, cards 1, 3 and 6</div>`,
sym: [[String.raw`\(\mathrm{slab}(n, t)\)`, String.raw`solve the slab equation (card 5) for core index \(n\) and thickness \(t\)`], [String.raw`\(\to\)`, "gives"], [String.raw`\(N_{\mathrm{s}}\)`, "effective index of the vertical slab, used as the core index in step 2 (3.076 for TE, 160 nm)"], [String.raw`\(w\)`, "strip width, along y"], [String.raw`\(N_{\mathrm{eff}}\)`, "estimated effective index of the strip mode"], [String.raw`\(w_{p}\)`, String.raw`width at which lateral mode \(p\) appears`], [String.raw`\(p\)`, "lateral mode order, the number of field zeros across the width"], [String.raw`\(\lambda_{0}, n_{\mathrm{c}}\)`, "vacuum wavelength and cladding index"]],
how: [String.raw`Read it aloud: "solving the slab of index n and thickness t gives N s. Solving a slab of index N s and width w gives N eff. Lateral mode p appears at width w p. For wide strips N s minus N eff is about lambda zero squared over eight N s w squared".`, String.raw`For TE-like modes step 1 is a TE slab and step 2 a TM-type slab, because the main field \(E_y\) is normal to the side walls. For TM-like modes it is the other way round.`, String.raw`\(w_p\) is the cutoff formula of card 6 with \(N_{\mathrm{s}}\) in place of \(n\).`, String.raw`The wide-strip correction follows from a lateral wavenumber of about \(\pi/w\) for the lowest mode. The method is good for wide strips and overestimates \(N_{\mathrm{eff}}\) for narrow, high-contrast strips, where a full mode solver is needed.`, "Used in Lesson 3, cards 1, 3 and 6, and by Soldano and Pennings for MMI sections (cards 13 and 14 here)."],
say: String.raw`The effective index method reduces the strip to two slab problems, vertical then lateral. It is a good estimate for wide strips but overestimates \(N_{\mathrm{eff}}\) for narrow, high-contrast strips.`,
num: String.raw`\(n = 3.5\), \(t = 160\) nm, 800 nm, TE: \(N_{\mathrm{s}} \approx 3.076\).<br>TE-like \(p = 1\) appears near \(w \approx\) <b>138 nm</b> in this method.<br>\(w = 2\) µm: correction \(\approx 800^2/(8 \times 3.076 \times 2000^2) \approx\) <b>0.0065</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Strip width w (nm)", 100, 1500, 10, 400) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\mathrm{slab}({\color{#D85A30}{n}}, {\color{#378ADD}{t}})}_{\text{step 1: vertical}} \to {\color{#1D9E75}{N_{\mathrm{s}}}}, \qquad \underbrace{\mathrm{slab}({\color{#1D9E75}{N_{\mathrm{s}}}}, {\color{#7F77DD}{w}})}_{\text{step 2: across the width}} \to \underbrace{{\color{#BA7517}{N_{\mathrm{eff}}}}}_{\text{strip estimate}}`);
  const ws = range(100, 1500, 57), te = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TE")), tm = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TM"));
  const NsTE = C2.slabN(3.5, 1, 160, 800, 0, "TE"), NsTM = C2.slabN(3.5, 1, 160, 800, 0, "TM");
  const x0 = 70, y0 = 130, w = 560, h = 140, A = ax(x0, y0, w, h, 100, 1500, 1, 3.2);
  const draw = () => {
    const W = +$("w").value; $("wv").textContent = W + " nm";
    let s = "";
    // schematic
    s += `<rect x="20" y="20" width="140" height="70" fill="none" stroke="var(--b)"/><rect x="60" y="45" width="60" height="20" fill="${BL}" fill-opacity="0.5"/>` + lab(90, 108, "strip: w × t", "middle", "ts");
    s += arrow(168, 55, 210, 55, "var(--t)", 1.5);
    s += `<rect x="220" y="20" width="160" height="70" fill="none" stroke="var(--b)"/><rect x="220" y="45" width="160" height="20" fill="${BL}" fill-opacity="0.5"/>` + lab(300, 108, "step 1: slab n, t → Nₛ", "middle", "ts");
    s += arrow(388, 55, 430, 55, "var(--t)", 1.5);
    s += `<rect x="440" y="20" width="160" height="70" fill="none" stroke="var(--b)"/><rect x="490" y="20" width="60" height="70" fill="${TL}" fill-opacity="0.35"/>` + lab(520, 108, "step 2: slab Nₛ, w → Neff", "middle", "ts");
    s += lab(520, 58, "Nₛ", "middle", "t") + lab(630, 58, "→ Neff", "middle", "t", AM);
    // plot
    s += frame(x0, y0, w, h) + hline(x0, x0 + w, A.Y(NsTE), CO, "5 3") + hline(x0, x0 + w, A.Y(NsTM), BL, "5 3");
    s += plot(x0, y0, w, h, ws, te, 100, 1500, 1, 3.2, CO, 2.5) + plot(x0, y0, w, h, ws, tm, 100, 1500, 1, 3.2, BL, 2.5);
    s += lab(x0 + w - 6, A.Y(NsTE) - 5, "Nₛ (TE slab) = 3.076", "end", "ts", CO) + lab(x0 + w - 6, A.Y(NsTM) - 5, "Nₛ (TM slab) = 2.575", "end", "ts", BL);
    s += lab(A.X(700), A.Y(2.72), "TE-like", "middle", "ts", CO) + lab(A.X(700), A.Y(2.25), "TM-like", "middle", "ts", BL);
    const a = C2.eim(3.5, 1, 160, W, 800, "TE"), b = C2.eim(3.5, 1, 160, W, 800, "TM");
    s += vline(A.X(W), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(W), A.Y(a), CO, 5) + dot(A.X(W), A.Y(b), BL, 5);
    s += xticks(x0, y0, w, h, 100, 1500, [100, 500, 900, 1300]) + yticks(x0, y0, w, h, 1, 3.2, [1, 2, 3]);
    s += lab(x0 + w / 2, y0 + h + 32, "strip width w (nm), t = 160 nm, 800 nm", "middle") + ytitle(30, y0 + h / 2, "N");
    box.innerHTML = svg(312, s);
    $("ro").innerHTML = ro([["TE-like Neff", a.toFixed(3)], ["TM-like Neff", b.toFixed(3)], ["Nₛ − Neff (TE-like)", (NsTE - a).toFixed(4)], ["wide-strip formula", (640000 / (8 * NsTE * W * W)).toFixed(4)]]);
  };
  $("w").oninput = draw; draw();
}},

/* ---------------- 8. Mirrors and parity ---------------- */
{s: "8. Mirrors and parity", t: String.raw`Mirror symmetry: even and odd modes, and why they never mix`,
intu: String.raw`The membrane looks the same in a mirror placed at its mid-plane. A mirror flips the normal component of \(\mathbf{E}\). \(\mathbf{H}\) is different: it is made by a curl, an axial vector, so the mirror flips its tangential components instead. Since the structure does not change under the mirror, every mode must come back as itself times \(+1\) (even) or times \(-1\) (odd). The even modes form the TE-like family and the odd modes the TM-like family. A perturbation that keeps the symmetry can only couple modes of the same parity, because the integral of an even function times an odd function is zero.`,
eq: String.raw`\[ z \to -z:\quad (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}) \]\[ (H_{x}, H_{y}, H_{z}) \to (-H_{x}, -H_{y}, H_{z}) \]\[ M[\mathbf{E}] = \sigma\mathbf{E}, \qquad \sigma = \pm 1, \qquad E_{y}(-y, z) = \sigma_{y}E_{y}, \quad E_{y}(y, -z) = \sigma_{z}E_{y} \]\[ \kappa_{12} \propto \int \Delta\varepsilon\,E_{1}E_{2}\,\mathrm{d}z \]<div class="eqref">Used in Lesson 3, card 5 and Lesson 4, cards 1, 2 and 6</div>`,
sym: [[String.raw`\(z \to -z\)`, "the mirror: reflect every point through the mid-plane z = 0"], [String.raw`\(\mathbf{E}\)`, "polar vector: the mirror flips its component normal to the mirror"], [String.raw`\(\mathbf{H}\)`, "axial vector: the mirror flips its components parallel to the mirror"], [String.raw`\(M[\mathbf{E}]\)`, "the field after applying the mirror rule and moving each point to its mirror point"], [String.raw`\(\sigma\)`, "parity: +1 for an even mode, −1 for an odd mode"], [String.raw`\(\sigma_{y}, \sigma_{z}\)`, String.raw`parity of \(E_y\) under the \(y\) and \(z\) mirrors of a strip`], [String.raw`\(\kappa_{12}\)`, "coupling coefficient between modes 1 and 2 (coupled-mode theory)"], [String.raw`\(\Delta\varepsilon\)`, "change of permittivity, for example a thin layer near the slab"], [String.raw`\(E_{1}, E_{2}\)`, "the two mode profiles across the slab"], [String.raw`\(\propto\)`, "is proportional to"]],
how: [String.raw`Read it aloud: "under the mirror z to minus z, E keeps its in-plane parts and flips E z, while H flips its in-plane parts and keeps H z. A mode is even or odd: the mirrored field is sigma times the field, with sigma plus or minus one. The coupling of two modes is proportional to the integral of delta epsilon times E one times E two".`, String.raw`\(\mathbf{H}\) is tied to \(\nabla \times \mathbf{E}\), and a curl gains one extra sign under a reflection. That is why \(\mathbf{E}\) and \(\mathbf{H}\) follow opposite rules.`, String.raw`Mirroring twice gives back the original, so \(\sigma^2 = 1\) and only \(\pm 1\) are possible. On the plane \(z = 0\) an even mode has \(E_z = 0\) and an odd mode has \(E_x = E_y = 0\).`, String.raw`For a strip both mirrors are used: TE0 is \((\sigma_y, \sigma_z) = (+, +)\), TM0 is \((-, -)\), TE1 is \((-, +)\) and TM1 is \((+, -)\).`, String.raw`If \(\Delta\varepsilon\) is even and \(E_1E_2\) is odd, the integrand is odd and \(\kappa_{12} = 0\). A substrate on one side breaks this (Lesson 4, card 6).`],
say: "Because the membrane is symmetric, every mode is even or odd under the mid-plane mirror, and a structure that keeps this symmetry cannot couple an even mode to an odd one.",
num: String.raw`Only two eigenvalues: <b>+1</b> or <b>−1</b>.<br>TE0 and TE1 of a 300 nm slab with identical layers on both sides: \(\kappa_{12}\) exactly <b>0</b>. With a layer on one side only, the coupling is nonzero and drops by orders of magnitude when the layer moves a few decay lengths \(1/\gamma\) away.`,
r(fig, ctl) {
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{M[\mathbf{E}]}}}_{\text{mirrored field}} = \underbrace{{\color{#378ADD}{\sigma}}}_{\pm 1}\,\mathbf{E} \qquad \underbrace{{\color{#7F77DD}{\kappa_{12}}}}_{\text{coupling}} \propto \int \underbrace{{\color{#BA7517}{\Delta\varepsilon}}}_{\text{even layers}}\,\underbrace{{\color{#1D9E75}{E_{1}E_{2}}}}_{\text{even} \times \text{odd}}\,\mathrm{d}z`);
  let s = lab(160, 18, "what a mirror does to E and H", "middle", "th");
  s += hline(20, 310, 125, PU, "6 4") + lab(22, 119, "mirror z = 0", "start", "ts", PU);
  s += arrow(40, 80, 95, 80, CO, 2.5) + arrow(120, 105, 120, 55, CO, 2.5) + arrow(40, 170, 95, 170, CO, 2.5) + arrow(120, 145, 120, 195, CO, 2.5);
  s += arrow(185, 80, 240, 80, BL, 2.5) + arrow(275, 105, 275, 55, BL, 2.5) + arrow(240, 170, 185, 170, BL, 2.5) + arrow(275, 195, 275, 145, BL, 2.5);
  s += lab(80, 46, "E", "middle", "t", CO) + lab(230, 46, "H", "middle", "t", BL);
  s += lab(80, 222, "normal part flips", "middle", "ts", CO) + lab(230, 222, "tangential part flips", "middle", "ts", BL);
  // right: profiles
  const zs = range(-420, 420, 301), N1 = C2.slabN(3.5, 1, 300, 800, 0, "TE"), N2 = C2.slabN(3.5, 1, 300, 800, 1, "TE");
  const e1 = C2.slabProfile(3.5, 1, 300, 800, 0, "TE", N1, zs).main, e2 = C2.slabProfile(3.5, 1, 300, 800, 1, "TE", N2, zs).main, pr = e1.map((v, i) => v * e2[i]);
  const yT = 30, H = 180, zY = z => yT + H / 2 - z / 420 * H / 2;
  const cols = [[390, e1, "E₁ (TE0, even)", BL], [490, e2, "E₂ (TE1, odd)", CO], [600, pr, "E₁·E₂ (odd)", TL]];
  for (const [cx, p, name, col] of cols) {
    s += `<rect x="${cx - 42}" y="${zY(150)}" width="84" height="${zY(-150) - zY(150)}" fill="${BL}" fill-opacity="0.1"/>`;
    s += `<rect x="${cx - 42}" y="${zY(230)}" width="84" height="${zY(180) - zY(230)}" fill="${AM}" fill-opacity="0.45"/><rect x="${cx - 42}" y="${zY(-180)}" width="84" height="${zY(-230) - zY(-180)}" fill="${AM}" fill-opacity="0.45"/>`;
    s += vline(cx, yT, yT + H, "var(--t)", "2 3");
    if (col === TL) { let d = `M${cx} ${zY(zs[0])}`; zs.forEach((z, i) => { d += `L${(cx + 40 * p[i]).toFixed(1)} ${zY(z).toFixed(1)}`; }); d += `L${cx} ${zY(zs[zs.length - 1])}Z`; s += `<path d="${d}" fill="${TL}" fill-opacity="0.25"/>`; }
    s += plot(cx - 40, yT, 80, H, p, zs, -1, 1, -420, 420, col, 2.2) + lab(cx, yT + H + 16, name, "middle", "ts", col);
  }
  s += lab(632, zY(80), "+", "middle", "t", TL) + lab(632, zY(-80) + 8, "−", "middle", "t", TL);
  s += lab(495, 18, "amber: identical thin layers Δε on both sides", "middle", "ts", AM);
  s += lab(495, yT + H + 34, "+ and − halves cancel, so κ₁₂ = 0", "middle", "ts");
  box.innerHTML = svg(250, s);
}},

/* ---------------- 9. PEC, PMC and symmetry planes ---------------- */
{s: "9. PEC, PMC, symmetry", t: String.raw`PEC and PMC walls, and the symmetry values \(\pm 1\) in Tidy3D`,
intu: String.raw`If a mode is even or odd, half of it is enough, because the other half is its mirror image. An FDTD solver keeps only one half and puts a wall on the mirror plane that forces the right parity. A perfect electric conductor (PEC) makes the tangential \(\mathbf{E}\) vanish, which is exactly what an odd mode does on its mirror plane. A perfect magnetic conductor (PMC) makes the tangential \(\mathbf{H}\) vanish, which is what an even mode does. Tidy3D calls these \(-1\) and \(+1\). Every plane used halves the number of cells, but only if the structure and the source share the symmetry, and only if the value matches the mode that is launched.`,
eq: String.raw`\[ \text{PEC: } \hat{\mathbf{n}} \times \mathbf{E} = 0, \qquad \text{PMC: } \hat{\mathbf{n}} \times \mathbf{H} = 0 \]\[ \text{Tidy3D: } +1 = \text{even} = \text{PMC}, \qquad -1 = \text{odd} = \text{PEC} \]\[ z = 0:\ \text{TE0 } {+1},\ \text{TM0 } {-1}, \qquad y = 0:\ \text{TE0 } {-1},\ \text{TM0 } {+1} \]\[ \text{cells} = \frac{N_{\mathrm{cells}}}{2^{s}} \]<div class="eqref">Used in Lesson 4, cards 3 to 5</div>`,
sym: [[String.raw`\(\hat{\mathbf{n}}\)`, "unit vector normal to the wall"], [String.raw`\(\times\)`, String.raw`cross product: \(\hat{\mathbf{n}} \times \mathbf{E}\) keeps only the part of \(\mathbf{E}\) lying in the wall`], [String.raw`\(\mathbf{E}, \mathbf{H}\)`, "electric and magnetic fields"], ["PEC", "perfect electric conductor, an ideal metal: tangential E is zero"], ["PMC", "perfect magnetic conductor, the mathematical dual: tangential H is zero"], [String.raw`\(+1, -1, 0\)`, "Tidy3D symmetry values: even (PMC), odd (PEC), no symmetry"], [String.raw`\(s\)`, "number of symmetry planes used, 0 to 3"], [String.raw`\(N_{\mathrm{cells}}\)`, "grid cells of the full domain"], [String.raw`\(2^{s}\)`, "each plane halves the domain"]],
how: [String.raw`Read it aloud: "on a PEC wall n cross E is zero, on a PMC wall n cross H is zero. In Tidy3D plus one is even and PMC, minus one is odd and PEC. With s planes the cell count is N cells over two to the s".`, String.raw`An even mode has no normal \(\mathbf{E}\) and no tangential \(\mathbf{H}\) on its mirror plane (card 8), so it already satisfies PMC. An odd mode already satisfies PEC.`, String.raw`The value depends on the plane. TE0's main field \(E_y\) lies in the plane \(z = 0\), so it needs \(+1\) there, but it crosses the plane \(y = 0\), so it needs \(-1\) there.`, "A wrong value removes the launched mode and the transmission comes out near zero. The structure and the source must both be symmetric under every chosen mirror.", "Used in Lesson 4, cards 3 to 5, and in the simulation workflow of Lesson 11, card 6."],
say: String.raw`In Tidy3D the value \(+1\) is a PMC plane and keeps fields whose tangential electric field is nonzero on the plane, \(-1\) is a PEC plane and keeps fields whose tangential electric field vanishes there, so which value keeps TE0 depends on the plane.`,
num: String.raw`1 plane: <b>50 %</b> of the cells. 2 planes: <b>25 %</b>. 3 planes: <b>12.5 %</b>.<br>TE0 needs <b>+1</b> at \(z = 0\) but <b>−1</b> at \(y = 0\).`,
r(fig, ctl) {
  ctl.innerHTML = btns([["TE0", "TE0 (main field Ey)"], ["TM0", "TM0 (main field Ez)"]], "m") + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\text{PEC: } \hat{\mathbf{n}} \times {\color{#D85A30}{\mathbf{E}}} = 0}_{\text{keeps odd modes, } -1} \qquad \underbrace{\text{PMC: } \hat{\mathbf{n}} \times {\color{#378ADD}{\mathbf{H}}} = 0}_{\text{keeps even modes, } +1} \qquad \underbrace{\frac{N_{\mathrm{cells}}}{2^{{\color{#1D9E75}{s}}}}}_{\text{cells left}}`);
  let cur = "TE0";
  const draw = () => {
    pick(ctl, "m", cur);
    const te = cur === "TE0";
    let s = `<rect x="40" y="30" width="360" height="180" fill="none" stroke="var(--b)"/><rect x="220" y="30" width="180" height="90" fill="${TL}" fill-opacity="0.13"/>`;
    s += `<rect x="120" y="90" width="200" height="60" fill="${BL}" fill-opacity="0.25" stroke="var(--b)"/>`;
    s += hline(40, 400, 120, PU, "6 4") + vline(220, 30, 210, PU, "6 4");
    for (const x of [142, 181, 220, 259, 298]) for (const y of [105, 135]) {
      const a = Math.cos((x - 220) / 120 * 1.2) * Math.cos((y - 120) / 30 * 0.7);
      if (te) s += arrow(x - 16 * a, y, x + 16 * a, y, CO, 2); else s += arrow(x, y + 11 * a, x, y - 11 * a, CO, 2);
    }
    s += lab(230, 46, "simulated quarter", "start", "ts", TL);
    s += lab(46, 113, "z = 0:", "start", "ts", PU) + lab(46, 137, te ? "+1 (PMC)" : "−1 (PEC)", "start", "ts", PU) +lab(214, 204, "y = 0: " + (te ? "−1 (PEC)" : "+1 (PMC)"), "end", "ts", PU);
    s += lab(220, 228, "strip cross-section, y across, z up", "middle", "ts");
    const l1 = te ? ["Ey lies in the plane z = 0,", "so it is tangential there:", "keep it with PMC, +1"] : ["Ez crosses the plane z = 0,", "so its tangential E is zero:", "keep it with PEC, −1"];
    const l2 = te ? ["Ey crosses the plane y = 0,", "so its tangential E is zero:", "keep it with PEC, −1"] : ["Ez lies in the plane y = 0,", "so it is tangential there:", "keep it with PMC, +1"];
    s += lab(420, 50, "plane z = 0", "start", "th") + l1.map((t, i) => lab(420, 68 + 16 * i, t)).join("");
    s += lab(420, 136, "plane y = 0", "start", "th") + l2.map((t, i) => lab(420, 154 + 16 * i, t)).join("");
    s += lab(420, 214, "two planes: 25 % of the cells", "start", "ts", TL);
    box.innerHTML = svg(240, s);
    $("ro").innerHTML = ro([["symmetry = (sx, sy, sz)", te ? "(0, −1, +1)" : "(0, +1, −1)"], ["cells simulated", "N / 4"]]);
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { cur = b.dataset.m; draw(); });
  draw();
}},

/* ---------------- 10. Grating phase matching ---------------- */
{s: "10. Grating phase matching", t: String.raw`Grating phase matching: \(k_0 n_{\mathrm{c}}\sin\theta_m = \beta + m\,2\pi/\Lambda\)`,
intu: String.raw`A guided mode cannot leave the chip on its own, because its momentum along the surface, \(\beta = k_0 N\), is larger than anything a wave in air can have, which is at most \(k_0 n_{\mathrm{c}}\). A grating with period \(\Lambda\) can add or remove momentum in steps of \(K = 2\pi/\Lambda\). Remove one step and the remainder can fall inside the window of air, and the light leaves at the angle whose momentum along the surface matches. Solving for the period gives the design rule. Exactly vertical emission is avoided, because then two steps turn the mode into its own backward copy, which is a strong reflection.`,
eq: String.raw`\[ k_{0}n_{\mathrm{c}}\sin\theta_{m} = \beta + m\,\frac{2\pi}{\Lambda}, \qquad m = 0, \pm 1, \pm 2, \dots \]\[ \Lambda = \frac{\lambda_{0}}{N - n_{\mathrm{c}}\sin\theta}, \qquad \Lambda = \frac{\lambda_{0}}{N} \ \text{(vertical)} \]\[ \theta = 0 \;\Longrightarrow\; \beta - 2\cdot\frac{2\pi}{\Lambda} = -\beta \]<div class="eqref">Ch. 2 Eqs. (2.3) and (2.4), used in Lesson 5, cards 2 to 4</div>`,
sym: [[String.raw`\(k_{0}\)`, String.raw`vacuum wavenumber \(2\pi/\lambda_0\)`], [String.raw`\(n_{\mathrm{c}}\)`, "index of the medium the light goes into, air, 1"], [String.raw`\(\theta_{m}\)`, String.raw`emission angle of order \(m\), from the surface normal, positive toward the propagation direction`], [String.raw`\(\beta\)`, String.raw`propagation constant of the guided mode, \(k_0 N\)`], [String.raw`\(m\)`, "diffraction order, the number of grating kicks (−1 is the one used)"], [String.raw`\(\Lambda\)`, "grating period, about 300 nm here"], [String.raw`\(2\pi/\Lambda\)`, String.raw`grating vector \(K\): the momentum one period supplies`], [String.raw`\(N\)`, "average effective index of the grating region, set by fill factor and etch depth"], [String.raw`\(\theta\)`, "target emission angle"], [String.raw`\(-\beta\)`, "the same guided mode travelling backward"]],
how: [String.raw`Read it aloud: "k zero n c sine theta m equals beta plus m times two pi over Lambda. For the first order the period is lambda zero over N minus n c sine theta".`, String.raw`The left side is the momentum along the surface of a plane wave leaving at \(\theta_m\). It lies between \(-k_0 n_{\mathrm{c}}\) and \(+k_0 n_{\mathrm{c}}\), so an order radiates only if \(|\beta + mK| \lt k_0 n_{\mathrm{c}}\).`, String.raw`Put \(m = -1\) and divide by \(k_0\): \(n_{\mathrm{c}}\sin\theta = N - \lambda_0/\Lambda\). Rearranged, that is the period formula.`, String.raw`At \(\theta = 0\), \(K = \beta\), so the order \(m = -2\) lands exactly on \(-\beta\), the backward guided mode. That is why a small tilt, about 10°, is used.`, String.raw`Used in Lesson 5, cards 2 to 4 and 6. \(N\) comes from cards 2 and 5 here.`],
say: String.raw`A grating radiates the diffraction orders whose propagation constant \(\beta + mK\) falls inside the light circle of the cladding, and the period \(\lambda_0/(N - n_{\mathrm{c}}\sin\theta)\) is chosen so that only the first order radiates, slightly off vertical.`,
num: String.raw`\(N = 2.8\), \(\lambda_0 = 800\) nm, \(\Lambda = 300\) nm: \(\sin\theta_{-1} = 2.8 - 800/300 = 0.133\), \(\theta \approx\) <b>7.7°</b>. Order \(-2\): \(2.8 - 5.33 = -2.53\), does not radiate.<br>Vertical: \(\Lambda =\) <b>286 nm</b>. \(\theta = 10°\): \(\Lambda \approx\) <b>305 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Grating period Λ (nm)", 240, 420, 1, 300) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{k_{0}{\color{#1D9E75}{n_{\mathrm{c}}}}\sin{\color{#7F77DD}{\theta_{m}}}}_{\text{momentum along the surface in air}} = \underbrace{{\color{#378ADD}{\beta}}}_{\text{guided mode}} + \underbrace{{\color{#BA7517}{m}}\,\frac{2\pi}{{\color{#D85A30}{\Lambda}}}}_{m \text{ grating kicks}}`);
  const draw = () => {
    const L = +$("L").value; $("Lv").textContent = L + " nm";
    const N = 2.8, K = 800 / L, s1 = N - K, s2 = N - 2 * K, X = k => 340 + k * 87.5, yA = 244;
    let s = `<rect x="40" y="100" width="600" height="16" fill="${BL}" fill-opacity="0.35"/>`;
    const p = L / 10; for (let x = 150; x < 600; x += p) s += `<rect x="${x.toFixed(1)}" y="92" width="${(p / 2).toFixed(1)}" height="8" fill="${BL}" fill-opacity="0.6"/>`;
    s += arrow(48, 108, 140, 108, "#0C447C", 2.5) + lab(48, 134, "guided mode, N = 2.8", "start", "ts");
    if (Math.abs(s1) < 1) {
      const th = Math.asin(s1);
      for (const x of [240, 340, 440, 540]) s += arrow(x, 88, x + 72 * Math.sin(th), 88 - 72 * Math.cos(th), CO, 2);
      s += vline(340, 14, 88, "var(--t)", "3 3") + lab(352, 22, "θ = " + (th * 180 / Math.PI).toFixed(1) + "°", "start", "t", CO);
    } else s += lab(340, 50, "order −1 cannot radiate at this period", "middle", "t", CO);
    // k-space
    s += `<path d="M${X(-1)} ${yA} A 87.5 87.5 0 0 1 ${X(1)} ${yA} Z" fill="${TL}" fill-opacity="0.12" stroke="${TL}"/>` + lab(X(0), yA - 93, "air: |k| ≤ k₀", "middle", "ts", TL);
    s += `<line x1="50" y1="${yA}" x2="640" y2="${yA}" stroke="var(--t)" marker-end="url(#ar)"/>`;
    for (let k = -3; k <= 3; k++) s += vline(X(k), yA - 3, yA + 3, "var(--t)") + lab(X(k), yA + 16, k, "middle");
    s += lab(648, yA + 4, "k/k₀", "start");
    s += dot(X(N), yA, BL, 6) + lab(X(N) + 2, yA - 30, "β", "middle", "t", BL);
    s += arrow(X(N), yA - 14, X(s1), yA - 14, CO, 2) + lab((X(N) + X(s1)) / 2, yA - 20, "−K", "middle", "ts", CO) + dot(X(s1), yA, CO, 4);
    if (s2 > -3.6) s += arrow(X(s1), yA - 46, X(s2), yA - 46, PU, 1.5, "5 3") + lab((X(s1) + X(s2)) / 2, yA - 52, "−2K", "middle", "ts", PU) + dot(X(s2), yA, PU, 4);
    if (Math.abs(s1) < 1) s += arrow(X(0), yA, X(s1), yA - 87.5 * Math.sqrt(1 - s1 * s1), CO, 2);
    box.innerHTML = svg(270, s);
    $("ro").innerHTML = ro([["kick K/k₀ = λ₀/Λ", K.toFixed(3)], ["sin θ for m = −1", s1.toFixed(3)], ["angle", Math.abs(s1) < 1 ? (Math.asin(s1) * 180 / Math.PI).toFixed(1) + "°" : "does not radiate"], ["m = −2 lands at", s2.toFixed(2) + (Math.abs(s2) < 1 ? " (radiates)" : " (outside)")]]);
  };
  $("L").oninput = draw; draw();
}},

/* ---------------- 11. DBR ---------------- */
{s: "11. DBR mirror", t: String.raw`The DBR mirror: one interface, quarter-wave layers, peak reflectance and stopband`,
intu: String.raw`One interface between two similar materials reflects very little. A distributed Bragg reflector stacks many interfaces and makes all their reflections come back in step. Each layer is a quarter wavelength thick in its own material, so a trip down and back up through it adds half a wavelength, a phase of \(\pi\). Together with the alternating sign of \(r\) at successive interfaces, that lines all the reflections up. The peak reflectance then depends only on the index ratio raised to twice the number of pairs. The band where it works, the stopband, depends only on the single-interface contrast: small contrast means many pairs and a narrow band.`,
eq: String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}}, \qquad d = \frac{\lambda_{0}}{4n} \]\[ R = \left(\frac{q - 1}{q + 1}\right)^{2}, \qquad q = \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)^{2N} \]\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi}\arcsin\!\left(\frac{n_{\mathrm{H}} - n_{\mathrm{L}}}{n_{\mathrm{H}} + n_{\mathrm{L}}}\right) \]<div class="eqref">Ch. 2 Eqs. (2.5) and (2.6), Gačević and Vukmirović, used in Lesson 6, cards 1 to 4</div>`,
sym: [[String.raw`\(r\)`, "amplitude reflection coefficient of one interface at normal incidence"], [String.raw`\(n_{1}, n_{2}\)`, "index on the incoming side and on the far side"], [String.raw`\(d\)`, "thickness of one layer: 57.1 nm for 3.5 and 66.7 nm for 3.0 at 800 nm"], [String.raw`\(n\)`, "index of that layer"], [String.raw`\(R\)`, "peak power reflectance of the stack, at the design wavelength"], [String.raw`\(q\)`, String.raw`\((n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\), grows exponentially with the number of pairs`], [String.raw`\(n_{\mathrm{H}}, n_{\mathrm{L}}\)`, "high and low index, 3.5 and 3.0 in the examples"], [String.raw`\(N\)`, "number of high and low pairs (here N is a count, not the effective index)"], [String.raw`\(\Delta\lambda_{0}\)`, "full width of the stopband, in nm"], [String.raw`\(\lambda_{0}\)`, "design wavelength, 800 nm"]],
how: [String.raw`Read it aloud: "r equals n one minus n two over n one plus n two. Each layer is lambda zero over four n thick. The peak reflectance is q minus one over q plus one, squared, with q equal to n H over n L to the power two N. The stopband width is four lambda zero over pi times the arcsine of the interface contrast".`, String.raw`\(r\) is negative, a phase shift of \(\pi\), when light reflects off a higher index. The power reflected by one interface is \(r^2\).`, String.raw`A layer of thickness \(\lambda_0/(4n)\) is a quarter wave thick, so going down and back adds a phase of \(\pi\). All partial reflections then add in phase at \(\lambda_0\).`, String.raw`\(q\) grows exponentially with \(N\), so \(R\) approaches 1. This form assumes the same medium in front of and behind the stack. The stopband formula contains only the contrast, not \(N\).`, "Used in Lesson 6, cards 1 to 4, for the mirror under the grating."],
say: String.raw`The peak reflectance of a quarter-wave DBR is \(((q - 1)/(q + 1))^2\) with \(q = (n_{\mathrm{H}}/n_{\mathrm{L}})^{2N}\), so a small index ratio needs many pairs and gives a narrow stopband.`,
num: String.raw`3.5 against 3.0: \(r = 0.077\), \(R =\) <b>0.59 %</b> per interface. Layers <b>57.1 nm</b> and <b>66.7 nm</b>.<br>10 pairs: \(R \approx\) <b>83 %</b>. 20 pairs: about <b>99 %</b>.<br>Stopband: \((3200/\pi)\arcsin(0.0769) \approx\) <b>78 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Number of pairs N", 1, 30, 1, 10) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{R}}}_{\text{peak reflectance}} = \left(\frac{q - 1}{q + 1}\right)^{2}, \qquad \underbrace{q}_{\text{grows with pairs}} = \left(\frac{{\color{#378ADD}{n_{\mathrm{H}}}}}{{\color{#1D9E75}{n_{\mathrm{L}}}}}\right)^{2{\color{#7F77DD}{N}}}, \qquad \underbrace{{\color{#BA7517}{d}}}_{\text{layer}} = \frac{\lambda_{0}}{4n}`);
  const ls = range(650, 1000, 176), x0 = 300, y0 = 20, w = 350, h = 170, A = ax(x0, y0, w, h, 650, 1000, 0, 1);
  const draw = () => {
    const N = +$("N").value; $("Nv").textContent = N;
    const layers = C2.dbrLayers(3.5, 3.0, N, 800), Rs = ls.map(l => C2.tmmR(1, layers, 1, l)), q = Math.pow(3.5 / 3.0, 2 * N), Rf = Math.pow((q - 1) / (q + 1), 2);
    let s = "";
    for (let k = 0; k < 8; k++) s += `<rect x="30" y="${40 + 20 * k}" width="100" height="20" fill="${BL}" fill-opacity="${k % 2 ? 0.14 : 0.42}"/>`;
    s += arrow(50, 6, 50, 38, CO, 2);
    for (let k = 0; k < 4; k++) s += arrow(76 + 14 * k, 40 + 20 * k, 76 + 14 * k, 8, CO, 1.2);
    s += lab(136, 54, "nH = 3.5, 57.1 nm") + lab(136, 74, "nL = 3.0, 66.7 nm") + lab(80, 218, "4 of the N pairs drawn", "middle") + lab(136, 30, "reflections in step", "start", "ts", CO);
    s += frame(x0, y0, w, h) + hline(x0, x0 + w, A.Y(Rf), PU, "5 3") + lab(x0 + 6, A.Y(Rf) - 5, "formula R = " + (Rf * 100).toFixed(1) + " %", "start", "ts", PU);
    s += plot(x0, y0, w, h, ls, Rs, 650, 1000, 0, 1, CO, 2.2);
    const dl = 3200 / Math.PI * Math.asin(0.5 / 6.5);
    s += arrow(A.X(800 - dl / 2), A.Y(0.06), A.X(800 + dl / 2), A.Y(0.06), AM, 1.5, "", true) + lab(A.X(800), A.Y(0.06) - 8, "Δλ₀ ≈ 78 nm", "middle", "ts", AM);
    s += xticks(x0, y0, w, h, 650, 1000, [700, 800, 900, 1000]) + yticks(x0, y0, w, h, 0, 1, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "wavelength (nm), transfer-matrix result", "middle") + ytitle(x0 - 34, y0 + h / 2, "reflectance R");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["peak R from the formula", (Rf * 100).toFixed(1) + " %"], ["R at 800 nm (transfer matrix)", (C2.tmmR(1, layers, 1, 800) * 100).toFixed(1) + " %"], ["stopband Δλ₀", dl.toFixed(0) + " nm"]]);
  };
  $("N").oninput = draw; draw();
}},

/* ---------------- 12. Air gap ---------------- */
{s: "12. The air gap", t: String.raw`The air gap: \(U \propto |1 + \sqrt{R}\,e^{i\delta}|^2\)`,
intu: String.raw`A grating sends light both up and down. The downward part crosses the air gap, reflects off the DBR and comes back up, where it adds to the light that went up directly. Whether it helps or hurts depends only on the phase \(\delta\) it collected on the way. In phase, the upward power nearly quadruples in this simple model, and out of phase it nearly vanishes. Because the light crosses the gap twice, the pattern repeats every half wavelength of gap thickness.`,
eq: String.raw`\[ U \propto \left|1 + \sqrt{R}\,e^{i\delta}\right|^{2}, \qquad \delta = 2k_{0}t_{\mathrm{gap}} + \varphi_{\mathrm{DBR}} \]\[ \text{period in } t_{\mathrm{gap}}:\ \frac{\lambda_{0}}{2} \]<div class="eqref">simple two-beam model, used in Lesson 6, card 5</div>`,
sym: [[String.raw`\(U\)`, "upward power, relative to the case without mirror"], [String.raw`\(1\)`, "amplitude of the beam that goes straight up (normalized)"], [String.raw`\(\sqrt{R}\)`, "field amplitude of the beam that went down and came back, R is the DBR reflectance"], [String.raw`\(e^{i\delta}\)`, String.raw`phase factor of the returning beam, \(i\) is the imaginary unit`], [String.raw`\(\delta\)`, "round-trip phase of the returning beam relative to the direct beam"], [String.raw`\(t_{\mathrm{gap}}\)`, "air gap thickness between membrane and mirror"], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\), the wavenumber in the air gap`], [String.raw`\(\varphi_{\mathrm{DBR}}\)`, String.raw`reflection phase of the mirror, \(\pi\) for a stack starting with the high index`], [String.raw`\(|\cdot|^{2}\)`, "squared magnitude: turns a field amplitude into a power"]],
how: [String.raw`Read it aloud: "the upward power is proportional to the squared magnitude of one plus root R times e to the i delta, where delta is two k zero times the gap plus the mirror phase".`, String.raw`The two beams are added as complex amplitudes, then squared. Expanding gives \(U \propto 1 + R + 2\sqrt{R}\cos\delta\).`, String.raw`\(2k_0 t_{\mathrm{gap}}\) is the phase for crossing the gap down and up, and \(\varphi_{\mathrm{DBR}}\) is what the mirror adds on reflection.`, String.raw`\(\delta\) grows by \(2\pi\) when \(t_{\mathrm{gap}}\) grows by \(\lambda_0/2\), so the pattern repeats every 400 nm at 800 nm. The model ignores that the gap also changes the grating strength, so grating and gap are designed together.`, "Used in Lesson 6, card 5."],
say: "The gap between the membrane and the DBR sets the phase of the light reflected back up, so it decides whether the mirror adds to or cancels the upward beam, and the condition repeats every half wavelength of gap.",
num: String.raw`\(\lambda_0 = 800\) nm: the pattern repeats every <b>400 nm</b> of gap.<br>With \(R = 0.83\) (10 pairs, card 11): best \((1 + 0.911)^2 \approx\) <b>3.65</b>, worst \((1 - 0.911)^2 \approx\) <b>0.008</b> of the value without mirror.`,
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Air gap t_gap (nm)", 0, 1200, 5, 300) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{U}}}_{\text{upward power}} \propto \Big|\underbrace{1}_{\text{direct beam}} + \underbrace{{\color{#378ADD}{\sqrt{R}}}\,e^{i{\color{#7F77DD}{\delta}}}}_{\text{beam back from the DBR}}\Big|^{2}, \qquad {\color{#7F77DD}{\delta}} = \underbrace{2k_{0}{\color{#1D9E75}{t_{\mathrm{gap}}}}}_{\text{round trip in the gap}} + \underbrace{\varphi_{\mathrm{DBR}}}_{\pi}`);
  const R = 0.83, sr = Math.sqrt(R), Uf = t => 1 + R + 2 * sr * Math.cos(4 * Math.PI * t / 800 + Math.PI);
  const ts = range(0, 1200, 241), x0 = 320, y0 = 20, w = 330, h = 170, A = ax(x0, y0, w, h, 0, 1200, 0, 4);
  const draw = () => {
    const tg = +$("g").value; $("gv").textContent = tg + " nm";
    const gh = 15 + tg * 0.08, gy = 54 + gh;
    let s = `<rect x="30" y="40" width="200" height="14" fill="${BL}" fill-opacity="0.45"/>`;
    for (let x = 60; x < 210; x += 16) s += `<rect x="${x}" y="34" width="8" height="6" fill="${BL}" fill-opacity="0.6"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="30" y="${gy + 10 * k}" width="200" height="10" fill="${BL}" fill-opacity="${k % 2 ? 0.14 : 0.42}"/>`;
    s += arrow(70, 32, 70, 6, CO, 2.5) + lab(78, 14, "up", "start", "ts", CO);
    s += arrow(140, 56, 140, gy - 2, CO, 1.5, "4 3") + arrow(175, gy - 2, 175, 6, BL, 2) + lab(183, 14, "√R back", "start", "ts", BL);
    s += arrow(244, 55, 244, gy - 1, "var(--t)", 1, "", true) + lab(250, (55 + gy) / 2 + 4, "t_gap", "start", "ts") + lab(130, gy + 76, "DBR", "middle", "ts");
    s += frame(x0, y0, w, h) + hline(x0, x0 + w, A.Y(1), "var(--t)", "3 3");
    s += plot(x0, y0, w, h, ts, ts.map(Uf), 0, 1200, 0, 4, CO, 2.2) + vline(A.X(tg), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(tg), A.Y(Uf(tg)), CO, 6);
    s += xticks(x0, y0, w, h, 0, 1200, [0, 400, 800, 1200]) + yticks(x0, y0, w, h, 0, 4, [0, 1, 2, 3, 4]);
    s += lab(x0 + w / 2, y0 + h + 32, "air gap (nm), R = 0.83, dotted: no mirror", "middle") + ytitle(x0 - 30, y0 + h / 2, "upward power U");
    box.innerHTML = svg(240, s);
    const d = ((4 * tg / 800 + 1) % 2);
    $("ro").innerHTML = ro([["δ (in units of π, mod 2)", d.toFixed(2) + "π"], ["upward power U", Uf(tg).toFixed(2) + " × no mirror"]]);
  };
  $("g").oninput = draw; draw();
}},

/* ---------------- 13. MMI modes and beat length ---------------- */
{s: "13. MMI beat length", t: String.raw`MMI lateral modes, effective width and beat length`,
intu: String.raw`A wide section carries many lateral modes. Mode \(\nu\) fits \(\nu + 1\) half waves across the width, so its lateral wavenumber is \((\nu + 1)\pi/W_e\), and what is left of the total wavenumber goes into propagation. The width that counts is a little larger than the physical one, because the fields leak past the walls. For a wide section the lateral part is small, and a binomial expansion makes the propagation constants fall off with the square of \(\nu + 1\). The difference between the two lowest modes defines the beat length \(L_\pi\), the length over which their relative phase grows by \(\pi\).`,
eq: String.raw`\[ k_{y\nu}^{2} + \beta_{\nu}^{2} = k_{0}^{2}n_{r}^{2}, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_{e}} \]\[ W_{e} \approx W_{M} + \frac{\lambda_{0}}{\pi}\left(\frac{n_{c}}{n_{r}}\right)^{2\sigma}\left(n_{r}^{2} - n_{c}^{2}\right)^{-1/2} \]\[ \beta_{\nu} \approx k_{0}n_{r} - \frac{(\nu + 1)^{2}\pi\lambda_{0}}{4n_{r}W_{e}^{2}}, \qquad L_{\pi} = \frac{\pi}{\beta_{0} - \beta_{1}} \approx \frac{4n_{r}W_{e}^{2}}{3\lambda_{0}} \]<div class="eqref">Ch. 2 Eqs. (2.7) to (2.10), Soldano and Pennings, used in Lesson 7, cards 1 to 3</div>`,
sym: [[String.raw`\(\nu\)`, "lateral mode number, 0, 1, 2, …"], [String.raw`\(k_{y\nu}\)`, String.raw`lateral wavenumber of mode \(\nu\), across the section`], [String.raw`\(\beta_{\nu}\)`, String.raw`propagation constant of mode \(\nu\), along the section`], [String.raw`\(k_{0}n_{r}\)`, "total wavenumber in the slab"], [String.raw`\(n_{r}\)`, "slab (ridge) index from the effective index method, 3.0 in the examples"], [String.raw`\(W_{e}, W_{M}\)`, "effective width seen by the modes, and the physical width"], [String.raw`\(n_{c}\)`, "cladding index beside the section"], [String.raw`\(\sigma\)`, "0 when E is parallel to the side walls, 1 when E is normal to them"], [String.raw`\(L_{\pi}\)`, "beat length of the two lowest modes"], [String.raw`\(\beta_{0} - \beta_{1}\)`, "difference of their propagation constants"]],
how: [String.raw`Read it aloud: "k y nu squared plus beta nu squared equals k zero squared n r squared, with k y nu equal to nu plus one times pi over W e. The beat length L pi is pi over beta zero minus beta one, about four n r W e squared over three lambda zero".`, "The first equation is Pythagoras for the wave vector: the part across squared plus the part along squared equals the whole squared.", String.raw`The effective width adds the penetration depth on both walls. With \(\sigma = 1\) the correction is smaller by \((n_c/n_r)^2\), so TE-like and TM-like light see slightly different widths.`, String.raw`Using \(\sqrt{1 - x} \approx 1 - x/2\) for small \(k_{y\nu}\) gives the quadratic law. Then \(\beta_0 - \beta_\nu \approx \nu(\nu + 2)\pi/(3L_\pi)\), and \(\nu(\nu + 2) = 0, 3, 8, 15, \dots\) are all integers.`, String.raw`Used in Lesson 7, cards 1 to 3. \(n_r\) comes from the effective index method (card 7 here).`],
say: String.raw`The propagation constants of an MMI depend almost quadratically on mode number, so all mode phases are multiples of \(\pi/(3L_\pi)\), with \(L_\pi = 4n_r W_e^2/(3\lambda_0)\).`,
num: String.raw`\(n_r = 3.0\), \(W_e = 2\) µm, \(\lambda_0 = 0.8\) µm: \(L_\pi = 4 \times 3 \times 4/(3 \times 0.8) =\) <b>20 µm</b>.<br>Width correction for \(n_r = 3.0\) in air: about <b>90 nm</b> for \(\sigma = 0\), about <b>10 nm</b> for \(\sigma = 1\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("W", "Effective width Wₑ (µm)", 1, 4, 0.1, 2) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{k_{y\nu}}}^{2}}_{\text{across}} + \underbrace{{\color{#378ADD}{\beta_{\nu}}}^{2}}_{\text{along}} = \underbrace{k_{0}^{2}n_{r}^{2}}_{\text{total}}, \qquad \underbrace{{\color{#7F77DD}{L_{\pi}}}}_{\text{beat length}} = \frac{\pi}{\beta_{0} - \beta_{1}} \approx \frac{4n_{r}{\color{#1D9E75}{W_{e}}}^{2}}{3\lambda_{0}}`);
  const draw = () => {
    const W = +$("W").value; $("Wv").textContent = W.toFixed(1) + " µm";
    const Lp = 4 * 3.0 * W * W / (3 * 0.8);
    let s = lab(170, 16, "lateral modes across the width", "middle", "th") + vline(80, 26, 214, "var(--p)") + vline(280, 26, 214, "var(--p)");
    const ys = range(0, 1, 80);
    for (let v = 0; v < 4; v++) {
      const yb = 50 + 48 * v;
      s += hline(80, 280, yb, "var(--t)", "2 3") + lab(20, yb + 4, "ν = " + v, "start", "ts");
      s += plot(80, yb - 18, 200, 36, ys, ys.map(y => Math.sin((v + 1) * Math.PI * y)), 0, 1, -1, 1, [CO, BL, TL, PU][v], 2.2);
      s += lab(290, yb + 4, (v + 1) + " half wave" + (v ? "s" : ""), "start", "ts");
    }
    s += arrow(82, 228, 278, 228, "var(--t)", 1, "", true) + lab(180, 244, "Wₑ = " + W.toFixed(1) + " µm", "middle", "ts");
    const x0 = 420, y0 = 26, w = 230, h = 170, A = ax(x0, y0, w, h, 0, 5, 0, 36), vs = range(0, 5, 60);
    s += frame(x0, y0, w, h) + plot(x0, y0, w, h, vs, vs.map(v => v * (v + 2)), 0, 5, 0, 36, PU, 1.5, "4 3");
    for (let v = 0; v <= 5; v++) s += dot(A.X(v), A.Y(v * (v + 2)), PU, 5) + lab(A.X(v) - 6, A.Y(v * (v + 2)) - 6, v * (v + 2), "end", "ts", PU);
    s += xticks(x0, y0, w, h, 0, 5, [0, 1, 2, 3, 4, 5]) + yticks(x0, y0, w, h, 0, 36, [0, 10, 20, 30]);
    s += lab(x0 + w / 2, y0 + h + 32, "mode number ν", "middle") + ytitle(x0 - 32, y0 + h / 2, "(β₀ − βν) · 3Lπ/π");
    box.innerHTML = svg(252, s);
    $("ro").innerHTML = ro([["beat length Lπ (nᵣ = 3.0, 0.8 µm)", Lp.toFixed(1) + " µm"], ["first mirror image 3Lπ", (3 * Lp).toFixed(0) + " µm"]]);
  };
  $("W").oninput = draw; draw();
}},

/* ---------------- 14. Self-imaging and splitting ---------------- */
{s: "14. Self-imaging", t: String.raw`Self-imaging, the two-mode splitter and MMI tolerances`,
intu: String.raw`Write the input as a sum of the section's modes. Each mode travels with its own phase, and by card 13 every phase difference is an integer times \(\pi/(3L_\pi)\). After a length \(3L_\pi\) every phase is a whole multiple of \(\pi\): even modes are back in step and odd modes are flipped, so the input reappears mirrored. After \(6L_\pi\) everything is back in step and the input reappears as it was. With only two modes the light simply crosses from one side to the other every beat length. TE-like and TM-like light have different beat lengths, so a length that is an odd number of crossings for one and an even number for the other sends them to opposite outputs. The price is length, and long sections are sensitive to width and wavelength.`,
eq: String.raw`\[ \Psi(y, L) = \sum_{\nu} c_{\nu}\psi_{\nu}(y)\exp\!\left[\frac{j\nu(\nu + 2)\pi L}{3L_{\pi}}\right], \qquad L = p\,(3L_{\pi}) \]\[ L_{\pi} = \frac{\lambda_{0}}{2(n_{0} - n_{1})}, \qquad L = p\,L_{\pi}^{\mathrm{TE}} = q\,L_{\pi}^{\mathrm{TM}} \]\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_{e}}{W_{e}} \approx \frac{\delta\lambda}{\lambda_{0}} \]<div class="eqref">Ch. 2 Eqs. (2.12) to (2.15), Soldano Eq. (40), used in Lesson 7, cards 4 to 6</div>`,
sym: [[String.raw`\(\Psi(y, L)\)`, "field across the section at distance L from the input"], [String.raw`\(c_{\nu}\)`, String.raw`how strongly mode \(\nu\) is excited by the input (an overlap integral)`], [String.raw`\(\psi_{\nu}(y)\)`, String.raw`lateral profile of mode \(\nu\)`], [String.raw`\(j\)`, "imaginary unit (engineering notation)"], [String.raw`\(\nu(\nu + 2)\)`, "the integers 0, 3, 8, 15, … from card 13"], [String.raw`\(p\)`, String.raw`integer: odd \(p\) gives a mirrored image, even \(p\) a direct image`], [String.raw`\(n_{0}, n_{1}\)`, "effective indices of the two lowest modes of the section"], [String.raw`\(L_{\pi}^{\mathrm{TE}}, L_{\pi}^{\mathrm{TM}}\)`, "beat lengths for TE-like and TM-like light"], [String.raw`\(q\)`, String.raw`integer of opposite parity to \(p\) (not the DBR \(q\) of card 11)`], [String.raw`\(\delta L, \delta W_{e}, \delta\lambda\)`, "tolerable length shift (set by the image size), width error and wavelength change"]],
how: [String.raw`Read it aloud: "the field at length L is the sum over modes of c nu psi nu times a phase factor with nu times nu plus two times pi L over three L pi. Single images appear at L equal to p times three L pi".`, String.raw`The common phase \(\beta_0 L\) is dropped, so only the differences of card 13 remain. At \(3L_\pi\) the phase is \(\nu(\nu + 2)\pi\), which is even times \(\pi\) for even \(\nu\) and odd times \(\pi\) for odd \(\nu\).`, String.raw`With two modes, \(\beta = k_0 n\) gives \(\pi/(\beta_0 - \beta_1) = \lambda_0/(2(n_0 - n_1))\). The light crosses once per \(L_\pi\).`, String.raw`A splitter needs one length that is \(p\) beat lengths for TE and \(q\) for TM, with one odd and one even, so one polarization exits at the cross port and the other at the bar port.`, String.raw`The tolerance relation: the image stays sharp over a fixed \(\delta L\), which is a smaller fraction of a longer device. Used in Lesson 7, cards 4 to 6.`],
say: String.raw`Self-imaging reproduces the input as a mirrored image at \(3L_\pi\) and a direct image at \(6L_\pi\), and a two-mode section whose length is an odd number of beat lengths for one polarization and an even number for the other separates TE and TM.`,
num: String.raw`First mirror image at <b>\(3L_\pi\)</b>, first direct image at <b>\(6L_\pi\)</b>.<br>\(L_\pi^{\mathrm{TM}}/L_\pi^{\mathrm{TE}} = 1.5\): \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\), TE to the cross port, TM to the bar port.<br>Soldano's example (\(W_e\) 8 µm, \(L\) 240 µm): \(\delta W_e \approx\) <b>0.25 µm</b>, \(\delta\lambda \approx\) <b>95 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Section length L / Lπ(TE)", 0, 6, 0.05, 3) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\Psi(y, L)}}}_{\text{field at length } L} = \sum_{\nu}\underbrace{c_{\nu}\psi_{\nu}(y)}_{\text{mode content}}\,\underbrace{\exp\!\left[\frac{j{\color{#7F77DD}{\nu(\nu + 2)}}\pi L}{3{\color{#378ADD}{L_{\pi}}}}\right]}_{\text{integer phase steps}} \qquad \underbrace{L = p\,(3L_{\pi})}_{\text{images}}`);
  box.innerHTML = `<p class="note" style="margin:4px 0">General interference, input on the upper side, 0 to 6Lπ:</p><canvas width="340" height="64" style="width:100%;height:auto;display:block;border:1px solid var(--b);border-radius:4px;background:#fff"></canvas><div class="f2"></div>`;
  const cv = box.querySelector("canvas"), ctx = cv.getContext("2d"), W = 340, H = 64, M = 12, img = ctx.createImageData(W, H);
  const ys = range(0.5, -0.5, H), inp = ys.map(y => Math.exp(-Math.pow((y - 0.25) / 0.07, 2))), modes = [], cs = [];
  for (let v = 0; v < M; v++) { const p = ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))); let a = 0, b = 0; p.forEach((q, i) => { a += inp[i] * q; b += q * q; }); modes.push(p); cs.push(a / b); }
  const I = new Float32Array(W * H); let mx = 0;
  for (let i = 0; i < W; i++) { const L = i / (W - 1) * 6; for (let j = 0; j < H; j++) { let re = 0, im = 0; for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * L / 3, a = cs[v] * modes[v][j]; re += a * Math.cos(ph); im += a * Math.sin(ph); } const val = re * re + im * im; I[j * W + i] = val; if (val > mx) mx = val; } }
  for (let k = 0; k < W * H; k++) { const [r, g, b] = C2.heat(Math.sqrt(I[k] / mx)); img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0);
  const f2 = box.querySelector(".f2"), x0 = 70, y0 = 46, w = 570, h = 120, A = ax(x0, y0, w, h, 0, 6, 0, 1), xs = range(0, 6, 241);
  const draw = () => {
    const L = +$("L").value; $("Lv").textContent = L.toFixed(2);
    let s = "";
    for (let p = 0; p <= 6; p++) s += lab(p === 0 ? 4 : p === 6 ? 676 : p / 6 * 680, 14, p === 0 ? "0" : p + "Lπ", p === 0 ? "start" : p === 6 ? "end" : "middle", "ts", p === 3 || p === 6 ? CO : "");
    s += lab(340, 30, "3Lπ: mirrored image", "middle", "ts", CO) + lab(676, 30, "6Lπ: direct image", "end", "ts", CO);
    s += frame(x0, y0, w, h);
    s += plot(x0, y0, w, h, xs, xs.map(x => Math.pow(Math.cos(Math.PI * x / 2), 2)), 0, 6, 0, 1, BL, 2.2) + plot(x0, y0, w, h, xs, xs.map(x => Math.pow(Math.cos(Math.PI * x / 3), 2)), 0, 6, 0, 1, CO, 2.2, "6 3");
    s += vline(A.X(L), y0, y0 + h, "var(--t)", "2 3");
    s += xticks(x0, y0, w, h, 0, 6, [0, 1, 2, 3, 4, 5, 6]) + yticks(x0, y0, w, h, 0, 1, [0, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "two-mode section: length in units of Lπ of TE. Blue TE, dashed coral TM (Lπ 1.5 times longer)", "middle") + ytitle(36, y0 + h / 2, "power on input side");
    f2.innerHTML = svg(206, s);
    const fe = Math.pow(Math.cos(Math.PI * L / 2), 2), fm = Math.pow(Math.cos(Math.PI * L / 3), 2), port = f => f > 0.5 ? "bar" : "cross";
    $("ro").innerHTML = ro([["TE-like exits", `${port(fe)} (${(Math.max(fe, 1 - fe) * 100).toFixed(0)} %)`], ["TM-like exits", `${port(fm)} (${(Math.max(fm, 1 - fm) * 100).toFixed(0)} %)`]]);
  };
  $("L").oninput = draw; draw();
}},

/* ---------------- 15. Maxwell ---------------- */
{s: "15. Maxwell's curl equations", t: String.raw`Maxwell's curl equations: what FDTD solves`,
intu: String.raw`These two equations hold all of classical optics in a material with no free charges or currents and no magnetism. The first says that a magnetic field circulating around a point makes the electric field there change in time. The second says that a circulating electric field makes the magnetic field change, in the opposite sense. Each field drives the other, and the pair together is a wave that travels at \(c/\sqrt{\varepsilon_r} = c/n\). The material enters only through \(\varepsilon_r\), which is why an FDTD solver needs nothing but the permittivity on a grid. In 1D, for a wave along \(x\), each curl reduces to a single derivative.`,
eq: String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_{0}\varepsilon_{r}}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_{0}}\nabla \times \mathbf{E} \]\[ \text{1D: } \frac{\partial E_{z}}{\partial t} = \frac{1}{\varepsilon}\frac{\partial H_{y}}{\partial x}, \qquad \frac{\partial H_{y}}{\partial t} = \frac{1}{\mu_{0}}\frac{\partial E_{z}}{\partial x} \]<div class="eqref">Ch. 2 Eq. (2.16), Oskooi et al., used in Lesson 8, card 1</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "electric field (V/m) and magnetic field (A/m)"], [String.raw`\(\partial/\partial t\)`, "rate of change in time at a fixed point"], [String.raw`\(\nabla \times\)`, "curl: how much a field circulates around a point, per unit area"], [String.raw`\(\varepsilon_{0}\)`, String.raw`vacuum permittivity, \(8.854 \times 10^{-12}\) F/m`], [String.raw`\(\varepsilon_{r}\)`, String.raw`relative permittivity of the material, \(n^2\), 12.25 for GaAs`], [String.raw`\(\mu_{0}\)`, String.raw`vacuum permeability, \(4\pi \times 10^{-7}\) H/m`], [String.raw`\(\varepsilon\)`, String.raw`shorthand for \(\varepsilon_0\varepsilon_r\) in the 1D form`], [String.raw`\(E_{z}, H_{y}\)`, "the two field components of a wave travelling along x"], [String.raw`\(\partial/\partial x\)`, "rate of change along x"], [String.raw`\(-\)`, "the minus sign: E and H drive each other in opposite senses"]],
how: [String.raw`Read it aloud: "the rate of change of E equals one over epsilon zero epsilon r times the curl of H. The rate of change of H equals minus one over mu zero times the curl of E".`, "The first is Ampère's law with the displacement current and no free current. The second is Faraday's law of induction.", String.raw`The material appears only in \(\varepsilon_r\). A larger \(\varepsilon_r\) makes \(\mathbf{E}\) respond more slowly, so the wave is slower, \(c/n\).`, String.raw`For a wave along \(x\) with \(\mathbf{E} = E_z\hat{\mathbf{z}}\) and \(\mathbf{H} = H_y\hat{\mathbf{y}}\), the curls become \(\partial H_y/\partial x\) and \(-\partial E_z/\partial x\). The two divergence equations are not stepped, the Yee scheme keeps them satisfied.`, "Used in Lesson 8, card 1, and the starting point of cards 16 to 19 here."],
say: "FDTD solves the two Maxwell curl equations directly in the time domain, and the material enters only through the permittivity on the grid.",
num: String.raw`Speed in a material \(c/n\): for \(n = 3.5\) the wave travels at <b>\(0.29c\)</b>.<br>Field ratio \(|\mathbf{E}|/|\mathbf{H}| = \eta_0/n\) with \(\eta_0 =\) <b>377 Ω</b>, so about 108 Ω in GaAs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Refractive index n", 1, 3.5, 0.1, 1) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\frac{\partial {\color{#D85A30}{\mathbf{E}}}}{\partial t}}_{\text{E changes}} = \underbrace{\frac{1}{\varepsilon_{0}{\color{#1D9E75}{\varepsilon_{r}}}}}_{\text{material}}\underbrace{\nabla \times {\color{#378ADD}{\mathbf{H}}}}_{\text{H circulates}}, \qquad \underbrace{\frac{\partial {\color{#378ADD}{\mathbf{H}}}}{\partial t}}_{\text{H changes}} = \underbrace{-\frac{1}{\mu_{0}}}_{\text{opposite sense}}\underbrace{\nabla \times {\color{#D85A30}{\mathbf{E}}}}_{\text{E circulates}}`);
  let st = `<ellipse cx="90" cy="120" rx="55" ry="22" fill="none" stroke="${BL}" stroke-width="2.5"/>`;
  st += `<path d="M60 101 Q90 94 120 101" fill="none" stroke="${BL}" stroke-width="2" marker-end="url(#ar)"/><path d="M120 139 Q90 146 60 139" fill="none" stroke="${BL}" stroke-width="2" marker-end="url(#ar)"/>`;
  st += arrow(90, 160, 90, 62, CO, 3) + lab(98, 64, "∂E/∂t", "start", "t", CO) + lab(150, 128, "H", "start", "t", BL) + lab(90, 196, "H circulating around", "middle", "ts") + lab(90, 212, "a point changes E there", "middle", "ts");
  st += hline(200, 660, 120, "var(--t)") + lab(664, 124, "x", "start");
  st += `<g id="wv"></g>`;
  box.innerHTML = svg(232, st);
  const g = box.querySelector("#wv");
  let n = 1, tt = 0;
  const wave = () => {
    const xs = range(200, 650, 226), k = 2 * Math.PI * n / 220, om = 2 * Math.PI * 0.6;
    let e = "", h = "";
    xs.forEach((x, i) => { const v = Math.sin(k * (x - 200) - om * tt); e += (i ? "L" : "M") + x.toFixed(1) + " " + (120 - 55 * v).toFixed(1); h += (i ? "L" : "M") + (x + 26 * v).toFixed(1) + " " + (120 + 18 * v).toFixed(1); });
    g.innerHTML = `<path d="${h}" fill="none" stroke="${BL}" stroke-width="2"/><path d="${e}" fill="none" stroke="${CO}" stroke-width="2.5"/>` + lab(208, 56, "Ez", "start", "t", CO) + lab(208, 160, "Hy (drawn in perspective)", "start", "ts", BL) + arrow(560, 30, 620, 30, "var(--t)", 1.5) + lab(556, 34, "speed c/" + n.toFixed(1), "end", "ts");
  };
  const upd = () => { n = +$("n").value; $("nv").textContent = n.toFixed(1); wave(); $("ro").innerHTML = ro([["speed c/n", (1 / n).toFixed(2) + " c"], ["wavelength λ₀/n at 800 nm", (800 / n).toFixed(0) + " nm"], ["|E|/|H| = 377 Ω / n", (376.73 / n).toFixed(0) + " Ω"]]); };
  $("n").oninput = upd; upd();
  anim(t => { tt = t; wave(); });
}},

/* ---------------- 16. Centered differences and leapfrog ---------------- */
{s: "16. Leapfrog update", t: String.raw`Centered differences and the leapfrog update`,
intu: String.raw`A computer stores the fields only at grid points, so derivatives become differences. Taking the difference of two values half a step on either side of a point is far more accurate than a one-sided difference, because the errors of the two sides cancel and only a term in \(\Delta x^2\) is left. Yee placed \(\mathbf{E}\) and \(\mathbf{H}\) so that every derivative needed is exactly such a centered difference: \(H\) sits half a cell and half a time step away from \(E\). Each new \(H\) is the old \(H\) plus the difference of the two \(E\) values beside it, and each new \(E\) is the old \(E\) plus the difference of the two \(H\) values beside it. They jump over each other like a leapfrog.`,
eq: String.raw`\[ f'(x) \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error} \approx \frac{\Delta x^{2}}{24}f''' \]\[ H\big|_{i+1/2}^{n+1/2} = H\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_{0}\Delta x}\left(E\big|_{i+1}^{n} - E\big|_{i}^{n}\right) \]\[ E\big|_{i}^{n+1} = E\big|_{i}^{n} + \frac{\Delta t}{\varepsilon\Delta x}\left(H\big|_{i+1/2}^{n+1/2} - H\big|_{i-1/2}^{n+1/2}\right) \]<div class="eqref">Used in Lesson 8, cards 2 to 4</div>`,
sym: [[String.raw`\(f', f'''\)`, "first and third derivatives of a function f"], [String.raw`\(\Delta x\)`, "grid spacing (cell size)"], [String.raw`\(\Delta t\)`, "time step"], [String.raw`\(i,\ i \pm 1/2\)`, "subscripts: positions along x. E lives at whole i, H at half-integer positions"], [String.raw`\(n,\ n \pm 1/2\)`, "superscripts: time levels, not powers. E lives at whole n, H at half steps"], [String.raw`\(E\big|_{i}^{n}\)`,"electric field at position i and time n"], [String.raw`\(H\big|_{i+1/2}^{n+1/2}\)`, "magnetic field half a cell to the right, half a step later"], [String.raw`\(\mu_{0}, \varepsilon\)`, String.raw`vacuum permeability and the permittivity \(\varepsilon_0\varepsilon_r\) at that cell`], [String.raw`\(\Delta t/(\mu_{0}\Delta x)\)`, String.raw`update factor. In normalized units (\(c = \Delta x = 1\)) it becomes the Courant number \(S\)`]],
how: [String.raw`Read it aloud: "H at i plus a half and time n plus a half equals its value one step earlier plus delta t over mu zero delta x times E at i plus one minus E at i. Then E at time n plus one equals its old value plus delta t over epsilon delta x times the difference of the two new H values beside it".`, String.raw`Expand \(f(x \pm \Delta x/2)\) in a Taylor series. The even terms cancel in the difference, leaving \(f'\) plus \(\Delta x^2 f'''/24\). Halving \(\Delta x\) divides the error by four.`, String.raw`Each update is the 1D Maxwell equation of card 15 with \(\partial/\partial t\) and \(\partial/\partial x\) replaced by centered differences around the value being updated.`, String.raw`Every new value needs only its own old value and its two nearest neighbours, so one step costs a few operations per cell. That is why FDTD scales to large 3D problems.`, "Used in Lesson 8, cards 2 to 4. The 3D version is the Yee cell of card 18."],
say: String.raw`In FDTD, \(\mathbf{E}\) and \(\mathbf{H}\) are staggered by half a cell in space and half a step in time and updated alternately in a leapfrog, so all derivatives are centered and second-order accurate.`,
num: String.raw`For \(\sin(kx)\) the centered relative error is \((k\Delta x)^2/24\).<br>20 points per wavelength: \((2\pi/20)^2/24 \approx\) <b>0.41 %</b>.`,
r(fig, ctl) {
  ctl.innerHTML = btns([["H", "H update"], ["E", "E update"]], "u");
  const box = fbox(fig, String.raw`\underbrace{{\color{#378ADD}{H\big|_{i+1/2}^{n+1/2}}}}_{\text{new H}} = \underbrace{H\big|_{i+1/2}^{n-1/2}}_{\text{old H}} + \underbrace{\frac{{\color{#1D9E75}{\Delta t}}}{\mu_{0}\Delta x}}_{\text{step factor}}\underbrace{\left({\color{#D85A30}{E\big|_{i+1}^{n} - E\big|_{i}^{n}}}\right)}_{\text{centered difference of E}}`);
  let cur = "H";
  const X = k => 140 + 74 * k, Y = r => 200 - 50 * r;   // k: half-cells from i−1, r: half-steps from n−1/2
  const xl = ["i−1", "i−½", "i", "i+½", "i+1", "i+3/2"], yl = ["n−½", "n", "n+½", "n+1"];
  const draw = () => {
    pick(ctl, "u", cur);
    let s = "";
    for (let k = 0; k < 6; k++) s += vline(X(k), 40, 210, "var(--b)") + lab(X(k), 230, xl[k], "middle");
    for (let r = 0; r < 4; r++) s += hline(125, 525, Y(r), "var(--b)") + lab(116, Y(r) + 4, yl[r], "end");
    s += lab(325, 248, "space x", "middle") + ytitle(70, 125, "time t");
    for (let k = 0; k < 6; k++) for (let r = 0; r < 4; r++) {
      if (k % 2 === 0 && r % 2 === 1) s += `<circle cx="${X(k)}" cy="${Y(r)}" r="7" fill="${CO}" fill-opacity="0.35" stroke="${CO}"/>`;
      if (k % 2 === 1 && r % 2 === 0) s += `<rect x="${X(k) - 7}" y="${Y(r) - 7}" width="14" height="14" fill="${BL}" fill-opacity="0.35" stroke="${BL}"/>`;
    }
    const tgt = cur === "H" ? [3, 2] : [2, 3], src = cur === "H" ? [[3, 0], [2, 1], [4, 1]] : [[2, 1], [1, 2], [3, 2]];
    for (const [k, r] of src) s += arrow(X(k), Y(r), X(tgt[0]) + (X(k) - X(tgt[0])) * 0.18, Y(tgt[1]) + (Y(r) - Y(tgt[1])) * 0.18, TL, 2.2);
    s += `<circle cx="${X(tgt[0])}" cy="${Y(tgt[1])}" r="13" fill="none" stroke="${TL}" stroke-width="2.5"/>`;
    s += lab(560, 60, "E", "start", "t", CO) + `<circle cx="550" cy="56" r="6" fill="${CO}" fill-opacity="0.35" stroke="${CO}"/>` + lab(560, 84, "H", "start", "t", BL) + `<rect x="544" y="74" width="12" height="12" fill="${BL}" fill-opacity="0.35" stroke="${BL}"/>`;
    s += lab(544, 114, cur === "H" ? "new H from old H" : "new E from old E", "start", "ts") + lab(544, 130, cur === "H" ? "and the two E beside it" : "and the two new H beside it", "start", "ts");
    s += lab(325, 22, cur === "H" ? "H update: H jumps over E" : "E update: E jumps over H", "middle", "th");
    box.innerHTML = svg(256, s);
  };
  ctl.querySelectorAll("button[data-u]").forEach(b => b.onclick = () => { cur = b.dataset.u; draw(); });
  draw();
}},

/* ---------------- 17. Courant limit ---------------- */
{s: "17. Courant limit", t: String.raw`The Courant limit and the growth factor`,
intu: String.raw`In one time step, information can only travel from a cell to its neighbours. If the time step is so long that a real wave would cross more than one cell, the scheme cannot keep up, and the shortest waves on the grid start to grow by a factor larger than one every step. Round-off noise then explodes within tens of steps. The limit is the Courant condition: \(c\Delta t\) may not exceed the cell size in 1D, and in 3D it is smaller, because a wave can also travel diagonally across a cell. Below the limit every Fourier component keeps its amplitude, \(|g| = 1\).`,
eq: String.raw`\[ S = \frac{c\,\Delta t}{\Delta x} \le 1 \ \ \text{(1D)}, \qquad c\,\Delta t \le \left(\frac{1}{\Delta x^{2}} + \frac{1}{\Delta y^{2}} + \frac{1}{\Delta z^{2}}\right)^{-1/2} \ \ \text{(3D)} \]\[ |g| = 2a^{2} - 1 + 2a\sqrt{a^{2} - 1}, \qquad a = S\sin\frac{k\Delta x}{2} \gt 1 \]<div class="eqref">Dohlus and Zagorodnov Eq. (8), used in Lesson 8, card 5 and Lesson 10, cards 1 and 2</div>`,
sym: [[String.raw`\(S\)`, "Courant number: the fraction of a cell a light wave crosses in one step"], [String.raw`\(c\)`, "speed of light"], [String.raw`\(\Delta t\)`, "time step"], [String.raw`\(\Delta x, \Delta y, \Delta z\)`, "cell sizes along the three axes"], [String.raw`\((\dots)^{-1/2}\)`, "one over the square root of the bracket"], [String.raw`\(g\)`, "amplification factor of one Fourier component per time step"], [String.raw`\(a\)`, String.raw`stability parameter. \(|a| \le 1\) is stable`], [String.raw`\(k\)`, "wavenumber of that Fourier component on the grid"], [String.raw`\(k\Delta x\)`, String.raw`phase per cell. \(\pi\) is the shortest wave the grid can hold`]],
how: [String.raw`Read it aloud: "the Courant number, c delta t over delta x, must be at most one in 1D. In 3D, c delta t must be at most one over the square root of the sum of the inverse squared cell sizes. Above the limit a grid wave grows each step by g equal to two a squared minus one plus two a root a squared minus one".`, String.raw`Putting a wave \(g^n e^{ikx}\) into the two updates of card 16 gives \(g^2 - 2(1 - 2a^2)g + 1 = 0\). For \(|a| \le 1\) both roots have \(|g| = 1\).`, String.raw`For \(a \gt 1\) the roots are real and one of them has \(|g| \gt 1\). The worst case is the shortest grid wave, \(k\Delta x = \pi\), where \(a = S\).`, String.raw`On a cubic grid the limit is \(c\Delta t \le \Delta x/\sqrt{3}\) in 3D and \(\Delta x/\sqrt{2}\) in 2D. Solvers run at a fraction of it, for example 0.99.`, "Used in Lesson 8, card 5 and Lesson 10, cards 1 and 2."],
say: String.raw`The FDTD time step must satisfy the Courant condition, \(c\Delta t \le \Delta x/\sqrt{3}\) on a cubic 3D grid. Above it the shortest grid waves are amplified every step and the simulation blows up.`,
num: String.raw`\(S = 1.05\): worst \(|g| \approx\) <b>1.88</b> per step, after 50 steps about <b>\(5 \times 10^{13}\)</b>.<br>Cubic cell 11.4 nm in 3D: \(c\Delta t \le 6.6\) nm, so \(\Delta t \le\) <b>0.022 fs</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.1, 1.4, 0.01, 1.05) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{S}}}_{\text{Courant number}} = \frac{c\,{\color{#378ADD}{\Delta t}}}{{\color{#1D9E75}{\Delta x}}} \le 1, \qquad \underbrace{{\color{#7F77DD}{|g|}}}_{\text{growth per step}} = 2a^{2} - 1 + 2a\sqrt{a^{2} - 1} \quad (a \gt 1)`);
  const gf = S => S <= 1 ? 1 : 2 * S * S - 1 + 2 * S * Math.sqrt(S * S - 1), Ss = range(0, 1.4, 281);
  const x0 = 80, y0 = 30, w = 540, h = 160, A = ax(x0, y0, w, h, 0, 1.4, 0, 6);
  const draw = () => {
    const S = +$("S").value; $("Sv").textContent = S.toFixed(2);
    let s = `<rect x="${A.X(1)}" y="${y0}" width="${A.X(1.4) - A.X(1)}" height="${h}" fill="${CO}" fill-opacity="0.1"/>` + frame(x0, y0, w, h);
    for (const [v, t] of [[1 / Math.sqrt(3), "3D"], [1 / Math.sqrt(2), "2D"], [1, "1D"]]) s += vline(A.X(v), y0, y0 + h, PU, "4 3") + lab(A.X(v), y0 - 6, t + " limit", "middle", "ts", PU);
    s += lab(A.X(1.2), A.Y(5.4), "unstable in 1D", "middle", "ts", CO);
    s += plot(x0, y0, w, h, Ss, Ss.map(gf), 0, 1.4, 0, 6, CO, 2.5) + dot(A.X(S), A.Y(Math.min(gf(S), 6)), CO, 6);
    s += xticks(x0, y0, w, h, 0, 1.4, [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4]) + yticks(x0, y0, w, h, 0, 6, [0, 1, 2, 3, 4, 5, 6]);
    s += lab(x0 + w / 2, y0 + h + 32, "Courant number S = cΔt/Δx (shortest grid wave, kΔx = π)", "middle") + ytitle(32, y0 + h / 2, "growth per step |g|");
    box.innerHTML = svg(232, s);
    const g = gf(S), g50 = Math.pow(g, 50);
    $("ro").innerHTML = ro([["|g| per step", g.toFixed(3)], ["after 50 steps", g50 < 1000 ? g50.toFixed(2) : g50.toExponential(1)], ["stable in", S <= 1 / Math.sqrt(3) ? "1D, 2D and 3D" : S <= 1 / Math.sqrt(2) ? "1D and 2D" : S <= 1 ? "1D only" : "none"]]);
  };
  $("S").oninput = draw; draw();
}},

/* ---------------- 18. Yee cell ---------------- */
{s: "18. Yee cell", t: String.raw`The Yee cell: where the six field components live`,
intu: String.raw`In 3D the same staggering puts each \(\mathbf{E}\) component at the middle of a cell edge, pointing along that edge, and each \(\mathbf{H}\) component at the middle of a face, pointing out of that face. Then every \(H\) is ringed by four \(E\) values and every \(E\) by four \(H\) values. A curl is a circulation around a loop, so this ring is exactly what an update needs: \(H_z\) changes with the circulation of the four \(E\) values around its face. In 2D the six components split into two sets that never talk to each other. Where a material boundary cuts through a cell, the cell gets an averaged permittivity.`,
eq: String.raw`\[ E_{x}(i+\tfrac{1}{2}, j, k), \quad E_{y}(i, j+\tfrac{1}{2}, k), \quad E_{z}(i, j, k+\tfrac{1}{2}) \]\[ H_{x}(i, j+\tfrac{1}{2}, k+\tfrac{1}{2}), \quad H_{y}(i+\tfrac{1}{2}, j, k+\tfrac{1}{2}), \quad H_{z}(i+\tfrac{1}{2}, j+\tfrac{1}{2}, k) \]\[ \frac{\partial H_{z}}{\partial t} = -\frac{1}{\mu_{0}}\left(\frac{\partial E_{y}}{\partial x} - \frac{\partial E_{x}}{\partial y}\right) \]\[ \mathrm{TM}_{z}:\ E_{z}, H_{x}, H_{y} \qquad \mathrm{TE}_{z}:\ H_{z}, E_{x}, E_{y} \qquad \varepsilon_{\mathrm{cell}} = f\varepsilon_{1} + (1 - f)\varepsilon_{2} \]<div class="eqref">K. S. Yee (1966), used in Lesson 9, cards 1 to 3 and 5</div>`,
sym: [[String.raw`\((i, j, k)\)`, "integer grid indices, one per cell corner"], [String.raw`\(+\tfrac{1}{2}\)`, "shifted by half a cell along that axis"], [String.raw`\(E_{x}, E_{y}, E_{z}\)`, "electric components, at edge centres, along their edge"], [String.raw`\(H_{x}, H_{y}, H_{z}\)`, "magnetic components, at face centres, normal to their face"], [String.raw`\(\partial E_{y}/\partial x - \partial E_{x}/\partial y\)`, String.raw`the \(z\) part of \(\nabla \times \mathbf{E}\): the circulation of \(\mathbf{E}\) around a face per unit area`], [String.raw`\(\mathrm{TM}_{z}, \mathrm{TE}_{z}\)`, "the two independent 2D sets, named after the simulation axis z"], [String.raw`\(f\)`, "fraction of the cell filled by material 1"], [String.raw`\(\varepsilon_{1}, \varepsilon_{2}\)`, "permittivities of the two materials sharing the cell"], [String.raw`\(\varepsilon_{\mathrm{cell}}\)`, "permittivity given to that cell (simplest subpixel average)"]],
how: [String.raw`Read it aloud: "E x sits at i plus a half, j, k, the middle of an x edge, and likewise for E y and E z. H x sits at i, j plus a half, k plus a half, the middle of an x face. The rate of change of H z is minus one over mu zero times d E y d x minus d E x d y".`, String.raw`The half index tells along which axes a component is shifted. \(\mathbf{E}\) is shifted along its own axis, \(\mathbf{H}\) along the two other axes.`, String.raw`The bracket is the circulation of \(\mathbf{E}\) around the face divided by its area: \(E_y\) on the right edge minus the left edge, minus \(E_x\) on the back edge minus the front edge. This is Faraday's law on one face.`, String.raw`In 2D nothing changes along \(z\), and the equations separate into \(\mathrm{TM}_z\) and \(\mathrm{TE}_z\). These names refer to the simulation axis, not to the TE and TM names of waveguide modes.`, "The average fixes cells cut by a boundary, which reduces staircasing at curved edges. Used in Lesson 9, cards 1 to 3 and 5."],
say: "In the Yee cell the electric components sit at the centres of the cell edges and the magnetic components at the centres of the faces, so each component is ringed by a loop of the other field, exactly as the curl equations require.",
num: String.raw`One cell has <b>12</b> edge positions and <b>6</b> face positions, but all are shared, so a large grid stores 3 \(\mathbf{E}\) and 3 \(\mathbf{H}\) values per cell (3 in total in 2D).<br>A cell half GaAs (12.25), half air (1): \(\varepsilon_{\mathrm{cell}} = 0.5 \times 12.25 + 0.5 \times 1 \approx\) <b>6.6</b>.`,
r(fig, ctl) {
  const box = fbox(fig, String.raw`\underbrace{\frac{\partial {\color{#378ADD}{H_{z}}}}{\partial t}}_{\text{H on a face}} = -\frac{1}{\mu_{0}}\underbrace{\left(\frac{\partial {\color{#D85A30}{E_{y}}}}{\partial x} - \frac{\partial {\color{#D85A30}{E_{x}}}}{\partial y}\right)}_{\text{circulation of E around that face}}`);
  const P = (a, b, c) => [60 + 150 * a + 80 * b, 210 - 50 * b - 130 * c], pt = p => p.map(v => v.toFixed(1)).join(" ");
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  let s = "";
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const a = corners[i], b = corners[j], diff = a.reduce((t, v, q) => t + Math.abs(v - b[q]), 0);
    if (diff !== 1) continue;
    const hidden = (a[0] === 0 && a[1] === 1 && a[2] === 0) || (b[0] === 0 && b[1] === 1 && b[2] === 0);
    const [x1, y1] = P(...a), [x2, y2] = P(...b);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--t)" ${hidden ? 'stroke-dasharray="4 3"' : ""}/>`;
  }
  const ar = (p, q, col) => { const [x1, y1] = P(...p), [x2, y2] = P(...q); return arrow(x1, y1, x2, y2, col, 2.5); };
  s += ar([0.3, 0, 0], [0.7, 0, 0], CO) + lab(...P(0.5, 0, 0).map((v, i) => v + (i ? 18 : 0)), "Ex", "middle", "t", CO);
  s += ar([1, 0.25, 0], [1, 0.75, 0], CO) + lab(P(1, 0.5, 0)[0] + 12, P(1, 0.5, 0)[1] + 14, "Ey", "start", "t", CO);
  s += ar([0, 0, 0.3], [0, 0, 0.7], CO) + lab(P(0, 0, 0.5)[0] - 8, P(0, 0, 0.5)[1] + 4, "Ez", "end", "t", CO);
  s += ar([1, 0.5, 0.5], [1.32, 0.5, 0.5], BL) + lab(P(1.32, 0.5, 0.5)[0] + 6, P(1.32, 0.5, 0.5)[1] + 4, "Hx", "start", "t", BL);
  s += ar([0.5, 0, 0.5], [0.5, -0.5, 0.5], BL) + lab(P(0.5, -0.5, 0.5)[0] - 6, P(0.5, -0.5, 0.5)[1] + 4, "Hy", "end", "t", BL);
  s += ar([0.5, 0.5, 1], [0.5, 0.5, 1.28], BL) + lab(P(0.5, 0.5, 1.28)[0] + 8, P(0.5, 0.5, 1.28)[1] + 8, "Hz", "start", "t", BL);
  s += lab(160, 248, "E on edge centres, H on face centres", "middle", "ts");
  // right: one face seen from above
  const L = 440, R = 600, T = 50, B = 200;
  s += lab(520, 26, "one face seen from +z", "middle", "th") + `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="${BL}" fill-opacity="0.08" stroke="var(--t)"/>`;
  s += arrow(L + 45, B, R - 45, B, CO, 2.5) + lab(520, B + 18, "Ex(j)", "middle", "ts", CO);
  s += arrow(R, B - 45, R, T + 45, CO, 2.5) + lab(R + 8, 129, "Ey(i+1)", "start", "ts", CO);
  s += arrow(R - 45, T, L + 45, T, CO, 2.5, "5 3") + lab(520, T - 8, "−Ex(j+1)", "middle", "ts", CO);
  s += arrow(L, T + 45, L, B - 45, CO, 2.5, "5 3") + lab(L - 8, 129, "−Ey(i)", "end", "ts", CO);
  s += `<circle cx="520" cy="125" r="11" fill="none" stroke="${BL}" stroke-width="2"/><circle cx="520" cy="125" r="3" fill="${BL}"/>` + lab(536, 130, "Hz", "start", "t", BL);
  s += lab(520, 236, "Hz changes by −(circulation of E)/μ₀", "middle", "ts");
  box.innerHTML = svg(256, s);
}},

/* ---------------- 19. Numerical dispersion and resolution ---------------- */
{s: "19. Dispersion and resolution", t: String.raw`Numerical dispersion, the \((k\Delta x)^2/24\) bound and the cost of resolution`,
intu: String.raw`On a grid a wave does not travel at exactly the right speed. The centered differences of card 16 see a sine wave slightly flattened, so the grid's relation between frequency and wavenumber is the exact one with \(k\Delta x/2\) and \(\omega\Delta t/2\) replaced by their sines. As a result, waves on the grid are a little too slow, by at most \((k\Delta x)^2/24\) along an axis. This small error builds up linearly with distance, so long interference devices need finer grids. Finer grids are expensive: halving the cell size gives eight times the cells and twice the time steps.`,
eq: String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]\[ \frac{\delta n}{n} \le \frac{(k\Delta x)^{2}}{24}, \qquad \Delta\varphi \approx 2\pi\,\frac{L}{\lambda_{m}}\,\frac{\delta n}{n} \]\[ \Delta x = \frac{\lambda_{0}}{N_{\lambda}n_{\mathrm{max}}}, \qquad \text{cost} \propto N_{\lambda}^{4} \]<div class="eqref">Ch. 2 Eq. (2.17), Dohlus and Zagorodnov Eqs. (10) and (11), used in Lesson 9, card 6 and Lesson 10, cards 3 to 5</div>`,
sym: [[String.raw`\(k\)`, String.raw`wavenumber in the material, \(2\pi n/\lambda_0\) (on the grid it comes out slightly larger)`], [String.raw`\(\omega\)`, "angular frequency of the wave"], [String.raw`\(\Delta x, \Delta t\)`, "cell size and time step"], [String.raw`\(\sin(k\Delta x/2)/(\Delta x/2)\)`, String.raw`what the grid sees instead of \(k\). Close to \(k\) when \(k\Delta x\) is small`], [String.raw`\(\delta n/n\)`, "relative error of the phase velocity, and so of any effective index"], [String.raw`\(k\Delta x\)`, String.raw`phase per cell, \(2\pi/N_\lambda\)`], [String.raw`\(\Delta\varphi\)`, "accumulated phase error after a length L, in radians"], [String.raw`\(L\)`, "propagation length"], [String.raw`\(\lambda_{m}\)`, String.raw`wavelength in the material, \(\lambda_0/n\), 229 nm for GaAs at 800 nm`], [String.raw`\(N_{\lambda}\)`, "grid steps per wavelength in the highest-index material"], [String.raw`\(n_{\mathrm{max}}\)`, "largest refractive index in the domain"]],
how: [String.raw`Read it aloud: "sine of k delta x over two, over delta x over two, equals sine of omega delta t over two, over c delta t over two. The relative index error is at most k delta x squared over twenty four. The accumulated phase error is two pi L over lambda m times that error".`, String.raw`For small arguments \(\sin u \approx u\), and the relation becomes \(k = \omega/c\), the exact one. The next term of the sine series gives \(\delta n/n \approx ((k\Delta x)^2/24)(1 - S^2)\), which is largest for small \(S\).`, String.raw`\(L/\lambda_m\) counts the wavelengths travelled, so the phase error grows linearly with device length.`, String.raw`\(\Delta x\) is set by the highest index, where the wavelength is shortest. The number of cells grows as \(N_\lambda^3\) and the number of steps as \(N_\lambda\) through the Courant limit, so the cost grows as \(N_\lambda^4\).`, "Used in Lesson 9, card 6 and Lesson 10, cards 3 to 5. It is why every result should state its resolution (card 23 here)."],
say: String.raw`Along a grid axis the relative phase error of the Yee scheme is at most \((k\Delta x)^2/24\), about 0.4 % at 20 steps per wavelength, and it accumulates linearly with propagation length.`,
num: String.raw`20 steps: \((2\pi/20)^2/24 =\) <b>0.41 %</b>. 30 steps: <b>0.18 %</b>.<br>\(\lambda_0 = 800\) nm, \(n = 3.5\), 20 steps: \(\Delta x =\) <b>11.4 nm</b>.<br>\(L = 20\) µm: \(\Delta\varphi \approx 2\pi \times 87.5 \times 0.0041 \approx\) <b>2.3 rad</b> (bound). \((30/20)^4 \approx\) <b>5.1</b> times the work.`,
r(fig, ctl) {
  ctl.innerHTML = sl("S", "Courant number S", 0.1, 1, 0.05, 0.5) + sl("N", "Steps per wavelength Nλ", 8, 40, 1, 20) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\frac{\sin({\color{#D85A30}{k}}\Delta x/2)}{\Delta x/2}}_{\text{what the grid sees}} = \underbrace{\frac{\sin({\color{#378ADD}{\omega}}\Delta t/2)}{c\,\Delta t/2}}_{\text{what the clock sees}}, \qquad \underbrace{\frac{\delta n}{n}}_{\text{speed error}} \le \underbrace{\frac{({\color{#D85A30}{k}}{\color{#1D9E75}{\Delta x}})^{2}}{24}}_{0.41\,\% \text{ at 20 steps}}`);
  const Ns = range(8, 40, 129), bound = N => Math.pow(2 * Math.PI / N, 2) / 24 * 100;
  const x0 = 80, y0 = 20, w = 540, h = 170, A = ax(x0, y0, w, h, 8, 40, 0, 3);
  const draw = () => {
    const S = +$("S").value, N = +$("N").value; $("Sv").textContent = S.toFixed(2); $("Nv").textContent = N;
    const ex = n => (C2.dispRatio1D(n, S) - 1) * 100;
    let s = frame(x0, y0, w, h);
    s += plot(x0, y0, w, h, Ns, Ns.map(bound), 8, 40, 0, 3, PU, 2, "6 3") + plot(x0, y0, w, h, Ns, Ns.map(ex), 8, 40, 0, 3, CO, 2.5);
    s += vline(A.X(N), y0, y0 + h, "var(--t)", "2 3") + dot(A.X(N), A.Y(Math.min(bound(N), 3)), PU, 5) + dot(A.X(N), A.Y(Math.min(ex(N), 3)), CO, 6);
    s += lab(x0 + w - 8, y0 + 18, "dashed purple: bound (kΔx)²/24", "end", "ts", PU) + lab(x0 + w - 8, y0 + 34, "coral: exact 1D Yee error at this S", "end", "ts", CO);
    s += xticks(x0, y0, w, h, 8, 40, [10, 15, 20, 25, 30, 35, 40]) + yticks(x0, y0, w, h, 0, 3, [0, 1, 2, 3]);
    s += lab(x0 + w / 2, y0 + h + 32, "steps per wavelength in the material Nλ", "middle") + ytitle(32, y0 + h / 2, "phase velocity error δn/n (%)");
    box.innerHTML = svg(232, s);
    const b = bound(N) / 100, dphi = 2 * Math.PI * (20000 / (800 / 3.5)) * b;
    $("ro").innerHTML = ro([["exact error", ex(N).toFixed(3) + " %"], ["bound (kΔx)²/24", (b * 100).toFixed(3) + " %"], ["Δx for GaAs at 800 nm", (800 / (N * 3.5)).toFixed(1) + " nm"], ["Δφ over 20 µm (bound)", dphi.toFixed(2) + " rad"], ["cost vs 20 steps", Math.pow(N / 20, 4).toFixed(2) + "×"]]);
  };
  $("S").oninput = draw; $("N").oninput = draw; draw();
}},

/* ---------------- 20. Pulse and monitors ---------------- */
{s: "20. Pulse and monitors", t: String.raw`The Gaussian pulse and the DFT monitor: one run, a whole spectrum`,
intu: String.raw`A short pulse contains many frequencies at once, so a single FDTD run can give a whole spectrum. A Gaussian is the natural choice, because its spectrum is also a Gaussian: the shorter the pulse in time, the wider it is in frequency, and the product of the two widths is fixed. The monitors build the spectrum while the simulation runs. At every step they add the current field times a rotating phase \(e^{i2\pi f n\Delta t}\) for each frequency they track. Dividing the spectrum with the device by the spectrum of a reference run without it gives the transmission.`,
eq: String.raw`\[ s(t) \propto \exp\!\left[-\frac{(t - t_{0})^{2}}{2\tau^{2}}\right]\sin(2\pi f_{0}t), \qquad \tau\sigma_{f} = \frac{1}{2\pi} \]\[ \tilde{E}(f) = \sum_{n} E^{\,n}\,e^{i2\pi f n\Delta t}\,\Delta t, \qquad T(f) = \frac{|\tilde{E}_{\mathrm{slab}}(f)|^{2}}{|\tilde{E}_{\mathrm{ref}}(f)|^{2}} \]<div class="eqref">Used in Lesson 8, card 6 and Lesson 11, cards 1 and 3</div>`,
sym: [[String.raw`\(s(t)\)`, "source signal injected at the source position"], [String.raw`\(t_{0}\)`, "delay, so the pulse starts smoothly from almost zero"], [String.raw`\(\tau\)`, "standard deviation of the pulse envelope in time"], [String.raw`\(f_{0}\)`, String.raw`centre frequency, \(c/\lambda_0\) = 375 THz at 800 nm`], [String.raw`\(\sigma_{f}\)`, "standard deviation of the spectrum (Tidy3D's fwidth)"], [String.raw`\(\tilde{E}(f)\)`, "running Fourier transform of the recorded field at frequency f"], [String.raw`\(E^{\,n}\)`, "field at the monitor at time step n (n is a step index, not a power)"], [String.raw`\(e^{i2\pi f n\Delta t}\)`, "rotating phase that picks out frequency f"], [String.raw`\(\Delta t\)`, "time step"], [String.raw`\(T(f)\)`, "power transmission spectrum"], [String.raw`\(_{\mathrm{slab}}, _{\mathrm{ref}}\)`, "with the device, and the same run without it"]],
how: [String.raw`Read it aloud: "the source is a Gaussian envelope of width tau, delayed by t zero, times a sine at f zero. Tau times sigma f equals one over two pi. The monitor spectrum is the sum over steps of E at step n times e to the i two pi f n delta t, times delta t".`, String.raw`The Fourier transform of a Gaussian of width \(\tau\) is a Gaussian of width \(1/(2\pi\tau)\) centred on \(f_0\). That is the product rule.`, String.raw`The sum is a discrete Fourier transform updated every step, so no field history has to be stored. It is correct only once the fields have decayed, so the run must cover the ring-down of the device.`, String.raw`Dividing by a reference run removes the source spectrum, leaving the device response \(T(f)\).`, "Used in Lesson 8, card 6 and Lesson 11, cards 1 and 3."],
say: "A Gaussian pulse covers a band set by its spectral width, a wider band meaning a shorter pulse, and frequency monitors accumulate a running Fourier transform so that one run gives the whole spectrum.",
num: String.raw`\(\lambda_0 = 800\) nm, \(f_0 = 375\) THz. fwidth \(= f_0/10 = 37.5\) THz gives \(\tau = 1/(2\pi \times 37.5\) THz\() \approx\) <b>4.2 fs</b>.<br>\(\pm 2\sigma_f\) (300 to 450 THz) covers about <b>667 to 1000 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("f", "Spectral width σf, fwidth (THz)", 10, 100, 0.5, 37.5) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\tau}}}_{\text{pulse length}}\;\underbrace{{\color{#378ADD}{\sigma_{f}}}}_{\text{bandwidth}} = \frac{1}{2\pi}, \qquad \underbrace{{\color{#7F77DD}{\tilde{E}(f)}}}_{\text{spectrum}} = \sum_{n}\underbrace{E^{\,n}}_{\text{field at step } n}\,\underbrace{e^{i2\pi f n\Delta t}}_{\text{rotating phase}}\,\Delta t`);
  const draw = () => {
    const sf = +$("f").value; $("fv").textContent = sf.toFixed(1) + " THz";
    const tau = 1000 / (2 * Math.PI * sf), tm = 8 * tau, ts = range(0, tm, 1400), f0 = 0.375;
    let s = lab(70, 14, "source in time", "start", "th");
    const x0 = 70, w = 570;
    s += frame(x0, 20, w, 80) + plot(x0, 20, w, 80, ts, ts.map(t => Math.exp(-Math.pow(t - 4 * tau, 2) / (2 * tau * tau)) * Math.sin(2 * Math.PI * f0 * t)), 0, tm, -1.1, 1.1, CO, 1.2);
    s += plot(x0, 20, w, 80, ts, ts.map(t => Math.exp(-Math.pow(t - 4 * tau, 2) / (2 * tau * tau))), 0, tm, -1.1, 1.1, "var(--t)", 1, "4 3");
    s += xticks(x0, 20, w, 80, 0, tm, [0, 2 * tau, 4 * tau, 6 * tau, 8 * tau], v => v.toFixed(0)) + lab(x0 + w / 2, 132, "time (fs)", "middle");
    const y1 = 170, h1 = 70, fs = range(150, 600, 300), A = ax(x0, y1, w, h1, 150, 600, 0, 1.1);
    s += lab(70, 152, "spectrum", "start", "th");
    const lo = Math.max(150, 375 - 2 * sf), hi = Math.min(600, 375 + 2 * sf);
    s += `<rect x="${A.X(lo)}" y="${y1}" width="${A.X(hi) - A.X(lo)}" height="${h1}" fill="${BL}" fill-opacity="0.12"/>` + frame(x0, y1, w, h1);
    s += plot(x0, y1, w, h1, fs, fs.map(f => Math.exp(-Math.pow(f - 375, 2) / (2 * sf * sf))), 150, 600, 0, 1.1, BL, 2.5);
    s += xticks(x0, y1, w, h1, 150, 600, [200, 300, 400, 500, 600]);
    for (const l of [1500, 1000, 800, 600]) s += vline(A.X(299792 / l), y1 - 3, y1, PU) + lab(A.X(299792 / l), y1 - 6, l + " nm", "middle", "ts", PU);
    s += lab(x0 + w / 2, y1 + h1 + 32, "frequency (THz), shaded: f₀ ± 2σf", "middle");
    box.innerHTML = svg(282, s);
    const fl = 375 - 2 * sf, fh = 375 + 2 * sf;
    $("ro").innerHTML = ro([["pulse width τ", tau.toFixed(2) + " fs"], ["f₀ ± 2σf", fl.toFixed(0) + " to " + fh.toFixed(0) + " THz"], ["in wavelength", (299792 / fh).toFixed(0) + " to " + (299792 / fl).toFixed(0) + " nm"]]);
  };
  $("f").oninput = draw; draw();
}},

/* ---------------- 21. PML ---------------- */
{s: "21. PML", t: String.raw`The perfectly matched layer: \(\sigma_e/\varepsilon = \sigma_m/\mu\) and a graded loss`,
intu: String.raw`A simulation box has edges, and whatever reaches them must disappear as if it went on to infinity. A plain lossy material would reflect, because its impedance differs from the inside. The trick is to add an electric loss and a magnetic loss in the same ratio as \(\varepsilon\) and \(\mu\). Then the impedance does not change at all, so the wave enters without reflection and simply decays inside. On a grid, a loss that jumps from zero to its full value in one cell still reflects a little, so it is switched on gradually, as a power of the depth.`,
eq: String.raw`\[ \frac{\sigma_{e}}{\varepsilon} = \frac{\sigma_{m}}{\mu} \]\[ \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^{m}, \qquad m \approx 3 \]<div class="eqref">Oskooi et al. Sec. 4.2, used in Lesson 11, card 2</div>`,
sym: [[String.raw`\(\sigma_{e}\)`, "electric conductivity of the layer: the loss acting on E"], [String.raw`\(\sigma_{m}\)`, "magnetic conductivity: a fictitious loss acting on H"], [String.raw`\(\varepsilon, \mu\)`, "permittivity and permeability of the medium next to the layer"], [String.raw`\(\sigma(d)\)`, "loss at depth d inside the layer"], [String.raw`\(\sigma_{\mathrm{max}}\)`, "loss at the back of the layer"], [String.raw`\(d\)`, "depth into the layer, 0 at its inner face"], [String.raw`\(L\)`, "layer thickness (not a device length here)"], [String.raw`\(m\)`, "grading order, about 3 (not a mode order here)"]],
how: [String.raw`Read it aloud: "sigma e over epsilon equals sigma m over mu. The loss at depth d is sigma max times d over L to the power m".`, String.raw`The wave impedance is \(\sqrt{\mu/\varepsilon}\). With matched losses, \(\mu\) and \(\varepsilon\) gain the same complex factor, so their ratio and the impedance stay the same and the face of the layer does not reflect.`, "Inside the layer the wave decays. Whatever reflects off the hard wall behind it is attenuated again on its way back.", String.raw`With \(m \approx 3\) the loss changes only slightly from one cell to the next, which keeps the reflection caused by the grid small. \(m = 0\) would be an abrupt layer.`, "Used in Lesson 11, card 2, and around every simulation in the workflow of Lesson 11, card 6."],
say: "A perfectly matched layer absorbs outgoing waves with almost no reflection, because its electric and magnetic losses are matched and switched on gradually, so a small box behaves like open space.",
num: String.raw`\(m = 3\): at half depth the loss is \((1/2)^3 =\) <b>1/8</b> of \(\sigma_{\mathrm{max}}\), at one tenth of the depth only <b>1/1000</b>.<br>A hard wall reflects everything: <b>0 dB</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("m", "Grading order m (0 = abrupt)", 0, 4, 1, 3) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{\frac{{\color{#D85A30}{\sigma_{e}}}}{\varepsilon} = \frac{{\color{#378ADD}{\sigma_{m}}}}{\mu}}_{\text{matched: no reflection at the face}} \qquad \underbrace{{\color{#BA7517}{\sigma(d)}}}_{\text{loss at depth } d} = \sigma_{\mathrm{max}}\Big(\frac{d}{L}\Big)^{{\color{#7F77DD}{m}}}`);
  const x0 = 50, w = 590, X = v => x0 + v * w, xs = range(0, 1, 600);
  const draw = () => {
    const m = +$("m").value; $("mv").textContent = m;
    const sg = x => x < 0.6 ? 0 : Math.pow((x - 0.6) / 0.4, m), Ig = x => x < 0.6 ? 0 : 0.4 * Math.pow((x - 0.6) / 0.4, m + 1) / (m + 1);
    let s = `<rect x="${X(0.6)}" y="20" width="${X(1) - X(0.6)}" height="200" fill="${AM}" fill-opacity="0.1"/>` + vline(X(1), 20, 220, "var(--p)") + `<line x1="${X(1)}" y1="20" x2="${X(1)}" y2="220" stroke="var(--p)" stroke-width="4"/>`;
    s += lab(X(0.3), 36, "simulation region", "middle", "th") + lab(X(0.8), 36, "PML, thickness L", "middle", "th", AM) + lab(X(1) - 4, 236, "hard wall", "end", "ts");
    s += hline(x0, X(1), 120, "var(--t)", "2 3");
    s += plot(x0, 60, w, 120, xs, xs.map(x => Math.cos(2 * Math.PI * x / 0.08) * Math.exp(-30 * Ig(x))), 0, 1, -1.1, 1.1, BL, 2);
    s += plot(x0, 150, w, 60, xs.filter(x => x >= 0.6), xs.filter(x => x >= 0.6).map(sg), 0, 1, 0, 1.05, AM, 3);
    s += hline(X(0.6), X(1), 210, AM) + lab(X(0.86), 178, "σ(d)", "middle", "t", AM) + lab(X(0.3), 206, "wave travelling right, then decaying (sketch)", "middle", "ts", BL);
    box.innerHTML = svg(244, s);
    $("ro").innerHTML = ro([["σ at half depth / σmax", m === 0 ? "1 (abrupt)" : "1/" + Math.pow(2, m)], ["average loss over the layer", "σmax/" + (m + 1)]]);
  };
  $("m").oninput = draw; draw();
}},

/* ---------------- 22. Mode overlap ---------------- */
{s: "22. Mode overlap", t: String.raw`Mode overlap: from a field to a transmission number`,
intu: String.raw`A monitor records the whole field at the output, but a designer wants to know how much power is in one particular mode. Waveguide modes are orthogonal, so projecting the field onto one mode picks out exactly its share, the way a Fourier coefficient picks out one frequency. The full form uses both \(\mathbf{E}\) and \(\mathbf{H}\) and measures power flowing through the cross-section. The simpler scalar overlap, with one field component, is how one estimates the coupling of a grating's beam into a fiber. Either way, power in other modes or in radiation does not count.`,
eq: String.raw`\[ a_{m} = \frac{1}{4}\int\left(\mathbf{E} \times \mathbf{H}_{m}^{*} + \mathbf{E}_{m}^{*} \times \mathbf{H}\right)\cdot\hat{\mathbf{x}}\,\mathrm{d}A, \qquad T_{m} = |a_{m}|^{2} \]\[ \eta = \frac{\left|\int E\,G\,\mathrm{d}x\right|^{2}}{\int |E|^{2}\,\mathrm{d}x\int |G|^{2}\,\mathrm{d}x} \]<div class="eqref">Used in Lesson 5, card 5 and Lesson 11, card 4</div>`,
sym: [[String.raw`\(a_{m}\)`, "complex amplitude of mode m in the recorded field"], [String.raw`\(\mathbf{E}, \mathbf{H}\)`, "fields recorded by the monitor"], [String.raw`\(\mathbf{E}_{m}, \mathbf{H}_{m}\)`, String.raw`fields of mode \(m\), normalized so that \(\tfrac{1}{2}\mathrm{Re}\int \mathbf{E}_m \times \mathbf{H}_m^{*} \cdot \hat{\mathbf{x}}\,\mathrm{d}A = 1\)`], [String.raw`\(^{*}\)`, "complex conjugate"], [String.raw`\(\times, \cdot\hat{\mathbf{x}}\)`, "cross product, then the component along the propagation direction x"], [String.raw`\(\mathrm{d}A\)`, "area element of the cross-section"], [String.raw`\(T_{m}\)`, "fraction of the source power carried by mode m"], [String.raw`\(\eta\)`, "scalar overlap efficiency, between 0 and 1"], [String.raw`\(E, G\)`, "one field component of the beam, and the target mode (for example a Gaussian fiber mode)"]],
how: [String.raw`Read it aloud: "a m is one quarter of the integral over the cross-section of E cross H m conjugate plus E m conjugate cross H, along x. The power in mode m is a m squared. The scalar overlap eta is the squared integral of E times G divided by the two self-integrals".`, String.raw`\(\mathbf{E} \times \mathbf{H}^{*}\) has the form of the Poynting vector, so the integral measures power through the plane. Mode orthogonality makes every other mode drop out.`, String.raw`Because the mode fields carry unit power, \(|a_m|^2\) is directly a power fraction.`, String.raw`In \(\eta\) the denominator normalizes both shapes, so \(\eta = 1\) only if \(E\) and \(G\) have the same shape and position. The Cauchy-Schwarz inequality keeps it at or below 1. An exponential grating beam on a Gaussian fiber mode is limited to about 80 %.`, "Used in Lesson 5, card 5 (fiber coupling) and Lesson 11, card 4 (mode monitors)."],
say: "Transmission is computed by projecting the output field onto the target mode with the mode orthogonality integral, so power in other modes or in radiation does not count.",
num: String.raw`Exponential beam from a uniform grating into a Gaussian fiber mode: at best about <b>80 %</b>.<br>A Gaussian of the right width centred on the TE0 slab mode: close to <b>100 %</b>. Offset by half the slab thickness: much less (see the readout).`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Gaussian half width w (nm)", 40, 400, 5, 100) + sl("z", "Gaussian offset z₀ (nm)", -200, 200, 5, 0) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{\eta}}}_{\text{overlap}} = \frac{\Big|\int \underbrace{{\color{#378ADD}{E}}}_{\text{field}}\,\underbrace{{\color{#1D9E75}{G}}}_{\text{target mode}}\,\mathrm{d}x\Big|^{2}}{\underbrace{\int |E|^{2}\,\mathrm{d}x\int |G|^{2}\,\mathrm{d}x}_{\text{normalization}}} \qquad \underbrace{{\color{#7F77DD}{T_{m}}} = |a_{m}|^{2}}_{\text{power in mode } m}`);
  const zs = range(-600, 600, 601), N = C2.slabN(3.5, 1, 160, 800, 0, "TE"), G = C2.slabProfile(3.5, 1, 160, 800, 0, "TE", N, zs).main;
  const x0 = 70, y0 = 20, w = 560, h = 170, A = ax(x0, y0, w, h, -600, 600, 0, 1.08);
  const draw = () => {
    const wd = +$("w").value, z0 = +$("z").value; $("wv").textContent = wd + " nm"; $("zv").textContent = z0 + " nm";
    const E = zs.map(z => Math.exp(-Math.pow((z - z0) / wd, 2)));
    let a = 0, b = 0, c = 0; zs.forEach((z, i) => { a += E[i] * G[i]; b += E[i] * E[i]; c += G[i] * G[i]; });
    const eta = a * a / (b * c);
    let s = `<rect x="${A.X(-80)}" y="${y0}" width="${A.X(80) - A.X(-80)}" height="${h}" fill="${BL}" fill-opacity="0.08"/>` + frame(x0, y0, w, h);
    let d = `M${A.X(-600)} ${A.Y(0)}`; zs.forEach((z, i) => { d += `L${A.X(z).toFixed(1)} ${A.Y(E[i] * G[i]).toFixed(1)}`; }); d += `L${A.X(600)} ${A.Y(0)}Z`;
    s += `<path d="${d}" fill="${TL}" fill-opacity="0.25"/>`;
    s += plot(x0, y0, w, h, zs, G, -600, 600, 0, 1.08, TL, 2.5) + plot(x0, y0, w, h, zs, E, -600, 600, 0, 1.08, BL, 2.5, "6 3");
    s += lab(x0 + 8, y0 + 18, "green: TE0 slab mode G (160 nm GaAs)", "start", "ts", TL) + lab(x0 + 8, y0 + 34, "dashed blue: field E (Gaussian)", "start", "ts", BL) + lab(x0 + 8, y0 + 50, "shaded: product E·G", "start", "ts", TL);
    s += xticks(x0, y0, w, h, -600, 600, [-600, -300, 0, 300, 600]) + yticks(x0, y0, w, h, 0, 1.08, [0, 0.5, 1]);
    s += lab(x0 + w / 2, y0 + h + 32, "position z (nm)", "middle") + ytitle(32, y0 + h / 2, "field (normalized)");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["overlap η", (eta * 100).toFixed(1) + " %"]]);
  };
  $("w").oninput = draw; $("z").oninput = draw; draw();
}},

/* ---------------- 23. Richardson ---------------- */
{s: "23. Convergence", t: String.raw`Convergence and Richardson extrapolation`,
intu: String.raw`Every FDTD number depends a little on the grid. For a second-order scheme the error falls as \(1/N^2\), where \(N\) is the number of steps per wavelength. So a result plotted against \(1/N^2\) lies on a straight line, and the value where that line meets \(1/N^2 = 0\) is the answer an infinitely fine grid would give. Two resolutions are enough to draw the line, and the formula is just that straight-line extrapolation written out. If estimates from different pairs of resolutions agree, the result has converged.`,
eq: String.raw`\[ Q(N) \approx Q_{\infty} + \frac{C}{N^{2}} \]\[ Q_{\infty} \approx \frac{N_{2}^{2}Q(N_{2}) - N_{1}^{2}Q(N_{1})}{N_{2}^{2} - N_{1}^{2}} \]<div class="eqref">Used in Lesson 11, card 5</div>`,
sym: [[String.raw`\(Q(N)\)`, "a computed result, for example a transmission, at N steps per wavelength"], [String.raw`\(N\)`, String.raw`steps per wavelength, the same as \(N_\lambda\) in card 19`], [String.raw`\(Q_{\infty}\)`, "the value an infinitely fine grid would give"], [String.raw`\(C\)`, "unknown constant that sets the size of the grid error"], [String.raw`\(N_{1}, N_{2}\)`, "two resolutions used for the estimate"], [String.raw`\(1/N^{2}\)`, "the variable in which the error is a straight line"]],
how: [String.raw`Read it aloud: "Q of N is about Q infinity plus C over N squared. So Q infinity is about N two squared Q of N two minus N one squared Q of N one, divided by N two squared minus N one squared".`, String.raw`The \(1/N^2\) comes from the second-order accuracy of the centered differences (card 16) and of the dispersion bound (card 19).`, String.raw`Write the first line for \(N_1\) and for \(N_2\), multiply each by its \(N^2\) and subtract. \(C\) cancels and \(Q_\infty\) remains.`, String.raw`It holds only when both grids are fine enough that the \(1/N^2\) term dominates. Staircased boundaries (card 18) can make the convergence irregular, so the estimate is a check on the result.`, "Used in Lesson 11, card 5. Every result is reported with its resolution."],
say: String.raw`Convergence is shown by refining the grid until the result stops changing. For a second-order scheme the error falls as \(1/N^2\), and two fine resolutions give a Richardson estimate of the converged value.`,
num: String.raw`Illustrative curve \(Q(N) = 0.70 - 9/N^2\): \(N = 20\) gives <b>0.6775</b>, \(N = 30\) gives <b>0.6900</b>.<br>Richardson from 20 and 30: \((900 \times 0.69 - 400 \times 0.6775)/500 =\) <b>0.7000</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Coarse grid N₁", 10, 40, 1, 20) + sl("b", "Fine grid N₂", 12, 60, 1, 30) + '<div class="readout" id="ro"></div>';
  const box = fbox(fig, String.raw`\underbrace{{\color{#D85A30}{Q(N)}}}_{\text{result at } N} \approx \underbrace{{\color{#1D9E75}{Q_{\infty}}}}_{\text{converged}} + \underbrace{\frac{C}{{\color{#378ADD}{N}}^{2}}}_{\text{grid error}} \;\Longrightarrow\; {\color{#1D9E75}{Q_{\infty}}} \approx \frac{N_{2}^{2}Q(N_{2}) - N_{1}^{2}Q(N_{1})}{N_{2}^{2} - N_{1}^{2}}`);
  const Q = N => 0.70 - 9 / (N * N), x0 = 80, y0 = 30, w = 540, h = 160, A = ax(x0, y0, w, h, 0, 0.0105, 0.6, 0.71);
  const draw = () => {
    const n1 = +$("a").value, n2 = +$("b").value; $("av").textContent = n1; $("bv").textContent = n2;
    let s = frame(x0, y0, w, h);
    for (const N of [10, 12, 15, 20, 30]) s += vline(A.X(1 / (N * N)), y0, y0 + 4, "var(--t)") + lab(A.X(1 / (N * N)), y0 - 6, "N=" + N, "middle", "ts");
    for (let N = 10; N <= 60; N += 2) s += dot(A.X(1 / (N * N)), A.Y(Q(N)), "var(--t)", 2);
    s += hline(x0, x0 + w, A.Y(0.7), TL, "3 3") + lab(x0 + w - 6, A.Y(0.7) - 6, "true converged value 0.70", "end", "ts", TL);
    let est = null;
    if (n1 !== n2) {
      est = (n2 * n2 * Q(n2) - n1 * n1 * Q(n1)) / (n2 * n2 - n1 * n1);
      const xa = 1 / (n1 * n1), ya = Q(n1), xb = 1 / (n2 * n2), yb = Q(n2), xe = Math.max(xa, xb);
      s += `<line x1="${A.X(0)}" y1="${A.Y(est)}" x2="${A.X(xe)}" y2="${A.Y(ya + (yb - ya) / (xb - xa) * (xe - xa))}" stroke="${PU}" stroke-width="2" stroke-dasharray="6 3"/>`;
      s += dot(A.X(0), A.Y(est), TL, 7) + dot(A.X(xa), A.Y(ya), CO, 6) + dot(A.X(xb), A.Y(yb), BL, 6);
      s += lab(A.X(xa) + 8, A.Y(ya) + 14, "N₁", "start", "t", CO) + lab(A.X(xb) + 8, A.Y(yb) + 14, "N₂", "start", "t", BL) + lab(x0 + 8, y0 + h - 10, "green dot at 1/N² = 0: the Q∞ estimate", "start", "ts", TL);
    }
    s += xticks(x0, y0, w, h, 0, 0.0105, [0, 0.0025, 0.005, 0.0075, 0.01], v => v.toFixed(4)) + yticks(x0, y0, w, h, 0.6, 0.71, [0.6, 0.65, 0.7]);
    s += lab(x0 + w / 2, y0 + h + 32, "1/N²  (finer grids to the left)", "middle") + ytitle(28, y0 + h / 2, "result Q");
    box.innerHTML = svg(232, s);
    $("ro").innerHTML = ro([["Q(N₁)", Q(n1).toFixed(4)], ["Q(N₂)", Q(n2).toFixed(4)], ["Richardson Q∞", est === null ? "pick two different N" : est.toFixed(4)]]);
  };
  $("a").oninput = draw; $("b").oninput = draw; draw();
}}
],
summary: String.raw`Each card of this lesson takes one group of Chapter 2 equations and reads it in words, part by part. Cards 1 to 14 cover guiding, modes, symmetry, the grating, the DBR and the MMI, and cards 15 to 23 cover how FDTD turns Maxwell's equations into numbers you can trust. Use it as a dictionary for the symbols in Lessons 1 to 11.`,
sheet: [
[String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2}, \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \]`, "Snell's law and critical angle (Lesson 1)"],
[String.raw`\[ \gamma = k_{0}\sqrt{N^{2} - n_{\mathrm{c}}^{2}} \]`, "Evanescent decay constant (Lesson 1)"],
[String.raw`\[ \beta = k_{0}N, \qquad n_{\mathrm{c}} \lt N \lt n, \qquad \lambda_{\mathrm{guide}} = \frac{\lambda_{0}}{N} \]`, "Effective index and guiding window (Lesson 1)"],
[String.raw`\[ \omega = \frac{c\beta}{n_{\mathrm{c}}} \]`, "Light line of the cladding (Lesson 1)"],
[String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}} = 2\pi m \]`, "Transverse resonance (Lesson 1)"],
[String.raw`\[ E_{z}^{\mathrm{air}} = \frac{\varepsilon_{\mathrm{core}}}{\varepsilon_{\mathrm{air}}}\,E_{z}^{\mathrm{core}} \]`, "Field jump, Ch. 2 Eq. 2.1 (Lesson 2)"],
[String.raw`\[ \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa}, \qquad \kappa = k_{0}\sqrt{n^{2} - N^{2}} \]`, "Slab equation, Ch. 2 Eq. 2.2 (Lesson 2)"],
[String.raw`\[ \zeta = 1 \ \text{(TE)}, \qquad \zeta = \left(\frac{n}{n_{\mathrm{c}}}\right)^{2} \ \text{(TM)} \]`, "Polarization factor (Lesson 2)"],
[String.raw`\[ t_{m} = \frac{m\lambda_{0}}{2\sqrt{n^{2} - n_{\mathrm{c}}^{2}}}, \qquad \Gamma = \frac{\int_{\mathrm{core}} |E|^{2}}{\int |E|^{2}} \]`, "Cutoff thickness and confinement factor (Lesson 2)"],
[String.raw`\[ \mathrm{slab}(n, t) \to N_{\mathrm{s}}, \qquad \mathrm{slab}(N_{\mathrm{s}}, w) \to N_{\mathrm{eff}} \]`, "Effective index method (Lesson 3)"],
[String.raw`\[ w_{p} = \frac{p\lambda_{0}}{2\sqrt{N_{\mathrm{s}}^{2} - n_{\mathrm{c}}^{2}}}, \qquad N_{\mathrm{s}} - N_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8N_{\mathrm{s}}w^{2}} \]`, "Lateral cutoff and wide-section correction (Lesson 3)"],
[String.raw`\[ (E_{x}, E_{y}, E_{z}) \to (E_{x}, E_{y}, -E_{z}), \qquad (H_{x}, H_{y}, H_{z}) \to (-H_{x}, -H_{y}, H_{z}) \]`, "Mirror z → −z (Lesson 4)"],
[String.raw`\[ M[\mathbf{E}] = \sigma\mathbf{E}, \qquad E_{y}(-y, z) = \sigma_{y}E_{y}, \qquad E_{y}(y, -z) = \sigma_{z}E_{y} \]`, "Even and odd modes, symmetry naming (Lessons 3 and 4)"],
[String.raw`\[ \kappa_{12} \propto \int \Delta\varepsilon\,E_{1}E_{2}\,\mathrm{d}z \]`, "Coupling by a perturbation (Lesson 4)"],
[String.raw`\[ \text{PEC: } \hat{\mathbf{n}} \times \mathbf{E} = 0, \qquad \text{PMC: } \hat{\mathbf{n}} \times \mathbf{H} = 0, \qquad \frac{N_{\mathrm{cells}}}{2^{s}} \]`, "Ideal walls and cost with s symmetry planes (Lesson 4)"],
[String.raw`\[ \text{Tidy3D: } +1 = \text{even} = \text{PMC}, \qquad -1 = \text{odd} = \text{PEC} \]`, "Symmetry values (Lesson 4)"],
[String.raw`\[ k_{0}n_{\mathrm{c}}\sin\theta_{m} = \beta + m\,\frac{2\pi}{\Lambda} \]`, "Grating phase matching, Ch. 2 Eq. 2.3 (Lesson 5)"],
[String.raw`\[ \Lambda = \frac{\lambda_{0}}{N - n_{\mathrm{c}}\sin\theta}, \qquad \theta = 0 \Rightarrow \beta - 2\cdot\frac{2\pi}{\Lambda} = -\beta \]`, "Grating period, Ch. 2 Eq. 2.4, and second-order reflection (Lesson 5)"],
[String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}}, \qquad d = \frac{\lambda_{0}}{4n} \]`, "Single interface and quarter-wave layer (Lesson 6)"],
[String.raw`\[ R = \left(\frac{q - 1}{q + 1}\right)^{2}, \qquad q = \left(\frac{n_{\mathrm{H}}}{n_{\mathrm{L}}}\right)^{2N} \]`, "DBR peak reflectance, Ch. 2 Eq. 2.5 (Lesson 6)"],
[String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi}\arcsin\!\left(\frac{n_{\mathrm{H}} - n_{\mathrm{L}}}{n_{\mathrm{H}} + n_{\mathrm{L}}}\right) \]`, "DBR stopband, Ch. 2 Eq. 2.6 (Lesson 6)"],
[String.raw`\[ U \propto \left|1 + \sqrt{R}\,e^{i\delta}\right|^{2}, \qquad \delta = 2k_{0}t_{\mathrm{gap}} + \varphi_{\mathrm{DBR}} \]`, "Air gap interference (Lesson 6)"],
[String.raw`\[ k_{y\nu}^{2} + \beta_{\nu}^{2} = k_{0}^{2}n_{r}^{2}, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_{e}} \]`, "MMI lateral modes, Ch. 2 Eq. 2.7 (Lesson 7)"],
[String.raw`\[ W_{e} \approx W_{M} + \frac{\lambda_{0}}{\pi}\left(\frac{n_{c}}{n_{r}}\right)^{2\sigma}\left(n_{r}^{2} - n_{c}^{2}\right)^{-1/2} \]`, "Effective width, Ch. 2 Eq. 2.8 (Lesson 7)"],
[String.raw`\[ \beta_{\nu} \approx k_{0}n_{r} - \frac{(\nu + 1)^{2}\pi\lambda_{0}}{4n_{r}W_{e}^{2}}, \qquad L_{\pi} \approx \frac{4n_{r}W_{e}^{2}}{3\lambda_{0}} \]`, "Quadratic law and beat length, Ch. 2 Eqs. 2.9 and 2.10 (Lesson 7)"],
[String.raw`\[ \Psi(y, L) = \sum_{\nu} c_{\nu}\psi_{\nu}\exp\!\left[\frac{j\nu(\nu + 2)\pi L}{3L_{\pi}}\right], \qquad L = p\,(3L_{\pi}) \]`, "Self-imaging, Ch. 2 Eqs. 2.12 and 2.13 (Lesson 7)"],
[String.raw`\[ L_{\pi} = \frac{\lambda_{0}}{2(n_{0} - n_{1})}, \qquad L = p\,L_{\pi}^{\mathrm{TE}} = q\,L_{\pi}^{\mathrm{TM}} \]`, "Two-mode splitter, Ch. 2 Eqs. 2.14 and 2.15 (Lesson 7)"],
[String.raw`\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_{e}}{W_{e}} \approx \frac{\delta\lambda}{\lambda_{0}} \]`, "MMI tolerances (Lesson 7)"],
[String.raw`\[ \frac{\partial \mathbf{E}}{\partial t} = \frac{1}{\varepsilon_{0}\varepsilon_{r}}\nabla \times \mathbf{H}, \qquad \frac{\partial \mathbf{H}}{\partial t} = -\frac{1}{\mu_{0}}\nabla \times \mathbf{E} \]`, "Maxwell curl equations, Ch. 2 Eq. 2.16 (Lesson 8)"],
[String.raw`\[ f' \approx \frac{f(x + \Delta x/2) - f(x - \Delta x/2)}{\Delta x}, \qquad \text{error } \frac{\Delta x^{2}}{24}f''' \]`, "Centered difference (Lesson 8)"],
[String.raw`\[ H\big|_{i+1/2}^{n+1/2} = H\big|_{i+1/2}^{n-1/2} + \frac{\Delta t}{\mu_{0}\Delta x}\left(E\big|_{i+1}^{n} - E\big|_{i}^{n}\right) \]`, "H update (Lesson 8)"],
[String.raw`\[ E\big|_{i}^{n+1} = E\big|_{i}^{n} + \frac{\Delta t}{\varepsilon\Delta x}\left(H\big|_{i+1/2}^{n+1/2} - H\big|_{i-1/2}^{n+1/2}\right) \]`, "E update (Lesson 8)"],
[String.raw`\[ S = \frac{c\,\Delta t}{\Delta x} \le 1, \qquad c\,\Delta t \le \left(\Delta x^{-2} + \Delta y^{-2} + \Delta z^{-2}\right)^{-1/2} \]`, "Courant limit (Lessons 8 and 10)"],
[String.raw`\[ |g| = 2a^{2} - 1 + 2a\sqrt{a^{2} - 1}, \qquad a = S\sin(k\Delta x/2) \gt 1 \]`, "Growth factor above the limit (Lesson 10)"],
[String.raw`\[ E_{x}(i+\tfrac{1}{2}, j, k), \quad H_{z}(i+\tfrac{1}{2}, j+\tfrac{1}{2}, k), \qquad \frac{\partial H_{z}}{\partial t} = -\frac{1}{\mu_{0}}\left(\frac{\partial E_{y}}{\partial x} - \frac{\partial E_{x}}{\partial y}\right) \]`, "Yee cell and face loop (Lesson 9)"],
[String.raw`\[ \mathrm{TM}_{z}:\ E_{z}, H_{x}, H_{y} \qquad \mathrm{TE}_{z}:\ H_{z}, E_{x}, E_{y} \qquad \varepsilon_{\mathrm{cell}} = f\varepsilon_{1} + (1 - f)\varepsilon_{2} \]`, "2D split and subpixel average (Lesson 9)"],
[String.raw`\[ \frac{\sin(k\Delta x/2)}{\Delta x/2} = \frac{\sin(\omega\Delta t/2)}{c\,\Delta t/2} \]`, "1D numerical dispersion (Lesson 10)"],
[String.raw`\[ \frac{\delta n}{n} \le \frac{(k\Delta x)^{2}}{24}, \qquad \Delta\varphi \approx 2\pi\,\frac{L}{\lambda_{m}}\,\frac{\delta n}{n} \]`, "Phase error bound, Ch. 2 Eq. 2.17, and accumulated phase (Lesson 10)"],
[String.raw`\[ \Delta x = \frac{\lambda_{0}}{N_{\lambda}n_{\mathrm{max}}}, \qquad \text{cost} \propto N_{\lambda}^{4} \]`, "Grid size and cost (Lesson 9)"],
[String.raw`\[ \tau\sigma_{f} = \frac{1}{2\pi} \]`, "Pulse length and bandwidth (Lesson 11)"],
[String.raw`\[ \tilde{E}(f) = \sum_{n} E^{\,n}\,e^{i2\pi f n\Delta t}\,\Delta t, \qquad T(f) = \frac{|\tilde{E}_{\mathrm{slab}}|^{2}}{|\tilde{E}_{\mathrm{ref}}|^{2}} \]`, "Running DFT monitor and transmission (Lessons 8 and 11)"],
[String.raw`\[ \frac{\sigma_{e}}{\varepsilon} = \frac{\sigma_{m}}{\mu}, \qquad \sigma(d) = \sigma_{\mathrm{max}}\left(\frac{d}{L}\right)^{m} \]`, "Matched, graded PML (Lesson 11)"],
[String.raw`\[ a_{m} = \frac{1}{4}\int\left(\mathbf{E} \times \mathbf{H}_{m}^{*} + \mathbf{E}_{m}^{*} \times \mathbf{H}\right)\cdot\hat{\mathbf{x}}\,\mathrm{d}A, \qquad T_{m} = |a_{m}|^{2} \]`, "Mode decomposition (Lesson 11)"],
[String.raw`\[ \eta = \frac{\left|\int E\,G\right|^{2}}{\int |E|^{2}\int |G|^{2}} \]`, "Scalar mode overlap (Lessons 5 and 11)"],
[String.raw`\[ Q_{\infty} \approx \frac{N_{2}^{2}Q(N_{2}) - N_{1}^{2}Q(N_{1})}{N_{2}^{2} - N_{1}^{2}} \]`, "Richardson extrapolation (Lesson 11)"]],
consts: String.raw`\(k_0 = 2\pi/\lambda_0 = 0.00785\,\mathrm{nm^{-1}}\) at 800 nm, \(c = 2.998 \times 10^{8}\,\mathrm{m/s}\), \(\varepsilon_0 = 8.854 \times 10^{-12}\,\mathrm{F/m}\), \(\mu_0 = 4\pi \times 10^{-7}\,\mathrm{H/m}\), \(\eta_0 = 377\,\Omega\), \(f_0 = 375\) THz at 800 nm. Examples use \(n = 3.5\), air cladding, \(\lambda_0 = 800\) nm. Illustrative values, not thesis results.`,
sources: [
  "Johnson et al., Phys. Rev. B 60, 5751 (1999) (light cone, guided modes in slabs, even and odd classes)",
  "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), Appendix C (slab equations)",
  "Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995) (effective index method, MMI self-imaging, tolerances)",
  "Tidy3D documentation (Simulation.symmetry, GaussianPulse fwidth, mode monitors)",
  "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (grating coupler period, tilt, efficiency limits)",
  "Gačević and Vukmirović, Phys. Rev. Applied 9, 064041 (2018), Sec. II A, Eqs. (2) and (3) (DBR reflectance and stopband)",
  "Oskooi et al., Comput. Phys. Commun. 181, 687 (2010) (MEEP: Yee grid, leapfrog, PML, Fourier-transformed output)",
  "K. S. Yee, IEEE Trans. Antennas Propag. 14, 302 (1966) (the original Yee scheme)",
  "Dohlus and Zagorodnov, J. Comput. Phys. 228, 2822 (2009), Eqs. (7) to (12) (stability and numerical dispersion)",
  "Snyder and Love, Optical Waveguide Theory, Chapman and Hall (1983) (mode orthogonality)"
]
});
})();
