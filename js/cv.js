// k-fold cross validation over PENGUINS: fold assignment and the two models.
// Indices below are positions in PENGUINS (0..n-1); the page shows id = i+1.

/** Seeded PRNG (mulberry32) so a shuffle can be replayed. */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Return 0..n-1 in the display order for a fold scheme.
 *
 * sorted lists by species; shuffled is a seeded Fisher-Yates shuffle;
 * stratified shuffles within each species, deals the species-grouped list
 * round-robin into k folds (so per-fold species counts differ by at most
 * one), then lays the folds end to end, each listed by species.
 */
function sampleOrder(n, scheme, seed, k) {
  const order = [...Array(n).keys()];
  if (scheme === "sorted") return order;
  const r = rng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (scheme === "shuffled") return order;
  const bySpecies = SPECIES.flatMap(sp =>
    order.filter(i => PENGUINS[i].species === sp));
  const folds = [...Array(k)].map(() => []);
  bySpecies.forEach((i, t) => folds[t % k].push(i));
  const rank = i => SPECIES.indexOf(PENGUINS[i].species);
  return folds.flatMap(f => f.sort((a, b) => rank(a) - rank(b)));
}

/** Split order into k contiguous folds; k divides n for every k offered. */
function makeFolds(order, k) {
  const m = order.length / k;
  return [...Array(k).keys()].map(f => order.slice(f * m, (f + 1) * m));
}

/**
 * Nearest centroid on (bill length, bill depth).
 *
 * Each species' centroid is its training mean; a test penguin is estimated
 * as the species with the closest centroid (Euclidean, in mm). A species
 * with no training penguins has no centroid, so it is never estimated.
 */
function fitCentroids(train) {
  const cents = {};
  for (const sp of SPECIES) {
    const pts = train.map(i => PENGUINS[i]).filter(p => p.species === sp);
    if (!pts.length) continue;
    cents[sp] = [mean(pts.map(p => p.billLen)), mean(pts.map(p => p.billDep))];
  }
  return cents;
}

function predictCentroid(cents, p) {
  let best = null, bestD = Infinity;
  for (const [sp, [l, d]] of Object.entries(cents)) {
    const dist = Math.hypot(p.billLen - l, p.billDep - d);
    if (dist < bestD) { best = sp; bestD = dist; }
  }
  return best;
}

/** Least squares line mass = b0 + b1 * flipper, fit on train. */
function fitLine(train) {
  const xs = train.map(i => PENGUINS[i].flipper);
  const ys = train.map(i => PENGUINS[i].mass);
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0;
  for (let j = 0; j < xs.length; j++) {
    sxy += (xs[j] - mx) * (ys[j] - my);
    sxx += (xs[j] - mx) ** 2;
  }
  const b1 = sxy / sxx;
  return { b0: my - b1 * mx, b1 };
}

/**
 * Run every round of k-fold CV.
 *
 * Returns one record per fold f (round f+1):
 *   {test, train, counts, cents, guess, line, err}
 * where test / train are index lists, counts maps species to its training
 * count, guess[i] is the estimated species, and err[i] = mass - estimate.
 */
function runCV(order, k) {
  const folds = makeFolds(order, k);
  return folds.map(test => {
    const train = order.filter(i => !test.includes(i));
    const counts = {};
    for (const sp of SPECIES) {
      counts[sp] = train.filter(i => PENGUINS[i].species === sp).length;
    }
    const cents = fitCentroids(train);
    const line = fitLine(train);
    const guess = {}, err = {};
    for (const i of test) {
      const p = PENGUINS[i];
      guess[i] = predictCentroid(cents, p);
      err[i] = p.mass - (line.b0 + line.b1 * p.flipper);
    }
    return { test, train, counts, cents, guess, line, err };
  });
}

function mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
