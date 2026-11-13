import { useEffect, useState } from 'react'
import { locations } from '../data/locations.js'
import { searchGeoDbCities } from '../services/geoDb.js'
import Icon from './Icon.jsx'

function Header({ selectedLocation, isDark, onCitySelect, onThemeToggle }) {
  const [query, setQuery] = useState('')
  const [cityValidationError, setCityValidationError] = useState('')
  const trimmedQuery = query.trim()
  const [suggestionState, setSuggestionState] = useState({
    query: '',
    status: 'idle',
    suggestions: [],
  })
  const matchingLocations = trimmedQuery
    ? locations.filter((location) =>
        `${location.name} ${location.country}`.toLowerCase().includes(trimmedQuery.toLowerCase()),
      )
    : []
  const liveSuggestions = suggestionState.query === trimmedQuery
    ? suggestionState.suggestions.filter((suggestion) =>
        !locations.some((location) =>
          location.name.toLowerCase() === suggestion.name.toLowerCase() &&
          location.country.toLowerCase() === suggestion.country.toLowerCase(),
        ),
      )
    : []
  const searchStatus = suggestionState.query === trimmedQuery
    ? suggestionState.status
    : trimmedQuery.length > 0
      ? 'debouncing'
      : 'idle'
  const searchError = suggestionState.query === trimmedQuery
    ? suggestionState.error
    : ''
  const hasExactMatch = [...matchingLocations, ...liveSuggestions].some((location) =>
    [location.name, `${location.name}, ${location.country}`]
      .some((name) => name.toLowerCase() === trimmedQuery.toLowerCase()),
  )

  useEffect(() => {
    if (!trimmedQuery) {
      setSuggestionState({ query: trimmedQuery, status: 'idle', suggestions: [] })
      return undefined
    }

    const controller = new AbortController()
    setSuggestionState({
      query: trimmedQuery,
      status: 'debouncing',
      suggestions: [],
    })

    const timer = setTimeout(() => {
      setSuggestionState({
        query: trimmedQuery,
        status: 'loading',
        suggestions: [],
      })

      searchGeoDbCities(trimmedQuery, { signal: controller.signal })
        .then((suggestions) => {
          setSuggestionState({
            query: trimmedQuery,
            status: 'success',
            suggestions,
          })
        })
        .catch((error) => {
          if (controller.signal.aborted) return

          setSuggestionState({
            query: trimmedQuery,
            status: 'error',
            suggestions: [],
            error: error instanceof TypeError
              ? 'Could not reach GeoDB. Check your internet connection and try again.'
              : error instanceof Error
                ? error.message
                : 'City suggestions could not be loaded. Please try again.',
          })
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmedQuery])

  function selectLocation(location) {
    onCitySelect(location)
    setQuery('')
    setCityValidationError('')
  }

  function selectGeoDbCity(city) {
    selectLocation(city)
  }

  function searchTypedCity() {
    if (!trimmedQuery) {
      setCityValidationError('Enter a city name before searching.')
      return
    }

    selectLocation({
      id: `search-${trimmedQuery.toLowerCase()}`,
      name: trimmedQuery,
      country: '',
      query: trimmedQuery,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!trimmedQuery) {
      setCityValidationError('Enter a city name before searching.')
      return
    }

    setCityValidationError('')
    if (matchingLocations[0]) {
      selectLocation(matchingLocations[0])
    } else if (liveSuggestions[0]) {
      selectGeoDbCity(liveSuggestions[0])
    } else {
      searchTypedCity()
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="#" aria-label="WeatherBoard home">
          <span className="brand__mark"><Icon name="sun" /></span>
          <span className="brand__copy">
            <strong>weatherboard</strong>
            <span>YOUR DAY, IN PERSPECTIVE</span>
          </span>
        </a>

        <form className="search-box" onSubmit={handleSubmit} role="search">
          <Icon name="search" className="search-box__icon" />
          <input
            aria-label="Search city"
            autoComplete="off"
            aria-describedby={cityValidationError && !trimmedQuery ? 'city-search-error' : undefined}
            aria-invalid={Boolean(cityValidationError && !trimmedQuery)}
            onBlur={() => {
              
            }}
            onChange={(event) => {
              setQuery(event.target.value)
              setCityValidationError('')
            }}
            placeholder="Search any city..."
            value={query}
          />
          {query && (
            <button
              aria-label="Clear city search"
              className="search-box__clear"
              onClick={() => setQuery('')}
              type="button"
            >
              ×
            </button>
          )}
          {(trimmedQuery || cityValidationError) && (
            <div className="search-results">
              {trimmedQuery ? (
                <>
                  <div className="search-results__options" role="listbox" aria-label="City search results">
                    {matchingLocations.map((location) => (
                      <button
                        aria-selected={location.id === selectedLocation.id}
                        className={`search-result${location.id === selectedLocation.id ? ' search-result--active' : ''}`}
                        key={location.id}
                        onClick={() => selectLocation(location)}
                        role="option"
                        type="button"
                      >
                        <span className="search-result__pin"><Icon name="pin" /></span>
                        <span>
                          <strong>{location.name}</strong>
                          <small>{location.country}</small>
                        </span>
                      </button>
                    ))}
                    {liveSuggestions.map((city) => (
                      <button
                        aria-selected={city.id === selectedLocation.id}
                        className={`search-result${city.id === selectedLocation.id ? ' search-result--active' : ''}`}
                        key={city.id}
                        onClick={() => selectGeoDbCity(city)}
                        role="option"
                        type="button"
                      >
                        <span className="search-result__pin"><Icon name="pin" /></span>
                        <span>
                          <strong>{city.name}</strong>
                          <small>{city.country}</small>
                        </span>
                      </button>
                    ))}
                    {!hasExactMatch && (
                      <button
                        aria-selected="false"
                        className="search-result search-result--custom"
                        onClick={searchTypedCity}
                        role="option"
                        type="button"
                      >
                        <span className="search-result__pin"><Icon name="search" /></span>
                        <span>
                          <strong>Search OpenWeatherMap</strong>
                          <small>Look up “{trimmedQuery}”</small>
                        </span>
                      </button>
                    )}
                  </div>
                  {searchStatus === 'debouncing' && (
                    <div className="search-results__status" role="status">
                      <span className="loading-spinner" />
                      Waiting for you to finish typing…
                    </div>
                  )}
                  {searchStatus === 'loading' && (
                    <div className="search-results__status" role="status">
                      <span className="loading-spinner" />
                      Searching GeoDB cities…
                    </div>
                  )}
                  {searchStatus === 'success' && liveSuggestions.length === 0 && matchingLocations.length === 0 && (
                    <div className="search-results__status" role="status">
                      No matching cities found. Try another spelling.
                    </div>
                  )}
                  {searchStatus === 'error' && (
                    <div className="search-results__status search-results__status--error" role="alert">
                      {searchError}
                    </div>
                  )}
                </>
              ) : (
                <div
                  id="city-search-error"
                  className="search-results__status search-results__status--error"
                  role="alert"
                >
                  {cityValidationError}
                </div>
              )}
            </div>
          )}
        </form>

        <button
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          aria-pressed={isDark}
          className="theme-toggle"
          onClick={onThemeToggle}
          type="button"
        >
          <Icon name={isDark ? 'sun' : 'moon'} />
          <span>{isDark ? 'Light' : 'Dark'} mode</span>
        </button>
      </div>
    </header>
  )
}

export default Header
