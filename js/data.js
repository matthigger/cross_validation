// Twelve penguins from the Palmer Archipelago data (Gorman, Williams &
// Fraser 2014), four per species, listed by species. The sample was picked
// so that a shuffled 3-fold CV misses one or two, which makes the point
// that estimates can be wrong. Units: mm for lengths, g for mass.

const PENGUINS = [
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
].map(([species, billLen, billDep, flipper, mass], i) =>
  ({ id: i + 1, species, billLen, billDep, flipper, mass }));
