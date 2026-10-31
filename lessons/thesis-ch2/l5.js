addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l5", title: "Grating couplers", short: "5. Grating couplers",
big: String.raw`A guided mode cannot leave the chip on its own because it travels faster along the surface than light in air can match. A grating adds a momentum kick \(K = 2\pi/\Lambda\) every period. Subtract one kick from the mode's \(\beta\) and the remainder can fit inside the circle of light in air: the light leaves at an angle set by phase matching. Choosing the period sets the angle. Exactly vertical emission is avoided because the second order then reflects light straight back. Efficiency is limited by light going down instead of up and by the beam shape not matching the fiber.`,
bridge: "Taillaert et al. 2006 is the main reference: a review from the Ghent group of short, strong grating couplers in silicon-on-insulator at 1550 nm. Zhou et al. 2018 brought these ideas to suspended GaAs membranes near 930 nm. Their published numbers are quoted as theirs.",
cards: [
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

{s: "2. Phase matching", t: "Phase matching: subtract grating kicks",
intu: String.raw`A grating of period \(\Lambda\) can add or remove any whole number of kicks \(K = 2\pi/\Lambda\). Each choice \(m\) is a diffraction order. Draw \(\beta\), subtract \(mK\), and check whether the tip lands inside the light circle of radius \(k_0 n_{\mathrm{c}}\). If it does, that order radiates, at the angle where the circle is hit. Light goes both up and down, because air is on both sides of a suspended membrane. Change the period and watch the orders move in and out of the circle. A coupler is designed so that only \(m = -1\) radiates.`,
eq: String.raw`\[ k_{0} n_{\mathrm{c}} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda}, \qquad m = 0, \pm 1, \pm 2, \dots \]\[ \text{order } m \text{ radiates if } \left|\beta + m\,\frac{2\pi}{\Lambda}\right| \lt k_{0} n_{\mathrm{c}} \]<div class="eqref">Ch. 2 Eq. (2.3)</div>`,
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

{s: "3. The period", t: "Choosing the period for a target angle",
intu: String.raw`Solve phase matching for \(m = -1\) and you get the period that sends light out at angle \(\theta\). For vertical emission it reduces to the simplest possible rule: one period equals one guide wavelength, \(\Lambda = \lambda_0/n_{\mathrm{eff}}\), which Taillaert et al. state directly. Tilting the beam forward needs a slightly longer period, tilting it backward a shorter one. There is a subtlety: in a strong grating, \(n_{\mathrm{eff}}\) is not the index of the plain waveguide. It is an average over the etched and unetched parts, and Zhou et al. point out that for a shallow-etched GaAs grating it is set by the fill factor and etch depth. Change \(n_{\mathrm{eff}}\) to see how much the period moves.`,
eq: String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta} \qquad \text{vertical: } \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \]<div class="eqref">Ch. 2 Eq. (2.4), Taillaert et al.</div>`,
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

{s: "4. Not vertical", t: "Why not straight up: the second order",
intu: String.raw`At exactly vertical emission, the period is one guide wavelength. Then two kicks, the second order, take \(\beta\) exactly to \(-\beta\): the mode travelling backwards. The grating becomes a Bragg mirror and reflects a large part of the light back into the waveguide. Taillaert et al. avoid this by detuning the period so the beam leaves at a small angle, and tilting the fiber to match. Drag the angle toward zero and watch the second-order point land on the backward mode.`,
eq: String.raw`\[ \theta = 0: \quad \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \;\Longrightarrow\; \beta - 2\cdot\frac{2\pi}{\Lambda} = \beta - 2\beta = -\beta \]<div class="eqnote">backward mode, strong reflection</div>`,
sym: [[String.raw`\(-\beta\)`, "propagation constant of the same mode travelling backward"], ["second order", String.raw`\(m = -2\), two grating kicks`]],
how: [String.raw`Vertical emission sets \(2\pi/\Lambda = \beta\).`, String.raw`The second order then has \(\beta - 2\cdot 2\pi/\Lambda = -\beta\).`, "That is exactly the backward guided mode, so the grating couples forward light into backward light: a Bragg reflection.", String.raw`A small angle detunes the second order away from \(-\beta\) and suppresses the reflection.`],
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

{s: "5. Efficiency limits", t: "Why a simple grating loses light",
intu: "Taillaert et al. name two main losses. First, a grating radiates down as well as up. A grating etched through a membrane with air on both sides is symmetric, so it sends about as much light down as up, and half is lost unless a mirror sends it back (Lesson 6). Second, the beam shape. A uniform grating leaks light at a constant rate, so the beam it emits decays exponentially along the grating, while the fiber mode is a Gaussian. Their overlap can never reach 100 %. This card computes that overlap live: adjust the leakage rate and fiber size and find the best possible match.",
eq: String.raw`\[ \text{beam: } E(x) = \sqrt{2\alpha}\, e^{-\alpha x} \ \ (x \ge 0) \qquad \text{fiber: } G(x) \text{ Gaussian of waist } w_{0} \]\[ \eta_{\mathrm{overlap}} = \frac{\left|\int E\, G\, \mathrm{d}x\right|^{2}}{\int |E|^{2}\, \mathrm{d}x \int |G|^{2}\, \mathrm{d}x} \qquad \text{best} \approx 80\,\% \]<div class="eqref">Taillaert et al.</div>`,
sym: [[String.raw`\(\alpha\)`, "leakage rate of the field along the grating (1/µm)"], [String.raw`\(w_{0}\)`, String.raw`fiber mode radius (\(1/e\) of the field)`], [String.raw`\(\eta_{\mathrm{overlap}}\)`, "fraction of the upward beam that enters the fiber mode"], [String.raw`\(x\)`, "position along the grating"]],
how: [String.raw`A uniform grating removes the same fraction of the remaining power per unit length, so the guided power decays as \(e^{-2\alpha x}\).`, String.raw`The emitted field is proportional to the local guided field, so it decays as \(e^{-\alpha x}\).`, "The power coupled into the fiber is the normalized overlap of this beam with the Gaussian fiber mode.", String.raw`Optimizing \(\alpha\) and the fiber position gives at most about 80 %. Shaping the beam (apodization, a nonuniform grating) can do better.`],
say: "A uniform grating is limited by downward radiation and by the mismatch between its exponential beam and the Gaussian fiber mode. The mode-overlap limit alone is about 80 %.",
num: String.raw`Taillaert et al. (SOI, TE): uniform grating 37 %, 79 % with a two-pair mirror. Nonuniform grating 61 %, and 92 % with a mirror.<br>Their measured efficiency per coupler, \(\sqrt{T}\) of two couplers, is a lower bound.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "Leakage α (1/µm)", 0.05, 0.8, 0.005, 0.2) + sl("w", "Fiber mode radius w₀ (µm)", 2, 8, 0.1, 5.2) + `<div class="row"><button id="opt">Find best α</button></div>` + '<div class="readout" id="ro"></div>';
  const xs = range(-20, 40, 900), dx = xs[1] - xs[0];
  const ov = (a, w) => { let best = 0, bx = 0; for (let x0 = -5; x0 <= 25; x0 += 0.25) { let s = 0, ee = 0, gg = 0; for (const x of xs) { const e = x >= 0 ? Math.exp(-a * x) : 0, g = Math.exp(-Math.pow((x - x0) / w, 2)); s += e * g; ee += e * e; gg += g * g; } const v = s * s / (ee * gg); if (v > best) { best = v; bx = x0; } } return [best, bx]; };
  const u = () => {
    const a = +$("a").value, w = +$("w").value; $("av").textContent = a.toFixed(3); $("wv").textContent = w.toFixed(1);
    const [eta, x0] = ov(a, w);
    const E = xs.map(x => x >= 0 ? Math.exp(-a * x) : 0), G = xs.map(x => Math.exp(-Math.pow((x - x0) / w, 2)));
    fig.innerHTML = svg(250, `${plot(60, 30, 560, 170, xs, E, -20, 40, 0, 1.05, "#D85A30", 2.5)}${plot(60, 30, 560, 170, xs, G, -20, 40, 0, 1.05, "#378ADD", 2.5, "5 4")}<line x1="60" x2="620" y1="200" y2="200" stroke="var(--p)"/><line x1="${60 + 20 / 60 * 560}" x2="${60 + 20 / 60 * 560}" y1="30" y2="200" stroke="var(--p)" stroke-dasharray="3 3"/><text class="ts" x="${64 + 20 / 60 * 560}" y="44">grating starts</text><text class="ts" x="340" y="222" text-anchor="middle">position along the grating, −20 to 40 µm. Coral: emitted beam. Blue dashed: fiber mode</text>`);
    $("ro").innerHTML = `<div><span>best overlap</span><b>${(eta * 100).toFixed(1)} %</b></div><div><span>fiber centre</span><b>${x0.toFixed(2)} µm</b></div><div><span>α w₀</span><b>${(a * w).toFixed(2)}</b></div>`;
  };
  $("opt").onclick = () => { const w = +$("w").value; let best = [0, 0]; for (let a = 0.05; a <= 0.8; a += 0.005) { const v = ov(a, w)[0]; if (v > best[0]) best = [v, a]; } $("a").value = best[1].toFixed(3); u(); };
  $("a").oninput = u; $("w").oninput = u; u();
}},

{s: "6. Polarization", t: "One grating, one polarization",
intu: "TE-like and TM-like modes have very different effective indices (Lesson 2, card 6). Feed both into the same grating and phase matching sends them out at very different angles, so a coupler designed for one polarization barely couples the other into the fiber. Taillaert et al. call grating couplers strongly polarization selective for this reason. The same physics makes the emission angle shift with wavelength, so a coupler only works over a band: Taillaert et al. found about 9 nm of center-wavelength shift per degree of fiber tilt. Drag the period and compare the two polarizations.",
eq: String.raw`\[ \sin\theta_{\mathrm{TE}} = n_{\mathrm{eff}}^{\mathrm{TE}} - \frac{\lambda_{0}}{\Lambda}, \qquad \sin\theta_{\mathrm{TM}} = n_{\mathrm{eff}}^{\mathrm{TM}} - \frac{\lambda_{0}}{\Lambda} \qquad (n_{\mathrm{c}} = 1,\ m = -1) \]\[ \Lambda_{\mathrm{TM}} \gt \Lambda_{\mathrm{TE}} \ \text{for the same angle} \]`,
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
summary: String.raw`A guided mode has \(\beta \gt k_0 n_{\mathrm{c}}\) and cannot radiate from a smooth guide. A grating of period \(\Lambda\) adds kicks of \(2\pi/\Lambda\), and order \(m\) radiates when \(\beta + m2\pi/\Lambda\) lies inside the light circle, at \(k_0 n_{\mathrm{c}} \sin\theta = \beta + m2\pi/\Lambda\). For \(m = -1\) this gives \(\Lambda = \lambda_0/(n_{\mathrm{eff}} - n_{\mathrm{c}} \sin\theta)\), or \(\lambda_0/n_{\mathrm{eff}}\) vertically, where \(n_{\mathrm{eff}}\) is the average index of the grating. Vertical emission is avoided because the second order then reflects light into the backward mode. Efficiency is limited by downward radiation and by the overlap of the exponential beam with the Gaussian fiber mode, about 80 % at best for a uniform grating. TE and TM need separate gratings.`,
sheet: [
[String.raw`\[ k_{0} n_{\mathrm{c}} \sin\theta_m = \beta + m\,\frac{2\pi}{\Lambda} \]`, "Phase matching (Ch. 2 Eq. 2.3)"],
[String.raw`\[ \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}} - n_{\mathrm{c}}\sin\theta}, \qquad \Lambda = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \ \text{(vertical)} \]`, "Period (Ch. 2 Eq. 2.4, Taillaert)"],
[String.raw`\[ \theta = 0 \;\Longrightarrow\; \beta - 2\cdot\frac{2\pi}{\Lambda} = -\beta \]`, "Second-order back reflection"],
[String.raw`\[ \eta = \frac{\left|\int E G\right|^{2}}{\int |E|^{2} \int |G|^{2}} \]`, "Mode overlap with the fiber"]],
consts: String.raw`Examples use \(\lambda_0 = 800\) nm, air cladding, illustrative indices. Published numbers are quoted from the papers named.`,
sources: ["Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (review of grating couplers in SOI: period, tilt, two efficiency limits, mirrors, 9 nm per degree, polarization selectivity)", "Zhou et al., Appl. Phys. Lett. 113, 251103 (2018) (shallow-etched, apodized grating on GaAs membranes near 930 nm, > 60 %)"]
});
