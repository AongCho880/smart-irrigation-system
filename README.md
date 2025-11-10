# Smart Irrigation System (React + AI)

A modern, browser‑based smart irrigation dashboard built with React, TypeScript, and Vite. It connects to an ESP32‑based soil sensor and pump controller for live operation, or runs in a safe Demo mode to simulate and demonstrate AI‑assisted irrigation decisions without hardware.

**Demo User Interface**
- View a walkthrough of the app’s UI and flows: [Smart_Irrigation_System_Reordered_Presentation.pdf](Smart_Irrigation_System_Reordered_Presentation.pdf)

**Key Features**
- Live and Demo modes for soil moisture
  - Live: Read‑only, realtime values from ESP32, clearly tagged “Live”.
  - Demo: Manual slider to simulate soil moisture, clearly tagged “Demo”.
- AI agronomist insights using Google Gemini
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

**Architecture Overview**
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

**Requirements**
- Node.js 18+ (recommended 20+)
- npm 9+
- Google Gemini API key
- OpenWeather API key (recommended for production)
- Optional: ESP32 device on the same LAN exposing the endpoints below

**Quick Start**
- Install dependencies: `npm install`
- Configure env vars:
  - Create `.env.local` in project root:
    - `VITE_GEMINI_API_KEY=your_gemini_api_key`
    - `VITE_API_URL=http://localhost:4000`
  - Backend (in `server/`): set `MONGODB_URI` and `JWT_SECRET` in `server/.env`.
- Start backend: `cd server && npm run dev`
- Run the app: `npm run dev` then open `http://localhost:3000`
- Optional device connect: In the UI, enter ESP32 IP (e.g., `192.168.1.123`) and click Connect.

**Build & Preview**
- Build: `npm run build`
- Preview: `npm run preview`

**Live vs Demo Mode**
- Connected to ESP32 (Live): moisture bar is read‑only, shows “Live”, and updates from the device.
- Disconnected (Demo): moisture shows a “Demo” tag and a slider; chart and AI insights update in real time based on the simulated value.

**ESP32 Integration**
- Endpoints expected by the UI:
  - GET `/status` → current state, e.g. `{ "moisture": 47.5, "pumpStatus": "OFF" }`
  - POST `/pump` → body `{ "state": "ON" }` or `{ "state": "OFF" }`
- Notes
  - App polls `/status` roughly every 2 seconds when connected.
  - Ensure ESP32 includes CORS headers (e.g., `Access-Control-Allow-Origin: *`).
  - Your computer and the ESP32 must be on the same network.

**AI Insights**
- Model: Gemini 2.5 Flash via `@google/genai`.
- Prompt returns strict JSON with:
  - `decision`: `Irrigate` or `Hold`
  - `reason`: brief explanation
  - `analysis_points`: 2–3 short bullets
  - `confidence_score`: 0.0–1.0
- Auto‑refresh: frequent lightweight updates, periodic full refresh.
- Crop‑aware thresholds: set crop type in Location Settings.

**Environment Variables**
- Frontend: `VITE_GEMINI_API_KEY`, `VITE_API_URL`
- Server: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`

**Weather Data**
- OpenWeather sources: Geocoding, Current Weather, 5‑Day/3‑Hour Forecast
- Region selector assists (Country/Division/Zilla/Upazila)
- Production note: `services/weatherService.ts` has a default key for convenience; replace with your own before deploying.

**Pump Control Logic**
- Hysteresis and safety timers (subject to code):
  - Turn ON if moisture ≤ ~30% and AI recommends `Irrigate` (min OFF cooldown applies).
  - Turn OFF if moisture ≥ ~55% or AI recommends `Hold` (min ON runtime applies).
- All actions are added to the Activity Log.

**Scripts**
- `npm run dev` — Start dev server at `http://localhost:3000`.
- `npm run build` — Production build with Vite.
- `npm run preview` — Preview the built app locally.

**Project Structure (Partial)**
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

**Security & Privacy**
- Do not commit `.env.local` or any API keys to version control.
- If hosting, configure secrets in your platform’s environment settings.
- The app makes direct requests from the browser to ESP32 and OpenWeather; avoid exposing your device publicly.

**Troubleshooting**
- ESP32 connection issues: verify IP, same Wi‑Fi, and CORS headers.
- AI key errors: ensure `.env.local` has `VITE_GEMINI_API_KEY` and restart dev server after changes.
- Weather errors or wrong location: adjust Location Settings and try a more precise name.

**Roadmap**
- Use environment variables for OpenWeather API key.
- Offline caching and PWA mode for field use.
- Multi‑device management and role‑based auth.
- Calibrations per soil/plant type.

**Team**
- Minhajul Islam
- Aong Cho Thing Marma
- Jahirul Islam
- Md. Arman

**Supervisor**
- Dr. Mohammad Shahadat Hossain
- Professor, Department of Computer Science & Engineering
- University of Chittagong

---
This project is for educational and prototyping purposes. Verify recommendations with local agronomy best practices before acting in production.
