(function () {
/* Quantum Light and Matter, Part A: Griffiths, Introduction to Quantum Mechanics (1995).
   Chapter 3: Formalism. Seven cards following Sections 3.1 to 3.4.
   Most visuals use a real two-dimensional slice of Hilbert space so the linear algebra becomes geometry. */
const { tx, rc, ln, ci, fmt, C } = QM;
const ro = pairs => pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
const D = Math.PI / 180;
const arr = (x1, y1, x2, y2, col, w, dash) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col}" stroke-width="${w || 2.5}"${dash ? ` stroke-dasharray="${dash}"` : ""} marker-end="url(#ar)"/>`;
/* a 2D plane centred at (cx, cy) with unit length R pixels */
const plane = (cx, cy, R, ext) => {
  const P = (x, y) => [cx + x * R, cy - y * R];
  let s = ln(cx - ext * R, cy, cx + ext * R, cy, "var(--b)") + ln(cx, cy - ext * R, cx, cy + ext * R, "var(--b)");
  return { P, s, R, cx, cy };
};
const vec = (Pl, x, y, col, w, lab, dash) => { const [a, b] = Pl.P(0, 0), [c, d] = Pl.P(x, y); const L = Math.hypot(c - a, d - b) || 1; return arr(a, b, c, d, col, w, dash) + (lab ? tx(c + (c - a) / L * 14, d + (d - b) / L * 14 + 4, lab, "middle", "th", `fill="${col}"`) : ""); };

/* infinite well states for cards 4 and 7 (a = 10 nm) */
const A = 10, psiW = (n, x) => (x <= 0 || x >= A) ? 0 : Math.sqrt(2 / A) * Math.sin(n * Math.PI * x / A), En = n => n * n * Math.PI * Math.PI / (2 * A * A);

addLesson("qlm", "gr", {
level: "Griffiths Ch. 3",
num: "Chapter 3",
id: "qlm-gr-c3", title: "Formalism", short: "Ch 3. Formalism",
labels: { intu: "What the picture shows", how: "Key steps", note: "Where this shows up later" },
big: String.raw`Chapters 1 and 2 worked with wave functions. Chapter 3 shows that they are <b>vectors</b>, and that all of quantum mechanics is linear algebra. A state is an arrow \(|\Psi\rangle\) (card 1). An observable is a Hermitian operator, and its eigenvectors are the special arrows it only stretches (card 2). Operators need not commute, and \([x, p] = i\hbar\) is the most important example (card 3). Functions are vectors with infinitely many components, so integrals are just dot products (card 4). Then the rules of measurement become geometry: the possible results are the eigenvalues, and their probabilities are the squared components of the state along the eigenvectors (card 5). Two observables that do not commute cannot both be sharp, and the general uncertainty principle follows (card 6). Energy and time have their own, different kind of uncertainty relation (card 7). Gerry and Knight is written entirely in this language, so this chapter is the grammar for the second book.`,
bridge: String.raw`<b>How to study this chapter:</b> Section 3.1 (pages 75 to 95) is a linear algebra review. Read it quickly with cards 1 to 3 and focus on Dirac notation, Hermitian operators and eigenvectors. Sections 3.3 and 3.4 (pages 104 to 116) are the physics, read them carefully with cards 5 to 7. Worth doing afterwards: Problems 3.36 (card 5 idea), 3.39 and 3.42 (card 6).<div style="margin-top:12px;padding:10px 14px;border:1px solid var(--b);border-radius:8px"><b>Watch alongside (MIT 8.04 clips are by Barton Zwiebach, links open the video page):</b><ul style="margin:6px 0 0 18px;padding:0"><li><b>Cards 2 and 5:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/expectation-value-of-hermitian-operators/" target="_blank" rel="noopener">L9.1 Expectation value of Hermitian operators</a> (17 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/eigenfunctions-of-a-hermitian-operator/" target="_blank" rel="noopener">L9.2 Eigenfunctions of a Hermitian operator</a> (13 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/completeness-of-eigenvectors-and-measurement-postulate/" target="_blank" rel="noopener">L9.3 Completeness and the measurement postulate</a> (17 min)</li><li><b>Card 3:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/commutators-matrices-and-3-dimensional-schroedinger-equation/" target="_blank" rel="noopener">L5.4 Commutators and matrices</a> (16 min)</li><li><b>Card 4:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/fourier-transforms-and-delta-functions/" target="_blank" rel="noopener">L8.1 Fourier transforms and delta functions</a> (14 min)</li><li><b>Card 6:</b> <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/defining-uncertainty/" target="_blank" rel="noopener">L9.5 Defining uncertainty</a> (11 min), <a href="https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/resources/uncertainty-and-eigenstates/" target="_blank" rel="noopener">L10.1 Uncertainty and eigenstates</a> (16 min), <a href="https://ocw.mit.edu/courses/8-05-quantum-physics-ii-fall-2013/resources/lecture-11-uncertainty-principle-and-compatible-observables-cont" target="_blank" rel="noopener">MIT 8.05 Lecture 11, Uncertainty principle and compatible observables</a> (full lecture, optional)</li></ul></div>`,
cards: [

/* ---------------- 3.1 vectors ---------------- */
{ s: "1. States are vectors", t: "3.1.1 and 3.1.2 Vectors, bases and the inner product",
intu: String.raw`The blue arrow is a state \(|\alpha\rangle\). The teal arrows are a <b>basis</b>, two perpendicular unit vectors. The components of \(|\alpha\rangle\) are its shadows on the basis vectors (amber), \(a_i = \langle e_i|\alpha\rangle\). Rotate the basis: the components change completely, but the blue arrow does not move, and \(|a_1|^2 + |a_2|^2\) stays 1. The state is the arrow, the components are just a description of it. In quantum mechanics the basis is chosen by what you measure, and the squared components become probabilities (card 5). The coral arrow is a second state \(|\beta\rangle\). Their inner product \(\langle\alpha|\beta\rangle\) measures how much they overlap: 1 when parallel, 0 when perpendicular (orthogonal). This picture uses real numbers in 2D. Quantum vectors have complex components and any number of dimensions, but every rule here carries over.`,
eq: String.raw`\[ |\alpha\rangle = \sum_i a_i|e_i\rangle, \qquad a_i = \langle e_i|\alpha\rangle \]\[ \langle\alpha|\beta\rangle = \sum_i a_i^*b_i, \qquad \langle\beta|\alpha\rangle = \langle\alpha|\beta\rangle^* \]\[ |\langle\alpha|\beta\rangle|^2 \le \langle\alpha|\alpha\rangle\langle\beta|\beta\rangle \]<div class="eqref">Griffiths Section 3.1.2 and Eq. [3.27], the Schwarz inequality</div>`,
sym: [[String.raw`\(|\alpha\rangle\)`, "a ket, a vector in the state space"], [String.raw`\(\langle\alpha|\)`, "a bra, the conjugate partner that eats a ket and returns a number"], [String.raw`\(|e_i\rangle\)`, "orthonormal basis vectors, ⟨eᵢ|eⱼ⟩ = δᵢⱼ"], [String.raw`\(a_i\)`, "components of |α⟩ in that basis, complex in general"], [String.raw`\(\langle\alpha|\beta\rangle\)`, "inner product, the generalized dot product"]],
how: [String.raw`A vector space has addition and multiplication by (complex) scalars, with the familiar rules (Eqs. 3.1 to 3.10).`, String.raw`The inner product takes two vectors and returns a complex number. It is linear in the second slot and conjugated when the order is swapped, so \(\langle\alpha|\alpha\rangle\) is real and never negative.`, String.raw`An orthonormal basis lets you find components by projection: \(a_i = \langle e_i|\alpha\rangle\). This is Fourier's trick from Chapter 2 in its general form.`, String.raw`The Schwarz inequality, \(|\langle\alpha|\beta\rangle|^2 \le \langle\alpha|\alpha\rangle\langle\beta|\beta\rangle\), is what proves the uncertainty principle in card 6.`],
say: String.raw`A quantum state is a vector |Ψ⟩ in a complex vector space with an inner product, its components in an orthonormal basis are cᵢ = ⟨eᵢ|Ψ⟩, and the vector itself does not depend on which basis you use to describe it.`,
note: String.raw`Your polarization beam splitter is this card in hardware. Light polarization is a 2D complex vector. The PBS picks the basis (TE and TM), and the power in each output is the squared component of the input along that basis vector.`,
num: String.raw`State at 30°, basis at 0°: components \(\cos 30° = 0.866\) and \(\sin 30° = 0.500\), squares 0.75 and 0.25. Rotate the basis by 30° and the components become 1 and 0. Two states 90° apart have \(\langle\alpha|\beta\rangle = 0\).`,
r(fig, ctl) {
  ctl.innerHTML = sl("th", "State |α⟩ angle", 0, 360, 1, 30) + sl("ph", "Basis rotation", 0, 90, 1, 0) + sl("be", "Second state |β⟩ angle", 0, 360, 1, 110) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    const th = +$("th").value * D, ph = +$("ph").value * D, be = +$("be").value * D;
    $("thv").textContent = $("th").value + "°"; $("phv").textContent = $("ph").value + "°"; $("bev").textContent = $("be").value + "°";
    const Pl = plane(220, 200, 140, 1.25); let s = Pl.s + ci(220, 200, 140, "none", "var(--b)", 'stroke-dasharray="3 4"');
    const e1 = [Math.cos(ph), Math.sin(ph)], e2 = [-Math.sin(ph), Math.cos(ph)], a = [Math.cos(th), Math.sin(th)], b = [Math.cos(be), Math.sin(be)];
    const a1 = a[0] * e1[0] + a[1] * e1[1], a2 = a[0] * e2[0] + a[1] * e2[1];
    [[e1, 1], [e2, 1]].forEach(([e]) => { const [x1, y1] = Pl.P(-1.25 * e[0], -1.25 * e[1]), [x2, y2] = Pl.P(1.25 * e[0], 1.25 * e[1]); s += ln(x1, y1, x2, y2, C.teal, 1, "2 3"); });
    s += vec(Pl, e1[0], e1[1], C.teal, 2, "e₁") + vec(Pl, e2[0], e2[1], C.teal, 2, "e₂");
    // projections
    const [px1, py1] = Pl.P(a1 * e1[0], a1 * e1[1]), [px2, py2] = Pl.P(a2 * e2[0], a2 * e2[1]), [ax, ay] = Pl.P(a[0], a[1]);
    s += ln(ax, ay, px1, py1, C.amber, 1.5, "4 3") + ln(ax, ay, px2, py2, C.amber, 1.5, "4 3") + ci(px1, py1, 4, C.amber) + ci(px2, py2, 4, C.amber);
    const [o0, o1] = Pl.P(0, 0); s += ln(o0, o1, px1, py1, C.amber, 5, "", 'stroke-opacity="0.6"') + ln(o0, o1, px2, py2, C.amber, 5, "", 'stroke-opacity="0.6"');
    s += vec(Pl, b[0], b[1], C.coral, 2.5, "|β⟩") + vec(Pl, a[0], a[1], C.blue, 3.5, "|α⟩");
    // component bars
    const Fb = QM.frame(450, 60, 180, 200, { xmin: 0, xmax: 3, ymin: -1, ymax: 1, xt: [], yt: [-1, 0, 1], yl: "" });
    s += Fb.s + ln(Fb.x0, Fb.Y(0), Fb.x0 + Fb.w, Fb.Y(0), "var(--p)");
    [[a1, "a₁"], [a2, "a₂"]].forEach(([v, l], i) => { const x = Fb.X(0.4 + i * 1.2); s += rc(x, Math.min(Fb.Y(0), Fb.Y(v)), Fb.X(1) - Fb.X(0.2), Math.abs(Fb.Y(v) - Fb.Y(0)), C.amber) + tx(x + 20, Fb.y0 + Fb.h + 16, l, "middle", "th"); });
    s += tx(Fb.x0 + Fb.w / 2, Fb.y0 - 10, "components in this basis", "middle");
    fig.innerHTML = svg(400, s);
    const ip = a[0] * b[0] + a[1] * b[1];
    $("ro").innerHTML = ro([["a₁ = ⟨e₁|α⟩", fmt(a1, 3)], ["a₂ = ⟨e₂|α⟩", fmt(a2, 3)], ["|a₁|² + |a₂|²", fmt(a1 * a1 + a2 * a2, 3)], ["⟨α|β⟩", fmt(ip, 3)], ["|⟨α|β⟩|² (≤ 1, Schwarz)", fmt(ip * ip, 3)]]);
  };
  ["th", "ph", "be"].forEach(k => $(k).oninput = draw); draw();
}},

/* ---------------- 3.1 operators ---------------- */
{ s: "2. Operators and eigenvectors", t: "3.1.3 to 3.1.6 Operators, Hermitian matrices and eigenvectors",
intu: String.raw`An operator turns every vector into another vector. Here the faint circle is all unit vectors, and the coral curve is where the matrix sends them. Press <b>Play</b> to sweep a test vector (blue) around the circle with its image (coral). Most vectors get both stretched and <b>turned</b>. A few special directions are only stretched: the image lies on the same line. Those are the <b>eigenvectors</b> (purple lines), and the stretch factor is the eigenvalue. For a <b>Hermitian</b> matrix (symmetric, here \(b = c\)) there are always two, they are <b>perpendicular</b>, and the eigenvalues are real. Choose <b>Shear</b> and the eigenvectors collapse onto one line. Choose <b>Rotation</b> and every vector turns, no real eigenvector at all. That is why observables must be Hermitian: real measurement results, and a complete perpendicular set of answers.`,
eq: String.raw`\[ \hat T|\alpha\rangle = \lambda|\alpha\rangle \]\[ \text{Hermitian: } \langle\alpha|\hat T\beta\rangle = \langle\hat T\alpha|\beta\rangle, \quad T_{ij} = T_{ji}^* \]\[ \Rightarrow\ \lambda \text{ real}, \qquad \langle\alpha_1|\alpha_2\rangle = 0 \text{ for } \lambda_1 \ne \lambda_2 \]<div class="eqref">Griffiths Sections 3.1.3, 3.1.5 and 3.1.6</div>`,
sym: [[String.raw`\(\hat T\)`, "a linear operator, represented by a matrix Tᵢⱼ = ⟨eᵢ|T eⱼ⟩ in a basis"], [String.raw`\(\lambda\)`, "eigenvalue, the stretch factor"], [String.raw`\(|\alpha\rangle\)`, "eigenvector, a direction the operator does not turn"], [String.raw`\(T^\dagger\)`, "Hermitian conjugate, transpose and complex conjugate. Hermitian means T = T†"]],
how: [String.raw`Eigenvalues solve \(\det(\mathsf T - \lambda\mathsf 1) = 0\), the characteristic equation. For 2×2: \(\lambda^2 - (\text{tr}\,\mathsf T)\lambda + \det\mathsf T = 0\).`, String.raw`If \(\hat T\) is Hermitian, \(\lambda\langle\alpha|\alpha\rangle = \langle\alpha|\hat T\alpha\rangle = \langle\hat T\alpha|\alpha\rangle = \lambda^*\langle\alpha|\alpha\rangle\), so \(\lambda\) is real.`, String.raw`For two eigenvectors: \(\lambda_2\langle\alpha_1|\alpha_2\rangle = \langle\alpha_1|\hat T\alpha_2\rangle = \langle\hat T\alpha_1|\alpha_2\rangle = \lambda_1\langle\alpha_1|\alpha_2\rangle\). If \(\lambda_1 \ne \lambda_2\), the overlap must be 0.`, String.raw`In the eigenvector basis a Hermitian matrix is diagonal, with the eigenvalues on the diagonal. Diagonalizing means rotating to that basis.`],
say: String.raw`Observables are Hermitian operators, whose eigenvalues are real and whose eigenvectors (for distinct eigenvalues) are orthogonal and form a basis in which the operator is diagonal.`,
note: String.raw`In Gerry and Knight the Hamiltonian of an atom coupled to light (Chapter 4) is a small Hermitian matrix. Its eigenvectors are the <b>dressed states</b> and its eigenvalue splitting is the vacuum Rabi splitting, exactly the two purple lines of this card.`,
num: String.raw`Default Hermitian matrix \(\begin{pmatrix}2 & 0.8\\ 0.8 & 0.6\end{pmatrix}\): trace 2.6, determinant 0.56, eigenvalues 2.36 and 0.24, eigenvectors at 24.4° and 114.4°, exactly 90° apart. Rotation by 40°: eigenvalues \(e^{\pm i\,40°}\), complex, no real eigenvector.`,
r(fig, ctl) {
  const PRE = { herm: [2, 0.8, 0.8, 0.6], shear: [1, 1, 0, 1], rot: [Math.cos(40 * D), -Math.sin(40 * D), Math.sin(40 * D), Math.cos(40 * D)], proj: [Math.cos(30 * D) ** 2, Math.cos(30 * D) * Math.sin(30 * D), Math.cos(30 * D) * Math.sin(30 * D), Math.sin(30 * D) ** 2] };
  let pre = "herm", ang = 0;
  ctl.innerHTML = btns([["herm", "Hermitian"], ["shear", "Shear"], ["rot", "Rotation"], ["proj", "Projector"]], "pre") + sl("ma", "a (top left)", -2, 2.5, 0.05, 2) + sl("mb", "b (top right)", -2, 2, 0.05, 0.8) + sl("mc", "c (bottom left)", -2, 2, 0.05, 0.8) + sl("md", "d (bottom right)", -2, 2.5, 0.05, 0.6) + `<div class="readout" id="ro"></div>`;
  const setP = k => { pre = k; ["ma", "mb", "mc", "md"].forEach((id, i) => $(id).value = PRE[k][i]); };
  const draw = () => {
    pick(ctl, "pre", pre);
    const [a, b, c, d] = ["ma", "mb", "mc", "md"].map(id => { $(id + "v").textContent = fmt(+$(id).value, 2); return +$(id).value; });
    const Pl = plane(230, 210, 75, 2.6); let s = Pl.s + ci(230, 210, 75, "none", "var(--p)", 'stroke-dasharray="3 4"');
    let dd = ""; for (let k = 0; k <= 120; k++) { const q = k / 120 * 2 * Math.PI, x = Math.cos(q), y = Math.sin(q); const [X, Y] = Pl.P(a * x + b * y, c * x + d * y); dd += (k ? "L" : "M") + X.toFixed(1) + " " + Y.toFixed(1); }
    s += `<path d="${dd}" fill="${C.coral}" fill-opacity="0.08" stroke="${C.coral}" stroke-width="1.5"/>`;
    const tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det, evs = [];
    if (disc >= -1e-12) {
      const r = Math.sqrt(Math.max(0, disc));
      [tr / 2 + r, tr / 2 - r].forEach(l => { let v = Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : (Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]); const n = Math.hypot(...v); evs.push({ l, v: [v[0] / n, v[1] / n] }); });
      evs.forEach(e => { const [x1, y1] = Pl.P(-2.6 * e.v[0], -2.6 * e.v[1]), [x2, y2] = Pl.P(2.6 * e.v[0], 2.6 * e.v[1]); s += ln(x1, y1, x2, y2, C.purple, 2, "6 4") + vec(Pl, e.l * e.v[0], e.l * e.v[1], C.purple, 3); });
    }
    const v = [Math.cos(ang), Math.sin(ang)], Tv = [a * v[0] + b * v[1], c * v[0] + d * v[1]];
    s += vec(Pl, Tv[0], Tv[1], C.coral, 3, "T|v⟩") + vec(Pl, v[0], v[1], C.blue, 3, "|v⟩");
    const cross = v[0] * Tv[1] - v[1] * Tv[0], turn = Math.atan2(cross, v[0] * Tv[0] + v[1] * Tv[1]) / D;
    s += tx(450, 60, `T = ( ${fmt(a, 2)}   ${fmt(b, 2)} )`, "start", "th") + tx(450, 80, `      ( ${fmt(c, 2)}   ${fmt(d, 2)} )`, "start", "th");
    s += tx(450, 120, Math.abs(b - c) < 1e-6 ? "Hermitian (b = c)" : "not Hermitian (b ≠ c)", "start", "th", `fill="${Math.abs(b - c) < 1e-6 ? C.teal : C.red}"`);
    s += tx(450, 150, `test vector turned by ${fmt(turn, 1)}°`, "start", "ts") + tx(450, 170, Math.abs(turn) < 2 || Math.abs(Math.abs(turn) - 180) < 2 ? "on an eigenvector now" : "", "start", "th", `fill="${C.purple}"`);
    s += tx(450, 230, "purple dashed: eigenvector lines", "start", "ts", `fill="${C.purple}"`) + tx(450, 248, "purple arrows: λ times the eigenvector", "start", "ts", `fill="${C.purple}"`) + tx(450, 266, "coral curve: image of the unit circle", "start", "ts", `fill="${C.coral}"`);
    fig.innerHTML = svg(420, s);
    const angle = evs.length === 2 ? Math.acos(Math.min(1, Math.abs(evs[0].v[0] * evs[1].v[0] + evs[0].v[1] * evs[1].v[1]))) / D : NaN;
    $("ro").innerHTML = ro(disc >= -1e-12 ? [["eigenvalues", fmt(evs[0].l, 3) + " and " + fmt(evs[1].l, 3)], ["eigenvector angles", fmt(Math.atan2(evs[0].v[1], evs[0].v[0]) / D, 1) + "° and " + fmt(Math.atan2(evs[1].v[1], evs[1].v[0]) / D, 1) + "°"], ["angle between them", Math.abs(disc) < 1e-9 ? "they coincide" : fmt(angle, 1) + "°"]] : [["eigenvalues", `${fmt(tr / 2, 3)} ± ${fmt(Math.sqrt(-disc), 3)} i (complex)`], ["real eigenvectors", "none, every vector turns"]]);
  };
  ctl.querySelectorAll("button[data-pre]").forEach(bt => bt.onclick = () => { setP(bt.dataset.pre); draw(); });
  ["ma", "mb", "mc", "md"].forEach(id => $(id).oninput = () => { pre = ""; draw(); });
  QM.player(ctl, () => { ang += 0.012; draw(); });
  setP("herm"); draw();
}},

/* ---------------- 3.1.4 commutators ---------------- */
{ s: "3. Commutators", t: "3.1.4 Commutators, and why [x, p] = iħ",
intu: String.raw`For numbers \(ab = ba\). For operators the order can matter. <b>Two matrices:</b> A stretches along x, B rotates. Follow the blue path (first B, then A) and the coral path (first A, then B) from the same starting vector. They end in different places, and the purple arrow between the two endpoints is \([\hat A, \hat B]|v\rangle\). Set the stretch to 1 or the rotation to 0 and the paths meet: the operators commute. <b>x and p:</b> now act on a real function \(f(x)\). "Multiply by x, then differentiate" and "differentiate, then multiply by x" differ by exactly \(f\) itself, times \(i\hbar\). The commutator of position and momentum is not zero, it is the constant \(i\hbar\), for every function. That one fact is behind the uncertainty principle of card 6.`,
eq: String.raw`\[ [\hat A, \hat B] \equiv \hat A\hat B - \hat B\hat A \]<div class="eqref">Griffiths Eq. [3.138]</div>\[ [\hat x, \hat p]f = x\frac{\hbar}{i}\frac{df}{dx} - \frac{\hbar}{i}\frac{d}{dx}(xf) = i\hbar f \quad\Rightarrow\quad [\hat x, \hat p] = i\hbar \]<div class="eqref">Griffiths Eq. [3.140]</div>`,
sym: [[String.raw`\([\hat A, \hat B]\)`, "commutator, zero when the order does not matter"], [String.raw`\(\hat x\)`, "position operator, multiply by x"], [String.raw`\(\hat p = \frac{\hbar}{i}\frac{d}{dx}\)`, "momentum operator"], [String.raw`\(f(x)\)`, "a test function to act on, any function works"]],
how: [String.raw`Never manipulate operators bare: give them a test function \(f\) to act on, then throw \(f\) away at the end.`, String.raw`\(\hat x\hat p f = x\frac{\hbar}{i}f'\).`, String.raw`\(\hat p\hat x f = \frac{\hbar}{i}(xf)' = \frac{\hbar}{i}(f + xf')\) by the product rule.`, String.raw`Subtract: \([\hat x, \hat p]f = -\frac{\hbar}{i}f = i\hbar f\). True for every \(f\), so \([\hat x, \hat p] = i\hbar\), the canonical commutation relation.`],
say: String.raw`The commutator [A, B] = AB − BA measures how much the order of two operators matters, and position and momentum obey the canonical commutation relation [x, p] = iħ.`,
note: String.raw`The same relation in dimensionless form is \([\hat a, \hat a^\dagger] = 1\) for the ladder operators (Griffiths' \([a_-, a_+] = \hbar\omega\)). Gerry and Knight start Chapter 2 from exactly this commutator, and every photon calculation in the book is commutator algebra.`,
num: String.raw`Stretch 2 and rotation 40° acting on a unit vector at 20°: the two paths end 0.64 apart. For \(f(x) = e^{-x^2}\) at \(x = 0.5\): \(-xf' = 0.389\), \(-(f + xf') = -0.389\), difference \(0.779 = f(0.5)\).`,
r(fig, ctl) {
  let mode = "mat";
  ctl.innerHTML = btns([["mat", "Two matrices"], ["xp", "x and p on a function"]], "md") + `<div id="opts"></div><div class="readout" id="ro"></div>`;
  const build = () => {
    pick(ctl, "md", mode);
    $("opts").innerHTML = mode === "mat" ? sl("s", "A: stretch along x", 0.3, 2.5, 0.05, 2) + sl("r", "B: rotation (degrees)", -90, 90, 1, 40) + sl("v", "Starting vector angle", 0, 360, 1, 20)
      : btns([["g", "Gaussian"], ["h", "Oscillator ψ₁"], ["w", "Wavy bump"]], "fn");
    if (mode === "mat") ["s", "r", "v"].forEach(k => $(k).oninput = draw);
    else { ctl.querySelectorAll("button[data-fn]").forEach(b => b.onclick = () => { fn = b.dataset.fn; draw(); }); }
    draw();
  };
  let fn = "g";
  const draw = () => {
    let s = "";
    if (mode === "mat") {
      const st = +$("s").value, rt = +$("r").value * D, va = +$("v").value * D; $("sv").textContent = fmt(st, 2); $("rv").textContent = $("r").value + "°"; $("vv").textContent = $("v").value + "°";
      const Am = p => [st * p[0], p[1]], Bm = p => [Math.cos(rt) * p[0] - Math.sin(rt) * p[1], Math.sin(rt) * p[0] + Math.cos(rt) * p[1]];
      const v = [Math.cos(va), Math.sin(va)], Bv = Bm(v), ABv = Am(Bv), Av = Am(v), BAv = Bm(Av);
      const Pl = plane(250, 210, 80, 2.6); s += Pl.s + ci(250, 210, 80, "none", "var(--b)", 'stroke-dasharray="3 4"');
      const seg = (p, q, col, dash) => { const [a, b] = Pl.P(...p), [c, d] = Pl.P(...q); return arr(a, b, c, d, col, 2, dash); };
      s += vec(Pl, v[0], v[1], "var(--t)", 3, "v");
      s += seg(v, Bv, C.blue, "5 3") + seg(Bv, ABv, C.blue) + seg(v, Av, C.coral, "5 3") + seg(Av, BAv, C.coral);
      const [x1, y1] = Pl.P(...BAv), [x2, y2] = Pl.P(...ABv); s += arr(x1, y1, x2, y2, C.purple, 3);
      s += ci(...Pl.P(...ABv), 5, C.blue) + ci(...Pl.P(...BAv), 5, C.coral);
      s += tx(470, 70, "blue: first B, then A  →  ABv", "start", "ts", `fill="${C.blue}"`) + tx(470, 90, "coral: first A, then B  →  BAv", "start", "ts", `fill="${C.coral}"`) + tx(470, 110, "purple: [A, B]v = ABv − BAv", "start", "ts", `fill="${C.purple}"`);
      fig.innerHTML = svg(420, s);
      const dv = Math.hypot(ABv[0] - BAv[0], ABv[1] - BAv[1]);
      $("ro").innerHTML = ro([["|ABv − BAv|", fmt(dv, 3)], ["do A and B commute?", dv < 1e-3 ? "yes" : "no"]]);
    } else {
      pick(ctl, "fn", fn);
      const F = { g: x => Math.exp(-x * x), h: x => 1.2 * x * Math.exp(-x * x / 2), w: x => Math.exp(-x * x / 2) * Math.cos(2 * x) }[fn];
      const xs = Array.from({ length: 401 }, (_, i) => -4 + 8 * i / 400), h = 1e-4;
      const f = xs.map(F), fp = xs.map(x => (F(x + h) - F(x - h)) / (2 * h));
      const xp = xs.map((x, i) => -x * fp[i]), px = xs.map((x, i) => -(f[i] + x * fp[i])), df = xs.map((_, i) => xp[i] - px[i]);
      const Fr = QM.frame(70, 30, 540, 300, { xmin: -4, xmax: 4, ymin: -1.4, ymax: 1.4, xt: [-4, -2, 0, 2, 4], yt: [-1, 0, 1], xl: "x", yl: "Im[ … ] / ħ" });
      s += Fr.s + QM.path(Fr, xs, xp, C.amber, 2.5) + QM.path(Fr, xs, px, C.teal, 2.5) + QM.path(Fr, xs, df, C.purple, 4) + QM.path(Fr, xs, f, "var(--t)", 1.5, "5 4");
      s += tx(Fr.x0 + 8, Fr.y0 + 16, "x p f  (amber)", "start", "ts", `fill="${C.amber}"`) + tx(Fr.x0 + 8, Fr.y0 + 32, "p x f  (teal)", "start", "ts", `fill="${C.teal}"`) + tx(Fr.x0 + 8, Fr.y0 + 48, "difference [x, p] f  (purple)", "start", "ts", `fill="${C.purple}"`) + tx(Fr.x0 + 8, Fr.y0 + 64, "f itself (dashed): they coincide", "start", "ts");
      fig.innerHTML = svg(380, s);
      let mx = 0; df.forEach((v, i) => mx = Math.max(mx, Math.abs(v - f[i])));
      $("ro").innerHTML = ro([["largest |[x, p]f/iħ − f|", fmt(mx, 6)], ["conclusion", "[x, p] = iħ"]]);
    }
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; build(); });
  build();
}},

/* ---------------- 3.2 function spaces ---------------- */
{ s: "4. Functions are vectors", t: "3.2 Function spaces: a function is a vector with infinitely many components",
intu: String.raw`Sample a function at N points and you get a list of N numbers, a vector with N components (the stems). Do the same for a second function. Their dot product, \(\sum_i f_ig_i\,\Delta x\), is the lower plot: multiply component by component and add (the running sum is the purple line). Now raise N. The stems fill in, the sum turns into the integral \(\int f g\,dx\), and nothing else changes. So \(\langle f|g\rangle = \int f^*g\,dx\) is just the dot product of vectors with infinitely many components, and everything in cards 1 to 3 applies to wave functions. The well states of Chapter 2 are an orthonormal basis of this space. Two warnings from Griffiths: the eigenfunctions of \(\hat x\) are spikes (delta functions) and those of \(\hat p\) are plane waves, and neither is normalizable. They are still usable as a basis, with integrals instead of sums.`,
eq: String.raw`\[ \langle f|g\rangle = \int_a^b f(x)^*\,g(x)\,dx \;=\; \lim_{N\to\infty}\sum_{i=1}^{N} f(x_i)^*g(x_i)\,\Delta x \]\[ \hat p\,f_p = p\,f_p:\ f_p(x) = \frac{1}{\sqrt{2\pi\hbar}}e^{ipx/\hbar}, \qquad \hat x\,g_y = y\,g_y:\ g_y(x) = \delta(x - y) \]<div class="eqref">Griffiths Section 3.2 and Eqs. [3.128], [3.131]</div>`,
sym: [[String.raw`\(L_2\)`, "Hilbert space: functions with ∫|f|²dx finite, the home of physical wave functions"], [String.raw`\(N\)`, "number of sample points, the number of components"], [String.raw`\(\Delta x\)`, "spacing between samples"], [String.raw`\(f_p, g_y\)`, "eigenfunctions of momentum and position, not in L₂ but complete"]],
how: [String.raw`Functions can be added and multiplied by numbers, so they form a vector space.`, String.raw`The integral \(\int f^*g\,dx\) has all the properties of an inner product (Section 3.2), so lengths, angles and orthogonality make sense for functions.`, String.raw`A complete orthonormal set \(\{f_n\}\) is a basis: \(f = \sum c_nf_n\) with \(c_n = \langle f_n|f\rangle\). This is Fourier's trick again.`, String.raw`Operators with continuous spectra (\(\hat x\), \(\hat p\)) have eigenfunctions outside \(L_2\). They are "orthonormal" in the delta function sense, \(\langle f_p|f_{p'}\rangle = \delta(p - p')\).`],
say: String.raw`Wave functions are vectors in the Hilbert space L₂, with inner product ⟨f|g⟩ = ∫f*g dx, so the linear algebra of finite dimensional vectors carries over to functions with sums replaced by integrals.`,
note: String.raw`In Gerry and Knight the states of light live in a Hilbert space spanned by photon number states \(|n\rangle\), a discrete basis like the well states. The position-like quadrature basis is continuous, like \(\hat x\) here.`,
num: String.raw`For \(\psi_1\) and \(\psi_2\) of the 10 nm well, with N = 5 samples the sum is already exactly 0 by symmetry. For \(\psi_1\) with itself, N = 5 gives 1.000 too: sampling a sine on a uniform grid is exact here. A Gaussian against \(\psi_1\) converges more slowly and shows the approach to the integral clearly.`,
r(fig, ctl) {
  let gsel = "m";
  ctl.innerHTML = sl("N", "Number of sample points N", 3, 150, 1, 12) + sl("n", "f = ψₙ, n", 1, 6, 1, 1) + btns([["m", "g = ψₘ"], ["g", "g = Gaussian bump"]], "gs") + sl("m", "m (for g = ψₘ)", 1, 6, 1, 2) + `<div class="readout" id="ro"></div>`;
  const draw = () => {
    pick(ctl, "gs", gsel);
    const N = +$("N").value, n = +$("n").value, m = +$("m").value; $("Nv").textContent = N; $("nv").textContent = n; $("mv").textContent = m;
    const f = x => psiW(n, x), g = gsel === "m" ? (x => psiW(m, x)) : (x => Math.exp(-((x - 3.5) ** 2) / 2) / Math.pow(Math.PI, 0.25));
    const dx = A / (N + 1), xi = Array.from({ length: N }, (_, i) => (i + 1) * dx);
    const T = QM.frame(60, 26, 560, 170, { xmin: 0, xmax: A, ymin: -0.85, ymax: 0.85, xt: [0, 2, 4, 6, 8, 10], yt: [-0.5, 0, 0.5], xl: "", yl: "values" });
    const xs = Array.from({ length: 301 }, (_, i) => i * A / 300);
    let s = T.s + ln(T.x0, T.Y(0), T.x0 + T.w, T.Y(0), "var(--b)") + QM.path(T, xs, xs.map(f), C.blue, 1, "3 3") + QM.path(T, xs, xs.map(g), C.coral, 1, "3 3");
    const off = Math.min(3, (T.X(dx) - T.X(0)) * 0.18);
    xi.forEach(x => { s += ln(T.X(x) - off, T.Y(0), T.X(x) - off, T.Y(f(x)), C.blue, 2) + ci(T.X(x) - off, T.Y(f(x)), 3, C.blue) + ln(T.X(x) + off, T.Y(0), T.X(x) + off, T.Y(g(x)), C.coral, 2) + ci(T.X(x) + off, T.Y(g(x)), 3, C.coral); });
    s += tx(T.x0 + 8, T.y0 + 14, `f = ψ${n} (blue) and g (coral) as ${N}-component vectors`, "start");
    const prod = xi.map(x => f(x) * g(x) * dx), run = []; let acc = 0; prod.forEach(v => { acc += v; run.push(acc); });
    const pm = Math.max(0.05, ...prod.map(Math.abs), ...run.map(Math.abs)) * 1.15;
    const B = QM.frame(60, 236, 560, 140, { xmin: 0, xmax: A, ymin: -pm, ymax: pm, xt: [0, 2, 4, 6, 8, 10], yt: [0], xl: "x (nm)", yl: "fᵢgᵢΔx" });
    s += B.s + ln(B.x0, B.Y(0), B.x0 + B.w, B.Y(0), "var(--b)");
    xi.forEach((x, i) => { const v = prod[i]; s += rc(B.X(x) - Math.max(1, off * 1.5), Math.min(B.Y(0), B.Y(v)), Math.max(2, off * 3), Math.abs(B.Y(v) - B.Y(0)), v >= 0 ? C.teal : C.coral); });
    s += QM.path(B, xi, run, C.purple, 2.5) + tx(B.x0 + B.w - 6, B.y0 + 14, `Σ fᵢgᵢΔx = ${fmt(acc, 4)}`, "end", "th", `fill="${C.purple}"`);
    fig.innerHTML = svg(400, s);
    let ex = 0; const fine = 4000; for (let i = 1; i < fine; i++) { const x = i * A / fine; ex += f(x) * g(x) * A / fine; }
    $("ro").innerHTML = ro([["sum with N points", fmt(acc, 5)], ["integral ∫fg dx", fmt(ex, 5)], ["difference", fmt(acc - ex, 5)]]);
  };
  ["N", "n", "m"].forEach(k => $(k).oninput = draw);
  ctl.querySelectorAll("button[data-gs]").forEach(b => b.onclick = () => { gsel = b.dataset.gs; draw(); });
  draw();
}},

/* ---------------- 3.3 generalized statistical interpretation ---------------- */
{ s: "5. Measurement rules", t: "3.3 The generalized statistical interpretation: eigenvalues, probabilities, collapse",
intu: String.raw`A two-state system: a spin, or the polarization of a photon. Observable \(\hat A\) has eigenvectors along the teal axes (results \(+1\) and \(-1\)), observable \(\hat B\) along the amber axes, rotated by \(\beta\). The blue arrow is the state. Press <b>Measure A</b>: the answer is \(+1\) with probability \(|\langle a_+|\Psi\rangle|^2\), the squared shadow on the teal axis, and the state <b>jumps</b> onto that eigenvector. Measure A again: same answer every time, the state is now determinate. Now measure <b>B</b>, then A again. B knocked the state onto an amber axis, so the A result is random again. A and B do not commute, so they cannot both be sharp. With \(\beta = 45°\) this is exactly a photon sent through polarizers at 0°, 45° and 0°: knowing H/V destroys any knowledge of the diagonal polarization. <b>Measure 200 copies</b> checks the probabilities against the histogram.`,
eq: String.raw`\[ \hat Q|e_n\rangle = \lambda_n|e_n\rangle, \qquad |\Psi\rangle = \sum_n c_n|e_n\rangle, \qquad c_n = \langle e_n|\Psi\rangle \]<div class="eqref">Griffiths Eqs. [3.118], [3.120] and [3.121]</div>\[ P(\lambda_n) = |c_n|^2 = |\langle e_n|\Psi\rangle|^2, \qquad \langle Q\rangle = \langle\Psi|\hat Q\Psi\rangle = \sum_n\lambda_n|c_n|^2 \]<div class="eqref">Griffiths Eqs. [3.122], [3.114] and [3.134]</div>`,
sym: [[String.raw`\(\hat Q\)`, "the observable being measured, a Hermitian operator"], [String.raw`\(\lambda_n\)`, "its eigenvalues, the only possible results"], [String.raw`\(|e_n\rangle\)`, "its eigenvectors, the states left after the measurement"], [String.raw`\(c_n\)`, "component of the state along eₙ, |cₙ|² is the probability"]],
how: [String.raw`<b>Postulate 1:</b> the state is a normalized vector \(|\Psi\rangle\) in Hilbert space.`, String.raw`<b>Postulate 2:</b> observables are Hermitian operators \(\hat Q\), with \(\langle Q\rangle = \langle\Psi|\hat Q\Psi\rangle\).`, String.raw`<b>Postulate 3':</b> a measurement of \(Q\) returns one of the eigenvalues \(\lambda_n\), with probability \(|\langle e_n|\Psi\rangle|^2\). After the measurement the state is \(|e_n\rangle\).`, String.raw`A state with \(\sigma_Q = 0\) must satisfy \(\hat Q\Psi = \langle Q\rangle\Psi\) (Eq. 3.117): determinate states are eigenvectors.`, String.raw`Position and momentum are special cases: \(|\Psi(x)|^2\) and \(|\Phi(p)|^2\) are the squared components in the \(x\) and \(p\) bases (Eqs. 3.130 and 3.133).`],
say: String.raw`Measuring an observable Q always gives one of its eigenvalues λₙ, with probability equal to the squared magnitude of the component of the state along the corresponding eigenvector, |⟨eₙ|Ψ⟩|², and leaves the system in that eigenvector.`,
note: String.raw`Your PBS is a measurement of polarization in the TE/TM basis, and a half-wave plate rotates the basis like the \(\beta\) slider. In Gerry and Knight Chapter 6 single photons on beam splitters follow exactly these rules, and Chapter 9 uses them for the Bell tests.`,
num: String.raw`State at 30°, A basis at 0°: \(P(+1) = \cos^2 30° = 0.75\), \(\langle A\rangle = 0.75 - 0.25 = 0.50\). After a +1 result for A, measuring B at \(\beta = 45°\) gives +1 with probability 0.5, and a following A measurement is again 50/50. In 200 copies expect about 150 ± 6 results of +1 for the 30° state.`,
r(fig, ctl) {
  let st = 30 * D, log = [], hist = null, last = null;
  ctl.innerHTML = sl("th", "Prepared state angle", 0, 180, 1, 30) + sl("be", "B basis angle β", 0, 90, 1, 45) + `<div class="row"><button id="mA">Measure A</button><button id="mB">Measure B</button><button id="prep">Prepare again</button></div><div class="row"><button id="eA">Measure A on 200 copies</button><button id="eB">Measure B on 200 copies</button></div><div class="readout" id="ro"></div>`;
  const draw = () => {
    const be = +$("be").value * D; $("thv").textContent = $("th").value + "°"; $("bev").textContent = $("be").value + "°";
    const Pl = plane(200, 200, 130, 1.3); let s = Pl.s;
    const axis = (ang, col, lp, lm) => { const [x1, y1] = Pl.P(-1.3 * Math.cos(ang), -1.3 * Math.sin(ang)), [x2, y2] = Pl.P(1.3 * Math.cos(ang), 1.3 * Math.sin(ang)); return ln(x1, y1, x2, y2, col, 2, "6 4") + tx(x2 + 6 * Math.cos(ang), y2 - 6 * Math.sin(ang) + 4, lp, "middle", "th", `fill="${col}"`) + (lm ? "" : ""); };
    s += axis(0, C.teal, "a₊") + axis(Math.PI / 2, C.teal, "a₋") + axis(be, C.amber, "b₊") + axis(be + Math.PI / 2, C.amber, "b₋");
    s += ci(200, 200, 130, "none", "var(--b)", 'stroke-dasharray="3 4"');
    const v = [Math.cos(st), Math.sin(st)];
    const [ax, ay] = Pl.P(v[0], v[1]), [p1x, p1y] = Pl.P(v[0], 0), [p2x, p2y] = Pl.P(0, v[1]);
    s += ln(ax, ay, p1x, p1y, C.teal, 1, "3 3") + ln(ax, ay, p2x, p2y, C.teal, 1, "3 3");
    s += vec(Pl, v[0], v[1], C.blue, 4, "|Ψ⟩");
    if (last) s += tx(200, 370, `last: ${last}`, "middle", "th", `fill="${C.coral}"`);
    // history and histogram
    s += tx(400, 40, "measurement log (newest first)", "start", "th");
    log.slice(-10).reverse().forEach((e, i) => s += tx(400, 62 + i * 17, e, "start", "ts", `fill="${e.startsWith("A") ? C.teal : C.amber}"`));
    if (hist) {
      const H = QM.frame(420, 250, 200, 110, { xmin: 0, xmax: 2, ymin: 0, ymax: 1, xt: [], yt: [0, 0.5, 1], yl: "" });
      s += H.s;
      [[hist.p, "+1"], [1 - hist.p, "−1"]].forEach(([e, l], i) => { const f = (i === 0 ? hist.np : 200 - hist.np) / 200; s += rc(H.X(0.15 + i), H.Y(f), H.X(0.7) - H.X(0), H.Y(0) - H.Y(f), hist.obs === "A" ? C.teal : C.amber, "none", 'fill-opacity="0.6"') + ln(H.X(0.1 + i), H.Y(e), H.X(0.9 + i), H.Y(e), "var(--t)", 2, "4 3") + tx(H.X(0.5 + i), H.y0 + H.h + 16, l, "middle", "th"); });
      s += tx(H.x0 + H.w / 2, H.y0 - 8, `200 copies of ${hist.obs}: bars measured, dashes predicted`, "middle", "ts");
    }
    fig.innerHTML = svg(390, s);
    const pA = v[0] ** 2, pB = (v[0] * Math.cos(be) + v[1] * Math.sin(be)) ** 2;
    $("ro").innerHTML = ro([["P_A(+1) = |⟨a₊|Ψ⟩|²", fmt(pA, 3)], ["P_B(+1) = |⟨b₊|Ψ⟩|²", fmt(pB, 3)], ["⟨A⟩", fmt(2 * pA - 1 + 0, 3).replace("-0.000", "0.000")], ["⟨B⟩", fmt(2 * pB - 1 + 0, 3).replace("-0.000", "0.000")]]);
  };
  const meas = obs => {
    const be = obs === "A" ? 0 : +$("be").value * D, v = [Math.cos(st), Math.sin(st)], p = (v[0] * Math.cos(be) + v[1] * Math.sin(be)) ** 2;
    const plus = Math.random() < p; st = plus ? be : be + Math.PI / 2; last = `${obs} gave ${plus ? "+1" : "−1"} (chance was ${fmt(plus ? p : 1 - p, 2)})`; log.push(`${obs} = ${plus ? "+1" : "−1"}`); hist = null; draw();
  };
  const ens = obs => { const be = obs === "A" ? 0 : +$("be").value * D, v = [Math.cos(st), Math.sin(st)], p = (v[0] * Math.cos(be) + v[1] * Math.sin(be)) ** 2; let np = 0; for (let i = 0; i < 200; i++) if (Math.random() < p) np++; hist = { obs, p, np }; draw(); };
  $("mA").onclick = () => meas("A"); $("mB").onclick = () => meas("B"); $("eA").onclick = () => ens("A"); $("eB").onclick = () => ens("B");
  $("prep").onclick = () => { st = +$("th").value * D; log = []; last = null; hist = null; draw(); };
  $("th").oninput = () => { st = +$("th").value * D; log = []; last = null; hist = null; draw(); }; $("be").oninput = draw;
  draw();
}},

/* ---------------- 3.4 uncertainty and phase space ---------------- */
{ s: "6. Uncertainty principle", t: "3.4.1 and 3.4.2 The generalized uncertainty principle and the minimum-uncertainty packet",
intu: String.raw`A Gaussian state drawn in <b>phase space</b>: horizontal is position, vertical is momentum, and the ellipse marks one standard deviation (a Wigner function contour, Gerry and Knight Chapter 3). Its shadow on the x axis (top strip) is \(|\Psi(x)|^2\), its shadow on the p axis (right strip) is \(|\Phi(p)|^2\). The <b>area</b> of the ellipse can never shrink below the uncertainty limit. At \(t = 0\) the ellipse is upright and \(\sigma_x\sigma_p = \hbar/2\) exactly: the minimum-uncertainty packet of Eq. 3.145. Press <b>Play</b> in <b>Free flight</b>: fast parts run ahead, the ellipse <b>shears</b>, \(\sigma_x\) grows while \(\sigma_p\) stays fixed, so the product rises above \(\hbar/2\) even though the area is unchanged. Switch to <b>Spring</b>: the ellipse <b>rotates</b>. With width \(\sigma_0 = 0.71\) it is a circle and nothing changes: that is a <b>coherent state</b>. Any other width breathes between narrow in x and narrow in p: a <b>squeezed state</b>.`,
eq: String.raw`\[ \sigma_A^2\,\sigma_B^2 \ \ge\ \left(\frac{1}{2i}\langle[\hat A, \hat B]\rangle\right)^2 \]<div class="eqref">Griffiths Eq. [3.139]</div>\[ \sigma_x\sigma_p \ge \frac{\hbar}{2} \]<div class="eqref">Griffiths Eq. [3.141]</div>\[ \Psi(x) = Ae^{-a(x - \langle x\rangle)^2/2\hbar}\,e^{i\langle p\rangle x/\hbar} \quad (a \text{ real}) \]<div class="eqref">Griffiths Eq. [3.145], the minimum-uncertainty packet</div>`,
sym: [[String.raw`\(\sigma_A, \sigma_B\)`, "standard deviations of two observables in the same state"], [String.raw`\([\hat A, \hat B]\)`, "their commutator, iħ for x and p"], [String.raw`\(\text{cov}(x,p)\)`, "position momentum correlation, the tilt of the ellipse"], [String.raw`\(\sigma_0\)`, "starting width, in units of the oscillator length √(ħ/mω)"]],
how: [String.raw`Write \(\sigma_A^2 = \langle f|f\rangle\) and \(\sigma_B^2 = \langle g|g\rangle\) with \(|f\rangle = (\hat A - \langle A\rangle)|\Psi\rangle\) and \(|g\rangle = (\hat B - \langle B\rangle)|\Psi\rangle\).`, String.raw`Schwarz: \(\sigma_A^2\sigma_B^2 \ge |\langle f|g\rangle|^2 \ge (\mathrm{Im}\langle f|g\rangle)^2\) (Eqs. 3.135 and 3.136).`, String.raw`\(\langle f|g\rangle - \langle g|f\rangle = \langle[\hat A, \hat B]\rangle\), which gives Eq. 3.139. With \([x, p] = i\hbar\), \(\sigma_x\sigma_p \ge \hbar/2\).`, String.raw`Equality needs both steps to be equalities: \(|g\rangle = ia|f\rangle\) with \(a\) real (Eq. 3.143). For x and p that is a first order equation whose solution is the Gaussian of Eq. 3.145, with no chirp. The sheared ellipse breaks the second step, the dropped real part is the correlation.`],
say: String.raw`For any two observables, σ(A)σ(B) ≥ |⟨[A, B]⟩|/2, so incompatible observables cannot both be sharp, and for x and p the bound ħ/2 is reached only by a Gaussian with no position momentum correlation.`,
note: String.raw`<b>Direct preview of Gerry and Knight Chapters 3 and 7.</b> Swap x and p for the two quadratures of a light field: the circle that stays a circle in the spring is a <b>coherent state</b> (a laser), the breathing ellipse is <b>squeezed light</b>, and the spring is the field's own oscillation at frequency ω.`,
num: String.raw`Units: x in \(\sqrt{\hbar/m\omega}\), p in \(\sqrt{\hbar m\omega}\), so the limit is \(\sigma_x\sigma_p = 0.5\). Free flight from \(\sigma_0 = 0.5\): at \(t = 1/\omega\), \(\sigma_x = 1.12\), \(\sigma_p = 1.00\), product 1.12, but \(\sigma_x^2\sigma_p^2 - \text{cov}^2 = 0.25\) still. Spring with \(\sigma_0 = 0.4\): the product swings between 0.5 and 0.86 every quarter period.`,
r(fig, ctl) {
  let mode = "free", t = 0;
  ctl.innerHTML = btns([["free", "Free flight"], ["spring", "Spring"]], "md") + sl("s0", "Starting width σ₀", 0.3, 1.6, 0.01, 0.5) + sl("tt", "Time ωt", 0, 6.3, 0.01, 0) + `<div class="readout" id="ro"></div>`;
  const cov = () => {
    const s0 = +$("s0").value, V0 = s0 * s0, P0 = 1 / (4 * s0 * s0);
    if (mode === "free") return [V0 + t * t * P0, t * P0, P0];
    const c = Math.cos(t), sn = Math.sin(t); return [V0 * c * c + P0 * sn * sn, (P0 - V0) * sn * c, V0 * sn * sn + P0 * c * c];
  };
  const draw = () => {
    pick(ctl, "md", mode); $("s0v").textContent = fmt(+$("s0").value, 2); $("tt").value = t; $("ttv").textContent = fmt(t, 2);
    const [Vxx, Vxp, Vpp] = cov(), sx = Math.sqrt(Vxx), sp = Math.sqrt(Vpp);
    const F = QM.frame(70, 90, 300, 300, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xl: "x", yl: "p", grid: true });
    let s = F.s;
    // ellipse from covariance
    const tr = Vxx + Vpp, dt = Vxx * Vpp - Vxp * Vxp, l1 = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - dt)), l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - dt));
    const ang = 0.5 * Math.atan2(2 * Vxp, Vxx - Vpp);
    let d = ""; for (let k = 0; k <= 100; k++) { const q = k / 100 * 2 * Math.PI, u = Math.sqrt(l1) * Math.cos(q), w = Math.sqrt(l2) * Math.sin(q); const x = u * Math.cos(ang) - w * Math.sin(ang), p = u * Math.sin(ang) + w * Math.cos(ang); d += (k ? "L" : "M") + F.X(x).toFixed(1) + " " + F.Y(p).toFixed(1); }
    let dc = ""; for (let k = 0; k <= 60; k++) { const q = k / 60 * 2 * Math.PI; dc += (k ? "L" : "M") + F.X(Math.SQRT1_2 * Math.cos(q)).toFixed(1) + " " + F.Y(Math.SQRT1_2 * Math.sin(q)).toFixed(1); }
    s += `<path d="${dc}" fill="none" stroke="var(--p)" stroke-dasharray="3 3"/><path d="${d}Z" fill="${C.purple}" fill-opacity="0.3" stroke="${C.purple}" stroke-width="2.5"/>`;
    s += rc(F.X(-sx), F.Y(sp), F.X(sx) - F.X(-sx), F.Y(-sp) - F.Y(sp), "none", C.amber, 'stroke-width="1.5" stroke-dasharray="5 3"');
    // marginals
    const xs = Array.from({ length: 201 }, (_, i) => -3 + 6 * i / 200), gx = xs.map(x => Math.exp(-x * x / (2 * Vxx)) / Math.sqrt(2 * Math.PI * Vxx)), gp = xs.map(p => Math.exp(-p * p / (2 * Vpp)) / Math.sqrt(2 * Math.PI * Vpp));
    const top = 80, mxg = 1.6;
    let dt1 = `M${F.X(-3)} ${top}`; xs.forEach((x, i) => dt1 += `L${F.X(x).toFixed(1)} ${(top - Math.min(gx[i], mxg) / mxg * 60).toFixed(1)}`);
    s += `<path d="${dt1}L${F.X(3)} ${top}Z" fill="${C.blue}" fill-opacity="0.35" stroke="${C.blue}"/>` + tx(F.x0, 16, "|Ψ(x)|²", "start", "ts", `fill="${C.blue}"`);
    const rx = F.x0 + F.w + 10; let dr = `M${rx} ${F.Y(-3)}`; xs.forEach((p, i) => dr += `L${(rx + Math.min(gp[i], mxg) / mxg * 60).toFixed(1)} ${F.Y(p).toFixed(1)}`);
    s += `<path d="${dr}L${rx} ${F.Y(3)}Z" fill="${C.coral}" fill-opacity="0.35" stroke="${C.coral}"/>` + tx(rx + 4, F.y0 - 6, "|Φ(p)|²", "start", "ts", `fill="${C.coral}"`);
    // product vs time
    const Tm = QM.frame(500, 110, 140, 130, { xmin: 0, xmax: 6.3, ymin: 0, ymax: 2.5, xt: [0, 3, 6], yt: [0, 0.5, 1, 2], xl: "ωt", yl: "" });
    const ts = Array.from({ length: 200 }, (_, i) => i * 6.3 / 199), prods = ts.map(q => { const t0 = t; t = q; const c = cov(); t = t0; return Math.sqrt(c[0] * c[2]); });
    s += rc(Tm.x0, Tm.Y(0.5), Tm.w, Tm.Y(0) - Tm.Y(0.5), "var(--gray-bg)") + Tm.s + ln(Tm.x0, Tm.Y(0.5), Tm.x0 + Tm.w, Tm.Y(0.5), "var(--t)", 1, "3 3") + QM.path(Tm, ts, prods.map(v => Math.min(v, 2.5)), C.purple, 2) + ci(Tm.X(t), Tm.Y(Math.min(2.5, sx * sp)), 4, C.purple) + tx(Tm.x0 + Tm.w / 2, Tm.y0 - 8, "σₓσₚ in time", "middle", "ts") + tx(Tm.x0 + Tm.w - 4, Tm.Y(0.5) + 14, "forbidden", "end", "ts");
    s += tx(500, 300, "dashed circle: coherent state", "start", "ts") + tx(500, 318, "amber box: σₓ by σₚ", "start", "ts", `fill="${C.amber}"`);
    fig.innerHTML = svg(420, s);
    $("ro").innerHTML = ro([["σₓ", fmt(sx, 3)], ["σₚ", fmt(sp, 3)], ["σₓσₚ (≥ 0.5)", fmt(sx * sp, 3)], ["cov(x, p)", fmt(Vxp, 3)], ["σₓ²σₚ² − cov² (stays 0.25)", fmt(Vxx * Vpp - Vxp * Vxp, 4)]]);
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; t = 0; draw(); });
  $("s0").oninput = draw; $("tt").oninput = () => { t = +$("tt").value; draw(); };
  QM.player(ctl, () => { t += 0.02; if (t > 6.3) t = 0; draw(); }, () => { t = 0; draw(); });
  draw();
}},

/* ---------------- 3.4.3 energy-time ---------------- */
{ s: "7. Energy and time", t: "3.4.3 The energy-time uncertainty principle",
intu: String.raw`Time is not an observable, there is no time operator, so \(\Delta t\,\Delta E \ge \hbar/2\) means something different. Griffiths defines \(\Delta t\) as the time it takes an expectation value to change by one standard deviation. <b>Beat</b>: the 10 nm well in an equal mix of \(\psi_1\) and \(\psi_2\). The purple curve is \(\langle x\rangle\) with its \(\pm\sigma_x\) band. \(\Delta t = \sigma_x/|d\langle x\rangle/dt|\), and the lower plot shows \(\sigma_H\,\Delta t\) never dips below \(\hbar/2\). A larger energy spread means faster change. <b>Decay</b>: the version you meet in the lab. An excited quantum dot emits a light pulse whose envelope dies off with lifetime \(\tau\) (left). The spectrum of that pulse is a Lorentzian with width \(\Gamma = \hbar/\tau\) (right). Shorten the lifetime and the line broadens. Short in time means wide in energy.`,
eq: String.raw`\[ \frac{d}{dt}\langle Q\rangle = \frac{i}{\hbar}\langle[\hat H, \hat Q]\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle \]<div class="eqref">Griffiths Eq. [3.148]</div>\[ \sigma_H\sigma_Q \ge \frac{\hbar}{2}\left|\frac{d\langle Q\rangle}{dt}\right|, \qquad \Delta t \equiv \frac{\sigma_Q}{|d\langle Q\rangle/dt|}, \qquad \Delta t\,\Delta E \ge \frac{\hbar}{2} \]<div class="eqref">Griffiths Eqs. [3.149], [3.150] and [3.147]</div>\[ \Gamma = \frac{\hbar}{\tau} \quad \text{(lifetime and linewidth)} \]`,
sym: [[String.raw`\(\Delta E = \sigma_H\)`, "spread of energy in the state"], [String.raw`\(\Delta t\)`, "time for ⟨Q⟩ to change by one σ(Q), not a spread of time measurements"], [String.raw`\(\tau\)`, "lifetime of an excited state"], [String.raw`\(\Gamma\)`, "full width at half maximum of the emission line, in energy"]],
how: [String.raw`Differentiate \(\langle Q\rangle = \langle\Psi|\hat Q\Psi\rangle\) and use the Schrödinger equation. Because \(\hat H\) is Hermitian, only the commutator survives: Eq. 3.148. An operator that commutes with \(\hat H\) is conserved.`, String.raw`Put \(\hat A = \hat H\) and \(\hat B = \hat Q\) into the general uncertainty principle of card 6. The commutator is \(-i\hbar\,d\langle Q\rangle/dt\), which gives Eq. 3.149.`, String.raw`Define \(\Delta t\) as \(\sigma_Q\) divided by the speed of \(\langle Q\rangle\), and \(\Delta t\,\sigma_H \ge \hbar/2\) follows.`, String.raw`A stationary state has \(\sigma_H = 0\), so \(\Delta t = \infty\): nothing ever changes, as Chapter 2 found. Fast change needs a spread of energies.`],
say: String.raw`The energy-time uncertainty principle ΔtΔE ≥ ħ/2 says that a state can change appreciably in a time Δt only if its energy is uncertain by at least ħ/2Δt, and for a decaying state it ties the lifetime to the natural linewidth, Γ = ħ/τ.`,
note: String.raw`For your quantum dots: a typical GaAs dot lifetime of about 0.3 to 1 ns gives a natural linewidth of about 0.7 to 2.2 μeV. Purcell enhancement in a photonic crystal waveguide shortens \(\tau\) and broadens the line. Lifetime-limited linewidth is the condition for indistinguishable photons, which you will meet as Hong-Ou-Mandel interference in Gerry and Knight Chapter 6.`,
num: String.raw`\(\hbar = 658.2\) μeV ps. \(\tau = 1\) ns: \(\Gamma = 0.66\) μeV, a frequency width \(1/2\pi\tau = 159\) MHz. \(\tau = 100\) ps: 6.6 μeV. \(\tau = 10\) ps: 66 μeV. The 795 nm photon itself has energy 1.56 eV, so even the 10 ps line is only 4 parts in 100 000 wide. Beat example: \(\sigma_H = (E_2 - E_1)/2 = 5.64\) meV.`,
r(fig, ctl) {
  let mode = "beat", t = 0;
  ctl.innerHTML = btns([["beat", "Beat (Griffiths' Δt)"], ["decay", "Decay and linewidth"]], "md") + `<div id="opts"></div><div class="readout" id="ro"></div>`;
  const G = QM.grid(0, A, 301);
  const stats = tt => {   // equal mix of psi1 and psi2
    let n = 0, x1 = 0, x2 = 0; const c = 1 / Math.SQRT2, dE = En(2) - En(1);
    for (let j = 0; j < G.N; j++) { const p1 = psiW(1, G.x[j]), p2 = psiW(2, G.x[j]); const P = c * c * (p1 * p1 + p2 * p2 + 2 * p1 * p2 * Math.cos(dE * tt)); n += P; x1 += G.x[j] * P; x2 += G.x[j] * G.x[j] * P; }
    x1 /= n; x2 /= n; return { x: x1, sx: Math.sqrt(x2 - x1 * x1) };
  };
  const build = () => {
    pick(ctl, "md", mode);
    $("opts").innerHTML = mode === "beat" ? "" : sl("lt", "Lifetime τ (log scale)", 1, 3.5, 0.01, 3);
    if (mode === "decay") $("lt").oninput = draw;
    draw();
  };
  const draw = () => {
    let s = "";
    if (mode === "beat") {
      const dE = En(2) - En(1), T = 2 * Math.PI / dE, sH = dE / 2, ts = Array.from({ length: 241 }, (_, i) => i * T / 240);
      const st = ts.map(stats), xm = st.map(q => q.x), up = st.map(q => q.x + q.sx), dn = st.map(q => q.x - q.sx);
      const vel = ts.map(q => (stats(q + 1e-3).x - stats(q - 1e-3).x) / 2e-3), prod = st.map((q, i) => sH * q.sx / Math.abs(vel[i]));
      const F = QM.frame(70, 26, 540, 170, { xmin: 0, xmax: T, ymin: 0, ymax: 10, xt: [0, T / 2, T], xf: v => fmt(v * QM.T0, 0), yt: [0, 5, 10], xl: "time (fs)", yl: "x (nm)" });
      let band = `M${F.X(0)} ${F.Y(up[0])}`; ts.forEach((q, i) => band += `L${F.X(q).toFixed(1)} ${F.Y(up[i]).toFixed(1)}`); for (let i = ts.length - 1; i >= 0; i--) band += `L${F.X(ts[i]).toFixed(1)} ${F.Y(dn[i]).toFixed(1)}`;
      s += F.s + `<path d="${band}Z" fill="${C.purple}" fill-opacity="0.15"/>` + QM.path(F, ts, xm, C.purple, 3);
      const tc = t % T, sc = stats(tc), vc = (stats(tc + 1e-3).x - stats(tc - 1e-3).x) / 2e-3;
      s += ln(F.X(tc), F.y0, F.X(tc), F.y0 + F.h, "var(--p)", 1, "3 3") + ci(F.X(tc), F.Y(sc.x), 5, C.purple) + tx(F.x0 + 8, F.y0 + 16, "⟨x⟩ (line) and ⟨x⟩ ± σₓ (band)", "start", "ts", `fill="${C.purple}"`);
      const P = QM.frame(70, 246, 540, 130, { xmin: 0, xmax: T, ymin: 0, ymax: 3, xt: [0, T / 2, T], xf: v => fmt(v * QM.T0, 0), yt: [0, 0.5, 1, 2, 3], xl: "time (fs)", yl: "σ_H Δt / ħ" });
      s += rc(P.x0, P.Y(0.5), P.w, P.Y(0) - P.Y(0.5), "var(--gray-bg)") + P.s + ln(P.x0, P.Y(0.5), P.x0 + P.w, P.Y(0.5), "var(--t)", 1.5, "4 3") + QM.path(P, ts, prod.map(v => v <= 3 ? v : NaN), C.teal, 2.5) + ci(P.X(tc), P.Y(Math.min(3, sH * sc.sx / Math.abs(vc))), 5, C.teal) + tx(P.x0 + P.w - 6, P.Y(0.5) + 16, "forbidden: below ħ/2", "end", "ts");
      fig.innerHTML = svg(410, s);
      $("ro").innerHTML = ro([["σ_H = (E₂ − E₁)/2", fmt(sH * QM.E0, 2) + " meV"], ["period h/(E₂ − E₁)", fmt(T * QM.T0, 0) + " fs"], ["Δt now", Math.abs(vc) > 1e-9 ? fmt(sc.sx / Math.abs(vc) * QM.T0, 1) + " fs" : "infinite"], ["σ_H Δt now", fmt(sH * sc.sx / Math.abs(vc), 3) + " ħ (≥ 0.5)"]]);
    } else {
      const tau = Math.pow(10, +$("lt").value), G2 = 658.2 / tau;   // ps, μeV
      $("ltv").textContent = tau >= 1000 ? fmt(tau / 1000, 2) + " ns" : fmt(tau, 0) + " ps";
      const F = QM.frame(70, 30, 250, 230, { xmin: 0, xmax: 3000, ymin: 0, ymax: 1.05, xt: [0, 1000, 2000, 3000], xf: v => fmt(v / 1000, 0), yt: [0, 0.5, 1], xl: "time (ns)", yl: "intensity" });
      const ts = Array.from({ length: 400 }, (_, i) => i * 3000 / 399);
      s += F.s + QM.area(F, ts, ts.map(q => Math.exp(-q / tau)), C.amber, 0.3) + QM.path(F, ts, ts.map(q => Math.exp(-q / tau)), C.amber, 2.5);
      s += tx(F.x0 + F.w - 6, F.y0 + 16, "emitted intensity e^(−t/τ)", "end", "ts", `fill="${C.amber}"`);
      const W = QM.frame(390, 30, 240, 230, { xmin: -40, xmax: 40, ymin: 0, ymax: 1.05, xt: [-40, -20, 0, 20, 40], yt: [0, 0.5, 1], xl: "photon energy − line centre (μeV)", yl: "" });
      const es = Array.from({ length: 801 }, (_, i) => -40 + 80 * i / 800), L = es.map(e => 1 / (1 + (2 * e / G2) ** 2));
      s += W.s + QM.area(W, es, L, C.purple, 0.3) + QM.path(W, es, L, C.purple, 2.5);
      if (G2 < 80) s += `<line x1="${W.X(-G2 / 2)}" y1="${W.Y(0.5)}" x2="${W.X(G2 / 2)}" y2="${W.Y(0.5)}" stroke="var(--t)" stroke-width="1.5"/>` + tx(W.X(0), W.Y(0.5) - 6, "Γ", "middle", "th");
      s += tx(W.x0 + W.w - 4, W.y0 + 16, "spectrum (Lorentzian)", "end", "ts", `fill="${C.purple}"`);
      fig.innerHTML = svg(310, s);
      $("ro").innerHTML = ro([["lifetime τ", tau >= 1000 ? fmt(tau / 1000, 2) + " ns" : fmt(tau, 1) + " ps"], ["linewidth Γ = ħ/τ", fmt(G2, 2) + " μeV"], ["frequency width 1/2πτ", fmt(1e3 / (2 * Math.PI * tau), 2) + " GHz"], ["τ Γ", "ħ = 658.2 μeV ps"]]);
    }
  };
  ctl.querySelectorAll("button[data-md]").forEach(b => b.onclick = () => { mode = b.dataset.md; build(); });
  QM.player(ctl, () => { if (mode === "beat") { t += 0.4; draw(); } }, () => { t = 0; draw(); });
  build();
}}
],
summary: String.raw`States are vectors |Ψ⟩ in a Hilbert space, observables are Hermitian operators, and Dirac notation makes the bookkeeping automatic. Components in an orthonormal basis are inner products, cₙ = ⟨eₙ|Ψ⟩. Hermitian operators have real eigenvalues and orthogonal eigenvectors that form a basis. Functions are vectors with integrals as inner products, and x and p have delta function and plane wave eigenfunctions. A measurement of Q gives an eigenvalue λₙ with probability |⟨eₙ|Ψ⟩|² and collapses the state onto eₙ. Operators need not commute, [x, p] = iħ, and for any pair σ(A)σ(B) ≥ |⟨[A, B]⟩|/2, with equality for x and p only for an uncorrelated Gaussian. Expectation values change at the rate (i/ħ)⟨[H, Q]⟩, which gives ΔtΔE ≥ ħ/2 and, for decaying states, Γ = ħ/τ.`,
sheet: [
[String.raw`\[ |\Psi\rangle = \sum c_n|e_n\rangle, \quad c_n = \langle e_n|\Psi\rangle, \quad \langle e_m|e_n\rangle = \delta_{mn} \]`, "Components and orthonormal bases [3.120], [3.121]"],
[String.raw`\[ |\langle\alpha|\beta\rangle|^2 \le \langle\alpha|\alpha\rangle\langle\beta|\beta\rangle \]`, "Schwarz inequality [3.27]"],
[String.raw`\[ \hat Q = \hat Q^\dagger \Rightarrow \lambda \in \mathbb R, \ \langle e_m|e_n\rangle = 0 \ (\lambda_m \ne \lambda_n) \]`, "Hermitian operators (Section 3.1.5)"],
[String.raw`\[ [\hat x, \hat p] = i\hbar \]`, "Canonical commutator [3.140]"],
[String.raw`\[ \langle f|g\rangle = \int f^*g\,dx, \quad e_p = \tfrac{1}{\sqrt{2\pi\hbar}}e^{ipx/\hbar}, \quad e_{x'} = \delta(x - x') \]`, "Function space, momentum and position eigenfunctions [3.128], [3.131]"],
[String.raw`\[ P(\lambda_n) = |\langle e_n|\Psi\rangle|^2, \quad \langle Q\rangle = \langle\Psi|\hat Q\Psi\rangle = \sum\lambda_n|c_n|^2 \]`, "Generalized statistical interpretation [3.122], [3.134]"],
[String.raw`\[ \Phi(p,t) = \frac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\Psi(x,t)\,dx \]`, "Momentum space wave function [3.132]"],
[String.raw`\[ \sigma_A^2\sigma_B^2 \ge \left(\tfrac{1}{2i}\langle[\hat A,\hat B]\rangle\right)^2, \quad \sigma_x\sigma_p \ge \tfrac{\hbar}{2} \]`, "Generalized uncertainty principle [3.139], [3.141]"],
[String.raw`\[ \frac{d\langle Q\rangle}{dt} = \frac{i}{\hbar}\langle[\hat H,\hat Q]\rangle + \langle\partial_t\hat Q\rangle, \quad \Delta t\,\Delta E \ge \tfrac{\hbar}{2} \]`, "Time evolution of expectation values and energy-time uncertainty [3.148], [3.147]"],
[String.raw`\[ \Gamma = \hbar/\tau \]`, "Lifetime and natural linewidth"]],
consts: String.raw`\(\hbar = 1.0546\times10^{-34}\) J s \(= 658.2\) μeV ps, \(\hbar^2/(m_e\,\text{nm}^2) = 76.20\) meV`,
sources: ["D. J. Griffiths, Introduction to Quantum Mechanics (Prentice Hall, 1995), Chapter 3, Sections 3.1 to 3.4, Eqs. 3.113 to 3.150 and Problems 3.35 to 3.42", "C. C. Gerry and P. L. Knight, Introductory Quantum Optics (Cambridge, 2005), Chapters 3 and 7, for phase space pictures of coherent and squeezed states (card 6)", "P. R. Halmos, Finite Dimensional Vector Spaces, 2nd ed. (Van Nostrand, 1958), the linear algebra reference Griffiths recommends", "E. M. Purcell, Phys. Rev. 69, 681 (1946), spontaneous emission rates are not fixed but depend on the environment (card 7 note)"]
});
})();
