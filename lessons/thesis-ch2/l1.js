addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l1", title: "How a membrane guides light", short: "1. Guiding and effective index",
big: String.raw`Light stays inside a high-index layer because it hits the surfaces beyond the critical angle and is totally reflected. Only certain bounce angles survive, the ones whose round trip adds up in phase. Each surviving angle is a mode, and the speed at which it moves along the guide is described by one number, the effective index \(n_{\mathrm{eff}}\), which always lies between the cladding index and the core index. A suspended GaAs membrane in air gives the largest possible contrast.`,
bridge: "All numbers on this page are computed live from textbook formulas with round example values (GaAs about 3.5, air 1, 800 nm). They are not thesis results.",
cards: [
{s: "1. Snell", t: "Bending and trapping light: Snell's law and the critical angle",
intu: "When light crosses from a dense material (high index) into a thinner one (low index), it bends away from the normal. Tilt the ray more and more. At one angle the refracted ray skims along the surface, and beyond it no light can get out at all: everything is reflected back. That is total internal reflection, and the angle is the critical angle. The bigger the index contrast, the smaller the critical angle, so more ray directions are trapped. GaAs against air traps everything steeper than about 17° from the surface normal.",
eq: String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2} \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \quad (n_{1} \gt n_{2}) \]`,
sym: [[String.raw`\(n_{1}, n_{2}\)`, "refractive indices of the core and the cladding"], [String.raw`\(\theta_{1}, \theta_{2}\)`, "angles from the surface normal"], [String.raw`\(\theta_{\mathrm{c}}\)`, String.raw`critical angle. For \(\theta_1 \gt \theta_{\mathrm{c}}\) nothing is transmitted`]],
how: [String.raw`Along the interface, the incoming and the transmitted wave must have the same phase pattern, so their wavevector components along the surface match: \(k_0 n_1 \sin\theta_1 = k_0 n_2 \sin\theta_2\).`, String.raw`\(\sin\theta_2\) cannot exceed 1. That fails when \(n_1 \sin\theta_1 \gt n_2\).`, String.raw`The limit \(n_1 \sin\theta_{\mathrm{c}} = n_2\) defines the critical angle.`, "Beyond it the transmitted wave cannot propagate. It becomes an evanescent wave (card 2)."],
say: "Light is confined in the membrane by total internal reflection at both surfaces. The high index contrast of GaAs and air gives a small critical angle, about 17°.",
num: String.raw`GaAs (\(n \approx 3.5\)) to air: \(\theta_{\mathrm{c}} = \arcsin(1/3.5) \approx\) <b>16.6°</b><br>Silicon (3.48) to oxide (1.45): <b>24.6°</b><br>GaAs to AlGaAs (about 3.0): <b>59°</b>, much weaker trapping. This is why a low-index layer below GaAs has to be air (card 6).`,
r(fig, ctl) {
  ctl.innerHTML = sl("n1", "Core index n₁", 1.2, 4, 0.01, 3.5) + sl("th", "Angle from normal θ₁", 0, 89, 0.5, 12) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const n1 = +$("n1").value, th = +$("th").value; $("n1v").textContent = n1.toFixed(2); $("thv").textContent = th + "°";
    const a = th * Math.PI / 180, s2 = n1 * Math.sin(a), tir = s2 >= 1, tc = Math.asin(Math.min(1, 1 / n1)) * 180 / Math.PI;
    const cx = 340, cy = 170, L = 140;
    const inc = `<line x1="${cx - L * Math.sin(a)}" y1="${cy + L * Math.cos(a)}" x2="${cx}" y2="${cy}" stroke="#EF9F27" stroke-width="3" marker-end="url(#ar)"/>`;
    const refl = `<line x1="${cx}" y1="${cy}" x2="${cx + L * Math.sin(a)}" y2="${cy + L * Math.cos(a)}" stroke="#EF9F27" stroke-width="${tir ? 3 : 1.5}" opacity="${tir ? 1 : 0.5}" marker-end="url(#ar)"/>`;
    const tr = tir ? "" : (() => { const b = Math.asin(s2); return `<line x1="${cx}" y1="${cy}" x2="${cx + L * Math.sin(b)}" y2="${cy - L * Math.cos(b)}" stroke="#378ADD" stroke-width="3" marker-end="url(#ar)"/>`; })();
    const ac = tc * Math.PI / 180;
    fig.innerHTML = svg(320, `<rect x="40" y="${cy}" width="600" height="140" fill="var(--blue-bg)"/><text class="ts" x="50" y="${cy + 20}">core, n₁ = ${n1.toFixed(2)}</text><text class="ts" x="50" y="${cy - 10}">cladding, n₂ = 1 (air)</text><line x1="40" x2="640" y1="${cy}" y2="${cy}" stroke="var(--p)" stroke-width="1.5"/><line x1="${cx}" x2="${cx}" y1="30" y2="310" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><line x1="${cx}" y1="${cy}" x2="${cx - 150 * Math.sin(ac)}" y2="${cy + 150 * Math.cos(ac)}" stroke="#D85A30" stroke-dasharray="5 4"/><text class="ts" x="${cx - 150 * Math.sin(ac) - 4}" y="${cy + 150 * Math.cos(ac) + 14}" text-anchor="end">critical angle</text>${inc}${refl}${tr}${tir ? `<text class="th" x="${cx}" y="60" text-anchor="middle">total internal reflection</text>` : ""}`);
    $("ro").innerHTML = `<div><span>critical angle θ_c</span><b>${tc.toFixed(1)}°</b></div><div><span>n₁ sin θ₁</span><b>${s2.toFixed(3)}</b></div><div><span>result</span><b>${tir ? "trapped" : "escapes"}</b></div>`;
  };
  $("n1").oninput = u; $("th").oninput = u; u();
}},

{s: "2. Evanescent", t: "Light leaks a little: the evanescent tail",
intu: "Total internal reflection does not mean the field stops sharply at the surface. On the air side there is a field that does not travel outward but decays exponentially with distance. It carries no power away on average, but it is real: it is the tail you will see on every mode profile in Lessons 2 and 3. Steeper angles (closer to grazing) give a shorter tail, angles just past the critical angle give a long tail. This tail is also why a nearby object, like a substrate or a quantum dot near the surface, can interact with the guided light.",
eq: String.raw`\[ E(z) \propto e^{-\gamma z} \ \text{outside}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}}, \qquad n_{\mathrm{eff}} = n_{1}\sin\theta_{1} \]\[ \text{decay length } 1/\gamma \]`,
sym: [[String.raw`\(\gamma\)`, "decay constant of the field in the cladding (1/nm)"], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\), vacuum wavenumber`], [String.raw`\(n_{\mathrm{eff}}\)`, String.raw`\(n_1 \sin\theta_1\), the effective index of that bounce angle (card 3)`], [String.raw`\(1/\gamma\)`, String.raw`distance over which the field falls by \(e \approx 2.7\)`]],
how: [String.raw`The tangential wavevector \(k_0 n_{\mathrm{eff}}\) is shared by both sides of the interface (Snell).`, String.raw`In the cladding \(k_z^2 = k_0^2 n_{\mathrm{c}}^2 - k_0^2 n_{\mathrm{eff}}^2\). For \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\) this is negative.`, String.raw`So \(k_z\) is imaginary, \(k_z = i\gamma\), and \(e^{ik_z z}\) becomes \(e^{-\gamma z}\), a decaying field.`, String.raw`The same \(\gamma\) appears as the decay rate in the slab equation of Lesson 2 (Andreani and Gerace call it \(\chi\)).`],
say: String.raw`Beyond the critical angle the field in the cladding is evanescent. It decays as \(e^{-\gamma z}\) with \(\gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{c}}^2}\) and carries no net power away from the guide.`,
num: String.raw`\(\lambda = 800\) nm, \(n_{\mathrm{eff}} = 3.0\), air: \(\gamma = (2\pi/800)\sqrt{9 - 1} \approx\) <b>0.0222 nm⁻¹</b>, decay length ≈ <b>45 nm</b><br>\(n_{\mathrm{eff}} = 1.2\) (near cutoff): decay length ≈ <b>192 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Effective index n<sub>eff</sub>", 1.01, 3.5, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N.toFixed(2);
    const g = 2 * Math.PI / 800 * Math.sqrt(N * N - 1), Ld = 1 / g;
    const zs = range(0, 400, 200), ys = zs.map(z => Math.exp(-g * z));
    fig.innerHTML = svg(270, `<rect x="60" y="40" width="80" height="190" fill="var(--blue-bg)"/><text class="ts" x="100" y="250" text-anchor="middle">core</text><line x1="140" x2="140" y1="30" y2="240" stroke="var(--p)" stroke-width="1.5"/><line x1="140" x2="640" y1="230" y2="230" stroke="var(--p)"/>${plot(140, 40, 500, 190, zs, ys, 0, 400, 0, 1, "#378ADD", 2.5)}<line x1="${140 + Ld / 400 * 500}" x2="${140 + Ld / 400 * 500}" y1="40" y2="230" stroke="#D85A30" stroke-dasharray="4 4"/><text class="ts" x="${144 + Ld / 400 * 500}" y="56">1/γ</text><text class="ts" x="390" y="252" text-anchor="middle">distance into air, 0 to 400 nm</text><text class="ts" x="146" y="36">|E| (normalized)</text>`);
    $("ro").innerHTML = `<div><span>γ</span><b>${g.toFixed(4)} nm⁻¹</b></div><div><span>decay length 1/γ</span><b>${Ld.toFixed(0)} nm</b></div>`;
  };
  $("N").oninput = u; u();
}},

{s: "3. Effective index", t: "One number for the whole mode: the effective index",
intu: String.raw`Picture the guided light as a ray zig-zagging between the two surfaces at angle \(\theta\). Along the guide, its phase advances as if it travelled through a material of index \(n_{\mathrm{eff}} = n_1 \sin\theta\). That number is the effective index. A ray nearly parallel to the guide (\(\theta\) near 90°) has \(n_{\mathrm{eff}}\) close to the core index. A ray near the critical angle has \(n_{\mathrm{eff}}\) close to the cladding index. So every guided mode has \(n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n_1\). The propagation constant \(\beta = k_0 n_{\mathrm{eff}}\), the phase velocity \(c/n_{\mathrm{eff}}\) and the wavelength in the guide \(\lambda_0/n_{\mathrm{eff}}\) all follow from \(n_{\mathrm{eff}}\).`,
eq: String.raw`\[ \beta = k_{0} n_{\mathrm{eff}} = k_{0} n_{1} \sin\theta \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n_{1} \ \text{(guided)} \]\[ \lambda_{\mathrm{guide}} = \frac{\lambda_{0}}{n_{\mathrm{eff}}}, \qquad v_{\mathrm{phase}} = \frac{c}{n_{\mathrm{eff}}} \]`,
sym: [[String.raw`\(\beta\)`, "propagation constant: phase advance per unit length along the guide"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the mode"], [String.raw`\(\theta\)`, "bounce angle from the surface normal"], [String.raw`\(\lambda_{\mathrm{guide}}\)`, "wavelength measured along the guide"]],
how: [String.raw`The ray's wavevector has length \(k_0 n_1\) and makes angle \(\theta\) with the normal.`, String.raw`Its component along the guide is \(k_0 n_1 \sin\theta\). That is \(\beta\).`, String.raw`Define \(n_{\mathrm{eff}} = \beta/k_0\) to compare with a plain material.`, String.raw`Total internal reflection needs \(\theta \gt \theta_{\mathrm{c}}\), which means \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\). And \(\sin\theta \lt 1\) means \(n_{\mathrm{eff}} \lt n_1\).`],
say: String.raw`The effective index is the ratio of the propagation constant of a guided mode to the vacuum wavenumber. Guided modes satisfy \(n_{\mathrm{cladding}} \lt n_{\mathrm{eff}} \lt n_{\mathrm{core}}\).`,
num: String.raw`\(\lambda_0 = 800\) nm, \(n_{\mathrm{eff}} = 3.0\): guide wavelength = <b>267 nm</b><br>\(n_{\mathrm{eff}} = 2.4\): <b>333 nm</b><br>A grating period is set by this guide wavelength (Lesson 5).`,
r(fig, ctl) {
  ctl.innerHTML = sl("th", "Bounce angle θ", 17, 89, 0.5, 60) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const th = +$("th").value, n1 = 3.5; $("thv").textContent = th + "°";
    const a = th * Math.PI / 180, N = n1 * Math.sin(a), y0 = 110, y1 = 190, h = y1 - y0;
    let d = `M60 ${y1}`, x = 60, up = true; const dx = h * Math.tan(a);
    while (x < 640) { x += dx; d += ` L${Math.min(x, 640).toFixed(1)} ${up ? y0 : y1}`; up = !up; if (dx < 1) break; }
    let ticks = ""; const lg = 800 / N, sc = 0.6; for (let k = 0; k * lg * sc < 580; k++) ticks += `<line x1="${60 + k * lg * sc}" x2="${60 + k * lg * sc}" y1="214" y2="226" stroke="#378ADD" stroke-width="2"/>`;
    fig.innerHTML = svg(270, `<rect x="40" y="${y0}" width="610" height="${h}" fill="var(--blue-bg)"/><line x1="40" x2="650" y1="${y0}" y2="${y0}" stroke="var(--p)"/><line x1="40" x2="650" y1="${y1}" y2="${y1}" stroke="var(--p)"/><text class="ts" x="44" y="${y0 - 8}">air</text><text class="ts" x="44" y="${y1 + 16}">air</text><path d="${d}" fill="none" stroke="#EF9F27" stroke-width="2.5"/><line x1="60" x2="640" y1="220" y2="220" stroke="var(--p)" stroke-width="0.5"/>${ticks}<text class="ts" x="350" y="246" text-anchor="middle">blue ticks: one guide wavelength λ₀/n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> each (800 nm light, scaled)</text><text class="ts" x="350" y="40" text-anchor="middle">core n = 3.5, zig-zag ray at θ = ${th}°</text>`);
    $("ro").innerHTML = `<div><span>n<sub>eff</sub> = n₁ sin θ</span><b>${N.toFixed(3)}</b></div><div><span>λ₀/n<sub>eff</sub></span><b>${(800 / N).toFixed(0)} nm</b></div><div><span>guided?</span><b>${N > 1 ? "yes" : "no"}</b></div>`;
  };
  $("th").oninput = u; u();
}},

{s: "4. Only some angles", t: "Only some angles survive: transverse resonance",
intu: String.raw`Not every bounce angle works. Follow a ray up and back down: it crosses the core twice and reflects twice. If the phase it collects in that round trip is not a whole number of \(2\pi\), the ray interferes with itself destructively and dies out. Only a discrete set of angles, the modes, survive. The reflection at each surface adds its own phase, which depends on the angle and on the polarization. Make the core thicker and more angles fit, so more modes appear. The plot shows the round-trip phase against \(n_{\mathrm{eff}}\): wherever it crosses a multiple of \(2\pi\) there is a mode.`,
eq: String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}}(n_{\mathrm{eff}}) = 2\pi m, \qquad \kappa = k_{0}\sqrt{n^{2} - n_{\mathrm{eff}}^{2}}, \qquad \varphi_{\mathrm{r}} = 2\arctan\!\left(\frac{\zeta\gamma}{\kappa}\right) \]\[ \Longleftrightarrow\quad \tan\!\left(\frac{\kappa t}{2} - \frac{m\pi}{2}\right) = \frac{\zeta\gamma}{\kappa} \]<div class="eqref">the slab equation of Lesson 2</div>`,
sym: [[String.raw`\(\kappa\)`, String.raw`transverse wavenumber inside the core (Andreani's \(q\))`], [String.raw`\(t\)`, "core thickness"], [String.raw`\(\varphi_{\mathrm{r}}\)`, "phase lost at one total internal reflection"], [String.raw`\(m\)`, "mode order, 0, 1, 2 …"], [String.raw`\(\zeta\)`, String.raw`1 for TE, \((n/n_{\mathrm{c}})^2\) for TM`]],
how: [String.raw`Round trip across the core: transverse phase \(2\kappa t\).`, String.raw`Each total internal reflection adds a phase shift \(-\varphi_{\mathrm{r}}\), set by the Fresnel coefficient.`, String.raw`Self-consistency: total round-trip phase = \(2\pi m\).`, "Rearranging gives the slab dispersion equation of Lesson 2, which Andreani and Gerace write as their Eqs. (C1) to (C4)."],
say: String.raw`Guided modes are the bounce angles whose round-trip phase is a multiple of \(2\pi\), the transverse resonance condition. It is equivalent to the slab dispersion relation.`,
num: String.raw`Slab \(n = 3.5\) in air, \(\lambda = 800\) nm, TE:<br>\(t = 100\) nm: only <b>TE0</b> is guided<br>\(t = 160\) nm: <b>TE0 and TE1</b> (TE1 near cutoff)<br>\(t = 400\) nm: <b>4 TE modes</b> (a new one every 119 nm)`,
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Core thickness t", 40, 500, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const t = +$("t").value, n = 3.5, lam = 800, k0 = 2 * Math.PI / lam; $("tv").textContent = t + " nm";
    const Ns = range(1.0005, 3.4995, 300);
    const ph = Ns.map(N => { const ka = k0 * Math.sqrt(n * n - N * N), ga = k0 * Math.sqrt(N * N - 1); return (2 * ka * t - 4 * Math.atan(ga / ka)) / (2 * Math.PI); });
    const pmax = Math.max(3, Math.ceil(Math.max(...ph)));
    const modes = []; for (let m = 0; m < 6; m++) { const N = C2.slabN(n, 1, t, lam, m, "TE"); if (N) modes.push(N); }
    const X = N => 60 + (N - 1) / 2.5 * 560, Y = v => 230 - (v + 1) / (pmax + 1) * 190;
    let grid = ""; for (let m = 0; m <= pmax; m++) grid += `<line x1="60" x2="620" y1="${Y(m)}" y2="${Y(m)}" stroke="var(--b)" stroke-dasharray="3 3"/><text class="ts" x="54" y="${Y(m) + 4}" text-anchor="end">${m}</text>`;
    let pts = ""; modes.forEach((N, m) => pts += `<circle cx="${X(N)}" cy="${Y(m)}" r="6" fill="#D85A30"/><text class="ts" x="${X(N)}" y="${Y(m) - 10}" text-anchor="middle">TE${m}</text>`);
    let d = ""; Ns.forEach((N, i) => { const v = ph[i]; if (v < -1) return; d += (d ? "L" : "M") + X(N).toFixed(1) + " " + Y(v).toFixed(1); });
    fig.innerHTML = svg(270, `${grid}<path d="${d}" fill="none" stroke="#378ADD" stroke-width="2.5"/>${pts}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 1 (air)</text><text class="ts" x="620" y="250" text-anchor="end">n<tspan baseline-shift='sub' font-size='75%'>eff</tspan> = 3.5 (GaAs)</text><text class="ts" x="20" y="130" transform="rotate(-90 20 130)" text-anchor="middle">round-trip phase / 2π</text>`);
    $("ro").innerHTML = `<div><span>guided TE modes</span><b>${modes.length}</b></div><div><span>n<sub>eff</sub> values</span><b>${modes.map(v => v.toFixed(3)).join(", ")}</b></div>`;
  };
  $("t").oninput = u; u();
}},

{s: "5. Light line", t: "The light line: where guided modes live",
intu: String.raw`Plot frequency against propagation constant \(\beta\). Light in plain air follows the line \(\omega = c\beta\), the light line. Light in bulk GaAs follows \(\omega = c\beta/n\), a flatter line. A guided mode of the membrane must lie between the two lines: below the air light line (so it cannot leak into air) and above the GaAs line. Johnson et al. 1999 used exactly this picture to read the band diagrams of photonic crystal slabs: modes above the light cone leak, modes below it are truly guided. The blue curve is the TE0 mode of a slab, computed live. Move the slab thickness: thinner slabs hug the air light line (weakly guided), thicker ones approach the GaAs line.`,
eq: String.raw`\[ \text{air light line: } \omega = \frac{c\beta}{n_{\mathrm{c}}} \qquad \text{bulk core: } \omega = \frac{c\beta}{n} \]\[ \text{guided: } \frac{c\beta}{n} \lt \omega \lt \frac{c\beta}{n_{\mathrm{c}}} \;\Longleftrightarrow\; n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`,
sym: [[String.raw`\(\omega\)`, String.raw`angular frequency, plotted here as \(t/\lambda_0\) (dimensionless)`], [String.raw`\(\beta\)`, String.raw`propagation constant, plotted as \(\beta t/2\pi\)`], ["light cone", "region above the cladding light line, where light can escape"]],
how: [String.raw`For any wave, \(\omega = c\beta/n_{\mathrm{eff}}\), so a mode's point sits on a line of slope \(c/n_{\mathrm{eff}}\).`, String.raw`\(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\) places it below the cladding light line, so it cannot radiate (Johnson et al., Sec. II).`, String.raw`\(n_{\mathrm{eff}} \lt n\) places it above the core material line.`, "Solving the slab equation at each frequency traces the mode's dispersion curve."],
say: "Truly guided modes lie below the light line of the cladding. Near the light line they are weakly confined, far below it strongly confined.",
num: "In these units the slope of the air line is 1 and of GaAs (3.5) is 0.286.<br>Johnson et al. found that the best slab thickness is about half a wavelength in the material, a balance between weak guiding (too thin) and extra modes (too thick).",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "Slab thickness t", 50, 400, 5, 160) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const t = +$("t").value, n = 3.5; $("tv").textContent = t + " nm";
    const lams = range(300, 3000, 140), pts = [];
    lams.forEach(l => { const N = C2.slabN(n, 1, t, l, 0, "TE"); if (N) pts.push([N * t / l, t / l]); });
    const W = 0.9, X = b => 60 + b / (W * 3.5) * 560, Y = w => 230 - w / W * 190;
    let d = ""; pts.forEach(([b, w]) => { if (w > W || b > W * 3.5) return; d += (d ? "L" : "M") + X(b).toFixed(1) + " " + Y(w).toFixed(1); });
    const N800 = C2.slabN(n, 1, t, 800, 0, "TE");
    fig.innerHTML = svg(270, `<path d="M60 230 L${X(W)} ${Y(W)} L60 ${Y(W)} Z" fill="#D85A30" opacity="0.08"/><line x1="60" y1="230" x2="${X(W)}" y2="${Y(W)}" stroke="#D85A30" stroke-width="2"/><line x1="60" y1="230" x2="620" y2="${Y(W)}" stroke="var(--p)" stroke-width="1.5" stroke-dasharray="5 4"/><path d="${d}" fill="none" stroke="#378ADD" stroke-width="2.5"/>${N800 ? `<circle cx="${X(N800 * t / 800)}" cy="${Y(t / 800)}" r="5" fill="#EF9F27"/><text class="ts" x="${X(N800 * t / 800) + 8}" y="${Y(t / 800) + 4}">800 nm</text>` : ""}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="230" stroke="var(--p)"/><text class="ts" x="${X(0.25)}" y="${Y(0.6)}">light cone (leaks)</text><text class="ts" x="340" y="252" text-anchor="middle">β t / 2π</text><text class="ts" x="20" y="130" transform="rotate(-90 20 130)" text-anchor="middle">frequency t/λ₀</text><text class="ts" x="${X(W) - 4}" y="${Y(W) + 16}" text-anchor="end">air line</text><text class="ts" x="612" y="${Y(W) + 18}" text-anchor="end">GaAs line</text>`);
    $("ro").innerHTML = `<div><span>TE0 n<sub>eff</sub> at 800 nm</span><b>${N800 ? N800.toFixed(3) : "—"}</b></div><div><span>t / λ in GaAs</span><b>${(t * 3.5 / 800).toFixed(2)}</b></div>`;
  };
  $("t").oninput = u; u();
}},

{s: "6. Making it", t: "Why the membrane is suspended, and how it is made",
intu: "Total internal reflection needs a lower index on both sides. For GaAs there is no low-index crystal that can be grown underneath it, so the trick is to grow GaAs on a sacrificial AlGaAs layer and later dissolve that layer, leaving the membrane hanging in air. Midolo et al. 2015 developed a simple version of this process for quantum photonic circuits: one electron-beam lithography step, dry etching straight through the resist (no hard mask), then a wet etch that removes the AlGaAs. Step through their process.",
eq: String.raw`\[ \text{best index contrast: } \frac{n_{\mathrm{GaAs}}}{n_{\mathrm{air}}} \approx 3.5 \qquad \text{versus } \mathrm{GaAs}/\mathrm{AlGaAs} \approx 1.2 \]`,
sym: [["GaAs membrane", "the guiding layer, with dots grown in its middle"], [String.raw`\(\mathrm{Al_{0.75}Ga_{0.25}As}\)`, "sacrificial layer in Midolo et al., removed by acid"], ["ZEP520A", "electron-beam resist used as the etch mask"], ["ICP-RIE", String.raw`inductively coupled plasma reactive ion etching (\(\mathrm{BCl_3/Cl_2/Ar}\))`], ["HF or HCl", "acids that dissolve the AlGaAs selectively"]],
how: ["Grow the stack: GaAs substrate, AlGaAs sacrificial layer, then the GaAs membrane with dots.", "Spin resist, write the pattern with electron beam, develop.", "Dry etch through the membrane using the resist itself as the mask.", "Strip the resist, then dissolve the AlGaAs underneath so the membrane is released, and clean the surfaces (digital etch)."],
say: "The membrane is suspended because no low-index layer can be grown epitaxially under GaAs. Following Midolo et al., it is made by electron-beam lithography, dry etching and selective removal of a sacrificial AlGaAs layer.",
num: String.raw`Midolo et al. 2015 (their InAs dots near 940 nm): membrane <b>160 nm</b>, sacrificial layer <b>1350 nm</b> of \(\mathrm{Al_{0.75}Ga_{0.25}As}\).<br>Below 70 % Al the layer did not etch fully, above 80 % the undercut was too fast to control.<br>Smallest hole etched through: radius <b>56 nm</b>.`,
r(fig, ctl) {
  let k = 0;
  const S = ["1. Grown wafer", "2. Spin resist", "3. Electron-beam writing", "4. Develop", "5. Dry etch through GaAs", "6. Strip resist", "7. Release: dissolve AlGaAs"];
  ctl.innerHTML = `<div class="row"><button id="fb">Back</button><button id="fn">Next step</button><span class="note" id="ft"></span></div>`;
  const u = () => {
    const holes = k >= 4, layer = (y, h, col, lab, gaps) => { let s = ""; if (gaps) { [[60, 200], [240, 120], [400, 220]].forEach(([x, w]) => s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" stroke="var(--p)" stroke-width="0.5"/>`); } else s = `<rect x="60" y="${y}" width="560" height="${h}" fill="${col}" stroke="var(--p)" stroke-width="0.5"/>`; return s + (lab ? `<text class="ts" x="630" y="${y + h / 2 + 4}" text-anchor="end">${lab}</text>` : ""); };
    const sac = k < 6 ? layer(150, 60, "#E8C9A0", "") : `<rect x="60" y="150" width="40" height="60" fill="#E8C9A0" stroke="var(--p)" stroke-width="0.5"/><rect x="580" y="150" width="40" height="60" fill="#E8C9A0" stroke="var(--p)" stroke-width="0.5"/>`;
    const resist = k >= 1 && k <= 5 ? layer(110, 16, "#C5B8F0", "", k >= 3) : "";
    const ebeam = k === 2 ? [260, 280, 300, 320, 340].map(x => `<line x1="${x}" x2="${x}" y1="40" y2="104" stroke="#EF9F27" stroke-width="2" marker-end="url(#ar)"/>`).join("") + `<text class="ts" x="300" y="34" text-anchor="middle">electron beam</text>` : "";
    fig.innerHTML = svg(280, `${layer(210, 50, "#BFC7D1", "")}<text class="ts" x="70" y="240">GaAs substrate</text>${sac}${k < 6 ? `<text class="ts" x="70" y="185">AlGaAs (sacrificial)</text>` : `<text class="ts" x="340" y="185" text-anchor="middle">air gap</text>`}${layer(126, 24, "#7FA6D9", "", holes)}<text class="ts" x="70" y="143">GaAs membrane</text>${resist}${ebeam}${k === 6 ? `<text class="th" x="340" y="80" text-anchor="middle">membrane suspended in air</text>` : ""}`);
    $("ft").textContent = S[k]; $("fb").disabled = k === 0; $("fn").disabled = k === S.length - 1;
  };
  $("fb").onclick = () => { k--; u(); }; $("fn").onclick = () => { k++; u(); }; u();
}}
],
summary: String.raw`Light is trapped in a high-index layer by total internal reflection, with an evanescent tail outside that decays as \(e^{-\gamma z}\). Only bounce angles whose round-trip phase is a multiple of \(2\pi\) survive. These are the modes, each described by an effective index \(n_{\mathrm{eff}}\) between the cladding and core indices, with \(\beta = k_0 n_{\mathrm{eff}}\). Guided modes lie below the cladding light line. GaAs on air gives the largest contrast, which is why the membrane is suspended: it is grown on a sacrificial AlGaAs layer that is dissolved after patterning, as in Midolo et al. 2015.`,
sheet: [
[String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2}, \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \]`, "Snell's law and critical angle"],
[String.raw`\[ \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]`, "Evanescent decay constant"],
[String.raw`\[ \beta = k_{0}n_{\mathrm{eff}}, \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`, "Effective index and guiding window"],
[String.raw`\[ 2\kappa t - 2\varphi_{\mathrm{r}} = 2\pi m \]`, "Transverse resonance"],
[String.raw`\[ \omega = \frac{c\beta}{n_{\mathrm{c}}} \]`, "Light line of the cladding"]],
consts: String.raw`Examples use \(n = 3.5\) (GaAs-like), \(n_{\mathrm{c}} = 1\) (air), \(\lambda_0 = 800\) nm.`,
sources: ["Midolo, Pregnolato, Kiršanskė and Stobbe, Nanotechnology 26, 484002 (2015) (soft-mask fabrication of GaAs membranes)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (light cone, guided modes in slabs)", "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), App. C (slab equations)"]
});
