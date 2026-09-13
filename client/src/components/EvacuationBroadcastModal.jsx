import React, { useState } from 'react';
import { 
  Radio, 
  X, 
  Megaphone, 
  Send, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Users, 
  Smartphone, 
  Building2,
  Volume2
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { sirenEngine } from '../utils/acousticSiren';

const EVACUATION_ZONES = [
  {
    id: 'ZONE-01',
    name: 'Zone 1: Ajit Singh Nagar & Payakapuram',
    description: 'Budameru Diversion Channel basin - Extreme flood risk',
    estimatedPop: '145,000 residents',
    primaryShelter: 'Andhra Loyola College & Siddhartha Grounds',
    severity: 'CRITICAL'
  },
  {
    id: 'ZONE-02',
    name: 'Zone 2: Krishnalanka & Ranigari Thota',
    description: 'Krishna Riverfront Retaining Wall corridor - High risk',
    estimatedPop: '82,000 residents',
    primaryShelter: 'Indira Gandhi Municipal Stadium',
    severity: 'HIGH RISK'
  },
  {
    id: 'ZONE-03',
    name: 'Zone 3: Bhavanipuram & Vidyadharapuram',
    description: 'Upstream canal backflow & railway underpass corridor',
    estimatedPop: '64,000 residents',
    primaryShelter: 'Bishop Azariah High School Shelter',
    severity: 'WATCH'
  },
  {
    id: 'ZONE-ALL',
    name: 'ALL Low-Lying Municipal Sectors (City-Wide Broadcast)',
    description: 'Full municipal emergency broadcast across all 64 VMC divisions',
    estimatedPop: '320,000+ residents',
    primaryShelter: 'All 14 Municipal Relief Centers Open',
    severity: 'CRITICAL'
  }
];

export const EvacuationBroadcastModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { logResponseAction } = useFloodData();

  const [selectedZoneId, setSelectedZoneId] = useState('ZONE-01');
  const [urgency, setUrgency] = useState('IMMEDIATE_EVACUATION');
  const [channels, setChannels] = useState({
    cellBroadcast: true,
    sirens: true,
    whatsapp: true,
    billboards: false
  });
  const [customNotes, setCustomNotes] = useState('');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentZone = EVACUATION_ZONES.find(z => z.id === selectedZoneId) || EVACUATION_ZONES[0];

  const defaultMessage = urgency === 'IMMEDIATE_EVACUATION'
    ? `URGENT FLOOD EVACUATION DIRECTIVE: Water levels in ${currentZone.name} have breached critical flood safety thresholds. All residents in low-lying areas must immediately relocate to designated safe shelters (${currentZone.primaryShelter}). State Disaster Response Force (SDRF) rescue boats and municipal buses are deployed along main corridors.`
    : `PRECAUTIONARY FLOOD ADVISORY: Krishna River & Budameru inflows are rising rapidly. Residents in ${currentZone.name} are advised to secure valuables, move to upper levels, and prepare emergency go-bags. Monitor VMC official alerts.`;

  const handleToggleChannel = (key) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDispatchBroadcast = () => {
    // Play tactical acoustic alert
    sirenEngine.playCriticalAlarm();

    // Log action to operational dossier
    logResponseAction({
      stationId: 'ST-003',
      stationName: currentZone.name,
      actionType: 'PUBLIC_EVACUATION_WARNING',
      actionTitle: `EMERGENCY DIRECTIVE: ${urgency.replace('_', ' ')} for ${currentZone.name}`,
      details: `${defaultMessage} Notes: ${customNotes || 'Dispatched via Cell Broadcast, WhatsApp Disaster Portal & Municipal Sirens.'}`,
      team: 'Vijayawada Civil Defense & Emergency Operations Center',
      operator: user?.name || 'Municipal Commander',
      status: 'DISPATCHED'
    });

    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-pulse">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-100">
                  Civil Defense Evacuation Broadcast
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-600/60 uppercase">
                  EOC Direct Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vijayawada Municipal Corporation & AP Disaster Management Authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {dispatchedSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Evacuation Directive Dispatched!</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Directive sent to cellular telecom towers, acoustic public sirens, and registered civil defense response teams.
              </p>
              <span className="text-[10px] font-mono text-cyan-400">
                Recorded in EOC Audit Dossier with cryptographic signature.
              </span>
            </div>
          ) : (
            <>
              {/* 1. Target Vulnerability Zone Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  1. Select Target Evacuation Sector:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EVACUATION_ZONES.map((zone) => {
                    const isSel = zone.id === selectedZoneId;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`p-3 rounded-xl text-left border transition ${
                          isSel
                            ? 'bg-rose-950/40 border-rose-500 text-slate-100 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{zone.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            zone.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                          }`}>
                            {zone.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{zone.description}</p>
                        <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>Est. Pop: {zone.estimatedPop}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Directive Severity & Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    2. Urgency Classification:
                  </label>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setUrgency('IMMEDIATE_EVACUATION')}
                      className={`w-full p-2.5 rounded-xl border text-left font-bold flex items-center space-x-2 transition ${
                        urgency === 'IMMEDIATE_EVACUATION'
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      <span>RED: Mandatory Evacuation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('PRECAUTIONARY_ADVISORY')}
                      className={`w-full p-2.5 rounded-xl border text-left font-bold flex items-center space-x-2 transition ${
                        urgency === 'PRECAUTIONARY_ADVISORY'
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>ORANGE: Precautionary Advisory</span>
                    </button>
                  </div>
                </div>

                {/* 3. Dissemination Channels */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    3. Dispatch Channels:
                  </label>
                  <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={channels.cellBroadcast}
                        onChange={() => handleToggleChannel('cellBroadcast')}
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                      />
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Cell Broadcast (Mass SMS)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={channels.sirens}
                        onChange={() => handleToggleChannel('sirens')}
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                      />
                      <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Municipal Acoustic Sirens</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={channels.whatsapp}
                        onChange={() => handleToggleChannel('whatsapp')}
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                      />
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Citizen Disaster Bot</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Live Broadcast Payload Preview */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  4. Automated Directive Message Preview:
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed">
                  <div className="text-[10px] text-rose-400 font-bold mb-1 uppercase tracking-wider">
                    [VMC DISASTER MANAGEMENT DIRECTIVE]
                  </div>
                  {defaultMessage}
                </div>
              </div>

              {/* Optional Field Commander Notes */}
              <div>
                <label className="block text-slate-400 mb-1">
                  Additional Operator Dispatch Instructions (Optional):
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. NDRF Boats deployed at Budameru culvert bridge. Relief buses parked at BRTS road."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!dispatchedSuccess && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-mono">
              Authorized by: <span className="text-slate-200 font-bold">{user?.name || 'Officer D. Vance'}</span> ({user?.badge || 'EOC-COMMAND-01'})
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatchBroadcast}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-rose-900/50 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Emergency Directive</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
