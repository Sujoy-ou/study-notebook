addLesson("thesis", "lec", {
level: "Forward", num: "Lesson 8",
id: "thesis-lec-l8", title: "From time to frequency", short: "8. Time to frequency",
big: String.raw`The run happens in time, but the figure of merit is defined per wavelength. The bridge is the Fourier transform. During the run, each monitor keeps a running sum for every one of the 101 frequencies: at each step it adds the current field times a rotating phase \(e^{i\omega t}\). When the run ends, each sum is the field at that frequency. One pulse therefore gives all 101 wavelengths at once. Because the materials are linear and do not change in time, each of these frequency fields is exactly the solution of Maxwell's equations at that frequency, which is what the adjoint theory uses.`,
bridge: "Thesis Ch. 2 Sec. 2.6: one pulse gives the whole band by Fourier transforming the recorded fields. Tidy3D also divides by the spectrum of the source, so every wavelength is normalized to 1 W injected.",
cards: [
{s: "1. The running sum", t: "Each monitor keeps one sum per frequency",
intu: String.raw`A 1D run: the left plot is the field recorded at a monitor, step by step. Press Play. For the chosen wavelength, every new sample is multiplied by \(e^{i\omega t}\) and added to a running sum, the arrow on the right. When the pulse has passed, the arrow stops moving: its length and angle are the amplitude and phase of the field at that wavelength. Change the wavelength: same recording, different sum.`,
eq: String.raw`\[ \mathbf{E}(\mathbf{r},\omega) = \sum_n \mathbf{E}(\mathbf{r}, n\Delta t)\; e^{i\omega n\Delta t}\;\Delta t \]`,
sym: [[String.raw`\(\mathbf{E}(\mathbf{r}, n\Delta t)\)`, "field at the monitor at step n"], [String.raw`\(\mathbf{E}(\mathbf{r},\omega)\)`, "complex field at frequency ω: amplitude and phase"]],
how: ["At each step, for each requested frequency: multiply the field by the rotating phase.", "Add it to that frequency's sum.", "Nothing in time is stored, only the sums.", "After the run, each sum is the field at its frequency."],
say: "Each monitor keeps a running Fourier sum for every requested frequency, so when the run ends it holds the complex field at all 101 wavelengths.",
num: "Toy: λ = 30 to 56 cells, pulse centred at 40 cells.",
r(fig, ctl) {
  ctl.innerHTML = sl("wl", "Wavelength (cells)", 30, 56, 1, 40) + `<div class="row"><button id="pl">Play</button></div>`;
  const N = 400, sim = new LC.FD1(N), probe = 300, sig = [];
  for (let t = 0; t < 1400; t++) { sim.step(60, n => LC.gauss(n, 140, 28) * Math.sin(2 * Math.PI * 0.5 * n / 40)); sig.push(sim.ez[probe]); }
  let tt = 1400, mxs = 0;
  for (let l = 30; l <= 56; l++) { const w = 2 * Math.PI * 0.5 / l; let a = 0, b = 0; sig.forEach((v, t) => { a += v * Math.cos(w * t); b += v * Math.sin(w * t); }); mxs = Math.max(mxs, Math.hypot(a, b)); }
  const draw = () => {
    const lam = +$("wl").value, w = 2 * Math.PI * 0.5 / lam; $("wlv").textContent = lam;
    let re = 0, im = 0, path = "M 520 120"; const sc = 95 / mxs;
    for (let t = 0; t < tt; t++) { re += sig[t] * Math.cos(w * t); im += sig[t] * Math.sin(w * t); if (t % 4 === 0) path += ` L ${(520 + re * sc).toFixed(1)} ${(120 - im * sc).toFixed(1)}`; }
    let s = C3.frame(30, 30, 330, 170, 0, 1400, -1, 1, [0, 700, 1400], [], "time step", "") + plot(30, 30, 330, 170, [...Array(tt).keys()], sig.slice(0, tt), 0, 1400, -1, 1, "var(--blue)", 1.4);
    s += `<line x1="420" x2="620" y1="120" y2="120" stroke="var(--b)"/><line x1="520" x2="520" y1="20" y2="220" stroke="var(--b)"/><text class="ts" x="624" y="124">Re</text><text class="ts" x="524" y="18">Im</text>`;
    s += `<path d="${path}" fill="none" stroke="var(--teal)" stroke-width="1" opacity="0.6"/>` + arrow(520, 120, 520 + re * sc, 120 - im * sc, "var(--coral)", 2.5);
    s += `<text class="ts" x="520" y="244" text-anchor="middle">running sum at λ = ${lam} cells</text>`;
    fig.innerHTML = svg(252, s);
  };
  $("wl").oninput = draw;
  $("pl").onclick = () => { tt = 0; anim(() => { tt = Math.min(1400, tt + 12); draw(); if (tt >= 1400) stopAnim(); }); };
  draw();
}},
{s: "2. All 101 at once", t: "One pulse, every wavelength",
intu: String.raw`A real 1D FDTD run: a short pulse hits a slab (index 2), and a monitor behind it keeps the running sums for 27 wavelengths. Divided by an empty reference run (which is what the source normalization does), the sums give the transmission at every wavelength (dots), from one run. The line is the exact textbook answer for a slab. The PBS is the same, with 101 wavelengths and mode monitors on the two ports.`,
eq: String.raw`\[ T(\omega) = \frac{|E_\mathrm{device}(\omega)|^2}{|E_\mathrm{source}(\omega)|^2} \]`,
sym: [[String.raw`\(E_\mathrm{source}(\omega)\)`, "what the pulse puts in at each frequency"], [String.raw`\(T(\omega)\)`, "transmission at each wavelength"]],
how: ["Run once with a pulse that covers the band.", "Read the running sums at the monitor.", "Divide by the source spectrum at each frequency."],
say: "One FDTD run with a broadband pulse, divided by the source spectrum, gives the transmission at every wavelength in the band.",
num: "Here: 520 cells, 4200 steps, 27 wavelengths. Small differences from the exact line come from the grid.",
r(fig, ctl) {
  ctl.innerHTML = sl("sd", "Slab thickness (cells)", 10, 40, 1, 24) + `<div class="row"><button id="run">Run FDTD</button></div><div class="readout" id="ro"></div>`;
  const lams = range(30, 56, 27);
  const go = () => {
    const d = +$("sd").value; $("sdv").textContent = d;
    const r = LC.pulseT({ lams, n: 2, d }), fine = range(30, 56, 200), X = C3.X(70, 560, 30, 56), Y = C3.Y(20, 180, 0, 1.05);
    let s = C3.frame(70, 20, 560, 180, 30, 56, 0, 1.05, [30, 35, 40, 45, 50, 55], [0, 0.5, 1], "wavelength (cells)", "transmission T") + plot(70, 20, 560, 180, fine, fine.map(l => LC.slabT(2, d, l)), 30, 56, 0, 1.05, "var(--blue)", 2);
    r.T.forEach((v, k) => s += `<circle cx="${X(lams[k])}" cy="${Y(Math.min(v, 1.05))}" r="4" fill="var(--coral)"/>`);
    s += C3.legend(90, 250, [["exact slab formula", "var(--blue)"]]) + `<circle cx="300" cy="246" r="4" fill="var(--coral)"/><text class="ts" x="310" y="250">FDTD, 27 points from one pulse</text>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>runs</span><b>1</b></div><div><span>wavelengths</span><b>27</b></div>`;
  };
  $("sd").oninput = () => { $("sdv").textContent = $("sd").value; }; $("run").onclick = go; go();
}},
{s: "3. Why time domain", t: "Why FDTD and not a frequency-domain solver",
intu: String.raw`A frequency-domain solver would solve the big system \(A(\omega)\mathbf{x} = \mathbf{b}\) once per wavelength. For the PBS gradient that is a forward and an adjoint solve at each of the 101 wavelengths, per input. Move the slider. FDTD needs one forward and one adjoint run, because each run already contains every wavelength. FDTD also needs no matrix: its memory grows only in proportion to the number of cells, and it runs well on GPUs. A frequency-domain solver is still better for a single wavelength in a small 2D problem, for strongly dispersive materials, and for very sharp resonances.`,
eq: String.raw`\[ \text{frequency domain: } 2N_\omega \text{ solves} \qquad \text{FDTD: } 2 \text{ runs} \qquad (\text{per input, per step}) \]`,
sym: [[String.raw`\(N_\omega\)`, "number of wavelengths, 101 for the PBS"]],
how: ["Frequency domain: one large linear solve per wavelength.", "FDTD: local updates, all wavelengths from one pulse.", "For a band-averaged figure of merit, the difference is a factor of about 100."],
say: "The PBS is 3D and broadband, so FDTD wins: one forward and one adjoint run give all 101 wavelengths, instead of 202 frequency-domain solves per input.",
num: "PBS: 101 wavelengths, 2 inputs. Frequency domain: 404 solves per step. FDTD: 4 runs per step.",
r(fig, ctl) {
  ctl.innerHTML = sl("nw", "Wavelengths in the band", 1, 101, 1, 101);
  const u = () => {
    const n = +$("nw").value; $("nwv").textContent = n;
    const W = 400, fw = 2 * n / 202 * W, tw = Math.max(2 / 202 * W, 4);
    let s = `<text class="th" x="20" y="44">frequency domain</text><rect x="170" y="26" width="${fw}" height="28" rx="4" fill="var(--coral)"/><text class="t" x="${178 + fw}" y="46">${2 * n} solves</text>`;
    s += `<text class="th" x="20" y="104">FDTD</text><rect x="170" y="86" width="${tw}" height="28" rx="4" fill="var(--teal)"/><text class="t" x="${178 + tw}" y="106">2 runs</text>`;
    s += `<text class="ts" x="20" y="150">forward + adjoint, for one input, one optimization step</text>`;
    fig.innerHTML = svg(165, s);
  };
  $("nw").oninput = u; u();
}}
],
summary: String.raw`During the run every monitor keeps a running Fourier sum for each of the 101 frequencies. After the run, divided by the source spectrum, these are the fields at every wavelength from one pulse. Because the materials are linear and constant in time, they are exactly the frequency-domain solutions. That is why FDTD fits the PBS: one forward and one adjoint run cover the whole band, instead of two solves per wavelength.`,
sheet: [
[String.raw`\[ \mathbf{E}(\omega) = \sum_n \mathbf{E}^{n}\, e^{i\omega n\Delta t}\,\Delta t \]`, "Running Fourier sum at a monitor"],
[String.raw`\[ 2N_\omega \text{ solves} \;\text{ vs }\; 2 \text{ runs} \]`, "Frequency domain versus FDTD, per input and step"]],
consts: "1D runs: normalized units, Courant number 0.5.",
sources: ["Taflove and Hagness, Computational Electrodynamics, 3rd ed. (2005), Ch. 5 (Fourier transforms of FDTD fields)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (adjoint method with a frequency-domain solver)", "Ch. 2 Sec. 2.6 of the thesis"]
});
