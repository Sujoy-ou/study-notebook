/* Helpers for this lesson (prefix L4_). Closed-form overlap of a one-sided exponential with a Gaussian. */
const L4_erfc = x => { const z = Math.abs(x), t = 1 / (1 + 0.5 * z); const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; };
const L4_overlap = (a, w, x0) => { const I = Math.sqrt(Math.PI) * w / 2 * Math.exp(a * a * w * w / 4 - a * x0) * L4_erfc(a * w / 2 - x0 / w); return I * I / ((1 / (2 * a)) * w * Math.sqrt(Math.PI / 2)); };
const L4_bestX0 = (a, w) => { let best = 0, bx = 0; for (let x0 = -10; x0 <= 30; x0 += 0.05) { const v = L4_overlap(a, w, x0); if (v > best) { best = v; bx = x0; } } return [best, bx]; };
addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l4", title: "Grating couplers", short: "4. Grating couplers",
big: String.raw`This lesson follows Sec. 2.3 of the thesis. A guided mode cannot leave the membrane by itself, because its propagation constant \(\beta = k_0 n_{\mathrm{eff}}\) is larger than any wavevector that light in air can have along the surface. A grating of period \(\Lambda\) adds or removes whole kicks of \(2\pi/\Lambda\), and an order radiates when what is left fits inside the light circle (Eq. 2.2). Choosing the period for the first order sets the angle toward the fiber (Eq. 2.3). Besides the period, the fill factor and the etch depth set the average index of the grating. In the thesis the teeth are etched through the membrane and every tooth and gap has its own width. Exactly vertical emission is avoided because the second order then couples the forward mode into the backward one. Two factors limit the coupling efficiency: about half of the light goes down, and the exponentially decaying beam does not match the Gaussian fiber mode.`,
bridge: "Main references, as in the thesis: Taillaert et al. 2006, a review of grating couplers in silicon-on-insulator at 1550 nm, for phase matching, the vertical period, the detuned angle and the two efficiency limits, and Zhou et al. 2018, grating couplers on suspended GaAs membranes near 930 nm, for the angled period and the role of fill factor and etch depth. Numbers from the papers are quoted as theirs. All other numbers use round textbook values (n = 3.5, 160 nm membrane, 800 nm).",
cards: [
/* from old ch2 L5 card 1 */
{s: "1. Why a grating", t: "Why light needs help to leave the chip",
intu: String.raw`A nanophotonic strip is a few hundred nanometers across, while a fiber mode is about 10 µm. Butt coupling them wastes almost all the light. A grating on the surface instead scatters the guided light upward into a beam about the size of the fiber mode. Taillaert et al. list the practical benefits: it can be placed anywhere on the chip, needs no polished facet, and lets the circuit be tested from above. The obstacle is momentum. The guided light has \(\beta = k_0 n_{\mathrm{eff}}\) with \(n_{\mathrm{eff}} \gt 1\), larger than any wave in air can have along the surface, \(k_0 \sin\theta \le k_0\). Drag \(n_{\mathrm{eff}}\) to see the mismatch.`,
eq: String.raw`\[ \text{guided: } \beta = k_{0} n_{\mathrm{eff}}, \quad n_{\mathrm{eff}} \gt n_{\mathrm{c}} \]\[ \text{free space along the surface: } k_{0} n_{\mathrm{c}} \sin\theta \le k_{0} n_{\mathrm{c}} \]\[ \Longrightarrow\quad \text{a smooth guide cannot radiate} \]`,
sym: [[String.raw`\(\beta\)`, "propagation constant of the guided mode"], [String.raw`\(k_{0} n_{\mathrm{c}} \sin\theta\)`, String.raw`component along the surface of a wave leaving at angle \(\theta\)`], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the mode in the grating region"]],
how: ["To leave, the guided wave and the outgoing wave must match their phase along the surface.", String.raw`That needs \(\beta = k_0 n_{\mathrm{c}} \sin\theta\).`, String.raw`But \(\beta \gt k_0 n_{\mathrm{c}}\) for a guided mode, so no real angle works.`, "Something periodic must supply the missing momentum. That is the grating."],
say: "A guided mode cannot couple to free space by itself because its propagation constant exceeds the free-space wavenumber. A periodic grating supplies the momentum difference.",
num: "Taillaert et al. 2006, measured in SOI: <b>31 %</b> per coupler, <b>69 %</b> with a gold bottom mirror.<br>Zhou et al. 2018, GaAs membrane at about 930 nm: <b>> 60 %</b> per grating, back reflection below 1 %.",
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Effective index n<sub>eff</sub>", 1, 3.5, 0.01, 2.8) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N.toFixed(2); const cx = 340, cy = 200, R = 80, sc = R;
    fig.innerHTML = svg(270, `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="#378ADD" fill-opacity="0.12" stroke="#378ADD" stroke-width="2"/><text class="ts" x="${cx}" y="${cy - R - 8}" text-anchor="middle">all waves that can exist in air: |k| = k₀</text><line x1="${cx - 280}" x2="${cx + 280}" y1="${cy}" y2="${cy}" stroke="var(--p)"/><line x1="${cx}" y1="${cy + 12}" x2="${cx + N * sc}" y2="${cy + 12}" stroke="#D85A30" stroke-width="4" marker-end="url(#ar)"/><text class="ts" x="${cx + N * sc / 2}" y="${cy + 32}" text-anchor="middle">β = k₀n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> of the guided mode</text><line x1="${cx + R}" x2="${cx + R}" y1="${cy - 6}" y2="${cy + 6}" stroke="#378ADD" stroke-width="2"/><text class="th" x="${cx}" y="40" text-anchor="middle">${N > 1 ? "β is outside the circle: no outgoing wave matches" : "at n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 1 the mode just touches the light circle"}</text>`);
    $("ro").innerHTML = `<div><span>β / k₀</span><b>${N.toFixed(2)}</b></div><div><span>largest along-surface k in air</span><b>1.00 k₀</b></div>`;
  };
  $("N").oninput = u; u();
}},

/* from old ch2 L5 card 2 */
{s: "2. Phase matching", t: "Phase matching: subtract grating kicks",
intu: String.raw`A grating of period \(\Lambda\) can add or remove any whole number of kicks \(K = 2\pi/\Lambda\). Each choice \(m\) is a diffraction order. Draw \(\beta\), subtract \(mK\), and check whether the tip lands inside the light circle of radius \(k_0 n_{\mathrm{c}}\). If it does, that order radiates, at the angle where the circle is hit. Light goes both up and down, because air is on both sides of a suspended membrane. Change the period and watch the orders move in and out of the circle. A coupler is designed so that only \(m = -1\) radiates.`,
eq: String.raw`\[ k_{0} n_{\mathrm{c}} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda}, \qquad m = 0, \pm 1, \pm 2, \dots \]\[ \text{order } m \text{ radiates if } \left|\beta + m\,\frac{2\pi}{\Lambda}\right| \lt k_{0} n_{\mathrm{c}} \]<div class="eqref">Ch. 2 Eq. (2.2), Taillaert 2006</div>`,
sym: [[String.raw`\(\Lambda\)`, "grating period"], [String.raw`\(K = 2\pi/\Lambda\)`, "grating vector, the momentum one period supplies"], [String.raw`\(m\)`, "diffraction order"], [String.raw`\(\theta_m\)`, String.raw`emission angle of order \(m\), from the surface normal`], [String.raw`\(n_{\mathrm{c}}\)`, "cladding index (air: 1)"]],
how: [String.raw`Each groove scatters a little light. Grooves are \(\Lambda\) apart, so their waves have a phase delay \(\beta\Lambda\) between neighbours.`, String.raw`In direction \(\theta\) the extra path delay between neighbours is \(k_0 n_{\mathrm{c}}\Lambda \sin\theta\).`, String.raw`The scattered waves add up in phase when the difference of these two is a multiple of \(2\pi\).`, String.raw`Dividing by \(\Lambda\) gives the phase-matching condition.`],
say: String.raw`A grating radiates the diffraction orders whose propagation constant \(\beta + mK\) falls inside the cladding light circle. The period is chosen so that only the first order, \(m = -1\), radiates.`,
num: String.raw`Example: \(n_{\mathrm{eff}} = 2.8\), \(\lambda_0 = 800\) nm, \(\Lambda = 300\) nm: \(\sin\theta_{-1} = 2.8 - 800/300 = 0.133\), \(\theta \approx\) <b>7.7°</b>, tilted forward along the propagation direction.<br>\(m = -2\): \(2.8 - 5.33 = -2.53\) → outside, does not radiate.`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Effective index n<sub>eff</sub>", 1.5, 3.5, 0.01, 2.8) + sl("L", "Period Λ", 150, 900, 1, 300) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, L = +$("L").value, lam = 800; $("Nv").textContent = N.toFixed(2); $("Lv").textContent = L + " nm";
    const K = lam / L, cx = 340, cy = 160, sc = 62;
    let s = `<circle cx="${cx}" cy="${cy}" r="${sc}" fill="#378ADD" fill-opacity="0.1" stroke="#378ADD" stroke-width="2"/><line x1="20" x2="660" y1="${cy}" y2="${cy}" stroke="var(--p)"/>`;
    const rows = [];
    for (let m = 0; m >= -3; m--) {
      const v = N + m * K, rad = Math.abs(v) < 1, y = cy + 26 + (-m) * 16;
      const x0 = cx + N * sc, x1 = cx + v * sc;
      if (m === 0) s += `<line x1="${cx}" y1="${y}" x2="${x0}" y2="${y}" stroke="#D85A30" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="${x0 + 6}" y="${y + 4}">β</text>`;
      else s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="var(--p)" stroke-width="1.5" marker-end="url(#ar)"/><circle cx="${x1}" cy="${y}" r="4" fill="${rad ? "#1D9E75" : "#888780"}"/><text class="ts" x="${Math.max(24, Math.min(640, x1 - 6))}" y="${y + 4}" text-anchor="end">m = ${m}</text>`;
      if (rad && m !== 0) { const th = Math.asin(v); s += `<line x1="${cx}" y1="${cy}" x2="${cx + sc * 1.8 * Math.sin(th)}" y2="${cy - sc * 1.8 * Math.cos(th)}" stroke="#1D9E75" stroke-width="2.5" marker-end="url(#ar)"/><line x1="${cx}" y1="${cy}" x2="${cx + sc * 1.8 * Math.sin(th)}" y2="${cy + sc * 1.0 * Math.cos(th)}" stroke="#1D9E75" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>`; }
      rows.push([m, v, rad]);
    }
    fig.innerHTML = svg(270, s + `<text class="ts" x="20" y="24">circle: light in air (radius k₀). Arrows: β minus m grating kicks. Green: radiating orders, up (solid) and down (dashed)</text>`);
    $("ro").innerHTML = rows.filter(r => r[0] !== 0).map(([m, v, rad]) => `<div><span>m = ${m}</span><b>${rad ? "θ = " + (Math.asin(v) * 180 / Math.PI).toFixed(1) + "°" : "no"}</b></div>`).join("");
  };
  $("N").oninput = u; $("L").oninput = u; u();
}},

/* from old ch2 L5 card 3 */
{s: "2b. Fiber to chip, animated", t: "From the fiber into the chip: every vector, step by step",
intu: String.raw`Run it backward from the fiber's point of view. Light comes down from a fiber tilted by \(\theta\). Only the part of its wavevector that runs along the surface, \(k_x = k_0 n_{\mathrm{c}}\sin\theta\), can talk to the waveguide, because the guided mode only cares about phase along \(x\). That \(k_x\) is far too small to equal the mode's \(\beta = k_0 n_{\mathrm{eff}}\). The grating fixes the mismatch: every period adds a kick \(K = 2\pi/\Lambda\) along \(x\), forward or backward. If one forward kick lands exactly on \(\beta\), the light enters the forward mode. The same kick in the backward direction lands near \(-\beta\) but misses, so almost nothing goes backward. With a vertical fiber the picture becomes symmetric: \(k_x = 0\), so the forward and the backward kick both hit, and the light splits into both directions. Worse, two kicks turn \(\beta\) into \(-\beta\), so the grating also acts as a Bragg mirror for light already in the guide. Press Play, or step through, and switch between tilted and vertical.`,
eq: String.raw`\[ \underbrace{k_0 n_{\mathrm{c}}\sin\theta}_{\text{fiber, along }x} + \underbrace{\frac{2\pi}{\Lambda}}_{\text{one kick}} = \underbrace{\beta = k_0 n_{\mathrm{eff}}}_{\text{forward mode}} \quad\Longrightarrow\quad \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta} \]<div class="eqnote">Vertical fiber, \(\theta = 0\)</div>\[ \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}}}: \qquad 0 \pm \frac{2\pi}{\Lambda} = \pm\beta \ \ (\text{both directions}), \qquad \beta - 2\,\frac{2\pi}{\Lambda} = -\beta \ \ (\text{Bragg reflection}) \]<div class="eqref">Ch. 2 Eqs. (2.2) and (2.3), Taillaert 2006. Same equation as for emission, read in reverse (reciprocity)</div>`,
sym: [[String.raw`\(k_0 = 2\pi/\lambda_0\)`, "wavenumber in vacuum"], [String.raw`\(n_{\mathrm{c}}\)`, "index of the cladding above the grating, 1 for air"], [String.raw`\(\theta\)`, "fiber tilt from the surface normal"], [String.raw`\(k_x, k_z\)`, "parts of the fiber light's wavevector along the surface and down into the chip"], [String.raw`\(K = 2\pi/\Lambda\)`, "grating vector: the momentum one period can add or remove along x"], [String.raw`\(\beta = k_0 n_{\mathrm{eff}}\)`, "propagation constant of the guided mode, forward. The backward mode has minus beta"], [String.raw`\(\Lambda\)`, "grating period"]],
how: [String.raw`Split the incoming wavevector \(k_0 n_{\mathrm{c}}\) into \(k_x = k_0 n_{\mathrm{c}}\sin\theta\) along the surface and \(k_z = k_0 n_{\mathrm{c}}\cos\theta\) down into the chip.`, String.raw`The grating is periodic along \(x\), so it can only change \(k_x\), and only by whole numbers of \(K = 2\pi/\Lambda\). \(k_z\) is not conserved because the structure is not uniform along \(z\).`, String.raw`Phase matching to the forward mode: \(k_x + K = \beta\). Divide by \(k_0\): \(n_{\mathrm{c}}\sin\theta + \lambda_0/\Lambda = n_{\mathrm{eff}}\), which gives the period.`, String.raw`Backward check: \(k_x - K = -\beta + 2k_x\). It misses \(-\beta\) by \(2k_x\), so a tilt of a few degrees already separates the two directions.`, String.raw`At \(\theta = 0\) the miss is zero: \(\pm K = \pm\beta\). The light splits forward and backward, and the second order \(\beta - 2K = -\beta\) reflects guided light back. This is why couplers use a small tilt (Taillaert and Zhou use 10°).`],
say: String.raw`The grating conserves the wavevector along the surface up to whole grating vectors. With a tilted fiber one kick matches the forward mode while the backward direction misses by twice the fiber's in-plane wavevector. With a vertical fiber both directions match and the second order reflects guided light, so couplers are designed for a small tilt.`,
num: String.raw`Example (round textbook values): \(n_{\mathrm{eff}} = 2.8\), air, \(\lambda_0 = 800\) nm.<br>\(\theta = 10°\): \(\Lambda = 800/(2.8 - 0.174) =\) <b>305 nm</b>. Backward miss \(2k_x = 0.35\,k_0\).<br>\(\theta = 0\): \(\Lambda = 800/2.8 =\) <b>286 nm</b>, backward miss 0.`,
note: String.raw`If asked "why not a vertical coupler?": with a vertical fiber the structure is mirror symmetric, so a uniform grating couples equally forward and backward, losing half the light, and its second order back-reflects guided light. Perfectly vertical couplers exist, but they need the symmetry broken, for example by a blazed or multi-layer design.`,
r(fig, ctl) {
  const RD = "#E24B4A", GR = "#1D9E75", BL = "#378ADD", CO = "#D85A30", TL = "#1D9E75", AM = "#BA7517";
  let mode = "tilt", step = 1, playing = true, tPlay = 0, last = performance.now();
  ctl.innerHTML = `<div class="row"><button data-m="tilt">Tilted fiber</button><button data-m="vert">Vertical fiber</button></div>` + sl("th", "Fiber tilt θ (tilted mode)", 2, 20, 0.5, 10) + `<div class="row"><button id="gb">Back</button><button id="gn">Next step</button><button id="gp">Pause</button><span id="gs" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div><div class="readout" id="ro"></div>`;
  const TERMS = [
    [1, String.raw`\(\color{#378ADD}{k_0 n_{\mathrm{c}}\sin\theta}\)`],
    [2, String.raw`\(+\;\color{#BA7517}{\dfrac{2\pi}{\Lambda}}\)`],
    [3, String.raw`\(=\;\color{#D85A30}{\beta = k_0 n_{\mathrm{eff}}}\)`],
    [4, String.raw`\(\;\Longrightarrow\;\Lambda = \dfrac{\lambda_0}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta}\)`]];
  const T5 = { tilt: String.raw`\(\text{backward: }\ k_x - \dfrac{2\pi}{\Lambda} = -\beta + 2k_x \ne -\beta\ \ \color{#1D9E75}{\checkmark}\)`, vert: String.raw`\(\theta = 0:\ \ 0 \pm \dfrac{2\pi}{\Lambda} = \pm\beta,\qquad \beta - 2\dfrac{2\pi}{\Lambda} = -\beta\ \ \color{#E24B4A}{\text{✗}}\)`};
  fig.innerHTML = `<style>.gq{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:58px;font-size:17px;padding:6px 10px;background:var(--sunk);border-radius:8px}.gq span{opacity:0;transform:translateY(8px);transition:opacity .6s,transform .6s}.gq span.in{opacity:1;transform:none}.gq2{min-height:40px;margin-top:6px;font-size:15px;padding:4px 10px;opacity:0;transition:opacity .6s}.gq2.in{opacity:1}</style><div class="gq">${TERMS.map(([k, tx]) => `<span data-k="${k}">${tx}</span>`).join("")}</div><div class="gq2" id="g5"></div><div id="gsv"></div><p class="note" id="gc" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  typesetMath(fig);
  const CAP = {1: "Step 1. The fiber shines light down at angle θ. Only the part of its wavevector along the surface, k<sub>x</sub> (blue), can couple to the guide.",
    2: "Step 2. The grating is periodic along x, so it adds kicks K = 2π/Λ (amber) forward or backward. It cannot change anything else that matters.",
    3: "Step 3. One forward kick lands exactly on β (coral): the light enters the forward guided mode. This is phase matching.",
    4: "Step 4. Solve that line for the period. A tilted fiber needs a slightly longer period than a vertical one.",
    5: {tilt: "Step 5. The backward kick lands near −β but misses by 2k<sub>x</sub>, so almost no light goes backward. All of it goes one way.", vert: "Step 5. Vertical fiber: k<sub>x</sub> = 0, so +K hits β and −K hits −β. The light splits both ways, losing half. Two kicks also turn β into −β, a Bragg mirror for guided light."}};
  const ne = 2.8, nc = 1;
  const draw = (t) => {
    const th = mode === "vert" ? 0 : +$("th").value; $("thv").textContent = th.toFixed(1) + "°";
    const s1 = Math.sin(th * Math.PI / 180), kx = nc * s1, K = ne - kx, L = 800 / K;
    let s = "";
    // ---------- side view ----------
    const cx = 340, gy = 178, mt = 20;
    s += `<text class="ts" x="20" y="18">side view (not to scale)</text>`;
    s += `<rect x="60" y="${gy}" width="560" height="${mt}" fill="var(--b)" opacity="0.55"/>`;
    const per = 34, x0g = 200;
    for (let i = 0; i < 9; i++) s += `<rect x="${x0g + i * per}" y="${gy - 10}" width="${per * 0.5}" height="10" fill="var(--b)" opacity="0.8"/>`;
    s += `<text class="ts" x="340" y="${gy + mt + 56}" text-anchor="middle">GaAs membrane with a grating of period Λ (teeth on top)</text>`;
    // fiber
    const a = th * Math.PI / 180, fx = cx - 120 * Math.sin(a), fy = gy - 140;
    s += `<g transform="rotate(${-th} ${cx} ${gy - 12})"><rect x="${cx - 34}" y="${gy - 170}" width="68" height="110" fill="#EEE6D3" opacity="0.7" stroke="var(--t)" stroke-width="0.6"/><rect x="${cx - 10}" y="${gy - 170}" width="20" height="110" fill="#D8C9A6" opacity="0.8"/>`;
    for (let k = 0; k < 4; k++) { const yy = gy - 170 + ((t * 40 + k * 28) % 112); s += `<line x1="${cx - 30}" x2="${cx + 30}" y1="${yy}" y2="${yy}" stroke="${BL}" stroke-width="1.5" opacity="0.6"/>`; }
    s += `</g><text class="ts" x="${cx + 44}" y="${gy - 150}">fiber${th ? `, tilted ${th.toFixed(0)}°` : ", vertical"}</text>`;
    // incoming k vector and components
    const Lk = 90, px = cx, py = gy - 14, sx = px - Lk * Math.sin(a), sy = py - Lk * Math.cos(a);
    s += `<line x1="${sx}" y1="${sy}" x2="${px}" y2="${py}" stroke="var(--t)" stroke-width="2.5" marker-end="url(#ar)"/><text class="ts" x="${sx - 6}" y="${sy + 4}" text-anchor="end">k₀n<tspan baseline-shift="sub" font-size="9">c</tspan></text>`;
    if (step >= 1 && th > 0.5) s += `<line x1="${sx}" y1="${py}" x2="${px}" y2="${py}" stroke="${BL}" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="${(sx + px) / 2}" y="${py + 14}" text-anchor="middle" fill="${BL}">k<tspan baseline-shift="sub" font-size="9">x</tspan></text><line x1="${sx}" y1="${sy}" x2="${sx}" y2="${py}" stroke="var(--muted)" stroke-dasharray="3 3"/><text class="ts" x="${sx - 4}" y="${(sy + py) / 2}" text-anchor="end" fill="var(--muted)">k<tspan baseline-shift="sub" font-size="9">z</tspan></text>`;
    if (step >= 1 && th <= 0.5) s += `<text class="ts" x="${px + 8}" y="${py - 40}" fill="${BL}">k<tspan baseline-shift="sub" font-size="9">x</tspan> = 0</text>`;
    if (step >= 2) for (let i = 0; i < 4; i++) { const xx = x0g + 20 + i * 70; s += `<line x1="${xx}" y1="${gy - 26}" x2="${xx + 34}" y2="${gy - 26}" stroke="${AM}" stroke-width="2.5" marker-end="url(#ar)"/>`; if (i === 3) s += `<text class="ts" x="${xx + 40}" y="${gy - 22}" fill="${AM}">K = 2π/Λ</text>`; }
    // guided waves
    if (step >= 3) {
      const fw = (x) => gy + mt / 2 + 6 * Math.sin((x - t * 90) / 18);
      let d = ""; for (let x = cx; x <= 610; x += 4) d += (d ? "L" : "M") + x + " " + fw(x).toFixed(1);
      s += `<path d="${d}" fill="none" stroke="${CO}" stroke-width="2.5"/><line x1="540" y1="${gy + mt + 16}" x2="610" y2="${gy + mt + 16}" stroke="${CO}" stroke-width="3" marker-end="url(#ar)"/><text class="th" x="575" y="${gy + mt + 34}" text-anchor="middle" fill="${CO}">β (forward)</text>`;
      const back = mode === "vert" ? 1 : 0.15;
      let d2 = ""; for (let x = cx; x >= 70; x -= 4) d2 += (d2 ? "L" : "M") + x + " " + (gy + mt / 2 + 6 * back * Math.sin((x + t * 90) / 18)).toFixed(1);
      if (step >= 5) s += `<path d="${d2}" fill="none" stroke="${mode === "vert" ? RD : "var(--muted)"}" stroke-width="${mode === "vert" ? 2.5 : 1}" opacity="${mode === "vert" ? 1 : 0.6}"/><line x1="140" y1="${gy + mt + 16}" x2="70" y2="${gy + mt + 16}" stroke="${mode === "vert" ? RD : "var(--muted)"}" stroke-width="${mode === "vert" ? 3 : 1.5}" marker-end="url(#ar)"/><text class="th" x="105" y="${gy + mt + 34}" text-anchor="middle" fill="${mode === "vert" ? RD : "var(--muted)"}">−β ${mode === "vert" ? "(half the light)" : "(almost none)"}</text>`;
    }
    // ---------- k_x axis ----------
    const ay = 330, X = v => 340 + v * 100;
    s += `<text class="ts" x="20" y="270">wavevector along the surface, in units of k₀</text>`;
    s += `<rect x="${X(-nc)}" y="${ay - 14}" width="${X(nc) - X(-nc)}" height="28" fill="${TL}" opacity="0.15"/><text class="ts" x="${X(-nc) - 6}" y="${ay - 18}" text-anchor="end" fill="${TL}">green band: what air can carry, |k<tspan baseline-shift="sub" font-size="9">x</tspan>| ≤ k₀n<tspan baseline-shift="sub" font-size="9">c</tspan></text>`;
    s += `<line x1="${X(-3.1)}" x2="${X(3.1)}" y1="${ay}" y2="${ay}" stroke="var(--t)"/>`;
    [-ne, 0, ne].forEach(v => s += `<line x1="${X(v)}" x2="${X(v)}" y1="${ay - 6}" y2="${ay + 6}" stroke="var(--t)"/>`);
    s += `<text class="ts" x="${X(ne)}" y="${ay + 22}" text-anchor="middle" fill="${CO}">+β (2.8)</text><text class="ts" x="${X(-ne)}" y="${ay + 22}" text-anchor="middle" fill="${CO}">−β</text>`;
    if (step >= 1) s += `<circle cx="${X(kx)}" cy="${ay}" r="6" fill="${BL}"/><text class="ts" x="${X(kx)}" y="${ay + 22}" text-anchor="middle" fill="${BL}">k<tspan baseline-shift="sub" font-size="9">x</tspan> = ${kx.toFixed(2)}</text>`;
    if (step >= 2) { const f = step === 2 ? Math.min(1, (t % 2.5) / 1.5) : 1;
      s += `<path d="M${X(kx)} ${ay - 8} Q${(X(kx) + X(kx + K * f)) / 2} ${ay - 60} ${X(kx + K * f)} ${ay - 8}" fill="none" stroke="${AM}" stroke-width="2.5" marker-end="url(#ar)"/><text class="ts" x="${(X(kx) + X(kx + K)) / 2}" y="${ay - 52}" text-anchor="middle" fill="${AM}">+K</text>`;
      if (step >= 5) s += `<path d="M${X(kx)} ${ay + 8} Q${(X(kx) + X(kx - K)) / 2} ${ay + 60} ${X(kx - K)} ${ay + 8}" fill="none" stroke="${AM}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ar)"/><text class="ts" x="${(X(kx) + X(kx - K)) / 2}" y="${ay + 60}" text-anchor="middle" fill="${AM}">−K</text>`; }
    if (step >= 3) s += `<circle cx="${X(kx + K)}" cy="${ay}" r="9" fill="none" stroke="${GR}" stroke-width="3"/><text class="th" x="${X(kx + K)}" y="${ay + 40}" text-anchor="middle" fill="${GR}">✓ hits β</text>`;
    if (step >= 5) { const miss = Math.abs(kx - K + ne) > 0.02;
      s += `<circle cx="${X(kx - K)}" cy="${ay}" r="7" fill="none" stroke="${miss ? "var(--muted)" : RD}" stroke-width="2.5"/><text class="th" x="${X(-ne)}" y="${ay + 40}" text-anchor="middle" fill="${miss ? GR : RD}">${miss ? "misses −β ✓" : "hits −β ✗"}</text>`;
      if (mode === "vert") s += `<text class="ts" x="${X(0)}" y="${ay + 78}" text-anchor="middle" fill="${RD}">and β − 2K = −β: guided light is reflected back (second order)</text>`; }
    $("gsv").innerHTML = svg(420, s);
    fig.querySelectorAll(".gq span").forEach(e => e.classList.toggle("in", +e.dataset.k <= step));
    $("g5").classList.toggle("in", step >= 5);
    $("gs").textContent = `step ${step} of 5`;
    $("gb").disabled = step === 1; $("gn").disabled = step === 5;
    $("gc").innerHTML = typeof CAP[step] === "string" ? CAP[step] : CAP[step][mode];
    $("ro").innerHTML = `<div><span>period Λ = λ₀/(n<sub>eff</sub> − n<sub>c</sub> sin θ)</span><b>${L.toFixed(0)} nm</b></div><div><span>backward miss 2k<sub>x</sub></span><b>${(2 * kx).toFixed(2)} k₀</b></div>`;
  };
  const set5 = () => { $("g5").innerHTML = T5[mode]; typesetMath($("g5")); };
  const sync = () => ctl.querySelectorAll("button[data-m]").forEach(b => b.classList.toggle("on", b.dataset.m === mode));
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; sync(); set5(); });
  $("gb").onclick = () => { step = Math.max(1, step - 1); playing = false; $("gp").textContent = "Play"; };
  $("gn").onclick = () => { step = Math.min(5, step + 1); playing = false; $("gp").textContent = "Play"; };
  $("gp").onclick = () => { playing = !playing; if (playing && step === 5) step = 1; tPlay = 0; $("gp").textContent = playing ? "Pause" : "Play"; };
  sync(); set5();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (playing) { tPlay += dt; if (tPlay > 3.2) { tPlay = 0; if (step < 5) step++; else { playing = false; $("gp").textContent = "Play"; } } }
    draw(t);
  });
}},

/* from old ch2 L5 card 4 */
{s: "3. The period", t: "Choosing the period for a target angle",
intu: String.raw`Solve phase matching for \(m = -1\) and you get the period that sends light out at angle \(\theta\). For vertical emission it reduces to the simplest possible rule: one period equals one guide wavelength, \(\Lambda = \lambda_0/n_{\mathrm{eff}}\), which Taillaert et al. state directly. Tilting the beam forward needs a slightly longer period, tilting it backward a shorter one. There is a subtlety: in a strong grating, \(n_{\mathrm{eff}}\) is not the index of the plain waveguide. It is an average over the etched and unetched parts, and Zhou et al. point out that for a shallow-etched GaAs grating it is set by the fill factor and etch depth. Change \(n_{\mathrm{eff}}\) to see how much the period moves.`,
eq: String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta} \qquad \text{vertical: } \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \]<div class="eqref">Ch. 2 Eq. (2.3), Zhou 2018 (angled), Taillaert 2006 (vertical)</div>`,
sym: [[String.raw`\(\theta\)`, "target emission angle, positive toward the propagation direction"], [String.raw`\(n_{\mathrm{eff}}\)`, "average effective index of the grating region"], [String.raw`fill factor \(f\)`, "fraction of each period left unetched"]],
how: [String.raw`Set \(m = -1\) in \(k_0 n_{\mathrm{c}} \sin\theta = k_0 n_{\mathrm{eff}} - 2\pi/\Lambda\).`, String.raw`Divide by \(k_0 = 2\pi/\lambda_0\): \(n_{\mathrm{c}} \sin\theta = n_{\mathrm{eff}} - \lambda_0/\Lambda\).`, String.raw`Solve for \(\Lambda\).`, "Taillaert et al. write only the vertical case. The angled form follows from the same condition."],
say: String.raw`The first-order period for emission at angle \(\theta\) is \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}} \sin\theta)\), which becomes \(\lambda_0/n_{\mathrm{eff}}\) for vertical emission. \(n_{\mathrm{eff}}\) is the average index of the grating region, set by fill factor and etch depth.`,
num: String.raw`\(n_{\mathrm{eff}} = 2.8\), \(\lambda_0 = 800\) nm: vertical \(\Lambda\) = <b>286 nm</b>, \(\theta = 10^\circ\) gives \(\Lambda = 800/(2.8 - 0.174) \approx\) <b>305 nm</b><br>Zhou et al. 2018, their GaAs grating at 930 nm: \(n_{\mathrm{eff}} = 2.79\), \(\theta = 10^\circ\), \(\Lambda\) = <b>355 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Average index n<sub>eff</sub>", 1.8, 3.4, 0.01, 2.8) + sl("th", "Target angle θ", -20, 20, 0.5, 10) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, th = +$("th").value; $("Nv").textContent = N.toFixed(2); $("thv").textContent = th + "°";
    const L = 800 / (N - Math.sin(th * Math.PI / 180)), ths = range(-20, 20, 81), Ls = ths.map(t => 800 / (N - Math.sin(t * Math.PI / 180)));
    let teeth = ""; const sc = 0.55; for (let k = 0; k * L * sc < 520; k++) teeth += `<rect x="${80 + k * L * sc}" y="200" width="${L * sc * 0.5}" height="18" fill="#7FA6D9"/>`;
    const a = th * Math.PI / 180;
    fig.innerHTML = svg(270, `${plot(80, 30, 520, 120, ths, Ls, -20, 20, 220, 420, "#378ADD", 2.5)}<line x1="80" x2="600" y1="150" y2="150" stroke="var(--p)"/><line x1="${80 + (th + 20) / 40 * 520}" x2="${80 + (th + 20) / 40 * 520}" y1="30" y2="150" stroke="#EF9F27" stroke-width="2"/><text class="ts" x="84" y="44">Λ (220 to 420 nm) versus θ (−20° to 20°)</text><rect x="70" y="218" width="540" height="12" fill="#7FA6D9"/>${teeth}<line x1="340" y1="196" x2="${340 + 70 * Math.sin(a)}" y2="${196 - 70 * Math.cos(a)}" stroke="#1D9E75" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="340" y="252" text-anchor="middle">grating drawn to scale with the computed period. Guided light travels to the right.</text>`);
    $("ro").innerHTML = `<div><span>period Λ</span><b>${L.toFixed(1)} nm</b></div><div><span>vertical period λ₀/n<sub>eff</sub></span><b>${(800 / N).toFixed(1)} nm</b></div>`;
  };
  $("N").oninput = u; $("th").oninput = u; u();
}},

/* new card: fill factor (Sec. 2.3, Zhou 2018) */
{s: "3b. Fill factor", t: "Fill factor: how much of each period is left unetched",
intu: String.raw`Each period of the grating is one tooth of GaAs and one gap. The fill factor \(f\) is the fraction of the period that is left unetched, so the tooth is \(f\Lambda\) wide and the gap \((1 - f)\Lambda\). The guided light passes through both parts, so the \(n_{\mathrm{eff}}\) in Eq. 2.3 is an average over the etched and unetched parts of a period. Zhou et al. point out that it is set by the fill factor and the etch depth. In the thesis the gratings are etched through the membrane, so every gap is air, and the width of every tooth and every gap is a design variable. The local fill factor therefore varies along the grating. Move \(f\) and watch the average index and the period it needs. Then add tooth-to-tooth variation and read the local \(f(x)\), the local average index and the local period below the drawing. The variation shapes are geometric illustrations only, and the average index uses a simple linear mix that shows the trend.`,
eq: String.raw`\[ w_{\text{tooth}} = f\Lambda, \qquad w_{\text{gap}} = (1 - f)\,\Lambda \]\[ \Lambda = \frac{\lambda_0}{n_{\mathrm{eff}}(f,\ \text{etch depth}) - n_c \sin\theta} \]<div class="eqnote">simple estimate used in the picture, for a fully etched membrane (trend only)</div>\[ n_{\mathrm{eff}} \approx f\, n_{\mathrm{slab}} + (1 - f)\, n_c \]<div class="eqref">Ch. 2 Sec. 2.3 and Eq. (2.3), Zhou 2018</div>`,
sym: [[String.raw`\(f\)`, "fill factor, the unetched fraction of one period"], [String.raw`\(\Lambda\)`, "period, tooth plus gap"], [String.raw`\(w_{\text{tooth}}, w_{\text{gap}}\)`, "widths of the tooth and of the gap"], [String.raw`\(n_{\mathrm{eff}}\)`, "average effective index of one period, set by fill factor and etch depth"], [String.raw`\(n_{\mathrm{slab}}\)`, "effective index of the unetched membrane, computed here for 160 nm of n = 3.5 at 800 nm"], [String.raw`\(f(x), \Lambda(x)\)`, "local fill factor and local period when every tooth and gap has its own width"]],
how: [String.raw`Split one period into a tooth of width \(f\Lambda\) and a gap of width \((1 - f)\Lambda\). Together they make \(\Lambda\).`, String.raw`The guided wave spends part of each period under GaAs and part under the etched gap, so its phase advance over one period is an average, written as \(k_0 n_{\mathrm{eff}}\Lambda\) with \(n_{\mathrm{eff}}\) between the gap value and the tooth value.`, String.raw`More GaAs in the period (larger \(f\)) or a shallower etch raises \(n_{\mathrm{eff}}\). By Eq. 2.3 a higher \(n_{\mathrm{eff}}\) needs a shorter period for the same angle.`, String.raw`The linear mix \(f n_{\mathrm{slab}} + (1 - f) n_c\) only shows this trend. The true average comes from a simulation of the period.`, String.raw`When every tooth and every gap has its own width, \(f\) and \(\Lambda\) become local quantities \(f(x)\) and \(\Lambda(x)\) that change from one period to the next. That is the situation in the thesis gratings (Chapters 3 and 5).`],
say: String.raw`The fill factor is the unetched fraction of a period, so a tooth is \(f\Lambda\) wide and a gap \((1 - f)\Lambda\). The \(n_{\mathrm{eff}}\) in the period equation is an average over the period, set by the fill factor and the etch depth. In the thesis the teeth are etched through the membrane and every tooth and gap has its own width, so the local fill factor varies along the grating.`,
num: String.raw`Live slab solution for 160 nm, \(n = 3.5\), 800 nm, TE: \(n_{\mathrm{slab}} \approx 3.08\).<br>Linear-mix estimate at \(\theta = 10°\): \(f = 0.5\) gives \(n_{\mathrm{eff}} \approx 2.04\) and \(\Lambda \approx\) <b>429 nm</b>. \(f = 0.7\) gives \(n_{\mathrm{eff}} \approx 2.45\) and \(\Lambda \approx\) <b>351 nm</b>.<br>Method example from Ch. 3: tooth and gap widths are kept between 80 nm and 1 µm.`,
note: "If asked whether the gratings are apodized: the thesis does not impose an apodization profile. Every tooth and gap width is a free design variable chosen by the optimizer, so the local fill factor simply varies along the grating as the design requires (Chapters 3 and 5).",
r(fig, ctl) {
  const ns = C2.slabN(3.5, 1, 160, 800, 0, "TE"), th = 10 * Math.PI / 180, K = 10;
  const RND = [0.62, -0.35, 0.91, -0.8, 0.15, -0.55, 0.4, 0.98, -0.2, -0.7];
  let shape = "ramp";
  ctl.innerHTML = sl("f", "Fill factor f (mean)", 0.3, 0.8, 0.01, 0.5) + sl("a", "Tooth-to-tooth variation", 0, 0.25, 0.01, 0.12) + btns([["ramp", "Smooth change along x"], ["free", "Every tooth its own width"]], "sh") + '<div class="readout" id="ro"></div>';
  const SUB = t => `<tspan baseline-shift="sub" font-size="9">${t}</tspan>`;
  const u = () => {
    pick(ctl, "sh", shape);
    const f0 = +$("f").value, a = +$("a").value; $("fv").textContent = f0.toFixed(2); $("av").textContent = "± " + a.toFixed(2);
    const fs = [], nb = [], Ls = [];
    for (let k = 0; k < K; k++) { const g = shape === "ramp" ? 1 - 2 * k / (K - 1) : RND[k]; const f = Math.min(0.9, Math.max(0.15, f0 + a * g)); const n = f * ns + (1 - f); fs.push(f); nb.push(n); Ls.push(800 / (n - Math.sin(th))); }
    const tot = Ls.reduce((x, y) => x + y, 0), x0 = 120, sc = 520 / Math.max(tot, 4300), hm = Math.max(22, 160 * sc), ym = 64;
    let s = `<text class="ts" x="20" y="16">side view, lengths to scale (thickness enlarged). Teeth etched through the membrane, air in the gaps</text>`;
    s += `<rect x="40" y="${ym}" width="${x0 - 40}" height="${hm}" fill="#7FA6D9"/><text class="ts" x="44" y="${ym + hm + 16}">input guide</text>`;
    let x = x0; const xs = [];
    for (let k = 0; k < K; k++) { const wt = fs[k] * Ls[k] * sc, wg = (1 - fs[k]) * Ls[k] * sc; xs.push([x, x + Ls[k] * sc]); s += `<rect x="${x.toFixed(1)}" y="${ym}" width="${wt.toFixed(1)}" height="${hm}" fill="#7FA6D9"/>`; x += wt + wg; }
    // annotate the first period
    const [p0, p1] = xs[0], pt = p0 + fs[0] * Ls[0] * sc;
    s += `<line x1="${p0}" x2="${p1}" y1="${ym - 10}" y2="${ym - 10}" stroke="var(--t)" stroke-width="1" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${(p0 + p1) / 2}" y="${ym - 15}" text-anchor="middle">Λ${SUB("1")}</text>`;
    s += `<line x1="${(p0 + pt) / 2}" x2="${(p0 + pt) / 2}" y1="${ym + hm + 2}" y2="${ym + hm + 12}" stroke="#378ADD"/><text class="ts" x="${(p0 + pt) / 2}" y="${ym + hm + 24}" text-anchor="middle" fill="#378ADD">tooth fΛ</text>`;
    s += `<line x1="${(pt + p1) / 2}" x2="${(pt + p1) / 2}" y1="${ym + hm + 2}" y2="${ym + hm + 30}" stroke="#D85A30"/><text class="ts" x="${(pt + p1) / 2 + 4}" y="${ym + hm + 40}" fill="#D85A30">gap (1 − f)Λ, air</text>`;
    s += `<line x1="44" x2="${x0 - 8}" y1="${ym - 10}" y2="${ym - 10}" stroke="#D85A30" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="44" y="${ym - 16}">guided light</text>`;
    // three aligned plots
    const rows = [[150, "local f", fs, 0, 1, "#1D9E75", v => v.toFixed(2)], [235, "n" + SUB("eff") + " estimate", nb, 1, 3.5, "#7F77DD", v => v.toFixed(2)], [320, "local Λ (nm)", Ls, 250, 750, "#BA7517", v => v.toFixed(0)]];
    for (const [y0, lab, vals, lo, hi, col, fmt] of rows) {
      const H = 55, Y = v => y0 + H - (v - lo) / (hi - lo) * H;
      s += `<line x1="${x0}" x2="650" y1="${y0 + H}" y2="${y0 + H}" stroke="var(--p)"/><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y0 + H}" stroke="var(--p)"/><text class="ts" x="${x0 - 32}" y="${y0 + H / 2 + 4}" text-anchor="end">${lab}</text><text class="ts" x="${x0 - 4}" y="${y0 + H}" text-anchor="end">${lo}</text><text class="ts" x="${x0 - 4}" y="${y0 + 8}" text-anchor="end">${hi}</text>`;
      vals.forEach((v, k) => { const [xa, xb] = xs[k]; s += `<line x1="${xa.toFixed(1)}" x2="${(xb - 1).toFixed(1)}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${col}" stroke-width="3"/>`; if (k === 0 || k === K - 1) s += `<text class="ts" x="${((xa + xb) / 2).toFixed(1)}" y="${(Y(v) - 6).toFixed(1)}" text-anchor="middle" fill="${col}">${fmt(v)}</text>`; });
      if (lab.startsWith("n")) [[ns, "n" + SUB("slab")], [1, "n" + SUB("c") + " = 1"]].forEach(([v, t]) => s += `<line x1="${x0}" x2="650" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.7"/><text class="ts" x="648" y="${Y(v) - 4}" text-anchor="end">${t}</text>`);
    }
    s += `<line x1="${x0}" x2="${x0 + 1000 * sc}" y1="408" y2="408" stroke="var(--t)" stroke-width="2"/><text class="ts" x="${x0 + 1000 * sc + 8}" y="412">1 µm</text><text class="ts" x="650" y="412" text-anchor="end">each segment spans one period of the drawing above</text>`;
    fig.innerHTML = svg(420, s);
    const mf = fs.reduce((x, y) => x + y, 0) / K;
    $("ro").innerHTML = `<div><span>n<sub>slab</sub> (live slab solution)</span><b>${ns.toFixed(2)}</b></div><div><span>mean f</span><b>${mf.toFixed(2)}</b></div><div><span>local Λ range</span><b>${Math.min(...Ls).toFixed(0)} to ${Math.max(...Ls).toFixed(0)} nm</b></div><div><span>grating length</span><b>${(tot / 1000).toFixed(2)} µm</b></div>`;
  };
  ctl.querySelectorAll("button[data-sh]").forEach(b => b.onclick = () => { shape = b.dataset.sh; if (+$("a").value === 0) $("a").value = 0.15; u(); });
  $("f").oninput = u; $("a").oninput = u; u();
}},

/* from old ch2 L5 card 5 */
{s: "4. Not vertical", t: "Why not straight up: the second order",
intu: String.raw`At exactly vertical emission, the period is one guide wavelength. Then two kicks, the second order, take \(\beta\) exactly to \(-\beta\): the mode travelling backwards. The grating becomes a Bragg mirror and reflects a large part of the light back into the waveguide. Taillaert et al. avoid this by detuning the period so the beam leaves at a small angle, and tilting the fiber to match. Drag the angle toward zero and watch the second-order point land on the backward mode.`,
eq: String.raw`\[ \theta = 0: \quad \frac{2\pi}{\Lambda} = \beta \;\Longrightarrow\; \beta - \frac{4\pi}{\Lambda} = -\beta \]<div class="eqnote">the second order is the same mode travelling backward, so the grating reflects</div><div class="eqref">Ch. 2 Sec. 2.3 with Eq. (2.3) at θ = 0, Taillaert 2006</div>`,
sym: [[String.raw`\(-\beta\)`, "propagation constant of the same mode travelling backward"], ["second order", String.raw`\(m = -2\), two grating kicks`]],
how: [String.raw`At \(\theta = 0\), Eq. 2.3 gives \(\Lambda = \lambda_0/n_{\mathrm{eff}}\), which is the same as \(2\pi/\Lambda = \beta\).`, String.raw`The second order, \(m = -2\), then has \(\beta - 4\pi/\Lambda = -\beta\).`, "That is exactly the backward guided mode, so the grating couples forward light into backward light: a Bragg reflection.", String.raw`A small angle detunes the second order away from \(-\beta\) and suppresses the reflection.`],
say: "Exactly vertical emission is avoided because the second diffraction order then matches the backward guided mode and the grating reflects strongly. The period is detuned for a small emission angle and the fiber is tilted to match.",
num: "Taillaert et al. tilt the fiber by <b>10°</b>.<br>Zhou et al. also use <b>10°</b> on their GaAs membrane grating and report back reflection below <b>1 %</b>.",
r(fig, ctl) {
  ctl.innerHTML = sl("th", "Emission angle θ", -15, 15, 0.5, 6) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const th = +$("th").value, N = 2.8; $("thv").textContent = th + "°";
    const L = 800 / (N - Math.sin(th * Math.PI / 180)), K = 800 / L, v2 = N - 2 * K, cx = 340, cy = 150, sc = 60;
    const miss = Math.abs(v2 + N);
    fig.innerHTML = svg(260, `<circle cx="${cx}" cy="${cy}" r="${sc}" fill="#378ADD" fill-opacity="0.1" stroke="#378ADD"/><line x1="20" x2="660" y1="${cy}" y2="${cy}" stroke="var(--p)"/><circle cx="${cx + N * sc}" cy="${cy}" r="6" fill="#D85A30"/><text class="ts" x="${cx + N * sc}" y="${cy - 12}" text-anchor="middle">+β</text><circle cx="${cx - N * sc}" cy="${cy}" r="6" fill="none" stroke="#D85A30" stroke-width="2"/><text class="ts" x="${cx - N * sc}" y="${cy - 12}" text-anchor="middle">−β (backward)</text><circle cx="${cx + v2 * sc}" cy="${cy + 26}" r="6" fill="${miss < 0.05 ? "#D85A30" : "#888780"}"/><text class="ts" x="${cx + v2 * sc}" y="${cy + 48}" text-anchor="middle">m = −2</text><text class="th" x="340" y="34" text-anchor="middle">${miss < 0.05 ? "second order hits −β: strong back reflection" : "second order misses −β"}</text>`);
    $("ro").innerHTML = `<div><span>period</span><b>${L.toFixed(1)} nm</b></div><div><span>distance of m = −2 from −β</span><b>${miss.toFixed(3)} k₀</b></div>`;
  };
  $("th").oninput = u; u();
}},

/* from old ch2 L5 card 6, rebuilt as a step-through (Sec. 2.3, Taillaert 2006) */
{s: "5. Efficiency limits", t: "The two factors that limit the coupling efficiency",
intu: String.raw`The coupling efficiency (CE) is the fraction of the guided power that ends up in the fiber mode. Taillaert et al. identify two factors that limit it, and the thesis uses the same two. First, the grating radiates downward as well as upward. A grating etched through a membrane with air above and below radiates about equally in both directions, so without a mirror about half of the radiated power is lost. A mirror below the grating addresses this factor (Lesson 5). Second, the field radiated by a uniform grating decays roughly exponentially along the grating, because each tooth takes a fixed fraction of what is left, and an exponential does not match the Gaussian fiber mode. Step through the picture in the order you would draw it on the board, then change the leakage rate and the fiber size and press Find best \(\alpha\) to see that the overlap stops near 80 %.`,
eq: String.raw`\[ \mathrm{CE} = \frac{P_{\text{fiber mode}}}{P_{\text{guided}}} \]<div class="eqnote">factor 1, membrane with air on both sides</div>\[ P_{\text{up}} \approx P_{\text{down}} \;\Longrightarrow\; \text{about half is lost without a mirror} \]<div class="eqnote">factor 2, shape mismatch (standard overlap, written out here as an illustration)</div>\[ \eta = \frac{\left|\int E\, G\, dx\right|^{2}}{\int |E|^{2}\, dx \int |G|^{2}\, dx}, \qquad E \propto e^{-\alpha x}\ (x \ge 0), \quad G \propto e^{-(x - x_0)^2/w_0^2} \]<div class="eqref">Ch. 2 Sec. 2.3, Taillaert 2006</div>`,
sym: [[String.raw`\(\mathrm{CE}\)`, "coupling efficiency, guided power into the fiber mode"], [String.raw`\(P_{\text{up}}, P_{\text{down}}\)`, "power radiated toward the fiber and toward the substrate"], [String.raw`\(E(x)\)`, "field radiated upward along the grating"], [String.raw`\(G(x)\)`, String.raw`Gaussian fiber mode, centred at \(x_0\), field radius \(w_0\)`], [String.raw`\(\alpha\)`, "leakage rate of the field along the grating (1/µm)"], [String.raw`\(\eta\)`, "overlap, the fraction of the upward beam that the fiber mode accepts"]],
how: ["A grating etched through a membrane that has air above and below is close to mirror symmetric about its mid-plane, so it radiates about the same power up and down.", "Without a mirror the downward half never reaches the fiber. A mirror below the grating sends it back up. That is the first factor and its fix.", String.raw`A uniform grating removes the same fraction of the remaining guided power per unit length, so the guided power decays as \(e^{-2\alpha x}\) and the radiated field as \(e^{-\alpha x}\).`, String.raw`The fiber accepts only the part of this beam that looks like its Gaussian mode, which is the overlap \(\eta\).`, String.raw`An exponential with a sharp front edge never matches a Gaussian. Optimizing \(\alpha\) and the fiber position gives at most about 80 %, at \(\alpha w_0 \approx 0.68\). Changing the grating along its length can bring the beam closer to a Gaussian.`],
say: "Two factors limit the efficiency of a grating coupler. A grating etched through a membrane in air radiates about equally up and down, so without a mirror about half is lost. And the radiated field of a uniform grating decays exponentially along the grating, so it does not match the Gaussian fiber mode.",
num: String.raw`Overlap computed on this card: at most about <b>80 %</b>, reached at \(\alpha w_0 \approx 0.68\). For \(w_0 = 5.2\) µm that is \(\alpha \approx 0.13\) per µm.<br>Without a mirror, the upward share is about <b>50 %</b>.`,
note: "The thesis shows both factors for its own designs with the reverse simulations of Chapter 5. Those results are not shown on this site.",
r(fig, ctl) {
  let step = 1, playing = true, tPlay = 0, last = performance.now(), tNow = 0;
  ctl.innerHTML = sl("a", "Leakage rate α (1/µm)", 0.05, 0.8, 0.005, 0.2) + sl("w", "Fiber mode radius w₀ (µm)", 2, 8, 0.1, 5.2) + `<div class="row"><button id="eb">Back</button><button id="en">Next step</button><button id="ep">Pause</button><button id="eo">Find best α</button><span id="es" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div><div class="readout" id="ro"></div>`;
  fig.innerHTML = `<div id="esv"></div><p class="note" id="ec" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const CAP = ["",
    "Step 1. The guided mode enters the grating from the left. Every tooth scatters a little of it, so the guided field (coral) shrinks along the grating, roughly exponentially for a uniform grating.",
    "Step 2. First factor. The membrane has air above and below, so the grating radiates about equally up and down (teal). Without a mirror about half of the radiated power is lost downward.",
    "Step 3. A mirror below the grating sends the downward light back up (purple). This addresses the first factor. Lesson 5 builds the DBR mirror and explains why the air gap matters.",
    "Step 4. Second factor. The radiated field follows the guided field, so it decays roughly exponentially along the grating (coral curve). The fiber mode is a Gaussian (blue dashed).",
    "Step 5. The fiber accepts only the overlap of the two shapes. An exponential with a sharp front edge never matches a Gaussian. Press Find best α: the overlap stops near 80 %."];
  const X = x => 60 + (x + 8) / 36 * 560, ym = 182, hm = 12, yD = 268;
  const draw = () => {
    const t = tNow, al = +$("a").value, w = +$("w").value; $("av").textContent = al.toFixed(3); $("wv").textContent = w.toFixed(1) + " µm";
    const [eta, x0] = L4_bestX0(al, w), A = x => x < 0 ? 1 : Math.exp(-al * x);
    let s = "";
    // membrane: plain guide then fully etched teeth
    s += `<rect x="${X(-8)}" y="${ym}" width="${X(0) - X(-8)}" height="${hm}" fill="#7FA6D9"/>`;
    for (let x = 0; x < 28; x += 1.2) s += `<rect x="${X(x).toFixed(1)}" y="${ym}" width="${(0.6 / 36 * 560).toFixed(1)}" height="${hm}" fill="#7FA6D9"/>`;
    s += `<text class="ts" x="${X(-7.6)}" y="${ym + hm + 16}">membrane</text><text class="ts" x="${X(0) - 4}" y="${ym - 8}" text-anchor="end">grating starts at x = 0</text>`;
    // guided wave with decaying envelope
    let d = ""; for (let px = X(-8); px <= X(28); px += 3) { const x = (px - 60) / 560 * 36 - 8; d += (d ? "L" : "M") + px.toFixed(1) + " " + (ym + hm / 2 + 7 * A(x) * Math.sin((px - t * 90) / 8)).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="#D85A30" stroke-width="2"/>`;
    // radiated light up and down
    if (step >= 2) for (let x = 0.3; x < 28; x += 1.2) {
      const amp = A(x), px = X(x);
      for (let k = 0; k < 3; k++) {
        const ph = ((t * 0.7 + k / 3) % 1), yu = ym - 6 - ph * 64, yd = ym + hm + 6 + ph * (yD - ym - hm - 14);
        s += `<line x1="${(px - 4).toFixed(1)}" x2="${(px + 4).toFixed(1)}" y1="${yu.toFixed(1)}" y2="${yu.toFixed(1)}" stroke="#1D9E75" stroke-width="2" opacity="${(0.15 + 0.85 * amp * (1 - 0.6 * ph)).toFixed(2)}"/>`;
        s += `<line x1="${(px - 4).toFixed(1)}" x2="${(px + 4).toFixed(1)}" y1="${yd.toFixed(1)}" y2="${yd.toFixed(1)}" stroke="#1D9E75" stroke-width="2" opacity="${(0.15 + 0.85 * amp * (1 - 0.6 * ph)).toFixed(2)}"/>`;
        if (step >= 3) { const yr = yD - 6 - ph * (yD - ym - hm - 14); s += `<line x1="${(px + 1).toFixed(1)}" x2="${(px + 7).toFixed(1)}" y1="${yr.toFixed(1)}" y2="${yr.toFixed(1)}" stroke="#7F77DD" stroke-width="2" stroke-dasharray="2 2" opacity="${(0.15 + 0.8 * amp).toFixed(2)}"/>`; }
      }
    }
    if (step >= 2) { s += `<text class="th" x="${X(29)}" y="${ym - 40}" text-anchor="end" fill="#1D9E75">up ≈ 50 %</text>`; s += step >= 3 ? `<text class="th" x="${X(29)}" y="${yD - 34}" text-anchor="end" fill="#7F77DD">sent back up by the mirror</text>` : `<text class="th" x="${X(29)}" y="${yD - 20}" text-anchor="end" fill="#E24B4A">down ≈ 50 %, lost</text>`; }
    if (step >= 3) { for (let i = 0; i < 6; i++) s += `<rect x="${X(-8)}" y="${yD + i * 6}" width="${X(28) - X(-8)}" height="6" fill="${i % 2 ? "#C9D6EA" : "#7FA6D9"}" opacity="0.85"/>`; s += `<text class="ts" x="${X(-7.6)}" y="${yD + 50}">mirror (DBR) below the air gap</text>`; }
    // profile panel
    if (step >= 4) {
      const xs = range(-8, 28, 361), E = xs.map(A).map((v, i) => xs[i] < 0 ? 0 : v), G = xs.map(x => Math.exp(-Math.pow((x - x0) / w, 2)));
      if (step >= 5) { let dd = `M${X(-8)} 110`; xs.forEach((x, i) => dd += `L${X(x).toFixed(1)} ${(110 - 70 * Math.min(E[i], G[i])).toFixed(1)}`); dd += `L${X(28)} 110Z`; s += `<path d="${dd}" fill="#EF9F27" opacity="0.25"/>`; }
      s += plot(60, 40, 560, 70, xs, E, -8, 28, 0, 1, "#D85A30", 2.5) + plot(60, 40, 560, 70, xs, G, -8, 28, 0, 1, "#378ADD", 2.5, "5 4");
      s += `<line x1="60" x2="620" y1="110" y2="110" stroke="var(--p)"/><text class="ts" x="62" y="30">field at the fiber plane. Coral: radiated beam. Blue dashed: fiber mode${step >= 5 ? ". Amber: where they overlap" : ""}</text>`;
      if (step >= 5) s += `<text class="th" x="${X(x0)}" y="${ym - 48}" text-anchor="middle">overlap η = ${(eta * 100).toFixed(1)} %</text>`;
    } else s += `<text class="ts" x="62" y="30">side view, not to scale. The fiber sits above, tilted slightly (not drawn)</text>`;
    $("esv").innerHTML = svg(330, s);
    $("ec").textContent = CAP[step]; $("es").textContent = `step ${step} of 5`;
    $("eb").disabled = step === 1; $("en").disabled = step === 5;
    $("ro").innerHTML = `<div><span>overlap η</span><b>${(eta * 100).toFixed(1)} %</b></div><div><span>best fiber centre x₀</span><b>${x0.toFixed(1)} µm</b></div><div><span>α w₀</span><b>${(al * w).toFixed(2)}</b></div>`;
  };
  const stop = () => { playing = false; $("ep").textContent = "Play"; };
  $("eb").onclick = () => { step = Math.max(1, step - 1); stop(); draw(); };
  $("en").onclick = () => { step = Math.min(5, step + 1); stop(); draw(); };
  $("ep").onclick = () => { playing = !playing; if (playing && step === 5) step = 1; tPlay = 0; $("ep").textContent = playing ? "Pause" : "Play"; draw(); };
  $("eo").onclick = () => { const w = +$("w").value; let best = [0, 0.2]; for (let a = 0.05; a <= 0.8; a += 0.005) { const v = L4_bestX0(a, w)[0]; if (v > best[0]) best = [v, a]; } $("a").value = best[1].toFixed(3); if (step < 5) step = 5; stop(); draw(); };
  $("a").oninput = draw; $("w").oninput = draw;
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now; tNow = t;
    if (playing) { tPlay += dt; if (tPlay > 4) { tPlay = 0; if (step < 5) step++; else stop(); } }
    draw();
  });
}},

/* from old ch2 L5 card 7 */
{s: "6. Polarization", t: "One grating, one polarization",
intu: "TE-like and TM-like modes have very different effective indices (Lessons 2 and 3), and the TM-like index is the lower one. Feed both into the same grating and phase matching sends them out at very different angles, so a coupler designed for one polarization barely couples the other into the fiber. Taillaert et al. call grating couplers strongly polarization selective for this reason. The same physics makes the emission angle shift with wavelength, so a coupler only works over a band: Taillaert et al. found about 9 nm of center-wavelength shift per degree of fiber tilt. Drag the period and compare the two polarizations.",
eq: String.raw`\[ \sin\theta_{\mathrm{TE}} = n_{\mathrm{eff}}^{\mathrm{TE}} - \frac{\lambda_{0}}{\Lambda}, \qquad \sin\theta_{\mathrm{TM}} = n_{\mathrm{eff}}^{\mathrm{TM}} - \frac{\lambda_{0}}{\Lambda} \qquad (n_{\mathrm{c}} = 1,\ m = -1) \]\[ \Lambda_{\mathrm{TM}} \gt \Lambda_{\mathrm{TE}} \ \text{for the same angle} \]<div class="eqref">Ch. 2 Eq. (2.3) for each polarization, Sec. 2.3, Taillaert 2006</div>`,
sym: [[String.raw`\(n_{\mathrm{eff}}^{\mathrm{TE}}, n_{\mathrm{eff}}^{\mathrm{TM}}\)`, "average effective indices of the grating for each polarization"], [String.raw`\(\theta_{\mathrm{TE}}, \theta_{\mathrm{TM}}\)`, "their emission angles for the same period"]],
how: ["Apply phase matching separately to each polarization.", String.raw`\(n_{\mathrm{eff}}^{\mathrm{TM}} \lt n_{\mathrm{eff}}^{\mathrm{TE}}\), so for the same period the TM beam leaves at a more negative angle.`, "To make TM leave at the design angle the period must be longer.", "So each polarization needs its own grating design."],
say: "Grating couplers are strongly polarization selective, because TE-like and TM-like modes have very different effective indices. A TM coupler needs a longer period than a TE coupler for the same angle.",
num: String.raw`Example \(n_{\mathrm{eff}}^{\mathrm{TE}} = 2.8\), \(n_{\mathrm{eff}}^{\mathrm{TM}} = 2.3\), \(\lambda_0 = 800\) nm, \(\Lambda = 305\) nm: \(\theta_{\mathrm{TE}} \approx\) <b>10°</b>, \(\theta_{\mathrm{TM}} \approx\) <b>−19°</b><br>Taillaert et al.: about <b>9 nm per degree</b> of fiber tilt (SOI at 1550 nm).`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Period Λ", 250, 450, 1, 305) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const L = +$("L").value; $("Lv").textContent = L + " nm";
    const s1 = 2.8 - 800 / L, s2 = 2.3 - 800 / L, cx = 340, cy = 210;
    const ray = (s, col, lab) => Math.abs(s) < 1 ? `<line x1="${cx}" y1="${cy}" x2="${cx + 170 * s}" y2="${cy - 170 * Math.sqrt(1 - s * s)}" stroke="${col}" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="${cx + 185 * s}" y="${cy - 180 * Math.sqrt(1 - s * s)}" text-anchor="middle">${lab} ${(Math.asin(s) * 180 / Math.PI).toFixed(1)}°</text>` : `<text class="ts" x="${cx}" y="${lab === "TE" ? 60 : 80}" text-anchor="middle">${lab}: order −1 does not radiate</text>`;
    fig.innerHTML = svg(260, `<rect x="120" y="${cy}" width="440" height="14" fill="#7FA6D9"/><line x1="${cx}" x2="${cx}" y1="30" y2="${cy}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><g class="c-gray"><rect x="${cx + 170 * Math.sin(10 * Math.PI / 180) - 30}" y="20" width="60" height="16" rx="3" stroke-width="0.5"/></g><text class="ts" x="${cx + 170 * Math.sin(10 * Math.PI / 180)}" y="32" text-anchor="middle">fiber at 10°</text>${ray(s1, "#378ADD", "TE")}${ray(s2, "#D85A30", "TM")}<text class="ts" x="340" y="248" text-anchor="middle">same grating, two polarizations</text>`);
    $("ro").innerHTML = `<div><span>θ TE (n<sub>eff</sub> = 2.8)</span><b>${Math.abs(s1) < 1 ? (Math.asin(s1) * 180 / Math.PI).toFixed(1) + "°" : "—"}</b></div><div><span>θ TM (n<sub>eff</sub> = 2.3)</span><b>${Math.abs(s2) < 1 ? (Math.asin(s2) * 180 / Math.PI).toFixed(1) + "°" : "—"}</b></div>`;
  };
  $("L").oninput = u; u();
}}


],
summary: String.raw`A guided mode has \(\beta = k_0 n_{\mathrm{eff}} \gt k_0 n_c\), so a smooth membrane cannot radiate. A grating of period \(\Lambda\) scatters it into orders \(m\) that leave at \(k_0 n_c \sin\theta_m = \beta + m\,2\pi/\Lambda\) (Eq. 2.2), and the light from successive teeth adds up in phase in that direction. Choosing the first order toward the fiber gives \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_c\sin\theta)\) (Eq. 2.3), or \(\lambda_0/n_{\mathrm{eff}}\) for vertical emission. TM-like light has a lower \(n_{\mathrm{eff}}\) and needs a longer period. The fill factor \(f\) is the unetched fraction of a period, and \(n_{\mathrm{eff}}\) is an average over the period set by fill factor and etch depth. In the thesis the teeth are etched through the membrane and every tooth and gap has its own width, so the local fill factor varies along the grating. Vertical emission is avoided because the second order then couples the forward mode into the backward one, so the period is detuned and the fiber tilted. The efficiency is limited by downward radiation, about half without a mirror, and by the mismatch between the exponential beam and the Gaussian fiber mode.`,
sheet: [
[String.raw`\[ k_{0} n_{c} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda} \]`, "Phase matching, order m (Ch. 2 Eq. 2.2)"],
[String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{c}\sin\theta}, \qquad \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \ \text{(vertical)} \]`, "Period for the first order (Ch. 2 Eq. 2.3, Zhou 2018, Taillaert 2006)"],
[String.raw`\[ w_{\text{tooth}} = f\Lambda, \qquad w_{\text{gap}} = (1 - f)\,\Lambda \]`, String.raw`Fill factor. The average \(n_{\mathrm{eff}}\) of a period is set by \(f\) and the etch depth (Zhou 2018)`],
[String.raw`\[ \theta = 0: \ \frac{2\pi}{\Lambda} = \beta \;\Longrightarrow\; \beta - \frac{4\pi}{\Lambda} = -\beta \]`, "Why vertical emission is avoided (Sec. 2.3, Taillaert 2006)"],
[String.raw`\[ P_{\text{up}} \approx P_{\text{down}}, \qquad \eta = \frac{\left|\int E G\, dx\right|^{2}}{\int |E|^{2} dx \int |G|^{2} dx} \]`, "The two efficiency limits: downward radiation and the beam shape (Taillaert 2006)"]],
consts: String.raw`Examples use \(\lambda_0 = 800\) nm, air cladding \(n_c = 1\), a 160 nm membrane of \(n = 3.5\) and illustrative indices such as \(n_{\mathrm{eff}} = 2.8\). Published numbers are quoted from the papers named.`,
sources: ["Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006): grating couplers in silicon-on-insulator. Phase matching, the vertical period, why the emission is detuned from vertical, the two factors that limit the efficiency, mirrors, polarization selectivity.", "Zhou et al., Appl. Phys. Lett. 113, 251103 (2018): grating couplers on suspended GaAs membranes near 930 nm. The angled period and the average index set by fill factor and etch depth."]
});
