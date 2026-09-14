import express from 'express';

const DEMO_USERS = [
  {
    id: "USR-001",
    email: "officer.vance@floodguard.gov",
    name: "Officer D. Vance",
    role: "Municipal Flood Commander",
    agency: "Municipal Emergency Operations Center",
    badge: "EOC-COMMAND-01",
    permissions: ["ack_alerts", "log_actions", "trigger_barriers", "export_reports", "manage_stations"]
  },
  {
    id: "USR-002",
    email: "engineer.chen@floodguard.gov",
    name: "Supervisor R. Chen",
    role: "Field Hydrology Engineer",
    agency: "Municipal Drainage & Pump Operations",
    badge: "FIELD-ENG-08",
    permissions: ["ack_alerts", "log_actions", "manage_devices", "calibrate_sensors"]
  },
  {
    id: "USR-003",
    email: "dispatcher@floodguard.gov",
    name: "Public Safety Dispatcher",
    role: "Emergency Dispatcher",
    agency: "Civil Defense Dispatch",
    badge: "DISPATCH-11",
    permissions: ["ack_alerts", "log_actions", "view_live_gis"]
  },
  {
    id: "USR-004",
    email: "admin@floodguard.gov",
    name: "System Administrator",
    role: "Super Admin",
    agency: "FloodGuard AI Infrastructure",
    badge: "ROOT-ADMIN",
    permissions: ["*"]
  }
];

export const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  // For MVP / Demo, allow direct email match or fallback to default officer
  let matchedUser = DEMO_USERS.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!matchedUser) {
    matchedUser = DEMO_USERS[0]; // Default to Officer D. Vance
  }

  res.json({
    success: true,
    message: `Authenticated as ${matchedUser.name} (${matchedUser.role})`,
    user: matchedUser,
    token: `floodguard-jwt-${matchedUser.id}-${Date.now()}`
  });
});

authRouter.get('/users/presets', (req, res) => {
  res.json({
    success: true,
    data: DEMO_USERS.map(({ id, email, name, role, agency, badge }) => ({
      id, email, name, role, agency, badge
    }))
  });
});
