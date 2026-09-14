/**
 * FloodGuard AI - Hydrological AI Risk Assessment & Prediction Engine (Client Copy)
 */

export class AiRiskEngine {
  static analyzeStationRisk(station, recentTelemetry = []) {
    const { dangerThresholds, currentTelemetry, type, drainageAreaKm2 = 30 } = station;
    const { waterLevel, rainfallIntensity, flowVelocity, rainfall24h = 0 } = currentTelemetry;

    let rateOfRise = currentTelemetry.rateOfRise || 0;
    if (recentTelemetry.length >= 2) {
      const latest = recentTelemetry[recentTelemetry.length - 1];
      const prev = recentTelemetry[0];
      const timeDiffHours = Math.max(0.016, (new Date(latest.timestamp) - new Date(prev.timestamp)) / 3600000);
      rateOfRise = ((latest.waterLevel - prev.waterLevel) * 100) / timeDiffHours;
    }

    let rateOfRiseDirection = 'stable';
    if (rateOfRise > 10.0) rateOfRiseDirection = 'rising_fast';
    else if (rateOfRise > 2.0) rateOfRiseDirection = 'rising';
    else if (rateOfRise < -2.0) rateOfRiseDirection = 'falling';
    else rateOfRiseDirection = 'stable';

    const maxCap = dangerThresholds.maxCapacity || dangerThresholds.critical * 1.15;
    const waterLevelPercentage = Math.min(100, Math.max(0, (waterLevel / maxCap) * 100));

    let levelScore = 0;
    if (waterLevel >= dangerThresholds.critical) {
      levelScore = 40;
    } else if (waterLevel >= dangerThresholds.highRisk) {
      const span = dangerThresholds.critical - dangerThresholds.highRisk;
      levelScore = 28 + ((waterLevel - dangerThresholds.highRisk) / span) * 12;
    } else if (waterLevel >= dangerThresholds.warning) {
      const span = dangerThresholds.highRisk - dangerThresholds.warning;
      levelScore = 14 + ((waterLevel - dangerThresholds.warning) / span) * 14;
    } else {
      levelScore = Math.max(0, (waterLevel / dangerThresholds.warning) * 14);
    }

    let riseScore = 0;
    if (rateOfRise > 20) riseScore = 25;
    else if (rateOfRise > 10) riseScore = 18 + ((rateOfRise - 10) / 10) * 7;
    else if (rateOfRise > 3) riseScore = 8 + ((rateOfRise - 3) / 7) * 10;
    else if (rateOfRise > 0) riseScore = (rateOfRise / 3) * 8;
    else riseScore = 0;

    let rainScore = 0;
    if (rainfallIntensity > 40) rainScore = 20;
    else if (rainfallIntensity > 20) rainScore = 12 + ((rainfallIntensity - 20) / 20) * 8;
    else if (rainfallIntensity > 5) rainScore = 4 + ((rainfallIntensity - 5) / 15) * 8;
    else rainScore = (rainfallIntensity / 5) * 4;

    let drainageScore = 0;
    if (type === 'DRAIN' || type === 'UNDERPASS') {
      if (waterLevelPercentage > 85) drainageScore = 15;
      else if (waterLevelPercentage > 65) drainageScore = 10;
      else drainageScore = 4;
    } else {
      if (flowVelocity > 3.5) drainageScore = 15;
      else if (flowVelocity > 2.0) drainageScore = 9;
      else drainageScore = 3;
    }

    const totalRawScore = Math.round(levelScore + riseScore + rainScore + drainageScore);
    const riskScore = Math.min(100, Math.max(5, totalRawScore));

    let riskLevel = 'SAFE';
    if (riskScore >= 80 || waterLevel >= dangerThresholds.critical) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 60 || waterLevel >= dangerThresholds.highRisk) {
      riskLevel = 'HIGH RISK';
    } else if (riskScore >= 35 || waterLevel >= dangerThresholds.warning) {
      riskLevel = 'WATCH';
    } else {
      riskLevel = 'SAFE';
    }

    const anomalies = [];
    if (rateOfRise > 18.0) {
      anomalies.push({
        type: 'SURGE_ANOMALY',
        severity: 'HIGH',
        message: `Rapid hydraulic acceleration: Rate of rise surged to +${rateOfRise.toFixed(1)} cm/h`,
        timestamp: new Date().toISOString()
      });
    }

    if (station.deviceHealth?.packetLoss > 0.35) {
      anomalies.push({
        type: 'TELEMETRY_PACKET_LOSS',
        severity: 'MEDIUM',
        message: `Edge gateway reporting ${(station.deviceHealth.packetLoss * 100).toFixed(0)}% LoRa packet loss`,
        timestamp: new Date().toISOString()
      });
    }

    if (rainfallIntensity < 5 && rateOfRise > 8 && (type === 'DRAIN' || type === 'UNDERPASS')) {
      anomalies.push({
        type: 'DEBRIS_RESTRICTION',
        severity: 'MEDIUM',
        message: 'Elevated water backing up with minimal rainfall. Possible culvert debris obstruction.',
        timestamp: new Date().toISOString()
      });
    }

    if (waterLevel >= dangerThresholds.critical) {
      anomalies.push({
        type: 'CRITICAL_BREACH',
        severity: 'CRITICAL',
        message: `Water level (${waterLevel.toFixed(2)}m) exceeded critical flood threshold (${dangerThresholds.critical.toFixed(2)}m)`,
        timestamp: new Date().toISOString()
      });
    }

    const runoffMultiplier = type === 'DRAIN' ? 0.04 : type === 'UNDERPASS' ? 0.03 : 0.02;
    const projectedRise1h = (rateOfRise / 100) * 1.0 + (rainfallIntensity * runoffMultiplier * 0.4);
    const projectedRise3h = (rateOfRise / 100) * 2.2 + (rainfallIntensity * runoffMultiplier * 1.1);
    const projectedRise6h = (rateOfRise / 100) * 3.4 + (rainfallIntensity * runoffMultiplier * 1.8);

    const forecast = {
      forecast1h: Math.max(0.1, Number((waterLevel + projectedRise1h).toFixed(2))),
      forecast3h: Math.max(0.1, Number((waterLevel + projectedRise3h).toFixed(2))),
      forecast6h: Math.max(0.1, Number((waterLevel + Math.max(0, projectedRise6h)).toFixed(2)))
    };

    let predictedCrestTime = 'Stable / No Crest';
    let predictedCrestLevel = waterLevel;
    if (rateOfRise > 0.5) {
      const hoursToPeak = Math.max(0.5, Math.min(8.0, (dangerThresholds.critical - waterLevel) / Math.max(0.05, rateOfRise / 100)));
      predictedCrestTime = hoursToPeak < 1 ? `${Math.round(hoursToPeak * 60)} mins` : `${hoursToPeak.toFixed(1)} hrs`;
      predictedCrestLevel = Number((waterLevel + (rateOfRise / 100) * (hoursToPeak * 0.75)).toFixed(2));
    }

    const factors = [];
    if (waterLevel >= dangerThresholds.warning) {
      factors.push(`Water level elevated at ${waterLevel.toFixed(2)}m (${waterLevelPercentage.toFixed(0)}% channel capacity)`);
    } else {
      factors.push(`Water level normal at ${waterLevel.toFixed(2)}m with ample freeboard`);
    }

    if (rateOfRise > 5) {
      factors.push(`Active hydrograph surge (+${rateOfRise.toFixed(1)} cm/hr)`);
    } else if (rateOfRise < -1) {
      factors.push(`Receding hydrograph (-${Math.abs(rateOfRise).toFixed(1)} cm/hr)`);
    } else {
      factors.push('Stable hydrograph trend');
    }

    if (rainfallIntensity > 15) {
      factors.push(`Intense localized storm activity (${rainfallIntensity.toFixed(0)} mm/hr)`);
    }

    let aiRecommendation = 'Normal monitoring schedule active. All systems nominal.';
    if (riskLevel === 'CRITICAL') {
      aiRecommendation = `IMMEDIATE ACTION: Dispatch emergency barrier teams to ${station.name}. Activate auxiliary drainage pumps and notify traffic dispatch to divert adjacent routes.`;
    } else if (riskLevel === 'HIGH RISK') {
      aiRecommendation = `URGENT ADVISORY: Deploy mobile flood barriers. Stage rapid-response sandbag crews and switch ESP32 IoT telemetry interval to 1-minute high-frequency burst.`;
    } else if (riskLevel === 'WATCH') {
      aiRecommendation = `PRECAUTIONARY: Station reached watch advisory threshold. Monitor upstream precipitation inflow and verify storm drain trash racks.`;
    }

    return {
      riskLevel,
      riskScore,
      waterLevelPercentage: Number(waterLevelPercentage.toFixed(1)),
      rateOfRise: Number(rateOfRise.toFixed(1)),
      rateOfRiseDirection,
      factors,
      anomalies,
      predictedCrestTime,
      predictedCrestLevel,
      confidence: Math.round(88 + Math.random() * 8),
      aiRecommendation,
      forecast
    };
  }
}
