import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { Activity, WifiOff, RefreshCw } from 'lucide-react';

export function LiveTelemetryChart({
  chartData,
  isConnected,
  isDemoMode,
  thresholdG,
  sensorStatus
}) {
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Real-Time Acceleration Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              {isDemoMode ? 'Simulated Telemetry Stream' : 'Live ESP8266 NodeMCU Hardware Stream'} — Rolling Window ({chartData.length} pts)
            </p>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span>Magnitude (A)</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
            <span>X-Axis</span>
          </span>
          <span className="flex items-center space-x-1 text-teal-400">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
            <span>Y-Axis</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Z-Axis</span>
          </span>
        </div>
      </div>

      {/* Connection Loss Banner */}
      {!isConnected && !isDemoMode && (
        <div className="flex items-center space-x-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
          <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">ESP8266 Connection Disrupted:</span> The dashboard stopped receiving telemetry from the device. Telemetry plotting is paused.
          </div>
        </div>
      )}

      {/* Sensor Error Banner */}
      {sensorStatus === 'ERROR' && isConnected && (
        <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs">
          <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <div>
            <span className="font-bold">MPU6500 Sensor Read Error:</span> The ESP8266 is online, but returning unreadable accelerometer registers.
          </div>
        </div>
      )}

      {/* Chart Canvas or Empty State */}
      <div className="h-72 w-full pt-2">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center p-6 space-y-2">
            <Activity className="w-10 h-10 text-slate-600 animate-pulse" />
            <p className="text-sm text-slate-400 font-medium">Awaiting Telemetry Readings...</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Connect to your ESP8266 node or switch to Demo Mode to view real-time acceleration vectors.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                domain={[-2, 'dataMax + 1.5']}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={{ stroke: '#334155' }}
                unit="g"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              
              {/* Experimental Threshold Reference Line */}
              <ReferenceLine
                y={thresholdG}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Limit: ${thresholdG}g`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />

              <Line
                type="monotone"
                dataKey="Magnitude"
                name="Magnitude A (g)"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#22d3ee' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="X"
                name="X-Accel (g)"
                stroke="#f43f5e"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Y"
                name="Y-Accel (g)"
                stroke="#14b8a6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Z"
                name="Z-Accel (g)"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
