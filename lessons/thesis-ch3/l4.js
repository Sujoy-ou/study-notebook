addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l4", title: "Objective functions: mode overlap, band weights and the splitter FOM", short: "4. Objective functions",
big: "Every figure of merit in the thesis is built from one quantity: the power carried by one guided mode through a monitor plane. It is obtained by projecting the simulated field onto the mode, which gives a complex amplitude a<sub>m</sub>, and |a<sub>m</sub>|² is the fraction of the input power delivered into that mode. Power that ends up in other modes or radiates does not count. Optimizing at a single wavelength tends to produce narrow resonances, so the objectives of the gratings and the splitter are averaged over a band with Gaussian weights that sum to one. For the polarization splitter, two such averages are added, TE into the cross port and TM into the bar port, so the maximum is 2.",
bridge: "This is Ch. 3 Sec. 3.4, Eqs. (3.13) to (3.15), and the reported quantities of Sec. 3.7, Eq. (3.19). The overlap formula is the one in Tidy3D's mode data (components/data/utils.py, _dot_numpy). The mode profiles below come from the slab solver of Chapter 2, Lesson 2.",
cards: [
{s: "1. Mode overlap", t: "How much of the field is in the target mode",
intu: "The field arriving at the output plane is generally not a clean mode. It may be shifted, too wide or too narrow. The overlap integral measures how much of it looks like the mode. In the scalar picture, for fields traveling the same way in the same waveguide, Eq. (3.13) reduces to the normalized overlap of the two profiles. Here the target mode is the TE0 mode of a 2D guide (blue), and a Gaussian field (orange) arrives. Move and resize the field and watch the coupled fraction.",
eq: String.raw`\[ a_m = \frac{1}{4} \int_S \left( \mathbf{E} \times \mathbf{H}_m^{*} + \mathbf{E}_m^{*} \times \mathbf{H} \right) \cdot \hat{\mathbf{n}}\, dS, \qquad T_m = |a_m|^2 \]<div class="eqnote">scalar picture:</div>\[ T = \frac{\left| \int E\, m\, dy \right|^2}{\int |E|^2\, dy \int |m|^2\, dy} \]<div class="eqref">Ch. 3 Eq. (3.13)</div>`,
sym: [[String.raw`\(\mathbf{E}, \mathbf{H}\)`, "simulated fields on the monitor plane S"], [String.raw`\(\mathbf{E}_m, \mathbf{H}_m\)`, "fields of mode m from the mode solver at that plane, normalized to unit power"], [String.raw`\(\hat{\mathbf{n}}\)`, "normal of the plane"], [String.raw`\(T_m\)`, "fraction of the injected power in mode m, when the source is normalized to unit power"]],
how: ["Guided modes of a waveguide are orthogonal under this integral.", "So the field on the plane can be expanded in modes, and a_m picks out one coefficient.", "With unit-power normalization, |a_m|² is directly a power fraction.", "In the scalar picture, H follows from E through the same impedance for both, and the integral becomes the profile overlap."],
say: "The transmission into a mode is the squared magnitude of the overlap of the simulated field with that mode, normalized so that it is a fraction of the input power.",
num: "A centered Gaussian of 180 nm 1/e width reaches 0.996 here. The mode's own 1/e half-width is about 190 nm, and a shift of half that, about 95 nm, already costs about a quarter of the power.",
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Field offset (nm)", -400, 400, 5, 120) + sl("w", "Field 1/e width (nm)", 60, 600, 5, 180) + '<div class="readout" id="ro"></div>';
  const ys = range(-900, 900, 721), N = C2.slabN(3.0, 1.0, 400, 800, 0, "TE"), m = C2.slabProfile(3.0, 1.0, 400, 800, 0, "TE", N, ys).main;
  const u = () => {
    const d = +$("d").value, w = +$("w").value; $("dv").textContent = d; $("wv").textContent = w;
    const E = ys.map(y => Math.exp(-Math.pow((y - d) / w, 2)));
    let a = 0, b = 0, c = 0; ys.forEach((_, i) => { a += E[i] * m[i]; b += E[i] * E[i]; c += m[i] * m[i]; });
    const T = a * a / (b * c), X = C3.X(70, 560, -900, 900);
    let s = `<rect x="${X(-200)}" y="30" width="${X(200) - X(-200)}" height="170" fill="var(--blue-bg)" opacity="0.6"/><text class="ts" x="${X(0)}" y="46" text-anchor="middle">core, 400 nm</text>`;
    s += C3.frame(70, 30, 560, 170, -900, 900, 0, 1.05, [-800, -400, 0, 400, 800], [0, 0.5, 1], "position across the guide (nm)", "field") + plot(70, 30, 560, 170, ys, m, -900, 900, 0, 1.05, "#378ADD", 2.5) + plot(70, 30, 560, 170, ys, E, -900, 900, 0, 1.05, "#D85A30", 2.5);
    s += C3.legend(90, 250, [["target mode TE0", "#378ADD"], ["arriving field", "#D85A30"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>T into the mode</span><b>${T.toFixed(3)}</b></div><div><span>lost to other modes and radiation</span><b>${(1 - T).toFixed(3)}</b></div><div><span>mode index N</span><b>${N.toFixed(3)}</b></div>`;
  };
  $("d").oninput = u; $("w").oninput = u; u();
}},

{s: "2. Only the target mode", t: "Power in the wrong mode counts as loss",
intu: "A wider guide carries two modes, TE0 (even) and TE1 (odd). Suppose the arriving field is a mix of the two with all of the power guided. The total transmitted power is 1, yet the figure of merit only counts the TE0 part, cos²θ. This is intended: in a circuit, light in the wrong mode is lost at the next single-mode section. Change the mixing angle.",
eq: String.raw`\[ E = \cos\theta \cdot \mathrm{TE0} + \sin\theta \cdot \mathrm{TE1} \]\[ \Longrightarrow\quad T_{\mathrm{TE0}} = \cos^2\theta, \qquad T_{\mathrm{TE1}} = \sin^2\theta, \qquad T_{\mathrm{TE0}} + T_{\mathrm{TE1}} = 1 \]`,
sym: [[String.raw`\(\theta\)`, "mixing angle between the two modes"], ["TE0, TE1", "even and odd modes, orthogonal so their powers add"], [String.raw`\(T_{\mathrm{TE0}}\)`, "what the figure of merit sees"]],
how: ["The modes are orthogonal, so the overlap of TE1 with TE0 is zero.", "Projecting E onto TE0 keeps only the cos θ part.", "Its power is cos²θ.", "A flux monitor would report 1 here, which is why the thesis uses mode monitors for the figure of merit."],
say: "Projecting onto the target mode means that power carried by any other mode counts as loss, even though it is still guided.",
num: "At θ = 45° the guided power is 100 % but only half is in TE0, a 3 dB loss for the figure of merit.",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Mixing angle θ (°)", 0, 90, 1, 30) + '<div class="readout" id="ro"></div>';
  const ys = range(-900, 900, 721), n0 = C2.slabN(3.0, 1.0, 700, 800, 0, "TE"), n1 = C2.slabN(3.0, 1.0, 700, 800, 1, "TE");
  const m0 = C2.slabProfile(3.0, 1.0, 700, 800, 0, "TE", n0, ys).main, m1 = C2.slabProfile(3.0, 1.0, 700, 800, 1, "TE", n1, ys).main;
  const nrm = a => { const s = Math.sqrt(a.reduce((x, v) => x + v * v, 0)); return a.map(v => v / s); }, M0 = nrm(m0), M1 = nrm(m1);
  const u = () => {
    const th = +$("t").value * Math.PI / 180; $("tv").textContent = $("t").value;
    const E = M0.map((v, i) => Math.cos(th) * v + Math.sin(th) * M1[i]), mx = Math.max(...M0, ...M1.map(Math.abs), ...E.map(Math.abs));
    const X = C3.X(70, 560, -900, 900); let s = `<rect x="${X(-350)}" y="20" width="${X(350) - X(-350)}" height="170" fill="var(--blue-bg)" opacity="0.6"/>`;
    s += C3.frame(70, 20, 560, 170, -900, 900, -mx, mx, [-800, -400, 0, 400, 800], [], "position across the guide (nm)", "field") + `<line x1="70" x2="630" y1="105" y2="105" stroke="var(--b)"/>`;
    s += plot(70, 20, 560, 170, ys, M0, -900, 900, -mx, mx, "#378ADD", 1.5, "5 4") + plot(70, 20, 560, 170, ys, M1, -900, 900, -mx, mx, "#7F77DD", 1.5, "5 4") + plot(70, 20, 560, 170, ys, E, -900, 900, -mx, mx, "#D85A30", 2.5);
    s += C3.legend(80, 245, [["TE0", "#378ADD", "5 4"], ["TE1", "#7F77DD", "5 4"], ["arriving field", "#D85A30"]]);
    const T0 = Math.cos(th) ** 2;
    s += `<rect x="470" y="230" width="${150 * T0}" height="12" fill="#378ADD"/><rect x="${470 + 150 * T0}" y="230" width="${150 * (1 - T0)}" height="12" fill="#7F77DD"/>`;
    fig.innerHTML = svg(255, s);
    $("ro").innerHTML = `<div><span>T into TE0 (counted)</span><b>${T0.toFixed(3)}</b></div><div><span>T into TE1 (lost)</span><b>${(1 - T0).toFixed(3)}</b></div><div><span>total guided power</span><b>1.000</b></div>`;
  };
  $("t").oninput = u; u();
}},

{s: "3. Band weights", t: "Gaussian weights over a band of wavelengths",
intu: "Instead of one wavelength, the objective is a weighted average of the transmission at many wavelengths. The weights are a Gaussian centered at λ<sub>0</sub>, normalized so they sum to one, so the result is still a number between 0 and 1. The width σ sets how much the edges of the band matter. Some code writes the Gaussian as exp[−((λ − λ<sub>0</sub>)/σ<sub>c</sub>)²]. That is the same curve with σ = σ<sub>c</sub>/√2. Change σ and the number of wavelengths.",
eq: String.raw`\[ \bar{T} = \sum_i w_i\, T(\lambda_i), \qquad w_i = \frac{\exp\!\left[ -(\lambda_i - \lambda_0)^2/(2\sigma^2) \right]}{\sum_j \exp\!\left[ -(\lambda_j - \lambda_0)^2/(2\sigma^2) \right]} \]\[ \exp\!\left[ -\left( \frac{\lambda - \lambda_0}{\sigma_c} \right)^2 \right] \quad\Longleftrightarrow\quad \sigma = \sigma_c/\sqrt{2} \]<div class="eqref">Ch. 3 Eq. (3.14)</div>`,
sym: [[String.raw`\(\lambda_i\)`, "sampled wavelengths"], [String.raw`\(\lambda_0\)`, "center wavelength, 795 nm for the quantum dots of the thesis"], [String.raw`\(\sigma\)`, "standard deviation of the Gaussian"], [String.raw`\(\sigma_c\)`, "width parameter of the alternative form"], [String.raw`\(w_i\)`, "normalized weights, Σ w_i = 1"]],
how: ["Choose the band and sample it.", "Give each sample a Gaussian weight around λ₀.", "Normalize so the weights sum to one: T̄ is a weighted mean.", "Matching exponents: (λ − λ₀)²/(2σ²) = (λ − λ₀)²/σ_c² gives σ = σ_c/√2."],
say: "The broadband objective is a weighted mean of the transmission, with Gaussian weights centered at the design wavelength that sum to one.",
num: "Example: σ<sub>c</sub> = 12 nm is σ = 8.5 nm. The full width at half maximum of the weights is 2.355σ.",
r(fig, ctl) {
  ctl.innerHTML = sl("s", "σ (nm)", 3, 40, 0.5, 8) + sl("n", "Number of wavelengths", 5, 101, 2, 31) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const sg = +$("s").value, n = +$("n").value; $("sv").textContent = sg; $("nv").textContent = n;
    const ls = range(745, 845, n), w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S), mx = Math.max(...w);
    const X = C3.X(70, 560, 745, 845), Y = C3.Y(30, 180, 0, mx * 1.1), bw = Math.max(1, 560 / n * 0.7);
    let s = C3.frame(70, 30, 560, 180, 745, 845, 0, mx * 1.1, [745, 770, 795, 820, 845], [0, mx], "wavelength (nm)", "weight wᵢ", v => v, v => v.toFixed(3));
    ls.forEach((l, i) => s += `<rect x="${X(l) - bw / 2}" y="${Y(w[i])}" width="${bw}" height="${210 - Y(w[i])}" fill="#378ADD" opacity="0.8"/>`);
    s += `<line x1="${X(795 - 1.1774 * sg)}" x2="${X(795 + 1.1774 * sg)}" y1="${Y(mx / 2)}" y2="${Y(mx / 2)}" stroke="#D85A30" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${X(795 + 1.2 * sg) + 8}" y="${Y(mx / 2) + 4}">FWHM ${(2.355 * sg).toFixed(1)} nm</text>`;
    fig.innerHTML = svg(250, s);
    $("ro").innerHTML = `<div><span>Σ wᵢ</span><b>${w.reduce((a, b) => a + b, 0).toFixed(3)}</b></div><div><span>equivalent σ_c</span><b>${(sg * Math.SQRT2).toFixed(1)} nm</b></div><div><span>weight at λ₀</span><b>${mx.toFixed(4)}</b></div>`;
  };
  $("s").oninput = u; $("n").oninput = u; u();
}},

{s: "4. Why a band", t: "A narrow resonance wins at one wavelength and loses over a band",
intu: "Two imagined designs. Design A has a sharp resonance that reaches 1.0 exactly at λ<sub>0</sub>. Design B is flat and broad but only reaches 0.85. A single-wavelength objective prefers A. The band-weighted objective prefers B once σ is a few nanometers, because the resonance is gone a few nanometers away. Quantum dot emission wavelengths differ from dot to dot and fabrication shifts the response, so B is the useful device. Change σ.",
eq: String.raw`\[ \bar{T}_A = \sum w_i\, T_A(\lambda_i) \quad \text{versus} \quad \bar{T}_B = \sum w_i\, T_B(\lambda_i) \]`,
sym: [[String.raw`\(T_A\)`, "narrow Lorentzian resonance, peak 1.0, 4 nm wide (illustration)"], [String.raw`\(T_B\)`, "broad response, peak 0.85, 80 nm wide (illustration)"], [String.raw`\(\sigma\)`, "width of the weights"]],
how: ["At σ → 0 the average equals the value at λ₀: A wins.", "As σ grows, A's average falls quickly because most weight sits outside its peak.", "B's average hardly changes.", "So band weighting steers the optimizer away from fragile resonances."],
say: "Averaging over a band with Gaussian weights steers the optimizer away from narrow resonances toward broadband designs.",
num: "Ch. 3 states the motivation directly: optimizing at a single wavelength tends to produce narrow resonances.",
r(fig, ctl) {
  ctl.innerHTML = sl("s", "σ (nm)", 0.5, 40, 0.5, 8) + '<div class="readout" id="ro"></div>';
  const ls = range(735, 855, 241), TA = l => 1 / (1 + Math.pow((l - 795) / 2, 2)), TB = l => 0.85 * Math.exp(-Math.pow((l - 795) / 48, 2));
  const u = () => {
    const sg = +$("s").value; $("sv").textContent = sg;
    const w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S);
    let A = 0, B = 0; ls.forEach((l, i) => { A += w[i] * TA(l); B += w[i] * TB(l); });
    const mw = Math.max(...w0);
    let s = C3.frame(70, 30, 560, 180, 735, 855, 0, 1.05, [735, 765, 795, 825, 855], [0, 0.5, 1], "wavelength (nm)", "T") + plot(70, 30, 560, 180, ls, w0.map(v => v / mw), 735, 855, 0, 1.05, "#EF9F27", 1.5, "4 3");
    s += plot(70, 30, 560, 180, ls, ls.map(TA), 735, 855, 0, 1.05, "#D85A30", 2.5) + plot(70, 30, 560, 180, ls, ls.map(TB), 735, 855, 0, 1.05, "#378ADD", 2.5);
    s += C3.legend(80, 250, [["design A, resonance", "#D85A30"], ["design B, broad", "#378ADD"], ["weights (scaled)", "#EF9F27", "4 3"]]);
    fig.innerHTML = svg(260, s);
    $("ro").innerHTML = `<div><span>T̄ of A</span><b>${A.toFixed(3)}</b></div><div><span>T̄ of B</span><b>${B.toFixed(3)}</b></div><div><span>preferred</span><b>${A > B ? "A" : "B"}</b></div>`;
  };
  $("s").oninput = u; u();
}},

{s: "5. Splitter objective", t: "The polarization splitter: two transmissions added",
intu: "A polarization beam splitter must send TE<sub>0</sub> to the cross port and TM<sub>0</sub> to the bar port. The figure of merit adds the two band-weighted transmissions, so its maximum is 2. Leakage into the wrong port is not penalized directly, since power in the wrong port cannot be in the right one. The reported quantities are the extinction ratio, how much more power goes to the intended port than to the other, and the insertion loss. Set the four transmissions.",
eq: String.raw`\[ \mathrm{FOM} = \sum_i w_i\, T_{\mathrm{TE}\to\mathrm{cross}}(\lambda_i) + \sum_i w_i\, T_{\mathrm{TM}\to\mathrm{bar}}(\lambda_i) \]\[ \mathrm{ER} = 10 \log_{10}\frac{T_{\mathrm{target}}}{T_{\mathrm{leak}}}, \qquad \mathrm{IL} = -10 \log_{10} T_{\mathrm{target}} \]<div class="eqref">Ch. 3 Eq. (3.15) and Eq. (3.19)</div>`,
sym: [[String.raw`\(T_{\mathrm{TE}\to\mathrm{cross}}\)`, "TE₀ input reaching the cross port in TE₀"], [String.raw`\(T_{\mathrm{TM}\to\mathrm{bar}}\)`, "TM₀ input reaching the bar port in TM₀"], [String.raw`\(T_{\mathrm{leak}}\)`, "power in the other port"], [String.raw`\(\mathrm{ER}\)`, "extinction ratio in dB"], [String.raw`\(\mathrm{IL}\)`, "insertion loss in dB"]],
how: ["Each polarization is a separate input, so each needs its own forward and adjoint runs.", "Each term is a band-weighted mode transmission (cards 1 and 3).", "Adding them treats both polarizations as equally important.", "Energy conservation T_target + T_leak + losses = 1 means maximizing T_target already pushes T_leak down."],
say: "The splitter figure of merit is the sum of the band-weighted transmissions of TE into the cross port and TM into the bar port, with a maximum of 2.",
num: "Example: T<sub>target</sub> = 0.9 and T<sub>leak</sub> = 0.01 give IL = 0.46 dB and ER = 19.5 dB. The thesis defines the operating band as the range where both polarizations reach T<sub>target</sub> ≥ 0.8.",
r(fig, ctl) {
  ctl.innerHTML = sl("a", "TE → cross (target)", 0, 1, 0.01, 0.9) + sl("b", "TE → bar (leak)", 0, 1, 0.005, 0.02) + sl("c", "TM → bar (target)", 0, 1, 0.01, 0.85) + sl("d", "TM → cross (leak)", 0, 1, 0.005, 0.04) + '<div class="readout" id="ro"></div>';
  const u = () => {
    let a = +$("a").value, b = +$("b").value, c = +$("c").value, d = +$("d").value;
    if (a + b > 1) { b = Math.max(0, 1 - a); $("b").value = b; } if (c + d > 1) { d = Math.max(0, 1 - c); $("d").value = d; }
    $("av").textContent = a.toFixed(2); $("bv").textContent = b.toFixed(3); $("cv").textContent = c.toFixed(2); $("dv").textContent = d.toFixed(3);
    const W = v => 1 + 14 * v;
    let s = `<rect x="250" y="70" width="180" height="110" rx="6" fill="var(--sunk)" stroke="var(--p)"/><text class="th" x="340" y="130" text-anchor="middle">PBS</text>`;
    s += `<path d="M40 125 L250 125" stroke="var(--p)" stroke-width="16" stroke-opacity="0.15"/><text class="ts" x="40" y="110">input: TE₀ and TM₀</text>`;
    s += `<path d="M430 90 L640 60" stroke="var(--p)" stroke-width="34" stroke-opacity="0.12"/><path d="M430 160 L640 190" stroke="var(--p)" stroke-width="34" stroke-opacity="0.15"/><text class="ts" x="640" y="34" text-anchor="end">bar port</text><text class="ts" x="640" y="228" text-anchor="end">cross port</text>`;
    s += `<path d="M430 166 L640 196" stroke="#378ADD" stroke-width="${W(a)}" opacity="0.85"/><path d="M430 154 L640 184" stroke="#D85A30" stroke-width="${W(d)}" opacity="0.85" stroke-dasharray="6 4"/>`;
    s += `<path d="M430 84 L640 54" stroke="#D85A30" stroke-width="${W(c)}" opacity="0.85"/><path d="M430 96 L640 66" stroke="#378ADD" stroke-width="${W(b)}" opacity="0.85" stroke-dasharray="6 4"/>`;
    s += C3.legend(40, 250, [["TE₀", "#378ADD"], ["TM₀", "#D85A30"], ["leak", "var(--p)", "6 4"]]);
    fig.innerHTML = svg(255, s);
    const er = (t, l) => l > 0 ? (10 * Math.log10(t / l)).toFixed(1) + " dB" : "∞", il = t => t > 0 ? (-10 * Math.log10(t)).toFixed(2) + " dB" : "∞";
    $("ro").innerHTML = `<div><span>FOM (max 2)</span><b>${(a + c).toFixed(3)}</b></div><div><span>TE: ER / IL</span><b>${er(a, b)} / ${il(a)}</b></div><div><span>TM: ER / IL</span><b>${er(c, d)} / ${il(c)}</b></div>`;
  };
  ["a", "b", "c", "d"].forEach(k => $(k).oninput = u); u();
}},

{s: "6. Objective sets the adjoint source", t: "Which wavelengths drive the adjoint run",
intu: "The adjoint source amplitude at each frequency is ∂J/∂a<sub>m</sub>. For a band-weighted objective J = Σw<sub>i</sub>|a<sub>i</sub>|² this is proportional to w<sub>i</sub>a<sub>i</sub>*. So a wavelength drives the adjoint run strongly when it has a large weight and the device already sends some light into the mode there. Below, a current transmission spectrum (blue) and the weights (orange) give the adjoint amplitudes (bars). Shift the spectrum and change σ.",
eq: String.raw`\[ J = \sum_i w_i\, |a_m(\lambda_i)|^2 \quad\Longrightarrow\quad \frac{\partial J}{\partial a_m(\lambda_i)} \propto w_i\, a_m^{*}(\lambda_i) \]\[ |\text{amplitude}| \propto w_i \sqrt{T_i} \]`,
sym: [[String.raw`\(a_m(\lambda_i)\)`, "mode amplitude at wavelength i"], [String.raw`\(w_i\)`, "band weight"], [String.raw`\(a^{*}\)`, "complex conjugate, the time reversal of Lesson 2 card 6"]],
how: ["J depends on each a_i through w_i a_i a_i*.", "Its derivative with respect to a_i, holding a_i* fixed, is w_i a_i*.", "Tidy3D uses this as the adjoint source amplitude, with its own constant factors.", "This is the 1D result conj(E_out) of Lesson 2, now per frequency and per mode."],
say: "The adjoint source of each frequency is proportional to its band weight times the conjugate mode amplitude, so the objective decides which wavelengths drive the gradient.",
num: "A wavelength with zero weight contributes nothing to the gradient, however the device behaves there.",
r(fig, ctl) {
  ctl.innerHTML = sl("c", "Spectrum peak (nm)", 760, 830, 1, 805) + sl("s", "σ of the weights (nm)", 3, 30, 0.5, 10);
  const u = () => {
    const pc = +$("c").value, sg = +$("s").value; $("cv").textContent = pc; $("sv").textContent = sg;
    const ls = range(755, 835, 33), T = ls.map(l => 0.8 * Math.exp(-Math.pow((l - pc) / 25, 2))), w0 = ls.map(l => Math.exp(-Math.pow(l - 795, 2) / (2 * sg * sg))), S = w0.reduce((a, b) => a + b, 0), w = w0.map(v => v / S);
    const amp = ls.map((_, i) => w[i] * Math.sqrt(T[i])), ma = Math.max(...amp), mw = Math.max(...w);
    const X = C3.X(70, 560, 755, 835), Y = C3.Y(30, 180, 0, 1.05);
    let s = C3.frame(70, 30, 560, 180, 755, 835, 0, 1.05, [755, 775, 795, 815, 835], [0, 0.5, 1], "wavelength (nm)", "scaled");
    ls.forEach((l, i) => s += `<rect x="${X(l) - 5}" y="${Y(amp[i] / ma)}" width="10" height="${210 - Y(amp[i] / ma)}" fill="#7F77DD" opacity="0.75"/>`);
    s += plot(70, 30, 560, 180, ls, T, 755, 835, 0, 1.05, "#378ADD", 2.5) + plot(70, 30, 560, 180, ls, w.map(v => v / mw), 755, 835, 0, 1.05, "#EF9F27", 2, "4 3");
    s += C3.legend(80, 250, [["T(λ) now", "#378ADD"], ["weights (scaled)", "#EF9F27", "4 3"]]) + `<rect x="380" y="240" width="12" height="12" fill="#7F77DD"/><text class="ts" x="398" y="250">adjoint amplitude (scaled)</text>`;
    fig.innerHTML = svg(260, s);
  };
  $("c").oninput = u; $("s").oninput = u; u();
}}
],
summary: "Every figure of merit is a mode transmission T_m = |a_m|², with a_m the overlap of the simulated field with the mode at the monitor, normalized to unit power. Power in other modes or radiated counts as loss. Objectives are averaged over a band with normalized Gaussian weights, which steers the optimizer away from narrow resonances. The polarization splitter adds TE into the cross port and TM into the bar port, maximum 2, and is reported with extinction ratio and insertion loss. The objective also fixes the adjoint source: at each frequency its amplitude is proportional to w_i a_i*.",
sheet: [
[String.raw`\[ a_m = \frac{1}{4} \int_S \left( \mathbf{E} \times \mathbf{H}_m^{*} + \mathbf{E}_m^{*} \times \mathbf{H} \right) \cdot \hat{\mathbf{n}}\, dS, \qquad T_m = |a_m|^2 \]`, "Mode overlap (Ch. 3 Eq. 3.13)"],
[String.raw`\[ \bar{T} = \sum w_i\, T(\lambda_i), \qquad w_i \propto \exp\!\left[ -(\lambda_i - \lambda_0)^2/(2\sigma^2) \right], \qquad \sum w_i = 1 \]`, "Band weights (Ch. 3 Eq. 3.14)"],
[String.raw`\[ \sigma = \sigma_c/\sqrt{2} \]`, "Converting the alternative Gaussian form"],
[String.raw`\[ \mathrm{FOM} = \sum w_i\, T_{\mathrm{TE}\to\mathrm{cross}} + \sum w_i\, T_{\mathrm{TM}\to\mathrm{bar}} \le 2 \]`, "Splitter objective (Ch. 3 Eq. 3.15)"],
[String.raw`\[ \mathrm{ER} = 10 \log_{10}(T_{\mathrm{target}}/T_{\mathrm{leak}}), \qquad \mathrm{IL} = -10 \log_{10} T_{\mathrm{target}} \]`, "Reported quantities (Ch. 3 Eq. 3.19)"],
[String.raw`\[ \text{adjoint amplitude} \propto w_i\, a_m^{*}(\lambda_i) \]`, "Objective to adjoint source"]],
consts: "Mode profiles: 2D slab guides with core index 3.0 in air at 800 nm. The spectra in cards 4 and 6 are illustrations.",
sources: ["Flexcompute, Tidy3D 2.11.2 source: components/data/utils.py _dot_numpy (mode overlap), ModeData._adjoint_source_amp", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (figure of merit from mode overlap, adjoint source from ∂F/∂x)"]
});
