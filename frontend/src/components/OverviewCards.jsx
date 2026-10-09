import React from 'react';
import {
  Activity,
  Compass,
  UserCheck,
  UserX,
  AlertOctagon,
  ShieldCheck,
  WifiOff,
  Cpu,
  Clock,
  Gauge
} from 'lucide-react';
import { SYSTEM_STATUSES } from '../constants';

export function OverviewCards({ telemetry, isConnected, thresholdG }) {
  const { acceleration, irSensor, systemStatus, sensorStatus, uptimeSeconds } = telemetry;
  const mag = acceleration.magnitude;

  const currentStatusConfig = SYSTEM_STATUSES[systemStatus] || SYSTEM_STATUSES.NORMAL;

  // Percentage for Total Accel gauge (assuming 0 to 8g range)
  const accelPercent = Math.min(100, Math.max(0, (mag / 8.0) * 100));

  // Format uptime
  const formatUptime = (sec) => {
    if (!sec || sec <= 0) return '00:00:00';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      
      {/* Card 1: Total Acceleration Magnitude */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Acceleration (Magnitude)
            </p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {mag.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-cyan-400">g</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
            <Gauge className="w-6 h-6" />
          </div>
        </div>

        {/* Magnitude Bar Gauge */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Formula: √(X² + Y² + Z²)</span>
            <span>Limit: {thresholdG}g</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 relative">
            {/* Threshold Line Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-80"
              style={{ left: `${(thresholdG / 8.0) * 100}%` }}
              title={`Experimental Threshold: ${thresholdG}g`}
            />
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                mag >= thresholdG ? 'bg-rose-500 shadow-md shadow-rose-500/50' : 'bg-gradient-to-r from-teal-500 to-cyan-400'
              }`}
              style={{ width: `${accelPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: 3-Axis Acceleration Breakdown (X, Y, Z) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-cyan-500/40 transition">
        <div className="flex justify-between items-start mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            3-Axis Vector Breakdown
          </p>
          <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-slate-300">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">X-Axis</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {acceleration.x > 0 ? `+${acceleration.x.toFixed(2)}` : acceleration.x.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">g</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Y-Axis</span>
            <span className="text-base font-bold font-mono text-teal-400">
              {acceleration.y > 0 ? `+${acceleration.y.toFixed(2)}` : acceleration.y.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">g</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Z-Axis</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {acceleration.z > 0 ? `+${acceleration.z.toFixed(2)}` : acceleration.z.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">g</span>
          </div>
        </div>
      </div>

      {/* Card 3: IR Proximity Sensor Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-cyan-500/40 transition">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              IR Proximity Sensor
            </p>
            <div className="mt-2 flex items-center space-x-2">
              {irSensor.objectDetected ? (
                <>
                  <UserCheck className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">
                    Object Detected
                  </span>
                </>
              ) : (
                <>
                  <UserX className="w-6 h-6 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">
                    No Object Detected
                  </span>
                </>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${
            irSensor.objectDetected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {irSensor.objectDetected ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          Proximity input context. Raw pin state: <code className="text-cyan-300 font-mono">{irSensor.rawState}</code> (LOW = Object).
        </p>
      </div>

      {/* Card 4: System Operating State */}
      <div className={`bg-slate-900 border rounded-2xl p-5 shadow-lg ${currentStatusConfig.border} transition`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              System Operating Status
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${currentStatusConfig.badgeBg} ${
                systemStatus === 'POTENTIAL_IMPACT' ? 'glow-red animate-bounce' : ''
              }`}>
                {systemStatus === 'NORMAL' && <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />}
                {systemStatus === 'POTENTIAL_IMPACT' && <AlertOctagon className="w-4 h-4 mr-1.5 text-rose-400" />}
                {systemStatus === 'SENSOR_ERROR' && <Cpu className="w-4 h-4 mr-1.5 text-amber-400" />}
                {systemStatus === 'DEVICE_OFFLINE' && <WifiOff className="w-4 h-4 mr-1.5 text-slate-400" />}
                {currentStatusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          {currentStatusConfig.description}
        </p>
      </div>

      {/* Card 5: Device Uptime & Sensor Hardware Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-cyan-500/40 transition">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Device Hardware Uptime
            </p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-bold font-mono text-white">
                {formatUptime(uptimeSeconds)}
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl text-slate-300 border border-slate-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mt-4 pt-2 border-t border-slate-800/80">
          <span className="text-slate-400">MPU6500 Bus Status:</span>
          <span className={`font-semibold font-mono ${sensorStatus === 'OK' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sensorStatus === 'OK' ? 'HEALTHY (I²C 0x68)' : 'HARDWARE FAULT'}
          </span>
        </div>
      </div>

      {/* Card 6: Experimental Threshold Disclaimer */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden bg-gradient-to-br from-slate-900 to-amber-950/20">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
              Experimental Param
            </span>
            <h4 className="text-sm font-bold text-white mt-1.5">
              Demonstration Impact Limit
            </h4>
          </div>
          <span className="text-2xl font-extrabold font-mono text-amber-400">{thresholdG}g</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          The <span className="text-amber-300 font-semibold">{thresholdG}g</span> setting is an unvalidated demonstration threshold for classroom testing. It does not certify medical or industrial safety standard compliance.
        </p>
      </div>

    </div>
  );
}
