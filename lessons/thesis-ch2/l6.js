addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l6", title: "MMI self-imaging", short: "6. MMI self-imaging",
big: String.raw`This lesson follows the first half of Sec. 2.5 of the thesis. A multimode interference (MMI) section is wide enough to guide several lateral modes. With the membrane thickness folded into a core index \(n_r\), the problem is two dimensional: mode \(\nu\) is a standing wave across the effective width \(W_e\) with \(k_{y\nu} = (\nu + 1)\pi/W_e\) (Eq. 2.8), and \(W_e\) is a little wider than the physical width, by an amount that depends on the polarization through \(\sigma\) (Eq. 2.9). For a wide section the propagation constants fall off with the square of \(\nu + 1\), which defines the beat length \(L_\pi\) (Eq. 2.10). The input is written as a sum of modes with overlap weights \(c_\nu\) (Eq. 2.11), each term gains its own phase (Eq. 2.12), and because the phases are whole multiples of \(\pi/(3L_\pi)\) the input reappears as images at \(L = p\,(3L_\pi)\) (Eq. 2.13). An input at \(\pm W_e/6\) leaves modes 2, 5, 8 unexcited and gives images every \(L_\pi\): paired interference.`,
bridge: "Everything here follows Soldano and Pennings 1995, the review of multimode interference devices the thesis cites: lateral modes (Eqs. (1) and (3)), effective width (Eq. (4)), the quadratic law and beat length (Eqs. (5) to (7)), the mode expansion (Eqs. (9), (10) and (13)), single images (Eqs. (17) and (18)) and paired interference (Eqs. (31) and (32)). The maps use ideal sine-shaped lateral modes and the quadratic law, as in their analysis, computed live. Lesson 7 takes the special case of two modes and builds the polarization splitter from it.",
cards: [
/* from old ch2 L7 card 1 */
{s: "1. Lateral modes", t: "The modes of a wide section",
intu: String.raw`The analysis is simplest in two dimensions. The thickness of the membrane is taken into account first, by giving the core the effective index \(n_r\) of the unpatterned 160 nm membrane (Lesson 1). What remains is a core of width \(W_M\) and index \(n_r\) in air, in the plane of the propagation direction \(x\) and the lateral direction \(y\). Its lateral modes look like the standing waves on a string: mode \(\nu\) has \(\nu\) zeros across the width. Each mode has a lateral wavenumber \(k_{y\nu} = (\nu + 1)\pi/W_e\) and a propagation constant \(\beta_\nu\) set by \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\). Higher modes have more lateral wiggle, so less of their momentum points along the guide: smaller \(\beta\). Pick a mode.`,
eq: String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]<div class="eqref">Ch. 2 Eq. (2.8), Soldano Eqs. (1) and (3)</div>`,
sym: [[String.raw`\(\nu\)`, "lateral mode number, 0, 1, 2, …"], [String.raw`\(k_{y\nu}\)`, String.raw`lateral wavenumber of mode \(\nu\)`], [String.raw`\(\beta_\nu\)`, String.raw`propagation constant of mode \(\nu\)`], [String.raw`\(n_r\)`, "effective index of the unpatterned membrane, used as the core index of the 2D problem"], [String.raw`\(W_e\)`, "effective width (card 2)"]],
how: [String.raw`The total wavenumber in the core is \(k_0 n_r\).`, String.raw`It splits into a lateral part \(k_y\) and a longitudinal part \(\beta\), which add in quadrature.`, String.raw`Mode \(\nu\) fits \(\nu + 1\) half wavelengths across the effective width, so \(k_{y\nu} = (\nu + 1)\pi/W_e\).`, String.raw`So \(\beta\) falls as \(\nu\) grows.`],
say: String.raw`The lateral modes of a multimode section have \(k_{y\nu} = (\nu + 1)\pi/W_e\), and their propagation constants follow from \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\).`,
num: String.raw`Round example, 160 nm membrane of \(n = 3.5\) at 800 nm, live slab solution: \(n_r \approx 3.08\) for TE-like and \(2.58\) for TM-like light.<br>Soldano's example 2×2 coupler (InP ridge at 1.52 µm): \(W_e \approx 8\) µm, \(n_r = 3.24\). Mode 0 has \(k_y = \pi/8\) µm⁻¹, tiny compared with \(k_0 n_r = 13.4\) µm⁻¹, which is why the quadratic approximation of card 3 works so well there.`,
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
intu: String.raw`The field of a mode does not end exactly at the side walls but reaches slightly into the air (the evanescent tail of Lesson 1), so the effective width \(W_e\) exceeds the physical width by a small amount (Eq. 2.9). The exponent \(\sigma\) carries the polarization. In the two-dimensional problem \(\sigma = 0\) for TE and \(\sigma = 1\) for TM, where the side walls take the place of the slab surfaces. For the membrane this gives \(\sigma = 1\) for the TE-like mode, whose main field is normal to the side walls, and \(\sigma = 0\) for the TM-like mode. A field normal to a wall jumps there and its tail outside is weaker, so the correction for \(\sigma = 1\) is smaller by \((n_c/n_r)^2\). The two buttons set \(\sigma\) and the matching \(n_r\) of the 160 nm membrane. The blue curve is the exact lowest lateral mode of the 2D problem: it leaks past the physical walls, and the ideal sine that ends at the edges of \(W_e\) (coral dashed) follows it closely.`,
eq: String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi} \left(\frac{n_c}{n_r}\right)^{2\sigma} \left(n_r^2 - n_c^2\right)^{-1/2} \]<div class="eqnote">2D problem: \(\sigma = 0\) for TE, \(\sigma = 1\) for TM. Membrane: main field normal to the side walls for TE-like light</div>\[ \sigma_{\text{TE-like}} = 1, \qquad \sigma_{\text{TM-like}} = 0 \]<div class="eqref">Ch. 2 Eq. (2.9), Soldano Eq. (4)</div>`,
sym: [[String.raw`\(W_M\)`, "physical width of the section"], [String.raw`\(W_e\)`, "effective width seen by the modes"], [String.raw`\(\sigma\)`, "0 or 1: 1 for the TE-like mode of the membrane, 0 for the TM-like mode"], [String.raw`\(n_c\)`, "cladding index beside the section"]],
how: [String.raw`Each mode's tail extends about \(1/\gamma\) beyond each wall, adding to the effective width.`, String.raw`For a field normal to the walls, the \(\times\varepsilon\) jump weakens the tail, reducing the correction by \((n_c/n_r)^2\).`, String.raw`Soldano's Eq. 4 combines both cases with \(\sigma\).`, "With high index contrast the correction is small, and it differs between the two polarizations."],
say: String.raw`The effective width includes the reach of the field into the air beside the walls. In the 2D problem \(\sigma\) is 0 for TE and 1 for TM. For the membrane that means \(\sigma = 1\) for the TE-like mode, whose main field is normal to the side walls, and \(\sigma = 0\) for the TM-like mode, so the two polarizations see different effective widths.`,
num: String.raw`Example \(n_r = 3.0\), air, \(\lambda_0 = 800\) nm: \(\sigma = 0\) gives \((800/\pi)/\sqrt{8} \approx\) <b>90 nm</b>, \(\sigma = 1\) gives \(90 \times (1/3)^2 \approx\) <b>10 nm</b>.<br>160 nm membrane: TE-like (\(n_r \approx 3.08\), \(\sigma = 1\)) about <b>9 nm</b>, TM-like (\(n_r \approx 2.58\), \(\sigma = 0\)) about <b>107 nm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nr", "Core index n<sub>r</sub>", 1.5, 3.5, 0.01, 3.08) + sl("W", "Physical width W<sub>M</sub> (µm)", 0.2, 3, 0.05, 0.5) + btns([["1", "TE-like, σ = 1"], ["0", "TM-like, σ = 0"]], "s") + '<div class="readout" id="ro"></div>';
  let sg = 1;
  const u = () => {
    pick(ctl, "s", sg); const nr = +$("nr").value, W = +$("W").value * 1000; $("nrv").textContent = nr.toFixed(2); $("Wv").textContent = (W / 1000).toFixed(2) + " µm";
    const corr = 800 / Math.PI * Math.pow(1 / nr, 2 * sg) / Math.sqrt(nr * nr - 1), We = W + corr, half = We / 2 + 250;
    const pol = sg ? "TM" : "TE", N = C2.slabN(nr, 1, W, 800, 0, pol);
    const zs = range(-half, half, 401), X = z => 60 + (z + half) / (2 * half) * 560;
    let s = `<rect x="${X(-W / 2)}" y="30" width="${X(W / 2) - X(-W / 2)}" height="170" fill="#7FA6D9" opacity="0.35"/><text class="ts" x="${X(0)}" y="24" text-anchor="middle">core, physical width W<tspan baseline-shift="sub" font-size="9">M</tspan></text><text class="ts" x="64" y="44">air</text><text class="ts" x="616" y="44" text-anchor="end">air</text>`;
    [-We / 2, We / 2].forEach(z => s += `<line x1="${X(z)}" x2="${X(z)}" y1="30" y2="214" stroke="#D85A30" stroke-width="1.5" stroke-dasharray="5 4"/>`);
    s += `<text class="ts" x="${X(We / 2) + 4}" y="226" fill="#D85A30">edge of W<tspan baseline-shift="sub" font-size="9">e</tspan></text>`;
    if (N) { const pr = C2.slabProfile(nr, 1, W, 800, 0, pol, N, zs).main; s += plot(60, 60, 560, 140, zs, pr.map(Math.abs), -half, half, 0, 1, "#378ADD", 2.5); }
    s += plot(60, 60, 560, 140, zs, zs.map(z => Math.abs(z) <= We / 2 ? Math.cos(Math.PI * z / We) : 0), -half, half, 0, 1, "#D85A30", 2, "6 4");
    s += `<line x1="60" x2="620" y1="200" y2="200" stroke="var(--p)"/><text class="ts" x="340" y="246" text-anchor="middle">blue: exact lowest lateral mode (2D ${pol} slab). Coral dashed: ideal sine that ends exactly at the edges of W<tspan baseline-shift="sub" font-size="9">e</tspan></text>`;
    fig.innerHTML = svg(256, s);
    $("ro").innerHTML = `<div><span>correction W<sub>e</sub> − W<sub>M</sub></span><b>${corr.toFixed(1)} nm</b></div><div><span>W<sub>e</sub></span><b>${(We / 1000).toFixed(3)} µm</b></div><div><span>2D problem</span><b>${sg ? "TM-type, field normal to the walls" : "TE-type, field along the walls"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { sg = +b.dataset.s; $("nr").value = C2.slabN(3.5, 1, 160, 800, 0, sg ? "TE" : "TM").toFixed(2); u(); });
  $("nr").oninput = u; $("W").oninput = u; u();
}},

/* from old ch2 L7 card 3 */
{s: "3. Beat length", t: "The quadratic law and the beat length",
intu: String.raw`Expand \(\beta_\nu\) for small \(k_y\): it falls almost exactly with \((\nu + 1)^2\). That near-quadratic dependence is the key fact Soldano and Pennings stress, because it makes all phase differences multiples of one basic length. That length is the beat length of the two lowest modes, \(L_\pi\). The plot compares the exact phase spacing with the quadratic law. Make the section narrow or the index low and the law starts to fail for high modes. That failure blurs the images, which is a main source of loss in real MMIs. Since \(n_r\) and \(W_e\) both depend on the polarization, TE-like and TM-like light have different beat lengths, which Lesson 7 uses.`,
eq: String.raw`\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2 \pi \lambda_0}{4 n_r W_e^2} \]\[ L_\pi = \frac{\pi}{\beta_0 - \beta_1} \approx \frac{4 n_r W_e^2}{3\lambda_0}, \qquad \beta_0 - \beta_\nu \approx \frac{\nu(\nu + 2)\pi}{3L_\pi} \]<div class="eqref">Ch. 2 Eq. (2.10), Soldano Eqs. (5) to (7)</div>`,
sym: [[String.raw`\(L_\pi\)`, "beat length of the two lowest modes"], [String.raw`\(\nu(\nu + 2)\)`, "0, 3, 8, 15, 24 … the key integer sequence"], ["binomial expansion", String.raw`\(\sqrt{1 - x} \approx 1 - x/2\) for small \(x\)`]],
how: [String.raw`\(\beta = \sqrt{k_0^2 n_r^2 - k_y^2} \approx k_0 n_r - k_y^2/(2k_0 n_r)\) for \(k_y \ll k_0 n_r\).`, String.raw`Insert \(k_y = (\nu + 1)\pi/W_e\) and \(k_0 = 2\pi/\lambda_0\) to get the first part of Eq. 2.10.`, String.raw`\(\beta_0 - \beta_1 = 3\pi\lambda_0/(4n_r W_e^2)\), so \(L_\pi = \pi/(\beta_0 - \beta_1) = 4n_r W_e^2/(3\lambda_0)\).`, String.raw`Then \(\beta_0 - \beta_\nu = [(\nu + 1)^2 - 1]\cdot\pi/(3L_\pi) = \nu(\nu + 2)\pi/(3L_\pi)\).`],
say: String.raw`The propagation constants of an MMI depend almost quadratically on mode number, so all mode phases are multiples of \(\pi/(3L_\pi)\), with \(L_\pi = 4n_r W_e^2/(3\lambda_0)\). Deviations from this law blur the images.`,
num: String.raw`\(n_r = 3.0\), \(W_e = 2\) µm, \(\lambda_0 = 0.8\) µm: \(L_\pi = 4 \times 3 \times 4/(3 \times 0.8)\) = <b>20 µm</b><br>Soldano's example: \(W_e\) 8 µm, \(n_r\) 3.24, \(\lambda\) 1.52 µm ⟹ \(L_\pi\) ≈ <b>182 µm</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("W", "Effective width W<sub>e</sub> (µm)", 0.4, 4, 0.05, 2) + sl("nr", "Core index n<sub>r</sub>", 1.5, 3.5, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
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

/* new card: expanding the input in the lateral modes (Eqs. 2.11 and 2.12) */
{s: "4. Expanding the input", t: "Writing the input as a sum of modes",
intu: String.raw`To follow light through the section, the input field \(\Psi(y, 0)\) is written as a sum of the guided modes, and the weight of each mode is its overlap integral with the input (Eq. 2.11). The bars show these weights \(c_\nu\). Even modes (teal) are symmetric in \(y\) and odd modes (purple) are antisymmetric, so a centred input excites only even modes. Press Play to build the input one mode at a time, the way you would write the sum on the board: the orange curve is the sum of the first \(m\) terms and it closes in on the grey input. A narrow input needs many modes. Then drag the length \(L\). Each term keeps its weight but turns its own phase, \(\nu(\nu + 2)\pi L/(3L_\pi)\), shown by the small dial over each bar (Eq. 2.12). The teal curve is the field \(|\Psi(y, L)|\) that results.`,
eq: String.raw`\[ \Psi(y, 0) = \sum_{\nu} c_\nu\, \psi_\nu(y), \qquad c_\nu = \frac{\int \Psi(y, 0)\,\psi_\nu(y)\,dy}{\sqrt{\int \psi_\nu^2(y)\,dy}} \]\[ \Psi(y, L) = \sum_{\nu = 0}^{m - 1} c_\nu\, \psi_\nu(y)\, \exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3 L_\pi}\,L\right] \]<div class="eqref">Ch. 2 Eqs. (2.11) and (2.12), Soldano Eqs. (9), (10) and (13)</div>`,
sym: [[String.raw`\(\Psi(y, 0)\)`, "input field at the start of the section"], [String.raw`\(\psi_\nu(y)\)`, String.raw`lateral profile of mode \(\nu\), \(\nu\) nodes across \(W_e\)`], [String.raw`\(c_\nu\)`, String.raw`weight of mode \(\nu\), the overlap of the input with that mode`], [String.raw`\(m\)`, "number of guided modes kept in the sum"], [String.raw`\(\nu(\nu + 2)\pi L/(3L_\pi)\)`, "phase by which mode ν falls behind the fundamental after a length L (card 3)"]],
how: [String.raw`The guided modes of the section form a set of profiles that are orthogonal to each other, so any input that fits inside the section can be written as a sum of them.`, String.raw`Multiply the sum by \(\psi_\nu\) and integrate across \(y\). Orthogonality removes every term but one, which gives the overlap integral \(c_\nu\) of Eq. 2.11. The square root normalizes the mode.`, String.raw`Symmetry sorts the weights: a centred input has no overlap with the odd modes, an off-centre input excites both kinds.`, String.raw`Each mode travels with its own \(\beta_\nu\). Measured relative to the fundamental mode, mode \(\nu\) falls behind by \(\nu(\nu + 2)\pi L/(3L_\pi)\) after a length \(L\) (Eq. 2.10), which gives Eq. 2.12.`, "The weights never change along the section, only the phases do. Everything that happens next, the images of card 5 and card 6, comes from these phases."],
say: String.raw`The input is expanded in the lateral modes of the section, with weights given by the overlap integrals \(c_\nu\). Along the section the weights stay the same and each mode only gains its own phase, \(\nu(\nu + 2)\pi L/(3L_\pi)\) relative to the fundamental mode, so the field at any length is the sum in Eq. 2.12.`,
num: String.raw`Centred input: all \(c_\nu\) with odd \(\nu\) are zero.<br>Phases at \(L = L_\pi\): \(\nu = 1, 2, 3, 4\) are behind by \(\pi, \tfrac{8}{3}\pi, 5\pi, 8\pi\).<br>A Gaussian of half width \(0.08\,W_e\) at \(y_0 = 0.2\,W_e\) needs about 10 modes to hold 99 % of its power.`,
r(fig, ctl) {
  const M = 16, NY = 241, ys = range(-0.5, 0.5, NY), dy = ys[1] - ys[0];
  const modes = []; for (let v = 0; v < M; v++) { const p = ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))); const nn = Math.sqrt(p.reduce((a, q) => a + q * q * dy, 0)); modes.push(p.map(q => q / nn)); }
  let playing = false, tAcc = 0, last = performance.now();
  ctl.innerHTML = sl("y0", "Input position y₀ / W<sub>e</sub>", -0.4, 0.4, 0.005, 0.2) + sl("w", "Input half width / W<sub>e</sub>", 0.03, 0.3, 0.005, 0.08) + sl("m", "Modes kept m", 1, 16, 1, 1) + sl("L", "Length L / L<sub>π</sub>", 0, 6, 0.01, 0) + `<div class="row"><button id="xb">Back</button><button id="xp">Play build</button><button id="xn">Next mode</button></div><p class="note" id="xc" style="font-size:14.5px;color:var(--fg);min-height:40px"></p><div class="readout" id="ro"></div>`;
  const draw = () => {
    const y0 = +$("y0").value, w = +$("w").value, m = +$("m").value, L = +$("L").value;
    $("y0v").textContent = y0.toFixed(3); $("wv").textContent = w.toFixed(3); $("mv").textContent = m; $("Lv").textContent = L.toFixed(2);
    let inp = ys.map(y => Math.exp(-Math.pow((y - y0) / w, 2))); const P = Math.sqrt(inp.reduce((a, q) => a + q * q * dy, 0)); inp = inp.map(q => q / P);
    const cs = modes.map(p => p.reduce((a, q, i) => a + q * inp[i] * dy, 0)), ph = cs.map((c, v) => v * (v + 2) * Math.PI * L / 3);
    const re = ys.map((y, i) => { let s = 0; for (let v = 0; v < m; v++) s += cs[v] * modes[v][i] * Math.cos(ph[v]); return s; });
    const im = ys.map((y, i) => { let s = 0; for (let v = 0; v < m; v++) s += cs[v] * modes[v][i] * Math.sin(ph[v]); return s; });
    const mx = Math.max(...inp), Yb = 140, Hh = 100, Yf = v => Yb - v / mx * Hh, Xf = y => 60 + (y + 0.5) * 560;
    let s = `<text class="ts" x="60" y="16">field across the width of the section (y from −W<tspan baseline-shift="sub" font-size="9">e</tspan>/2 to +W<tspan baseline-shift="sub" font-size="9">e</tspan>/2)</text>`;
    s += `<line x1="60" x2="620" y1="${Yb}" y2="${Yb}" stroke="var(--p)"/><line x1="340" x2="340" y1="${Yb - Hh - 4}" y2="${Yb + 30}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><text class="ts" x="344" y="${Yb + 28}">y = 0</text>`;
    s += plot(60, Yb - 1.1 * Hh, 560, 1.5 * Hh, ys, inp, -0.5, 0.5, -0.4 * mx, 1.1 * mx, "#888780", 5).replace('stroke-width="5"', 'stroke-width="5" opacity="0.45"');
    if (L < 0.005) {
      s += plot(60, Yb - 1.1 * Hh, 560, 1.5 * Hh, ys, re, -0.5, 0.5, -0.4 * mx, 1.1 * mx, "#D85A30", 2.5);
      const t = modes[m - 1].map(q => q * cs[m - 1]); let d = ""; ys.forEach((y, i) => d += (i ? "L" : "M") + Xf(y).toFixed(1) + " " + Yf(t[i]).toFixed(1)); s += `<path d="${d}" fill="none" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      s += `<text class="ts" x="620" y="32" text-anchor="end">grey: input. Orange: sum of the first ${m} terms. Purple dashed: the term just added</text>`;
    } else {
      const ab = re.map((r, i) => Math.hypot(r, im[i]));
      s += plot(60, Yb - 1.1 * Hh, 560, 1.5 * Hh, ys, ab, -0.5, 0.5, -0.4 * mx, 1.1 * mx, "#1D9E75", 2.5);
      s += `<text class="ts" x="620" y="32" text-anchor="end">grey: input. Teal: |Ψ(y, L)| from the first ${m} terms, each with its own phase</text>`;
    }
    // bars and phase dials
    const B0 = 300, cm = Math.max(...cs.map(Math.abs), 1e-9);
    s += `<line x1="60" x2="620" y1="${B0}" y2="${B0}" stroke="var(--p)"/><text class="ts" x="60" y="196">weights c<tspan baseline-shift="sub" font-size="9">ν</tspan> (bars) and phase of each term at length L (dials)</text>`;
    cs.forEach((c, v) => {
      const x = 80 + v * 34, on = v < m, col = v % 2 ? "#7F77DD" : "#1D9E75", h = c / cm * 62;
      s += `<rect x="${x - 10}" y="${(h > 0 ? B0 - h : B0).toFixed(1)}" width="20" height="${Math.abs(h).toFixed(1)}" fill="${col}" opacity="${on ? 0.9 : 0.18}"/><text class="ts" x="${x}" y="${B0 + 78}" text-anchor="middle">${v}</text>`;
      s += `<circle cx="${x}" cy="218" r="11" fill="none" stroke="var(--p)" opacity="${on ? 1 : 0.3}"/>`;
      if (on) s += `<line x1="${x}" y1="218" x2="${(x + 10 * Math.cos(ph[v])).toFixed(1)}" y2="${(218 - 10 * Math.sin(ph[v])).toFixed(1)}" stroke="${col}" stroke-width="2"/>`;
    });
    s += `<text class="ts" x="40" y="${B0 + 78}" text-anchor="end">ν</text>`;
    fig.innerHTML = svg(390, s);
    const cap = cs.slice(0, m).reduce((a, c) => a + c * c, 0);
    $("xc").innerHTML = L < 0.005 ? `Mode ν = ${m - 1} added with weight c = ${cs[m - 1].toFixed(3)}${Math.abs(cs[m - 1]) < 0.01 ? " (not excited)" : ""}. The first ${m} modes hold ${(cap * 100).toFixed(1)} % of the input power.` : `At L = ${L.toFixed(2)} L<sub>π</sub> every term has turned by its own phase. Weights unchanged, the sum has changed shape.`;
    $("ro").innerHTML = `<div><span>power in the first m modes</span><b>${(cap * 100).toFixed(1)} %</b></div><div><span>c₀, c₁, c₂</span><b>${cs.slice(0, 3).map(c => c.toFixed(2)).join(", ")}</b></div>`;
    $("xb").disabled = m === 1; $("xn").disabled = m === M;
  };
  const stop = () => { playing = false; $("xp").textContent = "Play build"; };
  $("xb").onclick = () => { $("m").value = Math.max(1, +$("m").value - 1); $("L").value = 0; stop(); draw(); };
  $("xn").onclick = () => { $("m").value = Math.min(M, +$("m").value + 1); $("L").value = 0; stop(); draw(); };
  $("xp").onclick = () => { playing = !playing; if (playing) { $("L").value = 0; if (+$("m").value >= M) $("m").value = 1; tAcc = 0; } $("xp").textContent = playing ? "Pause" : "Play build"; draw(); };
  ["y0", "w", "m", "L"].forEach(id => $(id).oninput = draw);
  draw();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (playing) { tAcc += dt; if (tAcc > 0.9) { tAcc = 0; if (+$("m").value < M) { $("m").value = +$("m").value + 1; draw(); } else stop(); } }
  });
}},

/* from old ch2 L7 card 4 */
{s: "5. Self-imaging", t: "Watch self-imaging happen",
intu: String.raw`This map is computed live from Eqs. 2.11 and 2.12 (Soldano Eqs. (9) and (13)). A narrow beam enters at the left at position \(y_0\). It is split into the section's modes, each travels with its own phase, and their sum is drawn as intensity along the section, out to \(6L_\pi\). At \(3L_\pi\) every mode phase \(\nu(\nu + 2)\pi\) becomes a multiple of \(\pi\) with the sign of \((-1)^\nu\), so a mirror image appears. At \(6L_\pi\) the original is back. In between you can see two-fold and multi-fold images. Now set \(y_0 = W_e/6\): modes 2, 5, 8 are not excited, and images appear already at \(L_\pi\). That is paired interference, which card 6 animates.`,
eq: String.raw`\[ c_\nu = \frac{\int \Psi(y, 0)\, \psi_\nu(y)\, dy}{\sqrt{\int \psi_\nu^2\, dy}} \]\[ \Psi(y, L) = \sum_\nu c_\nu\, \psi_\nu(y) \exp\!\left[ j\, \frac{\nu(\nu + 2)\pi L}{3L_\pi} \right] \]<div class="eqnote">single images at</div>\[ L = p\,(3L_\pi), \quad \text{direct for even } p, \text{ mirrored for odd } p \]<div class="eqref">Ch. 2 Eqs. (2.11) to (2.13), Soldano Eqs. (9), (13), (17) and (18)</div>`,
sym: [[String.raw`\(\Psi(y, 0)\)`, "input field at the start of the section"], [String.raw`\(c_\nu\)`, String.raw`how strongly mode \(\nu\) is excited`], [String.raw`\(\psi_\nu\)`, String.raw`lateral profile of mode \(\nu\)`], [String.raw`\(p\)`, String.raw`integer, number of \(3L_\pi\) lengths`]],
how: ["Expand the input in the modes (overlap integrals).", "Each mode accumulates the phase from card 3, relative to mode 0 (card 4).", String.raw`At \(L = 3L_\pi\) the phases are \(\nu(\nu + 2)\pi\). \(\nu(\nu + 2)\) is even for even \(\nu\) and odd for odd \(\nu\), so even modes return in phase and odd modes in antiphase: a mirror image.`, String.raw`At \(6L_\pi\) all phases are multiples of \(2\pi\): a direct image. With \(y_0 = \pm W_e/6\), modes 2, 5, 8 vanish and the remaining ones repeat every \(L_\pi\).`],
say: String.raw`Self-imaging reproduces the input field as mirrored images at odd multiples of \(3L_\pi\) and direct images at even multiples, for any input. An input at \(\pm W_e/6\) excites no modes 2, 5, 8 and gives images every \(L_\pi\), called paired interference.`,
num: String.raw`General interference: first mirror image at <b>\(3L_\pi\)</b>, first direct image at <b>\(6L_\pi\)</b>.<br>Paired interference (\(y_0 = \pm W_e/6\)): images at <b>\(L_\pi\)</b>, three times shorter.`,
r(fig, ctl) {
  ctl.innerHTML = sl("y0", "Input position y₀ / W<sub>e</sub>", -0.4, 0.4, 0.005, 0.25) + sl("M", "Modes in the section", 2, 16, 1, 8) + `<div class="row"><button id="pi6">Set y₀ = W_e/6 (paired)</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    const y0 = +$("y0").value, M = +$("M").value; $("y0v").textContent = y0.toFixed(3); $("Mv").textContent = M;
    const W = 560, H = 180, ys = range(-0.5, 0.5, H), wi = 0.07;
    const inp = ys.map(y => Math.exp(-Math.pow((y - y0) / wi, 2)));
    const modes = [], cs = [];
    for (let v = 0; v < M; v++) { const p = ys.map(y => Math.sin((v + 1) * Math.PI * (y + 0.5))); let num = 0, den = 0; p.forEach((q, i) => { num += inp[i] * q; den += q * q; }); modes.push(p); cs.push(num / den); }
    const { ctx, img } = C2.canvas(fig, W, H, 1.2, "intensity along the section (left to right, 0 to 6L_π) across the width (top to bottom). Ticks at multiples of L_π.");
    const I = new Float32Array(W * H); let mx = 0;
    for (let i = 0; i < W; i++) { const L = i / (W - 1) * 6, Cc = [], Ss = []; for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * L / 3; Cc.push(cs[v] * Math.cos(ph)); Ss.push(cs[v] * Math.sin(ph)); } for (let j = 0; j < H; j++) { let re = 0, im = 0; for (let v = 0; v < M; v++) { const a = modes[v][j]; re += a * Cc[v]; im += a * Ss[v]; } const val = re * re + im * im; I[j * W + i] = val; if (val > mx) mx = val; } }
    for (let k = 0; k < W * H; k++) { const [r, g, b] = C2.heat(Math.sqrt(I[k] / mx)); img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0); ctx.fillStyle = "#ffffff"; for (let p = 1; p < 6; p++) ctx.fillRect(Math.round(p / 6 * (W - 1)), 0, 1, 5);
    const excited = cs.map((c, v) => [v, Math.abs(c)]).filter(x => x[1] > 0.02).map(x => x[0]);
    $("ro").innerHTML = `<div><span>modes excited</span><b>${excited.join(", ")}</b></div><div><span>missing among 0 to ${M - 1}</span><b>${[...Array(M).keys()].filter(v => !excited.includes(v)).join(", ") || "none"}</b></div>`;
  };
  $("pi6").onclick = () => { $("y0").value = (1 / 6).toFixed(3); u(); };
  $("y0").oninput = u; $("M").oninput = u; u();
}},

/* new card: single images and paired interference (Eq. 2.13, Soldano Eqs. (17), (18), (31), (32)) */
{s: "6. Paired interference", t: "Where the images form: single images and paired interference",
intu: String.raw`Look at the phases of Eq. 2.12 at special lengths. The integer \(\nu(\nu + 2)\) is even for even \(\nu\) and odd for odd \(\nu\), and even modes are symmetric while odd modes are antisymmetric. At \(L = 3L_\pi\) every even mode is back in phase and every odd mode has changed sign, which recreates the input mirrored about the centre line. At \(6L_\pi\) every mode is back in phase and the input reappears unchanged. So single images form at \(L = p\,(3L_\pi)\), direct for even \(p\) and mirrored for odd \(p\) (Eq. 2.13). Now place the input at \(y = W_e/6\). The modes \(\nu = 2, 5, 8, \ldots\) have a node exactly there, so they are not excited. The modes that remain act in pairs, and images form already at \(L = p\,L_\pi\), three times sooner. Soldano and Pennings call this paired interference. Press the three input buttons and watch the field run along the section. The triangles mark the image lengths, and the profile below compares the field at the cursor with the input (grey dashed) and its mirror (grey dotted).`,
eq: String.raw`\[ L = p\,(3L_\pi), \qquad p = 0, 1, 2, \ldots \qquad \text{direct for even } p, \ \text{mirrored for odd } p \]<div class="eqnote">input at \(y = \pm W_e/6\): modes \(\nu = 2, 5, 8, \ldots\) unexcited</div>\[ L = p\,L_\pi \qquad \text{(paired interference)} \]<div class="eqref">Ch. 2 Eq. (2.13), Soldano Eqs. (17), (18), (31) and (32)</div>`,
sym: [[String.raw`\(p\)`, "integer that counts the images along the section"], [String.raw`\(3L_\pi\)`, "length of the first single image for any input (mirrored)"], [String.raw`\(\nu(\nu + 2)\)`, "0, 3, 8, 15, 24, 35, ... even for even ν, odd for odd ν"], [String.raw`\(\pm W_e/6\)`, String.raw`input positions where \(\psi_2, \psi_5, \psi_8, \ldots\) have a node`]],
how: [String.raw`At \(L = 3L_\pi\) the phase of mode \(\nu\) in Eq. 2.12 is \(\nu(\nu + 2)\pi\). For even \(\nu\) this is a multiple of \(2\pi\), for odd \(\nu\) an odd multiple of \(\pi\).`, String.raw`So the even (symmetric) modes keep their sign and the odd (antisymmetric) modes flip. Flipping the antisymmetric part of a field is the same as mirroring it about \(y = 0\): a mirrored image.`, String.raw`At \(L = 6L_\pi\) all phases are multiples of \(2\pi\): a direct image. This repeats, which is Eq. 2.13.`, String.raw`Mode \(\nu\) is \(\sin[(\nu + 1)\pi(y/W_e + 1/2)]\). At \(y = W_e/6\) the argument is \(2(\nu + 1)\pi/3\), a multiple of \(\pi\) when \(\nu + 1\) is a multiple of 3, so \(\nu = 2, 5, 8, \ldots\) have a node there and \(c_\nu = 0\).`, String.raw`For every remaining mode, \(\nu(\nu + 2)\) is a multiple of 3. Then the phases at \(L = L_\pi\) are already \(\nu(\nu + 2)\pi/3\), whole multiples of \(\pi\) with the same even and odd pattern, so images appear at \(p\,L_\pi\).`],
say: String.raw`Single images of any input form at \(L = p\,(3L_\pi)\), direct for even \(p\) and mirrored for odd \(p\). If the input sits at \(\pm W_e/6\), the modes 2, 5, 8 and so on are not excited, the rest act in pairs, and the images form three times sooner, at \(p\,L_\pi\). That is paired interference.`,
num: String.raw`With the round example of card 3 (\(L_\pi = 20\) µm): general interference gives the first mirrored image at <b>60 µm</b> and the first direct image at <b>120 µm</b>. Paired interference gives a mirrored image at <b>20 µm</b> and a direct one at <b>40 µm</b>.<br>\(\nu(\nu + 2)\) for \(\nu = 0, 1, 3, 4, 6, 7\): 0, 3, 15, 24, 48, 63, all multiples of 3.`,
note: String.raw`A centred input excites only even modes, so its mirror image is the input itself, and Soldano and Pennings show that it already images earlier (their symmetric interference). The thesis uses Eq. 2.13 and paired interference only, so the centred case is shown here just for comparison.`,
r(fig, ctl) {
  const M = 14, W = 680, H = 120, yrow = range(0.5, -0.5, H), ys = range(-0.5, 0.5, 241), dy = ys[1] - ys[0];
  const POS = { center: 0, off: 0.22, pair: 1 / 6 };
  let kind = "pair", playing = true, xc = 0, last = performance.now(), dat = null;
  ctl.innerHTML = btns([["center", "Centred, y = 0"], ["off", "Off-centre, y = 0.22 W<sub>e</sub>"], ["pair", "At y = W<sub>e</sub>/6"]], "k") + `<div class="row"><button id="pp">Pause</button></div>` + sl("xc", "Position along the section x / L<sub>π</sub>", 0, 6, 0.01, 0) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div style="position:relative"><canvas width="${W}" height="${H}" style="width:100%;display:block;border:1px solid var(--line);border-radius:4px;background:#fff"></canvas><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:100%;height:100%"><g id="pcur"></g></svg></div><div id="pmk"></div><div id="ppr"></div>`;
  const cv = fig.querySelector("canvas"), ctx = cv.getContext("2d");
  const mode = (v, y) => Math.abs(y) > 0.5 ? 0 : Math.sin((v + 1) * Math.PI * (y + 0.5)) * Math.SQRT2;
  const TAB = new Map(), tab = yy => { if (!TAB.has(yy)) TAB.set(yy, yy.map(y => Array.from({ length: M }, (_, v) => mode(v, y)))); return TAB.get(yy); };
  const field = (cs, x, yy) => { const T = tab(yy), C = [], S = []; for (let v = 0; v < M; v++) { const ph = v * (v + 2) * Math.PI * x / 3; C.push(cs[v] * Math.cos(ph)); S.push(cs[v] * Math.sin(ph)); } return T.map(row => { let re = 0, im = 0; for (let v = 0; v < M; v++) { re += C[v] * row[v]; im += S[v] * row[v]; } return [re, im]; }); };
  const build = () => {
    const y0 = POS[kind], w = 0.07;
    let inp = ys.map(y => Math.exp(-Math.pow((y - y0) / w, 2))); const P = Math.sqrt(inp.reduce((a, q) => a + q * q * dy, 0)); inp = inp.map(q => q / P);
    const cs = []; for (let v = 0; v < M; v++) cs.push(ys.reduce((a, y, i) => a + inp[i] * mode(v, y) * dy, 0));
    const img = ctx.createImageData(W, H), I = new Float32Array(W * H); let mx = 0;
    for (let i = 0; i < W; i++) { const f = field(cs, i / (W - 1) * 6, yrow); f.forEach(([re, im], j) => { const v = re * re + im * im; I[j * W + i] = v; if (v > mx) mx = v; }); }
    for (let k = 0; k < W * H; k++) { const [r, g, b] = C2.heat(Math.sqrt(I[k] / mx)); img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    const ims = kind === "pair" ? [1, 2, 3, 4, 5, 6].map(p => [p, p % 2 ? "mirrored" : "direct"]) : [[3, "mirrored"], [6, "direct"]];
    let s = "";
    for (let p = 1; p <= 6; p++) { const x = p / 6 * (W - 1); s += `<line x1="${x}" x2="${x}" y1="0" y2="8" stroke="var(--p)"/><text class="ts" x="${x - 4}" y="22" text-anchor="end">${p === 1 ? "" : p}L<tspan baseline-shift="sub" font-size="9">π</tspan></text>`; }
    ims.forEach(([p, t]) => { const x = Math.min(p / 6 * (W - 1), W - 8); s += `<path d="M${x} 30 l-6 12 h12z" fill="${t === "direct" ? "#1D9E75" : "#7F77DD"}"/>`; });
    s += `<text class="ts" x="4" y="54">triangles: images from ${kind === "pair" ? "paired interference, L = p L" : "Eq. 2.13, L = p (3L"}<tspan baseline-shift="sub" font-size="9">π</tspan>${kind === "pair" ? "" : ")"}. Teal: direct. Purple: mirrored</text>`;
    $("pmk").innerHTML = svg(62, s);
    dat = { cs, inp, ims };
  };
  const draw = () => {
    if (!dat) return;
    pick(ctl, "k", kind); $("xcv").textContent = xc.toFixed(2);
    const X = xc / 6 * (W - 1);
    $("pcur").innerHTML = `<line x1="${X}" x2="${X}" y1="0" y2="${H}" stroke="#378ADD" stroke-width="3"/>`;
    const f = field(dat.cs, xc, ys), ab = f.map(([r, i]) => r * r + i * i), inI = field(dat.cs, 0, ys).map(([r, i]) => r * r + i * i), mir = inI.slice().reverse();
    const mx = Math.max(...inI), norm = (a, b) => { let s = 0, s1 = 0, s2 = 0; a.forEach((v, i) => { s += Math.sqrt(v * b[i]); s1 += v; s2 += b[i]; }); return s * s / (s1 * s2); };
    const Fd = norm(ab, inI), Fm = norm(ab, mir);
    let s = plot(40, 24, 320, 120, ys, inI, -0.5, 0.5, 0, mx * 1.1, "#888780", 1.5, "6 4") + plot(40, 24, 320, 120, ys, mir, -0.5, 0.5, 0, mx * 1.1, "#888780", 1.5, "1 3") + plot(40, 24, 320, 120, ys, ab, -0.5, 0.5, 0, mx * 1.1, "#D85A30", 2.5);
    s += `<line x1="40" x2="360" y1="144" y2="144" stroke="var(--p)"/><line x1="200" x2="200" y1="20" y2="144" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><text class="ts" x="40" y="14">intensity across the width at the cursor (coral)</text><text class="ts" x="40" y="160">−W<tspan baseline-shift="sub" font-size="9">e</tspan>/2</text><text class="ts" x="360" y="160" text-anchor="end">+W<tspan baseline-shift="sub" font-size="9">e</tspan>/2</text>`;
    const cm = Math.max(...dat.cs.map(Math.abs));
    dat.cs.forEach((c, v) => { const x = 398 + v * 19, h = Math.abs(c) / cm * 100; s += `<rect x="${x - 6}" y="${144 - h}" width="12" height="${h}" fill="${v % 2 ? "#7F77DD" : "#1D9E75"}"/><text class="ts" x="${x}" y="160" text-anchor="middle">${v}</text>`; if (Math.abs(c) < 0.02 * cm) s += `<text class="ts" x="${x}" y="138" text-anchor="middle" fill="#E24B4A">0</text>`; });
    s += `<text class="ts" x="390" y="14">|c<tspan baseline-shift="sub" font-size="9">ν</tspan>| for ν = 0 to 13 (red 0: not excited)</text>`;
    const lab = Fd > 0.9 && xc > 0.05 ? "direct image" : Fm > 0.9 && xc > 0.05 ? "mirrored image" : xc <= 0.05 ? "input" : "no single image";
    s += `<text class="th" x="200" y="182" text-anchor="middle" fill="${lab.includes("image") && lab !== "no single image" ? "#1D9E75" : "var(--fg)"}">${lab}</text>`;
    $("ppr").innerHTML = svg(190, s);
    const miss = dat.cs.map((c, v) => [v, Math.abs(c) < 0.02 * cm]).filter(a => a[1]).map(a => a[0]);
    $("ro").innerHTML = `<div><span>cursor</span><b>x = ${xc.toFixed(2)} L<sub>π</sub></b></div><div><span>match with input / mirror</span><b>${(Fd * 100).toFixed(0)} % / ${(Fm * 100).toFixed(0)} %</b></div><div><span>modes not excited (0 to 13)</span><b>${miss.join(", ") || "none"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { kind = b.dataset.k; xc = 0; $("xc").value = 0; build(); draw(); });
  $("pp").onclick = () => { playing = !playing; $("pp").textContent = playing ? "Pause" : "Play"; };
  $("xc").oninput = () => { xc = +$("xc").value; playing = false; $("pp").textContent = "Play"; draw(); };
  build(); draw();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (playing) { xc += dt * 0.55; if (xc > 6.6) xc = 0; xc = Math.min(xc, 6.6); $("xc").value = Math.min(6, xc).toFixed(2); const keep = xc; xc = Math.min(6, xc); draw(); xc = keep; }
  });
}}

],
summary: String.raw`In two dimensions an MMI section is a core of index \(n_r\), the effective index of the unpatterned membrane, and width \(W_M\) in air. Its lateral modes satisfy \(k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2\) with \(k_{y\nu} = (\nu + 1)\pi/W_e\) (Eq. 2.8). The effective width \(W_e\) adds the reach of the field into the air (Eq. 2.9), with \(\sigma = 1\) for the TE-like mode of the membrane and \(\sigma = 0\) for the TM-like mode. For a wide section \(\beta_\nu \approx k_0 n_r - (\nu + 1)^2\pi\lambda_0/(4 n_r W_e^2)\), so mode \(\nu\) falls behind the fundamental by \(\nu(\nu + 2)\pi L/(3L_\pi)\) with \(L_\pi = \pi/(\beta_0 - \beta_1) \approx 4 n_r W_e^2/(3\lambda_0)\) (Eq. 2.10). The input is expanded with overlap weights \(c_\nu\) (Eq. 2.11) and each term gains its own phase (Eq. 2.12). At \(3L_\pi\) the odd modes have flipped and the input is mirrored, at \(6L_\pi\) it is back: single images at \(L = p\,(3L_\pi)\), direct for even \(p\) and mirrored for odd \(p\) (Eq. 2.13). An input at \(\pm W_e/6\) leaves \(\nu = 2, 5, 8, \ldots\) unexcited and the images form at \(p\,L_\pi\), paired interference.`,
sheet: [
[String.raw`\[ k_{y\nu}^2 + \beta_\nu^2 = k_0^2 n_r^2, \qquad k_{y\nu} = \frac{(\nu + 1)\pi}{W_e} \]`, "Lateral modes (Ch. 2 Eq. 2.8, Soldano Eqs. (1) and (3))"],
[String.raw`\[ W_e \approx W_M + \frac{\lambda_0}{\pi}\left(\frac{n_c}{n_r}\right)^{2\sigma}\left(n_r^2 - n_c^2\right)^{-1/2} \]`, String.raw`Effective width, \(\sigma = 1\) TE-like and \(\sigma = 0\) TM-like for the membrane (Ch. 2 Eq. 2.9, Soldano Eq. (4))`],
[String.raw`\[ \beta_\nu \approx k_0 n_r - \frac{(\nu + 1)^2\pi\lambda_0}{4 n_r W_e^2}, \qquad L_\pi = \frac{\pi}{\beta_0 - \beta_1} \approx \frac{4 n_r W_e^2}{3\lambda_0} \]`, "Quadratic law and beat length (Ch. 2 Eq. 2.10, Soldano Eqs. (5) and (6))"],
[String.raw`\[ c_\nu = \frac{\int \Psi(y, 0)\,\psi_\nu(y)\,dy}{\sqrt{\int \psi_\nu^2(y)\,dy}} \]`, "Mode weights, overlap integrals (Ch. 2 Eq. 2.11, Soldano Eqs. (9) and (10))"],
[String.raw`\[ \Psi(y, L) = \sum_{\nu = 0}^{m - 1} c_\nu\, \psi_\nu(y)\, \exp\!\left[\,j\,\frac{\nu(\nu + 2)\pi}{3 L_\pi}\,L\right] \]`, "Field along the section (Ch. 2 Eq. 2.12, Soldano Eq. (13))"],
[String.raw`\[ L = p\,(3L_\pi), \qquad p = 0, 1, 2, \ldots \]`, "Single images, direct for even p, mirrored for odd p (Ch. 2 Eq. 2.13, Soldano Eqs. (17) and (18))"],
[String.raw`\[ y = \pm\frac{W_e}{6}: \quad L = p\,L_\pi \]`, "Paired interference, modes 2, 5, 8 unexcited (Soldano Eqs. (31) and (32))"]],
consts: "Maps use ideal sine-shaped lateral modes and the quadratic law, as in Soldano's analysis. Round example: 160 nm membrane, n = 3.5, 800 nm.",
sources: ["Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995): review of multimode interference devices. Lateral modes, effective width, beat length, mode expansion, single images, paired interference."]
});
