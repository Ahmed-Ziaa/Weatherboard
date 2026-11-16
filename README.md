# 🌤️ WeatherBoard

A modern, responsive weather dashboard built with **React and Vite**. WeatherBoard provides real-time weather updates, a 5-day forecast, city search with autocomplete, favorite cities, offline access, and Progressive Web App (PWA) support.

## 🚀 Live Demo

**[https://weatherboard-chi.vercel.app/](https://weatherboard-chi.vercel.app/)**

## ✨ Features

- **Current Weather:** View real-time temperature, humidity, wind speed, and weather conditions.
- **5-Day Forecast:** Check upcoming weather conditions.
- **City Search:** Search for cities around the world.
- **City Autocomplete:** Get city suggestions with country information.
- **Favorite Cities:** Save and manage up to 5 favorite cities.
- **Local Storage:** Persist favorite cities and weather preferences.
- **Offline Support:** Access previously viewed weather information without an internet connection.
- **PWA Support:** Install WeatherBoard on supported devices.
- **Weather Reminders:** Configure daily weather reminder preferences.
- **Dark & Light Mode:** Switch between themes.
- **Responsive UI:** Optimized for mobile, tablet, and desktop screens.

## 🛠️ Tech Stack

- React
- JavaScript
- Vite
- CSS3
- OpenWeatherMap API
- GeoDB Cities API
- Open-Meteo API
- Local Storage
- Service Workers
- Progressive Web App (PWA)
- Vercel

## 📁 Project Structure

```text
Weatherboard/
│
├── public/
│   ├── icons/
│   │   ├── weatherboard-192.png
│   │   └── weatherboard-512.png
│   ├── manifest.webmanifest
│   └── sw.js
│
├── src/
│   ├── app/
│   │   └── App.jsx
│   │
│   ├── components/
│   │   ├── FavouriteCities.jsx
│   │   ├── Forecast.jsx
│   │   ├── Header.jsx
│   │   ├── Icon.jsx
│   │   ├── WeatherIcon.jsx
│   │   └── WeatherReminder.jsx
│   │
│   ├── data/
│   │   └── locations.js
│   │
│   ├── services/
│   │   ├── favourites.js
│   │   ├── geoDb.js
│   │   ├── offlineWeather.js
│   │   ├── openWeather.js
│   │   └── weatherReminders.js
│   │
│   ├── styles/
│   │   └── index.css
│   │
│   └── main.jsx
│
├── .gitignore
├── PROMPTS.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ahmed-Ziaa/Weatherboard.git
```

### 2. Open Project Directory

```bash
cd Weatherboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
VITE_GEODB_API_KEY=your_geodb_api_key
```

API providers:

- [OpenWeatherMap](https://openweathermap.org/api)
- [GeoDB Cities – RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities)

Open-Meteo does not require an API key.

### 5. Run Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 6. Production Build

```bash
npm run build
```

## 🌐 Deployment

WeatherBoard is deployed using **Vercel**.

**Live Website:** https://weatherboard-chi.vercel.app/

## 📱 Responsive Design

WeatherBoard supports different screen sizes:

- Mobile devices
- Tablets
- Desktop screens

---

**WeatherBoard** — Your weather, at a glance. 🌤️
