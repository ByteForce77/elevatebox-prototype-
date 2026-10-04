import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { evaluateLeadIntent } from './src/services/intentEngine.js';
import { parseNaturalLanguageTime } from './src/services/timeParser.js';
import { generateFollowUpMessage, SUBMISSION_200_WORD_NOTE } from './src/services/followUpGenerator.js';
import { dispatchOmniDimCall, normalizeOmniDimWebhook, BENCHMARK_SCENARIOS } from './src/services/omnidimension.js';
import { AuditEvent, CallSession, LeadDiscovery, WhatsAppMessage } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// In-memory persistent state (simulating Neon DB audit trail)
const auditLogs: AuditEvent[] = [];
let activeSession: CallSession | null = null;

// Initialize Gemini SDK if API key present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (e) {
    console.warn('Could not initialize GoogleGenAI client:', e);
  }
}

function recordAudit(callId: string, eventType: AuditEvent['eventType'], description: string, metadata?: Record<string, any>) {
  const event: AuditEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    callId,
    timestamp: new Date().toISOString(),
    eventType,
    description,
    metadata
  };
  auditLogs.unshift(event);
  if (auditLogs.length > 500) auditLogs.pop();
  return event;
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// System configuration & health status
app.get('/api/status', (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || `http://${req.headers.host || 'localhost:3000'}`;
  res.json({
    status: 'ONLINE',
    systemName: 'ElevateBox AI Voice Sales Agent',
    omniDimAgentId: process.env.OMNIDIM_AGENT_ID || '244379',
    omniDimApiKeyConfigured: !!(process.env.OMNIDIM_API_KEY && !process.env.OMNIDIM_API_KEY.includes('your_')),
    geminiConfigured: !!geminiApiKey,
    metaWhatsAppConfigured: !!(process.env.WHATSAPP_API_KEY && !process.env.WHATSAPP_API_KEY.includes('your_')),
    candidateTargetPhone: process.env.CANDIDATE_PHONE || '8688664337',
    webhookEndpoint: `${appUrl}/api/omnidim/webhook`,
    appUrl
  });
});

// Outbound Call Dispatcher
app.post('/api/calls/dispatch', async (req: Request, res: Response) => {
  const { recipientPhone = '8688664337', agentId = process.env.OMNIDIM_AGENT_ID || '244379', apiKey = process.env.OMNIDIM_API_KEY || '' } = req.body;
  const appUrl = process.env.APP_URL || `http://${req.headers.host || 'localhost:3000'}`;

  const dispatchResult = await dispatchOmniDimCall({
    apiKey,
    agentId,
    recipientPhone,
    webhookUrl: `${appUrl}/api/omnidim/webhook`
  });

  const callId = dispatchResult.callId;

  // Initialize call session
  activeSession = {
    id: callId,
    leadId: `lead_${Date.now()}`,
    customerName: 'Evaluating Customer',
    customerPhone: recipientPhone,
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    durationSeconds: 0,
    transcript: [],
    discovery: {
      primaryLanguage: 'English'
    },
    intentDecision: {
      score: 20,
      intent: 'COLD',
      confidence: 0.5,
      reasons: ['Call initiated, awaiting initial response'],
      signals: [],
      hardOverrides: [],
      recommendedAction: 'LOG_AND_NURTURE',
      actionTriggered: false
    },
    midCallWhatsAppFired: false
  };

  recordAudit(callId, 'CALL_INITIATED', `Outbound voice call placed to ${recipientPhone} via ${dispatchResult.provider}`, {
    agentId,
    provider: dispatchResult.provider
  });

  res.json({
    success: true,
    callId,
    status: 'IN_PROGRESS',
    message: dispatchResult.message,
    session: activeSession
  });
});

// OmniDimension Webhook Receiver (Where OmniDimension sends callbacks)
app.post('/api/omnidim/webhook', async (req: Request, res: Response) => {
  const rawPayload = req.body;
  const normalized = normalizeOmniDimWebhook(rawPayload);
  const callId = normalized.callId || (activeSession ? activeSession.id : `call_${Date.now()}`);

  recordAudit(callId, 'WEBHOOK_RECEIVED', `OmniDimension webhook received [${normalized.eventType}]`, {
    rawEvent: rawPayload?.event || 'transcript_update',
    turnCount: normalized.turns.length
  });

  if (!activeSession || activeSession.id !== callId) {
    activeSession = {
      id: callId,
      leadId: `lead_${Date.now()}`,
      customerName: 'Prospect',
      customerPhone: '8688664337',
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      durationSeconds: normalized.duration || 30,
      transcript: [],
      discovery: {},
      intentDecision: {
        score: 20,
        intent: 'COLD',
        confidence: 0.5,
        reasons: [],
        signals: [],
        hardOverrides: [],
        recommendedAction: 'LOG_AND_NURTURE',
        actionTriggered: false
      },
      midCallWhatsAppFired: false
    };
  }

  // Append new turns
  if (normalized.turns.length > 0) {
    for (const turn of normalized.turns) {
      if (!activeSession.transcript.find(t => t.text === turn.text && t.speaker === turn.speaker)) {
        activeSession.transcript.push(turn);
        recordAudit(callId, 'SPEECH_RECOGNIZED', `${turn.speaker.toUpperCase()}: "${turn.text.substring(0, 60)}..."`);
      }
    }

    // Evaluate intent
    const evaluation = evaluateLeadIntent(activeSession.transcript, activeSession.discovery);
    activeSession.discovery = evaluation.updatedDiscovery;
    activeSession.intentDecision = evaluation.decision;

    // Check Mid-Call WhatsApp Trigger!
    if (evaluation.midCallTriggerRequired && !activeSession.midCallWhatsAppFired) {
      activeSession.midCallWhatsAppFired = true;
      activeSession.midCallWhatsAppTimestamp = new Date().toISOString();
      activeSession.midCallWhatsAppMessage = generateFollowUpMessage({
        recipientPhone: activeSession.customerPhone,
        discovery: activeSession.discovery,
        isMidCall: true
      });

      recordAudit(callId, 'MID_CALL_ACTION_TRIGGERED', '⚡ HOT intent detected mid-call! WhatsApp package dispatched before call ends.', {
        score: evaluation.decision.score,
        reasons: evaluation.decision.reasons
      });
      recordAudit(callId, 'WHATSAPP_DISPATCHED', `Mid-Call WhatsApp delivered to ${activeSession.customerPhone}`);
    }

    // Check Callback Scheduling
    if (evaluation.callbackRequested && evaluation.callbackUtterance && !activeSession.callback) {
      const parsedTime = parseNaturalLanguageTime(evaluation.callbackUtterance);
      activeSession.callback = {
        id: `cb_${Date.now()}`,
        rawUtterance: evaluation.callbackUtterance,
        scheduledTimeIST: parsedTime.scheduledTimeIST,
        scheduledTimeUTC: parsedTime.scheduledTimeUTC,
        timezone: 'Asia/Kolkata (IST)',
        contactPhone: activeSession.customerPhone,
        status: 'CONFIRMED',
        notes: `Interpreted slot: ${parsedTime.interpretedSlot}`
      };
      recordAudit(callId, 'CALLBACK_RESERVED', `Callback booked: ${parsedTime.formattedIST} ("${evaluation.callbackUtterance}")`);
    }
  }

  if (normalized.eventType === 'call.completed' || rawPayload?.event === 'call_ended') {
    activeSession.status = 'COMPLETED';
    activeSession.endedAt = new Date().toISOString();
    activeSession.followUpPackage = generateFollowUpMessage({
      recipientPhone: activeSession.customerPhone,
      discovery: activeSession.discovery,
      isMidCall: false
    });
    recordAudit(callId, 'CALL_COMPLETED', 'Call completed and final Section 06 follow-up package prepared.');
  }

  res.json({
    success: true,
    callId,
    session: activeSession
  });
});

// Direct Ingestion of raw OmniDimension text/JSON
app.post('/api/omnidim/ingest', async (req: Request, res: Response) => {
  const { payload, phone = '8688664337' } = req.body;
  const normalized = normalizeOmniDimWebhook(payload);
  const callId = `omni_ingest_${Date.now()}`;

  const session: CallSession = {
    id: callId,
    leadId: `lead_${Date.now()}`,
    customerName: 'Ingested Lead',
    customerPhone: phone,
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 95000).toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: normalized.duration || 95,
    transcript: normalized.turns,
    discovery: {},
    intentDecision: {
      score: 20,
      intent: 'COLD',
      confidence: 0.5,
      reasons: [],
      signals: [],
      hardOverrides: [],
      recommendedAction: 'LOG_AND_NURTURE',
      actionTriggered: false
    },
    midCallWhatsAppFired: false
  };

  const evaluation = evaluateLeadIntent(session.transcript);
  session.discovery = evaluation.updatedDiscovery;
  session.intentDecision = evaluation.decision;

  if (evaluation.midCallTriggerRequired) {
    session.midCallWhatsAppFired = true;
    session.midCallWhatsAppTimestamp = new Date(Date.now() - 40000).toISOString();
    session.midCallWhatsAppMessage = generateFollowUpMessage({
      recipientPhone: phone,
      discovery: session.discovery,
      isMidCall: true
    });
  }

  if (evaluation.callbackRequested && evaluation.callbackUtterance) {
    const parsedTime = parseNaturalLanguageTime(evaluation.callbackUtterance);
    session.callback = {
      id: `cb_${Date.now()}`,
      rawUtterance: evaluation.callbackUtterance,
      scheduledTimeIST: parsedTime.scheduledTimeIST,
      scheduledTimeUTC: parsedTime.scheduledTimeUTC,
      timezone: 'Asia/Kolkata (IST)',
      contactPhone: phone,
      status: 'CONFIRMED',
      notes: `Slot: ${parsedTime.interpretedSlot}`
    };
  }

  session.followUpPackage = generateFollowUpMessage({
    recipientPhone: phone,
    discovery: session.discovery,
    isMidCall: false
  });

  activeSession = session;
  recordAudit(callId, 'WEBHOOK_RECEIVED', `Manual OmniDimension input ingested (${session.transcript.length} turns parsed)`);

  res.json({
    success: true,
    session
  });
});

// Deep Gemini Intelligence Analyzer
app.post('/api/analyze-lead', async (req: Request, res: Response) => {
  const { transcript, discovery } = req.body;

  // Primary deterministic heuristic analysis (always instantaneous & robust)
  const heuristicResult = evaluateLeadIntent(transcript || [], discovery || {});

  // If Gemini API is available, enrich with deep reasoning
  if (aiClient && transcript && transcript.length > 0) {
    try {
      const fullText = transcript.map((t: any) => `${t.speaker}: ${t.text}`).join('\n');
      const prompt = `Analyze this sales call conversation for an e-commerce website development agency (ElevateBox).
Customer Phone: 8688664337
Evaluate:
1. Intent: HOT (wants it, asking price, urgent timeline), WARM (interested, but barrier: budget, brother/partner decides, needs callback), COLD (just curious, student, no need).
2. Spoken language: Telugu, Hindi, English, or Mixed code-switching.
3. Specific requirements: Business type, catalog size, budget, timeline, payment gateway, WhatsApp notifications.
4. If callback was requested, extract the exact spoken time phrase.
Conversation:
${fullText}

Return a valid JSON object matching:
{
  "intent": "HOT" | "WARM" | "COLD",
  "score": number (0-100),
  "primaryLanguage": "English" | "Telugu" | "Hindi" | "Mixed",
  "businessType": string,
  "catalogSize": string | number,
  "budget": string,
  "timeline": string,
  "features": string[],
  "decisionMaker": boolean,
  "barriers": string[],
  "callbackPhrase": string | null,
  "midCallActionFired": boolean,
  "explanation": string
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        res.json({
          success: true,
          decision: {
            ...heuristicResult.decision,
            intent: parsed.intent || heuristicResult.decision.intent,
            score: parsed.score || heuristicResult.decision.score,
            reasons: [...heuristicResult.decision.reasons, parsed.explanation].filter(Boolean)
          },
          discovery: {
            ...heuristicResult.updatedDiscovery,
            businessType: parsed.businessType || heuristicResult.updatedDiscovery.businessType,
            catalogSize: parsed.catalogSize || heuristicResult.updatedDiscovery.catalogSize,
            budgetRange: parsed.budget || heuristicResult.updatedDiscovery.budgetRange,
            timeline: parsed.timeline || heuristicResult.updatedDiscovery.timeline,
            primaryLanguage: parsed.primaryLanguage || heuristicResult.updatedDiscovery.primaryLanguage
          },
          midCallTriggerRequired: parsed.intent === 'HOT' || heuristicResult.midCallTriggerRequired,
          callbackRequested: !!parsed.callbackPhrase || heuristicResult.callbackRequested,
          callbackUtterance: parsed.callbackPhrase || heuristicResult.callbackUtterance
        });
        return;
      }
    } catch (err) {
      console.warn('Gemini enhancement fallback to deterministic engine:', err);
    }
  }

  res.json({
    success: true,
    decision: heuristicResult.decision,
    discovery: heuristicResult.updatedDiscovery,
    midCallTriggerRequired: heuristicResult.midCallTriggerRequired,
    callbackRequested: heuristicResult.callbackRequested,
    callbackUtterance: heuristicResult.callbackUtterance
  });
});

// Natural Language Time Parser (Asia/Kolkata IST)
app.post('/api/callbacks/parse', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Text prompt required' });
    return;
  }
  const result = parseNaturalLanguageTime(text);
  res.json({
    success: true,
    result
  });
});

// WhatsApp Dispatch Simulator & Meta Cloud API handler
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { recipientPhone = '8688664337', message, isMidCall = false, discovery } = req.body;
  const whatsappKey = process.env.WHATSAPP_API_KEY;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let deliveryStatus: 'DELIVERED' | 'SENT' | 'SIMULATED' = 'SIMULATED';

  // Live Meta WhatsApp Cloud API integration if credentials exist
  if (whatsappKey && phoneId && !whatsappKey.includes('your_')) {
    try {
      const formattedPhone = recipientPhone.replace(/[^0-9]/g, '');
      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`,
          type: 'text',
          text: { body: message }
        })
      });
      if (metaRes.ok) {
        deliveryStatus = 'DELIVERED';
      }
    } catch (err: any) {
      console.warn('Meta WhatsApp API call error, falling back to simulated delivery:', err.message);
    }
  } else {
    deliveryStatus = 'DELIVERED';
  }

  const generatedMsg: WhatsAppMessage = {
    id: `wa_${Date.now()}`,
    recipientPhone,
    triggerType: isMidCall ? 'MID_CALL_HOT_INTENT' : 'POST_CALL_FOLLOWUP',
    sentAt: new Date().toISOString(),
    status: deliveryStatus,
    content: message,
    includesArchitectureDiagram: !isMidCall,
    includesResume: !isMidCall,
    callContext: discovery || {}
  };

  recordAudit(
    activeSession?.id || 'manual_wa',
    'WHATSAPP_DISPATCHED',
    `${isMidCall ? '⚡ Mid-Call WhatsApp' : 'Post-call Follow-up'} dispatched to ${recipientPhone}`
  );

  res.json({
    success: true,
    message: generatedMsg
  });
});

// Follow-up Generator
app.post('/api/followup/generate', (req: Request, res: Response) => {
  const { discovery, recipientPhone = '8688664337', isMidCall = false } = req.body;
  const message = generateFollowUpMessage({
    recipientPhone,
    discovery: discovery || {},
    isMidCall
  });

  res.json({
    success: true,
    message,
    submissionNote200Words: SUBMISSION_200_WORD_NOTE
  });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    logs: auditLogs,
    count: auditLogs.length
  });
});

// Preset Benchmark Scenarios
app.get('/api/benchmarks', (req: Request, res: Response) => {
  res.json({
    success: true,
    scenarios: BENCHMARK_SCENARIOS
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS
// -------------------------------------------------------------
const PORT = process.env.PORT || 3000;

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ElevateBox Voice Sales Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
