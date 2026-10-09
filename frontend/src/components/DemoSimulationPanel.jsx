import React from 'react';
import {
  Sliders,
  Zap,
  UserCheck,
  UserX,
  AlertTriangle,
  WifiOff,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';

export function DemoSimulationPanel({ demoTriggers, isDemoMode, setIsDemoMode, telemetry }) {
  const { irSensor, sensorStatus, systemStatus } = telemetry;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Interactive Presentation Simulator
              </h2>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                Demo Control Deck
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trigger real-time physical events and failure modes for classroom demonstration without risking hardware.
            </p>
          </div>
        </div>

        {!isDemoMode && (
          <button
            onClick={() => setIsDemoMode(true)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/10"
          >
            Activate Demo Mode
          </button>
        )}
      </div>

      {!isDemoMode && (
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex items-center space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          <p>
            You are currently in <strong className="text-cyan-300">Live Hardware Mode</strong>. The buttons below will automatically switch the dashboard to <strong className="text-amber-300">Demo Mode</strong> when clicked.
          </p>
        </div>
      )}

      {/* Simulation Triggers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Trigger 1: High Acceleration Impact Shock (4.5g) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-rose-500/50 transition group">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <Zap className="w-5 h-5 group-hover:animate-bounce" />
              <span>Simulate High Impact (4.5g)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Injects a sudden 4.5g shock pulse to trigger the experimental impact alert threshold.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.triggerImpact(4.5);
            }}
            className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition"
          >
            Inject 4.5g Impact Shock
          </button>
        </div>

        {/* Trigger 2: Severe Crash Impact (6.2g) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-rose-500/50 transition group">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 group-hover:animate-bounce" />
              <span>Simulate Critical Impact (6.2g)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Injects a 6.2g severe shock vector to evaluate critical alert response.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.triggerImpact(6.2);
            }}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-rose-600/30"
          >
            Inject 6.2g Severe Impact
          </button>
        </div>

        {/* Trigger 3: Toggle IR Proximity Sensor */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/50 transition group">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              {irSensor.objectDetected ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
              <span>Toggle IR Sensor State</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current state: <strong className="text-cyan-300">{irSensor.objectDetected ? 'Object Detected' : 'No Object'}</strong>
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.toggleIr();
            }}
            className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition"
          >
            Toggle Helmet On / Off
          </button>
        </div>

        {/* Trigger 4: Simulate MPU6500 Read Error */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition group">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>MPU6500 Bus Fault</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates I²C communication error or loose wire connection on NodeMCU.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.triggerSensorError();
            }}
            className={`w-full py-2 rounded-lg text-xs font-bold transition ${
              sensorStatus === 'ERROR'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            {sensorStatus === 'ERROR' ? 'Restore Sensor Bus' : 'Simulate Sensor Read Error'}
          </button>
        </div>

        {/* Trigger 5: Simulate ESP8266 Device Offline */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-600 transition group">
          <div>
            <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
              <WifiOff className="w-5 h-5 text-slate-400" />
              <span>Simulate Device Offline</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates Wi-Fi packet drop or battery power loss on the NodeMCU.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.triggerOffline();
            }}
            className={`w-full py-2 rounded-lg text-xs font-bold transition ${
              systemStatus === 'DEVICE_OFFLINE'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {systemStatus === 'DEVICE_OFFLINE' ? 'Reconnect NodeMCU' : 'Simulate Device Disconnect'}
          </button>
        </div>

        {/* Trigger 6: Reset to Normal Walking State */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition group">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <RotateCcw className="w-5 h-5" />
              <span>Reset to Steady State</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Resets acceleration magnitude to ~1.0g (normal gravity) and object detected.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isDemoMode) setIsDemoMode(true);
              demoTriggers.resetNormal();
            }}
            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition"
          >
            Reset to Normal (~1.0g)
          </button>
        </div>

      </div>

    </div>
  );
}
