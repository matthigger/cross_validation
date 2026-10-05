// Penguin outlines ("Mochi": a round dumpling with big low-set eyes), front
// view, drawn in a 100 x 140 box with feet at y = 136. Each species has one
// field mark a student can spot without colour: Adelie a ring round each
// eye, Chinstrap a white face with a strap under the chin, Gentoo a band
// over the crown and an orange bill.

const SPECIES = ["Adelie", "Chinstrap", "Gentoo"];

// Eye height; the marks are placed relative to it.
const EYE_Y = 77;

// White belly patch: the lower body, or (Chinstrap) the whole face too.
const BELLY_LOW = `M50 88 C34 88 23 97 23 110 C23 122 35 128 50 128
  C65 128 77 122 77 110 C77 97 66 88 50 88 Z`;
const BELLY_FACE = `M50 55 C40 52 25 55 21 69 C18 80 22 89 21 100
  C21 118 33 128 50 128 C67 128 79 118 79 100 C78 89 82 80 79 69
  C75 55 60 52 50 55 Z`;

const PENGUIN_MARKS = {
  Adelie: `
    <circle class="pg-mark" cx="35" cy="${EYE_Y}" r="10.5"/>
    <circle class="pg-mark" cx="65" cy="${EYE_Y}" r="10.5"/>`,
  Chinstrap: `
    <path class="pg-mark strap" d="M22 91 Q50 106 78 91"/>`,
  Gentoo: `
    <path class="pg-mark" d="M23.5 74 C21 62 28 55 36 53 C40 50 45 48 50 48
      C55 48 60 50 64 53 C72 55 79 62 76.5 74 C74 69 70 66 64 66
      C61 59 56 54 50 54 C44 54 39 59 36 66 C30 66 26 69 23.5 74 Z"/>`,
};

// Gentoo is drawn a little larger: it is the biggest of the three.
const PENGUIN_SCALE = { Adelie: 0.92, Chinstrap: 0.92, Gentoo: 1.0 };

function eye(x) {
  return `<circle class="pg-eye" cx="${x}" cy="${EYE_Y}" r="6.6"/>
    <circle class="pg-glint" cx="${x + 2.2}" cy="${EYE_Y - 2.4}" r="2.4"/>
    <circle class="pg-glint" cx="${x - 2.3}" cy="${EYE_Y + 2.6}" r="1.1"/>`;
}

/** Return SVG markup for one penguin outline, its body classed pg-body. */
function penguinSVG(species) {
  const s = PENGUIN_SCALE[species];
  const gentoo = species === "Gentoo";
  const bill = gentoo
    ? `<path class="pg-bill gentoo" d="M45.5 83 Q50 80.5 54.5 83 Q51 90 50 90
        Q49 90 45.5 83 Z"/>`
    : `<path class="pg-bill" d="M46.5 83.5 Q50 81.5 53.5 83.5 Q51 88.5 50
        88.5 Q49 88.5 46.5 83.5 Z"/>`;
  const foot = gentoo ? "pg-foot gentoo" : "pg-foot";
  return `
  <g class="penguin ${species.toLowerCase()}"
     transform="translate(50 136) scale(${s}) translate(-50 -136)">
    <ellipse class="pg-flipper" cx="12.5" cy="92" rx="6.5" ry="12.5"
      transform="rotate(48 12.5 92)"/>
    <ellipse class="pg-flipper" cx="87.5" cy="92" rx="6.5" ry="12.5"
      transform="rotate(-48 87.5 92)"/>
    <ellipse class="${foot}" cx="38" cy="132" rx="9" ry="4.5"/>
    <ellipse class="${foot}" cx="62" cy="132" rx="9" ry="4.5"/>
    <path class="pg-body" d="M50 38 C76 38 92 60 92 88 C92 115 75 131 50 131
      C25 131 8 115 8 88 C8 60 24 38 50 38 Z"/>
    <path class="pg-belly" d="${species === "Chinstrap" ? BELLY_FACE
      : BELLY_LOW}"/>
    ${PENGUIN_MARKS[species]}
    ${eye(35)}${eye(65)}
    ${bill}
  </g>`;
}
