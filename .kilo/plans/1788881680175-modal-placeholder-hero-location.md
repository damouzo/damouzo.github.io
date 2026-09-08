# Plan: Fix "Project Title" modal placeholder + location/remote label in hero

Scope: single-file static site (`index.html`, inline CSS + JS, deployed via GitHub Pages). Both changes are independent, small and zero-risk.

## Task 1 — Remove "Project Title" placeholder (modal)

### Root cause
The literal string `Project Title` exists only as the static fallback in the modal markup (`index.html:1870`):

```html
<h2 class="modal-title" id="modal-title">Project Title</h2>
```

`openModal()` (`index.html:2319`) already replaces it via `document.getElementById('modal-title').textContent = data.title;` (`index.html:2324`) *before* the overlay is shown, and all 9 `projectData` entries have a valid `title`. So the happy path works; the negative signal is the placeholder string itself, which remains in the source and in any render without JS (source scans, scraper tools, slow/no-JS client). Removing it costs nothing.

### Changes
1. `index.html:1870` — empty the fallback so the string disappears from the page and source:
   ```html
   <h2 class="modal-title" id="modal-title"></h2>
   ```
2. `index.html:2324` — 1-line hardening so a future project without `title` can never render `undefined` or stale text (keeps the existing title-before-overlay ordering):
   ```js
   document.getElementById('modal-title').textContent = data.title || '';
   ```

## Task 2 — Location/remote label under the hero name

User decision: dual-location label **below the name in the hero** (portada), like common dual-location conventions. The fixed metrics banner (10+ Years, 4 Countries…) stays untouched.

### Changes
1. `index.html:1289-1290` — insert a location line **between** `<h1>Daniel Mouzo</h1>` and `<p class="hero-description">`:
   ```html
   <p class="hero-location">📍 Vigo, Spain &amp; London, UK · Remote</p>
   ```
   - String is the user-specified dual-location ("Vigo, Spain & London, UK") plus the original `· Remote` suffix. Timezone `(CET)` intentionally dropped: two cities, two timezones.
   - `&` must be written as `&amp;` in HTML.
   - Adjustable in one line if the exact wording changes.

2. Add `.hero-location` CSS inside the existing `<style>` block, near the other hero rules (e.g., right after the `.hero-subtitle` rule) — a pill matching the site accents:
   ```css
   .hero-location {
     margin-top: 1.25rem;
     display: inline-flex;
     align-items: center;
     gap: 0.5rem;
     padding: 0.45rem 1rem;
     border: 1px solid rgba(240, 196, 107, 0.25);
     border-radius: 999px;
     background: rgba(255, 255, 255, 0.05);
     color: #ccc;
     font-size: 0.95rem;
     font-weight: 500;
   }
   ```
   No mobile-specific override needed; it flows with the existing hero padding (`@media (max-width: 768px)` `.hero { padding-left: 10% }`).

## Validation
1. `grep` `index.html` for `Project Title` → no matches.
2. Serve locally (`python3 -m http.server` or open the file) and:
   - Click each of the 9 project cards → modal title shows the real project title (not "Project Title"), tags/body render, close works.
   - Hero shows the location pill under the name; check desktop + mobile widths, no overlap/wrap issues, no console errors.
3. Commit + push to `main` to let GitHub Pages auto-deploy (only if the user asks).

## Notes / risks
- Zero-risk: two HTML edits + one CSS block + one optional JS fallback; no JS logic reordering.
- File is UTF-8 (`<meta charset="UTF-8">`), so `📍` renders correctly.
- Open detail already resolved with user: hero placement, dual-location text. Exact wording of the label remains a one-line tweak if the user refines it.