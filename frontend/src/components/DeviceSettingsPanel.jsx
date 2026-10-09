import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  Cpu,
  Terminal,
  Clock,
  ShieldCheck,
  AlertCircle,
  Link,
  CheckCircle2
} from 'lucide-react';

export function DeviceSettingsPanel({
  deviceIp,
  updateDeviceIp,
  isConnected,
  isDemoMode,
  setIsDemoMode,
  pollInterval,
  setPollInterval,
  apiDiagnostics,
  telemetry
}) {
  const [inputIp, setInputIp] = useState(deviceIp);
  const [testStatus, setTestStatus] = useState(null);

  const handleSaveIp = (e) => {
    e.preventDefault();
    updateDeviceIp(inputIp);
    setTestStatus('IP endpoint updated successfully.');
    setTimeout(() => setTestStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Network Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Wi-Fi Local Network Architecture
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Ensure your computer/laptop and the NodeMCU ESP8266 are connected to the <span className="text-cyan-300 font-semibold">same Wi-Fi router / local network</span>. The web dashboard communicates directly with the ESP8266 REST API via CORS-enabled HTTP endpoints.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 rounded-lg text-xs font-mono font-semibold">
            CORS Enabled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Configurable Device Endpoint */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>ESP8266 REST API Endpoint</span>
            </div>
            {isConnected ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Unreachable</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveIp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Device IP Address / Base URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputIp}
                  onChange={(e) => setInputIp(e.target.value)}
                  placeholder="e.g. http://192.168.1.100"
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition"
                >
                  Save IP
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Obtain the IP address from the Arduino IDE Serial Monitor (115200 baud).
              </p>
            </div>

            {testStatus && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{testStatus}</span>
              </div>
            )}

            {/* Polling Rate Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Telemetry Polling Interval
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '500 ms', val: 500 },
                  { label: '1.0 s', val: 1000 },
                  { label: '2.0 s', val: 2000 },
                  { label: '5.0 s', val: 5000 }
                ].map((rate) => (
                  <button
                    key={rate.val}
                    type="button"
                    onClick={() => setPollInterval(rate.val)}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold transition ${
                      pollInterval === rate.val
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {rate.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selector Notice */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
              <div>
                <span className="font-semibold block text-white">Active Operational Mode</span>
                <span className="text-[11px] text-slate-400">
                  {isDemoMode ? 'Simulating sensor inputs internally' : 'Polling live hardware over HTTP'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isDemoMode
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {isDemoMode ? 'Switch to Live Hardware' : 'Switch to Demo Mode'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Hardware Health & Diagnostic Log Terminal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>HTTP Diagnostics & Response Inspector</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {apiDiagnostics.latency ? `${apiDiagnostics.latency} ms` : '--'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500">Target Endpoint:</span>
              <span className="text-cyan-300 truncate max-w-[200px]">{apiDiagnostics.endpoint}</span>
            </div>

            <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500">HTTP Status Code:</span>
              <span className={apiDiagnostics.lastStatusCode === 200 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {apiDiagnostics.lastStatusCode || 'N/A'}
              </span>
            </div>

            {apiDiagnostics.error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl">
                <span className="font-bold block">Diagnostic Failure:</span>
                <span>{apiDiagnostics.error}</span>
              </div>
            )}
          </div>

          {/* Raw JSON Inspector */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Latest JSON Telemetry Payload
            </span>
            <pre className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl text-[11px] font-mono text-teal-300 overflow-x-auto max-h-48">
              {JSON.stringify(apiDiagnostics.lastPayload || telemetry, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
