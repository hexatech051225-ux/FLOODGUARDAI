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

  return router;
};
