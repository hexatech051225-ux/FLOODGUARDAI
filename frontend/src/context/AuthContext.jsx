import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: "USR-001",
  email: "officer.vance@floodguard.gov",
  name: "Officer D. Vance",
  role: "Municipal Flood Commander",
  agency: "Municipal Emergency Operations Center",
  badge: "EOC-COMMAND-01",
  permissions: ["ack_alerts", "log_actions", "trigger_barriers", "export_reports", "manage_stations"]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('floodguard_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('floodguard_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('floodguard_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('floodguard_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Try backend auth endpoint
      const res = await axios.post('/api/auth/login', { email, password }).catch(() => null);
      if (res && res.data && res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('floodguard_token', res.data.token);
      } else {
        // Fallback local matching
        const presetUsers = [
          DEFAULT_USER,
          {
            id: "USR-002",
            email: "engineer.chen@floodguard.gov",
            name: "Supervisor R. Chen",
            role: "Field Hydrology Engineer",
            agency: "Municipal Drainage & Pump Operations",
            badge: "FIELD-ENG-08",
            permissions: ["ack_alerts", "log_actions", "manage_devices"]
          },
          {
            id: "USR-003",
            email: "dispatcher@floodguard.gov",
            name: "Civil Defense Dispatcher",
            role: "Emergency Dispatcher",
            agency: "Civil Defense Dispatch",
            badge: "DISPATCH-11",
            permissions: ["ack_alerts", "log_actions"]
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
        const matched = presetUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || DEFAULT_USER;
        setUser(matched);
        setToken(`local-token-${matched.id}`);
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setUser(DEFAULT_USER);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('floodguard_user');
    localStorage.removeItem('floodguard_token');
  };

  const switchRole = (presetUser) => {
    setUser(presetUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
