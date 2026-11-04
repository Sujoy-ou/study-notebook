/* TODO for this lesson: Thesis Sec. 2.5 first half. Rewrite big/bridge/summary/sheet. */
addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l6", title: "MMI self-imaging", short: "6. MMI self-imaging",
big: "A wide waveguide carries many lateral modes, and their propagation constants depend almost exactly on the square of the mode number. Because of that, all modes come back into step at regular distances, and the input field reappears there as an image. This is self-imaging. With only two modes the light simply swaps sides every beat length. Since the beat length differs for TE-like and TM-like light, one length can send them to opposite outputs: a polarization splitter. Long sections are narrowband and sensitive to width.",
bridge: "Everything here follows Soldano and Pennings 1995, an invited review of multimode interference devices from Delft and Philips. It derives the imaging lengths, classifies general, paired and two-mode interference, and works out tolerances. The maps below are computed live from their Eqs. (1) to (18).",
cards: [
/* from old ch2 L7 card 1 */
{s: "1. Lateral modes", t: "The modes of a wide section",
intu: String.raw`Reduce the section to 2D (Lesson 3): a core of slab index \(n_r\), width \(W_e\), with air beside it. Its lateral modes look like the standing waves on a string: mode \(\nu\) has \(\nu\) zeros across the width. Each mode has a lateral wavenumber \(k_{y\nu} = (\nu + 1)\pi/W_e\) and a propagation constant \(\beta_\nu\) set by \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\). Higher modes have more lateral wiggle, so less of their momentum points along the guide: smaller \(\beta\). Pick a mode.`,
eq: String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]<div class="eqref">Ch. 2 Eq. 2.7, Soldano Eqs. 1 to 3</div>`,
sym: [[String.raw`\(\nu\)`, "lateral mode number, 0, 1, 2, …"], [String.raw`\(k_{y\nu}\)`, String.raw`lateral wavenumber of mode \(\nu\)`], [String.raw`\(\beta_\nu\)`, String.raw`propagation constant of mode \(\nu\)`], [String.raw`\(n_r\)`, "slab (ridge) index from the effective index method"], [String.raw`\(W_e\)`, "effective width (card 2)"]],
how: [String.raw`The total wavenumber in the core is \(k_0 n_r\).`, String.raw`It splits into a lateral part \(k_y\) and a longitudinal part \(\beta\), which add in quadrature.`, String.raw`Mode \(\nu\) fits \(\nu + 1\) half wavelengths across the effective width, so \(k_{y\nu} = (\nu + 1)\pi/W_e\).`, String.raw`So \(\beta\) falls as \(\nu\) grows.`],
say: String.raw`The lateral modes of a multimode section have \(k_{y\nu} = (\nu + 1)\pi/W_e\), and their propagation constants follow from \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\).`,
num: String.raw`Soldano's example 2×2 coupler (InP ridge at 1.52 µm): \(W_e \approx 8\) µm, \(n_r = 3.24\). Mode 0 has \(k_y = \pi/8\) µm⁻¹, tiny compared with \(k_0 n_r = 13.4\) µm⁻¹, which is why the quadratic approximation of card 3 works so well there.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nu", "Mode ν", 0, 7, 1, 2) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const nu = +$("nu").value; $("nuv").textContent = nu;
    const ys = range(-0.5, 0.5, 200);
    let s = ""; for (let k = 0; k <= 7; k++) { const vals = ys.map(y => Math.sin((k + 1) * Math.PI * (y + 0.5))); const off = 30 + k * 28; let d = ""; ys.forEach((y, i) => d += (i ? "L" : "M") + (140 + (y + 0.5) * 400).toFixed(1) + " " + (off + 10 - vals[i] * 10).toFixed(1)); s += `<path d="${d}" fill="none" stroke="${k === nu ? "#D85A30" : "var(--b)"}" stroke-width="${k === nu ? 2.5 : 1}"/><text class="ts" x="130" y="${off + 14}" text-anchor="end">ν = ${k}</text>`; }
    fig.innerHTML = svg(270, `<rect x="140" y="20" width="400" height="235" fill="var(--blue-bg)" opacity="0.5"/>${s}<text class="ts" x="340" y="268" text-anchor="middle">lateral profiles across the effective width W_e</text>`);
    $("ro").innerHTML = `<div><span>zeros across the width</span><b>${nu}</b></div><div><span>k_y W_e / π</span><b>${nu + 1}</b></div>`;
  };
  $("nu").oninput = u; u();
}},

/* from old ch2 L7 card 2 */
{s: "2. Effective width", t: "The effective width: light leaks past the walls",
intu: String.raw`The mode fields do not stop exactly at the side walls. They leak a little into the cladding, the Goos-Hänchen shift of Lesson 1, card 2, so the modes behave as if the section were slightly wider. Soldano and Pennings give a correction that depends on the polarization through \(\sigma\). Careful with \(\sigma\): it refers to the 2D lateral problem, where the side walls play the role of slab surfaces. For a membrane strip, TE-like light has \(\mathbf{E}\) across the width, normal to the side walls, which in the lateral problem is the TM-type case, \(\sigma = 1\). Your Chapter 2 makes this reading explicit. Change \(\sigma\) and the indices.`,
eq: String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi} \left(\frac{n_c}{n_r}\right)^{2\sigma} \left(n_r^2 - n_c^2\right)^{-1/2} \]\[ \sigma = 0:\ \mathbf{E}\ \text{parallel to side walls} \qquad \sigma = 1:\ \mathbf{E}\ \text{normal to side walls} \]<div class="eqref">Ch. 2 Eq. 2.8, Soldano Eq. 4</div>`,
sym: [[String.raw`\(W_M\)`, "physical width of the section"], [String.raw`\(W_e\)`, "effective width seen by the modes"], [String.raw`\(\sigma\)`, "0 or 1 depending on the field direction relative to the side walls"], [String.raw`\(n_c\)`, "cladding index beside the section"]],
how: [String.raw`Each mode's tail extends about \(1/\gamma\) beyond each wall, adding to the effective width.`, String.raw`For a field normal to the walls, the \(\times\varepsilon\) jump weakens the tail, reducing the correction by \((n_c/n_r)^2\).`, String.raw`Soldano's Eq. 4 combines both cases with \(\sigma\).`, "With high index contrast the correction is small, and it differs between the two polarizations."],
say: "The effective width includes the field penetration into the cladding. The correction is smaller when the field is normal to the side walls, so TE-like and TM-like light see slightly different effective widths.",
num: String.raw`Example \(n_r = 3.0\), air, \(\lambda_0 = 800\) nm:<br>\(\sigma = 0\): correction = \((800/\pi)/\sqrt{8}\) ≈ <b>90 nm</b><br>\(\sigma = 1\): \(\times (1/3)^2\) ⟹ ≈ <b>10 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("nr", "Ridge index n_r", 1.5, 3.5, 0.01, 3.0) + sl("W", "Physical width W_M (µm)", 0.5, 5, 0.05, 2) + btns([["0", "σ = 0"], ["1", "σ = 1"]], "s") + '<div class="readout" id="ro"></div>';
  let sg = 1;
  const u = () => {
    pick(ctl, "s", sg); const nr = +$("nr").value, W = +$("W").value * 1000; $("nrv").textContent = nr.toFixed(2); $("Wv").textContent = (W / 1000).toFixed(2) + " µm";
    const corr = 800 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1), We = W + corr, sc = 400 / 5200;
    fig.innerHTML = svg(220, `<rect x="${340 - W * sc / 2}" y="60" width="${W * sc}" height="80" fill="#7FA6D9"/><rect x="${340 - We * sc / 2}" y="55" width="${We * sc}" height="90" fill="none" stroke="#D85A30" stroke-width="2" stroke-dasharray="5 4"/><text class="ts" x="340" y="170" text-anchor="middle">blue: physical width. Coral dashed: effective width (correction exaggerated if small)</text>`);
    $("ro").innerHTML = `<div><span>correction</span><b>${corr.toFixed(1)} nm</b></div><div><span>W_e</span><b>${(We / 1000).toFixed(3)} µm</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sg = +b.dataset.s; u(); });
  $("nr").oninput = u; $("W").oninput = u; u();
}},

/* from old ch2 L7 card 3 */
{s: "3. Beat length", t: "The quadratic law and the beat length",
intu: String.raw`Expand \(\beta_\nu\) for small \(k_y\): it falls almost exactly with \((\nu + 1)^2\). That near-quadratic dependence is the key fact Soldano and Pennings stress, because it makes all phase differences multiples of one basic length. That length is the beat length of the two lowest modes, \(L_\pi\). The plot compares the exact phase spacing with the quadratic law. Make the section narrow or the index low and the law starts to fail for high modes. That failure blurs the images, which is a main source of loss in real MMIs.`,
eq: String.raw`\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2 \pi \lambda_0}{4 n_r W_e^2} \]\[ L_\pi = \frac{\pi}{\beta_0 - \beta_1} \approx \frac{4 n_r W_e^2}{3\lambda_0}, \qquad \beta_0 - \beta_\nu \approx \frac{\nu(\nu + 2)\pi}{3L_\pi} \]<div class="eqref">Ch. 2 Eqs. 2.9 and 2.10, Soldano Eqs. 5 to 7</div>`,
sym: [[String.raw`\(L_\pi\)`, "beat length of the two lowest modes"], [String.raw`\(\nu(\nu + 2)\)`, "0, 3, 8, 15, 24 … the key integer sequence"], ["binomial expansion", String.raw`\(\sqrt{1 - x} \approx 1 - x/2\) for small \(x\)`]],
how: [String.raw`\(\beta = \sqrt{k_0^2 n_r^2 - k_y^2} \approx k_0 n_r - k_y^2/(2k_0 n_r)\) for \(k_y \ll k_0 n_r\).`, String.raw`Insert \(k_y = (\nu + 1)\pi/W_e\) and \(k_0 = 2\pi/\lambda_0\) to get Eq. 2.9.`, String.raw`\(\beta_0 - \beta_1 = 3\pi\lambda_0/(4n_r W_e^2)\), so \(L_\pi = \pi/(\beta_0 - \beta_1) = 4n_r W_e^2/(3\lambda_0)\).`, String.raw`Then \(\beta_0 - \beta_\nu = [(\nu + 1)^2 - 1]\cdot\pi/(3L_\pi) = \nu(\nu + 2)\pi/(3L_\pi)\).`],
say: String.raw`The propagation constants of an MMI depend almost quadratically on mode number, so all mode phases are multiples of \(\pi/(3L_\pi)\), with \(L_\pi = 4n_r W_e^2/(3\lambda_0)\). Deviations from this law blur the images.`,
num: String.raw`\(n_r = 3.0\), \(W_e = 2\) µm, \(\lambda_0 = 0.8\) µm: \(L_\pi = 4 \times 3 \times 4/(3 \times 0.8)\) = <b>20 µm</b><br>Soldano's example: \(W_e\) 8 µm, \(n_r\) 3.24, \(\lambda\) 1.52 µm ⟹ \(L_\pi\) ≈ <b>182 µm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("W", "Effective width W_e (µm)", 0.4, 4, 0.05, 2) + sl("nr", "Ridge index n_r", 1.5, 3.5, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const W = +$("W").value, nr = +$("nr").value, lam = 0.8, k0 = 2 * Math.PI / lam; $("Wv").textContent = W.toFixed(2) + " µm"; $("nrv").textContent = nr.toFixed(2);
    const Lpi = 4 * nr * W * W / (3 * lam), M = Math.floor(2 * W * nr / lam);
    const ex = [], qu = [], nus = [];
    const b0 = Math.sqrt(k0 * k0 * nr * nr - (Math.PI / W) ** 2);
    for (let v = 0; v < Math.min(M, 12); v++) { const ky = (v + 1) * Math.PI / W; if (ky >= k0 * nr) break; nus.push(v); ex.push((b0 - Math.sqrt(k0 * k0 * nr * nr - ky * ky)) * 3 * Lpi / Math.PI); qu.push(v * (v + 2)); }
    const mx = Math.max(...ex, ...qu, 3), X = v => 80 + v / 11 * 520, Y = v => 230 - v / mx * 190;
    let s = ""; nus.forEach((v, i) => { s += `<circle cx="${X(v)}" cy="${Y(qu[i])}" r="5" fill="none" stroke="#378ADD" stroke-width="2"/><circle cx="${X(v)}" cy="${Y(ex[i])}" r="3.5" fill="#D85A30"/>`; });
    fig.innerHTML = svg(260, `${s}<line x1="70" x2="610" y1="230" y2="230" stroke="var(--p)"/><line x1="70" x2="70" y1="30" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">mode number ν. Blue rings: ν(ν + 2). Coral dots: exact (β₀ − β_ν)·3L_π/π</text>`);
    $("ro").innerHTML = `<div><span>L_π</span><b>${Lpi.toFixed(2)} µm</b></div><div><span>guided lateral modes (approx.)</span><b>${nus.length}</b></div><div><span>error at highest mode</span><b>${nus.length ? ((ex[ex.length - 1] / qu[qu.length - 1] - 1) * 100).toFixed(1) + " %" : "—"}</b></div>`;
  };
  $("W").oninput = u; $("nr").oninput = u; u();
}},

/* NEW CARD: Mode expansion c_nu (Eq. 2.11): input field written as a sum of lateral modes, overlap integrals, each term its own phase (Eq. 2.12) */
{s: "4. Expanding the input", t: "TODO: Mode expansion c_nu (Eq. 2.11): input field written as a sum of lateral modes, overlap integrals, each term its own phase (Eq. 2.12)", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* from old ch2 L7 card 4 */
{s: "4. Self-imaging", t: "Watch self-imaging happen",
intu: String.raw`This map is computed live from Soldano's Eqs. (9) and (13). A narrow beam enters at the left at position \(y_0\). It is split into the section's modes, each travels with its own phase, and their sum is drawn as intensity along the section, out to \(6L_\pi\). At \(3L_\pi\) every mode phase \(\nu(\nu + 2)\pi\) becomes a multiple of \(\pi\) with the sign of \((-1)^\nu\), so a mirror image appears. At \(6L_\pi\) the original is back. In between you can see two-fold and multi-fold images. Now set \(y_0 = W_e/6\): modes 2, 5, 8 are not excited, and images appear already at \(L_\pi\). That is paired interference.`,
eq: String.raw`\[ c_\nu = \frac{\int \Psi(y, 0)\, \psi_\nu(y)\, dy}{\sqrt{\int \psi_\nu^2\, dy}} \]\[ \Psi(y, L) = \sum_\nu c_\nu\, \psi_\nu(y) \exp\!\left[ j\, \frac{\nu(\nu + 2)\pi L}{3L_\pi} \right] \]<div class="eqnote">single images at</div>\[ L = p\,(3L_\pi), \quad \text{direct for even } p, \text{ mirrored for odd } p \]<div class="eqref">Ch. 2 Eqs. 2.11 to 2.13, Soldano Eqs. 9, 13 and 18</div>`,
sym: [[String.raw`\(\Psi(y, 0)\)`, "input field at the start of the section"], [String.raw`\(c_\nu\)`, String.raw`how strongly mode \(\nu\) is excited`], [String.raw`\(\psi_\nu\)`, String.raw`lateral profile of mode \(\nu\)`], [String.raw`\(p\)`, String.raw`integer, number of \(3L_\pi\) lengths`]],
how: ["Expand the input in the modes (overlap integrals).", "Each mode accumulates the phase from card 3, relative to mode 0.", String.raw`At \(L = 3L_\pi\) the phases are \(\nu(\nu + 2)\pi\). \(\nu(\nu + 2)\) is even for even \(\nu\) and odd for odd \(\nu\), so even modes return in phase and odd modes in antiphase: a mirror image.`, String.raw`At \(6L_\pi\) all phases are multiples of \(2\pi\): a direct image. With \(y_0 = \pm W_e/6\), modes 2, 5, 8 vanish and the remaining ones repeat every \(L_\pi\).`],
say: String.raw`Self-imaging reproduces the input field as mirrored images at odd multiples of \(3L_\pi\) and direct images at even multiples, for any input. An input at \(\pm W_e/6\) excites no modes 2, 5, 8 and gives images every \(L_\pi\), called paired interference.`,
num: String.raw`General interference: first mirror image at <b>\(3L_\pi\)</b>, first direct image at <b>\(6L_\pi\)</b>.<br>Paired interference (\(y_0 = \pm W_e/6\)): images at <b>\(L_\pi\)</b>, three times shorter.`,
r(fig, ctl) {
  ctl.innerHTML = sl("y0", "Input position y₀ / W_e", -0.4, 0.4, 0.005, 0.25) + sl("M", "Modes in the section", 2, 16, 1, 8) + `<div class="row"><button id="pi6">Set y₀ = W_e/6 (paired)</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    const y0 = +$("y0").value, M = +$("M").value; $("y0v").textContent = y0.toFixed(3); $("Mv").textContent = M;
    const W = 560, H = 180, ys = range(-0.5, 0.5, H), wi = 0.07;
    const inp = ys.map(y => Math.exp(-Math.pow((y - y0) / wi, 2)));
    const modes = [], cs = [];
    for (let v = 0; v < M; v++) { const p = ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))); let num = 0, den = 0; p.forEach((q, i) => { num += inp[i] * q; den += q * q; }); modes.push(p); cs.push(num / den); }
    const { ctx, img } = C2.canvas(fig, W, H, 1.2, "intensity along the section (left to right, 0 to 6L_π) across the width (top to bottom). Ticks at multiples of L_π.");
    const I = new Float32Array(W * H); let mx = 0;
    for (let i = 0; i < W; i++) { const L = i / (W - 1) * 6; for (let j = 0; j < H; j++) { let re = 0, im = 0; for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * L / 3; const a = cs[v] * modes[v][j]; re += a * Math.cos(ph); im += a * Math.sin(ph); } const val = re * re + im * im; I[j * W + i] = val; if (val > mx) mx = val; } }
    for (let k = 0; k < W * H; k++) { const [r, g, b] = C2.heat(Math.sqrt(I[k] / mx)); img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0); ctx.fillStyle = "#ffffff"; for (let p = 1; p < 6; p++) ctx.fillRect(Math.round(p / 6 * (W - 1)), 0, 1, 5);
    const excited = cs.map((c, v) => [v, Math.abs(c)]).filter(x => x[1] > 0.02).map(x => x[0]);
    $("ro").innerHTML = `<div><span>modes excited</span><b>${excited.join(", ")}</b></div><div><span>missing among 0 to ${M - 1}</span><b>${[...Array(M).keys()].filter(v => !excited.includes(v)).join(", ") || "none"}</b></div>`;
  };
  $("pi6").onclick = () => { $("y0").value = (1 / 6).toFixed(3); u(); };
  $("y0").oninput = u; $("M").oninput = u; u();
}},

/* NEW CARD: Single images at L = p 3 L_pi direct/mirrored (Eq. 2.13), input at y = +-We/6 leaves nu = 2,5,8 unexcited, images at p L_pi */
{s: "6. Paired interference", t: "TODO: Single images at L = p 3 L_pi direct/mirrored (Eq. 2.13), input at y = +-We/6 leaves nu = 2,5,8 unexcited, images at p L_pi", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }}

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
