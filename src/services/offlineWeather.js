import { areSameLocation } from './favourites.js'

const STORAGE_KEY = 'weatherboard:last-weather'
const conditionKeys = new Set(['cloudy', 'partly', 'rain', 'snow', 'sun', 'thunder'])

function isLocation(location) {
  return Boolean(
    location &&
    typeof location.id === 'string' &&
    typeof location.name === 'string' &&
    typeof location.country === 'string' &&
    (!location.countryCode || typeof location.countryCode === 'string') &&
    (!location.query || typeof location.query === 'string') &&
    (location.latitude === undefined || Number.isFinite(location.latitude)) &&
    (location.longitude === undefined || Number.isFinite(location.longitude)),
  )
}

function isCurrentWeather(weather) {
  return Boolean(
    weather &&
    typeof weather === 'object' &&
    typeof weather.name === 'string' &&
    typeof weather.country === 'string' &&
    typeof weather.temperature === 'number' &&
    typeof weather.feelsLike === 'number' &&
    typeof weather.condition === 'string' &&
    conditionKeys.has(weather.conditionKey) &&
    typeof weather.high === 'number' &&
    typeof weather.low === 'number' &&
    typeof weather.humidity === 'number' &&
    typeof weather.wind === 'number' &&
    typeof weather.sunrise === 'string' &&
    typeof weather.sunset === 'string',
  )
}

function isForecast(forecast) {
  return Array.isArray(forecast) &&
    forecast.length === 5 &&
    forecast.every((day) =>
      day &&
      typeof day.day === 'string' &&
      typeof day.date === 'string' &&
      typeof day.condition === 'string' &&
      conditionKeys.has(day.conditionKey) &&
      typeof day.high === 'number' &&
      typeof day.low === 'number' &&
      typeof day.rainChance === 'number',
    )
}

function isSnapshot(snapshot) {
  return Boolean(
    snapshot &&
    isLocation(snapshot.location) &&
    (snapshot.current === null || isCurrentWeather(snapshot.current)) &&
    (snapshot.forecast === null || isForecast(snapshot.forecast)) &&
    (snapshot.current !== null || snapshot.forecast !== null),
  )
}

function normalizeLocation(location) {
  return {
    id: location.id,
    name: location.name.trim(),
    country: location.country.trim(),
    ...(location.countryCode ? { countryCode: location.countryCode.trim() } : {}),
    query: location.query?.trim() || location.name.trim(),
    ...(Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? { latitude: location.latitude, longitude: location.longitude }
      : {}),
  }
}

export function readLastWeather() {
  let stored

  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return {
      snapshot: null,
      message: 'Offline weather storage is unavailable in this browser.',
    }
  }

  if (stored === null) return { snapshot: null, message: '' }

  try {
    const snapshot = JSON.parse(stored)
    if (!isSnapshot(snapshot)) {
      return {
        snapshot: null,
        message: 'Saved offline weather was invalid and has been ignored.',
      }
    }

    return { snapshot, message: '' }
  } catch {
    return {
      snapshot: null,
      message: 'Saved offline weather could not be read and has been ignored.',
    }
  }
}

export function saveLastWeather(location, update, previousSnapshot) {
  const storedState = readLastWeather()
  const previous = previousSnapshot && areSameLocation(previousSnapshot.location, location)
    ? previousSnapshot
    : storedState.snapshot && areSameLocation(storedState.snapshot.location, location)
      ? storedState.snapshot
      : null
  const snapshot = {
    location: normalizeLocation(location),
    current: update.current ?? previous?.current ?? null,
    forecast: update.forecast ?? previous?.forecast ?? null,
    savedAt: Date.now(),
  }

  if (!isSnapshot(snapshot)) {
    return {
      snapshot: previous,
      message: 'Weather data was incomplete and could not be saved for offline use.',
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return { snapshot, message: '' }
  } catch {
    return {
      snapshot,
      message: 'Weather loaded, but could not be saved for offline use in this browser.',
    }
  }
}
