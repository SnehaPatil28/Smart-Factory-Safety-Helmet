# ESP8266 Firmware Setup & Upload Instructions

## Hardware Connection Diagram

| Component | NodeMCU Pin | ESP8266 GPIO | Description |
|---|---|---|---|
| **MPU6500 VCC** | `3V3` | - | 3.3V Power |
| **MPU6500 GND** | `GND` | - | Ground |
| **MPU6500 SDA** | `D5` | `GPIO14` | I²C Data (Address 0x68) |
| **MPU6500 SCL** | `D6` | `GPIO12` | I²C Clock |
| **IR Sensor VCC** | `3V3` | - | 3.3V Power |
| **IR Sensor GND** | `GND` | - | Ground |
| **IR Sensor OUT** | `D7` | `GPIO13` | Digital Input (LOW = Object Detected) |

---

## Required Arduino IDE Libraries

Install the following libraries via **Arduino IDE -> Tools -> Manage Libraries...**:

1. **ArduinoJson** (by Benoit Blanchon) - Version 6.x or 7.x
2. **ESP8266WebServer** (built into ESP8266 Arduino Core)
3. **Wire** (built into Arduino Core)

---

## Arduino IDE Board Configuration

1. Go to **File -> Preferences**.
2. Add the following URL to **Additional Boards Manager URLs**:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. Go to **Tools -> Board -> Boards Manager...**, search for `esp8266` and install the package.
4. Select **Tools -> Board -> ESP8266 Boards -> NodeMCU 1.0 (ESP-12E Module)**.
5. Set **Upload Speed**: `115200` or `921600`.
6. Select your COM port under **Tools -> Port**.

---

## Wi-Fi Configuration

Open `smart_factory_helmet.ino` and update lines 24–25 with your local Wi-Fi credentials:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

> **Note:** Ensure your laptop running the dashboard and the ESP8266 NodeMCU are connected to the **same 2.4GHz Wi-Fi network**.

---

## Flash / Upload Steps

1. Connect NodeMCU ESP-12E to your PC via Micro-USB cable.
2. Open `smart_factory_helmet.ino` in Arduino IDE.
3. Click the **Upload** button (`Ctrl + U`).
4. Open the **Serial Monitor** (**Tools -> Serial Monitor**) and set the baud rate to **`115200`**.
5. Once booted, copy the printed IP address (e.g. `http://192.168.1.100`) to use in the React Dashboard.

---

## Hardware REST API Documentation

### 1. `GET /api/status`
Returns real-time telemetry from MPU6500 accelerometer and IR proximity sensor. Includes CORS header `Access-Control-Allow-Origin: *`.

#### Response Example:
```json
{
  "deviceId": "helmet-01",
  "connected": true,
  "uptimeSeconds": 120,
  "sensorStatus": "OK",
  "acceleration": {
    "x": 0.02,
    "y": -0.05,
    "z": 0.98,
    "magnitude": 0.98
  },
  "irSensor": {
    "rawState": 0,
    "objectDetected": true
  },
  "thresholdG": 3.2,
  "systemStatus": "NORMAL",
  "timestamp": "Uptime: 0d 0h 2m 0s"
}
```

### 2. `GET /api/health`
Returns system diagnostics, Wi-Fi RSSI signal strength, and memory allocation.

```json
{
  "status": "HEALTHY",
  "mpu6500": "ONLINE",
  "irSensorPin": 13,
  "wifiRssi": -58,
  "ipAddress": "192.168.1.100",
  "freeHeap": 42128,
  "uptimeSeconds": 120
}
```

### 3. `GET /api/history`
Returns recent ring-buffer telemetry readings.
