import { useEffect, useRef, useState } from 'react'
import {
  readWeatherReminderPreferences,
  saveWeatherReminderPreferences,
  showWeatherReminderNotification,
} from '../services/weatherReminders.js'
import Icon from './Icon.jsx'

function getPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }

  return Notification.permission
}

function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function WeatherReminder({ location, weather }) {
  const [storedState] = useState(() => readWeatherReminderPreferences())
  const [preferences, setPreferences] = useState(storedState.preferences)
  const preferencesRef = useRef(preferences)
  const [permission, setPermission] = useState(getPermissionState)
  const [storageMessage, setStorageMessage] = useState(storedState.message)
  const [reminderMessage, setReminderMessage] = useState('')
  const sendingRef = useRef(false)

  useEffect(() => {
    function refreshPermission() {
      setPermission(getPermissionState())
    }

    window.addEventListener('focus', refreshPermission)
    document.addEventListener('visibilitychange', refreshPermission)

    return () => {
      window.removeEventListener('focus', refreshPermission)
      document.removeEventListener('visibilitychange', refreshPermission)
    }
  }, [])

  useEffect(() => {
    preferencesRef.current = preferences
    const message = saveWeatherReminderPreferences(preferences)
    setStorageMessage((current) => current === message ? current : message)
  }, [preferences])

  useEffect(() => {
    if (
      permission === 'denied' ||
      permission === 'unsupported'
    ) {
      setPreferences((current) =>
        current.enabled ? { ...current, enabled: false } : current,
      )
    }
  }, [permission])

  useEffect(() => {
    if (!preferences.enabled || permission !== 'granted') return undefined

    let active = true

    async function checkReminderTime() {
      if (sendingRef.current) return

      const currentPreferences = preferencesRef.current
      if (!currentPreferences.enabled || Notification.permission !== 'granted') {
        setPermission(getPermissionState())
        setPreferences((current) => ({ ...current, enabled: false }))
        return
      }

      const now = new Date()
      const dateKey = getLocalDateKey(now)
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      if (
        currentTime < currentPreferences.time ||
        currentPreferences.lastNotifiedDate === dateKey
      ) {
        return
      }

      sendingRef.current = true
      try {
        await showWeatherReminderNotification({
          title: `Weather for ${location.name}`,
          body: weather
            ? `${weather.temperature}° and ${weather.condition}. Open WeatherBoard for your forecast.`
            : 'Your daily weather check-in is ready. Open WeatherBoard to see current conditions.',
        })

        if (!active) return
        setPreferences((current) => ({
          ...current,
          lastNotifiedDate: dateKey,
        }))
        setReminderMessage('Today’s reminder was sent.')
      } catch {
        if (active) {
          setReminderMessage('The reminder could not be sent. Check notification permissions and try again.')
        }
      } finally {
        sendingRef.current = false
      }
    }

    const intervalId = window.setInterval(checkReminderTime, 30_000)
    document.addEventListener('visibilitychange', checkReminderTime)
    checkReminderTime()

    return () => {
      active = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', checkReminderTime)
    }
  }, [location.name, permission, preferences.enabled, preferences.time, weather])

  async function enableReminders() {
    if (permission === 'granted') {
      setPreferences((current) => ({ ...current, enabled: true }))
      setReminderMessage('Daily reminders are enabled while WeatherBoard is open.')
      return
    }

    if (permission !== 'default') return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        setPreferences((current) => ({ ...current, enabled: true }))
        setReminderMessage('Daily reminders are enabled while WeatherBoard is open.')
      } else if (result === 'denied') {
        setPreferences((current) => ({ ...current, enabled: false }))
        setReminderMessage('Notifications were denied. Allow them in your browser’s site settings to enable reminders.')
      } else {
        setReminderMessage('Notification permission was not granted. You can enable it later.')
      }
    } catch {
      setReminderMessage('The browser could not request notification permission. Check your site settings.')
    }
  }

  const isUnsupported = permission === 'unsupported'
  const isDenied = permission === 'denied'
  const isEnabled = preferences.enabled && permission === 'granted'

  return (
    <section className="panel reminder-card" aria-labelledby="reminder-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">A GENTLE NUDGE</p>
          <h2 id="reminder-title">Morning weather reminder</h2>
        </div>
        <span className="reminder-card__icon"><Icon name="bell" /></span>
      </div>

      <p className="reminder-card__explanation">
        Choose when you’d like a daily weather check-in. Browser permission is needed
        to show notifications, and will only be requested when you press the button below.
        The time uses your device’s local clock.
      </p>

      <label className="reminder-card__time-label" htmlFor="weather-reminder-time">
        Preferred time
      </label>
      <div className="reminder-card__controls">
        <input
          id="weather-reminder-time"
          className="reminder-card__time"
          type="time"
          value={preferences.time}
          onChange={(event) => {
            setPreferences((current) => ({ ...current, time: event.target.value }))
            setReminderMessage('')
          }}
        />
        {isEnabled ? (
          <button
            className="reminder-card__button reminder-card__button--quiet"
            onClick={() => {
              setPreferences((current) => ({ ...current, enabled: false }))
              setReminderMessage('Daily reminders are paused.')
            }}
            type="button"
          >
            Pause reminders
          </button>
        ) : (
          <button
            className="reminder-card__button"
            disabled={isUnsupported || isDenied}
            onClick={enableReminders}
            type="button"
          >
            {isUnsupported
              ? 'Not supported'
              : isDenied
                ? 'Blocked in browser'
                : permission === 'granted'
                  ? 'Enable reminders'
                  : 'Allow notifications'}
          </button>
        )}
      </div>

      <p className={`reminder-card__status${isDenied || isUnsupported ? ' reminder-card__status--notice' : ''}`} role="status">
        {isUnsupported
          ? 'Notifications are not supported here. Your chosen time is saved, but reminders cannot be delivered by this browser.'
          : isDenied
            ? 'Notifications are blocked for this site. Change WeatherBoard’s notification permission to Allow in your browser’s site settings; this button will become available when you return.'
            : permission === 'granted'
              ? preferences.enabled
                ? `Enabled for ${preferences.time}. Delivery is best-effort while WeatherBoard is open.`
                : 'Permission granted. Reminders are currently paused.'
              : 'No permission has been requested yet. Your preferred time is saved locally.'}
      </p>
      {storageMessage && <p className="reminder-card__message" role="status">{storageMessage}</p>}
      {reminderMessage && <p className="reminder-card__message" role="status">{reminderMessage}</p>}
      <p className="reminder-card__limitation">
        Browser timing is best-effort: a reminder may be delayed in a background tab,
        and cannot be delivered while WeatherBoard is closed.
      </p>
    </section>
  )
}

export default WeatherReminder
