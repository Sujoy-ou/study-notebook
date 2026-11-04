/* Helpers for this lesson (prefix L5_). */
const L5_SUB = t => `<tspan baseline-shift="sub" font-size="9">${t}</tspan>`;
/* Field reflection phasors of a quarter-wave stack, single-reflection picture.
   Light enters from n0, layers [[n, d], ...], then a substrate ns. Returns [{re, im, r, k}] per interface. */
const L5_phasors = (n0, layers, ns, lam) => {
  const out = []; let ph = 0, prev = n0;
  const all = layers.concat([[ns, 0]]);
  all.forEach(([n, d], k) => { const r = (prev - n) / (prev + n); if (Math.abs(r) > 1e-9) out.push({ re: r * Math.cos(ph), im: r * Math.sin(ph), r, k }); ph += 2 * (2 * Math.PI / lam) * n * d; prev = n; });
  return out;
};
addLesson("thesis", "ch2", {
level: "Intermediate",
id: "thesis-ch2-l5", title: "The DBR mirror and the air gap", short: "5. DBR and air gap",
big: String.raw`This lesson follows Sec. 2.4 of the thesis. A grating radiates down as well as up, and a DBR under the membrane sends the downward light back. A DBR is a stack of alternating high-index and low-index layers. Each interface reflects a little, with \(r = (n_1 - n_2)/(n_1 + n_2)\) (Eq. 2.4), and the sign of \(r\) alternates from one interface to the next. Each layer is a quarter wavelength thick in its material (Eq. 2.5), so a round trip adds \(\pi\), and together with the alternating sign all reflections return in phase at \(\lambda_0\) and add. GaAs and AlGaAs have a small index contrast, so many pairs are needed (Eq. 2.6) and the high reflectance holds only over a stopband (Eq. 2.7). The distance between the grating and the DBR then sets the phase of the returning light relative to the light going straight up. That phase decides whether they add or cancel, so the gap changes how much light goes up and how strongly the grating scatters, and it is chosen together with the grating.`,
bridge: "The DBR formulas follow Gačević and Vukmirović 2018, as in the thesis: the reflection coefficient and its alternating sign (Sec. II B and Fig. 1), the quarter-wave condition (Sec. II A), the peak reflectance (Eq. (2)) and the stopband (Eq. (3)). Their paper studies how disordered interfaces degrade a real DBR. The point about the air gap follows Taillaert et al. 2006. All curves here are computed live with a transfer matrix, using round example indices 3.5 and 3.0 at 800 nm.",
cards: [
/* from old ch2 L6 card 1 */
{s: "1. One interface", t: "One interface reflects only a little",
intu: String.raw`Every interface between two materials reflects a bit of light. The amplitude reflection coefficient depends only on the two indices. The coefficient is negative when the light enters the higher index, which is a phase shift of \(\pi\), and positive when it enters the lower index. In a stack of alternating layers its sign therefore alternates from one interface to the next (Gačević Fig. 1). For GaAs against AlGaAs the indices are close, so each interface reflects only a few tenths of a percent of the power. A useful mirror has to stack many of these small reflections so they all add in phase. Drag the indices.`,
eq: String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}}, \qquad R = r^{2} \quad \text{(normal incidence, from } n_{1} \text{ into } n_{2}\text{)} \]\[ r \lt 0 \ \text{when}\ n_{2} \gt n_{1}: \quad \text{a phase shift of } \pi \]<div class="eqref">Ch. 2 Eq. (2.4), Gačević Sec. II B and Fig. 1</div>`,
sym: [[String.raw`\(r\)`, "amplitude reflection coefficient"], [String.raw`\(R\)`, "power reflectance"], [String.raw`\(n_{1}, n_{2}\)`, "index on the incoming side and on the far side"]],
how: [String.raw`At normal incidence, match the tangential \(E\) and \(H\) on both sides of the interface.`, String.raw`\(H\) is proportional to \(nE\), so the two conditions give \(1 + r = t\) and \(n_1(1 - r) = n_2 t\).`, String.raw`Solve for \(r\).`, String.raw`The sign of \(r\) gives the phase: negative means the reflected field is inverted.`],
say: String.raw`A single interface reflects \(r = (n_1 - n_2)/(n_1 + n_2)\) of the field amplitude, with a \(\pi\) phase shift when the light enters the higher index. In a DBR the sign alternates from one interface to the next, and a small index contrast gives a weak reflection per interface.`,
num: String.raw`GaAs-like 3.5 against AlGaAs-like 3.0: \(r = 0.077\), \(R\) = <b>0.59 %</b><br>GaAs against air: \(r = 0.56\), \(R\) = <b>31 %</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("a", "n₁ (incoming side)", 1, 4, 0.01, 3.0) + sl("b", "n₂ (far side)", 1, 4, 0.01, 3.5) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const a = +$("a").value, b = +$("b").value; $("av").textContent = a.toFixed(2); $("bv").textContent = b.toFixed(2);
    const r = (a - b) / (a + b), R = r * r;
    fig.innerHTML = svg(250, `<rect x="40" y="40" width="300" height="160" fill="var(--blue-bg)" opacity="${a / 4}"/><rect x="340" y="40" width="300" height="160" fill="var(--blue-bg)" opacity="${b / 4 + 0.1}"/><line x1="340" x2="340" y1="30" y2="210" stroke="var(--p)" stroke-width="2"/><text class="ts" x="190" y="228" text-anchor="middle">n₁ = ${a.toFixed(2)}</text><text class="ts" x="490" y="228" text-anchor="middle">n₂ = ${b.toFixed(2)}</text><line x1="80" y1="90" x2="330" y2="90" stroke="#EF9F27" stroke-width="5" marker-end="url(#ar)"/><text class="ts" x="80" y="80">incident, power 1</text><line x1="330" y1="150" x2="80" y2="150" stroke="#D85A30" stroke-width="${Math.max(1, 5 * Math.sqrt(R) * 2)}" marker-end="url(#ar)"/><text class="ts" x="80" y="174">reflected ${(R * 100).toFixed(2)} %${r < 0 ? ", phase π" : ""}</text><line x1="350" y1="90" x2="600" y2="90" stroke="#378ADD" stroke-width="${5 * Math.sqrt(1 - R)}" marker-end="url(#ar)"/><text class="ts" x="360" y="80">transmitted ${((1 - R) * 100).toFixed(2)} %</text>`);
    $("ro").innerHTML = `<div><span>r</span><b>${r.toFixed(4)}</b></div><div><span>R</span><b>${(R * 100).toFixed(3)} %</b></div>`;
  };
  $("a").oninput = u; $("b").oninput = u; u();
}},


/* from old ch2 L6 card 2, rebuilt as a step-through of the phase bookkeeping (Fig. 2.5 of the thesis) */
{s: "2. Quarter waves", t: "Quarter-wave layers: the phase of every reflection, step by step",
intu: String.raw`This is the board picture of the thesis figure on the DBR phases, drawn after Gačević Fig. 1(a). Light enters from air. Every interface sends back a small reflected wave, and you add up the phase each one has when it is back at the top. There are only two rules. An interface into the higher index gives \(\pi\), an interface into the lower index gives 0 (card 1). And every round trip through a quarter-wave layer gives \(\pi\), because the layer is \(\lambda_0/(4n)\) thick, so one pass is \(k_0 n d = \pi/2\). Step through the interfaces. Each total comes out as an odd multiple of \(\pi\), which is the same as \(\pi\) modulo \(2\pi\), so all reflected waves leave together and add. The small arrows at the top are the phasors of the reflected waves. They all point the same way.`,
eq: String.raw`\[ d_H = \frac{\lambda_0}{4 n_H}, \qquad d_L = \frac{\lambda_0}{4 n_L} \]\[ k_0 n d = \frac{2\pi}{\lambda_0}\, n\, \frac{\lambda_0}{4n} = \frac{\pi}{2} \quad\Longrightarrow\quad \text{round trip} = \pi \]\[ \varphi_k = \underbrace{\pi \text{ or } 0}_{\text{interface}} + \underbrace{k\,\pi}_{k \text{ round trips}} \equiv \pi \pmod{2\pi} \]<div class="eqref">Ch. 2 Eq. (2.5), Gačević Sec. II A and Fig. 1</div>`,
sym: [[String.raw`\(d_H, d_L\)`, "thicknesses of the high-index and low-index layers"], [String.raw`\(n_H, n_L\)`, "high and low indices"], [String.raw`\(k_0 n d\)`, String.raw`phase across one layer, \(\pi/2\) for a quarter-wave layer`], [String.raw`\(\varphi_k\)`, String.raw`phase of the wave reflected at interface \(k\), counted from the top (\(k = 0\) is the air surface)`]],
how: [String.raw`Choose each thickness so that the layer holds a quarter of the wavelength in that material, \(d = \lambda_0/(4n)\) (Eq. 2.5).`, String.raw`The phase across one layer is then \(k_0 n d = \pi/2\), so a wave that goes down and comes back up through it gains \(\pi\).`, String.raw`Interfaces alternate: air into H and L into H give \(\pi\) (\(r \lt 0\)), H into L gives 0 (\(r \gt 0\)).`, String.raw`At interface \(k\) the wave has crossed \(k\) layers twice. Even \(k\) is an interface into H: \(\pi + k\pi\), an odd multiple of \(\pi\). Odd \(k\) is an interface into L: \(0 + k\pi\), again odd.`, String.raw`So every reflected wave leaves with phase \(\pi\) modulo \(2\pi\) and they add at \(\lambda_0\) (Gačević Sec. II A). Away from \(\lambda_0\) the round trip is no longer exactly \(\pi\) and the phases spread (next card).`],
say: String.raw`Each layer is a quarter wavelength thick in its material, so a round trip through it adds \(\pi\). Together with the alternating sign of the interface reflections, this makes every reflected wave return with the same phase at \(\lambda_0\), so they add.`,
num: String.raw`\(\lambda_0 = 800\) nm: \(n_H = 3.5\) gives \(d_H =\) <b>57.1 nm</b>, \(n_L = 3.0\) gives \(d_L =\) <b>66.7 nm</b>.<br>Both layers have the same optical thickness \(n d = \lambda_0/4 = 200\) nm, so light takes the same time to cross each one.`,
r(fig, ctl) {
  let step = 0, playing = true, tPlay = 0, last = performance.now(), tNow = 0; const NS = 8;
  ctl.innerHTML = `<div class="row"><button id="qb">Back</button><button id="qn">Next step</button><button id="qp">Pause</button><span id="qs" style="font-size:13px;color:var(--muted);margin-left:6px"></span></div>`;
  fig.innerHTML = `<div id="qsv"></div><p class="note" id="qc" style="font-size:14.5px;color:var(--fg);min-height:44px"></p>`;
  const lay = [], y0 = 112; let y = y0;
  for (let i = 0; i < 7; i++) { const H = i % 2 === 0, h = H ? 30 : 35; lay.push([y, h, H]); y += h; }
  const ifY = k => lay[k][0], xr = k => 116 + k * 78;
  const CAP = ["Step 0. Draw the stack: air on top, then high (H) and low (L) layers, each a quarter wavelength thick in its own material. One pass through a layer is a phase of π/2, so a round trip is π.",
    "Interface 0, air into H: entering the higher index gives π. No layer crossed. Total π.",
    "Interface 1, H into L: entering the lower index gives 0. One round trip through H gives π. Total π.",
    "Interface 2, L into H: π at the interface, plus two round trips, 2π. Total 3π, which is π modulo 2π.",
    "Interface 3, H into L: 0 at the interface, plus three round trips, 3π. Total 3π, again π modulo 2π.",
    "Interface 4, L into H: π plus 4π gives 5π, again π.",
    "Interface 5, H into L: 0 plus 5π, again π. The pattern goes on for every pair below.",
    "Interface 6 and every one after it follow the same rule.",
    "All reflected waves leave with phase π modulo 2π. Their phasors at the top all point the same way, so they add. That is why a stack of weak interfaces can reflect almost everything at λ₀."];
  const draw = () => {
    const t = tNow; let s = `<text class="ts" x="20" y="18">light enters from air. Phase of each reflected wave when it is back at the top</text>`;
    s += `<rect x="40" y="70" width="610" height="${y0 - 70}" fill="var(--sunk)" opacity="0.5"/><text class="ts" x="46" y="${y0 - 6}">air</text>`;
    lay.forEach(([yy, h, H], i) => { s += `<rect x="40" y="${yy}" width="610" height="${h}" fill="${H ? "#7FA6D9" : "#C9D6EA"}" opacity="${i === 6 ? 0.35 : 0.9}"/><text class="ts" x="46" y="${yy + h / 2 + 4}" fill="var(--t)">${H ? "H, λ₀/4n" + L5_SUB("H") : "L, λ₀/4n" + L5_SUB("L")}</text>`; });
    s += `<text class="ts" x="345" y="${y + 18}" text-anchor="middle">more pairs below, same pattern</text>`;
    s += `<line x1="70" y1="40" x2="70" y2="${y0 - 2}" stroke="#EF9F27" stroke-width="3" marker-end="url(#ar)"/><text class="ts" x="64" y="60" text-anchor="end">incident</text>`;
    for (let k = 0; k < Math.min(step, 7); k++) {
      const x = xr(k), yi = ifY(k), into = k % 2 === 0, tot = (into ? 1 : 0) + k, col = into ? "#D85A30" : "#1D9E75";
      s += `<line x1="${x}" y1="74" x2="${x}" y2="${yi - 2}" stroke="#EF9F27" stroke-width="1.5" opacity="0.7" marker-end="url(#ar)"/><line x1="${x + 12}" y1="${yi}" x2="${x + 12}" y2="76" stroke="${col}" stroke-width="2.5" marker-end="url(#ar)"/>`;
      s += `<circle cx="${x + 6}" cy="${yi}" r="4" fill="${col}"/><text class="ts" x="${x + 18}" y="${yi + 4}" fill="${col}">${into ? "π" : "0"}</text>`;
      s += `<text class="t" x="${x + 6}" y="36" text-anchor="middle">${k === 0 ? "π" : (into ? "π" : "0") + " + " + (k === 1 ? "" : k) + "π"}</text><text class="ts" x="${x + 6}" y="52" text-anchor="middle">${tot === 1 ? "= π" : "= " + tot + "π ≡ π"}</text>`;
      // phasor at the top, phase pi: pointing left
      s += `<line x1="${x + 18}" y1="64" x2="${x - 6}" y2="64" stroke="#378ADD" stroke-width="2.5" marker-end="url(#ar)"/>`;
      if (k === step - 1) { const f = (t % 2) / 2, yy = f < 0.5 ? 74 + (yi - 74) * f * 2 : yi - (yi - 76) * (f - 0.5) * 2; s += `<circle cx="${f < 0.5 ? x : x + 12}" cy="${yy}" r="5" fill="#EF9F27"/>`; }
    }
    if (step === NS) s += `<rect x="96" y="22" width="${xr(6) - 96 + 36}" height="50" fill="none" stroke="#378ADD" stroke-width="1.5" rx="6"/><text class="th" x="345" y="${y + 40}" text-anchor="middle" fill="#378ADD">all phasors point the same way: the reflections add</text>`;
    $("qsv").innerHTML = svg(y + 52, s);
    $("qc").textContent = CAP[step]; $("qs").textContent = `step ${step} of ${NS}`;
    $("qb").disabled = step === 0; $("qn").disabled = step === NS;
  };
  const stop = () => { playing = false; $("qp").textContent = "Play"; };
  $("qb").onclick = () => { step = Math.max(0, step - 1); stop(); draw(); };
  $("qn").onclick = () => { step = Math.min(NS, step + 1); stop(); draw(); };
  $("qp").onclick = () => { playing = !playing; if (playing && step === NS) step = 0; tPlay = 0; $("qp").textContent = playing ? "Pause" : "Play"; draw(); };
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now; tNow = t;
    if (playing) { tPlay += dt; if (tPlay > 3) { tPlay = 0; if (step < NS) step++; else stop(); } }
    draw();
  });
}},

/* new card: animated echoes and phasors (Sec. 2.4, Gačević Sec. II A) */
{s: "3. Watch them add", t: "Watch the reflections add up",
intu: String.raw`A short pulse of light enters the stack from the left. Every time it crosses an interface, a small echo splits off and runs back out (lower lane). Coral echoes come from interfaces into the higher index, teal ones from interfaces into the lower index. When an echo reaches the surface, its phasor is added to the chain on the right: the length is the size of \(r\) and the angle is its phase at the chosen wavelength, interface sign plus round trips. At \(\lambda_0\) every arrow points the same way and the chain grows in a straight line, so the reflections add. Move the wavelength away from \(\lambda_0\): the round trips are no longer exactly \(\pi\), each arrow turns a little more than the one before, and the chain curls up and partly cancels. Outside the stopband it closes on itself. The readout gives the exact reflectance from a transfer matrix, which also includes the multiple reflections this simple picture leaves out.`,
eq: String.raw`\[ r_{\text{total}} \approx \sum_{k} r_k\, e^{\,j\varphi_k(\lambda)}, \qquad \varphi_k(\lambda) = 2\sum_{i \lt k} \frac{2\pi}{\lambda}\, n_i d_i \]\[ \lambda = \lambda_0: \quad \text{every round trip} = \pi \;\Longrightarrow\; \text{all terms in phase} \]<div class="eqref">single-reflection picture of Ch. 2 Sec. 2.4, Gačević Sec. II A. Exact value: transfer matrix</div>`,
sym: [[String.raw`\(r_k\)`, String.raw`reflection coefficient of interface \(k\), Eq. 2.4, sign included`], [String.raw`\(\varphi_k(\lambda)\)`, String.raw`phase gained going down to interface \(k\) and back`], [String.raw`\(n_i d_i\)`, String.raw`optical thickness of layer \(i\), \(\lambda_0/4\) for every layer`], ["phasor", "arrow for a complex amplitude: length is the size, angle is the phase"]],
how: ["Follow the pulse. At each interface part of it is reflected with the coefficient of Eq. 2.4.", String.raw`The echo from interface \(k\) has crossed every layer above it twice, so it carries the extra phase \(\varphi_k\).`, String.raw`All layers have the same optical thickness \(\lambda_0/4\), so the echoes come back at equal time steps, and at \(\lambda_0\) each round trip adds exactly \(\pi\).`, String.raw`Add the echoes as phasors. At \(\lambda_0\) they line up. At another \(\lambda\) each round trip is \(\pi\lambda_0/\lambda\), so successive arrows turn by a constant extra angle and the chain curls.`, "The simple sum ignores echoes of echoes, so it overshoots once the reflection gets strong. The transfer matrix readout is exact."],
say: String.raw`Each interface sends back a small echo. Because every layer is a quarter wave thick, at \(\lambda_0\) all echoes return with the same phase and add like arrows in a line. Off the design wavelength the arrows turn and partly cancel, which is why the reflectance falls outside the stopband.`,
num: String.raw`Example \(n_H = 3.5\), \(n_L = 3.0\), \(\lambda_0 = 800\) nm: air into H gives \(|r| = 0.556\), every inner interface \(|r| = 0.077\).<br>At \(\lambda = 850\) nm each round trip is \(\pi \times 800/850\), so successive arrows turn by about 11° more each time.`,
r(fig, ctl) {
  const nH = 3.5, nL = 3.0, l0 = 800;
  let playing = true, tc = 0, last = performance.now();
  ctl.innerHTML = sl("lam", "Wavelength λ", 650, 950, 1, 800) + sl("N", "Pairs N", 1, 8, 1, 4) + `<div class="row"><button id="wp">Pause</button><button id="wr">Restart</button></div><div class="readout" id="ro"></div>`;
  fig.innerHTML = `<div id="wsv"></div><p class="note">Left: the stack seen from the side, light enters from air at the left. To keep every interface part of the quarter-wave pattern, the stack ends in a thick low-index layer. Right: phasors of the echoes that have arrived, added tip to tail. Blue dashed: their sum.</p>`;
  const T = 0.32;
  const draw = () => {
    const lam = +$("lam").value, N = +$("N").value; $("lamv").textContent = lam + " nm"; $("Nv").textContent = N;
    const layers = C2.dbrLayers(nH, nL, N, l0), P = L5_phasors(1, layers, nL, lam), nI = P.length;
    const dsum = layers.reduce((a, b) => a + b[1], 0), sc = Math.min(0.55, 250 / dsum), xs = 70;
    const B = [xs]; layers.forEach(([n, d]) => B.push(B[B.length - 1] + d * sc));
    const tau = tc / T, tEnd = 2 * nI + 3;
    let s = `<rect x="20" y="40" width="${xs - 20}" height="130" fill="var(--sunk)" opacity="0.5"/><text class="ts" x="24" y="34">air</text>`;
    layers.forEach(([n], i) => s += `<rect x="${B[i].toFixed(1)}" y="40" width="${(B[i + 1] - B[i]).toFixed(1)}" height="130" fill="${n === nH ? "#7FA6D9" : "#C9D6EA"}"/>`);
    s += `<rect x="${B[B.length - 1]}" y="40" width="${340 - B[B.length - 1]}" height="130" fill="#C9D6EA" opacity="0.45"/><text class="ts" x="338" y="34" text-anchor="end">thick low-index layer</text>`;
    s += `<text class="ts" x="24" y="190">forward pulse (upper lane), echoes (lower lane)</text>`;
    const xAt = q => { if (q <= 0) return xs + q * 30; const i = Math.floor(q); if (i >= B.length - 1) return Math.min(340, B[B.length - 1] + (q - B.length + 1) * 18); return B[i] + (B[i + 1] - B[i]) * (q - i); };
    const blob = (x, y, a, col) => `<path d="M${(x - 9).toFixed(1)} ${y} Q${x.toFixed(1)} ${(y - 22 * a).toFixed(1)} ${(x + 9).toFixed(1)} ${y}" fill="${col}" fill-opacity="0.5" stroke="${col}" stroke-width="1.5"/>`;
    if (tau < 2 * nI + 1) s += blob(xAt(tau), 92, 1, "#EF9F27");
    let re = 0, im = 0, chain = "", ox = 640, oy = 130, psc = 115;
    P.forEach((p, i) => {
      const k = i, col = p.r < 0 ? "#D85A30" : "#1D9E75";
      if (tau >= k && tau < 2 * k + 1.5) { const q = tau <= 2 * k ? k - (tau - k) : -(tau - 2 * k) * 1.5; s += blob(xAt(q), 150, Math.max(0.25, Math.min(1, Math.abs(p.r) * 4)), col); }
      if (tau >= 2 * k) { re += p.re; im += p.im; const x2 = ox + re * psc, y2 = oy - im * psc; chain += `<line x1="${(ox + (re - p.re) * psc).toFixed(1)}" y1="${(oy - (im - p.im) * psc).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="2" marker-end="url(#ar)"/>`; }
    });
    s += `<line x1="360" x2="670" y1="${oy}" y2="${oy}" stroke="var(--p)" stroke-width="0.5"/><line x1="${ox - psc}" x2="${ox - psc}" y1="${oy - 5}" y2="${oy + 5}" stroke="var(--t)"/><circle cx="${ox}" cy="${oy}" r="3" fill="var(--t)"/>`;
    s += chain + `<line x1="${ox}" y1="${oy}" x2="${(ox + re * psc).toFixed(1)}" y2="${(oy - im * psc).toFixed(1)}" stroke="#378ADD" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    s += `<text class="ts" x="${ox - psc}" y="${oy + 18}" text-anchor="middle">|r| = 1</text><text class="ts" x="380" y="24">phasors of the arrived echoes</text>`;
    const off = Math.abs(lam - l0) < 3;
    s += `<text class="th" x="20" y="214">${off ? "at λ₀ every round trip is π: the arrows line up and add" : "detuned: each round trip is π·λ₀/λ, the arrows turn and the chain curls"}</text>`;
    $("wsv").innerHTML = svg(255, s);
    const R = C2.tmmR(1, layers, nL, lam), dl = 4 * l0 / Math.PI * Math.asin((nH - nL) / (nH + nL));
    $("ro").innerHTML = `<div><span>echoes arrived</span><b>${Math.min(nI, Math.floor(tau / 2) + 1)} of ${nI}</b></div><div><span>|sum| (single reflections)</span><b>${Math.hypot(re, im).toFixed(3)}</b></div><div><span>exact R (transfer matrix)</span><b>${(R * 100).toFixed(1)} %</b></div><div><span>inside stopband (Eq. 2.7)?</span><b>${Math.abs(lam - l0) < dl / 2 ? "yes" : "no"}</b></div>`;
    return tEnd;
  };
  $("wp").onclick = () => { playing = !playing; $("wp").textContent = playing ? "Pause" : "Play"; draw(); };
  $("wr").onclick = () => { tc = 0; draw(); };
  $("lam").oninput = draw; $("N").oninput = () => { tc = 0; draw(); };
  anim(t => {
    if (!fig.isConnected) { stopAnim(); return; }
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    const tEnd = draw();
    if (playing) { tc += dt; if (tc / T > tEnd + 6) tc = 0; }
  });
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { tc = 100 * T; draw(); }
}},

/* from old ch2 L6 card 3 */
{s: "4. Pairs needed", t: "How many pairs: the peak reflectance formula",
intu: String.raw`Stacking pairs raises the reflectance toward 1, and the closed formula shows how fast: everything depends on the index ratio raised to the power \(2N\). A small ratio means many pairs. The thesis uses the form for \(N\) pairs with air on both sides, from Gačević and Vukmirović Eq. (2). Their paper also gives it for different media in front of and behind the stack. The dots here are the exact transfer-matrix result, the line is the formula. They agree exactly at the design wavelength.`,
eq: String.raw`\[ R = \left[\frac{1 - (n_H/n_L)^{2N}}{1 + (n_H/n_L)^{2N}}\right]^{2} \]<div class="eqnote">N pairs with air on both sides, at the design wavelength</div><div class="eqref">Ch. 2 Eq. (2.6), Gačević Eq. (2)</div>`,
sym: [[String.raw`\(N\)`, "number of high/low pairs"], [String.raw`\(n_{\mathrm{H}}, n_{\mathrm{L}}\)`, "high and low indices"], [String.raw`\((n_H/n_L)^{2N}\)`, String.raw`grows exponentially with \(N\), so \(R\) approaches 1 quickly once it is large`]],
how: [String.raw`Use the transfer matrix of a quarter-wave layer: at \(\lambda_0\) it is a simple off-diagonal matrix.`, String.raw`Multiplying \(N\) pairs gives a diagonal matrix with entries \((n_{\mathrm{H}}/n_{\mathrm{L}})^{\pm N}\).`, String.raw`The reflection coefficient of the stack then depends only on \((n_H/n_L)^{2N}\).`, String.raw`With air on both sides, \(r = [1 - (n_H/n_L)^{2N}]/[1 + (n_H/n_L)^{2N}]\), and \(R = r^2\) is Eq. 2.6.`],
say: String.raw`For \(N\) pairs with air on both sides the peak reflectance is \(R = [(1 - (n_H/n_L)^{2N})/(1 + (n_H/n_L)^{2N})]^2\). A small index ratio requires many pairs.`,
num: String.raw`Ratio \(3.5/3.0 = 1.167\): \(N = 10\) gives \(R \approx\) <b>83 %</b>, \(N = 20\) ≈ <b>99 %</b> (see the plot)<br>Ratio 1.5 (much higher contrast): 6 pairs already give about 97 %.`,
r(fig, ctl) {
  ctl.innerHTML = sl("rt", "Index ratio n<sub>H</sub>/n<sub>L</sub>", 1.05, 1.6, 0.005, 3.5 / 3.0) + sl("N", "Marker at pairs N", 1, 30, 1, 10) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const rt = +$("rt").value, N = +$("N").value; $("rtv").textContent = rt.toFixed(3); $("Nv").textContent = N;
    const Rf = n => { const q = Math.pow(rt, 2 * n); return Math.pow((q - 1) / (q + 1), 2); };
    const Ns = range(0, 30, 121), ys = Ns.map(Rf);
    let dots = ""; for (let n = 1; n <= 30; n++) { const R = C2.tmmR(1, C2.dbrLayers(3.0 * rt, 3.0, n, 800), 1, 800); dots += `<circle cx="${60 + n / 30 * 560}" cy="${230 - R * 190}" r="3" fill="#D85A30"/>`; }
    fig.innerHTML = svg(260, `${plot(60, 40, 560, 190, Ns, ys, 0, 30, 0, 1, "#378ADD", 2.5)}${dots}<line x1="${60 + N / 30 * 560}" x2="${60 + N / 30 * 560}" y1="40" y2="230" stroke="#EF9F27" stroke-width="2"/><line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="54" y="44" text-anchor="end">1</text><text class="ts" x="340" y="252" text-anchor="middle">number of pairs N, 0 to 30. Line: formula. Dots: transfer matrix</text>`);
    $("ro").innerHTML = `<div><span>R at N = ${N}</span><b>${(Rf(N) * 100).toFixed(2)} %</b></div><div><span>pairs for 99 %</span><b>${(() => { for (let n = 1; n < 200; n++) if (Rf(n) >= 0.99) return n; return "> 200"; })()}</b></div>`;
  };
  $("rt").oninput = u; $("N").oninput = u; u();
}},

/* from old ch2 L6 card 4 */
{s: "5. Stopband", t: "The stopband: high reflectance only near λ₀",
intu: "Away from the design wavelength the layers are no longer quarter waves and the reflections stop adding in phase. The reflectance stays high only inside a band, the stopband, whose width depends only on the index contrast, not on the number of pairs. A low contrast stack has a narrow band. This spectrum is computed live with a transfer matrix. The orange lines mark the full stopband width from Eq. 2.7. Add pairs: the band gets flatter and squarer, but not much wider.",
eq: String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi} \arcsin\!\left(\frac{n_{\mathrm{H}} - n_{\mathrm{L}}}{n_{\mathrm{H}} + n_{\mathrm{L}}}\right) \]<div class="eqref">Ch. 2 Eq. (2.7), Gačević Eq. (3)</div>`,
sym: [[String.raw`\(\Delta\lambda_{0}\)`, "full width of the stopband"], [String.raw`\(\lambda_{0}\)`, "design wavelength"], [String.raw`\((n_{\mathrm{H}} - n_{\mathrm{L}})/(n_{\mathrm{H}} + n_{\mathrm{L}})\)`, "the size of the single-interface reflection coefficient from card 1"]],
how: [String.raw`For an infinite periodic stack, waves are forbidden in a frequency band around \(\lambda_0\) (a 1D photonic band gap).`, "Its relative width follows from the band edges of the periodic medium.", "The result depends only on the contrast through the interface coefficient.", "For a finite stack the formula is a good estimate. Gačević and Vukmirović note it is strictly exact only for infinitely many periods."],
say: String.raw`A quarter-wave DBR reflects strongly only within a stopband of width about \((4\lambda_0/\pi) \arcsin((n_{\mathrm{H}} - n_{\mathrm{L}})/(n_{\mathrm{H}} + n_{\mathrm{L}}))\), which depends only on the index contrast.`,
num: String.raw`\(n_{\mathrm{H}} = 3.5\), \(n_{\mathrm{L}} = 3.0\), \(\lambda_0 = 800\) nm: \(\Delta\lambda_0 \approx (3200/\pi) \times \arcsin(0.0769) \approx\) <b>78 nm</b>`,
r(fig, ctl) {
  ctl.innerHTML = sl("N", "Pairs N", 2, 30, 1, 14) + sl("nL", "Low index n<sub>L</sub>", 2.6, 3.45, 0.01, 3.0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const N = +$("N").value, nL = +$("nL").value, nH = 3.5; $("Nv").textContent = N; $("nLv").textContent = nL.toFixed(2);
    const ls = range(650, 950, 300), Rs = ls.map(l => C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), 1, l));
    const dl = 4 * 800 / Math.PI * Math.asin((nH - nL) / (nH + nL)), X = l => 60 + (l - 650) / 300 * 560;
    fig.innerHTML = svg(260, `<rect x="${X(800 - dl / 2)}" y="40" width="${X(800 + dl / 2) - X(800 - dl / 2)}" height="190" fill="#EF9F27" opacity="0.12"/><line x1="${X(800 - dl / 2)}" x2="${X(800 - dl / 2)}" y1="40" y2="230" stroke="#EF9F27"/><line x1="${X(800 + dl / 2)}" x2="${X(800 + dl / 2)}" y1="40" y2="230" stroke="#EF9F27"/>${plot(60, 40, 560, 190, ls, Rs, 650, 950, 0, 1, "#378ADD", 2.2)}<line x1="60" x2="620" y1="230" y2="230" stroke="var(--p)"/><line x1="60" x2="60" y1="40" y2="230" stroke="var(--p)"/><text class="ts" x="60" y="250">650 nm</text><text class="ts" x="620" y="250" text-anchor="end">950 nm</text><text class="ts" x="340" y="250" text-anchor="middle">wavelength</text><text class="ts" x="54" y="44" text-anchor="end">R = 1</text>`);
    $("ro").innerHTML = `<div><span>R at 800 nm</span><b>${(C2.tmmR(1, C2.dbrLayers(nH, nL, N, 800), 1, 800) * 100).toFixed(1)} %</b></div><div><span>stopband (formula)</span><b>${dl.toFixed(0)} nm</b></div>`;
  };
  $("N").oninput = u; $("nL").oninput = u; u();
}},

/* from old ch2 L6 card 5, rebuilt as an animation (Sec. 2.4, Taillaert 2006) */
{s: "6. The air gap", t: "The air gap: does the returning light add or cancel?",
intu: String.raw`This is the last paragraph of Sec. 2.4 drawn as waves. Light that the grating sends downward crosses the air gap, is reflected by the DBR and returns to the grating, where it interferes with the light radiated directly upward. The distance between the grating and the DBR sets the phase of the returning light relative to the upward light, and this phase decides whether the two add or cancel. Watch the four columns: (1) the wave the grating sends straight up, (2) the wave it sends down, (3) the same wave after the mirror, on its way back up, and (4) the sum above the membrane. Drag the gap. When the returning wave is in step with the direct one, the sum is large. Half a wavelength of round trip later it cancels. The plot shows the share of the radiated light that goes up and, in a simple sheet model, how strongly the grating scatters compared with no mirror. Both change with the gap, which is why the gap must be chosen together with the grating.`,
eq: String.raw`\[ E_{\text{up}} \propto 1 + \sqrt{R}\, e^{\,j\delta}, \qquad \delta = 2 k_0\, t_{\text{gap}} + \varphi_{\text{DBR}} \]\[ \delta = 2\pi m:\ \text{add}, \qquad \delta = (2m + 1)\pi:\ \text{cancel} \]<div class="eqnote">simple sheet model, used for the plot only</div>\[ \text{share up} = \frac{\left|1 + \sqrt{R}\,e^{j\delta}\right|^{2}}{\left|1 + \sqrt{R}\,e^{j\delta}\right|^{2} + (1 - R)}, \qquad \text{scattering strength} = 1 + \sqrt{R}\cos\delta \]<div class="eqref">Ch. 2 Sec. 2.4, Taillaert 2006</div>`,
sym: [[String.raw`\(t_{\text{gap}}\)`, "distance between the grating and the top of the DBR (air)"], [String.raw`\(\delta\)`, "phase of the returning light relative to the light radiated straight up"], [String.raw`\(\varphi_{\text{DBR}}\)`, String.raw`reflection phase of the mirror, \(\pi\) for a stack that starts with the high index`], [String.raw`\(R\)`, "DBR reflectance (Eq. 2.6)"], ["scattering strength", "power the grating radiates, relative to the same grating without a mirror, in the sheet model"]],
how: ["The grating radiates equal waves up and down.", String.raw`The downward wave crosses the gap twice and is reflected once, so on its way back through the grating it is behind the direct wave by \(\delta = 2k_0 t_{\text{gap}} + \varphi_{\text{DBR}}\), and smaller by \(\sqrt{R}\).`, String.raw`Above the membrane the two waves overlap: the upward field is proportional to \(1 + \sqrt{R}\,e^{j\delta}\). In phase they add, out of phase they cancel.`, String.raw`The returning wave also acts back on the grating. If you treat the grating as a thin sheet driven by the guided mode, the power it radiates is \(1 + \sqrt{R}\cos\delta\) times the power without a mirror. So the gap changes how strongly the grating scatters, not only where the light goes.`, String.raw`\(\delta\) grows by \(2\pi\) when the gap grows by \(\lambda_0/2\), so in this model the pattern repeats every half wavelength of gap. The grating and the gap are designed together (Taillaert 2006).`],
say: "The distance between the grating and the DBR sets the phase of the returning light relative to the light going straight up, and that phase decides whether they add or cancel. So the gap changes how much light goes up and how strongly the grating scatters, and it has to be chosen together with the grating.",
num: String.raw`\(\lambda_0 = 800\) nm, \(\varphi_{\text{DBR}} = \pi\), \(R = 0.95\) (sheet model): gaps of 200, 600 and 1000 nm add (about <b>99 %</b> up), 400 and 800 nm cancel (about <b>1 %</b> up). The pattern repeats every <b>400 nm</b> of gap.`,
r(fig, ctl) {
  let playing = true, tNow = 0;
  ctl.innerHTML = sl("g", "Air gap t<sub>gap</sub>", 0, 1200, 5, 200) + sl("R", "DBR reflectance R", 0, 1, 0.01, 0.95) + `<div class="row"><button id="gp">Pause</button></div><div class="readout" id="ro"></div>`;
  const sc = 0.105, k0 = 2 * Math.PI / 800;
  const draw = () => {
    const g = +$("g").value, R = +$("R").value; $("gv").textContent = g + " nm"; $("Rv").textContent = (R * 100).toFixed(0) + " %";
    const d = 2 * k0 * g + Math.PI, rr = Math.sqrt(R), ym = 118, yD = ym + 8 + g * sc, wt = 2 * Math.PI * 0.45 * tNow;
    const Y = z => ym - z * sc; // z in nm, up positive, 0 at the membrane
    const wave = (x, z1, z2, amp, fn, col, dash) => { let p = ""; for (let z = z1; z <= z2 + 1; z += 12) p += (p ? "L" : "M") + (x + 13 * amp * fn(z)).toFixed(1) + " " + Y(z).toFixed(1); return `<path d="${p}" fill="none" stroke="${col}" stroke-width="2.2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
    let s = `<rect x="30" y="${ym - 4}" width="620" height="8" fill="#7FA6D9"/>`;
    for (let x = 34; x < 650; x += 22) s += `<rect x="${x}" y="${ym - 4}" width="9" height="8" fill="var(--panel)"/>`;
    s += `<text class="ts" x="648" y="${ym - 8}" text-anchor="end">grating in the membrane</text>`;
    for (let i = 0; i < 6; i++) s += `<rect x="30" y="${yD + i * 6}" width="620" height="6" fill="${i % 2 ? "#C9D6EA" : "#7FA6D9"}"/>`;
    s += `<text class="ts" x="36" y="${yD + 22}" fill="var(--t)">DBR</text>${g > 40 ? `<line x1="600" x2="600" y1="${ym + 6}" y2="${yD - 2}" stroke="var(--t)" stroke-width="1" marker-start="url(#ar)" marker-end="url(#ar)"/><text class="ts" x="606" y="${(ym + yD) / 2 + 4}">t${L5_SUB("gap")}</text>` : ""}`;
    const zTop = 840, zG = -(yD - ym) / sc;
    s += wave(100, 8, zTop, 1, z => Math.cos(k0 * z - wt), "#378ADD");
    s += wave(220, zG, -8, 1, z => Math.cos(-k0 * z - wt), "#D85A30");
    s += wave(330, zG, zTop, rr, z => Math.cos(k0 * z + d - wt), "#7F77DD", "5 3");
    const A = Math.hypot(1 + rr * Math.cos(d), rr * Math.sin(d)), ph = Math.atan2(rr * Math.sin(d), 1 + rr * Math.cos(d));
    s += wave(470, 8, zTop, A / 1.6, z => Math.cos(k0 * z + ph - wt), "#1D9E75");
    [[100, "1. straight up"], [220, "2. down"], [330, "3. back up"], [470, "4. sum above"]].forEach(([x, t]) => s += `<text class="ts" x="${x}" y="12" text-anchor="middle">${t}</text>`);
    s += `<text class="th" x="560" y="40" text-anchor="middle" fill="${A > 1.2 ? "#1D9E75" : A < 0.6 ? "#E24B4A" : "var(--fg)"}">${A > 1.2 ? "they add" : A < 0.6 ? "they cancel" : "partly"}</text>`;
    // plot
    const P0 = 318, PH = 80, gs = range(0, 1200, 241), share = t => { const dd = 2 * k0 * t + Math.PI, U = 1 + R + 2 * rr * Math.cos(dd); return U / (U + 1 - R); }, str = t => (1 + rr * Math.cos(2 * k0 * t + Math.PI)) / 2;
    s += plot(60, P0, 560, PH, gs, gs.map(share), 0, 1200, 0, 1, "#378ADD", 2.2) + plot(60, P0, 560, PH, gs, gs.map(str), 0, 1200, 0, 1, "#7F77DD", 2, "5 3");
    s += `<line x1="60" x2="620" y1="${P0 + PH}" y2="${P0 + PH}" stroke="var(--p)"/><line x1="60" x2="60" y1="${P0}" y2="${P0 + PH}" stroke="var(--p)"/><line x1="${60 + g / 1200 * 560}" x2="${60 + g / 1200 * 560}" y1="${P0}" y2="${P0 + PH}" stroke="#EF9F27" stroke-width="2"/>`;
    s += `<text class="ts" x="54" y="${P0 + 6}" text-anchor="end">1</text><text class="ts" x="54" y="${P0 + PH}" text-anchor="end">0</text><text class="ts" x="60" y="${P0 + PH + 16}">gap 0</text><text class="ts" x="620" y="${P0 + PH + 16}" text-anchor="end">1200 nm</text><text class="ts" x="340" y="${P0 + PH + 16}" text-anchor="middle">blue: share of radiated light going up. Purple dashed: scattering strength / 2</text>`;
    $("asv").innerHTML = svg(P0 + PH + 24, s);
    $("ro").innerHTML = `<div><span>round-trip phase δ mod 2π</span><b>${(((d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / Math.PI).toFixed(2)} π</b></div><div><span>share going up</span><b>${(share(g) * 100).toFixed(1)} %</b></div><div><span>scattering strength vs no mirror</span><b>${(2 * str(g)).toFixed(2)} ×</b></div><div><span>no mirror</span><b>50 % up</b></div>`;
  };
  fig.innerHTML = `<div id="asv"></div><p class="note">Waves drawn to scale vertically (800 nm wavelength in air). The membrane is drawn thin, and the light is spread sideways into four columns only for clarity: in reality all of it overlaps.</p>`;
  $("gp").onclick = () => { playing = !playing; $("gp").textContent = playing ? "Pause" : "Play"; };
  $("g").oninput = draw; $("R").oninput = draw;
  anim(t => { if (!fig.isConnected) { stopAnim(); return; } if (playing) tNow = t; draw(); });
}}

],
summary: String.raw`At normal incidence an interface from \(n_1\) into \(n_2\) reflects \(r = (n_1 - n_2)/(n_1 + n_2)\) of the field (Eq. 2.4). The coefficient is negative, a phase of \(\pi\), when the light enters the higher index, so its sign alternates through a stack. Each layer is a quarter wavelength thick in its material, \(d_H = \lambda_0/(4n_H)\) and \(d_L = \lambda_0/(4n_L)\) (Eq. 2.5), so a round trip adds \(\pi\), and all reflections return in phase at \(\lambda_0\) and add. For \(N\) pairs with air on both sides the peak reflectance is \(R = [(1 - (n_H/n_L)^{2N})/(1 + (n_H/n_L)^{2N})]^2\) (Eq. 2.6), so a small index contrast needs many pairs. The high reflectance holds only over a stopband of full width about \((4\lambda_0/\pi)\arcsin((n_H - n_L)/(n_H + n_L))\) (Eq. 2.7). Under the grating, the distance to the DBR sets the phase of the returning light relative to the light going straight up. That phase decides whether they add or cancel, so the gap changes how much light goes up and how strongly the grating scatters, and it must be chosen together with the grating.`,
sheet: [
[String.raw`\[ r = \frac{n_{1} - n_{2}}{n_{1} + n_{2}} \]`, "Reflection at one interface, negative into the higher index (Ch. 2 Eq. 2.4, Gačević Sec. II B and Fig. 1)"],
[String.raw`\[ d_H = \frac{\lambda_0}{4 n_H}, \qquad d_L = \frac{\lambda_0}{4 n_L} \]`, "Quarter-wave layers, round trip π (Ch. 2 Eq. 2.5, Gačević Sec. II A)"],
[String.raw`\[ R = \left[\frac{1 - (n_H/n_L)^{2N}}{1 + (n_H/n_L)^{2N}}\right]^{2} \]`, "Peak reflectance, N pairs, air on both sides (Ch. 2 Eq. 2.6, Gačević Eq. (2))"],
[String.raw`\[ \Delta\lambda_{0} \approx \frac{4\lambda_{0}}{\pi} \arcsin\!\left(\frac{n_H - n_L}{n_H + n_L}\right) \]`, "Full stopband width (Ch. 2 Eq. 2.7, Gačević Eq. (3))"],
[String.raw`\[ E_{\text{up}} \propto 1 + \sqrt{R}\, e^{\,j\delta}, \qquad \delta = 2k_0 t_{\text{gap}} + \varphi_{\text{DBR}} \]`, "The air gap sets the phase of the returning light (Sec. 2.4, simple model, Taillaert 2006)"]],
consts: String.raw`Examples: \(n_H = 3.5\), \(n_L = 3.0\), \(\lambda_0 = 800\) nm, normal incidence, lossless layers. Round textbook values, not the thesis stack.`,
sources: ["Gačević and Vukmirović, Phys. Rev. Applied 9, 064041 (2018): Sec. II A (quarter-wave layers, reflections add in phase), Sec. II B (reflection coefficient), Fig. 1 (alternating sign and phases), Eq. (2) (peak reflectance), Eq. (3) (stopband). The paper studies how disordered interfaces degrade DBRs.", "Taillaert et al., Jpn. J. Appl. Phys. 45, 6071 (2006): the distance to the bottom mirror sets the phase of the reflected light, and grating and layers are designed together."]
});
