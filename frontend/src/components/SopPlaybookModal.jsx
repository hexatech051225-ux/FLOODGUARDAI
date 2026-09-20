import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  X, 
  ChevronRight, 
  FileText,
  Printer
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PLAYBOOK = [
  {
    phaseId: 'PHASE-1',
    phaseName: 'Phase 1: Hydrologic Watch & Early Surveillance',
    triggerCondition: 'Krishna Basin Water Level > Warning Threshold (3.2m) or Precipitation > 25 mm/h',
    items: [
      { id: 'SOP-101', title: 'Verify Telemetry Link Integrity', desc: 'Confirm 100% packet reception from all 6 upstream and urban culvert IoT nodes.', completed: true, completedBy: 'Supervisor R. Chen', time: '08:15 IST' },
      { id: 'SOP-102', title: 'Alert Prakasam Barrage Headworks Division', desc: 'Confirm spillway gate hoist hydraulic pressures and clear log/debris grates.', completed: true, completedBy: 'Officer D. Vance', time: '08:30 IST' },
      { id: 'SOP-103', title: 'Initiate 24/7 EOC Watch Shift Rosters', desc: 'Mobilize municipal hydrologists, GIS operators, and civil defense radio liaisons.', completed: true, completedBy: 'Officer D. Vance', time: '09:00 IST' }
    ]
  },
  {
    phaseId: 'PHASE-2',
    phaseName: 'Phase 2: Tactical Staging & Barrier Deployment',
    triggerCondition: 'Rate of Rise > 10 cm/h or Basin Saturation > 70%',
    items: [
      { id: 'SOP-201', title: 'Pre-Stage 100 HP High-Volume Dewatering Pumps', desc: 'Deploy 4 municipal diesel sump pump units to Ajit Singh Nagar & Ambapuram regulator.', completed: true, completedBy: 'Supervisor R. Chen', time: '11:20 IST' },
      { id: 'SOP-202', title: 'Deploy Mobile Traffic Detour Signage at Underpasses', desc: 'Barricade Benz Circle NH16 underpass and divert traffic to elevated flyover corridors.', completed: false, completedBy: null, time: null },
      { id: 'SOP-203', title: 'Inspect Krishnalanka Flood Retaining Embankment', desc: 'Verify no active sand boils or structural weeping along downstream concrete retaining wall.', completed: false, completedBy: null, time: null }
    ]
  },
  {
    phaseId: 'PHASE-3',
    phaseName: 'Phase 3: Critical Evacuation & Breach Response',
    triggerCondition: 'Water Level >= Critical Embankment Limit or Cloudburst Surge Active',
    items: [
      { id: 'SOP-301', title: 'Sound Municipal Acoustic Air-Raid Sirens', desc: 'Activate synchronized civil defense sirens in Ajit Singh Nagar, Krishnalanka and Ranigari Thota.', completed: false, completedBy: null, time: null },
      { id: 'SOP-302', title: 'Dispatch SDRF & NDRF Quick Response Boat Teams', desc: 'Launch inflatable boats to Zone 1 low-lying street sectors for priority citizen extraction.', completed: false, completedBy: null, time: null },
      { id: 'SOP-303', title: 'Open Designated Primary Relief Shelters', desc: 'Authorize intake at Indira Gandhi Municipal Stadium and Andhra Loyola College with rations & medical staff.', completed: true, completedBy: 'Disaster Dispatcher', time: '12:45 IST' },
      { id: 'SOP-304', title: 'Issue Reverse-911 Cell Broadcast Directive', desc: 'Transmit multilingual SMS / WhatsApp urgent evacuation directives to Krishna district geo-fenced towers.', completed: false, completedBy: null, time: null }
    ]
  },
  {
    phaseId: 'PHASE-4',
    phaseName: 'Phase 4: Post-Storm Drainage & Recovery',
    triggerCondition: 'Basin Crest Passed & Receding Below Warning Stages',
    items: [
      { id: 'SOP-401', title: 'Verify Gravity Discharge & Sluice Gate Silt Clearance', desc: 'Inspect canal intake sluice gates and flush accumulated water hyacinth debris.', completed: false, completedBy: null, time: null },
      { id: 'SOP-402', title: 'Municipal Drinking Water & Epidemic Health Screening', desc: 'Chlorinate municipal water sumps and deploy vector-borne prophylaxis teams.', completed: false, completedBy: null, time: null }
    ]
  }
];

export const SopPlaybookModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { logResponseAction } = useFloodData();
  const [playbook, setPlaybook] = useState(DEFAULT_PLAYBOOK);
  const [activePhase, setActivePhase] = useState('PHASE-2');

  const handleToggleItem = (phaseId, itemId) => {
    setPlaybook(prev => prev.map(phase => {
      if (phase.phaseId !== phaseId) return phase;

      return {
        ...phase,
        items: phase.items.map(item => {
          if (item.id !== itemId) return item;

          const isNowCompleted = !item.completed;
          const time = isNowCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST' : null;
          const completedBy = isNowCompleted ? (user?.name || 'Commander Vance') : null;

          if (isNowCompleted) {
            logResponseAction({
              stationId: 'SOP-ACTION',
              stationName: phase.phaseName.split(':')[0],
              actionType: 'DEBRIS_CLEARANCE',
              actionTitle: `SOP EXECUTED: [${item.id}] ${item.title}`,
              details: `Standard Operating Procedure validated by ${completedBy}. Phase: ${phase.phaseName}`,
              team: 'Municipal Disaster Command',
              operator: completedBy
            });
          }

          return {
            ...item,
            completed: isNowCompleted,
            completedBy,
            time
          };
        })
      };
    }));
  };

  // Compute total progress
  let totalTasks = 0;
  let completedTasks = 0;
  playbook.forEach(phase => {
    phase.items.forEach(item => {
      totalTasks++;
      if (item.completed) completedTasks++;
    });
  });
  const progressPct = Math.round((completedTasks / Math.max(1, totalTasks)) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                  Municipal Disaster SOP & Incident Action Playbook
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  APSDMA STANDARD PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official operational checklist for municipal flood emergency phases & multi-agency execution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl text-xs transition border border-slate-700 hidden sm:flex items-center space-x-1"
              title="Print Checklist"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print SOP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-3 px-5 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-2">
                <span>Total SOP Playbook Execution Progress:</span>
                <span className="font-mono text-cyan-300 font-bold">{completedTasks} / {totalTasks} Tasks Complete</span>
              </span>
              <span className="font-mono font-bold text-cyan-400">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase Tabs */}
        <div className="flex items-center space-x-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          {playbook.map(phase => (
            <button
              key={phase.phaseId}
              onClick={() => setActivePhase(phase.phaseId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                activePhase === phase.phaseId
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {phase.phaseName.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Checklist Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-950/50">
          {playbook.filter(p => p.phaseId === activePhase).map(phase => (
            <div key={phase.phaseId} className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100">{phase.phaseName}</h4>
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                    Trigger Criteria: {phase.triggerCondition}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-800">
                  {phase.items.filter(i => i.completed).length} / {phase.items.length} Checked
                </span>
              </div>

              <div className="space-y-2.5">
                {phase.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(phase.phaseId, item.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3.5 select-none ${
                      item.completed
                        ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 border transition ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-slate-600 bg-slate-900'
                    }`}>
                      {item.completed && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                            {item.id}
                          </span>
                          <h5 className={`font-bold text-xs ${item.completed ? 'text-slate-100 line-through opacity-80' : 'text-slate-100'}`}>
                            {item.title}
                          </h5>
                        </div>

                        {item.completed ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Signed off by {item.completedBy} ({item.time})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400">
                            PENDING EXECUTION
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
