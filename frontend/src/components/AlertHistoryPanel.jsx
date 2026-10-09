import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { ALERT_SEVERITIES } from '../constants';

export function AlertHistoryPanel({
  alerts,
  acknowledgeAlert,
  clearAlertHistory,
  exportAlertsCSV,
  thresholdG,
  setThresholdG
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Filtering logic
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.irState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.timestamp.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || alert.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Threshold Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Incident History &amp; Safety Alerts
                </h2>
                {unacknowledgedCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full animate-pulse">
                    {unacknowledgedCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Logged impact events and sensor status diagnostics with alert deduplication.
              </p>
            </div>
          </div>

          {/* CSV Export & Clear History Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAlertsCSV}
              disabled={alerts.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowClearConfirmModal(true)}
              disabled={alerts.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Experimental Threshold Control Slider & Notice */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold shrink-0">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Experimental Threshold:</span>
              <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {thresholdG.toFixed(1)} g
              </span>
            </div>
            
            <input
              type="range"
              min="1.5"
              max="7.0"
              step="0.1"
              value={thresholdG}
              onChange={(e) => setThresholdG(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-500/20 p-2 rounded-xl flex items-start space-x-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Unvalidated demonstration limit. Do not use for medical impact certification.
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert title, IR state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition ${
                  severityFilter === sev
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Incident History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Alert Event Title</th>
                <th className="py-3.5 px-4 text-right">Accel Mag</th>
                <th className="py-3.5 px-4">IR Sensor State</th>
                <th className="py-3.5 px-4 text-center">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="w-8 h-8 text-slate-600" />
                      <p className="text-xs font-medium">No incidents logged matching criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const sevConfig = ALERT_SEVERITIES[alert.severity] || ALERT_SEVERITIES.INFO;
                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-800/40 transition ${
                        !alert.acknowledged ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      {/* Severity */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${sevConfig.badge}`}>
                          {alert.severity}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {alert.timestamp}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {alert.title}
                      </td>

                      {/* Magnitude */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                        {alert.magnitude.toFixed(2)} g
                      </td>

                      {/* IR State */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          alert.irState.includes('Object Detected')
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {alert.irState}
                        </span>
                      </td>

                      {/* Acknowledge Action */}
                      <td className="py-3.5 px-4 text-center">
                        {alert.acknowledged ? (
                          <span className="inline-flex items-center space-x-1 text-slate-500 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Acknowledged</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            title="Acknowledging does NOT claim physical impact is resolved"
                            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-semibold transition"
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Clear Incident History?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all <span className="text-white font-bold">{alerts.length}</span> logged safety incidents? This action will wipe the local session log.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAlertHistory();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
