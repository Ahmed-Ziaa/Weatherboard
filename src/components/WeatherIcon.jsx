function WeatherIcon({ type, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`weather-icon weather-icon--${type} ${className}`.trim()}
      fill="none"
      viewBox="0 0 100 82"
    >
      {(type === 'sun' || type === 'partly') && (
        <g className="weather-icon__sun">
          <circle cx="63" cy="29" r="15" />
          <path d="M63 5v6m0 36v6M39 29h6m36 0h6M46 12l4 4m26 26 4 4m0-34-4 4m-26 26-4 4" />
        </g>
      )}
      {type === 'thunder' ? (
        <>
          <path className="weather-icon__cloud" d="M25 57h48a14 14 0 0 0 0-28 22 22 0 0 0-42-4 16 16 0 0 0-6 32Z" />
          <path className="weather-icon__bolt" d="m53 52-9 13h9l-5 12 16-18h-10l5-7" />
        </>
      ) : (
        ['cloudy', 'partly', 'rain', 'snow'].includes(type) && (
          <path
            className="weather-icon__cloud"
            d="M24 64h49a15 15 0 0 0 0-30h-1a23 23 0 0 0-44-5 17 17 0 0 0-4-1 18 18 0 0 0 0 36Z"
          />
        )
      )}
      {type === 'rain' && (
        <g className="weather-icon__rain">
          <path d="m39 71-3 6m17-6-3 6m17-6-3 6" />
        </g>
      )}
      {type === 'snow' && (
        <g className="weather-icon__snow">
          <circle cx="40" cy="74" r="2" />
          <circle cx="54" cy="74" r="2" />
          <circle cx="68" cy="74" r="2" />
        </g>
      )}
    </svg>
  )
}

export default WeatherIcon
