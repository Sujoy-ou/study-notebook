/* TODO for this lesson: NEW LESSON, thesis Sec. 3.7. Write big/bridge/summary/sheet/sources from scratch (head and tail copied from the Adam lesson as a placeholder). */
addLesson("thesis", "ch3", {
level: "Advanced",
id: "thesis-ch3-l14", title: "Reported quantities: reading a result", short: "14. Reported quantities",
big: String.raw`The adjoint method delivers a gradient. The optimizer decides how big a step to take along it. Plain gradient descent steps in proportion to the gradient, which fails when parameters differ greatly in sensitivity: a step small enough for the most sensitive parameter barely moves the others. Adam keeps, for every parameter, a running average of its gradient and of its squared gradient, and steps by the ratio of the two. Each parameter thus gets its own effective step size, about the learning rate \(\alpha\), whatever the scale of its gradient. Grating widths, DBR scales, taper points and pixel densities all have very different sensitivities, and Adam treats them on an equal footing.`,
bridge: "This is Ch. 3 Sec. 3.6, the optimizer paragraph, which cites Algorithm 1 of Kingma and Ba 2015 (University of Amsterdam and University of Toronto). All thesis optimizations use Adam through the optax library with its default decay rates 0.9 and 0.999. Michaels and Yablonovitch used BFGS instead. The paths below are computed live on a stretched quadratic bowl.",
cards: [
/* NEW CARD: Grating coupler CE: peak value, peak wavelength, value at 795 nm, on a live spectrum */
{s: "1. Peak and value at the design wavelength", t: "TODO: Grating coupler CE: peak value, peak wavelength, value at 795 nm, on a live spectrum", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: 1 dB bandwidth: range within 1 dB of the peak, read on a 1 nm grid */
{s: "2. The 1 dB bandwidth", t: "TODO: 1 dB bandwidth: range within 1 dB of the peak, read on a 1 nm grid", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: T_target and T_leak for each input polarization */
{s: "3. Splitter transmissions", t: "TODO: T_target and T_leak for each input polarization", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: Extinction ratio and insertion loss Eq. 3.18 */
{s: "4. ER and IL", t: "TODO: Extinction ratio and insertion loss Eq. 3.18", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: Band where both polarizations reach T_target >= 0.8 */
{s: "5. Operating band", t: "TODO: Band where both polarizations reach T_target >= 0.8", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }},

/* NEW CARD: Taper quoted from a separate validation run, not the objective J which includes the penalty */
{s: "6. Validation run", t: "TODO: Taper quoted from a separate validation run, not the objective J which includes the penalty", intu: "TODO", eq: "", sym: [], how: [], say: "TODO", num: "", r(fig, ctl) { fig.innerHTML = "<p class=\"note\">TODO</p>"; }}

],
summary: String.raw`Adam keeps per-parameter running averages of the gradient (decay 0.9) and of its square (decay 0.999), corrects them for starting at zero, and steps by \(\alpha \hat m/(\sqrt{\hat v} + \epsilon)\). The ratio \(\hat m/\sqrt{\hat v}\) is of order one and unchanged when a gradient is rescaled, so every parameter moves by about \(\alpha\) regardless of its sensitivity. That suits inverse design, where widths, layer scales, outline points and pixels differ greatly in sensitivity, and where plain gradient descent would need a step small enough for the most sensitive parameter. \(\alpha\) sets the step size, too large an \(\alpha\) makes the design jump, and like any gradient method Adam finds a local optimum.`,
sheet: [
[String.raw`\[ m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2 \]`, "Moments (Kingma and Ba, Alg. 1)"],
[String.raw`\[ \hat m_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat v_t = \frac{v_t}{1 - \beta_2^t} \]`, "Bias correction"],
[String.raw`\[ \theta_t = \theta_{t-1} - \alpha\, \frac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} \]`, String.raw`Update (gradient ascent: + for maximizing \(J\))`],
[String.raw`\[ \beta_1 = 0.9 \qquad \beta_2 = 0.999 \qquad \epsilon = 10^{-8} \]`, "Defaults, also in optax"],
[String.raw`\[ \text{gradient descent stable for } \alpha \lt 1/S^2 \]`, "Why plain descent fails for ill-scaled parameters"]],
consts: String.raw`Test function \(f = (x - 1)^2 + S^2(y - 0.5)^2\), start \((-1.5, -0.7)\). Thesis objectives are maximized, so the update adds the step.`,
sources: ["Kingma and Ba, Adam: A method for stochastic optimization, ICLR 2015, arXiv:1412.6980 (Algorithm 1, bias correction, invariance to gradient rescaling)", "optax library documentation (adam with default b1 = 0.9, b2 = 0.999, eps = 1e-8)", "Michaels and Yablonovitch, Opt. Express 26, 31717 (2018) (used BFGS for their taper)"]
});
