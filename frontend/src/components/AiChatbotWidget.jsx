import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Waves, 
  Bell, 
  ShieldAlert, 
  Cpu, 
  MessageSquare, 
  Terminal,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';
import { useFloodData } from '../context/FloodDataContext';
import { AiAssistantLogo } from './AiAssistantLogo';

export const AiChatbotWidget = () => {
  const { stations, alerts, scenario } = useFloodData();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('ST-001');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const initialMessages = [
    {
      id: 'm-1',
      sender: 'ai',
      text: '👋 Greetings! I am the FloodGuard AI Hydrological Emergency Assistant. Ask me anything about live station telemetry, flash flood risk scores, or emergency evacuation directives.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState(initialMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      // Try backend POST /api/ai/chat
      const res = await axios.post('/api/ai/chat', {
        message: text,
        stationId: selectedStationId
      });

      if (res.data && res.data.reply) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        generateLocalAiReply(text);
      }
    } catch (e) {
      generateLocalAiReply(text);
    } finally {
      setIsTyping(false);
    }
  };

  // Local AI Fallback logic if server offline
  const generateLocalAiReply = (queryText) => {
    const q = queryText.toLowerCase();
    let reply = '';

    if (q.includes('st-001') || q.includes('ferry ghat') || q.includes('station')) {
      reply = `🌊 Station ST-001 (${activeStation.name}) is at ${activeStation.currentTelemetry.waterLevel}m (${activeStation.currentTelemetry.waterLevelPercentage}% capacity). Risk Level: ${activeStation.riskAnalysis.riskLevel} (Score: ${activeStation.riskAnalysis.riskScore}/100). Rate of rise: +${activeStation.currentTelemetry.rateOfRise} cm/h.`;
    } else if (q.includes('alert') || q.includes('warning') || q.includes('incident')) {
      const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
      reply = `🚨 Active Emergency Alerts: ${activeCount} active in basin. ${activeCount > 0 ? `Latest alert: ${alerts[0].title}` : 'All river gauges are currently within safe operational limits.'}`;
    } else if (q.includes('evacuat') || q.includes('shelter') || q.includes('civil defense')) {
      reply = `📋 Civil Defense Evacuation Directive: Primary shelters are active at Indira Gandhi Stadium and Govt Polytechnic. In case of CRITICAL flood warnings, evacuate low-lying riverbanks immediately. Call 1077 / 112 for emergency dispatch.`;
    } else if (q.includes('hardware') || q.includes('esp32') || q.includes('test')) {
      reply = `🧪 Live Hardware Pipeline: ESP32 #1 & ESP32 #2 nodes send ultrasonic level, DS18B20 temperature (23.5°C), and relay status via LoRaWAN/MQTT to Raspberry Pi Gateway RPI-GW-01, which syncs with MongoDB Atlas.`;
    } else {
      reply = `🤖 FloodGuard AI Assistant: Current basin scenario is ${scenario}. Station ${activeStation.name} risk level is ${activeStation.riskAnalysis.riskLevel} (${activeStation.riskAnalysis.riskScore}/100). AI Recommendation: ${activeStation.riskAnalysis.aiRecommendation}`;
    }

    const aiMsg = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const quickPrompts = [
    { label: '🌊 ST-001 Live Status', query: 'What is the current status of station ST-001?' },
    { label: '🚨 Active Emergency Alerts', query: 'Show active emergency alerts in the basin' },
    { label: '📋 Evacuation Protocols', query: 'What are the emergency evacuation directives?' },
    { label: '🧪 Hardware Diagnostics', query: 'Check ESP32 and Raspberry Pi hardware status' }
  ];

  return (
    <>
      {/* Floating Chat Trigger Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-cyan-950/80 hover:scale-105 transition-all flex items-center space-x-2.5 border border-cyan-400/40 group"
          title="Open FloodGuard AI Assistant"
        >
          <div className="relative w-8 h-8 rounded-xl bg-slate-950/80 p-0.5 flex items-center justify-center border border-cyan-400/50">
            <AiAssistantLogo className="w-full h-full object-contain group-hover:scale-110 transition" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="text-left font-mono">
            <div className="text-xs font-extrabold leading-none">FloodGuard AI</div>
            <div className="text-[10px] text-cyan-200 leading-none mt-0.5">Assistant Chat</div>
          </div>
        </button>
      )}

      {/* Expandable Chatbot Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[540px] rounded-3xl bg-[#0c1322]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-cyan-500/40 p-1 flex items-center justify-center">
                <AiAssistantLogo className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center space-x-1.5">
                  <span>FloodGuard AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </h3>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE</span>
                  </span>
                  <span>•</span>
                  <span>Scenario: {scenario}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Context Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Station Context:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] rounded-lg px-2 py-1 outline-none"
            >
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-950'
                    : 'bg-slate-900/90 border border-cyan-500/30 text-slate-200 rounded-bl-none shadow-md'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className={`text-[9px] font-mono text-right ${m.sender === 'user' ? 'text-cyan-100' : 'text-slate-500'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900/90 border border-cyan-500/30 text-slate-400 rounded-2xl px-4 py-2.5 rounded-bl-none flex items-center space-x-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="font-mono text-[10px] ml-1">Analyzing Telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono transition flex items-center space-x-1"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask FloodGuard AI Assistant..."
              className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiChatbotWidget;
