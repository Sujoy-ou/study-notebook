addLesson("thesis", "ch1", {
level: "Intermediate",
id: "thesis-ch1-l4", title: "How a dot emits light", short: "4. How a dot emits light",
big: "When the electron falls into the hole, the charge in the dot oscillates like a tiny antenna, a transition dipole. Its direction is set by the hole orbital from Lesson 2, its emission rate by Fermi's golden rule, and its polarization by the direction it oscillates in. A dipole never radiates along its own axis, which decides what a top-view experiment and a waveguide can each collect.",
bridge: "Lessons 1 to 3 built the states. This lesson is about the jump between two states and the photon it produces.",
cards: [
{s: "1. Antenna", t: "The dot is a tiny antenna: dipole radiation",
intu: "Picture a charge sliding back and forth along a line. That oscillating dipole sends out light, but not equally in all directions. It radiates most strongly perpendicular to its axis and not at all along its axis, because a charge moving straight at you produces no sideways oscillation for you to see. The radiation pattern is a doughnut around the dipole. Rotate the dipole with the slider. The camera at the top collects only what goes up. When the dipole points straight up (along z), the top sees almost nothing. Keep this in mind for card 6 and Lesson 6.",
eq: String.raw`\[ \frac{dP}{d\Omega} \propto \lvert \mathbf{d} \rvert^2 \sin^2\theta \qquad P = \frac{\lvert \mathbf{d} \rvert^2 \omega^4}{12\pi\varepsilon_0 c^3} \]<div class="eqref">vacuum, \(\mathbf{d}(t) = \mathbf{d}\cos\omega t\)</div>`,
sym: [[String.raw`\(\mathbf{d}\)`, "dipole moment amplitude, charge × displacement (C·m)"], [String.raw`\(\theta\)`, "angle between the dipole axis and the viewing direction"], [String.raw`\(dP/d\Omega\)`, "power radiated per unit solid angle"], [String.raw`\(\omega\)`, "angular frequency of the oscillation, 2πc/λ"], [String.raw`\(P\)`, "total radiated power"]],
how: ["An accelerating charge radiates. The radiated field is proportional to the acceleration component perpendicular to the viewing direction.", "For viewing angle θ from the dipole axis, that perpendicular part is ∝ sin θ.", "Intensity is the square of the field, so dP/dΩ ∝ sin²θ.", "Integrating over all directions gives the Larmor result for P."],
say: "A transition dipole radiates in a sin²θ pattern, with no emission along its own axis. So a dipole along the growth axis z sends essentially nothing straight up.",
num: "sin²θ at θ = 90°: <b>1</b> (maximum, perpendicular)<br>at θ = 45°: <b>0.5</b><br>at θ = 0°: <b>0</b> (along the axis)<br>ω at 795 nm: 2πc/λ = <b>2.37 × 10¹⁵ rad/s</b>",
r(fig, ctl) {
  ctl.innerHTML = sl("ph", "Dipole angle from z", 0, 90, 1, 90) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const ph = +$("ph").value; $("phv").textContent = ph + "°";
    const cx = 340, cy = 160, R = 110, a = ph * Math.PI / 180;
    let d = ""; for (let i = 0; i <= 360; i++) { const t = i * Math.PI / 180; const rel = t - a; const r = R * Math.pow(Math.sin(rel), 2); const x = cx + r * Math.sin(t), y = cy - r * Math.cos(t); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
    const dx = Math.sin(a) * 40, dy = Math.cos(a) * 40, up = Math.pow(Math.cos(a), 2);
    fig.innerHTML = svg(300, `<path d="${d}Z" fill="#EF9F27" fill-opacity="0.25" stroke="#BA7517" stroke-width="1.5"/><line x1="${cx-dx}" y1="${cy+dy}" x2="${cx+dx}" y2="${cy-dy}" stroke="#854F0B" stroke-width="4" marker-start="url(#ar)" marker-end="url(#ar)"/><circle cx="${cx}" cy="${cy}" r="5" fill="#854F0B"/><g class="c-gray"><rect x="${cx-40}" y="10" width="80" height="22" rx="4" stroke-width="0.5"/></g><text class="ts" x="${cx}" y="25" text-anchor="middle">camera (top)</text><line x1="${cx}" y1="34" x2="${cx}" y2="${cy-8}" stroke="var(--p)" stroke-dasharray="3 3"/>${axes(60, 280)}<text class="ts" x="${cx}" y="292" text-anchor="middle">orange: radiation pattern, sin²θ</text>`);
    $("ro").innerHTML = `<div><span>relative intensity straight up</span><b>${up.toFixed(2)}</b></div><div><span>dipole is</span><b>${ph === 0 ? "along z" : ph === 90 ? "in-plane" : "tilted"}</b></div>`;
  };
  $("ph").oninput = u; u();
}},

{s: "2. Transition dipole", t: "Which way the antenna points: the transition dipole",
intu: "In a transition, the electron's wavefunction changes from the hole's p-like shape to the conduction band's s-like shape. While it is in between, its charge sloshes back and forth, and the direction of that sloshing is the transition dipole. Because the conduction band is round (s), the direction comes entirely from the hole orbital. A heavy hole is built from X and Y, so its dipole rotates in the plane: circular, in-plane. A light hole contains Z, so it can give a dipole along z. Pick a transition and see the dipole components.",
eq: String.raw`\[ \mathbf{d} = e\, \langle \psi_c \vert \mathbf{r} \vert \psi_v \rangle \]\[ \langle S \vert x \vert X \rangle = \langle S \vert y \vert Y \rangle = \langle S \vert z \vert Z \rangle \equiv P_{\mathrm{cv}}, \quad \text{all other combinations } 0 \]\[ \text{HH: } \mathbf{d} \propto P_{\mathrm{cv}}\,\frac{\hat{\mathbf{x}} \pm i\hat{\mathbf{y}}}{\sqrt{2}} \qquad \text{LH: } \lvert d_z \rvert^2 = \tfrac{2}{3} P_{\mathrm{cv}}^2, \quad \lvert d_\pm \rvert^2 = \tfrac{1}{3} P_{\mathrm{cv}}^2 \]`,
sym: [[String.raw`\(\mathbf{d}\)`, "transition dipole moment"], [String.raw`\(\psi_c, \psi_v\)`, "conduction (s-like) and valence (p-like) states"], [String.raw`\(\mathbf{r}\)`, "position operator, components x, y, z"], [String.raw`\(P_{\mathrm{cv}}\)`, "the one nonzero overlap, the same for x, y and z by cubic symmetry"], [String.raw`\(\hat{\mathbf{x}} \pm i\hat{\mathbf{y}}\)`, "circular in-plane dipole (rotating)"]],
how: ["The dipole is the charge times the 'average displacement' between the two states, ⟨ψ_c|r|ψ_v⟩.", "S is symmetric under every mirror, X is odd in x only. So ⟨S|x|X⟩ survives, but ⟨S|x|Y⟩ and ⟨S|x|Z⟩ vanish by symmetry.", "Insert the HH state (X ± iY)/√2: only x and y components survive, a circular in-plane dipole.", "Insert the LH state with weights 1/3 (ring) and 2/3 (Z): a z component of squared strength 2/3 and an in-plane part of 1/3."],
say: "The dipole direction of a quantum dot transition is set by the hole orbital. Heavy-hole transitions have in-plane circular dipoles, light-hole transitions have a component along the growth axis.",
num: "Relative strengths |d|² in units of P<sub>cv</sub>²:<br>HH → electron: <b>1</b>, in-plane, circular<br>LH (Z part) → electron of the same spin: <b>2/3</b>, along z<br>LH (ring part) → electron of the other spin: <b>1/3</b>, in-plane, circular<br>So HH in-plane is 3 times stronger than LH in-plane (Lesson 2, card 3).",
r(fig, ctl) {
  let s = "hh";
  ctl.innerHTML = btns([["hh", "heavy hole"], ["lz", "light hole, Z part"], ["lr", "light hole, ring part"]], "s") + '<div class="readout" id="ro"></div>';
  const D = { hh: [0.5, 0.5, 0, 1, "circular in-plane"], lz: [0, 0, 1, 2/3, "linear along z"], lr: [0.5, 0.5, 0, 1/3, "circular in-plane"] };
  const u = () => {
    pick(ctl, "s", s);
    const [fx, fy, fz, S, kind] = D[s], cx = 220, cy = 150;
    const shape = fz ? `<line x1="${cx}" y1="${cy+60*Math.sqrt(S)}" x2="${cx}" y2="${cy-60*Math.sqrt(S)}" stroke="#1D9E75" stroke-width="5" marker-start="url(#ar)" marker-end="url(#ar)"/>` : ring(cx, cy, 120 * Math.sqrt(S), 34 * Math.sqrt(S), 1, "#D85A30");
    const bar = (y, lab, f, col) => `<text class="ts" x="430" y="${y}">${lab}</text><rect x="470" y="${y-12}" width="160" height="14" rx="3" fill="var(--b)"/><rect x="470" y="${y-12}" width="${160*f*S}" height="14" rx="3" fill="${col}"/><text class="ts" x="636" y="${y}">${(f*S).toFixed(2)}</text>`;
    fig.innerHTML = svg(280, `${shape}<circle cx="${cx}" cy="${cy}" r="4" fill="var(--t)"/>${axes(50, 260)}<text class="th" x="530" y="60" text-anchor="middle">|d|² by direction</text>${bar(100, "x", fx, "#D85A30")}${bar(140, "y", fy, "#D85A30")}${bar(180, "z", fz, "#1D9E75")}<text class="ts" x="530" y="220" text-anchor="middle">units of P_cv²</text>`);
    $("ro").innerHTML = `<div><span>total |d|²</span><b>${S.toFixed(2)} P_cv²</b></div><div><span>dipole is</span><b>${kind}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { s = b.dataset.s; u(); }); u();
}},

{s: "3. Golden rule", t: "How fast it emits: Fermi's golden rule",
intu: "How often does the excited dot emit? Fermi's golden rule says: the rate equals the coupling squared times the number of photon states available at that energy. The coupling is how well the dipole lines up with the light field at the dot, |d·E|². The number of photon states, the local density of optical states ρ, depends on the surroundings. In bulk material it is fixed. A cavity or a waveguide can raise or lower it, which speeds up or slows down emission. This is the Purcell effect. Each vertical line in the picture is one photon mode near the emission energy. Drag both sliders and watch the rate.",
eq: String.raw`\[ \Gamma = \frac{2\pi}{\hbar} \left\lvert \langle f \vert -\mathbf{d}\cdot\mathbf{E} \vert i \rangle \right\rvert^2 \rho(\hbar\omega) \]\[ \Gamma \propto \lvert \mathbf{d}\cdot\mathbf{E}(\mathbf{r}_0) \rvert^2 \times \rho(\omega, \mathbf{r}_0) \qquad F_{\mathrm{P}} = \frac{\Gamma}{\Gamma_{\mathrm{bulk}}} \]`,
sym: [[String.raw`\(\Gamma\)`, "spontaneous emission rate (1/s). Lifetime τ = 1/Γ"], [String.raw`\(\mathbf{d}\cdot\mathbf{E}\)`, "coupling of the dipole to the light field at the dot's position r₀"], [String.raw`\(\rho\)`, "local density of optical states: photon modes available per unit energy at r₀"], [String.raw`\(\lvert i \rangle, \lvert f \rangle\)`, "initial state (excited dot, no photon) and final state (ground state plus one photon)"], [String.raw`\(F_{\mathrm{P}}\)`, "Purcell factor, emission rate relative to the bulk"]],
how: ["Treat the light–matter interaction H′ = −d·E as a small perturbation.", "First-order time-dependent perturbation theory gives a constant transition rate into a continuum of final states.", "That rate is (2π/ħ) × |matrix element|² × density of final states. This is Fermi's golden rule.", "For emission the final states are photon modes, so ρ is the optical density of states at the dot's position and frequency."],
say: "The emission rate is set by both the dipole and its photonic environment. A nanostructure changes the rate by changing the local density of optical states, not the dipole itself.",
num: "Quantum dot lifetimes are typically a few hundred ps up to about 1 ns.<br>τ = 1 ns ⟹ Γ = <b>1 × 10⁹ s⁻¹</b><br>Purcell factor in a good photonic crystal waveguide can reach a few to over 10. Your thesis does not compute Purcell factors.",
r(fig, ctl) {
  ctl.innerHTML = sl("g", "Coupling |d·E| (relative)", 0, 1.5, 0.01, 1) + sl("rho", "Density of states ρ (relative to bulk)", 0, 5, 0.05, 1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const g = +$("g").value, rho = +$("rho").value; $("gv").textContent = g.toFixed(2); $("rhov").textContent = rho.toFixed(2) + "×";
    const G = g * g * rho, n = Math.round(4 + rho * 10);
    let lines = ""; for (let i = 0; i < n; i++) { const x = 60 + (i + 0.5) * 300 / n; lines += `<line x1="${x}" x2="${x}" y1="70" y2="210" stroke="#378ADD" stroke-width="1.5" opacity="0.7"/>`; }
    const bh = Math.min(180, G * 60);
    fig.innerHTML = svg(270, `<text class="th" x="210" y="50" text-anchor="middle">photon modes near ħω</text>${lines}<line x1="60" x2="360" y1="210" y2="210" stroke="var(--p)"/><text class="ts" x="210" y="230" text-anchor="middle">${n} modes in the window (more = larger ρ)</text>
      <text class="th" x="540" y="50" text-anchor="middle">emission rate Γ</text><rect x="510" y="${230-bh}" width="60" height="${bh}" fill="#EF9F27" rx="3"/><line x1="490" x2="590" y1="${230-60}" y2="${230-60}" stroke="var(--p)" stroke-dasharray="4 3"/><text class="ts" x="596" y="${234-60}">bulk</text><line x1="490" x2="590" y1="230" y2="230" stroke="var(--p)"/>`);
    $("ro").innerHTML = `<div><span>Γ / Γ_bulk</span><b>${G.toFixed(2)}</b></div><div><span>lifetime if τ_bulk = 1 ns</span><b>${G > 0 ? (1 / G).toFixed(2) + " ns" : "∞"}</b></div>`;
  };
  $("g").oninput = u; $("rho").oninput = u; u();
}},

{s: "4. Polarization", t: "What σ⁺, σ⁻, x and y look like",
intu: "Polarization is the direction the electric field points as the light passes. Watch the arrow tip. For x or y it swings back and forth along a line: linear polarization. For σ⁺ it rotates in a circle one way, for σ⁻ the other way: circular polarization. A circular dipole (heavy hole) emits circular light along z. Now add σ⁺ and σ⁻ with equal weight: the two rotations cancel sideways and leave a line. So linear is a superposition of the two circulars, and circular is a superposition of two linears a quarter period apart. This is why the Voigt transitions (Lesson 5) are linear.",
eq: String.raw`\[ \hat{\mathbf{e}}_\pm = \frac{\hat{\mathbf{x}} \pm i\hat{\mathbf{y}}}{\sqrt{2}}\ (\sigma^{\pm}) \qquad \hat{\mathbf{e}}_\pi = \hat{\mathbf{z}} \]\[ \hat{\mathbf{x}} = \frac{\hat{\mathbf{e}}_+ + \hat{\mathbf{e}}_-}{\sqrt{2}}, \qquad \hat{\mathbf{y}} = \frac{\hat{\mathbf{e}}_+ - \hat{\mathbf{e}}_-}{i\sqrt{2}} \]\[ \mathbf{E}(t) = \mathrm{Re}\left[ E_0\, \hat{\mathbf{e}}\, e^{-i\omega t} \right] \]`,
sym: [[String.raw`\(\hat{\mathbf{e}}_\pm\)`, "unit vectors of circular polarization, rotating in the xy plane"], [String.raw`\(\hat{\mathbf{e}}_\pi\)`, "linear polarization along z (π)"], [String.raw`\(i\)`, "a quarter period delay between the x and y components"], [String.raw`\(\mathbf{E}(t)\)`, "real electric field at one point as time passes"]],
how: ["A complex polarization vector describes amplitude and relative phase of each component.", "Take the real part of ê e^(−iωt). For x̂ + iŷ you get (cos ωt, sin ωt): a circle.", "For x̂ alone you get (cos ωt, 0): a line.", "Add ê₊ and ê₋: the iŷ parts cancel and only x̂ is left."],
say: "σ⁺ and σ⁻ are circular polarizations with angular momentum ±ħ along z, and π is linear along z. Any linear in-plane polarization is an equal superposition of σ⁺ and σ⁻.",
num: "Each photon carries angular momentum <b>+ħ</b> (σ⁺), <b>−ħ</b> (σ⁻) or <b>0</b> (linear) along its propagation axis.<br>One field period at 795 nm: λ/c = <b>2.65 fs</b>. The animation is slowed by about 10¹⁵.",
r(fig, ctl) {
  let s = "p";
  ctl.innerHTML = btns([["p", "σ⁺"], ["m", "σ⁻"], ["x", "x"], ["y", "y"], ["pm", "σ⁺ + σ⁻"]], "s");
  const u = () => { pick(ctl, "s", s); };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { s = b.dataset.s; u(); }); u();
  const cx = 340, cy = 140, R = 90;
  anim(t => {
    const w = 2 * Math.PI * 0.5, c = Math.cos(w * t), si = Math.sin(w * t);
    const v = { p: [c, si], m: [c, -si], x: [c, 0], y: [0, c], pm: [c, 0] }[s];
    const trace = { p: `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)" stroke-dasharray="4 4"/>`, m: `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)" stroke-dasharray="4 4"/>`, x: `<line x1="${cx-R}" x2="${cx+R}" y1="${cy}" y2="${cy}" stroke="var(--b)" stroke-dasharray="4 4"/>`, y: `<line x1="${cx}" x2="${cx}" y1="${cy-R}" y2="${cy+R}" stroke="var(--b)" stroke-dasharray="4 4"/>`, pm: `<line x1="${cx-R}" x2="${cx+R}" y1="${cy}" y2="${cy}" stroke="var(--b)" stroke-dasharray="4 4"/>` }[s];
    const extra = s === "pm" ? `<line x1="${cx}" y1="${cy}" x2="${cx+R/2*c}" y2="${cy-R/2*si}" stroke="#378ADD" stroke-width="2" opacity="0.6"/><line x1="${cx}" y1="${cy}" x2="${cx+R/2*c}" y2="${cy+R/2*si}" stroke="#D85A30" stroke-width="2" opacity="0.6"/>` : "";
    const label = { p: "σ⁺: rotates counterclockwise", m: "σ⁻: rotates clockwise", x: "linear x", y: "linear y", pm: "σ⁺ (blue) + σ⁻ (coral) = linear x (orange)" }[s];
    fig.innerHTML = svg(280, `<line x1="${cx-120}" x2="${cx+120}" y1="${cy}" y2="${cy}" stroke="var(--p)" stroke-width="0.5"/><line x1="${cx}" x2="${cx}" y1="${cy-120}" y2="${cy+120}" stroke="var(--p)" stroke-width="0.5"/><text class="ts" x="${cx+124}" y="${cy+4}">x</text><text class="ts" x="${cx+4}" y="${cy-112}">y</text>${trace}${extra}<line x1="${cx}" y1="${cy}" x2="${cx+R*v[0]}" y2="${cy-R*v[1]}" stroke="#EF9F27" stroke-width="4" marker-end="url(#ar)"/><text class="ts" x="${cx}" y="272" text-anchor="middle">${label}. Light travels out of the screen (along z).</text>`);
  });
}},

{s: "5. Lifetime", t: "Lifetime and linewidth: τ and ħ/τ",
intu: "Once excited, the dot does not emit at a fixed moment. The probability that it is still excited decays exponentially with time constant τ. A light wave that dies out in a time τ cannot have one perfectly sharp frequency. Its spectrum has a width of about 1/τ, and the line shape is a Lorentzian. Shorter lifetime, broader line. Drag τ and watch the decay curve and the spectral line change together. This lifetime-limited width is the narrowest the line can be. In real samples, charge noise and phonons usually broaden it further.",
eq: String.raw`\[ P_{\mathrm{exc}}(t) = e^{-t/\tau}, \qquad \tau = \frac{1}{\Gamma} \]\[ \Delta(\hbar\omega)_{\mathrm{FWHM}} = \hbar\Gamma = \frac{\hbar}{\tau} \qquad \hbar = 0.658\,\mu\mathrm{eV}\cdot\mathrm{ns} \]\[ S(\omega) \propto \frac{1}{(\omega - \omega_0)^2 + (\Gamma/2)^2} \]`,
sym: [[String.raw`\(\tau\)`, "radiative lifetime"], [String.raw`\(\Gamma\)`, "decay rate, 1/τ"], ["FWHM", "full width at half maximum of the line"], [String.raw`\(S(\omega)\)`, "emission spectrum, Lorentzian"], [String.raw`\(\omega_0\)`, "center frequency of the transition"]],
how: ["The decay rate is constant (golden rule), so the excited population decays exponentially.", "The emitted field is then an oscillation at ω₀ with an exponentially decaying amplitude.", "The Fourier transform of a decaying oscillation is a Lorentzian of width Γ.", "In energy units the width is ħΓ = ħ/τ."],
say: "The lifetime-limited (Fourier-limited) linewidth is ħ/τ, below 1 µeV for a 1 ns lifetime. Measured lines are often broader because of spectral diffusion.",
num: "τ = 1 ns ⟹ ħ/τ = <b>0.66 µeV</b><br>τ = 0.3 ns ⟹ <b>2.2 µeV</b><br>Compare: a Zeeman splitting at 1 T is tens of µeV (Lesson 5), so lifetime-limited lines are easily resolved.",
r(fig, ctl) {
  ctl.innerHTML = sl("tau", "Lifetime τ", 0.1, 3, 0.01, 1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const tau = +$("tau").value; $("tauv").textContent = tau.toFixed(2) + " ns";
    const W = HBAR_UEV_NS / tau;
    const ts = range(0, 5, 80), es = range(-6, 6, 160);
    const dec = plot(40, 50, 270, 170, ts, ts.map(t => Math.exp(-t / tau)), 0, 5, 0, 1, "#378ADD", 2.5);
    const lor = plot(380, 50, 270, 170, es, es.map(e => 1 / (1 + Math.pow(2 * e / W, 2))), -6, 6, 0, 1, "#D85A30", 2.5);
    const hx = 380 + (6 - W / 2) / 12 * 270, hx2 = 380 + (6 + W / 2) / 12 * 270;
    fig.innerHTML = svg(270, `<text class="th" x="175" y="36" text-anchor="middle">in time</text><line x1="40" x2="310" y1="220" y2="220" stroke="var(--p)"/><line x1="40" x2="40" y1="50" y2="220" stroke="var(--p)"/>${dec}<text class="ts" x="175" y="240" text-anchor="middle">time, 0 to 5 ns</text><text class="ts" x="46" y="62">P_exc</text>
      <text class="th" x="515" y="36" text-anchor="middle">in energy</text><line x1="380" x2="650" y1="220" y2="220" stroke="var(--p)"/>${lor}<line x1="${hx}" x2="${hx2}" y1="135" y2="135" stroke="var(--t)" ${W > 0.4 ? 'marker-start="url(#ar)" marker-end="url(#ar)"' : ""}/><text class="ts" x="515" y="240" text-anchor="middle">ħω − ħω₀, −6 to +6 µeV</text>`);
    $("ro").innerHTML = `<div><span>decay rate Γ</span><b>${(1 / tau).toFixed(2)} ns⁻¹</b></div><div><span>linewidth ħ/τ</span><b>${W.toFixed(2)} µeV</b></div>`;
  };
  $("tau").oninput = u; u();
}},

{s: "6. Seen from the top", t: "Why a top-view measurement misses the z dipole",
intu: "A photoluminescence setup usually collects light from above with an objective that accepts a cone of half-angle θ<sub>max</sub>, set by its numerical aperture NA. Combine that cone with the doughnut pattern from card 1. An in-plane dipole sends a lot of light upward. A z dipole sends almost nothing straight up, and only a little into the edges of the cone. Change the NA and the dipole and compare the collected fraction. This simple model ignores the membrane, which changes the numbers but not the trend. The important consequence: the weak z-polarized transitions are hard to see from the top, but a waveguide mode that has field along z (TM-like) can still collect them (Lesson 6).",
eq: String.raw`\[ \mathrm{NA} = \sin\theta_{\max} \qquad c = \cos\theta_{\max} \]\[ \eta_z = \tfrac{3}{4}\left(\tfrac{2}{3} - c + \tfrac{c^3}{3}\right) \qquad \eta_x = \tfrac{3}{8}\left[ 2(1 - c) - \left(\tfrac{2}{3} - c + \tfrac{c^3}{3}\right) \right] \]`,
sym: [[String.raw`\(\mathrm{NA}\)`, "numerical aperture of the objective (in air)"], [String.raw`\(\theta_{\max}\)`, "half-angle of the collection cone, measured from z"], [String.raw`\(\eta_z, \eta_x\)`, "fraction of all emitted power that falls in the cone, for a dipole along z or along x"]],
how: ["Write the pattern for each dipole: z dipole ∝ sin²θ, x dipole ∝ 1 − sin²θ cos²φ.", "Integrate over the cone 0 ≤ θ ≤ θ_max and all φ.", "Divide by the total power over the whole sphere, 8π/3 in these units.", "At θ_max = 90° (a full hemisphere) both give exactly 0.5, as they should."],
say: "In a top-collection geometry the z-oriented dipole is collected very weakly because it does not radiate along its axis. Waveguide modes with a z field component can collect it instead.",
num: "Free space model, NA = 0.65 (a common objective):<br>in-plane dipole: η<sub>x</sub> ≈ <b>0.16</b><br>z dipole: η<sub>z</sub> ≈ <b>0.04</b>, about 4 times less<br>Real numbers inside a high-index membrane differ. This card shows the trend only.",
r(fig, ctl) {
  let dp = "x";
  ctl.innerHTML = btns([["x", "in-plane dipole (x)"], ["z", "z dipole"]], "d") + sl("na", "Objective NA", 0.1, 0.95, 0.01, 0.65) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "d", dp);
    const na = +$("na").value; $("nav").textContent = na.toFixed(2);
    const th = Math.asin(na), c = Math.cos(th), I = 2 / 3 - c + c * c * c / 3;
    const ez = 0.75 * I, ex = 0.375 * (2 * (1 - c) - I);
    const cx = 340, cy = 230, R = 110;
    let d = ""; for (let i = 0; i <= 360; i++) { const t = i * Math.PI / 180; const r = dp === "z" ? R * Math.pow(Math.sin(t), 2) : R * Math.pow(Math.cos(t), 2); const x = cx + r * Math.sin(t), y = cy - r * Math.cos(t); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
    const L = 200, xl = cx - L * Math.sin(th), xr = cx + L * Math.sin(th), yt = cy - L * Math.cos(th);
    const dip = dp === "z" ? `<line x1="${cx}" y1="${cy+30}" x2="${cx}" y2="${cy-30}" stroke="#854F0B" stroke-width="4" marker-start="url(#ar)" marker-end="url(#ar)"/>` : `<line x1="${cx-30}" y1="${cy}" x2="${cx+30}" y2="${cy}" stroke="#854F0B" stroke-width="4" marker-start="url(#ar)" marker-end="url(#ar)"/>`;
    fig.innerHTML = svg(270, `<path d="M${cx} ${cy} L${xl} ${yt} L${xr} ${yt} Z" fill="#378ADD" fill-opacity="0.12" stroke="#378ADD" stroke-width="1"/><path d="${d}Z" fill="#EF9F27" fill-opacity="0.3" stroke="#BA7517" stroke-width="1.5"/>${dip}<text class="ts" x="${cx}" y="${Math.max(16, yt-6)}" text-anchor="middle">objective accepts this cone</text><text class="ts" x="${cx}" y="262" text-anchor="middle">only the upper half is collected</text>`);
    $("ro").innerHTML = `<div><span>θ_max</span><b>${(th * 180 / Math.PI).toFixed(1)}°</b></div><div><span>collected, in-plane</span><b>${ex.toFixed(3)}</b></div><div><span>collected, z dipole</span><b>${ez.toFixed(3)}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { dp = b.dataset.d; u(); });
  $("na").oninput = u; u();
}}
],
summary: "A transition is an oscillating dipole d = e⟨ψc|r|ψv⟩. Because the conduction band is s-like, the direction comes from the hole: heavy holes give circular in-plane dipoles, light holes add a z component. Fermi's golden rule sets the rate as |d·E|² times the local density of optical states, so the surroundings change the lifetime. The lifetime τ sets a Lorentzian linewidth ħ/τ, below 1 µeV for 1 ns. A dipole radiates as sin²θ and not along its axis, so z dipoles are almost invisible from the top but can couple to TM-like waveguide modes.",
sheet: [
[String.raw`\[ \frac{dP}{d\Omega} \propto \lvert \mathbf{d} \rvert^2 \sin^2\theta \]`, "Dipole radiation pattern"],
[String.raw`\[ \mathbf{d} = e\langle \psi_c \vert \mathbf{r} \vert \psi_v \rangle, \quad \langle S \vert x \vert X \rangle = \langle S \vert y \vert Y \rangle = \langle S \vert z \vert Z \rangle = P_{\mathrm{cv}} \]`, "Transition dipole"],
[String.raw`\[ \text{HH: } \mathbf{d} \propto \frac{\hat{\mathbf{x}} \pm i\hat{\mathbf{y}}}{\sqrt{2}}, \quad \text{LH: } \lvert d_z \rvert^2 = \tfrac{2}{3},\ \lvert d_\pm \rvert^2 = \tfrac{1}{3} \]`, "Dipole direction from the hole"],
[String.raw`\[ \Gamma = \frac{2\pi}{\hbar} \left\lvert \langle f \vert -\mathbf{d}\cdot\mathbf{E} \vert i \rangle \right\rvert^2 \rho(\hbar\omega) \]`, "Fermi's golden rule"],
[String.raw`\[ \hat{\mathbf{e}}_\pm = \frac{\hat{\mathbf{x}} \pm i\hat{\mathbf{y}}}{\sqrt{2}}, \quad \hat{\mathbf{x}} = \frac{\hat{\mathbf{e}}_+ + \hat{\mathbf{e}}_-}{\sqrt{2}} \]`, "Circular and linear polarization"],
[String.raw`\[ \Delta E_{\mathrm{FWHM}} = \frac{\hbar}{\tau}, \quad \hbar = 0.658\,\mu\mathrm{eV}\cdot\mathrm{ns} \]`, "Lifetime-limited linewidth"],
[String.raw`\[ \eta_z = \tfrac{3}{4}\left(\tfrac{2}{3} - c + \tfrac{c^3}{3}\right), \quad c = \cos\theta_{\max} \]`, "Top collection of a z dipole (free space)"]],
consts: "ħ = 0.658 µeV·ns, c = 2.998 × 10⁸ m/s, ω(795 nm) = 2.37 × 10¹⁵ rad/s",
sources: ["Griffiths, Introduction to Electrodynamics, 4th ed., Ch. 11 (dipole radiation)", "M. Fox, Quantum Optics: An Introduction, Oxford (2006), Ch. 9 and 10 (golden rule, Purcell effect)", "Lodahl, Mahmoodian and Stobbe, Rev. Mod. Phys. 87, 347 (2015) (thesis ref., emitter in nanostructures)", "Chuang, Physics of Photonic Devices, 2nd ed., Ch. 9 (momentum matrix element)"]
});
