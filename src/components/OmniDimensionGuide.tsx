import React, { useState } from 'react';
import { 
  Terminal, 
  HelpCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Code2, 
  ArrowRight, 
  Layers, 
  Radio, 
  FileText,
  Workflow
} from 'lucide-react';

interface Props {
  webhookUrl: string;
  onIngestSuccess: (data: any) => void;
}

export const OmniDimensionGuide: React.FC<Props> = ({ webhookUrl, onIngestSuccess }) => {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [ingestInput, setIngestInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'guidelines' | 'playground' | 'agent_prompt'>('guidelines');

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleOmniDimPayload = JSON.stringify({
    event: "call.completed",
    call_id: "omni_call_8688664337_01",
    agent_id: "244379",
    phone_number: "+91 8688664337",
    duration_seconds: 96,
    transcript: [
      {
        speaker: "agent",
        text: "Namaste! I am calling from ElevateBox. We build modern e-commerce websites for regional retail stores and boutiques. Are you looking to take your products online?",
        timestamp: "00:08"
      },
      {
        speaker: "customer",
        text: "Avunu, memu Hyderabad lo handloom sarees sell chestam. Around 150 sarees inventory undi. We urgently need a website before next week festival.",
        timestamp: "00:26"
      },
      {
        speaker: "agent",
        text: "That is fantastic! We can integrate instant UPI payment gateways and automated WhatsApp order alerts. What is your estimated budget?",
        timestamp: "00:41"
      },
      {
        speaker: "customer",
        text: "Budget around 40k to 50k undi. Can you send package pricing on WhatsApp right now? I want to start in 10 days.",
        timestamp: "01:02"
      },
      {
        speaker: "agent",
        text: "I am sending the proposal and package directly to your WhatsApp while we speak! You can review it instantly.",
        timestamp: "01:15"
      }
    ]
  }, null, 2);

  const sampleVoiceAgentPrompt = 
`# ElevateBox Autonomous Voice Sales Agent Prompt

You are Ananya, a friendly, professional sales engineer calling from ElevateBox (ElevateScale Technologies, Banjara Hills, Hyderabad).
Your goal is to pitch e-commerce website development to business owners, discover their requirements, and qualify their intent.

Target Number: 8688664337

LANGUAGE RULES:
- If the customer speaks Telugu, respond in fluent Telugu or code-switch naturally ("Avunu, memu fast ga launch chestam").
- If the customer speaks Hindi, respond in polite Hindi.
- If the customer speaks English, respond in clear English.
- Code-switching between Telugu/Hindi and English eCommerce terms (like "website", "payment gateway", "catalog") is natural and encouraged.

DISCOVERY FLOW (Keep it a natural two-way chat, never an interrogation checklist):
1. Pitch ElevateBox: Help their business sell online with custom storefronts.
2. What they sell: Saree, boutique, spices, electronics, etc.
3. Catalog size: How many products or designs initially?
4. Target timeline: When are they hoping to launch?
5. Budget expectation: Any ballpark figure in mind?
6. Must-have features: Razorpay/UPI checkout, automated WhatsApp order alerts, regional language support.

INTENT ACTIONS:
- If they ask for pricing, express urgency (e.g. "within 10 days"), or ask "send me details on WhatsApp":
  -> Trigger the tool "fire_midcall_whatsapp" immediately BEFORE hanging up!
- If they are interested but ask to call back (e.g. "repu podduna 11 gantalaki call cheyandi" or "brother handles finances"):
  -> Trigger the tool "schedule_callback" with their exact spoken time phrase.
- If they are a student or not interested:
  -> Politely conclude and offer to send a portfolio brochure.`;

  const handleIngest = async () => {
    if (!ingestInput.trim()) {
      setErrorMsg('Please paste an OmniDimension JSON payload or text transcript.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(ingestInput);
      } catch {
        // Fallback: treated as raw text transcript
        parsedPayload = { rawTranscript: ingestInput };
      }

      const res = await fetch('/api/omnidim/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: parsedPayload,
          phone: '8688664337'
        })
      });

      const data = await res.json();
      if (data.success && data.session) {
        onIngestSuccess(data.session);
      } else {
        setErrorMsg('Failed to process payload.');
      }
    } catch (err: any) {
      setErrorMsg(`Error during ingestion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the integration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">OmniDimension Telephony Integration</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Agent ID: 244379</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              How OmniDimension Telephony Outputs Connect to ElevateBox
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Solve the exact problem of capturing voice turns from <a href="https://omnidim.io" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1">omnidim.io <ExternalLink className="w-3 h-3" /></a>, transforming them into live structured discovery, intent classification, and mid-call WhatsApp delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="truncate max-w-[260px] text-slate-300">
              {webhookUrl}
            </div>
            <button
              onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors flex items-center gap-1"
              title="Copy Webhook URL"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>1. Where to Get OmniDimension Output</span>
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Live Ingest &amp; Transform Playground</span>
          </button>
          <button
            onClick={() => setActiveTab('agent_prompt')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'agent_prompt'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. OmniDimension Voice Agent Prompt</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Method 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono text-xs text-amber-400 font-bold">1</span>
                <h3 className="text-sm font-semibold text-white">Live Webhook in omnidim.io</h3>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Configure OmniDimension to stream live conversation events directly to this application's webhook listener.
              </p>
              
              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500 text-[11px]">// Where in OmniDimension Dashboard:</div>
                <div className="text-amber-300">1. Go to omnidim.io/agents</div>
                <div>2. Select Agent #244379</div>
                <div>3. Open "Integrations / Webhooks"</div>
                <div>4. Paste this Webhook URL:</div>
                <div className="text-emerald-400 break-all bg-slate-900 p-1.5 rounded">{webhookUrl}</div>
                <div className="text-slate-400">Events: transcript.turn, tool_call, call.completed</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Latency: Sub-500ms</span>
              <span className="text-emerald-400 font-mono">Recommended</span>
            </div>
          </div>

          {/* Method 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-mono text-xs text-blue-400 font-bold">2</span>
                <h3 className="text-sm font-semibold text-white">Call Logs Export on Site</h3>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                If the call already took place on OmniDimension, you can grab the JSON transcript from their call logs.
              </p>

              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500 text-[11px]">// Where in OmniDimension Dashboard:</div>
                <div className="text-blue-300">1. Open omnidim.io/call-logs</div>
                <div>2. Click on the call to +91 8688664337</div>
                <div>3. Click "View JSON Transcript"</div>
                <div>4. Copy the JSON object</div>
                <div>5. Paste into our Ingest Playground (Tab 2)</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Post-call Audit</span>
              <span className="text-blue-400 font-mono">Zero Setup</span>
            </div>
          </div>

          {/* Method 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-xs text-emerald-400 font-bold">3</span>
                <h3 className="text-sm font-semibold text-white">Mid-Call Function Call</h3>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                How to trigger the WhatsApp action <em>during</em> the call while the customer is still talking (Assignment Requirement #6).
              </p>

              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500 text-[11px]">// Configure in OmniDimension Tools:</div>
                <div className="text-emerald-300">Tool Name: fire_midcall_whatsapp</div>
                <div>Triggered when: Customer asks pricing, urgent launch, or "send details"</div>
                <div className="text-slate-400">Webhook Action: POST /api/whatsapp/send</div>
                <div className="text-amber-300">Does NOT hang up the phone!</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Section 03 Spec</span>
              <span className="text-amber-400 font-mono">Mid-Call Action</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Ingest Playground */}
      {activeTab === 'playground' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Raw OmniDimension Payload Ingester &amp; Transformer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste any JSON payload or raw transcript from omnidim.io to immediately extract discovery, score intent, and trigger mid-call WhatsApp.
              </p>
            </div>
            <button
              onClick={() => setIngestInput(sampleOmniDimPayload)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample OmniDimension Output</span>
            </button>
          </div>

          <div className="mt-4">
            <textarea
              value={ingestInput}
              onChange={(e) => setIngestInput(e.target.value)}
              placeholder="Paste OmniDimension JSON or text transcript here..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {errorMsg && (
            <div className="mt-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg font-mono">
              {errorMsg}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Supports: JSON with "transcript" array, "text" webhook turn, or plain text "Agent: ... Customer: ..."
            </span>
            <button
              onClick={handleIngest}
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Transforming with Gemini...</span>
                </>
              ) : (
                <>
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Transform OmniDimension Output &amp; Open Console</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: OmniDimension Voice Agent Prompt */}
      {activeTab === 'agent_prompt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Optimized System Prompt for OmniDimension Voice Agent (#244379)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste this into your OmniDimension Agent System Prompt field (<code className="text-slate-300 font-mono">omnidim.io/agents</code>) to handle Telugu, Hindi, English, and mid-call triggers automatically.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(sampleVoiceAgentPrompt, setCopiedPrompt)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 font-mono"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied Prompt' : 'Copy System Prompt'}</span>
            </button>
          </div>

          <pre className="mt-4 p-4 bg-slate-950 border border-slate-800/90 rounded-lg text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[380px]">
            {sampleVoiceAgentPrompt}
          </pre>
        </div>
      )}
    </div>
  );
};
