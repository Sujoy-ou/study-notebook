/* Lesson 14: reported quantities, thesis Ch. 3 Sec. 3.7. Every spectrum in this lesson is synthetic (made up for teaching), not a thesis result. */
/* helpers for this lesson only (prefix C3L14_) */
const C3L14_dB1 = Math.pow(10, -0.1);
/* synthetic, Gaussian-like coupling efficiency with separate widths on the two sides */
const C3L14_ce = (l, A, c, sL, sR) => A * Math.exp(-Math.pow(l - c, 2) / (2 * Math.pow(l < c ? sL : sR, 2)));
/* synthetic flat-topped target transmission of a splitter */
const C3L14_tt = (l, A, c, w) => A * Math.exp(-0.5 * Math.pow((l - c) / w, 4));
/* Back / Play / Next stepper, draw(S) every frame, S.k step, S.t time in the step */
const C3L14_steps = (fig, ctl, n, dur, draw, idp) => {
  ctl.insertAdjacentHTML("beforeend", `<div class="row"><button id="${idp}b">Back</button><button id="${idp}p">Pause</button><button id="${idp}n">Next step</button><span id="${idp}s" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`);
  const S = { k: 1, play: true, t: 0 };
  let last = performance.now();
  const ui = () => { $(idp + "s").textContent = `step ${S.k} of ${n}`; $(idp + "b").disabled = S.k === 1; $(idp + "n").disabled = S.k === n; $(idp + "p").textContent = S.play ? "Pause" : "Play"; };
  S.go = k => { S.k = Math.max(1, Math.min(n, k)); S.t = 0; ui(); draw(S); };
  $(idp + "b").onclick = () => { S.play = false; S.go(S.k - 1); };
  $(idp + "n").onclick = () => { S.play = false; S.go(S.k + 1); };
  $(idp + "p").onclick = () => { S.play = !S.play; if (S.play && S.k === n) S.go(1); ui(); };
  ui();
  anim(() => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; S.t += dt;
    if (S.play && S.t > dur) { if (S.k < n) { S.k++; S.t = 0; } else S.play = false; ui(); }
    draw(S);
  });
  return S;
};
const C3L14_tag = (x, y) => `<rect x="${x}" y="${y - 13}" width="150" height="18" rx="4" fill="#EF9F27" fill-opacity="0.18"/><text class="ts" x="${x + 75}" y="${y}" text-anchor="middle" style="fill:#BA7517">synthetic, not a thesis result</text>`;
const C3L14_dB = v => (10 * Math.log10(v)).toFixed(2);
const C3L14_ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

addLesson("thesis", "ch3", {
level: "Core",
id: "thesis-ch3-l14", title: "Reported quantities: reading a result", short: "14. Reported quantities",
big: String.raw`An optimization ends with a design, and a design is reported by a few numbers that must be read the same way every time. For a grating coupler the thesis reports four: the peak coupling efficiency, the wavelength of the peak, the efficiency at the design wavelength of 795 nm, and the 1 dB bandwidth, the wavelength range over which the efficiency stays within 1 dB of the peak, read on a 1 nm grid. For a taper it reports the transmission into the fundamental mode at 795 nm, taken from a separate validation run of the final outline and not from the objective \(J\), which includes the penalty. For a polarization beam splitter it reports, for each input polarization, the transmission into the intended port and into the other port, the extinction ratio and the insertion loss, and the operating band in which both polarizations reach their intended ports with at least 0.8. Every curve in this lesson is synthetic, made up to teach the reading, and none is a thesis result.`,
bridge: String.raw`This is Ch. 3 Sec. 3.7, with Eq. (3.18) for the extinction ratio and the insertion loss. All transmissions are mode powers \(T_m = |a_m|^2\) from the overlap of Eq. (3.12) (Lesson 7), measured by the monitors of Lesson 12. The decibel conversions are the standard ones. The results themselves are in Chapters 4 and 5 of the thesis and are not shown here.`,
cards: [
/* NEW CARD: peak and value at 795 nm */
{s: "1. Peak and value at 795 nm", t: "Three numbers from one spectrum: peak, peak wavelength, value at 795 nm",
intu: String.raw`The coupling efficiency (CE) of a grating is the power in the fundamental mode of the access waveguide, as a fraction of the power of the fiber beam, at each wavelength. Its spectrum is a hill. The thesis reads three numbers from it: how high the hill is (the peak CE), where its top is (the peak wavelength), and how high it is at 795 nm, the wavelength the quantum dots emit at. The objective was a band average centered at 795 nm, so the peak usually lands close to 795 nm, but not exactly. The gap between the peak and the value at 795 nm tells how far the design is detuned. The curve here is a made-up Gaussian-like hill. Move its height, center and width and read the three numbers.`,
eq: String.raw`\[ \mathrm{CE}_{\mathrm{peak}} = \max_{\lambda} \mathrm{CE}(\lambda), \qquad \lambda_{\mathrm{peak}} = \arg\max_{\lambda} \mathrm{CE}(\lambda), \qquad \mathrm{CE}(795\ \mathrm{nm}) \]<div class="eqnote">synthetic hill used on this card:</div>\[ \mathrm{CE}(\lambda) = A\, e^{-(\lambda - \lambda_c)^2/(2s^2)} \]<div class="eqref">Ch. 3 Sec. 3.7, grating couplers. \(\mathrm{CE} = |a_m|^2\), Eq. (3.12)</div>`,
sym: [[String.raw`\(\mathrm{CE}(\lambda)\)`, "coupling efficiency into the fundamental mode, traveling toward the waveguide"], [String.raw`\(\lambda_{\mathrm{peak}}\)`, "wavelength of the highest CE, read on the 1 nm grid"], [String.raw`\(A, \lambda_c, s\)`, "height, center and width of the synthetic hill"], ["795 nm", "design wavelength, the quantum dot emission"]],
how: ["Simulate the final design and record CE at every wavelength of the grid.", "The largest value is the peak CE, its wavelength is the peak wavelength.", "Read the value at 795 nm as well.", "Report all three: the peak shows what the design can do, the value at 795 nm what it does where it is needed."],
say: "A grating coupler is reported by its peak coupling efficiency, the wavelength of that peak and its efficiency at 795 nm. The difference between the peak and the value at 795 nm shows how far the response is detuned from the design wavelength.",
num: String.raw`Synthetic example: \(A = 0.6\), \(\lambda_c = 800\) nm, \(s = 20\) nm gives a peak of 0.600 at 800 nm and \(0.6\,e^{-25/800} = 0.582\) at 795 nm.`,
r(fig, ctl) {
  ctl.innerHTML = sl("A", "Height A", 0.1, 0.9, 0.01, 0.6) + sl("c", "Center λ<sub>c</sub> (nm)", 770, 820, 0.5, 800) + sl("s", "Width s (nm)", 5, 40, 0.5, 20) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const A = +$("A").value, c = +$("c").value, sw = +$("s").value; $("Av").textContent = A.toFixed(2); $("cv").textContent = c.toFixed(1); $("sv").textContent = sw.toFixed(1);
    const ls = range(745, 845, 101), ce = ls.map(l => C3L14_ce(l, A, c, sw, sw)); let ip = 0; ce.forEach((v, i) => { if (v > ce[ip]) ip = i; });
    const X = C3.X(70, 560, 745, 845), Y = C3.Y(30, 200, 0, 1), c795 = C3L14_ce(795, A, c, sw, sw);
    let s = C3.frame(70, 30, 560, 200, 745, 845, 0, 1, [745, 770, 795, 820, 845], [0, 0.5, 1], "wavelength (nm)", "CE");
    s += `<line x1="${X(795)}" x2="${X(795)}" y1="30" y2="230" stroke="#7F77DD" stroke-dasharray="4 3"/><text class="ts" x="${X(795) + 4}" y="44" style="fill:#7F77DD">795 nm</text>`;
    s += plot(70, 30, 560, 200, ls, ce, 745, 845, 0, 1, "#378ADD", 2.5);
    s += `<circle cx="${X(ls[ip])}" cy="${Y(ce[ip])}" r="6" fill="#D85A30"/><line x1="${X(ls[ip])}" x2="${X(ls[ip])}" y1="${Y(ce[ip])}" y2="230" stroke="#D85A30" stroke-dasharray="2 3"/><text class="ts" x="${X(ls[ip]) + (ls[ip] > 820 ? -8 : 8)}" y="${Y(ce[ip]) - 8}" text-anchor="${ls[ip] > 820 ? "end" : "start"}" style="fill:#D85A30">peak ${ce[ip].toFixed(3)} at ${ls[ip]} nm</text>`;
    s += `<circle cx="${X(795)}" cy="${Y(c795)}" r="5" fill="#7F77DD"/><line x1="70" x2="${X(795)}" y1="${Y(c795)}" y2="${Y(c795)}" stroke="#7F77DD" stroke-dasharray="2 3"/>`;
    s += C3L14_tag(474, 22);
    fig.innerHTML = svg(270, s);
    $("ro").innerHTML = `<div><span>peak CE</span><b>${ce[ip].toFixed(3)}</b></div><div><span>peak wavelength</span><b>${ls[ip]} nm</b></div><div><span>CE at 795 nm</span><b>${c795.toFixed(3)}</b></div><div><span>peak minus value at 795</span><b>${(ce[ip] - c795).toFixed(3)}</b></div>`;
  };
  ["A", "c", "s"].forEach(k => $(k).oninput = u); u();
}},

/* NEW CARD: 1 dB bandwidth */
{s: "2. The 1 dB bandwidth", t: "The 1 dB bandwidth, read on a 1 nm grid",
intu: String.raw`The bandwidth says how wide the hill is. The thesis uses the 1 dB bandwidth: the wavelength range over which the CE stays within 1 dB of its peak. One decibel down is a factor \(10^{-0.1} = 0.794\), so the line sits at 79.4 % of the peak, about a fifth below it. The spectrum is computed on a grid of wavelengths 1 nm apart, so the band edges are not read where the curve crosses the line but at the first and last grid wavelength that is still above it. Step through: the line slides down from the peak, the curve crosses it, and the edges snap onto the grid. Change the width, and make the hill lopsided to see that the band need not be centered on the peak.`,
eq: String.raw`\[ \mathrm{CE}(\lambda) \ge 10^{-0.1}\, \mathrm{CE}_{\mathrm{peak}} = 0.794\, \mathrm{CE}_{\mathrm{peak}} \]\[ \Delta\lambda_{1\,\mathrm{dB}} = \lambda_{\mathrm{last}} - \lambda_{\mathrm{first}}, \qquad \lambda \in \{745, 746, \dots, 845\}\ \mathrm{nm} \]<div class="eqnote">synthetic Gaussian hill: continuous width \(= 2s\sqrt{0.2\ln 10} = 1.357\,s\)</div><div class="eqref">Ch. 3 Sec. 3.7, grating couplers</div>`,
sym: [["1 dB", String.raw`a power ratio of \(10^{-0.1} = 0.794\)`], [String.raw`\(\lambda_{\mathrm{first}}, \lambda_{\mathrm{last}}\)`, "first and last grid wavelength inside the 1 dB line"], ["1 nm grid", "the wavelengths at which the spectrum is computed and read"], [String.raw`\(s_L, s_R\)`, "widths of the synthetic hill to the left and right of its peak"]],
how: [String.raw`Find the peak on the grid. The 1 dB line is at \(\mathrm{CE}_{\mathrm{peak}} \times 10^{-0.1}\), since \(10\log_{10}(0.794) = -1\).`, "Mark every grid wavelength whose CE is at or above the line.", "The band runs from the first to the last marked wavelength.", String.raw`For a Gaussian hill the exact crossings sit at \(\pm s\sqrt{2 \times 0.1 \ln 10} = \pm 0.679\,s\) from the peak, so the grid value can differ from this by up to about 2 nm.`],
say: "The 1 dB bandwidth is the wavelength range over which the coupling efficiency stays within 1 dB of its peak, that is above 0.794 times the peak, read on the 1 nm grid of the simulated spectrum.",
num: String.raw`Synthetic Gaussian with \(s = 20\) nm: continuous 1 dB width \(1.357 \times 20 = 27.1\) nm. On the 1 nm grid the band is read between whole wavelengths, here 26 or 27 nm depending on where the peak falls.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Width s (nm)", 6, 35, 0.5, 20) + sl("k", "Lopsidedness s<sub>R</sub>/s<sub>L</sub>", 0.5, 2, 0.05, 1) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="b2s"></div><p class="note" id="b2c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const CAP = ["", "Step 1. The synthetic spectrum, computed at every whole nanometer (dots). Its highest grid point is the peak.",
    "Step 2. Slide a line down from the peak to 1 dB below it: 10^(−0.1) = 0.794 of the peak.",
    "Step 3. The curve crosses the line on each side. These crossings are the continuous band edges.",
    "Step 4. Read on the 1 nm grid: the edges snap to the first and last grid wavelength still on or above the line (zoom on the right edge).",
    "Step 5. The 1 dB bandwidth is the distance between those two grid wavelengths."];
  const draw = S => {
    const sw = +$("w").value, kk = +$("k").value; $("wv").textContent = sw.toFixed(1); $("kv").textContent = kk.toFixed(2);
    const sL = 2 * sw / (1 + kk), sR = kk * sL, c = 793.3, A = 0.62, ls = range(745, 845, 101), ce = ls.map(l => C3L14_ce(l, A, c, sL, sR));
    let ip = 0; ce.forEach((v, i) => { if (v > ce[ip]) ip = i; }); const pk = ce[ip], thr = C3L14_dB1 * pk;
    const inside = ce.map(v => v >= thr), i0 = inside.indexOf(true), i1 = inside.lastIndexOf(true), bw = ls[i1] - ls[i0];
    const q = Math.sqrt(0.2 * Math.LN10), eL = c - q * sL, eR = c + q * sR;
    const X = C3.X(60, 420, 745, 845), Y = C3.Y(30, 210, 0, 0.7), k = S.k;
    let s = C3.frame(60, 30, 420, 210, 745, 845, 0, 0.7, [745, 770, 795, 820, 845], [0, 0.35, 0.7], "wavelength (nm)", "CE");
    s += plot(60, 30, 420, 210, range(745, 845, 401), range(745, 845, 401).map(l => C3L14_ce(l, A, c, sL, sR)), 745, 845, 0, 0.7, "#378ADD", 2);
    ls.forEach((l, i) => { const on = k >= 4 && inside[i]; s += `<circle cx="${X(l)}" cy="${Y(ce[i])}" r="${on ? 2.4 : 1.6}" fill="${on ? "#1D9E75" : "var(--muted)"}"/>`; });
    s += `<circle cx="${X(ls[ip])}" cy="${Y(pk)}" r="5" fill="none" stroke="#D85A30" stroke-width="2"/><text class="ts" x="${X(ls[ip])}" y="${Y(pk) - 10}" text-anchor="middle" style="fill:#D85A30">peak</text>`;
    let lv = pk; if (k === 2) lv = pk - (pk - thr) * C3L14_ease(S.t / 1.8); if (k >= 3) lv = thr;
    if (k >= 2) s += `<line x1="60" x2="480" y1="${Y(lv)}" y2="${Y(lv)}" stroke="#D85A30" stroke-width="1.6"/><line x1="60" x2="480" y1="${Y(pk)}" y2="${Y(pk)}" stroke="#D85A30" stroke-dasharray="3 3" opacity="0.5"/><text class="ts" x="478" y="${Y(lv) + 14}" text-anchor="end" style="fill:#D85A30">${k === 2 && S.t < 1.8 ? (10 * Math.log10(lv / pk)).toFixed(2) + " dB" : "−1 dB = 0.794 × peak"}</text>`;
    if (k >= 3) [eL, eR].forEach(e => s += `<line x1="${X(e)}" x2="${X(e)}" y1="${Y(thr)}" y2="240" stroke="#7F77DD" stroke-dasharray="3 3"/><circle cx="${X(e)}" cy="${Y(thr)}" r="4" fill="#7F77DD"/>`);
    if (k >= 4) { const sn = C3L14_ease(k === 4 ? S.t / 1.5 : 1), a = eL + (ls[i0] - eL) * sn, b = eR + (ls[i1] - eR) * sn; s += `<rect x="${X(a)}" y="30" width="${X(b) - X(a)}" height="210" fill="#1D9E75" opacity="0.12"/>`; }
    if (k >= 5) s += `<line x1="${X(ls[i0])}" x2="${X(ls[i1])}" y1="226" y2="226" stroke="#1D9E75" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="th" x="${(X(ls[i0]) + X(ls[i1])) / 2}" y="220" text-anchor="middle" style="fill:#1D9E75;font-size:12px">${bw} nm</text>`;
    // zoom on the right edge
    const zx0 = 500, zw = 165, zy0 = 50, zh = 170, l0 = Math.round(eR) - 3, l1 = l0 + 6, zX = C3.X(zx0, zw, l0, l1), cmin = Math.min(...[l0, l1].map(l => C3L14_ce(l, A, c, sL, sR))), cmax = Math.max(...[l0, l1].map(l => C3L14_ce(l, A, c, sL, sR))), zY = C3.Y(zy0, zh, cmin - 0.01, cmax + 0.01);
    if (k >= 4) {
      s += `<rect x="${zx0}" y="${zy0}" width="${zw}" height="${zh}" fill="var(--sunk)" stroke="var(--b)"/><text class="ts" x="${zx0 + zw / 2}" y="${zy0 - 8}" text-anchor="middle">zoom: right edge, 1 nm ticks</text>`;
      for (let l = l0; l <= l1; l++) s += `<line x1="${zX(l)}" x2="${zX(l)}" y1="${zy0 + zh}" y2="${zy0 + zh - 6}" stroke="var(--p)"/><text class="ts" x="${zX(l)}" y="${zy0 + zh + 14}" text-anchor="middle" style="font-size:10px">${l}</text>`;
      s += plot(zx0, zy0, zw, zh, range(l0, l1, 61), range(l0, l1, 61).map(l => C3L14_ce(l, A, c, sL, sR)), l0, l1, cmin - 0.01, cmax + 0.01, "#378ADD", 2);
      s += `<line x1="${zx0}" x2="${zx0 + zw}" y1="${zY(thr)}" y2="${zY(thr)}" stroke="#D85A30" stroke-width="1.5"/><line x1="${zX(eR)}" x2="${zX(eR)}" y1="${zy0}" y2="${zy0 + zh}" stroke="#7F77DD" stroke-dasharray="3 3"/>`;
      for (let l = l0; l <= l1; l++) { const v = C3L14_ce(l, A, c, sL, sR), on = v >= thr; s += `<circle cx="${zX(l)}" cy="${zY(v)}" r="4" fill="${on ? "#1D9E75" : "var(--muted)"}"/>`; }
      s += `<line x1="${zX(ls[i1])}" x2="${zX(ls[i1])}" y1="${zy0}" y2="${zy0 + zh}" stroke="#1D9E75" stroke-width="2"/><text class="ts" x="${zX(ls[i1]) - 4}" y="${zy0 + 14}" text-anchor="end" style="fill:#1D9E75">${ls[i1]} nm</text>`;
    }
    s += C3L14_tag(500, 22);
    $("b2s").innerHTML = svg(282, s);
    $("b2c").textContent = CAP[k];
    $("ro").innerHTML = `<div><span>peak (grid)</span><b>${pk.toFixed(3)} at ${ls[ip]} nm</b></div><div><span>1 dB line</span><b>${thr.toFixed(3)}</b></div><div><span>band on the grid</span><b>${ls[i0]} to ${ls[i1]} nm</b></div><div><span>1 dB bandwidth</span><b>${bw} nm</b></div><div><span>continuous width</span><b>${(eR - eL).toFixed(1)} nm</b></div>`;
  };
  const S = C3L14_steps(fig, ctl, 5, 3.4, draw, "b2");
  $("w").oninput = () => draw(S); $("k").oninput = () => draw(S);
}},

/* NEW CARD: splitter transmissions */
{s: "3. Splitter transmissions", t: "Four numbers per wavelength: target and leak for each input",
intu: String.raw`A polarization beam splitter is simulated twice, once with TE0 launched and once with TM0. TE0 should leave through the TE port and TM0 through the TM port. For each input, the transmission into the intended port is \(T_{\mathrm{target}}\) and the transmission into the other port is \(T_{\mathrm{leak}}\). Whatever is in neither port was reflected, radiated or scattered, so the two never add up to more than one. The figure of merit of Eq. (3.14) rewards only the two target transmissions, which by power conservation also squeezes what can leak, but the leak is reported separately because it decides the extinction ratio of the next card. The arrows have widths proportional to the power. Set the four values.`,
eq: String.raw`\[ \text{TE}_0 \text{ in:}\quad T_{\mathrm{target}} = T_{\mathrm{TE}\to\mathrm{TE\,port}}, \qquad T_{\mathrm{leak}} = T_{\mathrm{TE}\to\mathrm{TM\,port}} \]\[ \text{TM}_0 \text{ in:}\quad T_{\mathrm{target}} = T_{\mathrm{TM}\to\mathrm{TM\,port}}, \qquad T_{\mathrm{leak}} = T_{\mathrm{TM}\to\mathrm{TE\,port}} \]\[ T_{\mathrm{target}} + T_{\mathrm{leak}} \le 1 \]<div class="eqref">Ch. 3 Sec. 3.7, polarization beam splitters. Each \(T\) is \(|a_m|^2\) of Eq. (3.12)</div>`,
sym: [[String.raw`\(T_{\mathrm{target}}\)`, "power fraction in the intended port"], [String.raw`\(T_{\mathrm{leak}}\)`, "power fraction in the other port"], [String.raw`\(1 - T_{\mathrm{target}} - T_{\mathrm{leak}}\)`, "reflected, radiated or scattered power"], ["TE port, TM port", "the two output waveguides, named for the polarization meant to leave there"]],
how: ["Run the splitter with TE0 at the input, read both output monitors.", "Run it again with TM0 at the input, read both monitors again.", "For each run, the intended port gives the target, the other port the leak.", "Power conservation: target plus leak plus loss is one."],
say: "For each input polarization the thesis reports the transmission into the intended port, T target, and into the other port, T leak. The figure of merit rewards only the targets, and the leak is reported because it sets the extinction ratio.",
num: String.raw`Synthetic example: TE0 in, \(T_{\mathrm{target}} = 0.90\), \(T_{\mathrm{leak}} = 0.02\), so 0.08 is lost. TM0 in, \(T_{\mathrm{target}} = 0.85\), \(T_{\mathrm{leak}} = 0.05\), so 0.10 is lost.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "TE in: T<sub>target</sub>", 0, 1, 0.01, 0.9) + sl("b", "TE in: T<sub>leak</sub>", 0, 1, 0.01, 0.02) + sl("c", "TM in: T<sub>target</sub>", 0, 1, 0.01, 0.85) + sl("d", "TM in: T<sub>leak</sub>", 0, 1, 0.01, 0.05) + '<div class="readout" id="ro"></div>';
  const fix = (t, l) => { if (+$(t).value + +$(l).value > 1) $(l).value = (1 - +$(t).value).toFixed(2); };
  const draw = tt => {
    fix("a", "b"); fix("c", "d");
    const v = ["a", "b", "c", "d"].map(k => +$(k).value); ["a", "b", "c", "d"].forEach((k, i) => $(k + "v").textContent = v[i].toFixed(2));
    let s = "";
    const row = (y0, pol, col, tT, tL) => {
      const yTE = y0 - 30, yTM = y0 + 30, yt = pol === "TE" ? yTE : yTM, yl = pol === "TE" ? yTM : yTE;
      let g = `<text class="th" x="20" y="${y0 - 52}" style="font-size:12px">${pol}0 launched</text>`;
      g += `<rect x="40" y="${y0 - 4}" width="170" height="8" fill="#378ADD" fill-opacity="0.35"/><rect x="210" y="${y0 - 42}" width="110" height="84" rx="6" fill="var(--sunk)" stroke="var(--p)" stroke-dasharray="4 3"/><text class="ts" x="265" y="${y0 + 56}" text-anchor="middle">PBS</text>`;
      [yTE, yTM].forEach(y => g += `<rect x="320" y="${y - 4}" width="240" height="8" fill="#378ADD" fill-opacity="0.35"/>`);
      g += `<text class="ts" x="566" y="${yTE + 4}">TE port</text><text class="ts" x="566" y="${yTM + 4}">TM port</text>`;
      const flow = (x1, y1, x2, y2, w, c2) => w > 0.004 ? `<path d="M${x1} ${y1} C${x1 + 60} ${y1} ${x2 - 60} ${y2} ${x2} ${y2}" fill="none" stroke="${c2}" stroke-width="${(1 + 16 * w).toFixed(1)}" stroke-opacity="0.75" stroke-dasharray="10 8" stroke-dashoffset="${(-tt * 30).toFixed(1)}"/>` : "";
      g += flow(60, y0, 210, y0, 1, col) + flow(210, y0, 540, yt, tT, col) + flow(210, y0, 540, yl, tL, "#E24B4A");
      g += `<text class="ts" x="440" y="${yt + (yt < y0 ? -12 : 22)}" text-anchor="middle" style="fill:${col}">T<tspan baseline-shift="sub" font-size="9">target</tspan> = ${tT.toFixed(2)}</text><text class="ts" x="440" y="${yl + (yl < y0 ? -12 : 22)}" text-anchor="middle" style="fill:#E24B4A">T<tspan baseline-shift="sub" font-size="9">leak</tspan> = ${tL.toFixed(2)}</text>`;
      return g;
    };
    s += row(80, "TE", "#378ADD", v[0], v[1]) + row(240, "TM", "#D85A30", v[2], v[3]);
    s += C3L14_tag(500, 18);
    fig.innerHTML = svg(320, s);
    $("ro").innerHTML = `<div><span>TE in: target / leak / lost</span><b>${v[0].toFixed(2)} / ${v[1].toFixed(2)} / ${(1 - v[0] - v[1]).toFixed(2)}</b></div><div><span>TM in: target / leak / lost</span><b>${v[2].toFixed(2)} / ${v[3].toFixed(2)} / ${(1 - v[2] - v[3]).toFixed(2)}</b></div>`;
  };
  ["a", "b", "c", "d"].forEach(k => $(k).oninput = () => draw(0));
  draw(0);
  anim(t => { if (!fig.isConnected) { stopAnim(); return; } draw(t); });
}},

/* NEW CARD: ER and IL, Eq. 3.18 */
{s: "4. ER and IL", t: "Extinction ratio and insertion loss: distances on a log ruler",
intu: String.raw`Two decibel numbers summarize each input of the splitter. The extinction ratio (ER) compares the target with the leak: how many times more power goes where it should than where it should not. The insertion loss (IL) compares the target with one: how much of the launched power never reaches the intended port. On a logarithmic ruler both are plain distances. Every factor of ten is 10 dB, so ER is the distance from \(T_{\mathrm{leak}}\) up to \(T_{\mathrm{target}}\), and IL the distance from \(T_{\mathrm{target}}\) up to 1, which is 0 dB. A large ER and a small IL are good. Step through the ruler and move the sliders.`,
eq: String.raw`\[ \mathrm{ER} = 10\log_{10}\frac{T_{\mathrm{target}}}{T_{\mathrm{leak}}}, \qquad \mathrm{IL} = -10\log_{10} T_{\mathrm{target}} \]<div class="eqref">Ch. 3 Eq. (3.18)</div>\[ \mathrm{ER} = T_{\mathrm{target}}[\mathrm{dB}] - T_{\mathrm{leak}}[\mathrm{dB}], \qquad \mathrm{IL} = 0\ \mathrm{dB} - T_{\mathrm{target}}[\mathrm{dB}] \]`,
sym: [["ER", "extinction ratio in dB, larger is better"], ["IL", "insertion loss in dB, smaller is better, positive by this sign convention"], [String.raw`\(T[\mathrm{dB}] = 10\log_{10} T\)`, "a transmission on the decibel ruler, 0 dB for T = 1"]],
how: [String.raw`The logarithm turns a ratio into a difference: \(10\log_{10}(T_{\mathrm{target}}/T_{\mathrm{leak}}) = 10\log_{10}T_{\mathrm{target}} - 10\log_{10}T_{\mathrm{leak}}\).`, "So ER is the gap between the two marks on the ruler.", String.raw`IL is the gap between \(T_{\mathrm{target}}\) and \(T = 1\), with the minus sign making it positive.`, "Both are computed for each input polarization, from the four transmissions of card 3."],
say: "The extinction ratio is ten times the log of target over leak, and the insertion loss is minus ten times the log of the target. On a log ruler they are the distance from the leak to the target and from the target to one.",
num: String.raw`\(T_{\mathrm{target}} = 0.9\), \(T_{\mathrm{leak}} = 0.009\): ER \(= 10\log_{10}100 =\) <b>20 dB</b>, IL \(= -10\log_{10}0.9 =\) <b>0.46 dB</b>.<br>\(T_{\mathrm{target}} = 0.5\) alone already costs <b>3.0 dB</b> of insertion loss.`,
note: "Units to say out loud: ER and IL are in dB, the transmissions themselves are plain fractions. A 3 dB insertion loss means half the power is lost, a 10 dB extinction ratio means the leak is a tenth of the target.",
r(fig, ctl) {
  ctl.innerHTML = sl("t", "T<sub>target</sub>", 0.3, 1, 0.01, 0.9) + sl("l", "log<sub>10</sub> T<sub>leak</sub>", -4, -0.6, 0.05, -2.05) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="e4s"></div><p class="note" id="e4c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const CAP = ["", "Step 1. The ruler: transmission on a log scale. Each factor of 10 is 10 dB, and T = 1 is 0 dB.", "Step 2. Mark the target transmission.", "Step 3. Mark the leak, here far down the ruler.", "Step 4. ER is the distance from the leak up to the target, in dB.", "Step 5. IL is the distance from the target up to 0 dB."];
  const draw = S => {
    let Tt = +$("t").value, Tl = Math.pow(10, +$("l").value); if (Tl > Tt) { Tl = Tt; } $("tv").textContent = Tt.toFixed(2); $("lv").textContent = Tl.toExponential(1);
    const er = 10 * Math.log10(Tt / Tl), il = -10 * Math.log10(Tt), k = S.k;
    const X = C3.X(60, 560, -40, 0), ry = 120, dB = v => 10 * Math.log10(v);
    let s = `<line x1="60" x2="620" y1="${ry}" y2="${ry}" stroke="var(--t)" stroke-width="2"/>`;
    const nd = k === 1 ? Math.min(5, Math.floor(S.t * 3) + 1) : 5;
    for (let e = 0; e < nd; e++) { const d = -40 + 10 * e; s += `<line x1="${X(d)}" x2="${X(d)}" y1="${ry - 10}" y2="${ry + 10}" stroke="var(--t)" stroke-width="1.5"/><text class="ts" x="${X(d)}" y="${ry + 26}" text-anchor="middle">${d} dB</text><text class="ts" x="${X(d)}" y="${ry + 42}" text-anchor="middle">T = ${["0.0001", "0.001", "0.01", "0.1", "1"][e]}</text>`; if (e < 4) for (let m = 2; m < 10; m++) { const xm = X(d + 10 * Math.log10(m)); s += `<line x1="${xm}" x2="${xm}" y1="${ry - 4}" y2="${ry + 4}" stroke="var(--p)"/>`; } }
    if (k >= 2) s += `<circle cx="${X(dB(Tt))}" cy="${ry}" r="7" fill="#1D9E75"/><text class="th" x="${X(dB(Tt))}" y="${ry - 18}" text-anchor="middle" style="fill:#1D9E75;font-size:12px">T target</text>`;
    if (k >= 3) s += `<circle cx="${X(dB(Tl))}" cy="${ry}" r="7" fill="#E24B4A"/><text class="th" x="${X(dB(Tl))}" y="${ry - 18}" text-anchor="middle" style="fill:#E24B4A;font-size:12px">T leak</text>`;
    if (k >= 4) { const f = C3L14_ease(k === 4 ? S.t / 1.5 : 1), a = X(dB(Tl)), b = a + (X(dB(Tt)) - a) * f; s += `<line x1="${a}" x2="${b}" y1="${ry + 66}" y2="${ry + 66}" stroke="#378ADD" stroke-width="3" marker-end="url(#ar)"/><text class="th" x="${(a + X(dB(Tt))) / 2}" y="${ry + 88}" text-anchor="middle" style="fill:#378ADD">ER = ${(er * f).toFixed(1)} dB</text>`; }
    if (k >= 5) { const f = C3L14_ease(S.t / 1.5), a = X(dB(Tt)), b = a + (X(0) - a) * f; s += `<line x1="${a}" x2="${b}" y1="${ry - 46}" y2="${ry - 46}" stroke="#D85A30" stroke-width="3" marker-end="url(#ar)"/><text class="th" x="${Math.min(560, (a + X(0)) / 2)}" y="${ry - 56}" text-anchor="middle" style="fill:#D85A30">IL = ${(il * f).toFixed(2)} dB</text>`; }
    $("e4s").innerHTML = svg(230, s);
    $("e4c").textContent = CAP[k];
    $("ro").innerHTML = `<div><span>T target</span><b>${Tt.toFixed(2)} (${C3L14_dB(Tt)} dB)</b></div><div><span>T leak</span><b>${Tl.toExponential(1)} (${C3L14_dB(Tl)} dB)</b></div><div><span>ER</span><b>${er.toFixed(1)} dB</b></div><div><span>IL</span><b>${il.toFixed(2)} dB</b></div>`;
  };
  const S = C3L14_steps(fig, ctl, 5, 3, draw, "e4");
  $("t").oninput = () => draw(S); $("l").oninput = () => draw(S);
}},

/* NEW CARD: operating band */
{s: "5. Operating band", t: "The operating band: where both polarizations reach their ports",
intu: String.raw`A splitter has to work for both polarizations at once. Plot the target transmission of each input against wavelength: TE0 into the TE port and TM0 into the TM port. Each stays above 0.8 over some range, and the two ranges need not coincide. The operating band is their overlap, the wavelengths at which both polarizations reach their intended ports with \(T_{\mathrm{target}} \ge 0.8\). The spectra here are made up, flat-topped hills you can shift and widen. Press Play to sweep a wavelength cursor across and watch the check at each wavelength.`,
eq: String.raw`\[ \text{band} = \left\{ \lambda : T_{\mathrm{TE}\to\mathrm{TE\,port}}(\lambda) \ge 0.8 \ \text{and}\ T_{\mathrm{TM}\to\mathrm{TM\,port}}(\lambda) \ge 0.8 \right\} \]<div class="eqref">Ch. 3 Sec. 3.7, polarization beam splitters</div>`,
sym: [["0.8", "the threshold on each target transmission, about 1 dB of insertion loss"], ["blue, orange", "TE and TM target transmissions"], ["teal", "the operating band, where both are above 0.8"]],
how: ["Compute both target spectra.", "Mark where each is at or above 0.8.", "Intersect the two sets of wavelengths.", "Report the band and its width. If the two ranges do not overlap, there is no operating band."],
say: "The operating band is the wavelength range over which both polarizations reach their intended ports with a target transmission of at least 0.8.",
num: String.raw`Threshold 0.8 is an insertion loss of \(-10\log_{10}0.8 = 0.97\) dB, so in the operating band the insertion loss stays below about 1 dB for both inputs. Here the band is read on a 1 nm grid.`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "TE center (nm)", 755, 815, 0.5, 790) + sl("b", "TM center (nm)", 755, 815, 0.5, 800) + sl("w", "Half width (nm)", 8, 40, 0.5, 22) + `<div class="row"><button id="sp">Pause sweep</button></div><div class="readout" id="ro"></div>`;
  let play = true, lc = 735, last = performance.now();
  const draw = () => {
    const a = +$("a").value, b = +$("b").value, w = +$("w").value; $("av").textContent = a.toFixed(1); $("bv").textContent = b.toFixed(1); $("wv").textContent = w.toFixed(1);
    const ls = range(735, 835, 101), te = ls.map(l => C3L14_tt(l, 0.93, a, w)), tm = ls.map(l => C3L14_tt(l, 0.9, b, w * 0.9)), both = ls.map((_, i) => te[i] >= 0.8 && tm[i] >= 0.8);
    const X = C3.X(60, 440, 735, 835), Y = C3.Y(30, 190, 0, 1);
    let s = C3.frame(60, 30, 440, 190, 735, 835, 0, 1, [735, 760, 785, 810, 835], [0, 0.8, 1], "wavelength (nm)", "T target");
    const band = (arr, col, y, h, op) => { let r = "", st = -1; arr.concat([false]).forEach((v, i) => { if (v && st < 0) st = i; if (!v && st >= 0) { r += `<rect x="${X(ls[st] - 0.5)}" y="${y}" width="${X(ls[i - 1] + 0.5) - X(ls[st] - 0.5)}" height="${h}" fill="${col}" opacity="${op}"/>`; st = -1; } }); return r; };
    s += band(both, "#1D9E75", 30, 190, 0.14) + band(te.map(v => v >= 0.8), "#378ADD", 206, 6, 0.6) + band(tm.map(v => v >= 0.8), "#D85A30", 213, 6, 0.6);
    s += `<line x1="60" x2="500" y1="${Y(0.8)}" y2="${Y(0.8)}" stroke="var(--t)" stroke-dasharray="5 4"/>`;
    s += plot(60, 30, 440, 190, ls, te, 735, 835, 0, 1, "#378ADD", 2.5) + plot(60, 30, 440, 190, ls, tm, 735, 835, 0, 1, "#D85A30", 2.5, "6 4");
    const ix = Math.round(lc - 735), vt = te[ix], vm = tm[ix], ok = vt >= 0.8 && vm >= 0.8;
    s += `<line x1="${X(lc)}" x2="${X(lc)}" y1="30" y2="220" stroke="var(--t)" stroke-width="1.5"/><circle cx="${X(lc)}" cy="${Y(vt)}" r="4" fill="#378ADD"/><circle cx="${X(lc)}" cy="${Y(vm)}" r="4" fill="#D85A30"/>`;
    // splitter icon at the cursor wavelength
    const ix0 = 520, iy = 70;
    s += `<text class="th" x="${ix0 + 72}" y="${iy - 30}" text-anchor="middle" style="font-size:12px">at ${Math.round(lc)} nm</text><rect x="${ix0 + 40}" y="${iy - 18}" width="44" height="80" rx="5" fill="var(--sunk)" stroke="var(--p)" stroke-dasharray="3 3"/>`;
    s += `<line x1="${ix0}" x2="${ix0 + 40}" y1="${iy + 22}" y2="${iy + 22}" stroke="var(--p)" stroke-width="3"/><line x1="${ix0 + 84}" x2="${ix0 + 140}" y1="${iy}" y2="${iy}" stroke="#378ADD" stroke-width="${(1 + 9 * vt).toFixed(1)}" opacity="0.8"/><line x1="${ix0 + 84}" x2="${ix0 + 140}" y1="${iy + 44}" y2="${iy + 44}" stroke="#D85A30" stroke-width="${(1 + 9 * vm).toFixed(1)}" opacity="0.8"/>`;
    s += `<text class="ts" x="${ix0 + 112}" y="${iy - 9}" text-anchor="middle">TE ${vt.toFixed(2)}</text><text class="ts" x="${ix0 + 112}" y="${iy + 63}" text-anchor="middle">TM ${vm.toFixed(2)}</text><text class="th" x="${ix0 + 72}" y="${iy + 98}" text-anchor="middle" style="font-size:12px;fill:${ok ? "#1D9E75" : "#E24B4A"}">${ok ? "both ≥ 0.8: in band" : "not in band"}</text>`;
    s += C3.legend(70, 282, [["TE0 to TE port", "#378ADD"], ["TM0 to TM port", "#D85A30", "6 4"]]) + C3L14_tag(510, 200);
    fig.innerHTML = svg(290, s);
    const i0 = both.indexOf(true), i1 = both.lastIndexOf(true), rng = (arr) => { const p = arr.indexOf(true), q = arr.lastIndexOf(true); return p < 0 ? "none" : `${ls[p]} to ${ls[q]} nm`; };
    $("ro").innerHTML = `<div><span>TE ≥ 0.8</span><b>${rng(te.map(v => v >= 0.8))}</b></div><div><span>TM ≥ 0.8</span><b>${rng(tm.map(v => v >= 0.8))}</b></div><div><span>operating band</span><b>${i0 < 0 ? "none" : `${ls[i0]} to ${ls[i1]} nm`}</b></div><div><span>width</span><b>${i0 < 0 ? "0" : ls[i1] - ls[i0]} nm</b></div>`;
  };
  ["a", "b", "w"].forEach(k => $(k).oninput = draw);
  $("sp").onclick = () => { play = !play; $("sp").textContent = play ? "Pause sweep" : "Play sweep"; draw(); };
  draw();
  anim(() => { if (!fig.isConnected) { stopAnim(); return; } const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; if (play) { lc += 18 * dt; if (lc > 835) lc = 735; } draw(); });
}},

/* NEW CARD: validation run */
{s: "6. Validation run", t: "A taper is reported from a validation run, not from J",
intu: String.raw`During the optimization of a taper the code logs the objective \(J = T - w_{\kappa} P_{\kappa}\), the transmission into the fundamental mode at 795 nm minus the weighted curvature penalty of Eq. (3.16). \(J\) is what the optimizer climbs, but it is not a physical quantity: it sits below \(T\) by the penalty term, by an amount that depends on the chosen weight. So the thesis does not quote \(J\). It quotes \(T\) from a separate validation run, a fresh simulation of the final outline with no penalty and no gradient. A validation run also removes a quieter mismatch: in a gradient loop the last logged value belongs to the parameters before the last update. The histories here are synthetic. Step through and change the weight.`,
eq: String.raw`\[ J = F - w_{\kappa} P_{\kappa}, \qquad F = T_{795} \]<div class="eqref">Ch. 3 Eq. (3.16), with the taper objective of Sec. 3.4</div>\[ \text{reported: } T_{795} \text{ of a separate run of the final outline}, \quad \text{not } J \]<div class="eqref">Ch. 3 Sec. 3.7, tapers</div>`,
sym: [[String.raw`\(T_{795}\)`, "transmission into the fundamental mode at the wide end, at 795 nm"], [String.raw`\(w_{\kappa} P_{\kappa}\)`, "weighted curvature penalty, the gap between J and T"], ["validation run", "a separate simulation of the final outline, without penalty or gradient"], ["synthetic history", "made-up curves that only show the shapes"]],
how: [String.raw`The optimizer maximizes \(J\), so \(J\) is the right thing to log while optimizing.`, String.raw`\(J\) mixes physics with a design choice, the weight \(w_{\kappa}\), so its value is not a device property.`, "After the last step, the final outline is simulated once more, on its own.", String.raw`That run gives \(T\) at 795 nm, which is the number reported.`],
say: "A taper is reported by its transmission into the fundamental mode at 795 nm from a separate validation run of the final outline, not by the objective J, which includes the curvature penalty.",
num: String.raw`Synthetic illustration: \(T = 0.95\), \(P_{\kappa} = 0.10\) and \(w_{\kappa} = 0.5\) give \(J = 0.90\). Quoting \(J\) would understate the device by 0.05, and a different weight would give a different number for the same outline.`,
r(fig, ctl) {
  ctl.innerHTML = sl("w", "Penalty weight w<sub>κ</sub>", 0, 1, 0.01, 0.5) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div id="v6s"></div><p class="note" id="v6c" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const K = 60, Tk = k => 0.955 - 0.62 * Math.exp(-k / 11) + 0.006 * Math.sin(k * 1.3), Pk = k => 0.09 + 0.5 * Math.exp(-k / 14), Tval = 0.957;
  const CAP = ["", "Step 1. The transmission T at 795 nm rises as the outline is optimized (synthetic history).", "Step 2. The curvature penalty P falls as sharp corners are smoothed, but it does not reach zero.", "Step 3. The optimizer climbs J = T − w P, which always sits below T by the penalty term.", "Step 4. The optimization stops. Its last logged J is not a device property, it depends on the weight.", "Step 5. A separate validation run simulates the final outline once more, with no penalty. Its T at 795 nm is the number reported."];
  const draw = S => {
    const w = +$("w").value; $("wv").textContent = w.toFixed(2); const k = S.k;
    const ks = range(0, K, K + 1), X = C3.X(70, 400, 0, K + 8), Y = C3.Y(30, 190, 0, 1);
    let s = C3.frame(70, 30, 400, 190, 0, K + 8, 0, 1, [0, 20, 40, 60], [0, 0.5, 1], "optimizer step", "");
    const grow = k === 1 ? C3L14_ease(S.t / 2) : 1, nShow = Math.max(2, Math.round(K * grow));
    const sub = ks.slice(0, nShow + 1);
    s += plot(70, 30, 400, 190, sub, sub.map(Tk), 0, K + 8, 0, 1, "#1D9E75", 2.5);
    if (k >= 2) { const g = k === 2 ? C3L14_ease(S.t / 2) : 1, sb = ks.slice(0, Math.max(2, Math.round(K * g)) + 1); s += plot(70, 30, 400, 190, sb, sb.map(Pk), 0, K + 8, 0, 1, "#7F77DD", 2, "4 3"); }
    if (k >= 3) { const g = k === 3 ? C3L14_ease(S.t / 2) : 1, sb = ks.slice(0, Math.max(2, Math.round(K * g)) + 1); s += plot(70, 30, 400, 190, sb, sb.map(q => Tk(q) - w * Pk(q)), 0, K + 8, 0, 1, "#D85A30", 2.5); }
    if (k >= 4) { const Jl = Tk(K) - w * Pk(K); s += `<line x1="${X(K)}" x2="${X(K)}" y1="${Y(Tk(K))}" y2="${Y(Jl)}" stroke="var(--t)" stroke-width="1.5" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="${X(K) - 6}" y="${Y(Jl) + 20}" text-anchor="end">gap w P = ${(w * Pk(K)).toFixed(3)}</text><circle cx="${X(K)}" cy="${Y(Jl)}" r="5" fill="#D85A30"/>`; }
    if (k >= 5) { const g = C3L14_ease(S.t / 1.4); s += `<circle cx="${X(K + 6)}" cy="${Y(Tval)}" r="${(7 * g).toFixed(1)}" fill="#1D9E75" stroke="var(--t)"/><text class="th" x="${X(K + 6)}" y="${Y(Tval) - 12}" text-anchor="middle" style="font-size:12px;fill:#1D9E75">reported</text>`; }
    s += C3.legend(80, 276, [["T at 795 nm", "#1D9E75"], ["P_κ", "#7F77DD", "4 3"], ["J = T − w P", "#D85A30"]]);
    // right panel: the outline and the two runs
    const px = 500;
    s += `<text class="th" x="${px + 80}" y="40" text-anchor="middle" style="font-size:12px">${k >= 5 ? "validation run" : "optimization run"}</text><rect x="${px}" y="50" width="160" height="110" rx="8" fill="var(--sunk)" stroke="${k >= 5 ? "#1D9E75" : "var(--b)"}" stroke-width="${k >= 5 ? 2 : 1}"/>`;
    let d = `M${px + 12} 103`; for (let x = 0; x <= 1.0001; x += 0.05) d += `L${(px + 40 + 90 * x).toFixed(1)} ${(105 - 3 - 30 * Math.pow(Math.min(1, Math.max(0, x)), 1.6)).toFixed(1)}`; d += `L${px + 150} 72L${px + 150} 138`; for (let x = 1; x >= -0.0001; x -= 0.05) d += `L${(px + 40 + 90 * x).toFixed(1)} ${(105 + 3 + 30 * Math.pow(Math.max(0, x), 1.6)).toFixed(1)}`; d += `L${px + 12} 108Z`;
    s += `<path d="${d}" fill="#378ADD" fill-opacity="0.5" stroke="#0C447C"/><text class="ts" x="${px + 80}" y="178" text-anchor="middle">final taper outline</text>`;
    s += `<text class="ts" x="${px + 80}" y="198" text-anchor="middle">${k >= 5 ? "no penalty, no gradient" : "J = T − w P logged"}</text>`;
    s += C3L14_tag(px + 5, 222);
    $("v6s").innerHTML = svg(284, s);
    $("v6c").textContent = CAP[k];
    $("ro").innerHTML = `<div><span>last logged J</span><b>${(Tk(K) - w * Pk(K)).toFixed(3)}</b></div><div><span>w P at the end</span><b>${(w * Pk(K)).toFixed(3)}</b></div><div><span>validated T at 795 nm</span><b>${k >= 5 ? Tval.toFixed(3) : "run step 5"}</b></div>`;
  };
  const S = C3L14_steps(fig, ctl, 5, 3.2, draw, "v6");
  $("w").oninput = () => draw(S);
}}

],
summary: String.raw`Results are read the same way every time. A grating coupler is reported by its peak coupling efficiency, the wavelength of the peak, the efficiency at 795 nm, and the 1 dB bandwidth, the range over which the efficiency stays above \(10^{-0.1} = 0.794\) of the peak, read on a 1 nm grid. A polarization beam splitter is reported, for each input polarization, by \(T_{\mathrm{target}}\) and \(T_{\mathrm{leak}}\), by the extinction ratio \(10\log_{10}(T_{\mathrm{target}}/T_{\mathrm{leak}})\) and the insertion loss \(-10\log_{10}T_{\mathrm{target}}\), and by the operating band in which both targets are at least 0.8. A taper is reported by its transmission into the fundamental mode at 795 nm from a separate validation run of the final outline, not by the objective \(J\), which includes the curvature penalty. All curves in the lesson are synthetic.`,
sheet: [
[String.raw`\[ \mathrm{CE}_{\mathrm{peak}}, \quad \lambda_{\mathrm{peak}}, \quad \mathrm{CE}(795\ \mathrm{nm}) \]`, "Grating couplers: three numbers from the spectrum"],
[String.raw`\[ \mathrm{CE}(\lambda) \ge 10^{-0.1}\,\mathrm{CE}_{\mathrm{peak}} = 0.794\,\mathrm{CE}_{\mathrm{peak}} \]`, "1 dB bandwidth, read on a 1 nm grid"],
[String.raw`\[ T_{\mathrm{target}} + T_{\mathrm{leak}} \le 1 \]`, "Splitter transmissions for each input polarization"],
[String.raw`\[ \mathrm{ER} = 10\log_{10}\frac{T_{\mathrm{target}}}{T_{\mathrm{leak}}}, \qquad \mathrm{IL} = -10\log_{10} T_{\mathrm{target}} \]`, "Extinction ratio and insertion loss (Ch. 3 Eq. 3.18)"],
[String.raw`\[ T_{\mathrm{TE}\to\mathrm{TE\,port}} \ge 0.8 \ \text{and}\ T_{\mathrm{TM}\to\mathrm{TM\,port}} \ge 0.8 \]`, "Operating band"],
[String.raw`\[ \text{report } T_{795} \text{ from a validation run, not } J = T - w_{\kappa} P_{\kappa} \]`, "Tapers"]],
consts: "All spectra and histories are synthetic shapes for teaching. Grating spectra on a 1 nm grid from 745 to 845 nm, splitter spectra from 735 to 835 nm, the bands used for the objectives in Sec. 3.4.",
sources: ["Thesis Ch. 3 Sec. 3.7 and Eq. (3.18) (definitions of the reported quantities)", "Flexcompute, Tidy3D documentation: ModeMonitor and mode amplitudes (transmissions as mode powers)", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006) (coupling efficiency and bandwidth as the figures of merit of grating couplers)"]
});
