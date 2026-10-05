// Penguins from the Palmer Archipelago data (Gorman, Williams & Fraser
// 2014), twelve per data set, listed by species. Units: mm for lengths, g
// for mass. The app reads the active set through PENGUINS.
//
//   equal    four per species, picked so a shuffled 3-fold CV misses one or
//            two (estimates can be wrong)
//   unequal  7 Adelie, 3 Chinstrap, 2 Gentoo: overall accuracy can look
//            fine while the rare species are missed
//   outlier  equal, but #3's mass is recorded as 4,950 g (a data-entry
//            error); it sits at the edge of the flipper range, so it also
//            tilts any line trained on it

const EQUAL_ROWS = [
  ["Adelie", 38.2, 20.0, 190, 3900],
  ["Adelie", 40.7, 17.0, 190, 3725],
  ["Adelie", 40.6, 18.6, 183, 3550],
  ["Adelie", 36.0, 17.9, 190, 3450],
  ["Chinstrap", 52.0, 20.7, 210, 4800],
  ["Chinstrap", 50.5, 19.6, 201, 4050],
  ["Chinstrap", 50.9, 19.1, 196, 3550],
  ["Chinstrap", 43.5, 18.1, 202, 3400],
  ["Gentoo", 46.8, 14.3, 215, 4850],
  ["Gentoo", 46.5, 14.4, 217, 4900],
  ["Gentoo", 45.8, 14.2, 219, 4700],
  ["Gentoo", 41.7, 14.7, 210, 4700],
];

const UNEQUAL_ROWS = [
  ...EQUAL_ROWS.slice(0, 4),
  ["Adelie", 35.5, 16.2, 195, 3350],
  ["Adelie", 34.0, 17.1, 185, 3400],
  ["Adelie", 35.6, 17.5, 191, 3175],
  ["Chinstrap", 52.0, 20.7, 210, 4800],
  ["Chinstrap", 50.5, 19.6, 201, 4050],
  ["Chinstrap", 43.5, 18.1, 202, 3400],
  ["Gentoo", 46.8, 14.3, 215, 4850],
  ["Gentoo", 46.5, 14.4, 217, 4900],
];

const OUTLIER_ID = 3;
const OUTLIER_ROWS = EQUAL_ROWS.map((r, i) =>
  i + 1 === OUTLIER_ID ? [...r.slice(0, 4), 4950] : r);

function penguinsFrom(rows) {
  return rows.map(([species, billLen, billDep, flipper, mass], i) =>
    ({ id: i + 1, species, billLen, billDep, flipper, mass }));
}

const DATASETS = {
  equal: penguinsFrom(EQUAL_ROWS),
  unequal: penguinsFrom(UNEQUAL_ROWS),
  outlier: penguinsFrom(OUTLIER_ROWS),
};

let PENGUINS = DATASETS.equal;
