import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';
import { AiRiskEngine } from '../services/aiRiskEngine';
import { useFloodData } from '../context/FloodDataContext';

export const MlTestcaseSuite = () => {
  const { stations } = useFloodData();
  const [selectedStationId, setSelectedStationId] = useState('ST-001');

  // Sandbox Custom Parameter Sliders
  const [waterLevel, setWaterLevel] = useState(3.45);
  const [rainfallIntensity, setRainfallIntensity] = useState(35.0);
  const [flowVelocity, setFlowVelocity] = useState(2.4);
  const [rateOfRise, setRateOfRise] = useState(6.5);
  const [customFactorText, setCustomFactorText] = useState('Upstream dam discharge elevated');

  // Selected Preset Testcase
  const [activeTestcaseId, setActiveTestcaseId] = useState(null);

  const testcases = [
    {
      id: 'TC-001',
      title: '⚡ Cloudburst Flash Surge Test',
      category: 'FLASH FLOOD',
      description: 'Simulates extreme downpour (85mm/h) combined with rapid channel rise (+12cm/h).',
      waterLevel: 4.65,
      rainfallIntensity: 85.0,
      flowVelocity: 3.8,
      rateOfRise: 12.0,
      expectedLevel: 'CRITICAL',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-600/50'
    },
    {
      id: 'TC-002',
      title: '⚠️ Debris Restriction Anomaly Test',
      category: 'ANOMALY DETECTOR',
      description: 'Simulates rising water level despite dropping flow velocity, indicating culvert clogging.',
      waterLevel: 3.80,
      rainfallIntensity: 25.0,
      flowVelocity: 0.6,
      rateOfRise: 7.5,
      expectedLevel: 'HIGH RISK',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600/50'
    },
    {
      id: 'TC-003',
      title: '📡 Sonar Noise & Sensor Drift Test',
      category: 'SENSOR FAULT',
      description: 'Tests ML Z-score filter against ultrasonic sonar drift and packet loss.',
      waterLevel: 2.10,
      rainfallIntensity: 5.0,
      flowVelocity: 1.2,
      rateOfRise: 0.5,
      expectedLevel: 'WATCH',
      badgeColor: 'bg-yellow-950 text-yellow-300 border-yellow-600/50'
    },
    {
      id: 'TC-004',
      title: '🌈 Spillway Discharge Recovery Test',
      category: 'RECOVERY',
      description: 'Tests gravity drainage discharge and risk score reduction after gate opening.',
      waterLevel: 1.95,
      rainfallIntensity: 2.0,
      flowVelocity: 1.8,
      rateOfRise: -4.5,
      expectedLevel: 'SAFE',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
    }
  ];

  const applyTestcase = (tc) => {
    setActiveTestcaseId(tc.id);
    setWaterLevel(tc.waterLevel);
    setRainfallIntensity(tc.rainfallIntensity);
    setFlowVelocity(tc.flowVelocity);
    setRateOfRise(tc.rateOfRise);
  };

  const station = stations.find(s => s.id === selectedStationId) || stations[0];

  // Run ML Risk Evaluation Engine dynamically on custom sandbox parameters
  const simulatedStation = {
    ...station,
    currentTelemetry: {
      ...station.currentTelemetry,
      waterLevel: Number(waterLevel),
      rainfallIntensity: Number(rainfallIntensity),
      flowVelocity: Number(flowVelocity),
      rateOfRise: Number(rateOfRise)
    }
  };

  // Generate synthetic history for 5-point derivative
  const syntheticHistory = Array.from({ length: 5 }).map((_, i) => ({
    waterLevel: Math.max(0.2, Number((waterLevel - (5 - i) * (rateOfRise / 100)).toFixed(2))),
    rainfallIntensity: Number(rainfallIntensity),
    flowVelocity: Number(flowVelocity)
  }));

  const mlResult = AiRiskEngine.analyzeStationRisk(simulatedStation, syntheticHistory);

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-950/90 border-rose-500/50 shadow-rose-950';
      case 'HIGH RISK': return 'text-amber-400 bg-amber-950/90 border-amber-500/50 shadow-amber-950';
      case 'WATCH': return 'text-yellow-400 bg-yellow-950/90 border-yellow-500/50 shadow-yellow-950';
      default: return 'text-emerald-400 bg-emerald-950/90 border-emerald-500/50 shadow-emerald-950';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold flex items-center space-x-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>HYDROLOGICAL ML DIAGNOSTICS</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Machine Learning Test Cases & Model Validation Suite</span>
          </h1>
          <p className="text-xs text-slate-400">
            Validate 4-Parameter Risk Scoring, Rate-of-Rise Derivative Engine & Hydrograph Crest Prediction Models.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono outline-none focus:border-cyan-500"
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout: Left Pre-packaged Testcases, Right Interactive Sandbox & Model Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pre-packaged Testcases (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Pre-packaged ML Test Cases</span>
          </h2>

          <div className="space-y-3">
            {testcases.map((tc) => {
              const isSelected = activeTestcaseId === tc.id;
              return (
                <div
                  key={tc.id}
                  onClick={() => applyTestcase(tc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{tc.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${tc.badgeColor}`}>
                      {tc.expectedLevel}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-100 group-hover:text-cyan-300 transition">
                    {tc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{tc.description}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <span className="text-slate-400">Level: <strong className="text-slate-200">{tc.waterLevel}m</strong></span>
                    <span className="text-slate-400">Rain: <strong className="text-slate-200">{tc.rainfallIntensity}mm/h</strong></span>
                    <span className="text-slate-400">Rise: <strong className="text-slate-200">+{tc.rateOfRise}cm/h</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Custom ML Parameter Sandbox & Model Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Parameter Sandbox */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Interactive ML Sandbox Parameters</span>
              </h2>
              <button
                onClick={() => {
                  setActiveTestcaseId(null);
                  setWaterLevel(2.45);
                  setRainfallIntensity(12.5);
                  setFlowVelocity(1.6);
                  setRateOfRise(4.2);
                }}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Water Level Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Water Elevation Level</span>
                  <span className="text-cyan-400 font-bold">{waterLevel} m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.5"
                  step="0.05"
                  value={waterLevel}
                  onChange={(e) => {
                    setActiveTestcaseId(null);
                    setWaterLevel(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Rainfall Intensity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Rainfall Downpour Intensity</span>
                  <span className="text-blue-400 font-bold">{rainfallIntensity} mm/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={rainfallIntensity}
                  onChange={(e) => {
                    setActiveTestcaseId(null);
                    setRainfallIntensity(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                />
              </div>

              {/* Flow Velocity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Channel Flow Velocity</span>
                  <span className="text-emerald-400 font-bold">{flowVelocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={flowVelocity}
                  onChange={(e) => {
                    setActiveTestcaseId(null);
                    setFlowVelocity(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Rate of Rise Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">5-Minute Derivative Rate of Rise</span>
                  <span className="text-rose-400 font-bold">{rateOfRise > 0 ? `+${rateOfRise}` : rateOfRise} cm/h</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="25"
                  step="0.5"
                  value={rateOfRise}
                  onChange={(e) => {
                    setActiveTestcaseId(null);
                    setRateOfRise(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Real-time ML Evaluation Output Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>ML Model Inference Output</span>
              </h2>
              <span className={`px-3 py-1 rounded-full border text-xs font-extrabold font-mono ${getRiskColor(mlResult.riskLevel)}`}>
                {mlResult.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Risk Score</span>
                <div className="text-xl font-bold text-amber-400">{mlResult.riskScore} / 100</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Model Confidence</span>
                <div className="text-xl font-bold text-cyan-300">{mlResult.confidence}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400">Predicted Crest</span>
                <div className="text-sm font-bold text-slate-100">{mlResult.predictedCrestLevel}m @ {mlResult.predictedCrestTime}</div>
              </div>
            </div>

            {/* AI Risk Factors */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Identified Hydrological Factors:</span>
              <ul className="space-y-1 text-slate-300">
                {mlResult.factors.map((f, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Action Directive */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/60 text-xs flex items-start space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">Recommended Mitigation Directive:</span>
                <p className="text-slate-200 font-mono mt-0.5">{mlResult.aiRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MlTestcaseSuite;
