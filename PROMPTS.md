# WeatherBoard prompt history

**IDE used:** Visual Studio Code with the Copilot SDK.

The following is the user-provided prompt history in chronological order.

## 1. Project context
## 2. Project setup

> Set up a clean WeatherBoard project using React, Vite and JavaScript.
>
> Use a simple, modular folder structure suitable for a weather dashboard.
>
> Install only the essential dependencies needed for React development.
>
> Do not create any UI or additional features yet. Do not add a backend.
>
> Keep the project clean and ready for development.

## 3. Dashboard UI

> Build a modern, premium and visually unique WeatherBoard dashboard UI using React and CSS.
>
> Requirements:
>
> - Create a beautiful weather dashboard with a clean, modern layout.
> - Add a city search bar at the top.
> - Show current weather with temperature, condition, humidity and wind speed.
> - Add a 5-day forecast section.
> - Add a favourites cities section.
> - Include a dark/light theme toggle.
> - Make the design fully responsive for mobile, tablet and desktop.
> - Use modern cards, spacing, typography, subtle gradients and smooth animations.
> - Use reusable React components and clean CSS.
> - Use realistic placeholder weather data for UI preview only.
> - Do not integrate APIs or add backend functionality yet.
> - Do not install unnecessary dependencies.

## 4. OpenWeatherMap integration

> Integrate the OpenWeatherMap API into the existing WeatherBoard project.
>
> - Replace sample weather data with real API data.
> - Fetch current weather using the Current Weather API.
> - Fetch the 5-day forecast using the 5 Day / 3 Hour Forecast API.
> - Use the city selected through the existing search.
> - Display temperature, condition, humidity, wind, sunrise and sunset.
> - Add proper loading and error states.
> - Keep the existing UI and responsive design unchanged.
> - Read the API key from `import.meta.env.VITE_OPENWEATHER_API_KEY`.
> - Keep API logic in a separate service file.
> - Do not add a backend or unnecessary dependencies.
> - Do not use mock data as a fallback.

## 5. GeoDB autocomplete

> Integrate GeoDB Cities API into the existing city search.
>
> - Add live city autocomplete suggestions.
> - Show suggestions after the user pauses typing.
> - Debounce requests by 300ms.
> - Display city and country names.
> - Allow selecting a suggestion to load its weather.
> - Handle no results, loading and API errors.
> - Keep the existing UI unchanged.
> - Use a separate environment variable for the GeoDB API key.
> - Do not break existing weather search or favourites.
> - No unnecessary dependencies.

## 6. Visual refinement

> Improve the existing WeatherBoard UI to look more premium, modern and visually unique.
>
> Design direction:
>
> - Create a polished, premium weather dashboard.
> - Use beautiful weather-inspired gradients and a refined color palette.
> - Improve typography, spacing, cards, shadows and visual hierarchy.
> - Make the current weather section visually impressive.
> - Add subtle hover effects and smooth transitions.
> - Improve forecast and favourite city cards.
> - Refine dark and light themes.
> - Ensure excellent responsive design on mobile, tablet and desktop.
> - Keep all existing functionality and weather API integrations working.
> - Do not remove any existing features.
> - Do not add unnecessary dependencies.
> - Avoid generic dashboard templates.

## 7. Favorites

> Implement the Favorites functionality according to the WeatherBoard requirements.
>
> - Allow users to save a maximum of 5 favourite cities.
> - Store favourites in localStorage.
> - Restore favourites when the app reloads.
> - Allow users to remove favourite cities with a confirmation.
> - Show current weather for favourite cities using the existing API service.
> - Prevent duplicate cities.
> - Handle localStorage errors gracefully.
> - Keep the existing UI and design unchanged.
> - Do not add unnecessary dependencies.
> - Do not break existing features.

## 8. PWA and offline support

> Implement PWA and offline support in the existing WeatherBoard project according to the challenge PDF.
>
> Requirements:
>
> - Add a valid web app manifest.
> - Include app name, theme color, standalone display mode, and 192px and 512px icons.
> - Register a service worker.
> - Cache the application shell and static assets.
> - Cache the last-viewed city's weather data.
> - Allow users to view the last cached weather when offline.
> - Show a clear offline banner.
> - Handle network failures gracefully.
> - Ensure the app can be installed on supported devices.
> - Preserve all existing functionality and UI.
> - Do not add a backend or unnecessary dependencies.
> - Verify the production build.

## 9. Daily reminders

> Implement daily weather reminder notifications according to the WeatherBoard challenge PDF.
>
> - Let users choose their preferred morning reminder time.
> - Explain why notification permission is needed before requesting it.
> - Request browser notification permission only after user interaction.
> - Use the Notification API and service worker where supported.
> - Handle granted, denied and unsupported permission states.
> - Save reminder preferences locally.
> - Show a clear fallback message when notifications are unavailable.
> - Do not break existing PWA or weather features.
> - Do not add unnecessary dependencies.
> - Do not fake scheduled notifications when the browser cannot guarantee delivery.
> - Document any technical limitations in README.md.

## 10. Final project review

> Perform a final review of my WeatherBoard project.
>
> 1. Fix any remaining GeoDB autocomplete issues.
> 2. Verify OpenWeatherMap and GeoDB API integration.
> 3. Check all weather search, forecast, favourites and city autocomplete features.
> 4. Verify PWA installation and offline functionality.
> 5. Test morning weather reminders and notification states.
> 6. Check responsive design on mobile, tablet and desktop.
> 7. Check console errors and API error handling.
> 8. Verify .env and .gitignore configuration.
> 9. Do not expose or print API keys.
> 10. Do not add unnecessary features or dependencies.
> 11. Fix genuine issues and run npm run build.
>
> Give me a final report of completed features and remaining issues.


