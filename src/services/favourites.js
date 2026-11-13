import { favouriteLocations } from '../data/locations.js'

export const MAX_FAVOURITES = 5

const STORAGE_KEY = 'weatherboard:favourites'

function normalizeText(value) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function isValidLocation(location) {
  return Boolean(
    location &&
    typeof location.id === 'string' &&
    typeof location.name === 'string' &&
    location.name.trim() &&
    typeof location.country === 'string' &&
    (!location.countryCode || typeof location.countryCode === 'string') &&
    (!location.query || typeof location.query === 'string') &&
    (location.latitude === undefined || Number.isFinite(location.latitude)) &&
    (location.longitude === undefined || Number.isFinite(location.longitude)),
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

export function areSameLocation(first, second) {
  if (!first || !second) return false

  if (first.id && second.id && first.id === second.id) return true
  if (normalizeText(first.name) !== normalizeText(second.name)) return false

  const firstCountryCode = first.countryCode?.trim()
  const secondCountryCode = second.countryCode?.trim()
  if (firstCountryCode && secondCountryCode) {
    return normalizeText(firstCountryCode) === normalizeText(secondCountryCode)
  }

  const firstCountry = first.country?.trim()
  const secondCountry = second.country?.trim()
  if (firstCountry && secondCountry) {
    return normalizeText(firstCountry) === normalizeText(secondCountry)
  }

  return true
}

export function normalizeFavouriteLocations(locations) {
  const normalized = []

  for (const location of locations) {
    if (!isValidLocation(location)) continue

    const candidate = normalizeLocation(location)
    if (normalized.some((saved) => areSameLocation(saved, candidate))) continue
    normalized.push(candidate)
    if (normalized.length === MAX_FAVOURITES) break
  }

  return normalized
}

export function readFavouriteLocations() {
  const defaults = normalizeFavouriteLocations(favouriteLocations)

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { favourites: defaults, message: '' }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved favourites are not a list.')

    const favourites = normalizeFavouriteLocations(parsed)
    const hasInvalidEntries = parsed.some((location) => !isValidLocation(location))
    const wasTrimmed = favourites.length < parsed.length &&
      (parsed.length > MAX_FAVOURITES || !hasInvalidEntries)

    return {
      favourites,
      message: hasInvalidEntries || wasTrimmed
        ? 'Some saved favourites were invalid, duplicated, or beyond the five-city limit and were skipped.'
        : '',
    }
  } catch {
    return {
      favourites: defaults,
      message: 'Saved favourites could not be read. The default cities are shown for now.',
    }
  }
}

export function writeFavouriteLocations(locations) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizeFavouriteLocations(locations)),
    )
    return ''
  } catch {
    return 'Favourite changes are available for this session but could not be saved in this browser.'
  }
}
