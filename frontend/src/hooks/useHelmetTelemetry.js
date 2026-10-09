import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDeviceStatus, fetchDeviceHealth } from '../services/hardwareApi';
import {
  DEFAULT_DEVICE_IP,
  DEFAULT_THRESHOLD_G,
  DEFAULT_POLL_INTERVAL_MS,
  MAX_CHART_POINTS,
  ALERT_COOLDOWN_MS
} from '../constants';

export function useHelmetTelemetry() {
  // Configurable states
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [deviceIp, setDeviceIp] = useState(() => localStorage.getItem('safety_helmet_ip') || DEFAULT_DEVICE_IP);
  const [thresholdG, setThresholdG] = useState(DEFAULT_THRESHOLD_G);
  const [pollInterval, setPollInterval] = useState(DEFAULT_POLL_INTERVAL_MS);

  // Connection & Diagnostics state
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedTime, setLastReceivedTime] = useState(null);
  const [apiDiagnostics, setApiDiagnostics] = useState({
    lastStatusCode: null,
    latency: null,
    error: null,
    lastPayload: null,
    endpoint: `${DEFAULT_DEVICE_IP}/api/status`
  });

  // Current Telemetry
  const [telemetry, setTelemetry] = useState({
    deviceId: 'helmet-01',
    connected: false,
    uptimeSeconds: 0,
    sensorStatus: 'OK',
    acceleration: { x: 0.02, y: -0.05, z: 0.98, magnitude: 0.98 },
    irSensor: { rawState: 0, objectDetected: true },
    thresholdG: DEFAULT_THRESHOLD_G,
    systemStatus: 'NORMAL',
    timestamp: new Date().toLocaleTimeString()
  });

  // Rolling Chart Data
  const [chartData, setChartData] = useState([]);

  // Alert Incident Log
  const [alerts, setAlerts] = useState([
    {
      id: 'init-alert-1',
      timestamp: new Date(Date.now() - 300000).toLocaleString(),
      severity: 'INFO',
      title: 'System Initialized',
      magnitude: 0.98,
      irState: 'Object Detected',
      systemStatus: 'NORMAL',
      acknowledged: true,
      rawTime: Date.now() - 300000
    }
  ]);

  // Demo Mode Simulation State
  const demoStateRef = useRef({
    ax: 0.02,
    ay: -0.05,
    az: 0.98,
    objectDetected: true,
    sensorError: false,
    deviceOffline: false,
    overrideImpactG: null,
    uptimeSec: 120
  });

  // Cooldown tracker for alert deduplication
  const lastAlertTimeRef = useRef({});

  // Helper: Save IP Address
  const updateDeviceIp = (newIp) => {
    let formatted = newIp.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    setDeviceIp(formatted);
    localStorage.setItem('safety_helmet_ip', formatted);
  };

  // Helper: Deduplicated Alert Generator
  const triggerAlert = useCallback((severity, title, mag, irDetected, sysStatus) => {
    const now = Date.now();
    const alertKey = `${title}_${severity}`;

    // Prevent duplicate alert flood within cooldown period
    if (lastAlertTimeRef.current[alertKey] && (now - lastAlertTimeRef.current[alertKey] < ALERT_COOLDOWN_MS)) {
      return;
    }

    lastAlertTimeRef.current[alertKey] = now;

    const newAlert = {
      id: `alert-${now}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString() + ' (' + new Date().toLocaleDateString() + ')',
      severity,
      title,
      magnitude: Number(mag.toFixed(2)),
      irState: irDetected ? 'Object Detected' : 'No Object Detected',
      systemStatus: sysStatus,
      acknowledged: false,
      rawTime: now
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 100)); // keep last 100 alerts
  }, []);

  // Process incoming telemetry (Live or Demo)
  const processReading = useCallback((rawReading, isFromHardware = false) => {
    const timeStr = new Date().toLocaleTimeString();

    // 1. Calculate Acceleration Magnitude safely if missing or invalid
    let ax = typeof rawReading.acceleration?.x === 'number' ? rawReading.acceleration.x : 0;
    let ay = typeof rawReading.acceleration?.y === 'number' ? rawReading.acceleration.y : 0;
    let az = typeof rawReading.acceleration?.z === 'number' ? rawReading.acceleration.z : 1;
    
    let mag = rawReading.acceleration?.magnitude;
    if (typeof mag !== 'number' || isNaN(mag)) {
      mag = Math.sqrt(ax * ax + ay * ay + az * az);
    }

    const objectDetected = Boolean(rawReading.irSensor?.objectDetected);
    const sensorStatus = rawReading.sensorStatus || 'OK';

    // 2. Determine System Status Logic
    let derivedStatus = 'NORMAL';
    if (!rawReading.connected) {
      derivedStatus = 'DEVICE_OFFLINE';
    } else if (sensorStatus !== 'OK') {
      derivedStatus = 'SENSOR_ERROR';
    } else if (mag >= thresholdG) {
      derivedStatus = 'POTENTIAL_IMPACT';
    } else {
      derivedStatus = 'NORMAL';
    }

    // Update Telemetry Object
    const updatedTelemetry = {
      deviceId: rawReading.deviceId || 'helmet-01',
      connected: rawReading.connected,
      uptimeSeconds: rawReading.uptimeSeconds || 0,
      sensorStatus: sensorStatus,
      acceleration: {
        x: Number(ax.toFixed(2)),
        y: Number(ay.toFixed(2)),
        z: Number(az.toFixed(2)),
        magnitude: Number(mag.toFixed(2))
      },
      irSensor: {
        rawState: rawReading.irSensor?.rawState ?? (objectDetected ? 0 : 1),
        objectDetected
      },
      thresholdG: thresholdG,
      systemStatus: derivedStatus,
      timestamp: timeStr
    };

    setTelemetry(updatedTelemetry);
    setIsConnected(rawReading.connected);
    setLastReceivedTime(timeStr);

    // 3. Update Chart Rolling Window
    if (rawReading.connected && sensorStatus === 'OK') {
      setChartData((prev) => {
        const newPoint = {
          time: timeStr,
          X: Number(ax.toFixed(2)),
          Y: Number(ay.toFixed(2)),
          Z: Number(az.toFixed(2)),
          Magnitude: Number(mag.toFixed(2)),
          Threshold: thresholdG
        };
        const updated = [...prev, newPoint];
        return updated.slice(-MAX_CHART_POINTS);
      });
    }

    // 4. Alert Logic Trigger
    if (!rawReading.connected) {
      triggerAlert('CRITICAL', 'ESP8266 Device Offline', mag, objectDetected, 'DEVICE_OFFLINE');
    } else if (sensorStatus !== 'OK') {
      triggerAlert('WARNING', 'MPU6500 Sensor Read Failure', mag, objectDetected, 'SENSOR_ERROR');
    } else if (derivedStatus === 'POTENTIAL_IMPACT') {
      const alertTitle = objectDetected
        ? 'Potential Impact — Object Detected'
        : 'Potential Impact — No Object Detected';
      triggerAlert('CRITICAL', alertTitle, mag, objectDetected, 'POTENTIAL_IMPACT');
    }
  }, [thresholdG, triggerAlert]);

  // Demo Simulation Generator
  const generateDemoReading = useCallback(() => {
    const demo = demoStateRef.current;
    demo.uptimeSec += 1;

    if (demo.deviceOffline) {
      return {
        deviceId: 'helmet-01-demo',
        connected: false,
        uptimeSeconds: demo.uptimeSec,
        sensorStatus: 'OK',
        acceleration: { x: 0, y: 0, z: 0, magnitude: 0 },
        irSensor: { rawState: 1, objectDetected: false },
        thresholdG,
        systemStatus: 'DEVICE_OFFLINE'
      };
    }

    if (demo.sensorError) {
      return {
        deviceId: 'helmet-01-demo',
        connected: true,
        uptimeSeconds: demo.uptimeSec,
        sensorStatus: 'ERROR',
        acceleration: { x: 0, y: 0, z: 0, magnitude: 0 },
        irSensor: { rawState: demo.objectDetected ? 0 : 1, objectDetected: demo.objectDetected },
        thresholdG,
        systemStatus: 'SENSOR_ERROR'
      };
    }

    // High Impact pulse override or slight noise
    let ax, ay, az, mag;
    if (demo.overrideImpactG !== null) {
      mag = demo.overrideImpactG;
      ax = Number((mag * 0.707).toFixed(2));
      ay = Number((mag * 0.5).toFixed(2));
      az = Number((mag * 0.5).toFixed(2));
      // decay back to normal after a short pulse
      demo.overrideImpactG = null;
    } else {
      // Normal slight motion noise around rest ~1.0g
      const noiseX = (Math.random() - 0.5) * 0.08;
      const noiseY = (Math.random() - 0.5) * 0.08;
      const noiseZ = (Math.random() - 0.5) * 0.08;
      ax = Number((0.02 + noiseX).toFixed(2));
      ay = Number((-0.05 + noiseY).toFixed(2));
      az = Number((0.98 + noiseZ).toFixed(2));
      mag = Math.sqrt(ax * ax + ay * ay + az * az);
    }

    return {
      deviceId: 'helmet-01-demo',
      connected: true,
      uptimeSeconds: demo.uptimeSec,
      sensorStatus: 'OK',
      acceleration: { x: ax, y: ay, z: az, magnitude: Number(mag.toFixed(2)) },
      irSensor: { rawState: demo.objectDetected ? 0 : 1, objectDetected: demo.objectDetected },
      thresholdG,
      systemStatus: mag >= thresholdG ? 'POTENTIAL_IMPACT' : 'NORMAL'
    };
  }, [thresholdG]);

  // Main Polling Loop
  useEffect(() => {
    let timerId;

    const tick = async () => {
      if (isDemoMode) {
        const demoData = generateDemoReading();
        processReading(demoData, false);
        setApiDiagnostics({
          lastStatusCode: 200,
          latency: 2,
          error: null,
          lastPayload: demoData,
          endpoint: 'DEMO MODE (Simulated Internal Engine)'
        });
      } else {
        const result = await fetchDeviceStatus(deviceIp);
        setApiDiagnostics({
          lastStatusCode: result.statusCode,
          latency: result.latency,
          error: result.error,
          lastPayload: result.data || result.error,
          endpoint: `${deviceIp.replace(/\/+$/, '')}/api/status`
        });

        if (result.success && result.data) {
          processReading(result.data, true);
        } else {
          // Hardware unreachable or error response
          processReading({
            deviceId: 'helmet-01',
            connected: false,
            uptimeSeconds: 0,
            sensorStatus: 'ERROR',
            acceleration: { x: 0, y: 0, z: 0, magnitude: 0 },
            irSensor: { rawState: 1, objectDetected: false },
            thresholdG,
            systemStatus: 'DEVICE_OFFLINE'
          }, true);
        }
      }
    };

    tick();
    timerId = setInterval(tick, pollInterval);

    return () => clearInterval(timerId);
  }, [isDemoMode, deviceIp, pollInterval, generateDemoReading, processReading, thresholdG]);

  // Actions for User UI
  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert))
    );
  };

  const clearAlertHistory = () => {
    setAlerts([]);
  };

  const exportAlertsCSV = () => {
    if (alerts.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Severity', 'Title', 'Magnitude (g)', 'IR Sensor State', 'Acknowledged'];
    const rows = alerts.map((a) => [
      a.id,
      `"${a.timestamp}"`,
      a.severity,
      `"${a.title}"`,
      a.magnitude,
      `"${a.irState}"`,
      a.acknowledged ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `helmet_incident_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Demo Trigger Functions
  const demoTriggers = {
    triggerImpact: (gValue = 4.5) => {
      demoStateRef.current.overrideImpactG = gValue;
      demoStateRef.current.sensorError = false;
      demoStateRef.current.deviceOffline = false;
    },
    toggleIr: () => {
      demoStateRef.current.objectDetected = !demoStateRef.current.objectDetected;
    },
    triggerSensorError: () => {
      demoStateRef.current.sensorError = !demoStateRef.current.sensorError;
      demoStateRef.current.deviceOffline = false;
    },
    triggerOffline: () => {
      demoStateRef.current.deviceOffline = !demoStateRef.current.deviceOffline;
    },
    resetNormal: () => {
      demoStateRef.current.sensorError = false;
      demoStateRef.current.deviceOffline = false;
      demoStateRef.current.overrideImpactG = null;
      demoStateRef.current.objectDetected = true;
    }
  };

  return {
    isDemoMode,
    setIsDemoMode,
    deviceIp,
    updateDeviceIp,
    thresholdG,
    setThresholdG,
    pollInterval,
    setPollInterval,
    isConnected,
    lastReceivedTime,
    apiDiagnostics,
    telemetry,
    chartData,
    alerts,
    acknowledgeAlert,
    clearAlertHistory,
    exportAlertsCSV,
    demoTriggers
  };
}
