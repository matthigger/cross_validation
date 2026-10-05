# cross_validation

Interactive teaching demo of k-fold cross validation on twelve Palmer
penguins. Press **CV step** to run one round: the testing fold turns green,
the training folds blue, and each testing penguin gets its estimate. After
k rounds every penguin has exactly one estimate, made by a model that never
saw it. Two tabs:

- **Classification.** Nearest centroid on bill length and depth. Estimates
  start as `?` and take the outline of the estimated species (Adelie: eye
  rings, Chinstrap: white face and chin strap, Gentoo: crown band and
  orange bill), marked right or wrong. Ends with the CV accuracy.
- **Regression.** Least squares line, body mass from flipper length, on a
  scatter. Each round draws the line fit on the training folds and the
  residuals of the testing fold; the estimates become per-sample errors
  (actual minus estimate). Ends with the CV MSE.

Controls: k (2, 3, 4, 6, or 12 = leave-one-out) and the fold scheme:
sorted by species, shuffled, or (classification only) stratified, which
deals each species round-robin across the folds. Folds are contiguous
blocks of the displayed order, so sorted order with k = 3 leaves each
testing species out of training, and an unlucky shuffle can leave a fold
short of one: the motivation for stratified folds. The explanation and a
"Try this" list for the current tab sit above the demo. Arrow keys step back and forward; hovering a sample
highlights its estimate.

Plain HTML/CSS/JS with SVG: no build step and no dependencies.

## Run locally

Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Link straight to a tab with `index.html#classification` or
`index.html#regression`.

## Publish on GitHub Pages

```sh
gh repo create matthigger/cross_validation --public --source . --push
gh api -X POST repos/matthigger/cross_validation/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

The site then lives at <https://matthigger.github.io/cross_validation/>.

## Layout

| file | role |
|------|------|
| `index.html` | page, explanation text, controls |
| `style.css` | layout and the training / testing palette |
| `js/data.js` | the twelve penguins (Gorman, Williams & Fraser 2014) |
| `js/penguin.js` | penguin outline per species |
| `js/cv.js` | fold schemes, nearest centroid, least squares |
| `js/app.js` | state, drawing, controls |
