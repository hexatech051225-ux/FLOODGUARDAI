import React from 'react';
import { 
  Activity,
  LayoutDashboard, 
  MapPin, 
  Gauge, 
  BrainCircuit, 
  BellRing, 
  Bell,
  FileText, 
  TrendingUp, 
  BarChart3,
  Cpu, 
  History,
  Terminal,
  Sliders,
  Sparkles,
  Camera,
  LifeBuoy,
  ClipboardCheck
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { alerts, stations } = useFloodData();

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = stations.filter(s => s.riskAnalysis?.riskLevel === 'CRITICAL').length;

  const menuItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'vision', label: 'YOLO Vision & CCTV', icon: Camera, badge: 'YOLOv8 AI', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50' },
    { id: 'digital-twin', label: 'AquaTwin™ Sandbox', icon: Sliders, badge: 'PHYSICS AI', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50' },
    { id: 'hardware', label: 'Live Hardware Test', icon: Activity, badge: 'TEST 🟢', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600/50 animate-pulse' },
    { id: 'ml_test', label: 'ML Test Suite', icon: Sparkles, badge: 'TESTS', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-600/50' },
    { id: 'analytics', label: 'Advanced Visualizations', icon: BarChart3, badge: 'PLOTS', badgeColor: 'bg-blue-950 text-blue-300 border-blue-600/50' },
    { id: 'notifications', label: 'Alarm Notifications', icon: Bell, badge: 'ALERTS', badgeColor: 'bg-rose-950 text-rose-300 border-rose-600/50 animate-pulse' },
    { id: 'map', label: 'GIS Flood Map', icon: MapPin, badge: criticalCount > 0 ? `${criticalCount} Critical` : null, badgeColor: 'bg-rose-950 text-rose-300 border-rose-600/50' },
    { id: 'telemetry', label: 'Sensor Telemetry', icon: Gauge, badge: `${stations.length} Stns` },
    { id: 'packets', label: 'IoT Packet Terminal', icon: Terminal, badge: 'Live RX', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600/50' },
    { id: 'ai', label: 'AI Risk Engine', icon: BrainCircuit, badge: 'ML Live', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-600/50' },
    { id: 'alerts', label: 'Alerts & Incidents', icon: BellRing, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null, badgeColor: 'bg-rose-950 text-rose-300 border-rose-600/50 animate-pulse' },
    { id: 'citizen-portal', label: 'Citizen Safety & SOS', icon: LifeBuoy, badge: 'PUBLIC', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600/50' },
    { id: 'sop-playbook', label: 'Disaster SOP Playbook', icon: ClipboardCheck, badge: 'SOP', badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-600/50' },
    { id: 'logs', label: 'Response Action Log', icon: FileText, badge: null },
    { id: 'charts', label: 'Historical Trends', icon: TrendingUp, badge: null },
    { id: 'devices', label: 'IoT Gateway Health', icon: Cpu, badge: null },
    { id: 'events', label: 'Flood Archive & Export', icon: History, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0c121e]/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Operations Hub
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Telemetry & IoT Architecture Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/90 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Gateways</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">3 / 3 OK</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ESP32 Nodes</span>
            <span className="font-mono text-cyan-400 font-semibold">{stations.length} Active</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Telemetry Rate</span>
            <span className="font-mono text-slate-300">4.0s Burst</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
