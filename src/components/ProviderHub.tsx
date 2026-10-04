import React, { useState } from 'react';
import { 
  Key, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Database, 
  Bot, 
  Layers, 
  HelpCircle,
  FileCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Props {
  webhookUrl: string;
}

export const ProviderHub: React.FC<Props> = ({ webhookUrl }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const providers = [
    {
      id: 'omnidim',
      name: 'OmniDimension Voice AI',
      category: 'Telephony & Outbound Voice',
      portalUrl: 'https://omnidim.io',
      status: 'Ready',
      requiredVars: [
        {
          key: 'OMNIDIM_API_KEY',
          label: 'API Key',
          howToGet: 'Go to omnidim.io ➔ Click "API" on left sidebar ➔ Click "Generate API Key" or copy the existing token.',
          example: '1HoZ5qIRQcMnwh5lXDBmDAP41RbY9TyQSA-RHRBDK3o'
        },
        {
          key: 'OMNIDIM_AGENT_ID',
          label: 'Agent ID',
          howToGet: 'Go to omnidim.io/agents ➔ Click your Voice Assistant ➔ The URL or card shows the ID (e.g. 244379).',
          example: '244379'
        },
        {
          key: 'OMNIDIM_WEBHOOK_SECRET',
          label: 'Webhook Secret',
          howToGet: 'In omnidim.io/agents ➔ Select Agent ➔ Integrations ➔ Webhooks ➔ Enter your own random secret (e.g. "elevatebox_secret_2026") to verify payload signatures.',
          example: 'elevatebox_secret_2026'
        },
        {
          key: 'OMNIDIM_PHONE_NUMBER',
          label: 'Outbound Caller ID',
          howToGet: 'Go to omnidim.io/phone-numbers ➔ Buy or assign an active phone number to your agent to dial +91 8688664337.',
          example: '+14155552671'
        }
      ]
    },
    {
      id: 'whatsapp',
      name: 'Meta WhatsApp Cloud API',
      category: 'Mid-Call Messaging (Section 06)',
      portalUrl: 'https://developers.facebook.com/apps',
      status: 'Free Sandbox Available',
      requiredVars: [
        {
          key: 'WHATSAPP_API_KEY',
          label: 'Meta Access Token',
          howToGet: '1. Go to developers.facebook.com ➔ Log in with Facebook.\n2. Click "My Apps" ➔ "Create App" (Type: "Other" ➔ "Business").\n3. Add product "WhatsApp" ➔ Click "API Setup".\n4. Copy the "Temporary access token" (valid 24h) or create a Permanent System User Token in Business Settings.',
          example: 'EAAG...'
        },
        {
          key: 'WHATSAPP_PHONE_NUMBER_ID',
          label: 'Phone Number ID',
          howToGet: 'In WhatsApp ➔ "API Setup" tab ➔ Under Step 1, copy the "Phone number ID" (an 15-digit number, NOT the phone number itself).',
          example: '105938472910482'
        },
        {
          key: 'WHATSAPP_WEBHOOK_SECRET',
          label: 'Verify Token',
          howToGet: 'In WhatsApp ➔ "Configuration" ➔ Webhook ➔ Set your own verification string (e.g. "elevatebox_wa_verify").',
          example: 'elevatebox_wa_verify'
        }
      ],
      quickAlternative: 'Instant No-Code Alternative: You can also use WhatsApp Click-to-Chat (https://wa.me/918688664337) which our app has pre-wired with 1-click delivery!'
    },
    {
      id: 'neon',
      name: 'Neon Serverless PostgreSQL',
      category: 'Database & Audit Trail',
      portalUrl: 'https://console.neon.tech',
      status: 'Configured in Repo',
      requiredVars: [
        {
          key: 'DATABASE_URL',
          label: 'Connection String',
          howToGet: '1. Sign up at neon.tech (free tier).\n2. Create a project named "elevatebox".\n3. Copy the pooled PostgreSQL connection string from the dashboard.',
          example: 'postgresql://neondb_owner:npg_mFbZhIcGkV15@ep-noisy-waterfall-ayuvz1at-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'
        }
      ]
    },
    {
      id: 'llm',
      name: 'LLM Intelligence (Gemini / OpenAI)',
      category: 'Intent Classification & Extraction',
      portalUrl: 'https://aistudio.google.com',
      status: 'Active (Gemini 3.8 Flash)',
      requiredVars: [
        {
          key: 'GEMINI_API_KEY',
          label: 'Gemini API Key',
          howToGet: 'Already auto-injected in this Google AI Studio environment! If using locally, get a free key at aistudio.google.com/apikey.',
          example: 'AIzaSy...'
        },
        {
          key: 'LLM_API_KEY (OpenAI)',
          label: 'OpenAI API Key (Optional)',
          howToGet: 'If you prefer OpenAI gpt-4o over Gemini: Go to platform.openai.com/api-keys ➔ Create new secret key.',
          example: 'sk-proj-...'
        }
      ]
    },
    {
      id: 'candidate',
      name: 'Candidate Follow-Up Package Artifacts',
      category: 'Section 06 Submission Requirements',
      portalUrl: '#',
      status: 'Built In App',
      requiredVars: [
        {
          key: 'CANDIDATE_NAME',
          label: 'Your Full Name',
          howToGet: 'Your name as you want it to appear in the post-call follow-up sent to 8688664337.',
          example: 'Varma (SDE Intern Candidate)'
        },
        {
          key: 'CANDIDATE_PHONE',
          label: 'Your Mobile Number',
          howToGet: 'Your personal phone number so the ElevateBox hiring team can call you back directly.',
          example: '+91 8688664337'
        },
        {
          key: 'CANDIDATE_RESUME_URL',
          label: 'Resume URL',
          howToGet: 'Host your PDF resume on Google Drive (set to "Anyone with link can view") or upload it to your GitHub repository and use the raw link.',
          example: 'https://github.com/your-username/elevatebox-voice-sales-agent/raw/main/resume.pdf'
        },
        {
          key: 'ARCHITECTURE_IMAGE_URL',
          label: 'Architecture Diagram Image',
          howToGet: 'Use the architecture diagram from the "Section 06 Submission Package" tab in this app, or export the SVG/PNG and host on Imgur / Cloudinary / GitHub.',
          example: 'https://ais-pre-co6ulchpivqj3rp7xftvaq-515528758463.asia-southeast1.run.app/assets/architecture.png'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Service Providers Directory</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Step-by-Step Keys &amp; Credentials Guide</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Where to Get All Other Required Keys &amp; Services
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Here is the exact breakdown of where to find and generate every single environment variable from your <code className="text-slate-300 font-mono">.env</code> file, including OmniDimension, Meta WhatsApp Cloud API, Neon PostgreSQL, and your submission artifacts.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Dead Ends: Local simulation fallback available for every API</span>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-6">
        {providers.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">{p.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{p.status}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  {p.name}
                </h3>
              </div>

              {p.portalUrl !== '#' && (
                <a
                  href={p.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto font-mono"
                >
                  <span>Open {p.name.split(' ')[0]} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Variable List */}
            <div className="mt-4 space-y-4">
              {p.requiredVars.map((v) => (
                <div key={v.key} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">{v.key}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({v.label})</span>
                    </div>

                    <button
                      onClick={() => copyText(v.key, v.example)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-[11px] font-mono flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      {copiedKey === v.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === v.key ? 'Copied Sample' : 'Copy Sample'}</span>
                    </button>
                  </div>

                  <div className="mt-2 text-slate-300 leading-relaxed whitespace-pre-line text-xs font-sans">
                    <span className="font-semibold text-slate-200">Where to get it:</span> {v.howToGet}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-900/60 font-mono text-[11px] text-slate-500 truncate">
                    <span>Sample Format: </span>
                    <code className="text-slate-400">{v.example}</code>
                  </div>
                </div>
              ))}
            </div>

            {p.quickAlternative && (
              <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{p.quickAlternative}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
