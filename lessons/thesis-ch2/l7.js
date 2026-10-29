addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l7", title: "MMI and polarization splitting", short: "7. MMI and self-imaging",
big: "A wide waveguide carries many lateral modes, and their propagation constants depend almost exactly on the square of the mode number. Because of that, all modes come back into step at regular distances, and the input field reappears there as an image. This is self-imaging. With only two modes the light simply swaps sides every beat length. Since the beat length differs for TE-like and TM-like light, one length can send them to opposite outputs: a polarization splitter. Long sections are narrowband and sensitive to width.",
bridge: "Everything here follows Soldano and Pennings 1995, an invited review of multimode interference devices from Delft and Philips. It derives the imaging lengths, classifies general, paired and two-mode interference, and works out tolerances. The maps below are computed live from their Eqs. (1) to (18).",
cards: [
{s: "1. Lateral modes", t: "The modes of a wide section",
intu: "Reduce the section to 2D (Lesson 3): a core of slab index n<sub>r</sub>, width W<sub>e</sub>, with air beside it. Its lateral modes look like the standing waves on a string: mode ν has ν zeros across the width. Each mode has a lateral wavenumber k<sub>yν</sub> = (ν + 1)π/W<sub>e</sub> and a propagation constant β<sub>ν</sub> set by k<sub>yν</sub>² + β<sub>ν</sub>² = k₀²n<sub>r</sub>². Higher modes have more lateral wiggle, so less of their momentum points along the guide: smaller β. Pick a mode.",
eq: "k<sub>yν</sub>² + β<sub>ν</sub>² = k<sub>0</sub>² n<sub>r</sub>², &nbsp;&nbsp; k<sub>yν</sub> = (ν + 1)π / W<sub>e</sub> &nbsp;&nbsp; (Ch. 2 Eq. 2.7, Soldano Eqs. 1 to 3)",
sym: [["ν", "lateral mode number, 0, 1, 2, …"], ["k_yν", "lateral wavenumber of mode ν"], ["β_ν", "propagation constant of mode ν"], ["n_r", "slab (ridge) index from the effective index method"], ["W_e", "effective width (card 2)"]],
how: ["The total wavenumber in the core is k₀n_r.", "It splits into a lateral part k_y and a longitudinal part β, which add in quadrature.", "Mode ν fits ν + 1 half wavelengths across the effective width, so k_yν = (ν + 1)π/W_e.", "So β falls as ν grows."],
say: "The lateral modes of a multimode section have k_yν = (ν + 1)π/W_e, and their propagation constants follow from k_yν² + β_ν² = k₀²n_r².",
num: "Soldano's example 2×2 coupler (InP ridge at 1.52 µm): W<sub>e</sub> ≈ 8 µm, n<sub>r</sub> = 3.24. Mode 0 has k<sub>y</sub> = π/8 µm⁻¹, tiny compared with k₀n<sub>r</sub> = 13.4 µm⁻¹, which is why the quadratic approximation of card 3 works so well there.",
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

{s: "2. Effective width", t: "The effective width: light leaks past the walls",
intu: "The mode fields do not stop exactly at the side walls. They leak a little into the cladding, the Goos-Hänchen shift of Lesson 1, card 2, so the modes behave as if the section were slightly wider. Soldano and Pennings give a correction that depends on the polarization through σ. Careful with σ: it refers to the 2D lateral problem, where the side walls play the role of slab surfaces. For a membrane strip, TE-like light has E across the width, normal to the side walls, which in the lateral problem is the TM-type case, σ = 1. Your Chapter 2 makes this reading explicit. Change σ and the indices.",
eq: "W<sub>e</sub> ≈ W<sub>M</sub> + (λ<sub>0</sub>/π) (n<sub>c</sub>/n<sub>r</sub>)<sup>2σ</sup> (n<sub>r</sub>² − n<sub>c</sub>²)<sup>−1/2</sup> &nbsp;&nbsp; (Ch. 2 Eq. 2.8, Soldano Eq. 4)<br>σ = 0: E parallel to side walls &nbsp;&nbsp; σ = 1: E normal to side walls",
sym: [["W_M", "physical width of the section"], ["W_e", "effective width seen by the modes"], ["σ", "0 or 1 depending on the field direction relative to the side walls"], ["n_c", "cladding index beside the section"]],
how: ["Each mode's tail extends about 1/γ beyond each wall, adding to the effective width.", "For a field normal to the walls, the ×ε jump weakens the tail, reducing the correction by (n_c/n_r)².", "Soldano's Eq. 4 combines both cases with σ.", "With high index contrast the correction is small, and it differs between the two polarizations."],
say: "The effective width includes the field penetration into the cladding. The correction is smaller when the field is normal to the side walls, so TE-like and TM-like light see slightly different effective widths.",
num: "Example n<sub>r</sub> = 3.0, air, λ₀ = 800 nm:<br>σ = 0: correction = (800/π)/√8 ≈ <b>90 nm</b><br>σ = 1: × (1/3)² ⟹ ≈ <b>10 nm</b>",
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

{s: "3. Beat length", t: "The quadratic law and the beat length",
intu: "Expand β<sub>ν</sub> for small k<sub>y</sub>: it falls almost exactly with (ν + 1)². That near-quadratic dependence is the key fact Soldano and Pennings stress, because it makes all phase differences multiples of one basic length. That length is the beat length of the two lowest modes, L<sub>π</sub>. The plot compares the exact phase spacing with the quadratic law. Make the section narrow or the index low and the law starts to fail for high modes. That failure blurs the images, which is a main source of loss in real MMIs.",
eq: "β<sub>ν</sub> ≈ k<sub>0</sub>n<sub>r</sub> − (ν + 1)²πλ<sub>0</sub>/(4n<sub>r</sub>W<sub>e</sub>²) &nbsp;&nbsp; (Ch. 2 Eq. 2.9, Soldano Eq. 5)<br>L<sub>π</sub> = π/(β<sub>0</sub> − β<sub>1</sub>) ≈ 4n<sub>r</sub>W<sub>e</sub>²/(3λ<sub>0</sub>), &nbsp;&nbsp; β<sub>0</sub> − β<sub>ν</sub> ≈ ν(ν + 2)π/(3L<sub>π</sub>) &nbsp;&nbsp; (Eqs. 2.10, Soldano Eqs. 6, 7)",
sym: [["L_π", "beat length of the two lowest modes"], ["ν(ν + 2)", "0, 3, 8, 15, 24 … the key integer sequence"], ["binomial expansion", "√(1 − x) ≈ 1 − x/2 for small x"]],
how: ["β = √(k₀²n_r² − k_y²) ≈ k₀n_r − k_y²/(2k₀n_r) for k_y ≪ k₀n_r.", "Insert k_y = (ν + 1)π/W_e and k₀ = 2π/λ₀ to get Eq. 2.9.", "β₀ − β₁ = 3πλ₀/(4n_rW_e²), so L_π = π/(β₀ − β₁) = 4n_rW_e²/(3λ₀).", "Then β₀ − β_ν = [(ν + 1)² − 1]·π/(3L_π) = ν(ν + 2)π/(3L_π)."],
say: "The propagation constants of an MMI depend almost quadratically on mode number, so all mode phases are multiples of π/(3L_π), with L_π = 4n_rW_e²/(3λ₀). Deviations from this law blur the images.",
num: "n<sub>r</sub> = 3.0, W<sub>e</sub> = 2 µm, λ₀ = 0.8 µm: L<sub>π</sub> = 4 × 3 × 4/(3 × 0.8) = <b>20 µm</b><br>Soldano's example: W<sub>e</sub> 8 µm, n<sub>r</sub> 3.24, λ 1.52 µm ⟹ L<sub>π</sub> ≈ <b>182 µm</b>.",
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

{s: "4. Self-imaging", t: "Watch self-imaging happen",
intu: "This map is computed live from Soldano's Eqs. (9) and (13). A narrow beam enters at the left at position y₀. It is split into the section's modes, each travels with its own phase, and their sum is drawn as intensity along the section, out to 6L<sub>π</sub>. At 3L<sub>π</sub> every mode phase ν(ν + 2)π becomes a multiple of π with the sign of (−1)<sup>ν</sup>, so a mirror image appears. At 6L<sub>π</sub> the original is back. In between you can see two-fold and multi-fold images. Now set y₀ = W<sub>e</sub>/6: modes 2, 5, 8 are not excited, and images appear already at L<sub>π</sub>. That is paired interference.",
eq: "c<sub>ν</sub> = ∫Ψ(y, 0) ψ<sub>ν</sub>(y) dy / √∫ψ<sub>ν</sub>² dy &nbsp;&nbsp; (Ch. 2 Eq. 2.11, Soldano Eq. 9)<br>Ψ(y, L) = Σ c<sub>ν</sub> ψ<sub>ν</sub>(y) exp[ j ν(ν + 2)π L/(3L<sub>π</sub>) ] &nbsp;&nbsp; (Eq. 2.12, Soldano Eq. 13)<br>single images at L = p(3L<sub>π</sub>), direct for even p, mirrored for odd p &nbsp;&nbsp; (Eq. 2.13, Soldano Eq. 18)",
sym: [["Ψ(y, 0)", "input field at the start of the section"], ["c_ν", "how strongly mode ν is excited"], ["ψ_ν", "lateral profile of mode ν"], ["p", "integer, number of 3L_π lengths"]],
how: ["Expand the input in the modes (overlap integrals).", "Each mode accumulates the phase from card 3, relative to mode 0.", "At L = 3L_π the phases are ν(ν + 2)π. ν(ν + 2) is even for even ν and odd for odd ν, so even modes return in phase and odd modes in antiphase: a mirror image.", "At 6L_π all phases are multiples of 2π: a direct image. With y₀ = ±W_e/6, modes 2, 5, 8 vanish and the remaining ones repeat every L_π."],
say: "Self-imaging reproduces the input field as mirrored images at odd multiples of 3L_π and direct images at even multiples, for any input. An input at ±W_e/6 excites no modes 2, 5, 8 and gives images every L_π, called paired interference.",
num: "General interference: first mirror image at <b>3L<sub>π</sub></b>, first direct image at <b>6L<sub>π</sub></b>.<br>Paired interference (y₀ = ±W<sub>e</sub>/6): images at <b>L<sub>π</sub></b>, three times shorter.",
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

{s: "5. Splitting TE and TM", t: "Two-mode interference and polarization splitting",
intu: "Keep only the two lowest modes. Then the light just swaps from one side to the other every beat length L<sub>π</sub>: the even and odd mode add on one side and cancel on the other, and every L<sub>π</sub> the odd mode flips sign. TE-like and TM-like light have different beat lengths, because L<sub>π</sub> depends on the index and the effective width. Pick a section length where one polarization has crossed an odd number of times (cross port) and the other an even number (bar port), and the section splits polarizations. Drag the length and the TM/TE beat length ratio.",
eq: "Ψ(y, x) = c<sub>0</sub>ψ<sub>0</sub> + c<sub>1</sub>ψ<sub>1</sub> e<sup>jπx/L<sub>π</sub></sup> &nbsp;&nbsp; L<sub>π</sub> = λ<sub>0</sub> / (2(n<sub>0</sub> − n<sub>1</sub>)) &nbsp;&nbsp; (Ch. 2 Eqs. 2.14, 2.15)<br>splitter: &nbsp; L = p L<sub>π</sub><sup>TE</sup> = q L<sub>π</sub><sup>TM</sup>, &nbsp; p and q of opposite parity",
sym: [["n₀, n₁", "effective indices of the two lowest modes of the section, from a mode solver"], ["p, q", "number of crossings for TE and TM"], ["bar port", "output on the input side (even number of crossings)"], ["cross port", "output on the opposite side (odd)"]],
how: ["With two modes, the phase difference grows as πx/L_π.", "At x = L_π the odd mode has flipped sign, moving the light to the mirror side.", "TE and TM have different n₀ − n₁, so different L_π.", "Choose L so the two polarizations end with opposite parity. Soldano notes the different imaging lengths of TE and TM as a problem for couplers, a splitter uses it on purpose."],
say: "In two-mode interference the light crosses the section once per beat length. Because TE-like and TM-like light have different beat lengths, a length that is an odd multiple for one and an even multiple for the other separates them.",
num: "Ratio L<sub>π</sub><sup>TM</sup>/L<sub>π</sub><sup>TE</sup> = 1.5: L = 3L<sub>π</sub><sup>TE</sup> = 2L<sub>π</sub><sup>TM</sup> (p = 3 odd, q = 2 even): TE to cross, TM to bar.<br>The closer the ratio is to 1, the longer the device must be.",
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

{s: "6. Tolerances", t: "Why long MMIs are fussy",
intu: "Soldano and Pennings show that the image stays sharp over a fixed length shift δL, set by the size of the image itself (its Rayleigh range), not by the device. Every error in width, wavelength or index shifts the imaging length by a fraction of L. So the allowed relative errors shrink as 1/L: a device twice as long tolerates half the width error and half the bandwidth. Their conclusion is that MMIs should be made as short as possible, and that the section width is by far the most critical parameter. Drag the length and see the tolerances fall. The same logic is why the FDTD phase error of Lesson 10 matters most for long interference devices.",
eq: "δL/L ≈ 2δW<sub>e</sub>/W<sub>e</sub> ≈ δλ/λ<sub>0</sub> ≈ δn<sub>r</sub>/n<sub>r</sub> &nbsp;&nbsp; (Soldano Eq. 40), &nbsp; δL fixed by the image",
sym: [["δL", "length shift that costs a fixed small loss (0.5 dB in their paper)"], ["δW_e, δλ, δn_r", "tolerable errors in width, wavelength and index"], ["L", "device length"]],
how: ["L_π ∝ n_rW_e²/λ₀ (card 3).", "Take the relative change: δL_π/L_π = δn_r/n_r + 2δW_e/W_e − δλ/λ₀.", "The device works while the imaging length moves by less than the fixed δL.", "So each allowed relative error is about δL/L, which falls as 1/L."],
say: "The tolerances of an MMI on width, wavelength and index scale as δL/L, where δL is set by the image size. Long devices, like splitters that need many beat lengths, are narrowband and very sensitive to width.",
num: "Soldano's example (W<sub>e</sub> 8 µm, L 240 µm, n<sub>r</sub> 3.24, 1.52 µm): δL ≈ <b>15 µm</b>, δW<sub>e</sub> ≈ <b>0.25 µm</b>, δλ ≈ <b>95 nm</b>, δn<sub>r</sub> ≈ <b>0.20</b>.<br>Double the length and all four halve.",
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
summary: "A multimode section supports lateral modes with k_yν = (ν + 1)π/W_e, where W_e includes field penetration that depends on polarization. Their propagation constants fall almost quadratically, β₀ − β_ν ≈ ν(ν + 2)π/(3L_π) with L_π = 4n_rW_e²/(3λ₀). As a result the input reappears as a mirror image at 3L_π and a direct image at 6L_π, or every L_π for paired interference. With two modes the light crosses every beat length, and different TE and TM beat lengths allow a polarization splitter of length pL_π^TE = qL_π^TM with p and q of opposite parity. Tolerances scale as 1/L, so long devices are narrowband and width sensitive.",
sheet: [
["k<sub>yν</sub>² + β<sub>ν</sub>² = k<sub>0</sub>²n<sub>r</sub>², &nbsp; k<sub>yν</sub> = (ν + 1)π/W<sub>e</sub>", "Lateral modes (Eq. 2.7)"],
["W<sub>e</sub> ≈ W<sub>M</sub> + (λ<sub>0</sub>/π)(n<sub>c</sub>/n<sub>r</sub>)<sup>2σ</sup>(n<sub>r</sub>² − n<sub>c</sub>²)<sup>−1/2</sup>", "Effective width (Eq. 2.8)"],
["β<sub>ν</sub> ≈ k<sub>0</sub>n<sub>r</sub> − (ν + 1)²πλ<sub>0</sub>/(4n<sub>r</sub>W<sub>e</sub>²)", "Quadratic law (Eq. 2.9)"],
["L<sub>π</sub> = π/(β<sub>0</sub> − β<sub>1</sub>) ≈ 4n<sub>r</sub>W<sub>e</sub>²/(3λ<sub>0</sub>)", "Beat length (Eq. 2.10)"],
["Ψ(y, L) = Σc<sub>ν</sub>ψ<sub>ν</sub> exp[jν(ν + 2)πL/(3L<sub>π</sub>)]", "Field (Eq. 2.12)"],
["L = p(3L<sub>π</sub>)", "General interference images (Eq. 2.13)"],
["L<sub>π</sub> = λ<sub>0</sub>/(2(n<sub>0</sub> − n<sub>1</sub>)), &nbsp; L = pL<sub>π</sub><sup>TE</sup> = qL<sub>π</sub><sup>TM</sup>", "Two-mode splitter (Eqs. 2.14, 2.15)"],
["δL/L ≈ 2δW<sub>e</sub>/W<sub>e</sub> ≈ δλ/λ<sub>0</sub>", "Tolerances (Soldano Eq. 40)"]],
consts: "Maps use ideal sine-shaped lateral modes and the quadratic law, as in Soldano's analysis.",
sources: ["Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995) (invited review of MMI devices: self-imaging, general and paired interference, tolerances, applications)"]
});
