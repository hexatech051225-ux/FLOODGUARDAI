import express from 'express';
import { getDbStatus } from '../config/db.js';

export const createTelemetryRoutes = (dataStore) => {
  const router = express.Router();

  // POST endpoint for ESP32 and Raspberry Pi IoT Edge Gateway ingestion
  router.post('/ingest', (req, res) => {
    try {
      const payload = req.body;
      const stationId = payload.stationId || 'ST-001';

      const result = dataStore.ingestTelemetry(payload);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.header('Access-Control-Allow-Origin', '*');
      res.status(200).json({
        success: true,
        message: `Telemetry ingested from device for station ${stationId}`,
        data: result.station,
        hardwareTelemetry: result.hardwareTelemetry
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET endpoint to fetch the latest hardware telemetry & diagnostics for ST-001 (or specified station)
  router.get('/latest/:stationId?', (req, res) => {
    try {
      const stationId = req.params.stationId || 'ST-001';
      const station = dataStore.getStationById(stationId) || dataStore.getStations()[0];

      if (!station) {
        return res.status(404).json({ success: false, message: `Station ${stationId} not found` });
      }

      const dbInfo = getDbStatus();
      const hw = station.hardwareTelemetry || {
        waterDistance: Number((5.2 - station.currentTelemetry.waterLevel).toFixed(4)),
        rainValue: station.currentTelemetry.rainfallIntensity > 0 ? 320 : 1023,
        rainStatus: station.currentTelemetry.rainfallIntensity > 20 ? 'WET' : 'DRY',
        flowPulses: 0,
        flowRate: Number((station.currentTelemetry.flowVelocity * 60).toFixed(2)),
        floatStatus: 'NORMAL',
        relayStatus: station.currentTelemetry.waterLevel > 4.0 ? 'ON' : 'OFF',
        ajsr04mDistance: 1.85,
        waterStatus: station.currentTelemetry.waterLevel > 4.0 ? 'SURGE' : 'NORMAL',
        dht11Status: 'OK',
        ds18b20Status: 'OK',
        ds18b20Temp: station.currentTelemetry.waterTemperature || 23.5,
        floatStatus2: 'NORMAL',
        gpsStatus: 'LOCKED',
        rgbStatus: 'GREEN',
        buzzerStatus: 'OFF',
        buttonStatus: 'RELEASED',
        esp1Status: 'ONLINE',
        esp2Status: 'ONLINE',
        gatewayStatus: 'ONLINE',
        lastTelemetryReceived: station.currentTelemetry.timestamp || new Date().toISOString()
      };

      res.header('Access-Control-Allow-Origin', '*');
      res.json({
        success: true,
        stationId: station.id,
        stationName: station.name,
        system: {
          backend: 'ONLINE',
          mongoDb: dbInfo.connected ? 'CONNECTED' : 'DISCONNECTED',
          mongoDbType: dbInfo.type,
          gateway: hw.gatewayStatus || 'ONLINE',
          lastTelemetryReceived: hw.lastTelemetryReceived || station.currentTelemetry.timestamp || new Date().toISOString()
        },
        esp32_1: {
          status: hw.esp1Status || 'ONLINE',
          waterDistance: hw.waterDistance,
          rainValue: hw.rainValue,
          rainStatus: hw.rainStatus,
          flowPulses: hw.flowPulses,
          flowRate: hw.flowRate,
          floatStatus: hw.floatStatus,
          relayStatus: hw.relayStatus
        },
        esp32_2: {
          status: hw.esp2Status || 'ONLINE',
          ajsr04mDistance: hw.ajsr04mDistance,
          waterStatus: hw.waterStatus,
          dht11Status: hw.dht11Status,
          ds18b20Status: hw.ds18b20Status,
          ds18b20Temp: hw.ds18b20Temp,
          floatStatus: hw.floatStatus2 || hw.floatStatus || 'NORMAL',
          gpsStatus: hw.gpsStatus,
          rgbStatus: hw.rgbStatus,
          buzzerStatus: hw.buzzerStatus,
          buttonStatus: hw.buttonStatus
        },
        floodAnalysis: {
          waterLevel: station.currentTelemetry.waterLevel,
          waterLevelPercentage: station.currentTelemetry.waterLevelPercentage || 45,
          riskLevel: station.riskAnalysis?.riskLevel || 'SAFE',
          riskScore: station.riskAnalysis?.riskScore || 15,
          rateOfRise: station.currentTelemetry.rateOfRise || 0,
          predictedCrestTime: station.riskAnalysis?.predictedCrestTime || 'Normal Flow',
          predictedCrestLevel: station.riskAnalysis?.predictedCrestLevel || station.currentTelemetry.waterLevel,
          aiRecommendation: station.riskAnalysis?.aiRecommendation || 'Nominal baseline monitoring active.'
        },
        timestamp: new Date().toISOString()
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
