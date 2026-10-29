addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l3", title: "Strip waveguide modes", short: "3. Strip modes",
big: "Etching the membrane into a narrow strip confines light in the width too. The modes are no longer purely TE or TM, so they are called TE-like and TM-like, and they are named by their mirror symmetries. A quick way to estimate them is the effective index method: solve the slab vertically, then use that slab index as the core of a second slab problem across the width. A narrow strip guides only the fundamental modes strongly, and when it becomes narrower than it is thick, the TM-like mode overtakes the TE-like one.",
bridge: "The effective index method used here is an approximation (the same reduction Soldano and Pennings use for MMIs). A full 2D mode solver, like the one in Tidy3D, is needed for accurate numbers. Values here are illustrative.",
cards: [
{s: "1. EIM steps", t: "From slab to strip: the effective index method",
intu: "A strip is a 2D problem, but it can be split into two 1D slab problems. Step 1: ignore the side walls and solve the vertical slab (thickness t). That gives a slab index N<sub>s</sub>. Step 2: replace the core by a material of index N<sub>s</sub> and solve a slab of width w along y, with air on both sides. The answer is the effective index of the strip. The trick for polarization: in step 2 the role of TE and TM swaps. A TE-like mode has E along y, which is normal to the side walls, so step 2 is a TM-type problem with the ×ε jump at the walls. Step through it.",
eq: String.raw`\[ \text{1: } \mathrm{slab}(n, t) \to N_{\mathrm{s}} \qquad \text{2: } \mathrm{slab}(N_{\mathrm{s}}, w) \to N_{\mathrm{eff}} \]<div class="eqnote">TE-like: step 1 TE, step 2 TM-type</div><div class="eqnote">TM-like: step 1 TM, step 2 TE-type</div>`,
sym: [[String.raw`\(N_{\mathrm{s}}\)`, "effective index of the vertical slab, used as the core in step 2"], [String.raw`\(w\)`, "strip width (along y)"], [String.raw`\(t\)`, "membrane thickness (along z)"], [String.raw`\(N_{\mathrm{eff}}\)`, "estimated effective index of the strip mode"]],
how: ["Assume the field separates: E(y, z) ≈ F(z) G(y).", "Solve the vertical slab for F(z) and N_s.", "Use N_s as the core index of the lateral slab and solve for G(y) and N_eff.", "Pick the lateral boundary type by which way the main E field points relative to the side walls."],
say: "The effective index method reduces the strip to two slab problems, vertical then lateral. It is a good estimate for wide strips but overestimates N_eff for narrow, high-contrast strips, where a full mode solver is needed.",
num: "Soldano and Pennings 1995 reduce their MMI sections to 2D with this same method (their Sec. II), because their guides are single mode vertically.",
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = `<div class="row"><button id="eb">Back</button><button id="en">Next step</button><span class="note" id="et"></span></div>` + sl("w", "Strip width w", 100, 800, 5, 300) + btns([["TE", "TE-like"], ["TM", "TM-like"]], "f") + '<div class="readout" id="ro"></div>';
  let fam = "TE";
  const u = () => {
    pick(ctl, "f", fam); const w = +$("w").value; $("wv").textContent = w + " nm";
    const Ns = C2.slabN(3.5, 1, 160, 800, 0, fam), Ne = C2.eim(3.5, 1, 160, w, 800, fam);
    const S = ["Step 0: the strip cross-section", "Step 1: vertical slab, infinitely wide", "Step 2: lateral slab with core index N_s"];
    const sx = 340, ww = Math.min(400, w * 0.5);
    let body = "";
    if (k === 0) body = `<rect x="${sx - ww / 2}" y="110" width="${ww}" height="50" fill="#7FA6D9" stroke="var(--p)"/><text class="ts" x="${sx}" y="186" text-anchor="middle">w = ${w} nm, t = 160 nm, n = 3.5, air around</text>`;
    if (k === 1) body = `<rect x="60" y="110" width="560" height="50" fill="#7FA6D9" stroke="var(--p)"/><line x1="${sx}" x2="${sx}" y1="80" y2="190" stroke="#EF9F27" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${sx + 8}" y="76">solve along z (${fam})</text><text class="th" x="${sx}" y="214" text-anchor="middle">N_s = ${Ns.toFixed(3)}</text>`;
    if (k === 2) body = `<rect x="${sx - ww / 2}" y="60" width="${ww}" height="150" fill="#B9CCE8" stroke="var(--p)"/><text class="ts" x="${sx}" y="140" text-anchor="middle">core index N_s = ${Ns.toFixed(3)}</text><line x1="${sx - ww / 2 - 40}" x2="${sx + ww / 2 + 40}" y1="230" y2="230" stroke="#EF9F27" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${sx}" y="250" text-anchor="middle">solve along y (${fam === "TE" ? "TM-type: E normal to walls" : "TE-type: E parallel to walls"})</text><text class="th" x="${sx}" y="40" text-anchor="middle">N_eff ≈ ${Ne ? Ne.toFixed(3) : "cut off"}</text>`;
    fig.innerHTML = svg(270, body);
    $("et").textContent = S[k]; $("eb").disabled = k === 0; $("en").disabled = k === 2;
    $("ro").innerHTML = `<div><span>N_s (${fam} slab)</span><b>${Ns.toFixed(3)}</b></div><div><span>N_eff (EIM)</span><b>${Ne ? Ne.toFixed(3) : "—"}</b></div>`;
  };
  $("eb").onclick = () => { k--; u(); }; $("en").onclick = () => { k++; u(); };
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { fam = b.dataset.f; u(); });
  $("w").oninput = u; u();
}},

{s: "2. N vs width", t: "Effective index against width, and the TE/TM crossing",
intu: "As the strip gets wider, both modes approach their slab values. As it gets narrower, more of the light sits in the air beside the strip and N drops. The two families drop at different rates. The TE-like mode has its field across the width, normal to the side walls, so narrowing the strip hurts it the way thinning a slab hurts a TM mode: strongly. The TM-like mode has its field along z, parallel to the side walls, so it is hurt less. When the width falls below the thickness, the curves cross and the TM-like mode becomes the one with the higher index. Drag the marker to the crossing.",
eq: String.raw`\[ w \gg t: \quad N_{\text{TE-like}} \to N_{\mathrm{s,TE}}, \quad N_{\text{TM-like}} \to N_{\mathrm{s,TM}} \]\[ w \lesssim t: \quad N_{\text{TM-like}} \gt N_{\text{TE-like}} \]`,
sym: [[String.raw`\(N_{\mathrm{s,TE}}, N_{\mathrm{s,TM}}\)`, "slab limits for very wide strips (Lesson 2)"], ["crossing", "width where the two families have the same N, roughly where w ≈ t"]],
how: ["Wide strip: the side walls barely matter, so N approaches the slab index.", "TE-like: the lateral problem is TM-type (E normal to walls) and suffers the same ζ penalty as a thin TM slab.", "TM-like: the lateral problem is TE-type, with a weaker penalty.", "So TE-like falls faster as w shrinks and the curves cross near w ≈ t, where the roles of y and z swap."],
say: "In a narrow strip both fundamental modes lose effective index. When the strip becomes narrower than it is thick, the TM-like mode overtakes the TE-like mode.",
num: "With this approximate method, for a 160 nm membrane at 800 nm, the crossing is near w ≈ <b>165 nm</b>. A full mode solver puts it in the same range. Below the crossing the naming by 'TE-like' and 'TM-like' still follows the field direction, not which mode is higher.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Marker at width", 80, 800, 5, 200) + '<div class="readout" id="ro"></div>';
  const ws = range(80, 800, 100), te = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TE")), tm = ws.map(w => C2.eim(3.5, 1, 160, w, 800, "TM"));
  let cross = null; for (let i = 1; i < ws.length; i++) if (te[i - 1] && tm[i - 1] && te[i] && tm[i] && (te[i - 1] - tm[i - 1]) * (te[i] - tm[i]) < 0) cross = ws[i - 1] + (ws[i] - ws[i - 1]) * (tm[i - 1] - te[i - 1]) / ((te[i] - tm[i]) - (te[i - 1] - tm[i - 1]));
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w + " nm";
    const X = v => 60 + (v - 80) / 720 * 560, Y = v => 230 - (v - 1) / 2.2 * 200;
    const pth = a => { let d = ""; a.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(ws[i]).toFixed(1) + " " + Y(v).toFixed(1); }); return d; };
    const a = C2.eim(3.5, 1, 160, w, 800, "TE"), b = C2.eim(3.5, 1, 160, w, 800, "TM");
    fig.innerHTML = svg(260, `<path d="${pth(te)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pth(tm)}" fill="none" stroke="#D85A30" stroke-width="2.5"/>${cross ? `<circle cx="${X(cross)}" cy="${Y(C2.eim(3.5, 1, 160, cross, 800, "TE"))}" r="5" fill="none" stroke="var(--t)" stroke-width="1.5"/>` : ""}<line x1="${X(w)}" x2="${X(w)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="250" text-anchor="middle">strip width, 80 to 800 nm (t = 160 nm)</text><text class="ts" x="66" y="40">blue TE-like, coral TM-like (effective index method)</text>`);
    $("ro").innerHTML = `<div><span>TE-like</span><b>${a ? a.toFixed(3) : "—"}</b></div><div><span>TM-like</span><b>${b ? b.toFixed(3) : "—"}</b></div><div><span>crossing near</span><b>${cross ? cross.toFixed(0) + " nm" : "—"}</b></div>`;
  };
  $("w").oninput = u; u();
}},

{s: "3. Single mode", t: "How wide before a second mode appears",
intu: "A wider strip holds more lateral modes, the same way a thicker slab holds more vertical modes. The first lateral higher-order mode has one zero across the width. Routing waveguides are usually kept narrow enough that this mode is cut off or only barely guided, so light cannot scatter into it and interfere. Drag the width and see when the first-order lateral modes switch on for each family. Johnson et al. described modes near cutoff as hugging the light line: they exist but are weakly guided and spread far into the air.",
eq: String.raw`\[ \text{lateral cutoff of order } p \text{ (EIM): } \quad w_p = \frac{p\lambda_{0}}{2\sqrt{N_{\mathrm{s}}^{2} - n_{\mathrm{c}}^{2}}} \]`,
sym: [[String.raw`\(p\)`, "lateral mode order, number of zeros across the width"], [String.raw`\(w_p\)`, "width at which lateral mode p appears"], [String.raw`\(N_{\mathrm{s}}\)`, "slab index used as the core in the lateral problem"]],
how: ["Apply the slab cutoff of Lesson 2 to the lateral problem.", "The core index is now N_s, not n, so the cutoff width is larger than the cutoff thickness.", "TE-like and TM-like have different N_s, so their first lateral modes appear at different widths.", "Below w₁ the strip is single mode for that family."],
say: "A strip is single mode per polarization family below the cutoff width of the first lateral higher-order mode. Narrow routing waveguides are chosen so higher-order modes are absent or only weakly guided.",
num: "n = 3.5, t = 160 nm, 800 nm, effective index method: TE-like p = 1 appears near w ≈ <b>138 nm</b>, TM-like p = 1 near <b>170 nm</b>.<br>The effective index method puts these cutoffs too low for narrow, high-contrast strips. A full mode solver finds the first-order modes still close to cutoff at somewhat larger widths, which is why a strip around 200 nm wide is used for routing.",
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Strip width w", 100, 900, 5, 300) + '<div class="readout" id="ro"></div>';
  const cut = fam => { const Ns = C2.slabN(3.5, 1, 160, 800, 0, fam); return 800 / (2 * Math.sqrt(Ns * Ns - 1)); };
  const cTE = cut("TE"), cTM = cut("TM");
  const ws = range(100, 900, 90), L = [["TE", 0, "#378ADD", ""], ["TM", 0, "#D85A30", ""], ["TE", 1, "#378ADD", "5 4"], ["TM", 1, "#D85A30", "5 4"]];
  const cv = L.map(([f, p]) => ws.map(w => C2.eim(3.5, 1, 160, w, 800, f, p)));
  const u = () => {
    const w = +$("w").value; $("wv").textContent = w + " nm";
    const X = v => 60 + (v - 100) / 800 * 560, Y = v => 230 - (v - 1) / 2.2 * 200;
    let s = ""; cv.forEach((a, i) => { let d = ""; a.forEach((v, j) => { if (!v) return; d += (d ? "L" : "M") + X(ws[j]).toFixed(1) + " " + Y(v).toFixed(1); }); s += `<path d="${d}" fill="none" stroke="${L[i][2]}" stroke-width="2" ${L[i][3] ? `stroke-dasharray="${L[i][3]}"` : ""}/>`; });
    const n1 = C2.eim(3.5, 1, 160, w, 800, "TE", 1), m1 = C2.eim(3.5, 1, 160, w, 800, "TM", 1);
    fig.innerHTML = svg(260, `${s}<line x1="${X(w)}" x2="${X(w)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="${X(cTE)}" x2="${X(cTE)}" y1="215" y2="235" stroke="#378ADD" stroke-width="2"/><line x1="${X(cTM)}" x2="${X(cTM)}" y1="215" y2="235" stroke="#D85A30" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="340" y="252" text-anchor="middle">width, 100 to 900 nm. Solid p = 0, dashed p = 1. Ticks: cutoffs of p = 1</text>`);
    $("ro").innerHTML = `<div><span>TE-like p = 1 appears at</span><b>${cTE.toFixed(0)} nm</b></div><div><span>TM-like p = 1 appears at</span><b>${cTM.toFixed(0)} nm</b></div><div><span>at this width</span><b>${n1 || m1 ? "multimode" : "single mode"}</b></div>`;
  };
  $("w").oninput = u; u();
}},

{s: "4. Field maps", t: "What the strip modes look like in cross-section",
intu: "These maps show |E|² over the cross-section, built from the two slab solutions of the effective index method. Look at the edges. The TE-like mode drops almost to zero just inside the side walls and jumps up again just outside them, because its main field is normal to the side walls (the jump of Lesson 2). The TM-like mode does the same at the top and bottom surfaces, where its main field is normal. The first-order lateral modes have a dark line down the middle. Change the width and see the field spread into the air as the strip narrows.",
eq: String.raw`\[ |E(y, z)|^{2} \approx |F(z)|^{2}\, |G(y)|^{2} \]<div class="eqref">separable approximation of the effective index method</div>`,
sym: [[String.raw`\(F(z)\)`, "vertical slab profile (Lesson 2)"], [String.raw`\(G(y)\)`, "lateral slab profile with core index N_s"], ["bright edges", "field jumps where the main field is normal to a surface"]],
how: ["Compute F(z) from the vertical slab of the right family.", "Compute G(y) from the lateral slab of the swapped family, including its jump at the walls.", "Multiply and square to get an intensity map.", "Corners are not exact in this approximation. A 2D mode solver gets them right."],
say: "The TE-like mode's field jumps up just outside the side walls and the TM-like mode's field just outside the top and bottom surfaces, each because the main field is normal to that surface.",
num: "Intensity jump at a GaAs to air surface for the normal field: about <b>n⁴ ≈ 150</b> in |E|², since |E| jumps by n² ≈ 12. The colour scale here is clipped so the core stays visible.",
r(fig, ctl) {
  let md = "TE0";
  ctl.innerHTML = btns([["TE0", "TE-like p = 0"], ["TM0", "TM-like p = 0"], ["TE1", "TE-like p = 1"], ["TM1", "TM-like p = 1"]], "m") + sl("w", "Strip width w", 150, 700, 5, 300) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const w = +$("w").value; $("wv").textContent = w + " nm";
    const fam = md.slice(0, 2), p = +md[2], t = 160, lam = 800;
    const Ns = C2.slabN(3.5, 1, t, lam, 0, fam), Ne = C2.eim(3.5, 1, t, w, lam, fam, p);
    const W = 220, H = 120, Ly = 1000, Lz = 540, ys = range(-Ly / 2, Ly / 2, W), zs = range(-Lz / 2, Lz / 2, H);
    if (!Ne) { fig.innerHTML = svg(200, `<text class="th" x="340" y="100" text-anchor="middle">this mode is cut off at w = ${w} nm</text>`); $("ro").innerHTML = ""; return; }
    const vz = C2.slabProfile(3.5, 1, t, lam, 0, fam, Ns, zs), vy = C2.slabProfile(Ns, 1, w, lam, p, fam === "TE" ? "TM" : "TE", Ne, ys);
    const F = fam === "TE" ? vz.main : vz.ez, G = fam === "TE" ? vy.ez : vy.main;
    const { ctx, img } = C2.canvas(fig, W, H, 3, `|E|² cross-section, ${Ly} nm wide and ${Lz} nm tall. White outline: the strip.`);
    let mx = 0; const I = []; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const v = (F[j] * G[i]) ** 2; I.push(v); }
    const sorted = I.slice().sort((a, b) => a - b); mx = sorted[Math.floor(sorted.length * 0.995)] || 1;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const [r, g, b] = C2.heat(Math.sqrt(I[j * W + i] / mx)); const o = ((H - 1 - j) * W + i) * 4; img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; }
    ctx.putImageData(img, 0, 0); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.strokeRect((Ly / 2 - w / 2) / Ly * W, (Lz / 2 - t / 2) / Lz * H, w / Ly * W, t / Lz * H);
    $("ro").innerHTML = `<div><span>N_eff (EIM)</span><b>${Ne.toFixed(3)}</b></div><div><span>main field</span><b>${fam === "TE" ? "E_y, across the width" : "E_z, through the thickness"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); });
  $("w").oninput = u; u();
}},

{s: "5. TE-like naming", t: "Why 'TE-like', and how modes are named by symmetry",
intu: "In a slab, TE and TM are exact. In a strip they are not: every mode has all six field components, so it is only mostly TE or mostly TM. Johnson et al. 1999 explain this for photonic crystal slabs: with no translation symmetry vertically, modes cannot be purely TE or TM, but they can still be classified exactly by mirror symmetry, and exactly at the mirror plane they are purely TE or TM. A practical way to name strip modes is by the sign pattern of E<sub>y</sub> under the two mirrors y → −y and z → −z. Click a mode to see its sign pattern in the four quadrants.",
eq: String.raw`\[ E_{y}(-y, z) = \sigma_{y} E_{y}(y, z), \qquad E_{y}(y, -z) = \sigma_{z} E_{y}(y, z), \qquad \sigma = \pm 1 \]\[ \text{TE0 } (+,+) \qquad \text{TM0 } (-,-) \qquad \text{TE1 } (-,+) \qquad \text{TM1 } (+,-) \]`,
sym: [[String.raw`\(\sigma_{y}, \sigma_{z}\)`, "parity of E_y under the y and z mirrors"], ["TE fraction", "share of the field energy in the in-plane components, used to call a mode TE-like"], [String.raw`\((+, +)\)`, "E_y even in both y and z"]],
how: ["A strip in air is symmetric under both y → −y and z → −z.", "Every mode must be even or odd under each mirror, giving four classes.", "Label the class by the parity of one chosen component, here E_y.", "Andreani and Gerace note that for higher-order modes the TE and TM names lose meaning, so symmetry labels are safer."],
say: "Strip modes are hybrid, so they are called TE-like or TM-like. They are named unambiguously by their mirror symmetries, for example the parity of E_y under y and z reflection.",
num: "TE0: E<sub>y</sub> has the same sign everywhere. TM0: E<sub>y</sub> is small and changes sign in both directions (its main field is E<sub>z</sub>, which is even in both).<br>Johnson: at the mirror plane itself the modes are exactly TE or TM.",
r(fig, ctl) {
  let md = "TE0";
  const P = { TE0: [1, 1], TM0: [-1, -1], TE1: [-1, 1], TM1: [1, -1] };
  ctl.innerHTML = btns([["TE0", "TE0"], ["TM0", "TM0"], ["TE1", "TE1"], ["TM1", "TM1"]], "m") + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "m", md); const [sy, sz] = P[md];
    const q = (x, y, s) => `<rect x="${x}" y="${y}" width="160" height="70" fill="${s > 0 ? "#D85A30" : "#378ADD"}" opacity="0.35"/><text class="th" x="${x + 80}" y="${y + 42}" text-anchor="middle">${s > 0 ? "+" : "−"}</text>`;
    fig.innerHTML = svg(260, `${q(180, 50, 1)}${q(340, 50, sy)}${q(180, 120, sz)}${q(340, 120, sy * sz)}<rect x="180" y="50" width="320" height="140" fill="none" stroke="var(--p)" stroke-width="1.5"/><line x1="340" x2="340" y1="30" y2="210" stroke="var(--t)" stroke-dasharray="5 4"/><line x1="160" x2="520" y1="120" y2="120" stroke="var(--t)" stroke-dasharray="5 4"/><text class="ts" x="344" y="26">mirror y = 0</text><text class="ts" x="524" y="124">mirror z = 0</text><text class="ts" x="340" y="236" text-anchor="middle">sign of E_y in each quadrant of the cross-section</text>`);
    $("ro").innerHTML = `<div><span>σ_y</span><b>${sy > 0 ? "+1 even" : "−1 odd"}</b></div><div><span>σ_z</span><b>${sz > 0 ? "+1 even" : "−1 odd"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { md = b.dataset.m; u(); }); u();
}},

{s: "6. Wide sections", t: "Wide sections behave like the slab",
intu: "Couplers and multimode sections are often micrometers wide. There the side walls are far away from most of the light, and the fundamental mode has almost the slab index. Drag the width up to a few micrometers on a log scale and watch N approach the slab value. This is why a grating that is a few micrometers wide can be designed first as a 2D slab problem and then checked in 3D: the 3D index differs only slightly from the slab index. It is also why an MMI section can be treated with the 2D model of Lesson 7.",
eq: String.raw`\[ N_{\mathrm{eff}}(w) \to N_{\mathrm{s}} \;\text{ as }\; w \to \infty \]\[ N_{\mathrm{s}} - N_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8 N_{\mathrm{s}} w^{2}} \;\text{ for wide strips} \]`,
sym: [[String.raw`\(N_{\mathrm{s}}\)`, "slab index (Lesson 2)"], [String.raw`\(w\)`, "section width"]],
how: ["For a wide lateral slab, the lowest lateral wavenumber is k_y ≈ π/w.", "β² = k₀²N_s² − k_y², so N_eff ≈ N_s − k_y²/(2k₀²N_s).", "Substitute k_y = π/w and k₀ = 2π/λ₀ to get the λ₀²/(8N_s w²) correction.", "The same quadratic idea gives the β of each MMI mode in Soldano and Pennings, Eq. (5)."],
say: "Sections several micrometers wide have an effective index close to the slab index, with a correction that falls as 1/w². That justifies designing wide gratings first in 2D.",
num: "n = 3.5, 160 nm, 800 nm, TE: N<sub>s</sub> ≈ 3.076.<br>w = 2 µm: correction ≈ 800²/(8 × 3.076 × 2000²) ≈ <b>0.0065</b><br>w = 10 µm: ≈ <b>0.0003</b>",
r(fig, ctl) {
  ctl.innerHTML = sl("lw", "Width (log scale)", Math.log10(150), Math.log10(10000), 0.01, Math.log10(2000)) + '<div class="readout" id="ro"></div>';
  const lws = range(Math.log10(150), 4, 90), Ns = C2.slabN(3.5, 1, 160, 800, 0, "TE"), te = lws.map(l => C2.eim(3.5, 1, 160, Math.pow(10, l), 800, "TE"));
  const u = () => {
    const l = +$("lw").value, w = Math.pow(10, l); $("lwv").textContent = w < 1000 ? w.toFixed(0) + " nm" : (w / 1000).toFixed(2) + " µm";
    const X = v => 60 + (v - Math.log10(150)) / (4 - Math.log10(150)) * 560, Y = v => 230 - (v - 1.8) / 1.4 * 200;
    let d = ""; te.forEach((v, i) => { if (!v) return; d += (d ? "L" : "M") + X(lws[i]).toFixed(1) + " " + Y(v).toFixed(1); });
    const N = C2.eim(3.5, 1, 160, w, 800, "TE");
    fig.innerHTML = svg(260, `<line x1="60" x2="620" y1="${Y(Ns)}" y2="${Y(Ns)}" stroke="var(--p)" stroke-dasharray="5 4"/><text class="ts" x="66" y="${Y(Ns) - 6}">slab value N_s = ${Ns.toFixed(3)}</text><path d="${d}" fill="none" stroke="#378ADD" stroke-width="2.5"/><line x1="${X(l)}" x2="${X(l)}" y1="30" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">150 nm</text><text class="ts" x="620" y="250" text-anchor="end">10 µm</text><text class="ts" x="340" y="250" text-anchor="middle">width (log)</text>`);
    $("ro").innerHTML = `<div><span>N_eff (TE-like)</span><b>${N ? N.toFixed(4) : "—"}</b></div><div><span>N_s − N_eff</span><b>${N ? (Ns - N).toFixed(4) : "—"}</b></div><div><span>1/w² estimate</span><b>${(800 * 800 / (8 * Ns * w * w)).toFixed(4)}</b></div>`;
  };
  $("lw").oninput = u; u();
}}
],
summary: "A strip confines light in both directions. Its modes are hybrid, so they are called TE-like and TM-like and are named exactly by their mirror symmetries. The effective index method estimates them with two slab problems, vertical then lateral, with the lateral boundary type swapped. Narrow strips lose effective index, and below a width close to the thickness the TM-like mode overtakes the TE-like one. Narrow strips are single mode per family, and sections several micrometers wide approach the slab index, which justifies 2D design of wide gratings and MMIs.",
sheet: [
[String.raw`\[ \mathrm{slab}(n, t) \to N_{\mathrm{s}}, \qquad \mathrm{slab}(N_{\mathrm{s}}, w) \to N_{\mathrm{eff}} \]`, "Effective index method"],
[String.raw`\[ w_p = \frac{p\lambda_{0}}{2\sqrt{N_{\mathrm{s}}^{2} - n_{\mathrm{c}}^{2}}} \]`, "Lateral cutoff"],
[String.raw`\[ E_{y}(-y, z) = \sigma_{y} E_{y}, \qquad E_{y}(y, -z) = \sigma_{z} E_{y} \]`, "Symmetry naming"],
[String.raw`\[ N_{\mathrm{s}} - N_{\mathrm{eff}} \approx \frac{\lambda_{0}^{2}}{8 N_{\mathrm{s}} w^{2}} \]`, "Wide-section correction"]],
consts: "Examples: n = 3.5, t = 160 nm, λ₀ = 800 nm, air cladding. Effective index method, illustrative only.",
sources: ["Johnson et al., Phys. Rev. B 60, 5751 (1999) (TE-like and TM-like, symmetry classification)", "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006) (TE and TM names for higher-order modes)", "Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995) (effective index method, Sec. II)"]
});
