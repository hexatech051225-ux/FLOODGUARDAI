import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ClientDataStore } from '../utils/clientSimulator.js';
import { initialStations, initialAlerts, initialResponseLogs } from '../services/seedData.js';

const FloodDataContext = createContext();

export const FloodDataProvider = ({ children }) => {
  const [stations, setStations] = useState(initialStations);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [responseLogs, setResponseLogs] = useState(initialResponseLogs);
  const [scenario, setScenarioState] = useState('NORMAL');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState('CONNECTING'); // 'BACKEND_SOCKET' | 'STANDALONE_SIMULATOR'
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const socketRef = useRef(null);
  const fallbackStoreRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Play synthetic alarm chime using Web Audio API
  const playAlertChime = (severity = 'CRITICAL') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(severity === 'CRITICAL' ? 440 : 880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio chime suppressed by browser policy:', e);
    }
  };

  useEffect(() => {
    let socketConnected = false;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl) {
      axios.defaults.baseURL = apiUrl;
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If on Netlify / production without a backend URL specified, start standalone simulation immediately
    if (!isLocalhost && !apiUrl) {
      initFallbackSimulator();
      return () => {
        if (fallbackStoreRef.current) fallbackStoreRef.current.stop();
      };
    }

    // 1. Attempt to connect to backend Socket.IO (Local development or when VITE_API_URL is configured)
    try {
      const socket = io(apiUrl || undefined, {
        reconnectionAttempts: 2,
        timeout: 2500,
        transports: ['websocket', 'polling']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socketConnected = true;
        setIsLiveConnected(true);
        setConnectionMode('BACKEND_SOCKET');
        console.log('[FloodGuard AI] Live WebSocket connected to backend engine');
      });

      socket.on('telemetry:init', (data) => {
        if (data.stations) setStations(data.stations);
        if (data.alerts) setAlerts(data.alerts);
        if (data.logs) setResponseLogs(data.logs);
        if (data.scenario) setScenarioState(data.scenario);
      });

      socket.on('telemetry:update', (data) => {
        if (data.stations) {
          setStations(data.stations);
          setLastUpdate(data.timestamp || new Date().toISOString());
        }
      });

      socket.on('alert:new', (newAlert) => {
        setAlerts(prev => {
          const exists = prev.some(a => a.id === newAlert.id);
          if (exists) return prev;
          return [newAlert, ...prev];
        });
        if (newAlert.severity === 'CRITICAL' || newAlert.severity === 'HIGH RISK') {
          playAlertChime(newAlert.severity);
        }
      });

      socket.on('alert:updated', (updatedAlert) => {
        setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
      });

      socket.on('log:new', (newLog) => {
        setResponseLogs(prev => [newLog, ...prev]);
      });

      socket.on('scenario:changed', (data) => {
        setScenarioState(data.scenario);
      });

      socket.on('connect_error', () => {
        if (!socketConnected) {
          initFallbackSimulator();
        }
      });
    } catch (err) {
      initFallbackSimulator();
    }

    // Initialize standalone in-browser simulator if backend is offline or on Netlify
    function initFallbackSimulator() {
      if (fallbackStoreRef.current) return;
      console.log('[FloodGuard AI] Running in Standalone Hybrid Client Simulation Mode');
      setConnectionMode('STANDALONE_SIMULATOR');
      setIsLiveConnected(true);

      const store = new ClientDataStore((snapshot) => {
        setStations([...snapshot.stations]);
        setAlerts([...snapshot.alerts]);
        setResponseLogs([...snapshot.responseLogs]);
        setScenarioState(snapshot.scenario);
        setLastUpdate(snapshot.timestamp);
      });
      fallbackStoreRef.current = store;
    }

    // Safety timeout in case backend takes long to respond
    const checkTimeout = setTimeout(() => {
      if (!socketConnected && !fallbackStoreRef.current) {
        initFallbackSimulator();
      }
    }, 2000);

    return () => {
      clearTimeout(checkTimeout);
      if (socketRef.current) socketRef.current.disconnect();
      if (fallbackStoreRef.current) fallbackStoreRef.current.stop();
    };
  }, []);

  // Action Handlers
  const acknowledgeAlert = async (alertId, operator = 'Municipal Officer') => {
    if (connectionMode === 'BACKEND_SOCKET') {
      try {
        await axios.patch(`/api/alerts/${alertId}/acknowledge`, { operator });
      } catch (e) {
        console.warn('Backend API failed, updating locally', e);
      }
    }
    
    // Always update local state immediately
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'ACKNOWLEDGED',
          acknowledgedBy: operator,
          acknowledgedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    if (fallbackStoreRef.current) {
      fallbackStoreRef.current.acknowledgeAlert(alertId, operator);
    }
  };

  const resolveAlert = async (alertId, operator = 'Municipal Officer') => {
    if (connectionMode === 'BACKEND_SOCKET') {
      try {
        await axios.patch(`/api/alerts/${alertId}/resolve`, { operator });
      } catch (e) {
        console.warn('Backend API failed, updating locally', e);
      }
    }

    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    if (fallbackStoreRef.current) {
      fallbackStoreRef.current.resolveAlert(alertId, operator);
    }
  };

  const logResponseAction = async (logData) => {
    if (connectionMode === 'BACKEND_SOCKET') {
      try {
        await axios.post('/api/logs', logData);
      } catch (e) {
        console.warn('Backend API failed, logging locally', e);
      }
    }

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      alertId: logData.alertId || null,
      stationId: logData.stationId,
      stationName: logData.stationName,
      actionType: logData.actionType,
      actionTitle: logData.actionTitle,
      details: logData.details,
      team: logData.team || 'Emergency Dispatch Team',
      operator: logData.operator || 'Command Dispatcher',
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };

    setResponseLogs(prev => [newLog, ...prev]);

    if (logData.alertId) {
      setAlerts(prev => prev.map(a => {
        if (a.id === logData.alertId) {
          return {
            ...a,
            responseActions: [
              ...(a.responseActions || []),
              {
                id: newLog.id,
                action: newLog.actionTitle,
                details: newLog.details,
                operator: newLog.operator,
                timestamp: newLog.timestamp
              }
            ]
          };
        }
        return a;
      }));
    }

    if (fallbackStoreRef.current) {
      fallbackStoreRef.current.addResponseLog(logData);
    }

    return newLog;
  };

  const setScenario = async (scenarioName) => {
    setScenarioState(scenarioName);
    if (connectionMode === 'BACKEND_SOCKET') {
      try {
        await axios.post('/api/telemetry/scenario', { scenario: scenarioName });
      } catch (e) {
        console.warn('Backend scenario trigger failed', e);
      }
    }
    if (fallbackStoreRef.current) {
      fallbackStoreRef.current.setScenario(scenarioName);
    }
  };

  const getStationHistory = async (stationId) => {
    if (connectionMode === 'BACKEND_SOCKET') {
      try {
        const res = await axios.get(`/api/stations/${stationId}/history`);
        if (res.data?.success && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch (e) {
        // Fallback
      }
    }
    if (fallbackStoreRef.current) {
      return fallbackStoreRef.current.getStationHistory(stationId);
    }
    // Generate synthetic history if not available
    const station = stations.find(s => s.id === stationId);
    const baseLevel = station?.currentTelemetry?.waterLevel || 2.5;
    return Array.from({ length: 24 }).map((_, i) => ({
      timestamp: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
      waterLevel: Number((baseLevel + Math.sin(i / 3) * 0.4).toFixed(2)),
      rainfallIntensity: Number((10 + Math.cos(i / 2) * 8).toFixed(1)),
      flowVelocity: Number((2.0 + Math.sin(i / 4) * 0.6).toFixed(2)),
      drainageDischarge: Number((45 + Math.sin(i / 4) * 15).toFixed(1)),
      riskScore: Math.min(100, Math.max(10, Math.round(40 + Math.sin(i / 3) * 30)))
    }));
  };

  return (
    <FloodDataContext.Provider
      value={{
        stations,
        alerts,
        responseLogs,
        scenario,
        selectedStation,
        setSelectedStation,
        isLiveConnected,
        connectionMode,
        lastUpdate,
        soundEnabled,
        setSoundEnabled,
        acknowledgeAlert,
        resolveAlert,
        logResponseAction,
        setScenario,
        getStationHistory,
        playAlertChime
      }}
    >
      {children}
    </FloodDataContext.Provider>
  );
};

export const useFloodData = () => useContext(FloodDataContext);
