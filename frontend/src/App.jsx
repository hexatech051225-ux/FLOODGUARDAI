import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useFloodData } from './context/FloodDataContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewCards } from './components/OverviewCards';
import { GisMap } from './components/GisMap';
import { LiveTelemetryGrid } from './components/LiveTelemetryGrid';
import { AiRiskPanel } from './components/AiRiskPanel';
import { AlertPanel } from './components/AlertPanel';
import { ResponseLogModal } from './components/ResponseLogModal';
import { HistoricalCharts } from './components/HistoricalCharts';
import { DeviceHealthView } from './components/DeviceHealthView';
import { HistoricalEvents } from './components/HistoricalEvents';
import { StationDetailModal } from './components/StationDetailModal';
import { EvacuationBroadcastModal } from './components/EvacuationBroadcastModal';
import { IotPacketTerminal } from './components/IotPacketTerminal';
import { LiveHardwareTest } from './components/LiveHardwareTest';

export const App = () => {
  const { user } = useAuth();
  const { stations, alerts } = useFloodData();

  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals state
  const [detailStation, setDetailStation] = useState(null);
  const [responseModalData, setResponseModalData] = useState({ isOpen: false, station: null, alert: null });
  const [isEvacuationModalOpen, setIsEvacuationModalOpen] = useState(false);

  if (!user) {
    return <LoginPage onLoginSuccess={() => setActiveTab('overview')} />;
  }

  const handleOpenDetail = (station) => {
    setDetailStation(station);
  };

  const handleOpenResponseLog = (station, alert = null) => {
    setResponseModalData({
      isOpen: true,
      station: station || stations[0],
      alert
    });
  };

  const handleCloseResponseLog = () => {
    setResponseModalData({ isOpen: false, station: null, alert: null });
  };

  return (
    <div className="min-h-screen bg-[#080D18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Command Navbar */}
      <Navbar onOpenEvacuationModal={() => setIsEvacuationModalOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5">
          {/* 1. Command Center / Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              {/* KPIs & Critical Rates */}
              <OverviewCards setActiveTab={setActiveTab} />

              {/* Central 2-Column GIS & Incident Alert Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
                {/* Left GIS Map (7 cols) */}
                <div className="lg:col-span-7 h-[500px]">
                  <GisMap
                    onOpenStationDetail={handleOpenDetail}
                    onOpenResponseLog={handleOpenResponseLog}
                  />
                </div>

                {/* Right Alert & AI Quick Panel (5 cols) */}
                <div className="lg:col-span-5 h-[500px] overflow-y-auto space-y-4">
                  <AlertPanel onOpenResponseLog={handleOpenResponseLog} />
                </div>
              </div>

              {/* Live Sensor Telemetry Cards */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                    Live Basin IoT Telemetry Stream
                  </h3>
                </div>
                <LiveTelemetryGrid
                  onOpenStationDetail={handleOpenDetail}
                  onOpenResponseLog={handleOpenResponseLog}
                />
              </div>
            </div>
          )}

          {/* Live Hardware Test Tab */}
          {activeTab === 'hardware' && (
            <div className="animate-fade-in space-y-4">
              <LiveHardwareTest />
            </div>
          )}

          {/* 2. Full GIS Flood Hazard Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col animate-fade-in">
              <div className="flex-1 min-h-[520px]">
                <GisMap
                  onOpenStationDetail={handleOpenDetail}
                  onOpenResponseLog={handleOpenResponseLog}
                />
              </div>
            </div>
          )}

          {/* 3. Live Telemetry Grid Tab */}
          {activeTab === 'telemetry' && (
            <div className="animate-fade-in space-y-4">
              <LiveTelemetryGrid
                onOpenStationDetail={handleOpenDetail}
                onOpenResponseLog={handleOpenResponseLog}
              />
            </div>
          )}

          {/* 4. IoT Gateway Packet Terminal Tab */}
          {activeTab === 'packets' && (
            <div className="animate-fade-in space-y-4">
              <IotPacketTerminal />
            </div>
          )}

          {/* 5. AI Risk Assessment & Forecasting Tab */}
          {activeTab === 'ai' && (
            <div className="animate-fade-in space-y-4">
              <AiRiskPanel
                onOpenStationDetail={handleOpenDetail}
                onOpenResponseLog={handleOpenResponseLog}
              />
            </div>
          )}

          {/* 6. Alerts & Incidents Tab */}
          {activeTab === 'alerts' && (
            <div className="animate-fade-in">
              <AlertPanel onOpenResponseLog={handleOpenResponseLog} />
            </div>
          )}

          {/* 7. Response Log Tab */}
          {activeTab === 'logs' && (
            <div className="animate-fade-in">
              <HistoricalEvents />
            </div>
          )}

          {/* 8. Historical Analytics Charts Tab */}
          {activeTab === 'charts' && (
            <div className="animate-fade-in">
              <HistoricalCharts />
            </div>
          )}

          {/* 9. IoT Hardware Health Tab */}
          {activeTab === 'devices' && (
            <div className="animate-fade-in">
              <DeviceHealthView />
            </div>
          )}

          {/* 10. Historical Archive & Report Exporter Tab */}
          {activeTab === 'events' && (
            <div className="animate-fade-in">
              <HistoricalEvents />
            </div>
          )}
        </main>
      </div>

      {/* Deep-Dive Station Detail Modal */}
      {detailStation && (
        <StationDetailModal
          station={detailStation}
          onClose={() => setDetailStation(null)}
          onOpenResponseLog={(station) => {
            setDetailStation(null);
            handleOpenResponseLog(station);
          }}
        />
      )}

      {/* Emergency Response Action Logging Modal */}
      <ResponseLogModal
        isOpen={responseModalData.isOpen}
        onClose={handleCloseResponseLog}
        defaultStation={responseModalData.station}
        defaultAlert={responseModalData.alert}
      />

      {/* Civil Defense Evacuation Directive Broadcast Modal */}
      <EvacuationBroadcastModal
        isOpen={isEvacuationModalOpen}
        onClose={() => setIsEvacuationModalOpen(false)}
      />
    </div>
  );
};

export default App;
