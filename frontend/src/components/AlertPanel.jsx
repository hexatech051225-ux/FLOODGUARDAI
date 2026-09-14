import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { RISK_LEVELS } from '../utils/constants';
import { formatRelativeTime, formatDateFull } from '../utils/formatters';

export const AlertPanel = ({ onOpenResponseLog }) => {
  const { alerts, acknowledgeAlert, resolveAlert, stations } = useFloodData();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'CRITICAL' | 'HIGH' | 'RESOLVED'
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE') return alert.status === 'ACTIVE';
    if (filterStatus === 'RESOLVED') return alert.status === 'RESOLVED';
    if (filterStatus === 'CRITICAL') return alert.severity === 'CRITICAL';
    if (filterStatus === 'HIGH') return alert.severity === 'HIGH RISK';
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-4">
      {/* Top Filter & Summary Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-rose-400" />
            <h2 className="font-extrabold text-base text-slate-100">Municipal Alert & Dispatch Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeCount} active hydrological alerts requiring acknowledgement or dispatch
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: `All (${alerts.length})` },
            { id: 'ACTIVE', label: `Active (${activeCount})`, highlight: activeCount > 0 },
            { id: 'CRITICAL', label: `Critical (${criticalCount})`, highlight: criticalCount > 0 },
            { id: 'HIGH', label: 'High Risk' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                filterStatus === tab.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-slate-200 text-sm">No Alerts Matching Criteria</h4>
            <p className="text-xs text-slate-400">All sensor telemetry is nominal for this filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const riskMeta = RISK_LEVELS[alert.severity?.replace(' ', '_')] || RISK_LEVELS.SAFE;
            const isExpanded = expandedAlertId === alert.id;
            const associatedStation = stations.find(s => s.id === alert.stationId);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border bg-gradient-to-r from-slate-900/95 to-slate-950 transition-all shadow-xl ${
                  alert.severity === 'CRITICAL' && alert.status === 'ACTIVE'
                    ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                    : alert.status === 'RESOLVED'
                    ? 'border-slate-800/60 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 animate-pulse' :
                      alert.severity === 'HIGH RISK' ? 'bg-orange-950 text-orange-400' :
                      'bg-amber-950 text-amber-400'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          {alert.id}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${riskMeta.badgeClass}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold">
                          {alert.stationName}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-100 mt-1">{alert.title}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{alert.description}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Triggered: {formatRelativeTime(alert.timestamp)} ({formatDateFull(alert.timestamp)})</span>
                        </span>
                        {alert.acknowledgedBy && (
                          <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Ack by {alert.acknowledgedBy}</span>
                          </span>
                        )}
                        {alert.status === 'RESOLVED' && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">
                            RESOLVED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id, user?.name || 'Officer Vance')}
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveAlert(alert.id, user?.name || 'Officer Vance')}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenResponseLog && onOpenResponseLog(associatedStation || { id: alert.stationId, name: alert.stationName }, alert)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Response</span>
                    </button>

                    <button
                      onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="View audit actions"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Action Audit Trail */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 bg-slate-950/60 p-3 rounded-xl">
                    <h5 className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                      Linked Emergency Actions Logged ({alert.responseActions?.length || 0})
                    </h5>
                    {alert.responseActions && alert.responseActions.length > 0 ? (
                      <div className="space-y-1.5">
                        {alert.responseActions.map((act, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-200">{act.action}</div>
                              <p className="text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                            </div>
                            <div className="text-right font-mono text-[10px] text-slate-500">
                              <div>{act.operator}</div>
                              <div>{formatRelativeTime(act.timestamp)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No emergency field actions logged yet for this incident.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
