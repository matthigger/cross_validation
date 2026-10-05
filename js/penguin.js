// Penguin outlines, front view, drawn in a 100 x 140 box (feet at y = 136).
// Each species has one field mark a student can spot without colour:
// Adelie a ring round each eye, Chinstrap a strap under the chin, Gentoo a
// band over the crown and an orange bill.

const SPECIES = ["Adelie", "Chinstrap", "Gentoo"];

const PENGUIN_MARKS = {
  Adelie: `
    <circle class="pg-mark" cx="41" cy="29" r="5.5"/>
    <circle class="pg-mark" cx="59" cy="29" r="5.5"/>`,
  Chinstrap: `
    <path class="pg-mark strap" d="M30.5 39 Q50 57 69.5 39"/>`,
  Gentoo: `
    <path class="pg-mark" d="M36 25 Q37 13 50 13 Q63 13 64 25
      Q60 20 50 20 Q40 20 36 25 Z"/>`,
};

// Gentoo is drawn a little larger: it is the biggest of the three.
const PENGUIN_SCALE = { Adelie: 0.94, Chinstrap: 0.94, Gentoo: 1.0 };

/** Return SVG markup for one penguin outline, its body classed pg-body. */
function penguinSVG(species) {
  const s = PENGUIN_SCALE[species];
  const bill = species === "Gentoo"
    ? `<path class="pg-bill gentoo" d="M45 35 L55 35 L50 46 Z"/>`
    : `<path class="pg-bill" d="M46.5 36 L53.5 36 L50 43 Z"/>`;
  return `
  <g class="penguin ${species.toLowerCase()}"
     transform="translate(50 136) scale(${s}) translate(-50 -136)">
    <path class="pg-flipper" d="M31 56 C15 66 6 86 7 108 C16 100 24 89 30 79 Z"/>
    <path class="pg-flipper" d="M69 56 C85 66 94 86 93 108 C84 100 76 89 70 79 Z"/>
    <path class="pg-body" d="M50 8 C63 8 71 18 71 31 C71 40 68 45 70 52
      C80 66 86 84 84 102 C82 120 68 130 50 130 C32 130 18 120 16 102
      C14 84 20 66 30 52 C32 45 29 40 29 31 C29 18 37 8 50 8 Z"/>
    <path class="pg-belly" d="M38 54 C31 72 29 96 34 112 C40 124 60 124 66 112
      C71 96 69 72 62 54"/>
    <ellipse class="pg-foot" cx="40" cy="132" rx="8" ry="3.5"/>
    <ellipse class="pg-foot" cx="60" cy="132" rx="8" ry="3.5"/>
    ${PENGUIN_MARKS[species]}
    <circle class="pg-eye" cx="41" cy="29" r="2.2"/>
    <circle class="pg-eye" cx="59" cy="29" r="2.2"/>
    ${bill}
  </g>`;
}
