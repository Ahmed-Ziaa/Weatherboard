const API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities'
const API_HOST = 'wft-geo-db.p.rapidapi.com'

function getApiKey() {
  const apiKey = import.meta.env.VITE_GEODB_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      'GeoDB API key is missing. Add VITE_GEODB_API_KEY to your .env.local file and restart Vite.',
    )
  }

  return apiKey
}

function getRequestError(status) {
  if (status === 401) {
    return 'GeoDB could not authenticate the RapidAPI key. Check that the key is correct and active.'
  }
  if (status === 403) {
    return 'GeoDB city search is not enabled for this RapidAPI account. Check your subscription.'
  }
  if (status === 429) {
    return 'GeoDB city search has reached its request limit. Wait a moment, then try again.'
  }
  if (status >= 500) {
    return 'GeoDB city search is temporarily unavailable. Please try again shortly.'
  }

  return `GeoDB city search failed (HTTP ${status}). Please try again.`
}

export async function searchGeoDbCities(prefix, { signal } = {}) {
  const params = new URLSearchParams({
    namePrefix: prefix,
    limit: '7',
    sort: '-population',
    types: 'CITY',
  })
  const response = await fetch(`${API_URL}?${params}`, {
    headers: {
      'X-RapidAPI-Key': getApiKey(),
      'X-RapidAPI-Host': API_HOST,
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(getRequestError(response.status))
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('GeoDB returned an unreadable city-search response. Please try again.')
  }

  if (!Array.isArray(payload.data)) {
    throw new Error('GeoDB returned an invalid city-search response. Please try again.')
  }

  return payload.data
    .filter((city) =>
      city &&
      typeof city.id === 'number' &&
      typeof city.name === 'string' &&
      city.name.trim() &&
      typeof city.country === 'string' &&
      city.country.trim() &&
      typeof city.countryCode === 'string' &&
      city.countryCode.trim() &&
      (!city.type ||
        (typeof city.type === 'string' && city.type.trim().toUpperCase() === 'CITY')) &&
      ((city.latitude === undefined && city.longitude === undefined) ||
        (Number.isFinite(city.latitude) &&
          city.latitude >= -90 &&
          city.latitude <= 90 &&
          Number.isFinite(city.longitude) &&
          city.longitude >= -180 &&
          city.longitude <= 180)),
    )
    .map((city) => ({
      id: `geodb-${city.id}`,
      name: city.name.trim(),
      country: city.country.trim(),
      countryCode: city.countryCode.trim().toUpperCase(),
      query: `${city.name.trim()},${city.countryCode.trim().toUpperCase()}`,
      ...(Number.isFinite(city.latitude) && Number.isFinite(city.longitude)
        ? { latitude: city.latitude, longitude: city.longitude }
        : {}),
    }))
}
