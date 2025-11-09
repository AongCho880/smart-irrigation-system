# Smart Irrigation System (React + AI)

A modern, browser‑based smart irrigation dashboard built with React, TypeScript, and Vite. It connects to an ESP32‑based soil sensor and pump controller for live operation, or runs in a safe Demo mode to simulate and demonstrate AI‑assisted irrigation decisions without hardware.

## Key Features
- Live and Demo modes for soil moisture
  - Live: Read‑only, realtime values from ESP32, clearly tagged “Live”.
  - Demo: Manual slider to simulate soil moisture, clearly tagged “Demo”.
- AI Agronomist insights using Google Gemini
  - Actionable recommendation: “Irrigate” or “Hold” with a reason.
  - Confidence score and concise analysis points.
  - Auto‑refresh mode with lightweight updates and periodic full refreshes.
- Weather‑aware decisions
  - Live weather and 5‑day forecast via OpenWeather.
  - Regional selection (Country → Division → Zilla → Upazila) for quick location targeting.
- Pump control with safety rails
  - Manual toggles and AI mode with hysteresis and minimum ON/OFF times.
  - Clear activity log for traceability.
- Clean, responsive UI with charts and history
  - Moisture, temperature, and humidity display.
  - Time‑series chart of recent sensor readings.

## Architecture Overview
- Frontend: React 19 + TypeScript + Vite 6
- Charts: Recharts
- AI: `@google/genai` (Gemini 2.5 Flash)
- Weather: OpenWeather Geocoding, Current Weather, and 5‑Day/3‑Hour Forecast APIs
- Device: ESP32 HTTP endpoints (local network)

Core modules (selected):
- `App.tsx` — App state, routing of data, Live/Demo mode control.
- `components/SensorDisplay.tsx` — Moisture/Temp/Humidity + Live/Demo UI and slider.
- `components/AIInsights.tsx` — AI recommendation, auto‑refresh controls, status.
- `components/ControlPanel.tsx` — Pump ON/OFF and AI mode toggle.
- `components/WeatherDisplay.tsx` — Current/forecast weather.
- `components/DataChart.tsx` — Recent sensor data line chart.
- `services/geminiService.ts` — Gemini client + structured JSON response.
- `services/weatherService.ts` — OpenWeather geocoding + forecast aggregation.
- `types.ts` — Shared type definitions.

## Requirements
- Node.js 18+ (recommended 20+)
- npm 9+
- An OpenWeather API key (recommended for production)
- A Google Gemini API key
- Optional: ESP32 device on the same LAN exposing the endpoints below

## Quick Start
1. Install dependencies
   - `npm install`
2. Configure environment variables
   - Create `.env.local` in the project root with:
     - `GEMINI_API_KEY=your_gemini_api_key`
   - The Vite config maps `GEMINI_API_KEY` to `process.env.API_KEY` for the Gemini client.
3. Run the app in development
   - `npm run dev`
   - Open http://localhost:3000
4. Connect to your device (optional)
   - In the UI Device Connection panel, enter the ESP32 IP (e.g., `192.168.1.123`).
   - Click Connect. A green status dot indicates a successful connection.

Build for production
- `npm run build`
- Preview locally: `npm run preview`

## Live vs Demo Mode (Moisture)
- Connected to ESP32 (Live)
  - Moisture bar is read‑only, shows “Live”, and updates from the device.
- Disconnected (Demo)
  - Moisture shows a “Demo” tag and a slider. Drag to simulate values.
  - The chart and AI insights update in real time based on the simulated value.

## ESP32 Integration
The UI connects to a locally hosted ESP32 HTTP server using the following endpoints:

- GET `/status`
  - Returns the current state:
    ```json
    {
      "moisture": 47.5,
      "pumpStatus": "OFF"
    }
    ```
- POST `/pump`
  - Body: `{ "state": "ON" }` or `{ "state": "OFF" }`
  - Turns the pump on/off.

Notes
- The app polls `/status` roughly every 2 seconds when connected.
- Ensure your ESP32 includes CORS headers (e.g., `Access-Control-Allow-Origin: *`) so the browser can fetch from it.
- Your computer and the ESP32 must be on the same network.

## AI Insights
- Model: Gemini 2.5 Flash via `@google/genai`.
- The prompt is domain‑tuned for irrigation and instructs the model to return a strict JSON object with:
  - `decision`: `Irrigate` or `Hold`
  - `reason`: brief explanation
  - `analysis_points`: 2–3 short bullets
  - `confidence_score`: 0.0–1.0
- Auto‑refresh mode keeps recommendations fresh with cached‑weather updates every 30s and a periodic full refresh.
- Crop-aware decisions: set the crop type in Location Settings. The AI adjusts thresholds for water-loving vs. drought-tolerant crops when recommending irrigation.

Environment variable
- `GEMINI_API_KEY` — configured in `.env.local` and bound to `process.env.API_KEY` at build time (see `vite.config.ts`).

## Weather Data
- Sources data from OpenWeather:
  - Geocoding: resolve the location string to coordinates.
  - Current Weather: temperature/humidity.
  - 5‑Day/3‑Hour Forecast: aggregated to daily values with max precipitation probability per day.
- Region selector helps form the location string (Country/Division/Zilla/Upazila).

Production note
- `services/weatherService.ts` currently includes a default API key for convenience. Replace it with your own key or refactor to read from an environment variable before deploying to production.

## Pump Control Logic (when AI Mode is enabled)
- Hysteresis thresholds and safety timers (subject to change in code):
  - Turn ON if moisture ≤ ~30% and recommendation is `Irrigate` (minimum OFF cooldown applies).
  - Turn OFF if moisture ≥ ~55% or recommendation is `Hold` (minimum ON runtime applies).
- All actions are appended to the Activity Log.

## Scripts
- `npm run dev` — Start dev server at `http://localhost:3000`.
- `npm run build` — Production build with Vite.
- `npm run preview` — Preview the built app locally.

## Project Structure (partial)
```
smart-irrigation-system/
├─ components/
│  ├─ AIInsights.tsx
│  ├─ ControlPanel.tsx
│  ├─ DataChart.tsx
│  ├─ Header.tsx
│  ├─ HistoryLog.tsx
│  ├─ RegionSelector.tsx
│  ├─ SensorDisplay.tsx
│  └─ WeatherDisplay.tsx
├─ services/
│  ├─ geminiService.ts
│  └─ weatherService.ts
├─ data/regions.ts
├─ App.tsx
├─ index.tsx
├─ index.html
├─ types.ts
├─ vite.config.ts
└─ .env.local (not committed)
```

## Security & Privacy
- Do not commit `.env.local` or any API keys to version control.
- If hosting, configure secrets in your platform’s environment settings.
- The app makes direct requests from the browser to ESP32 and OpenWeather; avoid exposing your device publicly.

## Troubleshooting
- Cannot connect to ESP32
  - Verify the IP address (from Serial Monitor) and that your machine and device are on the same Wi‑Fi.
  - Confirm the ESP32 serves CORS headers for browser requests.
- AI key errors
  - Ensure `.env.local` contains `GEMINI_API_KEY` and restart the dev server after changes.
- Weather errors or wrong location
  - Check the Location Settings and try a more precise name.

## Roadmap Ideas
- Use environment variables for OpenWeather API key.
- Offline caching and PWA mode for field use.
- Multi‑device management and role‑based auth.
- Calibrations per soil/plant type.

---
This project is for educational and prototyping purposes. Verify recommendations with local agronomy best practices before acting in production.
