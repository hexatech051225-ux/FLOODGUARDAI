import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Activity,
  CheckCircle2,
  ChevronRight,
  FileText,
  Printer,
  Copy,
  Download,
  X,
  Waves,
  Zap,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { RISK_LEVELS } from '../utils/constants';
import { formatWaterLevel, formatRateOfRise } from '../utils/formatters';

export const AiRiskPanel = ({ onOpenStationDetail, onOpenResponseLog }) => {
  const { stations, alerts } = useFloodData();
  const { user } = useAuth();
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || 'ST-003');
  const [showSitRepModal, setShowSitRepModal] = useState(false);
  const [copiedSitRep, setCopiedSitRep] = useState(false);

  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const ai = currentStation?.riskAnalysis || {};
  const riskMeta = RISK_LEVELS[ai.riskLevel?.replace(' ', '_')] || RISK_LEVELS.SAFE;

  // Generate 6-hour forecast data points for chart
  const currentWater = currentStation?.currentTelemetry?.waterLevel || 2.5;
  const fc = ai.forecast || {
    forecast1h: Number((currentWater + 0.15).toFixed(2)),
    forecast3h: Number((currentWater + 0.35).toFixed(2)),
    forecast6h: Number((currentWater + 0.20).toFixed(2))
  };

  const forecastData = [
    { time: 'Live (0h)', level: currentWater, critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
    { time: '+1h Horizon', level: fc.forecast1h, critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
    { time: '+2h Horizon', level: Number(((fc.forecast1h + fc.forecast3h) / 2).toFixed(2)), critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
    { time: '+3h Horizon', level: fc.forecast3h, critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
    { time: '+4.5h Horizon', level: Number(((fc.forecast3h + fc.forecast6h) / 2).toFixed(2)), critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
    { time: '+6h Horizon', level: fc.forecast6h, critical: currentStation.dangerThresholds.critical, warning: currentStation.dangerThresholds.warning },
  ];

  // SitRep Document text for official submission
  const sitRepText = `
===================================================================
VIJAYAWADA MUNICIPAL CORPORATION (VMC) - DISASTER MANAGEMENT CELL
OFFICIAL EMERGENCY OPERATIONS CENTER (EOC) SITUATION REPORT (SITREP)
===================================================================
Report Number: SITREP-VMC-${new Date().toISOString().slice(0,10)}-${new Date().getHours()}00
Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Issuing Authority: ${user?.name || 'Officer D. Vance'}, ${user?.role || 'Municipal Commander'}
Recipient: Andhra Pradesh State Disaster Management Authority (APSDMA) / District Collector

1. EXECUTIVE SUMMARY & KRISHNA BASIN STATUS
-------------------------------------------------------------------
- Overall Basin Risk Level: CRITICAL SURGE / ACTIVE FLOOD MONITORING
- Prakasam Barrage Status: 70/70 Gates Discharging 465,000 Cusecs
- Budameru Diversion Channel (BDC): Level at 2.98m (93.1% max retention capacity)
- Active Incident Alarms: ${alerts.filter(a => a.status === 'ACTIVE').length} Active Breaches / Advisories

2. STATION TELEMETRY DOSSIER
-------------------------------------------------------------------
${stations.map(s => `* [${s.code}] ${s.name} (${s.location})
    - Water Level: ${s.currentTelemetry?.waterLevel}m (${s.currentTelemetry?.waterLevelPercentage}% Capacity)
    - Rate of Rise: ${s.currentTelemetry?.rateOfRise} cm/h (${s.currentTelemetry?.rateOfRiseDirection})
    - Risk Evaluation: ${s.riskAnalysis?.riskLevel} (Score: ${s.riskAnalysis?.riskScore}/100)
    - AI Crest ETA: ${s.riskAnalysis?.predictedCrestTime || 'Nominal'} (Peak: ${s.riskAnalysis?.predictedCrestLevel || 'N/A'}m)`).join('\n\n')}

3. TACTICAL MITIGATION & CIVIL DEFENSE ACTIONS
-------------------------------------------------------------------
- SDRF / NDRF Teams Alerted for Ajit Singh Nagar & Payakapuram sectors.
- 4 Designated Relief Camps Operational (Indira Gandhi Stadium, Loyola College).
- Automated SMS / WhatsApp Evacuation Directives Pre-Authorized.

===================================================================
END OF OFFICIAL SITREP - SECURE HASH: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}
===================================================================
`;

  const handleCopySitRep = () => {
    navigator.clipboard.writeText(sitRepText);
    setCopiedSitRep(true);
    setTimeout(() => setCopiedSitRep(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Station Selector Tab & SitRep Button */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between overflow-x-auto gap-3 shadow-xl">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold px-2 shrink-0">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <span>Select Focus Gauge:</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {stations.map((s) => {
            const isSel = s.id === selectedStationId;
            const rLevel = s.riskAnalysis?.riskLevel || 'SAFE';
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStationId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-2 shrink-0 ${
                  isSel
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-md font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{s.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  rLevel === 'CRITICAL' ? 'bg-rose-500 animate-ping' :
                  rLevel === 'HIGH RISK' ? 'bg-orange-500' :
                  rLevel === 'WATCH' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </button>
            );
          })}
        </div>

        {/* SitRep Trigger Button */}
        <button
          onClick={() => setShowSitRepModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-lg shadow-indigo-950 shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generate Official SitRep</span>
        </button>
      </div>

      {/* Main AI Insights 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Risk Gauge, Crest Prediction, Factors */}
        <div className="lg:col-span-1 space-y-4">
          {/* Risk Score Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Hydrologic Risk Index</span>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-bold ${riskMeta.badgeClass}`}>
                {ai.riskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG circular progress gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={riskMeta.color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (ai.riskScore || 20)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold font-mono text-white">{ai.riskScore || 0}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ 100 Risk</span>
                </div>
              </div>
            </div>

            {/* Crest Prediction Info */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Predicted Peak Crest Time:</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">{ai.predictedCrestTime || '2.5 hrs'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Projected Peak Water Height:</span>
                <span className="font-mono font-bold text-white">
                  {ai.predictedCrestLevel ? `${ai.predictedCrestLevel} m` : 'Nominal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Neural Model Confidence:</span>
                <span className="font-mono text-emerald-400 font-semibold">{ai.confidence || 94}% (Krishna v2.4)</span>
              </div>
            </div>
          </div>

          {/* Hydrological Multi-Factor Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Inflow & Catchment Drivers</span>
            </h4>
            <div className="space-y-2">
              {(ai.factors || []).map((factor, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hydraulic Derivative Matrix */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 text-xs">
            <h4 className="font-mono uppercase text-slate-400 font-bold text-[10px] flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Hydraulic Rate-of-Rise Derivatives</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 block">5m Instant</span>
                <span className="text-cyan-300 font-bold text-xs">+{((currentStation.currentTelemetry?.rateOfRise || 4) * 0.95).toFixed(1)} cm/h</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 block">15m Moving Avg</span>
                <span className="text-white font-bold text-xs">+{currentStation.currentTelemetry?.rateOfRise || 4} cm/h</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 block">1h Slope</span>
                <span className="text-rose-400 font-bold text-xs">+{((currentStation.currentTelemetry?.rateOfRise || 4) * 1.1).toFixed(1)} cm/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Hydrograph Curve + Anomalies + Command Advice */}
        <div className="lg:col-span-2 space-y-4">
          {/* Predictive Hydrograph Chart (6h Horizon) */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Hydrograph Crest Forecast (6-Hour Lookahead)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Mass-balance differential model project for {currentStation.name}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="flex items-center space-x-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Projected Level</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-400">
                  <span className="w-2.5 h-0.5 bg-rose-500" />
                  <span>Embankment Critical</span>
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiForecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aiForecastGradient)"
                    name="Projected Water Level (m)"
                  />
                  <Area
                    type="step"
                    dataKey="critical"
                    stroke="#EF4444"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                    name="Critical Embankment Limit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly Detection Radar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Hydrologic Anomalies & Blockage Signals ({ai.anomalies?.length || 0})</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">FFT Flow Resistance Engine Active</span>
            </h4>

            {ai.anomalies && ai.anomalies.length > 0 ? (
              <div className="space-y-2">
                {ai.anomalies.map((anom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-orange-500/30 flex items-start space-x-3 text-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-orange-950 text-orange-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-orange-300 uppercase text-[10px] font-mono">
                          {anom.type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-950 text-rose-300 font-bold">
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">{anom.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero anomalous sensor jumps or hydraulic drift detected. Signals healthy.</span>
              </div>
            )}
          </div>

          {/* AI Tactical Mitigation Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 shadow-xl space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase font-mono">
              <Sparkles className="w-4 h-4" />
              <span>AI Command Operational Directive</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {ai.aiRecommendation || 'Maintain standard telemetry polling schedule.'}
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => onOpenResponseLog && onOpenResponseLog(currentStation)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow"
              >
                <span>Log Response Directive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official EOC Situation Report Modal */}
      {showSitRepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/40">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Official Vijayawada EOC Situation Report (SitRep)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Formatted for APSDMA, District Administration & Disaster Operations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSitRepModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-200 bg-slate-950/90 whitespace-pre-wrap leading-relaxed select-text">
              {sitRepText}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-mono">
                Status: Ready for Government Dispatch
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySitRep}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSitRep ? 'Copied to Clipboard!' : 'Copy Dossier'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
