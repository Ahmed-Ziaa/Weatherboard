const API_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const OPEN_METEO_API_URL = 'https://api.open-meteo.com/v1/forecast'
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

class OpenWeatherRequestError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'OpenWeatherRequestError'
    this.status = status
  }
}

function getApiKey() {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      'OpenWeatherMap API key is missing. Add VITE_OPENWEATHER_API_KEY to your .env.local file and restart Vite.',
    )
  }

  return apiKey
}

function getRequestError(status, location) {
  if (status === 400) {
    return `OpenWeatherMap could not resolve "${location.name}" as a valid location. Choose a city or town from the suggestions and try again.`
  }
  if (status === 401) {
    return 'OpenWeatherMap rejected the API key. Check that the key is correct and active.'
  }
  if (status === 403) {
    return 'This OpenWeatherMap key cannot access the requested weather endpoint. Check your API plan.'
  }
  if (status === 404) {
    return `OpenWeatherMap could not find weather for "${location.name}"${location.country ? `, ${location.country}` : ''}. Choose a valid city or town and try again.`
  }
  if (status === 429) {
    return 'OpenWeatherMap is rate-limiting requests. Wait a moment, then try again.'
  }
  if (status >= 500) {
    return 'OpenWeatherMap is temporarily unavailable. Please try again shortly.'
  }

  return `OpenWeatherMap request failed (HTTP ${status}). Please try again.`
}

async function request(endpoint, location, signal) {
  const hasLatitude = location.latitude !== undefined
  const hasLongitude = location.longitude !== undefined
  const hasCoordinates = hasLatitude && hasLongitude

  if (
    hasLatitude !== hasLongitude ||
    (hasCoordinates &&
      (!Number.isFinite(location.latitude) ||
        location.latitude < -90 ||
        location.latitude > 90 ||
        !Number.isFinite(location.longitude) ||
        location.longitude < -180 ||
        location.longitude > 180))
  ) {
    throw new Error(`"${location.name}" has invalid coordinates. Select the city again from the suggestions.`)
  }

  const params = new URLSearchParams({
    ...(hasCoordinates
      ? {
          lat: String(location.latitude),
          lon: String(location.longitude),
        }
      : { q: location.query || location.name }),
    appid: getApiKey(),
    units: 'metric',
  })
  const response = await fetch(`${API_BASE_URL}/${endpoint}?${params}`, { signal })

  if (!response.ok) {
    throw new OpenWeatherRequestError(
      response.status,
      getRequestError(response.status, location),
    )
  }

  try {
    return await response.json()
  } catch {
    throw new Error('OpenWeatherMap returned an unreadable response. Please try again.')
  }
}

async function getOpenMeteoCoordinates(location, signal) {
  if (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
  ) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
    }
  }

  const placeName = location.name.trim().split(',')[0]
  const params = new URLSearchParams({
    name: placeName,
    count: '1',
    language: 'en',
    format: 'json',
  })
  const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`Open-Meteo city lookup failed (HTTP ${response.status}).`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Open-Meteo returned an unreadable city lookup response.')
  }

  const result = payload.results?.[0]
  if (
    !result ||
    !Number.isFinite(result.latitude) ||
    !Number.isFinite(result.longitude)
  ) {
    throw new Error(`Open-Meteo could not locate "${location.name}". Try a more specific city name.`)
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country || location.country,
  }
}

async function requestOpenMeteo(location, signal) {
  const coordinates = await getOpenMeteoCoordinates(location, signal)
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  })
  const response = await fetch(`${OPEN_METEO_API_URL}?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`Open-Meteo weather fallback failed (HTTP ${response.status}).`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Open-Meteo returned an unreadable weather response.')
  }

  return { payload, country: coordinates.country }
}

async function requestOpenMeteoFallback(location, signal) {
  try {
    return await requestOpenMeteo(location, signal)
  } catch (error) {
    if (signal?.aborted) throw error

    const detail = error instanceof TypeError
      ? 'Check your internet connection and try again.'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred.'

    throw new Error(
      `OpenWeatherMap is rate-limiting requests. The Open-Meteo fallback could not be loaded. ${detail}`,
    )
  }
}

function getConditionKey(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'thunder'
  if (weatherId >= 300 && weatherId < 600) return 'rain'
  if (weatherId >= 600 && weatherId < 700) return 'snow'
  if (weatherId === 800) return 'sun'
  if (weatherId === 801) return 'partly'
  return 'cloudy'
}

function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : ''
}

function formatLocalTime(timestamp, timezoneOffset) {
  const localDate = new Date((timestamp + timezoneOffset) * 1000)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(localDate).replace(/ [AP]M$/, '')
}

const OPEN_METEO_CONDITIONS = {
  0: ['Clear sky', 'sun'],
  1: ['Mainly clear', 'sun'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'cloudy'],
  48: ['Rime fog', 'cloudy'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Heavy drizzle', 'rain'],
  56: ['Freezing drizzle', 'rain'],
  57: ['Heavy freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Heavy freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Light rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Heavy rain showers', 'rain'],
  85: ['Light snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'thunder'],
  96: ['Thunderstorm with hail', 'thunder'],
  99: ['Heavy thunderstorm with hail', 'thunder'],
}

function getOpenMeteoCondition(code) {
  const condition = OPEN_METEO_CONDITIONS[code]
  if (!condition) {
    throw new Error('Open-Meteo returned an unknown weather condition.')
  }

  return { condition: condition[0], conditionKey: condition[1] }
}

function formatOpenMeteoTime(value) {
  const match = typeof value === 'string' && value.match(/T(\d{2}):(\d{2})/)
  if (!match) {
    throw new Error('Open-Meteo returned an invalid sunrise or sunset time.')
  }

  const date = new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date).replace(/ [AP]M$/, '')
}

function normalizeCurrentWeather(payload, location) {
  const weather = payload.weather?.[0]
  const main = payload.main
  const timezone = payload.timezone

  if (
    !weather ||
    !main ||
    typeof main.temp !== 'number' ||
    typeof main.feels_like !== 'number' ||
    typeof main.temp_max !== 'number' ||
    typeof main.temp_min !== 'number' ||
    typeof main.humidity !== 'number' ||
    typeof weather.id !== 'number' ||
    typeof weather.description !== 'string' ||
    typeof payload.wind?.speed !== 'number' ||
    typeof timezone !== 'number' ||
    typeof payload.sys?.sunrise !== 'number' ||
    typeof payload.sys?.sunset !== 'number'
  ) {
    throw new Error('OpenWeatherMap returned incomplete current weather data. Please try again.')
  }

  return {
    name: Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? location.name
      : payload.name || location.name,
    country: location.country || payload.sys.country || '',
    temperature: Math.round(main.temp),
    feelsLike: Math.round(main.feels_like),
    condition: capitalize(weather.description),
    conditionKey: getConditionKey(weather.id),
    high: Math.round(main.temp_max),
    low: Math.round(main.temp_min),
    humidity: main.humidity,
    wind: Math.round(payload.wind.speed * 3.6),
    sunrise: formatLocalTime(payload.sys.sunrise, timezone),
    sunset: formatLocalTime(payload.sys.sunset, timezone),
    provider: 'OpenWeatherMap',
  }
}

function normalizeOpenMeteoCurrent(payload, location, country) {
  const current = payload.current
  const daily = payload.daily
  const condition = getOpenMeteoCondition(current?.weather_code)
  const high = daily?.temperature_2m_max?.[0]
  const low = daily?.temperature_2m_min?.[0]
  const sunrise = daily?.sunrise?.[0]
  const sunset = daily?.sunset?.[0]

  if (
    typeof current?.temperature_2m !== 'number' ||
    typeof current.apparent_temperature !== 'number' ||
    typeof current.relative_humidity_2m !== 'number' ||
    typeof current.wind_speed_10m !== 'number' ||
    typeof high !== 'number' ||
    typeof low !== 'number' ||
    typeof sunrise !== 'string' ||
    typeof sunset !== 'string'
  ) {
    throw new Error('Open-Meteo returned incomplete current weather data.')
  }

  return {
    name: location.name,
    country: country || location.country || '',
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    condition: condition.condition,
    conditionKey: condition.conditionKey,
    high: Math.round(high),
    low: Math.round(low),
    humidity: current.relative_humidity_2m,
    wind: Math.round(current.wind_speed_10m),
    sunrise: formatOpenMeteoTime(sunrise),
    sunset: formatOpenMeteoTime(sunset),
    provider: 'Open-Meteo',
  }
}

function normalizeForecast(payload) {
  if (!Array.isArray(payload.list) || typeof payload.city?.timezone !== 'number') {
    throw new Error('OpenWeatherMap returned incomplete forecast data. Please try again.')
  }

  const timezone = payload.city.timezone
  const days = new Map()

  for (const entry of payload.list) {
    if (typeof entry.dt !== 'number') {
      throw new Error('OpenWeatherMap returned an invalid forecast timestamp. Please try again.')
    }

    const localDate = new Date((entry.dt + timezone) * 1000)
    const dateKey = localDate.toISOString().slice(0, 10)
    const entries = days.get(dateKey) || []

    entries.push({ ...entry, localHour: localDate.getUTCHours() })
    days.set(dateKey, entries)
  }

  const today = new Date(Date.now() + timezone * 1000).toISOString().slice(0, 10)
  const forecast = [...days.entries()].slice(0, 5).map(([dateKey, entries]) => {
    const midday = entries.reduce((closest, entry) =>
      Math.abs(entry.localHour - 12) < Math.abs(closest.localHour - 12) ? entry : closest,
    )
    const date = new Date(`${dateKey}T12:00:00Z`)
    const temperatures = entries.map((entry) => entry.main?.temp_min ?? entry.main?.temp)
    const highs = entries.map((entry) => entry.main?.temp_max ?? entry.main?.temp)
    const rainChance = Math.max(...entries.map((entry) => entry.pop ?? 0))
    const weather = midday.weather?.[0]

    if (
      !weather ||
      typeof weather.id !== 'number' ||
      typeof weather.description !== 'string' ||
      temperatures.some((value) => typeof value !== 'number') ||
      highs.some((value) => typeof value !== 'number')
    ) {
      throw new Error('OpenWeatherMap returned incomplete daily forecast data. Please try again.')
    }

    return {
      day: dateKey === today
        ? 'Today'
        : new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date),
      date: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date),
      condition: capitalize(weather.description),
      conditionKey: getConditionKey(weather.id),
      high: Math.round(Math.max(...highs)),
      low: Math.round(Math.min(...temperatures)),
      rainChance: Math.round(rainChance * 100),
    }
  })

  if (forecast.length < 5) {
    throw new Error('OpenWeatherMap returned fewer than five forecast days. Please try again.')
  }

  return forecast
}

function normalizeOpenMeteoForecast(payload) {
  const daily = payload.daily
  const days = daily?.time
  if (
    !Array.isArray(days) ||
    days.length < 5 ||
    !Array.isArray(daily.weather_code) ||
    !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.temperature_2m_min)
  ) {
    throw new Error('Open-Meteo returned fewer than five forecast days.')
  }

  return days.slice(0, 5).map((dateKey, index) => {
    const high = daily.temperature_2m_max[index]
    const low = daily.temperature_2m_min[index]
    const condition = getOpenMeteoCondition(daily.weather_code[index])
    const date = new Date(`${dateKey}T12:00:00Z`)

    if (
      Number.isNaN(date.getTime()) ||
      typeof high !== 'number' ||
      typeof low !== 'number'
    ) {
      throw new Error('Open-Meteo returned incomplete daily forecast data.')
    }

    const rainChance = daily.precipitation_probability_max?.[index] ?? 0
    return {
      day: index === 0
        ? 'Today'
        : new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: 'UTC',
          }).format(date),
      date: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date),
      condition: condition.condition,
      conditionKey: condition.conditionKey,
      high: Math.round(high),
      low: Math.round(low),
      rainChance: typeof rainChance === 'number' ? Math.round(rainChance) : 0,
    }
  })
}

export async function fetchCurrentWeather(location, { signal } = {}) {
  try {
    const payload = await request('weather', location, signal)
    return normalizeCurrentWeather(payload, location)
  } catch (error) {
    if (!(error instanceof OpenWeatherRequestError) || error.status !== 429) {
      throw error
    }

    const { payload, country } = await requestOpenMeteoFallback(location, signal)
    return normalizeOpenMeteoCurrent(payload, location, country)
  }
}

export async function fetchFiveDayForecast(location, { signal } = {}) {
  try {
    const payload = await request('forecast', location, signal)
    return normalizeForecast(payload)
  } catch (error) {
    if (!(error instanceof OpenWeatherRequestError) || error.status !== 429) {
      throw error
    }

    const { payload } = await requestOpenMeteoFallback(location, signal)
    return normalizeOpenMeteoForecast(payload)
  }
}
