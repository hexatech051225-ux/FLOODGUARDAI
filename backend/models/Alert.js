import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  stationId: { type: String, required: true },
  stationName: { type: String, required: true },
  severity: { type: String, enum: ['SAFE', 'WATCH', 'HIGH RISK', 'CRITICAL'], default: 'WATCH' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'WATER_LEVEL_HIGH' },
  status: { type: String, enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE' },
  timestamp: { type: Date, default: Date.now },
  acknowledgedBy: { type: String, default: null },
  acknowledgedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  responseActions: [{
    id: String,
    action: String,
    details: String,
    operator: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Alert = mongoose.model('Alert', alertSchema);
