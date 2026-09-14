import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['RIVER', 'DRAIN', 'CANAL', 'UNDERPASS', 'ESTUARY'], default: 'RIVER' },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  elevation: { type: Number, default: 200 },
  drainageAreaKm2: { type: Number, default: 25 },
  dangerThresholds: {
    safe: { type: Number, default: 2.0 },
    warning: { type: Number, default: 3.0 },
    highRisk: { type: Number, default: 4.0 },
    critical: { type: Number, default: 4.8 },
    maxCapacity: { type: Number, default: 5.5 }
  },
  currentTelemetry: {
    waterLevel: Number,
    waterLevelPercentage: Number,
    rateOfRise: Number,
    rateOfRiseDirection: String,
    rainfallIntensity: Number,
    rainfall24h: Number,
    flowVelocity: Number,
    drainageDischarge: Number,
    waterTemperature: Number,
    timestamp: { type: Date, default: Date.now }
  },
  deviceHealth: {
    esp32Status: { type: String, default: 'ONLINE' },
    gatewayId: String,
    protocol: String,
    batteryPercentage: Number,
    batteryVoltage: Number,
    solarStatus: String,
    solarVoltage: Number,
    signalRssi: Number,
    packetLoss: Number,
    firmwareVersion: String,
    lastPing: { type: Date, default: Date.now }
  },
  riskAnalysis: {
    riskLevel: { type: String, enum: ['SAFE', 'WATCH', 'HIGH RISK', 'CRITICAL'], default: 'SAFE' },
    riskScore: { type: Number, min: 0, max: 100, default: 10 },
    factors: [String],
    anomalies: [mongoose.Schema.Types.Mixed],
    predictedCrestTime: String,
    predictedCrestLevel: Number,
    confidence: Number,
    aiRecommendation: String
  }
}, { timestamps: true });

export const Station = mongoose.model('Station', stationSchema);
