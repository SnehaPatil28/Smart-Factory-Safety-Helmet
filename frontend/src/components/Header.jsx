import React from 'react';
import { Shield, Wifi, WifiOff, Activity, Sliders, Menu, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Header({
  isDemoMode,
  setIsDemoMode,
  isConnected,
  lastReceivedTime,
  systemStatus,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-teal-400 rounded-xl shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg lg:text-xl font-bold tracking-wider text-white">
                  SMART FACTORY SAFETY
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 rounded-full">
                  Pod Safety v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Helmet Monitoring &amp; Incident Detection System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Device Status & Mode Toggle */}
        <div className="flex items-center space-x-3 lg:space-x-5">
          
          {/* Hardware Connection Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
            {isConnected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">ONLINE</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                <WifiOff className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 font-medium">OFFLINE</span>
              </>
            )}
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              {lastReceivedTime ? `Last: ${lastReceivedTime}` : 'Connecting...'}
            </span>
          </div>

          {/* Mode Switcher Badge (Demo vs Live) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setIsDemoMode(true)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </button>

            <button
              onClick={() => setIsDemoMode(false)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !isDemoMode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm glow-teal'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Hardware</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
