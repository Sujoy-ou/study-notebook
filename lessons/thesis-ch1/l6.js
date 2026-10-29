addLesson("thesis", "ch1", {
level: "Advanced",
id: "thesis-ch1-l6", title: "From dipole to your waveguide", short: "6. Dipole to waveguide",
big: "A dot couples to a waveguide mode in proportion to |d·E|², the overlap of its dipole with the mode's field at the dot. The mirror symmetry of your air-clad membrane forces TE-like modes to have only in-plane field at the mid-plane and TM-like modes to have only z field there. So in-plane dipoles feed TE and z dipoles feed TM. Across the strip, the TE field also has a small component along the propagation direction, a quarter period out of phase, which makes circular dipoles emit more one way than the other. This is where the thesis devices take over.",
bridge: "Coordinates: x is the propagation direction, y the width of the strip (typically about 200 nm), z the membrane thickness (a common GaAs membrane is 160 nm, as in Midolo 2015). The mode shapes drawn here are schematic. A mode solver gives the real ones (Chapter 2, Lesson 3).",
cards: [
{s: "1. Overlap", t: "Coupling is an overlap: |d·E|²",
intu: "From the golden rule (Lesson 4), the rate into a particular mode is proportional to |d·E|², where E is that mode's field at the dot. If the dipole points along the field, coupling is maximal. If it is perpendicular, coupling is zero, no matter how strong the field. In between it goes as cos² of the angle. Rotate the dipole relative to the field. This single rule, combined with the mode shapes in the next two cards, explains everything about which transition feeds which mode.",
eq: "Γ<sub>wg</sub> ∝ |d*·E<sub>k</sub>(r<sub>0</sub>)|² × n<sub>g</sub> &nbsp;&nbsp;&nbsp; |d·E|² = |d|²|E|² cos²α (linear dipole)",
sym: [["Γ_wg", "emission rate into the guided mode"], ["E_k(r₀)", "electric field of the mode at the dot's position r₀ (mode normalized to unit power)"], ["d*", "complex conjugate of the dipole vector (matters for circular dipoles)"], ["n_g", "group index: slower light means more time to interact, so a higher rate"], ["α", "angle between a linear dipole and the local field"]],
how: ["Golden rule: Γ ∝ |⟨f|−d·E|i⟩|² ρ.", "For a single guided mode, the matrix element is the dipole dotted into that mode's field at r₀.", "The density of states of a 1D waveguide is proportional to 1/v_g, i.e. to the group index n_g.", "For a linear dipole the dot product is |d||E| cos α."],
say: "The coupling of a dot to a waveguide mode is set by the projection of its transition dipole onto the mode's local electric field, and scales with the group index.",
num: "cos²α at 0°: <b>1</b>, at 45°: <b>0.5</b>, at 90°: <b>0</b><br>For a thin GaAs strip in air, both fundamental modes have n<sub>eff</sub> between 1 and the GaAs index, with TE0 above TM0 (Chapter 2, Lessons 2 and 3).",
r(fig, ctl) {
  ctl.innerHTML = sl("al", "Angle between dipole and field", 0, 90, 1, 0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const al = +$("al").value; $("alv").textContent = al + "°";
    const a = al * Math.PI / 180, c2 = Math.cos(a) ** 2, cx = 230, cy = 140;
    let fl = ""; for (let y = 50; y <= 230; y += 30) fl += `<line x1="80" x2="380" y1="${y}" y2="${y}" stroke="#378ADD" stroke-width="1.3" marker-end="url(#ar)" opacity="0.55"/>`;
    fig.innerHTML = svg(270, `${fl}<text class="ts" x="80" y="36">mode field E at the dot</text><line x1="${cx-55*Math.cos(a)}" y1="${cy+55*Math.sin(a)}" x2="${cx+55*Math.cos(a)}" y2="${cy-55*Math.sin(a)}" stroke="#854F0B" stroke-width="5" marker-start="url(#ar)" marker-end="url(#ar)"/><circle cx="${cx}" cy="${cy}" r="6" fill="#EF9F27" stroke="#854F0B"/><text class="th" x="540" y="66" text-anchor="middle">coupling</text><rect x="510" y="${230-150*c2}" width="60" height="${150*c2}" fill="#EF9F27" rx="3"/><line x1="490" x2="590" y1="230" y2="230" stroke="var(--p)"/><line x1="490" x2="590" y1="80" y2="80" stroke="var(--p)" stroke-dasharray="3 3" opacity="0.5"/>`);
    $("ro").innerHTML = `<div><span>cos²α</span><b>${c2.toFixed(3)}</b></div>`;
  };
  $("al").oninput = u; u();
}},

{s: "2. Mid-plane", t: "Cross-section: why the mid-plane separates TE and TM",
intu: "Your membrane has air above and below, so it is a mirror image of itself across its mid-plane. Every mode is then either even or odd under that mirror. For TE-like (even) modes the in-plane field is symmetric and E<sub>z</sub> is antisymmetric, so E<sub>z</sub> must be exactly zero at the mid-plane. For TM-like (odd) modes it is the other way round: the in-plane field vanishes at the mid-plane and E<sub>z</sub> is maximal. Move the dot up and down. At the mid-plane the separation is perfect: in-plane dipoles see only TE, z dipoles see only TM. Off the mid-plane, TE picks up some E<sub>z</sub> and the separation leaks.",
eq: "mirror z → −z: &nbsp; TE-like: E<sub>x,y</sub>(−z) = E<sub>x,y</sub>(z), &nbsp; E<sub>z</sub>(−z) = −E<sub>z</sub>(z) ⟹ E<sub>z</sub>(0) = 0<br>TM-like: E<sub>x,y</sub>(−z) = −E<sub>x,y</sub>(z) ⟹ E<sub>x,y</sub>(0) = 0",
sym: [["z = 0", "membrane mid-plane, halfway through the 160 nm"], ["TE-like (even)", "in-plane field symmetric in z"], ["TM-like (odd)", "in-plane field antisymmetric in z"], ["E_z", "field component along the growth axis"]],
how: ["The structure is unchanged by the mirror z → −z, so each mode must be even or odd under it.", "The electric field is a vector. Under this mirror, in-plane components keep their sign and E_z flips sign.", "A component that must equal minus itself at z = 0 is zero there.", "So at the mid-plane, TE has no E_z and TM has no in-plane field. FDTD solvers use exactly this mirror (PMC for TE, PEC for TM) to halve a simulation (Chapter 2, Lesson 4)."],
say: "Because the air-clad membrane is mirror symmetric, a dot at its mid-plane couples in-plane dipoles only to TE-like modes and z dipoles only to TM-like modes. This holds only at the mid-plane.",
num: "Membrane thickness t = <b>160 nm</b>, mid-plane at z = 0, surfaces at z = ±80 nm.<br>The curves here are schematic shapes that obey the symmetry. For real values, read |E_z| of TE0 from a mode solver at the dot height.",
r(fig, ctl) {
  ctl.innerHTML = sl("z", "Dot height z from mid-plane", -80, 80, 1, 0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const z = +$("z").value; $("zv").textContent = z + " nm";
    const t = 160, u_ = z / (t / 2);
    const teIn = Math.cos(u_ * 0.9 * Math.PI / 2) ** 2, teZ = (0.35 * Math.sin(u_ * Math.PI / 2)) ** 2, tmZ = (0.75 + 0.25 * u_ * u_) ** 2 * 0.8;
    const zy = v => 150 - v / 80 * 60;
    const pf = f => { let d = ""; for (let v = -110; v <= 110; v += 2) { const inside = Math.abs(v) <= 80; const val = f(v, inside); d += (d ? "L" : "M") + (200 + val * 70).toFixed(1) + " " + zy(v).toFixed(1); } return d; };
    const tey = (v, ins) => ins ? Math.cos(v / 80 * 0.9 * Math.PI / 2) : Math.cos(0.9 * Math.PI / 2) * Math.exp(-(Math.abs(v) - 80) / 40);
    const tez = (v, ins) => ins ? 0.35 * Math.sin(v / 80 * Math.PI / 2) : Math.sign(v) * 0.35 * 3 * Math.exp(-(Math.abs(v) - 80) / 40) * 0.5;
    fig.innerHTML = svg(280, `<rect x="60" y="${zy(80)}" width="560" height="${zy(-80)-zy(80)}" fill="var(--gray-bg)" stroke="var(--p)" stroke-width="0.5"/><text class="ts" x="66" y="${zy(80)-6}">air</text><text class="ts" x="66" y="${zy(-80)+16}">air</text><text class="ts" x="560" y="${zy(0)+4}">GaAs</text><line x1="60" x2="620" y1="${zy(0)}" y2="${zy(0)}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><text class="ts" x="500" y="${zy(0)-4}">mid-plane</text>
      <line x1="200" x2="200" y1="30" y2="270" stroke="var(--p)" stroke-width="0.5"/>
      <path d="${pf(tey)}" fill="none" stroke="#378ADD" stroke-width="2.5"/><path d="${pf(tez)}" fill="none" stroke="#D85A30" stroke-width="2" stroke-dasharray="5 4"/>
      <circle cx="380" cy="${zy(z)}" r="8" fill="#EF9F27" stroke="#854F0B"/><line x1="380" x2="380" y1="${zy(z)}" y2="${zy(z)}" stroke="none"/>
      <text class="ts" x="210" y="40">TE0: in-plane field (blue), E_z (coral dashed)</text><text class="ts" x="380" y="272" text-anchor="middle">schematic profiles, not solver data</text>`);
    $("ro").innerHTML = `<div><span>in-plane dipole → TE</span><b>${teIn.toFixed(2)}</b></div><div><span>z dipole → TE (leak)</span><b>${teZ.toFixed(3)}</b></div><div><span>z dipole → TM</span><b>${tmZ.toFixed(2)}</b></div>`;
  };
  $("z").oninput = u; u();
}},

{s: "3. Top view", t: "Top view: E<sub>y</sub> across the strip, E<sub>x</sub> along it",
intu: "Now look from above at the TE0 mode in a narrow strip. Its main field E<sub>y</sub> points across the strip and is strongest at the center. But a guided mode also has a small field component along the propagation direction, E<sub>x</sub>. It is zero on the center line, grows toward the edges, has opposite signs on the two sides, and oscillates a quarter period out of step with E<sub>y</sub>. Slide the dot across the strip. At the center a y dipole couples best and an x dipole does not couple at all. Near the edges both components are present, which sets up card 4.",
eq: "TE0 at the mid-plane: &nbsp; E = (E<sub>x</sub>, E<sub>y</sub>, 0), &nbsp; E<sub>x</sub> = i a(y), &nbsp; E<sub>y</sub> = b(y)<br>a(−y) = −a(y), &nbsp; a(0) = 0 &nbsp;&nbsp;&nbsp; from ∇·(εE) = 0: &nbsp; i β E<sub>x</sub> = −∂E<sub>y</sub>/∂y (inside the core)",
sym: [["x", "propagation direction"], ["y", "across the strip width"], ["a(y), b(y)", "real amplitudes of the longitudinal and transverse field"], ["i", "the quarter-period delay between E_x and E_y"], ["β", "propagation constant, n_eff 2π/λ"]],
how: ["Inside the uniform core, ∇·E = 0. For a field ∝ e^(iβx), this gives iβE_x + ∂E_y/∂y + ∂E_z/∂z = 0.", "At the mid-plane ∂E_z/∂z is small for TE0, so E_x ≈ (i/β) ∂E_y/∂y.", "E_y peaks at the center, so its slope is zero there: E_x = 0 on the center line.", "The slope has opposite signs on the two sides, and the factor i means E_x is a quarter period out of phase with E_y."],
say: "The TE0 mode has a longitudinal field component that vanishes on the waveguide axis, is antisymmetric across the width, and is in quadrature with the transverse field.",
num: "Example: n<sub>eff</sub> = 2.4 at 795 nm gives β = 2π × 2.4 / 795 nm ≈ <b>0.019 nm⁻¹</b><br>For a 200 nm wide strip the dot can sit at most 100 nm from the axis.<br>Amplitudes in the plot are schematic.",
r(fig, ctl) {
  ctl.innerHTML = sl("y", "Dot position across the strip", -100, 100, 1, 0) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const yv = +$("y").value; $("yv").textContent = yv + " nm";
    const b = Math.cos(yv / 100 * Math.PI / 2 * 0.85), a = 0.55 * Math.sin(yv / 100 * Math.PI / 2);
    const Y = v => 150 - v / 100 * 70;
    let arr = ""; for (let xx = 90; xx <= 590; xx += 50) for (const v of [-80, -40, 0, 40, 80]) { const bb = Math.cos(v / 100 * Math.PI / 2 * 0.85) * 26; arr += `<line x1="${xx}" y1="${Y(v)+bb/2}" x2="${xx}" y2="${Y(v)-bb/2}" stroke="#378ADD" stroke-width="1.4" marker-end="url(#ar)" opacity="0.6"/>`; }
    fig.innerHTML = svg(280, `<rect x="60" y="${Y(100)}" width="560" height="${Y(-100)-Y(100)}" fill="var(--gray-bg)" stroke="var(--p)" stroke-width="0.5"/>${arr}<line x1="60" x2="620" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/><line x1="250" x2="430" y1="40" y2="40" stroke="var(--t)" marker-end="url(#ar)"/><text class="ts" x="340" y="32" text-anchor="middle">propagation (x)</text><circle cx="340" cy="${Y(yv)}" r="9" fill="#EF9F27" stroke="#854F0B"/><text class="ts" x="340" y="262" text-anchor="middle">blue: E_y of TE0 (schematic). Width about 200 nm.</text>`);
    $("ro").innerHTML = `<div><span>|E_y|² (y dipole)</span><b>${(b * b).toFixed(2)}</b></div><div><span>|E_x|² (x dipole)</span><b>${(a * a).toFixed(3)}</b></div><div><span>E_x is</span><b>${Math.abs(yv) < 2 ? "zero" : "90° out of phase"}</b></div>`;
  };
  $("y").oninput = u; u();
}},

{s: "4. Chirality", t: "Circular dipoles emit one way: chiral coupling",
intu: "A σ⁺ dipole is an x and a y oscillation a quarter period apart. Off center, the TE0 field also has x and y parts a quarter period apart (card 3). For light going forward the two match the dipole's rotation, and for light going backward they rotate the other way, because E<sub>x</sub> flips sign when the direction reverses. So one direction gets constructive overlap and the other destructive: the dot emits more in one direction. Which way depends on σ⁺ or σ⁻, and on which side of the center the dot sits. Slide the dot and switch the dipole. Javadi et al. 2018 used this spin-dependent directional emission in a nanobeam waveguide.",
eq: "d<sub>σ+</sub> = (x̂ + iŷ)/√2, &nbsp;&nbsp; E<sub>fwd</sub> = (i a, b), &nbsp; E<sub>bwd</sub> = (−i a, b)<br>Γ<sub>fwd</sub> ∝ |d*·E<sub>fwd</sub>|² = (a − b)²/2, &nbsp;&nbsp; Γ<sub>bwd</sub> ∝ (a + b)²/2<br>D = (Γ<sub>fwd</sub> − Γ<sub>bwd</sub>)/(Γ<sub>fwd</sub> + Γ<sub>bwd</sub>) = −2ab / (a² + b²)",
sym: [["fwd, bwd", "light travelling toward +x or −x"], ["a, b", "longitudinal and transverse field amplitudes at the dot (card 3)"], ["D", "directionality, from −1 (all backward) to +1 (all forward)"], ["σ⁻", "same with i → −i, which reverses the sign of D"]],
how: ["Write the circular dipole and the mode fields with their quarter-period phases.", "Reversing propagation flips the sign of E_x relative to E_y (time reversal).", "Compute |d*·E|² for each direction: the cross term 2ab enters with opposite signs.", "D is maximal (±1) where a = b. At the center a = 0, so D = 0."],
say: "A circular dipole placed off the waveguide axis couples preferentially into one propagation direction, set by its handedness. This is chiral light–matter coupling. It does not occur on the axis.",
num: "At the center (a = 0): D = <b>0</b>, both directions equal.<br>Where a = b: |D| = <b>1</b>, all emission in one direction.<br>In this schematic model, a = b happens near y ≈ ±78 nm, close to the edge. Real directionality depends on the real mode fields from Tidy3D.",
r(fig, ctl) {
  let h = 1;
  ctl.innerHTML = btns([["1", "σ⁺"], ["-1", "σ⁻"]], "h") + sl("y", "Dot position across the strip", -100, 100, 1, 50) + '<div class="readout" id="ro"></div>';
  const u = () => {
    pick(ctl, "h", h);
    const yv = +$("y").value; $("yv").textContent = yv + " nm";
    const b = Math.cos(yv / 100 * Math.PI / 2 * 0.85), a = 0.55 * Math.sin(yv / 100 * Math.PI / 2) * h;
    const F = (a - b) ** 2 / 2, B = (a + b) ** 2 / 2, D = (F - B) / (F + B);
    const Y = v => 150 - v / 100 * 60, wf = 2 + 14 * F / Math.max(F, B), wb = 2 + 14 * B / Math.max(F, B);
    fig.innerHTML = svg(270, `<rect x="60" y="${Y(100)}" width="560" height="${Y(-100)-Y(100)}" fill="var(--gray-bg)" stroke="var(--p)" stroke-width="0.5"/><line x1="60" x2="620" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--p)" stroke-dasharray="3 4" opacity="0.6"/>
      ${ring(340, Y(yv), 30, 12, h, "#D85A30")}<line x1="380" x2="590" y1="${Y(yv)}" y2="${Y(yv)}" stroke="#378ADD" stroke-width="${wf}" marker-end="url(#ar)" opacity="0.8"/><line x1="300" x2="90" y1="${Y(yv)}" y2="${Y(yv)}" stroke="#378ADD" stroke-width="${wb}" marker-end="url(#ar)" opacity="0.8"/>
      <text class="ts" x="590" y="40" text-anchor="end">forward (+x): ${(F / (F + B) * 100).toFixed(0)} %</text><text class="ts" x="90" y="40">backward (−x): ${(B / (F + B) * 100).toFixed(0)} %</text><text class="ts" x="340" y="252" text-anchor="middle">arrow thickness ∝ emitted power (schematic fields)</text>`);
    $("ro").innerHTML = `<div><span>directionality D</span><b>${D.toFixed(2)}</b></div><div><span>dot is</span><b>${Math.abs(yv) < 2 ? "on axis" : "off axis"}</b></div>`;
  };
  ctl.querySelectorAll("button").forEach(b => b.onclick = () => { h = +b.dataset.h; u(); });
  $("y").oninput = u; u();
}},

{s: "5. β factor", t: "How much light ends up useful: β and the collection chain",
intu: "The dot does not put all its light into the guided mode. Some goes into other modes and leaks out of the membrane. The β factor is the fraction that goes into the mode you want. Then that light has to travel to the edge of the chip, through your devices, and out of the grating coupler into a fiber or a camera. Each step multiplies by its efficiency. Drag the rates and the coupler efficiency to see how the total depends on each piece. The coupler efficiency is the part your Chapter 4 designs. The other numbers here are placeholders.",
eq: "β = Γ<sub>wg</sub> / (Γ<sub>wg</sub> + Γ<sub>other</sub>)<br>η<sub>total</sub> = β × f<sub>dir</sub> × η<sub>devices</sub> × η<sub>GC</sub>",
sym: [["Γ_wg", "rate into the chosen guided mode (both directions)"], ["Γ_other", "rate into everything else: radiation, other modes"], ["β", "fraction of emission captured by the mode"], ["f_dir", "fraction travelling toward the output, 0.5 without chirality"], ["η_devices", "transmission of tapers, PBS and routing"], ["η_GC", "grating coupler efficiency into the fiber or objective"]],
how: ["Emission splits between channels in proportion to their rates (golden rule for each channel).", "So the fraction into the waveguide is its rate over the total rate.", "Light then passes each component in series, and efficiencies in series multiply.", "Any weak link limits the whole chain, which is why couplers matter."],
say: "The useful photon rate is the product of the β factor, the directional fraction, the device transmissions and the out-coupling efficiency. My thesis designs the passive part of this chain, the couplers, tapers and polarization splitter, not the emitter coupling.",
num: "Placeholder example: β = 0.9, f<sub>dir</sub> = 0.5, η<sub>devices</sub> = 0.95, η<sub>GC</sub> = 0.6 ⟹ η<sub>total</sub> = <b>0.26</b><br>Use your own simulated values from Ch. 4 and Ch. 5 when you discuss this, not these numbers.",
r(fig, ctl) {
  ctl.innerHTML = sl("gw", "Γ_wg (relative)", 0, 10, 0.1, 9) + sl("go", "Γ_other (relative)", 0, 10, 0.1, 1) + sl("dv", "η_devices", 0.3, 1, 0.01, 0.95) + sl("gc", "η_GC", 0.05, 1, 0.01, 0.6) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const gw = +$("gw").value, go = +$("go").value, dv = +$("dv").value, gc = +$("gc").value;
    $("gwv").textContent = gw.toFixed(1); $("gov").textContent = go.toFixed(1); $("dvv").textContent = dv.toFixed(2); $("gcv").textContent = gc.toFixed(2);
    const beta = gw + go > 0 ? gw / (gw + go) : 0, tot = beta * 0.5 * dv * gc;
    const st = [["dot", 1], ["into mode, β", beta], ["toward output, ×0.5", beta * 0.5], ["devices", beta * 0.5 * dv], ["grating coupler", tot]];
    let bars = ""; st.forEach(([n, v], i) => { const x = 50 + i * 125; bars += `<rect x="${x}" y="${220 - v * 170}" width="80" height="${v * 170}" fill="${i ? "#378ADD" : "#EF9F27"}" rx="3"/><text class="ts" x="${x+40}" y="240" text-anchor="middle">${n}</text><text class="th" x="${x+40}" y="${212 - v * 170}" text-anchor="middle">${(v * 100).toFixed(0)}%</text>${i ? `<line x1="${x-38}" x2="${x-8}" y1="130" y2="130" class="arr" marker-end="url(#ar)"/>` : ""}`; });
    fig.innerHTML = svg(260, `<line x1="40" x2="650" y1="220" y2="220" stroke="var(--p)"/>${bars}`);
    $("ro").innerHTML = `<div><span>β</span><b>${beta.toFixed(3)}</b></div><div><span>η_total</span><b>${tot.toFixed(3)}</b></div>`;
  };
  ["gw", "go", "dv", "gc"].forEach(id => $(id).oninput = u); u();
}},

{s: "6. The PBS", t: "What the PBS does with the dot's light",
intu: "Light from the dot arrives in the waveguide as mostly TE (the strong, in-plane transitions) plus a little TM (the z part of the weak diagonals). The polarization beam splitter sends TE to one port and TM to the other. A real PBS is not perfect: a small fraction of each polarization leaks into the wrong port, which is measured by the extinction ratio. Drag the input mix and the PBS quality and watch the two output ports. Note what the PBS cannot do: σ⁺ and σ⁻ are both TE, so they leave through the same port.",
eq: "P<sub>A</sub> = T<sub>TE</sub> P<sub>TE</sub> + X<sub>TM</sub> P<sub>TM</sub> &nbsp;&nbsp; P<sub>B</sub> = T<sub>TM</sub> P<sub>TM</sub> + X<sub>TE</sub> P<sub>TE</sub><br>ER [dB] = 10 log<sub>10</sub>(T / X) &nbsp;&nbsp;&nbsp; CT [dB] = 10 log<sub>10</sub>(X)",
sym: [["P_TE, P_TM", "power arriving in each polarization"], ["A, B", "TE output port and TM output port"], ["T", "transmission of a polarization into its own port"], ["X", "leak of a polarization into the other port"], ["ER", "extinction ratio of a port: wanted over unwanted, in dB"], ["CT", "crosstalk, in dB (negative)"]],
how: ["Each input polarization splits between the two ports with its own T and X.", "The power in each port is the sum of the contributions.", "The extinction ratio compares the wanted to the unwanted polarization in a port.", "With a 1:100 TE to TM input, port B needs a very low TE leak, or the weak TM signal is buried."],
say: "The PBS separates the TE-like light of the strong transitions from the TM-like light of the weak transitions. It does not separate σ⁺ from σ⁻ and does not by itself read out the spin. Its crosstalk sets how cleanly the weak TM light can be isolated.",
num: "Input 100 : 1 (TE : TM), T = 0.95 for both, crosstalk −20 dB (X = 0.01):<br>port B: TM 0.95 vs TE leak 1.0 ⟹ the leak is as large as the signal.<br>At −30 dB: TE leak 0.1, about 10 times below the TM signal.<br>Use your own PBS numbers from Ch. 5 when you discuss this.",
r(fig, ctl) {
  ctl.innerHTML = sl("r", "TE : TM input (TM per 100 TE)", 0.2, 50, 0.1, 1) + sl("T", "Transmission T", 0.5, 1, 0.01, 0.95) + sl("X", "Crosstalk (dB)", -40, -5, 0.5, -20) + '<div class="readout" id="ro"></div>';
  const u = () => {
    const r = +$("r").value, T = +$("T").value, Xd = +$("X").value, X = Math.pow(10, Xd / 10);
    $("rv").textContent = r.toFixed(1); $("Tv").textContent = T.toFixed(2); $("Xv").textContent = Xd.toFixed(1) + " dB";
    const PTE = 100, PTM = r, A_te = T * PTE, A_tm = X * PTM, B_tm = T * PTM, B_te = X * PTE;
    const bar = (x, y, v, col, max) => `<rect x="${x}" y="${y}" width="${Math.max(1, v / max * 150)}" height="16" fill="${col}" rx="2"/>`;
    const mA = A_te + A_tm, mB = Math.max(B_tm + B_te, 1e-9);
    fig.innerHTML = svg(260, `<g class="c-gray"><rect x="40" y="95" width="120" height="70" rx="8" stroke-width="0.6"/></g><text class="th" x="100" y="125" text-anchor="middle">from the dot</text><text class="ts" x="100" y="145" text-anchor="middle">TE 100, TM ${r.toFixed(1)}</text>
      <g class="c-purple"><rect x="220" y="100" width="90" height="60" rx="8" stroke-width="0.6"/></g><text class="th" x="265" y="135" text-anchor="middle">PBS</text><line x1="162" x2="218" y1="130" y2="130" class="arr" marker-end="url(#ar)"/>
      <line x1="312" x2="380" y1="118" y2="70" class="arr" marker-end="url(#ar)"/><line x1="312" x2="380" y1="142" y2="190" class="arr" marker-end="url(#ar)"/>
      <text class="th" x="390" y="40">port A (TE)</text>${bar(390, 52, A_te, "#378ADD", mA)}${bar(390, 72, A_tm, "#D85A30", mA)}<text class="ts" x="560" y="64">TE ${A_te.toFixed(1)}</text><text class="ts" x="560" y="84">TM ${A_tm.toFixed(3)}</text>
      <text class="th" x="390" y="168">port B (TM)</text>${bar(390, 180, B_tm, "#D85A30", mB)}${bar(390, 200, B_te, "#378ADD", mB)}<text class="ts" x="560" y="192">TM ${B_tm.toFixed(2)}</text><text class="ts" x="560" y="212">TE leak ${B_te.toFixed(2)}</text>
      <text class="ts" x="340" y="248" text-anchor="middle">σ⁺ and σ⁻ are both inside 'TE', so both exit port A</text>`);
    $("ro").innerHTML = `<div><span>port A purity</span><b>${(A_te / (A_te + A_tm) * 100).toFixed(2)} %</b></div><div><span>port B: TM / TE leak</span><b>${(B_tm / B_te).toFixed(2)}</b></div><div><span>ER of each port</span><b>${(10 * Math.log10(T / X)).toFixed(1)} dB</b></div>`;
  };
  ["r", "T", "X"].forEach(id => $(id).oninput = u); u();
}}
],
summary: "The coupling of a dot to a waveguide mode is set by |d·E|² at the dot. The air-clad membrane is mirror symmetric, so at its mid-plane TE-like modes have only in-plane field and TM-like modes only z field. In-plane dipoles, which are all the strong transitions, feed TE, and the z part of the weak diagonals feeds TM. Across the strip, TE0 has a longitudinal component that is zero on the axis and in quadrature with the transverse field, so an off-axis circular dipole emits directionally. The useful photon rate is β times the direction fraction times the device and coupler efficiencies, and the PBS separates TE from TM but not σ⁺ from σ⁻.",
sheet: [
["Γ<sub>wg</sub> ∝ |d*·E<sub>k</sub>(r<sub>0</sub>)|² n<sub>g</sub>", "Coupling to one mode"],
["TE-like: E<sub>z</sub>(z = 0) = 0, &nbsp; TM-like: E<sub>x,y</sub>(z = 0) = 0", "Mirror symmetry of the membrane"],
["iβE<sub>x</sub> ≈ −∂E<sub>y</sub>/∂y", "Longitudinal field of TE0, zero on axis"],
["D = −2ab/(a² + b²)", "Directionality of a σ⁺ dipole"],
["β = Γ<sub>wg</sub>/(Γ<sub>wg</sub> + Γ<sub>other</sub>)", "β factor"],
["η<sub>total</sub> = β f<sub>dir</sub> η<sub>devices</sub> η<sub>GC</sub>", "Collection chain"],
["ER [dB] = 10 log<sub>10</sub>(T/X)", "PBS extinction ratio"]],
consts: "Example geometry: GaAs strip about 200 nm × 160 nm in air at 795 nm. Mode shapes on this page are schematic.",
sources: ["Lodahl, Mahmoodian and Stobbe, Rev. Mod. Phys. 87, 347 (2015) (thesis ref., β factor, chiral coupling)", "Javadi et al., Nature Nanotechnology 13, 398 (2018) (thesis ref., spin-dependent directional emission)", "Johnson et al., Phys. Rev. B 60, 5751 (1999) (mirror symmetry of slab modes)"]
});
