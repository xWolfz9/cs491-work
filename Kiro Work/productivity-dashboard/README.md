# Productivity Dashboard

A personal productivity dashboard that puts three small widgets on one dark,
Kiro-styled page: a **daily motivation quote**, the **current weather**, and a
**task tracker with a colorful progress bar**. It is built as plain vanilla-JS
ES modules with no framework and no bundler, so the browser loads `index.html`
and imports the logic modules directly.

## Features

- **Daily Motivation** — shows one quote (text + author) chosen deterministically
  for the current calendar day, so it is stable all day and works fully offline.
- **Weather** — fetches the current temperature, a description + emoji, and the
  location label from [Open-Meteo](https://open-meteo.com/). It needs **no API
  key** and falls back to a bundled reading if the network is unavailable.
- **Task Tracker** — add, complete, and delete tasks. A progress bar fills with
  your completion percentage and changes color as you make progress (red → orange
  → amber → purple → green). The list is saved to `localStorage` between visits.

## Run

Open `index.html` in any modern browser.

> Note: `index.html` loads `quotes.js`, `weather.js`, and `tasks.js` as ES
> modules, so some browsers require it to be served over HTTP rather than opened
> via `file://`. From this folder:
>
> ```bash
> npx serve .      # or: python3 -m http.server
> ```
>
> then open the printed URL.

## Weather configuration

The weather widget uses the **Open-Meteo** forecast and geocoding APIs, which
require **no API key, no account, and no environment variable**. All URL building
and response parsing live in `weather.js` as pure functions; the actual network
call happens in `index.html` inside a `try/catch`.

- **Change the default city / coordinates:** edit `WEATHER_CONFIG` at the top of
  `weather.js`:

  ```js
  export const WEATHER_CONFIG = Object.freeze({
    latitude: 40.7128,
    longitude: -74.006,
    label: 'New York, US',
    // ...base URLs
  });
  ```

  Set `latitude`, `longitude`, and `label` to your location. You can look up
  coordinates with the geocoding helper (`buildGeocodeUrl(cityName)`).

- **Graceful offline fallback:** if the fetch fails (offline, blocked, or the API
  is unreachable), the panel renders `FALLBACK_WEATHER` instead of breaking, so
  the dashboard always shows something sensible.

## Project layout

```
productivity-dashboard/
├── index.html          # Browser entry point: three panels + DOM wiring (dark palette)
├── quotes.js           # Daily-quote logic (QUOTES, dayIndex, pickDailyQuote) — testable module
├── weather.js          # Open-Meteo URL building + parsing + fallback — testable module
├── tasks.js            # Task-tracker logic (add/toggle/remove, completion %, colors) — testable module
├── dashboard.test.js   # Node built-in test-runner suite covering all three modules
├── package.json
├── .gitignore
└── .kiro/specs/productivity-dashboard/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

## Testing

```bash
npm install
npm test
```

`npm test` runs Node's built-in test runner (`node --test`) over
`dashboard.test.js`, which covers:

- **Quotes** — deterministic per-day selection, valid quotes across dates, and a
  library of at least 15 entries.
- **Weather** — forecast/geocode URL contents, the WMO code → text map (including
  the safe default), null-safe parsing of an Open-Meteo response, and the fallback
  shape.
- **Tasks** — add/toggle/remove immutability (inputs are never mutated),
  `completionPercent` edge cases, and the `progressColor` thresholds.
