addLesson("thesis", "ch1", {
level: "Advanced",
id: "thesis-ch1-l5", title: "Optical selection rules", short: "5. Selection rules",
big: "A photon carries angular momentum ±1 along z (σ⁺, σ⁻) or 0 (π). Angular momentum must be conserved in every transition, so for a trion with a pure heavy hole only the vertical transitions in Fig. 1.1(a) are allowed, and the diagonals need the light-hole admixture. A magnetic field splits the levels (Zeeman effect) so the transitions get different colors. Its direction decides the geometry: along z (Faraday) gives circular cycling transitions, in the plane (Voigt) gives four linear transitions of equal strength.",
bridge: "Lesson 3 gave the levels of Fig. 1.1: a single electron and the trion. Lesson 4 gave the dipoles and polarizations. This lesson combines them into the selection rules shown in Fig. 1.1.",
cards: [
{s: "1. Bookkeeping", t: "Angular momentum bookkeeping: which jumps are allowed",
intu: "Each state has an angular momentum along z. The trion's comes from its hole, M = ±3/2. The ground state is a single electron, M = ±½. When the trion decays, the photon must carry away the difference ΔM. A photon can carry +1 (σ⁺), −1 (σ⁻) or 0 (π, but only in the z direction). Pick a start and an end state. ΔM = ±1 is allowed. ΔM = ±2 is impossible for a single photon, so with a pure heavy hole it is forbidden. That is the rule behind the strong vertical and the forbidden diagonal arrows in Fig. 1.1(a).",
eq: "ΔM = M<sub>initial</sub> − M<sub>final</sub> = m<sub>photon</sub><br>m<sub>photon</sub> = +1 (σ⁺), −1 (σ⁻), 0 (π) &nbsp;&nbsp; |ΔM| = 2 ⟹ forbidden",
sym: [["M", "angular momentum along z of a state"], ["trion |↑↓, ⇑⟩", "M = +3/2 (paired electrons, heavy hole ⇑)"], ["electron |↑⟩", "M = +½"], ["m_photon", "angular momentum carried away by the photon"]],
how: ["With the field (or growth axis) along z, the system is symmetric under rotation about z, so angular momentum along z is conserved.", "The photon's angular momentum is set by its polarization: σ± carry ±1, π carries 0.", "So the allowed transitions are those with ΔM = ±1 or 0.", "Heavy-hole trion to electron gives ΔM = ±1 (vertical) or ±2 (diagonal). The diagonal would need a photon carrying 2, so it is forbidden."],
say: "For a pure heavy-hole trion, the vertical transitions are allowed with σ⁺ and σ⁻ light, and the diagonal transitions are forbidden because they would need ΔM = ±2.",
num: "Four possible transitions: <b>2 allowed</b> (ΔM = ±1), <b>2 forbidden</b> (ΔM = ±2) for a pure heavy hole.<br>Check: ⇑ (+3/2) → ↑ (+½): ΔM = +1, σ⁺. ⇑ (+3/2) → ↓ (−½): ΔM = +2, forbidden.",
r(fig, ctl) {
  let i = 3, f = 1;
  ctl.innerHTML = `<div class="row"><label>Start (trion)</label><button data-i="3">|↑↓, ⇑⟩ +3/2</button><button data-i="-3">|↑↓, ⇓⟩ −3/2</button></div><div class="row"><label>End (electron)</label><button data-f="1">|↑⟩ +½</button><button data-f="-1">|↓⟩ −½</button></div><div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "i", i); pick(ctl, "f", f);
    const dM = (i - f) / 2, xs = { 3: 250, "-3": 430 }, xg = { 1: 250, "-1": 430 };
    const ok = Math.abs(dM) === 1, col = ok ? "#1D9E75" : "#D85A30";
    fig.innerHTML = svg(270, `${lvl(190, 310, 60, "|↑↓, ⇑⟩")}${lvl(370, 490, 60, "|↑↓, ⇓⟩")}${lvl(190, 310, 220, "|↑⟩")}${lvl(370, 490, 220, "|↓⟩")}<text class="ts" x="40" y="64">trion</text><text class="ts" x="40" y="224">electron</text>
      <line x1="${xs[i]}" y1="68" x2="${xg[f]}" y2="212" stroke="${col}" stroke-width="3" ${ok ? "" : 'stroke-dasharray="6 5"'} marker-end="url(#ar)"/>
      <text class="th" x="590" y="130" text-anchor="middle">ΔM = ${dM > 0 ? "+" : ""}${dM}</text><text class="ts" x="590" y="152" text-anchor="middle">${ok ? (dM > 0 ? "σ⁺ photon" : "σ⁻ photon") : "forbidden"}</text><text class="ts" x="340" y="258" text-anchor="middle">B and growth axis along z (Faraday)</text>`);
    $("ro").innerHTML = `<div><span>start M</span><b>${i > 0 ? "+" : "−"}3/2</b></div><div><span>end M</span><b>${f > 0 ? "+" : "−"}1/2</b></div><div><span>result</span><b class="${ok ? "good" : "badc"}">${ok ? "allowed" : "forbidden"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => { i = +b.dataset.i; u(); });
  ctl.querySelectorAll("button[data-f]").forEach(b => b.onclick = () => { f = +b.dataset.f; u(); });
  u();
}},

{s: "2. Zeeman", t: "A magnetic field gives each transition its own color",
intu: "Without a field, ↑ and ↓ have the same energy, and so do ⇑ and ⇓. All transitions have the same color, and a laser cannot address one spin. A magnetic field acts on each spin like a compass needle: aligned spins go down in energy and opposite spins go up. The electron levels split by Δ<sub>e</sub> and the trion levels by Δ<sub>h</sub>, which depends on the hole g factor. Now the four transitions sit at four different energies. Drag B and watch the spectrum split. The g factors here are illustrative, chosen so that the trion splitting is larger, as drawn in Fig. 1.1(a).",
eq: "Δ<sub>e</sub> = |g<sub>e</sub>| μ<sub>B</sub> B &nbsp;&nbsp;&nbsp; Δ<sub>h</sub> = |g<sub>h</sub>| μ<sub>B</sub> B<br>vertical lines: E<sub>0</sub> ± (Δ<sub>h</sub> + Δ<sub>e</sub>)/2 &nbsp;&nbsp; diagonal lines: E<sub>0</sub> ± (Δ<sub>h</sub> − Δ<sub>e</sub>)/2",
sym: [["μ_B", "Bohr magneton, 57.88 µeV/T"], ["g_e", "electron g factor in the dot"], ["g_h", "effective hole g factor of the trion along the field"], ["B", "magnetic field (T)"], ["E₀", "transition energy at B = 0"]],
how: ["A magnetic moment in a field has energy −μ·B. For a spin, μ ∝ g μ_B × spin.", "So each spin pair splits symmetrically by g μ_B B.", "Take the energy of the start level minus the end level for each of the four transitions.", "The vertical lines move apart by the sum of the splittings, the diagonals by their difference."],
say: "The Zeeman effect splits the electron and trion spin levels, so each transition has its own frequency and a narrow laser can address one spin state.",
num: "With the illustrative |g<sub>e</sub>| = 0.4 and |g<sub>h</sub>| = 1.2 at B = 1 T:<br>Δ<sub>e</sub> = 0.4 × 57.88 = <b>23 µeV</b>, &nbsp; Δ<sub>h</sub> = <b>69 µeV</b><br>vertical pair separated by <b>93 µeV</b>, about 140 lifetime-limited linewidths (Lesson 4, card 5)<br>Real g factors depend on the dot. Check your group's values before quoting them.",
r(fig, ctl) {
  ctl.innerHTML = sl("B", "Magnetic field B", 0, 8, 0.1, 2) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const B = +$("B").value; $("Bv").textContent = B.toFixed(1) + " T";
    const De = 0.4 * MUB * B, Dh = 1.2 * MUB * B, s = 0.12;
    const yU = 70, yD = 220, tU = yU - Dh / 2 * s, tD = yU + Dh / 2 * s, gU = yD + De / 2 * s, gDn = yD - De / 2 * s;
    const E = { sp: (Dh + De) / 2, sm: -(Dh + De) / 2, d1: (Dh - De) / 2, d2: -(Dh - De) / 2 };
    const span = 700, sx = v => 560 + v / span * 90;
    fig.innerHTML = svg(290, `${lvl(120, 220, tU, "⇑")}${lvl(270, 370, tD, "⇓")}${lvl(120, 220, gU, "↑")}${lvl(270, 370, gDn, "↓")}
      <line x1="170" y1="${tU+5}" x2="170" y2="${gU-5}" stroke="#378ADD" stroke-width="2.5" marker-end="url(#ar)"/><line x1="320" y1="${tD+5}" x2="320" y2="${gDn-5}" stroke="#D85A30" stroke-width="2.5" marker-end="url(#ar)"/>
      <line x1="200" y1="${tU+5}" x2="290" y2="${gDn-5}" stroke="#888780" stroke-width="1" stroke-dasharray="4 4"/><line x1="290" y1="${tD+5}" x2="200" y2="${gU-5}" stroke="#888780" stroke-width="1" stroke-dasharray="4 4"/>
      <text class="ts" x="40" y="74">trion</text><text class="ts" x="40" y="224">electron</text>
      <text class="th" x="560" y="40" text-anchor="middle">spectrum</text><line x1="455" x2="665" y1="230" y2="230" stroke="var(--p)"/>
      <line x1="${sx(E.sp)}" x2="${sx(E.sp)}" y1="230" y2="90" stroke="#378ADD" stroke-width="3"/><line x1="${sx(E.sm)}" x2="${sx(E.sm)}" y1="230" y2="90" stroke="#D85A30" stroke-width="3"/>
      <line x1="${sx(E.d1)}" x2="${sx(E.d1)}" y1="230" y2="205" stroke="#888780" stroke-width="2"/><line x1="${sx(E.d2)}" x2="${sx(E.d2)}" y1="230" y2="205" stroke="#888780" stroke-width="2"/>
      <text class="ts" x="${sx(E.sp)}" y="82" text-anchor="middle">σ⁺</text><text class="ts" x="${sx(E.sm)}" y="82" text-anchor="middle">σ⁻</text><text class="ts" x="560" y="252" text-anchor="middle">energy, ±350 µeV around E₀</text><text class="ts" x="560" y="270" text-anchor="middle">grey: weak diagonals</text><text class="ts" x="245" y="282" text-anchor="middle">level splittings exaggerated</text>`);
    $("ro").innerHTML = `<div><span>Δ_e</span><b>${De.toFixed(0)} µeV</b></div><div><span>Δ_h</span><b>${Dh.toFixed(0)} µeV</b></div><div><span>σ⁺ to σ⁻</span><b>${(Dh + De).toFixed(0)} µeV</b></div>`;
  };
  $("B").oninput = u; u();
}},

{s: "3. Weak diagonals", t: "The forbidden becomes weak: light-hole mixing again",
intu: "Card 1 said the diagonals are forbidden for a pure heavy hole. Real holes are not pure (Lesson 2, card 6). The small light-hole part has m<sub>j</sub> = ±½, and its Z orbital gives a dipole along z. Through that part, the diagonal transition only needs ΔM = ±1 or 0 and becomes allowed, but weakly. Its strength grows with the light-hole fraction ε². The z-dipole part of this transition is the dashed π (z) arrow in Fig. 1.1(a). Drag ε² and watch the diagonal arrows thicken.",
eq: "|hole⟩ = √(1 − ε²)|HH⟩ + ε|LH⟩<br>Γ<sub>diag</sub> / Γ<sub>vert</sub> ≈ (2/3) ε² / (1 − ε²) &nbsp;(simple model) &nbsp;&nbsp; measured: Γ<sub>vert</sub> ≈ 100 Γ<sub>diag</sub> (Javadi 2018)",
sym: [["ε²", "light-hole fraction of the trion's hole"], ["Γ_vert", "rate of the allowed vertical transition"], ["Γ_diag", "rate of the weak diagonal transition"], ["2/3", "Z share of the light hole"]],
how: ["The HH part of the hole drives the vertical transition with strength ∝ (1 − ε²).", "The LH part has m_j = ±½. Its Z component connects to the other electron spin with ΔM = 0 (π, z polarized).", "So the diagonal gains a rate ∝ ε² × 2/3.", "Their ratio gives the formula. Javadi et al. measured a ratio of about 1/100 in their InGaAs dots."],
say: "Heavy–light hole mixing makes the diagonal trion transitions weakly allowed, with a z-polarized component. In the reference experiment they are about 100 times slower than the vertical ones.",
num: "Ratio 1/100 in this simple model ⟹ ε² ≈ <b>1.5 %</b> (order of magnitude only).<br>Ratio for ε² = 5 %: (2/3)(0.05/0.95) ≈ <b>1/29</b>.",
r(fig, ctl) {
  ctl.innerHTML = sl("e2", "Light-hole fraction ε²", 0, 0.2, 0.001, 0.015) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const e2 = +$("e2").value; $("e2v").textContent = (e2 * 100).toFixed(1) + " %";
    const r = e2 > 0 ? (2 / 3) * e2 / (1 - e2) : 0, w = Math.max(0.6, Math.min(6, 6 * Math.sqrt(r * 8)));
    fig.innerHTML = svg(270, `${lvl(190, 310, 60, "|↑↓, ⇑⟩")}${lvl(370, 490, 80, "|↑↓, ⇓⟩")}${lvl(190, 310, 220, "|↑⟩")}${lvl(370, 490, 205, "|↓⟩")}
      <line x1="250" y1="68" x2="250" y2="212" stroke="#378ADD" stroke-width="6" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#D85A30" stroke-width="6" marker-end="url(#ar)"/>
      ${r > 0 ? `<line x1="270" y1="68" x2="410" y2="197" stroke="#1D9E75" stroke-width="${w}" stroke-dasharray="6 4" marker-end="url(#ar)"/><line x1="410" y1="88" x2="270" y2="212" stroke="#1D9E75" stroke-width="${w}" stroke-dasharray="6 4" marker-end="url(#ar)"/>` : ""}
      <text class="ts" x="236" y="150" text-anchor="end">σ⁺</text><text class="ts" x="444" y="150">σ⁻</text><text class="ts" x="340" y="252" text-anchor="middle">teal dashed: diagonals with a π (z) part, thickness ∝ rate</text>`);
    $("ro").innerHTML = `<div><span>Γ_diag / Γ_vert</span><b>${r > 0 ? r.toFixed(4) : "0"}</b></div><div><span>about 1 in</span><b>${r > 0 ? Math.round(1 / r) : "∞"}</b></div>`;
  };
  $("e2").oninput = u; u();
}},

{s: "4. Faraday vs Voigt", t: "Turning the field: Faraday versus Voigt",
intu: "The direction of the magnetic field changes which spin states are the natural ones. In Faraday geometry (B along z) the spins stay quantized along z: the pictures from cards 1 to 3 apply, with two strong circular verticals and two weak diagonals. In Voigt geometry (B in the plane, along x) the electron spin is quantized along x instead. Its eigenstates are equal mixtures of ↑ and ↓ along z. Each of them now connects to both trion states, so all four transitions are allowed with equal strength, and they are linearly polarized: verticals along x, diagonals along y. Toggle the geometry.",
eq: "Faraday (B ∥ z): &nbsp; |↑⟩, |↓⟩ along z, &nbsp; 2 strong σ<sup>±</sup> + 2 weak<br>Voigt (B ∥ x): &nbsp; |↑<sub>x</sub>⟩ = (|↑⟩ + |↓⟩)/√2, &nbsp; |↓<sub>x</sub>⟩ = (|↑⟩ − |↓⟩)/√2, &nbsp; 4 equal, linear x and y",
sym: [["Faraday", "field along the growth axis z (also the light's direction for top collection)"], ["Voigt", "field in the sample plane, perpendicular to z"], ["|↑ₓ⟩, |↓ₓ⟩", "electron spin states along x"], ["x, y", "linear in-plane polarizations"]],
how: ["The Zeeman term is g μ_B B·S. With B along x, it is diagonal in spin states along x, not z.", "Write the x states as sums of z states with equal weight.", "Each z component connects to one trion by a σ⁺ or σ⁻ transition. Adding both with equal weight gives a linear polarization (Lesson 4, card 4).", "So each Voigt transition is linear, and all four have the same strength."],
say: "In Faraday geometry the trion has two strong circular cycling transitions and two weak diagonals. In Voigt geometry all four transitions are equally strong and linearly polarized, so the spin is distinguished by frequency only. All of them are in-plane dipoles.",
num: "Faraday: strength ratio vertical : diagonal ≈ <b>100 : 1</b> (Javadi 2018)<br>Voigt: <b>1 : 1</b>, verticals x, diagonals y (Warburton 2013, Fig. 3)<br>This is exactly Fig. 1.1(a) and (b) in your thesis.",
r(fig, ctl) {
  let g = "f";
  ctl.innerHTML = btns([["f", "Faraday, B ∥ z"], ["v", "Voigt, B ∥ x"]], "g");
  const u = () => {
    pick(ctl, "g", g);
    const F = g === "f";
    const vt = F ? `<line x1="250" y1="68" x2="250" y2="212" stroke="#378ADD" stroke-width="5" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#D85A30" stroke-width="5" marker-end="url(#ar)"/><line x1="270" y1="68" x2="410" y2="197" stroke="#888780" stroke-width="1" stroke-dasharray="5 4"/><line x1="410" y1="88" x2="270" y2="212" stroke="#888780" stroke-width="1" stroke-dasharray="5 4"/><text class="ts" x="236" y="150" text-anchor="end">σ⁺</text><text class="ts" x="444" y="150">σ⁻</text>`
      : `<line x1="250" y1="68" x2="250" y2="212" stroke="#1D9E75" stroke-width="3.5" marker-end="url(#ar)"/><line x1="430" y1="88" x2="430" y2="197" stroke="#1D9E75" stroke-width="3.5" marker-end="url(#ar)"/><line x1="270" y1="68" x2="410" y2="197" stroke="#7F77DD" stroke-width="3.5" marker-end="url(#ar)"/><line x1="410" y1="88" x2="270" y2="212" stroke="#7F77DD" stroke-width="3.5" marker-end="url(#ar)"/><text class="ts" x="236" y="150" text-anchor="end">x</text><text class="ts" x="444" y="150">x</text><text class="ts" x="340" y="118" text-anchor="middle">y</text>`;
    const bArrow = F ? `<line x1="600" y1="170" x2="600" y2="100" stroke="var(--t)" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="610" y="138">B ∥ z</text>` : `<line x1="570" y1="140" x2="640" y2="140" stroke="var(--t)" stroke-width="2" marker-end="url(#ar)"/><text class="ts" x="605" y="128" text-anchor="middle">B ∥ x</text>`;
    fig.innerHTML = svg(270, `${lvl(190, 310, 60, F ? "|↑↓, ⇑⟩" : "trion 1")}${lvl(370, 490, 80, F ? "|↑↓, ⇓⟩" : "trion 2")}${lvl(190, 310, 220, F ? "|↑⟩" : "|↑ₓ⟩")}${lvl(370, 490, 205, F ? "|↓⟩" : "|↓ₓ⟩")}${vt}${bArrow}<text class="ts" x="340" y="256" text-anchor="middle">${F ? "2 strong circular, 2 weak (Fig. 1.1a)" : "4 equal, linear, all in-plane (Fig. 1.1b)"}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { g = b.dataset.g; u(); }); u();
}},

{s: "5. Cycling or Λ", t: "Why each geometry is useful: cycling versus Λ",
intu: "Count how many photons a dot emits before its spin flips. Each time the trion decays, it takes the diagonal path with probability p. In Faraday p is about 1 %, so the dot emits on average about 100 photons on the same transition before flipping. That is a cycling transition, good for reading out the spin: bright means one spin, dark means the other. In Voigt p is 50 %, so the spin flips after about 2 photons. Those two paths from one trion to the two spins form a Λ shape, which is what you want for fast spin preparation and for coherent spin control with lasers. Drag p and look at the distribution of photons before a flip.",
eq: "p = Γ<sub>diag</sub> / (Γ<sub>vert</sub> + Γ<sub>diag</sub>)<br>P(n photons, then flip) = (1 − p)<sup>n−1</sup> p &nbsp;&nbsp;&nbsp; ⟨n⟩ = 1/p",
sym: [["p", "probability that one decay flips the spin (branching ratio)"], ["n", "number of photons emitted up to and including the flip"], ["⟨n⟩", "average number of photons before the spin flips"], ["Λ system", "two ground states sharing one excited state"]],
how: ["Each decay is an independent event: flip with probability p, stay with probability 1 − p.", "The chance that the first flip happens on the n-th decay is (1 − p)^(n−1) p (a geometric distribution).", "Its mean is 1/p.", "Faraday: p ≈ 1/101 ⟹ about 100 photons. Voigt: p = 1/2 ⟹ 2 photons."],
say: "Faraday geometry gives nearly closed cycling transitions useful for spin readout. Voigt geometry gives a Λ system with equal branching, useful for fast optical spin pumping and coherent control.",
num: "Faraday, Γ<sub>vert</sub> = 100 Γ<sub>diag</sub>: p = 1/101, ⟨n⟩ ≈ <b>101</b> photons<br>Voigt: p = 0.5, ⟨n⟩ = <b>2</b> photons<br>Probability of more than 300 photons before a flip in Faraday: (100/101)³⁰⁰ ≈ <b>5 %</b>",
r(fig, ctl) {
  ctl.innerHTML = btns([["0.0099", "Faraday (p ≈ 0.01)"], ["0.5", "Voigt (p = 0.5)"]], "p") + sl("pp", "Flip probability p", 0.005, 0.6, 0.001, 0.0099) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const p = +$("pp").value; $("ppv").textContent = p.toFixed(3);
    const N = Math.max(10, Math.min(400, Math.ceil(4 / p))), bins = 40, bw = Math.ceil(N / bins);
    const vals = []; for (let b = 0; b < bins; b++) { let s = 0; for (let n = b * bw + 1; n <= (b + 1) * bw; n++) s += Math.pow(1 - p, n - 1) * p; vals.push(s); }
    const mx = Math.max(...vals); let bars = "";
    vals.forEach((v, b) => { const h = v / mx * 170; bars += `<rect x="${60 + b * 14}" y="${220 - h}" width="11" height="${h}" fill="#378ADD" rx="1"/>`; });
    const mean = 1 / p, mx2 = 60 + (mean / bw) * 14;
    fig.innerHTML = svg(270, `<text class="th" x="340" y="34" text-anchor="middle">photons emitted before the spin flips</text>${bars}<line x1="56" x2="625" y1="220" y2="220" stroke="var(--p)"/>${mx2 < 625 ? `<line x1="${mx2}" x2="${mx2}" y1="40" y2="220" stroke="#EF9F27" stroke-width="2" stroke-dasharray="4 3"/><text class="ts" x="${mx2+4}" y="56">mean 1/p</text>` : ""}<text class="ts" x="60" y="240">1</text><text class="ts" x="625" y="240" text-anchor="end">${bins * bw}</text><text class="ts" x="340" y="258" text-anchor="middle">n (number of photons), ${bw} per bar</text>`);
    $("ro").innerHTML = `<div><span>mean photons ⟨n⟩</span><b>${mean.toFixed(1)}</b></div><div><span>best suited for</span><b>${p < 0.1 ? "spin readout" : "fast pumping, Λ control"}</b></div>`;
  };
  ctl.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { $("pp").value = b.dataset.p; u(); });
  $("pp").oninput = u; u();
}},

{s: "6. To TE or TM", t: "From each transition to a waveguide mode",
intu: "Put everything together. Pick a geometry and a transition and follow the chain: transition → dipole direction → which waveguide mode family it couples to at the membrane mid-plane (Lesson 6 proves the last step). All strong transitions in both geometries have in-plane dipoles, so they go into TE-like modes. Only the z part of the weak Faraday diagonals goes into TM-like modes. That is the physical content of the label 'TE (strong) + TM (weak)' in Fig. 1.2(a), and it is why the PBS separates strong from weak transitions but cannot tell σ⁺ from σ⁻.",
eq: "in-plane dipole (x, y, σ<sup>±</sup>) ⟶ TE-like &nbsp;&nbsp;&nbsp; z dipole (π) ⟶ TM-like &nbsp;&nbsp;(dot at the mid-plane)",
sym: [["TE-like", "mode whose field at the mid-plane is in the plane (E_z = 0 there)"], ["TM-like", "mode whose field at the mid-plane is along z"], ["mid-plane", "the plane halfway through the membrane thickness"]],
how: ["Selection rules give the polarization of each transition (cards 1 to 4).", "Polarization gives the dipole direction (Lesson 4).", "Coupling ∝ |d·E|² (Lesson 4, card 3), so the dipole picks the mode whose field points the same way at the dot.", "Mirror symmetry of the membrane fixes that direction for each mode family (Lesson 6)."],
say: "All strong transitions are in-plane dipoles and couple to TE-like modes. The weak diagonal transitions in Faraday geometry have a z component that couples to TM-like modes. A PBS therefore separates the strong and the weak transitions, but cannot separate σ⁺ from σ⁻, and it does not by itself read out the spin.",
num: "Faraday: <b>2</b> transitions to TE (strong), <b>2</b> with a TM part (weak, about 1/100)<br>Voigt: all <b>4</b> to TE<br>So the TM port of the PBS carries only the weak diagonal light.",
r(fig, ctl) {
  let g = "f", t = "v1";
  ctl.innerHTML = `<div class="row"><label>Geometry</label><button data-g="f">Faraday</button><button data-g="v">Voigt</button></div><div class="row"><label>Transition</label><button data-t="v1">vertical 1</button><button data-t="v2">vertical 2</button><button data-t="d1">diagonal</button></div>`;
  const u = () => {
    pick(ctl, "g", g); pick(ctl, "t", t);
    const R = { f: { v1: ["σ⁺", "circular, in-plane", "TE-like", "strong"], v2: ["σ⁻", "circular, in-plane", "TE-like", "strong"], d1: ["weak, has π (z)", "z component", "TM-like (z part)", "weak, about 1/100"] }, v: { v1: ["linear x", "in-plane x", "TE-like", "equal"], v2: ["linear x", "in-plane x", "TE-like", "equal"], d1: ["linear y", "in-plane y", "TE-like", "equal"] } }[g][t];
    const tm = R[2].startsWith("TM");
    const box = (x, lab, val, cls) => `<g class="${cls}"><rect x="${x}" y="100" width="140" height="70" rx="8" stroke-width="0.8"/></g><text class="ts" x="${x+70}" y="122" text-anchor="middle">${lab}</text><text class="th" x="${x+70}" y="148" text-anchor="middle">${val}</text>`;
    fig.innerHTML = svg(260, `${box(20, "transition", R[0], "c-gray")}${box(190, "dipole", R[1], "c-purple")}${box(360, "polarization family", g === "f" ? "Faraday" : "Voigt", "c-gray")}${box(530, "couples to", R[2], tm ? "c-coral" : "c-blue")}<line x1="162" x2="188" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><line x1="332" x2="358" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><line x1="502" x2="528" y1="135" y2="135" class="arr" marker-end="url(#ar)"/><text class="th" x="340" y="214" text-anchor="middle">strength: ${R[3]}</text><text class="ts" x="340" y="238" text-anchor="middle">dot assumed at the membrane mid-plane</text>`);
  };
  ctl.querySelectorAll("button[data-g]").forEach(b => b.onclick = () => { g = b.dataset.g; u(); });
  ctl.querySelectorAll("button[data-t]").forEach(b => b.onclick = () => { t = b.dataset.t; u(); });
  u();
}}
],
summary: "Angular momentum along z is conserved, and a photon carries ±1 (σ±) or 0 (π). For a heavy-hole trion, the vertical transitions have ΔM = ±1 and are allowed, while the diagonals need ΔM = ±2 and are forbidden. A small light-hole admixture makes the diagonals weakly allowed with a z-polarized part, about 100 times slower in Javadi 2018. A magnetic field splits the levels so each transition has its own frequency. In Faraday geometry the verticals are circular cycling transitions, useful for readout. In Voigt geometry all four are linear and equally strong, a Λ system useful for spin pumping. All strong transitions are in-plane and couple to TE, and only the weak z part couples to TM.",
sheet: [
["ΔM = M<sub>i</sub> − M<sub>f</sub> = +1 (σ⁺), −1 (σ⁻), 0 (π)", "Angular momentum conservation"],
["trion M = ±3/2, &nbsp; electron M = ±1/2", "Fig. 1.1 states"],
["Δ = |g| μ<sub>B</sub> B, &nbsp; μ<sub>B</sub> = 57.88 µeV/T", "Zeeman splitting"],
["vertical: E<sub>0</sub> ± (Δ<sub>h</sub> + Δ<sub>e</sub>)/2, &nbsp; diagonal: E<sub>0</sub> ± (Δ<sub>h</sub> − Δ<sub>e</sub>)/2", "Line positions (Faraday)"],
["Γ<sub>diag</sub>/Γ<sub>vert</sub> ≈ (2/3)ε²/(1 − ε²)", "Weak diagonals from LH mixing (simple model)"],
["|↑<sub>x</sub>⟩ = (|↑⟩ + |↓⟩)/√2", "Voigt spin eigenstate"],
["⟨n⟩ = 1/p, &nbsp; p = Γ<sub>diag</sub>/(Γ<sub>vert</sub> + Γ<sub>diag</sub>)", "Photons before a spin flip"]],
consts: "μ<sub>B</sub> = 57.88 µeV/T. g factors on this page are illustrative.",
sources: ["Warburton, Nature Materials 12, 483 (2013) (thesis ref., Fig. 3: Faraday and Voigt schemes)", "Javadi et al., Nature Nanotechnology 13, 398 (2018) (thesis ref., Γ ≈ 100 γ, spin pumping)", "Appel et al., Phys. Rev. Lett. 126, 013602 (2021) (thesis ref., Voigt geometry in a waveguide)", "Lodahl, Mahmoodian and Stobbe, Rev. Mod. Phys. 87, 347 (2015) (thesis ref.)"]
});
