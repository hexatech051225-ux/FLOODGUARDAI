export const RISK_LEVELS = {
  SAFE: {
    label: 'SAFE',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    color: '#10B981',
    description: 'Water levels nominal. No flood hazard detected.'
  },
  WATCH: {
    label: 'WATCH',
    badgeClass: 'bg-amber-950/80 text-amber-400 border border-amber-500/30',
    dotClass: 'bg-amber-500',
    color: '#F59E0B',
    description: 'Advisory threshold reached. Flow and precipitation being tracked.'
  },
  HIGH_RISK: {
    label: 'HIGH RISK',
    badgeClass: 'bg-orange-950/80 text-orange-400 border border-orange-500/30',
    dotClass: 'bg-orange-500',
    color: '#F97316',
    description: 'Approaching crest limit. Flood barriers and crews should stage.'
  },
  CRITICAL: {
    label: 'CRITICAL',
    badgeClass: 'bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse-fast',
    dotClass: 'bg-rose-500 animate-ping',
    color: '#EF4444',
    description: 'Emergency breach in progress! Immediate multi-agency deployment required.'
  }
};

export const STATION_TYPES = {
  RIVER: { label: 'River Basin', icon: 'Waves', color: '#38BDF8' },
  DRAIN: { label: 'Storm Culvert', icon: 'GitCommit', color: '#F472B6' },
  CANAL: { label: 'Drainage Canal', icon: 'Maximize2', color: '#A78BFA' },
  UNDERPASS: { label: 'Highway Underpass', icon: 'ShieldAlert', color: '#FB923C' },
  ESTUARY: { label: 'Tidal Estuary', icon: 'Anchor', color: '#34D399' }
};

export const SCENARIOS = [
  { id: 'NORMAL', label: '🌤️ Normal Weather', desc: 'Standard dry/mild conditions with nominal water levels.' },
  { id: 'HEAVY_STORM', label: '🌧️ Heavy Rain Storm', desc: 'Sustained 40mm/h downpour causing river and canal elevation.' },
  { id: 'FLASH_FLOOD', label: '⚡ Flash Flood Surge', desc: 'Sudden high-intensity cloudburst breaching urban culvert thresholds.' },
  { id: 'SENSOR_FAULT', label: '⚠️ Sensor Glitch / Fault', desc: 'Simulate LoRa packet loss and sonar drift on Station ST-003.' },
  { id: 'RECOVERY', label: '🌈 Post-Storm Drainage', desc: 'Storm recedes. Gravity discharge and auxiliary pumps lower water levels.' }
];

export const RESPONSE_ACTION_TYPES = [
  { id: 'BARRIER_DEPLOYMENT', label: 'Hydraulic Barrier Deployment', team: 'Civil Defense Rapid Team' },
  { id: 'PUMP_ACTIVATION', label: 'Auxiliary High-Volume Pump Start', team: 'Drainage & Pump Operations' },
  { id: 'SANDBAG_DISPATCH', label: 'Mobile Sandbag Reinforcement', team: 'Public Works Division' },
  { id: 'TRAFFIC_DIVERSION', label: 'Traffic & Underpass Detour Signage', team: 'Metro Police & Traffic Control' },
  { id: 'PUBLIC_EVACUATION_WARNING', label: 'Public Siren & Cell Broadcast Advisory', team: 'Emergency Operations Center' },
  { id: 'DEBRIS_CLEARANCE', label: 'Trash Grate & Culvert Clearing', team: 'Drainage Maintenance Unit' },
  { id: 'SENSOR_CALIBRATION', label: 'IoT Sensor Calibration & Hardware Inspection', team: 'Field IoT Engineering' }
];
