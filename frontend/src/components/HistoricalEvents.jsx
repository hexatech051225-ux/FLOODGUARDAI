import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Printer, 
  FileText, 
  ShieldAlert, 
  Waves, 
  CloudRain, 
  CheckCircle2, 
  Users,
  Search
} from 'lucide-react';
import { historicalEvents } from '../services/seedData.js';
import { useFloodData } from '../context/FloodDataContext';
import { formatDateFull } from '../utils/formatters';

export const HistoricalEvents = () => {
  const { responseLogs } = useFloodData();
  const [activeSubTab, setActiveSubTab] = useState('EVENTS'); // 'EVENTS' | 'LOGS'
  const [searchLog, setSearchLog] = useState('');

  const filteredLogs = responseLogs.filter(log => 
    log.stationName?.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.actionTitle?.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.operator?.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.id?.toLowerCase().includes(searchLog.toLowerCase())
  );

  const exportJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      reportTitle: "FloodGuard AI Vijayawada Incident & Event Report",
      exportedAt: new Date().toISOString(),
      historicalEvents,
      responseLogs
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `floodguard-incident-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Export Buttons */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-100">Historical Flood Archive & Audit Logs</h2>
            <p className="text-xs text-slate-400">Past disaster records, peak hydrographs & municipal audit logs</p>
          </div>
        </div>

        {/* Sub-tab & Export triggers */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('EVENTS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeSubTab === 'EVENTS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Past Major Events ({historicalEvents.length})
            </button>
            <button
              onClick={() => setActiveSubTab('LOGS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeSubTab === 'LOGS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Action Audit Logs ({responseLogs.length})
            </button>
          </div>

          <button
            onClick={exportJsonReport}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 transition"
            title="Export JSON Data Report"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition shadow"
            title="Print EOC Incident Dossier"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'EVENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historicalEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                    {evt.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                    {evt.maxRiskLevel}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-100 mt-2">{evt.title}</h3>
                <p className="text-xs text-slate-400 font-mono">{evt.date}</p>

                {/* Key event statistics */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Peak 24h Rain</span>
                    <span className="font-mono font-bold text-sky-300">{evt.peakRainfall24h} mm</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Peak Water Level</span>
                    <span className="font-mono font-bold text-cyan-300">{evt.peakWaterLevel} m</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Sandbags Deployed</span>
                    <span className="font-mono font-bold text-amber-300">{evt.sandbagsDeployed} units</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Avg Response Time</span>
                    <span className="font-mono font-bold text-emerald-400">{evt.responseTimeAvgMin} mins</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Mitigation Outcome</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{evt.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Action Audit Log Table */
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit action logs..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">Action Order</th>
                  <th className="p-3">Assigned Unit</th>
                  <th className="p-3">Dispatching Officer</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-cyan-300 font-bold">{log.id}</td>
                    <td className="p-3 text-slate-300">{log.stationName}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{log.actionTitle}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{log.details}</div>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{log.team}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{log.operator}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{formatDateFull(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
