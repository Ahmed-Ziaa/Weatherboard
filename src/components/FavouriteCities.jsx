import Icon from './Icon.jsx'
import WeatherIcon from './WeatherIcon.jsx'

function FavouriteCities({ cities, storageMessage, weatherByLocation, onCitySelect, onRemoveCity }) {
  return (
    <section className="favourites-section" aria-labelledby="favourites-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PLACES YOU LOVE</p>
          <h2 id="favourites-title">Favourite cities</h2>
        </div>
        <span className="favourites-count">{cities.length} of 5 saved <Icon name="sun" /></span>
      </div>

      {storageMessage && (
        <p className="favourites-storage-message" role="status">{storageMessage}</p>
      )}

      {cities.length === 0 ? (
        <p className="favourites-empty">No favourite cities yet. Save the current city to get started.</p>
      ) : (
        <div className="favourite-grid">
          {cities.map((location, index) => {
            const result = weatherByLocation[location.id]
            const weather = result?.data

            return (
              <div className="favourite-city" key={location.id}>
                <button
                  className={`favourite-card favourite-card--${(index % 3) + 1}`}
                  onClick={() => onCitySelect(location)}
                  title={result?.error}
                  type="button"
                >
                  <span className="favourite-card__location">
                    <span className="favourite-card__pin"><Icon name="pin" /></span>
                    <span>
                      <strong>{location.name}</strong>
                      <small>{location.country}</small>
                    </span>
                    <span className="favourite-card__arrow">↗</span>
                  </span>
                  <span className="favourite-card__weather">
                    {weather ? (
                      <WeatherIcon type={weather.conditionKey} />
                    ) : (
                      <span className="favourite-card__weather-placeholder" aria-hidden="true" />
                    )}
                    <span className="favourite-card__temperature">
                      {weather ? `${weather.temperature}°` : result?.status === 'error' ? '—' : '··'}
                    </span>
                  </span>
                  <span className={`favourite-card__condition${result?.status === 'error' ? ' favourite-card__condition--error' : ''}`}>
                    {weather
                      ? weather.condition
                      : result?.status === 'error'
                        ? 'Weather unavailable'
                        : 'Loading live weather…'}
                  </span>
                  <span className="favourite-card__range">
                    {weather ? (
                      <>
                        <span>H: {weather.high}°</span>
                        <span>L: {weather.low}°</span>
                      </>
                    ) : (
                      <span>{result?.status === 'error' ? 'Select to retry' : 'Fetching current conditions'}</span>
                    )}
                  </span>
                </button>
                <button
                  aria-label={`Remove ${location.name} from favourites`}
                  className="favourite-card__remove"
                  onClick={() => onRemoveCity(location)}
                  title={`Remove ${location.name}`}
                  type="button"
                >
                  <Icon name="close" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default FavouriteCities
