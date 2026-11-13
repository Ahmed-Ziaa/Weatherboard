import Icon from './Icon.jsx'
import WeatherIcon from './WeatherIcon.jsx'

function Forecast({ forecast, status, errorMessage, onRetry }) {
  const rainDays = forecast.filter((day) => day.rainChance >= 35)
  const forecastNote = rainDays.length
    ? `${rainDays[0].day}: ${rainDays[0].rainChance}% chance of rain.`
    : 'No significant chance of rain in the coming days.'

  return (
    <section className="panel forecast-panel" aria-labelledby="forecast-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AHEAD OF THE WEEK</p>
          <h2 id="forecast-title">Five day forecast</h2>
        </div>
        <span className="section-heading__aside"><Icon name="sun" /> Local outlook</span>
      </div>

      {status === 'success' ? (
        <div className="forecast-list">
          {forecast.map((day) => (
            <article className={`forecast-day${day.day === 'Today' ? ' forecast-day--today' : ''}`} key={day.date}>
              <div className="forecast-day__date">
                <strong>{day.day}</strong>
                <span>{day.date}</span>
              </div>
              <WeatherIcon type={day.conditionKey} />
              <span className="forecast-day__condition">{day.condition}</span>
              <div className="forecast-day__temps">
                <strong>{day.high}°</strong>
                <span>{day.low}°</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={`forecast-state forecast-state--${status}`} role={status === 'error' ? 'alert' : 'status'}>
          {status === 'loading' && <span className="loading-spinner" />}
          <span>
            {status === 'loading'
              ? 'Loading the 5-day forecast…'
              : errorMessage}
          </span>
          {status === 'error' && (
            <button className="text-button" onClick={onRetry} type="button">Try again</button>
          )}
        </div>
      )}

      <div className="forecast-note">
        <span className="forecast-note__mark"><Icon name="humidity" /></span>
        <span>{status === 'success' ? forecastNote : 'Forecast details will appear when weather loads.'}</span>
        <span className="forecast-note__decoration">—</span>
      </div>
    </section>
  )
}

export default Forecast
