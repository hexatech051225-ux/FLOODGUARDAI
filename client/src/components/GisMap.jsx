import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  CloudRain, 
  ArrowRight,
  ShieldCheck,
  Radio,
  Search,
  Filter,
  Home,
  Waves,
  Activity,
  Maximize2
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { RISK_LEVELS, STATION_TYPES } from '../utils/constants';
import { formatWaterLevel, formatRateOfRise, formatRainfall } from '../utils/formatters';

// Custom Leaflet DivIcon generator for telemetry stations
const createCustomIcon = (station) => {
  const riskLevel = station.riskAnalysis?.riskLevel || 'SAFE';
  let bgColor = '#10B981';
  let pulseClass = '';
  let badgeColor = 'bg-emerald-500';

  if (riskLevel === 'CRITICAL') {
    bgColor = '#EF4444';
    pulseClass = 'pulse-marker-critical';
    badgeColor = 'bg-rose-500';
  } else if (riskLevel === 'HIGH RISK') {
    bgColor = '#F97316';
    pulseClass = 'pulse-marker-high';
    badgeColor = 'bg-orange-500';
  } else if (riskLevel === 'WATCH') {
    bgColor = '#F59E0B';
    badgeColor = 'bg-amber-500';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-9 h-9 rounded-full ${pulseClass} flex items-center justify-center shadow-xl border-2 border-slate-900" style="background-color: ${bgColor};">
        <span class="text-[11px] font-mono font-bold text-white leading-none">
          ${station.currentTelemetry?.waterLevel?.toFixed(1) || '0'}m
        </span>
      </div>
      <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-900 ${badgeColor}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-flood-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Custom icon for emergency relief shelters
const createShelterIcon = (shelter) => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl border-2 border-slate-900 text-white font-bold text-xs">
        🏛️
      </div>
      <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 ${
        shelter.status === 'OPEN' ? 'bg-emerald-400' : 'bg-amber-400'
      }"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-shelter-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Krishna River network polyline path through Vijayawada
const riverChannelPath = [
  [16.5750, 80.5200], // Ferry / Ibrahimpatnam upstream
  [16.5652, 80.5348], // ST-001 Upstream Krishna Basin (Ferry Ghat)
  [16.5400, 80.5650], // Bhavanipuram approach
  [16.5180, 80.5880], // Bhavani Island
  [16.5075, 80.6065], // ST-002 Prakasam Barrage
  [16.5050, 80.6220], // ST-006 Ryves & Bandar Delta Canal Head Sluices
  [16.4980, 80.6350], // Krishnalanka riverfront retaining wall
  [16.4850, 80.6600], // Downstream Krishna riverbed
  [16.4700, 80.6900]  // Delta outflow towards Bay of Bengal
];

// Vijayawada Inundation Hazard Flood Plains (Multi-Polygon Overlays)
const INUNDATION_ZONES = [
  {
    id: 'ZONE-A',
    name: 'Zone 1: Ajit Singh Nagar & Payakapuram',
    severity: 'CRITICAL',
    color: '#EF4444',
    fillOpacity: 0.28,
    projectedDepth: '2.4m - 3.2m Inundation Depth',
    riskDescription: 'Budameru Diversion Channel surcharge & breach catchment',
    coordinates: [
      [16.5560, 80.6280],
      [16.5590, 80.6480],
      [16.5380, 80.6580],
      [16.5310, 80.6350]
    ]
  },
  {
    id: 'ZONE-B',
    name: 'Zone 2: Krishnalanka & Ranigari Thota',
    severity: 'HIGH RISK',
    color: '#F97316',
    fillOpacity: 0.22,
    projectedDepth: '1.2m - 1.8m Inundation Depth',
    riskDescription: 'Prakasam Barrage tailrace backwater & low-lying embankment plain',
    coordinates: [
      [16.5090, 80.6120],
      [16.4960, 80.6420],
      [16.4880, 80.6350],
      [16.5020, 80.6080]
    ]
  },
  {
    id: 'ZONE-C',
    name: 'Zone 3: Bhavanipuram & Eluru Canal Corridor',
    severity: 'WATCH',
    color: '#F59E0B',
    fillOpacity: 0.18,
    projectedDepth: '0.6m - 1.0m Inundation Depth',
    riskDescription: 'Canal bank seepage & highway underpass backflow',
    coordinates: [
      [16.5280, 80.5750],
      [16.5350, 80.6120],
      [16.5200, 80.6160],
      [16.5140, 80.5780]
    ]
  }
];

// Designated Emergency Relief Shelters & Rescue Camps
const RELIEF_SHELTERS = [
  {
    id: 'SHL-01',
    name: 'Indira Gandhi Municipal Stadium',
    location: 'Labbipet, MG Road',
    coordinates: [16.5020, 80.6380],
    capacity: 3500,
    currentOccupancy: 820,
    status: 'OPEN',
    medicalTeam: 'Team Alpha (4 Doctors, 8 Nurses)',
    foodRations: '5 Days Supply Stocked',
    contact: '+91 866-2428911'
  },
  {
    id: 'SHL-02',
    name: 'Andhra Loyola College Campus',
    location: 'Loyola Gardens, Vijayawada',
    coordinates: [16.5070, 80.6520],
    capacity: 2800,
    currentOccupancy: 340,
    status: 'OPEN',
    medicalTeam: 'Team Beta (2 Doctors, 4 Nurses)',
    foodRations: '4 Days Supply Stocked',
    contact: '+91 866-2476082'
  },
  {
    id: 'SHL-03',
    name: 'Siddhartha Academy Grounds',
    location: 'Moghalrajpuram',
    coordinates: [16.4980, 80.6560],
    capacity: 2200,
    currentOccupancy: 0,
    status: 'STANDBY',
    medicalTeam: 'Disaster Cell on Standby',
    foodRations: 'Emergency Kits Pre-Staged',
    contact: '+91 866-2479781'
  },
  {
    id: 'SHL-04',
    name: 'Bishop Azariah School Shelter',
    location: 'Governorpet, Vijayawada',
    coordinates: [16.5180, 80.6300],
    capacity: 1500,
    currentOccupancy: 0,
    status: 'STANDBY',
    medicalTeam: 'District Medical Officer Assisting',
    foodRations: 'Prepared for Intake',
    contact: '+91 866-2571234'
  }
];

export const GisMap = ({ onOpenStationDetail, onOpenResponseLog }) => {
  const { stations, selectedStation, setSelectedStation } = useFloodData();
  const [mapLayer, setMapLayer] = useState('dark'); // 'dark' | 'satellite' | 'streets'
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showRiverPath, setShowRiverPath] = useState(true);
  const [showInundationPlains, setShowInundationPlains] = useState(true);
  const [showReliefShelters, setShowReliefShelters] = useState(true);
  const [showDopplerRadar, setShowDopplerRadar] = useState(true);

  // Search & Type Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const defaultCenter = [16.5150, 80.6200];

  const tileUrls = {
    dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const tileAttributions = {
    dark: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
  };

  // Filter stations based on search & category
  const filteredStations = stations.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Left: Map Toolbar & Layer Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-slate-900/95 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl shadow-xl max-w-[95%]">
        <div className="flex items-center space-x-2 px-2 border-r border-slate-700">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Vijayawada GIS Basin</span>
        </div>

        {/* Map Layers */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMapLayer('dark')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              mapLayer === 'dark' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Command Center HUD"
          >
            Dark HUD
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              mapLayer === 'satellite' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ArcGIS Satellite Imagery"
          >
            Satellite
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
          <button
            onClick={() => setShowInundationPlains(!showInundationPlains)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              showInundationPlains ? 'bg-rose-950 text-rose-300 border border-rose-600/40 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Low-Lying Inundation Plains"
          >
            Flood Plains: {showInundationPlains ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowReliefShelters(!showReliefShelters)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              showReliefShelters ? 'bg-indigo-950 text-indigo-300 border border-indigo-600/40 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Emergency Evacuation Shelters"
          >
            Shelters ({RELIEF_SHELTERS.length})
          </button>
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              showHazardZones ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Radii
          </button>
          <button
            onClick={() => setShowRiverPath(!showRiverPath)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              showRiverPath ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Krishna Arterial
          </button>
        </div>
      </div>

      {/* Top Right: Prakasam Barrage Live 70-Gate Status HUD */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur border border-cyan-500/40 p-2.5 rounded-xl text-xs space-y-1 shadow-2xl max-w-xs hidden md:block">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="font-bold text-slate-100 flex items-center space-x-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prakasam Barrage Status</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">
            SPILLWAY ALERT
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Discharge:</span>
            <span className="font-mono font-extrabold text-cyan-300">465,000 Cusecs</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Gates Open:</span>
            <span className="font-mono font-extrabold text-white">70 / 70 Gates (6.5 ft)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Reservoir Level:</span>
            <span className="font-mono text-emerald-400 font-bold">12.0 ft (FRL: 12.0 ft)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tailrace Velocity:</span>
            <span className="font-mono text-amber-300 font-bold">3.60 m/s</span>
          </div>
        </div>
      </div>

      {/* Bottom Left: Station Search & Category Filter Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center space-x-2 bg-slate-900/95 backdrop-blur border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
          <input
            type="text"
            placeholder="Search Vijayawada gauge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-slate-200 text-xs w-44 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Types ({stations.length})</option>
          <option value="RIVER">River Basins</option>
          <option value="DRAIN">Storm Drains / BDC</option>
          <option value="CANAL">Irrigation Canals</option>
          <option value="UNDERPASS">Underpass Sumps</option>
          <option value="ESTUARY">Sluice Gates</option>
        </select>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur border border-slate-700/80 p-2.5 rounded-xl text-xs space-y-1.5 shadow-xl hidden lg:block">
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>Hydrologic GIS Legend</span>
          <span className="text-cyan-400 font-normal">VMC EOC</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-300 text-[11px]">Safe Level (Nominal)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300 text-[11px]">Watch Advisory (Rising)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-300 text-[11px]">High Risk (Pre-Crest)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-rose-300 text-[11px] font-semibold">Critical Breach Surge</span>
        </div>
        <div className="flex items-center space-x-2 pt-1 border-t border-slate-800">
          <span className="w-3 h-2 rounded bg-rose-500/40 border border-rose-500" />
          <span className="text-slate-400 text-[10px]">Inundation Flood Plain</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">🏛️</span>
          <span className="text-slate-400 text-[10px]">Designated Relief Shelter</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        key={mapLayer}
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className={`w-full h-full ${mapLayer === 'dark' ? 'dark-hud-map' : ''}`}
      >
        <TileLayer
          attribution={tileAttributions[mapLayer]}
          url={tileUrls[mapLayer]}
        />

        {/* Krishna River Hydrological Flowline */}
        {showRiverPath && (
          <Polyline
            positions={riverChannelPath}
            pathOptions={{
              color: '#06B6D4',
              weight: 5,
              opacity: 0.75,
              dashArray: '8, 8'
            }}
          >
            <Tooltip sticky>Krishna River Main Arterial & Prakasam Spillway Corridor</Tooltip>
          </Polyline>
        )}

        {/* Inundation Flood Plain Polygons */}
        {showInundationPlains && INUNDATION_ZONES.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: zone.fillOpacity,
              weight: 2,
              dashArray: '4, 4'
            }}
          >
            <Tooltip sticky>
              <div className="font-mono text-xs">
                <strong className="block text-rose-300 font-bold">{zone.name}</strong>
                <span className="text-slate-300 block">{zone.projectedDepth}</span>
                <span className="text-slate-400 text-[10px] block">{zone.riskDescription}</span>
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Emergency Relief Camps & Rescue Shelters */}
        {showReliefShelters && RELIEF_SHELTERS.map((shelter) => (
          <Marker
            key={shelter.id}
            position={shelter.coordinates}
            icon={createShelterIcon(shelter)}
          >
            <Popup className="custom-flood-popup min-w-[260px]">
              <div className="p-1 space-y-2 text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">
                      {shelter.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-100 mt-0.5">{shelter.name}</h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    shelter.status === 'OPEN' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {shelter.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">{shelter.location}</p>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Shelter Capacity:</span>
                    <span className="font-mono font-bold text-white">{shelter.capacity} persons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <span className="font-mono font-bold text-cyan-300">{shelter.currentOccupancy} evacuees</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Medical Wing:</span>
                    <span className="font-mono text-emerald-400 text-[10px]">{shelter.medicalTeam}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Relief Rations:</span>
                    <span className="font-mono text-amber-300 text-[10px]">{shelter.foodRations}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-cyan-400 text-right">
                  Helpline: {shelter.contact}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Stations & Dynamic Hazard Inundation Buffers */}
        {filteredStations.map((station) => {
          const riskLevel = station.riskAnalysis?.riskLevel || 'SAFE';
          let circleColor = '#10B981';
          let radius = 600;

          if (riskLevel === 'CRITICAL') {
            circleColor = '#EF4444';
            radius = 1200;
          } else if (riskLevel === 'HIGH RISK') {
            circleColor = '#F97316';
            radius = 900;
          } else if (riskLevel === 'WATCH') {
            circleColor = '#F59E0B';
            radius = 750;
          }

          const icon = createCustomIcon(station);

          return (
            <React.Fragment key={station.id}>
              {/* Dynamic Flood Hazard Inundation Radius */}
              {showHazardZones && (
                <Circle
                  center={[station.coordinates.lat, station.coordinates.lng]}
                  radius={radius}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: riskLevel === 'CRITICAL' ? 0.25 : 0.12,
                    weight: riskLevel === 'CRITICAL' ? 2 : 1
                  }}
                />
              )}

              {/* Station Marker Pin */}
              <Marker
                position={[station.coordinates.lat, station.coordinates.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedStation(station);
                  }
                }}
              >
                <Popup className="custom-flood-popup min-w-[260px]">
                  <div className="p-1 space-y-2 text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {station.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100 mt-1 leading-tight">{station.name}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${RISK_LEVELS[riskLevel.replace(' ', '_')]?.badgeClass || 'bg-slate-800 text-slate-300'}`}>
                        {riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{station.location}</p>

                    {/* Hydrological Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Water Level</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {formatWaterLevel(station.currentTelemetry?.waterLevel)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ({station.currentTelemetry?.waterLevelPercentage?.toFixed(0)}% Cap)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Rate of Rise</span>
                        <span className={`font-mono font-bold ${
                          station.currentTelemetry?.rateOfRise > 10 ? 'text-rose-400' : 'text-slate-200'
                        }`}>
                          {formatRateOfRise(station.currentTelemetry?.rateOfRise)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Precipitation</span>
                        <span className="font-mono text-sky-300">
                          {formatRainfall(station.currentTelemetry?.rainfallIntensity)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">AI Risk Score</span>
                        <span className="font-mono font-bold text-white">
                          {station.riskAnalysis?.riskScore || 0} / 100
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => onOpenStationDetail && onOpenStationDetail(station)}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-1.5 px-2 rounded-lg text-xs flex items-center justify-center space-x-1 transition shadow"
                      >
                        <span>Deep-Dive</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onOpenResponseLog && onOpenResponseLog(station)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-2.5 rounded-lg text-xs transition border border-slate-700"
                        title="Log Incident Response Action"
                      >
                        Log Action
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
