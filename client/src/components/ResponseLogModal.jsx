import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Users, 
  FileText, 
  Activity 
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { RESPONSE_ACTION_TYPES } from '../utils/constants';

export const ResponseLogModal = ({ isOpen, onClose, defaultStation, defaultAlert }) => {
  const { stations, logResponseAction } = useFloodData();
  const { user } = useAuth();

  const [stationId, setStationId] = useState(defaultStation?.id || stations[0]?.id || 'ST-001');
  const [actionType, setActionType] = useState('BARRIER_DEPLOYMENT');
  const [actionTitle, setActionTitle] = useState('');
  const [details, setDetails] = useState('');
  const [team, setTeam] = useState('Civil Defense Rapid Team Alpha');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const selectedStationObj = stations.find(s => s.id === stationId) || defaultStation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await logResponseAction({
        stationId,
        stationName: selectedStationObj?.name || `Station ${stationId}`,
        alertId: defaultAlert?.id || null,
        actionType,
        actionTitle,
        details,
        team,
        operator: user?.name || 'Officer Vance'
      });

      setSuccessMsg('Emergency response action logged and dispatched successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setActionType(preset.id);
    setActionTitle(preset.label);
    setTeam(preset.team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Log Municipal Response Action</h3>
              <p className="text-[11px] text-slate-400">Dispatch field teams & document mitigation audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-100">{successMsg}</h4>
            <p className="text-xs text-slate-400 font-mono">Incident response audit trail updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Linked Alert / Station Banner */}
            {defaultAlert && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-rose-300 font-medium">
                  Linked Incident Alert: <strong className="font-mono">{defaultAlert.id}</strong> ({defaultAlert.title})
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold">
                  {defaultAlert.severity}
                </span>
              </div>
            )}

            {/* Station Selection */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Monitoring Station</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Type Presets */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Action Category Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {RESPONSE_ACTION_TYPES.map((typeObj) => (
                  <button
                    type="button"
                    key={typeObj.id}
                    onClick={() => handlePresetSelect(typeObj)}
                    className={`p-2 rounded-xl text-left border transition text-[11px] ${
                      actionType === typeObj.id
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="line-clamp-1">{typeObj.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{typeObj.team}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Title */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Action Summary / Direct Order *</label>
              <input
                type="text"
                required
                placeholder="e.g., Deploy Riverfront Hydraulic Flood Gates 3A & 3B"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Operational Details */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operational Instructions & Notes</label>
              <textarea
                rows={3}
                placeholder="Enter field coordinates, pump flow rate targets, sandbag staging points, or traffic detour details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Assigned Team & Dispatching Operator */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Assigned Response Unit</label>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Dispatching Officer</label>
                <input
                  type="text"
                  disabled
                  value={`${user?.name || 'Officer Vance'} (${user?.badge || 'EOC-COMMAND'})`}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-cyan-900/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Action & Save Log'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
