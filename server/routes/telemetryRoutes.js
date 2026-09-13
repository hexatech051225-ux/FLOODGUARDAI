import express from 'express';

export const createTelemetryRoutes = (dataStore) => {
  const router = express.Router();

  // POST endpoint for ESP32 and Raspberry Pi IoT Edge Gateway ingestion
  router.post('/ingest', (req, res) => {
    try {
      const { stationId, waterLevel, rainfallIntensity, flowVelocity, batteryVoltage, signalRssi } = req.body;
      if (!stationId) {
        return res.status(400).json({ success: false, message: 'stationId is required' });
      }

      const result = dataStore.ingestTelemetry({
        stationId,
        waterLevel,
        rainfallIntensity,
        flowVelocity,
        batteryVoltage,
        signalRssi
      });

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json({
        success: true,
        message: `Telemetry ingested from device for station ${stationId}`,
        data: result.station
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST endpoint to trigger simulation scenarios for demonstration
  router.post('/scenario', (req, res) => {
    try {
      const { scenario } = req.body;
      const validScenarios = ['NORMAL', 'HEAVY_STORM', 'FLASH_FLOOD', 'SENSOR_FAULT', 'RECOVERY'];
      if (!validScenarios.includes(scenario)) {
        return res.status(400).json({ success: false, message: `Invalid scenario. Choose one of: ${validScenarios.join(', ')}` });
      }

      dataStore.setScenario(scenario);
      res.json({ success: true, message: `Active storm scenario set to ${scenario}`, scenario });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
