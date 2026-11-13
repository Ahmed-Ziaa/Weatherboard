const STORAGE_KEY = 'weatherboard:weather-reminder'
const DEFAULT_PREFERENCES = {
  enabled: false,
  time: '07:00',
  lastNotifiedDate: '',
}

function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function readWeatherReminderPreferences() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { preferences: DEFAULT_PREFERENCES, message: '' }

    const parsed = JSON.parse(stored)
    if (
      !parsed ||
      typeof parsed.enabled !== 'boolean' ||
      !isValidTime(parsed.time) ||
      (parsed.lastNotifiedDate !== undefined &&
        typeof parsed.lastNotifiedDate !== 'string')
    ) {
      return {
        preferences: DEFAULT_PREFERENCES,
        message: 'Saved reminder settings were invalid and have been reset.',
      }
    }

    return {
      preferences: {
        enabled: parsed.enabled,
        time: parsed.time,
        lastNotifiedDate: parsed.lastNotifiedDate || '',
      },
      message: '',
    }
  } catch {
    return {
      preferences: DEFAULT_PREFERENCES,
      message: 'Reminder settings could not be read from this browser.',
    }
  }
}

export function saveWeatherReminderPreferences(preferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    return ''
  } catch {
    return 'Reminder preferences are active for this session but could not be saved in this browser.'
  }
}

export async function showWeatherReminderNotification({ title, body }) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    throw new Error('Notification permission is not granted.')
  }

  if ('serviceWorker' in navigator) {
    let registration
    try {
      registration = await navigator.serviceWorker.getRegistration()
    } catch {
      registration = null
    }

    if (registration && typeof registration.showNotification === 'function') {
      await registration.showNotification(title, {
        body,
        icon: '/icons/weatherboard-192.png',
        badge: '/icons/weatherboard-192.png',
        tag: 'weatherboard-daily-reminder',
        data: { url: '/' },
      })
      return
    }
  }

  new Notification(title, { body, tag: 'weatherboard-daily-reminder' })
}
