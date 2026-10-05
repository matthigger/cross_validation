// Page state, drawing and controls. The stage is one SVG, 1000 units wide:
// a top panel (penguin outlines, or the scatter in regression mode), a
// strip of fold brackets, then one estimate cell per sample. Column j of
// the strip and the estimates holds the j-th penguin in the current order.

const K_CHOICES = [2, 3, 4, 6, 12];
const DEFAULT_SEED = 3;
const N = PENGUINS.length;
const W = 1000;
const X0 = 20;
const CW = (W - 2 * X0) / N;
const SVGNS = "http://www.w3.org/2000/svg";

// Regression scatter: plot box and data ranges.
const PLOT = { x0: 86, x1: 980, y0: 30, y1: 330 };
const XDOM = [180, 222];
const YDOM = [3250, 5000];
// Bars in the error cells: ERR_MAX grams of error is ERR_PX units tall.
const ERR_MAX = 800;
const ERR_PX = 64;

const LAYOUT = {
  class: { folds: 194, estLabel: 242, est: 256, height: 404 },
  reg: { folds: 404, estLabel: 450, est: 486, height: 676 },
};

const state = {
  mode: "class",
  k: 3,
  scheme: "shuffled",
  seed: DEFAULT_SEED,
  step: 0,
};
// Derived from k, scheme and seed by recompute().
let order = [], rounds = [], colOf = [];

const svg = document.getElementById("stage");
const els = {};

function recompute() {
  order = sampleOrder(N, state.scheme, state.seed, state.k);
  rounds = runCV(order, state.k);
  colOf = [];
  order.forEach((i, j) => { colOf[i] = j; });
}

function colX(j) { return X0 + CW * (j + 0.5); }
function sx(v) {
  return PLOT.x0 + (v - XDOM[0]) / (XDOM[1] - XDOM[0]) * (PLOT.x1 - PLOT.x0);
}
function sy(v) {
  return PLOT.y1 - (v - YDOM[0]) / (YDOM[1] - YDOM[0]) * (PLOT.y1 - PLOT.y0);
}

function node(tag, attrs = {}, html = "") {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (html) el.innerHTML = html;
  return el;
}

function fmt(x, digits = 0) {
  const s = Math.abs(x).toLocaleString("en-US", {
    minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (x < 0 ? "−" : "") + s;
}

function signed(x) { return (x > 0 ? "+" : "") + fmt(x); }

/** Label as SVG text, e.g. "y = 0" with an italic y (sym is y or y-hat). */
function yText(sym, species) {
  return `<tspan class="sym">${sym}</tspan> = ${SPECIES.indexOf(species)}`;
}

function tooltip(p) {
  return `#${p.id} ${p.species}: bill ${p.billLen} × ${p.billDep} mm, `
    + `flipper ${p.flipper} mm, ${fmt(p.mass)} g`;
}

/** Role of penguin i at the current step: idle, train or test. */
function role(i) {
  if (state.step === 0) return "idle";
  return rounds[state.step - 1].test.includes(i) ? "test" : "train";
}

/** Round (1-based) in which penguin i is testing. */
function testRound(i) { return Math.floor(colOf[i] / (N / state.k)) + 1; }

// ------------------------------------------------------------------ build

function build() {
  svg.innerHTML = "";
  const L = LAYOUT[state.mode];
  svg.setAttribute("viewBox", `0 0 ${W} ${L.height}`);
  els.samples = [];
  els.est = [];

  if (state.mode === "class") {
    svg.append(node("text", { class: "sec", x: X0, y: 16 },
      `samples (true label <tspan class="sym">y</tspan>)`));
    for (const p of PENGUINS) {
      const g = node("g", { class: "col", "data-i": p.id - 1 }, `
        <title>${tooltip(p)}</title>
        <g transform="translate(-33 24) scale(0.66)">${penguinSVG(p.species)}</g>
        <text class="id" y="138">#${p.id}</text>
        <text class="lab" y="156">${yText("y", p.species)}</text>
        <text class="name" y="172">${p.species}</text>`);
      els.samples.push(g);
      svg.append(g);
    }
  } else {
    buildScatter();
  }

  els.folds = node("g", { class: "folds" });
  svg.append(els.folds);
  svg.append(node("text", { class: "sec", x: X0, y: L.estLabel },
    state.mode === "class"
      ? `estimates <tspan class="sym">ŷ</tspan> per sample`
      : "error per sample: actual − estimate (g)"));

  for (const p of PENGUINS) {
    const g = node("g", { class: "col est", "data-i": p.id - 1 });
    els.est.push(g);
    svg.append(g);
  }
}

function buildScatter() {
  const ax = node("g", { class: "axes" });
  let h = "";
  for (let v = XDOM[0]; v <= XDOM[1]; v += 5) {
    h += `<line class="grid" x1="${sx(v)}" x2="${sx(v)}" y1="${PLOT.y0}"
      y2="${PLOT.y1}"/><text class="tick" x="${sx(v)}" y="${PLOT.y1 + 16}"
      text-anchor="middle">${v}</text>`;
  }
  for (let v = 3500; v <= YDOM[1]; v += 500) {
    h += `<line class="grid" x1="${PLOT.x0}" x2="${PLOT.x1}" y1="${sy(v)}"
      y2="${sy(v)}"/><text class="tick" x="${PLOT.x0 - 8}" y="${sy(v) + 4}"
      text-anchor="end">${fmt(v)}</text>`;
  }
  h += `<rect class="frame" x="${PLOT.x0}" y="${PLOT.y0}"
    width="${PLOT.x1 - PLOT.x0}" height="${PLOT.y1 - PLOT.y0}"/>
    <text class="axis-label" x="${(PLOT.x0 + PLOT.x1) / 2}"
      y="${PLOT.y1 + 36}" text-anchor="middle">flipper length (mm)</text>
    <text class="axis-label" text-anchor="middle"
      transform="translate(24 ${(PLOT.y0 + PLOT.y1) / 2}) rotate(-90)">body
      mass (g)</text>
    <text class="sec" x="${X0}" y="16">samples</text>
    <clipPath id="plotclip"><rect x="${PLOT.x0}" y="${PLOT.y0}"
      width="${PLOT.x1 - PLOT.x0}" height="${PLOT.y1 - PLOT.y0}"/></clipPath>`;
  ax.innerHTML = h;
  svg.append(ax);

  els.fit = node("g", { class: "fit", "clip-path": "url(#plotclip)" });
  svg.append(els.fit);
  for (const p of PENGUINS) {
    const g = node("g", { class: "pt", "data-i": p.id - 1,
      transform: `translate(${sx(p.flipper)} ${sy(p.mass)})` }, `
      <title>${tooltip(p)}</title>
      <circle r="10.5"/><text y="4">${p.id}</text>`);
    els.samples.push(g);
    svg.append(g);
  }
}

// ----------------------------------------------------------------- update

function update() {
  const L = LAYOUT[state.mode];
  const done = state.step;
  const cur = done ? rounds[done - 1] : null;

  PENGUINS.forEach((p, i) => {
    const s = els.samples[i];
    s.dataset.role = role(i);
    if (state.mode === "class") {
      s.style.transform = `translate(${colX(colOf[i])}px, 0px)`;
    }

    const e = els.est[i];
    e.style.transform = `translate(${colX(colOf[i])}px, ${L.est}px)`;
    const r = testRound(i);
    e.dataset.role = r > done ? "unknown" : (r === done ? "test" : "done");
    e.innerHTML = r > done ? unknownCell(p) : (state.mode === "class"
      ? classCell(p, rounds[r - 1].guess[i])
      : regCell(p, rounds[r - 1].err[i]));
  });

  drawFolds(L.folds);
  if (state.mode === "reg") drawFit(cur);
  updateReadout();
  updateControls();
}

function unknownCell(p) {
  if (state.mode === "class") {
    return `<title>#${p.id}: not estimated yet</title>
      <rect class="q-box" x="-30" y="2" width="60" height="88" rx="8"/>
      <text class="q" y="57">?</text>`;
  }
  return `<text class="id" y="0">#${p.id}</text>
    <line class="zero" x1="-30" x2="30" y1="${ERR_PX + 18}"
      y2="${ERR_PX + 18}"/>
    <text class="q" y="${ERR_PX + 30}">?</text>`;
}

function classCell(p, guess) {
  const ok = guess === p.species;
  const label = guess || "none";
  const shape = guess
    ? `<g transform="translate(-33 0) scale(0.66)">${penguinSVG(guess)}</g>`
    : `<rect class="q-box" x="-30" y="2" width="60" height="88" rx="8"/>`;
  return `<title>#${p.id}: estimated ${label}, truly ${p.species}</title>
    <rect class="hl" x="-38" y="-6" width="76" height="142" rx="10"/>
    ${shape}
    <text class="lab ${ok ? "right" : "wrong"}" y="112">${ok ? "✓" :
      "✗"} ${guess ? yText("ŷ", guess) : "none"}</text>
    <text class="name" y="128">${label}</text>`;
}

function regCell(p, err) {
  const zero = ERR_PX + 18;
  const h = Math.min(Math.abs(err), ERR_MAX) / ERR_MAX * ERR_PX;
  const y = err > 0 ? zero - h : zero;
  return `<title>#${p.id}: actual ${fmt(p.mass)} g, estimate
      ${fmt(p.mass - err)} g, error ${signed(err)} g</title>
    <rect class="hl" x="-38" y="-16" width="76" height="${2 * ERR_PX + 70}"
      rx="10"/>
    <text class="id" y="0">#${p.id}</text>
    <line class="zero" x1="-30" x2="30" y1="${zero}" y2="${zero}"/>
    <rect class="bar" x="-14" y="${y}" width="28" height="${Math.max(h, 1)}"
      rx="2"/>
    <text class="errval" y="${2 * ERR_PX + 42}">${signed(err)}</text>`;
}

function drawFolds(y) {
  const m = N / state.k;
  let h = "";
  for (let f = 0; f < state.k; f++) {
    const a = X0 + CW * f * m + 5, b = X0 + CW * (f + 1) * m - 5;
    const r = state.step === 0 ? "idle"
      : (f === state.step - 1 ? "test" : "train");
    const label = state.k === N ? `${f + 1}` : `fold ${f + 1}`;
    h += `<g class="fold" data-role="${r}">
      <path d="M${a} ${y - 8} V${y} H${b} V${y - 8}"/>
      <text x="${(a + b) / 2}" y="${y + 17}">${label}</text></g>`;
  }
  els.folds.innerHTML = h;
}

function drawFit(cur) {
  if (!cur) { els.fit.innerHTML = ""; return; }
  const { b0, b1 } = cur.line;
  const f = x => b0 + b1 * x;
  let h = `<line class="line" x1="${sx(XDOM[0])}" y1="${sy(f(XDOM[0]))}"
    x2="${sx(XDOM[1])}" y2="${sy(f(XDOM[1]))}"/>`;
  for (const i of cur.test) {
    const p = PENGUINS[i];
    h += `<line class="resid" x1="${sx(p.flipper)}" x2="${sx(p.flipper)}"
      y1="${sy(p.mass)}" y2="${sy(f(p.flipper))}"/>
      <circle class="est-dot" cx="${sx(p.flipper)}" cy="${sy(f(p.flipper))}"
      r="4"/>`;
  }
  els.fit.innerHTML = h;
}

// --------------------------------------------------------------- readout

function updateReadout() {
  const out = document.getElementById("readout");
  const k = state.k, m = N / k;
  document.getElementById("round").textContent = state.step === 0
    ? "before CV" : `round ${state.step} of ${k}`;

  if (state.step === 0) {
    out.innerHTML = `<h3>Ready</h3>
      <p><i>n</i> = ${N} penguins in <i>k</i> = ${k} folds of ${m}.
      Press <b>CV step</b> to run round 1.</p>`;
    return;
  }

  const cur = rounds[state.step - 1];
  const seen = rounds.slice(0, state.step).flatMap(r => r.test);
  const counts = SPECIES.map(sp => cur.counts[sp]
    ? `${sp} ${cur.counts[sp]}`
    : `<span class="zero-ct">${sp} 0</span>`).join(" &middot; ");
  const missing = SPECIES.filter(sp => !cur.counts[sp]);

  let h = `<h3>Round ${state.step} of ${k}</h3>
    <div class="row"><span>Testing</span><span class="val">fold
      ${state.step}: ${cur.test.map(i => "#" + (i + 1)).join(" ")}</span>
    </div>
    <div class="row"><span>Training</span><span class="val">${counts}</span>
    </div>`;
  if (missing.length) {
    h += `<p class="warn">No ${missing.join(" or ")} in training: ${
      state.mode === "class"
        ? "the model cannot estimate " + missing.join(" or ") + "."
        : "the line is fit without " + (missing.length > 1 ? "them" : "it")
          + "."}</p>`;
  }

  if (state.mode === "class") {
    const right = idx => idx.filter(i => {
      const r = rounds[testRound(i) - 1];
      return r.guess[i] === PENGUINS[i].species;
    }).length;
    h += `<div class="row"><span>This round</span><span class="val">
        ${right(cur.test)} / ${cur.test.length} correct</span></div>
      <div class="row"><span>So far</span><span class="val">
        ${right(seen)} / ${seen.length} correct</span></div>`;
    if (state.step === k) {
      const c = right(seen);
      h += `<div class="final">CV accuracy = ${c} / ${N} =
        ${Math.round(100 * c / N)}%</div>`;
    }
  } else {
    const mse = idx => mean(idx.map(i => rounds[testRound(i) - 1].err[i] ** 2));
    h += `<div class="row"><span>This round</span><span class="val">RMSE
        ${fmt(Math.sqrt(mse(cur.test)))} g</span></div>
      <div class="row"><span>So far</span><span class="val">RMSE
        ${fmt(Math.sqrt(mse(seen)))} g</span></div>`;
    if (state.step === k) {
      const v = mse(seen);
      h += `<div class="final">CV MSE = ${fmt(v)} g&sup2;
        <span class="muted">(RMSE ${fmt(Math.sqrt(v))} g)</span></div>`;
    }
  }
  out.innerHTML = h;
}

// -------------------------------------------------------------- controls

const kInput = document.getElementById("k");

function updateControls() {
  const m = N / state.k;
  document.getElementById("kval").textContent = state.k === N
    ? `k = ${N}, leave-one-out` : `k = ${state.k}, ${m} per fold`;
  kInput.value = K_CHOICES.indexOf(state.k);
  document.getElementById("back").disabled = state.step === 0;
  document.getElementById("step").disabled = state.step === state.k;
  document.getElementById("reshuffle").disabled = state.scheme === "sorted";
  for (const b of document.querySelectorAll("[data-order]")) {
    b.setAttribute("aria-checked", b.dataset.order === state.scheme);
  }
  for (const t of document.querySelectorAll(".tab")) {
    t.setAttribute("aria-selected", t.dataset.mode === state.mode);
  }
  for (const el of document.querySelectorAll("[data-show]")) {
    el.hidden = el.dataset.show !== state.mode;
  }
}

function setStep(s) {
  state.step = Math.max(0, Math.min(state.k, s));
  update();
}

// Changing the folds starts CV over: earlier estimates belong to other folds.
function refold() {
  state.step = 0;
  recompute();
  update();
}

function setMode(mode) {
  state.mode = mode;
  // Stratifying by species is a classification idea; regression falls back.
  if (mode === "reg" && state.scheme === "stratified") {
    state.scheme = "shuffled";
    state.step = 0;
    recompute();
  }
  history.replaceState(null, "", mode === "reg" ? "#regression"
    : "#classification");
  build();
  update();
}

document.getElementById("step").onclick = () => setStep(state.step + 1);
document.getElementById("back").onclick = () => setStep(state.step - 1);
document.getElementById("reset").onclick = () => setStep(0);
kInput.oninput = () => { state.k = K_CHOICES[+kInput.value]; refold(); };
for (const b of document.querySelectorAll("[data-order]")) {
  b.onclick = () => {
    state.scheme = b.dataset.order;
    refold();
  };
}
document.getElementById("reshuffle").onclick = () => {
  state.seed += 1;
  refold();
};
for (const t of document.querySelectorAll(".tab")) {
  t.onclick = () => setMode(t.dataset.mode);
}

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT" || e.metaKey || e.ctrlKey) return;
  // Space on a focused button already clicks that button.
  const space = e.key === " " && e.target.tagName !== "BUTTON";
  if (e.key === "ArrowRight" || space) {
    e.preventDefault();
    setStep(state.step + 1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    setStep(state.step - 1);
  }
});

// Hovering a sample lights up its estimate cell, and vice versa.
svg.addEventListener("mouseover", e => {
  const g = e.target.closest("[data-i]");
  for (const el of svg.querySelectorAll(".hover")) el.classList.remove("hover");
  if (!g) return;
  for (const el of svg.querySelectorAll(`[data-i="${g.dataset.i}"]`)) {
    el.classList.add("hover");
  }
});
svg.addEventListener("mouseleave", () => {
  for (const el of svg.querySelectorAll(".hover")) el.classList.remove("hover");
});

document.querySelectorAll(".species-key svg").forEach((s, j) => {
  s.innerHTML = penguinSVG(SPECIES[j]);
});

// Footer build stamp: the deployed commit, linked, so a viewer can check
// it against the latest commit on GitHub.
(function () {
  const el = document.getElementById("build");
  const repo = "https://github.com/matthigger/cross_validation";
  if (!BUILD) { el.textContent = "local copy"; return; }
  const when = new Date(BUILD.time).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short" });
  el.innerHTML = `build <a href="${repo}/commit/${BUILD.sha}">${
    BUILD.sha.slice(0, 7)}</a>, ${when} (<a href="${repo}/commits/main">latest
    commits</a>)`;
})();

recompute();
setMode(location.hash === "#regression" ? "reg" : "class");
