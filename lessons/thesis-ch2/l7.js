/* TODO for this lesson: Thesis Sec. 2.5 second half. Rewrite big/bridge/summary/sheet. */
addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l7", title: "Two-mode interference and polarization splitting", short: "7. Two-mode interference, PBS",
big: "A wide waveguide carries many lateral modes, and their propagation constants depend almost exactly on the square of the mode number. Because of that, all modes come back into step at regular distances, and the input field reappears there as an image. This is self-imaging. With only two modes the light simply swaps sides every beat length. Since the beat length differs for TE-like and TM-like light, one length can send them to opposite outputs: a polarization splitter. Long sections are narrowband and sensitive to width.",
bridge: "Everything here follows Soldano and Pennings 1995, an invited review of multimode interference devices from Delft and Philips. It derives the imaging lengths, classifies general, paired and two-mode interference, and works out tolerances. The maps below are computed live from their Eqs. (1) to (18).",
cards: [
/* NEW CARD: Two-mode interference Eq. 2.14 and L_pi = lambda0 / 2(n0 - n1) Eq. 2.15, narrow sections need the mode solver not the quadratic law */
{s: "1. Two modes only", t: "TODO: Two-mode interference Eq. 2.14 and L_pi = lambda0 / 2(n0 - n1) Eq. 2.15, narrow sections need the mode solver not the quadratic law", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* from old ch2 L7 card 5 */
{s: "5. Splitting TE and TM", t: "Two-mode interference and polarization splitting",
intu: String.raw`Keep only the two lowest modes. Then the light just swaps from one side to the other every beat length \(L_\pi\): the even and odd mode add on one side and cancel on the other, and every \(L_\pi\) the odd mode flips sign. TE-like and TM-like light have different beat lengths, because \(L_\pi\) depends on the index and the effective width. Pick a section length where one polarization has crossed an odd number of times (cross port) and the other an even number (bar port), and the section splits polarizations. Drag the length and the TM/TE beat length ratio.`,
eq: String.raw`\[ \Psi(y, x) = c_0\psi_0 + c_1\psi_1\, e^{j\pi x/L_\pi} \qquad L_\pi = \frac{\lambda_0}{2(n_0 - n_1)} \]<div class="eqnote">splitter</div>\[ L = p\, L_\pi^{\mathrm{TE}} = q\, L_\pi^{\mathrm{TM}}, \quad p \text{ and } q \text{ of opposite parity} \]<div class="eqref">Ch. 2 Eqs. 2.14, 2.15</div>`,
sym: [[String.raw`\(n_0, n_1\)`, "effective indices of the two lowest modes of the section, from a mode solver"], [String.raw`\(p, q\)`, "number of crossings for TE and TM"], ["bar port", "output on the input side (even number of crossings)"], ["cross port", "output on the opposite side (odd)"]],
how: [String.raw`With two modes, the phase difference grows as \(\pi x/L_\pi\).`, String.raw`At \(x = L_\pi\) the odd mode has flipped sign, moving the light to the mirror side.`, String.raw`TE and TM have different \(n_0 - n_1\), so different \(L_\pi\).`, String.raw`Choose \(L\) so the two polarizations end with opposite parity. Soldano notes the different imaging lengths of TE and TM as a problem for couplers, a splitter uses it on purpose.`],
say: "In two-mode interference the light crosses the section once per beat length. Because TE-like and TM-like light have different beat lengths, a length that is an odd multiple for one and an even multiple for the other separates them.",
num: String.raw`Ratio \(L_\pi^{\mathrm{TM}}/L_\pi^{\mathrm{TE}} = 1.5\): \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\) (\(p = 3\) odd, \(q = 2\) even): TE to cross, TM to bar.<br>The closer the ratio is to 1, the longer the device must be.`,
r(fig, ctl) {
  ctl.innerHTML = sl("r", "L_π(TM) / L_π(TE)", 1.05, 2.5, 0.01, 1.5) + sl("L", "Section length in units of L_π(TE)", 0.2, 8, 0.01, 3) + `<div class="row"><button id="best">Find shortest splitter</button></div><div class="readout" id="ro"></div>`;
  const draw = (ctx, img, W, H, y0, Lpi, Ltot, row) => {
    const ys = range(-0.5, 0.5, H), wi = 0.08, inp = ys.map(y => Math.exp(-Math.pow((y - y0) / wi, 2)));
    const p0 = ys.map(y => Math.cos(Math.PI * y)), p1 = ys.map(y => Math.sin(2 * Math.PI * y));
    let a0 = 0, a1 = 0, n0 = 0, n1 = 0; inp.forEach((v, i) => { a0 += v * p0[i]; a1 += v * p1[i]; n0 += p0[i] ** 2; n1 += p1[i] ** 2; }); a0 /= n0; a1 /= n1;
    for (let i = 0; i < W; i++) { const x = i / (W - 1) * Ltot; for (let j = 0; j < H; j++) { const ph = Math.PI * x / Lpi; const re = a0 * p0[j] + a1 * p1[j] * Math.cos(ph), im = a1 * p1[j] * Math.sin(ph); const v = Math.min(1, Math.sqrt(re * re + im * im)); const [r, g, b] = C2.heat(v); const o = ((row + (H - 1 - j)) * W + i) * 4; img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; } }
    const ph = Math.PI * Ltot / Lpi; let top = 0, bot = 0; ys.forEach((y, j) => { const re = a0 * p0[j] + a1 * p1[j] * Math.cos(ph), im = a1 * p1[j] * Math.sin(ph); const v = re * re + im * im; if (y > 0) top += v; else bot += v; });
    return top / (top + bot);
  };
  const u = () => {
    const r = +$("r").value, L = +$("L").value; $("rv").textContent = r.toFixed(2); $("Lv").textContent = L.toFixed(2);
    const W = 300, H = 50, G = 8;
    const { ctx, img } = C2.canvas(fig, W, 2 * H + G, 2.2, "top: TE-like, bottom: TM-like. Input on the upper side (y₀ = +W/4). Light moving left to right.");
    for (let k = 0; k < W * G; k++) { const o = (H * W + k) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = 255; }
    const fTE = draw(ctx, img, W, H, 0.25, 1, L, 0), fTM = draw(ctx, img, W, H, 0.25, r, L, H + G);
    ctx.putImageData(img, 0, 0);
    const port = f => f > 0.5 ? "bar" : "cross";
    $("ro").innerHTML = `<div><span>TE-like exits</span><b>${port(fTE)} (${(Math.max(fTE, 1 - fTE) * 100).toFixed(0)} %)</b></div><div><span>TM-like exits</span><b>${port(fTM)} (${(Math.max(fTM, 1 - fTM) * 100).toFixed(0)} %)</b></div><div><span>split?</span><b>${port(fTE) !== port(fTM) && Math.min(Math.max(fTE, 1 - fTE), Math.max(fTM, 1 - fTM)) > 0.9 ? "yes" : "no"}</b></div>`;
  };
  $("best").onclick = () => { const r = +$("r").value; let best = null; for (let p = 1; p <= 8 && !best; p++) for (let q = 1; q <= 8; q++) if ((p + q) % 2 === 1 && Math.abs(p / q - r) < 0.04) { best = p; break; } if (best) { $("L").value = best; } u(); };
  $("r").oninput = u; $("L").oninput = u; u();
}},

/* NEW CARD: L = p L_pi^TE = q L_pi^TM with p, q of opposite parity sends TE and TM to cross and bar ports, closer beat lengths need longer sections */
{s: "3. Opposite parity", t: "TODO: L = p L_pi^TE = q L_pi^TM with p, q of opposite parity sends TE and TM to cross and bar ports, closer beat lengths need longer sections", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* from old ch2 L7 card 6 */
{s: "6. Tolerances", t: "Why long MMIs are fussy",
intu: String.raw`Soldano and Pennings show that the image stays sharp over a fixed length shift \(\delta L\), set by the size of the image itself (its Rayleigh range), not by the device. Every error in width, wavelength or index shifts the imaging length by a fraction of \(L\). So the allowed relative errors shrink as \(1/L\): a device twice as long tolerates half the width error and half the bandwidth. Their conclusion is that MMIs should be made as short as possible, and that the section width is by far the most critical parameter. Drag the length and see the tolerances fall. The same logic is why the FDTD phase error of Lesson 10 matters most for long interference devices.`,
eq: String.raw`\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_e}{W_e} \approx \frac{\delta\lambda}{\lambda_0} \approx \frac{\delta n_r}{n_r}, \qquad \delta L \text{ fixed by the image} \]<div class="eqref">Soldano Eq. 40</div>`,
sym: [[String.raw`\(\delta L\)`, "length shift that costs a fixed small loss (0.5 dB in their paper)"], [String.raw`\(\delta W_e, \delta\lambda, \delta n_r\)`, "tolerable errors in width, wavelength and index"], [String.raw`\(L\)`, "device length"]],
how: [String.raw`\(L_\pi \propto n_r W_e^2/\lambda_0\) (card 3).`, String.raw`Take the relative change: \(\delta L_\pi/L_\pi = \delta n_r/n_r + 2\delta W_e/W_e - \delta\lambda/\lambda_0\).`, String.raw`The device works while the imaging length moves by less than the fixed \(\delta L\).`, String.raw`So each allowed relative error is about \(\delta L/L\), which falls as \(1/L\).`],
say: String.raw`The tolerances of an MMI on width, wavelength and index scale as \(\delta L/L\), where \(\delta L\) is set by the image size. Long devices, like splitters that need many beat lengths, are narrowband and very sensitive to width.`,
num: String.raw`Soldano's example (\(W_e\) 8 µm, \(L\) 240 µm, \(n_r\) 3.24, 1.52 µm): \(\delta L\) ≈ <b>15 µm</b>, \(\delta W_e\) ≈ <b>0.25 µm</b>, \(\delta\lambda\) ≈ <b>95 nm</b>, \(\delta n_r\) ≈ <b>0.20</b>.<br>Double the length and all four halve.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Device length (× the example)", 0.25, 8, 0.05, 1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const f = +$("L").value; $("Lv").textContent = f.toFixed(2) + "×";
    const L = 240 * f, dW = 0.25 / f, dl = 95 / f, dn = 0.2 / f;
    const xs = range(0.25, 8, 100), ys = xs.map(x => 95 / x);
    fig.innerHTML = svg(250, `${plot(60, 30, 560, 180, xs, ys, 0.25, 8, 0, 380, "#378ADD", 2.5)}<line x1="${60 + (f - 0.25) / 7.75 * 560}" x2="${60 + (f - 0.25) / 7.75 * 560}" y1="30" y2="210" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="210" stroke="var(--p)"/><text class="ts" x="340" y="232" text-anchor="middle">bandwidth δλ (nm) versus length, scaled from Soldano's example</text>`);
    $("ro").innerHTML = `<div><span>length</span><b>${L.toFixed(0)} µm</b></div><div><span>δW_e</span><b>${(dW * 1000).toFixed(0)} nm</b></div><div><span>δλ</span><b>${dl.toFixed(0)} nm</b></div><div><span>δn_r</span><b>${dn.toFixed(3)}</b></div>`;
  };
  $("L").oninput = u; u();
}}

],
summary: String.raw`A multimode section supports lateral modes with \(k_{y\nu} = (\nu + 1)\pi/W_e\), where \(W_e\) includes field penetration that depends on polarization. Their propagation constants fall almost quadratically, \(\beta_0 - \beta_\nu \approx \nu(\nu + 2)\pi/(3L_\pi)\) with \(L_\pi = 4n_r W_e^2/(3\lambda_0)\). As a result the input reappears as a mirror image at \(3L_\pi\) and a direct image at \(6L_\pi\), or every \(L_\pi\) for paired interference. With two modes the light crosses every beat length, and different TE and TM beat lengths allow a polarization splitter of length \(pL_\pi^{\mathrm{TE}} = qL_\pi^{\mathrm{TM}}\) with \(p\) and \(q\) of opposite parity. Tolerances scale as \(1/L\), so long devices are narrowband and width sensitive.`,
sheet: [
[String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]`, "Lateral modes (Eq. 2.7)"],
[String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi}\left(\frac{n_c}{n_r}\right)^{2\sigma}\left(n_r^2 - n_c^2\right)^{-1/2} \]`, "Effective width (Eq. 2.8)"],
[String.raw`\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2\pi\lambda_0}{4 n_r W_e^2} \]`, "Quadratic law (Eq. 2.9)"],
[String.raw`\[ L_\pi = \frac{\pi}{\beta_0 - \beta_1} \approx \frac{4 n_r W_e^2}{3\lambda_0} \]`, "Beat length (Eq. 2.10)"],
[String.raw`\[ \Psi(y, L) = \sum_\nu c_\nu \psi_\nu \exp\!\left[\frac{j\nu(\nu + 2)\pi L}{3L_\pi}\right] \]`, "Field (Eq. 2.12)"],
[String.raw`\[ L = p\,(3L_\pi) \]`, "General interference images (Eq. 2.13)"],
[String.raw`\[ L_\pi = \frac{\lambda_0}{2(n_0 - n_1)}, \qquad L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}} \]`, "Two-mode splitter (Eqs. 2.14, 2.15)"],
[String.raw`\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_e}{W_e} \approx \frac{\delta\lambda}{\lambda_0} \]`, "Tolerances (Soldano Eq. 40)"]],
consts: "Maps use ideal sine-shaped lateral modes and the quadratic law, as in Soldano's analysis.",
sources: ["Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995) (invited review of MMI devices: self-imaging, general and paired interference, tolerances, applications)"]
});
