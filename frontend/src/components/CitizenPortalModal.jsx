import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Search, 
  PhoneCall, 
  Home, 
  Users, 
  Send, 
  CheckCircle2, 
  X, 
  HeartHandshake, 
  Flame, 
  LifeBuoy,
  ChevronRight,
  Info
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';

// Locality Risk Registry for Vijayawada
const LOCALITY_DATA = [
  {
    name: 'Ajit Singh Nagar',
    riskLevel: 'CRITICAL',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-600',
    depth: '2.4m - 3.2m Estimated Inundation',
    advisory: 'MANDATORY EVACUATION: Budameru diversion channel overflowing. Proceed immediately to Indira Gandhi Stadium Shelter via NH16 flyover.',
    nearestShelter: 'Indira Gandhi Municipal Stadium (4.2 km)',
    shelterCapacity: '820 / 3,500 Occupied (2,680 Beds Available)',
    busRoute: 'VMC Emergency Bus Route #01 running every 15 mins from Pipula Junction'
  },
  {
    name: 'Krishnalanka',
    riskLevel: 'HIGH HAZARD',
    badgeColor: 'bg-orange-950 text-orange-300 border-orange-600',
    depth: '1.2m - 1.8m Inundation Near Embankment',
    advisory: 'HIGH ADVISORY: Prakasam Barrage tailrace backwater elevation. Move valuables to upper floors. Stand by for evacuation.',
    nearestShelter: 'Andhra Loyola College Campus (3.8 km)',
    shelterCapacity: '340 / 2,800 Occupied (2,460 Beds Available)',
    busRoute: 'VMC Shuttle Route #04 from Ranigari Thota Outpost'
  },
  {
    name: 'Bhavanipuram',
    riskLevel: 'WATCH ADVISORY',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-600',
    depth: '0.4m - 0.8m Localized Waterlogging',
    advisory: 'WATERLOGGING: Eluru Canal seepage and underpass backflow. Avoid low-lying underpasses and open drains.',
    nearestShelter: 'Siddhartha Academy Grounds (5.1 km)',
    shelterCapacity: '0 / 2,200 Occupied (2,200 Beds Available - Standby)',
    busRoute: 'Gollapudi Bypass Corridor Clear'
  },
  {
    name: 'Labbipet & MG Road',
    riskLevel: 'SAFE',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
    depth: 'Zero Inundation (High Elevation Ground)',
    advisory: 'SAFE ZONE: Elevated ridge terrain. Designated reception zone for evacuees and civil supplies.',
    nearestShelter: 'Indira Gandhi Municipal Stadium (0.4 km)',
    shelterCapacity: 'Relief Hub Operational',
    busRoute: 'All arterial roads open for emergency traffic'
  },
  {
    name: 'Governorpet',
    riskLevel: 'SAFE',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
    depth: 'Zero Inundation',
    advisory: 'SAFE ZONE: Commercial core unaffected. Municipal drinking water tankers stationed at Old Bus Stand.',
    nearestShelter: 'Bishop Azariah School Shelter (0.5 km)',
    shelterCapacity: '1,500 Beds Ready',
    busRoute: 'Normal traffic flow permitted'
  },
  {
    name: 'Gunadala',
    riskLevel: 'WATCH ADVISORY',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-600',
    depth: '0.3m Canal Margin Waterlogging',
    advisory: 'MONITORING: Ryves canal flow is elevated but within bank boundaries. Keep emergency radio tuned.',
    nearestShelter: 'Andhra Loyola College Campus (1.6 km)',
    shelterCapacity: '2,460 Beds Available',
    busRoute: 'Ramavarappadu Ring Road Open'
  }
];

export const CitizenPortalModal = ({ isOpen, onClose }) => {
  const { logResponseAction } = useFloodData();
  const [selectedLocality, setSelectedLocality] = useState(LOCALITY_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('EN'); // 'EN' | 'TE'

  // SOS Distress Form
  const [sosLocality, setSosLocality] = useState('Ajit Singh Nagar');
  const [sosLandmark, setSosLandmark] = useState('');
  const [sosCount, setSosCount] = useState(4);
  const [hasMedical, setHasMedical] = useState(false);
  const [sosContact, setSosContact] = useState('');
  const [sosSubmitted, setSosSubmitted] = useState(false);
  const [sosToken, setSosToken] = useState('');

  const filteredLocalities = LOCALITY_DATA.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendSos = (e) => {
    e.preventDefault();
    const token = `SOS-${Date.now().toString().slice(-6)}`;
    setSosToken(token);
    setSosSubmitted(true);

    // Log this SOS action directly into the municipal audit trail!
    logResponseAction({
      stationId: 'CITIZEN-SOS',
      stationName: sosLocality,
      actionType: 'PUBLIC_EVACUATION_WARNING',
      actionTitle: `CITIZEN SOS BEACON: ${sosCount} Persons Stranded in ${sosLocality}`,
      details: `Landmark: ${sosLandmark || 'Unspecified'} | Medical Emergency: ${hasMedical ? 'YES (URGENT RESCUE)' : 'No'} | Phone: ${sosContact || 'N/A'} | Dispatch Token: ${token}`,
      team: 'SDRF Quick Response Boat Unit',
      operator: 'Citizen SOS Ingest Gateway'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                  Vijayawada Citizen Flood Safety & Early-Warning Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  PUBLIC ADVISORY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Municipal Corporation public safety bulletins, shelter finder & emergency SOS
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                  language === 'EN' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('TE')}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                  language === 'TE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                α░ñα▒åα░▓α▒üα░ùα▒ü (Telugu)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Emergency Hotlines Ticker */}
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-b border-slate-800 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-rose-300 font-bold">
            <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>24x7 Emergency Helplines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <a href="tel:08662424172" className="text-slate-200 hover:text-cyan-300 transition">
              VMC Control: <strong className="text-cyan-400">0866-2424172</strong>
            </a>
            <span className="text-slate-600">|</span>
            <a href="tel:1078" className="text-slate-200 hover:text-cyan-300 transition">
              NDRF Disaster: <strong className="text-emerald-400">1078</strong>
            </a>
            <span className="text-slate-600">|</span>
            <a href="tel:112" className="text-slate-200 hover:text-cyan-300 transition">
              Emergency Police: <strong className="text-rose-400">112</strong>
            </a>
            <span className="text-slate-600">|</span>
            <a href="tel:108" className="text-slate-200 hover:text-cyan-300 transition">
              Ambulance: <strong className="text-amber-400">108</strong>
            </a>
          </div>
        </div>

        {/* Content Body: Left 6 cols Search & Area Risk, Right 6 cols SOS Beacon Dispatch */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Check My Area Risk & Shelters (6 Cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Check My Locality Flood Risk</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Vijayawada ward, street or landmark..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Locality Chips */}
            <div className="flex flex-wrap gap-1.5">
              {filteredLocalities.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocality(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    selectedLocality.name === loc.name
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>

            {/* Selected Locality Details Card */}
            {selectedLocality && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100">{selectedLocality.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{selectedLocality.depth}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${selectedLocality.badgeColor}`}>
                    {selectedLocality.riskLevel}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-[10px] font-mono text-cyan-400 uppercase mb-1">
                    Civil Defense Official Advisory:
                  </div>
                  {selectedLocality.advisory}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-2.5">
                    <Home className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Assigned Emergency Relief Camp:</span>
                      <span className="font-bold text-slate-100">{selectedLocality.nearestShelter}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">{selectedLocality.shelterCapacity}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-2.5">
                    <LifeBuoy className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Evacuation Transit Support:</span>
                      <span className="text-slate-200">{selectedLocality.busRoute}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Citizen SOS Distress Beacon (6 Cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Citizen SOS Distress Beacon Dispatch</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Direct to SDRF Dispatch</span>
            </div>

            {sosSubmitted ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/50 text-center space-y-3 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-100">SOS Distress Signal Logged!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your coordinates and stranded count have been dispatched to the Vijayawada EOC Command Center and SDRF Rescue Boat Units.
                </p>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  Dispatch Reference Token: <span className="text-cyan-400 font-bold">{sosToken}</span>
                </div>
                <button
                  onClick={() => setSosSubmitted(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition"
                >
                  Send Another Distress Update
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendSos} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                <p className="text-xs text-slate-400">
                  Are you or someone you know stranded by rising water? Submit emergency coordinates directly to rescue operations.
                </p>

                {/* Locality Select */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Stranded Ward / Sector:
                  </label>
                  <select
                    value={sosLocality}
                    onChange={(e) => setSosLocality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {LOCALITY_DATA.map((loc) => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Landmark or Address */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Street, Building or Landmark:
                  </label>
                  <input
                    type="text"
                    required
                    value={sosLandmark}
                    onChange={(e) => setSosLandmark(e.target.value)}
                    placeholder="e.g. Near Pipula Junction, 2nd floor terrace"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Stranded Count & Medical Emergency Checkbox */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Number of People Stranded:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={sosCount}
                      onChange={(e) => setSosCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Contact Phone (Optional):
                    </label>
                    <input
                      type="tel"
                      value={sosContact}
                      onChange={(e) => setSosContact(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasMedical"
                    checked={hasMedical}
                    onChange={(e) => setHasMedical(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="hasMedical" className="text-xs text-slate-300 cursor-pointer">
                    Urgent Medical Attention Needed (Infant / Elderly / Injured)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-rose-950"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Emergency SOS Distress Beacon</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
