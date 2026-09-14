import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ScatterChart, 
  Scatter 
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Layers, Filter } from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';

export const AdvancedDataVisualizations = () => {
  const { stations } = useFloodData();
  const [selectedStationId, setSelectedStationId] = useState('ST-001');

  // Multi-station historical basin hydrograph overlay dataset (24h)
  const hydrographData = Array.from({ length: 24 }).map((_, i) => {
    const hour = `${i.toString().padStart(2, '0')}:00`;
    const st1 = Number((2.4 + Math.sin(i / 3) * 0.8 + (i > 14 ? 0.9 : 0)).toFixed(2));
    const st2 = Number((1.8 + Math.cos(i / 4) * 0.6 + (i > 12 ? 1.2 : 0)).toFixed(2));
    const st3 = Number((3.1 + Math.sin(i / 2) * 0.5 + (i > 15 ? 1.5 : 0)).toFixed(2));
    const st4 = Number((2.9 + Math.cos(i / 3) * 0.7).toFixed(2));
    const rain = Number((Math.max(0, Math.sin((i - 10) / 2) * 45)).toFixed(1));

    return {
      time: hour,
      "Ferry Ghat (ST-001)": st1,
      "Prakasam Barrage (ST-002)": st2,
      "Budameru Diversion (ST-003)": st3,
      "Guntur Canal (ST-004)": st4,
      rainfall: rain
    };
  });

  // Radar chart risk vector dataset
  const station = stations.find(s => s.id === selectedStationId) || stations[0];
  const radarData = [
    { subject: 'Water Elevation', score: Math.min(100, Math.round((station?.currentTelemetry?.waterLevel / 5.2) * 100)) },
    { subject: 'Rate of Rise', score: Math.min(100, Math.max(10, Math.round((station?.currentTelemetry?.rateOfRise || 4.2) * 10))) },
    { subject: 'Rainfall Downpour', score: Math.min(100, Math.round((station?.currentTelemetry?.rainfallIntensity / 80) * 100)) },
    { subject: 'Flow Velocity', score: Math.min(100, Math.round((station?.currentTelemetry?.flowVelocity / 4.0) * 100)) },
    { subject: 'Basin Saturation', score: Math.min(100, Math.round((station?.currentTelemetry?.rainfall24h / 150) * 100)) },
    { subject: 'Debris Anomaly', score: station?.riskAnalysis?.riskLevel === 'CRITICAL' ? 90 : 35 }
  ];

  // Scatter plot: Rainfall Intensity vs Flow Velocity Correlation
  const scatterData = hydrographData.map(d => ({
    rainfall: d.rainfall,
    flow: Number((1.2 + (d.rainfall / 15) + Math.random() * 0.4).toFixed(2)),
    level: d["Ferry Ghat (ST-001)"]
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 font-mono text-xs font-bold flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>ADVANCED ANALYTICS & PLOTS</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Hydrological Visualizations, Graphs & Correlations</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-station basin hydrographs, risk vector radar distributions, and discharge correlation scatter plots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono outline-none focus:border-blue-500"
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph 1: Multi-Station Basin Hydrograph Overlay (Full Width) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="font-extrabold text-slate-100 text-sm">🌊 24-Hour Multi-Station Hydrograph Comparison Plot</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Krishna River Basin Gauges</span>
        </div>

        <div className="h-[340px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hydrographData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 6]} unit="m" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="Ferry Ghat (ST-001)" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Prakasam Barrage (ST-002)" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Budameru Diversion (ST-003)" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Guntur Canal (ST-004)" stroke="#fbbf24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Radar Chart & Correlation Scatter Plot (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 2: Hydrological Risk Vector Radar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-slate-100 text-sm">🎯 6-Vector Risk Assessment Radar</h3>
            </div>
            <span className="text-xs font-mono text-amber-400">{station.name}</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Risk Index" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Rainfall vs Flow Velocity Correlation Scatter */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-slate-100 text-sm">📈 Rainfall vs. Flow Velocity Scatter Plot</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">Runoff Efficiency</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="rainfall" name="Rainfall" unit="mm/h" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="flow" name="Flow Velocity" unit="m/s" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Scatter name="Telemetry Points" data={scatterData} fill="#34d399" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDataVisualizations;
