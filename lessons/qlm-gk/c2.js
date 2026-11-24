(function () {
/* Quantum Light and Matter, Part B: Gerry and Knight, Introductory Quantum Optics (Cambridge, 2005).
   Chapter 2: Field quantization. Eight cards following Sections 2.1 to 2.7, written for an undergraduate:
   every card opens with the idea in plain words, an everyday picture, and what to try in the visual. */
const { tx, rc, ln, ci, fmt, C } = QM;
const ro = pairs => pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
const arr = (x1, y1, x2, y2, col, w) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 2}" marker-end="url(#ar)"/>`;
const P = (idea, pic, tryit) => `<p><b>The idea.</b> ${idea}</p><p><b>Picture it like this.</b> ${pic}</p><p><b>Try this.</b> ${tryit}</p>`;

/* normalized oscillator eigenfunctions psi_0..psi_N at dimensionless xi */
function hoAll(N, xi) {
  const o = new Float64Array(N + 1); o[0] = Math.pow(Math.PI, -0.25) * Math.exp(-xi * xi / 2);
  if (N >= 1) o[1] = Math.SQRT2 * xi * o[0];
  for (let n = 1; n < N; n++) o[n + 1] = Math.sqrt(2 / (n + 1)) * xi * o[n] - Math.sqrt(n / (n + 1)) * o[n - 1];
  return o;
}
/* probability density of quadrature X1 = (a + a†)/2 for number state n: variance (2n+1)/4 */
const quadP = (n, x) => { const v = hoAll(n, Math.SQRT2 * x)[n]; return Math.SQRT2 * v * v; };
/* Laguerre polynomial L_n(x) */
const lag = (n, x) => { let a = 1, b = 1 - x; if (n === 0) return 1; for (let k = 1; k < n; k++) { const c = ((2 * k + 1 - x) * b - k * a) / (k + 1); a = b; b = c; } return b; };
/* physical constants */
const HB = 1.054571817e-34, EPS0 = 8.8541878128e-12, CL = 2.99792458e8, KB = 1.380649e-23, EV = 1.602176634e-19, DEB = 3.33564e-30;

addLesson("qlm", "gk", {
level: "Gerry and Knight Ch. 2",
num: "Chapter 2",
id: "qlm-gk-c2", title: "Field quantization: light is a set of harmonic oscillators", short: "G&K Ch 2. Field quantization",
labels: { intu: "Explained step by step", how: "Key steps, and why each one", note: "Why it matters for your research" },
big: String.raw`This chapter answers one question: <b>what is a photon?</b> The answer is surprisingly concrete. Take light trapped between two mirrors. Its electric and magnetic fields trade energy back and forth exactly like the position and velocity of a mass on a spring. So each pattern of light that fits in the box (a <b>mode</b>) is a harmonic oscillator (card 1). Quantize that oscillator the way Griffiths did in Section 2.3 and its energy comes in steps of \(\hbar\omega\). One step up the ladder is <b>one photon</b> (card 2). This simple fact has strange consequences. A state with exactly n photons has no definite electric field at all, its average field is zero (card 3). The field is best pictured in a <b>phase space</b> of two "quadratures", where these states become rings and the vacuum becomes a fuzzy dot (card 4). Real light has many modes, and counting them gives the density of modes (card 5), which leads to Planck's thermal light (card 6). Even with zero photons the field keeps fluctuating, the <b>vacuum fluctuations</b>, which cause spontaneous emission and the Casimir force (card 7). Finally, photon number and phase cannot both be sharp (card 8).`,
bridge: String.raw`<b>Before you start:</b> this chapter uses only two things from Griffiths: the harmonic oscillator with ladder operators (Section 2.3, Chapter 2 card 4 of Part A) and Dirac notation (Chapter 3). If either feels shaky, review those cards first. <b>How to study:</b> pages 10 to 34 of Gerry and Knight. Do cards 1 to 4 with Sections 2.1 to 2.3 (the core, take two or three days), then cards 5 to 8 with Sections 2.4 to 2.7. Worth doing afterwards: Problems 2.1, 2.2 and 2.4.<div style="margin-top:12px;padding:10px 14px;border:1px solid var(--b);border-radius:8px"><b>Watch alongside (MIT 8.04 clips are by Barton Zwiebach, links open the video page):</b><ul style="margin:6px 0 0 18px;padding:0"><li><b>Cards 1 to 3:</b> <a href="https://www.coursera.org/learn/quantum-optics-single-photon" target="_blank" rel="noopener">Aspect and Brune, Quantum Optics 1, Module 1: Quantization of light, one mode</a> (the best match for this chapter), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/creation-and-annihilation-operators-acting-on-energy-eigenstates/" target="_blank" rel="noopener">L15.3 MIT 8.04 refresher: creation and annihilation operators</a> (21 min)</li><li><b>Cards 4, 7 and 8:</b> <a href="https://www.youtube.com/playlist?list=PLhfNHlQKYB1wq4AbRM5ZyoKV7K1LY1fzy" target="_blank" rel="noopener">LUMS Introduction to Quantum Optics 2025 playlist</a>: the quantization module (quadratures, Fock and vacuum states, quantum phase)</li><li><b>Card 5:</b> <a href="https://www.coursera.org/learn/quantum-optics-single-photon" target="_blank" rel="noopener">Aspect and Brune, Module 4: Multimode quantized radiation</a></li><li><b>Card 6:</b> <a href="https://www.youtube.com/playlist?list=PLhfNHlQKYB1wq4AbRM5ZyoKV7K1LY1fzy" target="_blank" rel="noopener">LUMS playlist</a>: the lecture on Planck radiation, density of modes and the Bose-Einstein distribution (second lecture)</li></ul></div>`,
cards: [

/* ---------------- 2.1a mode = oscillator ---------------- */
{ s: "1. Light in a box is a spring", t: "2.1 One mode of light is a harmonic oscillator",
intu: P(String.raw`Put light between two perfect mirrors a distance \(L\) apart. The field must vanish at the mirrors, so only standing waves fit, \(\sin(kz)\) with a whole number of half wavelengths across the box. Each allowed pattern is called a <b>mode</b>. Fix the shape of one mode and only one thing is left to change in time: <b>how strong</b> the pattern is, a single number \(q(t)\). Maxwell's equations then say that \(q(t)\) obeys exactly the equation of a mass on a spring.`,
String.raw`A child on a swing. At the top of the swing all the energy is height (potential energy), at the bottom it is all speed (kinetic energy). In the cavity mode, when the <b>electric field</b> (blue) is at its peak the <b>magnetic field</b> (coral) is zero, and a quarter period later it is the other way round. Electric energy plays the role of potential energy and magnetic energy plays the role of kinetic energy. The total stays constant, just like the swing.`,
String.raw`Press <b>Play</b>. Watch the blue and coral patterns take turns, the energy bars slosh, and the dot on the right go round a circle in the \((q, p)\) plane, exactly like a spring. Change the <b>mode number</b>: the pattern gets more nodes and oscillates faster (\(\omega_m = m\pi c/L\)), but it is still just one oscillator.`),
eq: String.raw`\[ E_x(z,t) = \left(\frac{2\omega^2}{V\varepsilon_0}\right)^{1/2} q(t)\,\sin(kz), \qquad B_y(z,t) = \frac{\mu_0\varepsilon_0}{k}\left(\frac{2\omega^2}{V\varepsilon_0}\right)^{1/2}\dot q(t)\,\cos(kz) \]<div class="eqref">Gerry and Knight Eqs. (2.5) and (2.6)</div>\[ H = \frac12\int dV\left[\varepsilon_0E_x^2 + \frac{1}{\mu_0}B_y^2\right] = \frac12\left(p^2 + \omega^2q^2\right), \qquad p = \dot q \]<div class="eqref">Gerry and Knight Eqs. (2.7) and (2.8)</div>`,
sym: [[String.raw`\(q(t)\)`, "the 'position' of the mode: how strong the electric field pattern is"], [String.raw`\(p(t) = \dot q\)`, "the 'momentum' of the mode: tied to the magnetic field"], [String.raw`\(k = m\pi/L\)`, "wave number of mode m in a cavity of length L"], [String.raw`\(\omega = ck\)`, "frequency of the mode"], [String.raw`\(V\)`, "volume of the cavity"], [String.raw`\(\varepsilon_0, \mu_0\)`, "vacuum permittivity and permeability"]],
how: [String.raw`<b>Pick the shape.</b> The mirrors force \(E_x = 0\) at \(z = 0\) and \(z = L\), so the spatial part is \(\sin(kz)\) with \(k = m\pi/L\). This is the same boundary condition as Griffiths' infinite well.`, String.raw`<b>Let only the strength vary.</b> Write \(E_x = (\text{constant})\,q(t)\sin(kz)\). The constant in front is chosen only so that the energy comes out neat in the last step.`, String.raw`<b>Get B from Maxwell.</b> Faraday's and Ampère's laws give \(B_y \propto \dot q\cos(kz)\). The magnetic pattern is shifted by a quarter wavelength in space and is driven by the rate of change of \(q\).`, String.raw`<b>Add up the energy.</b> Integrate \(\varepsilon_0E^2/2 + B^2/2\mu_0\) over the box. The \(\sin^2\) and \(\cos^2\) integrals each give \(V/2\), and the result is \(H = \frac12(p^2 + \omega^2q^2)\).`, String.raw`<b>Recognize it.</b> That is a harmonic oscillator of unit mass and frequency \(\omega\). Nothing about light was assumed here beyond Maxwell's equations, so a classical light mode is a classical spring.`],
say: String.raw`A single mode of the electromagnetic field in a cavity has the energy H = ½(p² + ω²q²), where q measures the electric field amplitude and p = dq/dt the magnetic field, so each mode is mathematically a harmonic oscillator.`,
note: String.raw`Every photonic structure you design (waveguide, ring, photonic crystal cavity) has its own modes, and every one of them is a harmonic oscillator in exactly this sense. Tidy3D finds the mode shapes. Quantum optics then treats each shape as one oscillator.`,
num: String.raw`For a 1 cm cavity: mode \(m\) has \(\omega_m/2\pi = mc/2L = m \times 15\) GHz, so 795 nm light (377 THz) corresponds to \(m \approx 25\,000\). For a photonic crystal nanocavity the "box" is about half a wavelength in the material, \(\lambda/2n \approx 108\) nm in GaAs.`,
r(fig, ctl) {
  let t = 0;
  ctl.innerHTML = sl("m", "Mode number m", 1, 4, 1, 2) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const m = +$("m").value, w = m; $("mv").textContent = m;
    const q = Math.cos(w * t), p = -w * Math.sin(w * t);
    const F = QM.frame(40, 30, 380, 180, { xmin: 0, xmax: 1, ymin: -1.2, ymax: 1.2, xt: [0, 0.5, 1], xf: v => v === 0 ? "0" : v === 1 ? "L" : "L/2", yt: [], xl: "position z in the cavity", yl: "" });
    let s = rc(F.x0 - 8, F.y0, 8, F.h, "var(--t)") + rc(F.x0 + F.w, F.y0, 8, F.h, "var(--t)") + F.s + ln(F.x0, F.Y(0), F.x0 + F.w, F.Y(0), "var(--b)");
    const zs = Array.from({ length: 201 }, (_, i) => i / 200);
    s += QM.path(F, zs, zs.map(z => Math.sin(m * Math.PI * z)), C.blue, 1, "3 3") + QM.path(F, zs, zs.map(z => q * Math.sin(m * Math.PI * z)), C.blue, 3);
    s += QM.path(F, zs, zs.map(z => (p / w) * Math.cos(m * Math.PI * z)), C.coral, 3);
    s += tx(F.x0 + F.w / 2, F.y0 - 8, "E field (blue), B field (coral)", "middle", "ts") + tx(F.x0 - 4, F.y0 - 8, "mirror", "middle", "ts") + tx(F.x0 + F.w + 4, F.y0 - 8, "mirror", "middle", "ts");
    // energy bars
    const eE = q * q, eB = (p / w) ** 2, bx = 450;
    s += rc(bx, 30 + 150 * (1 - eE), 26, 150 * eE, C.blue) + rc(bx + 36, 30 + 150 * (1 - eB), 26, 150 * eB, C.coral) + rc(bx + 72, 30, 26, 150, "var(--gray-bg)") + ln(bx - 4, 180, bx + 102, 180, "var(--p)");
    s += tx(bx + 13, 196, "E", "middle", "th", `fill="${C.blue}"`) + tx(bx + 49, 196, "B", "middle", "th", `fill="${C.coral}"`) + tx(bx + 85, 196, "total", "middle", "ts") + tx(bx + 50, 22, "energy", "middle", "ts");
    // phase space
    const cx = 600, cy = 105, R = 55;
    s += ln(cx - R - 10, cy, cx + R + 10, cy, "var(--b)") + ln(cx, cy - R - 10, cx, cy + R + 10, "var(--b)") + ci(cx, cy, R, "none", "var(--p)", 'stroke-dasharray="3 3"') + ci(cx + R * q, cy - R * p / w, 6, C.purple) + tx(cx + R + 12, cy + 4, "q", "start", "th") + tx(cx, cy - R - 14, "p/ω", "middle", "th") + tx(cx, cy + R + 24, "same as a spring", "middle", "ts");
    // spring analogy
    const sy = 272, xm = 300 + 90 * q;
    let d = `M120 ${sy}`; for (let i = 1; i <= 16; i++) d += `L${(120 + (xm - 140) * i / 16).toFixed(1)} ${sy + (i % 2 ? -9 : 9)}`; d += `L${xm - 20} ${sy}`;
    s += rc(110, sy - 22, 10, 44, "var(--t)") + `<path d="${d}" fill="none" stroke="var(--p)" stroke-width="1.5"/>` + rc(xm - 20, sy - 16, 40, 32, C.purple, "none", 'rx="4"') + tx(xm, sy + 5, "m", "middle", "th", 'fill="#fff"');
    s += tx(440, sy + 5, "position ↔ E field,  velocity ↔ B field", "start", "ts");
    fig.innerHTML = svg(305, s);
    $("ro").innerHTML = ro([["mode frequency ω", `m × πc/L = ${m} units`], ["electric energy share", fmt(eE, 2)], ["magnetic energy share", fmt(eB, 2)], ["total", "constant"]]);
  };
  $("m").oninput = draw;
  QM.player(ctl, () => { t += 0.03; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 2.1b photons ---------------- */
{ s: "2. Photons are ladder steps", t: "2.1 Quantizing the oscillator: photons, â and â†",
intu: P(String.raw`Card 1 showed that a light mode is a spring. Quantum mechanics already knows how to treat a spring (Griffiths 2.3): promote \(q\) and \(p\) to operators with \([\hat q, \hat p] = i\hbar\), and the energy can only take the values \(\hbar\omega(n + \tfrac12)\). Gerry and Knight simply <b>rename</b> things. The rung number \(n\) is the <b>number of photons</b> in the mode. The raising operator \(\hat a^\dagger\) <b>creates</b> one photon, the lowering operator \(\hat a\) <b>annihilates</b> one. A photon is not a little ball inside the box. It is one quantum of excitation of the mode.`,
String.raw`A staircase with perfectly equal steps. Each step up costs exactly \(\hbar\omega\), the energy of one photon of that colour. Standing on step \(n\) means "the mode holds n photons". The bottom step is not at zero height: even the empty mode (the <b>vacuum</b>) keeps \(\tfrac12\hbar\omega\).`,
String.raw`Press <b>â† (add a photon)</b> and <b>â (remove a photon)</b>. Watch the energy climb in equal steps and the photon counter change. Remove photons until you reach \(|0\rangle\) and press â again: you get zero, not a negative number of photons. The readout also shows the factors \(\sqrt n\) and \(\sqrt{n+1}\): they are not decoration, they decide how strongly light and atoms interact (stimulated emission in Chapter 4).`),
eq: String.raw`\[ \hat a = \frac{1}{\sqrt{2\hbar\omega}}(\omega\hat q + i\hat p), \qquad \hat a^\dagger = \frac{1}{\sqrt{2\hbar\omega}}(\omega\hat q - i\hat p), \qquad [\hat a, \hat a^\dagger] = 1 \]<div class="eqref">Gerry and Knight Eqs. (2.13), (2.14) and (2.17)</div>\[ \hat H = \hbar\omega\left(\hat a^\dagger\hat a + \tfrac12\right), \qquad \hat E_x = \mathcal E_0(\hat a + \hat a^\dagger)\sin(kz), \quad \mathcal E_0 = \sqrt{\frac{\hbar\omega}{\varepsilon_0V}} \]<div class="eqref">Gerry and Knight Eqs. (2.18) and (2.15)</div>\[ \hat a|n\rangle = \sqrt n\,|n-1\rangle, \quad \hat a^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle, \quad E_n = \hbar\omega\left(n + \tfrac12\right), \quad |n\rangle = \frac{(\hat a^\dagger)^n}{\sqrt{n!}}|0\rangle \]<div class="eqref">Gerry and Knight Eqs. (2.34), (2.38) to (2.40)</div>`,
sym: [[String.raw`\(\hat a\)`, "annihilation operator, removes one photon from the mode"], [String.raw`\(\hat a^\dagger\)`, "creation operator, adds one photon"], [String.raw`\(\hat n = \hat a^\dagger\hat a\)`, "number operator, counts photons: n̂|n⟩ = n|n⟩"], [String.raw`\(|n\rangle\)`, "number state or Fock state: exactly n photons in the mode"], [String.raw`\(|0\rangle\)`, "the vacuum, no photons, but energy ½ħω"], [String.raw`\(\mathcal E_0\)`, "the 'electric field per photon' (G&K's E₀), set by the mode volume V"]],
how: [String.raw`<b>Promote to operators.</b> \(q\) and \(p\) of the mode become \(\hat q, \hat p\) with \([\hat q, \hat p] = i\hbar\) (Eq. 2.9). This is the only new assumption in the whole chapter.`, String.raw`<b>Combine them.</b> \(\hat a \propto \omega\hat q + i\hat p\) is a clever mix, the quantum version of the complex amplitude \(\alpha\) of a classical wave. From \([\hat q, \hat p] = i\hbar\) follows \([\hat a, \hat a^\dagger] = 1\).`, String.raw`<b>Rewrite the energy.</b> \(\frac12(\hat p^2 + \omega^2\hat q^2) = \hbar\omega(\hat a^\dagger\hat a + \frac12)\). The \(\tfrac12\) is left over because \(\hat a\) and \(\hat a^\dagger\) do not commute.`, String.raw`<b>Climb the ladder.</b> If \(\hat H|n\rangle = E_n|n\rangle\), then \(\hat a^\dagger|n\rangle\) has energy \(E_n + \hbar\omega\) and \(\hat a|n\rangle\) has \(E_n - \hbar\omega\) (Eqs. 2.29, 2.30). Energy cannot go below zero, so there is a bottom: \(\hat a|0\rangle = 0\).`, String.raw`<b>Fix the factors.</b> Normalizing gives \(\hat a|n\rangle = \sqrt n|n-1\rangle\) and \(\hat a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle\). Applying \(\hat a^\dagger\) n times to the vacuum builds every number state.`],
say: String.raw`Quantizing a field mode as a harmonic oscillator gives the Hamiltonian ħω(a†a + ½), whose eigenstates |n⟩ contain exactly n photons of energy ħω each, with a† creating and a annihilating a photon and the vacuum |0⟩ retaining the zero-point energy ½ħω.`,
note: String.raw`A single photon source, such as your quantum dots or Choi's diamond color centers, aims to put the mode in exactly \(|1\rangle\). The \(\sqrt{n+1}\) factor is why emission into an already occupied mode is enhanced (stimulated emission, the basis of the laser), and the "+1" is spontaneous emission (Chapter 4).`,
num: String.raw`At 795 nm each photon carries \(\hbar\omega = 1.560\) eV \(= 2.50\times10^{-19}\) J. A 1 nW beam at 795 nm carries \(4.0\times10^{9}\) photons per second. The vacuum of the same mode holds \(\tfrac12\hbar\omega = 0.78\) eV.`,
r(fig, ctl) {
  let n = 0, msg = "the vacuum |0⟩: no photons, energy ½ħω", fac = "";
  ctl.innerHTML = `<div class="row"><button id="up">â† (add a photon)</button><button id="dn">â (remove a photon)</button><button id="z">Empty the mode</button></div><div class="readout" id="ro"></div>`;
  const draw = () => {
    let s = "";
    const L = QM.frame(60, 24, 200, 300, { xmin: 0, xmax: 1, ymin: 0, ymax: 9, xt: [], yt: [0.5, 2.5, 4.5, 6.5, 8.5], yf: v => fmt(v, 1), yl: "E / ħω" });
    s += L.s;
    for (let k = 0; k <= 8; k++) s += ln(L.x0 + 10, L.Y(k + 0.5), L.x0 + L.w - 10, L.Y(k + 0.5), k === n ? C.coral : "var(--b)", k === n ? 3 : 1.5) + tx(L.x0 + L.w + 6, L.Y(k + 0.5) + 4, "|" + k + "⟩", "start", "ts", k === n ? `fill="${C.coral}"` : "");
    s += ci(L.x0 + L.w / 2, L.Y(n + 0.5) - 10, 8, C.coral);
    // cavity with photons
    const bx = 330, by = 60, bw = 280, bh = 150;
    s += rc(bx - 8, by, 8, bh, "var(--t)") + rc(bx + bw, by, 8, bh, "var(--t)") + rc(bx, by, bw, bh, "var(--sunk)", "var(--b)");
    for (let i = 0; i < n; i++) { const x = bx + 30 + (i % 4) * 65, y = by + 40 + Math.floor(i / 4) * 50; s += ci(x, y, 13, C.amber) + tx(x, y + 4, "ħω", "middle", "ts", 'fill="#412402"'); }
    if (n === 0) s += tx(bx + bw / 2, by + bh / 2, "empty mode: the vacuum", "middle", "th");
    s += tx(bx + bw / 2, by - 12, `the cavity mode holds ${n} photon${n === 1 ? "" : "s"}`, "middle", "th");
    s += tx(bx + bw / 2, by + bh + 34, msg, "middle", "th", `fill="${C.purple}"`) + tx(bx + bw / 2, by + bh + 56, fac, "middle", "ts");
    fig.innerHTML = svg(340, s);
    $("ro").innerHTML = ro([["photons n", n], ["energy (n + ½)ħω at 795 nm", fmt((n + 0.5) * 1.5596, 3) + " eV"], ["⟨n|n̂|n⟩", n]]);
  };
  $("up").onclick = () => { if (n < 8) { fac = `â†|${n}⟩ = √${n + 1} |${n + 1}⟩ = ${fmt(Math.sqrt(n + 1), 3)} |${n + 1}⟩`; n++; msg = "created one photon, energy up by ħω"; } else msg = "top of this picture, the ladder continues forever"; draw(); };
  $("dn").onclick = () => { if (n > 0) { fac = `â|${n}⟩ = √${n} |${n - 1}⟩ = ${fmt(Math.sqrt(n), 3)} |${n - 1}⟩`; n--; msg = "annihilated one photon, energy down by ħω"; } else { fac = "â|0⟩ = 0"; msg = "â|0⟩ = 0: you cannot remove a photon from the vacuum"; } draw(); };
  $("z").onclick = () => { n = 0; fac = ""; msg = "the vacuum |0⟩: no photons, energy ½ħω"; draw(); };
  draw();
}},

/* ---------------- 2.2 fluctuations ---------------- */
{ s: "3. n photons, no field?", t: "2.2 A state with n photons has zero average field",
intu: P(String.raw`Classically, light is a wave with a definite amplitude and a definite phase: at any moment the field has a definite value. A number state \(|n\rangle\) is different. Compute the average field and you get <b>exactly zero</b>, at every point and every time (Eq. 2.44). But the average of the field <b>squared</b> is not zero, so the energy is there. The field is real but it has no definite phase: every phase is equally likely, so the positive and negative values average out.`,
String.raw`Imagine a thousand identical cavities, each holding exactly 3 photons. Measure the electric field in all of them at the same instant. A classical wave would give the same value every time. The number state gives a <b>spread of values</b>, positive and negative, centred on zero. It is like asking for the position of a child on a swing that has a known energy but an unknown starting time: you know how high it swings, not where it is now.`,
String.raw`Compare <b>Classical wave</b> with <b>Number state</b>. On the left, each grey trace is the field you might find in one copy over one period. Classically all copies agree. In the number state they have random phases. On the right is the histogram of field values at one fixed time. Raise \(n\): the spread grows as \(\sqrt{2n+1}\), and for \(n = 0\) it does not vanish. That leftover spread is the <b>vacuum fluctuation</b>.`),
eq: String.raw`\[ \langle n|\hat E_x|n\rangle = \mathcal E_0\sin(kz)\left[\langle n|\hat a|n\rangle + \langle n|\hat a^\dagger|n\rangle\right] = 0 \]<div class="eqref">Gerry and Knight Eq. (2.44)</div>\[ \Delta E_x = \sqrt2\,\mathcal E_0\,|\sin(kz)|\left(n + \tfrac12\right)^{1/2} \]<div class="eqref">Gerry and Knight Eq. (2.47)</div>\[ [\hat n, \hat E_x] \ne 0, \qquad \Delta n\,\Delta\phi \gtrsim 1 \]<div class="eqref">Gerry and Knight Eqs. (2.48) and (2.50)</div>`,
sym: [[String.raw`\(\langle n|\hat E_x|n\rangle\)`, "average field in the number state, zero"], [String.raw`\(\Delta E_x\)`, "standard deviation of the field, nonzero even for n = 0"], [String.raw`\(\Delta n, \Delta\phi\)`, "spreads of photon number and phase"], [String.raw`\(\mathcal E_0\)`, "field per photon, √(ħω/ε₀V)"]],
how: [String.raw`<b>Average field.</b> \(\hat E_x \propto \hat a + \hat a^\dagger\). Acting on \(|n\rangle\), \(\hat a\) gives \(|n-1\rangle\) and \(\hat a^\dagger\) gives \(|n+1\rangle\), both orthogonal to \(|n\rangle\). So \(\langle\hat E_x\rangle = 0\).`, String.raw`<b>Average of the square.</b> \((\hat a + \hat a^\dagger)^2 = \hat a^2 + \hat a^{\dagger2} + 2\hat a^\dagger\hat a + 1\). Only the last two terms survive in \(|n\rangle\), giving \(2n + 1\) (Eq. 2.45).`, String.raw`<b>The +1.</b> It comes from \([\hat a, \hat a^\dagger] = 1\). It is why the field fluctuates even in the vacuum.`, String.raw`<b>Why no definite field?</b> \(\hat n\) and \(\hat E_x\) do not commute (Eq. 2.48). A state with sharp photon number (\(\Delta n = 0\)) cannot have a sharp field. Heuristically, number and phase trade off like energy and time.`],
say: String.raw`A photon number state has zero mean electric field but nonzero field fluctuations, ΔE = √2 E₀ sin(kz) √(n + ½), because photon number and field do not commute, so a state with definite photon number has completely undefined phase.`,
note: String.raw`A perfect single photon source emits \(|1\rangle\), which has no phase at all. That is fine for counting experiments (Chapter 5) but means a single photon cannot serve as a phase reference. Lasers, which you use every day, are the opposite case: nearly definite phase, uncertain number (Chapter 3).`,
num: String.raw`In units of \(\mathcal E_0\) at an antinode: \(\Delta E = 1.00\) for the vacuum (Eq. 2.156), 1.73 for one photon, 3.00 for four photons, 10.0 for fifty. The spread grows like \(\sqrt n\), just as the amplitude of a classical wave carrying the same energy would, but the mean stays exactly zero.`,
r(fig, ctl) {
  let mode = "num", seeds = [];
  ctl.innerHTML = btns([["cl", "Classical wave"], ["num", "Number state |n⟩"]], "md") + sl("n", "Photon number n", 0, 12, 1, 3) + `<div class="row"><button id="rs">New random copies</button></div><div class="readout" id="ro"></div>`;
  const reseed = () => { seeds = Array.from({ length: 24 }, () => Math.random() * 2 * Math.PI); };
  const draw = () => {
    pick(ctl, "md", mode); const n = +$("n").value; $("nv").textContent = n;
    const A = Math.sqrt(2 * n + 1), amp = 2 * Math.sqrt(n + 0.5);   // classical amplitude whose random-phase rms equals the number-state spread, in units of E0
    const ym = Math.max(3, amp * 1.6 + 1);
    const F = QM.frame(60, 30, 330, 250, { xmin: 0, xmax: 2 * Math.PI, ymin: -ym, ymax: ym, xt: [0, Math.PI, 2 * Math.PI], xf: v => ["0", "T/2", "T"][Math.round(v / Math.PI)], yt: [-Math.round(ym * 0.7), 0, Math.round(ym * 0.7)], xl: "time over one period", yl: "E (units of E₀)" });
    let s = F.s + ln(F.x0, F.Y(0), F.x0 + F.w, F.Y(0), "var(--b)");
    const ts = Array.from({ length: 121 }, (_, i) => 2 * Math.PI * i / 120), t0 = Math.PI / 2;
    if (mode === "cl") { s += QM.path(F, ts, ts.map(t => amp * Math.cos(t)), C.blue, 3); }
    else { seeds.forEach(ph => s += QM.path(F, ts, ts.map(t => amp * Math.cos(t + ph)), "var(--p)", 1, "", 'stroke-opacity="0.45"')); s += QM.path(F, ts, ts.map(() => 0), C.purple, 2.5, "6 4"); s += tx(F.x0 + 6, F.y0 + 14, "grey: possible copies, purple: average = 0", "start", "ts"); }
    s += ln(F.X(t0), F.y0, F.X(t0), F.y0 + F.h, C.amber, 1.5, "4 3") + tx(F.X(t0) + 4, F.y0 + F.h - 6, "measure here", "start", "ts", `fill="${C.amber}"`);
    // histogram of field at t0
    const H = QM.frame(470, 30, 150, 250, { xmin: 0, xmax: 1, ymin: -ym, ymax: ym, xt: [], yt: [], xl: "probability", yl: "" });
    s += H.s + ln(H.x0, H.Y(0), H.x0 + H.w, H.Y(0), "var(--b)");
    if (mode === "cl") { const v = amp * Math.cos(t0); s += rc(H.x0, H.Y(v) - 2, H.w * 0.9, 4, C.blue) + tx(H.x0 + 4, H.Y(v) - 8, "always this value", "start", "ts", `fill="${C.blue}"`); }
    else {
      const ys = Array.from({ length: 241 }, (_, i) => -ym + 2 * ym * i / 240), pr = ys.map(e => quadP(n, e / 2)), pm = Math.max(...pr);
      let d = `M${H.x0} ${H.Y(ys[0])}`; ys.forEach((e, i) => d += `L${(H.x0 + H.w * 0.95 * pr[i] / pm).toFixed(1)} ${H.Y(e).toFixed(1)}`); d += `L${H.x0} ${H.Y(ys[ys.length - 1])}Z`;
      s += `<path d="${d}" fill="${C.purple}" fill-opacity="0.35" stroke="${C.purple}" stroke-width="1.5"/>`;
    }
    s += tx(H.x0 + H.w / 2, H.y0 - 10, "field values found", "middle", "ts");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = ro(mode === "cl" ? [["mean field", "a definite sinusoid"], ["spread at one time", "0"], ["photon number", "not defined classically"]] : [["⟨E⟩", "0"], ["ΔE / E₀ = √2 √(n + ½)", fmt(Math.sqrt(2) * Math.sqrt(n + 0.5), 3)], ["Δn", "0, exactly n photons"], ["phase", "completely random"]]);
    void A;
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; draw(); });
  $("n").oninput = draw; $("rs").onclick = () => { reseed(); draw(); };
  reseed(); draw();
}},

/* ---------------- 2.3 quadratures ---------------- */
{ s: "4. Quadratures and phase space", t: "2.3 Quadrature operators: drawing light in phase space",
intu: P(String.raw`Any oscillating field can be split into a cosine part and a sine part: \(E(t) \propto X_1\cos\omega t + X_2\sin\omega t\). These two amplitudes are the <b>quadratures</b>. They are the light version of position and momentum, and in quantum mechanics they become operators that do not commute, \([\hat X_1, \hat X_2] = i/2\). So light lives in a 2D <b>phase space</b> with \(X_1\) and \(X_2\) as axes, and a state of light is drawn as a blob (a quasi-probability distribution called the Wigner function) in that plane.`,
String.raw`Think of a clock hand. A classical wave is a hand with a definite length (amplitude) and angle (phase), drawn as a single point in this plane. Quantum light is a fuzzy patch instead of a point. A number state is a <b>ring</b>: the radius (energy) is sharp but the angle (phase) is totally undecided, which is card 3 in picture form. The <b>vacuum</b> is a round fuzzy dot at the centre, the smallest blob nature allows.`,
String.raw`Slide \(n\) from 0 upwards and watch the vacuum dot turn into rings. For \(n \ge 1\) coral regions appear where the Wigner function is <b>negative</b>. A real probability can never be negative, so these regions are the fingerprint of genuinely <b>quantum light</b>. Rotate the <b>measurement angle</b>: the strip on the right is what a field measurement at that phase would find (the shadow of the blob). For a number state it looks the same at every angle.`),
eq: String.raw`\[ \hat X_1 = \tfrac12(\hat a + \hat a^\dagger), \qquad \hat X_2 = \tfrac{1}{2i}(\hat a - \hat a^\dagger), \qquad [\hat X_1, \hat X_2] = \tfrac{i}{2} \]<div class="eqref">Gerry and Knight Eqs. (2.52), (2.53) and (2.55)</div>\[ \hat E_x(t) = 2\mathcal E_0\sin(kz)\left[\hat X_1\cos\omega t + \hat X_2\sin\omega t\right], \qquad \langle(\Delta X_1)^2\rangle\langle(\Delta X_2)^2\rangle \ge \tfrac{1}{16} \]<div class="eqref">Gerry and Knight Eqs. (2.54) and (2.56)</div>\[ \langle n|(\Delta\hat X_{1,2})^2|n\rangle = \tfrac14(2n + 1), \qquad W_n(\alpha) = \frac{2}{\pi}(-1)^n e^{-2|\alpha|^2}L_n(4|\alpha|^2) \]<div class="eqref">Gerry and Knight Eqs. (2.58), (2.59) and Section 3.7</div>`,
sym: [[String.raw`\(\hat X_1, \hat X_2\)`, "quadratures: the cosine and sine amplitudes of the field, light's x and p"], [String.raw`\(\alpha = X_1 + iX_2\)`, "a point in phase space"], [String.raw`\(W(\alpha)\)`, "Wigner function, a quasi-probability that can go negative"], [String.raw`\(L_n\)`, "Laguerre polynomial"], [String.raw`\(\theta\)`, "measurement angle: which combination X₁cosθ + X₂sinθ is measured"]],
how: [String.raw`<b>Split the field.</b> Insert \(\hat a(t) = \hat a e^{-i\omega t}\) into \(\hat E_x\) and collect the cosine and sine parts. Their coefficients are \(\hat X_1\) and \(\hat X_2\).`, String.raw`<b>They are x and p in disguise.</b> Up to scaling, \(\hat X_1 \propto \hat q\) and \(\hat X_2 \propto \hat p\), so \([\hat X_1, \hat X_2] = i/2\) and the uncertainty principle of Griffiths Chapter 3 gives \(\Delta X_1\Delta X_2 \ge 1/4\).`, String.raw`<b>The vacuum is minimal.</b> In \(|0\rangle\) both variances are exactly 1/4: the smallest possible symmetric blob, \(\Delta X_1 = \Delta X_2 = 1/2\).`, String.raw`<b>Number states are rings.</b> In \(|n\rangle\) both variances are \((2n+1)/4\), equal in every direction: no preferred phase.`, String.raw`<b>Wigner function.</b> A way to draw a quantum state in phase space whose shadows are the true measured distributions. Its negative regions cannot occur for any classical mixture of waves.`],
say: String.raw`The quadrature operators X₁ and X₂ are the dimensionless cosine and sine amplitudes of the field, they obey [X₁, X₂] = i/2 like position and momentum, and number states appear in phase space as rings with negative Wigner regions while the vacuum is a minimum-uncertainty disk with variances 1/4.`,
note: String.raw`Phase space is the language of Choi's squeezed light work. A squeezed state is the vacuum disk pressed into an ellipse, so one quadrature has less noise than the vacuum (Gerry and Knight Chapter 7). Homodyne detection measures exactly the shadow strip in this card.`,
num: String.raw`Vacuum: \(\Delta X_1 = \Delta X_2 = 0.5\), product 0.25, the minimum. \(|1\rangle\): \(\Delta X = 0.866\). \(|5\rangle\): \(\Delta X = 1.66\). The Wigner function of \(|1\rangle\) at the origin is \(-2/\pi = -0.64\), the most negative value allowed.`,
r(fig, ctl) {
  ctl.innerHTML = sl("n", "Photon number n", 0, 6, 1, 1) + sl("th", "Measurement angle θ", 0, 180, 1, 0) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const n = +$("n").value, th = +$("th").value * Math.PI / 180; $("nv").textContent = n; $("thv").textContent = $("th").value + "°";
    const R = Math.sqrt(n + 0.5) * 0.9 + 1.4, cx = 200, cy = 175, S = 140 / R, N = 70;
    let s = "";
    const wmax = 2 / Math.PI;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = -R + 2 * R * (i + 0.5) / N, y = -R + 2 * R * (j + 0.5) / N, r2 = x * x + y * y, w = (2 / Math.PI) * (n % 2 ? -1 : 1) * Math.exp(-2 * r2) * lag(n, 4 * r2);
      const a = Math.min(1, Math.abs(w) / wmax * 1.6); if (a < 0.03) continue;
      s += `<rect x="${(cx + x * S - S * R / N).toFixed(1)}" y="${(cy - y * S - S * R / N).toFixed(1)}" width="${(2 * S * R / N + 0.4).toFixed(1)}" height="${(2 * S * R / N + 0.4).toFixed(1)}" fill="${w > 0 ? C.purple : C.coral}" fill-opacity="${a.toFixed(2)}"/>`;
    }
    s += ln(cx - R * S, cy, cx + R * S, cy, "var(--p)") + ln(cx, cy - R * S, cx, cy + R * S, "var(--p)") + tx(cx + R * S + 6, cy + 4, "X₁", "start", "th") + tx(cx, cy - R * S - 8, "X₂", "middle", "th");
    s += ln(cx - R * S * Math.cos(th), cy + R * S * Math.sin(th), cx + R * S * Math.cos(th), cy - R * S * Math.sin(th), C.amber, 2, "6 4");
    s += tx(cx, cy + R * S + 22, "purple: positive, coral: negative (quantum)", "middle", "ts");
    // marginal along theta: number states are rotation invariant
    const Mf = QM.frame(420, 40, 200, 270, { xmin: 0, xmax: 1.2, ymin: -R, ymax: R, xt: [], yt: [], xl: "probability", yl: "" });
    const xs = Array.from({ length: 241 }, (_, i) => -R + 2 * R * i / 240), pr = xs.map(x => quadP(n, x)), pm = Math.max(...pr);
    let d = `M${Mf.x0} ${Mf.Y(xs[0])}`; xs.forEach((x, i) => d += `L${(Mf.x0 + Mf.w * 0.9 * pr[i] / pm).toFixed(1)} ${Mf.Y(x).toFixed(1)}`); d += `L${Mf.x0} ${Mf.Y(R)}Z`;
    s += Mf.s + `<path d="${d}" fill="${C.amber}" fill-opacity="0.35" stroke="${C.amber}" stroke-width="1.5"/>` + tx(Mf.x0 + Mf.w / 2, Mf.y0 - 10, "measured X(θ) values", "middle", "ts", `fill="${C.amber}"`);
    fig.innerHTML = svg(360, s);
    const W0 = (2 / Math.PI) * (n % 2 ? -1 : 1);
    $("ro").innerHTML = ro([["ΔX₁ = ΔX₂ = √(2n+1)/2", fmt(Math.sqrt(2 * n + 1) / 2, 3)], ["ΔX₁ ΔX₂ (≥ 0.25)", fmt((2 * n + 1) / 4, 3)], ["W at the origin", fmt(W0, 3) + (W0 < 0 ? " (negative: quantum)" : "")], ["depends on θ?", "no, a ring has no preferred phase"]]);
  };
  $("n").oninput = draw; $("th").oninput = draw; draw();
}},

/* ---------------- 2.4 multimode ---------------- */
{ s: "5. Many modes, mode density", t: "2.4 Multimode fields: counting the modes",
intu: P(String.raw`Real light is not one mode, it is many. In a box of side \(L\) with periodic walls, the allowed waves have \(\mathbf k = \frac{2\pi}{L}(m_x, m_y, m_z)\) with whole numbers \(m\). So the modes are points on a 3D grid in k-space, each with two polarizations, and <b>each one is its own independent oscillator</b> with its own photons. Counting how many grid points fall in a thin shell of radius \(k\) tells you how many modes are available at frequency \(\omega = ck\): the <b>density of modes</b>, which grows as \(\omega^2\).`,
String.raw`Seats in a stadium. The rows farther from the centre are longer, so there are more seats per row. In k-space, shells at larger radius have more area, so there are more modes at higher frequency. This is why blue light has far more ways to be emitted than red light in free space, and why changing the "stadium" (a cavity, a photonic crystal) changes how fast an atom can emit.`,
String.raw`The left picture is a slice through the grid of allowed \(\mathbf k\) with the shell highlighted. Increase the box size \(L\): the grid gets finer (more modes in the same shell). The right plot counts the modes exactly in 3D (the staircase) and compares with the smooth formula \(2\cdot\frac43\pi R^3\). For a big box they agree perfectly, which is how the continuum of free-space modes appears.`),
eq: String.raw`\[ \mathbf k = \frac{2\pi}{L}(m_x, m_y, m_z), \qquad m_i = 0, \pm1, \pm2, \dots \]<div class="eqref">Gerry and Knight Eqs. (2.65) to (2.68)</div>\[ dm = 2\left(\frac{L}{2\pi}\right)^3 d^3k \;\Rightarrow\; \rho(\omega) = \frac{\omega^2}{\pi^2c^3} \quad \text{(modes per unit volume per unit } \omega\text{)} \]<div class="eqref">Gerry and Knight Eqs. (2.70) to (2.75) and the text before Eq. (2.151)</div>\[ \hat H = \sum_{\mathbf k,s}\hbar\omega_k\left(\hat a_{\mathbf ks}^\dagger\hat a_{\mathbf ks} + \tfrac12\right), \qquad [\hat a_{\mathbf ks}, \hat a_{\mathbf k's'}^\dagger] = \delta_{\mathbf kk'}\delta_{ss'} \]<div class="eqref">Gerry and Knight Eqs. (2.104) and (2.105)</div>`,
sym: [[String.raw`\(\mathbf k, s\)`, "label of one mode: wave vector and polarization (s = 1, 2)"], [String.raw`\(L, V = L^3\)`, "size and volume of the quantization box"], [String.raw`\(\rho(\omega)\)`, "density of modes, both polarizations included"], [String.raw`\(\hat a_{\mathbf ks}\)`, "annihilation operator of mode (k, s), each mode has its own ladder"]],
how: [String.raw`<b>Periodic box.</b> Require \(e^{ik_xx} = e^{ik_x(x+L)}\), so \(k_x = 2\pi m_x/L\), and the same for y and z.`, String.raw`<b>Each grid point is a mode.</b> One point occupies a volume \((2\pi/L)^3\) of k-space, and there are 2 polarizations per point.`, String.raw`<b>Count a shell.</b> A shell of radius \(k\) and thickness \(dk\) has volume \(4\pi k^2dk\), so it holds \(2\cdot\frac{V}{(2\pi)^3}4\pi k^2dk = \frac{Vk^2}{\pi^2}dk\) modes.`, String.raw`<b>Switch to frequency.</b> With \(k = \omega/c\), modes per volume per \(d\omega\): \(\rho(\omega) = \omega^2/\pi^2c^3\).`, String.raw`<b>Independent oscillators.</b> The total energy separates into a sum over modes, each a ladder like card 2. Different modes commute.`],
say: String.raw`The free field is a collection of independent harmonic oscillators, one per mode (k, s), and in a large box the number of modes per unit volume per unit angular frequency is ρ(ω) = ω²/π²c³.`,
note: String.raw`The density of modes is the lever behind your field's favourite trick. A cavity or a slow-light photonic crystal waveguide concentrates the modes at the emitter's frequency, increasing the local density of states, and the emitter decays faster into them (the <b>Purcell effect</b>, Chapter 4). That is how quantum dots and color centers are coupled efficiently to chips.`,
num: String.raw`At 795 nm, \(\rho(\omega) = 2.1\times10^4\) s m⁻³. In a 1 μm³ box and a 1 THz wide band there are only about 0.13 modes. A wavelength-scale cavity gives the emitter essentially one mode to talk to.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Box size L (relative)", 1, 3, 0.1, 1.6) + sl("R", "Shell radius (frequency)", 1, 8, 0.1, 5) + `<div class="readout" id="ro"></div>`;
  /* exact mode counts inside spheres of radius rs (grid units), one pass over the lattice, 2 polarizations */
  const counts = rs => { const out = rs.map(() => 0), M = Math.ceil(rs[rs.length - 1]); for (let x = -M; x <= M; x++) for (let y = -M; y <= M; y++) for (let z = -M; z <= M; z++) { const r2 = x * x + y * y + z * z; if (r2 === 0) continue; for (let i = rs.length - 1; i >= 0 && r2 <= rs[i] * rs[i]; i--) out[i] += 2; } return out; };
  const draw = () => {
    const L = +$("L").value, R = +$("R").value; $("Lv").textContent = fmt(L, 1); $("Rv").textContent = fmt(R, 1);
    const cx = 170, cy = 175, sc = 18 * 1, step = sc / L * 1.0, Rk = R * sc;
    let s = ci(cx, cy, Rk, "none", C.coral, 'stroke-width="10" stroke-opacity="0.2"');
    const M = Math.ceil(150 / step);
    for (let i = -M; i <= M; i++) for (let j = -M; j <= M; j++) { const x = cx + i * step, y = cy - j * step; if (Math.abs(x - cx) > 150 || Math.abs(y - cy) > 150) continue; const r = Math.hypot(x - cx, y - cy), inShell = Math.abs(r - Rk) < 5; s += ci(x, y, inShell ? 3 : 1.8, inShell ? C.coral : "var(--p)"); }
    s += ln(cx - 155, cy, cx + 155, cy, "var(--b)") + ln(cx, cy - 155, cx, cy + 155, "var(--b)") + tx(cx + 155, cy - 6, "kₓ", "end", "th") + tx(cx + 6, cy - 145, "k_y", "start", "th") + tx(cx, cy + 172, "slice of the k-space grid, spacing 2π/L", "middle", "ts");
    // count curve: in grid units m, radius Rm = R*L (shell radius fixed in k, grid finer with L)
    const Rm = R * L, Fr = QM.frame(380, 30, 240, 260, { xmin: 0, xmax: Rm * 1.05, ymin: 0, ymax: 2 * 4 / 3 * Math.PI * Math.pow(Rm * 1.05, 3), xt: [0, +(Rm / 2).toFixed(1), +Rm.toFixed(1)], yt: [], xl: "radius in grid units  (k L / 2π)", yl: "modes inside" });
    const rs = Array.from({ length: 60 }, (_, i) => Rm * 1.05 * (i + 1) / 60), cnt = counts(rs), smooth = rs.map(r => 2 * 4 / 3 * Math.PI * r * r * r);
    s += Fr.s + QM.path(Fr, rs, smooth, C.purple, 2, "5 4") + QM.path(Fr, rs, cnt, C.coral, 2.5) + tx(Fr.x0 + 6, Fr.y0 + 14, "exact count (coral)", "start", "ts", `fill="${C.coral}"`) + tx(Fr.x0 + 6, Fr.y0 + 28, "formula 2·(4/3)πR³ (purple)", "start", "ts", `fill="${C.purple}"`);
    fig.innerHTML = svg(360, s);
    const c = counts([Rm])[0], f = 2 * 4 / 3 * Math.PI * Rm ** 3;
    $("ro").innerHTML = ro([["modes inside the sphere (exact)", c], ["formula", fmt(f, 0)], ["agreement", fmt(c / f * 100, 1) + " %"], ["modes per shell grow as", "k² (so ω²)"]]);
  };
  $("L").oninput = draw; $("R").oninput = draw; draw();
}},

/* ---------------- 2.5 thermal ---------------- */
{ s: "6. Thermal light", t: "2.5 Thermal fields: how many photons does a warm mode hold?",
intu: P(String.raw`Put a single mode in contact with surroundings at temperature \(T\). Each rung \(|n\rangle\) is occupied with the Boltzmann weight \(e^{-n\hbar\omega/k_BT}\). Adding up gives the famous <b>Planck</b> mean photon number \(\bar n = 1/(e^{\hbar\omega/k_BT} - 1)\). The distribution \(P_n\) always falls with \(n\): the most likely photon number of thermal light is <b>zero</b>, and the fluctuations are huge, \(\Delta n^2 = \bar n + \bar n^2\).`,
String.raw`A staircase where every step up is a little harder to reach, each one less likely by the same factor. If the steps are tall compared with \(k_BT\) (optical photons at room temperature), almost nobody gets off the floor. If the steps are tiny (microwave photons), many steps are filled.`,
String.raw`Pick <b>795 nm at 300 K</b>: \(\bar n \approx 10^{-27}\), the optical mode is essentially in the vacuum. That is why optical quantum experiments work at room temperature. Now pick <b>5 GHz at 300 K</b>: over a thousand thermal photons per mode, which is why microwave quantum devices need dilution refrigerators. Compare the thermal \(P_n\) (bars) with a Poisson distribution of the same mean (dashed), which is what a laser gives (Chapter 3).`),
eq: String.raw`\[ P_n = \frac{e^{-E_n/k_BT}}{Z}, \qquad \bar n = \frac{1}{e^{\hbar\omega/k_BT} - 1} \]<div class="eqref">Gerry and Knight Eqs. (2.137) and (2.141)</div>\[ P_n = \frac{\bar n^n}{(1 + \bar n)^{n+1}}, \qquad \langle(\Delta n)^2\rangle = \bar n + \bar n^2 \]<div class="eqref">Gerry and Knight Eqs. (2.145) and (2.148)</div>\[ \bar U(\omega) = \hbar\omega\,\bar n\,\rho(\omega) = \frac{\hbar\omega^3}{\pi^2c^3}\,\frac{1}{e^{\hbar\omega/k_BT} - 1} \]<div class="eqref">Gerry and Knight Eq. (2.151), Planck's law</div>`,
sym: [[String.raw`\(k_B\)`, "Boltzmann constant, kT = 25.9 meV at 300 K"], [String.raw`\(\bar n\)`, "mean thermal photon number of the mode"], [String.raw`\(P_n\)`, "probability of finding n photons"], [String.raw`\(Z\)`, "partition function, the normalization"], [String.raw`\(\bar U(\omega)\)`, "energy density per unit ω, the blackbody spectrum"]],
how: [String.raw`<b>Boltzmann weights.</b> In equilibrium, a state of energy \(E_n\) has probability \(\propto e^{-E_n/k_BT}\).`, String.raw`<b>Geometric series.</b> With \(E_n = \hbar\omega(n + \tfrac12)\), \(Z = \sum_n e^{-E_n/k_BT}\) is a geometric series. Summing it gives the closed forms above.`, String.raw`<b>Mean photon number.</b> \(\bar n = \sum nP_n = 1/(e^{\hbar\omega/k_BT} - 1)\). For \(k_BT \gg \hbar\omega\) it is \(\approx k_BT/\hbar\omega\), for \(k_BT \ll \hbar\omega\) it is \(\approx e^{-\hbar\omega/k_BT}\).`, String.raw`<b>Planck's law.</b> Energy density = energy per photon × photons per mode × modes per volume per ω (card 5).`, String.raw`<b>Big fluctuations.</b> \(\Delta n^2 = \bar n + \bar n^2\) is larger than for any laser (\(\bar n\)). This excess noise is the "bunching" of thermal light (Chapter 5).`],
say: String.raw`A field mode in thermal equilibrium has a Bose-Einstein photon number distribution Pₙ = n̄ⁿ/(1 + n̄)ⁿ⁺¹ with mean n̄ = 1/(exp(ħω/kT) − 1) and variance n̄ + n̄², so its most likely photon number is zero and its fluctuations exceed those of a coherent state.`,
note: String.raw`Choi's group lists a room-temperature diamond maser project. At microwave frequencies a room-temperature mode holds over a thousand thermal photons, so thermal noise is a central problem there, while at your 795 nm it is utterly negligible. Same formula, opposite regimes.`,
num: String.raw`\(k_BT = 25.85\) meV at 300 K. 795 nm (1.56 eV) at 300 K: \(\bar n = 6\times10^{-27}\). 500 nm at the Sun's 6000 K: \(\bar n \approx 0.008\). 5 GHz (20.7 μeV) at 300 K: \(\bar n \approx 1250\). 5 GHz at 20 mK: \(\bar n \approx 6\times10^{-6}\).`,
r(fig, ctl) {
  const PRE = { opt: [795e-9, 300], sun: [500e-9, 6000], mw: [0.05996, 300], cold: [0.05996, 0.02] };
  let pre = "mw";
  ctl.innerHTML = btns([["opt", "795 nm at 300 K"], ["sun", "500 nm, Sun 6000 K"], ["mw", "5 GHz at 300 K"], ["cold", "5 GHz at 20 mK"]], "pr") + sl("lg", "Frequency (log, Hz)", 9, 15.5, 0.01, Math.log10(5e9)) + sl("T", "Temperature (log, K)", -2, 4, 0.01, Math.log10(300)) + `<div class="readout" id="ro"></div>`;
  const setP = k => { pre = k; $("lg").value = Math.log10(CL / PRE[k][0]); $("T").value = Math.log10(PRE[k][1]); };
  const draw = () => {
    pick(ctl, "pr", pre);
    const nu = Math.pow(10, +$("lg").value), T = Math.pow(10, +$("T").value), x = HB * 2 * Math.PI * nu / (KB * T), nb = 1 / Math.expm1(x);
    $("lgv").textContent = nu >= 1e12 ? fmt(nu / 1e12, 1) + " THz" : fmt(nu / 1e9, 2) + " GHz"; $("Tv").textContent = T < 1 ? fmt(T * 1000, 1) + " mK" : fmt(T, 0) + " K";
    const NB = 21, show = Math.max(nb, 1e-12), Pn = Array.from({ length: NB }, (_, n) => n * Math.log(show) - (n + 1) * Math.log1p(show)).map(Math.exp);
    const mean = Math.min(nb, 15), Po = Array.from({ length: NB }, (_, n) => { let lp = -mean + n * Math.log(Math.max(mean, 1e-300)); for (let k = 2; k <= n; k++) lp -= Math.log(k); return Math.exp(lp); });
    const F = QM.frame(60, 30, 560, 220, { xmin: -0.5, xmax: NB - 0.5, ymin: 0, ymax: 1.05, xt: [0, 5, 10, 15, 20], yt: [0, 0.5, 1], xl: "photon number n", yl: "Pₙ" });
    let s = F.s;
    Pn.forEach((p, n) => s += rc(F.X(n - 0.35), F.Y(p), F.X(0.7) - F.X(0), F.Y(0) - F.Y(p), C.coral, "none", 'fill-opacity="0.75"'));
    if (nb > 0.05 && nb < 15) s += QM.path(F, Po.map((_, n) => n), Po, C.purple, 2, "5 4") + tx(F.x0 + F.w - 6, F.y0 + 30, "dashed: Poisson (laser) with the same mean", "end", "ts", `fill="${C.purple}"`);
    s += tx(F.x0 + F.w - 6, F.y0 + 14, "bars: thermal Pₙ (only the first 21 shown)", "end", "ts", `fill="${C.coral}"`);
    fig.innerHTML = svg(290, s);
    $("ro").innerHTML = ro([["ħω / k_BT", fmt(x, 3)], ["mean photon number n̄", nb > 1e-3 && nb < 1e6 ? fmt(nb, 4) : nb.toExponential(2)], ["P₀ (empty mode)", fmt(1 / (1 + nb), 6)], ["Δn = √(n̄ + n̄²)", nb > 1e-3 ? fmt(Math.sqrt(nb + nb * nb), 3) : nb.toExponential(1) + " (≈ √n̄ " + Math.sqrt(nb).toExponential(1) + ")"]]);
  };
  ctl.querySelectorAll("button[data-pr]").forEach(b => b.onclick = () => { setP(b.dataset.pr); draw(); });
  $("lg").oninput = () => { pre = ""; draw(); }; $("T").oninput = () => { pre = ""; draw(); };
  setP("mw"); draw();
}},

/* ---------------- 2.6 vacuum ---------------- */
{ s: "7. The vacuum is not empty", t: "2.6 Vacuum fluctuations and the zero-point energy",
intu: P(String.raw`With zero photons every mode still has energy \(\tfrac12\hbar\omega\) and a fluctuating field of size \(\Delta E = \mathcal E_0\). This is not a mathematical leftover, it has measurable effects. It triggers <b>spontaneous emission</b> (an excited atom is "tickled" by the vacuum field, Chapter 4), it shifts atomic levels (the <b>Lamb shift</b>), and it pushes two mirrors together (the <b>Casimir force</b>). The size of the vacuum field depends on the mode volume: \(\mathcal E_0 = \sqrt{\hbar\omega/\varepsilon_0V}\). Squeeze the mode into a smaller volume and the vacuum field gets stronger.`,
String.raw`A pond that is never perfectly still. Even with no boat on it there are always small ripples. A tiny cork (an atom) feels them. In a small enclosed pond (a small cavity) the same ripples are concentrated, so the cork is shaken harder. That is the whole idea of cavity quantum electrodynamics.`,
String.raw`<b>Vacuum field</b> mode: slide the mode volume from a big room down to a nanophotonic cavity of about one cubic wavelength. Watch the vacuum field grow from millivolts per metre to hundreds of kilovolts per metre, and the coupling \(g\) to a dipole grow with it. Switch to <b>Casimir plates</b>: fewer vacuum modes fit between two close mirrors than outside, so the outside pushes them together with a force that grows as \(1/d^4\).`),
eq: String.raw`\[ \Delta E_x\big|_{|0\rangle} = \mathcal E_0\sin(kz), \qquad \mathcal E_0 = \sqrt{\frac{\hbar\omega}{\varepsilon_0V}} \]<div class="eqref">Gerry and Knight Eqs. (2.156) and (2.15)</div>\[ E_{\text{vac}}^{\max} = \sqrt{\frac{\hbar\omega}{2\varepsilon_0n^2V_{\text{eff}}}}, \qquad \hbar g = d\,E_{\text{vac}}^{\max} \quad \text{(nanophotonics convention)} \]\[ \frac{F}{A} = -\frac{\pi^2\hbar c}{240\,d^4} \quad \text{(Casimir)} \]<div class="eqref">Gerry and Knight Eq. (2.182)</div>`,
sym: [[String.raw`\(\mathcal E_0\)`, "Gerry and Knight's vacuum field scale, with V the cavity volume and sin(kz) mode shape"], [String.raw`\(V_{\text{eff}}\)`, "effective mode volume: ∫ε|E|² divided by the maximum of ε|E|², the convention in nanophotonics papers"], [String.raw`\(n\)`, "refractive index where the field peaks"], [String.raw`\(d\)`, "transition dipole moment of the emitter (in the Casimir formula, d is the plate gap)"], [String.raw`\(g\)`, "emitter-photon coupling rate, the speed at which they swap energy"]],
how: [String.raw`<b>Vacuum fluctuation.</b> Put \(n = 0\) in card 3's result: \(\Delta E = \sqrt2\,\mathcal E_0\sqrt{1/2}\,\sin kz = \mathcal E_0\sin kz\).`, String.raw`<b>Where \(\mathcal E_0\) comes from.</b> The vacuum energy \(\tfrac12\hbar\omega\) is spread over the mode volume. Setting \(\int\varepsilon_0\langle E^2\rangle dV\) equal to it fixes \(\langle E^2\rangle \propto \hbar\omega/\varepsilon_0V\). Smaller volume, bigger field.`, String.raw`<b>Two conventions.</b> Gerry and Knight normalize with the \(\sin(kz)\) shape over the cavity volume. Nanophotonics papers use the field maximum and \(V_{\text{eff}}\), which brings the factor 1/2 and \(n^2\) above. Same physics.`, String.raw`<b>Coupling.</b> A dipole \(d\) in this field has interaction energy \(dE\), so the emitter and the empty mode exchange energy at rate \(g = dE_{\text{vac}}/\hbar\).`, String.raw`<b>Casimir.</b> Sum \(\tfrac12\hbar\omega\) over the modes between plates minus the same in free space. Both are infinite, the difference is finite and gives Eq. 2.182.`],
say: String.raw`Even the vacuum state of a mode has a fluctuating field of rms size √(ħω/ε₀V), which grows as the mode volume shrinks, and these vacuum fluctuations cause spontaneous emission, the Lamb shift and the Casimir force.`,
note: String.raw`This card is the reason nanophotonic cavities and waveguides exist in quantum technology. Shrinking \(V_{\text{eff}}\) to about \((\lambda/n)^3\) boosts the vacuum field until \(g\) exceeds the losses: the <b>strong coupling</b> regime of cavity QED. Choi's thesis work on nanocavities for diamond color centers and your photonic crystal structures for quantum dots both aim at a large \(g\).`,
num: String.raw`At 795 nm in a 1 cm³ volume: \(\mathcal E_0 \approx 0.17\) V/m. In \(V_{\text{eff}} = (\lambda/n)^3\) in GaAs: \(E_{\text{vac}} \approx 3.2\times10^5\) V/m. A dipole of 25 Debye there gives \(g/2\pi \approx 40\) GHz (a rough upper estimate, an emitter off the field maximum couples less). Casimir pressure: 13 Pa at 100 nm, 1.3 mPa at 1 μm.`,
r(fig, ctl) {
  let mode = "vac";
  ctl.innerHTML = btns([["vac", "Vacuum field"], ["cas", "Casimir plates"]], "md") + `<div id="opts"></div><div class="readout" id="ro"></div>`;
  const build = () => {
    pick(ctl, "md", mode);
    $("opts").innerHTML = mode === "vac" ? sl("lv", "Mode volume, log₁₀ of V/(λ/n)³", -0.5, 14.5, 0.1, 0) + sl("n", "Refractive index n", 1, 3.7, 0.01, 3.68) + sl("dp", "Dipole moment (Debye)", 1, 50, 1, 25) : sl("d", "Plate gap d (nm)", 20, 2000, 5, 100);
    $("opts").querySelectorAll("input").forEach(i => i.oninput = draw);
    draw();
  };
  const draw = () => {
    let s = "";
    if (mode === "vac") {
      const lv = +$("lv").value, n = +$("n").value, dp = +$("dp").value; $("lvv").textContent = "10^" + fmt(lv, 1); $("nv").textContent = fmt(n, 2); $("dpv").textContent = dp + " D";
      const lam = 795e-9, w = 2 * Math.PI * CL / lam, Vu = Math.pow(lam / n, 3);
      const Ev = V => Math.sqrt(HB * w / (2 * EPS0 * n * n * V));
      const F = QM.frame(70, 30, 540, 230, { xmin: -0.5, xmax: 14.5, ymin: -3, ymax: 7, xt: [0, 3, 6, 9, 12], xf: v => "10^" + v, yt: [-2, 0, 2, 4, 6], yf: v => "10^" + v, xl: "mode volume in units of (λ/n)³", yl: "vacuum field (V/m)" });
      const xs = Array.from({ length: 200 }, (_, i) => -0.5 + 15 * i / 199), ys = xs.map(l => Math.log10(Ev(Vu * Math.pow(10, l))));
      s += F.s + QM.path(F, xs, ys, C.purple, 2.5) + ci(F.X(lv), F.Y(Math.log10(Ev(Vu * Math.pow(10, lv)))), 7, C.coral, "#fff");
      [[0.3, "nanocavity"], [3, "microcavities"], [13.8, "1 cm³"]].forEach(([x, l]) => s += tx(F.X(x), F.Y(-2.6), l, "middle", "ts"));
      fig.innerHTML = svg(300, s);
      const E = Ev(Vu * Math.pow(10, lv)), g = dp * DEB * E / HB;
      $("ro").innerHTML = ro([["mode volume", (Vu * Math.pow(10, lv) * 1e18).toExponential(2) + " μm³"], ["vacuum field at the maximum", E > 1e3 ? fmt(E / 1e3, 1) + " kV/m" : fmt(E, 3) + " V/m"], ["coupling g/2π", g / (2 * Math.PI) > 1e9 ? fmt(g / (2 * Math.PI) / 1e9, 2) + " GHz" : fmt(g / (2 * Math.PI) / 1e6, 3) + " MHz"], ["ħg", fmt(HB * g / EV * 1e6, 2) + " μeV"]]);
    } else {
      const d = +$("d").value * 1e-9; $("dv").textContent = $("d").value + " nm";
      const Pf = dd => Math.PI * Math.PI * HB * CL / (240 * Math.pow(dd, 4));
      const F = QM.frame(70, 30, 540, 230, { xmin: Math.log10(20), xmax: Math.log10(2000), ymin: -4, ymax: 5, xt: [Math.log10(20), 2, Math.log10(500), 3, Math.log10(2000)], xf: v => fmt(Math.pow(10, v), 0), yt: [-4, -2, 0, 2, 4], yf: v => "10^" + v, xl: "plate gap d (nm)", yl: "Casimir pressure (Pa)" });
      const xs = Array.from({ length: 200 }, (_, i) => Math.log10(20) + (Math.log10(2000) - Math.log10(20)) * i / 199);
      s += F.s + QM.path(F, xs, xs.map(l => Math.log10(Pf(Math.pow(10, l) * 1e-9))), C.purple, 2.5) + ci(F.X(Math.log10(d * 1e9)), F.Y(Math.log10(Pf(d))), 7, C.coral, "#fff");
      fig.innerHTML = svg(300, s);
      $("ro").innerHTML = ro([["pressure π²ħc/240d⁴", Pf(d) > 1 ? fmt(Pf(d), 2) + " Pa" : Pf(d).toExponential(2) + " Pa"], ["force on 1 μm²", (Pf(d) * 1e-12).toExponential(2) + " N"], ["scaling", "1/d⁴: half the gap, 16 times the force"]]);
    }
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; build(); });
  build();
}},

/* ---------------- 2.7 phase ---------------- */
{ s: "8. Number vs phase", t: "2.7 The quantum phase: you cannot know both how many and when",
intu: P(String.raw`A classical wave has an amplitude and a phase. You would like a quantum "phase operator" to go with the photon number, but it turns out to be surprisingly hard to define (Dirac's attempt fails, Gerry and Knight Section 2.7 explains why). The physics behind the trouble is simple: <b>photon number and phase are complementary</b>. A state with an exact number of photons has a completely uniform phase. To get a well-defined phase you must mix several photon numbers, and the more you mix, the sharper the phase.`,
String.raw`A chord against a single note. A single pure number state is like a single note with no beginning or end: there is nothing to mark "when" it peaks. Add notes (photon numbers) with the right relative phases and they reinforce at one moment and cancel at others, so a definite timing (phase) appears. More notes, sharper timing.`,
String.raw`Pick <b>Number state</b>: the photon number bars show one bar, the phase distribution (the circle on the right) is perfectly round, no preferred phase. Pick <b>Laser-like mixture</b> and raise the mean photon number: the number bars spread out and the phase distribution becomes a sharp spike. Pick <b>|0⟩ + |1⟩</b>: even mixing just two numbers already gives the phase a direction.`),
eq: String.raw`\[ \hat a \overset{?}{=} e^{i\hat\phi}\sqrt{\hat n}, \qquad [\hat n, \hat\phi] \overset{?}{=} i \quad\Rightarrow\quad \Delta n\,\Delta\phi \gtrsim 1 \]<div class="eqref">Gerry and Knight Eqs. (2.184) and (2.188), Dirac's attempt</div>\[ P(\phi) = \frac{1}{2\pi}\left|\sum_n c_n\,e^{-in\phi}\right|^2 \quad \text{for } |\psi\rangle = \sum_n c_n|n\rangle \]`,
sym: [[String.raw`\(\hat\phi\)`, "a would-be phase operator (it does not exist as a proper Hermitian operator)"], [String.raw`\(c_n\)`, "amplitude of n photons in the state"], [String.raw`\(P(\phi)\)`, "phase probability distribution (Pegg-Barnett / Susskind-Glogower style)"], [String.raw`\(\Delta n, \Delta\phi\)`, "spreads of number and phase"]],
how: [String.raw`<b>Classical guess.</b> A wave is \(\alpha = |\alpha|e^{i\phi}\). Dirac tried the same split for \(\hat a\): \(\hat a = e^{i\hat\phi}\sqrt{\hat n}\).`, String.raw`<b>It fails.</b> The split would require \([\hat n, \hat\phi] = i\), which leads to contradictions such as \((n' - n)\langle n'|\hat\phi|n\rangle = i\delta_{nn'}\) (Eq. 2.190), and \(e^{i\hat\phi}\) would not be unitary because the ladder has a bottom.`, String.raw`<b>The working idea.</b> Phase information lives in the <b>relative phases</b> between different \(|n\rangle\) components. A single \(|n\rangle\) has none, so its phase is uniform.`, String.raw`<b>Trade-off.</b> Spreading the state over many \(n\) with aligned phases sharpens \(P(\phi)\). Roughly \(\Delta n\,\Delta\phi \sim 1\), like the time-energy relation of Griffiths 3.4.3.`],
say: String.raw`Photon number and phase are complementary: a number state has a uniformly distributed phase, a well-defined phase requires a superposition of many photon numbers, and a proper Hermitian phase operator cannot be defined in the usual way because the number spectrum is bounded below.`,
note: String.raw`This trade-off is the bridge to the next chapter. The laser-like mixture in this card is a <b>coherent state</b>, the quantum state closest to a classical wave, with Poisson number statistics. Phase-sensitive measurements (interferometry, homodyne detection) use it, while photon counting experiments favour number states.`,
num: String.raw`Number state: phase spread \(\pi/\sqrt3 = 1.81\) rad (uniform). Laser-like mixture with \(\bar n = 4\): \(\Delta n = 2\), phase spread about 0.29 rad. With \(\bar n = 25\): \(\Delta n = 5\), about 0.10 rad. The product \(\Delta n\,\Delta\phi\) stays near 0.5.`,
r(fig, ctl) {
  let st = "coh";
  ctl.innerHTML = btns([["num", "Number state"], ["coh", "Laser-like mixture"], ["sup", "|0⟩ + |1⟩"]], "st") + sl("nb", "n (number state) or mean n̄", 0, 25, 1, 4) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "st", st); const nb = +$("nb").value; $("nbv").textContent = nb;
    const NM = 60, c = new Float64Array(NM);
    if (st === "num") c[Math.min(nb, NM - 1)] = 1;
    else if (st === "sup") { c[0] = Math.SQRT1_2; c[1] = Math.SQRT1_2; }
    else { for (let n = 0; n < NM; n++) { let lp = -nb / 2 + (n ? n / 2 * Math.log(Math.max(nb, 1e-300)) : 0); for (let k = 2; k <= n; k++) lp -= 0.5 * Math.log(k); c[n] = nb === 0 ? (n === 0 ? 1 : 0) : Math.exp(lp); } }
    // number bars
    const F = QM.frame(60, 30, 300, 230, { xmin: -0.5, xmax: 40.5, ymin: 0, ymax: 1.05, xt: [0, 10, 20, 30, 40], yt: [0, 0.5, 1], xl: "photon number n", yl: "|cₙ|²" });
    let s = F.s; const pm = Math.max(...Array.from(c).map(v => v * v));
    for (let n = 0; n <= 40; n++) { const p = c[n] * c[n]; if (p > 1e-5) s += rc(F.X(n - 0.4), F.Y(p / pm), F.X(0.8) - F.X(0), F.Y(0) - F.Y(p / pm), C.teal); }
    s += tx(F.x0 + F.w - 4, F.y0 + 14, "scaled to the largest bar", "end", "ts");
    // phase distribution polar
    const phs = Array.from({ length: 361 }, (_, i) => -Math.PI + 2 * Math.PI * i / 360);
    const Pp = phs.map(ph => { let a = 0, b = 0; for (let n = 0; n < NM; n++) { a += c[n] * Math.cos(n * ph); b -= c[n] * Math.sin(n * ph); } return (a * a + b * b) / (2 * Math.PI); });
    const pmax = Math.max(...Pp), cx = 520, cy = 145, R0 = 30, Rs = 85;
    let d = ""; phs.forEach((ph, i) => { const r = R0 + Rs * Pp[i] / pmax; d += (i ? "L" : "M") + (cx + r * Math.cos(ph)).toFixed(1) + " " + (cy - r * Math.sin(ph)).toFixed(1); });
    s += ci(cx, cy, R0, "none", "var(--b)") + `<path d="${d}Z" fill="${C.purple}" fill-opacity="0.25" stroke="${C.purple}" stroke-width="2"/>` + tx(cx, cy + R0 + Rs + 26, "phase distribution P(φ)", "middle", "ts") + tx(cx + R0 + Rs + 6, cy + 4, "φ = 0", "start", "ts");
    fig.innerHTML = svg(300, s);
    let sn = 0, sn2 = 0, nn = 0; for (let n = 0; n < NM; n++) { const p = c[n] * c[n]; nn += p; sn += n * p; sn2 += n * n * p; }
    const dn = Math.sqrt(Math.max(0, sn2 / nn - (sn / nn) ** 2));
    let m2 = 0, z = 0; phs.forEach((ph, i) => { m2 += ph * ph * Pp[i]; z += Pp[i]; }); const dph = Math.sqrt(m2 / z);
    $("ro").innerHTML = ro([["Δn", fmt(dn, 3)], ["phase spread Δφ", fmt(dph, 3) + " rad"], ["Δn Δφ", fmt(dn * dph, 3)]]);
  };
  ctl.querySelectorAll("button[data-st]").forEach(b => b.onclick = () => { st = b.dataset.st; draw(); });
  $("nb").oninput = draw; draw();
}}
],
summary: String.raw`Light in a cavity is a set of modes, and each mode's energy ½(p² + ω²q²) is that of a harmonic oscillator, with the electric field as position and the magnetic field as momentum. Quantizing it gives H = ħω(a†a + ½): the number states |n⟩ hold exactly n photons, a† creates one, a destroys one, and the vacuum keeps ½ħω. A number state has zero mean field and random phase, and its field fluctuates by √2E₀√(n + ½). The quadratures X₁ and X₂ are light's position and momentum, [X₁, X₂] = i/2, so states live in a phase space where number states are rings with negative Wigner regions and the vacuum is a minimal disk. Free space has ρ(ω) = ω²/π²c³ modes per volume per ω, thermal light has Pₙ = n̄ⁿ/(1 + n̄)ⁿ⁺¹ with n̄ from Planck, the vacuum field √(ħω/ε₀V) grows as the mode shrinks and causes spontaneous emission, the Lamb shift and the Casimir force, and photon number and phase are complementary.`,
sheet: [
[String.raw`\[ H = \tfrac12(p^2 + \omega^2q^2) \]`, "A field mode is an oscillator (2.8)"],
[String.raw`\[ \hat a = (2\hbar\omega)^{-1/2}(\omega\hat q + i\hat p), \quad [\hat a, \hat a^\dagger] = 1 \]`, "Ladder operators (2.13), (2.17)"],
[String.raw`\[ \hat H = \hbar\omega(\hat a^\dagger\hat a + \tfrac12), \quad \hat E_x = \mathcal E_0(\hat a + \hat a^\dagger)\sin kz, \quad \mathcal E_0 = \sqrt{\hbar\omega/\varepsilon_0V} \]`, "Hamiltonian and field operator (2.18), (2.15)"],
[String.raw`\[ \hat a|n\rangle = \sqrt n|n-1\rangle, \quad \hat a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle, \quad |n\rangle = \tfrac{(\hat a^\dagger)^n}{\sqrt{n!}}|0\rangle \]`, "Number states (2.38) to (2.40)"],
[String.raw`\[ \langle\hat E_x\rangle_n = 0, \quad \Delta E_x = \sqrt2\,\mathcal E_0|\sin kz|(n + \tfrac12)^{1/2} \]`, "Field fluctuations of a number state (2.44), (2.47)"],
[String.raw`\[ \hat X_1 = \tfrac12(\hat a + \hat a^\dagger), \quad \hat X_2 = \tfrac{1}{2i}(\hat a - \hat a^\dagger), \quad [\hat X_1, \hat X_2] = \tfrac i2 \]`, "Quadratures (2.52) to (2.55)"],
[String.raw`\[ \rho(\omega) = \omega^2/\pi^2c^3 \]`, "Mode density, both polarizations (2.75)"],
[String.raw`\[ \bar n = \frac{1}{e^{\hbar\omega/k_BT} - 1}, \quad P_n = \frac{\bar n^n}{(1+\bar n)^{n+1}}, \quad \Delta n^2 = \bar n + \bar n^2 \]`, "Thermal light (2.141), (2.145), (2.148)"],
[String.raw`\[ F/A = -\pi^2\hbar c/240d^4 \]`, "Casimir pressure (2.182)"],
[String.raw`\[ \Delta n\,\Delta\phi \gtrsim 1 \]`, "Number-phase complementarity (2.50)"]],
consts: String.raw`\(\hbar = 1.0546\times10^{-34}\) J s, \(\varepsilon_0 = 8.854\times10^{-12}\) F/m, \(k_B = 1.381\times10^{-23}\) J/K (\(k_BT = 25.85\) meV at 300 K), 1 Debye \(= 3.336\times10^{-30}\) C m, 795 nm photon: 1.560 eV`,
sources: ["C. C. Gerry and P. L. Knight, Introductory Quantum Optics (Cambridge University Press, 2005), Chapter 2, Sections 2.1 to 2.7, Eqs. (2.1) to (2.194), Figs. 2.1 to 2.3", "D. J. Griffiths, Introduction to Quantum Mechanics (Prentice Hall, 1995), Section 2.3, the harmonic oscillator used throughout", "M. Planck, Ann. Phys. 4, 553 (1901), the blackbody law", "W. E. Lamb and R. C. Retherford, Phys. Rev. 72, 241 (1947), the Lamb shift", "H. B. G. Casimir, Proc. K. Ned. Akad. Wet. 51, 793 (1948), the Casimir force", "E. M. Purcell, Phys. Rev. 69, 681 (1946), emission rates depend on the mode density"]
});
})();
