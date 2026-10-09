# Smart Factory Safety Helmet — Industrial Safety Pod Dashboard

> **Project Title:** Industrial Safety Pod: A Single-Unit Wearable Helmet System for Impact Detection and Industrial Safety Compliance  
> **Dashboard Title:** SMART FACTORY SAFETY — Helmet Monitoring & Incident Detection System

---

## 📋 Overview

This repository contains the complete full-stack IoT solution for monitoring a Smart Safety Helmet powered by an **ESP8266 NodeMCU**, **MPU6500 3-axis accelerometer**, and an **IR proximity sensor**.

The system monitors worker head-wear status and sudden physical shock vectors in real-time over local Wi-Fi, alerting safety supervisors of potential impact events.

---

## 🛠️ Technology Stack

- **Frontend Dashboard:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark industrial IoT palette, cyan/teal accents)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Device Firmware:** Arduino C++ (ESP8266 NodeMCU ESP-12E)
- **Sensor Hardware:** MPU6500 Accelerometer (±8g range over I²C), IR Proximity Sensor (GPIO13)
- **Communication Protocol:** REST API (JSON over HTTP with full CORS headers)

---

## 📂 Project Structure

```text
smart-factory-safety/
├── frontend/                     # React + Vite Web Dashboard
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── Header.jsx        # Top Navigation & Status Badges
│   │   │   ├── Sidebar.jsx       # Desktop & Mobile Drawer Menu
│   │   │   ├── OverviewCards.jsx # Telemetry & Metric Cards
│   │   │   ├── LiveTelemetryChart.jsx # Recharts Rolling Acceleration Graph
│   │   │   ├── AlertHistoryPanel.jsx  # Incident History Table & CSV Exporter
│   │   │   ├── DeviceSettingsPanel.jsx # ESP8266 REST API Inspector & Config
│   │   │   └── DemoSimulationPanel.jsx # Presentation Simulation Deck
│   │   ├── hooks/
│   │   │   └── useHelmetTelemetry.js   # Custom Hook & Alert Deduplication Engine
│   │   ├── services/
│   │   │   └── hardwareApi.js    # Fetch API wrapper with timeout & error handling
│   │   ├── constants/            # Default thresholds & status styles
│   │   ├── App.jsx               # Main Workspace App Layout
│   │   └── index.css             # Tailwind v4 & Industrial Theme CSS
│   ├── package.json
│   └── vite.config.js
├── firmware/                     # ESP8266 NodeMCU Firmware
│   ├── smart_factory_helmet.ino  # Production Arduino C++ Sketch
│   └── README.md                 # Firmware Setup & Pinout Diagram
└── README.md                     # Comprehensive Project Guide
```

---

## ⚡ Quick Start: Running the Web Dashboard

### Prerequisites
- Node.js `v18+` or `v20+`
- npm installed (`npm -v`)

### Steps

1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

---

## 📡 Hardware Wiring & Firmware Upload

### Hardware Pin Mapping

| Sensor | Sensor Pin | NodeMCU Pin | GPIO | Description |
|---|---|---|---|---|
| **MPU6500** | VCC | 3V3 | - | 3.3V Power |
| **MPU6500** | GND | GND | - | Ground |
| **MPU6500** | SDA | D5 | GPIO14 | I²C Data (0x68) |
| **MPU6500** | SCL | D6 | GPIO12 | I²C Clock |
| **IR Proximity** | VCC | 3V3 | - | 3.3V Power |
| **IR Proximity** | GND | GND | - | Ground |
| **IR Proximity** | OUT | D7 | GPIO13 | Digital Read (LOW = Object Detected) |

### Upload Steps

1. Open `firmware/smart_factory_helmet.ino` in Arduino IDE.
2. Update Wi-Fi SSID and Password lines:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```
3. Select Board: **NodeMCU 1.0 (ESP-12E Module)**.
4. Click **Upload** and open **Serial Monitor (115200 baud)**.
5. Copy the printed IP address (e.g., `http://192.168.1.100`).
6. In the Web Dashboard, go to **Device Settings** and paste the IP address.

---

## 🎯 Key Features & Presentation Highlights

1. **Dual Mode Operation:**
   - **Demo Mode:** Uses internal simulation deck to trigger high-impact shocks (4.5g / 6.2g), toggle IR helmet wear status, or simulate sensor failure without needing physical hardware attached.
   - **Live Hardware Mode:** Connects directly to the ESP8266 REST API endpoint.

2. **Real-time Vector Calculation:**
   - Calculates total acceleration magnitude $A = \sqrt{a_x^2 + a_y^2 + a_z^2}$.
   - Monitors 3-axis acceleration vectors ($X, Y, Z$) with rolling chart window.

3. **Alert Deduplication & Cooldown Logic:**
   - Prevents duplicate alert spamming during prolonged high-acceleration events.
   - Enables alert acknowledgment and instant CSV export.

4. **Experimental Limit Disclaimer:**
   - Configurable $3.2\text{ g}$ threshold clearly labeled as an unvalidated demonstration threshold.

---

## ❓ Troubleshooting & FAQs

- **CORS Error in Browser:**  
  The ESP8266 firmware sets `Access-Control-Allow-Origin: *` on all REST endpoints (`/api/status`, `/api/health`). Make sure you are accessing the IP via `http://`.
- **Dashboard shows "Device Offline":**  
  Ensure your laptop/PC and the ESP8266 are on the **same Wi-Fi network**. Verify the IP address in Arduino IDE Serial Monitor.
- **Sensor Error State:**  
  Verify MPU6500 wire connections to `D5` (SDA) and `D6` (SCL).
