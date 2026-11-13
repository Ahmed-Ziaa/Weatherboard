import { useEffect, useRef, useState } from 'react'
import FavouriteCities from '../components/FavouriteCities.jsx'
import Forecast from '../components/Forecast.jsx'
import Header from '../components/Header.jsx'
import Icon from '../components/Icon.jsx'
import WeatherReminder from '../components/WeatherReminder.jsx'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { locations } from '../data/locations.js'
import {
  areSameLocation,
  MAX_FAVOURITES,
  normalizeFavouriteLocations,
  readFavouriteLocations,
  writeFavouriteLocations,
} from '../services/favourites.js'
import { readLastWeather, saveLastWeather } from '../services/offlineWeather.js'
import { fetchCurrentWeather, fetchFiveDayForecast } from '../services/openWeather.js'

function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return 'Could not reach a weather service. Check your internet connection and try again.'
  }

  return error instanceof Error
    ? error.message
    : 'Weather could not be loaded. Please try again.'
}

function App() {
  const [offlineWeatherState, setOfflineWeatherState] = useState(() => readLastWeather())
  const offlineWeatherRef = useRef(offlineWeatherState)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedLocation, setSelectedLocation] = useState(
    () => offlineWeatherState.snapshot?.location || locations[0],
  )
  const [isDark, setIsDark] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [currentResult, setCurrentResult] = useState(() => {
    const snapshot = offlineWeatherState.snapshot
    return snapshot?.current
      ? {
          locationId: snapshot.location.id,
          status: 'success',
          data: snapshot.current,
          source: 'cache',
        }
      : null
  })
  const [forecastResult, setForecastResult] = useState(() => {
    const snapshot = offlineWeatherState.snapshot
    return snapshot?.forecast
      ? {
          locationId: snapshot.location.id,
          status: 'success',
          data: snapshot.forecast,
          source: 'cache',
        }
      : null
  })
  const [favouriteState, setFavouriteState] = useState(() => readFavouriteLocations())
  const [favouriteWeather, setFavouriteWeather] = useState({})
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' || navigator.onLine,
  )
  const favouriteLocations = favouriteState.favourites
  const favouriteStorageMessage = favouriteState.message

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentDate(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const cachedSnapshot =
      offlineWeatherRef.current.snapshot &&
      areSameLocation(offlineWeatherRef.current.snapshot.location, selectedLocation)
        ? offlineWeatherRef.current.snapshot
        : null

    setCurrentResult(cachedSnapshot?.current
      ? {
          locationId: selectedLocation.id,
          status: 'success',
          data: cachedSnapshot.current,
          source: 'cache',
        }
      : { locationId: selectedLocation.id, status: 'loading' },
    )
    setForecastResult(cachedSnapshot?.forecast
      ? {
          locationId: selectedLocation.id,
          status: 'success',
          data: cachedSnapshot.forecast,
          source: 'cache',
        }
      : { locationId: selectedLocation.id, status: 'loading' },
    )

    fetchCurrentWeather(selectedLocation, { signal: controller.signal })
      .then((data) => {
        setCurrentResult({
          locationId: selectedLocation.id,
          status: 'success',
          data,
          source: 'network',
        })
        cacheLastViewedWeather(selectedLocation, { current: data })
      })
      .catch((error) => {
        if (controller.signal.aborted) return

        if (cachedSnapshot?.current) {
          setCurrentResult({
            locationId: selectedLocation.id,
            status: 'success',
            data: cachedSnapshot.current,
            source: 'cache',
            error: getErrorMessage(error),
            isNetworkError: error instanceof TypeError,
          })
          return
        }

        setCurrentResult({
          locationId: selectedLocation.id,
          status: 'error',
          error: getErrorMessage(error),
          isNetworkError: error instanceof TypeError,
        })
      })

    fetchFiveDayForecast(selectedLocation, { signal: controller.signal })
      .then((data) => {
        setForecastResult({
          locationId: selectedLocation.id,
          status: 'success',
          data,
          source: 'network',
        })
        cacheLastViewedWeather(selectedLocation, { forecast: data })
      })
      .catch((error) => {
        if (controller.signal.aborted) return

        if (cachedSnapshot?.forecast) {
          setForecastResult({
            locationId: selectedLocation.id,
            status: 'success',
            data: cachedSnapshot.forecast,
            source: 'cache',
            error: getErrorMessage(error),
            isNetworkError: error instanceof TypeError,
          })
          return
        }

        setForecastResult({
          locationId: selectedLocation.id,
          status: 'error',
          error: getErrorMessage(error),
          isNetworkError: error instanceof TypeError,
        })
      })

    return () => controller.abort()
  }, [selectedLocation, retryCount])

  useEffect(() => {
    const controller = new AbortController()

    setFavouriteWeather(Object.fromEntries(
      favouriteLocations.map((location) => [location.id, { status: 'loading' }]),
    ))

    Promise.all(
      favouriteLocations.map(async (location) => {
        try {
          const data = await fetchCurrentWeather(location, { signal: controller.signal })
          return { id: location.id, status: 'success', data }
        } catch (error) {
          if (controller.signal.aborted) return null

          return {
            id: location.id,
            status: 'error',
            error: getErrorMessage(error),
          }
        }
      }),
    ).then((results) => {
      if (controller.signal.aborted) return

      setFavouriteWeather(Object.fromEntries(
        results
          .filter((result) => result !== null)
          .map(({ id, ...result }) => [id, result]),
      ))
    })

    return () => controller.abort()
  }, [favouriteLocations])

  useEffect(() => {
    const message = writeFavouriteLocations(favouriteLocations)
    setFavouriteState((current) => current.message === message
      ? current
      : { ...current, message },
    )
  }, [favouriteLocations])

  function cacheLastViewedWeather(location, update) {
    const state = saveLastWeather(
      location,
      update,
      offlineWeatherRef.current.snapshot,
    )
    offlineWeatherRef.current = state
    setOfflineWeatherState(state)
  }

  function updateFavouriteLocations(update) {
    setFavouriteState((current) => ({
      ...current,
      favourites: normalizeFavouriteLocations(update(current.favourites)),
    }))
  }

  function removeFavourite(location) {
    if (!window.confirm(`Remove ${location.name} from your favourite cities?`)) return

    updateFavouriteLocations((current) =>
      current.filter((saved) => !areSameLocation(saved, location)),
    )
  }

  const selectedFavourite = favouriteLocations.find((location) =>
    areSameLocation(location, selectedLocation),
  )
  const isFavouriteLimitReached = favouriteLocations.length >= MAX_FAVOURITES

  function toggleSelectedFavourite() {
    if (selectedFavourite) {
      removeFavourite(selectedFavourite)
      return
    }

    updateFavouriteLocations((current) =>
      current.length >= MAX_FAVOURITES ||
      current.some((location) => areSameLocation(location, selectedLocation))
        ? current
        : [...current, selectedLocation],
    )
  }

  const currentSelection = currentResult?.locationId === selectedLocation.id ? currentResult : null
  const forecastSelection = forecastResult?.locationId === selectedLocation.id ? forecastResult : null
  const currentStatus = currentSelection?.status || 'loading'
  const forecastStatus = forecastSelection?.status || 'loading'
  const weather = currentStatus === 'success' ? currentSelection.data : null
  const forecast = forecastStatus === 'success' ? forecastSelection.data : []
  const savedWeather = offlineWeatherState.snapshot &&
    areSameLocation(offlineWeatherState.snapshot.location, selectedLocation)
    ? offlineWeatherState.snapshot
    : null
  const savedRefreshFailed = Boolean(
    (currentSelection?.source === 'cache' && currentSelection.error) ||
    (forecastSelection?.source === 'cache' && forecastSelection.error),
  )
  const networkUnavailable = Boolean(
    currentSelection?.isNetworkError || forecastSelection?.isNetworkError,
  )
  const offlineMessage = !isOnline || networkUnavailable
    ? `${isOnline ? 'Network unavailable.' : "You're offline."} ${
        savedWeather
          ? `Showing the last saved weather for ${selectedLocation.name}.`
          : `No saved weather is available for ${selectedLocation.name}.`
      }`
    : savedRefreshFailed
      ? `Weather could not be refreshed. Showing saved weather for ${selectedLocation.name}.`
      : offlineWeatherState.message
  const currentBadgeLabel = currentStatus === 'success'
    ? currentSelection.source === 'cache' ? 'SAVED WEATHER' : 'LIVE WEATHER'
    : currentStatus === 'error'
      ? 'DATA UNAVAILABLE'
      : 'UPDATING'
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentDate)

  return (
    <div className={`weather-app${isDark ? ' theme-dark' : ''}`}>
      {offlineMessage && (
        <div className="offline-banner" role="status" aria-live="polite">
          <span className="offline-banner__dot" aria-hidden="true" />
          <span>{offlineMessage}</span>
        </div>
      )}
      <Header
        isDark={isDark}
        selectedLocation={selectedLocation}
        onCitySelect={setSelectedLocation}
        onThemeToggle={() => setIsDark((value) => !value)}
      />

      <main className="dashboard">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">YOUR PERSONAL WEATHER SPACE</p>
            <h1>A little more in tune with the day.</h1>
          </div>
          <div className="date-stamp">
            <span className="date-stamp__dot" />
            {dateLabel}
          </div>
        </div>

        <section className="current-card" aria-labelledby="current-city" aria-busy={currentStatus === 'loading'}>
          <div className="current-card__glow" />
          <div className="current-card__content">
            <div className="current-card__topline">
              <span className="current-card__label">CURRENT WEATHER</span>
              <span className={`live-badge live-badge--${currentStatus}`}>
                <span className={currentStatus === 'loading' ? 'live-badge__pulse' : ''} />
                {currentBadgeLabel}
              </span>
              <button
                aria-label={selectedFavourite
                  ? `Remove ${selectedLocation.name} from favourites`
                  : `Save ${selectedLocation.name} to favourites`}
                aria-pressed={Boolean(selectedFavourite)}
                className={`favourite-action${selectedFavourite ? ' favourite-action--saved' : ''}`}
                disabled={!selectedFavourite && isFavouriteLimitReached}
                onClick={toggleSelectedFavourite}
                title={!selectedFavourite && isFavouriteLimitReached
                  ? 'Remove a city before saving another.'
                  : selectedFavourite
                    ? 'Remove from favourites'
                    : 'Save to favourites'}
                type="button"
              >
                <Icon name="heart" />
                <span>
                  {selectedFavourite
                    ? 'Saved'
                    : isFavouriteLimitReached
                      ? 'Limit reached'
                      : 'Save city'}
                </span>
              </button>
            </div>

            <div className="current-card__location">
              <Icon name="pin" />
              <span id="current-city">
                {weather?.name || selectedLocation.name}
                {(weather?.country || selectedLocation.country) && `, ${weather?.country || selectedLocation.country}`}
              </span>
            </div>

            {currentStatus === 'success' ? (
              <>
                <div className="current-card__reading">
                  <div className="current-card__temperature">
                    {weather.temperature}<span>°</span>
                  </div>
                  <div className="current-card__condition">
                    <WeatherIcon type={weather.conditionKey} />
                    <div>
                      <strong>{weather.condition}</strong>
                      <span>Feels like {weather.feelsLike}°</span>
                    </div>
                  </div>
                </div>

                <div className="weather-metrics">
                  <div className="weather-metric">
                    <span className="weather-metric__icon"><Icon name="thermometer" /></span>
                    <span className="weather-metric__copy">
                      <span>High / low</span>
                      <strong>{weather.high}° <i>/</i> {weather.low}°</strong>
                    </span>
                  </div>
                  <div className="weather-metric">
                    <span className="weather-metric__icon"><Icon name="humidity" /></span>
                    <span className="weather-metric__copy">
                      <span>Humidity</span>
                      <strong>{weather.humidity}%</strong>
                    </span>
                  </div>
                  <div className="weather-metric">
                    <span className="weather-metric__icon"><Icon name="wind" /></span>
                    <span className="weather-metric__copy">
                      <span>Wind speed</span>
                      <strong>{weather.wind} <small>km/h</small></strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className={`weather-message weather-message--${currentStatus}`} role={currentStatus === 'error' ? 'alert' : 'status'}>
                {currentStatus === 'loading' && <span className="loading-spinner" />}
                <div>
                  <strong>{currentStatus === 'loading' ? 'Checking live conditions' : 'Could not load live weather'}</strong>
                  <span>
                    {currentStatus === 'loading'
                      ? 'Connecting to OpenWeatherMap…'
                      : currentSelection.error}
                  </span>
                </div>
                {currentStatus === 'error' && (
                  <button
                    className="retry-button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    type="button"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={`current-card__art${currentStatus === 'success' ? '' : ' current-card__art--quiet'}`} aria-hidden="true">
            <span className="orbit orbit--one" />
            <span className="orbit orbit--two" />
            <span className="weather-spark weather-spark--one" />
            <span className="weather-spark weather-spark--two" />
            {currentStatus === 'success' && <WeatherIcon type={weather.conditionKey} />}
            {currentStatus === 'success' && <div className="art-caption">
              <span className="art-caption__dot" />
              {currentSelection.source === 'cache'
                ? 'Saved for offline viewing'
                : `Live from ${weather.provider || 'OpenWeatherMap'}`}
            </div>}
            {currentStatus === 'loading' && <span className="loading-spinner loading-spinner--art" />}
          </div>
        </section>

        <div className="dashboard-grid">
          <Forecast
            errorMessage={forecastStatus === 'error' ? forecastSelection.error : ''}
            forecast={forecast}
            onRetry={() => setRetryCount((count) => count + 1)}
            status={forecastStatus}
          />
          <section className="sun-card" aria-labelledby="sun-card-title">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">TODAY'S LIGHT</p>
                <h2 id="sun-card-title">The golden hours</h2>
              </div>
              <span className="sun-card__icon"><Icon name="sun" /></span>
            </div>
            <div className="sun-times">
              <div className="sun-time">
                <span className="sun-time__icon sun-time__icon--rise"><Icon name="sunrise" /></span>
                <div>
                  <span>Sunrise</span>
                  <strong>{weather?.sunrise || '—'}</strong>
                </div>
              </div>
              <span className="sun-times__line" />
              <div className="sun-time">
                <span className="sun-time__icon sun-time__icon--set"><Icon name="sunset" /></span>
                <div>
                  <span>Sunset</span>
                  <strong>{weather?.sunset || '—'}</strong>
                </div>
              </div>
            </div>
            <p className="sun-card__note">
              {weather ? 'Times shown in local city time.' : currentStatus === 'loading' ? 'Loading local sunrise and sunset…' : 'Sunrise and sunset are unavailable.'}
            </p>
          </section>
        </div>

        <WeatherReminder location={selectedLocation} weather={weather} />

        <FavouriteCities
          cities={favouriteLocations}
          storageMessage={favouriteStorageMessage}
          onCitySelect={setSelectedLocation}
          onRemoveCity={removeFavourite}
          weatherByLocation={favouriteWeather}
        />

        <footer className="dashboard-footer">
          <span>MADE FOR THE MOMENT</span>
          <span>WeatherBoard <i>·</i> OpenWeatherMap with Open-Meteo fallback</span>
        </footer>
      </main>
    </div>
  )
}

export default App
