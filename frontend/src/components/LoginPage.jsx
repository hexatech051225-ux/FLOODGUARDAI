import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
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
  Check
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
      agency: "FloodGuard AI Infrastructure",
      badge: "ROOT-ADMIN",
      clearance: "LEVEL 5 - FULL ROOT ACCESS",
      icon: "⚡"
    },
    {
      id: "USR-001",
      email: "officer.vance@floodguard.gov",
      name: "Officer D. Vance",
      role: "Municipal Flood Commander",
      agency: "Emergency Operations Center",
      badge: "EOC-COMMAND-01",
      clearance: "LEVEL 4 - TACTICAL DISPATCH",
      icon: "👮"
    },
    {
      id: "USR-002",
      email: "engineer.chen@floodguard.gov",
      name: "Supervisor R. Chen",
      role: "Field Hydrology Engineer",
      agency: "Drainage & Pump Operations",
      badge: "FIELD-ENG-08",
      clearance: "LEVEL 3 - SENSOR TELEMETRY",
      icon: "👷"
    },
    {
      id: "USR-003",
      email: "dispatcher@floodguard.gov",
      name: "Civil Defense Dispatcher",
      role: "Emergency Dispatcher",
      agency: "Civil Defense Dispatch",
      badge: "DISPATCH-11",
      clearance: "LEVEL 3 - EVACUATION ALERTING",
      icon: "📻"
    }
  ];

  // Start animated high-tech boot sequence
  const startBootSequence = (profile) => {
    setActiveProfile(profile);
    setIsBooting(true);
    setBootProgress(0);
    setBootLogs([
      `[0.1s] 🔑 Verifying cryptographic credentials for ${profile.email}...`,
    ]);

    const steps = [
      { at: 20, log: `[0.4s] 🔒 Passcode hash verified (HMAC-SHA256). Clearance: ${profile.badge}` },
      { at: 45, log: `[0.8s] 📡 Establishing LoRa Mesh handshake to 6/6 ESP32 telemetry nodes... OK` },
      { at: 65, log: `[1.3s] 👁️ Initializing YOLOv8-FloodNet Edge Vision & CCTV inference pipelines... LOADED` },
      { at: 85, log: `[1.8s] 🌊 Synchronizing Prakasam Barrage 70-gate discharge vectors (465K Cusecs)... SYNCED` },
      { at: 100, log: `[2.2s] 🟢 Level 5 verified. Welcome, ${profile.name}. Launching Command Center!` }
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
    const matched = rolePresets.find(r => r.email.toLowerCase() === email.toLowerCase()) || {
      email,
      name: email.split('@')[0],
      role: "Municipal Operator",
      badge: "SEC-OPERATOR",
      clearance: "LEVEL 3 - MONITORING",
      icon: "👤"
    };

    await login(email, password);
    startBootSequence(matched);
  };

  const handleSelectPreset = async (preset) => {
    setEmail(preset.email);
    setPassword('password123');
    await login(preset.email, 'password123');
    startBootSequence(preset);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 🚀 1. HIGH-TECH COMMAND CENTER BOOT / LOADING INTERFACE    */}
      {/* ========================================================= */}
      {isBooting ? (
        <div className="w-full max-w-lg bg-slate-900/95 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative z-10 animate-fade-in">
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

          {/* Authenticated User Badge */}
          {activeProfile && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-lg">
                  {activeProfile.icon}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                    <span>{activeProfile.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                      {activeProfile.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{activeProfile.role}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                  AUTHENTICATED
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {activeProfile.clearance}
                </span>
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
        /* 🔑 2. STANDARD LOGIN CARD WITH PRESETS & CREDENTIALS INFO */
        /* ========================================================= */
        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-1 shadow-2xl shadow-cyan-500/30 border border-cyan-400/40 flex items-center justify-center mx-auto bg-slate-950">
              <AiAssistantLogo className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
              FloodGuard AI
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Municipal IoT Telemetry, AI Hydrological Risk Forecasting & Incident Dispatch Command Center
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Municipal Email / Badge ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@floodguard.gov"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">Access Passcode</label>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-700/40 px-1.5 py-0.2 rounded">
                    Default: password123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-900/40 text-xs"
              >
                <span>Enter Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick 1-Click Role Presets */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  1-Click Instant Login Presets
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Password: password123</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {rolePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 text-left transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{preset.icon}</span>
                      <span className="font-bold text-slate-200 group-hover:text-cyan-300 text-[11px] truncate">
                        {preset.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Architecture Strip */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400 text-center font-mono">
            <span>Passcode for all roles is <code className="text-cyan-300 font-bold">password123</code></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
