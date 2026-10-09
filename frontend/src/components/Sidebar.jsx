import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Settings,
  Sliders,
  ShieldCheck,
  Cpu,
  Radio
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  unacknowledgedCount,
  systemStatus
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'chart', label: 'Live Telemetry Chart', icon: Activity },
    {
      id: 'alerts',
      label: 'Incident History',
      icon: AlertTriangle,
      badge: unacknowledgedCount > 0 ? unacknowledgedCount : null
    },
    { id: 'settings', label: 'Device & API Settings', icon: Settings },
    { id: 'demo', label: 'Simulation Controls', icon: Sliders }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          
          {/* Header info in sidebar for mobile */}
          <div className="lg:hidden pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Smart Factory Safety</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Industrial Pod Monitor</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              System Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs lg:text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Hardware Info Card */}
        <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Target NodeMCU ESP-12E</span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div className="flex justify-between">
              <span>Accel:</span>
              <span className="text-slate-300 font-mono">MPU6500 (I²C 0x68)</span>
            </div>
            <div className="flex justify-between">
              <span>IR Sensor:</span>
              <span className="text-slate-300 font-mono">GPIO13 (Pin D7)</span>
            </div>
            <div className="flex justify-between">
              <span>Range:</span>
              <span className="text-slate-300 font-mono">±8 g (4096 LSB/g)</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
