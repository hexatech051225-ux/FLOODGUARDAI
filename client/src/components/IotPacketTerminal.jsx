import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Terminal, 
  Pause, 
  Play, 
  Trash2, 
  Send, 
  Radio, 
  Wifi, 
  Battery, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Activity
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import axios from 'axios';

export const IotPacketTerminal = () => {
  const { stations } = useFloodData();
  const [packets, setPackets] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterStation, setFilterStation] = useState('ALL');
  const [packetCount, setPacketCount] = useState(0);

  // Manual Ingest Form State
  const [manualStationId, setManualStationId] = useState(stations[0]?.id || 'ST-003');
  const [manualLevel, setManualLevel] = useState('3.12');
  const [manualRain, setManualRain] = useState('42.0');
  const [manualFlow, setManualFlow] = useState('3.8');
  const [ingestStatus, setIngestStatus] = useState(null);

  const logsEndRef = useRef(null);

  // Generate continuous synthetic incoming packet stream matching active station telemetry
  useEffect(() => {
    if (isPaused || stations.length === 0) return;

    const interval = setInterval(() => {
      const randomStation = stations[Math.floor(Math.random() * stations.length)];
      if (!randomStation) return;

      const hexPayload = `0x${Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0')} ` +
                         `0x${Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0')} ` +
                         `0x${Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0')} ` +
                         `0x${Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0')}`;

      const newPacket = {
        id: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString(),
        stationId: randomStation.id,
        stationName: randomStation.name,
        protocol: randomStation.deviceHealth?.protocol || 'LoRaWAN IN865',
        gateway: randomStation.deviceHealth?.gatewayId || 'RPI-GW-01',
        waterLevel: randomStation.currentTelemetry?.waterLevel || 2.5,
        rainfall: randomStation.currentTelemetry?.rainfallIntensity || 0,
        flow: randomStation.currentTelemetry?.flowVelocity || 1.2,
        battery: randomStation.deviceHealth?.batteryVoltage || 4.12,
        rssi: randomStation.deviceHealth?.signalRssi || -68,
        snr: Number((Math.random() * 5 + 6).toFixed(1)),
        hex: hexPayload,
        crc: 'CRC_OK'
      };

      setPackets(prev => [...prev.slice(-150), newPacket]);
      setPacketCount(c => c + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, stations]);

  // Scroll to bottom when new packet arrives
  useEffect(() => {
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, isPaused]);

  const filteredPackets = filterStation === 'ALL'
    ? packets
    : packets.filter(p => p.stationId === filterStation);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    setIngestStatus({ loading: true, message: 'Transmitting packet to API...' });

    try {
      const payload = {
        stationId: manualStationId,
        waterLevel: parseFloat(manualLevel),
        rainfallIntensity: parseFloat(manualRain),
        flowVelocity: parseFloat(manualFlow),
        batteryVoltage: 4.15,
        signalRssi: -62
      };

      const res = await axios.post('/api/telemetry/ingest', payload);
      setIngestStatus({
        success: true,
        message: `Packet accepted by Gateway: Station ${manualStationId} telemetry updated!`
      });
      setTimeout(() => setIngestStatus(null), 3000);
    } catch (err) {
      setIngestStatus({
        success: false,
        message: `Transmission failed: ${err.message}`
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Gateway Telemetry Stats */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base text-slate-100">IoT Gateway & Sensor Packet Terminal</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-600/40 animate-pulse">
                STREAMING LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct telemetry demodulation from ESP32 river-gauges & Raspberry Pi LoRaWAN/4G edge concentrators
            </p>
          </div>
        </div>

        {/* Quick Gateway Health Counters */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Total Packets:</span>
            <span className="text-white font-bold">{packetCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Gateways:</span>
            <span className="text-emerald-300 font-bold">3 Online</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Loss Rate:</span>
            <span className="text-amber-300 font-bold">0.04%</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Packet Terminal Console (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col h-[560px] shadow-2xl">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Packet Feed ({filteredPackets.length})
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              {/* Filter */}
              <select
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Stations</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                  isPaused ? 'bg-amber-950 text-amber-300 border border-amber-600/50' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Clear */}
              <button
                onClick={() => setPackets([])}
                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                title="Clear Terminal Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrolling Packet Stream */}
          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-2 scrollbar-thin">
            {filteredPackets.length === 0 ? (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Activity className="w-6 h-6 mx-auto text-slate-600 animate-spin" />
                <p>Awaiting incoming sensor gateway frames...</p>
              </div>
            ) : (
              filteredPackets.map((pkt) => (
                <div 
                  key={pkt.id} 
                  className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 flex items-center justify-between text-slate-300 transition gap-2"
                >
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span className="text-slate-500 text-[10px]">{pkt.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40 text-[10px]">
                      {pkt.stationId}
                    </span>
                    <span className="text-slate-400 text-[10px] hidden sm:inline">{pkt.gateway}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="text-cyan-300 font-bold">{pkt.waterLevel.toFixed(2)}m</span>
                    <span className="text-sky-300">{pkt.rainfall.toFixed(1)}mm/h</span>
                    <span className="text-slate-400 hidden md:inline">{pkt.rssi}dBm</span>
                    <span className="text-emerald-400 hidden lg:inline">{pkt.battery}V</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-slate-500 hidden xl:inline font-mono">
                      {pkt.hex}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-600/30">
                      CRC_OK
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right Manual Telemetry Injector Workbench (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Field Node Telemetry Ingestor</h3>
                <p className="text-[11px] text-slate-400">Directly transmit IoT packet to API gateway</p>
              </div>
            </div>

            <form onSubmit={handleManualIngest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Sensor Station:</label>
                <select
                  value={manualStationId}
                  onChange={(e) => setManualStationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Water Level Height (m):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualLevel}
                  onChange={(e) => setManualLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rainfall Intensity (mm/h):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={manualRain}
                  onChange={(e) => setManualRain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Flow Discharge Velocity (m/s):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={manualFlow}
                  onChange={(e) => setManualFlow(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {ingestStatus && (
                <div className={`p-2.5 rounded-xl border text-[11px] ${
                  ingestStatus.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}>
                  {ingestStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-900/40 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Inject Live Sensor Packet</span>
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Integration</span>
            </div>
            <p>
              Injected telemetry triggers immediate rate-of-rise recalculation, Z-score anomaly checks, and WebSocket broadcast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
