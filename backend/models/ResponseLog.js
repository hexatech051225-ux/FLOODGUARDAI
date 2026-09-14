import mongoose from 'mongoose';

const responseLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  alertId: { type: String, default: null },
  stationId: { type: String, required: true },
  stationName: { type: String, required: true },
  actionType: {
    type: String,
    enum: [
      'BARRIER_DEPLOYMENT',
      'PUMP_ACTIVATION',
      'SANDBAG_DISPATCH',
      'TRAFFIC_DIVERSION',
      'PUBLIC_EVACUATION_WARNING',
      'DEBRIS_CLEARANCE',
      'ROUTINE_INSPECTION',
      'SENSOR_CALIBRATION',
      'MANUAL_OVERRIDE'
    ],
    default: 'BARRIER_DEPLOYMENT'
  },
  actionTitle: { type: String, required: true },
  details: { type: String, required: true },
  team: { type: String, default: 'Municipal Emergency Team' },
  operator: { type: String, required: true },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const ResponseLog = mongoose.model('ResponseLog', responseLogSchema);
