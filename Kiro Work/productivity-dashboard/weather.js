// Weather widget logic.
// Uses the Open-Meteo API, which requires NO API KEY.
// URL building and JSON parsing are kept PURE (no fetch) so they are testable
// with `node --test`; the actual network call lives in index.html and is
// wrapped in try/catch so the dashboard degrades gracefully offline.
//
// Spec: .kiro/specs/productivity-dashboard/{requirements,design,tasks}.md

// ----- Configuration -----
// Default location + base URLs. Change latitude/longitude/label to point the
// dashboard at a different city. No key or env var required.
export const WEATHER_CONFIG = Object.freeze({
  latitude: 40.7128,
  longitude: -74.006,
  label: 'New York, US',
  forecastBaseUrl: 'https://api.open-meteo.com/v1/forecast',
  geocodeBaseUrl: 'https://geocoding-api.open-meteo.com/v1/search',
});

// Build the Open-Meteo current-weather forecast URL for given coordinates.
export function buildForecastUrl(lat = WEATHER_CONFIG.latitude, lon = WEATHER_CONFIG.longitude) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: 'true',
  });
  return `${WEATHER_CONFIG.forecastBaseUrl}?${params.toString()}`;
}

// Build the Open-Meteo geocoding URL used to look up coordinates by city name.
export function buildGeocodeUrl(cityName) {
  const params = new URLSearchParams({
    name: String(cityName ?? ''),
    count: '1',
    language: 'en',
    format: 'json',
  });
  return `${WEATHER_CONFIG.geocodeBaseUrl}?${params.toString()}`;
}

// Map an Open-Meteo WMO weather code to a short description + emoji.
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WMO_CODES = Object.freeze({
  0: 'Clear sky ☀️',
  1: 'Mainly clear 🌤️',
  2: 'Partly cloudy ⛅',
  3: 'Overcast ☁️',
  45: 'Fog 🌫️',
  48: 'Depositing rime fog 🌫️',
  51: 'Light drizzle 🌦️',
  53: 'Moderate drizzle 🌦️',
  55: 'Dense drizzle 🌧️',
  56: 'Light freezing drizzle 🌧️',
  57: 'Dense freezing drizzle 🌧️',
  61: 'Slight rain 🌧️',
  63: 'Moderate rain 🌧️',
  65: 'Heavy rain 🌧️',
  66: 'Light freezing rain 🌧️',
  67: 'Heavy freezing rain 🌧️',
  71: 'Slight snow 🌨️',
  73: 'Moderate snow 🌨️',
  75: 'Heavy snow ❄️',
  77: 'Snow grains 🌨️',
  80: 'Slight rain showers 🌦️',
  81: 'Moderate rain showers 🌧️',
  82: 'Violent rain showers ⛈️',
  85: 'Slight snow showers 🌨️',
  86: 'Heavy snow showers ❄️',
  95: 'Thunderstorm ⛈️',
  96: 'Thunderstorm with slight hail ⛈️',
  99: 'Thunderstorm with heavy hail ⛈️',
});

export function weatherCodeToText(code) {
  return WMO_CODES[code] ?? 'Unknown conditions 🌈';
}

// Extract a tidy current-weather object from an Open-Meteo forecast response.
// Null-safe: returns null when the payload lacks current_weather data.
export function parseCurrentWeather(apiJson) {
  const current = apiJson && apiJson.current_weather;
  if (!current || typeof current !== 'object') return null;
  const code = typeof current.weathercode === 'number' ? current.weathercode : null;
  return {
    temperatureC: typeof current.temperature === 'number' ? current.temperature : null,
    windspeed: typeof current.windspeed === 'number' ? current.windspeed : null,
    code,
    description: code === null ? weatherCodeToText(undefined) : weatherCodeToText(code),
  };
}

// Bundled reading shown when the network call fails, so the panel always renders.
export const FALLBACK_WEATHER = Object.freeze({
  temperatureC: 21,
  windspeed: 8,
  code: 1,
  description: weatherCodeToText(1),
});
