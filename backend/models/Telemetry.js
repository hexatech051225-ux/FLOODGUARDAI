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
  // Hardware Specific Diagnostic & Telemetry Fields (ESP32 #1 & ESP32 #2 & Pi Gateway)
  hardware: {
    waterDistance: Number,
    rainValue: Number,
    rainStatus: String,
    flowPulses: Number,
    flowRate: Number,
    floatStatus: String,
    relayStatus: String,
    ajsr04mDistance: Number,
    waterStatus: String,
    dht11Status: String,
    ds18b20Status: String,
    ds18b20Temp: Number,
    floatStatus2: String,
    gpsStatus: String,
    rgbStatus: String,
    buzzerStatus: String,
    buttonStatus: String,
    esp1Status: { type: String, default: 'ONLINE' },
    esp2Status: { type: String, default: 'ONLINE' },
    gatewayStatus: { type: String, default: 'ONLINE' }
  },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
