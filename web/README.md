# Ezy Escape — React

Single-page React app converted from `index.php`.

## Run

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Assets

Copy your PHP site images into `public/images/`:

- `logo.png`
- `ju.png` (hero background)
- `bg.png` (experiences section background)

Unsplash fallbacks are used if these files are missing.

## Homestays data

The PHP version loaded stays from MySQL. This React app uses static data in `src/data/stays.js`. Connect your API there when ready.
