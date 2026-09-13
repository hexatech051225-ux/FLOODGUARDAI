import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  CloudRain, 
  AlertTriangle, 
  Gauge, 
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  CheckCircle2
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { RISK_LEVELS } from '../utils/constants';

export const OverviewCards = ({ setActiveTab }) => {
  const { stations, alerts } = useFloodData();

  // Computations
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const criticalStations = stations.filter(s => s.riskAnalysis?.riskLevel === 'CRITICAL');
  const highRiskStations = stations.filter(s => s.riskAnalysis?.riskLevel === 'HIGH RISK');
  
  let totalRisk = 0;
  let maxRateOfRise = -999;
  let maxRateStation = null;
  let peakRainfall = 0;
  let peakRainStation = null;
  let maxCapacityPct = 0;

  stations.forEach(station => {
    const score = station.riskAnalysis?.riskScore || 0;
    totalRisk += score;

    const ror = station.currentTelemetry?.rateOfRise || 0;
    if (ror > maxRateOfRise) {
      maxRateOfRise = ror;
      maxRateStation = station;
    }

    const rain = station.currentTelemetry?.rainfallIntensity || 0;
    if (rain > peakRainfall) {
      peakRainfall = rain;
      peakRainStation = station;
    }

    const pct = station.currentTelemetry?.waterLevelPercentage || 0;
    if (pct > maxCapacityPct) {
      maxCapacityPct = pct;
    }
  });

  const avgBasinRisk = Math.round(totalRisk / Math.max(1, stations.length));

  let riskCategory = RISK_LEVELS.SAFE;
  if (avgBasinRisk >= 75 || criticalStations.length > 0) riskCategory = RISK_LEVELS.CRITICAL;
  else if (avgBasinRisk >= 55 || highRiskStations.length > 0) riskCategory = RISK_LEVELS.HIGH_RISK;
  else if (avgBasinRisk >= 35) riskCategory = RISK_LEVELS.WATCH;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Basin Risk Index */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden shadow-lg shadow-black/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Basin Risk Index</span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${riskCategory.badgeClass}`}>
            {riskCategory.label}
          </span>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">{avgBasinRisk}</span>
          <span className="text-xs text-slate-400 font-mono">/ 100 Score</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-700" 
            style={{ 
              width: `${avgBasinRisk}%`,
              backgroundColor: riskCategory.color 
            }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Max Capacity Saturation:</span>
          <span className="font-mono text-cyan-300 font-bold">{maxCapacityPct}%</span>
        </p>
      </div>

      {/* 2. Critical Surge Flashpoints */}
      <div 
        onClick={() => setActiveTab('alerts')}
        className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition relative overflow-hidden shadow-lg shadow-black/40 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Flashpoints</span>
          <div className={`p-1.5 rounded-lg ${criticalStations.length > 0 ? 'bg-rose-950/80 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-400">
            {criticalStations.length + highRiskStations.length}
          </span>
          <span className="text-xs text-slate-400">/ {stations.length} Monitored Stns</span>
        </div>

        <div className="mt-3 flex items-center space-x-2 text-[11px]">
          <span className="px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 font-mono font-bold">
            {criticalStations.length} Critical
          </span>
          <span className="px-1.5 py-0.5 rounded bg-orange-950/90 text-orange-300 font-mono font-bold">
            {highRiskStations.length} High Risk
          </span>
        </div>

        <p className="mt-2 text-[11px] text-cyan-400 group-hover:underline flex items-center justify-between">
          <span>Active Alerts Pending:</span>
          <span className="font-mono font-bold text-white">{activeAlerts.length}</span>
        </p>
      </div>

      {/* 3. Max Hydrograph Rate of Rise */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden shadow-lg shadow-black/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Rate of Rise</span>
          <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {maxRateOfRise > 0 ? `+${maxRateOfRise.toFixed(1)}` : maxRateOfRise.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">cm / hr</span>
        </div>

        <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-300 truncate">
          <span className="text-slate-400">At:</span>
          <span className="font-semibold text-cyan-300 truncate">{maxRateStation?.name || 'Basin Inflow'}</span>
        </div>

        <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Velocity:</span>
          <span className="font-mono text-white font-semibold">
            {maxRateStation?.currentTelemetry?.flowVelocity?.toFixed(2) || '0.00'} m/s
          </span>
        </p>
      </div>

      {/* 4. Peak Storm Intensity & Readiness */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden shadow-lg shadow-black/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Precipitation</span>
          <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-sky-300">
            {peakRainfall.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm / hr</span>
        </div>

        <div className="mt-3 flex items-center space-x-1 text-[11px] text-slate-300 truncate">
          <span className="text-slate-400">Location:</span>
          <span className="font-semibold text-sky-300 truncate">{peakRainStation?.name || 'Basin Catchment'}</span>
        </div>

        <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>24h Inundation Total:</span>
          <span className="font-mono text-emerald-400 font-bold">
            {peakRainStation?.currentTelemetry?.rainfall24h?.toFixed(1) || '0.0'} mm
          </span>
        </p>
      </div>
    </div>
  );
};
