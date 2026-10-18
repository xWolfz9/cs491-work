# Design — Productivity Dashboard

## Architecture

Static vanilla-JS web app. `index.html` is the only browser entry point; it loads
three ES modules via `<script type="module">`. There is no framework and no
bundler. The same modules are imported by the Node test suite, so all core logic
is testable in isolation.

```
index.html  ──imports──▶ quotes.js   (daily quote selection)
            ──imports──▶ weather.js  (URL building + parsing, no fetch)
            ──imports──▶ tasks.js    (immutable task operations + progress color)
```

## Modules

### quotes.js
- `QUOTES` — frozen array of `{ text, author }` (>= 15 entries).
- `dayIndex(date)` — 0-based day-of-year used as the modulo base.
- `pickDailyQuote(quotes, date)` — `quotes[dayIndex(date) % quotes.length]`.
  Pure and deterministic, so it works offline and is trivially testable.

### weather.js
- `WEATHER_CONFIG` — default `{ latitude, longitude, label }` plus the Open-Meteo
  base URLs. No API key or env var is required.
- `buildForecastUrl(lat, lon)` / `buildGeocodeUrl(cityName)` — pure URL builders.
- `weatherCodeToText(code)` — maps WMO weather codes to description + emoji, with
  a safe default for unknown codes.
- `parseCurrentWeather(apiJson)` — null-safe extraction of
  `{ temperatureC, windspeed, code, description }`. No fetch happens here.
- `FALLBACK_WEATHER` — bundled reading used when the live fetch fails.

The actual `fetch` lives only in `index.html`, wrapped in `try/catch`, so a
reviewer running offline still sees a populated weather panel.

### tasks.js
- `createTask(title)` — `{ id, title, done:false }` (id via `crypto.randomUUID()`
  with a non-crypto fallback for test environments).
- `addTask` / `toggleTask` / `removeTask` — all return NEW arrays.
- `completionPercent(list)` — integer 0..100, 0 for empty.
- `PROGRESS_COLORS` — exported threshold bands (red → orange → amber → purple →
  green) so the progress bar is colorful and the mapping is testable.
- `progressColor(percent)` — returns the band color for a percentage.

## Offline-graceful strategy

The only networked feature is weather. Because the pure functions never fetch,
the dashboard behaves identically whether online or offline except for the live
reading, which falls back to `FALLBACK_WEATHER`. The quote and task tracker have
no network dependency at all.
