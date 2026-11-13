const CACHE_NAME = 'weatherboard-shell-v3'
const REQUIRED_ASSETS = [
  '/manifest.webmanifest',
  '/icons/weatherboard-192.png',
  '/icons/weatherboard-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const shellResponse = await fetch('/index.html')

    if (!shellResponse.ok) {
      throw new Error(`Could not cache the app shell (HTTP ${shellResponse.status}).`)
    }

    const shell = await shellResponse.clone().text()
    await cache.put('/', shellResponse.clone())
    await cache.put('/index.html', shellResponse)

    const assetUrls = [...shell.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map(([, path]) => new URL(path, self.location.origin))
      .filter((url) =>
        url.origin === self.location.origin &&
        /\.(?:js|css)$/.test(url.pathname),
      )

    await Promise.all([
      ...REQUIRED_ASSETS.map(async (path) => {
        const response = await fetch(path)
        if (!response.ok) {
          throw new Error(`Could not cache ${path} (HTTP ${response.status}).`)
        }
        await cache.put(path, response)
      }),
      ...assetUrls.map(async (url) => {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Could not cache ${url.pathname} (HTTP ${response.status}).`)
        }
        await cache.put(url.href, response)
      }),
    ])

    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('weatherboard-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request)
      } catch {
        return (await caches.match('/index.html')) || Response.error()
      }
    })())
    return
  }

  if (!['script', 'style', 'font', 'image', 'manifest'].includes(request.destination)) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached

    try {
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    } catch {
      return Response.error()
    }
  })())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    const existingWindow = windows.find((client) => 'focus' in client)

    if (existingWindow) {
      await existingWindow.focus()
      return
    }

    await self.clients.openWindow(event.notification.data?.url || '/')
  })())
})
