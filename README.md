# FloodGuard AI 🌊
### Municipal IoT Flood Monitoring, AI Risk Assessment & Emergency Response Command Center

FloodGuard AI is a complete full-stack municipal flood early-warning platform designed for emergency operations centers (EOC), municipal drainage authorities, and civil defense dispatchers.

---

## 🚀 Core Architecture Flow

```
[IoT Ultrasonic & Rain Sensors]
             ↓
    [ESP32 Microcontroller]
             ↓ (LoRa / WiFi)
[Raspberry Pi Edge Gateway]
             ↓ (MQTT / HTTPS Telemetry Ingestion)
[FloodGuard AI Express & Socket.IO Engine]
             ↓
[AI/ML Hydrological Risk & Anomaly Analyzer]
  ├── Rate-of-Rise Derivative Engine (5m / 15m / 1h)
  ├── 4-Parameter Mass-Balance Risk Scoring (0-100)
  ├── Z-Score Anomaly & Debris Restriction Detector
  └── Short-Term 1h / 3h / 6h Predictive Hydrograph Crest Model
             ↓
[Interactive Command Center GIS Dashboard]
  ├── Leaflet GIS Dynamic Hazard Radii & Flowlines
  ├── Real-Time Multi-Sensor Telemetry & Gauge Gauges
  ├── Emergency Alert Acknowledgement & Dispatch Engine
  └── Response Action Logging & Incident Audit Dossier
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React-Leaflet GIS, Recharts, Lucide Icons, Socket.IO-Client, Axios
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, Resilient In-Memory Hybrid Store Fallback
- **Database**: MongoDB (with zero-config fallback to high-speed in-memory store)
- **Deployment**: Ready for Netlify (frontend static + client fallback simulator) & Node.js server hosting (Railway/Render/Fly.io/Docker)

---

## ⚡ Quick Start

### 1. Install all dependencies:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the full application (Concurrent Dev Mode):
```bash
# From the root directory:
npm run dev
```

- **Frontend Command Center**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Demo Role Presets (1-Click Login)

| Role | Name | Email | Badge |
|---|---|---|---|
| **Municipal Commander** | Officer D. Vance | `officer.vance@floodguard.gov` | `EOC-COMMAND-01` |
| **Field Hydrologist** | Supervisor R. Chen | `engineer.chen@floodguard.gov` | `FIELD-ENG-08` |
| **Civil Defense Dispatcher** | Dispatcher Unit | `dispatcher@floodguard.gov` | `DISPATCH-11` |
| **System Admin** | Super Admin | `admin@floodguard.gov` | `ROOT-ADMIN` |

*Password for demo accounts: `password123` or use the 1-click login presets on the login screen.*

---

## 📡 IoT Ingestion API (ESP32 / Raspberry Pi)

Post live telemetry directly to the API endpoint:

```http
POST /api/telemetry/ingest
Content-Type: application/json

{
  "stationId": "ST-001",
  "waterLevel": 3.42,
  "rainfallIntensity": 28.5,
  "flowVelocity": 2.65,
  "batteryVoltage": 4.12,
  "signalRssi": -65
}
```

---

## 🌧️ Interactive Storm Scenarios

Operators can test the real-time AI response pipelines by switching scenarios in the command navbar:
1. **🌤️ Normal Weather**: Mild baseline conditions, stable water levels.
2. **🌧️ Heavy Rain Storm**: Sustained 40mm/h downpour elevating basin levels.
3. **⚡ Flash Flood Surge**: Sudden cloudburst triggering CRITICAL alerts and acoustic alarms.
4. **⚠️ Sensor Glitch / Fault**: Simulates LoRa packet loss and sensor sonar drift.
5. **🌈 Post-Storm Recovery**: Gravity discharge and pumps safely restoring channel freeboard.

---

## 🌐 Netlify Deployment

The project is pre-configured for instant deployment on Netlify with `netlify.toml`:
1. Build base directory: `client`
2. Build command: `npm run build`
3. Publish directory: `client/dist`
4. Standalone simulation engine runs automatically in browser when backend is not attached.
