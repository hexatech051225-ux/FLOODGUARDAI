import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
  stationId: { type: String, required: true, index: true },
  waterLevel: { type: Number, required: true },
  rainfallIntensity: { type: Number, required: true },
  rainfall24h: { type: Number, default: 0 },
  flowVelocity: { type: Number, default: 0 },
  drainageDischarge: { type: Number, default: 0 },
  rateOfRise: { type: Number, default: 0 },
  waterTemperature: { type: Number, default: 20 },
  batteryPercentage: { type: Number, default: 100 },
  signalRssi: { type: Number, default: -70 },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
