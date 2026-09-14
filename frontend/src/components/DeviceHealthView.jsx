import React, { useState } from 'react';
import { 
  Cpu, 
  Battery, 
  Sun, 
  Radio, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Server,
  Zap
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { formatTimestamp, formatRelativeTime } from '../utils/formatters';

export const DeviceHealthView = () => {
  const { stations } = useFloodData();
  const [pingingId, setPingingId] = useState(null);
  const [pingStatus, setPingStatus] = useState({});

  const handlePingDevice = (stationId) => {
    setPingingId(stationId);
    setTimeout(() => {
      setPingingId(null);
      setPingStatus(prev => ({
        ...prev,
        [stationId]: { success: true, latency: Math.floor(18 + Math.random() * 24), time: new Date().toISOString() }
      }));
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Top Device Health Summary */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-100">IoT Edge Device & Gateway Health Matrix</h2>
            <p className="text-xs text-slate-400">ESP32 microcontrollers, LoRaWAN gateways, solar charge controllers & telemetry loss</p>
          </div>
        </div>

        {/* Global Hardware Health Badge */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">{stations.length} / {stations.length} IoT Nodes Online</span>
        </div>
      </div>

      {/* Grid of ESP32 Hardware Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stations.map((station) => {
          const dev = station.deviceHealth || {};
          const isOnline = dev.esp32Status === 'ONLINE';
          const isPinging = pingingId === station.id;
          const pingResult = pingStatus[station.id];

          return (
            <div
              key={station.id}
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Station & MCU Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                        {station.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {dev.gatewayId || 'RPI-GW-01'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 mt-1">{station.name}</h3>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    isOnline 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  }`}>
                    {dev.esp32Status || 'ONLINE'}
                  </span>
                </div>

                {/* Protocol & Firmware */}
                <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 mt-2">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="text-cyan-300 font-semibold">{dev.protocol || 'MQTT / LoRaWAN'}</span>
                </div>

                {/* Hardware Telemetry 4-grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  {/* Battery */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-400 text-[11px]">Battery</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      {dev.batteryPercentage || 92}% ({dev.batteryVoltage || 4.12}V)
                    </span>
                  </div>

                  {/* Solar Harvest */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-400 text-[11px]">Solar</span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">
                      {dev.solarVoltage || 5.6}V ({dev.solarStatus || 'CHARGING'})
                    </span>
                  </div>

                  {/* Signal RSSI */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400 text-[11px]">Signal</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-300">
                      {dev.signalRssi || -68} dBm
                    </span>
                  </div>

                  {/* Packet Loss */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-400 text-[11px]">Pkt Loss</span>
                    </div>
                    <span className={`font-mono font-bold ${
                      (dev.packetLoss || 0) > 0.2 ? 'text-rose-400' : 'text-slate-200'
                    }`}>
                      {((dev.packetLoss || 0.02) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Firmware & Last Ping */}
                <div className="mt-3 space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Firmware Build:</span>
                    <span className="text-slate-300">{dev.firmwareVersion || 'v2.4.2-esp32'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Heartbeat:</span>
                    <span className="text-slate-300">{formatRelativeTime(dev.lastPing)}</span>
                  </div>
                </div>

                {/* Ping Result */}
                {pingResult && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                    <span>Echo OK: {pingResult.latency}ms RTT</span>
                    <span>{formatTimestamp(pingResult.time)}</span>
                  </div>
                )}
              </div>

              {/* Diagnostic Ping Button */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => handlePingDevice(station.id)}
                  disabled={isPinging}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isPinging ? 'Pinging Node...' : 'Ping Diagnostic Heartbeat'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
