/*
 * =================================================================================
 * SMART FACTORY SAFETY HELMET - ESP8266 NodeMCU Firmware
 * Project: Industrial Safety Pod: Single-Unit Wearable Helmet System
 * 
 * Hardware Connections:
 * - MPU6500 VCC -> 3V3
 * - MPU6500 GND -> GND
 * - MPU6500 SDA -> D5 (GPIO 14)
 * - MPU6500 SCL -> D6 (GPIO 12)
 * - MPU6500 I2C Address -> 0x68
 * 
 * - IR Sensor VCC -> 3V3
 * - IR Sensor GND -> GND
 * - IR Sensor OUT -> D7 (GPIO 13)  (LOW = Object Detected)
 * 
 * Data Configuration:
 * - Accelerometer Range: +/- 8g (Scale Factor: 4096 LSB/g)
 * - Experimental Impact Threshold: 3.2g (Unvalidated Demonstration Threshold)
 * - Baud Rate: 115200
 * =================================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <math.h>

// --- Wi-Fi Configuration ---
// Update these credentials for your local Wi-Fi network
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- Pin Definitions ---
#define SDA_PIN 14  // NodeMCU D5 (GPIO14)
#define SCL_PIN 12  // NodeMCU D6 (GPIO12)
#define IR_PIN  13  // NodeMCU D7 (GPIO13)

// --- Sensor Constants ---
#define MPU6500_ADDR        0x68
#define MPU6500_PWR_MGMT_1  0x6B
#define MPU6500_ACCEL_CONFIG 0x1C
#define MPU6500_ACCEL_XOUT_H 0x3B

// Acceleration Scale Factor for +/- 8g range (4096 LSB/g)
const float ACCEL_SCALE = 4096.0;

// Configuration options
float thresholdG = 3.2;         // Experimental unvalidated threshold
bool irDetectedLow = true;       // True if LOW signal means object is detected

// Web Server on Port 80
ESP8266WebServer server(80);

// Ring buffer for recent history
const int HISTORY_SIZE = 10;
struct Reading {
  unsigned long timestampMs;
  float ax;
  float ay;
  float az;
  float magnitude;
  bool objectDetected;
  char status[16];
};
Reading historyBuffer[HISTORY_SIZE];
int historyHead = 0;
int historyCount = 0;

// State tracking
bool mpuAvailable = false;
unsigned long lastSensorReadTime = 0;

// Sensor values
float curAx = 0.0, curAy = 0.0, curAz = 0.0, curMag = 0.0;
bool curIrDetected = false;
int curIrRaw = HIGH;
String systemStatus = "NORMAL"; // NORMAL, POTENTIAL_IMPACT, SENSOR_ERROR

// Helper: Add CORS headers to response
void sendCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Write register to MPU6500
bool writeRegister(uint8_t reg, uint8_t data) {
  Wire.beginTransmission(MPU6500_ADDR);
  Wire.write(reg);
  Wire.write(data);
  return (Wire.endTransmission() == 0);
}

// Initialize MPU6500 over I2C
bool initMPU6500() {
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000); // 400kHz fast mode

  // Check if device responds
  Wire.beginTransmission(MPU6500_ADDR);
  if (Wire.endTransmission() != 0) {
    Serial.println("[ERROR] MPU6500 not detected at I2C address 0x68!");
    return false;
  }

  // Wake up MPU6500 (Clear SLEEP bit in PWR_MGMT_1)
  if (!writeRegister(MPU6500_PWR_MGMT_1, 0x00)) {
    Serial.println("[ERROR] Failed to wake up MPU6500!");
    return false;
  }
  delay(50);

  // Set Accelerometer Range to +/- 8g (bits 4:3 = 10 -> 0x10)
  if (!writeRegister(MPU6500_ACCEL_CONFIG, 0x10)) {
    Serial.println("[ERROR] Failed to configure MPU6500 Accel Range (+/-8g)!");
    return false;
  }

  Serial.println("[OK] MPU6500 initialized successfully (+/- 8g range).");
  return true;
}

// Read raw sensor data from MPU6500 and IR Sensor
bool readSensors() {
  // Read IR Sensor
  curIrRaw = digitalRead(IR_PIN);
  curIrDetected = irDetectedLow ? (curIrRaw == LOW) : (curIrRaw == HIGH);

  if (!mpuAvailable) {
    // Attempt re-initialization periodically
    mpuAvailable = initMPU6500();
    if (!mpuAvailable) {
      systemStatus = "SENSOR_ERROR";
      return false;
    }
  }

  // Request 6 bytes of acceleration data (Xout_H, Xout_L, Yout_H, Yout_L, Zout_H, Zout_L)
  Wire.beginTransmission(MPU6500_ADDR);
  Wire.write(MPU6500_ACCEL_XOUT_H);
  if (Wire.endTransmission(false) != 0) {
    mpuAvailable = false;
    systemStatus = "SENSOR_ERROR";
    Serial.println("[ERROR] MPU6500 I2C transmission failed!");
    return false;
  }

  uint8_t count = Wire.requestFrom((uint8_t)MPU6500_ADDR, (size_t)6);
  if (count < 6) {
    mpuAvailable = false;
    systemStatus = "SENSOR_ERROR";
    Serial.println("[ERROR] Incomplete I2C read from MPU6500!");
    return false;
  }

  int16_t rawX = (Wire.read() << 8) | Wire.read();
  int16_t rawY = (Wire.read() << 8) | Wire.read();
  int16_t rawZ = (Wire.read() << 8) | Wire.read();

  // Convert raw values to g
  curAx = (float)rawX / ACCEL_SCALE;
  curAy = (float)rawY / ACCEL_SCALE;
  curAz = (float)rawZ / ACCEL_SCALE;

  // Calculate acceleration magnitude A = sqrt(ax^2 + ay^2 + az^2)
  curMag = sqrt(curAx * curAx + curAy * curAy + curAz * curAz);

  // Evaluate System Status
  if (curMag >= thresholdG) {
    systemStatus = "POTENTIAL_IMPACT";
  } else {
    systemStatus = "NORMAL";
  }

  // Add to ring buffer history
  Reading r;
  r.timestampMs = millis();
  r.ax = curAx;
  r.ay = curAy;
  r.az = curAz;
  r.magnitude = curMag;
  r.objectDetected = curIrDetected;
  strncpy(r.status, systemStatus.c_str(), sizeof(r.status));

  historyBuffer[historyHead] = r;
  historyHead = (historyHead + 1) % HISTORY_SIZE;
  if (historyCount < HISTORY_SIZE) historyCount++;

  return true;
}

// HTTP API: GET /api/status
void handleApiStatus() {
  sendCORSHeaders();
  
  StaticJsonDocument<512> doc;
  doc["deviceId"] = "helmet-01";
  doc["connected"] = true;
  doc["uptimeSeconds"] = millis() / 1000;
  doc["sensorStatus"] = mpuAvailable ? "OK" : "ERROR";

  JsonObject accel = doc.createNestedObject("acceleration");
  accel["x"] = round(curAx * 100.0) / 100.0;
  accel["y"] = round(curAy * 100.0) / 100.0;
  accel["z"] = round(curAz * 100.0) / 100.0;
  accel["magnitude"] = round(curMag * 100.0) / 100.0;

  JsonObject ir = doc.createNestedObject("irSensor");
  ir["rawState"] = curIrRaw;
  ir["objectDetected"] = curIrDetected;

  doc["thresholdG"] = thresholdG;
  doc["systemStatus"] = systemStatus;
  
  // Format uptime string
  unsigned long sec = millis() / 1000;
  char timeBuf[32];
  snprintf(timeBuf, sizeof(timeBuf), "Uptime: %lud %luh %lum %lus", sec / 86400, (sec % 86400) / 3600, (sec % 3600) / 60, sec % 60);
  doc["timestamp"] = timeBuf;

  String jsonOutput;
  serializeJson(doc, jsonOutput);
  server.send(mpuAvailable ? 200 : 503, "application/json", jsonOutput);
}

// HTTP API: GET /api/health
void handleApiHealth() {
  sendCORSHeaders();

  StaticJsonDocument<384> doc;
  doc["status"] = mpuAvailable ? "HEALTHY" : "DEGRADED";
  doc["mpu6500"] = mpuAvailable ? "ONLINE" : "FAULT";
  doc["irSensorPin"] = IR_PIN;
  doc["wifiRssi"] = WiFi.RSSI();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["uptimeSeconds"] = millis() / 1000;

  String jsonOutput;
  serializeJson(doc, jsonOutput);
  server.send(200, "application/json", jsonOutput);
}

// HTTP API: GET /api/history
void handleApiHistory() {
  sendCORSHeaders();

  DynamicJsonDocument doc(2048);
  JsonArray arr = doc.createNestedArray("readings");

  for (int i = 0; i < historyCount; i++) {
    // Reading starting from oldest
    int idx = (historyHead - historyCount + i + HISTORY_SIZE) % HISTORY_SIZE;
    JsonObject obj = arr.createNestedObject();
    obj["timestampMs"] = historyBuffer[idx].timestampMs;
    obj["ax"] = historyBuffer[idx].ax;
    obj["ay"] = historyBuffer[idx].ay;
    obj["az"] = historyBuffer[idx].az;
    obj["magnitude"] = historyBuffer[idx].magnitude;
    obj["objectDetected"] = historyBuffer[idx].objectDetected;
    obj["status"] = historyBuffer[idx].status;
  }

  String jsonOutput;
  serializeJson(doc, jsonOutput);
  server.send(200, "application/json", jsonOutput);
}

// Handle OPTIONS preflight requests for CORS
void handleOptions() {
  sendCORSHeaders();
  server.send(204);
}

// Handle Not Found
void handleNotFound() {
  sendCORSHeaders();
  server.send(404, "application/json", "{\"error\": \"Endpoint not found\"}");
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n=======================================================");
  Serial.println("  SMART FACTORY SAFETY HELMET - NodeMCU ESP8266");
  Serial.println("=======================================================");

  // Initialize IR Pin
  pinMode(IR_PIN, INPUT_PULLUP);
  Serial.printf("[INIT] IR Sensor configured on Pin D7 (GPIO%d)\n", IR_PIN);

  // Initialize MPU6500
  mpuAvailable = initMPU6500();

  // Connect to Wi-Fi
  Serial.printf("[WIFI] Connecting to SSID: %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected successfully!");
    Serial.print("[WIFI] Device IP Address: http://");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI WARNING] Wi-Fi connection failed. Retrying in background...");
  }

  // Setup Web Server Routes
  server.on("/api/status", HTTP_GET, handleApiStatus);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  
  server.on("/api/health", HTTP_GET, handleApiHealth);
  server.on("/api/health", HTTP_OPTIONS, handleOptions);

  server.on("/api/history", HTTP_GET, handleApiHistory);
  server.on("/api/history", HTTP_OPTIONS, handleOptions);

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("[SERVER] HTTP Server started on port 80.");
  Serial.println("=======================================================\n");
}

void loop() {
  server.handleClient();

  // Periodically read sensor data every 200ms
  unsigned long now = millis();
  if (now - lastSensorReadTime >= 200) {
    lastSensorReadTime = now;
    readSensors();

    // Debug Serial Output every 2 seconds
    static unsigned long lastSerialOutput = 0;
    if (now - lastSerialOutput >= 2000) {
      lastSerialOutput = now;
      Serial.printf("[TELEMETRY] Accel: X=%.2f g, Y=%.2f g, Z=%.2f g | Mag=%.2fg | IR: %s | Status: %s\n",
                    curAx, curAy, curAz, curMag, 
                    curIrDetected ? "OBJECT DETECTED" : "NO OBJECT", 
                    systemStatus.c_str());
    }
  }
}
