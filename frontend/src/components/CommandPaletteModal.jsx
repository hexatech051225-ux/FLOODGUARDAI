import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  Cpu, 
  LayoutDashboard, 
  Gauge, 
  BrainCircuit, 
  BellRing, 
  FileText, 
  TrendingUp, 
  History, 
  Terminal, 
  ShieldAlert, 
  Sliders, 
  LifeBuoy, 
  ClipboardCheck, 
  Volume2, 
  X,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { SCENARIOS } from '../utils/constants';

export const CommandPaletteModal = ({ 
  isOpen, 
  onClose, 
  setActiveTab, 
  onOpenStationDetail, 
  onOpenEvacuationModal, 
  onOpenCitizenPortal, 
  onOpenSopPlaybook,
  onOpenCopilot
}) => {
  const { stations, setScenario, soundEnabled, setSoundEnabled } = useFloodData();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable command registry
  const commands = [
    // 1. Navigation Tabs
    { id: 'tab-overview', title: 'Go to Command Center (Overview)', category: 'Navigation', icon: LayoutDashboard, action: () => { setActiveTab('overview'); onClose(); } },
    { id: 'tab-twin', title: 'Open AquaTwinΓäó Hydrological Digital Twin Sandbox', category: 'Navigation', icon: Cpu, action: () => { setActiveTab('digital-twin'); onClose(); } },
    { id: 'tab-map', title: 'Open GIS Hazard Map & Doppler Radar', category: 'Navigation', icon: MapPin, action: () => { setActiveTab('map'); onClose(); } },
    { id: 'tab-telemetry', title: 'Open Basin Sensor Telemetry Grid', category: 'Navigation', icon: Gauge, action: () => { setActiveTab('telemetry'); onClose(); } },
    { id: 'tab-packets', title: 'Open IoT LoRaWAN Packet Terminal', category: 'Navigation', icon: Terminal, action: () => { setActiveTab('packets'); onClose(); } },
    { id: 'tab-ai', title: 'Open AI Risk Assessment Engine & Hydrograph', category: 'Navigation', icon: BrainCircuit, action: () => { setActiveTab('ai'); onClose(); } },
    { id: 'tab-alerts', title: 'Open Incident Alerts & Dispatch Center', category: 'Navigation', icon: BellRing, action: () => { setActiveTab('alerts'); onClose(); } },
    { id: 'tab-devices', title: 'Open IoT Edge Hardware Health & OTA Console', category: 'Navigation', icon: Cpu, action: () => { setActiveTab('devices'); onClose(); } },
    { id: 'tab-charts', title: 'Open Historical Trends & Hydrographs', category: 'Navigation', icon: TrendingUp, action: () => { setActiveTab('charts'); onClose(); } },
    { id: 'tab-logs', title: 'Open Emergency Response Action Dossier', category: 'Navigation', icon: FileText, action: () => { setActiveTab('logs'); onClose(); } },

    // 2. Modals & Critical Tools
    { id: 'act-copilot', title: 'Consult Sentinel-AI Tactical Disaster Copilot', category: 'Quick Action', icon: BrainCircuit, action: () => { onOpenCopilot(); onClose(); } },
    { id: 'act-citizen', title: 'Open Citizen Safety & SOS Early-Warning Portal', category: 'Quick Action', icon: LifeBuoy, action: () => { onOpenCitizenPortal(); onClose(); } },
    { id: 'act-sop', title: 'Open Municipal Disaster SOP & Incident Playbook', category: 'Quick Action', icon: ClipboardCheck, action: () => { onOpenSopPlaybook(); onClose(); } },
    { id: 'act-evac', title: 'Dispatch Civil Defense Evacuation Directive Broadcast', category: 'Emergency Action', icon: ShieldAlert, action: () => { onOpenEvacuationModal(); onClose(); } },
    { id: 'act-siren', title: 'Toggle Acoustic Emergency Siren', category: 'Quick Action', icon: Volume2, action: () => { setSoundEnabled(!soundEnabled); onClose(); } },

    // 3. Scenarios
    ...SCENARIOS.map(sc => ({
      id: `sc-${sc.id}`,
      title: `Switch Weather Scenario: ${sc.label}`,
      category: 'Weather Scenarios',
      icon: Sliders,
      action: () => { setScenario(sc.id); onClose(); }
    })),

    // 4. Stations
    ...stations.map(st => ({
      id: `st-${st.id}`,
      title: `Inspect Station: [${st.code}] ${st.name}`,
      category: 'Sensor Stations',
      icon: MapPin,
      action: () => { onOpenStationDetail(st); onClose(); }
    }))
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, station name, scenario, or feature... (ΓåæΓåô to navigate, Enter to run)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-medium">{cmd.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {cmd.category}
                    </span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 px-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Γåæ</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Γåô</kbd></span>
          <span>Execute with <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Γå╡</kbd></span>
          <span>Quick Shortcut <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};
