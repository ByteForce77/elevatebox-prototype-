import React from 'react';
import { 
  PhoneCall, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Terminal, 
  BookOpen, 
  CheckCircle2,
  FileText,
  Activity,
  Key
} from 'lucide-react';

interface Props {
  activeTab: 'console' | 'omnidim' | 'simulation' | 'submission' | 'audit' | 'providers';
  setActiveTab: (tab: 'console' | 'omnidim' | 'simulation' | 'submission' | 'audit' | 'providers') => void;
  isCallActive: boolean;
  midCallWhatsAppFired: boolean;
  onQuickDial: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isCallActive,
  midCallWhatsAppFired,
  onQuickDial
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-black text-lg tracking-tight">
              EB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  elevatebox
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    Voice Agent v1.0
                  </span>
                </h1>
                <span className="text-slate-600">|</span>
                <span className="text-xs text-slate-400 font-normal">SDE Intern Assignment Hub</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Autonomous Outbound Voice · OmniDimension Telephony · Mid-Call WhatsApp · Trilingual (TE/HI/EN)
              </p>
            </div>
          </div>

          {/* Telephony & Target Status Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Target Phone Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300">
              <span className="text-slate-500 text-[11px]">TARGET:</span>
              <span className="text-amber-400 font-semibold tracking-wide">+91 8688664337</span>
            </div>

            {/* OmniDimension Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>OmniDimension #244379</span>
            </div>

            {/* Mid-Call Indicator */}
            {midCallWhatsAppFired && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-400 font-mono animate-pulse">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Mid-Call WhatsApp Dispatched</span>
              </div>
            )}

            {/* Quick Dial Button */}
            {!isCallActive ? (
              <button
                onClick={onQuickDial}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
                <span>Call 8688664337</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Live Call Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-4 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'console'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Call Console &amp; Dialer</span>
          </button>

          <button
            onClick={() => setActiveTab('omnidim')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'omnidim'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>OmniDimension Integration &amp; Ingest</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evaluator Simulation Lab (3 Scenarios)</span>
          </button>

          <button
            onClick={() => setActiveTab('submission')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'submission'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Section 06 Submission Package</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Immutable Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'providers'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Keys &amp; Providers Directory</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
