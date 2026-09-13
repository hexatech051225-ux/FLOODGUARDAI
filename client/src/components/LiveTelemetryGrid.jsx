import React, { useState } from 'react';
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  CloudRain, 
  Waves, 
  Battery, 
  Radio, 
  Sun, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { RISK_LEVELS, STATION_TYPES } from '../utils/constants';
import { formatWaterLevel, formatRateOfRise, formatRainfall, formatFlow } from '../utils/formatters';

export const LiveTelemetryGrid = ({ onOpenStationDetail, onOpenResponseLog }) => {
  const { stations } = useFloodData();
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter(station => {
    const matchesRisk = filterRisk === 'ALL' || station.riskAnalysis?.riskLevel === filterRisk;
    const matchesType = filterType === 'ALL' || station.type === filterType;
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesType && matchesSearch;
  });

  const getRateIcon = (direction) => {
    switch (direction) {
      case 'rising_fast':
        return <Zap className="w-4 h-4 text-rose-400 animate-bounce" />;
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'stable':
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stations, culverts, basins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Risk Level Pills */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH RISK', 'WATCH', 'SAFE'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className={`px-2.5 py-1 rounded-lg font-medium transition text-[11px] ${
                  filterRisk === lvl
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Station Type Selector */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Station Types</option>
            <option value="RIVER">River Basins</option>
            <option value="DRAIN">Storm Culverts</option>
            <option value="CANAL">Canals</option>
            <option value="UNDERPASS">Underpasses</option>
            <option value="ESTUARY">Estuaries</option>
          </select>
        </div>
      </div>

      {/* Grid of Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStations.map((station) => {
          const riskLevel = station.riskAnalysis?.riskLevel || 'SAFE';
          const riskMeta = RISK_LEVELS[riskLevel.replace(' ', '_')] || RISK_LEVELS.SAFE;
          const waterLevel = station.currentTelemetry?.waterLevel || 0;
          const capacityPct = station.currentTelemetry?.waterLevelPercentage || 0;
          const criticalThreshold = station.dangerThresholds?.critical || 4.5;
          const warningThreshold = station.dangerThresholds?.warning || 2.5;

          return (
            <div
              key={station.id}
              className={`rounded-2xl border bg-gradient-to-b from-slate-900/90 to-slate-950 p-4 transition-all duration-300 relative overflow-hidden shadow-xl flex flex-col justify-between ${
                riskLevel === 'CRITICAL'
                  ? 'border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/30'
                  : riskLevel === 'HIGH RISK'
                  ? 'border-orange-500/40 shadow-orange-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Bar */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                        {station.code}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {station.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 mt-1.5 line-clamp-1">{station.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{station.location}</p>
                  </div>

                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${riskMeta.badgeClass}`}>
                    {riskLevel}
                  </span>
                </div>

                {/* Primary Water Level Gauge Bar */}
                <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Current Water Level</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-extrabold font-mono text-white">
                        {formatWaterLevel(waterLevel)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {criticalThreshold.toFixed(2)}m crit
                      </span>
                    </div>
                  </div>

                  {/* Water level fill bar */}
                  <div className="mt-2 w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, capacityPct)}%`,
                        backgroundColor: riskMeta.color
                      }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{capacityPct.toFixed(1)}% Capacity</span>
                    <span>Elevation: {station.elevation}m ASL</span>
                  </div>
                </div>

                {/* Secondary Hydrological Telemetry 3-col */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  {/* Rate of Rise */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Rate of Rise</span>
                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                      {getRateIcon(station.currentTelemetry?.rateOfRiseDirection)}
                      <span className={`text-xs font-mono font-bold ${
                        station.currentTelemetry?.rateOfRise > 10 ? 'text-rose-400' : 'text-slate-200'
                      }`}>
                        {formatRateOfRise(station.currentTelemetry?.rateOfRise)}
                      </span>
                    </div>
                  </div>

                  {/* Rainfall */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Precipitation</span>
                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                      <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs font-mono font-bold text-sky-300">
                        {formatRainfall(station.currentTelemetry?.rainfallIntensity)}
                      </span>
                    </div>
                  </div>

                  {/* Flow Velocity */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Flow Discharge</span>
                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                      <Waves className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        {station.currentTelemetry?.flowVelocity?.toFixed(1)} m/s
                      </span>
                    </div>
                  </div>
                </div>

                {/* IoT Hardware Health Status strip */}
                <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/40 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-400 font-mono text-[10px]">ESP32: {station.deviceHealth?.esp32Status || 'ONLINE'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 text-[10px] font-mono">
                    <span className="flex items-center space-x-1">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      <span>{station.deviceHealth?.batteryPercentage || 90}%</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <span>{station.deviceHealth?.signalRssi || -68} dBm</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                <button
                  onClick={() => onOpenStationDetail && onOpenStationDetail(station)}
                  className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-medium py-1.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Hydrograph Analytics</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onOpenResponseLog && onOpenResponseLog(station)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-1.5 px-3 rounded-xl text-xs border border-slate-700 transition"
                >
                  Log Action
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
