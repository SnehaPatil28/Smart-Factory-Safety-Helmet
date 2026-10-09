// Initial default settings and thresholds
export const DEFAULT_DEVICE_IP = 'http://192.168.1.100';
export const DEFAULT_THRESHOLD_G = 3.2; // Experimental unvalidated demonstration threshold
export const DEFAULT_POLL_INTERVAL_MS = 1000;
export const MAX_CHART_POINTS = 30;
export const ALERT_COOLDOWN_MS = 5000; // 5 second cooldown between duplicate alerts

export const SYSTEM_STATUSES = {
  NORMAL: {
    label: 'NORMAL',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Acceleration within safe bounds. Sensors operating nominally.'
  },
  POTENTIAL_IMPACT: {
    label: 'POTENTIAL IMPACT',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Acceleration reached or exceeded experimental threshold!'
  },
  SENSOR_ERROR: {
    label: 'SENSOR ERROR',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'MPU6500 or IR proximity sensor output is invalid or unreadable.'
  },
  DEVICE_OFFLINE: {
    label: 'DEVICE OFFLINE',
    color: 'text-slate-400',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700',
    badgeBg: 'bg-slate-700/50 text-slate-300 border-slate-600',
    description: 'No response received from ESP8266 within request timeout.'
  }
};

export const ALERT_SEVERITIES = {
  CRITICAL: {
    label: 'CRITICAL',
    color: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40 border'
  },
  WARNING: {
    label: 'WARNING',
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 border'
  },
  INFO: {
    label: 'INFO',
    color: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 border'
  }
};
