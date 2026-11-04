/* Lesson 1 of Chapter 2: thesis Sec. 2.1 (the suspended GaAs membrane, Fig. 2.1) plus the basic idea of guiding. */

/* Step-through controller shared by the cards of this file: Back / Play / Next, a caption per step,
   and a progress value st.p (0 to 1) that fades or grows the newest piece of the drawing. */
const C2L1_stepper = (fig, n, draw, o) => {
  o = o || {};
  const RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const st = { k: o.start || 0, p: RM || o.full ? 1 : 0, playing: !!o.play && !RM, hold: 0, t: 0 };
  const D = () => { draw(st); $(o.p).textContent = st.playing ? "Pause" : "Play"; $(o.b).disabled = st.k === 0; $(o.n).disabled = st.k === n - 1; };
  const go = k => { st.k = Math.max(0, Math.min(n - 1, k)); st.p = RM ? 1 : 0; st.hold = 0; D(); };
  $(o.b).onclick = () => { st.playing = false; go(st.k - 1); };
  $(o.n).onclick = () => { st.playing = false; go(st.k + 1); };
  $(o.p).onclick = () => {
    if (st.playing) { st.playing = false; D(); return; }
    if (RM) { go(st.k < n - 1 ? st.k + 1 : 0); return; }
    st.playing = true; if (st.k >= n - 1) go(0); else D();
  };
  let last = performance.now();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; st.t = t;
    const live = typeof o.live === "function" ? o.live(st) : !!o.live;
    if (st.p < 1) { st.p = Math.min(1, st.p + dt / (typeof o.dur === "function" ? o.dur(st) : (o.dur || 0.9))); D(); }
    else if (st.playing) { st.hold += dt; if (st.hold > (o.hold || 2.6)) { if (st.k < n - 1) go(st.k + 1); else { st.playing = false; D(); } } else if (live) D(); }
    else if (live) D();
  });
  D();
  return { st, redraw: D, go };
};
const C2L1_GA = "#7FA6D9", C2L1_AL = "#E8C9A0", C2L1_SUB = "#BFC7D1", C2L1_RES = "#C5B8F0", C2L1_LIGHT = "#BA7517";
const C2L1_sub = s => `<tspan baseline-shift="sub" font-size="9">${s}</tspan>`;

addLesson("thesis", "ch2", {
level: "Basic",
id: "thesis-ch2-l1", title: "The suspended membrane and the effective index", short: "1. The suspended membrane",
big: String.raw`Section 2.1 of the thesis in one picture: every device sits on a GaAs membrane 160 nm thick with air above and below. Light stays inside because it meets both surfaces beyond the critical angle and is totally reflected, leaving only an evanescent tail in the air. Each guided mode travels along the membrane with one number, the effective index \(n_{\mathrm{eff}}\), which lies between the air index and the GaAs index, so the mode sits below the light line of air. Air is used on both sides because it gives the largest possible index contrast. The membrane is grown on a sacrificial AlGaAs layer that is dissolved in hydrofluoric acid after patterning (Midolo et al. 2015). Under a grating coupler, a GaAs/AlGaAs DBR below an air gap \(t_{\mathrm{box}}\) recovers the light that the grating sends downward.`,
bridge: "This lesson follows Sec. 2.1 and adds the basic idea of guiding that Sec. 2.2 builds on. All numbers are computed live from textbook formulas with round example values (GaAs about 3.5, air 1, 800 nm). They are not thesis results. Card 5 draws the stack and the coordinates of Fig. 2.1, and Lesson 2 starts from the mirror plane drawn there.",
cards: [
/* from old ch2 L1 card 1 */
{s: "1. Snell", t: "Bending and trapping light: Snell's law and the critical angle",
intu: "When light crosses from a dense material (high index) into a thinner one (low index), it bends away from the normal. Tilt the ray more and more. At one angle the refracted ray skims along the surface, and beyond it no light can get out at all: everything is reflected back. That is total internal reflection, and the angle is the critical angle. The bigger the index contrast, the smaller the critical angle, so more ray directions are trapped. GaAs against air traps every ray that meets the surface more than about 17° from the normal.",
eq: String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2} \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \quad (n_{1} \gt n_{2}) \]`,
sym: [[String.raw`\(n_{1}, n_{2}\)`, "refractive indices of the core and the cladding"], [String.raw`\(\theta_{1}, \theta_{2}\)`, "angles from the surface normal"], [String.raw`\(\theta_{\mathrm{c}}\)`, String.raw`critical angle. For \(\theta_1 \gt \theta_{\mathrm{c}}\) nothing is transmitted`]],
how: [String.raw`Along the interface, the incoming and the transmitted wave must have the same phase pattern, so their wavevector components along the surface match: \(k_0 n_1 \sin\theta_1 = k_0 n_2 \sin\theta_2\).`, String.raw`\(\sin\theta_2\) cannot exceed 1. That fails when \(n_1 \sin\theta_1 \gt n_2\).`, String.raw`The limit \(n_1 \sin\theta_{\mathrm{c}} = n_2\) defines the critical angle.`, "Beyond it the transmitted wave cannot propagate. It becomes an evanescent wave (card 2)."],
say: "Light is confined in the membrane by total internal reflection at both surfaces. The high index contrast of GaAs and air gives a small critical angle, about 17°.",
num: String.raw`GaAs (\(n \approx 3.5\)) to air: \(\theta_{\mathrm{c}} = \arcsin(1/3.5) \approx\) <b>16.6°</b><br>Silicon (3.48) to oxide (1.45): <b>24.6°</b><br>GaAs to AlGaAs (about 3.0): <b>59°</b>, much weaker trapping. This is why the layer below the GaAs has to be air (card 6).`,
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
    $("ro").innerHTML = `<div><span>critical angle θ<sub>c</sub></span><b>${tc.toFixed(1)}°</b></div><div><span>n₁ sin θ₁</span><b>${s2.toFixed(3)}</b></div><div><span>result</span><b>${tir ? "trapped" : "escapes"}</b></div>`;
  };
  $("n1").oninput = u; $("th").oninput = u; u();
}},

/* from old ch2 L1 card 2 */
{s: "2. Evanescent", t: "Light leaks a little: the evanescent tail",
intu: "Total internal reflection does not mean the field stops sharply at the surface. On the air side there is a field that does not travel outward but decays exponentially with distance. It carries no power away on average, but it is real: it is the tail you will see on every mode profile in Lessons 2 and 3. Rays closer to grazing give a shorter tail, rays just past the critical angle give a long tail. This tail is also why a nearby object, like a mirror below the membrane or a quantum dot near the surface, can interact with the guided light.",
eq: String.raw`\[ E(z) \propto e^{-\gamma z} \ \text{outside}, \qquad \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}}, \qquad n_{\mathrm{eff}} = n_{1}\sin\theta_{1} \]\[ \text{decay length } 1/\gamma \]`,
sym: [[String.raw`\(\gamma\)`, "decay constant of the field in the cladding (1/nm)"], [String.raw`\(k_{0}\)`, String.raw`\(2\pi/\lambda_0\), vacuum wavenumber`], [String.raw`\(n_{\mathrm{eff}}\)`, String.raw`\(n_1 \sin\theta_1\), the effective index of that bounce angle (card 3)`], [String.raw`\(1/\gamma\)`, String.raw`distance over which the field falls by \(e \approx 2.7\)`]],
how: [String.raw`The tangential wavevector \(k_0 n_{\mathrm{eff}}\) is shared by both sides of the interface (Snell).`, String.raw`In the cladding \(k_z^2 = k_0^2 n_{\mathrm{c}}^2 - k_0^2 n_{\mathrm{eff}}^2\). For \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\) this is negative.`, String.raw`So \(k_z\) is imaginary, \(k_z = i\gamma\), and \(e^{ik_z z}\) becomes \(e^{-\gamma z}\), a decaying field.`, String.raw`The same \(\gamma\) sets the tails of the slab modes in Lesson 2 and of the modes the solver finds in Lesson 3, and it is the key to why a mode with \(n_{\mathrm{eff}}\) close to 1 is only weakly guided (Lesson 3, card 7).`],
say: String.raw`Beyond the critical angle the field in the cladding is evanescent. It decays as \(e^{-\gamma z}\) with \(\gamma = k_0\sqrt{n_{\mathrm{eff}}^2 - n_{\mathrm{c}}^2}\) and carries no net power away from the guide.`,
num: String.raw`\(\lambda = 800\) nm, \(n_{\mathrm{eff}} = 3.0\), air: \(\gamma = (2\pi/800)\sqrt{9 - 1} \approx\) <b>0.0222 nm⁻¹</b>, decay length ≈ <b>45 nm</b><br>\(n_{\mathrm{eff}} = 1.2\) (near cutoff): decay length ≈ <b>192 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Effective index n<sub>eff</sub>", 1.01, 3.5, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value; $("Nv").textContent = N.toFixed(2);
    const g = 2 * Math.PI / 800 * Math.sqrt(N * N - 1), Ld = 1 / g;
    const zs = range(0, 400, 200), ys = zs.map(z => Math.exp(-g * z));
    fig.innerHTML = svg(270, `<rect x="60" y="40" width="80" height="190" fill="var(--blue-bg)"/><text class="ts" x="100" y="250" text-anchor="middle">core</text><line x1="140" x2="140" y1="30" y2="240" stroke="var(--p)" stroke-width="1.5"/><line x1="140" x2="640" y1="230" y2="230" stroke="var(--p)"/>${plot(140, 40, 500, 190, zs, ys, 0, 400, 0, 1, "#378ADD", 2.5)}<line x1="${140 + Math.min(Ld, 400) / 400 * 500}" x2="${140 + Math.min(Ld, 400) / 400 * 500}" y1="40" y2="230" stroke="#D85A30" stroke-dasharray="4 4"/><text class="ts" x="${144 + Math.min(Ld, 400) / 400 * 500}" y="56">1/γ</text><text class="ts" x="390" y="252" text-anchor="middle">distance into air, 0 to 400 nm</text><text class="ts" x="146" y="36">|E| (normalized)</text>`);
    $("ro").innerHTML = `<div><span>γ</span><b>${g.toFixed(4)} nm⁻¹</b></div><div><span>decay length 1/γ</span><b>${Ld.toFixed(0)} nm</b></div>`;
  };
  $("N").oninput = u; u();
}},

/* from old ch2 L1 card 3 */
{s: "3. Effective index", t: "One number for the whole mode: the effective index",
intu: String.raw`Picture the guided light as a ray zig-zagging between the two surfaces at angle \(\theta\). Along the guide, its phase advances as if it travelled through a material of index \(n_{\mathrm{eff}} = n_1 \sin\theta\). That number is the effective index. A ray nearly parallel to the guide (\(\theta\) near 90°) has \(n_{\mathrm{eff}}\) close to the core index. A ray near the critical angle has \(n_{\mathrm{eff}}\) close to the cladding index. So every guided mode has \(n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n_1\). The propagation constant \(\beta = k_0 n_{\mathrm{eff}}\), the phase velocity \(c/n_{\mathrm{eff}}\) and the wavelength in the guide \(\lambda_0/n_{\mathrm{eff}}\) all follow from \(n_{\mathrm{eff}}\). Only some angles survive, the ones whose round trip adds up in phase. Lesson 3 finds them as the eigenvalues of a mode solver, \(n_{\mathrm{eff}} = \beta/k_0\).`,
eq: String.raw`\[ \beta = k_{0} n_{\mathrm{eff}} = k_{0} n_{1} \sin\theta \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n_{1} \ \text{(guided)} \]\[ \lambda_{\mathrm{guide}} = \frac{\lambda_{0}}{n_{\mathrm{eff}}}, \qquad v_{\mathrm{phase}} = \frac{c}{n_{\mathrm{eff}}} \]`,
sym: [[String.raw`\(\beta\)`, "propagation constant: phase advance per unit length along the guide"], [String.raw`\(n_{\mathrm{eff}}\)`, "effective index of the mode"], [String.raw`\(\theta\)`, "bounce angle from the surface normal"], [String.raw`\(\lambda_{\mathrm{guide}}\)`, "wavelength measured along the guide"]],
how: [String.raw`The ray's wavevector has length \(k_0 n_1\) and makes angle \(\theta\) with the normal.`, String.raw`Its component along the guide is \(k_0 n_1 \sin\theta\). That is \(\beta\).`, String.raw`Define \(n_{\mathrm{eff}} = \beta/k_0\) to compare with a plain material.`, String.raw`Total internal reflection needs \(\theta \gt \theta_{\mathrm{c}}\), which means \(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\). And \(\sin\theta \lt 1\) means \(n_{\mathrm{eff}} \lt n_1\).`],
say: String.raw`The effective index is the ratio of the propagation constant of a guided mode to the vacuum wavenumber. Guided modes satisfy \(n_{\mathrm{cladding}} \lt n_{\mathrm{eff}} \lt n_{\mathrm{core}}\).`,
num: String.raw`\(\lambda_0 = 800\) nm, \(n_{\mathrm{eff}} = 3.0\): guide wavelength = <b>267 nm</b><br>\(n_{\mathrm{eff}} = 2.4\): <b>333 nm</b><br>A grating period is set by this guide wavelength (Eq. 2.3, Lesson 4).`,
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

/* from old ch2 L1 card 5 */
{s: "4. Light line", t: "The light line: where guided modes live",
intu: String.raw`Plot frequency against propagation constant \(\beta\). Light in plain air follows the line \(\omega = c\beta\), the light line. Light in bulk GaAs follows \(\omega = c\beta/n\), a flatter line. A guided mode of the membrane must lie between the two lines: below the air light line (so it cannot leak into air) and above the GaAs line. Johnson et al. 1999 used exactly this picture to read the band diagrams of photonic crystal slabs: modes above the light cone leak, modes below it are truly guided. The blue curve is the fundamental TE mode of a slab, computed live. Move the slab thickness: thinner slabs hug the air light line (weakly guided), thicker ones approach the GaAs line.`,
eq: String.raw`\[ \text{air light line: } \omega = \frac{c\beta}{n_{\mathrm{c}}} \qquad \text{bulk core: } \omega = \frac{c\beta}{n} \]\[ \text{guided: } \frac{c\beta}{n} \lt \omega \lt \frac{c\beta}{n_{\mathrm{c}}} \;\Longleftrightarrow\; n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`,
sym: [[String.raw`\(\omega\)`, String.raw`angular frequency, plotted here as \(t/\lambda_0\) (dimensionless)`], [String.raw`\(\beta\)`, String.raw`propagation constant, plotted as \(\beta t/2\pi\)`], ["light cone", "region above the cladding light line, where light can escape"]],
how: [String.raw`For any wave, \(\omega = c\beta/n_{\mathrm{eff}}\), so a mode's point sits on a line of slope \(c/n_{\mathrm{eff}}\).`, String.raw`\(n_{\mathrm{eff}} \gt n_{\mathrm{c}}\) places it below the cladding light line, so it cannot radiate (Johnson et al., Sec. II).`, String.raw`\(n_{\mathrm{eff}} \lt n\) places it above the core material line.`, "Solving for the mode at each frequency traces the mode's dispersion curve. Here the analytic slab equation does it (Beyond the thesis, B1)."],
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
    $("ro").innerHTML = `<div><span>TE0 n<sub>eff</sub> at 800 nm</span><b>${N800 ? N800.toFixed(3) : "cut off"}</b></div><div><span>t / λ in GaAs</span><b>${(t * 3.5 / 800).toFixed(2)}</b></div>`;
  };
  $("t").oninput = u; u();
}},

/* new: Fig. 2.1, the layer stack and the strip cross-section with the coordinates */
{s: "5. The stack", t: "The layer stack and the coordinates (Fig. 2.1)",
intu: String.raw`Two pictures fix the geometry for the whole thesis. The first is the layer stack under a grating coupler: the GaAs membrane, 160 nm thick, then an air gap of thickness \(t_{\mathrm{box}}\), then a distributed Bragg reflector (DBR) of alternating GaAs and AlGaAs layers on the GaAs substrate. The mirror recovers light that the grating sends downward. Devices that need no mirror are simulated with air above and below. The second picture is the cross-section of the 200 nm wide routing strip, drawn to scale, with the coordinates used everywhere: light propagates along \(x\), \(y\) runs across the width and \(z\) is normal to the membrane. The dashed line is the mid-plane \(z = 0\). With air on both sides, flipping \(z \to -z\) gives back the same structure, and Lesson 2 builds on that mirror. Pick a picture and press Play to build it in the order you would draw it on the board. Drag \(t_{\mathrm{box}}\) to change the gap.`,
eq: String.raw`\[ \varepsilon_r(y,z) = \begin{cases} n_{\mathrm{GaAs}}^{2}, & |y| \le w/2 \ \text{and} \ |z| \le t/2 \\ 1, & \text{otherwise (air)} \end{cases} \]\[ \varepsilon_r(y,-z) = \varepsilon_r(y,z), \qquad \varepsilon_r(-y,z) = \varepsilon_r(y,z) \]<div class="eqref">Strip in air, Fig. 2.1(b). Under a grating with the DBR below, the stack is not the same above and below, so the first symmetry is lost there.</div>`,
sym: [[String.raw`\(t\)`, "membrane thickness along z, 160 nm"], [String.raw`\(w\)`, "strip width along y, 200 nm for routing"], [String.raw`\(t_{\mathrm{box}}\)`, "air gap between the membrane and the DBR"], [String.raw`\(n_H, n_L\)`, "DBR layer indices, GaAs and AlGaAs (round values 3.5 and 3.0 here)"], [String.raw`\(x, y, z\)`, "propagation direction, across the strip, normal to the membrane"], [String.raw`\(z = 0\)`, "mid-plane of the membrane, a mirror plane when there is air on both sides"]],
how: ["Draw the membrane first: 160 nm of GaAs with air above. Every device is designed for this one thickness.", String.raw`Under a grating coupler, add the air gap \(t_{\mathrm{box}}\) and the DBR below it. Its job is to send the downward light back up, and \(t_{\mathrm{box}}\) sets the phase it comes back with (Lesson 5).`, "For routing, draw the strip cross-section to scale: 200 nm wide and 160 nm thick, air all around.", String.raw`Put the axes on it: \(x\) along the light, out of the board, \(y\) across, \(z\) up. Then draw the dashed mid-plane \(z = 0\).`, String.raw`State the symmetry: with air above and below, \(\varepsilon_r(y,-z) = \varepsilon_r(y,z)\). With the DBR on one side it no longer holds, which matters for Lesson 2.`],
say: String.raw`All devices sit on a 160 nm GaAs membrane with air above and below. Under a grating coupler a GaAs/AlGaAs DBR sits below an air gap \(t_{\mathrm{box}}\). Light travels along \(x\), \(y\) is across the strip, \(z\) is normal to the membrane, and \(z = 0\) is the mirror plane.`,
num: String.raw`Round example values: membrane 160 nm, strip 200 nm, DBR indices 3.5 and 3.0.<br>Quarter-wave layers at 800 nm (Eq. 2.5, Lesson 5): \(d_H = 800/(4 \times 3.5) \approx\) <b>57 nm</b>, \(d_L = 800/(4 \times 3.0) \approx\) <b>67 nm</b>.<br>The strip is a quarter of the vacuum wavelength wide, \(200/800 = 0.25\), and the membrane is \(160 \times 3.5/800 = 0.7\) wavelengths in GaAs.`,
note: String.raw`If asked why the stack in Fig. 2.1(a) is "not to scale": the DBR layers are tens of nanometres thick while the gap and the substrate are much larger, so a true-scale drawing hides the membrane. This card draws the stack with one common vertical scale, so you can see how the gap grows with \(t_{\mathrm{box}}\), but the lateral grating teeth are schematic.`,
r(fig, ctl) {
  let view = "stack";
  const STEPS = {
    stack: [String.raw`The GaAs membrane, 160 nm thick, with air above. All devices are designed for it.`,
      String.raw`Under the coupler the membrane is etched through into a grating of teeth and gaps.`,
      String.raw`Below it, an air gap of thickness t<sub>box</sub>. Drag the slider to change it.`,
      String.raw`Then the DBR: alternating GaAs (n<sub>H</sub>) and AlGaAs (n<sub>L</sub>) quarter-wave layers on the GaAs substrate.`,
      String.raw`The grating sends guided light both up and down. The DBR reflects the downward part back up, and t<sub>box</sub> sets the phase it returns with (Lesson 5).`],
    strip: [String.raw`The routing strip, 200 nm wide and 160 nm thick, drawn to scale.`,
      String.raw`Air on every side: n = 1 above, below and beside the strip.`,
      String.raw`Coordinates: light propagates along x, out of the page. y runs across the width and z is normal to the membrane.`,
      String.raw`The mid-plane z = 0 is a mirror plane: flipping z to −z gives back the same structure.`,
      String.raw`The vertical line y = 0 is a second mirror. Lesson 2 uses the first, Lesson 3 names the modes with both.`]
  };
  ctl.innerHTML = btns([["stack", "Layer stack under a grating"], ["strip", "Strip cross-section"]], "v") + sl("tb", "Air gap t<sub>box</sub>", 100, 1500, 10, 500) + `<div class="row"><button id="sb">Back</button><button id="sp">Play</button><button id="sn">Next</button></div><p class="note" id="sc" style="min-height:40px;font-size:14px;color:var(--fg)"></p><div class="readout" id="ro"></div>`;
  const place = labs => { labs.sort((a, b) => a.y - b.y); let prev = -1e9; labs.forEach(l => { l.yy = Math.max(l.y, prev + 15); prev = l.yy; }); return labs; };
  const stackSVG = (tb, k, p) => {
    const op = j => j < k ? 1 : j === k ? p : 0, g = (j, b) => op(j) > 0.001 ? `<g opacity="${op(j).toFixed(3)}">${b}</g>` : "";
    const sc = 0.16, x0 = 40, x1 = 470, yM = 50, hM = 160 * sc, yG = yM + hM, hG = tb * sc, yD = yG + hG;
    const dH = 800 / (4 * 3.5) * sc, dL = 800 / (4 * 3.0) * sc, yS = yD + 4 * (dH + dL), hS = 22;
    let s = `<text class="ts" x="${x0}" y="20">air, n = 1</text>`;
    const labs = [{ y: yM + hM / 2 + 4, t: "GaAs membrane, 160 nm", j: 0 }];
    s += g(0, `<rect x="${x0}" y="${yM}" width="${x1 - x0}" height="${hM}" fill="${C2L1_GA}" stroke="var(--p)" stroke-width="0.6"/>`);
    let gaps = ""; for (let x = 206; x + 11 < x1; x += 27) gaps += `<rect x="${x}" y="${yM - 0.5}" width="11" height="${hM + 1}" fill="var(--panel)"/>`;
    s += g(1, gaps); labs.push({ y: yM + hM / 2 + 18, t: "grating, etched through", j: 1 });
    s += g(2, `${arrow(120, yG + 1, 120, yD - 1, "var(--t)", 1.2, "", true)}<text class="ts" x="128" y="${yG + hG / 2 + 4}">t${C2L1_sub("box")} = ${tb} nm</text>`);
    labs.push({ y: yG + hG / 2 + 4, t: "air gap", j: 2 });
    let dbr = ""; for (let i = 0; i < 4; i++) { const y = yD + i * (dH + dL); dbr += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${dH}" fill="${C2L1_GA}" stroke="var(--p)" stroke-width="0.4"/><rect x="${x0}" y="${y + dH}" width="${x1 - x0}" height="${dL}" fill="${C2L1_AL}" stroke="var(--p)" stroke-width="0.4"/>`; }
    dbr += `<rect x="${x0}" y="${yS}" width="${x1 - x0}" height="${hS}" fill="${C2L1_SUB}" stroke="var(--p)" stroke-width="0.4"/>`;
    s += g(3, dbr); labs.push({ y: yD + 2 * (dH + dL) + 4, t: "DBR, GaAs / AlGaAs pairs", j: 3 }, { y: yS + hS / 2 + 4, t: "GaAs substrate", j: 3 });
    let lt = `${arrow(48, yM + hM / 2, 196, yM + hM / 2, C2L1_LIGHT, 2.5)}<text class="ts" x="48" y="${yM - 6}" fill="${C2L1_LIGHT}">guided mode</text>`;
    for (let i = 0; i < 3; i++) { const xa = 250 + i * 70; lt += arrow(xa, yM - 2, xa + 16, yM - 36, C2L1_LIGHT, 2) + arrow(xa + 10, yG + 2, xa + 22, yD - 3, C2L1_LIGHT, 1.8) + arrow(xa + 24, yD - 3, xa + 36, yG + 3, C2L1_LIGHT, 1.6, "4 3"); }
    lt += `<text class="ts" x="240" y="20" text-anchor="end" fill="${C2L1_LIGHT}">up, toward the fiber</text>`;
    s += g(4, lt);
    place(labs).forEach(l => { if (op(l.j) > 0.001) s += `<g opacity="${op(l.j).toFixed(3)}"><text class="ts" x="${x1 + 12}" y="${l.yy}">${l.t}</text>${Math.abs(l.yy - l.y) > 2 ? `<line x1="${x1 + 2}" y1="${l.y - 4}" x2="${x1 + 10}" y2="${l.yy - 4}" stroke="var(--muted)" stroke-width="0.8"/>` : ""}</g>`; });
    return svg(Math.max(250, yS + hS + 14), s);
  };
  const stripSVG = (k, p) => {
    const op = j => j < k ? 1 : j === k ? p : 0, g = (j, b) => op(j) > 0.001 ? `<g opacity="${op(j).toFixed(3)}">${b}</g>` : "";
    let s = "";
    s += g(0, `<rect x="200" y="90" width="200" height="160" fill="${C2L1_GA}" stroke="var(--p)" stroke-width="1"/><text class="t" x="210" y="238">GaAs, n ≈ 3.5</text>${arrow(200, 270, 400, 270, "var(--t)", 1.2, "", true)}<text class="ts" x="300" y="288" text-anchor="middle">w = 200 nm</text>${arrow(182, 90, 182, 250, "var(--t)", 1.2, "", true)}<text class="ts" x="174" y="174" text-anchor="end">t = 160 nm</text><line x1="540" x2="640" y1="318" y2="318" stroke="var(--t)" stroke-width="3"/><text class="ts" x="590" y="334" text-anchor="middle">100 nm, drawn to scale</text>`);
    s += g(1, `<text class="ts" x="300" y="40" text-anchor="middle">air, n = 1</text><text class="ts" x="300" y="312" text-anchor="middle">air, n = 1</text><text class="ts" x="560" y="80" text-anchor="middle">air, n = 1</text>`);
    s += g(2, `<line x1="60" y1="300" x2="120" y2="300" stroke="var(--t)" stroke-width="1.5" marker-end="url(#ar)"/><line x1="60" y1="300" x2="60" y2="240" stroke="var(--t)" stroke-width="1.5" marker-end="url(#ar)"/><circle cx="60" cy="300" r="7" fill="none" stroke="var(--t)" stroke-width="1.5"/><circle cx="60" cy="300" r="2" fill="var(--t)"/><text class="ts" x="126" y="304">y</text><text class="ts" x="56" y="232" text-anchor="middle">z</text><text class="ts" x="40" y="334">x, out of the page (propagation)</text>`);
    s += g(3, `<line x1="188" x2="470" y1="170" y2="170" stroke="var(--t)" stroke-width="1.5" stroke-dasharray="6 4"/><text class="ts" x="476" y="174">mirror plane z = 0</text>${arrow(440, 125, 440, 215, "#7F77DD", 1.6, "", true)}<text class="ts" x="448" y="128" fill="#7F77DD">z → −z</text><text class="ts" x="476" y="196">ε(y, −z) = ε(y, z)</text>`);
    s += g(4, `<line x1="300" x2="300" y1="56" y2="262" stroke="var(--t)" stroke-width="1" stroke-dasharray="2 4"/><text class="ts" x="306" y="62">y = 0</text><text class="ts" x="476" y="214">ε(−y, z) = ε(y, z)</text>`);
    return svg(340, s);
  };
  const draw = st => {
    pick(ctl, "v", view); const tb = +$("tb").value; $("tbv").textContent = tb + " nm"; $("tb").disabled = view !== "stack";
    fig.innerHTML = view === "stack" ? stackSVG(tb, st.k, st.p) : stripSVG(st.k, st.p);
    $("sc").innerHTML = `Step ${st.k + 1} of 5. ${STEPS[view][st.k]}`;
    $("ro").innerHTML = view === "stack"
      ? `<div><span>t<sub>box</sub></span><b>${tb} nm</b></div><div><span>round trip 2t<sub>box</sub>/λ₀ (800 nm)</span><b>${(2 * tb / 800).toFixed(2)}</b></div><div><span>DBR pair d<sub>H</sub> + d<sub>L</sub></span><b>${(800 / 14 + 800 / 12).toFixed(0)} nm</b></div>`
      : `<div><span>width w</span><b>200 nm</b></div><div><span>thickness t</span><b>160 nm</b></div><div><span>w / λ₀</span><b>0.25</b></div>`;
  };
  const C = C2L1_stepper(fig, 5, draw, { b: "sb", p: "sp", n: "sn", start: 4, full: true, dur: 0.8, hold: 2.4 });
  ctl.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { view = b.dataset.v; C.st.playing = false; C.st.k = 4; C.st.p = 1; C.redraw(); });
  $("tb").oninput = () => C.redraw();
}},

/* from old ch2 L1 card 6, now an animated step-through of the process of Midolo et al. 2015 */
{s: "6. Making it", t: "How the suspended membrane is made (Midolo et al. 2015)",
intu: "Total internal reflection needs a lower index on both sides of the GaAs, and the best partner is air. No low-index crystal can be grown under GaAs, so the trick is to grow the membrane on a sacrificial AlGaAs layer and dissolve that layer at the end. The thesis follows the process of Midolo et al. 2015: grow GaAs on a sacrificial AlGaAs layer, pattern the GaAs by electron-beam lithography and dry etching, then remove the sacrificial layer with hydrofluoric acid to release the membrane. Press Play and narrate each step as it is drawn, or use Back and Next. The drawing is a cut through a row of etched openings and is not to scale.",
eq: String.raw`\[ \frac{n_{\mathrm{GaAs}}}{n_{\mathrm{air}}} \approx 3.5 \qquad \text{versus} \qquad \frac{n_{\mathrm{GaAs}}}{n_{\mathrm{AlGaAs}}} \approx \frac{3.5}{3.0} \approx 1.2 \]\[ \theta_{\mathrm{c}} = \arcsin\frac{1}{3.5} \approx 17^{\circ} \ \ \text{(air below)} \qquad \theta_{\mathrm{c}} = \arcsin\frac{3.0}{3.5} \approx 59^{\circ} \ \ \text{(AlGaAs below)} \]`,
sym: [["GaAs membrane", "the guiding layer, with quantum dots grown in its middle"], [String.raw`\(\mathrm{Al_{0.75}Ga_{0.25}As}\)`, "sacrificial layer in Midolo et al., dissolved at the end"], ["ZEP520A", "positive electron-beam resist used as the etch mask"], ["ICP-RIE", String.raw`inductively coupled plasma reactive ion etching, here with \(\mathrm{BCl_3/Cl_2/Ar}\)`], ["HF", "hydrofluoric acid, which dissolves the AlGaAs and leaves the GaAs"]],
how: ["Grow the wafer: on a GaAs substrate, a sacrificial AlGaAs layer, then the GaAs membrane with quantum dots in its middle.", "Pattern the GaAs by electron-beam lithography: spin a resist, write the pattern with the electron beam, develop.", "Dry etch through the membrane with a chlorine plasma, using the resist itself as the mask, then strip the resist.", "Remove the sacrificial layer with hydrofluoric acid. It enters through the etched openings, dissolves the AlGaAs underneath and releases the membrane, which is left in air, held at its ends."],
say: "The membrane is grown on a sacrificial AlGaAs layer, patterned by electron-beam lithography and dry etching, and released by dissolving the AlGaAs in hydrofluoric acid, following Midolo et al. 2015.",
num: String.raw`Published values from Midolo et al. 2015 (their InAs dots emit near 940 nm): membrane <b>160 nm</b> of GaAs on <b>1350 nm</b> of \(\mathrm{Al_{0.75}Ga_{0.25}As}\). Below about 70 % Al the layer did not etch fully, above about 80 % the undercut was too fast to control.<br>Release in 10 % HF, lateral etch rate about <b>65 nm/s</b>. Smallest hole etched through: radius <b>56 nm</b>.`,
note: String.raw`If asked why the AlGaAs is not simply left in place: on AlGaAs (about 3.0) a 160 nm GaAs layer would guide only weakly, with \(n_{\mathrm{eff}}\) just above 3.0. Its tail would reach deep into the AlGaAs and leak into the GaAs substrate below it, whose index 3.5 is higher than \(n_{\mathrm{eff}}\). Air on both sides gives strong guiding, and with air above and below the membrane is also mirror symmetric (Lesson 2).`,
r(fig, ctl) {
  const S = ["Grow the wafer by epitaxy: on a GaAs substrate, a sacrificial AlGaAs layer, then the GaAs membrane with quantum dots in its middle.",
    "Spin on an electron-beam resist. Midolo et al. use ZEP520A, a positive resist about half a micrometre thick.",
    "Write the pattern with a focused electron beam. Where the beam lands, the resist is exposed.",
    "Develop. The exposed resist dissolves and leaves openings where the GaAs will be etched.",
    "Dry etch with a chlorine plasma (ICP-RIE). The resist itself is the mask, and the etch goes through the membrane down to the AlGaAs.",
    "Strip the remaining resist.",
    "Release: hydrofluoric acid enters through the openings and dissolves the AlGaAs underneath. The membrane is left suspended in air, held at its ends."];
  ctl.innerHTML = `<div class="row"><button id="fb">Back</button><button id="fp">Play</button><button id="fn">Next</button></div><p class="note" id="ft" style="min-height:44px;font-size:14px;color:var(--fg)"></p>`;
  const OP = [180, 270, 360], HW = 14, x0 = 40, x1 = 470;
  const cl = v => Math.max(0, Math.min(1, v));
  const draw = st => {
    const k = st.k, p = k === undefined ? 1 : st.p;
    const P = j => j < k ? 1 : j === k ? p : 0;
    let s = "";
    // substrate
    s += `<rect x="${x0}" y="236" width="${x1 - x0}" height="44" fill="${C2L1_SUB}" stroke="var(--p)" stroke-width="0.5"/><text class="ts" x="${x1 + 12}" y="262">GaAs substrate</text>`;
    // sacrificial layer
    const hs = 76 * cl(P(0) * 2);
    if (k < 6) s += `<rect x="${x0}" y="${236 - hs}" width="${x1 - x0}" height="${hs}" fill="${C2L1_AL}" stroke="var(--p)" stroke-width="0.5"/>`;
    else {
      const D = 120 * P(6), cut = OP.map(c => [Math.max(80, c - HW - D), Math.min(430, c + HW + D)]).sort((a, b) => a[0] - b[0]);
      const keep = []; let xs = x0; cut.forEach(([a, b]) => { if (a > xs) keep.push([xs, a]); xs = Math.max(xs, b); }); if (xs < x1) keep.push([xs, x1]);
      keep.forEach(([a, b]) => s += `<rect x="${a}" y="160" width="${b - a}" height="76" fill="${C2L1_AL}" stroke="var(--p)" stroke-width="0.5"/>`);
      if (P(6) < 1) OP.forEach(c => s += arrow(c, 96, c, 150, "#1D9E75", 2));
      if (P(6) > 0.6) s += `<text class="th" x="255" y="204" text-anchor="middle" opacity="${cl((P(6) - 0.6) / 0.4).toFixed(2)}">air: membrane suspended</text>`;
    }
    if (hs > 1) s += `<text class="ts" x="${x1 + 12}" y="202">${k < 6 ? "AlGaAs, sacrificial" : "AlGaAs at the ends"}</text>`;
    // membrane
    const hm = 24 * cl(P(0) * 2 - 1);
    if (hm > 0) {
      s += `<rect x="${x0}" y="${160 - hm}" width="${x1 - x0}" height="${hm}" fill="${C2L1_GA}" stroke="var(--p)" stroke-width="0.5"/><text class="ts" x="${x1 + 12}" y="152">GaAs membrane, 160 nm</text>`;
      if (P(0) > 0.92) for (let x = 56; x < x1; x += 34) s += `<circle cx="${x}" cy="148" r="2.2" fill="#D85A30"/>`;
    }
    // etched openings in the membrane
    if (k >= 4) { const de = 24 * P(4); OP.forEach(c => s += `<rect x="${c - HW}" y="135.5" width="${2 * HW}" height="${de + 0.5}" fill="var(--panel)"/>`); }
    // resist
    if (k >= 1 && k <= 5) {
      const hr = 20 * (k === 1 ? P(1) : 1) - (k >= 4 ? 8 * P(4) : 0), ro = k === 5 ? 1 - P(5) : 1;
      let r = `<rect x="${x0}" y="${136 - hr}" width="${x1 - x0}" height="${hr}" fill="${C2L1_RES}" stroke="var(--p)" stroke-width="0.5"/>`;
      if (k === 2) { const xb = 120 + 300 * P(2); OP.forEach(c => { if (xb > c) r += `<rect x="${c - HW}" y="${136 - hr}" width="${2 * HW}" height="${hr}" fill="#7F77DD"/>`; }); r += `<line x1="${xb}" x2="${xb}" y1="40" y2="${132 - hr}" stroke="${C2L1_LIGHT}" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="${xb}" y="32" text-anchor="middle" fill="${C2L1_LIGHT}">electron beam</text>`; }
      if (k === 3) OP.forEach(c => r += `<rect x="${c - HW}" y="${136 - hr}" width="${2 * HW}" height="${hr}" fill="#7F77DD" opacity="${(1 - P(3)).toFixed(2)}"/><rect x="${c - HW}" y="${135 - hr}" width="${2 * HW}" height="${hr + 1}" fill="var(--panel)" opacity="${P(3).toFixed(2)}"/>`);
      if (k >= 4) OP.forEach(c => r += `<rect x="${c - HW}" y="${135 - hr}" width="${2 * HW}" height="${hr + 1}" fill="var(--panel)"/>`);
      s += `<g opacity="${ro.toFixed(2)}">${r}<text class="ts" x="${x1 + 12}" y="${130 - hr / 2}">resist</text></g>`;
    }
    if (k === 4 && P(4) < 1) OP.forEach(c => { for (let i = 0; i < 2; i++) { const y = 50 + ((st.t * 60 + i * 30) % 60); s += arrow(c - 6 + 12 * i, y, c - 6 + 12 * i, y + 18, "#D85A30", 2); } });
    if (k === 4) s += `<text class="ts" x="270" y="36" text-anchor="middle" fill="#D85A30">plasma ions</text>`;
    if (k === 6 && P(6) < 1) s += `<text class="ts" x="270" y="86" text-anchor="middle" fill="#1D9E75">HF enters through the openings</text>`;
    s += `<text class="ts" x="${x0}" y="296">not to scale, cut through a row of openings</text>`;
    fig.innerHTML = svg(304, s);
    $("ft").textContent = `Step ${k + 1} of ${S.length}. ${S[k]}`;
  };
  C2L1_stepper(fig, S.length, draw, { b: "fb", p: "fp", n: "fn", play: true, dur: st => st.k === 6 ? 3.2 : 1.4, hold: 2.6, live: st => st.k === 4 && st.p < 1 });
}}

],
summary: String.raw`Every device in the thesis sits on a GaAs membrane 160 nm thick with air above and below. Light is trapped in it by total internal reflection, with an evanescent tail outside that decays as \(e^{-\gamma z}\). Each guided mode is described by an effective index \(n_{\mathrm{eff}} = \beta/k_0\) between the cladding and core indices, so it lies below the cladding light line. Air on both sides gives the largest contrast. The membrane is grown on a sacrificial AlGaAs layer, patterned by electron-beam lithography and dry etching, and released by dissolving the AlGaAs in hydrofluoric acid (Midolo et al. 2015). Under a grating coupler, a GaAs/AlGaAs DBR below an air gap \(t_{\mathrm{box}}\) recovers the downward light. Light propagates along \(x\), \(y\) is across the strip, \(z\) is normal to the membrane, and the mid-plane \(z = 0\) is a mirror plane when there is air on both sides.`,
sheet: [
[String.raw`\[ n_{1}\sin\theta_{1} = n_{2}\sin\theta_{2}, \qquad \theta_{\mathrm{c}} = \arcsin\!\left(\frac{n_{2}}{n_{1}}\right) \]`, "Snell's law and critical angle"],
[String.raw`\[ \gamma = k_{0}\sqrt{n_{\mathrm{eff}}^{2} - n_{\mathrm{c}}^{2}} \]`, "Evanescent decay constant, decay length 1/γ"],
[String.raw`\[ \beta = k_{0}n_{\mathrm{eff}}, \qquad n_{\mathrm{c}} \lt n_{\mathrm{eff}} \lt n \]`, "Effective index and guiding window"],
[String.raw`\[ \lambda_{\mathrm{guide}} = \frac{\lambda_{0}}{n_{\mathrm{eff}}} \]`, "Wavelength along the guide"],
[String.raw`\[ \omega = \frac{c\beta}{n_{\mathrm{c}}} \]`, "Light line of the cladding"],
[String.raw`\[ \varepsilon_r(y,-z) = \varepsilon_r(y,z) \]`, "Mirror symmetry of the membrane in air (Fig. 2.1)"]],
consts: String.raw`Examples use \(n = 3.5\) (GaAs-like), \(n_{\mathrm{c}} = 1\) (air), \(\lambda_0 = 800\) nm, membrane 160 nm, strip 200 nm, DBR 3.5 and 3.0.`,
sources: ["Midolo, Pregnolato, Kiršanskė and Stobbe, Nanotechnology 26, 484002 (2015) (soft-mask fabrication of GaAs membranes, cited in thesis Sec. 2.1)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (light cone, guided modes in slabs)", "Thesis Ch. 2, Sec. 2.1 and Fig. 2.1 (layer stack, strip cross-section, coordinates)"]
});
