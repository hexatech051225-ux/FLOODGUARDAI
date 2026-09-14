import { initialStations, initialAlerts, initialResponseLogs } from './seedData.js';
import { AiRiskEngine } from './aiRiskEngine.js';

export class FloodGuardDataStore {
  constructor(io = null) {
    this.io = io;
    this.stations = JSON.parse(JSON.stringify(initialStations));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.responseLogs = JSON.parse(JSON.stringify(initialResponseLogs));
    this.scenario = 'NORMAL'; // 'NORMAL' | 'HEAVY_STORM' | 'FLASH_FLOOD' | 'SENSOR_FAULT' | 'RECOVERY'
    this.history = new Map(); // stationId -> array of telemetry data points
    this.simulationInterval = null;

    this.initHistory();
    this.startSimulation();
  }

  setSocketIO(io) {
    this.io = io;
  }

  initHistory() {
    const now = Date.now();
    this.stations.forEach(station => {
      const dataPoints = [];
      const baseLevel = station.currentTelemetry.waterLevel;
      const baseRain = station.currentTelemetry.rainfallIntensity;
      const baseFlow = station.currentTelemetry.flowVelocity;

      // Generate 24 historical points (1 every hour)
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 3600 * 1000).toISOString();
        const factor = Math.sin((24 - i) / 4) * 0.4 + (i < 6 ? 0.3 : -0.2);
        const waterLevel = Math.max(0.2, Number((baseLevel + factor + (Math.random() * 0.1 - 0.05)).toFixed(2)));
        const rain = Math.max(0, Number((baseRain + factor * 5 + (Math.random() * 2 - 1)).toFixed(1)));
        const flow = Math.max(0.4, Number((baseFlow + factor * 0.5).toFixed(2)));
        const discharge = Number((flow * 24.5).toFixed(1));

        dataPoints.push({
          stationId: station.id,
          timestamp: time,
          waterLevel,
          rainfallIntensity: rain,
          flowVelocity: flow,
          drainageDischarge: discharge,
          rateOfRise: Number((factor * 3.5).toFixed(1)),
          riskScore: Math.min(100, Math.max(5, Math.round(30 + factor * 40)))
        });
      }
      this.history.set(station.id, dataPoints);
    });
  }

  startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      this.tick();
    }, 4000);
  }

  setScenario(scenarioName) {
    this.scenario = scenarioName;
    console.log(`[Simulation] Switched storm scenario to: ${scenarioName}`);
    // Immediately execute a tick to reflect scenario
    this.tick();
    if (this.io) {
      this.io.emit('scenario:changed', { scenario: this.scenario, timestamp: new Date().toISOString() });
    }
  }

  tick() {
    const now = new Date().toISOString();

    this.stations.forEach(station => {
      const cur = station.currentTelemetry;
      let levelDelta = 0;
      let rainTarget = 0;
      let flowDelta = 0;

      switch (this.scenario) {
        case 'HEAVY_STORM':
          rainTarget = 35 + Math.random() * 25;
          levelDelta = 0.04 + Math.random() * 0.03;
          flowDelta = 0.08;
          break;
        case 'FLASH_FLOOD':
          rainTarget = 65 + Math.random() * 35;
          levelDelta = 0.09 + Math.random() * 0.06;
          flowDelta = 0.18;
          break;
        case 'SENSOR_FAULT':
          if (station.id === 'ST-003') {
            station.deviceHealth.packetLoss = 0.48;
            station.deviceHealth.signalRssi = -94;
            station.deviceHealth.esp32Status = 'WARNING';
          }
          rainTarget = cur.rainfallIntensity;
          levelDelta = (Math.random() - 0.5) * 0.01;
          break;
        case 'RECOVERY':
          rainTarget = Math.max(0, cur.rainfallIntensity - 4);
          levelDelta = -0.05 - Math.random() * 0.03;
          flowDelta = -0.08;
          break;
        case 'NORMAL':
        default:
          rainTarget = Math.max(0, Math.min(15, cur.rainfallIntensity + (Math.random() - 0.5) * 2));
          levelDelta = (Math.random() - 0.48) * 0.015;
          flowDelta = (Math.random() - 0.5) * 0.03;
          break;
      }

      // Apply water level bounds
      const maxCap = station.dangerThresholds.maxCapacity || 5.0;
      const minLevel = 0.2;
      cur.waterLevel = Math.max(minLevel, Math.min(maxCap, Number((cur.waterLevel + levelDelta).toFixed(2))));
      cur.rainfallIntensity = Number((rainTarget).toFixed(1));
      cur.rainfall24h = Number((cur.rainfall24h + (cur.rainfallIntensity / 720)).toFixed(1));
      cur.flowVelocity = Math.max(0.3, Number((cur.flowVelocity + flowDelta).toFixed(2)));
      cur.drainageDischarge = Number((cur.flowVelocity * 22.4).toFixed(1));
      cur.timestamp = now;
      station.deviceHealth.lastPing = now;

      // Random small battery drift
      if (Math.random() < 0.1) {
        station.deviceHealth.batteryVoltage = Number((4.10 + (Math.random() * 0.1 - 0.05)).toFixed(2));
      }

      // Run AI Risk Engine
      const historyPoints = this.history.get(station.id) || [];
      const aiResult = AiRiskEngine.analyzeStationRisk(station, historyPoints.slice(-5));
      
      station.riskAnalysis = {
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        factors: aiResult.factors,
        anomalies: aiResult.anomalies,
        predictedCrestTime: aiResult.predictedCrestTime,
        predictedCrestLevel: aiResult.predictedCrestLevel,
        confidence: aiResult.confidence,
        aiRecommendation: aiResult.aiRecommendation,
        forecast: aiResult.forecast
      };
      station.currentTelemetry.rateOfRise = aiResult.rateOfRise;
      station.currentTelemetry.rateOfRiseDirection = aiResult.rateOfRiseDirection;
      station.currentTelemetry.waterLevelPercentage = aiResult.waterLevelPercentage;

      // Update history buffer
      historyPoints.push({
        stationId: station.id,
        timestamp: now,
        waterLevel: cur.waterLevel,
        rainfallIntensity: cur.rainfallIntensity,
        flowVelocity: cur.flowVelocity,
        drainageDischarge: cur.drainageDischarge,
        rateOfRise: aiResult.rateOfRise,
        riskScore: aiResult.riskScore
      });
      if (historyPoints.length > 50) historyPoints.shift();
      this.history.set(station.id, historyPoints);

      // Check auto-trigger of alerts
      if (aiResult.riskLevel === 'CRITICAL' || aiResult.riskLevel === 'HIGH RISK') {
        const existingActive = this.alerts.find(a => a.stationId === station.id && a.status === 'ACTIVE');
        if (!existingActive) {
          const newAlert = {
            id: `ALT-${Date.now().toString().slice(-4)}`,
            stationId: station.id,
            stationName: station.name,
            severity: aiResult.riskLevel,
            title: `${aiResult.riskLevel}: ${station.name} Surge Detected`,
            description: `Water level reached ${cur.waterLevel}m with +${aiResult.rateOfRise} cm/h rate of rise. AI risk score: ${aiResult.riskScore}/100.`,
            category: aiResult.riskLevel === 'CRITICAL' ? 'WATER_LEVEL_CRITICAL' : 'RATE_OF_RISE_ALARM',
            status: 'ACTIVE',
            timestamp: now,
            acknowledgedBy: null,
            acknowledgedAt: null,
            responseActions: []
          };
          this.alerts.unshift(newAlert);
          if (this.io) {
            this.io.emit('alert:new', newAlert);
          }
        }
      }
    });

    // Broadcast over Socket.IO
    if (this.io) {
      this.io.emit('telemetry:update', {
        stations: this.stations,
        alertsCount: this.alerts.filter(a => a.status === 'ACTIVE').length,
        timestamp: now
      });
    }
  }

  // IoT / Gateway ingestion endpoint (from physical ESP32 or RPi Gateway)
  ingestTelemetry(payload) {
    const { stationId, waterLevel, rainfallIntensity, flowVelocity, batteryVoltage, signalRssi } = payload;
    const station = this.stations.find(s => s.id === stationId || s.code === stationId);
    if (!station) {
      return { success: false, message: `Station ${stationId} not found` };
    }

    const now = new Date().toISOString();
    if (waterLevel !== undefined) station.currentTelemetry.waterLevel = Number(waterLevel);
    if (rainfallIntensity !== undefined) station.currentTelemetry.rainfallIntensity = Number(rainfallIntensity);
    if (flowVelocity !== undefined) station.currentTelemetry.flowVelocity = Number(flowVelocity);
    if (batteryVoltage !== undefined) station.deviceHealth.batteryVoltage = Number(batteryVoltage);
    if (signalRssi !== undefined) station.deviceHealth.signalRssi = Number(signalRssi);
    station.currentTelemetry.timestamp = now;
    station.deviceHealth.lastPing = now;

    // Trigger AI analysis
    const historyPoints = this.history.get(station.id) || [];
    const aiResult = AiRiskEngine.analyzeStationRisk(station, historyPoints.slice(-5));
    station.riskAnalysis = aiResult;

    if (this.io) {
      this.io.emit('telemetry:update', {
        stations: this.stations,
        updatedStationId: station.id,
        timestamp: now
      });
    }

    return { success: true, station };
  }

  getStations() {
    return this.stations;
  }

  getStationById(id) {
    return this.stations.find(s => s.id === id || s.code === id);
  }

  getStationHistory(id) {
    return this.history.get(id) || [];
  }

  getAlerts(status) {
    if (status) {
      return this.alerts.filter(a => a.status === status.toUpperCase());
    }
    return this.alerts;
  }

  acknowledgeAlert(alertId, operator = 'Municipal Officer') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return null;

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = operator;
    alert.acknowledgedAt = new Date().toISOString();

    if (this.io) {
      this.io.emit('alert:updated', alert);
    }
    return alert;
  }

  resolveAlert(alertId, operator = 'Municipal Officer') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return null;

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();

    if (this.io) {
      this.io.emit('alert:updated', alert);
    }
    return alert;
  }

  getResponseLogs() {
    return this.responseLogs;
  }

  addResponseLog(logData) {
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      alertId: logData.alertId || null,
      stationId: logData.stationId,
      stationName: logData.stationName,
      actionType: logData.actionType || 'BARRIER_DEPLOYMENT',
      actionTitle: logData.actionTitle,
      details: logData.details,
      team: logData.team || 'Emergency Dispatch Unit',
      operator: logData.operator || 'Command Center Dispatcher',
      status: logData.status || 'COMPLETED',
      timestamp: new Date().toISOString()
    };

    this.responseLogs.unshift(newLog);

    // If linked to an alert, record action inside alert too
    if (logData.alertId) {
      const alert = this.alerts.find(a => a.id === logData.alertId);
      if (alert) {
        alert.responseActions.push({
          id: newLog.id,
          action: newLog.actionTitle,
          details: newLog.details,
          operator: newLog.operator,
          timestamp: newLog.timestamp
        });
      }
    }

    if (this.io) {
      this.io.emit('log:new', newLog);
    }
    return newLog;
  }
}
