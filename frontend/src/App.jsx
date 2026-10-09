import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { OverviewCards } from './components/OverviewCards';
import { LiveTelemetryChart } from './components/LiveTelemetryChart';
import { AlertHistoryPanel } from './components/AlertHistoryPanel';
import { DeviceSettingsPanel } from './components/DeviceSettingsPanel';
import { DemoSimulationPanel } from './components/DemoSimulationPanel';
import { useHelmetTelemetry } from './hooks/useHelmetTelemetry';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Radio, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
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
  } = useHelmetTelemetry();

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header Navigation */}
      <Header
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        isConnected={isConnected}
        lastReceivedTime={lastReceivedTime}
        systemStatus={telemetry.systemStatus}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          unacknowledgedCount={unacknowledgedCount}
          systemStatus={telemetry.systemStatus}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto">
          
          {/* Active Operational Mode Indicator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isDemoMode ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
              <span className="font-semibold text-slate-300">
                Operating Mode:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isDemoMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isDemoMode ? 'Simulated Demo Mode' : 'Live ESP8266 REST API'}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
              <span>Device ID: <strong className="text-white">{telemetry.deviceId}</strong></span>
              <span>•</span>
              <span>Endpoint: <strong className="text-cyan-400">{isDemoMode ? 'Simulated' : deviceIp}</strong></span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Metric Cards */}
              <OverviewCards
                telemetry={telemetry}
                isConnected={isConnected}
                thresholdG={thresholdG}
              />

              {/* Real-time Telemetry Graph */}
              <LiveTelemetryChart
                chartData={chartData}
                isConnected={isConnected}
                isDemoMode={isDemoMode}
                thresholdG={thresholdG}
                sensorStatus={telemetry.sensorStatus}
              />

              {/* Quick Incident Log Preview & Simulation Shortcut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Alerts (2 Columns) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2 text-white font-bold">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <span>Recent Incident Log</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      View Full History ({alerts.length}) →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {alerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-2 h-2 rounded-full ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500' : alert.severity === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-400'
                          }`} />
                          <div>
                            <span className="font-semibold text-slate-200 block">{alert.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp} • {alert.irState}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-cyan-300 block">{alert.magnitude} g</span>
                          <span className={`text-[10px] ${alert.acknowledged ? 'text-slate-500' : 'text-amber-400 font-semibold'}`}>
                            {alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Shortcut Card (1 Column) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-base mb-2">
                      <Terminal className="w-5 h-5" />
                      <span>Demo Deck Trigger</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Need to test physical impact detection or sensor failure modes for your presentation?
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('demo')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/10"
                  >
                    Open Simulation Deck →
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <LiveTelemetryChart
                chartData={chartData}
                isConnected={isConnected}
                isDemoMode={isDemoMode}
                thresholdG={thresholdG}
                sensorStatus={telemetry.sensorStatus}
              />
            </div>
          )}

          {/* TAB 3: INCIDENT HISTORY */}
          {activeTab === 'alerts' && (
            <AlertHistoryPanel
              alerts={alerts}
              acknowledgeAlert={acknowledgeAlert}
              clearAlertHistory={clearAlertHistory}
              exportAlertsCSV={exportAlertsCSV}
              thresholdG={thresholdG}
              setThresholdG={setThresholdG}
            />
          )}

          {/* TAB 4: DEVICE & API SETTINGS */}
          {activeTab === 'settings' && (
            <DeviceSettingsPanel
              deviceIp={deviceIp}
              updateDeviceIp={updateDeviceIp}
              isConnected={isConnected}
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
              pollInterval={pollInterval}
              setPollInterval={setPollInterval}
              apiDiagnostics={apiDiagnostics}
              telemetry={telemetry}
            />
          )}

          {/* TAB 5: DEMO SIMULATION */}
          {activeTab === 'demo' && (
            <DemoSimulationPanel
              demoTriggers={demoTriggers}
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
              telemetry={telemetry}
            />
          )}

        </main>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Industrial Safety Pod — Smart Factory Safety Helmet System
          </span>
          <span className="text-[11px] text-slate-400">
            NodeMCU ESP8266 + MPU6500 (±8g) + IR Proximity Sensor (GPIO13)
          </span>
        </div>
      </footer>

    </div>
  );
}
