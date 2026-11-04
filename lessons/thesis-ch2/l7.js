addLesson("thesis", "ch2", {
level: "Advanced",
id: "thesis-ch2-l7", title: "Two-mode interference and polarization splitting", short: "7. Two-mode interference, PBS",
big: String.raw`This lesson follows the second half of Sec. 2.5 of the thesis. Two-mode interference is the special case of self-imaging in which only the modes \(\nu = 0\) and \(\nu = 1\) carry power, so only two terms of Eq. 2.12 remain (Eq. 2.14). For an input at \(+D\) the even and odd profiles add near \(+D\) and cancel near \(-D\). Every beat length the odd term changes sign and the light crosses to the mirror position. Written with the mode indices, the beat length is \(L_\pi = \lambda_0/[2(n_0 - n_1)]\) (Eq. 2.15), and in narrow sections such as those of the thesis \(n_0\) and \(n_1\) come from the mode solver because the quadratic law is not accurate. TE-like and TM-like light have different beat lengths, so a section of length \(L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}\) with \(p\) and \(q\) of opposite parity sends one polarization to the cross port and the other to the bar port. The closer the two beat lengths are, the longer the section, and since the tolerance to width and wavelength shrinks with length, such a splitter is narrowband and sensitive to fabrication.`,
bridge: "Follows Soldano and Pennings 1995, as in the thesis: two-mode interference (Sec. V-A) and the tolerances (Eq. (40)). The thesis takes n0 and n1 from the Tidy3D mode solver of the full cross-section. On this page the effective index method of a 160 nm membrane strip (n = 3.5, 800 nm) stands in for it, and the maps use ideal sine-shaped modes. It builds on Lesson 6 (self-imaging) and leads to the PBS designs of Chapter 4.",
cards: [
/* new card: two-mode interference (Eqs. 2.14 and 2.15) */
{s: "1. Two modes only", t: "Two modes only: the light switches sides every beat length",
intu: String.raw`Two-mode interference is the special case of Lesson 6 in which only the modes \(\nu = 0\) and \(\nu = 1\) carry power. Only two terms of Eq. 2.12 remain (Eq. 2.14). For an input at \(y = +D\), the even profile \(\psi_0\) (teal) and the odd profile \(\psi_1\) (purple) add near \(+D\) and cancel near \(-D\). As the light moves along the section the odd term turns its phase by \(\pi x/L_\pi\). After one beat length it has changed sign, so now the two add near \(-D\): the light has crossed to the mirror position. After two beat lengths it is back at \(+D\). Press Play and watch the profile at the cursor. Written with the effective indices \(n_0\) and \(n_1\) of the two modes, the beat length is Eq. 2.15. The lower plot shows why the thesis takes \(n_0\) and \(n_1\) from a mode solver: in narrow sections the quadratic law of Eq. 2.10 is not accurate. Here the effective index method of a 160 nm membrane strip stands in for the mode solver.`,
eq: String.raw`\[ \Psi(y, x) = c_0\,\psi_0(y) + c_1\,\psi_1(y)\, e^{\,j\pi x/L_\pi} \]\[ L_\pi = \frac{\lambda_0}{2\,(n_0 - n_1)} \]<div class="eqnote">in narrow sections the quadratic law \(L_\pi \approx 4 n_r W_e^2/(3\lambda_0)\) of Eq. 2.10 is not accurate, so \(n_0\) and \(n_1\) come from the mode solver</div><div class="eqref">Ch. 2 Eqs. (2.14) and (2.15), Soldano Sec. V-A</div>`,
sym: [[String.raw`\(\psi_0, \psi_1\)`, "even and odd lateral modes of the section"], [String.raw`\(c_0, c_1\)`, "their weights, from the overlap with the input (Eq. 2.11)"], [String.raw`\(\pi x/L_\pi\)`, "phase of the odd term relative to the even term after a distance x"], [String.raw`\(n_0, n_1\)`, "effective indices of the two modes of the full cross-section"], [String.raw`\(\pm D\)`, "input position and its mirror position"]],
how: [String.raw`Keep only \(\nu = 0\) and \(\nu = 1\) in Eq. 2.12. The phase of the \(\nu = 1\) term is \(\nu(\nu + 2)\pi x/(3L_\pi) = \pi x/L_\pi\), which gives Eq. 2.14.`, String.raw`At \(x = 0\) the even and odd profiles have the same sign at \(+D\) and opposite signs at \(-D\): the light is at \(+D\).`, String.raw`At \(x = L_\pi\) the factor \(e^{j\pi} = -1\) flips the odd term, so the two now add at \(-D\): the light has crossed. At \(2L_\pi\) it is back.`, String.raw`The beat length is defined by \(\beta_0 - \beta_1 = \pi/L_\pi\). With \(\beta = 2\pi n/\lambda_0\) this gives \(L_\pi = \lambda_0/[2(n_0 - n_1)]\), Eq. 2.15.`, String.raw`Eq. 2.10 assumes \(k_y \ll k_0 n_r\). In a narrow section that is no longer true, and the walls are not the ideal ones of the 2D model, so the real \(n_0 - n_1\) differs from the estimate. The thesis therefore takes \(n_0\) and \(n_1\) from the mode solver of the full cross-section.`],
say: String.raw`With only two modes the field is \(c_0\psi_0 + c_1\psi_1 e^{j\pi x/L_\pi}\). The odd term flips sign every beat length, so the light crosses from \(+D\) to \(-D\) every \(L_\pi = \lambda_0/[2(n_0 - n_1)]\). In narrow sections the quadratic law is not accurate, so \(n_0\) and \(n_1\) come from the mode solver.`,
num: String.raw`Effective index method, 160 nm membrane, \(n = 3.5\), 800 nm, TE-like, as a stand-in for the mode solver: at \(W_M = 0.5\) µm the quadratic law overestimates \(L_\pi\) by about <b>9 %</b>, at 0.3 µm by about <b>25 %</b>, at 2 µm by less than 1 %.<br>Example: \(n_0 - n_1 = 0.1\) at \(\lambda_0 = 800\) nm gives \(L_\pi = 4\) µm.`,
r(fig, ctl) {
  const W = 680, H = 90, Lmax = 4, yrow = range(0.5, -0.5, H), ys = range(-0.5, 0.5, 201);
  const p0 = y => Math.SQRT2 * Math.cos(Math.PI * y), p1 = y => Math.SQRT2 * Math.sin(2 * Math.PI * y), c = Math.SQRT1_2;
  const I = (y, x) => { const ph = Math.PI * x, re = c * p0(y) + c * p1(y) * Math.cos(ph), im = c * p1(y) * Math.sin(ph); return re * re + im * im; };
  let D = 0, best = 0; ys.forEach(y => { const v = I(y, 0); if (v > best) { best = v; D = y; } });
  let playing = true, xc = 0, last = performance.now();
  ctl.innerHTML = `<div class="row"><button id="tp">Pause</button></div>` + sl("tx", "Position along the section x / L<sub>π</sub>", 0, 4, 0.01, 0) + sl("tw", "Section width W<sub>M</sub> (µm), lower plot", 0.3, 3, 0.05, 0.5) + '<div class="readout" id="ro"></div>';
  fig.innerHTML = `<div style="position:relative"><canvas width="${W}" height="${H}" style="width:100%;display:block;border:1px solid var(--line);border-radius:4px;background:#fff"></canvas><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:100%;height:100%"><g id="tcur"></g></svg></div><div id="tmk"></div><div id="tpr"></div><div id="tlp"></div>`;
  const ctx = fig.querySelector("canvas").getContext("2d"), img = ctx.createImageData(W, H);
  for (let i = 0; i < W; i++) { const x = i / (W - 1) * Lmax; yrow.forEach((y, j) => { const [r, g, b] = C2.heat(Math.sqrt(I(y, x) / best)); const o = (j * W + i) * 4; img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; }); }
  ctx.putImageData(img, 0, 0);
  let mk = ""; for (let p = 1; p <= Lmax; p++) { const x = Math.min(p / Lmax * (W - 1), W - 8); mk += `<path d="M${x} 4 l-6 12 h12z" fill="${p % 2 ? "#7F77DD" : "#1D9E75"}"/><text class="ts" x="${x - 9}" y="16" text-anchor="end">${p === 1 ? "" : p}L<tspan baseline-shift="sub" font-size="9">π</tspan></text>`; }
  mk += `<text class="ts" x="4" y="34">top view, input at +D (upper side). Triangles: every beat length the light has crossed (purple: at −D, teal: back at +D)</text>`;
  $("tmk").innerHTML = svg(40, mk);
  // lower plot: Eq. 2.15 with EIM indices against the quadratic law of Eq. 2.10
  const nr = C2.slabN(3.5, 1, 160, 800, 0, "TE");
  const Lpi = w => { const n0 = C2.eim(3.5, 1, 160, w, 800, "TE", 0), n1 = C2.eim(3.5, 1, 160, w, 800, "TE", 1); if (!n0 || !n1) return null; const We = w + 800 / Math.PI * Math.pow(1 / nr, 2) / Math.sqrt(nr * nr - 1); return { n0, n1, ex: 800 / (2 * (n0 - n1)), qu: 4 * nr * We * We / (3 * 800) }; };
  const wsC = range(300, 3000, 55), errC = wsC.map(w => { const r = Lpi(w); return r ? (r.qu / r.ex - 1) * 100 : NaN; });
  const draw = () => {
    $("txv").textContent = xc.toFixed(2); const wM = +$("tw").value; $("twv").textContent = wM.toFixed(2) + " µm";
    $("tcur").innerHTML = `<line x1="${xc / Lmax * (W - 1)}" x2="${xc / Lmax * (W - 1)}" y1="0" y2="${H}" stroke="#378ADD" stroke-width="3"/>`;
    const ph = Math.PI * xc, Y = v => 112 - v * 40, X = y => 40 + (y + 0.5) * 320;
    const e0 = ys.map(y => c * p0(y)), e1 = ys.map(y => c * p1(y) * Math.cos(ph)), ab = ys.map(y => I(y, xc) / best * 1.8);
    let s = plot(40, 32, 320, 160, ys, e0, -0.5, 0.5, -2, 2, "#1D9E75", 2) + plot(40, 32, 320, 160, ys, e1, -0.5, 0.5, -2, 2, "#7F77DD", 2, "5 3") + plot(40, 32, 320, 160, ys, ab, -0.5, 0.5, -2, 2, "#D85A30", 2.5);
    s += `<line x1="40" x2="360" y1="112" y2="112" stroke="var(--p)"/>`;
    [[D, "+D"], [-D, "−D"]].forEach(([y, t]) => s += `<line x1="${X(y)}" x2="${X(y)}" y1="28" y2="196" stroke="var(--p)" stroke-dasharray="3 4"/><text class="ts" x="${X(y)}" y="210" text-anchor="middle">${t}</text>`);
    s += `<text class="ts" x="40" y="16">across the width at the cursor</text>`;
    const side = Math.cos(ph) > 0.3 ? "+D" : Math.cos(ph) < -0.3 ? "−D" : "between";
    s += `<text class="t" x="380" y="50" fill="#1D9E75">c₀ψ₀, even</text><text class="t" x="380" y="74" fill="#7F77DD">Re[c₁ψ₁ e<tspan baseline-shift="super" font-size="9">jπx/Lπ</tspan>], odd</text><text class="t" x="380" y="98" fill="#D85A30">|Ψ|², the light</text><text class="th" x="380" y="140">phase of the odd term: ${(ph / Math.PI % 2).toFixed(2)} π</text><text class="th" x="380" y="166">light sits at ${side}</text>`;
    $("tpr").innerHTML = svg(218, s);
    const r = Lpi(wM * 1000), Xw = w => 60 + (w - 300) / 2700 * 560, Ye = e => 120 - Math.min(40, Math.max(-5, e)) / 40 * 90;
    let q = `<text class="ts" x="60" y="20">quadratic law (Eq. 2.10) against Eq. 2.15 with mode indices, error of L<tspan baseline-shift="sub" font-size="9">π</tspan> in %</text>`;
    q += plot(60, 30, 560, 90, wsC, errC, 300, 3000, -5, 40, "#BA7517", 2.5);
    q += `<line x1="60" x2="620" y1="${Ye(0)}" y2="${Ye(0)}" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="120" stroke="var(--p)"/><text class="ts" x="54" y="${Ye(40) + 4}" text-anchor="end">40</text><text class="ts" x="54" y="${Ye(0) + 4}" text-anchor="end">0</text><line x1="${Xw(wM * 1000)}" x2="${Xw(wM * 1000)}" y1="30" y2="120" stroke="#378ADD" stroke-width="2"/><text class="ts" x="60" y="138">0.3 µm</text><text class="ts" x="620" y="138" text-anchor="end">3 µm</text><text class="ts" x="340" y="138" text-anchor="middle">section width W<tspan baseline-shift="sub" font-size="9">M</tspan></text>`;
    $("tlp").innerHTML = svg(144, q);
    $("ro").innerHTML = r ? `<div><span>n₀, n₁ (effective index method)</span><b>${r.n0.toFixed(3)}, ${r.n1.toFixed(3)}</b></div><div><span>L<sub>π</sub> from Eq. 2.15</span><b>${(r.ex / 1000).toFixed(2)} µm</b></div><div><span>L<sub>π</sub> from Eq. 2.10</span><b>${(r.qu / 1000).toFixed(2)} µm</b></div><div><span>error of Eq. 2.10</span><b>${((r.qu / r.ex - 1) * 100).toFixed(1)} %</b></div>` : `<div><span>second mode</span><b>cut off at this width</b></div>`;
  };
  $("tp").onclick = () => { playing = !playing; $("tp").textContent = playing ? "Pause" : "Play"; };
  $("tx").oninput = () => { xc = +$("tx").value; playing = false; $("tp").textContent = "Play"; draw(); };
  $("tw").oninput = draw;
  draw();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (playing) { xc += dt * 0.4; if (xc > Lmax) xc = 0; $("tx").value = xc.toFixed(2); draw(); }
  });
}},

/* from old ch2 L7 card 5 */
{s: "2. Splitting TE and TM", t: "Two-mode interference and polarization splitting",
intu: String.raw`Keep only the two lowest modes. Then the light just swaps from one side to the other every beat length \(L_\pi\): the even and odd mode add on one side and cancel on the other, and every \(L_\pi\) the odd mode flips sign. TE-like and TM-like light have different beat lengths, because \(L_\pi\) depends on the index and the effective width. Pick a section length where one polarization has crossed an odd number of times (cross port) and the other an even number (bar port), and the section splits polarizations. This is the thesis figure on two-mode interference, computed live: with a ratio of 1.5 and a length of \(3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\), TE-like light leaves through the cross port and TM-like light through the bar port. Drag the length and the TM/TE beat length ratio.`,
eq: String.raw`\[ \Psi(y, x) = c_0\psi_0 + c_1\psi_1\, e^{j\pi x/L_\pi} \qquad L_\pi = \frac{\lambda_0}{2(n_0 - n_1)} \]<div class="eqnote">splitter</div>\[ L = p\, L_\pi^{\mathrm{TE}} = q\, L_\pi^{\mathrm{TM}}, \quad p \text{ and } q \text{ of opposite parity} \]<div class="eqref">Ch. 2 Eqs. (2.14) and (2.15), Sec. 2.5 and Fig. 2.6</div>`,
sym: [[String.raw`\(n_0, n_1\)`, "effective indices of the two lowest modes of the section, from a mode solver"], [String.raw`\(p, q\)`, "number of crossings for TE and TM"], ["bar port", "output on the input side (even number of crossings)"], ["cross port", "output on the opposite side (odd)"]],
how: [String.raw`With two modes, the phase difference grows as \(\pi x/L_\pi\).`, String.raw`At \(x = L_\pi\) the odd mode has flipped sign, moving the light to the mirror side.`, String.raw`TE and TM have different \(n_0 - n_1\), so different \(L_\pi\).`, String.raw`Choose \(L\) so the two polarizations end with opposite parity. Soldano notes the different imaging lengths of TE and TM as a problem for couplers, a splitter uses it on purpose.`],
say: "In two-mode interference the light crosses the section once per beat length. Because TE-like and TM-like light have different beat lengths, a length that is an odd multiple for one and an even multiple for the other separates them.",
num: String.raw`Ratio \(L_\pi^{\mathrm{TM}}/L_\pi^{\mathrm{TE}} = 1.5\): \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\) (\(p = 3\) odd, \(q = 2\) even): TE to cross, TM to bar.<br>The closer the ratio is to 1, the longer the device must be.`,
r(fig, ctl) {
  ctl.innerHTML = sl("r", "L<sub>π</sub><sup>TM</sup> / L<sub>π</sub><sup>TE</sup>", 1.05, 2.5, 0.01, 1.5) + sl("L", "Section length in units of L<sub>π</sub><sup>TE</sup>", 0.2, 8, 0.01, 3) + `<div class="row"><button id="best">Find shortest splitter</button></div><div class="readout" id="ro"></div>`;
  const draw = (ctx, img, W, H, y0, Lpi, Ltot, row) => {
    const ys = range(-0.5, 0.5, H), wi = 0.08, inp = ys.map(y => Math.exp(-Math.pow((y - y0) / wi, 2)));
    const p0 = ys.map(y => Math.cos(Math.PI * y)), p1 = ys.map(y => Math.sin(2 * Math.PI * y));
    let a0 = 0, a1 = 0, n0 = 0, n1 = 0; inp.forEach((v, i) => { a0 += v * p0[i]; a1 += v * p1[i]; n0 += p0[i] ** 2; n1 += p1[i] ** 2; }); a0 /= n0; a1 /= n1;
    for (let i = 0; i < W; i++) { const x = i / (W - 1) * Ltot; for (let j = 0; j < H; j++) { const ph = Math.PI * x / Lpi; const re = a0 * p0[j] + a1 * p1[j] * Math.cos(ph), im = a1 * p1[j] * Math.sin(ph); const v = Math.min(1, Math.sqrt(re * re + im * im)); const [r, g, b] = C2.heat(v); const o = ((row + (H - 1 - j)) * W + i) * 4; img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; } }
    const ph = Math.PI * Ltot / Lpi; let top = 0, bot = 0; ys.forEach((y, j) => { const re = a0 * p0[j] + a1 * p1[j] * Math.cos(ph), im = a1 * p1[j] * Math.sin(ph); const v = re * re + im * im; if (y > 0) top += v; else bot += v; });
    return top / (top + bot);
  };
  const u = () => {
    const r = +$("r").value, L = +$("L").value; $("rv").textContent = r.toFixed(2); $("Lv").textContent = L.toFixed(2);
    const W = 300, H = 50, G = 8;
    const { ctx, img } = C2.canvas(fig, W, 2 * H + G, 2.2, "top: TE-like, bottom: TM-like. Input on the upper side (y₀ = +W/4). Light moving left to right.");
    for (let k = 0; k < W * G; k++) { const o = (H * W + k) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = 255; }
    const fTE = draw(ctx, img, W, H, 0.25, 1, L, 0), fTM = draw(ctx, img, W, H, 0.25, r, L, H + G);
    ctx.putImageData(img, 0, 0);
    const port = f => f > 0.5 ? "bar" : "cross";
    $("ro").innerHTML = `<div><span>TE-like exits</span><b>${port(fTE)} (${(Math.max(fTE, 1 - fTE) * 100).toFixed(0)} %)</b></div><div><span>TM-like exits</span><b>${port(fTM)} (${(Math.max(fTM, 1 - fTM) * 100).toFixed(0)} %)</b></div><div><span>split?</span><b>${port(fTE) !== port(fTM) && Math.min(Math.max(fTE, 1 - fTE), Math.max(fTM, 1 - fTM)) > 0.9 ? "yes" : "no"}</b></div>`;
  };
  $("best").onclick = () => { const r = +$("r").value; let best = null; for (let p = 1; p <= 8 && !best; p++) for (let q = 1; q <= 8; q++) if ((p + q) % 2 === 1 && Math.abs(p / q - r) < 0.04) { best = p; break; } if (best) { $("L").value = best; } u(); };
  $("r").oninput = u; $("L").oninput = u; u();
}},

/* new card: opposite parity and the shortest splitter (Sec. 2.5) */
{s: "3. Opposite parity", t: "Opposite parity: the shortest length that splits",
intu: String.raw`TE-like and TM-like light have different mode indices and therefore different beat lengths. With output ports at \(\pm D\), a section of length \(L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}\) sends each polarization to a port set by how many times it has crossed. An odd count ends at the cross port, an even count at the bar port. So if \(p\) and \(q\) have opposite parity, one polarization leaves through the cross port and the other through the bar port. Choose the ratio of the two beat lengths. The page searches for the shortest length that is a whole number of beat lengths for one polarization while the other is at least 90 % in the opposite port, draws where the light of each polarization is along the section, and runs a dot along each path. The lower plot shows the shortest length for every ratio. The closer the ratio is to 1, the longer the section must be.`,
eq: String.raw`\[ L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}, \qquad p \text{ and } q \text{ of opposite parity} \]\[ \text{odd} \to \text{cross port}, \qquad \text{even} \to \text{bar port} \]<div class="eqnote">estimate of the shortest such length, from the phase difference of the two polarizations</div>\[ L \left(\frac{1}{L_\pi^{\mathrm{TE}}} - \frac{1}{L_\pi^{\mathrm{TM}}}\right) \approx 1 \;\Longrightarrow\; L_{\min} \approx \frac{L_\pi^{\mathrm{TE}} L_\pi^{\mathrm{TM}}}{L_\pi^{\mathrm{TM}} - L_\pi^{\mathrm{TE}}} \]<div class="eqref">Ch. 2 Sec. 2.5 and Fig. 2.6, Soldano Sec. V-A</div>`,
sym: [[String.raw`\(L_\pi^{\mathrm{TE}}, L_\pi^{\mathrm{TM}}\)`, "beat lengths of TE-like and TM-like light (Eq. 2.15 for each)"], [String.raw`\(p, q\)`, "number of crossings of each polarization over the length L"], ["cross port", "output at the mirror position −D, reached after an odd number of crossings"], ["bar port", "output at +D, on the input side, reached after an even number"], [String.raw`\(L_{\min}\)`, "shortest splitter length, the estimate of the last line"]],
how: [String.raw`From card 1, light of beat length \(L_\pi\) has crossed \(L/L_\pi\) times after a length \(L\). It ends at the cross port if that number is odd and at the bar port if it is even.`, String.raw`For a splitter both counts must be whole numbers, \(p = L/L_\pi^{\mathrm{TE}}\) and \(q = L/L_\pi^{\mathrm{TM}}\), and they must differ in parity.`, String.raw`Opposite parity means \(p - q\) is odd. The smallest choice is \(p - q = 1\), which gives the estimate \(L_{\min}\) on the last line.`, String.raw`When the two beat lengths are close, \(1/L_\pi^{\mathrm{TE}} - 1/L_\pi^{\mathrm{TM}}\) is small and \(L_{\min}\) grows: a ratio of 1.5 needs \(3L_\pi^{\mathrm{TE}}\), for a ratio of 1.1 the estimate is already \(11L_\pi^{\mathrm{TE}}\), and even accepting 90 % in each port the page needs \(8.8L_\pi^{\mathrm{TE}}\).`, "Real ratios are rarely exact fractions, so the page takes a whole number of beat lengths for one polarization and accepts the other if at least 90 % of it reaches its port. The next card shows why a long section is a problem."],
say: String.raw`A section of length \(L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}\) with \(p\) and \(q\) of opposite parity sends one polarization to the cross port and the other to the bar port. The closer the two beat lengths are, the longer the section has to be.`,
num: String.raw`Ratio 1.5 (the thesis figure): \(L = 3L_\pi^{\mathrm{TE}} = 2L_\pi^{\mathrm{TM}}\), TE-like to cross, TM-like to bar.<br>Ratio 2: \(L = 2L_\pi^{\mathrm{TE}} = L_\pi^{\mathrm{TM}}\), TE-like to bar, TM-like to cross.<br>Ratio 1.1: estimate \(L_{\min} \approx 1.1/0.1 = 11\,L_\pi^{\mathrm{TE}}\). With 90 % accepted, \(L = 8L_\pi^{\mathrm{TM}} = 8.8L_\pi^{\mathrm{TE}}\).`,
r(fig, ctl) {
  const crossF = (L, Lp) => Math.pow(Math.sin(Math.PI * L / (2 * Lp)), 2);
  const shortest = r => { let best = null; for (let k = 1; k <= 120; k++) for (const [L, exactTE] of [[k, true], [k * r, false]]) { if (best && L >= best.L) continue; const a = crossF(L, 1), c = crossF(L, r), m1 = Math.min(a, 1 - c), m2 = Math.min(1 - a, c), m = Math.max(m1, m2); if (m >= 0.9) best = { L, m, teCross: m1 >= m2 }; } return best; };
  const rC = range(1.05, 2.5, 59), LC = rC.map(r => { const b = shortest(r); return b ? b.L : NaN; });
  let playing = true, tt = 0, last = performance.now(), cache = null;
  ctl.innerHTML = sl("pr", "Beat length ratio L<sub>π</sub><sup>TM</sup> / L<sub>π</sub><sup>TE</sup>", 1.05, 2.5, 0.01, 1.5) + `<div class="row"><button id="op">Pause</button></div><div class="readout" id="ro"></div>`;
  const draw = () => {
    const r = +$("pr").value; $("prv").textContent = r.toFixed(2);
    if (!cache || cache.r !== r) cache = { r, b: shortest(r) };
    const b = cache.b, L = b.L, x0 = 70, x1 = 590, yc = 120, D = 46, X = x => x0 + x / L * (x1 - x0);
    let s = `<rect x="${x0}" y="${yc - 70}" width="${x1 - x0}" height="140" fill="#7FA6D9" opacity="0.18" stroke="var(--p)"/>`;
    s += `<rect x="20" y="${yc - D - 8}" width="${x0 - 20}" height="16" fill="#7FA6D9" opacity="0.6"/><text class="ts" x="22" y="${yc - D - 14}">input</text>`;
    [[yc - D, "bar port, +D"], [yc + D, "cross port, −D"]].forEach(([y, t]) => s += `<rect x="${x1}" y="${y - 8}" width="${670 - x1}" height="16" fill="#7FA6D9" opacity="0.6"/><text class="ts" x="668" y="${y - 12}" text-anchor="end">${t}</text>`);
    const path = (Lp, col, dash) => { let d = ""; for (let i = 0; i <= 260; i++) { const x = i / 260 * L; d += (i ? "L" : "M") + X(x).toFixed(1) + " " + (yc - D * Math.cos(Math.PI * x / Lp)).toFixed(1); } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
    s += path(1, "#378ADD") + path(r, "#D85A30", "6 4");
    for (let k = 1; k <= L / 1 + 0.01; k++) s += `<path d="M${X(k)} ${yc + 74} l-5 9 h10z" fill="#378ADD"/>`;
    for (let k = 1; k <= L / r + 0.01; k++) s += `<path d="M${X(k * r)} ${yc - 74} l-5 -9 h10z" fill="#D85A30"/>`;
    const f = (tt % 7) / 6, xd = Math.min(1, f) * L;
    s += `<circle cx="${X(xd)}" cy="${yc - D * Math.cos(Math.PI * xd)}" r="6" fill="#378ADD"/><circle cx="${X(xd)}" cy="${yc - D * Math.cos(Math.PI * xd / r)}" r="6" fill="#D85A30"/>`;
    s += `<text class="ts" x="${x0}" y="${yc - 86}">TM-like path (coral dashed), triangles at every L<tspan baseline-shift="sub" font-size="9">π</tspan><tspan baseline-shift="super" font-size="9">TM</tspan></text><text class="ts" x="${x0}" y="${yc + 98}">TE-like path (blue), triangles at every L<tspan baseline-shift="sub" font-size="9">π</tspan><tspan baseline-shift="super" font-size="9">TE</tspan>. Drawn: where the light is, its centre across the width</text>`;
    // lower plot
    const P0 = 258, PH = 110, Xr = v => 70 + (v - 1.05) / 1.45 * 520, Yl = v => P0 + PH - Math.min(v, 25) / 25 * PH;
    s += `<line x1="70" x2="590" y1="${P0 + PH}" y2="${P0 + PH}" stroke="var(--p)"/><line x1="70" x2="70" y1="${P0}" y2="${P0 + PH}" stroke="var(--p)"/>`;
    s += plot(70, P0, 520, PH, rC, rC.map(v => v / (v - 1)), 1.05, 2.5, 0, 25, "#888780", 1.5, "4 4");
    rC.forEach((v, i) => { if (isFinite(LC[i])) s += `<circle cx="${Xr(v).toFixed(1)}" cy="${Yl(LC[i]).toFixed(1)}" r="2.6" fill="#7F77DD"/>`; });
    s += `<circle cx="${Xr(r)}" cy="${Yl(L)}" r="6" fill="none" stroke="#EF9F27" stroke-width="2.5"/>`;
    s += `<text class="ts" x="64" y="${P0 + 6}" text-anchor="end">25</text><text class="ts" x="64" y="${P0 + PH}" text-anchor="end">0</text><text class="ts" x="70" y="${P0 + PH + 16}">ratio 1.05</text><text class="ts" x="590" y="${P0 + PH + 16}" text-anchor="end">2.5</text><text class="ts" x="80" y="${P0 - 6}">shortest splitter length in units of L<tspan baseline-shift="sub" font-size="9">π</tspan><tspan baseline-shift="super" font-size="9">TE</tspan> (purple dots). Grey dashed: estimate r/(r − 1)</text>`;
    fig.innerHTML = svg(P0 + PH + 24, s);
    const p = L, q = L / r, te = b.teCross ? "cross" : "bar", tm = b.teCross ? "bar" : "cross";
    const fmt = v => Math.abs(v - Math.round(v)) < 0.005 ? Math.round(v) : "≈ " + v.toFixed(2);
    $("ro").innerHTML = `<div><span>shortest length L</span><b>${L.toFixed(2)} L<sub>π</sub><sup>TE</sup></b></div><div><span>p = L / L<sub>π</sub><sup>TE</sup></span><b>${fmt(p)} → TE-like ${te}</b></div><div><span>q = L / L<sub>π</sub><sup>TM</sup></span><b>${fmt(q)} → TM-like ${tm}</b></div><div><span>worse port share</span><b>${(b.m * 100).toFixed(0)} %</b></div>`;
  };
  $("op").onclick = () => { playing = !playing; $("op").textContent = playing ? "Pause" : "Play"; draw(); };
  $("pr").oninput = () => { tt = 0; draw(); };
  draw();
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (playing) { tt += dt; draw(); }
  });
}},

/* from old ch2 L7 card 6 */
{s: "4. Tolerances", t: "Why long MMIs are fussy",
intu: String.raw`Soldano and Pennings show that the image stays sharp over a fixed length shift \(\delta L\), set by the size of the image itself (its Rayleigh range), not by the device. Every error in width, wavelength or index shifts the imaging length by a fraction of \(L\). So the allowed relative errors shrink as \(1/L\): a device twice as long tolerates half the width error and half the bandwidth. Their conclusion is that MMIs should be made as short as possible, and that the section width is by far the most critical parameter. Drag the length and see the tolerances fall. For the splitter this is the last sentence of Sec. 2.5: a splitter that needs many beat lengths is long, so it is narrowband and sensitive to fabrication. The same logic is why the FDTD phase error of lesson B2 (Beyond the thesis) matters most for long interference devices.`,
eq: String.raw`\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_e}{W_e} \approx \frac{\delta\lambda}{\lambda_0} \approx \frac{\delta n_r}{n_r}, \qquad \delta L \text{ fixed by the image} \]<div class="eqref">Soldano Eq. (40), cited in Ch. 2 Sec. 2.5</div>`,
sym: [[String.raw`\(\delta L\)`, "length shift that costs a fixed small loss (0.5 dB in their paper)"], [String.raw`\(\delta W_e, \delta\lambda, \delta n_r\)`, "tolerable errors in width, wavelength and index"], [String.raw`\(L\)`, "device length"]],
how: [String.raw`\(L_\pi \propto n_r W_e^2/\lambda_0\) (Eq. 2.10, Lesson 6 card 3).`, String.raw`Take the relative change: \(\delta L_\pi/L_\pi = \delta n_r/n_r + 2\delta W_e/W_e - \delta\lambda/\lambda_0\).`, String.raw`The device works while the imaging length moves by less than the fixed \(\delta L\).`, String.raw`So each allowed relative error is about \(\delta L/L\), which falls as \(1/L\).`],
say: String.raw`The tolerance of an MMI to its width and to the wavelength shrinks as its length grows, because the allowed relative errors scale as \(\delta L/L\) with \(\delta L\) fixed by the image. So a splitter that needs many beat lengths is narrowband and sensitive to fabrication.`,
num: String.raw`Soldano's example (\(W_e\) 8 µm, \(L\) 240 µm, \(n_r\) 3.24, 1.52 µm): \(\delta L\) ≈ <b>15 µm</b>, \(\delta W_e\) ≈ <b>0.25 µm</b>, \(\delta\lambda\) ≈ <b>95 nm</b>, \(\delta n_r\) ≈ <b>0.20</b>.<br>Double the length and all four halve.`,
r(fig, ctl) {
  ctl.innerHTML = sl("L", "Device length (× the example)", 0.25, 8, 0.05, 1) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const f = +$("L").value; $("Lv").textContent = f.toFixed(2) + "×";
    const L = 240 * f, dW = 0.25 / f, dl = 95 / f, dn = 0.2 / f;
    const xs = range(0.25, 8, 100), ys = xs.map(x => 95 / x);
    fig.innerHTML = svg(250, `${plot(60, 30, 560, 180, xs, ys, 0.25, 8, 0, 380, "#378ADD", 2.5)}<line x1="${60 + (f - 0.25) / 7.75 * 560}" x2="${60 + (f - 0.25) / 7.75 * 560}" y1="30" y2="210" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="210" y2="210" stroke="var(--p)"/><line x1="60" x2="60" y1="30" y2="210" stroke="var(--p)"/><text class="ts" x="340" y="232" text-anchor="middle">bandwidth δλ (nm) versus length, scaled from Soldano's example</text>`);
    $("ro").innerHTML = `<div><span>length</span><b>${L.toFixed(0)} µm</b></div><div><span>δW<sub>e</sub></span><b>${(dW * 1000).toFixed(0)} nm</b></div><div><span>δλ</span><b>${dl.toFixed(0)} nm</b></div><div><span>δn<sub>r</sub></span><b>${dn.toFixed(3)}</b></div>`;
  };
  $("L").oninput = u; u();
}}

],
summary: String.raw`When only the two lowest modes carry power, Eq. 2.12 keeps two terms, \(\Psi(y, x) = c_0\psi_0(y) + c_1\psi_1(y)\,e^{j\pi x/L_\pi}\) (Eq. 2.14). For an input at \(+D\) the even and odd profiles add near \(+D\). After one beat length the odd term has changed sign and the light sits at \(-D\), after two it is back. With the mode indices, \(L_\pi = \lambda_0/[2(n_0 - n_1)]\) (Eq. 2.15). In narrow sections the quadratic law of Eq. 2.10 is not accurate, so \(n_0\) and \(n_1\) come from the mode solver of the full cross-section. TE-like and TM-like light have different beat lengths. A length \(L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}\) with \(p\) and \(q\) of opposite parity sends one polarization to the cross port and the other to the bar port. The closer the beat lengths, the longer the section, roughly \(L_\pi^{\mathrm{TE}}L_\pi^{\mathrm{TM}}/(L_\pi^{\mathrm{TM}} - L_\pi^{\mathrm{TE}})\). The tolerance of an MMI to its width and to the wavelength shrinks as its length grows (Soldano Eq. (40)), so a splitter that needs many beat lengths is narrowband and sensitive to fabrication.`,
sheet: [
[String.raw`\[ \Psi(y, x) = c_0\,\psi_0(y) + c_1\,\psi_1(y)\, e^{\,j\pi x/L_\pi} \]`, "Two-mode interference (Ch. 2 Eq. 2.14, Soldano Sec. V-A)"],
[String.raw`\[ L_\pi = \frac{\lambda_0}{2\,(n_0 - n_1)} \]`, String.raw`Beat length from the mode indices, \(n_0\) and \(n_1\) from the mode solver (Ch. 2 Eq. 2.15)`],
[String.raw`\[ L = p\,L_\pi^{\mathrm{TE}} = q\,L_\pi^{\mathrm{TM}}, \quad p, q \text{ of opposite parity} \]`, "Polarization splitter: odd count to the cross port, even count to the bar port (Sec. 2.5)"],
[String.raw`\[ L_{\min} \approx \frac{L_\pi^{\mathrm{TE}} L_\pi^{\mathrm{TM}}}{L_\pi^{\mathrm{TM}} - L_\pi^{\mathrm{TE}}} \]`, "Closer beat lengths need a longer section (estimate)"],
[String.raw`\[ \frac{\delta L}{L} \approx \frac{2\,\delta W_e}{W_e} \approx \frac{\delta\lambda}{\lambda_0} \]`, "Tolerances shrink as the length grows (Soldano Eq. (40))"]],
consts: "Maps use ideal sine-shaped lateral modes. Mode indices for the narrow-section comparison come from the effective index method for a 160 nm membrane, n = 3.5, at 800 nm, as a stand-in for the mode solver. Not thesis values.",
sources: ["Soldano and Pennings, J. Lightwave Technol. 13, 615 (1995): Sec. V-A (two-mode interference), Eq. (40) (tolerances of width, wavelength and index).", "Tidy3D mode solver (Flexcompute): used in the thesis for the mode indices n0 and n1 of the full cross-section. Not run on this page."]
});
