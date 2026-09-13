import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, CheckCircle2, Waves, Radio, Cpu, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('officer.vance@floodguard.gov');
  const [password, setPassword] = useState('password123');

  const rolePresets = [
    {
      id: "USR-001",
      email: "officer.vance@floodguard.gov",
      name: "Officer D. Vance",
      role: "Municipal Flood Commander",
      agency: "Emergency Operations Center",
      badge: "EOC-COMMAND-01",
      icon: "👮"
    },
    {
      id: "USR-002",
      email: "engineer.chen@floodguard.gov",
      name: "Supervisor R. Chen",
      role: "Field Hydrology Engineer",
      agency: "Drainage & Pump Operations",
      badge: "FIELD-ENG-08",
      icon: "👷"
    },
    {
      id: "USR-003",
      email: "dispatcher@floodguard.gov",
      name: "Civil Defense Dispatcher",
      role: "Emergency Dispatcher",
      agency: "Civil Defense Dispatch",
      badge: "DISPATCH-11",
      icon: "📻"
    },
    {
      id: "USR-004",
      email: "admin@floodguard.gov",
      name: "System Administrator",
      role: "Super Admin",
      agency: "FloodGuard AI Infrastructure",
      badge: "ROOT-ADMIN",
      icon: "⚡"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleSelectPreset = async (preset) => {
    setEmail(preset.email);
    const success = await login(preset.email, 'password123');
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/30 border border-cyan-400/40">
            <ShieldAlert className="w-8 h-8 text-white" />
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
                  placeholder="officer.vance@floodguard.gov"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Access Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-900/40 text-xs"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Command Center'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick 1-Click Role Presets */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Quick 1-Click Role Access
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Demo Ready</span>
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
          <span>IoT Flow: Ultrasonic Sensors → ESP32 → RPi Gateway → MQTT/HTTPS → AI Risk Engine</span>
        </div>
      </div>
    </div>
  );
};
