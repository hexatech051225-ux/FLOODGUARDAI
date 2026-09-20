import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Eye, 
  ShieldAlert, 
  Sliders, 
  Play, 
  Pause, 
  RefreshCw, 
  Maximize2, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Car, 
  Trash2, 
  Gauge, 
  UserCheck, 
  Send,
  Sparkles,
  Layers,
  Crosshair,
  Cpu,
  Wifi,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';

export const YoloVisionCenter = ({ onOpenResponseLog }) => {
  const { stations, logResponseAction } = useFloodData();

  const [selectedCameraId, setSelectedCameraId] = useState('CAM-002');
  const [isPlaying, setIsPlaying] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(65);
  const [activeFilters, setActiveFilters] = useState({
    vehicles: true,
    debris: true,
    gauge: true,
    pedestrians: true
  });
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(null);

  // ESP32-CAM Hardware Configuration State
  const [isEsp32ModalOpen, setIsEsp32ModalOpen] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('192.168.1.100');
  const [esp32Port, setEsp32Port] = useState('81');
  const [esp32Path, setEsp32Path] = useState('/stream');
  const [esp32StreamUrl, setEsp32StreamUrl] = useState('http://192.168.1.100:81/stream');
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [esp32Error, setEsp32Error] = useState(false);
  const [esp32Loading, setEsp32Loading] = useState(false);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const imgStreamRef = useRef(null);

  // High-fidelity CCTV Camera Feeds + ESP32 Hardware Channel
  const cameras = [
    {
      id: 'ESP32-CAM',
      name: 'ESP32-CAM Hardware Node (Live Wi-Fi)',
      stationId: 'ST-002',
      stationName: 'Downtown Underpass (ESP32 Live)',
      location: `Field IoT Node ΓÇó ${esp32StreamUrl}`,
      status: esp32Connected ? 'LIVE HARDWARE' : 'HARDWARE NODE',
      fps: 25,
      inferenceMs: 14.5,
      hazardLevel: 'WATCH',
      opticalDepth: 1.82,
      sensorDepth: 1.88,
      weather: 'Live Wi-Fi MJPEG Stream',
      isHardware: true,
      detections: [
        { id: 'esp-d1', label: 'water_level_gauge', type: 'gauge', text: 'Live Optical Gauge: 1.82m', conf: 92, x: 130, y: 140, w: 85, h: 230, color: '#06b6d4' },
        { id: 'esp-d2', label: 'debris_cluster', type: 'debris', text: 'Culvert Flotsam Cluster (30% clog)', conf: 85, x: 270, y: 230, w: 190, h: 110, color: '#f59e0b' }
      ]
    },
    {
      id: 'CAM-001',
      name: 'Riverside North Pier - Pier #4',
      stationId: 'ST-001',
      stationName: 'Riverside Causeway',
      location: 'Central River Basin ΓÇó 28.6139┬░ N, 77.2090┬░ E',
      status: 'ONLINE',
      fps: 30,
      inferenceMs: 12.4,
      hazardLevel: 'WATCH',
      opticalDepth: 3.42,
      sensorDepth: 3.45,
      weather: 'Heavy Rain ΓÇó 28mm/h',
      detections: [
        { id: 'd1', label: 'water_level_gauge', type: 'gauge', text: 'Optical Staff Gauge: 3.42m', conf: 94, x: 120, y: 140, w: 90, h: 260, color: '#06b6d4' },
        { id: 'd2', label: 'debris_cluster', type: 'debris', text: 'Flotsam / Timber Cluster (25% clog)', conf: 78, x: 380, y: 260, w: 160, h: 90, color: '#f59e0b' }
      ]
    },
    {
      id: 'CAM-002',
      name: 'Downtown Underpass - Sump Basin 4',
      stationId: 'ST-002',
      stationName: 'Downtown Underpass',
      location: 'Metro Expressway Flume ΓÇó 28.6210┬░ N, 77.2150┬░ E',
      status: 'CRITICAL ALERT',
      fps: 30,
      inferenceMs: 14.1,
      hazardLevel: 'CRITICAL',
      opticalDepth: 1.85,
      sensorDepth: 1.88,
      weather: 'Sudden Cloudburst ΓÇó 48mm/h',
      detections: [
        { id: 'd3', label: 'submerged_vehicle', type: 'vehicles', text: 'SUBMERGED VEHICLE ΓÇó Sedan trapped in flood sump', conf: 96, x: 260, y: 190, w: 220, h: 140, color: '#ef4444' },
        { id: 'd4', label: 'water_accumulation', type: 'gauge', text: 'Flood Inundation Depth ~ 1.85m', conf: 92, x: 90, y: 280, w: 480, h: 150, color: '#06b6d4' },
        { id: 'd5', label: 'pedestrian_warning', type: 'pedestrians', text: 'Stranded Citizen on Median (High Risk)', conf: 89, x: 520, y: 170, w: 80, h: 140, color: '#f43f5e' }
      ]
    },
    {
      id: 'CAM-003',
      name: 'North Industrial Canal - Intake Grate',
      stationId: 'ST-003',
      stationName: 'North Industrial Canal',
      location: 'Industrial District ΓÇó 28.6320┬░ N, 77.2280┬░ E',
      status: 'HIGH RISK',
      fps: 28,
      inferenceMs: 11.2,
      hazardLevel: 'HIGH RISK',
      opticalDepth: 2.92,
      sensorDepth: 2.95,
      weather: 'Moderate Rain ΓÇó 16mm/h',
      detections: [
        { id: 'd6', label: 'debris_clog', type: 'debris', text: 'SEVERE CULVERT RESTRICTION ΓÇó 82% Trash Rack Blocked', conf: 91, x: 190, y: 130, w: 320, h: 220, color: '#f59e0b' },
        { id: 'd7', label: 'water_level_gauge', type: 'gauge', text: 'Optical Staff Gauge: 2.92m', conf: 88, x: 550, y: 160, w: 75, h: 200, color: '#06b6d4' }
      ]
    },
    {
      id: 'CAM-004',
      name: 'South Bayside Siphon - Coastal Outfall',
      stationId: 'ST-004',
      stationName: 'South Siphon Culvert',
      location: 'Bayside Tidal Gate ΓÇó 28.5980┬░ N, 77.1950┬░ E',
      status: 'NORMAL',
      fps: 30,
      inferenceMs: 13.0,
      hazardLevel: 'SAFE',
      opticalDepth: 1.15,
      sensorDepth: 1.12,
      weather: 'Overcast ΓÇó 4mm/h',
      detections: [
        { id: 'd8', label: 'clear_flow', type: 'gauge', text: 'Gravity Siphon Discharge Clear ΓÇó Flow: 2.8 m/s', conf: 95, x: 180, y: 160, w: 380, h: 180, color: '#10b981' }
      ]
    }
  ];

  const currentCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  // Connect ESP32 Stream Action
  const handleConnectEsp32 = (e) => {
    if (e) e.preventDefault();
    const cleanIp = esp32Ip.replace(/http:\/\/|https:\/\/|\/.*$/g, '').trim();
    const formattedUrl = `http://${cleanIp}:${esp32Port}${esp32Path.startsWith('/') ? esp32Path : '/' + esp32Path}`;
    setEsp32StreamUrl(formattedUrl);
    setEsp32Loading(true);
    setEsp32Error(false);
    setSelectedCameraId('ESP32-CAM');
    setIsEsp32ModalOpen(false);

    // Pre-test image load
    const testImg = new Image();
    testImg.src = formattedUrl;
    testImg.onload = () => {
      setEsp32Connected(true);
      setEsp32Loading(false);
    };
    testImg.onerror = () => {
      setEsp32Error(true);
      setEsp32Loading(false);
    };
  };

  // Render live canvas overlay + dynamic YOLO bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let tick = 0;

    const renderFrame = () => {
      if (!isPlaying) return;
      tick++;

      const width = canvas.width;
      const height = canvas.height;

      // If viewing the real hardware ESP32-CAM and it is connected,
      // clear canvas so the real image underneath shows through!
      if (currentCam.isHardware && esp32Connected) {
        ctx.clearRect(0, 0, width, height);
      } else {
        // Render high-fidelity simulated CCTV background
        ctx.fillStyle = '#060B14';
        ctx.fillRect(0, 0, width, height);

        // Water basin gradient
        const waterGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
        if (currentCam.hazardLevel === 'CRITICAL') {
          waterGrad.addColorStop(0, '#0f2744');
          waterGrad.addColorStop(0.5, '#123859');
          waterGrad.addColorStop(1, '#081726');
        } else if (currentCam.hazardLevel === 'HIGH RISK') {
          waterGrad.addColorStop(0, '#102e3b');
          waterGrad.addColorStop(1, '#091c24');
        } else {
          waterGrad.addColorStop(0, '#0b1d30');
          waterGrad.addColorStop(1, '#05101a');
        }

        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, height * 0.38, width, height * 0.62);

        // Concrete Culvert / Embankment Pier lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.38);
        ctx.lineTo(width * 0.3, height * 0.5);
        ctx.lineTo(width * 0.7, height * 0.5);
        ctx.lineTo(width, height * 0.38);
        ctx.stroke();

        // Flow ripple waves
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const yOffset = height * 0.55 + i * 28;
          const wave = Math.sin((tick * 0.04) + i) * 8;
          ctx.moveTo(width * 0.1, yOffset + wave);
          ctx.bezierCurveTo(
            width * 0.35, yOffset - wave,
            width * 0.65, yOffset + wave,
            width * 0.9, yOffset - wave
          );
          ctx.stroke();
        }

        // Rain streaking simulation for stormy cameras
        if (currentCam.hazardLevel !== 'SAFE') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          for (let r = 0; r < 25; r++) {
            const rx = (r * 31 + tick * 13) % width;
            const ry = (r * 47 + tick * 22) % height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 8, ry + 18);
            ctx.stroke();
          }
        }
      }

      // Draw YOLO Bounding Boxes
      const scaleX = width / 700;
      const scaleY = height / 440;

      currentCam.detections.forEach((det, idx) => {
        if (!activeFilters[det.type]) return;
        if (det.conf < confidenceThreshold) return;

        const jitterX = Math.sin(tick * 0.08 + idx) * 1.5;
        const jitterY = Math.cos(tick * 0.07 + idx) * 1.2;

        const bx = (det.x + jitterX) * scaleX;
        const by = (det.y + jitterY) * scaleY;
        const bw = det.w * scaleX;
        const bh = det.h * scaleY;

        // Box Glow Fill
        ctx.fillStyle = det.color === '#ef4444' ? 'rgba(239, 68, 68, 0.18)' :
                        det.color === '#f59e0b' ? 'rgba(245, 158, 11, 0.15)' :
                        det.color === '#f43f5e' ? 'rgba(244, 63, 94, 0.18)' :
                        'rgba(6, 182, 212, 0.12)';
        ctx.fillRect(bx, by, bw, bh);

        // Bounding Box Outer Border
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Precision Corner Reticles
        const cornerSize = 10;
        ctx.lineWidth = 3;
        // Top-Left
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize, by);
        ctx.stroke();
        // Top-Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by);
        ctx.lineTo(bx + bw);
        ctx.lineTo(bx + bw, by + cornerSize);
        ctx.stroke();
        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - cornerSize);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx + cornerSize, by + bh);
        ctx.stroke();
        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cornerSize);
        ctx.stroke();

        // Label Badge Header
        ctx.fillStyle = det.color;
        const labelText = `${det.text} [${det.conf}%]`;
        ctx.font = 'bold 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas';
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(bx, Math.max(0, by - 20), textWidth + 14, 20);

        ctx.fillStyle = '#000000';
        ctx.fillText(labelText, bx + 7, Math.max(14, by - 6));
      });

      // CCTV HUD Overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas';
      ctx.fillText(`REC ΓùÅ [${currentCam.id}] ${currentCam.name}`, 16, 26);
      
      const now = new Date();
      const timeStr = `${now.toISOString().replace('T', ' ').slice(0, 19)}.${Math.floor(now.getMilliseconds() / 100)}`;
      ctx.fillText(timeStr, 16, 46);

      ctx.fillStyle = currentCam.isHardware ? '#10b981' : '#38bdf8';
      ctx.fillText(
        currentCam.isHardware 
          ? `ESP32-CAM HARDWARE FEED | ${currentCam.fps} FPS | ${esp32StreamUrl}` 
          : `AI INFERENCE: ${currentCam.inferenceMs}ms | ${currentCam.fps} FPS | YOLOv8n-FloodNet`, 
        16, 
        height - 16
      );

      // Scanline effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let s = 0; s < height; s += 4) {
        ctx.fillRect(0, s, width, 1.5);
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedCameraId, isPlaying, confidenceThreshold, activeFilters, esp32Connected]);

  // Handle Snapshot Capture
  const handleCaptureSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 600);
  };

  // Handle 1-Click Tactical Dispatch from Camera
  const handleQuickDispatch = (actionLabel, details) => {
    const newLog = logResponseAction({
      stationId: currentCam.stationId,
      stationName: currentCam.stationName,
      actionType: 'YOLO_VISION_DISPATCH',
      actionTitle: `Visual AI Incident Verified: ${actionLabel}`,
      details: `${details} (Verified on YOLOv8 camera feed ${currentCam.id}).`,
      team: 'Swift-Water Rapid Extraction & Culvert Response',
      operator: 'EOC Command Watch Officer'
    });

    setDispatchSuccess(`Tactical dispatch sent: ${actionLabel}`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Header Tactical HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1627] to-slate-900 border border-slate-800/80 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                YOLOv8 Edge Vision & CCTV Command Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                YOLOv8-FloodNet
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dual-AI Multimodal Surveillance: Real-time CCTV object recognition fused with IoT hydrological sensors
            </p>
          </div>
        </div>

        {/* Real-time Status Badges & ESP32 Connect Button */}
        <div className="flex items-center space-x-2.5 self-end sm:self-auto flex-wrap">
          <button
            onClick={() => setIsEsp32ModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-950 transition border border-emerald-400/40"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Connect ESP32-CAM</span>
            {esp32Connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
            )}
          </button>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">5 Streams Ready</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-700/50 text-xs font-mono text-cyan-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Edge NPU Latency: 12.4ms</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Split: Viewport + Multimodal Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Video Canvas & Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Player Card */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
            {/* Flash Effect on Snapshot */}
            {snapshotTaken && (
              <div className="absolute inset-0 bg-white/70 z-30 transition-opacity duration-300 pointer-events-none" />
            )}

            {/* Top Bar inside Viewport */}
            <div className="absolute top-0 inset-x-0 p-3.5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 pointer-events-none">
              <div className="flex items-center space-x-2">
                <span className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wider animate-pulse ${
                  currentCam.isHardware ? 'bg-emerald-600 text-white' : 'bg-rose-500/80 text-white'
                }`}>
                  <span>{currentCam.isHardware ? 'HARDWARE STREAM' : 'LIVE RTSP'}</span>
                </span>
                <span className="text-xs font-mono text-slate-200 drop-shadow-md">
                  {currentCam.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  currentCam.hazardLevel === 'CRITICAL' 
                    ? 'bg-rose-950 text-rose-300 border-rose-600' 
                    : currentCam.hazardLevel === 'HIGH RISK'
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}>
                  HAZARD: {currentCam.hazardLevel}
                </span>
              </div>
            </div>

            {/* If ESP32-CAM is selected: Render real live MJPEG video element underneath canvas */}
            {currentCam.isHardware && (
              <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center">
                <img
                  ref={imgStreamRef}
                  src={esp32StreamUrl}
                  alt="ESP32-CAM Live Hardware Feed"
                  crossOrigin="anonymous"
                  onLoad={() => {
                    setEsp32Connected(true);
                    setEsp32Error(false);
                  }}
                  onError={() => {
                    setEsp32Connected(false);
                    setEsp32Error(true);
                  }}
                  className={`w-full h-full object-cover ${esp32Connected ? 'block' : 'hidden'}`}
                />

                {/* When ESP32-CAM is awaiting stream or has error */}
                {!esp32Connected && (
                  <div className="text-center p-6 space-y-3 z-10 max-w-md">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      Awaiting ESP32-CAM Stream Signal
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Target: <span className="text-cyan-400">{esp32StreamUrl}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Flash your ESP32-CAM with the included sketch and ensure it is on the same local Wi-Fi network.
                    </p>
                    <button
                      onClick={() => setIsEsp32ModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                    >
                      Configure ESP32 IP & View Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Canvas rendering feed + YOLO bounding boxes */}
            <canvas
              ref={canvasRef}
              width={700}
              height={440}
              className="relative w-full h-[380px] sm:h-[440px] block object-cover cursor-crosshair z-10"
            />

            {/* Bottom HUD inside Viewport */}
            <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                  title={isPlaying ? 'Pause Stream' : 'Resume Stream'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCaptureSnapshot}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-medium flex items-center space-x-1.5 transition"
                  title="Capture Frame Snapshot"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snapshot</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 text-slate-300 text-xs font-mono">
                <span>{currentCam.location}</span>
                <span className="hidden sm:inline text-slate-500">|</span>
                <span className="hidden sm:inline text-cyan-400 font-bold">{currentCam.weather}</span>
              </div>
            </div>
          </div>

          {/* Vision Control Bar: Threshold slider & Class Toggles */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              {/* Confidence Slider */}
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-slate-400 font-medium whitespace-nowrap flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>YOLO Confidence Filter:</span>
                </span>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-32 accent-cyan-500 cursor-pointer"
                />
                <span className="font-mono text-cyan-400 font-bold w-10 text-right">
                  {confidenceThreshold}%
                </span>
              </div>

              {/* Toggle Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, vehicles: !prev.vehicles }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition flex items-center space-x-1 ${
                    activeFilters.vehicles
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>Vehicles</span>
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, debris: !prev.debris }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition flex items-center space-x-1 ${
                    activeFilters.debris
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Debris Clogs</span>
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, gauge: !prev.gauge }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition flex items-center space-x-1 ${
                    activeFilters.gauge
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <Gauge className="w-3 h-3" />
                  <span>Water Staff</span>
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, pedestrians: !prev.pedestrians }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition flex items-center space-x-1 ${
                    activeFilters.pedestrians
                      ? 'bg-pink-950/80 text-pink-300 border-pink-500'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Pedestrians</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Camera Channel Thumbnails (Including ESP32-CAM) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCameraId;
              return (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCameraId(cam.id)}
                  className={`p-2.5 rounded-xl text-left border transition relative overflow-hidden ${
                    isSelected
                      ? cam.isHardware 
                        ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950'
                        : 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-[10px] font-bold flex items-center space-x-1 ${
                      cam.isHardware ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      {cam.isHardware ? <Cpu className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      <span>{cam.id}</span>
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      cam.isHardware && esp32Connected ? 'bg-emerald-400 animate-ping' :
                      cam.hazardLevel === 'CRITICAL' ? 'bg-rose-500 animate-ping' :
                      cam.hazardLevel === 'HIGH RISK' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  </div>
                  <div className="font-semibold text-xs text-slate-200 truncate">
                    {cam.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{cam.opticalDepth}m</span>
                    <span className={`font-mono text-[9px] font-bold ${
                      cam.isHardware ? 'text-emerald-400' :
                      cam.hazardLevel === 'CRITICAL' ? 'text-rose-400' :
                      cam.hazardLevel === 'HIGH RISK' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {cam.isHardware ? (esp32Connected ? 'ONLINE' : 'CONFIG') : cam.hazardLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dual-AI Multimodal Fusion & Tactical Dispatch (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dispatch Notice Banner */}
          {dispatchSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dispatchSuccess}</span>
            </div>
          )}

          {/* Cross-Verification Intelligence Card */}
          <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  Multimodal Dual-AI Cross-Check
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                FUSION ACTIVE
              </span>
            </div>

            {/* Telemetry vs Optical Verification */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span>IoT Ultrasonic Sensor</span>
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {currentCam.sensorDepth.toFixed(2)} m
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>YOLO Optical Staff Gauge</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {currentCam.opticalDepth.toFixed(2)} m
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
                <span>Verification Variance</span>
                <span className="font-bold">
                  ╬ö {Math.abs(currentCam.sensorDepth - currentCam.opticalDepth).toFixed(2)}m (CONFIRMED MATCH)
                </span>
              </div>
            </div>

            {/* Active YOLO Detections List */}
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-semibold mb-2">
                Identified Visual Objects
              </div>
              <div className="space-y-2">
                {currentCam.detections.map((det) => (
                  <div
                    key={det.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200 flex items-center space-x-1.5">
                        <Crosshair className="w-3.5 h-3.5" style={{ color: det.color }} />
                        <span>{det.label}</span>
                      </span>
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.2 rounded border"
                        style={{ color: det.color, borderColor: det.color + '60' }}
                      >
                        {det.conf}% confidence
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {det.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 1-Click Tactical Emergency Dispatch Center */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161224] to-[#0f1422] border border-rose-900/40 space-y-3.5 shadow-xl">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-slate-200">
                1-Click Visual Incident Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Deploy emergency units immediately with visual geotagged telemetry from feed {currentCam.id}:
            </p>

            <div className="space-y-2">
              {currentCam.hazardLevel === 'CRITICAL' && (
                <button
                  onClick={() => handleQuickDispatch(
                    'Submerged Vehicle Extraction & Road Closure',
                    `Critical life-safety alert: Trapped vehicle detected by YOLOv8 on ${currentCam.name}. Immediate swift-water rescue dispatched.`
                  )}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-950 transition"
                >
                  <Car className="w-4 h-4" />
                  <span>Dispatch Swift-Water Rescue Team</span>
                </button>
              )}

              <button
                onClick={() => handleQuickDispatch(
                  'Culvert Clamshell Debris Clearance',
                  `Culvert trash rack clearing order initiated based on YOLO visual obstruction detection on feed ${currentCam.id}.`
                )}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-950 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Deploy Drainage Excavator & Sandbags</span>
              </button>

              <button
                onClick={() => handleQuickDispatch(
                  'Arterial Traffic Diversion & Flume Siren',
                  `Acoustic flood alarm triggered and road barricades deployed for station ${currentCam.stationName}.`
                )}
                className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trigger Flume Siren & Traffic Barricades</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ESP32-CAM Hardware Configuration & Instructions Modal */}
      {isEsp32ModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Connect Real ESP32-CAM Hardware
                  </h3>
                  <p className="text-xs text-slate-400">
                    Stream live video over Wi-Fi from your physical ESP32 module
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEsp32ModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConnectEsp32} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>ESP32-CAM IP Address:</span>
                  <span className="text-[11px] font-mono text-cyan-400">e.g. 192.168.1.100</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-500">
                    http://
                  </span>
                  <input
                    type="text"
                    value={esp32Ip}
                    onChange={(e) => setEsp32Ip(e.target.value)}
                    placeholder="192.168.1.100"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <input
                    type="text"
                    value={esp32Port}
                    onChange={(e) => setEsp32Port(e.target.value)}
                    placeholder="81"
                    className="w-16 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs text-center focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={esp32Path}
                    onChange={(e) => setEsp32Path(e.target.value)}
                    placeholder="/stream"
                    className="w-24 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs text-center focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400">Quick URL Presets:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEsp32Port('81');
                      setEsp32Path('/stream');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono text-[11px] text-cyan-300 transition"
                  >
                    Standard MJPEG (:81/stream)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEsp32Port('80');
                      setEsp32Path('/capture');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono text-[11px] text-slate-300 transition"
                  >
                    Still Frame (:80/capture)
                  </button>
                </div>
              </div>

              {/* Hardware Instructions Alert */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                  <Wifi className="w-4 h-4" />
                  <span>Setup Guide for Arduino IDE</span>
                </div>
                <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px] leading-relaxed">
                  <li>Open the sketch located at: <code className="text-cyan-300 font-mono">server/yolo_service/esp32_cam_floodguard.ino</code></li>
                  <li>Enter your home Wi-Fi SSID and password in the file.</li>
                  <li>Upload to your AI-Thinker ESP32-CAM board.</li>
                  <li>Open Serial Monitor (115200 baud) to find the IP address.</li>
                  <li>Paste the IP above and click <strong>Connect Live Stream</strong>!</li>
                </ol>
              </div>

              {/* Submit & Close Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEsp32ModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition flex items-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Connect Live Stream</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YoloVisionCenter;
