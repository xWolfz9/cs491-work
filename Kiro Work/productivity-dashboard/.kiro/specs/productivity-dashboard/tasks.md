# Tasks — Productivity Dashboard

Implementation checklist, mirroring the spec-driven workflow.

## Scaffolding
- [x] Create project folder as a sibling of paddle-ball-game.
- [x] `package.json` with `"type": "module"`, `test` → `node --test`, `start` hint.
- [x] `.gitignore` with `node_modules/`.
- [x] `.kiro/specs/productivity-dashboard/` with requirements/design/tasks.

## Daily Motivation (quotes.js)
- [x] `QUOTES` frozen array (>= 15 entries).
- [x] `dayIndex(date)` helper.
- [x] `pickDailyQuote(quotes, date)` deterministic per calendar day.

## Weather (weather.js)
- [x] `WEATHER_CONFIG` default coordinates + label + Open-Meteo base URLs.
- [x] `buildForecastUrl` / `buildGeocodeUrl` pure URL builders.
- [x] `weatherCodeToText` WMO code map with safe default.
- [x] `parseCurrentWeather` null-safe parser (no fetch).
- [x] `FALLBACK_WEATHER` bundled reading.

## Task Tracker (tasks.js)
- [x] `createTask` / `addTask` / `toggleTask` / `removeTask` (immutable).
- [x] `completionPercent` (0..100, 0 for empty).
- [x] `PROGRESS_COLORS` thresholds + `progressColor` for colorful bars.

## Browser entry point (index.html)
- [x] Dark Kiro palette, header, three panels.
- [x] Live weather fetch wrapped in try/catch with fallback.
- [x] Task tracker with colorful progress bar + localStorage persistence.

## Testing + docs (FEAT-002)
- [ ] `dashboard.test.js` covering all three modules.
- [ ] `README.md` documenting run instructions + zero-key weather + offline fallback.
