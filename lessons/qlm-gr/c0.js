(function () {
/* Quantum Light and Matter: "Start here" lesson, placed before Griffiths Chapter 1.
   Waves, complex exponentials, E = hbar omega and p = hbar k, dispersion, where the Schrodinger
   equation comes from, k-space, the waveguide as a quantum well, and the numbers to know by heart.
   Cards 3 to 5 use dimensionless units (c = 1, hbar = m = 1). */
const { tx, rc, ln, ci, fmt, C } = QM;
const ro = pairs => pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
const arr = (x1, y1, x2, y2, col, w) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 2}" marker-end="url(#ar)"/>`;

/* sum of plane waves with Gaussian weights around k0: returns re, im on xs at time t for dispersion w(k) */
function packet(xs, k0, sk, x0, t, w, decay) {
  const NK = 61, re = new Float64Array(xs.length), im = new Float64Array(xs.length);
  let norm = 0;
  for (let q = 0; q < NK; q++) {
    const k = k0 + (q - (NK - 1) / 2) * (6 * sk / (NK - 1)), a = Math.exp(-((k - k0) ** 2) / (4 * sk * sk)) * (decay ? Math.exp(-decay(k) * t) : 1);
    norm += Math.exp(-((k - k0) ** 2) / (4 * sk * sk));
    const om = w ? w(k) * t : 0;
    for (let i = 0; i < xs.length; i++) { const ph = k * (xs[i] - x0) - om; re[i] += a * Math.cos(ph); im[i] += a * Math.sin(ph); }
  }
  for (let i = 0; i < xs.length; i++) { re[i] /= norm; im[i] /= norm; }
  return { re, im };
}

/* symmetric slab waveguide, TE modes: u tan u = w (even), -u cot u = w (odd), u^2 + w^2 = V^2 */
function slabModes(V) {
  const out = [], bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  const fe = u => u * Math.tan(u) - Math.sqrt(Math.max(0, V * V - u * u)), fo = u => -u / Math.tan(u) - Math.sqrt(Math.max(0, V * V - u * u));
  for (let m = 0; ; m++) {
    const lo = m * Math.PI / 2 + 1e-9, hi = Math.min((m + 1) * Math.PI / 2 - 1e-9, V);
    if (lo >= V) break;
    const f = m % 2 ? fo : fe;
    if (f(lo) < 0 && f(hi) >= 0) { const u = bis(f, lo, hi); out.push({ m, u, w: Math.sqrt(Math.max(0, V * V - u * u)), parity: m % 2 ? "odd" : "even" }); }
  }
  return out;
}

addLesson("qlm", "gr", {
level: "Start here",
num: "Start here",
id: "qlm-gr-c0", title: "Waves, phasors and k-space", short: "Start here. Waves, phasors, k-space",
labels: { intu: "What the picture shows", how: "Key steps", note: "Why it matters for you" },
big: String.raw`Everything in quantum mechanics and photonics is built from one object: the plane wave \(e^{i(kx - \omega t)}\), a row of arrows spinning in the complex plane. Its twist in space is the wave number \(k\), its twist in time is the frequency \(\omega\), and for both light and matter <b>\(p = \hbar k\) and \(E = \hbar\omega\)</b>. The rule linking \(\omega\) to \(k\), the <b>dispersion relation</b>, is the whole physics of a wave: it decides how fast crests and packets move and whether pulses spread. Write the electron's dispersion \(E = p^2/2m + V\) as a rule for waves and you get the <b>Schrödinger equation</b>. A real particle or a real pulse is a sum of many plane waves, so we describe it by its recipe in <b>k-space</b>. And the equation for light in a waveguide has exactly the same form as the Schrödinger equation, which is why a waveguide mode behaves like a bound state in a quantum well. These seven cards are the ideas to know by heart.`,
bridge: String.raw`<b>How to study this lesson:</b> it is not in Griffiths, it is the background he assumes. Do it before Chapter 1, and come back to it whenever \(e^{i(kx - \omega t)}\), \(\omega(k)\) or k-space feels shaky. If you can explain cards 2, 4 and 5 to someone else without notes, you are ready for the rest of the shelf.`,
cards: [

/* ---------------- 1 wave equation ---------------- */
{ s: "1. The wave equation", t: "1. The classical wave equation: shapes that travel",
intu: String.raw`A wave is a disturbance that moves while keeping its shape. On a string, in air or as light in a vacuum, it obeys the <b>wave equation</b>. Pick <b>Pulse</b>: any shape moves at speed \(v\) without changing, \(u = f(x - vt)\). Pick <b>Two pulses</b>: one moves right, one left, they overlap, add up, and pass straight through each other unchanged. That is <b>superposition</b>, and it holds because the equation is linear. Pick <b>Harmonic</b>: the special shape \(\cos(kx - \omega t)\). It repeats every \(\lambda = 2\pi/k\) in space and every \(T = 2\pi/\omega\) in time, and here \(\omega = vk\) exactly. Because every \(k\) travels at the same speed, a pulse made of many \(k\) stays together. Keep that in mind: for matter waves it is <b>not</b> true (card 3).`,
eq: String.raw`\[ \frac{\partial^2 u}{\partial t^2} = v^2\,\frac{\partial^2 u}{\partial x^2} \]\[ u(x,t) = f(x - vt) + g(x + vt) \qquad \text{(d'Alembert)} \]\[ u = A\cos(kx - \omega t), \qquad k = \frac{2\pi}{\lambda}, \quad \omega = 2\pi\nu = vk \]`,
sym: [[String.raw`\(u(x,t)\)`, "the displacement (string height, pressure, electric field)"], [String.raw`\(v\)`, "wave speed, c/n for light in a medium of index n"], [String.raw`\(k\)`, "wave number, radians per metre, 2π/λ"], [String.raw`\(\omega\)`, "angular frequency, radians per second, 2πν"], [String.raw`\(\lambda, \nu\)`, "wavelength and frequency, v = λν"]],
how: [String.raw`Newton's law on a small piece of string under tension \(T\) with mass per length \(\mu\): \(\mu\,\partial^2u/\partial t^2 = T\,\partial^2u/\partial x^2\), so \(v = \sqrt{T/\mu}\).`, String.raw`For light, Maxwell's equations in a uniform medium give the same equation for each field component with \(v = c/n\).`, String.raw`Try \(u = f(x - vt)\): both sides equal \(v^2f''\). Any shape works, it just slides along.`, String.raw`Try \(u = \cos(kx - \omega t)\): you need \(\omega^2 = v^2k^2\). This link between \(\omega\) and \(k\) is the <b>dispersion relation</b>, a straight line here.`],
say: String.raw`The wave equation ∂²u/∂t² = v²∂²u/∂x² is linear, so solutions add, any shape f(x − vt) travels without change, and harmonic waves obey the linear dispersion relation ω = vk.`,
note: String.raw`Every simulation you run in Tidy3D is Maxwell's equations, which reduce to this wave equation in each uniform region. The interesting physics of your devices lives where \(n\) changes and the simple \(\omega = ck/n\) breaks down.`,
num: String.raw`795 nm light in vacuum: \(k = 2\pi/\lambda = 7.90\) μm⁻¹, \(\nu = 377\) THz, one period \(T = 2.65\) fs. In GaAs with \(n \approx 3.68\) the same light has \(\lambda = 216\) nm inside and moves at \(c/n = 81\,500\) km/s.`,
r(fig, ctl) {
  let shape = "two", t = 0;
  ctl.innerHTML = btns([["pulse", "Pulse"], ["two", "Two pulses"], ["harm", "Harmonic"]], "sh") + sl("v", "Speed v", 0.5, 2, 0.1, 1) + sl("k", "k (for harmonic)", 0.3, 2, 0.05, 0.8) + `<div class="readout" id="ro"></div>`;
  const xs = Array.from({ length: 601 }, (_, i) => -30 + 60 * i / 600);
  const wrap = x => ((x + 30) % 60 + 60) % 60 - 30;
  const draw = () => {
    pick(ctl, "sh", shape);
    const v = +$("v").value, k = +$("k").value; $("vv").textContent = fmt(v, 1); $("kv").textContent = fmt(k, 2);
    const g = x => Math.exp(-x * x / 4);
    let f1, f2;
    if (shape === "pulse") { f1 = xs.map(x => g(wrap(x - v * t + 15))); f2 = null; }
    else if (shape === "two") { f1 = xs.map(x => 0.8 * g(wrap(x - v * t + 15))); f2 = xs.map(x => 0.6 * Math.exp(-((wrap(x + v * t - 15)) ** 2) / 2) * (1 - 0.3 * wrap(x + v * t - 15))); }
    else { f1 = xs.map(x => Math.cos(k * x - v * k * t)); f2 = null; }
    const sum = xs.map((_, i) => f1[i] + (f2 ? f2[i] : 0));
    const F = QM.frame(60, 30, 560, 200, { xmin: -30, xmax: 30, ymin: -1.6, ymax: 1.6, xt: [-30, -20, -10, 0, 10, 20, 30], yt: [-1, 0, 1], xl: "x", yl: "u(x, t)" });
    let s = F.s + ln(F.x0, F.Y(0), F.x0 + F.w, F.Y(0), "var(--b)");
    if (f2) s += QM.path(F, xs, f1, C.blue, 1.5, "5 4") + QM.path(F, xs, f2, C.coral, 1.5, "5 4");
    s += QM.path(F, xs, sum, "var(--t)", 3);
    if (f2) s += tx(F.x0 + 8, F.y0 + 16, "right-mover (blue dashes) + left-mover (coral dashes) = string (black)", "start", "ts");
    if (shape === "harm") { const lam = 2 * Math.PI / k, x0 = wrap(v * t) ; s += `<line x1="${F.X(x0)}" y1="${F.y0 + 14}" x2="${F.X(x0 + lam)}" y2="${F.y0 + 14}" stroke="${C.coral}" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>` + tx(F.X(x0 + lam / 2), F.y0 + 30, "λ", "middle", "th", `fill="${C.coral}"`); }
    fig.innerHTML = svg(270, s);
    $("ro").innerHTML = ro(shape === "harm" ? [["λ = 2π/k", fmt(2 * Math.PI / k, 2)], ["ω = vk", fmt(v * k, 2)], ["period 2π/ω", fmt(2 * Math.PI / (v * k), 2)], ["v = ω/k = λν", fmt(v, 2)]] : [["time", fmt(t, 1)], ["shape kept?", "yes, every k moves at v"]]);
  };
  ctl.querySelectorAll("button[data-sh]").forEach(b => b.onclick = () => { shape = b.dataset.sh; t = 0; draw(); });
  $("v").oninput = draw; $("k").oninput = draw;
  QM.player(ctl, () => { t += 0.1; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 2 complex exponential ---------------- */
{ s: "2. Complex exponentials", t: "2. e^(iθ) is an arrow, e^(i(kx − ωt)) is a row of spinning arrows",
intu: String.raw`Left: Euler's formula. \(e^{i\theta}\) is an arrow of length 1 at angle \(\theta\). Its shadow on the horizontal axis is \(\cos\theta\), on the vertical axis \(\sin\theta\). Right: put one such arrow at every \(x\), with angle \(kx - \omega t\). Walking along \(x\) the arrows twist at \(k\) radians per unit length. Press <b>Play</b> and every arrow spins at \(\omega\) radians per unit time, so the twist pattern slides along. The blue curve is the real part, the ordinary \(\cos(kx - \omega t)\) wave. Flip the <b>direction</b>: the cosine snapshot looks identical, but the arrows twist the other way and the pattern moves left. The complex wave carries information the real one hides. Two more reasons physics uses it: \(|e^{i(kx-\omega t)}| = 1\) everywhere (a particle of definite momentum is equally likely anywhere), and differentiating only multiplies by a number, \(\frac{d}{dx}e^{ikx} = ik\,e^{ikx}\).`,
eq: String.raw`\[ e^{i\theta} = \cos\theta + i\sin\theta, \qquad |e^{i\theta}| = 1 \]\[ \Psi(x,t) = A\,e^{i(kx - \omega t)}, \qquad \frac{\partial\Psi}{\partial x} = ik\,\Psi, \qquad \frac{\partial\Psi}{\partial t} = -i\omega\,\Psi \]\[ \text{physics: } e^{i(kx - \omega t)} \qquad \text{engineering: } e^{j(\omega t - kx)}, \quad j = -i \]`,
sym: [[String.raw`\(\theta\)`, "phase angle of the arrow"], [String.raw`\(kx - \omega t\)`, "the phase of the wave at position x and time t"], [String.raw`\(A\)`, "complex amplitude, its own length and starting angle"], [String.raw`\(\text{Re}\)`, "real part, the shadow on the horizontal axis"]],
how: [String.raw`Taylor series: \(e^{i\theta} = 1 + i\theta - \theta^2/2! - i\theta^3/3! + \dots\), and the real and imaginary terms collect into \(\cos\theta\) and \(\sin\theta\).`, String.raw`Multiplying by \(e^{i\phi}\) rotates an arrow by \(\phi\). So adding phases means rotating, and products of waves become sums of angles.`, String.raw`At fixed \(t\), the phase grows by \(2\pi\) every \(\lambda = 2\pi/k\). At fixed \(x\), it falls by \(2\pi\) every \(T = 2\pi/\omega\).`, String.raw`A crest (phase = constant) moves at \(dx/dt = \omega/k\), the <b>phase velocity</b>.`, String.raw`Derivatives act like numbers: \(\partial_x \to ik\) and \(\partial_t \to -i\omega\). This is why plane waves turn differential equations into algebra.`],
say: String.raw`The plane wave exp(i(kx − ωt)) is a unit complex number whose phase advances by k per unit length and falls by ω per unit time, so its crests move at ω/k, and differentiating it simply multiplies it by ik or −iω.`,
note: String.raw`Watch the sign convention when you read papers or simulation docs. Physicists write \(e^{-i\omega t}\), electrical engineers write \(e^{+j\omega t}\). Both describe the same real field, but an absorbing material then has index \(n + i\kappa\) in one convention and \(n - j\kappa\) in the other. Always check which one a tool or paper uses before comparing complex results.`,
num: String.raw`At \(\theta = 60°\): \(\cos = 0.500\), \(\sin = 0.866\). For 795 nm light the arrows at one point spin \(377\times10^{12}\) times per second, and the twist along the beam is one turn per 795 nm in vacuum.`,
r(fig, ctl) {
  let dir = 1, t = 0;
  ctl.innerHTML = sl("th", "Angle θ (left picture)", 0, 360, 1, 60) + sl("k", "Twist k", 0.4, 2, 0.05, 0.8) + btns([["1", "Moving right (+k)"], ["-1", "Moving left (−k)"]], "dr") + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "dr", String(dir));
    const th = +$("th").value * Math.PI / 180, k = +$("k").value * dir, om = Math.abs(k); $("thv").textContent = $("th").value + "°"; $("kv").textContent = fmt(+$("k").value, 2);
    const cx = 110, cy = 140, R = 80;
    let s = ln(cx - R - 15, cy, cx + R + 15, cy, "var(--b)") + ln(cx, cy - R - 15, cx, cy + R + 15, "var(--b)") + ci(cx, cy, R, "none", "var(--p)", 'stroke-dasharray="3 4"');
    const ex = cx + R * Math.cos(th), ey = cy - R * Math.sin(th);
    s += ln(ex, ey, ex, cy, C.coral, 1.5, "4 3") + ln(ex, ey, cx, ey, C.teal, 1.5, "4 3") + ln(cx, cy, ex, cy, C.blue, 5, "", 'stroke-opacity="0.6"') + ln(cx, cy, cx, ey, C.coral, 5, "", 'stroke-opacity="0.5"');
    s += arr(cx, cy, ex, ey, C.purple, 3.5) + tx(cx + R + 18, cy + 4, "Re", "start") + tx(cx, cy - R - 20, "Im", "middle") + tx(cx, cy + R + 34, `e^(iθ) = ${fmt(Math.cos(th), 2)} + ${fmt(Math.sin(th), 2)} i`, "middle", "th", `fill="${C.purple}"`);
    s += tx(cx, cy + R + 52, "blue: cos θ, coral: sin θ", "middle", "ts");
    // row of arrows
    const x0 = 250, w = 380, mid = 140, r = 22, X = v => x0 + w * v / 24;
    s += ln(x0, mid, x0 + w, mid, "var(--b)");
    let d = ""; for (let i = 0; i <= 300; i++) { const xx = 24 * i / 300, ph = k * xx - om * t; d += (i ? "L" : "M") + X(xx).toFixed(1) + " " + (mid - r * 1.7 * Math.cos(ph)).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${C.blue}" stroke-width="1.8"/>`;
    for (let j = 0; j <= 24; j += 1.5) { const ph = k * j - om * t; s += arr(X(j), mid, X(j) + r * Math.cos(ph), mid - r * Math.sin(ph), C.coral, 2); }
    s += tx(x0 + w / 2, 60, "arrows e^(i(kx − ωt)) and their real part cos(kx − ωt)", "middle", "ts") + tx(x0 + w / 2, 230, dir > 0 ? "pattern slides right →" : "← pattern slides left", "middle", "th", `fill="${C.coral}"`);
    fig.innerHTML = svg(300, s);
    $("ro").innerHTML = ro([["cos θ", fmt(Math.cos(th), 3)], ["sin θ", fmt(Math.sin(th), 3)], ["λ = 2π/|k|", fmt(2 * Math.PI / Math.abs(k), 2)], ["phase velocity ω/k", fmt(om / k, 2)]]);
  };
  $("th").oninput = draw; $("k").oninput = draw;
  ctl.querySelectorAll("button[data-dr]").forEach(b => b.onclick = () => { dir = +b.dataset.dr; draw(); });
  QM.player(ctl, () => { t += 0.06; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 3 dispersion ---------------- */
{ s: "3. E = ħω, p = ħk, ω(k)", t: "3. E = ħω and p = ħk, and the dispersion relation ω(k)",
intu: String.raw`Two experimental facts tie waves to particles, for light and for matter alike: energy is \(\hbar\omega\) and momentum is \(\hbar k\). So the relation \(\omega(k)\) is the same thing as the energy momentum relation \(E(p)\). It is called the <b>dispersion relation</b>, and it decides everything about how a wave moves. Pick a system and a \(k_0\). The slope of the line from the origin to the point is the <b>phase velocity</b> \(\omega/k\) (how fast crests move, coral dot below). The slope of the tangent is the <b>group velocity</b> \(d\omega/dk\) (how fast the packet and its energy move, purple triangle). For <b>light in vacuum</b> they are equal and the pulse never spreads. For <b>electrons</b> the curve is a parabola, the group velocity is twice the phase velocity and the packet spreads. For a <b>photonic crystal band</b> the curve flattens at the band edge: the group velocity goes to zero. That is <b>slow light</b>.`,
eq: String.raw`\[ E = \hbar\omega, \qquad p = \hbar k = \frac{h}{\lambda} \]\[ \text{light: } \omega = \frac{c}{n}k, \qquad \text{electron: } \omega = \frac{\hbar k^2}{2m} \;\Leftrightarrow\; E = \frac{p^2}{2m} \]\[ v_{\text{phase}} = \frac{\omega}{k}, \qquad v_{\text{group}} = \frac{d\omega}{dk}, \qquad n_g = \frac{c}{v_{\text{group}}} \]`,
sym: [[String.raw`\(\hbar\)`, "reduced Planck constant, 1.0546 × 10⁻³⁴ J s = 0.6582 eV fs"], [String.raw`\(\omega(k)\)`, "dispersion relation, frequency as a function of wave number"], [String.raw`\(v_{\text{phase}}\)`, "crest speed"], [String.raw`\(v_{\text{group}}\)`, "envelope and energy speed"], [String.raw`\(n_g\)`, "group index, how slow a pulse is compared to c"]],
how: [String.raw`Planck and Einstein (1900, 1905): light comes in quanta \(E = h\nu = \hbar\omega\). Photon momentum is \(p = E/c = \hbar k\).`, String.raw`de Broglie (1924): matter does the same in reverse, a particle of momentum \(p\) has wavelength \(h/p\), so \(p = \hbar k\).`, String.raw`Insert both into a particle's energy, \(E = p^2/2m\), and you get the matter wave dispersion \(\omega = \hbar k^2/2m\).`, String.raw`A packet is a sum of waves near \(k_0\). Expanding \(\omega(k) \approx \omega_0 + \omega'(k - k_0)\) shows the envelope moving at \(\omega'(k_0)\). The next term, \(\omega''\), spreads it: zero for a straight line, nonzero for a curve.`],
say: String.raw`For light and matter alike E = ħω and p = ħk, so the dispersion relation ω(k) is the energy momentum relation, and a wave packet moves at the group velocity dω/dk while its crests move at the phase velocity ω/k.`,
note: String.raw`Your photonic crystal waveguide band diagrams are \(\omega(k)\) curves. The group index \(n_g = c/v_g\) you read off them sets the Purcell enhancement and the coupling of a quantum dot to the waveguide, which is why slow light near the band edge matters so much in your field.`,
num: String.raw`795 nm photon: \(E = 1.56\) eV, \(p = \hbar k = 8.3\times10^{-28}\) kg m/s. An electron with the same momentum has a wavelength of 795 nm too, but its energy is only 2.4 μeV. An electron with 1.56 eV has \(\lambda = 0.98\) nm. Typical photonic crystal waveguides reach group indices of tens near the band edge.`,
r(fig, ctl) {
  const SYS = {
    vac: { n: "Light in vacuum", w: k => k, wp: k => 1 },
    med: { n: "Light in a medium, n = 2", w: k => k / 2, wp: k => 0.5 },
    el: { n: "Electron, ω = k²/2", w: k => k * k / 2, wp: k => k },
    pc: { n: "Photonic crystal band", w: k => 2 * Math.sin(k / 2), wp: k => Math.cos(k / 2) }
  };
  let sys = "pc", t = 0;
  ctl.innerHTML = btns(Object.keys(SYS).map(k => [k, SYS[k].n]), "sy") + sl("k0", "Central k₀", 0.3, 3.0, 0.05, 1.5) + `<div class="readout" id="ro"></div>`;
  const xs = Array.from({ length: 601 }, (_, i) => 60 * i / 600);
  const draw = () => {
    pick(ctl, "sy", sys);
    const S = SYS[sys], k0 = +$("k0").value; $("k0v").textContent = fmt(k0, 2);
    const ks = Array.from({ length: 200 }, (_, i) => i * Math.PI / 199), om = ks.map(S.w), wmax = Math.max(...om, 1) * 1.1;
    const F = QM.frame(60, 24, 240, 200, { xmin: 0, xmax: Math.PI, ymin: 0, ymax: wmax, xt: [0, 1, 2, 3], yt: [0, +(wmax / 2).toFixed(1), +(wmax * 0.9).toFixed(1)], xl: "k", yl: "" });
    let s = F.s + QM.path(F, ks, om, "var(--t)", 2.5) + tx(F.x0 - 8, F.y0 - 8, "ω", "end", "th");
    const w0 = S.w(k0), vg = S.wp(k0), vp = w0 / k0;
    s += ln(F.X(0), F.Y(0), F.X(Math.PI), F.Y(vp * Math.PI), C.coral, 1.5, "5 4");
    s += ln(F.X(k0 - 1), F.Y(w0 - vg), F.X(k0 + 1), F.Y(w0 + vg), C.purple, 2);
    s += ci(F.X(k0), F.Y(w0), 6, "var(--t)", "#fff") + tx(F.x0 + 6, F.y0 + 14, "coral: slope ω/k", "start", "ts", `fill="${C.coral}"`) + tx(F.x0 + 6, F.y0 + 28, "purple: slope dω/dk", "start", "ts", `fill="${C.purple}"`);
    if (sys === "pc") s += ln(F.X(Math.PI), F.y0, F.X(Math.PI), F.y0 + F.h, C.amber, 1.5, "3 3") + tx(F.X(Math.PI) - 4, F.y0 + F.h - 8, "band edge", "end", "ts", `fill="${C.amber}"`);
    // packet
    const x0 = 6, sk = 0.15, P = packet(xs, k0, sk, x0, t, S.w);
    const E = QM.frame(330, 24, 300, 200, { xmin: 0, xmax: 60, ymin: -1.1, ymax: 1.1, xt: [0, 20, 40, 60], yt: [], xl: "x", yl: "" });
    const env = xs.map((_, i) => Math.hypot(P.re[i], P.im[i]));
    s += E.s + QM.path(E, xs, env, C.purple, 1.2, "4 3") + QM.path(E, xs, Array.from(P.re), C.blue, 1.5);
    const xg = x0 + vg * t, xc = x0 + vp * t;
    if (xg < 60) s += `<path d="M${E.X(xg) - 6} ${E.y0 - 2}L${E.X(xg) + 6} ${E.y0 - 2}L${E.X(xg)} ${E.y0 + 8}Z" fill="${C.purple}"/>`;
    if (xc < 60) s += ci(E.X(xc), E.Y(Math.hypot(...[0, 0])) - 0, 5, C.coral);
    s += tx(E.x0 + E.w / 2, E.y0 + E.h + 46, "packet in time: purple = envelope (v_g), coral = a crest (v_p)", "middle", "ts");
    fig.innerHTML = svg(290, s);
    $("ro").innerHTML = ro([["ω(k₀)", fmt(w0, 3)], ["phase velocity ω/k", fmt(vp, 3)], ["group velocity dω/dk", fmt(vg, 3)], ["group index c/v_g", sys === "el" ? "not light" : fmt(1 / Math.max(vg, 1e-6), 2)], ["packet spreads?", sys === "el" || sys === "pc" ? "yes, ω(k) is curved" : "no, ω(k) is a straight line"]]);
  };
  ctl.querySelectorAll("button[data-sy]").forEach(b => b.onclick = () => { sys = b.dataset.sy; t = 0; draw(); });
  $("k0").oninput = () => { t = 0; draw(); };
  QM.player(ctl, () => { const S = SYS[sys], k0 = +$("k0").value; t += 0.25; if (6 + S.wp(k0) * t > 58 || t > 400) t = 0; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 4 Schrodinger from plane waves ---------------- */
{ s: "4. Where Schrödinger comes from", t: "4. Building the Schrödinger equation, and why it needs the i",
intu: String.raw`Derivatives measure twist. Acting on a plane wave, \(-i\hbar\,\partial_x\) returns \(\hbar k = p\) and \(i\hbar\,\partial_t\) returns \(\hbar\omega = E\). So the classical energy rule \(E = p^2/2m + V\), written with derivatives, becomes the Schrödinger equation (the dictionary on the left). Nothing else went in. The plot shows why the \(i\) is not decoration. The same starting wave, a packet moving right, is evolved two ways. <b>With i</b> (Schrödinger): every \(k\) component <b>spins</b> at its own rate \(\hbar k^2/2m\), the packet moves and slowly spreads, and the total probability stays exactly 1. <b>Without i</b> (the diffusion or heat equation, same derivatives): every component <b>decays</b> instead, short wavelengths die first, the packet stops moving, smears out and fades away. One \(i\) turns dying into spinning, and that is what makes quantum waves travel and interfere.`,
eq: String.raw`\[ i\hbar\frac{\partial}{\partial t} \to E, \qquad -i\hbar\frac{\partial}{\partial x} \to p, \qquad -\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x^2} \to \frac{p^2}{2m} \]\[ E = \frac{p^2}{2m} + V \quad\Longrightarrow\quad i\hbar\frac{\partial\Psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2} + V\Psi \]\[ \text{without } i: \quad \frac{\partial u}{\partial t} = D\,\frac{\partial^2 u}{\partial x^2} \quad \text{(diffusion)} \]`,
sym: [[String.raw`\(\Psi(x,t)\)`, "the wave function, complex"], [String.raw`\(-i\hbar\,\partial_x\)`, "momentum operator, measures twist in space"], [String.raw`\(i\hbar\,\partial_t\)`, "energy operator, measures twist in time"], [String.raw`\(V(x)\)`, "potential energy"], [String.raw`\(D\)`, "diffusion constant of the heat equation"]],
how: [String.raw`Start from \(\Psi = e^{i(kx - \omega t)}\): \(\partial_t\Psi = -i\omega\Psi\) and \(\partial_x^2\Psi = -k^2\Psi\).`, String.raw`Multiply by constants so the numbers come out as physical quantities: \(i\hbar\partial_t\Psi = \hbar\omega\Psi = E\Psi\) and \(-\frac{\hbar^2}{2m}\partial_x^2\Psi = \frac{\hbar^2k^2}{2m}\Psi = \frac{p^2}{2m}\Psi\).`, String.raw`Require \(E = p^2/2m + V\) for every component. That is the Schrödinger equation, and it is linear, so any sum of plane waves solves it too.`, String.raw`First order in time with an \(i\): each component goes as \(e^{-i\omega t}\), a pure rotation, so \(|\Psi|^2\) summed over all \(x\) is conserved.`, String.raw`Drop the \(i\) and each component goes as \(e^{-Dk^2t}\): real decay. Same derivatives, completely different physics.`],
say: String.raw`The Schrödinger equation is the energy relation E = p²/2m + V with E and p replaced by the operators iħ∂/∂t and −iħ∂/∂x, and the i makes each plane wave component rotate in phase rather than decay, which conserves probability.`,
note: String.raw`Light has no separate "Schrödinger equation" in your simulations because Maxwell already gives a wave equation. But in the paraxial limit (a beam moving mostly along z) Maxwell reduces to exactly this form, with z playing the role of time: \(2ik\,\partial_zE = -\nabla_\perp^2E\). Beam spreading in free space is the optical twin of wave packet spreading.`,
num: String.raw`With \(\hbar = m = 1\) and \(k_0 = 2\): the Schrödinger packet moves at 2 and its width grows as \(\sqrt{1 + (t/2\sigma^2)^2}\). The diffusion version with \(D = 1/2\) multiplies the \(k_0\) component by \(e^{-k_0^2t/2} = e^{-2t}\): after \(t = 1\) the carrier is down to 14 %, after \(t = 3\) to 0.25 %.`,
r(fig, ctl) {
  let mode = "i", t = 0;
  ctl.innerHTML = btns([["i", "With i (Schrödinger)"], ["d", "Without i (diffusion)"]], "md") + `<div class="readout" id="ro"></div>`;
  const xs = Array.from({ length: 601 }, (_, i) => -10 + 40 * i / 600);
  const draw = () => {
    pick(ctl, "md", mode);
    const P = mode === "i" ? packet(xs, 2, 0.5, 0, t, k => k * k / 2) : packet(xs, 2, 0.5, 0, t, null, k => k * k / 2);
    const F = QM.frame(60, 30, 560, 200, { xmin: -10, xmax: 30, ymin: -1.1, ymax: 1.1, xt: [-10, 0, 10, 20, 30], yt: [-1, 0, 1], xl: "x", yl: "Re Ψ" });
    const env = xs.map((_, i) => Math.hypot(P.re[i], P.im[i]));
    let s = F.s + ln(F.x0, F.Y(0), F.x0 + F.w, F.Y(0), "var(--b)") + QM.path(F, xs, env, C.purple, 1.3, "4 3") + QM.path(F, xs, env.map(v => -v), C.purple, 1.3, "4 3") + QM.path(F, xs, Array.from(P.re), mode === "i" ? C.blue : C.coral, 2);
    let tot = 0, xm = 0; const dx = xs[1] - xs[0]; env.forEach((v, i) => { tot += v * v * dx; xm += xs[i] * v * v * dx; });
    if (t === 0) draw.t0 = tot;
    s += tx(F.x0 + 8, F.y0 + 16, mode === "i" ? "each k spins: exp(−i k²t/2)" : "each k decays: exp(−k²t/2)", "start", "th", `fill="${mode === "i" ? C.blue : C.coral}"`);
    fig.innerHTML = svg(270, s);
    $("ro").innerHTML = ro([["time", fmt(t, 2)], ["∫|Ψ|² dx (relative to start)", fmt(tot / draw.t0, 4)], ["centre ⟨x⟩", tot > 1e-8 ? fmt(xm / tot, 2) : "faded away"]]);
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; t = 0; draw(); });
  QM.player(ctl, () => { if (t < 10) t += 0.03; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 5 k-space ---------------- */
{ s: "5. k-space", t: "5. k-space: a particle is a recipe of plane waves",
intu: String.raw`One plane wave is everywhere, so it cannot be a particle (set <b>Waves</b> to 1). Add waves with nearby \(k\): they agree in one region and cancel everywhere else, and a localized packet appears. With only a few evenly spaced waves the pattern repeats (copies at the edges): a truly single particle needs a continuous recipe, which is why \(\phi(k)\) is a function and the sum becomes an integral. The bars are the <b>recipe</b> \(\phi(k)\): how much of each \(k\) goes in. Describing the particle by \(\phi(k)\) instead of \(\psi(x)\) is "working in k-space". It is the same information, like describing a chord by its notes instead of its pressure trace. Widen the spread \(\Delta k\) and the packet gets narrower: \(\Delta x\,\Delta k \ge \tfrac12\), which with \(p = \hbar k\) is Heisenberg. Now press <b>Play</b>. In k-space nothing hard happens: each ingredient keeps its size and just spins at its own \(\omega(k)\). Add them back up at any time and you have the moving, spreading particle. A differential equation in \(x\) has become a multiplication in \(k\). That is why k-space is used.`,
eq: String.raw`\[ \psi(x) = \frac{1}{\sqrt{2\pi}}\int\phi(k)\,e^{ikx}\,dk, \qquad \phi(k) = \frac{1}{\sqrt{2\pi}}\int\psi(x)\,e^{-ikx}\,dx \]\[ \phi(k,t) = \phi(k,0)\,e^{-i\omega(k)t} \qquad \text{(free evolution in k-space)} \]\[ \Delta x\,\Delta k \ge \tfrac12 \quad\Rightarrow\quad \Delta x\,\Delta p \ge \tfrac{\hbar}{2} \]`,
sym: [[String.raw`\(\phi(k)\)`, "the k-space wave function, the recipe, the Fourier transform of ψ(x)"], [String.raw`\(|\phi(k)|^2\)`, "probability of each wave number, so of each momentum ħk"], [String.raw`\(\Delta k\)`, "spread of wave numbers in the recipe"], [String.raw`\(\omega(k)\)`, "dispersion relation, the spin rate of each ingredient"]],
how: [String.raw`Fourier's theorem: any reasonable \(\psi(x)\) is a sum (integral) of plane waves, and \(\phi(k)\) is found by projecting \(\psi\) onto each one.`, String.raw`The Schrödinger equation is linear, and each plane wave solves it on its own with \(e^{-i\omega(k)t}\). So the solution at time \(t\) is the same integral with each \(\phi(k)\) multiplied by its phase factor.`, String.raw`In a free region the hard part of the problem (the second derivative) is just \(-k^2\) in k-space.`, String.raw`A narrow \(\psi(x)\) needs many \(k\) to cancel outside it, so a narrow \(\psi\) has a wide \(\phi\). The Gaussian is the best compromise, with equality \(\Delta x\,\Delta k = \tfrac12\).`],
say: String.raw`k-space is the description of a wave by its plane wave content φ(k), the Fourier transform of ψ(x), in which free time evolution is just a phase factor exp(−iω(k)t) on each component and |φ(k)|² gives the momentum distribution.`,
note: String.raw`Everything periodic is naturally described in k-space: crystal electrons (Bloch states, band structures), photonic crystals, gratings. Your grating coupler works by giving light exactly the extra \(k\) it needs to match the waveguide mode: \(k_{\text{waveguide}} = k_0\sin\theta + 2\pi/\Lambda\). That is a statement about adding wave numbers in k-space.`,
num: String.raw`A Gaussian with \(\Delta k = 0.4\) has \(\Delta x = 1.25\), product 0.5. For an electron localized to \(\Delta x = 1\) nm, \(\Delta k \ge 0.5\) nm⁻¹, so its momentum spread is at least \(0.5\,\hbar\)/nm. A 100 fs optical pulse at 795 nm has a spectral width of at least about 4.4 THz (for a Gaussian, time bandwidth product 0.44).`,
r(fig, ctl) {
  let t = 0;
  ctl.innerHTML = sl("n", "Waves added", 1, 81, 2, 31) + sl("dk", "Spread Δk", 0.1, 1.2, 0.05, 0.4) + `<div class="readout" id="ro"></div>`;
  const xs = Array.from({ length: 601 }, (_, i) => -20 + 40 * i / 600);
  const draw = () => {
    const N = +$("n").value, dk = +$("dk").value, k0 = 2; $("nv").textContent = N; $("dkv").textContent = fmt(dk, 2);
    const comps = []; for (let q = 0; q < N; q++) { const k = N === 1 ? k0 : k0 + (q - (N - 1) / 2) * (6 * dk / (N - 1)); comps.push({ k, a: N === 1 ? 1 : Math.exp(-((k - k0) ** 2) / (4 * dk * dk)) }); }
    const S = comps.reduce((a, c) => a + c.a, 0), re = xs.map(() => 0), im = xs.map(() => 0);
    comps.forEach(c => { const om = c.k * c.k / 2 * t; xs.forEach((x, i) => { re[i] += c.a * Math.cos(c.k * (x + 12) - om) / S; im[i] += c.a * Math.sin(c.k * (x + 12) - om) / S; }); });
    const K = QM.frame(60, 24, 560, 90, { xmin: k0 - 4, xmax: k0 + 4, ymin: 0, ymax: 1.1, xt: [-2, -1, 0, 1, 2, 3, 4, 5, 6], yt: [], xl: "k", yl: "φ(k)" });
    let s = K.s;
    const am = Math.max(...comps.map(c => c.a));
    const every = Math.max(1, Math.ceil(N / 15)); comps.forEach((c, q) => { const ph = -c.k * c.k / 2 * t, x = K.X(c.k), y = K.Y(c.a / am); s += ln(x, K.Y(0), x, y, C.teal, N > 41 ? 2 : 3); if (q % every === 0) s += arr(x, y - 2, x + 9 * Math.cos(ph), y - 2 - 9 * Math.sin(ph), C.coral, 1.5); });
    s += tx(K.x0 + K.w, K.y0 - 8, "bars: amount of each k, arrows: its phase spinning at ω(k)", "end", "ts");
    const F = QM.frame(60, 160, 560, 170, { xmin: -20, xmax: 20, ymin: -1.1, ymax: 1.1, xt: [-20, -10, 0, 10, 20], yt: [-1, 0, 1], xl: "x", yl: "ψ(x)" });
    const env = xs.map((_, i) => Math.hypot(re[i], im[i]));
    s += F.s + ln(F.x0, F.Y(0), F.x0 + F.w, F.Y(0), "var(--b)") + QM.path(F, xs, env, C.purple, 1.3, "4 3") + QM.path(F, xs, env.map(v => -v), C.purple, 1.3, "4 3") + QM.path(F, xs, re, C.blue, 1.8);
    fig.innerHTML = svg(370, s);
    let pw = 0, xm = 0, x2 = 0; const dx = xs[1] - xs[0]; env.forEach((v, i) => { pw += v * v; xm += xs[i] * v * v; x2 += xs[i] * xs[i] * v * v; });
    const sx = Math.sqrt(Math.max(0, x2 / pw - (xm / pw) ** 2));
    $("ro").innerHTML = ro(N === 1 ? [["one wave", "everywhere, no particle"]] : [["Δk (recipe width)", fmt(dk, 2)], ["Δx (packet width)", fmt(sx, 2)], ["Δx Δk (≥ 0.5, equal at t = 0)", fmt(sx * dk, 2)], ["time", fmt(t, 1)], ["copies repeat every", fmt(2 * Math.PI / (6 * dk / (N - 1)), 0) + " in x"]]);
    void dx;
  };
  $("n").oninput = draw; $("dk").oninput = draw;
  QM.player(ctl, () => { if (t < 14) t += 0.05; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 6 waveguide as quantum well ---------------- */
{ s: "6. Light's Schrödinger equation", t: "6. A waveguide is a quantum well: modes are bound states",
intu: String.raw`For light in a slab waveguide (a high index core between lower index cladding), Maxwell's equations reduce to the <b>Helmholtz equation</b>, and it has exactly the shape of the time-independent Schrödinger equation. High index plays the role of a deep potential, so the core is a <b>well</b> (grey, drawn upside down). A <b>guided mode</b> is a bound state: it oscillates inside the core and decays into the cladding as an evanescent tail. Its effective index \(n_{\text{eff}}\) is the energy level, and it always lies between the cladding and core index. Make the core thicker or the index contrast larger: more modes fit, exactly as a deeper or wider well holds more bound states. Make it thin: modes drop out, but in a symmetric slab one mode always remains. The math under the hood is Griffiths' finite well from Chapter 2, Equation 2.138, with \(z_0\) renamed the V-number.`,
eq: String.raw`\[ \frac{d^2E}{dx^2} + k_0^2\,n^2(x)\,E = \beta^2E \qquad \text{(slab mode, TE)} \]\[ -\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2} + V(x)\,\psi = \mathcal E\,\psi \qquad \text{(Schrödinger)} \]\[ V \leftrightarrow -n^2(x), \quad \mathcal E \leftrightarrow -n_{\text{eff}}^2, \quad n_{\text{eff}} = \beta/k_0, \quad V\text{-number} = k_0a\sqrt{n_1^2 - n_2^2} \]`,
sym: [[String.raw`\(E(x)\)`, "transverse field profile of the mode"], [String.raw`\(k_0 = 2\pi/\lambda\)`, "vacuum wave number"], [String.raw`\(\beta\)`, "propagation constant, the mode's k along the guide"], [String.raw`\(n_{\text{eff}}\)`, "effective index, always between n₂ and n₁"], [String.raw`\(a\)`, "half thickness of the core"], [String.raw`\(n_1, n_2\)`, "core and cladding indices"]],
how: [String.raw`Look for a field \(E(x)e^{i(\beta z - \omega t)}\) travelling along \(z\). Put it into the wave equation \(\nabla^2E + k_0^2n^2E = 0\): the \(z\) part gives \(-\beta^2\), leaving the equation above.`, String.raw`Inside the core \(k_0^2n_1^2 \gt \beta^2\): the field oscillates, like a particle inside a well. Outside \(k_0^2n_2^2 \lt \beta^2\): it decays, like the classically forbidden region.`, String.raw`Write \(u = a\sqrt{k_0^2n_1^2 - \beta^2}\) and \(w = a\sqrt{\beta^2 - k_0^2n_2^2}\). Matching \(E\) and \(dE/dx\) at the interface gives \(w = u\tan u\) (even) or \(w = -u\cot u\) (odd), with \(u^2 + w^2 = V^2\). This is Griffiths Eq. 2.138 exactly.`, String.raw`Number of TE modes in a symmetric slab: the number of multiples of \(\pi/2\) below \(V\), rounded up. Single mode when \(V \lt \pi/2\).`],
say: String.raw`The transverse equation for a waveguide mode has the same form as the time-independent Schrödinger equation with the potential replaced by −n²(x), so guided modes are bound states of the index well, with the effective index playing the role of the energy and an evanescent tail in the cladding.`,
note: String.raw`This mapping is why your quantum intuition transfers directly to photonics: tunneling becomes evanescent coupling (directional couplers), bound states become modes, band structures of crystals become photonic band diagrams, and the finite well becomes your GaAs membrane.`,
num: String.raw`A suspended GaAs slab (\(n_1 \approx 3.68\), air cladding) at 795 nm: single TE mode below about 112 nm thickness. At 150 nm, V = 2.10, two TE modes, and the fundamental has \(n_{\text{eff}} \approx 3.23\). A silicon nitride slab (\(n = 2.0\)) in silica (1.45) at the same wavelength needs about 290 nm before the second mode appears.`,
r(fig, ctl) {
  ctl.innerHTML = sl("d", "Core thickness 2a (nm)", 50, 1000, 5, 150) + sl("n1", "Core index n₁", 1.5, 3.8, 0.01, 3.68) + sl("n2", "Cladding index n₂", 1.0, 1.6, 0.01, 1.0) + sl("lam", "Wavelength λ (nm)", 500, 1600, 5, 795) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const d = +$("d").value, n1 = +$("n1").value, n2 = Math.min(+$("n2").value, n1 - 0.01), lam = +$("lam").value;
    $("dv").textContent = d + " nm"; $("n1v").textContent = fmt(n1, 2); $("n2v").textContent = fmt(n2, 2); $("lamv").textContent = lam + " nm";
    const a = d / 2, k0 = 2 * Math.PI / lam, V = k0 * a * Math.sqrt(n1 * n1 - n2 * n2), modes = slabModes(V);
    const xm = Math.max(3 * a, a + 250), xs = Array.from({ length: 401 }, (_, i) => -xm + 2 * xm * i / 400);
    const F = QM.frame(60, 24, 560, 280, { xmin: -xm, xmax: xm, ymin: -(n1 * n1) * 1.05, ymax: -(n2 * n2) + (n1 * n1 - n2 * n2) * 0.15, xt: [-Math.round(xm), -Math.round(a), 0, Math.round(a), Math.round(xm)], yt: [-(n2 * n2), -(n1 * n1)], yf: v => "−" + fmt(Math.sqrt(-v), 2) + "²", xl: "x (nm)", yl: "−n² (the 'potential')" });
    let s = rc(F.X(-a), F.y0, F.X(a) - F.X(-a), F.h, "var(--gray-bg)") + F.s;
    s += `<path d="M${F.x0} ${F.Y(-n2 * n2)}L${F.X(-a)} ${F.Y(-n2 * n2)}L${F.X(-a)} ${F.Y(-n1 * n1)}L${F.X(a)} ${F.Y(-n1 * n1)}L${F.X(a)} ${F.Y(-n2 * n2)}L${F.x0 + F.w} ${F.Y(-n2 * n2)}" fill="none" stroke="var(--t)" stroke-width="2"/>`;
    const NC = [C.blue, C.coral, C.teal, C.purple, C.amber, C.green, C.red];
    const amp = (n1 * n1 - n2 * n2) * 0.12;
    modes.forEach((m, i) => {
      const neff = Math.sqrt(n1 * n1 - (m.u / (k0 * a)) ** 2), lev = -neff * neff;
      const prof = xs.map(x => { const ax = Math.abs(x); if (m.parity === "even") return ax < a ? Math.cos(m.u * x / a) : Math.cos(m.u) * Math.exp(-m.w * (ax - a) / a); return ax < a ? Math.sin(m.u * x / a) : Math.sign(x) * Math.sin(m.u) * Math.exp(-m.w * (ax - a) / a); });
      const mx = Math.max(...prof.map(Math.abs)) || 1;
      s += ln(F.x0, F.Y(lev), F.x0 + F.w, F.Y(lev), "var(--b)", 1, "3 3") + QM.path(F, xs, prof.map(v => lev + amp * v / mx), NC[i % NC.length], 2.2) + tx(F.x0 + F.w - 4, F.Y(lev) - 4, `TE${m.m}  n_eff = ${fmt(neff, 3)}`, "end", "ts", `fill="${NC[i % NC.length]}"`);
    });
    s += tx(F.X(0), F.y0 + 14, "core", "middle", "th") + tx(F.x0 + 8, F.y0 + 14, "cladding", "start", "ts");
    fig.innerHTML = svg(350, s);
    $("ro").innerHTML = ro([["V-number k₀a√(n₁² − n₂²)", fmt(V, 3)], ["guided TE modes", modes.length], ["n_eff of TE0", modes.length ? fmt(Math.sqrt(n1 * n1 - (modes[0].u / (k0 * a)) ** 2), 3) : "none"], ["single mode below 2a =", fmt(Math.PI / 2 / (k0 * Math.sqrt(n1 * n1 - n2 * n2)) * 2, 0) + " nm"], ["wavelength inside the core", fmt(lam / n1, 0) + " nm"]]);
  };
  ["d", "n1", "n2", "lam"].forEach(k => $(k).oninput = draw);
  draw();
}},

/* ---------------- 7 numbers ---------------- */
{ s: "7. Numbers by heart", t: "7. Numbers to know by heart: photons, electrons and length scales",
intu: String.raw`Slide the wavelength. The strip shows where you are in the spectrum, with the lines you use most: 532 nm and 633 nm lasers, your <b>795 nm</b> quantum dots and the <b>1550 nm</b> telecom band. The readouts give the photon energy, frequency, period and wave numbers. The lower comparison holds the key length scale idea of the whole shelf. An <b>electron</b> with the same energy as your photon has a de Broglie wavelength of about a nanometre, while the <b>photon</b> has hundreds of nanometres. That is why electrons are quantized by nm-sized quantum dots, while photons need structures hundreds of nm across (waveguides, photonic crystals) to be confined. Same quantum mechanics, very different sizes, set by \(E = pc\) for light against \(E = p^2/2m\) for electrons.`,
eq: String.raw`\[ E\,[\text{eV}] = \frac{1239.84}{\lambda\,[\text{nm}]}, \qquad \nu\,[\text{THz}] = \frac{299\,792}{\lambda\,[\text{nm}]}, \qquad k_0 = \frac{2\pi}{\lambda} \]\[ \hbar = 0.6582\ \text{eV fs}, \qquad \hbar c = 197.33\ \text{eV nm}, \qquad hc = 1239.84\ \text{eV nm} \]\[ \lambda_{\text{electron}} = \frac{h}{\sqrt{2mE}} = \frac{1.226\ \text{nm}}{\sqrt{E\,[\text{eV}]}} \]`,
sym: [[String.raw`\(\lambda\)`, "vacuum wavelength of the light"], [String.raw`\(E\)`, "photon energy, the same energy given to the electron below"], [String.raw`\(\nu\)`, "frequency"], [String.raw`\(\lambda_{\text{electron}}\)`, "de Broglie wavelength of a free electron with energy E"]],
how: [String.raw`Photon: \(E = h\nu = hc/\lambda\). With \(hc = 1239.84\) eV nm the conversion is one division.`, String.raw`Electron: \(p = \sqrt{2mE}\) and \(\lambda = h/p\). With \(m_e\) this is \(1.226/\sqrt{E}\) nm for \(E\) in eV.`, String.raw`At equal energy, \(\lambda_{\text{photon}}/\lambda_{\text{electron}} = \sqrt{2mc^2/E}\), and since \(m_ec^2 = 511\) keV this is about 800 at 1.5 eV.`, String.raw`In a semiconductor the electron's effective mass is smaller (0.067 \(m_e\) in GaAs), which makes its wavelength about 4 times longer. That is still nanometres.`],
say: String.raw`Photon energy in eV is 1239.84 divided by the wavelength in nm, and at the same energy an electron's de Broglie wavelength is hundreds of times shorter than the photon's, so electrons are confined by nanometre structures and photons by structures comparable to their wavelength.`,
note: String.raw`Keep three numbers in your head: \(hc = 1240\) eV nm, \(\hbar = 0.658\) eV fs and \(\hbar c = 197\) eV nm. With them you can check almost any energy, frequency or length scale in a quantum photonics paper in a few seconds.`,
num: String.raw`795 nm: 1.560 eV, 377.1 THz, period 2.65 fs, \(k_0 = 7.90\) μm⁻¹. 1550 nm: 0.800 eV, 193.4 THz. 532 nm: 2.33 eV. A free electron with 1.56 eV: \(\lambda = 0.98\) nm. A GaAs conduction electron with 50 meV: about 21 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lam", "Wavelength λ (nm)", 350, 1700, 1, 795) + `<div class="row"><button data-l="532">532</button><button data-l="633">633</button><button data-l="795">795</button><button data-l="1550">1550</button></div><div class="readout" id="ro"></div>`;
  const col = l => l < 380 ? "#7a5fb8" : l < 450 ? "#6a4fd8" : l < 495 ? "#2f7fdc" : l < 570 ? "#2e9b4f" : l < 590 ? "#d9b21f" : l < 620 ? "#e5832a" : l < 750 ? "#d33f3f" : "#8a2a2a";
  const draw = () => {
    const lam = +$("lam").value; $("lamv").textContent = lam + " nm";
    const E = 1239.84 / lam, nu = 299792.458 / lam, T = lam / 299.792458, k0 = 2 * Math.PI / (lam / 1000), lamE = 1.226 / Math.sqrt(E);
    const S = QM.frame(40, 30, 600, 40, { xmin: 350, xmax: 1700, ymin: 0, ymax: 1, xt: [400, 600, 800, 1000, 1200, 1400, 1600], yt: [], xl: "", yl: "" });
    let s = "";
    for (let l = 380; l < 750; l += 5) s += rc(S.X(l), S.y0, S.X(l + 5) - S.X(l) + 0.5, S.h, col(l), "none", 'fill-opacity="0.75"');
    s += rc(S.X(750), S.y0, S.X(1700) - S.X(750), S.h, "var(--gray-bg)") + S.s + tx(S.X(1200), S.y0 + 25, "infrared", "middle", "ts");
    [[532, "532"], [633, "633"], [795, "795 QD"], [1550, "1550 telecom"]].forEach(([l, n]) => s += ln(S.X(l), S.y0 - 4, S.X(l), S.y0 + S.h + 4, "var(--t)", 1) + tx(S.X(l), S.y0 - 8, n, "middle", "ts"));
    s += `<path d="M${S.X(lam) - 7} ${S.y0 + S.h + 18}L${S.X(lam) + 7} ${S.y0 + S.h + 18}L${S.X(lam)} ${S.y0 + S.h + 6}Z" fill="${C.purple}"/>`;
    // wave comparison: photon wave and electron wave over a 2 micron window, electron drawn in a zoom
    const W = QM.frame(40, 130, 600, 80, { xmin: 0, xmax: 2000, ymin: -1.2, ymax: 1.2, xt: [0, 500, 1000, 1500, 2000], yt: [], xl: "nm", yl: "" });
    const xs = Array.from({ length: 800 }, (_, i) => 2000 * i / 799);
    s += W.s + QM.path(W, xs, xs.map(x => Math.cos(2 * Math.PI * x / lam)), lam >= 380 && lam <= 750 ? col(lam) : C.red, 2) + tx(W.x0 + 6, W.y0 - 6, `photon, λ = ${fmt(lam, 0)} nm`, "start", "th");
    const Z = QM.frame(40, 262, 600, 80, { xmin: 0, xmax: 10, ymin: -1.2, ymax: 1.2, xt: [0, 2, 4, 6, 8, 10], yt: [], xl: "nm (200 times zoomed in)", yl: "" });
    const zs = Array.from({ length: 800 }, (_, i) => 10 * i / 799);
    s += Z.s + QM.path(Z, zs, zs.map(x => Math.cos(2 * Math.PI * x / lamE)), C.blue, 2) + tx(Z.x0 + 6, Z.y0 - 6, `free electron with the same energy, λ = ${fmt(lamE, 2)} nm`, "start", "th", `fill="${C.blue}"`);
    fig.innerHTML = svg(390, s);
    $("ro").innerHTML = ro([["photon energy", fmt(E, 3) + " eV"], ["frequency", fmt(nu, 1) + " THz"], ["period", fmt(T, 2) + " fs"], ["k₀ = 2π/λ", fmt(k0, 2) + " μm⁻¹"], ["λ inside GaAs (n ≈ 3.68)", fmt(lam / 3.68, 0) + " nm"], ["electron λ at this energy", fmt(lamE, 2) + " nm"], ["ratio photon / electron", fmt(lam / lamE, 0)]]);
  };
  $("lam").oninput = draw;
  ctl.querySelectorAll("button[data-l]").forEach(b => b.onclick = () => { $("lam").value = b.dataset.l; draw(); });
  draw();
}}
],
summary: String.raw`A plane wave exp(i(kx − ωt)) is a row of unit arrows whose angle twists by k per unit length and by ω per unit time. For light and matter E = ħω and p = ħk, so the dispersion relation ω(k) is the energy momentum relation: crests move at ω/k, packets and energy at dω/dk, and a curved ω(k) makes packets spread. Replacing E and p in E = p²/2m + V by iħ∂t and −iħ∂x gives the Schrödinger equation, and its i makes each component rotate instead of decay. Real particles and pulses are sums of plane waves with a recipe φ(k) in k-space, where free evolution is a phase factor and Δx Δk ≥ ½. Light in a waveguide obeys an equation of the same form, so modes are bound states of an index well. Keep hc = 1240 eV nm and ħ = 0.658 eV fs in your head.`,
sheet: [
[String.raw`\[ \partial_t^2u = v^2\partial_x^2u, \quad u = f(x - vt) + g(x + vt), \quad \omega = vk \]`, "Classical wave equation"],
[String.raw`\[ e^{i\theta} = \cos\theta + i\sin\theta, \quad \partial_x e^{ikx} = ik\,e^{ikx} \]`, "Euler and why plane waves simplify derivatives"],
[String.raw`\[ E = \hbar\omega, \quad p = \hbar k = h/\lambda \]`, "Planck and de Broglie"],
[String.raw`\[ v_p = \omega/k, \quad v_g = d\omega/dk, \quad n_g = c/v_g \]`, "Phase and group velocity"],
[String.raw`\[ i\hbar\partial_t\Psi = -\tfrac{\hbar^2}{2m}\partial_x^2\Psi + V\Psi \]`, "Schrödinger equation, from E = p²/2m + V"],
[String.raw`\[ \psi(x) = \tfrac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx}dk, \quad \phi(k,t) = \phi(k,0)e^{-i\omega(k)t} \]`, "k-space and free evolution"],
[String.raw`\[ \Delta x\,\Delta k \ge \tfrac12, \quad \Delta x\,\Delta p \ge \tfrac{\hbar}{2} \]`, "Fourier width relation and Heisenberg"],
[String.raw`\[ E'' + k_0^2n^2(x)E = \beta^2E, \quad n_{\text{eff}} = \beta/k_0, \quad V = k_0a\sqrt{n_1^2 - n_2^2} \]`, "Slab waveguide modes as bound states"],
[String.raw`\[ E[\text{eV}] = 1239.84/\lambda[\text{nm}], \quad \lambda_e = 1.226/\sqrt{E[\text{eV}]}\ \text{nm} \]`, "Photon and electron conversions"]],
consts: String.raw`\(h = 6.626\times10^{-34}\) J s, \(\hbar = 1.0546\times10^{-34}\) J s \(= 0.6582\) eV fs, \(c = 2.998\times10^8\) m/s, \(hc = 1239.84\) eV nm, \(\hbar c = 197.33\) eV nm, \(m_ec^2 = 511.0\) keV, GaAs index near 795 nm about 3.68`,
sources: ["D. J. Griffiths, Introduction to Quantum Mechanics (Prentice Hall, 1995), Sections 1.6, 2.4 and 2.6, which this lesson prepares", "L. de Broglie, Recherches sur la théorie des quanta, Ann. Phys. (Paris) 3, 22 (1925), matter waves, p = h/λ", "E. Schrödinger, Ann. Phys. 79, 361 (1926), the wave equation for matter", "A. Yariv and P. Yeh, Photonics: Optical Electronics in Modern Communications, 6th ed. (Oxford, 2007), slab waveguide modes and the V-number", "J. D. Joannopoulos, S. G. Johnson, J. N. Winn and R. D. Meade, Photonic Crystals: Molding the Flow of Light, 2nd ed. (Princeton, 2008), band diagrams, group velocity and slow light", "D. E. Aspnes, S. M. Kelso, R. A. Logan and R. Bhat, J. Appl. Phys. 60, 754 (1986), optical properties of GaAs and AlGaAs (refractive index near 800 nm)"]
});
})();
