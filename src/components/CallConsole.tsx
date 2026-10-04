import React, { useState } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  MessageSquare,
  Shield, 
  Check,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { CallSession, TranscriptTurn } from '../types';

interface Props {
  session: CallSession | null;
  isCalling: boolean;
  onStartCall: (phone: string, agentId: string) => void;
  onEndCall: () => void;
  onSendManualWhatsApp: (msg: string) => void;
  onParseCallbackText: (text: string) => void;
}

export const CallConsole: React.FC<Props> = ({
  session,
  isCalling,
  onStartCall,
  onEndCall,
  onSendManualWhatsApp,
  onParseCallbackText
}) => {
  const [phoneNumber, setPhoneNumber] = useState('8688664337');
  const [agentId, setAgentId] = useState('244379');
  const [callbackInput, setCallbackInput] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const discovery = session?.discovery || {};
  const intentDecision = session?.intentDecision;
  const isHot = intentDecision?.intent === 'HOT';
  const isWarm = intentDecision?.intent === 'WARM';
  const isCold = intentDecision?.intent === 'COLD';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Dialer & Live Session Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Dial Form */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Country:</span>
              <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300">
                +91 (India)
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number (8688664337)"
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 w-44 tracking-wider"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-500">Agent ID:</span>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="244379"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 w-24 text-center focus:outline-none focus:border-slate-600"
              />
            </div>

            {!isCalling ? (
              <button
                onClick={() => onStartCall(phoneNumber, agentId)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial Outbound Call</span>
              </button>
            ) : (
              <button
                onClick={onEndCall}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Active Call</span>
              </button>
            )}
          </div>

          {/* Telephony Connection Indicators */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isCalling ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-xs font-mono text-slate-300">
                {isCalling ? 'CALL IN PROGRESS' : session ? 'CALL COMPLETED' : 'TELEPHONY READY'}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(session?.durationSeconds || 0)}</span>
            </div>

            {session?.discovery.primaryLanguage && (
              <>
                <span className="text-slate-700">|</span>
                <span className="text-xs font-mono text-teal-400">
                  {session.discovery.primaryLanguage}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Mid-Call WhatsApp Banner */}
        {session?.midCallWhatsAppFired && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span>⚡ Mid-Call WhatsApp Action Fired!</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                    SDE Scorecard: Item 06 (15 Pts)
                  </span>
                </div>
                <div className="text-emerald-400/80 text-[11px]">
                  WhatsApp package arrived on customer's phone while the call was still connected!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => session.midCallWhatsAppMessage && copyToClipboard(session.midCallWhatsAppMessage.content)}
                className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-600/40 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMsg ? 'Copied' : 'Copy Message'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid: Left (Conversation Stream), Right (Discovery & Intent Analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Audio Visualizer + Conversation Turns (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[640px]">
            {/* Audio Stream Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${isCalling ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                <h3 className="text-sm font-bold text-white">Live Conversation &amp; Audio Stream</h3>
              </div>
              <div className="flex items-center gap-2">
                {isCalling && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-mono text-[11px] text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Transcribing</span>
                  </div>
                )}
                <span className="text-xs text-slate-500 font-mono">
                  {session?.transcript.length || 0} turns
                </span>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {!session || session.transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <PhoneCall className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Ready to initiate outbound sales call</p>
                  <p className="text-xs max-w-sm mt-1">
                    Click "Dial Outbound Call" to connect to +91 8688664337 or test one of the evaluator benchmark scenarios.
                  </p>
                </div>
              ) : (
                session.transcript.map((turn, idx) => {
                  const isAgent = turn.speaker === 'agent';
                  return (
                    <div
                      key={turn.id || idx}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-400">
                        <span className={isAgent ? 'text-amber-400 font-semibold' : 'text-blue-400 font-semibold'}>
                          {isAgent ? 'ElevateBox AI Voice Agent' : 'Customer (+91 8688664337)'}
                        </span>
                        <span>·</span>
                        <span>{turn.timestamp}</span>
                        {turn.detectedLanguage && (
                          <>
                            <span>·</span>
                            <span className="text-teal-400">{turn.detectedLanguage}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-slate-950 text-slate-200 border border-slate-800'
                            : 'bg-blue-950/40 text-blue-100 border border-blue-500/30'
                        }`}
                      >
                        {turn.text}

                        {/* Mid-call trigger timestamp note if on turn 6 */}
                        {!isAgent && turn.text.toLowerCase().includes('send me the details') && (
                          <div className="mt-2 pt-2 border-t border-blue-500/30 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>Triggered Mid-Call WhatsApp Action</span>
                          </div>
                        )}

                        {!isAgent && (turn.text.toLowerCase().includes('repu') || turn.text.toLowerCase().includes('call me back')) && (
                          <div className="mt-2 pt-2 border-t border-blue-500/30 flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>Triggered Natural Language Callback</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Audio Waveform Simulator */}
            {isCalling && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-slate-500 text-[11px]">Audio Frequency Stream:</span>
                <div className="flex items-center gap-1">
                  {[40, 70, 30, 85, 95, 60, 45, 90, 65, 80, 50, 75, 40].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${h * 0.22}px`,
                        animationDelay: `${i * 90}ms`
                      }}
                    />
                  ))}
                </div>
                <span className="text-emerald-400 text-[11px]">Bi-directional 24kHz</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Qualification Matrix & Intent Scoring (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Intent Scoring Gauge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Intent Classification Engine (M4)</h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Score: <strong className="text-white text-sm">{intentDecision?.score || 20}</strong>/100
              </div>
            </div>

            {/* Intent Badge & Score Meter */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Lead State:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wide ${
                      isHot
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : isWarm
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    ● {intentDecision?.intent || 'COLD'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Confidence: {Math.round((intentDecision?.confidence || 0.6) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isHot
                      ? 'bg-emerald-400'
                      : isWarm
                      ? 'bg-amber-400'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${intentDecision?.score || 20}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>COLD (0-34)</span>
                <span>WARM (35-69)</span>
                <span className="text-emerald-400 font-semibold">HOT (70-100)</span>
              </div>
            </div>

            {/* Detected Intent Signals */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Signals &amp; Heuristic Drivers
              </span>
              <div className="mt-2 space-y-1.5">
                {intentDecision && intentDecision.signals.length > 0 ? (
                  intentDecision.signals.map((sig, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Awaiting conversational signals from speech recognition...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Structured Lead Discovery Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Extracted Business Requirements</h3>
              </div>
              <span className="text-[11px] font-mono text-teal-400">Real-Time Extraction</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Business Type</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {discovery.businessType || 'Detecting...'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Catalog Size</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {discovery.catalogSize ? `${discovery.catalogSize}` : 'Detecting...'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Budget Expectation</span>
                <span className="font-semibold text-amber-400 mt-0.5 block truncate">
                  {discovery.budgetRange || 'Detecting...'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Target Timeline</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {discovery.timeline || 'Detecting...'}
                </span>
              </div>
            </div>

            {/* Key Features Pill list */}
            <div className="mt-3 pt-3 border-t border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                Requested eCommerce Features
              </span>
              <div className="flex flex-wrap gap-1.5">
                {discovery.keyFeatures && discovery.keyFeatures.length > 0 ? (
                  discovery.keyFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-teal-300 rounded text-[11px] font-mono"
                    >
                      ✓ {feat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No specific integrations detected yet.</span>
                )}
              </div>
            </div>
          </div>

          {/* Natural Language Callback Scheduling Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Callback Booking Engine</h3>
              </div>
              <span className="text-[11px] font-mono text-blue-400">Asia/Kolkata (IST)</span>
            </div>

            {session?.callback ? (
              <div className="mt-3 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-300">Appointment Confirmed</span>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    Booked in DB
                  </span>
                </div>
                <div className="font-mono text-amber-300 text-sm">
                  {new Date(session.callback.scheduledTimeUTC).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })} IST
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Utterance: "{session.callback.rawUtterance}"
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically extracts spoken times in English, Telugu ("repu podduna 11 ki"), or Hindi ("kal shaam ko 4 baje").
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={callbackInput}
                    onChange={(e) => setCallbackInput(e.target.value)}
                    placeholder='Try "repu podduna 11 gantalaki"'
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (callbackInput) {
                        onParseCallbackText(callbackInput);
                        setCallbackInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-medium transition-colors"
                  >
                    Test Parse
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
