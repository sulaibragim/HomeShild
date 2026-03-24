import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Wrench, Mic, Square, Activity } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { clsx } from 'clsx';

export function DiagnosticAssistant({ appliance, onClose, onSaveDiagnostic }: { appliance: any, onClose: () => void, onSaveDiagnostic?: (diagnostic: any) => void }) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [messages, setMessages] = useState<{id: string, role: 'user'|'assistant', text: string}[]>([]);
  const [activeUserText, setActiveUserText] = useState('');
  const [activeAssistantText, setActiveAssistantText] = useState('');
  
  const activeUserTextRef = useRef('');
  const activeAssistantTextRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef(0);

  const stopAllAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      const ai = new GoogleGenAI({ apiKey });

      // Setup Audio Context
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const systemInstruction = `You are a strict, professional, and highly specialized Voice Diagnostic Assistant.
Target Appliance: ${appliance.brand || 'Unknown'} ${appliance.typeId}.
Rules:
1. You are communicating via VOICE. Keep responses short, conversational, and easy to listen to.
2. Guide the user STEP-BY-STEP. Ask ONE question or give ONE instruction at a time, then wait for their response.
3. Do NOT give long lists of instructions.
4. If they ask about anything other than diagnosing this specific appliance, refuse politely and steer back to the diagnosis.
5. Start by asking what is wrong with the appliance. Do NOT repeat the model number or serial number.
6. CRITICAL TROUBLESHOOTING STEP: One of your main features is to suggest disconnecting the appliance from the outlet for approximately five minutes. This allows the control board to perform a reset. If the issue persists after this reset, advise the user that they will need to call a specialist.
7. If you determine a specialist is needed, ask the user: "Would you like me to find a suitable specialist for you?"
8. If the user says yes, use the googleSearch tool to find a highly-rated local appliance repair company (look for good reviews and a website). Then, tell the user you are contacting them and scheduling an appointment.
9. Use the scheduleAppointment tool to add the appointment to the user's calendar.

CRITICAL LANGUAGE RULES:
1. You must speak in the same language that the user speaks. If the user speaks Russian, you MUST reply in Russian. If the user speaks English, reply in English.
2. If the user speaks Russian, start the conversation in Russian (e.g., "Что случилось с вашим холодильником?"). If English, start in English.
3. ALL data you save, log, or summarize MUST be translated to and written in English, even if the conversation is in Russian.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            googleSearch: {},
            functionDeclarations: [
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
          }],
        },
        callbacks: {
          onopen: () => {
            setStatus('active');
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                let s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              const buffer = new ArrayBuffer(pcm16.length * 2);
              new Int16Array(buffer).set(pcm16);
              
              const bytes = new Uint8Array(buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64 = btoa(binary);

              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (!content) return;

            if (content.interrupted) {
              stopAllAudio();
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

            // Handle Turn Complete
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

            const base64Audio = content.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioCtxRef.current) {
              setAiSpeaking(true);
              const binaryString = atob(base64Audio);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const audioBuffer = audioCtxRef.current.createBuffer(1, pcm16.length, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < pcm16.length; i++) {
                channelData[i] = pcm16[i] / 32768.0;
              }

              const playSource = audioCtxRef.current.createBufferSource();
              playSource.buffer = audioBuffer;
              playSource.connect(audioCtxRef.current.destination);

              if (nextPlayTimeRef.current < audioCtxRef.current.currentTime) {
                nextPlayTimeRef.current = audioCtxRef.current.currentTime;
              }
              playSource.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;

              playSource.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== playSource);
                if (activeSourcesRef.current.length === 0) {
                  setAiSpeaking(false);
                }
              };
              activeSourcesRef.current.push(playSource);
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
                    if (call.name === 'scheduleAppointment') {
                      const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
                      const appointments = JSON.parse(localStorage.getItem('homeiq_appointments') || '[]');
                      const newAppointment = {
                        id: Date.now(),
                        companyName: args.companyName,
                        date: args.date,
                        description: args.description || '',
                        applianceId: appliance.id,
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
            setStatus('idle');
            cleanup();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setStatus('error');
            cleanup();
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error("Failed to start voice session:", err);
      setStatus('error');
      cleanup();
    }
  };

  const cleanup = () => {
    stopAllAudio();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    setAiSpeaking(false);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeUserText, activeAssistantText]);

  const handleClose = async () => {
    cleanup();
    if (messages.length > 0 && onSaveDiagnostic) {
      // Create a placeholder diagnostic while we generate the summary
      const diagnosticId = Date.now();
      const tempDiagnostic = {
        id: diagnosticId,
        date: new Date().toISOString(),
        title: 'Voice Diagnostic Session',
        summary: 'Generating diagnostic report...',
        status: 'Processing',
        messages: messages
      };
      onSaveDiagnostic(tempDiagnostic);

      // Generate a real summary in the background
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize this appliance diagnostic conversation in 2-3 sentences. What was the issue, and what was the conclusion or next step (e.g., fixed, needs technician, parts ordered)?\n\nCRITICAL: The summary MUST be written in English, regardless of the language used in the transcript.\n\nTranscript:\n${transcript}`
          });
          
          const finalDiagnostic = {
            ...tempDiagnostic,
            summary: response.text || 'Completed diagnostic session.',
            status: 'Logged'
          };
          onSaveDiagnostic(finalDiagnostic);
        }
      } catch (e) {
        console.error("Failed to generate summary", e);
        onSaveDiagnostic({
          ...tempDiagnostic,
          summary: 'Completed diagnostic session with AI Assistant.',
          status: 'Logged'
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-base border border-glass-border rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-glass-border flex items-center justify-between bg-glass z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Wrench className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Voice Diagnostics
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {appliance.brand} {appliance.typeId}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-base to-black/50">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                msg.role === 'user' ? "bg-cyan/20 text-cyan" : "bg-red-500/20 text-red-500 border border-red-500/30"
              )}>
                {msg.role === 'user' ? <div className="w-4 h-4 rounded-full bg-cyan" /> : <Wrench className="w-4 h-4" />}
              </div>
              <div className={clsx(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-cyan text-black rounded-tr-sm font-medium" 
                  : "bg-glass border border-red-500/20 text-gray-200 rounded-tl-sm font-mono"
              )}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Active Assistant Message */}
          {activeAssistantText && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0 mt-1">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl text-sm leading-relaxed bg-glass border border-red-500/20 text-gray-200 rounded-tl-sm font-mono opacity-80">
                {activeAssistantText}
                <span className="ml-1 inline-block w-1.5 h-3 bg-red-500 animate-pulse"></span>
              </div>
            </div>
          )}

          {/* Active User Message */}
          {activeUserText && (
            <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-cyan/20 text-cyan flex items-center justify-center shrink-0 mt-1">
                <div className="w-4 h-4 rounded-full bg-cyan" />
              </div>
              <div className="p-3 rounded-2xl text-sm leading-relaxed bg-cyan text-black rounded-tr-sm font-medium opacity-80">
                {activeUserText}
                <span className="ml-1 inline-block w-1.5 h-3 bg-black/50 animate-pulse"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Controls */}
        <div className="p-6 border-t border-glass-border bg-glass flex flex-col items-center justify-center min-h-[160px] relative">
          {status === 'idle' && (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={startSession}
                className="w-24 h-24 rounded-full bg-cyan hover:bg-cyan/90 text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] transition-all hover:scale-105"
              >
                <Mic className="w-10 h-10" />
              </button>
              <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Tap to Start</span>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex flex-col items-center gap-4 text-cyan">
              <Loader2 className="w-12 h-12 animate-spin" />
              <span className="font-mono text-sm uppercase tracking-widest">Connecting...</span>
            </div>
          )}

          {status === 'active' && (
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="relative flex items-center justify-center">
                <div className={clsx(
                  "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                  aiSpeaking ? "bg-cyan/20 shadow-[0_0_50px_rgba(0,245,255,0.4)] scale-110" : "bg-glass border border-glass-border"
                )}>
                  {aiSpeaking ? (
                    <Activity className="w-12 h-12 text-cyan animate-pulse" />
                  ) : (
                    <Mic className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {/* Pulsing rings when AI is speaking */}
                {aiSpeaking && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-cyan/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 rounded-full border border-cyan/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                  </>
                )}
              </div>

              <div className="h-8 flex items-center justify-center">
                <span className={clsx(
                  "font-mono text-sm uppercase tracking-widest transition-colors",
                  aiSpeaking ? "text-cyan" : "text-gray-400"
                )}>
                  {aiSpeaking ? "Assistant Speaking..." : "Listening..."}
                </span>
              </div>

              <button 
                onClick={() => {
                  cleanup();
                  setStatus('idle');
                }}
                className="px-6 py-3 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 font-bold flex items-center gap-2 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" /> End Session
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-red-500">
              <div className="p-4 rounded-full bg-red-500/10">
                <X className="w-10 h-10" />
              </div>
              <span className="font-mono text-sm uppercase tracking-widest text-center">Connection Failed<br/>Check Microphone & API Key</span>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2 rounded-full bg-glass border border-glass-border text-white hover:bg-white/10 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
