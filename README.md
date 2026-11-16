# 🌤️ WeatherBoard

A responsive and installable weather dashboard built with React and Vite. WeatherBoard allows users to search for cities, view real-time weather conditions, check a 5-day forecast, and save their favorite cities.

## 🚀 Live Demo

**[Open WeatherBoard](https://weatherboard-chi.vercel.app/)**

## ✨ Features

- **Current Weather:** View real-time temperature, humidity, wind speed, and weather conditions.
- **5-Day Forecast:** Check upcoming weather conditions.
- **City Search:** Search for cities worldwide.
- **City Autocomplete:** Get city suggestions with country information while typing.
- **Favorite Cities:** Save up to 5 favorite cities for quick access.
- **Local Storage:** Favorite cities and preferences persist after refreshing the page.
- **PWA Support:** Install WeatherBoard as an application on supported devices.
- **Offline Support:** Access previously viewed weather information when offline.
- **Dark & Light Mode:** Switch between themes.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

- React
- JavaScript
- Vite
- CSS3
- OpenWeatherMap API
- GeoDB Cities API
- Open-Meteo API
- Browser Local Storage
- Progressive Web App (PWA)
- Service Workers
- Vercel

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Ahmed-Ziaa/Weatherboard.git
```

### 2. Navigate to the Project

```bash
cd Weatherboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add your API keys:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEODB_API_KEY=your_geodb_api_key
```

Get your API keys from:

- [OpenWeatherMap](https://openweathermap.org/api)
- [GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities)

Open-Meteo can be used without an API key.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

### 6. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```text
Weatherboard/
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md
```

*Note: The structure above represents the main project organization. Folder and file names may vary slightly.*

## 📱 Responsive Design

WeatherBoard is designed to work across different screen sizes, including:

- Mobile devices
- Tablets
- Desktop screens

## 🌐 Deployment

The project is deployed on **Vercel**.

Live URL: https://weatherboard-chi.vercel.app/

---

Built with React and Vite.
