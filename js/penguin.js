// Penguin outlines, front view, drawn in a 100 x 140 box (feet at y = 136).
// Each species has one field mark a student can spot without colour:
// Adelie a ring round each eye, Chinstrap a white face with a strap under
// the chin, Gentoo a band over the crown and an orange bill.

const SPECIES = ["Adelie", "Chinstrap", "Gentoo"];

// White belly patch: up to the chin, or (Chinstrap) the whole face.
const BELLY_CHIN = `M50 55 C38 55 30 61 28 73 C24 93 29 124 50 126
  C71 124 76 93 72 73 C70 61 62 55 50 55 Z`;
const BELLY_FACE = `M50 25 C40 19 25 24 24 41 C23 52 28 61 28 73
  C24 93 29 124 50 126 C71 124 76 93 72 73 C72 61 77 52 76 41
  C75 24 60 19 50 25 Z`;

const PENGUIN_MARKS = {
  Adelie: `
    <circle class="pg-mark" cx="39" cy="40" r="7"/>
    <circle class="pg-mark" cx="61" cy="40" r="7"/>`,
  Chinstrap: `
    <path class="pg-mark strap" d="M26.5 55 Q50 75 73.5 55"/>`,
  Gentoo: `
    <path class="pg-mark" d="M32 37 C31 22 41 15 50 15 C59 15 69 22 68 37
      C65 28 58 23 50 23 C42 23 35 28 32 37 Z"/>`,
};

// Gentoo is drawn a little larger: it is the biggest of the three.
const PENGUIN_SCALE = { Adelie: 0.94, Chinstrap: 0.94, Gentoo: 1.0 };

function eye(x) {
  return `<circle class="pg-eye" cx="${x}" cy="40" r="4.2"/>
    <circle class="pg-glint" cx="${x + 1.5}" cy="38.5" r="1.5"/>`;
}

/** Return SVG markup for one penguin outline, its body classed pg-body. */
function penguinSVG(species) {
  const s = PENGUIN_SCALE[species];
  const gentoo = species === "Gentoo";
  const bill = gentoo
    ? `<path class="pg-bill gentoo" d="M45 46 Q50 43 55 46 Q51.5 55 50 55
        Q48.5 55 45 46 Z"/>`
    : `<path class="pg-bill" d="M46.5 46.5 Q50 44.5 53.5 46.5 Q51 52.5 50
        52.5 Q49 52.5 46.5 46.5 Z"/>`;
  const foot = gentoo ? "pg-foot gentoo" : "pg-foot";
  return `
  <g class="penguin ${species.toLowerCase()}"
     transform="translate(50 136) scale(${s}) translate(-50 -136)">
    <path class="pg-flipper" d="M19 68 C8 74 3 89 5 101 C12 97 17 89 20 82 Z"/>
    <path class="pg-flipper" d="M81 68 C92 74 97 89 95 101 C88 97 83 89 80 82 Z"/>
    <path class="pg-body" d="M50 6 C70 6 82 22 82 44 C82 52 86 62 88 76
      C92 104 80 132 50 132 C20 132 8 104 12 76 C14 62 18 52 18 44
      C18 22 30 6 50 6 Z"/>
    <path class="pg-belly" d="${species === "Chinstrap" ? BELLY_FACE
      : BELLY_CHIN}"/>
    ${PENGUIN_MARKS[species]}
    ${eye(39)}${eye(61)}
    <ellipse class="pg-blush" cx="30" cy="51" rx="4.5" ry="2.6"/>
    <ellipse class="pg-blush" cx="70" cy="51" rx="4.5" ry="2.6"/>
    ${bill}
    <ellipse class="${foot}" cx="40" cy="133" rx="8" ry="3.8"/>
    <ellipse class="${foot}" cx="60" cy="133" rx="8" ry="3.8"/>
  </g>`;
}
