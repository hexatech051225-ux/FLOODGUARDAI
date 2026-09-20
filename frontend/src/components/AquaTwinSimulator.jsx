import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Waves, 
  CloudRain, 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Download,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Legend 
} from 'recharts';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';

// Historical Crisis Simulation Presets
const CRISIS_PRESETS = [
  {
    id: 'NORMAL_BASELINE',
    name: 'Standard Monsoon Baseline',
    desc: 'Mild 18mm/h rainfall, 22 gates open, upstream inflow 120k cusecs.',
    rainfall: 18,
    gates: 22,
    upstreamInflow: 120000,
    siltation: 10,
    tidalSurcharge: 0.2
  },
  {
    id: 'SUPER_FLOOD_2024',
    name: '2024 Krishna Mega-Flood (11.43L Cusecs)',
    desc: 'Catastrophic historical peak with 70 gates fully open & massive upstream discharge.',
    rainfall: 125,
    gates: 70,
    upstreamInflow: 1143000,
    siltation: 35,
    tidalSurcharge: 1.1
  },
  {
    id: 'BUDAMERU_CLOUDBURST',
    name: 'Budameru Urban Flash Cloudburst',
    desc: 'Severe 150mm/h localized cloudburst with high drainage siltation.',
    rainfall: 150,
    gates: 45,
    upstreamInflow: 480000,
    siltation: 65,
    tidalSurcharge: 0.6
  },
  {
    id: 'GATE_JAM_CONTINGENCY',
    name: 'Prakasam Spillway Gate Jam (18 Gates Stuck)',
    desc: 'Critical mechanical failure: only 42 of 70 gates operable under high inflow.',
    rainfall: 95,
    gates: 42,
    upstreamInflow: 850000,
    siltation: 45,
    tidalSurcharge: 0.8
  }
];

export const AquaTwinSimulator = ({ onOpenEvacuationModal }) => {
  const { stations } = useFloodData();
  const { user } = useAuth();

  // Simulation Parameters
  const [rainfallIntensity, setRainfallIntensity] = useState(45); // mm/h
  const [barrageGates, setBarrageGates] = useState(48); // 0 to 70 gates
  const [upstreamInflow, setUpstreamInflow] = useState(380000); // cusecs (50,000 to 1,200,000)
  const [siltationPercent, setSiltationPercent] = useState(25); // 0 to 80%
  const [tidalSurcharge, setTidalSurcharge] = useState(0.5); // 0 to 2.5 meters

  // Apply a preset
  const handleApplyPreset = (preset) => {
    setRainfallIntensity(preset.rainfall);
    setBarrageGates(preset.gates);
    setUpstreamInflow(preset.upstreamInflow);
    setSiltationPercent(preset.siltation);
    setTidalSurcharge(preset.tidalSurcharge);
  };

  // Reset to default
  const handleReset = () => {
    handleApplyPreset(CRISIS_PRESETS[0]);
  };

  // Hydrological Digital Twin Calculations (Manning's open channel & storage routing approximation)
  const simulationResults = useMemo(() => {
    // 1. Barrage Outflow capacity: ~17,000 cusecs per gate at full design head
    const gateDischargeCapacity = barrageGates * 16800; // cusecs
    const netCusecsBalance = upstreamInflow + (rainfallIntensity * 4500) - gateDischargeCapacity;

    // 2. Prakasam Barrage Water Level (Baseline 2.2m)
    const baseBarrageLevel = 2.2;
    const inflowPressureCoeff = (upstreamInflow / 1200000) * 2.8;
    const gateRelief = (barrageGates / 70) * 2.1;
    const rainFactor = (rainfallIntensity / 180) * 1.5;
    const computedBarrageLevel = Math.max(
      1.5,
      Number((baseBarrageLevel + inflowPressureCoeff - gateRelief + rainFactor + (tidalSurcharge * 0.3)).toFixed(2))
    );

    // 3. Budameru Diversion Channel Level (Threshold 2.9m critical)
    const baseBudameru = 1.4;
    const localRunoff = (rainfallIntensity / 150) * 1.8;
    const siltationBackpressure = (siltationPercent / 100) * 1.2;
    const barrageBackwater = computedBarrageLevel > 4.2 ? (computedBarrageLevel - 4.2) * 0.45 : 0;
    const computedBudameruLevel = Number((baseBudameru + localRunoff + siltationBackpressure + barrageBackwater).toFixed(2));

    // 4. Inundation Area (sq km)
    let inundationAreaKm2 = 0;
    if (computedBudameruLevel > 2.8) {
      inundationAreaKm2 += (computedBudameruLevel - 2.8) * 14.5;
    }
    if (computedBarrageLevel > 4.6) {
      inundationAreaKm2 += (computedBarrageLevel - 4.6) * 18.2;
    }
    inundationAreaKm2 = Number(Math.min(78, Math.max(0, inundationAreaKm2)).toFixed(1));

    // 5. Population at risk & buildings impacted
    const populationAtRisk = Math.round(inundationAreaKm2 * 6800);
    const buildingsVulnerable = Math.round(inundationAreaKm2 * 850);

    // 6. Breach Probability (0 - 100%)
    let breachScore = 0;
    if (computedBudameruLevel >= 3.2) breachScore += 55;
    else if (computedBudameruLevel >= 2.9) breachScore += 40;
    else if (computedBudameruLevel >= 2.4) breachScore += 20;

    if (computedBarrageLevel >= 5.2) breachScore += 45;
    else if (computedBarrageLevel >= 4.6) breachScore += 30;
    else if (computedBarrageLevel >= 4.0) breachScore += 15;

    breachScore = Math.min(99, Math.max(3, breachScore));

    // 7. Evacuation Window ETA
    let evacuationEtaMinutes = 'No Imminent Threat (>12h)';
    if (breachScore >= 80) {
      const minutes = Math.max(20, Math.round(180 - (rainfallIntensity * 0.8) - (siltationPercent * 0.5)));
      evacuationEtaMinutes = `${minutes} Minutes`;
    } else if (breachScore >= 50) {
      const hours = (3.5 - (rainfallIntensity / 100)).toFixed(1);
      evacuationEtaMinutes = `${hours} Hours`;
    }

    // 8. Generate 12-Hour Hydrograph Curve
    const hydrograph = Array.from({ length: 13 }).map((_, hour) => {
      const t = hour / 12;
      // Bell-shaped hydrograph surge curve peaking around hour 4-6
      const surgePeak = Math.sin(t * Math.PI) * (rainfallIntensity / 50) * 0.8;
      const barrageCurve = Number((computedBarrageLevel + surgePeak * 0.5 - (hour > 6 ? (hour - 6) * 0.05 : 0)).toFixed(2));
      const budameruCurve = Number((computedBudameruLevel + surgePeak * 0.7 - (hour > 7 ? (hour - 7) * 0.08 : 0)).toFixed(2));

      return {
        hour: `+${hour}h`,
        barrageWaterLevel: Math.max(1.2, barrageCurve),
        budameruWaterLevel: Math.max(1.0, budameruCurve),
        barrageDangerLimit: 4.8,
        budameruDangerLimit: 2.9
      };
    });

    // 9. AI Tactical Recommendation based on Digital Twin calculations
    let recommendation = 'Maintain standard operational discharge.';
    if (breachScore >= 75) {
      recommendation = `CRITICAL: Surcharge rate unsustainable. Immediate action required: Open ${Math.min(70, barrageGates + 14)} spillway gates to release downstream backpressure. Pre-dispatch SDRF evacuation units to Ajit Singh Nagar & Krishnalanka.`;
    } else if (breachScore >= 45) {
      recommendation = `HIGH ADVISORY: Approaching bank-full stage. Recommend opening 6 additional barrage gates and staging emergency dewatering pumps at low-lying culverts.`;
    } else {
      recommendation = `NOMINAL: Discharge capacity safely buffers current precipitation and upstream inflow. All channels within hydraulic freeboard margins.`;
    }

    return {
      computedBarrageLevel,
      computedBudameruLevel,
      inundationAreaKm2,
      populationAtRisk,
      buildingsVulnerable,
      breachScore,
      evacuationEtaMinutes,
      gateDischargeCapacity,
      netCusecsBalance,
      hydrograph,
      recommendation
    };
  }, [rainfallIntensity, barrageGates, upstreamInflow, siltationPercent, tidalSurcharge]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/40 text-slate-950 font-black">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                AquaTwinΓäó Hydrological Digital Twin
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                PHYSICS SANDBOX
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate hydrodynamic rainfall, upstream dam releases & barrage gate operations in real-time
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={handleReset}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={() => onOpenEvacuationModal && onOpenEvacuationModal()}
            className="bg-rose-950/90 hover:bg-rose-900 border border-rose-600/60 text-rose-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Broadcast Directive</span>
          </button>
        </div>
      </div>

      {/* Preset Crisis Scenarios (1-Click Load) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Historical & Contingency Disaster Presets</span>
          </span>
          <span className="text-[11px] text-slate-500">Click to instantly load hydro dynamic boundary conditions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CRISIS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-left transition group shadow-md"
            >
              <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 flex items-center justify-between">
                <span>{preset.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.desc}
              </p>
              <div className="mt-2.5 flex items-center space-x-2 text-[10px] font-mono text-cyan-400">
                <span>{preset.rainfall} mm/h</span>
                <span>ΓÇó</span>
                <span>{preset.gates}/70 Gates</span>
                <span>ΓÇó</span>
                <span>{(preset.upstreamInflow / 100000).toFixed(1)}L Cusecs</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Grid: Sliders on Left (5 Cols), Real-Time Digital Twin Telemetry & Curves on Right (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Hydraulic Boundary Controls</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">Real-Time Simulation</span>
          </div>

          {/* 1. Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Precipitation Intensity</span>
              </span>
              <span className="font-mono font-bold text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-800/60">
                {rainfallIntensity} mm/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={rainfallIntensity}
              onChange={(e) => setRainfallIntensity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Dry)</span>
              <span>40 (Heavy Storm)</span>
              <span>180 (Cloudburst)</span>
            </div>
          </div>

          {/* 2. Prakasam Barrage Gates Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Prakasam Barrage Open Gates</span>
              </span>
              <span className="font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                {barrageGates} / 70 Gates Open
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="1"
              value={barrageGates}
              onChange={(e) => setBarrageGates(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 Closed (Surcharge)</span>
              <span>35 Half Opening</span>
              <span>70 Max Discharge</span>
            </div>
          </div>

          {/* 3. Upstream Dam Surge Inflow */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Upstream Dam Surge Inflow (Pulichintala)</span>
              </span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/60">
                {(upstreamInflow / 1000).toLocaleString()}K Cusecs
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="1200000"
              step="25000"
              value={upstreamInflow}
              onChange={(e) => setUpstreamInflow(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>50K (Low)</span>
              <span>500K (High Hazard)</span>
              <span>1.2M (Extreme Flood)</span>
            </div>
          </div>

          {/* 4. Siltation / Culvert Obstruction Factor */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Drain Siltation & Debris Restriction</span>
              </span>
              <span className="font-mono font-bold text-orange-300 bg-orange-950/70 px-2 py-0.5 rounded border border-orange-800/60">
                {siltationPercent}% Flow Blockage
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={siltationPercent}
              onChange={(e) => setSiltationPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0% (Pristine Flow)</span>
              <span>40% (Water Hyacinth)</span>
              <span>80% (Severe Choke)</span>
            </div>
          </div>

          {/* 5. Coastal Tidal Surcharge */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-teal-400" />
                <span>Bay of Bengal Tidal Backwater</span>
              </span>
              <span className="font-mono font-bold text-teal-300 bg-teal-950/70 px-2 py-0.5 rounded border border-teal-800/60">
                +{tidalSurcharge.toFixed(1)} m High Tide
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={tidalSurcharge}
              onChange={(e) => setTidalSurcharge(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.0m (Neap Tide)</span>
              <span>1.2m (Spring Tide)</span>
              <span>2.5m (Storm Surge)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Results, Inundation Impact, and Hydrograph (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Impact Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Breach Probability */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                Breach Probability
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className={`text-2xl font-black font-mono ${
                  simulationResults.breachScore >= 75 ? 'text-rose-400' :
                  simulationResults.breachScore >= 45 ? 'text-orange-400' : 'text-emerald-400'
                }`}>
                  {simulationResults.breachScore}%
                </span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400">
                {simulationResults.breachScore >= 75 ? 'ΓÜá∩╕Å Overtopping Imminent' :
                 simulationResults.breachScore >= 45 ? 'ΓÜí High Hydraulic Stress' : 'Γ£à Nominal Safety Margin'}
              </div>
            </div>

            {/* 2. Inundation Area */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                Flooded Area
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-cyan-300">
                  {simulationResults.inundationAreaKm2}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">km┬▓</span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400">
                Urban basin coverage
              </div>
            </div>

            {/* 3. Population at Risk */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center space-x-1">
                <Users className="w-3 h-3 text-indigo-400" />
                <span>At-Risk Citizens</span>
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black font-mono text-indigo-300">
                  {simulationResults.populationAtRisk.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400">
                Across {simulationResults.buildingsVulnerable.toLocaleString()} buildings
              </div>
            </div>

            {/* 4. Evacuation ETA */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Evacuation Window</span>
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-lg font-bold font-mono text-amber-300">
                  {simulationResults.evacuationEtaMinutes}
                </span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400">
                Before key route cutoff
              </div>
            </div>
          </div>

          {/* 12-Hour Hydrograph Curve Chart */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Projected 12-Hour Hydrograph Crest Trajectory
                </h3>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Prakasam Barrage & Budameru Channel
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults.hydrograph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barrageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="budameruGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" domain={[0, 6]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={4.8} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Barrage Critical (4.8m)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                  <ReferenceLine y={2.9} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Budameru Critical (2.9m)', fill: '#F59E0B', fontSize: 10, position: 'insideTopLeft' }} />
                  <Area
                    type="monotone"
                    dataKey="barrageWaterLevel"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#barrageGrad)"
                    name="Prakasam Barrage Level (m)"
                  />
                  <Area
                    type="monotone"
                    dataKey="budameruWaterLevel"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#budameruGrad)"
                    name="Budameru Channel Level (m)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Tactical Directive Output */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/60 border border-cyan-500/40 shadow-xl space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Digital Twin AI Operational Advisory</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {simulationResults.recommendation}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Gate Outflow: <span className="text-cyan-300 font-bold">{(simulationResults.gateDischargeCapacity / 1000).toFixed(0)}K Cusecs</span>
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Simulated Net Basin Delta: <span className={simulationResults.netCusecsBalance > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {simulationResults.netCusecsBalance > 0 ? `+${(simulationResults.netCusecsBalance / 1000).toFixed(0)}K Cusecs Accumulation` : 'Freeboard Expanding'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
