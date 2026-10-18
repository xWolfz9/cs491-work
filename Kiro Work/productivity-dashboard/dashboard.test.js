// Unit tests for the productivity-dashboard core logic modules.
// Uses Node's built-in test runner + node:assert/strict.
// The pure logic (quotes, weather URL/parse, task operations) is imported
// directly from the same ES modules index.html uses in the browser.
//
// Tag format: 'Feature: productivity-dashboard, <aspect>: ...'

import test from 'node:test';
import assert from 'node:assert/strict';

import { QUOTES, dayIndex, pickDailyQuote } from './quotes.js';
import {
  WEATHER_CONFIG,
  buildForecastUrl,
  buildGeocodeUrl,
  weatherCodeToText,
  parseCurrentWeather,
  FALLBACK_WEATHER,
} from './weather.js';
import {
  createTask,
  addTask,
  toggleTask,
  removeTask,
  completionPercent,
  progressColor,
  PROGRESS_COLORS,
} from './tasks.js';

// --------------------------------------------------------------------------
// Quotes
// --------------------------------------------------------------------------

// Feature: productivity-dashboard, Quotes: the library has at least 15 valid entries
test('Quotes: QUOTES has >= 15 non-empty entries', () => {
  assert.ok(Array.isArray(QUOTES));
  assert.ok(QUOTES.length >= 15, `expected >= 15 quotes, got ${QUOTES.length}`);
  for (const q of QUOTES) {
    assert.equal(typeof q.text, 'string');
    assert.ok(q.text.trim().length > 0, 'quote text must be non-empty');
    assert.equal(typeof q.author, 'string');
    assert.ok(q.author.trim().length > 0, 'quote author must be non-empty');
  }
});

// Feature: productivity-dashboard, Quotes: selection is deterministic per calendar day
test('Quotes: pickDailyQuote returns the same quote for the same date', () => {
  const date = new Date('2024-03-15T08:00:00Z');
  const first = pickDailyQuote(QUOTES, date);
  const second = pickDailyQuote(QUOTES, date);
  assert.ok(first, 'expected a quote');
  // Same object reference AND same text for repeated calls with the same day.
  assert.equal(first, second);
  assert.equal(first.text, second.text);

  // The modulo index must match dayIndex, proving real logic (not a constant).
  const expected = QUOTES[dayIndex(date) % QUOTES.length];
  assert.equal(first, expected);
});

// Feature: productivity-dashboard, Quotes: different dates yield valid quotes
test('Quotes: pickDailyQuote returns a valid quote for several dates', () => {
  const dates = [
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-06-30T12:00:00Z'),
    new Date('2024-12-31T23:00:00Z'),
    new Date('2025-02-14T06:00:00Z'),
  ];
  for (const d of dates) {
    const q = pickDailyQuote(QUOTES, d);
    assert.ok(q, `expected a quote for ${d.toISOString()}`);
    assert.ok(q.text.trim().length > 0);
    assert.ok(q.author.trim().length > 0);
    assert.ok(QUOTES.includes(q), 'returned quote must come from QUOTES');
  }
});

// Feature: productivity-dashboard, Quotes: null-safe on empty/invalid input
test('Quotes: pickDailyQuote returns null for empty or invalid lists', () => {
  assert.equal(pickDailyQuote([], new Date('2024-03-15T00:00:00Z')), null);
  assert.equal(pickDailyQuote(null, new Date('2024-03-15T00:00:00Z')), null);
});

// Feature: productivity-dashboard, Quotes: dayIndex advances by one each calendar day
test('Quotes: dayIndex increments by exactly one per calendar day', () => {
  const day1 = dayIndex(new Date('2024-01-01T12:00:00Z'));
  const day2 = dayIndex(new Date('2024-01-02T12:00:00Z'));
  assert.equal(typeof day1, 'number');
  assert.equal(day2, day1 + 1);
  // Same calendar day (different time) yields the same index (daily stability).
  assert.equal(dayIndex(new Date('2024-01-01T23:00:00Z')), day1);
});

// --------------------------------------------------------------------------
// Weather
// --------------------------------------------------------------------------

// Feature: productivity-dashboard, Weather: forecast URL carries coordinates + current_weather
test('Weather: buildForecastUrl includes lat/lon and current_weather=true', () => {
  const url = buildForecastUrl(40.7128, -74.006);
  assert.ok(url.startsWith(WEATHER_CONFIG.forecastBaseUrl));
  assert.match(url, /latitude=40\.7128/);
  assert.match(url, /longitude=-74\.006/);
  assert.match(url, /current_weather=true/);
});

// Feature: productivity-dashboard, Weather: geocode URL encodes the city name + fixed params
test('Weather: buildGeocodeUrl encodes the city name and query params', () => {
  const url = buildGeocodeUrl('New York');
  assert.ok(url.startsWith(WEATHER_CONFIG.geocodeBaseUrl));
  assert.match(url, /name=New\+York/); // space encoded as '+'
  assert.match(url, /count=1/);
  assert.match(url, /language=en/);
  assert.match(url, /format=json/);
});

// Feature: productivity-dashboard, Weather: WMO code map returns known + safe-default text
test('Weather: weatherCodeToText maps known codes and defaults for unknown', () => {
  assert.equal(weatherCodeToText(0), 'Clear sky ☀️');
  assert.ok(weatherCodeToText(61).length > 0);
  assert.notEqual(weatherCodeToText(61), weatherCodeToText(0));
  // Unknown / undefined codes fall back to a safe default.
  assert.equal(weatherCodeToText(9999), 'Unknown conditions 🌈');
  assert.equal(weatherCodeToText(undefined), 'Unknown conditions 🌈');
});

// Feature: productivity-dashboard, Weather: parse a representative Open-Meteo response
test('Weather: parseCurrentWeather extracts fields from a real-shaped payload', () => {
  const fixture = {
    latitude: 40.71,
    longitude: -74.0,
    current_weather: {
      temperature: 17.3,
      windspeed: 11.2,
      winddirection: 210,
      weathercode: 61,
      time: '2024-03-15T08:00',
    },
  };
  const parsed = parseCurrentWeather(fixture);
  assert.deepEqual(parsed, {
    temperatureC: 17.3,
    windspeed: 11.2,
    code: 61,
    description: weatherCodeToText(61),
  });
});

// Feature: productivity-dashboard, Weather: parse is null-safe on malformed input
test('Weather: parseCurrentWeather is null-safe on malformed input', () => {
  assert.equal(parseCurrentWeather(null), null);
  assert.equal(parseCurrentWeather({}), null);
  assert.equal(parseCurrentWeather({ current_weather: null }), null);

  // Present block with non-numeric fields -> individual nulls, no throw.
  const partial = parseCurrentWeather({
    current_weather: { temperature: 'warm', windspeed: null },
  });
  assert.equal(partial.temperatureC, null);
  assert.equal(partial.windspeed, null);
  assert.equal(partial.code, null);
  assert.equal(partial.description, 'Unknown conditions 🌈');
});

// Feature: productivity-dashboard, Weather: fallback reading has the expected shape
test('Weather: FALLBACK_WEATHER has a complete, sensible shape', () => {
  assert.equal(typeof FALLBACK_WEATHER.temperatureC, 'number');
  assert.equal(typeof FALLBACK_WEATHER.windspeed, 'number');
  assert.equal(typeof FALLBACK_WEATHER.code, 'number');
  assert.equal(typeof FALLBACK_WEATHER.description, 'string');
  assert.ok(FALLBACK_WEATHER.description.length > 0);
  // Description must be consistent with its own code via the real map.
  assert.equal(FALLBACK_WEATHER.description, weatherCodeToText(FALLBACK_WEATHER.code));
});

// --------------------------------------------------------------------------
// Tasks
// --------------------------------------------------------------------------

// Feature: productivity-dashboard, Tasks: createTask trims and defaults to not-done
test('Tasks: createTask produces a trimmed, not-done task with an id', () => {
  const task = createTask('  Write tests  ');
  assert.equal(task.title, 'Write tests');
  assert.equal(task.done, false);
  assert.equal(typeof task.id, 'string');
  assert.ok(task.id.length > 0);
});

// Feature: productivity-dashboard, Tasks: addTask appends without mutating the input
test('Tasks: addTask returns a new array and does not mutate input', () => {
  const original = [];
  const next = addTask(original, 'First task');
  assert.equal(original.length, 0, 'input must not be mutated');
  assert.equal(next.length, 1);
  assert.notEqual(next, original);
  assert.equal(next[0].title, 'First task');
});

// Feature: productivity-dashboard, Tasks: toggleTask flips done without mutating input
test('Tasks: toggleTask flips done without mutating input', () => {
  const original = [{ id: 'a', title: 'A', done: false }];
  const next = toggleTask(original, 'a');
  assert.equal(original[0].done, false, 'input must not be mutated');
  assert.equal(next[0].done, true);
  assert.notEqual(next, original);
  assert.notEqual(next[0], original[0]);

  // Toggling again returns to not-done.
  assert.equal(toggleTask(next, 'a')[0].done, false);
});

// Feature: productivity-dashboard, Tasks: removeTask removes by id without mutating input
test('Tasks: removeTask removes the matching task without mutating input', () => {
  const original = [
    { id: 'a', title: 'A', done: false },
    { id: 'b', title: 'B', done: true },
  ];
  const next = removeTask(original, 'a');
  assert.equal(original.length, 2, 'input must not be mutated');
  assert.equal(next.length, 1);
  assert.equal(next[0].id, 'b');
  assert.notEqual(next, original);
});

// Feature: productivity-dashboard, Tasks: completionPercent handles edge + mixed cases
test('Tasks: completionPercent is 0 empty, 100 all-done, rounded for mixed', () => {
  assert.equal(completionPercent([]), 0);
  assert.equal(
    completionPercent([
      { id: '1', title: '1', done: true },
      { id: '2', title: '2', done: true },
    ]),
    100
  );
  // 1 of 3 -> 33 (Math.round of 33.33...).
  assert.equal(
    completionPercent([
      { id: '1', title: '1', done: true },
      { id: '2', title: '2', done: false },
      { id: '3', title: '3', done: false },
    ]),
    33
  );
});

// Feature: productivity-dashboard, Tasks: progressColor matches PROGRESS_COLORS thresholds
test('Tasks: progressColor returns distinct colors across low/mid/high', () => {
  const low = progressColor(10);
  const mid = progressColor(55);
  const high = progressColor(100);

  // Distinct colors so the bar is visibly "colorful" as progress climbs.
  assert.notEqual(low, mid);
  assert.notEqual(mid, high);
  assert.notEqual(low, high);

  // Exact thresholds from the exported bands (first band where percent <= max).
  assert.equal(low, '#FF5370'); // <= 24
  assert.equal(mid, '#FFCB6B'); // <= 74
  assert.equal(high, '#4ADE80'); // <= 100 (complete)

  // Clamps out-of-range input to the valid bands.
  assert.equal(progressColor(-50), PROGRESS_COLORS[0].color);
  assert.equal(progressColor(999), PROGRESS_COLORS[PROGRESS_COLORS.length - 1].color);
});

// Feature: productivity-dashboard, Tasks: the purple "almost there" band at 99%
test('Tasks: progressColor(99) hits the purple band', () => {
  // The {max:99} band is reachable only at exactly 99% (98 hits amber,
  // 100 hits green), so assert the narrow purple band explicitly.
  assert.equal(progressColor(99), '#9B6DFF');
});
