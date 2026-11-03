(function () {
/* Journal Club, Weber et al. 2010. Lesson 1: what a qubit needs.
   Everything is computed live: Bloch sphere, Zeeman levels, Rabi formula, coherence budget, Boltzmann populations. */
const { tx, rc, ln, ci, fmt, sci, C } = JC;

addLesson("jc", "weber", {
level: "Basic",
id: "jc-weber-l1", title: "What a qubit needs", short: "1. What a qubit needs",
labels: { note: "Journal club note" },
big: String.raw`The paper opens with one sentence: a quantum computer needs qubits, and the NV center in diamond is special because a single one can be <b>initialized, manipulated and measured</b> with high fidelity <b>at room temperature</b>. This lesson builds those three words from zero. A qubit is a two-level system that can sit in any mix of its two states (card 1). An electron spin in a magnetic field is a natural two-level system with a splitting in the GHz range (card 2), and a resonant microwave turns it from one state to the other (card 3). It must keep its phase long enough for many such turns (card 4). And it must start in a known state, which heat alone can only do near absolute zero (card 5). Those five ideas are exactly what criteria D1 to D5 later ask of a defect.`,
cards: [
{ s: "1. Bit and qubit", t: "A qubit is an arrow on a sphere",
intu: String.raw`A classical bit is either 0 or 1, like a switch. A qubit can be 0, 1, or any mix of the two, and the mix has a phase. All possible qubit states fit on the surface of a sphere, the <b>Bloch sphere</b>: \(|0\rangle\) at the north pole, \(|1\rangle\) at the south pole, and every other point a superposition. The tilt \(\theta\) sets how much of each you have. The angle \(\phi\) around the equator is the phase, which you cannot see in a single measurement but which matters for every quantum operation. When you measure, the arrow is forced to the north or south pole at random, with probabilities set by \(\theta\). Move the sliders and press <b>Measure 100 times</b> to watch the statistics.`,
eq: String.raw`\[ |\psi\rangle = \cos\tfrac{\theta}{2}\,|0\rangle + e^{i\phi}\sin\tfrac{\theta}{2}\,|1\rangle \]\[ P_0 = \cos^2\tfrac{\theta}{2}, \qquad P_1 = \sin^2\tfrac{\theta}{2}, \qquad P_0 + P_1 = 1 \]`,
sym: [[String.raw`\(|0\rangle, |1\rangle\)`, "the two basis states, for a spin: down and up, or \\(m_s = 0\\) and \\(m_s = -1\\) for NV"], [String.raw`\(\theta\)`, "polar angle on the Bloch sphere, from 0 (north) to π (south)"], [String.raw`\(\phi\)`, "azimuthal angle, the relative phase of the two parts"], [String.raw`\(P_0, P_1\)`, "probability of reading 0 or 1 in a measurement"]],
how: [String.raw`Any normalized two-component state is \(a|0\rangle + b|1\rangle\) with \(|a|^2 + |b|^2 = 1\).`, String.raw`An overall phase has no physical meaning, so we can make \(a\) real. Then \(a = \cos(\theta/2)\) and \(b = e^{i\phi}\sin(\theta/2)\).`, String.raw`The half angles make \(\theta = \pi\) land on \(|1\rangle\), so the two poles are the two states.`, String.raw`The Born rule says the probability of each outcome is the square of its amplitude.`],
say: String.raw`A qubit state is a point on the Bloch sphere, with polar angle setting the measurement probabilities and azimuth setting the relative phase.`,
num: String.raw`θ = 90° puts the arrow on the equator: P₀ = P₁ = 0.5. θ = 60° gives P₀ = cos²30° = 0.75. With 100 measurements the count fluctuates by about \(\sqrt{100 \cdot 0.25} = 5\), so 75 ± 5 is what you should see.`,
r(fig, ctl) {
  ctl.innerHTML = sl("th", "Tilt θ (deg)", 0, 180, 1, 60) + sl("ph", "Phase φ (deg)", 0, 360, 5, 45) + `<div class="row"><button id="ms">Measure 100 times</button></div><div class="readout" id="ro"></div>`;
  let counts = null;
  const u = () => {
    const th = +$("th").value * Math.PI / 180, ph = +$("ph").value * Math.PI / 180;
    $("thv").textContent = $("th").value + "°"; $("phv").textContent = $("ph").value + "°";
    const cx = 190, cy = 175, R = 120, yaw = -0.55, pit = 0.32, P = p => JC.proj(p, yaw, pit, R, cx, cy);
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="var(--blue-bg)" fill-opacity="0.35" stroke="var(--b)"/>`;
    // equator, front solid and back dashed
    let fr = "", bk = "";
    for (let i = 0; i <= 72; i++) { const a = i / 72 * 2 * Math.PI, q = P([Math.cos(a), Math.sin(a), 0]), str = (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); if (q[2] > 0) { bk += str; fr += "M" + q[0].toFixed(1) + " " + q[1].toFixed(1); } else { fr += str; bk += "M" + q[0].toFixed(1) + " " + q[1].toFixed(1); } }
    s += `<path d="${bk}" fill="none" stroke="var(--b)" stroke-dasharray="3 3"/><path d="${fr}" fill="none" stroke="var(--p)"/>`;
    const ax = [[[0, 0, 1.25], "z"], [[1.25, 0, 0], "x"], [[0, 1.25, 0], "y"]];
    ax.forEach(([p, l]) => { const q = P(p), o = P([0, 0, 0]); s += ln(o[0], o[1], q[0], q[1], "var(--b)", 1, "2 2") + tx(q[0] + 4, q[1] - 2, l); });
    const n = P([0, 0, 1]), so = P([0, 0, -1]);
    s += ci(n[0], n[1], 4, C.blue) + tx(n[0] + 10, n[1] - 6, "|0⟩", "start", "th") + ci(so[0], so[1], 4, C.coral) + tx(so[0] + 10, so[1] + 16, "|1⟩", "start", "th");
    const v = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], q = P(v), o = P([0, 0, 0]), qz = P([0, 0, v[2]]), qe = P([v[0], v[1], 0]);
    s += ln(o[0], o[1], qe[0], qe[1], C.purple, 1, "3 3") + ln(qe[0], qe[1], q[0], q[1], C.purple, 1, "3 3");
    s += `<line x1="${o[0]}" y1="${o[1]}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${C.purple}" stroke-width="3.5" marker-end="url(#ar)"/>` + ci(q[0], q[1], 5, C.purple);
    s += ln(cx + R + 10, qz[1], cx + R + 26, qz[1], C.purple, 2) + tx(cx + R + 30, qz[1] + 4, "height = cos θ", "start");
    const P0 = Math.cos(th / 2) ** 2, P1 = 1 - P0, bx = 430, bw = 70, bh = 200, by = 60;
    s += tx(520, 34, "Measurement probabilities", "middle", "th");
    s += rc(bx, by + bh * (1 - P0), bw, bh * P0, C.blue, "none", 'fill-opacity="0.75"') + rc(bx + 110, by + bh * (1 - P1), bw, bh * P1, C.coral, "none", 'fill-opacity="0.75"');
    s += ln(bx - 10, by + bh, bx + 190, by + bh, "var(--p)") + tx(bx + bw / 2, by + bh + 18, "read 0", "middle") + tx(bx + 145, by + bh + 18, "read 1", "middle");
    s += tx(bx + bw / 2, by + bh * (1 - P0) - 6, fmt(P0, 2), "middle", "th") + tx(bx + 145, by + bh * (1 - P1) - 6, fmt(P1, 2), "middle", "th");
    if (counts) {
      s += tx(520, by + bh + 44, `100 shots: ${counts[0]} × 0 and ${counts[1]} × 1`, "middle", "th");
      for (let i = 0; i < 100; i++) s += ci(bx - 5 + (i % 20) * 10, by + bh + 58 + Math.floor(i / 20) * 10, 3.5, i < counts[0] ? C.blue : C.coral);
    } else s += tx(520, by + bh + 44, "press Measure to sample 100 outcomes", "middle");
    fig.innerHTML = svg(counts ? 370 : 310, s);
    $("ro").innerHTML = `<div><span>amplitude of |0⟩</span><b>${fmt(Math.cos(th / 2), 3)}</b></div><div><span>amplitude of |1⟩</span><b>${fmt(Math.sin(th / 2), 3)} e<sup>i${$("ph").value}°</sup></b></div><div><span>P₀</span><b>${fmt(P0, 3)}</b></div>`;
  };
  $("th").oninput = () => { counts = null; u(); }; $("ph").oninput = u;
  $("ms").onclick = () => { const th = +$("th").value * Math.PI / 180, P0 = Math.cos(th / 2) ** 2; let k = 0; for (let i = 0; i < 100; i++) if (Math.random() < P0) k++; counts = [k, 100 - k]; u(); };
  u();
}},

{ s: "2. Spin in a field", t: "An electron spin in a magnetic field is a two-level system",
intu: String.raw`An electron spin is a tiny magnet. In a magnetic field \(B\) the two orientations have different energies, and the gap grows linearly with \(B\): this is the <b>Zeeman effect</b>. For a free electron the gap corresponds to 28 GHz per tesla, so a lab magnet of 0.1 T gives about 2.8 GHz, a microwave frequency. That is why the paper talks about <b>electron spin resonance</b> and requires the splitting to sit in the radio frequency range (criterion D1). Switch to <b>spin 1 (NV)</b>: the NV center has three sublevels, and even at zero field the \(m_s = \pm 1\) pair sits 2.87 GHz above \(m_s = 0\). That built-in gap is the <b>zero-field splitting</b>, and the qubit is made from two of the three levels.`,
eq: String.raw`\[ \text{spin } \tfrac{1}{2}:\quad E_{\pm} = \pm\tfrac{1}{2} g\mu_B B, \qquad f = \frac{\Delta E}{h} = \frac{g\mu_B}{h}B = \gamma B \]\[ \text{spin 1 (NV)}:\quad \frac{E_{m_s}}{h} = D\,m_s^2 + \gamma B\,m_s, \qquad m_s \in \{-1, 0, +1\} \]`,
sym: [[String.raw`\(g\)`, "electron g factor, about 2.00 for NV and for a free electron"], [String.raw`\(\mu_B\)`, "Bohr magneton, 57.9 µeV per tesla"], [String.raw`\(\gamma\)`, "gyromagnetic ratio, \\(g\\mu_B/h\\) = 28.0 GHz/T"], [String.raw`\(D\)`, "zero-field splitting of the NV ground state, 2.87 GHz"], [String.raw`\(m_s\)`, "spin projection on the field axis"], [String.raw`\(B\)`, "magnetic field, here along the defect axis"]],
how: [String.raw`A magnetic moment \(\boldsymbol{\mu}\) in a field has energy \(-\boldsymbol{\mu}\cdot\mathbf{B}\).`, String.raw`For an electron \(\mu_z = -g\mu_B m_s\), so \(E = g\mu_B B m_s\), and the two values \(m_s = \pm\tfrac12\) are split by \(g\mu_B B\).`, String.raw`Dividing by \(h\) turns energy into the frequency of the photon that flips the spin: \(\gamma = g\mu_B/h = 28.0\) GHz/T.`, String.raw`For spin 1, the two unpaired electrons of NV also feel each other through the spin-spin interaction. Along the defect axis this adds \(D\,m_s^2\), which lifts \(\pm1\) above 0 even at \(B = 0\).`],
say: String.raw`A spin in a field has Zeeman-split sublevels, and for the NV spin triplet the zero-field splitting D = 2.87 GHz plus the Zeeman term γB set the microwave frequencies that drive the qubit.`,
num: String.raw`Free spin at 0.1 T: f = 28.0 × 0.1 = <b>2.80 GHz</b>, a wavelength of 10.7 cm. NV at B = 0: both transitions at <b>2.87 GHz</b>. At 10 mT they split to 2.87 ± 0.28 GHz = 2.59 and 3.15 GHz. In energy, 2.87 GHz is only <b>11.9 µeV</b>, tiny next to the 25.9 meV of thermal energy at room temperature.`,
r(fig, ctl) {
  let mode = 0;
  ctl.innerHTML = `<div class="row"><button data-m="0">spin ½ (free electron)</button><button data-m="1">spin 1 (NV)</button></div>` + sl("B", "Field B (mT)", 0, 150, 1, 50) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    pick(ctl, "m", mode);
    const B = +$("B").value, Bt = B / 1000; $("Bv").textContent = B + " mT";
    const F = JC.frame(70, 30, 360, 250, { xmin: 0, xmax: 150, ymin: mode ? -2.5 : -2.5, ymax: mode ? 7.5 : 2.5, xt: [0, 50, 100, 150], yt: mode ? [-2, 0, 2, 4, 6] : [-2, -1, 0, 1, 2], xl: "B (mT)", yl: "E / h (GHz)", grid: true });
    let s = F.s; const bs = range(0, 150, 151);
    const lev = mode ? [[1, C.coral, "m_s = +1"], [0, C.blue, "m_s = 0"], [-1, C.teal, "m_s = −1"]] : [[0.5, C.coral, "up, +½"], [-0.5, C.blue, "down, −½"]];
    const E = (m, b) => (mode ? JC.D_NV * m * m : 0) + JC.gamma * b / 1000 * m;
    lev.forEach(([m, col, lab]) => { s += JC.path(F, bs, bs.map(b => E(m, b)), col, 2.5); s += tx(F.X(150) + 6, F.Y(E(m, 150)) + 4, lab, "start"); });
    s += ln(F.X(B), 30, F.X(B), 280, "var(--p)", 1, "4 3");
    const tr = mode ? [[0, 1], [0, -1]] : [[-0.5, 0.5]];
    let fs = [];
    tr.forEach(([a, b], i) => { const f = Math.abs(E(b, B) - E(a, B)); fs.push(f); const xx = F.X(B) + 10 + i * 18; s += `<line x1="${xx}" y1="${F.Y(E(a, B))}" x2="${xx}" y2="${F.Y(E(b, B))}" stroke="${C.purple}" stroke-width="2.5" marker-end="url(#ar)" marker-start="url(#ar)"/>`; });
    // spectrum on the right
    const G = JC.frame(500, 30, 150, 250, { xmin: 0, xmax: 1, ymin: mode ? -2.5 : -2.5, ymax: mode ? 7.5 : 2.5 });
    s += tx(575, 22, "resonance lines", "middle", "th");
    fs.forEach((f, i) => { s += ln(500, G.Y(f), 650, G.Y(f), C.purple, 3) + tx(575, G.Y(f) - 6, fmt(f, 3) + " GHz", "middle", "th"); });
    s += tx(575, 300, "frequencies that flip the qubit", "middle");
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = fs.map((f, i) => `<div><span>${mode ? (i ? "0 ↔ −1" : "0 ↔ +1") : "down ↔ up"}</span><b>${fmt(f, 3)} GHz</b></div>`).join("") + `<div><span>energy of lowest line</span><b>${fmt(Math.min(...fs) * 4.1357, 2)} µeV</b></div>`;
  };
  ctl.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { mode = +b.dataset.m; u(); });
  $("B").oninput = u; u();
}},

{ s: "3. Rotating with microwaves", t: "A resonant microwave flips the spin: Rabi oscillations",
intu: String.raw`To <b>manipulate</b> the qubit you shine a microwave at the resonance frequency of card 2. The spin does not jump. It rotates smoothly from \(|0\rangle\) to \(|1\rangle\) and back, and the probability of finding it in \(|1\rangle\) oscillates in time. These are <b>Rabi oscillations</b>. The rate \(\Omega\) grows with microwave power. A pulse that lasts half a period is a <b>π pulse</b>, a NOT gate. Half of that, a π/2 pulse, makes an equal superposition. If the microwave is off resonance by \(\Delta\), the oscillation gets faster but never reaches full contrast. Press Play to watch the arrow and the probability evolve together.`,
eq: String.raw`\[ P_1(t) = \frac{\Omega^2}{\Omega^2 + \Delta^2}\,\sin^2\!\left(\frac{\sqrt{\Omega^2 + \Delta^2}}{2}\,t\right) \]\[ t_\pi = \frac{\pi}{\Omega} = \frac{1}{2 f_R}, \qquad \Omega = 2\pi f_R \]`,
sym: [[String.raw`\(\Omega\)`, "Rabi angular frequency, proportional to the microwave magnetic field amplitude"], [String.raw`\(f_R\)`, "Rabi frequency in Hz"], [String.raw`\(\Delta\)`, "detuning, microwave frequency minus spin resonance frequency (angular)"], [String.raw`\(t_\pi\)`, "π pulse time, the duration of a NOT gate"]],
how: [String.raw`In a frame rotating with the microwave, the spin sees a static effective field with a transverse part \(\Omega\) and a longitudinal part \(\Delta\).`, String.raw`The spin precesses around that effective field at the rate \(\sqrt{\Omega^2 + \Delta^2}\).`, String.raw`On resonance the axis lies in the equator, so the arrow sweeps through both poles: full contrast.`, String.raw`Off resonance the axis tilts, so the arrow never reaches the south pole. The maximum of \(P_1\) is \(\Omega^2/(\Omega^2 + \Delta^2)\).`],
say: String.raw`A resonant microwave drives Rabi oscillations of the spin at a rate set by the drive amplitude, and a π pulse of length π/Ω acts as a NOT gate.`,
num: String.raw`The paper cites manipulation rates above <b>200 MHz</b> for NV. Then \(t_\pi = 1/(2 \times 200\,\text{MHz}) = 2.5\) ns. At a more typical lab Rabi frequency of 10 MHz, \(t_\pi = 50\) ns.`,
r(fig, ctl) {
  ctl.innerHTML = sl("fr", "Rabi frequency f_R (MHz)", 2, 50, 1, 10) + sl("dt", "Detuning (MHz)", -40, 40, 1, 0);
  let tt = 0;
  const draw = () => {
    const fr = +$("fr").value, de = +$("dt").value; $("frv").textContent = fr + " MHz"; $("dtv").textContent = de + " MHz";
    const W = Math.hypot(fr, de), Tmax = 400; // ns
    const P = t => (fr * fr / (W * W)) * Math.sin(Math.PI * W * t / 1000) ** 2;
    const F = JC.frame(300, 30, 350, 210, { xmin: 0, xmax: Tmax, ymin: 0, ymax: 1, xt: [0, 100, 200, 300, 400], yt: [0, 0.5, 1], xl: "time (ns)", yl: "P₁", grid: true });
    let s = F.s; const ts = range(0, Tmax, 400);
    s += JC.path(F, ts, ts.map(P), C.coral, 2.5);
    const tp = 1000 / (2 * fr); if (tp < Tmax) s += ln(F.X(tp), 30, F.X(tp), 240, C.purple, 1.5, "4 3") + tx(F.X(tp) + 4, 48, "π pulse " + fmt(tp, 1) + " ns", "start");
    const t = tt % Tmax; s += ci(F.X(t), F.Y(P(t)), 6, C.coral, "#fff");
    // Bloch side view: rotate about axis (Omega, 0, Delta)
    const cx = 115, cy = 140, R = 85;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="var(--blue-bg)" fill-opacity="0.35" stroke="var(--b)"/>` + `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="22" fill="none" stroke="var(--b)" stroke-dasharray="3 3"/>`;
    s += tx(cx, cy - R - 8, "|0⟩", "middle", "th") + tx(cx, cy + R + 18, "|1⟩", "middle", "th");
    const n = [fr / W, 0, -de / W], ang = 2 * Math.PI * W * t / 1000; // rotate (0,0,1) about n
    const v0 = [0, 0, 1], d = n[0] * v0[0] + n[1] * v0[1] + n[2] * v0[2];
    const cr = [n[1] * v0[2] - n[2] * v0[1], n[2] * v0[0] - n[0] * v0[2], n[0] * v0[1] - n[1] * v0[0]];
    const v = [0, 1, 2].map(i => v0[i] * Math.cos(ang) + cr[i] * Math.sin(ang) + n[i] * d * (1 - Math.cos(ang)));
    const pr = p => JC.proj(p, -0.5, 0.25, R, cx, cy);
    const a = pr(n), o = pr([0, 0, 0]), q = pr(v);
    s += `<line x1="${o[0]}" y1="${o[1]}" x2="${a[0].toFixed(1)}" y2="${a[1].toFixed(1)}" stroke="${C.teal}" stroke-width="2" stroke-dasharray="5 3"/>` + tx(a[0] + 6, a[1], "drive axis", "start");
    s += `<line x1="${o[0]}" y1="${o[1]}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${C.purple}" stroke-width="3.5" marker-end="url(#ar)"/>`;
    s += tx(cx, 275, `max P₁ = ${fmt(fr * fr / (W * W), 2)}`, "middle", "th");
    fig.innerHTML = svg(290, s);
  };
  $("fr").oninput = draw; $("dt").oninput = draw;
  JC.player(ctl, t => { tt = t * 40; draw(); });
}},

{ s: "4. Coherence time", t: "Coherence: how many gates fit before the qubit forgets",
intu: String.raw`A superposition is fragile. Its phase \(\phi\) slowly drifts in a random way because the spin feels fluctuating magnetic fields from its surroundings, mostly other spins in the crystal. After a time \(T_2\), the <b>coherence time</b>, the phase is lost and the qubit is just a classical coin. What matters for computing is the ratio of \(T_2\) to the time of one gate. Error correction schemes need roughly \(10^4\) gates or more inside one coherence time. The paper points out that NV at room temperature reaches \(T_2\) = 1.8 ms with gates faster than 200 MHz, which puts it close to that regime. Slide \(T_2\) and the gate speed and watch the budget bar.`,
eq: String.raw`\[ C(t) = e^{-t/T_2}, \qquad N_{\text{gates}} \approx \frac{T_2}{t_{\text{gate}}} \approx T_2\, f_R \]`,
sym: [[String.raw`\(C(t)\)`, "coherence: the size of the superposition's phase memory, 1 at the start"], [String.raw`\(T_2\)`, "spin coherence time"], [String.raw`\(t_{\text{gate}}\)`, "time for one operation, of order one Rabi period"], [String.raw`\(N_{\text{gates}}\)`, "number of operations that fit inside one coherence time"]],
how: [String.raw`Each nuclear spin nearby adds a tiny random field, so the precession frequency of the qubit jitters.`, String.raw`Averaged over that jitter, the phases of many repetitions spread out and their average, the coherence, decays.`, String.raw`A spin echo (a π pulse in the middle) cancels the static part of the jitter, and the remaining decay time is \(T_2\).`, String.raw`Fewer magnetic neighbors means a longer \(T_2\). That is why the paper wants hosts made of nuclear-spin-free isotopes (criterion H4).`],
say: String.raw`T2 is the time over which a superposition keeps its phase, and the useful figure of merit is the number of gates that fit inside it.`,
num: String.raw`NV numbers from the paper: \(T_2 = 1.8\) ms in isotopically purified diamond, \(f_R \gt 200\) MHz. Then \(N \approx 1.8 \times 10^{-3} \times 2 \times 10^8 = \mathbf{3.6 \times 10^5}\). A quantum dot spin with \(T_2\) around 1 µs and 1 GHz gates gives about \(10^3\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("t2", "T₂ (log scale)", -6, -2, 0.05, Math.log10(1.8e-3)) + sl("fr", "Gate speed f_R (MHz, log)", 0, 3, 0.05, Math.log10(200)) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const T2 = Math.pow(10, +$("t2").value), fr = Math.pow(10, +$("fr").value) * 1e6;
    $("t2v").textContent = T2 >= 1e-3 ? fmt(T2 * 1e3, 2) + " ms" : fmt(T2 * 1e6, 1) + " µs"; $("frv").textContent = fmt(fr / 1e6, 0) + " MHz";
    const F = JC.frame(70, 30, 560, 150, { xmin: 0, xmax: 3, ymin: -1, ymax: 1, xt: [0, 1, 2, 3], xf: v => v + " T₂", yt: [-1, 0, 1], xl: "time", yl: "phase memory", grid: true });
    let s = F.s; const xs = range(0, 3, 600);
    s += JC.path(F, xs, xs.map(x => Math.exp(-x) * Math.cos(2 * Math.PI * 6 * x)), C.purple, 1.6);
    s += JC.path(F, xs, xs.map(x => Math.exp(-x)), C.coral, 2, "5 3") + JC.path(F, xs, xs.map(x => -Math.exp(-x)), C.coral, 2, "5 3");
    s += tx(F.X(1) + 4, F.Y(Math.exp(-1)) - 6, "e⁻¹ at T₂", "start");
    const N = T2 * fr, G = JC.frame(70, 250, 560, 40, { xmin: 0, xmax: 7, ymin: 0, ymax: 1, xt: [0, 1, 2, 3, 4, 5, 6, 7], xf: v => "10" + "⁰¹²³⁴⁵⁶⁷"[v] });
    s += G.s + rc(G.X(4), 250, G.X(7) - G.X(4), 40, "var(--teal-bg)") + tx(G.X(5.5), 244, "error correction regime (≳ 10⁴)", "middle");
    s += rc(70, 258, Math.max(0, G.X(Math.min(7, Math.log10(Math.max(N, 1)))) - 70), 24, C.purple, "none", 'fill-opacity="0.8"');
    s += ln(G.X(Math.log10(3.6e5)), 246, G.X(Math.log10(3.6e5)), 294, C.coral, 2) + tx(G.X(Math.log10(3.6e5)), 316, "NV (paper)", "middle");
    s += tx(70, 236, "gates per coherence time", "start", "th");
    fig.innerHTML = svg(330, s);
    $("ro").innerHTML = `<div><span>gate time 1/f_R</span><b>${fmt(1e9 / fr, 1)} ns</b></div><div><span>gates in T₂</span><b>${sci(N, 1)}</b></div>`;
  };
  $("t2").oninput = u; $("fr").oninput = u; u();
}},

{ s: "5. Starting state", t: "Initialization: heat needs millikelvin, light does not",
intu: String.raw`Before any computation the qubit must start in a known state. The simple way is to wait for thermal equilibrium: the lower level is more populated by the Boltzmann factor. But a GHz splitting is tiny in energy. At room temperature both levels are almost equally full, so the qubit starts as a coin flip. You need about 0.03 K to get 99 % in the lower state at 2.87 GHz. This is why the paper says most solid state qubits that initialize thermally need <b>cryogenic</b> temperatures. NV avoids this. A green laser <b>optically pumps</b> it into \(m_s = 0\) with high probability at any temperature, using the trick explained in lesson 3. The blue dots are 100 spins in thermal equilibrium, the dashed line is what optical pumping gives.`,
eq: String.raw`\[ \frac{p_1}{p_0} = e^{-hf/k_B T}, \qquad p_0 = \frac{1}{1 + e^{-hf/k_B T}} \]\[ T_{99\%} = \frac{hf}{k_B \ln 99} \]`,
sym: [[String.raw`\(p_0, p_1\)`, "thermal populations of the lower and upper qubit level"], [String.raw`\(f\)`, "qubit splitting as a frequency"], [String.raw`\(k_B T\)`, "thermal energy, 25.9 meV at 300 K"], [String.raw`\(T_{99\%}\)`, "temperature at which 99 % of spins are in the lower level"]],
how: [String.raw`In equilibrium each level is populated in proportion to \(e^{-E/k_B T}\).`, String.raw`For two levels the populations add to 1, which gives the expression for \(p_0\).`, String.raw`Set \(p_0 = 0.99\): then \(e^{hf/k_BT} = 99\), so \(T = hf/(k_B \ln 99)\).`, String.raw`Optical pumping is not equilibrium. A cycle that prefers to end in one state fills that state no matter how warm the crystal is.`],
say: String.raw`Because a GHz spin splitting is far below \(k_BT\) at room temperature, thermal initialization needs millikelvin temperatures, while NV is initialized optically by spin-selective pumping.`,
num: String.raw`\(hf/k_B\) for 2.87 GHz is <b>0.138 K</b>. At 300 K, \(p_0 = 0.50011\). At 4 K, 0.5086. At 30 mK, 0.990. NV optical pumping reaches roughly 80 to 90 % in \(m_s = 0\) at room temperature (lesson 3).`,
r(fig, ctl) {
  ctl.innerHTML = sl("f", "Splitting f (GHz)", 0.5, 30, 0.01, 2.87) + sl("T", "Temperature (log)", -2.3, 2.5, 0.01, 2.477) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const f = +$("f").value, T = Math.pow(10, +$("T").value); $("fv").textContent = fmt(f, 2) + " GHz"; $("Tv").textContent = T < 1 ? fmt(T * 1000, 0) + " mK" : fmt(T, T < 10 ? 2 : 0) + " K";
    const x = JC.h_eVs * f * 1e9 / (JC.kB * T), p0 = 1 / (1 + Math.exp(-x));
    const F = JC.frame(70, 30, 330, 220, { xmin: -2.3, xmax: 2.5, ymin: 0.5, ymax: 1, xt: [-2, -1, 0, 1, 2], xf: v => ["10 mK", "0.1 K", "1 K", "10 K", "100 K"][v + 2], yt: [0.5, 0.6, 0.7, 0.8, 0.9, 1], xl: "temperature", yl: "p₀ (lower level)", grid: true });
    let s = F.s; const ls = range(-2.3, 2.5, 200);
    s += JC.path(F, ls, ls.map(l => 1 / (1 + Math.exp(-JC.h_eVs * f * 1e9 / (JC.kB * Math.pow(10, l))))), C.blue, 2.5);
    s += ln(70, F.Y(0.85), 400, F.Y(0.85), C.coral, 2, "6 4") + tx(395, F.Y(0.85) - 6, "optical pumping (NV, any T)", "end");
    s += ci(F.X(+$("T").value), F.Y(p0), 6, C.blue, "#fff");
    // 100 spins
    let k = Math.round(p0 * 100);
    s += tx(545, 34, "100 spins in equilibrium", "middle", "th");
    for (let i = 0; i < 100; i++) { const xx = 460 + (i % 10) * 17, yy = 54 + Math.floor(i / 10) * 19; s += i < k ? JC.up(xx, yy, C.blue) : JC.dn(xx, yy, C.coral); }
    s += tx(545, 258, `${k} in the lower level, ${100 - k} in the upper`, "middle");
    fig.innerHTML = svg(290, s);
    $("ro").innerHTML = `<div><span>hf / k_B</span><b>${fmt(JC.h_eVs * f * 1e9 / JC.kB * 1000, 1)} mK</b></div><div><span>p₀</span><b>${fmt(p0, 5)}</b></div><div><span>T for 99 %</span><b>${fmt(JC.h_eVs * f * 1e9 / (JC.kB * Math.log(99)) * 1000, 1)} mK</b></div>`;
  };
  $("f").oninput = u; $("T").oninput = u; u();
}}
],
summary: String.raw`A qubit is a two-level system whose state is a point on the Bloch sphere. An electron spin in a magnetic field is a natural qubit with a GHz splitting, γ = 28 GHz/T, and the NV spin triplet adds a zero-field splitting of 2.87 GHz. Resonant microwaves rotate it (Rabi oscillations, a π pulse is a NOT gate). It must keep its phase for a time T₂ long compared with one gate, and NV reaches about 3.6 × 10⁵ gates per T₂. Finally it must start in a known state. Heat can do this only at millikelvin temperatures for a GHz splitting, which is why NV's optical initialization at room temperature is so valuable.`,
sheet: [
[String.raw`\[ |\psi\rangle = \cos\tfrac{\theta}{2}|0\rangle + e^{i\phi}\sin\tfrac{\theta}{2}|1\rangle \]`, "Bloch sphere state"],
[String.raw`\[ f = \gamma B, \qquad \gamma = g\mu_B/h = 28.0\ \text{GHz/T} \]`, "Zeeman splitting of a spin ½"],
[String.raw`\[ E_{m_s}/h = D m_s^2 + \gamma B m_s, \quad D = 2.87\ \text{GHz} \]`, "NV ground state triplet"],
[String.raw`\[ P_1 = \frac{\Omega^2}{\Omega^2+\Delta^2}\sin^2\!\left(\tfrac{1}{2}\sqrt{\Omega^2+\Delta^2}\,t\right), \quad t_\pi = \pi/\Omega \]`, "Rabi oscillation"],
[String.raw`\[ N_{\text{gates}} \approx T_2 f_R \]`, "Coherence budget"],
[String.raw`\[ p_0 = \left(1 + e^{-hf/k_BT}\right)^{-1} \]`, "Thermal initialization of a two-level system"]],
consts: String.raw`\(h = 4.136 \times 10^{-15}\) eV s, \(k_B = 8.617 \times 10^{-5}\) eV/K, \(\gamma = 28.0\) GHz/T, \(D_{\text{NV}} = 2.87\) GHz`,
sources: ["Weber et al., PNAS 107, 8513 (2010), introduction (the paper of this series)", "DiVincenzo, Fortschr. Phys. 48, 771 (2000), the criteria for a physical qubit (paper ref. 10)", "Balasubramanian et al., Nat. Mater. 8, 383 (2009), T₂ = 1.8 ms in isotopically engineered diamond (paper ref. 9)", "Fuchs et al., Science 326, 1520 (2009), GHz driving of a single NV spin (paper ref. 11)"]
});
})();
