import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  Mail, 
  MessageSquare, 
  UserCheck, 
  Terminal,
  Clock
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { sirenEngine } from '../utils/acousticSiren';

export const NotificationCenter = () => {
  const { alerts, soundEnabled, setSoundEnabled, playAlertChime } = useFloodData();
  const [permission, setPermission] = useState(Notification.permission || 'default');
  const [recipientRole, setRecipientRole] = useState('ALL_COMMANDERS');
  const [broadcastChannel, setBroadcastChannel] = useState('SMS_AND_EMAIL');
  const [customMessage, setCustomMessage] = useState('CRITICAL: Flood surge warning issued for Krishna Basin Ferry Ghat. Activate spillway gates immediately.');
  const [broadcastStatus, setBroadcastStatus] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        new Notification('FloodGuard AI Notifications Enabled', {
          body: 'You will receive instant alerts during flash flood surges and critical river rise.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleTestChime = () => {
    playAlertChime('CRITICAL');
  };

  const handleDispatchBroadcast = async () => {
    setIsBroadcasting(true);
    setBroadcastStatus(null);

    // Simulate SMS / Email alert dispatch
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastStatus({
        success: true,
        count: 18,
        recipients: '18 EOC Officers & Field Engineers',
        channel: broadcastChannel,
        timestamp: new Date().toLocaleTimeString()
      });

      // Fire Web Notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('🚨 Emergency Alert Dispatched', {
          body: customMessage,
          icon: '/favicon.ico'
        });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>EMERGENCY NOTIFICATION DISPATCH</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Real-Time Alarms, Browser Push & SMS/Email Broadcast</span>
          </h1>
          <p className="text-xs text-slate-400">
            Acoustic siren testing, web push notification management, and emergency broadcast dispatching.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestChime}
            className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-600/60 text-rose-300 text-xs font-mono font-bold flex items-center space-x-2 shadow-lg shadow-rose-950 transition"
          >
            <Volume2 className="w-4 h-4 text-rose-400" />
            <span>Test Acoustic Alarm Siren</span>
          </button>
        </div>
      </div>

      {/* Row 1: Notification Controls & Browser Permission (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Browser Web Push Notifications */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h2 className="font-extrabold text-slate-100 text-sm">🌐 Browser Web Push Alerts</h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${
              permission === 'granted' 
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                : 'bg-amber-950 text-amber-400 border-amber-500/40'
            }`}>
              {permission.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Enable instant web push alerts to receive acoustic siren notifications on your desktop or mobile device during sudden flash flood surges.
          </p>

          <div className="flex items-center space-x-3">
            {permission !== 'granted' ? (
              <button
                onClick={requestBrowserPermission}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-cyan-950"
              >
                <Bell className="w-4 h-4" />
                <span>Enable Browser Push Notifications</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Web Push Notifications Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Acoustic Alarm Siren Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-rose-400" />
              <h2 className="font-extrabold text-slate-100 text-sm">🔊 EOC Acoustic Siren Chime Engine</h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${
              soundEnabled 
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {soundEnabled ? 'AUDIO ENABLED' : 'MUTED'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Synthesizes synthetic dual-tone acoustic sirens (880Hz / 440Hz) via the Web Audio API when critical alerts are generated.
          </p>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center space-x-2 transition"
            >
              {soundEnabled ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Emergency SMS / Email Alert Broadcast Simulator */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-rose-400" />
            <h2 className="font-extrabold text-slate-100 text-sm">📲 Emergency Dispatch SMS / Email Broadcast Simulator</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Civil Defense Broadcast</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-slate-400">Target Officer Audience:</label>
            <select
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
            >
              <option value="ALL_COMMANDERS">All EOC Commanders & Officers (18 Target)</option>
              <option value="FIELD_ENGINEERS">Field Hydrology Engineers (8 Target)</option>
              <option value="DISPATCHERS">Civil Defense Dispatchers (5 Target)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Broadcast Channels:</label>
            <select
              value={broadcastChannel}
              onChange={(e) => setBroadcastChannel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
            >
              <option value="SMS_AND_EMAIL">SMS + Email Dual Priority Broadcast</option>
              <option value="SMS_ONLY">SMS High Priority Gateway</option>
              <option value="EMAIL_ONLY">Email Officer Dispatch</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Priority Level:</label>
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs font-bold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>FLASH FLOOD HIGH PRIORITY OVERRIDE</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs font-mono">
          <label className="text-slate-400">Broadcast Alert Message Payload:</label>
          <textarea
            rows="2"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-3 outline-none focus:border-rose-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleDispatchBroadcast}
            disabled={isBroadcasting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-rose-950 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isBroadcasting ? 'Broadcasting Alert...' : 'Dispatch Emergency Broadcast Now'}</span>
          </button>

          {broadcastStatus && (
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dispatched to {broadcastStatus.recipients} at {broadcastStatus.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
