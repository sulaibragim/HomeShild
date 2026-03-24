import { Bot, Mic, X, Send, MessageSquare, Activity, ChevronDown, Wrench, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  type?: 'text' | 'diagnostic_card' | 'action_card';
};

export function AIFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [input, setInput] = useState('');
  const [activeUserText, setActiveUserText] = useState('');
  const [activeAssistantText, setActiveAssistantText] = useState('');
  const activeUserTextRef = useRef('');
  const activeAssistantTextRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Hi! I\'m your HomeIQ Executive Assistant. Tap the microphone to start a live voice session!', type: 'text' }
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, activeUserText, activeAssistantText, isOpen, mode]);

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const startLiveSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const audioCtx = audioContextRef.current;
      nextPlayTimeRef.current = audioCtx.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: async () => {
            setIsLiveConnected(true);
            setIsConnecting(false);
            
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              const source = audioCtx.createMediaStreamSource(stream);
              const processor = audioCtx.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              source.connect(processor);
              processor.connect(audioCtx.destination);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                
                const buffer = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < buffer.byteLength; i++) {
                  binary += String.fromCharCode(buffer[i]);
                }
                const base64 = btoa(binary);
                
                sessionPromise.then((session: any) => {
                  session.sendRealtimeInput({
                    media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };
            } catch (mediaErr) {
              console.error("Microphone access denied:", mediaErr);
              stopLiveSession();
            }
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            
            if (content) {
              // Handle Audio Output
              const base64Audio = content.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && audioCtx) {
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const float32 = new Float32Array(pcm16.length);
                for (let i = 0; i < pcm16.length; i++) {
                  float32[i] = pcm16[i] / 32768;
                }
                
                const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
                audioBuffer.getChannelData(0).set(float32);
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                
                if (nextPlayTimeRef.current < audioCtx.currentTime) {
                  nextPlayTimeRef.current = audioCtx.currentTime;
                }
                source.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += audioBuffer.duration;
              }
              
              // Handle Input Transcription (User)
              if (content.inputTranscription) {
                const text = content.inputTranscription.text || '';
                if (text) {
                  if (activeAssistantTextRef.current.trim()) {
                    setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'assistant', text: activeAssistantTextRef.current.trim() }]);
                    activeAssistantTextRef.current = '';
                    setActiveAssistantText('');
                  }
                  activeUserTextRef.current += text;
                  setActiveUserText(activeUserTextRef.current);
                }
              }

              // Handle Output Transcription (Assistant)
              if (content.outputTranscription) {
                const text = content.outputTranscription.text || '';
                if (text) {
                  if (activeUserTextRef.current.trim()) {
                    setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'user', text: activeUserTextRef.current.trim() }]);
                    activeUserTextRef.current = '';
                    setActiveUserText('');
                  }
                  activeAssistantTextRef.current += text;
                  setActiveAssistantText(activeAssistantTextRef.current);
                }
              }

              // Handle Turn Complete (Assistant finished)
              if (content.turnComplete) {
                if (activeUserTextRef.current.trim()) {
                  setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'user', text: activeUserTextRef.current.trim() }]);
                  activeUserTextRef.current = '';
                  setActiveUserText('');
                }
                if (activeAssistantTextRef.current.trim()) {
                  setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'assistant', text: activeAssistantTextRef.current.trim() }]);
                  activeAssistantTextRef.current = '';
                  setActiveAssistantText('');
                }
              }
              
              // Handle Interruption
              if (content.interrupted) {
                if (audioCtx) {
                  nextPlayTimeRef.current = audioCtx.currentTime;
                }
                if (activeUserTextRef.current.trim()) {
                  setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'user', text: activeUserTextRef.current.trim() }]);
                  activeUserTextRef.current = '';
                  setActiveUserText('');
                }
                if (activeAssistantTextRef.current.trim()) {
                  setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'assistant', text: activeAssistantTextRef.current.trim() }]);
                  activeAssistantTextRef.current = '';
                  setActiveAssistantText('');
                }
              }
            }

            // Handle Tool Calls
            if (message.toolCall) {
              if (activeUserTextRef.current.trim()) {
                setMessages(msgs => [...msgs, { id: crypto.randomUUID(), role: 'user', text: activeUserTextRef.current.trim() }]);
                activeUserTextRef.current = '';
                setActiveUserText('');
              }
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                const functionResponses = [];
                for (const call of functionCalls) {
                  let result = {};
                  try {
                    if (call.name === 'getAppliances') {
                      const apps = JSON.parse(localStorage.getItem('homeiq_appliances') || '[]');
                      result = { appliances: apps };
                    } else if (call.name === 'addAppliance') {
                      const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
                      const apps = JSON.parse(localStorage.getItem('homeiq_appliances') || '[]');
                      const newApp = {
                        id: Date.now(),
                        typeId: args.typeId,
                        brand: args.brand || '',
                        model: args.model || '',
                        name: args.name || `${args.brand || ''} ${args.typeId}`.trim(),
                        serial: '',
                        age: '',
                        status: 'Good',
                        hasWaterFilter: false,
                        hasAirFilter: false,
                        waterFilterLastChanged: '',
                        airFilterLastChanged: '',
                        condenserLastCleaned: '',
                        drainPumpLastCleaned: '',
                        lintFilterLastCleaned: '',
                        customImage: null,
                        gallery: []
                      };
                      apps.push(newApp);
                      localStorage.setItem('homeiq_appliances', JSON.stringify(apps));
                      window.dispatchEvent(new Event('storage'));
                      result = { success: true, appliance: newApp };
                    } else if (call.name === 'scheduleAppointment') {
                      const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
                      const appointments = JSON.parse(localStorage.getItem('homeiq_appointments') || '[]');
                      const newAppointment = {
                        id: Date.now(),
                        companyName: args.companyName,
                        date: args.date,
                        description: args.description || '',
                        status: 'scheduled'
                      };
                      appointments.push(newAppointment);
                      localStorage.setItem('homeiq_appointments', JSON.stringify(appointments));
                      window.dispatchEvent(new Event('storage'));
                      result = { success: true, appointment: newAppointment };
                    }
                  } catch (e: any) {
                    result = { error: e.message };
                  }
                  functionResponses.push({
                    id: call.id,
                    name: call.name,
                    response: result
                  });
                }
                sessionPromise.then((session: any) => {
                  session.sendToolResponse({ functionResponses });
                });
              }
            }
          },
          onclose: () => {
            stopLiveSession();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: `You are HomeIQ Brain, a helpful, concise home management assistant. Keep responses short and conversational.
Start conversations by asking how you can help the user today.
DO NOT push the user to add appliances in every conversation. Only offer to add appliances or familiarize yourself with their profile/appliances if they indicate they are a new user or explicitly ask for onboarding.
When the user wants to add an appliance, you MUST ask for the brand and model before adding it. NEVER make up, guess, or provide a fake model number or brand. If the user doesn't know the model, you can add it without one, but do not invent one.
When the user asks about their appliances (e.g., "what refrigerator do I have?", "how is my cooktop?"), use the getAppliances tool to check their actual appliances. If they don't have it, tell them they don't have it. If they have it but it's missing a model, tell them they need to add the model.
When the user asks about maintenance (e.g., filters, parts, when to change them), use your knowledge base to provide specific maintenance advice based on their appliance's brand and model.
When troubleshooting appliance issues, one of your main features is to suggest disconnecting the appliance from the outlet for approximately five minutes. This allows the control board to perform a reset. If the issue persists after this reset, advise the user that they will need to call a specialist.
If you determine a specialist is needed, ask the user: "Would you like me to find a suitable specialist for you?"
If the user says yes, use the googleSearch tool to find a highly-rated local appliance repair company (look for good reviews and a website). Then, tell the user you are contacting them and scheduling an appointment.
Use the scheduleAppointment tool to add the appointment to the user's calendar.

CRITICAL LANGUAGE RULES:
1. You must speak in the same language that the user speaks. If the user speaks Russian, you MUST reply in Russian. If the user speaks English, reply in English.
2. ALL data you save, log, or pass to tools (like addAppliance) MUST be translated to and written in English, even if the conversation is in Russian.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            googleSearch: {},
            functionDeclarations: [
              {
                name: 'getAppliances',
                description: 'Get a list of all appliances the user currently has.',
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: 'addAppliance',
                description: 'Add a new appliance for the user. Ask the user for brand and model before calling this.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    typeId: { type: Type.STRING, description: 'The type of appliance. Must be one of: refrigerator, washer, dryer, dishwasher, microwave, cooktop, range' },
                    brand: { type: Type.STRING, description: 'The brand of the appliance (e.g., Samsung, LG)' },
                    model: { type: Type.STRING, description: 'The model number of the appliance' }
                  },
                  required: ['typeId']
                }
              },
              {
                name: 'scheduleAppointment',
                description: 'Schedule an appointment with an appliance repair company and add it to the user calendar.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    companyName: { type: Type.STRING, description: 'The name of the repair company' },
                    date: { type: Type.STRING, description: 'The date and time of the appointment in ISO format (e.g., 2024-03-22T10:00:00Z)' },
                    description: { type: Type.STRING, description: 'A short description of the repair needed' }
                  },
                  required: ['companyName', 'date']
                }
              }
            ]
          }]
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err) {
      console.error("Failed to start live session", err);
      setIsConnecting(false);
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsLiveConnected(false);
    setIsConnecting(false);
    setActiveUserText('');
    setActiveAssistantText('');
    activeUserTextRef.current = '';
    activeAssistantTextRef.current = '';
  };

  const toggleLiveSession = () => {
    if (isLiveConnected || isConnecting) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const newUserMsg: Message = { id: crypto.randomUUID(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        text: 'I am currently optimized for Voice Mode! Please tap the microphone to talk to me.',
        type: 'text'
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-16 h-16 rounded-full p-1 transition-all duration-300 hover:scale-105 group",
          isOpen ? "bg-glass border border-glass-border shadow-none" : "bg-gradient-to-tr from-cyan to-violet shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:shadow-[0_0_40px_rgba(123,47,255,0.6)]"
        )}
      >
        <div className={clsx(
          "w-full h-full rounded-full flex items-center justify-center relative overflow-hidden",
          isOpen ? "bg-base" : "bg-base"
        )}>
          {!isOpen && <div className="absolute inset-0 bg-gradient-to-tr from-cyan/20 to-violet/20 animate-pulse"></div>}
          {isOpen ? (
            <X className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
          ) : (
            <Mic className="w-8 h-8 text-white relative z-10 group-hover:text-cyan transition-colors" />
          )}
        </div>
      </button>

      {/* Assistant Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-6 md:p-8 md:pr-28 md:pb-8 pointer-events-none">
          <div className="w-full max-w-[400px] h-[650px] max-h-[85vh] glass-card pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300 shadow-2xl border-cyan/20">
            
            {/* Header */}
            <div className="p-4 border-b border-glass-border flex items-center justify-between bg-sidebar/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan to-violet p-[2px] animate-pulse">
                  <div className="w-full h-full rounded-full bg-base flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white leading-tight">HomeIQ Brain</h3>
                  <p className="text-xs text-cyan font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex bg-base rounded-lg p-1 border border-glass-border">
                <button 
                  onClick={() => setMode('voice')}
                  className={clsx("p-1.5 rounded-md transition-colors", mode === 'voice' ? "bg-glass text-cyan" : "text-gray-500 hover:text-white")}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setMode('chat')}
                  className={clsx("p-1.5 rounded-md transition-colors", mode === 'chat' ? "bg-glass text-violet" : "text-gray-500 hover:text-white")}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 scrollbar-hide bg-gradient-to-b from-base to-sidebar/30">
              {messages.map((msg) => (
                <div key={msg.id} className={clsx("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                  
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan to-violet p-[2px] shrink-0 mt-1">
                      <div className="w-full h-full rounded-full bg-base flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {/* Text Bubble */}
                    <div className={clsx(
                      "p-3.5 text-sm leading-relaxed shadow-lg",
                      msg.role === 'user' 
                        ? "bg-cyan text-black rounded-2xl rounded-tr-sm font-medium" 
                        : "glass-card rounded-2xl rounded-tl-sm text-gray-100 border-glass-border"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Active Assistant Message */}
              {activeAssistantText && (
                <div className="flex gap-3 max-w-[90%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan to-violet p-[2px] shrink-0 mt-1">
                    <div className="w-full h-full rounded-full bg-base flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-3.5 text-sm leading-relaxed shadow-lg glass-card rounded-2xl rounded-tl-sm text-gray-100 border-glass-border opacity-80">
                      {activeAssistantText}
                      <span className="ml-1 inline-block w-1.5 h-3 bg-cyan animate-pulse"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active User Message */}
              {activeUserText && (
                <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
                  <div className="flex flex-col gap-2">
                    <div className="p-3.5 text-sm leading-relaxed shadow-lg bg-cyan text-black rounded-2xl rounded-tr-sm font-medium opacity-80">
                      {activeUserText}
                      <span className="ml-1 inline-block w-1.5 h-3 bg-black/50 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-glass-border bg-sidebar/80 backdrop-blur-md">
              
              {mode === 'chat' ? (
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    placeholder="Type your request..." 
                    className="w-full bg-base border border-glass-border rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-violet transition-colors shadow-inner"
                  />
                  <button 
                    onClick={() => handleSend(input)}
                    className="absolute right-2 w-9 h-9 rounded-lg bg-violet text-white flex items-center justify-center hover:bg-violet/80 transition-colors"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-6">
                  {isConnecting ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="w-6 h-6 text-cyan animate-spin" />
                       <span className="text-xs text-cyan">Connecting to Brain...</span>
                    </div>
                  ) : isLiveConnected ? (
                    <div className="flex items-center gap-1 h-8">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-cyan rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.random() * 100 + 20}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.5s'
                          }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 font-medium h-8 flex items-center">
                      Tap to speak
                    </div>
                  )}
                  
                  <button 
                    onClick={toggleLiveSession}
                    disabled={isConnecting}
                    className={clsx(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                      isConnecting ? "opacity-50 cursor-not-allowed" : "",
                      isLiveConnected 
                        ? "bg-red-500/20 text-red-500 border-2 border-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
                        : "bg-gradient-to-tr from-cyan to-violet text-white hover:scale-105"
                    )}
                  >
                    {isLiveConnected ? <X className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
