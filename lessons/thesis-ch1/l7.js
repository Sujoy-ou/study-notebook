addLesson("thesis", "ch1", {
level: "Pro",
id: "thesis-ch1-l7", title: "Spin pumping and the full picture", short: "7. Spin pumping, defense quiz",
big: "With a magnetic field and a narrow laser on one transition, the trion cycles and emits until a rare diagonal decay flips the spin, and then the dot goes dark. That is optical spin pumping, the experiment behind the Javadi 2018 citation. Its fidelity is a race between pumping and spin relaxation. Your thesis sits downstream of all this: it designs the passive photonic chain that carries the dot's light to a detector.",
bridge: "This lesson puts Lessons 1 to 6 into one story, draws the line between what the thesis does and what it cites, and ends with a defense-style quiz.",
cards: [
{s: "1. Spin pumping", t: "Spin pumping, step by step",
intu: "Step through the seven frames. A field splits the levels (Lesson 5). A laser tuned to the σ⁺ frequency excites only a spin-up electron. The trion decays back about 99 times out of 100 (vertical), and the laser excites it again: the dot cycles and glows. Once in about 100 decays the trion takes the diagonal path and lands in spin down. The laser is now off resonance for that spin, so the dot goes dark and stays in |↓⟩. The darkness is the signature that the spin has been prepared.",
eq: String.raw`\[ \text{laser on } \lvert \uparrow \rangle \leftrightarrow \lvert \uparrow\downarrow, \Uparrow \rangle \]\[ \text{decay: vertical } \Gamma,\ \text{diagonal } \gamma, \qquad \Gamma \approx 100\,\gamma \]\[ \text{flip probability per cycle } p = \frac{\gamma}{\Gamma + \gamma} \approx \frac{1}{101} \]`,
sym: [[String.raw`\(\Gamma\)`, "rate of the vertical (allowed) decay"], [String.raw`\(\gamma\)`, "rate of the diagonal (weak) decay"], [String.raw`\(p\)`, "chance that one excitation cycle ends with a spin flip"], [String.raw`\(\lvert \downarrow \rangle\)`, "the prepared (pumped) spin state"]],
how: ["Zeeman splitting makes the σ⁺ transition unique in frequency (Lesson 5, card 2).", "The laser drives only that transition, so only |↑⟩ is excited.", "Each decay returns to |↑⟩ with probability 1 − p and goes to |↓⟩ with probability p.", "|↓⟩ is not excited by the laser, so population accumulates there."],
say: "In Faraday geometry, resonant driving of one cycling transition together with the weak diagonal decay channel pumps the electron spin into the undriven state, which is seen as the dot going dark.",
num: "Average photons emitted before the spin flips: 1/p ≈ <b>100</b><br>Spin preparation fidelity reported in the reference experiment: <b>96 %</b>",
r(fig, ctl) {
  let k = 0;
  const S = [
    ["No field", "Spin up and down have the same energy. Both transitions have one color.", 0, "both"],
    ["Turn on B along z", "Levels split. σ⁺ and σ⁻ now have different frequencies.", 1, "both"],
    ["Laser on σ⁺", "Spin up absorbs and goes to the trion |↑↓, ⇑⟩. Spin down cannot absorb.", 1, "U", "laser"],
    ["Decay, photon out", "About 99 % of decays return to |↑⟩ with a σ⁺ photon. The dot cycles.", 1, "T", "emit"],
    ["Rare diagonal decay", "About 1 % of decays go to |↓⟩ through the light-hole part. The spin flips.", 1, "T", "diag"],
    ["Dark: spin prepared", "|↓⟩ cannot absorb the σ⁺ laser. Emission stops. The spin is in |↓⟩.", 1, "D", "laser2"],
    ["Into the chip", "σ⁺ and σ⁻ light goes into TE-like modes. Only the weak diagonal z part goes into TM-like modes.", 1, "none", "modes"]
  ];
  ctl.innerHTML = `<div class="row"><button id="pb">Back</button><button id="pn">Next</button><span class="note" id="pt"></span></div><p class="note" id="pc"></p>`;
  const u = () => {
    const [ti, cap, sp, pop, ev] = S[k];
    const tU = sp ? 70 : 90, tD = sp ? 110 : 90, gU = sp ? 245 : 225, gD = sp ? 205 : 225;
    const dot = (x, y, on) => on ? `<circle cx="${x}" cy="${y}" r="9" fill="#EF9F27" stroke="#854F0B"/>` : "";
    fig.innerHTML = svg(290, `${lvl(180, 300, tU, "|↑↓, ⇑⟩")}${lvl(380, 500, tD, "|↑↓, ⇓⟩")}${lvl(180, 300, gU, "|↑⟩")}${lvl(380, 500, gD, "|↓⟩")}
      <line x1="240" y1="${gU-5}" x2="240" y2="${tU+6}" stroke="${sp ? "#378ADD" : "#888780"}" stroke-width="2" opacity="0.5"/><line x1="440" y1="${gD-5}" x2="440" y2="${tD+6}" stroke="${sp ? "#D85A30" : "#888780"}" stroke-width="2" opacity="0.5"/>
      <line x1="260" y1="${tU+6}" x2="420" y2="${gD-6}" stroke="${ev === "diag" ? "#1D9E75" : "#888780"}" stroke-width="${ev === "diag" ? 3 : 1}" stroke-dasharray="5 4" ${ev === "diag" ? 'marker-end="url(#ar)"' : ""}/>
      ${ev === "laser" || ev === "laser2" ? `<line x1="212" y1="${gU-4}" x2="212" y2="${tU+8}" stroke="#EF9F27" stroke-width="5" ${ev === "laser2" ? 'stroke-dasharray="6 5" opacity="0.4"' : ""} marker-end="url(#ar)"/><text class="ts" x="204" y="${(tU+gU)/2}" text-anchor="end">laser</text>` : ""}
      ${ev === "emit" ? `<line x1="268" y1="${tU+6}" x2="268" y2="${gU-6}" stroke="#378ADD" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="276" y="${(tU+gU)/2}">σ⁺ photon</text>` : ""}
      ${dot(240, gU, pop === "both" || pop === "U")}${dot(440, gD, pop === "both" || pop === "D")}${dot(240, tU, pop === "T")}
      ${sp && ev !== "modes" ? `<line x1="590" y1="170" x2="590" y2="110" stroke="var(--t)" stroke-width="1.5" marker-end="url(#ar)"/><text class="ts" x="600" y="146">B ∥ z</text>` : ""}
      ${ev === "modes" ? `<g class="c-blue"><rect x="540" y="90" width="120" height="44" rx="6" stroke-width="0.6"/></g><text class="th" x="600" y="110" text-anchor="middle">TE-like</text><text class="ts" x="600" y="126" text-anchor="middle">σ⁺, σ⁻</text><g class="c-coral"><rect x="540" y="150" width="120" height="44" rx="6" stroke-width="0.6"/></g><text class="th" x="600" y="170" text-anchor="middle">TM-like</text><text class="ts" x="600" y="186" text-anchor="middle">weak z part</text>` : ""}
      <text class="ts" x="340" y="282" text-anchor="middle">amber dot: where the system is. Splittings not to scale.</text>`);
    $("pt").textContent = (k + 1) + " / 7: " + ti; $("pc").textContent = cap;
    $("pb").disabled = k === 0; $("pn").disabled = k === 6;
  };
  $("pb").onclick = () => { k--; u(); }; $("pn").onclick = () => { k++; u(); }; u();
}},

{s: "2. Fidelity", t: "How good is the preparation: pumping versus relaxation",
intu: "Pumping is not the only thing that changes the spin. The spin also relaxes on its own, flipping randomly in both directions at a rate γ<sub>s</sub>, for example through interaction with nuclear spins or phonons. Pumping pushes population from ↑ to ↓ at a rate R. In steady state the two balance. If pumping is much faster than relaxation, almost all population ends in ↓ and the fidelity is close to 1. Drag the ratio R/γ<sub>s</sub> and watch the two populations settle.",
eq: String.raw`\[ \frac{dP_{\downarrow}}{dt} = (R + \gamma_s)\, P_{\uparrow} - \gamma_s P_{\downarrow} \]<div class="eqnote">steady state</div>\[ F = P_{\downarrow} = \frac{R + \gamma_s}{R + 2\gamma_s} \]`,
sym: [[String.raw`\(R\)`, "optical pumping rate from ↑ to ↓ (scattering rate × p)"], [String.raw`\(\gamma_s\)`, "spin relaxation rate, the same in both directions in this simple model"], [String.raw`\(P_{\uparrow}, P_{\downarrow}\)`, "populations of the two spin states, P_↑ + P_↓ = 1"], [String.raw`\(F\)`, "preparation fidelity, the population in the target state"]],
how: ["Population leaves ↑ by pumping (R) and by relaxation (γ_s). It leaves ↓ only by relaxation (γ_s).", "In steady state the flows balance: (R + γ_s) P_↑ = γ_s P_↓.", "With P_↑ + P_↓ = 1, solve for P_↓.", "For R ≫ γ_s, F → 1. For R = 0, F = 1/2 (no preparation)."],
say: "Spin preparation fidelity is set by the competition between the optical pumping rate and the spin relaxation rate. High fidelity needs pumping much faster than relaxation.",
num: "F = 96 % ⟹ (x + 1)/(x + 2) = 0.96 ⟹ R/γ<sub>s</sub> ≈ <b>23</b> in this model<br>R/γ<sub>s</sub> = 100 ⟹ F ≈ <b>99.0 %</b><br>This is a simple rate model for intuition, not the model used in the paper.",
r(fig, ctl) {
  ctl.innerHTML = sl("lr", "R / γ_s (log scale)", -1, 3, 0.01, Math.log10(23)) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const x = Math.pow(10, +$("lr").value); $("lrv").textContent = x.toFixed(x < 10 ? 2 : 0);
    const F = (x + 1) / (x + 2);
    const ts = range(0, 3, 90), k = x + 2, Pd = ts.map(t => F + (0.5 - F) * Math.exp(-k * t / 3 * 1.5)), Pu = Pd.map(v => 1 - v);
    fig.innerHTML = svg(270, `<line x1="60" x2="400" y1="220" y2="220" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="220" stroke="var(--p)"/>${plot(60, 40, 340, 180, ts, Pd, 0, 3, 0, 1, "#378ADD", 2.5)}${plot(60, 40, 340, 180, ts, Pu, 0, 3, 0, 1, "#D85A30", 2.5)}<text class="ts" x="230" y="240" text-anchor="middle">time after the laser turns on (relative)</text><text class="ts" x="66" y="36">population</text><text class="ts" x="404" y="${220 - F * 180 + 4}">↓ ${(F * 100).toFixed(1)} %</text><text class="ts" x="404" y="${220 - (1 - F) * 180 + 4}">↑ ${((1 - F) * 100).toFixed(1)} %</text>
      <g class="c-gray"><rect x="470" y="70" width="170" height="120" rx="8" stroke-width="0.5"/></g><text class="th" x="555" y="110" text-anchor="middle">fidelity</text><text class="th" x="555" y="150" text-anchor="middle" style="font-size:26px">${(F * 100).toFixed(1)} %</text>`);
    $("ro").innerHTML = `<div><span>R / γ_s</span><b>${x.toFixed(1)}</b></div><div><span>F</span><b>${(F * 100).toFixed(2)} %</b></div>`;
  };
  $("lr").oninput = u; u();
}},

{s: "3. Time trace", t: "What the detector sees: fluorescence fading out",
intu: "Turn the laser on at t = 0. At first the dot cycles and the detector counts photons at the scattering rate. Every photon carries a small chance p of flipping the spin, so the signal decays exponentially as the population drains into the dark state. The decay time is the pumping time, about 1/p scattered photons. Drag the scattering rate and the flip probability. A faster scattering rate or a larger p gives faster pumping. The slider for scattering rate is limited by the lifetime: a two-level system cannot scatter faster than Γ/2.",
eq: String.raw`\[ I(t) = I_0\, e^{-t/\tau_p}, \qquad \tau_p = \frac{1}{p R_{\mathrm{sc}}} \]\[ R_{\mathrm{sc}} \le \frac{\Gamma}{2}\ (\text{saturation}) \]`,
sym: [[String.raw`\(I(t)\)`, "detected fluorescence after the laser turns on"], [String.raw`\(R_{\mathrm{sc}}\)`, "photon scattering rate while the transition is driven"], [String.raw`\(p\)`, "flip probability per scattered photon"], [String.raw`\(\tau_p\)`, "pumping time"], [String.raw`\(\Gamma\)`, "radiative decay rate, 1/τ"]],
how: ["While in |↑⟩, the dot scatters photons at rate R_sc.", "Each scattered photon flips the spin with probability p, so the flip rate is p R_sc.", "Population in |↑⟩, and thus the signal, decays as e^(−p R_sc t).", "A driven two-level system spends at most half its time excited, so R_sc ≤ Γ/2."],
say: "The fluorescence decays on the optical pumping time 1/(p R_sc). Observing that decay, and its recovery when a second laser repumps the other spin, is how spin pumping is demonstrated.",
num: "τ = 1 ns, saturated: R<sub>sc</sub> = Γ/2 = <b>5 × 10⁸ s⁻¹</b><br>p = 0.01 ⟹ τ<sub>p</sub> = 1/(5 × 10⁶ s⁻¹) = <b>200 ns</b><br>Photons scattered before dark: about <b>100</b>, only a fraction of which reach the detector.",
r(fig, ctl) {
  ctl.innerHTML = sl("rs", "Scattering rate R_sc (× 10⁸ s⁻¹)", 0.1, 5, 0.1, 5) + sl("pf", "Flip probability p", 0.002, 0.05, 0.001, 0.01) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const rs = +$("rs").value * 1e8, p = +$("pf").value; $("rsv").textContent = (rs / 1e8).toFixed(1); $("pfv").textContent = p.toFixed(3);
    const tp = 1 / (p * rs) * 1e9, tmax = 1000, ts = range(0, tmax, 120);
    fig.innerHTML = svg(260, `<line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="210" stroke="var(--p)"/><rect x="60" y="226" width="560" height="10" fill="#EF9F27" opacity="0.4"/><text class="ts" x="66" y="252">laser on from t = 0</text>${plot(60, 40, 560, 170, ts, ts.map(t => Math.exp(-t / tp)), 0, tmax, 0, 1, "#378ADD", 2.5)}${tp < tmax ? `<line x1="${60 + tp / tmax * 560}" x2="${60 + tp / tmax * 560}" y1="40" y2="210" stroke="var(--p)" stroke-dasharray="4 4"/><text class="ts" x="${64 + tp / tmax * 560}" y="56">τ_p</text>` : ""}<text class="ts" x="620" y="226" text-anchor="end">1000 ns</text><text class="ts" x="66" y="36">fluorescence</text>`);
    $("ro").innerHTML = `<div><span>pumping time τ_p</span><b>${tp.toFixed(0)} ns</b></div><div><span>photons before dark</span><b>${(1 / p).toFixed(0)}</b></div>`;
  };
  $("rs").oninput = u; $("pf").oninput = u; u();
}},

{s: "4. Full chain", t: "The whole chain, and where each chapter sits",
intu: "Click each block. The chain starts with the dot (Lessons 1 to 5), whose light enters a waveguide mode (Lesson 6). From there the light passes the devices your thesis designs: the polarization beam splitter that separates TE and TM, and the tapers and grating couplers that bring the light from the 200 nm strip off the chip. All of them were designed with the same inverse design method. Seeing the chain end to end is the best way to answer 'why does this thesis matter for quantum dots?'",
eq: String.raw`\[ \text{dot} \to \text{mode } (\beta) \to \text{PBS } (T, \mathrm{ER}) \to \text{taper} \]\[ \to \text{grating coupler } (\eta_{\mathrm{GC}}) \to \text{fiber or objective} \]`,
sym: [["Ch. 1", "motivation: the quantum dot and why polarization matters (these lessons)"], ["Ch. 2", "membrane, modes, mirror symmetry, simulation basics"], ["Ch. 3", "inverse design method (adjoint, Tidy3D)"], ["Ch. 4", "grating couplers with tapers"], ["Ch. 5", "polarization beam splitter (inverse-designed vs MMI)"]],
how: ["The dot emits into TE-like and TM-like modes according to its dipole (Lessons 5 and 6).", "The PBS separates the two families into different waveguides.", "Tapers widen the narrow strip to the grating width.", "The grating couplers scatter the light out of plane toward a fiber or objective."],
say: "My thesis designs the passive photonic chain for a GaAs quantum dot platform at 795 nm: couplers, tapers and a polarization splitter. The quantum dot physics in Chapter 1 explains why separating TE-like and TM-like light is useful. The emitter itself is not simulated.",
num: "Design wavelength <b>795 nm</b>, matched to the group's droplet-etched GaAs dot emission.<br>Platform: a suspended GaAs membrane with air above and below.",
r(fig, ctl) {
  let s = 0;
  const B = [["Quantum dot", "Lessons 1 to 5", "GaAs droplet-etched dot. Trion transitions with in-plane (strong) and z (weak) dipoles."], ["Waveguide mode", "Ch. 2, Lesson 6", "Narrow GaAs strip in air. Mid-plane symmetry separates TE-like and TM-like modes."], ["PBS", "Ch. 5", "Sends TE-like light to one port and TM-like light to the other. Inverse-designed compared with an MMI-based design."], ["Taper", "Ch. 4", "Widens the strip so the mode fills the grating. Appears where the grating design moves from 2D to 3D."], ["Grating coupler", "Ch. 4", "Scatters light out of the chip. Started from a uniform grating and then inverse-designed."], ["Inverse design", "Ch. 3", "Adjoint optimization in Tidy3D, the common method behind the devices."]];
  ctl.innerHTML = `<div class="row">${B.map((b, i) => `<button data-s="${i}">${b[0]}</button>`).join("")}</div>`;
  const u = () => {
    pick(ctl, "s", s);
    const xs = [20, 130, 240, 350, 460, 570];
    let g = ""; B.slice(0, 5).forEach((b, i) => { const x = xs[i] + 10; g += `<g class="${i === s ? "c-coral" : i === 0 ? "c-purple" : "c-blue"}"><rect x="${x}" y="60" width="92" height="56" rx="8" stroke-width="${i === s ? 1.6 : 0.6}"/></g><text class="th" x="${x+46}" y="86" text-anchor="middle" style="font-size:12px">${b[0]}</text><text class="ts" x="${x+46}" y="104" text-anchor="middle">${b[1].split(",")[0]}</text>${i < 4 ? `<line x1="${x+94}" x2="${x+116}" y1="88" y2="88" class="arr" marker-end="url(#ar)"/>` : ""}`; });
    g += `<g class="${s === 5 ? "c-coral" : "c-gray"}"><rect x="150" y="150" width="420" height="40" rx="8" stroke-width="${s === 5 ? 1.6 : 0.6}"/></g><text class="th" x="360" y="175" text-anchor="middle" style="font-size:12px">Inverse design method (Ch. 3), used for the devices above</text>`;
    fig.innerHTML = svg(280, `<text class="ts" x="20" y="40">light flows left to right</text>${g}<text class="th" x="340" y="226" text-anchor="middle">${B[s][0]} (${B[s][1]})</text><text class="ts" x="340" y="248" text-anchor="middle">${B[s][2].length > 95 ? B[s][2].slice(0, B[s][2].lastIndexOf(" ", 95)) : B[s][2]}</text><text class="ts" x="340" y="266" text-anchor="middle">${B[s][2].length > 95 ? B[s][2].slice(B[s][2].lastIndexOf(" ", 95) + 1) : ""}</text>`);
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { s = +b.dataset.s; u(); }); u();
}},

{s: "5. Safe to say?", t: "Defending Chapter 1: what is safe to say",
intu: "At a defense, the danger is not what you don't know. It is a sentence that claims more than your work or your references support. Click each statement to see whether it is safe, and what to say instead when it is not. These follow your own rule: keep novelty claims modest and remove anything you cannot explain.",
eq: String.raw`\[ \text{claim} \le (\text{what you simulated}) + (\text{what your references show}) \]`,
sym: [["safe", "supported by your results or a cited reference"], ["careful", "true only with a condition you must state"], ["avoid", "not supported, or wrong"]],
how: ["Ask: did I compute this, or does a cited paper show it?", "If it holds only for a dot at the mid-plane, or only in Faraday geometry, say the condition.", "If it is about the emitter, it comes from the references, not from your simulations.", "When unsure, describe what you did rather than what it enables."],
say: "Chapter 1 explains why polarization handling matters for a quantum dot spin–photon interface. The devices in this thesis are the passive photonic part of that interface. The emitter physics is taken from the cited literature.",
num: "Your defense: <b>18 November 2026</b>. Expect questions about the droplet-etched dots.",
r(fig, ctl) {
  const Q = [
    ["The PBS reads out the electron spin.", "avoid", "Both σ⁺ and σ⁻ are TE-like. The PBS separates strong (TE) from weak (TM) transitions. Spin readout needs the frequency selectivity from the Zeeman splitting."],
    ["In-plane dipoles couple only to TE-like modes.", "careful", "Only for a dot at the membrane mid-plane. Off the mid-plane, TE-like modes have some E_z."],
    ["795 nm was chosen because it matches the group's dot emission.", "safe", "Stated in the thesis and consistent with the group's droplet-etched GaAs dots."],
    ["Light-hole mixing makes the diagonal transitions weakly allowed, about 100 times slower.", "safe", "Supported by Warburton 2013 and the measurement in Javadi 2018. The factor 100 is for their dots."],
    ["My devices improve the spin preparation fidelity.", "avoid", "The thesis does not simulate the emitter or spin preparation. Say the devices handle the light that such an interface produces."],
    ["The grating couplers are apodized.", "avoid", "They started from a uniform grating and were inverse-designed. No apodization was done."],
    ["GaAs droplet-etched dots have small fine structure splitting.", "careful", "True as a general property reported in the literature. Do not quote a number for your group's dots unless you have a measured value."]
  ];
  let s = -1;
  const col = { safe: "good", careful: "", avoid: "badc" };
  ctl.innerHTML = `<div class="quiz"><div class="opts">${Q.map((q, i) => `<button data-q="${i}">${q[0]}</button>`).join("")}</div><div class="fb" id="sfb">Click a statement.</div></div>`;
  fig.innerHTML = svg(120, `<g class="c-teal"><rect x="40" y="30" width="180" height="56" rx="8" stroke-width="0.6"/></g><text class="th" x="130" y="63" text-anchor="middle">safe</text><g class="c-gray"><rect x="250" y="30" width="180" height="56" rx="8" stroke-width="0.6"/></g><text class="th" x="340" y="63" text-anchor="middle">careful: add the condition</text><g class="c-coral"><rect x="460" y="30" width="180" height="56" rx="8" stroke-width="0.6"/></g><text class="th" x="550" y="63" text-anchor="middle">avoid</text>`);
  ctl.querySelectorAll("button[data-q]").forEach(b => b.onclick = () => { s = +b.dataset.q; pick(ctl, "q", s); const q = Q[s]; $("sfb").innerHTML = `<span class="${col[q[1]]}" style="font-weight:600;text-transform:uppercase">${q[1]}.</span> ${q[2]}`; });
}},

{s: "6. Defense quiz", t: "Defense quiz: ten questions",
intu: "Ten questions in the style a committee might ask, covering all seven lessons. Pick an answer to see whether it is right and why. Your score is shown at the end. Repeat until you can answer each one and explain the reason out loud in one or two sentences.",
eq: String.raw`\[ \text{Lesson } 1 \to 2 \to 3 \to 4 \to 5 \to 6 \to 7 \]`,
sym: [["L1", "bands, effective mass, confinement"], ["L2", "heavy and light hole"], ["L3", "exciton, trion, biexciton"], ["L4", "dipole emission"], ["L5", "selection rules"], ["L6", "dipole to waveguide"], ["L7", "spin pumping"]],
how: ["Answer without looking at the lessons.", "Say the reason out loud.", "For each wrong answer, reopen that lesson's card.", "Repeat the day before the defense."],
say: "If a question goes beyond the thesis, say so plainly and answer from the physics you know, without claiming results you do not have.",
num: "Aim for 10 out of 10, each with a reason you can say in one breath.",
r(fig, ctl) {
  const Q = [
    ["Why do the dots emit at 795 nm and not at the bulk GaAs gap (816 nm)?", ["The AlGaAs emits it", "Confinement adds energy to the electron and hole", "Strain lowers the gap"], 1, "E_photon = E_g + E_e + E_h − E_X. Confinement raises it by about 41 meV (Lesson 1)."],
    ["What makes the heavy hole the ground hole state in a flat dot?", ["It has no spin", "It has the larger mass along z, so it is shifted least", "It contains Z"], 1, "E ∝ 1/(m*L²) along the squeezed direction (Lesson 2)."],
    ["Which orbital does the heavy hole lack?", ["X", "Y", "Z"], 2, "m_j = ±3/2 is built only from X ± iY, so its dipole is in-plane (Lesson 2)."],
    ["In Fig. 1.1, what is the excited state |↑↓, ⇑⟩?", ["A biexciton", "A negative trion whose spin is the hole's", "A dark exciton"], 1, "Two paired electrons and one heavy hole (Lesson 3)."],
    ["Why are the Faraday diagonal transitions forbidden for a pure heavy hole?", ["They need ΔM = ±2", "They are too slow", "The field blocks them"], 0, "A photon carries at most ±1 (Lesson 5)."],
    ["What makes the diagonals weakly allowed?", ["The magnetic field", "Light-hole admixture in the hole", "The waveguide"], 1, "The LH part brings Z with m_j = ±½ (Lessons 2 and 5)."],
    ["In Voigt geometry the four transitions are…", ["two circular, two forbidden", "four linear and equally strong", "all along z"], 1, "Spin quantized along x, verticals x, diagonals y (Lesson 5)."],
    ["At the membrane mid-plane, a z dipole couples to…", ["TE-like modes", "TM-like modes", "both equally"], 1, "Mirror symmetry: TE-like has E_z = 0 there (Lesson 6)."],
    ["Can the PBS separate σ⁺ from σ⁻?", ["Yes", "No, both are TE-like"], 1, "Both are in-plane dipoles (Lessons 5 and 6)."],
    ["Why does the dot go dark during spin pumping?", ["The laser turns off", "The spin flipped to the state the laser cannot excite", "The dot is destroyed"], 1, "The laser is resonant only with |↑⟩ (Lesson 7)."]
  ];
  let i = 0, score = 0, answered = false;
  const u = () => {
    if (i >= Q.length) { fig.innerHTML = svg(160, `<text class="th" x="340" y="70" text-anchor="middle" style="font-size:28px">${score} / ${Q.length}</text><text class="ts" x="340" y="104" text-anchor="middle">${score === Q.length ? "Full marks. Now explain each one out loud." : "Reopen the lessons for the ones you missed."}</text>`); ctl.innerHTML = `<div class="row"><button id="qr">Start again</button></div>`; $("qr").onclick = () => { i = 0; score = 0; u(); }; return; }
    const [q, o, c, why] = Q[i]; answered = false;
    fig.innerHTML = svg(70, `<text class="ts" x="20" y="28">question ${i + 1} of ${Q.length}</text><rect x="20" y="40" width="640" height="8" rx="4" fill="var(--b)"/><rect x="20" y="40" width="${640 * i / Q.length}" height="8" rx="4" fill="#1D9E75"/><text class="ts" x="660" y="28" text-anchor="end">score ${score}</text>`);
    ctl.innerHTML = `<div class="quiz"><p style="font-weight:600">${q}</p><div class="opts">${o.map((t, j) => `<button data-a="${j}">${t}</button>`).join("")}</div><div class="fb" id="qfb"></div><div class="row"><button id="qn" disabled>Next question</button></div></div>`;
    ctl.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => { if (answered) return; answered = true; const ok = +b.dataset.a === c; if (ok) score++; b.classList.add("on"); $("qfb").innerHTML = `<span class="${ok ? "good" : "badc"}">${ok ? "Correct." : "Not quite."}</span> ${why}`; $("qn").disabled = false; });
    $("qn").onclick = () => { i++; u(); };
  };
  u();
}}
],
summary: "With a field along z and a narrow laser on the σ⁺ transition, the trion cycles about 100 times and then a weak diagonal decay flips the spin into the state the laser cannot excite, so the dot goes dark. The preparation fidelity is set by the pumping rate against spin relaxation, 96 % in the reference experiment. Because the strong transitions are in-plane and couple to TE, and only the weak z part couples to TM, separating TE from TM is a meaningful operation on the dot's light. My thesis designs that passive chain, the PBS, tapers and grating couplers, at 795 nm for the group's GaAs dots. It does not model the emitter itself.",
sheet: [
[String.raw`\[ p = \frac{\gamma}{\Gamma + \gamma}, \quad \langle n \rangle = \frac{1}{p} \]`, "Flip probability and photons per flip"],
[String.raw`\[ F = \frac{R + \gamma_s}{R + 2\gamma_s} \]`, "Steady-state preparation fidelity (simple model)"],
[String.raw`\[ \tau_p = \frac{1}{p R_{\mathrm{sc}}}, \quad R_{\mathrm{sc}} \le \frac{\Gamma}{2} \]`, "Pumping time"],
[String.raw`\[ \eta_{\mathrm{total}} = \beta\, f_{\mathrm{dir}}\, \eta_{\mathrm{devices}}\, \eta_{\mathrm{GC}} \]`, "Collection chain"]],
consts: "Γ ≈ 100 γ and F = 96 % are from the reference experiment (Javadi 2018), not from your dots.",
sources: ["Javadi et al., Nature Nanotechnology 13, 398 (2018) (thesis ref.)", "Warburton, Nature Materials 12, 483 (2013) (thesis ref.)", "Appel et al., Phys. Rev. Lett. 126, 013602 (2021) (thesis ref.)", "Your Chapters 2 to 5 for the device chain"]
});
