export type IntentType = 'HOT' | 'WARM' | 'COLD';

export type CallStatus = 'IDLE' | 'DIALING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface TranscriptTurn {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: string;
  detectedLanguage?: 'English' | 'Telugu' | 'Hindi' | 'Mixed';
  detectedIntent?: IntentType;
  confidence?: number;
  intentSignals?: string[];
}

export interface LeadDiscovery {
  businessType?: string;
  catalogSize?: string | number;
  budgetRange?: string;
  timeline?: string;
  keyFeatures?: string[];
  decisionMaker?: boolean;
  decisionMakerRole?: string;
  primaryLanguage?: 'English' | 'Telugu' | 'Hindi' | 'Mixed';
  barriers?: string[];
}

export interface IntentDecision {
  score: number; // 0 to 100
  intent: IntentType;
  confidence: number;
  reasons: string[];
  signals: string[];
  hardOverrides: string[];
  recommendedAction: 'FIRE_MID_CALL_WHATSAPP' | 'SCHEDULE_CALLBACK' | 'LOG_AND_NURTURE';
  actionTriggered: boolean;
}

export interface CallbackBooking {
  id: string;
  rawUtterance: string;
  scheduledTimeIST: string;
  scheduledTimeUTC: string;
  timezone: string;
  contactPhone: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  notes?: string;
}

export interface WhatsAppMessage {
  id: string;
  recipientPhone: string;
  triggerType: 'MID_CALL_HOT_INTENT' | 'POST_CALL_FOLLOWUP' | 'WARM_CALLBACK_CONFIRMATION' | 'COLD_BROCHURE';
  sentAt: string;
  status: 'DELIVERED' | 'SENT' | 'SIMULATED';
  content: string;
  includesArchitectureDiagram: boolean;
  includesResume: boolean;
  callContext: {
    businessType?: string;
    productCount?: string | number;
    budget?: string;
    timeline?: string;
    features?: string[];
  };
}

export interface CallSession {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  transcript: TranscriptTurn[];
  discovery: LeadDiscovery;
  intentDecision: IntentDecision;
  midCallWhatsAppFired: boolean;
  midCallWhatsAppTimestamp?: string;
  midCallWhatsAppMessage?: WhatsAppMessage;
  callback?: CallbackBooking;
  followUpPackage?: WhatsAppMessage;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  callId: string;
  timestamp: string;
  eventType: 
    | 'CALL_INITIATED' 
    | 'CALL_CONNECTED' 
    | 'SPEECH_RECOGNIZED' 
    | 'DISCOVERY_UPDATED' 
    | 'INTENT_REEVALUATED' 
    | 'MID_CALL_ACTION_TRIGGERED' 
    | 'WHATSAPP_DISPATCHED' 
    | 'CALLBACK_RESERVED' 
    | 'CALL_COMPLETED' 
    | 'WEBHOOK_RECEIVED';
  description: string;
  metadata?: Record<string, any>;
}

export interface OmniDimConfig {
  apiKey: string;
  agentId: string;
  webhookUrl: string;
  webhookSecret: string;
  targetPhone: string;
}
