import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall, 
  Download,
  Share2
} from 'lucide-react';
import { CallSession, LeadDiscovery } from '../types';
import { generateFollowUpMessage, SUBMISSION_200_WORD_NOTE } from '../services/followUpGenerator';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface Props {
  session: CallSession | null;
  onSendWhatsApp: (msg: string) => void;
}

export const SubmissionPackage: React.FC<Props> = ({ session, onSendWhatsApp }) => {
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [candidatePhone, setCandidatePhone] = useState('+91 8688664337');
  const [candidateName, setCandidateName] = useState('ElevateBox SDE Intern Candidate');
  const [resumeUrl, setResumeUrl] = useState('https://github.com/varma/elevatebox-voice-sales-agent');

  const defaultDiscovery: LeadDiscovery = {
    businessType: 'Ethnic Saree & Lehengas Boutique (Banjara Hills)',
    catalogSize: 150,
    budgetRange: '₹40,000 - ₹50,000',
    timeline: 'Immediate 10 days (Wedding Season)',
    keyFeatures: ['Instant UPI Checkout (PhonePe/Razorpay)', 'Automated WhatsApp Order Alerts', 'Telugu Language Support']
  };

  const currentDiscovery = session?.discovery.businessType ? session.discovery : defaultDiscovery;

  const followUpMessage = generateFollowUpMessage({
    recipientPhone: '8688664337',
    candidateName,
    candidatePhone,
    discovery: currentDiscovery,
    resumeUrl,
    isMidCall: false
  });

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const waLink = `https://wa.me/918688664337?text=${encodeURIComponent(followUpMessage.content)}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">ElevateBox SDE Intern Assignment</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Section 06 Specification</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Required Submission Package (Send to 8688664337)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When the call ends, the message reaching the hiring team must contain the authentic call context, conversational framing, candidate direct phone, and architecture flow diagram.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp to 8688664337</span>
            </a>
          </div>
        </div>

        {/* 4 Scorecard Checklist Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1. Call Context (Budget, Timeline, SKU)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2. Human Conversational Framing</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>3. Direct Mobile Phone Number</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>4. End-to-End Architecture Diagram</span>
          </div>
        </div>
      </div>

      {/* Main Grid: WhatsApp Preview (Left) + 200 Word Note & Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: WhatsApp Message Bubble (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Rendered WhatsApp Message
              </h3>
              <button
                onClick={() => copyToClipboard(followUpMessage.content, setCopiedMsg)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors flex items-center gap-1 font-mono"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* WhatsApp Phone Mockup Container */}
            <div className="mt-4 bg-[#0b141a] rounded-xl p-4 border border-slate-800 font-sans shadow-inner">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-slate-300 text-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  EB
                </div>
                <div>
                  <div className="font-semibold text-slate-100">ElevateBox Assistant</div>
                  <div className="text-[10px] text-emerald-400">Online · Business Account</div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="mt-4 max-w-[92%] bg-[#005c4b] text-slate-100 rounded-lg p-3.5 text-xs shadow-md whitespace-pre-wrap leading-relaxed relative">
                {followUpMessage.content}
                <div className="text-[10px] text-slate-300 text-right mt-2 flex items-center justify-end gap-1 font-mono">
                  <span>Just now</span>
                  <span className="text-teal-200">✓✓</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span>Target: +91 8688664337</span>
              <span>Tone: Natural, personalized discovery follow-up</span>
            </div>
          </div>
        </div>

        {/* Right Column: 200-Word Note & Submission Credentials (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 200-Word Note Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Short Note (&lt; 200 Words)
              </h3>
              <button
                onClick={() => copyToClipboard(SUBMISSION_200_WORD_NOTE, setCopiedNote)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors flex items-center gap-1 font-mono"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? 'Copied' : 'Copy Note'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Required by ElevateBox assignment: <em>"A short note, under 200 words, on what works, what does not, and what you would build next."</em>
            </p>

            <pre className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
              {SUBMISSION_200_WORD_NOTE}
            </pre>
          </div>

          {/* Candidate Profile Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-xs space-y-3">
            <h4 className="text-sm font-bold text-white">Candidate Details for Follow-up</h4>
            
            <div>
              <label className="text-slate-400 font-mono text-[11px] block">Candidate Phone (Visible in message):</label>
              <input
                type="text"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono text-[11px] block">Repository / Resume Link:</label>
              <input
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Architecture Diagram Component Section */}
      <div className="mt-8">
        <ArchitectureDiagram />
      </div>
    </div>
  );
};
