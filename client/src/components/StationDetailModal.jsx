import React from 'react';
import { 
  X, 
  MapPin, 
  Gauge, 
  TrendingUp, 
  CloudRain, 
  Waves, 
  Cpu, 
  ShieldAlert, 
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { RISK_LEVELS, STATION_TYPES } from '../utils/constants';
import { formatWaterLevel, formatRateOfRise, formatRainfall, formatFlow, formatDateFull } from '../utils/formatters';

export const StationDetailModal = ({ station, onClose, onOpenResponseLog }) => {
  if (!station) return null;

  const riskLevel = station.riskAnalysis?.riskLevel || 'SAFE';
  const riskMeta = RISK_LEVELS[riskLevel.replace(' ', '_')] || RISK_LEVELS.SAFE;
  const cur = station.currentTelemetry || {};
  const dev = station.deviceHealth || {};
  const ai = station.riskAnalysis || {};
  const th = station.dangerThresholds || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
              {station.code}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-100">{station.name}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${riskMeta.badgeClass}`}>
                  {riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{station.location} (Lat: {station.coordinates?.lat}, Lng: {station.coordinates?.lng})</span>
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Hydrological Danger Thresholds Matrix */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400 uppercase font-bold text-[11px] flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Channel Capacity & Danger Threshold Profile</span>
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {cur.waterLevelPercentage}% Max Channel Volume
              </span>
            </div>

            {/* Threshold scale bar */}
            <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, cur.waterLevelPercentage || 20)}%`,
                  backgroundColor: riskMeta.color
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono pt-1">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 block font-bold">Safe Freeboard</span>
                <span className="text-slate-300">{th.safe?.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-amber-400 block font-bold">Watch Advisory</span>
                <span className="text-slate-300">{th.warning?.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-orange-400 block font-bold">High Risk</span>
                <span className="text-slate-300">{th.highRisk?.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-rose-400 block font-bold">Critical Crest</span>
                <span className="text-slate-300">{th.critical?.toFixed(2)} m</span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Live Water Elevation</span>
              <div className="text-xl font-extrabold font-mono text-cyan-300">
                {formatWaterLevel(cur.waterLevel)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Elevation: {station.elevation}m ASL</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Rate of Rise & Trend</span>
              <div className={`text-xl font-extrabold font-mono ${cur.rateOfRise > 10 ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatRateOfRise(cur.rateOfRise)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Trend: {cur.rateOfRiseDirection}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Storm Precipitation</span>
              <div className="text-xl font-extrabold font-mono text-sky-300">
                {formatRainfall(cur.rainfallIntensity)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">24h Total: {cur.rainfall24h} mm</span>
            </div>
          </div>

          {/* AI Hydrology & Anomaly Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <h4 className="font-mono text-slate-400 uppercase font-bold text-[11px] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>AI Hydrological Intelligence & Mitigation Model</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Predicted Crest Window:</span>
                <span className="font-mono font-bold text-cyan-300 text-xs">{ai.predictedCrestTime || 'Stable'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Model Confidence:</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">{ai.confidence || 92}% (Hydrology v2.1)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">AI Mitigation Directive</span>
              <p className="text-slate-200 text-xs leading-relaxed">{ai.aiRecommendation}</p>
            </div>
          </div>

          {/* IoT Node Telemetry specs */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-mono text-slate-400 uppercase font-bold text-[10px]">Hardware Node Telemetry</span>
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
              <div>Gateway: <strong className="text-cyan-300">{dev.gatewayId}</strong></div>
              <div>Battery: <strong className="text-emerald-400">{dev.batteryPercentage}%</strong></div>
              <div>Solar: <strong className="text-amber-300">{dev.solarVoltage}V</strong></div>
              <div>Signal: <strong className="text-cyan-300">{dev.signalRssi} dBm</strong></div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800"
          >
            Close Inspector
          </button>
          <button
            onClick={() => {
              onClose();
              if (onOpenResponseLog) onOpenResponseLog(station);
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-900/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Response Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
