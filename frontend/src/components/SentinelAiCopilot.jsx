import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Send, 
  Volume2, 
  VolumeX, 
  X, 
  Bot, 
  User, 
  Copy, 
  Check, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  Terminal,
  Activity,
  Waves,
  RefreshCw
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { useAuth } from '../context/AuthContext';

export const SentinelAiCopilot = ({ isOpen, onClose, onNavigateTab, onOpenEvacuationModal }) => {
  const { stations, alerts, scenario, connectionMode } = useFloodData();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested tactical queries
  const SUGGESTED_QUERIES = [
    "Assess Budameru breach risk & current surcharge level",
    "Recommend gate operations for Prakasam Barrage",
    "What are the safe evacuation routes from Zone 1?",
    "Draft an Emergency Briefing for the District Collector",
    "Diagnose IoT sensor signal health across the basin"
  ];

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Greetings, ${user?.name || 'Commander'}. Sentinel-AI Tactical Hydrological Advisor is online. All 6 Krishna Basin telemetry nodes, Prakasam Barrage spillway feeds, and Budameru Diversion Channel sensors are actively synchronized. How can I assist disaster operations?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: ['Review Digital Twin', 'Check Critical Flashpoints']
    }
  ]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech Synthesis Reader
  const handleToggleSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown stars/brackets for clean speech
    const cleanText = text.replace(/[*#_`\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // AI Response Generation Engine
  const generateAiResponse = (query) => {
    const q = query.toLowerCase();
    const budameru = stations.find(s => s.id === 'ST-003') || stations[2];
    const barrage = stations.find(s => s.id === 'ST-002') || stations[1];
    const ferryGhat = stations.find(s => s.id === 'ST-001') || stations[0];
    const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

    if (q.includes('budameru') || q.includes('channel') || q.includes('ajit singh')) {
      const level = budameru?.currentTelemetry?.waterLevel || 2.98;
      const ror = budameru?.currentTelemetry?.rateOfRise || 22.5;
      const pct = budameru?.currentTelemetry?.waterLevelPercentage || 93.1;
      return {
        text: `**TACTICAL ASSESSMENT: BUDAMERU DIVERSION CHANNEL (BDC)**\n\n- **Current Water Level**: ${level}m (Critical Threshold: ${budameru?.dangerThresholds?.critical}m)\n- **Basin Capacity Saturation**: ${pct}%\n- **Hydraulic Rate of Rise**: +${ror} cm/h (${budameru?.currentTelemetry?.rateOfRiseDirection})\n- **Discharge Velocity**: ${budameru?.currentTelemetry?.flowVelocity} m/s\n\n**Key Vulnerability**:\nAmbapuram regulator reports high flow resistance indicative of siltation and hyacinth debris. Water level is hovering near bank-full freeboard.\n\n**Recommended Directives**:\n1. Pre-stage 4 units of 100 HP dewatering pumps in Ajit Singh Nagar.\n2. Dispatch SDRF swift water boat teams to Payakapuram.\n3. Verify Eluru Canal bypass diversion gate clearance.`,
        actions: ['Open Digital Twin', 'Trigger Evacuation Broadcast']
      };
    }

    if (q.includes('prakasam') || q.includes('barrage') || q.includes('gate') || q.includes('krishna')) {
      const level = barrage?.currentTelemetry?.waterLevel || 4.35;
      const rain = barrage?.currentTelemetry?.rainfallIntensity || 34.0;
      return {
        text: `**HYDROLOGICAL BRIEFING: PRAKASAM BARRAGE & KRISHNALANKA**\n\n- **Barrage Pool Level**: ${level}m (Warning: 3.2m, Critical: 5.0m)\n- **Local Catchment Precipitation**: ${rain} mm/h\n- **Spillway Status**: 70/70 Gates Operational with high-volume tailrace discharge\n- **Krishnalanka Riverfront Wall**: Pressure sensor indicates nominal embankment stress, but low-lying Ranigari Thota approach roads are vulnerable to tailrace eddies.\n\n**Strategic Recommendation**:\nMaintain steady spillway gate posture. Srisailam and Pulichintala releases require continuous monitoring over the next 4-hour cycle.`,
        actions: ['Review GIS Map', 'Open Digital Twin']
      };
    }

    if (q.includes('evacuat') || q.includes('route') || q.includes('safe') || q.includes('zone 1')) {
      return {
        text: `**CIVIL DEFENSE SAFE EVACUATION PROTOCOL: ZONE 1 (AJIT SINGH NAGAR)**\n\n- **Hazard Severity**: CRITICAL INUNDATION (Projected Depth: 2.4m - 3.2m)\n- **Designated Primary Route**: Pipula Road Corridor -> National Highway 16 Elevated Flyover -> Indira Gandhi Municipal Stadium Shelter (Distance: 4.2 km, Travel Time: ~14 mins).\n- **Secondary Route**: Inner Ring Road -> Andhra Loyola College Campus Shelter.\n- **Impasse Warning**: Avoid Budameru canal bank bund road due to bank scouring.\n\n**Shelter Readiness**:\n- Indira Gandhi Stadium: Open (820 / 3,500 capacity occupied, 5 days rations).\n- Andhra Loyola College: Open (340 / 2,800 capacity occupied, medical unit on site).`,
        actions: ['Trigger Evacuation Broadcast', 'Open GIS Map']
      };
    }

    if (q.includes('collector') || q.includes('briefing') || q.includes('draft') || q.includes('report')) {
      return {
        text: `**MEMORANDUM: EMERGENCY OPERATIONS CENTER (EOC)**\n\n**TO**: District Collector & Magistrate, Krishna District\n**FROM**: Municipal Commander Vance, VMC Disaster Operations Cell\n**SUBJECT**: Krishna River Basin & Urban Storm Drainage Surge Situation\n\n1. **Situation Overview**: Monsoonal surge and localized cloudburst have pushed Budameru Channel to 93.1% retention capacity. Prakasam Barrage discharge exceeds 465,000 cusecs.\n2. **Casualties / Stranded**: Zero casualties reported. Pre-emptive evacuation initiated for 1,200 vulnerable households along low-lying river margins.\n3. **Relief Assets Deployed**: 8 SDRF inflatable boats, 6 mobile medical ambulances, and 4 municipal high-volume dewatering pumps active.\n4. **Immediate Request**: Pre-position 2 additional NDRF battalions at Gunadala nodal depot.`,
        actions: ['Copy Report', 'View Response Logs']
      };
    }

    if (q.includes('iot') || q.includes('sensor') || q.includes('signal') || q.includes('mesh') || q.includes('health')) {
      return {
        text: `**IOT TELEMETRY & RF MESH DIAGNOSTICS SUMMARY**\n\n- **Active ESP32 Sensor Nodes**: 6 / 6 Reporting\n- **Edge LoRaWAN Gateways**: 3 / 3 Online (RPI-GW-01, RPI-GW-02, RPI-GW-03)\n- **Signal Quality**: Mean RSSI -68 dBm, SNR +8.2 dB (Excellent link margin)\n- **Packet Integrity**: 99.78% CRC success rate across IN865 frequency channels\n- **Power Reserves**: Average node battery level 89% with solar MPPT recharging active.\n\n**Anomaly Note**: Station ST-003 shows intermittent RF packet jitter (+12ms) during peak downpour bursts; automated multi-path mesh rerouting is engaged.`,
        actions: ['View IoT Hardware Health', 'Open Packet Terminal']
      };
    }

    // Default intelligent overview
    return {
      text: `**KRISHNA BASIN MUNICIPAL SITUATION OVERVIEW**\n\n- **Active Weather Scenario**: ${scenario}\n- **Basin Alerts**: ${activeAlerts.length} Active Incident Notifications\n- **Highest Vulnerability**: ${budameru?.name} (${budameru?.riskAnalysis?.riskLevel})\n- **Prakasam Barrage Inflow**: Inflow rate elevated, spillway gates discharging to downstream delta.\n\nReady to simulate custom flood scenarios in AquaTwin, generate official SITREP documents, or map evacuation corridors. What specific hydrological parameter would you like to inspect?`,
      actions: ['Open Digital Twin', 'View Alerts']
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
      const response = generateAiResponse(textToSend);
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
    if (action.includes('Digital Twin')) {
      onNavigateTab('digital-twin');
      onClose();
    } else if (action.includes('Evacuation')) {
      onOpenEvacuationModal();
      onClose();
    } else if (action.includes('GIS') || action.includes('Map')) {
      onNavigateTab('map');
      onClose();
    } else if (action.includes('Hardware') || action.includes('IoT')) {
      onNavigateTab('devices');
      onClose();
    } else if (action.includes('Terminal') || action.includes('Packet')) {
      onNavigateTab('packets');
      onClose();
    } else if (action.includes('Alerts') || action.includes('Flashpoints')) {
      onNavigateTab('alerts');
      onClose();
    } else if (action.includes('Logs')) {
      onNavigateTab('logs');
      onClose();
    } else if (action.includes('Copy')) {
      navigator.clipboard.writeText(messages[messages.length - 1]?.content || '');
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Copilot Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 border border-cyan-300/40">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-100">
                  Sentinel-AI Tactical Disaster Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse">
                  NEURAL EOC ADVISOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground-truth hydrological inference, SOP playbooks & voice briefing
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Close Copilot"
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
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
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

                {/* Quick Action Pills if available */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1 transition"
                      >
                        <span>{act}</span>
                        <ChevronRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Krishna basin telemetry & hydraulic equations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Bar */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-1 shrink-0">
            Tactical Prompts:
          </span>
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Sentinel-AI about water levels, evacuation corridors, or gate operations..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold p-2.5 rounded-xl transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
