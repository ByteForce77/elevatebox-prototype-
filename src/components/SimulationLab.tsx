import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Clock,
  Layers
} from 'lucide-react';
import { BENCHMARK_SCENARIOS } from '../services/omnidimension';
import { CallSession, TranscriptTurn } from '../types';
import { evaluateLeadIntent } from '../services/intentEngine';
import { generateFollowUpMessage } from '../services/followUpGenerator';
import { parseNaturalLanguageTime } from '../services/timeParser';

interface Props {
  onSessionUpdated: (session: CallSession) => void;
}

export const SimulationLab: React.FC<Props> = ({ onSessionUpdated }) => {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'HOT_LEAD' | 'WARM_LEAD' | 'COLD_LEAD'>('HOT_LEAD');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = BENCHMARK_SCENARIOS[selectedScenarioKey];
  const allTurns = scenario.turns;

  // Build the active simulated session based on current turns
  const activeTurns = allTurns.slice(0, currentTurnIndex);

  const evaluation = evaluateLeadIntent(activeTurns);
  const isMidCallWhatsApp = evaluation.midCallTriggerRequired && currentTurnIndex >= 6;
  const isCallbackTriggered = evaluation.callbackRequested && currentTurnIndex >= 4;

  const currentDurationSeconds = Math.min(
    105,
    activeTurns.length > 0 ? (currentTurnIndex * 15) : 0
  );

  const simulatedSession: CallSession = {
    id: `sim_${selectedScenarioKey.toLowerCase()}_${Date.now()}`,
    leadId: `lead_${selectedScenarioKey}`,
    customerName: scenario.customerName,
    customerPhone: scenario.customerPhone,
    status: currentTurnIndex >= allTurns.length ? 'COMPLETED' : activeTurns.length > 0 ? 'IN_PROGRESS' : 'IDLE',
    durationSeconds: currentDurationSeconds,
    transcript: activeTurns,
    discovery: evaluation.updatedDiscovery,
    intentDecision: evaluation.decision,
    midCallWhatsAppFired: isMidCallWhatsApp,
    midCallWhatsAppTimestamp: isMidCallWhatsApp ? '01:21' : undefined,
    midCallWhatsAppMessage: isMidCallWhatsApp ? generateFollowUpMessage({
      recipientPhone: scenario.customerPhone,
      discovery: evaluation.updatedDiscovery,
      isMidCall: true
    }) : undefined,
    callback: isCallbackTriggered && evaluation.callbackUtterance ? {
      id: 'cb_sim_01',
      rawUtterance: evaluation.callbackUtterance,
      scheduledTimeIST: parseNaturalLanguageTime(evaluation.callbackUtterance).scheduledTimeIST,
      scheduledTimeUTC: parseNaturalLanguageTime(evaluation.callbackUtterance).scheduledTimeUTC,
      timezone: 'Asia/Kolkata (IST)',
      contactPhone: scenario.customerPhone,
      status: 'CONFIRMED',
      notes: parseNaturalLanguageTime(evaluation.callbackUtterance).interpretedSlot
    } : undefined,
    followUpPackage: currentTurnIndex >= allTurns.length ? generateFollowUpMessage({
      recipientPhone: scenario.customerPhone,
      discovery: evaluation.updatedDiscovery,
      isMidCall: false
    }) : undefined
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < allTurns.length) {
      const nextIdx = currentTurnIndex + 1;
      setCurrentTurnIndex(nextIdx);
      const turn = allTurns[currentTurnIndex];

      // Voice TTS simulation if enabled
      if (voiceAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(turn.text);
        utter.rate = turn.speaker === 'agent' ? 1.05 : 1.0;
        utter.pitch = turn.speaker === 'agent' ? 1.1 : 0.95;
        window.speechSynthesis.speak(utter);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTurnIndex(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = speed === 'normal' ? 3200 : 1600;
      timerRef.current = setInterval(() => {
        setCurrentTurnIndex((prev) => {
          if (prev < allTurns.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, allTurns.length]);

  // Push updated session back to main state
  useEffect(() => {
    onSessionUpdated(simulatedSession);
  }, [currentTurnIndex, selectedScenarioKey]);

  return (
    <div className="space-y-6">
      {/* Top Controller Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Evaluator Testing Lab</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Scorecard Benchmark Scenarios</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Deterministic Simulation &amp; Mid-Call Verification
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step through the realistic test cases outlined in the ElevateBox specification to inspect speech recognition, Telugu/Hindi code-switching, intent score progression, and mid-call WhatsApp delivery.
            </p>
          </div>

          {/* Interactive Play Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={handleNextTurn}
              disabled={currentTurnIndex >= allTurns.length}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Next Turn</span>
            </button>

            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors cursor-pointer"
              title="Reset Scenario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-700">|</span>

            {/* Voice Audio toggle */}
            <button
              onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                voiceAudioEnabled ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-slate-800 text-slate-400'
              }`}
              title="Toggle Browser Voice Audio Synthesis"
            >
              {voiceAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono">{voiceAudioEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          {/* Scenario 1: HOT */}
          <button
            onClick={() => {
              setSelectedScenarioKey('HOT_LEAD');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedScenarioKey === 'HOT_LEAD'
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> HOT LEAD SCENARIO
              </span>
              <span className="text-[10px] font-mono text-slate-400">Scorecard #06</span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-1">Saree Boutique (Hyderabad)</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Telugu+English code-switching, 150 sarees, 10 days timeline, asks price → WhatsApp fires mid-call at 01:21!
            </p>
          </button>

          {/* Scenario 2: WARM */}
          <button
            onClick={() => {
              setSelectedScenarioKey('WARM_LEAD');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedScenarioKey === 'WARM_LEAD'
                ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> WARM LEAD SCENARIO
              </span>
              <span className="text-[10px] font-mono text-slate-400">Scorecard #07</span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-1">Organic Spices (Guntur)</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Real need, brother handles finances. Asks "repu podduna 11 gantalaki call cheyandi" → Books callback.
            </p>
          </button>

          {/* Scenario 3: COLD */}
          <button
            onClick={() => {
              setSelectedScenarioKey('COLD_LEAD');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedScenarioKey === 'COLD_LEAD'
                ? 'bg-slate-800/80 border-slate-600 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1">
                ● COLD LEAD SCENARIO
              </span>
              <span className="text-[10px] font-mono text-slate-400">Scorecard #03</span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-1">Student Inquiry</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Exploratory college final year project research, zero budget → Hard negative override, logs brochure.
            </p>
          </button>
        </div>
      </div>

      {/* Progress & Verification Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Turn Progress:</span>
          <span className="text-amber-400 font-bold text-sm">
            {currentTurnIndex} / {allTurns.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Elapsed Time:</span>
          <span className="text-white font-bold">{Math.floor(currentDurationSeconds / 60)}m {currentDurationSeconds % 60}s</span>
        </div>

        <div className="flex items-center gap-3">
          {isMidCallWhatsApp && (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-500/40">
              <Zap className="w-3.5 h-3.5" />
              <span>Mid-Call Action Triggered (Call still active!)</span>
            </div>
          )}

          {isCallbackTriggered && (
            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-950/50 px-2.5 py-1 rounded border border-blue-500/40">
              <Calendar className="w-3.5 h-3.5" />
              <span>Callback Scheduled: Tomorrow 11:00 AM IST</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Step-by-Step Transcript Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Turn-by-Turn Telephony &amp; Decision Stream
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {selectedScenarioKey === 'HOT_LEAD' ? 'Code-Switching Telugu/English' : selectedScenarioKey === 'WARM_LEAD' ? 'Telugu Natural Callback' : 'Cold Disinterest'}
          </span>
        </div>

        <div className="space-y-3">
          {allTurns.map((turn, idx) => {
            const isRevealed = idx < currentTurnIndex;
            const isAgent = turn.speaker === 'agent';
            const isCurrent = idx === currentTurnIndex - 1;

            return (
              <div
                key={turn.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  !isRevealed
                    ? 'opacity-30 border-slate-900 bg-slate-950/40'
                    : isCurrent
                    ? 'border-amber-500/50 bg-slate-950 shadow-md shadow-amber-500/5'
                    : isAgent
                    ? 'border-slate-800 bg-slate-950'
                    : 'border-blue-500/20 bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">#{idx + 1}</span>
                    <span className={isAgent ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                      {isAgent ? 'ElevateBox AI Voice' : `${scenario.customerName} (Customer)`}
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">{turn.timestamp}</span>
                  </div>

                  {isRevealed && (
                    <div className="flex items-center gap-2">
                      {idx === 5 && selectedScenarioKey === 'HOT_LEAD' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ⚡ Mid-Call WhatsApp Trigger Point
                        </span>
                      )}
                      {idx === 3 && selectedScenarioKey === 'WARM_LEAD' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          📅 Callback Parsing Point
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {turn.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
