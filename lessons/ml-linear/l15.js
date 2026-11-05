(function () {
/* ML shelf, Part 4, Lesson 15: Linear regression. Follows AME 5970 Lecture 2 (model representation, hypothesis, cost function and its intuition, then the normal equation and evaluation) and HW3 Part 1 with its learning guide (design matrix, half-MSE cost, pseudoinverse, metrics against a baseline, interpolation and extrapolation, the training and test split), with Andrew Ng's Machine Learning course weeks 1 and 2 as the spine. The data are the course's ex1data1 and ex1data2 files from Ng's exercise 1. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const f = (v, d) => (+v).toFixed(d == null ? 4 : d);
const money = v => (v < 0 ? "−$" : "$") + Math.round(Math.abs(v)).toLocaleString("en-US");
/* HW3 data, shared with Lessons 16 and 17 */
const D1 = [[6.1101,17.592],[5.5277,9.1302],[8.5186,13.662],[7.0032,11.854],[5.8598,6.8233],[8.3829,11.886],[7.4764,4.3483],[8.5781,12.0],[6.4862,6.5987],[5.0546,3.8166],[5.7107,3.2522],[14.164,15.505],[5.734,3.1551],[8.4084,7.2258],[5.6407,0.71618],[5.3794,3.5129],[6.3654,5.3048],[5.1301,0.56077],[6.4296,3.6518],[7.0708,5.3893],[6.1891,3.1386],[20.27,21.767],[5.4901,4.263],[6.3261,5.1875],[5.5649,3.0825],[18.945,22.638],[12.828,13.501],[10.957,7.0467],[13.176,14.692],[22.203,24.147],[5.2524,-1.22],[6.5894,5.9966],[9.2482,12.134],[5.8918,1.8495],[8.2111,6.5426],[7.9334,4.5623],[8.0959,4.1164],[5.6063,3.3928],[12.836,10.117],[6.3534,5.4974],[5.4069,0.55657],[6.8825,3.9115],[11.708,5.3854],[5.7737,2.4406],[7.8247,6.7318],[7.0931,1.0463],[5.0702,5.1337],[5.8014,1.844],[11.7,8.0043],[5.5416,1.0179],[7.5402,6.7504],[5.3077,1.8396],[7.4239,4.2885],[7.6031,4.9981],[6.3328,1.4233],[6.3589,-1.4211],[6.2742,2.4756],[5.6397,4.6042],[9.3102,3.9624],[9.4536,5.4141],[8.8254,5.1694],[5.1793,-0.74279],[21.279,17.929],[14.908,12.054],[18.959,17.054],[7.2182,4.8852],[8.2951,5.7442],[10.236,7.7754],[5.4994,1.0173],[20.341,20.992],[10.136,6.6799],[7.3345,4.0259],[6.0062,1.2784],[7.2259,3.3411],[5.0269,-2.6807],[6.5479,0.29678],[7.5386,3.8845],[5.0365,5.7014],[10.274,6.7526],[5.1077,2.0576],[5.7292,0.47953],[5.1884,0.20421],[6.3557,0.67861],[9.7687,7.5435],[6.5159,5.3436],[8.5172,4.2415],[9.1802,6.7981],[6.002,0.92695],[5.5204,0.152],[5.0594,2.8214],[5.7077,1.8451],[7.6366,4.2959],[5.8707,7.2029],[5.3054,1.9869],[8.2934,0.14454],[13.394,9.0551],[5.4369,0.61705]];
const D2 = [[2104,3,399900],[1600,3,329900],[2400,3,369000],[1416,2,232000],[3000,4,539900],[1985,4,299900],[1534,3,314900],[1427,3,198999],[1380,3,212000],[1494,3,242500],[1940,4,239999],[2000,3,347000],[1890,3,329999],[4478,5,699900],[1268,3,259900],[2300,4,449900],[1320,2,299900],[1236,3,199900],[2609,4,499998],[3031,4,599000],[1767,3,252900],[1888,2,255000],[1604,3,242900],[1962,4,259900],[3890,3,573900],[1100,3,249900],[1458,3,464500],[2526,3,469000],[2200,3,475000],[2637,3,299900],[1839,2,349900],[1000,1,169900],[2040,4,314900],[3137,3,579900],[1811,4,285900],[1437,3,249900],[1239,3,229900],[2132,4,345000],[4215,4,549000],[2162,4,287000],[1664,2,368500],[2238,3,329900],[2567,4,314000],[1200,3,299000],[852,2,179900],[1852,4,299900],[1203,3,239500]];
/* np.random.default_rng(5970).permutation(47), the HW3 split: first 37 train, last 10 test */
const PERM = [25, 19, 1, 44, 28, 6, 13, 20, 40, 7, 2, 42, 31, 36, 14, 17, 4, 21, 18, 8, 34, 30, 39, 24, 43, 0, 35, 10, 26, 37, 38, 11, 12, 45, 32, 15, 33, 16, 3, 46, 41, 29, 5, 22, 9, 27, 23];
/* small dense solver for the normal equations */
const solve = (A, b) => { const n = b.length, M = A.map((r, i) => r.concat([b[i]])); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; } } return M.map((r, i) => r[n] / r[i]); };
const lstsq = (X, y) => { const p = X[0].length, A = [], b = []; for (let i = 0; i < p; i++) { A.push([]); b.push(X.reduce((s, r, k) => s + r[i] * y[k], 0)); for (let j = 0; j < p; j++) A[i].push(X.reduce((s, r) => s + r[i] * r[j], 0)); } return solve(A, b); };
const metrics = (y, p) => { const m = y.length, mu = y.reduce((a, b) => a + b, 0) / m; let se = 0, ae = 0, st = 0; for (let i = 0; i < m; i++) { se += (y[i] - p[i]) ** 2; ae += Math.abs(y[i] - p[i]); st += (y[i] - mu) ** 2; } return { rmse: Math.sqrt(se / m), mae: ae / m, r2: 1 - se / st }; };
const X1 = D1.map(r => r[0]), Y1 = D1.map(r => r[1]), M1 = X1.length;
/* sufficient statistics make J(theta0, theta1) on the food truck data instant */
const S = { x: 0, xx: 0, y: 0, xy: 0, yy: 0 }; D1.forEach(([x, y]) => { S.x += x; S.xx += x * x; S.y += y; S.xy += x * y; S.yy += y * y; });
const J1 = (a, b) => (M1 * a * a + 2 * a * b * S.x + b * b * S.xx - 2 * a * S.y - 2 * b * S.xy + S.yy) / (2 * M1);
const TN = solve([[M1, S.x], [S.x, S.xx]], [S.y, S.xy]); /* exact least squares (-3.8958, 1.1930) */
/* HW3's gradient descent run: alpha 0.01, 1500 iterations from zero */
const gd1 = (a, n) => { let t0 = 0, t1 = 0; for (let k = 0; k < n; k++) { const g0 = (M1 * t0 + t1 * S.x - S.y) / M1, g1 = (t0 * S.x + t1 * S.xx - S.xy) / M1; t0 -= a * g0; t1 -= a * g1; } return [t0, t1]; };
const TG = gd1(0.01, 1500); /* (-3.6303, 1.1664) */
ML.HW3 = { D1, D2, PERM, solve, lstsq, metrics, S, J1, TN, TG, M1 };
/* shared with Lessons 16 and 17 below the definitions */
const contours = (fn, ax, box, levels, nx, ny) => {
  nx = nx || 60; ny = ny || 60; const xs = range(box.xmin, box.xmax, nx + 1), ys = range(box.ymin, box.ymax, ny + 1);
  const Z = ys.map(y => xs.map(x => fn(x, y))); let s = "";
  const lerp = (p, q, vp, vq, lv) => { const t = (lv - vp) / (vq - vp); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
  levels.forEach((lv, li) => { for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = [[xs[i], ys[j], Z[j][i]], [xs[i + 1], ys[j], Z[j][i + 1]], [xs[i + 1], ys[j + 1], Z[j + 1][i + 1]], [xs[i], ys[j + 1], Z[j + 1][i]]], pts = [];
    for (let e = 0; e < 4; e++) { const p = c[e], q = c[(e + 1) % 4]; if ((p[2] - lv) * (q[2] - lv) < 0) pts.push(lerp(p, q, p[2], q[2], lv)); }
    if (pts.length >= 2) s += `<line x1="${ax.X(pts[0][0])}" y1="${ax.Y(pts[0][1])}" x2="${ax.X(pts[1][0])}" y2="${ax.Y(pts[1][1])}" stroke="${C.blue}" stroke-width="1" opacity="${0.35 + 0.5 * (1 - li / levels.length)}"/>`;
    if (pts.length === 4) s += `<line x1="${ax.X(pts[2][0])}" y1="${ax.Y(pts[2][1])}" x2="${ax.X(pts[3][0])}" y2="${ax.Y(pts[3][1])}" stroke="${C.blue}" stroke-width="1" opacity="0.5"/>`;
  } });
  return s;
};
const geom = (a, b, n) => Array.from({ length: n }, (_, i) => a * (b / a) ** (i / (n - 1)));
ML.HW3.contours = contours; ML.HW3.geom = geom;
/* a scatter of the food truck data in a given frame */
const truck = (a, r) => D1.map(([x, y]) => `<circle cx="${a.X(x)}" cy="${a.Y(y)}" r="${r || 2.6}" fill="${C.gray}" opacity="0.75"/>`).join("");

addLesson("ml", "linear", {
level: "Core", num: "Lesson 15",
id: "ml-linear-l15", title: "Linear regression", short: "15. Linear regression",
big: String.raw`Linear regression is the first model of the course and the one every later model is measured against. A hypothesis h(x) = θ₀ + θ₁x draws a line, the cost J(θ) scores it by half the mean squared residual, and learning means finding the θ with the smallest J. This lesson does that the direct way. You fit the food truck data from HW3 by hand, see why the cost is a parabola in one parameter and a bowl in two, compute a cost by hand, and then solve the whole problem in one line with the normal equation, which is a projection of y onto the columns of the design matrix. Rank deficiency shows why the course uses the pseudoinverse rather than an explicit inverse. The last cards judge the fit honestly: RMSE, MAE and R² against a mean baseline, interpolation versus extrapolation, and a held-out test on the housing data where a training R² of 0.76 becomes a test R² of 0.15. Lesson 16 reaches the same θ by gradient descent, and Lesson 17 explains why the housing features had to be scaled first.`,
bridge: String.raw`The topics are those of the professor's Lecture 2 notes, sections 01 to 06 (the model, notation, the cost and its intuition) and section 12 onward (the normal equation and evaluation), and the code contracts and diagnostics are HW3 Part 1's. Andrew Ng's Machine Learning course, week 1 (model representation, cost function intuition I and II) and week 2 (normal equation, noninvertibility) is the spine. The data are the HW3 files ex1data1 and ex1data2.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The hypothesis", t: "A hypothesis is a line, and every line has a cost",
intu: String.raw`HW3's first dataset: 97 cities, population in units of 10,000 people, food truck profit in units of $10,000. A training example is one pair (x⁽ⁱ⁾, y⁽ⁱ⁾), and m = 97 is the number of them. The hypothesis h(x) = θ₀ + θ₁x is a line with intercept θ₀ and slope θ₁. Move the two sliders and fit the line by eye. The coral sticks are the residuals, the vertical gaps between each city and the line, and the cost J is half their mean square. Try to beat J = 5 by hand, then press the button for the least squares line.`,
eq: String.raw`\[ h_\theta(x) = \theta_0 + \theta_1 x, \qquad J(\theta_0, \theta_1) = \frac{1}{2m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)^2 \]`,
sym: [["m", "number of training examples, 97 cities"], [String.raw`\((x^{(i)}, y^{(i)})\)`, "the i-th example: population and profit, in stored units"], [String.raw`\(\theta_0\)`, "intercept, predicted profit at population 0"], [String.raw`\(\theta_1\)`, "slope, predicted profit change per 10,000 extra people"], ["J", "half the mean squared residual, in profit units squared"]],
how: ["Read the units first: 3.5 means 35,000 people, 4.2 means $42,000.", "Pick θ₀ and θ₁. Every city gets a prediction on the line.", "Each residual is prediction minus observation for one city.", "Square, average, halve: that is J. The half only tidies the derivative in Lesson 16.", "Learning is the search for the θ with the smallest J."],
say: String.raw`The hypothesis maps an input to a prediction through parameters, and the cost is half the mean squared difference between predictions and targets over the m training examples.`,
num: String.raw`At θ = (0, 0): J = <b>32.07</b>. The least squares line θ = (<b>−3.896, 1.193</b>) gives J = <b>4.477</b>. Population ranges from 5.03 to 22.20, profit from −2.68 to 24.15.`,
r(fig, ctl) {
  ctl.innerHTML = sl("h0", "θ₀", -10, 6, 0.05, 0) + sl("h1", "θ₁", -0.5, 2.5, 0.01, 0.8) + `<div class="row"><button id="hb" class="on">Least squares line</button></div><div id="hy"></div>`;
  const u = () => {
    const a0 = +$("h0").value, a1 = +$("h1").value; $("h0v").textContent = f(a0, 2); $("h1v").textContent = f(a1, 2);
    const a = ML.axes(60, 20, 400, 260, { xmin: 4, xmax: 24, ymin: -5, ymax: 25, nx: 5, ny: 6, fx: v => v, fy: v => v, xl: "population (10,000 people)", yl: "profit ($10,000)" });
    let s = a.s;
    D1.forEach(([x, y]) => { const p = a0 + a1 * x; s += `<line x1="${a.X(x)}" y1="${a.Y(y)}" x2="${a.X(x)}" y2="${a.Y(Math.max(-5, Math.min(25, p)))}" stroke="${C.coral}" stroke-width="1" opacity="0.55"/>`; });
    s += truck(a) + ML.path([[a.X(4), a.Y(a0 + 4 * a1)], [a.X(24), a.Y(a0 + 24 * a1)]].map(([x, y]) => [x, Math.max(20, Math.min(280, y))]), C.blue, 2.2);
    const J = J1(a0, a1);
    s += tx(490, 40, `J = ${f(J, 3)}`, null, "th") + tx(490, 64, J < 5 ? "below 5: a good fit" : "try to get below 5", null) + tx(490, 100, "least squares:", null) + tx(490, 118, `θ = (${f(TN[0], 3)}, ${f(TN[1], 3)})`, null, "t") + tx(490, 136, `J = ${f(J1(TN[0], TN[1]), 3)}`, null, "t") + tx(490, 172, "coral: residuals", null) + tx(490, 190, "blue: your line", null);
    fig.innerHTML = svg(320, s);
    $("hy").innerHTML = ML.readout([["prediction at x = 7", f(a0 + 7 * a1, 3) + " = " + money((a0 + 7 * a1) * 1e4)], ["gap to the best J", f(J - J1(TN[0], TN[1]), 3)]]);
  };
  $("hb").onclick = () => { $("h0").value = TN[0]; $("h1").value = TN[1]; u(); };
  $("h0").oninput = u; $("h1").oninput = u; u();
}},

{s: "2. Cost intuition", t: "With one parameter the cost is a parabola",
intu: String.raw`Ng's cost intuition lecture, with his three points (1, 1), (2, 2), (3, 3) and the intercept fixed at 0. The hypothesis has only θ₁. On the left, each value of θ₁ is a line through the origin. On the right, the same value is a single point on J(θ₁). The slope 1 passes through every point, so J(1) = 0. The slope 0.5 misses by 0.5, 1 and 1.5, so J(0.5) = 0.583. Drag θ₁ and the left picture changes shape while the right picture traces out one parabola. A cost that is a parabola has one minimum and no traps, which is why gradient descent on linear regression always works when the learning rate is right.`,
eq: String.raw`\[ J(\theta_1) = \frac{1}{2m}\sum_{i=1}^{3}\left(\theta_1 x^{(i)} - y^{(i)}\right)^2 = \frac{14}{6}(\theta_1 - 1)^2 \]`,
sym: [[String.raw`\(h_\theta(x) = \theta_1 x\)`, "a line through the origin, θ₀ fixed at 0"], [String.raw`\(J(\theta_1)\)`, "a function of the parameter, not of x"], ["left panel", "x space: data and one hypothesis"], ["right panel", "parameter space: one point per hypothesis"], ["convex", "a single bowl, no local minima"]],
how: ["Fix θ₁. Draw the line and measure the three residuals.", "Square, sum, divide by 2m = 6. That is one point of J.", "Repeat for other θ₁. The points trace a parabola.", "Expand the sum: J = (Σx²/6)(θ₁ − 1)² = (14/6)(θ₁ − 1)².", "The minimum sits where the line passes through the data, θ₁ = 1."],
say: String.raw`Each hypothesis is one point on the cost curve, and for linear regression with squared error the cost is a parabola in each parameter with a single minimum.`,
num: String.raw`J(1) = <b>0</b>, J(0.5) = (0.25 + 1 + 2.25)/6 = <b>0.583</b>, J(0) = (1 + 4 + 9)/6 = <b>2.333</b>, J(1.5) = <b>0.583</b>.`,
r(fig, ctl) {
  const P = [[1, 1], [2, 2], [3, 3]], Jt = t => P.reduce((s, [x, y]) => s + (t * x - y) ** 2, 0) / 6;
  let seen = [];
  ctl.innerHTML = sl("c1t", "θ₁", -0.5, 2.5, 0.05, 0.5) + `<div id="ci"></div>`;
  const u = () => {
    const t = +$("c1t").value; $("c1tv").textContent = f(t, 2);
    if (!seen.some(v => Math.abs(v - t) < 1e-9)) seen.push(t); if (seen.length > 30) seen.shift();
    const a = ML.axes(50, 20, 250, 230, { xmin: 0, xmax: 3.5, ymin: 0, ymax: 3.5, nx: 7, ny: 7, fx: v => v, fy: v => v, xl: "x", yl: "y" });
    let s = a.s + tx(175, 14, "x space", "middle", "th");
    P.forEach(([x, y]) => s += `<line x1="${a.X(x)}" y1="${a.Y(y)}" x2="${a.X(x)}" y2="${a.Y(Math.max(0, Math.min(3.5, t * x)))}" stroke="${C.coral}" stroke-width="2"/><circle cx="${a.X(x)}" cy="${a.Y(y)}" r="5" fill="${C.coral}"/>`);
    const xe = t > 1 ? 3.5 / t : 3.5;
    s += ML.path([[a.X(0), a.Y(0)], [a.X(xe), a.Y(Math.max(0, t * xe))]], C.blue, 2.2);
    const b = ML.axes(390, 20, 260, 230, { xmin: -0.5, xmax: 2.5, ymin: 0, ymax: 5, nx: 6, ny: 5, fx: v => v, fy: v => v, xl: "θ₁", yl: "J(θ₁)" });
    s += b.s + tx(520, 14, "parameter space", "middle", "th") + ML.path(range(-0.5, 2.5, 100).map(v => [b.X(v), b.Y(Math.min(5, Jt(v)))]), C.blue, 1.5, "4 3");
    seen.forEach(v => { if (Jt(v) <= 5) s += `<circle cx="${b.X(v)}" cy="${b.Y(Jt(v))}" r="3" fill="${C.gray}" opacity="0.6"/>`; });
    if (Jt(t) <= 5) s += `<circle cx="${b.X(t)}" cy="${b.Y(Jt(t))}" r="6" fill="${C.coral}"/>`;
    fig.innerHTML = svg(290, s);
    $("ci").innerHTML = ML.readout([["J(θ₁)", f(Jt(t), 4)], ["(14/6)(θ₁ − 1)²", f(14 / 6 * (t - 1) ** 2, 4)], ["points visited", seen.length]]);
  };
  $("c1t").oninput = u; u();
}},

{s: "3. The cost surface", t: "With two parameters the cost is a bowl, drawn as contours",
intu: String.raw`Free both parameters and J(θ₀, θ₁) becomes a surface over the plane, drawn as contour lines of equal cost, Ng's cost intuition II. Each point of the contour plot is one whole line on the data plot. Move the point and watch the line. Points on the same contour make equally good lines even though they look different. The bowl here is not round but a long, thin valley tilted from top left to bottom right. Raising the slope and lowering the intercept trade off almost exactly, because the cities sit far from x = 0. That valley shape is why gradient descent needs 1500 iterations on this data in HW3, the subject of Lesson 16.`,
eq: String.raw`\[ J(\theta_0, \theta_1) = \frac{1}{2m}\left( m\theta_0^2 + 2\theta_0\theta_1 \textstyle\sum x + \theta_1^2 \sum x^2 - 2\theta_0 \sum y - 2\theta_1 \sum xy + \sum y^2 \right) \]`,
sym: [["contour", "a curve of equal J, every point on it a different line with the same cost"], ["star", "the minimum, the least squares line"], ["valley", "a long direction where J changes slowly"], [String.raw`\(\sum x\)`, "sums over the data, the only way the 97 cities enter J"], ["quadratic", "J is a quadratic in θ, so the contours are ellipses"]],
how: ["Pick a point (θ₀, θ₁) in the plane. It defines a line.", "Compute J for that line. Points with the same J share a contour.", "The contours are ellipses because J is quadratic in θ.", "The center of the ellipses is the minimum.", "A narrow ellipse means one direction is stiff and the other is soft. Remember that for Lessons 16 and 17."],
say: String.raw`The cost of linear regression is a quadratic bowl over the parameter plane, every point of which is one line, and its contours are ellipses centered on the least squares solution.`,
num: String.raw`At the star θ = (−3.896, 1.193), J = <b>4.477</b>. The point (−8, 1.6) is a very different line from (0, 0.8), yet their costs are close, <b>6.01</b> and <b>5.86</b>, so they sit on nearly the same contour.`,
r(fig, ctl) {
  ctl.innerHTML = sl("s0", "θ₀", -10, 2, 0.05, -1) + sl("s1", "θ₁", 0.3, 1.8, 0.01, 0.9) + `<div class="row"><button id="sb" class="on">Go to the minimum</button></div><div id="sv"></div>`;
  const box = { xmin: -10, xmax: 2, ymin: 0.3, ymax: 1.8, nx: 6, ny: 5, fx: v => v, fy: v => v.toFixed(1), xl: "θ₀ (intercept)", yl: "θ₁ (slope)", grid: false };
  const u = () => {
    const a0 = +$("s0").value, a1 = +$("s1").value; $("s0v").textContent = f(a0, 2); $("s1v").textContent = f(a1, 2);
    const a = ML.axes(60, 20, 330, 260, box);
    let s = a.s + contours(J1, a, box, geom(4.6, 100, 13), 70, 70);
    s += `<path d="M${a.X(TN[0])} ${a.Y(TN[1]) - 7} l2 5 h5 l-4 3 l2 6 l-5 -4 l-5 4 l2 -6 l-4 -3 h5 z" fill="${C.amber}"/>`;
    s += `<circle cx="${a.X(a0)}" cy="${a.Y(a1)}" r="6" fill="${C.coral}"/>`;
    const b = ML.axes(450, 20, 200, 150, { xmin: 4, xmax: 24, ymin: -5, ymax: 25, nx: 4, ny: 3, fx: v => v, fy: v => v, xl: "population", grid: false });
    s += b.s + truck(b, 1.8) + ML.path([[b.X(4), b.Y(Math.max(-5, Math.min(25, a0 + 4 * a1)))], [b.X(24), b.Y(Math.max(-5, Math.min(25, a0 + 24 * a1)))]], C.coral, 2) + ML.path([[b.X(4), b.Y(TN[0] + 4 * TN[1])], [b.X(24), b.Y(TN[0] + 24 * TN[1])]], C.amber, 1.5, "4 3");
    s += tx(450, 222, `J = ${f(J1(a0, a1), 3)}`, null, "th") + tx(450, 244, "coral: this θ, amber: the minimum", null) + tx(450, 262, "contours: J from 4.6 to 100", null);
    fig.innerHTML = svg(320, s);
    $("sv").innerHTML = ML.readout([["J here", f(J1(a0, a1), 3)], ["J at the minimum", f(J1(TN[0], TN[1]), 3)]]);
  };
  $("sb").onclick = () => { $("s0").value = TN[0]; $("s1").value = TN[1]; u(); };
  $("s0").oninput = u; $("s1").oninput = u; u();
}},

{s: "4. Cost by hand", t: "The design matrix turns every prediction into one product",
intu: String.raw`HW3 Task 3.1, step by step. Put a 1 in front of each input and stack the rows: that is the design matrix X, shape (m, n + 1). One product Xθ gives every prediction at once, shape (m,). Subtract y for the errors, square them, sum, and divide by 2m. With the HW3 toy data and θ = (1, 1), the predictions are 1, 2, 3, the only error is the last one, and J = 1/6. The code below is HW3's <code>half_mse_cost</code>, which checks the shapes before it squares anything.`,
eq: String.raw`\[ X = \begin{bmatrix} 1 & 0 \\ 1 & 1 \\ 1 & 2 \end{bmatrix}, \quad \theta = \begin{bmatrix} 1 \\ 1 \end{bmatrix}, \quad y = \begin{bmatrix} 1 \\ 2 \\ 2 \end{bmatrix}, \quad J = \frac{1}{2m}\|X\theta - y\|^2 = \frac{1}{6} \]`,
sym: [["X", "design matrix: a ones column, then one column per feature, shape (m, n + 1)"], [String.raw`\(\theta\)`, "parameters, shape (n + 1,), intercept first"], [String.raw`\(\hat y = X\theta\)`, "all predictions, shape (m,)"], [String.raw`\(\|v\|^2\)`, "sum of squared entries, v @ v in NumPy"], ["residual", "HW3 uses observed minus predicted, the sign does not matter once squared"]],
how: ["Add the intercept column: <code>np.column_stack([np.ones(m), X])</code>.", "Check shapes: (3, 2) @ (2,) gives (3,).", "Errors ŷ − y, one per row.", "Square and sum with <code>errors @ errors</code>.", "Divide by 2m. Return a Python float."],
say: String.raw`The design matrix adds a column of ones so that all predictions are one matrix-vector product, and the cost is the squared norm of the error vector divided by twice the number of examples.`,
num: String.raw`ŷ = (<b>1, 2, 3</b>), ŷ − y = (0, 0, 1), squared (0, 0, 1), sum 1, J = 1/(2·3) = <b>0.1667</b>.`,
r(fig, ctl) {
  const X = [[1, 0], [1, 1], [1, 2]], th = [1, 1], y = [1, 2, 2], yh = X.map(r => r[0] * th[0] + r[1] * th[1]), e = yh.map((v, i) => v - y[i]), e2 = e.map(v => v * v);
  const names = ["design matrix and θ", "predictions Xθ", "errors ŷ − y", "squared errors", "J = sum / 2m"];
  const draw = k => {
    let s = ML.grid(X, { x: 40, y: 50, cell: 44, title: "X (3, 2)", rowLab: false, colLab: ["1", "x"] }).s + ML.grid(th.map(v => [v]), { x: 150, y: 50, cell: 44, title: "θ (2,)", rowLab: false, colLab: false }).s;
    if (k >= 1) s += tx(215, 120, "=", "middle", "th") + ML.grid(yh.map(v => [v]), { x: 235, y: 50, cell: 44, title: "ŷ", rowLab: false, colLab: false, hl: k === 1 ? new Set(["0,0", "1,0", "2,0"]) : new Set() }).s;
    s += ML.grid(y.map(v => [v]), { x: 310, y: 50, cell: 44, title: "y", rowLab: false, colLab: false }).s;
    if (k >= 2) s += ML.grid(e.map(v => [v]), { x: 385, y: 50, cell: 44, title: "ŷ − y", rowLab: false, colLab: false, hl: k === 2 ? new Set(["0,0", "1,0", "2,0"]) : new Set(), hl2: new Set(["2,0"]) }).s;
    if (k >= 3) s += ML.grid(e2.map(v => [v]), { x: 460, y: 50, cell: 44, title: "(ŷ − y)²", rowLab: false, colLab: false, hl: k === 3 ? new Set(["0,0", "1,0", "2,0"]) : new Set() }).s;
    if (k >= 4) s += ML.box(540, 60, 120, 90, "c-teal", ["J = 1/6", "= 0.1667", "sum 1, m = 3"]);
    const notes = ["shapes (3, 2) and (2,): the inner 2s match", "row i of X dotted with θ: 1 + 0, 1 + 1, 1 + 2", "only the last example misses, by 1", "squaring removes the sign of the residual", "divide the sum by 2m = 6"];
    s += tx(40, 230, notes[k], null, "t");
    fig.innerHTML = svg(250, s) + ML.code(["def half_mse_cost(X, y, theta):", "    predictions = X @ theta                  # (m,)", "    if y.shape != predictions.shape:", "        raise ValueError('shape mismatch')", "    errors = predictions - y", "    return float(errors @ errors / (2 * y.size))"], [0, 1, 4, 5, 5][k]);
  };
  ML.stepper(ctl, 5, draw, names);
}},

{s: "5. Normal equation", t: "Set the gradient to zero and solve: the normal equation",
intu: String.raw`J is a bowl, so at its bottom the gradient is zero in every direction. The gradient is (1/m)Xᵀ(Xθ − y), from Lesson 13. Setting it to zero gives the normal equations XᵀXθ = Xᵀy, a small square system with one equation per parameter. If XᵀX is invertible the solution is θ = (XᵀX)⁻¹Xᵀy, no learning rate and no iterations. Step through the derivation and then the numbers on the lecture's data x = (1, 2, 3), y = (2, 3, 5), where it lands on (1/3, 1.5), the same minimum Lesson 13's gradient descent was walking toward.`,
eq: String.raw`\[ \nabla_\theta J = \frac{1}{m} X^T (X\theta - y) = 0 \ \Rightarrow \ X^T X \theta = X^T y \ \Rightarrow \ \theta = (X^T X)^{-1} X^T y \]`,
sym: [[String.raw`\(X^T X\)`, "a square (n + 1) × (n + 1) matrix of sums of products of features"], [String.raw`\(X^T y\)`, "sums of feature times target, shape (n + 1,)"], ["normal equations", "n + 1 linear equations, one per parameter"], ["invertible", "needs linearly independent columns, card 7"], ["no learning rate", "a direct solution, no learning rate, no iterations, no scaling needed"]],
how: ["Write J with the design matrix: (1/2m)‖Xθ − y‖².", "Its gradient is (1/m)Xᵀ(Xθ − y). The 2 from the square cancels the ½.", "Set the gradient to zero. The m drops out.", "Rearrange to XᵀXθ = Xᵀy.", "Solve the small system. In code use <code>np.linalg.lstsq</code> or <code>pinv</code>, not an explicit inverse."],
say: String.raw`The normal equation sets the gradient of the squared error cost to zero, which gives the linear system X transpose X theta equals X transpose y, solved directly without a learning rate.`,
num: String.raw`XᵀX = [[3, 6], [6, 14]], Xᵀy = (10, 23), det = 42 − 36 = 6, θ = (1/6)[[14, −6], [−6, 3]](10, 23) = (2/6, 9/6) = <b>(0.3333, 1.5)</b>, J = <b>0.0278</b>.`,
note: String.raw`A likely exam item: solve a two-parameter normal equation by hand. Form XᵀX and Xᵀy as sums, invert the 2 × 2 matrix with the determinant formula, multiply. Five lines of arithmetic.`,
r(fig, ctl) {
  const lines = [
    [String.raw`J(\theta) = \frac{1}{2m}\|X\theta - y\|^2`, "the cost, half the mean squared residual"],
    [String.raw`\nabla_\theta J = \frac{1}{m}X^T(X\theta - y)`, "chain rule, the 2 cancels the half (Lesson 13)"],
    [String.raw`X^T X\theta = X^T y`, "set the gradient to zero, the m drops out"],
    [String.raw`X^T X = \begin{bmatrix} 3 & 6 \\ 6 & 14 \end{bmatrix}, \quad X^T y = \begin{bmatrix} 10 \\ 23 \end{bmatrix}`, "on x = (1, 2, 3), y = (2, 3, 5): m, Σx, Σx² and Σy, Σxy"],
    [String.raw`(X^T X)^{-1} = \frac{1}{6}\begin{bmatrix} 14 & -6 \\ -6 & 3 \end{bmatrix}`, "2 × 2 inverse: swap the diagonal, negate the off diagonal, divide by det = 6"],
    [String.raw`\theta = \frac{1}{6}\begin{bmatrix} 140 - 138 \\ -60 + 69 \end{bmatrix} = \begin{bmatrix} 1/3 \\ 3/2 \end{bmatrix}`, "the minimum, (0.3333, 1.5)"]
  ];
  const draw = k => {
    fig.innerHTML = `<div style="padding:4px 0">${lines.map((l, i) => `<div style="margin:5px 0;padding:6px 10px;border-radius:8px;border:1px solid ${i === k ? C.teal : "var(--line)"};background:${i === k ? "var(--teal-bg)" : "var(--panel)"};opacity:${i <= k ? 1 : 0.25}">\\[ ${l[0]} \\]<div class="sm" style="margin-top:2px">${i <= k ? l[1] : ""}</div></div>`).join("")}</div>` + ML.code(["X = np.column_stack([np.ones(3), [1.0, 2.0, 3.0]]); y = np.array([2.0, 3.0, 5.0])", "theta = np.linalg.solve(X.T @ X, X.T @ y)     # [0.3333 1.5]", "theta = np.linalg.lstsq(X, y, rcond=None)[0]  # same, more stable"], k >= 5 ? 2 : k >= 2 ? 1 : -1);
    typesetMath(fig);
  };
  ML.stepper(ctl, lines.length, draw, ["cost", "gradient", "normal equations", "the sums", "the inverse", "the solution"]);
}},

{s: "6. Projection", t: "Least squares is a projection: the residual is perpendicular to every column",
intu: String.raw`With m = 3 examples, y is a point in three-dimensional space, and so is every prediction vector Xθ. All the vectors Xθ form a plane: the span of the ones column and the x column. No point of the plane equals y, because the data are not on a line. The closest point is the perpendicular foot of y on the plane, ŷ, and the residual y − ŷ sticks straight out of the plane. Perpendicular to both columns means Xᵀ(y − ŷ) = 0, which is exactly the normal equation. Move b and w to pick another point of the plane and watch your residual tilt and grow. The floor of the picture is the plane, so the right angle and Pythagoras are visible: your squared distance is the perpendicular part plus the part along the floor.`,
eq: String.raw`\[ \hat y = X\hat\theta = X(X^TX)^{-1}X^T y, \qquad X^T(y - \hat y) = 0, \qquad \|y - X\theta\| \ge \|y - \hat y\| \]`,
sym: [["column space", "every vector Xθ, here a plane in 3D"], [String.raw`\(\hat y\)`, "the projection of y onto that plane"], [String.raw`\(y - \hat y\)`, "the residual, perpendicular to the plane"], [String.raw`\(X^T r = 0\)`, "perpendicular to every column, the normal equations again"], ["hat matrix", "X(XᵀX)⁻¹Xᵀ, which puts the hat on y"]],
how: ["Think of y as one point in m-dimensional space.", "Each θ picks one point Xθ in the plane spanned by the columns of X.", "The squared cost is the squared distance from y to that point, over 2m.", "The nearest point is the perpendicular projection.", "Check it in code: <code>X.T @ (y - X @ theta)</code> is zero up to rounding."],
say: String.raw`Least squares projects the target vector onto the column space of the design matrix, so the fitted values are the closest reachable point and the residual is orthogonal to every column.`,
num: String.raw`ŷ = (<b>1.8333, 3.3333, 4.8333</b>), r = y − ŷ = (0.1667, −0.3333, 0.1667), ‖r‖² = <b>1/6</b>, Xᵀr = (0.1667 − 0.3333 + 0.1667, 0.1667 − 0.6667 + 0.5) = <b>(0, 0)</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("pa", "turn the floor", -60, 60, 1, 20) + sl("pb", "b", -0.5, 1.2, 0.01, 0.1) + sl("pw", "w", 1, 2, 0.01, 1.75) + `<div class="row"><button id="pj" class="on">Snap to the projection</button></div><div id="pr"></div>`;
  const y = [2, 3, 5], c1 = [1, 1, 1], c2 = [1, 2, 3], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  /* an orthonormal frame: u1, u2 span the column space (the floor), n is its normal */
  const u1 = c1.map(v => v / Math.sqrt(3)), u2 = [-1, 0, 1].map(v => v / Math.SQRT2), nn = [1, -2, 1].map(v => v / Math.sqrt(6));
  const yh = [11 / 6, 10 / 3, 29 / 6], P0 = [dot(yh, u1), dot(yh, u2)], ZX = 4;
  const u = () => {
    const az = +$("pa").value * Math.PI / 180, b = +$("pb").value, w = +$("pw").value; $("pav").textContent = $("pa").value + "°"; $("pbv").textContent = f(b, 2); $("pwv").textContent = f(w, 2);
    const k = 55, cx = 225, cy = 200;
    const S = v => { const p = dot(v, u1) - P0[0], q = dot(v, u2) - P0[1], z = dot(v, nn), pr = p * Math.cos(az) - q * Math.sin(az), qr = p * Math.sin(az) + q * Math.cos(az); return [cx + k * pr, cy - k * 0.8 * qr - k * ZX * z]; };
    const comb = (s1, s2) => [0, 1, 2].map(i => s1 * c1[i] + s2 * c2[i]);
    let s = tx(20, 18, "the floor is the column space of X, the plane of all Xθ", null, "th");
    const corners = [comb(-0.8, 0.9), comb(1.5, 0.9), comb(1.5, 2.1), comb(-0.8, 2.1)].map(S);
    s += `<path d="M${corners.map(p => p.map(v => v.toFixed(1)).join(" ")).join(" L")} Z" fill="${C.blue}" opacity="0.10" stroke="${C.blue}" stroke-width="0.8"/>`;
    for (let g = 1; g <= 2.01; g += 0.25) { const A = S(comb(-0.8, g)), B = S(comb(1.5, g)); s += `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${C.blue}" stroke-width="0.4" opacity="0.5"/>`; }
    for (let g = -0.5; g <= 1.51; g += 0.5) { const A = S(comb(g, 0.9)), B = S(comb(g, 2.1)); s += `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${C.blue}" stroke-width="0.4" opacity="0.5"/>`; }
    const py = S(y), pyh = S(yh), cur = comb(b, w), pc = S(cur);
    s += `<line x1="${pyh[0]}" y1="${pyh[1]}" x2="${py[0]}" y2="${py[1]}" stroke="${C.teal}" stroke-width="2" stroke-dasharray="5 3"/>` + `<path d="M${pyh[0] + 9} ${pyh[1]} l0 -9 l-9 0" fill="none" stroke="${C.teal}" stroke-width="1"/>`;
    s += `<line x1="${pc[0]}" y1="${pc[1]}" x2="${pyh[0]}" y2="${pyh[1]}" stroke="${C.gray}" stroke-width="1.4" stroke-dasharray="2 3"/>`;
    s += `<line x1="${pc[0]}" y1="${pc[1]}" x2="${py[0]}" y2="${py[1]}" stroke="${C.purple}" stroke-width="2.2"/><circle cx="${pc[0]}" cy="${pc[1]}" r="5" fill="${C.purple}"/>` + tx(pc[0] + 8, pc[1] + 14, "Xθ", null, "th");
    s += `<circle cx="${pyh[0]}" cy="${pyh[1]}" r="4.5" fill="${C.teal}"/>` + tx(pyh[0] - 8, pyh[1] + 16, "ŷ", "end", "th") + `<circle cx="${py[0]}" cy="${py[1]}" r="5.5" fill="${C.coral}"/>` + tx(py[0] + 9, py[1] - 4, "y", null, "th");
    const r = y.map((v, i) => v - cur[i]), d2 = dot(r, r), h2 = 1 / 6, g2 = dot(cur.map((v, i) => v - yh[i]), cur.map((v, i) => v - yh[i])), Xr = [r[0] + r[1] + r[2], r[0] + 2 * r[1] + 3 * r[2]];
    s += tx(450, 44, "your θ = (b, w)", null, "th") + tx(450, 66, `Xθ = (${cur.map(v => f(v, 2)).join(", ")})`, null, "t") + tx(450, 86, `Xᵀ(y − Xθ) = (${f(Xr[0], 3)}, ${f(Xr[1], 3)})`, null, "t");
    s += tx(450, 122, "Pythagoras on the picture:", null, "th") + tx(450, 144, `‖y − Xθ‖² = ${f(d2, 4)}`, null, "t") + tx(450, 164, `= ‖y − ŷ‖² + ‖ŷ − Xθ‖²`, null) + tx(450, 184, `= ${f(h2, 4)} + ${f(g2, 4)}`, null, "t");
    s += tx(450, 222, "teal: the perpendicular, the residual", null) + tx(450, 238, "purple: your residual", null) + tx(450, 254, `height above the floor drawn ×${ZX}`, null);
    fig.innerHTML = svg(290, s);
    $("pr").innerHTML = ML.readout([["your squared distance", f(d2, 4)], ["smallest possible", "0.1667"], ["perpendicular to both columns?", Math.hypot(Xr[0], Xr[1]) < 0.02 ? "yes" : "no"]]);
  };
  $("pj").onclick = () => { $("pb").value = 1 / 3; $("pw").value = 1.5; u(); };
  $("pa").oninput = u; $("pb").oninput = u; $("pw").oninput = u; u();
}},

{s: "7. Rank deficiency", t: "Duplicate a column and XᵀX has no inverse, but the pseudoinverse still answers",
intu: String.raw`HW3 Task 9.1: add a third column that is the same measurement in other units, ten times x. Now the columns are linearly dependent, the rank is 2 instead of 3, and XᵀX is singular, so <code>np.linalg.inv</code> raises an error. The fit itself is fine: every θ with θ₁ + 10θ₂ = 2 and θ₀ = 0 predicts y exactly. The cost has a flat valley floor, a whole line of minimizers, drawn here in the (θ₁, θ₂) plane. The pseudoinverse picks the one closest to the origin. Slide along the line and the predictions never change, only the individual coefficients, which is why redundant coefficients cannot be interpreted.`,
eq: String.raw`\[ X = \begin{bmatrix} 1 & 1 & 10 \\ 1 & 2 & 20 \\ 1 & 3 & 30 \end{bmatrix}, \quad \det(X^TX) = 0, \quad \theta^{+} = X^{+} y = (0, \ 0.0198, \ 0.1980) \]`,
sym: [["rank", "number of linearly independent columns, 2 here"], ["singular", "det(XᵀX) = 0, no inverse exists"], [String.raw`\(X^{+}\)`, "the pseudoinverse, np.linalg.pinv"], ["minimum norm", "among all minimizers, the pseudoinverse returns the shortest θ"], ["identifiable", "a coefficient is identifiable only if no other θ gives the same predictions"]],
how: ["Look for columns that are multiples or sums of others: units conversions, one-hot columns plus an intercept.", "Check <code>np.linalg.matrix_rank(X)</code> against the number of columns.", "Use <code>np.linalg.pinv(X) @ y</code> or <code>lstsq</code>. They never form an explicit inverse.", "Trust the predictions. Do not interpret the individual redundant coefficients.", "Better: remove the redundant column, then the solution is unique."],
say: String.raw`When columns of the design matrix are linearly dependent, X transpose X is singular and the least squares minimizer is not unique, and the pseudoinverse returns the minimizer with the smallest norm.`,
num: String.raw`Rank <b>2</b> of 3 columns. Solutions: θ₀ = 0, θ₁ + 10θ₂ = 2. Pseudoinverse: (0, 2/101, 20/101) = (<b>0, 0.0198, 0.198</b>), norm 0.199. Drop the duplicate column and θ = <b>(0, 2)</b> uniquely.`,
r(fig, ctl) {
  let drop = 0;
  ctl.innerHTML = btns([[0, "with the duplicate column"], [1, "duplicate removed"]], "k") + sl("rt", "move along the valley", -1, 1, 0.01, 0) + `<div id="rk"></div>`;
  const u = () => {
    pick(ctl, "k", drop);
    const t = +$("rt").value; $("rtv").textContent = f(t, 2);
    const a = ML.axes(60, 20, 330, 250, { xmin: -0.5, xmax: 2.5, ymin: -0.1, ymax: 0.3, nx: 6, ny: 4, fx: v => v.toFixed(1), fy: v => v.toFixed(2), xl: "θ₁ (per unit of x)", yl: "θ₂ (per unit of 10x)", grid: false });
    let s = a.s;
    if (!drop) {
      const p0 = [2 / 101, 20 / 101], dir = [10, -1].map(v => v / Math.hypot(10, 1)), th = [p0[0] + 2 * t * dir[0], p0[1] + 2 * t * dir[1]];
      s += ML.path([[a.X(-0.5), a.Y(0.25)], [a.X(2.5), a.Y(-0.05)]], C.blue, 2.5) + tx(a.X(1.0), a.Y(0.0), "J = 0 on this whole line", null);
      s += `<circle cx="${a.X(p0[0])}" cy="${a.Y(p0[1])}" r="5" fill="${C.teal}"/>` + tx(a.X(p0[0]) + 8, a.Y(p0[1]) - 6, "pinv: closest to 0", null);
      s += `<circle cx="${a.X(th[0])}" cy="${a.Y(th[1])}" r="6" fill="${C.coral}"/>`;
      const pred = [1, 2, 3].map(x => th[0] * x + th[1] * 10 * x);
      s += tx(420, 40, "rank 2, det(XᵀX) = 0", null, "th") + tx(420, 62, "np.linalg.inv: LinAlgError", null, "t") + tx(420, 96, `θ = (0, ${f(th[0], 4)}, ${f(th[1], 4)})`, null, "t") + tx(420, 116, `predictions = (${pred.map(v => f(v, 3)).join(", ")})`, null, "t") + tx(420, 136, `‖θ‖ = ${f(Math.hypot(th[0], th[1]), 4)}`, null, "t") + tx(420, 172, "every point on the line predicts", null) + tx(420, 188, "y = (2, 4, 6) exactly", null);
    } else {
      s += `<circle cx="${a.X(2)}" cy="${a.Y(0)}" r="6" fill="${C.teal}"/>` + tx(a.X(2) - 8, a.Y(0) - 10, "unique θ₁ = 2", "end");
      s += tx(420, 40, "rank 2 of 2 columns", null, "th") + tx(420, 62, "XᵀX = [[3, 6], [6, 14]], det = 6", null, "t") + tx(420, 96, "θ = (0, 2)", null, "t") + tx(420, 116, "predictions = (2, 4, 6)", null, "t") + tx(420, 152, "one minimum, so the slope", null) + tx(420, 168, "can be interpreted", null);
    }
    fig.innerHTML = svg(310, s) + ML.code(drop ? ["X = np.array([[1, 1], [1, 2], [1, 3.0]]); y = np.array([2, 4, 6.0])", "np.linalg.solve(X.T @ X, X.T @ y)   # [0. 2.]"] : ["X = np.array([[1, 1, 10], [1, 2, 20], [1, 3, 30.0]]); y = np.array([2, 4, 6.0])", "np.linalg.matrix_rank(X)            # 2", "np.linalg.pinv(X) @ y               # [0.     0.0198 0.198 ]", "np.linalg.inv(X.T @ X)              # LinAlgError: Singular matrix"], -1);
    $("rk").innerHTML = "";
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { drop = +b.dataset.k; u(); }); $("rt").oninput = u; u();
}},

{s: "8. Direct or iterative", t: "Normal equation or gradient descent: it depends on the number of features",
intu: String.raw`Ng's comparison. The normal equation needs no learning rate, no iterations and no feature scaling. On HW3's raw housing data it gives θ = (89,598, 139.21, −8,738) in one call and predicts $293,081 for a 1650 square foot, three bedroom house. But forming XᵀX costs about mn² operations and solving it about n³. Gradient descent costs about mn per iteration. With a few features the direct method wins. With tens of thousands of features, or a model that is not linear like the networks of Part 7, only the iterative method is possible. Move n and m and watch the crossover.`,
eq: String.raw`\[ \text{normal equation} \approx mn^2 + n^3, \qquad \text{gradient descent} \approx 2kmn \ \text{for } k \text{ iterations} \]`,
sym: [["n", "number of features"], ["m", "number of examples"], ["k", "iterations of gradient descent, about 1000 here"], [String.raw`\(n^3\)`, "the cost of solving an n × n system"], ["nonlinear models", "no closed form exists, gradient descent is the only option"]],
how: ["Count features. Below a few thousand, the normal equation or lstsq is fine.", "Above that, or for millions of rows that do not fit in memory, use gradient descent.", "The normal equation needs no scaling, gradient descent does (Lesson 17).", "Both give the same θ on a convex least squares problem, HW3 Task 9.3 checks it.", "For neural networks there is no normal equation at all."],
say: String.raw`The normal equation solves least squares directly at a cost that grows with the cube of the number of features, while gradient descent costs a multiple of the data size per iteration and works for any differentiable model.`,
num: String.raw`Raw ex1data2, all 47 houses: θ = (<b>89,597.9, 139.21, −8,738.0</b>), 1650 sq ft and 3 bedrooms predict <b>$293,081</b>. With m = 47 and three columns the direct solve is a few hundred operations.`,
r(fig, ctl) {
  ctl.innerHTML = sl("c8n", "log10 n features", 0, 5, 0.1, 2) + sl("cm", "log10 m examples", 2, 7, 0.1, 4) + sl("ck", "iterations k", 100, 5000, 100, 1000) + `<div id="cc"></div>`;
  const u = () => {
    const ln = +$("c8n").value, lm = +$("cm").value, k = +$("ck").value, n = 10 ** ln, m = 10 ** lm; $("c8nv").textContent = Math.round(n).toLocaleString(); $("cmv").textContent = Math.round(m).toLocaleString(); $("ckv").textContent = k;
    const a = ML.axes(70, 20, 380, 240, { xmin: 0, xmax: 5, ymin: 2, ymax: 18, nx: 5, ny: 8, fx: v => "1e" + v, fy: v => "1e" + v, xl: "number of features n", yl: "operations" });
    let s = a.s;
    const NE = l => Math.log10(m * 10 ** (2 * l) + 10 ** (3 * l)), GD = l => Math.log10(2 * k * m * 10 ** l);
    s += ML.path(range(0, 5, 100).map(l => [a.X(l), a.Y(Math.min(18, NE(l)))]), C.coral, 2.2) + ML.path(range(0, 5, 100).map(l => [a.X(l), a.Y(Math.min(18, GD(l)))]), C.teal, 2.2);
    s += `<line x1="${a.X(ln)}" y1="20" x2="${a.X(ln)}" y2="260" stroke="${C.blue}" stroke-dasharray="4 3"/>`;
    const ne = 10 ** NE(ln), gd = 10 ** GD(ln);
    s += tx(480, 40, "coral: normal equation", null) + tx(480, 58, "teal: gradient descent", null) + tx(480, 94, `normal eq: ${ne.toExponential(1)}`, null, "t") + tx(480, 114, `gradient descent: ${gd.toExponential(1)}`, null, "t") + tx(480, 140, ne < gd ? "direct solve is cheaper" : "gradient descent is cheaper", null, "th");
    s += tx(480, 180, "HW3 housing, raw features:", null, "th") + tx(480, 200, "θ = (89598, 139.21, −8738)", null, "t") + tx(480, 220, "1650 sq ft, 3 br: $293,081", null, "t") + tx(480, 240, "no scaling, no α", null);
    fig.innerHTML = svg(300, s) + ML.code(["X = np.column_stack([np.ones(47), housing[['size_sqft', 'bedrooms']]])", "theta = np.linalg.lstsq(X, price, rcond=None)[0]   # [89597.9  139.21  -8738.02]", "np.array([1, 1650, 3]) @ theta                     # 293081.46"], -1);
    $("cc").innerHTML = "";
  };
  $("c8n").oninput = u; $("cm").oninput = u; $("ck").oninput = u; u();
}},

{s: "9. Metrics and baseline", t: "RMSE, MAE and R² mean nothing without a baseline",
intu: String.raw`HW3 Task 6.2. A fitted line should beat the simplest possible predictor, the mean profit for every city. RMSE is the typical error in the target's units, MAE the average absolute error, less sensitive to a few large misses, and R² the fraction of the target's variation around its mean that the model explains. The mean baseline has R² = 0 by construction. Switch between the baseline and the fitted line and watch the residual sticks shrink. The fitted line cuts the RMSE from 5.48 to 2.99 and explains about 70 % of the variation, on the same data it was fitted to, which is not yet a claim about new cities.`,
eq: String.raw`\[ \mathrm{RMSE} = \sqrt{\frac{1}{m}\sum_i r_i^2}, \quad \mathrm{MAE} = \frac{1}{m}\sum_i |r_i|, \quad R^2 = 1 - \frac{\sum_i r_i^2}{\sum_i (y_i - \bar y)^2} \]`,
sym: [[String.raw`\(r_i = y_i - \hat y_i\)`, "residual, observed minus predicted, the HW3 convention"], ["RMSE", "root mean squared error, target units"], ["MAE", "mean absolute error, target units, robust to a few big misses"], [String.raw`\(R^2\)`, "1 minus model SSE over baseline SSE, unitless"], ["baseline", "always predict the training mean, R² = 0"]],
how: ["Compute residuals with one stated sign convention.", "RMSE and MAE are in the target's units. Convert to dollars for a report.", "R² compares the model's squared error with the mean predictor's.", "Report the baseline next to the model, always.", "In-sample numbers describe the fit, not new data. Card 11 does the held-out version."],
say: String.raw`RMSE and MAE measure typical error in the target's units, R squared measures the fraction of variance explained relative to predicting the mean, and all three only mean something next to a baseline.`,
num: String.raw`Mean baseline: RMSE <b>5.482</b>, MAE 3.993, R² <b>0</b>. HW3 line after 1500 iterations: RMSE <b>2.994</b> ($29,945), MAE 2.211, R² <b>0.702</b>. Exact least squares: RMSE 2.992, R² 0.702.`,
r(fig, ctl) {
  let k = 1;
  ctl.innerHTML = btns([[0, "mean baseline"], [1, "HW3 line (1500 iterations)"], [2, "exact least squares"]], "k") + `<div id="mt"></div>`;
  const ym = Y1.reduce((a, b) => a + b, 0) / M1;
  const u = () => {
    pick(ctl, "k", k);
    const th = k === 0 ? [ym, 0] : k === 1 ? TG : TN, P = X1.map(x => th[0] + th[1] * x), M = metrics(Y1, P);
    const a = ML.axes(60, 20, 380, 250, { xmin: 4, xmax: 24, ymin: -5, ymax: 25, nx: 5, ny: 6, fx: v => v, fy: v => v, xl: "population (10,000 people)", yl: "profit ($10,000)" });
    let s = a.s;
    D1.forEach(([x, y], i) => s += `<line x1="${a.X(x)}" y1="${a.Y(y)}" x2="${a.X(x)}" y2="${a.Y(P[i])}" stroke="${C.coral}" stroke-width="1" opacity="0.6"/>`);
    s += truck(a) + ML.path([[a.X(4), a.Y(th[0] + 4 * th[1])], [a.X(24), a.Y(th[0] + 24 * th[1])]], C.blue, 2.2);
    const Mb = metrics(Y1, Y1.map(() => ym));
    s += tx(470, 40, ["mean baseline", "HW3 gradient descent", "exact least squares"][k], null, "th") + tx(470, 64, `RMSE = ${f(M.rmse, 3)}`, null, "t") + tx(470, 84, `MAE = ${f(M.mae, 3)}`, null, "t") + tx(470, 104, `R² = ${f(M.r2, 3)}`, null, "t");
    s += tx(470, 140, "baseline for reference:", null) + tx(470, 158, `RMSE ${f(Mb.rmse, 3)}, R² 0`, null, "t") + tx(470, 192, `RMSE in dollars: ${money(M.rmse * 1e4)}`, null) + tx(470, 226, "in-sample: the line was fitted", null) + tx(470, 242, "to these same 97 cities", null);
    fig.innerHTML = svg(310, s) + ML.code(["residuals = y_true - y_pred", "rmse = np.sqrt(np.mean(residuals ** 2))", "mae = np.mean(np.abs(residuals))", "r2 = 1 - np.sum(residuals ** 2) / np.sum((y_true - y_true.mean()) ** 2)"], -1);
    $("mt").innerHTML = ML.readout([["SSE model / SSE baseline", f(1 - M.r2, 3)], ["R²", f(M.r2, 3)]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "10. Inside the data", t: "Predict in real units, and know when you are extrapolating",
intu: String.raw`HW3 Task 6.1 asks for profits at 35,000 and 70,000 people. The model works in stored units, so divide the population by 10,000, predict, and multiply the profit by 10,000. Both answers come from the same equation, but they do not deserve the same trust. The smallest city in the data has 50,269 people, so 70,000 is inside the observed range, interpolation, and 35,000 is outside it, extrapolation. The line has no evidence about how profit behaves there. Slide the population and watch the label change. The intercept θ₀ = −3.63, a $36,300 loss at zero population, is an extreme extrapolation, a number the line needs, not a forecast.`,
eq: String.raw`\[ \hat y_{\$} = 10^4 \left(\theta_0 + \theta_1 \frac{\text{people}}{10^4}\right), \qquad x_{\min} = 5.0269 \le x \le 22.203 = x_{\max} \ \text{is interpolation} \]`,
sym: [["stored units", "population in 10,000 people, profit in $10,000"], ["interpolation", "a new input inside the training range"], ["extrapolation", "outside it, no data support the shape of the model there"], [String.raw`\(\theta_0\)`, "prediction at x = 0, far outside the data, not interpretable here"], ["residual plot", "residual against prediction, the inset, should show no pattern"]],
how: ["Convert the input to stored units before predicting.", "Predict with the same function used in training, HW3's <code>predict_linear</code>.", "Convert the output back to dollars for the report.", "Compare the input with the training minimum and maximum. Say which case it is.", "Look at the residual plot for structure the line missed."],
say: String.raw`A prediction inside the range of the training inputs is interpolation and one outside it is extrapolation, and the model's equation gives a number in both cases but only the data justify the first.`,
num: String.raw`35,000 people: −3.6303 + 1.1664 × 3.5 = 0.452, about <b>$4,520</b>, extrapolation. 70,000 people: 4.534, about <b>$45,342</b>, interpolation. Observed population range <b>50,269 to 222,030</b>.`,
r(fig, ctl) {
  ctl.innerHTML = sl("ip", "population (people)", 0, 260000, 1000, 35000) + `<div id="ix"></div>`;
  const u = () => {
    const pp = +$("ip").value, x = pp / 1e4; $("ipv").textContent = pp.toLocaleString("en-US");
    const pr = TG[0] + TG[1] * x, inside = x >= 5.0269 && x <= 22.203;
    const a = ML.axes(60, 20, 360, 250, { xmin: 0, xmax: 26, ymin: -6, ymax: 30, nx: 13, ny: 6, fx: v => v % 4 === 0 ? v : "", fy: v => v, xl: "population (10,000 people)", yl: "profit ($10,000)" });
    let s = a.s + `<rect x="${a.X(5.0269)}" y="20" width="${a.X(22.203) - a.X(5.0269)}" height="250" fill="${C.teal}" opacity="0.08"/>` + tx(a.X(13.6), 34, "observed range", "middle");
    s += truck(a, 2.2) + ML.path([[a.X(0), a.Y(TG[0])], [a.X(26), a.Y(TG[0] + 26 * TG[1])]], C.blue, 2);
    s += `<circle cx="${a.X(x)}" cy="${a.Y(Math.max(-6, Math.min(30, pr)))}" r="7" fill="${inside ? C.teal : C.coral}"/>`;
    /* residual inset */
    const b = ML.axes(470, 150, 180, 110, { xmin: 0, xmax: 25, ymin: -10, ymax: 15, nx: 5, ny: 5, fx: v => v, fy: v => v, xl: "predicted", grid: false });
    s += b.s + `<line x1="${b.X(0)}" y1="${b.Y(0)}" x2="${b.X(25)}" y2="${b.Y(0)}" stroke="${C.coral}" stroke-dasharray="4 3"/>` + D1.map(([xx, yy]) => { const p = TG[0] + TG[1] * xx; return `<circle cx="${b.X(p)}" cy="${b.Y(yy - p)}" r="1.8" fill="${C.gray}"/>`; }).join("") + tx(560, 140, "residual vs predicted", "middle");
    s += tx(470, 40, inside ? "interpolation" : "extrapolation", null, "th") + tx(470, 62, `x = ${f(x, 3)} stored units`, null, "t") + tx(470, 82, `ŷ = ${f(pr, 3)} = ${money(pr * 1e4)}`, null, "t") + tx(470, 104, inside ? "inside the data, supported" : "outside the data, a guess", null);
    fig.innerHTML = svg(312, s) + ML.code(["def predict_profit_usd(population_people, theta):", "    x = population_people / 10_000", "    X_new = add_intercept(np.array([[x]]))", "    return float(predict_linear(X_new, theta)[0] * 10_000)", `predict_profit_usd(${pp}, theta)   # ${money(pr * 1e4)}`], 4);
    $("ix").innerHTML = ML.readout([["θ (HW3 run)", `(${f(TG[0], 4)}, ${f(TG[1], 4)})`], ["case", inside ? "interpolation" : "extrapolation"]]);
  };
  $("ip").oninput = u; u();
}},

{s: "11. Held-out test", t: "Training R² 0.76, test R² 0.15: report the held-out number",
intu: String.raw`HW3 Part 8 on the housing data: a seeded split puts 37 houses in training and 10 in test, the model is fitted on the training houses only, and the test houses are scored once at the end. The parity plot puts observed price against predicted, and a perfect model would put every point on the diagonal. On the training houses R² is 0.76. On the ten test houses it is 0.15, although RMSE still beats the training-mean baseline by a third. With only ten houses one unusual sale moves the number a lot, so the honest report is the test result with that caveat, never the training R².`,
eq: String.raw`\[ \hat\theta = \arg\min_\theta \frac{1}{2m_{\text{train}}} \sum_{i \in \text{train}} \left(x^{(i)T}\theta - y^{(i)}\right)^2, \qquad \text{report } R^2_{\text{test}} \]`,
sym: [["train", "37 houses, fit θ and the scaling statistics here"], ["test", "10 houses, touched once after every choice is fixed"], ["parity plot", "observed against predicted, the diagonal is perfect"], ["baseline", "the training mean price, scored on the test houses"], ["sampling uncertainty", "with 10 houses, a single sale can swing R² a lot"]],
how: ["Split first, with a seed: <code>default_rng(5970).permutation(47)</code>.", "Fit the standardizer and θ on the 37 training houses.", "Predict the 10 test houses with the stored θ and statistics.", "Score the model and the training-mean baseline on the same test rows.", "Report test RMSE and R² with the number of test houses."],
say: String.raw`A model must be judged on held-out data it was not fitted to, against a baseline scored on the same rows, and a small test set makes that judgment uncertain.`,
num: String.raw`Train: RMSE <b>$64,968</b>, R² <b>0.757</b>. Test: RMSE <b>$62,120</b>, R² <b>0.146</b>. Baseline on test: RMSE $91,509, R² −0.853. The model beats the baseline, and R² alone would hide that.`,
note: String.raw`The project slides need exactly this table: baseline, training and test, same metric, with the test size stated. Lesson 44 builds it for your own project.`,
r(fig, ctl) {
  const tr = PERM.slice(0, 37), te = PERM.slice(37), X = i => [D2[i][0], D2[i][1]];
  const mu = [0, 1].map(j => tr.reduce((s, i) => s + D2[i][j], 0) / 37), sd = [0, 1].map(j => Math.sqrt(tr.reduce((s, i) => s + (D2[i][j] - mu[j]) ** 2, 0) / 37));
  const Z = i => [1, (D2[i][0] - mu[0]) / sd[0], (D2[i][1] - mu[1]) / sd[1]];
  const th = lstsq(tr.map(Z), tr.map(i => D2[i][2])), pred = i => Z(i).reduce((s, v, j) => s + v * th[j], 0), ybar = tr.reduce((s, i) => s + D2[i][2], 0) / 37;
  let k = 1;
  ctl.innerHTML = btns([[0, "training houses (37)"], [1, "test houses (10)"], [2, "baseline on test"]], "k") + `<div id="ho"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const rows = k === 0 ? tr : te, P = rows.map(i => k === 2 ? ybar : pred(i)), Yr = rows.map(i => D2[i][2]), M = metrics(Yr, P);
    const a = ML.axes(70, 20, 270, 250, { xmin: 100, xmax: 750, ymin: 100, ymax: 750, nx: 5, ny: 5, fx: v => v, fy: v => v, xl: "observed price ($1000)", yl: "predicted ($1000)" });
    let s = a.s + `<line x1="${a.X(100)}" y1="${a.Y(100)}" x2="${a.X(750)}" y2="${a.Y(750)}" stroke="${C.gray}" stroke-dasharray="5 4"/>`;
    rows.forEach((i, j) => s += `<circle cx="${a.X(Yr[j] / 1e3)}" cy="${a.Y(P[j] / 1e3)}" r="${k === 0 ? 3.5 : 5}" fill="${k === 0 ? C.blue : k === 1 ? C.coral : C.amber}" opacity="0.85"/>`);
    const Mt = metrics(tr.map(i => D2[i][2]), tr.map(pred)), Ms = metrics(te.map(i => D2[i][2]), te.map(pred)), Mb = metrics(te.map(i => D2[i][2]), te.map(() => ybar));
    const row = (y, lab, m, on) => tx(380, y, lab, null, on ? "th" : "ts") + tx(530, y, money(m.rmse), "end", on ? "th" : "t") + tx(620, y, f(m.r2, 3), "end", on ? "th" : "t");
    s += tx(380, 44, "rows", null, "th") + tx(530, 44, "RMSE", "end", "th") + tx(620, 44, "R²", "end", "th") + row(68, "train, model", Mt, k === 0) + row(90, "test, model", Ms, k === 1) + row(112, "test, baseline", Mb, k === 2);
    s += tx(380, 150, "θ in standardized units:", null) + tx(380, 168, `(${th.map(v => Math.round(v).toLocaleString("en-US")).join(", ")})`, null, "t") + tx(380, 204, "dashed: perfect predictions", null) + tx(380, 222, "10 test houses: one sale can", null) + tx(380, 238, "move test R² a lot", null);
    fig.innerHTML = svg(300, s);
    $("ho").innerHTML = ML.readout([["these rows", `${rows.length} houses`], ["RMSE", money(M.rmse)], ["R²", f(M.r2, 3)]]);
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "12. With the agent", t: "Do it with the agent: a checked linear regression module",
intu: String.raw`HW3 Part 1 as a module with tests: the intercept column, prediction and cost with shape checks, the closed-form fit through <code>lstsq</code>, metrics with a baseline, and a split function that keeps the test rows out of everything. The tests pin values from these cards, so a missing intercept, a broadcast shape or a leaked test row fails on a number you can verify by hand.`,
eq: String.raw`\[ \texttt{add\_intercept} \to \texttt{predict} \to \texttt{half\_mse\_cost} \to \texttt{fit\_lstsq} \to \texttt{regression\_metrics} \]`,
sym: [["add intercept", "column of ones first, rejects a 1D X"], ["predict", "X @ theta with a shape check"], ["half MSE cost", "errors @ errors / (2m)"], ["fit by lstsq", "np.linalg.lstsq, never an explicit inverse"], ["metrics", "RMSE, MAE, R², with R² = nan for a constant target"]],
how: ["Paste the command.", "Read the fit function: is it <code>lstsq</code> or <code>pinv</code>, not <code>inv</code>?", "Read the metrics: residual is observed minus predicted, R² handles a constant target.", "Run the tests on the toy values and on ex1data1.", "Commit the module with its tests."],
say: String.raw`A regression module checks shapes, fits by a stable least squares solver, reports metrics beside a baseline, and is tested on small cases with answers known by hand.`,
num: String.raw`Tests expect J = <b>1/6</b> on the toy data, θ = <b>(1/3, 1.5)</b> on x = (1, 2, 3), y = (2, 3, 5), θ ≈ (<b>−3.8958, 1.1930</b>) and R² ≈ <b>0.702</b> on ex1data1, and a rank of <b>2</b> for the duplicated column.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/linreg.py using numpy only. Functions: add_intercept(X) that raises ValueError unless X is 2-D and returns np.column_stack([np.ones(len(X)), X]). predict(X, theta) that checks X.shape[1] == theta.shape[0] and returns X @ theta. half_mse_cost(X, y, theta) returning float(e @ e / (2 * m)) with e = predict(X, theta) - y, raising ValueError if y.shape differs from the prediction shape. fit_lstsq(X, y) returning np.linalg.lstsq(X, y, rcond=None)[0]. regression_metrics(y_true, y_pred) returning a dict with rmse, mae and r2 (r2 = nan when y_true is constant), residual = y_true - y_pred. Create tests/test_linreg.py with pytest: half_mse_cost on X = [[1,0],[1,1],[1,2]], y = [1,2,2], theta = [1,1] is 1/6; fit_lstsq on x = [1,2,3], y = [2,3,5] gives [1/3, 1.5]; on data/ex1data1.txt (no header) fit_lstsq gives approximately [-3.8958, 1.1930] and regression_metrics gives r2 approximately 0.702 and rmse approximately 2.992; the mean baseline gives r2 == 0; np.linalg.matrix_rank of [[1,1,10],[1,2,20],[1,3,30]] is 2 and fit_lstsq still reproduces y = [2,4,6]; predict raises ValueError for a theta of the wrong length. Run pytest -q and paste the output.",
    actions: ["$ pytest -q", ".......                                                  [100%]", "7 passed in 0.22s"],
    checks: ["fit_lstsq never calls np.linalg.inv", "predict raises on a wrong theta length instead of broadcasting", "the ex1data1 test loads the file with header=None and the right column order", "regression_metrics uses observed minus predicted and returns nan for a constant target", "the rank-deficient test checks predictions, not the individual coefficients"]
  });
}},

{s: "13. Test", t: "Lesson 15 test: linear regression",
intu: String.raw`Twelve questions on the hypothesis and cost, the cost intuition, the design matrix, the normal equation, projection, rank deficiency, the choice of solver, metrics, extrapolation and held-out evaluation. New numbers, so work them on paper.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Do the arithmetic on paper when a question has numbers.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to gradient descent.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "Data (1, 2), (2, 4) with h(x) = θ₁x and θ₁ = 1. J is", o: ["1.25", "2.5", "5", "0.5"], a: 0, why: "Residuals −1 and −2, squares 1 and 4, sum 5, divided by 2m = 4 gives 1.25. Cards 1 and 2." },
    { q: "For data (1, 1), (2, 2), (3, 3) with θ₀ = 0, J(θ₁) has its minimum at", o: ["θ₁ = 0", "θ₁ = 1", "θ₁ = 0.5", "it has no minimum"], a: 1, why: "J = (14/6)(θ₁ − 1)², a parabola with minimum 0 at θ₁ = 1. Card 2." },
    { q: "Two different (θ₀, θ₁) points lie on the same contour of J. Their lines", o: ["are identical", "have equal cost on the training data", "have equal slopes", "cross at the mean"], a: 1, why: "A contour joins points of equal cost. The lines can look very different. Card 3." },
    { q: "X has shape (50, 4) including the ones column. θ must have shape", o: ["(50,)", "(4,)", "(5,)", "(3,)"], a: 1, why: "One parameter per column of X, so (4,), and Xθ has shape (50,). Card 4." },
    { q: "With m = 3, Σx = 3, Σx² = 5, Σy = 6, Σxy = 8, the normal equations are", o: ["[[3, 3], [3, 5]] θ = (6, 8)", "[[3, 5], [5, 3]] θ = (8, 6)", "[[1, 3], [3, 5]] θ = (6, 8)", "[[3, 3], [3, 5]] θ = (8, 6)"], a: 0, why: "XᵀX = [[m, Σx], [Σx, Σx²]] and Xᵀy = (Σy, Σxy). Card 5." },
    { q: "Solve [[3, 3], [3, 5]] θ = (6, 8).", o: ["θ = (1.5, 0.5)", "θ = (1, 1)", "θ = (2, 0)", "θ = (0.5, 1.5)"], a: 1, why: "det = 15 − 9 = 6, θ = (1/6)(5·6 − 3·8, −3·6 + 3·8) = (1/6)(6, 6) = (1, 1). Check: 3 + 3 = 6 and 3 + 5 = 8. Card 5." },
    { q: "At the least squares solution, Xᵀ(y − Xθ̂) equals", o: ["y", "the zero vector", "Xθ̂", "1"], a: 1, why: "The residual is perpendicular to every column of X. Card 6." },
    { q: "A dataset has a column for length in meters and another for the same length in centimeters. Then", o: ["the fit fails", "XᵀX is singular, the predictions are still fine, but the two coefficients are not unique", "R² becomes negative", "np.linalg.inv gives the best answer"], a: 1, why: "Rank deficiency: a line of minimizers with identical predictions. Use lstsq or pinv. Card 7." },
    { q: "A model has 200,000 features. The practical choice is", o: ["the normal equation", "gradient descent", "either, same cost", "neither"], a: 1, why: "Solving a 200,000 × 200,000 system costs about n³ = 8e15 operations. Card 8." },
    { q: "A model has RMSE 3.0 where the mean baseline has RMSE 6.0 on the same rows. R² is", o: ["0.5", "0.75", "0.25", "2"], a: 1, why: "R² = 1 − SSE/SST = 1 − (3/6)² = 0.75. Card 9." },
    { q: "The training inputs range from 10 to 50. Predicting at x = 80 is", o: ["interpolation", "extrapolation", "invalid code", "a test set"], a: 1, why: "Outside the observed range. The equation gives a number, the data do not support it. Card 10." },
    { q: "Training R² is 0.9 and test R² is 0.2 on 8 test rows. The report should give", o: ["0.9", "0.2 with the test size and a baseline", "the average 0.55", "nothing until R² improves"], a: 1, why: "Held-out performance, its sample size and a baseline on the same rows. Card 11." }
  ], "Lesson 15 test");
}}
],
summary: String.raw`Linear regression predicts with a hypothesis h(x) = θ₀ + θ₁x, and the cost J is half the mean squared residual over the m training examples. Each hypothesis is one point on the cost surface, a parabola in one parameter and an elliptical bowl in two. The design matrix with a ones column turns all predictions into Xθ and the cost into the squared norm of Xθ − y over 2m. Setting the gradient to zero gives the normal equations XᵀXθ = Xᵀy, solved directly with no learning rate, and geometrically the fitted values are the projection of y onto the column space with a residual perpendicular to every column. Dependent columns make XᵀX singular and the minimizer non-unique, so the course uses lstsq or the pseudoinverse, which returns the minimum norm solution. The direct method is right for a few features, gradient descent for many features or any nonlinear model. A fit is judged by RMSE, MAE and R² next to a mean baseline, predictions outside the training range are extrapolations, and the number to report is the held-out test score with its sample size.`,
sheet: [[String.raw`\[ h_\theta(x) = \theta_0 + \theta_1 x = x^T\theta \]`, "the hypothesis, with x₀ = 1"], [String.raw`\[ J(\theta) = \frac{1}{2m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)^2 = \frac{1}{2m}\|X\theta - y\|^2 \]`, "half mean squared error"], [String.raw`\[ X^T X\theta = X^T y, \qquad \theta = (X^TX)^{-1}X^Ty \]`, "the normal equation"], [String.raw`\[ \begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix} \]`, "the 2 × 2 inverse for hand solutions"], [String.raw`\[ X^T(y - X\hat\theta) = 0 \]`, "the residual is orthogonal to the columns"], [String.raw`\[ \theta^{+} = X^{+}y \]`, "pseudoinverse, minimum norm solution when X is rank deficient"], [String.raw`\[ R^2 = 1 - \frac{\sum_i r_i^2}{\sum_i (y_i - \bar y)^2}, \qquad \mathrm{RMSE} = \sqrt{\tfrac{1}{m}\sum_i r_i^2} \]`, "metrics, always beside a baseline"]],
sources: ["AME 5970 Lecture 2 notes, topic order of sections 01 to 06 and 12 onward (model representation, cost function, normal equation, evaluation)", "AME 5970 HW3 Part 1 solutions and the Linear Regression learning guide (Tasks 2.1 to 3.2, 6.1 to 6.3, 8.1 to 8.3, 9.1 to 9.3, the ex1data1 and ex1data2 files)", "Andrew Ng, Machine Learning course, week 1: Model representation, Cost function, Cost function intuition I and II. Week 2: Normal equation, Normal equation noninvertibility", "Andrew Ng, CS229 lecture notes, part I section 2 (the normal equations, matrix derivatives)", "Gilbert Strang, Introduction to Linear Algebra, chapter 4.3 (least squares approximations and projections)"]
});
})();
