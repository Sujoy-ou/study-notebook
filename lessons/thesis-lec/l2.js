addLesson("thesis", "lec", {
level: "Part A", num: "Lesson 2",
id: "thesis-lec-l2", title: "From time to frequency, and why no source means modes", short: "2. Time to frequency",
big: String.raw`A short pulse is a mix of many colours. Because the materials are linear and \(\varepsilon_r\) does not change in time, every colour travels through the device on its own. At one colour the time dependence is a simple rotation \(e^{-i\omega t}\), so every time derivative becomes \(-i\omega\). With a source this gives the driven frequency-domain equation, the one that later becomes \(A\mathbf{x} = \mathbf{b}\). Without a source, a nonzero field is possible only for special values of the propagation constant: these are the waveguide modes that the mode solver finds before every simulation.`,
bridge: String.raw`Only three equations to remember here: the replacement \(\partial/\partial t \to -i\omega\), the driven wave equation, and the mode form \(\mathbf{E}_m(x,y)e^{i\beta z}\). The mode solver itself is Ch. 2 Sec. 2.3 and Chapter 2 Lesson 3 of this shelf.`,
cards: [
{s: "1. Many colours", t: "A pulse is many colours, and each one travels alone",
intu: String.raw`Move the slider. A short pulse in time (left) contains a wide range of frequencies (right). A long pulse contains only a narrow range. Because the materials are linear and do not change in time, the device treats each frequency separately: what happens to one colour does not depend on the others. So we can study one frequency at a time and add them up afterwards.`,
eq: String.raw`\[ \mathbf{E}(\mathbf{r},t) = \sum_{\omega} \mathrm{Re}\left\{\mathbf{E}_\omega(\mathbf{r})\, e^{-i\omega t}\right\} \]`,
sym: [[String.raw`\(\mathbf{E}_\omega(\mathbf{r})\)`, "complex field pattern of one colour"], [String.raw`\(\omega = 2\pi f\)`, "angular frequency"], [String.raw`\(\tau\)`, "pulse length (slider)"]],
how: ["Linear: the response to a sum of inputs is the sum of the responses.", String.raw`Time-invariant: \(\varepsilon_r(\mathbf{r})\) is the same at every moment, so a colour cannot turn into another colour.`, "So each frequency in the pulse is an independent problem.", "Shorter pulse, wider spectrum: the width in frequency is about 1/(2πτ)."],
say: "Because the materials are linear and do not change in time, each frequency in a pulse propagates independently, so the problem can be solved one frequency at a time.",
num: String.raw`A band from 735 to 835 nm is about 359 to 408 THz. A pulse a few femtoseconds long covers it (Lesson 9).`,
r(fig, ctl) {
  ctl.innerHTML = sl("tau", "Pulse length τ", 0.03, 0.3, 0.01, 0.08) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    const tau = +$("tau").value, f0 = 10; $("tauv").textContent = tau.toFixed(2);
    const ts = range(0, 1.2, 600), g = ts.map(t => LC.gauss(t, 0.6, tau) * Math.cos(2 * Math.PI * f0 * (t - 0.6)));
    const fs = range(0, 20, 300), S = fs.map(f => Math.exp(-Math.pow(2 * Math.PI * (f - f0) * tau, 2) / 2));
    let s = `<text class="th" x="170" y="22" text-anchor="middle">in time</text><text class="th" x="510" y="22" text-anchor="middle">in frequency</text>`;
    s += C3.frame(30, 35, 280, 150, 0, 1.2, -1.1, 1.1, [], [], "time", "") + plot(30, 35, 280, 150, ts, g, 0, 1.2, -1.1, 1.1, "var(--blue)", 1.6);
    s += C3.frame(370, 35, 280, 150, 0, 20, 0, 1.1, [], [], "frequency", "") + plot(370, 35, 280, 150, fs, S, 0, 20, 0, 1.1, "var(--coral)", 2);
    fig.innerHTML = svg(225, s);
    $("ro").innerHTML = `<div><span>pulse length</span><b>${tau.toFixed(2)}</b></div><div><span>spectral width ≈ 1/(2πτ)</span><b>${(1 / (2 * Math.PI * tau)).toFixed(2)}</b></div>`;
  };
  $("tau").oninput = u; u();
}},

{s: "2. d/dt becomes −iω", t: "At one frequency, a time derivative is just a multiplication",
intu: String.raw`At one frequency the field is a fixed complex number times a rotation \(e^{-i\omega t}\). The blue arrow is that rotating number, and what we measure is its shadow on the real axis (the trace on the right). The coral arrow is the time derivative: the same arrow turned by a quarter turn and stretched by \(\omega\). So taking \(\partial/\partial t\) is the same as multiplying by \(-i\omega\). The time part is known, and only the spatial pattern \(\mathbf{E}(\mathbf{r})\) is left to find.`,
eq: String.raw`\[ \mathbf{E}(\mathbf{r},t) = \mathrm{Re}\left\{\mathbf{E}(\mathbf{r})\,e^{-i\omega t}\right\} \quad\Rightarrow\quad \frac{\partial}{\partial t} \;\rightarrow\; -i\omega \]`,
sym: [[String.raw`\(e^{-i\omega t}\)`, "rotation in the complex plane, once per period"], [String.raw`\(-i\omega\)`, "quarter turn times ω"]],
how: [String.raw`Differentiate: \(\partial_t\, e^{-i\omega t} = -i\omega\, e^{-i\omega t}\).`, String.raw`Put \(-i\omega\) for every \(\partial/\partial t\) in the curl equations of Lesson 1.`, String.raw`Faraday becomes \(\nabla\times\mathbf{E} = i\omega\mu_0\mathbf{H}\). Ampère becomes \(\nabla\times\mathbf{H} = -i\omega\varepsilon_0\varepsilon_r\mathbf{E} + \mathbf{J}\).`],
say: String.raw`At a single frequency the time dependence is \(e^{-i\omega t}\), so each time derivative becomes a multiplication by \(-i\omega\) and only the spatial field pattern remains unknown.`,
num: String.raw`Sign convention: this series uses \(e^{-i\omega t}\), the physics convention. Engineering texts use \(e^{j\omega t}\), which flips the sign of \(i\) in every formula but not the physics.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "ω (turns per second)", 0.2, 1.2, 0.05, 0.5);
  const hist = [];
  anim(t => {
    const w = +$("w").value; $("wv").textContent = w.toFixed(2);
    const th = -2 * Math.PI * w * t, cx = 140, cy = 130, R = 80, ex = cx + R * Math.cos(th), ey = cy - R * Math.sin(th);
    const dx = cx + 0.45 * R * w * 2 * Math.PI * Math.cos(th - Math.PI / 2) / 3, dy = cy - 0.45 * R * w * 2 * Math.PI * Math.sin(th - Math.PI / 2) / 3;
    hist.push(Math.cos(th)); if (hist.length > 360) hist.shift();
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--b)"/><line x1="${cx - 100}" x2="${cx + 100}" y1="${cy}" y2="${cy}" stroke="var(--b)"/><line x1="${cx}" x2="${cx}" y1="${cy - 100}" y2="${cy + 100}" stroke="var(--b)"/><text class="ts" x="${cx + 104}" y="${cy + 4}">Re</text><text class="ts" x="${cx + 4}" y="${cy - 104}">Im</text>`;
    s += arrow(cx, cy, ex, ey, "var(--blue)", 2.5) + arrow(ex, ey, ex + (dx - cx), ey + (dy - cy), "var(--coral)", 2.2);
    s += `<line x1="${ex}" x2="${ex}" y1="${ey}" y2="${cy}" stroke="var(--blue)" stroke-dasharray="3 3"/><circle cx="${ex}" cy="${cy}" r="4" fill="var(--blue)"/>`;
    s += `<text class="ts" x="20" y="250">blue: E e^(−iωt)   coral: ∂/∂t of it = −iω times blue</text>`;
    s += C3.frame(300, 50, 350, 160, 0, 360, -1.2, 1.2, [], [], "time (newest on the left)", "") + plot(300, 50, 350, 160, hist.map((_, i) => i), hist.map((_, i) => hist[hist.length - 1 - i]), 0, 360, -1.2, 1.2, "var(--blue)", 2);
    fig.innerHTML = svg(262, s);
  });
}},

{s: "3. The driven equation", t: "With a source: the frequency-domain equation",
intu: String.raw`Put \(-i\omega\) into both curl equations and eliminate \(\mathbf{H}\). The result has the device on the left and the source on the right. Here it is solved directly in 1D for a GaAs-like slab (shaded) with a source on the left. Change the wavelength: the pattern changes because the slab is more or less resonant. Change the source strength: the whole field scales with it, because the equation is linear. Set the source to zero and the field is zero everywhere.`,
eq: String.raw`\[ \underbrace{\nabla\times\nabla\times\mathbf{E} - k_0^2\,\varepsilon_r(\mathbf{r})\,\mathbf{E}}_{\text{device}} = \underbrace{i\omega\mu_0\,\mathbf{J}}_{\text{source}}, \qquad k_0 = \frac{2\pi}{\lambda_0} \]`,
sym: [[String.raw`\(k_0\)`, "wavenumber in vacuum"], [String.raw`\(\varepsilon_r(\mathbf{r})\)`, "the device"], [String.raw`\(\mathbf{J}\)`, "the source, zero except on the source plane"]],
how: [String.raw`From Faraday at one frequency: \(\mathbf{H} = \nabla\times\mathbf{E}/(i\omega\mu_0)\).`, "Insert this into Ampère at one frequency.", String.raw`Multiply by \(i\omega\mu_0\) and use \(\omega^2\mu_0\varepsilon_0 = k_0^2\).`, String.raw`On a grid this one equation becomes the matrix system \(A\mathbf{x} = \mathbf{b}\) (Lesson 15).`],
say: String.raw`At one frequency the curl equations combine into one driven equation, with the device on the left through \(\varepsilon_r\) and the source current on the right.`,
num: String.raw`This 1D solve: 10 nm cells, a 600 nm slab with \(n = 3.5\) in air, exact one-way boundaries at both ends.`,
r(fig, ctl) {
  ctl.innerHTML = sl("lm", "Wavelength (nm)", 700, 900, 2, 800) + sl("am", "Source strength", 0, 1, 0.05, 1) + `<div class="readout" id="ro"></div>`;
  const N = 300, src = 30, eps = new Float64Array(N).fill(1); for (let i = 120; i < 180; i++) eps[i] = 12.25;
  const u = () => {
    const lam = +$("lm").value, A = +$("am").value; $("lmv").textContent = lam; $("amv").textContent = A.toFixed(2);
    const b = new Float64Array(N); b[src] = A / 10; const f = C3.helm(eps, lam, 10, b);
    const b1 = new Float64Array(N); b1[src] = 1 / 10; const v = C3.helm(new Float64Array(N).fill(1), lam, 10, b1), sc = Math.hypot(v.re[N - 10], v.im[N - 10]) || 1;
    const xs = [...Array(N).keys()], ab = xs.map(i => Math.hypot(f.re[i], f.im[i]) / sc), re = xs.map(i => f.re[i] / sc);
    let s = `<rect x="${50 + 120 / (N - 1) * 600}" y="30" width="${60 / (N - 1) * 600}" height="160" fill="var(--blue-bg)"/><line x1="50" x2="650" y1="110" y2="110" stroke="var(--b)"/>`;
    s += plot(50, 30, 600, 160, xs, re, 0, N - 1, -2.2, 2.2, "var(--blue)", 1.6) + plot(50, 30, 600, 160, xs, ab, 0, N - 1, -2.2, 2.2, "var(--coral)", 2);
    const X = 50 + src / (N - 1) * 600; s += `<line x1="${X}" x2="${X}" y1="30" y2="190" stroke="var(--purple)" stroke-dasharray="4 3"/><text class="ts" x="${X}" y="24" text-anchor="middle">source J</text><text class="ts" x="${50 + 150 / (N - 1) * 600}" y="24" text-anchor="middle">slab (device)</text>`;
    s += C3.legend(60, 212, [["Re E", "var(--blue)"], ["|E|", "var(--coral)"]]);
    fig.innerHTML = svg(222, s);
    $("ro").innerHTML = `<div><span>source strength</span><b>${A.toFixed(2)}</b></div><div><span>largest |E| (1 = empty space at full source)</span><b>${Math.max(...ab).toFixed(2)}</b></div>`;
  };
  $("lm").oninput = u; $("am").oninput = u; u();
}},

{s: "4. No source: modes", t: "Without a source, only special fields can exist: the modes",
intu: String.raw`Now ask a different question: in a straight slab waveguide, which field shapes can travel by themselves, with no source? Try a value of \(n_\mathrm{eff}\) with the slider. Inside the core the field is a cosine, outside it must decay. For most values the two pieces meet with a kink at the edge (orange), which Maxwell's equations do not allow. Only at one special \(n_\mathrm{eff}\) do they join smoothly. That smooth shape is the mode. Finding it is an eigenvalue problem, which is what the mode solver does.`,
eq: String.raw`\[ \mathbf{E}(x,y,z) = \mathbf{E}_m(x,y)\,e^{i\beta z}, \qquad \beta = k_0\,n_\mathrm{eff} \]<div class="eqnote">a nonzero solution with \(\mathbf{J} = 0\) exists only for special \(\beta\)</div>`,
sym: [[String.raw`\(\mathbf{E}_m(x,y)\)`, "mode profile in the cross-section"], [String.raw`\(\beta\)`, "propagation constant"], [String.raw`\(n_\mathrm{eff}\)`, "effective index of the mode"]],
how: [String.raw`Look for a field with a fixed cross-section that only gains phase along \(z\).`, String.raw`Put it in the driven equation with \(\mathbf{J} = 0\).`, String.raw`Inside the core it oscillates, outside it decays. Both value and slope must match at the edge.`, String.raw`That matching works only for special \(n_\mathrm{eff}\): an eigenvalue problem.`],
say: String.raw`Without a source the frequency-domain equation is an eigenvalue problem: a nonzero field exists only for special propagation constants, and those solutions are the waveguide modes.`,
num: String.raw`Round example: symmetric slab, core \(n = 3.5\), air cladding, \(\lambda_0 = 800\) nm, fundamental TE mode.`,
r(fig, ctl) {
  ctl.innerHTML = sl("tk", "Core thickness (nm)", 100, 400, 10, 200) + sl("ne", "Trial n_eff", 1.02, 3.48, 0.002, 2.4) + `<div class="row"><button id="snap">Jump to the mode</button></div><div class="readout" id="ro"></div>`;
  const n = 3.5, lam = 800, k0 = 2 * Math.PI / lam;
  const u = () => {
    const t = +$("tk").value, ne = +$("ne").value; $("tkv").textContent = t; $("nev").textContent = ne.toFixed(3);
    const ka = k0 * Math.sqrt(n * n - ne * ne), ga = k0 * Math.sqrt(ne * ne - 1), c = Math.cos(ka * t / 2);
    const zs = range(-1.6 * t, 1.6 * t, 500), E = zs.map(z => Math.abs(z) <= t / 2 ? Math.cos(ka * z) : c * Math.exp(-ga * (Math.abs(z) - t / 2)));
    const sIn = -ka * Math.sin(ka * t / 2), sOut = -ga * c, mis = (sIn - sOut) / k0, mode = C2.slabN(n, 1, t, lam, 0, "TE");
    const X = C3.X(60, 580, -1.6 * t, 1.6 * t);
    let s = `<rect x="${X(-t / 2)}" y="20" width="${X(t / 2) - X(-t / 2)}" height="180" fill="var(--blue-bg)"/><text class="ts" x="${X(0)}" y="214" text-anchor="middle">core n = 3.5</text><text class="ts" x="${X(-t)}" y="214" text-anchor="middle">air</text><text class="ts" x="${X(t)}" y="214" text-anchor="middle">air</text>`;
    s += `<line x1="60" x2="640" y1="${20 + 180 * 1.2 / 2.4}" y2="${20 + 180 * 1.2 / 2.4}" stroke="var(--b)"/>` + plot(60, 20, 580, 180, zs, E, -1.6 * t, 1.6 * t, -1.2, 1.2, Math.abs(mis) < 0.02 ? "var(--teal)" : "var(--blue)", 2.2);
    if (Math.abs(mis) >= 0.02) for (const zz of [-t / 2, t / 2]) s += `<circle cx="${X(zz)}" cy="${20 + 180 * (1.2 - c) / 2.4}" r="9" fill="none" stroke="var(--coral)" stroke-width="2.5"/>`;
    fig.innerHTML = svg(226, s);
    $("ro").innerHTML = `<div><span>kink at the edge (slope mismatch)</span><b>${mis.toFixed(3)}</b></div><div><span>mode n_eff for this core</span><b>${mode ? mode.toFixed(3) : "none"}</b></div><div><span>trial is a mode?</span><b>${Math.abs(mis) < 0.02 ? "yes" : "no"}</b></div>`;
  };
  $("tk").oninput = u; $("ne").oninput = u;
  $("snap").onclick = () => { const m = C2.slabN(n, 1, +$("tk").value, lam, 0, "TE"); if (m) $("ne").value = m; u(); };
  u();
}},

{s: "5. Two jobs", t: "The mode solver runs first, then the driven simulation",
intu: String.raw`Step through one simulation. First the source-free problem is solved on the input cross-section: the mode solver finds the TE or TM mode and its \(n_\mathrm{eff}\). That mode shape is then used twice. It shapes the source current that launches light into the input waveguide. And at the output, the mode monitor compares the field with the same kind of mode shape to measure how much power arrived in it. The driven simulation in between solves the equation with the source.`,
eq: String.raw`\[ \text{mode solver: } \mathbf{J} = 0 \;\Rightarrow\; \mathbf{E}_m,\ n_\mathrm{eff} \qquad\quad \text{simulation: } \mathbf{J} \neq 0 \;\Rightarrow\; \mathbf{E}(\mathbf{r}) \]`,
sym: [["mode solver", "source-free eigenproblem on one cross-section"], ["mode source", "source current shaped like the mode (Lesson 8)"], ["mode monitor", "measures the power in a mode (Lesson 11)"]],
how: ["Solve the source-free problem on the input plane: the mode.", "Build the source from that mode shape.", "Run the driven simulation.", "Project the output field onto the output mode to get the transmission."],
say: "The same frequency-domain equation is used twice: without a source it gives the modes, and with a mode-shaped source it gives how much light the device sends where.",
num: "In inverse design the mode solver runs once per waveguide and frequency set. The driven simulation runs twice per optimization step (forward and adjoint).",
r(fig, ctl) {
  const cap = [String.raw`Mode solver on the input cross-section, no source. Result: the mode profile and \(n_\mathrm{eff}\).`, "That profile becomes the source current on the input plane: the mode source.", "The driven simulation carries the light through the device.", "At the output, the mode monitor projects the field onto the output mode. The squared amplitude is the transmission."];
  LC.steps(ctl, 4, k => {
    let s = `<rect x="40" y="120" width="160" height="22" fill="var(--blue-bg)" stroke="var(--blue)"/><rect x="200" y="85" width="260" height="92" rx="6" fill="var(--gray-bg)" stroke="var(--p)"/><text class="ts" x="330" y="135" text-anchor="middle">design region</text><rect x="460" y="120" width="180" height="22" fill="var(--blue-bg)" stroke="var(--blue)"/>`;
    s += LC.box(20, 10, 170, 56, ["1. mode solver", "J = 0, gives Em, n_eff"], "teal", k !== 0);
    s += `<g opacity="${k >= 1 ? 1 : 0.25}"><line x1="90" x2="90" y1="100" y2="162" stroke="var(--purple)" stroke-width="3"/><text class="ts" x="90" y="180" text-anchor="middle">2. mode source</text>${arrow(96, 131, 150, 131, "var(--purple)", 2)}</g>`;
    s += `<g opacity="${k >= 2 ? 1 : 0.25}"><path d="M 150 131 C 260 131, 300 100, 330 110 S 420 131, 540 131" fill="none" stroke="var(--coral)" stroke-width="2.5" marker-end="url(#ar)"/><text class="ts" x="330" y="200" text-anchor="middle">3. driven simulation, J on</text></g>`;
    s += `<g opacity="${k >= 3 ? 1 : 0.25}"><line x1="590" x2="590" y1="100" y2="162" stroke="var(--teal)" stroke-width="3"/><text class="ts" x="590" y="180" text-anchor="middle">4. mode monitor</text><text class="ts" x="590" y="198" text-anchor="middle">T = |a|²</text></g>`;
    if (k === 0) s += arrow(105, 66, 92, 98, "var(--teal)", 1.6);
    fig.innerHTML = svg(214, s);
    return cap[k];
  });
}}
],
summary: String.raw`Linear materials that do not change in time treat every frequency separately. At one frequency \(\partial/\partial t \to -i\omega\), and the two curl equations combine into one driven equation with the device on the left and the source on the right. With no source, a nonzero field exists only for special \(\beta = k_0 n_\mathrm{eff}\): the modes. The mode solver finds them first, and their shape is used for the mode source and the mode monitor.`,
sheet: [
[String.raw`\[ \frac{\partial}{\partial t} \rightarrow -i\omega \]`, String.raw`At one frequency, with \(e^{-i\omega t}\)`],
[String.raw`\[ \nabla\times\nabla\times\mathbf{E} - k_0^2\varepsilon_r\mathbf{E} = i\omega\mu_0\mathbf{J} \]`, "Driven frequency-domain equation"],
[String.raw`\[ \mathbf{E} = \mathbf{E}_m(x,y)\,e^{i\beta z}, \quad \beta = k_0 n_\mathrm{eff} \]`, String.raw`Mode: a solution with \(\mathbf{J} = 0\)`]],
consts: String.raw`Worked examples: \(n = 3.5\), air cladding, \(\lambda_0 = 800\) nm, 10 nm grid for the 1D solve.`,
sources: ["Jackson, Classical Electrodynamics, 3rd ed., Wiley (1999), Sec. 7.1 and Ch. 8 (time-harmonic fields and waveguide modes)", "Andreani and Gerace, Phys. Rev. B 73, 235114 (2006), App. C (slab mode equation used for the n_eff readout)", "Ch. 2 Sec. 2.3 of the thesis (mode solver)"]
});
