export const initialStations = [
  {
    id: "ST-001",
    name: "Krishna Basin - Ferry Ghat",
    code: "ST-001",
    type: "RIVER",
    location: "Ibrahimpatnam / Ferry Ghat Upstream Basin",
    coordinates: { lat: 16.5652, lng: 80.5348 },
    elevation: 27.4,
    drainageAreaKm2: 251400.0,
    dangerThresholds: {
      safe: 1.8,
      warning: 2.8,
      highRisk: 3.8,
      critical: 4.6,
      maxCapacity: 5.2
    },
    currentTelemetry: {
      waterLevel: 2.45,
      waterLevelPercentage: 47.1,
      rateOfRise: 4.2, // cm/h
      rateOfRiseDirection: "rising",
      rainfallIntensity: 12.5, // mm/h
      rainfall24h: 38.0,
      flowVelocity: 1.65, // m/s
      drainageDischarge: 24.8, // m3/s
      waterTemperature: 24.5,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-01",
      protocol: "MQTT / LoRaWAN",
      batteryPercentage: 92,
      batteryVoltage: 4.14,
      solarStatus: "CHARGING",
      solarVoltage: 5.6,
      signalRssi: -64,
      packetLoss: 0.05,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "WATCH",
      riskScore: 42,
      factors: [
        "Upstream inflow from Pulichintala / Nagarjuna Sagar",
        "Steady rate of rise (+4.2 cm/h) at Ibrahimpatnam gauge",
        "Broad river corridor buffering upstream surge velocity"
      ],
      anomalies: [],
      predictedCrestTime: "4.5 hours",
      predictedCrestLevel: 3.15,
      confidence: 91,
      aiRecommendation: "Maintain standard 15-minute telemetry interval. Coordinate discharge projections with Pulichintala reservoir."
    }
  },
  {
    id: "ST-002",
    name: "Prakasam Barrage & Krishnalanka",
    code: "ST-002",
    type: "RIVER",
    location: "Prakasam Barrage & Bhavani Island Riverfront",
    coordinates: { lat: 16.5075, lng: 80.6065 },
    elevation: 21.2,
    drainageAreaKm2: 251800.0,
    dangerThresholds: {
      safe: 2.0,
      warning: 3.2,
      highRisk: 4.2,
      critical: 5.0,
      maxCapacity: 5.8
    },
    currentTelemetry: {
      waterLevel: 4.35,
      waterLevelPercentage: 75.0,
      rateOfRise: 14.8, // cm/h
      rateOfRiseDirection: "rising_fast",
      rainfallIntensity: 34.0, // mm/h
      rainfall24h: 76.5,
      flowVelocity: 3.20, // m/s
      drainageDischarge: 88.4, // m3/s
      waterTemperature: 25.1,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-02",
      protocol: "HTTPS / 4G LTE",
      batteryPercentage: 84,
      batteryVoltage: 3.98,
      solarStatus: "DISCHARGING",
      solarVoltage: 2.1,
      signalRssi: -72,
      packetLoss: 0.12,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "HIGH RISK",
      riskScore: 84,
      factors: [
        "Rapid rate of rise (+14.8 cm/hr) approaching barrage crest limit",
        "Heavy monsoon precipitation over Krishna delta (34 mm/hr)",
        "Spillway backwater pressure along Krishnalanka flood retaining wall"
      ],
      anomalies: [
        {
          type: "SURGE_ANOMALY",
          severity: "HIGH",
          message: "Water level acceleration exceeded historical 98th percentile"
        }
      ],
      predictedCrestTime: "1.8 hours",
      predictedCrestLevel: 4.88,
      confidence: 94,
      aiRecommendation: "Regulate Prakasam Barrage 70 spillway gates. Issue Phase 2 alert to Krishnalanka and Ranigari Thota low-lying sectors."
    }
  },
  {
    id: "ST-003",
    name: "Budameru Diversion Channel (BDC)",
    code: "ST-003",
    type: "DRAIN",
    location: "Ajit Singh Nagar & Ambapuram Regulator",
    coordinates: { lat: 16.5420, lng: 80.6380 },
    elevation: 24.5,
    drainageAreaKm2: 48.6,
    dangerThresholds: {
      safe: 1.2,
      warning: 1.8,
      highRisk: 2.4,
      critical: 2.9,
      maxCapacity: 3.2
    },
    currentTelemetry: {
      waterLevel: 2.98,
      waterLevelPercentage: 93.1,
      rateOfRise: 22.5, // cm/h
      rateOfRiseDirection: "rising_fast",
      rainfallIntensity: 48.0, // mm/h
      rainfall24h: 89.2,
      flowVelocity: 4.10, // m/s
      drainageDischarge: 42.0, // m3/s
      waterTemperature: 25.8,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-01",
      protocol: "MQTT / LoRaWAN",
      batteryPercentage: 76,
      batteryVoltage: 3.89,
      solarStatus: "DISCHARGING",
      solarVoltage: 1.4,
      signalRssi: -81,
      packetLoss: 0.45,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "CRITICAL",
      riskScore: 96,
      factors: [
        "Budameru hydraulic capacity at 93.1% (Imminent urban street surcharge)",
        "Extreme runoff velocity from Velagaleru regulator (4.1 m/s)",
        "Ajit Singh Nagar & Payakapuram storm drain intake saturation"
      ],
      anomalies: [
        {
          type: "THRESHOLD_BREACH",
          severity: "CRITICAL",
          message: "Water level breached 2.9m critical embankment freeboard"
        },
        {
          type: "DEBRIS_RESTRICTION",
          severity: "MEDIUM",
          message: "Flow resistance elevated by 28% indicative of water hyacinth / silt blockage at Ambapuram regulator"
        }
      ],
      predictedCrestTime: "35 minutes",
      predictedCrestLevel: 3.18,
      confidence: 96,
      aiRecommendation: "Activate high-capacity emergency dewatering pumps in Ajit Singh Nagar. Dispatch SDRF flood response units & excavator debris clearing teams."
    }
  },
  {
    id: "ST-004",
    name: "Eluru Canal Urban Corridor",
    code: "ST-004",
    type: "CANAL",
    location: "Gunadala - Ramavarappadu Aqueduct",
    coordinates: { lat: 16.5220, lng: 80.6650 },
    elevation: 20.0,
    drainageAreaKm2: 35.2,
    dangerThresholds: {
      safe: 1.5,
      warning: 2.5,
      highRisk: 3.5,
      critical: 4.2,
      maxCapacity: 4.8
    },
    currentTelemetry: {
      waterLevel: 1.65,
      waterLevelPercentage: 34.3,
      rateOfRise: 1.1,
      rateOfRiseDirection: "stable",
      rainfallIntensity: 6.0,
      rainfall24h: 21.0,
      flowVelocity: 1.10,
      drainageDischarge: 14.5,
      waterTemperature: 24.8,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-03",
      protocol: "MQTT / LoRaWAN",
      batteryPercentage: 98,
      batteryVoltage: 4.21,
      solarStatus: "CHARGING",
      solarVoltage: 5.9,
      signalRssi: -58,
      packetLoss: 0.01,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "SAFE",
      riskScore: 18,
      factors: [
        "Normal Eluru canal irrigation gradient",
        "Stable hydrologic flow past Gunadala",
        "Ample freeboard capacity remaining"
      ],
      anomalies: [],
      predictedCrestTime: "N/A (Stable)",
      predictedCrestLevel: 1.85,
      confidence: 98,
      aiRecommendation: "All parameters nominal. Standard automated polling active."
    }
  },
  {
    id: "ST-005",
    name: "Benz Circle Underpass & Sump",
    code: "ST-005",
    type: "UNDERPASS",
    location: "Benz Circle - NH16 Flyover Junction",
    coordinates: { lat: 16.4990, lng: 80.6520 },
    elevation: 18.2,
    dangerThresholds: {
      safe: 0.3,
      warning: 0.7,
      highRisk: 1.2,
      critical: 1.6,
      maxCapacity: 2.0
    },
    currentTelemetry: {
      waterLevel: 0.85,
      waterLevelPercentage: 42.5,
      rateOfRise: 6.8,
      rateOfRiseDirection: "rising",
      rainfallIntensity: 22.0,
      rainfall24h: 51.2,
      flowVelocity: 1.95,
      drainageDischarge: 16.2,
      waterTemperature: 25.5,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-02",
      protocol: "HTTPS / 4G LTE",
      batteryPercentage: 90,
      batteryVoltage: 4.09,
      solarStatus: "CHARGING",
      solarVoltage: 5.2,
      signalRssi: -69,
      packetLoss: 0.08,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "WATCH",
      riskScore: 56,
      factors: [
        "Sub-surface storm sump accumulation rising",
        "NH16 underpass vehicular clearance safe (1.15m remaining)",
        "Benz Circle sump pump #4 engaged at 60% duty cycle"
      ],
      anomalies: [],
      predictedCrestTime: "2.2 hours",
      predictedCrestLevel: 1.15,
      confidence: 89,
      aiRecommendation: "Verify automated traffic signal detour triggers. Stand by for lane closure if water level reaches 1.2m."
    }
  },
  {
    id: "ST-006",
    name: "Ryves & Bandar Delta Canal Sluices",
    code: "ST-006",
    type: "ESTUARY",
    location: "Governorpet Delta Canal Head Regulators",
    coordinates: { lat: 16.5050, lng: 80.6220 },
    elevation: 19.5,
    dangerThresholds: {
      safe: 2.2,
      warning: 3.5,
      highRisk: 4.6,
      critical: 5.4,
      maxCapacity: 6.0
    },
    currentTelemetry: {
      waterLevel: 3.10,
      waterLevelPercentage: 51.6,
      rateOfRise: -2.4, // cm/h
      rateOfRiseDirection: "falling",
      rainfallIntensity: 8.0,
      rainfall24h: 29.0,
      flowVelocity: 2.80,
      drainageDischarge: 65.0,
      waterTemperature: 25.2,
      timestamp: new Date().toISOString()
    },
    deviceHealth: {
      esp32Status: "ONLINE",
      gatewayId: "RPI-GW-03",
      protocol: "MQTT / LoRaWAN",
      batteryPercentage: 94,
      batteryVoltage: 4.16,
      solarStatus: "CHARGING",
      solarVoltage: 5.7,
      signalRssi: -62,
      packetLoss: 0.02,
      firmwareVersion: "v2.4.2-esp32-flood",
      lastPing: new Date().toISOString()
    },
    riskAnalysis: {
      riskLevel: "SAFE",
      riskScore: 24,
      factors: [
        "Delta canal head locks discharging steadily into eastern irrigation network",
        "Sluice gates 1-4 open at 80% capacity",
        "Negative rate of rise (-2.4 cm/hr)"
      ],
      anomalies: [],
      predictedCrestTime: "Outflow stabilized",
      predictedCrestLevel: 2.40,
      confidence: 95,
      aiRecommendation: "Maintain regulated canal outflow throughput to maximize municipal retention buffer for inland Vijayawada runoff."
    }
  }
];

export const initialAlerts = [
  {
    id: "ALT-2026-0891",
    stationId: "ST-003",
    stationName: "Budameru Diversion Channel (BDC)",
    severity: "CRITICAL",
    title: "Critical Budameru Flash Flood Freeboard Breach",
    description: "Water level reached 2.98m (93.1% max retention capacity). Surge rate +22.5 cm/h with intense downpour over Ajit Singh Nagar.",
    category: "WATER_LEVEL_CRITICAL",
    status: "ACTIVE",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    acknowledgedBy: null,
    acknowledgedAt: null,
    responseActions: []
  },
  {
    id: "ALT-2026-0890",
    stationId: "ST-002",
    stationName: "Prakasam Barrage & Krishnalanka",
    severity: "HIGH RISK",
    title: "Krishna River Surge & Retaining Wall Inundation Risk",
    description: "Water level at 4.35m with +14.8 cm/hr surge. Krishnalanka riverfront inundation projected in 1.8 hours.",
    category: "RATE_OF_RISE_ALARM",
    status: "ACKNOWLEDGED",
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    acknowledgedBy: "Officer D. Vance (Municipal Dispatch)",
    acknowledgedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    responseActions: [
      {
        id: "ACT-01",
        action: "Krishnalanka Barrier & Barrage Spillway Alert",
        details: "Prakasam Barrage spillway discharge coordinated. Mobile sandbagging crews deployed to Krishnalanka Sector 4.",
        operator: "Officer D. Vance",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "ALT-2026-0888",
    stationId: "ST-005",
    stationName: "Benz Circle Underpass & Sump",
    severity: "WATCH",
    title: "Benz Circle Underpass Inflow Advisory",
    description: "Water level rose past 0.85m. Rain intensity sustained at 22mm/h.",
    category: "WATCH_ADVISORY",
    status: "RESOLVED",
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    acknowledgedBy: "Supervisor R. Chen",
    acknowledgedAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    responseActions: [
      {
        id: "ACT-02",
        action: "Auxiliary Heavy-Duty Pump Activation",
        details: "Benz Circle drainage pump #4 spun up to 100% capacity. Water diverted into Bandar canal corridor.",
        operator: "Supervisor R. Chen",
        timestamp: new Date(Date.now() - 128 * 60 * 1000).toISOString()
      }
    ]
  }
];

export const initialResponseLogs = [
  {
    id: "LOG-5510",
    alertId: "ALT-2026-0890",
    stationId: "ST-002",
    stationName: "Prakasam Barrage & Krishnalanka",
    actionType: "BARRIER_DEPLOYMENT",
    actionTitle: "Prakasam Barrage Spillway Regulated & Krishnalanka Sandbagged",
    details: "Automated gates engaged to regulate Krishna river spillway. Notified VMC Transit to divert riverside pedestrian traffic at Ranigari Thota.",
    team: "Vijayawada Municipal Rapid Response Team Alpha",
    operator: "Officer D. Vance",
    status: "COMPLETED",
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString()
  },
  {
    id: "LOG-5509",
    alertId: "ALT-2026-0888",
    stationId: "ST-005",
    stationName: "Benz Circle Underpass & Sump",
    actionType: "PUMP_ACTIVATION",
    actionTitle: "Auxiliary High-Volume Dewatering Pump 04 Engaged",
    details: "Maintained water table clearance for NH16 junction underpass. Pump discharge verified at 18.5 m3/s into Bandar canal.",
    team: "VMC Storm Water Drainage Maintenance Unit 2",
    operator: "Supervisor R. Chen",
    status: "COMPLETED",
    timestamp: new Date(Date.now() - 128 * 60 * 1000).toISOString()
  },
  {
    id: "LOG-5508",
    alertId: null,
    stationId: "ST-003",
    stationName: "Budameru Diversion Channel (BDC)",
    actionType: "ROUTINE_INSPECTION",
    actionTitle: "IoT Sonar Sensor Calibration & Ambapuram Transducer Cleaned",
    details: "Dual sonar transducers inspected for silt & hyacinth build-up at Ambapuram regulator. Telemetry drift recalibrated to 0.00m reference.",
    team: "IoT Field Engineering Wing",
    operator: "Tech Lead M. Torres",
    status: "COMPLETED",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

export const historicalEvents = [
  {
    id: "EVT-2024-09",
    title: "Historic Krishna River & Budameru Cloudburst Deluge",
    date: "September 01-04, 2024",
    peakRainfall24h: 290.5,
    peakWaterLevel: 5.68,
    mostAffectedStation: "Budameru Diversion Channel (BDC)",
    maxRiskLevel: "CRITICAL",
    totalAlertsFired: 28,
    responseTimeAvgMin: 5.4,
    sandbagsDeployed: 48000,
    pumpsActivated: 42,
    outcome: "Emergency breach plugging at Budameru gates saved central municipal sectors; 11.43 lakh cusecs record discharge safely navigated at Prakasam Barrage.",
    severityIndex: 9.8
  },
  {
    id: "EVT-2023-12",
    title: "Cyclone Michaung Heavy Rain & Urban Surcharge",
    date: "December 04-06, 2023",
    peakRainfall24h: 172.0,
    peakWaterLevel: 4.82,
    mostAffectedStation: "Prakasam Barrage & Krishnalanka",
    maxRiskLevel: "CRITICAL",
    totalAlertsFired: 16,
    responseTimeAvgMin: 6.8,
    sandbagsDeployed: 12500,
    pumpsActivated: 18,
    outcome: "Automated early warning allowed traffic rerouting along MG Road and low-lying canals 45 minutes prior to surface street inundation.",
    severityIndex: 8.5
  },
  {
    id: "EVT-2020-10",
    title: "Krishna Basin Monsoon Runoff & Inflow Surge",
    date: "October 13-16, 2020",
    peakRainfall24h: 118.4,
    peakWaterLevel: 4.25,
    mostAffectedStation: "Krishna Basin - Ferry Ghat",
    maxRiskLevel: "HIGH RISK",
    totalAlertsFired: 8,
    responseTimeAvgMin: 9.5,
    sandbagsDeployed: 6500,
    pumpsActivated: 12,
    outcome: "Upstream retention reservoirs regulated discharge safely through the Prakasam Barrage and eastern delta canals.",
    severityIndex: 7.2
  }
];
