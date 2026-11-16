addLesson("thesis", "lec", {
level: "Set up", num: "Lesson 2",
id: "thesis-lec-l2", title: "Wavelengths and the Gaussian pulse", short: "2. Wavelengths and pulse",
big: String.raw`The first thing the code fixes is which wavelengths matter: 101 of them, from 735 to 835 nm, centred at 795 nm. Then it chooses the time shape of the source: a Gaussian pulse, a few femtoseconds long, oscillating at the centre frequency \(f_0 = c/\lambda_0 \approx 377\) THz. A short pulse contains a wide band of frequencies, wide enough to cover all 101 wavelengths at once. The pulse is only the time part of the source. Its shape in space comes from the waveguide mode (Lesson 3).`,
bridge: String.raw`In Tidy3D this is a GaussianPulse with a centre frequency freq0 and a width fwidth. Do not confuse fwidth with the \(\sigma = 8\) nm of the thesis, which is the width of the wavelength weights in the figure of merit (Lesson 9).`,
cards: [
{s: "1. 101 wavelengths", t: "The band: 101 wavelengths from 735 to 835 nm",
intu: String.raw`Move the slider through the 101 wavelengths. Each wavelength is also a frequency, \(f = c/\lambda\). The band runs from about 359 to 408 THz. Every result later (fields, transmission, figure of merit, gradient) is computed at each of these 101 frequencies.`,
eq: String.raw`\[ \lambda_j = 735, 736, \ldots, 835 \text{ nm}, \qquad f_j = \frac{c}{\lambda_j}, \qquad f_0 = \frac{c}{795 \text{ nm}} \approx 377 \text{ THz} \]`,
sym: [[String.raw`\(\lambda_j\)`, "wavelength number j, 1 nm apart"], [String.raw`\(f_j\)`, "the same point as a frequency"]],
how: ["Choose the band that must work (it contains the quantum dot emission near 795 nm).", "Sample it every 1 nm: 101 points.", "Convert to frequencies, which is what the solver uses."],
say: "The design is evaluated at 101 wavelengths from 735 to 835 nm, which is 359 to 408 THz, centred at 795 nm or 377 THz.",
num: "c = 299,792,458 m/s. 735 nm: 407.9 THz. 795 nm: 377.1 THz. 835 nm: 359.0 THz.",
r(fig, ctl) {
  ctl.innerHTML = sl("jj", "Wavelength number j", 1, 101, 1, 61) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const j = +$("jj").value, lam = 734 + j, f = 299792.458 / lam; $("jjv").textContent = j;
    const X = C3.X(60, 560, 730, 840);
    let s = `<line x1="60" x2="620" y1="70" y2="70" stroke="var(--b)"/><text class="ts" x="20" y="74">λ</text>`;
    for (let k = 735; k <= 835; k++) s += `<line x1="${X(k)}" x2="${X(k)}" y1="62" y2="78" stroke="${k === lam ? "var(--coral)" : "var(--blue)"}" stroke-width="${k === lam ? 3 : 1}"/>`;
    for (const k of [735, 795, 835]) s += `<text class="ts" x="${X(k)}" y="96" text-anchor="middle">${k} nm</text>`;
    const F = C3.X(60, 560, 355, 412);
    s += `<line x1="60" x2="620" y1="150" y2="150" stroke="var(--b)"/><text class="ts" x="20" y="154">f</text>`;
    for (let k = 735; k <= 835; k++) { const ff = 299792.458 / k; s += `<line x1="${F(ff)}" x2="${F(ff)}" y1="142" y2="158" stroke="${k === lam ? "var(--coral)" : "var(--teal)"}" stroke-width="${k === lam ? 3 : 1}"/>`; }
    for (const ff of [359, 377.1, 407.9]) s += `<text class="ts" x="${F(ff)}" y="176" text-anchor="middle">${ff} THz</text>`;
    s += `<line x1="${X(lam)}" x2="${F(f)}" y1="80" y2="140" stroke="var(--coral)" stroke-dasharray="3 3"/>`;
    fig.innerHTML = svg(190, s);
    $("ro").innerHTML = `<div><span>wavelength</span><b>${lam} nm</b></div><div><span>frequency</span><b>${f.toFixed(1)} THz</b></div><div><span>period</span><b>${(1000 / f).toFixed(2)} fs</b></div>`;
  };
  $("jj").oninput = u; u();
}},
{s: "2. The pulse", t: "A short pulse covers the whole band",
intu: String.raw`The source switches on and off as a Gaussian pulse that oscillates at 377 THz. Change its spectral width. A short pulse in time (left) is wide in frequency (right). The shaded band is 359 to 408 THz. The pulse must put energy into every frequency of the band, so it cannot be too long. Tidy3D later divides every result by the spectrum of the pulse, so the exact shape does not matter as long as the band is covered.`,
eq: String.raw`\[ s(t) = e^{-(t-t_0)^2/2\tau^2}\cos\big(2\pi f_0 (t-t_0)\big), \qquad \tau = \frac{1}{2\pi f_\mathrm{width}} \]`,
sym: [[String.raw`\(f_0\)`, "centre frequency, 377 THz"], [String.raw`\(\tau\)`, "pulse length in time"], [String.raw`\(f_\mathrm{width}\)`, "spectral width (Tidy3D fwidth)"], [String.raw`\(t_0\)`, "delay so the pulse starts smoothly from zero"]],
how: ["Pick the centre frequency of the band.", "Pick a width so the spectrum covers the band.", "The time length follows: wide spectrum, short pulse.", "Delay the peak so the pulse starts from almost zero."],
say: "The source is a Gaussian pulse at 377 THz, short enough that its spectrum covers 359 to 408 THz, so one run contains all 101 wavelengths.",
num: String.raw`With \(f_\mathrm{width} = 25\) THz the pulse lasts about \(\tau = 6.4\) fs, a few optical periods of 2.65 fs.`,
r(fig, ctl) {
  ctl.innerHTML = sl("fw", "Spectral width (THz)", 5, 60, 1, 25) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const fw = +$("fw").value, tau = 1000 / (2 * Math.PI * fw), f0 = 377.1, t0 = 4 * tau, T = 8 * tau; $("fwv").textContent = fw;
    const ts = range(0, T, 700), g = ts.map(t => LC.gauss(t, t0, tau) * Math.cos(2 * Math.PI * f0 * (t - t0) / 1000));
    const fs = range(300, 460, 300), S = fs.map(f => Math.exp(-Math.pow(f - f0, 2) / (2 * fw * fw)));
    const F = C3.X(370, 280, 300, 460);
    let s = `<text class="th" x="170" y="20" text-anchor="middle">in time (fs)</text><text class="th" x="510" y="20" text-anchor="middle">in frequency (THz)</text>`;
    s += C3.frame(30, 30, 280, 150, 0, T, -1.1, 1.1, [0, Math.round(T / 2), Math.round(T)], [], "", "", v => Math.round(v)) + plot(30, 30, 280, 150, ts, g, 0, T, -1.1, 1.1, "var(--blue)", 1.4);
    s += `<rect x="${F(359)}" y="30" width="${F(407.9) - F(359)}" height="150" fill="var(--teal-bg)"/>` + C3.frame(370, 30, 280, 150, 300, 460, 0, 1.1, [300, 359, 408, 460], [], "", "") + plot(370, 30, 280, 150, fs, S, 300, 460, 0, 1.1, "var(--coral)", 2);
    fig.innerHTML = svg(215, s);
    const lo = Math.exp(-Math.pow(359 - f0, 2) / (2 * fw * fw)), hi = Math.exp(-Math.pow(407.9 - f0, 2) / (2 * fw * fw));
    $("ro").innerHTML = `<div><span>pulse length τ</span><b>${tau.toFixed(1)} fs</b></div><div><span>spectrum at 835 nm / 735 nm</span><b>${lo.toFixed(2)} / ${hi.toFixed(2)}</b></div><div><span>band covered?</span><b>${Math.min(lo, hi) > 0.1 ? "yes" : "weakly"}</b></div>`;
  };
  $("fw").oninput = u; u();
}},
{s: "3. Space times time", t: "The source is a mode shape times the pulse",
intu: String.raw`Step through. The pulse only says how the source changes in time. Where the current flows on the input plane, and in which direction, comes from the waveguide mode (next lesson). The source is the product of the two: a sheet of current shaped like the TE\(_0\) or TM\(_0\) mode, switched on and off by the pulse.`,
eq: String.raw`\[ \mathbf{J}(\mathbf{r},t) = \mathbf{J}_m(y,z)\; s(t) \]`,
sym: [[String.raw`\(\mathbf{J}_m(y,z)\)`, "current pattern on the input plane, from the mode"], [String.raw`\(s(t)\)`, "Gaussian pulse in time"]],
how: ["Time part: the Gaussian pulse of card 2.", "Space part: the mode profile on the input plane (Lesson 3).", "Multiply: the source current the solver adds every time step."],
say: "The source current is the mode profile on the input plane times the Gaussian pulse in time.",
num: "Only the input plane carries this current. Everywhere else the equations are source-free.",
r(fig, ctl) {
  const cap = ["Time part: the pulse s(t), the same at every point of the source plane.", "Space part: the mode profile across the 200 nm input waveguide.", "The source: the profile, switched on and off by the pulse. It lives only on the input plane."];
  LC.steps(ctl, 3, k => {
    let s = "";
    const ts = range(0, 1, 300), p = ts.map(t => LC.gauss(t, 0.5, 0.1) * Math.cos(2 * Math.PI * 12 * (t - 0.5)));
    const ys = range(-1, 1, 200), m = ys.map(y => Math.abs(y) < 0.25 ? Math.cos(y * 4.2) : Math.cos(1.05) * Math.exp(-6 * (Math.abs(y) - 0.25)));
    s += `<g opacity="${k === 1 ? 0.3 : 1}"><text class="th" x="150" y="22" text-anchor="middle">s(t)</text>` + C3.frame(30, 30, 240, 120, 0, 1, -1.1, 1.1, [], [], "time", "") + plot(30, 30, 240, 120, ts, p, 0, 1, -1.1, 1.1, "var(--blue)", 1.6) + `</g>`;
    s += `<g opacity="${k === 0 ? 0.3 : 1}"><text class="th" x="430" y="22" text-anchor="middle">J_m across the waveguide</text><rect x="${430 - 30}" y="30" width="60" height="120" fill="var(--blue-bg)"/>` + plot(310, 30, 240, 120, ys, m, -1, 1, -0.1, 1.1, "var(--coral)", 2) + `<text class="ts" x="430" y="168" text-anchor="middle">y across the strip</text></g>`;
    if (k === 2) s += `<text class="t" x="340" y="200" text-anchor="middle">J(r, t) = J_m(y, z) × s(t), on the input plane only</text>`;
    fig.innerHTML = svg(215, s);
    return cap[k];
  });
}}
],
summary: String.raw`The band is 101 wavelengths from 735 to 835 nm (359 to 408 THz), centred at 795 nm (377 THz). The source is a Gaussian pulse at 377 THz, short enough (a few fs) that its spectrum covers the band, so one run holds every wavelength. The pulse is the time part. The space part is the mode profile on the input plane.`,
sheet: [
[String.raw`\[ f = c/\lambda, \qquad f_0 \approx 377 \text{ THz} \]`, "Wavelength and frequency"],
[String.raw`\[ s(t) = e^{-(t-t_0)^2/2\tau^2}\cos\big(2\pi f_0(t-t_0)\big), \quad \tau = 1/(2\pi f_\mathrm{width}) \]`, "Gaussian pulse"],
[String.raw`\[ \mathbf{J}(\mathbf{r},t) = \mathbf{J}_m(y,z)\,s(t) \]`, "Source = space part times time part"]],
consts: "c = 299,792,458 m/s. Band 735 to 835 nm, 1 nm steps.",
sources: ["Tidy3D documentation, GaussianPulse (freq0, fwidth), Flexcompute", "Ch. 3 Sec. 3.4 of the thesis (101 wavelengths, 735 to 835 nm for the PBS)"]
});
