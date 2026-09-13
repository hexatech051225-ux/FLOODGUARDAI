import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Waves, 
  CloudRain, 
  Maximize2, 
  Activity, 
  Filter,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceLine 
} from 'recharts';
import { useFloodData } from '../context/FloodDataContext';
import { formatWaterLevel, formatRateOfRise, formatRainfall, formatTimestamp } from '../utils/formatters';

export const HistoricalCharts = () => {
  const { stations, getStationHistory } = useFloodData();
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || 'ST-001');
  const [timeRange, setTimeRange] = useState('24H'); // '24H' | '7D' | '30D'
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getStationHistory(selectedStationId).then((data) => {
      if (isMounted) {
        // Format timestamps for chart axis
        const formatted = (data || []).map((item, idx) => {
          const dt = new Date(item.timestamp);
          return {
            ...item,
            displayTime: `${dt.getHours()}:00`,
            criticalThreshold: selectedStation?.dangerThresholds?.critical || 4.5,
            warningThreshold: selectedStation?.dangerThresholds?.warning || 2.5
          };
        });
        setHistoryData(formatted);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedStationId, timeRange, selectedStation]);

  // Compute statistical peaks
  let peakWater = 0;
  let peakRain = 0;
  let avgDischarge = 0;

  historyData.forEach(d => {
    if (d.waterLevel > peakWater) peakWater = d.waterLevel;
    if (d.rainfallIntensity > peakRain) peakRain = d.rainfallIntensity;
    avgDischarge += (d.drainageDischarge || 0);
  });
  if (historyData.length > 0) {
    avgDischarge = Number((avgDischarge / historyData.length).toFixed(1));
  }

  return (
    <div className="space-y-4">
      {/* Top Station Selector & Range Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-100">Historical Hydrological Trends</h2>
            <p className="text-xs text-slate-400">Multi-parameter hydrograph, precipitation and flow correlation</p>
          </div>
        </div>

        {/* Station Picker & Range Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-semibold"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['24H', '7D', '30D'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition text-xs ${
                  timeRange === range
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Peak Hydrograph Crest:</span>
          <span className="font-mono font-extrabold text-cyan-300 text-sm">
            {formatWaterLevel(peakWater)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Peak Storm Precipitation:</span>
          <span className="font-mono font-extrabold text-sky-300 text-sm">
            {formatRainfall(peakRain)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Avg Channel Flow Discharge:</span>
          <span className="font-mono font-extrabold text-indigo-300 text-sm">
            {avgDischarge} m³/s
          </span>
        </div>
      </div>

      {/* Main Composite Chart */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">
              {selectedStation?.name} — Hydrograph vs Precipitation vs Discharge
            </h3>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" stroke="#06B6D4" tick={{ fontSize: 11, fill: '#38bdf8' }} unit="m" />
              <YAxis yAxisId="right" orientation="right" stroke="#38BDF8" tick={{ fontSize: 11, fill: '#38BDF8' }} unit="mm/h" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <ReferenceLine yAxisId="left" y={selectedStation?.dangerThresholds?.critical} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#EF4444', fontSize: 10 }} />
              <ReferenceLine yAxisId="left" y={selectedStation?.dangerThresholds?.warning} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Warning', fill: '#F59E0B', fontSize: 10 }} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="waterLevel"
                fill="url(#waterLevelGrad)"
                stroke="#06B6D4"
                strokeWidth={2.5}
                name="Water Level (m)"
              />
              <Bar
                yAxisId="right"
                dataKey="rainfallIntensity"
                fill="#38BDF8"
                opacity={0.45}
                name="Precipitation (mm/h)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="flowVelocity"
                stroke="#A78BFA"
                strokeWidth={2}
                dot={false}
                name="Flow Velocity (m/s)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
