const iconPaths = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </>
  ),
  moon: <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  thermometer: (
    <>
      <path d="M14 14.8V5a3 3 0 0 0-6 0v9.8a5 5 0 1 0 6 0Z" />
      <path d="M11 11v6" />
    </>
  ),
  humidity: (
    <>
      <path d="M12 3.5S5.5 11 5.5 15a6.5 6.5 0 0 0 13 0c0-4-6.5-11.5-6.5-11.5Z" />
      <path d="M9 16.5a3 3 0 0 0 3 3" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5M2 12h16a2.5 2.5 0 1 1-2.5 2.5M4 16h6a2 2 0 1 1-2 2" />
    </>
  ),
  sunrise: (
    <>
      <path d="M3 18h18M5 15a7 7 0 0 1 14 0M12 3v3m-7 0 2 2m12-2-2 2m-5 10v-4m-4 4v-2m8 2v-2" />
    </>
  ),
  sunset: (
    <>
      <path d="M3 18h18M5 15a7 7 0 0 1 14 0M12 3v3m-7 0 2 2m12-2-2 2m-5 10v-4m-4 4v-2m8 2v-2" />
    </>
  ),
}

function Icon({ name, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  )
}

export default Icon
