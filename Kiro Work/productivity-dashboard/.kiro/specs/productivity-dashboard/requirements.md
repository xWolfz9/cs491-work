# Requirements — Productivity Dashboard

A single-page personal productivity dashboard with three widgets, built as
vanilla JS ES modules so the core logic is testable with `node --test`.

## Requirement 1: Daily Motivation

1.1 The dashboard SHALL display one motivational quote (text + author).
1.2 The quote SHALL be chosen deterministically from a built-in library so the
    same calendar day always shows the same quote.
1.3 The quote selection SHALL work fully offline (no network dependency).

## Requirement 2: Weather

2.1 The dashboard SHALL show the current temperature, a short description with
    an emoji, and a location label.
2.2 Weather data SHALL come from the Open-Meteo API, which requires NO API key.
2.3 URL building and response parsing SHALL be pure functions with no network
    calls, so they can be unit-tested.
2.4 If the network request fails, the dashboard SHALL render a bundled fallback
    reading so the panel always displays something sensible.

## Requirement 3: Task Tracker

3.1 The user SHALL be able to add, toggle (complete/incomplete), and delete tasks.
3.2 Task operations SHALL be immutable (return new arrays, never mutate input).
3.3 The dashboard SHALL show a progress bar whose width equals the completion
    percentage and whose color changes with progress (colorful bands).
3.4 Completion percentage SHALL be an integer 0..100 and SHALL be 0 for an empty
    list.
3.5 The task list SHALL persist across reloads via localStorage, guarded for
    environments where storage is unavailable.
