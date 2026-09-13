import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  Megaphone,
  User, 
  LogOut, 
  ChevronDown, 
  Activity,
  Waves,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { sirenEngine } from '../utils/acousticSiren';

export const Navbar = ({ onOpenEvacuationModal }) => {
  const { 
    stations, 
    alerts, 
    soundEnabled, 
    setSoundEnabled, 
    connectionMode,
    lastUpdate 
  } = useFloodData();
  const { user, logout, switchRole } = useAuth();
  
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(sirenEngine.getMuted());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSiren = () => {
    const muted = sirenEngine.toggleMute();
    setIsSirenMuted(muted);
    setSoundEnabled(!muted);
    if (!muted) {
      sirenEngine.playChime();
    }
  };

  // Compute highest municipal severity
  const activeCritical = alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'CRITICAL').length;
  const activeHigh = alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'HIGH RISK').length;
  const activeWatch = alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'WATCH').length;

  let overallLevel = 'SAFE';
  let levelColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60';
  if (activeCritical > 0) {
    overallLevel = 'CRITICAL SURGE';
    levelColor = 'text-rose-400 border-rose-500/50 bg-rose-950/80 animate-pulse';
  } else if (activeHigh > 0) {
    overallLevel = 'HIGH HAZARD';
    levelColor = 'text-orange-400 border-orange-500/50 bg-orange-950/80';
  } else if (activeWatch > 0) {
    overallLevel = 'WATCH ADVISORY';
    levelColor = 'text-amber-400 border-amber-500/50 bg-amber-950/80';
  }

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c121e]/95 backdrop-blur px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Emergency Level */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
                FloodGuard AI
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                EOC LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Vijayawada Hydrological Command Center</p>
          </div>
        </div>

        {/* Global Emergency Status Badge */}
        <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold ${levelColor}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>STATUS: {overallLevel}</span>
        </div>
      </div>

      {/* Center Operational Live Incident Ticker */}
      <div className="hidden xl:flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono shadow-md">
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">LIVE TELEMETRY:</span>
          <span className="text-slate-300">6 Krishna Basin Gauges</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center space-x-1.5">
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Prakasam Barrage:</span>
          <span className="text-cyan-300 font-bold">465K Cusecs (70 Gates)</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400">Budameru:</span>
          <span className="text-rose-400 font-bold">Surge Breach Risk</span>
        </div>
      </div>

      {/* Right Controls: Evacuation Broadcast, Telemetry Mode, Mute Siren, Time, User */}
      <div className="flex items-center space-x-2.5">
        {/* Civil Defense Evacuation Directive Shortcut */}
        <button
          onClick={() => onOpenEvacuationModal && onOpenEvacuationModal()}
          className="bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950 transition active:scale-95"
          title="Dispatch Civil Defense Evacuation Directive"
        >
          <Megaphone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline">Evacuation Directive</span>
        </button>

        {/* Live Socket Feed Status */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 ${connectionMode === 'BACKEND_SOCKET' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className="text-slate-400">IoT Feed:</span>
          <span className={connectionMode === 'BACKEND_SOCKET' ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-semibold'}>
            {connectionMode === 'BACKEND_SOCKET' ? 'LoRaWAN Live' : 'Resilient Edge Gateway'}
          </span>
        </div>

        {/* Acoustic Alarm Siren Toggle */}
        <button
          onClick={handleToggleSiren}
          className={`p-2 rounded-xl border transition ${
            !isSirenMuted 
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800 shadow-sm shadow-cyan-950' 
              : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={!isSirenMuted ? "Acoustic Emergency Siren Active (Click to Mute)" : "Acoustic Siren Muted (Click to Enable)"}
        >
          {!isSirenMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time.toLocaleTimeString()}</span>
        </div>

        {/* User Badge & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-200 transition"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {user?.name ? user.name[0] : 'O'}
            </div>
            <div className="hidden md:block text-left">
              <div className="font-semibold text-xs leading-none">{user?.name || 'Officer Vance'}</div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.role || 'Municipal Commander'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-bold text-sm text-slate-100">{user?.name}</div>
                <div className="text-xs text-cyan-400 font-mono">{user?.agency}</div>
                <div className="text-[10px] text-slate-400 mt-1">Badge: {user?.badge}</div>
              </div>

              <div className="py-1">
                <div className="text-[10px] uppercase font-mono text-slate-400 px-3 py-1">Switch Role Preset</div>
                <button
                  onClick={() => {
                    switchRole({
                      id: "USR-001",
                      name: "Officer D. Vance",
                      role: "Municipal Flood Commander",
                      agency: "Vijayawada Emergency Operations Center",
                      badge: "EOC-COMMAND-01"
                    });
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  👮 Municipal Commander (Vance)
                </button>
                <button
                  onClick={() => {
                    switchRole({
                      id: "USR-002",
                      name: "Supervisor R. Chen",
                      role: "Field Hydrology Engineer",
                      agency: "VMC Drainage & Pump Operations",
                      badge: "FIELD-ENG-08"
                    });
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  👷 Field Engineer (Chen)
                </button>
                <button
                  onClick={() => {
                    switchRole({
                      id: "USR-003",
                      name: "Public Safety Dispatcher",
                      role: "Emergency Dispatcher",
                      agency: "Civil Defense Dispatch Unit",
                      badge: "DISPATCH-11"
                    });
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  📻 Safety Dispatcher
                </button>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
