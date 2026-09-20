import express from 'express';

export function createVisionRoutes(dataStore, io) {
  const router = express.Router();

  // In-memory active camera feed registry with preconfigured stations
  const cameraFeeds = [
    {
      id: 'CAM-001',
      name: 'Central River Esplanade - North Pier',
      stationId: 'ST-001',
      stationName: 'Riverside Causeway',
      location: 'Central River Basin',
      status: 'STREAMING',
      fps: 30,
      resolution: '1080p @ 30fps (RTSP/H.264)',
      model: 'YOLOv8n-FloodNet (Edge TensorRT)',
      inferenceMs: 12.4,
      confidenceThreshold: 0.65,
      detections: [
        { id: 'det-1', label: 'water_level_gauge', confidence: 0.94, bbox: [120, 180, 240, 520], details: 'Staff gauge visual reading: 3.40m' },
        { id: 'det-2', label: 'debris_clog', confidence: 0.78, bbox: [460, 310, 680, 460], details: 'Surface debris cluster near pier support' }
      ],
      hazardLevel: 'MEDIUM',
      lastFrameTime: new Date().toISOString()
    },
    {
      id: 'CAM-002',
      name: 'Downtown Underpass Bypass - Sump 4',
      stationId: 'ST-002',
      stationName: 'Downtown Underpass',
      location: 'Metro Underpass Corridor',
      status: 'STREAMING',
      fps: 30,
      resolution: '1080p @ 30fps (RTSP/H.264)',
      model: 'YOLOv8n-FloodNet (Edge TensorRT)',
      inferenceMs: 14.1,
      confidenceThreshold: 0.60,
      detections: [
        { id: 'det-3', label: 'submerged_vehicle', confidence: 0.92, bbox: [320, 280, 540, 450], details: 'Sedan vehicle partially inundated in lower roadway basin' },
        { id: 'det-4', label: 'water_accumulation', confidence: 0.96, bbox: [80, 360, 920, 720], details: 'Standing flood water depth ~ 0.85m' }
      ],
      hazardLevel: 'CRITICAL',
      lastFrameTime: new Date().toISOString()
    },
    {
      id: 'CAM-003',
      name: 'North Canal Intake Trash-Rack',
      stationId: 'ST-003',
      stationName: 'North Industrial Canal',
      location: 'Industrial Canal Flume',
      status: 'STREAMING',
      fps: 30,
      resolution: '720p @ 30fps (LoRa/Thermal)',
      model: 'YOLOv8n-FloodNet (Edge TensorRT)',
      inferenceMs: 10.8,
      confidenceThreshold: 0.70,
      detections: [
        { id: 'det-5', label: 'debris_clog', confidence: 0.88, bbox: [210, 140, 640, 480], details: 'Severe culvert trash-rack obstruction: 82% surface blockage' }
      ],
      hazardLevel: 'HIGH RISK',
      lastFrameTime: new Date().toISOString()
    },
    {
      id: 'CAM-004',
      name: 'South Bayside Storm Siphon Culvert',
      stationId: 'ST-004',
      stationName: 'South Siphon Culvert',
      location: 'Coastal Discharge Channel',
      status: 'STREAMING',
      fps: 25,
      resolution: '1080p @ 25fps (Starlink/PoE)',
      model: 'YOLOv8n-FloodNet (Edge TensorRT)',
      inferenceMs: 13.6,
      confidenceThreshold: 0.65,
      detections: [
        { id: 'det-6', label: 'clear_flow', confidence: 0.91, bbox: [150, 200, 700, 500], details: 'Normal gravity tidal discharge; clear flume path' }
      ],
      hazardLevel: 'SAFE',
      lastFrameTime: new Date().toISOString()
    }
  ];

  // GET /api/vision/cameras
  router.get('/cameras', (req, res) => {
    res.json({
      success: true,
      data: cameraFeeds,
      totalActiveFeeds: cameraFeeds.length,
      aiModel: 'YOLOv8-FloodNet / Ultralytics v8.1',
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/vision/detections (Ingestion from Python YOLO service or edge devices)
  router.post('/detections', (req, res) => {
    const { cameraId, stationId, detections, inferenceMs } = req.body;

    const camera = cameraFeeds.find(c => c.id === cameraId || c.stationId === stationId);
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera feed not found' });
    }

    camera.detections = detections || camera.detections;
    if (inferenceMs) camera.inferenceMs = inferenceMs;
    camera.lastFrameTime = new Date().toISOString();

    // Determine visual hazard level
    const hasVehicle = camera.detections.some(d => d.label === 'submerged_vehicle' || d.label === 'stranded_car');
    const hasDebris = camera.detections.some(d => d.label === 'debris_clog' && d.confidence > 0.75);
    const hasPedestrian = camera.detections.some(d => d.label === 'pedestrian_danger');

    if (hasVehicle) camera.hazardLevel = 'CRITICAL';
    else if (hasDebris || hasPedestrian) camera.hazardLevel = 'HIGH RISK';
    else camera.hazardLevel = 'SAFE';

    // Multimodal fusion: Notify connected command centers via Socket.IO
    if (io) {
      io.emit('vision:detection', {
        cameraId: camera.id,
        stationId: camera.stationId,
        stationName: camera.stationName,
        detections: camera.detections,
        hazardLevel: camera.hazardLevel,
        inferenceMs: camera.inferenceMs,
        timestamp: camera.lastFrameTime
      });
    }

    // Auto-escalate station alert if vehicle trapped or severe debris clog
    if (hasVehicle && dataStore) {
      const existing = dataStore.getAlerts().find(a => a.stationId === camera.stationId && a.type === 'VISION_VEHICLE_STRANDED' && a.status === 'ACTIVE');
      if (!existing) {
        dataStore.createAlert({
          stationId: camera.stationId,
          stationName: camera.stationName,
          severity: 'CRITICAL',
          type: 'VISION_VEHICLE_STRANDED',
          message: `≡ƒÜ¿ YOLOv8 Vision AI Alert: Submerged vehicle detected in flood flume at ${camera.stationName}. Immediate rescue response required.`,
          recommendation: 'Deploy swift-water rescue team, close road barriers, and reroute arterial traffic immediately.'
        });
      }
    }

    res.json({
      success: true,
      message: 'YOLO vision detections processed successfully',
      camera
    });
  });

  // POST /api/vision/dispatch (Operator triggers action from camera feed)
  router.post('/dispatch', (req, res) => {
    const { cameraId, actionType, operator, details } = req.body;
    const camera = cameraFeeds.find(c => c.id === cameraId);
    
    const logData = {
      stationId: camera ? camera.stationId : 'ST-001',
      stationName: camera ? camera.stationName : 'Field Station',
      actionType: actionType || 'VISUAL_VERIFIED_DISPATCH',
      actionTitle: `YOLO Visual Incident Dispatch: ${camera?.name || 'CCTV Target'}`,
      details: details || `Operator verified real-time YOLO vision alert on feed ${cameraId}. Field unit dispatched.`,
      team: 'Swift-Water Rapid Response & Barrier Team',
      operator: operator || 'Tactical Watch Officer'
    };

    if (dataStore) {
      dataStore.addResponseLog(logData);
    }

    res.json({
      success: true,
      message: 'Visual tactical dispatch confirmed',
      log: logData
    });
  });

  return router;
}
