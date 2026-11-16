addLesson("thesis", "lec", {
level: "Gradient", num: "Lesson 10",
id: "thesis-lec-l10", title: "The gradient we want", short: "10. The gradient we want",
big: String.raw`To improve the PBS, the optimizer needs to know, for every one of the 48,400 pixels, whether adding a little GaAs there raises or lowers the figure of merit, and how strongly. That list of slopes is the gradient \(\partial J/\partial \rho_i\). The obvious way to get it, nudging each pixel and rerunning the simulation, would take about 100,000 FDTD runs per step. The adjoint method gets all 48,400 slopes from one extra run per input.`,
bridge: "Thesis Ch. 3 Sec. 3.2: finite differences need 2N simulations per step, the adjoint method two, whatever N.",
cards: [
{s: "1. One slope per pixel", t: "What a gradient entry means",
intu: String.raw`A 1D device of 60 pixels between air and GaAs. Pick a pixel and look at the curve: the figure of merit (transmission) as that one pixel goes from air to GaAs, all others fixed. The gradient entry is the slope of this curve at the current value (the orange line). Positive: add GaAs there. Negative: remove it. Near zero: that pixel hardly matters. The orange slope here comes from the adjoint method, from two solves, and it sits on the curve that took 21 solves to draw.`,
eq: String.raw`\[ \frac{\partial J}{\partial \rho_i} \gt 0 \;\Rightarrow\; \text{add GaAs at pixel } i, \qquad \lt 0 \;\Rightarrow\; \text{remove it} \]`,
sym: [[String.raw`\(\rho_i\)`, "density of pixel i"], [String.raw`\(\partial J/\partial \rho_i\)`, "slope of the figure of merit with respect to that pixel"]],
how: ["Fix every pixel except one.", "The figure of merit becomes a curve of that one pixel.", "Its slope at the current value is one entry of the gradient.", "The gradient is that slope for every pixel at once."],
say: "Each gradient entry is the slope of the figure of merit with respect to one pixel: its sign says whether to add or remove material there and its size says how much it matters.",
num: "1D toy: 60 pixels of 10 nm, wavelength 800 nm, transmission to the right as the figure of merit.",
r(fig, ctl) {
  ctl.innerHTML = sl("px", "Pixel", 1, 60, 1, 22) + `<div class="readout" id="ro"></div>`;
  const dev = new C3.Dev1D({ Nd: 60, pad: 30 }), r = C3.rng(7), rho = Float64Array.from(C3.filter1D(Float64Array.from({ length: 60 }, () => r()), 2));
  const base = dev.T(rho, 800, true);
  const u = () => {
    const i = +$("px").value - 1; $("pxv").textContent = i + 1;
    const vs = range(0, 1, 21), Fs = vs.map(v => { const a = Float64Array.from(rho); a[i] = v; return dev.T(a, 800).T; });
    const slope = base.grad[i] * (dev.eMax - dev.eMin), x0 = rho[i], F0 = base.T;
    let s = C3.stripe(60, 10, 560, 16, rho) + `<rect x="${60 + i / 60 * 560}" y="8" width="${560 / 60}" height="20" fill="none" stroke="var(--coral)" stroke-width="2.5"/>`;
    const lo = Math.min(...Fs) - 0.05, hi = Math.max(...Fs) + 0.05;
    s += C3.frame(90, 50, 520, 160, 0, 1, lo, hi, [0, 0.5, 1], [], "density of this pixel (0 air, 1 GaAs)", "J") + plot(90, 50, 520, 160, vs, Fs, 0, 1, lo, hi, "var(--blue)", 2.2);
    s += plot(90, 50, 520, 160, [x0 - 0.15, x0 + 0.15], [F0 - 0.15 * slope, F0 + 0.15 * slope], 0, 1, lo, hi, "var(--coral)", 3);
    const X = C3.X(90, 520, 0, 1), Y = C3.Y(50, 160, lo, hi); s += `<circle cx="${X(x0)}" cy="${Y(F0)}" r="5" fill="var(--coral)"/>`;
    fig.innerHTML = svg(262, s);
    $("ro").innerHTML = `<div><span>slope ∂J/∂ρ (adjoint)</span><b>${slope.toFixed(3)}</b></div><div><span>meaning</span><b>${Math.abs(slope) < 0.02 ? "hardly matters" : slope > 0 ? "add GaAs here" : "remove GaAs here"}</b></div>`;
  };
  $("px").oninput = u; u();
}},
{s: "2. Why not nudge each pixel", t: "Finite differences would take about 100,000 runs per step",
intu: String.raw`The simplest way to get a slope is to nudge one pixel up and down and rerun: two simulations per pixel. Move the slider for the number of parameters. For the PBS, with 48,400 pixels, that is 96,800 FDTD runs per input for one optimization step. The adjoint method needs one forward and one adjoint run per input, however many pixels there are. The next two lessons show how.`,
eq: String.raw`\[ \text{finite differences: } \frac{\partial J}{\partial \rho_i} \approx \frac{J(\rho_i + h) - J(\rho_i - h)}{2h} \;\Rightarrow\; 2N \text{ runs} \qquad \text{adjoint: } 2 \text{ runs} \]`,
sym: [[String.raw`\(N\)`, "number of parameters, 48,400 pixels"], [String.raw`\(h\)`, "small nudge"]],
how: ["Finite differences: two runs per parameter.", "Adjoint: one forward run (needed anyway) and one adjoint run.", "The adjoint cost does not grow with the number of parameters."],
say: "Nudging each of the 48,400 pixels would need 96,800 simulations per step and input, while the adjoint method needs two.",
num: "PBS: 2 inputs, so 193,600 runs per step by finite differences against 4 with the adjoint method.",
r(fig, ctl) {
  ctl.innerHTML = sl("lp", "Number of parameters (log₁₀)", 0, 5, 0.01, Math.log10(48400)) + `<div class="readout" id="ro"></div>`;
  const u = () => {
    let N = Math.round(Math.pow(10, +$("lp").value)); if (Math.abs(N - 48400) / 48400 < 0.03) N = 48400; $("lpv").textContent = N.toLocaleString("en-US");
    const W = 460, f = Math.log10(2 * N + 1) / Math.log10(2e5 + 1) * W, a = Math.log10(3) / Math.log10(2e5 + 1) * W;
    let s = `<text class="th" x="20" y="44">finite differences</text><rect x="180" y="26" width="${f}" height="28" rx="4" fill="var(--coral)"/><text class="t" x="${188 + f}" y="46">${(2 * N).toLocaleString("en-US")}</text>`;
    s += `<text class="th" x="20" y="104">adjoint</text><rect x="180" y="86" width="${a}" height="28" rx="4" fill="var(--teal)"/><text class="t" x="${188 + a}" y="106">2</text>`;
    s += `<text class="ts" x="20" y="150">FDTD runs per input and optimization step (log scale)</text>`;
    fig.innerHTML = svg(165, s);
    $("ro").innerHTML = `<div><span>finite differences</span><b>${(2 * N).toLocaleString("en-US")} runs</b></div><div><span>adjoint</span><b>2 runs</b></div>`;
  };
  $("lp").oninput = u; u();
}}
],
summary: String.raw`The gradient lists, for every pixel, the slope of the figure of merit: its sign says add or remove GaAs, its size says how much the pixel matters. Nudging each of the 48,400 pixels would take 96,800 runs per input and step. The adjoint method takes one forward and one adjoint run per input, whatever the number of pixels.`,
sheet: [
[String.raw`\[ \frac{\partial J}{\partial \rho_i} \approx \frac{J(\rho_i + h) - J(\rho_i - h)}{2h} \]`, "Finite differences: 2 runs per parameter"],
[String.raw`\[ 2N = 96{,}800 \;\text{ vs }\; 2 \]`, "PBS runs per input and step"]],
consts: "1D toy: 10 nm pixels, ε from 1 to 12.19, exact one-way boundaries.",
sources: ["Ch. 3 Sec. 3.2 of the thesis", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018), Sec. 2", "Christiansen and Sigmund, J. Opt. Soc. Am. B 38, 496 (2021)"]
});
