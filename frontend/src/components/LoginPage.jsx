import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Waves, 
  Radio, 
  Cpu, 
  Sparkles, 
  Terminal,
  Activity,
  Check,
  UserCheck,
  Users,
  Fingerprint,
  MapPin,
  Clock,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AiAssistantLogo } from './AiAssistantLogo';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@floodguard.gov');
  const [password, setPassword] = useState('password123');
  
  // Loading interface state
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  const rolePresets = [
    {
      id: "USR-004",
      email: "admin@floodguard.gov",
      name: "System Administrator",
      role: "Super Admin",
      agency: "FloodGuard AI Infrastructure Core",
      station: "EOC Central Command — Root Terminal 01",
      badge: "ROOT-ADMIN",
      clearance: "LEVEL 5 - FULL ROOT ACCESS",
      status: "Online / Primary Node",
      statusColor: "emerald",
      icon: "⚡",
      avatarBg: "from-amber-500 to-red-600",
      permissions: ["Global Root", "YOLOv8 Weights", "Barrage Gate Override", "All Telemetry"]
    },
    {
      id: "USR-001",
      email: "officer.vance@floodguard.gov",
      name: "Officer D. Vance",
      role: "Municipal Flood Commander",
      agency: "Emergency Operations Center (EOC)",
      station: "Krishna River Basin Command Post",
      badge: "EOC-COMMAND-01",
      clearance: "LEVEL 4 - TACTICAL DISPATCH",
      status: "Online / Shift Lead",
      statusColor: "emerald",
      icon: "👮",
      avatarBg: "from-blue-600 to-cyan-500",
      permissions: ["Incident Dispatch", "Siren Triggers", "Evacuation Orders", "CCTV Monitor"]
    },
    {
      id: "USR-002",
      email: "engineer.chen@floodguard.gov",
      name: "Supervisor R. Chen",
      role: "Field Hydrology Engineer",
      agency: "Drainage & Pump Operations Dept.",
      station: "Prakasam Barrage Outpost & Sluice Gates",
      badge: "FIELD-ENG-08",
      clearance: "LEVEL 3 - SENSOR TELEMETRY",
      status: "Field Patrol / Active",
      statusColor: "cyan",
      icon: "👷",
      avatarBg: "from-emerald-500 to-teal-600",
      permissions: ["Gate Calibration", "ESP32 Sensors", "Culvert Maintenance", "Water Flow Logs"]
    },
    {
      id: "USR-003",
      email: "dispatcher@floodguard.gov",
      name: "Civil Defense Dispatcher",
      role: "Civil Defense Dispatcher",
      agency: "District Civil Defense & Public Safety",
      station: "Public Warning Communications Desk",
      badge: "DISPATCH-11",
      clearance: "LEVEL 3 - EVACUATION ALERTING",
      status: "Standby / Monitoring",
      statusColor: "emerald",
      icon: "📻",
      avatarBg: "from-purple-600 to-indigo-600",
      permissions: ["Citizen SMS Alerts", "CAP Protocol Broadcasts", "Safe Route Routing"]
    }
  ];

  // Resolve currently typed or selected person
  const currentIdentity = rolePresets.find(r => r.email.toLowerCase() === (email || '').trim().toLowerCase()) || {
    id: "USR-CUSTOM",
    email: email || "operator@floodguard.gov",
    name: email ? (email.split('@')[0].replace('.', ' ').toUpperCase()) : "Municipal Operator",
    role: "Authorized Municipal Responder",
    agency: "Municipal Flood Management Bureau",
    station: "Field Terminal / Remote Station",
    badge: "MUNI-OPERATOR",
    clearance: "LEVEL 2 - OPERATOR ACCESS",
    status: "Ready for Authentication",
    statusColor: "cyan",
    icon: "👤",
    avatarBg: "from-cyan-600 to-blue-600",
    permissions: ["Live Telemetry View", "Alert Acknowledgment"]
  };

  // Start animated high-tech boot sequence showing exactly who is logging in
  const startBootSequence = (profile) => {
    setActiveProfile(profile);
    setIsBooting(true);
    setBootProgress(0);
    setBootLogs([
      `[0.1s] 🔑 Verifying cryptographic credentials for: ${profile.name}...`,
    ]);

    const steps = [
      { at: 15, log: `[0.3s] 👤 Identity Verified: ${profile.name} [Badge: ${profile.badge}]` },
      { at: 35, log: `[0.6s] 🛡️ Assigning Clearance: ${profile.clearance} (${profile.agency})` },
      { at: 55, log: `[1.0s] 📡 Establishing LoRa Mesh handshake to 6/6 ESP32 telemetry nodes... OK` },
      { at: 75, log: `[1.4s] 👁️ Initializing YOLOv8-FloodNet Edge Vision & CCTV inference pipelines... LOADED` },
      { at: 90, log: `[1.9s] 🌊 Synchronizing Prakasam Barrage 70-gate discharge vectors (465K Cusecs)... SYNCED` },
      { at: 100, log: `[2.2s] 🟢 Welcome, ${profile.name}! Launching Municipal Command Center...` }
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setBootProgress(Math.min(100, current));

      steps.forEach(s => {
        if (current >= s.at) {
          setBootLogs(prev => prev.includes(s.log) ? prev : [...prev, s.log]);
        }
      });

      if (current >= 105) {
        clearInterval(interval);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 400);
      }
    }, 40);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    startBootSequence(currentIdentity);
  };

  const handleSelectPreset = async (preset) => {
    setEmail(preset.email);
    setPassword('password123');
    await login(preset.email, 'password123');
    startBootSequence(preset);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 🚀 1. HIGH-TECH COMMAND CENTER BOOT / LOADING INTERFACE    */}
      {/* ========================================================= */}
      {isBooting ? (
        <div className="w-full max-w-xl bg-slate-900/95 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative z-10 animate-fade-in">
          {/* Central Pulsing AI Robot Logo */}
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-1.5 shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 flex items-center justify-center bg-slate-950">
                <AiAssistantLogo className="w-full h-full object-contain" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent uppercase">
                Initializing Command Interface
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                FloodGuard AI • Municipal Early Warning Core
              </p>
            </div>
          </div>

          {/* PROMINENT WHO IS LOGGING IN BANNER */}
          {activeProfile && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/60 shadow-lg shadow-cyan-950/50 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-mono tracking-wider text-cyan-300 font-bold uppercase">
                    Who Is Logging In: Identity Confirmed
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold animate-pulse">
                  ● ACTIVE AUTHENTICATION
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeProfile.avatarBg || 'from-cyan-600 to-blue-600'} p-0.5 shadow-lg flex items-center justify-center text-2xl border border-white/20`}>
                    <div className="w-full h-full rounded-2xl bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                      {activeProfile.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center space-x-2">
                      <span>{activeProfile.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                        {activeProfile.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-cyan-300 mt-0.5">{activeProfile.role}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{activeProfile.station || activeProfile.agency}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/40 font-bold block">
                    {activeProfile.clearance.split(' - ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    {activeProfile.clearance.split(' - ')[1] || 'AUTHORIZED'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Glowing Cyber Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Loading Systems & Neural Models...</span>
              </span>
              <span className="text-cyan-400 font-bold">{bootProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all duration-75 shadow-lg shadow-cyan-500/50"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="p-3.5 rounded-2xl bg-black/80 border border-slate-800 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto text-slate-300">
            {bootLogs.map((log, i) => (
              <div key={i} className="flex items-start space-x-1.5">
                <span className="text-cyan-400 font-bold">›</span>
                <span className={i === bootLogs.length - 1 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => onLoginSuccess && onLoginSuccess()}
              className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition underline underline-offset-2"
            >
              Skip intro & launch directly →
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 🔑 2. FULL COMMAND CENTER LOGIN SCREEN                     */
        /* ========================================================= */
        <div className="w-full max-w-5xl space-y-6 relative z-10">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-1 shadow-2xl shadow-cyan-500/30 border border-cyan-400/40 flex items-center justify-center mx-auto bg-slate-950">
              <AiAssistantLogo className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
              FloodGuard AI Operations Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Municipal Hydrological Early Warning System • LoRa Mesh IoT • YOLOv8 Dual-AI Vision Matrix
            </p>
          </div>

          {/* TWO-COLUMN COMMAND CENTER LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: ACTIVE IDENTITY DOSSIER & WHO IS LOGGING IN (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 🎯 "WHO IS LOGGING IN" CARD */}
              <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl backdrop-blur relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      Target Login Identity
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                    SELECTING OPERATOR
                  </span>
                </div>

                {/* Identity Profile Badge */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentIdentity.avatarBg || 'from-cyan-600 to-blue-600'} p-0.5 shadow-xl flex items-center justify-center text-3xl border border-white/20 flex-shrink-0`}>
                      <div className="w-full h-full rounded-2xl bg-slate-950/70 backdrop-blur flex items-center justify-center">
                        {currentIdentity.icon}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-white truncate">
                          {currentIdentity.name}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-cyan-400 truncate">
                        {currentIdentity.role}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        Badge ID: <span className="text-slate-200 font-semibold">{currentIdentity.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Duty Station & Clearance Tags */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Clearance</span>
                      <span className="text-emerald-400 font-bold text-[10px] font-mono truncate block mt-0.5">
                        {currentIdentity.clearance.split(' - ')[0]}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Duty Station</span>
                      <span className="text-slate-300 font-medium text-[10px] truncate block mt-0.5">
                        {currentIdentity.station ? currentIdentity.station.split('—')[0] : 'Vijayawada HQ'}
                      </span>
                    </div>
                  </div>

                  {/* Permissions Chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block mb-1.5">
                      Authorized Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentIdentity.permissions || ["Live Telemetry"]).map((perm, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-700/40 text-cyan-300"
                        >
                          ✓ {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 👥 WHO IS LOGGED IN / ACTIVE DUTY ROSTER */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                      Active Duty Personnel Roster
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Click to switch login
                  </span>
                </div>

                <div className="space-y-2">
                  {rolePresets.map((preset) => {
                    const isSelected = currentIdentity.email.toLowerCase() === preset.email.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setEmail(preset.email);
                          setPassword('password123');
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between border ${
                          isSelected 
                            ? 'bg-cyan-950/60 border-cyan-500/80 shadow-md shadow-cyan-950/50' 
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-xl flex-shrink-0">{preset.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {preset.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                                {preset.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{preset.role}</div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-end space-x-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{preset.status.split('/')[0]}</span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block">
                            {isSelected ? '● SELECTED' : 'Click to select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LOGIN CREDENTIALS FORM & 1-CLICK AUTHENTICATION (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Login Form Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>Officer Authentication Terminal</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter credentials or select a role to begin the cybernetic boot process.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded-xl">
                    PORT 5173 • SECURE
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium">Municipal Email / Account</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        Active: <strong className="text-cyan-300">{currentIdentity.name}</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@floodguard.gov"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium">Access Passcode</label>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-700/50 px-2 py-0.5 rounded-lg">
                        Demo Passcode: password123
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password123"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium transition"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON WITH CURRENT IDENTITY HIGHLIGHT */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition shadow-xl shadow-cyan-950/60 text-sm group"
                  >
                    <span>Authenticate & Log In as {currentIdentity.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* 1-CLICK INSTANT LOGIN PRESETS */}
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>1-Click Instant Login (Bypasses Typing)</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Auto-boots loading interface</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rolePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-left transition group shadow-md"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-lg">{preset.icon}</span>
                            <span className="font-extrabold text-slate-200 group-hover:text-cyan-300 text-xs truncate">
                              {preset.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                            {preset.badge}
                          </span>
                        </div>

                        <div className="text-[10px] text-cyan-400 font-medium truncate">
                          {preset.role}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">
                          {preset.email}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Passcode Notice */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Universal Demo Passcode:</span>
                  </div>
                  <code className="text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    password123
                  </code>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

