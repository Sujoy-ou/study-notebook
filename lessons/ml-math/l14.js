(function () {
/* ML shelf, Part 3, Lesson 14: Probability. Follows HW7 Part 1, the homework for AME 5970 Lecture 5 (random variables, PMF and PDF, CDF and survival, the four model families, likelihood, log-likelihood, the Gaussian noise model), with Andrew Ng's CS229 notes (probabilistic interpretation of least squares) as the spine. HW7's own worked examples are used where the homework gives them. Every other number is fresh, so no HW7 task is answered here. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
/* error function, Abramowitz and Stegun 7.1.26, absolute error below 1.5e-7 */
const erf = x => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
const npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
const lnpdf = (x, m, s) => -0.5 * ((x - m) / s) ** 2 - Math.log(s) - 0.5 * Math.log(2 * Math.PI);
const choose = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; };
const binom = (k, n, p) => choose(n, k) * p ** k * (1 - p) ** (n - k);
const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const pois = (k, mu) => Math.exp(-mu + k * Math.log(mu) - Math.log(fact(k)));
/* seeded generator so every visit shows the same draws */
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const gauss = r => () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
/* the lecture's regression data, reused from Lessons 13 and 15 */
const DX = [1, 2, 3], DY = [2, 3, 5];
/* integer tick labels under bar charts, so labels sit under the bars */
const ilab = (a, ks, y) => ks.map(k => tx(a.X(k), y, k, "middle")).join("");
/* fresh readings for the Gaussian MLE card */
const RD = [4.8, 5.3, 5.1, 4.6, 5.4, 5.0];

addLesson("ml", "math", {
level: "Foundations", num: "Lesson 14",
id: "ml-math-l14", title: "Probability", short: "14. Probability",
big: String.raw`Every loss in this course is a probability model in disguise. Squared error is what you get when you assume Gaussian noise and ask which parameters make the data most likely. Cross-entropy in Part 6 is the same question for Bernoulli and categorical labels. To read those losses, and to know when they are the wrong choice, you need a small amount of probability done carefully. A random variable turns an outcome into a number. A PMF gives probability to each discrete value, a PDF gives density whose area is probability. The CDF accumulates it. The mean and variance summarize it. The Gaussian, Bernoulli, binomial, Poisson and exponential cover almost every model the course uses. Conditional probability and Bayes rule tell you how a flag changes what you believe. Then the turn that matters for machine learning: likelihood holds the data fixed and scores the parameters, the log turns a fragile product into a safe sum, and maximizing a Gaussian likelihood is exactly minimizing squared error.`,
bridge: String.raw`The source is the HW7 Part 1 refresher, the homework that goes with the professor's Lecture 5 on probability and maximum likelihood, with Andrew Ng's CS229 notes (part I, section 3, probabilistic interpretation) for the last card. HW7's worked examples appear as given. Its graded tasks use different numbers here, so do them yourself. Lesson 15 uses the result of card 12, and Lesson 18 repeats it for absolute error and Huber loss.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. Random variables", t: "A random variable turns an outcome into a number",
intu: String.raw`HW7's opening example: inspect four manufactured components, each defective with probability 0.2, independently. Before the inspection the number of defects X is unknown. X is a random variable: a rule that assigns a number to each possible outcome. The list of results you record is a set of realizations of X, not X itself. Press the buttons to inspect batches. Each batch draws four components, and the histogram of counts slowly approaches the PMF bars. That convergence is what the PMF means: the long-run fraction of batches with each count.`,
eq: String.raw`\[ X = \text{defects among 4}, \qquad P(X = k) = \binom{4}{k} (0.2)^k (0.8)^{4-k}, \qquad k = 0, 1, 2, 3, 4 \]`,
sym: [["outcome", "one inspected batch, for example good, bad, good, good"], ["X", "the random variable, here the count of bad components"], ["realization", "the number one batch produced, here 1"], ["PMF", "probability mass function, P(X = k) for each k"], ["binomial(n, p)", "count of successes in n independent trials with the same p"]],
how: ["Name the experiment: four components, each bad with probability 0.2, independent.", "Name the variable: X counts the bad ones, so X takes values 0 to 4.", "Each specific outcome with k bad parts has probability 0.2 to the power k times 0.8 to the power 4 − k.", "There are C(4, k) such outcomes, so multiply by the binomial coefficient.", "Check that the five probabilities add to 1. A PMF that does not sum to 1 is a bug."],
say: String.raw`A random variable assigns a number to each outcome of an experiment, and its PMF gives the probability of each value, which is the long-run fraction of repetitions that produce it.`,
num: String.raw`P(X = 0) = <b>0.4096</b>, P(X = 1) = <b>0.4096</b>, P(X = 2) = 0.1536, P(X = 3) = 0.0256, P(X = 4) = 0.0016. Sum = <b>1</b>.`,
r(fig, ctl) {
  const r = rng(5970); let counts = [0, 0, 0, 0, 0], n = 0, last = null;
  ctl.innerHTML = `<div class="row"><button id="b1" class="on">Inspect 1 batch</button><button id="b100">Inspect 100 batches</button><button id="b0">Reset</button></div><div id="rv"></div>`;
  const draw1 = () => { const b = [0, 1, 2, 3].map(() => r() < 0.2); counts[b.filter(Boolean).length]++; n++; return b; };
  const u = () => {
    const a = ML.axes(70, 30, 380, 220, { xmin: -0.5, xmax: 4.5, ymin: 0, ymax: 0.6, nx: 5, ny: 6, fx: () => "", fy: v => v.toFixed(1), xl: "k = number of defects", yl: "probability", grid: false });
    let s = a.s + ilab(a, [0, 1, 2, 3, 4], 266);
    for (let k = 0; k <= 4; k++) {
      const p = binom(k, 4, 0.2), q = n ? counts[k] / n : 0, w = 26;
      s += `<rect x="${a.X(k) - w}" y="${a.Y(p)}" width="${w}" height="${a.Y(0) - a.Y(p)}" fill="${C.blue}" opacity="0.75"/><rect x="${a.X(k) + 2}" y="${a.Y(q)}" width="${w}" height="${a.Y(0) - a.Y(q)}" fill="${C.coral}" opacity="0.8"/>`;
      s += tx(a.X(k) - w / 2, a.Y(p) - 5, f(p, 4), "middle");
    }
    s += tx(480, 40, "last batch", null, "th");
    if (last) last.forEach((bad, i) => { s += `<rect x="${480 + i * 40}" y="52" width="32" height="32" rx="5" fill="${bad ? C.coral : "var(--sunk)"}" stroke="var(--line)"/>` + tx(496 + i * 40, 73, bad ? "bad" : "ok", "middle"); });
    s += tx(480, 106, last ? `X = ${last.filter(Boolean).length}` : "press a button", null, "t");
    s += tx(480, 140, `batches inspected: ${n}`, null, "t") + tx(480, 170, "blue: PMF from the formula", null) + tx(480, 188, "coral: observed fraction", null);
    s += tx(480, 222, n ? `observed P(X = 0) = ${f(counts[0] / n, 3)}` : "", null) + tx(480, 240, n ? `observed P(X ≥ 1) = ${f(1 - counts[0] / n, 3)}` : "", null);
    fig.innerHTML = svg(290, s) + ML.code(["from scipy.stats import binom", "inspection = binom(n=4, p=0.2)", "inspection.pmf([0, 1, 2, 3, 4])   # 0.4096 0.4096 0.1536 0.0256 0.0016", "inspection.rvs(size=5, random_state=0)   # five realizations"], -1);
    $("rv").innerHTML = ML.readout([["exact P(X ≥ 1)", "1 − 0.8⁴ = 0.5904"], ["observed", n ? f(1 - counts[0] / n, 4) : "none yet"]]);
  };
  $("b1").onclick = () => { last = draw1(); u(); };
  $("b100").onclick = () => { for (let i = 0; i < 100; i++) last = draw1(); u(); };
  $("b0").onclick = () => { counts = [0, 0, 0, 0, 0]; n = 0; last = null; u(); };
  u();
}},

{s: "2. Mass or density", t: "Discrete values carry probability, continuous values carry density",
intu: String.raw`HW7's sensor reads values with mean 10 and standard deviation 0.2. A continuous reading has a probability density function, and probability lives in areas under it, never in its height. The density at the mean is 1.995 per reading unit, larger than 1, and that is fine because only the total area must be 1. The probability of a reading between 9.9 and 10.1 is the shaded area, 0.3829. Shrink the interval and the area shrinks toward zero: the probability of any exact value is zero. A real instrument rounds, so a recorded value stands for a small interval. Narrow σ and watch the peak climb above 1 while the area stays 1.`,
eq: String.raw`\[ P(a \le X \le b) = \int_a^b f(x)\,dx, \qquad f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right), \qquad P(X = x) = 0 \]`,
sym: [["PMF", "discrete: P(X = k) is a probability between 0 and 1"], ["PDF", "continuous: f(x) is a density, probability per unit of x"], ["area", "the only thing that is a probability for a continuous variable"], ["units", "density has units of 1 over the measured quantity"], [String.raw`\(f(\mu) = 1/(\sigma\sqrt{2\pi})\)`, "the peak height, above 1 when σ is below 0.399"]],
how: ["Ask whether the variable is counted or measured. Counted means PMF, measured means PDF.", "For a PDF, a probability needs an interval. Integrate the density over it.", "With SciPy, an interval probability is <code>cdf(b) − cdf(a)</code>, never <code>pdf(x)</code>.", "Shrinking the interval to a point makes the probability zero, whatever the height.", "A peak above 1 is allowed. An area above 1 is a bug."],
say: String.raw`For a continuous variable the density is not a probability, probability is the area under the density over an interval, and the density can exceed one as long as its total area is one.`,
num: String.raw`σ = 0.2: f(10) = 1/(0.2√(2π)) = <b>1.9947</b> per unit. P(9.9 ≤ X ≤ 10.1) = Φ(0.5) − Φ(−0.5) = 0.6915 − 0.3085 = <b>0.3829</b>. With half-width 0.01 the area is only <b>0.0399</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("sg", "σ", 0.05, 1, 0.01, 0.2) + sl("hw", "half-width", 0.005, 0.6, 0.005, 0.1) + `<div id="md"></div>`;
  const u = () => {
    const sg = +$("sg").value, hw = +$("hw").value; $("sgv").textContent = f(sg, 2); $("hwv").textContent = f(hw, 3);
    const peak = npdf(10, 10, sg), ymax = Math.max(2.2, Math.ceil(peak * 1.15));
    const a = ML.axes(60, 20, 400, 240, { xmin: 8.5, xmax: 11.5, ymin: 0, ymax: ymax, nx: 6, ny: 4, fx: v => v.toFixed(1), fy: v => v.toFixed(1), xl: "sensor reading", yl: "density per unit" });
    let s = a.s;
    const xs = range(8.5, 11.5, 300), lo = 10 - hw, hi = 10 + hw;
    const shade = xs.filter(x => x >= lo && x <= hi);
    if (shade.length > 1) s += `<path d="M${a.X(shade[0])} ${a.Y(0)} ${shade.map(x => "L" + a.X(x).toFixed(1) + " " + a.Y(npdf(x, 10, sg)).toFixed(1)).join(" ")} L${a.X(shade[shade.length - 1])} ${a.Y(0)} Z" fill="${C.amber}" opacity="0.45"/>`;
    s += ML.path(xs.map(x => [a.X(x), a.Y(npdf(x, 10, sg))]), C.blue, 2);
    s += `<line x1="${a.X(8.5)}" y1="${a.Y(1)}" x2="${a.X(11.5)}" y2="${a.Y(1)}" stroke="${C.coral}" stroke-dasharray="5 4"/>` + tx(a.X(11.45), a.Y(1) - 5, "height 1", "end");
    const area = Phi(hw / sg) - Phi(-hw / sg);
    s += tx(490, 40, "N(10, σ²)", null, "th") + tx(490, 64, `peak height f(10) = ${f(peak, 4)}`, null, "t") + tx(490, 84, peak > 1 ? "above 1, still a valid density" : "below 1", null);
    s += tx(490, 118, `interval [${f(lo, 3)}, ${f(hi, 3)}]`, null, "th") + tx(490, 140, `area = ${f(area, 4)}`, null, "t") + tx(490, 160, "this area is the probability", null);
    s += tx(490, 196, "height × width estimate:", null) + tx(490, 214, `${f(peak, 3)} × ${f(2 * hw, 3)} = ${f(peak * 2 * hw, 4)}`, null, "t") + tx(490, 232, "good only for narrow intervals", null);
    fig.innerHTML = svg(300, s) + ML.code(["from scipy.stats import norm", `sensor = norm(loc=10.0, scale=${f(sg, 2)})`, "sensor.pdf(10.0)       # a density, not a probability", `sensor.cdf(${f(hi, 3)}) - sensor.cdf(${f(lo, 3)})   # ${f(area, 4)}, a probability`], 3);
    $("md").innerHTML = ML.readout([["total area", "1, for every σ"], ["P(X = 10 exactly)", "0"]]);
  };
  $("sg").oninput = u; $("hw").oninput = u; u();
}},

{s: "3. CDF and tails", t: "The CDF accumulates probability, the survival function is what is left",
intu: String.raw`The cumulative distribution function F(t) = P(X ≤ t) adds up probability from the left. The survival function S(t) = P(X > t) is the rest. For a count, the CDF is a staircase and the endpoint matters: P(X ≥ 1) is S(0), which is why HW7 says to use <code>.sf(k − 1)</code> for an upper tail. For a continuous variable the CDF is smooth and including an endpoint changes nothing. Switch between the inspection count and the sensor, move t, and read off F and S. The interval probability of card 2 is a difference of two CDF values.`,
eq: String.raw`\[ F(t) = P(X \le t), \qquad S(t) = 1 - F(t) = P(X \gt t), \qquad P(X \ge k) = S(k - 1) \ \text{for integers} \]`,
sym: [["F(t)", "CDF, nondecreasing from 0 to 1"], ["S(t)", "survival function, sf in SciPy"], [String.raw`\(P(X \ge k)\)`, "for a count, equals S(k − 1)"], ["staircase", "a discrete CDF jumps by P(X = k) at each k"], ["smooth", "a continuous CDF, whose slope is the PDF"]],
how: ["Decide whether the event includes its endpoint. For counts it matters.", "Rewrite the event as X ≤ t or X > t.", "Use cdf for the first, sf for the second. sf is more accurate far in the tail than 1 − cdf.", "For a count, at least k is more than k − 1, so use sf(k − 1).", "For an interval of a continuous variable, subtract two CDF values."],
say: String.raw`The CDF gives the probability of being at or below a value, the survival function gives the probability of being above it, and for a count the probability of at least k is the survival function at k minus one.`,
num: String.raw`Inspection: F(0) = 0.4096, so P(X ≥ 1) = S(0) = <b>0.5904</b> = 1 − 0.8⁴. F(1) = 0.8192, S(1) = <b>0.1808</b>. Sensor: F(10.1) − F(9.9) = 0.6915 − 0.3085 = <b>0.3829</b>.`,
r(fig, ctl) {
  let mode = 0;
  ctl.innerHTML = btns([[0, "inspection count, binomial(4, 0.2)"], [1, "sensor, N(10, 0.2²)"]], "k") + sl("tt", "t", 0, 1, 0.01, 0.5) + `<div id="cd"></div>`;
  const u = () => {
    pick(ctl, "k", mode);
    const fr = +$("tt").value;
    const lo = mode ? 9.3 : -0.5, hi = mode ? 10.7 : 4.5, t = lo + fr * (hi - lo);
    $("ttv").textContent = mode ? f(t, 2) : f(t, 2);
    const F = mode ? (x => Phi((x - 10) / 0.2)) : (x => { let s = 0; for (let k = 0; k <= 4; k++) if (k <= x + 1e-12) s += binom(k, 4, 0.2); return s; });
    const a = ML.axes(60, 20, 400, 230, { xmin: lo, xmax: hi, ymin: 0, ymax: 1, nx: mode ? 7 : 5, ny: 4, fx: v => mode ? v.toFixed(1) : "", fy: v => v.toFixed(2), xl: mode ? "reading" : "k", yl: "F(t)", grid: !!mode });
    let s = a.s + (mode ? "" : ilab(a, [0, 1, 2, 3, 4], 266));
    if (mode) s += ML.path(range(lo, hi, 200).map(x => [a.X(x), a.Y(F(x))]), C.blue, 2.2);
    else { let prev = 0; for (let k = -1; k <= 4; k++) { const v = k < 0 ? 0 : F(k), x1 = a.X(Math.max(lo, k)), x2 = a.X(Math.min(hi, k + 1)); s += `<line x1="${x1}" y1="${a.Y(v)}" x2="${x2}" y2="${a.Y(v)}" stroke="${C.blue}" stroke-width="2.4"/>`; if (k >= 0) s += `<circle cx="${a.X(k)}" cy="${a.Y(v)}" r="4" fill="${C.blue}"/><circle cx="${a.X(k)}" cy="${a.Y(prev)}" r="4" fill="var(--bg)" stroke="${C.blue}" stroke-width="1.5"/>`; prev = v; } }
    const Ft = F(t);
    s += `<line x1="${a.X(t)}" y1="${a.Y(0)}" x2="${a.X(t)}" y2="${a.Y(Ft)}" stroke="${C.coral}" stroke-dasharray="4 3"/><line x1="${a.X(lo)}" y1="${a.Y(Ft)}" x2="${a.X(t)}" y2="${a.Y(Ft)}" stroke="${C.coral}" stroke-dasharray="4 3"/>`;
    s += `<rect x="${a.X(hi) + 14}" y="${a.Y(1)}" width="16" height="${a.Y(Ft) - a.Y(1)}" fill="${C.amber}" opacity="0.7"/><rect x="${a.X(hi) + 14}" y="${a.Y(Ft)}" width="16" height="${a.Y(0) - a.Y(Ft)}" fill="${C.teal}" opacity="0.7"/>`;
    s += tx(512, 40, `t = ${f(t, 2)}`, null, "th") + tx(512, 66, `F(t) = ${f(Ft, 4)}`, null, "t") + tx(512, 86, `S(t) = ${f(1 - Ft, 4)}`, null, "t") + tx(512, 116, "teal bar: F, at or below t", null) + tx(512, 134, "amber bar: S, above t", null);
    if (!mode) s += tx(512, 170, "P(X ≥ 1) = S(0) = 0.5904", null, "t") + tx(512, 190, "P(X ≥ 2) = S(1) = 0.1808", null, "t") + tx(512, 216, "open circle: the value just left", null) + tx(512, 232, "of a jump, closed: at the jump", null);
    else s += tx(512, 170, "F(10.1) − F(9.9) = 0.3829", null, "t") + tx(512, 196, "slope of F = the PDF", null) + tx(512, 214, "endpoints do not matter", null);
    fig.innerHTML = svg(290, s) + ML.code(mode ? ["sensor = norm(loc=10.0, scale=0.2)", `sensor.cdf(${f(t, 2)}), sensor.sf(${f(t, 2)})   # ${f(Ft, 4)}, ${f(1 - Ft, 4)}`] : ["inspection = binom(n=4, p=0.2)", "inspection.sf(0)     # P(X >= 1) = 0.5904", "inspection.sf(1)     # P(X >= 2) = 0.1808, note the k - 1"], -1);
    $("cd").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { mode = +b.dataset.k; u(); }); $("tt").oninput = u; u();
}},

{s: "4. Mean and variance", t: "The mean is the balance point, the variance is the spread around it",
intu: String.raw`The expectation E[X] is the probability-weighted average of the values, the point where the PMF would balance on a fulcrum. The variance is the expected squared distance from that point, and its square root σ is in the units of X. For a Bernoulli variable, a single trial that is 1 with probability p, the mean is p and the variance p(1 − p), largest at p = 0.5. A binomial count is a sum of n independent Bernoulli trials, so its mean and variance are n times those. Move n and p and watch the fulcrum. Then press draw and watch the running average of simulated values settle on E[X], which is the law of large numbers.`,
eq: String.raw`\[ E[X] = \sum_k k\,P(X = k), \qquad \operatorname{Var}(X) = E\big[(X - E[X])^2\big] = E[X^2] - E[X]^2 \]`,
sym: [["E[X]", "the mean, the balance point of the PMF"], ["Var(X)", "expected squared distance from the mean, units squared"], [String.raw`\(\sigma = \sqrt{\operatorname{Var}}\)`, "standard deviation, same units as X"], ["Bernoulli(p)", "mean p, variance p(1 − p)"], ["binomial(n, p)", "mean np, variance np(1 − p), a sum of n Bernoulli trials"]],
how: ["Multiply each value by its probability and add: that is E[X].", "Square each distance from the mean, weight by probability, add: that is Var(X).", "Or compute E[X²] and subtract E[X]². Same answer, fewer steps.", "Independent sums add their variances, which gives np(1 − p) for the binomial.", "A sample mean of many draws approaches E[X]. Its spread shrinks like σ/√N."],
say: String.raw`The expectation is the probability-weighted average of the values, the variance is the expected squared deviation from it, and for a binomial count they are np and np times one minus p.`,
num: String.raw`Binomial(4, 0.2): E = 0·0.4096 + 1·0.4096 + 2·0.1536 + 3·0.0256 + 4·0.0016 = <b>0.8</b>, E[X²] = 1.28, Var = 1.28 − 0.64 = <b>0.64</b>, σ = <b>0.8</b>. Bernoulli(0.5) has the largest variance, <b>0.25</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("bn", "n", 1, 20, 1, 4) + sl("bp", "p", 0.02, 0.98, 0.02, 0.2) + `<div class="row"><button id="dr" class="on">Draw 50 values</button><button id="d0">Reset draws</button></div><div id="mv"></div>`;
  let r = rng(14), draws = [];
  const u = () => {
    const n = +$("bn").value, p = +$("bp").value; $("bnv").textContent = n; $("bpv").textContent = f(p, 2);
    const P = range(0, n, n + 1).map(k => binom(k, n, p)), E = n * p, V = n * p * (1 - p), sd = Math.sqrt(V);
    const ymax = Math.max(0.2, Math.ceil(Math.max(...P) * 10) / 10);
    const a = ML.axes(60, 20, 300, 200, { xmin: -0.5, xmax: n + 0.5, ymin: 0, ymax, nx: Math.min(n + 1, 10), ny: 4, fx: () => "", fy: v => v.toFixed(2), xl: "k", yl: "P(X = k)", grid: false });
    const stp = n <= 10 ? 1 : n <= 20 ? 2 : 5;
    let s = a.s + ilab(a, range(0, n, n + 1).filter(k => k % stp === 0), 236);
    const bw = Math.min(24, 260 / (n + 1));
    P.forEach((q, k) => s += `<rect x="${a.X(k) - bw / 2}" y="${a.Y(q)}" width="${bw}" height="${a.Y(0) - a.Y(q)}" fill="${C.blue}" opacity="0.8"/>`);
    s += `<path d="M${a.X(E)} ${a.Y(0) + 2} l-9 14 h18 z" fill="${C.coral}"/>` + tx(a.X(E), a.Y(0) + 46, "E[X]", "middle", "th");
    s += `<line x1="${a.X(E - sd)}" y1="${a.Y(ymax * 0.92)}" x2="${a.X(E + sd)}" y2="${a.Y(ymax * 0.92)}" stroke="${C.teal}" stroke-width="3"/>` + tx(a.X(E), a.Y(ymax * 0.92) - 6, "E ± σ", "middle");
    /* running average */
    const b = ML.axes(420, 20, 230, 200, { xmin: 0, xmax: Math.max(50, draws.length), ymin: 0, ymax: n, nx: 2, ny: 4, fx: v => Math.round(v), fy: v => v.toFixed(1), xl: "number of draws", yl: "running average", grid: false });
    s += b.s + `<line x1="${b.X(0)}" y1="${b.Y(E)}" x2="${b.X(Math.max(50, draws.length))}" y2="${b.Y(E)}" stroke="${C.coral}" stroke-dasharray="5 4"/>`;
    if (draws.length) { let c = 0; s += ML.path(draws.map((d, i) => { c += d; return [b.X(i + 1), b.Y(c / (i + 1))]; }), C.teal, 1.8); }
    fig.innerHTML = svg(270, s);
    const avg = draws.length ? draws.reduce((x, y) => x + y, 0) / draws.length : NaN;
    $("mv").innerHTML = ML.readout([["E[X] = np", f(E, 3)], ["Var = np(1 − p)", f(V, 3)], ["σ", f(sd, 3)], ["average of draws", draws.length ? `${f(avg, 3)} after ${draws.length}` : "none yet"]]);
  };
  const reset = () => { r = rng(14); draws = []; };
  $("dr").onclick = () => { const n = +$("bn").value, p = +$("bp").value; for (let i = 0; i < 50; i++) { let c = 0; for (let j = 0; j < n; j++) if (r() < p) c++; draws.push(c); } u(); };
  $("d0").onclick = () => { reset(); u(); };
  $("bn").oninput = () => { reset(); u(); }; $("bp").oninput = () => { reset(); u(); }; u();
}},

{s: "5. The Gaussian", t: "The Gaussian: two parameters, and the 68, 95, 99.7 rule",
intu: String.raw`The normal distribution N(μ, σ²) is fixed by its mean and standard deviation. Every normal variable becomes the standard normal Z after z = (x − μ)/σ, which is the standardization of Lesson 9 and Lesson 17. The fraction within k standard deviations of the mean does not depend on μ or σ: about 68 % within one, 95 % within 1.96, 99.7 % within three. Change μ and σ and watch the top axis move while the shaded fraction stays the same. Change k and the fraction changes. This is why a residual of three standard deviations deserves a second look.`,
eq: String.raw`\[ X \sim \mathcal{N}(\mu, \sigma^2), \qquad Z = \frac{X - \mu}{\sigma} \sim \mathcal{N}(0, 1), \qquad P(|Z| \lt k) = \operatorname{erf}\!\left(\frac{k}{\sqrt 2}\right) \]`,
sym: [[String.raw`\(\mu\)`, "mean, the center"], [String.raw`\(\sigma\)`, "standard deviation, the width, same units as X"], ["Z", "standard normal, mean 0 and standard deviation 1"], [String.raw`\(\Phi(z)\)`, "the standard normal CDF, norm.cdf in SciPy"], ["erf", "the error function, related by Φ(z) = (1 + erf(z/√2))/2"]],
how: ["Standardize: subtract the mean, divide by the standard deviation.", "Look up the standard normal probability. It is the same for every μ and σ.", "Within ±k: Φ(k) − Φ(−k). Below k: Φ(k).", "Remember three numbers: 68.3 %, 95.0 % at 1.96, 99.7 %.", "Undo: x = μ + σz turns a z cutoff back into a reading."],
say: String.raw`Any normal variable standardizes to the standard normal, so the probability of lying within k standard deviations of the mean is the same for every normal distribution.`,
num: String.raw`P(|Z| \(\lt\) 1) = <b>0.6827</b>, P(|Z| \(\lt\) 1.96) = <b>0.9500</b>, P(|Z| \(\lt\) 3) = <b>0.9973</b>. For the sensor N(10, 0.2²), ±1.96σ is the interval [<b>9.608, 10.392</b>].`,
r(fig, ctl) {
  ctl.innerHTML = sl("gm", "μ", -2, 12, 0.1, 10) + sl("gs", "σ", 0.1, 3, 0.05, 0.2) + sl("gk", "k", 0.25, 3.5, 0.05, 1.96) + `<div id="gg"></div>`;
  const u = () => {
    const mu = +$("gm").value, sd = +$("gs").value, k = +$("gk").value; $("gmv").textContent = f(mu, 1); $("gsv").textContent = f(sd, 2); $("gkv").textContent = f(k, 2);
    const a = ML.axes(60, 40, 420, 200, { xmin: -4, xmax: 4, ymin: 0, ymax: 0.45, nx: 8, ny: 3, fx: v => v, fy: v => v.toFixed(2), xl: "z = (x − μ)/σ", yl: "density of Z" });
    let s = a.s;
    const xs = range(-k, k, 120);
    s += `<path d="M${a.X(-k)} ${a.Y(0)} ${xs.map(z => "L" + a.X(z).toFixed(1) + " " + a.Y(npdf(z, 0, 1)).toFixed(1)).join(" ")} L${a.X(k)} ${a.Y(0)} Z" fill="${C.teal}" opacity="0.35"/>`;
    s += ML.path(range(-4, 4, 200).map(z => [a.X(z), a.Y(npdf(z, 0, 1))]), C.blue, 2);
    for (let z = -4; z <= 4; z++) s += tx(a.X(z), 30, f(mu + sd * z, sd < 0.5 ? 2 : 1), "middle");
    s += tx(a.X(0), 14, "x, the reading", "middle", "th");
    const P = Phi(k) - Phi(-k);
    s += tx(500, 70, `within ±${f(k, 2)}σ`, null, "th") + tx(500, 94, `P = ${f(P, 4)}`, null, "t") + tx(500, 114, `below +${f(k, 2)}σ: ${f(Phi(k), 4)}`, null, "t");
    s += tx(500, 150, "interval in x:", null) + tx(500, 168, `[${f(mu - k * sd, 3)}, ${f(mu + k * sd, 3)}]`, null, "t") + tx(500, 200, "change μ or σ: the top axis", null) + tx(500, 216, "moves, the shaded fraction", null) + tx(500, 232, "does not", null);
    fig.innerHTML = svg(290, s);
    $("gg").innerHTML = ML.readout([["k = 1", "0.6827"], ["k = 1.96", "0.9500"], ["k = 3", "0.9973"]]);
  };
  $("gm").oninput = u; $("gs").oninput = u; $("gk").oninput = u; u();
}},

{s: "6. Count or wait", t: "Poisson counts events in a window, exponential is the wait between them",
intu: String.raw`HW7's table adds two models for random events in time. If events arrive independently at a constant rate λ per hour, the count in a window of T hours is Poisson with mean λT, and the waiting time between events is exponential with mean 1/λ. The trap is units. HW7's own example: at 3 events per hour, a two-hour count has Poisson mean 6, while the wait has mean 1/3 hour. SciPy's Poisson takes the mean count <code>mu</code>, its exponential takes <code>scale</code> = 1/λ, never the rate. The timeline shows simulated events, the left panel the count distribution, the right panel the wait.`,
eq: String.raw`\[ N \sim \operatorname{Poisson}(\lambda T): \ P(N = k) = \frac{(\lambda T)^k e^{-\lambda T}}{k!}, \qquad W \sim \operatorname{Exp}(\lambda): \ P(W \gt t) = e^{-\lambda t} \]`,
sym: [[String.raw`\(\lambda\)`, "rate, events per unit time"], ["T", "length of the counting window"], [String.raw`\(\lambda T\)`, "expected count in the window, SciPy's mu"], [String.raw`\(1/\lambda\)`, "mean waiting time, SciPy's scale for expon"], ["support", "the Poisson count has no upper limit, so a finite plot misses some mass"]],
how: ["Write the rate with its units, for example 3 per hour.", "Multiply by the window length for the Poisson mean: 3 × 2 = 6.", "Invert the rate for the mean wait: 1/3 hour = 20 minutes.", "In SciPy: <code>poisson(mu=lam * T)</code> and <code>expon(scale=1 / lam)</code>.", "A Poisson plot up to 10 omits the tail beyond 10. Report it with <code>.sf(10)</code>."],
say: String.raw`For events at a constant rate, the count in a window is Poisson with mean rate times window length, and the time between events is exponential with mean one over the rate.`,
num: String.raw`λ = 3 per hour, T = 2 hours: mean count <b>6</b>, P(N = 6) = 6⁶e⁻⁶/720 = <b>0.1606</b>. Mean wait <b>20 min</b>, P(wait \(\gt\) 30 min) = \(e^{-1.5}\) = <b>0.2231</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("pl", "rate λ per hour", 0.5, 8, 0.5, 3) + sl("pt", "window T hours", 0.5, 4, 0.5, 2) + `<div id="pw"></div>`;
  const u = () => {
    const lam = +$("pl").value, T = +$("pt").value; $("plv").textContent = f(lam, 1); $("ptv").textContent = f(T, 1);
    const mu = lam * T, kmax = Math.max(10, Math.ceil(mu + 4 * Math.sqrt(mu)));
    /* timeline */
    const r = rng(15); let t = 0, ev = []; while (true) { t += -Math.log(Math.max(r(), 1e-12)) / lam; if (t > 4) break; ev.push(t); }
    let s = tx(40, 20, "simulated events over 4 hours, window shaded", null, "th") + `<rect x="40" y="30" width="${600 * T / 4}" height="26" fill="${C.amber}" opacity="0.25"/><line x1="40" y1="56" x2="640" y2="56" stroke="var(--p)"/>`;
    ev.forEach(e => s += `<line x1="${40 + 600 * e / 4}" y1="32" x2="${40 + 600 * e / 4}" y2="56" stroke="${e <= T ? C.coral : C.gray}" stroke-width="2"/>`);
    for (let h = 0; h <= 4; h++) s += tx(40 + 150 * h, 70, h + " h", "middle");
    const inW = ev.filter(e => e <= T).length;
    const a = ML.axes(60, 100, 260, 160, { xmin: -0.5, xmax: kmax + 0.5, ymin: 0, ymax: Math.max(0.1, Math.ceil(pois(Math.floor(mu), mu) * 12) / 10), nx: 5, ny: 3, fx: () => "", fy: v => v.toFixed(2), xl: "count in window", grid: false });
    s += a.s + ilab(a, range(0, kmax, kmax + 1).filter(k => k % (kmax > 20 ? 5 : kmax > 12 ? 3 : 2) === 0), 276);
    for (let k = 0; k <= kmax; k++) { const q = pois(k, mu); s += `<rect x="${a.X(k) - 4}" y="${a.Y(q)}" width="8" height="${a.Y(0) - a.Y(q)}" fill="${k === inW ? C.coral : C.blue}" opacity="0.85"/>`; }
    const b = ML.axes(400, 100, 240, 160, { xmin: 0, xmax: 3 / lam * 1.5, ymin: 0, ymax: lam * 1.05, nx: 3, ny: 3, fx: v => (v * 60).toFixed(0), fy: v => v.toFixed(1), xl: "wait (minutes)", grid: false });
    const half = 0.5;
    s += b.s + `<path d="M${b.X(Math.min(half, 4.5 / lam))} ${b.Y(0)} ${range(Math.min(half, 4.5 / lam), 4.5 / lam, 60).map(w => "L" + b.X(w).toFixed(1) + " " + b.Y(lam * Math.exp(-lam * w)).toFixed(1)).join(" ")} L${b.X(4.5 / lam)} ${b.Y(0)} Z" fill="${C.amber}" opacity="0.4"/>`;
    s += ML.path(range(0, 4.5 / lam, 100).map(w => [b.X(w), b.Y(lam * Math.exp(-lam * w))]), C.blue, 2) + `<line x1="${b.X(1 / lam)}" y1="${b.Y(0)}" x2="${b.X(1 / lam)}" y2="${b.Y(lam)}" stroke="${C.coral}" stroke-dasharray="4 3"/>` + tx(b.X(1 / lam) + 4, b.Y(lam * 0.9), "mean", null);
    fig.innerHTML = svg(310, s) + ML.code(["from scipy.stats import poisson, expon", `count = poisson(mu=${f(lam, 1)} * ${f(T, 1)})   # mean ${f(mu, 1)} events`, `wait = expon(scale=1 / ${f(lam, 1)})      # mean ${f(60 / lam, 1)} min, not scale=${f(lam, 1)}`, "wait.sf(0.5)                # P(wait > 30 min)"], -1);
    $("pw").innerHTML = ML.readout([["events in window", inW + " (coral bar)"], [`P(N = ${Math.round(mu)})`, f(pois(Math.round(mu), mu), 4)], ["P(wait > 30 min)", f(Math.exp(-lam * 0.5), 4)], [`P(N > ${kmax})`, f(1 - range(0, kmax, kmax + 1).reduce((s, k) => s + pois(k, mu), 0), 5)]]);
  };
  $("pl").oninput = u; $("pt").oninput = u; u();
}},

{s: "7. Joint and conditional", t: "Conditional probability, and when a product is allowed",
intu: String.raw`A line receives parts from two suppliers. The mosaic shows the whole population as a unit square: width is the share from each supplier, height inside each column is that supplier's defect rate, so every rectangle's area is a joint probability. The conditional probability P(D | A) is a fraction of supplier A's column only. The overall defect rate P(D) adds the defect areas of both columns, which is the law of total probability. Make the two defect rates equal and the columns line up: knowing the supplier no longer changes the defect probability, which is independence, and only then P(A and D) = P(A)P(D). Every likelihood in this course multiplies per-example probabilities, so it assumes this.`,
eq: String.raw`\[ P(D \mid A) = \frac{P(A \cap D)}{P(A)}, \qquad P(D) = P(D \mid A)P(A) + P(D \mid B)P(B), \qquad \text{independent} \iff P(A \cap D) = P(A)P(D) \]`,
sym: [[String.raw`\(P(A \cap D)\)`, "joint: from supplier A and defective, an area in the mosaic"], [String.raw`\(P(D \mid A)\)`, "conditional: the defect fraction inside column A"], ["total probability", "add the defect areas over all suppliers"], ["independence", "conditioning on A changes nothing, columns at equal height"], ["i.i.d.", "independent and identically distributed, the assumption behind a product likelihood"]],
how: ["Draw the population as a square and split it by the first variable.", "Split each column by the second variable using the conditional rates.", "Joint probability = width × height = P(A) × P(D | A). This product rule always holds.", "Add areas across columns for a marginal such as P(D).", "Only under independence can you replace P(D | A) by P(D). Check it, do not assume it."],
say: String.raw`A conditional probability is a joint probability divided by the probability of the condition, the joint is always the marginal times the conditional, and it factors into a product of marginals only when the events are independent.`,
num: String.raw`P(A) = 0.6, P(D | A) = 0.02, P(D | B) = 0.05: P(A ∩ D) = <b>0.012</b>, P(D) = 0.012 + 0.020 = <b>0.032</b>, P(A)P(D) = 0.0192 ≠ 0.012, so not independent. P(A | D) = 0.012/0.032 = <b>0.375</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("ja", "P(A)", 0.05, 0.95, 0.01, 0.6) + sl("jd", "P(D | A)", 0, 0.3, 0.005, 0.02) + sl("je", "P(D | B)", 0, 0.3, 0.005, 0.05) + `<div id="jc"></div>`;
  const u = () => {
    const pa = +$("ja").value, da = +$("jd").value, db = +$("je").value; $("jav").textContent = f(pa, 2); $("jdv").textContent = f(da, 3); $("jev").textContent = f(db, 3);
    const W = 300, H = 240, x0 = 50, y0 = 30, sc = 3; /* defect heights exaggerated by 3 for visibility */
    const hA = Math.min(1, da * sc), hB = Math.min(1, db * sc);
    let s = tx(x0, 20, "the population as a unit square, defect band ×3 for visibility", null);
    s += `<rect x="${x0}" y="${y0}" width="${W * pa}" height="${H}" fill="${C.blue}" opacity="0.18" stroke="var(--p)"/><rect x="${x0 + W * pa}" y="${y0}" width="${W * (1 - pa)}" height="${H}" fill="${C.purple}" opacity="0.18" stroke="var(--p)"/>`;
    s += `<rect x="${x0}" y="${y0 + H * (1 - hA)}" width="${W * pa}" height="${H * hA}" fill="${C.coral}" opacity="0.8"/><rect x="${x0 + W * pa}" y="${y0 + H * (1 - hB)}" width="${W * (1 - pa)}" height="${H * hB}" fill="${C.coral}" opacity="0.55"/>`;
    s += tx(x0 + W * pa / 2, y0 + H + 18, "supplier A", "middle", "th") + tx(x0 + W * pa + W * (1 - pa) / 2, y0 + H + 18, "supplier B", "middle", "th");
    const pAD = pa * da, pD = pAD + (1 - pa) * db, ind = Math.abs(da - db) < 1e-9;
    s += tx(400, 50, `P(A ∩ D) = ${f(pAD, 4)}`, null, "t") + tx(400, 72, `P(B ∩ D) = ${f((1 - pa) * db, 4)}`, null, "t") + tx(400, 100, `P(D) = ${f(pD, 4)}`, null, "th") + tx(400, 122, `P(A) P(D) = ${f(pa * pD, 4)}`, null, "t");
    s += tx(400, 156, `P(A | D) = ${pD > 0 ? f(pAD / pD, 4) : "undefined"}`, null, "th") + tx(400, 176, "share of defects from A", null);
    s += tx(400, 214, ind ? "independent: columns level" : "dependent: the supplier", null, "th") + tx(400, 232, ind ? "P(A ∩ D) = P(A) P(D)" : "changes the defect rate", null);
    fig.innerHTML = svg(300, s);
    $("jc").innerHTML = ML.readout([["product rule", `${f(pa, 2)} × ${f(da, 3)} = ${f(pAD, 4)}`], ["independence check", ind ? "holds" : "fails"]]);
  };
  $("ja").oninput = u; $("jd").oninput = u; $("je").oninput = u; u();
}},

{s: "8. Bayes rule", t: "Bayes rule turns P(flag | defect) into P(defect | flag)",
intu: String.raw`An inspection camera flags 95 % of defective parts and wrongly flags 5 % of good ones. Only 2 % of parts are defective. If a part is flagged, how likely is it to be defective? Not 95 %. Of 1000 parts, 20 are defective and 19 of those get flagged, but 980 are good and 49 of those get flagged too. So only 19 of the 68 flagged parts are bad, 27.9 %. Bayes rule is this count written as a formula. Move the base rate down and the flagged pile fills with false alarms. That is the imbalance problem of Lesson 31, seen in probability first.`,
eq: String.raw`\[ P(D \mid F) = \frac{P(F \mid D)\,P(D)}{P(F \mid D)\,P(D) + P(F \mid \bar D)\,P(\bar D)} \]`,
sym: [["P(D)", "prior or base rate, the defect fraction before looking"], [String.raw`\(P(F \mid D)\)`, "sensitivity, the chance a defect is flagged"], [String.raw`\(P(F \mid \bar D)\)`, "false alarm rate, a good part flagged"], [String.raw`\(P(D \mid F)\)`, "posterior, what a flag tells you"], ["denominator", "P(F), all flagged parts, by total probability"]],
how: ["Imagine 1000 parts. Split them by the base rate into defective and good.", "Flag each group with its own rate: sensitivity for defective, false alarm rate for good.", "Count the flagged parts in both groups.", "The posterior is flagged defective divided by all flagged.", "The formula is the same count with probabilities instead of parts."],
say: String.raw`Bayes rule computes the probability of the cause given the evidence from the probability of the evidence given the cause, weighted by the base rate and divided by the total probability of the evidence.`,
num: String.raw`P(D) = 0.02, sensitivity 0.95, false alarms 0.05: P(F) = 0.019 + 0.049 = <b>0.068</b>, P(D | F) = 0.019/0.068 = <b>0.279</b>. In 1000 parts: <b>19</b> true flags, 1 missed, <b>49</b> false alarms, 931 correct passes.`,
note: String.raw`Accuracy on an imbalanced set misleads for the same reason. A detector that never flags anything is 98 % accurate here. Lesson 31 measures precision, which is exactly P(D | F).`,
r(fig, ctl) {
  ctl.innerHTML = sl("bb", "base rate P(D)", 0.005, 0.3, 0.005, 0.02) + sl("bs", "sensitivity", 0.5, 1, 0.01, 0.95) + sl("bf", "false alarm rate", 0, 0.3, 0.005, 0.05) + `<div id="by"></div>`;
  const u = () => {
    const pd = +$("bb").value, se = +$("bs").value, fa = +$("bf").value; $("bbv").textContent = f(pd, 3); $("bsv").textContent = f(se, 2); $("bfv").textContent = f(fa, 3);
    const nD = Math.round(1000 * pd), tp = Math.round(nD * se), fn = nD - tp, nG = 1000 - nD, fp = Math.round(nG * fa), tn = nG - fp;
    const kinds = [].concat(Array(tp).fill(0), Array(fn).fill(1), Array(fp).fill(2), Array(tn).fill(3));
    const col = [C.coral, "#f2b8a2", C.amber, "var(--sunk)"];
    let s = "";
    kinds.forEach((kd, i) => { const r = Math.floor(i / 40), c = i % 40; s += `<rect x="${20 + c * 10}" y="${20 + r * 10}" width="8.5" height="8.5" rx="1.5" fill="${col[kd]}" ${kd === 3 ? 'stroke="var(--line)" stroke-width="0.5"' : ""}/>`; });
    const post = tp + fp ? tp / (tp + fp) : 0, exact = se * pd / (se * pd + fa * (1 - pd));
    s += `<rect x="440" y="24" width="12" height="12" fill="${C.coral}"/>` + tx(458, 34, `defective, flagged: ${tp}`, null) + `<rect x="440" y="44" width="12" height="12" fill="#f2b8a2"/>` + tx(458, 54, `defective, missed: ${fn}`, null) + `<rect x="440" y="64" width="12" height="12" fill="${C.amber}"/>` + tx(458, 74, `good, flagged: ${fp}`, null) + `<rect x="440" y="84" width="12" height="12" fill="var(--sunk)" stroke="var(--line)"/>` + tx(458, 94, `good, passed: ${tn}`, null);
    s += tx(440, 136, "flagged parts:", null, "th") + tx(440, 156, `${tp} + ${fp} = ${tp + fp}`, null, "t") + tx(440, 186, "P(defect | flag)", null, "th") + tx(440, 208, `${tp} / ${tp + fp} = ${f(post, 3)}`, null, "t") + tx(440, 230, `formula: ${f(exact, 4)}`, null);
    fig.innerHTML = svg(280, s) + `<p class="note">1000 parts, one square each, sorted by kind.</p>`;
    $("by").innerHTML = ML.readout([["P(F)", f(se * pd + fa * (1 - pd), 4)], ["posterior", f(exact, 4)], ["accuracy of never flagging", f(1 - pd, 3)]]);
  };
  $("bb").oninput = u; $("bs").oninput = u; $("bf").oninput = u; u();
}},

{s: "9. Likelihood", t: "Likelihood holds the data fixed and scores each parameter value",
intu: String.raw`Probability asks what data a fixed model might produce. Likelihood turns the question around: the data are recorded and fixed, and we compare candidate parameters by how probable they make those data. Ten inspections passed or failed, each a Bernoulli trial with unknown pass probability p. For independent trials the likelihood is the product of each outcome's probability, p for a pass and 1 − p for a fail. Slide p and watch the per-trial bars and their product. Add or remove passes. The curve peaks at the observed pass fraction. The curve is not a distribution over p: its area is not 1, and its height means nothing on its own, only comparisons between values of p do.`,
eq: String.raw`\[ L(p) = \prod_{i=1}^{n} p^{y_i}(1-p)^{1-y_i} = p^{k}(1-p)^{n-k}, \qquad \ell(p) = k \log p + (n-k)\log(1-p) \]`,
sym: [[String.raw`\(y_i\)`, "outcome of trial i, 1 for pass and 0 for fail, fixed after recording"], ["k", "number of passes among the n trials"], ["L(p)", "likelihood, a function of the parameter with the data held fixed"], [String.raw`\(\ell(p)\)`, "log-likelihood, same maximizer"], [String.raw`\(\hat p = k/n\)`, "maximum likelihood estimate, from setting the derivative of ℓ to zero"]],
how: ["Write the probability of one observation as a function of the parameter.", "Assume independence and multiply over the observations.", "Take the log: products become sums, powers become factors.", "Differentiate: k/p − (n − k)/(1 − p). Set it to zero.", "Solve: p̂ = k/n. Check that it is a maximum, the second derivative is negative."],
say: String.raw`The likelihood is the probability of the observed data viewed as a function of the parameters, and the maximum likelihood estimate is the parameter value that makes the observed data most probable.`,
num: String.raw`k = 7 of n = 10: L(0.7) = 0.7⁷ × 0.3³ = <b>0.002224</b>, L(0.5) = 0.5¹⁰ = <b>0.000977</b>, ratio 2.28. ℓ(0.7) = <b>−6.109</b>. The MLE is <b>p̂ = 0.7</b>.`,
r(fig, ctl) {
  let Yo = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0];
  ctl.innerHTML = sl("lp", "p", 0.01, 0.99, 0.01, 0.5) + `<div class="row"><button id="ap">Add a pass</button><button id="af">Add a fail</button><button id="ar0">Reset to 7 of 10</button></div><div id="lk"></div>`;
  const u = () => {
    const p = +$("lp").value; $("lpv").textContent = f(p, 2);
    const n = Yo.length, k = Yo.reduce((a, b) => a + b, 0), L = q => q ** k * (1 - q) ** (n - k), ph = k / n;
    let s = tx(30, 18, "each recorded trial and its probability under p", null, "th");
    const bw = Math.min(40, 600 / n);
    Yo.forEach((y, i) => { const q = y ? p : 1 - p, x = 30 + i * bw; s += `<rect x="${x}" y="${30 + 60 * (1 - q)}" width="${bw - 4}" height="${60 * q}" fill="${y ? C.teal : C.coral}" opacity="0.8"/>` + tx(x + (bw - 4) / 2, 106, y ? "pass" : "fail", "middle"); });
    const Lmax = L(ph);
    const a = ML.axes(60, 130, 360, 150, { xmin: 0, xmax: 1, ymin: 0, ymax: Lmax * 1.1, nx: 5, ny: 2, fx: v => v.toFixed(1), fy: v => v.toExponential(1), xl: "p", yl: "L(p)", grid: false });
    s += a.s + ML.path(range(0.001, 0.999, 200).map(q => [a.X(q), a.Y(L(q))]), C.blue, 2);
    s += `<line x1="${a.X(p)}" y1="${a.Y(0)}" x2="${a.X(p)}" y2="${a.Y(L(p))}" stroke="${C.coral}" stroke-width="2"/><circle cx="${a.X(p)}" cy="${a.Y(L(p))}" r="5" fill="${C.coral}"/><line x1="${a.X(ph)}" y1="${a.Y(0)}" x2="${a.X(ph)}" y2="${a.Y(Lmax)}" stroke="${C.teal}" stroke-dasharray="4 3"/>`;
    s += tx(450, 150, `k = ${k} passes of n = ${n}`, null, "th") + tx(450, 174, `L(${f(p, 2)}) = ${L(p).toExponential(3)}`, null, "t") + tx(450, 194, `ℓ(${f(p, 2)}) = ${f(Math.log(L(p)), 3)}`, null, "t") + tx(450, 222, `MLE p̂ = k/n = ${f(ph, 3)}`, null, "th") + tx(450, 242, `L(p)/L(p̂) = ${f(L(p) / Lmax, 3)}`, null, "t") + tx(450, 262, "teal dashed: the maximum", null);
    fig.innerHTML = svg(320, s);
    $("lk").innerHTML = ML.readout([["product of the bars", L(p).toExponential(3)], ["area under L(p)", (1 / ((n + 1) * choose(n, k))).toExponential(2) + ", not 1"]]);
  };
  $("ap").onclick = () => { if (Yo.length < 16) Yo.push(1); u(); };
  $("af").onclick = () => { if (Yo.length < 16) Yo.push(0); u(); };
  $("ar0").onclick = () => { Yo = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0]; u(); };
  $("lp").oninput = u; u();
}},

{s: "10. Sum the logs", t: "Multiply densities and the computer returns zero, add log densities instead",
intu: String.raw`A likelihood multiplies one density per observation. For standard normal data the typical density is about 0.24, so the product of n of them is about e to the power −1.42n. Double precision cannot store anything below about e to the power −745, so beyond roughly 520 points the product becomes exactly 0, and float32 fails after about 70. The log-likelihood is a sum of moderate numbers and never has this problem. The maximizer is the same because log is increasing. HW7's rule: compute <code>logpdf</code> directly and sum, never <code>log(pdf(...))</code> after the product has already underflowed. Slide n and watch the product die while the sum carries on.`,
eq: String.raw`\[ \ell(\theta) = \log \prod_{i=1}^{n} f(x_i \mid \theta) = \sum_{i=1}^{n} \log f(x_i \mid \theta), \qquad \text{relative likelihood} = e^{\ell(\theta) - \max \ell} \]`,
sym: [["underflow", "a positive number too small for the format, stored as 0"], ["float64 floor", "about 4.9e−324, so e to the power −745"], ["float32 floor", "about 1.4e−45, so e to the power −103"], ["logpdf", "computes the log density directly, safe for any n"], ["relative likelihood", "exp(ℓ − max ℓ), peaks at 1, safe to plot"]],
how: ["Never form the product. Sum <code>norm.logpdf(x, loc, scale)</code> over the data.", "To plot a likelihood curve, subtract the maximum log-likelihood before exponentiating.", "Maximize ℓ, or minimize −ℓ, which is what a loss function is.", "Expect ℓ to grow in magnitude with n. Its value alone is not a quality score.", "Compare models with ℓ only on the same data."],
say: String.raw`A likelihood of many observations underflows to zero as a product, so we maximize the log-likelihood, a sum of log densities with the same maximizer.`,
num: String.raw`Standard normal data: average log density is <b>−1.419</b> per point. With n = 600, ℓ is about <b>−850</b>, a perfectly ordinary number, while the product, about \(e^{-850}\), is stored as <b>0</b> in float64.`,
r(fig, ctl) {
  const r = rng(10), g = gauss(r), Xn = Array.from({ length: 2000 }, () => g());
  ctl.innerHTML = sl("un", "n", 1, 2000, 1, 600) + `<div id="uf"></div>`;
  const u = () => {
    const n = +$("un").value; $("unv").textContent = n;
    let prod = 1, prod32 = Math.fround(1), ll = 0, first0 = -1, first32 = -1;
    const P = [], LL = [];
    for (let i = 0; i < 2000; i++) { const d = npdf(Xn[i], 0, 1); prod *= d; prod32 = Math.fround(prod32 * Math.fround(d)); ll += lnpdf(Xn[i], 0, 1); if (prod === 0 && first0 < 0) first0 = i + 1; if (prod32 === 0 && first32 < 0) first32 = i + 1; if (i < n) { P.push(prod); LL.push(ll); } }
    const a = ML.axes(70, 20, 380, 230, { xmin: 0, xmax: 2000, ymin: -3000, ymax: 0, nx: 4, ny: 6, fx: v => v, fy: v => v, xl: "n observations", yl: "natural log" });
    let s = a.s;
    s += ML.path(LL.map((v, i) => [a.X(i + 1), a.Y(Math.max(-3000, v))]), C.teal, 2.2);
    const pk = P.map((v, i) => [i, v]).filter(([i, v]) => v > 0);
    s += ML.path(pk.map(([i, v]) => [a.X(i + 1), a.Y(Math.log(v))]), C.coral, 2, "5 3");
    s += `<line x1="${a.X(0)}" y1="${a.Y(-745)}" x2="${a.X(2000)}" y2="${a.Y(-745)}" stroke="${C.gray}" stroke-dasharray="2 3"/>` + tx(a.X(1990), a.Y(-745) - 5, "float64 floor, about −745", "end");
    s += `<line x1="${a.X(n)}" y1="20" x2="${a.X(n)}" y2="250" stroke="${C.blue}" stroke-dasharray="4 3"/>`;
    const prodN = P[n - 1];
    s += tx(480, 40, `n = ${n}`, null, "th") + tx(480, 64, `sum of log densities = ${f(LL[n - 1], 1)}`, null, "t") + tx(480, 86, `product in float64 = ${prodN === 0 ? "0" : prodN.toExponential(2)}`, null, "t") + tx(480, 108, `log of that product = ${prodN === 0 ? "−inf" : f(Math.log(prodN), 1)}`, null, "t");
    s += tx(480, 144, `float64 product hits 0 at n = ${first0}`, null) + tx(480, 162, `float32 product hits 0 at n = ${first32}`, null) + tx(480, 196, "teal: log-likelihood, a sum", null) + tx(480, 214, "coral dashed: log of the product,", null) + tx(480, 230, "ends where the product is 0", null);
    fig.innerHTML = svg(290, s) + ML.code(["x = rng.standard_normal(n)", "np.prod(norm.pdf(x))           # 0.0 once n is large: underflow", "norm.logpdf(x).sum()           # finite for any n", "np.log(np.prod(norm.pdf(x)))   # -inf: too late to take the log"], prodN === 0 ? 1 : 2);
    $("uf").innerHTML = ML.readout([["average log density", f(LL[n - 1] / n, 3)], ["theory for N(0, 1)", "−1.419"]]);
  };
  $("un").oninput = u; u();
}},

{s: "11. Gaussian MLE", t: "Maximum likelihood for a Gaussian gives the mean and the 1/n variance",
intu: String.raw`Six fresh sensor readings, both μ and σ unknown. The log-likelihood has two terms that pull against each other: −n log σ rewards a narrow bell, and the squared-deviation term punishes a narrow bell that misses the points. Slide μ and σ and watch each reading's density, the stems, and ℓ. Setting both partial derivatives to zero gives the sample mean and the variance with 1/n, not 1/(n − 1). That 1/n is NumPy's default <code>ddof=0</code>. HW7 Task 1.3 does the same derivative with the mean held fixed. Work it on paper before you open the homework.`,
eq: String.raw`\[ \ell(\mu, \sigma) = -n \log \sigma - \frac{n}{2}\log(2\pi) - \frac{1}{2\sigma^2} \sum_{i=1}^{n} (x_i - \mu)^2 \]
\[ \frac{\partial \ell}{\partial \mu} = 0 \Rightarrow \hat\mu = \bar x, \qquad \frac{\partial \ell}{\partial \sigma} = 0 \Rightarrow \hat\sigma^2 = \frac{1}{n}\sum_i (x_i - \bar x)^2 \]`,
sym: [[String.raw`\(\hat\mu\)`, "MLE of the mean, the sample mean"], [String.raw`\(\hat\sigma^2\)`, "MLE of the variance, divides by n, ddof = 0"], [String.raw`\(-n\log\sigma\)`, "rewards a narrow density"], [String.raw`\(\frac{1}{2\sigma^2}\sum(x-\mu)^2\)`, "punishes a narrow density that misses the data"], ["ddof = 1", "the unbiased sample variance, not the MLE"]],
how: ["Write ℓ as the sum of log densities.", "Differentiate with respect to μ: the result is Σ(x − μ)/σ². Zero at the sample mean.", "Differentiate with respect to σ: −n/σ + Σ(x − μ)²/σ³. Zero at the 1/n variance.", "Plug in the numbers. Compare with a grid search to check the algebra.", "If the grid maximum sits on the grid edge, widen the grid. That is HW7's boundary diagnostic."],
say: String.raw`For independent Gaussian data the maximum likelihood estimates are the sample mean and the average squared deviation from it, dividing by n.`,
num: String.raw`Readings 4.8, 5.3, 5.1, 4.6, 5.4, 5.0: \(\hat\mu\) = 30.2/6 = <b>5.0333</b>, Σ(x − x̄)² = 0.4533, \(\hat\sigma^2\) = 0.4533/6 = <b>0.07556</b>, \(\hat\sigma\) = <b>0.2749</b>, ℓ at the MLE = <b>−0.7650</b>. With 1/(n − 1): σ = 0.3011.`,
r(fig, ctl) {
  const n = RD.length, mh = RD.reduce((a, b) => a + b, 0) / n, sh = Math.sqrt(RD.reduce((a, b) => a + (b - mh) ** 2, 0) / n);
  const ll = (m, s) => RD.reduce((a, x) => a + lnpdf(x, m, s), 0);
  ctl.innerHTML = sl("mm", "μ", 4.4, 5.6, 0.01, 4.8) + sl("ms", "σ", 0.08, 0.8, 0.005, 0.5) + `<div class="row"><button id="mj" class="on">Jump to the MLE</button></div><div id="ml"></div>`;
  const u = () => {
    const m = +$("mm").value, sd = +$("ms").value; $("mmv").textContent = f(m, 2); $("msv").textContent = f(sd, 3);
    const a = ML.axes(60, 20, 330, 220, { xmin: 4, xmax: 6, ymin: 0, ymax: 3, nx: 4, ny: 3, fx: v => v.toFixed(1), fy: v => v, xl: "reading", yl: "density" });
    let s = a.s + ML.path(range(4, 6, 200).map(x => [a.X(x), a.Y(Math.min(3, npdf(x, m, sd)))]), C.blue, 2);
    RD.forEach(x => { const d = npdf(x, m, sd); s += `<line x1="${a.X(x)}" y1="${a.Y(0)}" x2="${a.X(x)}" y2="${a.Y(Math.min(3, d))}" stroke="${C.coral}" stroke-width="2"/><circle cx="${a.X(x)}" cy="${a.Y(0)}" r="4" fill="${C.coral}"/>`; });
    /* l versus sigma at this mu */
    const b = ML.axes(450, 20, 200, 150, { xmin: 0.08, xmax: 0.8, ymin: -12, ymax: 0, nx: 3, ny: 3, fx: v => v.toFixed(2), fy: v => v, xl: "σ", grid: false });
    s += b.s + ML.path(range(0.08, 0.8, 120).map(q => [b.X(q), b.Y(Math.max(-12, ll(m, q)))]), C.teal, 2) + `<circle cx="${b.X(sd)}" cy="${b.Y(Math.max(-12, ll(m, sd)))}" r="4.5" fill="${C.coral}"/>` + tx(550, 14, "ℓ(μ, σ) at this μ", "middle");
    s += tx(450, 212, `ℓ = ${f(ll(m, sd), 4)}`, null, "th") + tx(450, 232, `max ℓ = ${f(ll(mh, sh), 4)}`, null, "t");
    fig.innerHTML = svg(280, s) + ML.code(["x = np.array([4.8, 5.3, 5.1, 4.6, 5.4, 5.0])", "mu_hat = x.mean()                    # 5.0333", "sigma_hat = x.std(ddof=0)            # 0.2749, the MLE", "loglik = norm.logpdf(x, mu_hat, sigma_hat).sum()   # -0.7650"], -1);
    $("ml").innerHTML = ML.readout([["MLE of μ", f(mh, 4)], ["MLE of σ, 1/n", f(sh, 4)], ["σ with 1/(n − 1)", f(Math.sqrt(sh * sh * n / (n - 1)), 4)]]);
  };
  $("mj").onclick = () => { $("mm").value = mh; $("ms").value = sh; u(); };
  $("mm").oninput = u; $("ms").oninput = u; u();
}},

{s: "12. Noise to loss", t: "Gaussian noise turns maximum likelihood into least squares",
intu: String.raw`Ng's CS229 argument, drawn. Assume each target is the line plus independent Gaussian noise: y = b + wx + ε with ε ~ N(0, σ²). Then each observation has a Gaussian density centered on the prediction, drawn here as a bell around the line at each x. The negative log-likelihood is a constant, plus m log σ, plus the sum of squared residuals over 2σ². For any fixed σ, the b and w that maximize the likelihood are the ones that minimize the squared error. Move b and w and watch −ℓ and the cost J of Lesson 13 bottom out at the same point (1/3, 1.5) on the lecture's data. Change σ and only the height of −ℓ changes, not where its minimum sits.`,
eq: String.raw`\[ y^{(i)} = b + w x^{(i)} + \varepsilon^{(i)}, \quad \varepsilon^{(i)} \sim \mathcal{N}(0, \sigma^2) \ \text{i.i.d.} \]
\[ -\ell(b, w) = m \log \sigma + \frac{m}{2}\log 2\pi + \frac{1}{2\sigma^2} \sum_{i=1}^{m} \left(y^{(i)} - b - w x^{(i)}\right)^2 \]`,
sym: [[String.raw`\(\varepsilon^{(i)}\)`, "the noise on example i, Gaussian with mean 0"], [String.raw`\(\sigma\)`, "noise level, fixed and the same for every example"], ["−ℓ", "negative log-likelihood, the loss a probabilist would write"], ["SSE", "sum of squared residuals, the only term that depends on b and w"], [String.raw`\(\hat\sigma^2 = \mathrm{SSE}/m\)`, "the MLE of the noise variance once b and w are fitted"]],
how: ["Write the density of one target: Gaussian with mean b + wx and standard deviation σ.", "Take logs and sum over the independent examples.", "Negate: −ℓ = m log σ + constant + SSE/(2σ²).", "With σ fixed, minimizing −ℓ over b and w is minimizing SSE, which is minimizing J = SSE/(2m).", "The assumptions are the fine print: independent errors, Gaussian shape, the same σ everywhere. Lesson 18 changes the shape."],
say: String.raw`If the targets are the model plus independent Gaussian noise of fixed variance, maximizing the likelihood over the parameters is the same as minimizing the sum of squared residuals.`,
num: String.raw`On x = (1, 2, 3), y = (2, 3, 5) the minimum is at (b, w) = <b>(1/3, 1.5)</b> for every σ. There SSE = <b>1/6</b>, J = <b>0.0278</b>, and the noise MLE is \(\hat\sigma^2\) = SSE/3 = <b>0.0556</b>, \(\hat\sigma\) = 0.2357.`,
note: String.raw`HW7 Part 1.4 asks why fixed-variance Gaussian errors lead to squared error. This card is the argument. State the fixed-variance and independence assumptions explicitly, as the homework asks.`,
r(fig, ctl) {
  ctl.innerHTML = sl("nb", "b", -1.5, 2, 0.01, 0) + sl("nw", "w", 0.5, 2.5, 0.01, 1.2) + sl("ns", "σ", 0.15, 1.5, 0.01, 0.4) + `<div class="row"><button id="nj" class="on">Jump to (1/3, 1.5)</button></div><div id="nl"></div>`;
  const sse = (b, w) => DX.reduce((a, x, i) => a + (DY[i] - b - w * x) ** 2, 0), m = 3;
  const nll = (b, w, s) => m * Math.log(s) + m / 2 * Math.log(2 * Math.PI) + sse(b, w) / (2 * s * s);
  const u = () => {
    const b = +$("nb").value, w = +$("nw").value, sd = +$("ns").value; $("nbv").textContent = f(b, 2); $("nwv").textContent = f(w, 2); $("nsv").textContent = f(sd, 2);
    const a = ML.axes(60, 20, 300, 250, { xmin: 0, xmax: 4, ymin: 0, ymax: 7, nx: 4, ny: 7, fx: v => v, fy: v => v, xl: "x", yl: "y" });
    let s = a.s + ML.path([[a.X(0), a.Y(b)], [a.X(4), a.Y(b + 4 * w)]], C.blue, 2);
    DX.forEach((x, i) => {
      const mu = b + w * x;
      const pts = range(Math.max(0, mu - 3 * sd), Math.min(7, mu + 3 * sd), 60).map(y => [a.X(x) + 42 * npdf(y, mu, sd) / npdf(0, 0, sd), a.Y(y)]);
      s += ML.path(pts, C.purple, 1.4) + `<line x1="${a.X(x)}" y1="${a.Y(Math.max(0, mu - 3 * sd))}" x2="${a.X(x)}" y2="${a.Y(Math.min(7, mu + 3 * sd))}" stroke="${C.purple}" stroke-width="0.6" opacity="0.5"/>`;
      s += `<circle cx="${a.X(x)}" cy="${a.Y(DY[i])}" r="5" fill="${C.coral}"/>`;
    });
    const S = sse(b, w), J = S / (2 * m);
    /* small bar comparison against the minimum */
    const Smin = sse(1 / 3, 1.5);
    s += tx(400, 40, "this (b, w)", null, "th") + tx(400, 64, `SSE = ${f(S, 4)}`, null, "t") + tx(400, 84, `J = SSE/(2m) = ${f(J, 4)}`, null, "t") + tx(400, 104, `−ℓ = ${f(nll(b, w, sd), 4)}`, null, "t");
    s += tx(400, 140, "at (1/3, 1.5), same σ", null, "th") + tx(400, 164, `J = ${f(Smin / 6, 4)}`, null, "t") + tx(400, 184, `−ℓ = ${f(nll(1 / 3, 1.5, sd), 4)}`, null, "t");
    s += tx(400, 220, "purple bells: N(b + wx, σ²) at each x", null) + tx(400, 238, "coral: the observed targets", null) + tx(400, 256, S - Smin < 1e-4 ? "both at their minimum" : "both drop toward the same point", null, "th");
    fig.innerHTML = svg(300, s);
    $("nl").innerHTML = ML.readout([["σ at the fit", "√(SSE/m) = " + f(Math.sqrt(Smin / 3), 4)], ["changing σ", "moves −ℓ up or down, not its minimizer"]]);
  };
  $("nj").onclick = () => { $("nb").value = 1 / 3; $("nw").value = 1.5; u(); };
  $("nb").oninput = u; $("nw").oninput = u; $("ns").oninput = u; u();
}},

{s: "13. With the agent", t: "Do it with the agent: a likelihood module with tests",
intu: String.raw`The lesson as a small module: stable log-likelihoods for the Bernoulli and the Gaussian, the closed-form MLEs, a grid search that checks them and reports when the maximum sits on the grid edge, and the regression negative log-likelihood whose minimizer must match least squares. The tests pin the numbers from these cards, so an underflowing product or a 1/(n − 1) variance fails on a value you can check by hand.`,
eq: String.raw`\[ \texttt{bernoulli\_loglik} \to \texttt{gaussian\_loglik} \to \texttt{gaussian\_mle} \to \texttt{grid\_mle} \to \texttt{regression\_nll} \]`,
sym: [[String.raw`\(\texttt{bernoulli\_loglik}\)`, "k log p + (n − k) log(1 − p), rejects p outside (0, 1)"], [String.raw`\(\texttt{gaussian\_loglik}\)`, "sum of norm.logpdf, never a product"], [String.raw`\(\texttt{gaussian\_mle}\)`, "mean and std with ddof = 0"], [String.raw`\(\texttt{grid\_mle}\)`, "argmax on a grid plus an edge warning"], [String.raw`\(\texttt{regression\_nll}\)`, "−ℓ for a line with Gaussian noise"]],
how: ["Paste the command.", "Read <code>gaussian_loglik</code>: does it sum logpdf, or take the log of a product?", "Read <code>gaussian_mle</code>: is the standard deviation ddof = 0?", "Run the tests. The numbers are the ones on cards 9, 10, 11 and 12.", "Commit the module with its tests."],
say: String.raw`A likelihood module computes log-likelihoods as sums, checks closed-form estimates against a grid, flags a maximum on the grid edge, and confirms that the Gaussian regression likelihood and least squares agree.`,
num: String.raw`Tests expect ℓ(0.7) = <b>−6.1086</b> for 7 of 10, a finite log-likelihood for <b>2000</b> normal points, \(\hat\mu\) = <b>5.0333</b> and \(\hat\sigma\) = <b>0.2749</b> for the six readings, and an NLL minimizer at <b>(1/3, 1.5)</b>.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/likelihood.py using numpy and scipy.stats only. Functions: bernoulli_loglik(k, n, p) returning k*log(p) + (n-k)*log(1-p), raising ValueError if p is not strictly between 0 and 1. gaussian_loglik(x, mu, sigma) returning norm.logpdf(x, mu, sigma).sum(), raising ValueError if sigma <= 0, never multiplying densities. gaussian_mle(x) returning (x.mean(), x.std(ddof=0)). grid_mle(loglik_fn, grid) returning (best_value, at_edge) where at_edge is True when the argmax is the first or last grid point. regression_nll(b, w, x, y, sigma) returning the Gaussian negative log-likelihood of y = b + w*x + noise. Create tests/test_likelihood.py with pytest: bernoulli_loglik(7, 10, 0.7) close to -6.1086; grid_mle over p in linspace(0.01, 0.99, 99) for 7 of 10 returns 0.7 and at_edge False, and over linspace(0.01, 0.5, 50) returns at_edge True; gaussian_loglik of 2000 standard normal draws (default_rng(0)) is finite while np.prod(norm.pdf(x)) == 0; gaussian_mle([4.8, 5.3, 5.1, 4.6, 5.4, 5.0]) close to (5.033333, 0.274874); on x = [1, 2, 3], y = [2, 3, 5] the minimizer of regression_nll over a 301 by 301 grid of b in [-1, 2] and w in [0, 3] with sigma 0.5 equals np.polyfit(x, y, 1) reversed to within one grid step. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", "......                                                   [100%]", "6 passed in 0.41s"],
    checks: ["gaussian_loglik sums logpdf and never calls np.prod", "gaussian_mle uses ddof=0, matching the maximum likelihood estimate", "grid_mle reports at_edge so a too-narrow grid cannot pass silently", "the NLL minimizer and np.polyfit agree, which is card 12 in code", "bernoulli_loglik rejects p = 0 and p = 1 instead of returning -inf"]
  });
}},

{s: "14. Test", t: "Lesson 14 test: probability and likelihood",
intu: String.raw`Twelve questions on random variables, mass and density, tails, mean and variance, the Gaussian, counts and waits, conditional probability and Bayes, likelihood, logs, the Gaussian MLE and the step from noise to squared error. The numbers are new, so work them on paper.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to linear regression.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Three independent components are each defective with probability 0.1. P(at least one defective) is", o: ["0.271", "0.3", "0.729", "0.081"], a: 0, why: "Complement of none defective: 1 − 0.9³ = 1 − 0.729 = 0.271. Cards 1 and 3." },
    { q: "A Gaussian with σ = 0.05 has a peak density of about 7.98. This means", o: ["the distribution is invalid because a probability exceeds 1", "the density is high, which is allowed since only the area must be 1", "the reading at the mean has probability 7.98", "σ must be wrong"], a: 1, why: "Density is probability per unit. A narrow bell is tall. P(X = x) is zero for any exact value. Card 2." },
    { q: "For an integer count X, P(X ≥ 3) in SciPy is", o: ["dist.sf(3)", "dist.sf(2)", "dist.cdf(3)", "1 − dist.cdf(3)"], a: 1, why: "sf(t) = P(X > t). At least 3 is more than 2, so sf(2). Card 3." },
    { q: "X is binomial with n = 10 and p = 0.3. E[X] and Var(X) are", o: ["3 and 2.1", "3 and 0.21", "0.3 and 0.21", "3 and 9"], a: 0, why: "np = 3, np(1 − p) = 10 × 0.3 × 0.7 = 2.1. Card 4." },
    { q: "Readings are N(50, 4²). About what fraction lies between 42.16 and 57.84?", o: ["68 %", "95 %", "99.7 %", "50 %"], a: 1, why: "57.84 − 50 = 7.84 = 1.96 × 4. Within ±1.96σ is 95 %. Card 5." },
    { q: "Calls arrive at 12 per hour. The waiting time between calls in SciPy is", o: ["expon(scale=12)", "expon(scale=1/12)", "poisson(mu=12)", "expon(scale=5)"], a: 1, why: "scale = 1/λ = 1/12 hour, a mean wait of 5 minutes. scale=12 would mean 12 hours. Card 6." },
    { q: "40 % of parts come from supplier A with defect rate 0.05, the rest from B with rate 0.01. P(defect) is", o: ["0.026", "0.03", "0.06", "0.02"], a: 0, why: "Total probability: 0.4 × 0.05 + 0.6 × 0.01 = 0.02 + 0.006 = 0.026. Card 7." },
    { q: "Base rate 1 %, sensitivity 0.9, false alarm rate 0.1. P(defect | flag) is about", o: ["0.90", "0.083", "0.50", "0.009"], a: 1, why: "0.009 / (0.009 + 0.099) = 0.083. Most flags are false alarms when defects are rare. Card 8." },
    { q: "In 20 Bernoulli trials you record 5 successes. The maximum likelihood estimate of p is", o: ["0.5", "0.25", "0.2", "5"], a: 1, why: "p̂ = k/n = 5/20 = 0.25, where the derivative of k log p + (n − k) log(1 − p) is zero. Card 9." },
    { q: "Your likelihood code returns 0.0 for 3000 observations. The fix is", o: ["use float32", "sum logpdf values instead of multiplying pdf values", "take np.log of the product", "use fewer observations"], a: 1, why: "The product underflowed. The log of 0 is −inf, so the log must be taken before summing. Card 10." },
    { q: "For data 2, 4, 6, 8 the Gaussian MLE of σ² is", o: ["5", "6.67", "20", "2.24"], a: 0, why: "Mean 5, squared deviations 9, 1, 1, 9, sum 20, divided by n = 4 gives 5. Dividing by 3 gives the unbiased 6.67. Card 11." },
    { q: "Maximizing a Gaussian likelihood over b and w gives least squares only if the noise is", o: ["any shape, as long as the mean is zero", "independent with the same fixed variance for every example", "Laplace distributed", "correlated across examples"], a: 1, why: "With a common fixed σ the only term depending on b and w is SSE/(2σ²). Laplace noise gives absolute error instead, Lesson 18. Card 12." }
  ], "Lesson 14 test");
}}
],
summary: String.raw`A random variable assigns a number to each outcome, and its PMF gives each value a probability, the long-run fraction of repetitions. A continuous variable has a density instead, and only areas under it are probabilities, so a density may exceed one. The CDF accumulates probability from the left, the survival function is the rest, and for counts the probability of at least k is the survival function at k minus one. The mean is the probability-weighted average and the variance the expected squared deviation, np and np(1 − p) for a binomial. Any Gaussian standardizes to the standard normal, so 68, 95 and 99.7 % lie within one, 1.96 and three standard deviations. Poisson counts events in a window with mean rate times length, and the exponential waits between them with mean one over the rate. Joint probability is marginal times conditional, it factors only under independence, and Bayes rule turns the probability of a flag given a defect into the probability of a defect given a flag through the base rate. Likelihood holds the data fixed and scores parameters, the log turns its product into a sum that cannot underflow, the Gaussian MLE is the sample mean and the 1/n variance, and with fixed-variance Gaussian noise maximum likelihood is least squares.`,
sheet: [[String.raw`\[ P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad E[X] = np, \quad \operatorname{Var}(X) = np(1-p) \]`, "binomial count"], [String.raw`\[ P(a \le X \le b) = F(b) - F(a) = \int_a^b f(x)\,dx \]`, "probability is area under a density"], [String.raw`\[ S(t) = 1 - F(t), \qquad P(X \ge k) = S(k-1) \]`, "survival function and the integer tail"], [String.raw`\[ Z = \frac{X - \mu}{\sigma}, \quad P(|Z| \lt 1.96) = 0.95 \]`, "standard normal"], [String.raw`\[ N \sim \operatorname{Poisson}(\lambda T), \qquad P(W \gt t) = e^{-\lambda t} \]`, "counts in a window and waits between events"], [String.raw`\[ P(D \mid F) = \frac{P(F \mid D)P(D)}{P(F)} \]`, "Bayes rule"], [String.raw`\[ \ell(\theta) = \sum_i \log f(x_i \mid \theta), \qquad \hat p = k/n \]`, "log-likelihood and the Bernoulli MLE"], [String.raw`\[ \hat\mu = \bar x, \qquad \hat\sigma^2 = \frac{1}{n}\sum_i (x_i - \bar x)^2 \]`, "Gaussian MLE"], [String.raw`\[ -\ell = m\log\sigma + \frac{m}{2}\log 2\pi + \frac{1}{2\sigma^2}\sum_i \big(y^{(i)} - \hat y^{(i)}\big)^2 \]`, "Gaussian noise gives squared error"]],
sources: ["AME 5970 HW7 Part 1 refresher and worked example (binomial inspection, sensor density, the four model families, stable log-likelihood). The graded HW7 tasks are not solved here", "Andrew Ng, CS229 lecture notes, part I section 3 (probabilistic interpretation of least squares), and the CS229 probability review", "Andrew Ng, Machine Learning Specialization, course 1 (cost function for linear regression)", "Goodfellow, Bengio and Courville, Deep Learning, chapter 3 (probability and information theory) and section 5.5 (maximum likelihood estimation)", "SciPy documentation: scipy.stats.binom, norm, poisson, expon (parameter conventions for loc, scale and mu)"]
});
})();
