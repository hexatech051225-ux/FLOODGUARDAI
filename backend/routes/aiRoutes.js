import express from 'express';
import { historicalEvents } from '../services/seedData.js';

export const createAiRoutes = (dataStore) => {
  const router = express.Router();

  // Overview risk analysis across all stations
  router.get('/overview', (req, res) => {
    try {
      const stations = dataStore.getStations();
      const activeAlerts = dataStore.getAlerts('ACTIVE');

      let totalRisk = 0;
      let criticalCount = 0;
      let highRiskCount = 0;
      let watchCount = 0;
      let safeCount = 0;
      let totalRateOfRise = 0;
      let maxLevelPct = 0;
      let highestRiskStation = null;
      const allAnomalies = [];

      stations.forEach(station => {
        const score = station.riskAnalysis?.riskScore || 0;
        totalRisk += score;
        totalRateOfRise += (station.currentTelemetry?.rateOfRise || 0);
        
        const pct = station.currentTelemetry?.waterLevelPercentage || 0;
        if (pct > maxLevelPct) maxLevelPct = pct;

        const lvl = station.riskAnalysis?.riskLevel || 'SAFE';
        if (lvl === 'CRITICAL') criticalCount++;
        else if (lvl === 'HIGH RISK') highRiskCount++;
        else if (lvl === 'WATCH') watchCount++;
        else safeCount++;

        if (!highestRiskStation || score > (highestRiskStation.riskAnalysis?.riskScore || 0)) {
          highestRiskStation = station;
        }

        if (station.riskAnalysis?.anomalies) {
          station.riskAnalysis.anomalies.forEach(anomaly => {
            allAnomalies.push({
              stationId: station.id,
              stationName: station.name,
              ...anomaly
            });
          });
        }
      });

      const avgBasinRisk = Math.round(totalRisk / Math.max(1, stations.length));
      const avgRateOfRise = Number((totalRateOfRise / Math.max(1, stations.length)).toFixed(1));

      let overallBasinStatus = 'SAFE';
      if (criticalCount > 0) overallBasinStatus = 'CRITICAL';
      else if (highRiskCount > 0) overallBasinStatus = 'HIGH RISK';
      else if (watchCount > 0) overallBasinStatus = 'WATCH';

      res.json({
        success: true,
        data: {
          overallBasinStatus,
          avgBasinRisk,
          avgRateOfRise,
          maxLevelPct: Number(maxLevelPct.toFixed(1)),
          stationCounts: {
            total: stations.length,
            critical: criticalCount,
            highRisk: highRiskCount,
            watch: watchCount,
            safe: safeCount
          },
          activeAlertsCount: activeAlerts.length,
          highestRiskStation,
          activeAnomalies: allAnomalies,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Archive of historical flood events
  router.get('/historical-events', (req, res) => {
    try {
      res.json({ success: true, count: historicalEvents.length, data: historicalEvents });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST Chat Assistant endpoint for natural language query processing
  router.post('/chat', (req, res) => {
    try {
      const { message = '', stationId = 'ST-001' } = req.body;
      const stations = dataStore.getStations();
      const activeAlerts = dataStore.getAlerts('ACTIVE');
      const targetStation = stations.find(s => s.id === stationId || s.code === stationId) || stations[0];
      const query = message.toLowerCase();

      let reply = '';
      if (query.includes('st-001') || query.includes('ferry ghat') || query.includes('krishna')) {
        reply = `🌊 Station ST-001 (${targetStation.name}) is currently at ${targetStation.currentTelemetry.waterLevel}m (${targetStation.currentTelemetry.waterLevelPercentage}% of channel capacity). Risk Level: ${targetStation.riskAnalysis.riskLevel} (Score: ${targetStation.riskAnalysis.riskScore}/100). Rate of rise is ${targetStation.currentTelemetry.rateOfRise > 0 ? '+' : ''}${targetStation.currentTelemetry.rateOfRise} cm/h.`;
      } else if (query.includes('alert') || query.includes('warning') || query.includes('incident')) {
        reply = `🚨 Currently there are ${activeAlerts.length} ACTIVE emergency alerts in the basin. ${activeAlerts.length > 0 ? `Latest alert: ${activeAlerts[0].title}` : 'All stations are within nominal thresholds.'}`;
      } else if (query.includes('evacuat') || query.includes('shelter') || query.includes('civil defense')) {
        reply = `📋 Civil Defense Evacuation Directive: In the event of a CRITICAL flood surge, citizens in low-lying zones along Krishna Basin & Budameru Diversion should proceed to primary shelters (Indira Gandhi Stadium / Government Polytechnic Enclosure). Emergency helpline: 1077 / 112.`;
      } else if (query.includes('hardware') || query.includes('esp32') || query.includes('gateway')) {
        reply = `🧪 Live Hardware Telemetry Pipeline: ESP32 #1 & ESP32 #2 microcontrollers post ultrasonic, DS18B20 temperature (23.5°C), float switch, and relay status to Raspberry Pi Gateway RPI-GW-01, which ingests to MongoDB Atlas Cluster0.`;
      } else {
        reply = `🤖 FloodGuard AI Hydrological Assistant: Station ${targetStation.name} water level is ${targetStation.currentTelemetry.waterLevel}m (${targetStation.riskAnalysis.riskLevel}). Current basin scenario is ${dataStore.scenario}. ${targetStation.riskAnalysis.aiRecommendation}`;
      }

      res.header('Access-Control-Allow-Origin', '*');
      res.json({
        success: true,
        reply,
        stationContext: {
          id: targetStation.id,
          name: targetStation.name,
          level: targetStation.currentTelemetry.waterLevel,
          risk: targetStation.riskAnalysis.riskLevel,
          score: targetStation.riskAnalysis.riskScore
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
