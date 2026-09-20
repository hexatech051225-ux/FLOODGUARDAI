import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  X, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  Sliders,
  LifeBuoy
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';
import { sirenEngine } from '../utils/acousticSiren';
import { AiAssistantLogo } from './AiAssistantLogo';

export const AiAssistantChatbot = ({ 
  isOpen, 
  setIsOpen, 
  onNavigateTab, 
  onOpenEvacuationModal, 
  onOpenCitizenPortal 
}) => {
  const { stations, alerts, scenario, setScenario, soundEnabled, setSoundEnabled } = useFloodData();
  const { user } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Quick prompt recommendations
  const PROMPT_CHIPS = [
    "Budameru breach risk & capacity",
    "Prakasam Barrage discharge status",
    "Safe evacuation routes from Zone 1",
    "Draft EOC SitRep for District Collector",
    "Simulate 120mm cloudburst in AquaTwin",
    "Check IoT sensor battery & packet loss"
  ];

  // Message conversation thread
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'Commander Vance'}. I am **Sentinel AI**, your municipal hydrological crisis assistant. All 6 Krishna Basin IoT telemetry nodes, Prakasam Barrage sluices, and Budameru Diversion Channel sensors are actively connected. How can I assist disaster operations?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '≡ƒîè Open Digital Twin', tab: 'digital-twin' },
        { label: '≡ƒÜ¿ Check Critical Alerts', tab: 'alerts' }
      ]
    }
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Initialize Speech Recognition (Voice Input)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text-to-Speech (Voice Readout)
  const handleToggleSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_`\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Conversational Intelligence Engine
  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const budameru = stations.find(s => s.id === 'ST-003') || stations[2];
    const barrage = stations.find(s => s.id === 'ST-002') || stations[1];
    const ferryGhat = stations.find(s => s.id === 'ST-001') || stations[0];
    const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

    if (q.includes('budameru') || q.includes('channel') || q.includes('ajit singh')) {
      const level = budameru?.currentTelemetry?.waterLevel || 2.98;
      const pct = budameru?.currentTelemetry?.waterLevelPercentage || 93.1;
      const ror = budameru?.currentTelemetry?.rateOfRise || 22.5;

      return {
        text: `≡ƒîè **BUDAMERU DIVERSION CHANNEL (BDC) STATUS REPORT**\n\n- **Live Water Level**: ${level}m (${pct}% retention capacity)\n- **Danger Limits**: Warning 1.8m | High Risk 2.4m | **Critical 2.9m (BREACH ACTIVE)**\n- **Rate of Rise**: +${ror} cm/h (${budameru?.currentTelemetry?.rateOfRiseDirection})\n- **Discharge Velocity**: ${budameru?.currentTelemetry?.flowVelocity} m/s\n\nΓÜá∩╕Å **Operational Risk**: Siltation and water hyacinth blockage at Ambapuram regulator are restricting drainage by ~28%. Urban surcharge in Ajit Singh Nagar & Payakapuram is imminent within 35 minutes.\n\n**Action Directives**:\n1. Dispatch 4 units of 100 HP municipal dewatering pumps to Ambapuram.\n2. Pre-position SDRF quick response rescue boat units.\n3. Verify Eluru Canal diversion bypass sluice clearance.`,
        actions: [
          { label: '≡ƒîè Open Digital Twin Sandbox', tab: 'digital-twin' },
          { label: '≡ƒôó Dispatch Evacuation Broadcast', modal: 'evac' },
          { label: '≡ƒÅ¢∩╕Å Check Relief Shelters', modal: 'citizen' }
        ]
      };
    }

    if (q.includes('prakasam') || q.includes('barrage') || q.includes('gate') || q.includes('discharge')) {
      const level = barrage?.currentTelemetry?.waterLevel || 4.35;
      const rain = barrage?.currentTelemetry?.rainfallIntensity || 34.0;
      return {
        text: `ΓÜí **PRAKASAM BARRAGE HYDROLOGIC ASSESSMENT**\n\n- **Reservoir Pool Level**: ${level}m (FRL: 12.0 ft, Critical: 5.0m)\n- **Precipitation**: ${rain} mm/h over delta catchment\n- **Spillway Status**: 70 / 70 Gates Open at 6.5 ft aperture\n- **Tailrace Flow**: 465,000 Cusecs discharged safely to Krishna delta\n- **Freeboard Clearance**: 0.65m buffer remaining before Krishnalanka embankment overtopping.\n\n**Recommendation**: Maintain steady gate posture. If upstream Pulichintala inflow exceeds 600k cusecs, issue Phase 2 sirens to Ranigari Thota low-lying sectors.`,
        actions: [
          { label: '≡ƒù║∩╕Å View GIS Embankment Profile', tab: 'map' },
          { label: '≡ƒîè Simulate Inflow Surge in AquaTwin', tab: 'digital-twin' }
        ]
      };
    }

    if (q.includes('route') || q.includes('evacuat') || q.includes('safe') || q.includes('shelter') || q.includes('zone 1')) {
      return {
        text: `≡ƒÅ¢∩╕Å **CIVIL DEFENSE EVACUATION ROUTING PROTOCOL**\n\n- **Sector**: Zone 1 (Ajit Singh Nagar & Payakapuram - CRITICAL)\n- **Primary Safe Corridor**: Pipula Road -> NH16 Elevated Flyover -> **Indira Gandhi Municipal Stadium Shelter** (4.2 km, Est. Transit: 14 mins - STATUS: SAFE)\n- **Secondary Corridor**: Inner Ring Road -> **Andhra Loyola College Shelter** (3.8 km - STATUS: SAFE)\n- **Impasse Advisory**: Avoid Budameru bund road due to bank scouring.\n\n**Relief Camp Status**:\n- Indira Gandhi Stadium: Open (820 / 3,500 occupied, 5 days rations).\n- Andhra Loyola College: Open (340 / 2,800 occupied, medical unit on site).`,
        actions: [
          { label: '≡ƒôó Trigger Evacuation Broadcast', modal: 'evac' },
          { label: '≡ƒÅ¢∩╕Å Open Citizen Safety Portal', modal: 'citizen' }
        ]
      };
    }

    if (q.includes('collector') || q.includes('sitrep') || q.includes('draft') || q.includes('briefing') || q.includes('report')) {
      return {
        text: `≡ƒôä **OFFICIAL EOC SITUATION REPORT (SITREP) DRAFT**\n\n**TO**: District Collector & Magistrate, Krishna District\n**FROM**: Municipal Commander Vance, VMC Disaster Operations Cell\n**DATE**: ${new Date().toLocaleDateString('en-IN')} | **TIME**: ${new Date().toLocaleTimeString('en-IN')} IST\n\n1. **Current Krishna Basin State**: Surcharge active. Prakasam Barrage discharge at 465,000 cusecs (70 gates). Budameru channel at 93.1% capacity.\n2. **Evacuation Readiness**: 4 primary relief camps operational. 1,160 evacuees accommodated with food rations and medical teams.\n3. **Fleet Deployment**: 2 SDRF rescue boats, 2 dewatering pumps, and 1 thermal drone active.\n4. **Critical Request**: Request pre-staging of 2 additional NDRF battalions at Gunadala nodal base.`,
        actions: [
          { label: '≡ƒôï Open Disaster SOP Playbook', tab: 'sop-playbook' },
          { label: '≡ƒôæ View Full Response Logs', tab: 'logs' }
        ]
      };
    }

    if (q.includes('siren') || q.includes('alarm')) {
      return {
        text: `≡ƒÜ¿ **ACOUSTIC EMERGENCY SIREN DIRECTIVE**\n\n- Acoustic emergency alarm system is currently ${soundEnabled ? '**ACTIVE (Sound Armed)**' : '**MUTED**'}.\n- Synchronized with civil defense sirens across Vijayawada Municipal Corporation.\n- You can toggle the audible siren or broadcast emergency instructions immediately.`,
        actions: [
          { label: soundEnabled ? '≡ƒöç Mute Siren' : '≡ƒöè Arm Siren', custom: 'toggle_siren' },
          { label: '≡ƒôó Broadcast Evacuation Directive', modal: 'evac' }
        ]
      };
    }

    if (q.includes('twin') || q.includes('sandbox') || q.includes('simulate') || q.includes('cloudburst')) {
      return {
        text: `≡ƒö¼ **AQUATWINΓäó HYDROLOGICAL DIGITAL TWIN**\n\nAquaTwin is calibrated with Manning's hydrodynamic open-channel equations for the Krishna River and Budameru Diversion Channel. You can simulate:\n- Extreme precipitation (up to 180 mm/h)\n- Barrage spillway gate configurations (0 to 70 gates)\n- Upstream reservoir discharge (up to 1.2M cusecs)\n- Urban culvert siltation & coastal tidal surge.\n\nWould you like to open the sandbox to run a simulation?`,
        actions: [
          { label: '≡ƒîè Launch AquaTwin Sandbox', tab: 'digital-twin' }
        ]
      };
    }

    if (q.includes('iot') || q.includes('sensor') || q.includes('battery') || q.includes('packet')) {
      return {
        text: `≡ƒôí **IOT EDGE HARDWARE & RF MESH DIAGNOSTICS**\n\n- **Sensor Nodes**: 6 / 6 ESP32 telemetry stations online.\n- **LoRaWAN Gateways**: RPI-GW-01, RPI-GW-02, RPI-GW-03 operational.\n- **Signal Quality**: Mean RSSI -68 dBm, SNR +8.2 dB (Excellent link margin).\n- **Packet Success**: 99.78% CRC success rate across IN865 frequency channels.\n- **Battery Reserves**: Mean 89% with LiFePO4 solar MPPT recharge active.`,
        actions: [
          { label: '≡ƒôí View IoT Hardware Matrix', tab: 'devices' },
          { label: '≡ƒÆ╗ Open Packet Terminal', tab: 'packets' }
        ]
      };
    }

    // Default intelligent hydrological overview
    return {
      text: `≡ƒñû **SENTINEL AI SITUATION SUMMARY**\n\n- **Weather Scenario**: ${scenario}\n- **Active Incident Alerts**: ${activeAlerts.length} alarms logged in Krishna basin\n- **Highest Risk Station**: ${budameru?.name} (${budameru?.riskAnalysis?.riskLevel} - Score: ${budameru?.riskAnalysis?.riskScore}/100)\n- **Prakasam Barrage**: 70/70 gates active discharging 465k cusecs.\n\nI can analyze water levels, plot safe evacuation routes, draft official SITREPs, run AquaTwin simulations, or trigger emergency directives.`,
      actions: [
        { label: '≡ƒîè AquaTwin Sandbox', tab: 'digital-twin' },
        { label: '≡ƒù║∩╕Å GIS Hazard Map', tab: 'map' },
        { label: '≡ƒôó Evac Directive', modal: 'evac' }
      ]
    };
  };

  const handleSendMessage = (textToSend = inputQuery) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = generateResponse(textToSend);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: response.actions
        }
      ]);
      setIsThinking(false);
    }, 600);
  };

  const handleActionClick = (action) => {
    if (action.tab) {
      onNavigateTab(action.tab);
      if (!isExpanded) setIsOpen(false);
    } else if (action.modal === 'evac') {
      onOpenEvacuationModal();
      if (!isExpanded) setIsOpen(false);
    } else if (action.modal === 'citizen') {
      onOpenCitizenPortal();
      if (!isExpanded) setIsOpen(false);
    } else if (action.custom === 'toggle_siren') {
      const newMuted = sirenEngine.toggleMute();
      setSoundEnabled(!newMuted);
      if (!newMuted) sirenEngine.playChime();
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history refreshed. Sentinel AI is standing by with live basin telemetry. How can I assist?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '≡ƒîè Open Digital Twin', tab: 'digital-twin' }
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
          {/* Quick Notification Pill */}
          {showNotificationBadge && (
            <div 
              onClick={() => {
                setShowNotificationBadge(false);
                setIsOpen(true);
              }}
              className="hidden sm:flex items-center space-x-2 bg-slate-900/95 hover:bg-slate-850 border border-cyan-500/50 p-2.5 px-3.5 rounded-2xl shadow-2xl shadow-cyan-950/80 cursor-pointer backdrop-blur animate-fade-in group transition"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-100 block group-hover:text-cyan-300 transition">
                  Sentinel AI Assistant
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Online ΓÇó Click to chat or consult
                </span>
              </div>
            </div>
          )}

          {/* Floating Avatar Logo Button */}
          <button
            onClick={() => {
              setShowNotificationBadge(false);
              setIsOpen(true);
            }}
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-cyan-300/40"
            title="Open Sentinel AI Disaster Assistant"
          >
            <div className="w-full h-full rounded-[14px] bg-slate-950/80 overflow-hidden flex items-center justify-center p-1 relative">
              <AiAssistantLogo className="w-full h-full object-contain group-hover:scale-110 transition duration-300" />
            </div>

            {/* Glowing Status Ring */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isExpanded 
            ? 'inset-3 sm:inset-6 max-w-5xl mx-auto flex flex-col' 
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[640px] max-h-[90vh] flex flex-col'
        }`}>
          <div className="w-full h-full bg-slate-900/98 backdrop-blur-xl border border-cyan-500/40 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
            {/* Header with Custom Logo */}
            <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1 shadow-lg shadow-cyan-500/30 overflow-hidden shrink-0 border border-cyan-300/40 flex items-center justify-center bg-slate-950">
                  <AiAssistantLogo className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-slate-100">
                      Sentinel AI Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>EOC LIVE</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Municipal Tactical Disaster & Hydrology Copilot
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition hidden sm:block"
                  title={isExpanded ? "Collapse to Widget" : "Expand to Full Window"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60 font-sans text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-900 border border-cyan-500/40 p-0.5 overflow-hidden shrink-0 mt-0.5 shadow flex items-center justify-center">
                      <AiAssistantLogo className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Assistant Message Actions & Controls */}
                    {msg.role === 'assistant' && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleSpeech(msg.content)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1 transition border ${
                              isSpeaking
                                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                            }`}
                            title="Tactical Voice Audio Readout"
                          >
                            {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
                            <span>{isSpeaking ? 'Stop Audio' : 'Voice Briefing'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 text-[10px]"
                            title="Copy message"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className="bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center space-x-1 transition shadow-sm active:scale-95"
                          >
                            <span>{act.label}</span>
                            <ChevronRight className="w-3 h-3 text-cyan-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 mt-0.5 font-bold text-xs">
                      {user?.name ? user.name[0] : 'U'}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono p-2 bg-slate-900/60 rounded-xl w-max border border-slate-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sentinel AI analyzing hydrology model...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips Carousel */}
            <div className="p-2 bg-slate-950 border-t border-slate-800 overflow-x-auto flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase px-1 shrink-0 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Prompts:</span>
              </span>
              {PROMPT_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition shrink-0 font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar with Voice Recognition Toggle */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 shrink-0"
            >
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border-slate-800'
                }`}
                title={isListening ? "Listening... click to stop" : "Voice input via microphone"}
              >
                {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Ask Sentinel AI about water levels, barrage gates, or evacuation..."}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold p-2.5 rounded-xl transition shadow"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
