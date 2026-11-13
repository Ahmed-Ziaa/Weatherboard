# WeatherBoard

A responsive weather dashboard built with React, Vite, and JavaScript. Live conditions and the five-day forecast use OpenWeatherMap, with Open-Meteo as a fallback when OpenWeatherMap rate-limits requests. City autocomplete is provided by GeoDB Cities through RapidAPI.

## Architecture and APIs

The app is a client-side React single-page application. `App.jsx` coordinates selected-city weather, favourites, offline state, and reminders; reusable UI is in `src/components/`, while API and browser-storage logic is isolated in `src/services/`. No application backend is included.

- **OpenWeatherMap:** current conditions and the 5 Day / 3 Hour forecast.
- **Open-Meteo:** current conditions and daily forecast only when OpenWeatherMap returns HTTP 429; coordinates come from GeoDB or Open-Meteo geocoding.
- **GeoDB Cities via RapidAPI:** city autocomplete suggestions.
- **Browser APIs:** localStorage for favourites, offline weather and reminder preferences; service worker for the PWA shell and best-effort notifications.

## Getting started

1. Copy `.env.example` to `.env.local` and add your OpenWeatherMap and GeoDB RapidAPI keys.
2. Install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

3. If you change the API key, restart the development server.

Create a production build with `npm run build`, or preview it locally with `npm run preview`.

## Project structure

- `src/app/` — dashboard state, loading, and error handling
- `src/components/` — reusable dashboard, search, forecast, and favourites components
- `src/components/WeatherReminder.jsx` — permission-aware daily reminder controls and best-effort delivery
- `src/data/locations.js` — city names used for search suggestions and favourites; contains no weather readings
- `src/services/openWeather.js` — OpenWeatherMap requests, Open-Meteo rate-limit fallback, and response mapping
- `src/services/geoDb.js` — debounced city autocomplete requests and response mapping
- `src/services/favourites.js` — favourite city validation and local storage persistence
- `src/services/offlineWeather.js` — last-viewed weather persistence and offline fallback
- `src/services/weatherReminders.js` — local reminder preferences and notification delivery
- `src/styles/` — responsive dashboard styles and theme tokens
- `src/main.jsx` — React application bootstrap

City search suggestions are requested from GeoDB after a 300 ms pause. The input reports an empty-city validation error on blur or submit; GeoDB no-results and API failures are shown inline, with direct weather search still available. Selecting a GeoDB result loads its live weather and retains coordinates for the Open-Meteo fallback. If OpenWeatherMap responds with HTTP 429, the app requests current conditions and five forecast days from Open-Meteo. Other OpenWeatherMap errors are surfaced instead of silently switching providers. Favourite cards load their own current conditions. Weather is never replaced with placeholder data when a request fails.

Users can save up to five favourite cities. The list is stored in browser local storage and restored on reload; removing a city asks for confirmation.

The production build includes an installable web app manifest, icons, and a service worker that caches the app shell and static assets. The most recently viewed city's successfully loaded current weather and forecast are saved locally and used when a network refresh fails. An offline banner reports whether saved weather is available. Service workers are registered for production builds served over HTTPS or localhost.

## Weather reminders

The morning reminder panel saves the preferred local time and enabled state in browser storage. The browser's notification permission is requested only after the user reads the explanation and explicitly enables notifications. When granted, WeatherBoard checks the selected time while the app is running and shows a notification through the service worker when available, with the Notifications API as a fallback.

Web pages and service workers do not provide a reliable OS-level daily scheduler. A notification from the page's timer is best-effort only while WeatherBoard is open; background-tab throttling may delay one, and closing the browser/app prevents delivery. Guaranteed delivery after the app is closed requires a Web Push sender (normally a backend or a push provider) to store subscriptions and send scheduled push events. This client-only project does not configure one, so it does not claim closed-app delivery. The saved time is a preference, not a guaranteed alarm. Unsupported browsers and blocked permission are reported in the UI; when notifications are unavailable, the selected time remains saved but no reminder can be delivered.

## Known limitations

- Closed-app push reminders are not implemented; they require a Web Push sender and subscription storage.
- API keys prefixed with `VITE_` are visible in browser bundles. Use restricted, client-appropriate keys.
- Live weather and autocomplete require the corresponding keys and network access. The Open-Meteo fallback only covers OpenWeatherMap rate limits.

## Challenge submission status

- **Live URL:** Not deployed yet.
- **Public GitHub repository:** Not created; this workspace is not connected to a Git repository.
- **Prompt history and IDE:** See [PROMPTS.md](./PROMPTS.md). This project was worked on in VS Code with the Copilot SDK.

## API key note

Vite exposes `VITE_` variables in browser code. Use keys intended for client-side use and restrict them in OpenWeatherMap and RapidAPI where possible. Do not commit `.env` or `.env.local`.
