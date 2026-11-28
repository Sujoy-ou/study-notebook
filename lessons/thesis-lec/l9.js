addLesson("fdtd", "lec", {
level: "Forward", num: "Lesson 9",
id: "thesis-lec-l9", title: "Mode overlap and the figure of merit", short: "9. Overlap and FOM",
big: String.raw`At each wavelength, the mode monitor compares the field on the port with the port's own mode. The overlap gives a complex amplitude \(a\), and because modes and sources are normalized to 1 W, \(T = |a|^2\) is the fraction of the input power that arrived in that mode. The PBS needs two such numbers: TE\(_0\) in, how much reaches the TE port, and TM\(_0\) in, how much reaches the TM port. Each is averaged over the 101 wavelengths with Gaussian weights centred at 795 nm, and the two averages are added. The figure of merit is at most 2.`,
bridge: "Thesis Ch. 3 Sec. 3.4: Eq. (3.12) mode overlap, Eq. (3.13) weights, Eq. (3.14) PBS figure of merit. The topology stage also subtracts an erosion and dilation penalty (Ch. 3 Sec. 3.5).",
cards: [
{s: "1. Mode overlap", t: "How much of the port field is the port mode",
intu: String.raw`The field arriving at the TE port is not always a clean TE\(_0\) mode. Here it is a mix of the mode (blue) and something else (light that will not stay guided, orange). Move the sliders. The overlap with the mode picks out only the mode part. \(T = |a|^2\) is the power carried by the mode. The rest of the field does not count, however strong it looks.`,
eq: String.raw`\[ a_m = \frac14\int_S \big(\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*}\big)\cdot\hat{\mathbf{n}}\,dS, \qquad T_m = |a_m|^2 \]<div class="eqref">Ch. 3 Eq. (3.12)</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "simulated field on the monitor plane, at one wavelength"], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, "the port mode, normalized to 1 W"], [String.raw`\(T_m\)`, "fraction of the input power in mode m"]],
how: ["Take the field on the monitor plane at one wavelength.", "Project it onto the port mode: the overlap integral.", "Mode and source are both 1 W, so the squared amplitude is a power fraction."],
say: "The mode overlap projects the field on the port onto the port mode, and because both are normalized to 1 W, the squared amplitude is the fraction of the power that arrived in that mode.",
num: "Done at every one of the 101 wavelengths, for each port.",
r(fig, ctl) {
  ctl.innerHTML = sl("cm", "Mode part", 0, 1, 0.01, 0.8) + sl("co", "Other part", 0, 1, 0.01, 0.4) + `<div class="readout" id="ro"></div>`;
  const ys = range(-1, 1, 300), m = ys.map(y => Math.abs(y) < 0.2 ? Math.cos(y * 5) : Math.cos(1) * Math.exp(-5 * (Math.abs(y) - 0.2))), o = ys.map(y => Math.sin(3 * y) * Math.exp(-y * y));
  const nm = Math.sqrt(m.reduce((a, v) => a + v * v, 0)), no = Math.sqrt(o.reduce((a, v) => a + v * v, 0)), mn = m.map(v => v / nm * 12), on = o.map(v => v / no * 12);
  const u = () => {
    const a = +$("cm").value, b = +$("co").value; $("cmv").textContent = a.toFixed(2); $("cov").textContent = b.toFixed(2);
    const f = ys.map((_, i) => a * mn[i] + b * on[i]);
    let s = `<rect x="${340 - 0.2 * 280}" y="20" width="${0.4 * 280}" height="170" fill="var(--blue-bg)"/><line x1="60" x2="620" y1="105" y2="105" stroke="var(--b)"/>`;
    s += plot(60, 20, 560, 170, ys, ys.map((_, i) => a * mn[i]), -1, 1, -1.3, 1.3, "var(--blue)", 1.5, "4 3") + plot(60, 20, 560, 170, ys, ys.map((_, i) => b * on[i]), -1, 1, -1.3, 1.3, "var(--coral)", 1.5, "4 3") + plot(60, 20, 560, 170, ys, f, -1, 1, -1.3, 1.3, "var(--fg)", 2.4);
    s += C3.legend(70, 216, [["field on the port", "var(--fg)"], ["mode part", "var(--blue)", "4 3"], ["other part", "var(--coral)", "4 3"]]);
    fig.innerHTML = svg(228, s);
    $("ro").innerHTML = `<div><span>T = |a|², power in the mode</span><b>${(a * a).toFixed(2)}</b></div><div><span>power in the rest</span><b>${(b * b).toFixed(2)}</b></div>`;
  };
  $("cm").oninput = u; $("co").oninput = u; u();
}},
{s: "2. The figure of merit", t: "101 wavelengths, Gaussian weights, two polarizations",
intu: String.raw`The curves are made-up example spectra, \(T_\mathrm{TE\to TE\,port}(\lambda)\) and \(T_\mathrm{TM\to TM\,port}(\lambda)\), not results. The bars are the weights: a Gaussian centred at 795 nm with width \(\sigma\), normalized so they add up to 1. The figure of merit is the weighted average of each curve, added together, so its maximum is 2. Move the sliders: a narrow \(\sigma\) only cares about the centre, a wide one rewards flat spectra. The PBS uses \(\sigma = 8\) nm.`,
eq: String.raw`\[ \mathrm{FOM} = \sum_{j} w_j\, T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda_j) + \sum_{j} w_j\, T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda_j) \]\[ w_j = \frac{e^{-(\lambda_j-\lambda_0)^2/2\sigma^2}}{\sum_k e^{-(\lambda_k-\lambda_0)^2/2\sigma^2}} \]<div class="eqref">Ch. 3 Eqs. (3.13) and (3.14)</div>`,
sym: [[String.raw`\(w_j\)`, "weight of wavelength j, all weights add to 1"], [String.raw`\(\sigma\)`, "width of the weights, 8 nm for the PBS"], ["FOM", "between 0 and 2"]],
how: ["Compute T at each of the 101 wavelengths, for each input.", "Weight them with a normalized Gaussian around 795 nm.", "Add the TE average and the TM average.", "The topology stage subtracts a fabrication penalty from this."],
say: "The PBS figure of merit is the Gaussian-weighted average over 101 wavelengths of the TE transmission into the TE port plus that of the TM transmission into the TM port, with a maximum of 2.",
num: String.raw`101 wavelengths, 735 to 835 nm, \(\lambda_0 = 795\) nm, \(\sigma = 8\) nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "Weight width σ (nm)", 2, 50, 1, 8) + sl("pk", "Example: TE peak (nm)", 760, 830, 1, 800) + `<div class="readout" id="ro"></div>`;
  const ls = range(735, 835, 101);
  const u = () => {
    const sg = +$("sg").value, pk = +$("pk").value; $("sgv").textContent = sg; $("pkv").textContent = pk;
    const wr = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = wr.reduce((a, v) => a + v, 0), w = wr.map(v => v / S);
    const te = ls.map(l => 0.95 * Math.exp(-Math.pow((l - pk) / 45, 2))), tm = ls.map(l => 0.88 - 0.0004 * Math.pow(l - 790, 2) / 4);
    const fte = te.reduce((a, v, i) => a + v * w[i], 0), ftm = tm.reduce((a, v, i) => a + v * w[i], 0);
    const mw = Math.max(...w), X = C3.X(70, 560, 735, 835);
    let s = C3.frame(70, 20, 560, 170, 735, 835, 0, 1.05, [735, 765, 795, 825], [0, 0.5, 1], "wavelength (nm)", "T and weights");
    ls.forEach((l, i) => { const h = w[i] / mw * 80; s += `<rect x="${X(l) - 2}" y="${190 - h}" width="4" height="${h}" fill="var(--purple)" opacity="0.45"/>`; });
    s += plot(70, 20, 560, 170, ls, te, 735, 835, 0, 1.05, "var(--blue)", 2.2) + plot(70, 20, 560, 170, ls, tm, 735, 835, 0, 1.05, "var(--coral)", 2.2);
    s += C3.legend(80, 240, [["example TE → TE port", "var(--blue)"], ["example TM → TM port", "var(--coral)"], ["weights", "var(--purple)"]]);
    fig.innerHTML = svg(252, s);
    $("ro").innerHTML = `<div><span>weighted TE</span><b>${fte.toFixed(3)}</b></div><div><span>weighted TM</span><b>${ftm.toFixed(3)}</b></div><div><span>FOM (max 2)</span><b>${(fte + ftm).toFixed(3)}</b></div>`;
  };
  $("sg").oninput = u; $("pk").oninput = u; u();
}},
{s: "3. Two inputs", t: "Two forward runs per evaluation",
intu: String.raw`The figure of merit needs both polarizations, and one simulation can only launch one of them. So each evaluation has two forward runs. Step through: the TE\(_0\) run is measured at the TE port, the TM\(_0\) run at the TM port. Each run gives its transmission at all 101 wavelengths. Together they give the figure of merit. In Lesson 11 each of these runs gets its own adjoint run.`,
eq: String.raw`\[ \text{run 1: TE}_0 \text{ in} \rightarrow a_\mathrm{TE}(\lambda_j) \text{ at the TE port}, \qquad \text{run 2: TM}_0 \text{ in} \rightarrow a_\mathrm{TM}(\lambda_j) \text{ at the TM port} \]`,
sym: [[String.raw`\(a_\mathrm{TE}, a_\mathrm{TM}\)`, "mode amplitudes at the target ports, 101 values each"]],
how: ["Run 1: TE mode source, read the TE port monitor.", "Run 2: TM mode source, read the TM port monitor.", "Square, weight, sum: the figure of merit."],
say: "Each evaluation of the PBS figure of merit takes two forward runs, one per input polarization, each giving its port transmission at all 101 wavelengths.",
num: "2 forward runs per evaluation, plus 2 adjoint runs for the gradient: 4 runs per optimization step.",
r(fig, ctl) {
  const cap = ["Run 1: TE0 enters. The TE port monitor gives a_TE at all 101 wavelengths.", "Run 2: TM0 enters. The TM port monitor gives a_TM at all 101 wavelengths.", "Square, weight and add: one number, the figure of merit (at most 2)."];
  LC.steps(ctl, 3, k => { fig.innerHTML = LC.pbs(k === 0 ? ["design", "src", "mon", "fwd"] : k === 1 ? ["design", "src", "mon", "fwdTM"] : ["design", "src", "mon", "fwd", "fwdTM"], { note: ["TE run", "TM run", "FOM = Σ w T_TE + Σ w T_TM"][k] }); return cap[k]; });
}}
],
summary: String.raw`At each wavelength the mode monitor projects the port field onto the port mode, Eq. (3.12), and \(T = |a|^2\) is the fraction of the 1 W input in that mode. The PBS figure of merit adds the Gaussian-weighted averages (\(\sigma = 8\) nm around 795 nm) of TE into the TE port and TM into the TM port, at most 2. That takes two forward runs, one per input polarization.`,
sheet: [
[String.raw`\[ a_m = \tfrac14\int_S (\mathbf{E}_m^{*}\times\mathbf{H} + \mathbf{E}\times\mathbf{H}_m^{*})\cdot\hat{\mathbf{n}}\,dS, \quad T = |a_m|^2 \]`, "Mode overlap (Ch. 3 Eq. 3.12)"],
[String.raw`\[ \mathrm{FOM} = \sum_j w_j T_{\mathrm{TE}}(\lambda_j) + \sum_j w_j T_{\mathrm{TM}}(\lambda_j) \]`, "PBS figure of merit (Ch. 3 Eq. 3.14)"]],
consts: "Example spectra in card 2 are invented for illustration only.",
sources: ["Tidy3D documentation: ModeMonitor and mode amplitudes, Flexcompute", "Ch. 3 Sec. 3.4 of the thesis, Eqs. (3.12) to (3.14)"]
});
