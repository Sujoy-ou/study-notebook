(function () {
/* ML shelf, Part 2, Lesson 10: pandas and Matplotlib. Follows the audit and plotting style of AME 5970 HW3 (Tasks 1.1, 1.2, 5.1, 6.2) and HW6, using the course's ex1data1 (food truck) and ex1data2 (housing) files from Andrew Ng's ML course. */
const C = ML.C;
const tx = (x, y, t, a, cls) => `<text class="${cls || "ts"}" x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}>${t}</text>`;
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const std = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };
const f = (v, d) => (+v).toFixed(d == null ? 3 : d);
const D1 = [[6.1101,17.592],[5.5277,9.1302],[8.5186,13.662],[7.0032,11.854],[5.8598,6.8233],[8.3829,11.886],[7.4764,4.3483],[8.5781,12.0],[6.4862,6.5987],[5.0546,3.8166],[5.7107,3.2522],[14.164,15.505],[5.734,3.1551],[8.4084,7.2258],[5.6407,0.71618],[5.3794,3.5129],[6.3654,5.3048],[5.1301,0.56077],[6.4296,3.6518],[7.0708,5.3893],[6.1891,3.1386],[20.27,21.767],[5.4901,4.263],[6.3261,5.1875],[5.5649,3.0825],[18.945,22.638],[12.828,13.501],[10.957,7.0467],[13.176,14.692],[22.203,24.147],[5.2524,-1.22],[6.5894,5.9966],[9.2482,12.134],[5.8918,1.8495],[8.2111,6.5426],[7.9334,4.5623],[8.0959,4.1164],[5.6063,3.3928],[12.836,10.117],[6.3534,5.4974],[5.4069,0.55657],[6.8825,3.9115],[11.708,5.3854],[5.7737,2.4406],[7.8247,6.7318],[7.0931,1.0463],[5.0702,5.1337],[5.8014,1.844],[11.7,8.0043],[5.5416,1.0179],[7.5402,6.7504],[5.3077,1.8396],[7.4239,4.2885],[7.6031,4.9981],[6.3328,1.4233],[6.3589,-1.4211],[6.2742,2.4756],[5.6397,4.6042],[9.3102,3.9624],[9.4536,5.4141],[8.8254,5.1694],[5.1793,-0.74279],[21.279,17.929],[14.908,12.054],[18.959,17.054],[7.2182,4.8852],[8.2951,5.7442],[10.236,7.7754],[5.4994,1.0173],[20.341,20.992],[10.136,6.6799],[7.3345,4.0259],[6.0062,1.2784],[7.2259,3.3411],[5.0269,-2.6807],[6.5479,0.29678],[7.5386,3.8845],[5.0365,5.7014],[10.274,6.7526],[5.1077,2.0576],[5.7292,0.47953],[5.1884,0.20421],[6.3557,0.67861],[9.7687,7.5435],[6.5159,5.3436],[8.5172,4.2415],[9.1802,6.7981],[6.002,0.92695],[5.5204,0.152],[5.0594,2.8214],[5.7077,1.8451],[7.6366,4.2959],[5.8707,7.2029],[5.3054,1.9869],[8.2934,0.14454],[13.394,9.0551],[5.4369,0.61705]];
const D2 = [[2104,3,399900],[1600,3,329900],[2400,3,369000],[1416,2,232000],[3000,4,539900],[1985,4,299900],[1534,3,314900],[1427,3,198999],[1380,3,212000],[1494,3,242500],[1940,4,239999],[2000,3,347000],[1890,3,329999],[4478,5,699900],[1268,3,259900],[2300,4,449900],[1320,2,299900],[1236,3,199900],[2609,4,499998],[3031,4,599000],[1767,3,252900],[1888,2,255000],[1604,3,242900],[1962,4,259900],[3890,3,573900],[1100,3,249900],[1458,3,464500],[2526,3,469000],[2200,3,475000],[2637,3,299900],[1839,2,349900],[1000,1,169900],[2040,4,314900],[3137,3,579900],[1811,4,285900],[1437,3,249900],[1239,3,229900],[2132,4,345000],[4215,4,549000],[2162,4,287000],[1664,2,368500],[2238,3,329900],[2567,4,314000],[1200,3,299000],[852,2,179900],[1852,4,299900],[1203,3,239500]];
const POP = D1.map(r => r[0]), PROF = D1.map(r => r[1]);
/* least squares line on the food truck data, used for the diagnostic plots */
const LS = (() => { const mx = mean(POP), my = mean(PROF); const w = POP.reduce((s, x, i) => s + (x - mx) * (PROF[i] - my), 0) / POP.reduce((s, x) => s + (x - mx) ** 2, 0); return { w, b: my - w * mx }; })();
/* a small table with a hole in it, for the cleaning cards */
const SMALL = [["ck-01", 24.0, 0.46, "ok"], ["ck-02", 25.5, null, "ok"], ["ck-03", null, 0.48, "retest"], ["ck-04", 27.8, 0.51, "ok"], ["ck-05", 23.1, 0.44, "ok"], ["ck-06", 26.4, 0.49, "retest"]];
const draftTable = (rows, cols, o) => {
  o = o || {}; const x0 = o.x || 40, y0 = o.y || 40, cw = o.cw || [70, 80, 80, 70], rh = 28;
  let s = tx(x0, y0 - 12, o.title || "", null, "th");
  s += `<rect x="${x0 - 46}" y="${y0}" width="40" height="${rh}" fill="var(--sunk)" stroke="var(--line)"/>` + tx(x0 - 26, y0 + 19, "idx", "middle");
  let x = x0;
  cols.forEach((c, j) => { const on = o.col === j; s += `<rect x="${x}" y="${y0}" width="${cw[j]}" height="${rh}" fill="${on ? "var(--teal-bg)" : "var(--sunk)"}" stroke="${on ? C.teal : "var(--line)"}"/>` + tx(x + cw[j] / 2, y0 + 19, c, "middle", "th"); x += cw[j]; });
  rows.forEach((r, i) => {
    const y = y0 + rh * (i + 1), rowOn = o.row === i;
    s += `<rect x="${x0 - 46}" y="${y}" width="40" height="${rh}" fill="${rowOn ? "var(--teal-bg)" : "var(--panel)"}" stroke="${rowOn ? C.teal : "var(--line)"}"/>` + tx(x0 - 26, y + 19, o.index ? o.index[i] : i, "middle");
    let x = x0;
    r.forEach((v, j) => {
      const on = rowOn || o.col === j || (o.cell && o.cell[0] === i && o.cell[1] === j), bad = v == null, dim = o.dim && o.dim.has(i);
      s += `<rect x="${x}" y="${y}" width="${cw[j]}" height="${rh}" fill="${bad ? "var(--coral-bg)" : on ? "var(--teal-bg)" : "var(--panel)"}" stroke="${bad ? C.coral : on ? C.teal : "var(--line)"}" opacity="${dim ? 0.3 : 1}"/>`;
      s += tx(x + cw[j] / 2, y + 19, bad ? "nan" : typeof v === "number" ? (Number.isInteger(v) && o.dec == null ? v : f(v, o.dec == null ? 2 : o.dec)) : v, "middle", "t");
      x += cw[j];
    });
  });
  return { s, h: y0 + rh * (rows.length + 1) + 10 };
};

addLesson("ml", "py", {
level: "Core", num: "Lesson 10",
id: "ml-py-l10", title: "pandas and Matplotlib", short: "10. pandas and Matplotlib",
big: String.raw`Every homework in the course starts the same way: load a file into a DataFrame, audit it, plot it, and only then convert the columns you need into NumPy arrays. This lesson is that opening. pandas gives you a labelled table with an index, columns and dtypes, and a vocabulary for selecting, cleaning and summarizing it. Matplotlib gives you a Figure holding Axes, and one method per element of a plot. The visuals use the course's own food truck and housing files from HW3, the audit is the professor's Task 1.1 line for line, and the plots follow the HW3 solution style: labelled axes with units, a reference line, a legend without a frame and a title that states the finding.`,
bridge: String.raw`HW3 Tasks 1.1 and 1.2 are the audit and the first scatter plot. Task 5.1 draws the cost history next to the fitted line, and Task 6.2 draws observed versus predicted and the residual diagnostic. HW6 uses the same <code>fig, ax = plt.subplots()</code> pattern with <code>layout="constrained"</code>. Part 4 of this shelf fits the lines these plots are waiting for.`,
labels: { note: "Exam and project note" },
cards: [

{s: "1. The DataFrame", t: "A DataFrame is labelled columns over a shared index",
intu: String.raw`A NumPy array is numbers in a grid. A DataFrame is a grid with names: an index labelling the rows, column names labelling the columns, and one dtype per column, so one table can hold a text id next to floats. Each column on its own is a Series, a one-dimensional labelled array. Click a column header to see its Series, a row label to see one record, or a cell to see how both labels locate it. The professor's convention is to name columns with their units, <code>population_10k</code> and <code>profit_10k_usd</code>, so a plot label can never be wrong about them.`,
eq: String.raw`\[ \texttt{df}[\texttt{col}] \to \text{Series (one column)}, \qquad \texttt{df.loc}[i] \to \text{one row}, \qquad \texttt{df.loc}[i, \texttt{col}] \to \text{one value} \]`,
sym: [["index", "row labels, the integers 0 to n−1 unless you set them"], ["columns", "column labels, strings chosen by you"], ["dtype", "one type per column: float64, int64, object for text, bool"], ["Series", "one column with its index, returned by <code>df[\"name\"]</code>"], ["shape", "(rows, columns), like a 2D array"]],
how: ["A DataFrame is a dict of Series that share one index.", "Selecting a column by name gives a Series. Selecting a list of names gives a smaller DataFrame.", "Rows are reached through the index with .loc, or by position with .iloc.", "Each column has its own dtype. A text column has dtype object and cannot go into a model as it is.", "Name columns with units. The names flow into axis labels and into the project report."],
say: String.raw`A DataFrame is a set of named columns sharing one index, each column a Series with its own dtype, and the names are what make the audit and the plots self-describing.`,
num: String.raw`HW3's food truck table has shape <b>(97, 2)</b>, both columns <b>float64</b>. The housing table has shape <b>(47, 3)</b>: <code>size_sqft</code>, <code>bedrooms</code>, <code>price_usd</code>.`,
r(fig, ctl) {
  const rows = D1.slice(0, 6), cols = ["population_10k", "profit_10k_usd"];
  let sel = { kind: "col", j: 0 };
  ctl.innerHTML = `<div id="dfx"></div>`;
  const u = () => {
    const o = { x: 110, y: 40, cw: [150, 150], dec: 4, title: "food_truck.head(6)" };
    if (sel.kind === "col") o.col = sel.j; else if (sel.kind === "row") o.row = sel.i; else o.cell = [sel.i, sel.j];
    const t = draftTable(rows, cols, o);
    let s = t.s;
    const bx = 440;
    if (sel.kind === "col") s += ML.box(bx, 40, 220, 70, "c-teal", ["Series", `food_truck["${cols[sel.j]}"]`, "dtype float64, length 97"]) ;
    else if (sel.kind === "row") s += ML.box(bx, 40, 220, 70, "c-teal", ["one row (a Series)", `food_truck.loc[${sel.i}]`, `index labels are the column names`]);
    else s += ML.box(bx, 40, 220, 70, "c-teal", ["one value", `food_truck.loc[${sel.i}, "${cols[sel.j]}"]`, `= ${f(rows[sel.i][sel.j], 4)}`]);
    s += tx(bx, 140, "columns: " + JSON.stringify(cols).replace(/"/g, "'"), null) + tx(bx, 160, "index: RangeIndex(0 to 96)", null) + tx(bx, 180, "shape: (97, 2)", null);
    s += tx(bx, 210, "click a header, an index label, or a cell", null);
    /* clickable overlays */
    cols.forEach((c, j) => s += `<rect data-sel="col,${j}" x="${110 + j * 150}" y="40" width="150" height="28" fill="transparent" style="cursor:pointer"/>`);
    rows.forEach((r, i) => { s += `<rect data-sel="row,${i}" x="64" y="${68 + i * 28}" width="40" height="28" fill="transparent" style="cursor:pointer"/>`; cols.forEach((c, j) => s += `<rect data-sel="cell,${i},${j}" x="${110 + j * 150}" y="${68 + i * 28}" width="150" height="28" fill="transparent" style="cursor:pointer"/>`); });
    fig.innerHTML = svg(t.h + 10, s) + ML.code(["import pandas as pd", 'food_truck = pd.read_csv("ex1data1.txt", header=None,', '                         names=["population_10k", "profit_10k_usd"])', sel.kind === "col" ? `col = food_truck["${cols[sel.j]}"]` : sel.kind === "row" ? `row = food_truck.loc[${sel.i}]` : `v = food_truck.loc[${sel.i}, "${cols[sel.j]}"]`], 3);
    fig.querySelectorAll("rect[data-sel]").forEach(e => e.onclick = () => { const p = e.dataset.sel.split(","); sel = p[0] === "col" ? { kind: "col", j: +p[1] } : p[0] === "row" ? { kind: "row", i: +p[1] } : { kind: "cell", i: +p[1], j: +p[2] }; u(); });
    $("dfx").innerHTML = ML.readout([["type", sel.kind === "cell" ? "numpy.float64" : "pandas.Series"], ["length or shape", sel.kind === "col" ? "97" : sel.kind === "row" ? "2" : "scalar"]]);
  };
  u();
}},

{s: "2. The audit", t: "Load, then audit before you model",
intu: String.raw`The HW3 solution opens with one rule: a model cannot repair a misunderstood dataset, so start with shape, dtypes, missing values, finiteness, ranges and a plot. Step through the professor's Task 1.1 audit on the real food truck file. Each step is one line of pandas and the exact output it prints, ending with the assertions that turn the audit into a test: 97 rows, two numeric columns, every value finite. Write this block once for your project data and keep it at the top of the notebook.`,
eq: String.raw`\[ \texttt{head()} \to \texttt{dtypes} \to \texttt{isna().sum()} \to \texttt{np.isfinite(...).all()} \to \texttt{agg([min, mean, max])} \to \texttt{assert} \]`,
sym: [["head(n)", "the first n rows, default 5"], ["dtypes", "one dtype per column"], ["isna().sum()", "count of missing values per column"], ["to NumPy", "<code>to_numpy(dtype=float)</code>, the values as a float array, which fails loudly on text"], ["agg([...])", "several summary statistics per column in one table"]],
how: ["Read with header=None and your own names when the file has no header row.", "Print head() and look: are the numbers in the columns you expect?", "Print dtypes: a column that should be float but reads as object has text in it.", "Count missing values per column, then check every numeric value is finite (NaN and inf both fail).", "Print min, mean and max per column and compare with the stored units.", "Assert the shape and the dtypes so the notebook stops if the file changes."],
say: String.raw`The audit is six lines that confirm shape, types, missing values, finiteness and ranges before any model sees the data, and the assertions make it rerun automatically.`,
num: String.raw`Food truck audit: population ranges <b>5.03 to 22.20</b> (mean 8.16), profit ranges <b>−2.68 to 24.15</b> (mean 5.84), <b>0 missing</b>, all finite, shape <b>(97, 2)</b>.`,
note: String.raw`The HW3 solution prints this audit and then asserts <code>food_truck.shape == (97, 2)</code>. The project rubric gives 80 % to commented code, and an audit block with assertions is the first thing a grader sees working.`,
r(fig, ctl) {
  const code = ['food_truck = pd.read_csv(path, header=None, names=["population_10k", "profit_10k_usd"])', "print(food_truck.head())", "print(food_truck.dtypes)", "print(food_truck.isna().sum())", "numeric = food_truck.to_numpy(dtype=float)", "all_finite = bool(np.isfinite(numeric).all())", 'summary = food_truck.agg(["min", "mean", "max"])', "assert food_truck.shape == (97, 2)", "assert all_finite", "assert all(pd.api.types.is_numeric_dtype(d) for d in food_truck.dtypes)"];
  const steps = [[0, ["Loaded ex1data1.txt: 97 rows x 2 columns"], "read_csv with explicit names because the file has no header"], [1, ["   population_10k  profit_10k_usd", "0          6.1101         17.5920", "1          5.5277          9.1302", "2          8.5186         13.6620", "3          7.0032         11.8540", "4          5.8598          6.8233"], "head(): the first five rows with the index on the left"], [2, ["population_10k    float64", "profit_10k_usd    float64", "dtype: object"], "both columns parsed as floats, so no text crept in"], [3, ["population_10k    0", "profit_10k_usd    0", "dtype: int64"], "isna() is a bool table, sum() counts True per column"], [5, ["All values finite: True"], "np.isfinite catches NaN and inf in one pass"], [6, ["      population_10k  profit_10k_usd", "min           5.027          -2.681", "mean          8.160           5.839", "max          22.203          24.147"], "agg returns a small DataFrame: statistics as rows"], [9, ["(no output: all three assertions passed)"], "assertions turn the audit into a regression test"]];
  ctl.innerHTML = "";
  const draw = k => {
    const st = steps[k];
    fig.innerHTML = ML.code(code, st[0]) + ML.term(st[1]) + `<p class="note">${st[2]}</p>`;
  };
  ML.stepper(ctl, steps.length, draw, steps.map(s => "line " + (s[0] + 1)));
}},

{s: "3. Selecting", t: "Columns by name, rows by label or position, rows by rule",
intu: String.raw`Four ways to take a piece of a table, and each returns a different thing. A name in square brackets gives one Series. A list of names gives a DataFrame with those columns. <code>.loc</code> selects by label and <code>.iloc</code> by integer position, and the two differ as soon as the index is not 0 to n−1. A boolean Series in square brackets keeps the rows where the rule is True, exactly like a NumPy mask, and the index labels of the survivors come along. Pick an expression and watch which cells light up.`,
eq: String.raw`\[ \texttt{df[c]} \to \text{Series}, \quad \texttt{df[[c\_1, c\_2]]} \to \text{DataFrame}, \quad \texttt{df.loc[rows, cols]}, \quad \texttt{df[df[c] }\gt\texttt{ t]} \to \text{filtered rows} \]`,
sym: [["df[\"c\"]", "one column as a Series"], ["df[[\"a\", \"b\"]]", "two columns as a DataFrame, note the double brackets"], [".loc[label, col]", "by index label and column name, end inclusive in slices"], [".iloc[i, j]", "by integer position, end exclusive in slices"], ["boolean mask", "a Series of True and False aligned on the index"]],
how: ["Single brackets with a string: Series. Double brackets: DataFrame.", ".loc uses the labels you see printed. .iloc counts positions from 0.", "A comparison on a column gives a boolean Series. Combine rules with & and |, each in parentheses.", "df[mask] keeps rows. The index keeps its old labels, so use <code>reset_index(drop=True)</code> if you need 0 to n−1 again.", "Selection returns a view or a copy depending on the case. Assign with .loc[rows, col] = value to be safe."],
say: String.raw`Single brackets select a column, double brackets a sub-table, loc works by label, iloc by position, and a boolean Series filters rows while keeping their labels.`,
num: String.raw`On the housing table, <code>housing[housing["bedrooms"] == 4]</code> keeps <b>14 of 47</b> rows. <code>housing.iloc[0:3]</code> gives rows at positions 0, 1, 2. <code>housing.loc[0:3]</code> gives labels 0 to 3, which is <b>4 rows</b>.`,
r(fig, ctl) {
  const rows = D2.slice(0, 7), cols = ["size_sqft", "bedrooms", "price_usd"];
  const EX = [['housing["price_usd"]', { col: 2 }, "Series, 47 values, dtype int64"], ['housing[["size_sqft", "bedrooms"]]', { cols: [0, 1] }, "DataFrame (47, 2)"], ["housing.loc[2, \"price_usd\"]", { cell: [2, 2] }, "scalar 369000"], ["housing.iloc[0:3]", { rowsOn: [0, 1, 2] }, "DataFrame (3, 3): positions 0, 1, 2"], ["housing.loc[0:3]", { rowsOn: [0, 1, 2, 3] }, "DataFrame (4, 3): labels 0 to 3 inclusive"], ['housing[housing["bedrooms"] == 4]', { rule: r => r[1] === 4 }, "DataFrame (14, 3) over the whole file, 2 rows in this preview"], ['housing[(housing["size_sqft"] > 2000) & (housing["bedrooms"] <= 3)]', { rule: r => r[0] > 2000 && r[1] <= 3 }, "DataFrame: both rules must hold"]];
  let k = 0;
  ctl.innerHTML = btns(EX.map((e, i) => [i, ["column", "two columns", "one cell", "iloc 0:3", "loc 0:3", "mask ==", "mask &"][i]]), "k") + `<div id="sx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const e = EX[k][1], o = { x: 110, y: 40, cw: [110, 100, 120], title: "housing (first 7 rows)" };
    let s = "";
    if (e.col != null) o.col = e.col;
    if (e.cell) o.cell = e.cell;
    if (e.rowsOn || e.rule) { const keep = new Set(rows.map((r, i) => (e.rowsOn ? e.rowsOn.includes(i) : e.rule(r)) ? i : -1).filter(i => i >= 0)); o.dim = new Set(rows.map((r, i) => i).filter(i => !keep.has(i))); }
    const t = draftTable(rows, cols, o);
    s += t.s;
    if (e.cols) e.cols.forEach(j => s += `<rect x="${110 + [0, 110, 210][j]}" y="40" width="${[110, 100, 120][j]}" height="${28 * 8}" fill="none" stroke="${C.teal}" stroke-width="2"/>`);
    s += tx(470, 60, "returns", null, "th") + tx(470, 82, EX[k][2], null);
    if (k === 5 || k === 6) { s += tx(470, 112, "mask (first 7):", null, "th"); rows.forEach((r, i) => s += tx(470, 134 + i * 18, `${i}  ${e.rule(r) ? "True" : "False"}`, null, "t")); }
    fig.innerHTML = svg(t.h + 10, s) + ML.code(["import pandas as pd", 'housing = pd.read_csv("ex1data2.txt", header=None, names=["size_sqft", "bedrooms", "price_usd"])', "out = " + EX[k][0]], 2);
    $("sx").innerHTML = `<p class="note">${k === 4 ? "<b>The loc trap.</b> Label slices are inclusive at both ends, so 0:3 is four rows. Position slices with iloc stop before the end, like Python lists." : k === 1 ? "Double brackets: the inner list is the list of column names, the outer brackets do the selecting." : k >= 5 ? "The mask is a Series aligned on the index. Rows where it is True survive and keep their labels." : "Single brackets with one name give a Series, which is what you pass to a plot or to NumPy."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "4. Missing values", t: "Find the holes, then decide: drop, fill, or flag",
intu: String.raw`Real project files have holes. pandas marks them NaN (NumPy prints nan) and every statistic quietly skips them, which is convenient and dangerous: a mean over 40 rows looks like a mean over 47. The audit counts the holes. Then you choose. Dropping rows loses whole records. Filling with the column mean keeps the rows but invents values, so keep a boolean flag column that records which values were observed. Click each choice on a small inspection table and see what the table becomes and what the mean of the thickness column does.`,
eq: String.raw`\[ \texttt{isna()} \to \text{bool table}, \quad \texttt{dropna()} \to \text{fewer rows}, \quad \texttt{fillna(m)} \to \text{invented values} \]`,
sym: [["NaN", "not a number, the float marker pandas uses for missing"], ["isna()", "True where missing, same shape as the table"], ["dropna()", "drop any row with a missing value, or subset=[...] for chosen columns"], ["fillna(value)", "replace missing values, often with a training mean or median"], ["flag column", "a bool column that remembers which values were filled"]],
how: ["Count holes per column with isna().sum(). A table with zero is the goal, not the assumption.", "Decide per column. A missing id is a broken row. A missing measurement might be filled.", "Fill with statistics from the training rows only, the same leakage rule as standardization.", "Add observed flags before filling, so the model or the report can treat filled values differently.", "Never fill a target. A row without a label is not a training example."],
say: String.raw`NaN is skipped silently by pandas statistics, so count the holes, drop or fill them deliberately, fill from training statistics only, and keep a flag that says which values were invented.`,
num: String.raw`In the inspection table, thickness has <b>one</b> missing value and ratio has <b>one</b>. dropna() keeps <b>4 of 6</b> rows. The thickness mean is <b>25.36</b> over the 5 observed values, and filling with it leaves the mean unchanged by construction.`,
note: String.raw`HW3's audit ends with <code>assert all_finite</code>. If your project data cannot pass it, the cleaning choices you make here go in the PowerPoint, because the grader will ask.`,
r(fig, ctl) {
  const cols = ["sample", "thick_mm", "ratio", "status"];
  const th = SMALL.map(r => r[1]).filter(v => v != null), m = mean(th);
  const OPS = [["isna()", "flag"], ["dropna()", "drop"], ["fillna(mean)", "fill"], ["flag then fill", "both"]];
  let k = 0;
  ctl.innerHTML = btns(OPS.map((o, i) => [i, o[0]]), "k") + `<div id="mx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const op = OPS[k][1];
    let s = draftTable(SMALL, cols, { x: 80, y: 40, cw: [60, 70, 60, 60], dec: 2, title: "inspection" }).s;
    let out, oc = cols, code, note;
    if (op === "flag") { out = SMALL.map(r => r.map(v => v == null ? "True" : "False")); code = "print(df.isna())\nprint(df.isna().sum())"; note = "A bool table the same shape. sum() over it gives thick_mm 1, ratio 1."; }
    else if (op === "drop") { out = SMALL.filter(r => r.every(v => v != null)); code = "clean = df.dropna()\nprint(clean.shape)"; note = "Two rows gone, including ck-02 whose thickness was fine. The index keeps the labels 0, 3, 4, 5."; }
    else if (op === "fill") { out = SMALL.map(r => [r[0], r[1] == null ? m : r[1], r[2] == null ? 0.476 : r[2], r[3]]); code = "means = train[[\"thick_mm\", \"ratio\"]].mean()\nfilled = df.fillna(means)"; note = "Same six rows, two invented numbers, and nothing in the table says which ones."; }
    else { oc = ["sample", "thick_mm", "thick_obs", "ratio"]; out = SMALL.map(r => [r[0], r[1] == null ? m : r[1], r[1] == null ? "False" : "True", r[2] == null ? 0.476 : r[2]]); code = "df[\"thick_obs\"] = df[\"thick_mm\"].notna()\ndf[\"thick_mm\"] = df[\"thick_mm\"].fillna(train[\"thick_mm\"].mean())"; note = "The flag column keeps the truth. A model can use it, and a report can count how many values were filled."; }
    const t2 = draftTable(out, oc, { x: 410, y: 40, cw: [60, 68, 66, 66], dec: 2, title: "after " + OPS[k][0], index: op === "drop" ? [0, 3, 4, 5] : undefined });
    s += t2.s + arrow(336, 150, 360, 150, C.teal, 2);
    fig.innerHTML = svg(Math.max(t2.h, 260), s) + ML.code(code.split("\n"), -1);
    $("mx").innerHTML = ML.readout([["thick_mm mean", op === "drop" ? f(mean(out.map(r => r[1])), 2) + " over 4 rows" : f(m, 2) + (op === "flag" ? " over 5 observed" : " over 6, one filled")], ["rows", String(out.length)]]) + `<p class="note">${note}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "5. Summaries and groups", t: "describe, sort_values and groupby: the questions a table can answer",
intu: String.raw`Before fitting anything, ask the table simple questions. <code>describe()</code> gives count, mean, std, quartiles and extremes per column in one call. <code>sort_values</code> orders rows by a column so the extremes have names. <code>groupby</code> splits the rows by the values of one column, applies a statistic to each group and stacks the results: the housing file grouped by bedrooms gives the mean price for 1, 2, 3, 4 and 5 bedrooms, and the counts show that two of those groups hold a single house, which no mean should be trusted on. Click each question.`,
eq: String.raw`\[ \texttt{df.groupby(key)[col].agg([mean, count])} \qquad \text{split} \to \text{apply} \to \text{combine} \]`,
sym: [["describe()", "count, mean, std, min, quartiles, max per numeric column"], ["sort by a column", "<code>sort_values(col)</code>, rows ordered by that column, ascending unless told otherwise"], ["groupby(key)", "split the rows by each distinct value of key"], ["agg", "apply one or more statistics to each group"], ["count", "the number of rows behind each statistic, always report it"]],
how: ["describe() is the audit's range summary with quartiles added. Read std against the mean.", "<code>sort_values</code> with ascending=False puts the largest first. head(3) after it names the top three.", "groupby(key)[col].mean() returns a Series indexed by the group values.", "Pass a list to agg to get mean and count side by side. A group of one has no spread.", "<code>value_counts()</code> on a column is groupby plus count for a single column."],
say: String.raw`describe summarizes every column, <code>sort_values</code> names the extremes, and groupby splits the rows by a key and applies a statistic per group, always next to the count behind it.`,
num: String.raw`Housing grouped by bedrooms: mean price <b>169,900</b> (1 house), <b>280,867</b> (6), <b>326,404</b> (25), <b>377,450</b> (14), <b>699,900</b> (1). The 5-bedroom mean is one house, not a trend.`,
r(fig, ctl) {
  const Q = ["describe()", "sort_values", "groupby mean", "groupby agg", "value_counts"];
  let k = 0;
  ctl.innerHTML = btns(Q.map((q, i) => [i, q]), "k") + `<div id="gx"></div>`;
  const sizes = D2.map(r => r[0]), prices = D2.map(r => r[2]);
  const groups = {}; D2.forEach(r => { (groups[r[1]] = groups[r[1]] || []).push(r[2]); });
  const keys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const q = a => { const s = [...a].sort((x, y) => x - y), p = t => { const i = (s.length - 1) * t, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); }; return [p(0.25), p(0.5), p(0.75)]; };
  const u = () => {
    pick(ctl, "k", k);
    let s = "", code, term, note;
    if (k === 0) {
      const qs = q(sizes), qp = q(prices);
      code = ["print(housing.describe().round(1))"];
      term = ["       size_sqft  bedrooms  price_usd", `count       47.0      47.0       47.0`, `mean      ${f(mean(sizes), 1)}       3.2   ${f(mean(prices), 1)}`, `std        ${f(std(sizes) * Math.sqrt(47 / 46), 1)}       0.8   ${f(std(prices) * Math.sqrt(47 / 46), 1)}`, `min        852.0       1.0   169900.0`, `25%       ${f(qs[0], 1)}       3.0   ${f(qp[0], 1)}`, `50%       ${f(qs[1], 1)}       3.0   ${f(qp[1], 1)}`, `75%       ${f(qs[2], 1)}       4.0   ${f(qp[2], 1)}`, `max       4478.0       5.0   699900.0`];
      note = "pandas std uses n−1 in the denominator. NumPy's default uses n. Say which one you report.";
      s += tx(20, 24, "std against mean: size varies by about 40 % of its mean, price by about 36 %", null);
      const a = ML.axes(60, 52, 580, 140, { xmin: 800, xmax: 4600, ymin: 0, ymax: 1, nx: 4, ny: 1, fy: () => "", xl: "size_sqft", grid: false });
      s += a.s; sizes.forEach(x => s += `<circle cx="${a.X(x)}" cy="${122 + (Math.random() - 0.5) * 50}" r="4" fill="${C.blue}" opacity="0.6"/>`);
      [["min", 852], ["25%", qs[0]], ["50%", qs[1]], ["75%", qs[2]], ["max", 4478]].forEach(([l, v]) => s += `<line x1="${a.X(v)}" y1="54" x2="${a.X(v)}" y2="190" stroke="${C.coral}" stroke-dasharray="3 3"/>` + tx(a.X(v), 46, l, "middle"));
    } else if (k === 1) {
      const top = [...D2].sort((a, b) => b[2] - a[2]).slice(0, 3), idx = top.map(r => D2.indexOf(r));
      code = ['top = housing.sort_values("price_usd", ascending=False).head(3)', "print(top)"];
      term = ["    size_sqft  bedrooms  price_usd", ...top.map((r, i) => `${String(idx[i]).padStart(2)}       ${String(r[0]).padStart(4)}         ${r[1]}     ${r[2]}`)];
      note = "The index labels survive sorting, so you can trace the top rows back to the file.";
      s += draftTable(top, ["size_sqft", "bedrooms", "price_usd"], { x: 110, y: 40, cw: [110, 100, 120], title: "largest three prices", index: idx }).s;
    } else if (k === 2 || k === 3) {
      code = k === 2 ? ['by_bed = housing.groupby("bedrooms")["price_usd"].mean()', "print(by_bed.round(0))"] : ['by_bed = housing.groupby("bedrooms")["price_usd"].agg(["mean", "count"])', "print(by_bed.round(0))"];
      term = k === 2 ? ["bedrooms", ...keys.map(b => `${b}    ${f(mean(groups[b]), 0)}`), "Name: price_usd, dtype: float64"] : ["              mean  count", "bedrooms", ...keys.map(b => `${b}         ${f(mean(groups[b]), 0).padStart(8)}      ${groups[b].length}`)];
      note = k === 2 ? "Split by bedrooms, mean per group, one Series indexed by the group key." : "With the count beside the mean, the 1 and 5 bedroom rows are visibly single houses.";
      const a = ML.axes(80, 30, 520, 190, { xmin: 0.5, xmax: 5.5, ymin: 0, ymax: 750000, nx: 5, ny: 3, fx: v => Math.round(v), fy: v => Math.round(v / 1000) + "k", xl: "bedrooms", yl: "price_usd" });
      s += a.s;
      D2.forEach(r => s += `<circle cx="${a.X(r[1] + (Math.random() - 0.5) * 0.3)}" cy="${a.Y(r[2])}" r="3.5" fill="${C.blue}" opacity="0.45"/>`);
      keys.forEach(b => { const m = mean(groups[b]); s += `<line x1="${a.X(b - 0.3)}" y1="${a.Y(m)}" x2="${a.X(b + 0.3)}" y2="${a.Y(m)}" stroke="${C.coral}" stroke-width="3"/>`; if (k === 3) s += tx(a.X(b), a.Y(m) - 8, "n=" + groups[b].length, "middle"); });
      s += tx(340, 252, "blue: houses, coral: group mean", "middle");
    } else {
      code = ['print(housing["bedrooms"].value_counts().sort_index())'];
      term = ["bedrooms", ...keys.map(b => `${b}    ${groups[b].length}`), "Name: count, dtype: int64"];
      note = "value_counts is the one-column shortcut for groupby plus size. sort_index puts the keys in order.";
      const a = ML.axes(80, 30, 520, 190, { xmin: 0.5, xmax: 5.5, ymin: 0, ymax: 30, nx: 5, ny: 3, fx: v => Math.round(v), fy: v => Math.round(v), xl: "bedrooms", yl: "count" });
      s += a.s; keys.forEach(b => s += `<rect x="${a.X(b - 0.3)}" y="${a.Y(groups[b].length)}" width="${a.X(b + 0.3) - a.X(b - 0.3)}" height="${a.Y(0) - a.Y(groups[b].length)}" fill="${C.teal}" opacity="0.8"/>` + tx(a.X(b), a.Y(groups[b].length) - 6, groups[b].length, "middle"));
    }
    fig.innerHTML = svg(k === 1 ? 180 : 262, s) + ML.code(code, -1) + ML.term(term);
    $("gx").innerHTML = `<p class="note">${note}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "6. Table to arrays", t: "From DataFrame to X and y, then to a seeded split",
intu: String.raw`Models take arrays, not tables. The handoff is two lines: the feature columns, selected by name, become <code>X</code> through <code>to_numpy(dtype=float)</code>, and the target column becomes <code>y</code>. Selecting by name is the point. If a column is added to the file, a positional slice would silently pick the wrong feature. The HW3 solution then splits with a seeded permutation, 80 % train, and fits the standardization statistics on the training rows only. Step through the shapes.`,
eq: String.raw`\[ X = \texttt{df[[f\_1, f\_2]].to\_numpy(dtype=float)} \in \mathbb{R}^{47 \times 2} \] \[ y = \texttt{df[t].to\_numpy(dtype=float)} \in \mathbb{R}^{47} \]`,
sym: [["feature list", "a Python list of column names, written once and reused"], ["array conversion", "<code>to_numpy(dtype=float)</code>, the values as an ndarray with dtype forced to float"], ["y shape (n,)", "a 1D target, which most of the course's code expects"], ["permutation", "a seeded shuffle of the row positions"], ["cut point", "<code>split_at = int(0.8 * n)</code>, the first train rows of the permutation"]],
how: ["Write <code>features = [\"size_sqft\", \"bedrooms\"]</code> and <code>target = \"price_usd\"</code> at the top.", "<code>X = housing[features].to_numpy(dtype=float)</code>. Shape (47, 2).", "<code>y = housing[target].to_numpy(dtype=float)</code>. Shape (47,). Keep it 1D unless a loss needs (n, 1).", "Permute the positions with a seeded generator, cut at 80 %, index X and y with the two position arrays.", "Fit mean and std on X[train] only, apply to both halves. This is Lesson 9 card 7 again."],
say: String.raw`Select features and target by name, convert with <code>to_numpy</code> as float, split the row positions with a seeded permutation, and fit every statistic on the training rows alone.`,
num: String.raw`Housing: X is <b>(47, 2)</b>, y is <b>(47,)</b>, <code>split_at</code> = int(0.8 × 47) = <b>37</b> training rows and <b>10</b> test rows.`,
r(fig, ctl) {
  const code = ['features = ["size_sqft", "bedrooms"]', 'target = "price_usd"', "X = housing[features].to_numpy(dtype=float)", "y = housing[target].to_numpy(dtype=float)", "rng = np.random.default_rng(5970)", "order = rng.permutation(len(housing))", "split_at = int(0.80 * len(housing))", "train_idx, test_idx = order[:split_at], order[split_at:]", "X_train, X_test = X[train_idx], X[test_idx]", "y_train, y_test = y[train_idx], y[test_idx]", "mu, sigma = X_train.mean(axis=0), X_train.std(axis=0)"];
  const rows = D2.slice(0, 5);
  const steps = [[2, "table to X", () => { const t = draftTable(rows, ["size_sqft", "bedrooms", "price_usd"], { x: 100, y: 40, cw: [100, 90, 110], title: "housing", cols: [0, 1] }); let s = t.s; [0, 1].forEach(j => s += `<rect x="${100 + [0, 100][j]}" y="40" width="${[100, 90][j]}" height="168" fill="none" stroke="${C.teal}" stroke-width="2"/>`); s += arrow(410, 120, 440, 120, C.teal, 2) + ML.grid(rows.map(r => [r[0], r[1]]), { x: 470, y: 50, cell: 36, title: "X (47, 2) float" }).s; return svg(240, s); }],
    [3, "table to y", () => { const t = draftTable(rows, ["size_sqft", "bedrooms", "price_usd"], { x: 100, y: 40, cw: [100, 90, 110], title: "housing", col: 2 }); let s = t.s + arrow(410, 120, 440, 120, C.teal, 2) + ML.grid(rows.map(r => [r[2]]), { x: 480, y: 50, cell: 36, title: "y (47,) float", colLab: false }).s; return svg(240, s); }],
    [5, "seeded permutation", () => { let s = tx(20, 30, "order = a shuffle of the positions 0 to 46, the same every run because the seed is 5970", null); const ex = [12, 40, 3, 27, 45, 8, 31, 19]; ex.forEach((v, i) => s += `<rect x="${20 + i * 60}" y="50" width="54" height="36" rx="5" fill="var(--sunk)" stroke="var(--line)"/>` + tx(47 + i * 60, 73, v, "middle", "t")); s += tx(520, 73, "... (47 values)", null); s += tx(20, 120, "each position appears exactly once, so no row is in both halves", null); return svg(140, s); }],
    [7, "cut at 80 %", () => { let s = tx(20, 30, "split_at = int(0.8 × 47) = 37", null, "th"); s += `<rect x="20" y="50" width="${37 * 13}" height="40" rx="5" fill="var(--teal-bg)" stroke="${C.teal}"/>` + tx(20 + 37 * 6.5, 75, "train_idx: 37 positions", "middle", "th"); s += `<rect x="${20 + 37 * 13 + 4}" y="50" width="${10 * 13}" height="40" rx="5" fill="var(--coral-bg)" stroke="${C.coral}"/>` + tx(20 + 37 * 13 + 4 + 65, 75, "test: 10", "middle", "th"); s += tx(20, 120, "order[:37] and order[37:] slice the permutation, not the table", null); return svg(140, s); }],
    [9, "index the arrays", () => { let s = ""; [["X_train", "(37, 2)", 20], ["X_test", "(10, 2)", 180], ["y_train", "(37,)", 340], ["y_test", "(10,)", 500]].forEach(([n, sh, x], i) => s += ML.box(x, 30, 140, 60, i % 2 ? "c-coral" : "c-teal", [n, sh])); s += tx(340, 120, "X[train_idx] picks rows by position: fancy indexing from Lesson 8", "middle"); return svg(140, s); }],
    [10, "fit on train only", () => { const tr = D2.slice(0, 37); const mu = [mean(tr.map(r => r[0])), mean(tr.map(r => r[1]))]; let s = tx(20, 30, "mu and sigma have shape (2,): one per feature, computed from X_train only", null); s += ML.box(20, 50, 300, 60, "c-teal", ["mu ≈ [" + f(mu[0], 1) + ", " + f(mu[1], 2) + "]", "from the 37 training rows"]) + ML.box(360, 50, 300, 60, "c-coral", ["X_test is transformed with the same mu, sigma", "never refitted"]); s += tx(340, 140, "the exact numbers depend on which rows the seed put in train", "middle"); return svg(160, s); }]];
  ctl.innerHTML = "";
  ML.stepper(ctl, steps.length, k => { fig.innerHTML = steps[k][2]() + ML.code(code, steps[k][0]); }, steps.map(s => s[1]));
}},

{s: "7. Anatomy of a plot", t: "Figure, Axes, and one method per element",
intu: String.raw`A Matplotlib plot is a Figure holding one or more Axes, and everything you see is a method call on the Axes. The HW3 solution style, which you should copy, is the object interface: <code>fig, ax = plt.subplots()</code>, then <code>ax.scatter</code>, <code>ax.axhline</code>, <code>ax.set(...)</code>, <code>ax.legend(frameon=False)</code>, <code>plt.tight_layout()</code>. Toggle each element on the food truck scatter and watch the matching line appear in the code. A plot without axis labels and units is wrong in this course, whatever it shows.`,
eq: String.raw`\[ \text{Figure} \supset \text{Axes} \ni \{\text{scatter},\ \text{axhline},\ \text{xlabel},\ \text{ylabel},\ \text{title},\ \text{legend}\} \]`,
sym: [["Figure", "the whole canvas, sized with figsize in inches"], ["Axes", "one plotting area with its own x and y axis"], ["ax.scatter(x, y, s, color, alpha)", "points, with marker size, color and transparency"], ["ax.axhline(y)", "a horizontal reference line across the Axes"], ["ax.set(xlabel, ylabel, title)", "several properties in one call"], ["tidy layout", "<code>plt.tight_layout()</code> fixes the margins so labels are not clipped"]],
how: ["fig, ax = plt.subplots(figsize=(7.2, 4.4)). One Figure, one Axes.", "Draw data with ax.scatter or ax.plot. Give each a label= so the legend can name it.", "Add reference lines with ax.axhline or ax.axvline, dashed, in a muted color.", "ax.set(xlabel=..., ylabel=..., title=...). Labels carry units. The title states the finding.", "<code>ax.legend(frameon=False)</code>, <code>plt.tight_layout()</code>, then <code>plt.show()</code> or <code>fig.savefig(path, dpi=150)</code>."],
say: String.raw`Make a Figure and an Axes with subplots, draw on the Axes with one method per element, label with units, state the finding in the title, and tidy the layout before saving.`,
num: String.raw`HW3 Task 1.2's title is a sentence, <b>Profit generally increases with city population</b>, and the axes read <b>City population (10,000 people)</b> and <b>Food-truck profit ($10,000)</b>.`,
note: String.raw`The project PowerPoint is 20 % of the grade and every figure in it should come out of this template: units on both axes, a finding in the title, a legend without a frame.`,
r(fig, ctl) {
  const EL = [["points", true], ["zero line", false], ["axis labels", false], ["title", false], ["legend", false]];
  const on = EL.map(e => e[1]);
  ctl.innerHTML = `<div class="row">${EL.map((e, i) => `<button data-e="${i}">${e[0]}</button>`).join("")}</div><div id="px"></div>`;
  const u = () => {
    ctl.querySelectorAll("button[data-e]").forEach(b => b.classList.toggle("on", on[+b.dataset.e]));
    const a = ML.axes(70, 36, 560, 200, { xmin: 4, xmax: 24, ymin: -5, ymax: 25, nx: 5, ny: 6, fx: v => Math.round(v), fy: v => Math.round(v), xl: on[2] ? "City population (10,000 people)" : "", yl: on[2] ? "Food-truck profit ($10,000)" : "" });
    let s = a.s;
    if (on[0]) D1.forEach(r => s += `<circle cx="${a.X(r[0])}" cy="${a.Y(r[1])}" r="4" fill="#007C91" stroke="white" stroke-width="0.6" opacity="0.88"/>`);
    if (on[1]) s += `<line x1="70" y1="${a.Y(0)}" x2="630" y2="${a.Y(0)}" stroke="#9E1B32" stroke-width="1.4" stroke-dasharray="6 4"/>`;
    if (on[3]) s += tx(350, 24, "Profit generally increases with city population", "middle", "th");
    if (on[4]) s += `<line x1="470" y1="56" x2="500" y2="56" stroke="#9E1B32" stroke-width="1.4" stroke-dasharray="6 4"/>` + tx(506, 60, "zero profit", null);
    const code = ["fig, ax = plt.subplots(figsize=(7.2, 4.4))"];
    if (on[0]) code.push('ax.scatter(food_truck["population_10k"], food_truck["profit_10k_usd"],', '           s=34, color="#007C91", edgecolor="white", alpha=0.88)');
    if (on[1]) code.push('ax.axhline(0, color="#9E1B32", linestyle="--", label="zero profit")');
    if (on[2] || on[3]) code.push("ax.set(" + [on[2] ? 'xlabel="City population (10,000 people)"' : null, on[2] ? 'ylabel="Food-truck profit ($10,000)"' : null, on[3] ? 'title="Profit generally increases with city population"' : null].filter(Boolean).join(", ") + ")");
    if (on[4]) code.push("ax.legend(frameon=False)");
    code.push("plt.tight_layout()", "plt.show()");
    fig.innerHTML = svg(280, s) + ML.code(code, -1);
    $("px").innerHTML = `<p class="note">${on.every(Boolean) ? "<b>Complete.</b> This is HW3 Task 1.2. Each toggle was one method call on the same Axes." : !on[2] ? "No units on the axes yet. A reader cannot tell 10,000 people from 1 person." : "Keep adding elements. Each is one line."}</p>`;
  };
  ctl.querySelectorAll("button[data-e]").forEach(b => b.onclick = () => { on[+b.dataset.e] = !on[+b.dataset.e]; u(); }); u();
}},

{s: "8. Plot types", t: "Line, scatter, histogram, bar: pick by the question",
intu: String.raw`Four plot types cover the course. A line plot for something ordered, such as cost against iteration. A scatter for two measured quantities, to see a relationship before fitting. A histogram for the distribution of one column, to see skew and outliers before standardizing. A bar chart for a statistic per category, such as the mean price per bedroom count. Each button draws the plot from the course data and shows the one or two lines that make it. The question decides the type, never the other way round.`,
eq: String.raw`\[ \texttt{ax.plot}(x, y) \;|\; \texttt{ax.scatter}(x, y) \;|\; \texttt{ax.hist}(x, bins) \;|\; \texttt{ax.bar}(labels, heights) \]`,
sym: [["ax.plot", "connected line, for ordered x such as iterations or time"], ["ax.scatter", "unconnected points, for two measurements"], ["ax.hist", "counts per bin of one variable, bins chosen by you"], ["ax.bar", "one bar per category"], ["bins", "too few hides shape, too many shows noise, try 10 to 30"]],
how: ["Ordered x and a single series per x: plot. Add marker='o' for few points.", "Two measurements per row: scatter. Alpha below 1 shows overlap.", "One column's distribution: hist with bins=20 and edgecolor to separate bars.", "A statistic per group: bar on the groupby result. Show counts somewhere.", "Always the same finishing lines: set labels with units, title with the finding, <code>tight_layout</code>."],
say: String.raw`Plot for ordered series, scatter for relationships, hist for distributions, bar for per-group statistics, and the question you are asking chooses among them.`,
num: String.raw`A histogram of house sizes with 15 bins between 852 and 4478 sq ft puts most houses between <b>1200 and 2400</b> and shows a right tail, which is why HW3 standardizes before gradient descent.`,
r(fig, ctl) {
  const T = ["line", "scatter", "hist", "bar"];
  let k = 0;
  ctl.innerHTML = btns(T.map((t, i) => [i, t]), "k") + `<div id="tx"></div>`;
  /* cost history for the line plot: gradient descent on standardized population */
  const mx = mean(POP), sx = std(POP), z = POP.map(v => (v - mx) / sx), m = z.length;
  const J = []; let b = 0, w = 0; for (let it = 0; it < 60; it++) { const e = z.map((v, i) => b + w * v - PROF[i]); J.push(e.reduce((s, v) => s + v * v, 0) / (2 * m)); b -= 0.1 * mean(e); w -= 0.1 * mean(e.map((v, i) => v * z[i])); }
  const u = () => {
    pick(ctl, "k", k);
    let s = "", code, note;
    if (k === 0) {
      const a = ML.axes(70, 30, 560, 200, { xmin: 0, xmax: 60, ymin: 0, ymax: 35, nx: 6, ny: 5, fx: v => Math.round(v), fy: v => Math.round(v), xl: "Iteration", yl: "Cost J" });
      s = a.s + ML.path(J.map((v, i) => [a.X(i), a.Y(v)]), "#007C91", 2) + tx(350, 20, "Optimization history", "middle", "th");
      code = ['ax.plot(J_history, color="#007C91", linewidth=2)', 'ax.set(xlabel="Iteration", ylabel=r"Cost $J(\\theta)$", title="Optimization history")'];
      note = "Ordered x: iteration number. The curve must fall monotonically for a well chosen learning rate, and HW3 asserts that.";
    } else if (k === 1) {
      const a = ML.axes(70, 30, 560, 200, { xmin: 800, xmax: 4600, ymin: 100000, ymax: 750000, nx: 4, ny: 5, fx: v => Math.round(v), fy: v => Math.round(v / 1000) + "k", xl: "Size (sq ft)", yl: "Price (USD)" });
      s = a.s; D2.forEach(r => s += `<circle cx="${a.X(r[0])}" cy="${a.Y(r[2])}" r="4.5" fill="#007C91" opacity="0.7"/>`); s += tx(350, 20, "Price rises with size, with wide scatter", "middle", "th");
      code = ['ax.scatter(housing["size_sqft"], housing["price_usd"], color="#007C91", alpha=0.7)', 'ax.set(xlabel="Size (sq ft)", ylabel="Price (USD)", title="Price rises with size, with wide scatter")'];
      note = "Two measurements per house. The relationship is roughly linear, which is the first justification for a linear model.";
    } else if (k === 2) {
      const bins = 15, lo = 852, hi = 4478, wdt = (hi - lo) / bins, cnt = Array(bins).fill(0); D2.forEach(r => cnt[Math.min(bins - 1, Math.floor((r[0] - lo) / wdt))]++);
      const a = ML.axes(70, 30, 560, 200, { xmin: lo, xmax: hi, ymin: 0, ymax: 12, nx: 4, ny: 4, fx: v => Math.round(v), fy: v => Math.round(v), xl: "Size (sq ft)", yl: "Count" });
      s = a.s; cnt.forEach((c, i) => s += `<rect x="${a.X(lo + i * wdt)}" y="${a.Y(c)}" width="${a.X(lo + wdt) - a.X(lo) - 1}" height="${a.Y(0) - a.Y(c)}" fill="#007C91" opacity="0.8" stroke="white"/>`); s += tx(350, 20, "House sizes are right skewed", "middle", "th");
      code = ['ax.hist(housing["size_sqft"], bins=15, color="#007C91", edgecolor="white")', 'ax.set(xlabel="Size (sq ft)", ylabel="Count", title="House sizes are right skewed")'];
      note = "One column's distribution. The long right tail is why the mean (2001) sits above the median (1888).";
    } else {
      const groups = {}; D2.forEach(r => { (groups[r[1]] = groups[r[1]] || []).push(r[2]); }); const keys = Object.keys(groups).map(Number).sort((a, b) => a - b);
      const a = ML.axes(70, 30, 560, 200, { xmin: 0.5, xmax: 5.5, ymin: 0, ymax: 750000, nx: 5, ny: 5, fx: v => Math.round(v), fy: v => Math.round(v / 1000) + "k", xl: "Bedrooms", yl: "Mean price (USD)" });
      s = a.s; keys.forEach(b => { const mv = mean(groups[b]); s += `<rect x="${a.X(b - 0.35)}" y="${a.Y(mv)}" width="${a.X(b + 0.35) - a.X(b - 0.35)}" height="${a.Y(0) - a.Y(mv)}" fill="#007C91" opacity="0.8"/>` + tx(a.X(b), a.Y(mv) - 6, "n=" + groups[b].length, "middle"); }); s += tx(350, 20, "Mean price by bedrooms (two groups hold one house)", "middle", "th");
      code = ['by_bed = housing.groupby("bedrooms")["price_usd"].agg(["mean", "count"])', 'ax.bar(by_bed.index, by_bed["mean"], color="#007C91")', 'for b, n in zip(by_bed.index, by_bed["count"]):', '    ax.text(b, by_bed.loc[b, "mean"], f"n={n}", ha="center", va="bottom")'];
      note = "A statistic per category. The counts written above the bars keep the single-house groups honest.";
    }
    fig.innerHTML = svg(276, s) + ML.code(["fig, ax = plt.subplots()", ...code, "plt.tight_layout()"], -1);
    $("tx").innerHTML = `<p class="note">${note}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "9. Diagnostic panels", t: "Subplots: observed versus predicted, and the residual plot",
intu: String.raw`One figure with several Axes puts related views side by side. <code>plt.subplots(1, 2)</code> returns an array of Axes, and you draw on <code>axes[0]</code> and <code>axes[1]</code>. HW3 Task 6.2 uses it for the two plots every regression needs: observed against predicted with the identity line, where a good model hugs the diagonal, and residuals against predicted with a zero line, where a good model shows a shapeless band. The fitted line here is the least squares line on the food truck data. Toggle between the fitted model and the mean baseline and watch both panels change.`,
eq: String.raw`\[ \texttt{fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))} \qquad r_i = y_i - \hat{y}_i \]`,
sym: [["axes[0], axes[1]", "the two Axes objects returned for one row of two"], ["identity line", "y = x, drawn from the shared minimum to the shared maximum"], ["residual", "observed minus predicted, the sign convention HW3 uses in its plots"], ["zero line", "axhline(0), residuals should scatter evenly around it"], ["layout=\"constrained\"", "HW6's alternative to <code>tight_layout</code>, set in subplots"]],
how: ["Create the panels: fig, axes = plt.subplots(1, 2, figsize=(11, 4.2)).", "Panel 0: scatter(predicted, observed), then plot the identity line in a dashed contrasting color.", "Panel 1: scatter(predicted, residuals), then axhline(0).", "Label every axis with units on both panels. Titles say what each panel is for.", "Read: points hugging the diagonal and a shapeless residual band mean the linear model is adequate. A curve in the residuals means a missing feature or a wrong shape."],
say: String.raw`Subplots return an array of Axes, and the two regression diagnostics are observed against predicted with the identity line and residuals against predicted with the zero line.`,
num: String.raw`Least squares on the food truck data: slope <b>${f(LS.w, 3)}</b>, intercept <b>${f(LS.b, 3)}</b>, RMSE <b>2.99</b> against the mean baseline's <b>5.48</b>, R² <b>0.70</b>.`,
r(fig, ctl) {
  let k = 0;
  ctl.innerHTML = btns([[0, "fitted line"], [1, "mean baseline"]], "k") + `<div id="dx"></div>`;
  const u = () => {
    pick(ctl, "k", k);
    const my = mean(PROF);
    const pred = POP.map(x => k === 0 ? LS.b + LS.w * x : my), res = PROF.map((y, i) => y - pred[i]);
    const rmse = Math.sqrt(mean(res.map(v => v * v)));
    const lo = Math.min(...pred, ...PROF), hi = Math.max(...pred, ...PROF);
    const a = ML.axes(60, 30, 260, 190, { xmin: -5, xmax: 25, ymin: -5, ymax: 25, nx: 3, ny: 3, fx: v => Math.round(v), fy: v => Math.round(v), xl: "Predicted profit ($10,000)", yl: "Observed ($10,000)" });
    const b = ML.axes(400, 30, 260, 190, { xmin: -5, xmax: 25, ymin: -15, ymax: 15, nx: 3, ny: 3, fx: v => Math.round(v), fy: v => Math.round(v), xl: "Predicted profit ($10,000)", yl: "Residual" });
    let s = a.s + b.s;
    s += `<line x1="${a.X(lo)}" y1="${a.Y(lo)}" x2="${a.X(hi)}" y2="${a.Y(hi)}" stroke="#9E1B32" stroke-dasharray="6 4"/>`;
    s += `<line x1="400" y1="${b.Y(0)}" x2="660" y2="${b.Y(0)}" stroke="#9E1B32" stroke-dasharray="6 4"/>`;
    pred.forEach((p, i) => { s += `<circle cx="${a.X(p)}" cy="${a.Y(PROF[i])}" r="3.5" fill="#007C91" opacity="0.75"/>`; s += `<circle cx="${b.X(p)}" cy="${b.Y(res[i])}" r="3.5" fill="#4C5B5C" opacity="0.75"/>`; });
    s += tx(190, 20, "Observed versus predicted", "middle", "th") + tx(530, 20, "Residual diagnostic", "middle", "th");
    fig.innerHTML = svg(270, s) + ML.code(["fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))", "axes[0].scatter(pred, y_profit, color=\"#007C91\", alpha=0.78)", "axes[0].plot([lo, hi], [lo, hi], \"--\", color=\"#9E1B32\")", "axes[1].scatter(pred, y_profit - pred, color=\"#4C5B5C\", alpha=0.78)", "axes[1].axhline(0, color=\"#9E1B32\", linestyle=\"--\")", "plt.tight_layout()"], -1);
    $("dx").innerHTML = ML.readout([["RMSE", f(rmse, 3)], ["residual mean", f(mean(res), 4)], ["reading", k === 0 ? "points along the diagonal, band around zero" : "a vertical line: one prediction for everyone"]]) + `<p class="note">${k === 0 ? "The band widens at larger predictions. HW3's Task 6.3 asks you to say so rather than to claim the model is perfect." : "The baseline predicts the mean profit for every city. Its residuals are just the data minus 5.84, which is why the panel is a vertical stripe."}</p>`;
  };
  ctl.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => { k = +b.dataset.k; u(); }); u();
}},

{s: "10. With the agent", t: "Do it with the agent: the audit and figure module",
intu: String.raw`The whole lesson as a reusable module: an audit function that prints and asserts, a loader that returns X and y by column name, a figure helper that applies the course style, and the two diagnostic panels saved to disk. Written once, it serves HW3, HW6 and the project. The check list is what the grader would check.`,
eq: String.raw`\[ \texttt{audit(df)} \to \texttt{load\_xy(df, features, target)} \to \texttt{diagnostics(y, }\hat{y}\texttt{, path)} \]`,
sym: [["audit", "head, dtypes, isna sum, finiteness, ranges, then assertions"], ["the loader", "<code>load_xy</code> returns feature and target columns by name, as float arrays"], ["style", "the HW3 rcParams block applied once at import"], ["diagnostics", "observed versus predicted and residual panels, saved with dpi=150"]],
how: ["Paste the command.", "Read audit(): does it assert on dtypes and finiteness, not just print?", "Read the figure code: are the labels built from the column names, with units?", "Run it on ex1data1.txt. Open the saved PNG. Does it match card 9?", "Commit the module and the PNG together."],
say: String.raw`One module holds the audit, the named-column loader, the course plot style and the diagnostic panels, and every later notebook imports it instead of rewriting it.`,
num: String.raw`On ex1data1.txt the audit prints shape <b>(97, 2)</b>, the fit prints RMSE <b>2.992</b>, and diagnostics.png holds <b>two</b> panels.`,
r(fig, ctl) {
  ML.agent(fig, ctl, {
    prompt: "Create src/tables.py with pandas, numpy and matplotlib (Agg backend). Functions: audit(df) that prints head(), dtypes, isna().sum(), whether every value is finite, and agg([min, mean, max]), then asserts every column is numeric and every value is finite, returning nothing. load_xy(df, features, target) returning X = df[features].to_numpy(dtype=float) and y = df[target].to_numpy(dtype=float), asserting X.shape == (len(df), len(features)) and y.ndim == 1. apply_style() that sets the seaborn-v0_8-whitegrid style and rcParams for figsize (7.2, 4.4), no top or right spines, bold titles. diagnostics(y, y_hat, xlabel, path) that draws a 1 by 2 figure: observed versus predicted with a dashed identity line, and residual (y - y_hat) versus predicted with a dashed zero line, labels containing the units from xlabel, and saves to path with dpi=150. Under the main guard: read ex1data1.txt with header=None and names population_10k and profit_10k_usd, run audit, load X and y, fit a least squares line with np.polyfit(X[:, 0], y, 1), print RMSE to 3 decimals, and save figures/diagnostics.png. Run it and paste the output.",
    actions: ["$ python src/tables.py", "   population_10k  profit_10k_usd", "0          6.1101         17.5920", "...", "All values finite: True", "shape (97, 2)  X (97, 1)  y (97,)", "slope 1.193  intercept -3.896  RMSE 2.992", "saved figures/diagnostics.png"],
    checks: ["audit asserts on is_numeric_dtype for every column and on np.isfinite(...).all()", "load_xy selects columns by name, never by position", "every axis label in diagnostics includes a unit string", "the residual is defined as y minus y_hat, matching HW3's sign", "the PNG opens and shows the identity line and the zero line"]
  });
}},

{s: "11. Test", t: "Lesson 10 test: pandas and Matplotlib",
intu: String.raw`Twelve questions on the DataFrame, selection, cleaning, summaries, the handoff to NumPy, and the plot anatomy and diagnostics. Answer each before you look. The feedback names the card to reopen.`,
eq: String.raw`\[ \text{12 questions} \]`,
sym: [["pass mark", "9 of 12, then redo the missed cards"]],
how: ["Read the code when there is code.", "Answer without running anything.", "Reopen the named card for any miss."],
say: String.raw`Twelve questions covering the whole lesson.`,
num: String.raw`Score <b>9 or more</b> to move on to the Part 2 test.`,
r(fig, ctl) {
  ML.quiz(fig, ctl, [
    { q: "What does <code>df[\"profit_10k_usd\"]</code> return?", o: ["A DataFrame with one column", "A Series with the DataFrame's index", "A NumPy array", "A Python list"], a: 1, why: "Single brackets with one name give a Series. Double brackets would give a one column DataFrame. Card 1." },
    { q: "A column that should hold floats shows dtype <code>object</code> after read_csv. The most likely cause is", o: ["the file is too large", "at least one entry is text, such as a stray unit or a dash", "pandas always reads floats as object", "the column name has an underscore"], a: 1, why: "Object dtype means mixed or text content. The audit's dtypes line is where you catch it. Card 2." },
    { q: "What is the difference between <code>df.loc[0:3]</code> and <code>df.iloc[0:3]</code> on a default index?", o: ["No difference", "loc returns 4 rows (labels 0 to 3 inclusive), iloc returns 3 rows (positions 0, 1, 2)", "loc returns 3 rows, iloc returns 4", "iloc selects columns"], a: 1, why: "Label slices are inclusive at both ends, position slices stop before the end. Card 3." },
    { q: "How do you keep the houses with more than 2000 sq ft and at most 3 bedrooms?", o: ['housing[housing["size_sqft"] > 2000 and housing["bedrooms"] <= 3]', 'housing[(housing["size_sqft"] > 2000) & (housing["bedrooms"] <= 3)]', 'housing.loc[size_sqft > 2000, bedrooms <= 3]', 'housing.filter(size_sqft > 2000)'], a: 1, why: "Combine boolean Series with & and parentheses. The keyword and raises an error on a Series. Card 3." },
    { q: "pandas computes <code>df[\"thick_mm\"].mean()</code> on a column with 5 observed values and 1 NaN. The result is", o: ["NaN", "the mean of the 5 observed values", "the mean with NaN treated as 0", "an error"], a: 1, why: "pandas statistics skip NaN silently, which is why the audit counts them first. Card 4." },
    { q: "Which cleaning choice loses no rows and records which values were invented?", o: ["dropna()", "fillna(mean) alone", "a notna() flag column, then fillna with the training mean", "sort_values"], a: 2, why: "The flag keeps the truth, the fill keeps the rows, and the training mean avoids leakage. Card 4." },
    { q: "<code>housing.groupby(\"bedrooms\")[\"price_usd\"].mean()</code> returns", o: ["a scalar", "a Series indexed by the distinct bedroom counts", "a DataFrame with 47 rows", "a list of group names"], a: 1, why: "Split by key, mean per group, combined into a Series whose index is the group values. Card 5." },
    { q: "Why does the solution write <code>X = housing[features].to_numpy(dtype=float)</code> with a list of names instead of <code>housing.iloc[:, :2]</code>?", o: ["Names are faster", "Names survive a change in column order or an added column, positions do not", "iloc cannot return floats", "to_numpy only accepts names"], a: 1, why: "Selecting by name is the safeguard against a silently wrong feature. Card 6." },
    { q: "With 47 rows and an 80 % split, how many rows are in the training set?", o: ["38", "37", "40", "36"], a: 1, why: "int(0.8 × 47) = int(37.6) = 37. Card 6." },
    { q: "In <code>fig, ax = plt.subplots()</code>, which object do you call scatter, set and legend on?", o: ["fig", "ax", "plt", "either, they are the same"], a: 1, why: "The Axes draws and is labelled. The Figure is the canvas. Card 7." },
    { q: "You want to see whether a column's values are skewed before standardizing. Which plot?", o: ["ax.plot", "ax.scatter", "ax.hist", "ax.bar"], a: 2, why: "A histogram shows the distribution of one variable. Card 8." },
    { q: "In the residual diagnostic (residual against predicted), a clear U shaped pattern means", o: ["the model is excellent", "the linear model is missing curvature or a feature", "the learning rate is too high", "the plot has the wrong axis labels"], a: 1, why: "Residuals should form a shapeless band around zero. Structure means something systematic is unmodelled. Card 9." }
  ], "Lesson 10 test");
}}
],
summary: String.raw`A DataFrame is named columns over an index, each a Series with its own dtype. The audit is head, dtypes, isna sum, finiteness, ranges, then assertions. Select columns by name, rows by loc or iloc or a boolean Series. Count holes, then drop or fill from training statistics with a flag column. describe, <code>sort_values</code> and groupby answer the questions a table can answer, with counts beside every mean. Hand off to NumPy by column name with <code>to_numpy</code>, split with a seeded permutation, fit statistics on train only. A plot is a Figure holding Axes with one method per element, labels with units, a finding in the title. Plot types follow the question. Subplots hold the two regression diagnostics: observed versus predicted on the identity line, and residuals around zero.`,
sheet: [[String.raw`\[ \texttt{df[c]},\ \texttt{df[[c\_1,c\_2]]},\ \texttt{df.loc[lbl, c]},\ \texttt{df.iloc[i, j]},\ \texttt{df[mask]} \]`, "selection: Series, DataFrame, by label, by position, by rule"], [String.raw`\[ \texttt{isna().sum()},\ \texttt{dropna()},\ \texttt{fillna(train\_mean)} \]`, "count holes, drop rows, or fill from training statistics"], [String.raw`\[ \texttt{groupby(key)[col].agg([mean, count])} \]`, "split, apply, combine, with the count beside the mean"], [String.raw`\[ X = \texttt{df[features].to\_numpy(dtype=float)},\ y = \texttt{df[target].to\_numpy(dtype=float)} \]`, "table to arrays by name"], [String.raw`\[ \texttt{fig, ax = plt.subplots()} \to \texttt{ax.scatter} \to \texttt{ax.set(xlabel, ylabel, title)} \to \texttt{ax.legend(frameon=False)} \]`, "the course plot template"], [String.raw`\[ r = y - \hat{y} \]`, "residual sign in the HW3 diagnostic plots"]],
sources: ["AME 5970 HW3 solutions, Tasks 1.1, 1.2, 5.1, 6.2 and 6.3 (audit, scatter, cost history, diagnostics), and the HW3 learning guide", "AME 5970 HW6 regression tutorial (subplots with constrained layout, rcParams style block)", "Andrew Ng, Machine Learning course, ex1data1 and ex1data2 (the food truck and housing files used in HW3)", "pandas user guide: Indexing and selecting data, Working with missing data, Group by", "Matplotlib: Quick start guide (the Figure and Axes object interface)", "Wes McKinney, Python for Data Analysis, 3rd ed., chapters 5, 7 and 9"]
});
})();
